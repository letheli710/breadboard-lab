// The four circuits of W2-L2, solved by nodal analysis (the stage layers read their numbers from
// here; model.test.ts checks them against the lesson sheet).
//  - case1: act 1, a grounded source Vs locks v1; one KCL at node 2.
//  - act2:  acts 2–3, Vs1 grounded (v1 = 10 V), Vs2 floating between nodes 2 (+) and 3 (−) with Rp
//           across it: supernode (2, 3). `refAtNode3` re-measures the same solution from node 3.
//  - ccvs:  act 4, the CCVS 4·ix between nodes 2 (+) and 3 (−), ix the current down R1.
//  - guided: act 5, Vs floating between nodes 1 (−) and 2 (+) with Rp across it.

/** act 1: Vs (node 1 – ground), R1 (1–2), R2 (2–ground), Is into node 2 */
export const C1 = { r1: 2, r2: 4, is: 4 };

export function case1(vs: number) {
  const { r1, r2, is } = C1;
  const v1 = vs;
  // (v2 − v1)/R1 + v2/R2 = Is
  const v2 = (is + v1 / r1) / (1 / r1 + 1 / r2);
  return { v1, v2, i1: (v2 - v1) / r1, i2: v2 / r2 };
}

/** acts 2–3 */
export const SN = { vs1: 10, vs2: 5, r1: 2, r2: 4, r3: 3, rp: 5, is: 2 };

export function act2(rpOn = true) {
  const { vs1, vs2, r1, r2, r3, rp, is } = SN;
  const v1 = vs1;
  // supernode KCL (v2 − v1)/R1 + v2/R2 + v3/R3 = Is with v3 = v2 − Vs2
  const v2 = (is + v1 / r1 + vs2 / r3) / (1 / r1 + 1 / r2 + 1 / r3);
  const v3 = v2 - vs2;
  const i1 = (v2 - v1) / r1; // leaving node 2 through R1
  const i2 = v2 / r2;
  const i3 = v3 / r3;
  const iRp = rpOn ? (v2 - v3) / rp : 0; // node 2 → node 3
  const iVs2 = i1 + i2 + iRp; // through Vs2 from node 3 to node 2
  return { v1, v2, v3, i1, i2, i3, iRp, iVs2 };
}

/** The act-2 solution measured from node 3 (node 0 is the old ground). */
export function refAtNode3() {
  const s = act2();
  return { v0: -s.v3, v1: s.v1 - s.v3, v2: s.v2 - s.v3, v3: 0 };
}

/** act 4 */
export const CC = { is1: 4, r1: 4, r2: 2, r3: 6, r4: 3, k: 4 };

export function ccvs() {
  const { is1, r1, r2, r3, r4, k } = CC;
  // node 1:      v1 (1/R1 + 1/R2) − v2/R2 = Is1
  // supernode:   (v2 − v1)/R2 + v2/R3 + v3/R4 = 0, v3 = v2 − (k/R1) v1
  const a11 = 1 / r1 + 1 / r2;
  const a12 = -1 / r2;
  const a21 = -1 / r2 - k / (r1 * r4);
  const a22 = 1 / r2 + 1 / r3 + 1 / r4;
  const det = a11 * a22 - a12 * a21;
  const v1 = (is1 * a22) / det;
  const v2 = (-a21 * is1) / det;
  const ix = v1 / r1;
  const v3 = v2 - k * ix;
  return { v1, v2, v3, ix };
}

/** act 5 (the guided example) */
export const GD = { is1: 6, r1: 3, r2: 6, is2: 1, vs: 3, rp: 3 };

export function guided(rpOn = true) {
  const { is1, r1, r2, is2, vs, rp } = GD;
  // supernode KCL v1/R1 + v2/R2 + Is2 = Is1 with v2 = v1 + Vs
  const v1 = (is1 - is2 - vs / r2) / (1 / r1 + 1 / r2);
  const v2 = v1 + vs;
  const iRp = rpOn ? (v2 - v1) / rp : 0; // node 2 → node 1
  const is = is1 + iRp - v1 / r1; // through Vs from node 1 to node 2
  return { v1, v2, iR1: v1 / r1, iR2: v2 / r2, iRp, is };
}

/** a number for a label: at most two decimals, no trailing zeros, a real minus sign */
export function fmt(x: number): string {
  const r = Math.round(x * 100) / 100;
  const s = (Object.is(r, -0) ? 0 : r).toFixed(2).replace(/\.?0+$/, '');
  return s.replace('-', '−');
}
