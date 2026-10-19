import type { EmotionLabel } from './emotions';
import { dayKey } from './stats';
import { effectiveIntensity } from './summary';
import type { EmotionEntry } from './types';

export interface CalendarDay {
  date: Date;
  inFuture: boolean;
  count: number;
  /** The primary emotion logged most that day; ties go to the stronger one. */
  dominant?: EmotionLabel;
  /** Average intensity of the dominant emotion's check-ins. */
  avgIntensity: number;
}

function startOfWeek(d: Date): Date {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  return start;
}

/** Monday-first weeks, oldest first, ending with the current week. */
export function buildCalendar(entries: EmotionEntry[], weeks = 5, now = new Date()): CalendarDay[][] {
  const byDay = new Map<string, EmotionEntry[]>();
  for (const entry of entries) {
    const key = dayKey(new Date(entry.createdAt));
    byDay.set(key, [...(byDay.get(key) ?? []), entry]);
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const cursor = startOfWeek(now);
  cursor.setDate(cursor.getDate() - (weeks - 1) * 7);

  const grid: CalendarDay[][] = [];
  for (let w = 0; w < weeks; w++) {
    const row: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(cursor);
      const dayEntries = byDay.get(dayKey(date)) ?? [];
      row.push({ date, inFuture: date > today, count: dayEntries.length, ...dominantOf(dayEntries) });
      cursor.setDate(cursor.getDate() + 1);
    }
    grid.push(row);
  }
  return grid;
}

function dominantOf(entries: EmotionEntry[]): Pick<CalendarDay, 'dominant' | 'avgIntensity'> {
  const totals = new Map<EmotionLabel, { count: number; sum: number }>();
  for (const entry of entries) {
    const label = entry.emotions[0]?.label;
    if (!label) continue;
    const t = totals.get(label) ?? { count: 0, sum: 0 };
    t.count++;
    t.sum += effectiveIntensity(entry);
    totals.set(label, t);
  }
  let best: [EmotionLabel, { count: number; sum: number }] | undefined;
  for (const pair of totals) {
    if (!best || pair[1].count > best[1].count || (pair[1].count === best[1].count && pair[1].sum > best[1].sum)) {
      best = pair;
    }
  }
  return best ? { dominant: best[0], avgIntensity: Math.round(best[1].sum / best[1].count) } : { avgIntensity: 0 };
}
