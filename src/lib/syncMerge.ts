import type { EmotionEntry, EmotionScore } from './types';

/** A row of the Supabase `entries` table (see supabase/migrations). */
export interface RemoteEntry {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
  text: string | null;
  emotions: EmotionScore[];
  valence: number;
  confidence: number;
  user_rating: number | null;
  user_adjusted: boolean;
  tags: string[];
  analyzer_version: string;
}

export type RemoteUpsert = Omit<RemoteEntry, 'synced_at' | 'deleted_at'>;

export function toRemote(entry: EmotionEntry, includeText: boolean): RemoteUpsert {
  return {
    id: entry.id,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
    text: includeText && entry.text ? entry.text : null,
    emotions: entry.emotions,
    valence: entry.valence,
    confidence: entry.confidence,
    user_rating: entry.userRating ?? null,
    user_adjusted: entry.userAdjusted,
    tags: entry.tags,
    analyzer_version: entry.analyzerVersion,
  };
}

export type MergeDecision = { action: 'skip' } | { action: 'delete' } | { action: 'put'; entry: EmotionEntry };

/**
 * Last write wins on `updated_at`, except that a deletion on any device always
 * wins. Written text that wasn't synced is kept from the local copy.
 */
export function mergeRemote(local: EmotionEntry | undefined, remote: RemoteEntry): MergeDecision {
  if (remote.deleted_at) return local ? { action: 'delete' } : { action: 'skip' };
  if (local && Date.parse(local.updatedAt) >= Date.parse(remote.updated_at)) return { action: 'skip' };
  return {
    action: 'put',
    entry: {
      id: remote.id,
      createdAt: new Date(remote.created_at).toISOString(),
      updatedAt: new Date(remote.updated_at).toISOString(),
      text: remote.text ?? local?.text ?? '',
      emotions: remote.emotions,
      valence: remote.valence,
      confidence: remote.confidence,
      userRating: remote.user_rating ?? undefined,
      userAdjusted: remote.user_adjusted,
      tags: remote.tags,
      analyzerVersion: remote.analyzer_version,
      dirty: 0,
    },
  };
}
