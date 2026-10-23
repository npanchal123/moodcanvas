import { useI18n } from '../i18n';
import { dayKey } from '../lib/stats';
import { beforeFrom, displayEmotions } from '../lib/summary';
import type { EmotionEntry, PracticeBefore, PracticeLog, SavedPractice, VisualizeRequest } from '../lib/types';
import { PRACTICE_CONTENT, PRACTICE_IDS, PRACTICE_META, practiceFor, type PracticeId } from '../practices';
import { SavedPractices } from './SavedPractices';
import { btnPrimary, btnSecondary, card } from './ui';

interface Props {
  entries: EmotionEntry[];
  logs: PracticeLog[];
  onOpen: (id: PracticeId, before?: PracticeBefore) => void;
  onPlaySaved: (saved: SavedPractice) => void;
  onUseAction: (action: string) => void;
  onCreateAgain: (request: VisualizeRequest) => void;
}

/** Default export so App can load it lazily. */
export default function PracticeLibrary({ entries, logs, onOpen, onPlaySaved, onUseAction, onCreateAgain }: Props) {
  const { t, locale } = useI18n();
  const content = PRACTICE_CONTENT[locale];
  const latest = entries[0];
  const today = latest && dayKey(new Date(latest.createdAt)) === dayKey(new Date()) ? latest : undefined;
  const suggested = today ? practiceFor(displayEmotions(today)[0].label) : undefined;
  const isNew = logs.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="start-heading" className={`${card} flex flex-col gap-4`}>
        <h2 id="start-heading" className="text-xl font-semibold">
          {t.practice.startHereTitle}
        </h2>
        <p>{t.practice.startHereBody}</p>
        <div>
          <h3 className="mb-1 font-semibold">{t.practice.basicsHeading}</h3>
          <ul className="flex flex-col divide-y divide-(--border) rounded-xl border border-(--border)">
            {content.lessons.map((lesson, i) => (
              <li key={lesson.title}>
                <details open={isNew && i === 0} className="px-4">
                  <summary className="cursor-pointer py-3 font-medium">{lesson.title}</summary>
                  {lesson.body.map((p) => (
                    <p key={p} className="pb-3">
                      {p}
                    </p>
                  ))}
                </details>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => onOpen('first-visualization')}
          className={`${isNew ? btnPrimary : btnSecondary} self-start`}
        >
          <span aria-hidden="true">{PRACTICE_META['first-visualization'].icon}</span>
          {t.practice.firstButton}
        </button>
      </section>

      {today && suggested && (
        <section aria-labelledby="suggested-heading" className={`${card} flex flex-col gap-3 border-2 border-(--accent)`}>
          <h2 id="suggested-heading" className="text-xl font-semibold">
            {t.practice.suggestedHeading}
          </h2>
          <p>{t.practice.suggestedBody(t.emotions[displayEmotions(today)[0].label].adjective)}</p>
          <p className="text-lg font-medium">
            <span aria-hidden="true">{PRACTICE_META[suggested].icon} </span>
            {content.practices[suggested].title}
          </p>
          <p className="text-sm">{content.practices[suggested].summary}</p>
          <button type="button" onClick={() => onOpen(suggested, beforeFrom(today))} className={`${btnPrimary} self-start`}>
            {t.practice.openLabel(content.practices[suggested].title)}
          </button>
        </section>
      )}

      <SavedPractices onPlay={onPlaySaved} onUseAction={onUseAction} onCreateAgain={onCreateAgain} />

      <section aria-labelledby="library-heading">
        <h2 id="library-heading" className="mb-3 text-xl font-semibold">
          {t.practice.libraryHeading}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PRACTICE_IDS.map((id) => {
            const script = content.practices[id];
            const meta = PRACTICE_META[id];
            return (
              <li key={id} className={`${card} flex flex-col gap-2`}>
                <h3 className="text-lg font-semibold">
                  <span aria-hidden="true">{meta.icon} </span>
                  {script.title}
                </h3>
                <p className="text-sm">{script.summary}</p>
                <p className="text-sm text-(--muted)">
                  {meta.feelings.length
                    ? t.practice.helpsWith(meta.feelings.map((f) => t.emotions[f].name).join(', '))
                    : t.practice.forBeginners}
                  {' · '}
                  {meta.lengths.map((m) => t.practice.minutes(m)).join(' / ')}
                </p>
                <button
                  type="button"
                  onClick={() => onOpen(id)}
                  aria-label={t.practice.openLabel(script.title)}
                  className={`${btnSecondary} mt-auto self-start`}
                >
                  {t.practice.open}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
