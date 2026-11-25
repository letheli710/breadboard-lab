// W5-L2's shared stage state (stage params, so the three layers, the acts and the guided example see
// one bench) and the small controls every layer uses.
// - elem / omega: the 01 layer's circuit (R, L, C, series RLC, act 3's mixed network, the guided
//   example's network) and its ω
// - gReveal: how far the guided example has got; the 01 layer hides its numbers until then
//   (0 nothing, 1 Z_L1 / Z_C / Z_1, 2 Z_p, 3 Z_eq, 4 I, 9 all)
// - freq / rval: the generator frequency and the resistor (1.6 kΩ or 1.5 kΩ) of the RC lab
// - ch2: CH2 on v_C, on v_R after swapping R and C, or MATH = CH1 − CH2
// - clip2: where the CH2 ground clip sits on the breadboard

import { type ReactNode, useEffect, useState } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { F_RANGE, hz, R_ALT, R_LAB, W_RANGE, type Ch2Mode, type ClipAt, type Elem } from './model';
import './w52.css';
import './w52-extra.css';

export interface Lab {
  elem: Elem;
  omega: number;
  reveal: number;
  freq: number;
  r: number;
  ch2: Ch2Mode;
  clip: ClipAt;
  set: (p: Record<string, unknown>) => void;
}

const clamp = (x: number, [a, b]: [number, number], fb: number) => (Number.isFinite(x) ? Math.min(b, Math.max(a, x)) : fb);

export function useLab(): Lab {
  const [elem] = useStageParam<Elem>('elem', 'L');
  const [omega] = useStageParam('omega', 4000);
  const [reveal] = useStageParam('gReveal', 0);
  const [freq] = useStageParam('freq', 1000);
  const [r] = useStageParam('rval', R_LAB);
  const [ch2] = useStageParam<Ch2Mode>('ch2', 'vc');
  const [clip] = useStageParam<ClipAt>('clip2', 'gnd');
  const set = useStage((s) => s.setParams);
  return {
    elem,
    omega: clamp(Number(omega), W_RANGE, 4000),
    reveal: Number(reveal) || 0,
    freq: clamp(Number(freq), F_RANGE, 1000),
    r: r === R_ALT ? R_ALT : R_LAB,
    ch2,
    clip,
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

/** true below the stage's phone breakpoint */
export function useNarrow(px = 960): boolean {
  const q = `(max-width: ${px}px)`;
  const [n, setN] = useState(() => typeof matchMedia === 'function' && matchMedia(q).matches);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const m = matchMedia(q);
    const on = () => setN(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [q]);
  return n;
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
    <div className="w52-seg" role="radiogroup" aria-label={label}>
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
    <div className={`w52-cell ${tone ?? ''} ${on}`} {...hoverProps([id])} tabIndex={0}>
      <span>{name}</span>
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );
}

/** a log slider: value ↔ position 0 … 1000 */
export function LogSlider({
  label,
  value,
  range,
  onChange,
  fmt,
  ids,
  presets,
  aria,
}: {
  label: string;
  value: number;
  range: [number, number];
  onChange: (v: number) => void;
  fmt: (v: number) => string;
  ids: string[];
  presets: { v: number; full: string; short: string }[];
  aria: string;
}) {
  const on = useIsLit()(...ids);
  const [a, b] = range;
  const pos = Math.round((1000 * Math.log(value / a)) / Math.log(b / a));
  const from = (p: number) => {
    const v = a * (b / a) ** (p / 1000);
    // snap to 3 significant figures, and onto a preset when close
    const near = presets.find((q) => Math.abs(Math.log(v / q.v)) < 0.02);
    if (near) return near.v;
    const e = 10 ** (Math.floor(Math.log10(v)) - 2);
    return Math.round(v / e) * e;
  };
  return (
    <div className={`w52-slider ${on}`} {...hoverProps(ids)}>
      <label>
        <span className="w52-slider-label">{label}</span>
        <input type="range" min={0} max={1000} step={1} value={pos} onChange={(e) => onChange(from(Number(e.target.value)))} aria-label={aria} />
      </label>
      <b className="w52-num">{fmt(value)}</b>
      <div className="w52-presets" role="group" aria-label="快捷挡位">
        {presets.map((p) => (
          <button key={p.v} className={Math.abs(value - p.v) < 1e-9 * p.v ? 'on' : ''} onClick={() => onChange(p.v)}>
            <span className="full">{p.full}</span>
            <span className="short">{p.short}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** the generator frequency (02 and 03 layers) */
export function FreqSlider({ lab, ids = ['sc_freq'] }: { lab: Lab; ids?: string[] }) {
  return (
    <LogSlider
      label="f"
      value={lab.freq}
      range={F_RANGE}
      onChange={(v) => lab.set({ freq: v })}
      fmt={hz}
      ids={ids}
      aria="信号发生器频率 f（Hz）"
      presets={[
        { v: 100, full: '100 Hz 低频', short: '100' },
        { v: 1000, full: '1 kHz 转折', short: '1k' },
        { v: 10000, full: '10 kHz 高频', short: '10k' },
      ]}
    />
  );
}

/** the series resistor of the lab */
export function RSeg({ lab }: { lab: Lab }) {
  return (
    <Seg<number>
      label="电阻 R"
      value={lab.r}
      onChange={(v) => lab.set({ rval: v })}
      options={[
        { value: R_LAB, label: 'R = 1.6 kΩ（E24 1%）', short: '1.6k', hover: ['bb_r'] },
        { value: R_ALT, label: 'R = 1.5 kΩ（E12 5%）', short: '1.5k', hover: ['bb_r'] },
      ]}
    />
  );
}

/** what CH2 shows */
export function Ch2Seg({ lab }: { lab: Lab }) {
  return (
    <Seg<Ch2Mode>
      label="CH2 观测"
      value={lab.ch2}
      onChange={(v) => lab.set({ ch2: v })}
      options={[
        { value: 'vc', label: 'CH2 = v_C', short: 'v_C', hover: ['sc_ch2'] },
        { value: 'swap', label: '对调 R/C · CH2 = v_R', short: '对调', hover: ['sc_ch2', 'bb_r'] },
        { value: 'math', label: 'MATH = CH1 − CH2', short: 'MATH', hover: ['sc_math'] },
      ]}
    />
  );
}
