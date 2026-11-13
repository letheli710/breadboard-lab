// DC operating-point solver (nodal analysis with piecewise-linear devices).
// Sources are modelled as an ideal EMF behind an internal resistance (Norton form), so a
// short circuit gives a large-but-finite current instead of a singular matrix.
//
// The circuit is first *compiled* (compileCircuit) into node indices + device lists; the
// same compiled form is used by the time-domain simulator in ./transient.ts.
//
// Device models (DC):
//   resistor / potentiometer / switch / pushbutton   plain conductances
//   led / diode        PWL: off = 1 GΩ, on = Vf + series R
//   capacitor          open circuit
//   inductor           its 1 Ω winding resistance
//   ammeter            0.1 Ω burden; reading in SimResult.meters (current in at +, out at −)
//   battery / bench_supply / power_module / dc_source   EMF behind internal R (bench: CV/CC)
//   function_gen       its DC offset behind 50 Ω (time-domain behaviour: transient.ts)
//   opamp (LM358)      per half: VCVS gain 1e5 behind 10 Ω, output clamped to
//                      [V(v−), V(v+) − 1.5 V]; unpowered (supply < 3 V) = 1 MΩ to v−
//   scope_probe        not simulated (ideal, infinite input resistance)

import { AMMETER_R, BATTERIES, GEN_R, INDUCTOR_R, LED_COLORS, OPAMP, OPAMP_HALVES, genSettings, groundSource, sourceRint, sourceVoltage, terminalsOf } from './parts';
import type { Circuit, PinMode } from './types';
import { pinId } from './types';

export const GMIN = 1e-9;
const R_CLOSED = 0.02;
export const R_OFF = 1e9;
const R_OPAMP_OFF = 1e6;

export interface LedState {
  on: boolean;
  current: number;
  /** 0..1 visual brightness */
  brightness: number;
  overcurrent: boolean;
  burnt: boolean;
  reverse: boolean;
}

export interface SourceState {
  current: number; // amps out of the + terminal
  terminalVoltage: number;
  shorted: boolean;
  ccMode: boolean;
}

/** Ammeter reading: current flowing in at the red (+) lead and out at the black (−/COM) lead. */
export interface MeterState {
  current: number;
}

export type OpAmpMode = 'linear' | 'high' | 'low' | 'off';

export interface OpAmpHalfState {
  /** output voltage (vs GND) */
  out: number;
  /** linear = in its normal range; high/low = output stuck at a rail (clipping); off = no power */
  mode: OpAmpMode;
  /** true if this half has anything connected to its 3 pins */
  used: boolean;
}

export interface OpAmpState {
  /** V(v+) − V(v−) ≥ 3 V */
  powered: boolean;
  supply: number;
  A: OpAmpHalfState;
  B: OpAmpHalfState;
}

// ---- phase 5 states ------------------------------------------------------------------

/** Logic level a digital input reads. `undefined` = between VIL and VIH; `floating` = nothing
 *  defines the voltage (DC impedance > FLOAT_Z). */
export type LogicLevel = 'high' | 'low' | 'undefined' | 'floating';

export interface PinState {
  mode: PinMode;
  /** pin voltage vs the circuit's GND */
  voltage: number;
  /** pin voltage vs the board's own GND pin */
  vLocal: number;
  /** current flowing OUT of the pin into the external circuit (A); negative = sinking */
  current: number;
  /** what a digital read returns (inputs; for outputs: the level on the pin) */
  logic: LogicLevel;
  /** ADC reading (adc mode only): volts (clamped 0–3.3) and raw 12-bit count */
  adc?: { volts: number; raw: number };
  /** PWM duty (%) / frequency (Hz) for pwm mode */
  duty?: number;
  frequency?: number;
  /** current through the ESD clamp diodes (A, > 0 when the pin is driven beyond the rails) */
  clamp: number;
  /** > recommended current (warning) */
  overcurrent: boolean;
  /** > absolute maximum current or clamp injection: the pin is damaged */
  damaged: boolean;
  /** above the pin's absolute-maximum voltage (3.6 V, or 5.5 V on FT pins) */
  overvoltage: boolean;
  /** below −0.3 V */
  undervoltage: boolean;
  /** pin has anything connected (its net has another terminal) */
  connected: boolean;
}

