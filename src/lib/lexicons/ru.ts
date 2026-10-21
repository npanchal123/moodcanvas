import type { LanguagePack, Weights } from './types';

/**
 * Russian starter lexicon. Russian words change their endings a lot ("грустно", "грустная", "грустный"), so most
 * keys are stems and `variants` tries the word with up to four letters dropped from the end. ё is read as е.
 * Machine-drafted: have a native speaker review it.
 */
const LEXICON: Record<string, Weights> = {
  // радость
  счаст: { joy: 1 },
  радост: { joy: 1 },
  рад: { joy: 0.9 },
  весел: { joy: 0.9 },
  довол: { joy: 0.8, calm: 0.2 },
  восторг: { joy: 1 },
  вдохнов: { joy: 0.8 },
  горжусь: { joy: 0.9 },
  гордост: { joy: 0.9 },
  благодар: { joy: 0.8, calm: 0.2 },
  отлично: { joy: 0.8 },
  прекрасн: { joy: 0.9 },
  хорошо: { joy: 0.4, calm: 0.2 },
  любов: { joy: 0.8 },
  кайф: { joy: 0.8 },
  ура: { joy: 0.7 },
  супер: { joy: 0.7 },

  // спокойствие
  спокой: { calm: 1 },
  спокойств: { calm: 1 },
  расслаб: { calm: 0.9 },
  умиротвор: { calm: 1 },
  безмятеж: { calm: 1 },
  облегчен: { calm: 0.8, joy: 0.3 },
  отдохнув: { calm: 0.8 },
  гармони: { calm: 0.8 },
  уравновеш: { calm: 0.8 },

  // грусть
  груст: { sadness: 1 },
  печал: { sadness: 1 },
  тоск: { sadness: 1 },
  депресс: { sadness: 1 },
  одинок: { sadness: 0.8 },
  одиночеств: { sadness: 0.8 },
  плач: { sadness: 0.9 },
  плака: { sadness: 0.9 },
  слез: { sadness: 0.8 },
  разочаров: { sadness: 0.8 },
  обид: { sadness: 0.7, anger: 0.2 },
  пусто: { sadness: 0.7 },
  уныл: { sadness: 0.9 },
  уныни: { sadness: 0.9 },
  безнадеж: { sadness: 1 },
  устал: { sadness: 0.4 },
  вымотан: { sadness: 0.5 },
  плохо: { sadness: 0.5 },
  хандр: { sadness: 0.8 },
  тяжело: { sadness: 0.5 },

  // злость
  злой: { anger: 1 },
  злая: { anger: 1 },
  злюсь: { anger: 1 },
  злит: { anger: 0.9 },
  злост: { anger: 1 },
  зол: { anger: 1 },
  бешен: { anger: 1 },
  ярост: { anger: 1 },
  раздраж: { anger: 0.6 },
  бесит: { anger: 0.8 },
  бесят: { anger: 0.8 },
  возмущ: { anger: 0.8 },
  ненавиж: { anger: 0.9, disgust: 0.2 },
  ненавист: { anger: 0.9, disgust: 0.2 },
  сердит: { anger: 0.9 },
  сержусь: { anger: 0.9 },
  достал: { anger: 0.7 },

  // страх / тревога
  трев: { fear: 1 },
  тревож: { fear: 1 },
  страх: { fear: 1 },
  страшн: { fear: 1 },
  боюсь: { fear: 1 },
  бояз: { fear: 0.9 },
  волнуюсь: { fear: 0.8 },
  волнение: { fear: 0.7 },
  волнует: { fear: 0.7 },
  беспоко: { fear: 0.8 },
  паник: { fear: 1 },
  нерв: { fear: 0.7 },
  нервнич: { fear: 0.8 },
  стресс: { fear: 0.7 },
  напряж: { fear: 0.6 },
  ужас: { fear: 0.8 },
  переживаю: { fear: 0.8 },
  переживан: { fear: 0.7 },
  испуг: { fear: 1 },

  // удивление
  удивл: { surprise: 1 },
  шок: { surprise: 0.8 },
  ошеломл: { surprise: 0.9 },
  неожидан: { surprise: 0.7 },
  вау: { surprise: 0.8 },
  ого: { surprise: 0.6 },

  // отвращение
  отвращ: { disgust: 1 },
  противн: { disgust: 0.9 },
  мерзк: { disgust: 0.9 },
  гадк: { disgust: 0.8 },
  омерз: { disgust: 1 },
  тошнит: { disgust: 0.7 },
  стыд: { disgust: 0.6, sadness: 0.3 },
  фу: { disgust: 0.7 },
};

export const russian: LanguagePack = {
  lexicon: LEXICON,
  normalize: (text) => text.replace(/ё/g, 'е'),
  negators: new Set(['не', 'нет', 'ни', 'без', 'никогда']),
  boosters: new Set([
    'очень', 'так', 'слишком', 'совсем', 'сильно', 'ужасно', 'безумно', 'крайне', 'невероятно', 'реально', 'жутко',
    'настолько',
  ]),
  dampeners: new Set(['немного', 'слегка', 'чуть', 'чуточку', 'немножко', 'слабо']),
  clauseBreaks: new Set(['но', 'однако', 'хотя', 'зато', 'а', 'и']),
  stopwords: new Set([
    'я', 'меня', 'мне', 'мной', 'мой', 'моя', 'мои', 'ты', 'он', 'она', 'мы', 'вы', 'они', 'это', 'этот', 'эта', 'то',
    'что', 'как', 'в', 'во', 'на', 'с', 'со', 'к', 'у', 'о', 'об', 'по', 'за', 'из', 'от', 'до', 'для', 'же', 'ли',
    'бы', 'уже', 'еще', 'сегодня', 'завтра', 'вчера', 'сейчас', 'просто', 'чувствую', 'себя', 'есть', 'был', 'была',
    'было', 'быть', 'все', 'когда', 'где', 'потому', 'из-за', 'и', 'а', 'но',
  ]),
  phrases: [],
  crisis: [
    /хочу умереть/,
    /не хочу (больше )?жить/,
    /покончить с собой/,
    /убить себя/,
    /суицид/,
    /самоубийств/,
    /причинить себе (вред|боль)/,
    /(порезать|режу) себя/,
    /свести сч[её]ты с жизнью/,
  ],
  variants: (word) => {
    const forms = [word];
    for (let cut = 1; cut <= 4 && word.length - cut >= 3; cut++) forms.push(word.slice(0, -cut));
    return forms;
  },
};
