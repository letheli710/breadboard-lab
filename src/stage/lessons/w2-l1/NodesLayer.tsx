// W2-L1 layer 01 · 节点标注与参考地选择: every equipotential wire coloured as its node, the
// reference (green, ground symbol, 0 V) picked by clicking a node or the dock, the count n and
// n − 1, and (on request) the solved potentials of every node measured from that reference, with
// an "altitude ruler" that shows the whole set sliding when the reference moves.

import { useMemo } from 'react';
import { useLit } from '../../stageStore';
import { NODE_COLOR, NODE_ID, NODE_UNI, REF_COLOR, solve, val, type NodeId } from './model';
import { CircuitPicker, HiddenInfo, Schematic, Seg, Toggle, badgeOf, deep, hoverProps, nodeColor, signed, useLayerFollow, useW21 } from './parts';

function Ruler({ v, nodes, refNode }: { v: Record<NodeId, number>; nodes: NodeId[]; refNode: NodeId }) {
  const lit = useLit();
  const xs = nodes.map((n) => v[n]);
  const lo = Math.min(0, ...xs);
  const hi = Math.max(0, ...xs);
  const span = hi - lo || 1;
  const X = (x: number) => 50 + ((x - lo) / span) * 500;
  // labels of nearby nodes go on a second row
  const rows = new Map<NodeId, number>();
  let last = -1e9;
  for (const n of [...nodes].sort((a, b) => v[a] - v[b])) {
    const x = X(v[n]);
    const row = x - last < 84 && rows.size > 0 && [...rows.values()].at(-1) === 0 ? 1 : 0;
    rows.set(n, row);
    if (row === 0) last = x;
  }
  return (
    <svg className="w21-ruler" viewBox="0 0 600 70" role="img" aria-label="电气海拔尺：各节点电位（左低右高）">
      <line x1="20" y1="40" x2="580" y2="40" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <text x="580" y="64" fontSize="11" fill="#64748b" textAnchor="end">
        高 →
      </text>
      <line x1={X(0)} y1="30" x2={X(0)} y2="50" stroke={REF_COLOR} strokeWidth="2" strokeDasharray="3,2" />
      <text x={X(0)} y="64" fontSize="11" fontWeight="700" fill="#15803d" textAnchor="middle">
        海平面 0 V
      </text>
      {nodes.map((n) => {
        const col = n === refNode ? REF_COLOR : NODE_COLOR[n];
        const on = lit.includes(NODE_ID[n]);
        return (
          <g key={n} {...hoverProps([NODE_ID[n]])} className={`w21-tick ${on ? 'lit' : ''}`}>
            <circle cx={X(v[n])} cy="40" r={on ? 7 : 5.5} fill={col} />
            <text x={X(v[n])} y={rows.get(n) ? 12 : 27} fontSize="12" fontWeight="800" fill={deep(col)} textAnchor="middle">
              {NODE_UNI[n]} {signed(v[n])}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function NodesLayer() {
  useLayerFollow();
  const { c, ref, setRef, reveal, setReveal } = useW21();
  const show = reveal && c.numeric;
  const v = useMemo(() => {
    if (!c.numeric) return null;
    const s = solve(c, ref);
    return Object.fromEntries(c.nodes.map((n) => [n, val(s.v[n])])) as Record<NodeId, number>;
  }, [c, ref]);

  const n = c.nodes.length;
  const badge = (k: NodeId) => {
    const col = nodeColor(k, ref);
    if (k === ref) return badgeOf(k === 'v0' ? '参考地 = 0 V' : `${NODE_UNI[k]} = 0 V（参考）`, col);
    const name = NODE_UNI[k];
    return badgeOf(show && v ? `${name} = ${signed(v[k])}` : name, col);
  };

  return (
    <div className="w21-layer">
      <div className="w21-dock">
        <CircuitPicker />
        <Seg label="参考地" value={ref} options={c.nodes.map((k) => ({ v: k, t: k === 'v0' ? '底部母线' : NODE_UNI[k] }))} onChange={setRef} />
        <Toggle on={show} onChange={setReveal} disabled={!c.numeric}>
          显示节点电位
        </Toggle>
      </div>

      <Schematic
        c={c}
        refNode={ref}
        wire={(k) => nodeColor(k, ref)}
        badge={badge}
        onNode={setRef}
        ariaLabel={`${c.title}：${n} 个节点，参考地 ${ref === 'v0' ? '底部母线' : NODE_UNI[ref]}`}
      />

      <div className="w21-telemetry" aria-live="polite">
        <span className="w21-chip" {...hoverProps(c.nodes.map((k) => NODE_ID[k]))}>
          节点 <b>n = {n}</b>
        </span>
        <span className="w21-chip ref" {...hoverProps([NODE_ID[ref]])}>
          参考 1 个：{ref === 'v0' ? '底部母线' : NODE_UNI[ref]} ≡ 0 V
        </span>
        <span className="w21-chip core" {...hoverProps(c.nodes.filter((k) => k !== ref).map((k) => NODE_ID[k]))}>
          未知电位 <b>n − 1 = {n - 1}</b> 个 → 列 {n - 1} 个 KCL
        </span>
        {!c.numeric && <span className="w21-chip muted">通用电路只有字母：切到“热身”或“例题”看数值</span>}
        {c.numeric && !show && <span className="w21-chip muted">点任意节点或徽章，改选参考地</span>}
      </div>
      {show && v && <Ruler v={v} nodes={c.nodes} refNode={ref} />}

      <HiddenInfo
        items={['同一根无元件导线上的所有点属于同一个等电位节点', '底部母线连接支路最多，优先选作参考节点 (0 V)', `全图 n = ${n} 个节点，仅需锁定 n - 1 = ${n - 1} 个未知节点电位`]}
      />
    </div>
  );
}
