import { describe, expect, it } from 'vitest';
import { findInsights } from './insights';
import { makeEntry } from './testing';

const NOW = new Date('2026-10-17T12:00:00');

describe('findInsights', () => {
  it('needs enough check-ins before saying anything', () => {
    const entries = [
      makeEntry(NOW, 1, [{ label: 'calm', intensity: 60 }], { valence: 0.8, tags: ['walk'] }),
      makeEntry(NOW, 2, [{ label: 'fear', intensity: 60 }], { valence: -0.6 }),
    ];
    expect(findInsights(entries, NOW.getTime())).toEqual([]);
  });

  it('finds lighter and heavier tags, and a dominant feeling per tag', () => {
    const entries = [
      ...[1, 3, 5].map((d) => makeEntry(NOW, d, [{ label: 'calm', intensity: 60 }], { valence: 0.7, tags: ['walk'] })),
      ...[2, 4, 6, 8].map((d) =>
        makeEntry(NOW, d, [{ label: 'fear', intensity: 70 }], { valence: -0.6, tags: ['work'] }),
      ),
      makeEntry(NOW, 7, [{ label: 'joy', intensity: 50 }], { valence: 0.5 }),
    ];
    const insights = findInsights(entries, NOW.getTime());
    expect(insights.slice(0, 2).map((i) => `${i.kind}:${i.tag}`).sort()).toEqual(['heavier:work', 'lighter:walk']);
    expect(insights).toContainEqual(expect.objectContaining({ kind: 'emotion', tag: 'work', label: 'fear', pct: 100 }));
  });

  it('ignores check-ins older than 30 days', () => {
    const entries = [40, 41, 42, 43, 44, 45].map((d) =>
      makeEntry(NOW, d, [{ label: 'calm', intensity: 60 }], { valence: 0.7, tags: ['walk'] }),
    );
    expect(findInsights(entries, NOW.getTime())).toEqual([]);
  });
});
