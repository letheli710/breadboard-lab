// Schematic parts shared by the W4-L6 layers (light stage): colours, layer ids, stage params, the
// hover / highlight wrapper for hover-map objects, and the symbols of the three snapshots: resistor
// zigzags, the two independent sources (what C and L become at t = 0⁺), the "open" terminal pair
// (C in a steady state), arrowheads, the "?" mask, ground, labels and value bubbles.

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import type { Preset } from './model';

export const L1 = '01';
export const L2 = '02';
export const L3 = '03';

/** stage params: circuit preset, view (circuit / waveforms), guided-example steps solved */
export const P_PRESET = 'w46_preset';
export const P_VIEW = 'w46_view';
export const P_GUIDED = 'w46_g';
export type View = 'circuit' | 'wave';

export const C = {
  ink: '#1f2a44',
  wire: '#334155',
  muted: '#5f626b',
  faint: '#94a3b8',
  res: '#d97706',
  resT: '#b45309',
  vsrc: '#d97706',
  vsrcT: '#b45309',
  isrc: '#0284c7',
  isrcT: '#0369a1',
  cap: '#059669',
  capT: '#047857',
  ind: '#7c3aed',
  indT: '#6d28d9',
  warn: '#e11d48',
  warnT: '#be123c',
  node: '#a16207',
};

export function usePreset(): [Preset, (p: Preset) => void] {
  return useStageParam<Preset>(P_PRESET, 'demo');
}
export function useView(): [View, (v: View) => void] {
  return useStageParam<View>(P_VIEW, 'circuit');
}
/** guided-example progress: steps solved (5 = the whole example, uncovered) */
export function useGuided(): [number, (n: number) => void] {
  return useStageParam<number>(P_GUIDED, 0);
}

/** clear a hover left by an object of this layer when the layer goes away */
export function useClearHoverOnUnmount() {
  useEffect(() => () => useStage.getState().setHover(null), []);
}

/** An HTML control linked to a hover-map id: whether it is lit, and its pointer handlers. */
export function useHot(id: string) {
  const lit = useLit().includes(id);
  const setHover = useStage((s) => s.setHover);
  return { lit, on: { onPointerEnter: () => setHover([id]), onPointerLeave: () => setHover(null) } };
}

/** A hover-map object on the stage: lights when its id is lit, sets the hover on pointer enter. */
export function Obj({ id, box, children }: { id: string; box: [number, number, number, number]; children: ReactNode }) {
  const lit = useLit().includes(id);
  const setHover = useStage((s) => s.setHover);
  const [x, y, w, h] = box;
  return (
    <g className={`w46-obj${lit ? ' lit' : ''}`} onPointerEnter={() => setHover([id])} onPointerLeave={() => setHover(null)}>
      <rect className="w46-halo" x={x} y={y} width={w} height={h} rx={7} />
      <rect className="w46-hit" x={x} y={y} width={w} height={h} />
      {children}
    </g>
  );
}

export function Wire({ d, color = C.wire, w = 2, dashed }: { d: string; color?: string; w?: number; dashed?: boolean }) {
  return <path d={d} className={`w46-wire${dashed ? ' dashed' : ''}`} stroke={color} strokeWidth={w} />;
}

