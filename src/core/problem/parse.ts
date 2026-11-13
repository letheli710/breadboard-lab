// Problem file format "circuit-problem/1": parsing, validation, localisation and answer checking.
// See docs/PROBLEM_FORMAT.md for the human-readable spec and types.ts for the contract.
//
// parseProblem() is the single quality gate for AI-written problems: besides the structural
// checks it recomputes every numeric answer with the ideal analysis engine and rejects the
// file if the author's `answer` disagrees.

import { Circuit, computeQuantity } from '../analysis';
import { getLang, isLang, LANGS, tr, type Lang } from '../i18n';
import { chapterById, CHAPTERS } from './chapters';
import { evalExpr, type ExprError } from './expr';
import { extractNetlist, isTwoTerminal } from './geometry';
import {
  PROBLEM_FORMAT_ID,
  type Analysis,
  type Find,
  type Netlist,
  type Part,
  type ProblemElement,
  type ProblemFile,
  type Question,
  type Schematic,
} from './types';

/** A problem ready for the UI: text already localised for the current language. */
export interface Problem {
  id: string;
  chapter: string;
  title: string;
  level: number;
  tags: string[];
  statement: string;
  /** localised notes, auto-added `marks` */
  schematic: Schematic;
  analysis: Analysis;
  /** localised ask / explain / choices */
  questions: Question[];
  hints: string[];
  solution: string;
  netlist: Netlist;
  /** engine value of every `find` question, by question id (empty when parsed with verify: false) */
  computed: Record<string, number>;
  /** language the text ended up in */
  textLang: Lang;
  /** "folder" | "imported" | … */
  source: string;
  file?: string;
}

export interface ProblemValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
  problem?: Problem;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
/** a text field may be a string or an array of lines */
const textOf = (v: unknown) => (typeof v === 'string' ? v : Array.isArray(v) ? strs(v).join('\n') : '');

const KINDS = ['v', 'i', 'p', 'q', 's', 'pf', 'req', 'vth', 'isc', 'pmax', 'tau', 'meter', 'gain', 'f0', 'twoport', 'w', 'val', 'wattmeter', 'root', 'alpha', 'omega_d', 'omega0', 'fc', 'bw', 'Q'] as const;
/** kinds that describe the whole circuit (no time instant needed in transient problems) */
const TIMELESS = ['tau', 'root', 'alpha', 'omega_d', 'omega0', 'val', 'f0', 'Q', 'fc', 'bw'];
const PARTS: Part[] = ['re', 'im', 'mag', 'phase', 'db', 'rms'];
const TIMES = ['0-', '0+', 'inf'];
const isGroundName = (n: string) => /^(0|gnd)$/i.test(n);

/** Is this answer an angle (compared modulo 360°)? */
export const isPhaseQuestion = (q: { find?: { part?: Part }; unit?: string }) => q.find?.part === 'phase' || q.unit === '°' || q.unit === 'deg';

/** Does the author's answer match the engine? 0.5 % relative, 1e-9 absolute; angles modulo 360° (0.01° floor). */
export function answersAgree(author: number, engine: number, phase = false): boolean {
  if (!Number.isFinite(author) || !Number.isFinite(engine)) return false;
  const diff = phase ? angleDiff(author, engine) : Math.abs(author - engine);
  return diff <= Math.max(0.005 * Math.abs(engine), phase ? 0.01 : 1e-9);
}

/** |a − b| for angles in degrees, wrapped into [0, 180]. */
function angleDiff(a: number, b: number): number {
  const d = (((a - b) % 360) + 360) % 360;
  return Math.min(d, 360 - d);
}

/** Pretty number for messages: up to 6 significant digits, no float noise. */
export function fmtNum(v: number): string {
  if (!Number.isFinite(v)) return String(v);
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e-3 && a < 1e7) return String(parseFloat(v.toPrecision(6)));
  return v.toExponential(5).replace(/\.?0+e/, 'e');
}

function elementRefs(s: Schematic): Map<string, ProblemElement> {
  const m = new Map<string, ProblemElement>();
  for (const e of Array.isArray(s.elements) ? s.elements : []) if (isObj(e) && typeof e.ref === 'string') m.set(e.ref, e as ProblemElement);
  return m;
}

