import type { Minutes } from '../../practices';

export const SCENE_IDS = ['beach', 'forest', 'mountain', 'garden', 'river', 'rain', 'stars', 'home', 'sky'] as const;
export type SceneId = (typeof SCENE_IDS)[number];

export const GOAL_IDS = ['calm', 'letgo', 'kindness', 'sleep', 'confidence', 'energy', 'joy', 'focus'] as const;
export type GoalId = (typeof GOAL_IDS)[number];

export const TOPIC_IDS = [
  'exam', 'work', 'relationship', 'family', 'friends', 'health', 'money', 'future', 'exercise', 'sport', 'performance',
] as const;
export type TopicId = (typeof TOPIC_IDS)[number];

/** What kind of visualization: a future to work toward, the steps toward it, or a challenge to rehearse. */
export const MODE_IDS = ['future', 'process', 'obstacle'] as const;
export type ModeId = (typeof MODE_IDS)[number];

/**
 * One spoken line of a composed practice. Tokens filled in at compose time:
 * - {place}: the place the person asked for in their own words, or the scene's default ("a quiet beach")
 * - {topic}: what it's about ("the exam"), or a gentle default ("what's on your mind")
 * - {carrier}: what carries thoughts away in this scene ("a wave", "the breeze")
 * - {focus}: what the mode is about: the topic if there is one ("the game"), else the mode's own words
 */
export interface Line {
  text: string;
  tier: Minutes;
  pause: number;
  breath?: boolean;
}

export interface SceneContent {
  /** Short name for buttons ("Beach"). */
  name: string;
  /** Title of a practice set here ("Quiet Beach"). */
  title: string;
  /** Default {place} when the person didn't name one ("a quiet beach"). */
  place: string;
  carrier: string;
  keywords: string[];
  /** About six lines: arriving, seeing, hearing, touch, scent, settling. */
  lines: Line[];
}

export interface GoalContent {
  /** Button label ("Let go"). */
  name: string;
  keywords: string[];
  /** About six lines of the technique itself. */
  lines: Line[];
}

export interface ModeContent {
  name: string;
  /** One line under the name on its card. */
  description: string;
  /** Why it's suggested, when words in the description point to it. */
  why: string;
  /** Spoken in place of {focus} when no topic was found ("the task in front of you"). */
  focus: string;
  keywords: string[];
  /**
   * Alternative wordings of the mode's part of the session (about five lines each, tiers 3 to 15). One is chosen
   * from the person's words, so different requests sound different and the same request sounds the same.
   */
  variants: Line[][];
}

export interface TopicContent {
  keywords: string[];
  /** Spoken in place of {topic}. */
  phrase: string;
}

export interface ComposeContent {
  scenes: Record<SceneId, SceneContent>;
  /** Used when the person names a place no scene recognizes: works for anywhere. */
  anyPlace: Line[];
  goals: Record<GoalId, GoalContent>;
  topics: Record<TopicId, TopicContent>;
  /** {topic} when nothing specific was mentioned. */
  defaultTopic: string;
  /** The opening line: reflects back what they said. */
  mirror: (feeling: { adjective: string; noun: string } | null, topic: string | null) => string;
  /** Settling in and breathing, after the mirror line. */
  arrival: Line[];
  /** Said near the start: works for people who picture things, and for people who don't. */
  imagery: Line;
  modes: Record<ModeId, ModeContent>;
  /** Just before the closing: what to notice or carry with you, fitting the mode ('rest' when there's none). */
  integrate: Record<ModeId | 'rest', Line>;
  closing: Line[];
  /**
   * Finds the place in "take me to …" / "… ले चलो" / "llévame a …". `raw` is exactly what they typed;
   * `place` is the same words turned to "your" for speaking back.
   */
  findPlace: (text: string) => { raw: string; place: string } | null;
  title: (place: string) => string;
  subtitle: (goal: string, topic: string | null) => string;
}
