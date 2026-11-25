// Schematic parts shared by the W3-L5 layers (light stage, the sheet's palette): layer ids, colours,
// box resistors, the op-amp triangle, ground, sources, current arrows whose width follows |i|
// (reversed and orange when the current runs against its reference), value bubbles, and the
// hover / highlight wrapper for hover-map objects.

import type { ReactNode } from 'react';
import { useLit, useStage } from '../../stageStore';

export const L1 = 'layer_01_virtual_ground';
export const L2 = 'layer_02_weighted_mixer';
export const L3 = 'layer_03_saturation';

export const C = {
  ink: '#1f2a44',
  wire: '#334155',
  muted: '#5f626b',
  ch: ['#1570EF', '#039855', '#DC6803'],
  chT: ['#175CD3', '#027A48', '#B54708'],
  chBg: ['#EFF8FF', '#ECFDF3', '#FFFAEB'],
  node: '#039855',
  nodeT: '#027A48',
  rf: '#D92D20',
  rfT: '#B42318',
  out: '#7A5AF8',
  outT: '#5925DC',
  back: '#E04F16',
  backT: '#C4320A',
  bad: '#D92D20',
  badT: '#B42318',
};

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
    <g className={`w35-obj ${lit ? 'lit' : ''} ${dim ? 'dim' : ''}`} onPointerEnter={() => setHover([id])} onPointerLeave={() => setHover(null)}>
      <rect className="w35-halo" x={x} y={y} width={w} height={h} rx={8} />
      <rect className="w35-hit" x={x} y={y} width={w} height={h} />
      {children}
    </g>
  );
}

export function Wire({ d, color = C.wire, dashed, width = 2 }: { d: string; color?: string; dashed?: boolean; width?: number }) {
  return <path d={d} className={`w35-wire ${dashed ? 'dashed' : ''}`} stroke={color} strokeWidth={width} />;
}

/** a box resistor between x1 and x2 at height y (horizontal) or between y1 and y2 at x (vertical) */
export function ResH({ x1, x2, y, color = C.wire, fill = '#fff' }: { x1: number; x2: number; y: number; color?: string; fill?: string }) {
  return <rect x={x1} y={y - 8} width={x2 - x1} height={16} rx={3} fill={fill} stroke={color} strokeWidth={2} />;
}
export function ResV({ x, y1, y2, color = C.wire }: { x: number; y1: number; y2: number; color?: string }) {
  return <rect x={x - 8} y={y1} width={16} height={y2 - y1} rx={3} fill="#fff" stroke={color} strokeWidth={2} />;
}

export function Ground({ x, y }: { x: number; y: number }) {
  return <path d={`M ${x - 11} ${y} H ${x + 11} M ${x - 7} ${y + 5} H ${x + 7} M ${x - 3} ${y + 10} H ${x + 3}`} stroke={C.wire} strokeWidth={2} fill="none" />;
}

/** op-amp triangle: left edge at x, from y − h/2 to y + h/2, tip at x + w; − input at the upper
 *  quarter, + input at the lower quarter */
export function OpAmp({ x, y, w = 64, h = 70, sat }: { x: number; y: number; w?: number; h?: number; sat?: boolean }) {
  return (
    <g>
      <polygon points={`${x},${y - h / 2} ${x},${y + h / 2} ${x + w},${y}`} fill={sat ? '#FEF3F2' : '#fff'} stroke={sat ? C.bad : '#0F172A'} strokeWidth={2.2} />
      <text x={x + 7} y={y - h / 4 + 5} className="w35-pm">
        −
      </text>
      <text x={x + 7} y={y + h / 4 + 5} className="w35-pm">
        +
      </text>
    </g>
  );
}
export const opIn = (y: number, h = 70) => ({ minus: y - h / 4, plus: y + h / 4 });

/** a voltage source (circle with + / −) and its label to the left or below */
export function Src({ x, y, color, r = 13 }: { x: number; y: number; color: string; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke={color} strokeWidth={2} />
      <text x={x} y={y - 2} className="w35-pm small" fill={color} textAnchor="middle">
        +
      </text>
      <text x={x} y={y + 9} className="w35-pm small" fill={color} textAnchor="middle">
        −
      </text>
    </g>
  );
}

/** A current arrow along a horizontal or vertical segment, drawn for positive I in the a → b
 *  direction; a negative I flips it and turns it orange. Width follows |I| (mA). */
export function Flow({ x1, y1, x2, y2, I, color, show = true }: { x1: number; y1: number; x2: number; y2: number; I: number; color: string; show?: boolean }) {
  if (!show || Math.abs(I) < 1e-6) return null;
  const rev = I < 0;
  const [a, b] = rev ? [[x2, y2] as const, [x1, y1] as const] : [[x1, y1] as const, [x2, y2] as const];
  const col = rev ? C.back : color;
  const w = Math.min(5, Math.max(1.5, 1.5 + Math.abs(I) * 2.5));
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const head = 7 + w;
  const hx = b[0] - ux * head;
  const hy = b[1] - uy * head;
  const hw = 3 + w;
  const dur = `${Math.max(0.35, Math.min(2.4, 0.5 / Math.max(Math.abs(I), 0.05)))}s`;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={hx} y2={hy} stroke={col} strokeWidth={w} className="w35-flow" style={{ animationDuration: dur }} />
      <polygon points={`${b[0]},${b[1]} ${hx - uy * hw},${hy + ux * hw} ${hx + uy * hw},${hy - ux * hw}`} fill={col} />
    </g>
  );
}

/** node dot */
export function Dot({ x, y, color = C.ink, r = 4 }: { x: number; y: number; color?: string; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={color} />;
}

/** output terminal (open circle) */
export function Terminal({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={4} fill="#fff" stroke="#0F172A" strokeWidth={2} />;
}

/** a value bubble (node voltage, current) */
export function Bubble({
  x,
  y,
  text,
  color,
  anchor = 'middle',
  bg = '#fff',
}: {
  x: number;
  y: number;
  text: string;
  color: string;
  anchor?: 'start' | 'middle' | 'end';
  bg?: string;
}) {
  const w = Math.max(34, [...text].length * 6.3 + 12);
  const bx = anchor === 'middle' ? x - w / 2 : anchor === 'start' ? x : x - w;
  return (
    <g>
      <rect x={bx} y={y - 11} width={w} height={18} rx={9} fill={bg} stroke={color} strokeWidth={1.2} />
      <text x={bx + w / 2} y={y + 2.5} className="w35-val" fill={color} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

/** "0.30 mA" or "? mA" while a guided answer is covered */
export const shownOr = (on: boolean, s: string, unit: string) => (on ? `${s} ${unit}` : `? ${unit}`);
