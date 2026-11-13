// Loading theory problems ("circuit-problem/1"): the built-in problems/ folder + problem files
// the user imported on the Import page. Imported files share the challenge import storage
// (bb.imported); each file is routed by its "format".
//
// Startup cost: the sidebar and progress only need a summary of each problem, which comes from
// a build-time index (virtual:problem-index, see scripts/problem-index-plugin.ts). The full
// built-in files are code-split per chapter and loaded on demand (useProblem); the parser too. Built-in
// problems are parsed *without* recomputing answers with the analysis engine — that check is
// enforced by `npm run validate` and the test suite. Imported files are fully verified.

import { useEffect, useState } from 'react';
import { entries as builtinIndex, broken as builtinBroken, groups as chapterChunks } from 'virtual:problem-index';
import { getLang, tr } from '../core/i18n';
import type { Problem } from '../core/problem/parse';
import { CHAPTERS } from '../core/problem/chapters';
import { isProblemJson, readImported } from './challenges';
import { useStore, type InvalidFile } from './store';

/** What the sidebar / progress need about a problem; the full text is loaded with useProblem(). */
export interface ProblemEntry {
  id: string;
  chapter: string;
  level: number;
  file?: string;
  /** "folder" | "imported" */
  source: string;
  /** base-language title + translations */
  lang: string;
  title: string;
  titles: Record<string, string>;
  qids: string[];
  /** imported problems keep their JSON (it lives in localStorage anyway) */
  json?: unknown;
}

/** Title in the current language. */
export function entryTitle(e: Pick<ProblemEntry, 'lang' | 'title' | 'titles'>): string {
  const l = getLang();
  return l === e.lang ? e.title : e.titles[l] || e.title;
}

// The parser (and with it the analysis engine that verifies imported files) is not needed until
// a problem is opened or a problem file was imported, so it is loaded on demand too.
type ParseModule = typeof import('../core/problem/parse');
let parseMod: ParseModule | null = null;
let parseLoad: Promise<ParseModule> | null = null;
function loadParser(): Promise<ParseModule> {
  if (!parseLoad) {
    parseLoad = import('../core/problem/parse').then((m) => (parseMod = m));
    parseLoad.catch(() => (parseLoad = null)); // retry on the next request
  }
  return parseLoad;
}

const chapterIndex = (id: string) => {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return i < 0 ? CHAPTERS.length : i;
};

/** Course order: chapter (as in CHAPTERS), then level, then file name. */
export function sortProblems<T extends { chapter: string; level: number; file?: string; id: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => chapterIndex(a.chapter) - chapterIndex(b.chapter) || a.level - b.level || (a.file ?? a.id).localeCompare(b.file ?? b.id));
}

const errText = (e: unknown) => tr(`解析时出错：${(e as Error).message}`, `Error while parsing: ${(e as Error).message}`);

/** Built-in index + imported problems (imported ones are parsed and verified with the engine). */
export function loadProblems(): { problems: ProblemEntry[]; invalid: InvalidFile[] } {
  const byId = new Map<string, ProblemEntry>();
  const invalid: InvalidFile[] = [];
  for (const b of builtinBroken) invalid.push({ file: b.file, source: 'folder', errors: [errText(new Error(b.error))], warnings: [] });
  for (const e of builtinIndex) {
    byId.delete(e.id);
    byId.set(e.id, { ...e, source: 'folder' });
  }
  for (const f of readImported()) {
    let json: unknown;
    try {
      json = JSON.parse(f.text);
    } catch {
      continue; // JSON syntax errors are reported once, by the challenge loader
    }
    if (!isProblemJson(json)) continue;
    if (!parseMod) {
      // parser not loaded yet: load it and list the imported problems once it is
      loadParser().then(
        () => {
          const r = loadProblems();
          useStore.getState().setProblems(r.problems, r.invalid);
        },
        () => undefined,
      );
      break;
    }
    let r;
    try {
      r = parseMod.parseProblem(json, 'imported', f.file);
    } catch (e) {
      // never let one broken file take the whole practice area down
      invalid.push({ file: f.file, source: 'imported', errors: [errText(e)], warnings: [] });
      continue;
    }
    if (!r.ok || !r.problem) {
      invalid.push({ file: f.file, source: 'imported', errors: r.errors, warnings: r.warnings });
      continue;
    }
    const p = r.problem;
    byId.delete(p.id); // a later import with the same id replaces the earlier one
    const src = json as { lang?: unknown; title?: unknown; i18n?: Record<string, { title?: unknown }> };
    const titles: Record<string, string> = {};
    for (const [l, v] of Object.entries(src.i18n ?? {})) if (v && typeof v.title === 'string' && v.title) titles[l] = v.title;
    byId.set(p.id, {
      id: p.id,
      chapter: p.chapter,
      level: p.level,
      file: f.file,
      source: 'imported',
      lang: typeof src.lang === 'string' ? src.lang : 'zh',
      title: typeof src.title === 'string' ? src.title : p.title,
      titles,
      qids: p.questions.map((q) => q.id),
      json,
    });
    if (r.warnings.length) invalid.push({ file: f.file, source: 'imported', errors: [], warnings: r.warnings });
  }
  return { problems: sortProblems([...byId.values()]), invalid };
}

