// W3-L4's shared stage helpers: hover wiring, the "lit" test, and the supply switch every layer
// shows (±9 V dual / single +9 V: one stage param, so the schematic and the breadboard agree).

import { useEffect } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import type { Supply } from './model';
import './w3l4.css';

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

export function useSupply(): [Supply, (s: Supply) => void] {
  return useStageParam<Supply>('supply', 'dual');
}

/** Guided example 5.5: how far it has got (0 nothing found … 4 v_o found; 9 finished). */
export function useEx55Reveal(): number {
  const [r] = useStageParam('ex55', 0);
  return r;
}

export function SupplySeg() {
  const [s, set] = useSupply();
  return (
    <div className="w34-seg" role="radiogroup" aria-label="供电方式" {...hoverProps(['psu'])}>
      <button role="radio" aria-checked={s === 'dual'} className={s === 'dual' ? 'on' : ''} onClick={() => set('dual')}>
        <span className="full">±9 V 双电源</span>
        <span className="short">±9 V</span>
      </button>
      <button role="radio" aria-checked={s === 'single'} className={s === 'single' ? 'on warn' : ''} onClick={() => set('single')}>
        <span className="full">单 +9 V</span>
        <span className="short">+9 V</span>
      </button>
    </div>
  );
}

/** A readout cell: name, value, optional hint; lights with its id. */
export function Cell({ id, name, short, value, hint, cls = '' }: { id: string; name: string; short?: string; value: string; hint?: string; cls?: string }) {
  const on = useIsLit()(id);
  return (
    <div className={`w34-cell ${cls} ${on}`} data-hl={id} {...hoverProps([id])} tabIndex={0}>
      {short ? (
        <span>
          <span className="full">{name}</span>
          <span className="short">{short}</span>
        </span>
      ) : (
        <span>{name}</span>
      )}
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );
}
