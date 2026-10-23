import type { Locale } from '../../i18n';
import type { Messages } from '../../i18n/en';
import { compose, mentions, type Composed } from '../compose';
import type { GoalId } from '../compose/types';
import type { EmotionLabel } from '../emotions';
import type { Minutes } from '../../practices';
import type { BreakerSession, Commitment, SavedScript } from '../types';
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
  FOLLOW_UPS,
  OBSTACLE_IDS,
  SITUATION_IDS,
  SITUATION_PLAN_IDS,
  type BreakerDraft,
  type BreakerOutcome,
  type CategoryContent,
  type CategoryId,
  type FeelingId,
  type ObstacleId,
  type RehearsalId,
  type SituationId,
  type SituationPlanId,
} from './types';
import { zh } from './zh';

export * from './types';
export type { BreakerText };

export const BREAKER_TEXT: Record<Locale, BreakerText> = { en, hi, es, zh, ar, fr, bn, pt, ru };

// What someone writes can be in any language, whatever the app is set to.
const ALL = Object.values(BREAKER_TEXT);
const KEYWORDS = Object.fromEntries(
  CATEGORY_IDS.map((id) => [id, ALL.flatMap((text) => text.categories[id].keywords)]),
) as Record<CategoryId, string[]>;
const OBSTACLE_KEYWORDS = Object.fromEntries(
  OBSTACLE_IDS.map((id) => [id, ALL.flatMap((text) => text.obstacles[id].keywords ?? [])]),
) as Record<ObstacleId, string[]>;

/** The kind of task, from its description. */
export function categorize(task: string): CategoryId {
  return CATEGORY_IDS.find((id) => id !== 'general' && mentions(task, KEYWORDS[id])) ?? 'general';
}

/** Items in their list's fixed order, so the first one decides what's offered first. */
function inOrder<T extends string>(all: readonly T[], chosen: readonly T[]): T[] {
  return all.filter((id) => chosen.includes(id));
}

export function sortObstacles(obstacles: ObstacleId[]): ObstacleId[] {
  return inOrder(OBSTACLE_IDS, obstacles);
}

/**
 * Concrete steps for what someone wrote: the kind of task when the words point to one ("learn Python"),
 * otherwise steps for their situation ("I can't stop overthinking"), otherwise steps that fit anything.
 */
export function planFor(text: BreakerText, task: string, situations: readonly SituationId[] = []): CategoryContent {
  const category = categorize(task);
  if (category !== 'general') return text.categories[category];
  const plan = inOrder(SITUATION_IDS, situations).find((id): id is SituationPlanId =>
    (SITUATION_PLAN_IDS as readonly string[]).includes(id),
  );
  return plan ? text.situationPlans[plan] : text.categories.general;
}

export interface Suggestion {
  /** Advice for each chosen obstacle. Empty when none was chosen. */
  help: string[];
  /** Candidate small steps, best first. "Show another" walks through them. */
  options: string[];
}

/**
 * Rule-based guidance for what has someone stuck. Runs on the device; nothing is sent anywhere. With no obstacle
 * chosen, the step is the two-minute starter: starting is the hard part.
 */
export function suggest(
  text: BreakerText,
  task: string,
  obstacles: ObstacleId[],
  situations: readonly SituationId[] = [],
): Suggestion {
  const sorted = sortObstacles(obstacles);
  const c = planFor(text, task, situations);
  const [first, second] = c.steps;
  const primary = sorted[0];

  let options: string[];
  if (primary === 'start') options = [first, c.tiny, second, c.prep];
  else if (primary === 'badly' || primary === 'perfect' || primary === 'fear') options = [c.draft, c.tiny, first];
  else options = [c.tiny, c.prep, first];

  return {
    help: sorted.map((id) => text.obstacles[id].help),
    options: [...new Set(options)],
  };
}

/** A smaller version of a step, or null when it's already as small as it gets. */
export function smaller(
  text: BreakerText,
  task: string,
  action: string,
  situations: readonly SituationId[] = [],
): string | null {
  const c = planFor(text, task, situations);
  if (action === c.prep) return null;
  return action === c.tiny ? c.prep : c.tiny;
}

/** What could come after a completed step, or null at the end of the list. */
export function nextStep(
  text: BreakerText,
  task: string,
  action: string,
  situations: readonly SituationId[] = [],
): string | null {
  const { steps } = planFor(text, task, situations);
  const at = steps.indexOf(action);
  if (at >= 0) return steps[at + 1] ?? null;
  // The starter versions all lead into the first real step, or the second if that's the one just done.
  return steps.find((step) => step !== action) ?? null;
}

