// The course map (docs/REBUILD_PLAN.md): five Worlds, each a run of short units, each unit a few
// bench items (lessons, challenges, labs) in the order to do them, plus the theory chapters that
// go with it. The Learn page follows this order; the files keep their ids, so saved progress,
// layouts and links stay valid when a unit moves. Chapter numbers refer to Alexander & Sadiku,
// "Fundamentals of Electric Circuits" (S), Boylestad, "Introductory Circuit Analysis" (B), Platt,
// "Make: Electronics" 2nd ed. (M, experiments) and Scherz & Monk, "Practical Electronics for
// Inventors" 4th ed. (P).

import { tr } from './i18n';

export interface CourseUnit {
  /** "1.7" — shown on the cards */
  num: string;
  title: () => string;
  /** challenge / lesson ids, in order */
  items: string[];
  /** theory chapters (problem chapter ids) that go with this unit */
  practice?: string[];
}

export interface World {
  id: 1 | 2 | 3 | 4 | 5;
  title: () => string;
  /** one line: what this World is about */
  blurb: () => string;
  /** where the material comes from, e.g. "S 1–2 · B 1–7 · M 1–6" */
  books: string;
  units: CourseUnit[];
}

export const WORLDS: World[] = [
  {
    id: 1,
    title: () => tr('看见看不见的电', 'Seeing the invisible'),
    blurb: () => tr('直流基础：面包板、电源、LED，先学会用表，再学串联、并联和 KCL/KVL。', 'DC basics: breadboard, supplies, LEDs — meters first, then series, parallel, KCL/KVL.'),
    books: 'S 1–2 · B 1–7 · M 1–6',
    units: [
      { num: '1.1', title: () => tr('面包板：孔底下的金属条', 'The breadboard: strips under the holes'), items: ['lesson-breadboard-basics'] },
      { num: '1.2', title: () => tr('电源与 GND：电流回家的路', 'Power and GND: the way home'), items: ['lesson-power-and-ground'] },
      { num: '1.3', title: () => tr('LED：为什么一定要限流电阻', 'LEDs: why the resistor is not optional'), items: ['lesson-light-an-led'] },
      { num: '1.4', title: () => tr('万用表：看见电压', 'The multimeter: seeing voltage'), items: ['lesson-multimeter', 'challenge-voltage-divider'] },
      { num: '1.5', title: () => tr('电流表：串联才能测电流', 'The ammeter: in series, always'), items: ['lesson-ammeter'] },
      { num: '1.6', title: () => tr('从原理图到面包板', 'From schematic to breadboard'), items: ['lesson-schematic-to-breadboard'], practice: ['basics'] },
      {
        num: '1.7',
        title: () => tr('串联与 KVL', 'Series circuits and KVL'),
        items: ['lesson-series', 'challenge-two-leds-series', 'exp-kvl-loops'],
        practice: ['basics', 'equivalence'],
      },
      { num: '1.8', title: () => tr('并联与 KCL', 'Parallel circuits and KCL'), items: ['lesson-parallel', 'exp-kcl-ammeters'], practice: ['basics', 'equivalence'] },
      {
        num: '1.9',
        title: () => tr('开关、按键与电位器', 'Switches, buttons and pots'),
        items: ['lesson-pushbutton', 'challenge-pot-dimmer', 'challenge-spdt-selector', 'challenge-button-parallel'],
      },
      {
        num: '1.10',
        title: () => tr('真实的电源：内阻、模块、稳压电源', 'Real supplies: internal resistance, modules, bench supply'),
        items: ['lesson-power-supplies', 'challenge-coin-cell', 'challenge-module-blue-led', 'lesson-bench-supply', 'challenge-bench-supply'],
      },
      {
        num: '1.11',
        title: () => tr('混联、电桥与排错', 'Series-parallel, bridges and fault-finding'),
        items: ['challenge-fix-the-circuit', 'challenge-series-parallel', 'exp-measure-req', 'exp-wheatstone-bridge'],
        practice: ['equivalence'],
      },
    ],
  },
  {
    id: 2,
    title: () => tr('驯服电路网络与运放', 'Taming networks and op-amps'),
    blurb: () => tr('分析方法、电路定理，然后认识运放——受控源就是放大器。', 'Analysis methods and theorems, then the op-amp — a dependent source you can hold.'),
    books: 'S 3–5 · B 8–9 · P 2, 8',
    units: [
      { num: '2.1', title: () => tr('电流源与分流', 'Current sources and current division'), items: ['exp-cc-current-source', 'exp-current-divider'] },
      { num: '2.2', title: () => tr('结点电压法', 'Nodal analysis'), items: ['exp-nodal-analysis'], practice: ['methods'] },
      {
        num: '2.3',
        title: () => tr('电源变换与叠加', 'Source transformation and superposition'),
        items: ['exp-source-transformation', 'exp-superposition'],
        practice: ['theorems'],
      },
      { num: '2.4', title: () => tr('戴维宁等效与最大功率', 'Thevenin and maximum power'), items: ['exp-thevenin-measure', 'exp-max-power'], practice: ['theorems'] },
      {
        num: '2.5',
        title: () => tr('LM358：拯救被负载压垮的分压器', 'LM358: rescuing a loaded divider'),
        items: ['lesson-lm358', 'exp-loaded-divider', 'exp-voltage-follower'],
        practice: ['opamp'],
      },
      { num: '2.6', title: () => tr('同相放大器', 'The non-inverting amplifier'), items: ['exp-noninverting-amp'], practice: ['opamp', 'dependent-sources'] },
    ],
  },
  {
    id: 3,
    title: () => tr('掌控时间：电容、电感与暂态', 'Taming time: capacitors, inductors, transients'),
    blurb: () => tr('信号发生器和示波器，方波下的 RC、RL、RLC。', 'Function generator and scope; RC, RL and RLC under a square wave.'),
    books: 'S 6–8 · B 10–11, 25 · M 9',
    units: [
      { num: '3.1', title: () => tr('信号发生器和示波器', 'Function generator and oscilloscope'), items: ['lesson-generator-scope', 'lesson-scope-two-channels'] },
      { num: '3.2', title: () => tr('运放遇上交流信号', 'Op-amps meet AC signals'), items: ['exp-inverting-amp', 'exp-summing-amp'], practice: ['opamp'] },
      { num: '3.3', title: () => tr('呼吸灯：看得见的充放电', 'Breathing LED: charging you can see'), items: ['exp3-led-breathing'], practice: ['storage'] },
      { num: '3.4', title: () => tr('RC 时间常数', 'The RC time constant'), items: ['exp3-rc-square-charging', 'exp3-rc-thevenin-tau'], practice: ['first-order'] },
      {
        num: '3.5',
        title: () => tr('微分、积分与运放积分器', 'Differentiators, integrators, the op-amp integrator'),
        items: ['exp3-rc-differentiator-integrator', 'exp3-opamp-integrator'],
        practice: ['first-order'],
      },
      { num: '3.6', title: () => tr('电感的脾气', "The inductor's temper"), items: ['exp3-rl-square'], practice: ['first-order'] },
      { num: '3.7', title: () => tr('RLC 振铃', 'RLC ringing'), items: ['exp3-rlc-ringing'], practice: ['second-order'] },
    ],
  },
  {
    id: 4,
    title: () => tr('掌控频率：交流电与滤波器', 'Taming frequency: AC and filters'),
    blurb: () =>
      tr('相量、功率、频率响应与谐振；拉普拉斯、傅里叶和二端口按需选学。', 'Phasors, power, frequency response and resonance; Laplace, Fourier and two-ports when you need them.'),
    books: 'S 9–17, 19 · B 13–24, 26',
    units: [
      {
        num: '4.1',
        title: () => tr('相量：RL 电路的电压三角形', 'Phasors: the voltage triangle of an RL circuit'),
        items: ['exp4-rl-phasors'],
        practice: ['phasors', 'ac-analysis'],
      },
      {
        num: '4.2',
        title: () => tr('滤波器与谐振', 'Filters and resonance'),
        items: ['exp4-rc-lowpass-bode', 'exp4-rc-highpass-coupling', 'exp4-series-resonance', 'exp4-parallel-lc-tank'],
        practice: ['frequency'],
      },
      {
        num: '4.3',
        title: () => tr('有源滤波与级间缓冲', 'Active filters and buffering stages'),
        items: ['exp4-active-lowpass', 'exp4-rc-bandpass-loading', 'exp4-buffered-bandpass'],
        practice: ['frequency'],
      },
      {
        num: '4.4',
        title: () => tr('交流功率、三相与变压器（理论）', 'AC power, three-phase, transformers (theory)'),
        items: [],
        practice: ['ac-power', 'three-phase', 'coupled'],
      },
      { num: '4.5', title: () => tr('选学：拉普拉斯、傅里叶、二端口', 'Elective: Laplace, Fourier, two-ports'), items: [], practice: ['s-domain', 'non-sinusoidal', 'two-port'] },
    ],
  },
  {
    id: 5,
    title: () => tr('从元件到 ESP32 项目', 'From parts to ESP32 projects'),
    blurb: () =>
      tr(
        '二极管、三极管、MOSFET，开发板供电、GPIO、ADC 传感器和 PWM，最后做一个完整系统。',
        'Diodes, transistors, MOSFETs; board power, GPIO, ADC sensors and PWM — then a complete system.',
      ),
    books: 'P 3–6, 12 · M 7, 10–11',
    units: [
      { num: '5.1', title: () => tr('二极管与非线性元件', 'Diodes and nonlinear parts'), items: ['challenge-reverse-protection'], practice: ['nonlinear'] },
      {
        num: '5.2',
        title: () => tr('开发板与 GPIO', 'Dev boards and GPIO'),
        items: ['lesson-mcu-gpio', 'exp5-gpio-led-resistor', 'exp5-sink-vs-source', 'exp5-button-pull-resistors'],
      },
      { num: '5.3', title: () => tr('NPN 三极管开关', 'NPN transistor switches'), items: ['exp5-npn-buzzer-switch', 'exp5-high-side-vs-low-side'] },
      { num: '5.4', title: () => tr('MOSFET 与继电器', 'MOSFETs and relays'), items: ['exp5-mosfet-logic-level', 'exp5-relay-flyback'] },
      { num: '5.5', title: () => tr('供电：LDO 与电流预算', 'Power: LDOs and current budgets'), items: ['exp5-ldo-dropout', 'exp5-board-power-budget'] },
      { num: '5.6', title: () => tr('3.3 V 和 5 V 对话', '3.3 V talking to 5 V'), items: ['exp5-5v-signal-level-shift', 'exp5-open-drain-level-shifter'] },
      {
        num: '5.7',
        title: () => tr('ADC 与模拟传感器', 'ADC and analog sensors'),
        items: ['lesson-mcu-pwm-adc', 'exp5-adc-battery-divider', 'exp5-ldr-light-sensor', 'exp5-ntc-thermometer'],
      },
      { num: '5.8', title: () => tr('PWM：调光、DAC 与调速', 'PWM: dimming, DAC, motor speed'), items: ['exp5-pwm-rc-dac', 'exp5-pwm-mosfet-motor', 'exp5-i2c-pullup-rise-time'] },
      { num: '5.9', title: () => tr('综合项目：温控风扇', 'Capstone: a temperature-controlled fan'), items: ['exp5-capstone-ntc-fan'] },
    ],
  },
];

