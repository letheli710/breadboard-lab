import { afterEach, describe, expect, it } from 'vitest';
import { setLang } from '../i18n';
import { extractNetlist, junctionPoints, terminalPoints } from './geometry';
import type { Pt, Schematic } from './types';

afterEach(() => setLang('zh'));

const node = (s: Schematic, pin: string) => extractNetlist(s).netlist.nodeOf.get(pin);

// Voltage divider: Us from (0,4) up to (0,0); R1 (0,0)-(4,0); R2 (4,0)-(4,4); ground at (2,4)
const divider = (): Schematic => ({
  elements: [
    { ref: 'Us', type: 'V', from: [0, 2], to: [0, 4], value: 10 },
    { ref: 'R1', type: 'R', from: [0, 0], to: [4, 0], value: '2k' },
    { ref: 'R2', type: 'R', from: [4, 0], to: [4, 4], value: 1000 },
  ],
  wires: [
    [
      [0, 2],
      [0, 0],
    ],
    [
      [0, 4],
      [4, 4],
    ],
  ],
  grounds: [[2, 4]],
  labels: [{ at: [4, 0], name: 'a' }],
});

describe('terminalPoints', () => {
  it('two-terminal: p = from, n = to', () => {
    expect(terminalPoints({ ref: 'R1', type: 'R', from: [1, 2], to: [1, 5] })).toEqual({ p: [1, 2], n: [1, 5] });
  });
  it('opamp offsets, orient and flip', () => {
    expect(terminalPoints({ ref: 'A', type: 'OPAMP', at: [10, 10] })).toEqual({ minus: [8, 9], plus: [8, 11], out: [12, 10] });
    expect(terminalPoints({ ref: 'A', type: 'OPAMP', at: [10, 10], flip: true })).toEqual({ minus: [8, 11], plus: [8, 9], out: [12, 10] });
    expect(terminalPoints({ ref: 'A', type: 'OPAMP', at: [10, 10], orient: 'left' })).toEqual({ minus: [12, 9], plus: [12, 11], out: [8, 10] });
    expect(terminalPoints({ ref: 'A', type: 'OPAMP', at: [10, 10], orient: 'left', flip: true })).toEqual({ minus: [12, 11], plus: [12, 9], out: [8, 10] });
  });
  it('transformer offsets', () => {
    expect(terminalPoints({ ref: 'T', type: 'XFMR', at: [5, 5], n: 2 })).toEqual({ p1: [3, 4], n1: [3, 6], p2: [7, 4], n2: [7, 6] });
  });
  it('coupling has no pins', () => {
    expect(terminalPoints({ ref: 'K1', type: 'K', l1: 'L1', l2: 'L2', k: 0.5 })).toEqual({});
  });
});

