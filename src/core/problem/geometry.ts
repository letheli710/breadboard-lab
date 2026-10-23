// Geometry of a problem schematic: terminal positions and the netlist derived from the drawing.
//
// Connectivity rules (union-find over integer grid points):
// - Every wire polyline vertex / endpoint is a connection point; consecutive points of a wire
//   must be axis-aligned and are joined by the wire.
// - Any point (element terminal, wire vertex, label, ground, open terminal) that lies on a wire
//   segment (endpoints or interior) is connected to that wire, i.e. T-junctions connect.
// - Two wires that merely cross (no shared point) do NOT connect.
// - Element terminals at the same grid point are connected. A two-terminal element's body
//   occupies its segment but never connects to anything crossing it.
// - Ground symbols join node "0". Labels / open terminals give the node its name.

import { tr } from '../i18n';
import type { Netlist, Pt, ProblemElement, Schematic, TwoTerminalElement } from './types';

export const TWO_TERMINAL_TYPES = ['R', 'C', 'L', 'V', 'I', 'VCVS', 'VCCS', 'CCVS', 'CCCS', 'SW', 'Z', 'ammeter', 'voltmeter'] as const;

export function isTwoTerminal(el: ProblemElement): el is TwoTerminalElement {
  return (TWO_TERMINAL_TYPES as readonly string[]).includes(el.type);
}

const P = (p: Pt) => `(${p[0]},${p[1]})`;
const key = (p: Pt) => `${p[0]},${p[1]}`;
const eq = (a: Pt, b: Pt) => a[0] === b[0] && a[1] === b[1];

/** Terminal positions of an element in grid units. Pin names match PINS in types.ts. */
export function terminalPoints(el: ProblemElement): Record<string, Pt> {
  switch (el.type) {
    case 'OPAMP': {
      const [x, y] = el.at;
      const sx = el.orient === 'left' ? -1 : 1;
      const sy = el.flip ? -1 : 1;
      return {
        minus: [x - 2 * sx, y - sy],
        plus: [x - 2 * sx, y + sy],
        out: [x + 2 * sx, y],
      };
    }
    case 'XFMR': {
      const [x, y] = el.at;
      return { p1: [x - 2, y - 1], n1: [x - 2, y + 1], p2: [x + 2, y - 1], n2: [x + 2, y + 1] };
    }
    case 'K':
      return {};
    default:
      return { p: el.from, n: el.to };
  }
}

/** Is p on the closed axis-aligned segment a–b? */
export function onSegment(p: Pt, a: Pt, b: Pt): boolean {
  if (a[0] === b[0]) return p[0] === a[0] && p[1] >= Math.min(a[1], b[1]) && p[1] <= Math.max(a[1], b[1]);
  if (a[1] === b[1]) return p[1] === a[1] && p[0] >= Math.min(a[0], b[0]) && p[0] <= Math.max(a[0], b[0]);
  return false;
}

/** Is p strictly inside the axis-aligned segment a–b (not at either end)? */
export function inSegmentInterior(p: Pt, a: Pt, b: Pt): boolean {
  return onSegment(p, a, b) && !eq(p, a) && !eq(p, b);
}

const isAxis = (a: Pt, b: Pt) => a[0] === b[0] || a[1] === b[1];
const validPt = (p: unknown): p is Pt =>
  Array.isArray(p) && p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]);
const intPt = (p: Pt) => Number.isInteger(p[0]) && Number.isInteger(p[1]);

/** Valid wire segments (axis-aligned, non-degenerate) of a schematic. */
export function wireSegments(s: Schematic): [Pt, Pt][] {
  const out: [Pt, Pt][] = [];
  for (const w of s.wires ?? []) {
    if (!Array.isArray(w)) continue;
    for (let i = 0; i + 1 < w.length; i++) {
      const a = w[i];
      const b = w[i + 1];
      if (!validPt(a) || !validPt(b) || eq(a, b) || !isAxis(a, b)) continue;
      out.push([a, b]);
    }
  }
  return out;
}

