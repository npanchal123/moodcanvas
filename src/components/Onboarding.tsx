import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useI18n } from '../i18n';
import { EmotionBloom } from './EmotionBloom';
import { btnGhost, btnPrimary, dialogContent, dialogOverlay } from './ui';

interface Props {
  open: boolean;
  onDone: () => void;
}

export function Onboarding({ open, onDone }: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const steps = t.onboarding.steps;
  const current = steps[step];
  const last = step === steps.length - 1;

  const visuals = [
    <p key="example" className="rounded-xl bg-(--surface-alt) p-4 italic">
      {steps[0].example}
    </p>,
    <div key="bloom" className="flex justify-center">
      <EmotionBloom
        emotions={[
          { label: 'fear', intensity: 75 },
          { label: 'joy', intensity: 42 },
        ]}
        valence={-0.44}
        size={160}
        decorative
      />
    </div>,
    <p key="lock" aria-hidden="true" className="text-center text-5xl">
      🔒
    </p>,
  ];

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onDone()}>
      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlay} />
        <Dialog.Content className={dialogContent}>
          <p className="text-sm text-(--muted)">{t.onboarding.step(step + 1, steps.length)}</p>
          <Dialog.Title className="text-xl font-semibold">{current.title}</Dialog.Title>
          {visuals[step]}
          <Dialog.Description>{current.body}</Dialog.Description>
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={onDone} className={btnGhost}>
              {t.onboarding.skip}
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} className={btnGhost}>
                  {t.onboarding.back}
                </button>
              )}
              <button type="button" onClick={() => (last ? onDone() : setStep(step + 1))} className={btnPrimary}>
                {last ? t.onboarding.done : t.onboarding.next}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
