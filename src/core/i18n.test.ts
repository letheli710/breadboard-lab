import { afterEach, describe, expect, it } from 'vitest';
import { parseChallenge } from './challenge';
import { boardDiagnostics } from './diagnostics';
import { setLang } from './i18n';
import { buildNetlist } from './netlist';
import { simulate } from './solver';

const base = {
  format: 'breadboard-challenge/1',
  id: 'i18n-test',
  title: '点亮 LED',
  summary: '中文摘要',
  description: ['第一行', '第二行'],
  concepts: ['极性'],
  components: [
    { ref: 'V1', type: 'dc_source', voltage: 5 },
    { ref: 'R1', type: 'resistor', resistance: 330 },
    { ref: 'LED1', type: 'led', color: 'red' },
  ],
  connections: [
    ['V1.+', 'R1.1'],
    ['R1.2', 'LED1.anode'],
    ['LED1.cathode', 'V1.-'],
  ],
  tests: [{ name: '灯亮', expect: { LED1: 'on' } }],
  steps: [{ text: '插电阻', highlight: ['a1'] }, '插 LED'],
  hints: ['看极性', '算电阻'],
  i18n: {
    en: {
      title: 'Light an LED',
      description: ['line one', 'line two'],
      concepts: ['polarity'],
      steps: ['Place the resistor', 'Place the LED'],
      tests: ['LED on'],
      hints: ['Check polarity', 'Work out R'],
    },
  },
};

afterEach(() => setLang('zh'));

describe('challenge translations', () => {
  it('uses the base text when the UI language matches the file', () => {
    const ch = parseChallenge(base).challenge!;
    expect(ch.title).toBe('点亮 LED');
    expect(ch.textLang).toBe('zh');
    expect(ch.steps.map((s) => s.text)).toEqual(['插电阻', '插 LED']);
  });

  it('overlays the translation and keeps step highlights from the base', () => {
    setLang('en');
    const ch = parseChallenge(base).challenge!;
    expect(ch.textLang).toBe('en');
    expect(ch.title).toBe('Light an LED');
    expect(ch.description).toBe('line one\nline two');
    expect(ch.steps[0]).toEqual({ text: 'Place the resistor', highlight: ['a1'] });
    expect(ch.tests[0].name).toBe('LED on');
    expect(ch.hints).toEqual(['Check polarity', 'Work out R']);
    // fields the translation leaves out fall back to the base language
    expect(ch.summary).toBe('中文摘要');
  });

  it('falls back to the base text when no translation exists', () => {
    setLang('en');
    const { i18n: _, ...plain } = base;
    const ch = parseChallenge(plain).challenge!;
    expect(ch.title).toBe('点亮 LED');
    expect(ch.textLang).toBe('zh');
  });

  it('treats "lang" as the language of the top-level text', () => {
    const ch = parseChallenge({ ...base, lang: 'en', title: 'Light an LED', i18n: { zh: { title: '点亮 LED' } } }).challenge!;
    expect(ch.title).toBe('点亮 LED');
  });

  it('figures: parsed, checked like a problem drawing, captions translated by position', () => {
    const schematic = {
      elements: [
        { ref: 'V1', type: 'V', from: [0, 0], to: [0, 2], value: 5 },
        { ref: 'R1', type: 'R', from: [2, 0], to: [2, 2], value: 330 },
      ],
      wires: [
        [
          [0, 0],
          [2, 0],
        ],
        [
          [0, 2],
          [2, 2],
        ],
      ],
      grounds: [[0, 2]],
    };
    const figs = {
      figures: [{ schematic, caption: '电阻上 5V。' }],
      i18n: { en: { ...base.i18n.en, figures: [{ caption: '5V across the resistor.', alt: 'A resistor on a 5V supply.' }] } },
    };
    expect(parseChallenge(base).challenge!.figures).toBeUndefined();
    const zh = parseChallenge({ ...base, ...figs }).challenge!;
    expect(zh.figures).toEqual([{ schematic, caption: '电阻上 5V。' }]);
    setLang('en');
    expect(parseChallenge({ ...base, ...figs }).challenge!.figures![0]).toMatchObject({ caption: '5V across the resistor.', alt: 'A resistor on a 5V supply.' });
    // no caption, a broken drawing, a translation that doesn't line up
    const bad = parseChallenge({ ...base, figures: [{ schematic }, { schematic: { ...schematic, grounds: [] }, caption: 'x' }, { caption: 'x' }] });
    expect(bad.errors.some((e) => e.includes('figures[0].caption'))).toBe(true);
    expect(bad.errors.some((e) => e.startsWith('figures[1].schematic'))).toBe(true);
    expect(bad.errors.some((e) => e.startsWith('figures[2].schematic'))).toBe(true);
    const short = parseChallenge({ ...base, ...figs, i18n: { en: { figures: [] } } });
    expect(short.warnings.some((w) => w.includes('i18n.en.figures'))).toBe(true);
  });

  it('warns when translated lists do not line up and rejects unknown languages', () => {
    const r = parseChallenge({ ...base, i18n: { en: { steps: ['only one'] }, de: {} } });
    expect(r.errors.some((e) => e.includes('"de"'))).toBe(true);
    expect(r.warnings.some((w) => w.includes('i18n.en.steps'))).toBe(true);
  });
});

describe('localized diagnostics', () => {
  it('reports in the current language', () => {
    const empty = buildNetlist({ version: 1, parts: [] });
    setLang('en');
    expect(boardDiagnostics(empty, simulate(empty.circuit))[0].title).toBe('No power source yet');
    setLang('zh');
    expect(boardDiagnostics(empty, simulate(empty.circuit))[0].title).toBe('还没有电源');
  });
});
