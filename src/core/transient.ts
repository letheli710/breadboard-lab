// Time-domain simulation of a breadboard Circuit (stage C: function generator + scope).
//
// ─── API for the UI ──────────────────────────────────────────────────────────────────────
//
//   import { simulateTransient, hasGenerator } from './core/transient';
//
//   if (hasGenerator(circuit)) {
//     const tr = simulateTransient(circuit);          // ~1–20 ms for a typical board
//     tr.t                      Float64Array, seconds, starts at 0 = generator phase 0
//                               (sine rising through its offset; square rising edge)
//     tr.probes                 [{ ref, channel, tipNet, gndNet, data }]  — sorted by channel;
//                               data = V(tip) − V(gnd) per sample (Float64Array, same length as t)
//     tr.probe('PR1')           the same trace for one probe ref (null if unknown / not plugged in)
//     tr.v('N3') / tr.pin('R1.2')   node voltage vs GND for a net name / "REF.pin"
//     tr.current('AM1')         current trace (A) for ammeter (+→−), resistor, pot (1→2), LED/diode
//                               (anode→cathode), inductor (1→2), capacitor (1→2), source (out of +)
//     tr.meters.get('AM1')      { dc, rms, min, max, pp } — what a meter would read (dc = average)
//     tr.leds.get('LED1')       LedState (same shape as the DC solver's) + avgCurrent, peakCurrent,
//                               onFraction, flicker. `on`/`brightness` use the AVERAGE current
//                               (the eye averages fast blinking); flicker = visibly blinking
//                               (generator < 25 Hz and the LED is lit only part of each period).
//     tr.clipping               Set of "U1.A" / "U1.B" op-amp halves that hit a rail in the window
//     tr.measure('vpp', 'C1.1', 'FG1.-')         scalar measurements (see Measure below)
//     tr.measure('phase', 'C1.1', undefined, 'FG1.+')  phase of C1.1 relative to FG1.+ (degrees)
//     tr.frequency / tr.period / tr.dt / tr.stepsPerPeriod / tr.periods
//     tr.converged              periodic steady state reached within the work budget
//     tr.warnings               bilingual messages (already translated via tr())
//   }
//
//   Pure helpers on any trace (window must be a whole number of periods, as returned):
//     vmax, vmin, vpp, vavg, vrms(trace)            vrms = true RMS (includes DC)
//     fundamental(trace, cycles) → { amp, phase }   DFT bin at the generator frequency
//     freq(trace, dt)                               from mean-crossings (0 if flat)
//     phaseDeg(a, b, cycles)                        phase(a) − phase(b) in (−180, 180]; >0 = a leads
//     gain(a, b, cycles)                            |fundamental(a)| / |fundamental(b)|
//     measureTrace(kind, trace, { dt, cycles, vs })
//
// DC side (./solver.ts, unchanged entry point `simulate(circuit)`), new in SimResult:
//     sim.meters.get('AM1')     { current }  ammeter reading, A (in at red +, out at black −)
//     sim.opamps.get('U1')      { powered, supply, A: { out, mode, used }, B: {...} }
//                               mode: 'linear' | 'high' | 'low' (clipping) | 'off' (unpowered)
//     sim.current.get('L1')     inductor current (1 → 2); ammeter currents are in sim.current too
//     sim.sources.get('FG1')    a generator appears as a source (its DC offset behind 50 Ω)
//   Parts (./parts.ts): PARTS.inductor / ammeter / opamp / function_gen / scope_probe (category
//   'instrument' for the last three; 'basic' for inductor and opamp), nextScopeChannel(layout),
//   genSettings(props) (generator settings with defaults), OPAMP_HALVES, OPAMP / GEN_R /
//   AMMETER_R / INDUCTOR_R model constants, isSource(), groundSource().
//   Schematic (./schematic.ts): an op-amp gives one SElement per used half (`half: 'A'|'B'`,
//   `extra.power` = 1 on the one carrying the V+/V− leads); see SElement.half.
//
// ─── Method ──────────────────────────────────────────────────────────────────────────────
//
// Nodal analysis with companion models on a fixed time grid of N steps per generator period
// (N even, 256 by default, more when an L–C pair rings faster than the generator). The
// integrator is BDF2 (Gear-2: second order, L-stable, no trapezoidal "ringing" at square
// edges); the first step and the step after every square-wave edge use backward Euler.
// Square-wave edges fall exactly on grid points. Diodes/LEDs, bench-supply CV/CC and op-amp
// rails are piecewise-linear and iterated within each step until consistent; LU
// factorisations are cached per (method, device-state) so linear stretches cost one
// forward/back substitution per step.
//
// The run starts from the DC operating point with every generator at its average (offset)
// and simulates whole periods until the state at the period boundary repeats (relative
// tolerance 1e-4, with a geometric estimate of the remaining decay). Slow geometric decays
// (e.g. a big coupling capacitor) are accelerated by Aitken extrapolation over periods.
// Then `periods` more periods (default 2) are recorded. Work is capped by `maxSteps`.
//
// Limitations: the first generator sets the time base (others should be integer multiples
// of its frequency); op-amps have no slew-rate / gain-bandwidth limit and their output
// current doesn't load the supply; probes are ideal (no earth-ground loop); L–C ringing much
// faster than 1/40 of a step is not resolved (it is damped instead).

