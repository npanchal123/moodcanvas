import { describe, expect, it } from 'vitest';
import { ANALYZER_VERSION } from './analyzer';
import { needsRescore, rescore } from './rescore';
import { makeEntry } from './testing';

const NOW = new Date('2026-10-17T12:00:00');
const old = (text: string, extra = {}) =>
  makeEntry(NOW, 3, [{ label: 'calm', intensity: 40 }], {
    text,
    analyzerVersion: 'lexicon-1.0',
    confidence: 0.5,
    ...extra,
  });

describe('needsRescore', () => {
  it('picks out old word-list readings with text', () => {
    expect(needsRescore(old('Estoy muy triste'))).toBe(true);
  });

  it('leaves current, AI-read, text-less and list-picked entries alone', () => {
    expect(needsRescore(old('sad', { analyzerVersion: ANALYZER_VERSION }))).toBe(false);
    expect(needsRescore(old('sad', { analyzerVersion: 'ai-claude-opus-5-5-1' }))).toBe(false);
    expect(needsRescore(old('   '))).toBe(false);
    expect(needsRescore(old('sad', { confidence: 1 }))).toBe(false);
  });
});

describe('rescore', () => {
  it('re-reads with the current analyzer and keeps the user rating and tags out of the changes', () => {
    const entry = old('Estoy muy triste', { userRating: 9, tags: ['family'] });
    const [update] = rescore([entry], 'es');
    expect(update.id).toBe(entry.id);
    expect(update.changes.emotions[0].label).toBe('sadness');
    expect(update.changes.analyzerVersion).toBe(ANALYZER_VERSION);
    expect(Object.keys(update.changes).sort()).toEqual(['analyzerVersion', 'confidence', 'emotions', 'valence']);
  });

  it('keeps the old reading when the new one finds nothing', () => {
    expect(rescore([old('Had lunch and went to the shop')], 'en')).toEqual([]);
  });
});
