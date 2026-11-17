// Learning units ("learning-unit/1", units/*.json): one idea per unit, 10–15 minutes, in up to
// five layers in a fixed order — intuition → derive → sim → bench → connect (docs/UNIT_FORMAT.md).
// This module checks one file's structure; links to other content (challenges, problems,
// portals, other units) are checked by the course validator (core/course/catalog.ts).

import { checkT, type T } from './text';
import { compile, evaluateModel, ModelError, type Compiled } from './model';

export const UNIT_FORMAT = 'learning-unit/1';
export const LAYERS = ['intuition', 'derive', 'sim', 'bench', 'connect'] as const;
export type Layer = (typeof LAYERS)[number];

export interface Param {
  id: string;
  label: T;
  value: number;
  min?: number;
  max?: number;
  /** slider moves in decades */
  log?: boolean;
  unit?: string;
}
export interface Output {
  id?: string;
  label: T;
  expr: string;
  compiled: Compiled;
  unit?: string;
  /** significant figures (default 3) */
  digits?: number;
  /** show the value as a percentage (×100, "%") */
  percent?: boolean;
}
export interface Scenario {
  label: T;
  set: Record<string, number>;
  ask: T;
  choices: T[];
  correct: number;
  explain: T;
}

export type Block =
  | { type: 'text'; md: T }
  | { type: 'note'; tone: 'info' | 'tip' | 'warn'; md: T }
  | { type: 'steps'; title?: T; steps: T[] }
  | { type: 'predict'; ask: T; choices?: T[]; correct?: number; answer?: number; tol?: number; unit?: string; text?: string[]; explain: T }
  | { type: 'explore'; title?: T; params: Param[]; outputs: Output[]; note?: T }
  | { type: 'sim'; title?: T; intro?: T; params: Param[]; outputs: Output[]; scenarios: Scenario[] }
  | { type: 'circuit'; schematic: unknown; caption: T }
  | { type: 'bench'; challenge: string; note: T }
  | { type: 'problems'; ids: string[]; note?: T }
  | { type: 'portal'; id: string };

export interface Unit {
  id: string;
  world: string;
  /** short code shown on cards, e.g. "5b" */
  code?: string;
  title: T;
  /** the one question the unit answers */
  question: T;
  minutes: number;
  /** what it connects back to (refs, see core/course/refs.ts) */
  connects: string[];
  layers: { layer: Layer; title?: T; blocks: Block[] }[];
}

