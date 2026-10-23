import { useLiveQuery } from 'dexie-react-hooks';
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useI18n } from '../i18n';
import { analyze, type AnalysisResult } from '../lib/analyzer';
import {
  ASKED_OUTCOMES,
  BREAKER_TEXT,
  composeUnstuck,
  draftFrom,
  EMPTY_BREAKER_DRAFT,
  FEELING_IDS,
  FOCUS_LENGTHS,
  focusedSeconds,
  formatDuration,
  GOAL_FOR_FEELING,
  LIMITS,
  nextStep,
  sessionTitle,
  SITUATION_IDS,
  smaller,
  suggest,
  suggestionBasis,
  toSavedScript,
  understand,
  unfinished,
  type BreakerDraft,
  type BreakerOutcome,
  type BreakerText,
} from '../lib/breaker';
import {
  addMinutes,
  finishSession,
  pauseSession,
  restartSession,
  resumeSession,
  saveReflection,
  saveWithoutAction,
  startSession,
} from '../lib/breaker/store';
import type { GoalId } from '../lib/compose';
import { db } from '../lib/db';
import type { EmotionLabel } from '../lib/emotions';
import { formatClock } from '../lib/session';
import type { BreakerSession } from '../lib/types';
import { COMPOSED_LENGTHS, type Playable } from '../practices';
import { SaveToLibrary } from './SaveToLibrary';
import { btnGhost, btnPrimary, btnSecondary, card, checkbox, toggle } from './ui';
import { SceneTiles } from './Visualize';

const PracticeSession = lazy(() => import('./PracticeSession'));

type Screen =
  | { kind: 'flow' }
  | { kind: 'timer'; id: string }
  | { kind: 'reflect'; id: string; schedule?: boolean }
  | { kind: 'after'; id: string };

const NO_SESSIONS: BreakerSession[] = [];
const field =
  'field w-full rounded-2xl border border-(--border) bg-(--surface-strong) p-3 leading-relaxed transition-shadow';
const label = 'font-semibold';
const chip = (pressed: boolean) => `${toggle(pressed)} text-start text-sm`;

interface Props {
  draft: BreakerDraft;
  onDraftChange: (draft: BreakerDraft) => void;
  animate: boolean;
  /** Someone may be in danger: show support instead of carrying on. */
  onCrisis: () => void;
  onSupport: () => void;
  /** "Calm my mind" and "Get focused" go to the front page with that goal chosen. */
  onVisualize: (goal: GoalId) => void;
  /** "Reconnect with my goals" opens Habits. */
  onHabits: () => void;
}

/**
 * Unstuck: from what has someone stuck, through a visualization made for it, to one small step, a focus timer and
 * an honest record of how it went. Everything runs and is saved on the device.
 */
