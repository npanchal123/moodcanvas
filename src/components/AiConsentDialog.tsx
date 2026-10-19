import * as Dialog from '@radix-ui/react-dialog';
import { useI18n } from '../i18n';
import { btnGhost, btnPrimary, dialogContent, dialogOverlay } from './ui';

interface Props {
  open: boolean;
  onAnswer: (agreed: boolean) => void;
}

/** Plain-language consent before any text leaves the device. */
export function AiConsentDialog({ open, onAnswer }: Props) {
  const { t } = useI18n();
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onAnswer(false)}>
      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlay} />
        <Dialog.Content className={dialogContent}>
          <Dialog.Title className="text-xl font-semibold">{t.consent.title}</Dialog.Title>
          <Dialog.Description>{t.consent.description}</Dialog.Description>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium">{t.consent.whatChanges}</p>
            <ul className="list-disc space-y-1 pl-5">
              {t.consent.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p>
              {t.consent.privacyBefore}{' '}
              <a
                href="https://www.anthropic.com/legal/privacy"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline"
              >
                {t.consent.privacyLink}
              </a>{' '}
              {t.consent.privacyAfter}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => onAnswer(false)} className={btnGhost}>
              {t.consent.decline}
            </button>
            <button type="button" onClick={() => onAnswer(true)} className={btnPrimary}>
              {t.consent.accept}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
