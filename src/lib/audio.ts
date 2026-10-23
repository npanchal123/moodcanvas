import type { Locale } from '../i18n';
import { LOCALES } from '../i18n';
import type { Segment } from '../practices';
import { audioFile, audioKey, estimateSpeechSeconds } from './session';

/**
 * Sound for guided practices: the narrator's voice and a soft ocean-like background.
 * - Recorded voice: natural-voice MP3s made by scripts/generate-audio.ts and listed in public/audio/manifest.json.
 * - Device voice: the browser's built-in speech, used until recordings exist for every step.
 * - Silent: captions only, paced by estimated reading time.
 * Everything plays through one AudioContext, so pausing it pauses voice and background together.
 */

export type VoiceKind = 'recorded' | 'device' | 'silent';

const DEVICE_RATE = 0.9;

let audioContext: AudioContext | null = null;
function context(): AudioContext {
  audioContext ??= new AudioContext();
  return audioContext;
}

export function deviceVoiceAvailable(): boolean {
  return 'speechSynthesis' in window;
}

/**
 * Browsers only allow sound that starts from a tap or click. Call this from the click that begins a practice,
 * before any await.
 */
export function unlockAudio(): void {
  void context().resume();
  if (deviceVoiceAvailable()) speechSynthesis.speak(new SpeechSynthesisUtterance(''));
}

let manifest: Promise<Record<string, string>> | null = null;
function loadManifest(): Promise<Record<string, string>> {
  manifest ??= fetch(`${import.meta.env.BASE_URL}audio/manifest.json`)
    .then((res) => (res.ok ? (res.json() as Promise<Record<string, string>>) : {}))
    .catch(() => ({}));
  return manifest;
}

export interface Narrator {
  kind: VoiceKind;
  /** True when a voice was wanted but the device has none for this language, so captions are used instead. */
  missingVoice?: boolean;
  /** Seconds each step takes to say. */
  durations: number[];
  /** Resolves when the step has been said, or with 'interrupted' if pause() cut it off and it should be said again. */
  say(index: number): Promise<'done' | 'interrupted'>;
  pause(): void;
  resume(): void;
  stop(): void;
}

/** Natural-voice recordings for every step, or null if any step has no up-to-date recording. */
async function recordedNarrator(locale: Locale, practiceId: string, segments: Segment[]): Promise<Narrator | null> {
  const files = await loadManifest();
  const paths = segments.map((s) => audioFile(locale, practiceId, s));
  if (!segments.every((s, i) => files[audioKey(locale, practiceId, s.id)] === paths[i])) return null;
  try {
    const ctx = context();
    const buffers = await Promise.all(
      paths.map(async (path) => {
        const res = await fetch(`${import.meta.env.BASE_URL}audio/${path}`);
        if (!res.ok) throw new Error(`audio ${res.status}`);
        return ctx.decodeAudioData(await res.arrayBuffer());
      }),
    );
    let playing: AudioBufferSourceNode | null = null;
    return {
      kind: 'recorded',
      durations: buffers.map((b) => b.duration),
      say: (index) =>
        new Promise((resolve) => {
          const source = ctx.createBufferSource();
          source.buffer = buffers[index];
          source.connect(ctx.destination);
          source.onended = () => resolve('done');
          playing = source;
          source.start();
        }),
      // Suspending the shared context pauses the recording mid-word; it carries on from there.
      pause: () => void ctx.suspend(),
      resume: () => void ctx.resume(),
      stop: () => {
        playing?.stop();
        playing = null;
      },
    };
  } catch {
    return null; // Offline before the files were cached, or a bad file: fall back to the device voice.
  }
}

/** The device's voices for a language. Browsers load the list late, so wait briefly for it. */
async function voicesFor(lang: string): Promise<SpeechSynthesisVoice[]> {
  // Voice tags vary in case and separator ("zh-CN", "zh_cn").
  const tag = (s: string) => s.toLowerCase().replace('_', '-');
  const matching = () => speechSynthesis.getVoices().filter((v) => tag(v.lang).startsWith(tag(lang)));
  if (speechSynthesis.getVoices().length === 0) {
    await new Promise<void>((resolve) => {
      speechSynthesis.addEventListener('voiceschanged', () => resolve(), { once: true });
      window.setTimeout(resolve, 1500);
    });
  }
  return matching();
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  // Prefer the more natural-sounding voices some systems ship ("Natural" on Windows/Edge, "Enhanced" on Apple).
  return voices.find((v) => /natural|enhanced|premium/i.test(v.name)) ?? voices.find((v) => v.localService) ?? voices[0];
}

