import type { LanguagePack, Weights } from './types';

/**
 * Arabic starter lexicon: Modern Standard Arabic plus common Egyptian, Levantine and Gulf words. Text and keys are
 * normalized (vowel marks dropped, أ/إ/آ → ا, ى → ي, ة → ه), and `variants` strips the "and/the/with" prefixes and
 * common endings joined onto words ("والقلق" → "قلق", "سعيدة" → "سعيد"). Machine-drafted: have a native speaker
 * review it.
 */
const LEXICON: Record<string, Weights> = {
  // الفرح
  سعيد: { joy: 1 },
  سعاده: { joy: 1 },
  فرح: { joy: 1 },
  فرحان: { joy: 0.9 },
  مبسوط: { joy: 0.9 },
  مسرور: { joy: 0.9 },
  متحمس: { joy: 0.9 },
  ممتن: { joy: 0.8, calm: 0.2 },
  فخور: { joy: 0.9 },
  رائع: { joy: 0.8 },
  جميل: { joy: 0.5 },
  حب: { joy: 0.6 },
  متفائل: { joy: 0.7 },

  // الهدوء
  هادئ: { calm: 1 },
  هدوء: { calm: 1 },
  مرتاح: { calm: 0.9 },
  مطمئن: { calm: 0.9 },
  راحه: { calm: 0.8 },
  سكينه: { calm: 1 },
  استرخاء: { calm: 0.9 },
  مسترخي: { calm: 0.9 },

  // الحزن
  حزين: { sadness: 1 },
  حزن: { sadness: 1 },
  زعلان: { sadness: 0.8, anger: 0.2 },
  مكتئب: { sadness: 1 },
  اكتئاب: { sadness: 1 },
  وحيد: { sadness: 0.8 },
  ابكي: { sadness: 0.9 },
  بكاء: { sadness: 0.9 },
  بكيت: { sadness: 0.9 },
  دموع: { sadness: 0.8 },
  مخذول: { sadness: 0.8 },
  خيبه: { sadness: 0.8 },
  محبط: { sadness: 0.8 },
  متضايق: { sadness: 0.7 },
  مهموم: { sadness: 0.8 },
  يائس: { sadness: 1 },
  تعبان: { sadness: 0.5 },
  مرهق: { sadness: 0.5 },
  مكسور: { sadness: 0.8 },
  حنين: { sadness: 0.5 },

  // الغضب
  غاضب: { anger: 1 },
  غضب: { anger: 1 },
  معصب: { anger: 0.9 },
  عصبي: { anger: 0.8 },
  منزعج: { anger: 0.6 },
  مستاء: { anger: 0.6 },
  اكره: { anger: 0.8, disgust: 0.2 },
  كره: { anger: 0.8, disgust: 0.2 },
  حقد: { anger: 0.8 },
  غيظ: { anger: 0.9 },

  // الخوف / القلق
  قلق: { fear: 1 },
  خائف: { fear: 1 },
  خايف: { fear: 1 },
  خوف: { fear: 1 },
  متوتر: { fear: 0.8 },
  توتر: { fear: 0.7 },
  مرعوب: { fear: 1 },
  رعب: { fear: 1 },
  ذعر: { fear: 1 },
  هلع: { fear: 1 },
  مضغوط: { fear: 0.7 },
  ضغط: { fear: 0.5 },
  مرتبك: { fear: 0.6 },

  // الدهشة
  مندهش: { surprise: 1 },
  دهشه: { surprise: 0.9 },
  متفاجئ: { surprise: 0.9 },
  مفاجاه: { surprise: 0.8 },
  صدمه: { surprise: 0.8 },
  مصدوم: { surprise: 0.9 },
  واو: { surprise: 0.7 },

  // الاشمئزاز
  مقرف: { disgust: 1 },
  قرف: { disgust: 1 },
  اشمئزاز: { disgust: 1 },
  مشمئز: { disgust: 1 },
  مقزز: { disgust: 0.9 },
  خجل: { disgust: 0.5, sadness: 0.3 },
  عار: { disgust: 0.6, sadness: 0.3 },
};

const PREFIXES = ['وال', 'بال', 'فال', 'كال', 'لل', 'ال', 'و', 'ف', 'ب', 'ل', 'ك'];
// ا is the ending of "سعيدًا" once its vowel mark is dropped.
const SUFFIXES = ['ين', 'ون', 'ات', 'ها', 'هم', 'ني', 'ه', 'ك', 'ي', 'ا'];

export const arabic: LanguagePack = {
  lexicon: LEXICON,
  normalize: (text) =>
    text
      .replace(/[ً-ْٰـ]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه'),
  negators: new Set(['لا', 'لم', 'لن', 'ليس', 'لست', 'مش', 'مو', 'غير', 'بدون']),
  boosters: new Set(['جدا', 'كثيرا', 'كثير', 'كتير', 'للغايه', 'تماما', 'حقا', 'فعلا', 'اوي', 'بشده']),
  dampeners: new Set(['قليلا', 'شويه', 'شوي', 'نوعاما']),
  clauseBreaks: new Set(['لكن', 'ولكن', 'بس', 'رغم']),
  stopwords: new Set([
    'انا', 'انت', 'هو', 'هي', 'نحن', 'في', 'من', 'الي', 'علي', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'كان',
    'كانت', 'اليوم', 'غدا', 'امس', 'الان', 'اشعر', 'احس', 'حاسس', 'عندي', 'لدي', 'و', 'ان', 'او', 'ثم', 'كل', 'بس',
  ]),
  phrases: [[/نوعًا ما|نوعا ما/g, 'نوعاما']],
  crisis: [
    /ان اموت/,
    /(ابغي|ابي|بدي|عايز|عاوز) (ا)?موت/,
    /انتحار|انتحر/,
    /اقتل نفسي/,
    /ؤذي نفسي|اذي نفسي|ايذاء نفسي/,
    /لا اريد (ان )?اعيش/,
    /لا اريد الحياه/,
    /انهي حياتي/,
  ],
  variants: (word) => {
    const bases = [word];
    for (const p of PREFIXES) if (word.startsWith(p) && word.length - p.length >= 3) bases.push(word.slice(p.length));
    const forms = [...bases];
    for (const b of bases) {
      for (const s of SUFFIXES) if (b.endsWith(s) && b.length - s.length >= 3) forms.push(b.slice(0, -s.length));
    }
    return forms;
  },
};
