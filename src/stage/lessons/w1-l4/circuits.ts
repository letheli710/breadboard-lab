// W1-L4's stage circuits: the messy schematic of layer 01 (the two-mesh circuit of act 3 drawn
// with extra corners, three T junctions and a wire loop) and the three presets of layer 02.

import type { NetEl, Pt, WireSeg } from './topo';

/** Node colours, one shade darker than the sheet's (#38bdf8 / #f59e0b / #10b981 / #a78bfa) so they
 *  read on the light stage. */
export const NODE_COLOR = {
  sky: '#0284c7',
  amber: '#d97706',
  emerald: '#059669',
  violet: '#7c3aed',
} as const;
export const RED = '#e11d48';
export const GREY = '#64748b';

/* ------------------------------------------------------------- layer 01 */

export type L1Node = 'A' | 'B' | 'C';

export interface L1Element {
  id: 'Vs' | 'R1' | 'R2' | 'R3';
  kind: 'V' | 'R';
  label: string;
  value: string;
  /** centre and orientation; terminal a is the top / left end (+ of the source) */
  x: number;
  y: number;
  dir: 'h' | 'v';
  a: L1Node;
  b: L1Node;
}

export const L1_ELEMENTS: L1Element[] = [
  { id: 'Vs', kind: 'V', label: 'Vs', value: '12 V', x: 50, y: 140, dir: 'v', a: 'A', b: 'C' },
  { id: 'R1', kind: 'R', label: 'R1', value: '2 kΩ', x: 145, y: 50, dir: 'h', a: 'A', b: 'B' },
  { id: 'R2', kind: 'R', label: 'R2', value: '3 kΩ', x: 250, y: 135, dir: 'v', a: 'B', b: 'C' },
  { id: 'R3', kind: 'R', label: 'R3', value: '6 kΩ', x: 340, y: 135, dir: 'v', a: 'B', b: 'C' },
];

export const L1_HALF: Record<L1Element['id'], number> = { Vs: 30, R1: 25, R2: 25, R3: 25 };

export function l1Terminals(e: L1Element): [Pt, Pt] {
  const h = L1_HALF[e.id];
  return e.dir === 'h'
    ? [
        [e.x - h, e.y],
        [e.x + h, e.y],
      ]
    : [
        [e.x, e.y - h],
        [e.x, e.y + h],
      ];
}

/** Wire pieces with the node they belong to (the flood fill finds the same grouping; see the test). */
export const L1_WIRES: (WireSeg & { node: L1Node })[] = [
  // node A: Vs(+) up, two corners, over to R1's left end
  {
    id: 'a1',
    node: 'A',
    pts: [
      [50, 110],
      [50, 80],
      [85, 80],
      [85, 50],
      [120, 50],
    ],
  },
  // node B: three T junctions (210,50), (250,80), (290,50), the 90° corner at (210,80), a wire loop
  {
    id: 'b1',
    node: 'B',
    pts: [
      [170, 50],
      [210, 50],
    ],
  },
  {
    id: 'b2',
    node: 'B',
    pts: [
      [210, 50],
      [210, 80],
      [250, 80],
    ],
  },
  {
    id: 'b3',
    node: 'B',
    pts: [
      [250, 80],
      [250, 110],
    ],
  },
  {
    id: 'b4',
    node: 'B',
    pts: [
      [210, 50],
      [290, 50],
    ],
  },
  {
    id: 'b5',
    node: 'B',
    pts: [
      [250, 80],
      [290, 80],
      [290, 50],
    ],
  },
  {
    id: 'b6',
    node: 'B',
    pts: [
      [290, 50],
      [340, 50],
      [340, 110],
    ],
  },
  // node C: the bottom rail with one T junction
  {
    id: 'c1',
    node: 'C',
    pts: [
      [50, 170],
      [50, 210],
      [250, 210],
    ],
  },
  {
    id: 'c2',
    node: 'C',
    pts: [
      [250, 210],
      [250, 160],
    ],
  },
  {
    id: 'c3',
    node: 'C',
    pts: [
      [250, 210],
      [340, 210],
      [340, 160],
    ],
  },
];

