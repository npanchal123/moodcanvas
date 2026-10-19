import type { Messages } from '../i18n/en';
import type { EmotionEntry, EmotionScore } from './types';

/** The user's own rating wins over the analyzer's score for the primary emotion. */
export function effectiveIntensity(entry: EmotionEntry): number {
  return entry.userRating != null ? entry.userRating * 10 : (entry.emotions[0]?.intensity ?? 0);
}

export function displayEmotions(entry: EmotionEntry): EmotionScore[] {
  return entry.emotions.map((e, i) => (i === 0 ? { ...e, intensity: effectiveIntensity(entry) } : e));
}

export type Band = 'mild' | 'moderate' | 'strong';

export function intensityBand(value: number): Band {
  return value < 34 ? 'mild' : value < 67 ? 'moderate' : 'strong';
}

/** Plain-language sentence used as the result heading and the screen-reader summary. */
export function describeEntry(entry: EmotionEntry, t: Messages): string {
  const [primary, secondary] = displayEmotions(entry);
  if (!primary) return t.result.noEmotion;
  const adjective = t.emotions[primary.label].adjective;
  const lead = secondary ? t.result.mostly(adjective) : t.result.feeling(adjective);
  const tail = secondary ? t.result.withSome(t.emotions[secondary.label].noun) : '';
  return `${lead} · ${t.result.outOf100(primary.intensity)}${tail}`;
}
