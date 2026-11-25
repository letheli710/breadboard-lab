// W1-L8 numbers: Y–Δ conversions (Sadiku 2.7 naming: Δ sides R_a (b–c), R_b (a–c), R_c (a–b);
// Y arms R_1 (to a), R_2 (to b), R_3 (to c)) and the 5-resistor bridge reduced by turning its
// top Δ (a–c–d) into a Y.

export interface Delta {
  ra: number;
  rb: number;
  rc: number;
}
export interface Wye {
  r1: number;
  r2: number;
  r3: number;
}

/** Δ → Y: product of the two adjacent sides over the sum of the three. */
export function deltaToWye({ ra, rb, rc }: Delta): Wye {
  const s = ra + rb + rc;
  return { r1: (rb * rc) / s, r2: (rc * ra) / s, r3: (ra * rb) / s };
}

/** Y → Δ: sum of the pairwise products over the opposite arm. */
export function wyeToDelta({ r1, r2, r3 }: Wye): Delta {
  const p = r1 * r2 + r2 * r3 + r3 * r1;
  return { ra: p / r1, rb: p / r2, rc: p / r3 };
}

export const par = (x: number, y: number) => (x * y) / (x + y);

export type PortPair = 'ab' | 'bc' | 'ca';

/** Resistance between two ports with the third open, seen in the Δ and in the Y. */
export function portResistance(pair: PortPair, d: Delta, y: Wye): { delta: number; wye: number } {
  if (pair === 'ab') return { delta: par(d.rc, d.ra + d.rb), wye: y.r1 + y.r2 };
  if (pair === 'bc') return { delta: par(d.ra, d.rb + d.rc), wye: y.r2 + y.r3 };
  return { delta: par(d.rb, d.rc + d.ra), wye: y.r3 + y.r1 };
}

export interface Bridge {
  ac: number;
  ad: number;
  cd: number;
  cb: number;
  db: number;
}

export interface BridgeReduction {
  sum: number;
  r1: number;
  r2: number;
  r3: number;
  left: number;
  right: number;
  parallel: number;
  rab: number;
}

/** Top Δ (R_ac, R_ad, R_cd) → Y (R_1 at a, R_2 at c, R_3 at d), then series / parallel. */
export function reduceBridge(b: Bridge): BridgeReduction {
  const sum = b.ac + b.ad + b.cd;
  const r1 = (b.ac * b.ad) / sum;
  const r2 = (b.ac * b.cd) / sum;
  const r3 = (b.ad * b.cd) / sum;
  const left = r2 + b.cb;
  const right = r3 + b.db;
  const parallel = par(left, right);
  return { sum, r1, r2, r3, left, right, parallel, rab: r1 + parallel };
}

/** R_ab of the bridge by nodal analysis (1 A into a, b grounded) — an independent check. */
export function bridgeRabNodal(b: Bridge): number {
  // unknowns va, vc, vd; conductances
  const g = { ac: 1 / b.ac, ad: 1 / b.ad, cd: 1 / b.cd, cb: 1 / b.cb, db: 1 / b.db };
  const m = [
    [g.ac + g.ad, -g.ac, -g.ad],
    [-g.ac, g.ac + g.cd + g.cb, -g.cd],
    [-g.ad, -g.cd, g.ad + g.cd + g.db],
  ];
  const rhs = [1, 0, 0];
  // Cramer's rule (3 × 3)
  const det = (a: number[][]) =>
    a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
  const ma = m.map((row, i) => [rhs[i], row[1], row[2]]);
  return det(ma) / det(m);
}

/** A resistance for display: whole numbers as they are, otherwise up to two decimals. */
export function fmt(v: number): string {
  if (!Number.isFinite(v)) return '—';
  const r = Math.round(v * 100) / 100;
  return Number.isInteger(r) ? String(r) : String(r).replace(/(\.\d*?)0+$/, '$1');
}
