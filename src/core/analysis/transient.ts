// Transient analysis. t < 0: DC steady state (plus sinusoidal steady state of any sin sources)
// with switches / steps in their `before` state. t > 0: the circuit is linear time-invariant,
// so it is reduced to a state-space model s' = A·s + B·u(t) with states v_C and i_L (obtained
// from the "companion" resistive circuit where C → voltage source v_C and L → current source
// i_L). Inputs are constants and sinusoids, which are appended as extra states, and the state
// at time t is computed exactly with a matrix exponential — no time stepping, so stiff,
// lossless, under/over/critically damped circuits are all exact to ~1e-12.
//
// Capacitor loops / inductor cut-sets (e.g. parallel capacitors, series inductors) make the
// companion circuit singular; the dependent capacitors get a tiny series resistance and the
// dependent inductors a tiny parallel conductance (time constant 1e-8 of the circuit's fastest
// characteristic time), which reproduces charge/flux redistribution with negligible error.

import type { Complex } from '../problem/types';
import { Circuit, type CEl, isTwoTerminal } from './circuit';
import { ONE, ZERO, abs, cx, polarDeg } from './complex';
import { AnalysisError } from './errors';
import { type Mat, eigenvalues, expm, eye, matVec, realSolve, zeros } from './linalg';
import { MnaSystem, Solution, combine, switchClosed } from './mna';

interface AfterModel {
  sys: MnaSystem;
  states: CEl[];
  srcs: CEl[];
  Xs: Complex[][];
  Xu: Complex[][];
  A: Mat;
  /** B·P: effect of each basis signal [1, sin ω1t, cos ω1t, …] on s' */
  Bw: Mat;
  /** P[k][b]: coefficient of basis b in source k */
  P: Mat;
  omegas: number[];
  parasitic: Map<string, number>;
  tauPar: number;
}

const PARASITIC_RATIO = 1e-8;

/** fastest characteristic time from element values (RC, L/R, √LC) */
function charTime(ckt: Circuit): number {
  const R = ckt.els.filter((e) => e.type === 'R' && e.value !== 0).map((e) => Math.abs(e.value));
  const C = ckt.els.filter((e) => e.type === 'C').map((e) => e.value);
  const L = ckt.els.filter((e) => e.type === 'L').map((e) => e.value);
  let t = Infinity;
  for (const r of R) {
    for (const c of C) t = Math.min(t, r * c);
    for (const l of L) t = Math.min(t, l / r);
  }
  for (const l of L) for (const c of C) t = Math.min(t, Math.sqrt(l * c));
  return Number.isFinite(t) && t > 0 ? t : 1;
}

/** Capacitors closing loops of voltage-type branches, inductors forming cut-sets with
 *  current-type branches (normal-tree construction). */
function dependentStates(ckt: Circuit): CEl[] {
  const N = ckt.nodeNames.length;
  const mk = () => {
    const par = Array.from({ length: N }, (_, i) => i);
    const f = (x: number): number => (par[x] === x ? x : (par[x] = f(par[x])));
    return { f, join: (a: number, b: number) => (par[f(a)] = f(b)) };
  };
  const out: CEl[] = [];
  const vlike = (el: CEl): boolean => {
    switch (el.type) {
      case 'V':
      case 'VCVS':
      case 'CCVS':
      case 'ammeter':
        return true;
      case 'R':
        return el.value === 0;
      case 'SW':
        return switchClosed(el, 'after');
      default:
        return false;
    }
  };
  // C loops
  {
    const u = mk();
    for (const el of ckt.els) {
      if (isTwoTerminal(el) && vlike(el)) u.join(el.pins[0], el.pins[1]);
      else if (el.type === 'OPAMP') {
        u.join(el.pins[2], 0);
        u.join(el.pins[0], el.pins[1]);
      } else if (el.type === 'XFMR') {
        u.join(el.pins[0], el.pins[1]);
        u.join(el.pins[2], el.pins[3]);
      }
    }
    for (const el of ckt.els)
      if (el.type === 'C') {
        if (u.f(el.pins[0]) === u.f(el.pins[1])) out.push(el);
        else u.join(el.pins[0], el.pins[1]);
      }
  }
  // L cut-sets
  {
    const u = mk();
    for (const el of ckt.els) {
      if (isTwoTerminal(el)) {
        if (['L', 'I', 'VCCS', 'CCCS', 'voltmeter'].includes(el.type)) continue;
        if (el.type === 'SW' && !switchClosed(el, 'after')) continue;
        u.join(el.pins[0], el.pins[1]);
      } else if (el.type === 'OPAMP') u.join(el.pins[2], 0);
    }
    for (const el of ckt.els)
      if (el.type === 'L') {
        if (u.f(el.pins[0]) !== u.f(el.pins[1])) {
          out.push(el);
          u.join(el.pins[0], el.pins[1]);
        }
      }
  }
  return out;
}

