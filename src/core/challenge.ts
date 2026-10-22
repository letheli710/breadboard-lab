// Challenge file format "breadboard-challenge/1": parsing + validation.
// See docs/CHALLENGE_FORMAT.md for the human-readable spec.

import { HOLE_MAP } from './breadboard';
import { parseValue } from './format';
import { BATTERIES, LED_COLORS, PARTS, terminalsOf } from './parts';
import type { BatteryVariant, CComponent, CompType, Circuit, Layout, LedColor, PartProps, PartType, PlacedPart } from './types';

export const FORMAT_ID = 'breadboard-challenge/1';

export interface ChallengeTest {
  name: string;
  set: Record<string, PartProps>;
  expect: Record<string, 'on' | 'off'>;
  voltages: { pin: string; ref?: string; min?: number; max?: number }[];
}

export interface ChallengeStep {
  text: string;
  highlight: string[];
}

export interface Challenge {
  id: string;
  title: string;
  level: number;
  kind: 'lesson' | 'challenge';
  summary: string;
  description: string;
  concepts: string[];
  target: Circuit;
  tests: ChallengeTest[];
  hints: string[];
  steps: ChallengeStep[];
  solution?: Layout;
  start?: Layout;
  tolerance: number;
  allowExtraComponents: boolean;
  /** where it came from: "builtin", "folder", "imported" */
  source: string;
  file?: string;
}

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
};

export function normalizePin(type: CompType, pin: string): string | null {
  const p = pin.trim();
  const alias = PIN_ALIASES[type]?.[p.toLowerCase()];
  if (alias) return alias;
  return terminalsOf(type).includes(p) ? p : null;
}

function parseProps(type: CompType, raw: Record<string, unknown>, where: string, errors: string[]): PartProps {
  const props: PartProps = {};
  const num = (key: string, out: keyof PartProps) => {
    if (raw[key] === undefined || raw[key] === 'any') return;
    const v = parseValue(raw[key] as string | number);
    if (v === null) errors.push(`${where}: "${key}" 的值 ${JSON.stringify(raw[key])} 无法解析（示例："330"、"4.7k"、9）`);
    else (props[out] as number) = v;
  };
  num('resistance', 'resistance');
  num('voltage', 'voltage');
  num('capacitance', 'capacitance');
  num('currentLimit', 'currentLimit');
  num('wiper', 'wiper');
  if (raw.value !== undefined && raw.value !== 'any') {
    // generic "value" field: resistance for R/pot, capacitance for C, voltage for sources
    const key = type === 'capacitor' ? 'capacitance' : type === 'resistor' || type === 'potentiometer' ? 'resistance' : 'voltage';
    const v = parseValue(raw.value as string | number);
    if (v === null) errors.push(`${where}: "value" ${JSON.stringify(raw.value)} 无法解析`);
    else (props as Record<string, number>)[key] = v;
  }
  if (raw.color !== undefined && raw.color !== 'any') {
    if (typeof raw.color === 'string' && raw.color in LED_COLORS) props.color = raw.color as LedColor;
    else errors.push(`${where}: LED 颜色必须是 ${Object.keys(LED_COLORS).join(' / ')}`);
  }
  if (raw.variant !== undefined) {
    if (typeof raw.variant === 'string' && raw.variant in BATTERIES) props.variant = raw.variant as BatteryVariant;
    else errors.push(`${where}: 电池型号必须是 ${Object.keys(BATTERIES).join(' / ')}`);
  }
  if (raw.pressed !== undefined) props.pressed = !!raw.pressed;
  if (raw.position !== undefined) {
    if (raw.position === 'a' || raw.position === 'b') props.position = raw.position;
    else errors.push(`${where}: "position" 必须是 "a" 或 "b"`);
  }
  return props;
}