import { tr as t_ } from './i18n';
import {
  GMIN,
  LU,
  Stamper,
  compileCircuit,
  ledState,
  pwlKey,
  solveDcCompiled,
  stampPwlMatrix,
  stampPwlRhs,
  updatePwl,
  type CSource,
  type Compiled,
  type LedState,
} from './solver';
import type { Circuit } from './types';
import { pinId } from './types';

export type Measure = 'vpp' | 'vmax' | 'vmin' | 'vavg' | 'vrms' | 'freq' | 'phase' | 'gain';
export const MEASURES: Measure[] = ['vpp', 'vmax', 'vmin', 'vavg', 'vrms', 'freq', 'phase', 'gain'];

export interface TransientOptions {
  /** periods in the returned window (default 2) */
  periods?: number;
  /** override the automatic steps per period (rounded up to even, ≥ 16) */
  stepsPerPeriod?: number;
  /** total time-step budget (default 150 000) */
  maxSteps?: number;
  /** minimum periods simulated before steady state may be declared (default 3) */
  minPeriods?: number;
  /** relative steady-state tolerance (default 1e-4) */
  tol?: number;
}

export interface ProbeTrace {
  ref: string;
  channel: 1 | 2;
  tipNet: string | null;
  gndNet: string | null;
  data: Float64Array;
}

export interface MeterReading {
  /** average (what a DMM in DC A mode shows) */
  dc: number;
  /** true RMS */
  rms: number;
  min: number;
  max: number;
  pp: number;
}

export interface AcLedState extends LedState {
  avgCurrent: number;
  peakCurrent: number;
  /** fraction of the window during which the LED conducts > 0.5 mA */
  onFraction: number;
  /** visibly blinking (slow generator, lit only part of each period) */
  flicker: boolean;
}

export interface TransientResult {
  hasGenerator: boolean;
  converged: boolean;
  /** generator frequency (Hz) = 1/period; 1 kHz time base when there is no generator */
  frequency: number;
  period: number;
  dt: number;
  stepsPerPeriod: number;
  /** whole periods in the window */
  periods: number;
  t: Float64Array;
  ground: string | null;
  /** nets that have a trace (ground and internal floating nodes excluded) */
  nets: string[];
  v(net: string): Float64Array;
  pin(pin: string): Float64Array;
  probe(ref: string): Float64Array | null;
  probes: ProbeTrace[];
  current(ref: string): Float64Array | null;
  meters: Map<string, MeterReading>;
  leds: Map<string, AcLedState>;
  clipping: Set<string>;
  /** measurement of V(pin) − V(ref) (ref omitted = GND); `vs` (same ref) for phase / gain */
  measure(kind: Measure, pin: string, ref?: string, vs?: string): number;
  stats: { steps: number; periodsSimulated: number; extrapolations: number; ms: number };
  warnings: string[];
}

export function hasGenerator(circuit: Circuit): boolean {
  return circuit.components.some((c) => c.type === 'function_gen');
}

// ---------------------------------------------------------------------------------------
// measurement helpers

