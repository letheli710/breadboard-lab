// Loading theory problems ("circuit-problem/1"): the built-in problems/ folder (bundled by
// Vite, hot-reloaded in dev) + problem files the user imported on the Import page. Imported
// files share the challenge import storage (bb.imported); each file is routed by its "format".

import { tr } from '../core/i18n';
import { isProblemJson, parseProblem, type Problem } from '../core/problem/parse';
import { CHAPTERS } from '../core/problem/chapters';
import { readImported } from './challenges';
import type { InvalidFile } from './store';

const folder = import.meta.glob('../../problems/**/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;

const skip = (path: string) => {
  const name = path.split('/').pop() ?? '';
  return name.startsWith('_') || /(^|\.)schema\.json$/i.test(name);
};

const chapterIndex = (id: string) => {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return i < 0 ? CHAPTERS.length : i;
};

/** Course order: chapter (as in CHAPTERS), then level, then file name. */
export function sortProblems(list: Problem[]): Problem[] {
  return [...list].sort((a, b) => chapterIndex(a.chapter) - chapterIndex(b.chapter) || a.level - b.level || (a.file ?? a.id).localeCompare(b.file ?? b.id));
}

export function loadProblems(): { problems: Problem[]; invalid: InvalidFile[] } {
  const byId = new Map<string, Problem>();
  const invalid: InvalidFile[] = [];
  const add = (json: unknown, source: string, file: string) => {
    let r;
    try {
      r = parseProblem(json, source, file);
    } catch (e) {
      // never let one broken file take the whole practice area down
      invalid.push({ file, source, errors: [tr(`解析时出错：${(e as Error).message}`, `Error while parsing: ${(e as Error).message}`)], warnings: [] });
      return;
    }
    if (!r.ok || !r.problem) {
      invalid.push({ file, source, errors: r.errors, warnings: r.warnings });
      return;
    }
    byId.delete(r.problem.id); // a later import with the same id replaces the earlier one
    byId.set(r.problem.id, r.problem);
    if (r.warnings.length) invalid.push({ file, source, errors: [], warnings: r.warnings });
  };

  for (const path of Object.keys(folder).sort()) {
    if (skip(path)) continue;
    add(folder[path], 'folder', path.replace('../../', ''));
  }
  for (const f of readImported()) {
    let json: unknown;
    try {
      json = JSON.parse(f.text);
    } catch {
      continue; // JSON syntax errors are reported once, by the challenge loader
    }
    if (isProblemJson(json)) add(json, 'imported', f.file);
  }
  return { problems: sortProblems([...byId.values()]), invalid };
}
