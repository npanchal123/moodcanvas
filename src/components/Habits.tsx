import * as Dialog from '@radix-ui/react-dialog';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import {
  BREAKER_TEXT,
  HABIT_COLORS,
  HABIT_ICONS,
  LIMITS,
  localDate,
  MAX_TRACKERS,
  monthGrid,
  weekStart,
  type BreakerText,
  type HabitColor,
} from '../lib/breaker';
import { addTracker, deleteTracker, toggleTick, updateTracker } from '../lib/breaker/store';
import { db } from '../lib/db';
import { usePersistentState } from '../lib/hooks';
import type { Tracker, TrackerTick } from '../lib/types';
import { BorderBeam } from './BorderBeam';
import { BreakerCommitments } from './BreakerCommitments';
import { btnGhost, btnPrimary, btnSecondary, dialogContent, dialogOverlay } from './ui';

const VIEWS = ['grid', 'week', 'month'] as const;
type View = (typeof VIEWS)[number];
const isView = (v: unknown): v is View => VIEWS.includes(v as View);

const NO_TRACKERS: Tracker[] = [];
const NO_TICKS: TrackerTick[] = [];
/** Weeks of history on the overview cards. */
const WEEKS = 20;

const colorOf = (t: Tracker): HabitColor =>
  (HABIT_COLORS as readonly string[]).includes(t.color ?? '') ? (t.color as HabitColor) : 'green';
const iconOf = (t: Tracker) => t.icon || '✨';
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/**
 * Habits: things to do often, with a tick for each day they're done. Three views, like a habit tracker app: an
 * overview with each habit's recent weeks, the last five days as a table to tick, and month cards. Plus the day's
 * to-do list. No streaks: missing a day never breaks anything.
 */
