// Compare the user's circuit with a challenge's target circuit.
// Matching is topological: breadboard positions don't matter, only which terminals
// end up electrically connected. We search for the component correspondence
// (target ref -> user ref, plus pin orientation for non-polarised parts) that best
// explains the user's wiring, then describe what differs.

import { ammeterBypassIssues } from './ammeterBypass';
import { tr } from './i18n';
import type { Challenge, ChallengeTest } from './challenge';
import type { Issue } from './diagnostics';
import { MCU_BOARDS, isMcu, isMcuBoard, modeName, parseRole, pinConfig, roleMatches } from './mcu';
import { BATTERIES, describeComponent, genSettings, isPower, pinPermutations, sourceVoltage, terminalLabel, terminalName, terminalsOf } from './parts';
import { simulate, type SimResult } from './solver';
import { hasGenerator, simulateTransient, vavg, vrms, type Measure, type TransientResult } from './transient';
import type { CComponent, CNet, Circuit } from './types';
import { pinId, splitPin } from './types';
import { amps, formatSI, volts } from './format';

export interface CheckResult {
  perfect: boolean;
  issues: Issue[];
  /** target ref -> user ref */
  mapping: Map<string, string>;
  /** target "REF.pin" -> user "REF.pin" */
  pinMap: Map<string, string>;
  /** 0..1 how much of the wiring is right */
  progress: number;
  testsPassed: number;
  testsTotal: number;
  /** the matcher ran out of its work budget: neither right nor wrong could be established */
  undecided?: boolean;
}

type Perm = Record<string, string>;

const permutations = (type: CComponent['type']): Perm[] => pinPermutations(type);

/**
 * The student's circuit as the checker sees it:
 *  - scope probes are removed (ideal measuring tools: never part of a target circuit);
 *  - when the target has no ammeter, every ammeter is treated as a plain wire (its two nets are
 *    merged): a student who puts a meter in series to look at the current still matches the
 *    target, while a meter wrongly connected *across* a part shorts it and is reported as an
 *    extra connection.
 * `collapsed` maps a merged net name -> the ammeter refs that joined it.
 */
export function checkerView(user: Circuit, targetHasAmmeter: boolean): { circuit: Circuit; collapsed: Map<string, string[]> } {
  const drop = new Set(user.components.filter((c) => c.type === 'scope_probe' || (!targetHasAmmeter && c.type === 'ammeter')).map((c) => c.ref));
  const collapsed = new Map<string, string[]>();
  if (drop.size === 0) return { circuit: user, collapsed };
  const parent = new Map<string, string>();
  const find = (n: string): string => {
    const p = parent.get(n) ?? n;
    if (p === n) return n;
    const r = find(p);
    parent.set(n, r);
    return r;
  };
  const netOf = new Map<string, string>();
  user.nets.forEach((n) => n.pins.forEach((p) => netOf.set(p, n.name)));
  const isNC = (n: string) => n.startsWith('NC:');
  const meterOfRoot = new Map<string, string[]>();
  for (const c of user.components) {
    if (c.type !== 'ammeter' || !drop.has(c.ref)) continue;
    const a = netOf.get(pinId(c.ref, '+'));
    const b = netOf.get(pinId(c.ref, '-'));
    if (!a || !b) continue;
    let ra = find(a);
    let rb = find(b);
    if (ra !== rb) {
      // keep a meaningful name as the root (not a floating "NC:" net)
      if (isNC(ra) && !isNC(rb)) [ra, rb] = [rb, ra];
      parent.set(rb, ra);
    }
    const r = find(a);
    meterOfRoot.set(r, [...(meterOfRoot.get(r) ?? []), ...(meterOfRoot.get(rb) ?? []), c.ref]);
  }
  const merged = new Map<string, CNet>();
  for (const n of user.nets) {
    const r = find(n.name);
    const pins = n.pins.filter((p) => !drop.has(splitPin(p)[0]));
    if (!merged.has(r)) merged.set(r, { name: r, pins: [] });
    merged.get(r)!.pins.push(...pins);
  }
  for (const [r, refs] of meterOfRoot) collapsed.set(find(r), [...new Set(refs)]);
  return {
    circuit: { components: user.components.filter((c) => !drop.has(c.ref)), nets: [...merged.values()].filter((n) => n.pins.length > 0) },
    collapsed,
  };
}

/** Typical wiring mistakes worth naming: user-terminal relabelling that would fix the wiring. */
/** `posFb`: the target op-amp feeds its output back to IN+ on purpose (a Schmitt trigger) */
const MISTAKES: Partial<
  Record<CComponent['type'], { swap: Record<string, string>; zh: (r: string, posFb?: boolean) => string; en: (r: string, posFb?: boolean) => string; title: [string, string] }[]>
> = {
  npn: [
    {
      swap: { e: 'c', c: 'e' },
      title: [' 的 E 和 C 接反了', "'s E and C are swapped"],
      zh: (r) => `${r} 平面朝向你时三只脚从左到右是 E、B、C。发射极 E 接 GND（低电位），集电极 C 接负载。E、C 对调后三极管只剩很小的“反向 β”，几乎不导通。`,
      en: (r) =>
        `With ${r}'s flat face towards you the legs are E, B, C from left to right. The emitter E goes to GND (the low side), the collector C to the load. With E and C swapped it has only a tiny "reverse β" and barely conducts.`,
    },
  ],
  nmos: [
    {
      swap: { d: 's', s: 'd' },
      title: [' 的 D 和 S 接反了', "'s D and S are swapped"],
      zh: (r) => `${r}（TO-220，正面朝向你）三只脚从左到右是 G、D、S。源极 S 接 GND，漏极 D 接负载。D、S 对调后体二极管会一直导通，开关失效。`,
      en: (r) =>
        `${r} (TO-220, printed face towards you) has legs G, D, S from left to right. The source S goes to GND, the drain D to the load. With D and S swapped the body diode conducts all the time and it no longer switches.`,
    },
  ],
  ldo: [
    {
      swap: { in: 'out', out: 'in' },
      title: [' 的 IN 和 OUT 接反了', "'s IN and OUT are swapped"],
      zh: (r) => `${r}（LM1117，TO-220 正面朝向你）三只脚从左到右是 GND、OUT、IN。高电压接 IN（3 脚），稳压输出从 OUT（2 脚，也就是散热片）出来。`,
      en: (r) =>
        `${r} (LM1117, TO-220 printed face towards you) has legs GND, OUT, IN from left to right. The higher voltage goes to IN (pin 3); the regulated output comes out of OUT (pin 2, which is also the tab).`,
    },
  ],
  opamp: [
    {
      swap: { outA: 'inB+', 'inB+': 'outA', 'inA-': 'inB-', 'inB-': 'inA-', 'inA+': 'outB', outB: 'inA+', 'v-': 'v+', 'v+': 'v-' },
      title: [' 插反了（转了 180°）', ' is rotated 180°'],
      zh: (r) => `${r} 的 1 脚应该在缺口 / 小圆点旁边，1–4 脚在 e 行（从左到右），8–5 脚在 f 行。现在芯片转了半圈：电源脚接反会烧坏真实的芯片。`,
      en: (r) =>
        `${r}'s pin 1 is next to the notch / dot: pins 1–4 run left to right in row e, pins 8–5 in row f. The chip is turned around — with its supply pins reversed a real chip would burn.`,
    },
    {
      swap: { 'inA-': 'inA+', 'inA+': 'inA-', 'inB-': 'inB+', 'inB+': 'inB-' },
      title: [' 的 + 和 − 输入接反了', "'s + and − inputs are swapped"],
      zh: (r, posFb) =>
        posFb
          ? `${r} 的反相输入（IN−）和同相输入（IN+）对调了。这个电路故意把反馈接到 IN+（正反馈），才有两个门限；输入信号接 IN−。接反以后它变成普通的负反馈放大器，回差就没了。`
          : `${r} 的反相输入（IN−）和同相输入（IN+）对调了。反馈必须接到 IN−（负反馈）；接到 IN+ 会变成正反馈，输出直接撞到电源轨。`,
      en: (r, posFb) =>
        posFb
          ? `${r}'s inverting (IN−) and non-inverting (IN+) inputs are swapped. This circuit feeds its output back to IN+ on purpose (positive feedback) — that is what makes the two thresholds — and the input signal goes to IN−. Swapped, it turns into an ordinary negative-feedback amplifier and the hysteresis is gone.`
          : `${r}'s inverting (IN−) and non-inverting (IN+) inputs are swapped. Feedback must go to IN− (negative feedback); feeding IN+ makes positive feedback and the output slams into a rail.`,
    },
  ],
};