/** Theory chapters kept out of the main path (shown as electives in Practice). */
export const ARCHIVED_CHAPTERS = ['matrix-form', 'transmission-line'];

export interface CoursePlace {
  world: World;
  unit: CourseUnit;
  /** position inside the unit (0-based) */
  pos: number;
  /** index in the whole course */
  index: number;
}

/** Every bench item in course order. */
export const COURSE_ORDER: string[] = WORLDS.flatMap((w) => w.units.flatMap((u) => u.items));

const PLACES = new Map<string, CoursePlace>();
WORLDS.forEach((world) =>
  world.units.forEach((unit) =>
    unit.items.forEach((id, pos) => {
      PLACES.set(id, { world, unit, pos, index: PLACES.size });
    }),
  ),
);

/** Where a bench item sits in the course (undefined: not in the map, e.g. an imported file). */
export const placeOf = (id: string): CoursePlace | undefined => PLACES.get(id);

/** "1.7" for a one-item unit, "1.7b" for the second item of a longer one. */
export function itemLabel(p: CoursePlace): string {
  return p.unit.items.length > 1 ? `${p.unit.num}${'abcdefghij'[p.pos]}` : p.unit.num;
}

/** The theory chapters of a World, in course order, without repeats. */
export function worldChapters(w: World): string[] {
  return [...new Set(w.units.flatMap((u) => u.practice ?? []))];
}

/** Items sorted in course order; items outside the map keep their order after them. */
export function inCourseOrder<T extends { id: string }>(items: T[]): T[] {
  const known = items.filter((c) => PLACES.has(c.id)).sort((a, b) => PLACES.get(a.id)!.index - PLACES.get(b.id)!.index);
  return [...known, ...items.filter((c) => !PLACES.has(c.id))];
}
