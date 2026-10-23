import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import {
  commitmentMonth,
  monthGrid,
  ENERGY_LEVELS,
  LIMITS,
  localDate,
  MAX_COMMITMENTS,
  smaller,
  type BreakerText,
  type CommitmentStatus,
  type Energy,
} from '../lib/breaker';
import { addCommitment, deleteCommitment, getEnergy, setEnergy, updateCommitment } from '../lib/breaker/store';
import { buildCommitmentIcs, isTime, setCommitmentReminder } from '../lib/commitmentReminders';
import { db } from '../lib/db';
import { downloadBlob } from '../lib/export';
import type { Commitment } from '../lib/types';
import { btnGhost, btnSecondary, card, toggle } from './ui';

const NONE: Commitment[] = [];
const field =
  'field w-full rounded-2xl border border-(--border) bg-(--surface-strong) p-3 leading-relaxed transition-shadow';
const LENGTHS = [5, 10, 25] as const;
/** The suggested length for each energy level: a low-energy day gets the smallest. */
const MINUTES_FOR: Record<Energy, number> = { low: 5, medium: 10, high: 25 };
const ENERGY_ICONS: Record<Energy, string> = { low: '🪫', medium: '🔋', high: '⚡' };
/** The less common statuses, kept behind "More options" so the list stays a simple checklist. */
const OTHER_STATUSES: CommitmentStatus[] = ['doing', 'partial', 'skipped', 'todo'];

/**
 * Daily commitments as a checklist: type a line or tap an idea to add one, tap the circle to tick it off. Up to
 * three a day, an optional energy check that only changes the suggested length, and a week's counts taken straight
 * from what was recorded. No streaks.
 */
