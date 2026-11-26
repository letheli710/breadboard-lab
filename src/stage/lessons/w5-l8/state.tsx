// W5-L8's shared stage state (stage params, so the three layers, the acts and the guided example
// see one circuit) and the small controls every layer uses.
// - topo / phasors / u: layer 01's topology (series / parallel), the phasor overlay, ω/ω0
// - q: the quality factor (layers 01 and 02 share it); presets: the Q = 2 / 5 / 10 overlays;
//   hp: the 0.707 line and the bandwidth markers
// - f / vpp / probe / para / cam: the bench (frequency, amplitude, CH2 target, parasitics, camera)
// - w58g: the guided example's open step (1–5), 0 when none is open; while a step is open the stage
//   hides the numbers that step asks for (01: Q and |V_L|, |V_C| in steps 1, 2, 5; 02: B and the
//   half-power points in steps 3, 4); the example's done_params set it back to 0

import { type ReactNode, useEffect, useState } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { F_RANGE, Q_RANGE, U_RANGE, VPP_RANGE, type Probe } from './model';
import './w5l8.css';

export type Topo = 'series' | 'parallel';
export type Cam = 'bench' | 'board' | 'scope';

const clamp = (x: unknown, [a, b]: [number, number], d: number) => {
  const n = Number(x);
  return Number.isFinite(n) ? Math.min(b, Math.max(a, n)) : d;
};

export interface Lab {
  topo: Topo;
  phasors: boolean;
  u: number;
  q: number;
  presets: number[];
  hp: boolean;
  f: number;
  vpp: number;
  probe: Probe;
  para: boolean;
  /** the guided step open on the stage (0: none) */
  g: number;
  set: (p: Record<string, unknown>) => void;
}

export function useLab(): Lab {
  const [topo] = useStageParam<Topo>('topo', 'series');
  const [phasors] = useStageParam('phasors', true);
  const [u] = useStageParam('u', 1);
  const [q] = useStageParam('q', 5);
  const [presets] = useStageParam<number[]>('presets', [2, 5, 10]);
  const [hp] = useStageParam('hp', true);
  const [f] = useStageParam('f', 2000);
  const [vpp] = useStageParam('vpp', 1);
  const [probe] = useStageParam<Probe>('probe', 'vC');
  const [para] = useStageParam('para', false);
  const [g] = useStageParam('w58g', 0);
  const set = useStage((s) => s.setParams);
  return {
    topo: topo === 'parallel' ? 'parallel' : 'series',
    phasors: !!phasors,
    u: clamp(u, U_RANGE, 1),
    q: clamp(q, Q_RANGE, 5),
    presets: Array.isArray(presets) ? presets : [2, 5, 10],
    hp: !!hp,
    f: clamp(f, F_RANGE, 2000),
    vpp: clamp(vpp, VPP_RANGE, 1),
    probe: probe === 'vR' ? 'vR' : 'vC',
    para: !!para,
    g: Number(g) || 0,
    set,
  };
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
    <div className="w58-seg" role="radiogroup" aria-label={label}>
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

/** A checkbox toggle. */
export function Check({ label, short, value, onChange, ids }: { label: string; short?: string; value: boolean; onChange: (v: boolean) => void; ids?: string[] }) {
  const on = useIsLit()(...(ids ?? []));
  return (
    <label className={`w58-check ${on}`} {...(ids ? hoverProps(ids) : {})}>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span className="full">{label}</span>
      {short && <span className="short">{short}</span>}
    </label>
  );
}

/** A labelled range slider. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  text,
  ids,
  aria,
  tone,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  text: ReactNode;
  ids?: string[];
  aria: string;
  tone?: string;
}) {
  const on = useIsLit()(...(ids ?? []));
  return (
    <div className={`w58-slider ${tone ?? ''} ${on}`} {...(ids ? hoverProps(ids) : {})}>
      <label>
        <span className="w58-slider-label">{label}</span>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={aria} />
      </label>
      <b className="w58-num">{text}</b>
    </div>
  );
}

/** One readout cell. */
export function Cell({ id, name, value, tone, hint }: { id: string; name: ReactNode; value: ReactNode; tone?: string; hint?: ReactNode }) {
  const on = useIsLit()(id);
  return (
    <div className={`w58-cell ${tone ?? ''} ${on}`} {...hoverProps([id])} tabIndex={0}>
      <span>{name}</span>
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );
}

/** what a hidden readout shows while the guided example asks for it */
export const HIDDEN = '？待揭晓';

const NARROW = '(max-width: 960px)';

/** true on narrow screens (the stage.css phone breakpoint): the layers switch to a compact layout */
export function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(NARROW).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(NARROW);
    if (!mq) return;
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}
