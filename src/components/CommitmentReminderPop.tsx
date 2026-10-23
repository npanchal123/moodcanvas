import { useI18n } from '../i18n';
import type { Commitment } from '../lib/types';
import { btnGhost, btnPrimary, btnSecondary } from './ui';

interface Props {
  due: Commitment | null;
  onDone: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

/**
 * Pops up over any page when a daily commitment's reminder time comes, while Viz it is on screen. It doesn't take
 * focus away from what the person is doing; the live region reads it out.
 */
export function CommitmentReminderPop({ due, onDone, onSnooze, onDismiss }: Props) {
  const { t } = useI18n();
  return (
    <div aria-live="assertive" className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      {due && (
        <section
          aria-label={t.reminder.commitmentTitle}
          className="glass fade-up pointer-events-auto flex w-full max-w-md flex-col gap-3 rounded-3xl bg-(--surface-strong)! p-4 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="btn-glow flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl">
              ⏰
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-(--muted)">{t.reminder.commitmentTitle}</p>
              <p className="text-lg font-bold break-words">{t.reminder.commitmentBody(due.title)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onDone} className={btnPrimary}>
              <span aria-hidden="true">✓</span>
              {t.reminder.markDone}
            </button>
            <button type="button" onClick={onSnooze} className={btnSecondary}>
              {t.reminder.snooze}
            </button>
            <button type="button" onClick={onDismiss} className={btnGhost}>
              {t.reminder.dismiss}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
