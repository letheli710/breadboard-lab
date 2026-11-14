// Second route for the built-in problems of the transmission-line chapter (problems/transmission-line).
// The validator checks every answer against the exact line model (chain parameters at ω, bounce
// diagram in transient problems). Here every transmission line TL is replaced by a cascade of
// lumped RLGC π-sections and the circuit is solved again with the ordinary engine (MNA phasors /
// matrix-exponential transient): voltages, currents, impedances, reflection coefficients, powers and
// extrema at the line ends and section nodes, and the other elements' quantities, must agree.
// Line constants (Z_c, γ, λ, v …) are not circuit quantities; they are recomputed in tline.test.ts.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { extractNetlist } from '../problem/geometry';
import type { Analysis, Complex, Find, Netlist, ProblemElement, ProblemFile } from '../problem/types';
import { abs, add, conj, div, mul, scale, sub } from './complex';
import { computeQuantity } from './engine';
import { Circuit } from './circuit';
import { solveAC, type CircuitSolution } from './index';
import { Transient } from './transient';
import { lineAt, parseLine } from './tline';

const DIR = fileURLToPath(new URL('../../../problems/transmission-line/', import.meta.url));
const files = readdirSync(DIR).filter((f) => f.endsWith('.json') && !f.startsWith('_'));

/** Replace every TL by n π-sections; ammeters A_<ref>_in / A_<ref>_out carry the end currents (in +x),
 *  nodes <ref>~k (k = 0..n) are the line's top conductor at x = k·l/n, bottom = the start's n1 node. */
function ladderize(nl: Netlist, n: number): { net: Netlist; nodeAt: (ref: string, k: number) => string; bottom: (ref: string) => string } {
  const nodeOf = new Map(nl.nodeOf);
  const nodes = new Set(nl.nodes);
  const elements: ProblemElement[] = [];
  const add2 = (ref: string, type: string, p: string, q: string, value?: number) => {
    nodeOf.set(`${ref}.p`, p);
    nodeOf.set(`${ref}.n`, q);
    nodes.add(p);
    nodes.add(q);
    elements.push({ ref, type, from: [0, 0], to: [0, 2], ...(value !== undefined ? { value } : {}) } as ProblemElement);
  };
  const bottoms = new Map<string, string>();
  for (const el of nl.elements) {
    if (el.type !== 'TL') {
      elements.push(el);
      continue;
    }
    const s = parseLine(el.ref, el.line);
    const d = s.length / n;
    const pin = (p: string) => nodeOf.get(`${el.ref}.${p}`)!;
    const [p1, n1, p2, n2] = ['p1', 'n1', 'p2', 'n2'].map(pin);
    for (const p of ['p1', 'n1', 'p2', 'n2']) nodeOf.delete(`${el.ref}.${p}`);
    const top = (k: number) => `${el.ref}~${k}`;
    bottoms.set(el.ref, n1);
    add2(`A_${el.ref}_in`, 'ammeter', p1, top(0));
    add2(`A_${el.ref}_out`, 'ammeter', top(n), p2);
    if (n2 !== n1) add2(`W_${el.ref}`, 'R', n2, n1, 0); // ideal return conductor
    for (let k = 0; k < n; k++) {
      add2(`R_${el.ref}_${k}`, 'R', top(k), `${el.ref}~r${k}`, s.R0 * d);
      add2(`L_${el.ref}_${k}`, 'L', `${el.ref}~r${k}`, top(k + 1), s.L0 * d);
    }
    for (let k = 0; k <= n; k++) {
      const share = k === 0 || k === n ? 0.5 : 1;
      add2(`C_${el.ref}_${k}`, 'C', top(k), n1, s.C0 * d * share);
      if (s.G0 > 0) add2(`G_${el.ref}_${k}`, 'R', top(k), n1, 1 / (s.G0 * d * share));
    }
  }
  return { net: { nodeOf, nodes: [...nodes], elements, aliases: nl.aliases }, nodeAt: (r, k) => `${r}~${k}`, bottom: (r) => bottoms.get(r)! };
}

const near = (a: number, b: number, rel: number, absTol: number) => Math.abs(a - b) <= Math.max(rel * Math.abs(b), absTol);