/** Grid points where ≥ 3 connections meet (drawn as junction dots). A connection is a wire
 *  segment ending at the point (a wire passing through the point counts twice), an element
 *  terminal, or a ground symbol. Uses the same on-segment rule as extractNetlist. */
export function junctionPoints(s: Schematic): Pt[] {
  const segs = wireSegments(s);
  const pts = new Map<string, Pt>();
  const extra = new Map<string, number>();
  const add = (p: Pt, n: number) => {
    if (!validPt(p)) return;
    pts.set(key(p), p);
    extra.set(key(p), (extra.get(key(p)) ?? 0) + n);
  };
  for (const [a, b] of segs) {
    add(a, 0);
    add(b, 0);
  }
  for (const el of s.elements ?? []) for (const p of Object.values(terminalPoints(el))) add(p, 1);
  for (const g of s.grounds ?? []) add(g, 1);
  const out: Pt[] = [];
  for (const [k, p] of pts) {
    let n = extra.get(k) ?? 0;
    for (const [a, b] of segs) {
      if (eq(p, a) || eq(p, b)) n += 1;
      else if (onSegment(p, a, b)) n += 2;
    }
    if (n >= 3) out.push(p);
  }
  return out;
}

class UF {
  parent = new Map<string, string>();
  find(k: string): string {
    let r = this.parent.get(k);
    if (r === undefined) {
      this.parent.set(k, k);
      return k;
    }
    if (r === k) return k;
    r = this.find(r);
    this.parent.set(k, r);
    return r;
  }
  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

const RESERVED = /^(0|gnd)$/i;

export interface ExtractResult {
  netlist: Netlist;
  /** names given to the ground node (e.g. a grounded port terminal "b") → "0". Also attached
   *  to the returned netlist object as `aliases` (not yet part of the Netlist contract). */
  aliases: Map<string, string>;
  errors: string[];
  warnings: string[];
}

export function extractNetlist(s: Schematic): ExtractResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const elements: ProblemElement[] = Array.isArray(s?.elements) ? s.elements : [];
  const wires: Pt[][] = Array.isArray(s?.wires) ? s.wires : [];
  const labels = s?.labels ?? [];
  const grounds = s?.grounds ?? [];
  const terminals = s?.terminals ?? [];

  // ---------- elements ----------
  const byRef = new Map<string, ProblemElement>();
  const geomOk = new Set<ProblemElement>();
  for (const el of elements) {
    const ref = typeof el?.ref === 'string' ? el.ref.trim() : '';
    if (!ref) {
      errors.push(tr(`有一个 ${el?.type ?? '?'} 元件没有编号 (ref)`, `A ${el?.type ?? '?'} element has no ref`));
      continue;
    }
    if (byRef.has(ref)) errors.push(tr(`元件编号 ${ref} 重复`, `Duplicate element ref ${ref}`));
    else byRef.set(ref, el);
    if (el.type === 'OPAMP' || el.type === 'XFMR') {
      if (!validPt(el.at) || !intPt(el.at)) errors.push(tr(`${ref} 的位置 at 必须是整数坐标`, `${ref}: "at" must be an integer grid point`));
      else geomOk.add(el);
      if (el.type === 'XFMR' && !(typeof el.n === 'number' && Number.isFinite(el.n) && el.n !== 0))
        errors.push(tr(`变压器 ${ref} 的变比 n 无效`, `Transformer ${ref} has an invalid ratio n`));
      continue;
    }
    if (el.type === 'K') continue;
    if (!isTwoTerminal(el)) {
      errors.push(tr(`${ref} 的类型 "${(el as { type: string }).type}" 不认识`, `${ref} has unknown type "${(el as { type: string }).type}"`));
      continue;
    }
    if (!validPt(el.from) || !validPt(el.to) || !intPt(el.from) || !intPt(el.to)) {
      errors.push(tr(`${ref} 的 from/to 必须是整数坐标`, `${ref}: from/to must be integer grid points`));
      continue;
    }
    if (!isAxis(el.from, el.to) || eq(el.from, el.to)) {
      errors.push(tr(`${ref} 必须水平或竖直放置：${P(el.from)}→${P(el.to)}`, `${ref} must be horizontal or vertical: ${P(el.from)}→${P(el.to)}`));
      continue;
    }
    const len = Math.abs(el.to[0] - el.from[0]) + Math.abs(el.to[1] - el.from[1]);
    if (len < 2) {
      errors.push(tr(`${ref} 太短（长度 ${len}，至少 2）：${P(el.from)}→${P(el.to)}`, `${ref} is too short (length ${len}, minimum 2): ${P(el.from)}→${P(el.to)}`));
      continue;
    }
    geomOk.add(el);
  }

