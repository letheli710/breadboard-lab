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
// Phase 5 (constants in devices.ts / mcu.ts, contract in docs/ROADMAP.md):
//   ldr / ntc          resistors whose value follows `lux` / `temperature`
//   buzzer             PWL diode 1.0 V + 140 Ω (SimResult.buzzers)
//   motor / relay coil inductors with their winding R (relay contacts follow the coil
//                      current with pull-in / drop-out hysteresis, see updateRelays)
//   npn                BE diode + collector: open / active (Ic = β·Ib) / saturation; C–E breakdown
//   nmos               off / ohmic (K·Vov·Vds) / saturation (K·Vov²/2), Vov quantised; body diode, avalanche
//   ldo + onboard regs regulate / dropout / current limit / off
//   dev boards         USB 5 V → Schottky → 5V pin → regulator → 3V3; chip load; GPIO drivers as
//                      conductances to 3V3 / GND; pulls; ESD clamps; brown-out + EN

import { BODY_DIODE, BUZZER, LDO, MOS_GDS, MOTOR, NPN, RELAY, VOV_STEP, ldrResistance, mosfetParams, ntcResistance } from './devices';
import {
  CLAMP_DIODE,
  FLOAT_Z,
  USB_DIODE,
  USB_SOURCE,
  VPIN_MAX,
  VPIN_MAX_FT,
  VPIN_MIN,
  adcRaw,
  boardOf,
  isMcu,
  isOutputMode,
  mcuPin,
  pinConfig,
  type GpioCaps,
  type McuBoardDef,
} from './mcu';
import {
  AMMETER_R,
  BATTERIES,
  GEN_R,
  INDUCTOR_R,
  LED_COLORS,
  OPAMP,
  OPAMP_HALVES,
  genSettings,
  groundSource,
  groundTerminal,
  sourceRint,
  sourceVoltage,
  terminalsOfComp,
} from './parts';
import type { CComponent, Circuit, PinMode } from './types';
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
  kind: 'resistor' | 'pot' | 'switch' | 'button' | 'ammeter' | 'hidden';
}

export type DiodeRole = 'bv' | 'clampUp' | 'clampDn' | 'body' | 'usb' | 'be' | 'boardLed';