// ---- full problems, on demand ---------------------------------------------------------

const jsonCache = new Map<string, unknown>();
const jsonLoads = new Map<string, Promise<void>>();
/** chapters whose chunk failed to load (cleared on retry) */
const loadFailed = new Map<string, string>();
/** parsed problems by language + source + file/id */
const parsed = new Map<string, { problem?: Problem; errors: string[] }>();

const keyOf = (e: ProblemEntry) => `${e.source}:${e.file ?? e.id}`;

/** Load every file of a chapter (they share a chunk, so one request). */
export function loadChapter(chapter: string): Promise<void> {
  let p = jsonLoads.get(chapter);
  if (!p) {
    // one chunk per chapter (virtual:problem-index/<chapter>): { [file]: json }
    const load = chapterChunks[chapter];
    p = Promise.all([loadParser(), load ? load() : Promise.resolve({ default: {} })]).then(([, m]) => {
      for (const [file, json] of Object.entries(m.default)) jsonCache.set(`folder:${file}`, json);
    });
    loadFailed.delete(chapter);
    p.catch((err) => {
      jsonLoads.delete(chapter); // allow a retry (next time the problem is opened)
      loadFailed.set(chapter, (err as Error)?.message ?? String(err));
    });
    jsonLoads.set(chapter, p);
  }
  return p;
}

/** The full problem in the current language, if its file is loaded (synchronous, cached). */
export function getProblem(e: ProblemEntry): { problem?: Problem; errors: string[] } | null {
  const json = e.source === 'folder' ? jsonCache.get(keyOf(e)) : e.json;
  if (json === undefined || !parseMod) {
    const f = e.source === 'folder' ? loadFailed.get(e.chapter) : undefined;
    return f ? { errors: [tr(`题目文件加载失败：${f}`, `Couldn't load the problem file: ${f}`)] } : null;
  }
  const k = `${getLang()}|${keyOf(e)}`;
  let r = parsed.get(k);
  if (!r) {
    try {
      // imported files were verified by loadProblems(); this pass only localises
      const v = parseMod.parseProblem(json, e.source, e.file, { verify: false });
      r = { problem: v.problem, errors: v.errors };
    } catch (err) {
      r = { errors: [errText(err)] };
    }
    parsed.set(k, r);
  }
  return r;
}

/** Full problem for an entry (loading its chapter if needed); re-localises on a language switch. */
export function useProblem(e: ProblemEntry | null): { problem?: Problem; errors: string[] } | null {
  useStore((s) => s.lang);
  const [, bump] = useState(0);
  const r = e ? getProblem(e) : null;
  useEffect(() => {
    if (!e || r) return;
    let live = true;
    (e.source === 'folder' ? loadChapter(e.chapter) : loadParser()).then(
      () => live && bump((n) => n + 1),
      () => live && bump((n) => n + 1),
    );
    return () => {
      live = false;
    };
  }, [e, r]);
  return r;
}