/** True if a part of the target joins an op-amp's output to its own IN+ (positive feedback by design). */
function feedsPlus(ctx: Ctx, ref: string): boolean {
  for (const h of ['A', 'B']) {
    const out = ctx.tNetOf.get(`${ref}.out${h}`);
    const plus = ctx.tNetOf.get(`${ref}.in${h}+`);
    if (out === undefined || plus === undefined) continue;
    for (const c of ctx.target.components) {
      if (c.ref === ref) continue;
      const nets = new Set(terminalsOf(c.type).map((x) => ctx.tNetOf.get(pinId(c.ref, x))));
      if (nets.has(out) && nets.has(plus)) return true;
    }
  }
  return false;
}

function compatible(t: CComponent, u: CComponent): boolean {
  if (t.type === 'dc_source') return isPower(u.type);
  if (t.type === 'mcu') return isMcu(u.type);
  return t.type === u.type;
}

function valueProblem(t: CComponent, u: CComponent, tol: number): string | null {
  const close = (a: number, b: number) => Math.abs(a - b) <= Math.abs(b) * tol + 1e-12;
  const tp = t.props;
  const up = u.props;
  if ((t.type === 'resistor' || t.type === 'potentiometer') && tp.resistance !== undefined && !close(up.resistance ?? 0, tp.resistance))
    return tr(`${u.ref} 是 ${describeComponent(u)}，题目要求 ${describeComponent(t)}`, `${u.ref} is a ${describeComponent(u)}; the task needs a ${describeComponent(t)}`);
  if (t.type === 'led' && tp.color && up.color !== tp.color)
    return tr(`${u.ref} 是${describeComponent(u)}，题目要求${describeComponent(t)}`, `${u.ref} is a ${describeComponent(u)}; the task needs a ${describeComponent(t)}`);
  if (t.type === 'capacitor' && tp.capacitance !== undefined && !close(up.capacitance ?? 0, tp.capacitance))
    return tr(`${u.ref} 的电容值和题目不一致`, `${u.ref} has a different capacitance from the task`);
  if (t.type === 'battery' && tp.variant && up.variant !== tp.variant)
    return tr(
      `${u.ref} 是 ${BATTERIES[up.variant ?? '9V'].name}，题目要求 ${BATTERIES[tp.variant].name}`,
      `${u.ref} is a ${BATTERIES[up.variant ?? '9V'].name}; the task needs a ${BATTERIES[tp.variant].name}`,
    );
  if (isPower(t.type) && tp.voltage !== undefined && !close(sourceVoltage(u), tp.voltage))
    return tr(`${u.ref} 输出 ${sourceVoltage(u)} V，题目要求 ${tp.voltage} V`, `${u.ref} outputs ${sourceVoltage(u)} V; the task needs ${tp.voltage} V`);
  if (t.type === 'nmos' && tp.model && (up.model ?? 'IRLZ44N') !== tp.model)
    return tr(`${u.ref} 是 ${describeComponent(u)}，题目要求 ${describeComponent(t)}`, `${u.ref} is a ${describeComponent(u)}; the task needs a ${describeComponent(t)}`);
  if (t.type === 'npn' && tp.beta !== undefined && !close(up.beta ?? 150, tp.beta))
    return tr(`${u.ref} 的 β 是 ${up.beta ?? 150}，题目要求 ${tp.beta}`, `${u.ref} has β = ${up.beta ?? 150}; the task needs ${tp.beta}`);
  if (t.type === 'ldo' && tp.voltage !== undefined && !close(up.voltage ?? 3.3, tp.voltage))
    return tr(`${u.ref} 输出 ${up.voltage ?? 3.3} V，题目要求 ${tp.voltage} V`, `${u.ref} outputs ${up.voltage ?? 3.3} V; the task needs ${tp.voltage} V`);
  if (isMcu(t.type) && tp.usb !== undefined && (up.usb !== false) !== tp.usb)
    return tp.usb
      ? tr(`${u.ref} 要插上 USB 线（属性里的 USB 开关）`, `${u.ref} needs its USB cable plugged in (the USB switch under Properties)`)
      : tr(`${u.ref} 不能用 USB 供电：把属性里的 USB 关掉，从面包板给它供电`, `${u.ref} must not run from USB: switch USB off under Properties and power it from the breadboard`);
  if (t.type === 'inductor' && tp.inductance !== undefined && !close(up.inductance ?? 0, tp.inductance))
    return tr(`${u.ref} 是 ${describeComponent(u)}，题目要求 ${describeComponent(t)}`, `${u.ref} is a ${describeComponent(u)}; the task needs a ${describeComponent(t)}`);
  if (t.type === 'function_gen') {
    const g = genSettings(up);
    const bad =
      (tp.waveform && g.waveform !== tp.waveform) ||
      (tp.frequency !== undefined && !close(g.frequency, tp.frequency)) ||
      (tp.amplitude !== undefined && !close(g.amplitude, tp.amplitude)) ||
      (tp.offset !== undefined && Math.abs(g.offset - tp.offset) > Math.max(Math.abs(tp.offset) * tol, 0.01));
    if (bad)
      return tr(
        `${u.ref} 的设置是 ${describeComponent({ type: 'function_gen', props: g })}，题目要求 ${describeComponent(t)}${tp.offset !== undefined ? `，偏置 ${tp.offset} V` : ''}`,
        `${u.ref} is set to ${describeComponent({ type: 'function_gen', props: g })}; the task needs ${describeComponent(t)}${tp.offset !== undefined ? `, offset ${tp.offset} V` : ''}`,
      );
  }
  return null;
}

interface Ctx {
  target: Circuit;
  user: Circuit;
  /** target pins that matter (appear in a target net) -> target net index */
  tNetOf: Map<string, number>;
  uNetOf: Map<string, string>;
  tol: number;
}

/** Physical pin of the user's board that a target board pin maps to: power pins map by name
 *  (EN ↔ NRST), physical names map to themselves. Null for logical role pins. */
function fixedMcuPin(tType: CComponent['type'], u: CComponent, tPin: string): string | null {
  if (parseRole(tPin)) return null;
  if (tPin === 'EN' || tPin === 'NRST') return u.type === 'stm32_bluepill' ? 'NRST' : 'EN';
  void tType;
  return tPin;
}

/** Candidate user pins for a target role pin: GPIOs of the user's board with the capability
 *  (or, when the "user" circuit is itself a target, the same logical name). */
function roleCandidates(u: CComponent, tPin: string, uPinsInNets: Set<string>): string[] {
  const r = parseRole(tPin)!;
  const out: string[] = [];
  if (uPinsInNets.has(pinId(u.ref, tPin))) out.push(tPin);
  if (isMcuBoard(u.type)) for (const def of Object.values(MCU_BOARDS[u.type].pins)) if (def.kind === 'gpio' && def.gpio && roleMatches(r.role, def.gpio)) out.push(def.name);
  return out;
}

/** Fill in the board pins of a (partial) pin map: fixed pins by name, logical role pins by
 *  where the student actually wired them (greedy: the free capable pin whose net holds most
 *  of the other pins of the same target net). Unresolvable role pins map to the role name
 *  itself on the user's board (a pin on no net, reported as a broken connection). */
