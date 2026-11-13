// Contract for the theory-practice ("纯理论练习区") problem format "circuit-problem/1".
//
// A problem is defined by its *schematic drawing*: elements placed on an integer grid plus
// wires. The netlist is derived from the geometry (geometry.ts), so the picture the student
// sees and the circuit the engine solves can never disagree. Every numeric answer an author
// (usually an AI) writes is recomputed by the ideal analysis engine (../analysis) and the
// validator rejects the file if they differ.
//
// Conventions (also documented in docs/PROBLEM_FORMAT.md):
// - Grid units, x to the right, y DOWN (SVG convention).
// - Two-terminal elements go from `from` (terminal "p") to `to` (terminal "n"); the segment
//   must be horizontal or vertical and at least 2 units long. The symbol sits in the middle.
// - Passive sign convention for every two-terminal element: v = V(p) − V(n), i flows from p
//   through the element to n, absorbed power = v·i.
// - Voltage source: p is the "+" terminal.
// - Current source: the arrow points from p to n, i.e. the source pushes `value` amps through
//   itself from p to n (it leaves the source at n). Its passive-convention current is +value.
// - Dependent sources: the controlling quantity is the voltage across / current through
//   another element (passive convention of that element) or the voltage between two named nodes.

import type { Lang } from '../i18n';

export const PROBLEM_FORMAT_ID = 'circuit-problem/1';

export type Pt = [number, number];

/** Waveform of an independent source. A bare number means DC. */
export type SourceValue =
  | number
  | { dc?: number; ac?: { mag: number; phase?: number } } // AC phasor; phase in degrees; mag uses the problem's phasor convention (Analysis.phasor, default rms)
  | { step: { before: number; after: number } } // value changes at t = 0
  | { sin: { amp: number; freq: number; phase?: number; offset?: number } } // time domain: offset + amp·sin(2πft + phase°)
  // ---- non-sinusoidal periodic sources (analysis "periodic", see ../analysis/periodic.ts) ----
  /** dc + Σ amp_k·cos(kω₁t + phase_k°); amp is the AMPLITUDE (peak) of each harmonic */
  | { harmonics: { dc?: number; terms: PeriodicTerm[] } }
  /** a standard waveform given by its Fourier series up to harmonic `upTo` (see WaveShape), plus `offset` */
  | { wave: { shape: WaveShape; amp: number; upTo: number; offset?: number } }
  | { exp: { amp: number; alpha: number } } // tran only: amp·e^(−alpha·t) for t ≥ 0, 0 for t < 0
  | { impulse: { area: number } }; // tran only: area·δ(t) at t = 0

/** one harmonic of a periodic source: amplitude (peak) and initial phase in degrees, cosine reference */
export interface PeriodicTerm {
  k: number;
  amp: number;
  phase?: number;
}

/** Standard waveforms (T = 1/f₁, ω₁ = 2π/T), all with peak value `amp`:
 *  square: +amp on (0, T/2), −amp on (T/2, T);  triangle: 0 at t = 0 rising, +amp at T/4, −amp at 3T/4;
 *  sawtooth: rises linearly from 0 at t = 0 to amp at t = T (average amp/2);
 *  half-rect: half-wave rectified amp·cos ω₁t;  full-rect: amp·|cos(ω₁t/2)| — f₁ is the frequency of
 *  the rectified wave, twice the frequency of the sine that was rectified. */
export type WaveShape = 'square' | 'triangle' | 'sawtooth' | 'half-rect' | 'full-rect';

export type CtrlRef =
  | { v: string } // voltage across element (its p minus n)
  | { i: string } // current through element (its passive-convention current)
  | { vnodes: [string, string] }; // V(node1) − V(node2), node names from `labels` ("0"/"gnd" = ground)

export type TwoTerminalType =
  | 'R' // value: ohms
  | 'C' // value: farads, ic?: initial voltage (overrides the t<0 steady state when given)
  | 'L' // value: henries, ic?: initial current
  | 'V' // independent voltage source
  | 'I' // independent current source
  | 'VCVS' // value = gain (V/V), ctrl {v}|{vnodes}
  | 'VCCS' // value = transconductance (S), ctrl {v}|{vnodes}
  | 'CCVS' // value = transresistance (Ω), ctrl {i}
  | 'CCCS' // value = gain (A/A), ctrl {i}
  | 'SW' // ideal switch, state: before/after t=0
  | 'Z' // generic impedance for AC problems: value {re, im} ohms at the analysis frequency
  | 'ammeter' // ideal ammeter (0 Ω), current reading p→n
  | 'voltmeter' // ideal voltmeter (open), reading V(p) − V(n)
  | 'NR'; // nonlinear resistor, law: see NonlinearLaw (DC operating point / small-signal AC only)

