// Chapter summaries (summaries/<chapter>.json): every built-in file passes the validator with the
// engine (both languages, no warnings), links only to existing problems of its chapter and links
// every problem of the chapter; the validator rejects wrong worked-example numbers and broken links.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { buildProblemIndex, buildSummaryIndex } from '../../../scripts/problem-index-plugin';
import { setLang, type Lang } from '../i18n';
import { CHAPTERS } from '../problem/chapters';
import { ideaOfProblem, parseSummary, quantitiesIn } from './parse';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const DIR = join(ROOT, 'summaries');
const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  .sort();
const problems = buildProblemIndex(ROOT).entries.map((e) => ({ id: e.id, chapter: e.chapter }));
const load = (f: string) => JSON.parse(readFileSync(join(DIR, f), 'utf8'));
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

describe('built-in chapter summaries', () => {
  afterAll(() => setLang('zh'));
  it('exist for chapters that have problems, and the index lists them', () => {
    const idx = buildSummaryIndex(ROOT);
    expect(idx.broken).toEqual([]);
    expect(idx.entries.map((e) => e.file).sort()).toEqual(files.map((f) => `summaries/${f}`));
    expect(files.length).toBeGreaterThan(0);
    // every Practice chapter has its key-points page
    expect(files.map((f) => f.replace(/\.json$/, ''))).toEqual(CHAPTERS.map((c) => c.id).sort());
  });
  for (const f of files)
    for (const lang of ['zh', 'en'] as Lang[])
      it(`${f} validates with the engine (${lang})`, () => {
        setLang(lang);
        const r = parseSummary(load(f), `summaries/${f}`, { problems });
        expect(r.errors).toEqual([]);
        expect(r.warnings).toEqual([]);
        const s = r.summary!;
        expect(s.ideas.length).toBeGreaterThan(0);
        expect(s.examples.length).toBeGreaterThan(0);
        // verify: false (what the app does) gives the same text
        const fast = parseSummary(load(f), undefined, { verify: false });
        expect(fast.summary!.ideas).toEqual(s.ideas);
        expect(fast.summary!.formulas).toEqual(s.formulas);
        expect(fast.summary!.examples.map((e) => e.problem.solution)).toEqual(s.examples.map((e) => e.problem.solution));
      });
  it('every linked problem id exists in the chapter; every problem of the chapter is linked', () => {
    const byId = new Map(problems.map((p) => [p.id, p.chapter]));
    for (const f of files) {
      const json = load(f);
      const linked = new Set<string>();
      for (const idea of json.ideas)
        for (const id of idea.problems) {
          expect(byId.get(id), `${f}: ${id}`).toBe(json.chapter);
          linked.add(id);
        }
      for (const p of problems) if (p.chapter === json.chapter) expect(linked.has(p.id), `${f}: ${p.id} not linked`).toBe(true);
    }
  });
});

describe('summary validator', () => {
  afterAll(() => setLang('zh'));
  const base = load('basics.json');
  const errorsOf = (json: unknown) => {
    setLang('en');
    return parseSummary(json, 'summaries/basics.json', { problems }).errors.join('\n');
  };

  it('rejects a worked-example answer the engine disagrees with', () => {
    const j = clone(base);
    j.examples[0].results[0].answer *= 1.1;
    expect(errorsOf(j)).toMatch(/wrong answer/);
  });
  it('rejects a number in the steps that is neither given nor verified', () => {
    const j = clone(base);
    j.examples[0].steps.push('so the answer is 7.3 V');
    expect(errorsOf(j)).toMatch(/"7\.3 V" is neither given nor an engine-verified result/);
    const k = clone(base);
    k.examples[0].i18n.en.steps.push('or 123 mA');
    expect(errorsOf(k)).toMatch(/i18n\.en\.steps: "123 mA"/);
  });
  it('rejects links to unknown problems or problems of another chapter, and unlinked problems', () => {
    const j = clone(base);
    j.ideas[0].problems.push('no-such-problem', problems.find((p) => p.chapter !== 'basics')!.id);
    const e = errorsOf(j);
    expect(e).toMatch(/no problem "no-such-problem"/);
    expect(e).toMatch(/is in chapter/);
    const k = clone(base);
    for (const idea of k.ideas) idea.problems = idea.problems.filter((p: string) => p !== 'basics-13-kcl-chain');
    expect(errorsOf(k)).toMatch(/not linked from any key idea.*: basics-13-kcl-chain/);
  });
  it('rejects formulas without conditions and references to unknown ideas', () => {
    const j = clone(base);
    j.formulas[0].when = '';
    j.formulas[1].idea = 'nope';
    j.mistakes[0].idea = 'nope';
    const e = errorsOf(j);
    expect(e).toMatch(/"when" must not be empty/);
    expect(e).toMatch(/formulas\[1\] \(p-balance\)\.idea: no key idea "nope"/);
    expect(e).toMatch(/mistakes\[0\].*no key idea "nope"/);
  });
  it('warns about missing translations', () => {
    const j = clone(base);
    delete j.ideas[0].i18n;
    setLang('en');
    expect(parseSummary(j, undefined, { problems }).warnings.join('\n')).toMatch(/ideas\[0\] \(ref-dir\): no translation/);
  });
  it('localises and finds the key idea of a problem', () => {
    setLang('en');
    const s = parseSummary(base, undefined, { verify: false }).summary!;
    expect(s.ideas[0].title).toMatch(/Reference directions/);
    expect(s.examples[0].problem.title).toMatch(/which one delivers/);
    expect(ideaOfProblem(s, 'basics-13-kcl-chain')).toBe('kcl');
    expect(ideaOfProblem(s, 'nope')).toBeUndefined();
  });
  it('reads quantities with SI prefixes and units', () => {
    expect(quantitiesIn('u_C = 6.32 V, R_2 = 4.7 kΩ, i = −1.5 mA, ∠−36.87°, 50 Hz, τ = 2 ms, ω = 10 rad/s, S = 3 kVA').map((q) => q.value)).toEqual([
      6.32, 4700, -0.0015, -36.87, 50, 0.002, 10, 3000,
    ]);
    expect(quantitiesIn('U_s1 = 10 V; 12/4 = 3; 2 steps')).toEqual([{ value: 10, text: '10 V' }]);
  });
});
