// W3-L8's shared stage state: one DAC (code, V_ref, R_f) and one instrumentation amplifier (R_G,
// preset, inputs) in the stage params, so the three layers, the acts and the guided example see
// the same circuit. Also the hover helpers and the small controls every layer uses.

import { useEffect, type ReactNode } from 'react';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { codeStr, dac, ia, IA_EX, IA_GD, RG_RANGE, type Dac, type IaSol, type Rf, type Vref } from './model';
import './w3l8.css';

export type Topo = 'dac' | 'ia';
export type IaPreset = 'ex' | 'gd';
export type IaInput = 'diff' | 'cm';

export interface Lab {
  topo: Topo;
  code: number;
  vref: Vref;
  rf: Rf;
  d: Dac;
  /** instrumentation amplifier */
  preset: IaPreset;
  input: IaInput;
  rg: number;
  /** guided example in progress: what has been found so far (0 nothing, 1 the 50 mV across R_G,
   *  2 the first-stage formula, 3 A_v1 = 51, 4 R_G = 1 kΩ; 9 all) — the stage hides the rest */
  reveal: number;
  a: IaSol;
  set: (p: Record<string, unknown>) => void;
}

export function useLab(): Lab {
  const [topo] = useStageParam<Topo>('topo', 'dac');
  const [code] = useStageParam('code', 0);
  const [vref] = useStageParam<Vref>('vref', 1);
  const [rf] = useStageParam<Rf>('rf', 10_000);
  const [preset] = useStageParam<IaPreset>('ia', 'ex');
  const [input] = useStageParam<IaInput>('iaIn', 'diff');
  const [rgRaw] = useStageParam('rg', 10_000);
  const [revealRaw] = useStageParam('iaReveal', 9);
  const set = useStage((s) => s.setParams);
  const reveal = preset === 'gd' ? revealRaw : 9;
  const base = preset === 'gd' ? IA_GD : IA_EX;
  // while the guided example runs, R_G sits at its answer (shown only once found)
  const rg = preset === 'gd' && reveal < 9 ? 1_000 : Math.min(RG_RANGE[1], Math.max(RG_RANGE[0], rgRaw));
  const v2 = input === 'cm' && preset === 'ex' ? base.v1 : base.v2;
  const a = ia({ R: base.R, R1: base.R1, R2: base.R2, RG: rg, v1: base.v1, v2 });
  return { topo, code, vref, rf, d: dac(code, vref, rf), preset, input, rg, reveal, a, set };
}

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
}

/** A segmented radio control. */
export function Seg<T extends string | number>({
  label,
  value,
  options,
  onChange,
  small,
  disabled,
}: {
  label: string;
  value: T;
  options: SegOption<T>[];
  onChange: (v: T) => void;
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={`w38-seg ${small ? 'small' : ''}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={o.value === value}
          className={o.value === value ? 'on' : ''}
          disabled={disabled}
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

/** The four bit switches b1 (MSB) … b4 (LSB) as toggle buttons, with the code and D. */
export function BitSwitches({ lab }: { lab: Lab }) {
  const on = useIsLit();
  const flip = (k: number) => lab.set({ code: lab.code ^ (8 >> k) });
  return (
    <div className="w38-bits" role="group" aria-label="4 位数字码 b1–b4（b1 为最高位）">
      {lab.d.bits.map((b, k) => (
        <button
          key={k}
          className={`w38-bit ${b ? 'on' : ''} ${on(`dac_b${k + 1}`)}`}
          aria-pressed={!!b}
          aria-label={`b${k + 1} = ${b}`}
          onClick={() => flip(k)}
          {...hoverProps([`dac_b${k + 1}`])}
        >
          <small>b{k + 1}</small>
          {b}
        </button>
      ))}
      <span className="w38-code">
        <b>{codeStr(lab.code)}</b>
        <span>D = {lab.code}</span>
      </span>
    </div>
  );
}

/** The DAC's V_ref and R_f switches. */
export function DacKnobs({ lab }: { lab: Lab }) {
  return (
    <>
      <Seg<Vref>
        label="参考电压 Vref"
        small
        value={lab.vref}
        onChange={(v) => lab.set({ vref: v })}
        options={[
          { value: 1, label: 'Vref 1.0 V', short: '1 V', hover: ['dac_vref'] },
          { value: 5, label: 'Vref 5.0 V', short: '5 V', hover: ['dac_vref'] },
        ]}
      />
      <Seg<Rf>
        label="反馈电阻 Rf"
        small
        value={lab.rf}
        onChange={(v) => lab.set({ rf: v })}
        options={[
          { value: 10_000, label: 'Rf 10 kΩ', short: '10k', hover: ['dac_rf'] },
          { value: 4_000, label: 'Rf 4 kΩ', short: '4k', hover: ['dac_rf'] },
        ]}
      />
    </>
  );
}

/** One readout cell. */
export function Cell({ id, name, value, tone, hint }: { id: string; name: ReactNode; value: ReactNode; tone?: string; hint?: string }) {
  const on = useIsLit()(id);
  return (
    <div className={`w38-cell ${tone ?? ''} ${on}`} data-hl={id} {...hoverProps([id])} tabIndex={0}>
      <span>{name}</span>
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );
}
