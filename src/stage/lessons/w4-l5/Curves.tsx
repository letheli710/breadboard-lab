// Layer "02 实时示波器充电曲线 (63.2% at 1τ + 暂态/稳态分量拆解)": the zero-state charge
// vC(t) = Vs(1 − e^(−t/τ)) of the kit (Vs = 5 V) drawn live from the R and C sliders, with its
// two parts — the forced (steady-state) part vf = Vs and the natural (transient) part
// vn = −Vs e^(−t/τ) — that can be switched on and off, the initial-slope tangent that meets Vs
// at t = τ, and a cursor at 1τ … 5τ. The time axis is a scope timebase (1-2-5 per division) that
// fits 6τ on the screen.

import { useStageParam } from '../../stageStore';
import { fmt, fmtR, fmtT, KIT } from './model';
import { Cell, hoverProps, Seg, useClearHoverOnUnmount, useIsLit } from './state';

const X0 = 66;
const X1 = 620;
const Y0 = 262;
const Y1 = 30;

const TDIVS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10];

export default function Curves() {
  useClearHoverOnUnmount();
  const on = useIsLit();
  const [rk, setRk] = useStageParam('rk', 10);
  const [cu, setCu] = useStageParam('cu', 100);
  const [tot, setTot] = useStageParam('dTot', true);
  const [ss, setSs] = useStageParam('dSs', true);
  const [tr, setTr] = useStageParam('dTr', true);
  const [n, setN] = useStageParam('cur', 1);
  const vs = KIT.vs;
  const r = rk * 1e3;
  const c = cu * 1e-6;
  const tau = r * c;
  const tdiv = TDIVS.find((d) => d * 10 >= 6 * tau) ?? 10;
  const tMax = tdiv * 10;
  const vTop = 5.8;
  const vBot = tr ? -5.8 : -0.6;
  const X = (t: number) => X0 + (t / tMax) * (X1 - X0);
  const Y = (v: number) => Y1 + ((vTop - v) / (vTop - vBot)) * (Y0 - Y1);
  const N = 160;
  const path = (f: (t: number) => number) =>
    Array.from({ length: N + 1 }, (_, k) => {
      const t = (k / N) * tMax;
      return `${k ? 'L' : 'M'} ${X(t).toFixed(1)} ${Y(f(t)).toFixed(1)}`;
    }).join(' ');
  const vc = (t: number) => vs * (1 - Math.exp(-t / tau));
  const vn = (t: number) => -vs * Math.exp(-t / tau);
  const tc = n * tau;
  const vcc = vc(tc);
  const ic = (vs / r) * Math.exp(-n);
  const ticksV = tr ? [-5, -2.5, 0, 2.5, 5] : [0, 1, 2, 3, 4, 5];
  const inWin = tc <= tMax;
  const tauMarks = [1, 2, 3, 4, 5].filter((k) => k * tau <= tMax);
  return (
    <div className="w45-layer">
      <div className="w45-dock">
        <label className="w45-slider" {...hoverProps(['r'])}>
          <span className="w45-slider-label">R</span>
          <input type="range" min={1} max={50} step={1} value={rk} onChange={(e) => setRk(Number(e.target.value))} aria-label="电阻 R（kΩ）" />
          <span className="w45-num">{fmtR(r)}</span>
        </label>
        <label className="w45-slider" {...hoverProps(['cap'])}>
          <span className="w45-slider-label c">C</span>
          <input type="range" min={10} max={470} step={10} value={cu} onChange={(e) => setCu(Number(e.target.value))} aria-label="电容 C（µF）" />
          <span className="w45-num">{cu} µF</span>
        </label>
        <div className="w45-toggles" role="group" aria-label="分量拆解">
          {(
            [
              ['vc', '完全响应 vC', tot, setTot],
              ['vf', '稳态 vf', ss, setSs],
              ['vn', '暂态 vn', tr, setTr],
            ] as const
          ).map(([id, label, v, set]) => (
            <button key={id} className={`w45-tog ${id} ${v ? 'on' : ''} ${on(id)}`} aria-pressed={v} onClick={() => set(!v)} {...hoverProps([id])}>
              {label}
            </button>
          ))}
        </div>
        <Seg<number>
          label="游标"
          small
          value={n}
          onChange={setN}
          options={[1, 2, 3, 4, 5].map((k) => ({ value: k, label: `${k}τ`, hover: [k === 1 ? 'm63' : k === 5 ? 'm5tau' : 'tau'] }))}
        />
      </div>
      <div className="w45-chart-wrap">
        <svg viewBox="0 0 640 300" className="w45-chart" role="img" aria-label={`RC 充电曲线：τ = ${fmtT(tau)}，${n}τ 时 vC = ${fmt(vcc)} V`}>
          <rect x={X0} y={Y1} width={X1 - X0} height={Y0 - Y1} className="w45-scr" />
          {Array.from({ length: 11 }, (_, k) => (
            <line key={k} x1={X0 + (k * (X1 - X0)) / 10} x2={X0 + (k * (X1 - X0)) / 10} y1={Y1} y2={Y0} className="w45-grid" />
          ))}
          {ticksV.map((v) => (
            <g key={v}>
              <line x1={X0} x2={X1} y1={Y(v)} y2={Y(v)} className={`w45-grid ${v === 0 ? 'zero' : ''}`} />
              <text x={X0 - 6} y={Y(v) + 4} className="w45-tick end">
                {fmt(v, v % 1 ? 1 : 0)}
              </text>
            </g>
          ))}
          <text x={14} y={(Y0 + Y1) / 2} className="w45-tick axis mid" transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}>
            电压（V）
          </text>
          {tauMarks.map((k) => (
            <g key={k} className={`w45-part ${on(k === 1 ? 'm63' : k === 5 ? 'm5tau' : 'tau')}`}>
              <line x1={X(k * tau)} x2={X(k * tau)} y1={Y1} y2={Y0} className={`w45-taum ${k === n ? 'cur' : ''}`} />
              <text x={X(k * tau)} y={Y0 + 16} className={`w45-tick mid ${k === 1 || k === 5 ? 'strong' : ''}`}>
                {k}τ
              </text>
            </g>
          ))}
          <text x={X1} y={Y0 + 32} className="w45-tick end">
            时基 {fmtT(tdiv)}/div · 全屏 {fmtT(tMax)} · τ = RC = {fmtT(tau)}
          </text>
          {/* the initial-slope tangent: v = Vs t/τ, meets Vs at t = τ */}
          {tot && (
            <g className={`w45-part ${on('tangent', 'tau')}`} {...hoverProps(['tangent'])}>
              <line x1={X(0)} y1={Y(0)} x2={X(tau)} y2={Y(vs)} className="w45-tangent" />
              <circle cx={X(tau)} cy={Y(vs)} r={4} className="w45-tdot" />
            </g>
          )}
          {ss && (
            <g className={`w45-part ${on('vf')}`} {...hoverProps(['vf'])}>
              <line x1={X(0)} x2={X1} y1={Y(vs)} y2={Y(vs)} className="w45-curve vf" />
              <text x={X1 - 4} y={Y(vs) - 6} className="w45-lbl vf end">
                vf = Vs = +5 V
              </text>
            </g>
          )}
          {tr && (
            <g className={`w45-part ${on('vn')}`} {...hoverProps(['vn'])}>
              <path d={path(vn)} className="w45-curve vn" />
              <text x={X1 - 4} y={Y(-0.4) + 16} className="w45-lbl vn end">
                vn = −5 e^(−t/τ)
              </text>
            </g>
          )}
          {tot && (
            <g className={`w45-part ${on('vc')}`} {...hoverProps(['vc'])}>
              <path d={path(vc)} className="w45-curve vc" />
              <text x={X(Math.min(tMax * 0.55, 3.2 * tau))} y={Y(vc(Math.min(tMax * 0.55, 3.2 * tau))) + 20} className="w45-lbl vc">
                vC = vf + vn
              </text>
            </g>
          )}
          {tot && inWin && (
            <g className={`w45-part ${on(n === 1 ? 'm63' : n === 5 ? 'm5tau' : 'tau')}`} {...hoverProps([n === 1 ? 'm63' : n === 5 ? 'm5tau' : 'tau'])}>
              <line x1={X0} x2={X(tc)} y1={Y(vcc)} y2={Y(vcc)} className="w45-cursor" />
              <circle cx={X(tc)} cy={Y(vcc)} r={5.5} className="w45-cdot" />
              <text x={X(tc) + 9} y={Y(vcc) + (n === 1 ? 18 : 22)} className="w45-lbl cur">
                {n}τ：{fmt((1 - Math.exp(-n)) * 100, 1)}%（{fmt(vcc)} V）
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="w45-cells">
        <Cell id="tau" name="τ = RC" value={fmtT(tau)} />
        <Cell id={n === 1 ? 'm63' : n === 5 ? 'm5tau' : 'tau'} name={`vC(${n}τ)`} value={`${fmt(vcc, 3)} V`} tone="good" />
        <Cell id="vc" name="充电百分比" value={`${fmt((1 - Math.exp(-n)) * 100, 2)}%`} />
        <Cell id="ic" name={`iC(${n}τ)`} value={`${fmt(ic * 1e3, 3)} mA`} />
        <Cell id="ic" name="iC(0⁺) = Vs/R" value={`${fmt((vs / r) * 1e3, 2)} mA`} tone="minor" />
        <Cell id="r" name="R 峰值功耗" value={`${fmt(((vs * vs) / r) * 1e3, 2)} mW`} tone="minor" />
      </div>
    </div>
  );
}
