import { lazy, Suspense } from 'react';
import { useI18n } from '../i18n';
import { frequencySummary, type FrequencyRow } from '../lib/stats';

const FrequencyBars = lazy(() => import('./FrequencyBars'));

interface Props {
  rows: FrequencyRow[];
  days: number;
  animate: boolean;
}

export function FrequencyChart({ rows, days, animate }: Props) {
  const { t } = useI18n();
  const summary = frequencySummary(rows, days, t);
  if (rows.length === 0) return <p className="text-(--muted)">{summary}</p>;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="text-sm text-(--muted)">{summary}</figcaption>
      {/* The chart repeats the caption and table, so it's hidden from screen readers. */}
      <div aria-hidden="true" style={{ height: rows.length * 44 + 16 }}>
        <Suspense fallback={null}>
          <FrequencyBars rows={rows} animate={animate} />
        </Suspense>
      </div>
      <details>
        <summary className="cursor-pointer text-sm font-medium">{t.chart.showTable}</summary>
        <table className="mt-2 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-(--border)">
              <th scope="col" className="py-1 pr-2">
                {t.chart.colEmotion}
              </th>
              <th scope="col" className="py-1 pr-2">
                {t.chart.colTimes}
              </th>
              <th scope="col" className="py-1">
                {t.chart.colAverage}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-(--border)">
                <th scope="row" className="py-1 pr-2 font-normal">
                  {t.emotions[r.label].name}
                </th>
                <td className="py-1 pr-2 tabular-nums">{r.count}</td>
                <td className="py-1 tabular-nums">{r.avgIntensity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
