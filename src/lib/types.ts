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
