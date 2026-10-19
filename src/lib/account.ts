import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { onLocalChange } from './entries';
import { supabase } from './supabase';
import { linkDevice, syncNow } from './sync';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabase != null);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  return { user: session?.user ?? null, loading };
}

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncAt?: string;
  error?: string;
}

const DEBOUNCE_MS = 1500;

/** Keeps a signed-in device in sync: on sign-in, after local edits, when back online or refocused. */
export function useSync(userId: string | null, mergeConfirmMessage: string) {
  const [state, setState] = useState<SyncState>({ status: 'idle' });

  const run = useCallback(async () => {
    if (!userId) return;
    if (!navigator.onLine) {
      setState((s) => ({ ...s, status: 'offline' }));
      return;
    }
    setState((s) => ({ ...s, status: 'syncing' }));
    try {
      await syncNow();
      setState({ status: 'idle', lastSyncAt: new Date().toISOString() });
    } catch (err) {
      setState((s) => ({ ...s, status: 'error', error: (err as Error).message }));
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setState({ status: 'idle' });
      return;
    }
    let cancelled = false;
    void linkDevice(userId, () => window.confirm(mergeConfirmMessage)).then(() => {
      if (!cancelled) void run();
    });

    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = onLocalChange(() => {
      clearTimeout(timer);
      timer = setTimeout(() => void run(), DEBOUNCE_MS);
    });
    const onOnline = () => void run();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void run();
    };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubscribe();
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // The message only matters at sign-in time; re-running sync when the language changes would be wasteful.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, run]);

  return { ...state, syncNow: run };
}
