import { ANALYZER_VERSION, analyze, type AnalyzerLanguage } from './analyzer';
import type { AnalysisChanges } from './entries';
import type { EmotionEntry } from './types';

/**
 * Entries read by an older version of the word list, which re-reading can improve.
 * Left alone:
 * - AI-read entries: re-reading them would need the network and the user's consent again.
 * - Entries without text, since there's nothing to re-read.
 * - Entries with confidence 1: almost always a feeling the user picked from the list. Those picks
 *   aren't stored separately, so re-reading the text alone could drop them.
 */
export function needsRescore(entry: EmotionEntry): boolean {
  return (
    entry.analyzerVersion.startsWith('lexicon-') &&
    entry.analyzerVersion !== ANALYZER_VERSION &&
    entry.text.trim().length > 0 &&
    entry.confidence < 1
  );
}

/**
 * New readings for the entries that need one. The user's own rating and tags are
 * untouched (they live in other fields). If the new reading finds nothing, the old
 * one is kept rather than replaced with an empty result.
 */
export function rescore(
  entries: EmotionEntry[],
  language: AnalyzerLanguage,
): { id: string; changes: AnalysisChanges }[] {
  return entries.filter(needsRescore).flatMap((entry) => {
    const result = analyze(entry.text, { language });
    if (result.emotions.length === 0) return [];
    return [
      {
        id: entry.id,
        changes: {
          emotions: result.emotions,
          valence: result.valence,
          confidence: result.confidence,
          analyzerVersion: result.analyzerVersion,
        },
      },
    ];
  });
}
