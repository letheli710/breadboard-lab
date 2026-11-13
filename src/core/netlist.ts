// Layout (parts in holes) -> Circuit (components + nets).

import { HOLE_MAP, HOLES } from './breadboard';
import { isMcu } from './mcu';
import { PARTS, groundSource, groundTerminal, isPower } from './parts';
import type { CComponent, CNet, Circuit, Layout } from './types';
import { pinId } from './types';

class DSU {
  parent = new Map<string, string>();
  find(x: string): string {
    let p = this.parent.get(x);
    if (p === undefined) {
      this.parent.set(x, x);
      return x;
    }
    if (p === x) return x;
    p = this.find(p);
    this.parent.set(x, p);
    return p;
  }
  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

/** Prefix of the internal name given to a net with only one pin on it (nothing else connected). */
export const FLOATING = 'NC:';
export const isFloating = (net: string | null | undefined) => !net || net.startsWith(FLOATING);

export interface BoardNetlist {
  circuit: Circuit;
  /** net name -> every hole electrically on that net (whole strips) */
  netHoles: Map<string, string[]>;
  /** hole -> net name (only holes on a net that has at least one terminal) */
  holeNet: Map<string, string>;
  /** "REF.pin" -> net name */
  pinNet: Map<string, string>;
  /** "REF.pin" -> holes its physical legs sit in */
  pinHoles: Map<string, string[]>;
  /** refs that have at least one leg not plugged in */
  unplaced: string[];
}

export function buildNetlist(layout: Layout): BoardNetlist {
  const dsu = new DSU();
  const hk = (h: string) => `h:${h}`;

  // 1) metal strips inside the breadboard
  const firstOfStrip = new Map<string, string>();
  for (const h of HOLES) {
    const f = firstOfStrip.get(h.strip);
    if (f) dsu.union(hk(h.id), hk(f));
    else firstOfStrip.set(h.strip, h.id);
  }

  // 2) wires and internal connections inside parts
  for (const p of layout.parts) {
    const def = PARTS[p.type];
    for (const [a, b] of def.internal) {
      const ha = p.pins[a];
      const hb = p.pins[b];
      if (ha && hb && HOLE_MAP.has(ha) && HOLE_MAP.has(hb)) dsu.union(hk(ha), hk(hb));
    }
  }

  // 3) terminals
  const components: CComponent[] = [];
  const termRoot = new Map<string, string>();
  const pinHoles = new Map<string, string[]>();
  const unplaced: string[] = [];
  for (const p of layout.parts) {
    if (p.type === 'wire') continue;
    const def = PARTS[p.type];
    components.push({ ref: p.ref, type: p.type, props: { ...p.props } });
    let missing = false;
    for (const t of def.terminals) {
      const legs = Object.entries(def.terminalOf)
        .filter(([, term]) => term === t)
        .map(([leg]) => leg);
      const holes = legs.map((l) => p.pins[l]).filter((h): h is string => !!h && HOLE_MAP.has(h));
      const id = pinId(p.ref, t);
      pinHoles.set(id, holes);
      if (holes.length === 0) {
        missing = true;
        termRoot.set(id, `u:${id}`);
      } else {
        termRoot.set(id, dsu.find(hk(holes[0])));
      }
    }
    if (missing || Object.keys(def.terminalOf).some((l) => !p.pins[l])) unplaced.push(p.ref);
  }

  // 4) group terminals by root and name the nets
  const byRoot = new Map<string, string[]>();
  for (const [pin, root] of termRoot) {
    if (!byRoot.has(root)) byRoot.set(root, []);
    byRoot.get(root)!.push(pin);
  }

  const rootName = new Map<string, string>();
  const placed = components.filter((c) => !unplaced.includes(c.ref));
  const primary = groundSource(placed);
  let vIdx = 1;
  for (const c of placed) {
    if (!isPower(c.type) && c !== primary) continue;
    if (isMcu(c.type)) {
      // a USB-powered dev board is the ground reference: its GND pin is GND
      const rg = termRoot.get(pinId(c.ref, groundTerminal(c)))!;
      if (!rootName.has(rg)) rootName.set(rg, 'GND');
      continue;
    }
    const rp = termRoot.get(pinId(c.ref, '+'))!;
    const rn = termRoot.get(pinId(c.ref, '-'))!;
    if (c === primary) {
      if (!rootName.has(rn)) rootName.set(rn, 'GND');
      if (!rootName.has(rp) && c.type !== 'function_gen') rootName.set(rp, 'VCC');
    } else {
      if (!rootName.has(rp)) rootName.set(rp, `V${++vIdx}+`);
      if (!rootName.has(rn)) rootName.set(rn, `V${vIdx}−`);
    }
  }
  // dev boards: their 3V3 / 5V pins name the rails ("3V3", "5V"; a second board gets "U2.3V3")
  let mIdx = 0;
  for (const c of placed) {
    if (!isMcu(c.type)) continue;
    mIdx++;
    for (const pin of ['3V3', '5V', 'GND']) {
      const r = termRoot.get(pinId(c.ref, pin));
      if (!r || rootName.has(r) || r.startsWith('u:')) continue;
      // never reuse a name another root already has (e.g. a separate battery's − is "GND"):
      // equal names would merge two nets that are not connected
      const used = new Set(rootName.values());
      const name = mIdx === 1 && !used.has(pin) ? pin : `${c.ref}.${pin}`;
      rootName.set(r, used.has(name) ? `${c.ref}.${pin}#${r}` : name);
    }
  }
  // function generators: the signal net is VIN (VIN2, ...); a black clip not on GND gets its own name
  let gIdx = 0;
  for (const c of placed) {
    if (c.type !== 'function_gen') continue;
    gIdx++;
    const rp = termRoot.get(pinId(c.ref, '+'))!;
    const rn = termRoot.get(pinId(c.ref, '-'))!;
    if (!rootName.has(rp)) rootName.set(rp, gIdx === 1 ? 'VIN' : `VIN${gIdx}`);
    if (!rootName.has(rn)) rootName.set(rn, `${c.ref}−`);
  }

  // order remaining nets left-to-right by their leftmost hole, for stable names
  const holesOfRoot = new Map<string, string[]>();
  for (const h of HOLES) {
    const r = dsu.find(hk(h.id));
    if (!byRoot.has(r)) continue;
    if (!holesOfRoot.has(r)) holesOfRoot.set(r, []);
    holesOfRoot.get(r)!.push(h.id);
  }
  const rest = [...byRoot.keys()].filter((r) => !rootName.has(r)).sort((a, b) => minCol(holesOfRoot.get(a)) - minCol(holesOfRoot.get(b)) || a.localeCompare(b));
  let n = 1;
  for (const r of rest) rootName.set(r, r.startsWith('u:') ? `${FLOATING}${r.slice(2)}` : `N${n++}`);

  const nets: CNet[] = [];
  const netHoles = new Map<string, string[]>();
  const holeNet = new Map<string, string>();
  const pinNet = new Map<string, string>();
  for (const [root, pins] of byRoot) {
    const name = rootName.get(root)!;
    nets.push({ name, pins });
    const holes = holesOfRoot.get(root) ?? [];
    netHoles.set(name, holes);
    for (const h of holes) holeNet.set(h, name);
    for (const p of pins) pinNet.set(p, name);
  }
  nets.sort((a, b) => netOrder(a.name) - netOrder(b.name) || a.name.localeCompare(b.name, 'en', { numeric: true }));

  return { circuit: { components, nets }, netHoles, holeNet, pinNet, pinHoles, unplaced };
}

function minCol(holes?: string[]) {
  if (!holes || holes.length === 0) return 999;
  return Math.min(...holes.map((h) => HOLE_MAP.get(h)!.col));
}

function netOrder(n: string) {
  if (n === 'VCC') return 0;
  if (n === 'GND') return 2;
  return 1;
}

/** Holes connected to a given hole through strips + wires (for hover highlighting). */
export function connectedHoles(layout: Layout, hole: string): string[] {
  const dsu = new DSU();
  const firstOfStrip = new Map<string, string>();
  for (const h of HOLES) {
    const f = firstOfStrip.get(h.strip);
    if (f) dsu.union(h.id, f);
    else firstOfStrip.set(h.strip, h.id);
  }
  for (const p of layout.parts) {
    for (const [a, b] of PARTS[p.type].internal) {
      if (p.pins[a] && p.pins[b]) dsu.union(p.pins[a], p.pins[b]);
    }
  }
  const r = dsu.find(hole);
  return HOLES.filter((h) => dsu.find(h.id) === r).map((h) => h.id);
}