/** Light structural checks of a question's `find` (the engine does the rest). */
function checkFind(find: unknown, where: string, els: Map<string, ProblemElement>, nodes: Set<string> | null, analysis: Analysis | null, errors: string[], warnings: string[]): find is Find {
  if (!isObj(find)) {
    errors.push(tr(`${where}.find: 必须是对象，如 {"kind": "i", "el": "R1"}`, `${where}.find: must be an object, e.g. {"kind": "i", "el": "R1"}`));
    return false;
  }
  const kind = find.kind as string;
  if (!(KINDS as readonly string[]).includes(kind)) {
    errors.push(tr(`${where}.find.kind: 未知的量 "${String(kind)}"（可用：${KINDS.join(', ')}）`, `${where}.find.kind: unknown quantity "${String(kind)}" (available: ${KINDS.join(', ')})`));
    return false;
  }
  let ok = true;
  const el = (key: string) => {
    const r = find[key];
    if (typeof r !== 'string' || (els.size > 0 && !els.has(r))) {
      errors.push(tr(`${where}.find.${key}: 找不到元件 ${JSON.stringify(r)}（可用：${[...els.keys()].join(', ')}）`, `${where}.find.${key}: no element ${JSON.stringify(r)} (available: ${[...els.keys()].join(', ')})`));
      ok = false;
    }
  };
  const node = (n: unknown, label: string) => {
    if (typeof n !== 'string') {
      errors.push(tr(`${where}.find.${label}: 结点名必须是字符串`, `${where}.find.${label}: node names must be strings`));
      ok = false;
    } else if (nodes && !(nodes.has(n) || isGroundName(n))) {
      errors.push(
        tr(
          `${where}.find.${label}: 找不到结点 ${JSON.stringify(n)}——结点名来自 labels / terminals（地 = "0"），现有：${[...nodes].filter((x) => !x.startsWith('_')).join(', ') || '无'}`,
          `${where}.find.${label}: no node ${JSON.stringify(n)} — node names come from labels / terminals (ground = "0"); available: ${[...nodes].filter((x) => !x.startsWith('_')).join(', ') || 'none'}`,
        ),
      );
      ok = false;
    }
  };
  const pair = (key: string) => {
    const p = find[key];
    if (!Array.isArray(p) || p.length !== 2) {
      errors.push(tr(`${where}.find.${key}: 必须是两个结点名 ["a", "b"]`, `${where}.find.${key}: must be two node names ["a", "b"]`));
      ok = false;
    } else p.forEach((n, i) => node(n, `${key}[${i}]`));
  };
  switch (kind) {
    case 'v':
      if (find.el !== undefined) el('el');
      else if (Array.isArray(find.nodes) && find.nodes.length >= 1 && find.nodes.length <= 2) find.nodes.forEach((n, i) => node(n, `nodes[${i}]`));
      else {
        errors.push(tr(`${where}.find: "v" 需要 "el"（元件电压）或 "nodes": ["a"] / ["a", "b"]`, `${where}.find: "v" needs "el" (element voltage) or "nodes": ["a"] / ["a", "b"]`));
        ok = false;
      }
      break;
    case 'i':
    case 'p':
    case 'q':
    case 's':
    case 'pf':
    case 'meter':
      el('el');
      break;
    case 'req':
    case 'vth':
    case 'isc':
    case 'pmax':
      pair('port');
      if (find.exclude !== undefined) {
        if (!Array.isArray(find.exclude) || !find.exclude.every((x) => typeof x === 'string')) {
          errors.push(tr(`${where}.find.exclude: 必须是元件 ref 的数组，如 ["RL"]`, `${where}.find.exclude: must be a list of element refs, e.g. ["RL"]`));
          ok = false;
        } else
          for (const r of find.exclude as string[])
            if (els.size > 0 && !els.has(r)) {
              errors.push(tr(`${where}.find.exclude: 找不到元件 ${JSON.stringify(r)}`, `${where}.find.exclude: no element ${JSON.stringify(r)}`));
              ok = false;
            }
      }
      break;
    case 'w':
    case 'val':
      if (typeof find.el !== 'string' || (els.size > 0 && !els.has(find.el))) el('el');
      break;
    case 'wattmeter':
      el('current');
      pair('nodes');
      break;
    case 'root':
      if (!(typeof find.n === 'number' && Number.isInteger(find.n) && find.n >= 1)) {
        errors.push(tr(`${where}.find.n: 必须是 1、2、… （第几个固有频率）`, `${where}.find.n: must be 1, 2, … (which natural frequency)`));
        ok = false;
      }
      break;
    case 'alpha':
    case 'omega_d':
    case 'omega0':
      break;
    case 'Q':
      if (find.port !== undefined) pair('port');
      break;
    case 'fc':
    case 'bw':
      if (!Array.isArray(find.out) || find.out.length < 1 || find.out.length > 2) {
        errors.push(tr(`${where}.find.out: 必须是 ["a"] 或 ["a", "b"]`, `${where}.find.out: must be ["a"] or ["a", "b"]`));
        ok = false;
      } else find.out.forEach((n, i) => node(n, `out[${i}]`));
      el('input');
      if (kind === 'fc' && find.which !== undefined && find.which !== 'low' && find.which !== 'high') {
        errors.push(tr(`${where}.find.which: 必须是 "low" 或 "high"`, `${where}.find.which: must be "low" or "high"`));
        ok = false;
      }
      break;
    case 'gain':
      if (!Array.isArray(find.out) || find.out.length < 1 || find.out.length > 2) {
        errors.push(tr(`${where}.find.out: 必须是 ["a"] 或 ["a", "b"]`, `${where}.find.out: must be ["a"] or ["a", "b"]`));
        ok = false;
      } else find.out.forEach((n, i) => node(n, `out[${i}]`));
      el('input');
      break;
    case 'f0':
      if (find.port !== undefined) pair('port');
      break;
    case 'twoport':
      if (!Array.isArray(find.ports) || find.ports.length !== 2) {
        errors.push(tr(`${where}.find.ports: 必须是 [["a","b"], ["c","d"]]`, `${where}.find.ports: must be [["a","b"], ["c","d"]]`));
        ok = false;
      } else
        find.ports.forEach((p, i) => {
          if (!Array.isArray(p) || p.length !== 2) {
            errors.push(tr(`${where}.find.ports[${i}]: 必须是两个结点名`, `${where}.find.ports[${i}]: must be two node names`));
            ok = false;
          } else p.forEach((n, j) => node(n, `ports[${i}][${j}]`));
        });
      break;
  }
  if (find.deriv !== undefined) {
    if (find.deriv !== 1 || (kind !== 'v' && kind !== 'i')) {
      errors.push(tr(`${where}.find.deriv: 只能是 1，且只用于 "v" / "i"`, `${where}.find.deriv: must be 1, and only for "v" / "i"`));
      ok = false;
    } else if (analysis && analysis.type !== 'tran')
      errors.push(tr(`${where}.find.deriv: 只有暂态分析（tran）才能求导数`, `${where}.find.deriv: derivatives are only available in transient analysis (tran)`));
  }
  for (const k of ['freq', 'omega'] as const)
    if (find[k] !== undefined) {
      if (!(typeof find[k] === 'number' && (find[k] as number) > 0)) {
        errors.push(tr(`${where}.find.${k}: 必须是正数`, `${where}.find.${k}: must be a positive number`));
        ok = false;
      } else if (analysis && analysis.type !== 'ac')
        errors.push(tr(`${where}.find.${k}: 只有正弦稳态（ac）题才能改频率`, `${where}.find.${k}: only AC problems can override the frequency`));
    }
  if (find.part !== undefined && !PARTS.includes(find.part as Part)) {
    errors.push(tr(`${where}.find.part: 必须是 ${PARTS.join(' / ')}`, `${where}.find.part: must be ${PARTS.join(' / ')}`));
    ok = false;
  }
  if (analysis && analysis.type !== 'ac' && kind !== 'root' && find.part !== undefined && find.part !== 're')
    warnings.push(tr(`${where}.find.part: "${String(find.part)}" 只对正弦稳态（ac）有意义`, `${where}.find.part: "${String(find.part)}" only makes sense for sinusoidal steady state (ac)`));
  if (find.t !== undefined) {
    if (!(typeof find.t === 'number' && find.t >= 0) && !TIMES.includes(find.t as string)) {
      errors.push(tr(`${where}.find.t: 必须是 ≥ 0 的秒数，或 "0-" / "0+" / "inf"`, `${where}.find.t: must be a time ≥ 0 in seconds, or "0-" / "0+" / "inf"`));
      ok = false;
    } else if (analysis && analysis.type !== 'tran')
      warnings.push(tr(`${where}.find.t: 只有暂态分析（tran）才用 "t"`, `${where}.find.t: "t" is only used by transient analysis (tran)`));
  } else if (analysis?.type === 'tran' && !TIMELESS.includes(kind))
    errors.push(tr(`${where}.find.t: 暂态题必须给出时刻 "t"（秒，或 "0-" / "0+" / "inf"）`, `${where}.find.t: transient questions need a time "t" (seconds, or "0-" / "0+" / "inf")`));
  return ok;
}

