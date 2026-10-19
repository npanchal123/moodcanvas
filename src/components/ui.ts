export const card = 'rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-sm';

const btn =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';
export const btnPrimary = `${btn} bg-(--accent) text-(--on-accent) hover:bg-(--accent-hover)`;
export const btnSecondary = `${btn} border border-(--border) bg-(--surface) hover:bg-(--surface-alt)`;
export const btnGhost = `${btn} hover:bg-(--surface-alt)`;

export const dialogOverlay = 'fixed inset-0 bg-black/50';
export const dialogContent =
  'fixed left-1/2 top-1/2 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-2xl bg-(--surface) p-6 text-(--text) shadow-xl';

export const checkbox = 'h-5 w-5 shrink-0 accent-(--accent)';

export const toggle = (pressed: boolean) =>
  `${btn} border-2 ${pressed ? 'border-(--accent) bg-(--surface-alt)' : 'border-(--border) bg-(--surface) hover:bg-(--surface-alt)'}`;
