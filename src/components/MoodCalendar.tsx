import { formatLongDate, formatWeekday, useI18n } from '../i18n';
import { buildCalendar, type CalendarDay } from '../lib/calendar';
import { EMOTION_META, emotionColor, type EmotionLabel } from '../lib/emotions';
import { intensityBand } from '../lib/summary';
import { useTheme } from '../lib/theme';
import type { EmotionEntry } from '../lib/types';

const WEEKS = 5;

/** Stronger days show more of the emotion's color, milder days fade toward the surface. */
function fillMix(color: string, intensity: number, highContrast: boolean): string {
  if (highContrast) return color;
  const pct = Math.round(35 + (65 * intensity) / 100);
  return `color-mix(in srgb, ${color} ${pct}%, var(--surface))`;
}

export function MoodCalendar({ entries }: { entries: EmotionEntry[] }) {
  const { t, locale } = useI18n();
  const { scheme, highContrast } = useTheme();
  const grid = buildCalendar(entries, WEEKS);
  const present = [...new Set(grid.flat().flatMap((d) => (d.dominant ? [d.dominant] : [])))] as EmotionLabel[];

  function describe(day: CalendarDay): string {
    const date = formatLongDate(day.date, locale);
    if (!day.dominant) return t.calendar.noCheckIns(date);
    return t.calendar.day(
      date,
      t.emotions[day.dominant].name,
      t.bands[intensityBand(day.avgIntensity)],
      day.avgIntensity,
      day.count,
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <table className="w-full table-fixed border-separate border-spacing-1">
        <caption className="sr-only">{t.calendar.caption(WEEKS)}</caption>
        <thead>
          <tr>
            {grid[0].map((day) => (
              <th
                key={day.date.getDay()}
                scope="col"
                abbr={formatWeekday(day.date, locale, 'long')}
                className="pb-1 text-xs font-medium text-(--muted)"
              >
                {formatWeekday(day.date, locale, 'short')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((week) => (
            <tr key={week[0].date.toISOString()}>
              {week.map((day) => {
                if (day.inFuture) return <td key={day.date.toISOString()} aria-hidden="true" />;
                const label = describe(day);
                const meta = day.dominant ? EMOTION_META[day.dominant] : undefined;
                return (
                  <td key={day.date.toISOString()} className="p-0">
                    <div
                      title={label}
                      className={`relative flex aspect-square items-center justify-center rounded-md ${
                        meta ? (highContrast ? 'border-2 border-(--border)' : '') : 'border border-dashed border-(--border) bg-(--surface-alt)'
                      }`}
                      style={
                        day.dominant
                          ? { backgroundColor: fillMix(emotionColor(day.dominant, scheme), day.avgIntensity, highContrast) }
                          : undefined
                      }
                    >
                      <span className="sr-only">{label}</span>
                      <span
                        aria-hidden="true"
                        className="absolute left-0.5 top-0.5 rounded bg-(--surface) px-1 text-[10px] leading-4 tabular-nums"
                      >
                        {day.date.getDate()}
                      </span>
                      {meta && (
                        <span aria-hidden="true" className="text-base sm:text-xl">
                          {meta.icon}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {present.length > 0 && (
        <div aria-hidden="true" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {present.map((label) => (
            <span key={label} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: emotionColor(label, scheme) }}
              />
              {EMOTION_META[label].icon} {t.emotions[label].name}
            </span>
          ))}
          {!highContrast && <span className="text-(--muted)">{t.calendar.legendNote}</span>}
        </div>
      )}
    </div>
  );
}
