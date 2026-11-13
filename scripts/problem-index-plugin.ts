// Vite plugin: `virtual:problem-index` — a small, eagerly loaded summary of every built-in
// theory problem (problems/<chapter>/*.json). The Practice sidebar and the progress card only
// need ids, chapters, levels, titles and question ids; the full problem files (~1.8 MB) are
// code-split per chapter and loaded on demand (see src/state/problems.ts).

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Plugin } from 'vite';

const ID = 'virtual:problem-index';
const RESOLVED = '\0' + ID;

export interface ProblemIndexEntry {
  id: string;
  chapter: string;
  level: number;
  /** path relative to the project root, e.g. "problems/basics/01-ohm.json" */
  file: string;
  /** base language of the file ("zh" unless it says otherwise) */
  lang: string;
  title: string;
  /** translated titles by language (from i18n.<lang>.title) */
  titles: Record<string, string>;
  /** question ids (a problem is done once all of them are answered) */
  qids: string[];
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const skipName = (name: string) => name.startsWith('_') || /(^|\.)schema\.json$/i.test(name);

function collect(dir: string, out: string[]) {
  let names: string[];
  try {
    names = readdirSync(dir).sort();
  } catch {
    return;
  }
  for (const name of names) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) collect(p, out);
    else if (name.toLowerCase().endsWith('.json') && !skipName(name)) out.push(p);
  }
}

export function buildProblemIndex(root: string): { entries: ProblemIndexEntry[]; broken: { file: string; error: string }[] } {
  const files: string[] = [];
  collect(join(root, 'problems'), files);
  const entries: ProblemIndexEntry[] = [];
  const broken: { file: string; error: string }[] = [];
  for (const abs of files) {
    const file = relative(root, abs).split(sep).join('/');
    let json: unknown;
    try {
      json = JSON.parse(readFileSync(abs, 'utf8'));
    } catch (e) {
      broken.push({ file, error: (e as Error).message });
      continue;
    }
    if (!isObj(json) || typeof json.id !== 'string' || typeof json.chapter !== 'string') {
      broken.push({ file, error: 'missing "id" / "chapter"' });
      continue;
    }
    const titles: Record<string, string> = {};
    if (isObj(json.i18n))
      for (const [l, v] of Object.entries(json.i18n)) if (isObj(v) && typeof v.title === 'string' && v.title) titles[l] = v.title;
    entries.push({
      id: json.id,
      chapter: json.chapter,
      level: typeof json.level === 'number' ? json.level : 1,
      file,
      lang: typeof json.lang === 'string' ? json.lang : 'zh',
      title: typeof json.title === 'string' ? json.title : json.id,
      titles,
      qids: Array.isArray(json.questions) ? json.questions.map((q) => (isObj(q) && typeof q.id === 'string' ? q.id : '')) : [],
    });
  }
  return { entries, broken };
}

export function problemIndexPlugin(): Plugin {
  let root = process.cwd();
  return {
    name: 'problem-index',
    configResolved(c) {
      root = c.root;
    },
    resolveId(id) {
      return id === ID ? RESOLVED : null;
    },
    load(id) {
      if (id !== RESOLVED) return null;
      const { entries, broken } = buildProblemIndex(root);
      return `export const entries = ${JSON.stringify(entries)};\nexport const broken = ${JSON.stringify(broken)};\n`;
    },
    // dev: any change to problems/ (edit, add, delete) rebuilds the index and reloads the page
    configureServer(server) {
      const onChange = (file: string) => {
        const rel = relative(root, file).split(sep).join('/');
        if (!rel.startsWith('problems/') || !rel.toLowerCase().endsWith('.json')) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.add(join(root, 'problems'));
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
      server.watcher.on('change', onChange);
    },
    handleHotUpdate(ctx) {
      const rel = relative(root, ctx.file).split(sep).join('/');
      if (rel.startsWith('problems/')) return []; // handled by the watcher above (full reload)
    },
  };
}
