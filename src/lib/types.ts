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
  practiceId: string;
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
