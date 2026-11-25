// The waveform view of a W4-L6 layer: the circuit's response around t = 0 (RK4 of the t > 0
// circuit, model.simulate). Top: v_C (solid, a state variable: continuous) with i_C (dashed: may
// jump); bottom: i_L (solid, continuous) with v_L (dashed, may jump). Each trace has its own scale
// (left axis: solid, right axis: dashed). The snapshot of the layer is marked: 01 the t = 0⁻
// values (with i_C = v_L = 0), 02 the t = 0⁺ tangents of v_C, i_L (slopes i_C/C, v_L/L) and the
// jumped i_C(0⁺), v_L(0⁺), 03 the t = ∞ asymptotes.

import { useMemo } from 'react';
import { fmt, simulate, type Bounds, type Circuit, type Moment, type Sample } from './model';
import { useLit, useStage } from '../../stageStore';
import { C, Lbl } from './parts';

const X0 = 46;
const X1 = 396;
const PANELS = [
  { y0: 22, y1: 100, solid: 'vC', dash: 'iC', sU: 'V', dU: 'A', sName: 'v_C', dName: 'i_C', sCol: C.cap, sT: C.capT, dCol: C.warn, dT: C.warnT },
  { y0: 134, y1: 212, solid: 'iL', dash: 'vL', sU: 'A', dU: 'V', sName: 'i_L', dName: 'v_L', sCol: C.ind, sT: C.indT, dCol: C.vsrc, dT: C.vsrcT },
] as const;

function range(xs: number[]): [number, number] {
  let lo = Math.min(0, ...xs);
  let hi = Math.max(0, ...xs);
  if (hi - lo < 1e-9) hi = lo + 1;
  const pad = (hi - lo) * 0.12;
  lo -= pad;
  hi += pad;
  return [lo, hi];
}

