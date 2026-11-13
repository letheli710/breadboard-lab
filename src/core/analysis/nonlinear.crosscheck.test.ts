/* eslint-disable @typescript-eslint/no-explicit-any -- test reads raw JSON */
// Cross-check of every nonlinear-chapter answer by a second method, independent of the
// operating-point solver: (1) each NR element's (U_Q, I_Q) is substituted into its law, evaluated
// here from the JSON (not with the engine's piece code); (2) KCL/KVL: by the substitution theorem,
// replacing each NR by a source of its operating value and solving the purely LINEAR circuit must
// give back the other operating value; (3) small-signal answers equal the difference quotient of
// two full nonlinear DC solutions with the small-signal source at ±h (times its amplitude).
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { computeQuantity, solveDC } from './index';
import { parseProblem } from '../problem/parse';
import type { Netlist, ProblemElement } from '../problem/types';

type Law = Record<string, any>;
/** own evaluation of an element law: residual of (u, i) */
function lawResidual(law: Law, u: number, i: number): number {
  const poly = (c: number[], x: number) => c.reduce((s, v, k) => s + v * x ** k, 0);
  if (law.i) {
    const x = law.umin !== undefined && u < law.umin ? law.umin : u;
    return i - poly(law.i, x);
  }
  if (law.u) {
    const x = law.imin !== undefined && i < law.imin ? law.imin : i;
    return u - poly(law.u, x);
  }
  let pts: number[][] = law.pwl;
  if (law.diode) {
    const uon = law.diode.uon ?? 0,
      ron = law.diode.ron ?? 0;
    pts = [
      [uon - 1, 0],
      [uon, 0],
      [uon + ron, 1],
    ];
  }
  // distance from the polyline (with extended ends), in a scaled metric
  let best = Infinity;
  for (let k = 0; k + 1 < pts.length; k++) {
    const [u0, i0] = pts[k],
      [u1, i1] = pts[k + 1];
    const du = u1 - u0,
      di = i1 - i0;
    const su = Math.max(1e-12, Math.abs(du)),
      si = Math.max(1e-12, Math.abs(di));
    // parameter along the segment (scaled coordinates)
    let t = ((((u - u0) / su) * du) / su + (((i - i0) / si) * di) / si) / ((du / su) ** 2 + (di / si) ** 2);
    if (k > 0) t = Math.max(t, 0);
    if (k < pts.length - 2) t = Math.min(t, 1);
    const eu = (u0 + t * du - u) / su,
      ei = (i0 + t * di - i) / si;
    best = Math.min(best, Math.hypot(eu, ei) * Math.max(su, si));
  }
  return best;
}

function substituted(n: Netlist, kinds: Record<string, 'V' | 'I'>, Q: Record<string, { u: number; i: number }>): Netlist {
  const elements = n.elements.map((e) => {
    const el = e as ProblemElement & { law?: unknown };
    if (el.type !== 'NR') return el;
    const k = kinds[el.ref];
    const { law: _l, ...rest } = el as unknown as Record<string, unknown>;
    // V: p is "+", value u ; I: passive current +value flows p → n through it
    return { ...rest, type: k, value: k === 'V' ? Q[el.ref].u : Q[el.ref].i } as unknown as ProblemElement;
  });
  return { ...n, elements };
}

