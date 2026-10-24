import { useEffect, useRef, useState } from 'react';
import { DATA_CLEARED } from '../lib/draftStorage';

/**
 * The sky behind everything: colour clouds, stars and shooting stars at night, drifting clouds and sparkles by day,
 * with the moon at night and the sun by day. Those two can be dragged anywhere on the background (not over buttons,
 * fields or cards, which keep working as usual), and stay where they're put. Purely decorative: hidden from screen
 * readers.
 */

interface Friend {
  id: string;
  /** Shown at night (dark theme) or by day (light theme). */
  when: 'night' | 'day';
  className: string;
  /** Where it starts, in % of the window. */
  x: number;
  y: number;
}

const FRIENDS: Friend[] = [
  { id: 'moon', when: 'night', className: 'moon', x: 90, y: 22 },
  { id: 'sun', when: 'day', className: 'sun', x: 89, y: 22 },
];

type Positions = Record<string, { x: number; y: number }>;
export const SKY_KEY = 'moodcanvas.skyPositions';
/** Fired on `window` to put the sun and moon back where they started. */
export const SKY_RESET = 'vizit:sky-reset';

function load(): Positions {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SKY_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? (parsed as Positions) : {};
  } catch {
    return {};
  }
}

/** Places that keep their own pointer: anything you can use, and the cards that hold content. */
const KEEP = 'button, a, input, textarea, select, label, summary, audio, [role="slider"], [contenteditable], .glass, [role="dialog"]';

export function Sky() {
  const [positions, setPositions] = useState<Positions>(load);
  const [dragging, setDragging] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLSpanElement | null>>({});
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SKY_KEY, JSON.stringify(positions));
    } catch {
      // Storage blocked: they still move, they just won't be remembered.
    }
  }, [positions]);

  useEffect(() => {
    const reset = () => setPositions({});
    window.addEventListener(SKY_RESET, reset);
    window.addEventListener(DATA_CLEARED, reset);
    return () => {
      window.removeEventListener(SKY_RESET, reset);
      window.removeEventListener(DATA_CLEARED, reset);
    };
  }, []);

  useEffect(() => {
    /** The visible sky friend under a point, if nothing usable is on top of it. */
    function hit(x: number, y: number, target: EventTarget | null): string | null {
      if (target instanceof Element && target.closest(KEEP)) return null;
      for (const f of [...FRIENDS].reverse()) {
        const el = refs.current[f.id];
        if (!el || Number(getComputedStyle(el).opacity) < 0.2) continue;
        const r = el.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return f.id;
      }
      return null;
    }

    function down(e: PointerEvent) {
      if (e.button !== 0) return;
      const id = hit(e.clientX, e.clientY, e.target);
      if (!id) return;
      const r = refs.current[id]!.getBoundingClientRect();
      drag.current = { id, dx: e.clientX - (r.left + r.width / 2), dy: e.clientY - (r.top + r.height / 2) };
      setDragging(id);
      e.preventDefault(); // No text selection while dragging.
    }

    function move(e: PointerEvent) {
      const d = drag.current;
      if (!d) {
        // Show a hand over anything that can be picked up.
        if (e.pointerType === 'mouse') document.documentElement.classList.toggle('sky-grab', hit(e.clientX, e.clientY, e.target) != null);
        return;
      }
      const x = Math.min(98, Math.max(2, ((e.clientX - d.dx) / window.innerWidth) * 100));
      const y = Math.min(98, Math.max(2, ((e.clientY - d.dy) / window.innerHeight) * 100));
      setPositions((p) => ({ ...p, [d.id]: { x, y } }));
    }

    function up() {
      drag.current = null;
      setDragging(null);
    }

    // On touch screens the page would scroll instead; stop that only when a finger lands on a sky friend.
    function touch(e: TouchEvent) {
      const t = e.touches[0];
      if (t && hit(t.clientX, t.clientY, e.target)) e.preventDefault();
    }

    window.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('touchstart', touch, { passive: false });
    return () => {
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('touchstart', touch);
      document.documentElement.classList.remove('sky-grab');
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('sky-grabbing', dragging != null);
  }, [dragging]);

  return (
    <div className="sky" aria-hidden="true">
      <span className="stars" />
      <span className="stars stars-2" />
      <span className="shooting" />
      <span className="shooting shooting-2" />
      <span className="cloud cloud-1" />
      <span className="cloud cloud-2" />
      <span className="cloud cloud-3" />
      <span className="sparkles" />
      <span className="c1" />
      <span className="c2" />
      <span className="c3" />
      <span className="c4" />
      {FRIENDS.map((f) => {
        const at = positions[f.id] ?? f;
        return (
          <span
            key={f.id}
            ref={(el) => {
              refs.current[f.id] = el;
            }}
            data-friend={f.id}
            className={`sky-friend ${f.when} ${f.className} ${dragging === f.id ? 'is-dragging' : ''}`}
            style={{ left: `${at.x}%`, top: `${at.y}%` }}
          />
        );
      })}
    </div>
  );
}
