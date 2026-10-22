// Part catalogue: how each part is placed on the board and how its physical legs map
// to the logical terminals used in a Circuit.

import { HOLE_MAP, holeId, isRail, offsetHole } from './breadboard';
import { getLang, tr } from './i18n';
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
    get name() {
      return tr('跳线', 'Jumper wire');
    },
    nameEn: 'Jumper wire',
    category: 'wire',
    refPrefix: 'W',
    placement: { kind: 'two-point', pins: ['a', 'b'], get prompts(): [string, string] {
        return [tr('点击跳线的起点孔', 'Click the hole where the wire starts'), tr('点击跳线的终点孔', 'Click the hole where the wire ends')];
      } },
    terminals: ['a', 'b'],
    terminalOf: identity('a', 'b'),
    internal: [['a', 'b']],
    symmetric: [['a', 'b']],
    defaults: { wireColor: '#e8590c' },
    get blurb() {
      return tr('跳线把两个孔直接连起来——相当于原理图里的一根导线。颜色只是方便辨认：习惯上红色接正极，黑/蓝色接 GND。', 'A jumper wire joins two holes directly — it\'s a plain wire in the schematic. The colour is only for you: by convention red goes to +, black/blue to GND.');
    },
  },
  resistor: {
    type: 'resistor',
    get name() {
      return tr('电阻', 'Resistor');
    },
    nameEn: 'Resistor',
    category: 'basic',
    refPrefix: 'R',
    placement: { kind: 'two-point', pins: ['1', '2'], get prompts(): [string, string] {
        return [tr('点击电阻第一只脚的位置', 'Click where the resistor\'s first leg goes'), tr('点击电阻第二只脚的位置', 'Click where the resistor\'s second leg goes')];
      } },
    terminals: ['1', '2'],
    terminalOf: identity('1', '2'),
    internal: [],
    symmetric: [['1', '2']],
    defaults: { resistance: 330 },
    get blurb() {
      return tr('电阻限制电流（V = I × R）。没有正负之分，两只脚可以随便插。注意：两只脚不能插在同一列的同一组（a–e）里，否则它就被短路了。', 'A resistor limits current (V = I × R). It has no polarity, so either leg can go anywhere. Careful: don\'t put both legs in the same 5-hole group (a–e of one column), or it\'s shorted out.');
    },
  },
  led: {
    type: 'led',
    get name() {
      return tr('LED 发光二极管', 'LED');
    },
    nameEn: 'LED',
    category: 'basic',
    refPrefix: 'LED',
    placement: {
      kind: 'two-point',
      pins: ['anode', 'cathode'],
      get prompts(): [string, string] {
        return [tr('点击 LED 长脚（正极 / anode）的位置', 'Click where the LED\'s long leg (anode, +) goes'), tr('点击 LED 短脚（负极 / cathode）的位置', 'Click where the LED\'s short leg (cathode, −) goes')];
      },
    },
    terminals: ['anode', 'cathode'],
    terminalOf: identity('anode', 'cathode'),
    internal: [],
    symmetric: [],
    defaults: { color: 'red' },
    get blurb() {
      return tr('LED 只允许电流从长脚（正极 anode）流向短脚（负极 cathode）。几乎总要串联一个限流电阻，否则电流过大会烧坏。', 'An LED only lets current flow from the long leg (anode, +) to the short leg (cathode, −). It almost always needs a series current-limiting resistor, or too much current will burn it out.');
    },
  },
  diode: {
    type: 'diode',
    get name() {
      return tr('二极管', 'Diode');
    },
    nameEn: 'Diode',
    category: 'basic',
    refPrefix: 'D',
    placement: {
      kind: 'two-point',
      pins: ['anode', 'cathode'],
      get prompts(): [string, string] {
        return [tr('点击二极管正极（anode，无色环一端）', 'Click where the diode\'s anode goes (the end without a band)'), tr('点击二极管负极（cathode，有银色环一端）', 'Click where the diode\'s cathode goes (the end with the silver band)')];
      },
    },
    terminals: ['anode', 'cathode'],
    terminalOf: identity('anode', 'cathode'),
    internal: [],
    symmetric: [],
    defaults: {},
    get blurb() {
      return tr('普通二极管（如 1N4148）：电流只能单向通过，导通时约有 0.7 V 压降。有色环的一端是负极。', 'A small signal diode (e.g. 1N4148): current flows one way only, with about 0.7 V drop when conducting. The end with the band is the cathode (−).');
    },
  },
  capacitor: {
    type: 'capacitor',
    get name() {
      return tr('电容', 'Capacitor');
    },
    nameEn: 'Capacitor',
    category: 'basic',
    refPrefix: 'C',
    placement: { kind: 'two-point', pins: ['1', '2'], get prompts(): [string, string] {
        return [tr('点击电容第一只脚', 'Click where the capacitor\'s first leg goes'), tr('点击电容第二只脚', 'Click where the capacitor\'s second leg goes')];
      } },
    terminals: ['1', '2'],
    terminalOf: identity('1', '2'),
    internal: [],
    symmetric: [['1', '2']],
    defaults: { capacitance: 100e-9 },
    get blurb() {
      return tr('瓷片电容（无极性）。本模拟器只算直流稳态：电容充满电后相当于断路，没有电流流过。', 'Ceramic capacitor (no polarity). This simulator only computes the DC steady state: a charged capacitor acts as an open circuit, so no current flows through it.');
    },
  },
  pushbutton: {
    type: 'pushbutton',
    get name() {
      return tr('按键开关', 'Push button');
    },
    nameEn: 'Push button',
    category: 'input',
    refPrefix: 'SW',
    placement: {
      kind: 'footprint',
      get prompt() {
        return tr('点击按键左上角那只脚的位置（推荐放在 e 行，让按键横跨中间凹槽）', 'Click where the button\'s top-left leg goes (row e is best, so the button straddles the centre gap)');
      },
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
    get blurb() {
      return tr('四脚轻触按键：同一侧上下两只脚（跨凹槽方向）内部永远相通；按下时左右两组才接通。所以按键要横跨凹槽放置，左右两列才是“开关的两端”。', '4-leg tactile button: the two legs on the same side (across the gap) are always connected inside; pressing joins the left pair to the right pair. Place it straddling the gap — its left and right columns are the two ends of the switch.');
    },
  },
  switch: {
    type: 'switch',
    get name() {
      return tr('拨动开关', 'Slide switch (SPDT)');
    },
    nameEn: 'Slide switch (SPDT)',
    category: 'input',
    refPrefix: 'S',
    placement: {
      kind: 'footprint',
      get prompt() {
        return tr('点击开关最左边那只脚的位置（三只脚横向占 3 列）', 'Click where the switch\'s leftmost leg goes (its 3 legs take 3 columns)');
      },
      footprint: rowFootprint({ a: [0, 0], com: [0, 1], b: [0, 2] }),
    },
    terminals: ['a', 'com', 'b'],
    terminalOf: identity('a', 'com', 'b'),
    internal: [],
    symmetric: [['a', 'b']],
    defaults: { position: 'a' },
    get blurb() {
      return tr('单刀双掷（SPDT）拨动开关：中间脚 com 与左脚 a 或右脚 b 接通，取决于拨杆位置。只用 com 和一边，就是普通的通/断开关。', 'SPDT slide switch: the middle leg (com) connects to the left leg a or the right leg b, depending on the lever. Use only com and one side for a simple on/off switch.');
    },
  },
  potentiometer: {
    type: 'potentiometer',
    get name() {
      return tr('电位器', 'Potentiometer');
    },
    nameEn: 'Potentiometer',
    category: 'input',
    refPrefix: 'RV',
    placement: {
      kind: 'footprint',
      get prompt() {
        return tr('点击电位器最左边那只脚（三只脚横向占 3 列，中间是滑动端）', 'Click where the pot\'s leftmost leg goes (3 legs in 3 columns; the middle one is the wiper)');
      },
      footprint: rowFootprint({ '1': [0, 0], '2': [0, 1], '3': [0, 2] }),
    },
    terminals: ['1', '2', '3'],
    terminalOf: identity('1', '2', '3'),
    internal: [],
    symmetric: [['1', '3']],
    defaults: { resistance: 10000, wiper: 0.5 },
    get blurb() {
      return tr('可调电阻：1、3 脚之间是固定的总电阻，中间 2 脚（滑动端 wiper）随旋钮移动。两端接电源和 GND，中间脚输出可调电压（分压器）。', 'Adjustable resistor: pins 1 and 3 have the fixed total resistance; the middle pin 2 (the wiper) moves with the knob. Connect the ends to power and GND and the middle pin outputs an adjustable voltage (a voltage divider).');
    },
  },
  battery: {
    type: 'battery',
    get name() {
      return tr('电池', 'Battery');
    },
    nameEn: 'Battery',
    category: 'power',
    refPrefix: 'BAT',
    placement: {
      kind: 'two-point',
      pins: ['+', '-'],
      get prompts(): [string, string] {
        return [tr('点击红线（+ 正极）要插的孔', 'Click the hole for the red lead (+)'), tr('点击黑线（− 负极 / GND）要插的孔', 'Click the hole for the black lead (− / GND)')];
      },
    },
    terminals: ['+', '-'],
    terminalOf: identity('+', '-'),
    internal: [],
    symmetric: [],
    defaults: { variant: '9V' },
    get blurb() {
      return tr('电池有内阻：电流越大，端电压越低。9V 电池内阻约 1.5 Ω，AA 每节约 0.15 Ω，纽扣电池 CR2032 约 15 Ω（所以它只能带很小的负载）。', 'Batteries have internal resistance: the more current, the lower the terminal voltage. A 9V battery has about 1.5 Ω, each AA about 0.15 Ω, a CR2032 coin cell about 15 Ω (so it can only drive tiny loads).');
    },
  },
  bench_supply: {
    type: 'bench_supply',
    get name() {
      return tr('直流稳压电源', 'Bench power supply');
    },
    nameEn: 'Bench power supply',
    category: 'power',
    refPrefix: 'PSU',
    placement: {
      kind: 'two-point',
      pins: ['+', '-'],
      get prompts(): [string, string] {
        return [tr('点击红色鳄鱼夹线（+）要插的孔', 'Click the hole for the red clip lead (+)'), tr('点击黑色鳄鱼夹线（− / COM）要插的孔', 'Click the hole for the black clip lead (− / COM)')];
      },
    },
    terminals: ['+', '-'],
    terminalOf: identity('+', '-'),
    internal: [],
    symmetric: [],
    defaults: { voltage: 5, currentLimit: 0.1 },
    get blurb() {
      return tr('实验室可调电源：设定电压（CV 恒压），并设定限流值。电流超过限流值时自动进入 CC 恒流模式、电压下降——这正是它保护电路、防止短路烧坏东西的方式。', 'Lab bench supply: you set the voltage (CV, constant voltage) and a current limit. If the current tries to exceed the limit, it switches to CC (constant current) and the voltage drops — that is how it protects your circuit from shorts.');
    },
  },
  power_module: {
    type: 'power_module',
    get name() {
      return tr('面包板电源模块', 'Breadboard power module');
    },
    nameEn: 'Breadboard power module',
    category: 'power',
    refPrefix: 'PM',
    placement: {
      kind: 'footprint',
      get prompt() {
        return tr('点击任意一列——模块的针脚会同时插入这一列上下两侧的 4 条电源轨', 'Click any column — the module plugs into all 4 power rails (top and bottom) at that column');
      },
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
    get blurb() {
      return tr('常见的 MB102 面包板电源模块：插在面包板一端，同时给上下两组电源轨供电（5 V 或 3.3 V），用 USB 或 DC 插头取电。注意它的 + 和 − 方向必须对准轨道上的红线和蓝线。', 'The common MB102 breadboard power module: it plugs into one end of the board and powers both pairs of rails (5 V or 3.3 V) from USB or a DC jack. Its + and − must line up with the red and blue lines on the rails.');
    },
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
  red: { hex: '#ff3b30', vf: 1.8, get name() {
      return tr('红', 'Red');
    } },
  yellow: { hex: '#ffcc00', vf: 2.0, get name() {
      return tr('黄', 'Yellow');
    } },
  green: { hex: '#34c759', vf: 2.1, get name() {
      return tr('绿', 'Green');
    } },
  blue: { hex: '#2f7bff', vf: 3.0, get name() {
      return tr('蓝', 'Blue');
    } },
  white: { hex: '#f8f8ff', vf: 3.0, get name() {
      return tr('白', 'White');
    } },
};

export const BATTERIES: Record<BatteryVariant, { voltage: number; rint: number; name: string; maxCurrent: number }> = {
  '9V': { voltage: 9, rint: 1.5, get name() {
      return tr('9V 方块电池', '9V battery');
    }, maxCurrent: 1 },
  '2xAA': { voltage: 3, rint: 0.3, get name() {
      return tr('2 节 AA (3V)', '2 × AA (3V)');
    }, maxCurrent: 2 },
  '3xAA': { voltage: 4.5, rint: 0.45, get name() {
      return tr('3 节 AA (4.5V)', '3 × AA (4.5V)');
    }, maxCurrent: 2 },
  '4xAA': { voltage: 6, rint: 0.6, get name() {
      return tr('4 节 AA (6V)', '4 × AA (6V)');
    }, maxCurrent: 2 },
  CR2032: { voltage: 3, rint: 15, get name() {
      return tr('CR2032 纽扣电池 (3V)', 'CR2032 coin cell (3V)');
    }, maxCurrent: 0.05 },
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

const TERMINAL_LABEL_ZH: Record<string, Record<string, string>> = {
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

const TERMINAL_LABEL_EN: Record<string, Record<string, string>> = {
  led: { anode: 'anode (long leg)', cathode: 'cathode (short leg)' },
  diode: { anode: 'anode', cathode: 'cathode (band end)' },
  battery: { '+': '+ terminal (red lead)', '-': '− terminal (black lead)' },
  bench_supply: { '+': '+ output (red)', '-': '− COM (black)' },
  power_module: { '+': '+ output', '-': '− GND' },
  dc_source: { '+': '+ terminal', '-': '− terminal' },
  potentiometer: { '1': 'pin 1', '2': 'pin 2 (wiper)', '3': 'pin 3' },
  switch: { a: 'pin a', com: 'middle pin com', b: 'pin b' },
  pushbutton: { '1': 'left side', '2': 'right side' },
};

/** Friendly name of a terminal, e.g. "anode (long leg)". */
export function terminalName(type: CompType | PartType, pin: string): string {
  if (getLang() === 'en') return TERMINAL_LABEL_EN[type]?.[pin] ?? `pin ${pin}`;
  return TERMINAL_LABEL_ZH[type]?.[pin] ?? `${pin} 脚`;
}

export function terminalLabel(c: Pick<CComponent, 'ref' | 'type'>, pin: string): string {
  return tr(`${c.ref} 的${terminalName(c.type, pin)}`, `${c.ref} ${terminalName(c.type, pin)}`);
}

export function describeComponent(c: Pick<CComponent, 'type' | 'props'>): string {
  const p = c.props;
  switch (c.type) {
    case 'resistor':
      return tr(`${fmtR(p.resistance)} 电阻`, `${fmtR(p.resistance)} resistor`);
    case 'potentiometer':
      return tr(`${fmtR(p.resistance)} 电位器`, `${fmtR(p.resistance)} potentiometer`);
    case 'led':
      return p.color ? tr(`${LED_COLORS[p.color].name}色 LED`, `${LED_COLORS[p.color].name} LED`) : 'LED';
    case 'battery':
      return BATTERIES[p.variant ?? '9V'].name;
    case 'bench_supply':
      return tr(`稳压电源 ${p.voltage ?? 5}V`, `Bench supply ${p.voltage ?? 5}V`);
    case 'power_module':
      return tr(`电源模块 ${p.voltage ?? 5}V`, `Power module ${p.voltage ?? 5}V`);
    case 'dc_source':
      return tr(`${p.voltage ?? '?'}V 直流电源`, `${p.voltage ?? '?'}V DC source`);
    case 'capacitor':
      return tr('电容', 'Capacitor');
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
