import { db, getMeta, setMeta } from '../db';
import type { BreakerSession, Commitment, SavedPractice, SavedScript } from '../types';
import { clip, focusedSeconds, LIMITS } from '.';
import type { BreakerDraft, BreakerOutcome, CommitmentStatus, Energy } from './types';

/** The parts of a session that come from the journey before the action: what was going on, and the visualization. */
function fromDraft(draft: BreakerDraft, intervention: string) {
  return {
    task: clip(draft.task, LIMITS.task) ?? '',
    situations: draft.situations,
    obstacles: draft.obstacles,
    feelings: draft.feelings,
    scene: draft.scene,
    practiceCompleted: draft.practiceCompleted,
    intervention: intervention.slice(0, LIMITS.long),
    resumedFrom: draft.resumedFrom,
  };
}

/**
 * Saves a new session with its timer running, or stopped when the person chose to schedule it for later.
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
    ...fromDraft(draft, intervention),
    action: clip(draft.action, LIMITS.short) ?? '',
    plannedMinutes: Math.min(LIMITS.minutes, Math.max(1, Math.round(draft.plannedMinutes))),
    focusedSeconds: 0,
    runningSince: running ? now : null,
    status: 'active',
    startedAt: at,
    createdAt: at,
    updatedAt: at,
  };
  await db.breakerSessions.add(session);
  return session;
}

/** Saves a session where the person chose not to take an action this time. */
export async function saveWithoutAction(draft: BreakerDraft, intervention: string, now = Date.now()): Promise<BreakerSession> {
  const at = new Date(now).toISOString();
  const session: BreakerSession = {
    id: crypto.randomUUID(),
    ...fromDraft(draft, intervention),
    action: '',
    plannedMinutes: 0,
    focusedSeconds: 0,
    runningSince: null,
    status: 'finished',
    startedAt: at,
    endedAt: at,
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

/** Starts the countdown again from the full length. */
export async function restartSession(session: BreakerSession, now = Date.now()): Promise<void> {
  await db.breakerSessions.update(session.id, {
    focusedSeconds: 0,
    runningSince: now,
    updatedAt: new Date(now).toISOString(),
  });
}

export async function addMinutes(session: BreakerSession, minutes: number, now = Date.now()): Promise<void> {
  await db.breakerSessions.update(session.id, {
    plannedMinutes: Math.min(LIMITS.minutes, session.plannedMinutes + minutes),
    runningSince: now,
    updatedAt: new Date(now).toISOString(),
  });
}

/** Records how it went. Only the small step is marked done; whatever was behind it stays open. */
export async function finishSession(
  session: BreakerSession,
  outcome: BreakerOutcome,
  rescheduledFor: string | undefined,
  now = Date.now(),
): Promise<void> {
  const at = new Date(now).toISOString();
  await db.breakerSessions.update(session.id, {
    focusedSeconds: focusedSeconds(session, now),
    runningSince: null,
    status: 'finished',
    outcome,
    rescheduledFor: outcome === 'rescheduled' ? rescheduledFor : undefined,
    endedAt: at,
    updatedAt: at,
  });
}

/**
 * Saves the optional reflection, and the visualization's words when the person chose to keep them (null removes
 * them; undefined leaves them as they are). Throws when the session no longer exists, so nothing claims a save.
 */
export async function saveReflection(
  id: string,
  reflection: string,
  nextIntent: string,
  visualization?: SavedScript | null,
  now = Date.now(),
): Promise<void> {
  const changes: Partial<BreakerSession> = {
    reflection: clip(reflection, LIMITS.long),
    nextIntent: clip(nextIntent, LIMITS.short),
    updatedAt: new Date(now).toISOString(),
  };
  if (visualization !== undefined) changes.visualization = visualization ?? undefined;
  const updated = await db.breakerSessions.update(id, changes);
  if (!updated && !(await db.breakerSessions.get(id))) throw new Error('Session not found');
}

export async function deleteSession(id: string): Promise<void> {
  await db.breakerSessions.delete(id);
}

// ---------------------------------------------------------------------------------------------------------------
// The Library's saved visualizations.

export async function savePractice(practice: Omit<SavedPractice, 'id' | 'createdAt' | 'favorite'>): Promise<SavedPractice> {
  const saved: SavedPractice = {
    ...practice,
    action: clip(practice.action, LIMITS.short),
    id: crypto.randomUUID(),
    favorite: 0,
    createdAt: new Date().toISOString(),
  };
  await db.savedPractices.add(saved);
  return saved;
}

export async function setFavorite(id: string, favorite: boolean): Promise<void> {
  await db.savedPractices.update(id, { favorite: favorite ? 1 : 0 });
}

export async function deleteSavedPractice(id: string): Promise<void> {
  await db.savedPractices.delete(id);
}

// ---------------------------------------------------------------------------------------------------------------
// Daily commitments.

export async function addCommitment(
  fields: Pick<Commitment, 'date' | 'title' | 'minutes'> & { description?: string },
  now = Date.now(),
): Promise<Commitment> {
  const at = new Date(now).toISOString();
  const commitment: Commitment = {
    id: crypto.randomUUID(),
    date: fields.date,
    title: clip(fields.title, LIMITS.short) ?? '',
    description: clip(fields.description, LIMITS.long),
    minutes: Math.min(LIMITS.minutes, Math.max(1, Math.round(fields.minutes))),
    status: 'todo',
    createdAt: at,
    updatedAt: at,
  };
  await db.commitments.add(commitment);
  return commitment;
}

export async function updateCommitment(
  id: string,
  changes: { status?: CommitmentStatus; title?: string; description?: string; reflection?: string },
  now = Date.now(),
): Promise<void> {
  const update: Partial<Commitment> = { updatedAt: new Date(now).toISOString() };
  if (changes.status) update.status = changes.status;
  if (changes.title !== undefined) update.title = clip(changes.title, LIMITS.short) ?? '';
  if (changes.description !== undefined) update.description = clip(changes.description, LIMITS.long);
  if (changes.reflection !== undefined) update.reflection = clip(changes.reflection, LIMITS.long);
  await db.commitments.update(id, update);
}

export async function deleteCommitment(id: string): Promise<void> {
  await db.commitments.delete(id);
}

export async function getEnergy(date: string): Promise<Energy | undefined> {
  return getMeta<Energy>(`energy:${date}`);
}

export async function setEnergy(date: string, energy: Energy): Promise<void> {
  await setMeta(`energy:${date}`, energy);
}
