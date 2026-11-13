// Challenge file format "breadboard-challenge/1": parsing + validation.
// See docs/CHALLENGE_FORMAT.md for the human-readable spec.

import { HOLE_MAP } from './breadboard';
import { getLang, isLang, LANGS, tr, type Lang } from './i18n';
import { parseValue } from './format';
import { MOSFETS } from './devices';
import { isMcu, mcuPin, modesFor, normalizeMcuPin } from './mcu';
import { BATTERIES, LED_COLORS, PARTS, terminalsOf } from './parts';
import { MEASURES, type Measure } from './transient';
import { PIN_MODES } from './types';
import type { BatteryVariant, CComponent, CompType, Circuit, Layout, LedColor, MosfetModel, PartProps, PartType, PinConfig, PinMode, PlacedPart, Waveform } from './types';

export const FORMAT_ID = 'breadboard-challenge/1';

/** Oscilloscope measurement of V(pin) − V(ref) (ref omitted = GND) over the steady-state window.
 *  phase / gain compare with V(vs) − V(ref): phase in degrees (−180, 180], > 0 = pin leads vs;
 *  gain = ratio of the fundamental amplitudes. `vsref` = reference for the vs signal
 *  (omitted = same as ref), so a floating V_L can be compared with V_R. */
export interface ScopeTest {
  pin: string;
  ref?: string;
  measure: Measure;
  vs?: string;
  vsref?: string;
  min?: number;
  max?: number;
}

/** Current through a component (A): an ammeter's reading (in at +), or the current from a
 *  part's first terminal to its second. mode "dc" = average (default), "rms" = true RMS. */
export interface CurrentTest {
  el: string;
  mode: 'dc' | 'rms';
  min?: number;
  max?: number;
}

/** Dev-board pin check: the logic level a digital input reads, or a measured quantity
 *  (voltage vs the board's GND, current out of the pin, ADC raw count / volts). */
export interface GpioTest {
  pin: string;
  read?: 'high' | 'low' | 'floating';
  measure?: 'voltage' | 'current' | 'adc' | 'adc_v';
  min?: number;
  max?: number;
}

export const GPIO_MEASURES = ['voltage', 'current', 'adc', 'adc_v'] as const;
/** Operating regions a test may require: NPN cutoff/active/saturation, MOSFET off/ohmic/saturation. */
export const BJT_REGIONS = ['cutoff', 'active', 'saturation'] as const;
export const MOS_REGIONS = ['off', 'ohmic', 'saturation'] as const;

export interface ChallengeTest {
  name: string;
  set: Record<string, PartProps>;
  /** LEDs on/off; also relay (energised), motor (running), buzzer (sounding) */
  expect: Record<string, 'on' | 'off'>;
  gpio: GpioTest[];
  regions: Record<string, string>;
  voltages: { pin: string; ref?: string; min?: number; max?: number }[];
  scope: ScopeTest[];
  currents: CurrentTest[];
}

export interface ChallengeStep {
  text: string;
  highlight: string[];
}

/** Scope measurements a measurement question may ask for: the test measures plus "ring", the
 *  frequency of a damped oscillation after each edge (an RLC step response). */
/** names a measurement question id can't take (they are functions / constants in a formula) */
const RESERVED_IDS = new Set(['pi', 'e', 'sqrt', 'ln', 'log', 'exp']);

export const QUESTION_MEASURES = [...MEASURES, 'ring'] as const;
export type QuestionMeasure = Measure | 'ring';

/** What a measurement question reads off the student's board (target refs / pins). */
export type MeasureQuantity =
  | { kind: 'current'; el: string; mode: 'dc' | 'rms' }
  | { kind: 'voltage'; pin: string; ref?: string }
  | {
      kind: 'scope';
      measure: QuestionMeasure;
      pin: string;
      ref?: string;
      vs?: string;
      vsref?: string;
      /** sweep generator `el`'s frequency over [from, to] (log scale) for the frequency at which
       *  the measure equals `value`; the answer is that frequency (Hz) */
      solve?: { el: string; from: number; to: number; value: number };
    }
  /** arithmetic on the student's own accepted answers to earlier questions, e.g. "uoc / isc" */
  | { kind: 'formula'; expr: string; uses: string[] };

/** "Measurement question": after the circuit check passes the student types what THEIR board
 *  reads. The expected value is computed from the student's board (readings.ts), never stored. */
export interface MeasurementQuestion {
  id: string;
  ask: string;
  /** shown once the question is answered correctly (the "compare" text) */
  explain: string;
  /** unit shown next to the box; a prefixed unit ("mA") means a bare number is read in it */
  unit: string;
  /** relative tolerance */
  tol: number;
  /** absolute tolerance (SI units) for readings near zero */
  tolAbs: number;
  /** degrees, for phase readings */
  tolDeg: number;
  /** ask for a prediction before the measurement box unlocks */
  predict: boolean;
  /** needed to complete the challenge (default true) */
  required: boolean;
  /** the lab text states a number equal to this reading on purpose (a model parameter or a spec limit the
   *  reading verifies): the validator's answer-leak check skips this question */
  stated?: boolean;
  /** the state the reading is taken in (button pressed, knob position, generator settings) */
  set: Record<string, PartProps>;
  /** null for a multiple-choice question */
  what: MeasureQuantity | null;
  /** author's sanity range (SI units): the validator checks the reference solution reads inside it */
  range?: [number, number];
  choices?: string[];
  correct?: number;
}

export interface Challenge {
  id: string;
  title: string;
  level: number;
  kind: 'lesson' | 'challenge';
  /** course phase (docs/ROADMAP.md) this experiment belongs to; undefined = the original intro set */
  phase?: ChallengePhase;
  summary: string;
  description: string;
  concepts: string[];
  target: Circuit;
  tests: ChallengeTest[];
  /** measurement questions (optional): the student reads their own instruments */
  measurements: MeasurementQuestion[];
  /** expected readings / discussion, shown once every required measurement question is answered */
  compare: string;
  hints: string[];
  steps: ChallengeStep[];
  solution?: Layout;
  start?: Layout;
  tolerance: number;
  allowExtraComponents: boolean;
  /** language the text fields ended up in (the file's base language when no translation fits) */
  textLang: Lang;
  /** where it came from: "builtin", "folder", "imported" */
  source: string;
  file?: string;
}

/** Course phases (docs/ROADMAP.md): 1 basic laws, 2 methods/theorems/op-amps, 3 transients, 4 AC,
 *  5 MCU peripheral circuits. */
export const PHASES = [1, 2, 3, 4, 5] as const;
export type ChallengePhase = (typeof PHASES)[number];

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  challenge?: Challenge;
}

const COMP_TYPES: CompType[] = [
  'resistor',
  'led',
  'diode',
  'capacitor',
  'pushbutton',
  'switch',
  'potentiometer',
  'battery',
  'bench_supply',
  'power_module',
  'dc_source',
  'inductor',
  'ammeter',
  'opamp',
  'function_gen',
  'esp32_devkit',
  'stm32_bluepill',
  'mcu',
  'npn',
  'nmos',
  'relay',
  'motor',
  'buzzer',
  'ldo',
  'ldr',
  'ntc',
];