/** the corner the lesson points at (hl_fake_corner) */
export const L1_FAKE_CORNER: Pt = [210, 80];

/** where each node's wire collapses to in the straightened (canonical) drawing */
export const L1_HUB: Record<L1Node, Pt> = { A: [82, 76], B: [258, 70], C: [215, 204] };

export const L1_NODE_INFO: Record<L1Node, { color: string; volts: string; branches: string[]; note: string }> = {
  A: { color: NODE_COLOR.sky, volts: '12 V', branches: ['Vs', 'R1'], note: '两个拐角也只是这一个点' },
  B: { color: NODE_COLOR.amber, volts: '6 V', branches: ['R1', 'R2', 'R3'], note: '3 个 T 字路口、拐角和一圈导线，全是同一个节点' },
  C: { color: NODE_COLOR.emerald, volts: '0 V（参考地）', branches: ['Vs', 'R2', 'R3'], note: '整条底轨是一个节点' },
};

/** spanning tree of the layer-01 circuit (act 3): twigs R1, R2; links Vs, R3 */
export const L1_TWIGS = ['R1', 'R2'];

/** breadboard columns 11–16 under the schematic: the upper strip of 12 / 14 / 16 carries a node */
export const BB_COLS = [11, 12, 13, 14, 15, 16];
export const BB_NODE_OF_COL: Record<number, L1Node> = { 12: 'A', 14: 'B', 16: 'C' };
/** leads plugged into the upper strips: [column, row, label] */
export const BB_LEADS: [number, string, string][] = [
  [12, 'a', 'Vs+'],
  [12, 'c', 'R1'],
  [14, 'a', 'R1'],
  [14, 'c', 'R2'],
  [14, 'e', 'R3'],
  [16, 'a', 'Vs−'],
  [16, 'c', 'R2'],
  [16, 'e', 'R3'],
];

/* ------------------------------------------------------------- layer 02 */

export type PresetId = 1 | 2 | 3;

export interface PNode {
  id: string;
  label: string;
  color: string;
  /** a point hub, or a rail from x1 to x2 at y */
  x: number;
  y: number;
  x2?: number;
}

export interface PEl extends NetEl {
  kind: 'V' | 'R';
  label: string;
  value: string;
  x: number;
  y: number;
  dir: 'h' | 'v';
  /** current through it (mA, preset 1) or voltage across it (V, preset 2), for the stage labels */
  note?: string;
}

export interface Preset {
  nodes: PNode[];
  els: PEl[];
}

export const PRESET_LABEL: Record<PresetId, string> = {
  1: '预设 1：真/假串联对照',
  2: '预设 2：真/假并联对照',
  3: '预设 3：Sadiku Ex 2.4',
};

/** Vs 24 V, R1 1.2 kΩ, R2 2 kΩ, Rtap 3 kΩ: without the tap 7.5 mA everywhere; with it 10 mA into N, 6 mA on
 *  through R2 and 4 mA down the tap (the numbers of act 4). */
function seriesPreset(tap: boolean): Preset {
  return {
    nodes: [
      { id: 'A', label: 'A', color: NODE_COLOR.sky, x: 50, y: 60 },
      { id: 'N', label: 'N', color: NODE_COLOR.amber, x: 205, y: 60 },
      { id: 'G', label: 'G', color: NODE_COLOR.emerald, x: 50, y: 210, x2: 320 },
    ],
    els: [
      { id: 'Vs', kind: 'V', label: 'Vs', value: '24 V', x: 50, y: 135, dir: 'v', a: 'A', b: 'G', note: tap ? 'I = 10 mA' : 'I = 7.5 mA' },
      { id: 'R1', kind: 'R', label: 'R1', value: '1.2 kΩ', x: 135, y: 60, dir: 'h', a: 'A', b: 'N', note: tap ? 'I1 = 10 mA' : 'I1 = 7.5 mA' },
      { id: 'R2', kind: 'R', label: 'R2', value: '2 kΩ', x: 290, y: 60, dir: 'h', a: 'N', b: 'G', note: tap ? 'I2 = 6 mA' : 'I2 = 7.5 mA' },
      ...(tap
        ? [{ id: 'Rtap', kind: 'R' as const, label: 'Rtap', value: '3 kΩ', x: 205, y: 140, dir: 'v' as const, a: 'N', b: 'G', role: 'tap' as const, note: 'Itap = 4 mA' }]
        : []),
    ],
  };
}

