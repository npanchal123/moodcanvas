import type { BreakerOutcome, ObstacleId } from './breaker/types';
import type { EmotionLabel } from './emotions';

export interface EmotionScore {
  label: EmotionLabel;
  /** 0–100 */
  intensity: number;
}

export interface EmotionEntry {
  id: string;
  /** ISO timestamp */
  createdAt: string;
  /** Stored on this device only; left out of shares and exports unless the user opts in. */
  text: string;
  /** Sorted strongest first. */
  emotions: EmotionScore[];
  /** -1 (negative) to 1 (positive) */
  valence: number;
  /** 0–1: share of meaningful words the analyzer recognised */
  confidence: number;
  /** 1–10 override from the "Feels off?" slider */
  userRating?: number;
  userAdjusted: boolean;
  tags: string[];
  /** Lets older entries be re-scored when the analyzer improves. */
  analyzerVersion: string;
  /** ISO timestamp of the last change; the newer side wins when syncing. */
  updatedAt: string;
  /** 1 when this device has changes the server hasn't seen yet. */
  dirty: 0 | 1;
}

/** How someone felt before a practice, taken from the check-in it was started from. */
export interface PracticeBefore {
  entryId: string;
  emotion: EmotionLabel;
  /** 0–100 */
  intensity: number;
}

/** One guided practice. Kept on this device only (not synced yet). */
export interface PracticeLog {
  id: string;
  /** A library practice id, or 'custom' for one composed from the person's words. */
  practiceId: string;
  /** Composed practices only: their title and icon, since they aren't in the library. */
  title?: string;
  icon?: string;
  minutes: number;
  /** ISO timestamp */
  startedAt: string;
  /** False when ended early. */
  completed: boolean;
  before?: PracticeBefore;
  /** 0–100: how strong the same feeling was afterwards. Only set when there was a "before". */
  after?: number;
  /** Self-report when there was no check-in to compare with. */
  felt?: 'better' | 'same' | 'worse';
}

/**
 * One Procrastination Breaker session: a task someone was putting off, what made it hard, the small step they
 * chose and how the focus time went. Kept on this device only, like the practice log.
 */
export interface BreakerSession {
  id: string;
  /** The task in their own words. */
  task: string;
  obstacles: ObstacleId[];
  /** Their own words when they chose "Something else". */
  otherObstacle?: string;
  /** Why the task matters to them. */
  why?: string;
  /** The outcome they imagined. */
  vision?: string;
  /** Other things set aside for now (when overwhelmed). */
  setAside?: string;
  /** The advice shown, as it read in their language at the time. */
  intervention: string;
  /** The tiny next step they chose. */
  action: string;
  /** If–then plan. */
  plan?: string;
  plannedMinutes: number;
  /** Seconds of focus, pauses left out. While running, time since `runningSince` is added on top. */
  focusedSeconds: number;
  /** Epoch ms when the timer was last started or resumed; null while paused or stopped. */
  runningSince: number | null;
  /** 'active' while the timer screen is open or paused; 'finished' once the outcome is recorded. */
  status: 'active' | 'finished';
  outcome?: BreakerOutcome;
  reflection?: string;
  /** ISO timestamp chosen when rescheduling. */
  rescheduledFor?: string;
  /** The earlier session this one picks up. */
  resumedFrom?: string;
  /** ISO timestamps */
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}
