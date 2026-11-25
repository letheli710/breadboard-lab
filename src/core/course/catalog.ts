// The course map: Worlds (course/worlds.json), units still to be built (course/pending.json)
// and portals (course/portals.json). Pure: the validator (scripts/validate-course.ts) and the app
// (state/course.ts) both use it. Format and rules: docs/PORTALS.md.
//
// A *ref* names one piece of content: "challenge:<id>" (lesson or lab), "chapter:<id>" (theory
// chapter), "problem:<id>", "unit:<id>" (learning unit), "lesson:<slug>" (stage lesson,
// src/stage/registry.ts, #/lesson/<slug>), "pending:<id>" (registered, not built).
// A pending ref connects by itself once a unit or challenge with the same id exists.

import { checkT, type T } from './text';
import { unitBlocks, type Unit } from './unit';

export const REF_KINDS = ['challenge', 'chapter', 'problem', 'unit', 'lesson', 'pending'] as const;
export type RefKind = (typeof REF_KINDS)[number];
export interface Ref {
  kind: RefKind;
  id: string;
}

export function parseRef(s: unknown): Ref | null {
  if (typeof s !== 'string') return null;
  const m = /^([a-z]+):([A-Za-z0-9][A-Za-z0-9_.-]*)$/.exec(s);
  if (!m || !(REF_KINDS as readonly string[]).includes(m[1])) return null;
  return { kind: m[1] as RefKind, id: m[2] };
}
export const refKey = (r: Ref) => `${r.kind}:${r.id}`;

export interface WorldSection {
  title: T;
  note?: T;
  items: string[];
}
export interface World {
  id: string;
  /** number shown as "World n"; the elective area has none */
  n?: number;
  title: T;
  /** QCC course(s) it belongs to */
  course: T;
  /** textbook chapters (omitted where the syllabus names no textbook) */
  textbook?: T;
  /** the student's current position */
  current?: boolean;
  /** not counted in the main-line progress (the UB bridge / elective area) */
  elective?: boolean;
  note?: T;
  /** theory chapters whose every problem must be linked from one of this World's units */
  unitsCover?: string[];
  sections: WorldSection[];
}
export interface PendingUnit {
  id: string;
  world: string;
  title: T;
  /** one sentence: what it will teach */
  what: T;
}
export interface Portal {
  id: string;
  from: string;
  to: string;
  /** behind the door: one sentence on what the target teaches */
  what: T;
  /** the reverse link shown at the top of the target: why the source points here */
  back: T;
  /** what to understand first (refs) */
  prereq: string[];
  minutes: number;
}
export interface CourseData {
  worlds: World[];
  pending: PendingUnit[];
  portals: Portal[];
}

