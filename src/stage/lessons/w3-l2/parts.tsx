// W3-L2 stage parts shared by the three layers: layer ids, the stage params, hover links, the
// schematic pieces (op-amp triangle, resistor, sources, ground, node dots, arrows, value badges)
// and the dock controls.
//
// Stage params (set by the acts, the guided steps and the docks):
//   w32_model  layer 01: 'a' the closed loop of Fig. 5.6(a) | 'b' the 741 equivalent of Fig. 5.6(b)
//   w32_a      layer 01: open-loop gain A (default 2×10⁵)
//   w32_fb     layer 02: negative feedback connected       w32_rules layer 02: mark the golden rules
//   w32_xray   layer 02: X-ray of the output stage (the forbidden output-node KCL)
//   w32_step   layer 03: SOP step 0 … 4                    w32_rl    layer 03: load R_L in Ω (0 = none)
//   w32_cmp    layer 03: compare with the real 741         w32_reveal layer 03: show Example 5.2's numbers

import type { ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { EX51 } from './model';
import './w3l2.css';

export const L1 = 'layer_01';
export const L2 = 'layer_02';
export const L3 = 'layer_03';

export function useW32() {
  const [model, setModel] = useStageParam<'a' | 'b'>('w32_model', 'b');
  const [A, setA] = useStageParam('w32_a', EX51.A);
  const [fb, setFb] = useStageParam('w32_fb', true);
  const [rules, setRules] = useStageParam('w32_rules', true);
  const [xray, setXray] = useStageParam('w32_xray', false);
  const [step, setStep] = useStageParam('w32_step', 0);
  const [rl, setRl] = useStageParam('w32_rl', 0);
  const [cmp, setCmp] = useStageParam('w32_cmp', false);
  const [reveal, setReveal] = useStageParam('w32_reveal', false);
  return { model, setModel, A, setA, fb, setFb, rules, setRules, xray, setXray, step, setStep, rl, setRl, cmp, setCmp, reveal, setReveal };
}

/** hover link of a stage object */
export function hoverProps(ids: string[]) {
  return {
    onPointerEnter: () => useStage.getState().setHover(ids),
    onPointerLeave: () => useStage.getState().setHover(null),
  };
}

/** is any of the ids lit? */
export function useIsLit() {
  const lit = useLit();
  return (...ids: string[]) => ids.some((id) => lit.includes(id));
}

/** a stage object: hover link + highlight when lit */
export function Hot({ id, ids, children, className = '' }: { id: string; ids?: string[]; children: ReactNode; className?: string }) {
  const on = useIsLit()(id, ...(ids ?? []));
  return (
    <g className={`w32-obj ${className} ${on ? 'lit' : ''}`} {...hoverProps([id])}>
      {children}
    </g>
  );
}

/* ------------------------------------------------------------- schematic pieces */

export const INK = '#1f2a44';
export const C = {
  ink: INK,
  muted: '#5f626b',
  wire: '#334155',
  amber: '#b45309',
  amberLine: '#d97706',
  blue: '#0369a1',
  blueLine: '#0284c7',
  green: '#15803d',
  greenLine: '#16a34a',
  red: '#b91c1c',
  redLine: '#dc2626',
  pink: '#be185d',
  orange: '#c2410c',
  violet: '#6d28d9',
};

type Pt = [number, number];

export function Wire({ d, color = C.wire, dash, width = 2.4, className }: { d: string; color?: string; dash?: string; width?: number; className?: string }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" className={className} />;
}

/** invisible fat stroke so a thin wire is easy to point at */
export function Hit({ d }: { d: string }) {
  return <path d={d} className="w32-hit" />;
}

export function Dot({ at, color = C.ink, r = 4.5, hollow }: { at: Pt; color?: string; r?: number; hollow?: boolean }) {
  return <circle cx={at[0]} cy={at[1]} r={r} fill={hollow ? '#fff' : color} stroke={color} strokeWidth={hollow ? 2 : 0} />;
}

/** a resistor box between two points on one axis; the leads are drawn by the caller */
export function ResBox({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={3} className="w32-body" fill="#fff" stroke={color} strokeWidth={2.2} />;
}

export function Txt({
  x,
  y,
  children,
  color = C.ink,
  size = 12,
  anchor = 'start',
  weight = 700,
  mono,
}: {
  x: number;
  y: number;
  children: ReactNode;
  color?: string;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
  weight?: number;
  mono?: boolean;
}) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} fontWeight={weight} textAnchor={anchor} fontFamily={mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined}>
      {children}
    </text>
  );
}

