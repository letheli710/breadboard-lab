// Part catalogue: how each part is placed on the board and how its physical legs map
// to the logical terminals used in a Circuit.

import { HOLE_MAP, holeId, isRail, offsetHole } from './breadboard';
import { getLang, tr } from './i18n';
import type { BatteryVariant, CComponent, Circuit, CompType, Layout, LedColor, PartProps, PartType } from './types';
import { pinId } from './types';

/** 'instrument' = measuring / signal tools (ammeter, function generator, scope probe). */
export type Category = 'power' | 'basic' | 'input' | 'wire' | 'instrument';

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
  },  inductor: {
    type: 'inductor',
    get name() {
      return tr('电感', 'Inductor');
    },
    nameEn: 'Inductor',
    category: 'basic',
    refPrefix: 'L',
    placement: { kind: 'two-point', pins: ['1', '2'], get prompts(): [string, string] {
        return [tr('点击电感第一只脚', 'Click where the inductor\'s first leg goes'), tr('点击电感第二只脚', 'Click where the inductor\'s second leg goes')];
      } },
    terminals: ['1', '2'],
    terminalOf: identity('1', '2'),
    internal: [],
    symmetric: [['1', '2']],
    defaults: { inductance: 10e-3 },
    get blurb() {
      return tr(
        '色环电感 / 工字电感（无极性）：一圈圈绕起来的导线。它“抗拒电流的变化”（v = L·di/dt）：直流下就是一段导线（这里按线圈电阻 1 Ω 计算），电流突然变化时两端会出现电压。和电阻串联得到 RL 电路，和电容一起得到会“振铃”的 RLC 电路。',
        'Axial / drum-core inductor (no polarity): a coil of wire. It "resists changes in current" (v = L·di/dt): at DC it is just a piece of wire (simulated as its 1 Ω winding resistance), but when the current changes suddenly a voltage appears across it. With a resistor it forms an RL circuit; with a capacitor, an RLC circuit that "rings".',
      );
    },
  },
  ammeter: {
    type: 'ammeter',
    get name() {
      return tr('电流表', 'Ammeter');
    },
    nameEn: 'Ammeter',
    category: 'instrument',
    refPrefix: 'AM',
    placement: {
      kind: 'two-point',
      pins: ['+', '-'],
      get prompts(): [string, string] {
        return [tr('点击红表笔（+，电流流入端）要插的孔', 'Click the hole for the red lead (+, where current flows in)'), tr('点击黑表笔（COM，电流流出端）要插的孔', 'Click the hole for the black lead (COM, where current flows out)')];
      },
    },
    terminals: ['+', '-'],
    terminalOf: identity('+', '-'),
    internal: [],
    symmetric: [],
    defaults: {},
    get blurb() {
      return tr(
        '万用表拨到电流档（A）。电流表必须串联在电路里：先把电路断开，再让电流从红表笔流进、从黑表笔（COM）流出。它的内阻很小（约 0.1 Ω），所以千万不要把它直接并联在元件或电源两端——那等于短路。读数为负说明电流方向和表笔方向相反。',
        'A multimeter switched to current (A) mode. An ammeter must go in series: break the circuit open and let the current flow in at the red lead and out at the black (COM) lead. Its resistance is tiny (about 0.1 Ω), so never connect it straight across a part or a supply — that is a short circuit. A negative reading means the current flows the other way.',
      );
    },
  },
  opamp: {
    type: 'opamp',
    get name() {
      return tr('运放 LM358', 'Op-amp LM358');
    },
    nameEn: 'Op-amp LM358',
    category: 'basic',
    refPrefix: 'U',
    placement: {
      kind: 'footprint',
      get prompt() {
        return tr(
          '点击 1 脚（缺口旁、有小圆点的那只脚）的位置——必须在 e 行，让芯片横跨中间凹槽；芯片占 4 列（1–4 脚在 e 行，8–5 脚在 f 行）',
          'Click where pin 1 goes (next to the notch, marked with a dot) — it must be in row e so the chip straddles the centre gap; the chip takes 4 columns (pins 1–4 in row e, pins 8–5 in row f)',
        );
      },
      footprint: (anchor) => {
        const h = HOLE_MAP.get(anchor);
        if (!h || h.row !== 'e') return null;
        return rowFootprint({ '1': [0, 0], '2': [0, 1], '3': [0, 2], '4': [0, 3], '8': [1, 0], '7': [1, 1], '6': [1, 2], '5': [1, 3] })(anchor);
      },
    },
    terminals: ['outA', 'inA-', 'inA+', 'v-', 'inB+', 'inB-', 'outB', 'v+'],
    terminalOf: { '1': 'outA', '2': 'inA-', '3': 'inA+', '4': 'v-', '5': 'inB+', '6': 'inB-', '7': 'outB', '8': 'v+' },
    internal: [],
    symmetric: [],
    defaults: {},
    get blurb() {
      return tr(
        'LM358 双运放（DIP-8 封装，里面有 A、B 两个独立的运放，共用电源脚）。必须横跨中间凹槽插，否则两排脚会被金属条短路。8 脚 V+ 接电源正极，4 脚 V− 接 GND（或负电源）——不接电源运放就不工作。运放把 (IN+ − IN−) 放大约 10 万倍，所以几乎总是配合负反馈电阻使用：反相放大 Vout = −Rf/Rin·Vin，同相放大 Vout = (1 + Rf/Rg)·Vin。输出只能在 V− 到 V+ − 1.5 V 之间摆动，超出就“削顶”（clipping）。',
        'LM358 dual op-amp (DIP-8 package with two independent op-amps, A and B, sharing the power pins). It must straddle the centre gap, or the metal strips short its pins together. Pin 8 (V+) goes to the supply +, pin 4 (V−) to GND (or a negative supply) — without power the op-amp does nothing. It amplifies (IN+ − IN−) about 100 000 times, so it is almost always used with negative-feedback resistors: inverting amplifier Vout = −Rf/Rin·Vin, non-inverting Vout = (1 + Rf/Rg)·Vin. The output can only swing between V− and V+ − 1.5 V; beyond that it clips.',
      );
    },
  },
  function_gen: {
    type: 'function_gen',
    get name() {
      return tr('信号发生器', 'Function generator');
    },
    nameEn: 'Function generator',
    category: 'instrument',
    refPrefix: 'FG',
    placement: {
      kind: 'two-point',
      pins: ['+', '-'],
      get prompts(): [string, string] {
        return [tr('点击红色输出夹（信号 +）要插的孔', 'Click the hole for the red output clip (signal +)'), tr('点击黑色夹子（COM / 地）要插的孔', 'Click the hole for the black clip (COM / ground)')];
      },
    },
    terminals: ['+', '-'],
    terminalOf: identity('+', '-'),
    internal: [],
    symmetric: [],
    defaults: { waveform: 'sine', frequency: 1000, amplitude: 1, offset: 0 },
    get blurb() {
      return tr(
        '台式信号发生器：输出正弦波、方波或三角波。可以设定频率、幅度（峰值 Vp；峰峰值 Vpp = 2 × 幅度）和直流偏置。黑夹子（COM）一般接电路的 GND。仪器内部有 50 Ω 输出电阻，所以接上较小的负载时输出会变小。',
        'Bench function generator: outputs a sine, square or triangle wave. You set the frequency, the amplitude (peak Vp; peak-to-peak Vpp = 2 × amplitude) and a DC offset. The black clip (COM) normally goes to the circuit\'s GND. It has a 50 Ω output resistance inside, so a low-resistance load makes the output smaller.',
      );
    },
  },
  scope_probe: {
    type: 'scope_probe',
    get name() {
      return tr('示波器探头', 'Scope probe');
    },
    nameEn: 'Scope probe',
    category: 'instrument',
    refPrefix: 'PR',
    placement: {
      kind: 'two-point',
      pins: ['tip', 'gnd'],
      get prompts(): [string, string] {
        return [tr('点击探头针尖要测量的孔', 'Click the hole the probe tip should measure'), tr('点击探头接地夹要夹的孔（一般是 GND）', 'Click the hole for the probe\'s ground clip (normally GND)')];
      },
    },
    terminals: ['tip', 'gnd'],
    terminalOf: identity('tip', 'gnd'),
    internal: [],
    symmetric: [],
    defaults: { channel: 1 },
    get blurb() {
      return tr(
        '示波器探头：把针尖处电压（相对接地夹）随时间变化的波形显示在示波器屏幕上。第一个探头是 CH1，第二个是 CH2，两条波形一起看可以比较幅度和相位。探头输入电阻很大，几乎不影响电路。注意：真实示波器的接地夹都连在大地上，所以接地夹只能夹在电路的 GND 上。',
        'Oscilloscope probe: shows the voltage at its tip (relative to its ground clip) as a waveform over time on the scope screen. The first probe is CH1, the second CH2; viewing both lets you compare amplitude and phase. A probe has a very high input resistance, so it barely affects the circuit. Note: on a real scope all ground clips are tied to earth, so clip them only to the circuit\'s GND.',
      );
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
  'inductor',
  'opamp',
  'function_gen',
  'scope_probe',
  'ammeter',
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

/** DC power sources. The function generator is *not* one of them (see isSource). */
export const POWER_TYPES: CompType[] = ['battery', 'bench_supply', 'power_module', 'dc_source'];
export const isPower = (t: CompType) => POWER_TYPES.includes(t);
/** Anything that drives the circuit: a DC power source or a function generator. */
export const isSource = (t: CompType) => isPower(t) || t === 'function_gen';
/** Measuring tools that the challenge checker ignores / sees through. */
export const isInstrument = (t: CompType) => t === 'scope_probe' || t === 'ammeter';

/** The component whose − terminal is the circuit's GND (0 V reference): the first DC power
 *  source, or — on a board powered only by a function generator — the first generator. */
export function groundSource<C extends { type: CompType }>(components: C[]): C | undefined {
  return components.find((c) => isPower(c.type)) ?? components.find((c) => c.type === 'function_gen');
}

// ---- electrical models of the stage-C parts (shared by the DC solver and transient.ts) ----
/** Inductor winding resistance (Ω). */
export const INDUCTOR_R = 1;
/** Ammeter burden resistance (Ω). */
export const AMMETER_R = 0.1;
/** Function generator output resistance (Ω). */
export const GEN_R = 50;
/** LM358 model: open-loop gain, output resistance, headroom below V+, minimum supply. */
export const OPAMP = { gain: 1e5, rout: 10, headroom: 1.5, minSupply: 3 } as const;

/** The two halves of the LM358: logical terminal names of each. */
export const OPAMP_HALVES = [
  { half: 'A', out: 'outA', inn: 'inA-', inp: 'inA+' },
  { half: 'B', out: 'outB', inn: 'inB-', inp: 'inB+' },
] as const;

/** Generator settings with defaults filled in. */
export function genSettings(p: PartProps) {
  const d = PARTS.function_gen.defaults;
  return {
    waveform: p.waveform ?? d.waveform!,
    frequency: Math.max(p.frequency ?? d.frequency!, 1e-3),
    amplitude: p.amplitude ?? d.amplitude!,
    offset: p.offset ?? d.offset!,
  };
}

/** Scope channel for a new probe: CH1 if free, else CH2, else null (both taken). */
export function nextScopeChannel(layout: Layout): 1 | 2 | null {
  const used = new Set(layout.parts.filter((p) => p.type === 'scope_probe').map((p) => p.props.channel ?? 1));
  if (!used.has(1)) return 1;
  if (!used.has(2)) return 2;
  return null;
}

/**
 * Every way the terminals of a part can be re-labelled without changing what it does
 * (identity first). Two-element `symmetric` groups give pin swaps; the LM358 additionally
 * allows using half B instead of half A (outA↔outB, inA−↔inB−, inA+↔inB+; power pins shared).
 * Each map is target terminal -> user terminal.
 */
export function pinPermutations(type: CompType): Record<string, string>[] {
  const terms = terminalsOf(type);
  let perms: Record<string, string>[] = [Object.fromEntries(terms.map((t) => [t, t]))];
  for (const group of symmetricOf(type)) {
    if (group.length !== 2) continue;
    const [a, b] = group;
    perms = perms.flatMap((p) => [p, { ...p, [a]: p[b], [b]: p[a] }]);
  }
  if (type === 'opamp') {
    const [A, B] = OPAMP_HALVES;
    perms = perms.flatMap((p) => [p, { ...p, [A.out]: p[B.out], [B.out]: p[A.out], [A.inn]: p[B.inn], [B.inn]: p[A.inn], [A.inp]: p[B.inp], [B.inp]: p[A.inp] }]);
  }
  return perms;
}

/** Net names of each terminal of a component in a circuit (undefined = not on any net). */
export function componentNets(circuit: Circuit, ref: string): Map<string, string | undefined> {
  const c = circuit.components.find((x) => x.ref === ref);
  const out = new Map<string, string | undefined>();
  if (!c) return out;
  for (const t of terminalsOf(c.type)) out.set(t, circuit.nets.find((n) => n.pins.includes(pinId(ref, t)))?.name);
  return out;
}

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
  inductor: { '1': '1 脚', '2': '2 脚' },
  ammeter: { '+': '红表笔（+）', '-': '黑表笔（COM）' },
  function_gen: { '+': '红色输出夹（+）', '-': '黑夹子（COM）' },
  scope_probe: { tip: '探头针尖', gnd: '探头接地夹' },
  opamp: {
    outA: '1 脚 OUT A（输出 A）',
    'inA-': '2 脚 IN− A（反相输入 A）',
    'inA+': '3 脚 IN+ A（同相输入 A）',
    'v-': '4 脚 V−（电源负 / GND）',
    'inB+': '5 脚 IN+ B（同相输入 B）',
    'inB-': '6 脚 IN− B（反相输入 B）',
    outB: '7 脚 OUT B（输出 B）',
    'v+': '8 脚 V+（电源正）',
  },
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
  inductor: { '1': 'pin 1', '2': 'pin 2' },
  ammeter: { '+': 'red lead (+)', '-': 'black lead (COM)' },
  function_gen: { '+': 'red output clip (+)', '-': 'black clip (COM)' },
  scope_probe: { tip: 'probe tip', gnd: 'probe ground clip' },
  opamp: {
    outA: 'pin 1 OUT A (output A)',
    'inA-': 'pin 2 IN− A (inverting input A)',
    'inA+': 'pin 3 IN+ A (non-inverting input A)',
    'v-': 'pin 4 V− (supply − / GND)',
    'inB+': 'pin 5 IN+ B (non-inverting input B)',
    'inB-': 'pin 6 IN− B (inverting input B)',
    outB: 'pin 7 OUT B (output B)',
    'v+': 'pin 8 V+ (supply +)',
  },
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
      return p.capacitance !== undefined ? tr(`${fmtSI(p.capacitance, 'F')} 电容`, `${fmtSI(p.capacitance, 'F')} capacitor`) : tr('电容', 'Capacitor');
    case 'inductor':
      return p.inductance !== undefined ? tr(`${fmtSI(p.inductance, 'H')} 电感`, `${fmtSI(p.inductance, 'H')} inductor`) : tr('电感', 'Inductor');
    case 'function_gen': {
      const w = p.waveform ? { sine: tr('正弦', 'sine'), square: tr('方波', 'square'), triangle: tr('三角波', 'triangle') }[p.waveform] : '';
      const f = p.frequency !== undefined ? fmtSI(p.frequency, 'Hz') : '';
      const a = p.amplitude !== undefined ? tr(`幅度 ${fmtSI(p.amplitude, 'V')}`, `${fmtSI(p.amplitude, 'V')} peak`) : '';
      const extra = [w, f, a].filter(Boolean).join(' ');
      return tr(`信号发生器${extra ? `（${extra}）` : ''}`, `Function generator${extra ? ` (${extra})` : ''}`);
    }
    case 'scope_probe':
      return tr(`示波器探头 CH${p.channel ?? 1}`, `Scope probe CH${p.channel ?? 1}`);
    default:
      return PARTS[c.type].name;
  }
}

function fmtSI(v: number, unit: string) {
  const a = Math.abs(v);
  const table: [number, string][] = [[1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
  for (const [f, pre] of table) if (a >= f * 0.9995) return `${+(v / f).toPrecision(3)}${pre}${unit}`;
  return `${v}${unit}`;
}

function fmtR(r?: number) {
  if (r === undefined) return '';
  if (r >= 1e6) return `${+(r / 1e6).toPrecision(3)}MΩ`;
  if (r >= 1e3) return `${+(r / 1e3).toPrecision(3)}kΩ`;
  return `${+r.toPrecision(3)}Ω`;
}
