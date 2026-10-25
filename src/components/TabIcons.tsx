/** Line icons for the phone tab bar, drawn in the current text colour. */

const PATHS: Record<string, string> = {
  // A sparkle: imagining.
  today: 'M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z',
  // A ticked circle.
  habits: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12.3l2.7 2.7L16.2 9.5',
  // A path that gets moving.
  breaker: 'M13 3L5 13.5h6l-1 7.5 8-10.5h-6L13 3z',
  // An open book.
  history: 'M3.5 5.5c2.8-1.2 5.6-1 8.5.8v13c-2.9-1.8-5.7-2-8.5-.8v-13zM20.5 5.5c-2.8-1.2-5.6-1-8.5.8v13c2.9-1.8 5.7-2 8.5-.8v-13z',
  // A gear.
  settings:
    'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19.4 13.5l1.6 1.2-1.8 3.1-1.9-.7a7.4 7.4 0 0 1-2 1.2L15 20.5h-3.6l-.4-2.2a7.4 7.4 0 0 1-2-1.2l-1.9.7-1.8-3.1 1.6-1.2a7.6 7.6 0 0 1 0-2.4L5.3 9.3l1.8-3.1 1.9.7a7.4 7.4 0 0 1 2-1.2l.4-2.2H15l.3 2.2a7.4 7.4 0 0 1 2 1.2l1.9-.7 1.8 3.1-1.6 1.2a7.6 7.6 0 0 1 0 2.4z',
};

export function TabIcon({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[id]} />
    </svg>
  );
}
