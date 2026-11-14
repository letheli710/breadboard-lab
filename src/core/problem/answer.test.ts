// Student answer entry: the expression reader, tolerances and the wrong-answer diagnoses.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { setLang } from '../i18n';
import { evalExpr } from './expr';
import { unitOf } from './answer';
import { answerTolerance, checkAnswer, formatAnswer, parseProblem, readAnswer } from './parse';
import type { Question } from './types';

afterEach(() => setLang('zh'));

const q = (answer: number, unit = 'A', extra: Partial<Question> = {}): Question => ({ id: 'q', ask: '', find: { kind: 'i', el: 'R1' }, answer, unit, ...extra });
const ph = (answer: number, extra: Partial<Question> = {}): Question => ({ id: 'p', ask: '', find: { kind: 'i', el: 'R1', part: 'phase' }, answer, unit: '°', ...extra });
const value = (question: Parameters<typeof readAnswer>[0], input: string) => {
  const r = readAnswer(question, input);
  return 'value' in r ? r.value : NaN;
};

// [box unit, input, expected value in SI base units (degrees for '°')]
const READ: [string, string, number][] = [
  ['A', '2', 2],
  ['A', '-2', -2],
  ['A', '+2', 2],
  ['A', '.5', 0.5],
  ['A', '2.', 2],
  ['A', '1.2e-3', 1.2e-3],
  ['A', '1.2E3', 1200],
  ['A', '1.2×10^-3', 1.2e-3],
  ['A', '1.2*10^(-3)', 1.2e-3],
  ['A', '1.2x10^-3', 1.2e-3],
  ['A', '1.2×10-3', 1.2e-3],
  ['A', '1.2×10⁻³', 1.2e-3],
  ['A', '12/6', 2],
  ['A', '2/3', 2 / 3],
  ['A', '-2/3', -2 / 3],
  ['A', '1+1', 2],
  ['A', '5-3', 2],
  ['A', '2*3', 6],
  ['A', '2×3', 6],
  ['A', '2·3', 6],
  ['A', '6÷3', 2],
  ['A', '2^3', 8],
  ['A', '2**3', 8],
  ['A', '2^3^2', 512],
  ['A', '-2^2', -4],
  ['A', '(1+2)*3', 9],
  ['A', '（1+2）×3', 9],
  ['A', '3(1+2)', 9],
  ['A', '10/(2+3)', 2],
  ['A', '24/7', 24 / 7],
  ['A', '√2', Math.SQRT2],
  ['A', '2√2', 2 * Math.SQRT2],
  ['A', '√(8)', Math.sqrt(8)],
  ['A', 'sqrt(2)', Math.SQRT2],
  ['A', 'SQRT(2)', Math.SQRT2],
  ['A', '10/sqrt(2)', 10 / Math.SQRT2],
  ['A', '10/√2', 10 / Math.SQRT2],
  ['A', 'π', Math.PI],
  ['A', 'pi/6', Math.PI / 6],
  ['A', '2π', 2 * Math.PI],
  ['A', '100pi', 100 * Math.PI],
  ['A', '2(1-e^-1)', 2 * (1 - Math.exp(-1))],
  ['A', '2*(1-exp(-1))', 2 * (1 - Math.exp(-1))],
  ['A', 'ln(2)', Math.LN2],
  ['A', 'log(100)', 2],
  ['A', '60%', 0.6],
  ['', '86.6%', 0.866],
  ['A', '1,234', 1234],
  ['A', '1，5', 1.5],
  ['A', '２．５', 2.5],
  ['A', '－3', -3],
  ['A', '2 A', 2],
  ['A', '2A', 2],
  ['A', '2mA', 0.002],
  ['A', '-3m', -0.003],
  ['A', '2.5 mA', 0.0025],
  ['A', '12/6 mA', 0.002],
  ['A', '1/3m', 1 / 3000],
  ['A', '2安', 2],
  ['mA', '2', 0.002],
  ['mA', '2/4', 0.0005],
  ['mA', '2 A', 2],
  ['mA', '0.002A', 0.002],
  ['Ω', '4.7k', 4700],
  ['Ω', '4.7kΩ', 4700],
  ['Ω', '4.7 kohm', 4700],
  ['Ω', '1k+500', 1500],
  ['Ω', '1M', 1e6],
  ['Ω', '2欧', 2],
  ['kΩ', '4.7', 4700],
  ['kΩ', '1/2', 500],
  ['F', '4.7µF', 4.7e-6],
  ['F', '4.7uF', 4.7e-6],
  ['F', '10n', 1e-8],
  ['µF', '10', 1e-5],
  ['S', '2mS', 0.002],
  ['s', '2ms', 0.002],
  ['s', '0.5/5', 0.1],
  ['Hz', '50Hz', 50],
  ['Hz', '1/(2π)', 1 / (2 * Math.PI)],
  ['kHz', '1.59', 1590],
  ['rad/s', '100π', 100 * Math.PI],
  ['rad/s', '314 rad/s', 314],
  ['var', '-774.4', -774.4],
  ['var', '1.2kvar', 1200],
  ['VA', '2kVA', 2000],
  ['W', '2/3 W', 2 / 3],
  ['J', '2mJ', 0.002],
  ['dB', '-3dB', -3],
  ['V/s', '-20', -20],
  ['°', '30', 30],
  ['°', '-53.13°', -53.13],
  ['°', '30deg', 30],
  ['°', 'π/6 rad', 30],
  ['°', '0.5236rad', 0.5236 * (180 / Math.PI)],
  ['°', '4∠30', 30],
  ['°', '4∠-π/6rad', -30],
];

