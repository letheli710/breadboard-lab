import { create } from 'zustand';
import { HOLES, HOLE_MAP } from '../core/breadboard';
import type { Challenge } from '../core/challenge';
import type { ProblemEntry } from './problems';
import type { IndexStatus } from './indexLoader';
import { ensureChallenge, isPending } from './challenges';
import type { CheckResult } from '../core/check';
import { isLang, setLang as setCoreLang, tr, type Lang } from '../core/i18n';
import { PARTS, nextScopeChannel } from '../core/parts';
import type { Layout, PartProps, PartType, PlacedPart } from '../core/types';
import { modeOf, startRoute } from './router';
import { boolRecord, readStored, sanitizeLayout, sanitizeReadings, sanitizeScope, writeStored, writeStoredLater } from './persist';
import type { ChallengeReadings } from '../core/readings';

export type Mode = 'learn' | 'challenge' | 'practice' | 'sandbox' | 'guide' | 'import' | 'inside' | 'calc';
/** Practice pages beside the problems: mistake notebook, review session, "how this works", quiz */
export type PracticeView = 'notebook' | 'due' | 'how' | 'quiz';

/** A chapter key-points page and where on it to go. */
export interface SummaryTarget {
  chapter: string;
  /** "idea-<id>" (a key idea), "example-<id>", or a section: "ideas" | "formulas" | "examples" | "mistakes" */
  section?: string;
  /** resolve the section from this problem (the key idea that links it) once the page is loaded */
  problem?: string;
  /** problem the student came from ("back to the problem") */
  from?: string;
}

import { applyEvent, countsAsDone, mergeAnswers, migrateAnswers, problemStatus, type PracticeEvent, type PracticeRecord } from './practice';
export type { PracticeRecord } from './practice';
export type Tool = PartType | 'select' | 'probe';
export type PanelTab = 'task' | 'schematic' | 'issues' | 'inspect';

export interface InvalidFile {
  file: string;
  source: string;
  errors: string[];
  warnings: string[];
}

/** localStorage, validated on read (state/persist.ts): `check` returns the cleaned value or
 *  undefined to discard it. */
const LS = {
  get<T>(k: string, d: T, check: (v: unknown) => T | undefined): T {
    return readStored(k, d, check);
  },
  set(k: string, v: unknown) {
    writeStored(k, v);
  },
};
const str = (v: unknown) => (typeof v === 'string' ? v : undefined);

const emptyLayout = (): Layout => ({ version: 1, parts: [] });
export const layoutKey = (mode: Mode, chId: string | null) => (mode === 'sandbox' || !chId ? 'bb.layout.sandbox' : `bb.layout.ch.${chId}`);

export const WIRE_COLORS = ['#d62828', '#1d3557', '#2a9d8f', '#e9c46a', '#f4a261', '#7b2cbf', '#222222', '#f1f1f1'];

/** Oscilloscope panel settings. `null` time/volt scales mean "auto" (set from the signal). */
export interface ScopeSettings {
  collapsed: boolean;
  /** seconds per division */
  tdiv: number | null;
  /** volts per division per channel */
  vdiv: { 1: number | null; 2: number | null };
  /** panel offset from its docked bottom-right corner (px, dragged) */
  drag: { x: number; y: number };
}

const defaultScope = (): ScopeSettings => ({ collapsed: false, tdiv: null, vdiv: { 1: null, 2: null }, drag: { x: 0, y: 0 } });

/** Channel for a newly placed scope probe (CH1 first, then CH2; CH1 if both are taken). */
export function scopeChannelFor(layout: Layout): 1 | 2 {
  return nextScopeChannel(layout) ?? 1;
}

export interface Highlight {
  refs: string[];
  holes: string[];
  tone: 'error' | 'info';
}

/** Language: saved choice, else the browser's preference. Applied to core before anything renders. */
function initialLang(): Lang {
  const saved = LS.get<string | null>('bb.lang', null, str);
  const l: Lang = isLang(saved) ? saved : typeof navigator !== 'undefined' && !navigator.language?.toLowerCase().startsWith('zh') ? 'en' : 'zh';
  setCoreLang(l);
  return l;
}

