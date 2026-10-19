import { useI18n } from '../i18n';
import { btnGhost } from './ui';

export function CrisisBanner({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useI18n();
  return (
    <div role="status" className="mb-6 rounded-2xl border-2 border-(--accent) bg-(--surface) p-5">
      <p className="font-semibold">{t.crisis.title}</p>
      <p className="mt-1">
        {t.crisis.body}{' '}
        <a href="https://findahelpline.com" target="_blank" rel="noreferrer" className="font-medium underline">
          findahelpline.com
        </a>
        .
      </p>
      <button type="button" onClick={onDismiss} className={`${btnGhost} mt-2 text-sm`}>
        {t.crisis.dismiss}
      </button>
    </div>
  );
}
