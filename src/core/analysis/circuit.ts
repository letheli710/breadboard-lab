// Internal circuit model built from a Netlist: node indices, parsed element values, sources.

import { parseValue } from '../format';
import type { Complex, CtrlRef, Netlist, TwoTerminalType } from '../problem/types';
import { cx } from './complex';
import { AnalysisError } from './errors';
import { isPeriodicValue, parsePeriodic, type Term } from './fourier';
import { type Lin, type NlLaw, parseLaw } from './nonlinear';
import { type LineSpec, parseLine } from './tline';

export type ElType = TwoTerminalType | 'OPAMP' | 'XFMR' | 'TL';

/** Independent source waveform, normalised. */
export type SrcSpec =
  | { kind: 'num'; value: number } // bare number: DC, or a 0° phasor in AC analysis
  | { kind: 'dcac'; dc: number; ac?: { mag: number; phase: number } }
  | { kind: 'step'; before: number; after: number }
  | { kind: 'sin'; amp: number; freq: number; phase: number; offset: number }
  // s-domain chapter (transient analysis only): amp·e^(−alpha·t) for t ≥ 0 (0 before), and area·δ(t)
  | { kind: 'exp'; amp: number; alpha: number }
  | { kind: 'impulse'; area: number };

export interface CEl {
  ref: string;
  type: ElType;
  /** node indices: two-terminal [p, n]; OPAMP [minus, plus, out]; XFMR / TL [p1, n1, p2, n2] */
  pins: number[];
  /** R (Ω), C (F), L (H), controlled-source gain, XFMR turns ratio n; NaN otherwise */
  value: number;
  z?: Complex;
  src?: SrcSpec;
  /** periodic sources ({harmonics} / {wave}): the harmonics k ≥ 1 (peak, cos reference); the DC term
   *  is src.dc. Only analysis "periodic" (./periodic.ts) uses them; DC / AC / transient reject them. */
  harmonics?: Term[];
  ctrl?: CtrlRef;
  sw?: { before: 'open' | 'closed'; after: 'open' | 'closed' };
  ic?: number;
  /** NR: the parsed characteristic (see nonlinear.ts) */
  nl?: NlLaw;
  /** NR: the linear branch a·u + b·i = c it is replaced by in the current solve (set by the
   *  operating-point solver / small-signal linearisation; an NR without it cannot be stamped) */
  lin?: Lin;
  /** TL: the line data (see tline.ts) */
  line?: LineSpec;
  /** test sources added by the engine (never zeroed) */
  synthetic?: boolean;
}

export interface Mutual {
  ref: string;
  l1: string;
  l2: string;
  M: number;
}

export const isTwoTerminal = (el: CEl): boolean => el.type !== 'OPAMP' && el.type !== 'XFMR' && el.type !== 'TL';
export const isIndependent = (el: CEl): boolean => el.type === 'V' || el.type === 'I';

const GROUND = new Set(['0', 'gnd', 'GND', 'Gnd']);
const PREFIX: Record<string, number> = { p: 1e-12, n: 1e-9, u: 1e-6, µ: 1e-6, μ: 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, meg: 1e6, Meg: 1e6, MEG: 1e6, G: 1e9 };
const NUM_RE = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)(meg|Meg|MEG|[pnuµμmkKMG])?(Ω|ohms?|Ohms?|F|H|V|A|S|W|Hz|s|VA|var)?$/;

/** Parses a number or an SI string ("4.7k", "4k7", "2.2u", "100n", "10mH", "1e-3", "1 kΩ"). */
export function parseNum(v: unknown, what: string): number {
  if (typeof v === 'number') {
    if (Number.isFinite(v)) return v;
    throw new AnalysisError(`${what}: value must be a finite number (got ${v})`);
  }
  if (typeof v === 'string') {
    let s = v.trim().replace(/\s+/g, '');
    if (s !== '') {
      const direct = Number(s);
      if (Number.isFinite(direct)) return direct;
      const mid = s.match(/^(\d+)(meg|Meg|MEG|[pnuµμmkKMG])(\d+)(.*)$/);
      if (mid) s = `${mid[1]}.${mid[3]}${mid[2]}${mid[4]}`;
      const m = s.match(NUM_RE);
      if (m) {
        const x = parseFloat(m[1]) * (m[2] ? PREFIX[m[2]] : 1);
        if (Number.isFinite(x)) return x;
      }
      const p = parseValue(s);
      if (p !== null) return p;
    }
  }
  if (v === undefined || v === null) throw new AnalysisError(`${what}: value is missing`);
  throw new AnalysisError(`${what}: cannot read the value ${JSON.stringify(v)} as a number (use e.g. 4700, "4.7k", "2.2u")`);
}

