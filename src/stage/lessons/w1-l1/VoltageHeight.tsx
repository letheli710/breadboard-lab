// W1-L1 layer "02 电位高度阶梯台": nodes a and b above a reference ground (GND = 0 V), drawn as
// pillars whose height is the node's potential, like floors of a building. Two vertical
// sliders (drawn in the SVG on the pillars' scale; the pillars drag too) set v_a, v_b ∈
// [−5 V, +12 V]; the bracket between the pillar tops is the difference v_ab = v_a − v_b (and
// v_ba = −v_ab); the readout gives the work to carry q = 2 C from b to a, w = q · v_ab.
// Stage params: vh_a, vh_b (V). Hover ids: node_a_pillar, node_b_pillar, diff_vab_arrow.

import { useEffect } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { signed } from './ChargeFlow';
import './w1l1.css';

const V_MIN = -5;
const V_MAX = 12;
const Q = 2;

// viewBox 400 × 300: value ∈ [−5, 12] → y ∈ [270, 34]; slider tracks at the two sides
const Y = (v: number) => 34 + ((V_MAX - v) / (V_MAX - V_MIN)) * 236;
const A_X = [80, 132] as const;
const B_X = [232, 284] as const;
const TRACK = { a: 22, b: 378 };

const clampV = (v: number) => Math.min(V_MAX, Math.max(V_MIN, Math.round(v * 2) / 2));

/** "v" with an SVG subscript */
function Sub({ s }: { s: string }) {
  return (
    <>
      v
      <tspan dy="3" fontSize="0.75em">
        {s}
      </tspan>
      <tspan dy="-3"> </tspan>
    </>
  );
}

/** the potential under the pointer, from its position on the SVG */
function valueAt(e: React.PointerEvent<SVGGElement>): number | null {
  const svg = e.currentTarget.ownerSVGElement;
  const m = svg?.getScreenCTM();
  if (!m) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  return clampV(V_MAX - ((p.y - 34) / 236) * (V_MAX - V_MIN));
}

/** pointer handlers that drag a node's potential up and down */
function dragTo(set: (v: number) => void) {
  return {
    onPointerDown: (e: React.PointerEvent<SVGGElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const v = valueAt(e);
      if (v !== null) set(v);
    },
    onPointerMove: (e: React.PointerEvent<SVGGElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      const v = valueAt(e);
      if (v !== null) set(v);
    },
  };
}

const KEY_STEP: Record<string, number> = { ArrowUp: 0.5, ArrowRight: 0.5, ArrowDown: -0.5, ArrowLeft: -0.5, PageUp: 2, PageDown: -2 };

/** a vertical slider drawn in the SVG on the same scale as the pillars */
function VSlider({ name, value, set, x, id, lit }: { name: string; value: number; set: (v: number) => void; x: number; id: string; lit: boolean }) {
  const setHover = useStage((s) => s.setHover);
  const key = (e: React.KeyboardEvent) => {
    const step = KEY_STEP[e.key];
    if (step !== undefined) set(clampV(value + step));
    else if (e.key === 'Home') set(V_MIN);
    else if (e.key === 'End') set(V_MAX);
    else return;
    e.preventDefault();
  };
  return (
    <g
      className={`w1l1-vslider ${name} ${lit ? 'lit' : ''}`}
      role="slider"
      tabIndex={0}
      aria-label={`节点 ${name} 的电位`}
      aria-orientation="vertical"
      aria-valuemin={V_MIN}
      aria-valuemax={V_MAX}
      aria-valuenow={value}
      aria-valuetext={`${signed(value)} 伏`}
      onKeyDown={key}
      onPointerEnter={() => setHover([id])}
      onPointerLeave={() => setHover(null)}
      onFocus={() => setHover([id])}
      onBlur={() => setHover(null)}
      {...dragTo(set)}
    >
      <rect x={x - 18} y={Y(V_MAX) - 12} width="36" height={Y(V_MIN) - Y(V_MAX) + 24} className="w1l1-hit" />
      <line x1={x} y1={Y(V_MAX)} x2={x} y2={Y(V_MIN)} className="w1l1-track" />
      <line x1={x} y1={Y(0)} x2={x} y2={Y(value)} className="w1l1-track-fill" />
      <circle cx={x} cy={Y(value)} r="9" className="w1l1-thumb" />
      <text x={x} y="20" textAnchor="middle" className="w1l1-vslider-name">
        <Sub s={name} />
      </text>
      <text x={x} y="291" textAnchor="middle" className="w1l1-vslider-val">
        {signed(value)}
      </text>
    </g>
  );
}

