// Complex-frequency (s-domain) analysis for the "s-domain" chapter (邱关源《电路》第 14 章).
//
// Everything is obtained from the same MNA equations the other analyses use, evaluated at a
// complex frequency s (C → admittance sC, L → impedance sL, coupled inductors sM):
//
//   - network function H(s) = Y(s)/X(s) between one independent source (value 1, all other
//     sources zero, zero initial state) and an output (node voltage, element voltage or current),
//     as a rational function: the MNA determinant det(s) and N(s) = H(s)·det(s) are both
//     polynomials of degree ≤ (number of C and L), so they are recovered exactly by sampling on
//     a circle (discrete Fourier transform); common roots (pole–zero cancellations) are removed
//     and the denominator is made monic. No symbolic algebra is involved.
//   - the transform Y(s) of the actual response for t > 0 (all sources, initial conditions at
//     t = 0− as the textbook's internal sources C·u_C(0−) and L·i_L(0−)), and the partial-fraction
//     coefficient of 1/(s − p)^k of Y(s) at any of its poles, by a contour integral around p.
//   - a numerical inverse Laplace transform (fixed Talbot) used to cross-check the transient
//     solver by an independent route.

import type { Complex, Netlist } from '../problem/types';
import { Circuit, type CEl, isIndependent } from './circuit';
import { ONE, ZERO, abs, add, cx, div, mul, scale, sub } from './complex';
import { AnalysisError } from './errors';
import { eigenvalues } from './linalg';
import { MnaSystem, Solution } from './mna';
import { Transient } from './transient';

/** Output of a network function / response: node voltage ["a"] or ["a", "b"], element voltage {v}, element current {i}. */
export type OutSpec = [string, string?] | string[] | { v: string } | { i: string };

export interface NetworkFunction {
  /** numerator coefficients, ascending powers of s (den monic) */
  num: number[];
  /** denominator coefficients, ascending powers of s; the highest one is 1 */
  den: number[];
  /** poles / finite zeros after cancellation, sorted by real part descending, then imaginary part descending */
  poles: Complex[];
  zeros: Complex[];
}

const fmt = (x: number) => Number(x.toPrecision(6)).toString();
export const fmtS = (z: Complex) => (Math.abs(z.im) > 1e-12 * Math.max(1, abs(z)) ? `${fmt(z.re)}${z.im > 0 ? '+' : '−'}j${fmt(Math.abs(z.im))}` : fmt(z.re));

/** Read an output from a solution. */
export function outValue(sol: Solution, out: unknown): Complex {
  if (Array.isArray(out)) {
    if (out.length < 1 || out.length > 2 || !out.every((x) => typeof x === 'string')) throw new AnalysisError('out: must be ["a"], ["a", "b"], {"v": "R1"} or {"i": "R1"}');
    return sol.v(out[0], out[1] ?? '0');
  }
  if (out && typeof out === 'object') {
    const o = out as { v?: unknown; i?: unknown };
    if (typeof o.v === 'string') return sol.vEl(o.v);
    if (typeof o.i === 'string') return sol.i(o.i);
  }
  throw new AnalysisError('out: must be ["a"], ["a", "b"], {"v": "R1"} or {"i": "R1"}');
}

// ---------------- small polynomial / matrix helpers ----------------

/** determinant of a complex matrix (Gaussian elimination with partial pivoting) */
function det(A0: readonly (readonly Complex[])[]): Complex {
  const n = A0.length;
  const A = A0.map((r) => r.slice());
  let d = ONE;
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (abs(A[i][k]) > abs(A[p][k])) p = i;
    if (abs(A[p][k]) === 0) return ZERO;
    if (p !== k) {
      [A[p], A[k]] = [A[k], A[p]];
      d = scale(d, -1);
    }
    d = mul(d, A[k][k]);
    for (let i = k + 1; i < n; i++) {
      const f = div(A[i][k], A[k][k]);
      if (f.re === 0 && f.im === 0) continue;
      for (let j = k; j < n; j++) A[i][j] = sub(A[i][j], mul(f, A[k][j]));
    }
  }
  return d;
}

const expi = (th: number) => cx(Math.cos(th), Math.sin(th));

