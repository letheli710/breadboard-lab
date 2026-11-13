// Test helper: build a Netlist directly (no geometry).
import type { Netlist, ProblemElement } from '../problem/types';

export interface Spec {
  ref: string;
  type: string;
  /** two-terminal [p, n]; OPAMP [minus, plus, out]; XFMR [p1, n1, p2, n2]; K [] */
  nodes?: string[];
  [k: string]: unknown;
}

const PINS: Record<string, string[]> = { OPAMP: ['minus', 'plus', 'out'], XFMR: ['p1', 'n1', 'p2', 'n2'], TL: ['p1', 'n1', 'p2', 'n2'], K: [] };

export function net(specs: Spec[], aliases?: Record<string, string>): Netlist {
  const nodeOf = new Map<string, string>();
  const nodes = new Set<string>(['0']);
  const elements: ProblemElement[] = [];
  for (const s of specs) {
    const { nodes: ns = [], ...rest } = s;
    const pins = PINS[s.type] ?? ['p', 'n'];
    pins.forEach((p, i) => {
      nodeOf.set(`${s.ref}.${p}`, ns[i]);
      nodes.add(ns[i]);
    });
    elements.push({ from: [0, 0], to: [0, 2], at: [0, 0], ...rest } as unknown as ProblemElement);
  }
  return { nodeOf, nodes: [...nodes], elements, aliases: aliases ? new Map(Object.entries(aliases)) : undefined };
}
