import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { formatDateTime, useI18n } from '../i18n';
import { db } from '../lib/db';
import {
  clipId,
  deleteClip,
  deleteRecording,
  saveClip,
  saveRecording,
  useReadAlong,
  useRecorder,
  type RecorderState,
} from '../lib/myVoice';
import { formatClock } from '../lib/session';
import type { OwnRecording } from '../lib/types';
import { btnGhost, btnPrimary, btnSecondary, card } from './ui';

const NONE: OwnRecording[] = [];
const field = 'field w-full rounded-2xl border border-(--border) bg-(--surface-strong) p-3 transition-shadow';

/** An object URL for a recording, released when it's no longer shown. */
function useBlobUrl(blob: Blob | null | undefined): string | undefined {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url;
}

function RecorderProblem({ state }: { state: RecorderState }) {
  const { t } = useI18n();
  if (state !== 'denied' && state !== 'unsupported') return null;
  return (
    <p role="alert" className="font-medium text-(--danger)">
      {state === 'denied' ? t.voice.denied : t.voice.unsupported}
    </p>
  );
}

/**
 * Recording a whole visualization in your own voice: record, listen back, name it and keep it, or discard it.
 * Saved recordings are listed with a player each. Everything stays on the device.
 */
export function OwnRecordings() {
  const { t, locale } = useI18n();
  const v = t.voice;
  const recorder = useRecorder();
  const recordings = useLiveQuery(() => db.ownRecordings.orderBy('createdAt').reverse().toArray(), []) ?? NONE;
  const [pending, setPending] = useState<{ blob: Blob; seconds: number } | null>(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'saved' | 'failed'>('idle');
  const pendingUrl = useBlobUrl(pending?.blob);

  async function toggle() {
    if (recorder.state === 'recording') {
      const result = await recorder.stop();
      if (result) setPending(result);
    } else {
      setStatus('idle');
      setPending(null);
      await recorder.start();
    }
  }

  async function save() {
    if (!pending) return;
    try {
      await saveRecording(title || v.untitled(formatDateTime(new Date().toISOString(), locale)), pending.blob, pending.seconds);
      setPending(null);
      setTitle('');
      setStatus('saved');
    } catch {
      setStatus('failed');
    }
  }

  return (
    <section
      aria-labelledby="own-recordings-heading"
      className={`${card} fade-up flex flex-col gap-4 border-(--accent)! bg-(--accent-soft)!`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden="true" className="btn-glow flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl">
          🎙️
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="own-recordings-heading" className="text-xl font-bold">
            {v.ownTitle}
          </h2>
          <p className="text-(--muted)">{v.ownBody}</p>
          <p className="text-sm text-(--muted)">{v.privacy}</p>
        </div>
      </div>

      {!pending && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void toggle()}
            aria-pressed={recorder.state === 'recording'}
            className={`${btnPrimary} min-h-12 px-7`}
          >
            <span aria-hidden="true">{recorder.state === 'recording' ? '■' : '●'}</span>
            {recorder.state === 'recording' ? v.stop : v.start}
          </button>
          <p aria-live="polite" className="font-semibold tabular-nums text-(--accent)">
            {recorder.state === 'recording' ? v.recording(formatClock(recorder.seconds)) : ''}
          </p>
        </div>
      )}
      <RecorderProblem state={recorder.state} />

      {pending && pendingUrl && (
        <div className="flex flex-col gap-3 rounded-2xl bg-(--surface-alt) p-4">
          {/* The person's own unscripted recording: there's no transcript to caption it with. */}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={pendingUrl} className="w-full" aria-label={v.ownTitle} />
          <div className="flex flex-col gap-1">
            <label htmlFor="own-recording-title" className="text-sm font-semibold">
              {v.nameLabel}
            </label>
            <input
              id="own-recording-title"
              maxLength={120}
              value={title}
              placeholder={v.namePlaceholder}
              onChange={(e) => setTitle(e.target.value)}
              className={field}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void save()} className={btnPrimary}>
              {v.save}
            </button>
            <button type="button" onClick={() => setPending(null)} className={btnGhost}>
              {v.discard}
            </button>
          </div>
        </div>
      )}
      <p role="status" className={status === 'failed' ? 'font-medium text-(--danger)' : 'font-medium'}>
        {status === 'saved' ? `✓ ${v.saved}` : status === 'failed' ? v.saveFailed : ''}
      </p>

      {recordings.length > 0 && (
        <details className="rounded-2xl border border-(--border) px-4">
          <summary className="cursor-pointer py-3 font-semibold">
            <h3 className="inline">
              {v.myRecordings} ({recordings.length})
            </h3>
          </summary>
          <ul className="flex flex-col gap-2 pb-4">
            {recordings.map((r) => (
              <RecordingItem key={r.id} recording={r} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function RecordingItem({ recording }: { recording: OwnRecording }) {
  const { t, locale } = useI18n();
  const url = useBlobUrl(recording.blob);
  return (
    <li className="flex flex-col gap-2 rounded-2xl bg-(--surface-alt) p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold break-words">{recording.title}</p>
          <p className="text-sm text-(--muted)">
            {formatClock(recording.seconds)} · <time dateTime={recording.createdAt}>{formatDateTime(recording.createdAt, locale)}</time>
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.confirm(t.voice.deleteConfirm) && void deleteRecording(recording.id)}
          aria-label={`${t.voice.delete}: ${recording.title}`}
          className={`${btnGhost} text-sm text-(--danger)`}
        >
          {t.voice.delete}
        </button>
      </div>
      {/* The person's own unscripted recording: there's no transcript to caption it with. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      {url && <audio controls preload="metadata" src={url} className="w-full" aria-label={recording.title} />}
    </li>
  );
}

/**
 * Reading a visualization's lines aloud, one at a time, so it can play in your own voice. Each line can be
 * listened back, recorded again or removed; lines left unrecorded are read by the device voice.
 */
export function LineRecorder({ lines, onDone }: { lines: string[]; onDone: () => void }) {
  const { t } = useI18n();
  const v = t.voice;
  const recorder = useRecorder();
  const ids = lines.map(clipId);
  const recorded = useLiveQuery(async () => new Set((await db.voiceClips.bulkGet(ids)).filter(Boolean).map((c) => c!.id)), [ids.join()]) ?? new Set<string>();
  const [active, setActive] = useState<number | null>(null);
  const count = ids.filter((id) => recorded.has(id)).length;

  async function toggle(index: number) {
    if (recorder.state === 'recording') {
      const result = await recorder.stop();
      if (result && active != null) await saveClip(lines[active], result.blob);
      setActive(null);
      return;
    }
    if (await recorder.start()) setActive(index);
  }

  async function play(text: string) {
    const clip = await db.voiceClips.get(clipId(text));
    if (!clip) return;
    const url = URL.createObjectURL(clip.blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    void audio.play();
  }

  return (
    <div className="flex flex-col gap-4">
      <ReadAlong lines={lines} onFinished={onDone} />
      <h3 className="mt-2 text-lg font-bold">{v.orLineByLine}</h3>
      <p className="text-(--muted)">{v.linesBody}</p>
      <p aria-live="polite" className="font-semibold">
        {v.progress(count, lines.length)}
      </p>
      <RecorderProblem state={recorder.state} />
      <ol className="flex flex-col gap-2">
        {lines.map((line, i) => {
          const has = recorded.has(ids[i]);
          const isActive = active === i && recorder.state === 'recording';
          return (
            <li key={ids[i] + i} className={`flex flex-col gap-2 rounded-2xl border p-3 ${isActive ? 'border-(--accent) bg-(--accent-soft)' : 'border-(--border)'}`}>
              <p className="text-sm font-semibold text-(--muted)">
                {v.line(i + 1)} {has && <span className="text-(--accent)">✓</span>}
              </p>
              <p className="text-lg leading-relaxed">{line}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={recorder.state === 'recording' && !isActive}
                  onClick={() => void toggle(i)}
                  aria-pressed={isActive}
                  aria-label={`${isActive ? v.stop : has ? v.again : v.record}: ${v.line(i + 1)}`}
                  className={isActive || !has ? btnPrimary : btnSecondary}
                >
                  <span aria-hidden="true">{isActive ? '■' : '●'}</span>
                  {isActive ? v.stop : has ? v.again : v.record}
                </button>
                {isActive && <span className="font-semibold tabular-nums text-(--accent)">{formatClock(recorder.seconds)}</span>}
                {has && !isActive && (
                  <>
                    <button type="button" onClick={() => void play(line)} aria-label={`${v.play}: ${v.line(i + 1)}`} className={btnSecondary}>
                      <span aria-hidden="true">▶</span>
                      {v.play}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteClip(line)}
                      aria-label={`${v.remove}: ${v.line(i + 1)}`}
                      className={`${btnGhost} text-(--danger)`}
                    >
                      {v.remove}
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <button type="button" disabled={recorder.state === 'recording'} onClick={onDone} className={`${btnPrimary} self-start`}>
        {v.finish}
      </button>
    </div>
  );
}

/**
 * Reading a whole visualization aloud in one go, like a teleprompter: one line at a time in large text, the next
 * one waiting below. The microphone stays open; each line is kept as the reader moves on.
 */
function ReadAlong({ lines, onFinished }: { lines: string[]; onFinished: () => void }) {
  const { t } = useI18n();
  const v = t.voice;
  const r = useReadAlong(lines);
  const reading = r.state === 'recording';
  const last = r.index === lines.length - 1;

  async function next() {
    if (await r.next()) onFinished();
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl border-2 border-(--accent) bg-(--accent-soft) p-4 sm:p-5">
      {!reading ? (
        <>
          <div>
            <h3 className="text-lg font-bold">{v.readAlong}</h3>
            <p className="text-(--muted)">{v.readAlongBody}</p>
            <p className="text-sm text-(--muted)">{v.privacy}</p>
          </div>
          <button type="button" onClick={() => void r.start()} className={`${btnPrimary} min-h-14 self-start px-8 text-lg`}>
            <span aria-hidden="true">🎙️</span>
            {v.startReading}
          </button>
          <RecorderProblem state={r.state} />
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm font-semibold text-(--accent)">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-(--danger)" />
            <span aria-live="polite">{v.lineOf(r.index + 1, lines.length)}</span>
          </p>
          {r.index > 0 && <p className="text-sm text-(--muted) line-clamp-2">{lines[r.index - 1]}</p>}
          <p className="display text-2xl leading-relaxed font-bold sm:text-3xl">{lines[r.index]}</p>
          {!last && <p className="text-(--muted) line-clamp-2">{lines[r.index + 1]}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => void next()} className={`${btnPrimary} min-h-14 px-8 text-lg`}>
              {last ? v.finishReading : v.nextLine}
              {!last && <span aria-hidden="true" className="rtl:-scale-x-100">→</span>}
            </button>
            <button type="button" onClick={() => void r.stop()} className={btnGhost}>
              {v.stopReading}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