export default function Habits({ animate }: { animate: boolean }) {
  const { locale } = useI18n();
  const text = BREAKER_TEXT[locale];
  const h = text.habits;
  const [mode, setMode] = usePersistentState<'habits' | 'list'>('moodcanvas.habitsMode', 'habits', (v): v is 'habits' | 'list' => v === 'habits' || v === 'list');
  const [view, setView] = usePersistentState<View>('moodcanvas.habitView', 'grid', isView);
  const trackers = useLiveQuery(() => db.trackers.orderBy('createdAt').toArray(), []) ?? NO_TRACKERS;
  const ticks = useLiveQuery(() => db.trackerTicks.toArray(), []) ?? NO_TICKS;
  const [editing, setEditing] = useState<Tracker | 'new' | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const ticked = new Map<string, Set<string>>();
  for (const tick of ticks) {
    if (!ticked.has(tick.trackerId)) ticked.set(tick.trackerId, new Set());
    ticked.get(tick.trackerId)!.add(tick.date);
  }
  const daysOf = (t: Tracker) => ticked.get(t.id) ?? new Set<string>();
  const full = trackers.length >= MAX_TRACKERS;
  const opened = trackers.find((t) => t.id === open);

  const props = { trackers, daysOf, text, animate, onOpen: setOpen };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={h.title} className="flex gap-1 rounded-full border border-(--border) bg-(--surface-strong) p-1">
          {(['habits', 'list'] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
              className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold ${
                mode === id ? 'btn-glow text-(--on-accent)' : 'text-(--muted) hover:bg-(--surface-alt) hover:text-(--text)'
              }`}
            >
              {id === 'habits' ? h.title : h.list}
            </button>
          ))}
        </div>
        {mode === 'habits' && (
          <button
            type="button"
            disabled={full}
            onClick={() => setEditing('new')}
            aria-label={h.add}
            title={full ? h.full : h.add}
            className="btn-glow relative flex h-12 w-12 items-center justify-center rounded-full text-3xl leading-none text-(--on-accent) disabled:opacity-50"
          >
            {!full && <BorderBeam />}
            <span aria-hidden="true">+</span>
          </button>
        )}
      </div>

      {mode === 'list' ? (
        <BreakerCommitments text={text} animate={animate} />
      ) : (
        <>
          <h2 className="sr-only">{h.views[view]}</h2>
          {trackers.length === 0 ? (
            <Empty text={text} />
          ) : view === 'grid' ? (
            <GridView {...props} />
          ) : view === 'week' ? (
            <WeekView {...props} />
          ) : (
            <MonthView {...props} />
          )}
          {full && <p className="text-sm text-(--muted)">{h.full}</p>}

          <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center">
            <div
              role="group"
              aria-label={h.viewsLabel}
              className="glass pointer-events-auto flex gap-1 rounded-full bg-(--surface-strong)! p-1.5 shadow-2xl"
            >
              {VIEWS.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  aria-label={h.views[id]}
                  title={h.views[id]}
                  onClick={() => setView(id)}
                  className={`flex h-12 w-16 items-center justify-center rounded-full ${
                    view === id ? 'bg-(--surface-alt) text-(--text)' : 'text-(--muted) hover:text-(--text)'
                  }`}
                >
                  <ViewIcon view={id} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <HabitDialog
        key={editing === 'new' ? 'new' : editing?.id ?? 'none'}
        habit={editing}
        count={trackers.length}
        text={text}
        onClose={() => setEditing(null)}
      />
      <MonthDialog
        habit={opened ?? null}
        days={opened ? daysOf(opened) : new Set()}
        text={text}
        animate={animate}
        onClose={() => setOpen(null)}
        onEdit={(t) => {
          setOpen(null);
          setEditing(t);
        }}
      />
    </div>
  );
}

interface ViewProps {
  trackers: Tracker[];
  daysOf: (t: Tracker) => Set<string>;
  text: BreakerText;
  animate: boolean;
  onOpen: (id: string) => void;
}

function ViewIcon({ view }: { view: View }) {
  const common = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, 'aria-hidden': true };
  if (view === 'grid') {
    return (
      <svg {...common}>
        {[5, 12, 19].flatMap((x) => [8, 16].map((y) => <rect key={`${x}${y}`} x={x - 2.5} y={y - 2.5} width="5" height="5" rx="1.5" />))}
      </svg>
    );
  }
  if (view === 'week') {
    return (
      <svg {...common}>
        <path d="M3 6l1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17M10 6h11M10 12h11M10 18h11" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 6h6M4 12h6M4 18h6M14 6h6M14 12h6M14 18h6" />
    </svg>
  );
}

/** The day's tick for a habit: a big square button, filled with the habit's colour once done. */
function TodayToggle({ habit, done, text, animate, size = 'lg' }: { habit: Tracker; done: boolean; text: BreakerText; animate: boolean; size?: 'lg' | 'sm' }) {
  const box = size === 'lg' ? 'h-14 w-14 rounded-2xl text-2xl' : 'h-11 w-11 rounded-full text-lg';
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={text.habits.today(habit.title)}
      onClick={() => void toggleTick(habit.id, localDate())}
      className={`flex shrink-0 items-center justify-center border-2 font-black transition-colors ${box} ${
        done ? 'border-transparent bg-(--habit) text-white' : 'border-(--habit-ring) bg-(--surface-strong) text-(--muted) hover:bg-(--habit-soft)'
      }`}
    >
      <span aria-hidden="true" key={String(done)} className={done && animate ? 'check-pop' : ''}>
        {done ? '✓' : '+'}
      </span>
    </button>
  );
}

function IconTile({ habit, small }: { habit: Tracker; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center bg-(--habit-soft) ${small ? 'h-10 w-10 rounded-xl text-lg' : 'h-14 w-14 rounded-2xl text-2xl'}`}
    >
      {iconOf(habit)}
    </span>
  );
}