export function BreakerCommitments({ text, animate }: { text: BreakerText; animate: boolean }) {
  const c = text.commitments;
  const { t } = useI18n();
  const [date, setDate] = useState(() => localDate());
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const all = useLiveQuery(() => db.commitments.toArray(), []) ?? NONE;
  const day = all.filter((x) => x.date === date).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const summary = commitmentMonth(all, month);
  const monthName = new Intl.DateTimeFormat(t.htmlLang, { month: 'long', year: 'numeric' }).format(month);
  const dayName = new Intl.DateTimeFormat(t.htmlLang, { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(`${date}T12:00:00`),
  );
  const [energy, setEnergyState] = useState<Energy | undefined>();
  const [error, setError] = useState('');
  const minutes = energy ? MINUTES_FOR[energy] : 10;
  const done = day.filter((x) => x.status === 'done').length;
  const allDone = day.length > 0 && done === day.length;
  const free = MAX_COMMITMENTS - day.length;

  useEffect(() => {
    let current = true;
    void getEnergy(date).then((e) => current && setEnergyState(e));
    return () => {
      current = false;
    };
  }, [date]);

  async function chooseEnergy(level: Energy) {
    setEnergyState(level);
    await setEnergy(date, level);
  }

  /** Adds a commitment, checking the day's limit again in case another tab added one meanwhile. */
  async function add(title: string): Promise<boolean> {
    if (!title.trim()) {
      setError(c.need);
      return false;
    }
    try {
      if ((await db.commitments.where('date').equals(date).count()) >= MAX_COMMITMENTS) {
        setError(c.full);
        return false;
      }
      await addCommitment({ date, title, minutes });
      setError('');
      return true;
    } catch {
      setError(text.journal.failed);
      return false;
    }
  }

  const tiles: [string, number][] = [
    [c.weekStats.created, summary.created],
    [c.weekStats.done, summary.done],
    [c.weekStats.partial, summary.partial],
    [c.weekStats.days, summary.days],
  ];
  const ideas = c.ideaList.filter((idea) => !day.some((x) => x.title === idea));

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="commitments-heading" className={`${card} fade-up flex flex-col gap-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 id="commitments-heading" className="display text-2xl leading-tight font-extrabold sm:text-3xl">
              {c.title}
            </h2>
            <p className="text-(--muted)">{c.body}</p>
          </div>
        </div>

        <MonthCalendar
          month={month}
          selected={date}
          commitments={all}
          text={text}
          onMonth={setMonth}
          onSelect={(d) => {
            setDate(d);
            setError('');
          }}
        />

        <h3 aria-live="polite" className="display text-xl font-extrabold">
          {date === localDate() ? `${c.month.today} · ${dayName}` : dayName}
        </h3>

        <div role="group" aria-labelledby="energy-label" className="flex flex-col gap-2">
          <p id="energy-label" className="font-semibold">
            {c.energy} <span className="text-sm font-normal text-(--muted)">{c.energyOptional}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {ENERGY_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={energy === level}
                onClick={() => void chooseEnergy(level)}
                className={`${toggle(energy === level)} text-sm`}
              >
                <span aria-hidden="true">{ENERGY_ICONS[level]}</span>
                {c.energyLevels[level]}
              </button>
            ))}
          </div>
          {energy && <p className="text-sm text-(--muted)">{c.energyTips[energy]}</p>}
        </div>

        {day.length > 0 && <Progress done={done} total={day.length} text={text} animate={animate} allDone={allDone} />}

        <ul className="flex flex-col gap-2">
          {day.map((item) => (
            <CommitmentItem key={item.id} item={item} text={text} animate={animate} />
          ))}
          {free > 0 && (
            <li>
              <QuickAdd text={text} onAdd={add} onTyping={() => setError('')} invalid={Boolean(error)} />
            </li>
          )}
          {Array.from({ length: Math.max(0, free - 1) }, (_, i) => (
            <li key={i} aria-hidden="true" className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-dashed border-(--border) px-4 opacity-60">
              <span className="h-8 w-8 shrink-0 rounded-full border-2 border-dashed border-(--border)" />
            </li>
          ))}
        </ul>
        {error && (
          <p id="commitment-error" role="alert" className="font-medium text-(--danger)">
            {error}
          </p>
        )}
        {free === 0 && !allDone && <p className="text-sm text-(--muted)">{c.full}</p>}

        {free > 0 && ideas.length > 0 && (
          <div role="group" aria-labelledby="ideas-label" className="flex flex-col gap-2">
            <p id="ideas-label" className="text-sm font-semibold text-(--muted)">
              {c.ideas}
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
      </section>

      <section aria-labelledby="week-heading" className="flex flex-col gap-3">
        <div>
          <h2 id="week-heading" className="text-xl font-semibold capitalize">
            {c.month.summary(monthName)}
          </h2>
          <p className="text-sm text-(--muted)">{c.weekNote}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map(([name, value]) => (
            <div key={name} className={`${card} flex flex-col-reverse gap-1 p-4!`}>
              <dt className="text-sm text-(--muted)">{name}</dt>
              <dd className="display text-3xl font-extrabold">{value}</dd>
            </div>
          ))}
        </dl>
        {summary.kinds.length > 0 && (
          <p className="text-(--muted)">
            {c.topKinds}: {summary.kinds.map((k) => text.categoryNames[k]).join(' · ')}
          </p>
        )}
      </section>
    </div>
  );
}

/** A ring that fills as the day's commitments are ticked off, with a friendly line. */
function Progress({ done, total, text, animate, allDone }: { done: number; total: number; text: BreakerText; animate: boolean; allDone: boolean }) {
  const c = text.commitments;
  const r = 22;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center gap-4 rounded-2xl bg-(--surface-alt) p-3 pe-5">
      <div className="relative h-14 w-14 shrink-0">
        <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" aria-hidden="true">
          <circle cx="28" cy="28" r={r} fill="none" strokeWidth="6" style={{ stroke: 'var(--track)' }} />
          <circle
            cx="28"
            cy="28"
            r={r}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - done / total)}
            style={{ stroke: 'var(--accent)', transition: animate ? 'stroke-dashoffset 500ms ease' : undefined }}
          />
        </svg>
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-sm font-extrabold">
          {allDone ? '✨' : `${done}/${total}`}
        </span>
      </div>
      <div aria-live="polite">
        <p className="font-bold">{c.progress(done, total)}</p>
        <p className="text-sm text-(--muted)">{allDone ? c.vibe.all : done > 0 ? c.vibe.some : c.vibe.none}</p>
      </div>
      {allDone && animate && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-6 text-xl">
          {['✨', '🎉', '💫', '✨'].map((s, i) => (
            <span key={i} className="sparkle" style={{ animationDelay: `${i * 120}ms` }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickAdd({
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
  const c = text.commitments;
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
    document.getElementById('commitment-title')?.focus();
  }

  return (
    <form noValidate onSubmit={(e) => void submit(e)} className="flex min-h-14 items-center gap-2 rounded-2xl border-2 border-dashed border-(--accent) bg-(--surface-strong) py-1.5 ps-4 pe-1.5">
      <span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-full border-2 border-dashed border-(--accent)" />
      <label htmlFor="commitment-title" className="sr-only">
        {c.add}
      </label>
      <input
        id="commitment-title"
        maxLength={LIMITS.short}
        value={title}
        placeholder={c.quickAdd}
        enterKeyHint="done"
        onChange={(e) => {
          setTitle(e.target.value);
          onTyping();
        }}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={invalid ? 'commitment-error' : undefined}
        className="min-w-0 flex-1 bg-transparent py-2 text-base font-medium outline-none placeholder:text-(--muted)"
      />
      <button
        type="submit"
        disabled={saving}
        aria-label={c.addButton}
        className="btn-glow flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-(--on-accent)"
      >
        <span aria-hidden="true">+</span>
      </button>
    </form>
  );
}

function CommitmentItem({ item, text, animate }: { item: Commitment; text: BreakerText; animate: boolean }) {
  const c = text.commitments;
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const { t } = useI18n();
  const [reflection, setReflection] = useState(item.reflection ?? '');
  const [saved, setSaved] = useState(false);
  const done = item.status === 'done';
  const smallerStep = smaller(text, item.title, item.title);
  const canReflect = done || item.status === 'partial' || item.status === 'skipped';
  const panelId = `commitment-more-${item.id}`;

  /** The smaller step takes the title; what it was before stays in the details, so nothing is lost. */
  async function makeSmaller(step: string) {
    const description = [item.title, item.description].filter(Boolean).join('\n');
    await updateCommitment(item.id, { title: step, description });
  }

  async function remove() {
    if (window.confirm(c.deleteConfirm)) await deleteCommitment(item.id);
  }

  function nextLength() {
    const at = (LENGTHS as readonly number[]).indexOf(item.minutes);
    return LENGTHS[(at + 1) % LENGTHS.length];
  }

  return (
    <li className={`rounded-2xl border transition-colors ${done ? 'border-(--accent) bg-(--accent-soft)' : 'border-(--border) bg-(--surface-strong)'}`}>
      <div className="flex items-center gap-3 p-2 ps-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={item.title}
          onClick={() => void updateCommitment(item.id, { status: done ? 'todo' : 'done' })}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-xl font-black transition-colors ${
            done ? 'btn-glow border-transparent text-(--on-accent)' : 'border-(--accent) hover:bg-(--accent-soft)'
          }`}
        >
          {done && (
            <span key="tick" aria-hidden="true" className={animate ? 'check-pop' : ''}>
              ✓
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <h3 className={`font-semibold break-words ${done ? 'text-(--muted) line-through decoration-2' : ''}`}>{item.title}</h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => void updateCommitment(item.id, { minutes: nextLength() })}
              aria-label={`${c.minutes} ${text.mins(item.minutes)}`}
              className="inline-flex min-h-8 items-center rounded-full bg-(--surface-alt) px-2.5 font-semibold text-(--muted) hover:text-(--text)"
            >
              ⏱ {text.mins(item.minutes)}
            </button>
            <button
              type="button"
              aria-expanded={bell}
              aria-controls={`commitment-bell-${item.id}`}
              aria-label={`${c.reminder.label}: ${item.title}${item.remindAt ? ` ${formatTime(item.remindAt, t.htmlLang)}` : ''}`}
              onClick={() => setBell((b) => !b)}
              className={`inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 font-semibold ${
                item.remindAt ? 'bg-(--accent-soft) text-(--accent)' : 'bg-(--surface-alt) text-(--muted) hover:text-(--text)'
              }`}
            >
              <span aria-hidden="true">🔔</span>
              {item.remindAt && formatTime(item.remindAt, t.htmlLang)}
            </button>
            {item.status !== 'todo' && !done && (
              <span className="rounded-full border border-(--border) px-2.5 py-1 font-semibold">{c.statuses[item.status]}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${c.more}: ${item.title}`}
          onClick={() => setOpen((o) => !o)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold text-(--muted) hover:bg-(--surface-alt) hover:text-(--text)"
        >
          <span aria-hidden="true">⋯</span>
        </button>
      </div>

      {bell && <ReminderEditor item={item} text={text} id={`commitment-bell-${item.id}`} />}

      {open && (
        <div id={panelId} className="flex flex-col gap-3 border-t border-(--border) p-3">
          {item.description && <p className="text-sm break-words whitespace-pre-line text-(--muted)">{item.description}</p>}
          <div role="group" aria-label={`${c.status}: ${item.title}`} className="flex flex-wrap gap-2">
            {OTHER_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={item.status === s}
                onClick={() => void updateCommitment(item.id, { status: s })}
                className={`${toggle(item.status === s)} min-h-10 px-3 text-sm`}
              >
                {c.statuses[s]}
              </button>
            ))}
          </div>
          {canReflect && (
            <div className="flex flex-col gap-2">
              <label htmlFor={`reflection-${item.id}`} className="text-sm font-semibold">
                {c.reflection}
              </label>
              <textarea
                id={`reflection-${item.id}`}
                rows={2}
                maxLength={LIMITS.long}
                value={reflection}
                onChange={(e) => {
                  setReflection(e.target.value);
                  setSaved(false);
                }}
                className={field}
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void updateCommitment(item.id, { reflection }).then(() => setSaved(true))}
                  className={btnSecondary}
                >
                  {c.saveReflection}
                </button>
                <p role="status" className="text-sm font-medium">
                  {saved ? `✓ ${c.saved}` : ''}
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {!done && smallerStep && smallerStep !== item.title && (
              <button type="button" onClick={() => void makeSmaller(smallerStep)} className={btnSecondary}>
                <span aria-hidden="true">↓</span>
                {c.smaller}
              </button>
            )}
            <button type="button" onClick={() => void remove()} aria-label={`${c.delete}: ${item.title}`} className={`${btnGhost} text-(--danger)`}>
              {c.delete}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

/** "18:30" in the person's own clock style, e.g. "6:30 PM". */
function formatTime(time: string, lang: string): string {
  const [h, m] = time.split(':').map(Number);
  return new Intl.DateTimeFormat(lang, { timeStyle: 'short' }).format(new Date(2000, 0, 1, h, m));
}

function permission(): NotificationPermission | 'unsupported' {
  return 'Notification' in window ? Notification.permission : 'unsupported';
}

/** Sets a time for a commitment's reminder, and offers it as a calendar event for when Viz it is closed. */
function ReminderEditor({ item, text, id }: { item: Commitment; text: BreakerText; id: string }) {
  const { t } = useI18n();
  const r = text.commitments.reminder;
  const [time, setTime] = useState(item.remindAt ?? '');
  const [state, setState] = useState<'idle' | 'saved' | 'need'>('idle');
  const [allowed, setAllowed] = useState(permission);
  const inputId = `${id}-time`;

  async function save() {
    if (!isTime(time)) {
      setState('need');
      document.getElementById(inputId)?.focus();
      return;
    }
    // Asked for here, right after the tap, which is when browsers allow it.
    if (allowed === 'default') setAllowed(await Notification.requestPermission());
    await setCommitmentReminder(item.id, time);
    setState('saved');
  }

  function calendar() {
    const ics = buildCommitmentIcs({ ...item, remindAt: time }, window.location.origin + import.meta.env.BASE_URL, t);
    downloadBlob(new Blob([ics], { type: 'text/calendar' }), 'vizit-commitment.ics');
  }

  return (
    <div id={id} className="flex flex-col gap-3 border-t border-(--border) p-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={inputId} className="text-sm font-semibold">
            {r.label}
          </label>
          <input
            id={inputId}
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              setState('idle');
            }}
            aria-invalid={state === 'need' ? true : undefined}
            className="field min-h-11 rounded-full border border-(--border) bg-(--surface-strong) px-3"
          />
        </div>
        <button type="button" onClick={() => void save()} className={btnSecondary}>
          <span aria-hidden="true">🔔</span>
          {r.set}
        </button>
        {item.remindAt && (
          <button
            type="button"
            onClick={() => {
              setTime('');
              setState('idle');
              void setCommitmentReminder(item.id, null);
            }}
            className={btnGhost}
          >
            {r.clear}
          </button>
        )}
      </div>
      <p role="status" className={state === 'need' ? 'text-sm font-medium text-(--danger)' : 'text-sm font-medium'}>
        {state === 'saved' ? `✓ ${r.saved}` : state === 'need' ? r.need : ''}
      </p>
      <p className="text-sm text-(--muted)">{allowed === 'denied' || allowed === 'unsupported' ? r.blocked : r.note}</p>
      {isTime(time) && (
        <button type="button" onClick={calendar} className={`${btnGhost} self-start text-sm`}>
          <span aria-hidden="true">📅</span>
          {r.calendar}
        </button>
      )}
    </div>
  );
}

/** The first day of the week where the person lives (1 Monday … 7 Sunday), where the browser can say. */
function weekStart(lang: string): number {
  try {
    const locale = new Intl.Locale(lang) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    return locale.getWeekInfo?.().firstDay ?? locale.weekInfo?.firstDay ?? 1;
  } catch {
    return 1;
  }
}

const DOT: Record<CommitmentStatus, string> = {
  done: 'bg-(--accent)',
  partial: 'bg-(--accent) opacity-50',
  doing: 'border-2 border-(--accent)',
  todo: 'border-2 border-(--muted)',
  skipped: 'bg-(--muted) opacity-40',
};

/**
 * A month at a glance: each day shows a dot per commitment, filled once done. Tapping a day shows its checklist.
 * A real table of buttons, so screen readers hear the weekday columns and each day's progress.
 */
function MonthCalendar({
  month,
  selected,
  commitments,
  text,
  onMonth,
  onSelect,
}: {
  month: Date;
  selected: string;
  commitments: Commitment[];
  text: BreakerText;
  onMonth: (month: Date) => void;
  onSelect: (date: string) => void;
}) {
  const { t } = useI18n();
  const c = text.commitments;
  const m = c.month;
  const first = weekStart(t.htmlLang);
  const weeks = monthGrid(month, first);
  const today = localDate();
  const byDate = new Map<string, Commitment[]>();
  for (const item of commitments) byDate.set(item.date, [...(byDate.get(item.date) ?? []), item]);
  const title = new Intl.DateTimeFormat(t.htmlLang, { month: 'long', year: 'numeric' }).format(month);
  const fullDate = new Intl.DateTimeFormat(t.htmlLang, { weekday: 'long', day: 'numeric', month: 'long' });
  const longDay = new Intl.DateTimeFormat(t.htmlLang, { weekday: 'long' });
  const narrowDay = new Intl.DateTimeFormat(t.htmlLang, { weekday: 'narrow' });
  // 4 January 2021 was a Monday; the headers follow the person's first day of the week.
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2021, 0, 4 + ((first - 1 + i) % 7)));
  const shift = (by: number) => onMonth(new Date(month.getFullYear(), month.getMonth() + by, 1));
  const now = new Date();
  const away = selected !== today || month.getMonth() !== now.getMonth() || month.getFullYear() !== now.getFullYear();
  const arrow = 'flex h-11 w-11 items-center justify-center rounded-full text-2xl font-bold hover:bg-(--surface-strong)';

  return (
    <div className="rounded-3xl bg-(--surface-alt) p-2 sm:p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <button type="button" onClick={() => shift(-1)} aria-label={m.prev} className={arrow}>
          <span aria-hidden="true" className="rtl:-scale-x-100">‹</span>
        </button>
        <p id="month-title" aria-live="polite" className="display text-lg font-extrabold capitalize">
          {title}
        </p>
        <button type="button" onClick={() => shift(1)} aria-label={m.next} className={arrow}>
          <span aria-hidden="true" className="rtl:-scale-x-100">›</span>
        </button>
      </div>
      <table aria-labelledby="month-title" className="w-full table-fixed border-separate border-spacing-0.5 sm:border-spacing-1">
        <thead>
          <tr>
            {weekdays.map((d) => (
              <th key={d.getDay()} scope="col" className="pb-1 text-xs font-semibold text-(--muted)">
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
                const items = [...(byDate.get(key) ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
                const done = items.filter((x) => x.status === 'done').length;
                const isSelected = key === selected;
                const isToday = key === today;
                const allDone = items.length > 0 && done === items.length;
                return (
                  <td key={i} className="p-0">
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      aria-current={isToday ? 'date' : undefined}
                      aria-label={`${fullDate.format(day)}: ${items.length ? c.progress(done, items.length) : m.nothing}`}
                      onClick={() => onSelect(key)}
                      className={`flex h-12 w-full flex-col items-center justify-center gap-1 rounded-2xl text-sm font-bold transition-colors sm:h-14 ${
                        isSelected
                          ? 'btn-glow text-(--on-accent)'
                          : allDone
                            ? 'bg-(--accent-soft) hover:bg-(--surface-strong)'
                            : 'hover:bg-(--surface-strong)'
                      } ${isToday && !isSelected ? 'ring-2 ring-(--accent) ring-inset' : ''}`}
                    >
                      <span>{day.getDate()}</span>
                      <span aria-hidden="true" className="flex h-1.5 gap-0.5">
                        {items.slice(0, 3).map((x) => (
                          <span
                            key={x.id}
                            className={`h-1.5 w-1.5 rounded-full ${
                              isSelected ? (x.status === 'done' ? 'bg-(--on-accent)' : 'border border-(--on-accent)') : DOT[x.status]
                            }`}
                          />
                        ))}
                      </span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {away && (
        <button
          type="button"
          onClick={() => {
            onMonth(new Date(now.getFullYear(), now.getMonth(), 1));
            onSelect(today);
          }}
          className={`${btnGhost} mt-1 text-sm`}
        >
          {m.today}
        </button>
      )}
    </div>
  );
}
