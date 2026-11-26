// Layer "02 实时指数衰减示波器": the natural response, live.
// - 'rc': v_C(t) = V0 e^(−t/RC), V0 = 5 V (the breadboard supply), R slider 1 … 50 kΩ, C slider
//   10 … 470 µF (E6); τ = RC updates with them;
// - 'rl': i_L(t) = I0 e^(−tR/L), I0 = 2 A, L slider 0.1 … 1 H, R slider 5 … 50 Ω (act 4: a larger R
//   makes τ = L/R shorter);
// - 'net': act 5's network, v_C(t) = 6 e^(−t/0.9) and v_R2(t) (12 V before the switch, 4 e^(−t/0.9)
//   after it); hidden while the guided example has not reached it (useReveal 'wave').
// Check boxes: the t = 0 tangent (meets the axis at t = τ), the 1τ (36.8 %) and 5τ (0.67 %) lines
// with the steady-state band, and the energy bars w_C(t) / W0 = e^(−2t/τ) vs w_R(t) / W0. The
// cursor follows the shared time tn (the play button runs it at 1 τ per second).

import { useStage, useStageParam } from '../../stageStore';
import { C_STEPS, energy, fmtA, fmtC, fmtE, fmtL, fmtPct, fmtR, fmtT, fmtV, LAB, NET, RL_EX, solveNet } from './model';
import { Check, hov, MaskNote, Seg, Slider, T_MAX, useClearHoverOnUnmount, useIsLit, usePlay, useReveal, useTime, type Mode } from './state';

const X0 = 66;
const X1 = 604;
const Y0 = 236;
const Y1 = 40;

const MODES: { value: Mode; label: string; short: string; hover: string[] }[] = [
  { value: 'rc', label: 'RC 放电 v_C(t)', short: 'RC', hover: ['curve'] },
  { value: 'rl', label: 'RL 衰减 i_L(t)', short: 'RL', hover: ['curve'] },
  { value: 'net', label: '第 5 幕例题网络', short: '例题', hover: ['curve', 'curve_r2'] },
];

