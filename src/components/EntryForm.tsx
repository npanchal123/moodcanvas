import { useRef, useState, type FormEvent } from 'react';
import { useI18n } from '../i18n';
import type { AnalysisResult } from '../lib/analyzer';
import { EMOTIONS, EMOTION_META, type EmotionLabel } from '../lib/emotions';
import { btnPrimary, card, toggle } from './ui';

const MAX_LENGTH = 500;
export const FEELING_INPUT_ID = 'feeling-input';

export interface SubmitOutcome {
  result: AnalysisResult;
  /** Shown to the user, e.g. when smarter analysis fell back to the word list. */
  notice?: string;
}

interface Props {
  onSubmit: (text: string, chips: EmotionLabel[]) => Promise<SubmitOutcome>;
  /** Changes the privacy hint: with AI on, the text does leave the device. */
  aiEnabled: boolean;
}

export function EntryForm({ onSubmit, aiEnabled }: Props) {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [chips, setChips] = useState<EmotionLabel[]>([]);
  const [busy, setBusy] = useState(false);
  const [needsChip, setNeedsChip] = useState(false);
  const [notice, setNotice] = useState('');
  const chipsRef = useRef<HTMLFieldSetElement>(null);

  const canSubmit = (text.trim().length > 0 || chips.length > 0) && !busy;

  function toggleChip(label: EmotionLabel) {
    setChips((current) => (current.includes(label) ? current.filter((c) => c !== label) : [...current, label]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    try {
      const { result, notice: message } = await onSubmit(text.trim(), chips);
      setNotice(message ?? '');
      if (result.lowConfidence) {
        setNeedsChip(true);
        chipsRef.current?.querySelector('button')?.focus();
      } else {
        setText('');
        setChips([]);
        setNeedsChip(false);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${card} flex flex-col gap-5`}>
      <div className="flex flex-col gap-2">
        <label htmlFor={FEELING_INPUT_ID} className="text-xl font-semibold">
          {t.entry.label}
        </label>
        <p id="feeling-hint" className="text-sm text-(--muted)">
          {aiEnabled ? t.entry.hintAi : t.entry.hintLocal}
        </p>
        <textarea
          id={FEELING_INPUT_ID}
          aria-describedby="feeling-hint feeling-count"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LENGTH}
          rows={5}
          placeholder={t.entry.placeholder}
          className="w-full resize-y rounded-xl border border-(--border) bg-(--surface) p-3 text-base placeholder:text-(--muted)"
        />
        <p id="feeling-count" className="self-end text-xs text-(--muted) tabular-nums">
          {t.entry.count(text.length, MAX_LENGTH)}
        </p>
      </div>

      <fieldset ref={chipsRef} aria-describedby={needsChip ? 'chip-help' : undefined}>
        <legend className="mb-2 font-medium">{t.entry.chipsLegend}</legend>
        {needsChip && (
          <p id="chip-help" role="status" className="mb-2 rounded-lg bg-(--surface-alt) p-3 text-sm">
            {t.entry.needsChip}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map((label) => {
            const pressed = chips.includes(label);
            return (
              <button
                key={label}
                type="button"
                aria-pressed={pressed}
                onClick={() => toggleChip(label)}
                className={`${toggle(pressed)} text-sm`}
              >
                <span aria-hidden="true">{pressed ? '✓' : EMOTION_META[label].icon}</span>
                {t.emotions[label].name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button type="submit" disabled={!canSubmit} className={`${btnPrimary} self-start`}>
        {busy ? t.entry.submitting : t.entry.submit}
      </button>
      {notice && (
        <p role="status" className="text-sm text-(--muted)">
          {notice}
        </p>
      )}
    </form>
  );
}
