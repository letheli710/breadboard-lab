// W2-L1 stage parts shared by the three layers: the stage params, the schematic (wires coloured
// per node, resistors, current sources, the CCCS diamond, ground and node badges, hover links),
// current arrows and bubbles, the dock controls and the hidden-info drawer.
//
// Stage params (all set by the acts, the guided steps and the dock):
//   w21_layer   layer the lesson wants (a guided step moves the stage with it, see useLayerFollow)
//   w21_circuit generic | warmup | core | cccs        w21_ref   reference node (v0 = bottom bus)
//   w21_reveal  layer 01 shows the solved potentials   w21_stand layer 02: the node we stand on
//   w21_sym     layer 02: letters instead of numbers   w21_dual  layer 02: both views of a shared R
//   w21_eq      layer 02: the assembled KCL equation   w21_solve layer 03: solver step 0 … 4

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { CIRCUITS, CIRCUIT_ORDER, NODE_COLOR, NODE_ID, NODE_UNI, REF_COLOR, type Circuit, type CircuitId, type Elem, type NodeId, type Pos, type Pt } from './model';
import './w2l1.css';

export const L1 = 'layer_01_nodes_and_ref';
export const L2 = 'layer_02_kcl_translation';
export const L3 = 'layer_03_equation_solver';

/* ------------------------------------------------------------- params */

export function useW21() {
  const [circuitId, setCircuit] = useStageParam<CircuitId>('w21_circuit', 'core');
  const c = CIRCUITS[circuitId] ?? CIRCUITS.core;
  const [refRaw, setRef] = useStageParam<NodeId>('w21_ref', 'v0');
  const ref = c.nodes.includes(refRaw) ? refRaw : 'v0';
  const [standRaw, setStand] = useStageParam<NodeId>('w21_stand', 'v1');
  const free = c.nodes.filter((n) => n !== ref);
  const stand = free.includes(standRaw) ? standRaw : free[0];
  const [reveal, setReveal] = useStageParam('w21_reveal', false);
  const [sym, setSym] = useStageParam('w21_sym', false);
  const [dual, setDual] = useStageParam('w21_dual', false);
  const [eq, setEq] = useStageParam('w21_eq', true);
  const [solve, setSolve] = useStageParam('w21_solve', 0);
  return { c, circuitId, setCircuit, ref, setRef, free, stand, setStand, reveal, setReveal, sym: sym || !c.numeric, setSym, dual, setDual, eq, setEq, solve, setSolve };
}

/**
 * A guided step can only set params, not the layer: it sets `w21_layer`, and the layer on the
 * stage hands over to that one (unless the student picked a lens by hand). Every act sets
 * `w21_layer` to its own layer, so scrolling never fights this.
 */
export function useLayerFollow() {
  const want = useStage((s) => s.params.w21_layer) as string | undefined;
  useEffect(() => {
    const s = useStage.getState();
    if (!want || s.manual || s.layer === want) return;
    useStage.setState({ layer: want });
  }, [want]);
}

/** hover link of a stage object */
export function hoverProps(ids: string[]) {
  return {
    onPointerEnter: () => useStage.getState().setHover(ids),
    onPointerLeave: () => useStage.getState().setHover(null),
  };
}

/* ------------------------------------------------------------- geometry */

const sub = (p: Pt, q: Pt): Pt => [p[0] - q[0], p[1] - q[1]];
const len = (p: Pt) => Math.hypot(p[0], p[1]);
const along = (p: Pt, q: Pt, t: number): Pt => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
export const mid = (e: Elem): Pt => along(e.pa, e.pb, 0.5);
const pts = (ps: Pt[]) => ps.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/** text width estimate (CJK wide) for bubbles and badges */
export function textW(s: string, size = 13): number {
  let w = 0;
  for (const ch of s) w += /[　-鿿＀-￯]/.test(ch) ? size : size * 0.58;
  return w;
}

/** body ends of an element along its axis */
function bodyEnds(e: Elem): [Pt, Pt] {
  const span = len(sub(e.pb, e.pa));
  const L = e.kind === 'R' ? Math.min(span, e.body ?? span) : e.kind === 'I' ? 44 : 58;
  const t = (1 - L / span) / 2;
  return [along(e.pa, e.pb, t), along(e.pa, e.pb, 1 - t)];
}

