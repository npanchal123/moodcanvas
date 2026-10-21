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

  it('understands French, keeping the article and turning "ma" into "votre"', () => {
    const c = make('Mon examen de demain me stresse. Emmène-moi au jardin de ma grand-mère', 'fr', { feeling: 'fear' });
    expect(c).toMatchObject({ scene: 'garden', topic: 'exam', goal: 'calm', place: 'le jardin de votre grand-mère' });
    expect(c.script.title).toBe('Le jardin de votre grand-mère');
    expect(spoken(c)).toContain('Vous m’avez dit ressentir de l’anxiété concernant l’examen');
    // "en montagne" has no article to sit in a sentence, so the scene's own words are used.
    expect(make('Emmène-moi en montagne', 'fr')).toMatchObject({ scene: 'mountain', place: null });
  });

  it('understands Portuguese', () => {
    const c = make('Estou triste com a minha família, me leve para uma praia tranquila', 'pt', { feeling: 'sadness' });
    expect(c).toMatchObject({ scene: 'beach', topic: 'family', goal: 'kindness', place: 'uma praia tranquila' });
    expect(spoken(c)).toContain('Você me contou que está sentindo tristeza quando pensa sobre a sua família');
    expect(make('quero ir na casa da minha avó', 'pt').place).toBe('a casa da sua avó');
  });

  it('understands Russian, keeping the motion form of the place', () => {
    const c = make('Волнуюсь из-за экзамена. Отведи меня к моей бабушке в сад', 'ru', { feeling: 'fear' });
    expect(c).toMatchObject({ topic: 'exam', goal: 'calm', place: 'к вашей бабушке в сад', scene: 'garden' });
    expect(c.script.title).toBe('Путешествие к вашей бабушке в сад');
    expect(spoken(c)).toContain('Вы рассказали, что чувствуете тревогу, когда думаете об экзамене');
    expect(spoken(c)).toContain('вы переноситесь к вашей бабушке в сад');
    // "садитесь" isn't a garden.
    expect(make('садитесь поудобнее', 'ru').scene).not.toBe('garden');
  });

  it('understands Chinese, which has no spaces', () => {
    const c = make('明天要考试，我很焦虑。带我去奶奶的花园', 'zh', { feeling: 'fear' });
    expect(c).toMatchObject({ scene: 'garden', topic: 'exam', goal: 'calm', place: '奶奶的花园' });
    expect(c.script.title).toBe('奶奶的花园');
    expect(spoken(c)).toContain('你说你因为考试感到焦虑');
    expect(make('我睡不着，一直在想工作', 'zh')).toMatchObject({ goal: 'sleep', topic: 'work' });
  });

  it('understands Arabic, with "the" and "and" joined onto words', () => {
    const c = make('أنا قلق من الامتحان، خذني إلى حديقة جدتي', 'ar', { feeling: 'fear' });
    expect(c).toMatchObject({ scene: 'garden', topic: 'exam', goal: 'calm', place: 'حديقة جدتك' });
    expect(spoken(c)).toContain('القلق بشأن الامتحان شعور مفهوم تمامًا');
    expect(make('لا أستطيع النوم وأريد البحر', 'ar')).toMatchObject({ goal: 'sleep', scene: 'beach' });
  });

  it('understands Bengali', () => {
    const c = make('কালকের পরীক্ষা নিয়ে খুব দুশ্চিন্তা হচ্ছে। আমাকে আমার দিদিমার বাগানে নিয়ে চলো', 'bn', { feeling: 'fear' });
    expect(c).toMatchObject({ scene: 'garden', topic: 'exam', goal: 'calm', place: 'আপনার দিদিমার বাগানে' });
    expect(spoken(c)).toContain('আপনি বলেছেন, পরীক্ষা নিয়ে আপনি উদ্বিগ্ন বোধ করছেন');
    // "বসে" (sitting) isn't "বস" (boss), and "বন্ধু" (friend) isn't "বন" (forest).
    expect(make('বন্ধুর সঙ্গে বসে আছি', 'bn')).toMatchObject({ topic: 'friends' });
    expect(make('বন্ধুর সঙ্গে বসে আছি', 'bn').scene).not.toBe('forest');
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