function parseAnalysis(raw: unknown, errors: string[]): Analysis | null {
  if (!isObj(raw)) {
    errors.push(tr('"analysis" 必须是对象：{"type": "dc"} / {"type": "ac", "freq": 50} / {"type": "tran"}', '"analysis" must be an object: {"type": "dc"} / {"type": "ac", "freq": 50} / {"type": "tran"}'));
    return null;
  }
  if (raw.type === 'dc') return { type: 'dc' };
  if (raw.type === 'tran') {
    if (raw.tstop !== undefined && !(typeof raw.tstop === 'number' && raw.tstop > 0)) errors.push(tr('analysis.tstop: 必须是正数（秒）', 'analysis.tstop: must be a positive number (seconds)'));
    return { type: 'tran', ...(typeof raw.tstop === 'number' ? { tstop: raw.tstop } : {}) };
  }
  if (raw.type === 'ac') {
    const freq = typeof raw.freq === 'number' ? raw.freq : undefined;
    const omega = typeof raw.omega === 'number' ? raw.omega : undefined;
    if (!((freq ?? 0) > 0) && !((omega ?? 0) > 0)) errors.push(tr('analysis: 正弦稳态需要 "freq"（Hz）或 "omega"（rad/s），且大于 0', 'analysis: sinusoidal steady state needs "freq" (Hz) or "omega" (rad/s), greater than 0'));
    if (freq !== undefined && omega !== undefined && Math.abs(2 * Math.PI * freq - omega) > 1e-6 * omega)
      errors.push(tr('analysis: "freq" 和 "omega" 不一致（ω = 2πf），只写一个', 'analysis: "freq" and "omega" disagree (ω = 2πf); give only one'));
    if (raw.phasor !== undefined && raw.phasor !== 'rms' && raw.phasor !== 'peak') errors.push(tr('analysis.phasor: 必须是 "rms" 或 "peak"', 'analysis.phasor: must be "rms" or "peak"'));
    return { type: 'ac', ...(freq !== undefined ? { freq } : {}), ...(omega !== undefined ? { omega } : {}), ...(raw.phasor === 'peak' || raw.phasor === 'rms' ? { phasor: raw.phasor } : {}) };
  }
  errors.push(tr(`analysis.type: 必须是 "dc" / "ac" / "tran"（现在是 ${JSON.stringify(raw.type)}）`, `analysis.type: must be "dc" / "ac" / "tran" (it is ${JSON.stringify(raw.type)})`));
  return null;
}

/** Default symbol of an auto-added reference mark: i_R1, u_R1 (zh) / v_R1 (en). */
/** Auto mark names use u for voltage in both languages (textbook notation, see docs/NOTATION.md). */
const markName = (kind: 'i' | 'v', el: string) => `${kind === 'i' ? 'i' : 'u'}_${el}`;

export interface ParseProblemOptions {
  /**
   * Recompute every numeric answer with the analysis engine (default true). Built-in problems
   * skip this at runtime: they are already verified by `npm run validate` and the test suite,
   * and recomputing ~200 problems would block the page for most of a second.
   */
  verify?: boolean;
}