/** Coefficients (ascending) of a polynomial of degree ≤ deg from its values on |s| = rho. */
function interpolate(f: (s: Complex) => Complex, deg: number, rho: number): Complex[] {
  const M = Math.max(8, 2 * deg + 4);
  const th0 = 0.2718281828; // keeps the samples off the real axis
  const vals: Complex[] = [];
  for (let j = 0; j < M; j++) vals.push(f(scale(expi(th0 + (2 * Math.PI * j) / M), rho)));
  const c: Complex[] = [];
  for (let k = 0; k < M; k++) {
    let acc = ZERO;
    for (let j = 0; j < M; j++) acc = add(acc, mul(vals[j], expi(-k * (th0 + (2 * Math.PI * j) / M))));
    c.push(scale(acc, 1 / (M * rho ** k)));
  }
  // scaled magnitudes |c_k|·rho^k; everything above deg must vanish
  const mags = c.map((z, k) => abs(z) * rho ** k);
  const big = Math.max(...mags);
  for (let k = deg + 1; k < M; k++)
    if (mags[k] > 1e-7 * big) throw new AnalysisError('s-domain analysis: the network function is not a rational function of the expected degree (numerical trouble)');
  return c.slice(0, deg + 1);
}

/** real coefficients with negligible (scaled) ones set to 0 and the degree trimmed */
function cleanPoly(c: Complex[], rho: number): number[] {
  const mags = c.map((z, k) => abs(z) * rho ** k);
  const big = Math.max(0, ...mags);
  const r = c.map((z, k) => (mags[k] <= 1e-10 * big ? 0 : z.re));
  while (r.length > 1 && r[r.length - 1] === 0) r.pop();
  return r;
}

function horner(p: readonly number[], s: Complex): Complex {
  let acc = ZERO;
  for (let k = p.length - 1; k >= 0; k--) acc = add(mul(acc, s), cx(p[k]));
  return acc;
}

function polyRoots(p: readonly number[]): Complex[] {
  const n = p.length - 1;
  if (n < 1) return [];
  const lead = p[n];
  // companion matrix
  const C = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let j = 0; j < n; j++) C[0][j] = -p[n - 1 - j] / lead;
  for (let i = 1; i < n; i++) C[i][i - 1] = 1;
  let r: Complex[];
  try {
    r = eigenvalues(C);
  } catch {
    throw new AnalysisError('s-domain analysis: could not find the roots of a polynomial');
  }
  // Newton polish (skipped where the derivative vanishes, i.e. at repeated roots)
  const dp = p.slice(1).map((c, k) => c * (k + 1));
  return r.map((z0) => {
    let z = z0;
    for (let it = 0; it < 30; it++) {
      const d = horner(dp, z);
      if (abs(d) < 1e-300) break;
      const step = div(horner(p, z), d);
      const z1 = sub(z, step);
      if (!Number.isFinite(z1.re) || !Number.isFinite(z1.im) || abs(sub(z1, z0)) > 1e-3 * Math.max(1, abs(z0))) break;
      z = z1;
      if (abs(step) <= 1e-15 * Math.max(1, abs(z))) break;
    }
    return z;
  });
}

function polyFromRoots(roots: readonly Complex[], k = 1): number[] {
  let c: Complex[] = [cx(k)];
  for (const r of roots) {
    const nc = new Array<Complex>(c.length + 1).fill(ZERO);
    for (let i = 0; i < c.length; i++) {
      nc[i + 1] = add(nc[i + 1], c[i]);
      nc[i] = sub(nc[i], mul(c[i], r));
    }
    c = nc;
  }
  return c.map((z) => z.re);
}

