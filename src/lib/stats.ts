import type { Messages } from '../i18n/en';
import type { EmotionLabel } from './emotions';
import { displayEmotions } from './summary';
import type { EmotionEntry } from './types';

const DAY_MS = 86_400_000;

export interface FrequencyRow {
  label: EmotionLabel;
  count: number;
  avgIntensity: number;
}

export function entriesWithin(entries: EmotionEntry[], days: number, now = Date.now()): EmotionEntry[] {
  const cutoff = now - days * DAY_MS;
  return entries.filter((e) => Date.parse(e.createdAt) >= cutoff);
}

/**
 * An emotion counts towards frequency when it is an entry's primary emotion,
 * or a secondary one with intensity of at least 30.
 */
export function frequency(entries: EmotionEntry[], days: number, now = Date.now()): FrequencyRow[] {
  const totals = new Map<EmotionLabel, { count: number; sum: number }>();
  for (const entry of entriesWithin(entries, days, now)) {
    displayEmotions(entry).forEach((e, i) => {
      if (i > 0 && e.intensity < 30) return;
      const t = totals.get(e.label) ?? { count: 0, sum: 0 };
      t.count++;
      t.sum += e.intensity;
      totals.set(e.label, t);
    });
  }
  return [...totals]
    .map(([label, t]) => ({ label, count: t.count, avgIntensity: Math.round(t.sum / t.count) }))
    .sort((a, b) => b.count - a.count || b.avgIntensity - a.avgIntensity);
}

/** Local calendar day, so a late-night check-in counts for the day the user lived it. */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Consecutive days with at least one check-in, still alive if the last one was yesterday. */
export function streak(entries: EmotionEntry[], now = new Date()): number {
  const days = new Set(entries.map((e) => dayKey(new Date(e.createdAt))));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function frequencySummary(rows: FrequencyRow[], days: number, t: Messages): string {
  return t.chart.summary(
    days,
    rows.map((r) => t.chart.part(t.emotions[r.label].name, r.count, r.avgIntensity)),
  );
}
