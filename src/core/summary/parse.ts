// Chapter summaries ("chapter-summary/1"): parsing, validation and localisation.
//
// Worked examples are verified exactly like problem answers: each example is turned into a
// circuit-problem/1 object and run through parseProblem (geometry → netlist → engine), so every
// `results[].answer` is recomputed. On top of that, every number with a unit that appears in the
// steps must be either given (in the drawing, the analysis settings or the statement) or one of
// the verified results — no unverified numbers in worked examples.

import { parseNum } from '../analysis';
import { getLang, isLang, LANGS, tr, type Lang } from '../i18n';
import { chapterById, CHAPTERS } from '../problem/chapters';
import { parseProblem, type Problem } from '../problem/parse';
import { PROBLEM_FORMAT_ID } from '../problem/types';
import { SUMMARY_FORMAT_ID } from './types';

export interface SummaryIdea {
  id: string;
  title: string;
  text: string;
  problems: string[];
}
export interface SummaryFormula {
  id: string;
  idea: string;
  name: string;
  expr: string;
  when: string;
  note?: string;
}
export interface SummaryExample {
  id: string;
  ideas: string[];
  /** title, statement, schematic, results (as questions) and steps (as solution), localised */
  problem: Problem;
}
export interface SummaryMistake {
  id: string;
  idea?: string;
  text: string;
}
export interface ChapterSummary {
  chapter: string;
  intro: string;
  ideas: SummaryIdea[];
  formulas: SummaryFormula[];
  examples: SummaryExample[];
  mistakes: SummaryMistake[];
  textLang: Lang;
}

export interface SummaryValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
  summary?: ChapterSummary;
}

export interface ParseSummaryOptions {
  /** recompute the worked examples with the engine (default true) */
  verify?: boolean;
  /** all known problems: every linked id must exist in the summary's chapter, and every problem
   *  of the chapter must be linked from at least one key idea */
  problems?: { id: string; chapter: string }[];
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const textOf = (v: unknown) => (typeof v === 'string' ? v : Array.isArray(v) ? strs(v).join('\n') : '');
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

export const isSummaryJson = (json: unknown): boolean => isObj(json) && typeof json.format === 'string' && json.format.startsWith('chapter-summary');

// ---------------------------------------------------------------- numbers in worked steps

const PREFIX: Record<string, number> = { p: 1e-12, n: 1e-9, µ: 1e-6, μ: 1e-6, u: 1e-6, m: 1e-3, k: 1e3, M: 1e6 };
// longest units first; "rad/s" before "s", "Hz" before "H", "VA" / "var" before "V"
const QTY_RE = /(^|[^\w.])([-−]?)(\d+(?:\.\d+)?)\s*(p|n|µ|μ|u|m|k|M)?(rad\/s|Hz|VA|var|Ω|V|A|W|S|F|H|J|s|°)(?![A-Za-z])/g;

/** Every "number + unit" in a text, in SI base units (degrees for °), with the matched text. */
export function quantitiesIn(text: string): { value: number; text: string }[] {
  const out: { value: number; text: string }[] = [];
  for (const m of text.matchAll(QTY_RE)) {
    const v = parseFloat(m[3]) * (m[4] ? PREFIX[m[4]] : 1);
    out.push({ value: m[2] ? -v : v, text: m[0].slice(m[1].length).trim() });
  }
  return out;
}

/** Every number in a JSON value (numbers and SI strings such as "4.7k"). */
function numbersIn(v: unknown, out: number[]) {
  if (typeof v === 'number') out.push(v);
  else if (typeof v === 'string') {
    try {
      out.push(parseNum(v, ''));
    } catch {
      /* not a number */
    }
  } else if (Array.isArray(v)) for (const x of v) numbersIn(x, out);
  else if (isObj(v)) for (const x of Object.values(v)) numbersIn(x, out);
}

/** Is |v| one of the known values (1 % — the text rounds to 3 significant digits)? Common angles always are. */
function isKnown(v: number, known: number[], unitIsDeg: boolean): boolean {
  const a = Math.abs(v);
  if (a < 1e-12) return true;
  if (unitIsDeg && Math.abs(a / 15 - Math.round(a / 15)) < 1e-9) return true;
  return known.some((k) => {
    const b = Math.abs(k);
    return Math.abs(a - b) <= Math.max(0.01 * b, 1e-12);
  });
}

// ---------------------------------------------------------------- parser

export function parseSummary(json: unknown, file?: string, opts: ParseSummaryOptions = {}): SummaryValidation {
  const verify = opts.verify ?? true;
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isObj(json)) return { ok: false, errors: [tr('文件内容必须是一个 JSON 对象 { ... }', 'The file must contain one JSON object { ... }')], warnings };
  if (json.format !== SUMMARY_FORMAT_ID)
    errors.push(
      tr(`"format" 必须是 "${SUMMARY_FORMAT_ID}"（现在是 ${JSON.stringify(json.format)}）`, `"format" must be "${SUMMARY_FORMAT_ID}" (it is ${JSON.stringify(json.format)})`),
    );
  const chapter = typeof json.chapter === 'string' ? json.chapter : '';
  if (!chapterById(chapter))
    errors.push(
      tr(
        `"chapter" ${JSON.stringify(json.chapter)} 不存在（可用：${CHAPTERS.map((c) => c.id).join(', ')}）`,
        `"chapter" ${JSON.stringify(json.chapter)} doesn't exist (available: ${CHAPTERS.map((c) => c.id).join(', ')})`,
      ),
    );
  else if (file) {
    const base = file
      .replace(/\\/g, '/')
      .split('/')
      .pop()!
      .replace(/\.json$/i, '');
    if (base !== chapter) warnings.push(tr(`文件名应该是 ${chapter}.json`, `the file should be named ${chapter}.json`));
  }
  const baseLang: Lang = isLang(json.lang) ? json.lang : 'zh';
  if (json.lang !== undefined && !isLang(json.lang))
    errors.push(tr(`"lang" 必须是 ${LANGS.map((l) => `"${l}"`).join(' / ')}`, `"lang" must be ${LANGS.map((l) => `"${l}"`).join(' / ')}`));
  const lang = getLang();
  const other: Lang = baseLang === 'zh' ? 'en' : 'zh';

