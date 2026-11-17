import { describe, expect, it } from 'vitest';
import { compile, evaluate, evaluateModel, sliderToValue, valueToSlider } from './model';
import { parseRef, portalReadiness, resolveRef, validateCourse, backlinksTo, type Catalog, type CourseData } from './catalog';
import { parseUnit } from './unit';

const T = (s: string) => ({ zh: s, en: s });

describe('formula model', () => {
  it('evaluates arithmetic with precedence, unary minus and right-associative powers', () => {
    expect(evaluate(compile('1 + 2 * 3'), {})).toBe(7);
    expect(evaluate(compile('-2^2'), {})).toBe(-4);
    expect(evaluate(compile('2^3^2'), {})).toBe(512);
    expect(evaluate(compile('2^-1'), {})).toBe(0.5);
    expect(evaluate(compile('A / (1 + A * beta)'), { A: 100, beta: 0.1 })).toBeCloseTo(100 / 11);
  });
  it('has the documented functions and constants', () => {
    expect(evaluate(compile('clamp(1000 * 0.1, -13.5, 13.5)'), {})).toBe(13.5);
    expect(evaluate(compile('step(0.2) + step(-1)'), {})).toBe(1);
    expect(evaluate(compile('if(x - 1, 10, 20)'), { x: 0 })).toBe(20);
    expect(evaluate(compile('atand(1)'), {})).toBeCloseTo(45);
    expect(evaluate(compile('2 * pi'), {})).toBeCloseTo(2 * Math.PI);
  });
  it('reports names and rejects bad syntax', () => {
    expect(compile('A * vin + clamp(x, 0, 1)').vars.sort()).toEqual(['A', 'vin', 'x']);
    expect(() => compile('1 +')).toThrow();
    expect(() => compile('foo(1)')).toThrow(/unknown function/);
    expect(() => compile('min(1)')).toThrow(/arguments/);
  });
  it('lets later outputs use earlier ones', () => {
    const outs = [{ id: 'G', compiled: compile('A / (1 + A * b)') }, { compiled: compile('G * vin') }];
    const [g, vo] = evaluateModel(outs, { A: 1e5, b: 0.1, vin: 0.5 });
    expect(g).toBeCloseTo(10, 2);
    expect(vo).toBeCloseTo(5, 2);
  });
  it('maps log sliders by decades', () => {
    expect(sliderToValue(500, 10, 1e5, true)).toBeCloseTo(Math.sqrt(10 * 1e5));
    expect(valueToSlider(1000, 10, 1e5, true)).toBe(500);
    expect(valueToSlider(0.5, 0, 1, false)).toBe(500);
  });
});

const unitJson = (over: Record<string, unknown> = {}) => ({
  format: 'learning-unit/1',
  id: 'w9-test',
  world: 'w9',
  title: T('t'),
  question: T('q'),
  minutes: 10,
  layers: [
    {
      layer: 'derive',
      blocks: [
        {
          type: 'explore',
          params: [{ id: 'A', label: T('A'), value: 100, min: 10, max: 1e5, log: true }],
          outputs: [{ label: T('g'), expr: '1 / A' }],
        },
        { type: 'portal', id: 'p1' },
      ],
    },
    { layer: 'connect', blocks: [{ type: 'problems', ids: ['x-1'] }] },
  ],
  ...over,
});

describe('learning units', () => {
  it('parses a valid unit', () => {
    const r = parseUnit(unitJson());
    expect(r.errors).toEqual([]);
    expect(r.unit?.layers.map((l) => l.layer)).toEqual(['derive', 'connect']);
  });
  it('keeps the five layers in their fixed order', () => {
    const j = unitJson();
    (j.layers as unknown[]).reverse();
    expect(parseUnit(j).errors.join()).toMatch(/顺序固定/);
  });
  it('needs both languages', () => {
    expect(parseUnit(unitJson({ title: { zh: '只有中文' } })).errors.join()).toMatch(/both languages/);
  });
  it('rejects formulas that use unknown names or are not finite over the slider range', () => {
    const bad = unitJson();
    (bad.layers as { blocks: { outputs?: unknown }[] }[])[0].blocks[0].outputs = [{ label: T('g'), expr: 'B * 2' }];
    expect(parseUnit(bad).errors.join()).toMatch(/"B"/);
    const inf = unitJson();
    const ex = (inf.layers as { blocks: { params?: unknown; outputs?: unknown }[] }[])[0].blocks[0];
    ex.params = [{ id: 'x', label: T('x'), value: 1, min: 0, max: 2 }];
    ex.outputs = [{ label: T('g'), expr: '1 / x' }];
    expect(parseUnit(inf).errors.join()).toMatch(/x = min/);
  });
});

