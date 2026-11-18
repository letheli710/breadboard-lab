// Validate content files: breadboard challenges ("breadboard-challenge/1"), theory problems
// ("circuit-problem/1") and chapter summaries ("chapter-summary/1"). Each file is dispatched by
// its "format".
// Usage: npm run validate [--lang zh|en] [folder-or-file ...]
//        (default: ./challenges, ./problems and ./summaries, messages in Chinese)
//
// Chapter summaries: parseSummary → structure, translations, every worked-example result
// recomputed by the engine (the problem path), every number with a unit in the steps given or
// verified, and links: every linked problem exists in the chapter, every problem of the chapter
// is linked from a key idea.
//
// Theory problems: parseProblem → schematic geometry, structure, and every numeric answer
// recomputed by the analysis engine (must agree within 0.5 %).
//
// Challenges — for every *.json (recursive; skips *.schema.json and files starting with "_"):
//   1. parseChallenge → errors / warnings
//   2. self-consistency: every test must pass on the target circuit itself
//   3. if `solution` exists: it must build, be judged perfect by checkCircuit and show no
//      error-level board diagnostic (the app refuses the answer otherwise)
//      (+ warning if any LED draws more than 25 mA in any test)
//   4. if `start` exists: it must build (warning if it already solves the challenge)
//   5. lesson steps with a "check": the last such step's parts / empty holes must hold on the
//      solution; "prereq" ids must be built-in lessons
//   6. measurement questions: each reading must be obtainable from the reference solution
//      (finite), fall inside the author's "range", and be accepted when typed to 3 significant
//      figures in the question's unit (`--readings` prints them)
// Course map (default run only): course/worlds.json, course/portals.json, units/*.json — see
// scripts/validate-course.ts.
// Exit code 1 on any error.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseChallenge, type MeasurementQuestion } from '../src/core/challenge';
import { chapterById } from '../src/core/problem/chapters';
import { isProblemJson, parseProblem, splitUnit } from '../src/core/problem/parse';
import { isSummaryJson, parseSummary } from '../src/core/summary/parse';
import { buildProblemIndex } from './problem-index-plugin';
import { buildChallengeIndex } from './challenge-index-plugin';
import { unmetStepChecks } from '../src/core/stepCheck';
import { gradeReading, matchBoard, referenceValues } from '../src/core/readings';
import { formatSI } from '../src/core/format';
import { isLang, setLang, tr } from '../src/core/i18n';
import { applySet, checkCircuit } from '../src/core/check';
import { acDiagnostics, boardDiagnostics } from '../src/core/diagnostics';
import { buildNetlist } from '../src/core/netlist';
import { simulate } from '../src/core/solver';
import { hasGenerator, simulateTransient } from '../src/core/transient';
import type { Layout } from '../src/core/types';
import { figureTexts } from '../src/core/figures';
import { embedRefs } from '../src/core/rail';
import { checkCourse, printCourse } from './validate-course';

const LED_MAX = 0.025;
/** --readings: print every measurement question's reading on the reference solution */
const READINGS = process.argv.includes('--readings');

const issueText = (i: { title: string; detail?: string }, sep: string) => i.title + (i.detail ? sep + i.detail.replace(/\n/g, ' ') : '');

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code: number) => (s: string) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const red = paint(31);
const green = paint(32);
const yellow = paint(33);
const dim = paint(2);

export interface FileReport {
  file: string;
  id?: string;
  title?: string;
  kind?: string;
  /** "challenge" | "problem" | "summary" */
  format?: 'challenge' | 'problem' | 'summary';
  errors: string[];
  warnings: string[];
}

function collect(path: string, out: string[]) {
  const st = statSync(path);
  if (st.isDirectory()) {
    for (const name of readdirSync(path).sort()) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      collect(join(path, name), out);
    }
  } else if (path.toLowerCase().endsWith('.json')) {
    const name = basename(path);
    if (name.startsWith('_') || name.toLowerCase().endsWith('.schema.json')) return;
    out.push(path);
  }
}

