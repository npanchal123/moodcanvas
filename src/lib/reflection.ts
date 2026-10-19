import { formatWeekday, tagLabel, type Locale, type Messages } from '../i18n';
import type { EmotionLabel } from './emotions';
import { entriesWithin, frequency } from './stats';
import { effectiveIntensity } from './summary';
import type { EmotionEntry } from './types';

const DAY_MS = 86_400_000;

function averageValence(entries: EmotionEntry[]): number {
  return entries.reduce((sum, e) => sum + e.valence, 0) / entries.length;
}

/**
 * A few gentle, plain-language observations about the last 7 days.
 * Worked out on the device; nothing is sent anywhere.
 */
export function weeklyReflection(entries: EmotionEntry[], t: Messages, locale: Locale, now = Date.now()): string[] {
  const thisWeek = entriesWithin(entries, 7, now);
  if (thisWeek.length === 0) return [t.reflection.empty];
  const lastWeek = entries.filter((e) => {
    const time = Date.parse(e.createdAt);
    return time < now - 7 * DAY_MS && time >= now - 14 * DAY_MS;
  });

  const lines = [t.reflection.count(thisWeek.length)];

  const [top] = frequency(thisWeek, 7, now);
  if (top) lines.push(t.reflection.top(t.emotions[top.label].name, top.count));

  if (lastWeek.length > 0) {
    const diff = averageValence(thisWeek) - averageValence(lastWeek);
    lines.push(diff > 0.15 ? t.reflection.lighter : diff < -0.15 ? t.reflection.heavier : t.reflection.same);
  }

  const strongest = thisWeek.reduce((a, b) => (effectiveIntensity(b) > effectiveIntensity(a) ? b : a));
  const strongestLabel = strongest.emotions[0]?.label;
  if (strongestLabel) {
    lines.push(
      t.reflection.strongest(
        t.emotions[strongestLabel].noun,
        formatWeekday(new Date(strongest.createdAt), locale),
        effectiveIntensity(strongest),
      ),
    );
  }

  const byTag = new Map<string, EmotionEntry[]>();
  for (const entry of thisWeek) {
    for (const tag of entry.tags) byTag.set(tag, [...(byTag.get(tag) ?? []), entry]);
  }
  const [topTag] = [...byTag].sort((a, b) => b[1].length - a[1].length);
  if (topTag && topTag[1].length >= 2) {
    const [tag, tagged] = topTag;
    const counts = new Map<EmotionLabel, number>();
    for (const e of tagged) {
      const label = e.emotions[0]?.label;
      if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    const [mostly] = [...counts].sort((a, b) => b[1] - a[1]);
    if (mostly) lines.push(t.reflection.tag(tagLabel(t, tag), tagged.length, t.emotions[mostly[0]].adjective));
  }

  return lines;
}
