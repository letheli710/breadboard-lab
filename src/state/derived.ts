import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { acDiagnostics, boardDiagnostics, type Issue } from '../core/diagnostics';
import { buildNetlist, isFloating, type BoardNetlist } from '../core/netlist';
import { settleRuleOutputs, simulate, type LedState, type SimResult } from '../core/solver';
import type { RuleState } from '../core/mcuRules';
import { hasGenerator, simulateTransient, vavg, vpp, type AcLedState, type MeterReading, type TransientResult } from '../core/transient';
import { getLang, type Lang } from '../core/i18n';
import type { Layout, MeterMode } from '../core/types';
import { useLang, useStore } from './store';

export interface Derived {
  nl: BoardNetlist;
  /** DC operating point (with every generator at its offset) */
  sim: SimResult;
  issues: Issue[];
  /** time-domain result when a function generator (or a PWM pin) drives the board (periodic steady state).
   *  Only filled by useDerived(); may briefly belong to the previous layout while recomputing. */
  ac: TransientResult | null;
  /** transient failure message, if any */
  acError: string | null;
  /** `ac` is from an earlier layout (a new one is being computed) */
  acStale: boolean;
}

type Base = Omit<Derived, 'ac' | 'acError' | 'acStale'>;

let cacheKey: Layout | null = null;
let cacheLang: Lang | null = null;
let cacheVal: Derived | null = null;
/** Outputs of the board's threshold-rule pins after the last solve: a rule with hysteresis keeps
 *  its state while the temperature / light slider moves inside the band (mcuRules.ts). */
const ruleMemory: RuleState = new Map();

/** Netlist + DC solve + diagnostics, memoised per layout object (and language: diagnostics are text). Synchronous and cheap; it does
 *  not include the transient (see useDerived). */
export function derive(layout: Layout): Derived {
  if (cacheKey === layout && cacheLang === getLang() && cacheVal) return cacheVal;
  const nl = buildNetlist(layout);
  const sim = simulate(nl.circuit, ruleMemory);
  const issues = boardDiagnostics(nl, sim);
  cacheKey = layout;
  cacheLang = getLang();
  cacheVal = { nl, sim, issues, ac: null, acError: null, acStale: false };
  return cacheVal;
}

// ---- transient, computed off the render path -----------------------------------------
// A typical board takes 2–10 ms, but ringing L–C circuits at low generator frequencies can
// take ~100 ms. Dragging a slider changes the layout many times a second, so the transient
// runs in a macrotask, debounced while changes keep coming; until it lands, the previous
// result keeps showing (marked stale).

interface AcEntry {
  ac: TransientResult | null;
  error: string | null;
}
const acCache = new WeakMap<Layout, AcEntry>();
let lastAc: AcEntry = { ac: null, error: null };
let acVersion = 0;
const acListeners = new Set<() => void>();
let acTimer: ReturnType<typeof setTimeout> | null = null;
let acPending: Layout | null = null;
let lastRequest = 0;

function computeAc(layout: Layout): AcEntry {
  const hit = acCache.get(layout);
  if (hit) return hit;
  const { nl } = derive(layout);
  let e: AcEntry = { ac: null, error: null };
  try {
    e = { ac: simulateTransient(settleRuleOutputs(nl.circuit, ruleMemory)), error: null };
  } catch (err) {
    e = { ac: null, error: err instanceof Error ? err.message : String(err) };
  }
  acCache.set(layout, e);
  return e;
}

function requestAc(layout: Layout) {
  if (acCache.has(layout) || acPending === layout) return;
  acPending = layout;
  if (acTimer) clearTimeout(acTimer);
  const now = performance.now();
  // first change after a quiet spell: run right away; during a burst (slider drag): debounce
  const delay = now - lastRequest > 250 ? 0 : 90;
  lastRequest = now;
  acTimer = setTimeout(() => {
    acTimer = null;
    const l = acPending;
    acPending = null;
    if (!l) return;
    lastAc = computeAc(l);
    acVersion++;
    acListeners.forEach((f) => f());
  }, delay);
}

const subscribeAc = (f: () => void) => {
  acListeners.add(f);
  return () => acListeners.delete(f);
};
const getAcVersion = () => acVersion;

/** Transient result for a layout, computing it synchronously if needed (tests, checks). */
export function deriveAc(layout: Layout): TransientResult | null {
  return hasGenerator(derive(layout).nl.circuit) ? computeAc(layout).ac : null;
}

const merged = new WeakMap<Base, Map<AcEntry, Derived>>();

