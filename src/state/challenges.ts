// Loading challenges: built-in folder (code-split, hot-reloaded in dev) + files the user
// imports at runtime (kept in localStorage so they survive a reload).
//
// Startup cost: the carousel and the progress card only need a summary of each built-in
// lesson / challenge, which comes from a build-time index (virtual:challenge-index, see
// scripts/challenge-index-plugin.ts), itself a lazily loaded chunk (ensureChallengeIndex:
// requested by the router for Learn / Challenges / Import, or at idle time by the progress
// card; until it is in, the store's list is empty and `challengeIndex` says why, and the route
// waits for it, see state/routeSync.ts). The full files are split into one chunk per group
// (lessons, intro challenges, phase 1…5) and loaded when a challenge of that group is opened.
// Until then the store holds a *placeholder* Challenge for it (isPending() → true; title,
// kind, level and phase are real, target / steps / tests are empty); store.openChallenge()
// loads the group first (ensureChallenge) and opens the challenge once the real one is in.

import { getLang, tr } from '../core/i18n';
import type { Challenge, ChallengePhase, ValidationResult } from '../core/challenge';
import { loadIndex, groups as groupChunks } from 'virtual:challenge-index';
import type { ChallengeIndexEntry } from '../../scripts/challenge-index-plugin';
import { indexLoader } from './indexLoader';
import { useStore, type InvalidFile } from './store';

/** same test as core/problem/parse isProblemJson (not imported: that module is not small) */
export const isProblemJson = (json: unknown): boolean =>
  typeof json === 'object' && json !== null && typeof (json as { format?: unknown }).format === 'string' && (json as { format: string }).format.startsWith('circuit-problem');

const IMPORT_KEY = 'bb.imported';

export interface ImportedFile {
  file: string;
  text: string;
}

export function readImported(): ImportedFile[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(IMPORT_KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((f): f is ImportedFile => typeof f?.file === 'string' && typeof f?.text === 'string') : [];
  } catch {
    return [];
  }
}

/** Returns false when the browser refused to save (storage full or unavailable). */
export function writeImported(files: ImportedFile[]): boolean {
  try {
    localStorage.setItem(IMPORT_KEY, JSON.stringify(files));
    return true;
  } catch {
    return false;
  }
}

const skip = (path: string) => {
  const name = path.split('/').pop() ?? '';
  return name.startsWith('_') || /(^|\.)schema\.json$/i.test(name);
};

// ---- the built-in index (its own chunk) ------------------------------------------------

const index = indexLoader(
  () => Promise.all([loadIndex(), readImported().length ? loadParser() : null]).then(([m]) => m),
  (status) => {
    // the list first, then the status: whoever waits for "ready" (the router) finds the list in
    if (status === 'ready') {
      refreshChallenges();
      // dev: load every group in the background, so a broken file in challenges/ shows up on
      // the Import page right away (in production `npm run validate` guards the built-in files)
      if (import.meta.env.DEV && typeof window !== 'undefined')
        setTimeout(() => {
          for (const g of new Set(builtinIndex().map((e) => e.group))) loadGroup(g).catch(() => undefined);
        }, 1500);
    }
    useStore.setState({ challengeIndex: status });
  },
);
const builtinIndex = (): ChallengeIndexEntry[] => index.data?.entries ?? [];

/** Fetch the built-in lesson / challenge index (once; a failed request is retried on the next call). */
export function ensureChallengeIndex(): Promise<void> {
  return index.ensure().then(
    () => undefined,
    () => undefined, // the status says it failed; the bench page offers a retry
  );
}

// ---- built-in files, by group -------------------------------------------------------

// The challenge parser (with the simulator's measurement definitions it validates against) is
// only needed once challenge files are loaded, so it is a chunk of its own as well.
type ParseModule = typeof import('../core/challenge');
let parseMod: ParseModule | null = null;
let parseLoad: Promise<ParseModule> | null = null;
function loadParser(): Promise<ParseModule> {
  if (!parseLoad) {
    parseLoad = import('../core/challenge').then((m) => (parseMod = m));
    parseLoad.catch(() => (parseLoad = null)); // retry on the next request
  }
  return parseLoad;
}

/** raw JSON of loaded built-in files, by file ("challenges/…json") */
const jsonCache = new Map<string, unknown>();
const groupLoads = new Map<string, Promise<void>>();
/** groups whose chunk failed to load (cleared on retry) */
const loadFailed = new Map<string, string>();
/** parse results of built-in files, by language + file */
const parsedCache = new Map<string, ValidationResult>();
const placeholders = new WeakSet<Challenge>();

/** True for a built-in challenge whose file is not loaded yet (only its index entry is known). */
export const isPending = (c: Challenge) => placeholders.has(c);

/** Load every file of a group (they share a chunk, so one request), then refresh the store. */
export function loadGroup(group: string): Promise<void> {
  let p = groupLoads.get(group);
  if (!p) {
    loadFailed.delete(group);
    // one chunk per group (virtual:challenge-index/<group>): { [file]: json }
    const load = groupChunks[group];
    p = Promise.all([load ? load() : Promise.resolve({ default: {} }), loadParser()]).then(
      ([m]) => {
        for (const [file, json] of Object.entries(m.default)) jsonCache.set(file, json);
        refreshChallenges();
      },
      (err) => {
        groupLoads.delete(group); // allow a retry (next time a challenge of the group is opened)
        loadFailed.set(group, (err as Error)?.message ?? String(err));
        refreshChallenges();
        throw err;
      },
    );
    groupLoads.set(group, p);
  }
  return p;
}

