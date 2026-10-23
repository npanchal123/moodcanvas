import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import {
  COMMITMENT_STATUSES,
  commitmentWeek,
  ENERGY_LEVELS,
  LIMITS,
  localDate,
  MAX_COMMITMENTS,
  smaller,
  type BreakerText,
  type Energy,
} from '../lib/breaker';
import { addCommitment, deleteCommitment, getEnergy, setEnergy, updateCommitment } from '../lib/breaker/store';
import { db } from '../lib/db';
import type { Commitment } from '../lib/types';
import { btnGhost, btnPrimary, btnSecondary, card, toggle } from './ui';

const NONE: Commitment[] = [];
const field =
  'field w-full rounded-2xl border border-(--border) bg-(--surface-strong) p-3 leading-relaxed transition-shadow';
const LENGTHS = [5, 10, 25] as const;
/** The suggested length for each energy level: a low-energy day gets the smallest. */
const MINUTES_FOR: Record<Energy, number> = { low: 5, medium: 10, high: 25 };

/**
 * Daily commitments: up to three small things for a day, an optional energy check that only changes the suggested
 * size, and a week's counts taken straight from what was recorded. No streaks.
 */
export function BreakerCommitments({ text }: { text: BreakerText }) {
  const c = text.commitments;
  const [date, setDate] = useState(() => localDate());
  const all = useLiveQuery(() => db.commitments.toArray(), []) ?? NONE;
  const day = all.filter((x) => x.date === date).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const week = commitmentWeek(all);
  const [energy, setEnergyState] = useState<Energy | undefined>();

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

  const tiles: [string, number][] = [
    [c.weekStats.created, week.created],
    [c.weekStats.done, week.done],
    [c.weekStats.partial, week.partial],
    [c.weekStats.days, week.days],
  ];

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="commitments-heading" className={`${card} fade-up flex flex-col gap-5`}>
        <div className="flex flex-col gap-2">
          <h2 id="commitments-heading" className="display text-2xl leading-tight font-extrabold sm:text-3xl">
            {c.title}
          </h2>
          <p className="text-(--muted)">{c.body}</p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="commitment-date" className="font-semibold">
            {c.date}
          </label>
          <input
            id="commitment-date"
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className={`${field} w-auto self-start`}
          />
        </div>

        <div role="group" aria-labelledby="energy-label" className="flex flex-col gap-2">
          <p id="energy-label" className="font-semibold">
            {c.energy}
          </p>
          <p className="-mt-1 text-sm text-(--muted)">{c.energyOptional}</p>
          <div className="flex flex-wrap gap-2">
            {ENERGY_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={energy === level}
                onClick={() => void chooseEnergy(level)}
                className={`${toggle(energy === level)} text-sm`}
              >
                {c.energyLevels[level]}
              </button>
            ))}
          </div>
          {energy && <p className="rounded-2xl bg-(--surface-alt) px-4 py-3">{c.energyTips[energy]}</p>}
        </div>

        {day.length === 0 ? (
          <p className="text-(--muted)">{c.empty}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {day.map((item) => (
              <CommitmentItem key={item.id} item={item} text={text} />
            ))}
          </ul>
        )}

        {day.length < MAX_COMMITMENTS ? (
          <AddCommitment key={`${date}-${energy}`} date={date} text={text} minutes={energy ? MINUTES_FOR[energy] : 10} />
        ) : (
          <p className="text-(--muted)">{c.full}</p>
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

function AddCommitment({ date, text, minutes: suggested }: { date: string; text: BreakerText; minutes: number }) {
  const c = text.commitments;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minutes, setMinutes] = useState(suggested);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!title.trim()) {
      setError(c.need);
      document.getElementById('commitment-title')?.focus();
      return;
    }
    setSaving(true);
    try {
      // Checked again here, in case another tab added one meanwhile.
      if ((await db.commitments.where('date').equals(date).count()) >= MAX_COMMITMENTS) {
        setError(c.full);
        return;
      }
      await addCommitment({ date, title, description, minutes });
      setTitle('');
      setDescription('');
      setError('');
    } catch {
      setError(text.journal.failed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form noValidate onSubmit={(e) => void add(e)} className="flex flex-col gap-3 rounded-2xl border border-(--border) p-4">
      <h3 className="font-semibold">{c.add}</h3>
      <div className="flex flex-col gap-1">
        <label htmlFor="commitment-title" className="text-sm font-semibold">
          {c.titleLabel}
        </label>
        <input
          id="commitment-title"
          maxLength={LIMITS.short}
          value={title}
          placeholder={c.titlePlaceholder}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'commitment-error' : undefined}
          className={field}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="commitment-description" className="text-sm font-semibold">
          {c.description}
        </label>
        <textarea
          id="commitment-description"
          rows={2}
          maxLength={LIMITS.long}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={field}
        />
      </div>
      <div role="group" aria-labelledby="commitment-minutes" className="flex flex-col gap-2">
        <p id="commitment-minutes" className="text-sm font-semibold">
          {c.minutes}
        </p>
        <div className="flex flex-wrap gap-2">
          {LENGTHS.map((m) => (
            <button key={m} type="button" aria-pressed={minutes === m} onClick={() => setMinutes(m)} className={`${toggle(minutes === m)} text-sm`}>
              {text.mins(m)}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <p id="commitment-error" role="alert" className="font-medium text-(--danger)">
          {error}
        </p>
      )}
      <button type="submit" disabled={saving} className={`${btnPrimary} self-start`}>
        {c.add}
      </button>
    </form>
  );
}

function CommitmentItem({ item, text }: { item: Commitment; text: BreakerText }) {
  const c = text.commitments;
  const [reflection, setReflection] = useState(item.reflection ?? '');
  const [saved, setSaved] = useState(false);
  const smallerStep = smaller(text, item.title, item.title);
  const reflect = item.status === 'done' || item.status === 'partial' || item.status === 'skipped';
  const statusId = `status-${item.id}`;

  async function saveReflection() {
    await updateCommitment(item.id, { reflection });
    setSaved(true);
  }

  /** The smaller step takes the title; what it was before stays in the details, so nothing is lost. */
  async function makeSmaller(step: string) {
    const description = [item.title, item.description].filter(Boolean).join('\n');
    await updateCommitment(item.id, { title: step, description });
  }

  async function remove() {
    if (window.confirm(c.deleteConfirm)) await deleteCommitment(item.id);
  }

  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-(--surface-alt) p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold break-words">{item.title}</h3>
          {item.description && <p className="text-sm break-words whitespace-pre-line text-(--muted)">{item.description}</p>}
          <p className="text-sm text-(--muted)">{text.mins(item.minutes)}</p>
        </div>
        <span className="rounded-full border border-(--border) bg-(--surface-strong) px-3 py-1 text-sm font-medium">
          {c.statuses[item.status]}
        </span>
      </div>
      <div role="group" aria-labelledby={statusId} className="flex flex-col gap-2">
        <p id={statusId} className="sr-only">
          {c.status}: {item.title}
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMITMENT_STATUSES.map((s) => (
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
      </div>
      {reflect && (
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
            <button type="button" onClick={() => void saveReflection()} className={btnSecondary}>
              {c.saveReflection}
            </button>
            <p role="status" className="text-sm font-medium">
              {saved ? `✓ ${c.saved}` : ''}
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {item.status !== 'done' && smallerStep && smallerStep !== item.title && (
          <button type="button" onClick={() => void makeSmaller(smallerStep)} className={btnSecondary}>
            <span aria-hidden="true">↓</span>
            {c.smaller}
          </button>
        )}
        <button type="button" onClick={() => void remove()} className={`${btnGhost} text-(--danger)`}>
          {c.delete}
        </button>
      </div>
    </li>
  );
}
