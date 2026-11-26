// W4-L3's shared stage helpers: hover wiring, the "lit" test, readout cells, segmented buttons,
// the oscilloscope set-up every 2D layer reads (one set of stage params, so the schematic and the
// scope agree), the guided example's reveal level, and the power-on clock of the drift demo.

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { driftLevel, type Ic, type Mode, type SimCfg, VOS, type Wave } from './model';
import './w4l3.css';

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

/** A readout cell: name, value, optional hint; lights with its id. */
export function Cell({ id, name, short, value, hint, cls = '' }: { id: string; name: string; short?: string; value: string; hint?: string; cls?: string }) {
  const on = useIsLit()(id);
  return (
    <div className={`w43-cell ${cls} ${on}`} data-hl={id} {...hoverProps([id])} tabIndex={0}>
      {short ? (
        <span>
          <span className="full">{name}</span>
          <span className="short">{short}</span>
        </span>
      ) : (
        <span>{name}</span>
      )}
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export interface SegOpt<T> {
  v: T;
  full: string;
  short?: string;
  cls?: string;
}

/** a segmented radio group */
export function Seg<T extends string | number | boolean>({
  label,
  value,
  opts,
  set,
  small,
  hl,
}: {
  label: string;
  value: T;
  opts: SegOpt<T>[];
  set: (v: T) => void;
  small?: boolean;
  hl?: string[];
}) {
  return (
    <div className={`w43-seg ${small ? 'small' : ''}`} role="radiogroup" aria-label={label} {...(hl ? hoverProps(hl) : {})}>
      {opts.map((o) => (
        <button key={String(o.v)} role="radio" aria-checked={value === o.v} className={value === o.v ? `on ${o.cls ?? ''}` : ''} onClick={() => set(o.v)}>
          <span className="full">{o.full}</span>
          <span className="short">{o.short ?? o.full}</span>
        </button>
      ))}
    </div>
  );
}

export function Slider({
  name,
  value,
  min,
  max,
  step,
  set,
  text,
  aria,
  hl,
}: {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  set: (v: number) => void;
  text: string;
  aria: string;
  hl: string;
}) {
  const on = useIsLit()(hl);
  return (
    <label className={`w43-slider ${on}`} {...hoverProps([hl])}>
      <span className="w43-sl-name">{name}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} aria-label={aria} aria-valuetext={text} />
      <b>{text}</b>
    </label>
  );
}

/** The control dock: the first row always; on a phone the other rows fold away behind 「调节」. */
export function Dock({ head, children }: { head: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`w43-dock ${open ? 'open' : ''}`}>
      <div className="w43-row">
        {head}
        <button className="w43-toggle w43-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? '收起' : '调节'}
        </button>
      </div>
      <div className="w43-more-rows">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------- the 2D set-up */

/** the guided example (Sadiku 6.6 style): 250 Hz ±3 V square wave into the ideal integrator, v_o(0) = 0 */
export const EX = { f: 250, amp: 3 } as const;

export interface Scope {
  mode: Mode;
  wave: Wave;
  f: number;
  amp: number;
  vos: boolean;
  glitch: boolean;
  ic: Ic;
  /** the stage shows the guided example */
  ex: boolean;
  /** how far the guided example has got: 1 = RC found … 4 = saturation checked; 9 = finished */
  g: number;
  set(p: Partial<Record<'mode' | 'wave' | 'f' | 'amp' | 'vos' | 'glitch' | 'ic' | 'scn', unknown>>): void;
}

export function useScope(): Scope {
  const params = useStage((s) => s.params);
  const setParams = useStage((s) => s.setParams);
  const ex = params.scn === 'ex';
  const g = (params.g as number | undefined) ?? 0;
  const free = {
    mode: (params.mode as Mode | undefined) ?? 'int',
    wave: (params.wave as Wave | undefined) ?? 'square',
    f: (params.f as number | undefined) ?? 500,
    amp: (params.amp as number | undefined) ?? 2,
    vos: (params.vos as boolean | undefined) ?? false,
    glitch: (params.glitch as boolean | undefined) ?? false,
    ic: (params.ic as Ic | undefined) ?? 'sym',
  };
  const exCfg = { mode: 'int' as Mode, wave: 'square' as Wave, f: EX.f, amp: (params.exAmp as number | undefined) ?? EX.amp, vos: false, glitch: false, ic: 'zero' as Ic };
  return { ...(ex ? exCfg : free), ex, g, set: (p) => setParams(p) };
}

/** what the guided example still hides (always nothing outside the example) */
export function hides(s: Scope) {
  const lvl = s.ex ? s.g : 9;
  return {
    /** the slope and the first segment of CH2 */
    seg1: lvl < 2,
    /** the second segment, v_o(4 ms) and V_pp */
    seg2: lvl < 3,
    /** the saturation verdict */
    sat: lvl < 4,
    /** R_f's value (asked in the last step) */
    rf: lvl < 9,
  };
}

/** Seconds since "power-on" for the drift demo: restarts when `key` changes, runs to `max`. */
export function useClock(key: string, active: boolean, max = 4): [number, () => void] {
  const [t, setT] = useState(0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!active) {
      setT(0);
      return;
    }
    if (prefersReducedMotion()) {
      setT(max);
      return;
    }
    let raf = 0;
    let last = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const s = Math.min(max, (now - t0) / 1000);
      if (now - last > 33 || s >= max) {
        last = now;
        setT(s);
      }
      if (s < max) raf = requestAnimationFrame(tick);
    };
    setT(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, active, max, run]);
  return [t, () => setRun((r) => r + 1)];
}

/** the simulation set-up of the scope layer, with the drift reached after `tOn` seconds */
export function useSimCfg(s: Scope, tOn: number): SimCfg {
  const vos = s.vos ? VOS : 0;
  const drift = s.vos && s.mode === 'int' && s.ic === 'sym' ? driftLevel('int', tOn) : 0;
  return useMemo(() => ({ mode: s.mode, wave: s.wave, f: s.f, amp: s.amp, vos, ic: s.ic, drift }), [s.mode, s.wave, s.f, s.amp, vos, s.ic, drift]);
}

/* ------------------------------------------------------------- the 3D bench set-up */

export type BenchPreset = 'int' | 'diff';
export type Cam = 'bench' | 'circuit' | 'scope';

export function useBench() {
  const [preset, setPreset] = useStageParam<BenchPreset>('bpre', 'int');
  const [rf, setRf] = useStageParam('brf', true);
  const [rs, setRs] = useStageParam('brs', true);
  const [wave, setWave] = useStageParam<Wave>('bwave', 'square');
  const [f, setF] = useStageParam('bf', 500);
  const [amp, setAmp] = useStageParam('bamp', 2);
  const [cam, setCam] = useStageParam<Cam>('cam', 'bench');
  const [gen, setGen] = useStageParam('bgen', true);
  const [glitch, setGlitch] = useStageParam('bglitch', false);
  const mode: Mode = preset === 'int' ? (rf ? 'lossy' : 'int') : rs ? 'pdiff' : 'diff';
  return { preset, setPreset, rf, setRf, rs, setRs, wave, setWave, f, setF, amp, setAmp, cam, setCam, gen, setGen, glitch, setGlitch, mode };
}