export function Dot({ x, y, color = C.ink, r = 3.4 }: { x: number; y: number; color?: string; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={color} />;
}

/** zigzag resistor, horizontal between x1 and x2 */
export function ResH({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const n = 6;
  const d = (x2 - x1) / (n + 1);
  const pts = [`${x1},${y}`];
  for (let k = 0; k < n; k++) pts.push(`${x1 + d * (k + 1)},${y + (k % 2 ? 5.5 : -5.5)}`);
  pts.push(`${x2},${y}`);
  return <polyline points={pts.join(' ')} className="w46-res" />;
}
/** zigzag resistor, vertical between y1 and y2 */
export function ResV({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  const n = 6;
  const d = (y2 - y1) / (n + 1);
  const pts = [`${x},${y1}`];
  for (let k = 0; k < n; k++) pts.push(`${x + (k % 2 ? 5.5 : -5.5)},${y1 + d * (k + 1)}`);
  pts.push(`${x},${y2}`);
  return <polyline points={pts.join(' ')} className="w46-res" />;
}

/** independent voltage source on a vertical branch: circle, + on top */
export function VSrc({ x, y, r = 17, color = C.vsrc, text = C.vsrcT, fill = '#fff' }: { x: number; y: number; r?: number; color?: string; text?: string; fill?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={color} strokeWidth={2.2} />
      <text x={x} y={y - r / 2 + 4} className="w46-sym" fill={text}>
        +
      </text>
      <text x={x} y={y + r / 2 + 5} className="w46-sym" fill={text}>
        −
      </text>
    </g>
  );
}

/** independent current source: circle with an arrow (dir: the arrow's direction) */
export function ISrc({ x, y, r = 16, dir, color = C.isrc, fill = '#fff' }: { x: number; y: number; r?: number; dir: 'up' | 'down' | 'right'; color?: string; fill?: string }) {
  const a = r * 0.62;
  const shaft = dir === 'right' ? `M ${x - a} ${y} H ${x + a - 5}` : dir === 'up' ? `M ${x} ${y + a} V ${y - a + 5}` : `M ${x} ${y - a} V ${y + a - 5}`;
  const head =
    dir === 'right'
      ? `${x + a},${y} ${x + a - 7},${y - 4.5} ${x + a - 7},${y + 4.5}`
      : dir === 'up'
        ? `${x},${y - a} ${x - 4.5},${y - a + 7} ${x + 4.5},${y - a + 7}`
        : `${x},${y + a} ${x - 4.5},${y + a - 7} ${x + 4.5},${y + a - 7}`;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={color} strokeWidth={2.2} />
      <path d={shaft} stroke={color} strokeWidth={2} fill="none" />
      <polygon points={head} fill={color} />
    </g>
  );
}

/** an arrowhead at (x, y) pointing in dir */
export function Arrow({ x, y, dir, color }: { x: number; y: number; dir: 'up' | 'down' | 'right' | 'left'; color: string }) {
  const p =
    dir === 'right'
      ? `${x + 5},${y} ${x - 4},${y - 4.5} ${x - 4},${y + 4.5}`
      : dir === 'left'
        ? `${x - 5},${y} ${x + 4},${y - 4.5} ${x + 4},${y + 4.5}`
        : dir === 'down'
          ? `${x},${y + 5} ${x - 4.5},${y - 4} ${x + 4.5},${y - 4}`
          : `${x},${y - 5} ${x - 4.5},${y + 4} ${x + 4.5},${y + 4}`;
  return <polygon points={p} fill={color} />;
}

/** two hollow terminals of an open circuit on a vertical branch (C in a steady state) */
export function OpenV({ x, y1, y2, color = C.cap }: { x: number; y1: number; y2: number; color?: string }) {
  return (
    <g>
      <circle cx={x} cy={y1} r={3.6} fill="#fff" stroke={color} strokeWidth={2} />
      <circle cx={x} cy={y2} r={3.6} fill="#fff" stroke={color} strokeWidth={2} />
    </g>
  );
}

/** a dashed box with "?" in place of an element the guided example has not reached yet */
export function Mask({ x, y, w, h, text = '?' }: { x: number; y: number; w: number; h: number; text?: string }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={6} className="w46-mask" />
      <text x={x} y={y + 4} className="w46-lbl" textAnchor="middle" fill={C.muted}>
        {text}
      </text>
    </g>
  );
}

/** ground symbol hanging below (x, y) */
export function Gnd({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={C.wire} strokeWidth={1.8} strokeLinecap="round">
      <line x1={x - 9} y1={y} x2={x + 9} y2={y} />
      <line x1={x - 5.5} y1={y + 4} x2={x + 5.5} y2={y + 4} />
      <line x1={x - 2} y1={y + 8} x2={x + 2} y2={y + 8} />
    </g>
  );
}

/** SVG text with subscripts: "v_C(0⁻)" → v, then "C" set low and small, then the rest */
export function Subs({ s }: { s: string }) {
  const parts = s.split(/_([A-Za-z0-9]+)/);
  if (parts.length === 1) return <>{s}</>;
  const out: ReactNode[] = [];
  parts.forEach((p, i) => {
    if (i % 2 === 1)
      out.push(
        <tspan key={i} dy={3} fontSize="0.78em">
          {p}
        </tspan>,
      );
    else if (i === 0) out.push(p);
    else
      out.push(
        <tspan key={i} dy={-3}>
          {p || '​'}
        </tspan>,
      );
  });
  return <>{out}</>;
}

/** the same for HTML: "v_C(0⁻)" → v<sub>C</sub>(0⁻) */
export function HSubs({ s }: { s: string }) {
  const parts = s.split(/_([A-Za-z0-9]+)/);
  return <>{parts.map((p, i) => (i % 2 === 1 ? <sub key={i}>{p}</sub> : p))}</>;
}

/** visible length of a Subs string (for box widths); CJK characters count double */
export const subsLen = (s: string) => [...s.replace(/_/g, '')].reduce((n, ch) => n + (/[　-鿿＀-￯]/.test(ch) ? 1.8 : 1), 0);

/** a value bubble */
export function Bubble({ x, y, text, color, anchor = 'middle' }: { x: number; y: number; text: string; color: string; anchor?: 'start' | 'middle' | 'end' }) {
  const w = Math.max(30, subsLen(text) * 6.1 + 12);
  const bx = anchor === 'middle' ? x - w / 2 : anchor === 'start' ? x : x - w;
  return (
    <g>
      <rect x={bx} y={y - 10} width={w} height={17} rx={8.5} fill="#fff" stroke={color} strokeWidth={1.3} />
      <text x={bx + w / 2} y={y + 3} className="w46-val" fill={color} textAnchor="middle">
        <Subs s={text} />
      </text>
    </g>
  );
}

/** a label in the drawing (subscripts via Subs) */
export function Lbl({
  x,
  y,
  s,
  color = C.ink,
  anchor = 'middle',
  cls = 'w46-lbl',
}: {
  x: number;
  y: number;
  s: string;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  cls?: string;
}) {
  return (
    <text x={x} y={y} className={cls} textAnchor={anchor} fill={color}>
      <Subs s={s} />
    </text>
  );
}
