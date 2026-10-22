// DC operating-point solver (nodal analysis with piecewise-linear diodes).
// Sources are modelled as an ideal EMF behind an internal resistance (Norton form), so a
// short circuit gives a large-but-finite current instead of a singular matrix.

import { BATTERIES, LED_COLORS, isPower, sourceRint, sourceVoltage, terminalsOf } from './parts';
import type { CComponent, Circuit } from './types';
import { pinId } from './types';

const GMIN = 1e-9;
const R_CLOSED = 0.02;
const R_OFF = 1e9;

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

export interface SimResult {
  ground: string | null;
  nodeV: Map<string, number>;
  /** current through component from its first terminal to its second (A) */
  current: Map<string, number>;
  /** voltage across component (first terminal minus second) */
  vdrop: Map<string, number>;
  leds: Map<string, LedState>;
  sources: Map<string, SourceState>;
  converged: boolean;
}

interface Diode {
  ref: string;
  a: number;
  k: number;
  vf: number;
  rs: number;
  on: boolean;
}

interface Src {
  ref: string;
  p: number;
  n: number;
  v: number;
  rint: number;
  ilim: number; // Infinity if no current limit
  cc: boolean;
}

function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    if (Math.abs(M[piv][c]) < 1e-18) return null;
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      if (f === 0) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

