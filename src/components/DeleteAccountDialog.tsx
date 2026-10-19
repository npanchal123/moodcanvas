import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useI18n } from '../i18n';
import { deleteAccount } from '../lib/sync';
import { btnGhost, checkbox, dialogContent, dialogOverlay } from './ui';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({ open, onOpenChange }: Props) {
  const { t } = useI18n();
  const [alsoLocal, setAlsoLocal] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      await deleteAccount(alsoLocal);
      onOpenChange(false);
    } catch (err) {
      setError(t.deleteAccount.failed((err as Error).message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlay} />
        <Dialog.Content className={dialogContent}>
          <Dialog.Title className="text-xl font-semibold">{t.deleteAccount.title}</Dialog.Title>
          <Dialog.Description>{t.deleteAccount.body}</Dialog.Description>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={alsoLocal}
              onChange={(e) => setAlsoLocal(e.target.checked)}
              className={`${checkbox} mt-1`}
              aria-describedby="delete-local-hint"
            />
            <span>
              <span className="font-medium">{t.deleteAccount.alsoLocal}</span>
              <span id="delete-local-hint" className="block text-sm text-(--muted)">
                {t.deleteAccount.keepNote}
              </span>
            </span>
          </label>
          {error && (
            <p role="alert" className="text-sm text-(--danger)">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Dialog.Close className={btnGhost} disabled={busy}>
              {t.deleteAccount.cancel}
            </Dialog.Close>
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={busy}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-(--danger) px-4 font-medium text-(--surface) disabled:opacity-50"
            >
              {busy ? t.deleteAccount.deleting : t.deleteAccount.confirm}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
