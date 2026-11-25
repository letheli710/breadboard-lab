// Layer 01 · 2D 旋转相量矢量图 ↔ 时域正弦波实时投影. Left: the complex plane, a pointer of length V_m
// turning counter-clockwise at ω from its t = 0 angle φ; its shadow on the real axis is
// V_m cos(ωt + φ). The shadow is set upright on the "Re 投影" ruler and carried across to the time
// plot, which records v(t) as the pointer turns (slow motion: the plot window is swept in 6 s).
// "冻结 t=0 快照" stops the turning at t = 0 with a flash: the common factor e^{jωt} is stripped and
// what is left is the phasor V = V_m∠φ, with its rectangular parts x + jy and the quadrant correction
// of arctan(y/x).

import { useEffect, useRef, useState } from 'react';
import { DEG, fmt, fmtAng, fmtRect, fmtTime, freqOf, periodOf, polar, quadrantFix } from './model';
import { C, Cell, Lbl, Obj, P, Slider, Vec, ArcArrow, arcPath, useClearHoverOnUnmount, useHot, useParam } from './parts';
import './w5l1.css';

const CX = 92;
const CY = 120;
const RF = 82; // px of the full-scale circle
const RX = 194; // the upright Re ruler
const X0 = 214;
const X1 = 452;
const SWEEP = 6; // real seconds to sweep the plot window
const WINDOWS = [0.3, 0.75, 1.5, 3, 7.5, 15];

/** the plot window: the smallest that shows at least two periods (0.3 s at ω ≥ 42 rad/s) */
const windowOf = (T: number) => WINDOWS.find((w) => w >= 2 * T) ?? WINDOWS[WINDOWS.length - 1];
/** full scale of the drawing: 5, 10 or 20 V */
const fullScale = (Vm: number) => (Vm <= 5 ? 5 : Vm <= 10 ? 10 : 20);

