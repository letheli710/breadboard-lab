// Layer "02 实时方波阶跃示波器": a two-channel virtual scope on the series RLC of act 2 (V_s 0 … 5 V,
// 200 Hz; L = 10 mH, C = 1 µF; loop resistance R on a 20 – 400 Ω slider with the 56 / 200 / 250 Ω
// presets). CH1 is the ideal square wave, CH2 the capacitor voltage — the periodic response, edge
// to edge (model.ts squareWave), so a slow case that has not settled in 2.5 ms is drawn as it is.
// Cursors: the final value V_s = 5.0 V, the peak (t_p, V_peak, overshoot), the 2 % settling time;
// on the whole-period time base also the undershoot after the falling edge. Readouts: damping
// case, α, ω0, ζ, ω_d (or the real roots), V_peak, M_p, t_p.

import { useMemo } from 'react';
import { Cell, hoverProps, RSlider, Seg, useClearHoverOnUnmount, useIsLit, useLab, type TimeBase } from './state';
import { DAMPING_LABEL, fmtMs, fmtPct, fmtV, HALF, squareWave, VS, type Wave } from './model';
import { fx } from './tex';

const X0 = 56;
const X1 = 612;
const YT = 34;
const YB = 262;
const V_TOP = 10;
const V_BOT = -4;

/** 2 % settling time after the rising edge */
function settling(w: Wave): number {
  const n = 2500;
  let last = 0;
  for (let k = 0; k <= n; k++) {
    const t = (k / n) * HALF;
    if (Math.abs(w.vc(t) - VS) > 0.02 * VS) last = t;
  }
  return last;
}

