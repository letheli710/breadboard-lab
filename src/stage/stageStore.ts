// State of the stage on a stage lesson page: which act drives it, whether the student has
// taken the lens bar over by hand, the stage settings (layer, X-ray, multimeter mode, camera)
// and the hover link between the text and the stage objects.

import { create } from 'zustand';
import type { DmmMode, StageLayerId, StageSync } from './types';

interface StageState {
  /** the act (or quiz item) whose settings the stage follows: "act-2", "q-w1l0_q1" */
  activeKey: string | null;
  /** the student picked a layer on the lens bar: scrolling no longer switches the layer */
  manual: boolean;
  layer: StageLayerId;
  xray: number;
  dmm: DmmMode;
  camera: NonNullable<StageSync['camera']>;
  /** ids the active act lights */
  halo: string[];
  /** ids under the pointer (text term or stage object); wins over the halo */
  hover: string[] | null;
  /** the multimeter's fuse has blown (the wrong set-up was tried) */
  fuseBlown: boolean;
  follow(key: string, sync: Partial<StageSync>): void;
  pickLayer(layer: StageLayerId): void;
  resumeAuto(): void;
  setXray(v: number): void;
  setDmm(m: DmmMode): void;
  setHover(ids: string[] | null): void;
  setFuse(b: boolean): void;
  reset(): void;
}

const INITIAL = {
  activeKey: null,
  manual: false,
  layer: 'bb_xray' as StageLayerId,
  xray: 0.75,
  dmm: 'voltage' as DmmMode,
  camera: 'focus' as NonNullable<StageSync['camera']>,
  halo: [] as string[],
  hover: null,
  fuseBlown: false,
};

/** Remembered sync of each act, so "back to auto" can re-apply the act on screen. */
const syncOf = new Map<string, Partial<StageSync>>();

export const useStage = create<StageState>()((set, get) => ({
  ...INITIAL,
  follow(key, sync) {
    syncOf.set(key, sync);
    const s = get();
    if (s.activeKey === key) return;
    const next: Partial<StageState> = { activeKey: key, halo: sync.halo ?? [], hover: null };
    if (!s.manual && sync.layer) next.layer = sync.layer;
    if (sync.xray !== undefined) next.xray = sync.xray;
    if (sync.camera) next.camera = sync.camera;
    if (sync.dmm) {
      next.dmm = sync.dmm;
      next.fuseBlown = false;
    }
    set(next);
  },
  pickLayer(layer) {
    set({ layer, manual: true });
  },
  resumeAuto() {
    const s = get();
    const sync = s.activeKey ? syncOf.get(s.activeKey) : undefined;
    set({ manual: false, ...(sync?.layer ? { layer: sync.layer } : {}) });
  },
  setXray(xray) {
    set({ xray: Math.min(1, Math.max(0, xray)) });
  },
  setDmm(dmm) {
    set({ dmm });
  },
  setHover(hover) {
    set({ hover: hover && hover.length ? hover : null });
  },
  setFuse(fuseBlown) {
    set({ fuseBlown });
  },
  reset() {
    syncOf.clear();
    set(INITIAL);
  },
}));

/** Ids lit on the stage right now: the hovered ones, else the active act's. */
export const useLit = (): string[] => useStage((s) => s.hover ?? s.halo);
