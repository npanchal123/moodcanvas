import { useI18n } from '../i18n';
import { btnGhost, btnPrimary } from './ui';

interface Props {
  onCheckIn: () => void;
  onDismiss: () => void;
}

export function ReminderBanner({ onCheckIn, onDismiss }: Props) {
  const { t } = useI18n();
  return (
    <div role="status" className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) p-4">
      <span aria-hidden="true" className="text-2xl">
        🌙
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{t.reminder.bannerTitle}</p>
        <p className="text-sm text-(--muted)">{t.reminder.bannerBody}</p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCheckIn} className={btnPrimary}>
          {t.reminder.bannerAction}
        </button>
        <button type="button" onClick={onDismiss} className={btnGhost}>
          {t.reminder.dismiss}
        </button>
      </div>
    </div>
  );
}
