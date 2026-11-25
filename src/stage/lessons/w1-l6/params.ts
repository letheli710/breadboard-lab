// W1-L6's stage params (stageStore params): one key per setting, so acts, guided steps and the
// layers' own controls share them. Every act sets the whole set (stageParams), so scrolling back to
// an act always restores its stage.

import { useStage, useStageParam } from '../../stageStore';
import type { Circuit, Dir, ElemId, NodeId } from './model';

export type Mode = 'loop' | 'sources';

export interface L6Params {
  l6_v1: number;
  l6_v2: number;
  l6_r1: number;
  l6_r2: number;
  /** polarity markings flipped against the lesson circuit */
  l6_flip: Record<ElemId, boolean>;
  /** layer 01: the probe is at PATH[step] (0 … 4) */
  l6_step: number;
  /** layer 01: reference node */
  l6_gnd: NodeId;
  /** layer 02: single-loop inspector or the series / parallel source bench */
  l6_mode: Mode;
  l6_dir: Dir;
  /** layer 02: elements crossed so far (0 … 4) */
  l6_walk: number;
  /** layer 02: show values (off while a question is open, so the stage doesn't give the answer away) */
  l6_nums: boolean;
  /** layer 02 series stack: + up for V1, V2, V3 */
  l6_sup: boolean[];
  /** layer 02: the parallel test switch is closed */
  l6_par: boolean;
  /** layer 02: value of the second source in the parallel test (5 V, or 9 V for the allowed case) */
  l6_parv: number;
}

export const NO_FLIP: Record<ElemId, boolean> = { v1: false, r1: false, v2: false, r2: false };

export const DEFAULTS: L6Params = {
  l6_v1: 20,
  l6_v2: 5,
  l6_r1: 2,
  l6_r2: 3,
  l6_flip: NO_FLIP,
  l6_step: 0,
  l6_gnd: 'D',
  l6_mode: 'loop',
  l6_dir: 'cw',
  l6_walk: 4,
  l6_nums: false,
  l6_sup: [true, true, false],
  l6_par: false,
  l6_parv: 5,
};

/** The full param set for an act: the lesson circuit with a few settings changed. */
export const stageParams = (over: Partial<L6Params> = {}): Record<string, unknown> => ({ ...DEFAULTS, ...over });

export function useL6<K extends keyof L6Params>(key: K): [L6Params[K], (v: L6Params[K]) => void] {
  return useStageParam<L6Params[K]>(key, DEFAULTS[key]);
}

/** Current value of a param outside React (timers). */
export function readL6<K extends keyof L6Params>(key: K): L6Params[K] {
  const v = useStage.getState().params[key] as L6Params[K] | undefined;
  return v === undefined ? DEFAULTS[key] : v;
}

export function useCircuit(): Circuit {
  const [V1] = useL6('l6_v1');
  const [V2] = useL6('l6_v2');
  const [R1] = useL6('l6_r1');
  const [R2] = useL6('l6_r2');
  const [flip] = useL6('l6_flip');
  return { V1, V2, R1, R2, flip };
}

/** Pointer handlers that light a stage id (and the linked text) while hovered. */
export const hoverProps = (id: string) => ({
  onPointerEnter: () => useStage.getState().setHover([id]),
  onPointerLeave: () => useStage.getState().setHover(null),
});