  // ---------- wires ----------
  const segs: [Pt, Pt][] = [];
  const wirePts: Pt[] = [];
  wires.forEach((w, wi) => {
    if (!Array.isArray(w) || w.length < 2) {
      errors.push(tr(`第 ${wi + 1} 条导线至少需要两个点`, `Wire #${wi + 1} needs at least two points`));
      return;
    }
    for (const p of w) {
      if (!validPt(p) || !intPt(p)) {
        errors.push(tr(`第 ${wi + 1} 条导线有无效的点 ${JSON.stringify(p)}`, `Wire #${wi + 1} has an invalid point ${JSON.stringify(p)}`));
        return;
      }
    }
    for (const p of w) wirePts.push(p);
    for (let i = 0; i + 1 < w.length; i++) {
      const a = w[i];
      const b = w[i + 1];
      if (eq(a, b)) continue;
      if (!isAxis(a, b)) {
        errors.push(tr(`导线 ${P(a)}→${P(b)} 是斜线，导线只能水平或竖直`, `Wire ${P(a)}→${P(b)} is diagonal; wires must be horizontal or vertical`));
        continue;
      }
      segs.push([a, b]);
    }
  });

  // ---------- connection points ----------
  const uf = new UF();
  const pinPts: { ref: string; pin: string; at: Pt }[] = [];
  for (const el of elements) {
    if (!geomOk.has(el)) continue;
    for (const [pin, at] of Object.entries(terminalPoints(el))) pinPts.push({ ref: el.ref, pin, at });
  }
  const anchorKeys = new Set<string>([...wirePts.map(key), ...pinPts.map((p) => key(p.at))]);
  const isAnchored = (p: Pt) => anchorKeys.has(key(p)) || segs.some(([a, b]) => onSegment(p, a, b));

  const allPts: Pt[] = [...wirePts, ...pinPts.map((p) => p.at)];
  for (const l of labels) if (validPt(l?.at)) allPts.push(l.at);
  for (const t of terminals) if (validPt(t?.at)) allPts.push(t.at);
  for (const g of grounds) if (validPt(g)) allPts.push(g);
  for (const p of allPts) uf.find(key(p));
  for (const [a, b] of segs) uf.union(key(a), key(b));
  for (const p of allPts)
    for (const [a, b] of segs)
      if (onSegment(p, a, b)) uf.union(key(p), key(a));

  // annotations must sit on something
  for (const l of labels) {
    if (!validPt(l?.at)) {
      errors.push(tr(`标签 ${l?.name ?? '?'} 的位置无效`, `Label ${l?.name ?? '?'} has an invalid position`));
      continue;
    }
    if (!isAnchored(l.at)) errors.push(tr(`标签 ${l.name} 在 ${P(l.at)}，那里没有导线或元件端点`, `Label ${l.name} at ${P(l.at)} is not on a wire or element terminal`));
  }
  for (const t of terminals) {
    if (!validPt(t?.at)) {
      errors.push(tr(`端子 ${t?.name ?? '?'} 的位置无效`, `Terminal ${t?.name ?? '?'} has an invalid position`));
      continue;
    }
    if (!isAnchored(t.at)) errors.push(tr(`端子 ${t.name} 在 ${P(t.at)}，那里没有导线或元件端点`, `Terminal ${t.name} at ${P(t.at)} is not on a wire or element terminal`));
  }
  for (const g of grounds) {
    if (!validPt(g)) {
      errors.push(tr(`接地点的位置无效：${JSON.stringify(g)}`, `Invalid ground position: ${JSON.stringify(g)}`));
      continue;
    }
    if (!isAnchored(g)) errors.push(tr(`接地符号在 ${P(g)}，那里没有导线或元件端点`, `Ground at ${P(g)} is not on a wire or element terminal`));
  }
  if (grounds.length === 0) errors.push(tr('电路图里没有接地符号（grounds），请放一个作为参考点', 'No ground symbol: add one to "grounds" as the reference node'));

