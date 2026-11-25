// W5-L7 stage state: layer ids, stage params (shared by the three layers and set by the acts and the
// guided steps), the transfer function the stage shows, what the guided example lets it show, the
// colours of the factors, and the hover / highlight helpers.

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { blockTF, EX4, GUIDED, rangeOf, rcTF, type BlockKind, type Factor, type Preset } from './model';

export const L1 = '01';
export const L2 = '02';
export const L3 = '03';

/** stage params */
export const P = {
  preset: 'w57_preset',
  /** layer 01 view */
  view: 'w57_view',
  /** guided example: steps solved (5 = done, everything uncovered) */
  g: 'w57_g',
  /** the frequency cursor ω (rad/s) */
  w: 'w57_w',
  R: 'w57_R',
  C: 'w57_C',
  /** act 3 brick: kind, K value, zero (+1) / pole (−1), ζ */
  block: 'w57_block',
  bk: 'w57_bk',
  sign: 'w57_sign',
  zeta: 'w57_zeta',
  /** Bode layer toggles */
  asym: 'w57_asym',
  exact: 'w57_exact',
  err: 'w57_err',
  /** factors switched off in layer 03 */
  off: 'w57_off',
  /** dB ruler: the amplitude ratio */
  ratio: 'w57_ratio',
} as const;

export type View = 'circuit' | 'db' | 'std';

export const COLOR = {
  ink: '#1f2a44',
  muted: '#5f626b',
  grid: '#e7dcc6',
  gridMinor: '#f1ead9',
  axis: '#94a3b8',
  asym: '#d97706',
  asymT: '#b45309',
  exact: '#0284c7',
  exactT: '#0369a1',
  err: '#e11d48',
  errT: '#be123c',
  w0: '#059669',
  w0T: '#047857',
};

/** colour of each factor (the sheet's: constant grey, origin zero green, pole 1 purple, pole 2 pink) */
export const FACTOR_COLOR: Record<string, [line: string, text: string]> = {
  f_k: ['#64748b', '#475569'],
  f_origin: ['#059669', '#047857'],
  f_p1: ['#7c3aed', '#6d28d9'],
  f_p2: ['#db2777', '#be185d'],
  f_real: ['#7c3aed', '#6d28d9'],
  f_quad: ['#e11d48', '#be123c'],
};

export const PRESET_LABEL: Record<Preset, [full: string, short: string]> = {
  rc: ['RC 低通', 'RC'],
  block: ['基本积木', '积木'],
  ex4: ['第 4 幕例题', '例题'],
  guided: ['第 5 幕引导', '引导'],
};

/** what the stage may show of the transfer function (everything, except while the guided example runs) */
export interface Reveal {
  /** K of the standard form */
  k: boolean;
  /** the low-frequency asymptote (below the first corner) */
  low: boolean;
  /** the whole magnitude asymptote and its slopes */
  asym: boolean;
  /** the exact magnitude curve and its errors */
  exact: boolean;
  /** the phase plot (asymptote, exact, ω0) */
  phase: boolean;
  /** a factor's own magnitude line (layer 03) */
  comp: (id: string) => boolean;
  /** the factors' own phase lines (layer 03) */
  compPhase: boolean;
}

const ALL: Reveal = { k: true, low: true, asym: true, exact: true, phase: true, comp: () => true, compPhase: true };

/** guided example, `g` steps solved: 1 → K, 2 → the low-frequency line, 3 → the asymptote, 4 → the exact curve, 5 → the phase */
export function revealOf(preset: Preset, g: number): Reveal {
  if (preset !== 'guided' || g >= 5) return ALL;
  return {
    k: g >= 1,
    low: g >= 2,
    asym: g >= 3,
    exact: g >= 4,
    phase: g >= 5,
    comp: (id) => (id === 'f_k' || id === 'f_origin' ? g >= 1 : g >= 2),
    compPhase: g >= 4,
  };
}

export interface Lab {
  preset: Preset;
  setPreset: (p: Preset) => void;
  fs: Factor[];
  range: [number, number];
  g: number;
  setG: (n: number) => void;
  rev: Reveal;
  masked: boolean;
  w: number;
  setW: (w: number) => void;
  R: number;
  C: number;
  setR: (r: number) => void;
  setC: (c: number) => void;
  block: BlockKind;
  setBlock: (b: BlockKind) => void;
  bk: number;
  setBk: (k: number) => void;
  sign: 1 | -1;
  setSign: (s: 1 | -1) => void;
  zeta: number;
  setZeta: (z: number) => void;
}

