import { EMOTIONS, type EmotionLabel } from './emotions';
import { EMOJI_LEXICON } from './lexicons/emoji';
import { english } from './lexicons/en';
import { spanish } from './lexicons/es';
import { hindi } from './lexicons/hi';
import type { LanguagePack, Weights } from './lexicons/types';
import type { EmotionScore } from './types';

export const ANALYZER_VERSION = 'lexicon-1.2';

export const LANGUAGE_PACKS = { en: english, hi: hindi, es: spanish } satisfies Record<string, LanguagePack>;
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

/**
 * Lowercase and strip accents, so "Pánico" and "panico" match the same entry. Only marks on Latin letters are
 * accents: in scripts like Devanagari, combining marks are vowel signs ("खुश") and must stay.
 */
function fold(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/(\p{Script=Latin})\p{M}+/gu, '$1').normalize('NFC');
}

/** A pack with every word folded and normalized exactly as text will be, so lookups always line up. */
interface PreparedPack {
  pack: LanguagePack;
  norm: (text: string) => string;
  lexicon: Record<string, Weights>;
  negators: Set<string>;
  negatorsAfter: Set<string>;
  boosters: Set<string>;
  dampeners: Set<string>;
  clauseBreaks: Set<string>;
  stopwords: Set<string>;
}

const prepared = new Map<LanguagePack, PreparedPack>();
function prepare(pack: LanguagePack): PreparedPack {
  let p = prepared.get(pack);
  if (!p) {
    const norm = (text: string) => (pack.normalize ? pack.normalize(fold(text)) : fold(text));
    const words = (s: Iterable<string>) => new Set([...s].map(norm));
    p = {
      pack,
      norm,
      lexicon: Object.fromEntries(Object.entries(pack.lexicon).map(([k, v]) => [norm(k), v])),
      negators: words(pack.negators),
      negatorsAfter: words(pack.negatorsAfter ?? []),
      boosters: words(pack.boosters),
      dampeners: words(pack.dampeners),
      clauseBreaks: words(pack.clauseBreaks),
      stopwords: words(pack.stopwords),
    };
    prepared.set(pack, p);
  }
  return p;
}

/** Checked against every language, whatever the UI language is. */
export function detectCrisis(text: string): boolean {
  return Object.values(LANGUAGE_PACKS).some((pack) => {
    const normalized = prepare(pack).norm(text);
    return pack.crisis.some((p) => p.test(normalized));
  });
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

function readWith(languagePack: LanguagePack, text: string): PackReading {
  const pack = prepare(languagePack);
  const raw = Object.fromEntries(EMOTIONS.map((e) => [e, 0])) as Record<EmotionLabel, number>;
  const matched: string[] = [];

  let clean = text.replace(/[’‘]/g, "'").replace(/https?:\/\/\S+/g, ' ');
  for (const [pattern, replacement] of languagePack.phrases) clean = clean.replace(pattern, replacement);
  // Letters plus combining marks, so Devanagari words keep their vowel signs.
  // Zero-width (non-)joiners can sit inside Devanagari words; normalize() removes them afterwards.
  const tokens = (clean.match(/(?:[\p{L}\p{M}']|‌|‍)+/gu) ?? [])
    .map((t) => t.replace(/^'+|'+$/g, ''))
    .filter(Boolean);
  const words = tokens.map(pack.norm);

  const suffix = languagePack.negatorSuffix;
  const isNegator = (w: string) => pack.negators.has(w) || (suffix != null && w.endsWith(suffix));
  const isModifier = (w: string) => pack.boosters.has(w) || pack.dampeners.has(w) || isNegator(w);
  const lookup = (w: string) => {
    for (const candidate of languagePack.variants ? languagePack.variants(w) : [w]) {
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
    // Hindi: "खुश नहीं हूं" / "khush nahi hoon".
    for (let j = i + 1; !negated && j <= Math.min(words.length - 1, i + 2); j++) {
      if (pack.clauseBreaks.has(words[j])) break;
      if (pack.negatorsAfter.has(words[j])) negated = true;
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