interface State {
  lang: Lang;
  mode: Mode;
  /** Inside page: the teardown shown (null = the list) */
  insideId: string | null;
  /** Calculations page: the card shown (null = the list) */
  calcId: string | null;
  /** lesson / challenge: a teardown shown in place of the 3D bench (null = the bench) */
  benchInside: string | null;
  panel: PanelTab;
  layout: Layout;
  /** undo stack (oldest first) and redo stack (next redo last) */
  past: Layout[];
  future: Layout[];
  /** layout before the slider drag in progress (beginEdit … endEdit): the whole drag is one undo step */
  editBase: Layout | null;
  tool: Tool;
  firstHole: string | null;
  placingProps: Partial<Record<PartType, PartProps>>;
  selectedId: string | null;
  /** dev board: the pin picked in the 3D view / pin table (physical pin name), shown in the inspector */
  selectedPin: string | null;
  hoverHole: string | null;
  hoverNet: string | null;
  highlight: Highlight | null;
  showNets: boolean;
  showLabels: boolean;
  probe: { red: string | null; black: string | null };
  scope: ScopeSettings;
  challenges: Challenge[];
  /** the built-in lesson / challenge index is a lazy chunk: `challenges` is empty until "ready" */
  challengeIndex: IndexStatus;
  invalid: InvalidFile[];
  activeId: string | null;
  /** built-in challenge asked for whose file is still loading (it opens when it arrives); the
   *  URL already names it */
  opening: string | null;
  step: number;
  hintsShown: number;
  check: CheckResult | null;
  celebrate: boolean;
  completed: Record<string, boolean>;
  /** measurement-question answers per challenge id (core/readings.ts), saved under bb.readings */
  readings: Record<string, ChallengeReadings>;
  toast: string | null;
  /** the toast offers an "Undo" button (after a delete) */
  toastUndo: boolean;
  /** theory practice ("circuit-problem/1") */
  problems: ProblemEntry[];
  /** the built-in problem index is a lazy chunk: `problems` is empty until "ready" */
  problemIndex: IndexStatus;
  problemInvalid: InvalidFile[];
  problemId: string | null;
  /** the chapter key-points page shown instead of a problem (state/summaries.ts, ui/Summary.tsx) */
  practiceSummary: SummaryTarget | null;
  /** the mistake notebook / review / quiz page shown instead of a problem (ui/mastery/) */
  practiceView: PracticeView | null;
  /** problem id → true once every question was answered correctly without revealing the answer */
  practiceDone: Record<string, boolean>;
  /** problem id → how each question was answered (see state/practice.ts) */
  practiceAnswers: Record<string, PracticeRecord>;

