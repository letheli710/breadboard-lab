// Compare the user's circuit with a challenge's target circuit.
// Matching is topological: breadboard positions don't matter, only which terminals
// end up electrically connected. We search for the component correspondence
// (target ref -> user ref, plus pin orientation for non-polarised parts) that best
// explains the user's wiring, then describe what differs.

import { tr } from './i18n';
import type { Challenge, ChallengeTest } from './challenge';
import type { Issue } from './diagnostics';
import { BATTERIES, describeComponent, genSettings, isPower, pinPermutations, sourceVoltage, terminalLabel, terminalsOf } from './parts';
import { simulate } from './solver';
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
const MISTAKES: Partial<Record<CComponent['type'], { swap: Record<string, string>; zh: (r: string) => string; en: (r: string) => string; title: [string, string] }[]>> = {
  opamp: [
    {
      swap: { outA: 'inB+', 'inB+': 'outA', 'inA-': 'inB-', 'inB-': 'inA-', 'inA+': 'outB', outB: 'inA+', 'v-': 'v+', 'v+': 'v-' },
      title: [' 插反了（转了 180°）', ' is rotated 180°'],
      zh: (r) => `${r} 的 1 脚应该在缺口 / 小圆点旁边，1–4 脚在 e 行（从左到右），8–5 脚在 f 行。现在芯片转了半圈：电源脚接反会烧坏真实的芯片。`,
      en: (r) => `${r}'s pin 1 is next to the notch / dot: pins 1–4 run left to right in row e, pins 8–5 in row f. The chip is turned around — with its supply pins reversed a real chip would burn.`,
    },
    {
      swap: { 'inA-': 'inA+', 'inA+': 'inA-', 'inB-': 'inB+', 'inB+': 'inB-' },
      title: [' 的 + 和 − 输入接反了', "'s + and − inputs are swapped"],
      zh: (r) => `${r} 的反相输入（IN−）和同相输入（IN+）对调了。反馈必须接到 IN−（负反馈）；接到 IN+ 会变成正反馈，输出直接撞到电源轨。`,
      en: (r) => `${r}'s inverting (IN−) and non-inverting (IN+) inputs are swapped. Feedback must go to IN− (negative feedback); feeding IN+ makes positive feedback and the output slams into a rail.`,
    },
  ],
};

function compatible(t: CComponent, u: CComponent): boolean {
  if (t.type === 'dc_source') return isPower(u.type);
  return t.type === u.type;
}

