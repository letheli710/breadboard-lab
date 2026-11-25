// W2-L8 model: a Thévenin source (V_Th, R_Th) driving a variable load R_L. Pure functions, shared by
// the three stage layers and the tests (no React, no three.js).

export type Mode = 'theory' | 'lab';
/** theory circuits: act 3's worked example (16 V, 8 Ω) and the guided example (12 V, 6 Ω) */
export type Case = 'ex3' | 'gd';

export interface Source {
  vth: number;
  rth: number;
}

export const CASES: Record<Case, Source & { label: string }> = {
  ex3: { vth: 16, rth: 8, label: '第三幕例题' },
  gd: { vth: 12, rth: 6, label: '引导例题' },
};

/** the breadboard: a 5 V bench supply and a 1 kΩ resistor (the sheet's safe kΩ scaling) */
export const LAB: Source = { vth: 5, rth: 1000 };

/** R_L slider range (Ω), from the sheet's sync_state_variables */
export const RL_RANGE: Record<Mode, [number, number]> = { theory: [0.1, 40], lab: [50, 10000] };
export const RL_STEP: Record<Mode, number> = { theory: 0.1, lab: 10 };

/** 1/4 W carbon-film resistor and potentiometer rating */
export const RATING_W = 0.25;

export interface Solution {
  vth: number;
  rth: number;
  rl: number;
  /** loop current */
  il: number;
  /** load voltage */
  vl: number;
  /** load power V_L² / R_L */
  pl: number;
  /** heat in R_Th */
  pth: number;
  /** power the source delivers */
  ptot: number;
  /** V_Th² / (4 R_Th) */
  pmax: number;
  /** R_L / (R_Th + R_L) */
  eta: number;
  /** R_L / R_Th */
  x: number;
  /** |R_L − R_Th| / R_Th < 2 % (the sheet's MATCHED badge) */
  matched: boolean;
}

export function solve(vth: number, rth: number, rl: number): Solution {
  const il = vth / (rth + rl);
  const vl = il * rl;
  return {
    vth,
    rth,
    rl,
    il,
    vl,
    pl: rl > 0 ? (vl * vl) / rl : 0,
    pth: il * il * rth,
    ptot: vth * il,
    pmax: (vth * vth) / (4 * rth),
    eta: rl / (rth + rl),
    x: rl / rth,
    matched: Math.abs(rl - rth) / rth < 0.02,
  };
}

/** P_L / P_max against x = R_L / R_Th */
export const pNorm = (x: number) => (4 * x) / ((1 + x) * (1 + x));
/** η against x = R_L / R_Th */
export const etaOf = (x: number) => x / (1 + x);

/** the sheet's lab badge: |V_L − 2.50 V| ≤ 0.05 V and |P_L − 6.25 mW| ≤ 0.05 mW */
export function peakLocked(s: Solution): boolean {
  return Math.abs(s.vl - LAB.vth / 2) <= 0.05 && Math.abs(s.pl - (LAB.vth * LAB.vth) / (4 * LAB.rth)) <= 0.05e-3;
}

/* ------------------------------------------------------------- the B10K knob */

/** knob travel (degrees) */
export const POT_TRAVEL = 270;

/** knob angle θ ∈ [0°, 270°] → R_L ∈ [50 Ω, 10 kΩ], linear (a B10K track) */
export const rlOfAngle = (deg: number) => {
  const [lo, hi] = RL_RANGE.lab;
  return lo + (Math.min(POT_TRAVEL, Math.max(0, deg)) / POT_TRAVEL) * (hi - lo);
};
export const angleOfRl = (rl: number) => {
  const [lo, hi] = RL_RANGE.lab;
  return ((Math.min(hi, Math.max(lo, rl)) - lo) / (hi - lo)) * POT_TRAVEL;
};

/** Ohms per pixel of a knob drag: slower within ±200 Ω of 1 kΩ (the sheet's gentle damping
 *  around the peak), so the peak can be found by hand. */
export const dragRate = (rl: number) => (Math.abs(rl - LAB.rth) < 200 ? 4 : 22);

export const clampRl = (mode: Mode, rl: number) => {
  const [lo, hi] = RL_RANGE[mode];
  const step = RL_STEP[mode];
  return Math.min(hi, Math.max(lo, Math.round(rl / step) * step));
};

/* ------------------------------------------------------------- formatting */

const trim = (s: string) => s.replace(/\.?0+$/, '');

export function fmtR(ohm: number, mode: Mode): string {
  if (mode === 'theory') return `${ohm.toFixed(1)} Ω`;
  return ohm >= 1000 ? `${(ohm / 1000).toFixed(2)} kΩ` : `${Math.round(ohm)} Ω`;
}
export const fmtV = (v: number) => `${v.toFixed(3)} V`;
export const fmtI = (a: number, mode: Mode) => (mode === 'theory' ? `${a.toFixed(3)} A` : `${(a * 1000).toFixed(3)} mA`);
export const fmtP = (w: number, mode: Mode) => (mode === 'theory' ? `${w.toFixed(3)} W` : `${(w * 1000).toFixed(3)} mW`);
export const fmtPct = (f: number) => `${(f * 100).toFixed(1)}%`;
/** a short value for axis ticks: 8 → "8", 0.5 → "0.5", 2500 → "2.5k" */
export function tickR(ohm: number): string {
  return ohm >= 1000 ? `${trim((ohm / 1000).toFixed(2))}k` : trim(ohm.toFixed(2));
}
