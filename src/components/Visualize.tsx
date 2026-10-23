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
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="fade-up relative flex flex-col items-center px-2 pt-4 text-center">
        <div className="aura -top-6 h-44 w-44 sm:h-56 sm:w-56" aria-hidden="true" />
        <img src={`${import.meta.env.BASE_URL}logo-mark.png`} alt="" width={96} height={86} className="relative h-20 w-auto drop-shadow-lg sm:h-24" />
        <h2 className="display relative mt-4 text-3xl leading-tight font-extrabold sm:text-5xl">
          <span className="text-gradient">{t.create.heroTitle}</span>
        </h2>
        <p className="relative mt-3 max-w-xl text-lg text-(--muted)">{t.create.heroBody}</p>
      </div>

      <form onSubmit={(e) => void submit(e)} className={`${card} fade-up flex flex-col gap-6`} noValidate>

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
            className="field rounded-2xl border border-(--border) bg-(--surface-strong) p-4 text-lg leading-relaxed shadow-inner transition-shadow"
          />
          <details>
            <summary className="cursor-pointer py-2 text-sm font-semibold text-(--accent)">{t.create.examplesLabel}</summary>
            <ul className="flex flex-col gap-2 pt-1">
              {t.create.examples.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    onClick={() => set({ text: example })}
                    className="min-h-11 rounded-2xl border border-(--border) bg-(--surface-strong) px-4 py-2 text-start text-sm italic hover:border-(--accent)"
                  >
                    “{example}”
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </div>

        <fieldset>
          <legend className="mb-3 font-semibold">{t.create.sceneLegend}</legend>
          <SceneTiles value={draft.scene} onChange={(scene) => set({ scene })} />
        </fieldset>

        <fieldset>
          <legend className="mb-3 font-semibold">{t.create.goalLegend}</legend>
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

        <button type="submit" disabled={busy} className={`${btnPrimary} min-h-14 w-full px-8 text-lg sm:w-auto sm:self-center`}>
          <span aria-hidden="true">✨</span>
          {busy ? t.create.creating : t.create.create}
        </button>
      </form>

      <section aria-labelledby="new-here-heading" className={`${card} flex flex-col items-center gap-3 text-center`}>
        <h2 id="new-here-heading" className="text-xl font-semibold">
          {t.create.newHereTitle}
        </h2>
        <p className="max-w-xl text-(--muted)">{t.create.newHereBody}</p>
        <div className="flex flex-wrap justify-center gap-2">
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

/** The places to imagine, as picture tiles. Choosing the chosen one again clears it. */
export function SceneTiles({ value, onChange }: { value: SceneId | null; onChange: (scene: SceneId | null) => void }) {
  const { locale } = useI18n();
  const content = COMPOSE_CONTENT[locale];
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
      {SCENE_IDS.map((id) => {
        const pressed = value === id;
        const [light, deep] = SCENE_LOOK[id].hues;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(pressed ? null : id)}
            style={{ background: `radial-gradient(circle at 30% 20%, ${light}, ${deep})` }}
            className={`group relative flex aspect-[4/3] min-h-20 flex-col items-center justify-end overflow-hidden rounded-2xl p-1.5 shadow-sm transition-transform hover:-translate-y-0.5 ${
              pressed ? 'ring-4 ring-(--accent) ring-offset-2 ring-offset-(--bg)' : ''
            }`}
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-[18%] text-center text-3xl drop-shadow transition-transform group-hover:scale-110">
              {SCENE_LOOK[id].icon}
            </span>
            <span className="relative w-full truncate rounded-xl bg-(--surface-strong) px-1.5 py-0.5 text-center text-xs font-semibold text-(--text) sm:text-sm">
              {content.scenes[id].name}
            </span>
            {pressed && (
              <span aria-hidden="true" className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-(--surface-strong) text-sm font-bold text-(--accent)">
                ✓
              </span>
            )}
          </button>
        );
      })}
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
    <div className="flex flex-col gap-3 rounded-2xl bg-(--surface-alt) p-4 sm:flex-row sm:items-start">
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
            <li key={chip} className="rounded-full border border-(--border) bg-(--surface-strong) px-3 py-1 text-sm">
              {chip}
            </li>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
}
