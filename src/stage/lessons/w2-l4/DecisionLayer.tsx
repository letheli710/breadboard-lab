// W2-L4 layer 03 · 选型决策树与非平面电路识别. Left: the four-step selection funnel of Sadiku 3.7,
// stepped through one question at a time. Right: the planarity test bench — K3,3 (the classic
// non-planar crossing bridge) or, for contrast, the Wheatstone bridge with its fake crossing. Drag
// the nodes or press "尝试平面重绘": the crossings are counted live; the bridge comes out with 0,
// K3,3 never gets below 1 (no straight-line or any other drawing can), so it has no meshes.
// Where the stage is too small for both panels a tab picks one.
// Stage params: l3_step (0 = overview, 1…4), l3_panel ('tree' | 'graph'), l3_graph ('k33' | 'bridge'), l3_hl.

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { useStageParam } from '../../stageStore';
import { BRIDGE_EDGES, BRIDGE_LAYOUTS, crossings, K33_EDGES, K33_LAYOUTS, type Pt } from './model';
import { Lbl, Seg, Switch, fitScale, useBox, useLink } from './ui';

type Graph = 'k33' | 'bridge';

const TW = 400;
const TH = 334;
const GW = 360;
const GH = 334;
const GAP = 14;
const G_TOP = 48; // graph area starts below the title lines
const G_H = 260;

/* ------------------------------------------------------------- the decision funnel */

const STEPS: { title: string; sub: string; arrow: string; out: [string, string]; down: string }[] = [
  { title: '① 是否为非平面电路？', sub: '（存在无法消除的导线交叉）', arrow: '是', out: ['强制节点法', '（网孔法彻底失效）'], down: '否（平面）' },
  { title: '② 比较有效方程数', sub: '节点数 (N-1) vs 网孔数 M', arrow: '差异明显', out: ['谁方程少选谁', '（并联多→节点；串联多→网孔）'], down: '方程数相近' },
  { title: '③ 检查主导电源类型', sub: '（能否触发观察法直写？）', arrow: '', out: ['电流源多 → 节点法', '电压源多 → 网孔法'], down: '' },
];

function Tree({ step, on, bind }: { step: number; on: (id: string) => boolean; bind: ReturnType<typeof useLink>['bind'] }) {
  const state = (k: number) => (step === 0 ? '' : k < step ? 'passed' : k === step ? 'active' : 'later');
  return (
    <g className="w24-tree">
      <rect className="w24-panel" x={0.5} y={0.5} width={TW - 1} height={TH - 1} rx={10} />
      <text className="w24-mat-title" x={14} y={22}>
        工程选型 4 级决策漏斗（Sadiku 3.7）
      </text>
      {STEPS.map((s, i) => {
        const k = i + 1;
        const y = 36 + i * 74;
        const id = `dt_s${k}`;
        return (
          <g key={k} className={`w24-step s${k} ${state(k)} ${on(id) ? 'lit' : ''}`} {...bind(id)}>
            <rect className="box" x={12} y={y} width={190} height={48} rx={8} />
            <text className="t" x={107} y={y + 20}>
              {s.title}
            </text>
            <text className="s" x={107} y={y + 37}>
              {s.sub}
            </text>
            <line className="arr" x1={202} y1={y + 24} x2={236} y2={y + 24} markerEnd="url(#w24-arrow)" />
            {s.arrow && (
              <text className="a" x={219} y={y + 15}>
                {s.arrow}
              </text>
            )}
            <rect className="out" x={240} y={y + 2} width={150} height={44} rx={6} />
            <text className="t" x={315} y={y + 20}>
              {s.out[0]}
            </text>
            <text className="s o" x={315} y={y + 37}>
              {s.out[1]}
            </text>
            <line className="arr down" x1={107} y1={y + 48} x2={107} y2={y + 70} markerEnd="url(#w24-arrow)" />
            {s.down && (
              <text className="a left" x={115} y={y + 63}>
                {s.down}
              </text>
            )}
          </g>
        );
      })}
      <g className={`w24-step s4 ${state(4)} ${on('dt_s4') ? 'lit' : ''}`} {...bind('dt_s4')}>
        <rect className="box" x={12} y={258} width={378} height={66} rx={8} />
        <text className="t" x={201} y={278}>
          ④ 看目标待求量与器件类型（最终决胜）
        </text>
        <text className="s" x={201} y={297}>
          求节点电压 / 含运放或晶体管电路 → 节点法
        </text>
        <text className="s" x={201} y={314}>
          求支路电流 / 串联回路功率 → 网孔法
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------- the planarity bench */

const K33_NAMES = ['A', 'B', 'C', 'D', 'E', 'F (GND)'];
const BRIDGE_NAMES = ['a', 'b', 'c', 'd'];
const BRIDGE_LABELS = ['R₁', 'R₂', 'R₃', 'R₄', 'R₅', 'Vs'];

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const lerp = (a: Pt[], b: Pt[], t: number): Pt[] => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]);

