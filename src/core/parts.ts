// Part catalogue: how each part is placed on the board and how its physical legs map
// to the logical terminals used in a Circuit.

import { HOLE_MAP, holeId, isRail, offsetHole } from './breadboard';
import type { BatteryVariant, CComponent, CompType, LedColor, PartProps, PartType } from './types';

export type Category = 'power' | 'basic' | 'input' | 'wire';

export interface TwoPointPlacement {
  kind: 'two-point';
  /** physical pins in click order */
  pins: [string, string];
  prompts: [string, string];
}

export interface FootprintPlacement {
  kind: 'footprint';
  prompt: string;
  /** anchor hole -> pin->hole, or null if it doesn't fit */
  footprint: (anchor: string) => Record<string, string> | null;
}

export interface PartDef {
  type: PartType;
  name: string;
  nameEn: string;
  category: Category;
  refPrefix: string;
  placement: TwoPointPlacement | FootprintPlacement;
  /** logical terminals of the component */
  terminals: string[];
  /** physical pin -> logical terminal */
  terminalOf: Record<string, string>;
  /** pairs of physical pins joined inside the part (always conducting, zero ohms) */
  internal: [string, string][];
  /** groups of terminals that are interchangeable (non-polarised) */
  symmetric: string[][];
  defaults: PartProps;
  blurb: string;
}

function rowFootprint(offsets: Record<string, [number, number]>) {
  return (anchor: string) => {
    const h = HOLE_MAP.get(anchor);
    if (!h || isRail(h.row)) return null;
    const out: Record<string, string> = {};
    for (const [pin, [dr, dc]] of Object.entries(offsets)) {
      const id = offsetHole(anchor, dr, dc);
      if (!id) return null;
      out[pin] = id;
    }
    return out;
  };
}

const identity = (...pins: string[]) => Object.fromEntries(pins.map((p) => [p, p]));

