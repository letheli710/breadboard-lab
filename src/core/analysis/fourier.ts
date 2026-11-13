// Fourier series of the standard periodic waveforms, and parsing of periodic source values
// ({harmonics: …} / {wave: …}) into a DC term plus a list of harmonics.
//
// Every series is written with the textbook's cosine reference: x(t) = X₀ + Σ X_km·cos(kω₁t + φ_k),
// X_km ≥ 0 the AMPLITUDE of harmonic k and φ_k in degrees. T = 1/f₁ is the period of the waveform.

import type { WaveShape } from '../problem/types';
import { parseNum } from './circuit';
import { AnalysisError } from './errors';

/** one harmonic: amplitude (peak, ≥ 0 after normalisation) and phase in degrees */
export interface Term {
  k: number;
  amp: number;
  phase: number;
}

export interface Spectrum {
  dc: number;
  /** harmonics k ≥ 1, ascending k, each k at most once */
  terms: Term[];
}

export const WAVE_SHAPES: WaveShape[] = ['square', 'triangle', 'sawtooth', 'half-rect', 'full-rect'];
/** highest harmonic a source may list (keeps the per-harmonic solve cheap) */
export const MAX_HARMONIC = 199;

/**
 * Fourier coefficients of a standard waveform with peak value A, harmonics 1…upTo.
 *   square    ±A, +A on (0, T/2):            (4A/kπ)·sin kω₁t, k odd            → amp 4A/kπ, phase −90°
 *   triangle  ±A, 0 at t = 0 rising:          (8A/k²π²)·(−1)^((k−1)/2)·sin kω₁t  → phase −90° / +90° alternating
 *   sawtooth  0 → A ramp over (0, T):         A/2 − (A/kπ)·sin kω₁t               → amp A/kπ, phase +90°
 *   half-rect A·cos ω₁t for |ω₁t| < 90°, else 0: A/π + (A/2)cos ω₁t + (2A/π)·(−1)^(k/2+1)/(k²−1)·cos kω₁t, k even
 *   full-rect A·|cos(ω₁t/2)|:                 2A/π + (4A/π)·(−1)^(k+1)/(4k²−1)·cos kω₁t
 */
export function waveSpectrum(shape: WaveShape, A: number, upTo: number): Spectrum {
  const terms: Term[] = [];
  const push = (k: number, c: number, phase: number) => {
    // c·cos(kω₁t + phase) with c possibly negative → amplitude ≥ 0
    if (c === 0) return;
    terms.push(c > 0 ? { k, amp: c, phase } : { k, amp: -c, phase: phase > 0 ? phase - 180 : phase + 180 });
  };
  let dc = 0;
  for (let k = 1; k <= upTo; k++) {
    switch (shape) {
      case 'square':
        if (k % 2) push(k, (4 * A) / (k * Math.PI), -90);
        break;
      case 'triangle':
        if (k % 2) push(k, ((8 * A) / (k * k * Math.PI * Math.PI)) * (((k - 1) / 2) % 2 ? -1 : 1), -90);
        break;
      case 'sawtooth':
        push(k, A / (k * Math.PI), 90);
        break;
      case 'half-rect':
        if (k === 1) push(1, A / 2, 0);
        else if (k % 2 === 0) push(k, (((2 * A) / Math.PI) * ((k / 2) % 2 ? 1 : -1)) / (k * k - 1), 0);
        break;
      case 'full-rect':
        push(k, (((4 * A) / Math.PI) * (k % 2 ? 1 : -1)) / (4 * k * k - 1), 0);
        break;
    }
  }
  switch (shape) {
    case 'sawtooth':
      dc = A / 2;
      break;
    case 'half-rect':
      dc = A / Math.PI;
      break;
    case 'full-rect':
      dc = (2 * A) / Math.PI;
      break;
  }
  return { dc, terms };
}

