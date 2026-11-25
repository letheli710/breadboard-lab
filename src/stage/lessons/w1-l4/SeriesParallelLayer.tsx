// W1-L4 layer 02 · 串联 vs 并联拓扑判定台: three preset circuits (true / fake series, true / fake
// parallel, Sadiku Ex 2.4). Pick two elements and the layer marks the shared node(s), its degree
// and the verdict; the saboteur switch hangs R_tap on the middle node or squeezes R_sneak into the
// top rail; elements and nodes can be dragged (and elements turned by a double click) — the
// drawing changes, the netlist and so the verdict do not. Hovering a linked term in the text
// previews the preset it talks about. Stage params: l2_preset, l2_sabotage, l2_pick, l2_ex24_colored.

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { Tex } from '../../StageText';
import { GREY, PRESET_LABEL, preset, type PEl, type PNode, type PresetId } from './circuits';
import { judge, type Pt, type Verdict } from './topo';
import './w1l4.css';

const HALF = 30;
const VB_W = 400;
const VB_H = 250;

/** text terms that preview a preset: [preset, saboteur on?] (null: keep the switch) */
const PREVIEW: Record<string, [PresetId, boolean | null]> = {
  hl_true_series: [1, false],
  hl_fake_series: [1, true],
  hl_true_parallel: [2, false],
  hl_fake_parallel: [2, true],
  hl_ex24_circuit: [3, null],
};

