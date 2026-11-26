// Schematic parts shared by the W5-L3 layers (light stage, class prefix w53-): layer ids, stage
// params, colours, the hover / highlight wrapper for hover-map objects, and the symbols: wires,
// impedance boxes, the time-domain R / L / C symbols, independent sources, the CCCS diamond,
// ground, labels with subscripts, value bubbles, segmented controls and readout cells.

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';

export const L1 = '01';
export const L2 = '02';
export const L3 = '03';

/* stage params (set by acts, guided steps and the layer controls) */
/** layer 01: ω of act 1's circuit (rad/s) */
export const P_W = 'w53_w';
/** layer 01: 'time' | 'phasor' */
export const P_DOM = 'w53_dom';
/** layer 01: a second source at another frequency is switched in */
export const P_F2 = 'w53_f2';
/** layer 02: 'ex1' (act 2) | 'guided' (act 4) */
export const P_NC = 'w53_nc';
/** layer 02: selected node 0 (none) | 1 | 2 */
export const P_NODE = 'w53_node';
/** layer 02: trace the CCCS coupling */
export const P_TRACE = 'w53_trace';
/** layer 02: bubbles in 'rect' (a + jb) or 'polar' (M∠θ) */
export const P_COORD = 'w53_coord';
/** layer 02: 'circuit' | 'phasor' */
export const P_VIEW2 = 'w53_v2';
/** guided example: steps solved (5 = finished, everything uncovered) */
export const P_G = 'w53_g';
/** layer 03: 'mesh' | 'trap' */
export const P_MV = 'w53_mv';
/** layer 03: show the supermesh loop */
export const P_SUPER = 'w53_super';
/** layer 03: Cramer stepper position 0 … 4 */
export const P_CR = 'w53_cr';
/** layer 03 trap view: 'same' | 'diff' | 'dc' */
export const P_TRAP = 'w53_trap';

export type Dom = 'time' | 'phasor';
export type NodeCircuit = 'ex1' | 'guided';
export type Coord = 'rect' | 'polar';
export type MeshView = 'mesh' | 'trap';
export type Trap = 'same' | 'diff' | 'dc';

export const C = {
  ink: '#1f2a44',
  wire: '#334155',
  muted: '#5f626b',
  faint: '#94a3b8',
  res: '#b45309',
  resFill: '#fef3c7',
  resT: '#92400e',
  ind: '#7c3aed',
  indFill: '#ede9fe',
  indT: '#5b21b6',
  cap: '#0f766e',
  capFill: '#ccfbf1',
  capT: '#115e59',
  src: '#1d4ed8',
  srcFill: '#eff6ff',
  dep: '#d97706',
  depT: '#b45309',
  n1: '#2563eb',
  n2: '#db2777',
  n2T: '#be185d',
  ix: '#dc2626',
  mesh: '#4f46e5',
  meshT: '#4338ca',
  sup: '#059669',
  supT: '#047857',
  warn: '#e11d48',
  warnT: '#be123c',
  ok: '#047857',
};

export const useP = <T,>(key: string, fallback: T) => useStageParam<T>(key, fallback);

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
export function Obj({ id, box, dim, onClick, children }: { id: string; box: [number, number, number, number]; dim?: boolean; onClick?: () => void; children: ReactNode }) {
  const lit = useLit().includes(id);
  const setHover = useStage((s) => s.setHover);
  const [x, y, w, h] = box;
  return (
    <g
      className={`w53-obj${lit ? ' lit' : ''}${dim ? ' dim' : ''}${onClick ? ' click' : ''}`}
      onPointerEnter={() => setHover([id])}
      onPointerLeave={() => setHover(null)}
      onClick={onClick}
    >
      <rect className="w53-halo" x={x} y={y} width={w} height={h} rx={7} />
      <rect className="w53-hit" x={x} y={y} width={w} height={h} />
      {children}
    </g>
  );
}

export function Wire({ d, color = C.wire, w = 2, dashed }: { d: string; color?: string; w?: number; dashed?: boolean }) {
  return <path d={d} className={`w53-wire${dashed ? ' dashed' : ''}`} stroke={color} strokeWidth={w} />;
}

export function Dot({ x, y, color = C.ink, r = 3.6 }: { x: number; y: number; color?: string; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={color} />;
}

/** an impedance box centred at (x, y), with its value inside */
export function ZBox({
  x,
  y,
  w,
  h,
  fill,
  stroke,
  text,
  label,
  sub,
  cls = 'w53-val',
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  text: string;
  label: string;
  /** a second, smaller line under the value */
  sub?: string;
  cls?: string;
}) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={4} fill={fill} stroke={stroke} strokeWidth={2} />
      <Lbl x={x} y={sub ? y - 3 : y + 4} s={label} color={text} cls={cls} />
      {sub && <Lbl x={x} y={y + 13} s={sub} color={text} cls="w53-tick" />}
    </g>
  );
}

