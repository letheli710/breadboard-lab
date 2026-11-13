// Phase 5 device models: constants shared by the DC solver, the time-domain simulator,
// diagnostics and the UI. See "Phase 5 contract" in docs/ROADMAP.md.

import type { MosfetModel, PartProps } from './types';

/** NPN (2N2222A / S8050, TO-92). */
export const NPN = {
  vbe: 0.65,
  rbe: 20,
  beta: 150,
  vcesat: 0.15,
  rsat: 1,
  /** collector–emitter breakdown (Vceo) */
  bv: 40,
  icMax: 0.6,
  pMax: 0.625,
} as const;

/** N-MOSFET models: K from Rds(on) at the datasheet gate voltage: K = 1 / (Rds·(Vgs − Vth)). */
export const MOSFETS: Record<MosfetModel, { vth: number; rdsOn: number; vgsSpec: number; bv: number; idMax: number; pMax: number; name: [string, string] }> = {
  IRLZ44N: { vth: 1.5, rdsOn: 0.022, vgsSpec: 5, bv: 55, idMax: 47, pMax: 2, name: ['IRLZ44N（逻辑电平）', 'IRLZ44N (logic level)'] },
  IRF540N: { vth: 3.0, rdsOn: 0.044, vgsSpec: 10, bv: 100, idMax: 33, pMax: 2, name: ['IRF540N（标准电平）', 'IRF540N (standard level)'] },
};
export function mosfetParams(p: PartProps) {
  const m = MOSFETS[p.model ?? 'IRLZ44N'] ?? MOSFETS.IRLZ44N;
  return { ...m, K: 1 / (m.rdsOn * (m.vgsSpec - m.vth)) };
}
/** gate overdrive is quantised to this step (V) so the MOSFET stays piecewise-linear */
export const VOV_STEP = 0.005;
/** small drain-source conductance in saturation (numerical stability), S */
export const MOS_GDS = 1e-4;
export const BODY_DIODE = { vf: 0.7, rs: 0.05 };

/** 5 V relay SRD-05VDC-SL-C. */
export const RELAY = { coilR: 70, coilL: 0.15, pullIn: 0.053, dropOut: 0.007, rContact: 0.05 } as const;

/** Small "130" DC motor (no back-EMF). */
export const MOTOR = { R: 8, L: 2e-3, runCurrent: 0.1 } as const;

/** Active 5 V buzzer: internal oscillator ≈ diode-like threshold + resistance. */
export const BUZZER = { vf: 1.0, rs: 140, vOn: 2.5 } as const;

/** LDO LM1117 (TO-220). */
export const LDO = { dropout: 1.1, limit: 0.8, ro: 0.05, iq: 0.005, pMax: 1.0 } as const;

/** GL5528 photoresistor. */
export const LDR = { r10: 15e3, gamma: 0.7, rMin: 100, rDark: 1e6 } as const;
export function ldrResistance(lux: number): number {
  if (!(lux > 0)) return LDR.rDark;
  return Math.min(LDR.rDark, Math.max(LDR.rMin, LDR.r10 * Math.pow(lux / 10, -LDR.gamma)));
}

/** 10 kΩ NTC thermistor, B = 3950. */
export const NTC = { r25: 10e3, B: 3950 } as const;
export function ntcResistance(tempC: number): number {
  const T = tempC + 273.15;
  return NTC.r25 * Math.exp(NTC.B * (1 / T - 1 / 298.15));
}
