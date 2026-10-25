import { useState } from 'react';
import { useI18n } from '../i18n';
import {
  COMPOSE_CONTENT,
  GOAL_ICONS,
  GOAL_IDS,
  MODE_ICONS,
  MODE_IDS,
  recommendMode,
  SCENE_IDS,
  SCENE_LOOK,
  type Composed,
  type GoalId,
  type ModeId,
  type SceneId,
} from '../lib/compose';
import type { AnalysisResult } from '../lib/analyzer';
import { EMOTION_META } from '../lib/emotions';
import { streak } from '../lib/stats';
import type { EmotionEntry, PracticeBefore, PracticeLog, SavedPractice, VisualizeRequest } from '../lib/types';
import type { PracticeId } from '../practices';
import { BorderBeam } from './BorderBeam';
import { EmotionBloom } from './EmotionBloom';
import { LEARN_ID, LearnPath, useLearnProgress } from './LearnPath';
import { ReadyMade } from './ReadyMade';
import { OwnRecordings } from './MyVoice';
import { SavedPractices } from './SavedPractices';
import { btnPrimary, card, tintChip } from './ui';

export const FEELING_INPUT_ID = 'feeling-input';
const MAX_LENGTH = 500;

export interface Draft {
  text: string;
  scene: SceneId | null;
  goal: GoalId | null;
  /** Chosen by the person; null to let Viz it suggest one from the words (or none, for a restful session). */
  mode: ModeId | null;
}

export const EMPTY_DRAFT: Draft = { text: '', scene: null, goal: null, mode: null };

/** The mode and feeling that suit each idea, in the order of `t.create.ideas`. */
const IDEA_SETTINGS: { mode: ModeId | null; goal: GoalId }[] = [
  { mode: null, goal: 'calm' },
  { mode: 'future', goal: 'confidence' },
  { mode: 'process', goal: 'focus' },
  { mode: 'obstacle', goal: 'confidence' },
  { mode: null, goal: 'joy' },
  { mode: null, goal: 'sleep' },
  { mode: null, goal: 'joy' },
  { mode: 'process', goal: 'focus' },
  { mode: 'future', goal: 'energy' },
  { mode: 'obstacle', goal: 'calm' },
];

interface Props {
  draft: Draft;
  onDraftChange: (draft: Draft) => void;
  onCreate: () => Promise<void>;
  aiEnabled: boolean;
  onFirstPractice: () => void;
  entries: EmotionEntry[];
  logs: PracticeLog[];
  onOpenPractice: (id: PracticeId, before?: PracticeBefore) => void;
  onPlaySaved: (saved: SavedPractice) => void;
  onUseAction: (action: string) => void;
  onCreateAgain: (request: VisualizeRequest) => void;
}