/** Overview: each habit's last weeks as a dotted grid, columns for weeks and rows for weekdays. */
function GridView({ trackers, daysOf, text, animate, onOpen }: ViewProps) {
  const { t } = useI18n();
  const today = new Date();
  const first = weekStart(t.htmlLang);
  // The column for this week ends on the last day of the week; earlier columns go back WEEKS weeks.
  const offset = (today.getDay() - (first % 7) + 7) % 7;
  const start = addDays(today, -offset - (WEEKS - 1) * 7);
  const todayKey = localDate(today);
  const dates = Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i));
  // Laid out column by column: each week a column, each weekday a row.
  const cells = Array.from({ length: 7 }, (_, row) => Array.from({ length: WEEKS }, (_, col) => dates[col * 7 + row])).flat();

  return (
    <ul className="flex flex-col gap-4">
      {trackers.map((habit) => {
        const days = daysOf(habit);
        const inRange = dates.filter((d) => days.has(localDate(d))).length;
        return (
          <li key={habit.id} className={`habit-${colorOf(habit)} glass rounded-3xl p-4 sm:p-5`}>
            <div className="flex items-center gap-3">
              <IconTile habit={habit} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-extrabold">
                  <button type="button" onClick={() => onOpen(habit.id)} className="max-w-full truncate text-start hover:underline">
                    {habit.title}
                  </button>
                </h3>
                {habit.description && <p className="truncate text-sm font-semibold text-(--muted)">{habit.description}</p>}
              </div>
              <TodayToggle habit={habit} done={days.has(todayKey)} text={text} animate={animate} />
            </div>
            <p className="sr-only">{text.habits.summary(inRange, WEEKS)}</p>
            <div aria-hidden="true" className="mt-4 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}>
              {cells.map((d) => {
                const key = localDate(d);
                const future = key > todayKey;
                return (
                  <span
                    key={key}
                    className={`aspect-square rounded-[4px] ${future ? '' : days.has(key) ? 'bg-(--habit)' : 'bg-(--habit-soft)'} ${
                      key === todayKey && !days.has(key) ? 'ring-1 ring-(--habit-ring)' : ''
                    }`}
                  />
                );
              })}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** The last five days as a table: a row per habit, a tick per day. */
function WeekView({ trackers, daysOf, text, animate, onOpen }: ViewProps) {
  const { t } = useI18n();
  const h = text.habits;
  const today = new Date();
  const days = Array.from({ length: 5 }, (_, i) => addDays(today, i - 4));
  const short = new Intl.DateTimeFormat(t.htmlLang, { weekday: 'short' });
  const range = new Intl.DateTimeFormat(t.htmlLang, { day: 'numeric', month: 'short' });
  const full = new Intl.DateTimeFormat(t.htmlLang, { weekday: 'long', day: 'numeric', month: 'long' });
  const todayKey = localDate(today);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="rounded-full border border-(--border) bg-(--surface-strong) px-4 py-2 font-bold">{h.lastDays(5)}</p>
        <p className="font-mono text-sm tracking-widest text-(--muted) uppercase">
          {range.format(days[0])} – {range.format(days[4])}
        </p>
      </div>
      <div className="glass overflow-hidden rounded-3xl">
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">{h.lastDays(5)}</caption>
          <thead>
            <tr className="border-b border-(--border)">
              <th scope="col" className="w-[46%] px-3 py-3 text-start font-mono text-xs font-semibold tracking-widest text-(--muted) uppercase sm:w-[45%] sm:px-4">
                {h.count(trackers.length)}
              </th>
              {days.map((d) => (
                <th key={localDate(d)} scope="col" className={`py-3 text-center font-mono text-xs ${localDate(d) === todayKey ? 'text-(--text)' : 'text-(--muted)'}`}>
                  <abbr title={full.format(d)} className="block no-underline">
                    {short.format(d)}
                  </abbr>
                  <span className="text-base">{d.getDate()}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trackers.map((habit) => {
              const done = daysOf(habit);
              return (
                <tr key={habit.id} className={`habit-${colorOf(habit)} border-b border-(--border) last:border-0`}>
                  <th scope="row" className="ps-2 pe-1 py-2.5 text-start sm:px-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <IconTile habit={habit} small />
                      <button type="button" onClick={() => onOpen(habit.id)} className="truncate text-start font-bold hover:underline">
                        {habit.title}
                      </button>
                    </div>
                  </th>
                  {days.map((d) => {
                    const key = localDate(d);
                    const isDone = done.has(key);
                    return (
                      <td key={key} className="px-[3px] py-2.5 text-center sm:px-1">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isDone}
                          aria-label={`${habit.title}, ${full.format(d)}`}
                          onClick={() => void toggleTick(habit.id, key)}
                          className={`mx-auto flex h-11 w-full max-w-12 min-w-6 items-center justify-center rounded-xl font-black transition-colors ${
                            isDone ? 'bg-(--habit) text-white' : 'bg-(--habit-soft) hover:brightness-95'
                          }`}
                        >
                          {isDone ? (
                            <span aria-hidden="true" className={animate ? 'check-pop' : ''}>
                              ✓
                            </span>
                          ) : (
                            <span aria-hidden="true" className="h-5 w-5 rounded-full border-[3px] border-(--habit-ring) sm:h-6 sm:w-6" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Month cards: each habit's month at a glance. Tapping a card opens the month to tick any day. */
function MonthView({ trackers, daysOf, text, animate, onOpen }: ViewProps) {
  const { t } = useI18n();
  const today = new Date();
  const month = new Date(today.getFullYear(), today.getMonth(), 1);
  const weeks = monthGrid(month, weekStart(t.htmlLang));
  const label = new Intl.DateTimeFormat(t.htmlLang, { month: 'short', year: 'numeric' }).format(month);
  const todayKey = localDate(today);
  const daysSoFar = weeks.flat().filter((d) => d && localDate(d) <= todayKey).length;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {trackers.map((habit) => {
        const days = daysOf(habit);
        const inMonth = weeks.flat().filter((d) => d && days.has(localDate(d))).length;
        return (
          <li key={habit.id} className={`habit-${colorOf(habit)} glass flex flex-col gap-3 rounded-2xl p-3`}>
            <div className="flex items-center gap-2">
              <TodayToggle habit={habit} done={days.has(todayKey)} text={text} animate={animate} size="sm" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-extrabold">
                  <button type="button" onClick={() => onOpen(habit.id)} className="max-w-full truncate text-start hover:underline">
                    {habit.title}
                  </button>
                </h3>
                <p className="font-mono text-xs tracking-wider text-(--muted)">{label}</p>
              </div>
            </div>
            <p className="sr-only">{text.tracker.count(inMonth, daysSoFar)}</p>
            <div aria-hidden="true" className="grid grid-cols-7 gap-1">
              {weeks.flat().map((d, i) =>
                d ? (
                  <span
                    key={i}
                    className={`aspect-square rounded-[5px] ${days.has(localDate(d)) ? 'bg-(--habit)' : 'bg-(--habit-soft)'} ${
                      localDate(d) > todayKey ? 'opacity-40' : ''
                    }`}
                  />
                ) : (
                  <span key={i} />
                ),
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Empty({ text }: { text: BreakerText }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="glass flex flex-col items-center gap-4 rounded-3xl p-6 text-center">
      <p className="text-lg">{text.habits.empty}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {text.tracker.ideaList.map((idea, i) => (
          <button
            key={idea}
            type="button"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void addTracker({ title: idea, color: HABIT_COLORS[i % HABIT_COLORS.length], icon: HABIT_ICONS[(i + 1) % HABIT_ICONS.length] }).finally(() =>
                setBusy(false),
              );
            }}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-dashed border-(--accent) bg-(--accent-soft) px-3.5 text-sm font-semibold hover:bg-(--surface-alt)"
          >
            <span aria-hidden="true">＋</span>
            {idea}
          </button>
        ))}
      </div>
    </div>
  );
}

const field = 'field w-full rounded-2xl border border-(--border) bg-(--surface-strong) p-3 transition-shadow';

/** Creating or editing a habit: name, optional description, colour and icon. */
function HabitDialog({
  habit,
  count,
  text,
  onClose,
}: {
  habit: Tracker | 'new' | null;
  count: number;
  text: BreakerText;
  onClose: () => void;
}) {
  const h = text.habits;
  const existing = habit && habit !== 'new' ? habit : null;
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [color, setColor] = useState<string>(existing ? colorOf(existing) : HABIT_COLORS[count % HABIT_COLORS.length]);
  const [icon, setIcon] = useState(existing?.icon ?? HABIT_ICONS[(count + 1) % HABIT_ICONS.length]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!title.trim()) {
      setError(h.need);
      document.getElementById('habit-name')?.focus();
      return;
    }
    setSaving(true);
    try {
      if (existing) await updateTracker(existing.id, { title, description, color, icon });
      else if ((await db.trackers.count()) >= MAX_TRACKERS) return setError(h.full);
      else await addTracker({ title, description, color, icon });
      onClose();
    } catch {
      setError(text.journal.failed);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (existing && window.confirm(h.deleteConfirm)) {
      await deleteTracker(existing.id);
      onClose();
    }
  }

  return (
    <Dialog.Root open={habit != null} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={`${dialogOverlay} z-40`} />
        <Dialog.Content className={`${dialogContent} z-50`} aria-describedby={undefined}>
          <Dialog.Title className="display text-2xl font-extrabold">{existing ? h.edit : h.add}</Dialog.Title>
          <form noValidate onSubmit={(e) => void save(e)} className={`habit-${color} flex flex-col gap-4`}>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-(--habit-soft) text-2xl">
                {icon}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label htmlFor="habit-name" className="text-sm font-semibold">
                  {h.name}
                </label>
                <input
                  id="habit-name"
                  maxLength={LIMITS.short}
                  value={title}
                  placeholder={h.namePlaceholder}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError('');
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'habit-error' : undefined}
                  className={field}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="habit-description" className="text-sm font-semibold">
                {h.description}
              </label>
              <input id="habit-description" maxLength={LIMITS.short} value={description} onChange={(e) => setDescription(e.target.value)} className={field} />
            </div>
            <Choice legend={h.color}>
              {HABIT_COLORS.map((c) => (
                <label key={c} className={`habit-${c} relative cursor-pointer`}>
                  <input type="radio" name="habit-color" value={c} checked={color === c} onChange={() => setColor(c)} className="peer sr-only" />
                  <span className="sr-only">{h.colors[c]}</span>
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-(--habit) text-white ring-offset-2 ring-offset-(--surface-strong) peer-checked:ring-3 peer-checked:ring-(--habit) peer-focus-visible:outline-3 peer-focus-visible:outline-(--focus)"
                  >
                    {color === c ? '✓' : ''}
                  </span>
                </label>
              ))}
            </Choice>
            <Choice legend={h.icon}>
              {HABIT_ICONS.map((i) => (
                <label key={i} className="cursor-pointer">
                  <input type="radio" name="habit-icon" value={i} checked={icon === i} onChange={() => setIcon(i)} className="peer sr-only" />
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--surface-alt) text-xl peer-checked:bg-(--habit-soft) peer-checked:ring-2 peer-checked:ring-(--habit) peer-focus-visible:outline-3 peer-focus-visible:outline-(--focus)">
                    {i}
                  </span>
                </label>
              ))}
            </Choice>
            {error && (
              <p id="habit-error" role="alert" className="font-medium text-(--danger)">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={saving} className={btnPrimary}>
                {existing ? h.save : h.create}
              </button>
              <Dialog.Close className={btnGhost}>{h.cancel}</Dialog.Close>
              {existing && (
                <button type="button" onClick={() => void remove()} className={`${btnGhost} ms-auto text-(--danger)`}>
                  {h.delete}
                </button>
              )}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Choice({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

/** One habit's month, to tick or untick any past day; arrows go back through earlier months. */
function MonthDialog({
  habit,
  days,
  text,
  animate,
  onClose,
  onEdit,
}: {
  habit: Tracker | null;
  days: Set<string>;
  text: BreakerText;
  animate: boolean;
  onClose: () => void;
  onEdit: (habit: Tracker) => void;
}) {
  const { t } = useI18n();
  const h = text.habits;
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const first = weekStart(t.htmlLang);
  const weeks = monthGrid(month, first);
  const todayKey = localDate();
  const title = new Intl.DateTimeFormat(t.htmlLang, { month: 'long', year: 'numeric' }).format(month);
  const fullDate = new Intl.DateTimeFormat(t.htmlLang, { weekday: 'long', day: 'numeric', month: 'long' });
  const narrow = new Intl.DateTimeFormat(t.htmlLang, { weekday: 'narrow' });
  const long = new Intl.DateTimeFormat(t.htmlLang, { weekday: 'long' });
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2021, 0, 4 + ((first - 1 + i) % 7)));
  const soFar = weeks.flat().filter((d) => d && localDate(d) <= todayKey).length;
  const ticked = weeks.flat().filter((d) => d && days.has(localDate(d))).length;
  const shift = (by: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + by, 1));
  const arrow = 'flex h-11 w-11 items-center justify-center rounded-full text-2xl font-bold hover:bg-(--surface-alt)';

  return (
    <Dialog.Root open={habit != null} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={`${dialogOverlay} z-40`} />
        {habit && (
          <Dialog.Content className={`${dialogContent} habit-${colorOf(habit)} z-50`} aria-describedby={undefined}>
            <div className="flex items-center gap-3">
              <IconTile habit={habit} />
              <div className="min-w-0 flex-1">
                <Dialog.Title className="display truncate text-xl font-extrabold">{habit.title}</Dialog.Title>
                {habit.description && <p className="truncate text-sm text-(--muted)">{habit.description}</p>}
                <p className="text-sm font-semibold text-(--muted)">{text.tracker.count(ticked, soFar)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => shift(-1)} aria-label={h.prev} className={arrow}>
                <span aria-hidden="true" className="rtl:-scale-x-100">‹</span>
              </button>
              <p id="habit-month-title" aria-live="polite" className="display font-extrabold capitalize">
                {title}
              </p>
              <button type="button" onClick={() => shift(1)} aria-label={h.next} className={arrow}>
                <span aria-hidden="true" className="rtl:-scale-x-100">›</span>
              </button>
            </div>
            <table aria-labelledby="habit-month-title" className="w-full table-fixed border-separate border-spacing-1">
              <thead>
                <tr>
                  {weekdays.map((d) => (
                    <th key={d.getDay()} scope="col" className="text-xs font-semibold text-(--muted)">
                      <abbr title={long.format(d)} className="no-underline">
                        {narrow.format(d)}
                      </abbr>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, w) => (
                  <tr key={w}>
                    {week.map((d, i) => {
                      if (!d) return <td key={i} />;
                      const key = localDate(d);
                      const done = days.has(key);
                      return (
                        <td key={i} className="p-0">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={done}
                            aria-label={`${habit.title}, ${fullDate.format(d)}`}
                            aria-current={key === todayKey ? 'date' : undefined}
                            disabled={key > todayKey}
                            onClick={() => void toggleTick(habit.id, key)}
                            className={`flex h-10 w-full items-center justify-center rounded-xl text-sm font-bold disabled:opacity-35 ${
                              done ? 'bg-(--habit) text-white' : 'bg-(--habit-soft)'
                            } ${key === todayKey && !done ? 'ring-2 ring-(--habit) ring-inset' : ''}`}
                          >
                            {done ? (
                              <span aria-hidden="true" className={animate ? 'check-pop' : ''}>
                                ✓
                              </span>
                            ) : (
                              d.getDate()
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => onEdit(habit)} className={btnSecondary}>
                {h.more}
              </button>
              <Dialog.Close className={btnGhost}>{h.close}</Dialog.Close>
            </div>
          </Dialog.Content>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
