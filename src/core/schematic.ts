// Automatic schematic layout from a Circuit.
// Nets become horizontal "bus" lines ordered top→bottom by voltage (so current flows
// downhill on the page, and GND is always the bottom line). Components hang vertically
// between the buses of the nets they connect.

import { isPower } from './parts';
import type { SimResult } from './solver';
import type { CComponent, Circuit } from './types';
import { pinId } from './types';

export interface SBus {
  net: string;
  y: number;
  x1: number;
  x2: number;
  voltage?: number;
  isGround: boolean;
  isSupply: boolean;
  attachX: number[];
}

export interface SLead {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  net: string;
}

export interface SElement {
  ref: string;
  comp: CComponent;
  /** symbol centre */
  x: number;
  y: number;
  /** rotation of the symbol: 0 = first terminal at top, 180 = first terminal at bottom, 90 = horizontal */
  rot: 0 | 180 | 90;
  leads: SLead[];
  /** for 3-terminal parts */
  extra?: Record<string, number>;
}

export interface SchematicLayout {
  width: number;
  height: number;
  buses: SBus[];
  elements: SElement[];
}

const COL_W = 96;
const ROW_H = 92;
const LEFT = 110;
const TOP = 40;
const SYM = 22; // half-length of a symbol

export function layoutSchematic(circuit: Circuit, sim?: SimResult | null): SchematicLayout {
  const netOf = new Map<string, string>();
  circuit.nets.forEach((n) => n.pins.forEach((p) => netOf.set(p, n.name)));
  const net = (ref: string, pin: string) => netOf.get(pinId(ref, pin)) ?? `?${ref}.${pin}`;

  // ---- order nets ----
  const allNets = circuit.nets.map((n) => n.name);
  const src = circuit.components.find((c) => isPower(c.type));
  const gnd = src ? net(src.ref, '-') : sim?.ground ?? null;
  const vcc = src ? net(src.ref, '+') : null;

  // BFS distance from the supply net through components (tie-breaker for equal voltages)
  const adj = new Map<string, Set<string>>();
  for (const c of circuit.components) {
    if (isPower(c.type)) continue;
    const ns = circuit.nets.filter((n) => n.pins.some((p) => p.startsWith(c.ref + '.'))).map((n) => n.name);
    for (const a of ns) for (const b of ns) if (a !== b) (adj.get(a) ?? adj.set(a, new Set()).get(a)!).add(b);
  }
  const dist = new Map<string, number>();
  const queue: string[] = [];
  if (vcc) {
    dist.set(vcc, 0);
    queue.push(vcc);
  }
  while (queue.length) {
    const n = queue.shift()!;
    for (const m of adj.get(n) ?? []) if (!dist.has(m)) dist.set(m, dist.get(n)! + 1), queue.push(m);
  }

  const v = (n: string) => sim?.nodeV.get(n) ?? 0;
  const ordered = [...allNets].sort((a, b) => {
    if (a === gnd) return 1;
    if (b === gnd) return -1;
    const dv = sim ? v(b) - v(a) : 0;
    if (Math.abs(dv) > 1e-3) return dv;
    return (dist.get(a) ?? 99) - (dist.get(b) ?? 99) || a.localeCompare(b, 'en', { numeric: true });
  });
  const level = new Map<string, number>();
  ordered.forEach((n, i) => level.set(n, i));
  const Y = (n: string) => TOP + (level.get(n) ?? 0) * ROW_H;

  // ---- order components into columns ----
  const terms = (c: CComponent) => circuit.nets.filter((n) => n.pins.some((p) => p.startsWith(c.ref + '.'))).map((n) => level.get(n.name)!);
  const comps = [...circuit.components].sort((a, b) => {
    const pa = isPower(a.type) ? 0 : 1;
    const pb = isPower(b.type) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    const ta = terms(a);
    const tb = terms(b);
    return Math.min(...ta) - Math.min(...tb) || Math.max(...ta) - Math.max(...tb) || a.ref.localeCompare(b.ref, 'en', { numeric: true });
  });

  const elements: SElement[] = [];
  const attach = new Map<string, number[]>();
  const addAttach = (n: string, x: number) => (attach.get(n) ?? attach.set(n, []).get(n)!).push(x);
  let x = LEFT;

  for (const c of comps) {
    if (c.type === 'potentiometer') {
      const n1 = net(c.ref, '1');
      const n2 = net(c.ref, '2');
      const n3 = net(c.ref, '3');
      const [top, bot, flip] = level.get(n1)! <= level.get(n3)! ? [n1, n3, false] : [n3, n1, true];
      const yt = Y(top);
      const yb = Y(bot) === yt ? yt + ROW_H * 0.8 : Y(bot);
      const cy = (yt + yb) / 2;
      const wx = x + 34;
      elements.push({
        ref: c.ref,
        comp: c,
        x,
        y: cy,
        rot: flip ? 180 : 0,
        leads: [
          { x1: x, y1: yt, x2: x, y2: cy - SYM, net: top },
          { x1: x, y1: cy + SYM, x2: x, y2: yb, net: bot },
          { x1: wx, y1: cy, x2: wx, y2: Y(n2), net: n2 },
        ],
        extra: { wx },
      });
      addAttach(top, x);
      addAttach(bot, x);
      addAttach(n2, wx);
      x += COL_W + 30;
      continue;
    }
    if (c.type === 'switch') {
      const nc = net(c.ref, 'com');
      const na = net(c.ref, 'a');
      const nb = net(c.ref, 'b');
      const yc = Y(nc);
      const ya = Y(na);
      const yb = Y(nb);
      let yab = (ya + yb) / 2;
      if (Math.abs(yab - yc) < ROW_H * 0.5) yab = yc - ROW_H;
      const up = yab < yc; // contacts above com
      const cy = (yc + yab) / 2;
      const s = up ? 1 : -1;
      const ax = x - 16;
      const bx = x + 16;
      elements.push({
        ref: c.ref,
        comp: c,
        x,
        y: cy,
        rot: up ? 0 : 180,
        leads: [
          { x1: x, y1: yc, x2: x, y2: cy + s * 14, net: nc },
          { x1: ax, y1: cy - s * 14, x2: ax, y2: ya, net: na },
          { x1: bx, y1: cy - s * 14, x2: bx, y2: yb, net: nb },
        ],
        extra: { ax, bx },
      });
      addAttach(nc, x);
      addAttach(na, ax);
      addAttach(nb, bx);
      x += COL_W;
      continue;
    }
    const [t1, t2] = c.type === 'led' || c.type === 'diode' ? ['anode', 'cathode'] : isPower(c.type) ? ['+', '-'] : c.type === 'pushbutton' ? ['1', '2'] : ['1', '2'];
    const n1 = net(c.ref, t1);
    const n2 = net(c.ref, t2);
    if (n1 === n2) {
      // shorted part: draw horizontally just above its bus
      const y = Y(n1) - 34;
      elements.push({
        ref: c.ref,
        comp: c,
        x: x + 20,
        y,
        rot: 90,
        leads: [
          { x1: x - 8, y1: Y(n1), x2: x - 8, y2: y, net: n1 },
          { x1: x - 8, y1: y, x2: x + 20 - SYM, y2: y, net: n1 },
          { x1: x + 20 + SYM, y1: y, x2: x + 48, y2: y, net: n1 },
          { x1: x + 48, y1: y, x2: x + 48, y2: Y(n1), net: n1 },
        ],
      });
      addAttach(n1, x - 8);
      addAttach(n1, x + 48);
      x += COL_W + 20;
      continue;
    }
    const firstTop = level.get(n1)! < level.get(n2)!;
    const [top, bot] = firstTop ? [n1, n2] : [n2, n1];
    const yt = Y(top);
    const yb = Y(bot);
    const cy = (yt + yb) / 2;
    elements.push({
      ref: c.ref,
      comp: c,
      x,
      y: cy,
      rot: firstTop ? 0 : 180,
      leads: [
        { x1: x, y1: yt, x2: x, y2: cy - SYM, net: top },
        { x1: x, y1: cy + SYM, x2: x, y2: yb, net: bot },
      ],
    });
    addAttach(top, x);
    addAttach(bot, x);
    x += COL_W;
  }

  const buses: SBus[] = ordered.map((n) => {
    const xs = attach.get(n) ?? [LEFT];
    const x1 = Math.min(...xs);
    const x2 = Math.max(...xs);
    return {
      net: n,
      y: Y(n),
      x1: x1 - 24,
      x2: x2 + (xs.length > 1 ? 0 : 0),
      voltage: sim ? v(n) : undefined,
      isGround: n === gnd,
      isSupply: n === vcc,
      attachX: xs,
    };
  });

  return {
    width: Math.max(x + 10, LEFT + 200),
    height: TOP + Math.max(ordered.length - 1, 1) * ROW_H + 60,
    buses,
    elements,
  };
}
