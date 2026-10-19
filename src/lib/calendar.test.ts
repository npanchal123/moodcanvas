import { describe, expect, it } from 'vitest';
import { buildCalendar } from './calendar';
import { makeEntry } from './testing';

// A Saturday.
const NOW = new Date('2026-10-17T12:00:00');

describe('buildCalendar', () => {
  it('lays out Monday-first weeks ending with the current week', () => {
    const grid = buildCalendar([], 5, NOW);
    expect(grid).toHaveLength(5);
    expect(grid.every((w) => w.length === 7)).toBe(true);
    expect(grid[0][0].date.getDay()).toBe(1);
    const last = grid[4];
    expect(last[5].date.getDate()).toBe(17);
    expect(last[5].inFuture).toBe(false);
    expect(last[6].inFuture).toBe(true);
  });

  it('picks the most frequent emotion per day, breaking ties by strength', () => {
    const entries = [
      makeEntry(NOW, 0, [{ label: 'joy', intensity: 40 }]),
      makeEntry(NOW, 0, [{ label: 'fear', intensity: 90 }]),
      makeEntry(NOW, 1, [{ label: 'calm', intensity: 50 }]),
      makeEntry(NOW, 1, [{ label: 'calm', intensity: 70 }]),
      makeEntry(NOW, 1, [{ label: 'anger', intensity: 95 }]),
    ];
    const week = buildCalendar(entries, 1, NOW)[0];
    expect(week[5]).toMatchObject({ count: 2, dominant: 'fear', avgIntensity: 90 });
    expect(week[4]).toMatchObject({ count: 3, dominant: 'calm', avgIntensity: 60 });
    expect(week[3].count).toBe(0);
    expect(week[3].dominant).toBeUndefined();
  });
});