function valueProblem(t: CComponent, u: CComponent, tol: number): string | null {
  const close = (a: number, b: number) => Math.abs(a - b) <= Math.abs(b) * tol + 1e-12;
  const tp = t.props;
  const up = u.props;
  if ((t.type === 'resistor' || t.type === 'potentiometer') && tp.resistance !== undefined && !close(up.resistance ?? 0, tp.resistance))
    return tr(`${u.ref} 是 ${describeComponent(u)}，题目要求 ${describeComponent(t)}`, `${u.ref} is a ${describeComponent(u)}; the task needs a ${describeComponent(t)}`);
  if (t.type === 'led' && tp.color && up.color !== tp.color) return tr(`${u.ref} 是${describeComponent(u)}，题目要求${describeComponent(t)}`, `${u.ref} is a ${describeComponent(u)}; the task needs a ${describeComponent(t)}`);
  if (t.type === 'capacitor' && tp.capacitance !== undefined && !close(up.capacitance ?? 0, tp.capacitance))
    return tr(`${u.ref} 的电容值和题目不一致`, `${u.ref} has a different capacitance from the task`);
  if (t.type === 'battery' && tp.variant && up.variant !== tp.variant)
    return tr(
      `${u.ref} 是 ${BATTERIES[up.variant ?? '9V'].name}，题目要求 ${BATTERIES[tp.variant].name}`,
      `${u.ref} is a ${BATTERIES[up.variant ?? '9V'].name}; the task needs a ${BATTERIES[tp.variant].name}`,
    );
  if (isPower(t.type) && tp.voltage !== undefined && !close(sourceVoltage(u), tp.voltage))
    return tr(`${u.ref} 输出 ${sourceVoltage(u)} V，题目要求 ${tp.voltage} V`, `${u.ref} outputs ${sourceVoltage(u)} V; the task needs ${tp.voltage} V`);
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

function buildPinMap(assign: (null | { u: CComponent; perm: Perm })[], targets: CComponent[]) {
  const pm = new Map<string, string>();
  assign.forEach((a, i) => {
    if (!a) return;
    for (const [tTerm, uTerm] of Object.entries(a.perm)) pm.set(pinId(targets[i].ref, tTerm), pinId(a.u.ref, uTerm));
  });
  return pm;
}

export function checkCircuit(ch: Challenge, board: Circuit, userPinHoles?: Map<string, string[]>): CheckResult {
  const target = ch.target;
  const { circuit: user, collapsed } = checkerView(board, target.components.some((c) => c.type === 'ammeter'));
  const tNetOf = new Map<string, number>();
  target.nets.forEach((n, i) => n.pins.forEach((p) => tNetOf.set(p, i)));
  const uNetOf = new Map<string, string>();
  user.nets.forEach((n) => n.pins.forEach((p) => uNetOf.set(p, n.name)));
  const ctx: Ctx = { target, user, tNetOf, uNetOf, tol: ch.tolerance };
  const maxGood = target.nets.reduce((s, n) => s + n.pins.length - 1, 0);

  // order targets: fewest candidates first
  const targets = [...target.components].sort(
    (a, b) => user.components.filter((u) => compatible(a, u)).length - user.components.filter((u) => compatible(b, u)).length,
  );
  const permsOf = new Map(targets.map((t) => [t.ref, permutations(t.type)]));

  let best: { score: number; assign: (null | { u: CComponent; perm: Perm })[] } | null = null;
  const assign: (null | { u: CComponent; perm: Perm })[] = [];
  const used = new Set<string>();
  let leaves = 0;
  const LIMIT = 150000;

  const dfs = (i: number) => {
    if (leaves > LIMIT) return;
    if (i === targets.length) {
      leaves++;
      const pm = buildPinMap(assign, targets);
      const { good, bad } = evaluate(ctx, pm);
      let score = good * 10 - bad * 10;
      assign.forEach((a, k) => {
        if (!a) score -= 1000;
        else if (valueProblem(targets[k], a.u, ch.tolerance)) score -= 1;
      });
      if (!best || score > best.score) best = { score, assign: [...assign] };
      return;
    }
    const t = targets[i];
    const cands = user.components
      .filter((u) => !used.has(u.ref) && compatible(t, u))
      .sort((a, b) => Number(!!valueProblem(t, a, ch.tolerance)) - Number(!!valueProblem(t, b, ch.tolerance)));
    if (cands.length === 0) {
      assign[i] = null;
      dfs(i + 1);
      return;
    }
    for (const u of cands) {
      used.add(u.ref);
      for (const perm of permsOf.get(t.ref)!) {
        assign[i] = { u, perm };
        dfs(i + 1);
      }
      used.delete(u.ref);
    }
    assign.length = i;
  };
  dfs(0);

  const finalAssign = (best as { assign: (null | { u: CComponent; perm: Perm })[] } | null)?.assign ?? [];
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
  let ev = evaluate(ctx, pinMap);
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
      issues.push({
        severity: 'error',
        title: tr(`${a.u.ref}${mk.title[0]}`, `${a.u.ref}${mk.title[1]}`),
        detail: tr(mk.zh(a.u.ref), mk.en(a.u.ref)),
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
    const pol = t.type === 'led' || t.type === 'diode' || isPower(t.type) || t.type === 'ammeter' || t.type === 'function_gen';
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
                  `${u.ref} 的 + 和 − 接反了：红线应接到原理图中电源 + 的那个节点。`,
                  `${u.ref}'s + and − are swapped: the red lead belongs on the node that the supply's + connects to in the schematic.`,
                )
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
          `\n→ 它们现在分属 ${groups.size} 个互不相通的节点。用跳线或把脚插进同一列把它们接通。`,
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
    const isSourceShort = [...m.values()].some((tps) => tps.some((tp) => isPower(tComp.get(splitPin(tp)[0])!.type) && splitPin(tp)[1] === '+')) &&
      [...m.values()].some((tps) => tps.some((tp) => isPower(tComp.get(splitPin(tp)[0])!.type) && splitPin(tp)[1] === '-'));
    issues.push({
      severity: 'error',
      title: isSourceShort
        ? tr('短路：电源的 + 和 − 被连到了同一个节点', "Short circuit: the supply's + and − are on the same node")
        : tr('多连了：这些引脚不应该连在一起', "Extra connection: these pins shouldn't be joined"),
      detail:
        [...m.entries()]
          .map(([ti, tps], k) => {
            const pins = tps.map((tp) => label(pinMap.get(tp)!));
            return tr(`第${k + 1}组${tNetLabel(ti)}：${pins.join('、')}`, `Group ${k + 1}${tNetLabel(ti)}: ${pins.join(', ')}`);
          })
          .join('\n') +
        tr(`\n→ 它们现在都在同一个节点（${un}）上。检查是否插错了列，或多了一根跳线。`, `\n→ They are all on one node (${un}) now. Check for a leg in the wrong column or an extra jumper.`) +
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

export function applySet(
  circuit: Circuit,
  set: Record<string, Partial<CComponent['props']>>,
  mapping?: Map<string, string>,
  pinMap?: Map<string, string>,
): Circuit {
  return {
    nets: circuit.nets,
    components: circuit.components.map((c) => {
      const tRef = mapping ? [...mapping.entries()].find(([, u]) => u === c.ref)?.[0] : c.ref;
      const s = tRef ? set[tRef] : undefined;
      if (!tRef || !s) return c;
      const p = { ...s };
      // the matcher may have mirrored a symmetric part: translate settings to the user's orientation
      if (pinMap && p.position && c.type === 'switch' && pinMap.get(pinId(tRef, p.position)) !== pinId(c.ref, p.position))
        p.position = p.position === 'a' ? 'b' : 'a';
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
};

function fmtMeasure(kind: Measure, v: number): string {
  if (kind === 'freq') return formatSI(v, 'Hz');
  if (kind === 'phase') return `${v.toFixed(1)}°`;
  if (kind === 'gain') return `${+v.toPrecision(3)}×`;
  return volts(v);
}

const range = (min: number | undefined, max: number | undefined, f: (v: number) => string) =>
  tr(`${min !== undefined ? f(min) : '-∞'} ~ ${max !== undefined ? f(max) : '∞'}`, `${min !== undefined ? f(min) : '-∞'} and ${max !== undefined ? f(max) : '∞'}`);

/**
 * Returns null on success or a human message describing the failure.
 * Without a function generator everything is a DC operating point. With a generator the
 * circuit is simulated in the time domain (transient.ts) and DMM-style checks read the
 * steady-state AVERAGE: `voltages` = average voltage, `currents` (mode "dc") = average current,
 * LED "on" = average current > 0.5 mA. `scope` tests always use the time-domain result.
 */
export function runTest(test: ChallengeTest, circuit: Circuit, mapping?: Map<string, string>, pinMap?: Map<string, string>): string | null {
  const c = applySet(circuit, test.set, mapping, pinMap);
  const gen = hasGenerator(c);
  const scope = test.scope ?? [];
  const currents = test.currents ?? [];
  const sim = simulate(c);
  let trc: TransientResult | null = null;
  const tran = () => (trc ??= simulateTransient(c));
  const setDesc = Object.entries(test.set)
    .map(([ref, p]) => {
      const u = mapping?.get(ref) ?? ref;
      if (p.pressed !== undefined) return p.pressed ? tr(`按下 ${u}`, `${u} is pressed`) : tr(`松开 ${u}`, `${u} is released`);
      if (p.position) return tr(`把 ${u} 拨到 ${p.position} 侧`, `${u} is switched to side ${p.position}`);
      if (p.wiper !== undefined) return tr(`把 ${u} 旋到 ${Math.round(p.wiper * 100)}%`, `${u} is turned to ${Math.round(p.wiper * 100)}%`);
      if (p.frequency !== undefined || p.amplitude !== undefined || p.waveform !== undefined || p.offset !== undefined)
        return tr(`${u} 设为 ${describeComponent({ type: 'function_gen', props: p })}`, `${u} is set to ${describeComponent({ type: 'function_gen', props: p })}`);
      return u;
    })
    .join(tr('、', ' and '));
  const prefix = setDesc ? tr(`当${setDesc}时，`, `When ${setDesc}, `) : '';
  for (const [tRef, want] of Object.entries(test.expect)) {
    const u = mapping?.get(tRef) ?? tRef;
    const on = (gen ? tran().leds.get(u)?.on : sim.leds.get(u)?.on) ?? false;
    if ((want === 'on') !== on)
      return tr(
        `${prefix}${u} 应该${want === 'on' ? '亮' : '灭'}，但实际是${on ? '亮' : '灭'}的。`,
        `${prefix}${u} should be ${want === 'on' ? 'on' : 'off'}, but it is ${on ? 'on' : 'off'}.`,
      );
  }
  const netOf = new Map<string, string>();
  c.nets.forEach((n) => n.pins.forEach((p) => netOf.set(p, n.name)));
  const mapPin = (p: string) => pinMap?.get(p) ?? p;
  for (const v of test.voltages) {
    const p = mapPin(v.pin);
    const r = v.ref ? mapPin(v.ref) : null;
    let val: number;
    if (gen) val = tran().measure('vavg', p, r ?? undefined);
    else {
      const vp = sim.nodeV.get(netOf.get(p) ?? '') ?? 0;
      const vr = r ? (sim.nodeV.get(netOf.get(r) ?? '') ?? 0) : 0;
      val = vp - vr;
    }
    if ((v.min !== undefined && val < v.min) || (v.max !== undefined && val > v.max))
      return tr(
        `${prefix}${p}${r ? ` 相对 ${r}` : ''} 的${gen ? '平均' : ''}电压是 ${volts(val)}，应在 ${v.min ?? '-∞'} ~ ${v.max ?? '∞'} V 之间。`,
        `${prefix}the ${gen ? 'average ' : ''}voltage at ${p}${r ? ` relative to ${r}` : ''} is ${volts(val)}; it should be between ${v.min ?? '-∞'} and ${v.max ?? '∞'} V.`,
      );
  }
  for (const it of currents) {
    const u = mapping?.get(it.el) ?? it.el;
    const comp = c.components.find((x) => x.ref === u);
    // the matcher may have mirrored a non-polarised part: keep the target's direction
    const first = comp ? terminalsOf(comp.type)[0] : '';
    const sign = pinMap && comp && pinMap.get(pinId(it.el, first)) !== undefined && pinMap.get(pinId(it.el, first)) !== pinId(u, first) ? -1 : 1;
    let val: number;
    if (gen || it.mode === 'rms') {
      const i = tran().current(u);
      val = i ? (it.mode === 'rms' ? vrms(i) : sign * vavg(i)) : 0;
    } else val = sign * (sim.current.get(u) ?? 0);
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
    const val = tran().measure(sc.measure, p, r, vs, vsr);
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