  // element bodies: things lying strictly inside them are likely mistakes
  for (const el of elements) {
    if (!geomOk.has(el) || !isTwoTerminal(el)) continue;
    const warned = new Set<string>();
    const inside = [...wirePts, ...pinPts.filter((q) => q.ref !== el.ref).map((q) => q.at)];
    for (const p of inside) {
      if (inSegmentInterior(p, el.from, el.to) && !warned.has(key(p))) {
        warned.add(key(p));
        warnings.push(tr(`${P(p)} 处的点落在 ${el.ref} 的元件体上，不会和 ${el.ref} 相连`, `Point ${P(p)} lies on the body of ${el.ref}; it does not connect to ${el.ref}`));
      }
    }
    for (const [a, b] of segs) {
      // collinear overlap of a wire with the element body
      const sameLine = el.from[0] === el.to[0] ? a[0] === b[0] && a[0] === el.from[0] : a[1] === b[1] && a[1] === el.from[1];
      if (!sameLine) continue;
      const ax = el.from[0] === el.to[0] ? 1 : 0;
      const lo = Math.max(Math.min(a[ax], b[ax]), Math.min(el.from[ax], el.to[ax]));
      const hi = Math.min(Math.max(a[ax], b[ax]), Math.max(el.from[ax], el.to[ax]));
      if (hi > lo) {
        warnings.push(tr(`导线 ${P(a)}→${P(b)} 与 ${el.ref} 重叠`, `Wire ${P(a)}→${P(b)} overlaps ${el.ref}`));
        break;
      }
    }
  }

  // ---------- node names ----------
  const rootNames = new Map<string, Set<string>>();
  const rootGround = new Set<string>();
  const rootTerminal = new Set<string>();
  const addName = (p: Pt, name: string) => {
    const r = uf.find(key(p));
    if (!rootNames.has(r)) rootNames.set(r, new Set());
    rootNames.get(r)!.add(name);
  };
  for (const g of grounds) if (validPt(g)) rootGround.add(uf.find(key(g)));
  const checkName = (name: unknown, at: Pt, what: string, whatEn: string): string | null => {
    if (typeof name !== 'string' || !name.trim()) {
      errors.push(tr(`${what} ${P(at)} 没有名字`, `${whatEn} at ${P(at)} has no name`));
      return null;
    }
    const n = name.trim();
    if (RESERVED.test(n)) {
      if (!rootGround.has(uf.find(key(at))))
        errors.push(tr(`名字 "${n}" 保留给接地结点，但 ${P(at)} 没有接地`, `Name "${n}" is reserved for ground, but ${P(at)} is not grounded`));
      return null;
    }
    if (/^_\d+$/.test(n)) {
      errors.push(tr(`名字 "${n}" 保留给自动编号的结点`, `Name "${n}" is reserved for auto-named nodes`));
      return null;
    }
    return n;
  };
  for (const l of labels) {
    if (!validPt(l?.at)) continue;
    const n = checkName(l.name, l.at, '标签', 'Label');
    if (n) addName(l.at, n);
  }
  for (const t of terminals) {
    if (!validPt(t?.at)) continue;
    rootTerminal.add(uf.find(key(t.at)));
    const n = checkName(t.name, t.at, '端子', 'Terminal');
    if (n) addName(t.at, n);
  }