const sameOmega = (a: number, b: number) => Math.abs(a - b) <= 1e-12 * Math.max(a, b);

export class Transient {
  private _model?: AfterModel;
  private _s0?: number[];
  private _preDC?: { sys: MnaSystem; x: Complex[] };
  private _preAC = new Map<number, Complex[]>();

  constructor(readonly ckt: Circuit) {
    for (const el of ckt.els)
      if (el.src?.kind === 'dcac' && el.src.ac && el.src.ac.mag !== 0)
        throw new AnalysisError(
          `${el.ref}: an AC phasor source ({ac: …}) cannot be used in transient analysis; describe it in the time domain with {sin: {amp, freq, phase}}`,
        );
  }

  private get sinSources(): CEl[] {
    return this.ckt.els.filter((e) => e.src?.kind === 'sin' && e.src.amp !== 0);
  }

  private omegas(): number[] {
    const out: number[] = [];
    for (const el of this.sinSources) {
      const w = 2 * Math.PI * (el.src as { freq: number }).freq;
      if (!out.some((o) => sameOmega(o, w))) out.push(w);
    }
    return out;
  }

  // ---------------- t < 0 ----------------

  private preDC(): { sys: MnaSystem; x: Complex[] } {
    if (this._preDC) return this._preDC;
    const sys = new MnaSystem(this.ckt, { kind: 'dc', phase: 'before', icFixed: true, label: 'the DC steady state before t = 0' });
    if (sys.error)
      throw new AnalysisError(
        `Cannot determine the initial state at t = 0−. ${sys.error.message} If a capacitor or inductor has no defined steady state before t = 0 (for example an uncharged capacitor cut off by an open switch), give it an initial value with "ic" (ic: 0 for an uncharged capacitor).`,
      );
    const x = sys.solveVec(
      sys.rhs((el) => {
        const s = el.src!;
        if (s.kind === 'num') return cx(s.value);
        if (s.kind === 'dcac') return cx(s.dc);
        if (s.kind === 'step') return cx(s.before);
        return cx(s.offset);
      }),
    );
    return (this._preDC = { sys, x });
  }

  private preAC(w: number): Complex[] {
    const hit = this._preAC.get(w);
    if (hit) return hit;
    const sys = new MnaSystem(this.ckt, { kind: 'ac', omega: w, phase: 'before', label: `the sinusoidal steady state before t = 0 (ω = ${w} rad/s)` });
    if (sys.error) throw new AnalysisError(`Cannot determine the sinusoidal steady state before t = 0: ${sys.error.message}`);
    const x = sys.solveVec(
      sys.rhs((el) => {
        const s = el.src!;
        if (s.kind === 'sin' && sameOmega(2 * Math.PI * s.freq, w)) return polarDeg(s.amp, s.phase - 90); // peak phasor, cos reference
        return ZERO;
      }),
    );
    this._preAC.set(w, x);
    return x;
  }

