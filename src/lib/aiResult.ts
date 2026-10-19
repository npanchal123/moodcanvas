// Shared by the browser and the Node server (server/index.ts), so imports carry
// explicit .ts extensions for Node's type stripping.
import { EMOTIONS, type EmotionLabel } from './emotions.ts';
import type { EmotionScore } from './types.ts';

export interface AiResult {
  emotions: EmotionScore[];
  valence: number;
  confidence: number;
  /** The model's read on whether the writer may be at risk. */
  concern: boolean;
}

/** JSON schema for Claude's structured output. Ranges are enforced in normalizeAiResult. */
export const AI_RESULT_SCHEMA = {
  type: 'object',
  properties: {
    emotions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string', enum: [...EMOTIONS] },
          intensity: { type: 'integer' },
        },
        required: ['label', 'intensity'],
        additionalProperties: false,
      },
    },
    valence: { type: 'number' },
    confidence: { type: 'number' },
    concern: { type: 'boolean' },
  },
  required: ['emotions', 'valence', 'confidence', 'concern'],
  additionalProperties: false,
} as const;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function finite(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Turns untrusted model or network output into a safe result: known labels only,
 * one score per label, 0–100 intensities, strongest first, and the same
 * "primary + up to two more at 30 or above" rule the word-list analyzer uses.
 */
export function normalizeAiResult(raw: unknown): AiResult {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const best = new Map<EmotionLabel, number>();
  for (const item of Array.isArray(obj.emotions) ? obj.emotions : []) {
    if (!item || typeof item !== 'object') continue;
    const { label, intensity } = item as Record<string, unknown>;
    if (typeof label !== 'string' || !(EMOTIONS as readonly string[]).includes(label)) continue;
    const value = clamp(Math.round(finite(intensity)), 0, 100);
    if (value > 0) best.set(label as EmotionLabel, Math.max(best.get(label as EmotionLabel) ?? 0, value));
  }
  const emotions = [...best]
    .map(([label, intensity]) => ({ label, intensity }))
    .sort((a, b) => b.intensity - a.intensity)
    .filter((e, i) => i === 0 || e.intensity >= 30)
    .slice(0, 3);

  return {
    emotions,
    valence: round2(clamp(finite(obj.valence), -1, 1)),
    confidence: round2(clamp(finite(obj.confidence), 0, 1)),
    concern: obj.concern === true,
  };
}
