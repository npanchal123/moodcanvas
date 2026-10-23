import Dexie, { type EntityTable } from 'dexie';
import type { BreakerSession, Commitment, EmotionEntry, PracticeLog, SavedPractice } from './types';

/** An entry deleted on this device that the server still needs to hear about. */
export interface Deletion {
  id: string;
  deletedAt: string;
}

interface MetaRow {
  key: string;
  value: unknown;
}

/**
 * Local-first store in IndexedDB. Sync (lib/sync.ts) layers on top of it.
 * The app was called MoodCanvas before Viz it. The database and the `moodcanvas.*` localStorage keys keep that
 * name on purpose: renaming them would hide existing users' check-ins and settings.
 */
export const db = new Dexie('moodcanvas') as Dexie & {
  entries: EntityTable<EmotionEntry, 'id'>;
  deletions: EntityTable<Deletion, 'id'>;
  meta: EntityTable<MetaRow, 'key'>;
  practices: EntityTable<PracticeLog, 'id'>;
  breakerSessions: EntityTable<BreakerSession, 'id'>;
  savedPractices: EntityTable<SavedPractice, 'id'>;
  commitments: EntityTable<Commitment, 'id'>;
};

db.version(1).stores({
  entries: '&id, createdAt',
});

db.version(2)
  .stores({
    entries: '&id, createdAt, dirty, *tags',
    deletions: '&id',
    meta: '&key',
  })
  .upgrade((tx) =>
    tx
      .table('entries')
      .toCollection()
      .modify((entry) => {
        entry.updatedAt ??= entry.createdAt;
        entry.dirty = 1;
      }),
  );

// v3: the practice log (guided visualizations). Existing tables are unchanged.
db.version(3).stores({
  practices: '&id, startedAt',
});

// v4: Procrastination Breaker sessions. Existing tables are unchanged.
db.version(4).stores({
  breakerSessions: '&id, createdAt, status',
});

// v5: visualizations saved to the Library, and daily commitments. Existing tables are unchanged.
db.version(5).stores({
  savedPractices: '&id, createdAt',
  commitments: '&id, date',
});

export async function logPractice(log: PracticeLog): Promise<void> {
  await db.practices.put(log);
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  return (await db.meta.get(key))?.value as T | undefined;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await db.meta.put({ key, value });
}

export async function deleteMeta(...keys: string[]): Promise<void> {
  await db.meta.bulkDelete(keys);
}
