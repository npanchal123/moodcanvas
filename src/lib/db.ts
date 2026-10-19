import Dexie, { type EntityTable } from 'dexie';
import type { EmotionEntry } from './types';

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

export async function getMeta<T>(key: string): Promise<T | undefined> {
  return (await db.meta.get(key))?.value as T | undefined;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await db.meta.put({ key, value });
}

export async function deleteMeta(...keys: string[]): Promise<void> {
  await db.meta.bulkDelete(keys);
}
