import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import {
  BREAKER_TEXT,
  breakerStats,
  draftFrom,
  EMPTY_BREAKER_DRAFT,
  FEELING_IDS,
  formatDuration,
  sessionTitle,
  SITUATION_IDS,
  smaller,
  sortObstacles,
  type BreakerDraft,
  type BreakerOutcome,
  type FeelingId,
  type SituationId,
} from '../lib/breaker';
import { deleteSession, saveReflection } from '../lib/breaker/store';
import { db } from '../lib/db';
import type { BreakerSession, SavedScript } from '../lib/types';
import { btnGhost, btnPrimary, btnSecondary, card, toggle } from './ui';

const FILTERS = ['all', 'done', 'progress', 'rescheduled'] as const;
type Filter = (typeof FILTERS)[number];

const OUTCOME_ICONS: Record<BreakerOutcome, string> = {
  done: '✓', progress: '◐', hard: '↓', different: '↪', stopped: '⏸', interrupted: '⏸', rescheduled: '🗓',
};

const NO_SESSIONS: BreakerSession[] = [];
const field =
  'field w-full rounded-2xl border border-(--border) bg-(--surface-strong) p-3 leading-relaxed transition-shadow';
const select = 'min-h-11 rounded-xl border border-(--border) bg-(--surface) px-3';

interface Props {
  /** Opens Unstuck at this draft: picking a task up again, a smaller step, or a new session from an old one. */
  onContinue: (draft: BreakerDraft) => void;
  /** Opens Unstuck, where a running focus session can be reopened. */
  onOpenActive: () => void;
  /** Plays a session's visualization again. */
  onPlay: (session: BreakerSession) => void;
}

