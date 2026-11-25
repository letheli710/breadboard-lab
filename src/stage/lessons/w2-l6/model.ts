// W2-L6 numbers: the two black boxes of acts 1–2 (12 V series 4 Ω ⟺ 3 A parallel 4 Ω) under a
// load switch, the dependent-source circuit of act 4 (16 V, 2 Ω carrying v_x, 0.25 v_x ∥ 4 Ω),
// and the two reduction pipelines (act 3: Sadiku 4.4, v_o; act 5: the guided example, i_o) as
// ladders of shunt branches and top-rail series elements, one ladder per pipeline step 0 … 4.

/* ------------------------------------------------------------- layer 01: the black boxes */

export type Load = 'open' | '2ohm' | 'short';

export const BOX = { vs: 12, r: 4, is: 3, rl: 2 } as const;

export interface BoxReading {
  /** port voltage v_ab */
  v: number;
  /** current out of port a */
  i: number;
  /** load power */
  pl: number;
  /** current through / power in the internal resistor */
  ir: number;
  pr: number;
  /** power the source delivers */
  ps: number;
}

/** Port and internal quantities of box A (vs series R) and box B (is parallel R) under a load. */
export function boxes(load: Load): { a: BoxReading; b: BoxReading } {
  const { vs, r, is, rl } = BOX;
  // the port is the same for both boxes (vs = is·R): solve it once
  const i = load === 'open' ? 0 : load === 'short' ? vs / r : vs / (r + rl);
  const v = load === 'open' ? vs : load === 'short' ? 0 : i * rl;
  const pl = v * i;
  const irB = v / r;
  return {
    a: { v, i, pl, ir: i, pr: i * i * r, ps: vs * i },
    b: { v, i, pl, ir: irB, pr: irB * irB * r, ps: is * v },
  };
}

/* ------------------------------------------------------------- layer 02: act 4's dependent source */

export interface DepSolution {
  /** loop current (clockwise) */
  i: number;
  vx: number;
  /** value of the transformed dependent voltage source, as a multiple of v_x (+ at the top when > 0) */
  k: number;
}

/**
 * 16 V (+ up) in series with 2 Ω (v_x, + on the left), then 4 Ω ∥ 0.25 v_x (arrow up, or down).
 * After the transformation: one loop, −16 + 2i + 4i ± v_x = 0 with v_x = 2i.
 */
export function solveDep(arrowUp: boolean): DepSolution {
  const g = 0.25;
  const rp = 4;
  const k = (arrowUp ? 1 : -1) * g * rp; // v_d = ±(g·R_p) v_x
  // −16 + 2i + 4i + k·v_x = 0, v_x = 2i  ⇒  i (6 + 2k) = 16
  const i = 16 / (6 + 2 * k);
  return { i, vx: 2 * i, k };
}

/* ------------------------------------------------------------- layer 03: the reduction ladders */

export type Dir = 'up' | 'down';

/** One element of a ladder: a branch from the top rail to the bottom rail (shunt) or an element
 *  in the top rail (series). `isrc` arrows / `vsrc` + signs point up or down. */
export type LadderEl =
  | { id: string; at: 'shunt'; kind: 'r'; ohm: number; target?: boolean; tag?: string }
  | { id: string; at: 'series'; kind: 'r'; ohm: number }
  | { id: string; at: 'shunt'; kind: 'isrc'; amp: number; dir: Dir }
  | { id: string; at: 'shunt'; kind: 'vsrc'; volt: number; plus: Dir };

export interface PipeStage {
  els: LadderEl[];
  /** ids created by the step that led here (drawn as new) */
  fresh: string[];
  /** ids the next step works on ("下一刀") */
  next: string[];
  /** one line: what this stage is */
  caption: string;
  /** TeX of the step that led here (none at stage 0) */
  tex?: string;
}

export type PipeId = 'sadiku' | 'guided';

const R = String.raw;

