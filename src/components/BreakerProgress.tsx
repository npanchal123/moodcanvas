import { useState } from 'react';
import { breakerStats, formatDuration, smaller, sortObstacles, type BreakerOutcome, type BreakerText } from '../lib/breaker';
import { deleteSession } from '../lib/breaker/store';
import type { BreakerSession } from '../lib/types';
import { btnGhost, btnPrimary, btnSecondary, card, toggle } from './ui';

const FILTERS = ['all', 'done', 'progress', 'rescheduled'] as const;
type Filter = (typeof FILTERS)[number];

const OUTCOME_ICONS: Record<BreakerOutcome, string> = {
  done: '✓', progress: '◐', hard: '↓', interrupted: '⏸', rescheduled: '🗓',
};

interface Props {
  sessions: BreakerSession[];
  text: BreakerText;
  formatDate: (iso: string) => string;
  onResume: (session: BreakerSession) => void;
  onSimplify: (session: BreakerSession) => void;
  onOpenActive: (session: BreakerSession) => void;
  onStartFirst: () => void;
}

/** Saved sessions and what they add up to. Every number comes from the saved records. */
export function BreakerProgress({ sessions, text, formatDate, onResume, onSimplify, onOpenActive, onStartFirst }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const stats = breakerStats(sessions);
  const p = text.progress;
  const shown = filter === 'all' ? sessions : sessions.filter((s) => s.status === 'finished' && s.outcome === filter);

  const tiles: [string, string][] = [
    [p.stats.sessions, String(stats.sessions)],
    [p.stats.done, String(stats.done)],
    [p.stats.focus, formatDuration(text, stats.focusSeconds)],
    [p.stats.resumed, String(stats.resumed)],
  ];

  async function remove(id: string) {
    if (window.confirm(p.deleteConfirm)) await deleteSession(id);
  }

  return (
    <section aria-labelledby="breaker-progress-heading" className="flex flex-col gap-5">
      <div>
        <h2 id="breaker-progress-heading" className="display text-2xl font-extrabold sm:text-3xl">
          {p.title}
        </h2>
        <p className="text-sm text-(--muted)">{p.note}</p>
      </div>

      {sessions.length === 0 ? (
        <div className={`${card} flex flex-col items-center gap-4 text-center`}>
          <p className="text-lg">{p.empty}</p>
          <button type="button" onClick={onStartFirst} className={btnPrimary}>
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

          {shown.length === 0 ? (
            <p className={`${card} text-(--muted)`}>{p.emptyFilter}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {shown.map((s) => {
                const active = s.status === 'active';
                const status = active ? p.inProgress : s.outcome ? text.reflect.outcomes[s.outcome] : '';
                const obstacles = sortObstacles(s.obstacles)
                  .map((id) => (id === 'other' && s.otherObstacle ? s.otherObstacle : text.obstacles[id].label))
                  .join(' · ');
                const open = !active && s.outcome !== 'done';
                const details: [string, string | undefined][] = [
                  [p.why, s.why],
                  [p.plan, s.plan],
                  [p.reflection, s.reflection],
                  [p.setAside, s.setAside],
                ];
                return (
                  <li key={s.id} className={`${card} flex flex-col gap-3 p-4! sm:p-5!`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold break-words">{s.task}</h3>
                        <p className="text-sm text-(--muted)">
                          <time dateTime={s.createdAt}>{formatDate(s.createdAt)}</time>
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--surface-strong) px-3 py-1 text-sm font-medium">
                        <span aria-hidden="true">{active ? '▶' : s.outcome && OUTCOME_ICONS[s.outcome]}</span>
                        {status}
                      </span>
                    </div>
                    <p>
                      <span className="text-sm text-(--muted)">{p.action}: </span>
                      <span className="font-medium break-words">{s.action}</span>
                    </p>
                    <p className="text-sm text-(--muted)">
                      {p.obstacles}: {obstacles}
                    </p>
                    <p className="text-sm text-(--muted)">
                      {p.planned(text.mins(s.plannedMinutes), formatDuration(text, s.focusedSeconds))}
                      {s.rescheduledFor && ` · ${text.entry.plannedFor(formatDate(s.rescheduledFor))}`}
                    </p>
                    {details.some(([, v]) => v) && (
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
                    )}
                    <div className="flex flex-wrap gap-2">
                      {active && (
                        <button type="button" onClick={() => onOpenActive(s)} className={btnPrimary}>
                          {text.entry.openRunning}
                        </button>
                      )}
                      {open && (
                        <button type="button" onClick={() => onResume(s)} className={btnSecondary}>
                          {p.resume}
                        </button>
                      )}
                      {s.outcome === 'hard' && smaller(text, s.task, s.action) && (
                        <button type="button" onClick={() => onSimplify(s)} className={btnSecondary}>
                          {p.simplify}
                        </button>
                      )}
                      <button type="button" onClick={() => void remove(s.id)} className={`${btnGhost} text-(--danger)`}>
                        {p.delete}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