/** preset-1 currents in mA (Vs 24 V, R1 1.2 kΩ, R2 2 kΩ, Rtap 3 kΩ) */
const CURRENT: Record<string, Record<string, number>> = {
  off: { Vs: 7.5, R1: 7.5, R2: 7.5 },
  on: { Vs: 10, R1: 10, R2: 6, Rtap: 4 },
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const texNode = (n: PNode) => (n.id === 'A2' ? "A'" : n.label);

type Drag = { kind: 'el' | 'node'; id: string; start: Pt; orig: Pt; moved: boolean };

export default function SeriesParallelLayer() {
  const lit = useLit();
  const hover = useStage((s) => s.hover);
  const setHover = useStage((s) => s.setHover);
  const [presetId, setPreset] = useStageParam<PresetId>('l2_preset', 1);
  const [sab, setSab] = useStageParam('l2_sabotage', false);
  const [pickRaw, setPick] = useStageParam<string[]>('l2_pick', []);
  const [colored, setColored] = useStageParam('l2_ex24_colored', true);
  const [selfHover, setSelfHover] = useState(false);
  const [offsets, setOffsets] = useState<Record<string, Pt>>({});
  const [turned, setTurned] = useState<Record<string, boolean>>({});
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<Drag | null>(null);

  // a hovered text term previews its preset (not when the hover comes from this layer)
  const prevKey = !selfHover ? hover?.find((id) => PREVIEW[id]) : undefined;
  const pv = prevKey ? PREVIEW[prevKey] : undefined;
  const pid: PresetId = pv ? pv[0] : presetId;
  const s = pv && pv[1] !== null ? pv[1] : sab;
  const previewing = !!pv && (pid !== presetId || (pid !== 3 && s !== sab));
  const P = preset(pid, pid === 3 ? false : s);
  const showColor = pid !== 3 || colored;
  const has = (id: string) => lit.includes(id);
  const pick = pickRaw.filter((id) => P.els.some((e) => e.id === id));

  const ok = (k: string) => `${pid}:${k}`;
  const off = (k: string): Pt => offsets[ok(k)] ?? [0, 0];
  const nodeGeo = (n: PNode) => {
    const [dx, dy] = off(`n-${n.id}`);
    return { x: n.x + dx, x2: (n.x2 ?? n.x) + dx, y: n.y + dy, rail: n.x2 !== undefined };
  };
  const elGeo = (e: PEl) => {
    const [dx, dy] = off(`e-${e.id}`);
    const dir = turned[ok(e.id)] ? (e.dir === 'h' ? 'v' : 'h') : e.dir;
    const x = e.x + dx;
    const y = e.y + dy;
    const ta: Pt = dir === 'h' ? [x - HALF, y] : [x, y - HALF];
    const tb: Pt = dir === 'h' ? [x + HALF, y] : [x, y + HALF];
    return { x, y, dir, ta, tb };
  };
  const nodeById = new Map(P.nodes.map((n) => [n.id, n]));
  const color = (nodeId: string) => (showColor ? nodeById.get(nodeId)!.color : GREY);

  /** wire from a terminal to its node: along the element's axis first, then across */
  const route = (T: Pt, nodeId: string, dir: 'h' | 'v'): Pt[] => {
    const g = nodeGeo(nodeById.get(nodeId)!);
    const H: Pt = g.rail ? [clamp(T[0], g.x, g.x2), g.y] : [g.x, g.y];
    return dir === 'v' ? [T, [T[0], H[1]], H] : [T, [H[0], T[1]], H];
  };
  const ptsStr = (ps: Pt[]) => ps.map((p) => p.join(',')).join(' ');

  /* ----------------------------------------------------- verdict */
  const verdict: Verdict | null = pick.length === 2 ? judge(P.els, pick[0], pick[1]) : null;
  const elLabel = (id: string) => P.els.find((e) => e.id === id)?.label ?? id;
  const ring = new Map<string, 'green' | 'blue' | 'red'>();
  const saboteurs = new Set<string>();
  let sneak: string | undefined;
  if (verdict?.kind === 'series') ring.set(verdict.node, 'green');
  if (verdict?.kind === 'parallel') verdict.nodes.forEach((n) => ring.set(n, 'blue'));
  if (verdict?.kind === 'neither') {
    if (verdict.shared) ring.set(verdict.shared.node, 'red');
    verdict.third.forEach((id) => saboteurs.add(id));
    sneak = verdict.sneak;
  }
  // what the lit hover-map ids point at in the preset on show
  const litEls = new Map<string, string>();
  const litNodes = new Map<string, string>();
  if (pid === 1 && !s && has('hl_true_series')) {
    litEls.set('R1', 'green').set('R2', 'green');
    litNodes.set('N', 'green');
  }
  if (pid === 1 && s && has('hl_fake_series')) {
    litEls.set('Rtap', 'red');
    litNodes.set('N', 'red');
  }
  if (pid === 2 && !s && has('hl_true_parallel')) {
    litEls.set('R3', 'blue').set('R4', 'blue');
    litNodes.set('A', 'blue').set('B', 'blue');
  }
  if (pid === 2 && s && has('hl_fake_parallel')) {
    litEls.set('Rsneak', 'violet');
    litNodes.set('A', 'blue').set('A2', 'violet');
  }
  const pulseAll = pid === 3 && has('ex24_branches');
  const wiresLit = pid === 3 && has('ex24_wires');

  const hoverIdOf = (kind: 'el' | 'node', id: string): string | undefined => {
    if (pid === 3) return 'hl_ex24_circuit';
    if (pid === 1) return (kind === 'el' && ['R1', 'R2', 'Rtap'].includes(id)) || id === 'N' ? (s ? 'hl_fake_series' : 'hl_true_series') : undefined;
    return (kind === 'el' && ['R3', 'R4', 'Rsneak'].includes(id)) || kind === 'node' ? (s ? 'hl_fake_parallel' : 'hl_true_parallel') : undefined;
  };
  /** hover links only for a mouse: on touch the hover bar would change height and move the drawing under the finger */
  const enter = (id: string | undefined, ev: PointerEvent) => {
    if (!id || ev.pointerType !== 'mouse') return;
    setSelfHover(true);
    setHover([id]);
  };
  const leave = () => {
    setSelfHover(false);
    setHover(null);
  };

  /* ----------------------------------------------------- picking and dragging */
  const toggle = (id: string) => {
    if (pick.includes(id)) setPick(pick.filter((x) => x !== id));
    else setPick([...pick, id].slice(-2));
  };
  const toSvg = (e: PointerEvent): Pt => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return [0, 0];
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  };
  const down = (kind: Drag['kind'], id: string) => (e: PointerEvent<SVGGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { kind, id, start: toSvg(e), orig: off(`${kind === 'el' ? 'e' : 'n'}-${id}`), moved: false };
  };
  const move = (e: PointerEvent<SVGGElement>) => {
    const d = drag.current;
    if (!d) return;
    const [x, y] = toSvg(e);
    const dx = x - d.start[0];
    const dy = y - d.start[1];
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    const k = ok(`${d.kind === 'el' ? 'e' : 'n'}-${d.id}`);
    setOffsets((o) => ({ ...o, [k]: [clamp(d.orig[0] + dx, -180, 180), clamp(d.orig[1] + dy, -110, 110)] }));
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved && d.kind === 'el') toggle(d.id);
  };
  const turn = (id: string) => setTurned((t) => ({ ...t, [ok(id)]: !t[ok(id)] }));
  const key = (id: string) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(id);
    } else if (e.key === 'r' || e.key === 'R') turn(id);
  };
  const relayout = () => {
    setOffsets((o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith(`${pid}:`))));
    setTurned((o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith(`${pid}:`))));
  };

  const cur = pid === 1 ? CURRENT[s ? 'on' : 'off'] : undefined;

  return (
    <div className="w4-layer">
      <div className="w4-controls">
        <span className="w4-group" role="group" aria-label="场景切换">
          {([1, 2, 3] as PresetId[]).map((id) => (
            <button
              key={id}
              className={`w4-btn ${presetId === id ? 'on' : ''}`}
              aria-pressed={presetId === id}
              onClick={() => {
                setPreset(id);
                setPick([]);
              }}
            >
              {PRESET_LABEL[id]}
            </button>
          ))}
        </span>
        <button
          className={`w4-switch bad ${sab && presetId !== 3 ? 'on' : ''}`}
          role="switch"
          aria-checked={sab && presetId !== 3}
          disabled={presetId === 3}
          onClick={() => setSab(!sab)}
        >
          <span className="knob" aria-hidden />
          插入/拔出“破坏者”支路
        </button>
        {presetId === 3 && !colored && (
          <button className="w4-btn" onClick={() => setColored(true)}>
            荧光笔染色
          </button>
        )}
        <button className="w4-btn" onClick={() => setPick([])} disabled={!pick.length}>
          清除选择
        </button>
        <button className="w4-btn" onClick={relayout}>
          复原布局
        </button>
      </div>

      <svg ref={svgRef} className="w4-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label={`串并联判定台：${PRESET_LABEL[pid]}`}>
        <defs>
          <pattern id="w4-grid2" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="1" y="1" width={VB_W - 2} height={VB_H - 2} rx="10" className="w4-bg" />
        <rect x="1" y="1" width={VB_W - 2} height={VB_H - 2} rx="10" fill="url(#w4-grid2)" />
        {previewing && (
          <text x={12} y={18} className="w4-preview">
            预览：{PRESET_LABEL[pid]}
            {pid !== 3 && s ? ' · 破坏者已插入' : ''}
          </text>
        )}
        {pid === 3 && has('hl_ex24_circuit') && <rect x={14} y={28} width={372} height={204} rx={10} className="w4-frame" />}

        {/* wires */}
        <g className={wiresLit ? 'w4-wires-pulse' : ''}>
          {P.els.map((e) => {
            const g = elGeo(e);
            return (
              <g key={e.id}>
                <polyline points={ptsStr(route(g.ta, e.a, g.dir))} className="w4-wire thin" style={{ stroke: color(e.a) }} />
                <polyline points={ptsStr(route(g.tb, e.b, g.dir))} className="w4-wire thin" style={{ stroke: color(e.b) }} />
              </g>
            );
          })}
        </g>

        {/* current in preset 1: dashes run faster where more current flows */}
        {cur &&
          P.els.map((e) => {
            const mA = cur[e.id];
            if (!mA) return null;
            const g = elGeo(e);
            // node a → element → node b (the source drives it the other way: − to +)
            const wa = route(g.ta, e.a, g.dir);
            const wb = route(g.tb, e.b, g.dir);
            const path = e.id === 'Vs' ? [...[...wb].reverse(), ...wa] : [...[...wa].reverse(), ...wb];
            return (
              <polyline
                key={`f-${e.id}`}
                points={ptsStr(path)}
                className="w4-flow"
                style={{ strokeWidth: 1 + mA * 0.25, animationDuration: `${(7.2 / mA).toFixed(2)}s` }}
                aria-hidden
              />
            );
          })}

        {/* nodes */}
        {P.nodes.map((n) => {
          const g = nodeGeo(n);
          const r = ring.get(n.id);
          const l = litNodes.get(n.id);
          const deg = P.els.filter((e) => e.a === n.id || e.b === n.id).length;
          const showDeg = !!r || l === 'red' || l === 'green';
          const c = color(n.id);
          const mid = (g.x + g.x2) / 2;
          const bottom = g.y > 150;
          return (
            <g
              key={n.id}
              className={`w4-node ${r ? `ring-${r}` : ''} ${l ? `lit-${l}` : ''}`}
              style={{ color: c }}
              onPointerDown={down('node', n.id)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerEnter={(ev) => enter(hoverIdOf('node', n.id), ev)}
              onPointerLeave={leave}
            >
              {g.rail ? (
                <>
                  <line x1={g.x} y1={g.y} x2={g.x2} y2={g.y} className="w4-rail-hit" />
                  <line x1={g.x} y1={g.y} x2={g.x2} y2={g.y} className="w4-rail" />
                </>
              ) : (
                <>
                  <circle cx={g.x} cy={g.y} r={12} className="w4-node-hit" />
                  <circle cx={g.x} cy={g.y} r={l === 'red' ? 8 : 5.5} className="w4-node-dot" />
                </>
              )}
              {showColor && (
                <text x={g.rail ? g.x + 10 : g.x + 9} y={bottom ? g.y + 16 : g.y - 8} className="w4-node-label">
                  {n.label}
                </text>
              )}
              {showDeg && (
                <text x={g.rail ? mid : g.x} y={bottom ? g.y + 16 : g.y - 24} className={`w4-deg ${r ?? l}`}>
                  deg = {deg}
                </text>
              )}
            </g>
          );
        })}

        {/* elements */}
        {P.els.map((e, i) => {
          const g = elGeo(e);
          const h = g.dir === 'h';
          const body = e.kind === 'V' ? 16 : 15;
          const ea: Pt = h ? [g.x - body, g.y] : [g.x, g.y - body];
          const eb: Pt = h ? [g.x + body, g.y] : [g.x, g.y + body];
          const lx = h ? g.x : g.x + (e.kind === 'V' ? 22 : 13);
          const cls = [
            'w4-el2',
            pick.includes(e.id) ? 'sel' : '',
            saboteurs.has(e.id) ? 'sab' : '',
            sneak === e.id ? 'sneak' : '',
            litEls.has(e.id) ? `lit-${litEls.get(e.id)}` : '',
            pulseAll ? 'pulse' : '',
          ].join(' ');
          return (
            <g
              key={e.id}
              className={cls}
              tabIndex={0}
              role="button"
              aria-pressed={pick.includes(e.id)}
              aria-label={`${e.label} ${e.value}`}
              onPointerDown={down('el', e.id)}
              onPointerMove={move}
              onPointerUp={up}
              onDoubleClick={() => turn(e.id)}
              onKeyDown={key(e.id)}
              onPointerEnter={(ev) => enter(hoverIdOf('el', e.id), ev)}
              onPointerLeave={leave}
            >
              <rect x={g.x - (h ? 32 : 14)} y={g.y - (h ? 14 : 32)} width={h ? 64 : 28} height={h ? 28 : 64} className="w4-el-hit" />
              <line x1={g.ta[0]} y1={g.ta[1]} x2={ea[0]} y2={ea[1]} className="w4-lead" />
              <line x1={eb[0]} y1={eb[1]} x2={g.tb[0]} y2={g.tb[1]} className="w4-lead" />
              {e.kind === 'V' ? (
                <>
                  <circle cx={g.x} cy={g.y} r={16} className="w4-body" />
                  <text x={h ? g.x - 7 : g.x} y={h ? g.y + 3.5 : g.y - 3} className="w4-sign">
                    +
                  </text>
                  <text x={h ? g.x + 7 : g.x} y={h ? g.y + 3.5 : g.y + 11} className="w4-sign">
                    −
                  </text>
                </>
              ) : h ? (
                <rect x={g.x - 15} y={g.y - 7} width={30} height={14} rx={2} className="w4-body" />
              ) : (
                <rect x={g.x - 7} y={g.y - 15} width={14} height={30} rx={2} className="w4-body" />
              )}
              <text x={lx} y={h ? g.y - 13 : g.y - 6} className={`w4-el-label ${h ? 'mid' : ''}`}>
                {e.label}
              </text>
              <text x={lx} y={h ? g.y + 21 : g.y + 6} className={`w4-el-value ${h ? 'mid' : ''}`}>
                {e.value}
              </text>
              {e.note && (
                <text x={lx} y={h ? g.y + 32 : g.y + 18} className={`w4-el-note ${h ? 'mid' : ''}`}>
                  {e.note}
                </text>
              )}
              {pulseAll && (
                <g className="w4-badge">
                  <circle cx={h ? g.x - 24 : g.x - 15} cy={h ? g.y - 14 : g.y - 22} r={7} />
                  <text x={h ? g.x - 24 : g.x - 15} y={h ? g.y - 11 : g.y - 19}>
                    {i + 1}
                  </text>
                </g>
              )}
              {(saboteurs.has(e.id) || sneak === e.id) && (
                <text x={h ? g.x : g.x - (e.kind === 'V' ? 20 : 12)} y={h ? g.y - 24 : g.y + 3} className={`w4-sab-tag ${h ? 'mid' : 'end'}`}>
                  {sneak === e.id ? '夹塞' : '分流'}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <VerdictBox verdict={verdict} pick={pick} els={P.els} nodes={P.nodes} elLabel={elLabel} />
    </div>
  );
}

function VerdictBox({ verdict, pick, els, nodes, elLabel }: { verdict: Verdict | null; pick: string[]; els: PEl[]; nodes: PNode[]; elLabel: (id: string) => string }) {
  const nl = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;
  const tn = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    return n ? texNode(n) : id;
  };
  const pair = (id: string) => {
    const e = els.find((x) => x.id === id)!;
    return `${e.label}：{${nl(e.a)}, ${nl(e.b)}}`;
  };
  if (!verdict)
    return (
      <div className="w4-verdict idle" aria-live="polite">
        依次点击两颗元件进行判定{pick.length === 1 ? `（已选 ${elLabel(pick[0])}，再点一颗）` : ''}
        <span className="w4-wide"> · 拖动元件或节点重排，双击元件旋转 90°</span>
      </div>
    );
  const [x, y] = pick;
  const X = String.raw`\text{${elLabel(x)}}`;
  const Y = String.raw`\text{${elLabel(y)}}`;
  return (
    <div className={`w4-verdict ${verdict.kind}`} aria-live="polite">
      <span className="w4-badge-pill">
        {verdict.kind === 'series' ? '真串联：同电流，独占节点' : verdict.kind === 'parallel' ? '真并联：同电压，同节点对' : '既非串联也非并联（拆穿假串/假并）'}
      </span>
      <span className="w4-pairs">
        {pair(x)} · {pair(y)}
      </span>
      {verdict.kind === 'series' && (
        <span>
          共享节点 {nl(verdict.node)} 只连这两颗元件：
          <Tex tex={String.raw`\deg(${tn(verdict.node)}) = 2 \implies I_{${X}} = I_{${Y}}`} />
        </span>
      )}
      {verdict.kind === 'parallel' && (
        <span>
          两端跨接同一对节点：
          <Tex tex={String.raw`\{${tn(verdict.nodes[0])}, ${tn(verdict.nodes[1])}\} \implies V_{${X}} = V_{${Y}}`} />
        </span>
      )}
      {verdict.kind === 'neither' && (
        <>
          {verdict.shared ? (
            <span>
              共享节点 {nl(verdict.shared.node)} 的度数 deg = {verdict.shared.deg} ≠ 2：还连着 {verdict.third.map(elLabel).join('、')}，电流在这里分流 → 假串联
            </span>
          ) : (
            <span>两颗元件没有共享任何节点：既不保证同电流，也不保证同电压。</span>
          )}
          {verdict.sneak ? (
            <span>节点对不同：夹塞元件 {elLabel(verdict.sneak)} 把顶轨撕成两个节点 → 假并联</span>
          ) : (
            verdict.shared && <span>另一端落在不同的节点上：节点对不同 → 也不是并联</span>
          )}
        </>
      )}
    </div>
  );
}
