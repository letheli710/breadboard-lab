// Layer "02 实时 P_L–R_L 峰值曲线与效率曲线双图": the load power P_L (left axis, a skewed bell:
// steep left, gentle right) and the efficiency η = R_L / (R_Th + R_L) (right axis, rising to 100 %)
// against R_L, live. The red dashed line locks R_L = R_Th with the P_max vertex and the η = 50 %
// point; the 0.5 R_Th / 2 R_Th pair shows the equal-power symmetry; two cursor dots follow the
// R_L slider (and the 3D knob). Axes switch between R_L / R_Th, P_L / P_max and real values;
// points recorded on the breadboard stay on the curve. Under the chart, the source's power split
// between R_Th (heat) and R_L (useful).

import { Dock, hoverProps, ScaleNotice, useCircuit, useClearHoverOnUnmount, useIsLit } from './state';
import { etaOf, fmtP, fmtPct, fmtR, pNorm, RL_RANGE, tickR } from './model';

const X0 = 64;
const X1 = 566;
const Y0 = 258;
const Y1 = 46;

export default function Curves() {
  const c = useCircuit();
  const on = useIsLit();
  useClearHoverOnUnmount();
  const hidden = c.reveal < 9;
  const real = c.axis === 'real' && !hidden;
  const s = c.sol;
  const rth = c.src.rth;
  const xmax = RL_RANGE[c.mode][1] / rth;
  const X = (x: number) => X0 + (Math.min(xmax, Math.max(0, x)) / xmax) * (X1 - X0);
  const Y = (f: number) => Y0 - f * (Y0 - Y1);
  const n = 240;
  const xs = Array.from({ length: n + 1 }, (_, i) => (i / n) * xmax);
  const pPath = xs.map((x, i) => `${i ? 'L' : 'M'} ${X(x).toFixed(1)} ${Y(pNorm(x)).toFixed(1)}`).join(' ');
  const ePath = xs.map((x, i) => `${i ? 'L' : 'M'} ${X(x).toFixed(1)} ${Y(etaOf(x)).toFixed(1)}`).join(' ');
  const xticks = xmax <= 5 ? [0, 0.5, 1, 2, 3, 4, 5] : xmax <= 7 ? [0, 0.5, 1, 2, 3, 4, 5, 6] : [0, 0.5, 1, 2, 4, 6, 8, 10];
  const xLabel = (t: number) => (real ? tickR(t * rth) : t === 0 ? '0' : `${t}`);
  const yLabel = (f: number) => (real ? fmtP(f * s.pmax, c.mode).replace(/\.?0+ /, ' ') : `${Math.round(f * 100)}%`);
  const x = s.x;
  const cx = X(x);
  const pair = Y(8 / 9);
  return (
    <div className="w8-layer">
      <Dock
        c={c}
        extra={
          <div className="w8-seg small" role="radiogroup" aria-label="坐标轴">
            <button role="radio" aria-checked={!real} className={!real ? 'on' : ''} onClick={() => c.set({ axis: 'ratio' })}>
              <span className="full">归一化 R_L/R_Th</span>
              <span className="short">归一化</span>
            </button>
            <button role="radio" aria-checked={real} className={real ? 'on' : ''} disabled={hidden} onClick={() => c.set({ axis: 'real' })}>
              <span className="full">真实阻值 / 功率</span>
              <span className="short">真实值</span>
            </button>
          </div>
        }
      />
      <svg
        viewBox="0 0 640 300"
        className="w8-chart"
        role="img"
        aria-label={`负载功率与效率曲线：R_L = ${fmtR(c.rl, c.mode)}，P_L/P_max = ${fmtPct(pNorm(x))}，η = ${fmtPct(s.eta)}`}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={X0} x2={X1} y1={Y(f)} y2={Y(f)} className="w8-grid" />
            <text x={X0 - 7} y={Y(f) + 4} className="w8-tick p end">
              {yLabel(f)}
            </text>
            <text x={X1 + 7} y={Y(f) + 4} className="w8-tick e">
              {Math.round(f * 100)}%
            </text>
          </g>
        ))}
        {xticks.map((t) => (
          <g key={t}>
            <line x1={X(t)} x2={X(t)} y1={Y0} y2={Y1} className="w8-grid v" />
            <text x={X(t)} y={Y0 + 16} className={`w8-tick mid ${t === 1 ? 'one' : ''}`}>
              {xLabel(t)}
            </text>
          </g>
        ))}
        <line x1={X0} x2={X1 + 4} y1={Y0} y2={Y0} className="w8-axis" />
        <line x1={X0} x2={X0} y1={Y0} y2={Y1 - 8} className="w8-axis p" />
        <line x1={X1} x2={X1} y1={Y0} y2={Y1 - 8} className="w8-axis e" />
        <text x={(X0 + X1) / 2} y={Y0 + 36} className="w8-tick axis mid">
          {real ? `负载电阻 R_L（${c.mode === 'lab' ? 'Ω，k = 1000' : 'Ω'}）` : '负载电阻比 R_L / R_Th'}
        </text>
        <text x={16} y={(Y0 + Y1) / 2} className="w8-tick axis p mid" transform={`rotate(-90 16 ${(Y0 + Y1) / 2})`}>
          {real ? '负载功率 P_L' : '负载功率 P_L / P_max'}
        </text>
        <text x={624} y={(Y0 + Y1) / 2} className="w8-tick axis e mid" transform={`rotate(90 624 ${(Y0 + Y1) / 2})`}>
          传输效率 η
        </text>
        <text x={X0} y={24} className="w8-ctitle">
          {c.mode === 'lab' ? '面包板：V_Th = 5 V，R_Th = 1 kΩ' : hidden ? '引导例题：曲线形状与 V_Th、R_Th 无关' : `V_Th = ${c.src.vth} V，R_Th = ${rth} Ω`}
        </text>

        {/* η curve and the 50 % match point */}
        <g className={`w8-cg ${on('eta')}`} data-hl="eta" {...hoverProps(['eta'])}>
          <line x1={X0} x2={X1} y1={Y(0.5)} y2={Y(0.5)} className="w8-ref eta" />
          <path d={ePath} className="w8-hit" />
          <path d={ePath} className="w8-curve eta" />
          <circle cx={X(1)} cy={Y(0.5)} r={6} className="w8-mark eta" />
          <text x={X(1) + 12} y={Y(0.5) + 18} className="w8-label eta">
            匹配点效率 η = 50%
          </text>
        </g>

        {/* the 0.5 R_Th / 2 R_Th pair */}
        {xmax >= 2 && (
          <g className={`w8-cg ${on('pair')}`} data-hl="pair" {...hoverProps(['pair'])}>
            <line x1={X(0.5)} x2={X(2)} y1={pair} y2={pair} className="w8-ref pair" />
            <circle cx={X(0.5)} cy={pair} r={4.5} className="w8-mark pair" />
            <circle cx={X(2)} cy={pair} r={4.5} className="w8-mark pair" />
            <text x={X(2) + 8} y={pair - 6} className="w8-label pair">
              88.9% P_max（η = 33.3% / 66.7%）
            </text>
          </g>
        )}

        {/* P_L curve and the R_L = R_Th lock */}
        <g className={`w8-cg ${on('pl')}`} data-hl="pl" {...hoverProps(['pl'])}>
          <path d={pPath} className="w8-hit" />
          <path d={pPath} className="w8-curve p" />
        </g>
        <g className={`w8-cg ${on('pmax')}`} data-hl="pmax" {...hoverProps(['pmax'])}>
          <line x1={X(1)} x2={X(1)} y1={Y1 - 6} y2={Y0} className="w8-ref lock" />
          <circle cx={X(1)} cy={Y(1)} r={6.5} className="w8-mark pmax" />
          <rect x={X(1) + 10} y={Y1 - 20} width={hidden ? 150 : 214} height="22" rx="5" className="w8-tagbox" />
          <text x={X(1) + 18} y={Y1 - 4} className="w8-label pmax">
            {hidden ? '峰值 P_max（R_L = R_Th）' : `峰值 P_max = ${fmtP(s.pmax, c.mode).replace(/\.?0+ /, ' ')}（R_L = R_Th）`}
          </text>
        </g>

        {/* breadboard records */}
        {c.mode === 'lab' &&
          c.samples.map((p, i) => (
            <g key={i} className={`w8-sample ${on('samples')}`} {...hoverProps(['samples'])}>
              <rect x={X(p.rl / rth) - 4} y={Y(pNorm(p.rl / rth)) - 4} width="8" height="8" transform={`rotate(45 ${X(p.rl / rth)} ${Y(pNorm(p.rl / rth))})`} />
            </g>
          ))}

        {/* the cursor */}
        {!hidden && (
          <g className={`w8-cg cursor ${on('rl')}`} data-hl="rl" {...hoverProps(['rl'])}>
            <line x1={cx} x2={cx} y1={Y0} y2={Y(Math.max(pNorm(x), etaOf(x)))} className="w8-proj" />
            <circle cx={cx} cy={Y(etaOf(x))} r={6} className="w8-dot eta" />
            <circle cx={cx} cy={Y(pNorm(x))} r={7} className="w8-dot p" />
          </g>
        )}

        <g className="w8-legend">
          <rect x={X1 - 196} y={Y0 - 48} width="188" height="40" rx="6" />
          <line x1={X1 - 186} x2={X1 - 164} y1={Y0 - 36} y2={Y0 - 36} className="w8-curve p" />
          <text x={X1 - 158} y={Y0 - 32}>
            负载功率 P_L
          </text>
          <line x1={X1 - 186} x2={X1 - 164} y1={Y0 - 19} y2={Y0 - 19} className="w8-curve eta" />
          <text x={X1 - 158} y={Y0 - 15}>
            传输效率 η = R_L/(R_Th+R_L)
          </text>
        </g>
      </svg>
      {hidden ? (
        <p className="w8-chartnote">引导例题进行中：真实阻值与功率等你在右侧求出（可在 01 原理图点「揭晓等效结果」）。</p>
      ) : (
        <p className={`w8-readout ${on('rl', 'pl', 'eta')}`} aria-live="polite" {...hoverProps(['rl'])}>
          <span className="dot p" />
          <span className="dot eta" />
          R_L = <b>{fmtR(c.rl, c.mode)}</b>（{x.toFixed(2)} R_Th）→ P_L = <b>{fmtP(s.pl, c.mode)}</b>（{fmtPct(pNorm(x))} P_max），η = <b>{fmtPct(s.eta)}</b>
        </p>
      )}
      {!hidden && (
        <div className="w8-split" aria-label="电源功率分配">
          <span className="w8-split-cap">电源发出 {fmtP(s.ptot, c.mode)}：</span>
          <div className="w8-split-bar">
            <i className={`heat ${on('pth')}`} style={{ width: `${(1 - s.eta) * 100}%` }} data-hl="pth" {...hoverProps(['pth'])}>
              <span>内阻发热 {fmtPct(1 - s.eta)}</span>
            </i>
            <i className={`use ${on('pl')}`} style={{ width: `${s.eta * 100}%` }} data-hl="pl" {...hoverProps(['pl'])}>
              <span>负载有用功 {fmtPct(s.eta)}</span>
            </i>
          </div>
        </div>
      )}
      <ScaleNotice c={c} />
    </div>
  );
}
