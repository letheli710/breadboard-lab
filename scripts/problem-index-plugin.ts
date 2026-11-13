// Vite plugin: `virtual:problem-index` — a summary of every built-in theory problem
// (problems/<chapter>/*.json). The Practice sidebar and the progress card only need ids,
// chapters, levels, titles and question ids; that index is a lazily loaded chunk of its own
// (≈ 265 B per problem, fetched when the Practice page needs it), and the full problem files
// (~1.8 MB) are code-split per chapter and loaded on demand (see src/state/problems.ts).

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Plugin } from 'vite';

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

/** Every content *.json under `dir` (recursive, sorted; skips `_*` and `*.schema.json`). */
export function collectJson(dir: string, out: string[]) {
  let names: string[];
  try {
    names = readdirSync(dir).sort();
  } catch {
    return;
  }
  for (const name of names) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) collectJson(p, out);
    else if (name.toLowerCase().endsWith('.json') && !skipName(name)) out.push(p);
  }
}

export function buildProblemIndex(root: string): { entries: ProblemIndexEntry[]; broken: { file: string; error: string }[] } {
  const files: string[] = [];
  collectJson(join(root, 'problems'), files);
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
    if (isObj(json.i18n)) for (const [l, v] of Object.entries(json.i18n)) if (isObj(v) && typeof v.title === 'string' && v.title) titles[l] = v.title;
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

/** Group name reserved for the index module of a lazy index (`virtual:<name>/@index`). */
export const INDEX_GROUP = '@index';

/**
 * Shared machinery of the content index plugins (problems/, challenges/, summaries/):
 *  - `virtual:<name>` exports `groups`: { [group]: () => import(group module) } and either
 *    `entries` + `broken` (eager index) or, with `lazyIndex`, `loadIndex()`: a dynamic import
 *    of `virtual:<name>/@index`, which exports `entries` + `broken` and is a chunk of its own,
 *    so the index does not grow the entry chunk with the content
 *  - `virtual:<name>/<group>` default-exports { [file]: json } for every file of that group; each
 *    group becomes one lazily loaded chunk (one request, one loader instead of one per file)
 *  - dev: any add / change / delete of a JSON file under <root>/<dir>/ rebuilds the index and
 *    reloads the page
 */
export function contentIndexPlugin<E extends { file: string }>(opts: {
  name: string;
  dir: string;
  /** chunk group of an entry */
  groupOf: (e: E) => string;
  build: (root: string) => { entries: E[]; broken: { file: string; error: string }[] };
  /** emit the index as a separate lazily loaded chunk (`loadIndex()`) instead of inline */
  lazyIndex?: boolean;
}): Plugin {
  const ID = `virtual:${opts.name}`;
  const PREFIX = `${ID}/`;
  let root = process.cwd();
  let cache: ReturnType<typeof opts.build> | null = null;
  const index = () => (cache ??= opts.build(root));
  return {
    name: opts.name,
    configResolved(c) {
      root = c.root;
    },
    resolveId(id) {
      return id === ID || id.startsWith(PREFIX) ? '\0' + id : null;
    },
    load(id) {
      // JSON.parse of a string literal: faster to parse than the same object literal
      const data = () => {
        const { entries, broken } = index();
        return `export const entries = JSON.parse(${JSON.stringify(JSON.stringify(entries))});\nexport const broken = ${JSON.stringify(broken)};\n`;
      };
      if (id === '\0' + ID) {
        const groups = [...new Set(index().entries.map(opts.groupOf))];
        const loaders = groups.map((g) => `${JSON.stringify(g)}: () => import(${JSON.stringify(PREFIX + g)})`).join(',\n  ');
        const head = opts.lazyIndex ? `export const loadIndex = () => import(${JSON.stringify(PREFIX + INDEX_GROUP)});\n` : data();
        return `${head}export const groups = {\n  ${loaders}\n};\n`;
      }
      if (opts.lazyIndex && id === '\0' + PREFIX + INDEX_GROUP) return data();
      if (id.startsWith('\0' + PREFIX)) {
        const group = id.slice(1 + PREFIX.length);
        const files = index()
          .entries.filter((e) => opts.groupOf(e) === group)
          .map((e) => e.file);
        const imports = files.map((f, i) => `import f${i} from ${JSON.stringify(join(root, f).split(sep).join('/'))};`).join('\n');
        return `${imports}\nexport default {\n${files.map((f, i) => `  ${JSON.stringify(f)}: f${i},`).join('\n')}\n};\n`;
      }
      return null;
    },
    configureServer(server) {
      const onChange = (file: string) => {
        const rel = relative(root, file).split(sep).join('/');
        if (!rel.startsWith(`${opts.dir}/`) || !rel.toLowerCase().endsWith('.json')) return;
        cache = null;
        for (const mod of server.moduleGraph.idToModuleMap.values())
          if (mod.id && (mod.id === '\0' + ID || mod.id.startsWith('\0' + PREFIX))) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.add(join(root, opts.dir));
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
      server.watcher.on('change', onChange);
    },
    handleHotUpdate(ctx) {
      const rel = relative(root, ctx.file).split(sep).join('/');
      if (rel.startsWith(`${opts.dir}/`) && rel.toLowerCase().endsWith('.json')) return []; // full reload, see above
    },
  };
}

/** Chunk name for a content group module (manualChunks), e.g. "problems-basics". */
export function contentChunkName(id: string): string | null {
  const m = /^\0virtual:(problem-index|challenge-index|summary-index)\/(.+)$/.exec(id);
  if (!m) return null;
  if (m[2] === INDEX_GROUP) return m[1];
  return m[1] === 'problem-index' ? `problems-${m[2]}` : m[1] === 'summary-index' ? `summary-${m[2]}` : m[2];
}

export function problemIndexPlugin(): Plugin {
  return contentIndexPlugin({
    name: 'problem-index',
    dir: 'problems',
    groupOf: (e) => e.chapter,
    build: buildProblemIndex,
    lazyIndex: true,
  });
}

// ---- chapter summaries (summaries/<chapter>.json, "chapter-summary/1") ----------------------

export interface SummaryIndexEntry {
  chapter: string;
  /** path relative to the project root, e.g. "summaries/basics.json" */
  file: string;
}

/** Which chapters have a summary (tiny, eager); the files themselves are one lazy chunk each. */
export function buildSummaryIndex(root: string): { entries: SummaryIndexEntry[]; broken: { file: string; error: string }[] } {
  const files: string[] = [];
  collectJson(join(root, 'summaries'), files);
  const entries: SummaryIndexEntry[] = [];
  const broken: { file: string; error: string }[] = [];
  for (const abs of files) {
    const file = relative(root, abs).split(sep).join('/');
    try {
      const json = JSON.parse(readFileSync(abs, 'utf8'));
      if (!isObj(json) || typeof json.chapter !== 'string') throw new Error('missing "chapter"');
      entries.push({ chapter: json.chapter, file });
    } catch (e) {
      broken.push({ file, error: (e as Error).message });
    }
  }
  return { entries, broken };
}

export function summaryIndexPlugin(): Plugin {
  return contentIndexPlugin({
    name: 'summary-index',
    dir: 'summaries',
    groupOf: (e) => e.chapter,
    build: buildSummaryIndex,
  });
}