/** an independent voltage source (circle, + on top) centred at `at` */
export function VSource({ at, r = 19, color = C.greenLine }: { at: Pt; r?: number; color?: string }) {
  const [x, y] = at;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke={color} strokeWidth={2.2} className="w32-body" />
      <Txt x={x} y={y - 4} anchor="middle" color={C.green} size={13} mono>
        +
      </Txt>
      <Txt x={x} y={y + 13} anchor="middle" color={C.green} size={13} mono>
        −
      </Txt>
    </g>
  );
}

/** a dependent voltage source (diamond, + on top) centred at `at` */
export function Diamond({ at, s = 16, color = C.blueLine }: { at: Pt; s?: number; color?: string }) {
  const [x, y] = at;
  return (
    <g>
      <polygon points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`} fill="#fff" stroke={color} strokeWidth={2.2} className="w32-body" />
      <Txt x={x} y={y - 2} anchor="middle" color={C.blue} size={11} mono>
        +
      </Txt>
      <Txt x={x} y={y + 11} anchor="middle" color={C.blue} size={11} mono>
        −
      </Txt>
    </g>
  );
}

export function Ground({ at, color = C.muted }: { at: Pt; color?: string }) {
  const [x, y] = at;
  return (
    <g stroke={color} strokeWidth={2} strokeLinecap="round">
      <line x1={x - 13} y1={y} x2={x + 13} y2={y} />
      <line x1={x - 8} y1={y + 6} x2={x + 8} y2={y + 6} />
      <line x1={x - 3} y1={y + 12} x2={x + 3} y2={y + 12} />
    </g>
  );
}

/** a straight arrow, head at `to` */
export function Arrow({ from, to, color, width = 2 }: { from: Pt; to: Pt; color: string; width?: number }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const L = Math.hypot(dx, dy) || 1;
  const u: Pt = [dx / L, dy / L];
  const n: Pt = [-u[1], u[0]];
  const h = 8;
  const b: Pt = [to[0] - u[0] * h, to[1] - u[1] * h];
  return (
    <g>
      <line x1={from[0]} y1={from[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${to[0]},${to[1]} ${b[0] + n[0] * 4.5},${b[1] + n[1] * 4.5} ${b[0] - n[0] * 4.5},${b[1] - n[1] * 4.5}`} fill={color} />
    </g>
  );
}

/** text width estimate (CJK wide) for badges */
function textW(s: string, size: number): number {
  let w = 0;
  for (const ch of s) w += /[　-鿿＀-￯]/.test(ch) ? size : size * 0.6;
  return w;
}

/** a value badge (rounded label) */
export function Badge({
  x,
  y,
  text,
  color,
  bg = '#fff',
  anchor = 'start',
  size = 12,
}: {
  x: number;
  y: number;
  text: string;
  color: string;
  bg?: string;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
}) {
  const w = textW(text, size) + 12;
  const h = size + 9;
  const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return (
    <g className="w32-badge">
      <rect x={x0} y={y - h / 2} width={w} height={h} rx={h / 2} fill={bg} stroke={color} strokeWidth={1.4} />
      <text x={x0 + w / 2} y={y + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={800} fill={color}>
        {text}
      </text>
    </g>
  );
}

/** an X mark (a break in a wire) centred at `at` */
export function Cross({ at, color = C.redLine, s = 6 }: { at: Pt; color?: string; s?: number }) {
  const [x, y] = at;
  return (
    <g stroke={color} strokeWidth={2.6} strokeLinecap="round">
      <line x1={x - s} y1={y - s} x2={x + s} y2={y + s} />
      <line x1={x + s} y1={y - s} x2={x - s} y2={y + s} />
    </g>
  );
}

/* ------------------------------------------------------------- dock */

export function Seg<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { v: T; t: string; short?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="w32-seg" role="radiogroup" aria-label={label}>
      <span className="w32-seg-label">{label}</span>
      {options.map((o) => (
        <button key={String(o.v)} role="radio" aria-checked={value === o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>
          <span className="full">{o.t}</span>
          <span className="short">{o.short ?? o.t}</span>
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, children }: { on: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <button className={`w32-switch ${on ? 'on' : ''}`} role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span className="knob" aria-hidden />
      {children}
    </button>
  );
}

/** a telemetry chip, hover-linked to stage ids */
export function Chip({ ids, label, value, tone = '' }: { ids?: string[]; label: ReactNode; value: ReactNode; tone?: '' | 'ok' | 'bad' | 'warn' | 'hid' }) {
  const isLit = useIsLit();
  const on = !!ids && isLit(...ids);
  return (
    <span className={`w32-chip ${tone} ${on ? 'lit' : ''}`} {...(ids ? hoverProps(ids) : {})}>
      <span className="k">{label}</span>
      <b>{value}</b>
    </span>
  );
}