/** Component types an `expect` "on" / "off" may refer to. */
export const EXPECT_TYPES: CompType[] = ['led', 'relay', 'motor', 'buzzer'];

/** Components whose current a test may check ("currents"). */
export const CURRENT_TYPES: CompType[] = [
  'ammeter',
  'resistor',
  'led',
  'diode',
  'inductor',
  'battery',
  'bench_supply',
  'power_module',
  'dc_source',
  'function_gen',
  'npn',
  'nmos',
  'relay',
  'motor',
  'buzzer',
  'ldo',
  'ldr',
  'ntc',
];

const WIRE_NAMES: Record<string, string> = {
  red: '#d62828',
  black: '#222222',
  blue: '#1d3557',
  green: '#2a9d8f',
  yellow: '#e9c46a',
  white: '#f1f1f1',
  orange: '#f4a261',
};

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Pin aliases AI-written files commonly use. */
const PIN_ALIASES: Record<string, Record<string, string>> = {
  led: { a: 'anode', '+': 'anode', anode: 'anode', k: 'cathode', c: 'cathode', '-': 'cathode', cathode: 'cathode' },
  diode: { a: 'anode', '+': 'anode', anode: 'anode', k: 'cathode', c: 'cathode', '-': 'cathode', cathode: 'cathode' },
  battery: { '+': '+', pos: '+', positive: '+', vcc: '+', '-': '-', neg: '-', negative: '-', gnd: '-' },
  bench_supply: { '+': '+', pos: '+', positive: '+', '-': '-', neg: '-', negative: '-', gnd: '-', com: '-' },
  power_module: { '+': '+', pos: '+', vcc: '+', '-': '-', neg: '-', gnd: '-' },
  dc_source: { '+': '+', pos: '+', positive: '+', vcc: '+', '-': '-', neg: '-', negative: '-', gnd: '-' },
  potentiometer: { '1': '1', '2': '2', w: '2', wiper: '2', '3': '3' },
  switch: { a: 'a', com: 'com', c: 'com', common: 'com', b: 'b' },
  pushbutton: { '1': '1', '2': '2', a: '1', b: '2' },
  resistor: { '1': '1', '2': '2' },
  capacitor: { '1': '1', '2': '2' },
  inductor: { '1': '1', '2': '2' },
  ammeter: { '+': '+', red: '+', pos: '+', in: '+', a: '+', '-': '-', com: '-', black: '-', neg: '-', out: '-' },
  function_gen: { '+': '+', out: '+', sig: '+', signal: '+', pos: '+', red: '+', '-': '-', com: '-', gnd: '-', neg: '-', black: '-' },
  npn: { e: 'e', emitter: 'e', b: 'b', base: 'b', c: 'c', collector: 'c' },
  nmos: { g: 'g', gate: 'g', d: 'd', drain: 'd', s: 's', source: 's' },
  relay: { coil1: 'coil1', 'coil+': 'coil1', a1: 'coil1', coil2: 'coil2', 'coil-': 'coil2', a2: 'coil2', com: 'com', common: 'com', c: 'com', no: 'no', nc: 'nc' },
  motor: { '+': '+', pos: '+', red: '+', '1': '+', '-': '-', neg: '-', black: '-', '2': '-' },
  buzzer: { '+': '+', pos: '+', positive: '+', long: '+', '-': '-', neg: '-', negative: '-', short: '-', gnd: '-' },
  ldo: { gnd: 'gnd', '1': 'gnd', adj: 'gnd', out: 'out', vout: 'out', '2': 'out', in: 'in', vin: 'in', '3': 'in' },
  ldr: { '1': '1', '2': '2' },
  ntc: { '1': '1', '2': '2' },
  opamp: {
    // physical pin numbers
    '1': 'outA',
    '2': 'inA-',
    '3': 'inA+',
    '4': 'v-',
    '5': 'inB+',
    '6': 'inB-',
    '7': 'outB',
    '8': 'v+',
    // logical names (case-insensitive)
    outa: 'outA',
    'ina-': 'inA-',
    'ina+': 'inA+',
    outb: 'outB',
    'inb-': 'inB-',
    'inb+': 'inB+',
    out1: 'outA',
    'in1-': 'inA-',
    'in1+': 'inA+',
    out2: 'outB',
    'in2-': 'inB-',
    'in2+': 'inB+',
    '-ina': 'inA-',
    '+ina': 'inA+',
    '-inb': 'inB-',
    '+inb': 'inB+',
    // single op-amp usage: half A
    out: 'outA',
    'in-': 'inA-',
    'in+': 'inA+',
    inv: 'inA-',
    noninv: 'inA+',
    'v+': 'v+',
    vcc: 'v+',
    vdd: 'v+',
    'vs+': 'v+',
    'v-': 'v-',
    vee: 'v-',
    vss: 'v-',
    gnd: 'v-',
    'vs-': 'v-',
  },
};

export function normalizePin(type: CompType, pin: string): string | null {
  const p = pin.trim();
  if (isMcu(type)) return normalizeMcuPin(type, p);
  const alias = PIN_ALIASES[type]?.[p.toLowerCase()];
  if (alias) return alias;
  return terminalsOf(type).includes(p) ? p : null;
}

