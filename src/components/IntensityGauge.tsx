import { useId } from 'react';
import { useI18n } from '../i18n';
import { intensityBand } from '../lib/summary';

interface Props {
  value: number;
  color: string;
}

export function IntensityGauge({ value, color }: Props) {
  const { t } = useI18n();
  const id = useId();
  const band = t.bands[intensityBand(value)];
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span id={`${id}-label`} className="font-medium">
          {t.gauge.label}
        </span>
        <span className="tabular-nums">
          <strong className="text-2xl">{value}</strong>
          <span className="text-(--muted)">/100 · {band}</span>
        </span>
      </div>
      <div
        role="meter"
        aria-labelledby={`${id}-label`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={t.gauge.valueText(value, band)}
        className="h-4 overflow-hidden rounded-full border border-(--border) bg-(--track)"
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <div aria-hidden="true" className="mt-1 flex justify-between text-xs text-(--muted)">
        <span>{t.bands.mild}</span>
        <span>{t.bands.moderate}</span>
        <span>{t.bands.strong}</span>
      </div>
    </div>
  );
}
