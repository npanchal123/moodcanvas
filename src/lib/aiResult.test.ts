import { describe, expect, it } from 'vitest';
import { normalizeAiResult } from './aiResult';

describe('normalizeAiResult', () => {
  it('keeps known labels, sorts, clamps and applies the secondary threshold', () => {
    const r = normalizeAiResult({
      emotions: [
        { label: 'joy', intensity: 41.6 },
        { label: 'fear', intensity: 140 },
        { label: 'sadness', intensity: 12 },
        { label: 'nostalgia', intensity: 90 },
        { label: 'joy', intensity: 20 },
      ],
      valence: -3,
      confidence: 0.876,
      concern: false,
    });
    expect(r.emotions).toEqual([
      { label: 'fear', intensity: 100 },
      { label: 'joy', intensity: 42 },
    ]);
    expect(r.valence).toBe(-1);
    expect(r.confidence).toBe(0.88);
    expect(r.concern).toBe(false);
  });

  it('survives garbage', () => {
    expect(normalizeAiResult('nope')).toEqual({ emotions: [], valence: 0, confidence: 0, concern: false });
    expect(normalizeAiResult({ emotions: [null, { label: 'joy', intensity: 'lots' }], concern: 'yes' })).toEqual({
      emotions: [],
      valence: 0,
      confidence: 0,
      concern: false,
    });
  });
});