/** Unstuck sessions in the Journal, and what they add up to. Every number comes from the saved records. */
export function BreakerProgress({ onContinue, onOpenActive, onPlay }: Props) {
  const { t, locale } = useI18n();
  const text = BREAKER_TEXT[locale];
  const sessions = useLiveQuery(() => db.breakerSessions.orderBy('createdAt').reverse().toArray(), []) ?? NO_SESSIONS;
  const [filter, setFilter] = useState<Filter>('all');
  const [situation, setSituation] = useState<SituationId | ''>('');
  const [feeling, setFeeling] = useState<FeelingId | ''>('');
  const stats = breakerStats(sessions);
  const p = text.progress;
  const formatDate = useMemo(
    () => (iso: string) =>
      new Intl.DateTimeFormat(t.htmlLang, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)),
    [t.htmlLang],
  );
  const shown = sessions.filter(
    (s) =>
      (filter === 'all' || (s.status === 'finished' && s.outcome === filter)) &&
      (!situation || s.situations?.includes(situation)) &&
      (!feeling || s.feelings?.includes(feeling)),
  );

  const tiles: [string, string][] = [
    [p.stats.sessions, String(stats.sessions)],
    [p.stats.done, String(stats.done)],
    [p.stats.focus, formatDuration(text, stats.focusSeconds)],
    [p.stats.resumed, String(stats.resumed)],
  ];

  return (
    <section aria-labelledby="breaker-progress-heading" className="flex flex-col gap-5">
      <div>
        <h2 id="breaker-progress-heading" className="text-xl font-semibold">
          {p.title}
        </h2>
        <p className="text-sm text-(--muted)">{p.note}</p>
      </div>

      {sessions.length === 0 ? (
        <div className={`${card} flex flex-col items-center gap-4 text-center`}>
          <p className="text-lg">{p.empty}</p>
          <button type="button" onClick={() => onContinue(EMPTY_BREAKER_DRAFT)} className={btnPrimary}>
            {p.tryFirst}
          </button>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map(([name, value]) => (
              <div key={name} className={`${card} flex flex-col-reverse gap-1 p-4!`}>
                <dt className="text-sm text-(--muted)">{name}</dt>
                <dd className="display text-3xl font-extrabold">{value}</dd>
              </div>
            ))}
          </dl>

          <div role="group" aria-label={p.filterLabel} className="flex flex-wrap gap-2">
            {FILTERS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
                className={`${toggle(filter === id)} text-sm`}
              >
                {p.filters[id]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-wrap items-center gap-2 font-medium">
              {p.situationFilter}
              <select value={situation} onChange={(e) => setSituation(e.target.value as SituationId | '')} className={select}>
                <option value="">{p.any}</option>
                {SITUATION_IDS.map((id) => (
                  <option key={id} value={id}>
                    {text.situations[id]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-wrap items-center gap-2 font-medium">
              {p.feelingFilter}
              <select value={feeling} onChange={(e) => setFeeling(e.target.value as FeelingId | '')} className={select}>
                <option value="">{p.any}</option>
                {FEELING_IDS.map((id) => (
                  <option key={id} value={id}>
                    {text.understand.feelings[id]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {shown.length === 0 ? (
            <p className={`${card} text-(--muted)`}>{p.emptyFilter}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {shown.map((s) => (
                <SessionItem
                  key={s.id}
                  session={s}
                  formatDate={formatDate}
                  onContinue={onContinue}
                  onOpenActive={onOpenActive}
                  onPlay={onPlay}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function SessionItem({
  session: s,
  formatDate,
  onContinue,
  onOpenActive,
  onPlay,
}: {
  session: BreakerSession;
  formatDate: (iso: string) => string;
} & Props) {
  const { locale } = useI18n();
  const text = BREAKER_TEXT[locale];
  const p = text.progress;
  const [editing, setEditing] = useState(false);
  const [reflection, setReflection] = useState(s.reflection ?? '');
  const [nextIntent, setNextIntent] = useState(s.nextIntent ?? '');
  const [error, setError] = useState('');
  const active = s.status === 'active';
  const status = active ? p.inProgress : s.outcome ? text.reflect.outcomes[s.outcome] : p.noAction;
  const icon = active ? '▶' : s.outcome ? OUTCOME_ICONS[s.outcome] : '•';
  const obstacles = sortObstacles(s.obstacles)
    .map((id) => (id === 'other' && s.otherObstacle ? s.otherObstacle : text.obstacles[id].label))
    .join(' · ');
  const open = !active && s.action && s.outcome !== 'done' && s.outcome !== 'different';
  const smallerStep = s.action ? smaller(text, s.task, s.action, s.situations) : null;
  const hadPractice = s.practiceCompleted !== undefined;
  const details: [string, string | undefined][] = [
    [p.why, s.why],
    [p.plan, s.plan],
    [p.reflection, s.reflection],
    [p.nextIntent, s.nextIntent],
    [p.setAside, s.setAside],
  ];

  async function save() {
    try {
      await saveReflection(s.id, reflection, nextIntent);
      setEditing(false);
      setError('');
    } catch {
      setError(text.journal.failed);
    }
  }

  async function remove() {
    if (window.confirm(p.deleteConfirm)) await deleteSession(s.id);
  }

  return (
    <li className={`${card} flex flex-col gap-3 p-4! sm:p-5!`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold break-words">{sessionTitle(text, s)}</h3>
          <p className="text-sm text-(--muted)">
            <time dateTime={s.createdAt}>{formatDate(s.createdAt)}</time>
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--surface-strong) px-3 py-1 text-sm font-medium">
          <span aria-hidden="true">{icon}</span>
          {status}
        </span>
      </div>
      {s.situations && s.situations.length > 0 && s.task.trim() && (
        <p className="text-sm text-(--muted)">{s.situations.map((id) => text.situations[id]).join(' ')}</p>
      )}
      {s.feelings && s.feelings.length > 0 && (
        <p className="text-sm">
          <span className="text-(--muted)">{p.feelingFilter}: </span>
          {s.feelings.map((id) => text.understand.feelings[id]).join(' · ')}
        </p>
      )}
      {s.action && (
        <p>
          <span className="text-sm text-(--muted)">{p.action}: </span>
          <span className="font-medium break-words">{s.action}</span>
        </p>
      )}
      {obstacles && (
        <p className="text-sm text-(--muted)">
          {p.obstacles}: {obstacles}
        </p>
      )}
      {s.action && (
        <p className="text-sm text-(--muted)">
          {p.planned(text.mins(s.plannedMinutes), formatDuration(text, s.focusedSeconds))}
          {s.rescheduledFor && ` · ${text.entry.plannedFor(formatDate(s.rescheduledFor))}`}
        </p>
      )}
      {hadPractice && (
        <p className="text-sm text-(--muted)">
          {p.visualization}: {s.practiceCompleted ? p.finishedPractice : p.leftEarly}
        </p>
      )}

      {editing ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-(--border) p-3">
          <label htmlFor={`noticed-${s.id}`} className="text-sm font-semibold">
            {text.journal.noticed}
          </label>
          <textarea id={`noticed-${s.id}`} rows={3} value={reflection} onChange={(e) => setReflection(e.target.value)} className={field} />
          <label htmlFor={`next-${s.id}`} className="text-sm font-semibold">
            {text.journal.nextIntent}
          </label>
          <input id={`next-${s.id}`} value={nextIntent} onChange={(e) => setNextIntent(e.target.value)} className={field} />
          {error && (
            <p role="alert" className="font-medium text-(--danger)">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void save()} className={btnPrimary}>
              {p.save}
            </button>
            <button type="button" onClick={() => setEditing(false)} className={btnGhost}>
              {p.cancel}
            </button>
          </div>
        </div>
      ) : (
        details.some(([, v]) => v) && (
          <details className="rounded-2xl border border-(--border) px-4">
            <summary className="cursor-pointer py-2 text-sm font-semibold">{p.details}</summary>
            <dl className="flex flex-col gap-2 pb-3">
              {details
                .filter((row): row is [string, string] => Boolean(row[1]))
                .map(([name, value]) => (
                  <div key={name}>
                    <dt className="text-sm text-(--muted)">{name}</dt>
                    <dd className="break-words whitespace-pre-line">{value}</dd>
                  </div>
                ))}
            </dl>
          </details>
        )
      )}
      {s.visualization && <ScriptText script={s.visualization} summary={p.readScript} />}

      <div className="flex flex-wrap gap-2">
        {active && (
          <button type="button" onClick={onOpenActive} className={btnPrimary}>
            {text.entry.openRunning}
          </button>
        )}
        {open && (
          <button type="button" onClick={() => onContinue(draftFrom(s))} className={btnSecondary}>
            {p.resume}
          </button>
        )}
        {s.outcome === 'hard' && smallerStep && (
          <button type="button" onClick={() => onContinue(draftFrom(s, { action: smallerStep }))} className={btnSecondary}>
            {p.simplify}
          </button>
        )}
        {hadPractice && (
          <button type="button" onClick={() => onPlay(s)} className={btnSecondary}>
            <span aria-hidden="true">▶</span>
            {p.playAgain}
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            onContinue({ ...EMPTY_BREAKER_DRAFT, task: s.task, situations: s.situations ?? [], feelings: s.feelings ?? [], scene: s.scene ?? null })
          }
          className={btnSecondary}
        >
          {p.startFrom}
        </button>
        {!editing && !active && (
          <button type="button" onClick={() => setEditing(true)} className={btnGhost}>
            {p.edit}
          </button>
        )}
        <button type="button" onClick={() => void remove()} className={`${btnGhost} text-(--danger)`}>
          {p.delete}
        </button>
      </div>
    </li>
  );
}

/** A saved visualization's words, folded away until opened. */
export function ScriptText({ script, summary }: { script: SavedScript; summary: string }) {
  return (
    <details className="rounded-2xl border border-(--border) px-4">
      <summary className="cursor-pointer py-2 text-sm font-semibold">{summary}</summary>
      <ol className="flex list-decimal flex-col gap-2 pb-3 ps-5">
        {script.segments.map((segment, i) => (
          <li key={i}>{segment.text}</li>
        ))}
      </ol>
    </details>
  );
}
