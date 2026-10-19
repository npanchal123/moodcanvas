import { describe, expect, it } from 'vitest';
import { frequency, streak } from './stats';
import { makeEntry } from './testing';
import type { EmotionEntry } from './types';

const NOW = new Date('2026-10-17T12:00:00');

function entry(daysAgo: number, emotions: EmotionEntry['emotions'], userRating?: number): EmotionEntry {
  return makeEntry(NOW, daysAgo, emotions, { userRating, userAdjusted: userRating != null });
}

describe('frequency', () => {
  const entries = [
    entry(0, [{ label: 'fear', intensity: 80 }, { label: 'joy', intensity: 40 }]),
    entry(1, [{ label: 'fear', intensity: 60 }, { label: 'sadness', intensity: 20 }]),
    entry(2, [{ label: 'calm', intensity: 50 }], 7),
    entry(20, [{ label: 'anger', intensity: 90 }]),
  ];

  it('counts primary and strong secondary emotions inside the window', () => {
    const rows = frequency(entries, 7, NOW.getTime());
    expect(rows[0]).toEqual({ label: 'fear', count: 2, avgIntensity: 70 });
    expect(rows.find((r) => r.label === 'joy')?.count).toBe(1);
    expect(rows.find((r) => r.label === 'sadness')).toBeUndefined();
    expect(rows.find((r) => r.label === 'anger')).toBeUndefined();
  });

  it('uses the user rating when one exists', () => {
    expect(frequency(entries, 7, NOW.getTime()).find((r) => r.label === 'calm')?.avgIntensity).toBe(70);
  });

  it('widens with the window', () => {
    expect(frequency(entries, 30, NOW.getTime()).some((r) => r.label === 'anger')).toBe(true);
  });
});

describe('streak', () => {
  it('counts consecutive days', () => {
    const entries = [0, 1, 2, 4].map((d) => entry(d, [{ label: 'joy', intensity: 50 }]));
    expect(streak(entries, NOW)).toBe(3);
  });

  it('stays alive if the last check-in was yesterday', () => {
    const entries = [1, 2].map((d) => entry(d, [{ label: 'joy', intensity: 50 }]));
    expect(streak(entries, NOW)).toBe(2);
  });
});
