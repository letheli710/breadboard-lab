// The rail (CHALLENGE_FORMAT §17, core/rail.ts): parsing rules and the rail made from cards.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseChallenge } from './challenge';
import { embedRefs, railFromCards } from './rail';

const read = (f: string) =>
  JSON.parse(readFileSync(`challenges/${f}`, 'utf8')) as Record<string, unknown> & {
    rail: { text: string[]; steps?: number; measure?: string[] }[];
    measurements: Record<string, unknown>[];
  };
const errorsOf = (j: unknown) => parseChallenge(j).errors.join('\n');

describe('rail', () => {
  it('the sample lessons parse with a hand-written rail', () => {
    for (const f of ['106-lesson-lm358.json', '01-breadboard-basics.json', '102-lesson-ammeter.json']) {
      const r = parseChallenge(read(f));
      expect(r.errors).toEqual([]);
      expect(r.challenge!.rail.length).toBeGreaterThan(4);
      expect(r.challenge!.railAuto).toBe(false);
      // every question sits in exactly one node
      const placed = r.challenge!.rail.flatMap((n) => n.measure).sort();
      expect(placed).toEqual(r.challenge!.measurements.map((q) => q.id).sort());
    }
  });

  it('a card-style file gets a rail with one measure node after the build card', () => {
    const r = parseChallenge(JSON.parse(readFileSync('challenges/225-voltage-follower.json', 'utf8')));
    const ch = r.challenge!;
    expect(ch.railAuto).toBe(true);
    expect(ch.rail.map((n) => n.kind)).toEqual(['build', 'think', 'build', 'measure', 'wrap']);
    expect(ch.rail[3].measure).toEqual(ch.measurements.map((q) => q.id));
  });

  it('railFromCards keeps step ownership', () => {
    const rail = railFromCards(
      [
        { kind: 'try', title: 'a', text: '', first: 0, count: 2, practice: [] },
        { kind: 'explain', title: 'b', text: '', first: 2, count: 0, practice: [] },
        { kind: 'build', title: 'c', text: '', first: 2, count: 3, practice: [] },
        { kind: 'wrap', title: 'd', text: '', first: 5, count: 0, practice: ['opamp'] },
      ],
      ['q1'],
    );
    expect(rail.map((n) => [n.kind, n.first, n.count])).toEqual([
      ['build', 0, 2],
      ['think', 2, 0],
      ['build', 2, 3],
      ['measure', 5, 0],
      ['wrap', 5, 0],
    ]);
  });

  it('rejects a question in two nodes, a question in none, and steps that do not add up', () => {
    const j = read('106-lesson-lm358.json');
    const twice = structuredClone(j);
    twice.rail[1].measure = ['vin'];
    expect(errorsOf(twice)).toMatch(/vin/);
    const none = structuredClone(j);
    none.rail[7].text = none.rail[7].text.filter((l) => !l.includes('measure:why'));
    expect(errorsOf(none)).toMatch(/why/);
    const steps = structuredClone(j);
    steps.rail[1].steps = 2;
    expect(errorsOf(steps)).toMatch(/rail/);
  });

  it('only a multiple-choice question may be asked before the circuit check ("after")', () => {
    const j = read('106-lesson-lm358.json');
    const bad = structuredClone(j);
    bad.measurements[1].after = 5;
    expect(errorsOf(bad)).toMatch(/after/);
  });

  it('rejects rail together with cards, and unknown derivations', () => {
    const j = read('106-lesson-lm358.json');
    expect(errorsOf({ ...j, cards: [{ kind: 'try', title: 'x' }] })).toMatch(/rail/);
    const d = structuredClone(j);
    d.rail[4].text = ['![](derive:nope)'];
    expect(errorsOf(d)).toMatch(/nope/);
  });

  it('embedRefs finds embeds by kind', () => {
    const t = 'a\n![](measure:vin)\n![](inside:lm358#3)\n![](derive:sat)';
    expect(embedRefs(t, 'measure')).toEqual(['vin']);
    expect(embedRefs(t, 'inside')).toEqual(['lm358#3']);
    expect(embedRefs(t, 'derive')).toEqual(['sat']);
  });
});
