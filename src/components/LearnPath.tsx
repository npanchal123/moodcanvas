import { useState } from 'react';
import { useI18n } from '../i18n';
import { usePersistentState } from '../lib/hooks';
import type { PracticeLog } from '../lib/types';
import { PRACTICE_CONTENT, type PracticeId } from '../practices';
import { BorderBeam } from './BorderBeam';
import { btnGhost, btnPrimary, btnSecondary } from './ui';

export const LEARN_ID = 'learn-to-visualize';
const STEPS = ['read', 'first', 'senses', 'guided', 'own'] as const;
type Step = (typeof STEPS)[number];
const isSteps = (value: unknown): value is Step[] =>
  Array.isArray(value) && value.every((v) => (STEPS as readonly string[]).includes(v as string));
const TIP_ICONS = ['🤫', '🎧', '👀', '⏱️', '🧭', '🌈'];

/**
 * Which beginner steps are done. Reading and the senses warm-up are marked by the person; the practices tick
 * themselves from the practice log, so finishing them anywhere in the app counts.
 */
export function useLearnProgress(logs: PracticeLog[]) {
  const [marked, setMarked] = usePersistentState<Step[]>('moodcanvas.learnDone', [], isSteps);
  const done = new Set<Step>(marked);
  if (logs.some((l) => l.practiceId === 'first-visualization')) done.add('first');
  if (logs.some((l) => l.practiceId !== 'first-visualization' && l.practiceId !== 'custom')) done.add('guided');
  if (logs.some((l) => l.practiceId === 'custom')) done.add('own');
  const mark = (step: Step) => setMarked([...new Set([...marked, step])]);
  return { done, complete: done.size === STEPS.length, mark };
}

/**
 * The beginner's path: five small steps from "what is this?" to a session written for you, with tips and common
 * questions. Shown prominently until it's finished, then folded into one line that can be opened again.
 */
