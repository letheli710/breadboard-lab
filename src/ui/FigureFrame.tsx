// A frame around a figure's <svg> (circuit diagram, directed graph, u–i plot). Fitting a wide
// figure into a phone's width shrinks its labels until they can't be read, so the frame never
// lets the smallest label drop below MIN_LABEL_PX: below that the figure keeps a readable scale and
// scrolls sideways inside its own box (edge shadows + a "swipe" chip say so). A button opens the
// figure full screen, where it can be pinch-zoomed / wheel-zoomed and dragged (Esc or ✕ closes).

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { tr } from '../core/i18n';

/** smallest rendered label size (CSS px) a figure may shrink to */
export const MIN_LABEL_PX = 11;

// no layout effects during server rendering (tests render to static markup)
const useIsoLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;

/** Smallest rendered font size (CSS px) of the <text> labels of an svg, or Infinity. */
export function minLabelPx(svg: SVGSVGElement): number {
  let min = Infinity;
  for (const t of svg.querySelectorAll('text')) {
    if (!t.textContent?.trim()) continue;
    const ctm = t.getScreenCTM();
    if (!ctm) continue;
    const px = parseFloat(getComputedStyle(t).fontSize) * Math.hypot(ctm.a, ctm.b);
    if (px > 0 && px < min) min = px;
  }
  return min;
}

export function FigureFrame({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ can: false, left: false, right: false });
  const [open, setOpen] = useState(false);

  // keep labels readable: widen the svg (a min-width) when fitting would shrink them too far.
  // Measured once and on resize only: re-measuring on every render (a hover highlight re-renders
  // the figure) would briefly reset the width, and the page could jump between a tap's down and up.
  useIsoLayoutEffect(() => {
    const el = box.current;
    const svg = el?.querySelector('svg');
    if (!el || !svg) return;
    let lastW = -1;
    // a figure's own inline min-width (SchematicView sets one) is the floor
    const baseMin = svg.style.minWidth;
    const fit = () => {
      const w = el.clientWidth;
      if (w === lastW) return;
      lastW = w;
      svg.style.minWidth = baseMin;
      svg.style.maxHeight = '';
      const px = minLabelPx(svg);
      if (Number.isFinite(px) && px < MIN_LABEL_PX) {
        const k = MIN_LABEL_PX / px;
        svg.style.minWidth = `${Math.ceil(svg.getBoundingClientRect().width * k)}px`;
        svg.style.maxHeight = 'none';
      }
      update();
    };
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const can = max > 2;
      const left = can && el.scrollLeft > 2;
      const right = can && el.scrollLeft < max - 2;
      setScroll((s) => (s.can === can && s.left === left && s.right === right ? s : { can, left, right }));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    el.addEventListener('scroll', update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <div className={`fig-frame ${scroll.can ? 'can-scroll' : ''} ${scroll.left ? 'more-left' : ''} ${scroll.right ? 'more-right' : ''} ${className ?? ''}`}>
      <div className="fig-scroll" ref={box} tabIndex={scroll.can ? 0 : undefined} role={scroll.can ? 'region' : undefined} aria-label={scroll.can ? label : undefined}>
        {children}
      </div>
      <div className="fig-tools">
        {scroll.can && (
          <span className="fig-swipe" aria-hidden>
            ← {tr('左右滑动查看', 'swipe to see all')} →
          </span>
        )}
        <button className="fig-zoom" onClick={() => setOpen(true)} title={tr('全屏查看（可缩放）', 'View full screen (zoomable)')}>
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden>
            <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span>{tr('放大', 'Enlarge')}</span>
        </button>
      </div>
      {open && (
        <FigureViewer label={label} onClose={() => setOpen(false)}>
          {children}
        </FigureViewer>
      )}
    </div>
  );
}

/** Full-screen figure: pinch / wheel to zoom, drag to pan, double-tap to reset; Esc or ✕ closes. */
function FigureViewer({ children, label, onClose }: { children: ReactNode; label: string; onClose: () => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [t, setT] = useState({ s: 1, x: 0, y: 0 });
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab') {
        // the close button is the only focusable control: keep focus in the dialog
        e.preventDefault();
        closeBtn.current?.focus();
      } else if (e.key === '+' || e.key === '=') setT((v) => ({ ...v, s: Math.min(8, v.s * 1.25) }));
      else if (e.key === '-') setT((v) => ({ ...v, s: Math.max(0.5, v.s / 1.25) }));
    };
    window.addEventListener('keydown', onKey, true);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = overflow;
      if (prev && document.contains(prev)) prev.focus();
    };
  }, [onClose]);

  // pointer gestures: one pointer pans, two pointers pinch-zoom around their midpoint
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const pts = new Map<number, { x: number; y: number }>();
    let last: { cx: number; cy: number; d: number } | null = null;
    let lastTap = 0;
    const gesture = () => {
      const p = [...pts.values()];
      if (p.length === 0) return null;
      const cx = p.reduce((a, q) => a + q.x, 0) / p.length;
      const cy = p.reduce((a, q) => a + q.y, 0) / p.length;
      const d = p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
      return { cx, cy, d };
    };
    /** zoom by k around client point (cx, cy) */
    const zoomAt = (k: number, cx: number, cy: number) => {
      const r = el.getBoundingClientRect();
      const ox = cx - r.left - r.width / 2;
      const oy = cy - r.top - r.height / 2;
      setT((v) => {
        const s = Math.min(8, Math.max(0.5, v.s * k));
        const kk = s / v.s;
        return { s, x: ox - (ox - v.x) * kk, y: oy - (oy - v.y) * kk };
      });
    };
    const down = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      last = gesture();
      if (pts.size === 1) {
        const now = performance.now();
        if (now - lastTap < 300) setT({ s: 1, x: 0, y: 0 });
        lastTap = now;
      }
    };
    const move = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const g = gesture();
      if (!g || !last) return;
      const dx = g.cx - last.cx;
      const dy = g.cy - last.cy;
      setT((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
      if (g.d && last.d) zoomAt(g.d / last.d, g.cx, g.cy);
      last = g;
    };
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      last = gesture();
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
    };
  }, []);

  return createPortal(
    <div className="fig-viewer" role="dialog" aria-modal="true" aria-label={label}>
      <div className="fig-viewer-bar">
        <span className="fig-viewer-hint">{tr('双指缩放 · 拖动平移 · 双击复原', 'Pinch or scroll to zoom · drag to pan · double-tap to reset')}</span>
        <button className="fig-viewer-btn" onClick={() => setT((v) => ({ ...v, s: Math.max(0.5, v.s / 1.25) }))} aria-label={tr('缩小', 'Zoom out')}>
          −
        </button>
        <button className="fig-viewer-btn" onClick={() => setT((v) => ({ ...v, s: Math.min(8, v.s * 1.25) }))} aria-label={tr('放大', 'Zoom in')}>
          +
        </button>
        <button ref={closeBtn} className="fig-viewer-btn close" onClick={onClose} aria-label={tr('关闭 (Esc)', 'Close (Esc)')}>
          ✕
        </button>
      </div>
      <div className="fig-viewer-stage" ref={stage}>
        <div className="fig-viewer-content" style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})` }}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