/** width of a box that holds `s` in the 10.5 px tag font */
export const boxW = (s: string, min = 44) => Math.max(min, subsLen(s) * 6.4 + 12);

/** zigzag resistor, vertical between y1 and y2 */
export function ResV({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  const n = 6;
  const d = (y2 - y1) / (n + 1);
  const pts = [`${x},${y1}`];
  for (let k = 0; k < n; k++) pts.push(`${x + (k % 2 ? 5.5 : -5.5)},${y1 + d * (k + 1)}`);
  pts.push(`${x},${y2}`);
  return <polyline points={pts.join(' ')} className="w53-res" />;
}
/** zigzag resistor, horizontal between x1 and x2 */
export function ResH({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const n = 6;
  const d = (x2 - x1) / (n + 1);
  const pts = [`${x1},${y}`];
  for (let k = 0; k < n; k++) pts.push(`${x1 + d * (k + 1)},${y + (k % 2 ? 5.5 : -5.5)}`);
  pts.push(`${x2},${y}`);
  return <polyline points={pts.join(' ')} className="w53-res" />;
}
/** coil, vertical between y1 and y2 (four turns) */
export function CoilV({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  const t = (y2 - y1) / 4;
  let d = `M ${x} ${y1}`;
  for (let k = 0; k < 4; k++) d += ` C ${x + 12} ${y1 + t * k}, ${x + 12} ${y1 + t * (k + 1)}, ${x} ${y1 + t * (k + 1)}`;
  return <path d={d} fill="none" stroke={C.ind} strokeWidth={2.2} />;
}
/** coil, horizontal between x1 and x2 (four turns, bumps up) */
export function CoilH({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const t = (x2 - x1) / 4;
  let d = `M ${x1} ${y}`;
  for (let k = 0; k < 4; k++) d += ` C ${x1 + t * k} ${y - 12}, ${x1 + t * (k + 1)} ${y - 12}, ${x1 + t * (k + 1)} ${y}`;
  return <path d={d} fill="none" stroke={C.ind} strokeWidth={2.2} />;
}
/** capacitor plates on a vertical branch, centred at y */
export function CapV({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={C.cap} strokeWidth={2.8}>
      <line x1={x - 12} y1={y - 5} x2={x + 12} y2={y - 5} />
      <line x1={x - 12} y1={y + 5} x2={x + 12} y2={y + 5} />
    </g>
  );
}
/** capacitor plates on a horizontal branch, centred at x */
export function CapH({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={C.cap} strokeWidth={2.8}>
      <line x1={x - 5} y1={y - 12} x2={x - 5} y2={y + 12} />
      <line x1={x + 5} y1={y - 12} x2={x + 5} y2={y + 12} />
    </g>
  );
}

/** independent current source, arrow up */
export function ISrc({ x, y, r = 16, color = C.src, fill = C.srcFill }: { x: number; y: number; r?: number; color?: string; fill?: string }) {
  const a = r * 0.62;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={color} strokeWidth={2.2} />
      <path d={`M ${x} ${y + a} V ${y - a + 5}`} stroke={color} strokeWidth={2} fill="none" />
      <polygon points={`${x},${y - a} ${x - 4.5},${y - a + 7} ${x + 4.5},${y - a + 7}`} fill={color} />
    </g>
  );
}
/** independent voltage source, + on top */
export function VSrc({ x, y, r = 16, color = C.src, fill = C.srcFill }: { x: number; y: number; r?: number; color?: string; fill?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={color} strokeWidth={2.2} />
      <text x={x} y={y - r / 2 + 4} className="w53-sym" fill={color}>
        +
      </text>
      <text x={x} y={y + r / 2 + 5} className="w53-sym" fill={color}>
        −
      </text>
    </g>
  );
}
/** dependent (controlled) current source: diamond, arrow up */
export function DepISrc({ x, y, r = 18 }: { x: number; y: number; r?: number }) {
  const a = r * 0.55;
  return (
    <g>
      <polygon points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`} fill="#fffbeb" stroke={C.dep} strokeWidth={2.3} />
      <path d={`M ${x} ${y + a} V ${y - a + 5}`} stroke={C.dep} strokeWidth={2} fill="none" />
      <polygon points={`${x},${y - a} ${x - 4.5},${y - a + 7} ${x + 4.5},${y - a + 7}`} fill={C.dep} />
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

/** ground symbol hanging below (x, y) */
export function Gnd({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={C.wire} strokeWidth={1.8} strokeLinecap="round">
      <line x1={x} y1={y - 8} x2={x} y2={y} />
      <line x1={x - 9} y1={y} x2={x + 9} y2={y} />
      <line x1={x - 5.5} y1={y + 4} x2={x + 5.5} y2={y + 4} />
      <line x1={x - 2} y1={y + 8} x2={x + 2} y2={y + 8} />
    </g>
  );
}

/** SVG text with subscripts: "Z_C" → Z, then "C" set low and small, then the rest */
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

/** the same for HTML: "Z_C" → Z<sub>C</sub> */
export function HSubs({ s }: { s: string }) {
  const parts = s.split(/_([A-Za-z0-9]+)/);
  return <>{parts.map((p, i) => (i % 2 === 1 ? <sub key={i}>{p}</sub> : p))}</>;
}

/** visible length of a Subs string (for box widths); CJK characters count double */
export const subsLen = (s: string) => [...s.replace(/_/g, '')].reduce((n, ch) => n + (/[　-鿿＀-￯]/.test(ch) ? 1.8 : 1), 0);

/** a label in the drawing (subscripts via Subs) */
export function Lbl({
  x,
  y,
  s,
  color = C.ink,
  anchor = 'middle',
  cls = 'w53-lbl',
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

/** a value bubble (rounded pill) */
export function Bubble({
  x,
  y,
  text,
  color,
  fill = '#fff',
  anchor = 'middle',
}: {
  x: number;
  y: number;
  text: string;
  color: string;
  fill?: string;
  anchor?: 'start' | 'middle' | 'end';
}) {
  const w = Math.max(30, subsLen(text) * 6.3 + 14);
  const bx = anchor === 'middle' ? x - w / 2 : anchor === 'start' ? x : x - w;
  return (
    <g>
      <rect x={bx} y={y - 10} width={w} height={18} rx={9} fill={fill} stroke={color} strokeWidth={1.4} />
      <text x={bx + w / 2} y={y + 3.5} className="w53-val" fill={color} textAnchor="middle">
        <Subs s={text} />
      </text>
    </g>
  );
}

/** a segmented control (radio group); `short` labels are used on phones */
export function Seg<T extends string>({ label, value, set, items }: { label: string; value: T; set: (v: T) => void; items: { id: T; label: string; short?: string }[] }) {
  return (
    <div className="w53-seg" role="radiogroup" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} role="radio" aria-checked={value === it.id} className={value === it.id ? 'on' : ''} onClick={() => set(it.id)}>
          <span className="full">{it.label}</span>
          <span className="short">{it.short ?? it.label}</span>
        </button>
      ))}
    </div>
  );
}

/** an on/off switch button */
export function Toggle({ on, set, label, short, id }: { on: boolean; set: (v: boolean) => void; label: string; short?: string; id?: string }) {
  const hot = useHot(id ?? '');
  return (
    <button className={`w53-tog${on ? ' on' : ''}${id && hot.lit ? ' lit' : ''}`} aria-pressed={on} onClick={() => set(!on)} {...(id ? hot.on : {})}>
      <span className="full">{label}</span>
      <span className="short">{short ?? label}</span>
    </button>
  );
}

export interface Cell {
  id: string;
  label: string;
  text: string;
  tone?: 'ok' | 'warn' | 'mask';
}

export function Readout({ id, label, text, tone }: Cell) {
  const hot = useHot(id);
  return (
    <div className={`w53-cell${hot.lit ? ' lit' : ''}${tone ? ` ${tone}` : ''}`} {...hot.on}>
      <span className="k">
        <HSubs s={label} />
      </span>
      <b>
        <HSubs s={text} />
      </b>
    </div>
  );
}

/** an arrow from the origin of a phasor plot to z (already scaled to px) */
export function PhArrow({ cx0, cy0, z, color, label, w = 2.4 }: { cx0: number; cy0: number; z: { re: number; im: number }; color: string; label: string; w?: number }) {
  const x = cx0 + z.re;
  const y = cy0 - z.im;
  const L = Math.hypot(z.re, z.im);
  if (L < 1) return null;
  const ux = z.re / L;
  const uy = -z.im / L;
  const hx = x - ux * 8;
  const hy = y - uy * 8;
  const lx = x + ux * 12;
  const ly = y + uy * 12 + 4;
  return (
    <g>
      <line x1={cx0} y1={cy0} x2={hx} y2={hy} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x},${y} ${hx - uy * 4.5},${hy + ux * 4.5} ${hx + uy * 4.5},${hy - ux * 4.5}`} fill={color} />
      <Lbl x={lx} y={ly} s={label} color={color} cls="w53-val" anchor={ux > 0.3 ? 'start' : ux < -0.3 ? 'end' : 'middle'} />
    </g>
  );
}
