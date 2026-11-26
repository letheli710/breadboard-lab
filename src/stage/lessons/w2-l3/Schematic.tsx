// The two-mesh schematic every W2-L3 layer draws (circuits.ts has the topology): wires, the
// elements, the clockwise mesh-current arcs, the real branch currents as marching dashes (speed
// ∝ |I|, reversed when the current runs against its reference), and the overlays the layers
// switch on: shaded mesh windows, the outer loop, the supermesh cut with its amber outer path,
// the KCL arrows at node b, the shared-resistor decomposition and the edge-source lock badge.

import { useId, type PointerEvent, type ReactNode } from 'react';
import type { Circuit, El, Solution } from './circuits';
import { fmt } from './circuits';

export const W = 480;
export const H = 256;
const L = 60;
const M = 240;
const RX = 420;
const T = 56;
const B = 216;
const OFF = 12; // outer path offset
const WIN1: [number, number] = [150, 136];
const WIN2: [number, number] = [330, 136];

type Pt = [number, number];

export interface SchematicProps {
  c: Circuit;
  /** solution for the flows and the node-a bubble (null: hidden) */
  sol: Solution | null;
  /** element ids drawn lit */
  litEls: Set<string>;
  /** mesh windows drawn lit (arc and pane) */
  litMesh?: [boolean, boolean];
  /** shade both panes ("网孔" view) */
  panes?: boolean;
  /** draw the outer loop (violet, "回路但不是网孔") */
  outerLoop?: boolean;
  outerLit?: boolean;
  /** supermesh: the shared branch is cut (dimmed), the amber outer path runs */
  cut?: boolean;
  /** draw the amber outer path (also without the cut, as a preview) */
  superPath?: boolean;
  superLit?: boolean;
  /** KCL arrows at node b; `eq` is the constraint as text ("?" while it is not revealed) */
  kcl?: { eq: string } | null;
  kclLit?: boolean;
  /** the shared resistor's i1↓ / ↑i2 decomposition, with its net current text */
  split?: string | null;
  /** node-a potential bubble text */
  va?: string | null;
  vaLit?: boolean;
  /** edge-source lock badge */
  lock?: string | null;
  /** real-current dashes */
  flows?: boolean;
  /** stage hover id of an element / overlay (undefined: no hover link) */
  hoverOf?: (what: string) => string | undefined;
  onHover?: (id: string | null) => void;
  className?: string;
  label: string;
}

/** element geometry: centre and orientation */
interface Placed {
  e: El;
  x: number;
  y: number;
  v: boolean;
  branch: 'left' | 'mid' | 'right' | 'topL' | 'topR';
}

function place(c: Circuit): Placed[] {
  const col = (els: El[], x: number, branch: Placed['branch']): Placed[] => {
    const ys = els.length === 1 ? [136] : [104, 168];
    return els.map((e, k) => ({ e, x, y: ys[k], v: true, branch }));
  };
  return [
    ...col(c.left, L, 'left'),
    ...col(c.mid, M, 'mid'),
    ...col(c.right, RX, 'right'),
    { e: c.topL, x: (L + M) / 2, y: T, v: false, branch: 'topL' },
    { e: c.topR, x: (M + RX) / 2, y: T, v: false, branch: 'topR' },
  ];
}

const unit = (e: El) => (e.kind === 'R' ? 'Ω' : e.kind === 'V' ? 'V' : 'A');
const valueText = (e: El) => `${fmt(e.value)} ${unit(e)}${e.kind === 'I' ? (e.dir === 'up' ? ' ↑' : ' ↓') : ''}`;