export const PIPES: Record<PipeId, PipeStage[]> = {
  // act 3 · Sadiku 4.4 (adapted): find v_o across 8 Ω
  sadiku: [
    {
      els: [
        { id: 'vL', at: 'shunt', kind: 'vsrc', volt: 12, plus: 'down' },
        { id: 'r3', at: 'series', kind: 'r', ohm: 3 },
        { id: 'r8', at: 'shunt', kind: 'r', ohm: 8, target: true, tag: 'v_o' },
        { id: 'r2', at: 'series', kind: 'r', ohm: 2 },
        { id: 'r4', at: 'shunt', kind: 'r', ohm: 4 },
        { id: 'iR', at: 'shunt', kind: 'isrc', amp: 3, dir: 'up' },
      ],
      fresh: [],
      next: ['r4', 'iR'],
      caption: '阶段 0：原始多电源网络（锁定红框 8 Ω）',
    },
    {
      els: [
        { id: 'vL', at: 'shunt', kind: 'vsrc', volt: 12, plus: 'down' },
        { id: 'r3', at: 'series', kind: 'r', ohm: 3 },
        { id: 'r8', at: 'shunt', kind: 'r', ohm: 8, target: true, tag: 'v_o' },
        { id: 'r2', at: 'series', kind: 'r', ohm: 2 },
        { id: 'r4s', at: 'series', kind: 'r', ohm: 4 },
        { id: 'vR', at: 'shunt', kind: 'vsrc', volt: 12, plus: 'up' },
      ],
      fresh: ['r4s', 'vR'],
      next: ['r2', 'r4s'],
      caption: '第 1 步：右侧 3 A↑ ∥ 4 Ω → 12 V（+上）串 4 Ω',
      tex: R`v_{sR} = i_{sR} R_{R1} = 3 \times 4 = 12\text{ V}`,
    },
    {
      els: [
        { id: 'vL', at: 'shunt', kind: 'vsrc', volt: 12, plus: 'down' },
        { id: 'r3', at: 'series', kind: 'r', ohm: 3 },
        { id: 'r8', at: 'shunt', kind: 'r', ohm: 8, target: true, tag: 'v_o' },
        { id: 'r6s', at: 'series', kind: 'r', ohm: 6 },
        { id: 'vR', at: 'shunt', kind: 'vsrc', volt: 12, plus: 'up' },
      ],
      fresh: ['r6s'],
      next: ['vL', 'r3', 'r6s', 'vR'],
      caption: '第 2 步：右侧串联电阻合并 2 + 4 = 6 Ω',
      tex: R`R_R = 4 + 2 = 6\ \Omega`,
    },
    {
      els: [
        { id: 'iL', at: 'shunt', kind: 'isrc', amp: 4, dir: 'down' },
        { id: 'r3p', at: 'shunt', kind: 'r', ohm: 3 },
        { id: 'r8', at: 'shunt', kind: 'r', ohm: 8, target: true, tag: 'v_o' },
        { id: 'r6p', at: 'shunt', kind: 'r', ohm: 6 },
        { id: 'iR2', at: 'shunt', kind: 'isrc', amp: 2, dir: 'up' },
      ],
      fresh: ['iL', 'r3p', 'r6p', 'iR2'],
      next: ['iL', 'r3p', 'r6p', 'iR2'],
      caption: '第 3 步：左右全转电流源（4 A↓ ∥ 3 Ω 与 2 A↑ ∥ 6 Ω）',
      tex: R`i_{sL} = \tfrac{12}{3} = 4\text{ A}\downarrow, \quad i_{sR}' = \tfrac{12}{6} = 2\text{ A}\uparrow`,
    },
    {
      els: [
        { id: 'iN', at: 'shunt', kind: 'isrc', amp: 2, dir: 'down' },
        { id: 'r2p', at: 'shunt', kind: 'r', ohm: 2 },
        { id: 'r8', at: 'shunt', kind: 'r', ohm: 8, target: true, tag: 'v_o' },
      ],
      fresh: ['iN', 'r2p'],
      next: [],
      caption: '第 4 步：合并电流源 4↓ − 2↑ = 2 A↓，电阻 3 ∥ 6 = 2 Ω',
      tex: R`i_{\text{net}} = 4 - 2 = 2\text{ A}\downarrow, \quad R_{\text{eq}} = 3 \parallel 6 = 2\ \Omega`,
    },
  ],
  // act 5 · the guided example: find i_o down through 12 Ω
  guided: [
    {
      els: [
        { id: 'i6', at: 'shunt', kind: 'isrc', amp: 6, dir: 'up' },
        { id: 'r4a', at: 'shunt', kind: 'r', ohm: 4 },
        { id: 'r4b', at: 'series', kind: 'r', ohm: 4 },
        { id: 'i1', at: 'shunt', kind: 'isrc', amp: 1, dir: 'down' },
        { id: 'r8', at: 'shunt', kind: 'r', ohm: 8 },
        { id: 'r12', at: 'shunt', kind: 'r', ohm: 12, target: true, tag: 'i_o' },
      ],
      fresh: [],
      next: ['i6', 'r4a'],
      caption: '阶段 0：原题（锁定红框 12 Ω）',
    },
    {
      els: [
        { id: 'v24', at: 'shunt', kind: 'vsrc', volt: 24, plus: 'up' },
        { id: 'r4s', at: 'series', kind: 'r', ohm: 4 },
        { id: 'r4b', at: 'series', kind: 'r', ohm: 4 },
        { id: 'i1', at: 'shunt', kind: 'isrc', amp: 1, dir: 'down' },
        { id: 'r8', at: 'shunt', kind: 'r', ohm: 8 },
        { id: 'r12', at: 'shunt', kind: 'r', ohm: 12, target: true, tag: 'i_o' },
      ],
      fresh: ['v24', 'r4s'],
      next: ['r4s', 'r4b'],
      caption: '第 1 步：6 A↑ ∥ 4 Ω → 24 V（+上）串 4 Ω',
      tex: R`v_{s1} = 6 \times 4 = 24\,\text{V}`,
    },
    {
      els: [
        { id: 'v24', at: 'shunt', kind: 'vsrc', volt: 24, plus: 'up' },
        { id: 'r8s', at: 'series', kind: 'r', ohm: 8 },
        { id: 'i1', at: 'shunt', kind: 'isrc', amp: 1, dir: 'down' },
        { id: 'r8', at: 'shunt', kind: 'r', ohm: 8 },
        { id: 'r12', at: 'shunt', kind: 'r', ohm: 12, target: true, tag: 'i_o' },
      ],
      fresh: ['r8s'],
      next: ['v24', 'r8s'],
      caption: '第 2 步：串联合并 4 + 4 = 8 Ω',
      tex: R`R_{\text{eq1}} = 4 + 4 = 8\,\Omega`,
    },
    {
      els: [
        { id: 'i3', at: 'shunt', kind: 'isrc', amp: 3, dir: 'up' },
        { id: 'r8p', at: 'shunt', kind: 'r', ohm: 8 },
        { id: 'i1', at: 'shunt', kind: 'isrc', amp: 1, dir: 'down' },
        { id: 'r8', at: 'shunt', kind: 'r', ohm: 8 },
        { id: 'r12', at: 'shunt', kind: 'r', ohm: 12, target: true, tag: 'i_o' },
      ],
      fresh: ['i3', 'r8p'],
      next: ['i3', 'r8p', 'i1', 'r8'],
      caption: '第 3 步：24 V 串 8 Ω → 3 A↑ ∥ 8 Ω',
      tex: R`i_{s2} = \tfrac{24}{8} = 3\,\text{A}\uparrow`,
    },
    {
      els: [
        { id: 'i2', at: 'shunt', kind: 'isrc', amp: 2, dir: 'up' },
        { id: 'r4p', at: 'shunt', kind: 'r', ohm: 4 },
        { id: 'r12', at: 'shunt', kind: 'r', ohm: 12, target: true, tag: 'i_o' },
      ],
      fresh: ['i2', 'r4p'],
      next: ['i2', 'r4p', 'r12'],
      caption: '第 4 步：3 − 1 = 2 A↑，8 ∥ 8 = 4 Ω（12 Ω 不动）',
      tex: R`i_{\text{net}} = 3 - 1 = 2\,\text{A}\uparrow, \quad R_p = 8 \parallel 8 = 4\,\Omega`,
    },
  ],
};

