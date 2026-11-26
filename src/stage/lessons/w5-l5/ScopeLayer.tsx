// Layer 01 · v(t) / i(t) / p(t) on one scope screen. Sliders: V_m, I_m and the phase difference
// Δθ = θ_v − θ_i (θ_i stays at −15°, act 1's current, so the sheet's example is the default). Drawn
// over one source period T: v (blue) and i (green) to scale with their sliders, p = v·i (purple,
// auto range), the average P as an amber dashed line, the p < 0 back-flow intervals shaded red,
// and the power period T_p = T/2 as a bracket between two neighbouring peaks of p. Below: P, p_max,
// p_min and the share of the period with p < 0 (|Δθ|/180°).

import { fmt, power, THETA_I } from './model';
import { Cell, DEF, P, Seg, Slider, SSub, Toggle, useClearHoverOnUnmount, useHot, useP } from './parts';
import './w5l5.css';

const X0 = 52;
const X1 = 448;
const Y0 = 138;
/** half height: p = V_m I_m reaches it */
const H = 96;
const N = 360;

const PRESETS: { dth: number; label: string; short: string }[] = [
  { dth: 0, label: '纯电阻 (0°)', short: 'R 0°' },
  { dth: 60, label: '感性负载 (+60°)', short: '+60°' },
  { dth: 90, label: '纯电感 (+90°)', short: 'L +90°' },
  { dth: -90, label: '纯电容 (−90°)', short: 'C −90°' },
];

const X = (w: number) => X0 + (w / 360) * (X1 - X0);

