// The light index of the "Inside" content: which teardowns exist, their titles, and the lessons /
// challenges that introduce them. The teardowns themselves (svg figures + text) and the calculation
// cards are lazy chunks, loaded when one is opened.
//
// Project rule: whenever a lesson or lab introduces something new (a part, an instrument, a chip),
// it gets a teardown here, listed under the lesson / challenge ids that first use it.

import type { TeardownBuild } from './types';

export interface TdEntry {
  id: string;
  zh: string;
  en: string;
  /** one-line teaser for cards */
  zhSub: string;
  enSub: string;
  /** lessons / challenges whose panel shows "Look inside first" for this teardown */
  lessons: string[];
  load: () => Promise<{ default: TeardownBuild }>;
}

export const TEARDOWNS: TdEntry[] = [
  {
    id: 'breadboard',
    zh: '面包板',
    en: 'Breadboard',
    zhSub: '孔下面的金属条 = 结点',
    enSub: 'the strips under the holes are nodes',
    lessons: ['lesson-breadboard-basics', 'lesson-schematic-to-breadboard'],
    load: () => import('./td/breadboard'),
  },
  {
    id: 'lm358',
    zh: 'LM358 op-amp',
    en: 'LM358 op-amp',
    zhSub: '外形 → 三角形 → 等效电路 → 虚短虚断 → 放大器公式',
    enSub: 'package → triangle → model → golden rules → amplifier formulas',
    lessons: [
      'lesson-lm358',
      'exp-voltage-follower',
      'exp-noninverting-amp',
      'exp-inverting-amp',
      'exp-summing-amp',
      'exp3-opamp-integrator',
      'exp4-active-lowpass',
      'exp4-buffered-bandpass',
    ],
    load: () => import('./td/lm358'),
  },
  {
    id: 'battery',
    zh: '电池',
    en: 'Battery',
    zhSub: '化学电动势 + 内阻：为什么带载电压会掉',
    enSub: 'EMF plus internal resistance: why the voltage sags under load',
    lessons: ['lesson-power-and-ground', 'lesson-power-supplies', 'challenge-coin-cell'],
    load: () => import('./td/battery'),
  },
  {
    id: 'resistor',
    zh: '电阻',
    en: 'Resistor',
    zhSub: '色环、碳膜螺旋、欧姆定律、额定功率',
    enSub: 'colour bands, the film spiral, Ohm’s law, power rating',
    lessons: ['lesson-series', 'challenge-series-parallel', 'exp-measure-req'],
    load: () => import('./td/resistor'),
  },
  {
    id: 'led',
    zh: 'LED 发光二极管',
    en: 'LED',
    zhSub: '两只脚、芯片、PN 结、I–V 曲线、限流电阻',
    enSub: 'legs, die, PN junction, I–V curve, series resistor',
    lessons: ['lesson-light-an-led', 'lesson-parallel', 'challenge-two-leds-series'],
    load: () => import('./td/led'),
  },
  {
    id: 'switches',
    zh: '按键与拨动开关',
    en: 'Push button & slide switch',
    zhSub: '四只脚里哪两只是一体的',
    enSub: 'which of the four legs are joined inside',
    lessons: ['lesson-pushbutton', 'challenge-button-parallel', 'challenge-spdt-selector'],
    load: () => import('./td/switches'),
  },
  {
    id: 'potentiometer',
    zh: '电位器',
    en: 'Potentiometer',
    zhSub: '电阻轨道 + 滑动端 = 可调分压器',
    enSub: 'a resistive track plus a wiper = an adjustable divider',
    lessons: ['challenge-pot-dimmer', 'exp-max-power'],
    load: () => import('./td/potentiometer'),
  },
  {
    id: 'regulator',
    zh: '稳压器 / 电源模块',
    en: 'Regulator / power module',
    zhSub: 'LDO 内部：调整管 + 误差放大器 + 压差',
    enSub: 'inside an LDO: pass transistor, error amp, dropout',
    lessons: ['challenge-module-blue-led', 'exp5-ldo-dropout'],
    load: () => import('./td/regulator'),
  },
  {
    id: 'bench-supply',
    zh: '稳压电源 CV / CC',
    en: 'Bench supply CV / CC',
    zhSub: '两个环路：恒压和恒流谁说了算',
    enSub: 'two loops: when constant voltage or constant current rules',
    lessons: ['lesson-bench-supply', 'exp-cc-current-source', 'challenge-bench-supply'],
    load: () => import('./td/bench-supply'),
  },
  {
    id: 'diode',
    zh: '二极管',
    en: 'Diode',
    zhSub: 'PN 结、单向导电、正向压降、反接保护',
    enSub: 'PN junction, one-way conduction, forward drop, reverse protection',
    lessons: ['challenge-reverse-protection'],
    load: () => import('./td/diode'),
  },
  {
    id: 'multimeter',
    zh: '万用表（电压档）',
    en: 'Multimeter (volts)',
    zhSub: '10 MΩ 输入电阻、COM、为什么要并联',
    enSub: '10 MΩ input, COM, why it goes in parallel',
    lessons: ['lesson-multimeter', 'exp-kvl-loops'],
    load: () => import('./td/multimeter'),
  },
  {
    id: 'ammeter',
    zh: '电流表',
    en: 'Ammeter',
    zhSub: '分流电阻 + 毫伏表：为什么必须串联',
    enSub: 'a shunt plus a millivoltmeter: why it must go in series',
    lessons: ['lesson-ammeter', 'exp-kcl-ammeters'],
    load: () => import('./td/ammeter'),
  },
  {
    id: 'function-generator',
    zh: '信号发生器',
    en: 'Function generator',
    zhSub: '理想电压源 + 50 Ω 内阻、幅度 / 偏置',
    enSub: 'an ideal source plus 50 Ω, amplitude / offset',
    lessons: ['lesson-generator-scope'],
    load: () => import('./td/function-generator'),
  },
  {
    id: 'oscilloscope',
    zh: '示波器',
    en: 'Oscilloscope',
    zhSub: '衰减、采样、触发、伏/格和时间/格',
    enSub: 'attenuator, sampling, trigger, V/div and time/div',
    lessons: ['lesson-generator-scope', 'lesson-scope-two-channels'],
    load: () => import('./td/oscilloscope'),
  },
  {
    id: 'capacitor',
    zh: '电容',
    en: 'Capacitor',
    zhSub: '两块极板、q = Cu、i = C du/dt、充放电',
    enSub: 'two plates, q = Cu, i = C du/dt, charging',
    lessons: ['exp3-rc-square-charging', 'exp3-rc-differentiator-integrator', 'exp3-led-breathing'],
    load: () => import('./td/capacitor'),
  },
  {
    id: 'inductor',
    zh: '电感',
    en: 'Inductor',
    zhSub: '线圈、磁通、u = L di/dt、断电尖峰',
    enSub: 'a coil, flux, u = L di/dt, the turn-off spike',
    lessons: ['exp3-rl-square', 'exp3-rlc-ringing', 'exp4-rl-phasors'],
    load: () => import('./td/inductor'),
  },
  {
    id: 'relay',
    zh: '继电器',
    en: 'Relay',
    zhSub: '线圈 + 衔铁 + 触点，以及续流二极管',
    enSub: 'coil, armature, contacts, and the flyback diode',
    lessons: ['exp5-relay-flyback'],
    load: () => import('./td/relay'),
  },
  {
    id: 'devboard',
    zh: '开发板 GPIO',
    en: 'Dev board GPIO',
    zhSub: '推挽输出级、输入、上下拉、3.3 V 稳压',
    enSub: 'push-pull output stage, inputs, pull-ups, the 3.3 V regulator',
    lessons: ['lesson-mcu-gpio', 'exp5-gpio-led-resistor', 'exp5-sink-vs-source'],
    load: () => import('./td/devboard'),
  },
  {
    id: 'pwm-adc',
    zh: 'PWM 与 ADC',
    en: 'PWM and ADC',
    zhSub: '占空比 → 平均值；电压 → 数字码',
    enSub: 'duty cycle → average; voltage → a number',
    lessons: ['lesson-mcu-pwm-adc', 'exp5-pwm-rc-dac', 'exp5-adc-battery-divider'],
    load: () => import('./td/pwm-adc'),
  },
  {
    id: 'npn',
    zh: 'NPN 三极管',
    en: 'NPN transistor',
    zhSub: '三层半导体、I_C = βI_B、饱和开关',
    enSub: 'three layers, I_C = βI_B, the saturated switch',
    lessons: ['exp5-npn-buzzer-switch', 'exp5-high-side-vs-low-side'],
    load: () => import('./td/npn'),
  },
  {
    id: 'mosfet',
    zh: 'N-MOSFET',
    en: 'N-MOSFET',
    zhSub: '栅极电场开沟道、V_GS(th)、R_DS(on)',
    enSub: 'the gate field opens a channel, V_GS(th), R_DS(on)',
    lessons: ['exp5-mosfet-logic-level', 'exp5-pwm-mosfet-motor'],
    load: () => import('./td/mosfet'),
  },
  {
    id: 'sensors',
    zh: '光敏电阻与热敏电阻',
    en: 'LDR and NTC',
    zhSub: '电阻随光 / 温度变，接成分压器去读',
    enSub: 'resistance that follows light / heat, read through a divider',
    lessons: ['exp5-ldr-light-sensor', 'exp5-ntc-thermometer'],
    load: () => import('./td/sensors'),
  },
];

export const tdById = (id: string) => TEARDOWNS.find((t) => t.id === id);
export const teardownsFor = (lessonId: string) => TEARDOWNS.filter((t) => t.lessons.includes(lessonId));

/* ------------------------------------------------------------------ calculation cards */

let calcMod: Promise<typeof import('./calc/all')> | null = null;
/** the calculation cards' chunk (cards are built per render with allCalcs(), so text follows the language) */
export const loadCalcModule = () => (calcMod ??= import('./calc/all'));
