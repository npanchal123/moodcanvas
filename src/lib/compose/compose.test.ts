import { describe, expect, it } from 'vitest';
import { LOCALES, type Locale } from '../../i18n';
import { LENGTHS } from '../../practices';
import { estimateSpeechSeconds, segmentsFor } from '../session';
import { compose, GOAL_IDS, SCENE_IDS } from './index';

const make = (text: string, locale: Locale = 'en', extra: Partial<Parameters<typeof compose>[0]> = {}) =>
  compose({ text, locale, feeling: null, ...extra }, LOCALES[locale]);
const spoken = (c: ReturnType<typeof make>) => c.script.segments.map((s) => s.text).join(' ');

describe('compose: understanding what people ask for', () => {
  it('uses the place in their own words, the topic and the feeling', () => {
    const c = make('I’m anxious about my exam tomorrow. Take me to my grandma’s garden in Shimla', 'en', { feeling: 'fear' });
    expect(c.place).toBe('your grandma’s garden in Shimla');
    expect(c.scene).toBe('garden');
    expect(c.topic).toBe('exam');
    expect(c.goal).toBe('calm');
    expect(c.script.title).toBe('Your grandma’s garden in Shimla');
    expect(spoken(c)).toContain('You told me you’re feeling anxious about the exam');
    expect(spoken(c)).toContain('Picture yourself in your grandma’s garden in Shimla');
  });

  it('picks a scene and goal from keywords, and a fitting default otherwise', () => {
    expect(make('I can’t sleep, I keep overthinking about work').goal).toBe('sleep');
    expect(make('I keep overthinking about work').goal).toBe('letgo');
    expect(make('help me sleep, maybe with rain').scene).toBe('rain');
    expect(make('feeling low today', 'en', { feeling: 'sadness' })).toMatchObject({ goal: 'kindness', scene: 'garden' });
    expect(make('so angry at my boss', 'en', { feeling: 'anger' })).toMatchObject({ goal: 'letgo', topic: 'work' });
  });

  it('lets the person’s own choices win', () => {
    const c = make('take me to a beach', 'en', { scene: 'mountain', goal: 'confidence' });
    expect(c).toMatchObject({ scene: 'mountain', goal: 'confidence', place: null });
  });

  it('works for any place, even one no scene knows', () => {
    const c = make('I want to be at the old library where I studied as a kid');
    expect(c.scene).toBeNull();
    expect(c.place).toBe('the old library');
    expect(spoken(c)).toContain('let the old library appear around you');
  });

  it('understands Hindi and Hinglish, and speaks Hindi', () => {
    const c = make('कल की परीक्षा को लेकर बहुत घबराहट है, मुझे पहाड़ों पर ले चलो', 'hi', { feeling: 'fear' });
    expect(c).toMatchObject({ scene: 'mountain', topic: 'exam', goal: 'calm', place: 'पहाड़ों' });
    expect(spoken(c)).toContain('परीक्षा को लेकर');

    const hinglish = make('neend nahi aa rahi, kaam ki tension hai, baarish wali feeling chahiye', 'hi', { feeling: 'fear' });
    expect(hinglish).toMatchObject({ goal: 'sleep', topic: 'work', scene: 'rain', place: null });
    expect(hinglish.script.title).toBe('बारिश का सुकून');
  });

  it('turns "my" into "your" in Hindi too', () => {
    expect(make('मुझे मेरी नानी के घर ले चलो', 'hi').place).toBe('आपकी नानी के घर');
  });

  it('understands Spanish', () => {
    const c = make('Estoy triste por mi familia, llévame a una playa tranquila', 'es', { feeling: 'sadness' });
    expect(c).toMatchObject({ scene: 'beach', topic: 'family', goal: 'kindness', place: 'una playa tranquila' });
    expect(spoken(c)).toContain('Me contaste que sientes tristeza por tu familia');
  });
});

describe('compose: every combination is complete and fits its length', () => {
  it('fills every token and leaves at least a third of the time quiet', () => {
    for (const locale of Object.keys(LOCALES) as Locale[]) {
      for (const scene of [...SCENE_IDS, null]) {
        for (const goal of GOAL_IDS) {
          const c = scene
            ? make('', locale, { scene, goal, feeling: 'fear' })
            : make('', locale, { goal, feeling: null });
          expect(spoken(c), `${locale} ${scene} ${goal}`).not.toMatch(/\{\w+\}/);
          for (const minutes of LENGTHS) {
            const speech = segmentsFor(c.script, minutes).reduce((a, s) => a + estimateSpeechSeconds(s.text), 0);
            expect(speech, `${locale} ${scene} ${goal} ${minutes}`).toBeLessThan(minutes * 60 * (2 / 3));
          }
        }
      }
    }
  });
});
