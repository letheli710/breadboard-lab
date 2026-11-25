// Schematic parts shared by the W2-L5 layers (light stage): colours, resistor zigzags, the source
// symbols (circle = independent, diamond = dependent), the zeroed replacements (short / open),
// animated branch-current arrows, and the hover / highlight wrapper for hover-map objects.

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage } from '../../stageStore';

export const C = {
  ink: '#1f2a44',
  wire: '#334155',
  muted: '#5f626b',
  res: '#d97706',
  resT: '#b45309',
  vs: '#0284c7',
  vsT: '#0369a1',
  is: '#059669',
  isT: '#047857',
  dep: '#7c3aed',
  depT: '#6d28d9',
  short: '#e11d48',
  shortT: '#be123c',
  open: '#94a3b8',
  total: '#b45309',
};

export const L1 = 'layer_01_source_kill';
export const L2 = 'layer_02_subcircuit_accumulator';
export const L3 = 'layer_03_power_counterexample';

/** Guided steps name the layer they want in the stage param `w5_layer` (the step schema has no
 *  layer field): the layer on show hands over to it, unless the student picked a layer by hand. */
export function useStepLayer(own: string) {
  const want = useStage((s) => s.params.w5_layer) as string | null | undefined;
  const manual = useStage((s) => s.manual);
  useEffect(() => {
    if (want && want !== own && !manual) useStage.setState({ layer: want });
  }, [want, own, manual]);
}

/** An HTML control linked to a hover-map id: whether it is lit, and its pointer handlers. */
export function useHot(id: string) {
  const lit = useLit().includes(id);
  const setHover = useStage((s) => s.setHover);
  return { lit, on: { onPointerEnter: () => setHover([id]), onPointerLeave: () => setHover(null) } };
}

/** A hover-map object on the stage: lights when its id is lit, sets the hover on pointer enter. */
export function Obj({ id, box, children, onClick, label }: { id: string; box: [number, number, number, number]; children: ReactNode; onClick?: () => void; label?: string }) {
  const lit = useLit().includes(id);
  const setHover = useStage((s) => s.setHover);
  const [x, y, w, h] = box;
  return (
    <g
      className={`w5-obj ${lit ? 'lit' : ''} ${onClick ? 'clickable' : ''}`}
      onPointerEnter={() => setHover([id])}
      onPointerLeave={() => setHover(null)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={label}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      <rect className="w5-halo" x={x} y={y} width={w} height={h} rx={8} />
      <rect className="w5-hit" x={x} y={y} width={w} height={h} />
      {children}
    </g>
  );
}

/** zigzag resistor points, horizontal between x1 and x2 */
export function zigH(x1: number, x2: number, y: number, a = 8) {
  const n = 6;
  const d = (x2 - x1) / (n + 1);
  const pts = [`${x1},${y}`];
  for (let k = 0; k < n; k++) pts.push(`${x1 + d * (k + 0.5) + d / 2},${y + (k % 2 ? a : -a)}`);
  pts.push(`${x2},${y}`);
  return pts.join(' ');
}

/** zigzag resistor points, vertical between y1 and y2 */
export function zigV(x: number, y1: number, y2: number, a = 8) {
  const n = 6;
  const d = (y2 - y1) / (n + 1);
  const pts = [`${x},${y1}`];
  for (let k = 0; k < n; k++) pts.push(`${x + (k % 2 ? a : -a)},${y1 + d * (k + 0.5) + d / 2}`);
  pts.push(`${x},${y2}`);
  return pts.join(' ');
}

export function Wire({ d, dashed, color = C.wire }: { d: string; dashed?: boolean; color?: string }) {
  return <path d={d} className={`w5-wire ${dashed ? 'dashed' : ''}`} stroke={color} />;
}

/** independent voltage source, + on top */
export function VSrc({ x, y, r = 19 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke={C.vs} strokeWidth={2.4} />
      <text x={x} y={y - 4} className="w5-sym" fill={C.vsT}>
        +
      </text>
      <text x={x} y={y + 13} className="w5-sym" fill={C.vsT}>
        −
      </text>
    </g>
  );
}

/** independent current source, arrow up (into the top node) or down */
export function ISrc({ x, y, up, r = 19 }: { x: number; y: number; up: boolean; r?: number }) {
  const s = up ? -1 : 1;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke={C.is} strokeWidth={2.4} />
      <line x1={x} y1={y - s * 11} x2={x} y2={y + s * 9} stroke={C.is} strokeWidth={2.2} />
      <polygon points={`${x - 5},${y + s * 4} ${x},${y + s * 12} ${x + 5},${y + s * 4}`} fill={C.is} />
    </g>
  );
}

