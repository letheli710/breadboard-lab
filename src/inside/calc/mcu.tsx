// Calculation cards: circuits around a microcontroller (GPIO and LEDs, pull-ups, clamp diodes, ADC
// and sensor dividers, PWM, transistor and MOSFET switches, regulators, the power budget, I²C pull-ups)
// — lessons 15–16 and phase 5. Model numbers follow src/core/mcu.ts and the lab texts.

import { tr } from '../../core/i18n';
import type { CalcCard, CalcGroup } from '../types';
import { C, D, Dot, Gnd, L, Path, R, T, V, VArrow } from './fig';
import { Arrow, Box, Nmos, Npn } from './figx';

export const group = (): CalcGroup => ({
  id: 'mcu',
  title: tr('单片机外围电路 MCU circuits', 'Microcontroller circuits'),
  intro: tr(
    'GPIO 驱动 LED、上拉下拉、ADC 和传感器分压、PWM、三极管和 MOSFET 开关、稳压器、电流预算、I²C 上拉——第 15、16 课和第 5 期实验。',
    'GPIOs driving LEDs, pull-ups, ADC and sensor dividers, PWM, transistor and MOSFET switches, regulators, the power budget and I²C pull-ups — lessons 15–16 and phase 5.',
  ),
});

/** a GPIO drawn as a box holding "3.3 V behind R_out", its pin at (x + w, y) */
function Pin({ x, y, label = 'GPIO' }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <Box x={x} y={y - 26} w={62} h={52} />
      <T x={x + 31} y={y - 32} cls="small">
        {label}
      </T>
      <path d={`M${x + 12} ${y + 14} V${y - 6}`} className="cf-w thin" />
      <T x={x + 12} y={y + 22} cls="small">
        3.3
      </T>
      <R x1={x + 12} y1={y - 6} x2={x + 62} y2={y - 6} />
      <T x={x + 40} y={y + 16} cls="small">
        R_out
      </T>
      <Dot x={x + 62} y={y - 6} />
    </g>
  );
}

/** a sensor divider: Vcc → top → node → bottom → GND, node to an ADC pin */
function SensorDivider({ top, bottom, out = 'ADC' }: { top: string; bottom: string; out?: string }) {
  return (
    <g>
      <T x={90} y={14}>
        3V3
      </T>
      <Path d="90,18 90,25" />
      <R x1={90} y1={25} x2={90} y2={72} label={top} />
      <R x1={90} y1={78} x2={90} y2={125} label={bottom} />
      <Path d="90,72 90,78" />
      <Gnd x={90} y={128} />
      <Path d="90,75 170,75" />
      <Dot x={90} y={75} />
      <Box x={170} y={58} w={64} h={34}>
        {out}
      </Box>
      <VArrow x={150} y1={122} y2={82} label="V" />
      <Path d="90,125 90,128" />
    </g>
  );
}

const ntcR = (tC: number, r25: number, b: number) => r25 * Math.exp(b * (1 / (tC + 273.15) - 1 / 298.15));