function fixture(): { data: CourseData; cat: Catalog } {
  const unit = parseUnit(unitJson()).unit!;
  const data: CourseData = {
    worlds: [
      { id: 'w1', n: 1, title: T('one'), course: T('c'), sections: [{ title: T('s'), items: ['challenge:lab-a', 'chapter:ch'] }] },
      { id: 'w9', n: 9, title: T('nine'), course: T('c'), unitsCover: ['ch'], sections: [{ title: T('s'), items: ['unit:w9-test'] }] },
    ],
    pending: [{ id: 'w9-later', world: 'w9', title: T('later'), what: T('w') }],
    portals: [
      { id: 'p1', from: 'unit:w9-test', to: 'pending:w9-later', what: T('w'), back: T('b'), prereq: ['challenge:lab-a'], minutes: 10 },
      { id: 'p2', from: 'challenge:lab-a', to: 'unit:w9-test', what: T('w'), back: T('b'), prereq: [], minutes: 5 },
    ],
  };
  const cat: Catalog = {
    challenges: new Map([['lab-a', { title: 'Lab A', kind: 'challenge' }]]),
    chapters: new Map([['ch', { title: 'Chapter' }]]),
    problems: new Map([['x-1', 'ch']]),
    units: new Map([[unit.id, unit]]),
  };
  return { data, cat };
}
const PLAN = 'pending: `w9-later`';

describe('course map', () => {
  it('passes on a consistent map', () => {
    const { data, cat } = fixture();
    expect(validateCourse(data, cat, PLAN)).toEqual({ errors: [], warnings: [] });
  });
  it('reports a broken link', () => {
    const { data, cat } = fixture();
    data.portals[1].to = 'challenge:no-such-lab';
    expect(validateCourse(data, cat, PLAN).errors.join()).toMatch(/断链/);
  });
  it('reports a portal without its reverse link', async () => {
    const { parsePortalsFile } = await import('./catalog');
    const errors: string[] = [];
    parsePortalsFile({ format: 'course-portals/1', portals: [{ id: 'x', from: 'unit:a', to: 'unit:b', what: T('w'), prereq: [], minutes: 5 }] }, errors);
    expect(errors.join()).toMatch(/缺少反向链接/);
  });
  it('reports a ref to an unregistered unit, and a pending unit missing from the plan', () => {
    const { data, cat } = fixture();
    data.portals[0].to = 'pending:w9-unknown';
    expect(validateCourse(data, cat, PLAN).errors.join()).toMatch(/未登记/);
    const f = fixture();
    expect(validateCourse(f.data, f.cat, '').errors.join()).toMatch(/REBUILD_PLAN/);
  });
  it('requires every lesson / lab / chapter in exactly one World', () => {
    const { data, cat } = fixture();
    cat.challenges.set('lab-b', { title: 'B', kind: 'challenge' });
    data.worlds[1].sections[0].items.push('challenge:lab-a');
    const e = validateCourse(data, cat, PLAN).errors.join('\n');
    expect(e).toMatch(/lab-b.*没有放进任何 World/);
    expect(e).toMatch(/已经放在 World w1/);
  });
  it('checks unitsCover', () => {
    const { data, cat } = fixture();
    cat.problems.set('x-2', 'ch');
    expect(validateCourse(data, cat, PLAN).errors.join()).toMatch(/x-2/);
  });
  it('connects a pending target automatically once it is built, and shows the reverse link there', () => {
    const { data, cat } = fixture();
    const r = parseRef('pending:w9-later')!;
    expect(resolveRef(r, cat, data).state).toBe('pending');
    const built = parseUnit(unitJson({ id: 'w9-later' })).unit!;
    cat.units.set('w9-later', built);
    expect(resolveRef(r, cat, data)).toEqual({ state: 'live', ref: { kind: 'unit', id: 'w9-later' } });
    expect(backlinksTo({ kind: 'unit', id: 'w9-later' }, data, cat).map((p) => p.id)).toEqual(['p1']);
    expect(validateCourse(data, cat, PLAN).warnings.join()).toMatch(/已经建好/);
  });
  it('never locks a door: unmet prerequisites name the World to do first', () => {
    const { data, cat } = fixture();
    const p = data.portals[0];
    const none = { completed: {}, units: {}, problems: {} };
    expect(portalReadiness(p, none, data, cat)).toMatchObject({ ready: false, world: { id: 'w1' } });
    expect(portalReadiness(p, { ...none, completed: { 'lab-a': true } }, data, cat)).toEqual({ ready: true });
  });
});