  /** steady state of the t < 0 circuit evaluated at time t (≤ 0) */
  pre(t: number): Solution {
    const { sys, x } = this.preDC();
    const parts: { k: Complex | number; x: Complex[] }[] = [{ k: 1, x }];
    for (const w of this.omegas()) {
      const X = this.preAC(w);
      // Re(X e^{jωt}) — take only the real part afterwards
      const k = cx(Math.cos(w * t), Math.sin(w * t));
      parts.push({ k, x: X });
    }
    const sol = combine(sys, parts);
    return new Solution(sys, sol.x.map((v) => cx(v.re)));
  }

  private s0(): number[] {
    if (this._s0) return this._s0;
    const m = this.model();
    const needPre = m.states.some((s) => s.ic === undefined);
    const pre = needPre ? this.pre(0) : null;
    return (this._s0 = m.states.map((s) => {
      if (s.ic !== undefined) return s.ic;
      return s.type === 'C' ? pre!.vEl(s.ref).re : pre!.i(s.ref).re;
    }));
  }

  // ---------------- t > 0 model ----------------

  model(): AfterModel {
    if (this._model) return this._model;
    const ckt = this.ckt;
    const states = ckt.els.filter((e) => e.type === 'C' || e.type === 'L');
    const srcs = ckt.els.filter((e) => e.type === 'V' || e.type === 'I');
    const label = 'the circuit for t > 0';
    let sys = new MnaSystem(ckt, { kind: 'res', phase: 'after', label });
    const parasitic = new Map<string, number>();
    let tauPar = 0;
    if (sys.error) {
      const dep = dependentStates(ckt);
      if (!dep.length) throw new AnalysisError(`Transient analysis: ${sys.error.message}`);
      tauPar = PARASITIC_RATIO * charTime(ckt);
      for (const d of dep) parasitic.set(d.ref, tauPar / d.value);
      sys = new MnaSystem(ckt, { kind: 'res', phase: 'after', label, parasitic });
      if (sys.error) throw new AnalysisError(`Transient analysis: ${sys.error.message}`);
    }
    const Xs = states.map((st) => sys.solveVec(sys.rhs(() => ZERO, (e) => (e === st ? 1 : 0))));
    const Xu = srcs.map((s) => sys.solveVec(sys.rhs((e) => (e === s ? ONE : ZERO))));

    // inductance matrix
    const Ls = states.filter((s) => s.type === 'L');
    const Lpos = new Map(Ls.map((l, i) => [l.ref, i]));
    const Lm = zeros(Ls.length, Ls.length);
    Ls.forEach((l, i) => (Lm[i][i] = l.value));
    for (const k of ckt.mutual) {
      const a = Lpos.get(k.l1)!;
      const b = Lpos.get(k.l2)!;
      Lm[a][b] += k.M;
      Lm[b][a] += k.M;
    }
    let Linv: Mat = [];
    if (Ls.length) {
      try {
        Linv = realSolve(Lm, eye(Ls.length));
      } catch {
        throw new AnalysisError('Transient analysis: perfectly coupled inductors (k = 1) make the inductance matrix singular; use k < 1 or an ideal transformer');
      }
    }
    const vIdx = (x: Complex[], p: number, q: number) => (p ? x[p - 1].re : 0) - (q ? x[q - 1].re : 0);
    const der = (x: Complex[]): number[] => {
      const d = new Array<number>(states.length).fill(0);
      const vL = Ls.map((l) => vIdx(x, l.pins[0], l.pins[1]));
      const di = Ls.length ? matVec(Linv, vL) : [];
      states.forEach((s, j) => {
        d[j] = s.type === 'C' ? x[sys.varOf.get(s.ref)!].re / s.value : di[Lpos.get(s.ref)!];
      });
      return d;
    };
    const n = states.length;
    const A = zeros(n, n);
    Xs.forEach((x, j) => der(x).forEach((v, i) => (A[i][j] = v)));
    const Bu = zeros(n, srcs.length);
    Xu.forEach((x, k) => der(x).forEach((v, i) => (Bu[i][k] = v)));

    const omegas = this.omegas();
    const nb = 1 + 2 * omegas.length;
    const P = zeros(srcs.length, nb);
    srcs.forEach((el, k) => {
      const s = el.src!;
      if (s.kind === 'num') P[k][0] = s.value;
      else if (s.kind === 'dcac') P[k][0] = s.dc;
      else if (s.kind === 'step') P[k][0] = s.after;
      else {
        P[k][0] = s.offset;
        const q = omegas.findIndex((w) => sameOmega(w, 2 * Math.PI * s.freq));
        if (q >= 0) {
          const ph = (s.phase * Math.PI) / 180;
          P[k][1 + 2 * q] = s.amp * Math.cos(ph); // amp·sin(ωt+φ) = amp cosφ sinωt + amp sinφ cosωt
          P[k][2 + 2 * q] = s.amp * Math.sin(ph);
        }
      }
    });
    const Bw = zeros(n, nb);
    for (let i = 0; i < n; i++) for (let b = 0; b < nb; b++) for (let k = 0; k < srcs.length; k++) Bw[i][b] += Bu[i][k] * P[k][b];
    return (this._model = { sys, states, srcs, Xs, Xu, A, Bw, P, omegas, parasitic, tauPar });
  }

