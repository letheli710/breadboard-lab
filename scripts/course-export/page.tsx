// Course export, browser side (dev server only, never built): renders the pictures of one lab or
// unit with the app's own components — the target schematic, the card / rail figures, the
// teardown layers it shows, the units' circuits — each in an element marked data-shot="<name>"
// for scripts/course-export/export.cjs to screenshot, and returns the lab's parsed content
// (text in the requested language, steps, checks, questions, teardown and calc-card text).

import '../../src/styles.css';
import { createRoot } from 'react-dom/client';
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { parseChallenge, type Challenge } from '../../src/core/challenge';
import { setLang, type Lang } from '../../src/core/i18n';
import { embedRefs } from '../../src/core/rail';
import { simulate } from '../../src/core/solver';
import { railNodes } from '../../src/ui/Rail';
import CardFigureView from '../../src/ui/CardFigure';
import { SchematicView } from '../../src/ui/SchematicView';
import { ProblemSchematic } from '../../src/ui/ProblemSchematic';
import { TeardownSlice } from '../../src/inside/TeardownView';
import { loadCalcModule, tdById, teardownsFor } from '../../src/inside/registry';
import type { Teardown } from '../../src/inside/types';
import type { Schematic } from '../../src/core/problem/types';
import { PARTS } from '../../src/core/parts';
import { describeSet } from '../../src/core/check';
import { unmetStepChecks } from '../../src/core/stepCheck';
import type { Layout, PlacedPart } from '../../src/core/types';

type Probe = { red: string | null; black: string | null };

/** The board after each step of a lesson, built from the steps' checks the way the student does
 *  them (place / change / remove a part, move the multimeter probes). Parts of the reference
 *  solution keep their names. */
function stepBoards(ch: Challenge): { layout: Layout; probe: Probe }[] {
  let parts: PlacedPart[] = [];
  let probe: Probe = { red: null, black: null };
  let n = 0;
  const same = (a: Record<string, string>, b: Record<string, string>) => Object.keys(b).every((k) => a[k] === b[k]);
  const refOf = (type: string, pins: Record<string, string>) => {
    const sol = ch.solution?.parts.find((p) => p.type === type && same(p.pins, pins));
    if (sol && !parts.some((p) => p.ref === sol.ref)) return sol;
    const pre = PARTS[type as keyof typeof PARTS].refPrefix;
    let k = 1;
    while (parts.some((p) => p.ref === `${pre}${k}`)) k++;
    return `${pre}${k}`;
  };
  const out: { layout: Layout; probe: Probe }[] = [];
  for (const st of ch.steps) {
    for (const c of st.check ?? []) {
      if (c.kind === 'part') {
        const have = parts.find((p) => p.type === c.type && same(p.pins, c.pins));
        if (have) have.props = { ...have.props, ...c.props };
        else {
          const holes = new Set(Object.values(c.pins));
          parts = parts.filter((p) => !Object.values(p.pins).some((h) => holes.has(h)));
          const r = refOf(c.type, c.pins);
          const sol = typeof r === 'string' ? null : r;
          parts.push({
            id: `x${++n}`,
            ref: sol ? sol.ref : r,
            type: c.type,
            props: { ...PARTS[c.type].defaults, ...(sol?.props ?? {}), ...c.props },
            pins: { ...c.pins },
          } as PlacedPart);
        }
      } else if (c.kind === 'empty') {
        const holes = new Set(c.holes);
        parts = parts.filter((p) => !Object.values(p.pins).some((h) => holes.has(h)));
      } else if (c.kind === 'probe') {
        probe = { red: c.red ?? probe.red, black: c.black === undefined ? probe.black : c.black };
      }
    }
    out.push({ layout: { version: 1, parts: parts.map((p) => ({ ...p, props: { ...p.props }, pins: { ...p.pins } })) } as Layout, probe: { ...probe } });
  }
  return out;
}

interface Shot {
  name: string;
  node: ReactNode;
}

let setShots: (s: Shot[]) => void = () => {};
function Root() {
  const [shots, set] = useState<Shot[]>([]);
  useEffect(() => {
    setShots = set;
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 16, width: 420, background: 'var(--card)' }}>
      {shots.map((s) => (
        <div key={s.name} data-shot={s.name} style={{ background: 'var(--card)', padding: 8 }}>
          <Suspense fallback={null}>{s.node}</Suspense>
        </div>
      ))}
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<Root />);

/** [[part|words]] → words, for teardown text in Markdown */
const plain = (s: string) => s.replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, '$1');

async function teardown(id: string): Promise<Teardown | null> {
  const e = tdById(id);
  if (!e) return null;
  const m = await e.load();
  return m.default();
}

