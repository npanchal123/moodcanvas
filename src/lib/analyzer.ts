import { EMOTIONS, type EmotionLabel } from './emotions';
import { EMOJI_LEXICON } from './lexicons/emoji';
import { english } from './lexicons/en';
import { spanish } from './lexicons/es';
import type { LanguagePack } from './lexicons/types';
import type { EmotionScore } from './types';

export const ANALYZER_VERSION = 'lexicon-1.1';

export const LANGUAGE_PACKS = { en: english, es: spanish } satisfies Record<string, LanguagePack>;
export type AnalyzerLanguage = keyof typeof LANGUAGE_PACKS;

const POSITIVE: EmotionLabel[] = ['joy', 'calm'];
const NEGATIVE: EmotionLabel[] = ['sadness', 'anger', 'fear', 'disgust'];

export interface AnalysisOptions {
  /** Emotions the user picked explicitly from the quick chips. */
  chips?: EmotionLabel[];
  /** The UI language; breaks ties when the text reads equally well in two languages. */
  language?: AnalyzerLanguage;
}

export interface AnalysisResult {
  emotions: EmotionScore[];
  valence: number;
  confidence: number;
  matchedTerms: string[];
  /** True when the app should ask the user to pick a chip instead of guessing. */
  lowConfidence: boolean;
  crisis: boolean;
  analyzerVersion: string;
}

/** Lowercase and strip accents, so "Pánico" and "panico" match the same entry. */
function fold(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

/** Checked against every language, whatever the UI language is. */
export function detectCrisis(text: string): boolean {
  const folded = fold(text);
  return Object.values(LANGUAGE_PACKS).some((pack) => pack.crisis.some((p) => p.test(folded)));
}

function isShouted(token: string): boolean {
  return token.length >= 3 && /\p{Lu}/u.test(token) && token === token.toUpperCase();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface PackReading {
  raw: Record<EmotionLabel, number>;
  matched: string[];
  contentWords: number;
}

function readWith(pack: LanguagePack, text: string): PackReading {
  const raw = Object.fromEntries(EMOTIONS.map((e) => [e, 0])) as Record<EmotionLabel, number>;
  const matched: string[] = [];

  let clean = text.replace(/[’‘]/g, "'").replace(/https?:\/\/\S+/g, ' ');
  for (const [pattern, replacement] of pack.phrases) clean = clean.replace(pattern, replacement);
  const tokens = (clean.match(/[\p{L}']+/gu) ?? []).map((t) => t.replace(/^'+|'+$/g, '')).filter(Boolean);
  const words = tokens.map(fold);

  const isNegator = (w: string) => pack.negators.has(w) || (pack.negatorSuffix != null && w.endsWith(pack.negatorSuffix));
  const isModifier = (w: string) => pack.boosters.has(w) || pack.dampeners.has(w) || isNegator(w);
  const lookup = (w: string) => {
    for (const candidate of pack.variants ? pack.variants(w) : [w]) {
      if (pack.lexicon[candidate]) return pack.lexicon[candidate];
    }
    return undefined;
  };

  let contentWords = 0;
  words.forEach((word, i) => {
    if (isModifier(word)) return;
    if (!pack.stopwords.has(word)) contentWords++;
    const weights = lookup(word);
    if (!weights) return;
    matched.push(word);

    let mult = 1;
    for (let j = Math.max(0, i - 2); j < i; j++) {
      if (pack.boosters.has(words[j])) mult *= 1.4;
      if (pack.dampeners.has(words[j])) mult *= 0.6;
    }
    if (isShouted(tokens[i])) mult *= 1.2;

    let negated = false;
    for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
      if (pack.clauseBreaks.has(words[j])) break;
      if (isNegator(words[j])) {
        negated = true;
        break;
      }
    }

    for (const [label, weight] of Object.entries(weights) as [EmotionLabel, number][]) {
      const value = weight * mult;
      if (!negated) raw[label] += value;
      // "not happy" reads as mild sadness; "not angry" as a little calm.
      else if (POSITIVE.includes(label)) raw.sadness += value * 0.6;
      else if (NEGATIVE.includes(label)) raw.calm += value * 0.3;
    }
  });

  return { raw, matched, contentWords };
}

export function analyze(text: string, options: AnalysisOptions = {}): AnalysisResult {
  const chips = options.chips ?? [];
  const preferred = options.language ?? 'en';

  // Read the text with every language and keep whichever understood the most words.
  const order = [preferred, ...(Object.keys(LANGUAGE_PACKS) as AnalyzerLanguage[]).filter((l) => l !== preferred)];
  const reading = order
    .map((language) => readWith(LANGUAGE_PACKS[language], text))
    .reduce((best, next) => (next.matched.length > best.matched.length ? next : best));
  const { raw, matched } = reading;

  const emojis = [...text.matchAll(/\p{Extended_Pictographic}/gu)].map((m) => m[0]);
  for (const emoji of emojis) {
    const label = EMOJI_LEXICON[emoji];
    if (!label) continue;
    raw[label] += 0.8;
    matched.push(emoji);
  }

  for (const chip of chips) raw[chip] += 1;

  const exclaim = Math.min(1.2, 1 + 0.07 * (text.match(/!/g)?.length ?? 0));
  const scored = EMOTIONS.map((label) => ({
    label,
    intensity: Math.round(100 * (1 - Math.exp(-raw[label] * exclaim))),
  }))
    .filter((s) => s.intensity > 0)
    .sort((a, b) => b.intensity - a.intensity);
  const emotions = scored.filter((s, i) => i === 0 || s.intensity >= 30).slice(0, 3);

  const pos = raw.joy + raw.calm;
  const neg = raw.sadness + raw.anger + raw.fear + raw.disgust;
  const valence = pos + neg === 0 ? 0 : round2((pos - neg) / (pos + neg));

  const confidence = chips.length
    ? 1
    : matched.length === 0
      ? 0
      : round2(Math.min(1, matched.length / Math.max(1, reading.contentWords + emojis.length)));

  return {
    emotions,
    valence,
    confidence,
    matchedTerms: matched,
    lowConfidence: emotions.length === 0 || confidence < 0.15,
    crisis: detectCrisis(text),
    analyzerVersion: ANALYZER_VERSION,
  };
}
