// Loading challenges: built-in folder (bundled by Vite, hot-reloaded in dev) + files the
// user imports at runtime (kept in localStorage so they survive a reload).

import { parseChallenge, type Challenge } from '../core/challenge';
import { tr } from '../core/i18n';
import { isProblemJson } from '../core/problem/parse';
import type { InvalidFile } from './store';

const folder = import.meta.glob('../../challenges/**/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;

const IMPORT_KEY = 'bb.imported';

export interface ImportedFile {
  file: string;
  text: string;
}

export function readImported(): ImportedFile[] {
  try {
    return JSON.parse(localStorage.getItem(IMPORT_KEY) ?? '[]') as ImportedFile[];
  } catch {
    return [];
  }
}

export function writeImported(files: ImportedFile[]) {
  try {
    localStorage.setItem(IMPORT_KEY, JSON.stringify(files));
  } catch {
    /* storage unavailable */
  }
}

const skip = (path: string) => {
  const name = path.split('/').pop() ?? '';
  return name.startsWith('_') || /(^|\.)schema\.json$/i.test(name);
};

export function loadAll(): { challenges: Challenge[]; invalid: InvalidFile[] } {
  const challenges: Challenge[] = [];
  const invalid: InvalidFile[] = [];
  const seen = new Set<string>();
  const add = (json: unknown, source: string, file: string) => {
    const r = parseChallenge(json, source, file);
    if (!r.ok || !r.challenge) {
      invalid.push({ file, source, errors: r.errors, warnings: r.warnings });
      return;
    }
    if (seen.has(r.challenge.id)) {
      // a later import with the same id replaces the earlier one
      const i = challenges.findIndex((c) => c.id === r.challenge!.id);
      challenges.splice(i, 1);
    }
    seen.add(r.challenge.id);
    challenges.push(r.challenge);
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
    } catch (e) {
      invalid.push({ file: f.file, source: 'imported', errors: [tr(`JSON 语法错误：${(e as Error).message}`, `JSON syntax error: ${(e as Error).message}`)], warnings: [] });
      continue;
    }
    if (isProblemJson(json)) continue; // theory problems are loaded by state/problems.ts
    add(json, 'imported', f.file);
  }
  return { challenges, invalid };
}

export async function importFiles(files: File[]): Promise<{ added: number; skipped: number }> {
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
  writeImported(current);
  return { added, skipped };
}