export function parseProblem(json: unknown, source = 'folder', file?: string, opts: ParseProblemOptions = {}): ProblemValidation {
  const verify = opts.verify ?? true;
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isObj(json)) return { ok: false, errors: [tr('文件内容必须是一个 JSON 对象 { ... }', 'The file must contain one JSON object { ... }')], warnings };

  if (json.format !== PROBLEM_FORMAT_ID) errors.push(tr(`"format" 必须是 "${PROBLEM_FORMAT_ID}"（现在是 ${JSON.stringify(json.format)}）`, `"format" must be "${PROBLEM_FORMAT_ID}" (it is ${JSON.stringify(json.format)})`));
  const id = typeof json.id === 'string' ? json.id : '';
  if (!/^[a-z0-9][a-z0-9-_]*$/i.test(id)) errors.push(tr('"id" 必须是由字母、数字、- 或 _ 组成的字符串', '"id" must be a string of letters, digits, - or _'));
  const chapter = typeof json.chapter === 'string' ? json.chapter : '';
  if (!chapterById(chapter))
    errors.push(tr(`"chapter" ${JSON.stringify(json.chapter)} 不存在（可用：${CHAPTERS.map((c) => c.id).join(', ')}）`, `"chapter" ${JSON.stringify(json.chapter)} doesn't exist (available: ${CHAPTERS.map((c) => c.id).join(', ')})`));
  const title = typeof json.title === 'string' ? json.title : '';
  if (!title) errors.push(tr('"title" 不能为空', '"title" must not be empty'));
  const level = json.level;
  if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > 5) errors.push(tr('"level" 必须是 1–5 的整数', '"level" must be an integer 1–5'));
  const statement = textOf(json.statement);
  if (!statement) errors.push(tr('"statement" 不能为空（题干）', '"statement" must not be empty (the problem text)'));
  if (json.tags !== undefined && (!Array.isArray(json.tags) || strs(json.tags).length !== json.tags.length)) errors.push(tr('"tags" 必须是字符串数组', '"tags" must be an array of strings'));

  // ---- schematic → netlist ----
  let netlist: Netlist | null = null;
  let aliases: string[] = [];
  const rawS = json.schematic;
  let schematic: Schematic | null = null;
  if (!isObj(rawS) || !Array.isArray(rawS.elements) || !Array.isArray(rawS.wires)) {
    errors.push(tr('"schematic" 必须是 { "elements": [...], "wires": [...] }', '"schematic" must be { "elements": [...], "wires": [...] }'));
  } else {
    schematic = rawS as unknown as Schematic;
    try {
      const r = extractNetlist(schematic);
      errors.push(...r.errors);
      warnings.push(...r.warnings);
      if (r.errors.length === 0) netlist = r.netlist;
      aliases = r.aliases ? [...r.aliases.keys()] : [];
    } catch (e) {
      errors.push(tr(`schematic: 无法解析电路图：${(e as Error).message}`, `schematic: can't read the drawing: ${(e as Error).message}`));
    }
  }
  if (netlist && verify) {
    // element values (numbers / SI strings, sources, controls, couplings) must be readable by the engine and the renderer
    try {
      new Circuit(netlist);
    } catch (e) {
      errors.push(tr(`schematic: 元件参数有误：${(e as Error).message}`, `schematic: invalid element value: ${(e as Error).message}`));
      netlist = null;
    }
  }
  const els = schematic ? elementRefs(schematic) : new Map<string, ProblemElement>();
  const nodes = netlist ? new Set([...netlist.nodes, ...aliases]) : null;

  const analysis = parseAnalysis(json.analysis, errors);

  // ---- questions ----
  const questions: Question[] = [];
  const computed: Record<string, number> = {};
  if (!Array.isArray(json.questions) || json.questions.length === 0) errors.push(tr('"questions" 必须是非空数组', '"questions" must be a non-empty array'));
  const qids = new Set<string>();
  (Array.isArray(json.questions) ? json.questions : []).forEach((q: unknown, i: number) => {
    let w = `questions[${i}]`;
    if (!isObj(q)) return errors.push(tr(`${w}: 必须是对象`, `${w}: must be an object`));
    const qid = typeof q.id === 'string' ? q.id : '';
    if (!qid) errors.push(tr(`${w}: 缺少 "id"（例如 "a"、"q1"）`, `${w}: missing "id" (e.g. "a", "q1")`));
    else if (qids.has(qid)) errors.push(tr(`${w}: id "${qid}" 重复`, `${w}: duplicate id "${qid}"`));
    qids.add(qid);
    if (qid) w = `${w} (${qid})`;
    const ask = textOf(q.ask);
    if (!ask) errors.push(tr(`${w}: "ask" 不能为空`, `${w}: "ask" must not be empty`));
    const out: Question = { id: qid, ask };
    if (typeof q.explain === 'string' || Array.isArray(q.explain)) out.explain = textOf(q.explain);
    if (q.tol !== undefined) {
      if (typeof q.tol !== 'number' || !(q.tol > 0 && q.tol < 1)) errors.push(tr(`${w}: "tol" 必须是 0–1 之间的相对误差，如 0.02`, `${w}: "tol" must be a relative tolerance between 0 and 1, e.g. 0.02`));
      else out.tol = q.tol;
    }
    if (q.find !== undefined) {
      if (q.choices !== undefined) errors.push(tr(`${w}: 不能同时有 "find" 和 "choices"`, `${w}: can't have both "find" and "choices"`));
      if (typeof q.answer !== 'number' || !Number.isFinite(q.answer))
        errors.push(tr(`${w}: 计算题必须有数值 "answer"（SI 基本单位：V、A、W、Ω、Hz、s；相位用度）`, `${w}: a "find" question needs a numeric "answer" (SI base units: V, A, W, Ω, Hz, s; phase in degrees)`));
      if (typeof q.unit === 'string') out.unit = q.unit;
      else warnings.push(tr(`${w}: 没有 "unit"——学生不知道答案用什么单位（如 "V"、"mA"、"Ω"、"°"；无量纲写 ""）`, `${w}: no "unit" — the student can't tell what unit to answer in (e.g. "V", "mA", "Ω", "°"; "" if dimensionless)`));
      if (checkFind(q.find, w, els, nodes, analysis, errors, warnings)) {
        out.find = q.find as Find;
        if (typeof q.answer === 'number') out.answer = q.answer;
        if (verify && netlist && analysis && typeof q.answer === 'number' && qid) {
          try {
            const v = computeQuantity(netlist, analysis, out.find);
            computed[qid] = v;
            if (!answersAgree(q.answer, v, isPhaseQuestion(out)))
              errors.push(
                tr(
                  `${w}: 答案不对——作者写的 answer = ${fmtNum(q.answer)}，引擎算出 ${fmtNum(v)}（相差超过 0.5%）。请重新计算（注意参考方向和单位：answer 用 SI 基本单位）`,
                  `${w}: wrong answer — the file says answer = ${fmtNum(q.answer)}, the engine computes ${fmtNum(v)} (more than 0.5% apart). Recompute it (mind the reference directions and units: answer is in SI base units)`,
                ),
              );
          } catch (e) {
            errors.push(tr(`${w}: 引擎无法计算这个量：${(e as Error).message}`, `${w}: the engine can't compute this quantity: ${(e as Error).message}`));
          }
        }
      }
    } else if (q.choices !== undefined) {
      const choices = strs(q.choices);
      if (!Array.isArray(q.choices) || choices.length !== q.choices.length || choices.length < 2)
        errors.push(tr(`${w}: "choices" 必须是至少 2 个字符串的数组`, `${w}: "choices" must be an array of at least 2 strings`));
      if (typeof q.correct !== 'number' || !Number.isInteger(q.correct) || q.correct < 0 || q.correct >= choices.length)
        errors.push(tr(`${w}: "correct" 必须是正确选项的下标（从 0 开始，0–${Math.max(0, choices.length - 1)}）`, `${w}: "correct" must be the index of the right choice (from 0, 0–${Math.max(0, choices.length - 1)})`));
      out.choices = choices;
      if (typeof q.correct === 'number') out.correct = q.correct;
      if (q.choiceExplain !== undefined) {
        const ce = Array.isArray(q.choiceExplain) ? q.choiceExplain.map((x) => (typeof x === 'string' ? x : '')) : [];
        if (!Array.isArray(q.choiceExplain) || ce.length !== choices.length)
          errors.push(tr(`${w}: "choiceExplain" 必须是和 "choices" 一样长的字符串数组（没有解释的选项写 ""）`, `${w}: "choiceExplain" must be an array of strings as long as "choices" ("" for an option without one)`));
        else out.choiceExplain = ce;
      }
    } else
      errors.push(tr(`${w}: 需要 "find" + "answer"（计算题）或 "choices" + "correct"（选择题）`, `${w}: needs "find" + "answer" (numeric) or "choices" + "correct" (multiple choice)`));
    questions.push(out);
  });

  const hints = strs(json.hints);
  const solution = textOf(json.solution);
  if (hints.length === 0) warnings.push(tr('没有 "hints"：学生卡住时没有提示', 'no "hints": nothing to help a student who is stuck'));
  if (!solution) warnings.push(tr('没有 "solution"：没有完整解答过程', 'no "solution": there is no worked solution'));

  // ---- translations ----
  const baseLang: Lang = isLang(json.lang) ? json.lang : 'zh';
  const langList = LANGS.map((l) => `"${l}"`).join(' / ');
  if (json.lang !== undefined && !isLang(json.lang)) errors.push(tr(`"lang" 必须是 ${langList}`, `"lang" must be ${langList}`));
  const rawNotes = schematic && Array.isArray(schematic.notes) ? schematic.notes : [];
  let tx: Record<string, unknown> = {};
  let translated = false;
  if (json.i18n !== undefined) {
    if (!isObj(json.i18n)) errors.push(tr('"i18n" 必须是对象，如 { "en": { "title": "..." } }', '"i18n" must be an object, e.g. { "en": { "title": "..." } }'));
    else
      for (const [l, v] of Object.entries(json.i18n)) {
        if (!isLang(l)) errors.push(tr(`i18n: 不支持的语言 "${l}"（可用：${LANGS.join(', ')}）`, `i18n: unsupported language "${l}" (available: ${LANGS.join(', ')})`));
        else if (!isObj(v)) errors.push(tr(`i18n.${l}: 必须是对象`, `i18n.${l}: must be an object`));
        else {
          if (l !== baseLang) translated = true;
          const count = (key: string, n: number) => {
            if (v[key] !== undefined && (!Array.isArray(v[key]) || (v[key] as unknown[]).length !== n))
              warnings.push(tr(`i18n.${l}.${key}: 应该是和 "${key}" 一一对应的数组（${n} 项）`, `i18n.${l}.${key}: should be an array matching "${key}" item by item (${n} items)`));
          };
          count('hints', hints.length);
          count('tags', strs(json.tags).length);
          count('questions', questions.length);
          if (v.notes !== undefined) count('notes', rawNotes.length);
          if (Array.isArray(v.questions))
            v.questions.forEach((tq: unknown, i: number) => {
              const q = questions[i];
              if (q && isObj(tq) && tq.choices !== undefined && (!Array.isArray(tq.choices) || tq.choices.length !== (q.choices?.length ?? 0)))
                warnings.push(tr(`i18n.${l}.questions[${i}].choices: 数量应该和原文一样（${q.choices?.length ?? 0} 项）`, `i18n.${l}.questions[${i}].choices: should have the same count as the original (${q.choices?.length ?? 0})`));
            });
          if (l === getLang() && l !== baseLang) tx = v;
        }
      }
  }
  if (!translated) warnings.push(tr(`没有翻译：请在 "i18n" 里加上${baseLang === 'zh' ? '英文（en）' : '中文（zh）'}版本`, `no translation: add the ${baseLang === 'zh' ? 'English (en)' : 'Chinese (zh)'} text in "i18n"`));

  const txHints = strs(tx.hints);
  const txQs = Array.isArray(tx.questions) ? tx.questions : [];
  const locQuestions = questions.map((q, i) => {
    const t = txQs[i];
    if (!isObj(t)) return q;
    const r = { ...q };
    if (textOf(t.ask)) r.ask = textOf(t.ask);
    if (textOf(t.explain)) r.explain = textOf(t.explain);
    const ch = strs(t.choices);
    if (q.choices && ch.length === q.choices.length) r.choices = ch;
    if (q.choiceExplain && Array.isArray(t.choiceExplain) && t.choiceExplain.length === q.choiceExplain.length)
      r.choiceExplain = t.choiceExplain.map((x, k) => (typeof x === 'string' && x ? x : q.choiceExplain![k]));
    return r;
  });
  const txNotes = Array.isArray(tx.notes) ? tx.notes : [];
  const lang = getLang();

  // ---- reference marks for asked element currents / voltages ----
  let outSchematic: Schematic | null = null;
  if (schematic) {
    const marks = [...(Array.isArray(schematic.marks) ? schematic.marks : [])];
    for (const q of questions) {
      const f = q.find;
      if (!f || (f.kind !== 'i' && f.kind !== 'v') || !('el' in f) || typeof f.el !== 'string') continue;
      const el = f.el;
      // two-terminal elements take both kinds; an op-amp only its output current (arrow out of the output)
      const t = els.get(el);
      if (!t || !(isTwoTerminal(t) || (t.type === 'OPAMP' && f.kind === 'i'))) continue;
      if (!marks.some((m) => m.kind === f.kind && m.el === el)) marks.push({ kind: f.kind, el, name: markName(f.kind, el) });
    }
    outSchematic = {
      ...schematic,
      marks,
      notes: rawNotes.map((n, i) => {
        const t = txNotes[i];
        const own = isObj(n) && isObj(n.i18n) ? (n.i18n as Record<string, unknown>)[lang] : undefined;
        const text = typeof t === 'string' && t ? t : typeof own === 'string' && own && lang !== baseLang ? own : n.text;
        return { ...n, text };
      }),
    };
  }

  const ok = errors.length === 0;
  const problem: Problem | undefined =
    ok && netlist && analysis && outSchematic
      ? {
          id,
          chapter,
          title: typeof tx.title === 'string' && tx.title ? tx.title : title,
          level: level as number,
          // i18n.<lang>.tags is an extension of ProblemText (by position, like hints)
          tags: strs(tx.tags).length === strs(json.tags).length && strs(json.tags).length ? strs(tx.tags) : strs(json.tags),
          statement: textOf(tx.statement) || statement,
          schematic: outSchematic,
          analysis,
          questions: locQuestions,
          hints: txHints.length === hints.length && hints.length ? txHints : hints,
          solution: textOf(tx.solution) || solution,
          netlist,
          computed,
          textLang: Object.keys(tx).length ? lang : baseLang,
          source,
          file,
        }
      : undefined;
  return { ok: ok && !!problem, errors, warnings, problem };
}

