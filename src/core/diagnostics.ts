// Live "common beginner mistake" detection on the user's breadboard.

import { HOLE_MAP, stripLabel } from './breadboard';
import { tr } from './i18n';
import { isFloating, type BoardNetlist } from './netlist';
import { OPAMP_HALVES, PARTS, describeComponent, groundSource, groundTerminal, isPower, isUsbPowered, terminalLabel, terminalsOf } from './parts';
import { mcuDiagnostics, acMcuDiagnostics } from './mcuDiagnostics';
import type { SimResult } from './solver';
import type { TransientResult } from './transient';
import { pinId } from './types';
import { amps, volts } from './format';
import { isMcu } from './mcu';

export type Severity = 'error' | 'warning' | 'info';

export interface Issue {
  severity: Severity;
  title: string;
  detail?: string;
  /** user component refs to highlight */
  refs: string[];
  /** holes to highlight */
  holes: string[];
  /** machine-readable kind, for issues code needs to pick out */
  code?: 'unplaced';
}

export function boardDiagnostics(nl: BoardNetlist, sim: SimResult): Issue[] {
  const out: Issue[] = [];
  const { circuit } = nl;
  const netSize = new Map(circuit.nets.map((n) => [n.name, n.pins.length]));

  if (!circuit.components.some((c) => isPower(c.type) || c.type === 'function_gen' || isUsbPowered(c)))
    out.push({
      severity: 'info',
      title: tr('还没有电源', 'No power source yet'),
      detail: tr(
        '电路需要一个电源（电池、电源模块或稳压电源）才会有电流。先从左侧“电源”里选一个放上去。',
        'A circuit needs a power source (battery, power module or bench supply) before any current flows. Pick one from "Power" on the left.',
      ),
      refs: [],
      holes: [],
    });

  for (const ref of nl.unplaced)
    out.push({
      severity: 'info',
      code: 'unplaced',
      title: tr(`${ref} 还没有插好`, `${ref} isn't fully plugged in`),
      detail: tr('有引脚还没插进面包板。', 'Some of its legs are not in the breadboard yet.'),
      refs: [ref],
      holes: [],
    });

  for (const [ref, s] of sim.sources) {
    if (s.shorted)
      out.push({
        severity: 'error',
        title: tr(`短路！${ref} 的正负极被直接连通了`, `Short circuit! ${ref}'s + and − are connected directly`),
        detail: s.ccMode
          ? tr(
              `稳压电源进入了限流（CC）模式，输出电压被拉低到 ${volts(s.terminalVoltage)}。检查有没有一根导线（或被短路的元件）直接把 + 和 − 连在一起。`,
              `The bench supply went into current-limit (CC) mode and its output dropped to ${volts(s.terminalVoltage)}. Look for a wire (or a shorted part) joining + straight to −.`,
            )
          : tr(
              `电流高达 ${amps(s.current)}。真实电路里电池会迅速发热、导线可能烫手。检查有没有导线把 + 轨和 − 轨直接连起来。`,
              `The current is ${amps(s.current)}. A real battery would get hot fast and the wires could burn your fingers. Look for a wire joining the + rail straight to the − rail.`,
            ),
        refs: [ref],
        holes: [...(nl.pinHoles.get(pinId(ref, '+')) ?? []), ...(nl.pinHoles.get(pinId(ref, '-')) ?? [])],
      });
    else if (s.ccMode)
      out.push({
        severity: 'warning',
        title: tr(`${ref} 正在限流（CC 模式）`, `${ref} is current-limiting (CC mode)`),
        detail: tr(
          `负载要的电流超过了限流设定，电源把电压降到了 ${volts(s.terminalVoltage)}。可以调高限流值，或者检查电路电阻是否太小。`,
          `The load wants more current than the limit, so the supply lowered its voltage to ${volts(s.terminalVoltage)}. Raise the current limit, or check whether the circuit's resistance is too low.`,
        ),
        refs: [ref],
        holes: [],
      });
  }

  for (const [ref, l] of sim.leds) {
    const comp = circuit.components.find((c) => c.ref === ref)!;
    const name = comp.type === 'led' ? 'LED' : tr('二极管', 'diode');
    if (comp.type === 'led' && l.burnt)
      out.push({
        severity: 'error',
        title: tr(`${ref} 烧坏了！电流 ${amps(l.current)}`, `${ref} burnt out! Current ${amps(l.current)}`),
        detail: tr(
          'LED 一般只能承受约 20 mA。必须串联一个限流电阻（常用 220 Ω – 1 kΩ）。R = (电源电压 − LED 压降) / 0.02 A。',
          'An LED can usually take only about 20 mA. It needs a series current-limiting resistor (typically 220 Ω – 1 kΩ). R = (supply voltage − LED drop) / 0.02 A.',
        ),
        refs: [ref],
        holes: [],
      });
    else if (comp.type === 'led' && l.overcurrent)
      out.push({
        severity: 'warning',
        title: tr(`${ref} 电流偏大：${amps(l.current)}`, `${ref} current is high: ${amps(l.current)}`),
        detail: tr('超过 20 mA 的额定值，LED 寿命会缩短。换一个更大的电阻。', 'Above the 20 mA rating the LED will wear out sooner. Use a bigger resistor.'),
        refs: [ref],
        holes: [],
      });
    if (l.reverse)
      out.push({
        severity: 'warning',
        title: tr(`${ref} 可能接反了`, `${ref} may be backwards`),
        detail: tr(
          `${name}两端加的是反向电压（负极比正极高 ${volts(-(sim.vdrop.get(ref) ?? 0))}），所以不导通。${comp.type === 'led' ? '长脚（正极）要朝向电源 +，短脚朝向 GND。' : ''}`,
          `The ${name} is reverse-biased (its cathode is ${volts(-(sim.vdrop.get(ref) ?? 0))} above its anode), so it doesn't conduct.${comp.type === 'led' ? ' The long leg (anode) should face the + supply and the short leg GND.' : ''}`,
        ),
        refs: [ref],
        holes: [],
      });
  }

  // component whose terminals all sit on one net (shorted out / bypassed)
  for (const c of circuit.components) {
    const terms = terminalsOf(c.type);
    if (c.type === 'switch' || isPower(c.type) || c.type === 'opamp' || c.type === 'scope_probe' || isMcu(c.type) || c.type === 'relay') continue;
    const nets = terms.map((t) => nl.pinNet.get(pinId(c.ref, t)));
    if (nets.some(isFloating)) continue;
    if (new Set(nets).size === 1) {
      const holes = terms.flatMap((t) => nl.pinHoles.get(pinId(c.ref, t)) ?? []);
      const strips = [...new Set(holes.map((h) => HOLE_MAP.get(h)!.strip))];
      const sameStrip = strips.length === 1;
      out.push({
        severity: 'warning',
        title: tr(`${c.ref} 被短路了（所有脚都在同一个节点上）`, `${c.ref} is shorted out (all its legs are on one node)`),
        detail: sameStrip
          ? tr(
              `${c.ref} 的脚都插在「${stripLabel(strips[0])}」——这 5 个孔在面包板内部是同一片金属，电流会直接从金属片走，完全绕过 ${c.ref}。把其中一只脚移到别的列。`,
              `All of ${c.ref}'s legs are in "${stripLabel(strips[0])}" — those 5 holes are one metal strip inside the board, so current takes the strip and bypasses ${c.ref} entirely. Move one leg to another column.`,
            )
          : tr(`${c.ref} 两端被导线连到了同一个节点，电流会绕过它。`, `Wires connect both ends of ${c.ref} to the same node, so current bypasses it.`),
        refs: [c.ref],
        holes,
      });
    }
  }

  // dangling terminals
  for (const c of circuit.components) {
    if (nl.unplaced.includes(c.ref)) continue;
    for (const t of terminalsOf(c.type)) {
      if (c.type === 'switch' && t !== 'com') continue;
      if (c.type === 'opamp' || isMcu(c.type)) continue; // see the op-amp / dev-board checks
      if (c.type === 'relay' && t !== 'coil1' && t !== 'coil2') continue; // unused contacts are normal
      const net = nl.pinNet.get(pinId(c.ref, t));
      if (net && netSize.get(net) === 1)
        out.push({
          severity: 'info',
          title: tr(`${terminalLabel(c, t)}悬空`, `${terminalLabel(c, t)} is floating`),
          detail: tr(
            `这只脚所在的金属片上没有连接任何其他元件，电流无法通过 ${c.ref}（${describeComponent(c)}）。`,
            `Nothing else is connected to the strip this leg is in, so no current can flow through ${c.ref} (${describeComponent(c)}).`,
          ),
          refs: [c.ref],
          holes: nl.pinHoles.get(pinId(c.ref, t)) ?? [],
        });
    }
  }

  out.push(...instrumentDiagnostics(nl, sim));
  out.push(...mcuDiagnostics(nl, sim));

  // multiple supplies without a common ground
  const srcs = circuit.components.filter((c) => (isPower(c.type) || c.type === 'function_gen' || isUsbPowered(c)) && !nl.unplaced.includes(c.ref));
  const grounds = new Set(srcs.map((s) => nl.pinNet.get(pinId(s.ref, groundTerminal(s)))));
  if (srcs.length > 1 && grounds.size > 1)
    out.push({
      severity: 'info',
      title: tr('多个电源没有“共地”', 'Several supplies without a common ground'),
      detail: tr(
        '几个电源的 − 极（GND）没有连在一起。两个电源之间要传递信号或一起供电，通常必须把它们的 GND 连起来作为共同的 0 V 参考点。',
        "The supplies' − terminals (GND) aren't connected together. When two supplies share signals or power one circuit, their GNDs usually must be joined to give a common 0 V reference.",
      ),
      refs: srcs.map((s) => s.ref),
      holes: [],
    });

  return out;
}

