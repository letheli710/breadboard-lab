// Layer "02 传输特性曲线与 ±9V 饱和边界": v_o against v_i. The linear part has slope −R_f/R1; it
// ends where the output reaches the LM358's swing, +7.5 V (V+ − 1.5 V) and −9 V on ±9 V, which
// fixes the linear input window (green band, −3.41 … +4.09 V for 10 kΩ / 22 kΩ). The red dashed
// curve is the same amplifier on a single +9 V: every positive input clips at 0 V. The operating
// point follows the v_i slider of either 2D layer.

import { Chip, Dock, hov, MaskNote, useCircuit, useClearHoverOnUnmount, useIsLit } from './common';
import { fmtV, num, solve, swing, linWindow, type Supply } from './model';
import { useStageParam } from '../../stageStore';

const L = 54;
const R = 452;
const T = 18;
const B = 268;
const X = (v: number) => L + ((v + 5) / 10) * (R - L);
const Y = (v: number) => T + ((10 - v) / 20) * (B - T);

function curve(r1: number, rf: number, s: Supply): [number, number][] {
  const { vLo, vHi } = swing(s);
  const { viLo, viHi } = linWindow(r1, rf, s);
  const xs = [-5, viLo, viHi, 5].filter((x) => x >= -5 && x <= 5).sort((p, q) => p - q);
  return xs.map((x) => [x, Math.min(vHi, Math.max(vLo, (-rf / r1) * x))]);
}

const pts = (c: [number, number][]) => c.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');

