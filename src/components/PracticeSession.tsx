import * as Slider from '@radix-ui/react-slider';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { createNarrator, deviceVoiceAvailable, pauseAudio, resumeAudio, startAmbient, unlockAudio, type Narrator } from '../lib/audio';
import { db, logPractice } from '../lib/db';
import { clipId, clipsFor } from '../lib/myVoice';
import { usePersistentFlag, usePersistentState } from '../lib/hooks';
import { estimateSpeechSeconds, formatClock, planPauses, segmentsFor } from '../lib/session';
import type { PracticeBefore, PracticeLog, VisualizeRequest } from '../lib/types';
import { COMPOSED_LENGTHS, LENGTHS, type Minutes, type Playable } from '../practices';
import { BorderBeam } from './BorderBeam';
import { LineRecorder } from './MyVoice';
import { SaveToLibrary, type LibraryDetails } from './SaveToLibrary';
import { btnGhost, btnPrimary, btnSecondary, card, checkbox, toggle } from './ui';

interface Props {
  practice: Playable;
  /** The check-in this practice was started from, if any, for a before/after comparison. */
  before?: PracticeBefore;
  /** Shown above the options before starting, e.g. what Viz it understood from the person's words. */
  intro?: React.ReactNode;
  animate: boolean;
  onBack: () => void;
  onCheckIn: () => void;
  /** Lets a composed practice be saved to the Library afterwards. */
  library?: LibraryDetails;
  /** Called instead of showing the usual "after" screen, e.g. to go on to Unstuck's small step. */
  onComplete?: (completed: boolean) => void;
  /** What a composed practice was made from, kept with its log entry so it can be made again from the Journal. */
  request?: VisualizeRequest;
}

const SPEEDS = { slow: 0.8, normal: 1, fast: 1.15 } as const;
type Speed = keyof typeof SPEEDS;
const isSpeed = (value: unknown): value is Speed => typeof value === 'string' && value in SPEEDS;
const FEEL_WORDS = ['calmer', 'clearer', 'focused', 'confident', 'hopeful', 'same', 'other'] as const;

type Stage = 'ready' | 'record' | 'playing' | 'after';

const ALL_LENGTHS: readonly number[] = [...LENGTHS, ...COMPOSED_LENGTHS];
const isMinutes = (value: unknown): value is Minutes => ALL_LENGTHS.includes(value as number);

