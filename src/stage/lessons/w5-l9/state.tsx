// W5-L9's shared stage state (stage params, so the schematic, the Bode plot, the bench, the acts and
// the guided example see one circuit) and the small controls every layer uses.
// - mode: the 01 schematic's topology (plpf / phpf / alpf / ahpf / bpf, and 'design' = act 7's
//   guided design problem, set only by the act)
// - load: the 10 kΩ test load R_L on the output
// - ri / rf / cf: the low-pass family's parts (sliders; the passive RC uses R = Rf, C = Cf)
// - vg: highlight the virtual ground (active modes)
// - view: the Bode layer's curves ('compare' = the three low-pass curves, 'topo' = the topology)
// - f: the sweep frequency (Bode cursor and the generator on the bench); vpp: generator amplitude
// - dReveal: how far the guided design has got; its numbers stay hidden until then
//   (0 nothing, 1 R_i, 2 R_f and K, 3 C_f, 4 the real f_c and the 10 kHz gain, 9 all)

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { C_STEPS, CF, fmtC, fmtHz, fmtR, type Mode, nearest, type Parts, R_STEPS, RF, RI } from './model';
import './w5l9.css';

export type View = 'compare' | 'topo';
export type Cam = 'bench' | 'chip' | 'scope';

export interface Lab {
  mode: Mode;
  load: boolean;
  parts: Parts;
  vg: boolean;
  view: View;
  f: number;
  vpp: number;
  reveal: number;
  set: (p: Record<string, unknown>) => void;
}

const num = (v: unknown, d: number) => (typeof v === 'number' && isFinite(v) && v > 0 ? v : d);

export function useLab(): Lab {
  const [mode] = useStageParam<Mode>('mode', 'plpf');
  const [load] = useStageParam('load', false);
  const [ri] = useStageParam('ri', RI);
  const [rf] = useStageParam('rf', RF);
  const [cf] = useStageParam('cf', CF);
  const [vg] = useStageParam('vg', false);
  const [view] = useStageParam<View>('view', 'compare');
  const [f] = useStageParam('f', 100);
  const [vpp] = useStageParam('vpp', 1);
  const [reveal] = useStageParam('dReveal', 9);
  const set = useStage((s) => s.setParams);
  return {
    mode,
    load: !!load,
    parts: { ri: num(ri, RI), rf: num(rf, RF), cf: num(cf, CF) },
    vg: !!vg,
    view,
    f: Math.min(100e3, Math.max(10, num(f, 100))),
    vpp: Math.min(10, Math.max(0.2, num(vpp, 1))),
    reveal: typeof reveal === 'number' ? reveal : 9,
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
export function Seg<T extends string | number | boolean>({ label, value, options, onChange }: { label: string; value: T; options: SegOption<T>[]; onChange: (v: T) => void }) {
  return (
    <div className="w59-seg" role="radiogroup" aria-label={label}>
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

/** An on / off button. */
export function Toggle({ on, onClick, label, short, ids, tone }: { on: boolean; onClick: () => void; label: string; short?: string; ids?: string[]; tone?: 'bad' }) {
  return (
    <button className={`w59-toggle ${on ? 'on' : ''} ${tone ?? ''}`} aria-pressed={on} onClick={onClick} {...(ids ? hoverProps(ids) : {})}>
      <span className="full">{label}</span>
      <span className="short">{short ?? label}</span>
    </button>
  );
}

/** One readout cell. */
export function Cell({ id, name, value, tone, hint }: { id: string; name: ReactNode; value: ReactNode; tone?: string; hint?: ReactNode }) {
  const on = useIsLit()(id);
  return (
    <div className={`w59-cell ${tone ?? ''} ${on}`} {...hoverProps([id])} tabIndex={0}>
      <span>{name}</span>
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );
}

/** A slider over the E12 steps of a resistor or capacitor. */
export function PartSlider({ name, value, kind, onChange, id }: { name: string; value: number; kind: 'r' | 'c'; onChange: (v: number) => void; id: string }) {
  const steps = kind === 'r' ? R_STEPS : C_STEPS;
  const i = nearest(steps, value);
  const on = useIsLit()(id);
  return (
    <label className={`w59-slider ${on}`} {...hoverProps([id])}>
      <span className="w59-slider-label">{name}</span>
      <input type="range" min={0} max={steps.length - 1} step={1} value={i} onChange={(e) => onChange(steps[Number(e.target.value)])} aria-label={`${name}（E12 标称值）`} />
      <b className="w59-num">{kind === 'r' ? fmtR(steps[i]) : fmtC(steps[i])}</b>
    </label>
  );
}

/** log-scale frequency slider (10 Hz – 100 kHz, or the given range) with presets */
export function FreqSlider({ lab, min = 10, max = 100e3, presets = [100, 723.43, 1000, 10000] }: { lab: Lab; min?: number; max?: number; presets?: number[] }) {
  const on = useIsLit()('bd_cursor', 'bb_gen');
  const pos = Math.log10(lab.f / min) / Math.log10(max / min);
  return (
    <div className={`w59-slider w59-freq ${on}`} {...hoverProps(['bd_cursor'])}>
      <label>
        <span className="w59-slider-label">f</span>
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={Math.round(Math.min(1, Math.max(0, pos)) * 1000)}
          onChange={(e) => lab.set({ f: Number((min * Math.pow(max / min, Number(e.target.value) / 1000)).toPrecision(4)) })}
          aria-label="扫频频率 f"
        />
      </label>
      <b className="w59-num">{fmtHz(lab.f)}</b>
      <div className="w59-presets" role="group" aria-label="扫频频点">
        {presets.map((p) => (
          <button key={p} className={Math.abs(lab.f - p) / p < 0.005 ? 'on' : ''} onClick={() => lab.set({ f: p })}>
            {p === 723.43 ? 'fc' : fmtHz(p).replace(' ', '')}
          </button>
        ))}
      </div>
    </div>
  );
}

/** "自动扫频": a logarithmic sweep 100 Hz → 10 kHz in about 8 s (stepwise with reduced motion). */
export function SweepButton({ lab }: { lab: Lab }) {
  const [running, setRunning] = useState(false);
  const raf = useRef(0);
  const { set } = lab;
  useEffect(() => {
    if (!running) return;
    const lo = 100;
    const hi = 10000;
    if (prefersReducedMotion()) {
      let k = 0;
      const pts = [100, 200, 500, 723.43, 1000, 2000, 5000, 10000];
      set({ f: pts[0] });
      const id = window.setInterval(() => {
        k += 1;
        if (k >= pts.length) {
          window.clearInterval(id);
          setRunning(false);
          return;
        }
        set({ f: pts[k] });
      }, 700);
      return () => window.clearInterval(id);
    }
    const t0 = performance.now();
    const tick = (t: number) => {
      const u = Math.min(1, (t - t0) / 8000);
      set({ f: Number((lo * Math.pow(hi / lo, u)).toPrecision(4)) });
      if (u < 1) raf.current = requestAnimationFrame(tick);
      else setRunning(false);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running, set]);
  return (
    <button className={`w59-toggle ${running ? 'on' : ''}`} aria-pressed={running} onClick={() => setRunning(!running)} {...hoverProps(['bb_gen', 'bd_cursor'])}>
      <span className="full">{running ? '停止扫频' : '自动扫频 100 Hz → 10 kHz'}</span>
      <span className="short">{running ? '停止' : '扫频'}</span>
    </button>
  );
}

/** "?" until the guided design reaches `need` */
export const masked = (lab: Lab, need: number, text: string) => (lab.mode !== 'design' || lab.reveal >= need ? text : '?');