export interface CDiode {
  ref: string;
  led: boolean;
  a: number;
  k: number;
  vf: number;
  rs: number;
  on: boolean;
  /** internal diode of a bigger device (not shown as an LED/diode; `ref` = "OWNER#role") */
  hidden?: boolean;
  /** the owning component's ref and what the diode models */
  owner?: string;
  role?: DiodeRole;
  buzzer?: boolean;
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
  /** USB source of a dev board: owner ref */
  owner?: string;
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
  kind?: 'inductor' | 'coil' | 'motor';
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

// ---- phase 5 compiled devices -------------------------------------------------------

export interface CReg {
  ref: string;
  /** owning dev board, for an onboard regulator */
  owner?: string;
  in: number;
  out: number;
  gnd: number;
  vset: number;
  dropout: number;
  /** series resistance in dropout (Ω) */
  rd: number;
  ro: number;
  limit: number;
  iq: number;
  mode: RegMode;
}

export interface CBjt {
  ref: string;
  c: number;
  b: number;
  e: number;
  beta: number;
  be: CDiode;
  bv: CDiode;
  cmode: 'open' | 'active' | 'sat';
}

export interface CMos {
  ref: string;
  g: number;
  d: number;
  s: number;
  K: number;
  vth: number;
  mode: MosRegion;
  /** quantised gate overdrive used by the PWL model (V) */
  vovQ: number;
  body: CDiode;
  bv: CDiode;
}

export interface CRelay {
  ref: string;
  coil: CInductor;
  no: CResistor;
  nc: CResistor;
  energized: boolean;
}

export interface CGpio {
  ref: string;
  pin: string;
  node: number;
  caps: GpioCaps;
  /** configured mode (an output mode on an input-only pin behaves as `input`) */
  mode: PinMode;
  /** mode the model actually uses */
  eff: PinMode;
  g: number;
  gpull: number;
  /** PWM duty 0..1 and frequency */
  duty: number;
  freq: number;
  /** PWM switch state: DC solver uses the average; transient.ts toggles high/low */
  pwm: 'avg' | 'high' | 'low';
  /** open drain: the high state releases the pin */
  od: boolean;
  up?: CDiode;
  dn: CDiode;
  weak: boolean;
}

export interface CMcu {
  ref: string;
  type: McuState['type'];
  board: McuBoardDef;
  vdd: number;
  gnd: number;
  v5: number;
  en: number;
  usb: CSource | null;
  usbDiode: CDiode | null;
  reg: CReg;
  core: CResistor;
  enPull: CResistor | null;
  powerLed: CDiode;
  userLed: CDiode | null;
  pins: CGpio[];
  running: boolean;
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
  regs: CReg[];
  bjts: CBjt[];
  mosfets: CMos[];
  relays: CRelay[];
  mcus: CMcu[];
  gpios: CGpio[];
}

/** True if a component is a dev board with at least one pin in PWM mode. */
export function hasPwm(circuit: Circuit): boolean {
  return circuit.components.some((c) => isMcu(c.type) && Object.values(c.props.pins ?? {}).some((p) => p?.mode === 'pwm'));
}

export function compileCircuit(circuit: Circuit): Compiled {
  const netOf = new Map<string, string>();
  const netSize = new Map<string, number>();
  for (const net of circuit.nets) {
    netSize.set(net.name, net.pins.length);
    for (const p of net.pins) netOf.set(p, net.name);
  }

  // terminals not on any net (e.g. unlisted pins in a challenge target) float on their own node
  const internal: string[] = [];
  for (const c of circuit.components) {
    for (const t of terminalsOfComp(c, circuit)) {
      const id = pinId(c.ref, t);
      if (!netOf.has(id)) netOf.set(id, `__float:${id}`);
    }
    if (isMcu(c.type) && c.props.usb !== false) internal.push(`__float:${c.ref}#usb`);
  }
  const gs = groundSource(circuit.components);
  const ground = gs ? (netOf.get(pinId(gs.ref, groundTerminal(gs))) ?? null) : (circuit.nets[0]?.name ?? null);
  const nodes = [...new Set([...circuit.nets.map((n) => n.name), ...netOf.values(), ...internal])].filter((n) => n !== ground);
  const idx = new Map<string, number>();
  nodes.forEach((n, i) => idx.set(n, i));
  const pinNode = new Map<string, number>();
  for (const [pin, name] of netOf) pinNode.set(pin, name === ground ? -1 : idx.get(name)!);
  const node = (ref: string, pin: string) => pinNode.get(pinId(ref, pin)) ?? -1;
  const connected = (ref: string, pin: string) => (netSize.get(netOf.get(pinId(ref, pin)) ?? '') ?? 0) > 1;

  const out: Compiled = {
    ground,
    nodes,
    N: nodes.length,
    pinNode,
    resistors: [],
    diodes: [],
    srcs: [],
    caps: [],
    inductors: [],
    opamps: [],
    regs: [],
    bjts: [],
    mosfets: [],
    relays: [],
    mcus: [],
    gpios: [],
  };
  const hiddenDiode = (owner: string, role: DiodeRole, a: number, k: number, vf: number, rs: number, tag: string = role): CDiode => {
    const d: CDiode = { ref: `${owner}#${tag}`, led: false, a, k, vf, rs, on: false, hidden: true, owner, role };
    out.diodes.push(d);
    return d;
  };

  for (const c of circuit.components) {
    const p = c.props;
    switch (c.type) {
      case 'resistor':
        out.resistors.push({ ref: c.ref, kind: 'resistor', a: node(c.ref, '1'), b: node(c.ref, '2'), g: 1 / Math.max(p.resistance ?? 1000, 1e-3) });
        break;
      case 'ldr':
        out.resistors.push({ ref: c.ref, kind: 'resistor', a: node(c.ref, '1'), b: node(c.ref, '2'), g: 1 / ldrResistance(p.lux ?? 100) });
        break;
      case 'ntc':
        out.resistors.push({ ref: c.ref, kind: 'resistor', a: node(c.ref, '1'), b: node(c.ref, '2'), g: 1 / ntcResistance(p.temperature ?? 25) });
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
      case 'buzzer':
        out.diodes.push({ ref: c.ref, led: false, buzzer: true, a: node(c.ref, '+'), k: node(c.ref, '-'), vf: BUZZER.vf, rs: BUZZER.rs, on: false });
        break;
      case 'capacitor':
        out.caps.push({ ref: c.ref, a: node(c.ref, '1'), b: node(c.ref, '2'), C: Math.max(p.capacitance ?? 100e-9, 1e-15) });
        break;
      case 'inductor':
        out.inductors.push({ ref: c.ref, a: node(c.ref, '1'), b: node(c.ref, '2'), L: Math.max(p.inductance ?? 10e-3, 1e-12), R: INDUCTOR_R, kind: 'inductor' });
        break;
      case 'motor':
        out.inductors.push({ ref: c.ref, a: node(c.ref, '+'), b: node(c.ref, '-'), L: MOTOR.L, R: MOTOR.R, kind: 'motor' });
        break;
      case 'relay': {
        const coil: CInductor = { ref: c.ref, a: node(c.ref, 'coil1'), b: node(c.ref, 'coil2'), L: RELAY.coilL, R: RELAY.coilR, kind: 'coil' };
        out.inductors.push(coil);
        const no: CResistor = { ref: `${c.ref}#no`, kind: 'hidden', a: node(c.ref, 'com'), b: node(c.ref, 'no'), g: 1 / R_OFF };
        const nc: CResistor = { ref: `${c.ref}#nc`, kind: 'hidden', a: node(c.ref, 'com'), b: node(c.ref, 'nc'), g: 1 / RELAY.rContact };
        out.resistors.push(no, nc);
        out.relays.push({ ref: c.ref, coil, no, nc, energized: false });
        break;
      }
      case 'npn': {
        const cN = node(c.ref, 'c');
        const bN = node(c.ref, 'b');
        const eN = node(c.ref, 'e');
        const be = hiddenDiode(c.ref, 'be', bN, eN, NPN.vbe, NPN.rbe);
        const bv = hiddenDiode(c.ref, 'bv', cN, eN, NPN.bv, 2);
        out.bjts.push({ ref: c.ref, c: cN, b: bN, e: eN, beta: Math.max(1, p.beta ?? NPN.beta), be, bv, cmode: 'open' });
        break;
      }
      case 'nmos': {
        const m = mosfetParams(p);
        const d = node(c.ref, 'd');
        const s = node(c.ref, 's');
        const body = hiddenDiode(c.ref, 'body', s, d, BODY_DIODE.vf, BODY_DIODE.rs);
        const bv = hiddenDiode(c.ref, 'bv', d, s, m.bv, 1);
        out.mosfets.push({ ref: c.ref, g: node(c.ref, 'g'), d, s, K: m.K, vth: m.vth, mode: 'off', vovQ: 0, body, bv });
        break;
      }
      case 'ldo':
        out.regs.push({
          ref: c.ref,
          in: node(c.ref, 'in'),
          out: node(c.ref, 'out'),
          gnd: node(c.ref, 'gnd'),
          vset: p.voltage ?? 3.3,
          dropout: LDO.dropout,
          rd: 0.2,
          ro: LDO.ro,
          limit: LDO.limit,
          iq: LDO.iq,
          mode: 'off',
        });
        break;
      case 'esp32_devkit':
      case 'stm32_bluepill':
      case 'mcu':
        compileMcu(c, circuit, out, node, connected, hiddenDiode, idx);
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

function compileMcu(
  c: CComponent,
  circuit: Circuit,
  out: Compiled,
  node: (ref: string, pin: string) => number,
  connected: (ref: string, pin: string) => boolean,
  hiddenDiode: (owner: string, role: DiodeRole, a: number, k: number, vf: number, rs: number, tag?: string) => CDiode,
  idx: Map<string, number>,
) {
  const b = boardOf(c.type);
  const vdd = node(c.ref, '3V3');
  const gnd = node(c.ref, 'GND');
  const v5 = node(c.ref, '5V');
  const enName = c.type === 'stm32_bluepill' ? 'NRST' : 'EN';
  const en = node(c.ref, enName);
  let usb: CSource | null = null;
  let usbDiode: CDiode | null = null;
  if (c.props.usb !== false) {
    const un = idx.get(`__float:${c.ref}#usb`) ?? -1;
    usb = { ref: `${c.ref}#usb`, type: 'usb', owner: c.ref, p: un, n: gnd, v: USB_SOURCE.v, rint: USB_SOURCE.rint, ilim: Infinity, cc: false };
    out.srcs.push(usb);
    usbDiode = hiddenDiode(c.ref, 'usb', un, v5, USB_DIODE.vf, USB_DIODE.rs);
  }
  const reg: CReg = {
    ref: `${c.ref}#reg`,
    owner: c.ref,
    in: v5,
    out: vdd,
    gnd,
    vset: b.vdd,
    dropout: b.regulator.dropout,
    rd: 0.3,
    ro: 0.05,
    limit: b.regulator.limit,
    iq: 0.004,
    mode: 'off',
  };
  out.regs.push(reg);
  const core: CResistor = { ref: `${c.ref}#core`, kind: 'hidden', a: vdd, b: gnd, g: 1 / b.coreR };
  out.resistors.push(core);
  // EN / NRST pull-up exists only when the pin is a real terminal (not on the generic target "mcu" without EN)
  const enPull: CResistor = { ref: `${c.ref}#en`, kind: 'hidden', a: en, b: vdd, g: 1 / b.enPull };
  out.resistors.push(enPull);
  const powerLed = hiddenDiode(c.ref, 'boardLed', vdd, gnd, 1.8, b.powerLedR + 12, 'pwr');
  const mcu: CMcu = {
    ref: c.ref,
    type: c.type as McuState['type'],
    board: b,
    vdd,
    gnd,
    v5,
    en,
    usb,
    usbDiode,
    reg,
    core,
    enPull,
    powerLed,
    userLed: null,
    pins: [],
    running: false,
  };

  const terms = terminalsOfComp(c, circuit);
  for (const t of terms) {
    const def = mcuPin(c.type, t);
    if (!def || def.kind !== 'gpio' || !def.gpio) continue;
    // logical role pins only exist when used; physical pins always (so modes show readings)
    const caps = def.gpio;
    const cfg = pinConfig(c.props, t);
    let eff = cfg.mode;
    if (isOutputMode(eff) && !caps.output) eff = 'input';
    if (eff === 'pwm' && !caps.pwm) eff = 'input';
    if ((eff === 'input_pullup' || eff === 'input_pulldown') && !caps.pull) eff = 'input';
    if (eff === 'adc' && !caps.adc) eff = 'input';
    // unconnected, unconfigured pins are idle inputs: no model needed (mcuState fills them in)
    if (!connected(c.ref, t) && !c.props.pins?.[t] && !(b.userLed && b.userLed.pin === t && c.type !== 'mcu')) continue;
    const pn = node(c.ref, t);
    const up = caps.ft ? hiddenDiode(c.ref, 'clampUp', pn, gnd, 6.0, CLAMP_DIODE.rs, `${t}:up`) : hiddenDiode(c.ref, 'clampUp', pn, vdd, CLAMP_DIODE.vf, CLAMP_DIODE.rs, `${t}:up`);
    const dn = hiddenDiode(c.ref, 'clampDn', gnd, pn, CLAMP_DIODE.vf, CLAMP_DIODE.rs, `${t}:dn`);
    const gp: CGpio = {
      ref: c.ref,
      pin: t,
      node: pn,
      caps,
      mode: cfg.mode,
      eff,
      g: 1 / b.rout,
      gpull: 1 / b.rpull,
      duty: cfg.duty / 100,
      freq: cfg.frequency,
      pwm: 'avg',
      od: cfg.openDrain,
      up,
      dn,
      weak: !!caps.weak,
    };
    mcu.pins.push(gp);
    out.gpios.push(gp);
    if (b.userLed && b.userLed.pin === t && c.type !== 'mcu') mcu.userLed = hiddenDiode(c.ref, 'boardLed', vdd, pn, 1.8, b.userLed.r + 12, 'led');
  }
  out.mcus.push(mcu);
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

// ---------------------------------------------------------------------------------------
// stamping helpers shared with transient.ts

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
  // linear regulators (rows = current leaving each node into the device)
  for (const r of c.regs) {
    if (r.mode === 'reg') {
      const g0 = 1 / r.ro;
      s.m(r.out, r.out, g0);
      s.m(r.out, r.gnd, -g0);
      s.m(r.in, r.gnd, g0);
      s.m(r.in, r.out, -g0);
    } else if (r.mode === 'dropout') {
      const gd = 1 / r.rd;
      s.m(r.in, r.in, gd);
      s.m(r.in, r.out, -gd);
      s.m(r.out, r.in, -gd);
      s.m(r.out, r.out, gd);
    }
  }
  for (const q of c.bjts) {
    if (q.cmode === 'active') {
      const k = q.beta / q.be.rs;
      s.m(q.c, q.b, k);
      s.m(q.c, q.e, -k);
      s.m(q.e, q.b, -k);
      s.m(q.e, q.e, k);
    } else if (q.cmode === 'sat') s.g(q.c, q.e, 1 / NPN.rsat);
    else s.g(q.c, q.e, 1 / R_OFF);
  }
  for (const m of c.mosfets) {
    if (m.mode === 'ohmic') s.g(m.d, m.s, m.K * m.vovQ);
    else if (m.mode === 'saturation') {
      const gm = m.K * m.vovQ;
      s.m(m.d, m.g, gm);
      s.m(m.d, m.s, -gm);
      s.m(m.s, m.g, -gm);
      s.m(m.s, m.s, gm);
      s.g(m.d, m.s, MOS_GDS);
    } else s.g(m.d, m.s, 1 / R_OFF);
  }
  for (const mc of c.mcus) {
    if (!mc.running) continue;
    for (const p of mc.pins) {
      switch (p.eff) {
        case 'out_high':
          if (!p.od) s.g(p.node, mc.vdd, p.g);
          break;
        case 'out_low':
          s.g(p.node, mc.gnd, p.g);
          break;
        case 'pwm':
          if (p.pwm === 'avg') {
            if (!p.od) s.g(p.node, mc.vdd, p.g * p.duty);
            s.g(p.node, mc.gnd, p.g * (1 - p.duty));
          } else if (p.pwm === 'low') s.g(p.node, mc.gnd, p.g);
          else if (!p.od) s.g(p.node, mc.vdd, p.g);
          break;
        case 'input_pullup':
          s.g(p.node, mc.vdd, p.gpull);
          break;
        case 'input_pulldown':
          s.g(p.node, mc.gnd, p.gpull);
          break;
      }
    }
  }
}

const rhs = (s: Stamper, i: number, v: number) => {
  if (i >= 0) s.b[i] += v;
};

/** RHS stamps of the PWL devices + sources. `emf(src)` gives each source's EMF right now. */
export function stampPwlRhs(c: Compiled, s: Stamper, emf: (src: CSource) => number) {
  for (const d of c.diodes) if (d.on) s.i(d.a, d.k, d.vf / d.rs);
  for (const src of c.srcs) {
    if (src.cc) s.i(src.p, src.n, src.ilim);
    else s.i(src.p, src.n, emf(src) / src.rint);
  }
  const Go = 1 / OPAMP.rout;
  for (const o of c.opamps) if (o.mode === 'high' && o.out >= 0) s.b[o.out] -= Go * OPAMP.headroom;
  for (const r of c.regs) {
    if (r.mode === 'off') continue;
    // quiescent current in → gnd
    rhs(s, r.in, -r.iq);
    rhs(s, r.gnd, r.iq);
    if (r.mode === 'reg') {
      const g0 = 1 / r.ro;
      rhs(s, r.out, g0 * r.vset);
      rhs(s, r.in, -g0 * r.vset);
    } else if (r.mode === 'dropout') {
      const gd = 1 / r.rd;
      rhs(s, r.in, gd * r.dropout);
      rhs(s, r.out, -gd * r.dropout);
    } else {
      rhs(s, r.in, -r.limit);
      rhs(s, r.out, r.limit);
    }
  }
  for (const q of c.bjts) {
    if (q.cmode === 'active') {
      const k = (q.beta * q.be.vf) / q.be.rs;
      rhs(s, q.c, k);
      rhs(s, q.e, -k);
    } else if (q.cmode === 'sat') s.i(q.c, q.e, NPN.vcesat / NPN.rsat);
  }
  for (const m of c.mosfets) {
    if (m.mode !== 'saturation') continue;
    const k = m.K * m.vovQ * m.vth + (m.K / 2) * m.vovQ * m.vovQ;
    rhs(s, m.d, k);
    rhs(s, m.s, -k);
  }
}

/** Signature of all PWL states (to cache matrix factorisations). */
export function pwlKey(c: Compiled): string {
  let k = '';
  for (const d of c.diodes) k += d.on ? '1' : '0';
  for (const s of c.srcs) k += s.cc ? '1' : '0';
  for (const o of c.opamps) k += o.mode === 'low' ? 'w' : o.mode[0];
  for (const r of c.regs) k += r.mode[0];
  for (const q of c.bjts) k += q.cmode[0];
  for (const m of c.mosfets) k += m.mode === 'off' ? 'x' : `${m.mode[0]}${Math.round(m.vovQ / VOV_STEP)}`;
  for (const r of c.relays) k += r.energized ? 'E' : 'e';
  for (const mc of c.mcus) k += mc.running ? 'R' : 'r';
  for (const p of c.gpios) if (p.eff === 'pwm') k += p.pwm[0];
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
  const set = <T, K extends keyof T>(o: T, k: K, v: T[K]) => {
    if (o[k] !== v && !frozen) {
      o[k] = v;
      changed = true;
    }
  };
  for (const r of c.regs) {
    const vin = V(r.in) - V(r.gnd);
    const vo = V(r.out) - V(r.gnd);
    const eps = 1e-6;
    let mode = r.mode;
    if (mode === 'reg') {
      const I = (r.vset - vo) / r.ro;
      if (vin - r.dropout < r.vset - eps) mode = 'dropout';
      else if (I > r.limit * 1.0001) mode = 'limit';
    } else if (mode === 'dropout') {
      const I = (vin - vo - r.dropout) / r.rd;
      if (I < -1e-9) mode = 'off';
      else if (vin - r.dropout > r.vset + 1e-4) mode = 'reg';
      else if (I > r.limit * 1.0001) mode = 'limit';
    } else if (mode === 'limit') {
      if (vo > r.vset + eps) mode = 'reg';
      else if (vo > vin - r.dropout + eps) mode = 'dropout';
    } else if (vin - vo > r.dropout + eps) mode = vin - r.dropout > r.vset ? 'reg' : 'dropout';
    set(r, 'mode', mode);
  }
  for (const q of c.bjts) {
    const vce = V(q.c) - V(q.e);
    const ib = q.be.on ? (V(q.b) - V(q.e) - q.be.vf) / q.be.rs : 0;
    let m = q.cmode;
    if (!q.be.on) m = 'open';
    else if (m === 'open') m = 'active';
    else if (m === 'active' && vce < NPN.vcesat - 1e-6) m = 'sat';
    else if (m === 'sat' && (vce - NPN.vcesat) / NPN.rsat > q.beta * ib + 1e-9) m = 'active';
    set(q, 'cmode', m);
  }
  for (const m of c.mosfets) {
    const vov = V(m.g) - V(m.s) - m.vth;
    const vds = V(m.d) - V(m.s);
    if (vov <= 0) {
      set(m, 'mode', 'off');
      continue;
    }
    const q = Math.max(VOV_STEP, Math.round(vov / VOV_STEP) * VOV_STEP);
    // keep the current quantisation step unless the gate moved by more than one step
    const vq = Math.abs(q - m.vovQ) < VOV_STEP * 0.75 ? m.vovQ : q;
    set(m, 'vovQ', vq);
    set(m, 'mode', vds >= vq / 2 ? 'saturation' : 'ohmic');
  }
  for (const mc of c.mcus) {
    const v3 = V(mc.vdd) - V(mc.gnd);
    const ven = V(mc.en) - V(mc.gnd);
    const bo = mc.board.brownout + (mc.running ? 0 : 0.05);
    set(mc, 'running', v3 >= bo && ven >= 0.5 * v3);
  }
  return changed;
}

/** Relay contacts follow the coil current (with pull-in / drop-out hysteresis). */
export function updateRelays(c: Compiled, coilCurrent: (l: CInductor) => number): boolean {
  let changed = false;
  for (const r of c.relays) {
    const I = Math.abs(coilCurrent(r.coil));
    const e = r.energized ? I >= RELAY.dropOut : I >= RELAY.pullIn;
    if (e !== r.energized) {
      r.energized = e;
      r.no.g = e ? 1 / RELAY.rContact : 1 / R_OFF;
      r.nc.g = e ? 1 / R_OFF : 1 / RELAY.rContact;
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

/** DC operating point of a compiled circuit (PWL states are updated in place). `lu` is the
 *  factorised DC matrix of the final state (used for impedance probing). */
export function solveDcCompiled(c: Compiled, emf: (src: CSource) => number = (s) => s.v): { x: Float64Array; converged: boolean; lu: LU | null } {
  const N = c.N;
  let x = new Float64Array(N);
  let converged = N === 0;
  let last: LU | null = null;
  const st = new Stamper(N);
  for (let iter = 0; iter < 150 && N > 0; iter++) {
    st.clear();
    stampDcLinear(c, st);
    stampPwlMatrix(c, st);
    stampPwlRhs(c, st, emf);
    const lu = new LU(N, st.A.slice());
    const b = st.b.slice();
    if (!lu.solve(b)) break;
    x = b;
    last = lu;
    const V = (i: number) => (i < 0 ? 0 : x[i]);
    const a = updatePwl(c, x, emf, iter > 120);
    const r = iter > 130 ? false : updateRelays(c, (l) => (V(l.a) - V(l.b)) / l.R);
    if (!a && !r) {
      converged = true;
      break;
    }
  }
  return { x, converged, lu: last };
}

export function simulate(circuit: Circuit): SimResult {
  const c = compileCircuit(circuit);
  const { x, converged, lu } = solveDcCompiled(c);
  const V = (i: number) => (i < 0 ? 0 : x[i]);
  /** DC impedance from a node to everything else (Ω): (A⁻¹)ᵢᵢ */
  const zCache = new Map<number, number>();
  const zAt = (i: number) => {
    if (i < 0) return 0;
    if (zCache.has(i)) return zCache.get(i)!;
    let z = Infinity;
    if (lu) {
      const b = new Float64Array(c.N);
      b[i] = 1;
      if (lu.solve(b)) z = b[i];
    }
    zCache.set(i, z);
    return z;
  };

  const nodeV = new Map<string, number>();
  if (c.ground && !c.ground.startsWith('__float:')) nodeV.set(c.ground, 0);
  c.nodes.forEach((n, i) => !n.startsWith('__float:') && nodeV.set(n, x[i] ?? 0));

  const current = new Map<string, number>();
  const vdrop = new Map<string, number>();
  const meters = new Map<string, MeterState>();
  for (const r of c.resistors) {
    if (r.kind === 'hidden') continue;
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
  const buzzers = new Map<string, BuzzerState>();
  const diodeI = (d: CDiode) => {
    const vak = V(d.a) - V(d.k);
    return d.on ? (vak - d.vf) / d.rs : vak / R_OFF;
  };
  for (const d of c.diodes) {
    if (d.hidden) continue;
    const vak = V(d.a) - V(d.k);
    const I = diodeI(d);
    current.set(d.ref, I);
    vdrop.set(d.ref, vak);
    if (d.buzzer) buzzers.set(d.ref, buzzerState(I, vak));
    else leds.set(d.ref, ledState(d.on && I > 0.0005, I, I, vak < -0.5, d.led));
  }
  const sources = new Map<string, SourceState>();
  for (const s of c.srcs) {
    if (s.owner) continue;
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

  // ---- phase 5 devices
  const regCurrent = (r: CReg) => {
    const vin = V(r.in) - V(r.gnd);
    const vo = V(r.out) - V(r.gnd);
    return r.mode === 'reg' ? (r.vset - vo) / r.ro : r.mode === 'dropout' ? (vin - vo - r.dropout) / r.rd : r.mode === 'limit' ? r.limit : 0;
  };
  const regs = new Map<string, RegState>();
  for (const r of c.regs) {
    if (r.owner) continue;
    const vin = V(r.in) - V(r.gnd);
    const vout = V(r.out) - V(r.gnd);
    const iout = regCurrent(r);
    regs.set(r.ref, { mode: r.mode, vin, vout, iout, power: Math.max(0, (vin - vout) * iout + (r.mode === 'off' ? 0 : vin * r.iq)) });
    current.set(r.ref, iout);
    vdrop.set(r.ref, vout);
  }
  const bvOn = (d: CDiode) => d.on && diodeI(d) > 1e-6;
  const bjts = new Map<string, BjtState>();
  for (const q of c.bjts) {
    const vbe = V(q.b) - V(q.e);
    const vce = V(q.c) - V(q.e);
    const ib = q.be.on ? Math.max(0, (vbe - q.be.vf) / q.be.rs) : 0;
    const ic = (q.cmode === 'active' ? q.beta * ib : q.cmode === 'sat' ? (vce - NPN.vcesat) / NPN.rsat : vce / R_OFF) + (bvOn(q.bv) ? diodeI(q.bv) : 0);
    const region: BjtRegion = q.cmode === 'open' || ib < 1e-7 ? 'cutoff' : q.cmode === 'sat' ? 'saturation' : 'active';
    bjts.set(q.ref, { region, ib, ic, vbe, vce, power: Math.max(0, vce * ic + vbe * ib), breakdown: bvOn(q.bv), baseFloating: zAt(q.b) > FLOAT_Z });
    current.set(q.ref, ic);
    vdrop.set(q.ref, vce);
  }
  const mosfets = new Map<string, MosState>();
  for (const m of c.mosfets) {
    const vgs = V(m.g) - V(m.s);
    const vds = V(m.d) - V(m.s);
    const ch = m.mode === 'ohmic' ? m.K * m.vovQ * vds : m.mode === 'saturation' ? m.K * m.vovQ * (vgs - m.vth) - (m.K / 2) * m.vovQ * m.vovQ + MOS_GDS * vds : vds / R_OFF;
    const id = ch - (m.body.on ? diodeI(m.body) : 0) + (bvOn(m.bv) ? diodeI(m.bv) : 0);
    const rds = m.mode === 'off' ? Infinity : 1 / (m.K * m.vovQ);
    mosfets.set(m.ref, { region: m.mode, vgs, vds, id, power: Math.abs(vds * id), rds, breakdown: bvOn(m.bv), gateFloating: zAt(m.g) > FLOAT_Z });
    current.set(m.ref, id);
    vdrop.set(m.ref, vds);
  }
  const relays = new Map<string, RelayState>();
  for (const r of c.relays) {
    const v = V(r.coil.a) - V(r.coil.b);
    relays.set(r.ref, { energized: r.energized, coilCurrent: v / r.coil.R, coilVoltage: v });
  }
  const motors = new Map<string, MotorState>();
  for (const l of c.inductors)
    if (l.kind === 'motor') {
      const v = V(l.a) - V(l.b);
      motors.set(l.ref, motorState(v / l.R, v));
    }
  const mcus = new Map<string, McuState>();
  for (const mc of c.mcus) mcus.set(mc.ref, mcuState(mc, circuit, V, zAt, diodeI, regCurrent));
  return {
    ground: c.ground?.startsWith('__float:') ? null : c.ground,
    nodeV,
    current,
    vdrop,
    leds,
    sources,
    meters,
    opamps,
    mcus,
    bjts,
    mosfets,
    regs,
    relays,
    motors,
    buzzers,
    converged,
  };
}

export function motorState(current: number, voltage: number): MotorState {
  const running = Math.abs(current) >= MOTOR.runCurrent;
  return { current, voltage, running, speed: running ? Math.min(1.5, Math.abs(voltage) / 5) : 0, direction: current >= 0 ? 1 : -1 };
}

export function buzzerState(current: number, voltage: number): BuzzerState {
  const on = voltage >= BUZZER.vOn && current > 0.001;
  return { on, current, voltage, loudness: on ? Math.min(1, (voltage - BUZZER.vOn + 0.5) / 3) : 0, reverse: voltage < -0.5 };
}

/** Driver + pull current flowing from the chip into a GPIO node (A). */
export function gpioDriverCurrent(mc: CMcu, p: CGpio, V: (i: number) => number): number {
  if (!mc.running) return 0;
  const vp = V(p.node);
  const toVdd = (g: number) => g * (V(mc.vdd) - vp);
  const toGnd = (g: number) => g * (V(mc.gnd) - vp);
  const hi = p.od ? 0 : p.g;
  switch (p.eff) {
    case 'out_high':
      return toVdd(hi);
    case 'out_low':
      return toGnd(p.g);
    case 'pwm':
      return p.pwm === 'avg' ? toVdd(hi * p.duty) + toGnd(p.g * (1 - p.duty)) : p.pwm === 'high' ? toVdd(hi) : toGnd(p.g);
    case 'input_pullup':
      return toVdd(p.gpull);
    case 'input_pulldown':
      return toGnd(p.gpull);
    default:
      return 0;
  }
}

function mcuState(mc: CMcu, circuit: Circuit, V: (i: number) => number, zAt: (i: number) => number, diodeI: (d: CDiode) => number, regCurrent: (r: CReg) => number): McuState {
  const b = mc.board;
  const vg = V(mc.gnd);
  const v3 = V(mc.vdd) - vg;
  const v5 = V(mc.v5) - vg;
  const comp = circuit.components.find((x) => x.ref === mc.ref)!;
  const netSize = new Map(circuit.nets.map((n) => [n.name, n.pins.length]));
  const netOfPin = new Map<string, string>();
  circuit.nets.forEach((n) => n.pins.forEach((p) => netOfPin.set(p, n.name)));
  const isConn = (pin: string) => (netSize.get(netOfPin.get(pinId(mc.ref, pin)) ?? '') ?? 0) > 1;
  const pins = new Map<string, PinState>();
  let intoVdd = 0; // current flowing from board-internal parts into the 3V3 node
  const iReg = regCurrent(mc.reg);
  intoVdd += iReg;
  intoVdd -= v3 * mc.core.g;
  intoVdd -= mc.enPull ? (V(mc.vdd) - V(mc.en)) * mc.enPull.g : 0;
  intoVdd -= Math.max(0, diodeI(mc.powerLed));
  if (mc.userLed) intoVdd -= Math.max(0, diodeI(mc.userLed));
  for (const p of mc.pins) {
    const vLocal = V(p.node) - vg;
    const drv = gpioDriverCurrent(mc, p, V);
    // the driver's high side takes its current from 3V3
    if (mc.running) {
      if (p.eff === 'out_high' || p.eff === 'input_pullup') intoVdd -= drv;
      else if (p.eff === 'pwm' && !p.od) intoVdd -= p.pwm === 'avg' ? p.g * p.duty * (V(mc.vdd) - V(p.node)) : p.pwm === 'high' ? drv : 0;
    }
    const up = p.up ? Math.max(0, diodeI(p.up)) : 0;
    const dn = Math.max(0, diodeI(p.dn));
    if (p.up && !p.caps.ft) intoVdd += up;
    const clamp = up + dn;
    const ft = p.caps.ft;
    const floating = (!isOutputMode(p.eff) && p.eff !== 'input_pullup' && p.eff !== 'input_pulldown') || (p.od && p.eff === 'out_high') ? zAt(p.node) > FLOAT_Z : false;
    let logic: LogicLevel;
    if (floating) logic = 'floating';
    else logic = vLocal >= b.vih ? 'high' : vLocal <= b.vil ? 'low' : 'undefined';
    const rec = p.weak ? b.iWeak : b.iRec;
    const st: PinState = {
      mode: p.mode,
      voltage: V(p.node),
      vLocal,
      current: drv,
      logic,
      clamp,
      overcurrent: Math.abs(drv) > rec + 1e-6,
      damaged: Math.abs(drv) > b.iMax + 1e-6 || clamp > b.iInjMax,
      overvoltage: vLocal > (ft ? VPIN_MAX_FT : VPIN_MAX),
      undervoltage: vLocal < VPIN_MIN,
      connected: isConn(p.pin),
    };
    if (p.eff === 'adc') st.adc = { volts: Math.max(0, Math.min(3.3, vLocal)), raw: adcRaw(vLocal) };
    if (p.eff === 'pwm') {
      st.duty = p.duty * 100;
      st.frequency = p.freq;
    }
    pins.set(p.pin, st);
  }
  // pins that are neither connected nor configured: idle inputs
  for (const t of terminalsOfComp(comp, circuit)) {
    if (pins.has(t)) continue;
    const def = mcuPin(comp.type, t);
    if (!def || def.kind !== 'gpio') continue;
    pins.set(t, {
      mode: pinConfig(comp.props, t).mode,
      voltage: 0,
      vLocal: 0,
      current: 0,
      logic: 'floating',
      clamp: 0,
      overcurrent: false,
      damaged: false,
      overvoltage: false,
      undervoltage: false,
      connected: false,
    });
  }
  const usbCurrent = mc.usb ? (mc.usb.v - (V(mc.usb.p) - V(mc.usb.n))) / mc.usb.rint : 0;
  const iUsbIn = mc.usbDiode ? Math.max(0, diodeI(mc.usbDiode)) : 0;
  const regIn = mc.reg.mode === 'off' ? 0 : iReg + mc.reg.iq;
  return {
    type: mc.type,
    running: mc.running,
    usb: !!mc.usb,
    v5,
    v3,
    usbCurrent,
    usbOverload: usbCurrent > b.usbLimit,
    reg: { mode: mc.reg.mode, iout: iReg, limit: mc.reg.limit, power: Math.max(0, (v5 - v3) * iReg) },
    i3v3Out: intoVdd,
    i5vOut: iUsbIn - regIn,
    powerLed: diodeI(mc.powerLed) > 0.0003,
    userLed: mc.userLed ? diodeI(mc.userLed) > 0.0003 : undefined,
    pins,
  };
}

/** LED / diode state. LEDs: > 30 mA over-current, > 60 mA average or > 150 mA peak burns out.
 *  Plain diodes (1N4007-class rectifier): rated 1 A average, burns above 2 A average / 30 A peak. */
export function ledState(on: boolean, avg: number, peak: number, reverse: boolean, isLed = true): LedState {
  return {
    on,
    current: avg,
    brightness: on ? Math.min(1, Math.max(0, avg / 0.02)) : 0,
    overcurrent: isLed ? avg > 0.03 : avg > 1,
    burnt: isLed ? avg > 0.06 || peak > 0.15 : avg > 2 || peak > 30,
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
