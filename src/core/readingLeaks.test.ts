import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { numbersWithUnit, validateChallengeJson } from '../../scripts/validate-challenges';

const load = (f: string) => JSON.parse(readFileSync(new URL(`../../challenges/${f}`, import.meta.url), 'utf8'));
const leaks = (json: unknown) => validateChallengeJson(json, 'x.json').warnings.filter((w) => /reference reading|参考读数/.test(w));

describe('answer-leak check: a lab must not state the readings it asks for', () => {
  it('reads numbers with units in SI', () => {
    const got = numbersWithUnit('VOUT ≈ 4.5V，I = 2.53 mA, 1.2kΩ, 0.97 µs, 25 °C, 3V3 pin, 0.5 V/µs');
    expect(got.map((n) => [n.text, n.unit])).toEqual([
      ['4.5V', 'V'],
      ['2.53 mA', 'A'],
      ['1.2kΩ', 'Ω'],
      ['0.97 µs', 's'],
      ['25 °C', '°C'],
    ]);
    [4.5, 0.00253, 1200, 9.7e-7, 25].forEach((v, i) => expect(got[i].value).toBeCloseTo(v, 12));
  });

  it('the shipped lab is clean, and a reading put back into its summary is flagged', () => {
    const lab = load('203-loaded-divider.json');
    expect(leaks(lab)).toEqual([]);
    lab.summary = '两个 10kΩ 把 9V 分成 4.5V；接上 1kΩ 负载直接跌到 0.75V。';
    const w = leaks(lab);
    expect(w.some((x) => x.includes('(v0)') && x.includes('4.5V'))).toBe(true);
    expect(w.some((x) => x.includes('(v1k)') && x.includes('0.75V'))).toBe(true);
  });

  it('figures count as visible text: captions, translated captions, notes and mark names', () => {
    const lab = load('203-loaded-divider.json');
    const fig = (extra: Record<string, unknown>) => ({
      schematic: {
        elements: [{ ref: 'V1', type: 'V', from: [0, 0], to: [0, 2], value: 9 }],
        wires: [
          [
            [0, 0],
            [2, 0],
            [2, 2],
            [0, 2],
          ],
        ],
        grounds: [[0, 2]],
        ...extra,
      },
      caption: '分压器。',
    });
    lab.figures = [{ ...fig({}), caption: '中点 4.5V。' }];
    expect(leaks(lab).some((x) => x.includes('figures[0].caption') && x.includes('4.5V'))).toBe(true);
    lab.figures = [fig({ notes: [{ at: [3, 1], text: '中点', i18n: { en: 'middle 4.5 V' } }] })];
    expect(leaks(lab).some((x) => x.includes('figures[0].notes'))).toBe(true);
    lab.figures = [fig({ marks: [{ kind: 'v', el: 'V1', name: '0.75 V' }] })];
    expect(leaks(lab).some((x) => x.includes('figures[0].marks'))).toBe(true);
    lab.figures = [fig({})];
    lab.i18n.en.figures = [{ caption: 'The middle is at 4.5 V.' }];
    expect(leaks(lab).some((x) => x.includes('i18n.en.figures[0].caption'))).toBe(true);
  });

  it('part values and source settings are not leaks; "stated" questions are skipped', () => {
    const lab = load('207-measure-req.json');
    lab.hints = [...lab.hints, 'R2 是 2.2kΩ。']; // a part value close to Req ≈ 2.26 kΩ
    expect(leaks(lab)).toEqual([]);
    const ui = load('226-noninverting-amp.json');
    expect(leaks(ui)).toEqual([]); // "10% ≈ 0.9 V" is in the text, but ui is marked stated
    ui.measurements.find((q: { id: string }) => q.id === 'ui').stated = false;
    expect(leaks(ui).some((x) => x.includes('(ui)'))).toBe(true);
  });
});
