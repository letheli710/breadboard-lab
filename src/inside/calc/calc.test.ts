// Sanity checks for the calculation cards: unique ids, every group / lesson / teardown they point at
// exists, and every calculator gives a finite number on its default inputs — in both languages.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { LANGS, setLang } from '../../core/i18n';
import { TEARDOWNS } from '../registry';
import { allCalcs, calcGroups } from './all';

const dir = join(__dirname, '../../../challenges');
const challengeIds = new Set(
  readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => (JSON.parse(readFileSync(join(dir, f), 'utf8')) as { id: string }).id),
);
const chapters = new Set(
  readdirSync(join(__dirname, '../../../problems'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name),
);
const teardowns = new Set(TEARDOWNS.map((t) => t.id));

describe.each(LANGS)('calculation cards (%s)', (lang) => {
  setLang(lang);
  const cards = allCalcs();
  const groups = calcGroups();
  afterAll(() => setLang('zh'));

  it('have unique ids and known groups', () => {
    const ids = cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const gids = new Set(groups.map((g) => g.id));
    expect(gids.size).toBe(groups.length);
    for (const c of cards) expect(gids, c.id).toContain(c.group);
    for (const g of gids)
      expect(
        cards.some((c) => c.group === g),
        g,
      ).toBe(true);
  });

  it('point only at lessons, teardowns and chapters that exist', () => {
    for (const c of cards) {
      for (const l of c.lessons ?? []) expect(challengeIds, `${c.id} → ${l}`).toContain(l);
      for (const t of c.teardowns ?? []) expect(teardowns, `${c.id} → ${t}`).toContain(t);
      if (c.chapter) expect(chapters, `${c.id} → ${c.chapter}`).toContain(c.chapter);
    }
  });

  it('compute a finite number from their defaults', () => {
    for (const c of cards) {
      const v = Object.fromEntries(c.vars.map((x) => [x.sym, x.def]));
      const r = c.compute(v);
      expect(Number.isFinite(r), `${c.id} = ${r}`).toBe(true);
      expect(c.vars.length, c.id).toBeGreaterThan(0);
      expect(c.why.length, c.id).toBeGreaterThan(40);
    }
  });

  it('use only the formula markup MathText understands', () => {
    // \frac, \sqrt and \mat are the only commands; anything else would show a raw backslash
    const bad = /\\(?!frac\{|sqrt\{|mat\{)[a-zA-Z%]/;
    for (const c of cards) {
      if (c.group === 'dc' || c.group === 'opamp') continue; // owned elsewhere
      for (const s of [c.tex, c.why, c.example ?? '', ...(c.pitfalls ?? [])]) expect(bad.test(s), `${c.id}: ${s.match(bad)?.[0]}`).toBe(false);
    }
  });
});

it('every lesson / lab that asks for a calculation has a card', () => {
  setLang('en');
  const used = new Set(allCalcs().flatMap((c) => c.lessons ?? []));
  // lessons that only teach wiring (no numbers to work out)
  const noCalc = new Set(['lesson-schematic-to-breadboard']);
  const missing = [...challengeIds].filter((id) => !used.has(id) && !noCalc.has(id));
  setLang('zh');
  expect(missing).toEqual([]);
});
