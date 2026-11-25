// W5-L3 model: complex arithmetic and ONE linear solver (Gaussian elimination with partial
// pivoting, `solve`) that every circuit of the lesson goes through — act 1's parallel RLC node,
// example 1's two nodes with a CCCS (act 2), example 2's supermesh (act 3) and the guided
// example's two nodes (act 4). Each circuit is set up as A·x = b from its elements, solved, and
// checked by its residual ‖A·x − b‖. No React, no three.js.

export interface Cx {
  re: number;
  im: number;
}

export const cx = (re: number, im = 0): Cx => ({ re, im });
export const J: Cx = cx(0, 1);
export const add = (a: Cx, b: Cx): Cx => cx(a.re + b.re, a.im + b.im);
export const sub = (a: Cx, b: Cx): Cx => cx(a.re - b.re, a.im - b.im);
export const mul = (a: Cx, b: Cx): Cx => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const scale = (a: Cx, k: number): Cx => cx(a.re * k, a.im * k);
export const abs = (a: Cx): number => Math.hypot(a.re, a.im);
export const div = (a: Cx, b: Cx): Cx => {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
export const inv = (a: Cx): Cx => div(cx(1), a);
export const neg = (a: Cx): Cx => cx(-a.re, -a.im);
/** angle in degrees, principal value (−180°, 180°] */
export const argDeg = (a: Cx): number => (Math.atan2(a.im, a.re) * 180) / Math.PI;
/** M∠θ (θ in degrees) */
export const polar = (m: number, deg: number): Cx => cx(m * Math.cos((deg * Math.PI) / 180), m * Math.sin((deg * Math.PI) / 180));

/** Solve A·x = b (complex, n × n) by Gaussian elimination with partial pivoting. */
export function solve(A: Cx[][], b: Cx[]): Cx[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (abs(M[i][k]) > abs(M[p][k])) p = i;
    if (abs(M[p][k]) < 1e-300) throw new Error('singular matrix');
    [M[k], M[p]] = [M[p], M[k]];
    for (let i = k + 1; i < n; i++) {
      const f = div(M[i][k], M[k][k]);
      for (let j = k; j <= n; j++) M[i][j] = sub(M[i][j], mul(f, M[k][j]));
    }
  }
  const x: Cx[] = Array.from({ length: n }, () => cx(0));
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s = sub(s, mul(M[i][j], x[j]));
    x[i] = div(s, M[i][i]);
  }
  return x;
}

/** ‖A·x − b‖₂ */
export function residual(A: Cx[][], x: Cx[], b: Cx[]): number {
  let s = 0;
  A.forEach((row, i) => {
    const r = sub(
      row.reduce((acc, a, j) => add(acc, mul(a, x[j])), cx(0)),
      b[i],
    );
    s += r.re * r.re + r.im * r.im;
  });
  return Math.sqrt(s);
}

/** 2 × 2 determinant */
export const det2 = (a: Cx, b: Cx, c: Cx, d: Cx): Cx => sub(mul(a, d), mul(b, c));

/** source phasor of A·cos(ωt + φ) or A·sin(ωt + φ), cosine reference: sin(x) = cos(x − 90°) */
export const sourcePhasor = (amp: number, phaseDeg: number, kind: 'cos' | 'sin'): Cx => polar(amp, kind === 'sin' ? phaseDeg - 90 : phaseDeg);
export const zL = (w: number, L: number): Cx => cx(0, w * L);
export const zC = (w: number, C: number): Cx => inv(cx(0, w * C));

/* ------------------------------------------------------------------ act 1: parallel RLC node */

export const ACT1 = { R: 20, L: 0.1, C: 5e-4, Im: 10, phi: 30 };

export function act1(w: number) {
  const { R, L, C, Im, phi } = ACT1;
  const Is = polar(Im, phi);
  const ZL = zL(w, L);
  const ZC = zC(w, C);
  const Y = add(add(cx(1 / R), inv(ZL)), inv(ZC));
  const A = [[Y]];
  const b = [Is];
  const [V] = solve(A, b);
  return { Is, ZL, ZC, Y, V, res: residual(A, [V], b) };
}

/* ------------------------------------------------------------------ example 1 (act 2): nodes + CCCS */

export const EX1 = { w: 10, Im: 5, C: 25e-3, R1: 4, L: 0.2, alpha: 2 };

