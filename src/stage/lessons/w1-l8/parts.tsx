// Small pieces shared by W1-L8's two layers: a tween hook (skipped under prefers-reduced-motion),
// geometry helpers and a resistor box with a subscripted name and a live value.

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { useStage } from '../../stageStore';

export type Pt = [number, number];
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lerpPt = (p: Pt, q: Pt, k: number): Pt => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
export const mid = (p: Pt, q: Pt): Pt => lerpPt(p, q, 0.5);
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

/** `target`, eased over `msPerUnit` × |jump| ms; small steps (a slider being dragged) and
 *  reduced motion jump straight there. */
export function useTween(target: number, msPerUnit: number): number {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current;
    const jump = Math.abs(target - from);
    let raf = 0;
    const t0 = performance.now();
    const ms = prefersReducedMotion() || jump < 0.06 ? 0 : msPerUnit * jump;
    const tick = (now: number) => {
      const k = ms === 0 ? 1 : Math.min(1, (now - t0) / ms);
      cur.current = from + (target - from) * ease(k);
      setV(cur.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, msPerUnit]);
  return v;
}

/** Pointer handlers that light `ids` on the stage and in the text. */
export function hoverProps(ids: string[]) {
  const set = useStage.getState().setHover;
  return {
    onPointerEnter: () => set(ids),
    onPointerLeave: () => set(null),
  };
}

/** "R_ac" → R with subscript "ac" (SVG). */
export function RName({ sub, main = 'R' }: { sub: string; main?: string }) {
  return (
    <>
      {main}
      <tspan baselineShift="sub" fontSize="72%">
        {sub}
      </tspan>
    </>
  );
}

export interface ResProps {
  at: Pt;
  sub: string;
  value: string;
  tone: 'delta' | 'wye' | 'plain' | 'mid';
  lit?: boolean;
  selected?: boolean;
  opacity?: number;
  width?: number;
  hover?: string[];
  onClick?: () => void;
  label?: string;
}

/** A resistor body: an axis-aligned rounded box over the wire, name and value inside. */
export function Res({ at, sub, value, tone, lit, selected, opacity = 1, width = 70, hover, onClick, label }: ResProps) {
  const h = 20;
  const handlers = hover ? hoverProps(hover) : {};
  return (
    <g
      className={`yd-res ${tone} ${lit ? 'lit' : ''} ${selected ? 'sel' : ''} ${onClick ? 'clickable' : ''}`}
      opacity={opacity}
      transform={`translate(${at[0]} ${at[1]})`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={label}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) : undefined}
      {...handlers}
    >
      <rect x={-width / 2 - 6} y={-h / 2 - 6} width={width + 12} height={h + 12} rx={9} className="yd-res-halo" />
      <rect x={-width / 2} y={-h / 2} width={width} height={h} rx={5} className="yd-res-body" />
      <text y={4.2} textAnchor="middle" className="yd-res-text">
        <RName sub={sub} /> {value}
      </text>
    </g>
  );
}

/** Clear any hover a layer set when it unmounts (an element that disappears gets no pointerleave). */
export function useClearHoverOnUnmount() {
  useEffect(() => () => useStage.getState().setHover(null), []);
}
