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
  OUTCOMES,
  QUICK_OBSTACLES,
  smaller,
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
      const help = suggest(text, from.task, from.obstacles).help.join(' ');
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
        onResume={(s) => continueWith(draftFrom(s))}
        onSimplify={(s) => continueWith(draftFrom(s, { action: smaller(text, s.task, s.action) ?? s.action }))}
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
        onDone={() => show({ kind: 'after', id: screen.id })}
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
        onResume={(s) => continueWith(draftFrom(s))}
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

// ---------------------------------------------------------------------------------------------------------------
// The guided flow, kept short on purpose: the task (and, optionally, what makes it hard), then one tiny step to start.

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
  const suggestion = useMemo(() => suggest(text, draft.task, draft.obstacles), [text, draft.task, draft.obstacles]);

  function go(step: number) {
    setError('');
    let next = { ...draft, step };
    // Arriving at the step screen: suggest one, unless the person already chose one for these answers.
    if (step === 1 && next.actionFor !== suggestionBasis(next)) {
      const options = suggest(text, next.task, next.obstacles).options;
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

  if (draft.step === 0) {
    const open = unfinished(sessions);
    const toggleObstacle = (id: ObstacleId) =>
      set({
        ...draft,
        obstacles: draft.obstacles.includes(id) ? draft.obstacles.filter((o) => o !== id) : [...draft.obstacles, id],
      });
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
              rows={2}
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
          <fieldset>
            <legend className={label}>{text.obstacle.title}</legend>
            <p className="mb-2 text-sm text-(--muted)">{text.obstacle.hint}</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_OBSTACLES.map((id) => {
                const pressed = draft.obstacles.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => toggleObstacle(id)}
                    className={`${toggle(pressed)} text-start text-sm`}
                  >
                    {pressed && <span aria-hidden="true">✓</span>}
                    {text.obstacles[id].label}
                  </button>
                );
              })}
            </div>
          </fieldset>
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

  const options = suggestion.options;
  const smallerStep = smaller(text, draft.task, draft.action);

  function begin() {
    if (!draft.action.trim()) {
      setError(text.action.need);
      document.getElementById('breaker-action')?.focus();
      return;
    }
    onStart(draft);
  }

  return (
    <section className={`${card} fade-up flex flex-col gap-5`} aria-label={text.title}>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-(--muted) break-words">{draft.task}</p>
        {heading(text.action.title)}
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

      <fieldset>
        <legend className={`${label} mb-2`}>{text.ready.howLong}</legend>
        <div className="flex flex-wrap gap-2">
          {FOCUS_LENGTHS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={draft.plannedMinutes === m}
              onClick={() => set({ ...draft, plannedMinutes: m })}
              className={toggle(draft.plannedMinutes === m)}
            >
              {text.ready.lengths[m]}
            </button>
          ))}
        </div>
      </fieldset>

      {errorText}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={busy} onClick={begin} className={`${btnPrimary} min-h-14 px-10 text-lg`}>
          <span aria-hidden="true">▶</span>
          {text.ready.start}
        </button>
        <button type="button" onClick={() => go(0)} className={btnGhost}>
          {text.back}
        </button>
      </div>
      {draft.obstacles.includes('tired') && (
        <button type="button" disabled={busy} onClick={() => onRest(draft)} className={`${btnGhost} self-start underline`}>
          {text.action.rest}
        </button>
      )}
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
  onReflect: (preset?: BreakerOutcome) => void;
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
    await finishSession(session!, 'done', '', undefined);
    onDone();
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
          <span className="font-semibold">{text.progress.plan}: </span>
          {session.plan}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {timeUp ? (
          <>
            <button type="button" disabled={saving} onClick={() => void done()} className={`${btnPrimary} min-h-12 px-7`}>
              <span aria-hidden="true">✓</span>
              {text.timer.done}
            </button>
            <button type="button" onClick={() => onReflect()} className={btnSecondary}>
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
            <button type="button" disabled={saving} onClick={() => void done()} className={`${btnPrimary} min-h-12 px-7`}>
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
  const [later, setLater] = useState(preset === 'rescheduled');
  const [when, setWhen] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const headingRef = useFocusOnLoad(Boolean(session));

  if (!session) return null;

  /** One tap saves; only rescheduling asks for something more, a date. */
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
      await finishSession(session!, outcome, '', rescheduledFor);
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
      <div role="group" aria-labelledby="breaker-question" className="flex flex-col gap-2">
        <p id="breaker-question" className={`${label} text-lg`}>
          {text.reflect.question}
        </p>
        {OUTCOMES.map((o) => (
          <button
            key={o}
            type="button"
            disabled={saving}
            aria-expanded={o === 'rescheduled' ? later : undefined}
            onClick={() => (o === 'rescheduled' ? setLater(true) : void save(o))}
            className={`${toggle(o === 'rescheduled' && later)} min-h-12 w-full justify-start! rounded-2xl! text-start`}
          >
            {text.reflect.outcomes[o]}
          </button>
        ))}
      </div>
      {later && (
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
      )}
      {error && (
        <p role="alert" className="font-medium text-(--danger)">
          {error}
        </p>
      )}
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
          <button type="button" disabled={busy} onClick={() => onStart(draftFrom(session, { plannedMinutes: 10 }))} className={btnPrimary}>
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
              onClick={() => onContinue(draftFrom(session, { action: smallerStep, plannedMinutes: 2 }))}
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
            onClick={() => onContinue(draftFrom(session, { plan: a.interruptedPlan }))}
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
              onClick={() => onContinue(draftFrom(session, { action: next, plan: session.plan ?? '' }))}
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
