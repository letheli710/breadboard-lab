// W4-L7's shared stage state: one RLC circuit (topology, R, L, C, v_C(0⁺), the inductor's i(0⁺))
// in the stage params, so the three layers, the acts and the guided example see the same circuit.
// Also the hover helpers and the controls every layer uses (the R slider with its damping zones
// and the R_crit mark, log sliders for L and C, segmented switches, readout cells).

import { useEffect, useRef, type KeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { fmtC, fmtL, fmtR, PRESETS, rcritOf, rRange, snapR, solve, type Circuit, type PresetKey, type Sol, type Topo } from './model';
import './w4l7.css';

export interface Lab {
  c: Circuit;
  /** resistance that stays in the loop (bench: the inductor's winding) */
  rl: number;
  s: Sol;
  preset: PresetKey | 'free';
  /** the guided example is running and has found this much (0 … 4; 9 = finished / not running) */
  reveal: number;
  /** a number the guided example has not reached yet: hide it */
  hidden: (level: number) => boolean;
  /** the circuit is locked while the guided example runs */
  locked: boolean;
  ghost: boolean;
  set: (p: Record<string, unknown>) => void;
}

/** the stage params of a preset (acts set these on scroll) */
export function presetParams(key: PresetKey, extra: Record<string, unknown> = {}): Record<string, unknown> {
  const p = PRESETS[key];
  return { preset: key, topo: p.topo, R: p.R, L: p.L, C: p.C, v0: p.v0, i0: p.i0, rl: p.rl, reveal: 9, ghost: false, ...extra };
}

export function useLab(): Lab {
  const d = PRESETS.demo;
  const [topo] = useStageParam<Topo>('topo', d.topo);
  const [R] = useStageParam('R', d.R);
  const [L] = useStageParam('L', d.L);
  const [C] = useStageParam('C', d.C);
  const [v0] = useStageParam('v0', d.v0);
  const [i0] = useStageParam('i0', d.i0);
  const [rl] = useStageParam('rl', d.rl);
  const [preset] = useStageParam<PresetKey | 'free'>('preset', 'demo');
  const [revealRaw] = useStageParam('reveal', 9);
  const [ghost] = useStageParam('ghost', false);
  const set = useStage((s) => s.setParams);
  const reveal = preset === 'gd' ? revealRaw : 9;
  const c: Circuit = { topo, R, L, C, v0, i0 };
  return { c, rl, s: solve(c), preset, reveal, hidden: (level) => reveal < level, locked: reveal < 9, ghost, set };
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
export function Seg<T extends string | number | boolean>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: SegOption<T>[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="w47-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={o.value === value}
          className={o.value === value ? 'on' : ''}
          disabled={disabled}
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
export function Cell({ id, name, value, tone, hint }: { id: string; name: ReactNode; value: ReactNode; tone?: string; hint?: string }) {
  const on = useIsLit()(id);
  return (
    <div className={`w47-cell ${tone ?? ''} ${on}`} {...hoverProps([id])} tabIndex={0}>
      <span>{name}</span>
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );
}

/** Series ⇄ parallel switch (keeps L, C; R moves to the same damping ratio's place on the other side). */
export function TopoSwitch({ lab }: { lab: Lab }) {
  const flip = (t: Topo) => {
    if (t === lab.c.topo) return;
    // keep R where it is when it fits the other range, else start at the same ζ = 0.5
    const r = rRange(t, lab.c.L, lab.c.C, t === 'series' ? lab.rl : 0);
    const R = lab.c.R >= r.lo && lab.c.R <= r.hi ? lab.c.R : t === 'series' ? r.lo + rcritOf(t, lab.c.L, lab.c.C) / 2 : 2 * rcritOf(t, lab.c.L, lab.c.C);
    lab.set({ topo: t, R, preset: 'free', i0: 0 });
  };
  return (
    <Seg<Topo>
      label="拓扑"
      value={lab.c.topo}
      onChange={flip}
      disabled={lab.locked}
      options={[
        { value: 'series', label: '串联 RLC（KVL）', short: '串联', hover: ['sch_loop'] },
        { value: 'parallel', label: '并联 RLC（KCL）', short: '并联', hover: ['sch_node'] },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ the R slider */

/** position 0 … 1 of R on its range */
function fracOf(R: number, r: { lo: number; hi: number; log: boolean }) {
  const f = r.log ? Math.log(R / r.lo) / Math.log(r.hi / r.lo) : (R - r.lo) / (r.hi - r.lo);
  return Math.min(1, Math.max(0, f));
}
function rOf(f: number, r: { lo: number; hi: number; log: boolean }) {
  return r.log ? r.lo * (r.hi / r.lo) ** f : r.lo + f * (r.hi - r.lo);
}

/**
 * The resistance slider: its track is coloured by damping case (blue under-, red over-damped) and
 * marks the boundary R_crit (α = ω0), where the thumb snaps. `pot` shows the potentiometer's own
 * reading R − R_L (the bench).
 */
export function RSlider({ lab, pot = false, label = 'R' }: { lab: Lab; pot?: boolean; label?: ReactNode }) {
  const on = useIsLit();
  const track = useRef<HTMLDivElement>(null);
  const { topo, L, C, R } = lab.c;
  const rl = topo === 'series' ? lab.rl : 0;
  const r = rRange(topo, L, C, rl);
  const rc = rcritOf(topo, L, C);
  const fc = fracOf(rc, r);
  const f = fracOf(R, r);
  const hideCrit = lab.hidden(1);
  const disabled = lab.locked;
  const setF = (x: number) => {
    let v = rOf(Math.min(1, Math.max(0, x)), r);
    v = snapR(v, rc);
    lab.set({ R: v });
  };
  const fromEvent = (e: RPointerEvent<HTMLDivElement>) => {
    const box = track.current?.getBoundingClientRect();
    if (!box) return;
    setF((e.clientX - box.left) / box.width);
  };
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const step = e.shiftKey ? 0.05 : 0.01;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setF(f + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setF(f - step);
    else if (e.key === 'Home') setF(0);
    else if (e.key === 'End') setF(1);
    else return;
    e.preventDefault();
  };
  const left = topo === 'series' ? 'under' : 'over';
  const right = topo === 'series' ? 'over' : 'under';
  const shown = pot ? R - rl : R;
  return (
    <div className={`w47-rs ${disabled ? 'off' : ''} ${on('sch_r', 'bb_pot', 'r_crit')}`}>
      <span className="w47-rs-label" {...hoverProps(pot ? ['bb_pot'] : ['sch_r'])}>
        {label}
      </span>
      <div
        ref={track}
        className={`w47-rs-track ${left}-${right}`}
        style={{ ['--fc' as string]: `${(hideCrit ? 0.5 : fc) * 100}%` }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={pot ? '电位器读数 R_pot' : '电阻 R'}
        aria-valuemin={pot ? r.lo - rl : r.lo}
        aria-valuemax={pot ? r.hi - rl : r.hi}
        aria-valuenow={shown}
        aria-valuetext={fmtR(shown)}
        aria-disabled={disabled}
        onKeyDown={key}
        onPointerDown={(e) => {
          if (disabled) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          fromEvent(e);
        }}
        onPointerMove={(e) => {
          if (!disabled && e.currentTarget.hasPointerCapture(e.pointerId)) fromEvent(e);
        }}
      >
        {!hideCrit && (
          <span className={`w47-rs-crit ${on('r_crit')}`} style={{ left: `${fc * 100}%` }} {...hoverProps(['r_crit'])}>
            <i>{pot ? `${fmtR(rc - rl)}` : `R_crit ${fmtR(rc)}`}</i>
          </span>
        )}
        <span className="w47-rs-thumb" style={{ left: `${f * 100}%` }} />
      </div>
      <b className="w47-rs-val">{fmtR(shown)}</b>
    </div>
  );
}

/** A log-scale slider for L or C. */
export function LogSlider({
  name,
  value,
  lo,
  hi,
  fmt,
  onChange,
  disabled,
  hover,
}: {
  name: string;
  value: number;
  lo: number;
  hi: number;
  fmt: (v: number) => string;
  onChange: (v: number) => void;
  disabled?: boolean;
  hover: string[];
}) {
  const N = 600;
  const pos = Math.round((Math.log(value / lo) / Math.log(hi / lo)) * N);
  return (
    <label className="w47-ls" {...hoverProps(hover)}>
      <span>{name}</span>
      <input
        type="range"
        min={0}
        max={N}
        value={Math.min(N, Math.max(0, pos))}
        disabled={disabled}
        aria-label={name}
        aria-valuetext={fmt(value)}
        onChange={(e) => {
          // three significant figures, so the presets' round values come back exactly
          const v = lo * (hi / lo) ** (Number(e.target.value) / N);
          const p = 10 ** Math.floor(Math.log10(v));
          onChange((Math.round((v / p) * 100) / 100) * p);
        }}
      />
      <b>{fmt(value)}</b>
    </label>
  );
}

export const L_RANGE: [number, number] = [1e-3, 1];
export const C_RANGE: [number, number] = [1e-7, 0.1];

/** The L and C sliders (they leave the preset: the circuit is then the student's own). */
export function LcSliders({ lab }: { lab: Lab }) {
  const move = (p: Record<string, unknown>) => lab.set({ ...p, preset: 'free' });
  return (
    <>
      <LogSlider name="L" value={lab.c.L} lo={L_RANGE[0]} hi={L_RANGE[1]} fmt={fmtL} onChange={(L) => move({ L })} disabled={lab.locked} hover={['sch_l']} />
      <LogSlider name="C" value={lab.c.C} lo={C_RANGE[0]} hi={C_RANGE[1]} fmt={fmtC} onChange={(C) => move({ C })} disabled={lab.locked} hover={['sch_c']} />
    </>
  );
}

/** "the guided example is running" note */
export function GuidedNote() {
  return <p className="w47-readout gd">引导例题进行中：α、ω₀、ω_d、B₁、B₂ 与波形会随你在右侧逐步求出而揭晓。</p>;
}
