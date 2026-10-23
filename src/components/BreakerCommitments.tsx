import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import {
  commitmentWeek,
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
import { db } from '../lib/db';
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
  const [date, setDate] = useState(() => localDate());
  const all = useLiveQuery(() => db.commitments.toArray(), []) ?? NONE;
  const day = all.filter((x) => x.date === date).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const week = commitmentWeek(all);
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
    [c.weekStats.created, week.created],
    [c.weekStats.done, week.done],
    [c.weekStats.partial, week.partial],
    [c.weekStats.days, week.days],
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
          <label className="flex items-center gap-2 text-sm font-semibold">
            <span className="sr-only">{c.date}</span>
            <span aria-hidden="true">📅</span>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="field min-h-11 rounded-full border border-(--border) bg-(--surface-strong) px-3"
            />
          </label>
        </div>

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
          <h2 id="week-heading" className="text-xl font-semibold">
            {c.week}
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
        {week.kinds.length > 0 && (
          <p className="text-(--muted)">
            {c.topKinds}: {week.kinds.map((k) => text.categoryNames[k]).join(' · ')}
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
    setSaving(true);
    if (await onAdd(title)) setTitle('');
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
