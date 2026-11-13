// Phase 5: microcontroller dev boards (ESP32-DevKitC, STM32 "Blue Pill").
// There is no firmware: each GPIO has a *mode* (PartProps.pins). This file holds the board
// tables (pin order, capabilities, electrical limits) and the logical-role rules used by
// challenge targets. The electrical model is compiled in solver.ts (see "Phase 5 contract"
// in docs/ROADMAP.md).

import type { CompType, PartType, PinConfig, PinMode, PartProps } from './types';

export type McuType = 'esp32_devkit' | 'stm32_bluepill';
export const MCU_TYPES: McuType[] = ['esp32_devkit', 'stm32_bluepill'];
/** Board types plus the target-only generic `mcu` (matches either board). */
export const isMcu = (t: CompType | PartType | string): t is McuType | 'mcu' => t === 'esp32_devkit' || t === 'stm32_bluepill' || t === 'mcu';
export const isMcuBoard = (t: CompType | PartType | string): t is McuType => t === 'esp32_devkit' || t === 'stm32_bluepill';

export type McuPinKind = 'gpio' | '3v3' | '5v' | 'gnd' | 'en' | 'vbat' | 'flash';

export interface GpioCaps {
  input: boolean;
  output: boolean;
  /** internal pull-up / pull-down available */
  pull: boolean;
  /** ADC channel name (e.g. "ADC1_CH4", "ADC12_IN0"); ESP32 ADC2 channels are flagged adc2 */
  adc?: string;
  adc2?: boolean;
  pwm: boolean;
  /** 5 V tolerant (STM32 FT pins) */
  ft: boolean;
  /** weak driver (STM32 PC13–PC15: 3 mA) */
  weak?: boolean;
  /** something to know about this pin */
  note?: 'tx' | 'rx' | 'strap' | 'usb' | 'led' | 'flash';
}

export interface McuPinDef {
  /** logical terminal (= physical pin name) */
  name: string;
  /** silkscreen label printed next to the pin */
  label: string;
  kind: McuPinKind;
  gpio?: GpioCaps;
}

export interface McuLeg {
  /** physical leg id used in PlacedPart.pins (duplicates get _2, _3) */
  leg: string;
  pin: string;
  /** 0 = upper row (anchor row), 1 = lower row */
  row: 0 | 1;
  col: number;
}

export interface McuBoardDef {
  type: McuType;
  name: [string, string];
  /** upper header (anchor row), left → right */
  upper: string[];
  /** lower header, left → right */
  lower: string[];
  /** breadboard rows used by the two headers */
  rows: [string, string];
  pins: Record<string, McuPinDef>;
  legs: McuLeg[];
  vdd: number;
  /** output driver resistance (Ω) */
  rout: number;
  /** internal pull resistor (Ω) */
  rpull: number;
  vil: number;
  vih: number;
  /** per-pin current: recommended / absolute maximum (A) */
  iRec: number;
  iMax: number;
  /** recommended limit for weak pins */
  iWeak: number;
  /** clamp-diode injection that damages the pin (A) */
  iInjMax: number;
  /** chip below this 3V3 voltage is in brown-out reset */
  brownout: number;
  /** chip supply current, modelled as a resistor 3V3 → GND */
  coreR: number;
  regulator: { name: string; dropout: number; limit: number };
  /** USB budget (A) */
  usbLimit: number;
  /** pull-up on EN / NRST (Ω) */
  enPull: number;
  enPin: string;
  /** onboard LEDs: power LED (3V3 → R → LED → GND) and an optional user LED (3V3 → R → LED → pin) */
  powerLedR: number;
  userLed?: { pin: string; r: number };
}

// ---------------------------------------------------------------------------------------
// ESP32-DevKitC (38 pins)

const E_OUT = (extra: Partial<GpioCaps> = {}): GpioCaps => ({ input: true, output: true, pull: true, pwm: true, ft: false, ...extra });
const E_IN = (adc: string): GpioCaps => ({ input: true, output: false, pull: false, pwm: false, ft: false, adc });