export const cards = (): CalcCard[] => [
  {
    id: 'gpio-led-resistor',
    group: 'mcu',
    title: tr('GPIO 点 LED 的电阻（含引脚内阻）', 'GPIO LED resistor (pin resistance included)'),
    tex: 'R = \\frac{V_{OH} - U_F}{I} - R_{out} - r_d',
    use: tr('单片机引脚直接驱动 LED：串多大的电阻得到想要的电流。', 'An MCU pin driving an LED directly: which series resistor gives the current you want.'),
    vars: [
      { sym: 'V_OH', name: tr('引脚高电平（空载）', 'pin high level (unloaded)'), unit: 'V', def: 3.3 },
      { sym: 'U_F', name: tr('LED 正向压降（红 1.8 V）', 'LED forward voltage (red 1.8 V)'), unit: 'V', def: 1.8 },
      { sym: 'I', name: tr('想要的电流（≤ 20 mA）', 'wanted current (≤ 20 mA)'), unit: 'A', def: 0.01 },
      { sym: 'R_out', name: tr('引脚输出电阻（ESP32 25 Ω、Blue Pill 40 Ω）', 'pin output resistance (ESP32 25 Ω, Blue Pill 40 Ω)'), unit: 'Ω', def: 25, min: 0 },
      { sym: 'r_d', name: tr('LED 内阻', 'LED resistance'), unit: 'Ω', def: 12, min: 0 },
    ],
    out: { sym: 'R', name: tr('串联电阻（再取一个标准值）', 'series resistor (then pick a standard value)'), unit: 'Ω' },
    compute: (v) => (v.V_OH - v.U_F) / v.I - v.R_out - v.r_d,
    why: tr(
      `1. 输出高电平的引脚不是理想电压源：它像 3.3 V 串一个输出电阻 $R_{out}$（芯片里 MOS 管的导通电阻）。
2. LED 用折线模型：$U_F$ 串 $r_d$。
3. 回路 KVL：$V_{OH} = I(R_{out} + R + r_d) + U_F$。
4. 解出 $R = \\frac{V_{OH} - U_F}{I} - R_{out} - r_d$，取最接近的标准值，再回算电流：$I = \\frac{V_{OH} - U_F}{R + R_{out} + r_d}$。
5. 灌电流（LED 接 3V3、阴极接引脚、输出低电平点亮）公式一样，$R_{out}$ 换成下管的电阻。`,
      `1. A pin driving high is not an ideal source: it is 3.3 V behind an output resistance $R_{out}$ (the on-resistance of a MOS transistor in the chip).
2. The LED is the piecewise model $U_F$ plus $r_d$.
3. KVL around the loop: $V_{OH} = I(R_{out} + R + r_d) + U_F$.
4. Solve: $R = \\frac{V_{OH} - U_F}{I} - R_{out} - r_d$, pick the nearest standard value, then recompute the current: $I = \\frac{V_{OH} - U_F}{R + R_{out} + r_d}$.
5. Sinking (LED from 3V3, cathode to the pin, lit by output LOW) is the same formula with the low-side transistor’s resistance as $R_{out}$.`,
    ),
    example: tr(
      `- 实验 5-1：10 mA：$\\frac{1.5}{0.01} - 25 - 12 = 113 Ω$ → 120 Ω，$I = \\frac{1.5}{157} ≈ 9.5 mA$。不串电阻：$\\frac{1.5}{37} ≈ 40 mA$——到了绝对最大值。
- 第 15 课：330 Ω：$\\frac{1.5}{330 + 25 + 12} ≈ 4.1 mA$。
- 实验 5-2（Blue Pill，40 Ω）：220 Ω：$\\frac{1.5}{272} ≈ 5.5 mA$；板载 LED 510 Ω：≈ 2.7 mA。`,
      `- Lab 5-1: 10 mA: $\\frac{1.5}{0.01} - 25 - 12 = 113 Ω$ → 120 Ω, $I = \\frac{1.5}{157} ≈ 9.5 mA$. No resistor: $\\frac{1.5}{37} ≈ 40 mA$ — the absolute maximum.
- Lesson 15: 330 Ω: $\\frac{1.5}{330 + 25 + 12} ≈ 4.1 mA$.
- Lab 5-2 (Blue Pill, 40 Ω): 220 Ω: $\\frac{1.5}{272} ≈ 5.5 mA$; the onboard LED with 510 Ω: ≈ 2.7 mA.`,
    ),
    pitfalls: [
      tr(
        '蓝 / 白 LED（$U_F$ ≈ 3 V）在 3.3 V 引脚上只剩 0.3 V 给电阻：亮度对一切都很敏感——用三极管从 5 V 驱动。',
        'A blue / white LED ($U_F$ ≈ 3 V) leaves only 0.3 V for the resistor on a 3.3 V pin: everything changes the brightness — drive it from 5 V through a transistor.',
      ),
      tr('每个引脚建议 ≤ 20 mA，所有引脚加起来也有上限（STM32F103 共 150 mA）。', 'Keep each pin ≤ 20 mA; all pins together have a limit too (150 mA on the STM32F103).'),
    ],
    Figure: () => (
      <g>
        <Pin x={10} y={60} />
        <Path d="72,54 90,54" />
        <R x1={90} y1={54} x2={160} y2={54} label="R" />
        <Path d="160,54 200,54 200,62" />
        <D x1={200} y1={62} x2={200} y2={110} label="U_F" led />
        <Path d="200,110 200,125" />
        <Gnd x={200} y={125} />
        <Arrow x={180} y={54} label="I" ly={46} />
      </g>
    ),
    teardowns: ['devboard', 'led'],
    lessons: ['exp5-gpio-led-resistor', 'lesson-mcu-gpio', 'exp5-sink-vs-source', 'lesson-mcu-pwm-adc', 'exp5-ldo-dropout', 'exp5-board-power-budget', 'exp5-capstone-ntc-fan'],
    chapter: 'basics',
  },
  {
    id: 'gpio-output-resistance',
    group: 'mcu',
    title: tr('引脚的输出电阻（从读数反推）', 'A pin’s output resistance (from readings)'),
    tex: 'R_{out} = \\frac{V_{DD} - U_{pin}}{I}',
    use: tr(
      '输出高电平时测到引脚电压和电流，算出引脚的内阻；也能预测重载时引脚掉到多少。',
      'From the pin voltage and current while driving high, find the pin’s internal resistance — and predict how far it sags under load.',
    ),
    vars: [
      { sym: 'V_DD', name: tr('空载高电平', 'unloaded high level'), unit: 'V', def: 3.3 },
      { sym: 'U_pin', name: tr('带载时测到的引脚电压', 'measured pin voltage under load'), unit: 'V', def: 3.06 },
      { sym: 'I', name: tr('引脚电流', 'pin current'), unit: 'A', def: 0.0095 },
    ],
    out: { sym: 'R_out', name: tr('输出电阻', 'output resistance'), unit: 'Ω' },
    compute: (v) => (v.V_DD - v.U_pin) / v.I,
    why: tr(
      `1. 输出高电平 = 3.3 V 串 $R_{out}$（戴维宁模型）。
2. 有电流流出时，$R_{out}$ 上压降 $IR_{out}$，引脚电压 $U_{pin} = V_{DD} - IR_{out}$。
3. 量出 $U_{pin}$ 和 I，反解 $R_{out}$。
4. 低电平同理：$R_{low} = \\frac{U_{OL}}{I}$（电流流进引脚）。
5. 引脚电压掉到 $V_{IH}$ 以下，别的芯片就不认它是高电平了。`,
      `1. Driving high = 3.3 V behind $R_{out}$ (a Thevenin model).
2. With current flowing out, $R_{out}$ drops $IR_{out}$ and the pin sits at $U_{pin} = V_{DD} - IR_{out}$.
3. Measure $U_{pin}$ and I and solve for $R_{out}$.
4. Driving low likewise: $R_{low} = \\frac{U_{OL}}{I}$ (current flowing into the pin).
5. Once the pin falls below $V_{IH}$, other chips no longer read it as high.`,
    ),
    example: tr(
      '实验 5-1：$\\frac{3.3 - 3.06}{9.5 mA} ≈ 25 Ω$。第 15 课：$\\frac{3.3 - 3.20}{4.1 mA} ≈ 25 Ω$；20 mA 时引脚只剩约 2.8 V，40 mA 时 2.29 V < $V_{IH}$（2.475 V）。实验 5-2：$\\frac{0.22 V}{5.5 mA} = 40 Ω$。',
      'Lab 5-1: $\\frac{3.3 - 3.06}{9.5 mA} ≈ 25 Ω$. Lesson 15: $\\frac{3.3 - 3.20}{4.1 mA} ≈ 25 Ω$; at 20 mA the pin is down to about 2.8 V, at 40 mA 2.29 V < $V_{IH}$ (2.475 V). Lab 5-2: $\\frac{0.22 V}{5.5 mA} = 40 Ω$.',
    ),
    pitfalls: [
      tr(
        '真实芯片的输出电阻随电流、温度和固件里的驱动强度设置变化；这里的 25 Ω / 40 Ω 是模型值。',
        'A real chip’s output resistance changes with current, temperature and the drive strength set in firmware; 25 Ω / 40 Ω are model values.',
      ),
    ],
    Figure: () => (
      <g>
        <Pin x={20} y={70} />
        <Path d="82,64 180,64 180,72" />
        <R x1={180} y1={72} x2={180} y2={120} label="load" />
        <Gnd x={180} y={124} />
        <Path d="180,120 180,124" />
        <VArrow x={120} y1={118} y2={70} label="U_pin" />
        <Arrow x={150} y={64} label="I" ly={56} />
      </g>
    ),
    teardowns: ['devboard'],
    lessons: ['lesson-mcu-gpio', 'exp5-gpio-led-resistor', 'exp5-sink-vs-source', 'lesson-mcu-pwm-adc'],
    chapter: 'equivalence',
  },
  {
    id: 'pullup-current',
    group: 'mcu',
    title: tr('上拉 / 下拉电阻的电流', 'Pull-up / pull-down current'),
    tex: 'I = \\frac{U}{R_{pull}}',
    use: tr(
      '按键按下（或开漏输出拉低）时，上拉 / 下拉电阻上流多少电流。',
      'How much current a pull-up / pull-down carries while the button is pressed (or an open-drain output pulls low).',
    ),
    vars: [
      { sym: 'U', name: tr('电阻两端的电压', 'voltage across the resistor'), unit: 'V', def: 3.3 },
      { sym: 'R', name: tr('上拉 / 下拉电阻（ESP32 内部 ≈ 45 kΩ）', 'pull resistor (ESP32 internal ≈ 45 kΩ)'), unit: 'Ω', def: 45000 },
    ],
    out: { sym: 'I', name: tr('按下时的电流', 'current while pressed'), unit: 'A' },
    compute: (v) => v.U / v.R,
    why: tr(
      `1. CMOS 输入几乎不取电流（> 10 MΩ）：松开时上拉电阻上没有电流、没有压降，引脚就在 3.3 V（读 1）。
2. 按下时按键把引脚接到 GND（≈ 0 Ω 远小于 R），电阻两端是整个电源电压：$I = \\frac{U}{R}$，引脚读 0。
3. 太小（比如 220 Ω）：按下时白白耗 15 mA；太大（1 MΩ）：抗干扰差、长线容易误触发。按键常用 4.7–10 kΩ。
4. 开漏输出拉低时同理：$I = \\frac{U_{pull}}{R + R_{low}}$，引脚低电平 $U_{OL} = IR_{low}$。`,
      `1. A CMOS input draws almost nothing (> 10 MΩ): released, the pull-up carries no current and drops nothing, so the pin sits at 3.3 V (reads 1).
2. Pressed, the button ties the pin to GND (≈ 0 Ω, far below R), so the whole supply is across the resistor: $I = \\frac{U}{R}$ and the pin reads 0.
3. Too small (say 220 Ω) wastes 15 mA while pressed; too large (1 MΩ) picks up noise and false-triggers on long wires. Buttons usually get 4.7–10 kΩ.
4. An open-drain output pulling low is the same: $I = \\frac{U_{pull}}{R + R_{low}}$, with a low level of $U_{OL} = IR_{low}$.`,
    ),
    example: tr(
      `- 第 15 课、实验 5-3：内部上拉 $\\frac{3.3}{45k} ≈ 73 µA$；外部 10 kΩ 下拉 $\\frac{3.3}{10k} = 0.33 mA$。
- 实验 5-11：5 V 上拉 4.7 kΩ，开漏拉低：$\\frac{4.69}{4.7k} ≈ 0.99 mA$，$U_{OL} = 40 × 0.99 mA ≈ 40 mV$。
- 实验 5-10：5 V 信号进 FT 引脚又开了内部上拉：$\\frac{4.69 - 3.3}{40k} ≈ 35 µA$ 倒灌进 3V3。
- 实验 5-16：2.2 kΩ 的 I²C 线拉低：$\\frac{3.3}{2.2k + 40} ≈ 1.47 mA$。`,
      `- Lesson 15, lab 5-3: internal pull-up $\\frac{3.3}{45k} ≈ 73 µA$; external 10 kΩ pull-down $\\frac{3.3}{10k} = 0.33 mA$.
- Lab 5-11: a 4.7 kΩ pull-up to 5 V, open-drain low: $\\frac{4.69}{4.7k} ≈ 0.99 mA$, $U_{OL} = 40 × 0.99 mA ≈ 40 mV$.
- Lab 5-10: a 5 V signal on an FT pin with the internal pull-up on: $\\frac{4.69 - 3.3}{40k} ≈ 35 µA$ flows back into 3V3.
- Lab 5-16: a 2.2 kΩ I²C line pulled low: $\\frac{3.3}{2.2k + 40} ≈ 1.47 mA$.`,
    ),
    pitfalls: [
      tr('ESP32 的 GPIO34–39 没有内部上下拉：设成“输入 + 上拉”也是悬空。', 'ESP32 GPIO34–39 have no internal pulls: "input + pull-up" there is still floating.'),
      tr('5 V 信号的 FT 引脚不要开内部上拉。', 'Don’t enable the internal pull-up on an FT pin that sees 5 V.'),
    ],
    Figure: () => (
      <g>
        <T x={60} y={14}>
          3V3
        </T>
        <Path d="60,18 60,25" />
        <R x1={60} y1={25} x2={60} y2={80} label="R_pull" />
        <Path d="60,80 60,90 170,90" />
        <Dot x={60} y={90} />
        <Box x={170} y={74} w={62} h={32}>
          {tr('输入', 'input')}
        </Box>
        <Path d="60,90 60,100" />
        <path d="M60 100 L75 118 M60 122 V132" className="cf-w" fill="none" />
        <Dot x={60} y={100} />
        <Dot x={60} y={122} />
        <Gnd x={60} y={132} />
        <T x={84} y={116} anchor="start" cls="small">
          SW
        </T>
        <Arrow x={48} y={52} dir="d" label="I" lx={34} />
      </g>
    ),
    teardowns: ['switches', 'devboard'],
    lessons: ['lesson-mcu-gpio', 'exp5-button-pull-resistors', 'exp5-open-drain-level-shifter', 'exp5-5v-signal-level-shift', 'exp5-i2c-pullup-rise-time'],
    chapter: 'basics',
  },
  {
    id: 'clamp-current',
    group: 'mcu',
    title: tr('钳位二极管的注入电流（5 V 进 3.3 V 引脚）', 'Clamp-diode current (5 V into a 3.3 V pin)'),
    tex: 'I = \\frac{U_{in} - V_{DD} - U_F}{R_s + r_d}',
    use: tr(
      '高于 VDD 的信号接到普通（非 FT）引脚：经内部钳位二极管灌进 3V3 的电流有多大。',
      'A signal above VDD on an ordinary (non-FT) pin: how much current the internal clamp diode pushes into 3V3.',
    ),
    vars: [
      { sym: 'U_in', name: tr('输入信号（5V 引脚经 USB 二极管后 ≈ 4.69 V）', 'input signal (the 5V pin after the USB diode ≈ 4.69 V)'), unit: 'V', def: 4.69 },
      { sym: 'V_DD', name: tr('芯片电源', 'chip supply'), unit: 'V', def: 3.3 },
      { sym: 'U_F', name: tr('钳位二极管压降', 'clamp diode drop'), unit: 'V', def: 0.6 },
      { sym: 'R_s', name: tr('串联电阻（直接接就填 0）', 'series resistor (0 if wired straight)'), unit: 'Ω', def: 0, min: 0 },
      { sym: 'r_d', name: tr('二极管内阻（模型 15 Ω）', 'diode resistance (model 15 Ω)'), unit: 'Ω', def: 15, min: 0 },
    ],
    out: { sym: 'I', name: tr('注入电流', 'injected current'), unit: 'A' },
    compute: (v) => Math.max(0, (v.U_in - v.V_DD - v.U_F) / (v.R_s + v.r_d)),
    why: tr(
      `1. 普通引脚里有一只二极管从引脚接到 VDD（防静电）。引脚电压超过 $V_{DD} + U_F$ 它就导通。
2. 电流路径：信号 → 串联电阻 → 钳位二极管 → 3V3 电源轨。KVL 给出上面的公式。
3. 没有串联电阻时只剩二极管内阻限流：几十 mA，远超数据手册允许的约 5 mA，还会把 3V3 “反向供电”。
4. 办法：分压到 3.3 V 以下，或者串一个大电阻把电流限到 µA 级，或者用 **FT（耐 5 V）引脚**——它没有到 VDD 的二极管。`,
      `1. An ordinary pin has a diode from the pin to VDD (ESD protection). It conducts once the pin goes above $V_{DD} + U_F$.
2. The current path: signal → series resistor → clamp diode → the 3V3 rail. KVL gives the formula above.
3. With no series resistor only the diode’s resistance limits it: tens of mA, far above the ≈ 5 mA the datasheet allows, and it back-powers the 3V3 rail.
4. Fixes: divide the signal below 3.3 V, or limit the current to µA with a big series resistor, or use an **FT (5 V tolerant) pin**, which has no diode to VDD.`,
    ),
    example: tr(
      '实验 5-10 初始电路：$\\frac{4.69 - 3.3 - 0.6}{15} ≈ 53 mA$（诊断报 52 mA），PA0 损坏。实验 5-11：4.7 kΩ 上拉开漏到 PA0：$\\frac{0.79}{4715} ≈ 0.17 mA$，引脚被钳在约 3.9 V，输出不到 5 V。',
      'Lab 5-10’s starting board: $\\frac{4.69 - 3.3 - 0.6}{15} ≈ 53 mA$ (the diagnostics say 52 mA) and PA0 is damaged. Lab 5-11: open-drain with a 4.7 kΩ pull-up on PA0: $\\frac{0.79}{4715} ≈ 0.17 mA$, and the pin is clamped at about 3.9 V — it can’t output 5 V.',
    ),
    pitfalls: [
      tr('ESP32 没有任何耐 5 V 的引脚。', 'The ESP32 has no 5 V tolerant pins at all.'),
      tr('FT 引脚在模拟（ADC）模式下也不耐 5 V。', 'An FT pin is not 5 V tolerant in analog (ADC) mode either.'),
    ],
    Figure: () => (
      <g>
        <T x={30} y={84} anchor="start">
          5 V
        </T>
        <Path d="55,80 70,80" />
        <R x1={70} y1={80} x2={130} y2={80} label="Rₛ" />
        <Path d="130,80 150,80" />
        <Box x={150} y={20} w={95} h={115} />
        <T x={197} y={130} cls="small">
          MCU
        </T>
        <Path d="150,80 190,80 190,70" />
        <D x1={190} y1={70} x2={190} y2={35} />
        <Path d="190,35 190,28 230,28" />
        <T x={232} y={24} anchor="end" cls="small">
          V_DD
        </T>
        <Dot x={150} y={80} />
        <Arrow x={205} y={52} dir="u" label="I" />
      </g>
    ),
    teardowns: ['devboard', 'diode'],
    lessons: ['exp5-5v-signal-level-shift', 'exp5-open-drain-level-shifter'],
    chapter: 'nonlinear',
  },
  {
    id: 'adc-code',
    group: 'mcu',
    title: tr('ADC 读数 raw = V/Vref × 4095', 'ADC code raw = V/Vref × 4095'),
    tex: 'raw = \\frac{V}{V_{ref}} × (2^{N} - 1)',
    use: tr('一个电压在 N 位 ADC 上读出多少（0 … 4095）。', 'What an N-bit ADC reads for a voltage (0 … 4095).'),
    vars: [
      { sym: 'V', name: tr('ADC 引脚电压', 'voltage on the ADC pin'), unit: 'V', def: 1.65 },
      { sym: 'V_ref', name: tr('满量程（参考电压）', 'full scale (reference)'), unit: 'V', def: 3.3 },
      { sym: 'N', name: tr('位数', 'bits'), unit: '', def: 12 },
    ],
    out: { sym: 'raw', name: tr('读数', 'reading'), unit: '' },
    compute: (v) => {
      const top = 2 ** Math.round(v.N) - 1;
      return Math.min(top, Math.max(0, Math.round((v.V / v.V_ref) * top)));
    },
    why: tr(
      `1. N 位 ADC 把 0 … $V_{ref}$ 分成 $2^{N}$ 个台阶：12 位就是 4096 个，读数 0 … 4095。
2. 线性换算：$raw = \\frac{V}{V_{ref}} × 4095$，四舍五入成整数。
3. 一个 LSB（最低位）= $\\frac{V_{ref}}{4095} ≈ 0.81 mV$：这是分辨率。
4. 固件反过来：$V = raw × \\frac{V_{ref}}{4095}$。
5. 引脚电压超过 $V_{ref}$ 读数就停在 4095；超过 3.3 V（加二极管压降）引脚会坏——先分压。`,
      `1. An N-bit ADC splits 0 … $V_{ref}$ into $2^{N}$ steps: 4096 for 12 bits, readings 0 … 4095.
2. Linear: $raw = \\frac{V}{V_{ref}} × 4095$, rounded to an integer.
3. One LSB = $\\frac{V_{ref}}{4095} ≈ 0.81 mV$: the resolution.
4. Firmware goes back: $V = raw × \\frac{V_{ref}}{4095}$.
5. Above $V_{ref}$ the reading sticks at 4095; above 3.3 V (plus a diode drop) the pin is damaged — divide first.`,
    ),
    example: tr(
      '第 16 课：1.65 V → 2048。实验 5-4：8.4 V 电池分压后 2.084 V → 2586。实验 5-6：25 °C 1.649 V → 2046，80 °C 0.372 V → 461。实验 5-10：3.13 V → 3879。',
      'Lesson 16: 1.65 V → 2048. Lab 5-4: the 8.4 V battery divided to 2.084 V → 2586. Lab 5-6: 25 °C, 1.649 V → 2046; 80 °C, 0.372 V → 461. Lab 5-10: 3.13 V → 3879.',
    ),
    pitfalls: [
      tr(
        'ESP32 的 ADC 在 0.15 V 以下和 2.45 V 以上不线性，要校准；用 ADC1（GPIO32–39），ADC2 开 Wi-Fi 时不能用。',
        'The ESP32 ADC is non-linear below 0.15 V and above 2.45 V and needs calibrating; use ADC1 (GPIO32–39) — ADC2 is unavailable with Wi-Fi on.',
      ),
    ],
    teardowns: ['pwm-adc'],
    lessons: [
      'lesson-mcu-pwm-adc',
      'exp5-adc-battery-divider',
      'exp5-ldr-light-sensor',
      'exp5-ntc-thermometer',
      'exp5-pwm-rc-dac',
      'exp5-capstone-ntc-fan',
      'exp5-5v-signal-level-shift',
    ],
  },
  {
    id: 'adc-divider',
    group: 'mcu',
    title: tr('电池电压监测：从 ADC 读数算回电池电压', 'Battery monitor: from the ADC code back to the battery'),
    tex: 'V_{bat} = raw × \\frac{V_{ref}}{4095} × \\frac{R_1 + R_2}{R_2}',
    use: tr('电池经分压电阻接 ADC：固件怎样把读数换成电池电压。', 'A battery read through a divider: how the firmware turns the reading into the battery voltage.'),
    vars: [
      { sym: 'raw', name: tr('ADC 读数', 'ADC reading'), unit: '', def: 2586 },
      { sym: 'R_1', name: tr('上电阻（接电池）', 'top resistor (to the battery)'), unit: 'Ω', def: 100000 },
      { sym: 'R_2', name: tr('下电阻（接地）', 'bottom resistor (to ground)'), unit: 'Ω', def: 33000 },
      { sym: 'V_ref', name: tr('ADC 满量程', 'ADC full scale'), unit: 'V', def: 3.3 },
    ],
    out: { sym: 'V_bat', name: tr('电池电压', 'battery voltage'), unit: 'V' },
    compute: (v) => ((v.raw * v.V_ref) / 4095) * ((v.R_1 + v.R_2) / v.R_2),
    why: tr(
      `1. 分压比 $k = \\frac{R_2}{R_1 + R_2}$，ADC 看到 $V_{ADC} = kV_{bat}$。
2. ADC：$V_{ADC} = raw × \\frac{V_{ref}}{4095}$。
3. 合起来：$V_{bat} = \\frac{raw × V_{ref}}{4095 k}$——每个读数对应 $\\frac{V_{ref}}{4095k}$ 伏。
4. 选电阻：最高电池电压 × k 要低于 ADC 的线性区上限（ESP32 约 2.45 V），还要给错误的充电器留余量：能承受到 $\\frac{V_{ref}}{k}$。
5. 代价：分压器一直从电池取 $\\frac{V_{bat}}{R_1 + R_2}$；ADC 看到的源阻抗是 $R_1 ∥ R_2$，所以引脚上并一个 100 nF。`,
      `1. The divider ratio is $k = \\frac{R_2}{R_1 + R_2}$; the ADC sees $V_{ADC} = kV_{bat}$.
2. The ADC: $V_{ADC} = raw × \\frac{V_{ref}}{4095}$.
3. Together: $V_{bat} = \\frac{raw × V_{ref}}{4095 k}$ — each count is worth $\\frac{V_{ref}}{4095k}$ volts.
4. Choosing the resistors: the highest battery voltage × k must stay below the ADC’s linear limit (about 2.45 V on an ESP32), with room for a wrong charger: it survives up to $\\frac{V_{ref}}{k}$.
5. The price: the divider always draws $\\frac{V_{bat}}{R_1 + R_2}$ from the battery; the ADC sees a source impedance of $R_1 ∥ R_2$, hence the 100 nF on the pin.`,
    ),
    example: tr(
      '实验 5-4：$k = \\frac{33}{133} ≈ 0.248$；2586 → $2586 × \\frac{3.3}{4095} ÷ 0.248 ≈ 8.40 V$，每个读数 ≈ 3.25 mV。最高能测 $\\frac{3.3}{0.248} ≈ 13.3 V$；分压电流 $\\frac{8.4}{133k} ≈ 63 µA$（一年约 550 mAh）。',
      'Lab 5-4: $k = \\frac{33}{133} ≈ 0.248$; 2586 → $2586 × \\frac{3.3}{4095} ÷ 0.248 ≈ 8.40 V$, about 3.25 mV per count. It can read up to $\\frac{3.3}{0.248} ≈ 13.3 V$; the divider draws $\\frac{8.4}{133k} ≈ 63 µA$ (about 550 mAh a year).',
    ),
    pitfalls: [
      tr('电池负极（电源 −）必须和开发板 GND 相连，否则 ADC 量到的是悬空电压。', 'The battery negative must be tied to the board GND, or the ADC measures a floating voltage.'),
      tr('分压比写反成 $\\frac{R_1}{R_1 + R_2}$。', 'Writing the ratio upside down as $\\frac{R_1}{R_1 + R_2}$.'),
    ],
    Figure: () => (
      <g>
        <V x={30} y1={40} y2={110} label="" />
        <T x={48} y={140} anchor="start" cls="small">
          V_bat
        </T>
        <Path d="30,40 30,20 110,20 110,25" />
        <R x1={110} y1={25} x2={110} y2={70} label="R₁" />
        <R x1={110} y1={80} x2={110} y2={125} label="R₂" />
        <Path d="110,70 110,80" />
        <Path d="30,110 30,128 165,128" />
        <Path d="110,125 110,128" />
        <Path d="110,75 165,75" />
        <C x1={165} y1={75} x2={165} y2={128} label="" />
        <Path d="165,75 190,75" />
        <Box x={190} y={60} w={56} h={30}>
          ADC
        </Box>
        <Dot x={110} y={75} />
        <Gnd x={110} y={132} />
      </g>
    ),
    teardowns: ['pwm-adc'],
    lessons: ['exp5-adc-battery-divider'],
    chapter: 'equivalence',
  },
  {
    id: 'sensor-best-resistor',
    group: 'mcu',
    title: tr('传感器分压：固定电阻取几何平均', 'Sensor divider: the geometric-mean resistor'),
    tex: 'R_1 = \\sqrt{R_{a} R_{b}}',
    use: tr('光敏 / 热敏电阻要在 Rₐ … R_b 范围内都分得开：固定电阻选多大。', 'An LDR / NTC that must be resolved over Rₐ … R_b: which fixed resistor to pair it with.'),
    vars: [
      { sym: 'R_a', name: tr('传感器一端的阻值（如最暗）', 'sensor resistance at one end (e.g. darkest)'), unit: 'Ω', def: 75000 },
      { sym: 'R_b', name: tr('另一端的阻值（如最亮）', 'at the other end (e.g. brightest)'), unit: 'Ω', def: 600 },
    ],
    out: { sym: 'R_1', name: tr('最合适的固定电阻', 'best fixed resistor'), unit: 'Ω' },
    compute: (v) => Math.sqrt(v.R_a * v.R_b),
    why: tr(
      `1. 分压输出 $V = V_{cc}\\frac{R_1}{R_1 + R_s}$（传感器在上）。
2. 传感器的阻值按倍数变（光每 ×10，电阻 ÷5），所以要看 V 对 $ln R_s$ 的灵敏度：$|\\frac{dV}{d ln R_s}| = V_{cc}\\frac{R_1R_s}{(R_1 + R_s)^{2}}$。
3. 这个式子在 $R_1 = R_s$ 时最大（V = Vcc/2，曲线最陡）。
4. 要覆盖一个范围，就让范围的“对数中点”落在最陡处：$R_1 = \\sqrt{R_aR_b}$，两端也对称地分开。
5. 只关心一个点（比如 10 lux 开灯）就取那一点的阻值。`,
      `1. The divider gives $V = V_{cc}\\frac{R_1}{R_1 + R_s}$ (sensor on top).
2. The sensor changes by factors (×10 light, ÷5 resistance), so what matters is V’s sensitivity to $ln R_s$: $|\\frac{dV}{d ln R_s}| = V_{cc}\\frac{R_1R_s}{(R_1 + R_s)^{2}}$.
3. That peaks at $R_1 = R_s$ (V = Vcc/2, the steepest part).
4. To cover a range, put the range’s logarithmic middle at the steepest point: $R_1 = \\sqrt{R_aR_b}$; both ends then spread symmetrically.
5. If you care about one point only (say 10 lux for "lights on"), use the sensor’s resistance there.`,
    ),
    example: tr(
      '实验 5-5：1–1000 lux，$\\sqrt{75k × 0.6k} ≈ 6.7 kΩ$ → 6.8 kΩ。换成 100 kΩ：亮处挤在 3.2–3.3 V；1 kΩ：暗处挤在 0 V 附近。实验 5-6：0–50 °C 的 NTC $\\sqrt{33.6k × 3.59k} ≈ 11 kΩ$，所以用 10 kΩ = R₂₅。',
      'Lab 5-5: 1–1000 lux, $\\sqrt{75k × 0.6k} ≈ 6.7 kΩ$ → 6.8 kΩ. With 100 kΩ the bright end crowds into 3.2–3.3 V; with 1 kΩ the dark end crowds near 0 V. Lab 5-6: an NTC over 0–50 °C gives $\\sqrt{33.6k × 3.59k} ≈ 11 kΩ$, hence 10 kΩ = R₂₅.',
    ),
    lessons: ['exp5-ldr-light-sensor', 'exp5-ntc-thermometer', 'exp5-capstone-ntc-fan'],
  },
  {
    id: 'ldr-divider',
    group: 'mcu',
    title: tr('光敏电阻分压 LDR divider', 'LDR divider'),
    tex: 'R_{LDR} = 15 kΩ × (\\frac{lux}{10})^{-0.7}, V = V_{cc}\\frac{R_1}{R_1 + R_{LDR}}',
    use: tr(
      '某个光照下光敏电阻多大、ADC 引脚上是多少伏（LDR 在上、固定电阻在下）。',
      'The LDR’s resistance at a light level and the voltage on the ADC pin (LDR on top, fixed resistor below).',
    ),
    vars: [
      { sym: 'lux', name: tr('光照', 'light level'), unit: 'lx', def: 100 },
      { sym: 'R_1', name: tr('下面的固定电阻', 'fixed resistor below'), unit: 'Ω', def: 6800 },
      { sym: 'V_cc', name: tr('分压器电源', 'divider supply'), unit: 'V', def: 3.3 },
    ],
    out: { sym: 'V', name: tr('ADC 引脚电压', 'ADC pin voltage'), unit: 'V' },
    compute: (v) => {
      const r = Math.min(1e6, Math.max(100, 15000 * Math.pow(v.lux / 10, -0.7)));
      return (v.V_cc * v.R_1) / (v.R_1 + r);
    },
    why: tr(
      `1. 模型（类似 GL5528）：$R_{LDR} = 15 kΩ × (\\frac{lux}{10})^{-0.7}$——光每强 10 倍，电阻变成 $10^{-0.7} ≈ \\frac{1}{5}$。
2. LDR 在上、R₁ 在下：$V = V_{cc}\\frac{R_1}{R_1 + R_{LDR}}$，**越亮电压越高**。
3. 固件反算阻值：$R_{LDR} = R_1\\frac{V_{cc} - V}{V}$，再换成 lux。
4. 位置对调（R₁ 在上）就是越亮越低，固件判断要跟着改。`,
      `1. The model (GL5528-like): $R_{LDR} = 15 kΩ × (\\frac{lux}{10})^{-0.7}$ — each ×10 in light multiplies the resistance by $10^{-0.7} ≈ \\frac{1}{5}$.
2. LDR on top, R₁ below: $V = V_{cc}\\frac{R_1}{R_1 + R_{LDR}}$ — **brighter means higher**.
3. Firmware works back: $R_{LDR} = R_1\\frac{V_{cc} - V}{V}$, then converts to lux.
4. Swap the two (R₁ on top) and brighter means lower; the firmware test must follow the wiring.`,
    ),
    example: tr(
      '实验 5-5（6.8 kΩ）：1 lux 75 kΩ → 0.27 V；10 lux 15 kΩ → 1.03 V；100 lux 3.0 kΩ → 2.29 V；1000 lux 600 Ω → 3.03 V。读数 340 / 1277 / 2843 / 3763。',
      'Lab 5-5 (6.8 kΩ): 1 lux 75 kΩ → 0.27 V; 10 lux 15 kΩ → 1.03 V; 100 lux 3.0 kΩ → 2.29 V; 1000 lux 600 Ω → 3.03 V. Readings 340 / 1277 / 2843 / 3763.',
    ),
    pitfalls: [
      tr('STM32 的模拟引脚不耐 5 V：分压器顶端接 3V3，不要接 5V。', 'STM32 analog pins are not 5 V tolerant: feed the divider from 3V3, never 5V.'),
      tr('真实 LDR 个体差 ±50 %、反应慢：只适合判断亮暗。', 'Real LDRs vary ±50 % and are slow: good for bright/dark only.'),
    ],
    Figure: () => (
      <g>
        <SensorDivider top="LDR" bottom="R₁" />
        <path d="M40 30 l14 10 M36 42 l14 10 M50 36 l4 4 l-5 1 M46 48 l4 4 l-5 1" className="cf-w accent" fill="none" />
      </g>
    ),
    teardowns: ['sensors'],
    lessons: ['exp5-ldr-light-sensor'],
  },
  {
    id: 'ntc-beta',
    group: 'mcu',
    title: tr('NTC 热敏电阻：B 值公式', 'NTC thermistor: the B equation'),
    tex: 'R(T) = R_{25} e^{B(\\frac{1}{T} - \\frac{1}{298.15 K})}',
    use: tr('某个温度下 NTC 的阻值（T 用开尔文）。', 'An NTC’s resistance at a temperature (T in kelvin).'),
    vars: [
      { sym: 'T', name: tr('温度', 'temperature'), unit: '°C', def: 50 },
      { sym: 'R_25', name: tr('25 °C 时的阻值', 'resistance at 25 °C'), unit: 'Ω', def: 10000 },
      { sym: 'B', name: tr('B 值', 'B value'), unit: 'K', def: 3950 },
    ],
    out: { sym: 'R', name: tr('阻值', 'resistance'), unit: 'Ω' },
    compute: (v) => ntcR(v.T, v.R_25, v.B),
    why: tr(
      `1. 半导体里的载流子数随温度按指数增加，所以电阻按指数下降（NTC = 负温度系数）。
2. 近似：$R = A e^{B/T}$。用 25 °C（298.15 K）时 $R = R_{25}$ 消去 A，得到上面的 B 值公式。
3. **T 一定用开尔文**：$T = t + 273.15$。
4. 接成分压器（R₁ 在上、NTC 在下）：$V = V_{cc}\\frac{R_{NTC}}{R_1 + R_{NTC}}$，越热电压越低。
5. 指数 + 分压都是非线性：同样 1 °C，低温端读数变化大，高温端变化小。`,
      `1. The number of carriers in a semiconductor rises exponentially with temperature, so the resistance falls exponentially (NTC = negative temperature coefficient).
2. Approximately $R = A e^{B/T}$. Using $R = R_{25}$ at 25 °C (298.15 K) to eliminate A gives the B equation above.
3. **T must be in kelvin**: $T = t + 273.15$.
4. In a divider (R₁ on top, NTC below): $V = V_{cc}\\frac{R_{NTC}}{R_1 + R_{NTC}}$ — hotter means lower.
5. Exponential plus divider are both non-linear: one degree moves the reading a lot at the cold end and much less at the hot end.`,
    ),
    example: tr(
      '10 kΩ、B = 3950：0 °C ≈ 33.6 kΩ；25 °C = 10.0 kΩ；40 °C ≈ 5.3 kΩ；50 °C ≈ 3.59 kΩ；60 °C ≈ 2.49 kΩ；80 °C ≈ 1.27 kΩ。实验 5-6（10 kΩ 在上）：2.54 / 1.65 / 0.87 / 0.37 V。',
      '10 kΩ, B = 3950: 0 °C ≈ 33.6 kΩ; 25 °C = 10.0 kΩ; 40 °C ≈ 5.3 kΩ; 50 °C ≈ 3.59 kΩ; 60 °C ≈ 2.49 kΩ; 80 °C ≈ 1.27 kΩ. Lab 5-6 (10 kΩ on top): 2.54 / 1.65 / 0.87 / 0.37 V.',
    ),
    pitfalls: [tr('把摄氏度直接代进 1/T。', 'Putting degrees Celsius straight into 1/T.')],
    Figure: () => <SensorDivider top="R₁" bottom="NTC" />,
    teardowns: ['sensors'],
    lessons: ['exp5-ntc-thermometer', 'exp5-capstone-ntc-fan'],
  },
  {
    id: 'ntc-temperature',
    group: 'mcu',
    title: tr('从 ADC 电压算温度（固件做的事）', 'From the ADC voltage to a temperature (what firmware does)'),
    tex: 'R_{NTC} = R_1 \\frac{V}{V_{cc} - V}, \\frac{1}{T} = \\frac{1}{298.15} + \\frac{ln(R_{NTC}/R_{25})}{B}',
    use: tr('NTC 在下、R₁ 在上的分压器：读到电压，算回摄氏度。', 'NTC below, R₁ on top: from the voltage read, back to degrees Celsius.'),
    vars: [
      { sym: 'V', name: tr('ADC 引脚电压', 'ADC pin voltage'), unit: 'V', def: 0.372 },
      { sym: 'R_1', name: tr('上面的固定电阻', 'fixed resistor on top'), unit: 'Ω', def: 10000 },
      { sym: 'V_cc', name: tr('分压器电源（= ADC 参考最好）', 'divider supply (ideally the ADC reference)'), unit: 'V', def: 3.3 },
      { sym: 'R_25', name: 'R₂₅', unit: 'Ω', def: 10000 },
      { sym: 'B', name: tr('B 值', 'B value'), unit: 'K', def: 3950 },
    ],
    out: { sym: 'T', name: tr('温度（°C）', 'temperature (°C)'), unit: '' },
    compute: (v) => {
      const r = (v.R_1 * v.V) / (v.V_cc - v.V);
      return 1 / (1 / 298.15 + Math.log(r / v.R_25) / v.B) - 273.15;
    },
    why: tr(
      `1. 分压器反解：$V = V_{cc}\\frac{R_{NTC}}{R_1 + R_{NTC}}$ ⇒ $R_{NTC} = R_1\\frac{V}{V_{cc} - V}$。用读数写：$R_{NTC} = R_1\\frac{raw}{4095 - raw}$。
2. B 值公式取对数：$ln\\frac{R}{R_{25}} = B(\\frac{1}{T} - \\frac{1}{298.15})$。
3. 解出 $\\frac{1}{T}$，取倒数得开尔文，再减 273.15。
4. 分压器顶端接 ADC 的参考电压（比值测量）：$V_{cc}$ 稍微漂一点也会在公式里消掉。
5. 要 ±0.1 °C 就用三项的 Steinhart–Hart 公式 $\\frac{1}{T} = A + B ln R + C(ln R)^{3}$，按厂家 R–T 表拟合。`,
      `1. Invert the divider: $V = V_{cc}\\frac{R_{NTC}}{R_1 + R_{NTC}}$ ⇒ $R_{NTC} = R_1\\frac{V}{V_{cc} - V}$. In counts: $R_{NTC} = R_1\\frac{raw}{4095 - raw}$.
2. Take logs of the B equation: $ln\\frac{R}{R_{25}} = B(\\frac{1}{T} - \\frac{1}{298.15})$.
3. Solve for $\\frac{1}{T}$, invert for kelvin, subtract 273.15.
4. Feed the top of the divider from the ADC’s reference (a ratiometric measurement): a slightly drifting $V_{cc}$ cancels out.
5. For ±0.1 °C use the three-term Steinhart–Hart equation $\\frac{1}{T} = A + B ln R + C(ln R)^{3}$ fitted to the maker’s R–T table.`,
    ),
    example: tr(
      '实验 5-6：0.372 V → $R = 10k × \\frac{0.372}{2.928} ≈ 1.27 kΩ$ → $ln 0.127 ≈ -2.06$ → T ≈ 353 K = 80 °C。读数 1081 → 3.59 kΩ → 50.0 °C。',
      'Lab 5-6: 0.372 V → $R = 10k × \\frac{0.372}{2.928} ≈ 1.27 kΩ$ → $ln 0.127 ≈ -2.06$ → T ≈ 353 K = 80 °C. A reading of 1081 → 3.59 kΩ → 50.0 °C.',
    ),
    pitfalls: [
      tr(
        '实验 5-17 里 NTC 在上：公式变成 $R_{NTC} = R_1\\frac{V_{cc} - V}{V}$，而且越热电压越高。',
        'In lab 5-17 the NTC is on top: then $R_{NTC} = R_1\\frac{V_{cc} - V}{V}$ and hotter means higher.',
      ),
      tr('NTC 自热：25 °C 时约 0.27 mW，小珠状 NTC 会自己升温 0.1–0.3 °C。', 'Self-heating: about 0.27 mW at 25 °C warms a small bead NTC by 0.1–0.3 °C.'),
    ],
    teardowns: ['sensors'],
    lessons: ['exp5-ntc-thermometer', 'exp5-capstone-ntc-fan'],
  },
  {
    id: 'pwm-average',
    group: 'mcu',
    title: tr('PWM 的平均值 = 占空比 × 高电平', 'PWM average = duty × high level'),
    tex: 'V̄ = D × V_H, Ī = D × I_{on}',
    use: tr(
      '占空比 D 的 PWM：万用表（直流档）读到的平均电压，LED 的平均电流。',
      'A PWM at duty D: the average voltage a multimeter (DC range) reads, and the LED’s average current.',
    ),
    vars: [
      { sym: 'D', name: tr('占空比', 'duty cycle'), unit: '%', def: 25 },
      { sym: 'V_H', name: tr('高电平（带载时）', 'high level (under load)'), unit: 'V', def: 3.2 },
    ],
    out: { sym: 'V̄', name: tr('平均电压', 'average voltage'), unit: 'V' },
    compute: (v) => (v.D / 100) * v.V_H,
    why: tr(
      `1. 一个周期 T 里，高电平 $V_H$ 持续 $DT$，低电平 0 持续 $(1 - D)T$。
2. 平均值 = 面积 ÷ 周期：$V̄ = \\frac{V_H × DT}{T} = DV_H$。这是 PWM 的直流分量。
3. 万用表直流档、RC 低通、人眼看 LED 亮度，都只“看到”平均值。
4. 但每个高电平期间电流仍是全开时的值：$Ī = DI_{on}$，峰值不变——PWM 绕不过引脚的电流限制。
5. 有效值 $V_H\\sqrt{D}$ 比平均值大（决定电阻、线圈发热）。`,
      `1. In each period T the output is $V_H$ for $DT$ and 0 for $(1 - D)T$.
2. Average = area ÷ period: $V̄ = \\frac{V_H × DT}{T} = DV_H$. That is the PWM’s DC component.
3. A multimeter’s DC range, an RC low-pass and the eye watching an LED all "see" only the average.
4. But during each high the current is still the fully-on value: $Ī = DI_{on}$ with an unchanged peak — PWM is no way around a pin’s current limit.
5. The RMS value $V_H\\sqrt{D}$ is larger than the average (it sets the heating in resistors and windings).`,
    ),
    example: tr(
      '第 16 课：25 %、高电平 3.2 V → 0.80 V；LED 4.1 mA × 0.25 ≈ 1.0 mA。实验 5-14：25 / 50 / 75 % × 3.3 V → 0.82 / 1.65 / 2.47 V。',
      'Lesson 16: 25 % of a 3.2 V high → 0.80 V; LED 4.1 mA × 0.25 ≈ 1.0 mA. Lab 5-14: 25 / 50 / 75 % × 3.3 V → 0.82 / 1.65 / 2.47 V.',
    ),
    pitfalls: [tr('示波器看到的高电平仍是 3.2 V：PWM 只改时间比例，不改电平。', 'The scope still shows a 3.2 V high: PWM changes the share of time, not the level.')],
    Figure: () => (
      <g>
        <path d="M15 120 H250 M15 120 V20" className="cf-w thin" />
        <polyline points="15,120 15,40 50,40 50,120 120,120 120,40 155,40 155,120 250,120" className="cf-w" fill="none" />
        <path d="M15 100 H250" className="cf-w accent" strokeDasharray="5 4" />
        <T x={248} y={94} anchor="end" cls="accent">
          V̄ = D·V_H
        </T>
        <path d="M15 32 H50 M15 28 V36 M50 28 V36" className="cf-w thin" />
        <T x={32} y={24} cls="small">
          DT
        </T>
        <path d="M15 140 H120 M15 136 V144 M120 136 V144" className="cf-w thin" />
        <T x={68} y={136} cls="small">
          T
        </T>
        <T x={20} y={52} anchor="start" cls="small">
          V_H
        </T>
      </g>
    ),
    teardowns: ['pwm-adc'],
    lessons: ['lesson-mcu-pwm-adc', 'exp5-pwm-rc-dac', 'exp5-pwm-mosfet-motor'],
    chapter: 'non-sinusoidal',
  },
  {
    id: 'pwm-rc-ripple',
    group: 'mcu',
    title: tr('PWM + RC 的纹波', 'PWM + RC ripple'),
    tex: 'ΔV ≈ \\frac{V_H D(1 - D)}{f R C}',
    use: tr('PWM 经过 RC 低通变成“DAC”：剩下的纹波有多大（τ ≫ T 时）。', 'PWM through an RC low-pass as a "DAC": how much ripple is left (for τ ≫ T).'),
    vars: [
      { sym: 'V_H', name: tr('PWM 高电平', 'PWM high level'), unit: 'V', def: 3.3 },
      { sym: 'D', name: tr('占空比', 'duty cycle'), unit: '%', def: 50 },
      { sym: 'f', name: tr('PWM 频率', 'PWM frequency'), unit: 'Hz', def: 1000 },
      { sym: 'R', name: tr('滤波电阻', 'filter resistor'), unit: 'Ω', def: 10000 },
      { sym: 'C', name: tr('滤波电容', 'filter capacitor'), unit: 'F', def: 1e-6 },
    ],
    out: { sym: 'ΔV', name: tr('纹波峰峰值', 'ripple peak-to-peak'), unit: 'V' },
    compute: (v) => (v.V_H * (v.D / 100) * (1 - v.D / 100)) / (v.f * v.R * v.C),
    why: tr(
      `1. τ = RC ≫ T 时电容电压几乎不动，约等于平均值 $V̄ = DV_H$。
2. 高电平期间，电阻两端约 $V_H - V̄ = V_H(1 - D)$，充电电流 $\\frac{V_H(1 - D)}{R}$，持续 $DT$。
3. 电容电压上升 $ΔV = \\frac{I × DT}{C} = \\frac{V_H D(1 - D)}{fRC}$；低电平期间同样多地降回来。
4. D(1 − D) 在 50 % 时最大（0.25）。纹波 ∝ $\\frac{1}{f}$：提高 PWM 频率可以减小纹波而不变慢（τ 没变）。
5. τ 和 T 差不多时近似失效，50 % 时用精确值 $V_H tanh\\frac{T}{4τ}$。`,
      `1. With τ = RC ≫ T the capacitor hardly moves and sits near the average $V̄ = DV_H$.
2. During the high time the resistor sees about $V_H - V̄ = V_H(1 - D)$, a charging current $\\frac{V_H(1 - D)}{R}$ for $DT$.
3. The capacitor rises by $ΔV = \\frac{I × DT}{C} = \\frac{V_H D(1 - D)}{fRC}$, and falls back as much during the low time.
4. D(1 − D) is largest at 50 % (0.25). The ripple ∝ $\\frac{1}{f}$: a higher PWM frequency cuts ripple without slowing the output (τ is unchanged).
5. When τ is comparable with T the approximation fails; at 50 % use the exact $V_H tanh\\frac{T}{4τ}$.`,
    ),
    example: tr(
      '实验 5-14（10 kΩ、1 µF、τ = 10 ms）：1 kHz、50 % → $\\frac{3.3 × 0.25}{1000 × 0.01} ≈ 82 mV$；25 % → 62 mV；10 kHz → 8.2 mV；100 Hz 近似给 0.83 V，精确值 0.81 V。',
      'Lab 5-14 (10 kΩ, 1 µF, τ = 10 ms): 1 kHz, 50 % → $\\frac{3.3 × 0.25}{1000 × 0.01} ≈ 82 mV$; 25 % → 62 mV; 10 kHz → 8.2 mV; at 100 Hz the approximation gives 0.83 V, the exact value 0.81 V.',
    ),
    pitfalls: [
      tr(
        'RC 越大纹波越小，但改占空比后输出要 4.6τ 才稳定到 1 % 以内——别只顾纹波。',
        'A bigger RC means less ripple, but after a duty change the output needs 4.6τ to settle within 1 % — don’t optimise ripple alone.',
      ),
    ],
    Figure: () => (
      <g>
        <Box x={10} y={50} w={50} h={34}>
          PWM
        </Box>
        <Path d="60,67 80,67" />
        <R x1={80} y1={67} x2={150} y2={67} label="R" />
        <Path d="150,67 175,67" />
        <C x1={175} y1={67} x2={175} y2={125} label="C" />
        <Gnd x={175} y={128} />
        <Path d="175,125 175,128" />
        <Path d="175,67 215,67" />
        <Dot x={175} y={67} />
        <T x={220} y={71} anchor="start">
          V̄
        </T>
      </g>
    ),
    teardowns: ['pwm-adc'],
    lessons: ['exp5-pwm-rc-dac'],
    chapter: 'first-order',
  },
  {
    id: 'pwm-motor-current',
    group: 'mcu',
    title: tr('PWM 调速：电机的平均电流', 'PWM speed control: the motor’s average current'),
    tex: 'Ī = \\frac{D U_s - (1 - D) U_D}{R_m}',
    use: tr(
      '低边 MOSFET + 续流二极管驱动电机：占空比 D 时电机的平均电流（PWM 周期 ≪ L/R）。',
      'A low-side MOSFET with a flyback diode driving a motor: its average current at duty D (PWM period ≪ L/R).',
    ),
    vars: [
      { sym: 'U_s', name: tr('电机电源', 'motor supply'), unit: 'V', def: 5 },
      { sym: 'D', name: tr('占空比', 'duty cycle'), unit: '%', def: 50 },
      { sym: 'U_D', name: tr('续流二极管压降（含内阻，≈ 0.7–0.9 V）', 'flyback diode drop (with its resistance, ≈ 0.7–0.9 V)'), unit: 'V', def: 0.85, min: 0 },
      { sym: 'R_m', name: tr('电机绕组电阻', 'motor winding resistance'), unit: 'Ω', def: 8 },
    ],
    out: { sym: 'Ī', name: tr('电机平均电流', 'motor average current'), unit: 'A' },
    compute: (v) => Math.max(0, ((v.D / 100) * v.U_s - (1 - v.D / 100) * v.U_D) / v.R_m),
    why: tr(
      `1. MOSFET 导通时电机两端是 $+U_s$，电流沿 5 V → 电机 → D → S → GND 上升。
2. 关断时电感让电流继续流，改走“电机 → 二极管 → 电机”（续流），电机两端约 $-U_D$。
3. 周期 ≪ τ = L/R 时电流几乎是平的，电机两端的平均电压 $V̄ = DU_s - (1 - D)U_D$。
4. 平均电流 $Ī = \\frac{V̄}{R_m}$；其中 $(1 - D)$ 的那部分走二极管。
5. 频率低到和 τ 差不多时平均电流差不多，但电流起伏大，有效值（发热）变大，还会有啸叫。`,
      `1. With the MOSFET on the motor sees $+U_s$ and the current rises along 5 V → motor → D → S → GND.
2. When it turns off the inductance keeps the current flowing, now around "motor → diode → motor" (freewheeling), with about $-U_D$ across the motor.
3. With the period ≪ τ = L/R the current is nearly flat, and the motor’s average voltage is $V̄ = DU_s - (1 - D)U_D$.
4. Average current $Ī = \\frac{V̄}{R_m}$; the $(1 - D)$ share of it flows in the diode.
5. At a frequency comparable with τ the average is about the same but the current swings a lot: a larger RMS (more heat) and an audible whine.`,
    ),
    example: tr(
      '实验 5-15（20 kHz、8 Ω）：50 % → $\\frac{2.5 - 0.43}{8} ≈ 0.26 A$（模拟 258 mA，二极管里 129 mA）；25 %（电流小，$U_D$ ≈ 0.72 V）→ ≈ 89 mA，低于 0.1 A 的启动电流，转不起来；100 % → $\\frac{5}{8} ≈ 0.62 A$。1 kHz、50 %：平均 263 mA，有效值 317 mA。',
      'Lab 5-15 (20 kHz, 8 Ω): 50 % → $\\frac{2.5 - 0.43}{8} ≈ 0.26 A$ (simulated 258 mA, 129 mA of it in the diode); 25 % (small current, $U_D$ ≈ 0.72 V) → ≈ 89 mA, below the 0.1 A start current, so it doesn’t turn; 100 % → $\\frac{5}{8} ≈ 0.62 A$. 1 kHz at 50 %: 263 mA average, 317 mA RMS.',
    ),
    pitfalls: [
      tr(
        '平均电流不是严格 ∝ D：续流时二极管的压降也加在电机上，低占空比时影响更大。',
        'The average is not strictly ∝ D: the diode drop also sits across the motor while freewheeling, which matters more at low duty.',
      ),
      tr('真实电机转起来有反电动势，电流比这里小。', 'A real spinning motor has a back-EMF, so its current is lower than this.'),
    ],
    Figure: () => (
      <g>
        <T x={150} y={12}>
          +5 V
        </T>
        <Path d="150,16 150,25 200,25 200,32" />
        <Path d="150,25 150,30" />
        <circle cx={150} cy={50} r={18} className="cf-w" fill="none" />
        <T x={150} y={55}>
          M
        </T>
        <Path d="150,30 150,32" />
        <D x1={200} y1={75} x2={200} y2={32} />
        <Path d="150,68 150,75 200,75" />
        <Path d="150,75 150,82" />
        <Nmos x={110} y={110} />
        <Path d="138,80 138,82 150,82" />
        <Path d="138,140 138,142" />
        <Gnd x={138} y={142} />
        <Path d="40,118 110,118" />
        <T x={36} y={122} anchor="end" cls="small">
          PWM
        </T>
      </g>
    ),
    teardowns: ['mosfet'],
    lessons: ['exp5-pwm-mosfet-motor'],
    chapter: 'non-sinusoidal',
  },
  {
    id: 'npn-base-resistor',
    group: 'mcu',
    title: tr('NPN 开关的基极电阻', 'Base resistor of an NPN switch'),
    tex: 'R_B = \\frac{V_{OH} - V_{BE}}{I_C / β_{forced}}',
    use: tr('用 3.3 V 引脚让 NPN 三极管饱和导通（低边开关），基极电阻取多大。', 'Which base resistor lets a 3.3 V pin drive an NPN hard into saturation (a low-side switch).'),
    vars: [
      { sym: 'V_OH', name: tr('引脚高电平', 'pin high level'), unit: 'V', def: 3.3 },
      { sym: 'V_BE', name: tr('B–E 压降', 'B–E drop'), unit: 'V', def: 0.7 },
      { sym: 'I_C', name: tr('负载需要的电流', 'load current needed'), unit: 'A', def: 0.025 },
      { sym: 'β_F', name: tr('强制 β（取 10 留余量）', 'forced β (10 for margin)'), unit: '', def: 10 },
    ],
    out: { sym: 'R_B', name: tr('基极电阻（取不大于它的标准值）', 'base resistor (pick a standard value no larger)'), unit: 'Ω' },
    compute: (v) => (v.V_OH - v.V_BE) / (v.I_C / v['β_F']),
    why: tr(
      `1. 先算负载电流 $I_C$：负载接在 5 V 和集电极之间，饱和时 $V_{CE}$ 只有 0.1–0.2 V，$I_C$ 由负载决定，不由 β 决定。
2. 想让它 **饱和**，基极电流要比放大区需要的 $\\frac{I_C}{β}$ 多得多。经验：$I_B ≥ \\frac{I_C}{10}$（强制 β ≈ 10）。β 随温度和批次变化很大（2N2222 是 35–300），按 10 设计有余量。
3. B–E 结是一个二极管（≈ 0.65–0.7 V）：$I_B = \\frac{V_{OH} - V_{BE}}{R_B}$。
4. 解出 $R_B$，取不大于它的标准值。
5. 不串 $R_B$：3.3 V 直接加在 B–E 二极管上，只有引脚内阻限流，约 60 mA——引脚烧坏。`,
      `1. Find the load current $I_C$ first: the load sits between 5 V and the collector; saturated, $V_{CE}$ is only 0.1–0.2 V, so the load, not β, sets $I_C$.
2. To **saturate** it, the base current must be well above the $\\frac{I_C}{β}$ the active region needs. Rule of thumb: $I_B ≥ \\frac{I_C}{10}$ (forced β ≈ 10). β varies hugely with temperature and batch (35–300 for a 2N2222), so designing for 10 leaves margin.
3. The B–E junction is a diode (≈ 0.65–0.7 V): $I_B = \\frac{V_{OH} - V_{BE}}{R_B}$.
4. Solve for $R_B$ and pick a standard value no larger.
5. Without $R_B$: 3.3 V sits straight across the B–E diode with only the pin’s resistance to limit it — about 60 mA, and the pin burns.`,
    ),
    example: tr(
      '实验 5-7：蜂鸣器 $I_C ≈ 24.9 mA$ → $I_B ≥ 2.5 mA$ → $R_B ≤ \\frac{2.6}{2.5 mA} ≈ 1.04 kΩ$ → 1 kΩ。实验 5-9：线圈 63 mA，1 kΩ 给 2.53 mA，强制 β ≈ 25，仍远低于 150，照样饱和。',
      'Lab 5-7: buzzer $I_C ≈ 24.9 mA$ → $I_B ≥ 2.5 mA$ → $R_B ≤ \\frac{2.6}{2.5 mA} ≈ 1.04 kΩ$ → 1 kΩ. Lab 5-9: a 63 mA coil; 1 kΩ gives 2.53 mA, a forced β of ≈ 25, still far below 150, so it saturates.',
    ),
    pitfalls: [
      tr(
        '用 β = 150 直接算 $I_B = I_C/β$：刚好在放大区边缘，温度一变就不饱和。',
        'Using β = 150 for $I_B = I_C/β$: right at the edge of the active region; a temperature change and it is no longer saturated.',
      ),
      tr('基极到地加 10–100 kΩ 下拉，单片机复位时引脚悬空也能保证关断。', 'Add 10–100 kΩ from base to ground so it stays off while the MCU is in reset and the pin floats.'),
    ],
    Figure: () => (
      <g>
        <T x={180} y={12}>
          +5 V
        </T>
        <Path d="180,16 180,22" />
        <R x1={180} y1={22} x2={180} y2={58} label={tr('负载', 'load')} lx={128} ly={44} />
        <Path d="180,58 180,60 163,60 163,66" />
        <Npn x={135} y={96} />
        <Path d="163,126 163,132" />
        <Gnd x={163} y={132} />
        <Box x={8} y={80} w={50} h={32}>
          GPIO
        </Box>
        <Path d="58,96 70,96" />
        <R x1={70} y1={96} x2={135} y2={96} label="R_B" />
        <Arrow x={105} y={112} label="I_B" ly={128} />
        <Arrow x={196} y={42} dir="d" label="I_C" />
      </g>
    ),
    teardowns: ['npn'],
    lessons: ['exp5-npn-buzzer-switch', 'exp5-relay-flyback', 'exp5-high-side-vs-low-side'],
    chapter: 'nonlinear',
  },
  {
    id: 'npn-saturation',
    group: 'mcu',
    title: tr('三极管饱和了吗？过驱系数', 'Is the transistor saturated? The overdrive factor'),
    tex: 'I_B = \\frac{V_{OH} - V_{BE}}{R_B}, k = \\frac{β I_B}{I_{C,load}}',
    use: tr(
      '检查一个基极电阻能不能让三极管饱和：k > 1 才饱和，设计时取 2–10 以上。',
      'Check whether a base resistor saturates the transistor: it does only for k > 1; design for 2–10 or more.',
    ),
    vars: [
      { sym: 'V_OH', name: tr('引脚高电平', 'pin high level'), unit: 'V', def: 3.3 },
      { sym: 'V_BE', name: tr('B–E 压降', 'B–E drop'), unit: 'V', def: 0.65 },
      { sym: 'R_B', name: tr('基极电阻', 'base resistor'), unit: 'Ω', def: 100000 },
      { sym: 'β', name: tr('三极管的 β', 'transistor β'), unit: '', def: 150 },
      { sym: 'I_C', name: tr('负载要的电流', 'current the load needs'), unit: 'A', def: 0.0249 },
    ],
    out: { sym: 'k', name: tr('过驱系数（< 1 放大区，> 1 饱和）', 'overdrive (< 1 active, > 1 saturated)'), unit: '' },
    compute: (v) => (v['β'] * ((v.V_OH - v.V_BE) / v.R_B)) / v.I_C,
    why: tr(
      `1. 放大区：$I_C = βI_B$，三极管像一个受控电流源，$V_{CE}$ 由负载上剩下的电压决定。
2. 如果 $βI_B$ 比负载在“完全接通”时需要的电流还大，三极管给不出那么多——负载限住了电流，$V_{CE}$ 掉到 0.1–0.2 V：**饱和**。
3. 所以判断量是 $k = \\frac{βI_B}{I_{C,load}}$：k < 1 卡在放大区，三极管自己发热、负载电压不够；k > 1 饱和。
4. β 会变，所以要留余量：k ≥ 2–10。`,
      `1. In the active region $I_C = βI_B$: the transistor is a controlled current source, and $V_{CE}$ is whatever the load leaves over.
2. If $βI_B$ exceeds what the load would draw "fully on", the transistor can’t deliver it — the load limits the current and $V_{CE}$ collapses to 0.1–0.2 V: **saturation**.
3. So the test is $k = \\frac{βI_B}{I_{C,load}}$: k < 1 is stuck in the active region (the transistor heats up and the load lacks voltage); k > 1 is saturated.
4. β varies, so keep a margin: k ≥ 2–10.`,
    ),
    example: tr(
      '实验 5-7：100 kΩ：$I_B = \\frac{2.65}{100k} ≈ 26.5 µA$，$βI_B ≈ 4.0 mA$，k ≈ 0.16 → 放大区，$V_{CE} ≈ 3.1 V$，蜂鸣器不响；1 kΩ：$I_B ≈ 2.65 mA$，k ≈ 16 → 饱和。实验 5-18 低边：2.5 mA × 150 ≈ 380 mA ≫ 63 mA。',
      'Lab 5-7: 100 kΩ: $I_B = \\frac{2.65}{100k} ≈ 26.5 µA$, $βI_B ≈ 4.0 mA$, k ≈ 0.16 → active, $V_{CE} ≈ 3.1 V$, buzzer silent; 1 kΩ: $I_B ≈ 2.65 mA$, k ≈ 16 → saturated. Lab 5-18, low side: 2.5 mA × 150 ≈ 380 mA ≫ 63 mA.',
    ),
    pitfalls: [
      tr(
        'MOSFET 的“饱和区”是恒流区，正好和三极管的“饱和”相反：MOSFET 当开关要在欧姆区（线性区）。',
        'A MOSFET’s "saturation region" is its constant-current region — the opposite of a BJT’s saturation: a MOSFET switch must be in the ohmic (linear) region.',
      ),
    ],
    teardowns: ['npn'],
    lessons: ['exp5-npn-buzzer-switch', 'exp5-relay-flyback', 'exp5-high-side-vs-low-side'],
    chapter: 'nonlinear',
  },
  {
    id: 'emitter-follower-high-side',
    group: 'mcu',
    title: tr('高边 NPN = 射极跟随器：负载只得到基极电压 − 0.65 V', 'High-side NPN = emitter follower: the load gets only the base voltage − 0.65 V'),
    tex: 'V_E = \\frac{V_{OH} - V_{BE}}{1 + \\frac{R_B}{(β + 1)R_L}}',
    use: tr(
      'NPN 放在负载上面（集电极接 5 V、发射极接负载）：负载实际能得到多少电压。',
      'An NPN above the load (collector to 5 V, emitter to the load): how much voltage the load really gets.',
    ),
    vars: [
      { sym: 'V_OH', name: tr('引脚高电平', 'pin high level'), unit: 'V', def: 3.29 },
      { sym: 'V_BE', name: tr('B–E 压降', 'B–E drop'), unit: 'V', def: 0.65 },
      { sym: 'R_B', name: tr('基极电阻', 'base resistor'), unit: 'Ω', def: 1000 },
      { sym: 'β', name: 'β', unit: '', def: 150 },
      { sym: 'R_L', name: tr('负载（继电器线圈 70 Ω）', 'load (relay coil 70 Ω)'), unit: 'Ω', def: 70 },
    ],
    out: { sym: 'V_E', name: tr('发射极 = 负载电压', 'emitter = load voltage'), unit: 'V' },
    compute: (v) => (v.V_OH - v.V_BE) / (1 + v.R_B / ((v['β'] + 1) * v.R_L)),
    why: tr(
      `1. 负载接在发射极：$V_E = V_B - V_{BE}$，发射极永远比基极低约 0.65 V（**射极跟随器**，共集电极）。
2. 基极最高只能到引脚的 3.3 V，再减去 $I_BR_B$。
3. $I_B = \\frac{I_E}{β + 1} = \\frac{V_E}{(β + 1)R_L}$，代入 $V_E = V_{OH} - I_BR_B - V_{BE}$，解出上式。
4. 剩下的电压 $5 V - V_E$ 都压在 C–E 上：三极管在放大区发热，不是开关。
5. 换 12 V 电源、换 β = 1000 的管子都救不了：限制是“发射极 = 基极 − 0.65 V”，不是增益。`,
      `1. With the load on the emitter, $V_E = V_B - V_{BE}$: the emitter always sits about 0.65 V below the base (an **emitter follower**, common collector).
2. The base can go no higher than the pin’s 3.3 V, minus $I_BR_B$.
3. $I_B = \\frac{I_E}{β + 1} = \\frac{V_E}{(β + 1)R_L}$; put it in $V_E = V_{OH} - I_BR_B - V_{BE}$ and solve.
4. The rest, $5 V - V_E$, sits across C–E: the transistor is in the active region heating up, not a switch.
5. A 12 V supply or a β = 1000 part doesn’t help: the limit is "emitter = base − 0.65 V", not the gain.`,
    ),
    example: tr(
      '实验 5-18：$V_E = \\frac{2.64}{1 + 1000/(151 × 70)} ≈ 2.41 V$，线圈 $\\frac{2.41}{70} ≈ 34 mA$ < 53 mA 吸合电流，不吸合；C–E 上 2.26 V，耗 77 mW。β = 1000：≈ 2.60 V、37 mA，仍不吸合。低边接法线圈得到 4.44 V、63 mA。',
      'Lab 5-18: $V_E = \\frac{2.64}{1 + 1000/(151 × 70)} ≈ 2.41 V$, coil $\\frac{2.41}{70} ≈ 34 mA$ < the 53 mA pull-in current — no pull-in; 2.26 V across C–E, 77 mW wasted. β = 1000: ≈ 2.60 V, 37 mA — still not. The low-side version gives the coil 4.44 V and 63 mA.',
    ),
    pitfalls: [
      tr(
        '确实需要高边开关时：用 P 沟道 MOSFET（源极接 5 V）加一个低边 NPN / N-MOS 做电平转换，或现成的高边开关芯片。',
        'When you truly need a high-side switch: a P-channel MOSFET (source at 5 V) driven by a low-side NPN / N-MOS level shifter, or a ready-made high-side switch IC.',
      ),
    ],
    Figure: () => (
      <g>
        <T x={163} y={12}>
          +5 V
        </T>
        <Path d="163,16 163,26" />
        <Npn x={135} y={56} />
        <Path d="163,86 163,92" />
        <L x1={163} y1={92} x2={163} y2={130} label="" />
        <T x={180} y={114} anchor="start" cls="small">
          R_L
        </T>
        <Gnd x={163} y={132} />
        <Path d="163,130 163,132" />
        <Box x={8} y={40} w={50} h={32}>
          GPIO
        </Box>
        <Path d="58,56 70,56" />
        <R x1={70} y1={56} x2={135} y2={56} label="R_B" />
        <VArrow x={210} y1={128} y2={92} label="V_E" />
      </g>
    ),
    teardowns: ['npn', 'relay'],
    lessons: ['exp5-high-side-vs-low-side'],
    chapter: 'nonlinear',
  },
  {
    id: 'mosfet-power',
    group: 'mcu',
    title: tr('MOSFET 开关的发热 P = I²·R', 'MOSFET switch heat P = I²·R'),
    tex: 'P = I^{2} R_{DS(on)} = V_{DS} I',
    use: tr('完全导通的 MOSFET 自己耗多少功率；半导通时为什么会烫。', 'How much a fully-on MOSFET dissipates — and why a half-on one gets hot.'),
    vars: [
      { sym: 'I', name: tr('漏极电流', 'drain current'), unit: 'A', def: 0.62 },
      { sym: 'R_ds', name: tr('导通电阻（IRLZ44N 在 3.3 V 栅压下 ≈ 43 mΩ）', 'on-resistance (IRLZ44N at 3.3 V gate ≈ 43 mΩ)'), unit: 'Ω', def: 0.043 },
    ],
    out: { sym: 'P', name: tr('MOSFET 发热', 'MOSFET dissipation'), unit: 'W' },
    compute: (v) => v.I * v.I * v.R_ds,
    why: tr(
      `1. 栅极电压足够时，MOSFET 工作在 **欧姆区**：D–S 像一个小电阻 $R_{DS(on)}$，$V_{DS} = IR_{DS(on)}$，只有几十 mV。
2. 发热 $P = V_{DS}I = I^{2}R_{DS(on)}$。
3. 数据手册的 $R_{DS(on)}$ 是在某个栅压下测的（IRLZ44N：5 V 时 22 mΩ）；3.3 V 栅压大约翻倍。
4. 栅压不够（普通 IRF540N，$V_{th}$ ≈ 3 V）：管子在 **恒流（饱和）区**，$V_{DS}$ 有几伏，$P = V_{DS}I$ 一下子到零点几瓦。
5. 所以 3.3 V 单片机要选“逻辑电平” MOSFET：$R_{DS(on)}$ 标在 2.5 V 或 4.5 V 栅压下。`,
      `1. With enough gate voltage a MOSFET is in the **ohmic region**: D–S acts as a small resistor $R_{DS(on)}$, $V_{DS} = IR_{DS(on)}$, just tens of mV.
2. It dissipates $P = V_{DS}I = I^{2}R_{DS(on)}$.
3. A datasheet’s $R_{DS(on)}$ is specified at one gate voltage (IRLZ44N: 22 mΩ at 5 V); with 3.3 V on the gate it roughly doubles.
4. Not enough gate voltage (an ordinary IRF540N, $V_{th}$ ≈ 3 V): the part sits in its **constant-current (saturation) region** with volts across D–S, and $P = V_{DS}I$ jumps to tenths of a watt.
5. Hence a 3.3 V MCU needs a "logic-level" MOSFET whose $R_{DS(on)}$ is specified at 2.5 V or 4.5 V gate drive.`,
    ),
    example: tr(
      '实验 5-8：$0.62^{2} × 0.043 ≈ 17 mW$，$V_{DS} ≈ 27 mV$。换 IRF540N：$3.9 V × 0.14 A ≈ 0.54 W$。实验 5-17：$0.356^{2} × 0.044 ≈ 6 mW$，不用散热片。（三极管同理：$P ≈ V_{CE}I_C + V_{BE}I_B$，实验 5-7 约 6 mW。）',
      'Lab 5-8: $0.62^{2} × 0.043 ≈ 17 mW$, $V_{DS} ≈ 27 mV$. With an IRF540N: $3.9 V × 0.14 A ≈ 0.54 W$. Lab 5-17: $0.356^{2} × 0.044 ≈ 6 mW$, no heatsink needed. (A BJT likewise: $P ≈ V_{CE}I_C + V_{BE}I_B$, about 6 mW in lab 5-7.)',
    ),
    pitfalls: [
      tr('$V_{th}$ 只是“开始导通”（250 µA）的栅压，不是“完全导通”。', '$V_{th}$ is only where conduction starts (250 µA), not where the part is fully on.'),
      tr(
        '栅极要有下拉电阻（10–100 kΩ）：复位时引脚悬空，栅极电容上的电荷会让电机自己转起来。',
        'The gate needs a pull-down (10–100 kΩ): with the pin floating during reset, charge on the gate can start the motor on its own.',
      ),
    ],
    Figure: () => (
      <g>
        <T x={150} y={12}>
          +5 V
        </T>
        <Path d="150,16 150,22" />
        <R x1={150} y1={22} x2={150} y2={62} label={tr('负载', 'load')} lx={100} ly={46} />
        <Path d="150,62 150,66 138,66 138,70" />
        <Nmos x={110} y={100} />
        <Path d="138,130 138,134" />
        <Gnd x={138} y={134} />
        <Path d="40,108 110,108" />
        <T x={36} y={112} anchor="end" cls="small">
          GPIO
        </T>
        <VArrow x={190} y1={128} y2={72} label="V_DS" />
        <Arrow x={162} y={44} dir="d" label="I" />
      </g>
    ),
    teardowns: ['mosfet'],
    lessons: ['exp5-mosfet-logic-level', 'exp5-pwm-mosfet-motor', 'exp5-capstone-ntc-fan', 'exp5-npn-buzzer-switch'],
    chapter: 'nonlinear',
  },
  {
    id: 'diode-forward',
    group: 'mcu',
    title: tr('二极管的正向压降：过一个二极管少 0.7 V', 'Diode forward drop: lose 0.7 V per diode'),
    tex: 'U_{out} = U_{in} - U_F - I r_d',
    use: tr(
      '电流经过一个导通的二极管（防反接、USB 二极管、续流钳位）以后电压变成多少。',
      'The voltage after current passes a conducting diode (reverse protection, the USB diode, a flyback clamp).',
    ),
    vars: [
      { sym: 'U_in', name: tr('二极管前的电压', 'voltage before the diode'), unit: 'V', def: 9 },
      { sym: 'U_F', name: tr('导通压降（硅 0.65–0.7 V，肖特基 0.3 V）', 'forward drop (silicon 0.65–0.7 V, Schottky 0.3 V)'), unit: 'V', def: 0.7 },
      { sym: 'I', name: tr('电流', 'current'), unit: 'A', def: 0.0135 },
      { sym: 'r_d', name: tr('二极管内阻（不知道就填 0）', 'diode resistance (0 if unknown)'), unit: 'Ω', def: 0, min: 0 },
    ],
    out: { sym: 'U_out', name: tr('二极管后的电压', 'voltage after the diode'), unit: 'V' },
    compute: (v) => v.U_in - v.U_F - v.I * v.r_d,
    why: tr(
      `1. 二极管只让电流从阳极流向阴极（有条纹的一端）。正向导通后两端电压几乎固定：硅管约 0.65–0.7 V，肖特基约 0.3 V。
2. 折线模型：$U_F$ 串一个小电阻 $r_d$，所以电流大时压降稍大。
3. 串在电源后面（防反接）：输出 = 输入 − 一个 $U_F$；接反时它截止，后面的电路不通电。
4. 续流 / 钳位：二极管导通把某一点钳在“另一点 + $U_F$”上——继电器集电极最高 5 V + 0.7 V。`,
      `1. A diode passes current only from anode to cathode (the banded end). Once conducting its voltage is nearly fixed: about 0.65–0.7 V for silicon, about 0.3 V for a Schottky.
2. Piecewise model: $U_F$ in series with a small $r_d$, so the drop grows a little with current.
3. In series after a supply (reverse protection): output = input − one $U_F$; connected backwards it blocks and the circuit after it stays dead.
4. Flyback / clamping: a conducting diode holds one point at "another point + $U_F$" — a relay’s collector at most 5 V + 0.7 V.`,
    ),
    example: tr(
      '挑战 6：9 V 经二极管 → 约 8.3 V。开发板 5V 引脚：USB 5 V 经肖特基 → 约 4.7 V。实验 5-9：线圈断电时集电极被钳在 4.65 + 0.7 ≈ 5.4 V。实验 3-5：低电平时 D1 反偏，电容不能倒灌回发生器。',
      'Challenge 6: 9 V through the diode → about 8.3 V. The dev board’s 5V pin: USB 5 V through a Schottky → about 4.7 V. Lab 5-9: at coil turn-off the collector is clamped at 4.65 + 0.7 ≈ 5.4 V. Lab 3-5: with the generator low, D1 is reverse-biased and the capacitor can’t flow back.',
    ),
    pitfalls: [
      tr(
        '防反接二极管会一直吃掉 0.7 V 和 0.7 V × I 的功率；低压电路用肖特基或 P-MOSFET。',
        'A reverse-protection diode always eats 0.7 V and 0.7 V × I of power; low-voltage circuits use a Schottky or a P-MOSFET.',
      ),
    ],
    Figure: () => (
      <g>
        <V x={35} y1={45} y2={105} label="U_in" />
        <Path d="35,45 35,30 70,30" />
        <D x1={70} y1={30} x2={130} y2={30} label="U_F" />
        <Path d="130,30 200,30 200,45" />
        <R x1={200} y1={45} x2={200} y2={105} label={tr('负载', 'load')} />
        <Path d="200,105 200,125 35,125 35,105" />
        <VArrow x={160} y1={118} y2={38} label="U_out" />
      </g>
    ),
    teardowns: ['diode'],
    lessons: ['challenge-reverse-protection', 'lesson-mcu-gpio', 'exp5-relay-flyback', 'exp5-mosfet-logic-level', 'exp3-led-breathing', 'exp5-board-power-budget'],
    chapter: 'nonlinear',
  },
  {
    id: 'usb-5v-pin',
    group: 'mcu',
    title: tr('开发板 5V 引脚的电压', 'The dev board’s 5V pin voltage'),
    tex: 'V_{5V} = U_{USB} - U_D - I R_s',
    use: tr(
      'USB 5 V 经线缆 / 保险丝和肖特基二极管到 5V 引脚：带载时掉到多少。',
      'USB 5 V reaches the 5V pin through the cable / polyfuse and a Schottky diode: how far it drops under load.',
    ),
    vars: [
      { sym: 'U_USB', name: tr('USB 电压', 'USB voltage'), unit: 'V', def: 5 },
      { sym: 'U_D', name: tr('肖特基二极管压降', 'Schottky diode drop'), unit: 'V', def: 0.3 },
      { sym: 'I', name: tr('从 USB 取的总电流', 'total current from USB'), unit: 'A', def: 0.48 },
      { sym: 'R_s', name: tr('线缆 + 保险丝 + 二极管电阻（模型 0.25 + 0.15 Ω）', 'cable + fuse + diode resistance (model 0.25 + 0.15 Ω)'), unit: 'Ω', def: 0.4, min: 0 },
    ],
    out: { sym: 'V_5V', name: tr('5V 引脚电压', '5V pin voltage'), unit: 'V' },
    compute: (v) => v.U_USB - v.U_D - v.I * v.R_s,
    why: tr(
      `1. 电源路径：USB 5 V →（线缆 + 自恢复保险丝 ≈ 0.25 Ω）→ 肖特基二极管（≈ 0.3 V + 0.15 Ω）→ **5V 引脚** → 板载 LDO → 3V3。
2. KVL：$V_{5V} = U_{USB} - U_D - IR_s$，空载约 4.7 V，电流越大越低。
3. 5V 引脚给 LDO 供电：它至少要比 3.3 V 高出 LDO 的压差（AMS1117 ≈ 1.1 V），否则 3V3 也会掉。
4. 电脑 USB 2.0 口只保证 500 mA。`,
      `1. The path: USB 5 V → (cable + polyfuse ≈ 0.25 Ω) → Schottky diode (≈ 0.3 V + 0.15 Ω) → **the 5V pin** → onboard LDO → 3V3.
2. KVL: $V_{5V} = U_{USB} - U_D - IR_s$: about 4.7 V unloaded, lower as the current grows.
3. The 5V pin feeds the LDO, so it must stay above 3.3 V by the LDO’s dropout (≈ 1.1 V for an AMS1117), or 3V3 sags too.
4. A computer’s USB 2.0 port only guarantees 500 mA.`,
    ),
    example: tr(
      '只有芯片和 LED（≈ 56 mA）：$5 - 0.3 - 0.056 × 0.4 ≈ 4.68 V$。实验 5-13：总 0.48 A → 4.51 V。实验 5-17：0.415 A → 4.53 V，仍高于 AMS1117 要的 4.4 V。',
      'Just the chip and LEDs (≈ 56 mA): $5 - 0.3 - 0.056 × 0.4 ≈ 4.68 V$. Lab 5-13: 0.48 A in total → 4.51 V. Lab 5-17: 0.415 A → 4.53 V, still above the 4.4 V the AMS1117 needs.',
    ),
    pitfalls: [tr('“5V 引脚”不是 5.0 V：需要精确 5 V 的模块要单独供电。', 'The "5V pin" is not 5.0 V: a module that needs an accurate 5 V needs its own supply.')],
    teardowns: ['devboard', 'regulator'],
    lessons: ['lesson-mcu-gpio', 'exp5-board-power-budget', 'exp5-capstone-ntc-fan', 'exp5-npn-buzzer-switch', 'exp5-relay-flyback', 'exp5-5v-signal-level-shift'],
  },
  {
    id: 'ldo-dropout',
    group: 'mcu',
    title: tr('线性稳压器的压差 LDO dropout', 'Linear regulator dropout'),
    tex: 'U_{out} = min(U_{set}, U_{in} - U_{drop} - R_d I)',
    use: tr(
      '输入电压不够高时，稳压器的输出掉到多少（LM1117 / AMS1117 需要约 1.1 V 压差）。',
      'How far a regulator’s output falls when its input isn’t high enough (an LM1117 / AMS1117 needs about 1.1 V of headroom).',
    ),
    vars: [
      { sym: 'U_in', name: tr('输入电压', 'input voltage'), unit: 'V', def: 4 },
      { sym: 'U_set', name: tr('额定输出', 'rated output'), unit: 'V', def: 3.3 },
      { sym: 'U_drop', name: tr('压差', 'dropout'), unit: 'V', def: 1.1 },
      { sym: 'I', name: tr('负载电流', 'load current'), unit: 'A', def: 0.056 },
      { sym: 'R_d', name: tr('压差模型的电阻', 'dropout model resistance'), unit: 'Ω', def: 0.2, min: 0 },
    ],
    out: { sym: 'U_out', name: tr('输出电压', 'output voltage'), unit: 'V' },
    compute: (v) => Math.min(v.U_set, v.U_in - v.U_drop - v.R_d * v.I),
    why: tr(
      `1. 线性稳压器 = 串在输入和输出之间、自己调节的“可变电阻”，把多出来的电压吃掉。
2. 输出只能比输入低：调整管至少要留 $U_{drop}$（LM1117 约 1.1 V），电流大时再多一点（模型里 $R_d I$）。
3. $U_{in} ≥ U_{set} + U_{drop}$：正常稳压，输出 = 额定值。
4. 不够时进入 **压差区**：输出跟着输入走，$U_{out} = U_{in} - U_{drop} - R_dI$。
5. 低到单片机的掉电复位阈值（模拟的 ESP32 是 2.5 V）就复位，所有引脚变高阻。`,
      `1. A linear regulator is a self-adjusting "variable resistor" in series between input and output that eats the extra voltage.
2. The output can only be lower than the input: the pass transistor needs at least $U_{drop}$ (about 1.1 V for an LM1117), a little more at high current ($R_d I$ in the model).
3. $U_{in} ≥ U_{set} + U_{drop}$: regulating, the output is the rated value.
4. Below that it is in **dropout**: the output follows the input, $U_{out} = U_{in} - U_{drop} - R_dI$.
5. Low enough to cross the MCU’s brown-out threshold (2.5 V for the simulated ESP32) and it resets, every pin going high-impedance.`,
    ),
    example: tr(
      '实验 5-12（≈ 56 mA）：5 V → 3.30 V；4.0 V → 2.89 V；3.7 V（锂电池标称）→ 2.59 V；3.4 V → 2.29 V，ESP32 掉电复位。锂电池 + AMS1117 不行，要用 ME6211、HT7333 这类 0.1–0.25 V 压差的 LDO。',
      'Lab 5-12 (≈ 56 mA): 5 V → 3.30 V; 4.0 V → 2.89 V; 3.7 V (a Li-ion cell’s nominal) → 2.59 V; 3.4 V → 2.29 V and the ESP32 browns out. A Li-ion cell + AMS1117 doesn’t work; use an LDO with 0.1–0.25 V dropout such as the ME6211 or HT7333.',
    ),
    pitfalls: [tr('LM1117 / AMS1117 的输出电容不能省（≥ 10 µF），否则可能振荡。', 'Don’t skip the LM1117 / AMS1117 output capacitor (≥ 10 µF), or it may oscillate.')],
    Figure: () => (
      <g>
        <V x={30} y1={50} y2={110} label="" />
        <T x={48} y={140} anchor="start" cls="small">
          U_in
        </T>
        <Path d="30,50 30,40 90,40" />
        <Box x={90} y={25} w={70} h={40}>
          LDO
        </Box>
        <Path d="125,65 125,125" />
        <Path d="160,40 210,40 210,55" />
        <R x1={210} y1={55} x2={210} y2={110} label={tr('负载', 'load')} />
        <Path d="210,110 210,125 30,125 30,110" />
        <Gnd x={125} y={128} />
        <T x={185} y={32} cls="small">
          U_out
        </T>
      </g>
    ),
    teardowns: ['regulator'],
    lessons: ['exp5-ldo-dropout', 'exp5-capstone-ntc-fan', 'exp5-board-power-budget'],
  },
  {
    id: 'ldo-power',
    group: 'mcu',
    title: tr('线性稳压器的发热与效率', 'Linear regulator heat and efficiency'),
    tex: 'P = (U_{in} - U_{out}) I + U_{in} I_q, η ≈ \\frac{U_{out}}{U_{in}}',
    use: tr('线性稳压器把多出来的电压全部变成热：它自己耗多少瓦。', 'A linear regulator turns all the extra voltage into heat: how many watts it burns itself.'),
    vars: [
      { sym: 'U_in', name: tr('输入电压', 'input voltage'), unit: 'V', def: 9 },
      { sym: 'U_out', name: tr('输出电压', 'output voltage'), unit: 'V', def: 3.3 },
      { sym: 'I', name: tr('负载电流', 'load current'), unit: 'A', def: 0.056 },
      { sym: 'I_q', name: tr('静态电流（LM1117 ≈ 5 mA）', 'quiescent current (LM1117 ≈ 5 mA)'), unit: 'A', def: 0.005, min: 0 },
    ],
    out: { sym: 'P', name: tr('稳压器发热', 'regulator heat'), unit: 'W' },
    compute: (v) => (v.U_in - v.U_out) * v.I + v.U_in * v.I_q,
    why: tr(
      `1. 输入电流 ≈ 输出电流（加上一点静态电流 $I_q$）——线性稳压器不会“变换”电流。
2. 进来的功率 $U_{in}(I + I_q)$，出去的功率 $U_{out}I$，差值就是热：$P = (U_{in} - U_{out})I + U_{in}I_q$。
3. 效率 $η = \\frac{U_{out}I}{U_{in}(I + I_q)} ≈ \\frac{U_{out}}{U_{in}}$：压差越大越浪费。
4. 小封装（SOT-223）不加散热大约只能散 0.5–1 W；压差大、电流大就用开关（buck）稳压器。`,
      `1. Input current ≈ output current (plus a little quiescent current $I_q$) — a linear regulator does not "convert" current.
2. Power in $U_{in}(I + I_q)$, power out $U_{out}I$; the difference is heat: $P = (U_{in} - U_{out})I + U_{in}I_q$.
3. Efficiency $η = \\frac{U_{out}I}{U_{in}(I + I_q)} ≈ \\frac{U_{out}}{U_{in}}$: the bigger the headroom, the more waste.
4. A small package (SOT-223) without a heatsink handles roughly 0.5–1 W; for a large drop at high current use a switching (buck) regulator.`,
    ),
    example: tr(
      '实验 5-12：9 V、56 mA：$5.7 × 0.056 + 9 × 0.005 ≈ 0.36 W$，效率 37 %（只用读到的 U 和 I 算是 0.32 W）；5 V：≈ 0.12 W，效率 66 %。12 V → 3.3 V、500 mA 要烧 4.4 W——不现实。实验 5-13：板载 LDO 限流时 $(4.58 - 2.79) × 0.3 ≈ 0.54 W$。',
      'Lab 5-12: 9 V at 56 mA: $5.7 × 0.056 + 9 × 0.005 ≈ 0.36 W$, 37 % efficient (0.32 W from the measured U and I alone); 5 V: ≈ 0.12 W, 66 %. 12 V → 3.3 V at 500 mA would burn 4.4 W — not realistic. Lab 5-13: the onboard LDO in current limit: $(4.58 - 2.79) × 0.3 ≈ 0.54 W$.',
    ),
    pitfalls: [tr('ESP32 开 Wi-Fi 时峰值 300–500 mA：按峰值算发热和压差。', 'An ESP32 with Wi-Fi peaks at 300–500 mA: size heat and headroom for the peak.')],
    teardowns: ['regulator'],
    lessons: ['exp5-ldo-dropout', 'exp5-board-power-budget'],
  },
  {
    id: 'power-budget',
    group: 'mcu',
    title: tr('电流预算：用掉了百分之几', 'Power budget: what share is used'),
    tex: '\\frac{ΣI}{I_{max}} × 100 %',
    use: tr(
      '3V3（板载 LDO）或 5V（USB 500 mA）上所有负载加起来，占了上限的多少。',
      'All the loads on 3V3 (the onboard LDO) or on 5V (USB’s 500 mA) added up, as a share of the limit.',
    ),
    vars: [
      { sym: 'I_1', name: tr('负载 1（芯片：Blue Pill 20 mA、ESP32 50 mA）', 'load 1 (the chip: Blue Pill 20 mA, ESP32 50 mA)'), unit: 'A', def: 0.02 },
      { sym: 'I_2', name: tr('负载 2', 'load 2'), unit: 'A', def: 0.0015 },
      { sym: 'I_3', name: tr('负载 3', 'load 3'), unit: 'A', def: 0.0039 },
      { sym: 'I_4', name: tr('负载 4（没有就填 0）', 'load 4 (0 if none)'), unit: 'A', def: 0.0012 },
      { sym: 'I_max', name: tr('上限（RT9193 300 mA、AMS1117 1 A、USB 500 mA）', 'limit (RT9193 300 mA, AMS1117 1 A, USB 500 mA)'), unit: 'A', def: 0.3 },
    ],
    out: { sym: 'use', name: tr('占用', 'share used'), unit: '%' },
    compute: (v) => ((v.I_1 + v.I_2 + v.I_3 + v.I_4) / v.I_max) * 100,
    why: tr(
      `1. 把每个负载的 **最坏情况** 电流列出来：舵机堵转、电机启动、Wi-Fi 发射、LED 全亮。
2. 按电源分开加：3V3 上的走板载 LDO；5V 上的直接走 USB（还要加上 LDO 自己的输入电流）。
3. 经验：3V3 总和 < LDO 额定的 70 %，5V 总和 < USB 的 80 %。
4. 超了：大电流负载（电机、舵机、LED 灯带、继电器）挪到 5V 或单独电源，**GND 一定要连在一起**。`,
      `1. List every load’s **worst-case** current: servo stall, motor start, Wi-Fi transmit, LEDs fully on.
2. Add them per rail: 3V3 loads go through the onboard LDO; 5V loads go straight to USB (plus the LDO’s own input current).
3. Rule of thumb: 3V3 total < 70 % of the LDO’s rating, 5V total < 80 % of USB.
4. Over budget: move the heavy loads (motors, servos, LED strips, relays) to 5V or a separate supply — **always join the grounds**.`,
    ),
    example: tr(
      '实验 5-13：3V3 = 20 + 1.5 + 3.9 + 1.2 ≈ 27 mA，占 300 mA 的 9 %；10 Ω 负载错放在 3V3 上要 330 mA，超过 LDO 上限，3V3 掉到 2.79 V。5V = 31 + 451 ≈ 482 mA，占 USB 的 96 %。实验 5-17：USB ≈ 415 mA，83 %。',
      'Lab 5-13: 3V3 = 20 + 1.5 + 3.9 + 1.2 ≈ 27 mA, 9 % of 300 mA; the 10 Ω load wrongly on 3V3 would want 330 mA, over the LDO’s limit, and 3V3 sags to 2.79 V. 5V = 31 + 451 ≈ 482 mA, 96 % of USB. Lab 5-17: USB ≈ 415 mA, 83 %.',
    ),
    pitfalls: [
      tr(
        '超过 500 mA 时电脑的 USB 口会断电或掉线——“电机一启动串口就断”。',
        'Above 500 mA a PC’s USB port cuts power or drops the device — "the serial port disconnects every time the motor starts".',
      ),
    ],
    teardowns: ['devboard', 'regulator'],
    lessons: ['exp5-board-power-budget', 'exp5-capstone-ntc-fan', 'exp5-ldo-dropout'],
  },
  {
    id: 'i2c-rise-time',
    group: 'mcu',
    title: tr('I²C 上升时间 ≈ 0.8473·R·C', 'I²C rise time ≈ 0.8473·R·C'),
    tex: 't_r(30 %→70 %) = R C ln\\frac{7}{3} ≈ 0.8473 R C',
    use: tr(
      '开漏总线松开后只靠上拉电阻给总线电容充电：规范定义的上升时间是多少。',
      'Once an open-drain bus is released only the pull-up charges the bus capacitance: the rise time as the spec defines it.',
    ),
    vars: [
      { sym: 'R', name: tr('上拉电阻', 'pull-up resistor'), unit: 'Ω', def: 2200 },
      { sym: 'C', name: tr('总线电容（每个器件 ~10 pF，每 10 cm 线 5–10 pF）', 'bus capacitance (~10 pF per device, 5–10 pF per 10 cm of wire)'), unit: 'F', def: 2e-10 },
    ],
    out: { sym: 't_r', name: tr('30 %→70 % 上升时间', '30 %→70 % rise time'), unit: 's' },
    compute: (v) => v.R * v.C * Math.log(7 / 3),
    why: tr(
      `1. 开漏输出只会“拉低”：松开时总线电压按 $V(t) = V_{DD}(1 - e^{-t/RC})$ 充上去。
2. 到 30 % 的时刻 $τ ln\\frac{1}{0.7}$，到 70 % 的时刻 $τ ln\\frac{1}{0.3}$，相减 $τ ln\\frac{7}{3} ≈ 0.8473τ$。
3. 示波器的 rise 量的是 10 %→90 %：$τ ln 9 ≈ 2.197τ$，是 I²C $t_r$ 的约 2.6 倍。
4. 规范：标准模式（100 kHz）$t_r ≤ 1000 ns$，快速模式（400 kHz）$t_r ≤ 300 ns$。
5. 半个周期里还没爬到 $V_{IH}$（STM32 2.15 V、I²C 0.7·$V_DD$），对方读到的永远是 0。`,
      `1. An open-drain output can only pull low: released, the bus charges up as $V(t) = V_{DD}(1 - e^{-t/RC})$.
2. It passes 30 % at $τ ln\\frac{1}{0.7}$ and 70 % at $τ ln\\frac{1}{0.3}$; the difference is $τ ln\\frac{7}{3} ≈ 0.8473τ$.
3. The scope’s "rise" is 10 %→90 %: $τ ln 9 ≈ 2.197τ$, about 2.6 times the I²C $t_r$.
4. The spec: Standard mode (100 kHz) $t_r ≤ 1000 ns$, Fast mode (400 kHz) $t_r ≤ 300 ns$.
5. If the line hasn’t reached $V_{IH}$ (2.15 V on the STM32, 0.7·$V_DD$ for I²C) within half a period, the other side always reads 0.`,
    ),
    example: tr(
      '实验 5-16（200 pF）：2.2 kΩ：τ = 440 ns，$t_r ≈ 373 ns$（10–90 % 0.97 µs）——满足标准模式，不满足快速模式。10 kΩ：τ = 2 µs，$t_r ≈ 1.7 µs$，连标准模式都不行；400 kHz 时半周期 1.25 µs 只爬到 $3.3(1 - e^{-0.625}) ≈ 1.5 V$。',
      'Lab 5-16 (200 pF): 2.2 kΩ: τ = 440 ns, $t_r ≈ 373 ns$ (0.97 µs 10–90 %) — passes Standard mode, fails Fast mode. 10 kΩ: τ = 2 µs, $t_r ≈ 1.7 µs$, not even Standard mode; at 400 kHz half a period (1.25 µs) only reaches $3.3(1 - e^{-0.625}) ≈ 1.5 V$.',
    ),
    pitfalls: [
      tr(
        '内部上拉（40–45 kΩ）太弱：200 pF 时 τ ≈ 8–9 µs，比一个 100 kHz 周期还长。',
        'Internal pull-ups (40–45 kΩ) are too weak: at 200 pF τ ≈ 8–9 µs, longer than a whole 100 kHz period.',
      ),
    ],
    Figure: () => (
      <g>
        <T x={60} y={14}>
          3V3
        </T>
        <Path d="60,18 60,25" />
        <R x1={60} y1={25} x2={60} y2={70} label="R" />
        <Path d="60,70 60,80 200,80" />
        <Dot x={60} y={80} />
        <Path d="120,80 120,92" />
        <C x1={120} y1={92} x2={120} y2={125} label="C_bus" />
        <Gnd x={120} y={128} />
        <Path d="120,125 120,128" />
        <Path d="200,80 200,92" />
        <path d="M200 92 L212 110 M200 114 V126" className="cf-w" fill="none" />
        <Gnd x={200} y={128} />
        <Path d="200,126 200,128" />
        <T x={218} y={108} anchor="start" cls="small">
          {tr('开漏', 'open drain')}
        </T>
      </g>
    ),
    teardowns: ['devboard'],
    lessons: ['exp5-i2c-pullup-rise-time', 'exp5-open-drain-level-shifter'],
    chapter: 'first-order',
  },
  {
    id: 'i2c-pullup-range',
    group: 'mcu',
    title: tr('I²C 上拉电阻的范围', 'I²C pull-up range'),
    tex: 'R_{max} = \\frac{t_r}{0.8473 C_{bus}}, R_{min} = \\frac{V_{DD} - 0.4 V}{3 mA}',
    use: tr(
      '上拉不能太大（不够快），也不能太小（拉不低）：上限由上升时间决定，下限由 3 mA 灌电流决定。',
      'A pull-up can be neither too large (too slow) nor too small (can’t be pulled low): rise time sets the maximum, the 3 mA sink current the minimum.',
    ),
    vars: [
      { sym: 't_r', name: tr('允许的上升时间（标准 1000 ns、快速 300 ns）', 'allowed rise time (Standard 1000 ns, Fast 300 ns)'), unit: 's', def: 3e-7 },
      { sym: 'C', name: tr('总线电容', 'bus capacitance'), unit: 'F', def: 2e-10 },
    ],
    out: { sym: 'R_max', name: tr('最大上拉电阻', 'largest pull-up'), unit: 'Ω' },
    compute: (v) => v.t_r / (Math.log(7 / 3) * v.C),
    why: tr(
      `1. **上限**：$t_r = 0.8473RC ≤$ 规范值 ⇒ $R ≤ \\frac{t_r}{0.8473C}$。
2. **下限**：规范只保证器件在灌 3 mA 时 $V_{OL} ≤ 0.4 V$。拉低时上拉电流 $\\frac{V_{DD} - 0.4}{R} ≤ 3 mA$ ⇒ $R ≥ \\frac{V_{DD} - 0.4}{3 mA}$。
3. 在两者之间选：3.3 V、100 kHz、几个模块用 2.2–4.7 kΩ；400 kHz 或长线用 1–2.2 kΩ。
4. 很多 I²C 模块板上自带上拉：几个模块并在一起，总上拉 = 它们并联，可能低于下限——拆掉多余的。`,
      `1. **Maximum**: $t_r = 0.8473RC ≤$ the spec ⇒ $R ≤ \\frac{t_r}{0.8473C}$.
2. **Minimum**: the spec only guarantees $V_{OL} ≤ 0.4 V$ while sinking 3 mA. Pulled low, the pull-up passes $\\frac{V_{DD} - 0.4}{R} ≤ 3 mA$ ⇒ $R ≥ \\frac{V_{DD} - 0.4}{3 mA}$.
3. Choose between them: 3.3 V, 100 kHz and a few modules: 2.2–4.7 kΩ; 400 kHz or long wires: 1–2.2 kΩ.
4. Many I²C breakout boards carry their own pull-ups: several modules on one bus put them in parallel, possibly below the minimum — remove the extras.`,
    ),
    example: tr(
      '200 pF：快速模式 $R_{max} = \\frac{300 ns}{0.8473 × 200 pF} ≈ 1.77 kΩ$（用 1.5 kΩ）；标准模式 ≈ 5.9 kΩ。3.3 V 的下限 $\\frac{2.9}{3 mA} ≈ 967 Ω$（5 V 时 1.53 kΩ）。五个各带 4.7 kΩ 的模块：$\\frac{4.7k}{5} = 940 Ω$——已经低于下限。',
      '200 pF: Fast mode $R_{max} = \\frac{300 ns}{0.8473 × 200 pF} ≈ 1.77 kΩ$ (use 1.5 kΩ); Standard mode ≈ 5.9 kΩ. The minimum at 3.3 V is $\\frac{2.9}{3 mA} ≈ 967 Ω$ (1.53 kΩ at 5 V). Five modules with 4.7 kΩ each: $\\frac{4.7k}{5} = 940 Ω$ — already below the minimum.',
    ),
    pitfalls: [tr('上拉接 3.3 V，不要接 5 V：ESP32 没有耐 5 V 的引脚。', 'Pull up to 3.3 V, not 5 V: the ESP32 has no 5 V tolerant pins.')],
    lessons: ['exp5-i2c-pullup-rise-time'],
    chapter: 'first-order',
  },
];
