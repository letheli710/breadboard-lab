// Layer "01 多支路节点动态合流台". Two scenes:
// - node: the ideal node A with three controllable branches i₁, i₂, i₃ (reference arrows into A)
//   and the auto-conserved branch i₄ = i₁ + i₂ + i₃ (reference arrow out of A); a balance on top
//   (Σ i_in | Σ i_out, both counted by the real direction), the circuit ⇄ water-pipe view
//   (Boylestad Ch. 6) and the sign-convention switch that rewrites the equation underneath.
// - cccs: a parallel circuit at node a with a current source, R₁, R₂ and a current-controlled
//   current source k·i (acts 5 and 6). The node voltage is solved from KCL + Ohm's law, so every
//   branch current shown (and animated) satisfies KCL; flipping the diamond's arrow shows the
//   classic sign trap. Values can be hidden while the guided example is being worked.

import { useEffect, type ReactNode } from 'react';
import { Tex } from '../../StageText';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { Flow, flowScale } from './flow';
import { arrowHead, fmt, hoverProps, Readout, Seg, Sym } from './svgBits';
import './kcl.css';

type Scene = 'node' | 'cccs';

export function NodeLayer() {
  const [scene, setScene] = useStageParam<Scene>('l1Scene', 'node');
  const setHover = useStage((s) => s.setHover);
  // a hovered element that unmounts gets no pointerleave
  useEffect(() => () => setHover(null), [setHover]);
  const head = (
    <Seg
      label="场景"
      value={scene}
      onChange={setScene}
      options={[
        ['node', '节点 A'],
        ['cccs', '受控源节点 a'],
      ]}
    />
  );
  return <div className="kcl-layer">{scene === 'node' ? <NodeScene head={head} /> : <CccsScene head={head} />}</div>;
}

/* ------------------------------------------------------------- scene 1: node A */

const A = { x: 250, y: 180 };
const INS = [
  { x: 66, y: 106 },
  { x: 44, y: 180 },
  { x: 66, y: 254 },
];
const OUT = { x: 456, y: 180 };
const SUB = ['₁', '₂', '₃', '₄'];
/** where the red real-direction arrow of a negative in-branch sits (beside its line) */
const offs = INS.map((p) => {
  const len = Math.hypot(A.x - p.x, A.y - p.y);
  return [(-(A.y - p.y) / len) * 13, ((A.x - p.x) / len) * 13].map((v) => +v.toFixed(1));
});

