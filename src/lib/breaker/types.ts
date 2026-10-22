/** What makes a task hard to start. Self-reported: these describe the task in the moment, not the person. */
export const OBSTACLE_IDS = [
  'start', 'big', 'fear', 'badly', 'motivation', 'distracted', 'overwhelmed', 'perfect', 'easier', 'time', 'tired',
  'other',
] as const;
export type ObstacleId = (typeof OBSTACLE_IDS)[number];

/** Kinds of task with their own concrete first steps. Checked in this order; 'general' fits anything. */
export const CATEGORY_IDS = ['code', 'job', 'exercise', 'business', 'write', 'study', 'clean', 'admin', 'general'] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export const OUTCOMES = ['done', 'progress', 'hard', 'interrupted', 'rescheduled'] as const;
export type BreakerOutcome = (typeof OUTCOMES)[number];

/** Focus lengths offered before starting, in minutes. Two minutes is the default: starting is the goal. */
export const FOCUS_LENGTHS = [2, 10, 25] as const;

export interface ObstacleContent {
  /** First person, as the person would say it ("The task feels too big."). */
  label: string;
  /** What may help, in a sentence or two. */
  help: string;
  /** A suggested if–then plan. */
  plan: string;
}

export interface CategoryContent {
  /** Words that point to this kind of task, in this language. */
  keywords: string[];
  /** Three or four concrete steps, easiest useful one first. */
  steps: string[];
  /** Something that can be started in about two minutes. */
  tiny: string;
  /** Smaller still: just getting set up. */
  prep: string;
  /** A rough first version that's good enough to improve later. */
  draft: string;
}

/** The guided flow's answers so far. Kept by the app, so switching tabs mid-flow loses nothing. */
export interface BreakerDraft {
  /** 0 task, 1 obstacle, 2 why, 3 first step, 4 if–then plan, 5 ready to start */
  step: number;
  task: string;
  obstacles: ObstacleId[];
  otherObstacle: string;
  why: string;
  vision: string;
  setAside: string;
  /** Time available, when short on time. */
  minutesAvailable?: number;
  action: string;
  /** What the suggested step was worked out from; a change means a fresh suggestion. */
  actionFor: string;
  optionIndex: number;
  plan: string;
  plannedMinutes: number;
  resumedFrom?: string;
}

export const EMPTY_BREAKER_DRAFT: BreakerDraft = {
  step: 0,
  task: '',
  obstacles: [],
  otherObstacle: '',
  why: '',
  vision: '',
  setAside: '',
  action: '',
  actionFor: '',
  optionIndex: 0,
  plan: '',
  plannedMinutes: 2,
};
