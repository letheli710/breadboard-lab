import { create } from 'zustand';
import { HOLE_MAP } from '../core/breadboard';
import type { Challenge } from '../core/challenge';
import type { CheckResult } from '../core/check';
import { PARTS } from '../core/parts';
import type { Layout, PartProps, PartType, PlacedPart } from '../core/types';

export type Mode = 'learn' | 'challenge' | 'sandbox' | 'guide' | 'import';
export type Tool = PartType | 'select' | 'probe';
export type PanelTab = 'task' | 'schematic' | 'issues' | 'inspect';

export interface InvalidFile {
  file: string;
  source: string;
  errors: string[];
  warnings: string[];
}

const LS = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : d;
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* storage unavailable */
    }
  },
};

const emptyLayout = (): Layout => ({ version: 1, parts: [] });
const layoutKey = (mode: Mode, chId: string | null) => (mode === 'sandbox' || !chId ? 'bb.layout.sandbox' : `bb.layout.ch.${chId}`);

export const WIRE_COLORS = ['#d62828', '#1d3557', '#2a9d8f', '#e9c46a', '#f4a261', '#7b2cbf', '#222222', '#f1f1f1'];

export interface Highlight {
  refs: string[];
  holes: string[];
  tone: 'error' | 'info';
}

interface State {
  mode: Mode;
  panel: PanelTab;
  layout: Layout;
  past: Layout[];
  tool: Tool;
  firstHole: string | null;
  placingProps: Partial<Record<PartType, PartProps>>;
  selectedId: string | null;
  hoverHole: string | null;
  hoverNet: string | null;
  highlight: Highlight | null;
  showNets: boolean;
  showLabels: boolean;
  probe: { red: string | null; black: string | null };
  challenges: Challenge[];
  invalid: InvalidFile[];
  activeId: string | null;
  step: number;
  hintsShown: number;
  check: CheckResult | null;
  celebrate: boolean;
  completed: Record<string, boolean>;
  toast: string | null;

  setMode(m: Mode): void;
  setPanel(p: PanelTab): void;
  setTool(t: Tool): void;
  setPlacingProps(t: PartType, p: PartProps): void;
  clickHole(h: string, shift?: boolean): void;
  setHoverHole(h: string | null): void;
  setHoverNet(n: string | null): void;
  select(id: string | null): void;
  updateProps(id: string, p: PartProps): void;
  togglePart(id: string): void;
  removePart(id: string): void;
  undo(): void;
  clear(): void;
  loadLayout(l: Layout, remember?: boolean): void;
  setChallenges(list: Challenge[], invalid: InvalidFile[]): void;
  openChallenge(id: string): void;
  setStep(n: number): void;
  showHint(): void;
  setCheck(r: CheckResult | null): void;
  setCelebrate(v: boolean): void;
  markCompleted(id: string): void;
  setHighlight(h: Highlight | null): void;
  toggle(k: 'showNets' | 'showLabels'): void;
  notify(msg: string | null): void;
}

let uid = Date.now();
const newId = () => `p${(uid++).toString(36)}`;

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

