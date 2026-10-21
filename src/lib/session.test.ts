import { describe, expect, it } from 'vitest';
import { LENGTHS, PRACTICE_CONTENT, PRACTICE_IDS, PRACTICE_META } from '../practices';
import { audioFile, estimateSpeechSeconds, formatClock, MIN_PAUSE_SECONDS, planPauses, segmentsFor, textHash } from './session';

const safePlace = PRACTICE_CONTENT.en.practices['safe-place'];

describe('segmentsFor', () => {
  it('adds steps as the practice gets longer', () => {
    const counts = LENGTHS.map((m) => segmentsFor(safePlace, m).length);
    expect(counts[0]).toBeLessThan(counts[1]);
    expect(counts[1]).toBeLessThan(counts[2]);
    expect(counts[2]).toBe(safePlace.segments.length);
  });
});

describe('planPauses', () => {
  it('fills the chosen length exactly when there is room', () => {
    for (const minutes of LENGTHS) {
      const segments = segmentsFor(safePlace, minutes);
      const speech = segments.map((s) => estimateSpeechSeconds(s.text));
      const pauses = planPauses(segments, speech, minutes);
      const total = [...speech, ...pauses].reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(minutes * 60, 5);
      expect(Math.min(...pauses)).toBeGreaterThanOrEqual(MIN_PAUSE_SECONDS);
    }
  });

  it('keeps a minimum silence when speech runs long', () => {
    const segments = segmentsFor(safePlace, 3);
    const pauses = planPauses(segments, segments.map(() => 60), 3);
    expect(pauses.every((p) => p === MIN_PAUSE_SECONDS)).toBe(true);
  });
});

describe('practice content', () => {
  it('has the same steps in every language, and each version fits its length', () => {
    const scripts = Object.values(PRACTICE_CONTENT);
    for (const id of PRACTICE_IDS) {
      const en = PRACTICE_CONTENT.en.practices[id];
      for (const content of scripts) {
        const shape = content.practices[id].segments.map((s) => [s.id, s.tier, s.pause]);
        expect(shape, id).toEqual(en.segments.map((s) => [s.id, s.tier, s.pause]));
      }
      for (const minutes of PRACTICE_META[id].lengths) {
        for (const script of scripts.map((c) => c.practices[id])) {
          const speech = segmentsFor(script, minutes).reduce((a, s) => a + estimateSpeechSeconds(s.text), 0);
          // Speech should leave at least a third of the time for quiet imagining.
          expect(speech, `${id} ${minutes} min`).toBeLessThan(minutes * 60 * (2 / 3));
        }
      }
    }
  });
});

describe('audio file names', () => {
  it('change when the words change', () => {
    const step = safePlace.segments[0];
    expect(audioFile('en', 'safe-place', step)).toMatch(/^en\/safe-place\/s01-[0-9a-f]{8}\.mp3$/);
    expect(textHash(step.text)).not.toBe(textHash(`${step.text} `));
  });
});

it('formats a countdown clock', () => {
  expect(formatClock(65)).toBe('1:05');
  expect(formatClock(-3)).toBe('0:00');
});
