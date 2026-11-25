// Layer "02 比例权重与负载效应曲线": two live charts of the current circuit.
// 1) the weight k = R2 / (R1 + R2) against R2 (R1 fixed at its slider value): it is the voltage
//    ratio v2/Vs of the divider and, the same function, the current ratio i1/i of the current
//    divider ("分压看自己，分流看对方"); a strip under the axis colours the power of R2 against
//    the 1/4 W rating. 2) the loaded divider's output against the load ratio RL/R2 (log axis),
//    with the no-load line and the RL = 10·R2 rule.

import { useEffect, useState } from 'react';
import { useLit } from '../../stageStore';
import { Controls, hoverProps, ScaleNotice, useCircuit, useClearHoverOnUnmount, type Circuit } from './circuit';
import { fmtP, fmtV, heatOf, solve, vLoaded } from './model';

const X0 = 56;
const X1 = 500;

function RatioChart({ c, lit }: { c: Circuit; lit: string[] }) {
  const Y0 = 138;
  const Y1 = 28;
  const x = (r2: number) => X0 + ((r2 - 0.5) / 9.5) * (X1 - X0);
  const y = (k: number) => Y0 - k * (Y0 - Y1);
  const samples = Array.from({ length: 191 }, (_, i) => 0.5 + i * 0.05);
  const k = (r2: number) => r2 / (c.r1 + r2);
  const line = samples.map((r, i) => `${i ? 'L' : 'M'} ${x(r).toFixed(1)} ${y(k(r)).toFixed(1)}`).join(' ');
  const r2 = Math.min(10, Math.max(0.5, c.r2));
  const k0 = k(r2);
  const on = (id: string) => (lit.includes(id) ? 'lit' : '');
  const unit = c.scale === 'board' ? 'kΩ' : 'Ω';
  // the power of R2 along the axis, in the current topology and scale
  const pOf = (r: number) => solve(c.topo, c.vs, c.r1, r, c.rl, c.r3, c.scale).parts[1].p;
  const segs = samples.slice(0, -1).map((r) => ({ r, h: heatOf(pOf(r + 0.025)) }));
  const pNow = pOf(r2);
  const right = r2 > 6.5;
  return (
    <svg viewBox="0 0 520 206" className="l7-chart ratio" role="img" aria-label={`分压比与分流比曲线：R2 = ${c.r2} ${unit}，k = ${k0.toFixed(3)}`}>
      <text x="8" y="15" className="l7-ctitle">
        分压比 v2/Vs 与分流比 i1/i 随 R2 变化（k = R2 / (R1 + R2)）
      </text>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={X0} x2={X1} y1={y(t)} y2={y(t)} className="l7-grid" />
          <text x={X0 - 6} y={y(t) + 4} textAnchor="end" className="l7-tick">
            {t.toFixed(2)}
          </text>
        </g>
      ))}
      {[0.5, 2, 4, 6, 8, 10].map((t) => (
        <text key={t} x={x(t)} y={Y0 + 36} textAnchor="middle" className="l7-tick">
          {t}
        </text>
      ))}
      <text x={X1} y={Y0 + 54} textAnchor="end" className="l7-tick axis">
        R2 / {unit}（R1 固定）
      </text>
      <text x={14} y={y(0.5)} textAnchor="middle" className="l7-tick axis" transform={`rotate(-90 14 ${y(0.5)})`}>
        比例系数 k
      </text>
      <g id="chart_vdiv_curve_line" data-hl="tok_v2" className={`l7-cg ${on('tok_v2')}`} {...hoverProps(['tok_v2'])}>
        <path d={line} className="l7-hit" />
        <path d={line} className="l7-curve vdiv" />
      </g>
      <g id="chart_cdiv_curve_line" data-hl="tok_i1" className={`l7-cg ${on('tok_i1')}`} {...hoverProps(['tok_i1'])}>
        <path d={line} className="l7-hit" />
        <path d={line} className="l7-curve cdiv" />
      </g>
      <g id="chart_ratio_curve_dot" data-hl="tok_r2" className={`l7-cg ${on('tok_r2')}`} {...hoverProps(['tok_r2'])}>
        <line x1={x(r2)} x2={x(r2)} y1={Y0} y2={y(k0)} className="l7-proj" />
        <circle cx={x(r2)} cy={y(k0)} r={on('tok_r2') ? 8 : 6} className="l7-dot" />
        <text x={x(r2) + (right ? -10 : 10)} y={y(k0) + (right ? -10 : 18)} textAnchor={right ? 'end' : 'start'} className="l7-dotlabel">
          R2 = {c.r2} {unit} → k = {k0.toFixed(3)}
        </text>
      </g>
      <g id="chart_r1_param_badge" data-hl="tok_r1" className={`l7-badge ${on('tok_r1')}`} {...hoverProps(['tok_r1'])}>
        <rect x={X0 + 6} y={Y1 + 2} width="112" height="20" rx="6" />
        <text x={X0 + 62} y={Y1 + 16} textAnchor="middle">
          R1 = {c.r1} {unit}（固定）
        </text>
      </g>
      <g className="l7-legend">
        <line x1={X1 - 196} x2={X1 - 178} y1={Y0 - 14} y2={Y0 - 14} className="l7-curve vdiv" />
        <text x={X1 - 174} y={Y0 - 10}>
          v2/Vs
        </text>
        <line x1={X1 - 132} x2={X1 - 114} y1={Y0 - 14} y2={Y0 - 14} className="l7-curve cdiv" />
        <text x={X1 - 110} y={Y0 - 10}>
          i1/i（两线重合）
        </text>
      </g>
      <g id="chart_power_limit_zone" data-hl="tok_safety_scale" className={`l7-pzone ${on('tok_safety_scale')}`} {...hoverProps(['tok_safety_scale'])}>
        {segs.map((sg) => (
          <rect key={sg.r} x={x(sg.r)} y={Y0 + 8} width={x(sg.r + 0.05) - x(sg.r) + 0.4} height="12" className={`heat-${sg.h}`} />
        ))}
        <line x1={x(r2)} x2={x(r2)} y1={Y0 + 6} y2={Y0 + 22} className="l7-pmark" />
        <text x={X0 - 6} y={Y0 + 18} textAnchor="end" className="l7-tick">
          P_R2
        </text>
        <text x={X0} y={Y0 + 54} className="l7-tick">
          P_R2 = {fmtP(pNow)}（绿 &lt; 125 mW · 橙 &lt; 250 mW · 红 冒烟）
        </text>
      </g>
    </svg>
  );
}