export function ex1() {
  const { w, Im, C, R1, L, alpha } = EX1;
  const Is = sourcePhasor(Im, 0, 'cos');
  const ZC = zC(w, C);
  const ZL = zL(w, L);
  const g = cx(1 / R1);
  // node 1: V1/ZC + (V1 − V2)/R1 = Is; node 2: (V2 − V1)/R1 + V2/ZL = α(V1 − V2)/R1
  const A = [
    [add(inv(ZC), g), neg(g)],
    [scale(g, -(1 + alpha)), add(scale(g, 1 + alpha), inv(ZL))],
  ];
  const b = [Is, cx(0)];
  const [V1, V2] = solve(A, b);
  const Ix = scale(sub(V1, V2), 1 / R1);
  // the sheet's ×4 integer system: [1+j, −1; −3, 3−j2]·V = [20; 0]
  const A4 = A.map((r) => r.map((a) => scale(a, R1)));
  const b4 = b.map((v) => scale(v, R1));
  const D = det2(A4[0][0], A4[0][1], A4[1][0], A4[1][1]);
  const D1 = det2(b4[0], A4[0][1], b4[1], A4[1][1]);
  const D2 = det2(A4[0][0], b4[0], A4[1][0], b4[1]);
  return { Is, ZC, ZL, A, b, A4, b4, D, D1, D2, V1, V2, Ix, res: residual(A, [V1, V2], b) };
}

/* ------------------------------------------------------------------ example 2 (act 3): supermesh */

export const EX2 = { w: 5, Vm: 20, R1: 4, L: 0.4, C: 50e-3, R2: 2, Im: 4 };

export function ex2() {
  const { w, Vm, R1, L, C, R2, Im } = EX2;
  const Vs = sourcePhasor(Vm, 0, 'cos');
  const Is = sourcePhasor(Im, 0, 'sin');
  const ZL = zL(w, L);
  const ZC = zC(w, C);
  const Z1 = add(cx(R1), ZL);
  const Z2 = add(ZC, cx(R2));
  // supermesh KVL: Z1·I1 + Z2·I2 = Vs; constraint: −I1 + I2 = Is
  const A = [
    [Z1, Z2],
    [cx(-1), cx(1)],
  ];
  const b = [Vs, Is];
  const [I1, I2] = solve(A, b);
  const D = det2(A[0][0], A[0][1], A[1][0], A[1][1]);
  const D1 = det2(b[0], A[0][1], b[1], A[1][1]);
  const D2 = det2(A[0][0], b[0], A[1][0], b[1]);
  return { Vs, Is, ZL, ZC, Z1, Z2, A, b, D, D1, D2, I1, I2, res: residual(A, [I1, I2], b) };
}

/* ------------------------------------------------------------------ guided example (act 4) */

export const GUIDED = { w: 100, Im: 6, R1: 10, C: 1e-3, R2: 10, L: 0.1 };

export function guided() {
  const { w, Im, R1, C, R2, L } = GUIDED;
  const Is = sourcePhasor(Im, 0, 'sin');
  const ZC = zC(w, C);
  const ZL = zL(w, L);
  const yc = inv(ZC);
  // node 1: V1/R1 + (V1 − V2)/ZC = Is; node 2: (V2 − V1)/ZC + V2/R2 + V2/ZL = 0
  const A = [
    [add(cx(1 / R1), yc), neg(yc)],
    [neg(yc), add(add(yc, cx(1 / R2)), inv(ZL))],
  ];
  const b = [Is, cx(0)];
  const [V1, V2] = solve(A, b);
  // the sheet's ×10 system: (1 + j)V1 − jV2 = −j60, −jV1 + V2 = 0
  const A10 = A.map((r) => r.map((a) => scale(a, 10)));
  const b10 = b.map((v) => scale(v, 10));
  return { Is, ZC, ZL, A, b, A10, b10, V1, V2, res: residual(A, [V1, V2], b) };
}

/* ------------------------------------------------------------------ formatting */

/** a number with `d` decimals, trailing zeros dropped, −0 → 0, U+2212 minus */
export function num(x: number, d = 2): string {
  const r = Math.abs(x) < 0.5 * 10 ** -d ? 0 : x;
  const s = r.toFixed(d).replace(/\.?0+$/, '');
  return s.replace('-', '−');
}

/** a + jb (rectangular) */
export function rect(z: Cx, d = 2, one = false): string {
  const re = Math.abs(z.re) < 0.5 * 10 ** -d ? 0 : z.re;
  const im = Math.abs(z.im) < 0.5 * 10 ** -d ? 0 : z.im;
  if (im === 0) return num(re, d);
  const mag = num(Math.abs(im), d);
  const jb = `j${mag === '1' && !one ? '' : mag}`;
  if (re === 0) return im < 0 ? `−${jb}` : jb;
  return `${num(re, d)} ${im < 0 ? '−' : '+'} ${jb}`;
}

/** M∠θ° (polar) */
export function pol(z: Cx, d = 2, dAng = 2): string {
  return `${num(abs(z), d)}∠${num(argDeg(z), dAng)}°`;
}
