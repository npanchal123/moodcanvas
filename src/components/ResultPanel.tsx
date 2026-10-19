import * as Slider from '@radix-ui/react-slider';
import { useEffect, useRef, useState } from 'react';
import { formatDateTime, useI18n } from '../i18n';
import { AI_ANALYZER_VERSION } from '../lib/aiAnalyzer';
import { EMOTION_META, emotionColor } from '../lib/emotions';
import { updateEntry } from '../lib/entries';
import { describeEntry, displayEmotions, effectiveIntensity } from '../lib/summary';
import { useColorScheme } from '../lib/theme';
import type { EmotionEntry } from '../lib/types';
import { EmotionBloom } from './EmotionBloom';
import { IntensityGauge } from './IntensityGauge';
import { ShareDialog } from './ShareDialog';
import { TagEditor } from './TagEditor';
import { btnGhost, btnSecondary, card } from './ui';

interface Props {
  entry: EmotionEntry;
  animate: boolean;
  onNew: () => void;
}

export function ResultPanel({ entry, animate, onNew }: Props) {
  const { t, locale } = useI18n();
  const scheme = useColorScheme();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState('');
  const [sharing, setSharing] = useState(false);
  const intensity = effectiveIntensity(entry);
  const [rating, setRating] = useState(entry.userRating ?? Math.min(10, Math.max(1, Math.round(intensity / 10))));

  const emotions = displayEmotions(entry);
  const [primary, ...others] = emotions;

  // Move focus to the result so keyboard and screen-reader users land on it.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function commitRating(value: number) {
    await updateEntry(entry.id, { userRating: value, userAdjusted: true });
    setStatus(t.result.adjusted(value * 10));
  }

  return (
    <section aria-labelledby="result-heading" className={`${card} flex flex-col gap-5`}>
      <h2 id="result-heading" ref={headingRef} tabIndex={-1} className="text-xl font-semibold">
        {describeEntry(entry, t)}
      </h2>

      <div className="flex flex-col items-center rounded-xl p-4">
        <EmotionBloom emotions={emotions} valence={entry.valence} animate={animate} />
        <p className="mt-2 text-lg font-medium">
          <span aria-hidden="true">{EMOTION_META[primary.label].icon}</span> {t.emotions[primary.label].name}
        </p>
        <p className="text-sm text-(--muted)">
          {formatDateTime(entry.createdAt, locale)}
          {entry.analyzerVersion === AI_ANALYZER_VERSION && ` · ${t.result.byAi}`}
        </p>
      </div>

      <IntensityGauge value={intensity} color={emotionColor(primary.label, scheme)} />

      {others.length > 0 && (
        <p className="text-sm">
          <span className="font-medium">{t.result.alsoPresent}</span>
          {others.map((e) => `${t.emotions[e.label].name} (${e.intensity})`).join(', ')}
        </p>
      )}

      <div className="rounded-xl bg-(--surface-alt) p-4">
        <p id="adjust-label" className="font-medium">
          {t.result.adjustTitle}
        </p>
        <p className="mb-3 text-sm text-(--muted)">{t.result.adjustHint}</p>
        <div className="flex items-center gap-4">
          <Slider.Root
            className="relative flex h-11 w-full touch-none select-none items-center"
            min={1}
            max={10}
            step={1}
            value={[rating]}
            onValueChange={(v) => setRating(v[0])}
            onValueCommit={(v) => void commitRating(v[0])}
            aria-labelledby="adjust-label"
          >
            <Slider.Track className="relative h-2 grow rounded-full border border-(--border) bg-(--track)">
              <Slider.Range className="absolute h-full rounded-full bg-(--accent)" />
            </Slider.Track>
            <Slider.Thumb
              aria-labelledby="adjust-label"
              className="block h-7 w-7 rounded-full border-2 border-(--accent) bg-(--surface) shadow"
            />
          </Slider.Root>
          <span className="w-12 text-right text-lg font-semibold tabular-nums">{rating}/10</span>
        </div>
      </div>

      <TagEditor tags={entry.tags} onChange={(tags) => void updateEntry(entry.id, { tags })} />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setSharing(true)} className={btnSecondary}>
          {t.result.share}
        </button>
        <button type="button" onClick={onNew} className={btnGhost}>
          {t.result.newCheckIn}
        </button>
      </div>
      <p role="status" className="min-h-5 text-sm text-(--muted)">
        {status}
      </p>
      <ShareDialog entry={entry} open={sharing} onOpenChange={setSharing} />
    </section>
  );
}