export const DEFAULTS = { R: 1000, C: 1e-6, w: 1000, block: 'real' as BlockKind, bk: 10, sign: -1 as 1 | -1, zeta: 0.3 };

export function useLab(): Lab {
  const [preset, setPreset] = useStageParam<Preset>(P.preset, 'rc');
  const [g, setG] = useStageParam<number>(P.g, 0);
  const [w, setW] = useStageParam<number>(P.w, DEFAULTS.w);
  const [R, setR] = useStageParam<number>(P.R, DEFAULTS.R);
  const [C, setC] = useStageParam<number>(P.C, DEFAULTS.C);
  const [block, setBlock] = useStageParam<BlockKind>(P.block, DEFAULTS.block);
  const [bk, setBk] = useStageParam<number>(P.bk, DEFAULTS.bk);
  const [sign, setSign] = useStageParam<1 | -1>(P.sign, DEFAULTS.sign);
  const [zeta, setZeta] = useStageParam<number>(P.zeta, DEFAULTS.zeta);
  const fs = preset === 'rc' ? rcTF(R, C) : preset === 'block' ? blockTF(block, bk, sign, zeta) : preset === 'ex4' ? EX4 : GUIDED;
  const rev = revealOf(preset, g);
  return {
    preset,
    setPreset,
    fs,
    range: rangeOf(preset),
    g,
    setG,
    rev,
    masked: preset === 'guided' && g < 5,
    w,
    setW,
    R,
    C,
    setR,
    setC,
    block,
    setBlock,
    bk,
    setBk,
    sign,
    setSign,
    zeta,
    setZeta,
  };
}

/** the cursor's default spot for each preset (acts set it with the preset) */
export function cursorFor(p: Preset, rcCorner: number): number {
  if (p === 'rc') return rcCorner;
  if (p === 'block') return 10;
  if (p === 'ex4') return 2;
  return 1;
}

/** clear a hover left by an object of this layer when the layer goes away */
export function useClearHoverOnUnmount() {
  useEffect(() => () => useStage.getState().setHover(null), []);
}

export const useIsLit = () => {
  const lit = useLit();
  return (id: string) => lit.includes(id);
};

/** an HTML control linked to a hover-map id: whether it is lit, and its pointer handlers */
export function useHot(id: string) {
  const lit = useLit().includes(id);
  const setHover = useStage((s) => s.setHover);
  return { lit, on: { onPointerEnter: () => setHover([id]), onPointerLeave: () => setHover(null) } };
}

/** a hover-map object in an SVG: lights when its id is lit, sets the hover on pointer enter */
export function Obj({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  const lit = useLit().includes(id);
  const setHover = useStage((s) => s.setHover);
  return (
    <g className={`w57-obj ${className}${lit ? ' lit' : ''}`} onPointerEnter={() => setHover([id])} onPointerLeave={() => setHover(null)}>
      {children}
    </g>
  );
}

/** a segmented control */
export function Seg<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { v: T; full: string; short?: string; disabled?: boolean }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="w57-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.v)} role="radio" aria-checked={value === o.v} className={value === o.v ? 'on' : ''} disabled={o.disabled} onClick={() => onChange(o.v)}>
          <span className="full">{o.full}</span>
          <span className="short">{o.short ?? o.full}</span>
        </button>
      ))}
    </div>
  );
}

/** a readout cell linked to a hover-map id */
export function Cell({ id, k, v, tone }: { id: string; k: ReactNode; v: ReactNode; tone?: 'asym' | 'exact' | 'err' | 'w0' }) {
  const hot = useHot(id);
  return (
    <div className={`w57-cell${hot.lit ? ' lit' : ''}${tone ? ` ${tone}` : ''}`} {...hot.on}>
      <span className="k">{k}</span>
      <b>{v}</b>
    </div>
  );
}

/** SVG text with subscripts: "ω_c" → ω, then "c" set low and small, then the rest */
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

/** the same for HTML: "ω_c" → ω<sub>c</sub> */
export function HSubs({ s }: { s: string }) {
  const parts = s.split(/_([A-Za-z0-9]+)/);
  return <>{parts.map((p, i) => (i % 2 === 1 ? <sub key={i}>{p}</sub> : p))}</>;
}
