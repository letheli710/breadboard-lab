// W1-L1 layer "01 电荷流动与电流方向": a see-through copper wire with an observation cross-section.
// Live mode: a slider sets i ∈ [−5 A, +5 A] (reference direction: to the right); the particles
// move with the conventional current (positive charges) or, switched over, as the real electron
// stream (the other way). A negative i shows its equivalent ("等价于 +3 A 向左").
// Two worked-example modes replace the current slider with a time slider and add a plot under
// the wire: "deriv" (Example 1.2 style: q(t) = 3t² − t C, its slope i = 6t − 1 A) and
// "integral" (Example 1.3: i(t) = 3t² − t A, the area from t = 1 s, Q = 5.5 C at t = 2 s).
// Stage params: cf_i (A), cf_view ('conventional' | 'electron'), cf_plot ('none' | 'deriv' |
// 'integral'), cf_t (s). Hover ids: wire_cross_section, electron_stream.

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { useLit, useStage, useStageParam } from '../../stageStore';
import './w1l1.css';

export type FlowView = 'conventional' | 'electron';
export type FlowPlot = 'none' | 'deriv' | 'integral';

/** electrons per coulomb: 1 / 1.602×10⁻¹⁹ */
const E_PER_C = 1 / 1.602e-19;

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };

/** 1.87 × 10¹⁹ */
export function sci(x: number): string {
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = x / 10 ** e;
  return `${m.toFixed(2)} × 10${String(e)
    .split('')
    .map((c) => SUP[c])
    .join('')}`;
}

/** a signed number with a real minus sign */
export const signed = (x: number, digits = 1) => {
  const s = Math.abs(x).toFixed(digits);
  return x < 0 && Number(s) !== 0 ? `−${s}` : x > 0 && Number(s) !== 0 ? `+${s}` : s;
};
const unsigned = (x: number, digits = 1) => Math.abs(x).toFixed(digits);

/* ------------------------------------------------------------- the two worked examples */

const PLOT = {
  deriv: { t0: 0, t1: 2.5, f: (t: number) => 3 * t * t - t, i: (t: number) => 6 * t - 1, yLabel: 'q (C)', name: 'q(t) = 3t² − t' },
  integral: { t0: 1, t1: 2, f: (t: number) => 3 * t * t - t, i: (t: number) => 3 * t * t - t, yLabel: 'i (A)', name: 'i(t) = 3t² − t' },
} as const;

/** charge through the section from t = 1 s: [τ³ − τ²/2] from 1 to t */
const Q13 = (t: number) => t ** 3 - (t * t) / 2 - 0.5;

// plot frame (viewBox 480 × 176): t ∈ [0, 2.5], value ∈ [−1, 17]
const PX = (t: number) => 46 + (t / 2.5) * 414;
const PY = (v: number) => 24 + ((17 - v) / 18) * 124;

