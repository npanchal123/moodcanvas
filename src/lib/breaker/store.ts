import { db } from '../db';
import type { BreakerSession } from '../types';
import { clip, focusedSeconds, LIMITS } from '.';
import type { BreakerDraft, BreakerOutcome } from './types';

/**
 * Saves a new session with its timer running, or stopped when the person chose to rest and plan it for later.
 * Fields are trimmed and capped, since they're typed freely.
 */
export async function startSession(
  draft: BreakerDraft,
  intervention: string,
  running = true,
  now = Date.now(),
): Promise<BreakerSession> {
  const at = new Date(now).toISOString();
  const session: BreakerSession = {
    id: crypto.randomUUID(),
    task: clip(draft.task, LIMITS.task) ?? '',
    obstacles: draft.obstacles,
    otherObstacle: draft.obstacles.includes('other') ? clip(draft.otherObstacle, LIMITS.short) : undefined,
    why: clip(draft.why, LIMITS.short),
    vision: clip(draft.vision, LIMITS.short),
    setAside: draft.obstacles.includes('overwhelmed') ? clip(draft.setAside, LIMITS.long) : undefined,
    intervention: intervention.slice(0, LIMITS.long),
    action: clip(draft.action, LIMITS.short) ?? '',
    plan: clip(draft.plan, LIMITS.short),
    plannedMinutes: Math.min(LIMITS.minutes, Math.max(1, Math.round(draft.plannedMinutes))),
    focusedSeconds: 0,
    runningSince: running ? now : null,
    status: 'active',
    resumedFrom: draft.resumedFrom,
    startedAt: at,
    createdAt: at,
    updatedAt: at,
  };
  await db.breakerSessions.add(session);
  return session;
}

/** Stops the clock, keeping the time focused so far. `capAtPlan` is for a timer that ran out unattended. */
export async function pauseSession(session: BreakerSession, now = Date.now(), capAtPlan = false): Promise<void> {
  if (session.runningSince == null) return;
  let seconds = focusedSeconds(session, now);
  if (capAtPlan) seconds = Math.min(seconds, session.plannedMinutes * 60);
  await db.breakerSessions.update(session.id, {
    focusedSeconds: seconds,
    runningSince: null,
    updatedAt: new Date(now).toISOString(),
  });
}

export async function resumeSession(session: BreakerSession, now = Date.now()): Promise<void> {
  if (session.runningSince != null) return;
  await db.breakerSessions.update(session.id, { runningSince: now, updatedAt: new Date(now).toISOString() });
}

export async function addMinutes(session: BreakerSession, minutes: number, now = Date.now()): Promise<void> {
  await db.breakerSessions.update(session.id, {
    plannedMinutes: Math.min(LIMITS.minutes, session.plannedMinutes + minutes),
    runningSince: now,
    updatedAt: new Date(now).toISOString(),
  });
}

/** Records what happened. Only the starter step is marked done; the task itself stays open. */
export async function finishSession(
  session: BreakerSession,
  outcome: BreakerOutcome,
  reflection: string,
  rescheduledFor: string | undefined,
  now = Date.now(),
): Promise<void> {
  const at = new Date(now).toISOString();
  await db.breakerSessions.update(session.id, {
    focusedSeconds: focusedSeconds(session, now),
    runningSince: null,
    status: 'finished',
    outcome,
    reflection: clip(reflection, LIMITS.long),
    rescheduledFor: outcome === 'rescheduled' ? rescheduledFor : undefined,
    endedAt: at,
    updatedAt: at,
  });
}

export async function deleteSession(id: string): Promise<void> {
  await db.breakerSessions.delete(id);
}