export default function VoltageHeight() {
  const [va, setVa] = useStageParam<number>('vh_a', 9);
  const [vb, setVb] = useStageParam<number>('vh_b', 4);
  const setHover = useStage((s) => s.setHover);
  const lit = useLit();
  const vab = va - vb;
  const w = Q * vab;
  const y0 = Y(0);

  useEffect(() => () => setHover(null), [setHover]);

  const hover = (id: string) => ({ onPointerEnter: () => setHover([id]), onPointerLeave: () => setHover(null) });
  const pillar = (x: readonly [number, number], v: number, name: string, id: string, set: (v: number) => void) => {
    const top = Math.min(Y(v), y0);
    const h = Math.max(2, Math.abs(Y(v) - y0));
    const labelY = v >= 0 ? Y(v) - 8 : Y(v) + 16;
    return (
      <g className={`w1l1-pillar ${name} ${lit.includes(id) ? 'lit' : ''}`} {...hover(id)} {...dragTo(set)}>
        <rect x={x[0]} y={top} width={x[1] - x[0]} height={h} rx="4" />
        <line x1={x[0] - 6} y1={Y(v)} x2={x[1] + 6} y2={Y(v)} className="w1l1-floor" />
        <text x={(x[0] + x[1]) / 2} y={labelY} textAnchor="middle" className="w1l1-pillar-val">
          <Sub s={name} /> = {signed(v)} V
        </text>
        <text x={(x[0] + x[1]) / 2} y={y0 + (v >= 0 ? 16 : -6)} textAnchor="middle" className="w1l1-pillar-name">
          节点 {name}
        </text>
      </g>
    );
  };

  // the difference bracket between the two floors, arrow head at a (v_ab: how far a is above b)
  const ya = Y(va);
  const yb = Y(vb);
  const bx = 182;
  const diffLit = lit.includes('diff_vab_arrow');
  const same = Math.abs(vab) < 1e-9;

  return (
    <div className="w1l1-layer">
      <svg viewBox="0 0 400 300" className="w1l1-stairs" role="group" aria-label={`电位阶梯台：v_a = ${va} V，v_b = ${vb} V，v_ab = ${vab} V。拖动两侧竖滑块或柱子调节电位`}>
        <rect x="2" y="2" width="396" height="296" rx="10" className="w1l1-panel" />
        {Array.from({ length: V_MAX - V_MIN + 1 }, (_, k) => V_MIN + k).map((v) => (
          <g key={v}>
            <line x1="62" y1={Y(v)} x2="346" y2={Y(v)} className={v === 0 ? 'w1l1-gnd' : 'w1l1-grid'} />
            {v % 2 === 0 && (
              <text x="56" y={Y(v) + 4} textAnchor="end" className={v === 0 ? 'w1l1-gnd-label' : 'w1l1-plot-tick'}>
                {v}
              </text>
            )}
          </g>
        ))}
        <text x="346" y={y0 - 5} textAnchor="end" className="w1l1-gnd-label">
          GND = 0 V
        </text>
        <text x="62" y="20" className="w1l1-plot-axis-label">
          电位 (V)
        </text>
        {pillar(A_X, va, 'a', 'node_a_pillar', setVa)}
        {pillar(B_X, vb, 'b', 'node_b_pillar', setVb)}
        {/* floors carried to the bracket */}
        <line x1={A_X[1]} y1={ya} x2={bx} y2={ya} className="w1l1-dash" />
        <line x1={B_X[0]} y1={yb} x2={bx} y2={yb} className="w1l1-dash" />
        <g className={`w1l1-diff ${diffLit ? 'lit' : ''}`} {...hover('diff_vab_arrow')}>
          <rect x={bx - 34} y={Math.min(ya, yb) - 6} width="68" height={Math.abs(ya - yb) + 12} className="w1l1-hit" />
          {!same && (
            <>
              <line x1={bx} y1={yb} x2={bx} y2={ya + (ya < yb ? 8 : -8)} />
              <polygon points={ya < yb ? `${bx},${ya} ${bx - 6},${ya + 10} ${bx + 6},${ya + 10}` : `${bx},${ya} ${bx - 6},${ya - 10} ${bx + 6},${ya - 10}`} />
              <circle cx={bx} cy={yb} r="3" />
            </>
          )}
          <g transform={`translate(${bx} ${same ? ya - 22 : (ya + yb) / 2})`}>
            <rect x="-40" y="-17" width="80" height="34" rx="6" className="w1l1-diff-tag" />
            <text y="-3" textAnchor="middle" className="w1l1-diff-main">
              <Sub s="ab" /> = {signed(vab)} V
            </text>
            <text y="11" textAnchor="middle" className="w1l1-diff-sub">
              <Sub s="ba" /> = {signed(-vab)} V
            </text>
          </g>
        </g>
        <VSlider name="a" value={va} set={setVa} x={TRACK.a} id="node_a_pillar" lit={lit.includes('node_a_pillar')} />
        <VSlider name="b" value={vb} set={setVb} x={TRACK.b} id="node_b_pillar" lit={lit.includes('node_b_pillar')} />
      </svg>
      <div className="w1l1-readout">
        <span>
          v<sub>ab</sub> = v<sub>a</sub> − v<sub>b</sub> = {signed(va)} − ({signed(vb)}) = <b>{signed(vab)} V</b>，v<sub>ba</sub> = −v<sub>ab</sub> = {signed(-vab)} V
        </span>
        <span>
          把 q = 2 C 正电荷从 b 搬到 a：w = q · v<sub>ab</sub> = 2 C × ({signed(vab)} V) = <b>{signed(w)} J</b>
        </span>
        {w < 0 && <span className="w1l1-equiv">w &lt; 0：a 比 b 低，电荷从 b 到 a 是“下坡”，不用外力推，反而释放 {Math.abs(w).toFixed(1)} J 能量</span>}
        {same && (
          <span className="w1l1-equiv">
            两点等高：v<sub>ab</sub> = 0，搬运电荷不需要做功
          </span>
        )}
      </div>
    </div>
  );
}