/** Characteristic of a nonlinear resistor (type NR), passive convention (u = V(p) − V(n), i p → n):
 *  {i: [c0, c1, …]} i = Σ c_k·u^k (voltage-controlled; optional umin/umax: constant outside);
 *  {u: [c0, c1, …]} u = Σ c_k·i^k (current-controlled; optional imin/imax);
 *  {pwl: [[u0, i0], …]} polyline in the u–i plane, end segments extended as rays;
 *  {diode: {uon?, ron?}} ideal diode (anode = p), optional threshold voltage and on-resistance. */
export type NonlinearLaw =
  { i: number[]; umin?: number; umax?: number } | { u: number[]; imin?: number; imax?: number } | { pwl: [number, number][] } | { diode: { uon?: number; ron?: number } };

export interface TwoTerminalElement {
  ref: string; // unique, e.g. "R1", "Us", "I2"; shown as label
  type: TwoTerminalType;
  from: Pt;
  to: Pt;
  value?: number | string | SourceValue | { re: number; im: number }; // strings allow SI prefixes: "4.7k"
  ctrl?: CtrlRef;
  /** switch: closed before t=0? closed after? Defaults: before=open, after=closed */
  state?: { before: 'open' | 'closed'; after: 'open' | 'closed' };
  ic?: number;
  /** text shown next to the symbol instead of the auto "R1 = 2 kΩ" label, e.g. "R", "2Ω", "jωL" */
  label?: string;
  /** hide the value in the drawing (when the question asks for it) */
  hideValue?: boolean;
  /** NR only: the u–i characteristic */
  law?: NonlinearLaw;
}

/** Ideal op-amp (nullor: V+ = V−, no input current). Terminal positions relative to `at`:
 *  inverting input (−) at (−2, −1), non-inverting (+) at (−2, +1), output at (+2, 0)
 *  for orient "right". `flip: true` swaps the two inputs vertically. orient "left" mirrors x. */
export interface OpAmpElement {
  ref: string;
  type: 'OPAMP';
  at: Pt;
  orient?: 'right' | 'left';
  flip?: boolean;
}

/** Ideal transformer n:1 (v1 = n·v2, i1 = −i2/n with currents into the dotted terminals).
 *  Terminals relative to `at`: p1 (−2,−1), n1 (−2,+1), p2 (+2,−1), n2 (+2,+1); dots at p1 and p2. */
export interface TransformerElement {
  ref: string;
  type: 'XFMR';
  at: Pt;
  n: number;
}

/** Magnetic coupling between two inductors (drawn as a label + dots). Dots are at each
 *  inductor's p terminal. Give either k or M. */
export interface CouplingElement {
  ref: string;
  type: 'K';
  l1: string;
  l2: string;
  k?: number;
  M?: number | string;
}

export type ProblemElement = TwoTerminalElement | OpAmpElement | TransformerElement | CouplingElement;

export interface Schematic {
  elements: ProblemElement[];
  /** polylines; consecutive points must be axis-aligned */
  wires: Pt[][];
  /** named nodes: the label is drawn at the point; the name is what questions refer to */
  labels?: { at: Pt; name: string; hidden?: boolean }[];
  /** ground symbols; all are the same node "0" */
  grounds?: Pt[];
  /** open terminals (drawn as small circles), e.g. "a", "b" for Thevenin problems; also act as labels */
  terminals?: { at: Pt; name: string }[];
  /** reference directions drawn on the picture: a current arrow from p to n, or +/− marks at
   *  p/n. `name` is the symbol shown, e.g. "i1", "u_R". The parser adds one automatically for
   *  every element current / voltage a question asks about, unless one is already listed.
   *  On an OPAMP only kind "i" is allowed: an arrow on the output lead pointing away from the
   *  op-amp (the engine's {kind:'i', el:<opamp>} is the current flowing OUT of the output). */
  marks?: ({ kind: 'i'; el: string; name?: string } | { kind: 'v'; el: string; name?: string })[];
  /** mesh / loop current arrows (pure annotation, no effect on the netlist): a circular arrow
   *  centred at `at` (usually the centre of a mesh; must not sit on a wire or element) with
   *  `name` (e.g. "i_m1") in the middle. dir: 'cw' (default) or 'ccw' as seen on screen. */
  loops?: { at: Pt; name?: string; dir?: 'cw' | 'ccw' }[];
  /** optional u–i characteristic figure of a nonlinear resistor, drawn under the circuit */
  plot?: UiPlot;
  /** free text annotations */
  notes?: { at: Pt; text: string; i18n?: Partial<Record<Lang, string>> }[];
}

