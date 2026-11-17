// Workbench interface state that is not part of the circuit: the details popover beside a part,
// the right-click menu, the eraser's hover, the toolbox and side-panel layout and the "recent
// parts" strip. Layout preferences are remembered per browser.

import { create } from 'zustand';
import { PARTS } from '../core/parts';
import type { PartType } from '../core/types';
import { readStored, writeStored } from './persist';
import { isPartTool, useStore } from './store';

export interface BenchMenu {
  /** client coordinates of the right click */
  x: number;
  y: number;
  /** part under the pointer, or null (empty space) */
  partId: string | null;
}

interface BenchUi {
  /** part whose details popover is open */
  popoverId: string | null;
  menu: BenchMenu | null;
  /** eraser: the part under the pointer (tinted) */
  eraseHover: string | null;
  /** the toolbox column is shown */
  kit: boolean;
  /** side panel width set by dragging the splitter (px); null = the layout's default */
  sideW: number | null;
  sideCollapsed: boolean;
  /** recently used part tools, most recent first (5) */
  recent: PartType[];
  openPopover(id: string | null): void;
  openMenu(m: BenchMenu | null): void;
  setEraseHover(id: string | null): void;
  setKit(v: boolean): void;
  setSide(w: number | null, collapsed: boolean): void;
}

export const RECENT_N = 5;
const DEFAULT_RECENT: PartType[] = ['wire', 'resistor', 'led', 'battery', 'capacitor'];
const isPart = (v: unknown): v is PartType => typeof v === 'string' && Object.prototype.hasOwnProperty.call(PARTS, v);

export const useBenchUi = create<BenchUi>((set) => ({
  popoverId: null,
  menu: null,
  eraseHover: null,
  kit: readStored('bb.bench.kit', true, (v) => (typeof v === 'boolean' ? v : undefined)),
  sideW: readStored<number | null>('bb.bench.sideW', null, (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 && v < 4000 ? v : undefined)),
  sideCollapsed: readStored('bb.bench.sideCollapsed', false, (v) => (typeof v === 'boolean' ? v : undefined)),
  recent: readStored<PartType[]>('bb.bench.recent', DEFAULT_RECENT, (v) => (Array.isArray(v) && v.every(isPart) ? [...new Set(v as PartType[])].slice(0, RECENT_N) : undefined)),
  openPopover: (popoverId) => set({ popoverId, menu: null }),
  openMenu: (menu) => set({ menu }),
  setEraseHover: (eraseHover) => set({ eraseHover }),
  setKit: (kit) => {
    writeStored('bb.bench.kit', kit);
    set({ kit });
  },
  setSide: (sideW, sideCollapsed) => {
    writeStored('bb.bench.sideW', sideW);
    writeStored('bb.bench.sideCollapsed', sideCollapsed);
    set({ sideW, sideCollapsed });
  },
}));

/** Parts whose click operates them (press a button, flip a switch): their details open from the
 *  right-click menu, not on every click. */
export const OPERATED = new Set<PartType>(['pushbutton', 'switch']);

// Follow the main store: a part tool picked joins the recent strip (a new one replaces the least
// recently used, the others keep their places so the strip doesn't reshuffle under the cursor);
// a part just placed opens its details (not wires: there is little to set); the popover and the
// eraser hover close when their part is gone or deselected.
useStore.subscribe((s, prev) => {
  const ui = useBenchUi.getState();
  if (s.tool !== prev.tool && isPartTool(s.tool) && !ui.recent.includes(s.tool)) {
    const recent = [s.tool, ...ui.recent].slice(0, RECENT_N);
    writeStored('bb.bench.recent', recent);
    useBenchUi.setState({ recent });
  }
  if (s.placedId && s.placedId !== prev.placedId) {
    const p = s.layout.parts.find((x) => x.id === s.placedId);
    useBenchUi.setState({ popoverId: p && p.type !== 'wire' ? p.id : null, menu: null });
  }
  if (ui.popoverId && (s.selectedId !== ui.popoverId || !s.layout.parts.some((p) => p.id === ui.popoverId))) useBenchUi.setState({ popoverId: null });
  if (s.tool !== prev.tool && s.tool !== 'eraser' && ui.eraseHover) useBenchUi.setState({ eraseHover: null });
  if (s.mode !== prev.mode || s.activeId !== prev.activeId) useBenchUi.setState({ popoverId: null, menu: null });
});
