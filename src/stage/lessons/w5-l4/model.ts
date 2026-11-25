// W5-L4 model: complex (phasor) arithmetic and the lesson's circuits, solved from their elements
// (not from the sheet's answers, which model.test.ts checks against these solutions).
//  - superposition (layer 01): act 1's example 1 (DC + 20 cos 2t V + 3 sin 5t A) and the guided
//    example of act 6 (DC + 10 cos 2t V + 5 cos 4t A): node v_o with four branches — V0 in series
//    with R1 and L; v1 in series with C; R_L; i2 injected into the node.
//  - source transformation (layer 02): act 2's ladder (24∠0° V, 6 Ω, −j6 Ω, 5 + j3 Ω, j2 A ∥ 8 Ω).
//  - Thévenin / Norton (layer 02): act 3's network (50∠0° V, 6 − j8 Ω, j10 Ω, 4 Ω, j2 A at a), and
//    act 4's network with the VCCS 0.5 V_x (12∠0° V, 4 Ω, −j4 Ω, j4 Ω), each with a load at a-b.
//  - op amp (layer 03): act 5's inverting amplifier with Z_f = R_f ∥ C_f (10 kΩ, 50 kΩ, 20 nF).

export interface Cx {
  re: number;
  im: number;
}

export const cx = (re: number, im = 0): Cx => ({ re, im });
export const add = (a: Cx, b: Cx): Cx => cx(a.re + b.re, a.im + b.im);
export const sub = (a: Cx, b: Cx): Cx => cx(a.re - b.re, a.im - b.im);
export const mul = (a: Cx, b: Cx): Cx => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const scale = (a: Cx, k: number): Cx => cx(a.re * k, a.im * k);
export function div(a: Cx, b: Cx): Cx {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
}
export const inv = (a: Cx): Cx => div(cx(1), a);
export const abs = (a: Cx): number => Math.hypot(a.re, a.im);
/** angle in degrees, (−180°, 180°] */
export const argDeg = (a: Cx): number => (Math.atan2(a.im, a.re) * 180) / Math.PI;
export const polar = (m: number, deg: number): Cx => cx(m * Math.cos((deg * Math.PI) / 180), m * Math.sin((deg * Math.PI) / 180));
/** a ∥ b */
export const par = (a: Cx, b: Cx): Cx => div(mul(a, b), add(a, b));
export const J = (x: number): Cx => cx(0, x);

/** Re{V e^{jωt}}: the time-domain value of phasor V at angular frequency ω */
export const timeValue = (v: Cx, w: number, t: number) => v.re * Math.cos(w * t) - v.im * Math.sin(w * t);

/** "a + jb" / "a − jb" */
export function fmtC(z: Cx, d = 2, unit = ''): string {
  const re = fmt(z.re, d);
  const im = Math.abs(z.im) < 0.5 * 10 ** -d ? 0 : z.im;
  const u = unit ? ` ${unit}` : '';
  if (im === 0) return `${re}${u}`;
  if (Math.abs(z.re) < 0.5 * 10 ** -d) return `${im < 0 ? '−' : ''}j${fmt(Math.abs(im), d)}${u}`;
  return `${re} ${im < 0 ? '−' : '+'} j${fmt(Math.abs(im), d)}${u}`;
}
/** "m∠θ°" */
export function fmtP(z: Cx, d = 2, unit = '', dDeg = 2): string {
  return `${fmt(abs(z), d)}∠${fmt(argDeg(z), dDeg)}°${unit ? ` ${unit}` : ''}`;
}
/** fixed decimals with a real minus sign, −0 → 0 */
export function fmt(x: number, d = 2): string {
  const s = x.toFixed(d);
  const z = Number(s) === 0 ? (0).toFixed(d) : s;
  return z.replace('-', '−');
}

/* ------------------------------------------------------------------ superposition (layer 01) */

export interface SupCircuit {
  V0: number;
  R1: number;
  L: number;
  C: number;
  RL: number;
  /** the voltage source in series with C: amplitude, ω, phase of its cosine */
  v1: { amp: number; w: number; deg: number; text: string };
  /** the current source into node v_o: amplitude, ω, phase of its cosine */
  i2: { amp: number; w: number; deg: number; text: string };
}

