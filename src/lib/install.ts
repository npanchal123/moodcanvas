import { useEffect, useState } from 'react';
import { useMediaQuery } from './hooks';

/** Chrome/Edge/Android fire this when the app can be installed; it isn't in the DOM typings yet. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

// Captured at startup, since the event can fire before Settings is ever opened.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferred = event as BeforeInstallPromptEvent;
  listeners.forEach((l) => l());
});
window.addEventListener('appinstalled', () => {
  deferred = null;
  listeners.forEach((l) => l());
});

export type InstallState = 'installed' | 'available' | 'ios' | 'unavailable';

export function useInstall() {
  const [, rerender] = useState(0);
  const standalone = useMediaQuery('(display-mode: standalone)');

  useEffect(() => {
    const listener = () => rerender((n) => n + 1);
    listeners.add(listener);
    return () => void listeners.delete(listener);
  }, []);

  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const state: InstallState = standalone ? 'installed' : deferred ? 'available' : ios ? 'ios' : 'unavailable';

  async function install() {
    if (!deferred) return;
    const event = deferred;
    await event.prompt();
    await event.userChoice;
    deferred = null;
    rerender((n) => n + 1);
  }

  return { state, install };
}
