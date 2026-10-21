import { useState } from 'react';
import { useI18n } from '../i18n';
import { COMPOSE_CONTENT, GOAL_ICONS, GOAL_IDS, SCENE_IDS, SCENE_LOOK, type Composed, type GoalId, type SceneId } from '../lib/compose';
import type { AnalysisResult } from '../lib/analyzer';
import { EMOTION_META } from '../lib/emotions';
import { EmotionBloom } from './EmotionBloom';
import { btnPrimary, btnSecondary, card, toggle } from './ui';

export const FEELING_INPUT_ID = 'feeling-input';
const MAX_LENGTH = 500;

export interface Draft {
  text: string;
  scene: SceneId | null;
  goal: GoalId | null;
}

export const EMPTY_DRAFT: Draft = { text: '', scene: null, goal: null };

interface Props {
  draft: Draft;
  onDraftChange: (draft: Draft) => void;
  onCreate: () => Promise<void>;
  aiEnabled: boolean;
  onFirstPractice: () => void;
  onLearn: () => void;
}

/** The front page: say how you feel and what you'd like to imagine, and get a visualization made for you. */
export function Visualize({ draft, onDraftChange, onCreate, aiEnabled, onFirstPractice, onLearn }: Props) {
  const { t, locale } = useI18n();
  const content = COMPOSE_CONTENT[locale];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (changes: Partial<Draft>) => onDraftChange({ ...draft, ...changes });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.text.trim() && !draft.scene && !draft.goal) {
      setError(t.create.needMore);
      document.getElementById(FEELING_INPUT_ID)?.focus();
      return;
    }
    setError('');
    setBusy(true);
    try {
      await onCreate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={(e) => void submit(e)} className={`${card} flex flex-col gap-5`} noValidate>
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">{t.create.heroTitle}</h2>
          <p className="mt-2 text-(--muted)">{t.create.heroBody}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={FEELING_INPUT_ID} className="text-lg font-semibold">
            {t.create.label}
          </label>
          <p id="feeling-hint" className="text-sm text-(--muted)">
            {aiEnabled ? t.create.hintAi : t.create.hintLocal}
          </p>
          <textarea
            id={FEELING_INPUT_ID}
            value={draft.text}
            maxLength={MAX_LENGTH}
            rows={4}
            placeholder={t.create.placeholder}
            onChange={(e) => set({ text: e.target.value })}
            aria-describedby={`feeling-hint${error ? ' create-error' : ''}`}
            aria-invalid={error ? true : undefined}
            className="rounded-xl border border-(--border) bg-(--surface) p-3 text-lg"
          />
          <details>
            <summary className="cursor-pointer py-2 text-sm font-medium">{t.create.examplesLabel}</summary>
            <ul className="flex flex-col gap-2 pt-1">
              {t.create.examples.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    onClick={() => set({ text: example })}
                    className="min-h-11 rounded-xl bg-(--surface-alt) px-3 py-2 text-start text-sm hover:bg-(--track)"
                  >
                    “{example}”
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </div>

        <fieldset>
          <legend className="mb-2 font-medium">{t.create.sceneLegend}</legend>
          <div className="flex flex-wrap gap-2">
            {SCENE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={draft.scene === id}
                onClick={() => set({ scene: draft.scene === id ? null : id })}
                className={`${toggle(draft.scene === id)} text-sm`}
              >
                <span aria-hidden="true">{SCENE_LOOK[id].icon}</span>
                {content.scenes[id].name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-medium">{t.create.goalLegend}</legend>
          <div className="flex flex-wrap gap-2">
            {GOAL_IDS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={draft.goal === id}
                onClick={() => set({ goal: draft.goal === id ? null : id })}
                className={`${toggle(draft.goal === id)} text-sm`}
              >
                <span aria-hidden="true">{GOAL_ICONS[id]}</span>
                {content.goals[id].name}
              </button>
            ))}
          </div>
        </fieldset>

        {error && (
          <p id="create-error" role="alert" className="font-medium text-(--danger)">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className={`${btnPrimary} min-h-12 self-start px-6 text-lg`}>
          <span aria-hidden="true">✨</span>
          {busy ? t.create.creating : t.create.create}
        </button>
      </form>

      <section aria-labelledby="new-here-heading" className={`${card} flex flex-col gap-3`}>
        <h2 id="new-here-heading" className="text-xl font-semibold">
          {t.create.newHereTitle}
        </h2>
        <p>{t.create.newHereBody}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onFirstPractice} className={btnSecondary}>
            <span aria-hidden="true">🍋</span>
            {t.create.firstTry}
          </button>
          <button type="button" onClick={onLearn} className={btnSecondary}>
            {t.create.learn}
          </button>
        </div>
      </section>
    </div>
  );
}

/** What Viz it understood from the person's words, shown before they begin their composed practice. */
export function CreatedIntro({ text, result, composed }: { text: string; result: AnalysisResult | null; composed: Composed }) {
  const { t, locale } = useI18n();
  const content = COMPOSE_CONTENT[locale];
  const primary = result?.emotions[0];
  const chips = [
    primary && `${EMOTION_META[primary.label].icon} ${t.create.feeling(t.emotions[primary.label].name, primary.intensity)}`,
    `${SCENE_LOOK[composed.scene ?? 'anywhere'].icon} ${t.create.place(composed.place ?? content.scenes[composed.scene!].place)}`,
    `${GOAL_ICONS[composed.goal]} ${t.create.goal(content.goals[composed.goal].name)}`,
    composed.topic && `💭 ${t.create.about(content.topics[composed.topic].phrase)}`,
  ].filter((chip): chip is string => Boolean(chip));

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-(--surface-alt) p-4 sm:flex-row sm:items-start">
      {result && primary && (
        <EmotionBloom emotions={result.emotions} valence={result.valence} size={96} decorative />
      )}
      <div className="flex min-w-0 flex-col gap-3">
      {text.trim() && (
        <figure>
          <figcaption className="text-sm font-medium text-(--muted)">{t.create.madeFrom}</figcaption>
          <blockquote className="mt-1 line-clamp-3 italic">
            {/* <q> gives each language its own quotation marks: “…”, «…», „…“. */}
            <q>{text.trim()}</q>
          </blockquote>
        </figure>
      )}
      <div>
        <p className="text-sm font-medium text-(--muted)">{t.create.understood}</p>
        <ul className="mt-1 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li key={chip} className="rounded-full border border-(--border) bg-(--surface) px-3 py-1 text-sm">
              {chip}
            </li>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
}