export default function Wave({ c, b, m }: { c: Circuit; b: Bounds; m: Moment }) {
  const { T, pts } = useMemo(() => simulate(c), [c]);
  const t0 = pts[0].t;
  const X = (t: number) => X0 + ((t - t0) / (T - t0)) * (X1 - X0);
  const xz = X(0);
  return (
    <>
      {PANELS.map((p, k) => {
        const sv = pts.map((q) => q[p.solid]);
        const dv = pts.map((q) => q[p.dash]);
        const [sl, sh] = range(sv);
        const [dl, dh] = range(dv);
        const Ys = (v: number) => p.y1 - ((v - sl) / (sh - sl)) * (p.y1 - p.y0);
        const Yd = (v: number) => p.y1 - ((v - dl) / (dh - dl)) * (p.y1 - p.y0);
        const path = (key: keyof Sample, Y: (v: number) => number) => pts.map((q, i) => `${i ? 'L' : 'M'} ${X(q.t).toFixed(1)} ${Y(q[key]).toFixed(1)}`).join(' ');
        const s0 = p.solid === 'vC' ? b.vC0 : b.iL0;
        const slope = p.solid === 'vC' ? b.dvC : b.diL;
        const sInf = p.solid === 'vC' ? b.vCinf : b.iLinf;
        const dJump = p.dash === 'iC' ? b.iC0p : b.vL0p;
        // tangent at 0⁺ over the first fifth of the window, clipped to the panel
        // (the line stops where it leaves the panel, so its slope is drawn true)
        const edge = slope > 0 ? sh : sl;
        const tt = Math.abs(slope) > 1e-12 ? Math.min(0.2 * T, ((edge - s0) / slope) * 0.96) : 0.2 * T;
        const yEnd = Ys(s0 + slope * tt);
        const zero = Ys(0);
        const note =
          m === 'pre'
            ? `${p.sName}(0⁻) = ${fmt(s0, 2)} ${p.sU}`
            : m === 'zero'
              ? `${p.dName}(0⁺) = ${fmt(dJump, 2)} ${p.dU} · 切线 ${fmt(slope, 2)} ${p.sU}/s`
              : `${p.sName}(∞) = ${fmt(sInf, 2)} ${p.sU}`;
        return (
          <g key={k}>
            <rect x={X0} y={p.y0} width={X1 - X0} height={p.y1 - p.y0} className="w46-plot" />
            {zero > p.y0 && zero < p.y1 && <line x1={X0} y1={zero} x2={X1} y2={zero} className="w46-axis0" />}
            <line x1={xz} y1={p.y0 - 4} x2={xz} y2={p.y1 + 4} className="w46-t0" />
            {/* axis extremes */}
            <Lbl x={X0 - 4} y={p.y0 + 8} s={fmt(sh, 1)} color={p.sT} anchor="end" cls="w46-tick" />
            <Lbl x={X0 - 4} y={p.y1} s={fmt(sl, 1)} color={p.sT} anchor="end" cls="w46-tick" />
            <Lbl x={X1 + 4} y={p.y0 + 8} s={fmt(dh, 1)} color={p.dT} anchor="start" cls="w46-tick" />
            <Lbl x={X1 + 4} y={p.y1} s={fmt(dl, 1)} color={p.dT} anchor="start" cls="w46-tick" />
            <Lbl x={X0 - 4} y={(p.y0 + p.y1) / 2 + 4} s={p.sU} color={p.sT} anchor="end" cls="w46-tick" />
            <Lbl x={X1 + 4} y={(p.y0 + p.y1) / 2 + 4} s={p.dU} color={p.dT} anchor="start" cls="w46-tick" />
            {/* legend, and the snapshot's values at the right of the legend row */}
            <g>
              <line x1={X0 + 2} y1={p.y0 - 9} x2={X0 + 16} y2={p.y0 - 9} stroke={p.sCol} strokeWidth={2.6} />
              <Lbl x={X0 + 19} y={p.y0 - 5} s={`${p.sName} 连续`} color={p.sT} anchor="start" cls="w46-tag" />
              <line x1={X0 + 68} y1={p.y0 - 9} x2={X0 + 82} y2={p.y0 - 9} stroke={p.dCol} strokeWidth={2} strokeDasharray="5 3" />
              <Lbl x={X0 + 85} y={p.y0 - 5} s={`${p.dName} 可跃变`} color={p.dT} anchor="start" cls="w46-tag" />
            </g>
            <Lbl x={X1} y={p.y0 - 5} s={note} color={m === 'zero' ? p.dT : p.sT} anchor="end" cls="w46-val" />
            <Trace id="wave_jump" d={path(p.dash, Yd)} color={p.dCol} w={2} dash="5 3" />
            <Trace id="wave_state" d={path(p.solid, Ys)} color={p.sCol} w={2.8} />

            {/* the snapshot of this layer */}
            {m === 'pre' && (
              <g>
                <circle cx={xz} cy={Ys(s0)} r={4.5} fill={p.sCol} />
                <circle cx={xz} cy={Yd(0)} r={3.8} fill="#fff" stroke={p.dCol} strokeWidth={2} />
              </g>
            )}
            {m === 'zero' && (
              <g>
                <line x1={xz} y1={Ys(s0)} x2={X(tt)} y2={yEnd} stroke={C.ink} strokeWidth={1.8} strokeDasharray="3 2" />
                <circle cx={xz} cy={Ys(s0)} r={4} fill={p.sCol} />
                <circle cx={xz} cy={Yd(dJump)} r={4.5} fill={p.dCol} />
                <circle cx={xz} cy={Yd(0)} r={3.4} fill="#fff" stroke={p.dCol} strokeWidth={1.8} />
              </g>
            )}
            {m === 'inf' && <line x1={xz} y1={Ys(sInf)} x2={X1} y2={Ys(sInf)} stroke={C.ink} strokeWidth={1.4} strokeDasharray="6 3" />}
          </g>
        );
      })}
      <Lbl x={xz} y={226} s="t = 0" color={C.ink} cls="w46-tag" />
      <Lbl x={X1} y={226} s={`t → ${fmt(T, 1)} s`} color={C.muted} anchor="end" cls="w46-tick" />
    </>
  );
}

/** a curve linked to a hover-map id: thicker with an amber glow when lit, a wide invisible hit line */
function Trace({ id, d, color, w, dash }: { id: string; d: string; color: string; w: number; dash?: string }) {
  const lit = useLit().includes(id);
  const setHover = useStage((st) => st.setHover);
  return (
    <g className={`w46-trace${lit ? ' lit' : ''}`} onPointerEnter={() => setHover([id])} onPointerLeave={() => setHover(null)}>
      <path d={d} className="w46-trace-hit" />
      <path d={d} className="w46-trace-line" fill="none" stroke={color} strokeWidth={lit ? w + 1.4 : w} strokeDasharray={dash} />
    </g>
  );
}