/** Type guard used by loaders to route a parsed JSON file to the right parser. */
export const isProblemJson = (json: unknown): boolean => isObj(json) && typeof json.format === 'string' && json.format.startsWith('circuit-problem');

// ---------------------------------------------------------------------------------------
// Student answers
// ---------------------------------------------------------------------------------------

const SI_PREFIX: Record<string, number> = { p: 1e-12, n: 1e-9, u: 1e-6, µ: 1e-6, μ: 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };

/** Base units the student may type, with aliases → canonical symbol. */
const UNIT_ALIASES: Record<string, string> = {
  v: 'V', 伏: 'V', 伏特: 'V',
  a: 'A', 安: 'A', 安培: 'A',
  w: 'W', 瓦: 'W', 瓦特: 'W',
  var: 'var', 乏: 'var',
  va: 'VA', 伏安: 'VA',
  ω: 'Ω', ohm: 'Ω', ohms: 'Ω', 欧: 'Ω', 欧姆: 'Ω',
  s: 's', sec: 's', 秒: 's',
  siemens: 'S',
  hz: 'Hz', 赫: 'Hz', 赫兹: 'Hz',
  f: 'F', 法: 'F',
  h: 'H', 亨: 'H',
  '°': '°', deg: '°', 度: '°',
  db: 'dB',
  'rad/s': 'rad/s',
  rad: 'rad', 弧度: 'rad',
  j: 'J', 焦: 'J', 焦耳: 'J',
  'v/v': 'V/V', 'a/a': 'A/A', 'v/s': 'V/s', 'a/s': 'A/s',
};