  // component extents (for stable ordering) and pins per component
  const minPt = new Map<string, Pt>();
  for (const p of allPts) {
    const r = uf.find(key(p));
    const m = minPt.get(r);
    if (!m || p[0] < m[0] || (p[0] === m[0] && p[1] < m[1])) minPt.set(r, p);
  }
  const pinsOf = new Map<string, { ref: string; pin: string; at: Pt }[]>();
  for (const q of pinPts) {
    const r = uf.find(key(q.at));
    if (!pinsOf.has(r)) pinsOf.set(r, []);
    pinsOf.get(r)!.push(q);
  }

  const nameOfRoot = new Map<string, string>();
  const rootOfName = new Map<string, string>();
  for (const [r, names] of rootNames) {
    const list = [...names];
    if (rootGround.has(r)) {
      // e.g. terminal "b" of a port that is grounded: the name is an alias of "0"
      if (list.length > 1) errors.push(tr(`接地结点有多个名字：${list.join('、')}`, `The ground node has several names: ${list.join(', ')}`));
      continue;
    }
    if (list.length > 1) {
      errors.push(tr(`同一个结点有多个名字：${list.join('、')}`, `One node has several names: ${list.join(', ')}`));
    }
    const n = list.sort()[0];
    nameOfRoot.set(r, n);
  }
  for (const [r, names] of rootNames) {
    for (const n of names) {
      const prev = rootOfName.get(n);
      if (prev !== undefined && prev !== r) errors.push(tr(`名字 ${n} 被用在两个不同的结点上`, `Name ${n} is used for two different nodes`));
      else rootOfName.set(n, r);
    }
  }
  for (const r of rootGround) nameOfRoot.set(r, '0');
  const aliases = new Map<string, string>();
  for (const [n, r] of rootOfName) if (rootGround.has(r)) aliases.set(n, '0');

  const ordered = [...new Set([...pinsOf.keys(), ...nameOfRoot.keys()])]
    .filter((r) => !rootGround.has(r))
    .sort((a, b) => {
      const pa = minPt.get(a)!;
      const pb = minPt.get(b)!;
      return pa[0] - pb[0] || pa[1] - pb[1];
    });
  const nodes: string[] = rootGround.size ? ['0'] : [];
  let auto = 0;
  for (const r of ordered) {
    if (!pinsOf.has(r)) {
      const n = nameOfRoot.get(r)!;
      warnings.push(tr(`结点 ${n} 没有连接任何元件`, `Node ${n} is not connected to any element`));
      continue;
    }
    if (!nameOfRoot.has(r)) nameOfRoot.set(r, `_${++auto}`);
    nodes.push(nameOfRoot.get(r)!);
  }

  const nodeOf = new Map<string, string>();
  for (const q of pinPts) nodeOf.set(`${q.ref}.${q.pin}`, nameOfRoot.get(uf.find(key(q.at)))!);

  // dangling terminals / floating wires
  for (const q of pinPts) {
    const r = uf.find(key(q.at));
    if (pinsOf.get(r)!.length === 1 && !rootGround.has(r) && !rootTerminal.has(r))
      warnings.push(tr(`${q.ref} 的 ${q.pin} 端 ${P(q.at)} 没有连接任何东西`, `${q.ref} terminal ${q.pin} at ${P(q.at)} is not connected to anything`));
  }
  const floating = new Set<string>();
  for (const p of wirePts) {
    const r = uf.find(key(p));
    if (!pinsOf.has(r) && !floating.has(r)) {
      floating.add(r);
      warnings.push(tr(`经过 ${P(p)} 的导线没有连到任何元件`, `The wire through ${P(p)} is not connected to any element`));
    }
  }
  for (const el of elements) {
    if (!geomOk.has(el) || !isTwoTerminal(el)) continue;
    if (nodeOf.get(`${el.ref}.p`) === nodeOf.get(`${el.ref}.n`))
      warnings.push(tr(`${el.ref} 的两端接在同一个结点上（被短路）`, `Both terminals of ${el.ref} are on the same node (shorted)`));
  }

