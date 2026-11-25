// W4-L5's shared stage helpers: hover wiring, the "lit" test, the small controls every layer uses,
// and the guided example's progress (stage param `ex75`: how many of its five steps are answered,
// 9 once it is finished — the layers hide Sadiku 7.5's numbers until they are found).

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import './w4l5.css';

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

/** Sadiku 7.5 guided example: 0 … 5 steps answered, 9 finished. */
export function useEx75Reveal(): number {
  const [r] = useStageParam('ex75', 0);
  return r;
}

export interface SegOption<T> {
  value: T;
  label: ReactNode;
  short?: ReactNode;
  hover?: string[];
  tone?: string;
}

/** A segmented radio control. */
export function Seg<T extends string | number>({
  label,
  value,
  options,
  onChange,
  small,
}: {
  label: string;
  value: T;
  options: SegOption<T>[];
  onChange: (v: T) => void;
  small?: boolean;
}) {
  return (
    <div className={`w45-seg ${small ? 'small' : ''}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={o.value === value}
          className={`${o.value === value ? 'on' : ''} ${o.tone ?? ''}`}
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

/** One readout cell; lights with its id. */
export function Cell({ id, name, value, tone, hint }: { id: string; name: ReactNode; value: ReactNode; tone?: string; hint?: string }) {
  const on = useIsLit()(id);
  return (
    <div className={`w45-cell ${tone ?? ''} ${on}`} data-hl={id} {...hoverProps([id])} tabIndex={0}>
      <span>{name}</span>
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );
}

/** a value the guided example has not found yet */
export const HIDDEN = '?';
