// Live "common beginner mistake" detection on the user's breadboard.

import { HOLE_MAP, stripLabel } from './breadboard';
import { tr } from './i18n';
import { isFloating, type BoardNetlist } from './netlist';
import { PARTS, describeComponent, isPower, terminalLabel, terminalsOf } from './parts';
import type { SimResult } from './solver';
import { pinId } from './types';
import { amps, volts } from './format';

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

  if (!circuit.components.some((c) => isPower(c.type)))
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
    if (c.type === 'switch' || isPower(c.type)) continue;
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

  // multiple supplies without a common ground
  const srcs = circuit.components.filter((c) => isPower(c.type) && !nl.unplaced.includes(c.ref));
  const grounds = new Set(srcs.map((s) => nl.pinNet.get(pinId(s.ref, '-'))));
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

export const PART_NAME = (t: keyof typeof PARTS) => PARTS[t].name;
