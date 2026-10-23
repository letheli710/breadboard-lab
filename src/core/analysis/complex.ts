// Minimal immutable complex arithmetic on the contract's {re, im} shape.

import type { Complex } from '../problem/types';

export type { Complex };

export const cx = (re: number, im = 0): Complex => ({ re, im });
export const ZERO: Complex = cx(0);
export const ONE: Complex = cx(1);

export const add = (a: Complex, b: Complex): Complex => cx(a.re + b.re, a.im + b.im);
export const sub = (a: Complex, b: Complex): Complex => cx(a.re - b.re, a.im - b.im);
export const mul = (a: Complex, b: Complex): Complex => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const scale = (a: Complex, k: number): Complex => cx(a.re * k, a.im * k);
export const neg = (a: Complex): Complex => cx(-a.re, -a.im);
export const conj = (a: Complex): Complex => cx(a.re, -a.im);
export const abs = (a: Complex): number => Math.hypot(a.re, a.im);
export const isZero = (a: Complex): boolean => a.re === 0 && a.im === 0;

/** a / b (Smith's algorithm). Division by exactly zero gives NaN components. */
export function div(a: Complex, b: Complex): Complex {
  if (b.re === 0 && b.im === 0) return cx(NaN, NaN);
  if (Math.abs(b.re) >= Math.abs(b.im)) {
    const r = b.im / b.re;
    const d = b.re + b.im * r;
    return cx((a.re + a.im * r) / d, (a.im - a.re * r) / d);
  }
  const r = b.re / b.im;
  const d = b.re * r + b.im;
  return cx((a.re * r + a.im) / d, (a.im * r - a.re) / d);
}

export const polarDeg = (mag: number, deg: number): Complex => {
  const th = (deg * Math.PI) / 180;
  return cx(mag * Math.cos(th), mag * Math.sin(th));
};

/** principal square root */
export function sqrt(a: Complex): Complex {
  const m = abs(a);
  if (m === 0) return ZERO;
  const re = Math.sqrt((m + a.re) / 2);
  const im = Math.sqrt(Math.max(0, (m - a.re) / 2));
  return cx(re, a.im < 0 ? -im : im);
}
