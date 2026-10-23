export const PRACTICE_IDS = [
  'first-visualization',
  'safe-place',
  'warm-light',
  'cooling-stream',
  'savoring',
  'grounding-tree',
  'clear-sky',
] as const;
export type PracticeId = (typeof PRACTICE_IDS)[number];

/** Lengths of the library practices. */
export const LENGTHS = [3, 5, 10] as const;
/** Lengths of visualizations composed from someone's words; 5 is the default. */
export const COMPOSED_LENGTHS = [2, 5, 10, 15] as const;
export type Minutes = 2 | 3 | 5 | 10 | 15;

/** One spoken step of a practice, followed by a silence to imagine in. */
export interface Segment {
  /** Stable across languages; names the audio file. */
  id: string;
  text: string;
  /** Shortest version this step appears in: 3 = every version (2 minutes too), 15 = only the 15-minute one. */
  tier: Minutes;
  /** Relative length of the silence after this step. Silences are stretched to fill the chosen length. */
  pause: number;
  /** Show the breathing guide during the silence. */
  breath?: boolean;
}

export interface PracticeScript {
  title: string;
  summary: string;
  segments: Segment[];
}

export interface Lesson {
  title: string;
  body: string[];
}

export interface PracticeContent {
  practices: Record<PracticeId, PracticeScript>;
  lessons: Lesson[];
}