/** Default export so App can load it lazily. */
export default function PracticeSession({ practice, before, intro, animate, onBack, onCheckIn, library, onComplete, request }: Props) {
  const { t } = useI18n();
  const { script, lengths } = practice;
  const [preferred, setPreferred] = usePersistentState<Minutes>('moodcanvas.practiceMinutes', 3, isMinutes);
  // Five minutes is the default for composed visualizations; otherwise the shortest length.
  const minutes = lengths.includes(preferred) ? preferred : lengths.includes(5) ? 5 : lengths[0];
  const [voice, setVoice] = usePersistentFlag('moodcanvas.practiceVoice', true);
  const [breathing, setBreathing] = usePersistentFlag('moodcanvas.practiceBreathing', true);
  const [speed, setSpeed] = usePersistentState<Speed>('moodcanvas.practiceSpeed', 'normal', isSpeed);
  const [useMine, setUseMine] = usePersistentFlag('moodcanvas.practiceMine', true);
  const lines = segmentsFor(script, minutes, breathing).map((s) => s.text);
  const mineCount =
    useLiveQuery(async () => (await db.voiceClips.bulkGet(lines.map(clipId))).filter(Boolean).length, [lines.join('\n')]) ?? 0;
  const [sound, setSound] = usePersistentFlag('moodcanvas.practiceSound', true);
  const [stage, setStage] = useState<Stage>('ready');
  const [log, setLog] = useState<PracticeLog | null>(null);
  // Changing this starts the player again from the beginning.
  const [run, setRun] = useState(0);
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
    const entry: PracticeLog = {
      id: crypto.randomUUID(),
      practiceId: practice.id,
      minutes,
      startedAt,
      completed,
      before,
      // Composed practices aren't in the library, so the log keeps their title and icon.
      ...(practice.id === 'custom' && { title: script.title, icon: practice.icon }),
      ...(request && { request }),
    };
    setLog(entry);
    void logPractice(entry);
    if (onComplete) onComplete(completed);
    else setStage('after');
  }

  const title = (
    <>
      <span aria-hidden="true">{practice.icon} </span>
      {script.title}
    </>
  );

  if (stage === 'playing') {
    return (
      <Player
        key={run}
        practice={practice}
        minutes={minutes}
        breathing={breathing}
        rate={SPEEDS[speed]}
        mine={useMine && mineCount > 0}
        voice={voice}
        sound={sound}
        animate={animate}
        title={title}
        headingRef={headingRef}
        onFinish={finish}
        onRestart={() => setRun((r) => r + 1)}
      />
    );
  }

  if (stage === 'record') {
    return (
      <section aria-labelledby="session-heading" className={`${card} mx-auto flex max-w-2xl flex-col gap-4`}>
        <div>
          <h2 id="session-heading" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold">
            {t.voice.linesTitle}
          </h2>
          <p className="text-(--muted)">{title}</p>
        </div>
        <LineRecorder lines={lines} onDone={() => setStage('ready')} />
      </section>
    );
  }

  if (stage === 'after' && log) {
    return (
      <After
        log={log}
        title={title}
        headingRef={headingRef}
        onBack={onBack}
        onCheckIn={onCheckIn}
        save={library && <SaveToLibrary practice={practice} minutes={minutes} details={library} />}
        onCreateAgain={request && onBack}
      />
    );
  }

  return (
    <section aria-labelledby="session-heading" className={`${card} mx-auto flex max-w-2xl flex-col gap-5`}>
      <div>
        <h2 id="session-heading" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold">
          {title}
        </h2>
        <p className="mt-1">{script.summary}</p>
      </div>

      {intro}

      {mineCount < lines.length ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-(--accent) bg-(--accent-soft) p-4">
          <span aria-hidden="true" className="btn-glow flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl">
            🎙️
          </span>
          <div className="min-w-48 flex-1">
            <p className="font-bold">{t.voice.readyCta}</p>
            <p className="text-sm text-(--muted)">{t.voice.readyCtaBody(readingMinutes(lines))}</p>
          </div>
          <button type="button" onClick={() => setStage('record')} className={btnPrimary}>
            {t.voice.readyButton}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-(--accent)">✓ {t.voice.allMine}</p>
          <button type="button" onClick={() => setStage('record')} className={`${btnGhost} text-sm`}>
            {t.voice.reRecord}
          </button>
        </div>
      )}

      {lengths.length > 1 && (
        <div role="group" aria-labelledby="length-label">
          <p id="length-label" className="mb-2 font-medium">
            {t.practice.lengthLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {lengths.map((m) => (
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

      <p className="text-sm text-(--muted)">{t.practice.estimate(estimateMinutes(segmentsFor(script, minutes, breathing), minutes, SPEEDS[speed]))}</p>

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
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" checked={breathing} onChange={(e) => setBreathing(e.target.checked)} className={checkbox} />
          {t.practice.breathLabel}
        </label>
        {voice && mineCount > 0 && (
          <label className="flex min-h-11 items-center gap-3">
            <input type="checkbox" checked={useMine} onChange={(e) => setUseMine(e.target.checked)} className={checkbox} aria-describedby="mine-count" />
            <span>
              {t.voice.useMine}
              <span id="mine-count" className="block text-sm text-(--muted)">
                {t.voice.mineCount(mineCount, lines.length)}
              </span>
            </span>
          </label>
        )}
        {voice && deviceVoiceAvailable() && (
          <div role="group" aria-labelledby="speed-label" className="flex flex-wrap items-center gap-2">
            <span id="speed-label" className="font-medium">
              {t.practice.speedLabel}
            </span>
            {(Object.keys(SPEEDS) as Speed[]).map((id) => (
              <button key={id} type="button" aria-pressed={speed === id} onClick={() => setSpeed(id)} className={`${toggle(speed === id)} min-h-10 text-sm`}>
                {t.practice.speeds[id]}
              </button>
            ))}
          </div>
        )}
      </div>

      <details className="rounded-xl border border-(--border) px-4">
        <summary className="cursor-pointer py-3 font-medium">{t.create.readScript}</summary>
        <ol className="flex list-decimal flex-col gap-2 pb-4 ps-5">
          {segmentsFor(script, minutes, breathing).map((s) => (
            <li key={s.id}>{s.text}</li>
          ))}
        </ol>
      </details>

      <p className="rounded-xl bg-(--surface-alt) p-4 text-sm">{t.practice.tip}</p>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={begin} className={`${btnPrimary} relative min-h-13 px-10 text-lg`}>
          <BorderBeam />
          {t.practice.begin}
        </button>
        <button type="button" onClick={onBack} className={btnGhost}>
          {t.practice.back}
        </button>
      </div>
      {library && <SaveToLibrary practice={practice} minutes={minutes} details={library} />}
    </section>
  );
}

/** Roughly how long reading every line aloud takes, a little slower than the device voice. */
function readingMinutes(lines: string[]): number {
  return Math.max(1, Math.ceil(lines.reduce((sum, text) => sum + estimateSpeechSeconds(text, 0.8), 0) / 60));
}

/**
 * Roughly how long a session will take: the chosen length, unless the words alone take longer to say. Shown as an
 * estimate, since real speech varies.
 */
function estimateMinutes(segments: { text: string }[], minutes: number, rate: number): number {
  const speech = segments.reduce((sum, s) => sum + estimateSpeechSeconds(s.text, 0.9 * rate), 0);
  return Math.max(minutes, Math.ceil(speech / 60));
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
  practice: Playable;
  minutes: Minutes;
  breathing: boolean;
  rate: number;
  /** Use the person's own recordings for the lines they recorded. */
  mine: boolean;
  voice: boolean;
  sound: boolean;
  animate: boolean;
  title: React.ReactNode;
  headingRef: React.RefObject<HTMLHeadingElement>;
  onFinish: (completed: boolean, startedAt: string) => void;
  onRestart: () => void;
}

function Player({ practice, minutes, breathing, rate, mine, voice, sound, animate, title, headingRef, onFinish, onRestart }: PlayerProps) {
  const { t, locale } = useI18n();
  const { script, hues } = practice;
  const segments = useMemo(() => segmentsFor(script, minutes, breathing), [script, minutes, breathing]);
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
      const clips = mine ? await clipsFor(segments.map((s) => s.text)) : undefined;
      if (run.stopped) return;
      n = await createNarrator(locale, practice.id, segments, voice, rate, clips);
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
  }, [locale, practice.id, segments, voice, sound, minutes, rate, mine]);

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
  const breath = useBreath(breathing && Boolean(narrator) && !paused && phase === 'silence' && Boolean(segment.breath));
  const scale = !animate || !breath ? 1 : breath === 'in' ? 1.18 : 0.86;
  const voiceNote = narrator?.kind === 'mine'
    ? t.voice.mineNote
    : narrator?.missingVoice
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

      <div className="relative flex h-64 w-64 items-center justify-center" aria-hidden="true">
        <div className="aura inset-6 opacity-80" />
        {animate && !paused && (
          <div className="absolute inset-10" style={{ color: hues[0] }}>
            <span className="halo" />
            <span className="halo" />
          </div>
        )}
        <div
          className="relative h-40 w-40 rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, #ffffffcc, ${hues[0]} 30%, ${hues[1]})`,
            boxShadow: `0 0 60px 8px ${hues[0]}80, inset 0 -10px 30px ${hues[1]}`,
            transform: `scale(${scale})`,
            transition: animate ? `transform ${breath === 'out' ? 6 : 4}s ease-in-out` : undefined,
            opacity: paused ? 0.6 : 1,
          }}
        />
      </div>

      <p className="display min-h-7 text-xl font-bold text-(--accent)">
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
          className="h-2 grow overflow-hidden rounded-full bg-(--track)"
        >
          <div className="btn-glow h-full rounded-full" style={{ width: `${(Math.min(elapsed, total) / total) * 100}%` }} />
        </div>
        <span className="w-20 text-right text-sm tabular-nums text-(--muted)">
          {t.practice.remaining(formatClock(total - elapsed))}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={togglePause} disabled={!narrator} className={btnSecondary}>
          {paused ? t.practice.resume : t.practice.pause}
        </button>
        <button type="button" onClick={onRestart} className={btnSecondary}>
          <span aria-hidden="true">↺</span>
          {t.practice.restart}
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
  save?: React.ReactNode;
  /** Back to the form with the same words, to change something and make it again. */
  onCreateAgain?: () => void;
}