export default function Breaker({ draft, onDraftChange, animate, onCrisis, onSupport, onVisualize, onHabits }: Props) {
  const { locale, t } = useI18n();
  const text = BREAKER_TEXT[locale];
  const sessions = useLiveQuery(() => db.breakerSessions.orderBy('createdAt').reverse().toArray(), []) ?? NO_SESSIONS;
  const [screen, setScreen] = useState<Screen>({ kind: 'flow' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = sessions.find((s) => s.status === 'active');
  const formatDate = useMemo(
    () => (iso: string) =>
      new Intl.DateTimeFormat(t.htmlLang, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)),
    [t.htmlLang],
  );

  function show(next: Screen) {
    setScreen(next);
    setError('');
    window.scrollTo(0, 0);
  }

  /** Runs a save, keeping the person's answers and saying so if it fails. */
  async function saving(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await work();
    } catch {
      setError(text.journal.failed);
    } finally {
      setBusy(false);
    }
  }

  const advice = (from: BreakerDraft) => suggest(text, from.task, from.obstacles, from.situations).help.join(' ');

  /** Saves the session and opens its timer, or asks when to come back when it's scheduled for later. */
  function start(from: BreakerDraft, running = true) {
    void saving(async () => {
      const session = await startSession(from, advice(from), running);
      onDraftChange(EMPTY_BREAKER_DRAFT);
      show(running ? { kind: 'timer', id: session.id } : { kind: 'reflect', id: session.id, schedule: true });
    });
  }

  function skip(from: BreakerDraft) {
    void saving(async () => {
      const session = await saveWithoutAction(from, advice(from));
      onDraftChange(EMPTY_BREAKER_DRAFT);
      show({ kind: 'after', id: session.id });
    });
  }

  /** Opens the journey at a draft, with a fresh suggestion when it's at the action and has no step yet. */
  function continueWith(next: BreakerDraft) {
    onDraftChange(withSuggestion(text, next));
    show({ kind: 'flow' });
  }

  let body: ReactNode;
  if (screen.kind === 'timer') {
    body = (
      <Timer
        id={screen.id}
        text={text}
        animate={animate}
        onReflect={() => show({ kind: 'reflect', id: screen.id })}
        onDone={() => show({ kind: 'after', id: screen.id })}
        onMissing={() => show({ kind: 'flow' })}
      />
    );
  } else if (screen.kind === 'reflect') {
    body = (
      <Reflect
        id={screen.id}
        schedule={screen.schedule}
        text={text}
        onSaved={() => show({ kind: 'after', id: screen.id })}
        onMissing={() => show({ kind: 'flow' })}
      />
    );
  } else if (screen.kind === 'after') {
    body = (
      <After
        id={screen.id}
        text={text}
        animate={animate}
        formatDate={formatDate}
        busy={busy}
        onContinue={continueWith}
        onStart={(d) => start(d)}
        onHome={() => continueWith(EMPTY_BREAKER_DRAFT)}
      />
    );
  } else {
    body = (
      <Flow
        draft={draft}
        set={onDraftChange}
        text={text}
        sessions={sessions}
        active={active}
        busy={busy}
        animate={animate}
        formatDate={formatDate}
        onStart={(d) => start(d)}
        onSchedule={(d) => start(d, false)}
        onSkip={skip}
        onOpenActive={(s) => show({ kind: 'timer', id: s.id })}
        onResume={(s) => continueWith(draftFrom(s))}
        onCrisis={onCrisis}
        onSupport={onSupport}
        onVisualize={onVisualize}
        onGoals={onHabits}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="display tagline text-sm font-extrabold text-(--muted) uppercase">{text.title}</p>
      </div>
      {error && (
        <p role="alert" className={`${card} font-medium text-(--danger)`}>
          {error}
        </p>
      )}
      {body}
    </div>
  );
}

/** The draft at its action screen, with the first suggestion filled in unless a step was already chosen for it. */
function withSuggestion(text: BreakerText, draft: BreakerDraft): BreakerDraft {
  if (draft.step !== 3 || (draft.action && draft.actionFor === suggestionBasis(draft))) return draft;
  const first = suggest(text, draft.task, draft.obstacles, draft.situations).options[0];
  return { ...draft, action: draft.action || first, optionIndex: 0, actionFor: suggestionBasis(draft) };
}

/** Moves focus to the heading whenever `key` changes, so screen reader and keyboard users start at the top. */
function useFocusOnChange(key: unknown): RefObject<HTMLHeadingElement> {
  const ref = useRef<HTMLHeadingElement>(null);
  const previous = useRef(key);
  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    ref.current?.focus();
  }, [key]);
  return ref;
}

/** Moves focus to the heading once the screen's data has loaded. */
function useFocusOnLoad(loaded: boolean): RefObject<HTMLHeadingElement> {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (loaded) ref.current?.focus();
  }, [loaded]);
  return ref;
}

function toggleIn<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

// ---------------------------------------------------------------------------------------------------------------
// The journey: what has you stuck → what I'm hearing and how you'd like to feel → the visualization → one small step.

interface FlowProps {
  draft: BreakerDraft;
  set: (draft: BreakerDraft) => void;
  text: BreakerText;
  sessions: BreakerSession[];
  active: BreakerSession | undefined;
  busy: boolean;
  animate: boolean;
  formatDate: (iso: string) => string;
  onStart: (draft: BreakerDraft) => void;
  onSchedule: (draft: BreakerDraft) => void;
  onSkip: (draft: BreakerDraft) => void;
  onOpenActive: (session: BreakerSession) => void;
  onResume: (session: BreakerSession) => void;
  onCrisis: () => void;
  onSupport: () => void;
  onVisualize: (goal: GoalId) => void;
  onGoals: () => void;
}

type StepProps = FlowProps & {
  heading: (title: string) => ReactNode;
  go: (step: number, changes?: Partial<BreakerDraft>) => void;
  reading: AnalysisResult | null;
};

function Flow(props: FlowProps) {
  const { draft, set, text, animate } = props;
  const { t, locale } = useI18n();
  const headingRef = useFocusOnChange(draft.step);
  // Read on the device, as on the front page, and never stored: it shapes the opening line and spots danger.
  const reading = useMemo(() => (draft.task.trim() ? analyze(draft.task, { language: locale }) : null), [draft.task, locale]);

  function go(step: number, changes: Partial<BreakerDraft> = {}) {
    set(withSuggestion(text, { ...draft, ...changes, step }));
    window.scrollTo(0, 0);
  }

  const heading = (title: string) => (
    <h2 ref={headingRef} tabIndex={-1} className="display text-2xl leading-tight font-extrabold sm:text-3xl">
      {title}
    </h2>
  );
  const step = { ...props, heading, go, reading };

  if (draft.step === 1) return <Understand {...step} />;
  if (draft.step === 2) {
    return (
      <Suspense fallback={<p className="text-(--muted)">{t.app.loading}</p>}>
        <UnstuckPractice
          draft={draft}
          text={text}
          feeling={reading?.emotions[0]?.label ?? null}
          animate={animate}
          onBack={() => go(1)}
          onComplete={(completed) => go(3, { practiceCompleted: completed })}
        />
      </Suspense>
    );
  }
  if (draft.step === 3) return <Action {...step} />;
  return <Welcome {...step} />;
}