/** What exists, for validation and for resolving refs. */
export interface Catalog {
  challenges: Map<string, { title: string; kind: 'lesson' | 'challenge' }>;
  chapters: Map<string, { title: string }>;
  /** problem id → chapter id */
  problems: Map<string, string>;
  units: Map<string, Unit>;
  /** stage lessons (src/stage/registry.ts): slug → world id and title */
  lessons: Map<string, { world: string; code: string; title: T }>;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/* ----------------------------------------------------------------------------- parsing */

/** `pendingJson`: course/pending.json (kept apart so the start-up bundle carries only the Worlds) */
export function parseWorldsFile(json: unknown, errors: string[], pendingJson?: unknown): { worlds: World[]; pending: PendingUnit[] } {
  if (!isObj(json) || json.format !== 'course-worlds/1') {
    errors.push('course/worlds.json: "format" 需要是 "course-worlds/1"');
    return { worlds: [], pending: [] };
  }
  const worlds: World[] = [];
  (Array.isArray(json.worlds) ? json.worlds : []).forEach((w, i) => {
    const at = `worlds[${i}]`;
    if (!isObj(w) || typeof w.id !== 'string') return void errors.push(`${at}: 需要 "id" / needs "id"`);
    checkT(w.title, `${at}.title`, errors);
    checkT(w.course, `${at}.course`, errors);
    if (w.textbook !== undefined) checkT(w.textbook, `${at}.textbook`, errors);
    if (w.note !== undefined) checkT(w.note, `${at}.note`, errors);
    const sections: WorldSection[] = [];
    (Array.isArray(w.sections) ? w.sections : []).forEach((s, j) => {
      const sat = `${at}.sections[${j}]`;
      if (!isObj(s) || !Array.isArray(s.items)) return void errors.push(`${sat}: 需要 "items" / needs "items"`);
      checkT(s.title, `${sat}.title`, errors);
      if (s.note !== undefined) checkT(s.note, `${sat}.note`, errors);
      sections.push({ title: s.title as T, ...(s.note ? { note: s.note as T } : {}), items: s.items.filter((x): x is string => typeof x === 'string') });
    });
    worlds.push({
      id: w.id,
      ...(isNum(w.n) ? { n: w.n } : {}),
      title: w.title as T,
      course: w.course as T,
      ...(w.textbook ? { textbook: w.textbook as T } : {}),
      ...(w.current === true ? { current: true } : {}),
      ...(w.elective === true ? { elective: true } : {}),
      ...(w.note ? { note: w.note as T } : {}),
      ...(Array.isArray(w.unitsCover) ? { unitsCover: w.unitsCover.filter((x): x is string => typeof x === 'string') } : {}),
      sections,
    });
  });
  const pending: PendingUnit[] = [];
  const pend = isObj(pendingJson) ? pendingJson.pending : json.pending;
  (Array.isArray(pend) ? pend : []).forEach((p, i) => {
    const at = `pending[${i}]`;
    if (!isObj(p) || typeof p.id !== 'string' || typeof p.world !== 'string') return void errors.push(`${at}: 需要 "id" 和 "world" / needs "id" and "world"`);
    checkT(p.title, `${at}.title`, errors);
    checkT(p.what, `${at}.what`, errors);
    pending.push({ id: p.id, world: p.world, title: p.title as T, what: p.what as T });
  });
  return { worlds, pending };
}

export function parsePortalsFile(json: unknown, errors: string[]): Portal[] {
  if (!isObj(json) || json.format !== 'course-portals/1') {
    errors.push('course/portals.json: "format" 需要是 "course-portals/1"');
    return [];
  }
  const out: Portal[] = [];
  (Array.isArray(json.portals) ? json.portals : []).forEach((p, i) => {
    const at = `portals[${i}]${isObj(p) && typeof p.id === 'string' ? ` (${p.id})` : ''}`;
    if (!isObj(p) || typeof p.id !== 'string') return void errors.push(`${at}: 需要 "id" / needs "id"`);
    checkT(p.what, `${at}.what`, errors);
    if (p.back === undefined) errors.push(`${at}: 缺少反向链接 "back"（目标单元顶部显示的那句话） / missing reverse link "back"`);
    else checkT(p.back, `${at}.back`, errors);
    if (!isNum(p.minutes) || p.minutes < 1 || p.minutes > 240) errors.push(`${at}: "minutes" 需要是 1–240 的预计分钟数 / estimated minutes 1–240`);
    if (!Array.isArray(p.prereq) || !p.prereq.every((x) => typeof x === 'string')) errors.push(`${at}: "prereq" 需要是一组引用（可以为空） / a list of refs (may be empty)`);
    out.push({
      id: p.id,
      from: String(p.from ?? ''),
      to: String(p.to ?? ''),
      what: p.what as T,
      back: p.back as T,
      prereq: Array.isArray(p.prereq) ? p.prereq.filter((x): x is string => typeof x === 'string') : [],
      minutes: isNum(p.minutes) ? p.minutes : 0,
    });
  });
  return out;
}

/* ---------------------------------------------------------------------------- resolving */

export type RefState = 'live' | 'pending' | 'missing';

/** Where a ref leads: live content, a registered placeholder, or nothing (a broken link).
 *  A pending ref whose id now exists as a unit or challenge is live (connected automatically). */
export function resolveRef(ref: Ref, cat: Catalog, data: Pick<CourseData, 'pending'>): { state: RefState; ref: Ref } {
  switch (ref.kind) {
    case 'challenge':
      return { state: cat.challenges.has(ref.id) ? 'live' : 'missing', ref };
    case 'chapter':
      return { state: cat.chapters.has(ref.id) ? 'live' : 'missing', ref };
    case 'problem':
      return { state: cat.problems.has(ref.id) ? 'live' : 'missing', ref };
    case 'unit':
      return { state: cat.units.has(ref.id) ? 'live' : 'missing', ref };
    case 'lesson':
      return { state: cat.lessons.has(ref.id) ? 'live' : 'missing', ref };
    case 'pending':
      if (cat.units.has(ref.id)) return { state: 'live', ref: { kind: 'unit', id: ref.id } };
      if (cat.lessons.has(ref.id)) return { state: 'live', ref: { kind: 'lesson', id: ref.id } };
      if (cat.challenges.has(ref.id)) return { state: 'live', ref: { kind: 'challenge', id: ref.id } };
      return { state: data.pending.some((p) => p.id === ref.id) ? 'pending' : 'missing', ref };
  }
}

/** The world a ref belongs to (via the world lists, a unit's / pending unit's own world, or a problem's chapter). */
export function worldOf(ref: Ref, data: CourseData, cat: Catalog): World | undefined {
  const key = refKey(ref);
  let w = data.worlds.find((x) => x.sections.some((s) => s.items.includes(key)));
  if (w) return w;
  if (ref.kind === 'unit') w = data.worlds.find((x) => x.id === cat.units.get(ref.id)?.world);
  else if (ref.kind === 'lesson') w = data.worlds.find((x) => x.id === cat.lessons.get(ref.id)?.world);
  else if (ref.kind === 'pending') w = data.worlds.find((x) => x.id === data.pending.find((p) => p.id === ref.id)?.world);
  else if (ref.kind === 'problem') {
    const ch = cat.problems.get(ref.id);
    if (ch) w = worldOf({ kind: 'chapter', id: ch }, data, cat);
  }
  return w;
}

/** Portals whose target is `target` (after automatic connection of pending refs): its reverse links. */
export function backlinksTo(target: Ref, data: CourseData, cat: Catalog): Portal[] {
  const k = refKey(target);
  return data.portals.filter((p) => {
    const r = parseRef(p.to);
    return r && refKey(resolveRef(r, cat, data).ref) === k;
  });
}

/** Portals that start at `source`. */
export const portalsFrom = (source: Ref, data: CourseData): Portal[] => data.portals.filter((p) => p.from === refKey(source));

/* ----------------------------------------------------------------------------- progress */

export interface Progress {
  /** lessons / labs passed */
  completed: Record<string, boolean>;
  /** units marked done */
  units: Record<string, boolean>;
  /** theory problems done */
  problems: Record<string, boolean>;
  /** stage lessons passed (by slug); absent counts as none */
  lessons?: Record<string, boolean>;
}

/** Has the student covered `ref`? A theory chapter counts once half of its problems are done. */
export function isDone(ref: Ref, p: Progress, cat: Catalog, data: Pick<CourseData, 'pending'>): boolean {
  const r = resolveRef(ref, cat, data);
  if (r.state !== 'live') return false;
  const { kind, id } = r.ref;
  if (kind === 'challenge') return !!p.completed[id];
  if (kind === 'unit') return !!p.units[id];
  if (kind === 'lesson') return !!p.lessons?.[id];
  if (kind === 'problem') return !!p.problems[id];
  if (kind === 'chapter') {
    const all = [...cat.problems].filter(([, ch]) => ch === id).map(([pid]) => pid);
    return all.length > 0 && all.filter((x) => p.problems[x]).length * 2 >= all.length;
  }
  return false;
}

/** "Ready now", or the first world the student should do first (portals never lock). */
export function portalReadiness(portal: Portal, p: Progress, data: CourseData, cat: Catalog): { ready: true } | { ready: false; missing: Ref[]; world?: World } {
  const missing = portal.prereq.map(parseRef).filter((r): r is Ref => !!r && !isDone(r, p, cat, data));
  if (!missing.length) return { ready: true };
  const worlds = missing.map((r) => worldOf(r, data, cat)).filter((w): w is World => !!w);
  const first = worlds.sort((a, b) => (a.n ?? 99) - (b.n ?? 99))[0];
  return { ready: false, missing, ...(first ? { world: first } : {}) };
}

/* ----------------------------------------------------------------------------- validation */

/** Every check behind `npm run check` for the course map (broken links, missing reverse links,
 *  refs to unregistered units, World coverage, unit cross-references). `plan` is the text of
 *  docs/REBUILD_PLAN.md, where every pending unit must be registered. */
export function validateCourse(data: CourseData, cat: Catalog, plan: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const worldIds = new Set<string>();
  for (const w of data.worlds) {
    if (worldIds.has(w.id)) errors.push(`World "${w.id}" 重复 / duplicate world id`);
    worldIds.add(w.id);
  }

  // every lesson / lab, chapter and unit sits in exactly one World section
  const placed = new Map<string, string>();
  for (const w of data.worlds)
    for (const s of w.sections)
      for (const item of s.items) {
        const r = parseRef(item);
        const at = `World ${w.id}: "${item}"`;
        if (!r || r.kind === 'problem' || r.kind === 'pending') {
          errors.push(`${at}: World 里只能放 challenge: / chapter: / unit: / lesson: 引用（待建单元写在 "pending" 里） / only challenge:, chapter:, unit:, lesson: refs`);
          continue;
        }
        if (resolveRef(r, cat, data).state === 'missing') errors.push(`${at}: 指向不存在的内容 / points to nothing`);
        if (placed.has(item)) errors.push(`${at}: 已经放在 World ${placed.get(item)} / already in World ${placed.get(item)}`);
        placed.set(item, w.id);
        if (r.kind === 'unit') {
          const u = cat.units.get(r.id);
          if (u && u.world !== w.id) errors.push(`${at}: 单元文件写的是 world "${u.world}" / the unit file says world "${u.world}"`);
        }
        if (r.kind === 'lesson') {
          const l = cat.lessons.get(r.id);
          if (l && l.world !== w.id) errors.push(`${at}: src/stage/registry.ts 写的是 world "${l.world}" / the lesson registry says world "${l.world}"`);
        }
      }
  for (const [id] of cat.challenges) if (!placed.has(`challenge:${id}`)) errors.push(`challenge "${id}" 没有放进任何 World（course/worlds.json） / not in any World`);
  for (const [id] of cat.chapters) if (!placed.has(`chapter:${id}`)) errors.push(`chapter "${id}" 没有放进任何 World / not in any World`);
  for (const [id, u] of cat.units) {
    if (!placed.has(`unit:${id}`)) errors.push(`unit "${id}" 没有放进任何 World / not in any World`);
    if (!worldIds.has(u.world)) errors.push(`unit "${id}": world "${u.world}" 不存在 / no such world`);
  }
  for (const [id] of cat.lessons)
    if (!placed.has(`lesson:${id}`)) errors.push(`stage lesson "${id}" 没有放进任何 World（course/worlds.json 里写 "lesson:${id}"） / not in any World`);

  // pending units: registered in REBUILD_PLAN.md; flagged once built
  const pend = new Set<string>();
  for (const p of data.pending) {
    if (pend.has(p.id)) errors.push(`pending "${p.id}" 重复 / duplicate`);
    pend.add(p.id);
    if (!worldIds.has(p.world)) errors.push(`pending "${p.id}": world "${p.world}" 不存在 / no such world`);
    if (!plan.includes(`\`${p.id}\``)) errors.push(`pending "${p.id}" 没有登记在 docs/REBUILD_PLAN.md（写成 \`${p.id}\`） / not registered in docs/REBUILD_PLAN.md`);
    if (cat.units.has(p.id) || cat.challenges.has(p.id) || cat.lessons.has(p.id))
      warnings.push(`pending "${p.id}" 已经建好，传送门已自动接通；可以从待建列表删除 / now built (portals connect automatically); remove it from "pending"`);
  }

  // portals
  const pids = new Set<string>();
  const checkRef = (s: string, at: string, allowPending: boolean) => {
    const r = parseRef(s);
    if (!r) return void errors.push(`${at}: "${s}" 不是合法的引用（kind:id） / not a valid ref`);
    const st = resolveRef(r, cat, data).state;
    if (st === 'missing')
      errors.push(
        r.kind === 'pending'
          ? `${at}: "${s}" 指向未登记的单元（先登记到 course/pending.json 和 REBUILD_PLAN.md） / points to an unregistered unit`
          : `${at}: "${s}" 是断链（内容不存在） / broken link`,
      );
    if (st === 'pending' && !allowPending) errors.push(`${at}: "${s}" 还没建好 / not built yet`);
  };
  for (const p of data.portals) {
    const at = `portal "${p.id}"`;
    if (pids.has(p.id)) errors.push(`${at}: id 重复 / duplicate`);
    pids.add(p.id);
    checkRef(p.from, `${at} from`, true);
    checkRef(p.to, `${at} to`, true);
    p.prereq.forEach((x, i) => checkRef(x, `${at} prereq[${i}]`, true));
    if (p.from === p.to) errors.push(`${at}: 来源和目标相同 / from = to`);
  }

  // unit cross-references
  const placedPortal = new Map<string, string>();
  const linked = new Map<string, string>();
  for (const [id, u] of cat.units) {
    const at = `unit "${id}"`;
    u.connects.forEach((x, i) => checkRef(x, `${at} connects[${i}]`, false));
    for (const b of unitBlocks(u)) {
      if (b.type === 'bench' && !cat.challenges.has(b.challenge)) errors.push(`${at}: 面包板 "${b.challenge}" 不存在 / no such lesson or lab`);
      if (b.type === 'problems')
        for (const pid of b.ids) {
          if (!cat.problems.has(pid)) errors.push(`${at}: 理论题 "${pid}" 不存在 / no such problem`);
          else if (linked.has(pid)) errors.push(`${at}: 理论题 "${pid}" 已经挂在 ${linked.get(pid)} 下 / already linked from ${linked.get(pid)}`);
          else linked.set(pid, id);
        }
      if (b.type === 'portal') {
        const p = data.portals.find((x) => x.id === b.id);
        if (!p) errors.push(`${at}: 传送门 "${b.id}" 没有登记在 course/portals.json / portal not registered`);
        else if (p.from !== `unit:${id}`) errors.push(`${at}: 传送门 "${b.id}" 的来源是 ${p.from}，不是这个单元 / portal starts elsewhere`);
        else if (placedPortal.has(b.id)) errors.push(`${at}: 传送门 "${b.id}" 放了两次 / placed twice`);
        placedPortal.set(b.id, id);
      }
    }
  }
  // "unitsCover": every problem of the chapter linked from a unit of that World
  for (const w of data.worlds)
    for (const ch of w.unitsCover ?? []) {
      if (!cat.chapters.has(ch)) errors.push(`World ${w.id} unitsCover: chapter "${ch}" 不存在 / no such chapter`);
      const missing = [...cat.problems].filter(([pid, c]) => c === ch && !(linked.has(pid) && cat.units.get(linked.get(pid)!)?.world === w.id)).map(([pid]) => pid);
      if (missing.length) errors.push(`World ${w.id}: chapter "${ch}" 的这些理论题还没挂到本 World 的单元下：${missing.join(', ')} / problems not linked from this World's units`);
    }
  return { errors, warnings };
}
