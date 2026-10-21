import type { Locale } from '../i18n';
import type { EmotionLabel } from '../lib/emotions';
import { en } from './en';
import { es } from './es';
import { PRACTICE_IDS, type Minutes, type PracticeContent, type PracticeId } from './types';

export { LENGTHS, PRACTICE_IDS } from './types';
export type { Lesson, Minutes, PracticeId, PracticeScript, Segment } from './types';

export const PRACTICE_CONTENT: Record<Locale, PracticeContent> = { en, es };

interface PracticeMeta {
  icon: string;
  /** Feelings this practice is suggested for. The first practice listing a feeling is its default. */
  feelings: EmotionLabel[];
  lengths: readonly Minutes[];
  /** Orb colors (light → deep), chosen to suit the imagery. */
  hues: [string, string];
}

export const PRACTICE_META: Record<PracticeId, PracticeMeta> = {
  'first-visualization': { icon: '🍋', feelings: [], lengths: [3], hues: ['#fde68a', '#d97706'] },
  'safe-place': { icon: '🏝️', feelings: ['fear'], lengths: [3, 5, 10], hues: ['#c4b5fd', '#6d28d9'] },
  'warm-light': { icon: '🕯️', feelings: ['sadness'], lengths: [3, 5, 10], hues: ['#fed7aa', '#ea580c'] },
  'cooling-stream': { icon: '🍃', feelings: ['anger', 'disgust'], lengths: [3, 5, 10], hues: ['#a5f3fc', '#0e7490'] },
  savoring: { icon: '🌼', feelings: ['joy'], lengths: [3, 5, 10], hues: ['#fef08a', '#ca8a04'] },
  'grounding-tree': { icon: '🌳', feelings: ['calm'], lengths: [3, 5, 10], hues: ['#bbf7d0', '#15803d'] },
  'clear-sky': { icon: '☁️', feelings: ['surprise'], lengths: [3, 5, 10], hues: ['#bae6fd', '#0369a1'] },
};

export function practiceFor(feeling: EmotionLabel): PracticeId {
  return PRACTICE_IDS.find((id) => PRACTICE_META[id].feelings.includes(feeling)) ?? 'clear-sky';
}