describe('readAnswer: accepted syntax', () => {
  it('has a large table', () => expect(READ.length).toBeGreaterThanOrEqual(60));
  for (const [unit, input, want] of READ) {
    it(`${unit || '(none)'}: "${input}" → ${want}`, () => {
      const question: Question = unit === '°' ? ph(0) : q(0, unit);
      expect(value(question, input)).toBeCloseTo(want, 9);
    });
  }

  it('reads polar form for magnitude / real / imaginary parts', () => {
    expect(value({ unit: 'A', find: { part: 'mag' } }, '4∠30')).toBeCloseTo(4, 9);
    expect(value({ unit: 'A', find: { part: 're' } }, '4∠60')).toBeCloseTo(2, 9);
    expect(value({ unit: 'A', find: { part: 'im' } }, '2A∠90°')).toBeCloseTo(2, 9);
  });
});

// inputs that must be rejected, with a message matching the pattern (zh)
const REJECT: [string, string, RegExp][] = [
  ['A', '', /先输入/],
  ['A', 'abc', /不认识.*例如 .*12\/6/],
  ['A', '2+', /看不懂/],
  ['A', '(2', /看不懂/],
  ['A', '2)', /看不懂/],
  ['A', '2/0', /除以了 0/],
  ['A', 'sqrt(-1)', /有限/],
  ['A', '4 V', /单位不对/],
  ['A', '2#', /不能有“#”/],
  ['A', 'mA', /前面要有一个数/],
  ['°', '30 V', /角度的单位/],
  ['A', '1∠2∠3', /看不懂/],
];

describe('readAnswer: rejected input', () => {
  for (const [unit, input, re] of REJECT) {
    it(`"${input}" is rejected`, () => {
      const r = readAnswer(unit === '°' ? ph(0) : q(0, unit), input);
      expect('reason' in r && r.reason).toMatch(re);
    });
  }
  it('message is bilingual', () => {
    setLang('en');
    const r = readAnswer(q(1), 'abc');
    expect('reason' in r && r.reason).toMatch(/Unknown word "abc".*e\.g\./);
  });
  it('the evaluator never runs code', () => {
    expect('error' in evalExpr('alert(1)')).toBe(true);
    expect('error' in evalExpr('constructor')).toBe(true);
    expect('error' in evalExpr('1;2')).toBe(true);
  });
});

describe('checkAnswer: tolerance and diagnoses', () => {
  it('phase uses a fixed ±1° modulo 360°', () => {
    expect(checkAnswer(ph(180), '182').ok).toBe(false);
    expect(checkAnswer(ph(180), '-179.2').ok).toBe(true);
    expect(checkAnswer(ph(-5.7), '-6.5').ok).toBe(true);
    expect(checkAnswer(ph(-5.7), '-6.8').ok).toBe(false);
    expect(checkAnswer(ph(-53.13), '306.87').ok).toBe(true);
    expect(answerTolerance(ph(1))).toBe('±1°');
    expect(answerTolerance(q(1))).toBe('±2%');
    expect(answerTolerance(q(1, 'A', { tol: 0.05 }))).toBe('±5%');
  });

  // [answer, unit, input, diagnosis]
  const DIAG: [number, string, string, string | undefined][] = [
    [2, 'A', '2.03', undefined], // within 2 % → correct
    [2, 'A', '2.04', undefined], // exactly on the edge → correct
    [2, 'A', '2.041', 'close'],
    [2, 'A', '2.06', 'close'],
    [2, 'A', '2.1', 'close'],
    [2, 'A', '1.92', 'close'],
    [2, 'A', '-2', 'sign'],
    [2, 'A', '2000', 'e3'],
    [0.004, 'A', '4', 'e3'],
    [2e-6, 'A', '2', 'e6'],
    [2e-6, 'A', '2m', 'e3'],
    [2e3, 'Ω', '2M', 'e3'],
    [2e3, 'Ω', '2m', 'e6'],
    [1e-8, 'F', '10', 'e9'],
    [10, 'V', '14.14', 'sqrt2'],
    [10, 'V', '7.071', 'sqrt2'],
    [220, 'V', '380', 'sqrt3'],
    [380, 'V', '219.4', 'sqrt3'],
    [50, 'Hz', '314.16', '2pi'],
    [314.16, 'rad/s', '50', '2pi'],
    [2, 'Ω', '0.5', 'recip'],
    [0.1, 's', '10', 'recip'],
    [2000, 'kΩ', '0.5', 'recip'],
    [2, 'A', '-2000', 'e3'],
    [2, 'A', '6', undefined],
    [2, 'A', '3', undefined],
  ];
  for (const [ans, unit, input, d] of DIAG) {
    it(`${ans} ${unit}: "${input}" → ${d ?? (checkAnswer(q(ans, unit), input).ok ? 'correct' : 'plain wrong')}`, () => {
      const r = checkAnswer(q(ans, unit), input);
      expect(r.diagnosis).toBe(d);
      if (d) expect(r.reason).toBeTruthy();
    });
  }
  it('flags a flipped sign together with a factor', () => {
    expect(checkAnswer(q(2), '-2000').reason).toMatch(/符号也反了/);
  });
  it('close answers are marked and name the tolerance', () => {
    const r = checkAnswer(q(2), '2.1');
    expect(r.close).toBe(true);
    expect(r.reason).toMatch(/非常接近.*±2%/);
    setLang('en');
    expect(checkAnswer(q(2), '2.1').reason).toMatch(/Very close.*significant figures/);
  });
  it('phase diagnoses', () => {
    expect(checkAnswer(ph(30), '0.5236').diagnosis).toBe('rad');
    expect(checkAnswer(ph(30), '0.5236rad').ok).toBe(true);
    expect(checkAnswer(ph(30), '33').diagnosis).toBe('close');
    expect(checkAnswer(ph(30), '-150').diagnosis).toBe('phase180');
    expect(checkAnswer(ph(-53.13), '53.13').diagnosis).toBe('sign');
    expect(checkAnswer(ph(-53.13), '10').diagnosis).toBeUndefined();
  });
  it('each diagnosis has its own message in both languages', () => {
    const cases: [Question, string][] = [
      [q(2e-6), '2'],
      [q(1e-8, 'F'), '10'],
      [q(10, 'V'), '14.14'],
      [q(220, 'V'), '380'],
      [q(50, 'Hz'), '314.16'],
      [q(2, 'Ω'), '0.5'],
      [ph(30), '0.5236'],
    ];
    for (const l of ['zh', 'en'] as const) {
      setLang(l);
      const msgs = cases.map(([qq, i]) => checkAnswer(qq, i).reason);
      expect(new Set(msgs).size).toBe(cases.length);
      for (const m of msgs) expect(m).toMatch(l === 'zh' ? /[一-鿿]/ : /^[^一-鿿]*$/);
    }
  });
});

// every numeric reference answer of every built-in problem must be accepted as displayed and in SI units
const DIR = fileURLToPath(new URL('../../../problems/', import.meta.url));
function listJson(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return listJson(p);
    return name.endsWith('.json') && !name.startsWith('_') && !name.endsWith('.schema.json') ? [p] : [];
  });
}