/** Vs 12 V, R3 6 kΩ, R4 3 kΩ, Rsneak 1 kΩ: the sneak drops 3 V, so V4 = 9 V while V3 = 12 V. */
function parallelPreset(sneak: boolean): Preset {
  return {
    nodes: [
      { id: 'A', label: 'A', color: NODE_COLOR.sky, x: 50, y: 60, x2: sneak ? 210 : 320 },
      ...(sneak ? [{ id: 'A2', label: 'A′', color: NODE_COLOR.violet, x: 270, y: 60, x2: 320 }] : []),
      { id: 'B', label: 'B', color: NODE_COLOR.emerald, x: 50, y: 210, x2: 320 },
    ],
    els: [
      { id: 'Vs', kind: 'V', label: 'Vs', value: '12 V', x: 50, y: 135, dir: 'v', a: 'A', b: 'B' },
      { id: 'R3', kind: 'R', label: 'R3', value: '6 kΩ', x: 160, y: 135, dir: 'v', a: 'A', b: 'B', note: 'V3 = 12 V' },
      { id: 'R4', kind: 'R', label: 'R4', value: '3 kΩ', x: 320, y: 135, dir: 'v', a: sneak ? 'A2' : 'A', b: 'B', note: sneak ? 'V4 = 9 V' : 'V4 = 12 V' },
      ...(sneak
        ? [{ id: 'Rsneak', kind: 'R' as const, label: 'Rsneak', value: '1 kΩ', x: 240, y: 60, dir: 'h' as const, a: 'A', b: 'A2', role: 'sneak' as const, note: '压降 3 V' }]
        : []),
    ],
  };
}

/** Sadiku Example 2.4 as adapted in the sheet: Vs 10 V, R3 6 Ω, R4 2 Ω (b–c), R1 5 Ω (b–a), R2 3 Ω (a–c). */
function ex24Preset(): Preset {
  return {
    nodes: [
      { id: 'b', label: 'b', color: NODE_COLOR.amber, x: 40, y: 60, x2: 255 },
      { id: 'a', label: 'a', color: NODE_COLOR.sky, x: 315, y: 60, x2: 345 },
      { id: 'c', label: 'c', color: NODE_COLOR.emerald, x: 40, y: 210, x2: 345 },
    ],
    els: [
      { id: 'Vs', kind: 'V', label: 'Vs', value: '10 V', x: 40, y: 135, dir: 'v', a: 'b', b: 'c' },
      { id: 'R3', kind: 'R', label: 'R3', value: '6 Ω', x: 130, y: 135, dir: 'v', a: 'b', b: 'c' },
      { id: 'R4', kind: 'R', label: 'R4', value: '2 Ω', x: 215, y: 135, dir: 'v', a: 'b', b: 'c' },
      { id: 'R1', kind: 'R', label: 'R1', value: '5 Ω', x: 285, y: 60, dir: 'h', a: 'b', b: 'a' },
      { id: 'R2', kind: 'R', label: 'R2', value: '3 Ω', x: 345, y: 135, dir: 'v', a: 'a', b: 'c' },
    ],
  };
}

export function preset(id: PresetId, sabotage: boolean): Preset {
  return id === 1 ? seriesPreset(sabotage) : id === 2 ? parallelPreset(sabotage) : ex24Preset();
}