/** sort like the natural frequencies: real part descending, then imaginary part descending; snap tiny parts */
function tidy(rs: Complex[], scaleRef: number): Complex[] {
  const sc = Math.max(scaleRef, ...rs.map(abs), 1e-300);
  const c = rs.map((z) => cx(Math.abs(z.re) <= 1e-9 * sc ? 0 : z.re, Math.abs(z.im) <= 1e-7 * sc ? 0 : z.im));
  // repeated roots split symmetrically: average clusters
  const out: Complex[] = [];
  const used = new Array(c.length).fill(false);
  for (let i = 0; i < c.length; i++) {
    if (used[i]) continue;
    const cl = [i];
    for (let j = i + 1; j < c.length; j++) if (!used[j] && abs(sub(c[i], c[j])) <= 2e-4 * sc) cl.push(j);
    cl.forEach((j) => (used[j] = true));
    const m = scale(
      cl.reduce((a, j) => add(a, c[j]), ZERO),
      1 / cl.length,
    );
    const mm = cx(Math.abs(m.re) <= 1e-9 * sc ? 0 : m.re, Math.abs(m.im) <= 1e-7 * sc ? 0 : m.im);
    for (let k = 0; k < cl.length; k++) out.push(mm);
  }
  return out.sort((x, y) => (Math.abs(x.re - y.re) > 1e-12 * sc ? y.re - x.re : y.im - x.im));
}

// ---------------- the s-domain circuit ----------------

function storageCount(ckt: Circuit): number {
  return ckt.els.filter((e) => e.type === 'C' || e.type === 'L').length;
}

/** a typical |s| of the circuit from its element values (1/RC, R/L, 1/√LC) */
function typicalRate(ckt: Circuit): number {
  const R = ckt.els.filter((e) => e.type === 'R' && e.value !== 0).map((e) => Math.abs(e.value));
  const C = ckt.els.filter((e) => e.type === 'C' && e.value > 0).map((e) => e.value);
  const L = ckt.els.filter((e) => e.type === 'L' && e.value > 0).map((e) => e.value);
  const logs: number[] = [];
  for (const r of R) {
    for (const c of C) logs.push(-Math.log(r * c));
    for (const l of L) logs.push(Math.log(r / l));
  }
  for (const l of L) for (const c of C) logs.push(-0.5 * Math.log(l * c));
  if (!logs.length) return 1;
  return Math.exp(logs.reduce((a, b) => a + b, 0) / logs.length);
}

function systemAt(ckt: Circuit, s: Complex): MnaSystem {
  return new MnaSystem(ckt, { kind: 'ac', s, phase: 'after', label: `the s-domain circuit at s = ${fmtS(s)}` });
}

/** circuit with every independent source value replaced by 0 (only the structure is needed) */
function structural(netlist: Netlist): Circuit {
  const els = netlist.elements.map((e) => ('type' in e && (e.type === 'V' || e.type === 'I') ? { ...e, value: 0 } : e));
  return new Circuit({ ...netlist, elements: els });
}

interface Poly2 {
  den: number[];
  num: number[];
  rho: number;
}

function rawFunction(ckt: Circuit, input: CEl, out: unknown): Poly2 {
  const K = storageCount(ckt);
  const sample = (rho: number) => {
    const D = interpolate((s) => det(systemAt(ckt, s).matrix), K, rho);
    const N = interpolate(
      (s) => {
        const sys = systemAt(ckt, s);
        if (sys.error) throw sys.error;
        const y = outValue(
          sys.solve((el) => (el === input ? ONE : ZERO)),
          out,
        );
        return mul(y, det(sys.matrix));
      },
      K,
      rho,
    );
    return { D, N };
  };
  let rho = typicalRate(ckt);
  let { D, N } = sample(rho);
  const d0 = cleanPoly(D, rho);
  if (d0.every((c) => c === 0)) throw new AnalysisError('s-domain analysis: the circuit equations are singular for every s (check the circuit)');
  // resample on a circle through the middle of the roots for better conditioning
  const r0 = polyRoots(d0)
    .map(abs)
    .filter((m) => m > 1e-9 * rho);
  if (r0.length) {
    const rho2 = Math.exp(r0.reduce((a, m) => a + Math.log(m), 0) / r0.length);
    if (Math.abs(Math.log(rho2 / rho)) > 0.5) {
      rho = rho2;
      ({ D, N } = sample(rho));
    }
  }
  return { den: cleanPoly(D, rho), num: cleanPoly(N, rho), rho };
}

function inputSource(ckt: Circuit, ref: unknown): CEl {
  if (typeof ref !== 'string') throw new AnalysisError('input: must be the ref of an independent source');
  const el = ckt.element(ref);
  if (!isIndependent(el)) throw new AnalysisError(`input: "${ref}" must be an independent V or I source`);
  return el;
}

