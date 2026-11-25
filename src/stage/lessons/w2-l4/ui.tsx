// Small shared pieces of the W2-L4 layers: the size of the drawing area (each layer picks the
// arrangement of its panels that draws largest), a segmented control, a switch, the hover link
// (mouse hover goes through the stage store; a tap pins an id locally so touch screens get the
// same highlight without the hover bar jumping) and two schematic symbols.

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useLit, useStage } from '../../stageStore';
import './w2l4.css';

/** width and height of an element, kept up to date */
export function useBox<T extends HTMLElement>(): [React.RefObject<T>, { w: number; h: number }] {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box];
}

/** scale at which a viewBox of vw × vh fits the box */
export const fitScale = (box: { w: number; h: number }, vw: number, vh: number) => (box.w && box.h ? Math.min(box.w / vw, box.h / vh) : 0);

export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: [T, ReactNode][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="w24-seg" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} role="radio" aria-checked={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

/** a control label with a shorter form for phone-width stages (w2l4.css swaps them) */
export function Lbl({ long, short }: { long: string; short: string }) {
  return (
    <>
      <span className="w24-long">{long}</span>
      <span className="w24-short">{short}</span>
    </>
  );
}

export function Switch({
  on,
  onChange,
  children,
  bad,
  disabled,
  title,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  bad?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button className={`w24-switch ${on ? 'on' : ''} ${bad ? 'bad' : ''}`} role="switch" aria-checked={on} onClick={() => onChange(!on)} disabled={disabled} title={title}>
      <span className="knob" aria-hidden />
      {children}
    </button>
  );
}

/** lit ids of the stage plus the id pinned by a tap; hover handlers for stage objects */
export function useLink() {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const [pin, setPin] = useState<string | null>(null);
  const all = pin && !lit.includes(pin) ? [...lit, pin] : lit;
  const on = (id: string) => all.includes(id);
  const bind = (id: string | undefined) =>
    id
      ? {
          onPointerEnter: (e: PointerEvent) => {
            if (e.pointerType === 'mouse') setHover([id]);
          },
          onPointerLeave: (e: PointerEvent) => {
            if (e.pointerType === 'mouse') setHover(null);
          },
          onClick: () => setPin((p) => (p === id ? null : id)),
          style: { cursor: 'pointer' },
        }
      : {};
  return { lit: all, on, bind, pin, setPin };
}

/* ------------------------------------------------------------- schematic symbols */

/** a resistor box between two points on one axis (the wire runs through) */
export function ResBox({ x, y, dir, len = 44, wide = 18, cls }: { x: number; y: number; dir: 'h' | 'v'; len?: number; wide?: number; cls?: string }) {
  const w = dir === 'h' ? len : wide;
  const h = dir === 'h' ? wide : len;
  return <rect className={`w24-res ${cls ?? ''}`} x={x - w / 2} y={y - h / 2} width={w} height={h} rx={3} />;
}

/** an independent current source (circle with arrow); up = the arrow points up / right */
export function CurSrc({ x, y, r = 14, dir, cls }: { x: number; y: number; r?: number; dir: 'up' | 'down' | 'left' | 'right'; cls?: string }) {
  const a = r * 0.62;
  const [dx, dy] = dir === 'up' ? [0, -1] : dir === 'down' ? [0, 1] : dir === 'left' ? [-1, 0] : [1, 0];
  const tip: [number, number] = [x + dx * a, y + dy * a];
  const tail: [number, number] = [x - dx * a, y - dy * a];
  const px = -dy;
  const py = dx;
  const head = `${tip[0]},${tip[1]} ${tip[0] - dx * 6 + px * 4},${tip[1] - dy * 6 + py * 4} ${tip[0] - dx * 6 - px * 4},${tip[1] - dy * 6 - py * 4}`;
  return (
    <g className={`w24-src ${cls ?? ''}`}>
      <circle cx={x} cy={y} r={r} />
      <line x1={tail[0]} y1={tail[1]} x2={tip[0] - dx * 4} y2={tip[1] - dy * 4} />
      <polygon points={head} />
    </g>
  );
}

/** an independent voltage source; plus = the side of the + sign */
export function VoltSrc({ x, y, r = 14, plus, cls }: { x: number; y: number; r?: number; plus: 'top' | 'bottom' | 'left' | 'right'; cls?: string }) {
  const o = r * 0.48;
  const [px, py] = plus === 'top' ? [0, -o] : plus === 'bottom' ? [0, o] : plus === 'left' ? [-o, 0] : [o, 0];
  return (
    <g className={`w24-src ${cls ?? ''}`}>
      <circle cx={x} cy={y} r={r} />
      <text className="w24-sign" x={x + px} y={y + py + 4}>
        +
      </text>
      <text className="w24-sign" x={x - px} y={y - py + 4}>
        −
      </text>
    </g>
  );
}

/** a dependent source (diamond) */
export function DepSrc({ x, y, s = 15, kind, cls }: { x: number; y: number; s?: number; kind: 'current-down' | 'voltage-lr'; cls?: string }) {
  return (
    <g className={`w24-src dep ${cls ?? ''}`}>
      <polygon points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`} />
      {kind === 'current-down' ? (
        <>
          <line x1={x} y1={y - 8} x2={x} y2={y + 4} />
          <polygon points={`${x},${y + 9} ${x - 4},${y + 2} ${x + 4},${y + 2}`} />
        </>
      ) : (
        <>
          <text className="w24-sign" x={x - 7} y={y + 4}>
            +
          </text>
          <text className="w24-sign" x={x + 7} y={y + 4}>
            −
          </text>
        </>
      )}
    </g>
  );
}

/** a clockwise mesh-current arrow (three quarters of a circle) */
export function CwArc({ x, y, r, cls }: { x: number; y: number; r: number; cls?: string }) {
  // start at the left, sweep clockwise (over the top) to the bottom
  const d = `M ${x - r} ${y} A ${r} ${r} 0 1 1 ${x} ${y + r}`;
  return (
    <g className={`w24-arc ${cls ?? ''}`}>
      <path d={d} />
      {/* at the bottom a clockwise current runs to the left */}
      <polygon points={`${x - 2},${y + r} ${x + 6},${y + r - 4.5} ${x + 6},${y + r + 4.5}`} />
    </g>
  );
}
