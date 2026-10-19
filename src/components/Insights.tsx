import { useMemo } from 'react';
import { tagLabel, useI18n } from '../i18n';
import { EMOTION_META } from '../lib/emotions';
import { findInsights, INSIGHT_WINDOW_DAYS, type Insight } from '../lib/insights';
import { entriesWithin } from '../lib/stats';
import type { EmotionEntry } from '../lib/types';
import { card } from './ui';

const ICON: Record<Insight['kind'], string> = { lighter: '🌤️', heavier: '🌧️', emotion: '' };

export function Insights({ entries }: { entries: EmotionEntry[] }) {
  const { t } = useI18n();
  const insights = useMemo(() => findInsights(entries), [entries]);
  const basis = useMemo(() => entriesWithin(entries, INSIGHT_WINDOW_DAYS).length, [entries]);

  function sentence(insight: Insight): string {
    const tag = tagLabel(t, insight.tag);
    if (insight.kind === 'emotion') return t.insights.emotion(tag, t.emotions[insight.label].name, insight.pct);
    return insight.kind === 'lighter' ? t.insights.lighter(tag) : t.insights.heavier(tag);
  }

  return (
    <section aria-labelledby="insights-heading" className={`${card} flex flex-col gap-3`}>
      <h2 id="insights-heading" className="text-xl font-semibold">
        {t.history.insightsHeading}
      </h2>
      {insights.length === 0 ? (
        <p className="text-(--muted)">{t.history.insightsEmpty}</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {insights.map((insight) => (
              <li key={`${insight.kind}-${insight.tag}`} className="flex gap-3 rounded-xl bg-(--surface-alt) p-3">
                <span aria-hidden="true" className="text-xl">
                  {insight.kind === 'emotion' ? EMOTION_META[insight.label].icon : ICON[insight.kind]}
                </span>
                <span>{sentence(insight)}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-(--muted)">
            {t.insights.basedOn(basis)} {t.history.insightsNote}
          </p>
        </>
      )}
    </section>
  );
}