const tdText = (td: Teardown) => ({
  id: td.id,
  title: td.title,
  subtitle: td.subtitle,
  recap: td.recap ? plain(td.recap) : undefined,
  layers: td.layers.map((l) => ({
    short: l.short,
    title: plain(l.title),
    body: plain(l.body),
    table: l.table ? { head: l.table.head.map(plain), rows: l.table.rows.map((r) => r.map(plain)) } : undefined,
    formulas: l.formulas?.map((f) => ({ tex: f.tex, note: f.note ? plain(f.note) : undefined })),
    calcs: l.calcs,
  })),
});

declare global {
  interface Window {
    __export: {
      lesson(json: unknown, lang: Lang, shots: boolean): Promise<unknown>;
      unit(circuits: { name: string; schematic: unknown }[]): Promise<void>;
      clear(): void;
    };
  }
}

window.__export = {
  async lesson(json, lang, shots) {
    setLang(lang);
    const r = parseChallenge(json, 'folder');
    const ch = r.challenge as Challenge;
    const nodes = railNodes(ch);
    // teardown layers shown in the rail, and the teardowns this lab introduces
    const refs = new Set<string>();
    for (const n of nodes) for (const x of embedRefs(n.text, 'inside')) refs.add(x);
    const tdIds = new Set<string>([...teardownsFor(ch.id).map((t) => t.id), ...[...refs].map((x) => x.split('#')[0])]);
    const tds: Record<string, Teardown> = {};
    for (const id of tdIds) {
      const td = await teardown(id);
      if (td) tds[id] = td;
    }
    const calcMod = await loadCalcModule();
    const calcIds = new Set(nodes.flatMap((n) => embedRefs(n.text, 'calc')));
    const calcs = calcMod
      .allCalcs()
      .filter((c) => c.lessons?.includes(ch.id) || calcIds.has(c.id))
      .map((c) => ({
        id: c.id,
        title: plain(c.title),
        tex: c.tex,
        use: plain(c.use),
        vars: c.vars.map((v) => `${v.sym}（${v.name}，${v.unit}）`),
        out: `${c.out.sym}（${c.out.name}，${c.out.unit}）`,
        why: plain(c.why),
        example: c.example ? plain(c.example) : undefined,
        pitfalls: c.pitfalls?.map(plain),
        embedded: calcIds.has(c.id),
      }));
    if (shots) {
      const list: Shot[] = [{ name: 'target', node: <SchematicView circuit={ch.target} sim={simulate(ch.target)} showValues hideReadings={ch.measurements.length > 0} /> }];
      for (const [id, f] of Object.entries(ch.figures)) list.push({ name: `fig-${id}`, node: <CardFigureView fig={f} /> });
      for (const ref of refs) {
        const [id, l] = ref.split('#');
        if (tds[id]) list.push({ name: `td-${id}-${l}`, node: <TeardownSlice td={tds[id]} layer={+l - 1} /> });
      }
      // a rail made from cards opens with layer 1 of each teardown the lab introduces
      if (ch.railAuto)
        for (const t of teardownsFor(ch.id)) if (tds[t.id] && !refs.has(`${t.id}#1`)) list.push({ name: `td-${t.id}-1`, node: <TeardownSlice td={tds[t.id]} layer={0} /> });
      setShots(list);
    }
    const empty = { layout: { version: 1, parts: [] } as unknown as Layout, probe: { red: null, black: null }, scope: { tdiv: null, vdiv: { 1: null, 2: null } } };
    const checkText = ch.steps.map((st) => [
      ...(st.check?.length ? unmetStepChecks(st.check, empty) : []),
      ...(st.check ?? []).flatMap((c) => (c.kind === 'empty' ? [lang === 'zh' ? `清空这些孔：${c.holes.join('、')}` : `holes empty again: ${c.holes.join(', ')}`] : [])),
    ]);
    const qsets = Object.fromEntries(ch.measurements.map((q) => [q.id, Object.keys(q.set).length ? describeSet(q.set) : '']));
    return {
      checkText,
      qsets,
      boards: { start: ch.start ?? null, solution: ch.solution ?? null, steps: ch.steps.some((x) => x.check?.length) ? stepBoards(ch) : [] },
      errors: r.errors,
      ch: { ...ch, target: undefined },
      targetParts: ch.target.components.map((c) => ({ ref: c.ref, type: c.type, props: c.props })),
      targetNets: ch.target.nets.map((n) => ({ name: n.name, pins: n.pins })),
      nodes,
      tds: Object.fromEntries(Object.entries(tds).map(([k, v]) => [k, tdText(v)])),
      calcs,
    };
  },
  async unit(circuits) {
    setShots(circuits.map((c) => ({ name: c.name, node: <ProblemSchematic schematic={c.schematic as Schematic} /> })));
  },
  clear() {
    setShots([]);
  },
};