function arc(cx: number, cy: number, r: number) {
  // clockwise on screen: from the left point over the top, ending at the lower left
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx - r / 2} ${(cy + r * 0.866).toFixed(1)}`;
}

export function Schematic(p: SchematicProps) {
  const uid = useId().replace(/:/g, '');
  const mk = (name: string) => `w23-${name}-${uid}`;
  const placed = place(p.c);
  const hov = (what: string) => {
    const id = p.hoverOf?.(what);
    if (!id || !p.onHover) return {};
    return {
      onPointerEnter: (ev: PointerEvent) => {
        if (ev.pointerType === 'mouse') p.onHover!(id);
      },
      onPointerLeave: () => p.onHover!(null),
      'data-hover': id,
    };
  };
  const s = p.sol;
  const midCut = !!p.cut;

  // real currents along each wire run, in their reference direction
  const runs: { pts: Pt[]; i: number; mid?: boolean }[] = s
    ? [
        {
          pts: [
            [L, B],
            [L, T],
            [M, T],
          ],
          i: s.i1,
        },
        {
          pts: [
            [M, T],
            [RX, T],
            [RX, B],
            [M, B],
          ],
          i: s.i2,
        },
        {
          pts: [
            [M, B],
            [L, B],
          ],
          i: s.i1,
        },
        {
          pts: [
            [M, T],
            [M, B],
          ],
          i: s.iMid,
          mid: true,
        },
      ]
    : [];

  const flowStyle = (i: number) => ({
    animationDuration: `${Math.min(6, Math.max(0.35, 2.6 / Math.abs(i))).toFixed(2)}s`,
    animationDirection: i < 0 ? ('reverse' as const) : ('normal' as const),
    strokeWidth: Math.min(5, 1.6 + Math.abs(i) * 0.45),
  });

  const body = (pl: Placed): ReactNode => {
    const { e, x, y, v } = pl;
    const lit = p.litEls.has(e.id);
    const cls = `w23-el kind-${e.kind} ${lit ? 'lit' : ''} ${e.series ? 'series' : ''}`;
    const inMid = pl.branch === 'mid';
    let shape: ReactNode;
    if (e.kind === 'R') shape = v ? <rect x={x - 8} y={y - 20} width={16} height={40} rx={3} /> : <rect x={x - 22} y={y - 8} width={44} height={16} rx={3} />;
    else if (e.kind === 'V')
      shape = (
        <>
          <circle cx={x} cy={y} r={16} />
          <text x={x} y={y - 3} className="w23-sign">
            +
          </text>
          <text x={x} y={y + 12} className="w23-sign">
            −
          </text>
        </>
      );
    else
      shape = (
        <>
          <circle cx={x} cy={y} r={16} />
          <line x1={x} y1={e.dir === 'up' ? y + 10 : y - 10} x2={x} y2={e.dir === 'up' ? y - 6 : y + 6} className="w23-src-arrow" markerEnd={`url(#${mk('src')})`} />
        </>
      );
    // labels: left branch to the left, the others to the right, top elements below the wire
    let lx: number;
    let anchor: 'start' | 'end' | 'middle';
    let ly: number;
    if (!v) {
      lx = x;
      anchor = 'middle';
      ly = y + 26;
    } else if (pl.branch === 'left') {
      lx = x - 24;
      anchor = 'end';
      ly = y;
    } else {
      lx = x + (inMid ? 32 : 24);
      anchor = 'start';
      ly = y;
    }
    return (
      <g key={e.id} className={cls} {...hov(`el:${e.id}`)} opacity={inMid && midCut ? (lit ? 0.6 : 0.25) : 1}>
        {v ? <rect x={x - 22} y={y - 24} width={44} height={48} className="w23-hit" /> : <rect x={x - 28} y={y - 14} width={56} height={28} className="w23-hit" />}
        {shape}
        {v ? (
          <>
            <text x={lx} y={ly - 3} textAnchor={anchor} className="w23-name">
              {e.name}
            </text>
            <text x={lx} y={ly + 12} textAnchor={anchor} className="w23-val">
              {valueText(e)}
            </text>
          </>
        ) : (
          <text x={lx} y={ly} textAnchor={anchor} className="w23-name">
            {e.name} = {valueText(e)}
          </text>
        )}
      </g>
    );
  };

  const [l1, l2] = p.litMesh ?? [false, false];
  const pane = (k: 0 | 1, on: boolean) => (
    <rect
      x={k === 0 ? L + 6 : M + 6}
      y={T + 6}
      width={M - L - 12}
      height={B - T - 12}
      rx={8}
      className={`w23-pane ${on ? 'lit' : ''} ${p.panes ? 'shown' : ''}`}
      {...hov(k === 0 ? 'pane1' : 'pane2')}
    />
  );
  const outer = `M ${L - OFF} ${B + OFF} L ${L - OFF} ${T - OFF} L ${RX + OFF} ${T - OFF} L ${RX + OFF} ${B + OFF} L ${L + 4} ${B + OFF}`;

  return (
    <svg className={`w23-svg ${p.className ?? ''}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={p.label}>
      <defs>
        <marker id={mk('mesh')} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,1 L9,5 L0,9 Z" className="w23-mk-mesh" />
        </marker>
        <marker id={mk('src')} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,1 L9,5 L0,9 Z" className="w23-mk-src" />
        </marker>
        <marker id={mk('amber')} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,1 L9,5 L0,9 Z" className="w23-mk-amber" />
        </marker>
        <marker id={mk('rose')} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,1 L9,5 L0,9 Z" className="w23-mk-rose" />
        </marker>
        <marker id={mk('green')} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,1 L9,5 L0,9 Z" className="w23-mk-green" />
        </marker>
      </defs>
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="10" className="w23-bg" />

      {/* panes (mesh windows) */}
      {pane(0, l1)}
      {pane(1, l2)}
      {p.panes && (
        <>
          <text x={L + 14} y={T + 22} className="w23-pane-label">
            网孔 1
          </text>
          <text x={M + 14} y={T + 22} className="w23-pane-label">
            网孔 2
          </text>
        </>
      )}

      {/* outer loop / supermesh path */}
      {p.outerLoop && (
        <g {...hov('outer')}>
          <path d={`M ${L - OFF} ${T - OFF} H ${RX + OFF} V ${B + OFF} H ${L - OFF} Z`} className={`w23-outer ${p.outerLit ? 'lit' : ''}`} />
          <path d={`M ${L - OFF} ${T - OFF} H ${RX + OFF} V ${B + OFF} H ${L - OFF} Z`} className="w23-outer-hit" />
          <text x={M} y={T - OFF - 6} className="w23-outer-label">
            大外环 = 回路 (Loop)，但不是网孔 (Mesh)
          </text>
        </g>
      )}
      {(p.superPath || midCut) && (
        <g {...hov('super')}>
          <path d={outer} className={`w23-super ${midCut ? 'run' : ''} ${p.superLit ? 'lit' : ''}`} markerEnd={`url(#${mk('amber')})`} />
          <path d={outer} className="w23-outer-hit" />
          <text x={(L + M) / 2} y={T - OFF - 6} className="w23-super-label">
            超网孔大外环 KVL（顺时针）
          </text>
        </g>
      )}

      {/* wires */}
      <g className="w23-wires">
        <polyline points={`${M},${T} ${L},${T} ${L},${B} ${M},${B}`} />
        <polyline points={`${M},${T} ${RX},${T} ${RX},${B} ${M},${B}`} />
        <line x1={M} y1={T} x2={M} y2={B} className={midCut ? 'cut' : ''} opacity={midCut ? 0.35 : 1} />
      </g>

      {/* real branch currents */}
      {p.flows &&
        runs.map((r, k) =>
          Math.abs(r.i) < 1e-6 || (r.mid && midCut) ? null : (
            <polyline key={k} points={r.pts.map((q) => q.join(',')).join(' ')} className="w23-flow" style={flowStyle(r.i)} aria-hidden />
          ),
        )}

      {/* nodes a, b */}
      <g className={`w23-node ${p.vaLit ? 'lit' : ''}`} {...hov('node-a')}>
        <circle cx={M} cy={T} r={10} className="w23-node-hit" />
        <circle cx={M} cy={T} r={4.5} className="w23-node-dot" />
        <text x={M - 9} y={T - 6} textAnchor="end" className="w23-node-label">
          a
        </text>
      </g>
      <g className={`w23-node ${p.kclLit ? 'lit kcl' : ''}`} {...hov('node-b')}>
        <circle cx={M} cy={B} r={10} className="w23-node-hit" />
        <circle cx={M} cy={B} r={4.5} className="w23-node-dot" />
        <text x={M} y={B + OFF + 16} className="w23-node-b">
          {p.kcl ? `节点 b：${p.kcl.eq}` : '节点 b（参考 0 V）'}
        </text>
      </g>

      {/* elements */}
      {placed.map(body)}

      {/* clockwise mesh currents */}
      {(
        [
          [WIN1, 'i₁', l1, 'mesh1'],
          [WIN2, 'i₂', l2, 'mesh2'],
        ] as const
      ).map(([[cx, cy], name, on, what]) => (
        <g key={what} className={`w23-mesh ${on ? 'lit' : ''}`} {...hov(what)}>
          <circle cx={cx} cy={cy} r={30} className="w23-hit" />
          <path d={arc(cx, cy, 22)} markerEnd={`url(#${mk('mesh')})`} />
          <text x={cx} y={cy + 6}>
            {name}
          </text>
        </g>
      ))}

      {/* shared resistor: i1 down on its left, i2 up on its right */}
      {p.split && (
        <g className="w23-split" aria-hidden>
          <line x1={M - 18} y1={112} x2={M - 18} y2={160} className="amber" markerEnd={`url(#${mk('amber')})`} />
          <text x={M - 24} y={140} textAnchor="end" className="amber">
            i₁↓
          </text>
          <line x1={M + 18} y1={160} x2={M + 18} y2={112} className="rose" markerEnd={`url(#${mk('rose')})`} />
          <text x={M + 24} y={108} className="rose">
            ↑i₂
          </text>
          <rect x={M - 122} y={176} width={244} height={22} rx={6} className="w23-chip" />
          <text x={M} y={191} className="w23-chip-text">
            {p.split}
          </text>
        </g>
      )}

      {/* KCL at node b: i1 leaves to the left, i2 comes in from the right */}
      {p.kcl && (
        <g className={`w23-kcl ${p.kclLit ? 'lit' : ''}`} aria-hidden>
          <line x1={M - 10} y1={B - 10} x2={M - 46} y2={B - 10} markerEnd={`url(#${mk('green')})`} />
          <text x={M - 28} y={B - 16}>
            i₁
          </text>
          <line x1={M + 46} y1={B - 10} x2={M + 10} y2={B - 10} markerEnd={`url(#${mk('green')})`} />
          <text x={M + 28} y={B - 16}>
            i₂
          </text>
        </g>
      )}

      {/* node-a potential */}
      {p.va && (
        <g className={`w23-va ${p.vaLit ? 'lit' : ''}`}>
          <line x1={M + 3} y1={T - 4} x2={M + 22} y2={T - 16} />
          <rect x={M + 10} y={T - 36} width={96} height={20} rx={10} />
          <text x={M + 58} y={T - 22}>
            {p.va}
          </text>
        </g>
      )}

      {/* edge-source lock */}
      {p.lock && (
        <g className="w23-lock">
          <rect x={(M + RX) / 2 - 84} y={176} width={168} height={22} rx={6} />
          <text x={(M + RX) / 2} y={191}>
            {p.lock}
          </text>
        </g>
      )}
    </svg>
  );
}