function zigzag(s: Pt, t: Pt): string {
  const d = sub(t, s);
  const L = len(d);
  const u: Pt = [d[0] / L, d[1] / L];
  const nrm: Pt = [-u[1], u[0]];
  const out: Pt[] = [s];
  const k = 7;
  for (let i = 1; i < k; i++) {
    const a = (i - 0.5) / (k - 1);
    const sgn = i % 2 ? 1 : -1;
    const base = along(s, t, Math.min(1, Math.max(0, a)));
    out.push([base[0] + nrm[0] * 10 * sgn, base[1] + nrm[1] * 10 * sgn]);
  }
  out.push(t);
  return pts(out);
}

/** a straight arrow, head at `to` */
export function Arrow({ from, to, color, className, width = 2.4 }: { from: Pt; to: Pt; color: string; className?: string; width?: number }) {
  const d = sub(to, from);
  const L = len(d) || 1;
  const u: Pt = [d[0] / L, d[1] / L];
  const n: Pt = [-u[1], u[0]];
  const h = 9;
  const base: Pt = [to[0] - u[0] * h, to[1] - u[1] * h];
  const head = [to, [base[0] + n[0] * 5, base[1] + n[1] * 5], [base[0] - n[0] * 5, base[1] - n[1] * 5]] as Pt[];
  return (
    <g className={className}>
      <line x1={from[0]} y1={from[1]} x2={base[0]} y2={base[1]} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={pts(head)} fill={color} />
    </g>
  );
}

/** the arrow beside an element, running away from node `from` */
export function arrowBeside(e: Elem, from: NodeId, flip = false): [Pt, Pt] {
  const [s, t] = e.kind === 'R' && e.body ? bodyEnds(e) : [along(e.pa, e.pb, 0.2), along(e.pa, e.pb, 0.8)];
  const horiz = Math.abs(e.pa[1] - e.pb[1]) < 1;
  const side = flip ? -e.side : e.side;
  const off: Pt = horiz ? [0, side * 22] : [side * 22, 0];
  let a: Pt = [s[0] + off[0], s[1] + off[1]];
  let b: Pt = [t[0] + off[0], t[1] + off[1]];
  if (horiz) {
    a = [a[0] + 12, a[1]];
    b = [b[0] - 12, b[1]];
  } else {
    a = [a[0], a[1] + 4];
    b = [b[0], b[1] - 4];
  }
  return from === e.a ? [a, b] : [b, a];
}

