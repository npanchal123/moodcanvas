import type { EmotionLabel } from './emotions';
import { entriesWithin } from './stats';
import type { EmotionEntry } from './types';

export type Insight =
  | { kind: 'lighter' | 'heavier'; tag: string; strength: number }
  | { kind: 'emotion'; tag: string; label: EmotionLabel; pct: number; strength: number };

export const INSIGHT_WINDOW_DAYS = 30;
/** Fewer than this many check-ins on either side and a comparison means little. */
const MIN_GROUP = 3;
const MIN_VALENCE_GAP = 0.3;
const MIN_EMOTION_SHARE = 60;
const MAX_INSIGHTS = 4;

function averageValence(entries: EmotionEntry[]): number {
  return entries.reduce((sum, e) => sum + e.valence, 0) / entries.length;
}

/**
 * Looks for tags that go with noticeably lighter or heavier check-ins, or with
 * one feeling most of the time. These are associations, never causes; the UI
 * says so.
 */
export function findInsights(entries: EmotionEntry[], now = Date.now()): Insight[] {
  const recent = entriesWithin(entries, INSIGHT_WINDOW_DAYS, now);
  const tags = [...new Set(recent.flatMap((e) => e.tags))];
  const found: Insight[] = [];

  for (const tag of tags) {
    const tagged = recent.filter((e) => e.tags.includes(tag));
    if (tagged.length < MIN_GROUP) continue;

    const others = recent.filter((e) => !e.tags.includes(tag));
    if (others.length >= MIN_GROUP) {
      const gap = averageValence(tagged) - averageValence(others);
      if (Math.abs(gap) >= MIN_VALENCE_GAP) {
        found.push({ kind: gap > 0 ? 'lighter' : 'heavier', tag, strength: Math.abs(gap) });
      }
    }

    const counts = new Map<EmotionLabel, number>();
    for (const e of tagged) {
      const label = e.emotions[0]?.label;
      if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    const [top] = [...counts].sort((a, b) => b[1] - a[1]);
    if (top) {
      const pct = Math.round((top[1] / tagged.length) * 100);
      if (pct >= MIN_EMOTION_SHARE) found.push({ kind: 'emotion', tag, label: top[0], pct, strength: pct / 100 });
    }
  }

  // Valence comparisons first (they're the more interesting finding), strongest first.
  return found
    .sort((a, b) => Number(a.kind === 'emotion') - Number(b.kind === 'emotion') || b.strength - a.strength)
    .slice(0, MAX_INSIGHTS);
}