const ESP32_GPIO: Record<number, GpioCaps> = {
  0: E_OUT({ adc: 'ADC2_CH1', adc2: true, note: 'strap' }),
  1: E_OUT({ note: 'tx' }),
  2: E_OUT({ adc: 'ADC2_CH2', adc2: true, note: 'strap' }),
  3: E_OUT({ note: 'rx' }),
  4: E_OUT({ adc: 'ADC2_CH0', adc2: true }),
  5: E_OUT({ note: 'strap' }),
  12: E_OUT({ adc: 'ADC2_CH5', adc2: true, note: 'strap' }),
  13: E_OUT({ adc: 'ADC2_CH4', adc2: true }),
  14: E_OUT({ adc: 'ADC2_CH6', adc2: true }),
  15: E_OUT({ adc: 'ADC2_CH3', adc2: true, note: 'strap' }),
  16: E_OUT(),
  17: E_OUT(),
  18: E_OUT(),
  19: E_OUT(),
  21: E_OUT(),
  22: E_OUT(),
  23: E_OUT(),
  25: E_OUT({ adc: 'ADC2_CH8', adc2: true }),
  26: E_OUT({ adc: 'ADC2_CH9', adc2: true }),
  27: E_OUT({ adc: 'ADC2_CH7', adc2: true }),
  32: E_OUT({ adc: 'ADC1_CH4' }),
  33: E_OUT({ adc: 'ADC1_CH5' }),
  34: E_IN('ADC1_CH6'),
  35: E_IN('ADC1_CH7'),
  36: E_IN('ADC1_CH0'),
  39: E_IN('ADC1_CH3'),
};
const ESP32_LABEL: Record<number, string> = { 1: 'TX', 3: 'RX', 36: 'VP', 39: 'VN', 6: 'CLK', 7: 'SD0', 8: 'SD1', 9: 'SD2', 10: 'SD3', 11: 'CMD' };

function esp32Pins(): Record<string, McuPinDef> {
  const out: Record<string, McuPinDef> = {
    '3V3': { name: '3V3', label: '3V3', kind: '3v3' },
    '5V': { name: '5V', label: '5V', kind: '5v' },
    GND: { name: 'GND', label: 'GND', kind: 'gnd' },
    EN: { name: 'EN', label: 'EN', kind: 'en' },
  };
  for (let n = 0; n <= 39; n++) {
    const name = `GPIO${n}`;
    if (ESP32_GPIO[n]) out[name] = { name, label: ESP32_LABEL[n] ?? String(n), kind: 'gpio', gpio: ESP32_GPIO[n] };
    else if (n >= 6 && n <= 11) out[name] = { name, label: ESP32_LABEL[n], kind: 'flash' };
  }
  return out;
}

// ---------------------------------------------------------------------------------------
// STM32F103C8T6 Blue Pill (40 pins)

const STM_FT = new Set(['PA8', 'PA9', 'PA10', 'PA11', 'PA12', 'PA15', 'PB3', 'PB4', 'PB6', 'PB7', 'PB8', 'PB9', 'PB10', 'PB11', 'PB12', 'PB13', 'PB14', 'PB15']);
const STM_ADC: Record<string, string> = { PA0: 'ADC12_IN0', PA1: 'ADC12_IN1', PA2: 'ADC12_IN2', PA3: 'ADC12_IN3', PA4: 'ADC12_IN4', PA5: 'ADC12_IN5', PA6: 'ADC12_IN6', PA7: 'ADC12_IN7', PB0: 'ADC12_IN8', PB1: 'ADC12_IN9' };
const STM_PWM = new Set(['PA0', 'PA1', 'PA2', 'PA3', 'PA6', 'PA7', 'PA8', 'PA9', 'PA10', 'PA11', 'PB0', 'PB1', 'PB6', 'PB7', 'PB8', 'PB9']);

function stmPins(): Record<string, McuPinDef> {
  const out: Record<string, McuPinDef> = {
    '3V3': { name: '3V3', label: '3.3', kind: '3v3' },
    '5V': { name: '5V', label: '5V', kind: '5v' },
    GND: { name: 'GND', label: 'G', kind: 'gnd' },
    NRST: { name: 'NRST', label: 'R', kind: 'en' },
    VBAT: { name: 'VBAT', label: 'VB', kind: 'vbat' },
  };
  const io = [
    ...['PA0', 'PA1', 'PA2', 'PA3', 'PA4', 'PA5', 'PA6', 'PA7', 'PA8', 'PA9', 'PA10', 'PA11', 'PA12', 'PA15'],
    ...['PB0', 'PB1', 'PB3', 'PB4', 'PB5', 'PB6', 'PB7', 'PB8', 'PB9', 'PB10', 'PB11', 'PB12', 'PB13', 'PB14', 'PB15'],
    ...['PC13', 'PC14', 'PC15'],
  ];
  for (const name of io) {
    const weak = name.startsWith('PC');
    out[name] = {
      name,
      label: name.slice(1),
      kind: 'gpio',
      gpio: {
        input: true,
        output: true,
        pull: true,
        pwm: STM_PWM.has(name),
        ft: STM_FT.has(name),
        adc: STM_ADC[name],
        weak,
        note: name === 'PA11' || name === 'PA12' ? 'usb' : name === 'PA9' ? 'tx' : name === 'PA10' ? 'rx' : name === 'PC13' ? 'led' : undefined,
      },
    };
  }
  return out;
}

