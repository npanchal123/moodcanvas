import type { LanguagePack, Weights } from './types';

/** Simplified Chinese starter lexicon. Machine-drafted: have a native speaker review it. */
const LEXICON: Record<string, Weights> = {
  // 喜悦
  开心: { joy: 1 },
  高兴: { joy: 1 },
  快乐: { joy: 1 },
  幸福: { joy: 1 },
  喜悦: { joy: 1 },
  愉快: { joy: 0.9 },
  兴奋: { joy: 0.9 },
  激动: { joy: 0.8, surprise: 0.2 },
  满足: { joy: 0.8, calm: 0.2 },
  感恩: { joy: 0.8, calm: 0.2 },
  感激: { joy: 0.8 },
  骄傲: { joy: 0.9 },
  自豪: { joy: 0.9 },
  太好了: { joy: 0.9 },
  棒: { joy: 0.7 },
  爱: { joy: 0.6 },
  乐观: { joy: 0.7 },
  期待: { joy: 0.7 },
  欣慰: { joy: 0.8, calm: 0.2 },
  美好: { joy: 0.7 },
  哈哈: { joy: 0.7 },

  // 平静
  平静: { calm: 1 },
  放松: { calm: 0.9 },
  安心: { calm: 0.9 },
  轻松: { calm: 0.9 },
  宁静: { calm: 1 },
  淡定: { calm: 0.9 },
  舒服: { calm: 0.7 },
  踏实: { calm: 0.8 },
  安稳: { calm: 0.8 },
  释然: { calm: 0.8 },
  自在: { calm: 0.8 },

  // 悲伤
  难过: { sadness: 1 },
  伤心: { sadness: 1 },
  悲伤: { sadness: 1 },
  失落: { sadness: 0.9 },
  沮丧: { sadness: 0.9 },
  抑郁: { sadness: 1 },
  孤独: { sadness: 0.8 },
  孤单: { sadness: 0.8 },
  哭: { sadness: 0.9 },
  眼泪: { sadness: 0.8 },
  委屈: { sadness: 0.8 },
  失望: { sadness: 0.8 },
  心累: { sadness: 0.7 },
  累: { sadness: 0.4 },
  空虚: { sadness: 0.8 },
  绝望: { sadness: 1 },
  低落: { sadness: 0.9 },
  郁闷: { sadness: 0.8 },
  心痛: { sadness: 0.9 },
  难受: { sadness: 0.7 },

  // 愤怒
  生气: { anger: 1 },
  愤怒: { anger: 1 },
  气愤: { anger: 1 },
  气死: { anger: 0.9 },
  恼火: { anger: 0.8 },
  烦: { anger: 0.6 },
  烦躁: { anger: 0.7 },
  火大: { anger: 0.9 },
  讨厌: { anger: 0.7, disgust: 0.3 },
  恨: { anger: 0.9 },
  不爽: { anger: 0.8 },
  抓狂: { anger: 0.9 },
  暴躁: { anger: 0.8 },
  受够: { anger: 0.8 },

  // 恐惧 / 焦虑
  焦虑: { fear: 1 },
  紧张: { fear: 0.8 },
  害怕: { fear: 1 },
  担心: { fear: 0.8 },
  恐惧: { fear: 1 },
  不安: { fear: 0.8 },
  慌: { fear: 0.8 },
  心慌: { fear: 0.9 },
  恐慌: { fear: 1 },
  压力: { fear: 0.6 },
  崩溃: { fear: 0.8, sadness: 0.3 },
  忐忑: { fear: 0.8 },
  怕: { fear: 0.8 },
  着急: { fear: 0.6 },

  // 惊讶
  惊讶: { surprise: 1 },
  震惊: { surprise: 0.9 },
  意外: { surprise: 0.7 },
  吃惊: { surprise: 0.9 },
  没想到: { surprise: 0.7 },
  哇: { surprise: 0.7 },
  天哪: { surprise: 0.7 },

  // 厌恶
  恶心: { disgust: 1 },
  厌恶: { disgust: 1 },
  反感: { disgust: 0.8 },
  嫌弃: { disgust: 0.8 },
  羞耻: { disgust: 0.6, sadness: 0.3 },
  丢脸: { disgust: 0.6, sadness: 0.3 },
  尴尬: { disgust: 0.4, sadness: 0.2 },
};

const NEGATORS = ['不', '没', '没有', '别', '并不', '不是', '毫不'];
const BOOSTERS = ['很', '非常', '特别', '太', '超', '超级', '好', '真', '十分', '极其', '越来越'];
const DAMPENERS = ['有点', '有些', '一点', '稍微', '略'];
const CLAUSE_BREAKS = ['但是', '但', '可是', '不过', '然而'];
// Also in the dictionary, so words that contain a feeling character don't read as that feeling:
// "麻烦" (trouble) isn't "烦", and "恐怕" (probably) isn't "怕".
const STOPWORDS = [
  '我', '你', '他', '她', '的', '了', '是', '在', '和', '也', '就', '都', '吗', '呢', '吧', '啊', '着', '这', '那', '有',
  '今天', '明天', '昨天', '现在', '感觉', '觉得', '一', '个', '得', '地', '让', '被', '把', '对', '跟', '麻烦', '恐怕',
  '积累', '可爱',
];

const DICTIONARY = new Set([
  ...Object.keys(LEXICON), ...NEGATORS, ...BOOSTERS, ...DAMPENERS, ...CLAUSE_BREAKS, ...STOPWORDS,
]);
const LONGEST = Math.max(...[...DICTIONARY].map((w) => w.length));

/**
 * Chinese is written without spaces, so take the longest dictionary word at each point and let every other
 * character stand alone. "我不开心" → 我 / 不 / 开心, so the negator is seen.
 */
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  for (const run of text.match(/\p{Script=Han}+|[\p{L}\p{M}']+/gu) ?? []) {
    if (!/\p{Script=Han}/u.test(run)) {
      tokens.push(run);
      continue;
    }
    for (let i = 0; i < run.length; ) {
      let length = Math.min(LONGEST, run.length - i);
      while (length > 1 && !DICTIONARY.has(run.slice(i, i + length))) length--;
      tokens.push(run.slice(i, i + length));
      i += length;
    }
  }
  return tokens;
}

export const chinese: LanguagePack = {
  lexicon: LEXICON,
  tokenize,
  negators: new Set(NEGATORS),
  boosters: new Set(BOOSTERS),
  dampeners: new Set(DAMPENERS),
  clauseBreaks: new Set(CLAUSE_BREAKS),
  stopwords: new Set(STOPWORDS),
  phrases: [],
  crisis: [
    /想死/,
    /自[杀殺]/,
    /不想活/,
    /活不下去/,
    /[结結]束(自己的|我的)?生命/,
    /[伤傷]害自己/,
    /自[残殘]/,
    /轻生|輕生/,
  ],
};
