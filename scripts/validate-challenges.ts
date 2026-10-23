// Validate content files: breadboard challenges ("breadboard-challenge/1") and theory
// problems ("circuit-problem/1"). Each file is dispatched by its "format".
// Usage: npm run validate [--lang zh|en] [folder-or-file ...]
//        (default: ./challenges and ./problems, messages in Chinese)
//
// Theory problems: parseProblem → schematic geometry, structure, and every numeric answer
// recomputed by the analysis engine (must agree within 0.5 %).
//
// Challenges — for every *.json (recursive; skips *.schema.json and files starting with "_"):
//   1. parseChallenge → errors / warnings
//   2. self-consistency: every test must pass on the target circuit itself
//   3. if `solution` exists: it must build and be judged perfect by checkCircuit
//      (+ warning if any LED draws more than 25 mA in any test)
//   4. if `start` exists: it must build (warning if it already solves the challenge)
// Exit code 1 on any error.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseChallenge } from '../src/core/challenge';
import { chapterById } from '../src/core/problem/chapters';
import { isProblemJson, parseProblem } from '../src/core/problem/parse';
import { isLang, setLang, tr } from '../src/core/i18n';
import { applySet, checkCircuit } from '../src/core/check';
import { buildNetlist } from '../src/core/netlist';
import { simulate } from '../src/core/solver';
import { hasGenerator, simulateTransient } from '../src/core/transient';
import type { Layout } from '../src/core/types';

const LED_MAX = 0.025;

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
  /** "challenge" | "problem" */
  format?: 'challenge' | 'problem';
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
  for (const [ref, n] of refs) if (n > 1) errors.push(tr(`${label}: ref "${ref}" 用了 ${n} 次（每个元件的 ref 必须唯一）`, `${label}: ref "${ref}" is used ${n} times (every part needs a unique ref)`));
  return buildNetlist(layout);
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

  if (ch.tests.length === 0) rep.warnings.push(tr('没有 tests：只检查连线，不检查电路行为', 'no tests: only the wiring is checked, not how the circuit behaves'));
  if (ch.kind === 'lesson' && ch.steps.length === 0) rep.warnings.push(tr('lesson 没有 steps', 'lesson has no steps'));
  if (!ch.solution) rep.warnings.push(tr('没有 solution：无法自动验证题目可解', 'no solution: cannot check automatically that the challenge is solvable'));

  // (a) self-consistency: the target must pass its own tests
  const self = checkCircuit(ch, ch.target);
  for (const i of self.issues) rep.errors.push(tr(`target 自检失败 — ${issueText(i, '：')}`, `target self-test failed — ${issueText(i, ': ')}`));

  // (b) solution must be perfect
  if (ch.solution) {
    const nl = checkLayout(ch.solution, 'solution', rep.errors);
    if (nl.unplaced.length) rep.errors.push(tr(`solution: 这些元件有脚没插上：${nl.unplaced.join(', ')}`, `solution: these parts have legs not plugged in: ${nl.unplaced.join(', ')}`));
    const r = checkCircuit(ch, nl.circuit, nl.pinHoles);
    for (const i of r.issues) rep.errors.push(tr(`solution 不正确 — ${issueText(i, '：')}`, `solution is wrong — ${issueText(i, ': ')}`));
    // LED current sanity (with every test's settings, plus the default state)
    const states = [{ name: tr('默认状态', 'default state'), set: {} }, ...ch.tests];
    const seen = new Set<string>();
    for (const t of states) {
      const circ = applySet(nl.circuit, t.set, r.mapping);
      const sim = simulate(circ);
      // with a function generator, LED current = steady-state average (what the checker uses)
      const ledStates = hasGenerator(circ) ? simulateTransient(circ).leds : sim.leds;
      for (const [ref, led] of ledStates) {
        if (led.burnt) rep.errors.push(tr(`solution: ${ref} 在「${t.name}」时电流 ${(led.current * 1000).toFixed(0)} mA，会烧坏`, `solution: ${ref} draws ${(led.current * 1000).toFixed(0)} mA in "${t.name}" and burns out`));
        else if (led.current > LED_MAX && !seen.has(ref)) {
          seen.add(ref);
          rep.warnings.push(tr(`solution: ${ref} 在「${t.name}」时电流 ${(led.current * 1000).toFixed(1)} mA，超过 25 mA`, `solution: ${ref} draws ${(led.current * 1000).toFixed(1)} mA in "${t.name}", above 25 mA`));
        }
      }
      for (const [ref, m] of sim.meters)
        if (Math.abs(m.current) > 0.5) rep.errors.push(tr(`solution: 电流表 ${ref} 在「${t.name}」时把电路短路了`, `solution: ammeter ${ref} shorts the circuit in "${t.name}"`));
      for (const [ref, s] of sim.sources) if (s.shorted) rep.errors.push(tr(`solution: 电源 ${ref} 在「${t.name}」时短路/过载`, `solution: supply ${ref} is shorted / overloaded in "${t.name}"`));
    }
  }

  // (c) start layout must at least build
  if (ch.start) {
    const nl = checkLayout(ch.start, 'start', rep.errors);
    const r = checkCircuit(ch, nl.circuit, nl.pinHoles);
    if (r.perfect && nl.unplaced.length === 0) rep.warnings.push(tr('start 已经是正确答案了（学生什么都不用做）', 'start is already a correct answer (the student has nothing to do)'));
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
      rep.warnings.push(tr(`文件在 ${dir}/ 文件夹里，但 chapter 是 "${rep.kind}"——建议放进 problems/${rep.kind}/`, `the file is in ${dir}/ but its chapter is "${rep.kind}" — put it in problems/${rep.kind}/`));
  }
  return rep;
}

