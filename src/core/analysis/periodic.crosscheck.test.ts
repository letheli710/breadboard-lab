// Independent check of the non-sinusoidal chapter: every whole-waveform answer (rms, average,
// absolute average, average power, meter / wattmeter readings) in problems/non-sinusoidal is
// recomputed in the TIME DOMAIN with the exact transient solver — each harmonic becomes its own
// {sin} source (series chain for voltage sources, parallel for current sources), one period of
// the steady state is sampled and integrated numerically. Damped circuits start with every C and L
// empty (ic = 0) and are sampled after the natural response has died out, so the steady state is
// reached by time integration, not by the phasor solver; circuits with a lossless LC loop (which
// would ring forever) start from the transient solver's own t < 0 sinusoidal steady state.
// Sources with more than 25 harmonics (the 99-term square / triangle waves of problems 01, 05 and
// the 49-term rectified wave of 03, each driving a single R or L) are skipped: as separate {sin}
// sources they take a minute to simulate, and their closed forms are checked in periodic.test.ts.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extractNetlist } from '../problem/geometry';
import type { Analysis, Find, Netlist, ProblemElement, ProblemFile, Question } from '../problem/types';
import { computeQuantity, naturalFrequencies, PeriodicCircuit } from './index';
import { abs } from './complex';

const DIR = new URL('../../../problems/non-sinusoidal/', import.meta.url);
const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .sort();
const TRAN: Analysis = { type: 'tran' };

interface TimeCircuit {
  net: Netlist;
  /** refs of the pieces that replace each periodic source */
  pieces: Map<string, string[]>;
  t0: number;
  T: number;
  kmax: number;
}

function toTransient(net: Netlist, an: Analysis & { type: 'periodic' }): TimeCircuit {
  const pc = new PeriodicCircuit(net, an);
  const f1 = pc.omega / (2 * Math.PI);
  const nodeOf = new Map(net.nodeOf);
  const nodes = [...net.nodes];
  const elements: ProblemElement[] = [];
  const pieces = new Map<string, string[]>();
  let kmax = 1;
  for (const e of net.elements) {
    const sp = e.type === 'V' || e.type === 'I' ? pc.spectra.get(e.ref) : undefined;
    if (!sp) {
      elements.push(e);
      continue;
    }
    const vals: unknown[] = [];
    if (sp.dc !== 0) vals.push(sp.dc);
    for (const [k, X] of sp.h) {
      if (!(abs(X) > 0)) continue;
      kmax = Math.max(kmax, k);
      vals.push({ sin: { amp: abs(X), freq: k * f1, phase: (Math.atan2(X.im, X.re) * 180) / Math.PI + 90 } });
    }
    const p = net.nodeOf.get(`${e.ref}.p`)!;
    const n = net.nodeOf.get(`${e.ref}.n`)!;
    const refs = vals.map((_, i) => (i === 0 ? e.ref : `${e.ref}__h${i}`));
    pieces.set(e.ref, refs);
    refs.forEach((ref, i) => {
      // voltage sources in series p → x1 → … → n; current sources in parallel
      const a = e.type === 'I' || i === 0 ? p : `${e.ref}__x${i}`;
      const b = e.type === 'I' || i === refs.length - 1 ? n : `${e.ref}__x${i + 1}`;
      for (const x of [a, b]) if (!nodes.includes(x)) nodes.push(x);
      nodeOf.set(`${ref}.p`, a);
      nodeOf.set(`${ref}.n`, b);
      elements.push({ ...(e as object), ref, value: vals[i] } as ProblemElement);
    });
  }
  const T = 1 / f1;
  // damped → start empty and wait; lossless loop → start in the solver's own steady state
  const base: Netlist = { ...net, nodeOf, nodes, elements };
  const decay = Math.min(
    ...naturalFrequencies(base)
      .filter((s) => abs(s) > 1e-9)
      .map((s) => -s.re),
  );
  if (decay > 1e-6 * pc.omega) {
    const withIc = elements.map((e) => (e.type === 'C' || e.type === 'L' ? ({ ...e, ic: 0 } as ProblemElement) : e));
    const t0 = Math.ceil(40 / decay / T) * T; // whole number of periods, natural response < e^−40
    return { net: { ...base, elements: withIc }, pieces, t0, T, kmax };
  }
  return { net: base, pieces, t0: 0, T, kmax };
}