export interface McuState {
  type: 'esp32_devkit' | 'stm32_bluepill' | 'mcu';
  /** chip running (3V3 above brown-out and EN/NRST high) */
  running: boolean;
  usb: boolean;
  /** board rail voltages vs the board's GND pin */
  v5: number;
  v3: number;
  /** current drawn from the USB cable (A) */
  usbCurrent: number;
  usbOverload: boolean;
  /** onboard regulator */
  reg: { mode: RegMode; iout: number; limit: number; power: number };
  /** current the board's 3V3 pin delivers to the breadboard (A, negative = fed from outside) */
  i3v3Out: number;
  /** current the board's 5V pin delivers to the breadboard (A) */
  i5vOut: number;
  powerLed: boolean;
  /** onboard user LED (Blue Pill PC13) */
  userLed?: boolean;
  /** every GPIO with a state (physical or logical pin names) */
  pins: Map<string, PinState>;
}

export type BjtRegion = 'cutoff' | 'active' | 'saturation';
export interface BjtState {
  region: BjtRegion;
  ib: number;
  ic: number;
  vbe: number;
  vce: number;
  power: number;
  /** collector–emitter breakdown conducting (inductive kick with no flyback diode) */
  breakdown: boolean;
  baseFloating: boolean;
}

export type MosRegion = 'off' | 'ohmic' | 'saturation';
export interface MosState {
  region: MosRegion;
  vgs: number;
  vds: number;
  /** drain → source current (A) */
  id: number;
  power: number;
  /** on-resistance at the present gate voltage (Ω, Infinity when off) */
  rds: number;
  breakdown: boolean;
  gateFloating: boolean;
}

export type RegMode = 'reg' | 'dropout' | 'limit' | 'off';
export interface RegState {
  mode: RegMode;
  vin: number;
  vout: number;
  iout: number;
  power: number;
}

export interface RelayState {
  energized: boolean;
  coilCurrent: number;
  coilVoltage: number;
}

export interface MotorState {
  current: number;
  voltage: number;
  running: boolean;
  /** 0..1 relative speed (∝ current, 1 at 5 V) and direction (+1 / −1) */
  speed: number;
  direction: 1 | -1;
}

export interface BuzzerState {
  on: boolean;
  current: number;
  voltage: number;
  /** 0..1 */
  loudness: number;
  reverse: boolean;
}

export interface SimResult {
  ground: string | null;
  nodeV: Map<string, number>;
  /** current through component from its first terminal to its second (A) */
  current: Map<string, number>;
  /** voltage across component (first terminal minus second) */
  vdrop: Map<string, number>;
  leds: Map<string, LedState>;
  sources: Map<string, SourceState>;
  /** ammeter readings by ref */
  meters: Map<string, MeterState>;
  /** op-amp states by ref */
  opamps: Map<string, OpAmpState>;
  // phase 5
  mcus: Map<string, McuState>;
  bjts: Map<string, BjtState>;
  mosfets: Map<string, MosState>;
  /** standalone LDO regulators */
  regs: Map<string, RegState>;
  relays: Map<string, RelayState>;
  motors: Map<string, MotorState>;
  buzzers: Map<string, BuzzerState>;
  converged: boolean;
}

// ---------------------------------------------------------------------------------------
// compiled circuit

export interface CResistor {
  ref: string;
  a: number;
  b: number;
  g: number;
  /** potentiometer halves */
  part?: 'a' | 'b';
  kind: 'resistor' | 'pot' | 'switch' | 'button' | 'ammeter';
}

export interface CDiode {
  ref: string;
  led: boolean;
  a: number;
  k: number;
  vf: number;
  rs: number;
  on: boolean;
}

export interface CSource {
  ref: string;
  p: number;
  n: number;
  /** EMF (for a generator: its DC offset; transient.ts drives the waveform) */
  v: number;
  rint: number;
  ilim: number; // Infinity if no current limit
  cc: boolean;
  gen?: ReturnType<typeof genSettings>;
  type: string;
  variant?: string;
}

export interface CCap {
  ref: string;
  a: number;
  b: number;
  C: number;
}

export interface CInductor {
  ref: string;
  a: number;
  b: number;
  L: number;
  R: number;
}

export interface COpAmpHalf {
  ref: string;
  half: 'A' | 'B';
  out: number;
  inp: number;
  inn: number;
  vp: number;
  vn: number;
  used: boolean;
  mode: OpAmpMode;
}

export interface Compiled {
  ground: string | null;
  /** non-ground node names; index = unknown number (internal floating nodes start with "__float:") */
  nodes: string[];
  N: number;
  /** "REF.pin" -> node index (−1 = ground) */
  pinNode: Map<string, number>;
  resistors: CResistor[];
  diodes: CDiode[];
  srcs: CSource[];
  caps: CCap[];
  inductors: CInductor[];
  opamps: COpAmpHalf[];
}

