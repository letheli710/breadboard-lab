// The single-track rail (docs/RAIL_PLAN.md, CHALLENGE_FORMAT §17): a lab's task panel as one
// vertical sequence of nodes — look → build → measure → think → … → take away. Only the active
// node is open; done nodes fold to one line, nodes still to come show only their title. What a
// node needs to be understood (a figure, a slice of a teardown, a step-by-step derivation, a
// measurement question) is embedded in it by a line of its own:
//
//   ![](fig:<id>)          a figure (§16.3)
//   ![](measure:<id>)      a measurement question, answered right there
//   ![](inside:<td>#<n>)   layer n (1-based) of the teardown <td>, its picture and text
//   ![](derive:<id>)       a derivation from "derivations": revealed one line at a time
//   ![](calc:<id>)         a calculation card, shown inline
//   ![](steps:here)        where the node's build steps go (default: after the text)
//
// A file writes `rail` instead of `cards`. A file with cards and no rail gets a rail made from its
// cards (`railFromCards`), so every lab shows the new panel.

import { tr } from './i18n';
import { chapterById } from './problem/chapters';

export const RAIL_KINDS = ['look', 'build', 'measure', 'think', 'wrap'] as const;
export type RailKind = (typeof RAIL_KINDS)[number];

export interface RailNode {
  kind: RailKind;
  title: string;
  text: string;
  /** the steps this node owns: steps[first … first + count − 1] (nodes take the steps in order) */
  first: number;
  count: number;
  /** measurement questions answered in this node: the `![](measure:id)` lines, then the `measure` list */
  measure: string[];
  /** theory chapters to practise next (a "wrap" node) */
  practice: string[];
}

/** One line of a derivation: the text (formulas allowed) revealed when the student asks for the next line. */
export interface Derivation {
  id: string;
  title: string;
  steps: string[];
  /** optional last line: type the result (a number in `unit`) before the derivation counts as done */
  check?: { answer: number; unit: string; tol: number };
}