/**
 * Top-rail voltage at the target branch, from a nodal solution of a ladder (bottom rail = 0 V).
 * Works for every stage, so the tests can check that each step leaves the target unchanged.
 */
export function solveLadder(els: LadderEl[]): { node: number[]; target: { v: number; i: number } } {
  // nodes: one per run of shunts not separated by a series element
  const shuntNode: number[] = [];
  let n = 0;
  let pendingSeries: number[] = [];
  const series: { a: number; b: number; ohm: number }[] = [];
  let started = false;
  for (const e of els) {
    if (e.at === 'series') {
      pendingSeries.push(e.ohm);
      continue;
    }
    if (!started) started = true;
    else if (pendingSeries.length) {
      // a chain of series resistors between node n and node n+1: one resistor of their sum
      series.push({ a: n, b: n + 1, ohm: pendingSeries.reduce((s, x) => s + x, 0) });
      n += 1;
      pendingSeries = [];
    }
    shuntNode.push(n);
  }
  const N = n + 1;
  // a voltage source shunt fixes its node: V = ±volt. Unknown nodes solved by Gauss elimination.
  const fixed = new Map<number, number>();
  els.forEach((e) => {
    if (e.at === 'shunt' && e.kind === 'vsrc') fixed.set(shuntNode[shunts(els).indexOf(e)], e.plus === 'up' ? e.volt : -e.volt);
  });
  const G: number[][] = Array.from({ length: N }, () => Array(N + 1).fill(0));
  shunts(els).forEach((e, k) => {
    const a = shuntNode[k];
    if (e.kind === 'r') G[a][a] += 1 / e.ohm;
    if (e.kind === 'isrc') G[a][N] += e.dir === 'up' ? e.amp : -e.amp;
  });
  series.forEach(({ a, b, ohm }) => {
    G[a][a] += 1 / ohm;
    G[b][b] += 1 / ohm;
    G[a][b] -= 1 / ohm;
    G[b][a] -= 1 / ohm;
  });
  fixed.forEach((v, a) => {
    G[a].fill(0);
    G[a][a] = 1;
    G[a][N] = v;
  });
  for (let c = 0; c < N; c++) {
    let p = c;
    for (let r = c + 1; r < N; r++) if (Math.abs(G[r][c]) > Math.abs(G[p][c])) p = r;
    [G[c], G[p]] = [G[p], G[c]];
    for (let r = 0; r < N; r++) {
      if (r === c) continue;
      const f = G[r][c] / G[c][c];
      for (let k = c; k <= N; k++) G[r][k] -= f * G[c][k];
    }
  }
  const node = G.map((row, r) => row[N] / row[r]);
  const ti = shunts(els).findIndex((e) => e.kind === 'r' && e.target);
  const t = shunts(els)[ti] as Extract<LadderEl, { kind: 'r' }>;
  const v = node[shuntNode[ti]];
  return { node, target: { v, i: v / t.ohm } };
}

function shunts(els: LadderEl[]) {
  return els.filter((e) => e.at === 'shunt');
}

/** "3.2", "0.5", "-3.2": a short number for the stage */
export function fmt(x: number, digits = 2): string {
  const r = Math.round(x * 10 ** digits) / 10 ** digits;
  return Object.is(r, -0) ? '0' : String(r);
}
