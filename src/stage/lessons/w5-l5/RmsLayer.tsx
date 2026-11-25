// Layer 02 · the RMS area bench (Joule-heat equivalence). Top: one period of v(t) (sine, square,
// triangle, or DC + AC), its peak and its RMS level. Bottom: v²(t) — the heating power in a 1 Ω
// resistor — with its area shaded, and the equal-area rectangle of height V_rms² (the mean of v²).
// For the sine, the 削峰填谷 switch swings the caps of v² above ½V_p² about the mean-line
// crossings into the troughs: they fit exactly, which is why V_rms² = ½V_p². Presets: the North
// American 120 V and Chinese 220 V mains (RMS), whose peaks are 170 V and 311 V.

import { useEffect, useRef, useState } from 'react';
import { fmt, rmsOf, waveAt, type Wave } from './model';
import { Cell, DEF, P, Seg, Slider, SSub, Toggle, useClearHoverOnUnmount, useHot, useP } from './parts';
import './w5l5.css';

const X0 = 52;
const X1 = 448;
const YV = 82; // v axis
const HV = 50;
const YB = 280; // v² = 0
const HS = 100;
const N = 400;
const TAU = 2 * Math.PI;

const X = (phi: number) => X0 + (phi / TAU) * (X1 - X0);

const WAVES: { value: Wave; label: string; short: string }[] = [
  { value: 'sine', label: '正弦波', short: '正弦' },
  { value: 'square', label: '方波', short: '方波' },
  { value: 'triangle', label: '三角波', short: '三角' },
  { value: 'dcac', label: 'DC + AC', short: 'DC+AC' },
];