function deviceNarrator(locale: Locale, segments: Segment[], voice: SpeechSynthesisVoice | undefined, rate = 1): Narrator {
  const lang = LOCALES[locale].htmlLang;
  let interrupted = false;
  return {
    kind: 'device',
    durations: segments.map((s) => estimateSpeechSeconds(s.text, DEVICE_RATE * rate)),
    say: (index) =>
      new Promise((resolve) => {
        interrupted = false;
        // One utterance per sentence: some browsers cut long utterances off part-way.
        const sentences = segments[index].text.match(/[^.!?…।。！？؟]+[.!?…।。！？؟]*\s*/g) ?? [segments[index].text];
        sentences.forEach((sentence, i) => {
          const utterance = new SpeechSynthesisUtterance(sentence.trim());
          utterance.lang = lang;
          utterance.rate = DEVICE_RATE * rate;
          if (voice) utterance.voice = voice;
          if (i === sentences.length - 1) {
            utterance.onend = () => resolve(interrupted ? 'interrupted' : 'done');
            utterance.onerror = () => resolve(interrupted ? 'interrupted' : 'done');
          }
          speechSynthesis.speak(utterance);
        });
      }),
    // speechSynthesis.pause() is unreliable on phones, so pausing cancels the step and resuming says it again.
    pause: () => {
      interrupted = true;
      speechSynthesis.cancel();
    },
    resume: () => {},
    stop: () => {
      interrupted = true;
      speechSynthesis.cancel();
    },
  };
}

function silentNarrator(segments: Segment[], rate = 1): Narrator {
  return {
    kind: 'silent',
    durations: segments.map((s) => estimateSpeechSeconds(s.text, rate)),
    say: () => Promise.resolve('done'),
    pause: () => {},
    resume: () => {},
    stop: () => {},
  };
}

export async function createNarrator(
  locale: Locale,
  practiceId: string,
  segments: Segment[],
  voice: boolean,
  /** 1 is the normal pace; 0.8 slower, 1.15 faster. Recordings play at their own pace. */
  rate = 1,
): Promise<Narrator> {
  if (!voice) return silentNarrator(segments, rate);
  const recorded = await recordedNarrator(locale, practiceId, segments);
  if (recorded) return recorded;
  if (!deviceVoiceAvailable()) return silentNarrator(segments, rate);
  const voices = await voicesFor(LOCALES[locale].htmlLang);
  // Without a voice for the language, the browser would read the words with the wrong accent or not at all.
  if (voices.length === 0) return { ...silentNarrator(segments, rate), missingVoice: true };
  return deviceNarrator(locale, segments, pickVoice(voices), rate);
}

/** A quiet, slowly swelling wash of filtered noise, like distant waves. Returns a function that fades it out. */
export function startAmbient(): () => void {
  const ctx = context();
  const seconds = 8;
  const buffer = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      // Brown noise: each sample drifts a little from the last, which sounds soft and low.
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
    // Fade the loop's ends into each other so it repeats without a click.
    const fade = Math.floor(ctx.sampleRate * 0.5);
    for (let i = 0; i < fade; i++) {
      const k = i / fade;
      data[i] = data[i] * k + data[data.length - fade + i] * (1 - k);
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.loopEnd = seconds - 0.5;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.gain.setTargetAtTime(0.05, ctx.currentTime, 1.5);
  // A slow swell, about one "wave" every 12 seconds.
  const swell = ctx.createOscillator();
  swell.frequency.value = 1 / 12;
  const swellDepth = ctx.createGain();
  swellDepth.gain.value = 0.02;
  swell.connect(swellDepth).connect(gain.gain);

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
  swell.start();

  return () => {
    gain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    window.setTimeout(() => {
      source.stop();
      swell.stop();
      gain.disconnect();
    }, 2000);
  };
}

export function pauseAudio(): void {
  if (audioContext) void audioContext.suspend();
}

export function resumeAudio(): void {
  if (audioContext) void audioContext.resume();
}