export function simulate(circuit: Circuit): SimResult {
  const netOf = new Map<string, string>();
  for (const net of circuit.nets) for (const p of net.pins) netOf.set(p, net.name);

  const firstSrc = circuit.components.find((c) => isPower(c.type));
  const ground = firstSrc ? (netOf.get(pinId(firstSrc.ref, '-')) ?? null) : (circuit.nets[0]?.name ?? null);

  // terminals not on any net (e.g. unlisted pins in a challenge target) float on their own node
  for (const c of circuit.components)
    for (const t of terminalsOf(c.type)) {
      const id = pinId(c.ref, t);
      if (!netOf.has(id)) netOf.set(id, `__float:${id}`);
    }
  const nodes = [...new Set([...circuit.nets.map((n) => n.name), ...netOf.values()])].filter((n) => n !== ground);
  const idx = new Map<string, number>();
  nodes.forEach((n, i) => idx.set(n, i));
  const node = (ref: string, pin: string) => {
    const name = netOf.get(pinId(ref, pin));
    if (name === undefined || name === ground) return -1;
    return idx.get(name)!;
  };

  const resistors: { ref: string; a: number; b: number; g: number; part?: string }[] = [];
  const diodes: Diode[] = [];
  const srcs: Src[] = [];

  for (const c of circuit.components) {
    const p = c.props;
    switch (c.type) {
      case 'resistor':
        resistors.push({ ref: c.ref, a: node(c.ref, '1'), b: node(c.ref, '2'), g: 1 / Math.max(p.resistance ?? 1000, 1e-3) });
        break;
      case 'potentiometer': {
        const R = p.resistance ?? 10000;
        const w = Math.min(1, Math.max(0, p.wiper ?? 0.5));
        resistors.push({ ref: c.ref, part: 'a', a: node(c.ref, '1'), b: node(c.ref, '2'), g: 1 / Math.max(R * w, 1) });
        resistors.push({ ref: c.ref, part: 'b', a: node(c.ref, '2'), b: node(c.ref, '3'), g: 1 / Math.max(R * (1 - w), 1) });
        break;
      }
      case 'pushbutton':
        resistors.push({ ref: c.ref, a: node(c.ref, '1'), b: node(c.ref, '2'), g: p.pressed ? 1 / R_CLOSED : 1 / R_OFF });
        break;
      case 'switch': {
        const other = p.position === 'b' ? 'b' : 'a';
        resistors.push({ ref: c.ref, a: node(c.ref, 'com'), b: node(c.ref, other), g: 1 / R_CLOSED });
        break;
      }
      case 'led': {
        const col = LED_COLORS[p.color ?? 'red'];
        diodes.push({ ref: c.ref, a: node(c.ref, 'anode'), k: node(c.ref, 'cathode'), vf: col.vf, rs: 12, on: false });
        break;
      }
      case 'diode':
        diodes.push({ ref: c.ref, a: node(c.ref, 'anode'), k: node(c.ref, 'cathode'), vf: 0.65, rs: 0.8, on: false });
        break;
      case 'capacitor':
        break; // open circuit at DC
      case 'battery':
      case 'power_module':
      case 'bench_supply':
      case 'dc_source':
        srcs.push({
          ref: c.ref,
          p: node(c.ref, '+'),
          n: node(c.ref, '-'),
          v: sourceVoltage(c),
          rint: sourceRint(c),
          ilim: c.type === 'bench_supply' ? (p.currentLimit ?? 0.1) : Infinity,
          cc: false,
        });
        break;
    }
  }

  const N = nodes.length;
  let x: number[] = new Array(N).fill(0);
  let converged = false;
  const V = (i: number) => (i < 0 ? 0 : x[i]);

  for (let iter = 0; iter < 80; iter++) {
    const A = Array.from({ length: N }, () => new Array(N).fill(0));
    const b = new Array(N).fill(0);
    const stampG = (i: number, j: number, g: number) => {
      if (i >= 0) A[i][i] += g;
      if (j >= 0) A[j][j] += g;
      if (i >= 0 && j >= 0) {
        A[i][j] -= g;
        A[j][i] -= g;
      }
    };
    // current source of value I flowing *into* node i and out of node j (through the outside world)
    const stampI = (i: number, j: number, I: number) => {
      if (i >= 0) b[i] += I;
      if (j >= 0) b[j] -= I;
    };
    for (let i = 0; i < N; i++) A[i][i] += GMIN;
    for (const r of resistors) stampG(r.a, r.b, r.g);
    for (const d of diodes) {
      if (d.on) {
        const g = 1 / d.rs;
        stampG(d.a, d.k, g);
        stampI(d.a, d.k, g * d.vf);
      } else stampG(d.a, d.k, 1 / R_OFF);
    }
    for (const s of srcs) {
      if (s.cc) {
        stampG(s.p, s.n, 1e-6);
        stampI(s.p, s.n, s.ilim);
      } else {
        const g = 1 / s.rint;
        stampG(s.p, s.n, g);
        stampI(s.p, s.n, g * s.v);
      }
    }
    const sol = N === 0 ? [] : solveLinear(A, b);
    if (!sol) break;
    x = sol;

    let changed = false;
    for (const d of diodes) {
      const vak = V(d.a) - V(d.k);
      if (!d.on && vak > d.vf + 1e-6) {
        d.on = true;
        changed = true;
      } else if (d.on && (vak - d.vf) / d.rs < -1e-9) {
        d.on = false;
        changed = true;
      }
    }
    for (const s of srcs) {
      if (!Number.isFinite(s.ilim)) continue;
      const vt = V(s.p) - V(s.n);
      if (!s.cc) {
        const I = (s.v - vt) / s.rint;
        if (I > s.ilim * 1.0001) {
          s.cc = true;
          changed = true;
        }
      } else if (vt > s.v) {
        s.cc = false;
        changed = true;
      }
    }
    if (!changed) {
      converged = true;
      break;
    }
  }

  const nodeV = new Map<string, number>();
  if (ground) nodeV.set(ground, 0);
  nodes.forEach((n, i) => !n.startsWith('__float:') && nodeV.set(n, x[i] ?? 0));

  const current = new Map<string, number>();
  const vdrop = new Map<string, number>();
  for (const r of resistors) {
    const v = V(r.a) - V(r.b);
    if (!r.part) {
      current.set(r.ref, v * r.g);
      vdrop.set(r.ref, v);
    } else if (r.part === 'a') {
      current.set(r.ref, v * r.g);
    }
  }
  const leds = new Map<string, LedState>();
  for (const d of diodes) {
    const vak = V(d.a) - V(d.k);
    const I = d.on ? (vak - d.vf) / d.rs : vak / R_OFF;
    current.set(d.ref, I);
    vdrop.set(d.ref, vak);
    leds.set(d.ref, {
      on: d.on && I > 0.0005,
      current: I,
      brightness: d.on ? Math.min(1, Math.max(0, I / 0.02)) : 0,
      overcurrent: I > 0.03,
      burnt: I > 0.06,
      reverse: vak < -0.5,
    });
  }
  const sources = new Map<string, SourceState>();
  for (const s of srcs) {
    const vt = V(s.p) - V(s.n);
    const I = s.cc ? s.ilim - vt * 1e-6 : (s.v - vt) / s.rint;
    const comp = circuit.components.find((c) => c.ref === s.ref) as CComponent;
    const limit = comp.type === 'battery' ? BATTERIES[comp.props.variant ?? '9V'].maxCurrent : comp.type === 'power_module' ? 0.5 : 2;
    current.set(s.ref, I);
    vdrop.set(s.ref, vt);
    sources.set(s.ref, {
      current: I,
      terminalVoltage: vt,
      ccMode: s.cc,
      shorted: s.cc ? vt < s.v * 0.2 : I > limit,
    });
  }

  return { ground, nodeV, current, vdrop, leds, sources, converged };
}