function resolveMcuPins(ctx: Ctx, pm: Map<string, string>, pairs: { t: CComponent; u: CComponent }[]) {
  if (pairs.length === 0) return;
  const tNetPins = ctx.target.nets.map((n) => n.pins);
  const uPinsInNets = new Set(ctx.uNetOf.keys());
  for (const { t, u } of pairs) {
    const tPins = [...ctx.tNetOf.keys()].filter((p) => p.startsWith(`${t.ref}.`) && !p.slice(t.ref.length + 1).includes('.'));
    const roles: string[] = [];
    for (const tp of tPins) {
      const name = tp.slice(t.ref.length + 1);
      const f = fixedMcuPin(t.type, u, name);
      if (f) pm.set(tp, pinId(u.ref, f));
      else roles.push(name);
    }
    if (roles.length === 0) continue;
    const used = new Set([...pm.values()].filter((v) => v.startsWith(`${u.ref}.`)));
    const cand: { role: string; pin: string; score: number }[] = [];
    for (const role of roles) {
      const ti = ctx.tNetOf.get(pinId(t.ref, role))!;
      const votes = new Map<string, number>();
      for (const other of tNetPins[ti]) {
        if (other === pinId(t.ref, role)) continue;
        const up = pm.get(other);
        const un = up && ctx.uNetOf.get(up);
        if (un) votes.set(un, (votes.get(un) ?? 0) + 1);
      }
      for (const pin of roleCandidates(u, role, uPinsInNets)) {
        const un = ctx.uNetOf.get(pinId(u.ref, pin));
        cand.push({ role, pin, score: (un ? (votes.get(un) ?? 0) : 0) * 10 + (pin === role ? 5 : 0) + (un ? 0 : 1) });
      }
    }
    cand.sort((a, b) => b.score - a.score);
    const done = new Set<string>();
    for (const c of cand) {
      if (done.has(c.role) || used.has(pinId(u.ref, c.pin))) continue;
      // a pin already wired to something else is only taken when it's on the right net
      if (c.score < 10 && ctx.uNetOf.has(pinId(u.ref, c.pin)) && c.pin !== c.role) continue;
      pm.set(pinId(t.ref, c.role), pinId(u.ref, c.pin));
      used.add(pinId(u.ref, c.pin));
      done.add(c.role);
    }
    for (const role of roles) if (!done.has(role)) pm.set(pinId(t.ref, role), pinId(u.ref, role));
  }
}

/** Score a full assignment. Returns good/bad connection counts. */
function evaluate(ctx: Ctx, pinMap: Map<string, string>) {
  let good = 0;
  let bad = 0;
  const groupsPerT: Map<string, string[]>[] = ctx.target.nets.map(() => new Map());
  const tNetsPerU = new Map<string, Map<number, string[]>>();
  for (const [tp, ti] of ctx.tNetOf) {
    const up = pinMap.get(tp);
    if (!up) continue;
    const un = ctx.uNetOf.get(up) ?? `?${up}`;
    const g = groupsPerT[ti];
    if (!g.has(un)) g.set(un, []);
    g.get(un)!.push(tp);
    if (!tNetsPerU.has(un)) tNetsPerU.set(un, new Map());
    const m = tNetsPerU.get(un)!;
    if (!m.has(ti)) m.set(ti, []);
    m.get(ti)!.push(tp);
  }
  for (const g of groupsPerT) {
    let n = 0;
    for (const v of g.values()) n += v.length;
    if (n > 0) good += n - g.size;
  }
  for (const m of tNetsPerU.values()) bad += m.size - 1;
  return { good, bad, groupsPerT, tNetsPerU };
}

function mcuPairs(assign: (null | { u: CComponent; perm: Perm })[], targets: CComponent[]) {
  const out: { t: CComponent; u: CComponent }[] = [];
  assign.forEach((a, i) => a && isMcu(targets[i].type) && out.push({ t: targets[i], u: a.u }));
  return out;
}

function buildPinMap(assign: (null | { u: CComponent; perm: Perm })[], targets: CComponent[]) {
  const pm = new Map<string, string>();
  assign.forEach((a, i) => {
    if (!a) return;
    for (const [tTerm, uTerm] of Object.entries(a.perm)) pm.set(pinId(targets[i].ref, tTerm), pinId(a.u.ref, uTerm));
  });
  return pm;
}

type Assign = (null | { u: CComponent; perm: Perm })[];

/** Work budget of the matcher (applied candidate placements). Generous: every built-in challenge
 *  needs well under 1 % of it; only a pathological board can run out, and then the checker says
 *  it could not decide instead of guessing. */
export const SEARCH_BUDGET = 200_000;

/**
 * Find the target -> user component assignment (with pin orientation) that best explains the
 * user's wiring. Exact branch-and-bound:
 *  - the partial assignment is scored incrementally: a target net whose pins already land on two
 *    different user nets has lost a connection for good, a user net holding pins of two target
 *    nets is an extra connection for good, so `10·maxGood − 10·lost − 10·bad − penalties` is an
 *    upper bound on every completion and branches that can't beat the best leaf are cut;
 *  - targets are visited in connectivity order (each one shares nets with those before it) and
 *    candidates best-first, so the first leaf is usually already the answer;
 *  - interchangeable user parts (same type, same props, same nets on every terminal) and pin
 *    orientations that land on the same nets are tried once.
 * Returns `complete: false` when the budget ran out before the search could prove its answer.
 */
