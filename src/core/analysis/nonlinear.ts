// Nonlinear resistors (textbook ch. 17, resistive circuits only): element laws, the DC
// operating-point solver and the small-signal linearisation.
//
// An NR element's characteristic is a list of *pieces*. Each piece is a polynomial in one
// control variable on an interval of that variable:
//   x = 'u' (voltage-controlled piece):  i = P(u),  u ∈ [lo, hi]
//   x = 'i' (current-controlled piece):  u = P(i),  i ∈ [lo, hi]
// A piecewise-linear table (a polyline in the u–i plane), the ideal diode and the
// ideal-diode-plus-threshold model are all made of degree ≤ 1 pieces (a vertical segment is a
// current-controlled piece u = const). Laws given in the problem file:
//   { "i": [c0, c1, c2, …] }                 i = c0 + c1·u + c2·u² + …   (optional "umin" / "umax")
//   { "u": [c0, c1, c2, …] }                 u = c0 + c1·i + c2·i² + …   (optional "imin" / "imax")
//   { "pwl": [[u0, i0], [u1, i1], …] }        polyline through the points, end segments extended as rays
//   { "diode": {} } / { "diode": { "uon": 0.7, "ron": 10 } }   ideal diode (+ threshold, + series resistance)
// Outside umin / umax (imin / imax) a polynomial law continues as the constant value it has at the
// boundary (e.g. i = 2u² for u ≥ 0 and i = 0 for u < 0 with "umin": 0).
//
// Operating points: every combination of pieces (one per NR element) is solved. The engine
// replaces each NR element by a *linear branch* a·u + b·i = c (CEl.lin, stamped by the MNA like
// any other two-terminal relation). When at most one element sits on a curved piece the problem
// is reduced exactly to one polynomial equation in that element's control variable (the rest of
// the circuit, seen from its terminals, is a linear relation α·u + β·i = γ — the "load line"),
// whose real roots on the piece's interval are found by monotone bracketing + bisection. So for
// such circuits ALL operating points are found. With several elements on curved pieces at once a
// damped Newton iteration is run from many starting points (documented as not guaranteed
// complete). Every candidate is re-checked by solving the full circuit with the elements replaced
// by their tangent lines at the point and substituting back into each element law.

import type { Complex } from '../problem/types';
import type { CEl } from './circuit';
import { AnalysisError } from './errors';

export interface Piece {
  x: 'u' | 'i';
  /** polynomial coefficients, ascending powers */
  c: number[];
  lo: number;
  hi: number;
}

export interface NlLaw {
  pieces: Piece[];
  /** the ideal-diode family (drawn with the diode symbol) */
  diode: boolean;
}

/** Linear branch relation a·u + b·i = c that stands in for an NR element in one MNA solve. */
export interface Lin {
  a: number;
  b: number;
  c: number;
}

export interface OpPoint {
  /** element voltage / current (passive convention) of every NR element, by ref */
  u: Record<string, number>;
  i: Record<string, number>;
  /** index of the piece each element is on */
  piece: Record<string, number>;
}

// ---------------------------------------------------------------- polynomials

export const polyEval = (c: number[], x: number): number => {
  let y = 0;
  for (let k = c.length - 1; k >= 0; k--) y = y * x + c[k];
  return y;
};
export const polyDeriv = (c: number[]): number[] => c.slice(1).map((v, k) => v * (k + 1));
const trim = (c: number[]): number[] => {
  const s = Math.max(1e-300, ...c.map(Math.abs));
  const out = [...c];
  while (out.length > 1 && Math.abs(out[out.length - 1]) <= 1e-13 * s) out.pop();
  return out;
};

/** Real roots of the polynomial c on [lo, hi] (lo/hi may be ±Infinity), ascending, each once.
 *  Throws when the polynomial is identically zero (every point is a root). */