  /** the item's translation into the current language (if it isn't the base language) */
  const txOf = (item: Record<string, unknown>, where: string): Record<string, unknown> => {
    const t = item.i18n;
    if (t === undefined) {
      warnings.push(tr(`${where}: 没有翻译（i18n.${other}）`, `${where}: no translation (i18n.${other})`));
      return {};
    }
    if (!isObj(t)) {
      errors.push(tr(`${where}.i18n: 必须是对象`, `${where}.i18n: must be an object`));
      return {};
    }
    for (const k of Object.keys(t)) if (!isLang(k)) errors.push(tr(`${where}.i18n: 不支持的语言 "${k}"`, `${where}.i18n: unsupported language "${k}"`));
    if (!isObj(t[other])) warnings.push(tr(`${where}: 没有翻译（i18n.${other}）`, `${where}: no translation (i18n.${other})`));
    return lang !== baseLang && isObj(t[lang]) ? (t[lang] as Record<string, unknown>) : {};
  };
  const loc = (tx: Record<string, unknown>, key: string, base: string) => textOf(tx[key]) || base;

  const uniq = (kind: string) => {
    const seen = new Set<string>();
    return (id: unknown, where: string): string => {
      const s = typeof id === 'string' ? id : '';
      if (!ID_RE.test(s)) errors.push(tr(`${where}: "id" 必须由字母、数字、- 或 _ 组成`, `${where}: "id" must be letters, digits, - or _`));
      else if (seen.has(s)) errors.push(tr(`${where}: ${kind} id "${s}" 重复`, `${where}: duplicate ${kind} id "${s}"`));
      seen.add(s);
      return s;
    };
  };
  const arr = (key: string, min: number): unknown[] => {
    const v = json[key];
    if (!Array.isArray(v)) {
      errors.push(tr(`"${key}" 必须是数组`, `"${key}" must be an array`));
      return [];
    }
    if (v.length < min) errors.push(tr(`"${key}" 至少要有 ${min} 项`, `"${key}" needs at least ${min} item(s)`));
    return v;
  };

  // ---- intro ----
  let intro = textOf(json.intro);
  if (json.intro !== undefined) intro = loc(txOf(json, '(top level)'), 'intro', intro);

  // ---- key ideas ----
  const ideas: SummaryIdea[] = [];
  const ideaId = uniq('idea');
  arr('ideas', 1).forEach((raw, i) => {
    let w = `ideas[${i}]`;
    if (!isObj(raw)) return errors.push(tr(`${w}: 必须是对象`, `${w}: must be an object`));
    const id = ideaId(raw.id, w);
    if (id) w = `${w} (${id})`;
    const title = typeof raw.title === 'string' ? raw.title : '';
    const text = textOf(raw.text);
    if (!title) errors.push(tr(`${w}: "title" 不能为空`, `${w}: "title" must not be empty`));
    if (!text) errors.push(tr(`${w}: "text" 不能为空`, `${w}: "text" must not be empty`));
    const problems = strs(raw.problems);
    if (!Array.isArray(raw.problems) || problems.length !== raw.problems.length)
      errors.push(tr(`${w}: "problems" 必须是题目 id 的数组`, `${w}: "problems" must be an array of problem ids`));
    else if (!problems.length) warnings.push(tr(`${w}: 没有链接任何练习题`, `${w}: links no practice problem`));
    if (new Set(problems).size !== problems.length) errors.push(tr(`${w}: "problems" 里有重复的 id`, `${w}: "problems" lists an id twice`));
    const tx = txOf(raw, w);
    ideas.push({ id, title: loc(tx, 'title', title), text: loc(tx, 'text', text), problems });
  });
  const ideaIds = new Set(ideas.map((x) => x.id));
  const checkIdea = (v: unknown, where: string) => {
    if (typeof v !== 'string' || !ideaIds.has(v))
      errors.push(
        tr(`${where}: 找不到要点 ${JSON.stringify(v)}（可用：${[...ideaIds].join(', ')}）`, `${where}: no key idea ${JSON.stringify(v)} (available: ${[...ideaIds].join(', ')})`),
      );
  };