function parseSource(ref: string, v: unknown): SrcSpec {
  if (v === undefined || v === null) throw new AnalysisError(`${ref}: source value is missing`);
  if (typeof v === 'number' || typeof v === 'string') return { kind: 'num', value: parseNum(v, ref) };
  if (typeof v !== 'object') throw new AnalysisError(`${ref}: invalid source value ${JSON.stringify(v)}`);
  const o = v as Record<string, unknown>;
  if ('step' in o) {
    const s = (o.step ?? {}) as Record<string, unknown>;
    return { kind: 'step', before: parseNum(s.before, `${ref}.step.before`), after: parseNum(s.after, `${ref}.step.after`) };
  }
  if ('sin' in o) {
    const s = (o.sin ?? {}) as Record<string, unknown>;
    const freq = parseNum(s.freq, `${ref}.sin.freq`);
    if (!(freq > 0)) throw new AnalysisError(`${ref}.sin.freq must be > 0 Hz`);
    return {
      kind: 'sin',
      amp: parseNum(s.amp, `${ref}.sin.amp`),
      freq,
      phase: s.phase === undefined ? 0 : parseNum(s.phase, `${ref}.sin.phase`),
      offset: s.offset === undefined ? 0 : parseNum(s.offset, `${ref}.sin.offset`),
    };
  }
  if ('exp' in o) {
    const s = (o.exp ?? {}) as Record<string, unknown>;
    return { kind: 'exp', amp: parseNum(s.amp, `${ref}.exp.amp`), alpha: parseNum(s.alpha, `${ref}.exp.alpha`) };
  }
  if ('impulse' in o) {
    const s = (o.impulse ?? {}) as Record<string, unknown>;
    return { kind: 'impulse', area: parseNum(s.area, `${ref}.impulse.area`) };
  }
  if ('dc' in o || 'ac' in o) {
    const dc = o.dc === undefined ? 0 : parseNum(o.dc, `${ref}.dc`);
    let ac: { mag: number; phase: number } | undefined;
    if (o.ac !== undefined) {
      const a = (o.ac ?? {}) as Record<string, unknown>;
      ac = { mag: parseNum(a.mag, `${ref}.ac.mag`), phase: a.phase === undefined ? 0 : parseNum(a.phase, `${ref}.ac.phase`) };
    }
    return { kind: 'dcac', dc, ac };
  }
  if ('re' in o || 'im' in o) throw new AnalysisError(`${ref}: a complex {re, im} value is only allowed for Z elements`);
  throw new AnalysisError(`${ref}: unrecognised source value ${JSON.stringify(v)} (use a number, {dc, ac}, {step}, {sin}, {harmonics}, {wave}, {exp} or {impulse})`);
}

export class Circuit {
  readonly nodeNames: string[] = ['0'];
  private readonly index = new Map<string, number>([['0', 0]]);
  private readonly aliases: Map<string, string>;
  readonly els: CEl[] = [];
  readonly byRef = new Map<string, CEl>();
  readonly mutual: Mutual[] = [];