export function realRoots(c0: number[], lo: number, hi: number): number[] {
  const c = trim(c0);
  const n = c.length - 1;
  const scale = Math.max(...c.map(Math.abs));
  if (n === 0) {
    if (Math.abs(c[0]) <= 1e-13 * Math.max(scale, 1e-300) || c[0] === 0) throw new AnalysisError('INFINITE');
    return [];
  }
  // Cauchy bound: every real root lies in [−B, B]
  const B = 1 + Math.max(...c.slice(0, n).map((v) => Math.abs(v / c[n])));
  const L = Math.max(lo, -B - 1);
  const H = Math.min(hi, B + 1);
  if (L > H) return [];
  if (n === 1) {
    const r = -c[0] / c[1];
    return r >= L - 1e-12 * (1 + Math.abs(r)) && r <= H + 1e-12 * (1 + Math.abs(r)) ? [r] : [];
  }
  // monotone pieces between the critical points
  let crit: number[];
  try {
    crit = realRoots(polyDeriv(c), L, H);
  } catch {
    crit = [];
  }
  const knots = [L, ...crit.filter((x) => x > L && x < H), H];
  const f = (x: number) => polyEval(c, x);
  // a knot (interval end or critical point) is a root when P vanishes there relative to the size of its terms
  const tolAt = (x: number) => 1e-10 * c.reduce((s, v, k) => s + Math.abs(v) * Math.abs(x) ** k, 0);
  const out: number[] = [];
  const push = (r: number) => {
    if (!out.some((x) => Math.abs(x - r) <= 1e-9 * Math.max(1, Math.abs(r)))) out.push(r);
  };
  for (let k = 0; k < knots.length; k++) if (Math.abs(f(knots[k])) <= tolAt(knots[k])) push(knots[k]);
  for (let k = 0; k + 1 < knots.length; k++) {
    let a = knots[k];
    let b = knots[k + 1];
    let fa = f(a);
    const fb = f(b);
    if (fa === 0 || fb === 0 || Math.sign(fa) === Math.sign(fb)) continue;
    for (let it = 0; it < 300 && b - a > 1e-15 * Math.max(1, Math.abs(a), Math.abs(b)); it++) {
      const m = (a + b) / 2;
      const fm = f(m);
      if (fm === 0) {
        a = b = m;
        break;
      }
      if (Math.sign(fm) === Math.sign(fa)) {
        a = m;
        fa = fm;
      } else b = m;
    }
    push((a + b) / 2);
  }
  return out.sort((x, y) => x - y);
}

// ---------------------------------------------------------------- laws

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function coefList(ref: string, v: unknown, what: string): number[] {
  if (!Array.isArray(v) || v.length === 0 || !v.every(isNum))
    throw new AnalysisError(`${ref}.law.${what}: must be a list of polynomial coefficients [c0, c1, c2, …] (numbers)`);
  if (v.length > 8) throw new AnalysisError(`${ref}.law.${what}: at most degree 7`);
  if (v.every((x) => x === 0)) throw new AnalysisError(`${ref}.law.${what}: all coefficients are zero`);
  return v as number[];
}

/** polyline in the u–i plane → pieces (end segments extended as rays) */
function pwlPieces(ref: string, pts: [number, number][]): Piece[] {
  const out: Piece[] = [];
  const last = pts.length - 2;
  for (let k = 0; k <= last; k++) {
    const [u0, i0] = pts[k];
    const [u1, i1] = pts[k + 1];
    if (u0 === u1 && i0 === i1) throw new AnalysisError(`${ref}.law.pwl: points ${k} and ${k + 1} are the same point`);
    const vertical = u0 === u1;
    const [x0, x1] = vertical ? [i0, i1] : [u0, u1];
    let lo = Math.min(x0, x1);
    let hi = Math.max(x0, x1);
    // extend the first segment beyond point 0 and the last one beyond the final point
    if (k === 0) x0 < x1 ? (lo = -Infinity) : (hi = Infinity);
    if (k === last) x1 > x0 ? (hi = Infinity) : (lo = -Infinity);
    if (vertical) out.push({ x: 'i', c: [u0], lo, hi });
    else {
      const m = (i1 - i0) / (u1 - u0);
      out.push({ x: 'u', c: [i0 - m * u0, m], lo, hi });
    }
  }
  return out;
}

function polyPieces(x: 'u' | 'i', c: number[], min: number | undefined, max: number | undefined): Piece[] {
  const lo = min ?? -Infinity;
  const hi = max ?? Infinity;
  const out: Piece[] = [];
  if (min !== undefined) out.push({ x, c: [polyEval(c, min)], lo: -Infinity, hi: min });
  out.push({ x, c, lo, hi });
  if (max !== undefined) out.push({ x, c: [polyEval(c, max)], lo: max, hi: Infinity });
  return out;
}