export const PARTS: Record<PartType, PartDef> = {
  wire: {
    type: 'wire',
    name: '跳线',
    nameEn: 'Jumper wire',
    category: 'wire',
    refPrefix: 'W',
    placement: { kind: 'two-point', pins: ['a', 'b'], prompts: ['点击跳线的起点孔', '点击跳线的终点孔'] },
    terminals: ['a', 'b'],
    terminalOf: identity('a', 'b'),
    internal: [['a', 'b']],
    symmetric: [['a', 'b']],
    defaults: { wireColor: '#e8590c' },
    blurb: '跳线把两个孔直接连起来——相当于原理图里的一根导线。颜色只是方便辨认：习惯上红色接正极，黑/蓝色接 GND。',
  },
  resistor: {
    type: 'resistor',
    name: '电阻',
    nameEn: 'Resistor',
    category: 'basic',
    refPrefix: 'R',
    placement: { kind: 'two-point', pins: ['1', '2'], prompts: ['点击电阻第一只脚的位置', '点击电阻第二只脚的位置'] },
    terminals: ['1', '2'],
    terminalOf: identity('1', '2'),
    internal: [],
    symmetric: [['1', '2']],
    defaults: { resistance: 330 },
    blurb: '电阻限制电流（V = I × R）。没有正负之分，两只脚可以随便插。注意：两只脚不能插在同一列的同一组（a–e）里，否则它就被短路了。',
  },
  led: {
    type: 'led',
    name: 'LED 发光二极管',
    nameEn: 'LED',
    category: 'basic',
    refPrefix: 'LED',
    placement: {
      kind: 'two-point',
      pins: ['anode', 'cathode'],
      prompts: ['点击 LED 长脚（正极 / anode）的位置', '点击 LED 短脚（负极 / cathode）的位置'],
    },
    terminals: ['anode', 'cathode'],
    terminalOf: identity('anode', 'cathode'),
    internal: [],
    symmetric: [],
    defaults: { color: 'red' },
    blurb: 'LED 只允许电流从长脚（正极 anode）流向短脚（负极 cathode）。几乎总要串联一个限流电阻，否则电流过大会烧坏。',
  },
  diode: {
    type: 'diode',
    name: '二极管',
    nameEn: 'Diode',
    category: 'basic',
    refPrefix: 'D',
    placement: {
      kind: 'two-point',
      pins: ['anode', 'cathode'],
      prompts: ['点击二极管正极（anode，无色环一端）', '点击二极管负极（cathode，有银色环一端）'],
    },
    terminals: ['anode', 'cathode'],
    terminalOf: identity('anode', 'cathode'),
    internal: [],
    symmetric: [],
    defaults: {},
    blurb: '普通二极管（如 1N4148）：电流只能单向通过，导通时约有 0.7 V 压降。有色环的一端是负极。',
  },
  capacitor: {
    type: 'capacitor',
    name: '电容',
    nameEn: 'Capacitor',
    category: 'basic',
    refPrefix: 'C',
    placement: { kind: 'two-point', pins: ['1', '2'], prompts: ['点击电容第一只脚', '点击电容第二只脚'] },
    terminals: ['1', '2'],
    terminalOf: identity('1', '2'),
    internal: [],
    symmetric: [['1', '2']],
    defaults: { capacitance: 100e-9 },
    blurb: '瓷片电容（无极性）。本模拟器只算直流稳态：电容充满电后相当于断路，没有电流流过。',
  },
  pushbutton: {
    type: 'pushbutton',
    name: '按键开关',
    nameEn: 'Push button',
    category: 'input',
    refPrefix: 'SW',
    placement: {
      kind: 'footprint',
      prompt: '点击按键左上角那只脚的位置（推荐放在 e 行，让按键横跨中间凹槽）',
      footprint: rowFootprint({ '1a': [0, 0], '2a': [0, 2], '1b': [1, 0], '2b': [1, 2] }),
    },
    terminals: ['1', '2'],
    terminalOf: { '1a': '1', '1b': '1', '2a': '2', '2b': '2' },
    internal: [
      ['1a', '1b'],
      ['2a', '2b'],
    ],
    symmetric: [['1', '2']],
    defaults: { pressed: false },
    blurb: '四脚轻触按键：同一侧上下两只脚（跨凹槽方向）内部永远相通；按下时左右两组才接通。所以按键要横跨凹槽放置，左右两列才是“开关的两端”。',
  },
  switch: {
    type: 'switch',
    name: '拨动开关',
    nameEn: 'Slide switch (SPDT)',
    category: 'input',
    refPrefix: 'S',
    placement: {
      kind: 'footprint',
      prompt: '点击开关最左边那只脚的位置（三只脚横向占 3 列）',
      footprint: rowFootprint({ a: [0, 0], com: [0, 1], b: [0, 2] }),
    },
    terminals: ['a', 'com', 'b'],
    terminalOf: identity('a', 'com', 'b'),
    internal: [],
    symmetric: [['a', 'b']],
    defaults: { position: 'a' },
    blurb: '单刀双掷（SPDT）拨动开关：中间脚 com 与左脚 a 或右脚 b 接通，取决于拨杆位置。只用 com 和一边，就是普通的通/断开关。',
  },
  potentiometer: {
    type: 'potentiometer',
    name: '电位器',
    nameEn: 'Potentiometer',
    category: 'input',
    refPrefix: 'RV',
    placement: {
      kind: 'footprint',
      prompt: '点击电位器最左边那只脚（三只脚横向占 3 列，中间是滑动端）',
      footprint: rowFootprint({ '1': [0, 0], '2': [0, 1], '3': [0, 2] }),
    },
    terminals: ['1', '2', '3'],
    terminalOf: identity('1', '2', '3'),
    internal: [],
    symmetric: [['1', '3']],
    defaults: { resistance: 10000, wiper: 0.5 },
    blurb: '可调电阻：1、3 脚之间是固定的总电阻，中间 2 脚（滑动端 wiper）随旋钮移动。两端接电源和 GND，中间脚输出可调电压（分压器）。',
  },
  battery: {
    type: 'battery',
    name: '电池',
    nameEn: 'Battery',
    category: 'power',
    refPrefix: 'BAT',
    placement: {
      kind: 'two-point',
      pins: ['+', '-'],
      prompts: ['点击红线（+ 正极）要插的孔', '点击黑线（− 负极 / GND）要插的孔'],
    },
    terminals: ['+', '-'],
    terminalOf: identity('+', '-'),
    internal: [],
    symmetric: [],
    defaults: { variant: '9V' },
    blurb: '电池有内阻：电流越大，端电压越低。9V 电池内阻约 1.5 Ω，AA 每节约 0.15 Ω，纽扣电池 CR2032 约 15 Ω（所以它只能带很小的负载）。',
  },
  bench_supply: {
    type: 'bench_supply',
    name: '直流稳压电源',
    nameEn: 'Bench power supply',
    category: 'power',
    refPrefix: 'PSU',
    placement: {
      kind: 'two-point',
      pins: ['+', '-'],
      prompts: ['点击红色鳄鱼夹线（+）要插的孔', '点击黑色鳄鱼夹线（− / COM）要插的孔'],
    },
    terminals: ['+', '-'],
    terminalOf: identity('+', '-'),
    internal: [],
    symmetric: [],
    defaults: { voltage: 5, currentLimit: 0.1 },
    blurb: '实验室可调电源：设定电压（CV 恒压），并设定限流值。电流超过限流值时自动进入 CC 恒流模式、电压下降——这正是它保护电路、防止短路烧坏东西的方式。',
  },
  power_module: {
    type: 'power_module',
    name: '面包板电源模块',
    nameEn: 'Breadboard power module',
    category: 'power',
    refPrefix: 'PM',
    placement: {
      kind: 'footprint',
      prompt: '点击任意一列——模块的针脚会同时插入这一列上下两侧的 4 条电源轨',
      footprint: (anchor) => {
        const h = HOLE_MAP.get(anchor);
        if (!h) return null;
        const c = h.col;
        return { '+t': holeId('tp', c), '-t': holeId('tn', c), '+b': holeId('bp', c), '-b': holeId('bn', c) };
      },
    },
    terminals: ['+', '-'],
    terminalOf: { '+t': '+', '+b': '+', '-t': '-', '-b': '-' },
    internal: [
      ['+t', '+b'],
      ['-t', '-b'],
    ],
    symmetric: [],
    defaults: { voltage: 5 },
    blurb: '常见的 MB102 面包板电源模块：插在面包板一端，同时给上下两组电源轨供电（5 V 或 3.3 V），用 USB 或 DC 插头取电。注意它的 + 和 − 方向必须对准轨道上的红线和蓝线。',
  },
};