  constructor(netlist: Netlist) {
    if (!netlist || !(netlist.nodeOf instanceof Map) || !Array.isArray(netlist.elements))
      throw new AnalysisError('Invalid netlist (expected nodeOf: Map, nodes: string[], elements: [])');
    this.aliases = netlist.aliases instanceof Map ? netlist.aliases : new Map();
    for (const nm of netlist.nodes ?? []) this.addNode(nm);
    for (const nm of netlist.nodeOf.values()) this.addNode(nm);

    const pin = (ref: string, p: string): number => {
      const nm = netlist.nodeOf.get(`${ref}.${p}`);
      if (nm === undefined) throw new AnalysisError(`Terminal "${p}" of ${ref} is not in the netlist (missing "${ref}.${p}")`);
      return this.addNode(nm);
    };

    const couplings: Record<string, unknown>[] = [];
    for (const raw of netlist.elements) {
      const e = raw as unknown as Record<string, unknown>;
      const ref = e.ref;
      if (typeof ref !== 'string' || ref === '') throw new AnalysisError('An element has no "ref"');
      if (this.byRef.has(ref) || couplings.some((k) => k.ref === ref)) throw new AnalysisError(`Duplicate element ref "${ref}"`);
      const type = e.type as string;
      if (type === 'K') {
        couplings.push(e);
        continue;
      }
      let el: CEl;
      if (type === 'OPAMP') {
        el = { ref, type, pins: [pin(ref, 'minus'), pin(ref, 'plus'), pin(ref, 'out')], value: NaN };
      } else if (type === 'XFMR') {
        const n = parseNum(e.n, `${ref} (turns ratio n)`);
        if (!(n !== 0)) throw new AnalysisError(`${ref}: turns ratio n must be non-zero`);
        el = { ref, type, pins: [pin(ref, 'p1'), pin(ref, 'n1'), pin(ref, 'p2'), pin(ref, 'n2')], value: n };
      } else if (type === 'TL') {
        // uniform transmission line (two-port, see tline.ts)
        el = { ref, type, pins: [pin(ref, 'p1'), pin(ref, 'n1'), pin(ref, 'p2'), pin(ref, 'n2')], value: NaN, line: parseLine(ref, e.line) };
      } else {
        const pins = [pin(ref, 'p'), pin(ref, 'n')];
        const v = e.value;
        el = { ref, type: type as TwoTerminalType, pins, value: NaN };
        switch (type) {
          case 'R':
            el.value = parseNum(v, `${ref} (resistance)`);
            break;
          case 'C':
          case 'L':
            el.value = parseNum(v, `${ref} (${type === 'C' ? 'capacitance' : 'inductance'})`);
            if (!(el.value > 0)) throw new AnalysisError(`${ref}: ${type === 'C' ? 'capacitance' : 'inductance'} must be > 0`);
            if (e.ic !== undefined) el.ic = parseNum(e.ic, `${ref}.ic`);
            break;
          case 'Z':
            if (v && typeof v === 'object' && ('re' in v || 'im' in v)) {
              const o = v as Record<string, unknown>;
              el.z = cx(o.re === undefined ? 0 : parseNum(o.re, `${ref}.re`), o.im === undefined ? 0 : parseNum(o.im, `${ref}.im`));
            } else el.z = cx(parseNum(v, `${ref} (impedance)`));
            break;
          case 'V':
          case 'I':
            if (isPeriodicValue(v)) {
              const sp = parsePeriodic(ref, v as Record<string, unknown>);
              el.src = { kind: 'dcac', dc: sp.dc };
              el.harmonics = sp.terms;
            } else el.src = parseSource(ref, v);
            break;
          case 'VCVS':
          case 'VCCS':
          case 'CCVS':
          case 'CCCS':
            el.value = parseNum(v, `${ref} (gain)`);
            if (!e.ctrl || typeof e.ctrl !== 'object') throw new AnalysisError(`${ref}: dependent source needs "ctrl"`);
            el.ctrl = e.ctrl as CtrlRef;
            break;
          case 'SW': {
            const st = (e.state ?? {}) as Record<string, unknown>;
            const chk = (x: unknown, d: 'open' | 'closed'): 'open' | 'closed' => {
              if (x === undefined) return d;
              if (x === 'open' || x === 'closed') return x;
              throw new AnalysisError(`${ref}: switch state must be "open" or "closed" (got ${JSON.stringify(x)})`);
            };
            el.sw = { before: chk(st.before, 'open'), after: chk(st.after, 'closed') };
            break;
          }
          case 'ammeter':
          case 'voltmeter':
            break;
          case 'NR':
            el.nl = parseLaw(ref, e.law);
            break;
          default:
            throw new AnalysisError(`${ref}: unknown element type "${type}"`);
        }
      }
      this.els.push(el);
      this.byRef.set(ref, el);
    }

    for (const k of couplings) {
      const ref = k.ref as string;
      const l1 = this.byRef.get(k.l1 as string);
      const l2 = this.byRef.get(k.l2 as string);
      if (!l1 || l1.type !== 'L' || !l2 || l2.type !== 'L')
        throw new AnalysisError(`${ref}: l1 and l2 must name two inductors (got ${JSON.stringify(k.l1)}, ${JSON.stringify(k.l2)})`);
      if (l1 === l2) throw new AnalysisError(`${ref}: an inductor cannot be coupled to itself`);
      if (this.mutual.some((m) => (m.l1 === l1.ref && m.l2 === l2.ref) || (m.l1 === l2.ref && m.l2 === l1.ref)))
        throw new AnalysisError(`${ref}: ${l1.ref} and ${l2.ref} are coupled twice`);
      const lim = Math.sqrt(l1.value * l2.value);
      let M: number;
      if (k.M !== undefined) {
        M = parseNum(k.M, `${ref}.M`);
        if (Math.abs(M) > lim * (1 + 1e-9)) throw new AnalysisError(`${ref}: M = ${M} H exceeds √(L1·L2) = ${lim} H (k > 1)`);
      } else if (k.k !== undefined) {
        const kk = parseNum(k.k, `${ref}.k`);
        if (!(kk >= 0 && kk <= 1)) throw new AnalysisError(`${ref}: coupling coefficient k must be in [0, 1]`);
        M = kk * lim;
      } else throw new AnalysisError(`${ref}: give either k or M`);
      this.mutual.push({ ref, l1: l1.ref, l2: l2.ref, M });
    }

    // validate controls
    for (const el of this.els) {
      if (!el.ctrl) continue;
      const c = el.ctrl as Record<string, unknown>;
      const voltageCtl = el.type === 'VCVS' || el.type === 'VCCS';
      if (voltageCtl) {
        if (typeof c.v === 'string') this.twoTerminal(c.v, `${el.ref}.ctrl.v`);
        else if (Array.isArray(c.vnodes) && c.vnodes.length === 2) {
          this.node(String(c.vnodes[0]));
          this.node(String(c.vnodes[1]));
        } else throw new AnalysisError(`${el.ref}: a voltage-controlled source needs ctrl {"v": "<element>"} or {"vnodes": ["a", "b"]}`);
      } else {
        if (typeof c.i !== 'string') throw new AnalysisError(`${el.ref}: a current-controlled source needs ctrl {"i": "<element>"}`);
        const ce = this.byRef.get(c.i);
        if (!ce) throw new AnalysisError(`${el.ref}.ctrl.i: unknown element "${c.i}"`);
        if (ce.type === 'XFMR' || ce.type === 'TL')
          throw new AnalysisError(`${el.ref}.ctrl.i: cannot be controlled by the current of ${ce.type === 'TL' ? 'transmission line' : 'transformer'} ${c.i}`);
      }
    }
  }

