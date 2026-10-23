import { useEffect, useState } from 'react';
import { EMPTY_BREAKER_DRAFT, type BreakerDraft } from './breaker/types';

/** Fired on `window` after "Delete all my data", so answers still on screen are cleared too. */
export const DATA_CLEARED = 'vizit:data-cleared';

/**
 * The Unstuck answers in progress live in this tab's session storage: they survive a reload, but not closing the
 * tab, and never leave the device.
 */
export const UNSTUCK_DRAFT_KEY = 'moodcanvas.unstuckDraft';

function isDraft(value: unknown): value is BreakerDraft {
  const d = value as BreakerDraft;
  return (
    typeof d === 'object' &&
    d !== null &&
    Number.isInteger(d.step) &&
    d.step >= 0 &&
    d.step <= 3 &&
    typeof d.task === 'string' &&
    Array.isArray(d.situations) &&
    Array.isArray(d.obstacles) &&
    Array.isArray(d.feelings) &&
    typeof d.action === 'string'
  );
}

function load(): BreakerDraft {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(UNSTUCK_DRAFT_KEY) ?? 'null');
    // A saved record from an older version, or a damaged one, starts fresh rather than breaking the page.
    return isDraft(parsed) ? { ...EMPTY_BREAKER_DRAFT, ...parsed } : EMPTY_BREAKER_DRAFT;
  } catch {
    return EMPTY_BREAKER_DRAFT;
  }
}

export function clearSessionDraft(): void {
  try {
    sessionStorage.removeItem(UNSTUCK_DRAFT_KEY);
  } catch {
    // Storage unavailable: nothing was kept.
  }
}

export function useSessionDraft(): [BreakerDraft, (draft: BreakerDraft) => void] {
  const [draft, setDraft] = useState(load);
  useEffect(() => {
    try {
      if (draft === EMPTY_BREAKER_DRAFT) sessionStorage.removeItem(UNSTUCK_DRAFT_KEY);
      else sessionStorage.setItem(UNSTUCK_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Private browsing or full storage: the answers still work, they just won't survive a reload.
    }
  }, [draft]);
  return [draft, setDraft];
}
