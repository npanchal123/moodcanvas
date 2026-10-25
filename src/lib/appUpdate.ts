/**
 * Keeps an installed app up to date. Phones often bring the app back from memory instead of loading it afresh, so
 * the browser's own check (on page load) can miss new versions for days. This also checks whenever the app comes
 * back after a while, and switches to the new version straight away, but only if nothing would be lost: the person
 * hasn't tapped or typed since, no session is open and nothing is playing. Otherwise it's used next time.
 */

/** Coming back after this long checks for a new version. */
const RECHECK_AFTER_MS = 60 * 1000;
/** A new version that arrives this soon after a check can still replace the page. */
const SWAP_WINDOW_MS = 20 * 1000;

function busy(): boolean {
  if (document.getElementById('session-heading')) return true;
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking) return true;
  return [...document.querySelectorAll('audio, video')].some((m) => !(m as HTMLMediaElement).paused);
}

export function keepAppFresh(): void {
  if (!('serviceWorker' in navigator)) return;
  const sw = navigator.serviceWorker;
  // The very first install also "changes" the controller; there's nothing to swap then.
  const hadVersion = sw.controller != null;
  let checkedAt = Date.now();
  let touched = false;
  let hiddenAt = 0;

  const touch = () => (touched = true);
  window.addEventListener('pointerdown', touch, true);
  window.addEventListener('keydown', touch, true);

  sw.addEventListener('controllerchange', () => {
    if (hadVersion && !touched && Date.now() - checkedAt < SWAP_WINDOW_MS && !busy()) window.location.reload();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      return;
    }
    if (hiddenAt && Date.now() - hiddenAt < RECHECK_AFTER_MS) return;
    checkedAt = Date.now();
    touched = false;
    void sw
      .getRegistration()
      .then((r) => r?.update())
      .catch(() => {
        // Offline or blocked: the next visit will check again.
      });
  });
}
