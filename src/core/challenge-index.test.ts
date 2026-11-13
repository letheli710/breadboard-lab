// The build-time challenge index (scripts/challenge-index-plugin.ts) must agree with what
// parseChallenge makes of each built-in file: the carousel shows index titles / levels / phases
// until the full file of a group is loaded.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { buildChallengeIndex } from '../../scripts/challenge-index-plugin';
import { parseChallenge } from './challenge';
import { setLang, type Lang } from './i18n';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const { entries, broken } = buildChallengeIndex(ROOT);

describe('challenge index', () => {
  afterAll(() => setLang('zh'));
  it('covers every built-in challenge file, ids unique', () => {
    expect(broken).toEqual([]);
    expect(entries.length).toBeGreaterThan(60);
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
  });
  for (const lang of ['zh', 'en'] as Lang[])
    it(`matches the parsed challenges (${lang})`, () => {
      setLang(lang);
      for (const e of entries) {
        const r = parseChallenge(JSON.parse(readFileSync(join(ROOT, e.file), 'utf8')), 'folder', e.file);
        const c = r.challenge!;
        expect(r.errors, e.file).toEqual([]);
        expect(c.id).toBe(e.id);
        expect(c.kind).toBe(e.kind);
        expect(c.level).toBe(e.level);
        expect(c.phase).toBe(e.phase);
        expect(c.title).toBe(lang !== e.lang ? e.titles[lang] || e.title : e.title);
      }
    });
});