/** Route a JSON file to the right validator by its "format" (or by folder when it has none). */
export function validateJson(json: unknown, file: string): FileReport {
  const inProblems = /(^|[\\/])problems[\\/]/.test(file);
  const fmt = (json as { format?: unknown })?.format;
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
  const defaults = !args.length;
  const roots = (defaults ? ['challenges', 'problems'] : args).map((a) => resolve(a));
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

  const stats = { challenge: { files: 0, bad: 0, warn: 0 }, problem: { files: 0, bad: 0, warn: 0 } };
  const ids = { challenge: new Map<string, string>(), problem: new Map<string, string>() };
  for (const f of files) {
    const r0 = relative(process.cwd(), f);
    const rel = !r0 || r0.startsWith('..') ? f : r0;
    let rep: FileReport;
    try {
      const text = readFileSync(f, 'utf8').replace(/^﻿/, '');
      rep = validateJson(JSON.parse(text), rel);
    } catch (e) {
      const format = /(^|[\\/])problems[\\/]/.test(rel) ? 'problem' : 'challenge';
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
  const label = { challenge: tr('面包板题 breadboard-challenge/1', 'breadboard-challenge/1'), problem: tr('理论题 circuit-problem/1', 'circuit-problem/1') };
  let bad = 0;
  for (const k of ['challenge', 'problem'] as const) {
    const st = stats[k];
    if (!st.files) continue;
    bad += st.bad;
    const line = tr(
      `${label[k]}：${st.files} 个文件，${st.files - st.bad} 通过，${st.bad} 失败，${st.warn} 条警告`,
      `${label[k]}: ${st.files} files, ${st.files - st.bad} passed, ${st.bad} failed, ${st.warn} warnings`,
    );
    console.log(st.bad ? red(line) : green(line));
  }
  if (bad) process.exit(1);
}

// run only when executed directly (the module can also be imported by tests)
const entry = process.argv[1] ? resolve(process.argv[1]).replace(/\.[cm]?[jt]s$/, '') : '';
if (entry === fileURLToPath(import.meta.url).replace(/\.[cm]?[jt]s$/, '')) main();