export interface UnitResult {
  unit: Unit | null;
  errors: string[];
  warnings: string[];
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const ID = /^[a-z0-9][a-z0-9-]*$/;
const PARAM_ID = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const isUnitJson = (json: unknown): boolean => isObj(json) && json.format === UNIT_FORMAT;

function parseParams(v: unknown, where: string, errors: string[], sliders: boolean): Param[] {
  if (!Array.isArray(v) || !v.length) {
    errors.push(`${where}: "params" 需要至少一个参数 / needs at least one parameter`);
    return [];
  }
  const out: Param[] = [];
  const seen = new Set<string>();
  v.forEach((p, i) => {
    const w = `${where}.params[${i}]`;
    if (!isObj(p) || typeof p.id !== 'string' || !PARAM_ID.test(p.id)) return void errors.push(`${w}: "id" 需要是变量名（字母开头） / "id" must be a name`);
    if (seen.has(p.id)) errors.push(`${w}: id "${p.id}" 重复 / duplicate`);
    seen.add(p.id);
    if (!isNum(p.value)) errors.push(`${w}: "value" 需要是数字 / must be a number`);
    if (sliders) {
      if (!isNum(p.min) || !isNum(p.max) || p.min >= p.max) errors.push(`${w}: 滑块需要 min < max / a slider needs min < max`);
      else if (isNum(p.value) && (p.value < p.min || p.value > p.max)) errors.push(`${w}: value 不在 [min, max] 内 / value outside [min, max]`);
      if (p.log && isNum(p.min) && p.min <= 0) errors.push(`${w}: 对数滑块需要 min > 0 / a log slider needs min > 0`);
    }
    const labelOk = p.label === undefined && !sliders ? true : checkT(p.label, `${w}.label`, errors);
    out.push({
      id: p.id,
      label: (labelOk ? p.label : { zh: p.id, en: p.id }) as T,
      value: isNum(p.value) ? p.value : 0,
      ...(isNum(p.min) ? { min: p.min } : {}),
      ...(isNum(p.max) ? { max: p.max } : {}),
      ...(p.log === true ? { log: true } : {}),
      ...(typeof p.unit === 'string' ? { unit: p.unit } : {}),
    });
  });
  return out;
}

function parseOutputs(v: unknown, where: string, params: Param[], errors: string[]): Output[] {
  if (!Array.isArray(v) || !v.length) {
    errors.push(`${where}: "outputs" 需要至少一个输出 / needs at least one output`);
    return [];
  }
  const known = new Set(params.map((p) => p.id));
  const out: Output[] = [];
  v.forEach((o, i) => {
    const w = `${where}.outputs[${i}]`;
    if (!isObj(o) || typeof o.expr !== 'string') return void errors.push(`${w}: 需要 "expr"（公式） / needs "expr"`);
    let compiled: Compiled;
    try {
      compiled = compile(o.expr);
    } catch (e) {
      return void errors.push(`${w}: 公式写错了 / bad formula: ${(e as ModelError).message}`);
    }
    for (const name of compiled.vars) if (!known.has(name)) errors.push(`${w}: 公式里的 "${name}" 不是参数或前面的输出 / "${name}" is not a parameter or an earlier output`);
    if (o.id !== undefined) {
      if (typeof o.id !== 'string' || !PARAM_ID.test(o.id)) errors.push(`${w}: "id" 需要是变量名 / "id" must be a name`);
      else if (known.has(o.id)) errors.push(`${w}: id "${o.id}" 和参数或前面的输出重名 / clashes with a parameter or an earlier output`);
      else known.add(o.id);
    }
    checkT(o.label, `${w}.label`, errors);
    out.push({
      ...(typeof o.id === 'string' ? { id: o.id } : {}),
      label: o.label as T,
      expr: o.expr,
      compiled,
      ...(typeof o.unit === 'string' ? { unit: o.unit } : {}),
      ...(isNum(o.digits) ? { digits: Math.max(1, Math.min(8, Math.round(o.digits))) } : {}),
      ...(o.percent === true ? { percent: true } : {}),
    });
  });
  return out;
}

/** every output finite at the given parameter values */
function checkFinite(params: Param[], outputs: Output[], set: Record<string, number>, where: string, errors: string[]) {
  const env = Object.fromEntries(params.map((p) => [p.id, p.value]));
  Object.assign(env, set);
  const vals = evaluateModel(outputs, env);
  vals.forEach((v, i) => {
    if (!Number.isFinite(v)) errors.push(`${where}: 输出 ${i}（${outputs[i].expr}）不是有限数 / output ${i} is not finite`);
  });
}

function parseChoices(b: Record<string, unknown>, where: string, errors: string[]): { choices: T[]; correct: number } | null {
  if (!Array.isArray(b.choices) || b.choices.length < 2) {
    errors.push(`${where}: "choices" 至少两个选项 / needs at least two choices`);
    return null;
  }
  b.choices.forEach((c, i) => checkT(c, `${where}.choices[${i}]`, errors));
  if (!Number.isInteger(b.correct) || (b.correct as number) < 0 || (b.correct as number) >= b.choices.length)
    errors.push(`${where}: "correct" 需要是选项的序号（从 0 开始） / "correct" must index a choice (from 0)`);
  return { choices: b.choices as T[], correct: b.correct as number };
}

function parseBlock(b: unknown, where: string, errors: string[], warnings: string[]): Block | null {
  if (!isObj(b) || typeof b.type !== 'string') {
    errors.push(`${where}: 需要 "type" / needs "type"`);
    return null;
  }
  switch (b.type) {
    case 'text':
      checkT(b.md, `${where}.md`, errors);
      return { type: 'text', md: b.md as T };
    case 'note': {
      const tone = b.tone === 'tip' || b.tone === 'warn' ? b.tone : 'info';
      if (b.tone !== undefined && b.tone !== tone) errors.push(`${where}: "tone" 只能是 info / tip / warn`);
      checkT(b.md, `${where}.md`, errors);
      return { type: 'note', tone, md: b.md as T };
    }
    case 'steps':
      if (b.title !== undefined) checkT(b.title, `${where}.title`, errors);
      if (!Array.isArray(b.steps) || b.steps.length < 2) errors.push(`${where}: "steps" 至少两步 / needs at least two steps`);
      else b.steps.forEach((s, i) => checkT(s, `${where}.steps[${i}]`, errors));
      return { type: 'steps', ...(b.title ? { title: b.title as T } : {}), steps: (Array.isArray(b.steps) ? b.steps : []) as T[] };
    case 'predict': {
      checkT(b.ask, `${where}.ask`, errors);
      checkT(b.explain, `${where}.explain`, errors);
      const kinds = [b.choices !== undefined, b.answer !== undefined, b.text !== undefined].filter(Boolean).length;
      if (kinds !== 1) errors.push(`${where}: 只能用 "choices"、"answer"（数字）、"text"（文字答案）其中一种 / use exactly one of choices / answer / text`);
      const base = { type: 'predict' as const, ask: b.ask as T, explain: b.explain as T };
      if (b.choices !== undefined) {
        const c = parseChoices(b, where, errors);
        return c ? { ...base, ...c } : null;
      }
      if (b.answer !== undefined) {
        if (!isNum(b.answer)) errors.push(`${where}: "answer" 需要是数字 / must be a number`);
        if (b.tol !== undefined && (!isNum(b.tol) || b.tol <= 0 || b.tol >= 1)) errors.push(`${where}: "tol" 是相对误差，0 < tol < 1 / relative tolerance`);
        return { ...base, answer: b.answer as number, ...(isNum(b.tol) ? { tol: b.tol } : {}), ...(typeof b.unit === 'string' ? { unit: b.unit } : {}) };
      }
      if (!Array.isArray(b.text) || !b.text.length || !b.text.every((x) => typeof x === 'string' && x.trim()))
        errors.push(`${where}: "text" 需要一组可接受的答案 / needs a list of accepted answers`);
      return { ...base, text: (Array.isArray(b.text) ? b.text : []) as string[] };
    }
    case 'explore': {
      if (b.title !== undefined) checkT(b.title, `${where}.title`, errors);
      if (b.note !== undefined) checkT(b.note, `${where}.note`, errors);
      const params = parseParams(b.params, where, errors, true);
      const outputs = parseOutputs(b.outputs, where, params, errors);
      if (!errors.length) {
        checkFinite(params, outputs, {}, where, errors);
        for (const p of params) {
          checkFinite(params, outputs, { [p.id]: p.min! }, `${where} (${p.id} = min)`, errors);
          checkFinite(params, outputs, { [p.id]: p.max! }, `${where} (${p.id} = max)`, errors);
        }
      }
      return { type: 'explore', ...(b.title ? { title: b.title as T } : {}), params, outputs, ...(b.note ? { note: b.note as T } : {}) };
    }
    case 'sim': {
      if (b.title !== undefined) checkT(b.title, `${where}.title`, errors);
      if (b.intro !== undefined) checkT(b.intro, `${where}.intro`, errors);
      const params = parseParams(b.params, where, errors, false);
      const outputs = parseOutputs(b.outputs, where, params, errors);
      const scenarios: Scenario[] = [];
      if (!Array.isArray(b.scenarios) || !b.scenarios.length) errors.push(`${where}: "scenarios" 至少一个 / needs at least one scenario`);
      else
        b.scenarios.forEach((s, i) => {
          const w = `${where}.scenarios[${i}]`;
          if (!isObj(s)) return void errors.push(`${w}: 需要是对象 / must be an object`);
          checkT(s.label, `${w}.label`, errors);
          checkT(s.ask, `${w}.ask`, errors);
          checkT(s.explain, `${w}.explain`, errors);
          const set: Record<string, number> = {};
          if (s.set !== undefined) {
            if (!isObj(s.set)) errors.push(`${w}: "set" 需要是 { 参数: 数值 } / must be { param: number }`);
            else
              for (const [k, v] of Object.entries(s.set)) {
                if (!params.some((p) => p.id === k)) errors.push(`${w}: "set" 里的 "${k}" 不是参数 / not a parameter`);
                if (!isNum(v)) errors.push(`${w}: "set.${k}" 需要是数字 / must be a number`);
                else set[k] = v;
              }
          }
          const c = parseChoices(s, w, errors);
          if (!errors.length) checkFinite(params, outputs, set, w, errors);
          if (c) scenarios.push({ label: s.label as T, set, ask: s.ask as T, choices: c.choices, correct: c.correct, explain: s.explain as T });
        });
      return { type: 'sim', ...(b.title ? { title: b.title as T } : {}), ...(b.intro ? { intro: b.intro as T } : {}), params, outputs, scenarios };
    }
    case 'circuit':
      if (!isObj(b.schematic)) errors.push(`${where}: "schematic" 需要是电路图对象（格式同理论题，docs/PROBLEM_FORMAT.md） / needs a schematic object`);
      checkT(b.caption, `${where}.caption`, errors);
      return { type: 'circuit', schematic: b.schematic, caption: b.caption as T };
    case 'bench':
      if (typeof b.challenge !== 'string' || !b.challenge) errors.push(`${where}: "challenge" 需要是面包板课程 / 实验的 id / needs a lesson or lab id`);
      checkT(b.note, `${where}.note`, errors);
      return { type: 'bench', challenge: String(b.challenge ?? ''), note: b.note as T };
    case 'problems':
      if (!Array.isArray(b.ids) || !b.ids.length || !b.ids.every((x) => typeof x === 'string')) errors.push(`${where}: "ids" 需要一组理论题 id / needs problem ids`);
      if (b.note !== undefined) checkT(b.note, `${where}.note`, errors);
      return { type: 'problems', ids: (Array.isArray(b.ids) ? b.ids : []) as string[], ...(b.note ? { note: b.note as T } : {}) };
    case 'portal':
      if (typeof b.id !== 'string' || !b.id) errors.push(`${where}: "id" 需要是 course/portals.json 里传送门的 id / needs a portal id`);
      return { type: 'portal', id: String(b.id ?? '') };
    default:
      warnings.push(`${where}: 未知的 block 类型 "${b.type}"（已忽略） / unknown block type (ignored)`);
      return null;
  }
}

export function parseUnit(json: unknown): UnitResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isObj(json)) return { unit: null, errors: ['不是 JSON 对象 / not a JSON object'], warnings };
  if (json.format !== UNIT_FORMAT) errors.push(`"format" 需要是 "${UNIT_FORMAT}"`);
  if (typeof json.id !== 'string' || !ID.test(json.id)) errors.push('"id" 需要是小写字母、数字和 "-" / lower-case letters, digits and "-"');
  if (typeof json.world !== 'string' || !json.world) errors.push('"world" 需要是 World 的 id（如 "w3"） / needs a world id');
  if (json.code !== undefined && (typeof json.code !== 'string' || json.code.length > 8)) errors.push('"code" 是短编号（≤ 8 个字符） / short code');
  checkT(json.title, 'title', errors);
  checkT(json.question, 'question', errors);
  if (!isNum(json.minutes) || json.minutes < 1 || json.minutes > 120) errors.push('"minutes" 需要是 1–120 的分钟数 / minutes 1–120');
  const connects = Array.isArray(json.connects) ? json.connects : [];
  if (json.connects !== undefined && (!Array.isArray(json.connects) || !json.connects.every((x) => typeof x === 'string')))
    errors.push('"connects" 需要是一组引用 / a list of refs');

  const layers: Unit['layers'] = [];
  if (!Array.isArray(json.layers) || !json.layers.length) errors.push('"layers" 至少一层 / needs at least one layer');
  else {
    let last = -1;
    json.layers.forEach((l, i) => {
      const w = `layers[${i}]`;
      if (!isObj(l)) return void errors.push(`${w}: 需要是对象 / must be an object`);
      const k = LAYERS.indexOf(l.layer as Layer);
      if (k < 0) return void errors.push(`${w}: "layer" 只能是 ${LAYERS.join(' / ')}`);
      if (k <= last) errors.push(`${w}: 层的顺序固定：${LAYERS.join(' → ')}，每层最多一次 / fixed order, each layer at most once`);
      last = Math.max(last, k);
      if (l.title !== undefined) checkT(l.title, `${w}.title`, errors);
      if (!Array.isArray(l.blocks) || !l.blocks.length) return void errors.push(`${w}: "blocks" 至少一块 / needs at least one block`);
      const blocks: Block[] = [];
      l.blocks.forEach((b, j) => {
        const x = parseBlock(b, `${w}.blocks[${j}]`, errors, warnings);
        if (x) blocks.push(x);
      });
      layers.push({ layer: LAYERS[k], ...(l.title ? { title: l.title as T } : {}), blocks });
    });
  }
  if (errors.length) return { unit: null, errors, warnings };
  return {
    unit: {
      id: json.id as string,
      world: json.world as string,
      ...(typeof json.code === 'string' ? { code: json.code } : {}),
      title: json.title as T,
      question: json.question as T,
      minutes: json.minutes as number,
      connects: connects as string[],
      layers,
    },
    errors,
    warnings,
  };
}

/** Every block of a unit, in order. */
export const unitBlocks = (u: Unit): Block[] => u.layers.flatMap((l) => l.blocks);