/** Stage-C checks: op-amps, ammeters, scope probes. */
function instrumentDiagnostics(nl: BoardNetlist, sim: SimResult): Issue[] {
  const out: Issue[] = [];
  const { circuit } = nl;
  const netSize = new Map(circuit.nets.map((n) => [n.name, n.pins.length]));
  const netOf = (ref: string, t: string) => nl.pinNet.get(pinId(ref, t));
  const connected = (ref: string, t: string) => {
    const n = netOf(ref, t);
    return !!n && (netSize.get(n) ?? 0) > 1;
  };
  const holesOf = (ref: string, ts: string[]) => ts.flatMap((t) => nl.pinHoles.get(pinId(ref, t)) ?? []);
  // nets that are a supply terminal (DC source +/−) — an op-amp output must never sit on one
  const supplyNets = new Set<string>();
  for (const c of circuit.components)
    if (isPower(c.type) && !nl.unplaced.includes(c.ref))
      for (const t of ['+', '-']) {
        const n = netOf(c.ref, t);
        if (n) supplyNets.add(n);
      }
  const outputsOnNet = new Map<string, string[]>();

  for (const c of circuit.components) {
    if (c.type !== 'opamp' || nl.unplaced.includes(c.ref)) continue;
    const st = sim.opamps.get(c.ref);
    const used = OPAMP_HALVES.filter((h) => connected(c.ref, h.out) || connected(c.ref, h.inp) || connected(c.ref, h.inn));
    if (used.length === 0) continue;
    const vpOk = connected(c.ref, 'v+');
    const vnOk = connected(c.ref, 'v-');
    if (!vpOk || !vnOk || !st?.powered)
      out.push({
        severity: 'warning',
        title: tr(`${c.ref} 没有接电源`, `${c.ref} has no power`),
        detail: tr(
          `运放必须供电才能工作：8 脚 V+ 接电源正极（+ 轨），4 脚 V− 接 GND（或负电源）。${!vpOk ? '现在 8 脚悬空。' : ''}${!vnOk ? '现在 4 脚悬空。' : ''}${vpOk && vnOk ? `现在 V+ 和 V− 之间只有 ${volts(st?.supply ?? 0)}（LM358 至少要 3 V）。` : ''}`,
          `An op-amp needs power to work: pin 8 (V+) to the supply + (the + rail), pin 4 (V−) to GND (or a negative supply).${!vpOk ? ' Pin 8 is floating now.' : ''}${!vnOk ? ' Pin 4 is floating now.' : ''}${vpOk && vnOk ? ` There is only ${volts(st?.supply ?? 0)} between V+ and V− now (the LM358 needs at least 3 V).` : ''}`,
        ),
        refs: [c.ref],
        holes: holesOf(c.ref, ['v+', 'v-']),
      });
    for (const h of used) {
      const floating = [h.inp, h.inn].filter((t) => !connected(c.ref, t));
      if (floating.length)
        out.push({
          severity: 'warning',
          title: tr(`${c.ref} 的输入悬空：${floating.map((t) => terminalLabel(c, t)).join('、')}`, `${c.ref} input floating: ${floating.map((t) => terminalLabel(c, t)).join(', ')}`),
          detail: tr(
            '运放的输入几乎不取电流，悬空的输入电压是不确定的（会拾取噪声），输出会乱跳或撞到电源轨。每个用到的运放，IN+ 和 IN− 都必须接到电路上。',
            "An op-amp input draws almost no current, so a floating input sits at an undefined voltage (it picks up noise) and the output jumps around or slams into a rail. For every half you use, both IN+ and IN− must be connected.",
          ),
          refs: [c.ref],
          holes: holesOf(c.ref, floating),
        });
      const on = netOf(c.ref, h.out);
      if (on && (netSize.get(on) ?? 0) > 1) {
        outputsOnNet.set(on, [...(outputsOnNet.get(on) ?? []), terminalLabel(c, h.out)]);
        if (supplyNets.has(on))
          out.push({
            severity: 'warning',
            title: tr(`${c.ref} 的输出直接接在电源上`, `${c.ref}'s output is wired straight to a supply`),
            detail: tr(
              `${terminalLabel(c, h.out)} 和电源的 + 或 − 在同一个节点上。运放输出是“电压源”，不能和另一个电压源硬连在一起——会有很大的电流，输出被短路。检查是不是插错了列。`,
              `${terminalLabel(c, h.out)} is on the same node as a supply terminal. An op-amp output is a voltage source and must not be tied straight to another voltage source — a large current flows and the output is shorted. Check for a leg in the wrong column.`,
            ),
            refs: [c.ref],
            holes: holesOf(c.ref, [h.out]),
          });
      }
      if (st?.[h.half].mode === 'high' || st?.[h.half].mode === 'low')
        out.push({
          severity: 'info',
          title: tr(`${c.ref}${h.half} 的输出到顶了（饱和）`, `${c.ref}${h.half}'s output is saturated`),
          detail: tr(
            `输出停在 ${volts(st[h.half].out)}，已经到了电源能给的极限（LM358 最高约 V+ − 1.5 V，最低约 V−）。要么输入太大、增益太高，要么反馈没接好（反馈要接到 IN−）。`,
            `The output is stuck at ${volts(st[h.half].out)}, as far as the supply allows (LM358: about V+ − 1.5 V at the top, V− at the bottom). Either the input or the gain is too large, or the feedback isn't wired right (feedback goes to IN−).`,
          ),
          refs: [c.ref],
          holes: [],
        });
    }
  }
  for (const [net, outs] of outputsOnNet)
    if (outs.length > 1)
      out.push({
        severity: 'warning',
        title: tr('两个运放输出连在了一起', 'Two op-amp outputs are connected together'),
        detail: tr(
          `${outs.join('、')} 在同一个节点（${net}）上。两个输出都想决定这个点的电压，会互相“打架”，大电流从一个流进另一个。每个输出只能驱动输入或负载。`,
          `${outs.join(', ')} are on the same node (${net}). Both outputs try to set that voltage and fight each other, with a large current flowing between them. Each output should drive only inputs or loads.`,
        ),
        refs: [...new Set(outs.map((o) => o.split(' ')[0]))],
        holes: [],
      });

  for (const [ref, m] of sim.meters)
    if (Math.abs(m.current) > 0.5)
      out.push({
        severity: 'error',
        title: tr(`${ref} 把电路短路了！电流 ${amps(m.current)}`, `${ref} is shorting the circuit! Current ${amps(m.current)}`),
        detail: tr(
          '电流表的内阻几乎为零，相当于一根导线。它必须串联：把电路在要测电流的地方断开，让电流从红表笔流进、从黑表笔流出。并联在元件或电源两端就是短路（真实的万用表会烧保险丝）。',
          'An ammeter has almost zero resistance — it is like a wire. It must go in series: open the circuit where you want to measure and let the current flow in at the red lead and out at the black lead. Across a part or a supply it is a short circuit (a real multimeter blows its fuse).',
        ),
        refs: [ref],
        holes: [...(nl.pinHoles.get(pinId(ref, '+')) ?? []), ...(nl.pinHoles.get(pinId(ref, '-')) ?? [])],
      });

  const gs = groundSource(circuit.components.filter((c) => !nl.unplaced.includes(c.ref)));
  const gnd = gs ? netOf(gs.ref, groundTerminal(gs)) : undefined;
  for (const c of circuit.components) {
    if (c.type !== 'scope_probe' || nl.unplaced.includes(c.ref) || !gnd) continue;
    const g = netOf(c.ref, 'gnd');
    if (g && g !== gnd && (netSize.get(g) ?? 0) > 1)
      out.push({
        severity: 'info',
        title: tr(`${c.ref} 的接地夹没有夹在 GND 上`, `${c.ref}'s ground clip isn't on GND`),
        detail: tr(
          '这里的探头只测“针尖 − 接地夹”的电压差，所以读数没问题。但真实示波器的接地夹都连在大地（和信号发生器的地）上，夹在非 GND 的点会把那一点短路到地。想测两点之间的电压，用两个探头都接 GND，再看 CH1 − CH2。',
          'This probe just measures tip minus ground clip, so the reading is fine here. But on a real scope every ground clip is tied to earth (and to the generator\'s ground), so clipping it to a non-GND point shorts that point to ground. To measure between two points, use two probes with grounds on GND and look at CH1 − CH2.',
        ),
        refs: [c.ref],
        holes: nl.pinHoles.get(pinId(c.ref, 'gnd')) ?? [],
      });
  }
  return out;
}

export const PART_NAME = (t: keyof typeof PARTS) => PARTS[t].name;

/** Phase 5 time-domain checks (inductive kicks under PWM, …). Call with the transient result
 *  when there is one; the issues are added to the DC ones. */
export function acDiagnostics(nl: BoardNetlist, ac: TransientResult): Issue[] {
  return acMcuDiagnostics(nl, ac);
}