  setLang(l: Lang): void;
  setMode(m: Mode): void;
  openInside(id: string | null): void;
  openCalc(id: string | null): void;
  setBenchInside(id: string | null): void;
  setPanel(p: PanelTab): void;
  setTool(t: Tool): void;
  setPlacingProps(t: PartType, p: PartProps): void;
  clickHole(h: string, shift?: boolean): void;
  setHoverHole(h: string | null): void;
  setHoverNet(n: string | null): void;
  select(id: string | null): void;
  /** select a dev board pin (also selects its board) */
  selectPin(partId: string, pin: string | null): void;
  /** Change part properties. One undo step — or none while a slider drag is in progress
   *  (beginEdit/endEdit), and none for the operating state of a button or switch
   *  (`pressed` / `position`), which is not part of the build. */
  updateProps(id: string, p: PartProps): void;
  /** start of a continuous edit (slider drag): property changes until endEdit are one undo step */
  beginEdit(): void;
  endEdit(): void;
  /** press / release a pushbutton, flip a switch (not an undo step) */
  togglePart(id: string): void;
  removePart(id: string): void;
  /** Move a placed part to new holes (physical pin → hole id). Validated like placement
   *  (holes exist, not used by another part, footprint shape kept); one undo step.
   *  Returns false — with a toast — when the move is not allowed. */
  movePart(id: string, pins: Record<string, string>): boolean;
  /** Drop a half-placed part (first leg chosen, second not yet). Returns whether there was one. */
  cancelPlacement(): boolean;
  undo(): void;
  redo(): void;
  clear(): void;
  loadLayout(l: Layout, remember?: boolean): void;
  setChallenges(list: Challenge[], invalid: InvalidFile[]): void;
  openChallenge(id: string): void;
  setStep(n: number): void;
  showHint(): void;
  setCheck(r: CheckResult | null): void;
  setCelebrate(v: boolean): void;
  markCompleted(id: string): void;
  setReadings(id: string, r: ChallengeReadings): void;
  setHighlight(h: Highlight | null): void;
  toggle(k: 'showNets' | 'showLabels'): void;
  setScope(p: Partial<ScopeSettings>): void;
  notify(msg: string | null, opts?: { undo?: boolean }): void;
  setProblems(list: ProblemEntry[], invalid: InvalidFile[]): void;
  openProblem(id: string): void;
  /** open a chapter's key-points page (Practice); openProblem closes it */
  openSummary(t: SummaryTarget): void;
  closeSummary(): void;
  /** open the notebook / review session / explainer / quiz page (Practice); openProblem closes it */
  openPracticeView(v: PracticeView | null): void;
  /** record a correct answer; marks the problem done when all its questions are correct */
  /** record an attempt (wrong / reveal / right) on a practice question */
  practiceEvent(problemId: string, questionId: string, ev: PracticeEvent): void;
  /** merge practice progress from an exported file */
  importPractice(data: { done: Record<string, boolean>; answers: Record<string, PracticeRecord> }): void;
  resetProblem(problemId: string): void;
}

let uid = Date.now();
const newId = () => `p${(uid++).toString(36)}`;

/** undo steps kept */
export const HISTORY = 61;

/** A saved layout, validated; null if there is none (or it was unusable and has been discarded).
 *  Parts that can't be restored are dropped with a toast. */
function savedLayout(key: string): Layout | null {
  let dropped = 0;
  const l = readStored<Layout | null>(key, null, (v) => {
    const r = sanitizeLayout(v, newId);
    dropped = r?.dropped ?? 0;
    return r?.layout;
  });
  if (dropped)
    setTimeout(() => useStore.getState().notify(tr(`保存的电路里有 ${dropped} 个元件读不出来，已经去掉`, `${dropped} saved part(s) couldn't be restored and were removed`)));
  return l;
}

function nextRef(layout: Layout, type: PartType): string {
  const prefix = PARTS[type].refPrefix;
  const used = new Set(layout.parts.map((p) => p.ref));
  let i = 1;
  while (used.has(`${prefix}${i}`)) i++;
  return `${prefix}${i}`;
}

export function occupied(layout: Layout): Map<string, string> {
  const m = new Map<string, string>();
  for (const p of layout.parts) for (const h of Object.values(p.pins)) m.set(h, p.ref);
  return m;
}

/** Why `pins` is not a valid new position for part `id` in `layout`, or null when it is.
 *  Two-point parts: both pins on distinct existing holes. Footprint parts: exactly the
 *  footprint of some anchor hole. In both cases no hole may be used by another part. */
export function moveError(layout: Layout, id: string, pins: Record<string, string>): string | null {
  const part = layout.parts.find((p) => p.id === id);
  if (!part) return tr('找不到这个元件', 'That part no longer exists');
  const def = PARTS[part.type];
  const holes = Object.values(pins);
  const offBoard = tr('这里放不下：元件会超出面包板边缘', "Doesn't fit here: the part would hang off the edge of the board");
  if (holes.some((h) => !HOLE_MAP.has(h))) return offBoard;
  if (def.placement.kind === 'two-point') {
    const [a, b] = def.placement.pins;
    if (Object.keys(pins).length !== 2 || !pins[a] || !pins[b]) return offBoard;
    if (pins[a] === pins[b]) return tr('两只脚不能插在同一个孔里', 'Both legs cannot go in the same hole');
  } else {
    const fp = def.placement.footprint;
    const same = (f: Record<string, string> | null) => !!f && Object.keys(f).length === holes.length && Object.entries(f).every(([k, v]) => pins[k] === v);
    if (!HOLES.some((h) => same(fp(h.id)))) return offBoard;
  }
  const occ = occupied({ ...layout, parts: layout.parts.filter((p) => p.id !== id) });
  const clash = holes.find((h) => occ.has(h));
  return clash ? busy(clash, occ.get(clash)!) : null;
}