describe('built-in reference answers are accepted', () => {
  const files = listJson(DIR);
  it('checks many questions', () => {
    let n = 0;
    const bad: string[] = [];
    for (const f of files) {
      const r = parseProblem(JSON.parse(readFileSync(f, 'utf8')), 'folder', f, { verify: false });
      for (const qq of r.problem?.questions ?? []) {
        if (typeof qq.answer !== 'number') continue;
        n++;
        const shown = formatAnswer(qq);
        for (const input of [shown, shown.replace(/\s+\S+$/, ''), String(qq.answer)]) {
          // String(answer) is in SI base units: only valid without a prefixed box unit
          if (input === String(qq.answer) && (unitOf(qq.unit ?? '')?.scale ?? 1) !== 1) continue;
          const c = checkAnswer(qq, input);
          if (!c.ok) bad.push(`${f.slice(DIR.length)} ${qq.id}: "${input}" → ${c.reason ?? 'wrong'}`);
        }
      }
    }
    expect(bad).toEqual([]);
    expect(n).toBeGreaterThan(300);
  });
});

describe('readAnswer: 1/s', () => {
  it('reads "-2 1/s" and "3 s⁻¹" for a 1/s question, rejects them elsewhere', () => {
    expect(value(q(0, '1/s'), '-2 1/s')).toBe(-2);
    expect(value(q(0, '1/s'), '3 s⁻¹')).toBe(3);
    expect(value(q(0, '1/s'), '-2')).toBe(-2);
    expect(readAnswer(q(0, 'A'), '3 s⁻¹')).toHaveProperty('reason');
  });
});