export function parseLaw(ref: string, raw: unknown): NlLaw {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new AnalysisError(`${ref}: a nonlinear resistor (type NR) needs "law": {"i": [...]}, {"u": [...]}, {"pwl": [[u, i], ...]} or {"diode": {...}}`);
  const o = raw as Record<string, unknown>;
  const keys = ['i', 'u', 'pwl', 'diode'].filter((k) => k in o);
  if (keys.length !== 1) throw new AnalysisError(`${ref}.law: give exactly one of "i" (voltage-controlled polynomial), "u" (current-controlled polynomial), "pwl" or "diode"`);
  const opt = (k: string): number | undefined => {
    if (o[k] === undefined) return undefined;
    if (!isNum(o[k])) throw new AnalysisError(`${ref}.law.${k}: must be a number`);
    return o[k] as number;
  };
  switch (keys[0]) {
    case 'i':
    case 'u': {
      const x = keys[0] === 'i' ? 'u' : 'i';
      const c = coefList(ref, o[keys[0]], keys[0]);
      for (const k of Object.keys(o))
        if (![keys[0], `${x}min`, `${x}max`].includes(k)) throw new AnalysisError(`${ref}.law: unknown field "${k}" (a law "${keys[0]}": [...] takes "${x}min" / "${x}max")`);
      const min = opt(`${x}min`);
      const max = opt(`${x}max`);
      if (min !== undefined && max !== undefined && !(min < max)) throw new AnalysisError(`${ref}.law: ${x}min must be less than ${x}max`);
      return { pieces: polyPieces(x, c, min, max), diode: false };
    }
    case 'pwl': {
      const p = o.pwl;
      if (!Array.isArray(p) || p.length < 2 || !p.every((q) => Array.isArray(q) && q.length === 2 && q.every(isNum)))
        throw new AnalysisError(`${ref}.law.pwl: must be a list of at least two [u, i] points`);
      return { pieces: pwlPieces(ref, p as [number, number][]), diode: false };
    }
    default: {
      const d = o.diode;
      if (d !== true && (!d || typeof d !== 'object' || Array.isArray(d))) throw new AnalysisError(`${ref}.law.diode: must be {} or {"uon": 0.7, "ron": 10}`);
      const dd = (d === true ? {} : d) as Record<string, unknown>;
      for (const k of Object.keys(dd)) if (k !== 'uon' && k !== 'ron') throw new AnalysisError(`${ref}.law.diode: unknown field "${k}" (use "uon", "ron")`);
      const uon = dd.uon === undefined ? 0 : dd.uon;
      const ron = dd.ron === undefined ? 0 : dd.ron;
      if (!isNum(uon) || !isNum(ron) || ron < 0) throw new AnalysisError(`${ref}.law.diode: "uon" must be a number and "ron" a number ≥ 0`);
      return { pieces: pwlPieces(ref, [[uon - 1, 0], [uon, 0], [uon + ron, 1]]), diode: true };
    }
  }
}

// ---------------------------------------------------------------- pieces

/** element (u, i) at control value x on a piece */
export const pointOn = (p: Piece, x: number): { u: number; i: number } => (p.x === 'u' ? { u: x, i: polyEval(p.c, x) } : { u: polyEval(p.c, x), i: x });

/** du/di of a piece at control value x (Infinity for a zero-slope voltage-controlled piece) */
export function dynamicR(p: Piece, x: number): number {
  const d = polyEval(polyDeriv(p.c), x);
  if (p.x === 'i') return d;
  return d === 0 ? Infinity : 1 / d;
}

/** tangent line of the piece at x as a branch relation a·u + b·i = c (passes through the point) */
export function tangent(p: Piece, x: number, withConst = true): Lin {
  const y = polyEval(p.c, x);
  const s = polyEval(polyDeriv(p.c), x);
  // x = u: i − s·u = y − s·x ;  x = i: u − s·i = y − s·x
  return p.x === 'u' ? { a: -s, b: 1, c: withConst ? y - s * x : 0 } : { a: 1, b: -s, c: withConst ? y - s * x : 0 };
}