  private basis(t: number): number[] {
    const m = this.model();
    const w = [1];
    for (const o of m.omegas) w.push(Math.sin(o * t), Math.cos(o * t));
    return w;
  }

  private statesAt(t: number): number[] {
    const m = this.model();
    const n = m.states.length;
    if (n === 0) return [];
    const nb = 1 + 2 * m.omegas.length;
    const M = zeros(n + nb, n + nb);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) M[i][j] = m.A[i][j] * t;
      for (let b = 0; b < nb; b++) M[i][n + b] = m.Bw[i][b] * t;
    }
    m.omegas.forEach((w, q) => {
      M[n + 1 + 2 * q][n + 2 + 2 * q] = w * t;
      M[n + 2 + 2 * q][n + 1 + 2 * q] = -w * t;
    });
    const z0 = [...this.s0(), ...this.basis(0)];
    const E = expm(M);
    const z = matVec(E, z0);
    for (const v of z) if (!Number.isFinite(v)) throw new AnalysisError(`Transient analysis: the response diverges numerically at t = ${t} s (unstable circuit?)`);
    return z.slice(0, n);
  }

  private solutionFrom(s: number[], t: number): Solution {
    const m = this.model();
    const w = this.basis(t);
    const parts: { k: number; x: Complex[] }[] = [];
    s.forEach((v, j) => parts.push({ k: v, x: m.Xs[j] }));
    m.srcs.forEach((_, k) => parts.push({ k: m.P[k].reduce((a, c, b) => a + c * w[b], 0), x: m.Xu[k] }));
    const sol = combine(m.sys, parts);
    return new Solution(m.sys, sol.x.map((v) => cx(v.re)));
  }

  /** Solution at an instant: '0-', '0+', 'inf' or a time in seconds (t = 0 means 0+). */
  at(t: number | '0-' | '0+' | 'inf'): Solution {
    if (t === '0-') return this.pre(0);
    if (t === 'inf') return this.final();
    if (typeof t === 'number' && !Number.isFinite(t)) throw new AnalysisError(`find.t must be finite (got ${t})`);
    if (typeof t === 'number' && t < 0) return this.pre(t);
    const m = this.model();
    if (t === '0+' || t === 0) {
      if (m.parasitic.size === 0) return this.solutionFrom(this.s0(), 0);
      const te = 40 * m.tauPar;
      return this.solutionFrom(this.statesAt(te), te);
    }
    if (typeof t !== 'number') throw new AnalysisError(`find.t must be a number of seconds, "0-", "0+" or "inf" (got ${JSON.stringify(t)})`);
    return this.solutionFrom(this.statesAt(t), t);
  }

  /** natural frequencies of the t > 0 circuit without the parasitic (regularisation) modes */
  naturalFrequencies(): Complex[] {
    const m = this.model();
    if (!m.states.length) return [];
    let lam: Complex[];
    try {
      lam = eigenvalues(m.A);
    } catch {
      throw new AnalysisError('Could not compute the natural frequencies of the circuit');
    }
    lam.sort((a, b) => abs(b) - abs(a));
    const k = m.parasitic.size;
    if (k) {
      const dropped = lam.slice(0, k);
      const rest = lam.slice(k);
      const minDrop = Math.min(...dropped.map(abs));
      const maxRest = rest.length ? Math.max(...rest.map(abs)) : 0;
      if (!(maxRest <= 1e-3 * minDrop))
        throw new AnalysisError('Could not separate the natural frequencies of a circuit with capacitor loops / inductor cut-sets');
      lam = rest;
    }
    return lam;
  }

  tau(): number {
    const m = this.model();
    if (!m.states.length) throw new AnalysisError('tau: the circuit has no capacitor or inductor for t > 0');
    const lam = this.naturalFrequencies();
    const maxAbs = Math.max(0, ...lam.map(abs));
    if (maxAbs === 0) throw new AnalysisError('tau: the energy-storage element has no (dis)charging path for t > 0 (time constant is infinite)');
    const nz = lam.filter((l) => abs(l) > 1e-9 * maxAbs);
    const fmt = () => lam.map((l) => (Math.abs(l.im) > 1e-9 * abs(l) ? `${l.re.toPrecision(4)}${l.im >= 0 ? '+' : '−'}j${Math.abs(l.im).toPrecision(4)}` : l.re.toPrecision(4))).join(', ');
    const first = nz[0];
    const ok = nz.every((l) => Math.abs(l.im) <= 1e-7 * abs(l) && Math.abs(l.re - first.re) <= 1e-6 * Math.abs(first.re));
    if (!ok)
      throw new AnalysisError(`tau: the circuit for t > 0 is not first-order (natural frequencies s = ${fmt()} 1/s); a single time constant does not exist`);
    return -1 / first.re;
  }

  /** t → ∞ */
  final(): Solution {
    if (this.sinSources.length)
      throw new AnalysisError('t = "inf": with a sinusoidal source the response has no constant final value (ask for a time instead, or use AC analysis)');
    const sys = new MnaSystem(this.ckt, { kind: 'dc', phase: 'after', label: 'the DC steady state for t → ∞' });
    if (!sys.error) {
      let lam: Complex[] = [];
      try {
        lam = this.naturalFrequencies();
      } catch {
        lam = [];
      }
      const maxAbs = Math.max(0, ...lam.map(abs));
      for (const l of lam) {
        if (abs(l) <= 1e-9 * maxAbs) continue;
        if (l.re > 1e-9 * abs(l)) throw new AnalysisError('t = "inf": the circuit is unstable for t > 0 (a natural frequency has a positive real part); there is no final value');
        if (l.re >= -1e-9 * abs(l)) throw new AnalysisError('t = "inf": the circuit for t > 0 oscillates forever (undamped, lossless); there is no final value');
      }
      return sys.solve((el) => {
        const s = el.src!;
        if (s.kind === 'num') return cx(s.value);
        if (s.kind === 'dcac') return cx(s.dc);
        if (s.kind === 'step') return cx(s.after);
        return cx(s.offset);
      });
    }
    // DC operating point undefined (e.g. parallel inductors, series capacitors): the final
    // value then depends on the initial state; take the limit of the transient.
    const lam = this.naturalFrequencies();
    const maxAbs = Math.max(0, ...lam.map(abs));
    const decaying = lam.filter((l) => abs(l) > 1e-9 * maxAbs);
    if (!decaying.length || decaying.some((l) => l.re >= -1e-9 * abs(l))) throw new AnalysisError(`t = "inf": ${sys.error.message}`);
    const T = 60 / Math.min(...decaying.map((l) => -l.re));
    const s1 = this.statesAt(T);
    const s2 = this.statesAt(2 * T);
    const scale = Math.max(1e-30, ...s2.map(Math.abs));
    if (s1.some((v, i) => Math.abs(v - s2[i]) > 1e-7 * scale)) throw new AnalysisError(`t = "inf": ${sys.error.message}`);
    return this.solutionFrom(s2, 2 * T);
  }
}
