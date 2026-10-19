import { describe, expect, it } from 'vitest';
import { analyze } from './analyzer';

describe('analyze', () => {
  it('maps the plan example to anxiety first, some joy second', () => {
    const r = analyze("I'm really anxious about tomorrow's exam but kind of excited too.");
    expect(r.emotions[0].label).toBe('fear');
    expect(r.emotions[1].label).toBe('joy');
    expect(r.emotions[0].intensity).toBeGreaterThan(r.emotions[1].intensity);
    expect(r.valence).toBeLessThan(0);
    expect(r.lowConfidence).toBe(false);
  });

  it('turns a negated positive into sadness', () => {
    expect(analyze('I am not happy').emotions[0].label).toBe('sadness');
  });

  it('does not carry negation past a clause break', () => {
    const r = analyze('not happy but excited');
    expect(r.emotions.map((e) => e.label)).toContain('joy');
  });

  it('boosts intensity for intensifiers and exclamation marks', () => {
    const plain = analyze('I am angry').emotions[0].intensity;
    const strong = analyze('I am very angry!!!').emotions[0].intensity;
    expect(strong).toBeGreaterThan(plain);
  });

  it('dampens intensity for softeners', () => {
    const plain = analyze('I am sad').emotions[0].intensity;
    const soft = analyze('I am slightly sad').emotions[0].intensity;
    expect(soft).toBeLessThan(plain);
  });

  it('reads emoji', () => {
    expect(analyze('😭').emotions[0].label).toBe('sadness');
  });

  it('flags low confidence when nothing emotional is found', () => {
    const r = analyze('Had lunch and went to the shop');
    expect(r.lowConfidence).toBe(true);
    expect(r.emotions).toHaveLength(0);
  });

  it('trusts chips the user picked', () => {
    const r = analyze('', { chips: ['calm'] });
    expect(r.emotions[0].label).toBe('calm');
    expect(r.confidence).toBe(1);
    expect(r.lowConfidence).toBe(false);
  });

  it('detects crisis language', () => {
    expect(analyze('some days I want to die').crisis).toBe(true);
    expect(analyze('this exam is killing me').crisis).toBe(false);
  });
});

describe('analyze (Spanish)', () => {
  it('reads the plan example in Spanish, with accents, gender and plurals', () => {
    const r = analyze('Estoy muy ansiosa por el examen de mañana, pero también un poco emocionada.', { language: 'es' });
    expect(r.emotions[0].label).toBe('fear');
    expect(r.emotions[1].label).toBe('joy');
    expect(r.emotions[0].intensity).toBeGreaterThan(r.emotions[1].intensity);
  });

  it('matches words typed without accents', () => {
    expect(analyze('tengo panico', { language: 'es' }).emotions[0].label).toBe('fear');
    expect(analyze('tengo pánico', { language: 'es' }).emotions[0].label).toBe('fear');
  });

  it('handles Spanish negation without letting "sin embargo" negate', () => {
    expect(analyze('no estoy feliz', { language: 'es' }).emotions[0].label).toBe('sadness');
    expect(analyze('cansada, sin embargo feliz', { language: 'es' }).emotions[0].label).toBe('joy');
  });

  it('picks the language that understands the text, whatever the UI language', () => {
    expect(analyze('I am so happy', { language: 'es' }).emotions[0].label).toBe('joy');
    expect(analyze('estoy triste', { language: 'en' }).emotions[0].label).toBe('sadness');
  });

  it('detects Spanish crisis language in any UI language', () => {
    expect(analyze('a veces quiero morir', { language: 'en' }).crisis).toBe(true);
    expect(analyze('pensé en hacerme daño').crisis).toBe(true);
  });
});
