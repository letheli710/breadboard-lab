// Layer "02 实时示波器阻尼波形对比台 + s 平面极点": v_C(t) of the stage circuit, live from the R / L / C
// sliders (the R track marks R_crit, where α = ω0, and snaps onto it). Marked on the trace:
//  - α: the envelope ±M·e^{−αt} (under-damped) with its 1/e point at t = 1/α, and 1/α on the time
//    axis in every case; over-damped, the slow mode A1·e^{s1 t} that makes the long tail;
//  - ω0: the undamped period T0 = 2π/ω0 as a bracket from t = 0;
//  - ω_d: the ringing period T_d = 2π/ω_d between two zero crossings in the same direction.
// The three-state switch overlays the over / critical / under-damped curves at ζ = 1.5 / 1 / 0.2
// (same L, C, initial values). Beside it, the s plane: the poles of s² + 2αs + ω0² = 0, the radius
// ω0 semicircle they slide on, their collision at −ω0 and the split along the real axis.
// While the guided example runs, the numbers it asks for stay hidden until found.

import { useMemo } from 'react';
import { fmtPole, fmtRate, fmtT, GHOST_ZETA, PRESETS, REGIME_COLOR, REGIME_LABEL, rForZeta, sig, solve, windowOf, zeros, type Regime, type Sol } from './model';
import { Cell, hoverProps, LcSliders, RSlider, Seg, useClearHoverOnUnmount, useIsLit, useLab, type Lab } from './state';

const X0 = 50;
const X1 = 452;
const YT = 30;
const YB = 254;
const N = 320;

/** a "nice" tick step for a span */
function niceStep(span: number, n: number) {
  const raw = span / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  return ([1, 2, 2.5, 5, 10].find((m) => m * p >= raw) ?? 10) * p;
}

/** the time axis unit follows the window: s, ms or µs */
const unitOf = (T: number): [string, number] => (T >= 1 ? ['s', 1] : T >= 1e-3 ? ['ms', 1e3] : ['µs', 1e6]);

const GHOSTS: Regime[] = ['over', 'critical', 'under'];

function useGhosts(lab: Lab): Sol[] {
  const { topo, L, C, v0, i0 } = lab.c;
  return useMemo(() => GHOSTS.map((g) => solve({ topo, L, C, v0, i0, R: rForZeta(topo, L, C, GHOST_ZETA[g]) })), [topo, L, C, v0, i0]);
}