  // ---- formulas ----
  const formulas: SummaryFormula[] = [];
  const formulaId = uniq('formula');
  arr('formulas', 1).forEach((raw, i) => {
    let w = `formulas[${i}]`;
    if (!isObj(raw)) return errors.push(tr(`${w}: 必须是对象`, `${w}: must be an object`));
    const id = formulaId(raw.id, w);
    if (id) w = `${w} (${id})`;
    checkIdea(raw.idea, `${w}.idea`);
    const name = typeof raw.name === 'string' ? raw.name : '';
    const expr = typeof raw.expr === 'string' ? raw.expr : '';
    const when = typeof raw.when === 'string' ? raw.when : '';
    if (!name) errors.push(tr(`${w}: "name" 不能为空`, `${w}: "name" must not be empty`));
    if (!expr) errors.push(tr(`${w}: "expr" 不能为空`, `${w}: "expr" must not be empty`));
    if (!when) errors.push(tr(`${w}: "when" 不能为空（成立条件、参考方向约定）`, `${w}: "when" must not be empty (when it holds, reference directions)`));
    if (raw.note !== undefined && typeof raw.note !== 'string') errors.push(tr(`${w}: "note" 必须是字符串`, `${w}: "note" must be a string`));
    const tx = txOf(raw, w);
    const f: SummaryFormula = { id, idea: String(raw.idea), name: loc(tx, 'name', name), expr: loc(tx, 'expr', expr), when: loc(tx, 'when', when) };
    if (typeof raw.note === 'string' && raw.note) f.note = loc(tx, 'note', raw.note);
    formulas.push(f);
  });

  // ---- worked examples ----
  const examples: SummaryExample[] = [];
  const exampleId = uniq('example');
  const rawExamples = arr('examples', 1);
  if (rawExamples.length > 3) warnings.push(tr('例题最多三道（要点页要短）', 'at most three worked examples (keep the page short)'));
  rawExamples.forEach((raw, i) => {
    let w = `examples[${i}]`;
    if (!isObj(raw)) return errors.push(tr(`${w}: 必须是对象`, `${w}: must be an object`));
    const id = exampleId(raw.id, w);
    if (id) w = `${w} (${id})`;
    const exIdeas = strs(raw.ideas);
    if (!Array.isArray(raw.ideas) || !exIdeas.length) errors.push(tr(`${w}: "ideas" 必须是至少一个要点 id 的数组`, `${w}: "ideas" must list at least one key idea id`));
    exIdeas.forEach((x, k) => checkIdea(x, `${w}.ideas[${k}]`));
    const results = Array.isArray(raw.results) ? raw.results : [];
    if (!results.length)
      errors.push(tr(`${w}: "results" 不能为空——例题的每个结果都要由引擎核对`, `${w}: "results" must not be empty — every result of the example is checked by the engine`));
    results.forEach((r, k) => {
      if (!isObj(r) || r.find === undefined) errors.push(tr(`${w}.results[${k}]: 必须有 "find" 和数值 "answer"`, `${w}.results[${k}]: needs "find" and a numeric "answer"`));
    });
    const steps = textOf(raw.steps);
    if (!steps) errors.push(tr(`${w}: "steps" 不能为空（分步解答）`, `${w}: "steps" must not be empty (the step-by-step solution)`));
    const t = isObj(raw.i18n) ? raw.i18n : undefined;
    if (!t || !isObj(t[other])) warnings.push(tr(`${w}: 没有翻译（i18n.${other}）`, `${w}: no translation (i18n.${other})`));
    // the same engine path as a problem file
    const ptx = (l: unknown) =>
      isObj(l) ? { title: l.title, statement: l.statement, questions: Array.isArray(l.results) ? l.results : undefined, solution: l.steps, notes: l.notes } : l;
    const asProblem = {
      format: PROBLEM_FORMAT_ID,
      id: `${chapter || 'summary'}-example-${id || i}`,
      chapter,
      lang: baseLang,
      title: raw.title,
      level: 1,
      statement: raw.statement,
      schematic: raw.schematic,
      analysis: raw.analysis,
      questions: results,
      hints: ['—'],
      solution: raw.steps,
      i18n: t ? Object.fromEntries(Object.entries(t).map(([l, v]) => [l, ptx(v)])) : undefined,
    };
    let r;
    try {
      r = parseProblem(asProblem, 'summary', file, { verify });
    } catch (e) {
      errors.push(tr(`${w}: 解析时出错：${(e as Error).message}`, `${w}: error while parsing: ${(e as Error).message}`));
      return;
    }
    for (const e of r.errors) errors.push(`${w}: ${e.replace(/questions\[/g, 'results[')}`);
    for (const e of r.warnings) warnings.push(`${w}: ${e.replace(/questions\[/g, 'results[')}`);
    if (verify) {
      // numbers with units in the steps: given or verified
      const known: number[] = [];
      numbersIn(raw.schematic, known);
      numbersIn(raw.analysis, known);
      for (const q of results) if (isObj(q)) numbersIn([q.answer, q.find], known);
      const statements = [textOf(raw.statement), ...(t ? Object.values(t).map((v) => (isObj(v) ? textOf(v.statement) : '')) : [])];
      for (const s of statements) for (const q of quantitiesIn(s)) known.push(q.value);
      const texts: [string, string][] = [[`${w}.steps`, steps]];
      if (t) for (const [l, v] of Object.entries(t)) if (isObj(v) && v.steps !== undefined) texts.push([`${w}.i18n.${l}.steps`, textOf(v.steps)]);
      for (const [where, s] of texts)
        for (const q of quantitiesIn(s))
          if (!isKnown(q.value, known, q.text.endsWith('°')))
            errors.push(
              tr(
                `${where}: “${q.text}” 既不是已知量，也不是由引擎核对过的结果——把它加进 results（带 find），或者改正它`,
                `${where}: "${q.text}" is neither given nor an engine-verified result — add it to results (with a find) or correct it`,
              ),
            );
    }
    if (r.problem) examples.push({ id, ideas: exIdeas, problem: r.problem });
  });

