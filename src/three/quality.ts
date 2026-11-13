// Render quality of the 3D scene. "auto" picks low quality on weak devices (few CPU cores /
// little memory, or a slow first few frames); the toolbar toggle overrides it and is remembered.
//   high: shadow map 2048², device pixel ratio up to 2
//   low:  shadow map 1024², device pixel ratio up to 1.5

import { create } from 'zustand';

export type QualitySetting = 'auto' | 'high' | 'low';
const KEY = 'bb.quality';

function readSetting(): QualitySetting {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'high' || v === 'low' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

/** Device heuristic for "auto": ≤ 4 logical cores or ≤ 4 GB memory. */
export function weakDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return (typeof cores === 'number' && cores > 0 && cores <= 4) || (typeof mem === 'number' && mem <= 4);
}

interface QualityState {
  setting: QualitySetting;
  /** "auto" resolved to low (weak device or slow frames) */
  autoLow: boolean;
  setSetting(q: QualitySetting): void;
  reportSlowFrames(): void;
}

export const useQuality = create<QualityState>((set) => ({
  setting: readSetting(),
  autoLow: weakDevice(),
  setSetting(setting) {
    try {
      if (setting === 'auto') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, setting);
    } catch {
      /* storage unavailable */
    }
    set({ setting });
  },
  reportSlowFrames() {
    set({ autoLow: true });
  },
}));

export const isLow = (s: Pick<QualityState, 'setting' | 'autoLow'>) => s.setting === 'low' || (s.setting === 'auto' && s.autoLow);
export const useLowQuality = () => useQuality(isLow);

export const qualityParams = (low: boolean) => ({
  shadowMapSize: low ? 1024 : 2048,
  dpr: (low ? [1, 1.5] : [1, 2]) as [number, number],
});
