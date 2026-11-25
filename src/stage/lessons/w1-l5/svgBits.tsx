// Small SVG helpers shared by the two W1-L5 layers.

import type { ReactNode } from 'react';
import { useStage } from '../../stageStore';

/** A symbol with a subscript inside SVG <text>: i₁, i_o, I_T … */
export function Sym({ n, s }: { n: string; s?: string }) {
  return (
    <>
      {n}
      {s && (
        <tspan baselineShift="sub" fontSize="0.72em">
          {s}
        </tspan>
      )}
    </>
  );
}

/** A filled arrow head at fraction t of the segment (x1,y1)→(x2,y2), pointing along it. */
export function arrowHead(x1: number, y1: number, x2: number, y2: number, t = 0.5, size = 7): string {
  const x = x1 + (x2 - x1) * t;
  const y = y1 + (y2 - y1) * t;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const px = -uy;
  const py = ux;
  const tip = [x + ux * size, y + uy * size];
  const a = [x - ux * size * 0.6 + px * size * 0.7, y - uy * size * 0.6 + py * size * 0.7];
  const b = [x - ux * size * 0.6 - px * size * 0.7, y - uy * size * 0.6 - py * size * 0.7];
  return [tip, a, b].map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');
}

/** Pointer handlers that light a stage id while the pointer is over the element. */
export function hoverProps(id: string) {
  return {
    onPointerEnter: () => useStage.getState().setHover([id]),
    onPointerLeave: () => useStage.getState().setHover(null),
  };
}

/** Format a current / value: "+4.0", "−1.5" (true minus sign). */
export function fmt(v: number, digits = 1, plus = false): string {
  const r = Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v;
  const s = Math.abs(r).toFixed(digits);
  return r < 0 ? `−${s}` : plus ? `+${s}` : s;
}

/** A row of segmented buttons (radio group). */
export function Seg<T extends string>({ label, value, options, onChange, hover }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void; hover?: string }) {
  return (
    <div className="kcl-seg" role="radiogroup" aria-label={label} {...(hover ? hoverProps(hover) : {})}>
      {options.map(([v, text]) => (
        <button key={v} role="radio" aria-checked={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

export function Readout({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return <div className={`kcl-readout ${tone}`}>{children}</div>;
}