export function useDerived(): Derived {
  const layout = useStore((s) => s.layout);
  const lang = useLang();
  useSyncExternalStore(subscribeAc, getAcVersion);
  const base = useMemo(() => derive(layout), [layout, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const gen = hasGenerator(base.nl.circuit);
  const exact = gen ? acCache.get(layout) : undefined;
  useEffect(() => {
    if (gen && !exact) requestAc(layout);
  }, [layout, gen, exact]);
  if (!gen) return base;
  const entry = exact ?? lastAc;
  let m = merged.get(base);
  if (!m) merged.set(base, (m = new Map()));
  let d = m.get(entry);
  if (!d) {
    // time-domain issues (inductive kicks under PWM, …) only for a result of this very layout
    const issues = exact?.ac ? [...base.issues, ...safeAcDiagnostics(base.nl, exact.ac)] : base.issues;
    d = { ...base, issues, ac: entry.ac, acError: entry.error, acStale: !exact };
    m.set(entry, d);
  }
  return d;
}

function safeAcDiagnostics(nl: BoardNetlist, ac: TransientResult): Issue[] {
  try {
    return acDiagnostics(nl, ac);
  } catch (err) {
    console.error('acDiagnostics failed', err);
    return [];
  }
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

/** What an ammeter's screen shows. `dc` is the average (a DMM's DC A range). `rms` is the true
 *  RMS: `ac` when the current has (almost) no DC part, `acdc` when it rides on one. In `auto` mode
 *  the meter shows RMS when there are AC statistics and the average is under 5 % of the RMS. */
export interface AmmeterDisplay {
  value: number;
  kind: 'dc' | 'ac' | 'acdc';
  auto: boolean;
}

export function ammeterDisplay(d: Pick<Derived, 'sim' | 'ac'>, ref: string, mode: MeterMode = 'auto'): AmmeterDisplay {
  const m = d.ac?.meters.get(ref);
  const auto = mode === 'auto';
  if (!m) {
    const I = d.sim.meters.get(ref)?.current ?? 0;
    return mode === 'ac' ? { value: Math.abs(I), kind: 'acdc', auto } : { value: I, kind: 'dc', auto };
  }
  const pureAc = m.rms > 5e-7 && Math.abs(m.dc) < 0.05 * m.rms;
  if (mode === 'dc' || (auto && !pureAc)) return { value: m.dc, kind: 'dc', auto };
  return { value: m.rms, kind: pureAc ? 'ac' : 'acdc', auto };
}

/** AC statistics of an ammeter (null without a generator). */
export function ammeterAc(d: Pick<Derived, 'ac'>, ref: string): MeterReading | null {
  return d.ac?.meters.get(ref) ?? null;
}

/** A dev-board pin's voltage (to the board's GND) and current out of the pin, as a multimeter
 *  shows them: time averages when the board runs in the time domain (PWM, a generator), else the
 *  DC values. Under PWM the DC model's numbers (duty × 3.3 V behind the output resistance) are
 *  not what the circuit does — an LED that conducts during each high would show 0 mA. */
export function pinReadout(d: Pick<Derived, 'ac'>, ref: string, pin: string, dc: { voltage: number; current: number }): { voltage: number; current: number; averaged: boolean } {
  const ac = d.ac;
  if (!ac) return { voltage: dc.voltage, current: dc.current, averaged: false };
  try {
    const voltage = ac.measure('vavg', `${ref}.${pin}`, `${ref}.GND`);
    const tr = ac.pinCurrent(`${ref}.${pin}`);
    if (!Number.isFinite(voltage)) return { voltage: dc.voltage, current: dc.current, averaged: false };
    return { voltage, current: tr ? vavg(tr) : dc.current, averaged: true };
  } catch {
    return { voltage: dc.voltage, current: dc.current, averaged: false };
  }
}

/** Average (DC) value and peak-to-peak swing of a node under AC. */
export interface NodeAc {
  avg: number;
  pp: number;
}

const nodeAcCache = new WeakMap<TransientResult, Map<string, NodeAc | null>>();

/** A node's average + peak-to-peak from the memoised transient result (vs. ground); null when
 *  there is no transient result or the net is not in it (DC board, floating node, or a stale
 *  result from an earlier layout), in which case callers show the DC operating point. */
export function nodeAc(d: Pick<Derived, 'ac'>, net: string | null | undefined): NodeAc | null {
  const ac = d.ac;
  if (!ac || !net) return null;
  let m = nodeAcCache.get(ac);
  if (!m) nodeAcCache.set(ac, (m = new Map()));
  if (m.has(net)) return m.get(net)!;
  let r: NodeAc | null = null;
  if (net === ac.ground) r = { avg: 0, pp: 0 };
  else if (ac.nets.includes(net)) {
    const x = ac.v(net);
    r = { avg: vavg(x), pp: vpp(x) };
  }
  m.set(net, r);
  return r;
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
  /** time step too coarse for an LC ringing mode (see TransientResult.underResolved) */
  underResolved: boolean;
  /** traces are from before the latest change (recomputing) */
  stale: boolean;
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
    underResolved: !!ac?.underResolved,
    stale: d.acStale,
    ms: ac ? ac.stats.ms : 0,
  };
  return scopeVal;
}

export function useScopeData(): ScopeData {
  const layout = useStore((s) => s.layout);
  const d = useDerived();
  return useMemo(() => deriveScope(d, layout), [d, layout]);
}

// lives with the challenge loader so that App (on every page) does not pull in the simulator
export { useActiveChallenge } from './challenges';

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__bbTiming = () => {
    const l = useStore.getState().layout;
    const t0 = performance.now();
    const ac = deriveAc(l);
    return { deriveMs: performance.now() - t0, transientMs: ac?.stats.ms ?? null, steps: ac?.stats.steps ?? null, converged: ac?.converged ?? null };
  };
}