/** Questions about what feels hardest that fit the chosen situations, with "Something else" last. */
export function followUpsFor(situations: readonly SituationId[]): ObstacleId[] {
  const chosen = situations.length ? situations : (['other'] as const);
  const ids = new Set(chosen.flatMap((id) => FOLLOW_UPS[id]));
  return [...inOrder(OBSTACLE_IDS, [...ids]), 'other'];
}

const primarySituation = (situations: readonly SituationId[]): SituationId =>
  inOrder(SITUATION_IDS, situations)[0] ?? 'other';

export interface Understanding {
  ack: string;
  notAll: string;
  /** A possible obstacle, from words in what they wrote. Offered, never claimed. */
  maybe: string | null;
  question: string;
  options: ObstacleId[];
}

/** A short, supportive reflection on what someone shared, and a question about what feels hardest. */
export function understand(text: BreakerText, situations: readonly SituationId[], task: string): Understanding {
  const primary = primarySituation(situations);
  const options = followUpsFor(situations);
  const hinted = task.trim()
    ? options.find((id) => OBSTACLE_KEYWORDS[id].length > 0 && mentions(task, OBSTACLE_KEYWORDS[id]))
    : undefined;
  return {
    ack: text.understand.ack[primary],
    notAll: text.understand.notAll,
    maybe: hinted ? text.understand.maybe(text.obstacles[hinted].label) : null,
    question: text.understand.question[primary],
    options,
  };
}

/** Which technique in the visualization fits how someone would like to feel. */
export const GOAL_FOR_FEELING: Record<FeelingId, GoalId> = {
  calm: 'calm', clear: 'focus', confident: 'confidence', motivated: 'energy', focused: 'focus', lighter: 'letgo',
  ready: 'energy', accepting: 'kindness', other: 'calm',
};

const REHEARSAL_FOR: Record<SituationId, RehearsalId> = {
  procrastinating: 'begin', overwhelmed: 'split', overthinking: 'present', motivation: 'small', failing: 'confidence',
  focus: 'split', habits: 'small', life: 'small', decision: 'decide', other: 'begin',
};

/** The small-step rehearsal that fits: the situation decides, unless only confidence was asked for. */
export function rehearsalFor(situations: readonly SituationId[], feelings: readonly FeelingId[]): RehearsalId {
  const primary = primarySituation(situations);
  if (feelings[0] === 'confident' && (primary === 'other' || primary === 'life')) return 'confidence';
  return REHEARSAL_FOR[primary];
}

const REHEARSAL_TIERS = [3, 5, 10, 3] as const satisfies readonly Minutes[];

/**
 * A guided visualization for the Unstuck journey. It's the same composer as the front page (place, technique for
 * the feeling wanted, closing), with a line for people who don't picture things, and a realistic rehearsal of a
 * small step before the closing. Runs on the device.
 */
export function composeUnstuck(
  text: BreakerText,
  t: Messages,
  locale: Locale,
  draft: Pick<BreakerDraft, 'task' | 'situations' | 'feelings' | 'scene'>,
  feeling: EmotionLabel | null,
): Composed {
  const rehearsal = text.rehearsal[rehearsalFor(draft.situations, draft.feelings)].map((line, i) => ({
    tier: REHEARSAL_TIERS[i] ?? 10,
    pause: i === 3 ? 3 : 2,
    text: line,
  }));
  const composed = compose(
    {
      text: draft.task,
      locale,
      feeling,
      scene: draft.scene,
      goal: GOAL_FOR_FEELING[draft.feelings[0] ?? 'calm'],
      // The rehearsal leads to a small step, so the ending asks what to carry into the day.
      extra: { lines: rehearsal, ending: 'process' },
    },
    t,
  );
  return {
    ...composed,
    script: {
      ...composed.script,
      segments: composed.script.segments.map((s, i) => ({ ...s, id: `u${String(i + 1).padStart(2, '0')}` })),
    },
  };
}

/** A visualization's words and look, to keep with a session or in the Library. */
export function toSavedScript(composed: Pick<Composed, 'script' | 'icon' | 'hues'>): SavedScript {
  return {
    title: composed.script.title,
    summary: composed.script.summary,
    icon: composed.icon,
    hues: composed.hues,
    segments: composed.script.segments.map(({ text, tier, pause, breath }) => ({ text, tier, pause, breath })),
  };
}

/** Seconds focused so far, counting a timer that's still running. */
export function focusedSeconds(session: BreakerSession, now = Date.now()): number {
  const running = session.runningSince != null ? (now - session.runningSince) / 1000 : 0;
  return Math.max(0, Math.round(session.focusedSeconds + running));
}

