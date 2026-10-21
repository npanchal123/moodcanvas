import * as Slider from '@radix-ui/react-slider';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { createNarrator, deviceVoiceAvailable, pauseAudio, resumeAudio, startAmbient, unlockAudio, type Narrator } from '../lib/audio';
import { logPractice } from '../lib/db';
import { usePersistentFlag, usePersistentState } from '../lib/hooks';
import { formatClock, planPauses, segmentsFor } from '../lib/session';
import type { PracticeBefore, PracticeLog } from '../lib/types';
import { LENGTHS, PRACTICE_CONTENT, PRACTICE_META, type Minutes, type PracticeId } from '../practices';
import { btnGhost, btnPrimary, btnSecondary, card, checkbox, toggle } from './ui';

interface Props {
  practiceId: PracticeId;
  /** The check-in this practice was started from, if any, for a before/after comparison. */
  before?: PracticeBefore;
  animate: boolean;
  onBack: () => void;
  onCheckIn: () => void;
}

type Stage = 'ready' | 'playing' | 'after';

const isMinutes = (value: unknown): value is Minutes => LENGTHS.includes(value as Minutes);

/** Default export so App can load it lazily. */
export default function PracticeSession({ practiceId, before, animate, onBack, onCheckIn }: Props) {
  const { t, locale } = useI18n();
  const script = PRACTICE_CONTENT[locale].practices[practiceId];
  const meta = PRACTICE_META[practiceId];
  const [preferred, setPreferred] = usePersistentState<Minutes>('moodcanvas.practiceMinutes', 3, isMinutes);
  const minutes = meta.lengths.includes(preferred) ? preferred : meta.lengths[0];
  const [voice, setVoice] = usePersistentFlag('moodcanvas.practiceVoice', true);
  const [sound, setSound] = usePersistentFlag('moodcanvas.practiceSound', true);
  const [stage, setStage] = useState<Stage>('ready');
  const [log, setLog] = useState<PracticeLog | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Each stage starts with its heading focused, so keyboard and screen reader users know where they are.
  useEffect(() => {
    headingRef.current?.focus();
  }, [stage]);

  function begin() {
    unlockAudio(); // Must run inside the click, before anything async.
    setStage('playing');
  }

  function finish(completed: boolean, startedAt: string) {
    const entry: PracticeLog = { id: crypto.randomUUID(), practiceId, minutes, startedAt, completed, before };
    setLog(entry);
    void logPractice(entry);
    setStage('after');
  }

  const title = (
    <>
      <span aria-hidden="true">{meta.icon} </span>
      {script.title}
    </>
  );

  if (stage === 'playing') {
    return (
      <Player
        practiceId={practiceId}
        minutes={minutes}
        voice={voice}
        sound={sound}
        animate={animate}
        title={title}
        headingRef={headingRef}
        onFinish={finish}
      />
    );
  }

  if (stage === 'after' && log) {
    return <After log={log} title={title} headingRef={headingRef} onBack={onBack} onCheckIn={onCheckIn} />;
  }

  return (
    <section aria-labelledby="session-heading" className={`${card} mx-auto flex max-w-2xl flex-col gap-5`}>
      <div>
        <h2 id="session-heading" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold">
          {title}
        </h2>
        <p className="mt-1">{script.summary}</p>
      </div>

      {meta.lengths.length > 1 && (
        <div role="group" aria-labelledby="length-label">
          <p id="length-label" className="mb-2 font-medium">
            {t.practice.lengthLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {meta.lengths.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={minutes === m}
                onClick={() => setPreferred(m)}
                className={toggle(minutes === m)}
              >
                {t.practice.minutes(m)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={voice}
            onChange={(e) => setVoice(e.target.checked)}
            className={checkbox}
            aria-describedby={deviceVoiceAvailable() ? undefined : 'no-voice'}
          />
          {t.practice.voiceLabel}
        </label>
        {!deviceVoiceAvailable() && (
          <p id="no-voice" className="text-sm text-(--muted)">
            {t.practice.noVoice}
          </p>
        )}
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} className={checkbox} />
          {t.practice.soundLabel}
        </label>
      </div>

      <p className="rounded-xl bg-(--surface-alt) p-4 text-sm">{t.practice.tip}</p>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={begin} className={btnPrimary}>
          {t.practice.begin}
        </button>
        <button type="button" onClick={onBack} className={btnGhost}>
          {t.practice.back}
        </button>
      </div>
    </section>
  );
}

interface Run {
  paused: boolean;
  stopped: boolean;
  wake: (() => void) | null;
}

async function whilePaused(run: Run) {
  while (run.paused && !run.stopped) await new Promise<void>((resolve) => (run.wake = resolve));
}

/** Waits `seconds` of unpaused time. */
async function sleep(run: Run, seconds: number) {
  let left = seconds * 1000;
  while (left > 0 && !run.stopped) {
    await whilePaused(run);
    const step = Math.min(250, left);
    await new Promise((resolve) => window.setTimeout(resolve, step));
    if (!run.paused) left -= step;
  }
}

/** Alternates "in" (4 s) and "out" (6 s) while active: a slow, calming rhythm. */
function useBreath(active: boolean): 'in' | 'out' | null {
  const [breath, setBreath] = useState<'in' | 'out'>('in');
  useEffect(() => {
    if (!active) return;
    setBreath('in');
    let timer = 0;
    const next = (phase: 'in' | 'out') => {
      timer = window.setTimeout(
        () => {
          const following = phase === 'in' ? 'out' : 'in';
          setBreath(following);
          next(following);
        },
        phase === 'in' ? 4000 : 6000,
      );
    };
    next('in');
    return () => window.clearTimeout(timer);
  }, [active]);
  return active ? breath : null;
}

interface PlayerProps {
  practiceId: PracticeId;
  minutes: Minutes;
  voice: boolean;
  sound: boolean;
  animate: boolean;
  title: React.ReactNode;
  headingRef: React.RefObject<HTMLHeadingElement>;
  onFinish: (completed: boolean, startedAt: string) => void;
}

function Player({ practiceId, minutes, voice, sound, animate, title, headingRef, onFinish }: PlayerProps) {
  const { t, locale } = useI18n();
  const script = PRACTICE_CONTENT[locale].practices[practiceId];
  const meta = PRACTICE_META[practiceId];
  const segments = useMemo(() => segmentsFor(script, minutes), [script, minutes]);
  const [narrator, setNarrator] = useState<Narrator | null>(null);
  const [total, setTotal] = useState(minutes * 60);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'speaking' | 'silence'>('speaking');
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const runRef = useRef<Run | null>(null);
  const startedAt = useRef(new Date().toISOString());
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    const run: Run = { paused: false, stopped: false, wake: null };
    runRef.current = run;
    let n: Narrator | null = null;
    let stopAmbient: (() => void) | null = null;

    void (async () => {
      n = await createNarrator(locale, practiceId, segments, voice);
      if (run.stopped) return;
      const pauses = planPauses(segments, n.durations, minutes);
      setTotal([...n.durations, ...pauses].reduce((a, b) => a + b, 0));
      setNarrator(n);
      if (sound) stopAmbient = startAmbient();

      for (let i = 0; i < segments.length; i++) {
        setIndex(i);
        setPhase('speaking');
        if (n.kind === 'silent') {
          await sleep(run, n.durations[i]);
        } else {
          let result: 'done' | 'interrupted';
          do {
            await whilePaused(run);
            if (run.stopped) return;
            result = await n.say(i);
          } while (result === 'interrupted' && !run.stopped);
        }
        if (run.stopped) return;
        setPhase('silence');
        await sleep(run, pauses[i]);
        if (run.stopped) return;
      }
      onFinishRef.current(true, startedAt.current);
    })();

    return () => {
      run.stopped = true;
      run.wake?.();
      n?.stop();
      stopAmbient?.();
      resumeAudio();
    };
  }, [locale, practiceId, segments, voice, sound, minutes]);

  // Count time only while actually playing.
  useEffect(() => {
    if (!narrator || paused) return;
    const timer = window.setInterval(() => setElapsed((e) => e + 0.25), 250);
    return () => window.clearInterval(timer);
  }, [narrator, paused]);

  // Keep the screen on so the session isn't cut off when the phone would normally lock.
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    navigator.wakeLock
      ?.request('screen')
      .then((l) => (lock = l))
      .catch(() => {});
    return () => void lock?.release();
  }, []);

  function togglePause() {
    const run = runRef.current;
    if (!run || !narrator) return;
    if (run.paused) {
      run.paused = false;
      resumeAudio();
      narrator.resume();
      run.wake?.();
      setPaused(false);
    } else {
      run.paused = true;
      narrator.pause();
      pauseAudio();
      setPaused(true);
    }
  }

  const segment = segments[index];
  const breath = useBreath(Boolean(narrator) && !paused && phase === 'silence' && Boolean(segment.breath));
  const scale = !animate || !breath ? 1 : breath === 'in' ? 1.18 : 0.86;
  const voiceNote = narrator?.missingVoice
    ? t.practice.voiceMissing
    : narrator?.kind === 'recorded'
      ? t.practice.voiceRecorded
      : narrator?.kind === 'device'
        ? t.practice.voiceDevice
        : t.practice.voiceSilent;

  return (
    <section aria-labelledby="session-heading" className={`${card} mx-auto flex max-w-2xl flex-col items-center gap-5 text-center`}>
      <div>
        <h2 id="session-heading" ref={headingRef} tabIndex={-1} className="text-xl font-semibold">
          {title}
        </h2>
        {narrator && <p className="text-sm text-(--muted)">{voiceNote}</p>}
      </div>

      <div className="flex h-56 w-56 items-center justify-center" aria-hidden="true">
        <div
          className="h-40 w-40 rounded-full shadow-lg"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${meta.hues[0]}, ${meta.hues[1]})`,
            transform: `scale(${scale})`,
            transition: animate ? `transform ${breath === 'out' ? 6 : 4}s ease-in-out` : undefined,
            opacity: paused ? 0.6 : 1,
          }}
        />
      </div>

      <p className="min-h-7 text-lg font-semibold">
        {!narrator ? t.practice.preparing : paused ? t.practice.paused : breath === 'in' ? t.practice.breatheIn : breath === 'out' ? t.practice.breatheOut : ''}
      </p>

      {narrator && (
        <p className={`min-h-24 max-w-prose text-xl leading-relaxed ${phase === 'silence' ? 'text-(--muted)' : ''}`}>
          {segment.text}
        </p>
      )}

      <div className="flex w-full max-w-md items-center gap-3">
        <div
          role="progressbar"
          aria-label={t.practice.progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((Math.min(elapsed, total) / total) * 100)}
          className="h-2 grow overflow-hidden rounded-full border border-(--border) bg-(--track)"
        >
          <div className="h-full bg-(--accent)" style={{ width: `${(Math.min(elapsed, total) / total) * 100}%` }} />
        </div>
        <span className="w-20 text-right text-sm tabular-nums text-(--muted)">
          {t.practice.remaining(formatClock(total - elapsed))}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={togglePause} disabled={!narrator} className={btnSecondary}>
          {paused ? t.practice.resume : t.practice.pause}
        </button>
        <button type="button" onClick={() => onFinish(false, startedAt.current)} className={btnGhost}>
          {t.practice.end}
        </button>
      </div>
      <p className="text-sm text-(--muted)">{t.practice.canStop}</p>
    </section>
  );
}

interface AfterProps {
  log: PracticeLog;
  title: React.ReactNode;
  headingRef: React.RefObject<HTMLHeadingElement>;
  onBack: () => void;
  onCheckIn: () => void;
}

function After({ log, title, headingRef, onBack, onCheckIn }: AfterProps) {
  const { t } = useI18n();
  const before = log.before;
  const [rating, setRating] = useState(before ? Math.round(before.intensity / 10) : 5);
  const [message, setMessage] = useState('');

  async function saveRating() {
    if (!before) return;
    const after = rating * 10;
    await logPractice({ ...log, after });
    const name = t.emotions[before.emotion].name;
    const change = t.practice.change(name, before.intensity, after);
    const drop = before.intensity - after;
    setMessage(`${change}. ${drop >= 5 ? t.practice.lighter(drop) : drop > -5 ? t.practice.same : t.practice.stronger}`);
  }

  async function saveFelt(felt: 'better' | 'same' | 'worse') {
    await logPractice({ ...log, felt });
    setMessage(felt === 'better' ? t.practice.feltBetter : felt === 'same' ? t.practice.feltSame : t.practice.feltWorse);
  }

  return (
    <section aria-labelledby="session-heading" className={`${card} mx-auto flex max-w-2xl flex-col gap-5`}>
      <div>
        <h2 id="session-heading" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold">
          {log.completed ? t.practice.doneTitle : t.practice.endedTitle}
        </h2>
        <p className="text-(--muted)">{title}</p>
      </div>

      {!message &&
        (before ? (
          <div className="rounded-xl bg-(--surface-alt) p-4">
            <p>{t.practice.beforeWas(t.emotions[before.emotion].noun, before.intensity)}</p>
            <p id="after-label" className="mt-2 font-medium">
              {t.practice.howStrongNow(t.emotions[before.emotion].noun)}
            </p>
            <div className="mt-2 flex items-center gap-4">
              <Slider.Root
                className="relative flex h-11 w-full touch-none select-none items-center"
                min={0}
                max={10}
                step={1}
                value={[rating]}
                onValueChange={(v) => setRating(v[0])}
                aria-labelledby="after-label"
              >
                <Slider.Track className="relative h-2 grow rounded-full border border-(--border) bg-(--track)">
                  <Slider.Range className="absolute h-full rounded-full bg-(--accent)" />
                </Slider.Track>
                <Slider.Thumb
                  aria-labelledby="after-label"
                  className="block h-7 w-7 rounded-full border-2 border-(--accent) bg-(--surface) shadow"
                />
              </Slider.Root>
              <span className="w-12 text-right text-lg font-semibold tabular-nums">{rating}/10</span>
            </div>
            <button type="button" onClick={() => void saveRating()} className={`${btnPrimary} mt-3`}>
              {t.practice.save}
            </button>
          </div>
        ) : (
          <div role="group" aria-labelledby="felt-label">
            <p id="felt-label" className="mb-2 font-medium">
              {t.practice.howNow}
            </p>
            <div className="flex flex-wrap gap-2">
              {(['better', 'same', 'worse'] as const).map((felt) => (
                <button key={felt} type="button" onClick={() => void saveFelt(felt)} className={btnSecondary}>
                  {t.practice.felt[felt]}
                </button>
              ))}
            </div>
          </div>
        ))}

      <p role="status" className="text-lg">
        {message}
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onBack} className={btnSecondary}>
          {t.practice.again}
        </button>
        <button type="button" onClick={onCheckIn} className={btnGhost}>
          {t.practice.checkIn}
        </button>
      </div>
    </section>
  );
}