/** Canonical unit for a unit string (no prefix), or null. Case matters only for S vs s. */
function canonUnit(u: string): string | null {
  if (u === 'S') return 'S';
  if (u === 'Ω' || u === 'Ω') return 'Ω';
  return UNIT_ALIASES[u.toLowerCase()] ?? null;
}

/** Split "kΩ" → {scale: 1e3, unit: 'Ω'}; "m" → {scale 1e-3, unit: ''}; "" → {1, ''}. null if unreadable. */
export function splitUnit(raw: string): { scale: number; unit: string } | null {
  const s = raw.trim();
  if (!s) return { scale: 1, unit: '' };
  const whole = canonUnit(s);
  // a bare "m"/"M"/"k" … is a prefix, but "S", "s", "F", "H", "A", "V", "W" are units
  if (whole && !(s.length === 1 && s in SI_PREFIX)) return { scale: 1, unit: whole };
  if (s.length === 1 && s in SI_PREFIX) return { scale: SI_PREFIX[s], unit: '' };
  const p = s[0];
  if (p in SI_PREFIX) {
    const rest = canonUnit(s.slice(1));
    if (rest) return { scale: SI_PREFIX[p], unit: rest };
  }
  return null;
}

/** Normalise full-width digits / signs / separators that Chinese IMEs produce. */
function normalizeInput(input: string): string {
  let s = input
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[−－–—﹣]/g, '-')
    .replace(/[＋]/g, '+')
    .replace(/[．。]/g, '.')
    .replace(/[，、]/g, ',')
    .replace(/[ＥｅＥ]/g, 'e')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/／/g, '/')
    .replace(/＊/g, '*')
    .replace(/％/g, '%')
    .replace(/＾/g, '^')
    .replace(/º/g, '°')
    .replace(/Ω/g, 'Ω')
    .replace(/\/_/g, '∠')
    .replace(/\s+/g, '');
  // "1,234.5" → thousands separators; a lone "1,5" → decimal comma
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?/.test(s)) s = s.replace(/,/g, '');
  else s = s.replace(',', '.');
  // 1.2x10^-3, 2x3 → multiplication; the old "1.2×10-3" shorthand (exponent without ^) → 1.2e-3
  s = s.replace(/(\d)[xX](?=[\d(.])/g, '$1*');
  s = s.replace(/^([+-]?(?:\d+\.?\d*|\.\d+))[×*·]10(-\d+)$/, '$1e$2');
  // superscript exponents: 10⁻³ → 10^(-3)
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  s = s.replace(/([⁻⁺]?)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, sg: string, d: string) => `^(${sg === '⁻' ? '-' : ''}${[...d].map((c) => SUP.indexOf(c)).join('')})`);
  return s;
}

export interface AnswerCheck {
  ok: boolean;
  /** the student's value in SI base units */
  value?: number;
  /** why it can't be accepted / a nudge (sign, prefix …) — already localised */
  reason?: string;
  /** wrong, but within a few percent: a rounding problem rather than a wrong method */
  close?: boolean;
  /** which mistake was recognised (for tests / analytics) */
  diagnosis?: 'sign' | 'close' | 'e3' | 'e6' | 'e9' | 'sqrt2' | 'sqrt3' | '2pi' | 'recip' | 'rad' | 'phase180';
}

/** relative tolerance used when a question has no `tol` */
export const DEFAULT_TOL = 0.02;
/** absolute tolerance for angles (degrees, compared modulo 360°) */
export const PHASE_TOL_DEG = 1;
/** "very close" band: within this relative error (5°/… for angles) the student hears "check the rounding" */
const CLOSE_REL = 0.05;
const CLOSE_DEG = 5;

/** The tolerance a question's answer is judged with, for display: "±2%" or "±1°". */
export function answerTolerance(q: Pick<Question, 'unit' | 'tol'> & { find?: { part?: Part } }): string {
  if (isPhaseQuestion(q)) return `±${PHASE_TOL_DEG}°`;
  return `±${fmtNum((q.tol ?? DEFAULT_TOL) * 100)}%`;
}

const answerExamples = () => tr('例如 2.5、-3m、4.7k、1.2e-3、12/6、2√2、sqrt(2)、π/6、60%、4∠30', 'e.g. 2.5, -3m, 4.7k, 1.2e-3, 12/6, 2√2, sqrt(2), π/6, 60%, 4∠30');