function NodeScene({ head }: { head: ReactNode }) {
  const [i1, setI1] = useStageParam('i1', 4);
  const [i2, setI2] = useStageParam('i2', 3);
  const [i3, setI3] = useStageParam('i3', -1);
  const [view, setView] = useStageParam<'circuit' | 'water'>('view', 'circuit');
  const [conv, setConv] = useStageParam<'in' | 'out'>('conv', 'in');
  const hover = useStage((s) => s.hover);
  const lit = useLit();
  const ins = [i1, i2, i3];
  const i4 = i1 + i2 + i3;
  const setters = [setI1, setI2, setI3];
  // the real inflow and outflow (a negative current flows against its arrow)
  const sumIn = ins.reduce((a, v) => a + Math.max(v, 0), 0) + Math.max(-i4, 0);
  const sumOut = ins.reduce((a, v) => a + Math.max(-v, 0), 0) + Math.max(i4, 0);
  // the water overlay shows while the water term (or the junction) is hovered
  const water = view === 'water' || !!hover?.includes('hl_water_junction');
  const L = (id: string) => lit.includes(id);
  const scale = flowScale(Math.max(...ins.map(Math.abs), Math.abs(i4)), 110, 13);
  const width = (v: number) => 2.6 + Math.min(Math.abs(v), 15) * 0.42;
  const sign = conv === 'in' ? 1 : -1;
  const s = (c: number) => (c * sign > 0 ? '+' : '-');
  const n = (v: number) => (v < 0 ? `(${v.toFixed(1)})` : v.toFixed(1));
  const symEq = `${s(1) === '+' ? '' : '-'}i_1 ${s(1)} i_2 ${s(1)} i_3 ${s(-1)} i_4 = 0`;
  const numEq = `${s(1) === '+' ? '' : '-'}${n(i1)} ${s(1)} ${n(i2)} ${s(1)} ${n(i3)} ${s(-1)} ${n(i4)} = 0`;
  const unit = water ? 'L/s' : 'A';
  const letter = water ? 'Q' : 'i';

  const label = (k: number, v: number, x: number, y: number, anchor: 'start' | 'middle' | 'end' = 'start') => (
    <text x={x} y={y} textAnchor={anchor} className={`kcl-lbl ${v < 0 ? 'neg' : k === 3 ? 'out' : 'in'}`}>
      {letter}
      {SUB[k]} = {fmt(v, 1, true)} {unit}
    </text>
  );

  return (
    <>
      <div className="kcl-controls">
        {head}
        <Seg
          label="视图模式"
          value={water ? 'water' : 'circuit'}
          onChange={setView}
          hover="hl_water_junction"
          options={[
            ['circuit', '电路符号'],
            ['water', '水管类比'],
          ]}
        />
        <Seg
          label="符号约定"
          value={conv}
          onChange={setConv}
          options={[
            ['in', '流入为正'],
            ['out', '流出为正'],
          ]}
        />
      </div>
      <div className="kcl-sliders" {...hoverProps('hl_branch_in')}>
        {ins.map((v, k) => (
          <label key={k} className={`kcl-slider ${v < 0 ? 'neg' : ''}`}>
            <span>
              i{SUB[k]} <b>{fmt(v, 1, true)} A</b>
            </span>
            <input type="range" min={-5} max={10} step={0.5} value={v} onChange={(e) => setters[k](Number(e.target.value))} aria-label={`支路 ${k + 1} 电流 i${SUB[k]}`} />
          </label>
        ))}
      </div>
      <svg viewBox="0 0 480 300" className={`kcl-svg ${water ? 'water' : 'circuit'}`} role="img" aria-label={`节点 A：i₁ = ${i1} A，i₂ = ${i2} A，i₃ = ${i3} A，i₄ = ${i4} A`}>
        <rect x="2" y="2" width="476" height="296" rx="14" className="kcl-bg" />
        {/* the balance: Σ i_in | Σ i_out */}
        <g className="kcl-balance">
          <line x1="186" y1="30" x2="294" y2="30" className="beam" />
          <path d="M 240 30 L 230 48 L 250 48 Z" className="fulcrum" />
          <g className={`pan ${L('hl_branch_in') ? 'lit-in' : ''}`} {...hoverProps('hl_branch_in')}>
            <rect x="34" y="12" width="152" height="36" rx="9" />
            <text x="110" y="35" textAnchor="middle">
              Σ <Sym n="i" s="in" /> = {fmt(sumIn, 1)} A
            </text>
          </g>
          <g className={`pan ${L('hl_branch_out') ? 'lit-out' : ''}`} {...hoverProps('hl_branch_out')}>
            <rect x="294" y="12" width="152" height="36" rx="9" />
            <text x="370" y="35" textAnchor="middle">
              Σ <Sym n="i" s="out" /> = {fmt(sumOut, 1)} A
            </text>
          </g>
          <text x="240" y="66" textAnchor="middle" className="kcl-zero">
            Σ <Sym n="i" s="n" /> = {fmt(ins.reduce((a, v) => a + v, 0) - i4, 2)} A
          </text>
        </g>

        {/* in-branches 1–3 */}
        {INS.map((p, k) => {
          const v = ins[k];
          const d = `M ${p.x} ${p.y} L ${A.x} ${A.y}`;
          const lx = k === 1 ? p.x + 4 : p.x + 2;
          const ly = k === 0 ? p.y - 12 : k === 1 ? p.y - 14 : p.y + 24;
          return (
            <g
              key={k}
              className={`kcl-branch in ${L('hl_branch_in') ? 'lit' : ''} ${v < 0 ? 'neg' : ''} ${v < 0 && L('hl_neg_current') ? 'flash' : ''}`}
              {...hoverProps(v < 0 ? 'hl_neg_current' : 'hl_branch_in')}
            >
              <path d={d} className="kcl-pipe" />
              <path d={d} className="kcl-hit" />
              <Flow d={d} i={v} scale={scale} width={width(v)} className={v < 0 ? 'neg' : 'in'} />
              <polygon points={arrowHead(p.x, p.y, A.x, A.y, 0.42, 7)} className="kcl-ref" />
              {v < 0 && <polygon points={arrowHead(A.x, A.y, p.x, p.y, 0.5, 8)} className="kcl-real" transform={`translate(${offs[k][0]} ${offs[k][1]})`} />}
              {label(k, v, lx, ly)}
              {v < 0 && (
                <text x={lx} y={ly + (k === 2 ? 16 : -14)} className="kcl-sub neg">
                  实际流出 {fmt(-v, 1)} {unit}
                </text>
              )}
            </g>
          );
        })}

        {/* out-branch 4 (auto-conserved) */}
        <g
          className={`kcl-branch out ${L('hl_branch_out') ? 'lit' : ''} ${i4 < 0 ? 'neg' : ''} ${i4 < 0 && L('hl_neg_current') ? 'flash' : ''}`}
          {...hoverProps(i4 < 0 ? 'hl_neg_current' : 'hl_branch_out')}
        >
          <path d={`M ${A.x} ${A.y} L ${OUT.x} ${OUT.y}`} className="kcl-pipe" />
          <path d={`M ${A.x} ${A.y} L ${OUT.x} ${OUT.y}`} className="kcl-hit" />
          <Flow d={`M ${A.x} ${A.y} L ${OUT.x} ${OUT.y}`} i={i4} scale={scale} width={width(i4)} className={i4 < 0 ? 'neg' : 'out'} />
          <polygon points={arrowHead(A.x, A.y, OUT.x, OUT.y, 0.62, 7)} className="kcl-ref" />
          {i4 < 0 && <polygon points={arrowHead(OUT.x, OUT.y, A.x, A.y, 0.62, 8)} className="kcl-real" transform="translate(0 12)" />}
          {label(3, i4, 360, 166, 'middle')}
          <text x="360" y="148" textAnchor="middle" className="kcl-sub">
            {i4 < 0 ? `实际流入 ${fmt(-i4, 1)} ${unit}` : '自动守恒（只读）'}
          </text>
          {L('hl_branch_out') && (
            <text x="352" y="238" textAnchor="middle" className="kcl-track">
              i₄ = i₁ + i₂ + i₃ = {fmt(i1, 1)} + {fmt(i2, 1)} + {fmt(i3, 1)} = {fmt(i4, 1)} A
            </text>
          )}
        </g>

        {/* the reference vs real legend for negative currents */}
        <g className={`kcl-legend ${L('hl_neg_current') ? 'lit' : ''}`} {...hoverProps('hl_neg_current')}>
          <polygon points={arrowHead(300, 262, 318, 262, 0.5, 6)} className="kcl-ref" />
          <text x="326" y="266">
            参考方向
          </text>
          <polygon points={arrowHead(384, 262, 402, 262, 0.5, 6)} className="kcl-real" />
          <text x="410" y="266">
            真实流向
          </text>
        </g>

        {/* node A / the water junction */}
        <g className={`kcl-node ${L('hl_node_a') || L('hl_water_junction') ? 'lit' : ''}`} {...hoverProps(water ? 'hl_water_junction' : 'hl_node_a')}>
          <circle cx={A.x} cy={A.y} className="halo" />
          <circle cx={A.x} cy={A.y} className="dot" />
          <text x={A.x} y={A.y + 4} textAnchor="middle" className="kcl-node-in">
            {water ? '无囤积' : ''}
          </text>
          <text x={A.x} y={A.y - (water ? 34 : 16)} textAnchor="middle" className="kcl-node-name">
            {water ? '四通接头' : '节点 A'}
          </text>
          <text x={A.x} y={A.y + (water ? 44 : 26)} textAnchor="middle" className="kcl-sub">
            dq/dt = 0
          </text>
          {L('hl_node_a') && (
            <text x={A.x} y={A.y + (water ? 60 : 42)} textAnchor="middle" className="kcl-chip">
              无电荷囤积
            </text>
          )}
        </g>
      </svg>
      <Readout>
        <div className="kcl-eq-label">{conv === 'in' ? '流入为正、流出为负' : '流出为正、流入为负'}：</div>
        <span className="kcl-sym">
          <Tex tex={symEq} />
        </span>
        <Tex tex={`\\Rightarrow\\ ${numEq}`} />
        <div className="kcl-eq-note">
          {conv === 'out' ? '两边同乘 −1 即回到「流入为正」的方程，' : ''}解得 i₄ = {fmt(i4, 1)} A
        </div>
      </Readout>
    </>
  );
}

