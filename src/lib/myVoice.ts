import { useEffect, useRef, useState } from 'react';
import { db } from './db';
import { textHash } from './session';
import type { OwnRecording } from './types';

/**
 * The person's own voice: lines of a visualization read aloud, and whole visualizations they record themselves.
 * Recorded with the browser's microphone and kept in this device's IndexedDB. Nothing is uploaded.
 */

/** A line's clip is found by its words, so the same line in another visualization reuses it. */
export const clipId = (text: string) => textHash(text.trim());

export async function saveClip(text: string, blob: Blob): Promise<void> {
  await db.voiceClips.put({ id: clipId(text), text, blob, createdAt: new Date().toISOString() });
}

export async function deleteClip(text: string): Promise<void> {
  await db.voiceClips.delete(clipId(text));
}

/** The person's clip for each line, where there is one. */
export async function clipsFor(texts: string[]): Promise<(Blob | undefined)[]> {
  const clips = await db.voiceClips.bulkGet(texts.map(clipId));
  return clips.map((c) => c?.blob);
}

export async function saveRecording(title: string, blob: Blob, seconds: number): Promise<OwnRecording> {
  const recording: OwnRecording = {
    id: crypto.randomUUID(),
    title: title.trim().slice(0, 120),
    blob,
    seconds: Math.round(seconds),
    createdAt: new Date().toISOString(),
  };
  await db.ownRecordings.add(recording);
  return recording;
}

export async function deleteRecording(id: string): Promise<void> {
  await db.ownRecordings.delete(id);
}

export type RecorderState = 'idle' | 'recording' | 'denied' | 'unsupported';

export function canRecord(): boolean {
  return typeof window !== 'undefined' && 'MediaRecorder' in window && Boolean(navigator.mediaDevices?.getUserMedia);
}

/**
 * Records from the microphone. `start` must run from a tap (browsers ask for permission then); `stop` resolves with
 * the recording and its length. The microphone is released as soon as recording stops.
 */
export function useRecorder() {
  const [state, setState] = useState<RecorderState>(() => (canRecord() ? 'idle' : 'unsupported'));
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const done = useRef<((result: { blob: Blob; seconds: number } | null) => void) | null>(null);

  useEffect(() => {
    if (state !== 'recording') return;
    const timer = setInterval(() => setSeconds((Date.now() - startedAt.current) / 1000), 250);
    return () => clearInterval(timer);
  }, [state]);

  // Leaving the screen mid-recording stops it and frees the microphone.
  useEffect(
    () => () => {
      if (recorder.current?.state === 'recording') recorder.current.stop();
    },
    [],
  );

  async function start(): Promise<boolean> {
    if (!canRecord()) {
      setState('unsupported');
      return false;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setState('denied');
      return false;
    }
    const r = new MediaRecorder(stream);
    chunks.current = [];
    r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    r.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks.current, { type: r.mimeType || 'audio/webm' });
      const length = (Date.now() - startedAt.current) / 1000;
      setState('idle');
      done.current?.(blob.size ? { blob, seconds: length } : null);
      done.current = null;
    };
    recorder.current = r;
    startedAt.current = Date.now();
    setSeconds(0);
    r.start(250);
    setState('recording');
    return true;
  }

  function stop(): Promise<{ blob: Blob; seconds: number } | null> {
    return new Promise((resolve) => {
      if (recorder.current?.state !== 'recording') return resolve(null);
      done.current = resolve;
      recorder.current.stop();
    });
  }

  return { state, seconds, start, stop };
}
