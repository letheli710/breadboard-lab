// Schematic parts shared by the W5-L4 layers (light stage, pure 2D): colours, layer ids, stage
// params, the hover / highlight wrapper for hover-map objects, and the symbols — resistor zigzag,
// inductor coil, capacitor plates, generic impedance box, DC / AC / current / dependent sources,
// the "short" bar and "open" terminals of a source set to zero, ground, the op-amp triangle,
// port terminals, labels and value bubbles.

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';

export const L1 = '01';
export const L2 = '02';
export const L3 = '03';

/** stage params */
export const P = {
  /** layer 01: circuit (act 1's example 1 / the guided example) */
  sup: 'w54_sup',
  /** layer 01: the frequency universe shown */
  uni: 'w54_uni',
  /** layer 01: draw the zeroed sources as short / open */
  kill: 'w54_kill',
  /** layer 01: time on the waveform (s) */
  t: 'w54_t',
  /** guided example: steps solved (5 = all, uncovered) */
  g: 'w54_g',
  /** layer 02: view */
  eq: 'w54_eq',
  /** layer 02: source-transformation step 0 … 3 */
  st: 'w54_st',
  /** layer 02: dependent-source network, step A (open circuit) / B (test source) */
  ts: 'w54_ts',
  /** layer 02: load at a-b on / off, its R and X */
  load: 'w54_load',
  rl: 'w54_rl',
  xl: 'w54_xl',
  /** layer 02: show the impedance triangle of Z_Th */
  tri: 'w54_tri',
  /** layer 03: ω (rad/s), topology, highlight the virtual short / open */
  w: 'w54_w',
  topo: 'w54_topo',
  vs: 'w54_vs',
} as const;

export type SupPreset = 'ex1' | 'guided';
export type Uni = 'all' | 'dc' | 'w1' | 'w2';
export type EqView = 'source' | 'original' | 'thevenin' | 'norton' | 'test';

export const C = {
  ink: '#1f2a44',
  wire: '#334155',
  muted: '#5f626b',
  faint: '#94a3b8',
  res: '#d97706',
  resT: '#b45309',
  dc: '#d97706',
  dcT: '#b45309',
  w1: '#059669',
  w1T: '#047857',
  w2: '#db2777',
  w2T: '#be185d',
  ind: '#7c3aed',
  indT: '#6d28d9',
  cap: '#0284c7',
  capT: '#0369a1',
  z: '#0284c7',
  zT: '#0369a1',
  dep: '#9333ea',
  depT: '#7e22ce',
  test: '#059669',
  testT: '#047857',
  port: '#059669',
  warn: '#dc2626',
  warnT: '#b91c1c',
  short: '#d97706',
  node: '#a16207',
  amp: '#d97706',
};

