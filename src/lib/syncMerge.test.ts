import { describe, expect, it } from 'vitest';
import { mergeRemote, toRemote, type RemoteEntry } from './syncMerge';
import { makeEntry } from './testing';

const NOW = new Date('2026-10-17T12:00:00Z');

function remoteFrom(overrides: Partial<RemoteEntry> = {}): RemoteEntry {
  return {
    id: 'abc',
    created_at: '2026-10-17T10:00:00+00:00',
    updated_at: '2026-10-17T11:00:00+00:00',
    deleted_at: null,
    synced_at: '2026-10-17T11:00:01+00:00',
    text: null,
    emotions: [{ label: 'calm', intensity: 60 }],
    valence: 0.5,
    confidence: 0.8,
    user_rating: null,
    user_adjusted: false,
    tags: ['walk'],
    analyzer_version: 'lexicon-1.0',
    ...overrides,
  };
}

describe('toRemote', () => {
  const entry = makeEntry(NOW, 0, [{ label: 'joy', intensity: 70 }], { text: 'great day', userRating: 8 });

  it('leaves written text out unless the user opted in', () => {
    expect(toRemote(entry, false).text).toBeNull();
    expect(toRemote(entry, true).text).toBe('great day');
    expect(toRemote(entry, false).user_rating).toBe(8);
  });
});

describe('mergeRemote', () => {
  it('adds entries this device has not seen', () => {
    const decision = mergeRemote(undefined, remoteFrom());
    expect(decision.action).toBe('put');
    if (decision.action === 'put') {
      expect(decision.entry).toMatchObject({ id: 'abc', tags: ['walk'], dirty: 0, text: '' });
      expect(decision.entry.updatedAt).toBe('2026-10-17T11:00:00.000Z');
    }
  });

  it('keeps the local copy when it is as new or newer', () => {
    const local = makeEntry(NOW, 0, [{ label: 'joy', intensity: 70 }], { id: 'abc', updatedAt: '2026-10-17T11:30:00.000Z' });
    expect(mergeRemote(local, remoteFrom()).action).toBe('skip');
  });

  it('takes the remote copy when it is newer but keeps unsynced local text', () => {
    const local = makeEntry(NOW, 0, [{ label: 'joy', intensity: 70 }], {
      id: 'abc',
      text: 'my words',
      updatedAt: '2026-10-17T10:30:00.000Z',
      dirty: 1,
    });
    const decision = mergeRemote(local, remoteFrom());
    expect(decision.action).toBe('put');
    if (decision.action === 'put') {
      expect(decision.entry.emotions[0].label).toBe('calm');
      expect(decision.entry.text).toBe('my words');
      expect(decision.entry.dirty).toBe(0);
    }
  });

  it('deletes local copies of remotely deleted entries, even newer ones', () => {
    const local = makeEntry(NOW, 0, [{ label: 'joy', intensity: 70 }], { id: 'abc', updatedAt: '2026-10-17T13:00:00.000Z' });
    expect(mergeRemote(local, remoteFrom({ deleted_at: '2026-10-17T11:00:00+00:00' })).action).toBe('delete');
    expect(mergeRemote(undefined, remoteFrom({ deleted_at: '2026-10-17T11:00:00+00:00' })).action).toBe('skip');
  });
});
