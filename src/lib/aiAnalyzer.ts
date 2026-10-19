import { normalizeAiResult } from './aiResult';
import { detectCrisis, type AnalysisResult } from './analyzer';
import type { EmotionLabel } from './emotions';

export const AI_ANALYZER_VERSION = 'ai-claude-opus-5-5-1';

/**
 * Sends only the text the user typed to the Viz it server, which asks Claude.
 * Throws if the server can't help, so the caller can fall back to the word list.
 */
export async function analyzeWithAI(text: string, chips: EmotionLabel[]): Promise<AnalysisResult> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`AI analysis unavailable (${res.status})`);
  const ai = normalizeAiResult(await res.json());

  // Feelings the user picked themselves are always kept.
  const emotions = [...ai.emotions];
  for (const chip of chips) {
    if (!emotions.some((e) => e.label === chip)) emotions.push({ label: chip, intensity: 50 });
  }
  emotions.sort((a, b) => b.intensity - a.intensity);

  return {
    emotions: emotions.slice(0, 3),
    valence: ai.valence,
    confidence: chips.length ? 1 : ai.confidence,
    matchedTerms: [],
    lowConfidence: emotions.length === 0 || (chips.length === 0 && ai.confidence < 0.3),
    crisis: ai.concern || detectCrisis(text),
    analyzerVersion: AI_ANALYZER_VERSION,
  };
}