function checkLayout(layout: Layout, label: string, errors: string[]) {
  const refs = new Map<string, number>();
  for (const p of layout.parts) if (p.type !== 'wire') refs.set(p.ref, (refs.get(p.ref) ?? 0) + 1);
  for (const [ref, n] of refs)
    if (n > 1) errors.push(tr(`${label}: ref "${ref}" 用了 ${n} 次（每个元件的 ref 必须唯一）`, `${label}: ref "${ref}" is used ${n} times (every part needs a unique ref)`));
  return buildNetlist(layout);
}

/* ---- answer leaks: a lab's visible text must not state a reading its measurement questions ask for ---- */

const LEAK_UNITS: Record<string, string> = { V: 'V', A: 'A', Ω: 'Ω', Hz: 'Hz', s: 's', W: 'W', '°C': '°C', '℃': '°C', K: 'K' };
const LEAK_PREFIX: Record<string, number> = { p: 1e-12, n: 1e-9, u: 1e-6, µ: 1e-6, μ: 1e-6, m: 1e-3, k: 1e3, M: 1e6 };
const NUM_UNIT = /(?<![\w.])([-−]?\d+(?:\.\d+)?)\s?([pnuµμmkM]?)(V|A|Ω|Hz|s|W|°C|℃|K)(?![A-Za-z0-9_/])/g;

/** Numbers-with-unit in a piece of text, in SI units. */
export function numbersWithUnit(text: string): { text: string; value: number; unit: string }[] {
  const out: { text: string; value: number; unit: string }[] = [];
  for (const m of text.matchAll(NUM_UNIT)) {
    if (m[3] === 'K' && m[2]) continue; // "10 kK" is not a thing; "K" alone is kelvin
    const value = parseFloat(m[1].replace('−', '-')) * (m[2] ? LEAK_PREFIX[m[2]] : 1);
    out.push({ text: m[0], value, unit: LEAK_UNITS[m[3]] });
  }
  return out;
}

/** Quantities the lab hands the student (supply settings, part values, generator settings): stating them is not a leak. */
function givenValues(json: Record<string, unknown>): number[] {
  const out: number[] = [3.3, 5];
  const walk = (o: unknown) => {
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object') for (const v of Object.values(o)) walk(v);
    else if (typeof o === 'number') out.push(Math.abs(o));
    else if (typeof o === 'string') {
      // part values written with a prefix: "2.2k", "10n", "1kHz", "4.7kΩ"
      const m = /^([-−]?\d+(?:\.\d+)?)\s?([pnuµμmkM]?)[A-Za-zΩ]*$/.exec(o.trim());
      if (m) out.push(Math.abs(parseFloat(m[1].replace('−', '-')) * (m[2] ? LEAK_PREFIX[m[2]] : 1)));
    }
  };
  const j = json as {
    components?: unknown;
    tests?: { set?: unknown }[];
    measurements?: { set?: unknown }[];
    solution?: { parts?: { props?: unknown; voltage?: unknown; currentLimit?: unknown }[] };
  };
  walk(j.components);
  for (const t of j.tests ?? []) walk(t.set);
  for (const q of j.measurements ?? []) walk(q.set);
  for (const p of j.solution?.parts ?? []) walk([p.props, p.voltage, p.currentLimit]);
  return out;
}

