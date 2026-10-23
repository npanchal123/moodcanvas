import { clearSessionDraft, DATA_CLEARED } from './draftStorage';
import { db, getMeta } from './db';
import type { EmotionEntry } from './types';

/**
 * Every local write goes through here so it is stamped for sync and the
 * sync loop hears about it.
 */
const listeners = new Set<() => void>();

export function onLocalChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((listener) => listener());
}

export type NewEntry = Omit<EmotionEntry, 'updatedAt' | 'dirty'>;
export type EntryChanges = Partial<Pick<EmotionEntry, 'userRating' | 'userAdjusted' | 'tags'>>;

export async function addEntry(entry: NewEntry): Promise<void> {
  await db.entries.add({ ...entry, updatedAt: entry.createdAt, dirty: 1 });
  notify();
}

export async function updateEntry(id: string, changes: EntryChanges): Promise<void> {
  await db.entries.update(id, { ...changes, updatedAt: new Date().toISOString(), dirty: 1 });
  notify();
}

export type AnalysisChanges = Pick<EmotionEntry, 'emotions' | 'valence' | 'confidence' | 'analyzerVersion'>;

/** Saves new analyzer readings for many entries in one transaction, then notifies sync once. */
export async function applyAnalyses(updates: { id: string; changes: AnalysisChanges }[]): Promise<void> {
  if (!updates.length) return;
  const updatedAt = new Date().toISOString();
  await db.transaction('rw', db.entries, async () => {
    for (const { id, changes } of updates) await db.entries.update(id, { ...changes, updatedAt, dirty: 1 });
  });
  notify();
}

/** Only devices that have been linked to an account keep tombstones to send. */
async function tracksDeletions(): Promise<boolean> {
  return (await getMeta<string>('syncedUserId')) != null;
}

export async function deleteEntry(id: string): Promise<void> {
  const track = await tracksDeletions();
  await db.transaction('rw', db.entries, db.deletions, async () => {
    await db.entries.delete(id);
    if (track) await db.deletions.put({ id, deletedAt: new Date().toISOString() });
  });
  notify();
}

export async function deleteAllEntries(): Promise<void> {
  const track = await tracksDeletions();
  await db.transaction('rw', [db.entries, db.deletions, db.practices, db.breakerSessions, db.savedPractices, db.commitments, db.meta], async () => {
    const ids = await db.entries.toCollection().primaryKeys();
    await db.entries.clear();
    await db.practices.clear();
    await db.breakerSessions.clear();
    await db.savedPractices.clear();
    await db.commitments.clear();
    // The energy answers for each day.
    await db.meta.where('key').startsWith('energy:').delete();
    if (track) {
      const deletedAt = new Date().toISOString();
      await db.deletions.bulkPut(ids.map((id) => ({ id, deletedAt })));
    }
  });
  clearSessionDraft();
  window.dispatchEvent(new Event(DATA_CLEARED));
  notify();
}

/** Queue every entry for upload, e.g. after the "sync my written text" setting changes. */
export async function markAllDirty(): Promise<void> {
  await db.entries.toCollection().modify({ dirty: 1 });
  notify();
}
