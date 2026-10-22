// Compare the user's circuit with a challenge's target circuit.
// Matching is topological: breadboard positions don't matter, only which terminals
// end up electrically connected. We search for the component correspondence
// (target ref -> user ref, plus pin orientation for non-polarised parts) that best
// explains the user's wiring, then describe what differs.

import { tr } from './i18n';
import type { Challenge, ChallengeTest } from './challenge';
import type { Issue } from './diagnostics';
import { BATTERIES, describeComponent, isPower, sourceVoltage, symmetricOf, terminalLabel, terminalsOf } from './parts';
import { simulate } from './solver';
import type { CComponent, Circuit } from './types';
import { pinId, splitPin } from './types';
import { volts } from './format';

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

function permutations(type: CComponent['type']): Perm[] {
  const terms = terminalsOf(type);
  let perms: Perm[] = [Object.fromEntries(terms.map((t) => [t, t]))];
  for (const group of symmetricOf(type)) {
    if (group.length !== 2) continue;
    const [a, b] = group;
    perms = perms.flatMap((p) => [p, { ...p, [a]: p[b], [b]: p[a] }]);
  }
  return perms;
}

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

export function checkCircuit(ch: Challenge, user: Circuit, userPinHoles?: Map<string, string[]>): CheckResult {
  const target = ch.target;
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
  finalAssign.forEach((a, i) => {
    if (!a) return;
    const t = targets[i];
    const pol = t.type === 'led' || t.type === 'diode' || isPower(t.type);
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
        tr(`\n→ 它们现在都在同一个节点（${un}）上。检查是否插错了列，或多了一根跳线。`, `\n→ They are all on one node (${un}) now. Check for a leg in the wrong column or an extra jumper.`),
      refs: [...new Set(userPins.map((p) => splitPin(p)[0]))],
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

/** Returns null on success or a human message describing the failure. */
export function runTest(test: ChallengeTest, circuit: Circuit, mapping?: Map<string, string>, pinMap?: Map<string, string>): string | null {
  const c = applySet(circuit, test.set, mapping, pinMap);
  const sim = simulate(c);
  const setDesc = Object.entries(test.set)
    .map(([ref, p]) => {
      const u = mapping?.get(ref) ?? ref;
      if (p.pressed !== undefined) return p.pressed ? tr(`按下 ${u}`, `${u} is pressed`) : tr(`松开 ${u}`, `${u} is released`);
      if (p.position) return tr(`把 ${u} 拨到 ${p.position} 侧`, `${u} is switched to side ${p.position}`);
      if (p.wiper !== undefined) return tr(`把 ${u} 旋到 ${Math.round(p.wiper * 100)}%`, `${u} is turned to ${Math.round(p.wiper * 100)}%`);
      return u;
    })
    .join(tr('、', ' and '));
  const prefix = setDesc ? tr(`当${setDesc}时，`, `When ${setDesc}, `) : '';
  for (const [tRef, want] of Object.entries(test.expect)) {
    const u = mapping?.get(tRef) ?? tRef;
    const on = sim.leds.get(u)?.on ?? false;
    if ((want === 'on') !== on)
      return tr(
        `${prefix}${u} 应该${want === 'on' ? '亮' : '灭'}，但实际是${on ? '亮' : '灭'}的。`,
        `${prefix}${u} should be ${want === 'on' ? 'on' : 'off'}, but it is ${on ? 'on' : 'off'}.`,
      );
  }
  const netOf = new Map<string, string>();
  c.nets.forEach((n) => n.pins.forEach((p) => netOf.set(p, n.name)));
  for (const v of test.voltages) {
    const p = pinMap?.get(v.pin) ?? v.pin;
    const r = v.ref ? (pinMap?.get(v.ref) ?? v.ref) : null;
    const vp = sim.nodeV.get(netOf.get(p) ?? '') ?? 0;
    const vr = r ? (sim.nodeV.get(netOf.get(r) ?? '') ?? 0) : 0;
    const val = vp - vr;
    if ((v.min !== undefined && val < v.min) || (v.max !== undefined && val > v.max))
      return tr(
        `${prefix}${p}${r ? ` 相对 ${r}` : ''} 的电压是 ${volts(val)}，应在 ${v.min ?? '-∞'} ~ ${v.max ?? '∞'} V 之间。`,
        `${prefix}the voltage at ${p}${r ? ` relative to ${r}` : ''} is ${volts(val)}; it should be between ${v.min ?? '-∞'} and ${v.max ?? '∞'} V.`,
      );
  }
  return null;
}