describe('extractNetlist', () => {
  it('divider: grounds, labels, T-junction of the ground on a wire', () => {
    const r = extractNetlist(divider());
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
    const m = r.netlist.nodeOf;
    expect(m.get('Us.n')).toBe('0');
    expect(m.get('R2.n')).toBe('0');
    expect(m.get('R1.n')).toBe('a');
    expect(m.get('R2.p')).toBe('a');
    expect(m.get('Us.p')).toBe('_1');
    expect(m.get('R1.p')).toBe('_1');
    expect(r.netlist.nodes).toEqual(['0', '_1', 'a']);
  });

  it('a wire endpoint in the interior of another wire makes a T-junction', () => {
    const s: Schematic = {
      elements: [
        { ref: 'R1', type: 'R', from: [0, 0], to: [0, 2] },
        { ref: 'R2', type: 'R', from: [3, 4], to: [3, 6] },
      ],
      wires: [
        [
          [0, 2],
          [0, 3],
          [6, 3],
        ],
        [
          [3, 3],
          [3, 4],
        ],
        [
          [0, 0],
          [0, -1],
          [8, -1],
          [8, 6],
          [3, 6],
        ],
      ],
      grounds: [[8, 2]],
    };
    const r = extractNetlist(s);
    expect(r.errors).toEqual([]);
    expect(node(s, 'R1.n')).toBe(node(s, 'R2.p'));
    expect(node(s, 'R1.p')).toBe('0');
    expect(node(s, 'R2.n')).toBe('0');
    expect(junctionPoints(s)).toContainEqual([3, 3]);
    expect(junctionPoints(s)).not.toContainEqual([0, 3]); // a bend is not a junction
  });

  it('element terminal on the interior of a wire connects to it', () => {
    const s: Schematic = {
      elements: [
        { ref: 'R1', type: 'R', from: [2, 0], to: [2, 3] },
        { ref: 'R2', type: 'R', from: [0, 3], to: [0, 0] },
      ],
      wires: [
        [
          [0, 0],
          [4, 0],
        ],
        [
          [0, 3],
          [2, 3],
        ],
      ],
      grounds: [[1, 3]],
    };
    const r = extractNetlist(s);
    expect(r.errors).toEqual([]);
    expect(node(s, 'R1.p')).toBe(node(s, 'R2.n'));
  });

  it('crossing wires without a shared point do not connect', () => {
    const s: Schematic = {
      elements: [
        { ref: 'R1', type: 'R', from: [0, 2], to: [0, 4] },
        { ref: 'R2', type: 'R', from: [2, 0], to: [4, 0] },
        { ref: 'R3', type: 'R', from: [6, 2], to: [6, 4] },
        { ref: 'R4', type: 'R', from: [2, 6], to: [4, 6] },
      ],
      wires: [
        // horizontal line through (3,2)… and vertical through (3,2) — they cross at (3,2)
        [
          [0, 2],
          [6, 2],
        ],
        [
          [3, 0],
          [3, 6],
        ],
        [
          [0, 4],
          [0, 7],
          [6, 7],
          [6, 4],
        ],
        [
          [2, 0],
          [2, -1],
          [1, -1],
        ],
      ],
      grounds: [[3, 7]],
    };
    const r = extractNetlist(s);
    // R2 sits on the wire? (3,0) is inside R2's body — warned, not connected
    expect(node(s, 'R1.p')).toBe(node(s, 'R3.p'));
    expect(node(s, 'R1.p')).not.toBe(node(s, 'R4.p'));
    expect(r.warnings.some((w) => w.includes('R2'))).toBe(true);
    expect(junctionPoints(s)).not.toContainEqual([3, 2]);
  });

  it('a shared vertex at a crossing does connect', () => {
    const s: Schematic = {
      elements: [
        { ref: 'R1', type: 'R', from: [0, 2], to: [-2, 2] },
        { ref: 'R2', type: 'R', from: [3, 6], to: [3, 8] },
      ],
      wires: [
        [
          [0, 2],
          [3, 2],
          [6, 2],
        ],
        [
          [3, 0],
          [3, 6],
        ],
        [
          [-2, 2],
          [-2, 8],
          [3, 8],
        ],
      ],
      grounds: [[0, 8]],
    };
    expect(extractNetlist(s).errors).toEqual([]);
    expect(node(s, 'R1.p')).toBe(node(s, 'R2.p'));
    expect(junctionPoints(s)).toContainEqual([3, 2]);
  });

  it('auto names are stable: sorted by min x then y', () => {
    const s: Schematic = {
      elements: [
        { ref: 'R1', type: 'R', from: [4, 0], to: [6, 0] },
        { ref: 'R2', type: 'R', from: [2, 0], to: [4, 0] },
        { ref: 'R3', type: 'R', from: [6, 0], to: [6, 2] },
        { ref: 'Us', type: 'V', from: [0, 2], to: [0, 0] },
      ],
      wires: [
        [
          [0, 0],
          [2, 0],
        ],
        [
          [0, 2],
          [6, 2],
        ],
      ],
      grounds: [[0, 2]],
    };
    const r = extractNetlist(s);
    expect(r.errors).toEqual([]);
    expect(r.netlist.nodeOf.get('Us.n')).toBe('_1');
    expect(r.netlist.nodeOf.get('R2.n')).toBe('_2');
    expect(r.netlist.nodeOf.get('R1.n')).toBe('_3');
    expect(r.netlist.nodes).toEqual(['0', '_1', '_2', '_3']);
  });

  it('op-amp inverting amplifier pins', () => {
    const s: Schematic = {
      elements: [
        { ref: 'Ui', type: 'V', from: [0, 3], to: [0, 5], value: 1 },
        { ref: 'R1', type: 'R', from: [0, 3], to: [3, 3] },
        { ref: 'Rf', type: 'R', from: [3, 1], to: [7, 1] },
        { ref: 'A', type: 'OPAMP', at: [5, 4] },
      ],
      wires: [
        [
          [3, 1],
          [3, 3],
        ],
        [
          [7, 1],
          [7, 4],
        ],
        [
          [0, 5],
          [3, 5],
        ],
      ],
      grounds: [[0, 5]],
      terminals: [{ at: [7, 4], name: 'o' }],
    };
    const r = extractNetlist(s);
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
    const m = r.netlist.nodeOf;
    expect(m.get('A.minus')).toBe(m.get('R1.n'));
    expect(m.get('A.plus')).toBe('0');
    expect(m.get('A.out')).toBe('o');
    expect(m.get('Rf.n')).toBe('o');
  });

  it('transformer pins and coupling validation', () => {
    const s: Schematic = {
      elements: [
        { ref: 'Us', type: 'V', from: [0, 5], to: [0, 3], value: 10 },
        { ref: 'T', type: 'XFMR', at: [4, 4], n: 2 },
        { ref: 'RL', type: 'R', from: [8, 3], to: [8, 5] },
        { ref: 'L1', type: 'L', from: [0, 7], to: [0, 9] },
        { ref: 'K1', type: 'K', l1: 'L1', l2: 'RL', k: 0.5 },
      ],
      wires: [
        [
          [0, 3],
          [2, 3],
        ],
        [
          [0, 5],
          [2, 5],
        ],
        [
          [6, 3],
          [8, 3],
        ],
        [
          [6, 5],
          [8, 5],
        ],
        [
          [0, 9],
          [0, 10],
        ],
        [
          [0, 7],
          [0, 5],
        ],
      ],
      grounds: [[0, 10]],
    };
    const r = extractNetlist(s);
    const m = r.netlist.nodeOf;
    expect(m.get('T.p1')).toBe(m.get('Us.n'));
    expect(m.get('T.n1')).toBe(m.get('Us.p'));
    expect(m.get('T.p2')).toBe(m.get('RL.p'));
    expect(m.get('T.n2')).toBe(m.get('RL.n'));
    expect(r.errors.some((e) => e.includes('RL'))).toBe(true); // RL is not an inductor
  });

  it('grounded port terminal becomes an alias of "0"', () => {
    const s = divider();
    s.terminals = [{ at: [2, 4], name: 'b' }];
    const r = extractNetlist(s);
    expect(r.errors).toEqual([]);
    expect(r.aliases.get('b')).toBe('0');
  });

  it('several names on the ground node are all aliases of "0" (primed two-port terminals)', () => {
    const s = divider();
    s.terminals = [
      { at: [0, 4], name: "1'" },
      { at: [4, 4], name: "2'" },
    ];
    s.labels!.push({ at: [2, 4], name: 'gnd' });
    const r = extractNetlist(s);
    expect(r.errors).toEqual([]);
    expect(r.aliases.get("1'")).toBe('0');
    expect(r.aliases.get("2'")).toBe('0');
    expect(r.netlist.nodes).not.toContain("1'");
  });

  it('primed names on an ordinary node work', () => {
    const s = divider();
    s.labels = [{ at: [4, 0], name: "a'" }];
    const r = extractNetlist(s);
    expect(r.errors).toEqual([]);
    expect(r.netlist.nodeOf.get('R2.p')).toBe("a'");
  });

  describe('loops (mesh-current arrows)', () => {
    const errs = (s: Schematic) => extractNetlist(s).errors;
    it('an arrow in the middle of a mesh is fine and does not change the netlist', () => {
      const s = divider();
      const before = extractNetlist(s).netlist;
      s.loops = [
        { at: [2, 2], name: 'i_m1' },
        { at: [2, 1], name: 'i_m2', dir: 'ccw' },
      ];
      const r = extractNetlist(s);
      expect(r.errors).toEqual([]);
      expect(r.warnings).toEqual([]);
      expect([...r.netlist.nodeOf]).toEqual([...before.nodeOf]);
      expect(r.netlist.nodes).toEqual(before.nodes);
    });
    it('rejects a centre on a wire, on an element, on an op-amp, and a bad dir', () => {
      setLang('en');
      const s = divider();
      s.loops = [{ at: [2, 4], name: 'w' }];
      expect(errs(s).join()).toMatch(/Loop current w at \(2,4\) sits on a wire/);
      s.loops = [{ at: [2, 0], name: 'e' }];
      expect(errs(s).join()).toMatch(/Loop current e at \(2,0\) sits on R1/);
      s.loops = [{ at: [4, 2] }];
      expect(errs(s).join()).toMatch(/sits on R2/);
      s.elements.push({ ref: 'A', type: 'OPAMP', at: [10, 2] });
      s.loops = [{ at: [11, 3], name: 'x' }];
      expect(errs(s).join()).toMatch(/sits on A/);
      s.loops = [{ at: [2, 2], name: 'd', dir: 'left' as 'cw' }];
      expect(errs(s).join()).toMatch(/dir must be "cw"/);
      s.loops = [{ at: [2] as unknown as Pt, name: 'p' }];
      expect(errs(s).join()).toMatch(/invalid position/);
      setLang('zh');
      s.loops = [{ at: [2, 4], name: 'w' }];
      expect(errs(s).join()).toMatch(/压在导线上/);
    });
  });

  describe('marks on multi-terminal elements', () => {
    const errs = (s: Schematic) => extractNetlist(s).errors;
    const withParts = (): Schematic => {
      const s = divider();
      s.elements.push({ ref: 'A', type: 'OPAMP', at: [10, 2] }, { ref: 'T', type: 'XFMR', at: [20, 2], n: 2 }, { ref: 'K1', type: 'K', l1: 'R1', l2: 'R2', k: 0.5 });
      return s;
    };
    it('allows the output-current mark on an op-amp', () => {
      const s = withParts();
      s.marks = [{ kind: 'i', el: 'A', name: 'i_o' }];
      expect(errs(s).filter((e) => !/K1/.test(e))).toEqual([]);
    });
    it('rejects voltage marks on op-amps and any mark on XFMR / K', () => {
      setLang('en');
      const s = withParts();
      s.marks = [{ kind: 'v', el: 'A' }];
      expect(errs(s).join()).toMatch(/Op-amp A only takes a current mark/);
      s.marks = [{ kind: 'i', el: 'T' }];
      expect(errs(s).join()).toMatch(/T \(XFMR\) can't take one/);
      s.marks = [{ kind: 'v', el: 'K1' }];
      expect(errs(s).join()).toMatch(/K1 \(K\) can't take one/);
    });
  });

  describe('errors', () => {
    const errs = (s: Schematic) => extractNetlist(s).errors;
    it('diagonal wire', () => {
      const s = divider();
      s.wires.push([
        [0, 0],
        [1, 1],
      ]);
      expect(errs(s).join()).toMatch(/斜线/);
      setLang('en');
      expect(errs(s).join()).toMatch(/diagonal/);
    });
    it('diagonal / too short element', () => {
      const s = divider();
      s.elements.push({ ref: 'R9', type: 'R', from: [0, 0], to: [2, 2] }, { ref: 'R8', type: 'R', from: [0, 0], to: [1, 0] });
      setLang('en');
      const e = errs(s).join('\n');
      expect(e).toMatch(/R9 must be horizontal/);
      expect(e).toMatch(/R8 is too short/);
    });
    it('no ground', () => {
      const s = divider();
      s.grounds = [];
      setLang('en');
      expect(errs(s).join()).toMatch(/No ground/);
    });
    it('label / ground / terminal not on anything', () => {
      const s = divider();
      s.labels!.push({ at: [2, 2], name: 'x' });
      s.grounds!.push([9, 9]);
      s.terminals = [{ at: [2, 1], name: 't' }];
      setLang('en');
      const e = errs(s).join('\n');
      expect(e).toMatch(/Label x at \(2,2\)/);
      expect(e).toMatch(/Ground at \(9,9\)/);
      expect(e).toMatch(/Terminal t at \(2,1\)/);
    });
    it('two names on one node, one name on two nodes, reserved names', () => {
      setLang('en');
      const s = divider();
      s.labels!.push({ at: [4, 0], name: 'b' });
      expect(errs(s).join()).toMatch(/several names/);
      const s2 = divider();
      s2.labels!.push({ at: [0, 1], name: 'a' });
      expect(errs(s2).join()).toMatch(/Name a is used for two different nodes/);
      const s3 = divider();
      s3.labels!.push({ at: [0, 1], name: 'gnd' });
      expect(errs(s3).join()).toMatch(/reserved for ground/);
      const s4 = divider();
      s4.labels!.push({ at: [0, 1], name: '_3' });
      expect(errs(s4).join()).toMatch(/reserved/);
    });
    it('refs: duplicate, empty, ctrl, K, marks', () => {
      setLang('en');
      const s = divider();
      s.elements.push(
        { ref: 'R1', type: 'R', from: [10, 0], to: [10, 2] },
        { ref: '', type: 'R', from: [12, 0], to: [12, 2] },
        { ref: 'E1', type: 'VCVS', from: [14, 0], to: [14, 2], value: 2, ctrl: { v: 'Rx' } },
        { ref: 'H1', type: 'CCVS', from: [16, 0], to: [16, 2], value: 2, ctrl: { v: 'R1' } },
        { ref: 'G1', type: 'VCCS', from: [18, 0], to: [18, 2], value: 2, ctrl: { vnodes: ['a', 'zz'] } },
        { ref: 'F1', type: 'CCCS', from: [20, 0], to: [20, 2], value: 2 },
        { ref: 'K1', type: 'K', l1: 'L1', l2: 'L2', k: 0.5 },
      );
      s.marks = [{ kind: 'i', el: 'Q1' }];
      const e = errs(s).join('\n');
      expect(e).toMatch(/Duplicate element ref R1/);
      expect(e).toMatch(/has no ref/);
      expect(e).toMatch(/E1: controlling element Rx/);
      expect(e).toMatch(/H1 \(CCVS\) must be controlled by a current/);
      expect(e).toMatch(/G1: control voltage refers to unknown node zz/);
      expect(e).toMatch(/F1 has no ctrl/);
      expect(e).toMatch(/missing inductor L1/);
      expect(e).toMatch(/missing element Q1/);
    });
    it('valid ctrl refs pass', () => {
      const s = divider();
      s.elements.push({ ref: 'G1', type: 'VCCS', from: [6, 0], to: [6, 4], value: 2, ctrl: { vnodes: ['a', 'gnd'] } });
      s.wires.push(
        [
          [4, 0],
          [6, 0],
        ],
        [
          [4, 4],
          [6, 4],
        ],
      );
      expect(errs(s)).toEqual([]);
    });
  });

  describe('warnings', () => {
    it('dangling terminal, unless an open terminal marker', () => {
      setLang('en');
      const s = divider();
      s.elements.push({ ref: 'R3', type: 'R', from: [4, 0], to: [6, 0] });
      const w = extractNetlist(s).warnings.join('\n');
      expect(w).toMatch(/R3 terminal n at \(6,0\) is not connected to anything/);
      s.terminals = [{ at: [6, 0], name: 'c' }];
      expect(extractNetlist(s).warnings).toEqual([]);
      setLang('zh');
      s.terminals = [];
      expect(extractNetlist(s).warnings.join()).toMatch(/R3 的 n 端 \(6,0\) 没有连接任何东西/);
    });
    it('wire point inside an element body, and shorted element', () => {
      setLang('en');
      const s = divider();
      s.wires.push([
        [2, 0],
        [2, -2],
      ] as Pt[]);
      const w = extractNetlist(s).warnings.join('\n');
      expect(w).toMatch(/\(2,0\) lies on the body of R1/);
      const s2 = divider();
      s2.wires.push([
        [0, 0],
        [4, 0],
      ]);
      const w2 = extractNetlist(s2).warnings.join('\n');
      expect(w2).toMatch(/overlaps R1/);
      expect(w2).toMatch(/R1 are on the same node/);
    });
  });
});