const inRange = (p: Piece, x: number) => {
  const t = 1e-9 * Math.max(1, Math.abs(x));
  return x >= p.lo - t && x <= p.hi + t;
};

/** pieces the point (u, i) lies on */
export function piecesAt(law: NlLaw, u: number, i: number): number[] {
  const out: number[] = [];
  law.pieces.forEach((p, k) => {
    const x = p.x === 'u' ? u : i;
    const y = p.x === 'u' ? i : u;
    const fy = polyEval(p.c, x);
    if (inRange(p, x) && Math.abs(fy - y) <= 1e-7 * Math.max(1, Math.abs(y), Math.abs(fy))) out.push(k);
  });
  return out;
}

// ---------------------------------------------------------------- operating points

/** solve hook: element current and voltage of an NR element in a full MNA solve */
export interface Solver {
  /** solve the DC circuit with every NR element's `lin` as set; returns u, i of each NR, or null if singular */
  solve(): { u: (ref: string) => number; i: (ref: string) => number } | null;
}

const MAX_COMBOS = 4096;

export function operatingPoints(nls: CEl[], solver: Solver): OpPoint[] {
  const laws = nls.map((e) => e.nl!);
  let combos = 1;
  for (const l of laws) combos *= l.pieces.length;
  if (combos > MAX_COMBOS) throw new AnalysisError(`Too many piece combinations of the nonlinear resistors (${combos}); simplify the characteristics`);
  const found: OpPoint[] = [];
  const add = (p: OpPoint) => {
    const same = (a: OpPoint) => nls.every((e) => near(a.u[e.ref], p.u[e.ref]) && near(a.i[e.ref], p.i[e.ref]));
    if (!found.some(same)) found.push(p);
  };
  const idx = new Array<number>(nls.length).fill(0);
  for (let n = 0; n < combos; n++) {
    let r = n;
    for (let k = 0; k < nls.length; k++) {
      idx[k] = r % laws[k].pieces.length;
      r = Math.floor(r / laws[k].pieces.length);
    }
    const pcs = idx.map((j, k) => laws[k].pieces[j]);
    const curved = pcs.map((p, k) => (trim(p.c).length > 2 ? k : -1)).filter((k) => k >= 0);
    for (const p of curved.length <= 1 ? scalarCombo(nls, pcs, curved[0] ?? 0, solver) : newtonCombo(nls, pcs, solver)) add(p);
  }
  for (const e of nls) e.lin = undefined;
  const first = nls[0].ref;
  return found.sort((a, b) => (near(a.u[first], b.u[first]) ? a.i[first] - b.i[first] : a.u[first] - b.u[first]));
}

const near = (a: number, b: number) => Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));

/** set every element on its piece's linear relation (degree ≤ 1 pieces) */
const linOf = (p: Piece): Lin => tangent(p, 0);

/** Branch relations that fix each curved element at the point (u, i) of its piece at xs[k] —
 *  first its tangent line there, then (substitution theorem) a voltage source u or a current
 *  source i. The tangent fails when it is parallel to the load line, i.e. when the load line
 *  touches the curve (a double root): the linearised circuit is then singular although the point
 *  is a perfectly good operating point. Linear pieces always stay on their own line. */
function substitutions(pcs: Piece[], xs: number[]): Lin[][] {
  const tangents = pcs.map((p, k) => tangent(p, xs[k]));
  const curved = pcs.map((p) => trim(p.c).length > 2);
  const bySource = (useU: boolean) =>
    pcs.map((p, k) => {
      if (!curved[k]) return tangents[k];
      const pt = pointOn(p, xs[k]);
      return useU ? { a: 1, b: 0, c: pt.u } : { a: 0, b: 1, c: pt.i };
    });
  return curved.some((c) => c) ? [tangents, bySource(true), bySource(false)] : [tangents];
}

/** Solve the DC circuit with each NR element fixed at its point (see substitutions); null if every
 *  choice is singular. Leaves the successful relations in e.lin. */
export function solveAt(nls: CEl[], pcs: Piece[], xs: number[], solver: Solver): ReturnType<Solver['solve']> {
  for (const lins of substitutions(pcs, xs)) {
    nls.forEach((e, k) => (e.lin = lins[k]));
    const s = solver.solve();
    if (s) return s;
  }
  return null;
}

