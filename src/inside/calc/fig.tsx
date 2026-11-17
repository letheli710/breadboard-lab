// Tiny schematic primitives for calc-card figures (svg, viewBox 0 0 260 150). Strokes use
// currentColor through the .cf-* classes so the figures follow the page theme.

import type { ReactNode } from 'react';
import { sub } from '../TeardownView';

type P = { x1: number; y1: number; x2: number; y2: number };

export const W = ({ x1, y1, x2, y2 }: P) => <line x1={x1} y1={y1} x2={x2} y2={y2} className="cf-w" />;

/** a polyline wire "x,y x,y …" */
export const Path = ({ d }: { d: string }) => <polyline points={d} className="cf-w" fill="none" />;

/** zig-zag resistor centred between two points (horizontal or vertical) with an optional label */
export function R({ x1, y1, x2, y2, label, lx, ly }: P & { label?: string; lx?: number; ly?: number }) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const body = Math.min(36, L * 0.8);
  const a = (L - body) / 2;
  const pts = [`${x1},${y1}`, `${x1 + ux * a},${y1 + uy * a}`];
  for (let k = 1; k <= 6; k++) {
    const t = a + (body * k) / 6.5;
    const s = k % 2 ? 6 : -6;
    pts.push(`${x1 + ux * t - uy * s},${y1 + uy * t + ux * s}`);
  }
  pts.push(`${x1 + ux * (a + body)},${y1 + uy * (a + body)}`, `${x2},${y2}`);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <polyline points={pts.join(' ')} className="cf-w" fill="none" />
      {label && (
        <text x={lx ?? (uy ? mx + 10 : mx)} y={ly ?? (uy ? my + 4 : my - 10)} className="cf-t" textAnchor={uy ? 'start' : 'middle'}>
          {sub(label)}
        </text>
      )}
    </g>
  );
}

/** capacitor (plates across the line) between two points */
export function C({ x1, y1, x2, y2, label }: P & { label?: string }) {
  const vert = x1 === x2;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      {vert ? (
        <>
          <W x1={x1} y1={y1} x2={x1} y2={my - 4} />
          <W x1={x1} y1={my + 4} x2={x1} y2={y2} />
          <line x1={mx - 12} y1={my - 4} x2={mx + 12} y2={my - 4} className="cf-w thick" />
          <line x1={mx - 12} y1={my + 4} x2={mx + 12} y2={my + 4} className="cf-w thick" />
        </>
      ) : (
        <>
          <W x1={x1} y1={y1} x2={mx - 4} y2={y1} />
          <W x1={mx + 4} y1={y1} x2={x2} y2={y2} />
          <line x1={mx - 4} y1={my - 12} x2={mx - 4} y2={my + 12} className="cf-w thick" />
          <line x1={mx + 4} y1={my - 12} x2={mx + 4} y2={my + 12} className="cf-w thick" />
        </>
      )}
      {label && (
        <text x={vert ? mx + 16 : mx} y={vert ? my + 4 : my - 16} className="cf-t" textAnchor={vert ? 'start' : 'middle'}>
          {sub(label)}
        </text>
      )}
    </g>
  );
}

/** inductor (bumps) between two points */
export function L({ x1, y1, x2, y2, label }: P & { label?: string }) {
  const vert = x1 === x2;
  const len = vert ? y2 - y1 : x2 - x1;
  const a = (len - 32) / 2;
  const d = vert
    ? `M${x1} ${y1} v${a} a4 4 0 0 1 0 8 a4 4 0 0 1 0 8 a4 4 0 0 1 0 8 a4 4 0 0 1 0 8 v${a}`
    : `M${x1} ${y1} h${a} a4 4 0 0 1 8 0 a4 4 0 0 1 8 0 a4 4 0 0 1 8 0 a4 4 0 0 1 8 0 h${a}`;
  return (
    <g>
      <path d={d} className="cf-w" fill="none" />
      {label && (
        <text x={vert ? x1 + 12 : (x1 + x2) / 2} y={vert ? (y1 + y2) / 2 + 4 : y1 - 10} className="cf-t" textAnchor={vert ? 'start' : 'middle'}>
          {sub(label)}
        </text>
      )}
    </g>
  );
}

/** voltage source (circle with + / −), vertical, + on top */
export function V({ x, y1, y2, label }: { x: number; y1: number; y2: number; label?: string }) {
  const my = (y1 + y2) / 2;
  return (
    <g>
      <W x1={x} y1={y1} x2={x} y2={my - 14} />
      <W x1={x} y1={my + 14} x2={x} y2={y2} />
      <circle cx={x} cy={my} r={14} className="cf-w" fill="none" />
      <text x={x} y={my - 2} textAnchor="middle" className="cf-t small">
        +
      </text>
      <text x={x} y={my + 10} textAnchor="middle" className="cf-t small">
        −
      </text>
      {label && (
        <text x={x - 20} y={my + 4} textAnchor="end" className="cf-t">
          {sub(label)}
        </text>
      )}
    </g>
  );
}

