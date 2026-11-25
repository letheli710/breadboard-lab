// Shared pieces of the W5-L5 layers (light 2D stage, CSS prefix w55-): layer ids, the stage params
// the acts and the guided example set, the hover / highlight helpers, and the controls every layer
// uses (segmented switch, slider, readout cell).

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import type { SrcKey, Wave } from './model';

export const L1 = '01';
export const L2 = '02';
export const L3 = '03';

/** stage params (acts, guided steps and the layer controls share them) */
export const P = {
  vm: 'w55_vm',
  im: 'w55_im',
  dth: 'w55_dth',
  neg: 'w55_neg',
  avg: 'w55_avg',
  wave: 'w55_wave',
  vp: 'w55_vp',
  v1: 'w55_v1',
  fold: 'w55_fold',
  src: 'w55_src',
  rl: 'w55_rl',
  xl: 'w55_xl',
  mode: 'w55_mode',
  /** guided example: steps solved (0 … 5); only read while the guided source is on the stage */
  g: 'w55_g',
} as const;

export type Mode = 'peak' | 'rms';

/** defaults: the sheet's control defaults (layer 03 starts on act 6's source, whose match is its default load) */
export const DEF = { vm: 120, im: 10, dth: 60, wave: 'sine' as Wave, vp: 170, v1: 5, src: 'a6' as SrcKey, rl: 3.2, xl: 2.4, mode: 'peak' as Mode };

export const useP = <T,>(key: string, fallback: T) => useStageParam<T>(key, fallback);

/** clear a hover left by an object of this layer when the layer goes away */
export function useClearHoverOnUnmount() {
  useEffect(() => () => useStage.getState().setHover(null), []);
}

/** props of a hover-map object: its class (lit when its id is lit) and the hover handlers */
export function useHot() {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  return (id: string, cls = '') => ({
    className: `w55-obj ${cls}${lit.includes(id) ? ' lit' : ''}`,
    onPointerEnter: () => setHover([id]),
    onPointerLeave: () => setHover(null),
  });
}

export interface SegOption<T> {
  value: T;
  label: ReactNode;
  short?: ReactNode;
}

export function Seg<T extends string | number | boolean>({ label, value, options, onChange }: { label: string; value: T; options: SegOption<T>[]; onChange: (v: T) => void }) {
  return (
    <div className="w55-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={o.value === value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.short ? (
            <>
              <span className="full">{o.label}</span>
              <span className="short">{o.short}</span>
            </>
          ) : (
            o.label
          )}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className={`w55-toggle${on ? ' on' : ''}`} aria-pressed={on} onClick={() => onChange(!on)}>
      {label}
    </button>
  );
}

export function Slider({
  id,
  name,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  digits = 1,
}: {
  id: string;
  name: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  digits?: number;
}) {
  const hot = useHot();
  const h = hot(id, 'w55-slider');
  return (
    <label className={h.className} onPointerEnter={h.onPointerEnter} onPointerLeave={h.onPointerLeave}>
      <span className="name">{typeof name === 'string' ? <Sub s={name} /> : name}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <b>
        {value.toFixed(digits).replace('-', '−')} {unit}
      </b>
    </label>
  );
}

/** one readout cell */
export function Cell({ id, name, value, tone = '', on = false }: { id: string; name: ReactNode; value: ReactNode; tone?: string; on?: boolean }) {
  const hot = useHot();
  const h = hot(id, `w55-cell ${tone}${on ? ' sel' : ''}`);
  return (
    <div {...h} tabIndex={0}>
      <span>{typeof name === 'string' ? <Sub s={name} /> : name}</span>
      <b>{value}</b>
    </div>
  );
}

/** "V_Th,rms" → V<sub>Th,rms</sub> (HTML) */
export function Sub({ s }: { s: string }) {
  const parts = s.split(/_([A-Za-z0-9,]+)/);
  return <>{parts.map((p, i) => (i % 2 === 1 ? <sub key={i}>{p}</sub> : p))}</>;
}

/** the same in SVG text */
export function SSub({ s }: { s: string }) {
  const parts = s.split(/_([A-Za-z0-9,]+)/);
  if (parts.length === 1) return <>{s}</>;
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <tspan key={i} dy={3} fontSize="0.78em">
            {p}
          </tspan>
        ) : i === 0 ? (
          p
        ) : (
          <tspan key={i} dy={-3}>
            {p || '​'}
          </tspan>
        ),
      )}
    </>
  );
}