function After({ log, title, headingRef, onBack, onCheckIn, save, onCreateAgain }: AfterProps) {
  const { t } = useI18n();
  const before = log.before;
  const [rating, setRating] = useState(before ? Math.round(before.intensity / 10) : 5);
  const [words, setWords] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);

  /** Saves how they feel now. Optional, and "about the same" is a perfectly good answer. */
  async function saveFeelings() {
    setFailed(false);
    const after = before ? rating * 10 : undefined;
    try {
      await logPractice({ ...log, ...(after != null && { after }), ...(words.length && { feelings: words }) });
    } catch {
      setFailed(true);
      return;
    }
    if (before && after != null) {
      const name = t.emotions[before.emotion].name;
      const change = t.practice.change(name, before.intensity, after);
      const drop = before.intensity - after;
      setMessage(`${change}. ${drop >= 5 ? t.practice.lighter(drop) : drop > -5 ? t.practice.same : t.practice.stronger}`);
    } else {
      setMessage(t.practice.feelSaved);
    }
  }

  return (
    <section aria-labelledby="session-heading" className={`${card} mx-auto flex max-w-2xl flex-col gap-5`}>
      <div>
        <h2 id="session-heading" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold">
          {log.completed ? t.practice.doneTitle : t.practice.endedTitle}
        </h2>
        <p className="text-(--muted)">{title}</p>
      </div>

      {!message && (
        <div className="flex flex-col gap-3 rounded-xl bg-(--surface-alt) p-4">
          {before && (
            <>
              <p>{t.practice.beforeWas(t.emotions[before.emotion].noun, before.intensity)}</p>
              <p id="after-label" className="font-medium">
                {t.practice.howStrongNow(t.emotions[before.emotion].noun)}
              </p>
              <div className="flex items-center gap-4">
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
            </>
          )}
          <div role="group" aria-labelledby="felt-label" aria-describedby="felt-hint">
            <p id="felt-label" className="font-medium">
              {t.practice.howNow}
            </p>
            <p id="felt-hint" className="mb-2 text-sm text-(--muted)">
              {t.practice.feelHint}
            </p>
            <div className="flex flex-wrap gap-2">
              {FEEL_WORDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={words.includes(id)}
                  onClick={() => setWords((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]))}
                  className={`${toggle(words.includes(id))} min-h-10 text-sm`}
                >
                  {t.practice.feelWords[id]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void saveFeelings()} className={btnPrimary}>
              {t.practice.saveFeel}
            </button>
            <button type="button" onClick={() => setMessage(' ')} className={btnGhost}>
              {t.practice.skipFeel}
            </button>
          </div>
          {failed && (
            <p role="alert" className="font-medium text-(--danger)">
              {t.practice.saveFailed}
            </p>
          )}
        </div>
      )}

      <p role="status" className="text-lg">
        {message.trim()}
      </p>

      {save}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onBack} className={btnSecondary}>
          {t.practice.again}
        </button>
        {onCreateAgain && (
          <button type="button" onClick={onCreateAgain} className={btnSecondary}>
            {t.history.again}
          </button>
        )}
        <button type="button" onClick={onCheckIn} className={btnGhost}>
          {t.practice.checkIn}
        </button>
      </div>
    </section>
  );
}