export default function PhasorLayer() {
  useClearHoverOnUnmount();
  const [Vm, setVm] = useParam<number>(P.vm, 12);
  const [w, setW] = useParam<number>(P.w, 50);
  const [phi, setPhi] = useParam<number>(P.phi, 10);
  const [play, setPlay] = useParam<boolean>(P.play, true);
  const [t, setT] = useState(0);
  const T = periodOf(w);
  const W = windowOf(T);

  // the turning: simulated time runs W / SWEEP times real time
  const raf = useRef(0);
  useEffect(() => {
    if (!play) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      setT((x) => {
        const n = x + (dt * W) / SWEEP;
        return n > W ? 0 : n;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [play, W]);

  const tt = play ? Math.min(t, W) : 0;
  const FS = fullScale(Vm);
  const k = RF / FS;
  const len = Vm * k;
  const th = (w * tt) / DEG + phi; // ωt + φ in degrees
  const tip = { x: CX + len * Math.cos(th * DEG), y: CY - len * Math.sin(th * DEG) };
  const re = Vm * Math.cos(th * DEG);
  const X = (s: number) => X0 + (s / W) * (X1 - X0);
  const Y = (v: number) => CY - v * k;
  const N = 260;
  const wave = (to: number) =>
    Array.from({ length: N + 1 }, (_, i) => {
      const s = (i / N) * to;
      return `${i ? 'L' : 'M'} ${X(s).toFixed(1)} ${Y(Vm * Math.cos(w * s + phi * DEG)).toFixed(1)}`;
    }).join(' ');
  // one period, from the first crest at t ≥ 0
  const tp = ((((-phi * DEG) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / w;
  const t0 = tp + T <= W ? tp : 0;
  const z = polar(Vm, phi);
  const qf = quadrantFix(z);
  const zx = CX + z.re * k;
  const zy = CY - z.im * k;

  return (
    <div className="w51-layer">
      <div className="w51-controls">
        <Slider id="ph_amp" label="幅值 V_m" short="V_m" min={1} max={20} step={0.5} value={Vm} onChange={setVm} text={`${fmt(Vm)} V`} />
        <Slider id="ph_omega" label="角频率 ω" short="ω" min={1} max={100} step={1} value={w} onChange={setW} text={`${fmt(w)} rad/s`} />
        <Slider id="ph_phi" label="初相位 φ" short="φ" min={-180} max={180} step={5} value={phi} onChange={setPhi} text={fmtAng(phi, true)} />
        <PlayButton play={play} onClick={() => setPlay(!play)} />
      </div>

      <div className="w51-svgwrap">
        <svg
          viewBox="0 0 460 238"
          className="w51-svg"
          role="img"
          aria-label={`旋转相量：V_m = ${fmt(Vm)} V，ω = ${fmt(w)} rad/s，φ = ${fmtAng(phi)}${play ? '，旋转中' : '，t = 0 快照'}`}
        >
          <rect x="1" y="1" width="458" height="236" rx="10" className="w51-bg" />
          {play ? (
            <Lbl x={12} y={17} s="复平面 · 逆时针旋转矢量" cls="w51-tag" color={C.muted} anchor="start" />
          ) : (
            <Obj id="ph_snap">
              <Lbl x={10} y={18} s={`t = 0 快照：V = ${fmt(Vm)}∠${fmtAng(phi)}`} color={C.vecT} anchor="start" cls="w51-lbl strong" />
            </Obj>
          )}
          <Lbl x={452} y={17} s="时域 v(t) = V_m cos(ωt + φ)" cls="w51-tag" color={C.muted} anchor="end" />

          {/* quadrant tint for the snapshot (x < 0 needs the ±180° correction) */}
          {!play && (qf.q === 2 || qf.q === 3) && (
            <Obj id="ph_quad">
              <rect x={CX - RF - 4} y={qf.q === 2 ? CY - RF - 4 : CY} width={RF + 4} height={RF + 4} fill={qf.q === 2 ? '#fda4af' : '#fcd34d'} opacity={0.22} />
              <Lbl
                x={CX - RF + 2}
                y={qf.q === 2 ? CY - RF + 10 : CY + RF - 2}
                s={qf.q === 2 ? 'Q2：+180°' : 'Q3：−180°'}
                anchor="start"
                color={qf.q === 2 ? C.roseT : C.amberT}
                cls="w51-tick"
              />
            </Obj>
          )}

          {/* axes and the full-scale circle */}
          <line x1={CX - RF - 6} y1={CY} x2={CX + RF + 8} y2={CY} className="w51-axis" />
          <line x1={CX} y1={CY + RF + 6} x2={CX} y2={CY - RF - 8} className="w51-axis" />
          <Lbl x={CX + RF + 6} y={CY + 13} s="Re" color={C.muted} cls="w51-tick" anchor="end" />
          <Lbl x={CX + 5} y={CY - RF - 1} s="Im (j)" color={C.muted} cls="w51-tick" anchor="start" />
          <circle cx={CX} cy={CY} r={RF} className="w51-fs" />
          <text x={CX + RF * 0.72} y={CY + RF * 0.72 + 10} className="w51-tick" fill={C.muted}>
            {FS} V
          </text>

          <Obj id="ph_amp" hit={`M ${CX + len} ${CY} A ${len} ${len} 0 1 0 ${CX - len} ${CY} A ${len} ${len} 0 1 0 ${CX + len} ${CY}`}>
            <circle cx={CX} cy={CY} r={len} className="w51-ring" />
          </Obj>

          {/* φ: the t = 0 reference */}
          <Obj id="ph_phi" hit={`M ${CX} ${CY} L ${CX + len * Math.cos(phi * DEG)} ${CY - len * Math.sin(phi * DEG)}`}>
            {play && <line x1={CX} y1={CY} x2={CX + len * Math.cos(phi * DEG)} y2={CY - len * Math.sin(phi * DEG)} stroke={C.axis} strokeWidth={1.6} strokeDasharray="4 3" />}
            {Math.abs(phi) >= 1 && <path d={arcPath(CX, CY, 20, 0, phi)} fill="none" stroke={C.amber} strokeWidth={1.8} />}
            <Lbl x={CX + 24 * Math.cos((phi / 2) * DEG) + 4} y={CY - 24 * Math.sin((phi / 2) * DEG) + 4} s="φ" color={C.amberT} anchor="start" />
          </Obj>

          {/* the shadow on the real axis */}
          <Obj id="ph_proj" hit={`M ${CX} ${CY} H ${CX + re * k} M ${RX} ${CY} V ${Y(re)} H ${X(tt)}`}>
            <line x1={tip.x} y1={tip.y} x2={tip.x} y2={CY} stroke={C.proj} strokeWidth={1.4} strokeDasharray="3 3" />
            <line x1={CX} y1={CY} x2={CX + re * k} y2={CY} stroke={C.proj} strokeWidth={4} strokeLinecap="round" />
            <line x1={RX} y1={CY - RF} x2={RX} y2={CY + RF} stroke={C.grid} strokeWidth={1.4} />
            <line x1={RX} y1={CY} x2={RX} y2={Y(re)} stroke={C.proj} strokeWidth={4} strokeLinecap="round" />
            <line x1={RX} y1={Y(re)} x2={X(tt)} y2={Y(re)} stroke={C.proj} strokeWidth={1.2} strokeDasharray="4 4" opacity={0.8} />
            <text x={RX + 4} y={CY + RF + 14} className="w51-tick" textAnchor="end" fill={C.projT}>
              Re 投影
            </text>
          </Obj>

          {/* ω: the turning (hidden in the snapshot) */}
          {play && (
            <Obj id="ph_omega">
              <ArcArrow cx={CX} cy={CY} r={len + 9} a0={th - 38} a1={th - 6} color={C.amber} w={2} />
              <Lbl x={CX + (len + 20) * Math.cos((th - 22) * DEG)} y={CY - (len + 20) * Math.sin((th - 22) * DEG) + 4} s="ω" color={C.amberT} />
            </Obj>
          )}

          {/* the rectangular parts of the snapshot */}
          {!play && (
            <Obj id="ph_rect">
              <line x1={zx} y1={zy} x2={zx} y2={CY} stroke={C.violet} strokeWidth={1.3} strokeDasharray="3 3" />
              <line x1={zx} y1={zy} x2={CX} y2={zy} stroke={C.violet} strokeWidth={1.3} strokeDasharray="3 3" />
              <Lbl x={zx} y={z.im >= 0 ? CY + 13 : CY - 5} s={`x = ${fmt(z.re, 2)}`} color={C.violetT} cls="w51-tick" />
              <Lbl x={z.re >= 0 ? CX - 4 : CX + 4} y={zy + 4} s={`y = ${fmt(z.im, 2)}`} color={C.violetT} cls="w51-tick" anchor={z.re >= 0 ? 'end' : 'start'} />
            </Obj>
          )}

          {/* the pointer */}
          <Obj id="ph_vec" hit={`M ${CX} ${CY} L ${tip.x} ${tip.y}`}>
            <Vec x0={CX} y0={CY} x1={tip.x} y1={tip.y} color={C.vec} w={3} />
            <circle cx={tip.x} cy={tip.y} r={3.5} fill={C.vec} />
          </Obj>

          {/* the snapshot */}
          {!play && (
            <Obj id="ph_snap">
              <circle cx={CX} cy={CY} r={RF + 6} className="w51-flash" />
            </Obj>
          )}

          {/* the time plot */}
          <rect x={X0} y={CY - RF} width={X1 - X0} height={2 * RF} className="w51-plot" />
          <line x1={X0} y1={CY} x2={X1} y2={CY} className="w51-axis" />
          <line x1={X0} y1={CY - Vm * k} x2={X1} y2={CY - Vm * k} className="w51-gridline" />
          <line x1={X0} y1={CY + Vm * k} x2={X1} y2={CY + Vm * k} className="w51-gridline" />
          <Lbl x={X1 - 3} y={CY - Vm * k + 11} s="+V_m" color={C.muted} cls="w51-tick" anchor="end" />
          <Lbl x={X1 - 3} y={CY + Vm * k - 4} s="−V_m" color={C.muted} cls="w51-tick" anchor="end" />
          {[0, W / 2, W].map((s, i) => (
            <text key={i} x={X(s)} y={CY + RF + 13} className="w51-tick" textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'} fill={C.muted}>
              {i === 0 ? '0' : fmtTime(s)}
            </text>
          ))}
          <text x={X1} y={CY + RF + 25} className="w51-tick" textAnchor="end" fill={C.muted}>
            t（{play ? '慢放' : 't = 0 快照'}）
          </text>

          <Obj id="ph_period">
            {T <= W ? (
              <g>
                <path d={`M ${X(t0)} ${CY - RF + 10} V ${CY - RF + 4} H ${X(t0 + T)} V ${CY - RF + 10}`} fill="none" stroke={C.amber} strokeWidth={1.5} />
                <Lbl x={(X(t0) + X(t0 + T)) / 2} y={CY - RF + 16} s={`T = 2π/ω = ${fmtTime(T)}`} color={C.amberT} cls="w51-tick" />
              </g>
            ) : (
              <Lbl x={X1 - 4} y={CY - RF + 12} s={`T = ${fmtTime(T)}（超出窗口）`} color={C.amberT} cls="w51-tick" anchor="end" />
            )}
          </Obj>

          <Obj id="ph_wave" hit={wave(W)}>
            <path d={wave(W)} className="w51-ghost" />
            {play && <path d={wave(tt)} className="w51-trace" />}
            {!play && <path d={wave(W)} className="w51-trace" />}
            <circle cx={X(tt)} cy={Y(re)} r={4} fill={C.proj} />
          </Obj>
          <circle cx={X(0)} cy={Y(Vm * Math.cos(phi * DEG))} r={3.4} fill={C.amber} />
          <Lbl x={X(0) + 6} y={Y(Vm * Math.cos(phi * DEG)) + (Math.cos(phi * DEG) >= 0 ? 13 : -6)} s="v(0) = V_m cos φ" color={C.amberT} cls="w51-tick" anchor="start" />
        </svg>
      </div>

      <div className="w51-readout">
        <div className="w51-rgrid">
          <Cell id="ph_amp" k="幅值 V_m" v={`${fmt(Vm)} V`} opt />
          <Cell id="ph_omega" k="ω · f" v={`${fmt(w)} rad/s · ${fmt(freqOf(w), 3)} Hz`} />
          <Cell id="ph_period" k="周期 T" v={fmtTime(T)} />
          <Cell id="ph_phi" k="初相 φ" v={fmtAng(phi, true)} opt />
          <Cell id="ph_snap" k="相量 V" v={`${fmt(Vm)}∠${fmtAng(phi)} V`} tone={C.vecT} />
          <Cell id="ph_rect" k="直角坐标" v={fmtRect(z)} tone={C.violetT} />
          <Cell
            id="ph_quad"
            k="象限校正"
            v={qf.fix ? `Q${qf.q}：${fmtAng(qf.raw)} ${qf.fix > 0 ? '+' : '−'} 180°` : qf.q ? `Q${qf.q}：不校正` : '在虚轴上'}
            tone={qf.fix ? C.roseT : undefined}
          />
        </div>
      </div>
    </div>
  );
}

function PlayButton({ play, onClick }: { play: boolean; onClick: () => void }) {
  const hot = useHot('ph_snap');
  return (
    <button className={`w51-btn${hot.lit ? ' lit' : ''}${play ? '' : ' on'}`} aria-pressed={!play} onClick={onClick} {...hot.on}>
      <span className="full">{play ? '冻结 t=0 快照' : '继续旋转播放'}</span>
      <span className="short">{play ? '冻结 t=0' : '旋转'}</span>
    </button>
  );
}