/** Visible text of a lab, per field, in every language. */
function visibleTexts(json: Record<string, unknown>): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  const add = (where: string, v: unknown) => {
    if (typeof v === 'string') out.push({ where, text: v });
    else if (Array.isArray(v)) v.forEach((x) => add(where, typeof x === 'object' && x ? (x as { name?: unknown }).name : x));
  };
  const scan = (o: Record<string, unknown> | undefined, lang: string) => {
    if (!o) return;
    for (const k of ['title', 'summary', 'description', 'startNote', 'hints']) add(`${lang}${k}`, o[k]);
    add(`${lang}tests`, o.tests);
    // card-style units (§16): the cards are what the student reads instead of the description
    if (Array.isArray(o.cards))
      o.cards.forEach((c: unknown, i: number) => {
        if (!c || typeof c !== 'object') return;
        const card = c as { title?: unknown; text?: unknown };
        add(`${lang}cards[${i}].title`, card.title);
        add(`${lang}cards[${i}].text`, Array.isArray(card.text) ? card.text.join('\n') : card.text);
      });
    // the rail (§17) and its derivations
    if (Array.isArray(o.rail))
      o.rail.forEach((c: unknown, i: number) => {
        if (!c || typeof c !== 'object') return;
        const node = c as { title?: unknown; text?: unknown };
        add(`${lang}rail[${i}].title`, node.title);
        add(`${lang}rail[${i}].text`, Array.isArray(node.text) ? node.text.join('\n') : node.text);
      });
    if (o.derivations && typeof o.derivations === 'object')
      for (const [id, d] of Object.entries(o.derivations as Record<string, { steps?: unknown }>))
        add(`${lang}derivations.${id}`, Array.isArray(d?.steps) ? d.steps.join('\n') : undefined);
  };
  scan(json, '');
  for (const [lang, t] of Object.entries((json.i18n as Record<string, Record<string, unknown>>) ?? {})) scan(t, `i18n.${lang}.`);
  // figures (§16.3): captions, notes and labels, both languages
  if (json.figures && typeof json.figures === 'object')
    for (const [id, f] of Object.entries(json.figures as Record<string, unknown>)) for (const t of figureTexts(f)) out.push({ where: `figures.${id}`, text: t });
  return out;
}

export function readingLeaks(json: unknown, qs: MeasurementQuestion[], vals: Map<string, number>): { id: string; where: string; text: string; expected: string }[] {
  const j = json as Record<string, unknown>;
  const given = givenValues(j);
  const texts = visibleTexts(j);
  const out: { id: string; where: string; text: string; expected: string }[] = [];
  for (const q of qs) {
    const v = vals.get(q.id);
    const u = q.unit ? splitUnit(q.unit) : null;
    if (q.stated || v === undefined || !Number.isFinite(v) || v === 0 || !u?.unit) continue;
    const unit = u.unit;
    const tol = Math.max(q.tol, 0.03);
    for (const { where, text } of texts)
      for (const n of numbersWithUnit(text)) {
        if (n.unit !== unit) continue;
        if (Math.abs(n.value - v) > tol * Math.abs(v)) continue;
        if (given.some((g) => g !== 0 && Math.abs(Math.abs(n.value) - g) <= 0.005 * g)) continue;
        out.push({ id: q.id, where, text: n.text, expected: `${+(v / u.scale).toPrecision(3)} ${q.unit}` });
      }
  }
  return out;
}

/* ---- rail embeds: ![](inside:<teardown>#<layer>) must name a teardown and one of its layers ---- */

