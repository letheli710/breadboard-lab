// Extra schematic primitives for calc-card figures (same svg conventions as fig.tsx: viewBox
// 0 0 260 150, strokes through the .cf-* classes): current arrows, meters, labelled boxes,
// an NPN transistor and an N-channel MOSFET.

import type { ReactNode } from 'react';

type Dir = 'r' | 'l' | 'u' | 'd';

/** a small current arrow centred on (x, y), drawn in the accent colour, with an optional label */
export function Arrow({ x, y, dir = 'r', label, lx, ly }: { x: number; y: number; dir?: Dir; label?: string; lx?: number; ly?: number }) {
  const d = {
    r: `M${x - 7} ${y} h14 M${x + 3} ${y - 4} l4 4 l-4 4`,
    l: `M${x + 7} ${y} h-14 M${x - 3} ${y - 4} l-4 4 l4 4`,
    d: `M${x} ${y - 7} v14 M${x - 4} ${y + 3} l4 4 l4 -4`,
    u: `M${x} ${y + 7} v-14 M${x - 4} ${y - 3} l4 -4 l4 4`,
  }[dir];
  const horiz = dir === 'r' || dir === 'l';
  return (
    <g>
      <path d={d} className="cf-w accent" fill="none" />
      {label && (
        <text x={lx ?? (horiz ? x : x + 8)} y={ly ?? (horiz ? y - 8 : y + 4)} className="cf-t accent" textAnchor={horiz ? 'middle' : 'start'}>
          {label}
        </text>
      )}
    </g>
  );
}

/** a round meter (A / V / a letter) centred on (x, y); wires attach at x ± 11 or y ± 11 */
export const Meter = ({ x, y, letter }: { x: number; y: number; letter: string }) => (
  <g>
    <circle cx={x} cy={y} r={11} className="cf-w" fill="none" />
    <text x={x} y={y + 4} textAnchor="middle" className="cf-t">
      {letter}
    </text>
  </g>
);

/** a labelled rectangle (a chip, a pin, "network") */
export const Box = ({ x, y, w, h, children, dashed }: { x: number; y: number; w: number; h: number; children?: ReactNode; dashed?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={4} className="cf-w thin" fill="none" strokeDasharray={dashed ? '4 3' : undefined} />
    {children && (
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" className="cf-t small">
        {children}
      </text>
    )}
  </g>
);

/** NPN transistor: base lead ends at (x, y); collector at (x + 28, y − 30), emitter at (x + 28, y + 30) */
export function Npn({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <circle cx={x + 20} cy={y} r={17} className="cf-w thin" fill="none" />
      <path d={`M${x} ${y} H${x + 12} M${x + 12} ${y - 11} V${y + 11}`} className="cf-w" fill="none" />
      <path d={`M${x + 12} ${y - 5} L${x + 28} ${y - 16} V${y - 30}`} className="cf-w" fill="none" />
      <path d={`M${x + 12} ${y + 5} L${x + 28} ${y + 16} V${y + 30}`} className="cf-w" fill="none" />
      <path d={`M${x + 20} ${y + 15} L${x + 26} ${y + 15} L${x + 23} ${y + 9.5}`} className="cf-w" fill="none" />
      {label && (
        <text x={x + 40} y={y + 4} className="cf-t">
          {label}
        </text>
      )}
    </g>
  );
}

/** N-channel MOSFET: gate lead ends at (x, y); drain at (x + 28, y − 30), source at (x + 28, y + 30) */
export function Nmos({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <path d={`M${x} ${y + 8} H${x + 11} M${x + 11} ${y - 10} V${y + 10}`} className="cf-w" fill="none" />
      <path d={`M${x + 16} ${y - 12} V${y - 6} M${x + 16} ${y - 2} V${y + 2} M${x + 16} ${y + 6} V${y + 12}`} className="cf-w thick" fill="none" />
      <path d={`M${x + 16} ${y - 9} H${x + 28} V${y - 30} M${x + 16} ${y + 9} H${x + 28} V${y + 30} M${x + 16} ${y} H${x + 28} V${y + 9}`} className="cf-w" fill="none" />
      <path d={`M${x + 18} ${y} l5 -3 v6 z`} className="cf-w" />
      {label && (
        <text x={x + 34} y={y + 4} className="cf-t">
          {label}
        </text>
      )}
    </g>
  );
}

/** a variable-resistor arrow drawn across a part between (x1, y1) and (x2, y2) */
export const Var = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
  <path d={`M${x1} ${y1} L${x2} ${y2} M${x2 - 7} ${y2 + 1} L${x2} ${y2} L${x2 - 1} ${y2 + 7}`} className="cf-w accent" fill="none" />
);