/** latest challenge asked for while its file was still loading (see openChallenge) */
let openRequest: string | null = null;

export const useStore = create<State>((set, get) => {
  const save = (layout: Layout) => {
    const s = get();
    writeStoredLater(layoutKey(s.mode, s.activeId), layout);
  };
  /** close a slider drag: its starting layout becomes one undo step */
  const finishEdit = () => {
    const s = get();
    if (!s.editBase) return;
    if (s.editBase !== s.layout) set({ past: [...s.past.slice(-(HISTORY - 1)), s.editBase], future: [] });
    set({ editBase: null });
  };
  const commit = (layout: Layout, extra: Partial<State> = {}) => {
    finishEdit();
    const s = get();
    save(layout);
    set({ layout, past: [...s.past.slice(-(HISTORY - 1)), s.layout], future: [], check: null, ...extra });
  };
  /** change the layout without an undo step */
  const transient = (layout: Layout) => {
    save(layout);
    set({ layout, check: null });
  };
  /** a layout from history, keeping the current button / switch states (they aren't history) */
  const restore = (l: Layout): Layout => {
    const now = new Map(get().layout.parts.map((p) => [p.id, p]));
    return {
      ...l,
      parts: l.parts.map((p) => {
        const c = now.get(p.id);
        if (!c || (p.type !== 'pushbutton' && p.type !== 'switch')) return p;
        return { ...p, props: { ...p.props, pressed: c.props.pressed, position: c.props.position } };
      }),
    };
  };
  const fresh = { past: [] as Layout[], future: [] as Layout[], editBase: null };

  return {
    lang: initialLang(),
    // the page from the URL (or the remembered one) from the start, so a Practice / Guide /
    // Import link never mounts the 3D workbench
    mode: modeOf(startRoute().route),
    insideId: null,
    calcId: null,
    benchInside: null,
    panel: 'task',
    layout: emptyLayout(),
    past: [],
    future: [],
    editBase: null,
    tool: 'select',
    firstHole: null,
    placingProps: {},
    selectedId: null,
    selectedPin: null,
    hoverHole: null,
    hoverNet: null,
    highlight: null,
    showNets: false,
    showLabels: true,
    probe: { red: null, black: null },
    scope: { ...defaultScope(), ...LS.get<Partial<ScopeSettings>>('bb.scope', {}, sanitizeScope) },
    challenges: [],
    challengeIndex: 'idle',
    invalid: [],
    activeId: null,
    opening: null,
    step: 0,
    hintsShown: 0,
    check: null,
    celebrate: false,
    completed: LS.get('bb.completed', {} as Record<string, boolean>, boolRecord),
    readings: LS.get('bb.readings', {} as Record<string, ChallengeReadings>, sanitizeReadings),
    toast: null,
    toastUndo: false,
    problems: [],
    problemIndex: 'idle',
    problemInvalid: [],
    problemId: LS.get<string | null>('bb.practice.current', null, str),
    practiceSummary: null,
    practiceView: null,
    practiceDone: LS.get('bb.practice.done', {} as Record<string, boolean>, boolRecord),
    practiceAnswers: LS.get('bb.practice.answers', {} as Record<string, PracticeRecord>, migrateAnswers),

    setLang(lang) {
      setCoreLang(lang);
      LS.set('bb.lang', lang);
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
      set({ lang });
    },
    openInside(insideId) {
      openRequest = null;
      set({ mode: 'inside', insideId, opening: null });
    },
    openCalc(calcId) {
      openRequest = null;
      set({ mode: 'calc', calcId, opening: null });
    },
    setBenchInside(benchInside) {
      set({ benchInside });
    },
    setMode(mode) {
      const s = get();
      // a challenge still loading is dropped when another page (or this page's nav) is picked
      openRequest = null;
      if (s.opening) set({ opening: null });
      const needsItem = (mode === 'learn' || mode === 'challenge') && !s.activeId;
      if (mode === s.mode && !needsItem) return;
      const base = { mode, tool: 'select' as Tool, firstHole: null, selectedId: null, highlight: null, check: null, benchInside: null, ...fresh };
      if (mode === 'sandbox') {
        set({ ...base, panel: 'schematic', layout: savedLayout('bb.layout.sandbox') ?? emptyLayout() });
      } else if (mode === 'learn' || mode === 'challenge') {
        const kind = mode === 'learn' ? 'lesson' : 'challenge';
        const keep = s.challenges.find((c) => c.id === s.activeId && c.kind === kind);
        const first = keep ?? s.challenges.find((c) => c.kind === kind && !s.completed[c.id]) ?? s.challenges.find((c) => c.kind === kind);
        set({ ...base, panel: 'task' });
        if (first) get().openChallenge(first.id);
        else set({ activeId: null, layout: emptyLayout() });
      } else if (mode === 'practice') {
        set({ ...base });
        if (!s.problems.some((p) => p.id === s.problemId)) {
          const first = s.problems.find((p) => !s.practiceDone[p.id]) ?? s.problems[0];
          if (first) get().openProblem(first.id);
        }
      } else set({ ...base });
    },
    setPanel(panel) {
      set({ panel });
    },
    setTool(tool) {
      const s = get();
      // a lesson (or a challenge with steps) keeps its step in view while parts are placed: only a
      // deliberate pick of a part opens Properties there; elsewhere a part tool shows its settings
      const guided = s.panel === 'task' && (s.mode === 'learn' || !!s.challenges.find((c) => c.id === s.activeId)?.steps.length);
      set({ tool, firstHole: null, selectedId: tool === 'select' ? s.selectedId : null, panel: tool !== 'select' && tool !== 'probe' && !guided ? 'inspect' : s.panel });
    },
    setPlacingProps(t, p) {
      set({ placingProps: { ...get().placingProps, [t]: { ...get().placingProps[t], ...p } } });
    },
    clickHole(h, shift) {
      const s = get();
      const occ = occupied(s.layout);
      if (s.tool === 'probe') {
        set({ probe: shift ? { ...s.probe, black: h } : { ...s.probe, red: h } });
        return;
      }
      if (s.tool === 'select') {
        const ref = occ.get(h);
        const p = ref ? s.layout.parts.find((x) => x.ref === ref) : null;
        set({ selectedId: p ? p.id : null, panel: p ? 'inspect' : s.panel });
        return;
      }
      const def = PARTS[s.tool];
      const props = { ...def.defaults, ...s.placingProps[s.tool] };
      if (s.tool === 'scope_probe' && !s.firstHole && nextScopeChannel(s.layout) === null)
        return get().notify(tr('示波器只有 CH1、CH2 两个通道，两个探头都已经用上了', 'The scope has two channels (CH1, CH2) and both probes are already in use'));
      if (def.placement.kind === 'footprint') {
        const fp = def.placement.footprint(h);
        if (!fp) return get().notify(tr('这里放不下：元件会超出面包板边缘', "Doesn't fit here: the part would hang off the edge of the board"));
        const clash = Object.values(fp).find((x) => occ.has(x));
        if (clash) return get().notify(busy(clash, occ.get(clash)!));
        const part: PlacedPart = { id: newId(), ref: nextRef(s.layout, s.tool), type: s.tool, props, pins: fp };
        commit({ ...s.layout, parts: [...s.layout.parts, part] }, { selectedId: part.id });
        return;
      }
      if (occ.has(h)) return get().notify(busy(h, occ.get(h)!));
      if (!s.firstHole) {
        set({ firstHole: h });
        return;
      }
      if (s.firstHole === h) {
        set({ firstHole: null });
        return;
      }
      const [p1, p2] = def.placement.pins;
      const part: PlacedPart = {
        id: newId(),
        ref: nextRef(s.layout, s.tool),
        type: s.tool,
        props:
          s.tool === 'wire'
            ? { ...props, wireColor: s.placingProps.wire?.wireColor ?? autoWireColor(s.firstHole, h) }
            : s.tool === 'scope_probe'
              ? { ...props, channel: scopeChannelFor(s.layout) }
              : props,
        pins: { [p1]: s.firstHole, [p2]: h },
      };
      commit({ ...s.layout, parts: [...s.layout.parts, part] }, { firstHole: null, selectedId: part.id });
    },
    setHoverHole(hoverHole) {
      if (get().hoverHole !== hoverHole) set({ hoverHole });
    },
    setHoverNet(hoverNet) {
      if (get().hoverNet !== hoverNet) set({ hoverNet });
    },
    select(selectedId) {
      set({ selectedId, selectedPin: selectedId === get().selectedId ? get().selectedPin : null, panel: selectedId ? 'inspect' : get().panel });
    },
    selectPin(partId, pin) {
      set({ selectedId: partId, selectedPin: pin, panel: 'inspect' });
    },
    updateProps(id, p) {
      const s = get();
      const layout = { ...s.layout, parts: s.layout.parts.map((x) => (x.id === id ? { ...x, props: { ...x.props, ...p } } : x)) };
      const operating = Object.keys(p).every((k) => k === 'pressed' || k === 'position');
      if (s.editBase || operating) transient(layout);
      else commit(layout);
    },
    beginEdit() {
      finishEdit();
      set({ editBase: get().layout });
    },
    endEdit() {
      finishEdit();
    },
    togglePart(id) {
      const p = get().layout.parts.find((x) => x.id === id);
      if (!p) return;
      if (p.type === 'pushbutton') get().updateProps(id, { pressed: !p.props.pressed });
      if (p.type === 'switch') get().updateProps(id, { position: p.props.position === 'b' ? 'a' : 'b' });
    },
    removePart(id) {
      const s = get();
      const part = s.layout.parts.find((x) => x.id === id);
      if (!part) return;
      commit({ ...s.layout, parts: s.layout.parts.filter((x) => x.id !== id) }, { selectedId: null });
      get().notify(tr(`已删除 ${part.ref}`, `Deleted ${part.ref}`), { undo: true });
    },
    movePart(id, pins) {
      const s = get();
      const err = moveError(s.layout, id, pins);
      if (err) {
        get().notify(err);
        return false;
      }
      const cur = s.layout.parts.find((p) => p.id === id)!;
      if (Object.entries(pins).every(([k, v]) => cur.pins[k] === v)) return true;
      commit({ ...s.layout, parts: s.layout.parts.map((p) => (p.id === id ? { ...p, pins: { ...pins } } : p)) });
      return true;
    },
    cancelPlacement() {
      if (!get().firstHole) return false;
      set({ firstHole: null });
      return true;
    },
    undo() {
      // a half-placed part is the most recent "step": undo drops it first
      if (get().cancelPlacement()) return;
      finishEdit();
      const s = get();
      const prev = s.past[s.past.length - 1];
      if (!prev) return;
      const layout = restore(prev);
      save(layout);
      set({ layout, past: s.past.slice(0, -1), future: [...s.future, s.layout], check: null, selectedId: null, toast: null, toastUndo: false });
    },
    redo() {
      finishEdit();
      const s = get();
      const next = s.future[s.future.length - 1];
      if (!next) return;
      const layout = restore(next);
      save(layout);
      set({ layout, future: s.future.slice(0, -1), past: [...s.past.slice(-(HISTORY - 1)), s.layout], firstHole: null, check: null, selectedId: null });
    },
    clear() {
      commit(emptyLayout(), { selectedId: null });
    },
    loadLayout(l, remember = true) {
      const layout: Layout = { version: 1, parts: l.parts.map((p) => ({ ...p, id: newId(), props: { ...p.props }, pins: { ...p.pins } })) };
      if (remember) commit(layout, { selectedId: null });
      else set({ layout, ...fresh, check: null, selectedId: null });
    },
    setChallenges(challenges, invalid) {
      set({ challenges, invalid });
      const s = get();
      // the open challenge went away (an imported file was removed): open another. (Nothing is
      // open yet at startup — then the route decides, see state/routeSync.ts.)
      if ((s.mode === 'learn' || s.mode === 'challenge') && s.activeId && !challenges.some((c) => c.id === s.activeId)) {
        const kind = s.mode === 'learn' ? 'lesson' : 'challenge';
        const first = challenges.find((c) => c.kind === kind && !s.completed[c.id]) ?? challenges.find((c) => c.kind === kind);
        if (first) get().openChallenge(first.id);
      }
    },
    openChallenge(id) {
      const ch = get().challenges.find((c) => c.id === id);
      if (!ch) return;
      if (isPending(ch)) {
        // built-in file not loaded yet: load its group, then open (unless another was picked meanwhile)
        openRequest = id;
        set({ opening: id });
        const asked = get().mode;
        void ensureChallenge(id).then((ok) => {
          if (openRequest !== id || get().mode !== asked) {
            if (get().opening === id) set({ opening: null });
            return;
          }
          openRequest = null;
          set({ opening: null });
          const loaded = get().challenges.find((c) => c.id === id);
          if (ok && loaded && !isPending(loaded)) get().openChallenge(id);
          else get().notify(tr('题目文件加载失败，请检查网络后重试。', "Couldn't load the challenge file; check the connection and try again."));
        });
        return;
      }
      openRequest = null;
      const saved = savedLayout(`bb.layout.ch.${id}`);
      const start = saved ?? ch.start ?? emptyLayout();
      set({
        activeId: id,
        opening: null,
        mode: ch.kind === 'lesson' ? 'learn' : 'challenge',
        benchInside: null,
        step: 0,
        hintsShown: 0,
        check: null,
        highlight: null,
        selectedId: null,
        firstHole: null,
        panel: 'task',
        ...fresh,
        layout: { version: 1, parts: start.parts.map((p) => ({ ...p, id: p.id ?? newId() })) },
      });
    },
    setStep(step) {
      set({ step });
    },
    showHint() {
      set({ hintsShown: get().hintsShown + 1 });
    },
    setCheck(check) {
      set({ check });
    },
    setCelebrate(celebrate) {
      set({ celebrate });
    },
    markCompleted(id) {
      const completed = { ...get().completed, [id]: true };
      LS.set('bb.completed', completed);
      set({ completed });
    },
    setReadings(id, r) {
      const readings = { ...get().readings, [id]: r };
      writeStoredLater('bb.readings', readings);
      set({ readings });
    },
    setHighlight(highlight) {
      set({ highlight });
    },
    setScope(p) {
      const scope = { ...get().scope, ...p };
      writeStoredLater('bb.scope', scope);
      set({ scope });
    },
    toggle(k) {
      set({ [k]: !get()[k] } as Partial<State>);
    },
    setProblems(problems, problemInvalid) {
      set({ problems, problemInvalid });
      const s = get();
      if (!problems.some((p) => p.id === s.problemId)) {
        const first = problems.find((p) => !s.practiceDone[p.id]) ?? problems[0];
        set({ problemId: first ? first.id : null });
      }
    },
    openProblem(problemId) {
      LS.set('bb.practice.current', problemId);
      openRequest = null;
      set({ problemId, mode: 'practice', opening: null, practiceSummary: null, practiceView: null });
    },
    openSummary(t) {
      openRequest = null;
      set({ practiceSummary: t, mode: 'practice', opening: null, practiceView: null });
    },
    openPracticeView(practiceView) {
      openRequest = null;
      set({ practiceView, mode: 'practice', opening: null, practiceSummary: practiceView ? null : get().practiceSummary });
    },
    closeSummary() {
      if (get().practiceSummary) set({ practiceSummary: null });
    },
    practiceEvent(pid, qid, ev) {
      const s = get();
      const before = s.practiceAnswers[pid]?.[qid];
      const after = applyEvent(before, ev);
      // the mistake notebook / review schedule (a lazy chunk)
      void import('./masteryStore').then((m) => m.fromPractice(pid, qid, ev, before, after));
      const rec = { ...s.practiceAnswers[pid], [qid]: after };
      const practiceAnswers = { ...s.practiceAnswers, [pid]: rec };
      LS.set('bb.practice.answers', practiceAnswers);
      const p = s.problems.find((x) => x.id === pid);
      let practiceDone = s.practiceDone;
      if (p && !practiceDone[pid] && countsAsDone(problemStatus(rec, p.qids))) {
        practiceDone = { ...practiceDone, [pid]: true };
        LS.set('bb.practice.done', practiceDone);
      }
      set({ practiceAnswers, practiceDone });
    },
    importPractice(data) {
      const s = get();
      const practiceAnswers = mergeAnswers(s.practiceAnswers, data.answers);
      const practiceDone = { ...s.practiceDone, ...data.done };
      for (const p of s.problems) if (countsAsDone(problemStatus(practiceAnswers[p.id], p.qids))) practiceDone[p.id] = true;
      LS.set('bb.practice.answers', practiceAnswers);
      LS.set('bb.practice.done', practiceDone);
      set({ practiceAnswers, practiceDone });
    },
    resetProblem(pid) {
      const s = get();
      const practiceAnswers = { ...s.practiceAnswers };
      delete practiceAnswers[pid];
      const practiceDone = { ...s.practiceDone };
      delete practiceDone[pid];
      LS.set('bb.practice.answers', practiceAnswers);
      LS.set('bb.practice.done', practiceDone);
      set({ practiceAnswers, practiceDone });
    },
    notify(toast, opts) {
      const toastUndo = !!(toast && opts?.undo);
      set({ toast, toastUndo });
      if (toast) setTimeout(() => get().toast === toast && set({ toast: null, toastUndo: false }), toastUndo ? 5000 : 2800);
    },
  };
});

