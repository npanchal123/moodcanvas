import * as Dialog from '@radix-ui/react-dialog';
import { useRef, useState } from 'react';
import { formatDateTime, useI18n } from '../i18n';
import { EMOTION_META } from '../lib/emotions';
import { downloadBlob, nodeToPng, shareOrDownload } from '../lib/export';
import { displayEmotions, effectiveIntensity, intensityBand } from '../lib/summary';
import type { EmotionEntry } from '../lib/types';
import { EmotionBloom } from './EmotionBloom';
import { btnGhost, btnPrimary, btnSecondary, checkbox, dialogContent, dialogOverlay } from './ui';

interface Props {
  entry: EmotionEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FILENAME = 'my-emotion-bloom.png';

/** Lets the user choose exactly what goes on the image before anything leaves the app. */
export function ShareDialog({ entry, open, onOpenChange }: Props) {
  const { t, locale } = useI18n();
  const cardRef = useRef<HTMLDivElement>(null);
  const [include, setInclude] = useState({ name: true, intensity: true, date: false, text: false });
  const [status, setStatus] = useState('');
  const label = entry.emotions[0].label;
  const intensity = effectiveIntensity(entry);

  const options: { key: keyof typeof include; label: string; disabled?: boolean }[] = [
    { key: 'name', label: t.share.name },
    { key: 'intensity', label: t.share.intensity },
    { key: 'date', label: t.share.date },
    { key: 'text', label: t.share.text, disabled: !entry.text },
  ];

  async function render(): Promise<Blob | null> {
    if (!cardRef.current) return null;
    try {
      return await nodeToPng(cardRef.current);
    } catch {
      setStatus(t.share.renderFailed);
      return null;
    }
  }

  async function handleSave() {
    const blob = await render();
    if (!blob) return;
    downloadBlob(blob, FILENAME);
    setStatus(t.share.saved);
  }

  async function handleShare() {
    const blob = await render();
    if (!blob) return;
    try {
      const outcome = await shareOrDownload(blob, FILENAME, t.share.shareTitle);
      setStatus(outcome === 'shared' ? t.share.shared : t.share.savedInstead);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setStatus(t.share.shareFailed);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlay} />
        <Dialog.Content className={dialogContent}>
          <Dialog.Title className="text-xl font-semibold">{t.share.title}</Dialog.Title>
          <Dialog.Description className="text-sm text-(--muted)">{t.share.description}</Dialog.Description>

          <div
            ref={cardRef}
            className="flex flex-col items-center gap-1 rounded-xl border border-(--border) bg-(--surface) p-5 text-center"
          >
            <EmotionBloom emotions={displayEmotions(entry)} valence={entry.valence} size={180} decorative />
            {include.name && (
              <p className="text-lg font-medium">
                <span aria-hidden="true">{EMOTION_META[label].icon}</span> {t.emotions[label].name}
              </p>
            )}
            {include.intensity && (
              <p className="tabular-nums">
                {intensity}/100 · {t.bands[intensityBand(intensity)]}
              </p>
            )}
            {include.date && <p className="text-sm text-(--muted)">{formatDateTime(entry.createdAt, locale)}</p>}
            {include.text && entry.text && (
              <blockquote className="mt-2 break-words italic">“{entry.text}”</blockquote>
            )}
            <p className="mt-2 text-xs text-(--muted)">Viz it</p>
          </div>

          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 font-medium">{t.share.legend}</legend>
            {options.map(({ key, label: optionLabel, disabled }) => (
              <label key={key} className={`flex min-h-11 items-center gap-3 ${disabled ? 'opacity-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={include[key]}
                  disabled={disabled}
                  onChange={(e) => setInclude((current) => ({ ...current, [key]: e.target.checked }))}
                  className={checkbox}
                />
                {optionLabel}
              </label>
            ))}
            {include.text && <p className="rounded-lg bg-(--surface-alt) p-3 text-sm">{t.share.textWarning}</p>}
          </fieldset>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void handleShare()} className={btnPrimary}>
              {t.share.share}
            </button>
            <button type="button" onClick={() => void handleSave()} className={btnSecondary}>
              {t.share.save}
            </button>
            <Dialog.Close className={btnGhost}>{t.share.close}</Dialog.Close>
          </div>
          <p role="status" className="min-h-5 text-sm text-(--muted)">
            {status}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