function parseProps(type: CompType, raw: Record<string, unknown>, where: string, errors: string[], allowPinsKey = true): PartProps {
  const props: PartProps = {};
  const num = (key: string, out: keyof PartProps) => {
    if (raw[key] === undefined || raw[key] === 'any') return;
    const v = parseValue(raw[key] as string | number);
    if (v === null)
      errors.push(
        tr(
          `${where}: "${key}" 的值 ${JSON.stringify(raw[key])} 无法解析（示例："330"、"4.7k"、9）`,
          `${where}: can't parse ${JSON.stringify(raw[key])} as "${key}" (examples: "330", "4.7k", 9)`,
        ),
      );
    else (props[out] as number) = v;
  };
  num('resistance', 'resistance');
  num('voltage', 'voltage');
  num('capacitance', 'capacitance');
  num('currentLimit', 'currentLimit');
  num('wiper', 'wiper');
  num('inductance', 'inductance');
  num('frequency', 'frequency');
  num('amplitude', 'amplitude');
  num('offset', 'offset');
  if (raw.waveform !== undefined && raw.waveform !== 'any') {
    if (raw.waveform === 'sine' || raw.waveform === 'square' || raw.waveform === 'triangle') props.waveform = raw.waveform as Waveform;
    else errors.push(tr(`${where}: "waveform" 必须是 "sine" / "square" / "triangle"`, `${where}: "waveform" must be "sine" / "square" / "triangle"`));
  }
  if (raw.channel !== undefined) {
    if (raw.channel === 1 || raw.channel === 2) props.channel = raw.channel;
    else errors.push(tr(`${where}: "channel" 必须是 1 或 2`, `${where}: "channel" must be 1 or 2`));
  }
  if (raw.value !== undefined && raw.value !== 'any') {
    // generic "value" field: resistance for R/pot, capacitance for C, inductance for L, voltage for sources
    const key = type === 'capacitor' ? 'capacitance' : type === 'inductor' ? 'inductance' : type === 'resistor' || type === 'potentiometer' ? 'resistance' : 'voltage';
    const v = parseValue(raw.value as string | number);
    if (v === null) errors.push(tr(`${where}: "value" ${JSON.stringify(raw.value)} 无法解析`, `${where}: can't parse "value" ${JSON.stringify(raw.value)}`));
    else (props as Record<string, number>)[key] = v;
  }
  if (raw.color !== undefined && raw.color !== 'any') {
    if (typeof raw.color === 'string' && raw.color in LED_COLORS) props.color = raw.color as LedColor;
    else errors.push(tr(`${where}: LED 颜色必须是 ${Object.keys(LED_COLORS).join(' / ')}`, `${where}: LED color must be ${Object.keys(LED_COLORS).join(' / ')}`));
  }
  if (raw.variant !== undefined) {
    if (typeof raw.variant === 'string' && raw.variant in BATTERIES) props.variant = raw.variant as BatteryVariant;
    else errors.push(tr(`${where}: 电池型号必须是 ${Object.keys(BATTERIES).join(' / ')}`, `${where}: battery variant must be ${Object.keys(BATTERIES).join(' / ')}`));
  }
  num('lux', 'lux');
  num('temperature', 'temperature');
  num('beta', 'beta');
  if (raw.model !== undefined && raw.model !== 'any') {
    if (typeof raw.model === 'string' && raw.model in MOSFETS) props.model = raw.model as MosfetModel;
    else errors.push(tr(`${where}: "model" 必须是 ${Object.keys(MOSFETS).join(' / ')}`, `${where}: "model" must be ${Object.keys(MOSFETS).join(' / ')}`));
  }
  if (raw.usb !== undefined) props.usb = !!raw.usb;
  // dev-board pin modes: "modes" everywhere; "pins" too where it can't mean hole positions
  const modes = raw.modes ?? (allowPinsKey ? raw.pins : undefined);
  if (modes !== undefined && isMcu(type)) props.pins = parsePinConfigs(type, modes, where, errors);
  if (raw.pressed !== undefined) props.pressed = !!raw.pressed;
  if (raw.position !== undefined) {
    if (raw.position === 'a' || raw.position === 'b') props.position = raw.position;
    else errors.push(tr(`${where}: "position" 必须是 "a" 或 "b"`, `${where}: "position" must be "a" or "b"`));
  }
  return props;
}

/** `"pins": { "GPIO2": "out_high", "GPIO_OUT1": { "mode": "pwm", "duty": 25, "frequency": 1000 } }` */
function parsePinConfigs(type: CompType, raw: unknown, where: string, errors: string[]): Record<string, PinConfig> {
  const out: Record<string, PinConfig> = {};
  if (!isObj(raw)) {
    errors.push(tr(`${where}: "pins" 必须是对象，如 { "GPIO2": "out_high" }`, `${where}: "pins" must be an object, e.g. { "GPIO2": "out_high" }`));
    return out;
  }
  for (const [k, v] of Object.entries(raw)) {
    const pin = normalizeMcuPin(type, k);
    const def = pin ? mcuPin(type, pin) : null;
    if (!pin || !def || def.kind !== 'gpio') {
      errors.push(
        tr(
          `${where}.pins: "${k}" 不是这块板子的 GPIO（也可以写逻辑引脚 GPIO_OUT1 / GPIO_IN1 / ADC1 / PWM1 / GPIO_FT1 / IO1）`,
          `${where}.pins: "${k}" is not a GPIO of this board (logical pins GPIO_OUT1 / GPIO_IN1 / ADC1 / PWM1 / GPIO_FT1 / IO1 are fine too)`,
        ),
      );
      continue;
    }
    const cfg: Partial<PinConfig> = typeof v === 'string' ? { mode: v as PinMode } : isObj(v) ? { mode: v.mode as PinMode } : {};
    if (isObj(v) && v.openDrain !== undefined) {
      if (cfg.mode !== 'out_high' && cfg.mode !== 'out_low' && cfg.mode !== 'pwm')
        errors.push(
          tr(
            `${where}.pins.${k}: "openDrain" 只用于输出模式（out_high / out_low / pwm）`,
            `${where}.pins.${k}: "openDrain" only applies to output modes (out_high / out_low / pwm)`,
          ),
        );
      else cfg.openDrain = !!v.openDrain;
    }
    if (!cfg.mode || !PIN_MODES.includes(cfg.mode)) {
      errors.push(tr(`${where}.pins.${k}: 模式必须是 ${PIN_MODES.join(' / ')}`, `${where}.pins.${k}: mode must be ${PIN_MODES.join(' / ')}`));
      continue;
    }
    if (!modesFor(def.gpio).includes(cfg.mode)) {
      errors.push(
        tr(
          `${where}.pins.${k}: 这个引脚不支持 "${cfg.mode}"（可用：${modesFor(def.gpio).join(', ')}）`,
          `${where}.pins.${k}: this pin can't do "${cfg.mode}" (available: ${modesFor(def.gpio).join(', ')})`,
        ),
      );
      continue;
    }
    if (isObj(v)) {
      for (const key of ['duty', 'frequency'] as const) {
        if (v[key] === undefined) continue;
        const n = parseValue(v[key] as string | number);
        if (n === null || (key === 'duty' && (n < 0 || n > 100)) || (key === 'frequency' && n <= 0))
          errors.push(
            tr(
              `${where}.pins.${k}.${key}: ${key === 'duty' ? '占空比是 0–100（%）' : '频率必须 > 0（Hz）'}`,
              `${where}.pins.${k}.${key}: ${key === 'duty' ? 'duty is 0–100 (%)' : 'frequency must be > 0 (Hz)'}`,
            ),
          );
        else cfg[key] = n;
      }
    }
    out[pin] = cfg as PinConfig;
  }
  return out;
}