let tdLayers: Map<string, number> | null = null;
/** teardown id → number of layers, read from the registry and the teardown sources (they are TSX + CSS, not loadable here) */
function teardownLayers(): Map<string, number> {
  if (tdLayers) return tdLayers;
  tdLayers = new Map();
  const dir = resolve(fileURLToPath(import.meta.url), '../../src/inside');
  const reg = readFileSync(join(dir, 'registry.ts'), 'utf8');
  for (const m of reg.matchAll(/id: '([a-z0-9-]+)'[\s\S]*?import\('\.\/td\/([a-z0-9-]+)'\)/g)) {
    const src = readFileSync(join(dir, 'td', `${m[2]}.tsx`), 'utf8');
    const layers = src.slice(src.indexOf('layers: ['));
    tdLayers.set(m[1], (layers.match(/^ {8}id: '/gm) ?? []).length);
  }
  return tdLayers;
}

export function validateChallengeJson(json: unknown, file: string): FileReport {
  const rep: FileReport = { file, errors: [], warnings: [] };
  const res = parseChallenge(json, 'folder', file);
  rep.errors.push(...res.errors);
  rep.warnings.push(...res.warnings);
  const ch = res.challenge;
  if (!ch) return rep;
  rep.id = ch.id;
  rep.title = ch.title;
  rep.kind = ch.kind;

  for (const n of ch.rail)
    for (const ref of embedRefs(n.text, 'inside')) {
      const [td, l] = ref.split('#');
      const count = teardownLayers().get(td);
      if (count === undefined)
        rep.errors.push(tr(`rail「${n.title}」：没有拆解 "${td}"（见 src/inside/registry.ts）`, `rail "${n.title}": there is no teardown "${td}" (see src/inside/registry.ts)`));
      else if (+l > count)
        rep.errors.push(tr(`rail「${n.title}」：拆解 ${td} 只有 ${count} 层，没有第 ${l} 层`, `rail "${n.title}": teardown ${td} has ${count} layers, not ${l}`));
    }

  if (ch.tests.length === 0) rep.warnings.push(tr('没有 tests：只检查连线，不检查电路行为', 'no tests: only the wiring is checked, not how the circuit behaves'));
  if (ch.kind === 'lesson' && ch.steps.length === 0) rep.warnings.push(tr('lesson 没有 steps', 'lesson has no steps'));
  if (!ch.solution) rep.warnings.push(tr('没有 solution：无法自动验证题目可解', 'no solution: cannot check automatically that the challenge is solvable'));

  // (a) self-consistency: the target must pass its own tests
  const self = checkCircuit(ch, ch.target);
  for (const i of self.issues) rep.errors.push(tr(`target 自检失败 — ${issueText(i, '：')}`, `target self-test failed — ${issueText(i, ': ')}`));

  // (b) solution must be perfect
  if (ch.solution) {
    const nl = checkLayout(ch.solution, 'solution', rep.errors);
    if (nl.unplaced.length)
      rep.errors.push(tr(`solution: 这些元件有脚没插上：${nl.unplaced.join(', ')}`, `solution: these parts have legs not plugged in: ${nl.unplaced.join(', ')}`));
    const r = checkCircuit(ch, nl.circuit, nl.pinHoles);
    for (const i of r.issues) rep.errors.push(tr(`solution 不正确 — ${issueText(i, '：')}`, `solution is wrong — ${issueText(i, ': ')}`));
    // the app refuses to celebrate while the live board diagnostics show an error: the
    // reference answer (as laid out, default state) must not trigger one
    {
      const sim0 = simulate(nl.circuit);
      const diag = [...boardDiagnostics(nl, sim0), ...(hasGenerator(nl.circuit) ? acDiagnostics(nl, simulateTransient(nl.circuit)) : [])];
      for (const i of diag)
        if (i.severity === 'error')
          rep.errors.push(
            tr(
              `solution: 面包板诊断报错「${issueText(i, '：')}」（界面会因此不判对）`,
              `solution: board diagnostic error "${issueText(i, ': ')}" (the app won't accept the answer)`,
            ),
          );
    }
    // LED current sanity (with every test's settings, plus the default state)
    const states = [{ name: tr('默认状态', 'default state'), set: {} }, ...ch.tests];
    const seen = new Set<string>();
    for (const t of states) {
      const circ = applySet(nl.circuit, t.set, r.mapping, r.pinMap);
      const sim = simulate(circ);
      // with a function generator, LED current = steady-state average (what the checker uses)
      const ledStates = hasGenerator(circ) ? simulateTransient(circ).leds : sim.leds;
      const isLed = (ref: string) => circ.components.find((x) => x.ref === ref)?.type === 'led';
      for (const [ref, led] of ledStates) {
        if (led.burnt)
          rep.errors.push(
            tr(
              `solution: ${ref} 在「${t.name}」时电流 ${(led.current * 1000).toFixed(0)} mA，会烧坏`,
              `solution: ${ref} draws ${(led.current * 1000).toFixed(0)} mA in "${t.name}" and burns out`,
            ),
          );
        else if (isLed(ref) && led.current > LED_MAX && !seen.has(ref)) {
          seen.add(ref);
          rep.warnings.push(
            tr(
              `solution: ${ref} 在「${t.name}」时电流 ${(led.current * 1000).toFixed(1)} mA，超过 25 mA`,
              `solution: ${ref} draws ${(led.current * 1000).toFixed(1)} mA in "${t.name}", above 25 mA`,
            ),
          );
        }
      }
      for (const [ref, m] of sim.meters)
        if (Math.abs(m.current) > 0.5) rep.errors.push(tr(`solution: 电流表 ${ref} 在「${t.name}」时把电路短路了`, `solution: ammeter ${ref} shorts the circuit in "${t.name}"`));
      for (const [ref, s] of sim.sources)
        if (s.shorted) rep.errors.push(tr(`solution: 电源 ${ref} 在「${t.name}」时短路/过载`, `solution: supply ${ref} is shorted / overloaded in "${t.name}"`));
      // dev boards: a solution must never damage a pin; warn above the recommended pin current
      for (const [ref, m] of sim.mcus)
        for (const [pin, p] of m.pins) {
          if (p.damaged)
            rep.errors.push(
              tr(
                `solution: ${ref} ${pin} 在「${t.name}」时损坏（${(p.current * 1000).toFixed(0)} mA）`,
                `solution: ${ref} ${pin} is damaged in "${t.name}" (${(p.current * 1000).toFixed(0)} mA)`,
              ),
            );
          else if (p.overcurrent && !seen.has(`${ref}.${pin}`)) {
            seen.add(`${ref}.${pin}`);
            rep.warnings.push(
              tr(
                `solution: ${ref} ${pin} 在「${t.name}」时电流 ${(p.current * 1000).toFixed(1)} mA，超过建议值`,
                `solution: ${ref} ${pin} carries ${(p.current * 1000).toFixed(1)} mA in "${t.name}", above the recommended limit`,
              ),
            );
          }
          if (p.overvoltage)
            rep.errors.push(
              tr(
                `solution: ${ref} ${pin} 在「${t.name}」时电压过高（${p.vLocal.toFixed(2)} V）`,
                `solution: ${ref} ${pin} is over-voltage in "${t.name}" (${p.vLocal.toFixed(2)} V)`,
              ),
            );
        }
      for (const [ref, q] of sim.bjts) if (q.breakdown) rep.errors.push(tr(`solution: ${ref} 在「${t.name}」时击穿`, `solution: ${ref} breaks down in "${t.name}"`));
      if (hasGenerator(circ))
        for (const ref of simulateTransient(circ).breakdowns)
          rep.errors.push(
            tr(
              `solution: ${ref} 在「${t.name}」时被线圈反电动势击穿（缺续流二极管）`,
              `solution: ${ref} breaks down from an inductive kick in "${t.name}" (missing flyback diode)`,
            ),
          );
    }
  }

  // (d) measurement questions: read them on the reference solution
  if (ch.measurements.length) {
    if (!ch.solution) rep.errors.push(tr('有 measurements 就必须有 solution（读数要从参考答案上算出来核对）', 'measurements need a solution (the readings are checked on it)'));
    for (const q of ch.measurements) {
      if (q.unit && !splitUnit(q.unit)) rep.errors.push(tr(`measurements (${q.id}): 不认识单位 "${q.unit}"`, `measurements (${q.id}): unknown unit "${q.unit}"`));
      if (q.what?.kind === 'scope' && q.what.measure !== 'phase' && q.what.measure !== 'gain' && !q.what.solve && !q.unit)
        rep.warnings.push(tr(`measurements (${q.id}): 没有单位`, `measurements (${q.id}): no unit`));
    }
    if (ch.solution) {
      const nl = buildNetlist(ch.solution);
      const m = matchBoard(ch, nl.circuit);
      if (!m) rep.errors.push(tr('measurements: solution 和目标电路对不上，读不出读数', "measurements: the solution doesn't match the target, so nothing can be read"));
      else {
        const vals = referenceValues(ch, m);
        for (const q of ch.measurements) {
          if (!q.what) continue;
          const v = vals.get(q.id)!;
          const shown = (x: number) => `${+(x / (splitUnit(q.unit)?.scale ?? 1)).toPrecision(4)}${q.unit ? ` ${q.unit}` : ''}`;
          if (READINGS) console.log(dim(`    reading  ${q.id} = ${Number.isFinite(v) ? `${shown(v)}  (${formatSI(v, '')})` : 'NaN'}`));
          if (!Number.isFinite(v)) {
            rep.errors.push(tr(`measurements (${q.id}): 在参考答案上读不出这个量（NaN）`, `measurements (${q.id}): the reference solution gives no value (NaN)`));
            continue;
          }
          if (q.range && (v < q.range[0] || v > q.range[1]))
            rep.errors.push(
              tr(
                `measurements (${q.id}): 参考答案读数 ${shown(v)} 不在 range [${q.range[0]}, ${q.range[1]}] 内`,
                `measurements (${q.id}): the reference reading ${shown(v)} is outside range [${q.range[0]}, ${q.range[1]}]`,
              ),
            );
          // a student who reads the instrument to 3 significant figures must be accepted
          const typed = `${+(v / (splitUnit(q.unit)?.scale ?? 1)).toPrecision(3)}`;
          if (q.what.kind !== 'formula' && !gradeReading(q, v, typed).ok)
            rep.errors.push(
              tr(
                `measurements (${q.id}): 容差太紧——按 3 位有效数字输入 ${typed} 被判错`,
                `measurements (${q.id}): tolerance too tight — typing ${typed} (3 significant figures) is marked wrong`,
              ),
            );
        }
        for (const leak of readingLeaks(json, ch.measurements, vals))
          rep.warnings.push(
            tr(
              `measurements (${leak.id}): ${leak.where} 里写了 “${leak.text}”，和这道题的参考读数（${leak.expected}）一样——把它移到 compare 或 explain`,
              `measurements (${leak.id}): ${leak.where} says "${leak.text}", which is this question's reference reading (${leak.expected}) — move it to compare or explain`,
            ),
          );
      }
    }
  }

  // lesson step checks: the last checked step describes the finished circuit
  const lastChecked = [...ch.steps].reverse().find((s) => s.check?.some((c) => c.kind === 'part' || c.kind === 'empty'));
  if (lastChecked && ch.solution) {
    const checks = (lastChecked.check ?? []).filter((c) => c.kind === 'part' || c.kind === 'empty');
    for (const u of unmetStepChecks(checks, { layout: ch.solution, probe: { red: null, black: null }, scope: { tdiv: null, vdiv: { 1: null, 2: null } } }))
      rep.errors.push(tr(`steps：最后一个带 check 的步骤在参考答案上不成立：${u}`, `steps: the last step with a check fails on the solution: ${u}`));
  }
  if (ch.prereq?.length) {
    const lessons = new Set(
      builtinChallenges()
        .filter((e) => e.kind === 'lesson')
        .map((e) => e.id),
    );
    for (const id of ch.prereq) if (!lessons.has(id)) rep.errors.push(tr(`prereq: 没有 id 为 "${id}" 的内置课程`, `prereq: no built-in lesson with id "${id}"`));
  }

  // (c) start layout must at least build
  if (ch.start) {
    const nl = checkLayout(ch.start, 'start', rep.errors);
    const r = checkCircuit(ch, nl.circuit, nl.pinHoles);
    if (r.perfect && nl.unplaced.length === 0)
      rep.warnings.push(tr('start 已经是正确答案了（学生什么都不用做）', 'start is already a correct answer (the student has nothing to do)'));
  }
  return rep;
}

export function validateProblemJson(json: unknown, file: string): FileReport {
  const rep: FileReport = { file, format: 'problem', errors: [], warnings: [] };
  let res;
  try {
    res = parseProblem(json, 'folder', file);
  } catch (e) {
    rep.errors.push(tr(`解析时出错：${(e as Error).message}`, `Error while parsing: ${(e as Error).message}`));
    return rep;
  }
  rep.errors.push(...res.errors);
  rep.warnings.push(...res.warnings);
  const p = res.problem;
  const raw = json as Record<string, unknown>;
  rep.id = p?.id ?? (typeof raw?.id === 'string' ? raw.id : undefined);
  rep.title = p?.title ?? (typeof raw?.title === 'string' ? raw.title : undefined);
  rep.kind = p?.chapter ?? (typeof raw?.chapter === 'string' ? raw.chapter : undefined);
  // the file should live in problems/<chapter>/
  if (rep.kind && chapterById(rep.kind)) {
    const dir = file.replace(/\\/g, '/').split('/').slice(-2, -1)[0];
    if (dir && dir !== rep.kind && file.replace(/\\/g, '/').includes('problems/'))
      rep.warnings.push(
        tr(
          `文件在 ${dir}/ 文件夹里，但 chapter 是 "${rep.kind}"——建议放进 problems/${rep.kind}/`,
          `the file is in ${dir}/ but its chapter is "${rep.kind}" — put it in problems/${rep.kind}/`,
        ),
      );
  }
  return rep;
}

let challengeList: { id: string; kind: string }[] | null = null;
/** The built-in lessons / challenges (for the "prereq" check). */
function builtinChallenges(): { id: string; kind: string }[] {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  return (challengeList ??= buildChallengeIndex(root).entries.map((e) => ({ id: e.id, kind: e.kind })));
}

let problemList: { id: string; chapter: string }[] | null = null;
/** The built-in problems (for the summaries' link checks). */
function builtinProblems(): { id: string; chapter: string }[] {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  return (problemList ??= buildProblemIndex(root).entries.map((e) => ({ id: e.id, chapter: e.chapter })));
}

export function validateSummaryJson(json: unknown, file: string, problems = builtinProblems()): FileReport {
  const rep: FileReport = { file, format: 'summary', errors: [], warnings: [] };
  let res;
  try {
    res = parseSummary(json, file, { problems });
  } catch (e) {
    rep.errors.push(tr(`解析时出错：${(e as Error).message}`, `Error while parsing: ${(e as Error).message}`));
    return rep;
  }
  rep.errors.push(...res.errors);
  rep.warnings.push(...res.warnings);
  const raw = json as Record<string, unknown>;
  rep.kind = typeof raw?.chapter === 'string' ? raw.chapter : undefined;
  rep.id = rep.kind ? `summary:${rep.kind}` : undefined;
  const s = res.summary;
  if (s)
    rep.title = tr(
      `${s.ideas.length} 个要点，${s.formulas.length} 个公式，${s.examples.length} 道例题，${s.mistakes.length} 个易错点`,
      `${s.ideas.length} key ideas, ${s.formulas.length} formulas, ${s.examples.length} worked examples, ${s.mistakes.length} mistakes`,
    );
  return rep;
}

/** Route a JSON file to the right validator by its "format" (or by folder when it has none). */
export function validateJson(json: unknown, file: string): FileReport {
  const inProblems = /(^|[\\/])problems[\\/]/.test(file);
  const fmt = (json as { format?: unknown })?.format;
  if (isSummaryJson(json) || (/(^|[\\/])summaries[\\/]/.test(file) && fmt === undefined)) return validateSummaryJson(json, file);
  if (isProblemJson(json) || (inProblems && fmt === undefined)) return validateProblemJson(json, file);
  return { ...validateChallengeJson(json, file), format: 'challenge' };
}

function main() {
  const args = process.argv.slice(2);
  const li = args.indexOf('--lang');
  if (li >= 0) {
    const l = args[li + 1];
    if (!isLang(l)) {
      console.error(red('--lang must be zh or en'));
      process.exit(1);
    }
    setLang(l);
    args.splice(li, 2);
  }
  if (args.includes('--readings')) args.splice(args.indexOf('--readings'), 1);
  const defaults = !args.length;
  const roots = (defaults ? ['challenges', 'problems', 'summaries'] : args).map((a) => resolve(a));
  const files: string[] = [];
  for (const r of roots) {
    try {
      if (defaults && !existsSync(r)) continue;
      collect(r, files);
    } catch (e) {
      console.error(red(tr(`✘ 找不到 ${r}：${(e as Error).message}`, `✘ can't find ${r}: ${(e as Error).message}`)));
      process.exit(1);
    }
  }
  if (files.length === 0) {
    console.log(yellow(tr('没有找到任何 .json 题目文件。', 'No .json challenge files found.')));
    return;
  }

  const stats = { challenge: { files: 0, bad: 0, warn: 0 }, problem: { files: 0, bad: 0, warn: 0 }, summary: { files: 0, bad: 0, warn: 0 } };
  const ids = { challenge: new Map<string, string>(), problem: new Map<string, string>(), summary: new Map<string, string>() };
  for (const f of files) {
    const r0 = relative(process.cwd(), f);
    const rel = !r0 || r0.startsWith('..') ? f : r0;
    let rep: FileReport;
    try {
      const text = readFileSync(f, 'utf8').replace(/^﻿/, '');
      rep = validateJson(JSON.parse(text), rel);
    } catch (e) {
      const format = /(^|[\\/])problems[\\/]/.test(rel) ? 'problem' : /(^|[\\/])summaries[\\/]/.test(rel) ? 'summary' : 'challenge';
      rep = { file: rel, format, errors: [tr(`JSON 语法错误：${(e as Error).message}`, `JSON syntax error: ${(e as Error).message}`)], warnings: [] };
    }
    const fmt = rep.format ?? 'challenge';
    if (rep.id) {
      const prev = ids[fmt].get(rep.id);
      if (prev) rep.errors.push(tr(`id "${rep.id}" 与 ${prev} 重复`, `id "${rep.id}" duplicates ${prev}`));
      else ids[fmt].set(rep.id, rel);
    }
    const ok = rep.errors.length === 0;
    stats[fmt].files++;
    if (!ok) stats[fmt].bad++;
    stats[fmt].warn += rep.warnings.length;
    const head = ok ? green('✔') : red('✘');
    const info = rep.id ? `${rep.id} ${dim(`[${rep.kind}]`)} ${rep.title}` : '';
    console.log(`${head} ${rel}  ${info}`);
    for (const e of rep.errors) console.log(`    ${red('error')}  ${e}`);
    for (const w of rep.warnings) console.log(`    ${yellow('warn')}   ${w}`);
  }
  console.log('');
  const label = {
    challenge: tr('面包板题 breadboard-challenge/1', 'breadboard-challenge/1'),
    problem: tr('理论题 circuit-problem/1', 'circuit-problem/1'),
    summary: tr('章节要点 chapter-summary/1', 'chapter-summary/1'),
  };
  let bad = 0;
  for (const k of ['challenge', 'problem', 'summary'] as const) {
    const st = stats[k];
    if (!st.files) continue;
    bad += st.bad;
    const line = tr(
      `${label[k]}：${st.files} 个文件，${st.files - st.bad} 通过，${st.bad} 失败，${st.warn} 条警告`,
      `${label[k]}: ${st.files} files, ${st.files - st.bad} passed, ${st.bad} failed, ${st.warn} warnings`,
    );
    console.log(st.bad ? red(line) : green(line));
  }
  // the course map (Worlds, portals, learning units) is checked with the default run
  if (defaults) {
    console.log('');
    bad += printCourse(checkCourse(process.cwd()));
  }
  if (bad) process.exit(1);
}

// run only when executed directly (the module can also be imported by tests)
const entry = process.argv[1] ? resolve(process.argv[1]).replace(/\.[cm]?[jt]s$/, '') : '';
if (entry === fileURLToPath(import.meta.url).replace(/\.[cm]?[jt]s$/, '')) main();