/* ------------------------------------------------------------- scene 2: parallel circuit with a CCCS */

interface Preset {
  Is: number;
  R1: number;
  R2: number;
  k: number;
  ctrl: string; // name of the controlling current (the R₁ branch)
  ctrlTex: string;
  dir: 'up' | 'down';
}
const PRESETS: Record<'ex5' | 'ex6', Preset> = {
  ex5: { Is: 15, R1: 6, R2: 3, k: 2, ctrl: '1', ctrlTex: 'i_1', dir: 'down' },
  ex6: { Is: 6, R1: 2, R2: 4, k: 0.5, ctrl: 'o', ctrlTex: 'i_o', dir: 'up' },
};

const X = { src: 70, r1: 180, r2: 290, dep: 400 };
const TOP = 62;
const BOT = 232;

function CccsScene({ head }: { head: ReactNode }) {
  const [which, setWhich] = useStageParam<'ex5' | 'ex6'>('cccs', 'ex5');
  const p = PRESETS[which];
  const [Is, setIs] = useStageParam('Is', p.Is);
  const [dir, setDir] = useStageParam<'up' | 'down'>('depDir', p.dir);
  const [reveal, setReveal] = useStageParam('reveal', true);
  const lit = useLit();
  const L = (id: string) => lit.includes(id);
  // KCL at a (down = leaving a): Is = v/R1 + v/R2 ± k·v/R1
  const sgn = dir === 'down' ? 1 : -1;
  const G = 1 / p.R1 + 1 / p.R2 + (sgn * p.k) / p.R1;
  const v = Is / G;
  const ic = v / p.R1;
  const i2 = v / p.R2;
  const dep = p.k * ic; // magnitude along the diamond's arrow
  const dDown = sgn * dep; // current down through the diamond branch
  const scale = flowScale(Math.max(Is, Math.abs(ic), Math.abs(i2), dep, Math.abs(Is - ic)), 90, 9);
  const q = (x: number, u: string) => (reveal ? `${fmt(x, 1)} ${u}` : '?');
  const kTxt = `${p.k}`;
  const inflow = Is + (dir === 'up' ? dep : 0);
  const outflow = ic + i2 + (dir === 'down' ? dep : 0);
  const eqSym = dir === 'down' ? `I_s = ${p.ctrlTex} + i_2 + ${kTxt}${p.ctrlTex}` : `I_s + ${kTxt}${p.ctrlTex} = ${p.ctrlTex} + i_2`;
  const eqNum = dir === 'down' ? `${Is} = ${fmt(ic, 1)} + ${fmt(i2, 1)} + ${fmt(dep, 1)}` : `${Is} + ${fmt(dep, 1)} = ${fmt(ic, 1)} + ${fmt(i2, 1)}`;

  const pick = (w: 'ex5' | 'ex6') => {
    useStage.getState().setParams({ cccs: w, Is: PRESETS[w].Is, depDir: PRESETS[w].dir, reveal: w === 'ex5' });
    setWhich(w);
  };
  const zig = (x: number) => `M ${x} ${TOP} L ${x} 112 L ${x - 9} 118 L ${x + 9} 130 L ${x - 9} 142 L ${x + 9} 154 L ${x - 9} 166 L ${x + 9} 178 L ${x} 184 L ${x} ${BOT}`;

  return (
    <>
      <div className="kcl-controls">
        {head}
        <Seg
          label="例题"
          value={which}
          onChange={pick}
          options={[
            ['ex5', '第 5 幕'],
            ['ex6', '第 6 幕'],
          ]}
        />
        <Seg
          label="受控源箭头方向"
          value={dir}
          onChange={setDir}
          hover="hl_cccs_branch"
          options={[
            ['up', '菱形 ↑ 流入'],
            ['down', '菱形 ↓ 流出'],
          ]}
        />
      </div>
      <div className="kcl-sliders one">
        <label className="kcl-slider">
          <span>
            独立源 I<sub>s</sub> <b>{Is} A</b>
          </span>
          <input type="range" min={1} max={20} step={1} value={Is} onChange={(e) => setIs(Number(e.target.value))} aria-label="独立电流源 I_s" />
        </label>
        <button className={`button kcl-reveal ${reveal ? '' : 'primary'}`} onClick={() => setReveal(!reveal)}>
          {reveal ? '隐藏数值（自己先算）' : '揭晓数值'}
        </button>
      </div>
      <svg
        viewBox="0 0 480 290"
        className="kcl-svg circuit"
        role="img"
        aria-label={`并联电路：I_s = ${Is} A，R₁ = ${p.R1} Ω，R₂ = ${p.R2} Ω，受控源 ${p.k}i 箭头${dir === 'up' ? '向上流入' : '向下流出'}节点 a`}
      >
        <rect x="2" y="2" width="476" height="286" rx="14" className="kcl-bg" />
        {/* wires */}
        <path d={`M ${X.src} ${TOP} L ${X.dep} ${TOP} M ${X.src} ${BOT} L ${X.dep} ${BOT}`} className="kcl-wire" />
        <path d={`M ${X.src} ${TOP} L ${X.src} ${BOT} M ${X.r2} ${TOP} L ${X.r2} ${BOT} M ${X.dep} ${TOP} L ${X.dep} ${BOT}`} className="kcl-wire" />
        {/* currents: up through the source, down through R₁, R₂ and the diamond; along the rails */}
        <Flow d={`M ${X.src} ${BOT} L ${X.src} ${TOP}`} i={Is} scale={scale} className="src" />
        <Flow d={`M ${X.r1} ${TOP} L ${X.r1} ${BOT}`} i={ic} scale={scale} className="out" />
        <Flow d={`M ${X.r2} ${TOP} L ${X.r2} ${BOT}`} i={i2} scale={scale} className="out" />
        <Flow d={`M ${X.dep} ${TOP} L ${X.dep} ${BOT}`} i={dDown} scale={scale} className="dep" />
        <Flow d={`M ${X.src} ${TOP} L ${X.r1} ${TOP}`} i={Is} scale={scale} className="src" />
        <Flow d={`M ${X.r1} ${TOP} L ${X.r2} ${TOP}`} i={Is - ic} scale={scale} className="src" />
        <Flow d={`M ${X.r2} ${TOP} L ${X.dep} ${TOP}`} i={dDown} scale={scale} className="src" />
        <Flow d={`M ${X.dep} ${BOT} L ${X.r2} ${BOT}`} i={dDown} scale={scale} className="src" />
        <Flow d={`M ${X.r2} ${BOT} L ${X.r1} ${BOT}`} i={dDown + i2} scale={scale} className="src" />
        <Flow d={`M ${X.r1} ${BOT} L ${X.src} ${BOT}`} i={Is} scale={scale} className="src" />

        {/* independent source */}
        <g {...hoverProps('kcl_is')} className={`kcl-part ${L('kcl_is') ? 'lit' : ''}`}>
          <circle cx={X.src} cy="147" r="22" className="kcl-src" />
          <path d={`M ${X.src} 160 L ${X.src} 136`} className="kcl-src-arrow" />
          <polygon points={arrowHead(X.src, 150, X.src, 132, 0.6, 6)} className="kcl-src-head" />
          <text x={X.src + 28} y="151" className="kcl-lbl src">
            <Sym n="I" s="s" /> = {Is} A
          </text>
        </g>
        {/* R1 with the controlling current */}
        <g {...hoverProps('kcl_r1')} className={`kcl-part ${L('kcl_r1') ? 'lit' : ''}`}>
          <path d={zig(X.r1)} className="kcl-res" />
          <text x={X.r1 + 14} y="152" className="kcl-lbl res">
            {p.R1} Ω
          </text>
          <polygon points={arrowHead(X.r1 - 16, 78, X.r1 - 16, 100, 0.7, 6)} className="kcl-ctrl-head" />
          <path d={`M ${X.r1 - 16} 76 L ${X.r1 - 16} 98`} className="kcl-ctrl-arrow" />
          <text x={X.r1 - 22} y="94" textAnchor="end" className="kcl-lbl out">
            <Sym n="i" s={p.ctrl} /> = {q(ic, 'A')}
          </text>
        </g>
        {/* R2 */}
        <g {...hoverProps('kcl_r2')} className={`kcl-part ${L('kcl_r2') ? 'lit' : ''}`}>
          <path d={zig(X.r2)} className="kcl-res" />
          <text x={X.r2 + 14} y="152" className="kcl-lbl res">
            {p.R2} Ω
          </text>
          <path d={`M ${X.r2 - 16} 76 L ${X.r2 - 16} 98`} className="kcl-ctrl-arrow" />
          <polygon points={arrowHead(X.r2 - 16, 78, X.r2 - 16, 100, 0.7, 6)} className="kcl-ctrl-head" />
          <text x={X.r2 - 22} y="94" textAnchor="end" className="kcl-lbl out">
            <Sym n="i" s="2" /> = {q(i2, 'A')}
          </text>
        </g>
        {/* dependent source (diamond) and its control link */}
        <g {...hoverProps('hl_cccs_branch')} className={`kcl-part kcl-cccs ${L('hl_cccs_branch') ? 'lit' : ''}`}>
          <path d={`M ${X.r1 + 10} 186 Q ${X.r2 + 10} 236 ${X.dep - 22} 154`} className="kcl-link" />
          <polygon points={`${X.dep},122 ${X.dep + 24},147 ${X.dep},172 ${X.dep - 24},147`} className="kcl-diamond" />
          {dir === 'up' ? (
            <>
              <path d={`M ${X.dep} 160 L ${X.dep} 138`} className="kcl-dep-arrow" />
              <polygon points={arrowHead(X.dep, 152, X.dep, 134, 0.6, 6)} className="kcl-dep-head" />
            </>
          ) : (
            <>
              <path d={`M ${X.dep} 134 L ${X.dep} 156`} className="kcl-dep-arrow" />
              <polygon points={arrowHead(X.dep, 142, X.dep, 160, 0.6, 6)} className="kcl-dep-head" />
            </>
          )}
          <text x={X.dep} y="196" textAnchor="middle" className="kcl-lbl dep">
            {kTxt}
            <Sym n="i" s={p.ctrl} /> {dir === 'up' ? '↑' : '↓'} = {q(dep, 'A')}
          </text>
        </g>
        {/* node a */}
        <g {...hoverProps('hl_node_a')} className={`kcl-node small ${L('hl_node_a') ? 'lit' : ''}`}>
          <circle cx={(X.r1 + X.r2) / 2} cy={TOP} className="halo" />
          <circle cx={(X.r1 + X.r2) / 2} cy={TOP} className="dot" />
          <text x={(X.r1 + X.r2) / 2} y={TOP - 14} textAnchor="middle" className="kcl-node-name">
            节点 a · <Sym n="v" s="o" /> = {q(v, 'V')}
          </text>
        </g>
        {/* ground */}
        <path
          d={`M 235 ${BOT} L 235 ${BOT + 14} M 223 ${BOT + 14} L 247 ${BOT + 14} M 227 ${BOT + 19} L 243 ${BOT + 19} M 231 ${BOT + 24} L 239 ${BOT + 24}`}
          className="kcl-ground"
        />
        <text x="252" y={BOT + 22} className="kcl-sub">
          参考地
        </text>
      </svg>
      <Readout tone={reveal ? 'ok' : ''}>
        <div className="kcl-eq-label">节点 a 的 KCL（流入 = 流出）：</div>
        {reveal ? (
          <>
            <span className="kcl-sym">
              <Tex tex={eqSym} />
            </span>
            <Tex tex={`\\Rightarrow\\ ${eqNum}`} />
            <div className="kcl-eq-note">
              流入 {fmt(inflow, 1)} A = 流出 {fmt(outflow, 1)} A
            </div>
          </>
        ) : (
          <div className="kcl-eq-label keep">方程与数值已隐藏：先在右侧一步步算出来，再点「揭晓数值」核对。</div>
        )}
      </Readout>
    </>
  );
}
