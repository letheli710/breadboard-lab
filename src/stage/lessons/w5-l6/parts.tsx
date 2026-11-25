// Pieces shared by the three W5-L6 layers (light stage, prefix w56-): layer ids, stage params,
// colours, the hover / highlight wrapper for hover-map objects, sliders, toggles, segmented
// buttons, readout cells and SVG text with subscripts.

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import type { ScenarioId } from './model';

export const L1 = '01';
export const L2 = '02';
export const L3 = '03';

/** stage params (layer 01: θ, V_rms, I_rms, conjugate trap; 02: the three loads; 03: scenario, C, pf2, guided progress) */
export const P = {
  theta: 'w56_theta',
  v: 'w56_v',
  i: 'w56_i',
  trap: 'w56_trap',
  l1: 'w56_l1',
  l2: 'w56_l2',
  l3: 'w56_l3',
  on1: 'w56_on1',
  on2: 'w56_on2',
  on3: 'w56_on3',
  scn: 'w56_scn',
  c: 'w56_c',
  pf2: 'w56_pf2',
  /** guided example: steps solved (5 = the whole example, uncovered) */
  g: 'w56_g',
} as const;

/** the sheet's control defaults */
export const DEF = { theta: 37, v: 120, i: 6, l1: 10, l2: 6, l3: 5, c: 310, pf2: 0.95 };

export const C = {
  ink: '#1f2a44',
  axis: '#64748b',
  muted: '#5f626b',
  faint: '#cbd5e1',
  p: '#0284c7',
  pT: '#0369a1',
  lag: '#d97706',
  lagT: '#b45309',
  lead: '#059669',
  leadT: '#047857',
  s: '#e11d48',
  sT: '#be123c',
  qc: '#9333ea',
  qcT: '#7e22ce',
  unity: '#0284c7',
};

export function useNum(key: string, fallback: number): [number, (v: number) => void] {
  return useStageParam<number>(key, fallback);
}
export function useBool(key: string, fallback: boolean): [boolean, (v: boolean) => void] {
  return useStageParam<boolean>(key, fallback);
}
export function useScenario(): [ScenarioId, (s: ScenarioId) => void] {
  return useStageParam<ScenarioId>(P.scn, 'sadiku');
}
export function useGuided(): [number, (n: number) => void] {
  return useStageParam<number>(P.g, 0);
}

/** clear a hover left by an object of this layer when the layer goes away */
export function useClearHoverOnUnmount() {
  useEffect(() => () => useStage.getState().setHover(null), []);
}

/** An HTML control linked to a hover-map id: whether it is lit, and its pointer handlers. */
export function useHot(id: string | undefined) {
  const lit = useLit().includes(id ?? '\u0000');
  const setHover = useStage((s) => s.setHover);
  return { lit, on: id ? { onPointerEnter: () => setHover([id]), onPointerLeave: () => setHover(null) } : {} };
}

/** A hover-map object on the stage: lights when its id is lit, sets the hover on pointer enter. */
export function Obj({ id, children }: { id: string; children: ReactNode }) {
  const lit = useLit().includes(id);
  const setHover = useStage((s) => s.setHover);
  return (
    <g className={`w56-obj${lit ? ' lit' : ''}`} onPointerEnter={() => setHover([id])} onPointerLeave={() => setHover(null)}>
      {children}
    </g>
  );
}

/** SVG text with subscripts: "Q_C" → Q, then "C" set low and small, then the rest */
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

/** the same for HTML: "Q_C" → Q<sub>C</sub> */
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
  size = 12,
  weight = 700,
  rotate,
}: {
  x: number;
  y: number;
  s: string;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
  weight?: number;
  rotate?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={weight} transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined} className="w56-t">
      <Subs s={s} />
    </text>
  );
}

/** an arrow from (x1, y1) to (x2, y2) with a filled head (no marker ids, so several layers can coexist) */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  w = 3,
  dash,
  head = 9,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  w?: number;
  dash?: string;
  head?: number;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 0.5) return null;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const h = Math.min(head, len * 0.6);
  const bx = x2 - ux * h;
  const by = y2 - uy * h;
  const nx = -uy * h * 0.45;
  const ny = ux * h * 0.45;
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx + ux * 1} y2={by + uy * 1} stroke={color} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx + nx},${by + ny} ${bx - nx},${by - ny}`} fill={color} />
    </g>
  );
}

/** a range slider with label, value and an optional hover id and mark */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  text,
  onChange,
  hover,
  disabled,
  mark,
  note,
  short,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  text: string;
  onChange: (v: number) => void;
  hover?: string;
  disabled?: boolean;
  /** a mark on the track (value, its label) */
  mark?: { at: number; label: string } | null;
  note?: string;
  /** the name on a phone */
  short?: string;
}) {
  const hot = useHot(hover);
  const f = (v: number) => `${(Math.min(max, Math.max(min, v)) - min) / (max - min)}`;
  return (
    <label className={`w56-slider${hot.lit ? ' lit' : ''}${disabled ? ' off' : ''}`} {...hot.on}>
      <span className={`w56-sl-name${short ? ' full' : ''}`}>
        <HSubs s={label} />
      </span>
      {short && (
        <span className="w56-sl-name short">
          <HSubs s={short} />
        </span>
      )}
      <span className="w56-sl-track">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(max, Math.max(min, value))}
          disabled={disabled}
          aria-label={label.replace(/_/g, '')}
          aria-valuetext={text}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {mark && mark.at >= min && mark.at <= max && (
          <span className="w56-sl-mark" style={{ ['--f' as string]: f(mark.at) }}>
            <i>{mark.label}</i>
          </span>
        )}
      </span>
      <span className="w56-sl-val">{note ?? <HSubs s={text} />}</span>
    </label>
  );
}

/** an on/off switch */
export function Toggle({ on, onChange, label, hover, title }: { on: boolean; onChange: (v: boolean) => void; label: string; hover?: string; title?: string }) {
  const hot = useHot(hover);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      title={title}
      className={`w56-toggle${on ? ' on' : ''}${hot.lit ? ' lit' : ''}`}
      onClick={() => onChange(!on)}
      {...hot.on}
    >
      <span className="w56-knob" aria-hidden="true" />
      <HSubs s={label} />
    </button>
  );
}

/** segmented buttons (full label on desktop, short on a phone) */
export function Seg<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; short: string }[];
  label: string;
}) {
  return (
    <div className="w56-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          <span className="full">{o.label}</span>
          <span className="short">{o.short}</span>
        </button>
      ))}
    </div>
  );
}

export interface Cell {
  id?: string;
  label: string;
  /** the label on a phone (defaults to `label`) */
  short?: string;
  text: string;
  color?: string;
}

/** one readout cell, lit with its hover id */
export function Readout({ id, label, short, text, color }: Cell) {
  const hot = useHot(id);
  return (
    <div className={`w56-cell${hot.lit ? ' lit' : ''}`} {...hot.on}>
      <span className={`k${short ? ' full' : ''}`}>
        <HSubs s={label} />
      </span>
      {short && (
        <span className="k short">
          <HSubs s={short} />
        </span>
      )}
      <b style={color ? { color } : undefined}>
        <HSubs s={text} />
      </b>
    </div>
  );
}

/** a grid of readouts: `cols` columns, `pcols` on a phone */
export function Readouts({ cells, cols, pcols = 2 }: { cells: Cell[]; cols: number; pcols?: number }) {
  return (
    <div className="w56-rgrid" style={{ ['--cols' as string]: cols, ['--pcols' as string]: pcols }}>
      {cells.map((c, i) => (
        <Readout key={i} {...c} />
      ))}
    </div>
  );
}
