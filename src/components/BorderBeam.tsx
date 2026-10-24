import type { CSSProperties } from 'react';

/**
 * A soft light travelling around the border of the button it sits in (which needs `relative`). For a screen's
 * main action only. Decorative: hidden from screen readers, and off with reduced motion (see `.border-beam`).
 * `color` suits light buttons; the default white suits the gradient ones.
 */
export function BorderBeam({ color }: { color?: string }) {
  return <span aria-hidden="true" className="border-beam" style={color ? ({ '--beam': color } as CSSProperties) : undefined} />;
}
