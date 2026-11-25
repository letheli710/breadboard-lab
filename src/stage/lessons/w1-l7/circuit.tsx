// W1-L7's shared stage state and controls. The circuit (topology, Vs, R1, R2, RL, R3, scale, meter
// range) lives in the stage params, so the three layers and the acts see one circuit; each layer
// shows the same control bar (the sheet's global_controls).

import { useEffect, useState, type ReactNode } from 'react';
import { useStage, useStageParam } from '../../stageStore';
import { DEFAULTS, fmtSlider, solve, TOPOS, type Meter, type Scale, type Solution, type Topo } from './model';
import './l7.css';

export interface Circuit {
  topo: Topo;
  vs: number;
  r1: number;
  r2: number;
  rl: number;
  r3: number;
  scale: Scale;
  meter: Meter;
  sol: Solution;
  set: (p: Partial<Omit<Circuit, 'sol' | 'set'>>) => void;
}

/** picking a topology loads the values its act uses (the guided example, the three branches) */
const TOPO_PRESET: Partial<Record<Topo, Partial<Circuit>>> = {
  mixed_socratic: { r1: 1, r2: 6, r3: 3 },
  parallel3: { r1: 2, r2: 3, r3: 6 },
};

export function useCircuit(): Circuit {
  const [topo] = useStageParam<Topo>('topo', DEFAULTS.topo);
  const [vs] = useStageParam('vs', DEFAULTS.vs);
  const [r1] = useStageParam('r1', DEFAULTS.r1);
  const [r2] = useStageParam('r2', DEFAULTS.r2);
  const [rl] = useStageParam('rl', DEFAULTS.rl);
  const [r3] = useStageParam('r3', DEFAULTS.r3);
  const [scale] = useStageParam<Scale>('scale', DEFAULTS.scale);
  const [meter] = useStageParam<Meter>('meter', DEFAULTS.meter);
  const setParams = useStage((s) => s.setParams);
  const sol = solve(topo, vs, r1, r2, rl, r3, scale);
  return { topo, vs, r1, r2, rl, r3, scale, meter, sol, set: setParams };
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

const narrowNow = () => typeof matchMedia === 'function' && matchMedia('(max-width: 960px)').matches;

function Slider({
  label,
  id,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  id: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="l7-slider" {...hoverProps([id])}>
      <span className="l7-slider-label">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={`${value} ${unit}`} />
      <b>
        {value % 1 === 0 && unit === 'V' ? value.toFixed(1) : value} {unit}
      </b>
    </label>
  );
}

/** The control bar: topology toggle, then the sliders (folded on narrow screens). `extra` adds
 *  layer-specific switches (meter range …) next to the scale switch. */
export function Controls({ c, extra }: { c: Circuit; extra?: ReactNode }) {
  const [open, setOpen] = useState(() => !narrowNow());
  const unit = c.scale === 'board' ? 'kΩ' : 'Ω';
  const showRl = c.topo === 'loaded_vdiv';
  const showR3 = c.topo === 'mixed_socratic' || c.topo === 'parallel3';
  const summary = [
    `Vs ${c.vs.toFixed(1)} V`,
    `R1 ${fmtSlider(c.r1, c.scale)}`,
    `R2 ${fmtSlider(c.r2, c.scale)}`,
    showRl && `RL ${fmtSlider(c.rl, c.scale)}`,
    showR3 && `R3 ${fmtSlider(c.r3, c.scale)}`,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <div className="l7-ctrl">
      <div className="l7-seg topo" role="radiogroup" aria-label="电路拓扑切换">
        {TOPOS.map((t) => (
          <button
            key={t.value}
            role="radio"
            aria-checked={c.topo === t.value}
            className={c.topo === t.value ? 'on' : ''}
            onClick={() => c.set({ topo: t.value, ...TOPO_PRESET[t.value] })}
            title={t.label}
          >
            {t.short} <small>{t.formula}</small>
          </button>
        ))}
      </div>
      <div className="l7-switches">
        <div className="l7-seg small" role="radiogroup" aria-label="阻值标度" {...hoverProps(['tok_safety_scale'])}>
          <button role="radio" aria-checked={c.scale === 'board'} className={c.scale === 'board' ? 'on' : ''} onClick={() => c.set({ scale: 'board' })}>
            <span className="full">面包板安全值 (kΩ)</span>
            <span className="short">面包板 kΩ</span>
          </button>
          <button role="radio" aria-checked={c.scale === 'textbook'} className={c.scale === 'textbook' ? 'on bad' : ''} onClick={() => c.set({ scale: 'textbook' })}>
            <span className="full">教材原值 (Ω)</span>
            <span className="short">教材 Ω</span>
          </button>
        </div>
        {extra}
        <button className="l7-fold" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? (
            '收起参数'
          ) : (
            <>
              <span className="full">{summary}</span>
              <span className="short">调参数</span>
            </>
          )}
        </button>
      </div>
      {open && (
        <div className="l7-sliders">
          <Slider label="输入电源电压 Vs" id="tok_vs" value={c.vs} min={1} max={12} step={0.5} unit="V" onChange={(vs) => c.set({ vs })} />
          <Slider
            label={`电阻 R1${c.scale === 'board' ? '（面包板已按 1000× 缩放）' : '（教材原值）'}`}
            id="tok_r1"
            value={c.r1}
            min={0.5}
            max={10}
            step={0.5}
            unit={unit}
            onChange={(r1) => c.set({ r1 })}
          />
          <Slider
            label={`电阻 R2${c.scale === 'board' ? '（面包板已按 1000× 缩放）' : '（教材原值）'}`}
            id="tok_r2"
            value={c.r2}
            min={0.5}
            max={10}
            step={0.5}
            unit={unit}
            onChange={(r2) => c.set({ r2 })}
          />
          {showRl && <Slider label="负载电阻 RL（仅在带载分压模式启用）" id="tok_rl" value={c.rl} min={0.5} max={50} step={0.5} unit={unit} onChange={(rl) => c.set({ rl })} />}
          {showR3 && <Slider label="电阻 R3" id="tok_r3" value={c.r3} min={0.5} max={10} step={0.5} unit={unit} onChange={(r3) => c.set({ r3 })} />}
        </div>
      )}
    </div>
  );
}

/** The scaling notice the blueprint requires wherever breadboard values are shown. */
export function ScaleNotice({ c }: { c: Circuit }) {
  return c.scale === 'board' ? (
    <span className="l7-notice" {...hoverProps(['tok_safety_scale'])}>
      阻值已按教材 ×1000 等比例放大以保护实验箱，分压比/增益不变
    </span>
  ) : (
    <span className="l7-notice bad" {...hoverProps(['tok_safety_scale'])}>
      教材原值（Ω 级）直接上 9 V 面包板：比例不变，但电流与功耗放大 1000 倍
    </span>
  );
}