/** The front page: say how you feel and what you'd like to imagine, and get a visualization made for you. */
export function Visualize(props: Props) {
  const { draft, onDraftChange, onCreate, aiEnabled, onFirstPractice, entries, logs, onOpenPractice, onPlaySaved, onUseAction, onCreateAgain } = props;
  const { t, locale } = useI18n();
  const content = COMPOSE_CONTENT[locale];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (changes: Partial<Draft>) => onDraftChange({ ...draft, ...changes });
  const learn = useLearnProgress(logs);
  const suggested = draft.mode ? null : draft.goal === 'sleep' ? null : recommendMode(draft.text);

  /** Fills in an idea, with a mode and feeling that suit it; asks first if it would replace their own words. */
  function applyIdea(index: number) {
    const idea = t.create.ideas[index];
    if (draft.text.trim() && draft.text !== idea.text && !window.confirm(t.create.replaceConfirm)) return;
    set({ text: idea.text, ...IDEA_SETTINGS[index] });
    document.getElementById(FEELING_INPUT_ID)?.focus();
  }

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
    } catch {
      // Their words stay in the form; nothing technical is shown.
      setError(t.create.createError);
    } finally {
      setBusy(false);
    }
  }

  const partOfDay = dayPart(new Date().getHours());
  const streakDays = streak(entries);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="fade-up relative flex flex-col items-center px-2 pt-2 text-center sm:pt-4">
        <div className="aura -top-6 h-44 w-44 sm:h-56 sm:w-56" aria-hidden="true" />
        <p className="relative mb-3 inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-strong) px-4 py-1.5 font-bold shadow-sm">
          <span aria-hidden="true">{GREETING_ICONS[partOfDay]}</span>
          {t.create.greeting[partOfDay]}
        </p>
        <img src={`${import.meta.env.BASE_URL}logo-mark.png`} alt="" width={96} height={86} className="relative h-16 w-auto drop-shadow-lg sm:h-24" />
        <h2 className="display relative mt-3 text-[2rem] leading-[1.1] font-extrabold sm:mt-4 sm:text-5xl">
          <span className="text-gradient">{t.create.heroTitle}</span>
        </h2>
        <p className="relative mt-3 max-w-xl text-(--muted) sm:text-lg">{t.create.heroBody}</p>
        {(streakDays > 0 || logs.length > 0) && (
          <ul className="relative mt-4 flex flex-wrap justify-center gap-2">
            {streakDays > 0 && (
              <li className="tint tint-1 rounded-full border px-3.5 py-1 font-bold">
                <span aria-hidden="true">🔥 </span>
                {t.create.streakChip(streakDays)}
              </li>
            )}
            {logs.length > 0 && (
              <li className="tint tint-4 rounded-full border px-3.5 py-1 font-bold">
                <span aria-hidden="true">🧘 </span>
                {t.create.sessionsChip(logs.length)}
              </li>
            )}
          </ul>
        )}
        {!learn.complete && (
          <a
            href={`#${LEARN_ID}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(LEARN_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="relative mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-(--accent) bg-(--accent-soft) px-4 text-[0.95rem] font-bold no-underline hover:bg-(--surface-alt) sm:text-base"
          >
            <BorderBeam color="var(--accent)" />
            <span aria-hidden="true">🌱</span>
            {t.learn.heroChip}
            <span aria-hidden="true">↓</span>
          </a>
        )}
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
            <ul className="flex flex-wrap gap-2 pt-1">
              {t.create.ideas.map((idea, i) => (
                <li key={idea.label}>
                  <button
                    type="button"
                    onClick={() => applyIdea(i)}
                    className={`tint tint-${i % 6} inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 py-1 text-start text-sm font-semibold`}
                  >
                    <span aria-hidden="true">✨</span>
                    <span>{idea.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </div>

        <fieldset aria-describedby="mode-hint">
          <legend className="mb-1 font-semibold">{t.create.modeLegend}</legend>
          <p id="mode-hint" className="mb-3 text-sm text-(--muted)">
            {t.create.modeHint}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {MODE_IDS.map((id, i) => {
              const pressed = draft.mode === id;
              const mode = content.modes[id];
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => set({ mode: pressed ? null : id })}
                  className={`relative flex flex-col items-start gap-1 rounded-2xl border p-3 text-start transition-colors ${
                    pressed
                      ? 'border-(--accent) bg-(--accent-soft) ring-2 ring-(--accent-soft)'
                      : `tint ${MODE_TINTS[i % MODE_TINTS.length]} ${suggested === id ? 'border-dashed border-(--accent)' : ''}`
                  }`}
                >
                  <span className="flex items-center gap-2 font-bold">
                    <span aria-hidden="true">{MODE_ICONS[id]}</span>
                    {mode.name}
                    {pressed && <span aria-hidden="true">✓</span>}
                  </span>
                  <span className="text-sm text-(--muted)">{mode.description}</span>
                  {suggested === id && (
                    <span className="rounded-full bg-(--accent) px-2 py-0.5 text-xs font-bold text-(--on-accent)">{t.create.suggested}</span>
                  )}
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="mt-2 min-h-5 text-sm text-(--muted)">
            {suggested ? t.create.suggestedWhy(content.modes[suggested].name, content.modes[suggested].why) : ''}
          </p>
        </fieldset>

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
                className={`${tintChip(draft.goal === id, GOAL_IDS.indexOf(id))} text-sm`}
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

        <button type="submit" disabled={busy} className={`${btnPrimary} relative min-h-14 w-full px-8 text-lg sm:w-auto sm:self-center`}>
          {/* A light travelling around the border draws the eye to the page's main action. */}
          {!busy && <BorderBeam />}
          <span aria-hidden="true">✨</span>
          {busy ? t.create.creating : t.create.create}
        </button>
      </form>

      <OwnRecordings />

      <LearnPath
        progress={learn}
        onOpen={(id) => (id === 'first-visualization' ? onFirstPractice() : onOpenPractice(id))}
        onCreateOwn={() => {
          const input = document.getElementById(FEELING_INPUT_ID);
          input?.scrollIntoView({ block: 'center' });
          input?.focus();
        }}
      />

      <ReadyMade entries={entries} onOpen={onOpenPractice} />

      <SavedPractices onPlay={onPlaySaved} onUseAction={onUseAction} onCreateAgain={onCreateAgain} />

    </div>
  );
}

/** The places to imagine, as picture tiles. Choosing the chosen one again clears it. */
const MODE_TINTS = ['tint-1', 'tint-3', 'tint-2'];

const GREETING_ICONS = { morning: '☀️', afternoon: '🌤️', evening: '🌙', night: '✨' } as const;

function dayPart(hour: number): keyof typeof GREETING_ICONS {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

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
    composed.mode && `${MODE_ICONS[composed.mode]} ${t.create.mode(content.modes[composed.mode].name)}`,
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
