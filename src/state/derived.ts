import { useMemo } from 'react';
import { boardDiagnostics, type Issue } from '../core/diagnostics';
import { buildNetlist, isFloating, type BoardNetlist } from '../core/netlist';
import { simulate, type LedState, type SimResult } from '../core/solver';
import { hasGenerator, simulateTransient, type AcLedState, type MeterReading, type TransientResult } from '../core/transient';
import type { Layout } from '../core/types';
import { useStore } from './store';

export interface Derived {
  nl: BoardNetlist;
  /** DC operating point (with every generator at its offset) */
  sim: SimResult;
  issues: Issue[];
  /** time-domain result when a function generator is on the board (periodic steady state) */
  ac: TransientResult | null;
  /** transient failure message, if any */
  acError: string | null;
}

let cacheKey: Layout | null = null;
let cacheVal: Derived | null = null;

/** Netlist + DC solve + (if a generator is present) transient. Memoised per layout object, so
 *  the transient only re-runs when the layout or a part's settings change. */
export function derive(layout: Layout): Derived {
  if (cacheKey === layout && cacheVal) return cacheVal;
  const nl = buildNetlist(layout);
  const sim = simulate(nl.circuit);
  const issues = boardDiagnostics(nl, sim);
  let ac: TransientResult | null = null;
  let acError: string | null = null;
  if (hasGenerator(nl.circuit)) {
    try {
      ac = simulateTransient(nl.circuit);
    } catch (e) {
      acError = e instanceof Error ? e.message : String(e);
    }
  }
  cacheKey = layout;
  cacheVal = { nl, sim, issues, ac, acError };
  return cacheVal;
}

export function useDerived(): Derived {
  const layout = useStore((s) => s.layout);
  return useMemo(() => derive(layout), [layout]);
}

/** LED state to show: the time-averaged one under AC, else the DC one. */
export function ledOf(d: Pick<Derived, 'sim' | 'ac'>, ref: string): LedState | AcLedState | undefined {
  return d.ac?.leds.get(ref) ?? d.sim.leds.get(ref);
}

/** Ammeter reading (A, what a DMM in DC-A mode shows = average): current in at red, out at black. */
export function ammeterReading(d: Pick<Derived, 'sim' | 'ac'>, ref: string): number {
  const m = d.ac?.meters.get(ref);
  return m ? m.dc : (d.sim.meters.get(ref)?.current ?? 0);
}

/** AC statistics of an ammeter (null without a generator). */
export function ammeterAc(d: Pick<Derived, 'ac'>, ref: string): MeterReading | null {
  return d.ac?.meters.get(ref) ?? null;
}

// ---------------------------------------------------------------------------------------
// oscilloscope

export interface ScopeChannelData {
  channel: 1 | 2;
  ref: string;
  /** both the tip and the ground clip sit on a net with something else on it */
  connected: boolean;
  /** V(tip) − V(gnd): one sample per dt over `cycles` whole periods (AC), or a single DC value */
  v: ArrayLike<number>;
}

export interface ScopeData {
  /** true when the samples come from a time-domain simulation (a generator is on the board) */
  ac: boolean;
  /** generator period (s) and sample step; window = `cycles` whole periods */
  period: number | null;
  dt: number;
  cycles: number;
  channels: ScopeChannelData[];
  error: string | null;
  converged: boolean;
  /** transient compute time (ms) */
  ms: number;
}

let scopeKey: Derived | null = null;
let scopeVal: ScopeData | null = null;

export function deriveScope(d: Derived, layout: Layout): ScopeData {
  if (scopeKey === d && scopeVal) return scopeVal;
  const { nl, sim, ac } = d;
  const channels: ScopeChannelData[] = [];
  for (const p of layout.parts) {
    if (p.type !== 'scope_probe') continue;
    const tipNet = nl.pinNet.get(`${p.ref}.tip`);
    const gndNet = nl.pinNet.get(`${p.ref}.gnd`);
    const connected = !isFloating(tipNet) && !isFloating(gndNet);
    const channel = p.props.channel === 2 ? 2 : 1;
    if (ac) {
      const tr = connected ? ac.probe(p.ref) : null;
      channels.push({ channel, ref: p.ref, connected, v: tr ?? new Float64Array(ac.t.length) });
    } else {
      const vt = tipNet ? (sim.nodeV.get(tipNet) ?? 0) : 0;
      const vg = gndNet ? (sim.nodeV.get(gndNet) ?? 0) : 0;
      channels.push({ channel, ref: p.ref, connected, v: [connected ? vt - vg : 0] });
    }
  }
  channels.sort((a, b) => a.channel - b.channel);
  scopeKey = d;
  scopeVal = {
    ac: !!ac,
    period: ac ? ac.period : null,
    dt: ac ? ac.dt : 0,
    cycles: ac ? ac.periods : 1,
    channels,
    error: d.acError,
    converged: ac ? ac.converged : true,
    ms: ac ? ac.stats.ms : 0,
  };
  return scopeVal;
}

export function useScopeData(): ScopeData {
  const layout = useStore((s) => s.layout);
  return useMemo(() => deriveScope(derive(layout), layout), [layout]);
}

export function useActiveChallenge() {
  const id = useStore((s) => s.activeId);
  const list = useStore((s) => s.challenges);
  const mode = useStore((s) => s.mode);
  if (mode !== 'learn' && mode !== 'challenge') return null;
  return list.find((c) => c.id === id) ?? null;
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__bbTiming = () => {
    const l = useStore.getState().layout;
    const t0 = performance.now();
    cacheKey = null;
    const d = derive(l);
    return { deriveMs: performance.now() - t0, transientMs: d.ac?.stats.ms ?? null, steps: d.ac?.stats.steps ?? null, converged: d.ac?.converged ?? null };
  };
}