function parseLayout(raw: unknown, refs: Set<string> | null, where: string, errors: string[]): Layout | undefined {
  if (raw === undefined) return undefined;
  if (!isObj(raw) || !Array.isArray(raw.parts)) {
    errors.push(`${where}: 必须是 { "parts": [...] }`);
    return undefined;
  }
  const parts: PlacedPart[] = [];
  const used = new Map<string, string>();
  raw.parts.forEach((p: unknown, i: number) => {
    const w = `${where}.parts[${i}]`;
    if (!isObj(p)) return errors.push(`${w}: 必须是对象`);
    const type = p.type as PartType;
    if (!(type in PARTS)) return errors.push(`${w}: 未知类型 "${String(p.type)}"`);
    const def = PARTS[type];
    const ref = typeof p.ref === 'string' && p.ref ? p.ref : `${def.refPrefix}${i + 1}`;
    if (type !== 'wire' && refs && !refs.has(ref)) {
      // allowed (solutions may name parts freely) — matching is topological
    }
    const pins: Record<string, string> = {};
    let pinsRaw = isObj(p.pins) ? (p.pins as Record<string, unknown>) : {};
    if (def.placement.kind === 'footprint' && typeof p.at === 'string') {
      const fp = def.placement.footprint(p.at);
      if (!fp) errors.push(`${w}: "at": "${p.at}" 放不下这个元件`);
      else pinsRaw = fp;
    }
    for (const [pin, hole] of Object.entries(pinsRaw)) {
      if (!(pin in def.terminalOf)) {
        errors.push(`${w}: ${type} 没有名为 "${pin}" 的引脚（可用：${Object.keys(def.terminalOf).join(', ')}）`);
        continue;
      }
      if (typeof hole !== 'string' || !HOLE_MAP.has(hole)) {
        errors.push(`${w}: 孔位 ${JSON.stringify(hole)} 不存在（主区 a1–j30，电源轨 tp/tn/bp/bn + 1–30）`);
        continue;
      }
      if (used.has(hole)) errors.push(`${w}: 孔 ${hole} 已经被 ${used.get(hole)} 占用（一个孔只能插一只脚）`);
      used.set(hole, ref);
      pins[pin] = hole;
    }
    const props =
      type === 'wire'
        ? { ...def.defaults, ...(typeof p.color === 'string' ? { wireColor: WIRE_NAMES[p.color] ?? p.color } : {}) }
        : { ...def.defaults, ...parseProps(type, isObj(p.props) ? p.props : p, w, errors) };
    parts.push({ id: `${ref}-${i}`, ref, type, props, pins });
  });
  return { version: 1, parts };
}

