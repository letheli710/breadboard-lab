// An ammeter wired in parallel instead of in series, found from the wiring alone (at any current):
// another part has terminals on both of the meter's nets — the 0.1 Ω meter shorts that part out —
// or both leads sit on one net (a jumper or a strip bypasses the meter, which then reads 0).

import { tr } from './i18n';
import { isPower, terminalsOf } from './parts';
import type { Circuit } from './types';
import { pinId } from './types';
import type { Issue } from './diagnostics';

export interface AmmeterBypass {
  ref: string;
  /** parts with terminals on both of the meter's nets (shorted out by it) */
  bypassed: string[];
  /** the supplies among them: the meter is across the supply */
  supplies: string[];
  /** one of them is a supply */
  acrossSupply: boolean;
  /** both leads on the same net: the meter itself is bypassed */
  sameNet: boolean;
}

export function ammeterBypasses(c: Circuit): AmmeterBypass[] {
  const netOf = new Map<string, string>();
  for (const n of c.nets) for (const p of n.pins) netOf.set(p, n.name);
  const out: AmmeterBypass[] = [];
  for (const m of c.components) {
    if (m.type !== 'ammeter') continue;
    const a = netOf.get(pinId(m.ref, '+'));
    const b = netOf.get(pinId(m.ref, '-'));
    if (!a || !b) continue;
    if (a === b) {
      out.push({ ref: m.ref, bypassed: [], supplies: [], acrossSupply: false, sameNet: true });
      continue;
    }
    const bypassed = c.components.filter((o) => {
      if (o.ref === m.ref || o.type === 'scope_probe') return false;
      const nets = new Set(terminalsOf(o.type).map((t) => netOf.get(pinId(o.ref, t))));
      return nets.has(a) && nets.has(b);
    });
    const supplies = bypassed.filter((o) => isPower(o.type) || o.type === 'function_gen').map((o) => o.ref);
    if (bypassed.length) out.push({ ref: m.ref, bypassed: bypassed.map((o) => o.ref), supplies, acrossSupply: supplies.length > 0, sameNet: false });
  }
  return out;
}

/** The bypasses as issues (live diagnostics and the check result). */
export function ammeterBypassIssues(c: Circuit, pinHoles?: Map<string, string[]>, severity?: Issue['severity']): Issue[] {
  const holes = (ref: string) => [...(pinHoles?.get(pinId(ref, '+')) ?? []), ...(pinHoles?.get(pinId(ref, '-')) ?? [])];
  return ammeterBypasses(c).map((b) => {
    if (b.sameNet)
      return {
        severity: severity ?? 'warning',
        title: tr(`${b.ref} 的两只表笔在同一个结点上，读数是 0`, `${b.ref}'s two leads are on the same node, so it reads 0`),
        detail: tr(
          '电流全部从旁边的导线（或同一条金属条）走了，没有经过电流表。要测这条路的电流，先拔掉原来连通这两点的跳线，让电流只能从电流表里过。',
          'The current takes the wire (or the shared strip) next to the meter and never passes through it. To measure it, first remove the jumper that joined these two points, so the meter is the only path.',
        ),
        refs: [b.ref],
        holes: holes(b.ref),
      };
    const sep = tr('、', ', ');
    const names = b.bypassed.join(sep);
    const others = b.bypassed.filter((r) => !b.supplies.includes(r)).join(sep);
    const sup = b.supplies.join(sep);
    return {
      severity: severity ?? (b.acrossSupply ? 'error' : 'warning'),
      title: b.acrossSupply
        ? tr(`${b.ref} 直接跨接在电源 ${sup} 两端——电流表要串联`, `${b.ref} is straight across the supply ${sup} — an ammeter goes in series`)
        : tr(`${b.ref} 并联在 ${names} 两端——电流表要串联`, `${b.ref} is in parallel with ${names} — an ammeter goes in series`),
      detail: tr(
        `电流表的内阻只有约 0.1 Ω，并联在两点之间就等于用导线把这两点短接：${b.acrossSupply ? `电源 ${sup} 被短路（真实的万用表会烧保险丝）${others ? `，${others} 上几乎没有电流` : ''}` : `${names} 被短路、不再工作`}，表上的读数也不是你想测的电流。正确的接法：拔掉一根导线把电路断开，红表笔接电流流进来的一侧、黑表笔接流出去的一侧。`,
        `An ammeter is only about 0.1 Ω inside, so across two points it joins them like a wire: ${b.acrossSupply ? `the supply ${sup} is shorted (a real multimeter blows its fuse)${others ? ` and ${others} get almost no current` : ''}` : `${names} is shorted out and stops working`}, and the reading is not the current you meant to measure. The right way: open the circuit by removing a wire, red lead on the side the current comes from, black lead on the side it leaves.`,
      ),
      refs: [b.ref, ...b.bypassed],
      holes: holes(b.ref),
    };
  });
}
