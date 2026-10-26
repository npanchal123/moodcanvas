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
  const [deleting, setDeleting] = useState(false);
  const syncText = useLiveQuery(() => getMeta<boolean>('syncText'), []) ?? false;

  async function signOut(removeLocal: boolean) {
    if (!supabase) return;
    if (removeLocal && !window.confirm(t.account.signOutRemoveConfirm)) return;
    await supabase.auth.signOut();
    if (removeLocal) await forgetLocalData();
  }

  if (!user) return <SignIn />;

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

type Busy = 'google' | 'send' | 'verify' | null;

/**
 * Signing in and signing up are the same two steps: an email, then the 6-digit code sent to it (a code rather than a
 * link, because a link would open in the browser instead of the app added to the Home Screen). Or Google. Shown
 * switched off, with a note, while this copy of the app has no account server.
 */
function SignIn() {
  const { t } = useI18n();
  const a = t.account;
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState('');

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    if (!supabase) return;
    const to = (sentTo || email).trim();
    setBusy('send');
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({ email: to });
    setBusy(null);
    if (error) setMessage(a.sendFailed(error.message));
    else {
      setSentTo(to);
      setCode('');
      setMessage(a.codeSent(to));
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy('verify');
    setMessage('');
    const { error } = await supabase.auth.verifyOtp({ email: sentTo, token: code.trim(), type: 'email' });
    setBusy(null);
    // On success the account hook sees the new session and this form goes away.
    if (error) setMessage(a.codeFailed(error.message));
  }

  async function google() {
    if (!supabase) return;
    setBusy('google');
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    });
    // On success the page is already on its way to Google.
    if (error) {
      setBusy(null);
      setMessage(a.googleFailed(error.message));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold">{a.signInTitle}</h3>
        <p className="text-(--muted)">{a.intro}</p>
      </div>
      {!supabase && (
        <p className="tint tint-2 flex gap-3 rounded-2xl border p-3 text-sm">
          <span aria-hidden="true">🌱</span>
          {a.notConfigured}
        </p>
      )}
      <fieldset disabled={!supabase || busy != null} className="flex flex-col gap-4">
        <button type="button" onClick={() => void google()} className={`${btnSecondary} w-full`}>
          <GoogleMark />
          {a.google}
        </button>
        <p aria-hidden="true" className="flex items-center gap-3 text-sm text-(--muted)">
          <span className="h-px grow bg-(--border)" />
          {a.or}
          <span className="h-px grow bg-(--border)" />
        </p>
        {sentTo ? (
          <form onSubmit={verify} className="flex flex-col gap-3">
            <label htmlFor="sign-in-code" className="font-medium">
              {a.codeLabel}
            </label>
            <input
              id="sign-in-code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,10}"
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className={`${field} text-center text-2xl tracking-[0.4em]`}
            />
            <button type="submit" className={btnPrimary}>
              {busy === 'verify' ? a.verifying : a.verify}
            </button>
            <div className="flex flex-wrap justify-center gap-1">
              <button type="button" onClick={() => void sendCode()} className={`${btnGhost} text-sm`}>
                {busy === 'send' ? a.sending : a.resend}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSentTo('');
                  setMessage('');
                }}
                className={`${btnGhost} text-sm`}
              >
                {a.changeEmail}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={sendCode} className="flex flex-col gap-3">
            <label htmlFor="sign-in-email" className="font-medium">
              {a.emailLabel}
            </label>
            <input
              id="sign-in-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
            <button type="submit" className={btnPrimary}>
              {busy === 'send' ? a.sending : a.sendCode}
            </button>
            <p className="text-center text-sm text-(--muted)">{a.newHere}</p>
          </form>
        )}
      </fieldset>
      <p role="status" className="min-h-5 text-sm">
        {message}
      </p>
    </div>
  );
}

const field = 'min-h-12 w-full min-w-0 rounded-xl border border-(--border) bg-(--surface) px-3';

/** Google's "G", in its own colours, as its sign-in buttons are expected to show it. */
function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" width="20" height="20">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" />
      <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}
