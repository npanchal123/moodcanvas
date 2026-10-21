import { useMemo, useState } from 'react';
import { formatDateTime, tagLabel, useI18n } from '../i18n';
import { deleteEntry } from '../lib/entries';
import { weeklyReflection } from '../lib/reflection';
import { entriesWithin, frequency, streak } from '../lib/stats';
import { displayEmotions, effectiveIntensity } from '../lib/summary';
import type { EmotionEntry, PracticeLog } from '../lib/types';
import { PRACTICE_CONTENT, PRACTICE_IDS, PRACTICE_META, type PracticeId } from '../practices';
import { EmotionBloom } from './EmotionBloom';
import { FrequencyChart } from './FrequencyChart';
import { Insights } from './Insights';
import { MoodCalendar } from './MoodCalendar';
import { btnGhost, card, toggle } from './ui';

const RANGES = [7, 30] as const;

interface Props {
  entries: EmotionEntry[];
  logs: PracticeLog[];
  animate: boolean;
}

const LOG_LIMIT = 20;
const DAY_MS = 86_400_000;

function isPracticeId(id: string): id is PracticeId {
  return (PRACTICE_IDS as readonly string[]).includes(id);
}

/** Default export so App can load it lazily. */
export default function History({ entries, logs, animate }: Props) {
  const { t, locale } = useI18n();
  const [days, setDays] = useState<(typeof RANGES)[number]>(7);
  const [tag, setTag] = useState('');
  const allTags = useMemo(() => [...new Set(entries.flatMap((e) => e.tags))].sort(), [entries]);
  const activeTag = allTags.includes(tag) ? tag : '';
  const shown = useMemo(
    () => (activeTag ? entries.filter((e) => e.tags.includes(activeTag)) : entries),
    [entries, activeTag],
  );

  const rows = useMemo(() => frequency(shown, days), [shown, days]);
  const inRange = useMemo(() => entriesWithin(shown, days).length, [shown, days]);
  const streakDays = useMemo(() => streak(entries), [entries]);
  const practicesInRange = useMemo(
    () => logs.filter((l) => Date.parse(l.startedAt) >= Date.now() - days * DAY_MS).length,
    [logs, days],
  );
  const reflection = useMemo(() => weeklyReflection(entries, t, locale), [entries, t, locale]);

  async function handleDelete(entry: EmotionEntry) {
    if (window.confirm(t.history.deleteConfirm(formatDateTime(entry.createdAt, locale)))) {
      await deleteEntry(entry.id);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="reflection-heading" className={card}>
        <h2 id="reflection-heading" className="mb-3 text-xl font-semibold">
          {t.history.weekHeading}
        </h2>
        <ul className="flex flex-col gap-2">
          {reflection.map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden="true" className="text-(--muted)">
                •
              </span>
              {line}
            </li>
          ))}
        </ul>
      </section>

      <Insights entries={entries} />

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="tag-filter" className="font-medium">
            {t.history.filterLabel}
          </label>
          <select
            id="tag-filter"
            value={activeTag}
            onChange={(e) => setTag(e.target.value)}
            className="min-h-11 rounded-xl border border-(--border) bg-(--surface) px-3"
          >
            <option value="">{t.history.filterAny}</option>
            {allTags.map((x) => (
              <option key={x} value={x}>
                {tagLabel(t, x)}
              </option>
            ))}
          </select>
        </div>
      )}

      <section aria-labelledby="calendar-heading" className={card}>
        <h2 id="calendar-heading" className="mb-3 text-xl font-semibold">
          {t.history.calendarHeading}
          {activeTag && <span className="font-normal text-(--muted)"> · “{tagLabel(t, activeTag)}”</span>}
        </h2>
        <MoodCalendar entries={shown} />
      </section>

      <section aria-labelledby="patterns-heading" className={`${card} flex flex-col gap-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="patterns-heading" className="text-xl font-semibold">
            {t.history.patternsHeading}
          </h2>
          <div role="group" aria-label={t.history.rangeLabel} className="flex gap-2">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={days === r}
                onClick={() => setDays(r)}
                className={`${toggle(days === r)} text-sm`}
              >
                {t.history.days(r)}
              </button>
            ))}
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-(--surface-alt) p-3">
            <dt className="text-sm text-(--muted)">{t.history.checkInsStat}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{inRange}</dd>
          </div>
          <div className="rounded-xl bg-(--surface-alt) p-3">
            <dt className="text-sm text-(--muted)">{t.history.practicesStat}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{practicesInRange}</dd>
          </div>
          <div className="rounded-xl bg-(--surface-alt) p-3">
            <dt className="text-sm text-(--muted)">{t.history.streakStat}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{streakDays}</dd>
          </div>
        </dl>
        <FrequencyChart rows={rows} days={days} animate={animate} />
      </section>

      <section aria-labelledby="practice-log-heading" className={card}>
        <h2 id="practice-log-heading" className="mb-3 text-xl font-semibold">
          {t.history.practiceLogHeading}
        </h2>
        {logs.length === 0 ? (
          <p className="text-(--muted)">{t.history.practiceLogEmpty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-(--border)">
            {logs.slice(0, LOG_LIMIT).map((l) => {
              const library = isPracticeId(l.practiceId) ? l.practiceId : null;
              const icon = library ? PRACTICE_META[library].icon : (l.icon ?? '✨');
              const title = library ? PRACTICE_CONTENT[locale].practices[library].title : (l.title ?? '');
              return (
                <li key={l.id} className="py-3">
                  <p className="font-medium">
                    <span aria-hidden="true">{icon} </span>
                    {t.history.practiceItem(title, l.minutes)}
                    {!l.completed && <span className="font-normal text-(--muted)"> · {t.history.endedEarly}</span>}
                  </p>
                  <p className="text-sm text-(--muted)">
                    <time dateTime={l.startedAt}>{formatDateTime(l.startedAt, locale)}</time>
                    {l.before && l.after != null && (
                      <> · {t.practice.change(t.emotions[l.before.emotion].name, l.before.intensity, l.after)}</>
                    )}
                    {l.felt && <> · {t.practice.felt[l.felt]}</>}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="entries-heading" className={card}>
        <h2 id="entries-heading" className="mb-3 text-xl font-semibold">
          {t.history.listHeading}
        </h2>
        {shown.length === 0 ? (
          <p className="text-(--muted)">{t.history.empty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-(--border)">
            {shown.map((entry) => {
              const when = formatDateTime(entry.createdAt, locale);
              return (
                <li key={entry.id} className="flex items-start gap-3 py-3">
                  <EmotionBloom emotions={displayEmotions(entry)} valence={entry.valence} size={56} decorative />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {t.emotions[entry.emotions[0].label].name} · {effectiveIntensity(entry)}/100
                      {entry.userAdjusted && <span className="font-normal text-(--muted)">{t.history.yourRating}</span>}
                    </p>
                    <p className="text-sm text-(--muted)">
                      <time dateTime={entry.createdAt}>{when}</time>
                    </p>
                    {entry.text && <p className="mt-1 line-clamp-2 break-words text-sm">{entry.text}</p>}
                    {entry.tags.length > 0 && (
                      <p className="mt-1 flex flex-wrap gap-1">
                        <span className="sr-only">{t.history.tagsLabel}</span>
                        {entry.tags.map((x) => (
                          <span key={x} className="rounded-full bg-(--surface-alt) px-2 text-xs leading-5">
                            {tagLabel(t, x)}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDelete(entry)}
                    aria-label={t.history.deleteLabel(when)}
                    className={`${btnGhost} text-sm`}
                  >
                    {t.history.delete}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