export default function Scope() {
  useClearHoverOnUnmount();
  const on = useIsLit();
  const [mode, setMode] = useStageParam<Mode>('mode', 'rc');
  const [rS, setRS] = useStageParam<number>('rS', LAB.r);
  const [cS, setCS] = useStageParam<number>('cS', LAB.c);
  const [lS, setLS] = useStageParam<number>('lS', RL_EX.l);
  const [rlR, setRlR] = useStageParam<number>('rlR', RL_EX.r);
  const [tan, setTan] = useStageParam('tan', true);
  const [marks, setMarks] = useStageParam('marks', true);
  const [bars, setBars] = useStageParam('bars', true);
  const { sw, tn } = useTime();
  const { playing, play, stop } = usePlay();
  const rv = useReveal();
  const net = solveNet(NET);
  const hidden = mode === 'net' && !rv.shown('wave');

  // the case on screen: initial value, τ, units, the energy at t = 0
  const kase =
    mode === 'rc'
      ? { x0: LAB.v0, tau: rS * cS, unit: 'V', name: 'v_C', w0: 0.5 * cS * LAB.v0 ** 2, store: 'w_C', fmt: (x: number) => fmtV(x) }
      : mode === 'rl'
        ? { x0: RL_EX.i0, tau: lS / rlR, unit: 'A', name: 'i_L', w0: 0.5 * lS * RL_EX.i0 ** 2, store: 'w_L', fmt: fmtA }
        : { x0: net.v0, tau: net.tau, unit: 'V', name: 'v_C', w0: net.w0, store: 'w_C', fmt: (x: number) => fmtV(x) };
  const yMax = mode === 'net' ? 12 : kase.x0;
  const uMin = mode === 'net' ? -0.6 : 0;
  const X = (u: number) => X0 + ((u - uMin) / (T_MAX - uMin)) * (X1 - X0);
  const Y = (x: number) => Y0 - (x / yMax) * (Y0 - Y1);
  const n = 240;
  const us = Array.from({ length: n + 1 }, (_, i) => (i / n) * T_MAX);
  const path = (f: (u: number) => number) => us.map((u, i) => `${i ? 'L' : 'M'} ${X(u).toFixed(1)} ${Y(f(u)).toFixed(1)}`).join(' ');
  const main = path((u) => kase.x0 * Math.exp(-u));
  const r2 = mode === 'net' ? `M ${X(uMin)} ${Y(net.vA0)} L ${X(0)} ${Y(net.vA0)} ` + path((u) => net.k2 * net.v0 * Math.exp(-u)).replace(/^M/, 'L') : '';
  const pre = mode === 'net' ? `M ${X(uMin)} ${Y(net.v0)} L ${X(0)} ${Y(net.v0)}` : '';
  const u = sw === 'charge' ? 0 : tn;
  const x = kase.x0 * Math.exp(-u);
  const t = u * kase.tau;
  const e = energy(kase.w0, kase.tau, t);
  const yTicks = mode === 'net' ? [0, 4, 6, 12] : [0, kase.x0 * Math.exp(-1), kase.x0];
  const tauTxt = fmtT(kase.tau);
  const cIdx = Math.max(
    0,
    C_STEPS.findIndex((c) => Math.abs(c - cS) < 1e-9),
  );

  return (
    <div className="w44-layer">
      <div className="w44-ctrl">
        <div className="w44-row">
          <Seg label="波形" value={mode} onChange={setMode} options={MODES} />
          {mode === 'net' && <MaskNote />}
        </div>
        {mode === 'rc' && (
          <div className="w44-row">
            <Slider label="R" value={rS / 1000} min={1} max={50} step={1} text={fmtR(rS)} onChange={(v) => setRS(v * 1000)} hover={['res', 'tau']} />
            <Slider label="C" value={cIdx} min={0} max={C_STEPS.length - 1} step={1} text={fmtC(C_STEPS[cIdx])} onChange={(v) => setCS(C_STEPS[v])} hover={['cap', 'tau']} />
          </div>
        )}
        {mode === 'rl' && (
          <div className="w44-row">
            <Slider label="L" value={lS} min={0.1} max={1} step={0.05} text={fmtL(lS)} onChange={setLS} hover={['ind', 'tau']} />
            <Slider label="R" value={rlR} min={5} max={50} step={1} text={fmtR(rlR)} onChange={setRlR} hover={['res_l', 'tau']} />
          </div>
        )}
        <div className="w44-row">
          <button className={`w44-play ${playing ? 'on' : ''}`} onClick={playing ? stop : play} aria-label={playing ? '暂停' : '从 t = 0 播放（每秒 1τ）'}>
            {playing ? '暂停' : '▶ 播放'}
          </button>
          <Slider
            label="t"
            value={u}
            min={0}
            max={T_MAX}
            step={0.05}
            text={`${u.toFixed(2)} τ`}
            onChange={(v) => {
              stop();
              useStage.getState().setParams({ sw: 'discharge', tn: v });
            }}
            hover={['cursor']}
          />
          <Check label="t=0 切线" on={tan} set={setTan} hover={['tangent']} />
          <Check label="1τ / 5τ 标线" on={marks} set={setMarks} hover={['mark_1tau', 'steady']} />
          <Check label="能量条" on={bars} set={setBars} hover={['energy']} />
        </div>
      </div>
      <div className="w44-scope-wrap">
        <svg
          viewBox="0 0 640 270"
          className="w44-scope"
          role="img"
          aria-label={hidden ? '例题波形暂时隐藏' : `${kase.name}(t) = ${kase.x0} e^(−t/τ)，τ = ${tauTxt}；光标 t = ${u.toFixed(2)}τ 时为 ${kase.fmt(x)}`}
        >
          <rect x={X0} y={Y1 - 8} width={X1 - X0} height={Y0 - Y1 + 8} className="w44-screen" />
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <line key={k} x1={X(k)} x2={X(k)} y1={Y1 - 8} y2={Y0} className="w44-grid" />
          ))}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line key={f} x1={X0} x2={X1} y1={Y0 - f * (Y0 - Y1)} y2={Y0 - f * (Y0 - Y1)} className="w44-grid" />
          ))}
          <line x1={X0} x2={X1} y1={Y0} y2={Y0} className="w44-axis" />
          {mode === 'net' && <line x1={X(0)} x2={X(0)} y1={Y1 - 8} y2={Y0} className="w44-axis zero" />}
          <line x1={X0} x2={X0} y1={Y0} y2={Y1 - 8} className="w44-axis" />
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <text key={k} x={X(k)} y={Y0 + 15} className={`w44-tick mid ${k === 1 ? 'one' : k === 5 ? 'five' : ''}`}>
              {k === 0 ? '0' : `${k}τ`}
            </text>
          ))}
          {!hidden &&
            [1, 3, 5].map((k) => (
              <text key={k} x={X(k)} y={Y0 + 28} className="w44-tick mid sub">
                {mode === 'net' && !rv.shown('rth') ? '' : fmtT(k * kase.tau)}
              </text>
            ))}
          {!hidden &&
            yTicks.map((v) => (
              <text key={v} x={X0 - 6} y={Y(v) + 4} className="w44-tick end">
                {v === 0 ? '0' : `${v.toFixed(v % 1 ? 2 : 0)} ${kase.unit}`}
              </text>
            ))}
          <text x={X0} y={22} className="w44-ctitle">
            {hidden
              ? '例题网络：v_C(t)、v_R2(t) 等你在右侧引导例题中求出'
              : mode === 'rc'
                ? `CH1 v_C(t) = 5 e^(−t/τ) V，τ = RC = ${fmtR(rS)} × ${fmtC(cS)} = ${tauTxt}`
                : mode === 'rl'
                  ? `i_L(t) = 2 e^(−t/τ) A，τ = L/R = ${fmtL(lS)} / ${fmtR(rlR)} = ${tauTxt}`
                  : `v_C(t) = 6 e^(−t/0.9) V（蓝）· v_R2(t) = 4 e^(−t/0.9) V（橙）`}
          </text>

          {!hidden && marks && (
            <>
              <g className={`w44-obj ${on('steady')}`} {...hov(['steady'])}>
                <rect x={X(5)} y={Y1 - 8} width={X1 - X(5)} height={Y0 - Y1 + 8} className="w44-steady" />
                <line x1={X(5)} x2={X(5)} y1={Y1 - 8} y2={Y0} className="w44-ref five" />
                <text x={(X(5) + X1) / 2} y={Y1 + 10} className="w44-lbl five mid">
                  t ≥ 5τ 稳态区
                </text>
                <text x={(X(5) + X1) / 2} y={Y1 + 26} className="w44-lbl five mid sub">
                  剩余 0.67%
                </text>
              </g>
              <g className={`w44-obj ${on('mark_1tau')}`} {...hov(['mark_1tau'])}>
                <line x1={X0} x2={X(1)} y1={Y(kase.x0 * Math.exp(-1))} y2={Y(kase.x0 * Math.exp(-1))} className="w44-ref one" />
                <line x1={X(1)} x2={X(1)} y1={Y(kase.x0 * Math.exp(-1))} y2={Y0} className="w44-ref one" />
                <circle cx={X(1)} cy={Y(kase.x0 * Math.exp(-1))} r={5} className="w44-mark one" />
                <text x={X(1) + 9} y={Y(kase.x0 * Math.exp(-1)) - 7} className="w44-lbl one">
                  (1τ, 36.8%)
                </text>
              </g>
            </>
          )}
          {!hidden && tan && (
            <g className={`w44-obj ${on('tangent')}`} {...hov(['tangent'])}>
              <line x1={X(0)} y1={Y(kase.x0)} x2={X(1)} y2={Y0} className="w44-tan" />
              <circle cx={X(1)} cy={Y0} r={4.5} className="w44-mark tan" />
              <text x={X(1.25)} y={Y(kase.x0 * 0.72)} className="w44-lbl tan">
                t=0 切线：斜率 −{kase.name === 'i_L' ? 'I₀' : 'V₀'}/τ，在 t = τ 归零
              </text>
            </g>
          )}
          {!hidden && mode === 'net' && (
            <g className={`w44-obj ${on('curve_r2', 'jump')}`} {...hov(['curve_r2'])}>
              <path d={r2} className="w44-hit" />
              <path d={r2} className="w44-curve r2" />
              <line x1={X(0)} x2={X(0)} y1={Y(net.vA0)} y2={Y(net.vR2at0p)} className="w44-jump" />
              <text x={X(0) + 8} y={Y(net.vA0) + 14} className="w44-lbl r2">
                v_R2：12 V → 4 V 跳变
              </text>
            </g>
          )}
          {!hidden && (
            <g className={`w44-obj ${on('curve', 'v_node', 'i_l')}`} {...hov(['curve'])}>
              {pre && <path d={pre} className="w44-curve" />}
              <path d={main} className="w44-hit" />
              <path d={main} className="w44-curve" />
            </g>
          )}
          {!hidden && (
            <g className={`w44-obj ${on('cursor')}`} {...hov(['cursor'])}>
              <line x1={X(u)} x2={X(u)} y1={Y1 - 8} y2={Y0} className="w44-proj" />
              <circle cx={X(u)} cy={Y(x)} r={6} className="w44-dot" />
              {mode === 'net' && <circle cx={X(u)} cy={Y(net.k2 * x)} r={5} className="w44-dot r2" />}
            </g>
          )}
          {hidden && (
            <text x={(X0 + X1) / 2} y={(Y0 + Y1) / 2} className="w44-hiddenmsg mid">
              ? · 答完第 4 步后显示波形
            </text>
          )}
        </svg>
      </div>
      {!hidden && (
        <p className={`w44-readout ${on('cursor', 'curve')}`} aria-live="polite" {...hov(['cursor'])}>
          t = <b>{u.toFixed(2)} τ</b>
          {mode === 'net' && !rv.shown('rth') ? '' : <> = {fmtT(t)}</>} → {kase.name} = <b>{kase.fmt(x)}</b>（{fmtPct(Math.exp(-u), 2)}）
          {mode === 'net' && (
            <>
              ，v_R2 = <b>{fmtV(net.k2 * x)}</b>
            </>
          )}
        </p>
      )}
      {!hidden && bars && (
        <div className={`w44-energy ${on('energy')}`} {...hov(['energy'])} aria-label="能量条">
          <div className="w44-ebar-row">
            <span>{kase.store}(t) 剩余</span>
            <i>
              <b className="store" style={{ width: `${(e.stored / e.w0) * 100}%` }} />
            </i>
            <em>
              {fmtPct(e.stored / e.w0)} · {mode === 'net' && !rv.shown('energy') ? '?' : fmtE(e.stored)}
            </em>
          </div>
          <div className="w44-ebar-row">
            <span>w_R(t) 累计耗热</span>
            <i>
              <b className="heat" style={{ width: `${(e.heat / e.w0) * 100}%` }} />
            </i>
            <em>
              {fmtPct(e.heat / e.w0)} · {mode === 'net' && !rv.shown('energy') ? '?' : fmtE(e.heat)}
            </em>
          </div>
        </div>
      )}
    </div>
  );
}