export const useStore = create<State>((set, get) => {
  const commit = (layout: Layout, extra: Partial<State> = {}) => {
    const s = get();
    LS.set(layoutKey(s.mode, s.activeId), layout);
    set({ layout, past: [...s.past.slice(-60), s.layout], check: null, ...extra });
  };

  return {
    mode: 'learn',
    panel: 'task',
    layout: emptyLayout(),
    past: [],
    tool: 'select',
    firstHole: null,
    placingProps: {},
    selectedId: null,
    hoverHole: null,
    hoverNet: null,
    highlight: null,
    showNets: false,
    showLabels: true,
    probe: { red: null, black: null },
    challenges: [],
    invalid: [],
    activeId: null,
    step: 0,
    hintsShown: 0,
    check: null,
    celebrate: false,
    completed: LS.get('bb.completed', {} as Record<string, boolean>),
    toast: null,

    setMode(mode) {
      const s = get();
      if (mode === s.mode) return;
      const base = { mode, tool: 'select' as Tool, firstHole: null, selectedId: null, highlight: null, check: null, past: [] };
      if (mode === 'sandbox') {
        set({ ...base, panel: 'schematic', layout: LS.get('bb.layout.sandbox', emptyLayout()) });
      } else if (mode === 'learn' || mode === 'challenge') {
        const kind = mode === 'learn' ? 'lesson' : 'challenge';
        const keep = s.challenges.find((c) => c.id === s.activeId && c.kind === kind);
        const first = keep ?? s.challenges.find((c) => c.kind === kind && !s.completed[c.id]) ?? s.challenges.find((c) => c.kind === kind);
        set({ ...base, panel: 'task' });
        if (first) get().openChallenge(first.id);
        else set({ activeId: null, layout: emptyLayout() });
      } else set({ ...base });
    },
    setPanel(panel) {
      set({ panel });
    },
    setTool(tool) {
      set({ tool, firstHole: null, selectedId: tool === 'select' ? get().selectedId : null, panel: tool !== 'select' && tool !== 'probe' ? 'inspect' : get().panel });
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
      if (def.placement.kind === 'footprint') {
        const fp = def.placement.footprint(h);
        if (!fp) return get().notify('这里放不下：元件会超出面包板边缘');
        const clash = Object.values(fp).find((x) => occ.has(x));
        if (clash) return get().notify(`孔 ${clash} 已经被 ${occ.get(clash)} 占用了——一个孔只能插一只脚`);
        const part: PlacedPart = { id: newId(), ref: nextRef(s.layout, s.tool), type: s.tool, props, pins: fp };
        commit({ ...s.layout, parts: [...s.layout.parts, part] }, { selectedId: part.id });
        return;
      }
      if (occ.has(h)) return get().notify(`孔 ${h} 已经被 ${occ.get(h)} 占用了——一个孔只能插一只脚`);
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
        props: s.tool === 'wire' ? { ...props, wireColor: s.placingProps.wire?.wireColor ?? autoWireColor(s.firstHole, h) } : props,
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
      set({ selectedId, panel: selectedId ? 'inspect' : get().panel });
    },
    updateProps(id, p) {
      const s = get();
      commit({ ...s.layout, parts: s.layout.parts.map((x) => (x.id === id ? { ...x, props: { ...x.props, ...p } } : x)) });
    },
    togglePart(id) {
      const p = get().layout.parts.find((x) => x.id === id);
      if (!p) return;
      if (p.type === 'pushbutton') get().updateProps(id, { pressed: !p.props.pressed });
      if (p.type === 'switch') get().updateProps(id, { position: p.props.position === 'b' ? 'a' : 'b' });
    },
    removePart(id) {
      const s = get();
      commit({ ...s.layout, parts: s.layout.parts.filter((x) => x.id !== id) }, { selectedId: null });
    },
    undo() {
      const s = get();
      const prev = s.past[s.past.length - 1];
      if (!prev) return;
      LS.set(layoutKey(s.mode, s.activeId), prev);
      set({ layout: prev, past: s.past.slice(0, -1), check: null, selectedId: null });
    },
    clear() {
      commit(emptyLayout(), { selectedId: null });
    },
    loadLayout(l, remember = true) {
      const layout: Layout = { version: 1, parts: l.parts.map((p) => ({ ...p, id: newId(), props: { ...p.props }, pins: { ...p.pins } })) };
      if (remember) commit(layout, { selectedId: null });
      else set({ layout, past: [], check: null, selectedId: null });
    },
    setChallenges(challenges, invalid) {
      set({ challenges, invalid });
      const s = get();
      if ((s.mode === 'learn' || s.mode === 'challenge') && !challenges.some((c) => c.id === s.activeId)) {
        const kind = s.mode === 'learn' ? 'lesson' : 'challenge';
        const first = challenges.find((c) => c.kind === kind && !s.completed[c.id]) ?? challenges.find((c) => c.kind === kind);
        if (first) get().openChallenge(first.id);
      }
    },
    openChallenge(id) {
      const ch = get().challenges.find((c) => c.id === id);
      if (!ch) return;
      const saved = LS.get<Layout | null>(`bb.layout.ch.${id}`, null);
      const start = saved ?? ch.start ?? emptyLayout();
      set({
        activeId: id,
        mode: ch.kind === 'lesson' ? 'learn' : 'challenge',
        step: 0,
        hintsShown: 0,
        check: null,
        highlight: null,
        selectedId: null,
        firstHole: null,
        panel: 'task',
        past: [],
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
    setHighlight(highlight) {
      set({ highlight });
    },
    toggle(k) {
      set({ [k]: !get()[k] } as Partial<State>);
    },
    notify(toast) {
      set({ toast });
      if (toast) setTimeout(() => get().toast === toast && set({ toast: null }), 2800);
    },
  };
});

/** Red for wires touching a + rail, dark blue for − rails, otherwise a neutral colour. */
function autoWireColor(a: string, b: string): string {
  const rows = [HOLE_MAP.get(a)?.row, HOLE_MAP.get(b)?.row];
  if (rows.some((r) => r === 'tp' || r === 'bp')) return '#d62828';
  if (rows.some((r) => r === 'tn' || r === 'bn')) return '#1d3557';
  return '#2a9d8f';
}