/** u–i plot of a nonlinear resistor (see src/core/problem/plot.ts). Ranges in SI units (V, A). */
export interface UiPlot {
  el: string;
  u: [number, number];
  i: [number, number];
  /** draw the load line of the rest of the circuit (one NR element only) */
  loadLine?: boolean;
  /** mark the operating points (leave off when they are what the question asks) */
  points?: boolean;
  /** current axis unit, default "A" */
  iUnit?: 'A' | 'mA' | 'µA';
}

export type Analysis =
  | { type: 'dc' }
  /** sinusoidal steady state at one frequency (give freq in Hz or omega in rad/s).
   *  phasor 'rms' (default, as in most textbooks): |V| is the rms value and P = Re(V·I*).
   *  phasor 'peak': |V| is the amplitude and P = ½·Re(V·I*). */
  | { type: 'ac'; freq?: number; omega?: number; phasor?: 'peak' | 'rms' }
  | { type: 'tran'; tstop?: number } // switches / step sources change at t = 0; t < 0 is DC steady state
  /** non-sinusoidal periodic steady state: fundamental freq (Hz) or omega (rad/s); every source is a
   *  DC term plus harmonics, the circuit is solved harmonic by harmonic (superposition).
   *  phasor: convention of per-harmonic phasor results (default 'rms'). See ../analysis/periodic.ts. */
  | { type: 'periodic'; freq?: number; omega?: number; phasor?: 'peak' | 'rms' };

