// Layer "02 实时双通道示波器": the RC phase-shift divider of act 4 on a two-channel virtual scope.
// CH1 is v_in (5 V peak sine from the 函数信号发生器, taken as ideal here), CH2 is v_C — or v_R after
// swapping R and C — and MATH = CH1 − CH2 can be switched on. 2.5 V/div on both channels; the time
// base is the 1–2.5–5 step nearest a quarter period (two periods on screen), triggered on CH1's
// rising zero crossing at the left edge. Cursor A sits on CH1's first peak; cursor B can be dragged
// (it starts on CH2's peak), and Δφ = −(Δt/T) × 360° is read live. With the CH2 ground clip on the
// R–C node (03 layer) the capacitor is shorted and CH2 reads a flat 0 V.

import { useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { deg, hz, num, ohm, rc, sec, sig, timeDiv } from './model';
import { Cell, Ch2Seg, FreqSlider, hoverProps, RSeg, useClearHoverOnUnmount, useIsLit, useLab } from './state';

const X0 = 56;
const X1 = 612;
const YT = 30;
const YB = 262;
const DIVS = 8;
const VDIV = 2.5;

export default function Scope() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const on = useIsLit();
  const m = rc(lab.freq, lab.r);
  const fault = lab.clip === 'out';
  const swap = lab.ch2 === 'swap';
  const g2 = fault ? 0 : swap ? m.gainR : m.gain;
  const ph2 = swap ? m.phiR : m.phiC;
  const A1 = 5;
  const A2 = 5 * g2;
  const T = m.T;
  const w = m.w;
  const tdiv = timeDiv(lab.freq);
  const span = DIVS * tdiv;
  const X = (t: number) => X0 + (t / span) * (X1 - X0);
  const Y = (v: number) => (YT + YB) / 2 - (v / VDIV) * ((YB - YT) / 6);
  const rad = (d: number) => (d * Math.PI) / 180;
  const v1 = (t: number) => A1 * Math.sin(w * t);
  const v2 = (t: number) => A2 * Math.sin(w * t + rad(ph2));
  // MATH = CH1 − CH2 with CH2 on v_C: v_R
  const vm = (t: number) => v1(t) - 5 * m.gain * Math.sin(w * t + rad(m.phiC));
  const n = 480;
  const path = (f: (t: number) => number) =>
    Array.from({ length: n + 1 }, (_, k) => {
      const t = (k / n) * span;
      return `${k ? 'L' : 'M'} ${X(t).toFixed(1)} ${Y(Math.max(-7.6, Math.min(7.6, f(t)))).toFixed(1)}`;
    }).join(' ');
  const tA = T / 4;
  const tPk2 = T / 4 - (ph2 / 360) * T;
  const dtAuto = fault ? NaN : tPk2 - tA;
  // cursor B: dragged by hand, back on CH2's peak whenever the circuit changes
  const key = `${lab.freq}|${lab.r}|${lab.ch2}|${lab.clip}`;
  const [held, setHeld] = useState<{ key: string; t: number } | null>(null);
  const tB = held?.key === key ? held.t : null;
  const setTB = (t: number | null) => setHeld(t === null ? null : { key, t });
  const tb = tB ?? (fault ? tA : tPk2);
  const dtCur = tb - tA;
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef(false);
  const toT = (e: RPointerEvent<SVGElement>) => {
    const s = svg.current;
    const ctm = s?.getScreenCTM();
    if (!s || !ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return Math.min(span, Math.max(0, ((p.x - X0) / (X1 - X0)) * span));
  };
  const down = (e: RPointerEvent<SVGElement>) => {
    drag.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const t = toT(e);
    if (t !== null) setTB(t);
  };
  const move = (e: RPointerEvent<SVGElement>) => {
    if (!drag.current) return;
    const t = toT(e);
    if (t !== null) setTB(t);
  };
  const up = () => (drag.current = false);
  const vt = [-7.5, -5, -2.5, 0, 2.5, 5, 7.5];
  const arrowY = YT + 18;
  const ch2Name = swap ? 'v_R（R、C 对调）' : 'v_C';
  const cur = tB !== null;
  return (
    <div className="w52-layer">
      <div className="w52-dock wide">
        <FreqSlider lab={lab} />
        <RSeg lab={lab} />
        <Ch2Seg lab={lab} />
        <button className={`w52-fold ${on('sc_cursor')}`} onClick={() => setTB(null)} disabled={!cur} {...hoverProps(['sc_cursor'])}>
          游标吸附 CH2 峰
        </button>
      </div>
      <svg
        ref={svg}
        viewBox="0 0 640 300"
        className="w52-chart w52-scope"
        role="img"
        aria-label={`示波器：f = ${hz(lab.freq)}，CH2 ${ch2Name}，相移 ${deg(fault ? 0 : ph2)}`}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      >
        <defs>
          <marker id="w52s-dt" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#be123c" />
          </marker>
          <marker id="w52s-T" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#6d28d9" />
          </marker>
        </defs>
        <rect x={X0} y={YT} width={X1 - X0} height={YB - YT} className="w52-screen" onPointerDown={down} />
        {Array.from({ length: DIVS + 1 }, (_, k) => (
          <line key={`v${k}`} x1={X0 + (k * (X1 - X0)) / DIVS} x2={X0 + (k * (X1 - X0)) / DIVS} y1={YT} y2={YB} className={`w52-grid ${k === DIVS / 2 ? 'zero' : ''}`} />
        ))}
        {vt.map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={Y(v)} y2={Y(v)} className={`w52-grid ${v === 0 ? 'zero' : ''}`} />
            <text x={X0 - 6} y={Y(v) + 4} className="w52-tick end">
              {num(v, 1)}
            </text>
          </g>
        ))}
        {[2, 4, 6, 8].map((k) => (
          <text key={k} x={X0 + (k * (X1 - X0)) / DIVS} y={YB + 14} className="w52-tick mid">
            {sec(k * tdiv)}
          </text>
        ))}
        <text x={(X0 + X1) / 2} y={294} className="w52-tick axis mid">
          {sec(tdiv)}/div · CH1、CH2 均 2.5 V/div · 触发：CH1 上升过零
        </text>
        {/* period bracket */}
        {tA + T <= span && (
          <g className={`w52-cg ${on('sc_T')}`} {...hoverProps(['sc_T'])}>
            <line x1={X(tA)} x2={X(tA + T)} y1={YB - 12} y2={YB - 12} className="w52-tbar" markerStart="url(#w52s-T)" markerEnd="url(#w52s-T)" />
            <text x={X(tA + T / 2)} y={YB - 18} className="w52-lbl T mid">
              T = {sec(T)}
            </text>
          </g>
        )}
        {/* traces */}
        <g className={`w52-cg ${on('sc_ch1')}`} {...hoverProps(['sc_ch1'])}>
          <path d={path(v1)} className="w52-hit" />
          <path d={path(v1)} className="w52-trace ch1" />
        </g>
        {lab.ch2 === 'math' && !fault && (
          <g className={`w52-cg ${on('sc_math')}`} {...hoverProps(['sc_math'])}>
            <path d={path(vm)} className="w52-hit" />
            <path d={path(vm)} className="w52-trace math" />
          </g>
        )}
        <g className={`w52-cg ${on('sc_ch2')}`} {...hoverProps(['sc_ch2'])}>
          <path d={path(v2)} className="w52-hit" />
          <path d={path(v2)} className={`w52-trace ch2 ${fault ? 'dead' : ''}`} />
        </g>
        {/* cursors */}
        <g className={`w52-cg ${on('sc_dt', 'sc_cursor')}`} {...hoverProps(['sc_cursor'])}>
          <line x1={X(tA)} x2={X(tA)} y1={YT} y2={YB} className="w52-cur a" />
          <line x1={X(tb)} x2={X(tb)} y1={YT} y2={YB} className="w52-cur b" />
          <line x1={X(tb)} x2={X(tb)} y1={YT} y2={YB} className="w52-hit wide" style={{ cursor: 'ew-resize' }} onPointerDown={down} />
          <circle cx={X(tA)} cy={Y(A1)} r={4.5} className="w52-pk ch1" />
          {!fault && <circle cx={X(tPk2)} cy={Y(A2)} r={4.5} className="w52-pk ch2" />}
          {Math.abs(dtCur) > 0 && <line x1={X(tA)} x2={X(tb)} y1={arrowY} y2={arrowY} className="w52-dtbar" markerStart="url(#w52s-dt)" markerEnd="url(#w52s-dt)" />}
          <text x={Math.max(X(tA), X(tb)) + 8} y={arrowY + 4} className="w52-lbl dt">
            Δt = {num(dtCur * 1e6, 1)} µs → Δφ = {deg((-dtCur / T) * 360, 1)}
          </text>
        </g>
        {fault && (
          <text x={(X0 + X1) / 2} y={Y(0) - 10} className="w52-lbl bad mid">
            CH2 地夹夹在 R–C 节点：电容被示波器地短路，CH2 = 0 V，相移消失
          </text>
        )}
        <g className="w52-legend">
          <rect x={X1 - 160} y={YB - 60} width={154} height={lab.ch2 === 'math' ? 52 : 36} rx={6} />
          <line x1={X1 - 152} x2={X1 - 132} y1={YB - 48} y2={YB - 48} className="w52-trace ch1" />
          <text x={X1 - 126} y={YB - 44}>
            CH1 v_in（{num(A1, 2)} V 峰值）
          </text>
          <line x1={X1 - 152} x2={X1 - 132} y1={YB - 32} y2={YB - 32} className="w52-trace ch2" />
          <text x={X1 - 126} y={YB - 28}>
            CH2 {swap ? 'v_R' : 'v_C'}（{num(A2, 2)} V）
          </text>
          {lab.ch2 === 'math' && (
            <>
              <line x1={X1 - 152} x2={X1 - 132} y1={YB - 16} y2={YB - 16} className="w52-trace math" />
              <text x={X1 - 126} y={YB - 12}>
                MATH = CH1 − CH2 = v_R
              </text>
            </>
          )}
        </g>
      </svg>
      <div className="w52-cells">
        <Cell id="sc_freq" name="频率 f" value={hz(lab.freq)} hint={`T = ${sec(T)} · ω = ${sig(w, 4)} rad/s`} />
        {lab.ch2 === 'math' ? (
          <Cell id="sc_math" name="MATH v_R" value={`${num(5 * m.gainR, 2)} V · ${deg(m.phiR)}`} tone="good" hint="CH1 − CH2，超前 CH1" />
        ) : (
          <Cell id="c_xc" name="容抗 X_C" value={ohm(m.xc)} hint={`R/X_C = ${num(m.ratio, 4)}`} />
        )}
        <Cell
          id="c_gain"
          name={swap ? '|H_R| = V_R/V_in' : '|H_C| = V_C/V_in'}
          value={fault ? '0（短路）' : `${num(g2, 4)}`}
          tone={fault ? 'bad' : ''}
          hint={`CH2 峰值 ${num(A2, 2)} V`}
        />
        <Cell
          id="c_phase"
          name="自动测量 Δφ"
          value={fault ? '—' : deg(ph2)}
          tone={fault ? 'bad' : ph2 < 0 ? 'warn' : 'good'}
          hint={ph2 < 0 ? 'CH2 滞后（右移）' : 'CH2 超前（左移）'}
        />
        <Cell id="sc_dt" name="峰值时差 Δt" value={fault ? '—' : `${num(dtAuto * 1e6, 2)} µs`} hint="Δt = t_CH2 − t_CH1" />
        <Cell id="sc_cursor" name={cur ? '游标（手动）' : '游标（吸附 CH2 峰）'} value={`${deg((-dtCur / T) * 360, 1)}`} tone="minor" hint="拖动游标 B 读 Δt" />
      </div>
    </div>
  );
}
