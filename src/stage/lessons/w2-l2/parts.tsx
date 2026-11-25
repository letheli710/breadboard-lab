// Drawing kit of the W2-L2 schematics (light theme, classes in w2l2.css): resistor zig-zags,
// sources, the CCVS diamond, ground, current arrows, and stage objects — a <g> that lights up when
// one of its ids is lit and points the stage at its id on hover / focus. Plus the control widgets
// (switch, segmented buttons) the three layers share.

import { useEffect, type ReactNode } from 'react';
import { useStage } from '../../stageStore';
import './w2l2.css';

export type P = [number, number];

/** hover link for a stage object (mouse and pen only: a tap would resize the pointing bar under the finger) */
export function hov(ids: string[] | undefined) {
  if (!ids?.length) return {};
  const set = useStage.getState().setHover;
  return {
    onPointerEnter: (e: { pointerType: string }) => {
      if (e.pointerType !== 'touch') set(ids);
    },
    onPointerLeave: () => set(null),
    onFocus: () => set(ids),
    onBlur: () => set(null),
  };
}

/** Clear a hover left behind when a layer unmounts under the pointer. */
export function useClearHoverOnUnmount() {
  useEffect(() => () => useStage.getState().setHover(null), []);
}

/** A stage object: lit when `id` or one of `also` is lit. */
export function Obj({ id, also, lit, label, className = '', children }: { id: string; also?: string[]; lit: string[]; label: string; className?: string; children: ReactNode }) {
  const on = lit.includes(id) || !!also?.some((a) => lit.includes(a));
  return (
    <g className={`w22-obj ${className} ${on ? 'lit' : ''}`} tabIndex={0} role="img" aria-label={label} {...hov([id])}>
      {children}
    </g>
  );
}

/** zig-zag points from a to b (n half-waves, amplitude amp) */
export function zig(a: P, b: P, n = 6, amp = 9): string {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const lead = 5;
  const pts: string[] = [`${x1},${y1}`, `${x1 + ux * lead},${y1 + uy * lead}`];
  for (let k = 0; k < n; k++) {
    const t = lead + ((k + 0.5) / n) * (len - 2 * lead);
    const s = k % 2 === 0 ? amp : -amp;
    pts.push(`${(x1 + ux * t - uy * s).toFixed(1)},${(y1 + uy * t + ux * s).toFixed(1)}`);
  }
  pts.push(`${x2 - ux * lead},${y2 - uy * lead}`, `${x2},${y2}`);
  return pts.join(' ');
}

export function Wire({ pts, dashed }: { pts: P[]; dashed?: boolean }) {
  return <polyline points={pts.map((p) => p.join(',')).join(' ')} className={`w22-wire ${dashed ? 'dashed' : ''}`} />;
}

export function Zig({ a, b, cls = 'w22-res' }: { a: P; b: P; cls?: string }) {
  const pts = zig(a, b);
  return (
    <>
      <polyline points={pts} className="w22-hit" />
      <polyline points={pts} className={cls} />
    </>
  );
}

/** a voltage source circle; `plus` is the side of the + terminal */
export function VSrc({ c, r = 22, plus }: { c: P; r?: number; plus: 'up' | 'down' | 'left' | 'right' }) {
  const [x, y] = c;
  const d = r * 0.45;
  const pos: Record<string, P> = { up: [x, y - d], down: [x, y + d], left: [x - d, y], right: [x + d, y] };
  const opp = { up: 'down', down: 'up', left: 'right', right: 'left' } as const;
  const [px, py] = pos[plus];
  const [mx, my] = pos[opp[plus]];
  return (
    <>
      <circle cx={x} cy={y} r={r} className="w22-vs" />
      <text x={px} y={py + 5.5} className="w22-sign plus">
        +
      </text>
      <text x={mx} y={my + 5.5} className="w22-sign minus">
        −
      </text>
    </>
  );
}

/** a current source circle with its arrow (up or down) */
export function ISrc({ c, r = 22, dir }: { c: P; r?: number; dir: 'up' | 'down' }) {
  const [x, y] = c;
  const s = dir === 'up' ? -1 : 1;
  return (
    <>
      <circle cx={x} cy={y} r={r} className="w22-isrc" />
      <Arrow from={[x, y - s * (r - 7)]} to={[x, y + s * (r - 7)]} cls="w22-isrc-arrow" />
    </>
  );
}

/** the dependent (diamond) source, + on the left */
export function Diamond({ c, h = 26 }: { c: P; h?: number }) {
  const [x, y] = c;
  return (
    <>
      <polygon points={`${x},${y - h} ${x + h},${y} ${x},${y + h} ${x - h},${y}`} className="w22-dep" />
      <text x={x - h * 0.45} y={y + 5.5} className="w22-sign plus">
        +
      </text>
      <text x={x + h * 0.45} y={y + 5.5} className="w22-sign minus">
        −
      </text>
    </>
  );
}

/** ground symbol hanging from (0, 0); place it with `at` (a CSS transform, so a move animates) */
export function Ground({ at, label }: { at: P; label?: string }) {
  return (
    <g className="w22-gnd" style={{ transform: `translate(${at[0]}px, ${at[1]}px)` }}>
      <line x1={0} y1={0} x2={0} y2={14} />
      <line x1={-15} y1={14} x2={15} y2={14} />
      <line x1={-9} y1={21} x2={9} y2={21} />
      <line x1={-4} y1={28} x2={4} y2={28} />
      {label && (
        <text x={22} y={26} className="w22-gnd-label">
          {label}
        </text>
      )}
    </g>
  );
}

/** a straight arrow with a drawn head (no markers: several copies of a layer may be on a page) */
export function Arrow({ from, to, cls = '' }: { from: P; to: P; cls?: string }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const hl = 8;
  const hw = 4.5;
  const bx = x2 - ux * hl;
  const by = y2 - uy * hl;
  const head = `${x2},${y2} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}`;
  return (
    <g className={`w22-arrow ${cls}`}>
      <line x1={x1} y1={y1} x2={bx} y2={by} />
      <polygon points={head} />
    </g>
  );
}

export function Dot({ c }: { c: P }) {
  return <circle cx={c[0]} cy={c[1]} r={5.5} className="w22-dot" />;
}

export function Txt({ x, y, cls = '', anchor = 'middle', children }: { x: number; y: number; cls?: string; anchor?: 'start' | 'middle' | 'end'; children: ReactNode }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={`w22-t ${cls}`}>
      {children}
    </text>
  );
}

/* ------------------------------------------------------------- controls */

export function Switch({ on, onChange, children, tone = '', hoverIds }: { on: boolean; onChange: (v: boolean) => void; children: ReactNode; tone?: string; hoverIds?: string[] }) {
  return (
    <button className={`w22-switch ${tone} ${on ? 'on' : ''}`} role="switch" aria-checked={on} onClick={() => onChange(!on)} {...hov(hoverIds)}>
      <span className="knob" aria-hidden />
      <span className="w22-switch-text">{children}</span>
    </button>
  );
}

export function Seg<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { v: T; long: string; short: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="w22-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.v} role="radio" aria-checked={value === o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>
          <span className="long">{o.long}</span>
          <span className="short">{o.short}</span>
        </button>
      ))}
    </div>
  );
}
