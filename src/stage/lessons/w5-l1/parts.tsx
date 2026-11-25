// Pieces shared by the three W5-L1 layers (all 2D SVG / HTML, no three.js): layer ids, the stage
// params the acts and guided steps set, colours, the hover / highlight wrappers for hover-map
// objects, sliders, segmented switches, readout cells and small SVG helpers (arrows, arcs, text
// with subscripts).

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';

export const L1 = '01';
export const L2 = '02';
export const L3 = '03';

/** stage params (prefix w51_) */
export const P = {
  // 01 rotating phasor
  vm: 'w51_vm',
  w: 'w51_w',
  phi: 'w51_phi',
  play: 'w51_play',
  // 02 phase comparison
  f1: 'w51_f1',
  a1: 'w51_a1',
  p1: 'w51_p1',
  f2: 'w51_f2',
  a2: 'w51_a2',
  p2: 'w51_p2',
  para: 'w51_para',
  sym: 'w51_sym',
  // 03 calculus operators
  wc: 'w51_wc',
  ia: 'w51_ia',
  ip: 'w51_ip',
  mode: 'w51_mode',
  eq: 'w51_eq',
  /** guided example: steps solved (5 = all, uncovered) */
  g: 'w51_g',
} as const;

export type OpMode = 'base' | 'diff' | 'int' | 'all';
export type EqPreset = 'off' | 'ex51' | 'guided';

export const C = {
  ink: '#1f2a44',
  muted: '#5f626b',
  axis: '#94a3b8',
  grid: '#e2e8f0',
  vec: '#0284c7',
  vecT: '#0369a1',
  proj: '#16a34a',
  projT: '#15803d',
  amber: '#d97706',
  amberT: '#b45309',
  rose: '#e11d48',
  roseT: '#be123c',
  violet: '#7c3aed',
  violetT: '#6d28d9',
};

export const useParam = useStageParam;

/** clear a hover left by an object of this layer when the layer goes away */
export function useClearHoverOnUnmount() {
  useEffect(() => () => useStage.getState().setHover(null), []);
}

/** an HTML element linked to hover-map ids: whether it is lit, and its pointer handlers */
export function useHot(ids: string | string[]) {
  const list = Array.isArray(ids) ? ids : [ids];
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  return { lit: list.some((id) => lit.includes(id)), on: { onPointerEnter: () => setHover([list[0]]), onPointerLeave: () => setHover(null) } };
}

/** A hover-map object in a drawing: glows when its id is lit; `hit` is a wide invisible stroke to hover. */
export function Obj({ id, hit, children, className }: { id: string; hit?: string; children: ReactNode; className?: string }) {
  const lit = useLit().includes(id);
  const setHover = useStage((s) => s.setHover);
  return (
    <g className={`w51-obj${lit ? ' lit' : ''}${className ? ` ${className}` : ''}`} onPointerEnter={() => setHover([id])} onPointerLeave={() => setHover(null)}>
      {hit && <path d={hit} className="w51-hit" />}
      {children}
    </g>
  );
}

/** a vector from (x0, y0) to (x1, y1) with an arrowhead */
export function Vec({ x0, y0, x1, y1, color, w = 2.6, dashed }: { x0: number; y0: number; x1: number; y1: number; color: string; w?: number; dashed?: boolean }) {
  const L = Math.hypot(x1 - x0, y1 - y0);
  if (L < 0.5) return <circle cx={x0} cy={y0} r={2.5} fill={color} />;
  const ux = (x1 - x0) / L;
  const uy = (y1 - y0) / L;
  const h = Math.min(9, L * 0.45);
  const bx = x1 - ux * h;
  const by = y1 - uy * h;
  const px = -uy * h * 0.45;
  const py = ux * h * 0.45;
  return (
    <g>
      <line x1={x0} y1={y0} x2={bx} y2={by} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dashed ? '5 4' : undefined} />
      <polygon points={`${x1},${y1} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />
    </g>
  );
}

/** SVG path of an arc around (cx, cy) of radius r from angle a0 to a1 (math degrees, y up) */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy - r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 0 : 1; // counter-clockwise on screen when the angle grows
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} ${sweep} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/** an arc with an arrowhead at its end */
export function ArcArrow({
  cx,
  cy,
  r,
  a0,
  a1,
  color,
  w = 1.8,
  dashed,
}: {
  cx: number;
  cy: number;
  r: number;
  a0: number;
  a1: number;
  color: string;
  w?: number;
  dashed?: boolean;
}) {
  if (Math.abs(a1 - a0) < 1) return null;
  const rad = (a1 * Math.PI) / 180;
  const ex = cx + r * Math.cos(rad);
  const ey = cy - r * Math.sin(rad);
  // tangent in the direction of travel (screen coordinates)
  const s = a1 > a0 ? 1 : -1;
  const tx = -Math.sin(rad) * s;
  const ty = -Math.cos(rad) * s;
  const h = 7;
  const bx = ex - tx * h;
  const by = ey - ty * h;
  return (
    <g>
      <path d={arcPath(cx, cy, r, a0, a1)} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? '4 3' : undefined} />
      <polygon points={`${ex},${ey} ${bx - ty * 3.2},${by + tx * 3.2} ${bx + ty * 3.2},${by - tx * 3.2}`} fill={color} />
    </g>
  );
}

/** SVG text with subscripts: "V_m" → V, then m set low and small */
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

/** the same for HTML */
export function HSubs({ s }: { s: string }) {
  const parts = s.split(/_([A-Za-z0-9]+)/);
  return <>{parts.map((p, i) => (i % 2 === 1 ? <sub key={i}>{p}</sub> : p))}</>;
}

export function Lbl({
  x,
  y,
  s,
  color = C.ink,
  anchor = 'middle',
  cls = 'w51-lbl',
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

/** a labelled range slider */
export function Slider({
  id,
  label,
  short,
  min,
  max,
  step,
  value,
  onChange,
  text,
  disabled,
}: {
  id?: string;
  label: string;
  short?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  text: string;
  disabled?: boolean;
}) {
  const hot = useHot(id ?? '');
  return (
    <label className={`w51-slider${id && hot.lit ? ' lit' : ''}${disabled ? ' off' : ''}`} {...(id ? hot.on : {})}>
      <span className="k">
        <span className="full">
          <HSubs s={label} />
        </span>
        <span className="short">
          <HSubs s={short ?? label} />
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label.replace(/_/g, '')}
      />
      <span className="v">{text}</span>
    </label>
  );
}

/** a segmented switch */
export function Seg<T extends string | boolean>({
  value,
  options,
  onChange,
  label,
  disabled,
}: {
  value: T;
  options: { id: T; label: string; short?: string }[];
  onChange: (v: T) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="w51-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.id)} role="radio" aria-checked={value === o.id} className={value === o.id ? 'on' : ''} disabled={disabled} onClick={() => onChange(o.id)}>
          <span className="full">{o.label}</span>
          <span className="short">{o.short ?? o.label}</span>
        </button>
      ))}
    </div>
  );
}

/** a readout cell linked to a hover-map id; `opt`: left out on a phone (shown elsewhere on the stage) */
export function Cell({ id, k, v, tone, opt }: { id: string; k: string; v: string; tone?: string; opt?: boolean }) {
  const hot = useHot(id);
  return (
    <div className={`w51-cell${hot.lit ? ' lit' : ''}${opt ? ' opt' : ''}`} {...hot.on}>
      <span className="k">
        <HSubs s={k} />
      </span>
      <b style={tone ? { color: tone } : undefined}>
        <HSubs s={v} />
      </b>
    </div>
  );
}
