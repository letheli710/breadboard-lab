// W4-L1's shared stage helpers: hover wiring, the "lit" test, a segmented control, a slider and a
// readout cell that every layer uses.

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage } from '../../stageStore';
import './w4l1.css';

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

export interface SegOption<T> {
  value: T;
  label: ReactNode;
  short?: ReactNode;
  hover?: string[];
  disabled?: boolean;
  warn?: boolean;
}

/** A segmented radio control. */
export function Seg<T extends string | number | boolean>({ label, value, options, onChange }: { label: string; value: T; options: SegOption<T>[]; onChange: (v: T) => void }) {
  return (
    <div className="w41-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={o.value === value}
          className={`${o.value === value ? 'on' : ''} ${o.warn && o.value === value ? 'warn' : ''}`}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          {...(o.hover ? hoverProps(o.hover) : {})}
        >
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

/** A labelled range slider. */
export function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  text,
}: {
  id: string;
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  text: string;
}) {
  const on = useIsLit()(id);
  return (
    <label className={`w41-slider ${on}`} {...hoverProps([id])}>
      <span className="w41-slider-label">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="w41-num">{text}</span>
    </label>
  );
}

/** One readout cell. */
export function Cell({ id, name, value, tone, hint }: { id: string; name: ReactNode; value: ReactNode; tone?: string; hint?: string }) {
  const on = useIsLit()(id);
  return (
    <div className={`w41-cell ${tone ?? ''} ${on}`} data-hl={id} {...hoverProps([id])} tabIndex={0}>
      <span>{name}</span>
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );
}