  // ---- common mistakes ----
  const mistakes: SummaryMistake[] = [];
  const mistakeId = uniq('mistake');
  arr('mistakes', 1).forEach((raw, i) => {
    let w = `mistakes[${i}]`;
    if (!isObj(raw)) return errors.push(tr(`${w}: 必须是对象`, `${w}: must be an object`));
    const id = mistakeId(raw.id, w);
    if (id) w = `${w} (${id})`;
    if (raw.idea !== undefined) checkIdea(raw.idea, `${w}.idea`);
    const text = textOf(raw.text);
    if (!text) errors.push(tr(`${w}: "text" 不能为空`, `${w}: "text" must not be empty`));
    const tx = txOf(raw, w);
    const m: SummaryMistake = { id, text: loc(tx, 'text', text) };
    if (typeof raw.idea === 'string') m.idea = raw.idea;
    mistakes.push(m);
  });

  // ---- links to the chapter's problems ----
  if (opts.problems && chapterById(chapter)) {
    const byId = new Map(opts.problems.map((p) => [p.id, p.chapter]));
    const linked = new Set<string>();
    ideas.forEach((idea, i) =>
      idea.problems.forEach((pid) => {
        linked.add(pid);
        const c = byId.get(pid);
        if (c === undefined) errors.push(tr(`ideas[${i}] (${idea.id}): 找不到题目 "${pid}"`, `ideas[${i}] (${idea.id}): no problem "${pid}"`));
        else if (c !== chapter)
          errors.push(tr(`ideas[${i}] (${idea.id}): 题目 "${pid}" 属于 ${c} 章，不是 ${chapter}`, `ideas[${i}] (${idea.id}): problem "${pid}" is in chapter ${c}, not ${chapter}`));
      }),
    );
    const unlinked = opts.problems.filter((p) => p.chapter === chapter && !linked.has(p.id)).map((p) => p.id);
    if (unlinked.length)
      errors.push(
        tr(
          `本章这些题目没有被任何要点链接（每道题需要的方法都要在要点里讲到）：${unlinked.join(', ')}`,
          `these problems of the chapter are not linked from any key idea (every technique a problem needs must be introduced): ${unlinked.join(', ')}`,
        ),
      );
  }

  const ok = errors.length === 0;
  return {
    ok,
    errors,
    warnings,
    summary: ok ? { chapter, intro, ideas, formulas, examples, mistakes, textLang: lang } : undefined,
  };
}

/** The key idea that practises a problem (the first one linking it), if any. */
export function ideaOfProblem(s: Pick<ChapterSummary, 'ideas'>, problemId: string): string | undefined {
  return s.ideas.find((x) => x.problems.includes(problemId))?.id;
}