/** What a question asks for. Everything here is computed by the engine and compared with `answer`. */
export type Quantity =
  | { kind: 'v'; nodes: [string, string?] } // node voltage (2nd defaults to ground)
  | { kind: 'v'; el: string } // voltage across element (p − n)
  | { kind: 'i'; el: string } // current through element (passive convention)
  | { kind: 'p'; el: string } // power ABSORBED by element (DC: v·i; AC: average power P)
  | { kind: 'q'; el: string } // AC reactive power absorbed (var)
  | { kind: 's'; el: string } // AC apparent power |S| (VA)
  | { kind: 'pf'; el: string } // power factor cos φ of element (or of the source's load)
  // port quantities: `exclude` lists elements removed before the calculation — typically the load
  // R_L / Z_L drawn across the port in "find R_L for maximum power" problems
  | { kind: 'req'; port: [string, string]; exclude?: string[] } // equivalent resistance / |Z| seen at port, independent sources zeroed (dependent sources kept)
  | { kind: 'vth'; port: [string, string]; exclude?: string[] } // open-circuit voltage V(a) − V(b) (Thevenin voltage)
  | { kind: 'isc'; port: [string, string]; exclude?: string[] } // short-circuit current from a to b through the short (Norton current)
  | { kind: 'pmax'; port: [string, string]; exclude?: string[] } // maximum power deliverable to a load at the port
  | { kind: 'tau' } // time constant of a first-order circuit for t > 0
  | { kind: 'meter'; el: string } // reading of an ammeter / voltmeter element
  | { kind: 'gain'; out: [string, string?]; input: string } // network function V(out)/source value (AC: complex)
  | { kind: 'f0'; port?: [string, string] } // resonant frequency (Hz) where the input impedance is purely real
  | {
      kind: 'twoport';
      ports: [[string, string], [string, string]];
      param: 'z11' | 'z12' | 'z21' | 'z22' | 'y11' | 'y12' | 'y21' | 'y22' | 'h11' | 'h12' | 'h21' | 'h22' | 'a' | 'b' | 'c' | 'd';
    }
  /** stored energy (J): C ½Cu², L ½Li² (the inductor's own energy only); el = a K ref gives the
   *  total energy of the coupled pair ½L1i1² + ½L2i2² + M·i1·i2. DC and tran (at t). */
  | { kind: 'w'; el: string }
  /** the element's own value in SI (R Ω, C F, L H, gain, XFMR n, K → M, Z complex, source value) */
  | { kind: 'val'; el: string }
  /** wattmeter: current coil = the ammeter `current` (p→n current), voltage coil across nodes a, b.
   *  AC: Re(U_ab·I*) (½ for peak phasors); DC / tran: U_ab·I */
  | { kind: 'wattmeter'; current: string; nodes: [string, string] }
  /** natural frequencies (1/s) of the t > 0 circuit, non-zero ones sorted by real part descending,
   *  then imaginary part descending; n = 1, 2, … (part 're' default, 'im', 'mag') */
  | { kind: 'root'; n: number }
  /** damping coefficient α: second-order −(s1+s2)/2; otherwise −Re of the dominant complex pair */
  | { kind: 'alpha' }
  /** damped natural frequency ω_d = |Im| of the dominant complex pair (error if all roots are real) */
  | { kind: 'omega_d' }
  /** undamped natural frequency ω0 = √(s1·s2) of a second-order circuit */
  | { kind: 'omega0' }
  /** −3 dB cutoff frequency (Hz) of V(out)/input: |H| = max|H|/√2; `which` picks the lower/upper one */
  | { kind: 'fc'; out: [string, string?]; input: string; which?: 'low' | 'high' }
  /** −3 dB bandwidth (Hz) of V(out)/input: upper − lower cutoff */
  | { kind: 'bw'; out: [string, string?]; input: string }
  /** quality factor at resonance: Q = ω0 · (average stored energy) / (average power), seen from
   *  `port` (or the single independent source). Series RLC: ω0L/R; parallel GCL: ω0C/G. */
  | { kind: 'Q'; port?: [string, string] }
  // nonlinear resistors (type NR): the circuit's DC operating point(s)
  /** static resistance U_Q / I_Q of an NR element at the operating point */
  | { kind: 'rs'; el: string }
  /** dynamic (incremental) resistance du/di of an NR element at the operating point */
  | { kind: 'rd'; el: string }
  /** number of DC operating points */
  | { kind: 'nop' }
  // ---- s-domain chapter (complex-frequency analysis); see analysis/sdomain.ts ----
  /** network function H(s) = output / input source (zero initial state, other sources zero) at a complex s;
   *  out: ["a"] / ["a", "b"] node voltage, {v: ref} element voltage, {i: ref} element current. Complex: part re (default) / im / mag / phase */
  | { kind: 'H'; out: SOut; input: string; s: number | { re?: number; im?: number } }
  /** n-th pole / finite zero of H(s) after pole–zero cancellation (sorted by real part descending, then imaginary part descending) */
  | { kind: 'pole'; out: SOut; input: string; n: number }
  | { kind: 'zero'; out: SOut; input: string; n: number }
  /** coefficient of s^power in the numerator / denominator of H(s), with the denominator made monic (leading coefficient 1) */
  | { kind: 'hcoef'; out: SOut; input: string; of: 'num' | 'den'; power: number }
  /** tran: partial-fraction coefficient of 1/(s − at)^order (order 1 = residue) in the transform Y(s) of the actual response for t > 0 */
  | { kind: 'residue'; out: SOut; at: number | { re?: number; im?: number }; order?: number };

/** s-domain output: node voltage ["a"] / ["a", "b"], element voltage {v: ref}, element current {i: ref} */
export type SOut = [string, string?] | { v: string } | { i: string };

/** Which part of a (possibly complex) result is asked. Default: 're' for DC/tran (plain number), 'mag' for AC. */
export type Part =
  | 're'
  | 'im'
  | 'mag'
  | 'phase'
  | 'db'
  | 'rms'
  // periodic analysis, whole waveform (no `harmonic`): average (DC component), rectified average
  // (average of |x|), peak (max |x(t)|); the default there is 'rms' = √(X₀² + Σ X_k²)
  | 'avg'
  | 'absavg'
  | 'peak';