/** samples of v(t) and i(t) of a two-terminal element (or of node voltages) over one period */
function sampler(tc: TimeCircuit, net: Netlist) {
  const n = Math.max(400, 24 * tc.kmax);
  const ts = Array.from({ length: n }, (_, s) => tc.t0 + ((s + 0.5) * tc.T) / n);
  const at = (find: Find) => ts.map((t) => computeQuantity(tc.net, TRAN, { ...find, t } as Find));
  const pins = (ref: string) => [net.nodeOf.get(`${ref}.p`)!, net.nodeOf.get(`${ref}.n`)!];
  const iOf = (ref: string): number[] => {
    const ps = tc.pieces.get(ref);
    const el = net.elements.find((e) => e.ref === ref)!;
    if (!ps) return at({ kind: 'i', el: ref });
    if (el.type === 'V') return at({ kind: 'i', el: ps[0] });
    const parts = ps.map((r) => at({ kind: 'i', el: r }));
    return parts[0].map((_, s) => parts.reduce((a, x) => a + x[s], 0));
  };
  const vOf = (ref: string): number[] => {
    const [p, m] = pins(ref);
    return at({ kind: 'v', nodes: [p, m] });
  };
  return { at, iOf, vOf, mean: (xs: number[]) => xs.reduce((a, x) => a + x, 0) / xs.length };
}

function timeDomain(q: Question, tc: TimeCircuit, net: Netlist): number | null {
  const f = q.find!;
  if (f.harmonic !== undefined || f.t !== undefined) return null;
  const S = sampler(tc, net);
  const reduceSig = (xs: number[]) => {
    switch (f.part ?? 'rms') {
      case 'rms':
        return Math.sqrt(S.mean(xs.map((x) => x * x)));
      case 'avg':
        return S.mean(xs);
      case 'absavg':
        return S.mean(xs.map(Math.abs));
      default:
        return null;
    }
  };
  switch (f.kind) {
    case 'v':
      return reduceSig('nodes' in f && f.nodes ? S.at({ kind: 'v', nodes: [f.nodes[0], f.nodes[1] ?? '0'] }) : S.vOf((f as { el: string }).el));
    case 'i':
      return reduceSig(S.iOf(f.el));
    case 'meter': {
      const el = net.elements.find((e) => e.ref === f.el)!;
      return reduceSig(el.type === 'ammeter' ? S.iOf(f.el) : S.vOf(f.el));
    }
    case 'p': {
      const v = S.vOf(f.el);
      const i = S.iOf(f.el);
      return S.mean(v.map((x, s) => x * i[s]));
    }
    case 'wattmeter': {
      const u = S.at({ kind: 'v', nodes: f.nodes });
      const i = S.iOf(f.current);
      return S.mean(u.map((x, s) => x * i[s]));
    }
    default:
      return null;
  }
}

describe('problems/non-sinusoidal: whole-waveform answers re-derived in the time domain', () => {
  let checked = 0;
  for (const file of files) {
    const p = JSON.parse(readFileSync(new URL(file, DIR), 'utf8')) as ProblemFile;
    const qs = p.questions.filter((q) => q.find && q.answer !== undefined && q.find.harmonic === undefined && ['v', 'i', 'meter', 'p', 'wattmeter'].includes(q.find.kind));
    if (!qs.length) continue;
    const { netlist } = extractNetlist(p.schematic);
    const an = p.analysis as Analysis & { type: 'periodic' };
    const harmonics = Math.max(...[...new PeriodicCircuit(netlist, an).spectra.values()].map((sp) => sp.h.size));
    if (harmonics > 25) continue;
    it(`${file}: ${qs.map((q) => q.id).join(', ')}`, () => {
      const tc = toTransient(netlist, an);
      for (const q of qs) {
        const td = timeDomain(q, tc, netlist);
        if (td === null) continue;
        const tol = Math.max(2e-3 * Math.abs(q.answer!), 1e-6);
        expect(Math.abs(td - q.answer!), `${q.id}: time domain ${td}, file ${q.answer}`).toBeLessThanOrEqual(tol);
        checked++;
      }
    });
  }
  it('cross-checked at least 25 answers in 12 problems', () => expect(checked).toBeGreaterThanOrEqual(25));
});
