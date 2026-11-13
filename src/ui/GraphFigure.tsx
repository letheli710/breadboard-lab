// Directed graph of a circuit (schematic.graph, matrix-form chapter): numbered nodes, numbered
// oriented branches (arrow in the middle), tree branches thick and solid, links thin and dashed,
// the reference node marked, and cut-sets as closed dashed curves. Positions come from the file.

import { tr } from '../core/i18n';
import type { CircuitGraph, Pt } from '../core/problem/types';

const S = 44; // px per grid unit
const PAD = 26;
const R = 11; // node radius

type V = [number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
const len = (a: V) => Math.hypot(a[0], a[1]) || 1;
const unit = (a: V): V => mul(a, 1 / len(a));
/** left of the travel direction as seen on screen (y down) */
const left = (d: V): V => [d[1], -d[0]];

/** closed Catmull–Rom curve through the points, as an SVG path */
function closedCurve(pts: V[]): string {
  const n = pts.length;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = add(p1, mul(sub(p2, p0), 1 / 6));
    const c2 = sub(p2, mul(sub(p3, p1), 1 / 6));
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d + 'Z';
}

export function GraphFigure({ graph }: { graph: CircuitGraph }) {
  const pos = new Map(graph.nodes.map((n) => [n.name, n.at as V]));
  const all: Pt[] = [...graph.nodes.map((n) => n.at), ...(graph.cutsets ?? []).flatMap((c) => c.path)];
  // curved branches reach out by |bend|
  for (const b of graph.branches) {
    const p = pos.get(b.from);
    const q = pos.get(b.to);
    if (p && q && b.bend) all.push(add(mul(add(p, q), 0.5), mul(unit(left(sub(q, p))), b.bend)));
  }
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  const W = (Math.max(...xs) - x0) * S + 2 * PAD;
  const H = (Math.max(...ys) - y0) * S + 2 * PAD + 14;
  const P = (p: V): V => [(p[0] - x0) * S + PAD, (p[1] - y0) * S + PAD];
  const tree = new Set(graph.hideTree ? [] : (graph.tree ?? []));
  const showTree = !graph.hideTree && !!graph.tree?.length;
  return (
    <figure className="cgraph">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={tr('电路的有向图', 'directed graph of the circuit')}>
        <defs>
          <marker id="cg-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" orient="auto">
            <path d="M0,1 L10,5 L0,9 z" className="cgraph-head" />
          </marker>
        </defs>
        {(graph.cutsets ?? []).map((c, i) => {
          const pts = c.path.map((p) => P(p as V));
          return (
            <g key={`c${i}`}>
              <path d={closedCurve(pts)} className="cgraph-cut" />
              {c.name ? (
                <text x={pts[0][0] + 4} y={pts[0][1] - 4} className="cgraph-cutname">
                  {c.name.replace(/^([A-Za-z])(\d+)$/, '$1')}
                  {/^[A-Za-z]\d+$/.test(c.name) ? (
                    <tspan fontSize="0.75em" dy={3}>
                      {c.name.slice(1)}
                    </tspan>
                  ) : null}
                </text>
              ) : null}
            </g>
          );
        })}
        {graph.branches.map((b) => {
          const p0 = pos.get(b.from);
          const q0 = pos.get(b.to);
          if (!p0 || !q0) return null;
          const p = P(p0);
          const q = P(q0);
          const nrm = unit(left(sub(q, p)));
          const bend = (b.bend ?? 0) * S;
          const ctrl = add(mul(add(p, q), 0.5), mul(nrm, 2 * bend));
          const a = add(p, mul(unit(sub(ctrl, p)), R + 1));
          const z = add(q, mul(unit(sub(ctrl, q)), R + 1));
          const mid = add(mul(add(p, q), 0.5), mul(nrm, bend));
          const dir = unit(sub(q, p));
          const cls = showTree ? (tree.has(b.n) ? 'cgraph-tree' : 'cgraph-link') : 'cgraph-br';
          const lab = add(mid, mul(nrm, bend >= 0 ? 13 : -13));
          return (
            <g key={b.n}>
              <path d={`M${a[0]},${a[1]} Q${ctrl[0]},${ctrl[1]} ${z[0]},${z[1]}`} className={cls} />
              <line x1={mid[0] - dir[0] * 6} y1={mid[1] - dir[1] * 6} x2={mid[0] + dir[0] * 2} y2={mid[1] + dir[1] * 2} className="cgraph-arrow" markerEnd="url(#cg-arrow)" />
              <text x={lab[0]} y={lab[1] + 4} textAnchor="middle" className="cgraph-num">
                {b.n}
              </text>
            </g>
          );
        })}
        {graph.nodes.map((n) => {
          const [x, y] = P(n.at as V);
          const ref = n.name === graph.ref;
          return (
            <g key={n.name}>
              <circle cx={x} cy={y} r={R} className={ref ? 'cgraph-node cgraph-ref' : 'cgraph-node'} />
              <text x={x} y={y + 4} textAnchor="middle" className={ref ? 'cgraph-nodename cgraph-refname' : 'cgraph-nodename'}>
                {n.name}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        {tr('有向图：', 'Directed graph: ')}
        {tr(`结点 ${graph.ref} 为参考结点（实心）`, `node ${graph.ref} is the reference node (filled)`)}
        {showTree ? tr('；粗实线为树支，细虚线为连支', '; thick solid lines are tree branches, thin dashed lines are links') : ''}
        {graph.cutsets?.length ? tr('；点划闭合线为割集', '; dashed closed curves are cut-sets') : ''}
      </figcaption>
    </figure>
  );
}
