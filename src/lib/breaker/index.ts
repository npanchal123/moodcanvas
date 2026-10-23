import type { Locale } from '../../i18n';
import { mentions } from '../compose';
import type { BreakerSession } from '../types';
import { ar } from './ar';
import { bn } from './bn';
import { en, type BreakerText } from './en';
import { es } from './es';
import { fr } from './fr';
import { hi } from './hi';
import { pt } from './pt';
import { ru } from './ru';
import {
  CATEGORY_IDS,
  EMPTY_BREAKER_DRAFT,
  OBSTACLE_IDS,
  type BreakerDraft,
  type BreakerOutcome,
  type CategoryId,
  type ObstacleId,
} from './types';
import { zh } from './zh';

export * from './types';
export type { BreakerText };

export const BREAKER_TEXT: Record<Locale, BreakerText> = { en, hi, es, zh, ar, fr, bn, pt, ru };

// A task can be typed in any language, whatever the app is set to.
const KEYWORDS = Object.fromEntries(
  CATEGORY_IDS.map((id) => [id, Object.values(BREAKER_TEXT).flatMap((text) => text.categories[id].keywords)]),
) as Record<CategoryId, string[]>;

/** The kind of task, from its description. */
export function categorize(task: string): CategoryId {
  return CATEGORY_IDS.find((id) => id !== 'general' && mentions(task, KEYWORDS[id])) ?? 'general';
}

/** Obstacles in a fixed order, so the first one decides the kind of step offered first. */
export function sortObstacles(obstacles: ObstacleId[]): ObstacleId[] {
  return OBSTACLE_IDS.filter((id) => obstacles.includes(id));
}

export interface Suggestion {
  /** Advice for each chosen obstacle. Empty when none was chosen. */
  help: string[];
  /** Candidate tiny steps, best first. "Show another" walks through them. */
  options: string[];
}

/**
 * Rule-based guidance for a task and what makes it hard to start. Runs on the device; nothing is sent anywhere.
 * With no obstacle chosen, the step is the two-minute starter: starting is the hard part.
 */
export function suggest(text: BreakerText, task: string, obstacles: ObstacleId[]): Suggestion {
  const sorted = sortObstacles(obstacles);
  const c = text.categories[categorize(task)];
  const [first, second] = c.steps;
  const primary = sorted[0];

  let options: string[];
  if (!primary || primary === 'big' || primary === 'motivation' || primary === 'tired' || primary === 'time') {
    options = [c.tiny, c.prep, first];
  } else if (primary === 'badly' || primary === 'perfect' || primary === 'fear') options = [c.draft, c.tiny, first];
  else options = [first, c.tiny, second, c.prep];

  return {
    help: sorted.map((id) => text.obstacles[id].help),
    options: [...new Set(options)],
  };
}

/** A smaller version of a step, or null when it's already as small as it gets. */
export function smaller(text: BreakerText, task: string, action: string): string | null {
  const c = text.categories[categorize(task)];
  if (action === c.prep) return null;
  return action === c.tiny ? c.prep : c.tiny;
}

/** What could come after a completed step, or null at the end of the list. */
export function nextStep(text: BreakerText, task: string, action: string): string | null {
  const { steps } = text.categories[categorize(task)];
  const at = steps.indexOf(action);
  if (at >= 0) return steps[at + 1] ?? null;
  // The starter versions all lead into the first real step, or the second if that's the one just done.
  return steps.find((step) => step !== action) ?? null;
}

/** Seconds focused so far, counting a timer that's still running. */
export function focusedSeconds(session: BreakerSession, now = Date.now()): number {
  const running = session.runningSince != null ? (now - session.runningSince) / 1000 : 0;
  return Math.max(0, Math.round(session.focusedSeconds + running));
}

const sameTask = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Outcomes that leave a task open, to be picked up again. */
const OPEN: BreakerOutcome[] = ['progress', 'hard', 'interrupted', 'rescheduled'];

/**
 * Tasks to pick up again: for each task, its latest finished session, when that ended without the step done.
 * Sessions are newest first. Rescheduled ones come first, soonest date first.
 */
export function unfinished(sessions: BreakerSession[], limit = 5): BreakerSession[] {
  const latest: BreakerSession[] = [];
  for (const s of sessions) {
    if (s.status !== 'finished' || latest.some((l) => sameTask(l.task, s.task))) continue;
    latest.push(s);
  }
  return latest
    .filter((s) => s.outcome && OPEN.includes(s.outcome))
    .sort((a, b) => (a.rescheduledFor ?? '￿').localeCompare(b.rescheduledFor ?? '￿'))
    .slice(0, limit);
}

export interface BreakerStats {
  sessions: number;
  done: number;
  focusSeconds: number;
  /** Sessions that picked up a task the person had rescheduled. */
  resumed: number;
}

/** Counts from saved, finished sessions only. */
export function breakerStats(sessions: BreakerSession[]): BreakerStats {
  const finished = sessions.filter((s) => s.status === 'finished');
  const byId = new Map(sessions.map((s) => [s.id, s]));
  return {
    sessions: finished.length,
    done: finished.filter((s) => s.outcome === 'done').length,
    focusSeconds: finished.reduce((sum, s) => sum + s.focusedSeconds, 0),
    resumed: finished.filter((s) => s.resumedFrom && byId.get(s.resumedFrom)?.outcome === 'rescheduled').length,
  };
}

/** Checks a session before saving, since text fields come straight from the person. */
export const LIMITS = { task: 200, short: 300, long: 1000, minutes: 120 } as const;

export function clip(value: string | undefined, max: number): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

/** "45 sec", "12 min". */
export function formatDuration(text: BreakerText, seconds: number): string {
  return seconds < 60 ? text.seconds(Math.round(seconds)) : text.mins(Math.round(seconds / 60));
}

/** A draft that picks up an earlier session, at the step screen ready to start. */
export function draftFrom(session: BreakerSession, changes: Partial<BreakerDraft> = {}): BreakerDraft {
  const draft: BreakerDraft = {
    ...EMPTY_BREAKER_DRAFT,
    step: 1,
    task: session.task,
    obstacles: session.obstacles,
    otherObstacle: session.otherObstacle ?? '',
    why: session.why ?? '',
    vision: session.vision ?? '',
    setAside: session.setAside ?? '',
    action: session.action,
    plan: session.plan ?? '',
    plannedMinutes: session.plannedMinutes,
    resumedFrom: session.id,
    ...changes,
  };
  // The step comes from the session, so going back and forth keeps it rather than suggesting a new one.
  return { ...draft, actionFor: suggestionBasis(draft) };
}

/** What a suggested step depends on. When this changes, the step screen offers a fresh suggestion. */
export function suggestionBasis(draft: BreakerDraft): string {
  return [draft.task.trim(), sortObstacles(draft.obstacles).join()].join('|');
}