function matchComponents(ctx: Ctx, tol: number, budget: number) {
  const { target, user, tNetOf, uNetOf } = ctx;
  const maxGood = target.nets.reduce((s, n) => s + n.pins.length - 1, 0);
  const candCount = (t: CComponent) => user.components.filter((u) => compatible(t, u)).length;
  const pinsOfT = new Map<string, string[]>();
  for (const p of tNetOf.keys()) {
    const [ref] = splitPin(p);
    if (!pinsOfT.has(ref)) pinsOfT.set(ref, []);
    pinsOfT.get(ref)!.push(p);
  }
  // order targets: fewest candidates first, then always the one most connected to those already placed
  const left = [...target.components];
  const targets: CComponent[] = [];
  const seenNets = new Set<number>();
  while (left.length) {
    let bi = 0;
    let bk: number[] = [];
    left.forEach((t, k) => {
      const nets = new Set((pinsOfT.get(t.ref) ?? []).map((p) => tNetOf.get(p)!));
      const shared = [...nets].filter((n) => seenNets.has(n)).length;
      const key = [targets.length === 0 ? 0 : -shared, candCount(t), -nets.size];
      const j = key.findIndex((v, q) => v !== bk[q]);
      if (k === 0 || (j >= 0 && key[j] < bk[j])) {
        bi = k;
        bk = key;
      }
    });
    const [t] = left.splice(bi, 1);
    targets.push(t);
    for (const p of pinsOfT.get(t.ref) ?? []) seenNets.add(tNetOf.get(p)!);
  }

  // incremental connectivity state
  const cntTU = new Map<string, number>();
  const groupsT = target.nets.map(() => 0);
  const distinctU = new Map<string, number>();
  let lost = 0;
  let bad = 0;
  let pen = 0;
  const add = (ti: number, un: string) => {
    const k = `${ti}\u0000${un}`;
    const c = cntTU.get(k) ?? 0;
    if (c === 0) {
      if (groupsT[ti] > 0) lost++;
      groupsT[ti]++;
      const d = distinctU.get(un) ?? 0;
      if (d > 0) bad++;
      distinctU.set(un, d + 1);
    }
    cntTU.set(k, c + 1);
  };
  const remove = (ti: number, un: string) => {
    const k = `${ti}\u0000${un}`;
    const c = cntTU.get(k)!;
    if (c > 1) {
      cntTU.set(k, c - 1);
      return;
    }
    cntTU.delete(k);
    groupsT[ti]--;
    if (groupsT[ti] > 0) lost--;
    const d = distinctU.get(un)! - 1;
    distinctU.set(un, d);
    if (d > 0) bad--;
  };
  const uNet = (up: string) => uNetOf.get(up) ?? `?${up}`;
  /** (target net, user net) pairs a placement fixes; dev-board role pins are resolved at the leaf */
  const placed = (t: CComponent, u: CComponent, perm: Perm): [number, string][] => {
    const out: [number, string][] = [];
    if (isMcu(t.type)) {
      for (const tp of pinsOfT.get(t.ref) ?? []) {
        const f = fixedMcuPin(t.type, u, splitPin(tp)[1]);
        if (f) out.push([tNetOf.get(tp)!, uNet(pinId(u.ref, f))]);
      }
    } else
      for (const [tTerm, uTerm] of Object.entries(perm)) {
        const ti = tNetOf.get(pinId(t.ref, tTerm));
        if (ti !== undefined) out.push([ti, uNet(pinId(u.ref, uTerm))]);
      }
    return out;
  };
  const vpCache = new Map<string, boolean>();
  const hasVP = (t: CComponent, u: CComponent) => {
    const k = `${t.ref}\u0000${u.ref}`;
    if (!vpCache.has(k)) vpCache.set(k, !!valueProblem(t, u, tol));
    return vpCache.get(k)!;
  };
  const classKey = (u: CComponent) =>
    isMcu(u.type)
      ? u.ref
      : `${u.type}|${JSON.stringify(u.props)}|${terminalsOf(u.type)
          .map((x) => uNet(pinId(u.ref, x)))
          .join('|')}`;
  const permsOf = new Map(targets.map((t) => [t.ref, permutations(t.type)]));
  // identical targets (same type, props and nets on every terminal) are interchangeable: they
  // take their user parts in increasing board order
  const tNetsKey = (t: CComponent) =>
    terminalsOf(t.type)
      .map((x) => tNetOf.get(pinId(t.ref, x)) ?? `?${x}`)
      .join('|');
  const twinOf: number[] = targets.map((t, i) => {
    if (isMcu(t.type)) return -1;
    const k = `${t.type}|${JSON.stringify(t.props)}|${tNetsKey(t)}`;
    for (let j = i - 1; j >= 0; j--) if (!isMcu(targets[j].type) && `${targets[j].type}|${JSON.stringify(targets[j].props)}|${tNetsKey(targets[j])}` === k) return j;
    return -1;
  });
  const uIndex = new Map(user.components.map((u, i) => [u.ref, i]));
  const hasMcu = targets.some((t) => isMcu(t.type));

  let best: { score: number; assign: Assign } | null = null;
  const assign: Assign = [];
  const used = new Set<string>();
  let work = 0;
  let aborted = false;
  const optimum = 10 * maxGood;

  const leaf = () => {
    let score: number;
    if (hasMcu) {
      const pm = buildPinMap(assign, targets);
      resolveMcuPins(ctx, pm, mcuPairs(assign, targets));
      const ev = evaluate(ctx, pm);
      score = ev.good * 10 - ev.bad * 10 - pen;
    } else if (assign.some((a) => !a)) {
      // pins of unplaced targets never connect: score from the real pin map
      const ev = evaluate(ctx, buildPinMap(assign, targets));
      score = ev.good * 10 - ev.bad * 10 - pen;
    } else score = 10 * (maxGood - lost) - 10 * bad - pen;
    if (!best || score > best.score) best = { score, assign: [...assign] };
  };

  const dfs = (i: number) => {
    if (aborted) return;
    if (best && (best.score >= optimum || 10 * (maxGood - lost) - 10 * bad - pen <= best.score)) return;
    if (i === targets.length) {
      leaf();
      return;
    }
    const t = targets[i];
    const free = user.components.filter((u) => !used.has(u.ref) && compatible(t, u));
    const twin = twinOf[i] >= 0 ? assign[twinOf[i]] : null;
    const floor = twin ? uIndex.get(twin.u.ref)! : -1;
    const seen = new Set<string>();
    const cands = free.filter((u) => {
      if (uIndex.get(u.ref)! <= floor) return false;
      const k = classKey(u);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    // only the symmetry rule excluded the free parts: an equivalent branch covers this one
    if (cands.length === 0 && free.length > 0) return;
    if (cands.length === 0) {
      assign[i] = null;
      pen += 1000;
      dfs(i + 1);
      pen -= 1000;
      assign.length = i;
      return;
    }
    // every distinct placement, scored, best first
    const opts: { u: CComponent; perm: Perm; pairs: [number, string][]; vp: number; s: number }[] = [];
    for (const u of cands) {
      const vp = hasVP(t, u) ? 1 : 0;
      const nets = new Set<string>();
      for (const perm of permsOf.get(t.ref)!) {
        const pairs = placed(t, u, perm);
        const key = pairs.map((p) => p[1]).join('\u0000');
        if (nets.has(key)) continue;
        nets.add(key);
        for (const [ti, un] of pairs) add(ti, un);
        opts.push({ u, perm, pairs, vp, s: -10 * lost - 10 * bad - vp });
        for (const [ti, un] of pairs) remove(ti, un);
      }
    }
    opts.sort((a, b) => b.s - a.s);
    for (const o of opts) {
      if (++work > budget) {
        aborted = true;
        return;
      }
      used.add(o.u.ref);
      for (const [ti, un] of o.pairs) add(ti, un);
      pen += o.vp;
      assign[i] = { u: o.u, perm: o.perm };
      dfs(i + 1);
      pen -= o.vp;
      for (const [ti, un] of o.pairs) remove(ti, un);
      used.delete(o.u.ref);
      if (aborted || (best && best.score >= optimum)) break;
    }
    assign.length = i;
  };
  dfs(0);
  const b = best as { score: number; assign: Assign } | null;
  return { targets, assign: b?.assign ?? [], complete: !aborted || (b !== null && b.score >= optimum), work };
}

export function checkCircuit(ch: Challenge, board: Circuit, userPinHoles?: Map<string, string[]>, budget = SEARCH_BUDGET): CheckResult {
  const target = ch.target;
  const { circuit: user, collapsed } = checkerView(
    board,
    target.components.some((c) => c.type === 'ammeter'),
  );
  const tNetOf = new Map<string, number>();
  target.nets.forEach((n, i) => n.pins.forEach((p) => tNetOf.set(p, i)));
  const uNetOf = new Map<string, string>();
  user.nets.forEach((n) => n.pins.forEach((p) => uNetOf.set(p, n.name)));
  const ctx: Ctx = { target, user, tNetOf, uNetOf, tol: ch.tolerance };
  const maxGood = target.nets.reduce((s, n) => s + n.pins.length - 1, 0);

  const m = matchComponents(ctx, ch.tolerance, budget);
  const targets = m.targets;
  if (!m.complete)
    return {
      perfect: false,
      undecided: true,
      issues: [
        {
          severity: 'warning',
          title: tr('无法判定：电路太复杂，检查器没能比对完', 'Could not decide: the circuit is too complex for the checker to compare'),
          detail: tr(
            '检查器在限定的计算量内没能确定你的电路和目标电路是否一致——这不代表你的电路是错的。删掉与题目无关的元件和导线后再检查一次。',
            "Within its work limit the checker could not determine whether your circuit matches the target — this does not mean your circuit is wrong. Remove parts and wires that aren't part of the task and check again.",
          ),
          refs: [],
          holes: [],
        },
      ],
      mapping: new Map(),
      pinMap: new Map(),
      progress: 0,
      testsPassed: 0,
      testsTotal: ch.tests.length,
    };

  const finalAssign = m.assign;
  const issues: Issue[] = [];
  const mapping = new Map<string, string>();
  finalAssign.forEach((a, i) => a && mapping.set(targets[i].ref, a.u.ref));
  const holesOf = (userPins: string[]) => (userPinHoles ? userPins.flatMap((p) => userPinHoles.get(p) ?? []) : []);
  const uComp = new Map(user.components.map((c) => [c.ref, c]));
  const tComp = new Map(target.components.map((c) => [c.ref, c]));

  // missing / extra / wrong value
  finalAssign.forEach((a, i) => {
    const t = targets[i];
    if (!a)
      issues.push({
        severity: 'error',
        title: tr(`缺少元件：${describeComponent(t)}`, `Missing part: ${describeComponent(t)}`),
        detail: tr(`题目中的 ${t.ref} 在你的面包板上找不到对应的元件。`, `Nothing on your breadboard matches ${t.ref} from the task.`),
        refs: [],
        holes: [],
      });
    else {
      const vp = valueProblem(t, a.u, ch.tolerance);
      if (vp)
        issues.push({
          severity: 'error',
          title: tr(`元件参数不对：${a.u.ref}`, `Wrong value: ${a.u.ref}`),
          detail: vp + tr('。选中它，在右侧“属性”里修改。', '. Select it and change it under "Properties" on the right.'),
          refs: [a.u.ref],
          holes: [],
        });
    }
  });
  const mappedUsers = new Set(mapping.values());
  const extras = user.components.filter((u) => !mappedUsers.has(u.ref));
  if (!ch.allowExtraComponents)
    for (const u of extras)
      issues.push({
        severity: 'error',
        title: tr(`多出元件：${u.ref}（${describeComponent(u)}）`, `Extra part: ${u.ref} (${describeComponent(u)})`),
        detail: tr('题目的电路里没有这个元件。把它删掉（选中后按 Delete）。', "The task's circuit has no such part. Delete it (select it, then press Delete)."),
        refs: [u.ref],
        holes: [],
      });

  // polarity: would flipping a polarised part make things better?
  let pinMap = buildPinMap(finalAssign, targets);
  resolveMcuPins(ctx, pinMap, mcuPairs(finalAssign, targets));
  let ev = evaluate(ctx, pinMap);
  // dev boards: pin modes that are part of the answer, and pins that can't play their role
  for (const { t, u } of mcuPairs(finalAssign, targets)) {
    for (const [tPin, cfg] of Object.entries(t.props.pins ?? {})) {
      const up = pinMap.get(pinId(t.ref, tPin));
      if (!up) continue;
      const uPin = splitPin(up)[1];
      const have = pinConfig(u.props, uPin);
      const [wantZh, wantEn] = modeName(cfg.mode);
      const [haveZh, haveEn] = modeName(have.mode);
      if (have.mode !== cfg.mode || (cfg.openDrain !== undefined && have.openDrain !== cfg.openDrain && cfg.mode !== 'input'))
        issues.push({
          severity: 'error',
          title: tr(`${u.ref} ${uPin} 的模式不对`, `${u.ref} ${uPin} has the wrong mode`),
          detail: tr(
            `${uPin} 现在是「${haveZh}${have.openDrain ? '（开漏）' : ''}」，题目要求「${wantZh}${cfg.openDrain ? '（开漏）' : ''}」。选中开发板，在右侧属性的引脚表里修改。`,
            `${uPin} is set to "${haveEn}${have.openDrain ? ' (open-drain)' : ''}"; the task needs "${wantEn}${cfg.openDrain ? ' (open-drain)' : ''}". Select the board and change it in the pin table under Properties.`,
          ),
          refs: [u.ref],
          holes: holesOf([up]),
        });
      else if (
        cfg.mode === 'pwm' &&
        ((cfg.duty !== undefined && Math.abs(have.duty - cfg.duty) > 1) || (cfg.frequency !== undefined && Math.abs(have.frequency - cfg.frequency) > cfg.frequency * ch.tolerance))
      )
        issues.push({
          severity: 'error',
          title: tr(`${u.ref} ${uPin} 的 PWM 设置不对`, `${u.ref} ${uPin} has the wrong PWM settings`),
          detail: tr(
            `现在是占空比 ${have.duty}%、${formatSI(have.frequency, 'Hz')}，题目要求${cfg.duty !== undefined ? ` 占空比 ${cfg.duty}%` : ''}${cfg.frequency !== undefined ? ` ${formatSI(cfg.frequency, 'Hz')}` : ''}。`,
            `It is ${have.duty}% duty at ${formatSI(have.frequency, 'Hz')}; the task needs${cfg.duty !== undefined ? ` ${cfg.duty}% duty` : ''}${cfg.frequency !== undefined ? ` ${formatSI(cfg.frequency, 'Hz')}` : ''}.`,
          ),
          refs: [u.ref],
          holes: holesOf([up]),
        });
    }
    // a role pin left unresolved while an incapable pin sits on the right net: name the reason
    for (const [tp, up] of pinMap) {
      if (!tp.startsWith(`${t.ref}.`)) continue;
      const role = parseRole(splitPin(tp)[1]);
      if (!role || splitPin(up)[1] !== splitPin(tp)[1] || !isMcuBoard(u.type)) continue;
      const ti = ctx.tNetOf.get(tp);
      if (ti === undefined) continue;
      const nets = new Set(
        target.nets[ti].pins
          .filter((p) => p !== tp)
          .map((p) => pinMap.get(p) && ctx.uNetOf.get(pinMap.get(p)!))
          .filter(Boolean),
      );
      const wrong = Object.values(MCU_BOARDS[u.type].pins).find(
        (d) => nets.has(ctx.uNetOf.get(pinId(u.ref, d.name)) ?? '-') && (d.kind !== 'gpio' || !d.gpio || !roleMatches(role.role, d.gpio)),
      );
      if (wrong)
        issues.push({
          severity: 'error',
          title: tr(`${u.ref} ${wrong.name} 不能当 ${splitPin(tp)[1]} 用`, `${u.ref} ${wrong.name} can't be used as ${splitPin(tp)[1]}`),
          detail: tr(
            `题目要的是${terminalName(t.type, splitPin(tp)[1])}，而 ${wrong.name}${wrong.kind === 'flash' ? ' 接着板载 Flash' : wrong.gpio && !wrong.gpio.output ? ' 只能输入' : wrong.gpio && role.role === 'ADC' ? (wrong.gpio.adc2 ? ' 是 ADC2（开 Wi-Fi 时不能用）' : ' 没有 ADC') : role.role === 'GPIO_FT' ? ' 不耐 5 V' : role.role === 'PWM' ? ' 没有 PWM' : ' 不是普通 GPIO'}。把线换到另一个引脚。`,
            `The task needs ${terminalName(t.type, splitPin(tp)[1])}, but ${wrong.name}${wrong.kind === 'flash' ? ' is wired to the onboard flash' : wrong.gpio && !wrong.gpio.output ? ' is input-only' : wrong.gpio && role.role === 'ADC' ? (wrong.gpio.adc2 ? ' is ADC2 (unusable with Wi-Fi)' : ' has no ADC') : role.role === 'GPIO_FT' ? ' is not 5 V tolerant' : role.role === 'PWM' ? ' has no PWM' : ' is not a plain GPIO'}. Move the wire to another pin.`,
          ),
          refs: [u.ref],
          holes: holesOf([pinId(u.ref, wrong.name)]),
        });
    }
  }
  // named wiring mistakes (op-amp rotated / inputs swapped), tried on top of every equivalent orientation
  finalAssign.forEach((a, i) => {
    if (!a) return;
    const t = targets[i];
    const mistakes = MISTAKES[t.type];
    if (!mistakes) return;
    let bestAlt: { alt: Map<string, string>; ea: ReturnType<typeof evaluate>; mk: (typeof mistakes)[number] } | null = null;
    for (const mk of mistakes)
      for (const perm of permutations(t.type)) {
        const alt = new Map(pinMap);
        for (const tTerm of terminalsOf(t.type)) alt.set(pinId(t.ref, tTerm), pinId(a.u.ref, mk.swap[perm[tTerm]] ?? perm[tTerm]));
        const ea = evaluate(ctx, alt);
        if (ea.good - ea.bad > (bestAlt ? bestAlt.ea.good - bestAlt.ea.bad : ev.good - ev.bad) && ea.bad <= ev.bad) bestAlt = { alt, ea, mk };
      }
    if (bestAlt) {
      const { mk } = bestAlt;
      const posFb = t.type === 'opamp' && feedsPlus(ctx, t.ref);
      issues.push({
        severity: 'error',
        title: tr(`${a.u.ref}${mk.title[0]}`, `${a.u.ref}${mk.title[1]}`),
        detail: tr(mk.zh(a.u.ref, posFb), mk.en(a.u.ref, posFb)),
        refs: [a.u.ref],
        holes: holesOf(terminalsOf(a.u.type).map((x) => pinId(a.u.ref, x))),
      });
      pinMap = bestAlt.alt;
      ev = bestAlt.ea;
    }
  });
  finalAssign.forEach((a, i) => {
    if (!a) return;
    const t = targets[i];
    if (MISTAKES[t.type]) return;
    const pol = t.type === 'led' || t.type === 'diode' || isPower(t.type) || t.type === 'ammeter' || t.type === 'function_gen' || t.type === 'buzzer';
    if (!pol) return;
    const [p1, p2] = terminalsOf(t.type);
    const flipped = new Map(pinMap);
    flipped.set(pinId(t.ref, p1), pinMap.get(pinId(t.ref, p2))!);
    flipped.set(pinId(t.ref, p2), pinMap.get(pinId(t.ref, p1))!);
    const ef = evaluate(ctx, flipped);
    if (ef.good - ef.bad > ev.good - ev.bad && ef.bad <= ev.bad) {
      const u = a.u;
      issues.push({
        severity: 'error',
        title: tr(`${u.ref} 接反了`, `${u.ref} is backwards`),
        detail:
          u.type === 'led'
            ? tr(
                `${u.ref} 的长脚（正极）应该朝向电源 + 那一侧，短脚（负极）朝向 GND。把它的两只脚对调。`,
                `${u.ref}'s long leg (anode) should face the + supply side and the short leg (cathode) GND. Swap its two legs.`,
              )
            : u.type === 'ammeter'
              ? tr(
                  `${u.ref} 的表笔接反了：电流应该从红表笔（+）流进、从黑表笔（COM）流出，否则读数是负的。`,
                  `${u.ref}'s leads are swapped: current should flow in at the red lead (+) and out at the black lead (COM), otherwise the reading is negative.`,
                )
              : u.type === 'function_gen'
                ? tr(
                    `${u.ref} 的红夹子（信号）和黑夹子（COM）接反了：黑夹子应该接 GND。`,
                    `${u.ref}'s red (signal) and black (COM) clips are swapped: the black clip belongs on GND.`,
                  )
                : isPower(u.type)
                  ? tr(
                      `${u.ref} 的 + 和 − 接反了：红线应接到原理图中电源 + 的那个结点。`,
                      `${u.ref}'s + and − are swapped: the red lead belongs on the node that the supply's + connects to in the schematic.`,
                    )
                  : u.type === 'buzzer'
                    ? tr(`${u.ref} 接反了：长脚（+）接电源正。`, `${u.ref} is backwards: the long leg (+) goes to the supply.`)
                    : tr(`${u.ref} 的方向反了（色环一端是负极）。`, `${u.ref} is the wrong way round (the banded end is the cathode).`),
        refs: [u.ref],
        holes: holesOf([pinId(u.ref, p1), pinId(u.ref, p2)]),
      });
      pinMap = flipped;
      ev = ef;
    }
  });

  const label = (userPin: string) => {
    const [ref, pin] = splitPin(userPin);
    return terminalLabel(uComp.get(ref)!, pin);
  };
  const tNetLabel = (ti: number) => {
    const name = target.nets[ti].name;
    return /^N\d+$/.test(name) ? '' : tr(`（原理图中的 ${name}）`, ` (${name} in the schematic)`);
  };

  // broken connections
  ev.groupsPerT.forEach((groups, ti) => {
    if (groups.size <= 1) return;
    const parts = [...groups.values()].map((tps) => tps.map((tp) => label(pinMap.get(tp)!)));
    const userPins = [...groups.values()].flat().map((tp) => pinMap.get(tp)!);
    issues.push({
      severity: 'error',
      title: tr(`断开了：这些引脚应该连在一起${tNetLabel(ti)}`, `Not connected: these pins should be joined${tNetLabel(ti)}`),
      detail:
        parts.map((g, k) => tr(`第${k + 1}组：${g.join('、')}`, `Group ${k + 1}: ${g.join(', ')}`)).join('\n') +
        tr(
          `\n→ 它们现在分属 ${groups.size} 个互不相通的结点。用跳线或把脚插进同一列把它们接通。`,
          `\n→ They are now on ${groups.size} separate nodes. Join them with a jumper wire, or put the legs in the same column.`,
        ),
      refs: [...new Set(userPins.map((p) => splitPin(p)[0]))],
      holes: holesOf(userPins),
    });
  });

  // wrong extra connections
  for (const [un, m] of ev.tNetsPerU) {
    if (m.size <= 1) continue;
    const userPins = [...m.values()].flat().map((tp) => pinMap.get(tp)!);
    const isSourceShort =
      [...m.values()].some((tps) => tps.some((tp) => isPower(tComp.get(splitPin(tp)[0])!.type) && splitPin(tp)[1] === '+')) &&
      [...m.values()].some((tps) => tps.some((tp) => isPower(tComp.get(splitPin(tp)[0])!.type) && splitPin(tp)[1] === '-'));
    issues.push({
      severity: 'error',
      title: isSourceShort
        ? tr('短路：电源的 + 和 − 被连到了同一个结点', "Short circuit: the supply's + and − are on the same node")
        : tr('多连了：这些引脚不应该连在一起', "Extra connection: these pins shouldn't be joined"),
      detail:
        [...m.entries()]
          .map(([ti, tps], k) => {
            const pins = tps.map((tp) => label(pinMap.get(tp)!));
            return tr(`第${k + 1}组${tNetLabel(ti)}：${pins.join('、')}`, `Group ${k + 1}${tNetLabel(ti)}: ${pins.join(', ')}`);
          })
          .join('\n') +
        tr(
          `\n→ 它们现在都在同一个结点（${un}）上。检查是否插错了列，或多了一根跳线。`,
          `\n→ They are all on one node (${un}) now. Check for a leg in the wrong column or an extra jumper.`,
        ) +
        (collapsed.has(un)
          ? tr(
              `\n→ 注意：电流表 ${collapsed.get(un)!.join('、')} 的内阻几乎为零，相当于一根导线。它把这些点连在了一起——电流表要串联在断开处，不能并联在元件两端。`,
              `\n→ Note: ammeter ${collapsed.get(un)!.join(', ')} has almost zero resistance — it acts like a wire and joins these points. An ammeter goes in series (in a break in the circuit), never across a part.`,
            )
          : ''),
      refs: [...new Set([...userPins.map((p) => splitPin(p)[0]), ...(collapsed.get(un) ?? [])])],
      holes: holesOf(userPins),
    });
  }

  // behaviour tests (only meaningful when topology is right)
  let testsPassed = 0;
  const topologyOk = issues.length === 0;
  if (topologyOk)
    for (const test of ch.tests) {
      const fail = runTest(test, user, mapping, pinMap);
      if (fail) issues.push({ severity: 'error', title: tr(`测试失败：${test.name}`, `Test failed: ${test.name}`), detail: fail, refs: [], holes: [] });
      else testsPassed++;
    }

  // an ammeter in parallel with a part (or across the supply): say so first, by name
  if (issues.length) issues.unshift(...ammeterBypassIssues(board, userPinHoles, 'error'));

  const progress = maxGood === 0 ? 1 : Math.max(0, (ev.good - ev.bad) / maxGood);
  return {
    perfect: issues.length === 0,
    issues,
    mapping,
    pinMap,
    progress,
    testsPassed,
    testsTotal: ch.tests.length,
  };
}

export function applySet(circuit: Circuit, set: Record<string, Partial<CComponent['props']>>, mapping?: Map<string, string>, pinMap?: Map<string, string>): Circuit {
  return {
    nets: circuit.nets,
    components: circuit.components.map((c) => {
      const tRef = mapping ? [...mapping.entries()].find(([, u]) => u === c.ref)?.[0] : c.ref;
      const s = tRef ? set[tRef] : undefined;
      if (!tRef || !s) return c;
      const p = { ...s };
      // dev boards: pin names in the task (logical roles) -> the user's physical pins, merged
      if (p.pins && isMcu(c.type)) {
        const pins = { ...(c.props.pins ?? {}) };
        for (const [tp, cfg] of Object.entries(p.pins)) {
          const up = pinMap?.get(pinId(tRef, tp));
          pins[up ? splitPin(up)[1] : tp] = { ...cfg };
        }
        p.pins = pins;
      }
      // the matcher may have mirrored a symmetric part: translate settings to the user's orientation
      if (pinMap && p.position && c.type === 'switch' && pinMap.get(pinId(tRef, p.position)) !== pinId(c.ref, p.position)) p.position = p.position === 'a' ? 'b' : 'a';
      if (pinMap && p.wiper !== undefined && c.type === 'potentiometer' && pinMap.get(pinId(tRef, '1')) === pinId(c.ref, '3')) p.wiper = 1 - p.wiper;
      return { ...c, props: { ...c.props, ...p } };
    }),
  };
}

const MEASURE_NAME: Record<Measure, [string, string]> = {
  vpp: ['峰峰值 Vpp', 'peak-to-peak (Vpp)'],
  vmax: ['最大值', 'maximum'],
  vmin: ['最小值', 'minimum'],
  vavg: ['平均值', 'average'],
  vrms: ['有效值 RMS', 'RMS'],
  freq: ['频率', 'frequency'],
  phase: ['相位差', 'phase difference'],
  gain: ['幅度比（增益）', 'amplitude ratio (gain)'],
  rise: ['上升时间（10%→90%）', 'rise time (10%→90%)'],
  fall: ['下降时间（90%→10%）', 'fall time (90%→10%)'],
};

function fmtMeasure(kind: Measure, v: number): string {
  if (kind === 'freq') return formatSI(v, 'Hz');
  if (kind === 'phase') return `${v.toFixed(1)}°`;
  if (kind === 'gain') return `${+v.toPrecision(3)}×`;
  if (kind === 'rise' || kind === 'fall') return formatSI(v, 's');
  return volts(v);
}

const range = (min: number | undefined, max: number | undefined, f: (v: number) => string) =>
  tr(`${min !== undefined ? f(min) : '-∞'} ~ ${max !== undefined ? f(max) : '∞'}`, `${min !== undefined ? f(min) : '-∞'} and ${max !== undefined ? f(max) : '∞'}`);

/** A test's / measurement question's `set` in words ("SW1 is pressed and RV1 is turned to 22%"),
 *  naming the student's parts (target refs mapped). Empty string for no settings. */
export function describeSet(set: Record<string, Partial<CComponent['props']>>, mapping?: Map<string, string>, pinMap?: Map<string, string>): string {
  return Object.entries(set)
    .map(([ref, p]) => {
      const u = mapping?.get(ref) ?? ref;
      if (p.pressed !== undefined) return p.pressed ? tr(`按下 ${u}`, `${u} is pressed`) : tr(`松开 ${u}`, `${u} is released`);
      if (p.position) return tr(`把 ${u} 拨到 ${p.position} 侧`, `${u} is switched to side ${p.position}`);
      if (p.wiper !== undefined) return tr(`把 ${u} 旋到 ${Math.round(p.wiper * 100)}%`, `${u} is turned to ${Math.round(p.wiper * 100)}%`);
      if (p.frequency !== undefined || p.amplitude !== undefined || p.waveform !== undefined || p.offset !== undefined)
        return tr(`${u} 设为 ${describeComponent({ type: 'function_gen', props: p })}`, `${u} is set to ${describeComponent({ type: 'function_gen', props: p })}`);
      const parts: string[] = [];
      if (p.usb !== undefined) parts.push(p.usb ? tr(`${u} 插上 USB`, `${u} is on USB`) : tr(`${u} 拔掉 USB`, `${u} is off USB`));
      for (const [tp, cfg] of Object.entries(p.pins ?? {})) {
        const up = pinMap?.get(pinId(ref, tp));
        const name = up ? splitPin(up)[1] : tp;
        const [zh, en] = modeName(cfg.mode);
        const pwm = cfg.mode === 'pwm' ? ` ${cfg.duty ?? 50}%` : '';
        parts.push(tr(`${u} ${name} 设为${zh}${pwm}`, `${u} ${name} is ${en}${pwm}`));
      }
      if (p.lux !== undefined) parts.push(tr(`${u} 的光照为 ${p.lux} lux`, `${u} sees ${p.lux} lux`));
      if (p.temperature !== undefined) parts.push(tr(`${u} 的温度为 ${p.temperature} °C`, `${u} is at ${p.temperature} °C`));
      if (p.voltage !== undefined) parts.push(tr(`${u} 设为 ${p.voltage} V`, `${u} is set to ${p.voltage} V`));
      if (p.currentLimit !== undefined) parts.push(tr(`${u} 限流 ${formatSI(Number(p.currentLimit), 'A')}`, `${u} current limit ${formatSI(Number(p.currentLimit), 'A')}`));
      if (p.resistance !== undefined) parts.push(tr(`${u} 换成 ${formatSI(Number(p.resistance), 'Ω')}`, `${u} is ${formatSI(Number(p.resistance), 'Ω')}`));
      if (p.model !== undefined) parts.push(tr(`${u} 换成 ${p.model}`, `${u} is a ${p.model}`));
      if (p.beta !== undefined) parts.push(tr(`${u} 的 β = ${p.beta}`, `${u} has β = ${p.beta}`));
      if (parts.length) return parts.join(tr('、', ' and '));
      return u;
    })
    .join(tr('、', ' and '));
}

/** What the instruments read on a circuit (the student's board, or a target) with `set` applied.
 *  Every reading takes TARGET refs / pins and maps them to the board through mapping / pinMap.
 *  This is the one place readings are taken: behaviour tests (runTest) and measurement
 *  questions (readings.ts) both use it. */
export interface BoardProbe {
  /** the circuit with `set` applied (user refs) */
  circuit: Circuit;
  /** time-domain simulation needed (function generator / PWM) */
  gen: boolean;
  sim: SimResult;
  tran(): TransientResult;
  /** voltage V(pin) − V(ref) (ref omitted = GND): DC operating point, or the steady-state average with a generator */
  voltage(pin: string, ref?: string): number;
  /** current through a part in the target's direction: average ("dc") or true RMS */
  current(el: string, mode?: 'dc' | 'rms'): number;
  /** oscilloscope measurement (see transient.ts Measure) */
  scope(kind: Measure, pin: string, ref?: string, vs?: string, vsref?: string): number;
  /** the user's ref / pin for a target ref / pin */
  ref(tRef: string): string;
  pin(tPin: string): string;
}

export function probeBoard(circuit: Circuit, set: Record<string, Partial<CComponent['props']>>, mapping?: Map<string, string>, pinMap?: Map<string, string>): BoardProbe {
  const c = applySet(circuit, set, mapping, pinMap);
  const gen = hasGenerator(c);
  const sim = simulate(c);
  let trc: TransientResult | null = null;
  const tran = () => (trc ??= simulateTransient(c));
  const mapPin = (p: string) => pinMap?.get(p) ?? p;
  const mapRef = (r: string) => mapping?.get(r) ?? r;
  const netOf = new Map<string, string>();
  c.nets.forEach((n) => n.pins.forEach((p) => netOf.set(p, n.name)));
  return {
    circuit: c,
    gen,
    sim,
    tran,
    ref: mapRef,
    pin: mapPin,
    voltage(pin, ref) {
      const p = mapPin(pin);
      const r = ref ? mapPin(ref) : undefined;
      if (gen) return tran().measure('vavg', p, r);
      const vp = sim.nodeV.get(netOf.get(p) ?? '') ?? 0;
      const vr = r ? (sim.nodeV.get(netOf.get(r) ?? '') ?? 0) : 0;
      return vp - vr;
    },
    current(el, mode = 'dc') {
      const u = mapRef(el);
      const comp = c.components.find((x) => x.ref === u);
      // the matcher may have mirrored a non-polarised part: keep the target's direction
      const first = comp ? terminalsOf(comp.type)[0] : '';
      const sign = pinMap && comp && pinMap.get(pinId(el, first)) !== undefined && pinMap.get(pinId(el, first)) !== pinId(u, first) ? -1 : 1;
      const dcOnly = comp && (comp.type === 'npn' || comp.type === 'nmos' || comp.type === 'ldo');
      if ((gen || mode === 'rms') && !dcOnly) {
        const i = tran().current(u);
        return i ? (mode === 'rms' ? vrms(i) : sign * vavg(i)) : 0;
      }
      return sign * (sim.current.get(u) ?? 0);
    },
    scope(kind, pin, ref, vs, vsref) {
      return tran().measure(kind, mapPin(pin), ref ? mapPin(ref) : undefined, vs ? mapPin(vs) : undefined, vsref ? mapPin(vsref) : undefined);
    },
  };
}

/**
 * Returns null on success or a human message describing the failure.
 * Without a function generator everything is a DC operating point. With a generator the
 * circuit is simulated in the time domain (transient.ts) and DMM-style checks read the
 * steady-state AVERAGE: `voltages` = average voltage, `currents` (mode "dc") = average current,
 * LED "on" = average current > 0.5 mA. `scope` tests always use the time-domain result.
 */
export function runTest(test: ChallengeTest, circuit: Circuit, mapping?: Map<string, string>, pinMap?: Map<string, string>): string | null {
  const probe = probeBoard(circuit, test.set, mapping, pinMap);
  const { circuit: c, gen, sim, tran } = probe;
  const scope = test.scope ?? [];
  const currents = test.currents ?? [];
  const setDesc = describeSet(test.set, mapping, pinMap);
  const prefix = setDesc ? tr(`当${setDesc}时，`, `When ${setDesc}, `) : '';
  const mapPin = (p: string) => pinMap?.get(p) ?? p;
  for (const [tRef, want] of Object.entries(test.expect)) {
    const u = mapping?.get(tRef) ?? tRef;
    const type = c.components.find((x) => x.ref === u)?.type;
    let on: boolean;
    let words: [string, string, string, string] = ['亮', '灭', 'on', 'off'];
    if (type === 'relay') {
      on = (gen ? (tran().relays.get(u)?.onFraction ?? 0) > 0.5 : sim.relays.get(u)?.energized) ?? false;
      words = ['吸合', '释放', 'energised', 'released'];
    } else if (type === 'motor') {
      on = (gen ? tran().motors.get(u)?.running : sim.motors.get(u)?.running) ?? false;
      words = ['转动', '停止', 'running', 'stopped'];
    } else if (type === 'buzzer') {
      on = (gen ? tran().buzzers.get(u)?.on : sim.buzzers.get(u)?.on) ?? false;
      words = ['响', '不响', 'sounding', 'silent'];
    } else on = (gen ? tran().leds.get(u)?.on : sim.leds.get(u)?.on) ?? false;
    if ((want === 'on') !== on)
      return tr(
        `${prefix}${u} 应该${want === 'on' ? words[0] : words[1]}，但实际是${on ? words[0] : words[1]}的。`,
        `${prefix}${u} should be ${want === 'on' ? words[2] : words[3]}, but it is ${on ? words[2] : words[3]}.`,
      );
  }
  for (const [tRef, want] of Object.entries(test.regions ?? {})) {
    const u = mapping?.get(tRef) ?? tRef;
    const got = sim.bjts.get(u)?.region ?? sim.mosfets.get(u)?.region;
    if (got !== want) {
      const zh: Record<string, string> = { cutoff: '截止区', active: '放大区', saturation: '饱和区', off: '截止', ohmic: '可变电阻区（完全导通）' };
      const en: Record<string, string> = { cutoff: 'cut-off', active: 'the active region', saturation: 'saturation', off: 'off', ohmic: 'the ohmic region (fully on)' };
      const satZh = sim.mosfets.has(u) ? '恒流（饱和）区' : '饱和区';
      const nameZh = (r?: string) => (r === 'saturation' ? satZh : (zh[r ?? ''] ?? '?'));
      return tr(`${prefix}${u} 应该工作在${nameZh(want)}，实际在${nameZh(got)}。`, `${prefix}${u} should be in ${en[want]}, but it is in ${en[got ?? ''] ?? '?'}.`);
    }
  }
  for (const g of test.gpio ?? []) {
    const up = mapPin(g.pin);
    const [uRef, uPin] = splitPin(up);
    const st = sim.mcus.get(uRef)?.pins.get(uPin);
    if (!st) return tr(`${prefix}找不到引脚 ${up}。`, `${prefix}there is no pin ${up}.`);
    if (g.read) {
      const got = st.logic;
      if (got !== g.read) {
        const zh: Record<string, string> = { high: '高电平（1）', low: '低电平（0）', floating: '浮空（不确定）', undefined: '不确定（在 VIL 和 VIH 之间）' };
        const en: Record<string, string> = { high: 'HIGH (1)', low: 'LOW (0)', floating: 'floating (undefined)', undefined: 'undefined (between VIL and VIH)' };
        return tr(
          `${prefix}${uRef} ${uPin} 应该读到${zh[g.read]}，实际读到${zh[got]}（${volts(st.vLocal)}）。`,
          `${prefix}${uRef} ${uPin} should read ${en[g.read]}, but it reads ${en[got]} (${volts(st.vLocal)}).`,
        );
      }
    }
    if (g.measure) {
      const gndPin = pinId(uRef, 'GND');
      let val: number;
      let f: (v: number) => string = volts;
      let what: [string, string];
      switch (g.measure) {
        case 'voltage':
          val = gen ? tran().measure('vavg', up, gndPin) : st.vLocal;
          what = ['电压', 'voltage'];
          break;
        case 'current': {
          const tr2 = gen ? tran().pinCurrent(up) : null;
          val = tr2 ? vavg(tr2) : st.current;
          f = amps;
          what = ['输出电流', 'output current'];
          break;
        }
        case 'adc':
          val = st.adc?.raw ?? 0;
          f = (v) => String(Math.round(v));
          what = ['ADC 读数', 'ADC reading'];
          break;
        case 'adc_v':
          val = st.adc?.volts ?? 0;
          what = ['ADC 电压', 'ADC voltage'];
          break;
      }
      if ((g.min !== undefined && val < g.min) || (g.max !== undefined && val > g.max))
        return tr(
          `${prefix}${uRef} ${uPin} 的${what[0]}是 ${f(val)}，应在 ${range(g.min, g.max, f)} 之间。`,
          `${prefix}the ${what[1]} of ${uRef} ${uPin} is ${f(val)}; it should be between ${range(g.min, g.max, f)}.`,
        );
    }
  }
  for (const v of test.voltages) {
    const p = mapPin(v.pin);
    const r = v.ref ? mapPin(v.ref) : null;
    const val = probe.voltage(v.pin, v.ref);
    if ((v.min !== undefined && val < v.min) || (v.max !== undefined && val > v.max))
      return tr(
        `${prefix}${p}${r ? ` 相对 ${r}` : ''} 的${gen ? '平均' : ''}电压是 ${volts(val)}，应在 ${v.min ?? '-∞'} ~ ${v.max ?? '∞'} V 之间。`,
        `${prefix}the ${gen ? 'average ' : ''}voltage at ${p}${r ? ` relative to ${r}` : ''} is ${volts(val)}; it should be between ${v.min ?? '-∞'} and ${v.max ?? '∞'} V.`,
      );
  }
  for (const it of currents) {
    const u = mapping?.get(it.el) ?? it.el;
    const comp = c.components.find((x) => x.ref === u);
    const val = probe.current(it.el, it.mode);
    if ((it.min !== undefined && val < it.min) || (it.max !== undefined && val > it.max)) {
      const what = comp?.type === 'ammeter' ? tr(`电流表 ${u} 的读数`, `ammeter ${u} reads`) : tr(`流过 ${u} 的电流`, `the current through ${u} is`);
      const mode = it.mode === 'rms' ? ' (RMS)' : gen ? tr('（平均）', ' (average)') : '';
      return tr(
        `${prefix}${what}${mode}是 ${amps(val)}，应在 ${range(it.min, it.max, amps)} 之间。`,
        `${prefix}${what}${mode} ${amps(val)}; it should be between ${range(it.min, it.max, amps)}.`,
      );
    }
  }
  for (const sc of scope) {
    const p = mapPin(sc.pin);
    const r = sc.ref ? mapPin(sc.ref) : undefined;
    const vs = sc.vs ? mapPin(sc.vs) : undefined;
    const vsr = sc.vsref ? mapPin(sc.vsref) : undefined;
    const val = probe.scope(sc.measure, sc.pin, sc.ref, sc.vs, sc.vsref);
    if ((sc.min !== undefined && val < sc.min) || (sc.max !== undefined && val > sc.max)) {
      const [zh, en] = MEASURE_NAME[sc.measure];
      const f = (x: number) => fmtMeasure(sc.measure, x);
      return tr(
        `${prefix}示波器上 ${p}${r ? `（相对 ${r}）` : ''}的${zh}${vs ? `（对比 ${vs}${vsr ? ` 相对 ${vsr}` : ''}）` : ''}是 ${f(val)}，应在 ${range(sc.min, sc.max, f)} 之间。`,
        `${prefix}on the scope, the ${en} of ${p}${r ? ` (relative to ${r})` : ''}${vs ? ` vs ${vs}${vsr ? ` (relative to ${vsr})` : ''}` : ''} is ${f(val)}; it should be between ${range(sc.min, sc.max, f)}.`,
      );
    }
  }
  return null;
}