/** act 1, example 1: 12 V, 4 Ω, 2 H, 0.25 F, 4 Ω; 20 cos 2t V; 3 sin 5t A = 3 cos(5t − 90°) A */
export const EX1: SupCircuit = {
  V0: 12,
  R1: 4,
  L: 2,
  C: 0.25,
  RL: 4,
  v1: { amp: 20, w: 2, deg: 0, text: '20cos(2t) V' },
  i2: { amp: 3, w: 5, deg: -90, text: '3sin(5t) A' },
};

/** act 6, the guided example: 6 V, 2 Ω, 1 H, 0.25 F, 4 Ω; 10 cos 2t V; 5 cos 4t A */
export const GUIDED: SupCircuit = {
  V0: 6,
  R1: 2,
  L: 1,
  C: 0.25,
  RL: 4,
  v1: { amp: 10, w: 2, deg: 0, text: '10cos(2t) V' },
  i2: { amp: 5, w: 4, deg: 0, text: '5cos(4t) A' },
};

export interface SupSolution {
  vo0: number;
  /** impedances at ω1 and ω2 */
  ZL1: Cx;
  ZC1: Cx;
  ZL2: Cx;
  ZC2: Cx;
  /** (R1 + Z_L1) ∥ R_L at ω1 */
  Zpar1: Cx;
  /** node admittance at ω2 */
  Y2: Cx;
  Vo1: Cx;
  Vo2: Cx;
  w1: number;
  w2: number;
}

export function solveSup(c: SupCircuit): SupSolution {
  // ω = 0: v1 shorted, i2 open, L short, C open → divider R1, R_L
  const vo0 = (c.V0 * c.RL) / (c.R1 + c.RL);
  // ω1: V0 shorted, i2 open
  const w1 = c.v1.w;
  const ZL1 = J(w1 * c.L);
  const ZC1 = inv(J(w1 * c.C));
  const Zpar1 = par(add(cx(c.R1), ZL1), cx(c.RL));
  const V1 = polar(c.v1.amp, c.v1.deg);
  const Vo1 = mul(V1, div(Zpar1, add(ZC1, Zpar1)));
  // ω2: V0 and v1 shorted
  const w2 = c.i2.w;
  const ZL2 = J(w2 * c.L);
  const ZC2 = inv(J(w2 * c.C));
  const Y2 = add(add(inv(add(cx(c.R1), ZL2)), inv(ZC2)), cx(1 / c.RL));
  const Vo2 = div(polar(c.i2.amp, c.i2.deg), Y2);
  return { vo0, ZL1, ZC1, ZL2, ZC2, Zpar1, Y2, Vo1, Vo2, w1, w2 };
}

/** v_o(t) and its three parts */
export function supAt(s: SupSolution, t: number) {
  const a = s.vo0;
  const b = timeValue(s.Vo1, s.w1, t);
  const c = timeValue(s.Vo2, s.w2, t);
  return { dc: a, w1: b, w2: c, total: a + b + c };
}

/** Direct check of superposition: the full circuit in the time domain (node equation by RK4), the
 *  steady state after the transient has died out, compared in model.test.ts with supAt. States:
 *  inductor current iL (V0 → node through R1, L), capacitor voltage vC (node side +). */
export function simulateSup(c: SupCircuit, tEnd: number, dt = 1e-4) {
  // node v: (v − (V0 − R1 iL − L diL/dt)) … with the L branch as a state:
  // L diL/dt = V0 − R1 iL − v;  C dvC/dt = iC, iC = current into C from the node = (v − v1 − vC) … the C
  // branch has no resistor, so the node voltage is fixed by KCL with iC as the unknown:
  // iL + i2 = v/RL + iC, and v = vC + v1(t) (C branch: node → C → v1 → ground)
  // ⇒ iC = iL + i2 − (vC + v1)/RL
  const v1 = (t: number) => c.v1.amp * Math.cos(c.v1.w * t + (c.v1.deg * Math.PI) / 180);
  const i2 = (t: number) => c.i2.amp * Math.cos(c.i2.w * t + (c.i2.deg * Math.PI) / 180);
  const f = (t: number, iL: number, vC: number) => {
    const v = vC + v1(t);
    const iC = iL + i2(t) - v / c.RL;
    return [(c.V0 - c.R1 * iL - v) / c.L, iC / c.C];
  };
  let iL = 0;
  let vC = 0;
  let t = 0;
  while (t < tEnd - 1e-12) {
    const k1 = f(t, iL, vC);
    const k2 = f(t + dt / 2, iL + (dt / 2) * k1[0], vC + (dt / 2) * k1[1]);
    const k3 = f(t + dt / 2, iL + (dt / 2) * k2[0], vC + (dt / 2) * k2[1]);
    const k4 = f(t + dt, iL + dt * k3[0], vC + dt * k3[1]);
    iL += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    vC += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    t += dt;
  }
  return { t, v: vC + v1(t) };
}

