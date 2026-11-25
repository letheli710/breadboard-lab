// Layer "02 封闭曲面/超级节点 KCL 演示台". Two tabs:
// - 封闭曲面: a 5-resistor bridge (nodes a, b, c, d) fed by four pins i_A, i_B (in) and i_C, i_D
//   (out). Its node voltages are solved from KCL at every node, so the internal currents (and
//   the dots) redistribute when a resistor is dragged while the four pin currents — and the
//   closed-surface KCL i_A + i_B − i_C − i_D = 0 — never change. The dashed surface S dims the
//   inside and marks each internal branch with its −i / +i pair. The op-amp preset swaps in an
//   LM741 as a black box: i_o = i_1 + i_2 + i_+ + i_− (Sadiku Eq. 5.1), the output current comes
//   from the supply pins.
// - 电流源实验: three parallel sources merging into I_T (click a source to flip it), and two
//   different ideal sources in series: switching on trips the KCL alarm at the middle node m.

import { useEffect, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { Tex } from '../../StageText';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { Flow, flowScale } from './flow';
import { arrowHead, fmt, hoverProps, Readout, Seg, Sym } from './svgBits';
import './kcl.css';

type Tab = 'surface' | 'sources';

export function SurfaceLayer() {
  const [tab, setTab] = useStageParam<Tab>('l2Tab', 'surface');
  const hover = useStage((s) => s.hover);
  const setHover = useStage((s) => s.setHover);
  useEffect(() => () => setHover(null), [setHover]);
  // hovering a term of the other tab previews it
  const shown: Tab = hover?.some((h) => h === 'hl_parallel_merge' || h === 'hl_series_conflict')
    ? 'sources'
    : hover?.some((h) => h === 'hl_closed_surface' || h === 'hl_internal_cancel' || h === 'hl_opamp_ic')
      ? 'surface'
      : tab;
  const head = (
    <Seg
      label="演示台"
      value={shown}
      onChange={setTab}
      options={[
        ['surface', '封闭曲面'],
        ['sources', '电流源实验'],
      ]}
    />
  );
  return <div className="kcl-layer">{shown === 'surface' ? <SurfaceTab head={head} /> : <SourcesTab head={head} />}</div>;
}

/* ------------------------------------------------------------- closed surface: bridge / op amp */

const N = { a: [108, 150], b: [240, 68], c: [240, 232], d: [372, 150] } as const;
type NodeName = keyof typeof N;
const EDGES: [NodeName, NodeName][] = [
  ['a', 'b'],
  ['a', 'c'],
  ['b', 'd'],
  ['c', 'd'],
  ['b', 'c'],
];
const R_DEFAULT = [2, 4, 3, 1, 5];
/** pin currents of the bridge (act 3): i_A, i_B in, i_C, i_D out */
const PIN = { A: 5, B: 3, C: 2, D: 6 };

/** Node voltages of the bridge (d grounded) from KCL at a, b, c. */
function solveBridge(R: number[]): Record<NodeName, number> {
  const idx: Record<string, number> = { a: 0, b: 1, c: 2 };
  const G = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  EDGES.forEach(([p, q], k) => {
    const g = 1 / R[k];
    const ip = idx[p];
    const iq = idx[q];
    if (ip !== undefined) G[ip][ip] += g;
    if (iq !== undefined) G[iq][iq] += g;
    if (ip !== undefined && iq !== undefined) {
      G[ip][iq] -= g;
      G[iq][ip] -= g;
    }
  });
  const J = [PIN.A, PIN.B, -PIN.C];
  // Gaussian elimination (3 × 3, G is symmetric positive definite)
  for (let i = 0; i < 3; i++) {
    for (let r = i + 1; r < 3; r++) {
      const f = G[r][i] / G[i][i];
      for (let c = i; c < 3; c++) G[r][c] -= f * G[i][c];
      J[r] -= f * J[i];
    }
  }
  const v = [0, 0, 0];
  for (let i = 2; i >= 0; i--) {
    let s = J[i];
    for (let c = i + 1; c < 3; c++) s -= G[i][c] * v[c];
    v[i] = s / G[i][i];
  }
  return { a: v[0], b: v[1], c: v[2], d: 0 };
}

const SURF = { x: 70, y: 36, w: 340, h: 228 };

function SurfaceTab({ head }: { head: ReactNode }) {
  const [on, setOn] = useStageParam('surface', false);
  const [preset, setPreset] = useStageParam<'bridge' | 'opamp'>('preset', 'bridge');
  const [R, setR] = useStageParam<number[]>('R', R_DEFAULT);
  const [sel, setSel] = useState(4);
  const [io, setIo] = useStageParam('io', 6);
  const hover = useStage((s) => s.hover);
  const lit = useLit();
  const L = (id: string) => lit.includes(id);
  const shownPreset = hover?.includes('hl_opamp_ic') ? 'opamp' : preset;
  const surfaceLit = L('hl_closed_surface');
  const cancelLit = L('hl_internal_cancel');

  return (
    <>
      <div className="kcl-controls">
        {head}
        <button className={`button kcl-toggle ${on ? 'primary' : ''}`} onClick={() => setOn(!on)} aria-pressed={on} {...hoverProps('hl_closed_surface')}>
          {on ? '收起边界 𝒮' : '一键切出封闭虚线边界'}
        </button>
        <Seg
          label="内部子电路"
          value={shownPreset}
          onChange={setPreset}
          options={[
            ['bridge', '5 电阻桥'],
            ['opamp', 'LM741 运放'],
          ]}
        />
      </div>
      {shownPreset === 'bridge' ? (
        <Bridge R={R} setR={setR} sel={sel} setSel={setSel} on={on} surfaceLit={surfaceLit} cancelLit={cancelLit} />
      ) : (
        <OpAmp io={io} setIo={setIo} on={on} surfaceLit={surfaceLit} icLit={L('hl_opamp_ic')} />
      )}
    </>
  );
}

function Surface({ on, lit }: { on: boolean; lit: boolean }) {
  if (!on && !lit) return null;
  return (
    <g className={`kcl-surface ${on ? 'on' : 'preview'} ${lit ? 'lit' : ''}`} {...hoverProps('hl_closed_surface')}>
      <rect x={SURF.x} y={SURF.y} width={SURF.w} height={SURF.h} rx="38" />
      <text x={SURF.x + SURF.w - 16} y={SURF.y + 20} textAnchor="end">
        封闭曲面 𝒮
      </text>
    </g>
  );
}

function Bridge({
  R,
  setR,
  sel,
  setSel,
  on,
  surfaceLit,
  cancelLit,
}: {
  R: number[];
  setR: (r: number[]) => void;
  sel: number;
  setSel: (k: number) => void;
  on: boolean;
  surfaceLit: boolean;
  cancelLit: boolean;
}) {
  const v = solveBridge(R);
  const cur = EDGES.map(([p, q], k) => (v[p] - v[q]) / R[k]);
  const scale = flowScale(Math.max(...cur.map(Math.abs), PIN.D), 80, 10);
  const marks = on || cancelLit;
  // pins: i_A into a (from the left), i_B into b (from the top), i_C out of c (down), i_D out of d (right)
  const pins = [
    { id: 'A', d: `M 12 150 L ${N.a[0]} 150`, i: PIN.A, lx: 12, ly: 140, dir: 'in' },
    { id: 'B', d: `M 240 6 L 240 ${N.b[1]}`, i: PIN.B, lx: 248, ly: 24, dir: 'in' },
    { id: 'C', d: `M 240 ${N.c[1]} L 240 286`, i: PIN.C, lx: 248, ly: 282, dir: 'out' },
    { id: 'D', d: `M ${N.d[0]} 150 L 468 150`, i: PIN.D, lx: 468, ly: 140, dir: 'out' },
  ];
  return (
    <>
      <div className="kcl-sliders one">
        <div className="kcl-rchips" role="radiogroup" aria-label="选择内部电阻">
          {R.map((r, k) => (
            <button key={k} role="radio" aria-checked={sel === k} className={sel === k ? 'on' : ''} onClick={() => setSel(k)}>
              R{'₁₂₃₄₅'[k]} {r} Ω
            </button>
          ))}
        </div>
        <label className="kcl-slider">
          <span>
            拖动 R{'₁₂₃₄₅'[sel]} <b>{R[sel]} Ω</b>
          </span>
          <input
            type="range"
            min={0.5}
            max={20}
            step={0.5}
            value={R[sel]}
            onChange={(e) => setR(R.map((r, k) => (k === sel ? Number(e.target.value) : r)))}
            aria-label={`内部电阻 R${sel + 1}`}
          />
        </label>
      </div>
      <svg viewBox="0 0 480 290" className={`kcl-svg circuit ${on ? 'surface-on' : ''}`} role="img" aria-label="桥式子电路与封闭曲面">
        <rect x="2" y="2" width="476" height="286" rx="14" className="kcl-bg" />
        <Surface on={on} lit={surfaceLit} />
        {/* internal branches */}
        <g className="kcl-inside">
          {EDGES.map(([p, q], k) => {
            const [x1, y1] = N[p];
            const [x2, y2] = N[q];
            const d = `M ${x1} ${y1} L ${x2} ${y2}`;
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
            const i = cur[k];
            // −i at the end it leaves, +i at the end it enters (by the real direction)
            const [from, to] = i >= 0 ? [N[p], N[q]] : [N[q], N[p]];
            const at = (t: number) => [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
            // labels sit outside the bridge, the −i / +i pair inside (R₅: labels right, pair left)
            const len = Math.hypot(x2 - x1, y2 - y1);
            let [nx, ny] = [-(y2 - y1) / len, (x2 - x1) / len];
            if (k === 4) [nx, ny] = [1, 0];
            else if (nx * (mx - 240) + ny * (my - 150) < 0) [nx, ny] = [-nx, -ny];
            const [ax, ay] = at(0.27);
            const [bx, by] = at(0.73);
            const [mxA, myA] = [ax - nx * 14, ay - ny * 14 + 4];
            const [mxB, myB] = [bx - nx * 14, by - ny * 14 + 4];
            const lx = mx + nx * (k === 4 ? 14 : 24);
            const ly = my + ny * 24 + (k === 4 ? -2 : 0);
            const lab = `R${'₁₂₃₄₅'[k]}`;
            return (
              <g key={k} className={`kcl-rbranch ${sel === k ? 'sel' : ''}`} onClick={() => setSel(k)}>
                <path d={d} className="kcl-wire" />
                <Flow d={d} i={i} scale={scale} className="int" />
                <g transform={`translate(${mx} ${my}) rotate(${ang})`}>
                  <rect x="-15" y="-6" width="30" height="12" rx="3" className="kcl-rbox" />
                </g>
                <text x={lx} y={ly} textAnchor={k === 4 ? 'start' : 'middle'} className="kcl-rlab">
                  {lab} {R[k]} Ω
                  <tspan x={lx} dy="13" className="kcl-rcur">
                    {fmt(Math.abs(i), 2)} A
                  </tspan>
                </text>
                {marks && (
                  <g className={`kcl-cancel ${cancelLit ? 'strike' : ''}`} {...hoverProps('hl_internal_cancel')}>
                    <text x={mxA} y={myA} textAnchor="middle" className="minus">
                      −i{'₁₂₃₄₅'[k]}
                    </text>
                    <text x={mxB} y={myB} textAnchor="middle" className="plus">
                      +i{'₁₂₃₄₅'[k]}
                    </text>
                    {cancelLit && (
                      <>
                        <line x1={mxA - 10} y1={myA - 4} x2={mxA + 10} y2={myA - 4} className="kcl-strike" />
                        <line x1={mxB - 10} y1={myB - 4} x2={mxB + 10} y2={myB - 4} className="kcl-strike" />
                      </>
                    )}
                  </g>
                )}
              </g>
            );
          })}
          {(Object.keys(N) as NodeName[]).map((k) => (
            <g key={k}>
              <circle cx={N[k][0]} cy={N[k][1]} r="5" className="kcl-ndot" />
              <text x={N[k][0] + (k === 'a' ? -10 : k === 'd' ? 10 : 9)} y={N[k][1] + (k === 'b' ? -8 : 18)} textAnchor={k === 'a' ? 'end' : 'start'} className="kcl-nname">
                {k}
              </text>
            </g>
          ))}
        </g>
        {/* pins crossing the surface */}
        {pins.map((p) => (
          <g key={p.id} className={`kcl-pin ${p.dir} ${on || surfaceLit ? 'lit' : ''}`} {...hoverProps('hl_closed_surface')}>
            <path d={p.d} className="kcl-wire" />
            <Flow d={p.d} i={p.i} scale={scale} className={p.dir} />
            <text x={p.lx} y={p.ly} textAnchor={p.id === 'D' ? 'end' : 'start'} className={`kcl-lbl ${p.dir}`}>
              <Sym n="i" s={p.id} /> = {p.i} A {p.dir === 'in' ? '流入' : '流出'}
            </text>
          </g>
        ))}
      </svg>
      <Readout tone={on ? 'ok' : ''}>
        {on ? (
          <>
            <div className="kcl-eq-label">封闭曲面 𝒮 的 KCL（内部支路两两抵消）：</div>
            <Tex tex={String.raw`i_A + i_B - i_C - i_D = 0 \;\Rightarrow\; 5 + 3 - 2 - 6 = 0`} />
          </>
        ) : (
          <div className="kcl-eq-label keep">拖动任意内部电阻：内部电流重新分配，四根引脚的电流却纹丝不动。点「一键切出封闭虚线边界」看为什么。</div>
        )}
        <div className="kcl-eq-note">
          内部 R₅ 支路电流 <Tex tex={`i_{\\text{int}} = ${fmt(Math.abs(cur[4]), 2)}\\ \\text{A}`} />
        </div>
      </Readout>
    </>
  );
}

const I_Q = 1.7; // LM741 quiescent supply current, mA

function OpAmp({ io, setIo, on, surfaceLit, icLit }: { io: number; setIo: (v: number) => void; on: boolean; surfaceLit: boolean; icLit: boolean }) {
  // supply pins (currents defined as entering the IC): sourcing comes from V+, sinking goes to V−
  const ip = I_Q + Math.max(io, 0);
  const im = -I_Q + Math.min(io, 0);
  const scale = flowScale(Math.max(Math.abs(ip), Math.abs(im), Math.abs(io)), 70, 10);
  const tri = '190,95 190,205 300,150';
  return (
    <>
      <div className="kcl-sliders one">
        <label className="kcl-slider">
          <span>
            负载电流 i<sub>o</sub> <b>{fmt(io, 1, true)} mA</b>
          </span>
          <input type="range" min={-5} max={10} step={0.5} value={io} onChange={(e) => setIo(Number(e.target.value))} aria-label="运放输出电流 i_o" />
        </label>
      </div>
      <svg viewBox="0 0 480 290" className={`kcl-svg circuit ${on ? 'surface-on' : ''}`} role="img" aria-label="LM741 运放封装与封闭曲面 KCL">
        <rect x="2" y="2" width="476" height="286" rx="14" className="kcl-bg" />
        <Surface on={on} lit={surfaceLit} />
        {/* pins */}
        <path d="M 30 125 L 190 125 M 30 175 L 190 175 M 300 150 L 450 150 M 245 16 L 245 122 M 245 284 L 245 178" className="kcl-wire" />
        <Flow d="M 30 125 L 190 125" i={0} scale={scale} className="in" />
        <Flow d="M 30 175 L 190 175" i={0} scale={scale} className="in" />
        <Flow d="M 300 150 L 450 150" i={io} scale={scale} className={io < 0 ? 'neg' : 'out'} />
        <g className={`kcl-rail ${icLit ? 'flash' : ''}`}>
          <Flow d="M 245 16 L 245 122" i={ip} scale={scale} className="src" />
          <Flow d="M 245 284 L 245 178" i={im} scale={scale} className="src" />
        </g>
        {/* the package */}
        <g className={`kcl-ic ${icLit ? 'lit' : ''}`} {...hoverProps('hl_opamp_ic')}>
          <polygon points={tri} />
          <text x="200" y="129" className="kcl-pinsign">
            −
          </text>
          <text x="200" y="180" className="kcl-pinsign">
            +
          </text>
          <text x="232" y="154" textAnchor="middle" className="kcl-icname">
            LM741
          </text>
        </g>
        <text x="36" y="117" className="kcl-lbl in">
          <Sym n="i" s="1" /> ≈ 0（反相输入）
        </text>
        <text x="36" y="197" className="kcl-lbl in">
          <Sym n="i" s="2" /> ≈ 0（同相输入）
        </text>
        <text x="446" y="140" textAnchor="end" className={`kcl-lbl ${io < 0 ? 'neg' : 'out'}`}>
          <Sym n="i" s="o" /> = {fmt(io, 1)} mA
        </text>
        <g className={`kcl-railtxt ${icLit ? 'flash' : ''}`}>
          <text x="254" y="30" className="kcl-lbl src">
            <Sym n="V" s="+" /> 电源脚 <Sym n="i" s="+" /> = {fmt(ip, 1)} mA
          </text>
          <text x="254" y="278" className="kcl-lbl src">
            <Sym n="V" s="−" /> 电源脚 <Sym n="i" s="−" /> = {fmt(im, 1)} mA
          </text>
        </g>
      </svg>
      <Readout tone={on ? 'ok' : ''}>
        <div className="kcl-eq-label">整片芯片当封闭曲面（Sadiku Eq. 5.1，电流均以流入为参考，i_o 以流出为参考）：</div>
        <Tex tex={`i_o = i_1 + i_2 + i_+ + i_- \\;\\Rightarrow\\; ${fmt(io, 1)} = 0 + 0 + ${fmt(ip, 1)} + (${fmt(im, 1)})`} />
        <div className="kcl-eq-note">输入脚几乎不吸电流：输出电流全部来自正负电源脚</div>
      </Readout>
    </>
  );
}

/* ------------------------------------------------------------- current sources: parallel / series */

function SourcesTab({ head }: { head: ReactNode }) {
  const [mode, setMode] = useStageParam<'parallel' | 'series'>('src', 'parallel');
  const hover = useStage((s) => s.hover);
  const shown = hover?.includes('hl_series_conflict') ? 'series' : hover?.includes('hl_parallel_merge') ? 'parallel' : mode;
  return (
    <>
      <div className="kcl-controls">
        {head}
        <Seg
          label="电流源实验"
          value={shown}
          onChange={setMode}
          options={[
            ['parallel', '并联合并'],
            ['series', '串联禁区'],
          ]}
        />
      </div>
      {shown === 'parallel' ? <Parallel /> : <Series />}
    </>
  );
}

const PX = [60, 125, 190];
const PMAG = [5, 2, 4];
const PEQ = 300;
const PLOAD = 420;
const PT = 66;
const PB = 228;

function SourceSymbol({ x, y, up, cls }: { x: number; y: number; up: boolean; cls: string }) {
  return (
    <g className={`kcl-isrc ${cls}`}>
      <circle cx={x} cy={y} r="19" />
      <path d={up ? `M ${x} ${y + 11} L ${x} ${y - 6}` : `M ${x} ${y - 11} L ${x} ${y + 6}`} />
      <polygon points={up ? arrowHead(x, y + 2, x, y - 10, 0.5, 6) : arrowHead(x, y - 2, x, y + 10, 0.5, 6)} />
    </g>
  );
}

function Parallel() {
  const [dirs, setDirs] = useStageParam<number[]>('dirs', [1, -1, 1]);
  const [merged, setMerged] = useStageParam('merged', false);
  const lit = useLit();
  const L = (id: string) => lit.includes(id);
  const s = PMAG.map((m, k) => m * dirs[k]);
  const IT = s[0] + s[1] + s[2];
  const scale = flowScale(Math.max(...PMAG, Math.abs(IT), Math.abs(s[0] + s[1])), 80, 10);
  const term = (k: number) => `${dirs[k] > 0 ? (k ? '+' : '') : '-'} I_${k + 1}`;
  const num = (k: number) => `${dirs[k] > 0 ? (k ? '+' : '') : '-'} ${PMAG[k]}`;
  const zig = `M ${PLOAD} ${PT} L ${PLOAD} 118 L ${PLOAD - 9} 124 L ${PLOAD + 9} 136 L ${PLOAD - 9} 148 L ${PLOAD + 9} 160 L ${PLOAD - 9} 172 L ${PLOAD} 178 L ${PLOAD} ${PB}`;
  const projecting = L('hl_parallel_merge') && !merged;
  return (
    <>
      <div className="kcl-controls">
        <button className={`button kcl-toggle ${merged ? '' : 'primary'}`} onClick={() => setMerged(!merged)} {...hoverProps('hl_parallel_merge')}>
          {merged ? '拆回三个源' : '一键合并'}
        </button>
        <span className="kcl-hint">{merged ? '外部负载看到的电流完全没变' : '点电流源可翻转它的箭头'}</span>
      </div>
      <svg viewBox="0 0 480 290" className="kcl-svg circuit" role="img" aria-label={`三个并联电流源，等效 I_T = ${IT} A`}>
        <rect x="2" y="2" width="476" height="286" rx="14" className="kcl-bg" />
        {/* rails and load */}
        <path d={`M ${merged ? PEQ : PX[0]} ${PT} L ${PLOAD} ${PT} M ${merged ? PEQ : PX[0]} ${PB} L ${PLOAD} ${PB}`} className="kcl-wire" />
        <path d={zig} className="kcl-res" />
        <text x={PLOAD + 14} y="152" className="kcl-lbl res">
          负载
        </text>
        <circle cx={PLOAD} cy={PT} r="4" className="kcl-ndot" />
        <circle cx={PLOAD} cy={PB} r="4" className="kcl-ndot" />
        <text x={PLOAD + 10} y={PT - 6} className="kcl-nname">
          a
        </text>
        <text x={PLOAD + 10} y={PB + 16} className="kcl-nname">
          b
        </text>
        {/* flows (KCL at every junction) */}
        {merged ? (
          <>
            <Flow d={`M ${PEQ} ${PB} L ${PEQ} ${PT}`} i={IT} scale={scale} className="src" />
            <Flow d={`M ${PEQ} ${PT} L ${PLOAD} ${PT}`} i={IT} scale={scale} className="src" />
          </>
        ) : (
          <>
            {PX.map((x, k) => (
              <Flow key={k} d={`M ${x} ${PB} L ${x} ${PT}`} i={s[k]} scale={scale} className="src" />
            ))}
            <Flow d={`M ${PX[0]} ${PT} L ${PX[1]} ${PT}`} i={s[0]} scale={scale} className="src" />
            <Flow d={`M ${PX[1]} ${PT} L ${PX[2]} ${PT}`} i={s[0] + s[1]} scale={scale} className="src" />
            <Flow d={`M ${PX[2]} ${PT} L ${PLOAD} ${PT}`} i={IT} scale={scale} className="src" />
            <Flow d={`M ${PX[1]} ${PB} L ${PX[0]} ${PB}`} i={s[0]} scale={scale} className="src" />
            <Flow d={`M ${PX[2]} ${PB} L ${PX[1]} ${PB}`} i={s[0] + s[1]} scale={scale} className="src" />
          </>
        )}
        <Flow d={`M ${PLOAD} ${PT} L ${PLOAD} ${PB}`} i={IT} scale={scale} className="out" />
        <Flow d={`M ${PLOAD} ${PB} L ${merged ? PEQ : PX[2]} ${PB}`} i={IT} scale={scale} className="src" />
        {/* the three sources (slide into the equivalent one when merged) */}
        {PX.map((x, k) => (
          <g
            key={k}
            className={`kcl-psrc ${merged ? 'gone' : ''}`}
            style={{ transform: merged ? `translateX(${PEQ - x}px)` : undefined }}
            onClick={() => !merged && setDirs(dirs.map((d, j) => (j === k ? -d : d)))}
            role="button"
            aria-label={`翻转 I${k + 1} 的方向`}
          >
            <path d={`M ${x} ${PT} L ${x} 128 M ${x} 166 L ${x} ${PB}`} className="kcl-wire" />
            <SourceSymbol x={x} y={147} up={dirs[k] > 0} cls={dirs[k] > 0 ? 'up' : 'down'} />
            <text x={x} y={PB + 30} textAnchor="middle" className={`kcl-lbl ${dirs[k] > 0 ? 'src' : 'out'}`}>
              <Sym n="I" s={`${k + 1}`} />={PMAG[k]}A{dirs[k] > 0 ? '↑' : '↓'}
            </text>
          </g>
        ))}
        {/* projection to the equivalent source */}
        {projecting && PX.map((x) => <path key={x} d={`M ${x + 20} 147 Q ${(x + PEQ) / 2} ${100} ${PEQ - 24} 147`} className="kcl-project" markerEnd="url(#kcl5-proj)" />)}
        <defs>
          <marker id="kcl5-proj" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f766e" />
          </marker>
        </defs>
        {/* equivalent source I_T */}
        <g className={`kcl-eqsrc ${merged ? 'on' : projecting ? 'ghost' : 'off'}`} {...hoverProps('hl_parallel_merge')}>
          {merged && <path d={`M ${PEQ} ${PT} L ${PEQ} 128 M ${PEQ} 166 L ${PEQ} ${PB}`} className="kcl-wire" />}
          <SourceSymbol x={PEQ} y={147} up={IT >= 0} cls="eq" />
          <text x={PEQ} y={PB + 30} textAnchor="middle" className="kcl-lbl eq">
            <Sym n="I" s="T" /> = {Math.abs(IT)} A {IT >= 0 ? '↑' : '↓'}
          </text>
        </g>
      </svg>
      <Readout tone={merged ? 'ok' : ''}>
        <div className="kcl-eq-label">对节点 a 列一次 KCL，并联源合并为代数和：</div>
        <Tex tex={`I_T = ${term(0)} ${term(1)} ${term(2)} = ${num(0)} ${num(1)} ${num(2)} = ${IT}\\ \\text{A}`} />
      </Readout>
    </>
  );
}

function Series() {
  const [tested, setTested] = useStageParam('tested', false);
  const [ib, setIb] = useStageParam('ib', 5);
  const lit = useLit();
  const conflict = ib !== 2;
  const alarm = tested && conflict;
  const flowing = tested && !conflict;
  const flagLit = lit.includes('hl_series_conflict');
  const [vm, setVm] = useState(0);
  useEffect(() => {
    if (!alarm) return;
    if (prefersReducedMotion()) {
      const t = setTimeout(() => setVm(Infinity), 0);
      return () => clearTimeout(t);
    }
    let v = 1;
    setVm(v);
    const t = setInterval(() => {
      v *= 1.9;
      setVm(v > 5e6 ? Infinity : v);
      if (v > 5e6) clearInterval(t);
    }, 90);
    return () => clearInterval(t);
  }, [alarm]);
  const scale = flowScale(2, 60, 12);
  const loop = 'M 90 230 L 90 60 L 400 60 L 400 230 Z';
  return (
    <>
      <div className="kcl-controls">
        <button className={`button kcl-toggle ${tested ? '' : 'primary'}`} onClick={() => setTested(!tested)} {...hoverProps('hl_series_conflict')}>
          {tested ? '断电复位' : '通电测试'}
        </button>
        <Seg
          label="第二个源"
          value={ib === 2 ? 'same' : 'diff'}
          onChange={(v) => {
            setIb(v === 'same' ? 2 : 5);
            setTested(false);
          }}
          options={[
            ['diff', '右源 5 A'],
            ['same', '右源 2 A（同值）'],
          ]}
        />
      </div>
      <svg viewBox="0 0 480 290" className={`kcl-svg circuit ${alarm ? 'alarm' : ''}`} role="img" aria-label={`2 A 与 ${ib} A 两个理想电流源串联`}>
        <rect x="2" y="2" width="476" height="286" rx="14" className="kcl-bg" />
        <path d={loop} className="kcl-wire" />
        {flowing && <Flow d="M 90 230 L 90 60 L 400 60 L 400 230 L 90 230" i={2} scale={scale} className="src" />}
        {/* I_A on the left (up), I_B on the top (to the right) */}
        <SourceSymbol x={90} y={147} up cls="up" />
        <text x={118} y={151} className="kcl-lbl src">
          <Sym n="I" s="A" /> = 2 A
        </text>
        <g transform="rotate(90 290 60)">
          <SourceSymbol x={290} y={60} up cls={conflict ? 'bad' : 'up'} />
        </g>
        <text x={290} y={36} textAnchor="middle" className={`kcl-lbl ${conflict ? 'bad' : 'src'}`}>
          <Sym n="I" s="B" /> = {ib} A
        </text>
        {/* load */}
        <path d="M 400 118 L 391 124 L 409 136 L 391 148 L 409 160 L 391 172 L 400 178" className="kcl-res" />
        <path d="M 400 112 L 400 118 M 400 178 L 400 184" className="kcl-wire" />
        <text x={414} y={152} className="kcl-lbl res">
          负载
        </text>
        {/* middle node m */}
        <g className={`kcl-m ${alarm ? 'alarm' : ''} ${flagLit ? 'lit' : ''}`} {...hoverProps('hl_series_conflict')}>
          <circle cx="180" cy="60" className="halo" />
          <circle cx="180" cy="60" r="6" className="dot" />
          <text x="180" y="86" textAnchor="middle" className="kcl-nname">
            节点 m
          </text>
          {(alarm || flagLit) && conflict && (
            <g className="kcl-badge">
              <rect x="120" y="96" width="120" height="22" rx="6" />
              <text x="180" y="111" textAnchor="middle">
                KCL 违背：2A ≠ {ib}A
              </text>
            </g>
          )}
        </g>
        {alarm && (
          <g className="kcl-alarmbox">
            <rect x="130" y="176" width="236" height="60" rx="10" />
            <text x="248" y="198" textAnchor="middle">
              Δi = 2 A − {ib} A = {fmt(2 - ib, 0)} A ≠ 0
            </text>
            <text x="248" y="222" textAnchor="middle">
              <Sym n="v" s="m" /> {Number.isFinite(vm) ? `= ${fmt(vm, 0)} V ↑` : '→ ∞（击穿）'}
            </text>
          </g>
        )}
        {flowing && (
          <text x="240" y="186" textAnchor="middle" className="kcl-sub">
            2 A = 2 A：数学上不矛盾
          </text>
        )}
        {!tested && (
          <text x="240" y="186" textAnchor="middle" className="kcl-sub">
            未通电
          </text>
        )}
      </svg>
      {alarm ? (
        <div className="kcl-popup" role="alert">
          <b>电路非法，已拦截。</b>对中间节点 m 列 KCL：左边的源每秒强行塞进 2 C 电荷，右边的源每秒强行抽走 {ib} C，
          <Tex tex={`2\\ \\text{A} = ${ib}\\ \\text{A}`} /> 不可能成立。理想电流源内阻无穷大，节点 m 的电压会冲向无穷大。
        </div>
      ) : (
        <Readout tone={flowing ? 'ok' : ''}>
          <div className="kcl-eq-label">中间节点 m 的 KCL：</div>
          <Tex tex={`I_A - I_B = 0 \\;\\Rightarrow\\; I_A = I_B`} />
          {flowing && <div className="kcl-eq-note">电流值与方向完全一致时才不矛盾，但工程上也绝不这样画。</div>}
        </Readout>
      )}
    </>
  );
}