/** Re-solve with all elements fixed at their current control values and check the laws. */
function verify(nls: CEl[], pcs: Piece[], xs: number[], solver: Solver): OpPoint | null {
  const s = solveAt(nls, pcs, xs, solver);
  if (!s) return null;
  const pt: OpPoint = { u: {}, i: {}, piece: {} };
  for (let k = 0; k < nls.length; k++) {
    const e = nls[k];
    const u = s.u(e.ref);
    const i = s.i(e.ref);
    const p = pcs[k];
    const x = p.x === 'u' ? u : i;
    const y = p.x === 'u' ? i : u;
    const fy = polyEval(p.c, x);
    if (!inRange(p, x) || !(Math.abs(fy - y) <= 1e-7 * Math.max(1, Math.abs(y), Math.abs(fy)))) return null;
    pt.u[e.ref] = u;
    pt.i[e.ref] = i;
    pt.piece[e.ref] = e.nl!.pieces.indexOf(p);
  }
  return pt;
}

/** At most one curved piece (element j): reduce exactly to a polynomial in x_j. */
function scalarCombo(nls: CEl[], pcs: Piece[], j: number, solver: Solver): OpPoint[] {
  nls.forEach((e, k) => (e.lin = linOf(pcs[k])));
  const ej = nls[j];
  // the rest of the circuit seen from element j: α·u + β·i = γ
  const rel = restRelation(ej, solver);
  if (!rel) return [];
  const { alpha, beta, gamma } = rel;
  const p = pcs[j];
  // x = u: α·u + β·P(u) − γ ;  x = i: α·P(i) + β·i − γ
  const k1 = p.x === 'u' ? alpha : beta;
  const kP = p.x === 'u' ? beta : alpha;
  const deg = Math.max(p.c.length, 2);
  const poly = new Array<number>(deg).fill(0);
  p.c.forEach((v, n) => (poly[n] += kP * v));
  poly[0] -= gamma;
  poly[1] += k1;
  let roots: number[];
  try {
    roots = realRoots(poly, p.lo, p.hi);
  } catch (e) {
    if (!(e instanceof AnalysisError && e.message === 'INFINITE')) throw e;
    // the piece lies on the load line: every x on it satisfies element j and the rest — unless the
    // other elements leave their own pieces. Intersect the allowed x-ranges (all affine in x).
    const drive = (x: number) => {
      ej.lin = p.x === 'u' ? { a: 1, b: 0, c: x } : { a: 0, b: 1, c: x };
      return solver.solve();
    };
    const s0 = drive(0);
    const s1 = drive(1);
    if (!s0 || !s1) return [];
    let L = p.lo;
    let H = p.hi;
    nls.forEach((e, k) => {
      if (k === j) return;
      const pk = pcs[k];
      const v0 = pk.x === 'u' ? s0.u(e.ref) : s0.i(e.ref);
      const m = (pk.x === 'u' ? s1.u(e.ref) : s1.i(e.ref)) - v0;
      if (m === 0) {
        if (!(v0 >= pk.lo && v0 <= pk.hi)) L = Infinity;
        return;
      }
      const a = (pk.lo - v0) / m;
      const b = (pk.hi - v0) / m;
      L = Math.max(L, Math.min(a, b));
      H = Math.min(H, Math.max(a, b));
    });
    const tol = 1e-9 * Math.max(1, Math.abs(L), Math.abs(H));
    if (!(L <= H + tol)) return [];
    if (H - L > tol)
      throw new AnalysisError(
        `${ej.ref}: a straight part of its characteristic lies exactly on the load line of the rest of the circuit, so there are infinitely many operating points`,
      );
    roots = [(L + H) / 2];
  }
  const out: OpPoint[] = [];
  for (const x of roots) {
    const xs = nls.map((_, k) => (k === j ? x : 0));
    // the other elements are linear: their tangent at any x is the piece itself
    const pt = verify(nls, pcs, xs, solver);
    if (pt) out.push(pt);
  }
  return out;
}

