import { describe, expect, it } from 'vitest';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { weeklyReflection as reflect } from './reflection';
import { makeEntry } from './testing';
import type { EmotionEntry } from './types';

const NOW = new Date('2026-10-17T12:00:00');
const weeklyReflection = (entries: EmotionEntry[], now: number) => reflect(entries, en, 'en', now);

describe('weeklyReflection', () => {
  it('invites a first check-in when the week is empty', () => {
    expect(weeklyReflection([], NOW.getTime())[0]).toMatch(/No check-ins/);
  });

  it('speaks Spanish and shows suggested tags in Spanish', () => {
    const entries = [0, 1].map((d) =>
      makeEntry(NOW, d, [{ label: 'fear', intensity: 60 }], { valence: -0.5, tags: ['school'] }),
    );
    const lines = reflect(entries, es, 'es', NOW.getTime());
    expect(lines[0]).toBe('Registraste 2 veces esta semana.');
    expect(lines.at(-1)).toBe('“estudios” apareció 2 veces, y en esos registros te sentiste sobre todo ansioso/a.');
  });

  it('summarises the week and compares it with the one before', () => {
    const entries = [
      makeEntry(NOW, 0, [{ label: 'fear', intensity: 80 }], { valence: -0.6, tags: ['school'] }),
      makeEntry(NOW, 1, [{ label: 'fear', intensity: 60 }], { valence: -0.5, tags: ['school'] }),
      makeEntry(NOW, 2, [{ label: 'joy', intensity: 50 }], { valence: 0.8 }),
      makeEntry(NOW, 9, [{ label: 'calm', intensity: 50 }], { valence: 0.7 }),
    ];
    const lines = weeklyReflection(entries, NOW.getTime());
    expect(lines[0]).toBe('You checked in 3 times this week.');
    expect(lines[1]).toBe('Fear / Anxiety came up most (2 times).');
    expect(lines[2]).toMatch(/heavier than last week/);
    expect(lines[3]).toMatch(/strongest feeling was anxiety .*\(80\/100\)/);
    expect(lines[4]).toBe('“school” came up 2 times, and those check-ins were mostly anxious.');
  });
});