  private addNode(name: string): number {
    if (GROUND.has(name)) return 0;
    let i = this.index.get(name);
    if (i === undefined) {
      i = this.nodeNames.length;
      this.nodeNames.push(name);
      this.index.set(name, i);
    }
    return i;
  }

  /** Look up a node by the name used in a question (aliases first, then "gnd" → ground). */
  node(name: string): number {
    if (typeof name !== 'string') throw new AnalysisError(`Node name must be a string (got ${JSON.stringify(name)})`);
    let nm = name;
    const seen = new Set<string>();
    while (this.aliases.has(nm) && !seen.has(nm)) {
      seen.add(nm);
      nm = this.aliases.get(nm)!;
    }
    if (GROUND.has(nm)) return 0;
    const i = this.index.get(nm);
    if (i === undefined) {
      const known = this.nodeNames.filter((n) => !/^_\d+$/.test(n));
      throw new AnalysisError(`Unknown node "${name}" (named nodes: ${known.join(', ')})`);
    }
    return i;
  }

  element(ref: string): CEl {
    const el = this.byRef.get(ref);
    if (!el) throw new AnalysisError(`Unknown element "${ref}"`);
    return el;
  }

  twoTerminal(ref: string, what = ref): CEl {
    const el = this.byRef.get(ref);
    if (!el) throw new AnalysisError(`${what}: unknown element "${ref}"`);
    if (!isTwoTerminal(el)) throw new AnalysisError(`${what}: ${ref} is a ${el.type}, which has no single voltage/current (use node voltages instead)`);
    return el;
  }
}
