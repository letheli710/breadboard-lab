// Validate the course map: course/worlds.json (Worlds), course/pending.json (units still to build), course/portals.json and
// units/*.json (learning units). Run by `npm run validate` (scripts/validate-challenges.ts) and so
// by `npm run check`; also on its own: `tsx scripts/validate-course.ts`.
//
// Errors (exit 1): a broken link (a ref that leads nowhere), a portal without its reverse link
// ("back"), a ref to a unit that is not registered (neither built nor in "pending" + REBUILD_PLAN),
// a lesson / lab / chapter / unit missing from the Worlds or placed twice, a unit that doesn't
// parse, whose formulas don't evaluate or whose circuit drawings don't make a circuit, a unit linking a problem / lab that doesn't exist.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePortalsFile, parseWorldsFile, validateCourse, type Catalog } from '../src/core/course/catalog';
import { parseUnit, unitBlocks, type Unit } from '../src/core/course/unit';
import { extractNetlist } from '../src/core/problem/geometry';
import type { Schematic } from '../src/core/problem/types';
import { CHAPTERS } from '../src/core/problem/chapters';
import { buildChallengeIndex } from './challenge-index-plugin';
import { buildProblemIndex } from './problem-index-plugin';

export interface CourseReport {
  /** per unit file */
  units: { file: string; id?: string; errors: string[]; warnings: string[] }[];
  /** the map as a whole */
  errors: string[];
  warnings: string[];
  counts: { worlds: number; units: number; portals: number; pending: number };
}

const readJson = (p: string, errors: string[]): unknown => {
  try {
    return JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''));
  } catch (e) {
    errors.push(`${p}: ${(e as Error).message}`);
    return null;
  }
};

export function checkCourse(root: string): CourseReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { worlds, pending } = parseWorldsFile(readJson(join(root, 'course/worlds.json'), errors), errors, readJson(join(root, 'course/pending.json'), errors));
  const portals = parsePortalsFile(readJson(join(root, 'course/portals.json'), errors), errors);

  const units = new Map<string, Unit>();
  const unitReports: CourseReport['units'] = [];
  const dir = join(root, 'units');
  for (const name of existsSync(dir) ? readdirSync(dir).sort() : []) {
    if (!name.endsWith('.json') || name.startsWith('_')) continue;
    const file = `units/${name}`;
    const e: string[] = [];
    const json = readJson(join(dir, name), e);
    const r = json === null ? { unit: null, errors: e, warnings: [] } : parseUnit(json);
    if (r.unit) {
      // circuit blocks: the drawing must make a valid circuit (same geometry rules as theory problems)
      unitBlocks(r.unit).forEach((b, k) => {
        if (b.type !== 'circuit') return;
        const x = extractNetlist(b.schematic as Schematic);
        for (const m of x.errors) r.errors.push(`circuit #${k}: ${m}`);
        for (const m of x.warnings) r.warnings.push(`circuit #${k}: ${m}`);
      });
      if (units.has(r.unit.id)) r.errors.push(`id "${r.unit.id}" 重复 / duplicate`);
      else units.set(r.unit.id, r.unit);
    }
    unitReports.push({ file, ...(r.unit ? { id: r.unit.id } : {}), errors: r.errors, warnings: r.warnings });
  }

  const ch = buildChallengeIndex(root);
  const pr = buildProblemIndex(root);
  const cat: Catalog = {
    challenges: new Map(ch.entries.map((c) => [c.id, { title: c.title, kind: c.kind }])),
    chapters: new Map(CHAPTERS.map((c) => [c.id, { title: c.title() }])),
    problems: new Map(pr.entries.map((p) => [p.id, p.chapter])),
    units,
  };
  const planPath = join(root, 'docs/REBUILD_PLAN.md');
  const plan = existsSync(planPath) ? readFileSync(planPath, 'utf8') : '';
  if (!plan) errors.push('docs/REBUILD_PLAN.md 不存在 / missing');
  const v = validateCourse({ worlds, pending, portals }, cat, plan);
  errors.push(...v.errors);
  warnings.push(...v.warnings);
  return { units: unitReports, errors, warnings, counts: { worlds: worlds.length, units: units.size, portals: portals.length, pending: pending.length } };
}

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code: number) => (s: string) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const red = paint(31);
const green = paint(32);
const yellow = paint(33);

/** Print the report; returns the number of failures (unit files with errors + 1 if the map has errors). */
export function printCourse(r: CourseReport): number {
  let bad = 0;
  for (const u of r.units) {
    const ok = !u.errors.length;
    if (!ok) bad++;
    console.log(`${ok ? green('✔') : red('✘')} ${u.file}  ${u.id ?? ''}`);
    for (const e of u.errors) console.log(`    ${red('error')}  ${e}`);
    for (const w of u.warnings) console.log(`    ${yellow('warn')}   ${w}`);
  }
  const ok = !r.errors.length;
  console.log(`${ok ? green('✔') : red('✘')} course/worlds.json + course/portals.json`);
  for (const e of r.errors) console.log(`    ${red('error')}  ${e}`);
  for (const w of r.warnings) console.log(`    ${yellow('warn')}   ${w}`);
  if (!ok) bad++;
  const { worlds, units, portals, pending } = r.counts;
  const line = `课程地图 course map：${worlds} 个 World，${units} 个单元，${portals} 个传送门，${pending} 个待建单元；${bad} 项失败`;
  console.log(bad ? red(line) : green(line));
  return bad;
}

const entry = process.argv[1] ? resolve(process.argv[1]).replace(/\.[cm]?[jt]s$/, '') : '';
if (entry === fileURLToPath(import.meta.url).replace(/\.[cm]?[jt]s$/, '')) {
  if (printCourse(checkCourse(process.cwd()))) process.exit(1);
}
