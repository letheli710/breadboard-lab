// The divider between the workbench and the side panel: drag it to give the board or the lesson
// more room, double-click to go back to the default width, drag it to the right edge (or press
// Enter) to hide the panel. Arrow keys move it. The width is remembered (state/benchUi.ts).

import { useRef } from 'react';
import { tr } from '../core/i18n';
import { useBenchUi } from '../state/benchUi';

const MIN = 280;
/** below this the panel snaps shut */
const COLLAPSE_AT = 190;
/** the board keeps at least this much */
const BOARD_MIN = 420;
const STEP = 24;

/** Width the panel would have at the default layout (the CSS value). */
const cssDefault = (main: HTMLElement) => parseFloat(getComputedStyle(main).getPropertyValue('--side-w-default')) || 440;

export function Splitter() {
  const sideW = useBenchUi((s) => s.sideW);
  const collapsed = useBenchUi((s) => s.sideCollapsed);
  const setSide = useBenchUi((s) => s.setSide);
  const el = useRef<HTMLDivElement>(null);
  // the pointer-down below suppresses the browser's dblclick: count presses ourselves
  const lastPress = useRef(0);
  const main = () => el.current?.parentElement ?? null;
  const maxW = () => Math.max(MIN, (main()?.clientWidth ?? 1200) - BOARD_MIN);
  const current = () => {
    const m = main();
    return sideW ?? (m ? cssDefault(m) : 440);
  };

  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const m = main();
    if (!m) return;
    e.preventDefault();
    if (e.timeStamp - lastPress.current < 400) {
      lastPress.current = 0;
      setSide(null, false);
      return;
    }
    lastPress.current = e.timeStamp;
    el.current?.setPointerCapture(e.pointerId);
    m.classList.add('resizing');
    const move = (ev: PointerEvent) => {
      const w = m.getBoundingClientRect().right - ev.clientX - 8;
      if (w < COLLAPSE_AT) setSide(useBenchUi.getState().sideW, true);
      else setSide(Math.round(Math.max(MIN, Math.min(maxW(), w))), false);
    };
    const up = () => {
      m.classList.remove('resizing');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const w = current();
    if (e.key === 'ArrowLeft') setSide(Math.min(maxW(), (collapsed ? MIN : w) + (collapsed ? 0 : STEP)), false);
    else if (e.key === 'ArrowRight') {
      if (collapsed) return;
      if (w - STEP < MIN) setSide(sideW, true);
      else setSide(w - STEP, false);
    } else if (e.key === 'Enter') setSide(sideW, !collapsed);
    else if (e.key === 'Home') setSide(null, false);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={el}
      className="splitter"
      role="separator"
      aria-orientation="vertical"
      aria-label={tr('面包板与面板之间的分隔条', 'Divider between the board and the panel')}
      aria-valuenow={collapsed ? 0 : Math.round(current())}
      aria-valuemin={0}
      aria-valuemax={Math.round(maxW())}
      tabIndex={0}
      title={tr('拖动调整宽度 · 双击复原 · 拖到最右收起面板', 'Drag to resize · double-click to reset · drag to the right edge to hide the panel')}
      onPointerDown={onDown}
      onKeyDown={onKey}
    />
  );
}