/** Make sure the full challenge `id` is loaded; resolves false if it could not be. */
export async function ensureChallenge(id: string): Promise<boolean> {
  await ensureChallengeIndex();
  const e = builtinIndex().find((x) => x.id === id);
  if (!e) return false;
  try {
    await loadGroup(e.group);
    return true;
  } catch {
    return false;
  }
}

/** Rebuild the store's list (built-in index + imported files): after the index or a group
 *  arrived, a language switch or an import. Nothing happens before the index is in. */
export function refreshChallenges() {
  if (!index.data) return;
  const r = loadAll();
  useStore.getState().setChallenges(r.challenges, r.invalid);
}

function placeholder(e: ChallengeIndexEntry): Challenge {
  const l = getLang();
  const t = l !== e.lang ? e.titles[l] : undefined;
  const c: Challenge = {
    id: e.id,
    title: t || e.title,
    level: e.level,
    kind: e.kind,
    phase: e.phase as ChallengePhase | undefined,
    summary: '',
    description: '',
    concepts: [],
    target: { components: [], nets: [] },
    tests: [],
    measurements: [],
    compare: '',
    hints: [],
    steps: [],
    cards: [],
    figures: {},
    tolerance: 0.05,
    allowExtraComponents: false,
    textLang: t ? l : (e.lang as Challenge['textLang']),
    source: 'folder',
    file: e.file,
  };
  placeholders.add(c);
  return c;
}

export function loadAll(): { challenges: Challenge[]; invalid: InvalidFile[] } {
  const challenges: Challenge[] = [];
  const invalid: InvalidFile[] = [];
  const seen = new Set<string>();
  const put = (c: Challenge) => {
    if (seen.has(c.id)) {
      // a later import with the same id replaces the earlier one
      const i = challenges.findIndex((x) => x.id === c.id);
      challenges.splice(i, 1);
    }
    seen.add(c.id);
    challenges.push(c);
  };
  const addResult = (r: ValidationResult, source: string, file: string) => {
    if (!r.ok || !r.challenge) {
      invalid.push({ file, source, errors: r.errors, warnings: r.warnings });
      return;
    }
    put(r.challenge);
    if (r.warnings.length) invalid.push({ file, source, errors: [], warnings: r.warnings });
  };

  for (const b of index.data?.broken ?? [])
    invalid.push({ file: b.file, source: 'folder', errors: [tr(`JSON 无法读取：${b.error}`, `Couldn't read the JSON: ${b.error}`)], warnings: [] });
  const failedShown = new Set<string>();
  for (const e of builtinIndex()) {
    const json = jsonCache.get(e.file);
    if (json === undefined || !parseMod) {
      const f = loadFailed.get(e.group);
      if (f && !failedShown.has(e.group)) {
        failedShown.add(e.group);
        invalid.push({ file: e.file, source: 'folder', errors: [tr(`题目文件加载失败：${f}`, `Couldn't load the challenge file: ${f}`)], warnings: [] });
      }
      put(placeholder(e));
      continue;
    }
    const k = `${getLang()}|${e.file}`;
    let r = parsedCache.get(k);
    if (!r) {
      r = parseMod.parseChallenge(json, 'folder', e.file);
      parsedCache.set(k, r);
    }
    addResult(r, 'folder', e.file);
  }
  const imported = readImported();
  if (imported.length && !parseMod) {
    // parser not loaded yet: list the imported files once it is
    loadParser().then(refreshChallenges, () => undefined);
    return { challenges, invalid };
  }
  for (const f of imported) {
    let json: unknown;
    try {
      json = JSON.parse(f.text);
    } catch (e) {
      invalid.push({ file: f.file, source: 'imported', errors: [tr(`JSON 语法错误：${(e as Error).message}`, `JSON syntax error: ${(e as Error).message}`)], warnings: [] });
      continue;
    }
    if (isProblemJson(json)) continue; // theory problems are loaded by state/problems.ts
    addResult(parseMod!.parseChallenge(json, 'imported', f.file), 'imported', f.file);
  }
  return { challenges, invalid };
}

/** `saved: false` = the browser refused to store the files (nothing was imported). */
export async function importFiles(files: File[]): Promise<{ added: number; skipped: number; saved: boolean }> {
  const current = readImported();
  let added = 0;
  let skipped = 0;
  for (const f of files) {
    if (!f.name.toLowerCase().endsWith('.json') || skip(f.name)) {
      skipped++;
      continue;
    }
    const text = await f.text();
    const file = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;
    const i = current.findIndex((c) => c.file === file);
    if (i >= 0) current[i] = { file, text };
    else current.push({ file, text });
    added++;
  }
  const saved = added === 0 || writeImported(current);
  return { added: saved ? added : 0, skipped, saved };
}

/** The open lesson / challenge (null off the learn / challenge pages). */
export function useActiveChallenge(): Challenge | null {
  const id = useStore((s) => s.activeId);
  const list = useStore((s) => s.challenges);
  const mode = useStore((s) => s.mode);
  if (mode !== 'learn' && mode !== 'challenge') return null;
  return list.find((c) => c.id === id) ?? null;
}
