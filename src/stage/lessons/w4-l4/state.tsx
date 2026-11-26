// W4-L4's stage settings (shared by the three layers, set by acts and guided steps) and the small
// controls the layers share. Params:
// - sw: 'charge' (t < 0, switch on the source) | 'discharge' (t > 0, source-free);
// - tn: the time after the switch, in time constants (0 … 6); the play buttons run it at 1 τ/s;
// - topo: layer 01's circuit, 'rc' (the breadboard RC) | 'rl' (act 4's coil) | 'net' (act 5);
// - reveal: how much of the act-5 network the stage may show (hidden until the guided example is done)
//   (0 nothing … 5 everything but the energies, 9 all; see NEED);
// - thev: layer 01's Thévenin overlay;
// - mode: layer 02's waveform, 'rc' | 'rl' | 'net'; rS / cS (Ω / F) and lS / rlR (H / Ω) its sliders;
//   tan / marks / bars: the tangent, the 1τ / 5τ lines and the energy bars;
// - cam: the 3D camera ('bench' | 'circuit' | 'scope'); pol: the electrolytic's polarity ('ok' | 'rev').

import { useEffect, type ReactNode } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { useLit, useStage, useStageParam } from '../../stageStore';
import './w4l4.css';

export const L1 = 'layer_01_schematic';
export const L2 = 'layer_02_oscilloscope';
export const L3 = 'layer_03_breadboard_3d';

export type Sw = 'charge' | 'discharge';
export type Topo = 'rc' | 'rl' | 'net';
export type Mode = 'rc' | 'rl' | 'net';

/** the last time shown (in τ) */
export const T_MAX = 6;

/** what the stage may show of the act-5 network, by the steps solved so far */
export type Shown = 'v0' | 'cont' | 'rth' | 'wave' | 'energy';
const NEED: Record<Shown, number> = { v0: 1, cont: 2, rth: 3, wave: 4, energy: 5 };

export function useReveal() {
  // hidden until the guided example is done (or act 6, which follows it, is reached)
  const [rv] = useStageParam('reveal', 0);
  const set = useStage((s) => s.setParams);
  return { level: rv, masked: rv < 9, shown: (k: Shown) => rv >= NEED[k], reveal: () => set({ reveal: 9 }) };
}

export function useTime(): { sw: Sw; tn: number; setSw: (s: Sw) => void; setTn: (t: number) => void } {
  const [sw, setSw] = useStageParam<Sw>('sw', 'discharge');
  const [tn, setTn] = useStageParam('tn', 0);
  return { sw, tn: Math.min(T_MAX, Math.max(0, tn)), setSw, setTn };
}

/** the one playback of the lesson (module-level, so every layer's buttons drive the same run) */
let raf = 0;

export function stopPlay() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  if (useStage.getState().params.playing) useStage.getState().setParams({ playing: false });
}

/** Run tn from 0 to T_MAX at 1 τ per second (switching to t > 0). Reduced motion jumps to 1 τ. */
export function startPlay() {
  stopPlay();
  const set = useStage.getState().setParams;
  if (prefersReducedMotion()) {
    set({ sw: 'discharge', tn: 1 });
    return;
  }
  const t0 = performance.now();
  set({ sw: 'discharge', tn: 0, playing: true });
  const tick = (now: number) => {
    const tn = (now - t0) / 1000;
    if (tn >= T_MAX) {
      raf = 0;
      set({ tn: T_MAX, playing: false });
      return;
    }
    set({ tn });
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

/** playback state; a layer that shows play stops the run when it goes away */
export function usePlay(): { playing: boolean; play: () => void; stop: () => void } {
  const [playing] = useStageParam('playing', false);
  useEffect(() => () => stopPlay(), []);
  return { playing, play: startPlay, stop: stopPlay };
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

/** `lit` when one of `ids` is lit right now */
export function useIsLit() {
  const lit = useLit();
  return (...ids: string[]) => (ids.some((id) => lit.includes(id)) ? 'lit' : '');
}

export interface SegOption<T extends string> {
  value: T;
  label: ReactNode;
  short?: ReactNode;
  tone?: 'bad';
  hover?: string[];
}

export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: SegOption<T>[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="w44-seg" role="radiogroup" aria-label={label}>
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
  text,
  onChange,
  hover,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  text: string;
  onChange: (v: number) => void;
  hover?: string[];
}) {
  return (
    <label className="w44-slider" {...(hover ? hov(hover) : {})}>
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={text} />
      <b>{text}</b>
    </label>
  );
}

export function Check({ label, on, set, hover }: { label: string; on: boolean; set: (v: boolean) => void; hover?: string[] }) {
  const isLit = useIsLit();
  return (
    <label className={`w44-check ${hover ? isLit(...hover) : ''}`} {...(hover ? hov(hover) : {})}>
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />
      {label}
    </label>
  );
}

/** the switch (t < 0 / t > 0), the time slider and play */
export function TimeDock({ chargeLabel = 't < 0 充电', hover = ['sw'] }: { chargeLabel?: string; hover?: string[] }) {
  const { sw, tn, setSw, setTn } = useTime();
  const { playing, play, stop } = usePlay();
  return (
    <div className="w44-row">
      <Seg<Sw>
        label="开关"
        value={sw}
        onChange={(v) => {
          stop();
          setSw(v);
          if (v === 'discharge') setTn(0);
        }}
        options={[
          { value: 'charge', label: chargeLabel, short: 't<0', hover },
          { value: 'discharge', label: 't > 0 放电', short: 't>0', hover },
        ]}
      />
      <button className={`w44-play ${playing ? 'on' : ''}`} onClick={playing ? stop : play} aria-label={playing ? '暂停' : '从 t = 0 播放（每秒 1τ）'}>
        {playing ? '暂停' : '▶ 播放'}
      </button>
      <Slider
        label="t"
        value={sw === 'charge' ? 0 : tn}
        min={0}
        max={T_MAX}
        step={0.05}
        text={sw === 'charge' ? 't < 0' : `${tn.toFixed(2)} τ`}
        onChange={(v) => {
          stop();
          useStage.getState().setParams({ sw: 'discharge', tn: v });
        }}
        hover={['tau']}
      />
    </div>
  );
}

/** "the guided example is open: answers hidden · show" */
export function MaskNote() {
  const r = useReveal();
  if (!r.masked) return null;
  return (
    <button className="w44-reveal" onClick={r.reveal}>
      <span className="full">引导例题进行中，答案暂时隐藏 · 显示答案</span>
      <span className="short">答案已隐藏 · 显示</span>
    </button>
  );
}
