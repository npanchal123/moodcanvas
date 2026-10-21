import type { EmotionLabel } from '../emotions';

export type Weights = Partial<Record<EmotionLabel, number>>;

/**
 * Everything the word-list analyzer needs for one language. All words are
 * lowercase with accents removed ("pánico" → "panico"), matching how text is
 * folded before lookup.
 */
export interface LanguagePack {
  lexicon: Record<string, Weights>;
  negators: Set<string>;
  /** Contractions such as "don't" count as negators when they end with this. */
  negatorSuffix?: string;
  /** Negators that come after the word they negate, as in Hindi "खुश नहीं" ("not happy"). */
  negatorsAfter?: Set<string>;
  boosters: Set<string>;
  dampeners: Set<string>;
  /** Words that end a clause, so "not happy but excited" doesn't negate "excited". */
  clauseBreaks: Set<string>;
  stopwords: Set<string>;
  /** Multi-word modifiers rewritten to one token before splitting, e.g. "kind of" → "kinda". */
  phrases: [RegExp, string][];
  /** Phrases that suggest someone may be at risk. Checked for every language, always. */
  crisis: RegExp[];
  /** Other spellings to try when a word isn't in the lexicon (plurals, gender). */
  variants?: (word: string) => string[];
  /** Extra clean-up after folding, applied to the text and to every word in this pack (e.g. dropping nukta). */
  normalize?: (text: string) => string;
}
