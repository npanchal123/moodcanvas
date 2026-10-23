import { useLiveQuery } from 'dexie-react-hooks';
import { useI18n } from '../i18n';
import { db } from '../lib/db';
import type { SavedPractice } from '../lib/types';
import { PRACTICE_CONTENT, PRACTICE_IDS, PRACTICE_META, type PracticeId } from '../practices';
import { btnGhost, btnSecondary } from './ui';

const NONE: SavedPractice[] = [];
/** Saved visualizations shown on the front page; the rest are in the Library. */
const SAVED_LIMIT = 4;

const cardClass =
  'glass flex w-[78%] shrink-0 snap-start flex-col gap-2 rounded-3xl p-4 sm:w-auto';

/**
 * The Library's guided visualizations on the front page, for anyone who would rather start from one than write:
 * a swipeable row on phones, a grid on wider screens. Saved ones come first when there are any.
 */
export function ReadyMade({
  onOpen,
  onPlaySaved,
  onSeeAll,
}: {
  onOpen: (id: PracticeId) => void;
  onPlaySaved: (saved: SavedPractice) => void;
  onSeeAll: () => void;
}) {
  const { t, locale } = useI18n();
  const content = PRACTICE_CONTENT[locale];
  const saved =
    useLiveQuery(
      async () =>
        (await db.savedPractices.orderBy('createdAt').reverse().toArray())
          .sort((a, b) => b.favorite - a.favorite)
          .slice(0, SAVED_LIMIT),
      [],
    ) ?? NONE;
  // The first-ever practice has its own button just below, for newcomers.
  const ids = PRACTICE_IDS.filter((id) => id !== 'first-visualization');
  const row = 'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0';

  return (
    <section aria-labelledby="ready-made-heading" className="fade-up flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2 px-1">
        <div>
          <h2 id="ready-made-heading" className="display text-2xl font-extrabold">
            {t.create.readyTitle}
          </h2>
          <p className="text-(--muted)">{t.create.readyBody}</p>
        </div>
        <button type="button" onClick={onSeeAll} className={`${btnGhost} text-sm`}>
          {t.create.seeAll}
          <span aria-hidden="true" className="rtl:-scale-x-100">→</span>
        </button>
      </div>

      {saved.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="px-1 font-semibold">{t.create.savedTitle}</h3>
          <ul className={row}>
            {saved.map((s) => (
              <li key={s.id} className={cardClass}>
                <p className="flex items-start gap-2 font-bold">
                  <span aria-hidden="true">{s.script.icon}</span>
                  <span className="min-w-0 break-words">{s.script.title}</span>
                  {s.favorite === 1 && <span aria-hidden="true">★</span>}
                </p>
                <p className="line-clamp-2 text-sm text-(--muted)">{s.script.summary}</p>
                <button
                  type="button"
                  onClick={() => onPlaySaved(s)}
                  aria-label={t.practice.openLabel(s.script.title)}
                  className={`${btnSecondary} mt-auto self-start`}
                >
                  <span aria-hidden="true">▶</span>
                  {t.practice.open}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className={row}>
        {ids.map((id) => {
          const script = content.practices[id];
          const meta = PRACTICE_META[id];
          const [light, deep] = meta.hues;
          return (
            <li key={id} className={cardClass}>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: `radial-gradient(circle at 30% 25%, ${light}, ${deep})` }}
                >
                  {meta.icon}
                </span>
                <h3 className="font-bold">{script.title}</h3>
              </div>
              <p className="line-clamp-3 text-sm">{script.summary}</p>
              <p className="text-xs text-(--muted)">
                {meta.feelings.length ? t.practice.helpsWith(meta.feelings.map((f) => t.emotions[f].name).join(', ')) : t.practice.forBeginners}
                {' · '}
                {meta.lengths.map((m) => t.practice.minutes(m)).join(' / ')}
              </p>
              <button
                type="button"
                onClick={() => onOpen(id)}
                aria-label={t.practice.openLabel(script.title)}
                className={`${btnSecondary} mt-auto self-start`}
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