function parseLayout(raw: unknown, refs: Set<string> | null, where: string, errors: string[]): Layout | undefined {
  if (raw === undefined) return undefined;
  if (!isObj(raw) || !Array.isArray(raw.parts)) {
    errors.push(tr(`${where}: 必须是 { "parts": [...] }`, `${where}: must be { "parts": [...] }`));
    return undefined;
  }
  const parts: PlacedPart[] = [];
  const used = new Map<string, string>();
  const autoChannel = new Set<number>();
  raw.parts.forEach((p: unknown, i: number) => {
    const w = `${where}.parts[${i}]`;
    if (!isObj(p)) return errors.push(tr(`${w}: 必须是对象`, `${w}: must be an object`));
    const type = p.type as PartType;
    if (!(type in PARTS)) return errors.push(tr(`${w}: 未知类型 "${String(p.type)}"`, `${w}: unknown type "${String(p.type)}"`));
    const def = PARTS[type];
    const ref = typeof p.ref === 'string' && p.ref ? p.ref : `${def.refPrefix}${i + 1}`;
    if (type !== 'wire' && refs && !refs.has(ref)) {
      // allowed (solutions may name parts freely) — matching is topological
    }
    const pins: Record<string, string> = {};
    let pinsRaw = isObj(p.pins) ? (p.pins as Record<string, unknown>) : {};
    if (def.placement.kind === 'footprint' && typeof p.at === 'string') {
      const fp = def.placement.footprint(p.at);
      if (!fp) errors.push(tr(`${w}: "at": "${p.at}" 放不下这个元件`, `${w}: the part doesn't fit at "at": "${p.at}"`));
      else pinsRaw = fp;
    }
    for (const [pin, hole] of Object.entries(pinsRaw)) {
      if (!(pin in def.terminalOf)) {
        errors.push(
          tr(
            `${w}: ${type} 没有名为 "${pin}" 的引脚（可用：${Object.keys(def.terminalOf).join(', ')}）`,
            `${w}: ${type} has no pin called "${pin}" (available: ${Object.keys(def.terminalOf).join(', ')})`,
          ),
        );
        continue;
      }
      if (typeof hole !== 'string' || !HOLE_MAP.has(hole)) {
        errors.push(
          tr(
            `${w}: 孔位 ${JSON.stringify(hole)} 不存在（主区 a1–j30，电源轨 tp/tn/bp/bn + 1–30）`,
            `${w}: hole ${JSON.stringify(hole)} doesn't exist (main area a1–j30, rails tp/tn/bp/bn + 1–30)`,
          ),
        );
        continue;
      }
      if (used.has(hole))
        errors.push(tr(`${w}: 孔 ${hole} 已经被 ${used.get(hole)} 占用（一个孔只能插一只脚）`, `${w}: hole ${hole} is already used by ${used.get(hole)} (one leg per hole)`));
      used.set(hole, ref);
      pins[pin] = hole;
    }
    const props =
      type === 'wire'
        ? { ...def.defaults, ...(typeof p.color === 'string' ? { wireColor: WIRE_NAMES[p.color] ?? p.color } : {}) }
        : { ...def.defaults, ...parseProps(type, isObj(p.props) ? p.props : p, w, errors, isObj(p.props)) };
    if (type === 'scope_probe' && (isObj(p.props) ? p.props : p).channel === undefined) autoChannel.add(parts.length);
    parts.push({ id: `${ref}-${i}`, ref, type, props, pins });
  });
  // scope probes without an explicit "channel" (the part default is CH1): first free channel
  // gets CH1, the next CH2 (as when placing probes by hand), so two probes don't both land on CH1
  const chans = new Set(parts.filter((_, i) => !autoChannel.has(i) && parts[i].type === 'scope_probe').map((p) => p.props.channel));
  for (const i of autoChannel) {
    const ch = !chans.has(1) ? 1 : !chans.has(2) ? 2 : undefined;
    if (ch) {
      parts[i].props.channel = ch;
      chans.add(ch);
    }
  }
  return { version: 1, parts };
}