/** K₃,₃: three top nodes each wired to three bottom nodes; two crossings can never be removed. */
export function K33({ lit, onHover }: { lit: boolean; onHover?: (id: string | null) => void }) {
  const tops = [140, 240, 340];
  const y1 = 60;
  const y2 = 176;
  return (
    <svg className="w23-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="非平面电路反例 K₃,₃：总有导线交叉">
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="10" className="w23-bg" />
      <g
        className={`w23-k33 ${lit ? 'lit' : ''}`}
        onPointerEnter={(ev) => ev.pointerType === 'mouse' && onHover?.('nonplanar_k33')}
        onPointerLeave={() => onHover?.(null)}
        data-hover="nonplanar_k33"
      >
        <rect x={60} y={24} width={360} height={190} rx={12} className="w23-k33-box" />
        <text x={240} y={44} className="w23-k33-title">
          非平面电路反例 K₃,₃（不可用网孔法）
        </text>
        {tops.map((x) => tops.map((x2) => <line key={`${x}-${x2}`} x1={x} y1={y1} x2={x2} y2={y2} />))}
        <circle cx={190} cy={118} r={9} className="w23-k33-x" />
        <circle cx={290} cy={118} r={9} className="w23-k33-x" />
        {tops.map((x) => (
          <g key={x}>
            <circle cx={x} cy={y1} r={5} className="w23-k33-node" />
            <circle cx={x} cy={y2} r={5} className="w23-k33-node" />
          </g>
        ))}
        <text x={240} y={198} className="w23-k33-note">
          无论如何重画，总存在无法消除的导线交叉
        </text>
      </g>
      <text x={240} y={238} className="w23-k33-foot">
        无法定义清晰“窗格” → 请改用节点电压法
      </text>
    </svg>
  );
}