export function useP<T>(key: string, fallback: T): [T, (v: T) => void] {
  return useStageParam<T>(key, fallback);
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
export function Obj({ id, box, children, dim }: { id: string; box: [number, number, number, number]; children: ReactNode; dim?: boolean }) {
  const lit = useLit().includes(id);
  const setHover = useStage((s) => s.setHover);
  const [x, y, w, h] = box;
  return (
    <g className={`w54-obj${lit ? ' lit' : ''}${dim ? ' dim' : ''}`} onPointerEnter={() => setHover([id])} onPointerLeave={() => setHover(null)}>
      <rect className="w54-halo" x={x} y={y} width={w} height={h} rx={7} />
      <rect className="w54-hit" x={x} y={y} width={w} height={h} />
      {children}
    </g>
  );
}

export function Wire({ d, color = C.wire, w = 2, dashed }: { d: string; color?: string; w?: number; dashed?: boolean }) {
  return <path d={d} className={`w54-wire${dashed ? ' dashed' : ''}`} stroke={color} strokeWidth={w} />;
}

export function Dot({ x, y, color = C.ink, r = 3.2 }: { x: number; y: number; color?: string; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={color} />;
}

/** zigzag resistor between (x1, y1) and (x2, y2), horizontal or vertical */
export function Res({ x1, y1, x2, y2, color = C.res }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const n = 6;
  const horiz = Math.abs(y2 - y1) < 1e-6;
  const pts = [`${x1},${y1}`];
  for (let k = 0; k < n; k++) {
    const f = (k + 1) / (n + 1);
    const off = k % 2 ? 5 : -5;
    pts.push(horiz ? `${x1 + (x2 - x1) * f},${y1 + off}` : `${x1 + off},${y1 + (y2 - y1) * f}`);
  }
  pts.push(`${x2},${y2}`);
  return <polyline points={pts.join(' ')} className="w54-res" stroke={color} />;
}

/** inductor coil (four humps) between two points on a horizontal or vertical line */
export function Ind({ x1, y1, x2, y2, color = C.ind }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const horiz = Math.abs(y2 - y1) < 1e-6;
  const n = 4;
  let d = `M ${x1} ${y1}`;
  if (horiz) {
    const s = (x2 - x1) / n;
    for (let k = 0; k < n; k++) d += ` a ${s / 2} ${s / 2} 0 0 1 ${s} 0`;
  } else {
    const s = (y2 - y1) / n;
    for (let k = 0; k < n; k++) d += ` a ${s / 2} ${s / 2} 0 0 1 0 ${s}`;
  }
  return <path d={d} fill="none" stroke={color} strokeWidth={2.2} />;
}

/** capacitor: two plates across a vertical (default) or horizontal wire at (x, y) */
export function Cap({ x, y, horiz, color = C.cap }: { x: number; y: number; horiz?: boolean; color?: string }) {
  return horiz ? (
    <g stroke={color} strokeWidth={2.6}>
      <line x1={x - 3.5} y1={y - 10} x2={x - 3.5} y2={y + 10} />
      <line x1={x + 3.5} y1={y - 10} x2={x + 3.5} y2={y + 10} />
    </g>
  ) : (
    <g stroke={color} strokeWidth={2.6}>
      <line x1={x - 10} y1={y - 3.5} x2={x + 10} y2={y - 3.5} />
      <line x1={x - 10} y1={y + 3.5} x2={x + 10} y2={y + 3.5} />
    </g>
  );
}

/** generic impedance box centred at (x, y) */
export function ZBox({ x, y, w, h, color = C.z, fill = '#fff' }: { x: number; y: number; w: number; h: number; color?: string; fill?: string }) {
  return <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={3} fill={fill} stroke={color} strokeWidth={2} />;
}

/** independent DC (or phasor) voltage source on a vertical branch: circle, + on top */
export function VSrc({ x, y, r = 14, color = C.dc, text = C.dcT }: { x: number; y: number; r?: number; color?: string; text?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke={color} strokeWidth={2.2} />
      <text x={x} y={y - r / 2 + 4} className="w54-sym" fill={text}>
        +
      </text>
      <text x={x} y={y + r / 2 + 4} className="w54-sym" fill={text}>
        −
      </text>
    </g>
  );
}

/** AC voltage source: circle with a sine and a small + */
export function AcSrc({ x, y, r = 14, color = C.w1 }: { x: number; y: number; r?: number; color?: string }) {
  const a = r * 0.55;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke={color} strokeWidth={2.2} />
      <path d={`M ${x - a} ${y} q ${a / 2} ${-a} ${a} 0 t ${a} 0`} fill="none" stroke={color} strokeWidth={2} />
      <text x={x + r + 1} y={y - r + 6} className="w54-tick" fill={color}>
        +
      </text>
    </g>
  );
}

/** current source: circle (or diamond for a dependent one) with an arrow up / down / left / right */
export function ISrc({ x, y, r = 14, dir = 'up', color = C.w2, dep }: { x: number; y: number; r?: number; dir?: 'up' | 'down' | 'left' | 'right'; color?: string; dep?: boolean }) {
  const a = r * 0.6;
  const v = dir === 'up' || dir === 'down';
  const s = dir === 'up' || dir === 'left' ? -1 : 1;
  const shaft = v ? `M ${x} ${y - s * a} V ${y + s * (a - 5)}` : `M ${x - s * a} ${y} H ${x + s * (a - 5)}`;
  const tip = v ? [x, y + s * a] : [x + s * a, y];
  const head = v
    ? `${tip[0]},${tip[1]} ${x - 4.5},${tip[1] - s * 7} ${x + 4.5},${tip[1] - s * 7}`
    : `${tip[0]},${tip[1]} ${tip[0] - s * 7},${y - 4.5} ${tip[0] - s * 7},${y + 4.5}`;
  return (
    <g>
      {dep ? (
        <polygon points={`${x},${y - r - 2} ${x + r + 2},${y} ${x},${y + r + 2} ${x - r - 2},${y}`} fill="#fff" stroke={color} strokeWidth={2.2} />
      ) : (
        <circle cx={x} cy={y} r={r} fill="#fff" stroke={color} strokeWidth={2.2} />
      )}
      <path d={shaft} stroke={color} strokeWidth={2} fill="none" />
      <polygon points={head} fill={color} />
    </g>
  );
}

/** a zeroed voltage source (or an inductor at DC): a thick amber short between y1 and y2 (vertical) or x1 … x2 */
export function Short({
  x1,
  y1,
  x2,
  y2,
  label,
  lx,
  ly,
  anchor = 'start',
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  lx?: number;
  ly?: number;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.short} strokeWidth={3.4} strokeLinecap="round" />
      {label && <Lbl x={lx ?? x1} y={ly ?? y1} s={label} color={C.dcT} anchor={anchor} cls="w54-tag" />}
    </g>
  );
}