/** a rounded label box */
export function Bubble({ at, text, color, bg = '#ffffff', size = 12.5, className }: { at: Pos; text: string; color: string; bg?: string; size?: number; className?: string }) {
  const w = textW(text, size) + 14;
  const h = size + 10;
  const x = at[2] === 'start' ? at[0] : at[2] === 'end' ? at[0] - w : at[0] - w / 2;
  return (
    <g className={className}>
      <rect x={x} y={at[1] - h / 2} width={w} height={h} rx={7} fill={bg} stroke={color} strokeWidth={1.4} />
      <text x={x + w / 2} y={at[1] + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={700} fill={color}>
        {text}
      </text>
    </g>
  );
}

function Ground({ at, color }: { at: Pt; color: string }) {
  const [x, y] = at;
  return (
    <g className="w21-gnd" stroke={color} strokeWidth={2.5} strokeLinecap="round">
      <line x1={x} y1={y} x2={x} y2={y + 18} />
      <line x1={x - 18} y1={y + 18} x2={x + 18} y2={y + 18} />
      <line x1={x - 12} y1={y + 25} x2={x + 12} y2={y + 25} />
      <line x1={x - 6} y1={y + 32} x2={x + 6} y2={y + 32} />
    </g>
  );
}

/* ------------------------------------------------------------- the schematic */

export interface BadgeSpec {
  text: string;
  color: string;
  bg: string;
}

const INK = '#334155';

function ElemShape({ e, lit, dim, wire, label }: { e: Elem; lit: boolean; dim: boolean; wire: (n: NodeId) => string; label: string }) {
  const [s, t] = bodyEnds(e);
  const m = mid(e);
  const cls = `w21-el ${lit ? 'lit' : ''} ${dim ? 'dim' : ''}`;
  const d = sub(e.pb, e.pa);
  const u: Pt = [d[0] / len(d), d[1] / len(d)];
  const arrowIn: [Pt, Pt] = [
    [m[0] - u[0] * 13, m[1] - u[1] * 13],
    [m[0] + u[0] * 13, m[1] + u[1] * 13],
  ];
  return (
    <g className={cls} data-hl={e.id} {...hoverProps([e.id])}>
      <polyline points={pts([e.pa, s])} className="w21-lead" stroke={wire(e.a)} />
      <polyline points={pts([t, e.pb])} className="w21-lead" stroke={wire(e.b)} />
      {e.kind === 'R' && (
        <>
          <polyline points={zigzag(s, t)} className="w21-hit" />
          <polyline points={zigzag(s, t)} className="w21-body" />
        </>
      )}
      {e.kind === 'I' && (
        <>
          <circle cx={m[0]} cy={m[1]} r={22} className="w21-src" />
          <Arrow from={arrowIn[0]} to={arrowIn[1]} color={lit ? '#b45309' : '#b91c1c'} width={2.5} />
        </>
      )}
      {e.kind === 'CCCS' && (
        <>
          <polygon
            points={pts([
              [m[0], m[1] - 29],
              [m[0] + 27, m[1]],
              [m[0], m[1] + 29],
              [m[0] - 27, m[1]],
            ])}
            className="w21-dep"
          />
          <Arrow from={arrowIn[0]} to={arrowIn[1]} color={lit ? '#b45309' : '#6d28d9'} width={2.5} />
        </>
      )}
      <text x={e.lab[0]} y={e.lab[1]} textAnchor={e.lab[2]} className={`w21-elabel ${e.kind === 'CCCS' ? 'dep' : e.kind === 'I' ? 'src' : ''}`}>
        {label}
      </text>
    </g>
  );
}

export function Schematic({
  c,
  refNode,
  wire,
  badge,
  dim,
  label,
  onNode,
  showIx = true,
  ariaLabel,
  children,
  under,
}: {
  c: Circuit;
  refNode: NodeId;
  /** wire colour of a node */
  wire: (n: NodeId) => string;
  badge: (n: NodeId) => BadgeSpec | null;
  /** elements drawn faded */
  dim?: (e: Elem) => boolean;
  label?: (e: Elem) => string;
  onNode?: (n: NodeId) => void;
  showIx?: boolean;
  ariaLabel: string;
  /** drawn on top (arrows, bubbles) */
  children?: ReactNode;
  /** drawn under the elements (flow animation) */
  under?: ReactNode;
}) {
  const lit = useLit();
  return (
    <svg className="w21-svg" viewBox="0 0 680 340" role="img" aria-label={ariaLabel} preserveAspectRatio="xMidYMid meet">
      <rect x="1" y="1" width="678" height="338" rx="12" className="w21-canvas" />
      {c.nodes.map((n) => {
        const on = lit.includes(NODE_ID[n]);
        return (
          <g
            key={n}
            className={`w21-node ${on ? 'lit' : ''} ${onNode ? 'pick' : ''}`}
            data-hl={NODE_ID[n]}
            {...hoverProps([NODE_ID[n]])}
            onClick={onNode ? () => onNode(n) : undefined}
            style={{ color: wire(n) }}
          >
            {(c.wires[n] ?? []).map((w, i) => (
              <g key={i}>
                <polyline points={pts(w)} className="w21-wire-hit" />
                <polyline points={pts(w)} className="w21-wire" stroke={wire(n)} />
              </g>
            ))}
          </g>
        );
      })}
      {under}
      {c.elems.map((e) => (
        <ElemShape key={e.id} e={e} lit={lit.includes(e.id)} dim={!!dim?.(e)} wire={wire} label={label ? label(e) : e.uni} />
      ))}
      {showIx && c.ix && (
        <g className={`w21-ix ${lit.includes('ctrl_ix') ? 'lit' : ''}`} {...hoverProps(['ctrl_ix'])}>
          <Arrow from={c.ix.from} to={c.ix.to} color="#ea580c" width={2.5} />
          <text x={c.ix.lab[0]} y={c.ix.lab[1]} textAnchor={c.ix.lab[2]} className="w21-ixlabel">
            iₓ（控制量）
          </text>
        </g>
      )}
      {c.nodes.map((n) => {
        const g = c.gnd[n];
        return n === refNode && g ? <Ground key={`g${n}`} at={g} color={REF_COLOR} /> : null;
      })}
      {c.nodes.map((n) => {
        const b = badge(n);
        const at = c.badge[n];
        if (!b || !at) return null;
        const on = lit.includes(NODE_ID[n]);
        const w = textW(b.text, 13) + 18;
        return (
          <g
            key={`b${n}`}
            className={`w21-badge ${on ? 'lit' : ''} ${onNode ? 'pick' : ''}`}
            {...hoverProps([NODE_ID[n]])}
            onClick={onNode ? () => onNode(n) : undefined}
            role={onNode ? 'button' : undefined}
            aria-label={onNode ? `把${n === 'v0' ? '底部母线' : NODE_UNI[n]}设为参考地` : undefined}
          >
            <rect x={at[0] - w / 2} y={at[1] - 13} width={w} height={26} rx={13} fill={b.bg} stroke={b.color} strokeWidth={1.6} />
            <text x={at[0]} y={at[1] + 5} textAnchor="middle" fontSize={13} fontWeight={800} fill={b.color}>
              {b.text}
            </text>
          </g>
        );
      })}
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------- colours and badges */

const SOFT: Record<string, string> = {
  '#dc2626': '#fee2e2',
  '#2563eb': '#dbeafe',
  '#7c3aed': '#f3e8ff',
  '#0891b2': '#cffafe',
  '#16a34a': '#dcfce7',
};
const DEEP: Record<string, string> = {
  '#dc2626': '#b91c1c',
  '#2563eb': '#1d4ed8',
  '#7c3aed': '#6d28d9',
  '#0891b2': '#0e7490',
  '#16a34a': '#15803d',
};
/** node colour: the reference is green, the others keep their own colour */
export const nodeColor = (n: NodeId, ref: NodeId) => (n === ref ? REF_COLOR : NODE_COLOR[n]);
export const badgeOf = (text: string, color: string): BadgeSpec => ({ text, color: DEEP[color] ?? color, bg: SOFT[color] ?? '#ffffff' });
export const deep = (color: string) => DEEP[color] ?? color;
export const soft = (color: string) => SOFT[color] ?? '#ffffff';
export const GREY = '#94a3b8';
export { INK };

/* ------------------------------------------------------------- dock */

export function Seg<T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: { v: T; t: string; title?: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="w21-seg" role="radiogroup" aria-label={label}>
      <span className="w21-seg-label">{label}</span>
      {options.map((o) => (
        <button key={String(o.v)} role="radio" aria-checked={value === o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)} disabled={disabled} title={o.title}>
          {o.t}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, children, disabled }: { on: boolean; onChange: (v: boolean) => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button className={`w21-switch ${on ? 'on' : ''}`} role="switch" aria-checked={on} onClick={() => onChange(!on)} disabled={disabled}>
      <span className="knob" aria-hidden />
      {children}
    </button>
  );
}

export function CircuitPicker() {
  const { circuitId, setCircuit } = useW21();
  return (
    <Seg
      label="电路"
      value={circuitId}
      options={CIRCUIT_ORDER.map((id) => ({ v: id, t: CIRCUITS[id].name, title: CIRCUITS[id].title }))}
      onChange={(id) => {
        setCircuit(id);
      }}
    />
  );
}

/** the layer's exposed hidden information (lesson sheet: exposed_hidden_info) */
export function HiddenInfo({ items }: { items: ReactNode[] }) {
  return (
    <details className="w21-hidden">
      <summary>隐性信息 · {items.length} 条</summary>
      <ul>
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </details>
  );
}

/** "+15 V" */
export const signed = (x: number, unit = 'V') => `${x > 0 ? '+' : x < 0 ? '−' : ''}${String(+Math.abs(x).toFixed(3))} ${unit}`;