export function compileCircuit(circuit: Circuit): Compiled {
  const netOf = new Map<string, string>();
  const netSize = new Map<string, number>();
  for (const net of circuit.nets) {
    netSize.set(net.name, net.pins.length);
    for (const p of net.pins) netOf.set(p, net.name);
  }

  const gs = groundSource(circuit.components);
  const ground = gs ? (netOf.get(pinId(gs.ref, '-')) ?? null) : (circuit.nets[0]?.name ?? null);

  // terminals not on any net (e.g. unlisted pins in a challenge target) float on their own node
  for (const c of circuit.components)
    for (const t of terminalsOf(c.type)) {
      const id = pinId(c.ref, t);
      if (!netOf.has(id)) netOf.set(id, `__float:${id}`);
    }
  const nodes = [...new Set([...circuit.nets.map((n) => n.name), ...netOf.values()])].filter((n) => n !== ground);
  const idx = new Map<string, number>();
  nodes.forEach((n, i) => idx.set(n, i));
  const pinNode = new Map<string, number>();
  for (const [pin, name] of netOf) pinNode.set(pin, name === ground ? -1 : idx.get(name)!);
  const node = (ref: string, pin: string) => pinNode.get(pinId(ref, pin)) ?? -1;
  const connected = (ref: string, pin: string) => (netSize.get(netOf.get(pinId(ref, pin)) ?? '') ?? 0) > 1;

  const out: Compiled = { ground, nodes, N: nodes.length, pinNode, resistors: [], diodes: [], srcs: [], caps: [], inductors: [], opamps: [] };

  for (const c of circuit.components) {
    const p = c.props;
    switch (c.type) {
      case 'resistor':
        out.resistors.push({ ref: c.ref, kind: 'resistor', a: node(c.ref, '1'), b: node(c.ref, '2'), g: 1 / Math.max(p.resistance ?? 1000, 1e-3) });
        break;
      case 'potentiometer': {
        const R = p.resistance ?? 10000;
        const w = Math.min(1, Math.max(0, p.wiper ?? 0.5));
        out.resistors.push({ ref: c.ref, kind: 'pot', part: 'a', a: node(c.ref, '1'), b: node(c.ref, '2'), g: 1 / Math.max(R * w, 1) });
        out.resistors.push({ ref: c.ref, kind: 'pot', part: 'b', a: node(c.ref, '2'), b: node(c.ref, '3'), g: 1 / Math.max(R * (1 - w), 1) });
        break;
      }
      case 'pushbutton':
        out.resistors.push({ ref: c.ref, kind: 'button', a: node(c.ref, '1'), b: node(c.ref, '2'), g: p.pressed ? 1 / R_CLOSED : 1 / R_OFF });
        break;
      case 'switch': {
        const other = p.position === 'b' ? 'b' : 'a';
        out.resistors.push({ ref: c.ref, kind: 'switch', a: node(c.ref, 'com'), b: node(c.ref, other), g: 1 / R_CLOSED });
        break;
      }
      case 'ammeter':
        out.resistors.push({ ref: c.ref, kind: 'ammeter', a: node(c.ref, '+'), b: node(c.ref, '-'), g: 1 / AMMETER_R });
        break;
      case 'led': {
        const col = LED_COLORS[p.color ?? 'red'];
        out.diodes.push({ ref: c.ref, led: true, a: node(c.ref, 'anode'), k: node(c.ref, 'cathode'), vf: col.vf, rs: 12, on: false });
        break;
      }
      case 'diode':
        out.diodes.push({ ref: c.ref, led: false, a: node(c.ref, 'anode'), k: node(c.ref, 'cathode'), vf: 0.65, rs: 0.8, on: false });
        break;
      case 'capacitor':
        out.caps.push({ ref: c.ref, a: node(c.ref, '1'), b: node(c.ref, '2'), C: Math.max(p.capacitance ?? 100e-9, 1e-15) });
        break;
      case 'inductor':
        out.inductors.push({ ref: c.ref, a: node(c.ref, '1'), b: node(c.ref, '2'), L: Math.max(p.inductance ?? 10e-3, 1e-12), R: INDUCTOR_R });
        break;
      case 'battery':
      case 'power_module':
      case 'bench_supply':
      case 'dc_source':
        out.srcs.push({
          ref: c.ref,
          type: c.type,
          variant: p.variant,
          p: node(c.ref, '+'),
          n: node(c.ref, '-'),
          v: sourceVoltage(c),
          rint: sourceRint(c),
          ilim: c.type === 'bench_supply' ? (p.currentLimit ?? 0.1) : Infinity,
          cc: false,
        });
        break;
      case 'function_gen': {
        const gen = genSettings(p);
        out.srcs.push({ ref: c.ref, type: c.type, p: node(c.ref, '+'), n: node(c.ref, '-'), v: gen.offset, rint: GEN_R, ilim: Infinity, cc: false, gen });
        break;
      }
      case 'opamp':
        for (const h of OPAMP_HALVES)
          out.opamps.push({
            ref: c.ref,
            half: h.half,
            out: node(c.ref, h.out),
            inp: node(c.ref, h.inp),
            inn: node(c.ref, h.inn),
            vp: node(c.ref, 'v+'),
            vn: node(c.ref, 'v-'),
            used: connected(c.ref, h.out) || connected(c.ref, h.inp) || connected(c.ref, h.inn),
            mode: 'linear',
          });
        break;
      case 'scope_probe':
        break; // ideal probe: draws no current
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------
// dense LU (partial pivoting) on Float64Array, reusable for many right-hand sides

export class LU {
  private piv: Int32Array;
  private ok = true;
  constructor(
    private n: number,
    private a: Float64Array,
  ) {
    this.piv = new Int32Array(n);
    for (let k = 0; k < n; k++) {
      let p = k;
      let best = Math.abs(a[k * n + k]);
      for (let r = k + 1; r < n; r++) {
        const v = Math.abs(a[r * n + k]);
        if (v > best) {
          best = v;
          p = r;
        }
      }
      this.piv[k] = p;
      if (best < 1e-300) {
        this.ok = false;
        return;
      }
      if (p !== k)
        for (let j = 0; j < n; j++) {
          const t = a[k * n + j];
          a[k * n + j] = a[p * n + j];
          a[p * n + j] = t;
        }
      const d = a[k * n + k];
      for (let r = k + 1; r < n; r++) {
        const f = (a[r * n + k] /= d);
        if (f === 0) continue;
        for (let j = k + 1; j < n; j++) a[r * n + j] -= f * a[k * n + j];
      }
    }
  }
  get valid() {
    return this.ok;
  }
  /** Solves in place: b becomes x. */
  solve(b: Float64Array): boolean {
    if (!this.ok) return false;
    const { n, a, piv } = this;
    for (let k = 0; k < n; k++) {
      const p = piv[k];
      if (p !== k) {
        const t = b[k];
        b[k] = b[p];
        b[p] = t;
      }
    }
    for (let i = 1; i < n; i++) {
      let s = b[i];
      for (let j = 0; j < i; j++) s -= a[i * n + j] * b[j];
      b[i] = s;
    }
    for (let i = n - 1; i >= 0; i--) {
      let s = b[i];
      for (let j = i + 1; j < n; j++) s -= a[i * n + j] * b[j];
      b[i] = s / a[i * n + i];
    }
    for (let i = 0; i < n; i++) if (!Number.isFinite(b[i])) return false;
    return true;
  }
}

// ---------------------------------------------------------------------------------------
// stamping helpers shared with transient.ts

export class Stamper {
  A: Float64Array;
  b: Float64Array;
  constructor(readonly N: number) {
    this.A = new Float64Array(N * N);
    this.b = new Float64Array(N);
  }
  clear() {
    this.A.fill(0);
    this.b.fill(0);
  }
  /** conductance g between nodes i and j */
  g(i: number, j: number, g: number) {
    const { A, N } = this;
    if (i >= 0) A[i * N + i] += g;
    if (j >= 0) A[j * N + j] += g;
    if (i >= 0 && j >= 0) {
      A[i * N + j] -= g;
      A[j * N + i] -= g;
    }
  }
  /** current I injected into node i and taken out of node j */
  i(i: number, j: number, I: number) {
    if (i >= 0) this.b[i] += I;
    if (j >= 0) this.b[j] -= I;
  }
  /** raw matrix entry */
  m(r: number, c: number, v: number) {
    if (r >= 0 && c >= 0) this.A[r * this.N + c] += v;
  }
}

/** Matrix stamps of the piecewise-linear devices in their current states (no RHS). */
export function stampPwlMatrix(c: Compiled, s: Stamper) {
  for (const d of c.diodes) s.g(d.a, d.k, d.on ? 1 / d.rs : 1 / R_OFF);
  for (const src of c.srcs) s.g(src.p, src.n, src.cc ? 1e-6 : 1 / src.rint);
  const Go = 1 / OPAMP.rout;
  for (const o of c.opamps) {
    switch (o.mode) {
      case 'off':
        s.g(o.out, o.vn, 1 / R_OPAMP_OFF);
        break;
      case 'linear':
        // I_into_out = Go·(A·(Vp − Vn) − Vout)
        s.m(o.out, o.out, Go);
        s.m(o.out, o.inp, -Go * OPAMP.gain);
        s.m(o.out, o.inn, Go * OPAMP.gain);
        break;
      case 'high':
        // I_into_out = Go·(V(v+) − headroom − Vout)
        s.m(o.out, o.out, Go);
        s.m(o.out, o.vp, -Go);
        break;
      case 'low':
        s.m(o.out, o.out, Go);
        s.m(o.out, o.vn, -Go);
        break;
    }
  }
}

/** RHS stamps of the PWL devices + sources. `emf(src)` gives each source's EMF right now. */
export function stampPwlRhs(c: Compiled, s: Stamper, emf: (src: CSource) => number) {
  for (const d of c.diodes) if (d.on) s.i(d.a, d.k, d.vf / d.rs);
  for (const src of c.srcs) {
    if (src.cc) s.i(src.p, src.n, src.ilim);
    else s.i(src.p, src.n, emf(src) / src.rint);
  }
  const Go = 1 / OPAMP.rout;
  for (const o of c.opamps) if (o.mode === 'high' && o.out >= 0) s.b[o.out] -= Go * OPAMP.headroom;
}

/** Signature of all PWL states (to cache matrix factorisations). */
export function pwlKey(c: Compiled): string {
  let k = '';
  for (const d of c.diodes) k += d.on ? '1' : '0';
  for (const s of c.srcs) k += s.cc ? '1' : '0';
  for (const o of c.opamps) k += o.mode === 'low' ? 'w' : o.mode[0];
  return k;
}

/** Update PWL states from a solution; returns true if anything changed. */
export function updatePwl(c: Compiled, x: Float64Array | number[], emf: (src: CSource) => number, frozen = false): boolean {
  const V = (i: number) => (i < 0 ? 0 : x[i]);
  let changed = false;
  for (const d of c.diodes) {
    const vak = V(d.a) - V(d.k);
    if (!d.on && vak > d.vf + 1e-6) {
      d.on = true;
      changed = true;
    } else if (d.on && (vak - d.vf) / d.rs < -1e-9) {
      d.on = false;
      changed = true;
    }
  }
  for (const s of c.srcs) {
    if (!Number.isFinite(s.ilim)) continue;
    const vt = V(s.p) - V(s.n);
    if (!s.cc) {
      const I = (emf(s) - vt) / s.rint;
      if (I > s.ilim * 1.0001) {
        s.cc = true;
        changed = true;
      }
    } else if (vt > emf(s)) {
      s.cc = false;
      changed = true;
    }
  }
  for (const o of c.opamps) {
    const supply = V(o.vp) - V(o.vn);
    let mode: OpAmpMode = o.mode;
    if (supply < OPAMP.minSupply) mode = 'off';
    else {
      const hi = V(o.vp) - OPAMP.headroom;
      const lo = V(o.vn);
      const ideal = OPAMP.gain * (V(o.inp) - V(o.inn));
      const eps = 1e-6;
      // A clamped output breaks the feedback loop, so `ideal` (open-loop gain × the input
      // difference seen while clamped) only tells us whether the clamp still pushes the right
      // way. Leaving a rail always goes back to 'linear' first; the linear solution then
      // decides whether the other rail is really reached (jumping straight to the opposite
      // rail turned every amplifier into a comparator).
      if (mode === 'off') mode = 'linear';
      else if (mode === 'linear') mode = ideal > hi + eps ? 'high' : ideal < lo - eps ? 'low' : 'linear';
      else if (mode === 'high' && ideal < hi - eps) mode = 'linear';
      else if (mode === 'low' && ideal > lo + eps) mode = 'linear';
    }
    if (mode !== o.mode && !frozen) {
      o.mode = mode;
      changed = true;
    }
  }
  return changed;
}

/** Linear (non-PWL) DC stamps: resistors, GMIN, inductor windings. Capacitors are open. */
function stampDcLinear(c: Compiled, s: Stamper) {
  for (let i = 0; i < c.N; i++) s.A[i * c.N + i] += GMIN;
  for (const r of c.resistors) s.g(r.a, r.b, r.g);
  for (const l of c.inductors) s.g(l.a, l.b, 1 / l.R);
}

/** DC operating point of a compiled circuit (PWL states are updated in place). */
export function solveDcCompiled(c: Compiled, emf: (src: CSource) => number = (s) => s.v): { x: Float64Array; converged: boolean } {
  const N = c.N;
  let x = new Float64Array(N);
  let converged = N === 0;
  const st = new Stamper(N);
  for (let iter = 0; iter < 100 && N > 0; iter++) {
    st.clear();
    stampDcLinear(c, st);
    stampPwlMatrix(c, st);
    stampPwlRhs(c, st, emf);
    const lu = new LU(N, st.A);
    const b = st.b.slice();
    if (!lu.solve(b)) break;
    x = b;
    if (!updatePwl(c, x, emf, iter > 80)) {
      converged = true;
      break;
    }
  }
  return { x, converged };
}

export function simulate(circuit: Circuit): SimResult {
  const c = compileCircuit(circuit);
  const { x, converged } = solveDcCompiled(c);
  const V = (i: number) => (i < 0 ? 0 : x[i]);

  const nodeV = new Map<string, number>();
  if (c.ground) nodeV.set(c.ground, 0);
  c.nodes.forEach((n, i) => !n.startsWith('__float:') && nodeV.set(n, x[i] ?? 0));

  const current = new Map<string, number>();
  const vdrop = new Map<string, number>();
  const meters = new Map<string, MeterState>();
  for (const r of c.resistors) {
    const v = V(r.a) - V(r.b);
    if (!r.part) {
      current.set(r.ref, v * r.g);
      vdrop.set(r.ref, v);
      if (r.kind === 'ammeter') meters.set(r.ref, { current: v * r.g });
    } else if (r.part === 'a') {
      current.set(r.ref, v * r.g);
    }
  }
  for (const l of c.inductors) {
    const v = V(l.a) - V(l.b);
    current.set(l.ref, v / l.R);
    vdrop.set(l.ref, v);
  }
  for (const cap of c.caps) {
    current.set(cap.ref, 0);
    vdrop.set(cap.ref, V(cap.a) - V(cap.b));
  }
  const leds = new Map<string, LedState>();
  for (const d of c.diodes) {
    const vak = V(d.a) - V(d.k);
    const I = d.on ? (vak - d.vf) / d.rs : vak / R_OFF;
    current.set(d.ref, I);
    vdrop.set(d.ref, vak);
    leds.set(d.ref, ledState(d.on && I > 0.0005, I, I, vak < -0.5));
  }
  const sources = new Map<string, SourceState>();
  for (const s of c.srcs) {
    const vt = V(s.p) - V(s.n);
    const I = s.cc ? s.ilim - vt * 1e-6 : (s.v - vt) / s.rint;
    const limit = s.type === 'battery' ? BATTERIES[(s.variant as keyof typeof BATTERIES) ?? '9V'].maxCurrent : s.type === 'power_module' ? 0.5 : 2;
    current.set(s.ref, I);
    vdrop.set(s.ref, vt);
    sources.set(s.ref, {
      current: I,
      terminalVoltage: vt,
      ccMode: s.cc,
      shorted: s.gen ? false : s.cc ? vt < s.v * 0.2 : I > limit,
    });
  }
  const opamps = opampStates(c, V);
  return { ground: c.ground, nodeV, current, vdrop, leds, sources, meters, opamps, mcus: new Map(), bjts: new Map(), mosfets: new Map(), regs: new Map(), relays: new Map(), motors: new Map(), buzzers: new Map(), converged };
}

export function ledState(on: boolean, avg: number, peak: number, reverse: boolean): LedState {
  return {
    on,
    current: avg,
    brightness: on ? Math.min(1, Math.max(0, avg / 0.02)) : 0,
    overcurrent: avg > 0.03,
    burnt: avg > 0.06 || peak > 0.15,
    reverse,
  };
}

export function opampStates(c: Compiled, V: (i: number) => number): Map<string, OpAmpState> {
  const out = new Map<string, OpAmpState>();
  for (const o of c.opamps) {
    const supply = V(o.vp) - V(o.vn);
    const st = out.get(o.ref) ?? { powered: supply >= OPAMP.minSupply, supply, A: { out: 0, mode: 'off', used: false }, B: { out: 0, mode: 'off', used: false } };
    st[o.half] = { out: V(o.out), mode: o.mode, used: o.used };
    out.set(o.ref, st);
  }
  return out;
}
