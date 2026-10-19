import type { User } from '@supabase/supabase-js';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type FormEvent } from 'react';
import { formatDateTime, useI18n } from '../i18n';
import type { SyncState } from '../lib/account';
import { getMeta } from '../lib/db';
import { supabase } from '../lib/supabase';
import { forgetLocalData, setSyncText } from '../lib/sync';
import { DeleteAccountDialog } from './DeleteAccountDialog';
import { btnGhost, btnPrimary, btnSecondary, checkbox } from './ui';

interface Props {
  user: User | null;
  sync: SyncState & { syncNow: () => Promise<void> };
}

export function AccountPanel({ user, sync }: Props) {
  const { t, locale } = useI18n();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const syncText = useLiveQuery(() => getMeta<boolean>('syncText'), []) ?? false;

  if (!supabase) return <p className="text-(--muted)">{t.account.notConfigured}</p>;
  const client = supabase;

  async function sendLink(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    setMessage(error ? t.account.linkFailed(error.message) : t.account.linkSent);
  }

  async function signOut(removeLocal: boolean) {
    if (removeLocal && !window.confirm(t.account.signOutRemoveConfirm)) return;
    await client.auth.signOut();
    if (removeLocal) await forgetLocalData();
  }

  if (!user) {
    return (
      <form onSubmit={sendLink} className="flex flex-col gap-3">
        <p>{t.account.intro}</p>
        <label htmlFor="email" className="font-medium">
          {t.account.emailLabel}
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-(--border) bg-(--surface) px-3"
          />
          <button type="submit" disabled={sending} className={btnPrimary}>
            {sending ? t.account.sending : t.account.sendLink}
          </button>
        </div>
        <p role="status" className="min-h-5 text-sm">
          {message}
        </p>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p>
        {t.account.signedInAs} <strong className="break-all">{user.email}</strong>
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <p role="status" className="text-sm">
          <span className="font-medium">{t.account.status[sync.status]}</span>
          {sync.status === 'error' && sync.error && <span className="text-(--muted)"> ({sync.error})</span>}
          {sync.lastSyncAt && sync.status === 'idle' && (
            <span className="text-(--muted)">{t.account.lastSynced(formatDateTime(sync.lastSyncAt, locale))}</span>
          )}
        </p>
        <button
          type="button"
          onClick={() => void sync.syncNow()}
          disabled={sync.status === 'syncing'}
          className={`${btnSecondary} text-sm`}
        >
          {t.account.syncNow}
        </button>
      </div>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={syncText}
          onChange={(e) => void setSyncText(e.target.checked)}
          className={`${checkbox} mt-1`}
          aria-describedby="sync-text-hint"
        />
        <span>
          <span className="font-medium">{t.account.syncTextTitle}</span>
          <span id="sync-text-hint" className="block text-sm text-(--muted)">
            {t.account.syncTextHint}
          </span>
        </span>
      </label>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void signOut(false)} className={btnSecondary}>
          {t.account.signOut}
        </button>
        <button type="button" onClick={() => void signOut(true)} className={btnGhost}>
          {t.account.signOutRemove}
        </button>
        <button type="button" onClick={() => setDeleting(true)} className={`${btnGhost} text-(--danger)`}>
          {t.account.deleteAccount}
        </button>
      </div>
      <DeleteAccountDialog open={deleting} onOpenChange={setDeleting} />
    </div>
  );
}
