// W3-L1's small layer helpers (no three.js): hover handlers, the lit test, a segmented control,
// a toggle, a slider and a read-out cell, all in the light stage style (w3l1.css).

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import type { ChipKind } from './model';
import './w3l1.css';

/** Pointer / focus handlers that light `ids` on the stage and in the text. */
export function hoverProps(ids: string[]) {
  const { setHover } = useStage.getState();
  return {
    onPointerEnter: () => setHover(ids),
    onPointerLeave: () => setHover(null),
    onFocus: () => setHover(ids),
    onBlur: () => setHover(null),
  };
}

/** Clear a hover left behind when a layer unmounts under the pointer. */
export function useClearHoverOnUnmount() {
  useEffect(() => () => useStage.getState().setHover(null), []);
}

/** `lit` class for an object whose id (or one of its ids) is lit */
export function useIsLit() {
  const lit = useLit();
  return (...ids: string[]) => (ids.some((id) => lit.includes(id)) ? 'lit' : '');
}

/** the guided example hides the numbers it asks for (stage param `mask`) */
export const useMask = () => useStageParam('mask', false)[0];

/** the chip shown by layers 01 and 03 (stage param `chip`) */
export const useChip = () => useStageParam<ChipKind>('chip', 'lm358');

export interface SegOption<T extends string> {
  value: T;
  label: string;
  /** label on a phone */
  short?: string;
  /** stage ids lit while the pointer is on the option */
  ids?: string[];
}

export function Seg<T extends string>({ value, options, onChange, label, tone }: { value: T; options: SegOption<T>[]; onChange: (v: T) => void; label: string; tone?: string }) {
  return (
    <div className={`w3-seg ${tone ?? ''}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          className={value === o.value ? 'on' : ''}
          onClick={() => onChange(o.value)}
          {...(o.ids ? hoverProps(o.ids) : {})}
        >
          <span className="full">{o.label}</span>
          <span className="short">{o.short ?? o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label, short, ids }: { on: boolean; onChange: (v: boolean) => void; label: string; short?: string; ids?: string[] }) {
  return (
    <button className={`w3-toggle ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => onChange(!on)} {...(ids ? hoverProps(ids) : {})}>
      <i aria-hidden />
      <span className="full">{label}</span>
      <span className="short">{short ?? label}</span>
    </button>
  );
}

export function Slider({
  label,
  short,
  value,
  min,
  max,
  step,
  onChange,
  text,
  ids,
}: {
  label: string;
  short?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  /** the value as shown */
  text: string;
  ids?: string[];
}) {
  return (
    <label className="w3-slider" {...(ids ? hoverProps(ids) : {})}>
      <span className="w3-slider-label">
        <span className="full">{label}</span>
        <span className="short">{short ?? label}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} aria-valuetext={text} />
      <b>{text}</b>
    </label>
  );
}

export function Cell({ id, name, value, cls = '', small }: { id?: string; name: ReactNode; value: ReactNode; cls?: string; small?: ReactNode }) {
  const on = useIsLit();
  return (
    <div className={`w3-cell ${cls} ${id ? on(id) : ''}`} {...(id ? { ...hoverProps([id]), tabIndex: 0, 'data-hl': id } : {})}>
      <span>{name}</span>
      <b>{value}</b>
      {small && <small>{small}</small>}
    </div>
  );
}