function LoadingChart({ c, lit }: { c: Circuit; lit: string[] }) {
  const Y0 = 168;
  const Y1 = 30;
  const lx = (a: number) => X0 + ((Math.log10(a) + 1) / (Math.log10(20) + 1)) * (X1 - X0);
  const vmax = c.vs * 1.08;
  const y = (v: number) => Y0 - (v / vmax) * (Y0 - Y1);
  const samples = Array.from({ length: 161 }, (_, i) => Math.pow(10, -1 + (i / 160) * (Math.log10(20) + 1)));
  const curve = samples.map((a, i) => `${i ? 'L' : 'M'} ${lx(a).toFixed(1)} ${y(vLoaded(c.vs, c.r1, c.r2, a)).toFixed(1)}`).join(' ');
  const v0 = (c.vs * c.r2) / (c.r1 + c.r2);
  const load = c.topo === 'mixed_socratic' ? c.r3 : c.rl;
  const a = load / c.r2;
  const ac = Math.min(20, Math.max(0.1, a));
  const vo = vLoaded(c.vs, c.r1, c.r2, a);
  const on = (id: string) => (lit.includes(id) ? 'lit' : '');
  const name = c.topo === 'mixed_socratic' ? 'R3' : 'RL';
  return (
    <svg viewBox="0 0 520 206" className="l7-chart loading" role="img" aria-label={`负载效应曲线：${name}/R2 = ${a.toFixed(2)}，v_out = ${fmtV(vo)}`}>
      <text x="8" y="14" className="l7-ctitle">
        带载分压输出电压 v_out 随负载比 RL/R2 塌陷曲线
      </text>
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={X0} x2={X1} y1={y(t * c.vs)} y2={y(t * c.vs)} className="l7-grid" />
          <text x={X0 - 6} y={y(t * c.vs) + 4} textAnchor="end" className="l7-tick">
            {(t * c.vs).toFixed(1)}
          </text>
        </g>
      ))}
      {[0.1, 0.5, 1, 2, 5, 10, 20].map((t) => (
        <g key={t}>
          <line x1={lx(t)} x2={lx(t)} y1={Y0} y2={Y1} className="l7-grid v" />
          <text x={lx(t)} y={Y0 + 14} textAnchor="middle" className="l7-tick">
            {t}
          </text>
        </g>
      ))}
      <text x={X1} y={Y0 + 30} textAnchor="end" className="l7-tick axis">
        负载比 RL / R2（对数轴）
      </text>
      <text x={14} y={(Y0 + Y1) / 2} textAnchor="middle" className="l7-tick axis" transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}>
        v_out / V
      </text>
      <g id="chart_vout_ref_line" data-hl="tok_vs" className={`l7-cg ${on('tok_vs')}`} {...hoverProps(['tok_vs'])}>
        <line x1={X0} x2={X1} y1={y(c.vs)} y2={y(c.vs)} className="l7-hit" />
        <line x1={X0} x2={X1} y1={y(c.vs)} y2={y(c.vs)} className="l7-ref vs" />
        <text x={X0 + 6} y={y(c.vs) - 4} className="l7-reflabel vs">
          Vs = {c.vs.toFixed(1)} V
        </text>
      </g>
      <g className={`l7-cg ${on('tok_v2')}`} {...hoverProps(['tok_v2'])}>
        <line x1={X0} x2={X1} y1={y(v0)} y2={y(v0)} className="l7-ref noload" />
        <text x={X1 - 4} y={y(v0) - 5} textAnchor="end" className="l7-reflabel noload">
          空载理想值 ({fmtV(v0)})
        </text>
      </g>
      <g className="l7-cg">
        <line x1={lx(10)} x2={lx(10)} y1={Y0} y2={Y1 + 18} className="l7-ref rule" />
        <text x={lx(10) - 4} y={Y0 - 6} textAnchor="end" className="l7-reflabel rule">
          工程硬分压判据 (RL = 10·R2)
        </text>
      </g>
      <g id="chart_loading_sag_curve" data-hl="tok_rl" className={`l7-cg ${on('tok_rl')}`} {...hoverProps(['tok_rl'])}>
        <path d={curve} className="l7-hit" />
        <path d={curve} className="l7-curve sag" />
      </g>
      <g id="chart_vout_y_proj" data-hl="tok_node_mid" className={`l7-cg ${on('tok_node_mid')}`} {...hoverProps(['tok_node_mid'])}>
        <path d={`M ${lx(ac)} ${Y0} L ${lx(ac)} ${y(vo)} L ${X0} ${y(vo)}`} className="l7-proj" />
        <circle cx={lx(ac)} cy={y(vo)} r={on('tok_node_mid') ? 8 : 6} className="l7-dot sag" />
        <text x={lx(ac) + (ac > 6 ? -10 : 10)} y={y(vo) + 18} textAnchor={ac > 6 ? 'end' : 'start'} className="l7-dotlabel">
          {name}/R2 = {a.toFixed(2)} → v_out = {fmtV(vo)}
        </text>
      </g>
    </svg>
  );
}

