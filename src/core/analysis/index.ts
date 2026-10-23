// Ideal circuit-analysis engine for theory problems ("circuit-problem/1").
//
//   computeQuantity(netlist, analysis, find) → number   (throws AnalysisError)
//
// Lower-level helpers: solveDC / solveAC / solveTran return a CircuitSolution with node
// voltages, element voltages and currents (complex; imaginary part 0 for DC / transient).
//
// Conventions (see src/core/problem/types.ts): passive sign convention for every element;
// V source p = "+"; I source pushes its value from p to n through itself; absorbed power v·i.
// Notes on semantics chosen here:
//   - DC analysis uses switches' `after` state and steps' `after` value, unless find.t is "0-"
//     (or negative), which selects `before`. AC analysis uses `after`.
//   - AC: a bare-number source is a phasor with phase 0; {dc} without ac contributes 0;
//     {step}/{sin} sources are rejected (use {ac: {mag, phase}}).
//   - pf is |P|/|S| (always ≥ 0; for a source this is the power factor of its load).
//   - Transient t = 0 is treated as 0+. A capacitor/inductor `ic` overrides its t = 0− value.
//   - DC: nodes connected to the rest only through capacitors get zero net charge, loops of
//     shorted inductors zero flux ("initially uncharged / de-energised").
//   - Port quantities (req/vth/isc/pmax) use the circuit as drawn, minus the elements listed in
//     find.exclude (open-circuited; typically the load R_L drawn across the port). In transient problems they use the resistive (DC) circuit before
//     (t = "0-") or after switching, with any C/L directly across the port taken out.

import type { Analysis, Complex, Netlist } from '../problem/types';
import { Circuit } from './circuit';
import { AnalysisError } from './errors';
import { StaticAnalysis } from './engine';
import { Transient } from './transient';

export { AnalysisError } from './errors';
export { computeQuantity, computeComplex, cutoffs, qualityFactor, reduce, resonance } from './engine';
export { parseNum } from './circuit';
export { Circuit };

export interface CircuitSolution {
  /** V(a) − V(b) (b defaults to ground) */
  v(a: string, b?: string): Complex;
  /** element voltage V(p) − V(n) */
  vEl(ref: string): Complex;
  /** element current p → n (passive convention); OPAMP: output current */
  i(ref: string): Complex;
}

/** DC operating point (C open, L short); phase selects switch/step state. */
export function solveDC(netlist: Netlist, phase: 'before' | 'after' = 'after'): CircuitSolution {
  return new StaticAnalysis(new Circuit(netlist), 'dc', 0, phase).base();
}

/** Sinusoidal steady state at angular frequency omega (rad/s). */
export function solveAC(netlist: Netlist, omega: number): CircuitSolution {
  if (!(omega > 0)) throw new AnalysisError('solveAC: omega must be > 0');
  return new StaticAnalysis(new Circuit(netlist), 'ac', omega).base();
}

/** Transient solution at an instant ("0-", "0+", "inf" or seconds). */
export function solveTran(netlist: Netlist, t: number | '0-' | '0+' | 'inf'): CircuitSolution {
  return new Transient(new Circuit(netlist)).at(t);
}

/** Time constant of a first-order circuit for t > 0. */
export function timeConstant(netlist: Netlist): number {
  return new Transient(new Circuit(netlist)).tau();
}

/** Natural frequencies (rad/s, complex) of the circuit for t > 0. */
export function naturalFrequencies(netlist: Netlist): Complex[] {
  return new Transient(new Circuit(netlist)).naturalFrequencies();
}

export type { Analysis };
