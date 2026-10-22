import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useI18n } from '../i18n';
import {
  BREAKER_TEXT,
  draftFrom,
  EMPTY_BREAKER_DRAFT,
  FOCUS_LENGTHS,
  focusedSeconds,
  formatDuration,
  LIMITS,
  nextStep,
  OBSTACLE_IDS,
  OUTCOMES,
  previousWhy,
  smaller,
  sortObstacles,
  suggest,
  suggestionBasis,
  unfinished,
  type BreakerDraft,
  type BreakerOutcome,
  type BreakerText,
  type ObstacleId,
} from '../lib/breaker';
import { addMinutes, finishSession, pauseSession, resumeSession, startSession } from '../lib/breaker/store';
import { db } from '../lib/db';
import { formatClock } from '../lib/session';
import type { BreakerSession } from '../lib/types';
import { BreakerProgress } from './BreakerProgress';
import { btnGhost, btnPrimary, btnSecondary, card, toggle } from './ui';

type Screen =
  | { kind: 'flow' }
  | { kind: 'timer'; id: string }
  | { kind: 'reflect'; id: string; preset?: BreakerOutcome }
  | { kind: 'after'; id: string };

const NO_SESSIONS: BreakerSession[] = [];
const field =
  'field w-full rounded-2xl border border-(--border) bg-(--surface-strong) p-3 leading-relaxed transition-shadow';
const label = 'font-semibold';

interface Props {
  draft: BreakerDraft;
  onDraftChange: (draft: BreakerDraft) => void;
  animate: boolean;
}

/**
 * Procrastination Breaker: from a task someone keeps putting off to one small step, a focus timer and an honest
 * record of how it went. Everything runs and is saved on the device.
 */