/** the fold angle (0 … 180°), eased towards its target */
function useFold(on: boolean) {
  const [a, setA] = useState(on ? 180 : 0);
  const cur = useRef(a);
  useEffect(() => {
    const target = on ? 180 : 0;
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      cur.current = target;
      setA(target);
      return;
    }
    const from = cur.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const u = Math.min(1, (t - t0) / 1400);
      const e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
      cur.current = from + (target - from) * e;
      setA(cur.current);
      if (u < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return a;
}

export default function RmsLayer() {
  useClearHoverOnUnmount();
  const hot = useHot();
  const [wave, setWave] = useP<Wave>(P.wave, DEF.wave);
  const [vp, setVp] = useP(P.vp, DEF.vp);
  const [v1, setV1] = useP(P.v1, DEF.v1);
  const [fold, setFold] = useP(P.fold, false);
  const isSine = wave === 'sine';
  const a = useFold(fold && isSine);
  const dc = wave === 'dcac';
  const f = (phi: number) => waveAt(wave, vp, v1, phi);
  const rms = rmsOf(wave, vp, v1);
  const vmax = dc ? Math.max(Math.abs(vp + Math.SQRT2 * v1), Math.abs(vp - Math.SQRT2 * v1)) : vp;
  const q = rms * rms; // mean of v²
  const qmax = vmax * vmax;
  const Yv = (v: number) => YV - (v / vmax) * HV;
  const Ys = (s: number) => YB - (s / qmax) * HS;
  const phis = Array.from({ length: N + 1 }, (_, k) => (k / N) * TAU);
  // square: draw the jumps as vertical edges
  const vPath =
    wave === 'square'
      ? `M ${X(0)} ${Yv(vp)} H ${X(TAU / 4)} V ${Yv(-vp)} H ${X((3 * TAU) / 4)} V ${Yv(vp)} H ${X(TAU)}`
      : phis.map((p, k) => `${k ? 'L' : 'M'} ${X(p).toFixed(1)} ${Yv(f(p)).toFixed(1)}`).join(' ');
  const sqPts = phis.map((p) => `${X(p).toFixed(1)} ${Ys(f(p) ** 2).toFixed(1)}`);
  const sqLine = `M ${sqPts.join(' L ')}`;
  const sqArea = `M ${X(0)} ${YB} L ${sqPts.join(' L ')} L ${X(TAU)} ${YB} Z`;

  // the sine's caps: v² above the mean, in quarter-period halves, each next to the crossing it swings about
  const capHalf = (pa: number, pb: number) => {
    const pts = Array.from({ length: 41 }, (_, k) => pa + ((pb - pa) * k) / 40).map((p) => `${X(p).toFixed(1)} ${Ys(f(p) ** 2).toFixed(1)}`);
    return `M ${X(pa).toFixed(1)} ${Ys(q).toFixed(1)} L ${pts.join(' L ')} L ${X(pb).toFixed(1)} ${Ys(q).toFixed(1)} Z`;
  };
  const caps = [
    { pa: 0, pb: TAU / 8, pivot: TAU / 8, dir: 1 },
    { pa: (3 * TAU) / 8, pb: TAU / 2, pivot: (3 * TAU) / 8, dir: -1 },
    { pa: TAU / 2, pb: (5 * TAU) / 8, pivot: (5 * TAU) / 8, dir: 1 },
    { pa: (7 * TAU) / 8, pb: TAU, pivot: (7 * TAU) / 8, dir: -1 },
  ];
  // v² clipped at the mean (what stays put while the caps move)
  const lowPts = phis.map((p) => `${X(p).toFixed(1)} ${Ys(Math.min(q, f(p) ** 2)).toFixed(1)}`);
  const lowArea = `M ${X(0)} ${YB} L ${lowPts.join(' L ')} L ${X(TAU)} ${YB} Z`;

  const foldTo = (v: boolean) => {
    if (!isSine) setWave('sine');
    setFold(isSine ? v : true);
  };
  const ratioTxt = wave === 'sine' ? '1/√2 ≈ 0.707' : wave === 'square' ? '1' : wave === 'triangle' ? '1/√3 ≈ 0.577' : '';

  return (
    <div className="w55-layer">
      <div className="w55-controls">
        <Seg<Wave> label="波形选择" value={wave} onChange={setWave} options={WAVES} />
        <button
          type="button"
          className={`w55-toggle${isSine && vp === 170 ? ' on' : ''}`}
          onClick={() => {
            setWave('sine');
            setVp(170);
          }}
        >
          <span className="full">北美 120 V</span>
          <span className="short">120 V</span>
        </button>
        <button
          type="button"
          className={`w55-toggle${isSine && vp === 311 ? ' on' : ''}`}
          onClick={() => {
            setWave('sine');
            setVp(311);
          }}
        >
          <span className="full">中国 220 V</span>
          <span className="short">220 V</span>
        </button>
        <Toggle label="削峰填谷" on={fold && isSine} onChange={foldTo} />
      </div>
      <div className="w55-svgwrap">
        <svg viewBox="0 0 460 300" className="w55-svg" role="img" aria-label={`RMS 面积演示：有效值 ${fmt(rms, 1)} V`}>
          {/* ---------------------------------------------------------- v(t) */}
          <rect x={X0} y={YV - HV - 8} width={X1 - X0} height={2 * HV + 16} className="w55-screen" />
          <text x={X0} y={18} className="w55-tk">
            v(t)（V）
          </text>
          <line x1={X0} x2={X1} y1={YV} y2={YV} className="w55-axis" />
          {dc && (
            <g {...hot('rms_dc')}>
              <line x1={X0} x2={X1} y1={Yv(vp)} y2={Yv(vp)} className="w55-dcline" />
              <text x={X1 - 4} y={Yv(vp) + 12} className="w55-lbl dc end">
                <SSub s={`V_dc = ${fmt(vp, 1)} V`} />
              </text>
            </g>
          )}
          <g {...hot('rms_v')}>
            <path d={vPath} className="w55-hit" />
            <path d={vPath} className="w55-tr v" />
          </g>
          <g {...hot('rms_peak')}>
            <circle cx={X(0)} cy={Yv(f(0))} r={3.6} className="w55-dot v" />
            <text x={X0 - 5} y={Yv(vmax) + 3.5} className="w55-tk end v">
              {fmt(vmax, 0)}
            </text>
          </g>
          <text x={X0 - 5} y={YV + 3.5} className="w55-tk end">
            0
          </text>
          <g {...hot('rms_line')}>
            <line x1={X0} x2={X1} y1={Yv(rms)} y2={Yv(rms)} className="w55-avg" />
            <line x1={X0} x2={X1} y1={Yv(rms)} y2={Yv(rms)} className="w55-hit" />
            <text x={(X0 + X1) / 2} y={Yv(rms) - 5} className="w55-lbl avg mid halo">
              <SSub s={`V_rms = ${fmt(rms, 1)} V`} />
            </text>
          </g>
          {/* ---------------------------------------------------------- v²(t) */}
          <text x={X0} y={164} className="w55-tk">
            v²(t)：1 Ω 电阻上的热功率
          </text>
          <line x1={X0} x2={X1} y1={YB} y2={YB} className="w55-axis" />
          <g {...hot('rms_sq')}>
            {isSine && a > 0.01 ? <path d={lowArea} className="w55-area" /> : <path d={sqArea} className="w55-area" />}
            {isSine &&
              a > 0.01 &&
              caps.map((c, k) => (
                <path key={k} d={capHalf(c.pa, c.pb)} className="w55-cap" transform={`rotate(${(c.dir * a).toFixed(2)} ${X(c.pivot).toFixed(1)} ${Ys(q).toFixed(1)})`} />
              ))}
            <path d={sqLine} className="w55-hit" />
            <path d={sqLine} className="w55-tr sq" />
          </g>
          <g {...hot('rms_rect')}>
            <rect x={X0} y={Ys(q)} width={X1 - X0} height={YB - Ys(q)} className="w55-rect" />
            <text x={X0 - 5} y={Ys(q) + 3.5} className="w55-tk end avg">
              <SSub s="V_rms²" />
            </text>
            <text x={(X0 + X1) / 2} y={Math.min(YB - 8, Ys(q) + 16)} className="w55-lbl avg mid halo">
              <SSub s={isSine ? '等面积矩形：V_rms² · T = ½V_p² · T' : '等面积矩形：V_rms² · T'} />
            </text>
          </g>
          <text x={X0 - 5} y={Ys(qmax) + 3.5} className="w55-tk end sq">
            <SSub s={dc ? 'v²_max' : 'V_p²'} />
          </text>
        </svg>
      </div>
      <div className="w55-cells">
        {dc ? (
          <>
            <Cell id="rms_dc" name="直流 V_dc" value={`${fmt(vp, 1)} V`} />
            <Cell id="rms_v" name="交流 V_1,rms" value={`${fmt(v1, 1)} V`} tone="v" />
            <Cell id="rms_line" name="V_rms = √(V_dc² + V_1,rms²)" value={`${fmt(rms, 2)} V`} tone="avg" />
          </>
        ) : (
          <>
            <Cell id="rms_peak" name="峰值 V_p" value={`${fmt(vp, 1)} V`} tone="v" />
            <Cell id="rms_line" name="有效值 V_rms" value={`${fmt(rms, 1)} V`} tone="avg" />
            <Cell id="rms_rect" name="V_rms / V_p" value={ratioTxt} tone="sq" />
          </>
        )}
      </div>
      <div className="w55-sliders">
        <Slider id={dc ? 'rms_dc' : 'rms_peak'} name={dc ? '直流偏置 V_dc' : '峰值 V_p'} value={vp} min={5} max={311} step={1} unit="V" digits={0} onChange={setVp} />
        {dc && <Slider id="rms_v" name="交流有效值 V_1,rms" value={v1} min={0} max={100} step={1} unit="V" digits={0} onChange={setV1} />}
      </div>
    </div>
  );
}