export default function ScopeLayer() {
  useClearHoverOnUnmount();
  const hot = useHot();
  const [vm, setVm] = useP(P.vm, DEF.vm);
  const [im, setIm] = useP(P.im, DEF.im);
  const [dth, setDth] = useP(P.dth, DEF.dth);
  const [neg, setNeg] = useP(P.neg, true);
  const [avg, setAvg] = useP(P.avg, true);
  const thv = THETA_I + dth;
  const pw = power(vm, im, thv, THETA_I);
  const S = vm * im; // p scale: V_m I_m ↦ H
  const Yp = (p: number) => Y0 - (p / S) * H;
  const Yv = (v: number) => Y0 - (v / 220) * 0.92 * H;
  const Yi = (i: number) => Y0 - (i / 20) * 0.92 * H;
  const ws = Array.from({ length: N + 1 }, (_, k) => k);
  const line = (f: (w: number) => number, Y: (x: number) => number) => ws.map((w, k) => `${k ? 'L' : 'M'} ${X(w).toFixed(1)} ${Y(f(w)).toFixed(1)}`).join(' ');

  // p < 0 intervals, closed along the zero axis (crossings interpolated)
  const regions: string[] = [];
  let cur: string[] = [];
  for (let k = 0; k <= N; k++) {
    const p = pw.p(k);
    const prev = k ? pw.p(k - 1) : p;
    if (p < 0 && (k === 0 || prev >= 0)) {
      const w0 = k === 0 ? 0 : k - 1 + prev / (prev - p);
      cur = [`M ${X(w0).toFixed(1)} ${Y0}`];
    }
    if (p < 0) cur.push(`L ${X(k).toFixed(1)} ${Yp(p).toFixed(1)}`);
    if (cur.length && (p >= 0 || k === N)) {
      const w1 = p >= 0 ? k - 1 + prev / (prev - p) : N;
      cur.push(`L ${X(w1).toFixed(1)} ${Y0} Z`);
      regions.push(cur.join(' '));
      cur = [];
    }
  }
  // the first peak of p in [0, 180): 2ωt + θ_v + θ_i = 0 (mod 360)
  const w1 = (((-(thv + THETA_I) / 2) % 180) + 180) % 180;
  const yb = Yp(pw.pmax) - 9;
  const ticks = [0, 90, 180, 270, 360];
  const tickLbl = ['0', 'T/4', 'T/2', '3T/4', 'T'];
  const hasBack = pw.pmin < -1e-9;

  return (
    <div className="w55-layer">
      <div className="w55-controls">
        <Seg<number> label="负载类型预设" value={dth} onChange={setDth} options={PRESETS.map((p) => ({ value: p.dth, label: p.label, short: p.short }))} />
        <Toggle label="回流阴影" on={neg} onChange={setNeg} />
        <Toggle label="平均线 P" on={avg} onChange={setAvg} />
      </div>
      <div className="w55-svgwrap">
        <svg viewBox="0 0 460 262" className="w55-svg" role="img" aria-label={`三曲线示波器：Δθ = ${dth}°，平均功率 ${fmt(pw.P, 1)} W`}>
          <rect x={X0} y={26} width={X1 - X0} height={212} className="w55-screen" />
          {ticks.map((w, k) => (
            <g key={w}>
              <line x1={X(w)} x2={X(w)} y1={26} y2={238} className="w55-grid" />
              <text x={X(w)} y={250} className="w55-tk mid">
                {tickLbl[k]}
              </text>
            </g>
          ))}
          <text x={X1} y={20} className="w55-tk end">
            ωt（ω = 377 rad/s）
          </text>
          <line x1={X0} x2={X1} y1={Y0} y2={Y0} className="w55-axis" />
          {/* p(t) < 0: back-flow */}
          {neg && (
            <g {...hot('sc_neg')}>
              {regions.map((d, k) => (
                <path key={k} d={d} className="w55-neg" />
              ))}
              {hasBack && regions.length > 0 && (
                <text x={X(Math.min(330, w1 + 90))} y={Math.min(232, Yp(pw.pmin) + 14)} className="w55-lbl neg mid">
                  p &lt; 0 回流
                </text>
              )}
            </g>
          )}
          {/* v and i */}
          <g {...hot('sc_v')}>
            <path d={line(pw.v, Yv)} className="w55-hit" />
            <path d={line(pw.v, Yv)} className="w55-tr v" />
          </g>
          <g {...hot('sc_i')}>
            <path d={line(pw.i, Yi)} className="w55-hit" />
            <path d={line(pw.i, Yi)} className="w55-tr i" />
          </g>
          {/* p */}
          <g {...hot('sc_p')}>
            <path d={line(pw.p, Yp)} className="w55-hit" />
            <path d={line(pw.p, Yp)} className="w55-tr p" />
          </g>
          {/* average */}
          {avg && (
            <g {...hot('sc_avg')}>
              <line x1={X0} x2={X1} y1={Yp(pw.P)} y2={Yp(pw.P)} className="w55-avg" />
              <line x1={X0} x2={X1} y1={Yp(pw.P)} y2={Yp(pw.P)} className="w55-hit" />
            </g>
          )}
          {/* the p axis: p_max, P, 0, p_min */}
          <g {...hot('sc_ext')}>
            <text x={X0 - 5} y={Yp(pw.pmax) + 3.5} className="w55-tk end p">
              {fmt(pw.pmax, 0)}W
            </text>
            {Math.abs(pw.pmin) > 0.06 * S && (
              <text x={X0 - 5} y={Yp(pw.pmin) + 3.5} className="w55-tk end neg">
                {fmt(pw.pmin, 0)}W
              </text>
            )}
          </g>
          {avg && Math.abs(pw.P) > 0.09 * S && Math.abs(pw.pmax - pw.P) > 0.09 * S && (
            <text x={X0 - 5} y={Yp(pw.P) + 3.5} className="w55-tk end avg">
              {fmt(pw.P, 0)}W
            </text>
          )}
          <text x={X0 - 5} y={Y0 + 3.5} className="w55-tk end">
            0
          </text>
          {/* T_p = T/2 */}
          <g {...hot('sc_tp')}>
            <path d={`M ${X(w1)} ${yb + 5} V ${yb} H ${X(w1 + 180)} V ${yb + 5}`} className="w55-brk" />
            <text x={X(w1 + 90)} y={yb - 3} className="w55-lbl p mid">
              <SSub s="T_p = T/2（2ω）" />
            </text>
          </g>
        </svg>
      </div>
      <div className="w55-legend">
        <span className="v">
          v(t) = {vm}cos(ωt {thv < 0 ? '−' : '+'} {Math.abs(thv)}°) V
        </span>
        <span className="i">i(t) = {im}cos(ωt − 15°) A</span>
        <span className="p">p(t)（自动量程）</span>
      </div>
      <div className="w55-cells">
        <Cell id="sc_avg" name="平均功率 P" value={`${fmt(pw.P, 1)} W`} tone="avg" />
        <Cell id="sc_ext" name="p_max / p_min" value={`${fmt(pw.pmax, 0)} / ${fmt(pw.pmin, 0)} W`} tone="p" />
        <Cell id="sc_neg" name="回流时间占比" value={`${fmt(pw.back * 100, 1)} %`} tone="neg" />
      </div>
      <div className="w55-sliders">
        <Slider id="sc_v" name="电压峰值 V_m" value={vm} min={20} max={220} step={10} unit="V" digits={0} onChange={setVm} />
        <Slider id="sc_i" name="电流峰值 I_m" value={im} min={1} max={20} step={1} unit="A" digits={0} onChange={setIm} />
        <Slider id="sc_dth" name="相位差 θ_v − θ_i" value={dth} min={-90} max={90} step={5} unit="°" digits={0} onChange={setDth} />
      </div>
    </div>
  );
}
