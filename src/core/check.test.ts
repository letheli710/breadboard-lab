// Challenge checker: the component matcher must be fast and exact on larger circuits (a correct
// board is never judged wrong because the search was cut short), and still name specific mistakes.
import { beforeAll, describe, expect, it } from 'vitest';
import type { Challenge } from './challenge';
import { checkCircuit } from './check';
import { setLang } from './i18n';
import type { CComponent, Circuit } from './types';

beforeAll(() => setLang('en'));

type Spec = [ref: string, type: CComponent['type'], props: CComponent['props'], pins: Record<string, string>];

/** Circuit from components with their terminal -> net name. */
function circuit(specs: Spec[]): Circuit {
  const nets = new Map<string, string[]>();
  for (const [ref, , , pins] of specs)
    for (const [pin, net] of Object.entries(pins)) {
      if (!nets.has(net)) nets.set(net, []);
      nets.get(net)!.push(`${ref}.${pin}`);
    }
  return { components: specs.map(([ref, type, props]) => ({ ref, type, props })), nets: [...nets].map(([name, pins]) => ({ name, pins })) };
}

/** The same circuit as a student would build it: other refs, other net names, other part order. */
function asBuilt(specs: Spec[]): Circuit {
  const rename = (n: string) => `U_${n}`;
  const out: Spec[] = specs.map(([, type, props, pins], i) => [`X${i + 1}`, type, { ...props }, Object.fromEntries(Object.entries(pins).map(([p, n]) => [p, rename(n)]))]);
  // deterministic shuffle
  for (let i = out.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return circuit(out);
}

function challenge(specs: Spec[]): Challenge {
  return {
    id: 't',
    title: 't',
    level: 1,
    kind: 'challenge',
    summary: '',
    description: '',
    concepts: [],
    target: circuit(specs),
    tests: [],
    measurements: [],
    compare: '',
    hints: [],
    steps: [],
    tolerance: 0.05,
    allowExtraComponents: false,
    textLang: 'en',
    source: 'builtin',
  };
}

const battery: Spec = ['B1', 'battery', { variant: '9V' }, { '+': 'VCC', '-': 'GND' }];
const series = (n: number, ohms = 1000): Spec[] => [
  battery,
  ...Array.from({ length: n }, (_, i): Spec => ['R' + (i + 1), 'resistor', { resistance: ohms }, { '1': i === 0 ? 'VCC' : `N${i}`, '2': i === n - 1 ? 'GND' : `N${i + 1}` }]),
];
const parallel = (n: number, ohms = 1000): Spec[] => [
  battery,
  ...Array.from({ length: n }, (_, i): Spec => ['R' + (i + 1), 'resistor', { resistance: ohms }, { '1': 'VCC', '2': 'GND' }]),
];
const mixed: Spec[] = [
  battery,
  ['R1', 'resistor', { resistance: 100 }, { '1': 'VCC', '2': 'A' }],
  ['L1', 'led', { color: 'red' }, { anode: 'A', cathode: 'GND' }],
  ['R2', 'resistor', { resistance: 220 }, { '1': 'VCC', '2': 'B' }],
  ['L2', 'led', { color: 'red' }, { anode: 'B', cathode: 'GND' }],
  ['R3', 'resistor', { resistance: 220 }, { '1': 'VCC', '2': 'C' }],
  ['L3', 'led', { color: 'green' }, { anode: 'C', cathode: 'GND' }],
  ['R4', 'resistor', { resistance: 1000 }, { '1': 'VCC', '2': 'D' }],
  ['R5', 'resistor', { resistance: 1000 }, { '1': 'D', '2': 'GND' }],
  ['C1', 'capacitor', { capacitance: 1e-6 }, { '1': 'D', '2': 'GND' }],
  ['C2', 'capacitor', { capacitance: 1e-5 }, { '1': 'VCC', '2': 'GND' }],
  ['D1', 'diode', {}, { anode: 'D', cathode: 'E' }],
  ['R6', 'resistor', { resistance: 1000 }, { '1': 'E', '2': 'GND' }],
  ['R7', 'resistor', { resistance: 220 }, { '1': 'E', '2': 'F' }],
  ['R8', 'resistor', { resistance: 220 }, { '1': 'F', '2': 'GND' }],
];

const timed = (ch: Challenge, user: Circuit, budget?: number) => {
  const t0 = performance.now();
  const r = checkCircuit(ch, user, undefined, budget);
  return { r, ms: performance.now() - t0 };
};
const titles = (r: ReturnType<typeof checkCircuit>) => r.issues.map((i) => i.title);
/** a spec list with one part's props or one pin's net changed */
const edit = (specs: Spec[], ref: string, f: (s: Spec) => Spec): Spec[] => specs.map((s) => (s[0] === ref ? f(s) : s));

describe('checker: correct larger circuits are perfect, fast', () => {
  for (const [name, specs] of [
    ['12 series resistors', series(12)],
    ['12 parallel resistors', parallel(12)],
    ['mixed 15 parts', mixed],
  ] as [string, Spec[]][])
    it(name, () => {
      const ch = challenge(specs);
      checkCircuit(ch, asBuilt(specs)); // warm-up (JIT)
      const { r, ms } = timed(ch, asBuilt(specs));
      expect(titles(r)).toEqual([]);
      expect(r.perfect).toBe(true);
      expect(r.undecided).toBeFalsy();
      expect(r.progress).toBe(1);
      expect(ms).toBeLessThan(100);
    });

  it('a 20-resistor series chain is still exact', () => {
    const ch = challenge(series(20));
    const { r, ms } = timed(ch, asBuilt(series(20)));
    expect(r.perfect).toBe(true);
    expect(ms).toBeLessThan(200);
  });
});

describe('checker: wrong circuits still get specific feedback', () => {
  it('wrong value in a 12-resistor chain', () => {
    const specs = series(12);
    const { r, ms } = timed(challenge(specs), asBuilt(edit(specs, 'R7', ([ref, t, , p]) => [ref, t, { resistance: 2200 }, p])));
    expect(r.perfect).toBe(false);
    expect(r.undecided).toBeFalsy();
    expect(titles(r)).toEqual([expect.stringContaining('Wrong value')]);
    expect(ms).toBeLessThan(100);
  });

  it('one broken connection in a 12-resistor chain', () => {
    const specs = series(12);
    const { r, ms } = timed(challenge(specs), asBuilt(edit(specs, 'R5', ([ref, t, pr, p]) => [ref, t, pr, { ...p, '2': 'LOOSE' }])));
    expect(r.undecided).toBeFalsy();
    expect(titles(r)).toEqual([expect.stringContaining('Not connected')]);
    expect(ms).toBeLessThan(100);
  });

  it('missing and extra parts', () => {
    const specs = parallel(12);
    const missing = timed(challenge(specs), asBuilt(specs.filter((s) => s[0] !== 'R4')));
    expect(titles(missing.r)).toEqual([expect.stringContaining('Missing part')]);
    const extra = timed(challenge(specs), asBuilt([...specs, ['R99', 'resistor', { resistance: 1000 }, { '1': 'VCC', '2': 'Z' }]]));
    expect(titles(extra.r)).toEqual([expect.stringContaining('Extra part')]);
    expect(missing.ms + extra.ms).toBeLessThan(100);
  });

  it('reversed LED and extra connection in the mixed circuit', () => {
    const rev = timed(challenge(mixed), asBuilt(edit(mixed, 'L3', ([ref, t, pr]) => [ref, t, pr, { anode: 'GND', cathode: 'C' }])));
    expect(titles(rev.r)).toEqual([expect.stringMatching(/is backwards/)]);
    const short = timed(challenge(mixed), asBuilt(edit(mixed, 'R7', ([ref, t, pr]) => [ref, t, pr, { '1': 'E', '2': 'GND' }])));
    expect(short.r.perfect).toBe(false);
    expect(titles(short.r).some((t) => /Extra connection|Not connected/.test(t))).toBe(true);
    expect(rev.ms + short.ms).toBeLessThan(100);
  });

  it('a thoroughly scrambled board is decided, not timed out', () => {
    // target: parallel bank; student: everything in series
    const { r, ms } = timed(challenge(parallel(10)), asBuilt(series(10)));
    expect(r.undecided).toBeFalsy();
    expect(r.perfect).toBe(false);
    expect(ms).toBeLessThan(1000);
  });
});

describe('checker: out of budget', () => {
  it('says it could not decide instead of judging a correct board wrong', () => {
    const r = checkCircuit(challenge(mixed), asBuilt(mixed), undefined, 3);
    expect(r.perfect).toBe(false);
    expect(r.undecided).toBe(true);
    expect(titles(r)).toEqual([expect.stringContaining('Could not decide')]);
    expect(r.issues[0].severity).toBe('warning');
  });
});