function Welcome({
  draft,
  set,
  text,
  sessions,
  active,
  formatDate,
  onOpenActive,
  onResume,
  onCrisis,
  onVisualize,
  onGoals,
  heading,
  reading,
  go,
}: StepProps) {
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const open = unfinished(sessions);
  const latest = sessions[0];
  const returning = latest && !dismissed && !active && !draft.task && draft.situations.length === 0;
  const pickUp = open[0];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.task.trim() && draft.situations.length === 0) {
      setError(text.welcome.need);
      document.getElementById('unstuck-text')?.focus();
      return;
    }
    // Someone who may be in danger gets support first, not a productivity exercise.
    if (reading?.crisis) {
      onCrisis();
      return;
    }
    setError('');
    go(1);
  }

  function startFresh() {
    setDismissed(true);
    requestAnimationFrame(() => document.getElementById('unstuck-text')?.focus());
  }

  const r = text.returning.options;
  return (
    <>
      {active && (
        <section className={`${card} flex flex-col gap-3 border-(--accent)!`} aria-live="polite">
          <p className="font-semibold">{text.entry.running}</p>
          <p className="text-(--muted)">{active.action}</p>
          <button type="button" onClick={() => onOpenActive(active)} className={`${btnPrimary} self-start`}>
            {text.entry.openRunning}
          </button>
        </section>
      )}

      {returning && (
        <section aria-labelledby="returning-heading" className={`${card} fade-up flex flex-col gap-4`}>
          <h2 id="returning-heading" className="display text-xl font-extrabold sm:text-2xl">
            {text.returning.title}
          </h2>
          <p className="text-sm text-(--muted) break-words">{text.returning.recent(sessionTitle(text, latest))}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onVisualize('calm')} className={btnSecondary}>
              {r.calm}
            </button>
            <button type="button" onClick={() => onVisualize('focus')} className={btnSecondary}>
              {r.focus}
            </button>
            <button type="button" onClick={startFresh} className={btnSecondary}>
              {r.work}
            </button>
            <button type="button" onClick={onGoals} className={btnSecondary}>
              {r.goals}
            </button>
            {pickUp && (
              <button type="button" onClick={() => onResume(pickUp)} className={btnPrimary}>
                {r.continue}
              </button>
            )}
            <button type="button" onClick={startFresh} className={btnGhost}>
              {r.fresh}
            </button>
          </div>
        </section>
      )}

      <form noValidate onSubmit={submit} className={`${card} fade-up flex flex-col gap-5`}>
        <div className="flex flex-col gap-2">
          {heading(text.welcome.title)}
          <p className="text-lg text-(--muted)">{text.welcome.body}</p>
        </div>
        <fieldset>
          <legend className={`${label} mb-2`}>{text.welcome.situationsLegend}</legend>
          <div className="flex flex-wrap gap-2">
            {SITUATION_IDS.map((id) => {
              const pressed = draft.situations.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => {
                    setError('');
                    set({ ...draft, situations: toggleIn(draft.situations, id) });
                  }}
                  className={chip(pressed)}
                >
                  {pressed && <span aria-hidden="true">✓</span>}
                  {text.situations[id]}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="flex flex-col gap-1">
          <label htmlFor="unstuck-text" className={label}>
            {text.welcome.label}
          </label>
          <p id="unstuck-text-hint" className="text-sm text-(--muted)">
            {text.welcome.optional}
          </p>
          <textarea
            id="unstuck-text"
            rows={3}
            maxLength={LIMITS.task}
            value={draft.task}
            placeholder={text.welcome.placeholder}
            onChange={(e) => {
              setError('');
              set({ ...draft, task: e.target.value });
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={`unstuck-text-hint${error ? ' unstuck-error' : ''}`}
            className={`${field} mt-1 text-lg`}
          />
        </div>
        {error && (
          <p id="unstuck-error" role="alert" className="font-medium text-(--danger)">
            {error}
          </p>
        )}
        <button type="submit" className={`${btnPrimary} min-h-14 w-full px-8 text-lg sm:w-auto sm:self-start`}>
          {text.next}
        </button>
        <p className="text-sm text-(--muted) italic">{text.principle}</p>
      </form>

      {open.length > 0 && (
        <section aria-labelledby="breaker-open-heading" className={`${card} flex flex-col gap-3`}>
          <h2 id="breaker-open-heading" className="text-xl font-semibold">
            {text.entry.resumeHeading}
          </h2>
          <ul className="flex flex-col gap-2">
            {open.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-(--surface-alt) p-3">
                <div className="min-w-0">
                  <p className="font-semibold break-words">{s.action}</p>
                  <p className="text-sm text-(--muted)">
                    {s.rescheduledFor ? text.entry.plannedFor(formatDate(s.rescheduledFor)) : text.reflect.outcomes[s.outcome!]}
                  </p>
                </div>
                <button type="button" onClick={() => onResume(s)} className={btnSecondary}>
                  {text.progress.resume}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Understand({ draft, set, text, onSupport, heading, reading, go }: StepProps) {
  const { t, locale } = useI18n();
  const [error, setError] = useState('');
  const u = understand(text, draft.situations, draft.task);
  const strongest = reading?.emotions[0];
  const heavy = strongest != null && (strongest.label === 'sadness' || strongest.label === 'fear') && strongest.intensity >= 65;

  function create() {
    try {
      // Composing runs on the device; trying it here means a problem shows now, with every answer kept.
      composeUnstuck(text, t, locale, draft, strongest?.label ?? null);
      setError('');
      go(2, { practiceCompleted: undefined });
    } catch {
      setError(text.understand.generateError);
    }
  }

  return (
    <section className={`${card} fade-up flex flex-col gap-6`} aria-label={text.title}>
      <div className="flex flex-col gap-3">
        {heading(text.understand.title)}
        <p className="text-lg">
          {u.ack} {u.notAll}
        </p>
        {u.maybe && <p className="text-(--muted)">{u.maybe}</p>}
        {heavy && (
          <div className="flex flex-col items-start gap-2 rounded-2xl bg-(--surface-alt) p-4">
            <p>{text.understand.heavy}</p>
            <button type="button" onClick={onSupport} className={btnSecondary}>
              {text.understand.support}
            </button>
          </div>
        )}
      </div>

      <fieldset>
        <legend className={`${label} text-lg`}>{u.question}</legend>
        <p className="mb-2 text-sm text-(--muted)">{text.understand.followUpHint}</p>
        <div className="flex flex-wrap gap-2">
          {u.options.map((id) => {
            const pressed = draft.obstacles.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={pressed}
                onClick={() => set({ ...draft, obstacles: toggleIn(draft.obstacles, id) })}
                className={chip(pressed)}
              >
                {pressed && <span aria-hidden="true">✓</span>}
                {text.obstacles[id].label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={`${label} text-lg`}>{text.understand.feelLegend}</legend>
        <p className="mb-2 text-sm text-(--muted)">{text.understand.feelHint}</p>
        <div className="flex flex-wrap gap-2">
          {FEELING_IDS.map((id) => {
            const pressed = draft.feelings.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={pressed}
                onClick={() => set({ ...draft, feelings: toggleIn(draft.feelings, id) })}
                className={chip(pressed)}
              >
                {pressed && <span aria-hidden="true">✓</span>}
                {text.understand.feelings[id]}
                {draft.feelings[0] === id && (
                  <span className="rounded-full bg-(--accent) px-2 py-0.5 text-xs font-bold text-(--on-accent)">
                    {text.understand.main}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={`${label} mb-3 text-lg`}>{t.create.sceneLegend}</legend>
        <SceneTiles value={draft.scene} onChange={(scene) => set({ ...draft, scene })} />
      </fieldset>

      {error && (
        <p role="alert" className="font-medium text-(--danger)">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={create} className={`${btnPrimary} min-h-14 px-8 text-lg`}>
          <span aria-hidden="true">✨</span>
          {error ? text.understand.retry : t.create.create}
        </button>
        <button type="button" onClick={() => go(0)} className={btnGhost}>
          {text.back}
        </button>
      </div>
    </section>
  );
}

/** The visualization, played by the same player as the rest of the app. */
function UnstuckPractice({
  draft,
  text,
  feeling,
  animate,
  onBack,
  onComplete,
}: {
  draft: BreakerDraft;
  text: BreakerText;
  feeling: EmotionLabel | null;
  animate: boolean;
  onBack: () => void;
  onComplete: (completed: boolean) => void;
}) {
  const { t, locale } = useI18n();
  const { task, situations, feelings, scene } = draft;
  const composed = useMemo(
    () => composeUnstuck(text, t, locale, { task, situations, feelings, scene }, feeling),
    [text, t, locale, task, situations, feelings, scene, feeling],
  );
  const playable: Playable = { id: 'custom', icon: composed.icon, hues: composed.hues, lengths: COMPOSED_LENGTHS, script: composed.script };
  return (
    <PracticeSession
      key={composed.script.title}
      practice={playable}
      animate={animate}
      onBack={onBack}
      onCheckIn={onBack}
      onComplete={onComplete}
    />
  );
}

function Action({ draft, set, text, busy, onStart, onSchedule, onSkip, heading, go }: StepProps) {
  const [error, setError] = useState('');
  const [choosing, setChoosing] = useState(false);
  const preset = (FOCUS_LENGTHS as readonly number[]).includes(draft.plannedMinutes);
  const [custom, setCustom] = useState(!preset);
  const suggestion = useMemo(
    () => suggest(text, draft.task, draft.obstacles, draft.situations),
    [text, draft.task, draft.obstacles, draft.situations],
  );
  const options = suggestion.options;
  const smallerStep = smaller(text, draft.task, draft.action, draft.situations);

  function needStep(): boolean {
    if (draft.action.trim()) return false;
    setError(text.action.need);
    document.getElementById('breaker-action')?.focus();
    return true;
  }

  function begin() {
    if (needStep()) return;
    const m = draft.plannedMinutes;
    if (!Number.isInteger(m) || m < 1 || m > LIMITS.minutes) {
      setError(text.ready.customLabel);
      document.getElementById('breaker-minutes')?.focus();
      return;
    }
    onStart(draft);
  }

  return (
    <section className={`${card} fade-up flex flex-col gap-5`} aria-label={text.title}>
      {draft.practiceCompleted !== undefined && (
        <p className="text-sm font-semibold text-(--accent)">
          {draft.practiceCompleted ? text.session.done : text.session.early}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {heading(text.action.title)}
        <p className="text-lg text-(--muted)">{text.action.body}</p>
      </div>

      {suggestion.help.length > 0 && (
        <section aria-labelledby="breaker-help" className="flex flex-col gap-1 rounded-2xl bg-(--surface-alt) p-4">
          <h3 id="breaker-help" className="font-semibold">
            {text.action.mayHelp}
          </h3>
          {suggestion.help.map((help) => (
            <p key={help}>{help}</p>
          ))}
        </section>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="breaker-action" className={`${label} text-lg`}>
          {text.action.label}
        </label>
        <textarea
          id="breaker-action"
          rows={2}
          maxLength={LIMITS.short}
          value={draft.action}
          onChange={(e) => {
            setError('');
            set({ ...draft, action: e.target.value });
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'breaker-error' : undefined}
          className={`${field} border-(--accent) text-lg font-semibold`}
        />
        <div className="flex flex-wrap gap-2">
          {options.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const i = (draft.optionIndex + 1) % options.length;
                set({ ...draft, optionIndex: i, action: options[i] });
              }}
              className={btnSecondary}
            >
              <span aria-hidden="true">↻</span>
              {text.action.another}
            </button>
          )}
          <button
            type="button"
            disabled={!smallerStep}
            onClick={() => smallerStep && set({ ...draft, action: smallerStep })}
            className={btnSecondary}
          >
            <span aria-hidden="true">↓</span>
            {text.action.smaller}
          </button>
        </div>
      </div>

      {choosing && (
        <div role="group" aria-labelledby="breaker-length" className="flex flex-col gap-3 rounded-2xl bg-(--surface-alt) p-4">
          <p id="breaker-length" className={label}>
            {text.ready.howLong}
          </p>
          <div className="flex flex-wrap gap-2">
            {FOCUS_LENGTHS.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={!custom && draft.plannedMinutes === m}
                onClick={() => {
                  setCustom(false);
                  set({ ...draft, plannedMinutes: m });
                }}
                className={toggle(!custom && draft.plannedMinutes === m)}
              >
                {text.ready.lengths[m]}
              </button>
            ))}
            <button type="button" aria-pressed={custom} onClick={() => setCustom(true)} className={toggle(custom)}>
              {text.ready.custom}
            </button>
          </div>
          {custom && (
            <div className="flex flex-col gap-1">
              <label htmlFor="breaker-minutes" className="text-sm font-semibold">
                {text.ready.customLabel}
              </label>
              <input
                id="breaker-minutes"
                type="number"
                inputMode="numeric"
                min={1}
                max={LIMITS.minutes}
                step={1}
                value={Number.isFinite(draft.plannedMinutes) ? draft.plannedMinutes : ''}
                onChange={(e) => set({ ...draft, plannedMinutes: e.target.valueAsNumber })}
                className={`${field} w-32`}
              />
            </div>
          )}
          <button type="button" disabled={busy} onClick={begin} className={`${btnPrimary} min-h-12 self-start px-10 text-lg`}>
            <span aria-hidden="true">▶</span>
            {text.ready.start}
          </button>
        </div>
      )}

      {error && (
        <p id="breaker-error" role="alert" className="font-medium text-(--danger)">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!choosing && (
          <button
            type="button"
            onClick={() => !needStep() && setChoosing(true)}
            className={`${btnPrimary} min-h-14 px-8 text-lg`}
          >
            <span aria-hidden="true">▶</span>
            {text.action.startNow}
          </button>
        )}
        <button type="button" disabled={busy} onClick={() => !needStep() && onSchedule(draft)} className={btnSecondary}>
          <span aria-hidden="true">🗓</span>
          {text.action.schedule}
        </button>
        <button type="button" disabled={busy} onClick={() => onSkip(draft)} className={btnGhost}>
          {text.action.skip}
        </button>
        <button type="button" onClick={() => go(1)} className={btnGhost}>
          {text.back}
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Focus timer. Time is worked out from saved timestamps, so it keeps counting when the person switches tabs or
// pages, and survives a reload.

function useSession(id: string, onMissing: () => void): BreakerSession | undefined {
  const session = useLiveQuery(async () => (await db.breakerSessions.get(id)) ?? null, [id]);
  useEffect(() => {
    if (session === null) onMissing();
  }, [session, onMissing]);
  return session ?? undefined;
}

function Timer({
  id,
  text,
  animate,
  onReflect,
  onDone,
  onMissing,
}: {
  id: string;
  text: BreakerText;
  animate: boolean;
  onReflect: () => void;
  onDone: () => void;
  onMissing: () => void;
}) {
  const session = useSession(id, onMissing);
  const [now, setNow] = useState(Date.now);
  const [saving, setSaving] = useState(false);
  const headingRef = useFocusOnLoad(Boolean(session));
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(tick);
  }, []);

  const total = (session?.plannedMinutes ?? 1) * 60;
  const focused = session ? focusedSeconds(session, now) : 0;
  const left = Math.max(0, total - focused);
  const running = session?.runningSince != null;
  const timeUp = Boolean(session) && left === 0;

  // When time runs out, stop the clock at the planned length: time away from the screen isn't counted as work.
  useEffect(() => {
    if (session && running && timeUp) {
      void pauseSession(session, Date.now(), true);
      navigator.vibrate?.(200);
    }
  }, [session, running, timeUp]);

  if (!session) return null;

  async function stop() {
    await pauseSession(session!);
    onReflect();
  }

  /** Done is the common case, so it's saved in one tap. */
  async function done() {
    if (saving) return;
    setSaving(true);
    try {
      await finishSession(session!, 'done', undefined);
      onDone();
    } finally {
      setSaving(false);
    }
  }

  const r = 88;
  const circumference = 2 * Math.PI * r;
  const share = Math.min(1, focused / total);

  return (
    <section aria-labelledby="breaker-timer-heading" className={`${card} flex flex-col items-center gap-5 text-center`}>
      <h2 id="breaker-timer-heading" ref={headingRef} tabIndex={-1} className="display text-2xl leading-snug font-extrabold break-words">
        {session.action}
      </h2>

      <div className="relative flex h-60 w-60 items-center justify-center">
        <div aria-hidden="true" className={`aura inset-4 ${running ? 'opacity-90' : 'opacity-40'}`} />
        <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="100" cy="100" r={r} fill="none" strokeWidth="8" style={{ stroke: 'var(--track)' }} />
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - share)}
            style={{ stroke: 'var(--accent)', transition: animate ? 'stroke-dashoffset 500ms linear' : undefined }}
          />
        </svg>
        <div role="timer" aria-label={text.timer.progressLabel} className="relative flex flex-col items-center">
          <span className="display text-5xl font-extrabold tabular-nums">{formatClock(left)}</span>
          <span className="text-sm text-(--muted)">{running ? text.timer.left : timeUp ? '' : text.timer.paused}</span>
        </div>
      </div>
      {/* Announced once, not every second. */}
      <p aria-live="polite" className="min-h-7 text-lg font-semibold text-(--accent)">
        {timeUp ? text.timer.timeUp : running ? '' : text.timer.paused}
      </p>

      {session.plan && (
        <p className="max-w-prose rounded-2xl bg-(--surface-alt) px-4 py-3 text-sm">
          <span className="font-semibold">{text.progress.plan}: </span>
          {session.plan}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" disabled={saving} onClick={() => void done()} className={`${btnPrimary} min-h-12 px-7`}>
          <span aria-hidden="true">✓</span>
          {text.timer.done}
        </button>
        {timeUp ? (
          <>
            <button type="button" onClick={onReflect} className={btnSecondary}>
              {text.timer.record}
            </button>
            <button type="button" onClick={() => void addMinutes(session, 5)} className={btnSecondary}>
              {text.timer.more}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void (running ? pauseSession(session) : resumeSession(session))}
              className={btnSecondary}
            >
              {running ? text.timer.pause : text.timer.resume}
            </button>
            <button type="button" onClick={() => void restartSession(session)} className={btnSecondary}>
              <span aria-hidden="true">↺</span>
              {text.timer.restart}
            </button>
            <button type="button" onClick={() => void stop()} className={btnGhost}>
              {text.timer.stop}
            </button>
          </>
        )}
      </div>
      <p className="max-w-prose text-sm text-(--muted)">{text.timer.note}</p>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// How it went, then a next step that fits, and an optional reflection for the Journal.

function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function Reflect({
  id,
  schedule,
  text,
  onSaved,
  onMissing,
}: {
  id: string;
  schedule?: boolean;
  text: BreakerText;
  onSaved: () => void;
  onMissing: () => void;
}) {
  const session = useSession(id, onMissing);
  const [when, setWhen] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const headingRef = useFocusOnLoad(Boolean(session));

  if (!session) return null;

  /** One tap saves; only scheduling asks for something more, a date. */
  async function save(outcome: BreakerOutcome) {
    if (saving) return;
    let rescheduledFor: string | undefined;
    if (outcome === 'rescheduled') {
      const date = new Date(when);
      if (!when || Number.isNaN(date.getTime())) {
        setError(text.reflect.needDate);
        document.getElementById('breaker-when')?.focus();
        return;
      }
      rescheduledFor = date.toISOString();
    }
    setSaving(true);
    try {
      await finishSession(session!, outcome, rescheduledFor);
      onSaved();
    } catch {
      setError(text.journal.failed);
    } finally {
      setSaving(false);
    }
  }

  const errorText = error && (
    <p role="alert" className="font-medium text-(--danger)">
      {error}
    </p>
  );
  const headingClass = 'display text-2xl leading-tight font-extrabold sm:text-3xl';

  if (schedule) {
    return (
      <section aria-labelledby="breaker-reflect-heading" className={`${card} flex flex-col gap-5`}>
        <h2 id="breaker-reflect-heading" ref={headingRef} tabIndex={-1} className={headingClass}>
          {text.action.schedule}
        </h2>
        <p className="rounded-2xl bg-(--surface-alt) px-4 py-3 font-semibold break-words">{session.action}</p>
        <div className="flex flex-col gap-2">
          <label htmlFor="breaker-when" className={label}>
            {text.reflect.when}
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="breaker-when"
              type="datetime-local"
              min={toLocalInput(new Date())}
              value={when}
              onChange={(e) => {
                setWhen(e.target.value);
                setError('');
              }}
              aria-invalid={error ? true : undefined}
              className={`${field} sm:w-72`}
            />
            <button type="button" disabled={saving} onClick={() => void save('rescheduled')} className={`${btnPrimary} min-h-12 px-8`}>
              {saving ? text.reflect.saving : text.reflect.save}
            </button>
          </div>
        </div>
        {errorText}
      </section>
    );
  }

  return (
    <section aria-labelledby="breaker-reflect-heading" className={`${card} flex flex-col gap-5`}>
      <div className="flex flex-col gap-1">
        <h2 id="breaker-reflect-heading" ref={headingRef} tabIndex={-1} className={headingClass}>
          {text.reflect.title}
        </h2>
        {session.focusedSeconds > 0 && (
          <p className="text-(--muted)">{text.reflect.focused(formatDuration(text, session.focusedSeconds))}</p>
        )}
      </div>
      <p className="rounded-2xl bg-(--surface-alt) px-4 py-3 font-semibold break-words">{session.action}</p>
      <div role="group" aria-labelledby="breaker-question" className="flex flex-col gap-2">
        <p id="breaker-question" className={label}>
          {text.reflect.question}
        </p>
        {ASKED_OUTCOMES.map((o) => (
          <button
            key={o}
            type="button"
            disabled={saving}
            onClick={() => void save(o)}
            className={`${toggle(false)} min-h-12 w-full justify-start! rounded-2xl! text-start`}
          >
            {text.reflect.outcomes[o]}
          </button>
        ))}
      </div>
      {errorText}
    </section>
  );
}

function After({
  id,
  text,
  animate,
  formatDate,
  busy,
  onContinue,
  onStart,
  onHome,
}: {
  id: string;
  text: BreakerText;
  animate: boolean;
  formatDate: (iso: string) => string;
  busy: boolean;
  onContinue: (draft: BreakerDraft) => void;
  onStart: (draft: BreakerDraft) => void;
  onHome: () => void;
}) {
  const session = useSession(id, onHome);
  const headingRef = useFocusOnLoad(Boolean(session));
  if (!session) return null;

  const a = text.after;
  const s = session.situations;
  const next = session.action ? nextStep(text, session.task, session.action, s) : null;
  const smallerStep = session.action ? smaller(text, session.task, session.action, s) : null;
  let title = a.doneTitle;
  let bodyText = a.doneBody;
  let extra: ReactNode = null;
  let actions: ReactNode;
  const home = (name: string) => (
    <button type="button" onClick={onHome} className={btnGhost}>
      {name}
    </button>
  );

  switch (session.outcome) {
    case 'progress':
      title = a.progressTitle;
      bodyText = a.progressBody;
      actions = (
        <>
          <button type="button" disabled={busy} onClick={() => onStart(draftFrom(session, { plannedMinutes: 10 }))} className={btnPrimary}>
            {a.keepGoing}
          </button>
          {home(a.finish)}
        </>
      );
      break;
    case 'hard':
      title = a.hardTitle;
      bodyText = a.hardBody;
      extra = smallerStep && (
        <p className="rounded-2xl bg-(--surface-alt) px-4 py-3">
          <span className="text-sm text-(--muted)">{a.tryInstead}: </span>
          <span className="font-semibold">{smallerStep}</span>
        </p>
      );
      actions = (
        <>
          {smallerStep && (
            <button
              type="button"
              onClick={() => onContinue(draftFrom(session, { action: smallerStep, plannedMinutes: 2 }))}
              className={btnPrimary}
            >
              {a.trySmaller}
            </button>
          )}
          {home(a.finish)}
        </>
      );
      break;
    case 'different':
      title = a.differentTitle;
      bodyText = a.differentBody;
      actions = (
        <>
          <button type="button" onClick={() => onContinue({ ...draftFrom(session), action: '', actionFor: '' })} className={btnPrimary}>
            {a.chooseOther}
          </button>
          {home(a.finish)}
        </>
      );
      break;
    case 'stopped':
      title = a.stoppedTitle;
      bodyText = a.stoppedBody;
      actions = home(a.finish);
      break;
    case 'interrupted':
      title = a.interruptedTitle;
      bodyText = a.interruptedBody;
      actions = (
        <>
          <button type="button" onClick={() => onContinue(draftFrom(session))} className={btnPrimary}>
            {a.again}
          </button>
          {home(a.finish)}
        </>
      );
      break;
    case 'rescheduled':
      title = a.rescheduledTitle;
      bodyText = a.rescheduledBody(session.rescheduledFor ? formatDate(session.rescheduledFor) : '');
      actions = home(a.finish);
      break;
    case 'done':
      extra = next && (
        <p className="rounded-2xl bg-(--surface-alt) px-4 py-3">
          <span className="text-sm text-(--muted)">{a.nextLabel}: </span>
          <span className="font-semibold">{next}</span>
        </p>
      );
      actions = (
        <>
          {next && (
            <button type="button" onClick={() => onContinue(draftFrom(session, { action: next }))} className={btnPrimary}>
              {a.next}
            </button>
          )}
          {home(a.finish)}
        </>
      );
      break;
    default:
      // No action this time.
      title = a.skippedTitle;
      bodyText = a.skippedBody;
      actions = home(text.journal.newSession);
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="breaker-after-heading" className={`${card} flex flex-col items-center gap-4 text-center`}>
        {session.outcome === 'done' && (
          <div
            aria-hidden="true"
            className={`btn-glow flex h-20 w-20 items-center justify-center rounded-full text-4xl text-(--on-accent) ${animate ? 'bloom-enter' : ''}`}
          >
            ✓
          </div>
        )}
        <h2 id="breaker-after-heading" ref={headingRef} tabIndex={-1} className="display text-2xl font-extrabold sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-prose text-lg text-(--muted)">{bodyText}</p>
        {extra}
        <div className="flex flex-wrap justify-center gap-2">{actions}</div>
      </section>
      <JournalForm session={session} text={text} />
    </div>
  );
}

/** The optional reflection, saved with the session in the Journal. */
function JournalForm({ session, text }: { session: BreakerSession; text: BreakerText }) {
  const { t, locale } = useI18n();
  const j = text.journal;
  const [noticed, setNoticed] = useState(session.reflection ?? '');
  const [nextIntent, setNextIntent] = useState(session.nextIntent ?? '');
  const hadPractice = session.practiceCompleted !== undefined;
  const [keep, setKeep] = useState(Boolean(session.visualization));
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const { task, situations, feelings, scene } = session;
  // The same words that were played: composing is deterministic for the same answers.
  const composed = useMemo(() => {
    if (!hadPractice) return null;
    const feeling = task.trim() ? (analyze(task, { language: locale }).emotions[0]?.label ?? null) : null;
    return composeUnstuck(text, t, locale, { task, situations: situations ?? [], feelings: feelings ?? [], scene: scene ?? null }, feeling);
  }, [hadPractice, task, situations, feelings, scene, text, t, locale]);

  async function save() {
    if (state === 'saving') return;
    setState('saving');
    try {
      const words = hadPractice ? (keep && composed ? toSavedScript(composed) : null) : undefined;
      await saveReflection(session.id, noticed, nextIntent, words);
      setState('saved');
    } catch {
      setState('failed');
    }
  }

  const changed = () => setState((s) => (s === 'saved' ? 'idle' : s));

  return (
    <section aria-labelledby="journal-form-heading" className={`${card} flex flex-col gap-4`}>
      <div>
        <h2 id="journal-form-heading" className="text-xl font-semibold">
          <label htmlFor="journal-noticed">{j.noticed}</label>
        </h2>
        <p className="text-sm text-(--muted)">{j.optional}</p>
      </div>
      <textarea
        id="journal-noticed"
        rows={3}
        maxLength={LIMITS.long}
        value={noticed}
        onChange={(e) => {
          setNoticed(e.target.value);
          changed();
        }}
        className={field}
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="journal-next" className={label}>
          {j.nextIntent}
        </label>
        <input
          id="journal-next"
          maxLength={LIMITS.short}
          value={nextIntent}
          onChange={(e) => {
            setNextIntent(e.target.value);
            changed();
          }}
          className={field}
        />
      </div>
      {hadPractice && (
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={keep}
            onChange={(e) => {
              setKeep(e.target.checked);
              changed();
            }}
            className={checkbox}
          />
          {j.keepScript}
        </label>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={state === 'saving'} onClick={() => void save()} className={`${btnPrimary} min-h-12 px-8`}>
          {state === 'saving' ? j.saving : j.save}
        </button>
        <p role="status" className={state === 'failed' ? 'font-medium text-(--danger)' : 'font-medium'}>
          {state === 'saved' ? `✓ ${j.saved}` : state === 'failed' ? j.failed : ''}
        </p>
      </div>
      {composed && (
        <SaveToLibrary
          practice={{ id: 'custom', icon: composed.icon, hues: composed.hues, lengths: COMPOSED_LENGTHS, script: composed.script }}
          minutes={5}
          details={{
            scene: composed.scene,
            goal: GOAL_FOR_FEELING[feelings?.[0] ?? 'calm'],
            feeling: feelings?.[0],
            action: session.action || undefined,
          }}
        />
      )}
    </section>
  );
}
