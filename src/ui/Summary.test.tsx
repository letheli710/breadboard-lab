import { readFileSync } from 'node:fs';
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
        num: [{ k: 'text', t: 'u' }, { k: 'sup', x: [{ k: 'text', t: '2' }] }],
        den: [{ k: 'text', t: 'R_{1} + ' }, { k: 'sqrt', x: [{ k: 'text', t: '2' }] }],
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
