export const card = 'glass card-edge rounded-[1.75rem] p-5 sm:p-7';

const btn =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
export const btnPrimary = `${btn} btn-glow text-(--on-accent)`;
export const btnSecondary = `${btn} border border-(--border) bg-(--surface-strong) hover:bg-(--surface-alt)`;
export const btnGhost = `${btn} hover:bg-(--surface-alt)`;

export const dialogOverlay = 'fixed inset-0 bg-[#0b0f24]/55 backdrop-blur-sm';
// .glass sets its own background, so the stronger one is marked important.
export const dialogContent =
  'glass fixed left-1/2 top-1/2 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-3xl bg-(--surface-strong)! p-6 text-(--text)';

export const checkbox = 'h-5 w-5 shrink-0 accent-(--accent)';

export const toggle = (pressed: boolean) =>
  `${btn} border ${pressed ? 'border-(--accent) bg-(--accent-soft) ring-2 ring-(--accent-soft)' : 'border-(--border) bg-(--surface-strong) hover:bg-(--surface-alt)'}`;

/** A chip with its own pastel colour (by position, so neighbours differ); chosen ones fill with the main gradient. */
export const tintChip = (pressed: boolean, i: number) =>
  `${btn} border ${pressed ? 'btn-glow border-transparent text-(--on-accent)' : `tint tint-${i % 6}`}`;
