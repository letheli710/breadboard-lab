// Touch input on the 3D board. A breadboard hole is ~10 px wide on a phone, so a tap never places
// a part directly: it picks the nearest hole as a *candidate* (the ghost part and the hole tooltip
// show there, and a chip names the hole, e.g. "a12", with arrows to nudge it by one hole); a second
// tap on the same hole, or the chip's Place button, commits. A long press shows the hole tooltip
// without picking. Mouse and pen input is unchanged.

import { create } from 'zustand';
import { HOLE_MAP, MAIN_ROWS, holeId, type RowId } from '../core/breadboard';
import { useStore } from '../state/store';

/** pointer type of the latest pointerdown anywhere (a click event does not always carry it) */
let lastPointerType = 'mouse';
if (typeof window !== 'undefined') window.addEventListener('pointerdown', (e) => (lastPointerType = e.pointerType), { capture: true, passive: true });
export const isTouchInput = () => lastPointerType === 'touch';

/** Rows in board order (top to bottom): a nudge up / down crosses the trench and the rails. */
const ROW_ORDER: RowId[] = ['tp', 'tn', ...MAIN_ROWS, 'bp', 'bn'];
export const rowIndex = (r: RowId) => ROW_ORDER.indexOf(r);

/** The hole dc columns right and dr rows down of id (null off the board). */
export function shiftHole(id: string, dc: number, dr: number): string | null {
  const h = HOLE_MAP.get(id);
  if (!h) return null;
  const r = ROW_ORDER[ROW_ORDER.indexOf(h.row) + dr];
  if (!r) return null;
  const n = holeId(r, h.col + dc);
  return HOLE_MAP.has(n) ? n : null;
}

interface TouchPick {
  /** candidate hole waiting for confirmation */
  pending: string | null;
}
export const useTouchPick = create<TouchPick>(() => ({ pending: null }));

export function setPending(h: string | null) {
  useTouchPick.setState({ pending: h });
  useStore.getState().setHoverHole(h);
}

/** Commit the candidate (black: the multimeter's black probe). */
export function confirmPending(black = false) {
  const h = useTouchPick.getState().pending;
  if (!h) return;
  useTouchPick.setState({ pending: null });
  useStore.getState().clickHole(h, black);
  // keep the tooltip on the hole just used until the next tap
  useStore.getState().setHoverHole(h);
}

/** A tap on a hole with a finger. */
export function touchTapHole(h: string) {
  const s = useStore.getState();
  if (s.tool === 'select') {
    // select mode: a tap shows (or hides) the hole tooltip, and selects the part in it, as a click does
    s.setHoverHole(s.hoverHole === h ? null : h);
    s.clickHole(h);
    return;
  }
  if (useTouchPick.getState().pending === h) confirmPending();
  else setPending(h);
}

/** Long press on a hole: the hover tooltip, nothing else. */
export function touchLongPressHole(h: string) {
  useStore.getState().setHoverHole(h);
}

// a new tool, a page change or a finished / cancelled placement drops the candidate
if (typeof window !== 'undefined')
  useStore.subscribe((s, prev) => {
    if (s.tool !== prev.tool || s.mode !== prev.mode || (prev.firstHole && !s.firstHole && s.layout === prev.layout)) {
      if (useTouchPick.getState().pending) useTouchPick.setState({ pending: null });
    }
  });