function legsOf(upper: string[], lower: string[]): McuLeg[] {
  const seen = new Map<string, number>();
  const legs: McuLeg[] = [];
  const add = (pin: string, row: 0 | 1, col: number) => {
    const n = (seen.get(pin) ?? 0) + 1;
    seen.set(pin, n);
    legs.push({ leg: n === 1 ? pin : `${pin}_${n}`, pin, row, col });
  };
  upper.forEach((p, i) => add(p, 0, i));
  lower.forEach((p, i) => add(p, 1, i));
  return legs;
}

const ESP32_UPPER = ['GND', 'GPIO23', 'GPIO22', 'GPIO1', 'GPIO3', 'GPIO21', 'GND', 'GPIO19', 'GPIO18', 'GPIO5', 'GPIO17', 'GPIO16', 'GPIO4', 'GPIO0', 'GPIO2', 'GPIO15', 'GPIO8', 'GPIO7', 'GPIO6'];
const ESP32_LOWER = ['3V3', 'EN', 'GPIO36', 'GPIO39', 'GPIO34', 'GPIO35', 'GPIO32', 'GPIO33', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO14', 'GPIO12', 'GND', 'GPIO13', 'GPIO9', 'GPIO10', 'GPIO11', '5V'];
const STM_UPPER = ['GND', 'GND', '3V3', 'NRST', 'PB11', 'PB10', 'PB1', 'PB0', 'PA7', 'PA6', 'PA5', 'PA4', 'PA3', 'PA2', 'PA1', 'PA0', 'PC15', 'PC14', 'PC13', 'VBAT'];
const STM_LOWER = ['PB12', 'PB13', 'PB14', 'PB15', 'PA8', 'PA9', 'PA10', 'PA11', 'PA12', 'PA15', 'PB3', 'PB4', 'PB5', 'PB6', 'PB7', 'PB8', 'PB9', '5V', 'GND', '3V3'];

export const MCU_BOARDS: Record<McuType, McuBoardDef> = {
  esp32_devkit: {
    type: 'esp32_devkit',
    name: ['ESP32 开发板 DevKitC', 'ESP32 DevKitC'],
    upper: ESP32_UPPER,
    lower: ESP32_LOWER,
    rows: ['b', 'i'],
    pins: esp32Pins(),
    legs: legsOf(ESP32_UPPER, ESP32_LOWER),
    vdd: 3.3,
    rout: 25,
    rpull: 45e3,
    vil: 0.825,
    vih: 2.475,
    iRec: 0.02,
    iMax: 0.04,
    iWeak: 0.02,
    iInjMax: 0.005,
    brownout: 2.5,
    coreR: 66,
    regulator: { name: 'AMS1117-3.3', dropout: 1.1, limit: 1.0 },
    usbLimit: 0.5,
    enPull: 10e3,
    enPin: 'EN',
    powerLedR: 1000,
  },
  stm32_bluepill: {
    type: 'stm32_bluepill',
    name: ['STM32 最小系统板 Blue Pill', 'STM32 Blue Pill'],
    upper: STM_UPPER,
    lower: STM_LOWER,
    rows: ['c', 'g'],
    pins: stmPins(),
    legs: legsOf(STM_UPPER, STM_LOWER),
    vdd: 3.3,
    rout: 40,
    rpull: 40e3,
    vil: 1.16,
    vih: 2.15,
    iRec: 0.02,
    iMax: 0.025,
    iWeak: 0.003,
    iInjMax: 0.005,
    brownout: 2.0,
    coreR: 165,
    regulator: { name: 'RT9193-3.3', dropout: 0.25, limit: 0.3 },
    usbLimit: 0.5,
    enPull: 40e3,
    enPin: 'NRST',
    powerLedR: 1000,
    userLed: { pin: 'PC13', r: 510 },
  },
};

/** Schottky diode between the USB connector and the board's 5V pin. */
export const USB_DIODE = { vf: 0.3, rs: 0.15 };
/** USB host: 5 V behind cable + polyfuse resistance. */
export const USB_SOURCE = { v: 5, rint: 0.25 };
/** Clamp (ESD) diodes on every GPIO. */
export const CLAMP_DIODE = { vf: 0.6, rs: 15 };
/** a digital input whose DC impedance to everything exceeds this is "floating" (Ω) */
export const FLOAT_Z = 50e6;
export const ADC_BITS = 12;
export const ADC_FULL = 3.3;
/** abs max voltage on a non-FT pin (VDD + 0.3 V) and on an FT pin */
export const VPIN_MAX = 3.6;
export const VPIN_MAX_FT = 5.5;
export const VPIN_MIN = -0.3;

export const DEFAULT_PWM = { duty: 50, frequency: 1000 };

// ---------------------------------------------------------------------------------------
// logical roles (challenge targets)

export type McuRole = 'GPIO_OUT' | 'GPIO_IN' | 'ADC' | 'PWM' | 'GPIO_FT' | 'IO';
export const MCU_ROLES: McuRole[] = ['GPIO_OUT', 'GPIO_IN', 'ADC', 'PWM', 'GPIO_FT', 'IO'];
const ROLE_RE = /^(GPIO_OUT|GPIO_IN|ADC|PWM|GPIO_FT|IO)(\d+)$/i;

/** "GPIO_OUT1" -> { role: 'GPIO_OUT', n: 1 }; null for physical / power pins. */
export function parseRole(pin: string): { role: McuRole; n: number } | null {
  const m = ROLE_RE.exec(pin);
  return m ? { role: m[1].toUpperCase() as McuRole, n: Number(m[2]) } : null;
}
export const isRolePin = (pin: string) => parseRole(pin) !== null;

/** Capabilities a logical role stands for (used when a target circuit is simulated itself). */
export function roleCaps(role: McuRole): GpioCaps {
  switch (role) {
    case 'GPIO_OUT':
    case 'PWM':
    case 'IO':
      return { input: true, output: true, pull: true, pwm: true, ft: false };
    case 'GPIO_IN':
      return { input: true, output: false, pull: true, pwm: false, ft: false };
    case 'ADC':
      return { input: true, output: false, pull: false, pwm: false, ft: false, adc: 'ADC' };
    case 'GPIO_FT':
      return { input: true, output: true, pull: true, pwm: false, ft: true };
  }
}

/** Default mode of a pin when PartProps.pins doesn't list it. */
export function defaultMode(pin: string): PinMode {
  const r = parseRole(pin);
  if (!r) return 'input';
  return r.role === 'GPIO_OUT' ? 'out_low' : r.role === 'PWM' ? 'pwm' : r.role === 'ADC' ? 'adc' : 'input';
}

/** Can a physical GPIO play this role? (the matching rule, docs/CHALLENGE_FORMAT.md §8) */
export function roleMatches(role: McuRole, caps: GpioCaps): boolean {
  switch (role) {
    case 'GPIO_OUT':
      return caps.output;
    case 'PWM':
      return caps.output && caps.pwm;
    case 'GPIO_IN':
    case 'IO':
      return caps.input && (role === 'GPIO_IN' || caps.output);
    case 'ADC':
      return !!caps.adc && !caps.adc2;
    case 'GPIO_FT':
      return caps.ft;
  }
}

/** Board definition for a component type (the generic `mcu` behaves like an ESP32 electrically). */
export function boardOf(type: CompType | PartType): McuBoardDef {
  return type === 'stm32_bluepill' ? MCU_BOARDS.stm32_bluepill : MCU_BOARDS.esp32_devkit;
}

/** Pin definition by name, including logical role pins (which get their role's caps). */
export function mcuPin(type: CompType | PartType, pin: string): McuPinDef | null {
  const b = boardOf(type);
  if (type !== 'mcu' && b.pins[pin]) return b.pins[pin];
  if (pin === '3V3' || pin === '5V' || pin === 'GND') return { name: pin, label: pin, kind: pin === 'GND' ? 'gnd' : pin === '3V3' ? '3v3' : '5v' };
  if (pin === 'EN' || pin === 'NRST') return { name: pin, label: pin, kind: 'en' };
  const r = parseRole(pin);
  if (r) return { name: pin, label: pin, kind: 'gpio', gpio: roleCaps(r.role) };
  return null;
}

/** Physical terminals of a board (each pin once, in header order). */
export function mcuTerminals(type: CompType | PartType): string[] {
  if (type === 'mcu') return ['3V3', '5V', 'GND', 'EN'];
  const b = boardOf(type);
  return [...new Set([...b.upper, ...b.lower])];
}

/** Normalise a pin name written by a person or an AI: "D23"/"IO23"/"23" -> "GPIO23", "A0" -> "PA0",
 *  "VIN" -> "5V", "3.3V" -> "3V3", "G" -> "GND", roles upper-cased. Null if unknown. */
export function normalizeMcuPin(type: CompType, raw: string): string | null {
  const p = raw.trim();
  const u = p.toUpperCase().replace(/\s+/g, '');
  const role = parseRole(u);
  if (role) return `${role.role}${role.n}`;
  const power: Record<string, string> = { '3V3': '3V3', '3.3V': '3V3', '3.3': '3V3', '3V': '3V3', VCC: '3V3', VDD: '3V3', '5V': '5V', VIN: '5V', VBUS: '5V', '5': '5V', GND: 'GND', G: 'GND', VSS: 'GND', EN: 'EN', RST: 'EN', RESET: 'EN', NRST: 'NRST', R: 'NRST', VBAT: 'VBAT', VB: 'VBAT' };
  if (power[u]) {
    let v = power[u];
    if (type === 'stm32_bluepill' && v === 'EN') v = 'NRST';
    if (type !== 'stm32_bluepill' && v === 'NRST') v = 'EN';
    return mcuTerminals(type).includes(v) || type === 'mcu' ? v : null;
  }
  if (type === 'esp32_devkit') {
    const m = /^(?:GPIO|IO|D|P)?(\d{1,2})$/.exec(u);
    const label: Record<string, number> = { TX: 1, TX0: 1, TXD0: 1, RX: 3, RX0: 3, RXD0: 3, VP: 36, SVP: 36, SENSOR_VP: 36, VN: 39, SVN: 39, SENSOR_VN: 39, CLK: 6, SD0: 7, SD1: 8, SD2: 9, SD3: 10, CMD: 11 };
    const n = m ? Number(m[1]) : label[u];
    if (n !== undefined && MCU_BOARDS.esp32_devkit.pins[`GPIO${n}`]) return `GPIO${n}`;
    return null;
  }
  if (type === 'stm32_bluepill') {
    const m = /^P?([ABC])(\d{1,2})$/.exec(u);
    if (m && MCU_BOARDS.stm32_bluepill.pins[`P${m[1]}${m[2]}`]) return `P${m[1]}${m[2]}`;
    return null;
  }
  return null;
}

/** Effective configuration of one pin (defaults filled in). */
export function pinConfig(props: PartProps, pin: string): Required<PinConfig> {
  const c = props.pins?.[pin];
  return {
    mode: c?.mode ?? defaultMode(pin),
    duty: Math.min(100, Math.max(0, c?.duty ?? DEFAULT_PWM.duty)),
    frequency: Math.max(1e-3, c?.frequency ?? DEFAULT_PWM.frequency),
    openDrain: !!c?.openDrain,
  };
}

/** Modes a pin supports (for the inspector's mode picker). */
export function modesFor(caps: GpioCaps | undefined): PinMode[] {
  if (!caps) return [];
  const m: PinMode[] = [];
  if (caps.output) m.push('out_high', 'out_low');
  m.push('input');
  if (caps.pull) m.push('input_pullup', 'input_pulldown');
  if (caps.output && caps.pwm) m.push('pwm');
  if (caps.adc) m.push('adc');
  return m;
}

export const isOutputMode = (m: PinMode) => m === 'out_high' || m === 'out_low' || m === 'pwm';
export const isDigitalInputMode = (m: PinMode) => m === 'input' || m === 'input_pullup' || m === 'input_pulldown';

export function modeName(m: PinMode): [string, string] {
  switch (m) {
    case 'out_high':
      return ['输出高电平', 'output HIGH'];
    case 'out_low':
      return ['输出低电平', 'output LOW'];
    case 'input':
      return ['输入（浮空）', 'input (floating)'];
    case 'input_pullup':
      return ['输入 + 内部上拉', 'input + pull-up'];
    case 'input_pulldown':
      return ['输入 + 内部下拉', 'input + pull-down'];
    case 'pwm':
      return ['PWM 输出', 'PWM output'];
    case 'adc':
      return ['模拟输入 ADC', 'analog input (ADC)'];
  }
}

/** 12-bit ADC reading of a voltage (0–3.3 V full scale, clamped). */
export function adcRaw(v: number): number {
  const full = (1 << ADC_BITS) - 1;
  return Math.max(0, Math.min(full, Math.round((v / ADC_FULL) * full)));
}