describe('choiceExplain', () => {
  const base = JSON.parse(
    readFileSync(
      listJson(DIR).find((f) => /"choices"/.test(readFileSync(f, 'utf8')))!,
      'utf8',
    ),
  );
  const qi = base.questions.findIndex((x: Question) => x.choices);
  it('is parsed and translated per option', () => {
    const j = JSON.parse(JSON.stringify(base));
    const n = j.questions[qi].choices.length;
    j.questions[qi].choiceExplain = Array.from({ length: n }, (_, k) => `原因${k}`);
    const tq = j.i18n?.en?.questions?.[qi];
    if (tq) tq.choiceExplain = Array.from({ length: n }, (_, k) => (k ? `why${k}` : ''));
    setLang('zh');
    expect(parseProblem(j, 'folder', 'x', { verify: false }).problem!.questions[qi].choiceExplain).toEqual(Array.from({ length: n }, (_, k) => `原因${k}`));
    if (tq) {
      setLang('en');
      const ce = parseProblem(j, 'folder', 'x', { verify: false }).problem!.questions[qi].choiceExplain!;
      expect(ce[0]).toBe('原因0');
      expect(ce[1]).toBe('why1');
    }
  });
  it('must match the number of choices', () => {
    const j = JSON.parse(JSON.stringify(base));
    j.questions[qi].choiceExplain = ['only one'];
    expect(parseProblem(j, 'folder', 'x', { verify: false }).errors.join()).toMatch(/choiceExplain/);
  });
});

describe('readAnswer: temperature', () => {
  it('reads °C, ℃ and (for a °C question) bare C; converts K with the 273.15 offset', () => {
    expect(value(q(0, '°C'), '80')).toBe(80);
    expect(value(q(0, '°C'), '80 °C')).toBe(80);
    expect(value(q(0, '°C'), '80℃')).toBe(80);
    expect(value(q(0, '°C'), '80C')).toBe(80);
    expect(value(q(0, '°C'), '-5.5 °C')).toBe(-5.5);
    expect(value(q(0, '°C'), '353.15 K')).toBeCloseTo(80, 9);
    expect(value(q(0, '°C'), '273.15K')).toBeCloseTo(0, 9);
  });
  it('rejects other units, and "C" / "K" keep their usual meaning elsewhere', () => {
    expect(readAnswer(q(0, '°C'), '80 V')).toHaveProperty('reason');
    expect(readAnswer(q(0, '°C'), '80°')).toHaveProperty('reason');
    expect(value(q(0, 'Ω'), '4.7K')).toBe(4700);
    expect(readAnswer(q(0, 'V'), '80 °C')).toHaveProperty('reason');
  });
  it('grades a kelvin answer to a °C question on the °C value', () => {
    expect(checkAnswer({ ...q(80, '°C') }, '353 K').ok).toBe(true);
    expect(checkAnswer({ ...q(80, '°C') }, '80 K').ok).toBe(false);
  });
});

describe('readAnswer: lengths and line constants (transmission lines)', () => {
  const val = (unit: string, input: string) => {
    const r = readAnswer({ unit }, input);
    return 'value' in r ? r.value : NaN;
  };
  it('a question in metres reads a trailing "m" as metres, not milli', () => {
    expect(val('m', '200')).toBe(200);
    expect(val('m', '200 m')).toBe(200);
    expect(val('m', '200m')).toBe(200);
    expect(val('m', '0.2 km')).toBeCloseTo(200);
    expect(val('m', '500 mm')).toBeCloseTo(0.5);
    expect(val('m', '17.6 cm')).toBeCloseTo(0.176);
    expect(val('m', '(1/4)m')).toBeCloseTo(0.25);
  });
  it('km boxes, per-km constants and speeds', () => {
    expect(val('km', '6000')).toBe(6e6);
    expect(val('km', '6000 km')).toBe(6e6);
    expect(val('Np/km', '0.1')).toBeCloseTo(1e-4);
    expect(val('rad/km', '1.07')).toBeCloseTo(1.07e-3);
    expect(val('m/s', '3e8')).toBe(3e8);
    expect(val('km/s', '3e5')).toBeCloseTo(3e8);
  });
  it('elsewhere a bare m is still milli', () => {
    expect(val('A', '3m')).toBeCloseTo(3e-3);
    expect(val('V', '2 mV')).toBeCloseTo(2e-3);
  });
  it('shows the answer in the question unit', () => {
    expect(formatAnswer({ answer: 6e6, unit: 'km' })).toBe('6000 km');
    expect(formatAnswer({ answer: 0.25, unit: 'm' })).toBe('0.25 m');
  });
});