function Bench({
  graph,
  pos,
  setPos,
  hl,
  on,
  bind,
}: {
  graph: Graph;
  pos: Pt[];
  setPos: (p: Pt[]) => void;
  hl: boolean;
  on: (id: string) => boolean;
  bind: ReturnType<typeof useLink>['bind'];
}) {
  const edges = graph === 'k33' ? K33_EDGES : BRIDGE_EDGES;
  const xs = crossings(pos, edges);
  const crossEdges = new Set(xs.flatMap((x) => x.edges));
  const gRef = useRef<SVGGElement>(null);
  const drag = useRef<number | null>(null);
  const toLocal = (e: RPointerEvent): Pt | null => {
    const g = gRef.current;
    const m = g?.getScreenCTM();
    if (!g || !m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [Math.min(GW - 20, Math.max(20, p.x)), Math.min(G_H - 14, Math.max(14, p.y))];
  };
  const k33 = graph === 'k33';
  const nonplanar = k33;
  const verdict = k33
    ? `当前交叉数：${xs.length} —— 怎么拖都至少剩 1 个 → 非平面，只能用节点法`
    : xs.length
      ? `当前交叉数：${xs.length} —— 这是“假交叉”：拖动节点或按「尝试平面重绘」`
      : '当前交叉数：0 —— 假交叉消除了：惠斯通电桥是平面电路，网孔法可用';
  const cLit = on('k33_cross') || hl;
  return (
    <g>
      <rect className={`w24-panel ${nonplanar ? 'bad' : 'good'}`} x={0.5} y={0.5} width={GW - 1} height={GH - 1} rx={10} />
      <text className={`w24-mat-title ${nonplanar ? 'bad' : 'good'}`} x={14} y={22}>
        {k33 ? '网孔法禁区：经典非平面电路（K₃,₃ 拓扑）' : '对照：惠斯通电桥（看似交叉的平面电路）'}
      </text>
      <text className="w24-lbl muted" x={14} y={40}>
        {k33 ? '顶部 3 节点 (A,B,C) 与底部 3 节点 (D,E,F) 两两全连通' : '4 个节点、6 条支路（5 个电阻 + 电源）'}
      </text>
      <g ref={gRef} transform={`translate(0 ${G_TOP})`}>
        <g className={`w24-graph ${on(k33 ? 'k33_graph' : 'bridge_graph') ? 'lit' : ''}`} {...bind(k33 ? 'k33_graph' : 'bridge_graph')}>
          {edges.map(([a, b], i) => (
            <line
              key={i}
              className={`edge ${crossEdges.has(i) ? 'crossing' : ''} ${k33 && i % 4 === 0 ? 'straight' : ''}`}
              x1={pos[a][0]}
              y1={pos[a][1]}
              x2={pos[b][0]}
              y2={pos[b][1]}
            />
          ))}
          {!k33 &&
            edges.map(([a, b], i) => (
              <text key={`l${i}`} className="w24-lbl elabel" x={(pos[a][0] + pos[b][0]) / 2 + 8} y={(pos[a][1] + pos[b][1]) / 2 - 6}>
                {BRIDGE_LABELS[i]}
              </text>
            ))}
        </g>
        <g className={`w24-crosses ${cLit ? 'lit' : ''}`} {...bind('k33_cross')}>
          {xs.map((x, i) => (
            <circle key={i} cx={x.at[0]} cy={x.at[1]} r={cLit ? 11 : 7} />
          ))}
        </g>
        {pos.map((p, i) => (
          <g
            key={i}
            className={`w24-gnode ${k33 ? (i < 3 ? 'top' : 'bottom') : 'br'}`}
            onPointerDown={(e) => {
              drag.current = i;
              (e.currentTarget as Element).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (drag.current !== i) return;
              const q = toLocal(e);
              if (q) setPos(pos.map((o, k) => (k === i ? q : o)));
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            <circle cx={p[0]} cy={p[1]} r={14} className="hit" />
            <circle cx={p[0]} cy={p[1]} r={8} />
            <text x={p[0]} y={p[1] - 13}>
              {k33 ? K33_NAMES[i] : BRIDGE_NAMES[i]}
            </text>
          </g>
        ))}
      </g>
      <text className={`w24-verdict ${k33 ? 'bad' : xs.length ? 'warn' : 'good'}`} x={14} y={GH - 14}>
        {verdict}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------- the layer */

export default function DecisionLayer() {
  const [step, setStep] = useStageParam('l3_step', 0);
  const [panel, setPanel] = useStageParam<'tree' | 'graph'>('l3_panel', 'tree');
  const [graph, setGraph] = useStageParam<Graph>('l3_graph', 'k33');
  const [hl, setHl] = useStageParam('l3_hl', true);
  const { on, bind } = useLink();
  const [wrapRef, box] = useBox<HTMLDivElement>();
  const start = (g: Graph) => (g === 'k33' ? K33_LAYOUTS[0] : BRIDGE_LAYOUTS[0]);
  // each graph keeps its own drawing (a redraw still running on the other one can't disturb it)
  const [posBy, setPosBy] = useState<Record<Graph, Pt[]>>({ k33: K33_LAYOUTS[0], bridge: BRIDGE_LAYOUTS[0] });
  const pos = posBy[graph];
  const setPosOf = (g: Graph, p: Pt[]) => setPosBy((o) => ({ ...o, [g]: p }));
  const setPos = (p: Pt[]) => setPosOf(graph, p);
  const [anim, setAnim] = useState(false);
  const raf = useRef(0);

  const redraw = () => {
    const g = graph;
    const seq = g === 'k33' ? K33_LAYOUTS.slice(1) : BRIDGE_LAYOUTS.slice(1);
    cancelAnimationFrame(raf.current);
    setAnim(true);
    let from = pos;
    let leg = 0;
    let t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - t0) / 1100));
      setPosOf(g, lerp(from, seq[leg], ease(t)));
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else if (leg < seq.length - 1) {
        from = seq[leg];
        leg++;
        t0 = now + 350;
        raf.current = requestAnimationFrame(tick);
      } else setAnim(false);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const bothW = fitScale(box, TW + GAP + GW, Math.max(TH, GH));
  const bothT = fitScale(box, Math.max(TW, GW), TH + GAP + GH);
  const single = fitScale(box, TW, TH);
  const both = Math.max(bothW, bothT) >= Math.min(0.78, single);
  const sideBySide = bothW >= bothT;
  const showTree = both || panel === 'tree';
  const showGraph = both || panel === 'graph';
  const vbW = both ? (sideBySide ? TW + GAP + GW : TW) : showTree ? TW : GW;
  const vbH = both ? (sideBySide ? Math.max(TH, GH) : TH + GAP + GH) : showTree ? TH : GH;

  return (
    <div className="w24-layer">
      <div className="w24-dock">
        {!both && (
          <Seg
            label="面板"
            value={panel}
            onChange={setPanel}
            options={[
              ['tree', '选型决策树'],
              ['graph', '非平面检测'],
            ]}
          />
        )}
        {showTree && (
          <Seg
            label="决策步骤"
            value={String(step)}
            onChange={(v) => setStep(+v)}
            options={[
              ['0', '总览'],
              ['1', '①'],
              ['2', '②'],
              ['3', '③'],
              ['4', '④'],
            ]}
          />
        )}
        {showGraph && (
          <>
            <Seg
              label="电路"
              value={graph}
              onChange={setGraph}
              options={[
                ['k33', 'K₃,₃ 交叉桥'],
                ['bridge', '惠斯通电桥'],
              ]}
            />
            <button className="w24-btn primary" onClick={redraw} disabled={anim}>
              <Lbl long="尝试平面重绘" short="重绘" />
            </button>
            <button className="w24-btn" onClick={() => setPos(start(graph))} disabled={anim}>
              复位
            </button>
            <Switch on={hl} onChange={setHl} bad>
              <Lbl long="高亮交叉点" short="交叉点" />
            </Switch>
          </>
        )}
      </div>
      <div className="w24-svgwrap" ref={wrapRef}>
        <svg className="w24-svg" viewBox={`0 0 ${vbW} ${vbH}`} role="img" aria-label="选型决策树与平面性检测">
          <defs>
            <marker id="w24-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
          </defs>
          {showTree && <Tree step={step} on={on} bind={bind} />}
          {showGraph && (
            <g transform={both ? (sideBySide ? `translate(${TW + GAP} 0)` : `translate(${(TW - GW) / 2} ${TH + GAP})`) : undefined}>
              <Bench graph={graph} pos={pos} setPos={setPos} hl={hl} on={on} bind={bind} />
            </g>
          )}
        </svg>
      </div>
      <div className="w24-hud" aria-live="polite">
        {showTree && step > 0 ? (
          <span>{HUD_STEP[step - 1]}</span>
        ) : (
          <span>
            {graph === 'k33'
              ? '“网孔”是内部不含任何其他支路的平面窗口；K₃,₃ 无论如何拉扯重绘都必有交叉 → 只能用节点法！'
              : '把一条对角线拉到外侧绕过去就没交叉了：惠斯通电桥是平面电路。'}
          </span>
        )}
      </div>
    </div>
  );
}

const HUD_STEP = [
  '① 平面性一票否决：存在无法消除的交叉（含 K₃,₃ 或 K₅）→ 直接锁定节点法。',
  '② 平面电路：比较 N − 1 与 M = B − N + 1，谁方程少选谁。',
  '③ 方程数相近：电流源多 → 节点法（可直写 Gv = i）；电压源多 → 网孔法（可直写 Ri = v）。',
  '④ 最终决胜：求节点电压 / 运放、晶体管 → 节点法；求支路电流 / 串联回路功率 → 网孔法。',
];