const busy = (hole: string, ref: string) => tr(`孔 ${hole} 已经被 ${ref} 占用了——一个孔只能插一只脚`, `Hole ${hole} is already used by ${ref} — one leg per hole`);

/** Red for wires touching a + rail, dark blue for − rails, otherwise a neutral colour. */
function autoWireColor(a: string, b: string): string {
  const rows = [HOLE_MAP.get(a)?.row, HOLE_MAP.get(b)?.row];
  if (rows.some((r) => r === 'tp' || r === 'bp')) return '#d62828';
  if (rows.some((r) => r === 'tn' || r === 'bn')) return '#1d3557';
  return '#2a9d8f';
}

// dev-only hooks for automated UI checks (stripped from production builds)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const w = window as unknown as Record<string, unknown>;
  w.__bbSelect = (ref: string) => {
    const p = useStore.getState().layout.parts.find((x) => x.ref === ref);
    if (p) useStore.getState().select(p.id);
  };
  w.__bbTool = (t: Tool) => useStore.getState().setTool(t);
  w.__bbStore = useStore;
}

// A slider drag (or holding an arrow key on a slider) is one continuous edit: one undo step
// when it is released, however many values it went through. Covers every inspector slider.
if (typeof window !== 'undefined') {
  const isRange = (t: EventTarget | null) => t instanceof HTMLInputElement && t.type === 'range';
  window.addEventListener('pointerdown', (e) => isRange(e.target) && useStore.getState().beginEdit(), true);
  window.addEventListener('keydown', (e) => isRange(e.target) && !e.repeat && !useStore.getState().editBase && useStore.getState().beginEdit(), true);
  const end = () => useStore.getState().editBase && useStore.getState().endEdit();
  window.addEventListener('pointerup', end, true);
  window.addEventListener('pointercancel', end, true);
  window.addEventListener('keyup', (e) => isRange(e.target) && end(), true);
}

/** Current UI language. Components that render text subscribe with this so a language switch
 *  re-renders them (tr() reads the module-level language in core/i18n). */
export const useLang = () => useStore((s) => s.lang);
