import type { EmotionEntry } from './types';

/** Builds an entry `daysAgo` days before `now`, for tests. */
export function makeEntry(
  now: Date,
  daysAgo: number,
  emotions: EmotionEntry['emotions'],
  extra: Partial<EmotionEntry> = {},
): EmotionEntry {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  const createdAt = d.toISOString();
  return {
    id: `${daysAgo}-${emotions[0]?.label}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
    text: '',
    emotions,
    valence: 0,
    confidence: 1,
    userAdjusted: false,
    tags: [],
    analyzerVersion: 'test',
    updatedAt: createdAt,
    dirty: 0,
    ...extra,
  };
}
