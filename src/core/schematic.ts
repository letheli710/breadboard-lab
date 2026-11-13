// Automatic schematic layout from a Circuit.
// Nets become horizontal "bus" lines ordered top→bottom by voltage (so current flows
// downhill on the page, and GND is always the bottom line). Components hang vertically
// between the buses of the nets they connect.

import { isMcu, mcuPin, pinConfig } from './mcu';
import { OPAMP_HALVES, groundSource, groundTerminal, isSource, supplyTerminal, terminalsOfComp } from './parts';
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
  /** multi-symbol parts: which piece this element draws (relay: 'coil' | 'contact') */
  sub?: string;
  /** boxes (dev board, regulator): outline in absolute coordinates */
  box?: { x: number; y: number; w: number; h: number; title: string };
  /** text drawn with the symbol (pin names, modes), absolute coordinates */
  labels?: { text: string; x: number; y: number; anchor: 'start' | 'middle' | 'end'; kind: 'pin' | 'mode' }[];
  /**
   * Op-amp halves only: which half this element draws ('A' or 'B'; ref stays e.g. "U1").
   * The triangle is centred on (x, y) pointing right: IN− at (x − 26, y − 10), IN+ at
   * (x − 26, y + 10), OUT at (x + 30, y). `extra.power` = 1 when this element also carries the
   * shared V+ (lead from (x, y − 14) up/down to its bus) and V− (from (x, y + 14)) leads.
   * Leads are L-shaped (several SLead segments per pin).
   */
  half?: 'A' | 'B';
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
  // a dev board has dozens of pins; only the wired ones are drawn, so nets made only of
  // unwired board pins get no bus
  const mcuRefs = new Set(circuit.components.filter((c) => isMcu(c.type)).map((c) => c.ref));
  const onlyBoard = (n: { pins: string[] }) => n.pins.length <= 1 && n.pins.every((p) => mcuRefs.has(p.slice(0, p.lastIndexOf('.'))));
  const allNets = circuit.nets.filter((n) => !onlyBoard(n)).map((n) => n.name);
  const src = groundSource(circuit.components);
  const gnd = src ? net(src.ref, groundTerminal(src)) : sim?.ground ?? null;
  const vcc = src ? net(src.ref, supplyTerminal(src)) : null;

  // BFS distance from the supply net through components (tie-breaker for equal voltages)
  const adj = new Map<string, Set<string>>();
  for (const c of circuit.components) {
    if (isSource(c.type)) continue;
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
  const terms = (c: CComponent) => {
    const ls = circuit.nets.filter((n) => level.has(n.name) && n.pins.some((p) => p.startsWith(c.ref + '.'))).map((n) => level.get(n.name)!);
    return ls.length ? ls : [0];
  };
  const prio = (t: CComponent['type']) => (isMcu(t) ? -1 : isSource(t) ? 0 : 1);
  const comps = [...circuit.components].sort((a, b) => {
    const pa = prio(a.type);
    const pb = prio(b.type);
    if (pa !== pb) return pa - pb;
    const ta = terms(a);
    const tb = terms(b);
    return Math.min(...ta) - Math.min(...tb) || Math.max(...ta) - Math.max(...tb) || a.ref.localeCompare(b.ref, 'en', { numeric: true });
  });

  const elements: SElement[] = [];
  const attach = new Map<string, number[]>();
  const addAttach = (n: string, x: number) => (attach.get(n) ?? attach.set(n, []).get(n)!).push(x);
  let x = LEFT;

  const netSize = new Map(circuit.nets.map((n) => [n.name, n.pins.length]));
  const hasNet = (ref: string, pin: string) => (netSize.get(netOf.get(pinId(ref, pin)) ?? '') ?? 0) > 1;
  for (const c of comps) {
    if (isMcu(c.type)) {
      // labelled box; one lead per wired pin, straight across to its bus
      const W = 104;
      const pins = terminalsOfComp(c, circuit).filter((t) => hasNet(c.ref, t) && level.has(net(c.ref, t)));
      const order = new Map(terminalsOfComp(c, circuit).map((t, i) => [t, i]));
      pins.sort((a, b) => level.get(net(c.ref, a))! - level.get(net(c.ref, b))! || order.get(a)! - order.get(b)!);
      const used = new Map<string, number>();
      const slots = pins.map((t) => {
        const n = net(c.ref, t);
        const k = used.get(n) ?? 0;
        used.set(n, k + 1);
        return { t, n, k, y: Y(n) - k * 18 };
      });
      const ys = slots.map((p) => p.y);
      const top = (ys.length ? Math.min(...ys) : TOP + 20) - 30;
      const bottom = (ys.length ? Math.max(...ys) : TOP + 40) + 18;
      const bx = x - 30;
      const leads: SLead[] = [];
      const labels: NonNullable<SElement['labels']> = [];
      for (const p of slots) {
        const ax = bx + W + 60 + p.k * 12;
        leads.push({ x1: bx + W, y1: p.y, x2: ax, y2: p.y, net: p.n });
        if (p.k > 0) leads.push({ x1: ax, y1: p.y, x2: ax, y2: Y(p.n), net: p.n });
        addAttach(p.n, ax);
        labels.push({ text: p.t, x: bx + W - 6, y: p.y + 4, anchor: 'end', kind: 'pin' });
        const def = mcuPin(c.type, p.t);
        if (def?.kind === 'gpio') {
          const cfg = pinConfig(c.props, p.t);
          const m: Record<string, string> = { out_high: 'OUT=1', out_low: 'OUT=0', input: 'IN', input_pullup: 'IN↑', input_pulldown: 'IN↓', pwm: `PWM ${cfg.duty}%`, adc: 'ADC' };
          labels.push({ text: m[cfg.mode], x: bx + 6, y: p.y + 4, anchor: 'start', kind: 'mode' });
        }
      }
      const title = c.type === 'esp32_devkit' ? 'ESP32' : c.type === 'stm32_bluepill' ? 'STM32' : 'MCU';
      elements.push({ ref: c.ref, comp: c, x: bx + W / 2, y: (top + bottom) / 2, rot: 0, leads, labels, box: { x: bx, y: top, w: W, h: bottom - top, title } });
      x += W + 60 + Math.max(0, ...slots.map((p) => p.k)) * 12 + 50;
      continue;
    }
    if (c.type === 'npn' || c.type === 'nmos') {
      // collector/drain up, emitter/source down, base/gate from the left
      const [tc, tb, te] = c.type === 'npn' ? ['c', 'b', 'e'] : ['d', 'g', 's'];
      const nc = net(c.ref, tc);
      const nb = net(c.ref, tb);
      const ne = net(c.ref, te);
      const cx = x + 40;
      const lc = level.get(nc) ?? 0;
      const le = level.get(ne) ?? 0;
      const flip = lc > le;
      const [top, bot] = flip ? [ne, nc] : [nc, ne];
      const yt = Y(top);
      const same = lc === le;
      const yb = same ? yt + ROW_H : Y(bot);
      const cy = (yt + yb) / 2;
      const gx = cx - 40;
      const leads: SLead[] = [
        { x1: cx, y1: yt, x2: cx, y2: cy - SYM, net: top },
        { x1: cx, y1: cy + SYM, x2: cx, y2: yb, net: bot },
        { x1: cx - SYM, y1: cy, x2: gx, y2: cy, net: nb },
      ];
      if (same) leads.push({ x1: cx, y1: yb, x2: cx + 30, y2: yb, net: bot }, { x1: cx + 30, y1: yb, x2: cx + 30, y2: yt, net: bot });
      if (level.has(nb)) leads.push({ x1: gx, y1: cy, x2: gx, y2: Y(nb), net: nb });
      addAttach(top, cx);
      if (same) addAttach(bot, cx + 30);
      else addAttach(bot, cx);
      if (level.has(nb)) addAttach(nb, gx);
      elements.push({ ref: c.ref, comp: c, x: cx, y: cy, rot: flip ? 180 : 0, leads });
      x += COL_W + 40;
      continue;
    }
    if (c.type === 'ldo') {
      const ni = net(c.ref, 'in');
      const no = net(c.ref, 'out');
      const ng = net(c.ref, 'gnd');
      const yi = Y(ni);
      const yo = Y(no);
      let cy = yi === yo ? yi + ROW_H / 2 : (yi + yo) / 2;
      if (Math.abs(cy - Y(ng)) < 24) cy = Y(ng) - ROW_H / 2;
      const cx = x + 40;
      const leads: SLead[] = [
        { x1: cx - 24, y1: cy - 4, x2: cx - 40, y2: cy - 4, net: ni },
        { x1: cx - 40, y1: cy - 4, x2: cx - 40, y2: yi, net: ni },
        { x1: cx + 24, y1: cy - 4, x2: cx + 40, y2: cy - 4, net: no },
        { x1: cx + 40, y1: cy - 4, x2: cx + 40, y2: yo, net: no },
        { x1: cx, y1: cy + 14, x2: cx, y2: Y(ng), net: ng },
      ];
      addAttach(ni, cx - 40);
      addAttach(no, cx + 40);
      addAttach(ng, cx);
      elements.push({
        ref: c.ref,
        comp: c,
        x: cx,
        y: cy,
        rot: 0,
        leads,
        box: { x: cx - 24, y: cy - 14, w: 48, h: 28, title: 'LDO' },
        labels: [
          { text: 'IN', x: cx - 21, y: cy - 1, anchor: 'start', kind: 'pin' },
          { text: 'OUT', x: cx + 21, y: cy - 1, anchor: 'end', kind: 'pin' },
          { text: 'GND', x: cx, y: cy + 11, anchor: 'middle', kind: 'pin' },
        ],
      });
      x += COL_W + 60;
      continue;
    }
    if (c.type === 'relay') {
      // coil: a two-terminal element; contacts: a changeover switch next to it
      const n1 = net(c.ref, 'coil1');
      const n2 = net(c.ref, 'coil2');
      const [top, bot] = (level.get(n1) ?? 0) <= (level.get(n2) ?? 0) ? [n1, n2] : [n2, n1];
      const yt = Y(top);
      const yb = top === bot ? yt + ROW_H : Y(bot);
      const ccy = (yt + yb) / 2;
      const leads: SLead[] = [
        { x1: x, y1: yt, x2: x, y2: ccy - SYM, net: top },
        { x1: x, y1: ccy + SYM, x2: x, y2: yb, net: bot },
      ];
      if (top === bot) leads.push({ x1: x, y1: yb, x2: x + 22, y2: yb, net: bot }, { x1: x + 22, y1: yb, x2: x + 22, y2: yt, net: bot });
      addAttach(top, x);
      addAttach(top === bot ? top : bot, top === bot ? x + 22 : x);
      elements.push({ ref: c.ref, comp: c, x, y: ccy, rot: 0, leads, sub: 'coil' });
      x += 56;
      const ncm = net(c.ref, 'com');
      const nnc = net(c.ref, 'nc');
      const nno = net(c.ref, 'no');
      const yc = Y(ncm);
      let yab = (Y(nnc) + Y(nno)) / 2;
      if (Math.abs(yab - yc) < ROW_H * 0.5) yab = yc - ROW_H;
      const up = yab < yc;
      const cy = (yc + yab) / 2;
      const sgn = up ? 1 : -1;
      const ax = x - 16;
      const bx = x + 16;
      elements.push({
        ref: c.ref,
        comp: c,
        x,
        y: cy,
        rot: up ? 0 : 180,
        sub: 'contact',
        leads: [
          { x1: x, y1: yc, x2: x, y2: cy + sgn * 14, net: ncm },
          { x1: ax, y1: cy - sgn * 14, x2: ax, y2: Y(nnc), net: nnc },
          { x1: bx, y1: cy - sgn * 14, x2: bx, y2: Y(nno), net: nno },
        ],
        extra: { ax, bx, on: sim?.relays.get(c.ref)?.energized ? 1 : 0, coilX: elements[elements.length - 1].x, coilY: ccy },
      });
      addAttach(ncm, x);
      addAttach(nnc, ax);
      addAttach(nno, bx);
      x += COL_W;
      continue;
    }
    if (c.type === 'opamp') {
      const halves = OPAMP_HALVES.filter((h) => hasNet(c.ref, h.out) || hasNet(c.ref, h.inp) || hasNet(c.ref, h.inn));
      let first = true;
      for (const h of halves) {
        const nOut = net(c.ref, h.out);
        const nInn = net(c.ref, h.inn);
        const nInp = net(c.ref, h.inp);
        const ys = [nOut, nInn, nInp].filter((n) => level.has(n)).map(Y);
        // between the buses it touches (never exactly on one), defaulting to the top
        const cy = ys.length ? (Math.min(...ys) + Math.max(...ys)) / 2 + (Math.min(...ys) === Math.max(...ys) ? -ROW_H / 2 : ROW_H / 4) : TOP + ROW_H / 2;
        const cx = x + 40;
        const leads: SLead[] = [];
        const pinLead = (px: number, py: number, bx: number, n: string) => {
          if (!level.has(n)) return;
          leads.push({ x1: px, y1: py, x2: bx, y2: py, net: n }, { x1: bx, y1: py, x2: bx, y2: Y(n), net: n });
          addAttach(n, bx);
        };
        pinLead(cx - 26, cy - 10, cx - 40, nInn);
        pinLead(cx - 26, cy + 10, cx - 52, nInp);
        pinLead(cx + 30, cy, cx + 44, nOut);
        const power = first && (hasNet(c.ref, 'v+') || hasNet(c.ref, 'v-'));
        if (power) {
          for (const [pin, dy] of [['v+', -14], ['v-', 14]] as const) {
            const n = net(c.ref, pin);
            if (!level.has(n)) continue;
            leads.push({ x1: cx, y1: cy + dy, x2: cx, y2: Y(n), net: n });
            addAttach(n, cx);
          }
        }
        elements.push({ ref: c.ref, comp: c, x: cx, y: cy, rot: 0, leads, half: h.half, extra: { power: power ? 1 : 0 } });
        first = false;
        x += COL_W + 40;
      }
      continue;
    }
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
    const [t1, t2] =
      c.type === 'led' || c.type === 'diode'
        ? ['anode', 'cathode']
        : isSource(c.type) || c.type === 'ammeter' || c.type === 'motor' || c.type === 'buzzer'
          ? ['+', '-']
          : c.type === 'scope_probe'
            ? ['tip', 'gnd']
            : ['1', '2'];
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