export const PART_ORDER: PartType[] = [
  'battery',
  'power_module',
  'bench_supply',
  'wire',
  'resistor',
  'led',
  'diode',
  'capacitor',
  'pushbutton',
  'switch',
  'potentiometer',
];

export const LED_COLORS: Record<LedColor, { hex: string; vf: number; name: string }> = {
  red: { hex: '#ff3b30', vf: 1.8, name: '红' },
  yellow: { hex: '#ffcc00', vf: 2.0, name: '黄' },
  green: { hex: '#34c759', vf: 2.1, name: '绿' },
  blue: { hex: '#2f7bff', vf: 3.0, name: '蓝' },
  white: { hex: '#f8f8ff', vf: 3.0, name: '白' },
};

export const BATTERIES: Record<BatteryVariant, { voltage: number; rint: number; name: string; maxCurrent: number }> = {
  '9V': { voltage: 9, rint: 1.5, name: '9V 方块电池', maxCurrent: 1 },
  '2xAA': { voltage: 3, rint: 0.3, name: '2 节 AA (3V)', maxCurrent: 2 },
  '3xAA': { voltage: 4.5, rint: 0.45, name: '3 节 AA (4.5V)', maxCurrent: 2 },
  '4xAA': { voltage: 6, rint: 0.6, name: '4 节 AA (6V)', maxCurrent: 2 },
  CR2032: { voltage: 3, rint: 15, name: 'CR2032 纽扣电池 (3V)', maxCurrent: 0.05 },
};

