// The build-time problem index (scripts/problem-index-plugin.ts) must agree with what the parser
// makes of each built-in file, and parsing without engine verification must give the same
// problem text — that is what the app shows at runtime.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { buildProblemIndex } from '../../../scripts/problem-index-plugin';
import { setLang, type Lang } from '../i18n';
import { parseProblem } from './parse';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const { entries, broken } = buildProblemIndex(ROOT);

describe('problem index', () => {
  afterAll(() => setLang('zh'));
  it('covers every built-in problem file', () => {
    expect(broken).toEqual([]);
    expect(entries.length).toBeGreaterThan(100);
  });
  for (const lang of ['zh', 'en'] as Lang[])
    it(`matches the parsed problems (${lang})`, () => {
      setLang(lang);
      for (const e of entries) {
        const json = JSON.parse(readFileSync(join(ROOT, e.file), 'utf8'));
        const fast = parseProblem(json, 'folder', e.file, { verify: false });
        expect(fast.errors, e.file).toEqual([]);
        const p = fast.problem!;
        expect(p.id).toBe(e.id);
        expect(p.chapter).toBe(e.chapter);
        expect(p.level).toBe(e.level);
        expect(p.questions.map((q) => q.id)).toEqual(e.qids);
        expect(p.title).toBe(lang === e.lang ? e.title : e.titles[lang] || e.title);
        expect(fast.problem!.computed).toEqual({});
      }
    });
  it('verify: false gives the same problem apart from the engine values', () => {
    setLang('en');
    for (const e of entries.slice(0, 40)) {
      const json = JSON.parse(readFileSync(join(ROOT, e.file), 'utf8'));
      const full = parseProblem(json, 'folder', e.file);
      const fast = parseProblem(json, 'folder', e.file, { verify: false });
      expect({ ...fast.problem!, computed: full.problem!.computed }).toEqual(full.problem);
    }
  });
  it('still catches wrong answers when verifying', () => {
    const json = JSON.parse(readFileSync(join(ROOT, entries[0].file), 'utf8'));
    const q = json.questions.find((x: { find?: unknown }) => x.find);
    q.answer = q.answer * 3 + 1;
    expect(parseProblem(json).ok).toBe(false);
    expect(parseProblem(json, 'folder', undefined, { verify: false }).ok).toBe(true);
  });
});