function exprMessage(e: ExprError, input: string): string {
  const shown = input.trim();
  switch (e.code) {
    case 'name':
      return tr(`不认识“${e.name}”。可以写数字、算式和单位，${answerExamples()}`, `Unknown word "${e.name}". Type a number or a calculation with an optional unit, ${answerExamples()}`);
    case 'char':
      return tr(`答案里不能有“${e.char}”。${answerExamples()}`, `"${e.char}" can't appear in an answer. ${answerExamples()}`);
    case 'div0':
      return tr('算式里除以了 0', 'The calculation divides by 0');
    case 'nan':
      return tr('这个算式算不出一个有限的数（负数开方？数太大？）', "That calculation doesn't give a finite number (square root of a negative? too large?)");
    default:
      return tr(`看不懂“${shown}”——请输入一个数或算式，${answerExamples()}`, `Can't read "${shown}" — type a number or a calculation, ${answerExamples()}`);
  }
}

const unitChar = (c: string | undefined) => !!c && c !== 'π' && (/\p{L}/u.test(c) || c === '°' || c === 'Ω');

/** Split a trailing unit ("2.5kΩ" → "2.5" + "kΩ", "π/6rad" → "π/6" + "rad"); "2pi" keeps its "pi". */
function splitSuffix(s: string): { body: string; suffix: string } {
  let i = s.length;
  while (i > 0 && (unitChar(s[i - 1]) || (s[i - 1] === '/' && unitChar(s[i]) && unitChar(s[i - 2])))) i--;
  const run = s.slice(i);
  for (let k = 0; k < run.length; k++) {
    const suf = run.slice(k);
    if (suf[0] !== '/' && splitUnit(suf)) return { body: s.slice(0, i + k), suffix: suf };
  }
  return { body: s, suffix: '' };
}

type Quantity1 = { value: number; unit: string; scaled: boolean; suffix: string };

/** One number / calculation with an optional unit suffix, scaled by the typed prefix. */
function readQuantity(text: string, input: string): Quantity1 | { reason: string } {
  const { body, suffix } = splitSuffix(text);
  if (!body) return { reason: suffix ? tr(`“${suffix}”前面要有一个数`, `Put a number before "${suffix}"`) : tr('请先输入一个数', 'Type a number first') };
  const r = evalExpr(body);
  if ('error' in r) return { reason: exprMessage(r.error, input) };
  const u = suffix ? splitUnit(suffix)! : { scale: 1, unit: '' };
  return { value: r.value * u.scale, unit: u.unit, scaled: !!suffix || r.prefixed, suffix };
}

const wrongUnit = (q: Pick<Question, 'unit'>, suffix: string) =>
  ({ reason: tr(`单位不对：这里要的是 ${q.unit}，你写的是 ${suffix}`, `Wrong unit: this asks for ${q.unit}, you wrote ${suffix}`) });

const RAD = 180 / Math.PI;

/** Read the student's input as a number in SI base units (degrees for angles), honouring prefixes,
 *  the question's unit, simple calculations ("12/6", "2√2", "π/6 rad") and polar form ("4∠30"). */
export function readAnswer(
  q: Pick<Question, 'unit'> & { find?: { part?: Part } },
  input: string,
): { value: number; unit?: string } | { reason: string } {
  // "-2 1/s", "3 s⁻¹": the unit 1/s can't be told apart from a division once spaces are gone
  let raw = input.trim();
  const perSecond = /(?:\s+1\/s|\s*s⁻¹|\s*s\^-1)$/.exec(raw);
  if (perSecond && perSecond.index > 0) {
    if (q.unit !== '1/s') return wrongUnit(q, perSecond[0].trim());
    raw = raw.slice(0, perSecond.index);
  }
  const s = normalizeInput(raw);
  if (!s) return { reason: tr('请先输入一个数', 'Type a number first') };
  const phase = isPhaseQuestion(q);
  const expected = splitUnit(q.unit ?? '');
  const sides = s.split('∠');
  if (sides.length > 2) return { reason: exprMessage({ code: 'syntax' }, input) };

  const asAngle = (r: Quantity1) => {
    if (r.unit && r.unit !== '°' && r.unit !== 'rad') return { reason: tr(`角度的单位应该是 ° 或 rad，你写的是 ${r.suffix}`, `An angle is in ° or rad, you wrote ${r.suffix}`) };
    return { value: r.unit === 'rad' ? r.value * RAD : r.value, unit: r.unit || undefined };
  };
  const asValue = (r: Quantity1) => {
    if (r.unit && expected?.unit && r.unit !== expected.unit) return wrongUnit(q, r.suffix);
    // nothing typed after the number → it is in the unit shown next to the box (which may be "mA", "kΩ" …)
    const v = r.scaled ? r.value : r.value * (expected?.scale ?? 1);
    if (!Number.isFinite(v)) return { reason: tr('这个数太大了', 'That number is too large') };
    return { value: v, unit: r.unit || undefined };
  };

  if (sides.length === 2) {
    const m = readQuantity(sides[0], input);
    if ('reason' in m) return m;
    const a = readQuantity(sides[1], input);
    if ('reason' in a) return a;
    const ang = asAngle(a);
    if ('reason' in ang) return ang;
    if (phase) return ang;
    const mag = asValue(m);
    if ('reason' in mag) return mag;
    const part = q.find?.part;
    const k = part === 're' ? Math.cos(ang.value / RAD) : part === 'im' ? Math.sin(ang.value / RAD) : 1;
    return { value: mag.value * k, unit: mag.unit };
  }
  const r = readQuantity(s, input);
  if ('reason' in r) return r;
  return phase ? asAngle(r) : asValue(r);
}

/** Check a student's numeric answer against q.answer: relative tolerance q.tol ?? 2 %; angles ±1° modulo 360°.
 *  Wrong answers are diagnosed (sign, prefix, √2, √3, 2π, reciprocal, radians, rounding). */