/* -------------------------------------------------------- source transformation (layer 02) */

/** act 2: 24∠0° V, R1 = 6 Ω, Z_C = −j6 Ω, Z_ser = 5 + j3 Ω, I2 = 2∠90° A (up into x), R3 = 8 Ω */
export const EX2 = { Vs: cx(24), R1: cx(6), ZC: J(-6), Zser: cx(5, 3), I2: polar(2, 90), R3: cx(8) };

export function solveSrcT(c = EX2) {
  const Is1 = div(c.Vs, c.R1);
  const Zeq1 = par(c.R1, c.ZC);
  const Veq1 = mul(Is1, Zeq1);
  const Zleft = add(Zeq1, c.Zser);
  const Ileft = div(Veq1, Zleft);
  const Itot = add(Ileft, c.I2);
  const Ztot = par(Zleft, c.R3);
  const Vx = mul(Itot, Ztot);
  return { Is1, Zeq1, Veq1, Zleft, Ileft, Itot, Ztot, Vx };
}

/** act 2 by plain nodal analysis (nodes m = the C node, x): the transformations must agree */
export function nodalSrcT(c = EX2): Cx {
  // m: (Vm − Vs)/R1 + Vm/ZC + (Vm − Vx)/Zser = 0;  x: (Vx − Vm)/Zser + Vx/R3 = I2
  const a11 = add(add(inv(c.R1), inv(c.ZC)), inv(c.Zser));
  const a12 = scale(inv(c.Zser), -1);
  const a22 = add(inv(c.Zser), inv(c.R3));
  const b1 = div(c.Vs, c.R1);
  const b2 = c.I2;
  return solve2(a11, a12, a12, a22, b1, b2)[1];
}

/** 2 × 2 complex linear system by Cramer's rule */
export function solve2(a11: Cx, a12: Cx, a21: Cx, a22: Cx, b1: Cx, b2: Cx): [Cx, Cx] {
  const det = sub(mul(a11, a22), mul(a12, a21));
  return [div(sub(mul(b1, a22), mul(a12, b2)), det), div(sub(mul(a11, b2), mul(b1, a21)), det)];
}

/* ------------------------------------------------- Thévenin / Norton, independent (layer 02) */

/** act 3: 50∠0° V, Z1 = 6 − j8 Ω, Z2 = j10 Ω, R2 = 4 Ω, I_s = 2∠90° A up into a */
export const EX3 = { Vs: cx(50), Z1: cx(6, -8), Z2: J(10), R2: cx(4), Is: polar(2, 90) };

export function solveTh3(c = EX3) {
  const Z12 = par(c.Z1, c.Z2);
  const Zth = add(Z12, c.R2);
  const VsZ1 = div(c.Vs, c.Z1);
  const V1 = mul(add(VsZ1, c.Is), Z12);
  const Vth = add(V1, mul(c.Is, c.R2));
  const In = div(Vth, Zth);
  return { Z12, Zth, VsZ1, V1, Vth, In };
}

/** port voltage and current (into the load) of act 3's network with a load Z (null: open) */
export function port3(Z: Cx | null, c = EX3): { V: Cx; I: Cx } {
  // node 1: (V1 − Vs)/Z1 + V1/Z2 + (V1 − Va)/R2 = 0; node a: (Va − V1)/R2 + Va/Z = Is
  const a11 = add(add(inv(c.Z1), inv(c.Z2)), inv(c.R2));
  const a12 = scale(inv(c.R2), -1);
  const b1 = div(c.Vs, c.Z1);
  if (Z && abs(Z) < 1e-12) {
    const V1 = div(b1, a11);
    return { V: cx(0), I: add(c.Is, div(V1, c.R2)) };
  }
  const a22 = add(inv(c.R2), Z ? inv(Z) : cx(0));
  const [, Va] = solve2(a11, a12, a12, a22, b1, c.Is);
  return { V: Va, I: Z ? div(Va, Z) : cx(0) };
}

