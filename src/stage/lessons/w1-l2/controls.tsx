// Controls shared by W1-L2's two workbenches: a slider with a number stepper, a toggle button,
// and the pointer handlers that link a stage object to the lesson text.

import { fmt } from './model';

type SetHover = (ids: string[] | null) => void;

/** Pointer handlers for a stage object with hover-map id `id`. */
export const hoverProps = (setHover: SetHover, id: string) => ({
  onPointerEnter: () => setHover([id]),
  onPointerLeave: () => setHover(null),
});

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const snap = (x: number, step: number) => Math.round(x / step) * step;

export function Knob(props: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  id?: string;
  lit?: string[];
  disabled?: boolean;
}) {
  const { label, unit, min, max, step, value, onChange, id, lit, disabled } = props;
  const set = (x: number) => {
    if (Number.isFinite(x)) onChange(Number(clamp(snap(x, step), min, max).toFixed(4)));
  };
  return (
    <label className={`l2w-knob ${id && lit?.includes(id) ? 'lit' : ''}`}>
      <span className="l2w-knob-l">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => set(Number(e.target.value))}
        aria-valuetext={`${fmt(value)} ${unit}`}
      />
      <span className="l2w-knob-n">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => e.target.value !== '' && set(Number(e.target.value))}
          aria-label={`${label}（${unit}）`}
        />
        <span>{unit}</span>
      </span>
    </label>
  );
}

export function Toggle(props: { label: string; state: string; on: boolean; onClick: () => void; id?: string; lit?: string[]; disabled?: boolean; title?: string }) {
  const { label, state, on, onClick, id, lit, disabled, title } = props;
  return (
    <button className={`l2w-toggle ${on ? 'on' : ''} ${id && lit?.includes(id) ? 'lit' : ''}`} aria-pressed={on} onClick={onClick} disabled={disabled} title={title}>
      <span>{label}</span>
      <b>{state}</b>
    </button>
  );
}

/** kWh readout: small energies in scientific notation. */
export function kwhText(kwh: number) {
  if (kwh === 0) return '0';
  if (Math.abs(kwh) >= 0.01) return fmt(kwh, 4);
  const e = Math.floor(Math.log10(Math.abs(kwh)));
  const m = kwh / 10 ** e;
  return (
    <>
      {fmt(m, 2)} × 10<sup>{String(e).replace('-', '−')}</sup>
    </>
  );
}