export interface Question {
  id: string;
  ask: string;
  /** what is computed; omit for multiple-choice or free-form questions */
  find?: Quantity & {
    part?: Part;
    t?: number | '0-' | '0+' | 'inf';
    /** tran, kinds 'v' / 'i': time derivative d/dt at t (V/s, A/s) */
    deriv?: 1;
    /** periodic: ask about one harmonic only (0 = DC component, 1 = fundamental, …) */
    harmonic?: number;
    /** nonlinear circuits with several DC operating points: which one (1, 2, …, ordered by the
     *  voltage of the first NR element, ascending) */
    op?: number;
    /** AC problems: evaluate with the DC parts of the sources instead (e.g. the operating point
     *  U_Q of a small-signal problem) */
    dc?: boolean;
    /** AC: evaluate this question at another frequency (Hz or rad/s) than analysis.freq/omega */
    freq?: number;
    omega?: number;
  };
  /** the author's answer, in SI base units (V, A, W, Ω, Hz, s, degrees for phase) */
  answer?: number;
  /** unit shown to the student; a prefixed unit (e.g. "mA") means a bare number they type is read in that unit */
  unit?: string;
  /** relative tolerance accepted from the student (default 0.02) */
  tol?: number;
  /** absolute tolerance for angle answers in degrees (default PHASE_TOL_DEG = 1°); lab readings use 2° */
  tolDeg?: number;
  choices?: string[];
  correct?: number;
  /** multiple choice: why each option is right / wrong (same length as choices; "" for none), shown when it is picked */
  choiceExplain?: string[];
  /** explanation shown after answering */
  explain?: string;
}

/** Text fields (statement, solution, ask, explain) may also be written as an array of lines. */
export interface ProblemText {
  title?: string;
  /** tags translated by position */
  tags?: string[];
  statement?: string;
  questions?: { ask?: string; explain?: string; choices?: string[]; choiceExplain?: string[] }[];
  hints?: string[];
  solution?: string;
  notes?: string[];
}

export interface ProblemFile {
  format: typeof PROBLEM_FORMAT_ID;
  id: string;
  lang?: Lang;
  /** chapter id, see CHAPTERS in chapters.ts */
  chapter: string;
  title: string;
  level: number; // 1..5
  tags?: string[];
  statement: string;
  schematic: Schematic;
  analysis: Analysis;
  questions: Question[];
  hints?: string[];
  /** worked solution, markdown-lite (same renderer as challenge descriptions) */
  solution?: string;
  i18n?: Partial<Record<Lang, ProblemText>>;
}

// ---------- results of the engine, consumed by the validator and the UI ----------

export interface Complex {
  re: number;
  im: number;
}

export interface Netlist {
  /** node name for every terminal "REF.pin"; ground is "0" */
  nodeOf: Map<string, string>;
  nodes: string[];
  elements: ProblemElement[];
  /** extra names for nodes, name → node in `nodes` (e.g. a terminal "b" sitting on ground → "0").
   *  Anything that looks up a node by name must resolve it through here first. */
  aliases?: Map<string, string>;
}

/** Pin names used in Netlist.nodeOf ("REF.pin"):
 *  two-terminal elements: "p", "n"; OPAMP: "minus", "plus", "out" (output is referenced to
 *  ground); XFMR: "p1", "n1", "p2", "n2"; K has no pins. Ground node is "0". Named nodes keep
 *  their label / terminal name; other nodes are named "_1", "_2", … */
export const PINS = {
  twoTerminal: ['p', 'n'],
  OPAMP: ['minus', 'plus', 'out'],
  XFMR: ['p1', 'n1', 'p2', 'n2'],
} as const;

/** Find a question's quantity. Implemented in ../analysis (computeQuantity). */
export type Find = NonNullable<Question['find']>;

// API between the modules (each module owns its implementation):
//   geometry.ts   extractNetlist(s: Schematic): { netlist: Netlist; errors: string[]; warnings: string[] }
//                 terminalPoints(el: ProblemElement): Record<string, Pt>
//   ../analysis   computeQuantity(netlist: Netlist, analysis: Analysis, find: Find): number
//                 (throws AnalysisError with a readable message; complex results are reduced by find.part)
//   parse.ts      parseProblem(json: unknown, source?: string, file?: string): ProblemValidation