/** a zeroed current source (or a capacitor at DC): an open gap on a vertical branch, two hollow terminals */
export function Open({
  x,
  y1,
  y2,
  color = C.muted,
  label,
  lx,
  ly,
  anchor = 'start',
}: {
  x: number;
  y1: number;
  y2: number;
  color?: string;
  label?: string;
  lx?: number;
  ly?: number;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <g>
      <circle cx={x} cy={y1} r={3.4} fill="#fff" stroke={color} strokeWidth={1.8} />
      <circle cx={x} cy={y2} r={3.4} fill="#fff" stroke={color} strokeWidth={1.8} />
      {label && <Lbl x={lx ?? x + 7} y={ly ?? (y1 + y2) / 2 + 4} s={label} color={C.muted} anchor={anchor} cls="w54-tag" />}
    </g>
  );
}

/** port terminal (hollow) */
export function Port({ x, y, name, below }: { x: number; y: number; name: string; below?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={4.2} fill="#fff" stroke={C.port} strokeWidth={2.2} />
      <text x={x} y={below ? y + 18 : y - 9} className="w54-lbl" fill={C.port} textAnchor="middle">
        {name}
      </text>
    </g>
  );
}

/** ground symbol hanging below (x, y) */
export function Gnd({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={C.wire} strokeWidth={1.8} strokeLinecap="round">
      <line x1={x - 8} y1={y} x2={x + 8} y2={y} />
      <line x1={x - 5} y1={y + 3.5} x2={x + 5} y2={y + 3.5} />
      <line x1={x - 2} y1={y + 7} x2={x + 2} y2={y + 7} />
    </g>
  );
}

/** a dashed box with "?" in place of a value the guided example has not reached yet */
export function Mask({ x, y, w, h, text = '?' }: { x: number; y: number; w: number; h: number; text?: string }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={6} className="w54-mask" />
      <text x={x} y={y + 4} className="w54-lbl" textAnchor="middle" fill={C.muted}>
        {text}
      </text>
    </g>
  );
}

/** SVG text with subscripts: "V_Th" → V, then "Th" set low and small, then the rest */
export function Subs({ s }: { s: string }) {
  const parts = s.split(/(?<=[A-Za-zα-ωΩ])_([A-Za-z0-9]+)/);
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

/** the same for HTML: "V_Th" → V<sub>Th</sub> */
export function HSubs({ s }: { s: string }) {
  const parts = s.split(/(?<=[A-Za-zα-ωΩ])_([A-Za-z0-9]+)/);
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
  cls = 'w54-lbl',
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

/** a value bubble */
export function Bubble({ x, y, text, color, anchor = 'middle' }: { x: number; y: number; text: string; color: string; anchor?: 'start' | 'middle' | 'end' }) {
  const w = Math.max(28, subsLen(text) * 6 + 12);
  const bx = anchor === 'middle' ? x - w / 2 : anchor === 'start' ? x : x - w;
  return (
    <g>
      <rect x={bx} y={y - 10} width={w} height={16} rx={8} fill="#fff" stroke={color} strokeWidth={1.3} />
      <text x={bx + w / 2} y={y + 2.5} className="w54-val" fill={color} textAnchor="middle">
        <Subs s={text} />
      </text>
    </g>
  );
}

/** segmented control (radio group) */
export function Seg<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; text: string; short?: string; hot?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="w54-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <SegBtn key={o.id} on={value === o.id} hot={o.hot} onClick={() => onChange(o.id)}>
          <span className="full">{o.text}</span>
          <span className="short">{o.short ?? o.text}</span>
        </SegBtn>
      ))}
    </div>
  );
}

function SegBtn({ on, hot, onClick, children }: { on: boolean; hot?: string; onClick: () => void; children: ReactNode }) {
  const h = useHot(hot ?? '');
  return (
    <button role="radio" aria-checked={on} className={`${on ? 'on' : ''}${hot && h.lit ? ' lit' : ''}`} onClick={onClick} {...(hot ? h.on : {})}>
      {children}
    </button>
  );
}

/** an on / off switch */
export function Toggle({ on, onChange, children }: { on: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <button className={`w54-tog${on ? ' on' : ''}`} role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span className="knob" aria-hidden />
      {children}
    </button>
  );
}

/** a readout cell linked to a hover-map id */
export function Cell({ id, k, v, tone }: { id: string; k: string; v: string; tone?: string }) {
  const hot = useHot(id);
  return (
    <div className={`w54-cell${hot.lit ? ' lit' : ''}`} {...hot.on}>
      <span className="k">
        <HSubs s={k} />
      </span>
      <b style={tone ? { color: tone } : undefined}>
        <HSubs s={v} />
      </b>
    </div>
  );
}
