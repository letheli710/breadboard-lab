// W1-L4 layer 01 · 等电位节点染色高亮台: a messy schematic (the act-3 two-mesh circuit drawn with
// extra corners, three T junctions and a wire loop). Clicking a piece of wire floods its whole
// 0 Ω region with the node's colour (breadth-first, a wave across the junctions); "一键拉直"
// morphs the wires into the canonical node drawing; the breadboard switch shows the five-hole
// strips under the schematic. Stage params: l1_found (nodes coloured), l1_straight, l1_bb.

import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import {
  BB_COLS,
  BB_LEADS,
  BB_NODE_OF_COL,
  GREY,
  L1_ELEMENTS,
  L1_FAKE_CORNER,
  L1_HUB,
  L1_NODE_INFO,
  L1_TWIGS,
  L1_WIRES,
  l1Terminals,
  type L1Element,
  type L1Node,
} from './circuits';
import { cubicBezier, floodFill, junctions, type Pt } from './topo';
import './w1l4.css';

const EASE = cubicBezier(0.4, 0, 0.2, 1);
const NODES: L1Node[] = ['A', 'B', 'C'];
const TERMINALS = new Set(L1_ELEMENTS.flatMap((e) => l1Terminals(e).map((p) => p.join(','))));
const JUNCTIONS = junctions(L1_WIRES).map((p) => ({ p, node: L1_WIRES.find((w) => w.pts.some((q) => q[0] === p[0] && q[1] === p[1]))!.node }));

/** Values eased toward `target` (800 ms, cubic-bezier(0.4, 0, 0.2, 1)); jumps when motion is reduced. */
function useTween(target: Record<string, number>, ms: number): Record<string, number> {
  const sig = JSON.stringify(target);
  const [val, setVal] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const to = JSON.parse(sig) as Record<string, number>;
    const from = { ...cur.current };
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      cur.current = to;
      setVal(to);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = EASE(Math.min(1, (now - t0) / ms));
      const v: Record<string, number> = {};
      for (const key of Object.keys(to)) v[key] = (from[key] ?? to[key]) + (to[key] - (from[key] ?? to[key])) * k;
      cur.current = v;
      setVal(v);
      if (now - t0 < ms) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sig, ms]);
  return val;
}

const lerp = (p: Pt, q: Pt, t: number): Pt => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
/** a wire point in the drawing at morph t: terminals stay, everything else slides to the node's hub */
const morph = (p: Pt, node: L1Node, t: number): Pt => (TERMINALS.has(p.join(',')) ? p : lerp(p, L1_HUB[node], t));
const pts = (ps: Pt[]) => ps.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/* ------------------------------------------------------------- breadboard geometry */
const colX = (c: number) => 110 + (c - 11) * 52;
const ROWS_UP = 'abcde';
const ROWS_DN = 'fghij';
const rowY = (r: string) => (ROWS_UP.includes(r) ? 269 + ROWS_UP.indexOf(r) * 8 : 325 + ROWS_DN.indexOf(r) * 8);

type BbPick = { col: number; half: 'up' | 'down' };

function ElementShape({ e, cls, onEnter, onLeave }: { e: L1Element; cls: string; onEnter: (ev: PointerEvent) => void; onLeave: () => void }) {
  const [ta, tb] = l1Terminals(e);
  const h = e.dir === 'h';
  const body = e.kind === 'V' ? 17 : 15;
  const ea: Pt = h ? [e.x - body, e.y] : [e.x, e.y - body];
  const eb: Pt = h ? [e.x + body, e.y] : [e.x, e.y + body];
  const label: Pt = h ? [e.x, e.y - 13] : e.kind === 'V' ? [e.x + 24, e.y - 3] : [e.x + 13, e.y - 3];
  const value: Pt = h ? [e.x, e.y + 22] : e.kind === 'V' ? [e.x + 24, e.y + 10] : [e.x + 13, e.y + 10];
  return (
    <g className={`w4-el ${cls}`} onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <line x1={ta[0]} y1={ta[1]} x2={ea[0]} y2={ea[1]} className="w4-lead" />
      <line x1={eb[0]} y1={eb[1]} x2={tb[0]} y2={tb[1]} className="w4-lead" />
      {e.kind === 'V' ? (
        <>
          <circle cx={e.x} cy={e.y} r={17} className="w4-body" />
          <text x={e.x} y={e.y - 3} className="w4-sign">
            +
          </text>
          <text x={e.x} y={e.y + 11} className="w4-sign">
            −
          </text>
        </>
      ) : h ? (
        <rect x={e.x - 15} y={e.y - 7} width={30} height={14} rx={2} className="w4-body" />
      ) : (
        <rect x={e.x - 7} y={e.y - 15} width={14} height={30} rx={2} className="w4-body" />
      )}
      <text x={label[0]} y={label[1]} className={`w4-el-label ${h ? 'mid' : ''}`}>
        {e.label}
      </text>
      <text x={value[0]} y={value[1]} className={`w4-el-value ${h ? 'mid' : ''}`}>
        {e.value}
      </text>
    </g>
  );
}