const files = readdirSync('problems/nonlinear').map((f) => `problems/nonlinear/${f}`);
const check = (json: any, name: string) => {
  let worst = 0;
  const report: string[] = [];
  const r = parseProblem(json, 'folder', name);
  if (!r.ok) throw new Error(name + r.errors.join(';'));
  const p = r.problem!;
  const n = p.netlist;
  const nrs = n.elements.filter((e) => e.type === 'NR') as any[];
  const an = p.analysis;
  const dcAn = { type: 'dc' } as const;
  const nop = computeQuantity(n, dcAn, { kind: 'nop' } as any);
  for (let op = 1; op <= nop; op++) {
    const Q: Record<string, { u: number; i: number }> = {};
    for (const e of nrs) {
      const f = (k: 'v' | 'i') => computeQuantity(n, dcAn, { kind: k, el: e.ref, ...(nop > 1 ? { op } : {}) } as any);
      Q[e.ref] = { u: f('v'), i: f('i') };
    }
    // 1. element laws, evaluated independently
    let lawErr = 0;
    for (const e of nrs) lawErr = Math.max(lawErr, Math.abs(lawResidual(e.law, Q[e.ref].u, Q[e.ref].i)));
    // 2. KCL/KVL: substitution theorem with the purely linear engine
    let kvl = Infinity;
    const combos = 1 << nrs.length;
    for (let m = 0; m < combos; m++) {
      const kinds: Record<string, 'V' | 'I'> = {};
      nrs.forEach((e, k) => (kinds[e.ref] = m & (1 << k) ? 'V' : 'I'));
      try {
        const s = solveDC(substituted(n, kinds, Q));
        let err = 0;
        for (const e of nrs) err = Math.max(err, kinds[e.ref] === 'I' ? Math.abs(s.vEl(e.ref).re - Q[e.ref].u) : Math.abs(s.i(e.ref).re - Q[e.ref].i));
        kvl = Math.min(kvl, err);
        break;
      } catch {
        /* singular substitution, try another mix */
      }
    }
    worst = Math.max(worst, lawErr, kvl);
    expect(lawErr, `${name} op${op} law`).toBeLessThan(1e-9);
    expect(kvl, `${name} op${op} KCL/KVL`).toBeLessThan(1e-9);
    report.push(
      `${name} op${op}: ${nrs.map((e) => `${e.ref}(u=${Q[e.ref].u.toPrecision(10)}, i=${Q[e.ref].i.toPrecision(10)})`).join(' ')}  law ${lawErr.toExponential(1)}  KCL/KVL ${kvl.toExponential(1)}`,
    );
  }
  // 3. small signal: AC answers vs. difference of two full nonlinear DC solutions
  if (an.type === 'ac') {
    const src = n.elements.find((e: any) => e.value && typeof e.value === 'object' && 'ac' in e.value) as any;
    const mag = src.value.ac.mag;
    const h = 1e-5;
    for (const q of p.questions) {
      const f = q.find as any;
      if (!f || f.dc || !['v', 'i'].includes(f.kind)) continue;
      const at = (d: number) => {
        const els = n.elements.map((e: any) => (e === src ? { ...e, value: { dc: d } } : e));
        return computeQuantity({ ...n, elements: els }, dcAn, { ...f, part: undefined } as any);
      };
      const fd = ((at(h) - at(-h)) / (2 * h)) * mag;
      const lin = computeQuantity(n, an, f);
      const rel = Math.abs(Math.abs(fd) - lin) / lin;
      worst = Math.max(worst, rel * 1e-3);
      expect(rel, `${name} ${q.id}`).toBeLessThan(1e-6);
      report.push(`${name} small-signal ${q.id}: linearised ${lin.toPrecision(8)}  finite-difference ${Math.abs(fd).toPrecision(8)}  rel diff ${rel.toExponential(1)}`);
    }
  }
  return { worst, report };
};
describe('nonlinear chapter: every operating point and small-signal answer by a second method', () => {
  for (const f of files)
    it(f, () => {
      check(JSON.parse(readFileSync(f, 'utf8')), f.split('/').pop()!);
    });
  const sum = JSON.parse(readFileSync('summaries/nonlinear.json', 'utf8'));
  for (const ex of sum.examples)
    it(`summaries/nonlinear.json example ${ex.id}`, () => {
      check(
        {
          format: 'circuit-problem/1',
          id: 'x-' + ex.id,
          chapter: 'nonlinear',
          title: 't',
          level: 1,
          statement: 's',
          schematic: ex.schematic,
          analysis: ex.analysis,
          questions: ex.results,
          hints: ['h'],
          solution: 's',
          i18n: { en: {} },
        },
        'summary:' + ex.id,
      );
    });
});