/** current source (circle with an arrow up) */
export function I({ x, y1, y2, label }: { x: number; y1: number; y2: number; label?: string }) {
  const my = (y1 + y2) / 2;
  return (
    <g>
      <W x1={x} y1={y1} x2={x} y2={my - 14} />
      <W x1={x} y1={my + 14} x2={x} y2={y2} />
      <circle cx={x} cy={my} r={14} className="cf-w" fill="none" />
      <path d={`M${x} ${my + 8} V${my - 8} M${x - 4} ${my - 3} L${x} ${my - 9} L${x + 4} ${my - 3}`} className="cf-w" fill="none" />
      {label && (
        <text x={x - 20} y={my + 4} textAnchor="end" className="cf-t">
          {sub(label)}
        </text>
      )}
    </g>
  );
}

/** LED / diode pointing in +x or +y */
export function D({ x1, y1, x2, y2, label, led }: P & { label?: string; led?: boolean }) {
  const vert = x1 === x2;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const tri = vert ? `${mx - 9},${my - 7} ${mx + 9},${my - 7} ${mx},${my + 7}` : `${mx - 7},${my - 9} ${mx - 7},${my + 9} ${mx + 7},${my}`;
  const bar = vert ? [mx - 9, my + 7, mx + 9, my + 7] : [mx + 7, my - 9, mx + 7, my + 9];
  return (
    <g>
      {vert ? (
        <>
          <W x1={x1} y1={y1} x2={x1} y2={my - 7} />
          <W x1={x1} y1={my + 7} x2={x1} y2={y2} />
        </>
      ) : (
        <>
          <W x1={x1} y1={y1} x2={mx - 7} y2={y1} />
          <W x1={mx + 7} y1={y1} x2={x2} y2={y2} />
        </>
      )}
      <polygon points={tri} className={`cf-w ${led ? 'led' : ''}`} />
      <line x1={bar[0]} y1={bar[1]} x2={bar[2]} y2={bar[3]} className="cf-w" />
      {led && <path d={`M${mx + 10} ${my - 10} l8 -8 M${mx + 14} ${my - 6} l8 -8`} className="cf-w thin" />}
      {label && (
        <text x={vert ? mx + 16 : mx} y={vert ? my + 4 : my + 24} className="cf-t" textAnchor={vert ? 'start' : 'middle'}>
          {sub(label)}
        </text>
      )}
    </g>
  );
}

export function Gnd({ x, y }: { x: number; y: number }) {
  return (
    <g className="cf-w">
      <line x1={x - 10} y1={y} x2={x + 10} y2={y} />
      <line x1={x - 6} y1={y + 4} x2={x + 6} y2={y + 4} />
      <line x1={x - 2} y1={y + 8} x2={x + 2} y2={y + 8} />
    </g>
  );
}

/** op-amp triangle; inputs at (x, y∓20), output at (x + 70, y); `inv` puts − on top (default) */
export function OpAmp({ x, y, plusTop }: { x: number; y: number; plusTop?: boolean }) {
  return (
    <g>
      <polygon points={`${x},${y - 34} ${x},${y + 34} ${x + 70},${y}`} className="cf-w" fill="none" />
      <text x={x + 6} y={y - 16} className="cf-t">
        {plusTop ? '+' : '−'}
      </text>
      <text x={x + 6} y={y + 26} className="cf-t">
        {plusTop ? '−' : '+'}
      </text>
    </g>
  );
}

export const Dot = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r={3} className="cf-dot" />;

export const T = ({ x, y, children, anchor = 'middle', cls = '' }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; cls?: string }) => (
  <text x={x} y={y} textAnchor={anchor} className={`cf-t ${cls}`}>
    {typeof children === 'string' ? sub(children) : children}
  </text>
);

/** a voltage arrow (+ at the head end) from (x, y1) to (x, y2) */
export const VArrow = ({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) => (
  <g>
    <path d={`M${x} ${y1} V${y2} M${x - 4} ${y2 + (y2 < y1 ? 6 : -6)} L${x} ${y2} L${x + 4} ${y2 + (y2 < y1 ? 6 : -6)}`} className="cf-w accent" fill="none" />
    <text x={x + 6} y={(y1 + y2) / 2 + 4} className="cf-t accent">
      {sub(label)}
    </text>
  </g>
);
