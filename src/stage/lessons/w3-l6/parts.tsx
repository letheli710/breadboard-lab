// Schematic parts shared by the W3-L6 layers (light stage): colours, layer ids, resistor zigzags,
// the op-amp triangle, ground, value bubbles and the hover / highlight wrapper for hover-map objects.

import type { ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';

export const L1 = 'layer_01';
export const L2 = 'layer_02';
export const L3 = 'layer_03';

export const C = {
  ink: '#1f2a44',
  wire: '#334155',
  muted: '#5f626b',
  faint: '#94a3b8',
  res: '#d97706',
  resT: '#b45309',
  v1: '#0284c7',
  v1T: '#0369a1',
  v2: '#059669',
  v2T: '#047857',
  node: '#a16207',
  out: '#7c3aed',
  outT: '#6d28d9',
  hum: '#d97706',
  humT: '#b45309',
  bad: '#dc2626',
  badT: '#b91c1c',
  good: '#047857',
};

/** guided-example progress on the Ex 5.7 numbers: steps solved (5 = the whole example, uncovered) */
export function useEx57(): [number, (n: number) => void] {
  return useStageParam('w36_ex', 0);
}

/** An HTML control linked to a hover-map id: whether it is lit, and its pointer handlers. */
export function useHot(id: string) {
  const lit = useLit().includes(id);
  const setHover = useStage((s) => s.setHover);
  return { lit, on: { onPointerEnter: () => setHover([id]), onPointerLeave: () => setHover(null) } };
}

/** A hover-map object on the stage: lights when its id is lit, sets the hover on pointer enter. */
export function Obj({ id, box, children, dim }: { id: string; box: [number, number, number, number]; children: ReactNode; dim?: boolean }) {
  const lit = useLit().includes(id);
  const setHover = useStage((s) => s.setHover);
  const [x, y, w, h] = box;
  return (
    <g className={`w36-obj${lit ? ' lit' : ''}${dim ? ' dim' : ''}`} onPointerEnter={() => setHover([id])} onPointerLeave={() => setHover(null)}>
      <rect className="w36-halo" x={x} y={y} width={w} height={h} rx={7} />
      <rect className="w36-hit" x={x} y={y} width={w} height={h} />
      {children}
    </g>
  );
}

/** zigzag resistor points, horizontal between x1 and x2 */
export function zigH(x1: number, x2: number, y: number, a = 6) {
  const n = 6;
  const d = (x2 - x1) / (n + 1);
  const pts = [`${x1},${y}`];
  for (let k = 0; k < n; k++) pts.push(`${x1 + d * (k + 0.5) + d / 2},${y + (k % 2 ? a : -a)}`);
  pts.push(`${x2},${y}`);
  return pts.join(' ');
}

/** zigzag resistor points, vertical between y1 and y2 */
export function zigV(x: number, y1: number, y2: number, a = 6) {
  const n = 6;
  const d = (y2 - y1) / (n + 1);
  const pts = [`${x},${y1}`];
  for (let k = 0; k < n; k++) pts.push(`${x + (k % 2 ? a : -a)},${y1 + d * (k + 0.5) + d / 2}`);
  pts.push(`${x},${y2}`);
  return pts.join(' ');
}

export function Wire({ d, dashed, color = C.wire, w = 2 }: { d: string; dashed?: boolean; color?: string; w?: number }) {
  return <path d={d} className={`w36-wire${dashed ? ' dashed' : ''}`} stroke={color} strokeWidth={w} />;
}

/** ground symbol hanging below (x, y) */
export function Gnd({ x, y, color = C.wire }: { x: number; y: number; color?: string }) {
  return (
    <g stroke={color} strokeWidth={1.8} strokeLinecap="round">
      <line x1={x - 9} y1={y} x2={x + 9} y2={y} />
      <line x1={x - 5.5} y1={y + 4} x2={x + 5.5} y2={y + 4} />
      <line x1={x - 2} y1={y + 8} x2={x + 2} y2={y + 8} />
    </g>
  );
}

/** op-amp triangle: left edge at x, from y−h/2 to y+h/2, tip at x+w; − input on top, + below */
export function OpAmp({ x, y, w = 70, h = 84 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <polygon points={`${x},${y - h / 2} ${x},${y + h / 2} ${x + w},${y}`} fill="#fff" stroke={C.ink} strokeWidth={2.2} strokeLinejoin="round" />
      <text x={x + 9} y={y - h / 4 + 5} className="w36-sym" fill={C.badT}>
        −
      </text>
      <text x={x + 9} y={y + h / 4 + 5} className="w36-sym" fill={C.good}>
        +
      </text>
    </g>
  );
}

export function Dot({ x, y, color = C.ink, r = 3.6 }: { x: number; y: number; color?: string; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={color} />;
}

/** SVG text with subscripts: "v_b1 = 0" → v, then "b1" set low and small, then the rest */
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
          {p || '\u200b'}
        </tspan>,
      );
  });
  return <>{out}</>;
}

/** visible length of a Subs string (for box widths) */
export const subsLen = (s: string) => [...s.replace(/_/g, '')].length;

/** a value bubble (node voltage, output) */
export function Bubble({ x, y, text, color, anchor = 'middle' }: { x: number; y: number; text: string; color: string; anchor?: 'start' | 'middle' | 'end' }) {
  const w = Math.max(34, subsLen(text) * 6.3 + 12);
  const bx = anchor === 'middle' ? x - w / 2 : anchor === 'start' ? x : x - w;
  return (
    <g>
      <rect x={bx} y={y - 11} width={w} height={18} rx={9} fill="#fff" stroke={color} strokeWidth={1.3} />
      <text x={bx + w / 2} y={y + 2.5} className="w36-val" fill={color} textAnchor="middle">
        <Subs s={text} />
      </text>
    </g>
  );
}
