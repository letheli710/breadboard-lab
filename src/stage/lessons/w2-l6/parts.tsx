// Schematic pieces shared by W2-L6's three layers, drawn in the lesson sheet's style (zig-zag
// resistors, round independent sources, diamond dependent sources) for the light stage:
// resistors, sources, ports, the red isolation box, a lock glyph, a tween hook and hover
// handlers that light an id on the stage and in the text.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { useStage } from '../../stageStore';

export type Pt = [number, number];

/** Pointer handlers that light `id` (stage object ⟷ linked term in the text). */
export function hov(id: string | undefined) {
  if (!id) return {};
  return {
    onPointerEnter: () => useStage.getState().setHover([id]),
    onPointerLeave: () => useStage.getState().setHover(null),
  };
}

/** Clear a hover the layer set when it unmounts (a vanished element gets no pointerleave). */
export function useClearHoverOnUnmount() {
  useEffect(() => () => useStage.getState().setHover(null), []);
}

const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

/** `target` eased over `ms`; reduced motion jumps straight there. */
export function useTween(target: number, ms = 520): number {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current;
    let raf = 0;
    const t0 = performance.now();
    const dur = prefersReducedMotion() || from === target ? 0 : ms;
    const tick = (now: number) => {
      const k = dur === 0 ? 1 : Math.min(1, (now - t0) / dur);
      cur.current = from + (target - from) * ease(k);
      setV(cur.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/** A shake that replays on every call (for the red-box guard). */
export function useShake(): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  return [
    on,
    () => {
      setOn(false);
      window.clearTimeout(t.current);
      requestAnimationFrame(() => {
        setOn(true);
        t.current = window.setTimeout(() => setOn(false), 2600);
      });
    },
  ];
}

/** zig-zag points from p to q (axis-aligned), 6 teeth, amplitude `amp` */
export function zigPoints(p: Pt, q: Pt, amp = 7, teeth = 6): string {
  const vertical = p[0] === q[0];
  const len = vertical ? q[1] - p[1] : q[0] - p[0];
  const pts: Pt[] = [p];
  for (let k = 0; k < teeth; k++) {
    const s = (len * (k + 0.5)) / teeth;
    const side = k % 2 === 0 ? -amp : amp;
    pts.push(vertical ? [p[0] + side, p[1] + s] : [p[0] + s, p[1] + side]);
  }
  pts.push(q);
  return pts.map((x) => `${x[0].toFixed(1)},${x[1].toFixed(1)}`).join(' ');
}

export type Tone = 'r' | 'target' | 'fresh' | 'blue';

/** A resistor from p to q with leads; `body` is the zig-zag length centred between them. */
export function Res({ p, q, body = 40, tone = 'r', lit, cls = '' }: { p: Pt; q: Pt; body?: number; tone?: Tone; lit?: boolean; cls?: string }) {
  const vertical = p[0] === q[0];
  const mid = vertical ? (p[1] + q[1]) / 2 : (p[0] + q[0]) / 2;
  const a: Pt = vertical ? [p[0], mid - body / 2] : [mid - body / 2, p[1]];
  const b: Pt = vertical ? [p[0], mid + body / 2] : [mid + body / 2, p[1]];
  return (
    <g className={`w6-res ${tone} ${lit ? 'lit' : ''} ${cls}`}>
      <line x1={p[0]} y1={p[1]} x2={a[0]} y2={a[1]} className="w6-wire" />
      <line x1={b[0]} y1={b[1]} x2={q[0]} y2={q[1]} className="w6-wire" />
      <polyline points={zigPoints(a, b)} className="w6-zig" />
    </g>
  );
}

/** An arrowhead (filled triangle) at `tip`, pointing along +y (`down`) or −y. */
export function Head({ x, y, down, size = 6, cls = '' }: { x: number; y: number; down: boolean; size?: number; cls?: string }) {
  const s = down ? 1 : -1;
  return <polygon points={`${x},${y} ${x - size * 0.8},${y - s * size * 1.4} ${x + size * 0.8},${y - s * size * 1.4}`} className={`w6-head ${cls}`} />;
}

/** An independent (circle) or dependent (diamond) source body at c; `plus` marks a voltage source,
 *  `arrow` a current source; `mix` (0…1) cross-fades voltage → current marks for the morph. */
export function Source({
  c,
  r = 17,
  plus,
  arrow,
  dep,
  tone,
  lit,
  mix,
}: {
  c: Pt;
  r?: number;
  plus?: 'up' | 'down';
  arrow?: 'up' | 'down';
  dep?: boolean;
  tone: 'v' | 'ok' | 'bad';
  lit?: boolean;
  mix?: number;
}) {
  const [x, y] = c;
  const vOp = mix === undefined ? (plus ? 1 : 0) : 1 - mix;
  const iOp = mix === undefined ? (arrow ? 1 : 0) : mix;
  const pUp = (plus ?? arrow ?? 'up') === 'up';
  const aDown = (arrow ?? plus ?? 'up') === 'down';
  const al = r * 0.62;
  return (
    <g className={`w6-src ${tone} ${lit ? 'lit' : ''}`}>
      {dep ? (
        <polygon points={`${x},${y - r - 3} ${x + r + 3},${y} ${x},${y + r + 3} ${x - r - 3},${y}`} className="w6-src-body" />
      ) : (
        <circle cx={x} cy={y} r={r} className="w6-src-body" />
      )}
      {vOp > 0.01 && (
        <g opacity={vOp}>
          <text x={x} y={y - r * 0.28} className={`w6-sign ${pUp ? 'plus' : ''}`}>
            {pUp ? '+' : '−'}
          </text>
          <text x={x} y={y + r * 0.72} className={`w6-sign ${pUp ? '' : 'plus'}`}>
            {pUp ? '−' : '+'}
          </text>
        </g>
      )}
      {iOp > 0.01 && (
        <g opacity={iOp}>
          <line x1={x} y1={aDown ? y - al : y + al} x2={x} y2={aDown ? y + al - 6 : y - al + 6} className="w6-arrow" />
          <Head x={x} y={aDown ? y + al + 2 : y - al - 2} down={aDown} size={5} cls="src" />
        </g>
      )}
    </g>
  );
}

/** A port terminal (hollow ring) with its name. */
export function Port({ at, name, side = 'right', lit, id }: { at: Pt; name: string; side?: 'right' | 'left'; lit?: boolean; id?: string }) {
  return (
    <g className={`w6-port ${lit ? 'lit' : ''}`} {...hov(id)}>
      <circle cx={at[0]} cy={at[1]} r={lit ? 9 : 0} className="w6-port-glow" />
      <circle cx={at[0]} cy={at[1]} r={4.5} className="w6-port-ring" />
      <text x={at[0] + (side === 'right' ? 9 : -9)} y={at[1] + 4} className={`w6-port-name ${side}`}>
        {name}
      </text>
    </g>
  );
}

/** A small padlock (drawn, not an emoji). */
export function Lock({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g className="w6-lock" transform={`translate(${x} ${y}) scale(${s})`} aria-hidden>
      <path d="M -3.2 -1 V -3.6 A 3.2 3.2 0 0 1 3.2 -3.6 V -1" className="w6-lock-shackle" />
      <rect x={-4.6} y={-1.2} width={9.2} height={7.2} rx={1.4} className="w6-lock-body" />
    </g>
  );
}

/** The red isolation box (dashed), optional caption, shaking when the guard fires. */
export function RedBox({
  x,
  y,
  w,
  h,
  lit,
  shake,
  label,
  id = 'red_box',
  onClick,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  lit?: boolean;
  shake?: boolean;
  label?: string;
  id?: string;
  onClick?: () => void;
  children?: ReactNode;
}) {
  return (
    <g
      className={`w6-redbox ${lit ? 'lit' : ''} ${shake ? 'shake' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? '红框隔离区（锁定）' : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) : undefined}
      {...hov(id)}
    >
      <rect x={x} y={y} width={w} height={h} rx={6} className="w6-redbox-rect" />
      {children}
      {label && (
        <g>
          <Lock x={x + 9} y={y + 10} s={0.95} />
          <text x={x + 17} y={y + 13.5} className="w6-redbox-label">
            {label}
          </text>
        </g>
      )}
    </g>
  );
}