export function parseChallenge(json: unknown, source = 'builtin', file?: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isObj(json)) return { ok: false, errors: ['文件内容必须是一个 JSON 对象 { ... }'], warnings };

  if (json.format !== FORMAT_ID) errors.push(`"format" 必须是 "${FORMAT_ID}"（现在是 ${JSON.stringify(json.format)}）`);
  const id = typeof json.id === 'string' ? json.id : '';
  if (!/^[a-z0-9][a-z0-9-_]*$/i.test(id)) errors.push('"id" 必须是由字母、数字、- 或 _ 组成的字符串');
  const title = typeof json.title === 'string' ? json.title : '';
  if (!title) errors.push('"title" 不能为空');

  // components
  const components: CComponent[] = [];
  const refs = new Set<string>();
  if (!Array.isArray(json.components) || json.components.length === 0) errors.push('"components" 必须是非空数组');
  else
    json.components.forEach((c: unknown, i: number) => {
      const w = `components[${i}]`;
      if (!isObj(c)) return errors.push(`${w}: 必须是对象`);
      const ref = c.ref;
      if (typeof ref !== 'string' || !/^[A-Za-z][A-Za-z0-9_]*$/.test(ref))
        return errors.push(`${w}: "ref" 必须是字母开头的标识符，如 "R1"、"LED1"`);
      if (refs.has(ref)) return errors.push(`${w}: ref "${ref}" 重复`);
      const type = c.type as CompType;
      if (!COMP_TYPES.includes(type)) return errors.push(`${w}: 未知类型 "${String(c.type)}"（可用：${COMP_TYPES.join(', ')}）`);
      refs.add(ref);
      components.push({ ref, type, props: parseProps(type, c, `${w} (${ref})`, errors) });
    });
  const compOf = new Map(components.map((c) => [c.ref, c]));

  const resolvePin = (s: unknown, where: string): string | null => {
    if (typeof s !== 'string' || !s.includes('.')) {
      errors.push(`${where}: 引脚 ${JSON.stringify(s)} 格式应为 "REF.pin"，例如 "R1.1"、"LED1.anode"`);
      return null;
    }
    const i = s.lastIndexOf('.');
    const ref = s.slice(0, i);
    const c = compOf.get(ref);
    if (!c) {
      errors.push(`${where}: 找不到元件 "${ref}"`);
      return null;
    }
    const pin = normalizePin(c.type, s.slice(i + 1));
    if (!pin) {
      errors.push(`${where}: ${ref}（${c.type}）没有引脚 "${s.slice(i + 1)}"，可用：${terminalsOf(c.type).join(', ')}`);
      return null;
    }
    return `${ref}.${pin}`;
  };

  // connections / nets -> merged nets
  const groups: { name?: string; pins: string[] }[] = [];
  if (Array.isArray(json.connections)) {
    json.connections.forEach((g: unknown, i: number) => {
      if (!Array.isArray(g)) return errors.push(`connections[${i}]: 必须是引脚数组，如 ["R1.2", "LED1.anode"]`);
      if (g.length < 2) warnings.push(`connections[${i}]: 只有一个引脚，没有意义`);
      const pins = g.map((p, j) => resolvePin(p, `connections[${i}][${j}]`)).filter((p): p is string => !!p);
      groups.push({ pins });
    });
  }
  if (Array.isArray(json.nets)) {
    json.nets.forEach((n: unknown, i: number) => {
      if (!isObj(n) || !Array.isArray(n.pins)) return errors.push(`nets[${i}]: 必须是 { "name": "...", "pins": [...] }`);
      const pins = n.pins.map((p, j) => resolvePin(p, `nets[${i}].pins[${j}]`)).filter((p): p is string => !!p);
      groups.push({ name: typeof n.name === 'string' ? n.name : undefined, pins });
    });
  }
  if (!Array.isArray(json.connections) && !Array.isArray(json.nets)) errors.push('需要 "connections" 或 "nets" 来描述连接关系');

  // union groups that share a pin
  const parent = new Map<number, number>();
  const find = (i: number): number => (parent.get(i) ?? i) === i ? i : find(parent.get(i)!);
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
    if (unused.length === terminalsOf(c.type).length) warnings.push(`${c.ref} 没有任何连接`);
  }

  // tests
  const tests: ChallengeTest[] = [];
  if (json.tests !== undefined && !Array.isArray(json.tests)) errors.push('"tests" 必须是数组');
  (Array.isArray(json.tests) ? json.tests : []).forEach((t: unknown, i: number) => {
    const w = `tests[${i}]`;
    if (!isObj(t)) return errors.push(`${w}: 必须是对象`);
    const set: Record<string, PartProps> = {};
    if (isObj(t.set))
      for (const [ref, v] of Object.entries(t.set)) {
        const c = compOf.get(ref);
        if (!c) errors.push(`${w}.set: 找不到元件 "${ref}"`);
        else if (!isObj(v)) errors.push(`${w}.set.${ref}: 必须是对象，如 {"pressed": true}`);
        else set[ref] = parseProps(c.type, v, `${w}.set.${ref}`, errors);
      }
    const expect: Record<string, 'on' | 'off'> = {};
    if (isObj(t.expect))
      for (const [ref, v] of Object.entries(t.expect)) {
        const c = compOf.get(ref);
        if (!c) errors.push(`${w}.expect: 找不到元件 "${ref}"`);
        else if (c.type !== 'led') errors.push(`${w}.expect.${ref}: 只有 LED 可以写 "on"/"off"`);
        else if (v !== 'on' && v !== 'off') errors.push(`${w}.expect.${ref}: 必须是 "on" 或 "off"`);
        else expect[ref] = v;
      }
    const voltages: ChallengeTest['voltages'] = [];
    if (Array.isArray(t.voltages))
      t.voltages.forEach((v: unknown, j: number) => {
        if (!isObj(v)) return errors.push(`${w}.voltages[${j}]: 必须是对象`);
        const pin = resolvePin(v.pin, `${w}.voltages[${j}].pin`);
        const ref = v.ref === undefined ? undefined : resolvePin(v.ref, `${w}.voltages[${j}].ref`);
        if (pin && ref !== null)
          voltages.push({ pin, ref, min: typeof v.min === 'number' ? v.min : undefined, max: typeof v.max === 'number' ? v.max : undefined });
      });
    tests.push({ name: typeof t.name === 'string' ? t.name : `测试 ${i + 1}`, set, expect, voltages });
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

  const solution = parseLayout(json.solution, refs, 'solution', errors);
  const start = parseLayout(json.start, refs, 'start', errors);
  const opts = isObj(json.options) ? json.options : {};

  const level = typeof json.level === 'number' ? Math.min(5, Math.max(1, Math.round(json.level))) : 1;
  const challenge: Challenge = {
    id,
    title,
    level,
    kind: json.kind === 'lesson' ? 'lesson' : 'challenge',
    summary: typeof json.summary === 'string' ? json.summary : '',
    description: typeof json.description === 'string' ? json.description : Array.isArray(json.description) ? json.description.join('\n') : '',
    concepts: Array.isArray(json.concepts) ? json.concepts.filter((c): c is string => typeof c === 'string') : [],
    target: { components, nets },
    tests,
    hints: Array.isArray(json.hints) ? json.hints.filter((h): h is string => typeof h === 'string') : [],
    steps,
    solution,
    start,
    tolerance: typeof opts.tolerance === 'number' ? opts.tolerance : 0.05,
    allowExtraComponents: opts.allowExtraComponents === true,
    source,
    file,
  };
  return { ok: errors.length === 0, errors, warnings, challenge: errors.length === 0 ? challenge : undefined };
}
