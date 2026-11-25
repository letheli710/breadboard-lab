// W4-L2's shared stage state and small controls (no three.js here: the 2D layers import it too).
// Stage params:
// - layer 01 (3D bench): cam (bench / parts / circuit / couple), couple (ortho / parallel), probe;
// - layer 02 (3D coil): peel 0…1, mu (air / ferrite), N, idir (±1);
// - layer 03 (waves): wmode (wave / kick), wL (mH), ipk (mA), t1 t2 t3 tc (ms), diode, sw;
// - layers 01 + 04 (Example 5.1 on the breadboard and on the analysis desk): dcView (orig / dc),
//   dcCase (ex51 / free), vs (V), r3 (Ω), ex51 = steps of the guided example solved (0 … 5): the
//   stage hides Example 5.1's answers until the student has reached them; done_params sets 5.

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { dcSolve, EX51, type DcSol, type Rlc } from './model';
import './w4l2.css';

export const L1 = 'layer_01';
export const L2 = 'layer_02';
export const L3 = 'layer_03';
export const L4 = 'layer_04';

export const SUPPLY_NAME = '台式可调直流电源（9 V）';
export const KICK_SUPPLY = '台式可调直流电源（12 V）';

/** What the guided example lets the stage show, by the number of steps solved. */
export type Shown = 'vL' | 'vR4' | 'vA' | 'iL' | 'w';
const NEED: Record<Shown, number> = { vL: 1, vR4: 2, vA: 3, iL: 4, w: 5 };

export interface Dc {
  c: Rlc;
  s: DcSol;
  ex: boolean;
  masked: boolean;
  view: 'orig' | 'dc';
  shown: (k: Shown) => boolean;
  reveal: () => void;
  set: (p: Record<string, unknown>) => void;
  /** change a value: leaves Example 5.1 for a free circuit */
  free: (p: Record<string, unknown>) => void;
}

/** Example 5.1's circuit (layers 01 and 04). */
export function useDc(): Dc {
  const [vs] = useStageParam('vs', EX51.vs);
  const [r3] = useStageParam('r3', EX51.r3);
  const [kase] = useStageParam<'ex51' | 'free'>('dcCase', 'ex51');
  const [level] = useStageParam('ex51', 5);
  const [view] = useStageParam<'orig' | 'dc'>('dcView', 'dc');
  const set = useStage((s) => s.setParams);
  const ex = kase === 'ex51';
  const c: Rlc = ex ? EX51 : { ...EX51, vs, r3 };
  const lv = ex ? level : 5;
  return {
    c,
    s: dcSolve(c),
    ex,
    masked: lv < 5,
    view,
    shown: (k) => lv >= NEED[k],
    reveal: () => set({ ex51: 5 }),
    set,
    free: (p) => set({ vs: ex ? EX51.vs : vs, r3: ex ? EX51.r3 : r3, ...p, dcCase: 'free' }),
  };
}

/** Pointer / focus handlers that light `ids` on the stage and in the text. */
export function hov(ids: string[]) {
  const { setHover } = useStage.getState();
  return {
    onPointerEnter: () => setHover(ids),
    onPointerLeave: () => setHover(null),
    onFocus: () => setHover(ids),
    onBlur: () => setHover(null),
  };
}

/** Clear a hover left behind when a layer unmounts under the pointer. */
export function useClearHoverOnUnmount() {
  useEffect(() => () => useStage.getState().setHover(null), []);
}

/** Is any of `ids` lit right now? */
export function useIsLit() {
  const lit = useLit();
  return (...ids: string[]) => ids.some((id) => lit.includes(id));
}

export interface SegOption<T extends string> {
  value: T;
  label: ReactNode;
  short?: ReactNode;
  tone?: 'bad' | 'good';
  hover?: string[];
}

export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: SegOption<T>[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="w42-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          className={`${value === o.value ? 'on' : ''} ${o.tone ?? ''}`}
          onClick={() => onChange(o.value)}
          {...(o.hover ? hov(o.hover) : {})}
        >
          <span className="full">{o.label}</span>
          <span className="short">{o.short ?? o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  hover,
  fmt = (v) => String(v),
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  hover?: string[];
  fmt?: (v: number) => string;
}) {
  return (
    <label className="w42-slider" {...(hover ? hov(hover) : {})}>
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={`${fmt(value)} ${unit}`} />
      <b>
        {fmt(value)}
        {unit && ` ${unit}`}
      </b>
    </label>
  );
}

/** A readout chip; lit when one of `ids` is. */
export function Chip({ ids, k, v, tone }: { ids: string[]; k: ReactNode; v: ReactNode; tone?: 'good' | 'warn' | 'bad' }) {
  const isLit = useIsLit();
  return (
    <span className={`w42-chip ${tone ?? ''} ${isLit(...ids) ? 'lit' : ''}`} tabIndex={0} {...hov(ids)}>
      <span>{k}</span>
      <b>{v}</b>
    </span>
  );
}

/** "Example 5.1 is being solved: its answers are hidden · show" */
export function MaskNote({ d }: { d: Dc }) {
  if (!d.ex) return null;
  return d.masked ? (
    <button className="w42-reveal" onClick={d.reveal}>
      <span className="full">例题 5.1 引导进行中，答案暂时隐藏 · 显示答案</span>
      <span className="short">答案已隐藏 · 显示</span>
    </button>
  ) : (
    <span className="w42-ex">例题 5.1（面包板安全级电路）</span>
  );
}

export const HIDDEN = '?';