export default function Scope() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const on = useIsLit();
  const w = useMemo(() => squareWave(lab.r), [lab.r]);
  const s = w.rise.v;
  const period = lab.tb === 'period';
  const div = period ? 0.5e-3 : 0.25e-3;
  const t0 = -div;
  const t1 = t0 + 10 * div;
  const X = (t: number) => X0 + ((t - t0) / (t1 - t0)) * (X1 - X0);
  const Y = (v: number) => YT + ((V_TOP - v) / (V_TOP - V_BOT)) * (YB - YT);
  const n = 700;
  const ts = Array.from({ length: n + 1 }, (_, k) => t0 + (k / n) * (t1 - t0));
  const path = (f: (t: number) => number) => ts.map((t, k) => `${k ? 'L' : 'M'} ${X(t).toFixed(1)} ${Y(f(t)).toFixed(1)}`).join(' ');
  const under = s.kind === 'under';
  const mp = (w.peak.v - VS) / VS;
  const hasPeak = mp > 5e-4;
  const tsl = useMemo(() => settling(w), [w]);
  const vt = [-4, -2, 0, 2, 4, 6, 8, 10];
  return (
    <div className="w48-layer">
      <div className="w48-dock">
        <RSlider lab={lab} />
        <Seg<TimeBase>
          label="时基"
          value={lab.tb}
          onChange={(v) => lab.set({ tb: v })}
          options={[
            { value: 'edge', label: '上升沿 0.25 ms/div', short: '上升沿' },
            { value: 'period', label: '整个周期 0.5 ms/div', short: '整周期' },
          ]}
        />
      </div>
      <svg viewBox="0 0 640 300" className="w48-chart" role="img" aria-label={`示波器：R = ${lab.r} Ω，${DAMPING_LABEL[s.kind]}，峰值 ${fmtV(w.peak.v)}`}>
        <rect x={X0} y={YT} width={X1 - X0} height={YB - YT} className="w48-screen" />
        {Array.from({ length: 11 }, (_, k) => (
          <line key={`v${k}`} x1={X0 + (k * (X1 - X0)) / 10} x2={X0 + (k * (X1 - X0)) / 10} y1={YT} y2={YB} className="w48-grid" />
        ))}
        {vt.map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={Y(v)} y2={Y(v)} className={`w48-grid ${v === 0 ? 'zero' : ''}`} />
            <text x={X0 - 6} y={Y(v) + 4} className="w48-tick end">
              {v}
            </text>
          </g>
        ))}
        {[1, 3, 5, 7, 9].map((k) => (
          <text key={k} x={X0 + (k * (X1 - X0)) / 10} y={YB + 15} className="w48-tick mid">
            {((t0 + k * div) * 1000).toFixed(2).replace(/\.?0+$/, '')}
          </text>
        ))}
        <text x={(X0 + X1) / 2} y={294} className="w48-tick axis mid">
          时间 t（ms）· {period ? '0.5' : '0.25'} ms/div · 触发：CH1 上升沿
        </text>
        <text x={14} y={(YT + YB) / 2} className="w48-tick axis mid" transform={`rotate(-90 14 ${(YT + YB) / 2})`}>
          电压（V）· 2 V/div
        </text>
        {/* final value */}
        <g className={`w48-cg ${on('sc_final')}`} {...hoverProps(['sc_final'])}>
          <line x1={X0} x2={X1} y1={Y(VS)} y2={Y(VS)} className="w48-ref final" />
          <text x={X1 - 4} y={Y(VS) + 14} className="w48-lbl final end">
            稳态基准 V_s = 5.0 V
          </text>
        </g>
        {/* CH1 */}
        <g className={`w48-cg ${on('sc_ch1')}`} {...hoverProps(['sc_ch1'])}>
          <path d={path(w.vs)} className="w48-hit" />
          <path d={path(w.vs)} className="w48-trace ch1" />
        </g>
        {/* CH2 */}
        <g className={`w48-cg ${on('sc_ch2')}`} {...hoverProps(['sc_ch2'])}>
          <path d={path(w.vc)} className="w48-hit" />
          <path d={path(w.vc)} className={`w48-trace ch2 ${s.kind}`} />
        </g>
        {/* settling time */}
        <g className={`w48-cg ${on('sc_ts')}`} {...hoverProps(['sc_ts'])}>
          <line x1={X(tsl)} x2={X(tsl)} y1={Y(VS) - 10} y2={YB} className="w48-proj ts" />
          <text x={X(tsl) + 4} y={YB - 6} className="w48-lbl ts">
            t_s(2%) = {fmtMs(tsl, 2)}
          </text>
        </g>
        {/* peak and t_p */}
        {hasPeak && (
          <>
            <g className={`w48-cg ${on('sc_tp')}`} {...hoverProps(['sc_tp'])}>
              <line x1={X(w.peak.t)} x2={X(w.peak.t)} y1={Y(w.peak.v)} y2={YB} className="w48-proj" />
              <text x={X(w.peak.t) + 4} y={YB - 22} className="w48-lbl tp">
                t_p = {fmtMs(w.peak.t)}
              </text>
            </g>
            <g className={`w48-cg ${on('sc_peak')}`} {...hoverProps(['sc_peak'])}>
              <line x1={X(w.peak.t)} x2={X(w.peak.t)} y1={Y(VS)} y2={Y(w.peak.v) + 6} className="w48-osarrow" />
              <circle cx={X(w.peak.t)} cy={Y(w.peak.v)} r={5} className="w48-peak" />
              <text x={X(w.peak.t) + 10} y={Y(w.peak.v) - 4} className="w48-lbl peak">
                V_peak = {fmtV(w.peak.v)} · 超调 +{fmtPct(mp)}
              </text>
            </g>
          </>
        )}
        {!hasPeak && (
          <text x={X(0.9e-3)} y={Y(VS) - 12} className="w48-lbl final">
            无过冲（{DAMPING_LABEL[s.kind]}）
          </text>
        )}
        {period && w.dip.v < -5e-3 && (
          <g className={`w48-cg ${on('sc_peak')}`} {...hoverProps(['sc_peak'])}>
            <circle cx={X(w.dip.t)} cy={Y(w.dip.v)} r={4.5} className="w48-peak" />
            <text x={X(w.dip.t) + 8} y={Y(w.dip.v) + 14} className="w48-lbl peak">
              下降沿下冲 {fmtV(w.dip.v)}（电容反向受压）
            </text>
          </g>
        )}
        <g className="w48-legend">
          <rect x={X1 - 156} y={YT + 6} width={150} height={38} rx={6} />
          <line x1={X1 - 148} x2={X1 - 128} y1={YT + 18} y2={YT + 18} className="w48-trace ch1" />
          <text x={X1 - 122} y={YT + 22}>
            CH1 激励方波 v_s(t)
          </text>
          <line x1={X1 - 148} x2={X1 - 128} y1={YT + 34} y2={YT + 34} className={`w48-trace ch2 ${s.kind}`} />
          <text x={X1 - 122} y={YT + 38}>
            CH2 电容电压 v_C(t)
          </text>
        </g>
      </svg>
      <div className="w48-cells">
        <Cell id="sc_case" name="阻尼状态" value={DAMPING_LABEL[s.kind]} tone={under ? 'bad' : s.kind === 'critical' ? 'good' : 'warn'} hint={`ζ = α/ω₀ = ${fx(s.alpha / s.w0)}`} />
        <Cell
          id="sc_wd"
          name={under ? 'α · ω_d' : 'α · 实根'}
          value={under ? `${fx(s.alpha)} · ${fx(s.wd)}` : s.kind === 'critical' ? `${fx(s.alpha)} · ${fx(s.s1)}` : `${fx(s.s1)}, ${fx(s.s2)}`}
          hint="单位 1/s · ω₀ = 10000 rad/s"
        />
        <Cell id="sc_final" name="终值 v_C(∞)" value="5.00 V" hint={`2% 稳定 ${fmtMs(tsl, 2)}${w.settled ? '' : '（半周期内未收敛）'}`} tone={w.settled ? '' : 'warn'} />
        <Cell id="sc_peak" name="峰值 V_peak" value={hasPeak ? fmtV(w.peak.v) : '无过冲'} tone={hasPeak ? 'bad' : 'good'} />
        <Cell id="sc_peak" name="超调 M_p" value={hasPeak ? `+${fmtPct(mp)}` : '0%'} tone={hasPeak ? 'bad' : 'good'} />
        <Cell id="sc_tp" name="峰值时间 t_p" value={hasPeak ? fmtMs(w.peak.t) : '—'} hint={under ? `π/ω_d = ${fmtMs(Math.PI / s.wd)}` : undefined} />
      </div>
    </div>
  );
}
