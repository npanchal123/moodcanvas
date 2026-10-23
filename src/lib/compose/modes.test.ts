import { describe, expect, it } from 'vitest';
import { en as t } from '../../i18n/en';
import { segmentsFor } from '../session';
import { compose, COMPOSE_CONTENT, MODE_IDS, recommendMode } from '.';

const run = (text: string, extra: Partial<Parameters<typeof compose>[0]> = {}) =>
  compose({ text, locale: 'en', feeling: null, ...extra }, t);

describe('recommendMode', () => {
  it.each([
    ['Help me prepare mentally for an important cricket match', 'process'],
    ['I want to imagine my life five years from now', 'future'],
    ['I’m nervous about my presentation tomorrow', 'obstacle'],
    ['I’m afraid of making mistakes in the interview', 'obstacle'],
    ['Take me to a quiet beach', null],
    ['', null],
    ['मुझे क्रिकेट मैच की तैयारी करनी है', 'process'],
    ['Me pongo nerviosa antes de hablar en público', 'obstacle'],
    ['想象几年后的自己', 'future'],
  ])('%s → %s', (text, mode) => {
    expect(recommendMode(text)).toBe(mode);
  });
});

describe('compose with a mode', () => {
  it('uses the suggested mode when none was chosen, and says it was suggested', () => {
    const c = run('Help me prepare mentally for an important cricket match');
    expect(c.mode).toBe('process');
    expect(c.suggested).toBe(true);
    expect(c.topic).toBe('sport');
    // The topic stands in for {focus}: the script is about the game, not a generic task.
    const text = c.script.segments.map((s) => s.text).join(' ');
    expect(text).toMatch(/the game/);
    expect(text).toContain(COMPOSE_CONTENT.en.integrate.process.text);
  });

  it('keeps a chosen mode, and a restful session stays restful', () => {
    expect(run('Take me to a quiet beach', { mode: 'future' }).mode).toBe('future');
    const rest = run('Take me to a quiet beach');
    expect(rest.mode).toBeNull();
    expect(rest.script.segments.map((s) => s.text)).toContain(COMPOSE_CONTENT.en.integrate.rest.text);
    // Sleep isn't turned into rehearsal unless asked for.
    expect(run('I can’t sleep before my presentation', { goal: 'sleep' }).mode).toBeNull();
  });

  it('works without a topic, using the mode’s own words', () => {
    const c = run('', { mode: 'obstacle' });
    expect(c.script.segments.map((s) => s.text).join(' ')).toMatch(/the challenge ahead/);
    expect(c.suggested).toBe(false);
  });

  it('varies the wording between requests, and repeats it for the same request', () => {
    const lines = (text: string) => run(text, { mode: 'process' }).script.segments.map((s) => s.text).join('\n');
    const texts = ['Practise my speech', 'Prepare for the exam', 'Learn guitar chords', 'Train for the race', 'Study for finals', 'Get ready for my interview'];
    expect(new Set(texts.map(lines)).size).toBeGreaterThan(1);
    expect(lines('Practise my speech')).toBe(lines('Practise my speech'));
  });

  it('offers people who don’t picture things another way in, and lets eyes stay open', () => {
    const lines = run('anything').script.segments.map((s) => s.text);
    expect(lines[1]).toBe(COMPOSE_CONTENT.en.imagery.text);
    expect(lines[2]).toMatch(/keep them open/);
  });
});

describe('lengths', () => {
  const c = run('Help me prepare for my match');
  it('adds lines for longer sessions rather than only longer silences', () => {
    const count = (m: 2 | 5 | 10 | 15) => segmentsFor(c.script, m).length;
    expect(count(2)).toBeGreaterThan(0);
    expect(count(5)).toBeGreaterThan(count(2));
    expect(count(15)).toBeGreaterThan(count(10));
  });

  it('can leave the breathing steps out', () => {
    const all = segmentsFor(c.script, 5);
    const quiet = segmentsFor(c.script, 5, false);
    expect(quiet.length).toBeLessThan(all.length);
    expect(quiet.some((s) => s.breath)).toBe(false);
  });
});

describe('every language', () => {
  it.each(Object.entries(COMPOSE_CONTENT))('%s has every mode with two wordings that fit every length', (_, content) => {
    for (const id of MODE_IDS) {
      const mode = content.modes[id];
      expect(mode.name && mode.description && mode.why && mode.focus).toBeTruthy();
      expect(mode.variants).toHaveLength(2);
      for (const v of mode.variants) {
        expect(v.map((l) => l.tier)).toEqual([3, 5, 10, 15, 3]);
        expect(v[0].text).toContain('{focus}');
      }
      expect(content.integrate[id].text).toBeTruthy();
    }
    expect(content.integrate.rest.text && content.imagery.text).toBeTruthy();
    expect(content.topics.sport.keywords.length && content.topics.performance.keywords.length).toBeTruthy();
  });
});

describe('the feeling follows the mode when none was named', () => {
  it('prepares for a match with focus, not a generic calm beach', () => {
    const c = run('Help me prepare mentally for an important cricket match');
    expect(c.goal).toBe('focus');
    expect(c.scene).toBe('sky');
    expect(run('Getting criticism at work, help me handle it').goal).toBe('confidence');
    // Feeling anxious still gets calm, with the rehearsal alongside.
    const anxious = compose({ text: 'Tomorrow’s meeting, what if I mess up', locale: 'en', feeling: 'fear' }, t);
    expect(anxious).toMatchObject({ goal: 'calm', mode: 'obstacle' });
    // A named feeling or place still wins.
    expect(run('Help me prepare for my match, I want to feel calm').goal).toBe('calm');
    expect(run('Prepare for my match', { scene: 'beach' }).scene).toBe('beach');
  });
});