export function LearnPath({
  progress,
  onOpen,
  onCreateOwn,
}: {
  progress: ReturnType<typeof useLearnProgress>;
  onOpen: (id: PracticeId) => void;
  onCreateOwn: () => void;
}) {
  const { t, locale } = useI18n();
  const l = t.learn;
  const lessons = PRACTICE_CONTENT[locale].lessons;
  const { done, complete, mark } = progress;
  const [expanded, setExpanded] = useState(false);
  const current = STEPS.find((s) => !done.has(s));
  const [openStep, setOpenStep] = useState<Step | null>(null);
  const shown = openStep ?? current;

  const actions: Record<Step, () => void> = {
    read: () => setOpenStep('read'),
    first: () => onOpen('first-visualization'),
    senses: () => setOpenStep('senses'),
    guided: () => onOpen('safe-place'),
    own: onCreateOwn,
  };

  if (complete && !expanded) {
    return (
      <section id={LEARN_ID} aria-labelledby="learn-heading" className="glass flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="btn-glow flex h-10 w-10 items-center justify-center rounded-full text-(--on-accent)">
            ✓
          </span>
          <div>
            <h2 id="learn-heading" className="font-bold">
              {l.completeTitle}
            </h2>
            <p className="text-sm text-(--muted)">{l.completeBody}</p>
          </div>
        </div>
        <button type="button" onClick={() => setExpanded(true)} className={btnSecondary}>
          {l.revisit}
        </button>
      </section>
    );
  }

  return (
    <section id={LEARN_ID} aria-labelledby="learn-heading" className="fade-up rounded-[1.6rem] p-[2px]" style={{ background: 'var(--grad-primary)' }}>
      <div className="flex flex-col gap-6 rounded-3xl bg-(--surface-strong) p-5 sm:p-7">
        <div className="flex flex-col items-center gap-2 text-center">
          <span aria-hidden="true" className="text-4xl">
            🌱
          </span>
          <p className="tagline text-xs font-extrabold text-(--accent) uppercase">{l.eyebrow}</p>
          <h2 id="learn-heading" className="display text-2xl font-extrabold sm:text-3xl">
            <span className="text-gradient">{l.title}</span>
          </h2>
          <p className="max-w-xl text-(--muted)">{l.body}</p>
          <div className="mt-1 flex w-full max-w-sm items-center gap-3">
            <div
              role="progressbar"
              aria-label={l.title}
              aria-valuemin={0}
              aria-valuemax={STEPS.length}
              aria-valuenow={done.size}
              aria-valuetext={l.progress(done.size, STEPS.length)}
              className="h-2 grow overflow-hidden rounded-full bg-(--track)"
            >
              <div className="btn-glow h-full rounded-full" style={{ width: `${(done.size / STEPS.length) * 100}%` }} />
            </div>
            <span className="text-sm font-semibold whitespace-nowrap">{l.progress(done.size, STEPS.length)}</span>
          </div>
        </div>

        <ol className="flex flex-col gap-3">
          {STEPS.map((step, i) => {
            const s = l.steps[step];
            const isDone = done.has(step);
            const isCurrent = step === current;
            return (
              <li
                key={step}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex flex-col gap-3 rounded-2xl border ${isCurrent ? 'border-(--accent) bg-(--accent-soft) p-4' : 'border-(--border) px-4 py-3'}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-extrabold ${
                      isDone ? 'btn-glow text-(--on-accent)' : isCurrent ? 'border-2 border-(--accent) text-(--accent)' : 'bg-(--track) text-(--muted)'
                    }`}
                  >
                    {isDone ? '✓' : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">
                      {s.title}
                      {isDone && <span className="sr-only"> ({l.done})</span>}
                    </h3>
                    {/* Only the step in hand explains itself, so the path stays short. */}
                    {(isCurrent || shown === step) && <p className="text-sm text-(--muted)">{s.body}</p>}
                  </div>
                  {isDone && (
                    <span aria-hidden="true" className="rounded-full border border-(--border) px-2.5 py-0.5 text-xs font-semibold text-(--muted)">
                      {l.done}
                    </span>
                  )}
                </div>
                {shown === step && step === 'read' && (
                  <div className="flex flex-col gap-3 rounded-2xl bg-(--surface-alt) p-4">
                    {lessons.slice(0, 2).map((lesson) => (
                      <div key={lesson.title}>
                        <h4 className="font-semibold">{lesson.title}</h4>
                        {lesson.body.map((p) => (
                          <p key={p} className="mt-1">
                            {p}
                          </p>
                        ))}
                      </div>
                    ))}
                    {!isDone && (
                      <button type="button" onClick={() => mark('read')} className={`${btnPrimary} self-start`}>
                        {l.markDone}
                      </button>
                    )}
                  </div>
                )}
                {shown === step && step === 'senses' && <SensesWarmUp onFinish={() => mark('senses')} done={isDone} />}
                {!(shown === step && (step === 'read' || step === 'senses')) && (
                  <button
                    type="button"
                    onClick={actions[step]}
                    className={`${isCurrent ? btnPrimary : `${btnSecondary} min-h-10 text-sm`} relative self-start`}
                  >
                    {isCurrent && <BorderBeam />}
                    {step !== 'read' && step !== 'senses' && step !== 'own' && <span aria-hidden="true">▶</span>}
                    {s.action}
                  </button>
                )}
              </li>
            );
          })}
        </ol>

        <details className="group rounded-2xl border border-(--border)">
          <summary className="flex min-h-12 cursor-pointer items-center gap-3 px-4 font-bold">
            <span aria-hidden="true" className="text-xl">
              💡
            </span>
            <span className="grow">{l.moreTitle}</span>
            <span aria-hidden="true" className="transition-transform group-open:rotate-180">
              ⌄
            </span>
          </summary>
          <div className="flex flex-col gap-5 px-4 pb-4">
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold">{l.tipsTitle}</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {l.tips.map((tip, i) => (
                  <li key={tip} className={`tint tint-${i % 6} flex gap-3 rounded-2xl border p-3 text-sm`}>
                    <span aria-hidden="true" className="text-xl">
                      {TIP_ICONS[i % TIP_ICONS.length]}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold">{l.faqTitle}</h3>
              <ul className="flex flex-col divide-y divide-(--border) rounded-2xl border border-(--border)">
                {lessons.map((lesson) => (
                  <li key={lesson.title}>
                    <details className="px-4">
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
          </div>
        </details>

        {complete && (
          <button type="button" onClick={() => setExpanded(false)} className={`${btnGhost} self-center`}>
            {l.hide}
          </button>
        )}
      </div>
    </section>
  );
}

/** One prompt per sense, a few seconds each, to notice which senses come easily. */
function SensesWarmUp({ onFinish, done }: { onFinish: () => void; done: boolean }) {
  const { t } = useI18n();
  const w = t.learn.senses;
  const [index, setIndex] = useState(0);
  const last = index === w.prompts.length - 1;
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-(--surface-alt) p-4">
      <p className="text-sm text-(--muted)">{w.intro}</p>
      <p aria-live="polite" className="display min-h-16 text-lg font-bold">
        <span className="sr-only">{w.step(index + 1, w.prompts.length)}: </span>
        {w.prompts[index]}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (last) {
              if (!done) onFinish();
              setIndex(0);
            } else setIndex(index + 1);
          }}
          className={btnPrimary}
        >
          {last ? w.finish : w.next}
        </button>
        <span aria-hidden="true" className="text-sm font-semibold text-(--muted)">
          {w.step(index + 1, w.prompts.length)}
        </span>
      </div>
    </div>
  );
}