/** exact (infinite-series) values of a standard waveform, for tests and the docs: rms, average, rectified average */
export function waveExact(shape: WaveShape, A: number): { rms: number; avg: number; absavg: number } {
  switch (shape) {
    case 'square':
      return { rms: A, avg: 0, absavg: A };
    case 'triangle':
      return { rms: A / Math.sqrt(3), avg: 0, absavg: A / 2 };
    case 'sawtooth':
      return { rms: A / Math.sqrt(3), avg: A / 2, absavg: A / 2 };
    case 'half-rect':
      return { rms: A / 2, avg: A / Math.PI, absavg: A / Math.PI };
    case 'full-rect':
      return { rms: A / Math.SQRT2, avg: (2 * A) / Math.PI, absavg: (2 * A) / Math.PI };
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Is this source value a periodic one ({harmonics} or {wave})? */
export const isPeriodicValue = (v: unknown): boolean => isObj(v) && ('harmonics' in v || 'wave' in v);

/** Parse {harmonics: {dc, terms}} or {wave: {shape, amp, upTo, offset}} into a spectrum. */
export function parsePeriodic(ref: string, v: Record<string, unknown>): Spectrum {
  if ('harmonics' in v) {
    const h = v.harmonics;
    if (!isObj(h) || !Array.isArray(h.terms)) throw new AnalysisError(`${ref}.harmonics must be {"dc": …, "terms": [{"k": 1, "amp": …, "phase": …}, …]}`);
    const dc = h.dc === undefined ? 0 : parseNum(h.dc, `${ref}.harmonics.dc`);
    const seen = new Set<number>();
    const terms: Term[] = [];
    h.terms.forEach((t, i) => {
      if (!isObj(t)) throw new AnalysisError(`${ref}.harmonics.terms[${i}] must be {"k", "amp", "phase"}`);
      const k = t.k;
      if (typeof k !== 'number' || !Number.isInteger(k) || k < 1 || k > MAX_HARMONIC)
        throw new AnalysisError(`${ref}.harmonics.terms[${i}].k must be an integer 1…${MAX_HARMONIC} (the DC term goes in "dc")`);
      if (seen.has(k)) throw new AnalysisError(`${ref}.harmonics: harmonic k = ${k} is listed twice`);
      seen.add(k);
      const amp = parseNum(t.amp, `${ref}.harmonics.terms[${i}].amp`);
      const phase = t.phase === undefined ? 0 : parseNum(t.phase, `${ref}.harmonics.terms[${i}].phase`);
      if (amp < 0) throw new AnalysisError(`${ref}.harmonics.terms[${i}].amp must be ≥ 0 (put the sign into the phase: −x = x∠180°)`);
      if (amp > 0) terms.push({ k, amp, phase });
    });
    terms.sort((a, b) => a.k - b.k);
    return { dc, terms };
  }
  const w = v.wave;
  if (!isObj(w)) throw new AnalysisError(`${ref}.wave must be {"shape", "amp", "upTo", "offset"}`);
  const shape = w.shape as WaveShape;
  if (!WAVE_SHAPES.includes(shape)) throw new AnalysisError(`${ref}.wave.shape must be one of ${WAVE_SHAPES.join(', ')} (got ${JSON.stringify(w.shape)})`);
  const amp = parseNum(w.amp, `${ref}.wave.amp`);
  if (!(amp > 0)) throw new AnalysisError(`${ref}.wave.amp must be > 0 (the peak value)`);
  const upTo = w.upTo;
  if (typeof upTo !== 'number' || !Number.isInteger(upTo) || upTo < 1 || upTo > MAX_HARMONIC)
    throw new AnalysisError(`${ref}.wave.upTo must be an integer 1…${MAX_HARMONIC}: the highest harmonic kept (state it in the problem text)`);
  const sp = waveSpectrum(shape, amp, upTo);
  if (w.offset !== undefined) sp.dc += parseNum(w.offset, `${ref}.wave.offset`);
  return sp;
}