/** `![alt](kind:arg)` on a line of its own */
export const EMBED_LINE = /^\s*!\[[^\]]*\]\((fig|measure|inside|derive|calc|steps):([A-Za-z0-9_#-]+)\)\s*$/;
const EMBED_ANY = /!\[[^\]]*\]\((measure|inside|derive|calc):([A-Za-z0-9_#-]+)\)/g;

export const embedRefs = (text: string, kind: 'measure' | 'inside' | 'derive' | 'calc'): string[] => [...text.matchAll(EMBED_ANY)].filter((m) => m[1] === kind).map((m) => m[2]);

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const textOf = (v: unknown) => (typeof v === 'string' ? v : Array.isArray(v) ? strs(v).join('\n') : '');

export interface RailParse {
  rail: RailNode[];
  derivations: Record<string, Derivation>;
}

/**
 * Parse `rail` and `derivations` (top level, plus the current language's translation `tx`).
 * `nSteps`: the number of steps; `qIds`: the measurement question ids (in file order).
 */
export function parseRail(json: Record<string, unknown>, tx: Record<string, unknown>, nSteps: number, qIds: string[], errors: string[], warnings: string[]): RailParse | null {
  if (json.rail === undefined) {
    if (json.derivations !== undefined) warnings.push(tr('"derivations" 只在有 "rail" 时使用', '"derivations" is only used with a "rail"'));
    return null;
  }
  if (json.cards !== undefined) errors.push(tr('"rail" 和 "cards" 只能写一个（rail 取代 cards）', 'write either "rail" or "cards", not both (rail replaces cards)'));

  // derivations
  const derivations: Record<string, Derivation> = {};
  const txDer = isObj(tx.derivations) ? tx.derivations : {};
  if (json.derivations !== undefined && !isObj(json.derivations))
    errors.push(tr('"derivations" 必须是对象：{ "id": { "steps": [...] } }', '"derivations" must be an object: { "id": { "steps": [...] } }'));
  else
    for (const [id, d] of Object.entries((json.derivations as Record<string, unknown>) ?? {})) {
      const w = `derivations.${id}`;
      if (!/^[a-z0-9-]+$/.test(id)) errors.push(tr(`${w}: id 只能用小写字母、数字和 -`, `${w}: the id may use lower-case letters, digits and - only`));
      if (!isObj(d)) {
        errors.push(tr(`${w}: 必须是对象`, `${w}: must be an object`));
        continue;
      }
      const steps = strs(d.steps).map((s) => s.trim());
      if (steps.length < 2 || steps.some((s) => !s)) errors.push(tr(`${w}.steps: 至少两行文字`, `${w}.steps: at least two lines of text`));
      let check: Derivation['check'];
      if (d.check !== undefined) {
        const c = d.check;
        if (!isObj(c) || typeof c.answer !== 'number' || !Number.isFinite(c.answer))
          errors.push(tr(`${w}.check: 写成 { "answer": 数字, "unit": "V" }`, `${w}.check: write { "answer": number, "unit": "V" }`));
        else check = { answer: c.answer, unit: typeof c.unit === 'string' ? c.unit : '', tol: typeof c.tol === 'number' ? c.tol : 0.03 };
      }
      const t = isObj(txDer[id]) ? (txDer[id] as Record<string, unknown>) : {};
      const tSteps = strs(t.steps);
      derivations[id] = {
        id,
        title: (typeof t.title === 'string' && t.title) || (typeof d.title === 'string' ? d.title : ''),
        steps: tSteps.length === steps.length ? tSteps : steps,
        check,
      };
    }

  // nodes
  const rail: RailNode[] = [];
  if (!Array.isArray(json.rail) || !json.rail.length) {
    errors.push(
      tr(
        '"rail" 必须是非空数组：[{ "kind": "build", "title": "...", "text": "...", "steps": 2 }, …]',
        '"rail" must be a non-empty array: [{ "kind": "build", "title": "...", "text": "...", "steps": 2 }, …]',
      ),
    );
    return { rail, derivations };
  }
  const txRail = Array.isArray(tx.rail) ? (tx.rail as unknown[]) : [];
  if (tx.rail !== undefined && txRail.length !== json.rail.length)
    warnings.push(
      tr(`i18n.rail: 应该是和 "rail" 一一对应的数组（${json.rail.length} 项）`, `i18n.rail: should be an array matching "rail" item by item (${json.rail.length} items)`),
    );
  let next = 0;
  const placed = new Map<string, number>();
  json.rail.forEach((n: unknown, i: number) => {
    const w = `rail[${i}]`;
    if (!isObj(n)) return errors.push(tr(`${w}: 必须是对象`, `${w}: must be an object`));
    const kind = n.kind as RailKind;
    if (!RAIL_KINDS.includes(kind)) errors.push(tr(`${w}.kind: 必须是 ${RAIL_KINDS.join(' / ')}`, `${w}.kind: must be ${RAIL_KINDS.join(' / ')}`));
    const title = typeof n.title === 'string' ? n.title.trim() : '';
    if (!title) errors.push(tr(`${w}.title: 不能为空`, `${w}.title: must not be empty`));
    const count = n.steps === undefined ? 0 : n.steps;
    if (typeof count !== 'number' || !Number.isInteger(count) || count < 0)
      return errors.push(tr(`${w}.steps: 必须是这个节点拥有的步骤数（≥ 0 的整数）`, `${w}.steps: must be the number of steps this node owns (an integer ≥ 0)`));
    const text = textOf(n.text);
    const t = isObj(txRail[i]) ? (txRail[i] as Record<string, unknown>) : {};
    const tText = textOf(t.text);
    // the embeds must be the same in every language: the base text decides
    const listed = strs(n.measure);
    const measure = [...new Set([...embedRefs(text, 'measure'), ...listed])];
    for (const id of measure) {
      if (!qIds.includes(id)) errors.push(tr(`${w}: 没有 id 为 "${id}" 的测量题`, `${w}: there is no measurement question "${id}"`));
      else if (placed.has(id))
        errors.push(tr(`测量题 "${id}" 出现在 rail[${placed.get(id)}] 和 ${w} 两个节点里`, `measurement "${id}" is in both rail[${placed.get(id)}] and ${w}`));
      else placed.set(id, i);
    }
    if (tText && embedRefs(tText, 'measure').join() !== embedRefs(text, 'measure').join())
      warnings.push(tr(`i18n ${w}.text: 测量题的位置和原文不一样`, `i18n ${w}.text: the measurement embeds differ from the base text`));
    for (const id of embedRefs(text, 'derive'))
      if (!derivations[id]) errors.push(tr(`${w}: ![](derive:${id})："derivations" 里没有 "${id}"`, `${w}: ![](derive:${id}): there is no "${id}" in "derivations"`));
    for (const ref of embedRefs(text, 'inside'))
      if (!/^[a-z0-9-]+#[1-9][0-9]?$/.test(ref))
        errors.push(tr(`${w}: ![](inside:${ref}) 要写成 <拆解 id>#<第几层>，如 lm358#3`, `${w}: ![](inside:${ref}) must be <teardown id>#<layer>, e.g. lm358#3`));
    const practice = strs(n.practice);
    for (const c of practice) if (!chapterById(c)) errors.push(tr(`${w}.practice: 没有 "${c}" 这一章`, `${w}.practice: there is no chapter "${c}"`));
    if (kind === 'measure' && !measure.length) warnings.push(tr(`${w}: "measure" 节点里没有测量题`, `${w}: a "measure" node without measurement questions`));
    rail.push({ kind, title: (typeof t.title === 'string' && t.title.trim()) || title, text: tText || text, first: next, count, measure, practice });
    next += count;
  });
  if (next !== nSteps)
    errors.push(
      tr(
        `rail: 各节点的 "steps" 加起来是 ${next}，但 "steps" 有 ${nSteps} 步——每一步都要属于一个节点`,
        `rail: the nodes' "steps" add up to ${next}, but there are ${nSteps} steps — every step must belong to one node`,
      ),
    );
  for (const id of qIds)
    if (!placed.has(id))
      errors.push(
        tr(`测量题 "${id}" 不在任何节点里（写 ![](measure:${id}) 或放进 "measure"）`, `measurement "${id}" is in no node (write ![](measure:${id}) or list it in "measure")`),
      );
  for (const id of Object.keys(derivations))
    if (!rail.some((n) => embedRefs(n.text, 'derive').includes(id))) warnings.push(tr(`derivations.${id}：没有节点用到`, `derivations.${id}: no node shows it`));
  return { rail, derivations };
}

/** Card kinds → rail kinds, for a file that still writes cards (§16). */
interface CardLike {
  kind: 'try' | 'explain' | 'build' | 'wrap';
  title: string;
  text: string;
  first: number;
  count: number;
  practice: string[];
}

/**
 * The rail of a card-style file: try → build, explain → think, build → build, then one "measure"
 * node with every measurement question (they used to sit under the build card), wrap → wrap.
 */
export function railFromCards(cards: CardLike[], qIds: string[]): RailNode[] {
  const out: RailNode[] = [];
  const build = cards.findIndex((c) => c.kind === 'build');
  const host = build >= 0 ? build : cards.findIndex((c) => c.kind === 'wrap') - 1;
  cards.forEach((c, i) => {
    const kind: RailKind = c.kind === 'explain' ? 'think' : c.kind === 'wrap' ? 'wrap' : 'build';
    out.push({ kind, title: c.title, text: c.text, first: c.first, count: c.count, measure: [], practice: c.practice });
    if (i === Math.max(host, 0) && qIds.length)
      out.push({
        kind: 'measure',
        title: tr('测一测：读你自己的仪表', 'Measure: read your own instruments'),
        text: '',
        first: c.first + c.count,
        count: 0,
        measure: [...qIds],
        practice: [],
      });
  });
  return out;
}
