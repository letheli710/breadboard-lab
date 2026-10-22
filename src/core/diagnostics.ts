// Live "common beginner mistake" detection on the user's breadboard.

import { HOLE_MAP, stripLabel } from './breadboard';
import type { BoardNetlist } from './netlist';
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
}

export function boardDiagnostics(nl: BoardNetlist, sim: SimResult): Issue[] {
  const out: Issue[] = [];
  const { circuit } = nl;
  const netSize = new Map(circuit.nets.map((n) => [n.name, n.pins.length]));

  if (!circuit.components.some((c) => isPower(c.type)))
    out.push({
      severity: 'info',
      title: '还没有电源',
      detail: '电路需要一个电源（电池、电源模块或稳压电源）才会有电流。先从左侧“电源”里选一个放上去。',
      refs: [],
      holes: [],
    });

  for (const ref of nl.unplaced)
    out.push({ severity: 'info', title: `${ref} 还没有插好`, detail: '有引脚还没插进面包板。', refs: [ref], holes: [] });

  for (const [ref, s] of sim.sources) {
    if (s.shorted)
      out.push({
        severity: 'error',
        title: `短路！${ref} 的正负极被直接连通了`,
        detail: s.ccMode
          ? `稳压电源进入了限流（CC）模式，输出电压被拉低到 ${volts(s.terminalVoltage)}。检查有没有一根导线（或被短路的元件）直接把 + 和 − 连在一起。`
          : `电流高达 ${amps(s.current)}。真实电路里电池会迅速发热、导线可能烫手。检查有没有导线把 + 轨和 − 轨直接连起来。`,
        refs: [ref],
        holes: [...(nl.pinHoles.get(pinId(ref, '+')) ?? []), ...(nl.pinHoles.get(pinId(ref, '-')) ?? [])],
      });
    else if (s.ccMode)
      out.push({
        severity: 'warning',
        title: `${ref} 正在限流（CC 模式）`,
        detail: `负载要的电流超过了限流设定，电源把电压降到了 ${volts(s.terminalVoltage)}。可以调高限流值，或者检查电路电阻是否太小。`,
        refs: [ref],
        holes: [],
      });
  }

  for (const [ref, l] of sim.leds) {
    const comp = circuit.components.find((c) => c.ref === ref)!;
    const name = comp.type === 'led' ? 'LED' : '二极管';
    if (comp.type === 'led' && l.burnt)
      out.push({
        severity: 'error',
        title: `${ref} 烧坏了！电流 ${amps(l.current)}`,
        detail: 'LED 一般只能承受约 20 mA。必须串联一个限流电阻（常用 220 Ω – 1 kΩ）。R = (电源电压 − LED 压降) / 0.02 A。',
        refs: [ref],
        holes: [],
      });
    else if (comp.type === 'led' && l.overcurrent)
      out.push({
        severity: 'warning',
        title: `${ref} 电流偏大：${amps(l.current)}`,
        detail: '超过 20 mA 的额定值，LED 寿命会缩短。换一个更大的电阻。',
        refs: [ref],
        holes: [],
      });
    if (l.reverse)
      out.push({
        severity: 'warning',
        title: `${ref} 可能接反了`,
        detail: `${name}两端加的是反向电压（负极比正极高 ${volts(-(sim.vdrop.get(ref) ?? 0))}），所以不导通。${comp.type === 'led' ? '长脚（正极）要朝向电源 +，短脚朝向 GND。' : ''}`,
        refs: [ref],
        holes: [],
      });
  }

  // component whose terminals all sit on one net (shorted out / bypassed)
  for (const c of circuit.components) {
    const terms = terminalsOf(c.type);
    if (c.type === 'switch' || isPower(c.type)) continue;
    const nets = terms.map((t) => nl.pinNet.get(pinId(c.ref, t)));
    if (nets.some((n) => !n || n.startsWith('悬空'))) continue;
    if (new Set(nets).size === 1) {
      const holes = terms.flatMap((t) => nl.pinHoles.get(pinId(c.ref, t)) ?? []);
      const strips = [...new Set(holes.map((h) => HOLE_MAP.get(h)!.strip))];
      const sameStrip = strips.length === 1;
      out.push({
        severity: 'warning',
        title: `${c.ref} 被短路了（所有脚都在同一个节点上）`,
        detail: sameStrip
          ? `${c.ref} 的脚都插在「${stripLabel(strips[0])}」——这 5 个孔在面包板内部是同一片金属，电流会直接从金属片走，完全绕过 ${c.ref}。把其中一只脚移到别的列。`
          : `${c.ref} 两端被导线连到了同一个节点，电流会绕过它。`,
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
          title: `${terminalLabel(c, t)}悬空`,
          detail: `这只脚所在的金属片上没有连接任何其他元件，电流无法通过 ${c.ref}（${describeComponent(c)}）。`,
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
      title: '多个电源没有“共地”',
      detail: '几个电源的 − 极（GND）没有连在一起。两个电源之间要传递信号或一起供电，通常必须把它们的 GND 连起来作为共同的 0 V 参考点。',
      refs: srcs.map((s) => s.ref),
      holes: [],
    });

  return out;
}

export const PART_NAME = (t: keyof typeof PARTS) => PARTS[t].name;
