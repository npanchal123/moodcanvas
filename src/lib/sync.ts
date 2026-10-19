import { db, deleteMeta, getMeta, setMeta } from './db';
import { markAllDirty } from './entries';
import { supabase } from './supabase';
import { mergeRemote, toRemote, type RemoteEntry } from './syncMerge';

const PAGE_SIZE = 500;
/** Re-read a little before the last pull so rows from overlapping writes aren't missed. */
const PULL_OVERLAP_MS = 10_000;

let running: Promise<void> | null = null;

/** Pull first (so newer remote edits win), then push this device's changes. */
export function syncNow(): Promise<void> {
  running ??= (async () => {
    try {
      await pull();
      await push();
      await setMeta('lastSyncAt', new Date().toISOString());
    } finally {
      running = null;
    }
  })();
  return running;
}

async function pull() {
  if (!supabase) return;
  const pulledThrough = (await getMeta<string>('pulledThrough')) ?? '1970-01-01T00:00:00Z';
  const since = new Date(Date.parse(pulledThrough) - PULL_OVERLAP_MS).toISOString();
  let latest = pulledThrough;

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .gt('synced_at', since)
      .order('synced_at')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as RemoteEntry[];

    await db.transaction('rw', db.entries, async () => {
      for (const row of rows) {
        const decision = mergeRemote(await db.entries.get(row.id), row);
        if (decision.action === 'delete') await db.entries.delete(row.id);
        else if (decision.action === 'put') await db.entries.put(decision.entry);
        if (Date.parse(row.synced_at) > Date.parse(latest)) latest = row.synced_at;
      }
    });
    if (rows.length < PAGE_SIZE) break;
  }
  await setMeta('pulledThrough', latest);
}

async function push() {
  if (!supabase) return;
  const includeText = (await getMeta<boolean>('syncText')) ?? false;

  const dirty = await db.entries.where('dirty').equals(1).toArray();
  if (dirty.length) {
    const { error } = await supabase
      .from('entries')
      .upsert(dirty.map((e) => toRemote(e, includeText)), { defaultToNull: false });
    if (error) throw new Error(error.message);
    // Only clear the flag if the entry wasn't edited again while we were uploading.
    await db.transaction('rw', db.entries, async () => {
      for (const sent of dirty) {
        const current = await db.entries.get(sent.id);
        if (current?.updatedAt === sent.updatedAt) await db.entries.update(sent.id, { dirty: 0 });
      }
    });
  }

  const deletions = await db.deletions.toArray();
  if (deletions.length) {
    const { error } = await supabase
      .from('entries')
      .upsert(
        deletions.map((d) => ({ id: d.id, deleted_at: d.deletedAt, updated_at: d.deletedAt, text: null })),
        { defaultToNull: false },
      );
    if (error) throw new Error(error.message);
    await db.deletions.bulkDelete(deletions.map((d) => d.id));
  }
}

/**
 * Called when someone signs in. If this device last synced with a different
 * account, asks before mixing that account's entries into this one; if not,
 * they are removed from this device (the other account still has them).
 */
export async function linkDevice(userId: string, confirmMerge: () => boolean): Promise<void> {
  const previous = await getMeta<string>('syncedUserId');
  if (previous === userId) return;
  if (previous) {
    if ((await db.entries.count()) > 0 && !confirmMerge()) await forgetLocalData();
    else await markAllDirty();
    await db.deletions.clear();
    await deleteMeta('pulledThrough');
  }
  await setMeta('syncedUserId', userId);
}

/** Removes everything from this device only. The account keeps its copy. */
export async function forgetLocalData(): Promise<void> {
  await db.transaction('rw', db.entries, db.deletions, db.meta, async () => {
    await db.entries.clear();
    await db.deletions.clear();
    await deleteMeta('syncedUserId', 'pulledThrough', 'lastSyncAt');
  });
}

/**
 * Deletes the signed-in user's account and all synced entries (server side, via the
 * delete-account Edge Function), then signs out. The device either forgets its
 * copy too, or keeps it as an unlinked local-only journal.
 */
export async function deleteAccount(alsoLocal: boolean): Promise<void> {
  if (!supabase) throw new Error('Sync is not configured');
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) throw new Error(error.message);
  await supabase.auth.signOut({ scope: 'local' });
  if (alsoLocal) {
    await forgetLocalData();
  } else {
    await db.deletions.clear();
    await deleteMeta('syncedUserId', 'pulledThrough', 'lastSyncAt');
    // Ready to upload again if they later make a new account.
    await markAllDirty();
  }
}

export async function setSyncText(enabled: boolean): Promise<void> {
  await setMeta('syncText', enabled);
  // Re-upload everything so the server copy gains or loses the written text.
  await markAllDirty();
}