/** Network function H(s) = output / input source, zero initial state, other sources zero. */
export function networkFunction(netlist: Netlist, input: string, out: OutSpec): NetworkFunction {
  const ckt = structural(netlist);
  const src = inputSource(ckt, input);
  const { den, num, rho } = rawFunction(ckt, src, out);
  if (num.every((c) => c === 0)) return { num: [0], den: [1], poles: [], zeros: [] };
  const k = num[num.length - 1] / den[den.length - 1];
  const p = polyRoots(den);
  const z = polyRoots(num);
  // cancel common roots
  const tol = 1e-4 * Math.max(rho, ...p.map(abs), ...z.map(abs));
  const keepP: Complex[] = [];
  const zLeft = z.slice();
  for (const pp of p) {
    let best = -1;
    let bd = Infinity;
    zLeft.forEach((zz, i) => {
      const d = abs(sub(zz, pp));
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    if (best >= 0 && bd <= tol) zLeft.splice(best, 1);
    else keepP.push(pp);
  }
  const poles = tidy(keepP, rho);
  const zeros = tidy(zLeft, rho);
  const numC = polyFromRoots(zeros, k);
  const denC = polyFromRoots(poles, 1);
  const sc = Math.max(...numC.map(Math.abs));
  return { num: numC.map((c) => (Math.abs(c) <= 1e-12 * sc ? 0 : c)), den: denC.map((c) => (Math.abs(c) <= 1e-12 ? 0 : c)), poles, zeros };
}

/** H(s) evaluated at one complex frequency. */
export function transferAt(netlist: Netlist, input: string, out: OutSpec, s: Complex): Complex {
  const ckt = structural(netlist);
  const src = inputSource(ckt, input);
  const sys = systemAt(ckt, s);
  if (!sys.error)
    return outValue(
      sys.solve((el) => (el === src ? ONE : ZERO)),
      out,
    );
  const h = networkFunction(netlist, input, out);
  const d = horner(h.den, s);
  if (abs(d) <= 1e-12 * Math.max(...h.den.map(Math.abs))) throw new AnalysisError(`H(s): s = ${fmtS(s)} is a pole of the network function`);
  return div(horner(h.num, s), d);
}

/** BIBO stability of H(s) from its poles: all in the left half plane → stable; simple poles on
 *  the jω axis → marginal (sustained oscillation / constant); otherwise unstable. */
export function stability(netlist: Netlist, input: string, out: OutSpec): 'stable' | 'marginal' | 'unstable' {
  const { poles } = networkFunction(netlist, input, out);
  const sc = Math.max(1e-300, ...poles.map(abs));
  let marginal = false;
  for (let i = 0; i < poles.length; i++) {
    const p = poles[i];
    if (p.re > 1e-9 * sc) return 'unstable';
    if (p.re >= -1e-9 * sc) {
      if (poles.some((q, j) => j !== i && abs(sub(q, p)) <= 1e-6 * sc)) return 'unstable';
      marginal = true;
    }
  }
  return marginal ? 'marginal' : 'stable';
}

// ---------------- transform of the actual response ----------------

/** Laplace transform (for t ≥ 0) of an independent source's waveform. */
function sourceTransform(el: CEl, s: Complex): Complex {
  const sp = el.src!;
  const step = (a: number) => div(cx(a), s);
  switch (sp.kind) {
    case 'num':
      return step(sp.value);
    case 'dcac':
      if (sp.ac && sp.ac.mag !== 0) throw new AnalysisError(`${el.ref}: a phasor source has no Laplace transform here; use {sin} in a transient problem`);
      return step(sp.dc);
    case 'step':
      return step(sp.after);
    case 'exp':
      return div(cx(sp.amp), add(s, cx(sp.alpha)));
    case 'impulse':
      return cx(sp.area);
    case 'sin': {
      const w = 2 * Math.PI * sp.freq;
      const ph = (sp.phase * Math.PI) / 180;
      const n = add(cx(sp.amp * w * Math.cos(ph)), scale(s, sp.amp * Math.sin(ph)));
      return add(div(n, add(mul(s, s), cx(w * w))), step(sp.offset));
    }
  }
}

/** poles contributed by the sources' transforms */
function sourcePoles(ckt: Circuit): Complex[] {
  const out: Complex[] = [];
  for (const el of ckt.els) {
    const sp = el.src;
    if (!sp) continue;
    if ((sp.kind === 'num' && sp.value !== 0) || (sp.kind === 'dcac' && sp.dc !== 0) || (sp.kind === 'step' && sp.after !== 0) || (sp.kind === 'sin' && sp.offset !== 0))
      out.push(ZERO);
    if (sp.kind === 'exp' && sp.amp !== 0) out.push(cx(-sp.alpha));
    if (sp.kind === 'sin' && sp.amp !== 0) {
      const w = 2 * Math.PI * sp.freq;
      out.push(cx(0, w), cx(0, -w));
    }
  }
  return out;
}

/** The s-domain ("运算") circuit: every source replaced by its transform, every capacitor by
 *  1/(sC) with the internal current source C·u_C(0−), every inductor by sL with L·i_L(0−). */
export class Laplace {
  readonly ckt: Circuit;
  readonly init: Map<string, number>;

  constructor(readonly netlist: Netlist) {
    this.ckt = new Circuit(netlist);
    this.init = new Transient(this.ckt).initialStates();
  }

  solution(s: Complex): Solution {
    const sys = systemAt(this.ckt, s);
    if (sys.error) throw sys.error;
    const b = sys.rhs((el) => sourceTransform(el, s));
    for (const el of this.ckt.els) {
      const row = sys.varOf.get(el.ref);
      if (row === undefined) continue;
      if (el.type === 'C') b[row] = add(b[row], cx(el.value * (this.init.get(el.ref) ?? 0)));
      // row: U − sL·I − Σ sM·I_k = −L·i(0−) − Σ M·i_k(0−)
      else if (el.type === 'L') {
        let flux = el.value * (this.init.get(el.ref) ?? 0);
        for (const k of this.ckt.mutual) {
          const other = k.l1 === el.ref ? k.l2 : k.l2 === el.ref ? k.l1 : null;
          if (other) flux += k.M * (this.init.get(other) ?? 0);
        }
        b[row] = sub(b[row], cx(flux));
      }
    }
    return new Solution(sys, sys.solveVec(b));
  }

  /** Y(s) of an output */
  at(out: OutSpec, s: Complex): Complex {
    return outValue(this.solution(s), out);
  }

  /** all points where Y(s) may have a pole: natural frequencies and source poles */
  candidatePoles(): Complex[] {
    const ckt = structural(this.netlist);
    const K = storageCount(ckt);
    let nat: Complex[] = [];
    if (K) {
      const rho = typicalRate(ckt);
      const D = cleanPoly(
        interpolate((s) => det(systemAt(ckt, s).matrix), K, rho),
        rho,
      );
      nat = tidy(polyRoots(D), rho);
    }
    return [...nat, ...sourcePoles(this.ckt)];
  }

  /** Partial-fraction coefficient of 1/(s − p)^order in Y(s) at the pole p closest to `at`. */
  residue(out: OutSpec, at: Complex, order = 1): Complex {
    if (!Number.isInteger(order) || order < 1) throw new AnalysisError('residue: "order" must be 1, 2, …');
    const cand = this.candidatePoles();
    const sc = Math.max(1, ...cand.map(abs));
    let p: Complex | null = null;
    for (const c of cand) if (abs(sub(c, at)) <= 1e-3 * Math.max(1, abs(c)) && (!p || abs(sub(c, at)) < abs(sub(p, at)))) p = c;
    if (!p) throw new AnalysisError(`residue: s = ${fmtS(at)} is not a pole of the response (possible poles: ${cand.map(fmtS).join(', ') || 'none'})`);
    const center = p;
    const others = cand.filter((c) => abs(sub(c, center)) > 1e-4 * sc);
    const dmin = others.length ? Math.min(...others.map((c) => abs(sub(c, center)))) : sc;
    const rho = 0.3 * dmin;
    const M = 64;
    let acc = ZERO;
    for (let j = 0; j < M; j++) {
      const e = expi(0.1 + (2 * Math.PI * j) / M);
      const y = this.at(out, add(center, scale(e, rho)));
      acc = add(acc, mul(y, scale(expi(order * (0.1 + (2 * Math.PI * j) / M)), rho ** order)));
    }
    return scale(acc, 1 / M);
  }
}

/** Numerical inverse Laplace transform f(t), t > 0 (fixed Talbot contour, Abate & Valkó 2004).
 *  All singularities of F must lie left of Re s = 2M/(5t) and inside the contour. */
export function inverseLaplace(F: (s: Complex) => Complex, t: number, M = 32): number {
  if (!(t > 0)) throw new AnalysisError('inverseLaplace: t must be > 0');
  const r = (2 * M) / (5 * t);
  let sum = 0.5 * Math.exp(r * t) * F(cx(r)).re;
  for (let k = 1; k < M; k++) {
    const th = (k * Math.PI) / M;
    const cot = Math.cos(th) / Math.sin(th);
    const s = cx(r * th * cot, r * th);
    const sigma = th + (th * cot - 1) * cot;
    const est = mul(cx(Math.exp(s.re * t) * Math.cos(s.im * t), Math.exp(s.re * t) * Math.sin(s.im * t)), F(s));
    sum += mul(est, cx(1, sigma)).re;
  }
  return (r / M) * sum;
}

// ---------------- quantities for problem files ----------------

export const SDOMAIN_KINDS = ['H', 'pole', 'zero', 'hcoef', 'residue'] as const;
export type SdomainKind = (typeof SDOMAIN_KINDS)[number];
export const isSdomainKind = (k: unknown): k is SdomainKind => (SDOMAIN_KINDS as readonly unknown[]).includes(k);

/** s given as a number or {re, im} */
export function complexArg(v: unknown, what: string): Complex {
  if (typeof v === 'number' && Number.isFinite(v)) return cx(v);
  if (v && typeof v === 'object') {
    const o = v as { re?: unknown; im?: unknown };
    const re = o.re === undefined ? 0 : o.re;
    const im = o.im === undefined ? 0 : o.im;
    if (typeof re === 'number' && typeof im === 'number' && Number.isFinite(re) && Number.isFinite(im)) return cx(re, im);
  }
  throw new AnalysisError(`${what}: must be a number or {"re": …, "im": …}`);
}

export interface SdomainVal {
  value: Complex;
  complex: boolean;
  defaultPart?: 're';
}

/** Engine side of the s-domain `find` kinds (see docs/PROBLEM_FORMAT.md §6.1.7). */
export function sdomainQuantity(netlist: Netlist, analysisType: string, find: Record<string, unknown>): SdomainVal {
  const kind = find.kind as SdomainKind;
  const cplx = (z: Complex): SdomainVal => ({ value: z, complex: true, defaultPart: 're' });
  const out = find.out as OutSpec;
  if (kind === 'residue') {
    if (analysisType !== 'tran')
      throw new AnalysisError('residue: needs a transient problem (analysis {"type": "tran"}): it is a partial-fraction coefficient of the response for t > 0');
    const order = find.order === undefined ? 1 : (find.order as number);
    return cplx(new Laplace(netlist).residue(out, complexArg(find.at, 'residue.at'), order));
  }
  const input = find.input as string;
  if (kind === 'H') return cplx(transferAt(netlist, input, out, complexArg(find.s, 'H.s')));
  const h = networkFunction(netlist, input, out);
  if (kind === 'pole' || kind === 'zero') {
    const list = kind === 'pole' ? h.poles : h.zeros;
    const n = find.n as number;
    const name = kind === 'pole' ? 'poles' : 'finite zeros';
    if (!Number.isInteger(n) || n < 1 || n > list.length)
      throw new AnalysisError(`${kind}: n must be 1…${list.length} (the ${name} of H(s) are ${list.length ? list.map(fmtS).join(', ') : 'none'})`);
    return cplx(list[n - 1]);
  }
  // hcoef
  const which = find.of === 'num' ? h.num : find.of === 'den' ? h.den : null;
  if (!which) throw new AnalysisError('hcoef: "of" must be "num" or "den"');
  const pw = find.power as number;
  if (!Number.isInteger(pw) || pw < 0) throw new AnalysisError('hcoef: "power" must be 0, 1, 2, …');
  return { value: cx(pw < which.length ? which[pw] : 0), complex: false };
}
