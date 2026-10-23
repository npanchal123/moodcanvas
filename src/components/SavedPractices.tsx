import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { formatDateTime, useI18n } from '../i18n';
import { BREAKER_TEXT } from '../lib/breaker';
import { deleteSavedPractice, setFavorite } from '../lib/breaker/store';
import { COMPOSE_CONTENT, GOAL_IDS, SCENE_IDS, type GoalId, type SceneId } from '../lib/compose';
import { db } from '../lib/db';
import type { SavedPractice } from '../lib/types';
import { LENGTHS } from '../practices';
import { ScriptText } from './BreakerProgress';
import { btnGhost, btnPrimary, btnSecondary, card, checkbox } from './ui';

const NONE: SavedPractice[] = [];
const select = 'min-h-11 rounded-xl border border-(--border) bg-(--surface) px-3';

interface Props {
  onPlay: (saved: SavedPractice) => void;
  /** Opens Unstuck with the small step that was saved alongside a visualization. */
  onUseAction: (action: string) => void;
}

/** Visualizations saved to the Library, with filters. Kept on this device. */
export function SavedPractices({ onPlay, onUseAction }: Props) {
  const { locale } = useI18n();
  const l = BREAKER_TEXT[locale].library;
  const content = COMPOSE_CONTENT[locale];
  const saved = useLiveQuery(() => db.savedPractices.orderBy('createdAt').reverse().toArray(), []) ?? NONE;
  const [goal, setGoal] = useState<GoalId | ''>('');
  const [scene, setScene] = useState<SceneId | 'anywhere' | ''>('');
  const [minutes, setMinutes] = useState(0);
  const [oldest, setOldest] = useState(false);
  const [favorites, setFavorites] = useState(false);

  const shown = saved
    .filter(
      (s) =>
        (!goal || s.goal === goal) &&
        (!scene || (scene === 'anywhere' ? s.scene == null : s.scene === scene)) &&
        (!minutes || s.minutes === minutes) &&
        (!favorites || s.favorite === 1),
    )
    .sort((a, b) => (oldest ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));

  async function remove(id: string) {
    if (window.confirm(l.deleteConfirm)) await deleteSavedPractice(id);
  }

  return (
    <section aria-labelledby="saved-heading" className={`${card} flex flex-col gap-4`}>
      <h2 id="saved-heading" className="text-xl font-semibold">
        {l.title}
      </h2>
      {saved.length === 0 ? (
        <p className="text-(--muted)">{l.empty}</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 font-medium">
              {l.feeling}
              <select value={goal} onChange={(e) => setGoal(e.target.value as GoalId | '')} className={select}>
                <option value="">{l.any}</option>
                {GOAL_IDS.map((id) => (
                  <option key={id} value={id}>
                    {content.goals[id].name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 font-medium">
              {l.place}
              <select value={scene} onChange={(e) => setScene(e.target.value as SceneId | 'anywhere' | '')} className={select}>
                <option value="">{l.any}</option>
                {SCENE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {content.scenes[id].name}
                  </option>
                ))}
                <option value="anywhere">{l.anywhere}</option>
              </select>
            </label>
            <label className="flex items-center gap-2 font-medium">
              {l.length}
              <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className={select}>
                <option value={0}>{l.any}</option>
                {LENGTHS.map((m) => (
                  <option key={m} value={m}>
                    {BREAKER_TEXT[locale].mins(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 font-medium">
              {l.order}
              <select value={oldest ? 'oldest' : 'newest'} onChange={(e) => setOldest(e.target.value === 'oldest')} className={select}>
                <option value="newest">{l.newest}</option>
                <option value="oldest">{l.oldest}</option>
              </select>
            </label>
            <label className="flex min-h-11 items-center gap-2 font-medium">
              <input type="checkbox" checked={favorites} onChange={(e) => setFavorites(e.target.checked)} className={checkbox} />
              {l.favoritesOnly}
            </label>
          </div>

          {shown.length === 0 ? (
            <p className="text-(--muted)">{l.none}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {shown.map((s) => (
                <li key={s.id} className="flex flex-col gap-3 rounded-2xl bg-(--surface-alt) p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold break-words">
                        <span aria-hidden="true">{s.script.icon} </span>
                        {s.script.title}
                      </h3>
                      <p className="text-sm text-(--muted)">
                        {s.script.summary} · {BREAKER_TEXT[locale].mins(s.minutes)} ·{' '}
                        <time dateTime={s.createdAt}>{formatDateTime(s.createdAt, locale)}</time>
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-pressed={s.favorite === 1}
                      aria-label={`${l.favorite}: ${s.script.title}`}
                      onClick={() => void setFavorite(s.id, s.favorite !== 1)}
                      className={`${btnGhost} text-sm`}
                    >
                      <span aria-hidden="true">{s.favorite === 1 ? '★' : '☆'}</span>
                      {l.favorite}
                    </button>
                  </div>
                  {s.action && (
                    <p>
                      <span className="text-sm text-(--muted)">{l.action}: </span>
                      <span className="font-medium break-words">{s.action}</span>
                    </p>
                  )}
                  <ScriptText script={s.script} summary={BREAKER_TEXT[locale].progress.readScript} />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => onPlay(s)} className={btnPrimary}>
                      <span aria-hidden="true">▶</span>
                      {l.play}
                    </button>
                    {s.action && (
                      <button type="button" onClick={() => onUseAction(s.action!)} className={btnSecondary}>
                        {l.useAction}
                      </button>
                    )}
                    <button type="button" onClick={() => void remove(s.id)} className={`${btnGhost} text-(--danger)`}>
                      {l.delete}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