export const vmax = (x: ArrayLike<number>) => {
  let m = -Infinity;
  for (let i = 0; i < x.length; i++) if (x[i] > m) m = x[i];
  return x.length ? m : 0;
};
export const vmin = (x: ArrayLike<number>) => {
  let m = Infinity;
  for (let i = 0; i < x.length; i++) if (x[i] < m) m = x[i];
  return x.length ? m : 0;
};
export const vpp = (x: ArrayLike<number>) => vmax(x) - vmin(x);
export const vavg = (x: ArrayLike<number>) => {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i];
  return x.length ? s / x.length : 0;
};
export const vrms = (x: ArrayLike<number>) => {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i] * x[i];
  return x.length ? Math.sqrt(s / x.length) : 0;
};

/** Fundamental component of a window holding `cycles` whole periods: peak amplitude and phase
 *  (degrees, sine reference: x = amp·sin(ωt + phase)). */
export function fundamental(x: ArrayLike<number>, cycles: number): { amp: number; phase: number } {
  const M = x.length;
  let re = 0;
  let im = 0;
  for (let i = 0; i < M; i++) {
    const a = (2 * Math.PI * cycles * i) / M;
    re += x[i] * Math.cos(a);
    im += x[i] * Math.sin(a);
  }
  // x = A sin(wt + p) = A (sin wt cos p + cos wt sin p) → im ∝ A cos p, re ∝ A sin p
  const amp = (2 / M) * Math.hypot(re, im);
  const phase = (Math.atan2(re, im) * 180) / Math.PI;
  return { amp, phase };
}

const wrapDeg = (d: number) => {
  let x = ((d + 180) % 360 + 360) % 360 - 180;
  if (x <= -180) x += 360;
  return x;
};

/** Phase of a relative to b (degrees, (−180, 180]); positive = a leads b. */
export function phaseDeg(a: ArrayLike<number>, b: ArrayLike<number>, cycles: number): number {
  return wrapDeg(fundamental(a, cycles).phase - fundamental(b, cycles).phase);
}

/** Ratio of the fundamental amplitudes |a| / |b|. */
export function gain(a: ArrayLike<number>, b: ArrayLike<number>, cycles: number): number {
  const fb = fundamental(b, cycles).amp;
  return fb > 1e-12 ? fundamental(a, cycles).amp / fb : 0;
}

/** Frequency from crossings of the mean (with 10 % hysteresis); 0 for a flat trace. */
export function freq(x: ArrayLike<number>, dt: number): number {
  const pp = vpp(x);
  if (!(pp > 1e-6) || x.length < 4) return 0;
  const mean = vavg(x);
  const hy = pp * 0.1;
  let armed = x[0] < mean - hy;
  const ups: number[] = [];
  for (let i = 1; i < x.length; i++) {
    if (x[i] < mean - hy) armed = true;
    if (armed && x[i - 1] < mean && x[i] >= mean) {
      const f = (mean - x[i - 1]) / (x[i] - x[i - 1]);
      ups.push(i - 1 + f);
      armed = false;
    }
  }
  if (ups.length < 2) {
    // fewer than two rising crossings in the window: periodic wrap (window = whole periods)
    return ups.length === 1 ? 1 / (x.length * dt) : 0;
  }
  return (ups.length - 1) / ((ups[ups.length - 1] - ups[0]) * dt);
}

export function measureTrace(kind: Measure, x: ArrayLike<number>, o: { dt: number; cycles: number; vs?: ArrayLike<number> }): number {
  switch (kind) {
    case 'vpp':
      return vpp(x);
    case 'vmax':
      return vmax(x);
    case 'vmin':
      return vmin(x);
    case 'vavg':
      return vavg(x);
    case 'vrms':
      return vrms(x);
    case 'freq':
      return freq(x, o.dt);
    case 'phase':
      return o.vs ? phaseDeg(x, o.vs, o.cycles) : 0;
    case 'gain':
      return o.vs ? gain(x, o.vs, o.cycles) : 0;
  }
}

// ---------------------------------------------------------------------------------------
// waveforms

/** Normalised waveform at phase fraction f ∈ (0, 1]. Square is left-continuous: the value
 *  at an edge instant is the one *before* the edge. */
