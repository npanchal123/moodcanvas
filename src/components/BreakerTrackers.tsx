import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useI18n } from '../i18n';
import { LIMITS, localDate, MAX_TRACKERS, monthGrid, weekStart, type BreakerText } from '../lib/breaker';
import { addTracker, deleteTracker, toggleTick } from '../lib/breaker/store';
import { db } from '../lib/db';
import type { Tracker, TrackerTick } from '../lib/types';
import { btnGhost, card } from './ui';

const NO_TRACKERS: Tracker[] = [];
const NO_TICKS: TrackerTick[] = [];

/**
 * Monthly trackers: things to do often, each with its own month grid to tick off the days they were done. Follows
 * the month shown in the calendar above. Counts only ticked days; there are no streaks to break.
 */
export function BreakerTrackers({ text, month, animate }: { text: BreakerText; month: Date; animate: boolean }) {
  const tr = text.tracker;
  const trackers = useLiveQuery(() => db.trackers.orderBy('createdAt').toArray(), []) ?? NO_TRACKERS;
  const first = localDate(new Date(month.getFullYear(), month.getMonth(), 1));
  const last = localDate(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const ticks =
    useLiveQuery(() => db.trackerTicks.where('date').between(first, last, true, true).toArray(), [first, last]) ?? NO_TICKS;
  const [error, setError] = useState('');
  const full = trackers.length >= MAX_TRACKERS;
  const ideas = tr.ideaList.filter((idea) => !trackers.some((x) => x.title === idea));

  async function add(title: string): Promise<boolean> {
    if (!title.trim()) {
      setError(text.commitments.need);
      return false;
    }
    try {
      if ((await db.trackers.count()) >= MAX_TRACKERS) {
        setError(tr.full);
        return false;
      }
      await addTracker(title);
      setError('');
      return true;
    } catch {
      setError(text.journal.failed);
      return false;
    }
  }

  return (
    <section aria-labelledby="trackers-heading" className={`${card} flex flex-col gap-5`}>
      <div className="flex flex-col gap-1">
        <h2 id="trackers-heading" className="display text-2xl leading-tight font-extrabold">
          {tr.title}
        </h2>
        <p className="text-(--muted)">{tr.body}</p>
      </div>

      {trackers.length === 0 && <p className="text-(--muted)">{tr.empty}</p>}
      {trackers.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {trackers.map((tracker) => (
            <TrackerCard
              key={tracker.id}
              tracker={tracker}
              ticked={new Set(ticks.filter((x) => x.trackerId === tracker.id).map((x) => x.date))}
              month={month}
              text={text}
              animate={animate}
            />
          ))}
        </ul>
      )}

      {full ? (
        <p className="text-sm text-(--muted)">{tr.full}</p>
      ) : (
        <>
          <AddTracker text={text} onAdd={add} onTyping={() => setError('')} invalid={Boolean(error)} />
          {ideas.length > 0 && (
            <div role="group" aria-labelledby="tracker-ideas-label" className="flex flex-col gap-2">
              <p id="tracker-ideas-label" className="text-sm font-semibold text-(--muted)">
                {text.commitments.ideas}
              </p>
              <div className="flex flex-wrap gap-2">
                {ideas.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => void add(idea)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-dashed border-(--accent) bg-(--accent-soft) px-3.5 text-sm font-semibold hover:bg-(--surface-alt)"
                  >
                    <span aria-hidden="true">＋</span>
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {error && (
        <p id="tracker-error" role="alert" className="font-medium text-(--danger)">
          {error}
        </p>
      )}
    </section>
  );
}

function AddTracker({
  text,
  onAdd,
  onTyping,
  invalid,
}: {
  text: BreakerText;
  onAdd: (title: string) => Promise<boolean>;
  onTyping: () => void;
  invalid: boolean;
}) {
  const tr = text.tracker;
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    // Cleared straight away, so typing the next one right after Enter isn't wiped; put back if it didn't save.
    const value = title;
    setSaving(true);
    setTitle('');
    if (!(await onAdd(value))) setTitle((now) => now || value);
    setSaving(false);
  }

  return (
    <form
      noValidate
      onSubmit={(e) => void submit(e)}
      className="flex min-h-14 items-center gap-2 rounded-2xl border-2 border-dashed border-(--accent) bg-(--surface-strong) py-1.5 ps-4 pe-1.5"
    >
      <span aria-hidden="true" className="text-xl">
        📆
      </span>
      <label htmlFor="tracker-title" className="sr-only">
        {tr.add}
      </label>
      <input
        id="tracker-title"
        maxLength={LIMITS.short}
        value={title}
        placeholder={tr.placeholder}
        enterKeyHint="done"
        onChange={(e) => {
          setTitle(e.target.value);
          onTyping();
        }}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={invalid ? 'tracker-error' : undefined}
        className="min-w-0 flex-1 bg-transparent py-2 text-base font-medium outline-none placeholder:text-(--muted)"
      />
      <button
        type="submit"
        disabled={saving}
        aria-label={`${text.commitments.addButton} · ${tr.title}`}
        className="btn-glow flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-(--on-accent)"
      >
        <span aria-hidden="true">+</span>
      </button>
    </form>
  );
}

function TrackerCard({
  tracker,
  ticked,
  month,
  text,
  animate,
}: {
  tracker: Tracker;
  ticked: Set<string>;
  month: Date;
  text: BreakerText;
  animate: boolean;
}) {
  const { t } = useI18n();
  const tr = text.tracker;
  const first = weekStart(t.htmlLang);
  const weeks = monthGrid(month, first);
  const today = localDate();
  const titleId = `tracker-${tracker.id}`;
  // Days so far this month (all of a past month, none of a future one), so the count is fair.
  const days = weeks.flat().filter((d): d is Date => d != null && localDate(d) <= today).length;
  const fullDate = new Intl.DateTimeFormat(t.htmlLang, { weekday: 'long', day: 'numeric', month: 'long' });
  const longDay = new Intl.DateTimeFormat(t.htmlLang, { weekday: 'long' });
  const narrowDay = new Intl.DateTimeFormat(t.htmlLang, { weekday: 'narrow' });
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2021, 0, 4 + ((first - 1 + i) % 7)));
  const share = days ? ticked.size / days : 0;

  async function remove() {
    if (window.confirm(tr.removeConfirm)) await deleteTracker(tracker.id);
  }

  return (
    <li className="flex flex-col gap-3 rounded-3xl border border-(--border) bg-(--surface-strong) p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 id={titleId} className="font-bold break-words">
            {tracker.title}
          </h3>
          <p className="text-sm text-(--muted)">{tr.count(ticked.size, days)}</p>
        </div>
        <button
          type="button"
          onClick={() => void remove()}
          aria-label={`${tr.remove}: ${tracker.title}`}
          className={`${btnGhost} min-h-10 px-3 text-sm text-(--muted)`}
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
      <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-(--track)">
        <div className="btn-glow h-full rounded-full" style={{ width: `${Math.round(share * 100)}%` }} />
      </div>
      <table aria-labelledby={titleId} className="w-full table-fixed border-separate border-spacing-0.5">
        <thead>
          <tr>
            {weekdays.map((d) => (
              <th key={d.getDay()} scope="col" className="text-[0.7rem] font-semibold text-(--muted)">
                <abbr title={longDay.format(d)} className="no-underline">
                  {narrowDay.format(d)}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((day, i) => {
                if (!day) return <td key={i} />;
                const key = localDate(day);
                const isTicked = ticked.has(key);
                const future = key > today;
                return (
                  <td key={i} className="p-0">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isTicked}
                      aria-label={`${tracker.title}, ${fullDate.format(day)}`}
                      aria-current={key === today ? 'date' : undefined}
                      disabled={future}
                      onClick={() => void toggleTick(tracker.id, key)}
                      className={`relative flex h-9 w-full items-center justify-center rounded-xl text-xs font-bold transition-colors disabled:cursor-default disabled:opacity-35 ${
                        isTicked ? 'btn-glow text-(--on-accent)' : 'bg-(--surface-alt) hover:bg-(--accent-soft)'
                      } ${key === today && !isTicked ? 'ring-2 ring-(--accent) ring-inset' : ''}`}
                    >
                      {isTicked ? (
                        <span aria-hidden="true" className={`text-sm ${animate ? 'check-pop' : ''}`}>
                          ✓
                        </span>
                      ) : (
                        day.getDate()
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </li>
  );
}