/* ---------------------------------------------- Thévenin with a dependent source (layer 02) */

/** act 4: 12∠0° V, R1 = 4 Ω, Z_C = −j4 Ω (node 1 to ground, V_x across it), Z_L = j4 Ω (node 1 → a),
 *  VCCS g_m V_x = 0.5 V_x up into a */
export const EX4 = { Vs: cx(12), R1: cx(4), ZC: J(-4), ZL: J(4), gm: 0.5 };

export function solveTh4(c = EX4) {
  // Step A: open circuit
  const Vx = div(div(c.Vs, c.R1), sub(add(inv(c.R1), inv(c.ZC)), cx(c.gm)));
  const Vth = mul(Vx, add(cx(1), scale(c.ZL, c.gm)));
  // Step B: Vs = 0, V_t = 1∠0° V at a-b
  const Vt = cx(1);
  const Ysum = add(add(inv(c.R1), inv(c.ZC)), inv(c.ZL));
  const VxT = div(div(Vt, c.ZL), Ysum);
  const It = sub(div(sub(Vt, VxT), c.ZL), scale(VxT, c.gm));
  const Zth = div(Vt, It);
  return { Vx, Vth, Ysum, VxT, It, Zth, In: div(Vth, Zth) };
}

/** port voltage and current of act 4's network with a load Z (null: open) */
export function port4(Z: Cx | null, c = EX4): { V: Cx; I: Cx } {
  // node 1: (Vx − Vs)/R1 + Vx/ZC + (Vx − Va)/ZL = 0; node a: (Va − Vx)/ZL + Va/Z = gm Vx
  const a11 = add(add(inv(c.R1), inv(c.ZC)), inv(c.ZL));
  const a12 = scale(inv(c.ZL), -1);
  const a21 = sub(scale(inv(c.ZL), -1), cx(c.gm));
  const b1 = div(c.Vs, c.R1);
  if (Z && abs(Z) < 1e-12) {
    // a shorted: node 1 alone, then the short-circuit current = (Vx − 0)/ZL + gm Vx
    const Vx = div(b1, a11);
    return { V: cx(0), I: add(div(Vx, c.ZL), scale(Vx, c.gm)) };
  }
  const a22 = add(inv(c.ZL), Z ? inv(Z) : cx(0));
  const [, Va] = solve2(a11, a12, a21, a22, b1, cx(0));
  return { V: Va, I: Z ? div(Va, Z) : cx(0) };
}

/** port of a Thévenin source (Vth, Zth) with a load Z (null: open) */
export function portTh(Vth: Cx, Zth: Cx, Z: Cx | null): { V: Cx; I: Cx } {
  if (!Z) return { V: Vth, I: cx(0) };
  const I = div(Vth, add(Zth, Z));
  return { V: mul(I, Z), I };
}
/** port of a Norton source (In, Zn) with a load Z (null: open) */
export function portN(In: Cx, Zn: Cx, Z: Cx | null): { V: Cx; I: Cx } {
  if (!Z) return { V: mul(In, Zn), I: cx(0) };
  if (abs(Z) < 1e-12) return { V: cx(0), I: In };
  const V = mul(In, par(Zn, Z));
  return { V, I: div(V, Z) };
}

/* ------------------------------------------------------------------- op amp (layer 03) */

/** act 5: R1 = 10 kΩ, R_f = 50 kΩ, C_f = 20 nF, v_i = 2 cos(1000 t) V */
export const EX5 = { R1: 10e3, Rf: 50e3, Cf: 20e-9, Vi: 2, w: 1000 };
export type Topo = 'inv' | 'noninv';

export function opamp(w: number, topo: Topo, c = EX5) {
  const ZCf = w > 0 ? inv(J(w * c.Cf)) : null;
  const Zf = div(cx(c.Rf), cx(1, w * c.Rf * c.Cf));
  const ratio = div(Zf, cx(c.R1));
  const A = topo === 'inv' ? scale(ratio, -1) : add(cx(1), ratio);
  const Vo = scale(A, c.Vi);
  return { ZCf, Zf, A, Vo, x: w * c.Rf * c.Cf, dB: 20 * Math.log10(abs(A)), wc: 1 / (c.Rf * c.Cf) };
}