export function parseChallenge(json: unknown, source = 'builtin', file?: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isObj(json)) return { ok: false, errors: [tr('文件内容必须是一个 JSON 对象 { ... }', 'The file must contain one JSON object { ... }')], warnings };

  if (json.format !== FORMAT_ID)
    errors.push(tr(`"format" 必须是 "${FORMAT_ID}"（现在是 ${JSON.stringify(json.format)}）`, `"format" must be "${FORMAT_ID}" (it is ${JSON.stringify(json.format)})`));
  const id = typeof json.id === 'string' ? json.id : '';
  if (!/^[a-z0-9][a-z0-9-_]*$/i.test(id)) errors.push(tr('"id" 必须是由字母、数字、- 或 _ 组成的字符串', '"id" must be a string of letters, digits, - or _'));
  const title = typeof json.title === 'string' ? json.title : '';
  if (!title) errors.push(tr('"title" 不能为空', '"title" must not be empty'));

  // components
  const components: CComponent[] = [];
  const refs = new Set<string>();
  if (!Array.isArray(json.components) || json.components.length === 0) errors.push(tr('"components" 必须是非空数组', '"components" must be a non-empty array'));
  else
    json.components.forEach((c: unknown, i: number) => {
      const w = `components[${i}]`;
      if (!isObj(c)) return errors.push(tr(`${w}: 必须是对象`, `${w}: must be an object`));
      const ref = c.ref;
      if (typeof ref !== 'string' || !/^[A-Za-z][A-Za-z0-9_]*$/.test(ref))
        return errors.push(tr(`${w}: "ref" 必须是字母开头的标识符，如 "R1"、"LED1"`, `${w}: "ref" must be an identifier starting with a letter, e.g. "R1", "LED1"`));
      if (refs.has(ref)) return errors.push(tr(`${w}: ref "${ref}" 重复`, `${w}: duplicate ref "${ref}"`));
      const type = c.type as CompType;
      if (type === 'scope_probe')
        return errors.push(
          tr(
            `${w}: scope_probe（示波器探头）是测量工具，不要写进目标电路；用 tests 里的 "scope" 测量波形`,
            `${w}: scope_probe is a measuring tool, not part of the target circuit; measure waveforms with "scope" in tests instead`,
          ),
        );
      if (!COMP_TYPES.includes(type))
        return errors.push(
          tr(`${w}: 未知类型 "${String(c.type)}"（可用：${COMP_TYPES.join(', ')}）`, `${w}: unknown type "${String(c.type)}" (available: ${COMP_TYPES.join(', ')})`),
        );
      refs.add(ref);
      components.push({ ref, type, props: parseProps(type, c, `${w} (${ref})`, errors) });
    });
  const compOf = new Map(components.map((c) => [c.ref, c]));

  const resolvePin = (s: unknown, where: string): string | null => {
    if (typeof s !== 'string' || !s.includes('.')) {
      errors.push(
        tr(
          `${where}: 引脚 ${JSON.stringify(s)} 格式应为 "REF.pin"，例如 "R1.1"、"LED1.anode"`,
          `${where}: pin ${JSON.stringify(s)} should look like "REF.pin", e.g. "R1.1", "LED1.anode"`,
        ),
      );
      return null;
    }
    const i = s.lastIndexOf('.');
    const ref = s.slice(0, i);
    const c = compOf.get(ref);
    if (!c) {
      errors.push(tr(`${where}: 找不到元件 "${ref}"`, `${where}: no component "${ref}"`));
      return null;
    }
    const pin = normalizePin(c.type, s.slice(i + 1));
    if (!pin) {
      errors.push(
        tr(
          `${where}: ${ref}（${c.type}）没有引脚 "${s.slice(i + 1)}"，可用：${terminalsOf(c.type).join(', ')}`,
          `${where}: ${ref} (${c.type}) has no pin "${s.slice(i + 1)}"; available: ${terminalsOf(c.type).join(', ')}`,
        ),
      );
      return null;
    }
    return `${ref}.${pin}`;
  };

  // connections / nets -> merged nets
  const groups: { name?: string; pins: string[] }[] = [];
  if (Array.isArray(json.connections)) {
    json.connections.forEach((g: unknown, i: number) => {
      if (!Array.isArray(g))
        return errors.push(tr(`connections[${i}]: 必须是引脚数组，如 ["R1.2", "LED1.anode"]`, `connections[${i}]: must be an array of pins, e.g. ["R1.2", "LED1.anode"]`));
      if (g.length < 2) warnings.push(tr(`connections[${i}]: 只有一个引脚，没有意义`, `connections[${i}]: a single pin connects nothing`));
      const pins = g.map((p, j) => resolvePin(p, `connections[${i}][${j}]`)).filter((p): p is string => !!p);
      groups.push({ pins });
    });
  }
  if (Array.isArray(json.nets)) {
    json.nets.forEach((n: unknown, i: number) => {
      if (!isObj(n) || !Array.isArray(n.pins))
        return errors.push(tr(`nets[${i}]: 必须是 { "name": "...", "pins": [...] }`, `nets[${i}]: must be { "name": "...", "pins": [...] }`));
      const pins = n.pins.map((p, j) => resolvePin(p, `nets[${i}].pins[${j}]`)).filter((p): p is string => !!p);
      groups.push({ name: typeof n.name === 'string' ? n.name : undefined, pins });
    });
  }
  if (!Array.isArray(json.connections) && !Array.isArray(json.nets))
    errors.push(tr('需要 "connections" 或 "nets" 来描述连接关系', '"connections" or "nets" is needed to describe the wiring'));

  // union groups that share a pin
  const parent = new Map<number, number>();
  const find = (i: number): number => ((parent.get(i) ?? i) === i ? i : find(parent.get(i)!));
  const pinGroup = new Map<string, number>();
  groups.forEach((g, gi) => {
    parent.set(gi, gi);
    for (const p of g.pins) {
      const prev = pinGroup.get(p);
      if (prev !== undefined) parent.set(find(gi), find(prev));
      pinGroup.set(p, gi);
    }
  });
  const merged = new Map<number, { names: string[]; pins: Set<string> }>();
  groups.forEach((g, gi) => {
    const r = find(gi);
    if (!merged.has(r)) merged.set(r, { names: [], pins: new Set() });
    const m = merged.get(r)!;
    if (g.name) m.names.push(g.name);
    g.pins.forEach((p) => m.pins.add(p));
  });
  let auto = 1;
  const usedNames = new Set<string>();
  const nets = [...merged.values()]
    .filter((m) => m.pins.size > 0)
    .map((m) => {
      let name = m.names[0] ?? `N${auto++}`;
      while (usedNames.has(name)) name = `${name}_`;
      usedNames.add(name);
      return { name, pins: [...m.pins] };
    });
  for (const c of components) {
    const unused = terminalsOf(c.type).filter((t) => !pinGroup.has(`${c.ref}.${t}`));
    if (unused.length === terminalsOf(c.type).length) warnings.push(tr(`${c.ref} 没有任何连接`, `${c.ref} isn't connected to anything`));
  }

  // tests
  const tests: ChallengeTest[] = [];
  if (json.tests !== undefined && !Array.isArray(json.tests)) errors.push(tr('"tests" 必须是数组', '"tests" must be an array'));
  (Array.isArray(json.tests) ? json.tests : []).forEach((t: unknown, i: number) => {
    const w = `tests[${i}]`;
    if (!isObj(t)) return errors.push(tr(`${w}: 必须是对象`, `${w}: must be an object`));
    const set: Record<string, PartProps> = {};
    if (isObj(t.set))
      for (const [ref, v] of Object.entries(t.set)) {
        const c = compOf.get(ref);
        if (!c) errors.push(tr(`${w}.set: 找不到元件 "${ref}"`, `${w}.set: no component "${ref}"`));
        else if (!isObj(v)) errors.push(tr(`${w}.set.${ref}: 必须是对象，如 {"pressed": true}`, `${w}.set.${ref}: must be an object, e.g. {"pressed": true}`));
        else set[ref] = parseProps(c.type, v, `${w}.set.${ref}`, errors);
      }
    const expect: Record<string, 'on' | 'off'> = {};
    if (isObj(t.expect))
      for (const [ref, v] of Object.entries(t.expect)) {
        const c = compOf.get(ref);
        if (!c) errors.push(tr(`${w}.expect: 找不到元件 "${ref}"`, `${w}.expect: no component "${ref}"`));
        else if (!EXPECT_TYPES.includes(c.type))
          errors.push(tr(`${w}.expect.${ref}: 只有 LED、继电器、电机、蜂鸣器可以写 "on"/"off"`, `${w}.expect.${ref}: only LEDs, relays, motors and buzzers can be "on"/"off"`));
        else if (v !== 'on' && v !== 'off') errors.push(tr(`${w}.expect.${ref}: 必须是 "on" 或 "off"`, `${w}.expect.${ref}: must be "on" or "off"`));
        else expect[ref] = v;
      }
    const voltages: ChallengeTest['voltages'] = [];
    if (Array.isArray(t.voltages))
      t.voltages.forEach((v: unknown, j: number) => {
        if (!isObj(v)) return errors.push(tr(`${w}.voltages[${j}]: 必须是对象`, `${w}.voltages[${j}]: must be an object`));
        const pin = resolvePin(v.pin, `${w}.voltages[${j}].pin`);
        const ref = v.ref === undefined ? undefined : resolvePin(v.ref, `${w}.voltages[${j}].ref`);
        if (pin && ref !== null) voltages.push({ pin, ref, min: typeof v.min === 'number' ? v.min : undefined, max: typeof v.max === 'number' ? v.max : undefined });
      });
    const scope: ScopeTest[] = [];
    if (t.scope !== undefined && !Array.isArray(t.scope)) errors.push(tr(`${w}.scope: 必须是数组`, `${w}.scope: must be an array`));
    if (Array.isArray(t.scope))
      t.scope.forEach((v: unknown, j: number) => {
        const wj = `${w}.scope[${j}]`;
        if (!isObj(v)) return errors.push(tr(`${wj}: 必须是对象`, `${wj}: must be an object`));
        const measure = v.measure as Measure;
        if (!MEASURES.includes(measure)) return errors.push(tr(`${wj}.measure: 必须是 ${MEASURES.join(' / ')}`, `${wj}.measure: must be ${MEASURES.join(' / ')}`));
        const pin = resolvePin(v.pin, `${wj}.pin`);
        const ref = v.ref === undefined ? undefined : resolvePin(v.ref, `${wj}.ref`);
        const vs = v.vs === undefined ? undefined : resolvePin(v.vs, `${wj}.vs`);
        const vsref = v.vsref === undefined ? undefined : resolvePin(v.vsref, `${wj}.vsref`);
        if (v.vsref !== undefined && v.vs === undefined) errors.push(tr(`${wj}: 写了 "vsref" 就必须写 "vs"`, `${wj}: "vsref" needs "vs"`));
        if ((measure === 'phase' || measure === 'gain') && v.vs === undefined)
          errors.push(tr(`${wj}: "${measure}" 需要 "vs"（和哪个引脚比较）`, `${wj}: "${measure}" needs "vs" (the pin to compare with)`));
        if (typeof v.min !== 'number' && typeof v.max !== 'number') warnings.push(tr(`${wj}: 没有 min / max，什么都不检查`, `${wj}: no min / max, so it checks nothing`));
        if (pin && ref !== null && vs !== null && vsref !== null)
          scope.push({ pin, ref, vs, vsref, measure, min: typeof v.min === 'number' ? v.min : undefined, max: typeof v.max === 'number' ? v.max : undefined });
      });
    const currents: CurrentTest[] = [];
    if (t.currents !== undefined && !Array.isArray(t.currents)) errors.push(tr(`${w}.currents: 必须是数组`, `${w}.currents: must be an array`));
    if (Array.isArray(t.currents))
      t.currents.forEach((v: unknown, j: number) => {
        const wj = `${w}.currents[${j}]`;
        if (!isObj(v)) return errors.push(tr(`${wj}: 必须是对象`, `${wj}: must be an object`));
        const el = v.el ?? v.meter ?? v.ref;
        const c = typeof el === 'string' ? compOf.get(el) : undefined;
        if (!c) return errors.push(tr(`${wj}.el: 找不到元件 ${JSON.stringify(el)}`, `${wj}.el: no component ${JSON.stringify(el)}`));
        if (!CURRENT_TYPES.includes(c.type))
          return errors.push(
            tr(
              `${wj}.el: ${c.ref}（${c.type}）不能测电流（可用：${CURRENT_TYPES.join(', ')}）`,
              `${wj}.el: can't measure the current of ${c.ref} (${c.type}); allowed: ${CURRENT_TYPES.join(', ')}`,
            ),
          );
        const mode = v.mode === undefined ? 'dc' : v.mode;
        if (mode !== 'dc' && mode !== 'rms') return errors.push(tr(`${wj}.mode: 必须是 "dc" 或 "rms"`, `${wj}.mode: must be "dc" or "rms"`));
        if (typeof v.min !== 'number' && typeof v.max !== 'number') warnings.push(tr(`${wj}: 没有 min / max，什么都不检查`, `${wj}: no min / max, so it checks nothing`));
        currents.push({ el: c.ref, mode, min: typeof v.min === 'number' ? v.min : undefined, max: typeof v.max === 'number' ? v.max : undefined });
      });
    const gpio: GpioTest[] = [];
    if (t.gpio !== undefined && !Array.isArray(t.gpio)) errors.push(tr(`${w}.gpio: 必须是数组`, `${w}.gpio: must be an array`));
    if (Array.isArray(t.gpio))
      t.gpio.forEach((v: unknown, j: number) => {
        const wj = `${w}.gpio[${j}]`;
        if (!isObj(v)) return errors.push(tr(`${wj}: 必须是对象`, `${wj}: must be an object`));
        const pin = resolvePin(v.pin, `${wj}.pin`);
        if (!pin) return;
        const ref = pin.slice(0, pin.lastIndexOf('.'));
        const c = compOf.get(ref)!;
        const def = mcuPin(c.type, pin.slice(ref.length + 1));
        if (!isMcu(c.type) || !def || def.kind !== 'gpio') return errors.push(tr(`${wj}.pin: ${pin} 不是开发板的 GPIO`, `${wj}.pin: ${pin} is not a dev-board GPIO`));
        const read = v.read;
        const measure = v.measure;
        if (read !== undefined && read !== 'high' && read !== 'low' && read !== 'floating')
          return errors.push(tr(`${wj}.read: 必须是 "high" / "low" / "floating"`, `${wj}.read: must be "high" / "low" / "floating"`));
        if (measure !== undefined && !(GPIO_MEASURES as readonly unknown[]).includes(measure))
          return errors.push(tr(`${wj}.measure: 必须是 ${GPIO_MEASURES.join(' / ')}`, `${wj}.measure: must be ${GPIO_MEASURES.join(' / ')}`));
        if (read === undefined && measure === undefined) return errors.push(tr(`${wj}: 需要 "read" 或 "measure"`, `${wj}: needs "read" or "measure"`));
        if (measure !== undefined && typeof v.min !== 'number' && typeof v.max !== 'number')
          warnings.push(tr(`${wj}: 没有 min / max，什么都不检查`, `${wj}: no min / max, so it checks nothing`));
        gpio.push({
          pin,
          read: read as GpioTest['read'],
          measure: measure as GpioTest['measure'],
          min: typeof v.min === 'number' ? v.min : undefined,
          max: typeof v.max === 'number' ? v.max : undefined,
        });
      });
    const regions: Record<string, string> = {};
    if (t.regions !== undefined && !isObj(t.regions))
      errors.push(tr(`${w}.regions: 必须是对象，如 { "Q1": "saturation" }`, `${w}.regions: must be an object, e.g. { "Q1": "saturation" }`));
    if (isObj(t.regions))
      for (const [ref, v] of Object.entries(t.regions)) {
        const c = compOf.get(ref);
        const alias: Record<string, string> = { cutoff: 'off', triode: 'ohmic', linear: 'ohmic', sat: 'saturation' };
        if (!c) errors.push(tr(`${w}.regions: 找不到元件 "${ref}"`, `${w}.regions: no component "${ref}"`));
        else if (c.type === 'npn') {
          const r = v === 'sat' ? 'saturation' : v;
          if (!(BJT_REGIONS as readonly unknown[]).includes(r))
            errors.push(tr(`${w}.regions.${ref}: 三极管必须是 ${BJT_REGIONS.join(' / ')}`, `${w}.regions.${ref}: a transistor region is ${BJT_REGIONS.join(' / ')}`));
          else regions[ref] = r as string;
        } else if (c.type === 'nmos') {
          const r = typeof v === 'string' ? (alias[v] ?? v) : v;
          if (!(MOS_REGIONS as readonly unknown[]).includes(r))
            errors.push(tr(`${w}.regions.${ref}: MOSFET 必须是 ${MOS_REGIONS.join(' / ')}`, `${w}.regions.${ref}: a MOSFET region is ${MOS_REGIONS.join(' / ')}`));
          else regions[ref] = r as string;
        } else errors.push(tr(`${w}.regions.${ref}: 只有 npn / nmos 有工作区`, `${w}.regions.${ref}: only npn / nmos have regions`));
      }
    tests.push({ name: typeof t.name === 'string' ? t.name : tr(`测试 ${i + 1}`, `Test ${i + 1}`), set, expect, voltages, scope, currents, gpio, regions });
  });

  const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  const textOf = (v: unknown) => (typeof v === 'string' ? v : Array.isArray(v) ? strs(v).join('\n') : '');

  // measurement questions
  const measurements: MeasurementQuestion[] = [];
  if (json.measurements !== undefined && !Array.isArray(json.measurements)) errors.push(tr('"measurements" 必须是数组', '"measurements" must be an array'));
  const qIds = new Set<string>();
  (Array.isArray(json.measurements) ? json.measurements : []).forEach((m: unknown, i: number) => {
    const w = `measurements[${i}]`;
    if (!isObj(m)) return errors.push(tr(`${w}: 必须是对象`, `${w}: must be an object`));
    const id = m.id;
    if (typeof id !== 'string' || !/^[A-Za-z][A-Za-z0-9_]*$/.test(id) || RESERVED_IDS.has(id.toLowerCase()))
      return errors.push(
        tr(
          `${w}: "id" 必须是字母开头的标识符（不能是 pi、e、sqrt、ln、log、exp），如 "i1"`,
          `${w}: "id" must be an identifier starting with a letter (not pi, e, sqrt, ln, log, exp), e.g. "i1"`,
        ),
      );
    if (qIds.has(id)) return errors.push(tr(`${w}: id "${id}" 重复`, `${w}: duplicate id "${id}"`));
    const wi = `${w} (${id})`;
    const ask = textOf(m.ask);
    if (!ask) errors.push(tr(`${wi}: "ask" 不能为空（问学生读什么、在什么状态下读）`, `${wi}: "ask" must not be empty (what to read, in which state)`));
    const set: Record<string, PartProps> = {};
    if (m.set !== undefined && !isObj(m.set)) errors.push(tr(`${wi}.set: 必须是对象`, `${wi}.set: must be an object`));
    if (isObj(m.set))
      for (const [ref, v] of Object.entries(m.set)) {
        const c = compOf.get(ref);
        if (!c) errors.push(tr(`${wi}.set: 找不到元件 "${ref}"`, `${wi}.set: no component "${ref}"`));
        else if (!isObj(v)) errors.push(tr(`${wi}.set.${ref}: 必须是对象`, `${wi}.set.${ref}: must be an object`));
        else set[ref] = parseProps(c.type, v, `${wi}.set.${ref}`, errors);
      }
    const kinds = ['current', 'voltage', 'scope', 'formula', 'choices'].filter((k) => m[k] !== undefined);
    if (kinds.length !== 1)
      return errors.push(
        tr(
          `${wi}: 必须且只能有 "current"、"voltage"、"scope"、"formula"、"choices" 其中一个（现在有 ${kinds.length} 个）`,
          `${wi}: needs exactly one of "current", "voltage", "scope", "formula", "choices" (found ${kinds.length})`,
        ),
      );
    let what: MeasureQuantity | null = null;
    let unit = '';
    let tol = 0.03;
    let tolAbs = 0;
    let choices: string[] | undefined;
    let correct: number | undefined;
    const kind = kinds[0];
    if (kind === 'current') {
      const c = typeof m.current === 'string' ? compOf.get(m.current) : undefined;
      if (!c) return errors.push(tr(`${wi}.current: 找不到元件 ${JSON.stringify(m.current)}`, `${wi}.current: no component ${JSON.stringify(m.current)}`));
      if (!CURRENT_TYPES.includes(c.type))
        return errors.push(tr(`${wi}.current: ${c.ref}（${c.type}）不能测电流`, `${wi}.current: can't measure the current of ${c.ref} (${c.type})`));
      const mode = m.mode === undefined ? 'dc' : m.mode;
      if (mode !== 'dc' && mode !== 'rms') return errors.push(tr(`${wi}.mode: 必须是 "dc" 或 "rms"`, `${wi}.mode: must be "dc" or "rms"`));
      what = { kind: 'current', el: c.ref, mode };
      unit = 'mA';
      tolAbs = 1e-6;
    } else if (kind === 'voltage') {
      const pin = resolvePin(m.voltage, `${wi}.voltage`);
      const ref = m.ref === undefined ? undefined : resolvePin(m.ref, `${wi}.ref`);
      if (!pin || ref === null) return;
      what = { kind: 'voltage', pin, ref };
      unit = 'V';
      tolAbs = 0.005;
    } else if (kind === 'scope') {
      const measure = m.scope as QuestionMeasure;
      if (!(QUESTION_MEASURES as readonly string[]).includes(measure))
        return errors.push(tr(`${wi}.scope: 必须是 ${QUESTION_MEASURES.join(' / ')}`, `${wi}.scope: must be ${QUESTION_MEASURES.join(' / ')}`));
      const pin = resolvePin(m.pin, `${wi}.pin`);
      const ref = m.ref === undefined ? undefined : resolvePin(m.ref, `${wi}.ref`);
      const vs = m.vs === undefined ? undefined : resolvePin(m.vs, `${wi}.vs`);
      const vsref = m.vsref === undefined ? undefined : resolvePin(m.vsref, `${wi}.vsref`);
      if ((measure === 'phase' || measure === 'gain') && m.vs === undefined) errors.push(tr(`${wi}: "${measure}" 需要 "vs"`, `${wi}: "${measure}" needs "vs"`));
      if (!pin || ref === null || vs === null || vsref === null) return;
      let solve: { el: string; from: number; to: number; value: number } | undefined;
      if (m.solve !== undefined) {
        const sv = m.solve;
        const g = isObj(sv) && typeof sv.el === 'string' ? compOf.get(sv.el) : undefined;
        const from = isObj(sv) ? parseValue(sv.from as string | number) : null;
        const to = isObj(sv) ? parseValue(sv.to as string | number) : null;
        if (!isObj(sv) || !g || g.type !== 'function_gen' || from === null || to === null || !(from > 0) || !(to > from) || typeof sv.value !== 'number')
          return errors.push(
            tr(
              `${wi}.solve: 应为 { "el": 信号发生器, "from": 频率, "to": 更高的频率, "value": 数 }`,
              `${wi}.solve: must be { "el": a function generator, "from": frequency, "to": a higher frequency, "value": number }`,
            ),
          );
        solve = { el: g.ref, from, to, value: sv.value };
      }
      what = { kind: 'scope', measure, pin, ref, vs, vsref, solve };
      unit = solve || measure === 'freq' || measure === 'ring' ? 'Hz' : measure === 'phase' ? '°' : measure === 'gain' ? '' : measure === 'rise' || measure === 'fall' ? 'ms' : 'V';
      tol = measure === 'rise' || measure === 'fall' || measure === 'ring' ? 0.08 : 0.03;
      tolAbs = measure === 'gain' || measure === 'phase' || solve || measure === 'freq' || measure === 'ring' || measure === 'rise' || measure === 'fall' ? 0 : 0.005;
    } else if (kind === 'formula') {
      if (typeof m.formula !== 'string' || !m.formula.trim())
        return errors.push(tr(`${wi}.formula: 必须是算式字符串，如 "uoc / isc"`, `${wi}.formula: must be an expression string, e.g. "uoc / isc"`));
      const names = [...new Set(m.formula.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [])].filter((n) => !RESERVED_IDS.has(n.toLowerCase()));
      const unknown = names.filter((n) => !qIds.has(n));
      if (unknown.length)
        return errors.push(
          tr(`${wi}.formula: ${unknown.join(', ')} 不是前面某个测量题的 id`, `${wi}.formula: ${unknown.join(', ')} is not the id of an earlier measurement question`),
        );
      if (!names.length) return errors.push(tr(`${wi}.formula: 至少要用到一个前面测量题的 id`, `${wi}.formula: must use the id of at least one earlier question`));
      const choiceQ = names.find((n) => measurements.find((q) => q.id === n)?.what === null);
      if (choiceQ)
        return errors.push(tr(`${wi}.formula: ${choiceQ} 是选择题，不能参与计算`, `${wi}.formula: ${choiceQ} is a multiple-choice question and can't be used in a calculation`));
      what = { kind: 'formula', expr: m.formula, uses: names };
    } else {
      choices = strs(m.choices);
      if (choices.length < 2) return errors.push(tr(`${wi}.choices: 至少要有两个选项`, `${wi}.choices: needs at least two options`));
      if (typeof m.correct !== 'number' || !Number.isInteger(m.correct) || m.correct < 0 || m.correct >= choices.length)
        return errors.push(tr(`${wi}.correct: 必须是正确选项的序号（从 0 开始）`, `${wi}.correct: must be the index of the right option (from 0)`));
      correct = m.correct;
    }
    if (m.unit !== undefined) {
      if (typeof m.unit !== 'string') errors.push(tr(`${wi}.unit: 必须是字符串，如 "mA"`, `${wi}.unit: must be a string, e.g. "mA"`));
      else unit = m.unit;
    }
    if (m.stated !== undefined && typeof m.stated !== 'boolean') errors.push(tr(`${wi}.stated: 必须是 true 或 false`, `${wi}.stated: must be true or false`));
    if (what === null && m.predict) errors.push(tr(`${wi}: 选择题不能 "predict"`, `${wi}: a multiple-choice question can't "predict"`));
    for (const k of ['tol', 'tolAbs', 'tolDeg'] as const)
      if (m[k] !== undefined && (typeof m[k] !== 'number' || !((m[k] as number) >= 0))) errors.push(tr(`${wi}.${k}: 必须是非负数`, `${wi}.${k}: must be a number ≥ 0`));
    let range: [number, number] | undefined;
    if (m.range !== undefined) {
      const r = Array.isArray(m.range) ? m.range.map((x) => (typeof x === 'number' || typeof x === 'string' ? parseValue(x) : null)) : [];
      if (r.length !== 2 || r[0] === null || r[1] === null || r[0] > r[1])
        errors.push(tr(`${wi}.range: 必须是 [最小值, 最大值]（SI 单位）`, `${wi}.range: must be [min, max] (SI units)`));
      else range = [r[0], r[1]];
    }
    if (what && range === undefined)
      warnings.push(tr(`${wi}: 没有 "range"——validator 无法核对参考答案的读数是否合理`, `${wi}: no "range" — the validator can't sanity-check the reference reading`));
    qIds.add(id);
    measurements.push({
      id,
      ask,
      explain: textOf(m.explain),
      unit,
      tol: typeof m.tol === 'number' ? m.tol : kind === 'formula' ? 0.02 : tol,
      tolAbs: typeof m.tolAbs === 'number' ? m.tolAbs : tolAbs,
      tolDeg: typeof m.tolDeg === 'number' ? m.tolDeg : 2,
      predict: m.predict === true,
      required: m.optional !== true,
      ...(m.stated === true ? { stated: true } : {}),
      set,
      what,
      range,
      choices,
      correct,
    });
  });

  const steps: ChallengeStep[] = (Array.isArray(json.steps) ? json.steps : [])
    .map((s: unknown) =>
      typeof s === 'string'
        ? { text: s, highlight: [] }
        : isObj(s)
          ? {
              text: String(s.text ?? ''),
              highlight: Array.isArray(s.highlight) ? s.highlight.filter((h): h is string => typeof h === 'string') : [],
            }
          : null,
    )
    .filter((s): s is ChallengeStep => !!s && !!s.text);

  // translations: "lang" names the language of the top-level text, "i18n" holds the others
  const baseLang: Lang = json.lang === undefined ? 'zh' : isLang(json.lang) ? json.lang : 'zh';
  const langList = LANGS.map((l) => `"${l}"`).join(' / ');
  if (json.lang !== undefined && !isLang(json.lang)) errors.push(tr(`"lang" 必须是 ${langList}`, `"lang" must be ${langList}`));
  let tx: Record<string, unknown> = {};
  if (json.i18n !== undefined) {
    if (!isObj(json.i18n)) errors.push(tr('"i18n" 必须是对象，如 { "en": { "title": "..." } }', '"i18n" must be an object, e.g. { "en": { "title": "..." } }'));
    else
      for (const [l, v] of Object.entries(json.i18n)) {
        if (!isLang(l)) errors.push(tr(`i18n: 不支持的语言 "${l}"（可用：${LANGS.join(', ')}）`, `i18n: unsupported language "${l}" (available: ${LANGS.join(', ')})`));
        else if (!isObj(v)) errors.push(tr(`i18n.${l}: 必须是对象`, `i18n.${l}: must be an object`));
        else {
          const count = (key: string, n: number) => {
            if (v[key] !== undefined && (!Array.isArray(v[key]) || (v[key] as unknown[]).length !== n))
              warnings.push(
                tr(`i18n.${l}.${key}: 应该是和 "${key}" 一一对应的数组（${n} 项）`, `i18n.${l}.${key}: should be an array matching "${key}" item by item (${n} items)`),
              );
          };
          count('steps', steps.length);
          count('hints', Array.isArray(json.hints) ? json.hints.length : 0);
          count('tests', tests.length);
          count('measurements', measurements.length);
          if (l === getLang() && l !== baseLang) tx = v;
        }
      }
  }
  const txList = (key: string) => (Array.isArray(tx[key]) ? (tx[key] as unknown[]) : []);
  txList('steps').forEach((t, i) => {
    const text = typeof t === 'string' ? t : isObj(t) && typeof t.text === 'string' ? t.text : '';
    if (steps[i] && text) steps[i] = { ...steps[i], text };
  });
  txList('tests').forEach((t, i) => {
    if (tests[i] && typeof t === 'string' && t) tests[i] = { ...tests[i], name: t };
  });
  txList('measurements').forEach((t, i) => {
    const q = measurements[i];
    if (!q || !isObj(t)) return;
    const ask = textOf(t.ask);
    const explain = textOf(t.explain);
    const ch = strs(t.choices);
    measurements[i] = { ...q, ask: ask || q.ask, explain: explain || q.explain, choices: q.choices && ch.length === q.choices.length ? ch : q.choices };
  });
  const baseHints = strs(json.hints);
  const txHints = strs(tx.hints);

  const solution = parseLayout(json.solution, refs, 'solution', errors);
  const start = parseLayout(json.start, refs, 'start', errors);
  const opts = isObj(json.options) ? json.options : {};

  let phase: ChallengePhase | undefined;
  if (json.phase !== undefined) {
    if (PHASES.includes(json.phase as ChallengePhase)) phase = json.phase as ChallengePhase;
    else errors.push(tr(`"phase" 必须是 ${PHASES.join(' / ')}（课程第几期，见 docs/ROADMAP.md）`, `"phase" must be ${PHASES.join(' / ')} (the course phase, see docs/ROADMAP.md)`));
  }

  const level = typeof json.level === 'number' ? Math.min(5, Math.max(1, Math.round(json.level))) : 1;
  const challenge: Challenge = {
    id,
    title: typeof tx.title === 'string' && tx.title ? tx.title : title,
    level,
    kind: json.kind === 'lesson' ? 'lesson' : 'challenge',
    phase,
    summary: textOf(tx.summary) || textOf(json.summary),
    description: textOf(tx.description) || textOf(json.description),
    concepts: tx.concepts !== undefined ? strs(tx.concepts) : strs(json.concepts),
    target: { components, nets },
    tests,
    measurements,
    compare: textOf(tx.compare) || textOf(json.compare),
    hints: txHints.length === baseHints.length ? txHints : baseHints,
    steps,
    solution,
    start,
    tolerance: typeof opts.tolerance === 'number' ? opts.tolerance : 0.05,
    allowExtraComponents: opts.allowExtraComponents === true,
    textLang: Object.keys(tx).length ? getLang() : baseLang,
    source,
    file,
  };
  return { ok: errors.length === 0, errors, warnings, challenge: errors.length === 0 ? challenge : undefined };
}