export default function TransferLayer() {
  useClearHoverOnUnmount();
  const c = useCircuit();
  const { a } = c;
  const isLit = useIsLit();
  const [overlay, setOverlay] = useStageParam('overlay', true);
  const lit = (...ids: string[]) => (isLit(...ids) ? 'lit' : '');
  const show = c.shown('vo');
  const other: Supply = a.supply === 'dual' ? 'single' : 'dual';
  const wLo = Math.max(-5, a.viLo);
  const wHi = Math.min(5, a.viHi);
  // the slope label sits right of the rising-left half of the line (vₒ > 0), clear of the single-supply curve
  const sx = Math.max(wLo, -4.5) * 0.55;
  const single = a.supply === 'single';
  return (
    <div className="w33-layer">
      <Dock c={c} compact />
      <div className="w33-sch-wrap">
        <svg viewBox="0 0 560 290" className="w33-sch" role="img" aria-label="反相放大器传输特性曲线与 ±9 V 饱和边界">
          {/* grid */}
          {[-4, -3, -2, -1, 1, 2, 3, 4].map((v) => (
            <line key={`x${v}`} x1={X(v)} x2={X(v)} y1={T} y2={B} className="w33-grid" />
          ))}
          {[-10, -5, 5, 10].map((v) => (
            <line key={`y${v}`} x1={L} x2={R} y1={Y(v)} y2={Y(v)} className="w33-grid" />
          ))}
          {/* linear window */}
          {show && wHi > wLo && (
            <g className={`w33-obj win ${lit('lin_window')}`} {...hov(['lin_window'])}>
              <rect x={X(wLo)} y={T} width={X(wHi) - X(wLo)} height={B - T} className="band" />
              <text x={(X(wLo) + X(wHi)) / 2} y={Y(a.vHi) + 16} className="w33-lbl win" textAnchor="middle">
                线性区 {num(a.viLo)} V ≤ vᵢ ≤ {single ? '0' : `+${num(a.viHi)}`} V
              </text>
            </g>
          )}
          {/* axes */}
          <line x1={L} x2={R} y1={Y(0)} y2={Y(0)} className="w33-axis" />
          <line x1={X(0)} x2={X(0)} y1={T} y2={B} className="w33-axis" />
          {[-4, -2, 2, 4].map((v) => (
            <text key={v} x={X(v)} y={Y(0) + 14} className="w33-tick" textAnchor="middle">
              {num(v, 0)}
            </text>
          ))}
          {[-5, 5].map((v) => (
            <text key={v} x={X(0) - 5} y={Y(v) + 4} className="w33-tick" textAnchor="end">
              {num(v, 0)}
            </text>
          ))}
          <text x={R + 6} y={Y(0) + 4} className="w33-lbl sub">
            vᵢ (V)
          </text>
          <text x={X(0) - 6} y={T + 10} className="w33-lbl sub" textAnchor="end">
            vₒ (V)
          </text>
          {/* rails of the swing */}
          <g className={`w33-obj ${lit('sat_pos', 'rail_p')}`} {...hov(['sat_pos'])}>
            <line x1={L} x2={R} y1={Y(a.vHi)} y2={Y(a.vHi)} className="w33-railline" />
            <text x={R + 6} y={Y(a.vHi) + 4} className="w33-lbl rp">
              +7.5 V 正饱和
            </text>
          </g>
          <g className={`w33-obj ${lit('sat_neg', 'rail_n')}`} {...hov(['sat_neg'])}>
            <line x1={L} x2={R} y1={Y(a.vLo)} y2={Y(a.vLo)} className={`w33-railline ${single ? 'bad' : ''}`} />
            <text x={R + 6} y={Y(a.vLo) + 4} className={`w33-lbl ${single ? 'x' : 'rn'}`}>
              {single ? '0 V 死锁' : '−9.0 V 负饱和'}
            </text>
          </g>
          {show ? (
            <>
              {overlay && (
                <g className={`w33-obj ${lit('single_curve')}`} {...hov(['single_curve'])}>
                  <polyline points={pts(curve(a.r1, a.rf, other))} className={`w33-curve ghost ${other}`} />
                  <text x={X(3.2)} y={other === 'single' ? Y(0) - 8 : Y(-9) - 8} className={`w33-lbl ${other === 'single' ? 'x' : 'cur'}`} textAnchor="middle">
                    {other === 'single' ? '单 +9 V：vᵢ > 0 死锁 0 V' : '±9 V 双电源对照'}
                  </text>
                </g>
              )}
              <g className={`w33-obj ${lit(single ? 'single_curve' : 'slope')}`} {...hov([single ? 'single_curve' : 'slope'])}>
                <polyline points={pts(curve(a.r1, a.rf, a.supply))} className={`w33-curve ${a.supply}`} />
              </g>
              {wHi > wLo && (
                <g className={`w33-obj ${lit('slope')}`} {...hov(['slope'])}>
                  <text x={X(sx) + 12} y={Y((-a.rf / a.r1) * sx) + 4} className="w33-lbl slope">
                    斜率 = −Rf/R₁ = {num(a.av, 2)}
                  </text>
                </g>
              )}
              <g className={`w33-obj ${lit('op_point', 'vo_out')}`} {...hov(['op_point'])}>
                <line x1={X(a.vi)} x2={X(a.vi)} y1={Y(0)} y2={Y(a.vo)} className="w33-proj" />
                <line x1={X(0)} x2={X(a.vi)} y1={Y(a.vo)} y2={Y(a.vo)} className="w33-proj" />
                <circle cx={X(a.vi)} cy={Y(a.vo)} r={6} className={`w33-q ${a.state === 'linear' ? '' : 'bad'}`} />
                <text x={X(a.vi) + (a.vi > 2.5 ? -10 : 10)} y={Y(a.vo) + (a.vo > 5 ? 18 : -10)} className="w33-lbl q" textAnchor={a.vi > 2.5 ? 'end' : 'start'}>
                  ({num(a.vi)}, {num(a.vo)})
                </text>
              </g>
            </>
          ) : (
            <text x={(L + R) / 2} y={Y(-3)} className="w33-lbl sub" textAnchor="middle">
              曲线斜率就是第 4 步要求的增益：先在右侧闯关
            </text>
          )}
        </svg>
        <div className="w33-sch-note">
          <MaskNote c={c} />
        </div>
      </div>
      <div className="w33-chips">
        <label className={`w33-check ${lit('single_curve')}`} {...hov(['single_curve'])}>
          <input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} />
          叠加{single ? ' ±9 V 对照' : '单 +9 V 削波虚线'}
        </label>
        <Chip ids={['slope']} k="斜率" v={show ? num(a.av, 3) : '?'} />
        <Chip ids={['op_point']} k="vₒ" v={show ? fmtV(a.vo) : '?'} tone={show ? (a.state === 'linear' ? 'good' : 'bad') : undefined} />
        <Chip ids={['lin_window']} k="窗口" v={show ? `${num(a.viLo)} … ${num(a.viHi)} V` : '?'} className="wide" />
        <Chip ids={['single_curve']} k="单 +9 V 时 vₒ" v={show ? fmtV(solve(a.vi, a.r1, a.rf, 'single').vo) : '?'} className="wide" />
      </div>
    </div>
  );
}
