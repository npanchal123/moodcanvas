import type { BreakerOutcome, CommitmentStatus, FeelingId, ObstacleId, SituationId } from './breaker/types';
import type { Minutes } from '../practices';
import type { GoalId, ModeId, SceneId } from './compose/types';
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
  /** Self-report when there was no check-in to compare with (older logs). */
  felt?: 'better' | 'same' | 'worse';
  /** How they felt afterwards, in their own choice of words ("calmer", "clearer"…). A self-report, not a measure. */
  feelings?: string[];
  /** Composed practices: what they were made from, to make them again. */
  request?: VisualizeRequest;
}

/**
 * One Unstuck session: what had someone stuck, how they wanted to feel, the visualization, the small step they
 * chose, how the focus time went and what they noticed. Kept on this device only, like the practice log. Sessions
 * from the earlier Procrastination Breaker have `why`, `vision`, `setAside` and `plan` instead of the newer fields.
 */
export interface BreakerSession {
  id: string;
  /** What had them stuck, in their own words (or the situations chosen, when they wrote nothing). */
  task: string;
  situations?: SituationId[];
  /** How they wanted to feel; the first one led the visualization. */
  feelings?: FeelingId[];
  scene?: SceneId | null;
  /** Whether the visualization was played to the end. Unset when there was none. */
  practiceCompleted?: boolean;
  /** The visualization's words, only when they chose to keep them. */
  visualization?: SavedScript;
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
  /** The tiny next step they chose. Empty when they skipped taking action. */
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
  /** "What did you notice?" */
  reflection?: string;
  /** "What's one thing you'd like to do next?" */
  nextIntent?: string;
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

/** A visualization's words and look, enough to play it again. */
export interface SavedScript {
  title: string;
  summary: string;
  icon: string;
  hues: [string, string];
  /** Each step's text and the shortest length it belongs in (3, 5 or 10 minutes). */
  segments: { text: string; tier: Minutes; pause: number; breath?: boolean }[];
}

/** A visualization saved to the Library. Kept on this device only. */
export interface SavedPractice {
  id: string;
  script: SavedScript;
  scene: SceneId | null;
  goal: GoalId;
  /** The feeling chosen in Unstuck, when it was made there. */
  feeling?: FeelingId;
  /** Minutes it was last played for. */
  minutes: number;
  favorite: 0 | 1;
  /** The small step chosen alongside it, if any. */
  action?: string;
  /** What it was made from, to make it again with changes. */
  request?: VisualizeRequest;
  createdAt: string;
}

/** What a composed visualization was made from: the person's words and choices. Kept on this device only. */
export interface VisualizeRequest {
  text: string;
  scene: SceneId | null;
  goal: GoalId | null;
  mode: ModeId | null;
}

/** A daily commitment: one small thing planned for a day. Kept on this device only. */
export interface Commitment {
  id: string;
  /** Local date, YYYY-MM-DD. */
  date: string;
  title: string;
  description?: string;
  minutes: number;
  status: CommitmentStatus;
  reflection?: string;
  /** "HH:MM", local time on `date`, when a reminder should pop up. */
  remindAt?: string;
  /** ISO timestamp of when the reminder was shown, so it only shows once. */
  remindedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Something to do often, with a month grid to tick off each day it's done. Kept on this device only. */
export interface Tracker {
  id: string;
  title: string;
  description?: string;
  /** One of the habit colours; older trackers have none and use the first. */
  color?: string;
  /** An emoji shown on the habit's tile. */
  icon?: string;
  createdAt: string;
}

/** One ticked day on a tracker. The id is "trackerId:YYYY-MM-DD", so a day can only be ticked once. */
export interface TrackerTick {
  id: string;
  trackerId: string;
  /** Local date, YYYY-MM-DD. */
  date: string;
}

/** One line of a visualization read aloud in the person's own voice. The id is a hash of the line's words. */
export interface VoiceClip {
  id: string;
  text: string;
  blob: Blob;
  createdAt: string;
}

/** A visualization the person recorded themselves, start to finish. Kept on this device only. */
export interface OwnRecording {
  id: string;
  title: string;
  blob: Blob;
  seconds: number;
  createdAt: string;
}
