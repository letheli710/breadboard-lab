// The ammeter's screen (step 3): DC average by default; in auto mode an AC current (average ≈ 0)
// shows its RMS as "AC RMS"; the AC range shows true RMS of AC + DC. The AC lessons rely on auto.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseChallenge } from '../core/challenge';
import type { MeterReading } from '../core/transient';
import { ammeterDisplay, deriveAc } from './derived';
import { simulate } from '../core/solver';

const sim = (I: number) => ({ meters: new Map([['AM1', { current: I }]]) }) as never;
const ac = (m: Partial<MeterReading>) => ({ meters: new Map([['AM1', { dc: 0, rms: 0, min: 0, max: 0, pp: 0, ...m }]]) }) as never;

describe('ammeter display', () => {
  it('shows the DC current on a DC circuit, in auto and DC modes', () => {
    expect(ammeterDisplay({ sim: sim(0.012), ac: null }, 'AM1')).toEqual({ value: 0.012, kind: 'dc', auto: true });
    expect(ammeterDisplay({ sim: sim(0.012), ac: null }, 'AM1', 'dc')).toEqual({ value: 0.012, kind: 'dc', auto: false });
    expect(ammeterDisplay({ sim: sim(-0.012), ac: null }, 'AM1', 'ac')).toEqual({ value: 0.012, kind: 'acdc', auto: false });
  });

  it('switches to AC RMS by itself when the average is about 0', () => {
    expect(ammeterDisplay({ sim: sim(0), ac: ac({ dc: 1e-5, rms: 0.007 }) }, 'AM1')).toEqual({ value: 0.007, kind: 'ac', auto: true });
    expect(ammeterDisplay({ sim: sim(0), ac: ac({ dc: 1e-5, rms: 0.007 }) }, 'AM1', 'dc').kind).toBe('dc');
  });

  it('keeps the DC average for a current with a DC part, unless the AC range is picked', () => {
    const d = { sim: sim(0), ac: ac({ dc: 0.263, rms: 0.317 }) };
    expect(ammeterDisplay(d, 'AM1')).toEqual({ value: 0.263, kind: 'dc', auto: true });
    expect(ammeterDisplay(d, 'AM1', 'ac')).toEqual({ value: 0.317, kind: 'acdc', auto: false });
  });

  it.each(['270-pf-correction'])('shows AC RMS on its own in lesson %s (its layout has an ammeter)', (id) => {
    const ch = parseChallenge(JSON.parse(readFileSync(`challenges/${id}.json`, 'utf8'))).challenge!;
    const layout = ch.solution!;
    const tr = deriveAc(layout);
    expect(tr).not.toBeNull();
    const refs = layout.parts.filter((p) => p.type === 'ammeter').map((p) => p.ref);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(ammeterDisplay({ sim: simulate({ components: [], nets: [] } as never), ac: tr }, ref).kind).toBe('ac');
  });
});
