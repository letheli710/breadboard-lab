// W2-L8's shared stage state (the sheet's single source of truth { mode, V_Th, R_Th, R_L }) and the
// control dock every layer shows: the theory / breadboard switch and the R_L slider. The state
// lives in the stage params, so the three layers and the acts see one circuit.

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { CASES, clampRl, fmtR, LAB, RL_RANGE, RL_STEP, solve, type Case, type Mode, type Solution, type Source } from './model';
import './w2l8.css';

export interface Sample {
  rl: number;
  vl: number;
  pl: number;
  eta: number;
}

export interface Circuit {
  mode: Mode;
  kase: Case;
  src: Source;
  rl: number;
  sol: Solution;
  /** black box of layer 01: the Thévenin equivalent or the original network */
  view: 'eq' | 'net';
  /** chart axes: R_L / R_Th and P_L / P_max, or real values */
  axis: 'ratio' | 'real';
  /** guided example in progress: what has been found so far (0 nothing, 1 R_Th, 2 + V_Th,
   *  3 + R_L; 9 all) — the stage hides the rest */
  reveal: number;
  samples: Sample[];
  /** largest P_L seen on the breadboard, and where */
  peak: { pl: number; rl: number } | null;
  set: (p: Record<string, unknown>) => void;
  setRl: (rl: number) => void;
}

export function useCircuit(): Circuit {
  const [mode] = useStageParam<Mode>('mode', 'theory');
  const [kase] = useStageParam<Case>('case', 'ex3');
  const [rlT] = useStageParam('rlT', 8);
  const [rlB] = useStageParam('rlB', 1000);
  const [view] = useStageParam<'eq' | 'net'>('view', 'eq');
  const [axis] = useStageParam<'ratio' | 'real'>('axis', 'ratio');
  const [revealRaw] = useStageParam('reveal', 9);
  const [samples] = useStageParam<Sample[]>('samples', []);
  const [peak] = useStageParam<{ pl: number; rl: number } | null>('peak', null);
  const set = useStage((s) => s.setParams);
  const src = mode === 'lab' ? LAB : CASES[kase];
  const rl = mode === 'lab' ? rlB : rlT;
  const sol = solve(src.vth, src.rth, rl);
  const reveal = mode === 'theory' && kase === 'gd' ? revealRaw : 9;
  const setRl = (v: number) => set(mode === 'lab' ? { rlB: clampRl('lab', v) } : { rlT: clampRl('theory', v) });
  return { mode, kase, src, rl, sol, view, axis, reveal, samples, peak, set, setRl };
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

/** The dock: theory / breadboard switch, the R_L slider and its number box; `extra` adds
 *  layer-specific controls. */
export function Dock({ c, extra, lockLab }: { c: Circuit; extra?: ReactNode; lockLab?: boolean }) {
  const [lo, hi] = RL_RANGE[c.mode];
  const step = RL_STEP[c.mode];
  const unit = 'Ω';
  const pick = (mode: Mode) => c.set({ mode });
  return (
    <div className="w8-dock">
      <div className="w8-row">
        {!lockLab && (
          <div className="w8-seg" role="radiogroup" aria-label="电路参数" {...hoverProps(['scale_note'])}>
            <button role="radio" aria-checked={c.mode === 'theory'} className={c.mode === 'theory' ? 'on' : ''} onClick={() => pick('theory')}>
              <span className="full">理论例题（{c.kase === 'gd' && c.reveal < 9 ? '引导例题' : `${CASES[c.kase].vth} V · ${CASES[c.kase].rth} Ω`}）</span>
              <span className="short">理论</span>
            </button>
            <button role="radio" aria-checked={c.mode === 'lab'} className={c.mode === 'lab' ? 'on lab' : ''} onClick={() => pick('lab')}>
              <span className="full">面包板实操（5 V · 1 kΩ）</span>
              <span className="short">面包板</span>
            </button>
          </div>
        )}
        {extra}
      </div>
      <label className="w8-slider" {...hoverProps(['rl'])}>
        <span className="w8-slider-label">{c.mode === 'lab' ? 'B10K 电位器 R_L' : '可调负载 R_L'}</span>
        <input
          type="range"
          min={lo}
          max={hi}
          step={step}
          value={c.rl}
          onChange={(e) => c.setRl(Number(e.target.value))}
          aria-label="负载电阻 R_L"
          aria-valuetext={fmtR(c.rl, c.mode)}
        />
        <input
          className="w8-num"
          type="number"
          min={lo}
          max={hi}
          step={step}
          value={c.mode === 'lab' ? Math.round(c.rl) : Number(c.rl.toFixed(1))}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isFinite(v) && e.target.value !== '') c.setRl(v);
          }}
          aria-label={`R_L 数值（${unit}）`}
        />
        <span className="w8-unit">{unit}</span>
      </label>
    </div>
  );
}

/** The sheet's scaling notice (a non-blocking strip): breadboard values, or the textbook ones. */
export function ScaleNotice({ c }: { c: Circuit }) {
  const on = useIsLit()('scale_note');
  if (c.mode === 'lab')
    return (
      <p className={`w8-notice ${on}`} {...hoverProps(['scale_note'])} role="note">
        <span className="full">已按安全规范等比例缩放至 kΩ 级：V_Th 16 V → 5 V，R_Th 8 Ω → 1 kΩ；R_L / R_Th 比例不变，归一化功率曲线与效率 η 不变</span>
        <span className="short">已按安全规范缩放：5 V · 1 kΩ，曲线与 η 不变</span>
      </p>
    );
  if (c.kase === 'gd') return null;
  return (
    <p className={`w8-notice warn ${on}`} {...hoverProps(['scale_note'])} role="note">
      <span className="full">教材原值：R_Th = 8 Ω &lt; 100 Ω，匹配时 I = 1 A、P = 8 W（1/4 W 电阻额定值的 32 倍），只做理论分析，不直接上面包板</span>
      <span className="short">教材原值 8 Ω / 8 W：只做理论，上板须缩放</span>
    </p>
  );
}