export function checkAnswer(q: Question, input: string): AnswerCheck {
  if (typeof q.answer !== 'number') return { ok: false, reason: tr('这道题没有数值答案', 'This question has no numeric answer') };
  const r = readAnswer(q, input);
  if ('reason' in r) return { ok: false, reason: r.reason };
  const v = r.value;
  const ans = q.answer;
  const tol = q.tol ?? DEFAULT_TOL;
  const no = (diagnosis: AnswerCheck['diagnosis'], reason: string): AnswerCheck => ({ ok: false, value: v, reason, diagnosis, close: diagnosis === 'close' || undefined });

  if (isPhaseQuestion(q)) {
    const d = angleDiff(v, ans);
    if (d <= PHASE_TOL_DEG) return { ok: true, value: v };
    if (r.unit !== 'rad' && Math.abs(v) <= 2 * Math.PI + 0.01 && angleDiff(v * RAD, ans) <= PHASE_TOL_DEG)
      return no(
        'rad',
        tr(
          `看起来你填的是弧度（${fmtNum(v)} rad = ${fmtNum(parseFloat((v * RAD).toPrecision(4)))}°）——这里默认按度（°）读；用弧度请写成“${fmtNum(v)} rad”。`,
          `Looks like radians (${fmtNum(v)} rad = ${fmtNum(parseFloat((v * RAD).toPrecision(4)))}°) — a bare number is read in degrees; write "${fmtNum(v)} rad" to use radians.`,
        ),
      );
    if (d <= CLOSE_DEG)
      return no('close', tr(`非常接近了！差了 ${fmtNum(parseFloat(d.toPrecision(2)))}°，允许误差 ±${PHASE_TOL_DEG}°——检查四舍五入，中间结果多保留几位有效数字。`, `Very close! ${fmtNum(parseFloat(d.toPrecision(2)))}° off, the tolerance is ±${PHASE_TOL_DEG}° — check your rounding and keep more significant figures in between.`));
    if (angleDiff(v, ans + 180) <= PHASE_TOL_DEG)
      return no('phase180', tr('差了 180°——相量方向反了？检查图上的参考方向。', 'Off by 180° — the phasor points the other way? Check the reference direction in the drawing.'));
    if (Math.abs(ans) > PHASE_TOL_DEG && angleDiff(-v, ans) <= PHASE_TOL_DEG)
      return no('sign', tr('大小对了，但角度的符号反了——是超前还是滞后？', 'Right size, wrong sign of the angle — leading or lagging?'));
    return { ok: false, value: v };
  }

  // (1 + 1e-9): an answer exactly on the edge (2.04 for 2 at ±2 %) is in, despite float rounding
  const lim = Math.max(tol * Math.abs(ans) * (1 + 1e-9), 1e-9);
  if (Math.abs(v - ans) <= lim) return { ok: true, value: v };
  if (Math.abs(ans) <= 1e-9 || v === 0) return { ok: false, value: v };
  if (Math.abs(v + ans) <= lim) return no('sign', tr('大小对了，但符号反了——再看看图上的参考方向。', 'Right size, wrong sign — check the reference direction in the drawing.'));
  const rel = Math.abs(v - ans) / Math.abs(ans);
  if (rel <= CLOSE_REL + 1e-9)
    return no(
      'close',
      tr(
        `非常接近了！差了 ${fmtNum(parseFloat((rel * 100).toPrecision(2)))}%，允许误差 ±${fmtNum(tol * 100)}%——检查四舍五入，中间结果多保留几位有效数字。`,
        `Very close! ${fmtNum(parseFloat((rel * 100).toPrecision(2)))}% off, the tolerance is ±${fmtNum(tol * 100)}% — check your rounding and keep more significant figures in between.`,
      ),
    );

  const ratio = Math.abs(v / ans);
  const near = (x: number, k: number) => Math.abs(x / k - 1) <= Math.max(tol, 0.01);
  const factor = (k: number) => near(ratio, k) || near(ratio, 1 / k);
  const signToo = v / ans < 0 ? tr('（而且符号也反了）', ' (and the sign is flipped too)') : '';
  if (factor(1e3))
    return no('e3', tr('数字对了，但差了 1000 倍——检查单位前缀（m、k、µ）。', 'Right digits, off by a factor of 1000 — check the unit prefix (m, k, µ).') + signToo);
  if (factor(1e6))
    return no('e6', tr('数字对了，但差了 10⁶ 倍——检查单位前缀：µ 和无前缀、m 和 k、无前缀和 M 是不是弄混了。', 'Right digits, off by a factor of 10⁶ — check the unit prefix: µ vs none, m vs k, or none vs M.') + signToo);
  if (factor(1e9))
    return no('e9', tr('数字对了，但差了 10⁹ 倍——检查单位前缀：n 和无前缀、µ 和 k、无前缀和 G 是不是弄混了。', 'Right digits, off by a factor of 10⁹ — check the unit prefix: n vs none, µ vs k, or none vs G.') + signToo);
  if (factor(Math.SQRT2))
    return no('sqrt2', tr('差了 √2 倍——峰值（幅值）和有效值弄混了？有效值 = 峰值 / √2。', 'Off by a factor of √2 — peak (amplitude) and RMS mixed up? RMS = peak / √2.') + signToo);
  if (factor(Math.sqrt(3)))
    return no('sqrt3', tr('差了 √3 倍——线电压/线电流和相电压/相电流弄混了？Y 接 U_线 = √3·U_相，Δ 接 I_线 = √3·I_相。', 'Off by a factor of √3 — line and phase quantities mixed up? Wye: U_line = √3·U_phase; delta: I_line = √3·I_phase.') + signToo);
  if (factor(2 * Math.PI))
    return no('2pi', tr('差了 2π 倍——角频率 ω（rad/s）和频率 f（Hz）弄混了？ω = 2πf。', 'Off by a factor of 2π — angular frequency ω (rad/s) and frequency f (Hz) mixed up? ω = 2πf.') + signToo);
  // reciprocal, compared in the unit shown next to the box (0.5 typed for 2 kΩ in a kΩ box)
  const shown = splitUnit(q.unit ?? '')?.scale ?? 1;
  if (near(Math.abs((v / shown) * (ans / shown)), 1))
    return no('recip', tr('像是倒数——电阻和电导（G = 1/R）、周期和频率（f = 1/T）、时间常数和 1/τ 是不是弄混了？', 'Looks like the reciprocal — resistance vs conductance (G = 1/R), period vs frequency (f = 1/T), or τ vs 1/τ mixed up?') + signToo);
  return { ok: false, value: v };
}

/** The answer formatted for display in the question's unit (e.g. 0.0025 A with unit "mA" → "2.5 mA"). */
export function formatAnswer(q: Pick<Question, 'answer' | 'unit'>): string {
  if (typeof q.answer !== 'number') return '';
  const u = splitUnit(q.unit ?? '');
  const scale = u?.scale ?? 1;
  const v = q.answer / scale;
  return `${fmtNum(parseFloat(v.toPrecision(4)))}${q.unit ? ` ${q.unit}` : ''}`;
}

// Re-exported for callers that only import from parse.ts
export type { ProblemFile };