const sameTask = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Outcomes that leave a task open, to be picked up again. */
const OPEN: BreakerOutcome[] = ['progress', 'hard', 'stopped', 'interrupted', 'rescheduled'];

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
    .filter((s) => s.action && s.outcome && OPEN.includes(s.outcome))
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
export const LIMITS = { task: 500, short: 300, long: 1000, minutes: 120 } as const;

export function clip(value: string | undefined, max: number): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

/** "45 sec", "12 min". */
export function formatDuration(text: BreakerText, seconds: number): string {
  return seconds < 60 ? text.seconds(Math.round(seconds)) : text.mins(Math.round(seconds / 60));
}

/** What a session was about, for a heading: their words, or the situations they chose. */
export function sessionTitle(text: BreakerText, session: Pick<BreakerSession, 'task' | 'situations'>): string {
  return session.task.trim() || (session.situations ?? []).map((id) => text.situations[id]).join(' ');
}

/** A draft that picks up an earlier session at its small step, ready to start. */
export function draftFrom(session: BreakerSession, changes: Partial<BreakerDraft> = {}): BreakerDraft {
  const draft: BreakerDraft = {
    ...EMPTY_BREAKER_DRAFT,
    step: 3,
    situations: session.situations ?? [],
    task: session.task,
    obstacles: session.obstacles,
    feelings: session.feelings ?? [],
    scene: session.scene ?? null,
    action: session.action,
    plannedMinutes: session.plannedMinutes,
    resumedFrom: session.id,
    ...changes,
  };
  // The step comes from the session, so it's kept rather than replaced by a fresh suggestion.
  return { ...draft, actionFor: suggestionBasis(draft) };
}

/** What a suggested step depends on. When this changes, the action screen offers a fresh suggestion. */
export function suggestionBasis(draft: Pick<BreakerDraft, 'task' | 'obstacles' | 'situations'>): string {
  return [draft.task.trim(), sortObstacles(draft.obstacles).join(), inOrder(SITUATION_IDS, draft.situations).join()].join('|');
}

/** A local calendar date, YYYY-MM-DD. */
export function localDate(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export interface CommitmentCounts {
  created: number;
  done: number;
  partial: number;
  /** Days with at least one commitment completed, partly completed or in progress. */
  days: number;
  /** The most common kinds of commitment, most common first (at most three). */
  kinds: CategoryId[];
}

/** Counts for the dates from `from` to `to` (YYYY-MM-DD, inclusive), from recorded commitments only. */
export function commitmentCounts(commitments: Commitment[], from: string, to: string): CommitmentCounts {
  const range = commitments.filter((c) => c.date >= from && c.date <= to);
  const acted = range.filter((c) => c.status === 'done' || c.status === 'partial' || c.status === 'doing');
  const counts = new Map<CategoryId, number>();
  for (const c of range) {
    const kind = categorize(c.title);
    if (kind !== 'general') counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  return {
    created: range.length,
    done: range.filter((c) => c.status === 'done').length,
    partial: range.filter((c) => c.status === 'partial').length,
    days: new Set(acted.map((c) => c.date)).size,
    kinds: [...counts].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([kind]) => kind),
  };
}

/** Counts for the seven days up to and including `today`. */
export function commitmentWeek(commitments: Commitment[], today = new Date()): CommitmentCounts {
  const start = new Date(today);
  start.setDate(start.getDate() - 6);
  return commitmentCounts(commitments, localDate(start), localDate(today));
}

/** Counts for the calendar month containing `month`. */
export function commitmentMonth(commitments: Commitment[], month: Date): CommitmentCounts {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  return commitmentCounts(commitments, localDate(first), localDate(last));
}

/**
 * The days to show for a month, as weeks of seven, starting on `firstDay` (1 Monday … 7 Sunday). Days outside the
 * month are null, so the grid lines up.
 */
export function monthGrid(month: Date, firstDay = 1): (Date | null)[][] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const lead = (new Date(year, m, 1).getDay() - (firstDay % 7) + 7) % 7;
  const length = new Date(year, m + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length }, (_, i) => new Date(year, m, i + 1)),
  ];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

/** The first day of the week where the person lives (1 Monday … 7 Sunday), where the browser can say. */
export function weekStart(lang: string): number {
  try {
    const locale = new Intl.Locale(lang) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    return locale.getWeekInfo?.().firstDay ?? locale.weekInfo?.firstDay ?? 1;
  } catch {
    return 1;
  }
}