function Plot({ kind, t }: { kind: 'deriv' | 'integral'; t: number }) {
  const p = PLOT[kind];
  const curve: string[] = [];
  for (let k = 0; k <= 60; k++) {
    const s = (k / 60) * 2.5;
    curve.push(`${k ? 'L' : 'M'} ${PX(s).toFixed(1)} ${PY(p.f(s)).toFixed(1)}`);
  }
  let extra;
  if (kind === 'deriv') {
    const q = p.f(t);
    const m = p.i(t);
    const [a, b] = [Math.max(0, t - 0.45), Math.min(2.5, t + 0.45)];
    extra = (
      <g>
        <line x1={PX(a)} y1={PY(q + m * (a - t))} x2={PX(b)} y2={PY(q + m * (b - t))} className="w1l1-tangent" />
        <circle cx={PX(t)} cy={PY(q)} r="5" className="w1l1-dot" />
        <text x={PX(t) + (t > 1.7 ? -10 : 10)} y={PY(q) + (t > 1.7 ? -10 : 18)} textAnchor={t > 1.7 ? 'end' : 'start'} className="w1l1-plot-note">
          斜率 dq/dt = i = {signed(m, 2)} A
        </text>
      </g>
    );
  } else {
    const pts: string[] = [`${PX(1)},${PY(0)}`];
    for (let k = 0; k <= 30; k++) {
      const s = 1 + (k / 30) * (t - 1);
      pts.push(`${PX(s).toFixed(1)},${PY(p.f(s)).toFixed(1)}`);
    }
    pts.push(`${PX(t)},${PY(0)}`);
    extra = (
      <g>
        <polygon points={pts.join(' ')} className="w1l1-area" />
        <line x1={PX(1)} y1={PY(0)} x2={PX(1)} y2={PY(17)} className="w1l1-limit" />
        <line x1={PX(2)} y1={PY(0)} x2={PX(2)} y2={PY(17)} className="w1l1-limit" />
        <text x={PX(1) + 4} y={PY(16)} className="w1l1-plot-tick">
          下限 1 s
        </text>
        <text x={PX(2) + 4} y={PY(16)} className="w1l1-plot-tick">
          上限 2 s
        </text>
        <circle cx={PX(t)} cy={PY(p.f(t))} r="5" className="w1l1-dot" />
        <text x={PX(1.02)} y={PY(13)} className="w1l1-plot-note">
          面积 Q = {Q13(t).toFixed(2)} C
        </text>
      </g>
    );
  }
  return (
    <svg viewBox="0 0 480 176" className="w1l1-plot" role="img" aria-label={`${p.name} 的曲线，t = ${t.toFixed(2)} s`}>
      <rect x="2" y="2" width="476" height="172" rx="10" className="w1l1-panel" />
      {[0, 4, 8, 12, 16].map((v) => (
        <g key={v}>
          <line x1={PX(0)} y1={PY(v)} x2={PX(2.5)} y2={PY(v)} className={v === 0 ? 'w1l1-axis' : 'w1l1-grid'} />
          <text x={PX(0) - 6} y={PY(v) + 4} textAnchor="end" className="w1l1-plot-tick">
            {v}
          </text>
        </g>
      ))}
      {[0, 0.5, 1, 1.5, 2, 2.5].map((s) => (
        <text key={s} x={PX(s)} y={PY(-1) + 14} textAnchor="middle" className="w1l1-plot-tick">
          {s}
        </text>
      ))}
      <text x="8" y="15" className="w1l1-plot-axis-label">
        {p.yLabel}
      </text>
      {extra}
      <path d={curve.join(' ')} className="w1l1-curve" />
      <text x={PX(0.12)} y={PY(15.4)} className="w1l1-plot-name">
        {p.name}
      </text>
      <text x={PX(2.5)} y={PY(0) - 6} textAnchor="end" className="w1l1-plot-tick">
        t / s
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------- the wire */

const WIRE = { x0: 30, x1: 450, y0: 58, y1: 112 };
const SECTION_X = 240;
const N_PARTICLES = 18;
const ROWS = [70, 85, 100];

export default function ChargeFlow() {
  const [iLive, setI] = useStageParam<number>('cf_i', 2);
  const [view, setView] = useStageParam<FlowView>('cf_view', 'conventional');
  const [plot] = useStageParam<FlowPlot>('cf_plot', 'none');
  const [tRaw, setT] = useStageParam<number>('cf_t', 2);
  const setHover = useStage((s) => s.setHover);
  const lit = useLit();
  const still = prefersReducedMotion();

  const ex = plot === 'none' ? null : PLOT[plot];
  const t = ex ? Math.min(ex.t1, Math.max(ex.t0, tRaw)) : 0;
  const i = ex ? ex.i(t) : iLive;

  // a hovered object that unmounts gets no pointerleave
  useEffect(() => () => setHover(null), [setHover]);

  // particle drift: px per second ∝ |i| (capped), sign: + charges with i, electrons against it
  const [phase, setPhase] = useState(0);
  const speedRef = useRef(0);
  const dir = view === 'electron' ? -1 : 1;
  speedRef.current = dir * Math.sign(i) * Math.min(Math.abs(i), 12) * 11;
  useEffect(() => {
    if (still) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (speedRef.current) setPhase((p) => (p + speedRef.current * dt) % 10000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [still]);

  // play the worked example's time axis
  const [playing, setPlaying] = useState(false);
  const tRef = useRef(t);
  tRef.current = t;
  useEffect(() => {
    if (!playing || !ex) return;
    let raf = 0;
    let last = performance.now();
    let cur = tRef.current >= ex.t1 - 1e-6 ? ex.t0 : tRef.current;
    const tick = (now: number) => {
      cur = Math.min(ex.t1, cur + ((now - last) / 1000) * ((ex.t1 - ex.t0) / 3));
      last = now;
      useStage.getState().setParams({ cf_t: Math.round(cur * 100) / 100 });
      if (cur >= ex.t1) setPlaying(false);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, ex]);

  const L = WIRE.x1 - WIRE.x0 - 20;
  const spacing = L / N_PARTICLES;
  const particles = Array.from({ length: N_PARTICLES }, (_, k) => {
    const base = k * spacing + (k % 3) * (spacing / 3);
    const x = WIRE.x0 + 10 + ((((base + phase) % L) + L) % L);
    return { x, y: ROWS[k % 3], k };
  });

  const sectionLit = lit.includes('wire_cross_section');
  const electronsLit = lit.includes('electron_stream');
  const hover = (id: string) => ({ onPointerEnter: () => setHover([id]), onPointerLeave: () => setHover(null) });
  const mag = Math.abs(i);
  const zero = mag < 1e-9;
  const right = i > 0;
  const eRate = mag * E_PER_C;

  // the conventional-current arrow (and the electron arrow against it)
  const arrow = (y: number, toRight: boolean, cls: string) => {
    const [a, b] = toRight ? [150, 330] : [330, 150];
    const h = toRight ? -10 : 10;
    return (
      <g className={cls}>
        <line x1={a} y1={y} x2={b} y2={y} />
        <polygon points={`${b},${y} ${b + h},${y - 6} ${b + h},${y + 6}`} />
      </g>
    );
  };

  return (
    <div className={`w1l1-layer ${ex ? 'plot' : ''}`}>
      <div className="w1l1-controls">
        {ex ? (
          <label className="w1l1-slider">
            <span>时间 t</span>
            <input
              type="range"
              min={ex.t0}
              max={ex.t1}
              step={0.05}
              value={t}
              onChange={(e) => {
                setPlaying(false);
                setT(Number(e.target.value));
              }}
              aria-valuetext={`${t.toFixed(2)} 秒`}
            />
            <b>{t.toFixed(2)} s</b>
            <button className="w1l1-play" onClick={() => setPlaying((p) => !p)}>
              {playing ? '暂停' : '播放'}
            </button>
          </label>
        ) : (
          <label className="w1l1-slider">
            <span>电流 i</span>
            <input type="range" min={-5} max={5} step={0.5} value={iLive} onChange={(e) => setI(Number(e.target.value))} aria-valuetext={`${signed(iLive)} 安`} />
            <b>{signed(iLive)} A</b>
          </label>
        )}
        <div className="w1l1-seg" role="radiogroup" aria-label="显示哪种方向">
          <button role="radio" aria-checked={view === 'conventional'} className={view === 'conventional' ? 'on' : ''} onClick={() => setView('conventional')}>
            习惯电流方向（正电荷）
          </button>
          <button
            role="radio"
            aria-checked={view === 'electron'}
            className={`${view === 'electron' ? 'on' : ''} ${electronsLit ? 'lit' : ''}`}
            onClick={() => setView('electron')}
            {...hover('electron_stream')}
          >
            真实电子流方向（反向）
          </button>
        </div>
      </div>

      <svg
        viewBox="0 0 480 192"
        className={`w1l1-wire ${ex ? 'with-plot' : ''}`}
        role="img"
        aria-label={`铜导线剖面：参考方向向右，i = ${signed(i)} A，${view === 'electron' ? '显示自由电子流' : '显示正电荷（习惯电流）'}`}
      >
        <rect x="2" y="2" width="476" height="188" rx="10" className="w1l1-panel" />
        {/* reference direction: always drawn to the right */}
        <g className="w1l1-ref">
          <line x1="150" y1="30" x2="330" y2="30" />
          <polygon points="330,30 320,24 320,36" />
          <text x="240" y="22" textAnchor="middle">
            参考方向（假设向右） i = {signed(i)} A
          </text>
        </g>
        {/* the wire */}
        <rect x={WIRE.x0} y={WIRE.y0} width={WIRE.x1 - WIRE.x0} height={WIRE.y1 - WIRE.y0} rx="22" className="w1l1-copper" />
        <line x1={WIRE.x0 + 16} y1={WIRE.y0 + 8} x2={WIRE.x1 - 16} y2={WIRE.y0 + 8} className="w1l1-shine" />
        {/* particles */}
        <g className={`w1l1-particles ${view} ${electronsLit && view === 'electron' ? 'lit' : ''}`} {...(view === 'electron' ? hover('electron_stream') : {})}>
          {view === 'electron' && <rect x={WIRE.x0} y={WIRE.y0} width={WIRE.x1 - WIRE.x0} height={WIRE.y1 - WIRE.y0} rx="22" className="w1l1-hit" />}
          {particles.map((p) => (
            <g key={p.k} transform={`translate(${p.x.toFixed(1)} ${p.y})`}>
              <circle r="6.5" />
              <text y="3.5" textAnchor="middle">
                {view === 'electron' ? '−' : '+'}
              </text>
            </g>
          ))}
        </g>
        {/* observation cross-section */}
        <g className={`w1l1-section ${sectionLit ? 'lit' : ''}`} {...hover('wire_cross_section')}>
          <rect x={SECTION_X - 18} y={WIRE.y0 - 8} width="36" height={WIRE.y1 - WIRE.y0 + 16} className="w1l1-hit" />
          <ellipse cx={SECTION_X} cy={(WIRE.y0 + WIRE.y1) / 2} rx="9" ry={(WIRE.y1 - WIRE.y0) / 2 + 2} />
          <text x={SECTION_X + 16} y={WIRE.y0 - 4} className="w1l1-section-label">
            观测横截面
          </text>
        </g>
        {/* actual directions: a label centred above each arrow */}
        {zero ? (
          <text x="240" y="146" textAnchor="middle" className="w1l1-zero">
            i = 0：没有电荷定向穿过截面
          </text>
        ) : (
          <>
            <text x="240" y="135" textAnchor="middle" className="w1l1-conv-label">
              习惯电流 {unsigned(i)} A {right ? '向右' : '向左'}
            </text>
            {arrow(146, right, 'w1l1-conv')}
            {view === 'electron' && (
              <>
                <text x="240" y="169" textAnchor="middle" className="w1l1-elec-label">
                  电子流{!right ? '向右' : '向左'}（与习惯电流相反）
                </text>
                {arrow(180, !right, 'w1l1-elec')}
              </>
            )}
          </>
        )}
      </svg>

      {ex && plot !== 'none' && <Plot kind={plot} t={t} />}

      <div className="w1l1-readout">
        <span className="w1l1-eq">1 A = 1 C/s = 6.24 × 10¹⁸ 个电子/秒</span>
        {ex ? (
          <span>
            {plot === 'deriv' ? (
              <>
                t = {t.toFixed(2)} s：截面计数 q = {PLOT.deriv.f(t).toFixed(2)} C，此刻 i = 6t − 1 = <b>{signed(i, 2)} A</b>
              </>
            ) : (
              <>
                t = {t.toFixed(2)} s：此刻 i = <b>{unsigned(i, 2)} A</b>，从 1 s 起已穿过截面 <b>Q = {Q13(t).toFixed(2)} C</b>
              </>
            )}
          </span>
        ) : (
          <span>
            每秒穿过截面 <b>{unsigned(i)} C</b>
            {!zero && <> ≈ {sci(eRate)} 个电子</>}
          </span>
        )}
        {i < 0 && (
          <span className="w1l1-equiv" role="status">
            i = {signed(i, ex ? 2 : 1)} A（参考向右）等价于 +{unsigned(i, ex ? 2 : 1)} A 向左
          </span>
        )}
      </div>
    </div>
  );
}
