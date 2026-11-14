import { describe, expect, it } from 'vitest';
import { langRuns } from './Mixed';

describe('langRuns', () => {
  it('marks the English gloss of a Chinese label', () => {
    expect(langRuns('目标电路图 TARGET SCHEMATIC', 'zh')).toEqual([
      ['目标电路图 ', null],
      ['TARGET SCHEMATIC', 'en'],
    ]);
    expect(langRuns('GND 到底是什么？What is ground?', 'zh')).toEqual([
      ['GND', 'en'],
      [' 到底是什么？', null],
      ['What is ground?', 'en'],
    ]);
  });
  it('leaves units and English-only text on an English page alone', () => {
    expect(langRuns('电压 5 V', 'zh')).toEqual([['电压 5 V', null]]);
    expect(langRuns('Target schematic', 'en')).toEqual([['Target schematic', null]]);
  });
  it('marks Chinese inside English text', () => {
    expect(langRuns('Field guide · 面包板实验室', 'en')).toEqual([
      ['Field guide · ', null],
      ['面包板实验室', 'zh-CN'],
    ]);
  });
});
