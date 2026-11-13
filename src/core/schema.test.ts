// The JSON schemas in schema/ give authors editor completion and validation; the parsers in
// src/core are what the app actually accepts. These tests keep the two from drifting apart:
// every shipped file must satisfy its schema, and a few files the parser rejects must fail it.

import Ajv from 'ajv';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildChallengeFromBoard } from '../ui/exportChallenge';
import { parseChallenge } from './challenge';
import { buildNetlist } from './netlist';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => JSON.parse(readFileSync(join(root, p), 'utf8').replace(/^﻿/, ''));
const walk = (dir: string): string[] =>
  readdirSync(join(root, dir)).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(join(root, p)).isDirectory()) return walk(p);
    return n.endsWith('.json') && !n.startsWith('_') && !n.endsWith('.schema.json') ? [p] : [];
  });

const ajv = new Ajv({ allErrors: true, strict: false });
ajv.addSchema(read('schema/problem.schema.json'));
const challengeSchema = ajv.compile(read('schema/challenge.schema.json'));
const problemSchema = ajv.getSchema('https://breadboard-lab.local/schema/problem.schema.json')!;
const summarySchema = ajv.compile(read('schema/summary.schema.json'));

const errorsOf = (v: typeof challengeSchema, json: unknown) => (v(json) ? [] : (v.errors ?? []).map((e) => `${e.instancePath} ${e.message}`));

describe('schema/challenge.schema.json matches the challenge files', () => {
  const files = [...walk('challenges'), ...walk('src/core/fixtures')].filter((f) => read(f).format === 'breadboard-challenge/1');
  it('finds the files', () => expect(files.length).toBeGreaterThan(60));
  it.each(files)('%s', (f) => expect(errorsOf(challengeSchema, read(f))).toEqual([]));

  it('rejects what the parser rejects', () => {
    const base = read('challenges/201-kcl-ammeters.json');
    const bad = (patch: (j: Record<string, unknown>) => void) => {
      const j = structuredClone(base);
      patch(j);
      return errorsOf(challengeSchema, j).length;
    };
    expect(bad(() => {})).toBe(0);
    // a wire colour the parser doesn't know, an LED colour that isn't one
    expect(bad((j) => ((j.solution as { parts: Record<string, unknown>[] }).parts[1].color = 'purple'))).toBeGreaterThan(0);
    expect(bad((j) => ((j.solution as { parts: Record<string, unknown>[] }).parts[1].color = '#123456'))).toBe(0);
    expect(bad((j) => ((j.components as Record<string, unknown>[]).push({ ref: 'LED9', type: 'led', color: 'orange' }), 0))).toBeGreaterThan(0);
    // measurement questions: unknown key, bad scope measure
    expect(bad((j) => ((j.measurements as Record<string, unknown>[])[0].answer = 0.00884))).toBeGreaterThan(0);
    expect(bad((j) => ((j.measurements as Record<string, unknown>[])[0] = { id: 'x', ask: 'x', scope: 'tau', pin: 'R1.1' }))).toBeGreaterThan(0);
  });

  it('accepts what the sandbox exports ("Export as challenge JSON") for every reference solution', () => {
    for (const f of walk('challenges')) {
      const ch = parseChallenge(read(f)).challenge;
      if (!ch?.solution) continue;
      const out = buildChallengeFromBoard(ch.solution, buildNetlist(ch.solution).circuit, 'exported', 'Exported');
      const json = JSON.parse(JSON.stringify(out));
      expect([f, errorsOf(challengeSchema, json)]).toEqual([f, []]);
      // and the app can import it again
      expect([f, parseChallenge(json).errors]).toEqual([f, []]);
    }
  });
});

describe('schema/problem.schema.json matches the problem files', () => {
  const files = walk('problems');
  it('finds the files', () => expect(files.length).toBeGreaterThan(200));
  it.each(files)('%s', (f) => expect(errorsOf(problemSchema, read(f))).toEqual([]));
});

describe('schema/summary.schema.json matches the chapter summaries', () => {
  const files = walk('summaries');
  it.each(files)('%s', (f) => expect(errorsOf(summarySchema, read(f))).toEqual([]));
});
