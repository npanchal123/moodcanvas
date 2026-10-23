import type { SceneId } from '../compose/types';

/** What makes a task hard to start. Self-reported: these describe the task in the moment, not the person. */
export const OBSTACLE_IDS = [
  'start', 'big', 'fear', 'badly', 'judged', 'motivation', 'distracted', 'overwhelmed', 'perfect', 'easier', 'time',
  'consistent', 'tired', 'other',
] as const;
export type ObstacleId = (typeof OBSTACLE_IDS)[number];

/** What has someone stuck, as they'd choose it on the Unstuck welcome screen. */
export const SITUATION_IDS = [
  'procrastinating', 'overwhelmed', 'overthinking', 'motivation', 'failing', 'focus', 'habits', 'life', 'decision',
  'other',
] as const;
export type SituationId = (typeof SITUATION_IDS)[number];

/** Situations with their own concrete steps, used when the words don't point to a kind of task. */
export const SITUATION_PLAN_IDS = ['overwhelmed', 'overthinking', 'focus', 'habits', 'life', 'decision'] as const;
export type SituationPlanId = (typeof SITUATION_PLAN_IDS)[number];

/** Follow-up questions about what feels hardest, offered depending on the situation. */
export const FOLLOW_UPS: Record<SituationId, ObstacleId[]> = {
  procrastinating: ['start', 'badly', 'big', 'judged', 'time', 'consistent'],
  overwhelmed: ['big', 'start', 'time'],
  overthinking: ['badly', 'judged', 'start'],
  motivation: ['big', 'consistent', 'time'],
  failing: ['badly', 'judged', 'big'],
  focus: ['start', 'big', 'time'],
  habits: ['consistent', 'time', 'start'],
  life: ['start', 'big', 'judged'],
  decision: ['start', 'badly', 'judged'],
  other: ['start', 'badly', 'big', 'judged', 'time', 'consistent'],
};

/** How someone would like to feel after a session. */
export const FEELING_IDS = [
  'calm', 'clear', 'confident', 'motivated', 'focused', 'lighter', 'ready', 'accepting', 'other',
] as const;
export type FeelingId = (typeof FEELING_IDS)[number];

/** The part of a visualization that rehearses a small, realistic step, chosen by the situation. */
export const REHEARSAL_IDS = ['begin', 'split', 'confidence', 'present', 'small', 'decide'] as const;
export type RehearsalId = (typeof REHEARSAL_IDS)[number];

/** Kinds of task with their own concrete first steps. Checked in this order; 'general' fits anything. */
export const CATEGORY_IDS = ['code', 'job', 'exercise', 'business', 'write', 'study', 'clean', 'admin', 'general'] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

/** 'interrupted' and 'rescheduled' come from older sessions and from "Schedule for later". */
export const OUTCOMES = ['done', 'progress', 'hard', 'different', 'stopped', 'interrupted', 'rescheduled'] as const;
export type BreakerOutcome = (typeof OUTCOMES)[number];
/** The answers offered to "How did it go?". */
export const ASKED_OUTCOMES = ['done', 'progress', 'hard', 'different', 'stopped'] as const satisfies readonly BreakerOutcome[];

/** Focus lengths offered before starting, in minutes. Two minutes is the default: starting is the goal. */
export const FOCUS_LENGTHS = [2, 5, 10] as const;

export interface ObstacleContent {
  /** First person, as the person would say it ("The task feels too big."). */
  label: string;
  /** What may help, in a sentence or two. */
  help: string;
  /** Words that hint at this obstacle in what someone wrote. Only the follow-up obstacles have them. */
  keywords?: string[];
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

/**
 * The Unstuck journey's answers so far. Kept by the app (and in this tab's session storage), so switching tabs or
 * reloading mid-way loses nothing.
 */
export interface BreakerDraft {
  /** 0 welcome, 1 understand and choose a feeling, 2 the visualization, 3 one small action */
  step: number;
  situations: SituationId[];
  /** Their own words: what's been on their mind. */
  task: string;
  obstacles: ObstacleId[];
  feelings: FeelingId[];
  scene: SceneId | null;
  /** Whether the visualization was played to the end. Unset until it ends. */
  practiceCompleted?: boolean;
  action: string;
  /** What the suggested step was worked out from; a change means a fresh suggestion. */
  actionFor: string;
  optionIndex: number;
  plannedMinutes: number;
  resumedFrom?: string;
}

export const EMPTY_BREAKER_DRAFT: BreakerDraft = {
  step: 0,
  situations: [],
  task: '',
  obstacles: [],
  feelings: [],
  scene: null,
  action: '',
  actionFor: '',
  optionIndex: 0,
  plannedMinutes: 2,
};

export const COMMITMENT_STATUSES = ['todo', 'doing', 'done', 'partial', 'skipped'] as const;
export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number];
export const ENERGY_LEVELS = ['low', 'medium', 'high'] as const;
export type Energy = (typeof ENERGY_LEVELS)[number];
/** At most this many commitments a day: enough to matter, few enough to finish. */
export const MAX_COMMITMENTS = 3;
/** At most this many monthly trackers, so the page stays light. */
export const MAX_TRACKERS = 5;
