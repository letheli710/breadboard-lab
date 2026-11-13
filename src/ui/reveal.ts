// Keeping the active item of a scrolling list in view (Practice sidebar, Challenges carousel):
// the list scrolls on its own — never the page — so the item is centred, only when it is not
// fully visible already, never while the user is scrolling that list themselves, and without
// animation for users who asked for reduced motion.

import { useCallback, useRef } from 'react';

export const prefersReducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Along one axis: the visible part of the scroller (start / end, screen coordinates), its
 *  current scroll offset and inner size, and where the item is (screen coordinates). */
export interface RevealGeometry {
  viewStart: number;
  viewEnd: number;
  scroll: number;
  /** visible inner size (clientWidth / clientHeight) */
  size: number;
  /** total scrollable size (scrollWidth / scrollHeight) */
  scrollSize: number;
  itemStart: number;
  itemEnd: number;
}

/** The scroll offset that centres the item, or null when it is fully visible (nothing to do). */
export function revealOffset(g: RevealGeometry, force = false): number | null {
  if (!force && g.itemStart >= g.viewStart - 0.5 && g.itemEnd <= g.viewEnd + 0.5) return null;
  const target = g.scroll + (g.itemStart - g.viewStart) - (g.size - (g.itemEnd - g.itemStart)) / 2;
  const max = Math.max(0, g.scrollSize - g.size);
  const t = Math.round(Math.min(max, Math.max(0, target)));
  return t === Math.round(g.scroll) ? null : t;
}

/** Scroll `scroller` (only it) so `item` is centred along `axis` if it is not fully visible. */
export function revealIn(scroller: HTMLElement, item: HTMLElement, axis: 'x' | 'y', instant = false): boolean {
  const c = scroller.getBoundingClientRect();
  const r = item.getBoundingClientRect();
  const y = axis === 'y';
  const top = revealOffset({
    viewStart: y ? c.top + scroller.clientTop : c.left + scroller.clientLeft,
    viewEnd: y ? c.top + scroller.clientTop + scroller.clientHeight : c.left + scroller.clientLeft + scroller.clientWidth,
    scroll: y ? scroller.scrollTop : scroller.scrollLeft,
    size: y ? scroller.clientHeight : scroller.clientWidth,
    scrollSize: y ? scroller.scrollHeight : scroller.scrollWidth,
    itemStart: y ? r.top : r.left,
    itemEnd: y ? r.bottom : r.right,
  });
  if (top === null) return false;
  scroller.scrollTo({ [y ? 'top' : 'left']: top, behavior: instant || prefersReducedMotion() ? 'auto' : 'smooth' });
  return true;
}

/** How long after the user's own wheel / touch / drag / key scrolling a list is left alone. */
export const USER_SCROLL_QUIET_MS = 1200;

/** Callback ref for a scroller, `el()` (the element) and `busy()`: true while the user is (or
 *  was just) scrolling it themselves. The element may come and go (loading states). */
export function useUserScroll<T extends HTMLElement>() {
  const node = useRef<T | null>(null);
  const last = useRef(-Infinity); // (performance.now() starts near 0 at page load)
  const detach = useRef<(() => void) | null>(null);
  const ref = useCallback((el: T | null) => {
    detach.current?.();
    detach.current = null;
    node.current = el;
    if (!el) return;
    const mark = () => (last.current = performance.now());
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) mark();
    };
    const opts = { passive: true } as const;
    el.addEventListener('wheel', mark, opts);
    el.addEventListener('touchmove', mark, opts);
    el.addEventListener('pointerdown', mark, opts); // scrollbar drags, clicks on an item
    el.addEventListener('keydown', onKey);
    detach.current = () => {
      el.removeEventListener('wheel', mark);
      el.removeEventListener('touchmove', mark);
      el.removeEventListener('pointerdown', mark);
      el.removeEventListener('keydown', onKey);
    };
  }, []);
  const el = useCallback(() => node.current, []);
  const busy = useCallback(() => performance.now() - last.current < USER_SCROLL_QUIET_MS, []);
  return { ref, el, busy };
}
