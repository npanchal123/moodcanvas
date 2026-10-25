import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { keepAppFresh } from './appUpdate';

type Handler = () => void;

/** Just enough of a browser: event targets for window, document and the service worker, and a reload spy. */
function fakeBrowser({ controller = {} as object | null, sessionOpen = false } = {}) {
  const on = () => {
    const handlers: Record<string, Handler[]> = {};
    return {
      handlers,
      addEventListener: (type: string, fn: Handler) => (handlers[type] ??= []).push(fn),
      fire: (type: string) => handlers[type]?.forEach((fn) => fn()),
    };
  };
  const win = on();
  const doc = { ...on(), hidden: false, getElementById: () => (sessionOpen ? {} : null), querySelectorAll: () => [] };
  const update = vi.fn(() => Promise.resolve());
  const sw = { ...on(), controller, getRegistration: () => Promise.resolve({ update }) };
  const reload = vi.fn();
  vi.stubGlobal('window', { ...win, location: { reload } });
  vi.stubGlobal('document', doc);
  vi.stubGlobal('navigator', { serviceWorker: sw });
  return { win, doc, sw, update, reload };
}

describe('keepAppFresh', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('switches to a new version that arrives right after opening', () => {
    const b = fakeBrowser();
    keepAppFresh();
    b.sw.fire('controllerchange');
    expect(b.reload).toHaveBeenCalledOnce();
  });

  it('never switches on the very first install', () => {
    const b = fakeBrowser({ controller: null });
    keepAppFresh();
    b.sw.fire('controllerchange');
    expect(b.reload).not.toHaveBeenCalled();
  });

  it('waits for next time once the person has tapped, or a session is open', () => {
    const tapped = fakeBrowser();
    keepAppFresh();
    tapped.win.fire('pointerdown');
    tapped.sw.fire('controllerchange');
    expect(tapped.reload).not.toHaveBeenCalled();
    vi.unstubAllGlobals();

    const inSession = fakeBrowser({ sessionOpen: true });
    keepAppFresh();
    inSession.sw.fire('controllerchange');
    expect(inSession.reload).not.toHaveBeenCalled();
  });

  it('checks again when the app comes back after a while, but not after a quick glance away', async () => {
    const b = fakeBrowser();
    keepAppFresh();
    const away = (ms: number) => {
      b.doc.hidden = true;
      b.doc.fire('visibilitychange');
      vi.advanceTimersByTime(ms);
      b.doc.hidden = false;
      b.doc.fire('visibilitychange');
    };
    away(5_000);
    await vi.runAllTimersAsync();
    expect(b.update).not.toHaveBeenCalled();

    away(5 * 60_000);
    await vi.runAllTimersAsync();
    expect(b.update).toHaveBeenCalledOnce();

    // Late arrivals don't interrupt: only soon after the check.
    vi.advanceTimersByTime(60_000);
    b.sw.fire('controllerchange');
    expect(b.reload).not.toHaveBeenCalled();
  });
});
