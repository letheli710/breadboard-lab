// Vite plugin: `virtual:challenge-index` — a small, eagerly loaded summary of every built-in
// lesson / challenge (challenges/**/*.json). The carousel and the progress card only need ids,
// kinds, phases, levels and titles; the full files (targets, solutions, steps, tests — several
// hundred kB) are code-split into one chunk per group (lessons, intro challenges, phase 1…5,
// see challengeGroupOf) and loaded when a challenge of that group is opened
// (see src/state/challenges.ts). The machinery is shared with the problem index
// (contentIndexPlugin in problem-index-plugin.ts).

import { readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Plugin } from 'vite';
import { collectJson, contentIndexPlugin } from './problem-index-plugin';

export interface ChallengeIndexEntry {
  id: string;
  kind: 'lesson' | 'challenge';
  level: number;
  phase?: number;
  /** path relative to the project root, e.g. "challenges/03-light-an-led.json" */
  file: string;
  /** code-split group (chunk) the full file lives in */
  group: string;
  /** base language of the file ("zh" unless it says otherwise) */
  lang: string;
  title: string;
  /** translated titles by language (from i18n.<lang>.title) */
  titles: Record<string, string>;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Chunk group of a challenge file: lessons together, challenges by course phase. */
export function challengeGroupOf(json: unknown): string {
  if (!isObj(json)) return 'challenges-misc';
  if (json.kind === 'lesson') return 'challenges-lessons';
  return typeof json.phase === 'number' ? `challenges-phase${json.phase}` : 'challenges-intro';
}

export function buildChallengeIndex(root: string): { entries: ChallengeIndexEntry[]; broken: { file: string; error: string }[] } {
  const files: string[] = [];
  collectJson(join(root, 'challenges'), files);
  const entries: ChallengeIndexEntry[] = [];
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
    if (!isObj(json) || typeof json.id !== 'string' || !json.id) {
      broken.push({ file, error: 'missing "id"' });
      continue;
    }
    const titles: Record<string, string> = {};
    if (isObj(json.i18n)) for (const [l, v] of Object.entries(json.i18n)) if (isObj(v) && typeof v.title === 'string' && v.title) titles[l] = v.title;
    entries.push({
      id: json.id,
      kind: json.kind === 'lesson' ? 'lesson' : 'challenge',
      level: typeof json.level === 'number' ? Math.min(5, Math.max(1, Math.round(json.level))) : 1,
      ...(typeof json.phase === 'number' ? { phase: json.phase } : {}),
      file,
      group: challengeGroupOf(json),
      lang: typeof json.lang === 'string' ? json.lang : 'zh',
      title: typeof json.title === 'string' ? json.title : json.id,
      titles,
    });
  }
  return { entries, broken };
}

export function challengeIndexPlugin(): Plugin {
  return contentIndexPlugin({ name: 'challenge-index', dir: 'challenges', groupOf: (e) => e.group, build: buildChallengeIndex });
}
