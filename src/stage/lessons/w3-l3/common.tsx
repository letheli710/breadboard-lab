// W3-L3's stage settings (shared by the three layers, set by acts and guided steps) and small
// controls. Params: vi (V), r1 / rf (Ω, the 2D circuit), supply (dual ±9 V / single +9 V),
// case ('free' or 'ex53': Example 5.3 while the guided example runs), reveal (how much of
// Example 5.3 the stage may show: 0 nothing … 9 everything), overlay (layer 02: the single +9 V
// curve), labRf (the breadboard's R_f: 22 kΩ or 47 kΩ), probe (the multimeter's red probe),
// fault (the breadboard troubleshooting cases), cam (3D framing).

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { solve, type Amp, type Fault, type Supply } from './model';
import './w3l3.css';

export const DEFAULTS = { vi: 1, r1: 10_000, rf: 22_000, supply: 'dual' as Supply, labRf: 22_000, fault: 'none' as Fault };

export const SUPPLY_NAME = '台式可调直流电源（±9 V）';

/** Example 5.3 (Sadiku Fig. 5.12) */
export const EX53 = { case: 'ex53', vi: 0.5, r1: 10_000, rf: 25_000, supply: 'dual' } as const;

export type Probe = 'vi' | 'p1' | 'p2' | 'p3' | 'p4' | 'p8';

/** What the guided example lets the stage show: v− from step 2, i1 from 3, i_f from 4, A_v and
 *  v_o from 5, i_o once it is done. */
export type Shown = 'vm' | 'i1' | 'if' | 'vo' | 'io';
const NEED: Record<Shown, number> = { vm: 1, i1: 2, if: 3, vo: 4, io: 9 };

export interface Circuit {
  a: Amp;
  ex53: boolean;
  /** Example 5.3 on the stage with some of its answers still hidden */
  masked: boolean;
  shown: (k: Shown) => boolean;
  reveal: () => void;
  setVi: (v: number) => void;
  setR1: (v: number) => void;
  setRf: (v: number) => void;
  setSupply: (s: Supply) => void;
}

/** The 2D circuit (layers 01 and 02). Moving a control leaves Example 5.3 for a free circuit. */
export function useCircuit(): Circuit {
  const [vi] = useStageParam('vi', DEFAULTS.vi);
  const [r1] = useStageParam('r1', DEFAULTS.r1);
  const [rf] = useStageParam('rf', DEFAULTS.rf);
  const [supply] = useStageParam<Supply>('supply', DEFAULTS.supply);
  const [kase] = useStageParam<'free' | 'ex53'>('case', 'free');
  const [rv] = useStageParam('reveal', 9);
  const set = useStage((s) => s.setParams);
  const ex53 = kase === 'ex53';
  const level = ex53 ? rv : 9;
  const free = (p: Record<string, unknown>) => set({ ...p, case: 'free' });
  return {
    a: solve(vi, r1, rf, supply),
    ex53,
    masked: level < 9,
    shown: (k) => level >= NEED[k],
    reveal: () => set({ reveal: 9 }),
    setVi: (v) => free({ vi: v }),
    setR1: (v) => free({ r1: v }),
    setRf: (v) => free({ rf: v }),
    setSupply: (s) => free({ supply: s }),
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
  /** label on narrow screens */
  short?: ReactNode;
  tone?: 'bad';
  hover?: string[];
}

export function Seg<T extends string>({
  value,
  options,
  onChange,
  label,
  className = '',
}: {
  value: T;
  options: SegOption<T>[];
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div className={`w33-seg ${className}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          className={`${value === o.value ? 'on' : ''} ${o.tone === 'bad' ? 'bad' : ''}`}
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
    <label className="w33-slider" {...(hover ? hov(hover) : {})}>
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
export function Chip({ ids, k, v, tone, className = '' }: { ids: string[]; k: ReactNode; v: ReactNode; tone?: 'good' | 'warn' | 'bad'; className?: string }) {
  const isLit = useIsLit();
  return (
    <span className={`w33-chip ${tone ?? ''} ${isLit(...ids) ? 'lit' : ''} ${className}`} tabIndex={0} {...hov(ids)}>
      <span>{k}</span>
      <b>{v}</b>
    </span>
  );
}

export const SUPPLY_OPTIONS: SegOption<Supply>[] = [
  { value: 'dual', label: '±9 V 双电源', short: '±9 V', hover: ['rail_p', 'rail_n'] },
  { value: 'single', label: '单 +9 V（错误接法）', short: '单 +9 V', tone: 'bad', hover: ['rail_n'] },
];

/** v_i, R1, R_f and the supply switch: the 2D layers' dock */
export function Dock({ c, compact = false }: { c: Circuit; compact?: boolean }) {
  const { a } = c;
  return (
    <div className="w33-ctrl">
      <div className="w33-row">
        <Slider
          label="vᵢ"
          value={a.vi}
          min={-5}
          max={5}
          step={0.05}
          unit="V"
          onChange={c.setVi}
          hover={['vi_src']}
          fmt={(v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2)}
        />
        <Seg label="电源模式" value={a.supply} onChange={c.setSupply} options={SUPPLY_OPTIONS} className="small" />
      </div>
      <div className={`w33-row ${compact ? 'compact' : ''}`}>
        <Slider label="R₁" value={a.r1 / 1000} min={1} max={100} step={1} unit="kΩ" onChange={(v) => c.setR1(v * 1000)} hover={['r1']} />
        <Slider label="Rf" value={a.rf / 1000} min={10} max={100} step={1} unit="kΩ" onChange={(v) => c.setRf(v * 1000)} hover={['rf']} />
      </div>
    </div>
  );
}

/** "the guided example is open: answers hidden · show" */
export function MaskNote({ c }: { c: Circuit }) {
  if (!c.ex53) return null;
  return c.masked ? (
    <button className="w33-reveal" onClick={c.reveal}>
      <span className="full">Example 5.3 引导进行中，答案暂时隐藏 · 显示答案</span>
      <span className="short">答案已隐藏 · 显示</span>
    </button>
  ) : (
    <span className="w33-ex">Example 5.3（Sadiku Fig. 5.12）</span>
  );
}