export default function EquipotentialLayer() {
  const lit = useLit();
  const hover = useStage((s) => s.hover);
  const setHover = useStage((s) => s.setHover);
  const [found, setFound] = useStageParam<L1Node[]>('l1_found', []);
  const [straight, setStraight] = useStageParam('l1_straight', false);
  const [bb, setBb] = useStageParam('l1_bb', false);
  const [wave, setWave] = useState<Record<string, number>>({});
  const [info, setInfo] = useState<L1Node | null>(null);
  const [pick, setPick] = useState<BbPick | null>(null);
  // hover the layer set itself: no collapse preview then (the wire would slide away from the pointer)
  const [selfHover, setSelfHover] = useState(false);

  const has = (id: string) => lit.includes(id);
  const previewB = !selfHover && !!hover?.includes('hl_node_collapse');
  const t = useTween({ A: straight ? 1 : 0, B: straight || previewB ? 1 : 0, C: straight ? 1 : 0 }, previewB ? 600 : 800);

  /** hover links only for a mouse: on touch the hover bar would change height and move the drawing under the finger */
  const enter = (id: string, ev: PointerEvent) => {
    if (ev.pointerType !== 'mouse') return;
    setSelfHover(true);
    setHover([id]);
  };
  const leave = () => {
    setSelfHover(false);
    setHover(null);
  };

  const fill = (segId: string) => {
    const order = floodFill(L1_WIRES, segId);
    const node = L1_WIRES.find((w) => w.id === segId)!.node;
    setWave(Object.fromEntries(order.map((o) => [o.id, o.depth])));
    if (!found.includes(node)) setFound([...found, node]);
    setInfo(node);
    setPick(null);
  };
  const reset = () => {
    setFound([]);
    setStraight(false);
    setWave({});
    setInfo(null);
    setPick(null);
  };

  const all = NODES.every((n) => found.includes(n));
  const pickNode = pick && pick.half === 'up' ? BB_NODE_OF_COL[pick.col] : undefined;
  const glowNode = (n: L1Node) => (n === 'B' && has('hl_node_collapse')) || (n === 'A' && has('hl_bb_5hole')) || pickNode === n;
  const wireColor = (n: L1Node) => (found.includes(n) || glowNode(n) ? L1_NODE_INFO[n].color : GREY);
  const corner = morph(L1_FAKE_CORNER, 'B', t.B);
  const vbH = bb ? 370 : 236;

  const elCls = (e: L1Element) => {
    const c: string[] = [];
    if (has('hl_branch_def')) c.push('pulse');
    if (has('hl_topo_tree')) c.push(L1_TWIGS.includes(e.id) ? 'twig' : 'link');
    return c.join(' ');
  };

  const infoText = useMemo(() => {
    if (pick) {
      const n = pick.half === 'up' ? BB_NODE_OF_COL[pick.col] : undefined;
      if (pick.half === 'down') return `${pick.col} 列 f–j：被中央凹槽隔开，和上半 a${pick.col}–e${pick.col} 不连通，是另一个节点。`;
      if (!n) return `${pick.col} 列 a–e：5 个孔共用一条簧片，但这一列没有插任何引脚。`;
      return `a${pick.col}–e${pick.col} 共用一条磷青铜簧片 = 原理图节点 ${n}（${L1_NODE_INFO[n].branches.join('、')}）`;
    }
    if (info) {
      const d = L1_NODE_INFO[info];
      return `节点 ${info} · 电位 V${info} = ${d.volts} · 连接支路：${d.branches.join('、')}（deg = ${d.branches.length}）· ${d.note}`;
    }
    return '点击任意一段导线：沿 0 Ω 导线一路涂色，撞上元件端子才停。';
  }, [pick, info]);

  return (
    <div className="w4-layer">
      <div className="w4-controls">
        <button className={`w4-btn primary ${straight ? 'on' : ''}`} aria-pressed={straight} onClick={() => setStraight(!straight)}>
          一键拉直：折线图 ⇄ 规范节点图
        </button>
        <button className={`w4-switch ${bb ? 'on' : ''}`} role="switch" aria-checked={bb} onClick={() => setBb(!bb)}>
          <span className="knob" aria-hidden />
          面包板 5 孔铜片透视
        </button>
        <button className="w4-btn" onClick={reset}>
          重置染色
        </button>
      </div>

      <div className="w4-hud" aria-live="polite">
        <span className="w4-chip" onPointerEnter={(ev) => enter('hl_branch_def', ev)} onPointerLeave={leave}>
          b = 4
        </span>
        <span className="w4-chip">n = {found.length ? found.length : '?'}</span>
        <span className="w4-chip">l = {all ? 2 : '?'}</span>
        <span className={`w4-formula ${all ? 'ok' : ''}`} onPointerEnter={(ev) => enter('hl_topo_tree', ev)} onPointerLeave={leave}>
          b = l + n − 1{all ? '：4 = 2 + 3 − 1 ✓' : '（染完全部节点后验算）'}
        </span>
      </div>

      <svg className="w4-svg" viewBox={`0 0 400 ${vbH}`} role="img" aria-label="等电位节点染色台：可点击的导线、元件与面包板剖面">
        <defs>
          <pattern id="w4-grid1" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="1" y="1" width="398" height={vbH - 2} rx="10" className="w4-bg" />
        <rect x="1" y="1" width="398" height={vbH - 2} rx="10" fill="url(#w4-grid1)" />

        {/* wires */}
        <g className={has('hl_branch_def') ? 'w4-dim' : ''}>
          {L1_WIRES.map((w) => {
            const d = pts(w.pts.map((p) => morph(p, w.node, t[w.node])));
            const color = wireColor(w.node);
            const hov = w.node === 'B' ? (ev: PointerEvent) => enter('hl_node_collapse', ev) : undefined;
            return (
              <g key={w.id} onPointerEnter={hov} onPointerLeave={hov && leave}>
                <polyline points={d} className={`w4-wire ${glowNode(w.node) ? 'w4-glow' : ''}`} style={{ stroke: color, color, transitionDelay: `${(wave[w.id] ?? 0) * 110}ms` }} />
                <polyline points={d} className="w4-hit" onClick={() => fill(w.id)} />
              </g>
            );
          })}
          {JUNCTIONS.map(({ p, node }) => {
            const q = morph(p, node, t[node]);
            return <circle key={p.join(',')} cx={q[0]} cy={q[1]} r={3.6} fill={wireColor(node)} opacity={1 - t[node]} className="w4-dot" />;
          })}
          {NODES.map((n) => {
            const [x, y] = L1_HUB[n];
            return (
              <g key={n} opacity={t[n]} className="w4-hub" style={{ pointerEvents: t[n] > 0.5 ? 'auto' : 'none' }} onClick={() => fill(L1_WIRES.find((w) => w.node === n)!.id)}>
                <circle cx={x} cy={y} r={9} fill={found.includes(n) ? L1_NODE_INFO[n].color : GREY} />
                <text x={x} y={y + 3.5} className="w4-hub-text">
                  {n}
                </text>
              </g>
            );
          })}
        </g>

        {/* the 90° corner that is not a node */}
        <g className={`w4-corner ${has('hl_fake_corner') ? 'lit' : ''}`} opacity={1 - t.B} onPointerEnter={(ev) => enter('hl_fake_corner', ev)} onPointerLeave={leave}>
          <circle cx={corner[0]} cy={corner[1]} r={8} />
          {has('hl_fake_corner') && (
            <g className="w4-bubble">
              <rect x={corner[0] - 62} y={corner[1] + 12} width={124} height={18} rx={5} />
              <text x={corner[0]} y={corner[1] + 24.5}>
                0 Ω 导线，非新节点
              </text>
            </g>
          )}
        </g>

        {/* elements */}
        {L1_ELEMENTS.map((e, i) => (
          <g key={e.id}>
            <ElementShape e={e} cls={elCls(e)} onEnter={(ev) => enter('hl_branch_def', ev)} onLeave={leave} />
            {has('hl_branch_def') && (
              <g className="w4-badge">
                <circle cx={e.dir === 'h' ? e.x - 26 : e.x - 16} cy={e.dir === 'h' ? e.y - 14 : e.y - 22} r={7} />
                <text x={e.dir === 'h' ? e.x - 26 : e.x - 16} y={e.dir === 'h' ? e.y - 11 : e.y - 19}>
                  {i + 1}
                </text>
              </g>
            )}
            {has('hl_topo_tree') && (
              <text
                x={e.dir === 'h' ? e.x : e.x - (e.kind === 'V' ? 21 : 12)}
                y={e.dir === 'h' ? e.y + 33 : e.y + 4}
                className={`w4-tree-tag ${e.dir === 'h' ? 'mid' : 'end'} ${L1_TWIGS.includes(e.id) ? 'twig' : 'link'}`}
              >
                {L1_TWIGS.includes(e.id) ? '树枝' : '连枝'}
              </text>
            )}
          </g>
        ))}
        {has('hl_topo_tree') && (
          <text x={200} y={230} className="w4-legend">
            生成树：n − 1 = 2 条树枝（实线 R1、R2）· l = 2 条连枝（虚线 Vs、R3）
          </text>
        )}
        {has('hl_branch_def') && !has('hl_topo_tree') && (
          <text x={200} y={230} className="w4-legend">
            导线隐去：只数二端元件，b = 4
          </text>
        )}

        {/* breadboard strips under the schematic */}
        {bb && (
          <g className="w4-bb">
            <rect x={8} y={238} width={384} height={128} rx={8} className="w4-bb-panel" />
            <text x={18} y={251} className="w4-bb-title">
              面包板第 11–16 列剖面 · 上半 a–e ｜ 中央凹槽 ｜ 下半 f–j
            </text>
            {[...ROWS_UP, ...ROWS_DN].map((r) => (
              <text key={r} x={84} y={rowY(r) + 3} className="w4-bb-row">
                {r}
              </text>
            ))}
            {BB_COLS.map((c) => {
              const node = BB_NODE_OF_COL[c];
              const upOn = !!node && (found.includes(node) || pickNode === node || (node === 'A' && has('hl_bb_5hole')));
              const upGlow = (pick?.col === c && pick.half === 'up') || (c === 12 && has('hl_bb_5hole'));
              const dnGlow = pick?.col === c && pick.half === 'down';
              const color = node ? L1_NODE_INFO[node].color : GREY;
              return (
                <g key={c}>
                  <text x={colX(c)} y={261} className="w4-bb-col">
                    {node ? `${c} = ${node}` : c}
                  </text>
                  <g
                    className={`w4-strip ${upOn ? 'on' : ''} ${upGlow ? 'w4-glow' : ''}`}
                    style={{ color }}
                    onClick={() => setPick({ col: c, half: 'up' })}
                    onPointerEnter={c === 12 ? (ev) => enter('hl_bb_5hole', ev) : undefined}
                    onPointerLeave={c === 12 ? leave : undefined}
                  >
                    <rect x={colX(c) - 8} y={264} width={16} height={42} rx={3} />
                    {[...ROWS_UP].map((r) => (
                      <rect key={r} x={colX(c) - 2.5} y={rowY(r) - 2.5} width={5} height={5} rx={1} className="w4-hole" />
                    ))}
                  </g>
                  <g className={`w4-strip down ${dnGlow ? 'on w4-glow' : ''}`} style={{ color: GREY }} onClick={() => setPick({ col: c, half: 'down' })}>
                    <rect x={colX(c) - 8} y={320} width={16} height={42} rx={3} />
                    {[...ROWS_DN].map((r) => (
                      <rect key={r} x={colX(c) - 2.5} y={rowY(r) - 2.5} width={5} height={5} rx={1} className="w4-hole" />
                    ))}
                  </g>
                </g>
              );
            })}
            {BB_LEADS.map(([c, r, label]) => {
              const node = BB_NODE_OF_COL[c];
              const on = found.includes(node) || pickNode === node || (node === 'A' && has('hl_bb_5hole'));
              return (
                <g key={`${c}${r}${label}`} className="w4-bb-lead">
                  <circle cx={colX(c)} cy={rowY(r)} r={3.2} fill={on ? L1_NODE_INFO[node].color : '#334155'} />
                  <text x={colX(c) + 11} y={rowY(r) + 3}>
                    {label}
                  </text>
                </g>
              );
            })}
            <g className={`w4-trench ${has('hl_bb_trench') ? 'lit' : ''}`} onPointerEnter={(ev) => enter('hl_bb_trench', ev)} onPointerLeave={leave}>
              <rect x={96} y={308} width={288} height={10} rx={2} />
              <text x={240} y={315.5}>
                {has('hl_bb_trench') ? '断路隔离：e 与 f 不连通' : '中央凹槽'}
              </text>
            </g>
          </g>
        )}
      </svg>

      <p className="w4-info" style={info && !pick ? { borderColor: L1_NODE_INFO[info].color } : undefined}>
        {infoText}
      </p>
    </div>
  );
}