/** current-controlled current source (diamond), arrow down */
export function Diamond({ x, y, h = 22 }: { x: number; y: number; h?: number }) {
  return (
    <g>
      <polygon points={`${x},${y - h} ${x + h},${y} ${x},${y + h} ${x - h},${y}`} fill="#faf5ff" stroke={C.dep} strokeWidth={2.4} />
      <line x1={x} y1={y - 11} x2={x} y2={y + 7} stroke={C.dep} strokeWidth={2.2} />
      <polygon points={`${x - 5},${y + 3} ${x},${y + 11} ${x + 5},${y + 3}`} fill={C.dep} />
    </g>
  );
}

/** small padlock (dependent source stays) */
export function Lock({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 7} ${y - 8})`}>
      <circle cx={7} cy={8} r={11} fill="#fff" stroke={C.dep} strokeWidth={1.4} />
      <path d="M 3.5 7 V 4.8 a 3.5 3.5 0 0 1 7 0 V 7" fill="none" stroke={C.dep} strokeWidth={1.6} />
      <rect x={2.2} y={6.8} width={9.6} height={7.4} rx={1.4} fill={C.dep} />
    </g>
  );
}

/** a zeroed voltage source: a heavy short wire with its "v = 0 V" tag */
export function ShortWire({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  const m = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.short} strokeWidth={4.2} strokeLinecap="round" />
      <rect x={x - 25} y={m - 10} width={50} height={20} rx={4} fill="#fff1f2" stroke={C.short} strokeWidth={1.3} />
      <text x={x} y={m + 4} className="w5-tag" textAnchor="middle" fill={C.shortT}>
        v = 0 V
      </text>
    </g>
  );
}

/** a zeroed current source: a dashed branch broken open, a red cross and its "i = 0 A" tag */
export function OpenGap({ x, y1, y2, tagLeft = true }: { x: number; y1: number; y2: number; tagLeft?: boolean }) {
  const m = (y1 + y2) / 2;
  const g = 17;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={m - g} stroke={C.open} strokeWidth={2} strokeDasharray="5 4" />
      <line x1={x} y1={m + g} x2={x} y2={y2} stroke={C.open} strokeWidth={2} strokeDasharray="5 4" />
      <circle cx={x} cy={m - g} r={3.8} fill="#fff" stroke={C.short} strokeWidth={2} />
      <circle cx={x} cy={m + g} r={3.8} fill="#fff" stroke={C.short} strokeWidth={2} />
      <path d={`M ${x - 5} ${m - 5} L ${x + 5} ${m + 5} M ${x + 5} ${m - 5} L ${x - 5} ${m + 5}`} stroke={C.short} strokeWidth={2.2} strokeLinecap="round" />
      <text x={tagLeft ? x - 10 : x + 10} y={m + 4} className="w5-tag" textAnchor={tagLeft ? 'end' : 'start'} fill={C.shortT}>
        i = 0 A
      </text>
    </g>
  );
}

/** An animated branch-current arrow from (x1,y1) to (x2,y2) for positive I (reversed for negative). */
export function Flow({
  x1,
  y1,
  x2,
  y2,
  I,
  color,
  label,
  lx,
  ly,
  anchor = 'start',
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  I: number;
  color: string;
  label?: string;
  lx?: number;
  ly?: number;
  anchor?: 'start' | 'middle' | 'end';
}) {
  const on = Math.abs(I) > 1e-9;
  const [a, b] = I < 0 ? [[x2, y2] as const, [x1, y1] as const] : [[x1, y1] as const, [x2, y2] as const];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const hx = b[0] - ux * 9;
  const hy = b[1] - uy * 9;
  const dur = `${Math.max(0.35, Math.min(2.4, 1.6 / Math.max(Math.abs(I), 0.2)))}s`;
  return (
    <g className="w5-flowgrp">
      {on && (
        <>
          <line x1={a[0]} y1={a[1]} x2={hx} y2={hy} stroke={color} strokeWidth={2.6} className="w5-flow" style={{ animationDuration: dur }} />
          <polygon points={`${b[0]},${b[1]} ${hx - uy * 5},${hy + ux * 5} ${hx + uy * 5},${hy - ux * 5}`} fill={color} />
        </>
      )}
      {label && lx !== undefined && ly !== undefined && (
        <text x={lx} y={ly} className="w5-val" fill={color} textAnchor={anchor}>
          {label}
        </text>
      )}
    </g>
  );
}

/** node dot */
export function Dot({ x, y, color = C.ink }: { x: number; y: number; color?: string }) {
  return <circle cx={x} cy={y} r={4} fill={color} />;
}

/** a value bubble (node voltage, readout) */
export function Bubble({ x, y, text, color, anchor = 'middle' }: { x: number; y: number; text: string; color: string; anchor?: 'start' | 'middle' | 'end' }) {
  const w = Math.max(36, text.length * 6.6 + 12);
  const bx = anchor === 'middle' ? x - w / 2 : anchor === 'start' ? x : x - w;
  return (
    <g>
      <rect x={bx} y={y - 12} width={w} height={19} rx={9.5} fill="#fff" stroke={color} strokeWidth={1.3} />
      <text x={bx + w / 2} y={y + 2} className="w5-val" fill={color} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}
