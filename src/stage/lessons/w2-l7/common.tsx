// W2-L7's stage settings (shared by the three layers, set by acts and guided steps) and small
// controls. Params: case (c1 / c2 / gd), step (the black-box pipeline), rl (load, Ω), model
// (Thevenin / Norton view), lab (bench measurement), pot (kΩ), scale (safe ×1000 / textbook Ω).

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import type { CaseId, LabMode, Scale, StepId } from './model';
import './w2l7.css';

export const DEFAULTS = { case: 'c1' as CaseId, step: 'detach' as StepId, rl: 6, model: 'thev' as 'thev' | 'norton', lab: 'open' as LabMode, pot: 4, scale: 'safe' as Scale };

export const useCase = () => useStageParam<CaseId>('case', DEFAULTS.case);
export const useStep = () => useStageParam<StepId>('step', DEFAULTS.step);
export const useRl = () => useStageParam<number>('rl', DEFAULTS.rl);

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
    <div className={`w27-seg ${className}`} role="radiogroup" aria-label={label}>
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
  label: string;
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
    <label className="w27-slider" {...(hover ? hov(hover) : {})}>
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={`${fmt(value)} ${unit}`} />
      <b>
        {fmt(value)} {unit}
      </b>
    </label>
  );
}

/** A readout chip; lit when one of `ids` is. */
export function Chip({ ids, k, v, tone, className = '' }: { ids: string[]; k: ReactNode; v: ReactNode; tone?: 'good' | 'warn' | 'bad'; className?: string }) {
  const isLit = useIsLit();
  return (
    <span className={`w27-chip ${tone ?? ''} ${isLit(...ids) ? 'lit' : ''} ${className}`} tabIndex={0} {...hov(ids)}>
      <span>{k}</span>
      <b>{v}</b>
    </span>
  );
}

export const STEP_OPTIONS: SegOption<StepId>[] = [
  { value: 'detach', label: '① 拆负载', short: '① 拆负载', hover: ['hl_load'] },
  { value: 'voc', label: '② 测开路 v_oc', short: '② v_oc', hover: ['hl_voc'] },
  { value: 'rth', label: '③ 求 R_Th (置零/测试源)', short: '③ R_Th', hover: ['hl_rth'] },
  { value: 'load', label: '④ 接回负载 R_L', short: '④ 接回', hover: ['hl_thev'] },
];

export const CASE_OPTIONS: SegOption<CaseId>[] = [
  { value: 'c1', label: 'Case 1: 纯独立源 (Sadiku Ex 4.8)', short: 'Case 1' },
  { value: 'c2', label: 'Case 2: 含受控源 (外加 1V 测试源)', short: 'Case 2' },
  { value: 'gd', label: '引导例题 (0.25v_x)', short: '引导题' },
];

/** The guided example hides what its open step asks for: 'all' (nothing of the answer), 'rth'
 *  (V_Th known), 'io' (V_Th and the test-state v1 known), 'none'. Only the guided circuit is masked. */
export type Mask = 'all' | 'rth' | 'io' | 'none';
const RANK: Record<Mask, number> = { all: 0, rth: 1, io: 2, none: 3 };

export function useReveal(cid: CaseId) {
  const [mask, setMask] = useStageParam<Mask>('mask', 'none');
  const masked = cid === 'gd' && mask !== 'none';
  const rank = cid === 'gd' ? RANK[mask] : 3;
  return {
    masked,
    /** v_oc / V_Th / v1 and v_a in the open state */
    voc: rank >= 1,
    /** v1 under the test source */
    v1t: rank >= 2,
    /** i_o, R_Th, I_N */
    io: rank >= 3,
    show: () => setMask('none'),
  };
}

/** "the guided example is open: answers hidden · show" */
export function RevealButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="w27-reveal" onClick={onClick}>
      引导例题进行中，答案暂时隐藏 · 显示答案
    </button>
  );
}
