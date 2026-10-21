import { describe, expect, it } from 'vitest';
import { analyze, type AnalyzerLanguage } from './analyzer';

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

describe('analyze (Hindi and Hinglish)', () => {
  it('reads Devanagari without breaking words at vowel signs', () => {
    const r = analyze('कल के एग्ज़ाम को लेकर बहुत चिंता है, पर थोड़ी खुशी भी है।', { language: 'hi' });
    expect(r.emotions[0].label).toBe('fear');
    expect(r.emotions[1].label).toBe('joy');
    expect(r.emotions[0].intensity).toBeGreaterThan(r.emotions[1].intensity);
  });

  it('reads romanized Hinglish mixed with English, in any UI language', () => {
    expect(analyze('aaj bahut tension hai yaar', { language: 'en' }).emotions[0].label).toBe('fear');
    expect(analyze('main bahut happy hoon', { language: 'en' }).emotions[0].label).toBe('joy');
    expect(analyze('bahut gussa aa raha hai', { language: 'es' }).emotions[0].label).toBe('anger');
  });

  it('boosts with बहुत / bahut', () => {
    const plain = analyze('मैं उदास हूं').emotions[0].intensity;
    expect(analyze('मैं बहुत उदास हूं').emotions[0].intensity).toBeGreaterThan(plain);
  });

  it('understands "not" after the word, and spellings with or without nukta and chandrabindu', () => {
    expect(analyze('मैं खुश नहीं हूँ', { language: 'hi' }).emotions[0].label).toBe('sadness');
    expect(analyze('khush nahi hoon', { language: 'hi' }).emotions[0].label).toBe('sadness');
    expect(analyze('बहुत ज़्यादा डर लग रहा है').emotions[0].label).toBe('fear');
    expect(analyze('बहुत ज्यादा डर लग रहा है').emotions[0].label).toBe('fear');
  });

  it('maps feminine and oblique forms to the base word', () => {
    expect(analyze('मैं अकेली हूं').emotions[0].label).toBe('sadness');
    expect(analyze('main akeli hoon').emotions[0].label).toBe('sadness');
  });

  it('keeps English negation working when the UI is in Hindi', () => {
    expect(analyze('I am not happy', { language: 'hi' }).emotions[0].label).toBe('sadness');
    expect(analyze('happy, not sad', { language: 'hi' }).emotions[0].label).toBe('joy');
  });

  it('detects Hindi and Hinglish crisis language in any UI language', () => {
    expect(analyze('मैं मरना चाहता हूं').crisis).toBe(true);
    expect(analyze('ख़ुद को ख़त्म करने का मन करता है').crisis).toBe(true);
    expect(analyze('ab jeena nahi chahti').crisis).toBe(true);
    expect(analyze('exam ki itni tension hai ki mar jaunga lol').crisis).toBe(false);
  });
});

describe('analyze (French, Portuguese, Russian, Chinese, Arabic, Bengali)', () => {
  const top = (text: string, language: AnalyzerLanguage) => analyze(text, { language }).emotions[0]?.label;

  it('reads each language, with its own word forms', () => {
    expect(top('Je suis très inquiète pour mon examen', 'fr')).toBe('fear');
    expect(top('Estou muito ansiosa com a prova', 'pt')).toBe('fear');
    expect(top('Мне очень грустно сегодня', 'ru')).toBe('sadness');
    expect(top('我今天很开心', 'zh')).toBe('joy');
    expect(top('أنا حزينة جدا اليوم', 'ar')).toBe('sadness');
    expect(top('আজ খুব খুশি লাগছে', 'bn')).toBe('joy');
  });

  it('understands "not" in each language', () => {
    expect(top('je ne suis pas heureux', 'fr')).toBe('sadness');
    expect(top('não estou feliz', 'pt')).toBe('sadness');
    expect(top('мне не радостно', 'ru')).toBe('sadness');
    expect(top('我不开心', 'zh')).toBe('sadness');
    expect(top('لست سعيدا', 'ar')).toBe('sadness');
    expect(top('আমি খুশি না', 'bn')).toBe('sadness');
  });

  it('reads Arabic words with "and"/"the" joined on, and Chinese words inside a sentence', () => {
    expect(top('أشعر بالقلق والخوف', 'ar')).toBe('fear');
    expect(top('和朋友吵架后心情很低落', 'zh')).toBe('sadness');
    // "麻烦" (trouble) isn't "烦" (annoyed).
    expect(analyze('有点麻烦', { language: 'zh' }).emotions).toEqual([]);
  });

  it('detects crisis language in each, whatever the UI language', () => {
    for (const text of ['je veux mourir', 'quero morrer', 'не хочу жить', '我不想活了', 'أريد أن أموت', 'আমি মরে যেতে চাই']) {
      expect(analyze(text, { language: 'en' }).crisis, text).toBe(true);
    }
  });
});
