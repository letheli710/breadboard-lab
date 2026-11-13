import { afterEach, describe, expect, it, vi } from 'vitest';
import { sanitizeLayout, sanitizeProps, sanitizeReadings } from './persist';

let n = 0;
const id = () => `t${n++}`;

class MemStorage {
  m = new Map<string, string>();
  get length() {
    return this.m.size;
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, String(v));
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  clear() {
    this.m.clear();
  }
}

describe('sanitizeLayout', () => {
  it('keeps good parts and drops unknown types, bad / missing / shared holes', () => {
    const r = sanitizeLayout(
      {
        version: 1,
        parts: [
          { id: 'a', ref: 'R1', type: 'resistor', props: { resistance: 330, bogus: 1 }, pins: { '1': 'a1', '2': 'a5' } },
          { id: 'b', ref: 'X1', type: 'flux_capacitor', props: {}, pins: { '1': 'b1' } },
          { id: 'c', ref: 'R2', type: 'resistor', props: {}, pins: { '1': 'zz9', '2': 'a6' } },
          { id: 'd', ref: 'R3', type: 'resistor', props: {}, pins: { '1': 'a7' } },
          { id: 'e', ref: 'R4', type: 'resistor', props: {}, pins: { '1': 'a1', '2': 'a9' } },
          { id: 'f', ref: 'R1', type: 'led', props: {}, pins: { anode: 'c1', cathode: 'c2' } },
          null,
          'junk',
          { id: 'a', ref: 'D1', type: 'led', props: { color: 'plaid' }, pins: { anode: 'c1', cathode: 'c2' } },
        ],
      },
      id,
    )!;
    expect(r.layout.parts.map((p) => p.ref)).toEqual(['R1', 'D1']);
    expect(r.dropped).toBe(7);
    expect(r.layout.parts[0].props).toEqual({ resistance: 330 }); // unknown key dropped
    expect(r.layout.parts[1].id).not.toBe('a'); // duplicate id replaced
    expect(r.layout.parts[1].props.color).toBe('red'); // invalid colour → default
  });

  it('rejects non-layouts and unknown future versions; legacy (no version) is v1', () => {
    expect(sanitizeLayout(null, id)).toBeNull();
    expect(sanitizeLayout({ parts: 'x' }, id)).toBeNull();
    expect(sanitizeLayout({ version: 99, parts: [] }, id)).toBeNull();
    expect(sanitizeLayout({ parts: [] }, id)?.layout).toEqual({ version: 1, parts: [] });
  });

  it('props: wrong types are dropped, pin configs are checked', () => {
    const p = sanitizeProps('esp32_devkit', { usb: 'yes', pins: { GPIO2: { mode: 'out_high' }, GPIO4: { mode: 'warp' }, GPIO5: 'pwm' } });
    expect(p.usb).toBe(true); // default
    expect(p.pins).toEqual({ GPIO2: { mode: 'out_high' } });
    expect(sanitizeProps('resistor', { resistance: 'NaN' }).resistance).toBe(sanitizeProps('resistor', {}).resistance);
  });
});

describe('corrupted storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('the store still loads, and bad values are discarded', async () => {
    const ls = new MemStorage();
    ls.setItem('bb.completed', '{not json');
    ls.setItem('bb.scope', JSON.stringify({ tdiv: 'fast', collapsed: true, drag: { x: 'a' } }));
    ls.setItem('bb.practice.answers', JSON.stringify({ p1: { q1: true, q2: 'x' }, p2: 5 }));
    ls.setItem('bb.practice.current', JSON.stringify(42));
    ls.setItem('bb.lang', JSON.stringify({}));
    ls.setItem(
      'bb.layout.sandbox',
      JSON.stringify({ version: 1, parts: [{ ref: 'Q1', type: 'nope', pins: {} }, { id: 'x', ref: 'R1', type: 'resistor', props: { resistance: 100 }, pins: { '1': 'a1', '2': 'a4' } }] }),
    );
    vi.stubGlobal('localStorage', ls);
    vi.resetModules();
    const { useStore } = await import('./store');
    const s = useStore.getState();
    expect(s.completed).toEqual({});
    expect(ls.getItem('bb.completed')).toBeNull();
    expect(s.scope.collapsed).toBe(true);
    expect(s.scope.tdiv).toBeNull();
    expect(s.scope.drag).toEqual({ x: 0, y: 0 });
    // version-1 `true` migrates to the per-question record (state/practice.ts)
    expect(s.practiceAnswers).toEqual({ p1: { q1: { status: 'unaided' } } });
    expect(s.problemId).toBeNull();
    s.setMode('sandbox');
    expect(useStore.getState().layout.parts.map((p) => p.ref)).toEqual(['R1']);

    ls.setItem('bb.layout.sandbox', '"garbage"');
    useStore.getState().setMode('challenge');
    useStore.getState().setMode('sandbox');
    expect(useStore.getState().layout.parts).toEqual([]);
  });
});

describe('sanitizeReadings (measurement-question answers)', () => {
  it('keeps well-typed answers and drops the rest', () => {
    const r = sanitizeReadings({
      'exp-kcl-ammeters': {
        passed: 'abc',
        answers: {
          i1: { predict: '8.8', input: '8.84m', ok: true, key: 'k1', tries: 2, stale: false },
          kcl: { choice: 0, ok: true },
          bad: { input: 42, ok: 'yes', choice: -1, tries: -3 },
        },
      },
      broken: { answers: 'nope' },
      alsoBroken: 7,
    });
    expect(r).toEqual({
      'exp-kcl-ammeters': {
        passed: 'abc',
        answers: { i1: { predict: '8.8', input: '8.84m', ok: true, key: 'k1', tries: 2 }, kcl: { choice: 0, ok: true }, bad: {} },
      },
    });
    expect(sanitizeReadings([])).toBeUndefined();
    expect(sanitizeReadings({ x: { answers: { q: { input: 'x'.repeat(500) } } } })).toEqual({ x: { answers: { q: {} } } });
  });
});