export default function Breaker({ draft, onDraftChange, animate }: Props) {
  const { locale, t } = useI18n();
  const text = BREAKER_TEXT[locale];
  const sessions = useLiveQuery(() => db.breakerSessions.orderBy('createdAt').reverse().toArray(), []) ?? NO_SESSIONS;
  const [tab, setTab] = useState<'start' | 'progress'>('start');
  const [screen, setScreen] = useState<Screen>({ kind: 'flow' });
  const [busy, setBusy] = useState(false);
  const active = sessions.find((s) => s.status === 'active');
  const formatDate = useMemo(
    () => (iso: string) =>
      new Intl.DateTimeFormat(t.htmlLang, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)),
    [t.htmlLang],
  );

  function show(next: Screen) {
    setTab('start');
    setScreen(next);
    window.scrollTo(0, 0);
  }

  /** Saves the session and opens its timer, or goes straight to rescheduling when resting instead. */
  async function start(from: BreakerDraft, running = true) {
    if (busy) return;
    setBusy(true);
    try {
      const help = suggest(text, from.task, from.obstacles, from.minutesAvailable).help.join(' ');
      const session = await startSession(from, help, running);
      onDraftChange(EMPTY_BREAKER_DRAFT);
      show(running ? { kind: 'timer', id: session.id } : { kind: 'reflect', id: session.id, preset: 'rescheduled' });
    } finally {
      setBusy(false);
    }
  }

  function continueWith(next: BreakerDraft) {
    onDraftChange(next);
    show({ kind: 'flow' });
  }

  function openActive(session: BreakerSession) {
    show({ kind: 'timer', id: session.id });
  }

  let body: ReactNode;
  if (tab === 'progress') {
    body = (
      <BreakerProgress
        sessions={sessions}
        text={text}
        formatDate={formatDate}
        onResume={(s) => continueWith(draftFrom(s, 1))}
        onSimplify={(s) => continueWith(draftFrom(s, 3, { action: smaller(text, s.task, s.action) ?? s.action }))}
        onOpenActive={openActive}
        onStartFirst={() => continueWith(EMPTY_BREAKER_DRAFT)}
      />
    );
  } else if (screen.kind === 'timer') {
    body = (
      <Timer
        id={screen.id}
        text={text}
        animate={animate}
        onReflect={(preset) => show({ kind: 'reflect', id: screen.id, preset })}
        onMissing={() => show({ kind: 'flow' })}
      />
    );
  } else if (screen.kind === 'reflect') {
    body = (
      <Reflect
        id={screen.id}
        preset={screen.preset}
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
        onStart={(d) => void start(d)}
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
        formatDate={formatDate}
        onStart={(d) => void start(d)}
        onRest={(d) => void start(d, false)}
        onOpenActive={openActive}
        onResume={(s) => continueWith(draftFrom(s, 1))}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="display tagline text-sm font-extrabold text-(--muted) uppercase">{text.title}</p>
        <div role="group" aria-label={text.title} className="flex gap-1 rounded-full border border-(--border) bg-(--surface-strong) p-1">
          {(['start', 'progress'] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
              className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold ${
                tab === id ? 'btn-glow text-(--on-accent)' : 'text-(--muted) hover:bg-(--surface-alt) hover:text-(--text)'
              }`}
            >
              {text.tabs[id]}
            </button>
          ))}
        </div>
      </div>
      {body}
    </div>
  );
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

function obstacleNames(text: BreakerText, obstacles: ObstacleId[], other?: string): string {
  return sortObstacles(obstacles)
    .map((id) => (id === 'other' && other ? other : text.obstacles[id].label))
    .join(' · ');
}

// ---------------------------------------------------------------------------------------------------------------
// The guided flow: task → obstacle → why → first step → if–then plan → ready.

interface FlowProps {
  draft: BreakerDraft;
  set: (draft: BreakerDraft) => void;
  text: BreakerText;
  sessions: BreakerSession[];
  active: BreakerSession | undefined;
  busy: boolean;
  formatDate: (iso: string) => string;
  onStart: (draft: BreakerDraft) => void;
  onRest: (draft: BreakerDraft) => void;
  onOpenActive: (session: BreakerSession) => void;
  onResume: (session: BreakerSession) => void;
}

function Flow({ draft, set, text, sessions, active, busy, formatDate, onStart, onRest, onOpenActive, onResume }: FlowProps) {
  const headingRef = useFocusOnChange(draft.step);
  const [error, setError] = useState('');
  const suggestion = useMemo(
    () => suggest(text, draft.task, draft.obstacles, draft.minutesAvailable),
    [text, draft.task, draft.obstacles, draft.minutesAvailable],
  );

  function go(step: number, changes: Partial<BreakerDraft> = {}) {
    setError('');
    let next = { ...draft, ...changes, step };
    if (step === 2 && !next.why) next = { ...next, why: previousWhy(sessions, next.task) ?? '' };
    // Arriving at the first step: suggest one, unless the person already chose one for these answers.
    if (step === 3 && next.actionFor !== suggestionBasis(next)) {
      const options = suggest(text, next.task, next.obstacles, next.minutesAvailable).options;
      next = { ...next, action: options[0], optionIndex: 0, actionFor: suggestionBasis(next) };
    }
    set(next);
    window.scrollTo(0, 0);
  }

  const heading = (title: string) => (
    <h2 ref={headingRef} tabIndex={-1} className="display text-2xl leading-tight font-extrabold sm:text-3xl">
      {title}
    </h2>
  );
  const errorText = error && (
    <p id="breaker-error" role="alert" className="font-medium text-(--danger)">
      {error}
    </p>
  );
  const nav = (onNext: () => void, nextLabel = text.next, skip?: () => void) => (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={onNext} className={`${btnPrimary} min-h-12 px-7`}>
        {nextLabel}
      </button>
      {skip && (
        <button type="button" onClick={skip} className={btnSecondary}>
          {text.skip}
        </button>
      )}
      <button type="button" onClick={() => go(draft.step - 1)} className={btnGhost}>
        {text.back}
      </button>
    </div>
  );

  if (draft.step === 0) {
    const open = unfinished(sessions);
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
        <form
          noValidate
          className={`${card} fade-up flex flex-col gap-5`}
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.task.trim()) {
              setError(text.entry.needTask);
              document.getElementById('breaker-task')?.focus();
              return;
            }
            go(1);
          }}
        >
          <div className="flex flex-col gap-2">
            {heading(text.entry.title)}
            <p className="text-lg text-(--muted)">{text.entry.body}</p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="breaker-task" className={label}>
              {text.entry.label}
            </label>
            <textarea
              id="breaker-task"
              rows={3}
              maxLength={LIMITS.task}
              value={draft.task}
              placeholder={text.entry.placeholder}
              onChange={(e) => set({ ...draft, task: e.target.value })}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'breaker-error' : undefined}
              className={`${field} text-lg`}
            />
          </div>
          {errorText}
          <button type="submit" className={`${btnPrimary} min-h-14 w-full px-8 text-lg sm:w-auto sm:self-start`}>
            {text.entry.start}
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
                    <p className="font-semibold break-words">{s.task}</p>
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

  let content: ReactNode;
  if (draft.step === 1) {
    const toggleObstacle = (id: ObstacleId) =>
      set({
        ...draft,
        obstacles: draft.obstacles.includes(id) ? draft.obstacles.filter((o) => o !== id) : [...draft.obstacles, id],
      });
    content = (
      <>
        <div className="flex flex-col gap-2">
          {heading(text.obstacle.title)}
          <p className="text-(--muted)">{text.obstacle.hint}</p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {OBSTACLE_IDS.map((id) => {
            const pressed = draft.obstacles.includes(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => toggleObstacle(id)}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-start transition-colors ${
                    pressed
                      ? 'border-(--accent) bg-(--accent-soft) ring-2 ring-(--accent-soft)'
                      : 'border-(--border) bg-(--surface-strong) hover:bg-(--surface-alt)'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                      pressed ? 'btn-glow border-transparent text-(--on-accent)' : 'border-(--border)'
                    }`}
                  >
                    {pressed ? '✓' : ''}
                  </span>
                  {text.obstacles[id].label}
                </button>
              </li>
            );
          })}
        </ul>
        {draft.obstacles.includes('other') && (
          <div className="flex flex-col gap-2">
            <label htmlFor="breaker-other" className={label}>
              {text.obstacle.otherLabel}
            </label>
            <input
              id="breaker-other"
              maxLength={LIMITS.short}
              value={draft.otherObstacle}
              onChange={(e) => set({ ...draft, otherObstacle: e.target.value })}
              className={field}
            />
          </div>
        )}
        {errorText}
        {nav(() => (draft.obstacles.length ? go(2) : setError(text.obstacle.need)))}
      </>
    );
  } else if (draft.step === 2) {
    const fromBefore = draft.why !== '' && draft.why === previousWhy(sessions, draft.task);
    content = (
      <>
        <div className="flex flex-col gap-2">
          {heading(text.vision.title)}
          <p className="text-(--muted)">{text.vision.body}</p>
        </div>
        <p className="rounded-2xl bg-(--surface-alt) px-4 py-3">
          <span className="text-sm text-(--muted)">{text.ready.task}: </span>
          <span className="font-semibold break-words">{draft.task}</span>
        </p>
        <div className="flex flex-col gap-2">
          <label htmlFor="breaker-why" className={label}>
            {text.vision.whyLabel}
          </label>
          <input
            id="breaker-why"
            maxLength={LIMITS.short}
            value={draft.why}
            placeholder={text.vision.whyPlaceholder}
            onChange={(e) => set({ ...draft, why: e.target.value })}
            aria-describedby={fromBefore ? 'breaker-why-note' : undefined}
            className={field}
          />
          {fromBefore && (
            <p id="breaker-why-note" className="text-sm text-(--muted)">
              {text.vision.fromBefore}
            </p>
          )}
        </div>
        <div className="relative overflow-hidden rounded-3xl p-5 text-center">
          <div aria-hidden="true" className="aura inset-0 opacity-70" />
          <div className="relative flex flex-col gap-3">
            <p className="display text-lg font-bold">{text.vision.imagine}</p>
            <label htmlFor="breaker-vision" className="text-sm font-semibold text-(--muted)">
              {text.vision.visionLabel}
            </label>
            <textarea
              id="breaker-vision"
              rows={2}
              maxLength={LIMITS.short}
              value={draft.vision}
              placeholder={text.vision.visionPlaceholder}
              onChange={(e) => set({ ...draft, vision: e.target.value })}
              className={`${field} text-center`}
            />
          </div>
        </div>
        {nav(() => go(3), text.next, () => go(3, { why: '', vision: '' }))}
      </>
    );
  } else if (draft.step === 3) {
    const options = suggestion.options;
    const smallerStep = smaller(text, draft.task, draft.action);
    const short = draft.obstacles.includes('time');
    content = (
      <>
        {heading(text.action.title)}
        <section aria-labelledby="breaker-help" className="flex flex-col gap-2 rounded-2xl bg-(--surface-alt) p-4">
          <h3 id="breaker-help" className="font-semibold">
            {text.action.mayHelp}
          </h3>
          <ul className="flex list-disc flex-col gap-1 ps-5">
            {suggestion.help.map((help) => (
              <li key={help}>{help}</li>
            ))}
          </ul>
          {draft.obstacles.includes('motivation') && draft.why.trim() && (
            <p className="font-medium">{text.action.remember(draft.why.trim())}</p>
          )}
        </section>

        {suggestion.breakdown && (
          <section aria-labelledby="breaker-breakdown" className="flex flex-col gap-2">
            <h3 id="breaker-breakdown" className="font-semibold">
              {text.action.breakdown}
            </h3>
            <ol className="flex list-decimal flex-col gap-1 ps-5">
              {suggestion.breakdown.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {short && (
          <fieldset>
            <legend className={`${label} mb-2`}>{text.action.timeQuestion}</legend>
            <div className="flex flex-wrap gap-2">
              {FOCUS_LENGTHS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={(draft.minutesAvailable ?? 2) === m}
                  onClick={() => {
                    const next = { ...draft, minutesAvailable: m, plannedMinutes: m };
                    const first = suggest(text, next.task, next.obstacles, m).options[0];
                    set({ ...next, action: first, optionIndex: 0, actionFor: suggestionBasis(next) });
                  }}
                  className={toggle((draft.minutesAvailable ?? 2) === m)}
                >
                  {text.mins(m)}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {draft.obstacles.includes('overwhelmed') && (
          <div className="flex flex-col gap-2">
            <label htmlFor="breaker-aside" className={label}>
              {text.action.setAsideLabel}
            </label>
            <textarea
              id="breaker-aside"
              rows={2}
              maxLength={LIMITS.long}
              value={draft.setAside}
              placeholder={text.action.setAsidePlaceholder}
              onChange={(e) => set({ ...draft, setAside: e.target.value })}
              className={field}
            />
          </div>
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
            onChange={(e) => set({ ...draft, action: e.target.value })}
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
        {errorText}
        {nav(() => (draft.action.trim() ? go(4) : setError(text.action.need)), text.action.confirm)}
        {draft.obstacles.includes('tired') && (
          <button type="button" disabled={busy} onClick={() => onRest(draft)} className={`${btnGhost} self-start underline`}>
            {text.action.rest}
          </button>
        )}
      </>
    );
  } else if (draft.step === 4) {
    content = (
      <>
        <div className="flex flex-col gap-2">
          {heading(text.plan.title)}
          <p className="text-(--muted)">{text.plan.body}</p>
        </div>
        <fieldset>
          <legend className={`${label} mb-2`}>{text.plan.suggestions}</legend>
          <ul className="flex flex-col gap-2">
            {suggestion.plans.map((plan) => (
              <li key={plan}>
                <button
                  type="button"
                  aria-pressed={draft.plan === plan}
                  onClick={() => set({ ...draft, plan })}
                  className={`min-h-11 w-full rounded-2xl border px-4 py-2 text-start transition-colors ${
                    draft.plan === plan
                      ? 'border-(--accent) bg-(--accent-soft)'
                      : 'border-(--border) bg-(--surface-strong) hover:bg-(--surface-alt)'
                  }`}
                >
                  {plan}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
        <div className="flex flex-col gap-2">
          <label htmlFor="breaker-plan" className={label}>
            {text.plan.label}
          </label>
          <textarea
            id="breaker-plan"
            rows={2}
            maxLength={LIMITS.short}
            value={draft.plan}
            placeholder={text.plan.placeholder}
            onChange={(e) => set({ ...draft, plan: e.target.value })}
            className={field}
          />
        </div>
        {nav(() => go(5), text.next, () => go(5, { plan: '' }))}
      </>
    );
  } else {
    content = <Ready draft={draft} set={set} text={text} heading={heading} busy={busy} onStart={onStart} onBack={() => go(4)} />;
  }

  return (
    <section className={`${card} flex flex-col gap-5`} aria-label={text.title}>
      <StepTrail step={draft.step} text={text} onGo={(step) => go(step)} />
      {content}
    </section>
  );
}

/** Where you are in the flow. Earlier steps can be revisited; answers are kept. */
function StepTrail({ step, text, onGo }: { step: number; text: BreakerText; onGo: (step: number) => void }) {
  return (
    <nav aria-label={text.stepOf(step + 1, text.steps.length)}>
      <ol className="flex w-full items-center gap-1.5">
        {text.steps.map((name, i) => {
          const done = i < step;
          const current = i === step;
          const dot = (
            <>
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  current ? 'btn-glow text-(--on-accent)' : done ? 'bg-(--accent-soft) text-(--accent)' : 'bg-(--track) text-(--muted)'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className="sr-only">{name}</span>
            </>
          );
          return (
            <li
              key={name}
              aria-current={current ? 'step' : undefined}
              className={`flex items-center gap-1.5 ${i < text.steps.length - 1 ? 'flex-1' : ''}`}
            >
              {done ? (
                <button type="button" onClick={() => onGo(i)} className="flex items-center rounded-full">
                  {dot}
                </button>
              ) : (
                <span className="flex items-center gap-1.5">{dot}</span>
              )}
              {i < text.steps.length - 1 && <span aria-hidden="true" className="h-px min-w-1.5 flex-1 bg-(--border)" />}
            </li>
          );
        })}
      </ol>
      {/* Screen readers hear the step names from the list above. */}
      <p aria-hidden="true" className="mt-2 text-sm font-semibold text-(--muted)">
        {text.stepOf(step + 1, text.steps.length)} · {text.steps[step]}
      </p>
    </nav>
  );
}

function Ready({
  draft,
  set,
  text,
  heading,
  busy,
  onStart,
  onBack,
}: {
  draft: BreakerDraft;
  set: (draft: BreakerDraft) => void;
  text: BreakerText;
  heading: (title: string) => ReactNode;
  busy: boolean;
  onStart: (draft: BreakerDraft) => void;
  onBack: () => void;
}) {
  const preset = (FOCUS_LENGTHS as readonly number[]).includes(draft.plannedMinutes);
  const [custom, setCustom] = useState(!preset);
  const [error, setError] = useState('');
  const rows: [string, string | undefined][] = [
    [text.ready.task, draft.task],
    [text.ready.action, draft.action],
    [text.ready.why, draft.why.trim() || undefined],
    [text.ready.obstacle, obstacleNames(text, draft.obstacles, draft.otherObstacle.trim())],
    [text.ready.plan, draft.plan.trim() || undefined],
  ];

  function begin() {
    const m = draft.plannedMinutes;
    if (!Number.isInteger(m) || m < 1 || m > LIMITS.minutes) {
      setError(text.ready.customLabel);
      document.getElementById('breaker-minutes')?.focus();
      return;
    }
    onStart(draft);
  }

  return (
    <>
      {heading(text.ready.title)}
      <dl className="flex flex-col gap-3 rounded-2xl bg-(--surface-alt) p-4">
        {rows
          .filter((row): row is [string, string] => Boolean(row[1]))
          .map(([name, value], i) => (
            <div key={name}>
              <dt className="text-sm text-(--muted)">{name}</dt>
              <dd className={`break-words ${i === 1 ? 'display text-xl font-bold' : 'font-medium'}`}>{value}</dd>
            </div>
          ))}
      </dl>
      <fieldset>
        <legend className={`${label} mb-2`}>{text.ready.howLong}</legend>
        <div className="flex flex-wrap gap-2">
          {FOCUS_LENGTHS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={!custom && draft.plannedMinutes === m}
              onClick={() => {
                setCustom(false);
                setError('');
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
          <div className="mt-3 flex flex-col gap-1">
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
              aria-invalid={error ? true : undefined}
              className={`${field} w-32`}
            />
          </div>
        )}
      </fieldset>
      {error && (
        <p role="alert" className="font-medium text-(--danger)">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={busy} onClick={begin} className={`${btnPrimary} min-h-14 px-10 text-lg`}>
          <span aria-hidden="true">▶</span>
          {text.ready.start}
        </button>
        <button type="button" onClick={onBack} className={btnGhost}>
          {text.back}
        </button>
      </div>
    </>
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
  onMissing,
}: {
  id: string;
  text: BreakerText;
  animate: boolean;
  onReflect: (preset?: BreakerOutcome) => void;
  onMissing: () => void;
}) {
  const session = useSession(id, onMissing);
  const [now, setNow] = useState(Date.now);
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

  async function stop(preset?: BreakerOutcome) {
    await pauseSession(session!);
    onReflect(preset);
  }

  const r = 88;
  const circumference = 2 * Math.PI * r;
  const share = Math.min(1, focused / total);

  return (
    <section aria-labelledby="breaker-timer-heading" className={`${card} flex flex-col items-center gap-5 text-center`}>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-(--muted) break-words">{session.task}</p>
        <h2 id="breaker-timer-heading" ref={headingRef} tabIndex={-1} className="display text-2xl leading-snug font-extrabold break-words">
          {session.action}
        </h2>
      </div>

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
        <div
          role="timer"
          aria-label={text.timer.progressLabel}
          className="relative flex flex-col items-center"
        >
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
          <span className="font-semibold">{text.ready.plan}: </span>
          {session.plan}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {timeUp ? (
          <>
            <button type="button" onClick={() => onReflect()} className={`${btnPrimary} min-h-12 px-7`}>
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
            <button type="button" onClick={() => void stop('done')} className={`${btnPrimary} min-h-12 px-7`}>
              <span aria-hidden="true">✓</span>
              {text.timer.done}
            </button>
            <button type="button" onClick={() => void stop()} className={btnGhost}>
              {text.timer.stop}
            </button>
          </>
        )}
      </div>
      <p className="text-sm text-(--muted)">{text.timer.note}</p>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Reflection, then a next step that fits what happened.

function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function Reflect({
  id,
  preset,
  text,
  onSaved,
  onMissing,
}: {
  id: string;
  preset?: BreakerOutcome;
  text: BreakerText;
  onSaved: () => void;
  onMissing: () => void;
}) {
  const session = useSession(id, onMissing);
  const [outcome, setOutcome] = useState<BreakerOutcome | undefined>(preset);
  const [note, setNote] = useState('');
  const [when, setWhen] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const headingRef = useFocusOnLoad(Boolean(session));

  if (!session) return null;

  async function save() {
    if (saving) return;
    if (!outcome) return setError(text.reflect.need);
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
      await finishSession(session!, outcome, note, rescheduledFor);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="breaker-reflect-heading" className={`${card} flex flex-col gap-5`}>
      <div className="flex flex-col gap-1">
        <h2 id="breaker-reflect-heading" ref={headingRef} tabIndex={-1} className="display text-2xl leading-tight font-extrabold sm:text-3xl">
          {text.reflect.title}
        </h2>
        {session.focusedSeconds > 0 && (
          <p className="text-(--muted)">{text.reflect.focused(formatDuration(text, session.focusedSeconds))}</p>
        )}
      </div>
      <p className="rounded-2xl bg-(--surface-alt) px-4 py-3 font-semibold break-words">{session.action}</p>
      <fieldset>
        <legend className={`${label} mb-2 text-lg`}>{text.reflect.question}</legend>
        <div className="flex flex-col gap-2">
          {OUTCOMES.map((o) => (
            <label
              key={o}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-(--border) bg-(--surface-strong) px-4 py-2 has-[:checked]:border-(--accent) has-[:checked]:bg-(--accent-soft)"
            >
              <input
                type="radio"
                name="breaker-outcome"
                value={o}
                checked={outcome === o}
                onChange={() => {
                  setOutcome(o);
                  setError('');
                }}
                className="h-5 w-5 shrink-0 accent-(--accent)"
              />
              {text.reflect.outcomes[o]}
            </label>
          ))}
        </div>
      </fieldset>
      {outcome === 'rescheduled' && (
        <div className="flex flex-col gap-2">
          <label htmlFor="breaker-when" className={label}>
            {text.reflect.when}
          </label>
          <input
            id="breaker-when"
            type="datetime-local"
            min={toLocalInput(new Date())}
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className={`${field} sm:w-72`}
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label htmlFor="breaker-note" className={label}>
          {text.reflect.noteLabel}
        </label>
        <textarea
          id="breaker-note"
          rows={3}
          maxLength={LIMITS.long}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={field}
        />
      </div>
      {error && (
        <p role="alert" className="font-medium text-(--danger)">
          {error}
        </p>
      )}
      <button type="button" disabled={saving} onClick={() => void save()} className={`${btnPrimary} min-h-12 self-start px-8`}>
        {saving ? text.reflect.saving : text.reflect.save}
      </button>
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
  const next = nextStep(text, session.task, session.action);
  const smallerStep = smaller(text, session.task, session.action);
  let title = a.doneTitle;
  let bodyText = a.doneBody;
  let extra: ReactNode = null;
  let actions: ReactNode;
  const home = (label: string) => (
    <button type="button" onClick={onHome} className={btnGhost}>
      {label}
    </button>
  );

  switch (session.outcome) {
    case 'progress':
      title = a.progressTitle;
      bodyText = a.progressBody;
      actions = (
        <>
          <button type="button" disabled={busy} onClick={() => onStart(draftFrom(session, 5, { plannedMinutes: 10 }))} className={btnPrimary}>
            {a.keepGoing}
          </button>
          {home(a.pause)}
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
              onClick={() => onContinue(draftFrom(session, 5, { action: smallerStep, plannedMinutes: 2 }))}
              className={btnPrimary}
            >
              {a.trySmaller}
            </button>
          )}
          <button type="button" onClick={() => onContinue(EMPTY_BREAKER_DRAFT)} className={btnSecondary}>
            {a.restart}
          </button>
        </>
      );
      break;
    case 'interrupted':
      title = a.interruptedTitle;
      bodyText = a.interruptedBody;
      extra = <p className="rounded-2xl bg-(--surface-alt) px-4 py-3 font-medium">{a.interruptedPlan}</p>;
      actions = (
        <>
          <button
            type="button"
            onClick={() => onContinue(draftFrom(session, 5, { plan: a.interruptedPlan }))}
            className={btnPrimary}
          >
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
    default:
      extra = next && (
        <p className="rounded-2xl bg-(--surface-alt) px-4 py-3">
          <span className="text-sm text-(--muted)">{a.nextLabel}: </span>
          <span className="font-semibold">{next}</span>
        </p>
      );
      actions = (
        <>
          {next && (
            <button
              type="button"
              onClick={() => onContinue(draftFrom(session, 5, { action: next, plan: session.plan ?? '' }))}
              className={btnPrimary}
            >
              {a.next}
            </button>
          )}
          {home(a.finish)}
        </>
      );
  }

  return (
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
      <p role="status" className="text-sm text-(--muted)">
        {a.saved}
      </p>
      <div className="flex flex-wrap justify-center gap-2">{actions}</div>
    </section>
  );
}