  // ---------- references ----------
  const nodeSet = new Set([...nodes, ...aliases.keys()]);
  for (const el of elements) {
    if (!isTwoTerminal(el) && el.type !== 'K') continue;
    if (el.type === 'K') {
      for (const lr of [el.l1, el.l2]) {
        const l = byRef.get(lr);
        if (!l) errors.push(tr(`耦合 ${el.ref} 引用的电感 ${lr} 不存在`, `Coupling ${el.ref} refers to missing inductor ${lr}`));
        else if (l.type !== 'L') errors.push(tr(`耦合 ${el.ref} 引用的 ${lr} 不是电感`, `Coupling ${el.ref}: ${lr} is not an inductor`));
      }
      if (el.l1 === el.l2) errors.push(tr(`耦合 ${el.ref} 的两个电感相同`, `Coupling ${el.ref} uses the same inductor twice`));
      if (el.k === undefined && el.M === undefined) errors.push(tr(`耦合 ${el.ref} 需要给出 k 或 M`, `Coupling ${el.ref} needs k or M`));
      continue;
    }
    const needV = el.type === 'VCVS' || el.type === 'VCCS';
    const needI = el.type === 'CCVS' || el.type === 'CCCS';
    if (!needV && !needI) continue;
    const c = el.ctrl as Record<string, unknown> | undefined;
    if (!c) {
      errors.push(tr(`受控源 ${el.ref} 缺少控制量 ctrl`, `Dependent source ${el.ref} has no ctrl`));
      continue;
    }
    if (needI && !('i' in c)) errors.push(tr(`${el.ref}（${el.type}）的控制量必须是电流 {i}`, `${el.ref} (${el.type}) must be controlled by a current {i}`));
    if (needV && !('v' in c) && !('vnodes' in c)) errors.push(tr(`${el.ref}（${el.type}）的控制量必须是电压 {v} 或 {vnodes}`, `${el.ref} (${el.type}) must be controlled by a voltage {v} or {vnodes}`));
    for (const k of ['i', 'v'] as const) {
      if (!(k in c)) continue;
      const t = byRef.get(c[k] as string);
      if (!t) errors.push(tr(`${el.ref} 的控制元件 ${String(c[k])} 不存在`, `${el.ref}: controlling element ${String(c[k])} does not exist`));
      else if (!isTwoTerminal(t)) errors.push(tr(`${el.ref} 的控制元件 ${t.ref} 必须是二端元件`, `${el.ref}: controlling element ${t.ref} must be a two-terminal element`));
    }
    if ('vnodes' in c) {
      const vn = c.vnodes;
      if (!Array.isArray(vn) || vn.length !== 2) errors.push(tr(`${el.ref} 的 vnodes 必须是两个结点名`, `${el.ref}: vnodes must be two node names`));
      else
        for (const n of vn)
          if (!(typeof n === 'string' && (RESERVED.test(n) ? nodeSet.has('0') : nodeSet.has(n))))
            errors.push(tr(`${el.ref} 的控制电压引用了不存在的结点 ${String(n)}`, `${el.ref}: control voltage refers to unknown node ${String(n)}`));
    }
  }
  for (const m of s?.marks ?? []) {
    const t = byRef.get(m?.el);
    if (!t) errors.push(tr(`参考方向标记引用了不存在的元件 ${String(m?.el)}`, `A reference mark refers to missing element ${String(m?.el)}`));
    else if (!isTwoTerminal(t)) errors.push(tr(`参考方向标记只能用于二端元件，${t.ref} 不是`, `Reference marks need a two-terminal element; ${t.ref} is not`));
  }

  const netlist: Netlist & { aliases: Map<string, string> } = { nodeOf, nodes, elements, aliases };
  return { netlist, aliases, errors, warnings };
}