export default function Curves() {
  const c = useCircuit();
  const lit = useLit();
  useClearHoverOnUnmount();
  const v0 = (c.vs * c.r2) / (c.r1 + c.r2);
  const load = c.topo === 'mixed_socratic' ? c.r3 : c.rl;
  const vo = vLoaded(c.vs, c.r1, c.r2, load / c.r2);
  const loadedMode = c.topo === 'loaded_vdiv' || c.topo === 'mixed_socratic';
  const [pick, setPick] = useState<'ratio' | 'loading' | null>(null);
  useEffect(() => setPick(null), [c.topo]);
  const show = pick ?? (loadedMode ? 'loading' : 'ratio');
  return (
    <div className="l7-layer">
      <Controls c={c} />
      {/* narrow screens show one chart at a time */}
      <div className="l7-seg small l7-chartpick" role="radiogroup" aria-label="选择曲线">
        <button role="radio" aria-checked={show === 'ratio'} className={show === 'ratio' ? 'on' : ''} onClick={() => setPick('ratio')}>
          比例权重曲线
        </button>
        <button role="radio" aria-checked={show === 'loading'} className={show === 'loading' ? 'on' : ''} onClick={() => setPick('loading')}>
          负载效应曲线
        </button>
      </div>
      <div className="l7-charts" data-show={show}>
        <RatioChart c={c} lit={lit} />
        <LoadingChart c={c} lit={lit} />
      </div>
      <p className="l7-chartnote">
        {loadedMode ? '' : '（切到「带载分压」可拖动 RL）'}
        接上 {c.topo === 'mixed_socratic' ? 'R3' : 'RL'} 后 v_out = {fmtV(vo)}，比空载 {fmtV(v0)} 低 {(((v0 - vo) / v0) * 100).toFixed(1)}%
      </p>
      <ScaleNotice c={c} />
    </div>
  );
}