function Scope({ lab, ghosts }: { lab: Lab; ghosts: Sol[] }) {
  const on = useIsLit();
  const s = lab.s;
  const T = windowOf(s.w0);
  const hideAll = lab.hidden(9);
  const curves = hideAll ? [] : [s, ...(lab.ghost ? ghosts : [])];
  // y range from what is drawn (the guided example: from the given v(0) only)
  let lo = Math.min(0, lab.c.v0);
  let hi = Math.max(0, lab.c.v0);
  for (const c of curves)
    for (let k = 0; k <= 200; k++) {
      const v = c.v((k / 200) * T);
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  if (curves.length && s.regime === 'under') lo = Math.min(lo, -s.M * Math.exp((-s.alpha * Math.PI) / s.wd) * 1.05);
  const pad = (hi - lo) * 0.1 || 1;
  const vStep = niceStep(hi - lo + 2 * pad, 5);
  const vTop = Math.ceil((hi + pad) / vStep) * vStep;
  const vBot = Math.floor((lo - pad) / vStep) * vStep;
  const Y = (v: number) => YT + ((vTop - v) / (vTop - vBot)) * (YB - YT);
  const X = (t: number) => X0 + (t / T) * (X1 - X0);
  const path = (f: (t: number) => number) =>
    Array.from({ length: N + 1 }, (_, k) => {
      const t = (k / N) * T;
      return `${k ? 'L' : 'M'} ${X(t).toFixed(1)} ${Y(f(t)).toFixed(1)}`;
    }).join(' ');
  const tStep = niceStep(T, 5);
  const [tUnit, tScale] = unitOf(T);
  const tTicks: number[] = [];
  for (let t = 0; t <= T + 1e-12; t += tStep) tTicks.push(t);
  const vTicks: number[] = [];
  for (let v = vBot; v <= vTop + 1e-9; v += vStep) vTicks.push(Number(v.toFixed(6)));
  const color = REGIME_COLOR[s.regime];
  const under = s.regime === 'under';
  const z = under ? zeros(s, T) : [];
  // the two brackets
  const T0 = (2 * Math.PI) / s.w0;
  const Td = under ? (2 * Math.PI) / s.wd : 0;
  const tau = 1 / s.alpha;
  return (
    <svg viewBox="0 0 460 294" className="w47-scope" role="img" aria-label={`v_C(t) 波形：${hideAll ? '引导例题进行中' : REGIME_LABEL[s.regime]}`}>
      <defs>
        <clipPath id="w47-plot">
          <rect x={X0} y={YT} width={X1 - X0} height={YB - YT} />
        </clipPath>
      </defs>
      <rect x={X0} y={YT} width={X1 - X0} height={YB - YT} className="w47-screen" />
      {vTicks.map((v) => (
        <g key={`v${v}`}>
          <line x1={X0} x2={X1} y1={Y(v)} y2={Y(v)} className={`w47-grid ${Math.abs(v) < 1e-9 ? 'zero' : ''}`} />
          <text x={X0 - 5} y={Y(v) + 4} className="w47-tk end">
            {sig(v)}
          </text>
        </g>
      ))}
      {tTicks.map((t) => (
        <g key={`t${t}`}>
          <line x1={X(t)} x2={X(t)} y1={YT} y2={YB} className="w47-grid v" />
          <text x={X(t)} y={YB + 14} className="w47-tk mid">
            {sig(t * tScale)}
          </text>
        </g>
      ))}
      <text x={X1} y={YB + 30} className="w47-tk end axis">
        t（{tUnit}）
      </text>
      <text x={8} y={YT - 12} className="w47-tk axis">
        v_C（V）
      </text>
      {/* ω0: the undamped period */}
      {!lab.hidden(1) && T0 < T && (
        <g className={`w47-cg ${on('wf_w0', 'omega0')}`} {...hoverProps(['wf_w0'])}>
          <path d={`M ${X(0)} ${YT + 4} L ${X(0)} ${YT + 10} L ${X(T0)} ${YT + 10} L ${X(T0)} ${YT + 4}`} className="w47-brk w0" />
          <text x={X(T0) + 4} y={YT + 14} className="w47-lbl w0">
            T₀ = 2π/ω₀ = {fmtT(T0)}
          </text>
        </g>
      )}
      {/* α on the time axis */}
      {!hideAll && tau < T && (
        <g className={`w47-cg ${on('wf_alpha', 'alpha_box')}`} {...hoverProps(['wf_alpha'])}>
          <line x1={X(tau)} x2={X(tau)} y1={YB} y2={YB - 8} className="w47-tau" />
          <text x={X(tau)} y={YB - 11} className="w47-lbl a mid">
            1/α
          </text>
        </g>
      )}
      <g clipPath="url(#w47-plot)">
        {/* ghosts */}
        {lab.ghost &&
          !hideAll &&
          ghosts.map((g, k) => (
            <g key={k} className={`w47-cg ${on(`wf_${GHOSTS[k]}`)}`} {...hoverProps([`wf_${GHOSTS[k]}`])}>
              <path d={path(g.v)} className="w47-hit" />
              <path d={path(g.v)} className={`w47-ghost ${GHOSTS[k]}`} />
            </g>
          ))}
        {/* the envelope and the slow mode */}
        {!hideAll && under && (
          <g className={`w47-cg ${on('wf_env', 'alpha_box')}`} {...hoverProps(['wf_env'])}>
            <path d={path((t) => s.M * Math.exp(-s.alpha * t))} className="w47-env" />
            <path d={path((t) => -s.M * Math.exp(-s.alpha * t))} className="w47-env" />
            {tau < T && <circle cx={X(tau)} cy={Y(s.M / Math.E)} r={3.5} className="w47-envdot" />}
            <text x={X(Math.min(tau, T * 0.5)) + 6} y={Y(s.M * Math.exp(-s.alpha * Math.min(tau, T * 0.5))) - 6} className="w47-lbl env">
              +M·e^(−αt)，α = {fmtRate(s.alpha, 'Np/s')}
            </text>
          </g>
        )}
        {!hideAll && s.regime === 'over' && (
          <g className={`w47-cg ${on('wf_alpha')}`} {...hoverProps(['wf_alpha'])}>
            <path d={path((t) => s.A1 * Math.exp(s.s1.re * t))} className="w47-env slow" />
            <text x={X(T * 0.55)} y={Y(s.A1 * Math.exp(s.s1.re * T * 0.55)) - 7} className="w47-lbl slow">
              慢模态 A₁e^(s₁t)，s₁ = {fmtRate(s.s1.re, 's⁻¹')}
            </text>
          </g>
        )}
        {/* the trace */}
        {!hideAll && (
          <g className={`w47-cg ${on('wf_curve')}`} {...hoverProps(['wf_curve'])}>
            <path d={path(s.v)} className="w47-hit" />
            <path d={path(s.v)} className="w47-trace" style={{ stroke: color }} />
          </g>
        )}
      </g>
      {/* ω_d: the ringing period between two crossings in the same direction */}
      {!hideAll && under && z.length >= 3 && (
        <g className={`w47-cg ${on('wf_wd')}`} {...hoverProps(['wf_wd'])}>
          <path
            d={`M ${X(z[0])} ${Y(0) - 6} L ${X(z[0])} ${Y(0) + 6} M ${X(z[0])} ${Y(0)} L ${X(z[2])} ${Y(0)} M ${X(z[2])} ${Y(0) - 6} L ${X(z[2])} ${Y(0) + 6}`}
            className="w47-brk wd"
          />
          <text x={(X(z[0]) + X(z[2])) / 2} y={Y(0) + 17} className="w47-lbl wd mid">
            T_d = 2π/ω_d = {fmtT(Td)}
          </text>
        </g>
      )}
      {/* the given start, and the start slope once found */}
      <circle cx={X(0)} cy={Y(lab.c.v0)} r={4} className="w47-start" />
      {hideAll && !lab.hidden(4) && (
        <line x1={X(0)} y1={Y(lab.c.v0)} x2={X(Math.min(T, -lab.c.v0 / s.d0))} y2={Y(lab.c.v0 + s.d0 * Math.min(T, -lab.c.v0 / s.d0))} className="w47-tangent" />
      )}
      {hideAll && (
        <text x={(X0 + X1) / 2} y={(YT + YB) / 2} className="w47-lbl wait mid">
          波形在引导例题完成后揭晓
        </text>
      )}
      {!hideAll && lab.ghost && (
        <g className="w47-legend">
          <rect x={X1 - 150} y={YT + 20} width={146} height={50} rx={5} />
          {GHOSTS.map((g, k) => (
            <g key={g}>
              <line x1={X1 - 142} x2={X1 - 124} y1={YT + 32 + k * 14} y2={YT + 32 + k * 14} className={`w47-ghost ${g}`} />
              <text x={X1 - 119} y={YT + 36 + k * 14}>
                {REGIME_LABEL[g]} ζ = {GHOST_ZETA[g]}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

/** The s plane: poles of s² + 2αs + ω0² = 0. */
function SPlane({ lab, ghosts }: { lab: Lab; ghosts: Sol[] }) {
  const on = useIsLit();
  const s = lab.s;
  const OX = 172;
  const OY = 96;
  const k = 70 / s.w0;
  const X = (re: number) => Math.max(10, OX + re * k);
  const Y = (im: number) => OY - im * k;
  const cross = (re: number, im: number, cls: string, key: string) => {
    const x = X(re);
    const y = Y(im);
    return <path key={key} d={`M ${x - 5} ${y - 5} L ${x + 5} ${y + 5} M ${x + 5} ${y - 5} L ${x - 5} ${y + 5}`} className={`w47-pole ${cls}`} />;
  };
  const hidePoles = lab.hidden(2);
  const off = OX + s.s2.re * k < 10;
  return (
    <svg viewBox="0 0 200 196" className="w47-splane" role="img" aria-label="s 平面极点">
      <text x={6} y={14} className="w47-tk axis">
        s 平面
      </text>
      <line x1={6} x2={194} y1={OY} y2={OY} className="w47-axis" />
      <line x1={OX} x2={OX} y1={186} y2={20} className="w47-axis" />
      <text x={194} y={OY - 5} className="w47-tk end">
        σ
      </text>
      <text x={OX + 4} y={28} className="w47-tk">
        jω
      </text>
      {!lab.hidden(1) && (
        <g className={`w47-cg ${on('sp_circle', 'omega0')}`} {...hoverProps(['sp_circle'])}>
          <path d={`M ${OX} ${OY - 70} A 70 70 0 0 0 ${OX} ${OY + 70}`} className="w47-locus" />
          <text x={OX - 70} y={OY + 14} className="w47-tk mid w0">
            −ω₀
          </text>
          <text x={OX - 4} y={OY - 72} className="w47-tk end w0">
            jω₀
          </text>
        </g>
      )}
      {lab.ghost && !lab.hidden(9) && ghosts.flatMap((g, i) => [cross(g.s1.re, g.s1.im, `ghost ${GHOSTS[i]}`, `g${i}a`), cross(g.s2.re, g.s2.im, `ghost ${GHOSTS[i]}`, `g${i}b`)])}
      {hidePoles ? (
        <text x={100} y={OY + 40} className="w47-tk mid">
          极点在第 2 步揭晓
        </text>
      ) : (
        <g className={`w47-cg ${on('sp_poles')}`} {...hoverProps(['sp_poles'])}>
          {s.regime === 'under' && (
            <>
              <line x1={OX} y1={OY} x2={X(s.s1.re)} y2={Y(s.s1.im)} className="w47-radius" />
              <line x1={X(s.s1.re)} y1={Y(s.s1.im)} x2={X(s.s1.re)} y2={OY} className="w47-proj" />
              <line x1={X(s.s1.re)} y1={Y(s.s1.im)} x2={OX} y2={Y(s.s1.im)} className="w47-proj" />
              <text x={X(s.s1.re) + 3} y={OY - 4} className="w47-tk a">
                −α
              </text>
              <text x={OX + 4} y={Y(s.s1.im) + 4} className="w47-tk wd">
                jω_d
              </text>
            </>
          )}
          {cross(s.s1.re, s.s1.im, s.regime, 'p1')}
          {cross(s.s2.re, s.s2.im, s.regime, 'p2')}
          {s.regime === 'critical' && (
            <text x={X(s.s1.re)} y={OY - 9} className="w47-tk mid crit">
              二重根
            </text>
          )}
          {s.regime === 'over' && (
            <>
              <text x={X(s.s1.re)} y={OY - 9} className={`w47-tk mid over ${on('sp_slow')}`} {...hoverProps(['sp_slow'])}>
                s₁ 慢
              </text>
              <text x={off ? 12 : X(s.s2.re)} y={OY + 15} className={`w47-tk over ${off ? '' : 'mid'}`}>
                {off ? '◀ s₂ 快' : 's₂ 快'}
              </text>
            </>
          )}
          <text x={6} y={190} className="w47-tk">
            {s.regime === 'over' ? `s₁ = ${fmtPole(s.s1)}，s₂ = ${fmtPole(s.s2)}` : `s₁,₂ = ${fmtPole(s.s1).replace(' + ', ' ± ')}`}
          </text>
        </g>
      )}
    </svg>
  );
}

function Readouts({ lab }: { lab: Lab }) {
  const s = lab.s;
  const h = lab.hidden;
  const q = '?';
  const coef = s.regime === 'under' ? `B₁ = ${h(3) ? q : sig(s.B1)}，B₂ = ${h(9) ? q : sig(s.B2)}` : `A₁ = ${sig(s.A1)}，A₂ = ${sig(s.A2)}`;
  return (
    <div className="w47-cells">
      <Cell id="r_crit" name="R_crit" value={h(1) ? q : `${sig(s.rcrit)} Ω`} />
      <Cell id="alpha_box" name="α" value={h(1) ? q : fmtRate(s.alpha, 'Np/s')} />
      <Cell id="omega0" name="ω₀" value={h(1) ? q : fmtRate(s.w0, 'rad/s')} />
      <Cell id="wf_wd" name="ω_d" value={h(2) ? q : s.regime === 'under' ? fmtRate(s.wd, 'rad/s') : '—（不振荡）'} />
      <Cell id="wf_curve" name="状态" value={h(1) ? q : `${REGIME_LABEL[s.regime]} ζ=${sig(s.zeta, 2)}`} tone={h(1) ? '' : s.regime} />
      <Cell id="wf_start" name="dv_C/dt(0⁺)" value={h(4) ? q : `${sig(s.d0)} V/s`} tone="minor" />
      <Cell id="wf_curve" name="系数（V）" value={h(3) ? q : coef} tone="minor wide" />
    </div>
  );
}

export default function Waveform() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const ghosts = useGhosts(lab);
  const name = lab.preset === 'free' ? '自定义电路' : PRESETS[lab.preset].name;
  return (
    <div className="w47-layer">
      <div className="w47-dock">
        <span className="w47-tag">
          {lab.c.topo === 'series' ? '串联' : '并联'} · {name}
        </span>
        <Seg<boolean>
          label="三态同屏对比"
          value={lab.ghost}
          onChange={(v) => lab.set({ ghost: v })}
          disabled={lab.locked}
          options={[
            { value: false, label: '单条波形', short: '单条', hover: ['wf_curve'] },
            { value: true, label: '三态同屏 + 包络', short: '三态', hover: ['wf_over', 'wf_critical', 'wf_under'] },
          ]}
        />
        <RSlider lab={lab} />
      </div>
      <div className="w47-dock">
        <LcSliders lab={lab} />
      </div>
      <div className="w47-wf-row">
        <Scope lab={lab} ghosts={ghosts} />
        <SPlane lab={lab} ghosts={ghosts} />
      </div>
      <Readouts lab={lab} />
    </div>
  );
}
