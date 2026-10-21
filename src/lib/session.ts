import type { Minutes, PracticeScript, Segment } from '../practices';

/** The steps of a practice that belong in the chosen length. */
export function segmentsFor(script: PracticeScript, minutes: Minutes): Segment[] {
  return script.segments.filter((s) => s.tier <= minutes);
}

/** Calm guided speech runs at roughly 2 words a second. Used when real audio lengths aren't known. */
export function estimateSpeechSeconds(text: string, rate = 1): number {
  const words = text.trim().split(/\s+/).length;
  return words / (2.1 * rate) + 0.6;
}

export const MIN_PAUSE_SECONDS = 2;

/**
 * Silence after each step, so speech plus silence fills `minutes`. Each step's share of the free time follows
 * its `pause` weight. If speech alone runs long, every silence falls back to the minimum.
 */
export function planPauses(segments: Segment[], speechSeconds: number[], minutes: number): number[] {
  const speech = speechSeconds.reduce((a, b) => a + b, 0);
  const free = minutes * 60 - speech;
  const weights = segments.reduce((a, s) => a + s.pause, 0);
  return segments.map((s) => Math.max(MIN_PAUSE_SECONDS, (free * s.pause) / weights));
}

/**
 * Short fingerprint of a step's text (FNV-1a), used in audio file names so a recording is only used for the
 * exact words it was made from. The audio script (scripts/generate-audio.ts) uses the same function.
 */
export function textHash(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function audioKey(locale: string, practiceId: string, segmentId: string): string {
  return `${locale}/${practiceId}/${segmentId}`;
}

export function audioFile(locale: string, practiceId: string, segment: Segment): string {
  return `${audioKey(locale, practiceId, segment.id)}-${textHash(segment.text)}.mp3`;
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
