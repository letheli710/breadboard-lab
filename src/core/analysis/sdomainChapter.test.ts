// Independent second route for every built-in problem of the s-domain chapter (problems/s-domain).
// The validator already checks each answer against the engine (transient = matrix exponential,
// H/pole/zero/hcoef from the MNA determinant, residues by contour integrals). Here the same
// quantities are recomputed another way:
//   (a) every time-domain answer v / i at t > 0: the s-domain circuit (sources' transforms +
//       initial-condition sources) inverted numerically (fixed Talbot);
//   (b) the complete partial-fraction expansion of each response (all poles, all orders)
//       summed back into y(t) and compared with the transient solver at three instants;
//   (c) the rational H(s) (coefficients) evaluated at random complex s vs the MNA solved at s;
//   (d) 0+ / ∞ answers vs the initial- and final-value theorems where they apply.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { extractNetlist } from '../problem/geometry';
import type { Complex, Find, ProblemFile } from '../problem/types';
import { add, cx, div, mul, scale } from './complex';
import { computeQuantity } from './index';
import { Laplace, type OutSpec, inverseLaplace, networkFunction, transferAt } from './sdomain';

const DIR = fileURLToPath(new URL('../../../problems/s-domain/', import.meta.url));
const files = readdirSync(DIR).filter((f) => f.endsWith('.json') && !f.startsWith('_'));

const horner = (p: number[], s: Complex) => p.reduceRight((acc: Complex, c) => add(mul(acc, s), cx(c)), cx(0));
const near = (a: number, b: number, rel = 2e-6, abs = 1e-7) => Math.abs(a - b) <= Math.max(rel * Math.abs(b), abs);

function outOf(f: Find): OutSpec | null {
  const g = f as Record<string, unknown>;
  if (g.kind === 'v' && typeof g.el === 'string') return { v: g.el };
  if (g.kind === 'v' && Array.isArray(g.nodes)) return g.nodes as [string, string?];
  if (g.kind === 'i' && typeof g.el === 'string') return { i: g.el };
  if (g.kind === 'residue') return g.out as OutSpec;
  return null;
}

describe('s-domain chapter: every answer by a second route', () => {
  it('has 14–18 problems', () => {
    expect(files.length).toBeGreaterThanOrEqual(14);
    expect(files.length).toBeLessThanOrEqual(18);
  });

  for (const file of files)
    it(file, () => {
      const p = JSON.parse(readFileSync(join(DIR, file), 'utf8')) as ProblemFile;
      const { netlist } = extractNetlist(p.schematic);
      const tran = p.analysis.type === 'tran';
      const lp = tran ? new Laplace(netlist) : null;
      const outs = new Map<string, OutSpec>();
      let checked = 0;
      for (const q of p.questions) {
        const f = q.find;
        if (!f) continue;
        const g = f as Record<string, unknown>;
        const o = outOf(f);
        if (o && tran) outs.set(JSON.stringify(o), o);
        // (a) time values at t > 0
        if (lp && o && (g.kind === 'v' || g.kind === 'i') && typeof g.t === 'number' && g.t > 0 && g.deriv === undefined) {
          const y = inverseLaplace((s) => lp.at(o, s), g.t);
          expect(near(y, q.answer!, 1e-5, 1e-6), `${q.id}: inverse Laplace ${y} vs answer ${q.answer}`).toBe(true);
          checked++;
        }
        // (d) initial- and final-value theorems
        if (lp && o && (g.kind === 'v' || g.kind === 'i') && (g.t === '0+' || g.t === 'inf')) {
          const sY = (x: number) => x * lp.at(o, cx(x)).re;
          const [a, b] = g.t === '0+' ? [sY(1e7), sY(2e7)] : [sY(1e-7), sY(2e-7)];
          if (near(a, b, 1e-4, 1e-5)) {
            expect(near(a, q.answer!, 1e-4, 1e-5), `${q.id}: ${g.t === '0+' ? 'initial' : 'final'}-value theorem ${a} vs ${q.answer}`).toBe(true);
            checked++;
          }
        }
        // (c) rational H(s) vs the MNA at random complex s
        if (g.input !== undefined) {
          const h = networkFunction(netlist, g.input as string, g.out as OutSpec);
          for (const s of [cx(0.37, 1.9), cx(-2.3, 0.6), cx(5.1, -3.3)]) {
            const direct = transferAt(netlist, g.input as string, g.out as OutSpec, s);
            const rat = div(horner(h.num, s), horner(h.den, s));
            const err = Math.hypot(rat.re - direct.re, rat.im - direct.im);
            expect(err, `${q.id}: H(s) rational vs MNA at s = ${s.re}${s.im >= 0 ? '+' : ''}${s.im}j`).toBeLessThanOrEqual(1e-7 * Math.max(1, Math.hypot(direct.re, direct.im)));
          }
          for (const z of h.zeros) expect(Math.hypot(horner(h.num, z).re, horner(h.num, z).im)).toBeLessThan(1e-6 * Math.max(1, ...h.num.map(Math.abs)));
          checked++;
        }
      }
      // (b) partial fractions summed back into y(t) vs the transient solver
      if (lp)
        for (const o of outs.values()) {
          const cand = lp.candidatePoles();
          const sc = Math.max(1, ...cand.map((c) => Math.hypot(c.re, c.im)));
          const groups: { p: Complex; m: number }[] = [];
          for (const c of cand) {
            const g = groups.find((x) => Math.hypot(x.p.re - c.re, x.p.im - c.im) <= 1e-4 * sc);
            if (g) g.m++;
            else groups.push({ p: c, m: 1 });
          }
          const terms = groups.flatMap(({ p, m }) => Array.from({ length: m }, (_, k) => ({ p, k: k + 1, K: lp.residue(o, p, k + 1) })));
          for (const t of [0.3, 0.9, 2]) {
            let y = cx(0);
            for (const { p, k, K } of terms) {
              let f = 1; // (k − 1)!
              for (let j = 2; j < k; j++) f *= j;
              const e = cx(Math.exp(p.re * t) * Math.cos(p.im * t), Math.exp(p.re * t) * Math.sin(p.im * t));
              y = add(y, scale(mul(K, e), t ** (k - 1) / f));
            }
            const kind = 'i' in o ? 'i' : 'v';
            const find = (Array.isArray(o) ? { kind: 'v', nodes: o, t } : 'i' in o ? { kind, el: o.i, t } : { kind, el: (o as { v: string }).v, t }) as Find;
            const ref = computeQuantity(netlist, p.analysis, find);
            expect(Math.abs(y.im)).toBeLessThan(1e-6 * Math.max(1, Math.abs(ref)));
            expect(near(y.re, ref, 1e-6, 1e-7), `${file} ${JSON.stringify(o)} at t = ${t}: Σ residues ${y.re} vs transient ${ref}`).toBe(true);
            checked++;
          }
        }
      expect(checked, 'something was cross-checked').toBeGreaterThan(0);
    });
});