describe('transmission-line chapter: every circuit answer again with lumped π-section ladders', () => {
  it('has 12–15 problems', () => {
    expect(files.length).toBeGreaterThanOrEqual(12);
    expect(files.length).toBeLessThanOrEqual(15);
  });

  let checkedAc = 0;
  let checkedTran = 0;
  for (const file of files)
    it(
      file,
      () => {
        const p = JSON.parse(readFileSync(join(DIR, file), 'utf8')) as ProblemFile;
        const { netlist } = extractNetlist(p.schematic);
        const tran = p.analysis.type === 'tran';
        const N = tran ? 60 : 100;
        const lad = ladderize(netlist, N);
        const trn = tran ? new Transient(new Circuit(lad.net)) : null;
        const sols = new Map<number, CircuitSolution>();
        const lines = new Map(netlist.elements.filter((e) => e.type === 'TL').map((e) => [e.ref, parseLine(e.ref, (e as { line: unknown }).line)]));
        for (const q of p.questions) {
          const f = q.find as (Find & Record<string, unknown>) | undefined;
          if (!f || typeof q.answer !== 'number') continue;
          const a: Analysis = p.analysis;
          if (tran) {
            // the LC ladder rings after every wavefront: average over ±0.1 of the one-way time
            const t = f.t;
            if (typeof t !== 'number') continue;
            const el = f.kind === 'tl' ? String(f.el) : '';
            const s = lines.values().next().value!;
            const T = s.length * Math.sqrt(s.L0 * s.C0);
            let get: ((tt: number) => number) | null = null;
            if (f.kind === 'tl' && f.what === 'u' && (f.x === 0 || f.x === s.length || (f.x! / s.length) * N === Math.round((f.x! / s.length) * N))) {
              const k = Math.round(((f.x as number) / s.length) * N);
              get = (tt) => trn!.at(tt).v(lad.nodeAt(el, k), lad.bottom(el)).re;
            } else if (f.kind === 'tl' && f.what === 'i' && f.x === 0) get = (tt) => trn!.at(tt).i(`A_${el}_in`).re;
            else if (f.kind === 'i') get = (tt) => trn!.at(tt).i(String(f.el)).re;
            if (!get) continue;
            let m = 0;
            for (let k = -4; k <= 4; k++) m += get(t + (k / 60) * T) / 9;
            // tolerance: 3 % of the value, or 2 % of the largest answer of the problem (a zero plateau)
            const scaleOf = Math.max(...p.questions.map((qq) => Math.abs(qq.answer ?? 0)));
            expect(near(m, q.answer, 0.03, 0.02 * scaleOf), `${q.id}: ladder ${m} vs answer ${q.answer}`).toBe(true);
            checkedTran++;
            continue;
          }
          if (a.type !== 'ac') continue;
          const ac: Analysis = f.freq !== undefined ? { type: 'ac', freq: f.freq as number } : a;
          const fq: Find = { ...f, freq: undefined } as Find;
          let value: number | null = null;
          if (f.kind !== 'tl') {
            value = computeQuantity(lad.net, ac, fq);
          } else {
            const ref = String(f.el);
            const s = lines.get(ref)!;
            const w = 2 * Math.PI * ((ac as { freq?: number }).freq ?? 0);
            const zc = lineAt(s, w).zc;
            if (!sols.has(w)) sols.set(w, solveAC(lad.net, w)); // one solve per frequency, read everywhere
            const sol = sols.get(w)!;
            const V = (k: number): Complex => sol.v(lad.nodeAt(ref, k), lad.bottom(ref));
            const I = (end: 'in' | 'out'): Complex => sol.i(`A_${ref}_${end}`);
            // position → section index, only at the ends or on a section boundary
            const kOf = (dflt: 'start' | 'end'): number | null => {
              const x = f.x === undefined ? (dflt === 'start' ? 0 : s.length) : f.from === 'end' ? s.length - (f.x as number) : (f.x as number);
              const k = (x / s.length) * N;
              return Math.abs(k - Math.round(k)) < 1e-9 ? Math.round(k) : null;
            };
            const at = (dflt: 'start' | 'end'): { u: Complex; i: Complex } | null => {
              const k = kOf(dflt);
              if (k === 0) return { u: V(0), i: I('in') };
              if (k === N) return { u: V(N), i: I('out') };
              return null;
            };
            const part = (z: Complex) => {
              const pt = f.part ?? 'mag';
              return pt === 're' ? z.re : pt === 'im' ? z.im : pt === 'phase' ? (Math.atan2(z.im, z.re) * 180) / Math.PI : abs(z);
            };
            const refl = (ui: { u: Complex; i: Complex }) => div(sub(ui.u, mul(zc, ui.i)), add(ui.u, mul(zc, ui.i)));
            switch (f.what) {
              case 'u': {
                const k = kOf('start');
                if (k !== null) value = part(V(k));
                break;
              }
              case 'i':
              case 'z':
              case 'refl':
              case 'vswr':
              case 'p':
              case 'uinc': {
                const ui = at(f.what === 'refl' || f.what === 'vswr' ? 'end' : 'start');
                if (!ui) break;
                if (f.what === 'i') value = part(ui.i);
                if (f.what === 'z') value = part(div(ui.u, ui.i));
                if (f.what === 'refl') value = part(refl(ui));
                if (f.what === 'vswr') value = (1 + abs(refl(ui))) / (1 - abs(refl(ui)));
                if (f.what === 'p') value = mul(ui.u, conj(ui.i)).re;
                if (f.what === 'uinc') value = part(scale(add(ui.u, mul(zc, ui.i)), 0.5));
                break;
              }
              case 'eta':
                value = mul(V(N), conj(I('out'))).re / mul(V(0), conj(I('in'))).re;
                break;
              case 'umax':
              case 'umin': {
                const vs = Array.from({ length: N + 1 }, (_, k) => abs(V(k)));
                value = f.what === 'umax' ? Math.max(...vs) : Math.min(...vs);
                break;
              }
            }
          }
          if (value === null) continue;
          const phase = f.part === 'phase';
          const ok = phase ? Math.abs(((value - q.answer + 540) % 360) - 180) < 0.05 : near(value, q.answer, 3e-3, 1e-6 * Math.max(1, Math.abs(q.answer)));
          expect(ok, `${q.id}: ladder ${value} vs answer ${q.answer}`).toBe(true);
          checkedAc++;
        }
      },
      120000,
    );

  it('checked enough answers this way', () => {
    expect(checkedAc).toBeGreaterThanOrEqual(30);
    expect(checkedTran).toBeGreaterThanOrEqual(8);
  });
});