/** linear relation α·u + β·i = γ imposed on element e by the rest of the circuit (others' lin fixed) */
export function restRelation(e: CEl, solver: Solver): { alpha: number; beta: number; gamma: number } | null {
  const keep = e.lin;
  try {
    // drive it with a voltage source u = x: i = i0 + (i1 − i0)·u
    e.lin = { a: 1, b: 0, c: 0 };
    const s0 = solver.solve();
    e.lin = { a: 1, b: 0, c: 1 };
    const s1 = solver.solve();
    if (s0 && s1) {
      const i0 = s0.i(e.ref);
      const i1 = s1.i(e.ref);
      return { alpha: i1 - i0, beta: -1, gamma: -i0 };
    }
    // a current source i = x: u = u0 + (u1 − u0)·i
    e.lin = { a: 0, b: 1, c: 0 };
    const t0 = solver.solve();
    e.lin = { a: 0, b: 1, c: 1 };
    const t1 = solver.solve();
    if (t0 && t1) {
      const u0 = t0.u(e.ref);
      const u1 = t1.u(e.ref);
      return { alpha: 1, beta: -(u1 - u0), gamma: u0 };
    }
    return null;
  } finally {
    e.lin = keep;
  }
}

/** Two or more curved pieces: damped Newton from many starting points. */
function newtonCombo(nls: CEl[], pcs: Piece[], solver: Solver): OpPoint[] {
  const starts = (p: Piece): number[] => {
    const lo = Number.isFinite(p.lo) ? p.lo : null;
    const hi = Number.isFinite(p.hi) ? p.hi : null;
    if (lo !== null && hi !== null) return [lo, (lo + hi) / 2, hi, lo + (hi - lo) / 4, hi - (hi - lo) / 4];
    if (lo !== null) return [lo, lo + 0.1, lo + 1, lo + 10, lo + 100];
    if (hi !== null) return [hi, hi - 0.1, hi - 1, hi - 10, hi - 100];
    return [0, 0.5, -0.5, 3, -3, 30, -30];
  };
  const lists = pcs.map(starts);
  const out: OpPoint[] = [];
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let s = 0; s < 64; s++) {
    let xs = lists.map((l, k) => (s < l.length ? l[s] : l[Math.floor(rnd() * l.length)] * (0.5 + rnd()) + (k + 1) * (rnd() - 0.5)));
    let ok = false;
    for (let it = 0; it < 200; it++) {
      nls.forEach((e, k) => (e.lin = tangent(pcs[k], xs[k])));
      const sol = solver.solve();
      if (!sol) break;
      const nx = nls.map((e, k) => (pcs[k].x === 'u' ? sol.u(e.ref) : sol.i(e.ref)));
      let done = true;
      xs = xs.map((x, k) => {
        const lim = 2 * Math.max(1, Math.abs(x));
        const d = Math.max(-lim, Math.min(lim, nx[k] - x));
        if (Math.abs(d) > 1e-13 * Math.max(1, Math.abs(x))) done = false;
        return x + d;
      });
      if (!xs.every(Number.isFinite)) break;
      if (done) {
        ok = true;
        break;
      }
    }
    if (!ok) continue;
    const pt = verify(nls, pcs, xs, solver);
    if (pt && !out.some((a) => nls.every((e) => near(a.u[e.ref], pt.u[e.ref]) && near(a.i[e.ref], pt.i[e.ref])))) out.push(pt);
  }
  return out;
}

/** sample the characteristic for a plot: polylines of (u, i) inside the window */
export function sampleLaw(law: NlLaw, uMin: number, uMax: number, iMin: number, iMax: number, n = 160): [number, number][][] {
  const out: [number, number][][] = [];
  for (const p of law.pieces) {
    const [wl, wh] = p.x === 'u' ? [uMin, uMax] : [iMin, iMax];
    const lo = Math.max(p.lo, wl);
    const hi = Math.min(p.hi, wh);
    if (!(lo <= hi)) continue;
    const deg = trim(p.c).length - 1;
    const m = deg <= 1 ? 1 : n;
    const line: [number, number][] = [];
    for (let k = 0; k <= m; k++) {
      const x = lo + ((hi - lo) * k) / m;
      const { u, i } = pointOn(p, x);
      line.push([u, i]);
    }
    out.push(line);
  }
  return out;
}

export const toComplex = (x: number): Complex => ({ re: x, im: 0 });