export const POWER_TYPES: CompType[] = ['battery', 'bench_supply', 'power_module', 'dc_source'];
export const isPower = (t: CompType) => POWER_TYPES.includes(t);

/** Nominal (open-circuit) voltage of a power component. */
export function sourceVoltage(c: { type: CompType; props: PartProps }): number {
  if (c.type === 'battery') return BATTERIES[c.props.variant ?? '9V'].voltage;
  if (c.type === 'power_module') return c.props.voltage ?? 5;
  return c.props.voltage ?? 5;
}

export function sourceRint(c: { type: CompType; props: PartProps }): number {
  if (c.type === 'battery') return BATTERIES[c.props.variant ?? '9V'].rint;
  if (c.type === 'power_module') return 0.1;
  return 0.02;
}

/** Terminal definitions for circuit-level component types (includes dc_source). */
export function terminalsOf(t: CompType): string[] {
  if (t === 'dc_source') return ['+', '-'];
  return PARTS[t].terminals;
}

export function symmetricOf(t: CompType): string[][] {
  if (t === 'dc_source') return [];
  return PARTS[t].symmetric;
}

export const TERMINAL_LABEL: Record<string, Record<string, string>> = {
  led: { anode: '正极（长脚）', cathode: '负极（短脚）' },
  diode: { anode: '正极', cathode: '负极（色环端）' },
  battery: { '+': '+ 极（红线）', '-': '− 极（黑线）' },
  bench_supply: { '+': '+ 输出（红）', '-': '− COM（黑）' },
  power_module: { '+': '+ 输出', '-': '− GND' },
  dc_source: { '+': '+ 极', '-': '− 极' },
  potentiometer: { '1': '1 脚', '2': '2 脚（滑动端）', '3': '3 脚' },
  switch: { a: 'a 脚', com: 'com 中间脚', b: 'b 脚' },
  pushbutton: { '1': '左侧', '2': '右侧' },
};

export function terminalLabel(c: Pick<CComponent, 'ref' | 'type'>, pin: string): string {
  const t = TERMINAL_LABEL[c.type]?.[pin] ?? `${pin} 脚`;
  return `${c.ref} 的${t}`;
}

export function describeComponent(c: Pick<CComponent, 'type' | 'props'>): string {
  const p = c.props;
  switch (c.type) {
    case 'resistor':
      return `${fmtR(p.resistance)} 电阻`;
    case 'potentiometer':
      return `${fmtR(p.resistance)} 电位器`;
    case 'led':
      return `${p.color ? LED_COLORS[p.color].name + '色 ' : ''}LED`;
    case 'battery':
      return BATTERIES[p.variant ?? '9V'].name;
    case 'bench_supply':
      return `稳压电源 ${p.voltage ?? 5}V`;
    case 'power_module':
      return `电源模块 ${p.voltage ?? 5}V`;
    case 'dc_source':
      return `${p.voltage ?? '?'}V 直流电源`;
    case 'capacitor':
      return '电容';
    default:
      return PARTS[c.type].name;
  }
}

function fmtR(r?: number) {
  if (r === undefined) return '';
  if (r >= 1e6) return `${+(r / 1e6).toPrecision(3)}MΩ`;
  if (r >= 1e3) return `${+(r / 1e3).toPrecision(3)}kΩ`;
  return `${+r.toPrecision(3)}Ω`;
}
