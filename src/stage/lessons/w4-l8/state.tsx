// W4-L8's shared stage state (stage params, so the three layers, the acts and the guided example
// see one circuit) and the small controls every layer uses.
// - topo / view: the 01 schematic's topology (series / parallel / general) and equivalent view
// - r: the series loop resistance (02 scope slider, 03 potentiometer)
// - tb: the scope's time base (one rising edge, or a whole 5 ms period)
// - pReveal: how far the guided example (parallel RLC) has got; the stage hides its numbers until
//   then (0 nothing, 1 the t = 0+ values, 2 α, ω0 and the case, 3 i_L(∞), 4 D1 and D2, 5 v(t); 9 all)
// - clip2: where the CH2 ground clip sits on the breadboard

import { type ReactNode, useEffect } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { R_RANGE, type ClipNode } from './model';
import './w4l8.css';

export type Topo = 'series' | 'parallel' | 'general';
export type View = '0m' | '0p' | 'inf' | 'zero';
export type TimeBase = 'edge' | 'period';

export interface Lab {
  topo: Topo;
  view: View;
  r: number;
  tb: TimeBase;
  reveal: number;
  clip: ClipNode;
  set: (p: Record<string, unknown>) => void;
}

export function useLab(): Lab {
  const [topo] = useStageParam<Topo>('topo', 'series');
  const [view] = useStageParam<View>('view', '0p');
  const [rRaw] = useStageParam('r', 56);
  const [tb] = useStageParam<TimeBase>('tb', 'edge');
  const [reveal] = useStageParam('pReveal', 0);
  const [clip] = useStageParam<ClipNode>('clip2', 'gnd');
  const set = useStage((s) => s.setParams);
  const r = Math.min(R_RANGE[1], Math.max(R_RANGE[0], Number(rRaw) || 56));
  return { topo, view, r, tb, reveal, clip, set };
}

/** Pointer / focus handlers that light `ids` on the stage and in the text. */
export function hoverProps(ids: string[]) {
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

/** `lit` class for an object whose id (or one of its ids) is lit */
export function useIsLit() {
  const lit = useLit();
  return (...ids: string[]) => (ids.some((id) => lit.includes(id)) ? 'lit' : '');
}

export interface SegOption<T> {
  value: T;
  label: ReactNode;
  short?: ReactNode;
  hover?: string[];
}

/** A segmented radio control. */
export function Seg<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: SegOption<T>[]; onChange: (v: T) => void }) {
  return (
    <div className="w48-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={o.value === value}
          className={o.value === value ? 'on' : ''}
          onClick={() => onChange(o.value)}
          {...(o.hover ? hoverProps(o.hover) : {})}
        >
          {o.short ? (
            <>
              <span className="full">{o.label}</span>
              <span className="short">{o.short}</span>
            </>
          ) : (
            o.label
          )}
        </button>
      ))}
    </div>
  );
}

/** One readout cell. */
export function Cell({ id, name, value, tone, hint }: { id: string; name: ReactNode; value: ReactNode; tone?: string; hint?: ReactNode }) {
  const on = useIsLit()(id);
  return (
    <div className={`w48-cell ${tone ?? ''} ${on}`} {...hoverProps([id])} tabIndex={0}>
      <span>{name}</span>
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );
}

/** The series loop resistance: a slider and the act-2 presets. */
export function RSlider({ lab, min = R_RANGE[0], label = 'R', ids = ['sc_r'] }: { lab: Lab; min?: number; label?: string; ids?: string[] }) {
  const on = useIsLit()(...ids);
  const r = Math.max(min, lab.r);
  return (
    <div className={`w48-slider ${on}`} {...hoverProps(ids)}>
      <label>
        <span className="w48-slider-label">{label}</span>
        <input type="range" min={min} max={R_RANGE[1]} step={1} value={r} onChange={(e) => lab.set({ r: Number(e.target.value) })} aria-label="回路总电阻 R（Ω）" />
      </label>
      <b className="w48-num">{Math.round(r)} Ω</b>
      <div className="w48-presets" role="group" aria-label="快捷挡位">
        {[
          [56, '56 Ω 欠阻尼', '56'],
          [200, '200 Ω 临界', '200'],
          [250, '250 Ω 过阻尼', '250'],
        ].map(([v, t, s]) => (
          <button key={v} className={Math.round(r) === v ? 'on' : ''} onClick={() => lab.set({ r: v })}>
            <span className="full">{t}</span>
            <span className="short">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