function wave(w: 'sine' | 'square' | 'triangle', f: number): number {
  switch (w) {
    case 'sine':
      return Math.sin(2 * Math.PI * f);
    case 'square':
      return f <= 0.5 ? 1 : -1;
    case 'triangle':
      return f <= 0.25 ? 4 * f : f <= 0.75 ? 2 - 4 * f : 4 * f - 4;
  }
}

function autoSteps(c: Compiled, T: number): number {
  let fRing = 0;
  for (const l of c.inductors) for (const cap of c.caps) fRing = Math.max(fRing, 1 / (2 * Math.PI * Math.sqrt(l.L * cap.C)));
  let N = Math.max(256, Math.ceil(T * fRing * 40));
  N = Math.min(N, 4096);
  return N + (N % 2);
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// ---------------------------------------------------------------------------------------

export function simulateTransient(circuit: Circuit, opts: TransientOptions = {}): TransientResult {
  const started = now();
  const c = compileCircuit(circuit);
  const warnings: string[] = [];
  const gens = c.srcs.filter((s) => s.gen);
  const hasGen = gens.length > 0;
  const f0 = hasGen ? gens[0].gen!.frequency : 1000;
  const T = 1 / f0;
  let N = opts.stepsPerPeriod ? Math.max(16, Math.ceil(opts.stepsPerPeriod)) : autoSteps(c, T);
  N += N % 2;
  const h = T / N;
  const keep = Math.max(1, Math.round(opts.periods ?? 2));
  const maxSteps = opts.maxSteps ?? 150_000;
  const minPeriods = opts.minPeriods ?? 3;
  const tol = opts.tol ?? 1e-4;

  // per-generator phase: exact integer arithmetic when its frequency is a multiple of f0
  const genMult = new Map<CSource, number | null>();
  for (const g of gens) {
    const r = g.gen!.frequency / f0;
    const m = Math.round(r);
    if (Math.abs(r - m) < 1e-9 && m >= 1) genMult.set(g, m);
    else {
      genMult.set(g, null);
      warnings.push(
        t_(
          `${g.ref} 的频率不是 ${gens[0].ref} 的整数倍：示波器按 ${gens[0].ref} 的周期显示，波形可能不稳定。`,
          `${g.ref}'s frequency is not a whole multiple of ${gens[0].ref}'s: the scope uses ${gens[0].ref}'s period, so the picture may not be stable.`,
        ),
      );
    }
  }
  const frac = (g: CSource, k: number) => {
    const m = genMult.get(g);
    let f: number;
    if (m != null) f = ((((k * m) % N) + N) % N) / N;
    else {
      const ph = g.gen!.frequency * k * h;
      f = ph - Math.floor(ph);
    }
    return f === 0 ? 1 : f;
  };
  const emfAt = (src: CSource, k: number) => (src.gen ? src.gen.offset + src.gen.amplitude * wave(src.gen.waveform, frac(src, k)) : src.v);
  let kNow = 0;
  const emf = (src: CSource) => emfAt(src, kNow);
  const squares = gens.filter((g) => g.gen!.waveform === 'square');
  const edgeBefore = (k: number) => squares.some((g) => wave('square', frac(g, k)) !== wave('square', frac(g, k - 1)));

  // ---- initial state: DC operating point with generators at their average (= offset)
  const dc = solveDcCompiled(c, (s) => (s.gen ? s.gen.offset : s.v));
  const Nn = c.N;
  let x = dc.x.slice();
  const V = (arr: Float64Array, i: number) => (i < 0 ? 0 : arr[i]);
  const nL = c.inductors.length;
  let iL = new Float64Array(nL);
  c.inductors.forEach((l, j) => (iL[j] = (V(x, l.a) - V(x, l.b)) / l.R));
  let x1 = x.slice(); // v at n−1
  let x2: Float64Array | null = null; // v at n−2 (null → next step is BE)
  let iL1 = iL.slice();
  let iL2: Float64Array | null = null;

  // ---- LU cache
  const cache = new Map<string, LU>();
  const st = new Stamper(Nn);
  const coeff = { BE: [1, -1, 0], BDF2: [1.5, -2, 0.5] } as const;
  const getLU = (method: 'BE' | 'BDF2'): LU => {
    const key = method + pwlKey(c);
    let lu = cache.get(key);
    if (lu) return lu;
    const a0 = coeff[method][0];
    st.clear();
    for (let i = 0; i < Nn; i++) st.A[i * Nn + i] += GMIN;
    for (const r of c.resistors) st.g(r.a, r.b, r.g);
    for (const cap of c.caps) st.g(cap.a, cap.b, (cap.C * a0) / h);
    for (const l of c.inductors) st.g(l.a, l.b, 1 / (l.R + (l.L * a0) / h));
    stampPwlMatrix(c, st);
    lu = new LU(Nn, st.A.slice());
    if (cache.size > 64) cache.clear();
    cache.set(key, lu);
    return lu;
  };

  const b = new Float64Array(Nn);
  const ih = new Float64Array(nL);
  let steps = 0;
  let failed = false;

  /** advance from step kNow−1 to kNow (x1/x2/iL1/iL2 hold history) */
  const step = () => {
    const method: 'BE' | 'BDF2' = x2 === null || iL2 === null || edgeBefore(kNow) ? 'BE' : 'BDF2';
    const [a0, a1, a2] = coeff[method];
    for (let it = 0; it < 30; it++) {
      const lu = getLU(method);
      b.fill(0);
      for (const cap of c.caps) {
        const v1 = V(x1, cap.a) - V(x1, cap.b);
        const v2 = x2 ? V(x2, cap.a) - V(x2, cap.b) : 0;
        const I = -(cap.C / h) * (a1 * v1 + a2 * v2);
        if (cap.a >= 0) b[cap.a] += I;
        if (cap.b >= 0) b[cap.b] -= I;
      }
      c.inductors.forEach((l, j) => {
        const geq = 1 / (l.R + (l.L * a0) / h);
        const Ih = -geq * (l.L / h) * (a1 * iL1[j] + a2 * (iL2 ? iL2[j] : 0));
        ih[j] = Ih;
        if (l.a >= 0) b[l.a] -= Ih;
        if (l.b >= 0) b[l.b] += Ih;
      });
      const sb = st.b;
      sb.fill(0);
      stampPwlRhs(c, st, emf);
      for (let i = 0; i < Nn; i++) b[i] += sb[i];
      if (!lu.solve(b)) {
        failed = true;
        return;
      }
      x.set(b);
      if (!updatePwl(c, x, emf, it > 24)) break;
    }
    c.inductors.forEach((l, j) => {
      const geq = 1 / (l.R + (l.L * a0) / h);
      iL[j] = geq * (V(x, l.a) - V(x, l.b)) + ih[j];
    });
    steps++;
  };
  const shift = () => {
    x2 = x1;
    x1 = x.slice();
    iL2 = iL1;
    iL1 = iL.slice();
  };

  // ---- run to periodic steady state
  let converged = Nn === 0;
  let periodsSimulated = 0;
  let extrapolations = 0;
  let prevS: Float64Array | null = null;
  let prevD: Float64Array | null = null;
  const ratios: number[] = [];
  const ISCALE = 100; // weigh inductor currents like volts across 100 Ω
  const stateVec = () => {
    const s = new Float64Array(Nn + nL);
    s.set(x);
    for (let j = 0; j < nL; j++) s[Nn + j] = iL[j] * ISCALE;
    return s;
  };
  const norm = (v: Float64Array) => {
    let m = 0;
    for (let i = 0; i < v.length; i++) m = Math.max(m, Math.abs(v[i]));
    return m;
  };
  const maxPeriods = Math.max(minPeriods, Math.floor((maxSteps - keep * N) / N));
  for (let p = 0; p < maxPeriods && !converged && !failed; p++) {
    for (let m = 1; m <= N; m++) {
      kNow = p * N + m;
      step();
      if (failed) break;
      shift();
    }
    periodsSimulated++;
    const S = stateVec();
    if (prevS) {
      const d = new Float64Array(S.length);
      for (let i = 0; i < S.length; i++) d[i] = S[i] - prevS[i];
      const dn = norm(d);
      let r = 0;
      if (prevD) {
        const pn = norm(prevD);
        r = pn > 0 ? dn / pn : 0;
        ratios.push(r);
      }
      const rc = Math.min(Math.max(r, 0), 0.999);
      const est = dn / (1 - rc);
      const scale = Math.max(1, norm(S));
      if (periodsSimulated >= minPeriods && est < tol * scale) converged = true;
      else if (prevD && ratios.length >= 3) {
        // Aitken extrapolation of a slow, single-mode geometric decay
        const [r1, r2, r3] = ratios.slice(-3);
        let dot = 0;
        let n1 = 0;
        let n2 = 0;
        for (let i = 0; i < d.length; i++) {
          dot += d[i] * prevD[i];
          n1 += d[i] * d[i];
          n2 += prevD[i] * prevD[i];
        }
        const cos = n1 > 0 && n2 > 0 ? dot / Math.sqrt(n1 * n2) : 0;
        const steady = Math.abs(r1 - r3) < 0.05 * r3 && Math.abs(r2 - r3) < 0.05 * r3;
        if (steady && cos > 0.99 && r3 > 0.3 && r3 < 0.998 && extrapolations < 8) {
          const k = r3 / (1 - r3);
          for (let i = 0; i < Nn; i++) x[i] += d[i] * k;
          for (let j = 0; j < nL; j++) iL[j] += (d[Nn + j] / ISCALE) * k;
          x1 = x.slice();
          x2 = null;
          iL1 = iL.slice();
          iL2 = null;
          extrapolations++;
          ratios.length = 0;
          prevS = stateVec();
          prevD = null;
          continue;
        }
      }
      prevD = d;
    }
    prevS = S;
  }
  if (!converged && !failed)
    warnings.push(
      t_(
        '电路在计算量上限内还没有完全进入稳定的周期状态，波形可能还在缓慢变化。',
        "The circuit didn't fully settle into a steady repeating state within the work limit; the waveforms may still be drifting slowly.",
      ),
    );
  if (failed) warnings.push(t_('瞬态仿真失败（矩阵奇异）。', 'Transient simulation failed (singular matrix).'));

  // ---- record the window
  const M = keep * N;
  const kStart = periodsSimulated * N;
  const nodeTr = new Float64Array(Math.max(Nn, 1) * M);
  const dI = c.diodes.length;
  const diodeTr = new Float64Array(Math.max(dI, 1) * M);
  const indTr = new Float64Array(Math.max(nL, 1) * M);
  const clipping = new Set<string>();
  const record = (j: number) => {
    for (let i = 0; i < Nn; i++) nodeTr[i * M + j] = x[i];
    c.diodes.forEach((d, q) => {
      const vak = V(x, d.a) - V(x, d.k);
      diodeTr[q * M + j] = d.on ? (vak - d.vf) / d.rs : vak * 1e-9;
    });
    for (let q = 0; q < nL; q++) indTr[q * M + j] = iL[q];
    for (const o of c.opamps) if (o.used && (o.mode === 'high' || o.mode === 'low')) clipping.add(`${o.ref}.${o.half}`);
  };
  kNow = kStart;
  record(0);
  for (let j = 1; j < M && !failed; j++) {
    kNow = kStart + j;
    step();
    shift();
    record(j);
  }

  // ---- result
  const t = new Float64Array(M);
  for (let j = 0; j < M; j++) t[j] = j * h;
  const zeros = new Float64Array(M);
  const nodeIdx = new Map<string, number>();
  c.nodes.forEach((n, i) => nodeIdx.set(n, i));
  const trOf = (i: number) => (i < 0 ? zeros : nodeTr.subarray(i * M, (i + 1) * M));
  const v = (net: string) => (nodeIdx.has(net) ? trOf(nodeIdx.get(net)!) : zeros);
  const pinTr = (p: string) => trOf(c.pinNode.get(p) ?? -1);
  const sub = (a: Float64Array, bb: Float64Array) => {
    const out = new Float64Array(M);
    for (let j = 0; j < M; j++) out[j] = a[j] - bb[j];
    return out;
  };
  const netName = (p: string) => {
    const i = c.pinNode.get(p);
    if (i === undefined) return null;
    if (i < 0) return c.ground;
    const n = c.nodes[i];
    return n.startsWith('__float:') ? null : n;
  };

  const probes: ProbeTrace[] = circuit.components
    .filter((x) => x.type === 'scope_probe')
    .map((p) => ({
      ref: p.ref,
      channel: (p.props.channel ?? 1) as 1 | 2,
      tipNet: netName(pinId(p.ref, 'tip')),
      gndNet: netName(pinId(p.ref, 'gnd')),
      data: sub(pinTr(pinId(p.ref, 'tip')), pinTr(pinId(p.ref, 'gnd'))),
    }))
    .sort((a, b2) => a.channel - b2.channel || a.ref.localeCompare(b2.ref, 'en', { numeric: true }));

  const curCache = new Map<string, Float64Array | null>();
  const current = (ref: string): Float64Array | null => {
    if (curCache.has(ref)) return curCache.get(ref)!;
    let out: Float64Array | null = null;
    const res = c.resistors.find((r) => r.ref === ref && r.part !== 'b');
    const di = c.diodes.findIndex((d) => d.ref === ref);
    const li = c.inductors.findIndex((l) => l.ref === ref);
    const cap = c.caps.find((q) => q.ref === ref);
    const src = c.srcs.find((s) => s.ref === ref);
    if (res) {
      const vd = sub(trOf(res.a), trOf(res.b));
      out = vd.map((y) => y * res.g);
    } else if (di >= 0) out = diodeTr.slice(di * M, (di + 1) * M);
    else if (li >= 0) out = indTr.slice(li * M, (li + 1) * M);
    else if (cap) {
      const vd = sub(trOf(cap.a), trOf(cap.b));
      out = new Float64Array(M);
      for (let j = 0; j < M; j++) out[j] = (cap.C * (vd[(j + 1) % M] - vd[(j - 1 + M) % M])) / (2 * h);
    } else if (src) {
      const vt = sub(trOf(src.p), trOf(src.n));
      out = new Float64Array(M);
      for (let j = 0; j < M; j++) out[j] = (emfAt(src, kStart + j) - vt[j]) / src.rint;
    }
    curCache.set(ref, out);
    return out;
  };

  const meters = new Map<string, MeterReading>();
  for (const r of c.resistors)
    if (r.kind === 'ammeter') {
      const i = current(r.ref)!;
      meters.set(r.ref, { dc: vavg(i), rms: vrms(i), min: vmin(i), max: vmax(i), pp: vpp(i) });
    }

  const leds = new Map<string, AcLedState>();
  c.diodes.forEach((d, q) => {
    const i = diodeTr.subarray(q * M, (q + 1) * M);
    const avg = vavg(i);
    const peak = vmax(i);
    let onN = 0;
    for (let j = 0; j < M; j++) if (i[j] > 0.0005) onN++;
    const onFraction = onN / M;
    const vak = sub(trOf(d.a), trOf(d.k));
    const on = avg > 0.0005;
    leds.set(d.ref, {
      ...ledState(on, avg, peak, !on && vavg(vak) < -0.5),
      avgCurrent: avg,
      peakCurrent: peak,
      onFraction,
      flicker: hasGen && f0 < 25 && onFraction > 0.05 && onFraction < 0.95,
    });
  });

  const measure = (kind: Measure, p: string, ref?: string, vs?: string) => {
    const r = ref ? pinTr(ref) : zeros;
    const a = sub(pinTr(p), r);
    const bv = vs ? sub(pinTr(vs), r) : undefined;
    return measureTrace(kind, a, { dt: h, cycles: keep, vs: bv });
  };

  return {
    hasGenerator: hasGen,
    converged: converged && !failed,
    frequency: f0,
    period: T,
    dt: h,
    stepsPerPeriod: N,
    periods: keep,
    t,
    ground: c.ground,
    nets: c.nodes.filter((n) => !n.startsWith('__float:')),
    v,
    pin: pinTr,
    probe: (ref) => probes.find((p) => p.ref === ref)?.data ?? null,
    probes,
    current,
    meters,
    leds,
    clipping,
    measure,
    stats: { steps, periodsSimulated, extrapolations, ms: now() - started },
    warnings,
  };
}
