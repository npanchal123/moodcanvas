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

export const LENGTHS = [3, 5, 10] as const;
export type Minutes = (typeof LENGTHS)[number];

/** One spoken step of a practice, followed by a silence to imagine in. */
export interface Segment {
  /** Stable across languages; names the audio file. */
  id: string;
  text: string;
  /** Shortest version this step appears in: 3 = every version, 10 = only the 10-minute one. */
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
