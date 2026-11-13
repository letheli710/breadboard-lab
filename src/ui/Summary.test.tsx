import { readdirSync, readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, describe, expect, it } from 'vitest';
import { setLang } from '../core/i18n';
import { parseSummary } from '../core/summary/parse';
import { MathText, mathNodes } from './mathText';
import { SummaryBody } from './Summary';

const json = JSON.parse(readFileSync(new URL('../../summaries/basics.json', import.meta.url), 'utf8'));

describe('formula markup', () => {
  it('parses \\frac, \\sqrt, ^{} and _{} after non-letters (nested)', () => {
    expect(mathNodes('P = \\frac{u^{2}}{R_{1} + \\sqrt{2}}')).toEqual([
      { k: 'text', t: 'P = ' },
      {
        k: 'frac',
        num: [
          { k: 'text', t: 'u' },
          { k: 'sup', x: [{ k: 'text', t: '2' }] },
        ],
        den: [
          { k: 'text', t: 'R_{1} + ' },
          { k: 'sqrt', x: [{ k: 'text', t: '2' }] },
        ],
      },
    ]);
    expect(mathNodes('∫_{0}^{t}i dξ')).toEqual([
      { k: 'text', t: '∫' },
      { k: 'sub', x: [{ k: 'text', t: '0' }] },
      { k: 'sup', x: [{ k: 'text', t: 't' }] },
      { k: 'text', t: 'i dξ' },
    ]);
  });
  it('leaves X_sub to the symbol rules and unmatched markup as text', () => {
    expect(mathNodes('U̇_{ab} + e^(−5t) + \\frac{1}')).toEqual([{ k: 'text', t: 'U̇_{ab} + e^(−5t) + \\frac{1}' }]);
  });
  it('renders fractions, roots and subscripts', () => {
    const html = renderToStaticMarkup(<MathText text="τ = \frac{L}{R_eq} = \sqrt{LC}, e^{−t/τ}" />);
    expect(html).toContain('class="mx-frac"');
    expect(html).toContain('<sub>eq</sub>');
    expect(html).toContain('class="mx-rad"');
    expect(html).toContain('<sup>−t/τ</sup>');
    expect(html).not.toMatch(/\\frac|\^\{|_\{/);
  });
});

describe('matrix markup', () => {
  it('parses \\mat{…} into rows and cells, with nested markup', () => {
    expect(mathNodes('A = \\mat{1 & −1 ; 0 & \\frac{1}{2}}')).toEqual([
      { k: 'text', t: 'A = ' },
      {
        k: 'mat',
        rows: [
          [[{ k: 'text', t: '1' }], [{ k: 'text', t: '−1' }]],
          [[{ k: 'text', t: '0' }], [{ k: 'frac', num: [{ k: 'text', t: '1' }], den: [{ k: 'text', t: '2' }] }]],
        ],
      },
    ]);
  });
  it('renders a grid with one cell per entry (short rows padded) and no raw markup', () => {
    const html = renderToStaticMarkup(<MathText text="\mat{G_1 + G_2 & −G_2 ; −G_2}ᵀ" />);
    expect(html).toContain('class="mx-mat"');
    expect(html).toContain('repeat(2, auto)');
    expect(html.match(/<span>/g)?.length).toBeGreaterThanOrEqual(4);
    expect(html).toContain('<sub>1</sub>');
    expect(html.replace(/<[^>]+>/g, '')).not.toMatch(/\\mat|&amp;|;/);
  });
});

describe('summary page', () => {
  afterAll(() => setLang('zh'));
  for (const lang of ['zh', 'en'] as const)
    it(`renders basics without raw markup (${lang})`, () => {
      setLang(lang);
      const s = parseSummary(json, undefined, { verify: false }).summary!;
      const html = renderToStaticMarkup(<SummaryBody s={s} target={{ chapter: 'basics' }} problems={[]} />);
      for (const idea of s.ideas) expect(html).toContain(`id="sum-idea-${idea.id}"`);
      expect(html.match(/class="sum-formula"/g)?.length).toBe(s.formulas.length);
      expect(html.match(/<svg[^>]*ps-svg/g)?.length).toBe(s.examples.length);
      expect(html.match(/class="mx-frac"/g)?.length).toBeGreaterThan(0);
      // no unrendered markup: bold, subscripts, formula commands
      const text = html.replace(/<[^>]+>/g, '');
      expect(text).not.toMatch(/\*\*|\\frac|\\sqrt|\^\{|[A-Za-z]_[A-Za-z0-9{]/);
      expect(html).toContain(lang === 'zh' ? '公式表' : 'Formula sheet');
    });
});

describe('every summary renders without raw markup', () => {
  afterAll(() => setLang('zh'));
  const dir = new URL('../../summaries/', import.meta.url);
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')))
    for (const lang of ['zh', 'en'] as const)
      it(`${f} (${lang})`, () => {
        setLang(lang);
        const s = parseSummary(JSON.parse(readFileSync(new URL(f, dir), 'utf8')), undefined, { verify: false }).summary!;
        const text = renderToStaticMarkup(<SummaryBody s={s} target={{ chapter: s.chapter }} problems={[]} />).replace(/<[^>]+>/g, '');
        expect(text.match(/\*\*|\\[a-z]+\{|\^\{|.{0,8}_.{0,8}/g) ?? []).toEqual([]);
      });
});
