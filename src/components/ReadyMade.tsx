import { useI18n } from '../i18n';
import { dayKey } from '../lib/stats';
import { beforeFrom, displayEmotions } from '../lib/summary';
import type { EmotionEntry, PracticeBefore } from '../lib/types';
import { PRACTICE_CONTENT, PRACTICE_IDS, PRACTICE_META, practiceFor, type PracticeId } from '../practices';
import { btnPrimary, btnSecondary } from './ui';

const cardClass = 'glass flex w-[78%] shrink-0 snap-start flex-col gap-2 rounded-3xl p-4 sm:w-auto';

/**
 * The guided visualizations, right on the front page: a swipeable row on phones, a grid on wider screens. When
 * today's check-in suggests one, it comes first, and it compares the feeling before and after.
 */
export function ReadyMade({ entries, onOpen }: { entries: EmotionEntry[]; onOpen: (id: PracticeId, before?: PracticeBefore) => void }) {
  const { t, locale } = useI18n();
  const content = PRACTICE_CONTENT[locale];
  const latest = entries[0];
  const today = latest && dayKey(new Date(latest.createdAt)) === dayKey(new Date()) ? latest : undefined;
  const suggested = today ? practiceFor(displayEmotions(today)[0].label) : undefined;
  // The first-ever practice has its own button in "New to visualization?".
  const ids = PRACTICE_IDS.filter((id) => id !== 'first-visualization').sort((a, b) => Number(b === suggested) - Number(a === suggested));

  return (
    <section aria-labelledby="ready-made-heading" className="fade-up flex flex-col gap-4">
      <div className="px-1">
        <h2 id="ready-made-heading" className="display text-2xl font-extrabold">
          {t.create.readyTitle}
        </h2>
        <p className="text-(--muted)">{t.create.readyBody}</p>
      </div>
      {today && suggested && (
        <p className="px-1 text-sm font-medium">{t.practice.suggestedBody(t.emotions[displayEmotions(today)[0].label].adjective)}</p>
      )}
      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
        {ids.map((id) => {
          const script = content.practices[id];
          const meta = PRACTICE_META[id];
          const [light, deep] = meta.hues;
          const isSuggested = id === suggested;
          return (
            <li key={id} className={`${cardClass} ${isSuggested ? 'ring-2 ring-(--accent)' : ''}`}>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: `radial-gradient(circle at 30% 25%, ${light}, ${deep})` }}
                >
                  {meta.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold">{script.title}</h3>
                  {isSuggested && (
                    <span className="rounded-full bg-(--accent) px-2 py-0.5 text-xs font-bold text-(--on-accent)">
                      {t.practice.suggestedHeading}
                    </span>
                  )}
                </div>
              </div>
              <p className="line-clamp-3 text-sm">{script.summary}</p>
              <p className="text-xs text-(--muted)">
                {meta.feelings.length ? t.practice.helpsWith(meta.feelings.map((f) => t.emotions[f].name).join(', ')) : t.practice.forBeginners}
                {' · '}
                {meta.lengths.map((m) => t.practice.minutes(m)).join(' / ')}
              </p>
              <button
                type="button"
                onClick={() => onOpen(id, isSuggested && today ? beforeFrom(today) : undefined)}
                aria-label={t.practice.openLabel(script.title)}
                className={`${isSuggested ? btnPrimary : btnSecondary} mt-auto self-start`}
              >
                <span aria-hidden="true">▶</span>
                {t.practice.open}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
