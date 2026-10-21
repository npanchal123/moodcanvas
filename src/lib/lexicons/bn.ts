import type { LanguagePack, Weights } from './types';

/**
 * Bengali starter lexicon. As in Hindi, "not" usually comes after the word ("খুশি না"), and `variants` drops
 * common endings ("দুঃখে" → "দুঃখ", "খুশিতে" → "খুশি"). Machine-drafted: have a native speaker review it.
 */
const LEXICON: Record<string, Weights> = {
  // আনন্দ
  খুশি: { joy: 1 },
  আনন্দ: { joy: 1 },
  আনন্দিত: { joy: 1 },
  সুখী: { joy: 1 },
  সুখ: { joy: 0.8 },
  উত্তেজিত: { joy: 0.8 },
  গর্বিত: { joy: 0.9 },
  কৃতজ্ঞ: { joy: 0.8, calm: 0.2 },
  দারুণ: { joy: 0.8 },
  ভালো: { joy: 0.4, calm: 0.2 },
  চমৎকার: { joy: 0.8 },
  মজা: { joy: 0.7 },
  উৎফুল্ল: { joy: 0.9 },
  ভালোবাসা: { joy: 0.8 },

  // শান্তি
  শান্ত: { calm: 1 },
  শান্তি: { calm: 0.9 },
  স্বস্তি: { calm: 0.9 },
  আরাম: { calm: 0.7 },
  নিশ্চিন্ত: { calm: 0.9 },

  // দুঃখ
  দুঃখ: { sadness: 1 },
  দুঃখিত: { sadness: 1 },
  মনখারাপ: { sadness: 1 },
  কষ্ট: { sadness: 0.8 },
  বিষণ্ণ: { sadness: 1 },
  হতাশ: { sadness: 0.8 },
  একা: { sadness: 0.7 },
  একাকী: { sadness: 0.8 },
  নিঃসঙ্গ: { sadness: 0.8 },
  কান্না: { sadness: 0.9 },
  কাঁদছি: { sadness: 0.9 },
  কেঁদে: { sadness: 0.9 },
  ক্লান্ত: { sadness: 0.4 },
  খারাপ: { sadness: 0.5 },
  অসহায়: { sadness: 0.8, fear: 0.2 },

  // রাগ
  রাগ: { anger: 1 },
  রাগান্বিত: { anger: 1 },
  রেগে: { anger: 1 },
  বিরক্ত: { anger: 0.6, disgust: 0.2 },
  ক্ষুব্ধ: { anger: 0.9 },
  ক্ষোভ: { anger: 0.8 },
  মেজাজখারাপ: { anger: 0.8 },
  অসহ্য: { anger: 0.7 },

  // ভয় / উদ্বেগ
  ভয়: { fear: 1 },
  ভীত: { fear: 1 },
  উদ্বিগ্ন: { fear: 1 },
  উদ্বেগ: { fear: 1 },
  চিন্তা: { fear: 0.6 },
  দুশ্চিন্তা: { fear: 0.9 },
  টেনশন: { fear: 0.8 },
  নার্ভাস: { fear: 0.8 },
  আতঙ্ক: { fear: 1 },
  ঘাবড়ে: { fear: 0.8 },
  অস্থির: { fear: 0.7 },
  চাপ: { fear: 0.5 },

  // বিস্ময়
  অবাক: { surprise: 1 },
  বিস্মিত: { surprise: 1 },
  বিস্ময়: { surprise: 0.9 },
  চমকে: { surprise: 0.8 },
  হতবাক: { surprise: 0.9 },
  অপ্রত্যাশিত: { surprise: 0.7 },

  // ঘৃণা
  ঘৃণা: { disgust: 1 },
  ঘেন্না: { disgust: 1 },
  বিতৃষ্ণা: { disgust: 0.9 },
  লজ্জা: { disgust: 0.6, sadness: 0.3 },
  জঘন্য: { disgust: 0.8 },
};

// Longest first, so "গুলোতে" goes before "তে".
const ENDINGS = ['গুলোতে', 'গুলো', 'টাতে', 'টা', 'টি', 'তে', 'ের', 'কে', 'র', 'ও', 'ই', 'ে'];

export const bengali: LanguagePack = {
  lexicon: LEXICON,
  negators: new Set(['কখনো', 'কখনোই']),
  negatorsAfter: new Set(['না', 'নই', 'নয়', 'নেই', 'নি']),
  boosters: new Set(['খুব', 'খুবই', 'ভীষণ', 'অনেক', 'প্রচণ্ড', 'একদম', 'সত্যিই', 'বড্ড']),
  dampeners: new Set(['একটু', 'কিছুটা', 'সামান্য', 'অল্প']),
  clauseBreaks: new Set(['কিন্তু', 'তবে', 'তবুও', 'আর']),
  stopwords: new Set([
    'আমি', 'আমার', 'আমাকে', 'তুমি', 'আপনি', 'সে', 'এটা', 'ওটা', 'এই', 'ওই', 'আছে', 'ছিল', 'হচ্ছে', 'লাগছে', 'করছি',
    'আজ', 'কাল', 'এখন', 'যে', 'কি', 'কী', 'এবং', 'নিয়ে', 'জন্য', 'থেকে', 'মনে', 'হয়ে', 'কিন্তু', 'আর',
  ]),
  phrases: [
    [/মন\s+খারাপ/g, 'মনখারাপ'],
    [/মেজাজ\s+খারাপ/g, 'মেজাজখারাপ'],
  ],
  crisis: [
    /মরে যেতে চাই/,
    /মরতে চাই/,
    /আত্মহত্যা/,
    /নিজেকে (শেষ|মেরে)/,
    /বাঁ?চতে চাই না/,
    /বাঁ?চতে ইচ্ছে করে না/,
    /নিজের ক্ষতি/,
    /জীবন শেষ করে/,
  ],
  variants: (word) => {
    const forms = [word];
    for (const ending of ENDINGS) {
      if (word.endsWith(ending) && word.length - ending.length >= 2) forms.push(word.slice(0, -ending.length));
    }
    return forms;
  },
};
