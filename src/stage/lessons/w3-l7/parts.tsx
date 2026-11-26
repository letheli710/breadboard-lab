// Shared pieces of the W3-L7 layers (light stage, class prefix w37-): layer ids, colours, the
// hover-map wrapper, schematic symbols (op amp, resistor box, ground, node bubble) and the small
// HTML controls (segmented switch, slider, readout chip).

import type { ReactNode } from 'react';
import { useLit, useStage } from '../../stageStore';

export const L1 = 'layer_01';
export const L2 = 'layer_02';
export const L3 = 'layer_03';

export const C = {
  ink: '#1f2a44',
  wire: '#334155',
  muted: '#5f626b',
  gnd: '#475569',
  red: '#dc2626',
  redT: '#b91c1c',
  redSoft: '#fee2e2',
  teal: '#0d9488',
  tealT: '#0f766e',
  tealSoft: '#ccfbf1',
  amber: '#d97706',
  amberT: '#b45309',
  blue: '#2563eb',
  blueT: '#1d4ed8',
  purple: '#9333ea',
  purpleT: '#7e22ce',
  green: '#16a34a',
  greenT: '#15803d',
};

/** per-stage colours: U₁ blue, U₂ green, U₃ purple */
export const STAGE_COL = [
  { line: '#1e40af', text: '#1e40af', soft: '#eff6ff' },
  { line: '#15803d', text: '#15803d', soft: '#f0fdf4' },
  { line: '#7e22ce', text: '#7e22ce', soft: '#faf5ff' },
];

export function useHotProps(ids: string[]) {
  const setHover = useStage((s) => s.setHover);
  return { onPointerEnter: () => setHover(ids), onPointerLeave: () => setHover(null) };
}

/** A hover-map object on the stage: an amber halo when its id is lit; pointer enter sets the hover. */
export function Obj({ id, box, children }: { id: string; box: [number, number, number, number]; children: ReactNode }) {
  const lit = useLit().includes(id);
  const hot = useHotProps([id]);
  const [x, y, w, h] = box;
  return (
    <g className={`w37-obj ${lit ? 'lit' : ''}`} {...hot}>
      <rect className="w37-halo" x={x} y={y} width={w} height={h} rx={8} />
      <rect className="w37-hit" x={x} y={y} width={w} height={h} />
      {children}
    </g>
  );
}

/** an HTML element linked to a hover-map id */
export function useHot(id: string) {
  const lit = useLit().includes(id);
  return { lit, on: useHotProps([id]) };
}

export function Wire({ pts, color = C.wire, width = 2, dashed }: { pts: [number, number][]; color?: string; width?: number; dashed?: boolean }) {
  return (
    <polyline
      points={pts.map((p) => p.join(',')).join(' ')}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeDasharray={dashed ? '6 4' : undefined}
    />
  );
}

/** a resistor box, horizontal (w > h) or vertical, with its value */
export function Res({ x, y, w, h, label, color = C.ink, side }: { x: number; y: number; w: number; h: number; label: string; color?: string; side?: 'left' | 'right' }) {
  const vertical = h > w;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill="#fff" stroke={color} strokeWidth={1.7} />
      {vertical ? (
        <text x={side === 'left' ? x - 5 : x + w + 5} y={y + h / 2 + 4} className="w37-rv" textAnchor={side === 'left' ? 'end' : 'start'}>
          {label}
        </text>
      ) : (
        <text x={x + w / 2} y={y + h / 2 + 4} className="w37-rv" textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

export function Ground({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={C.gnd} strokeLinecap="round">
      <line x1={x - 10} y1={y} x2={x + 10} y2={y} strokeWidth={2} />
      <line x1={x - 6} y1={y + 4.5} x2={x + 6} y2={y + 4.5} strokeWidth={1.6} />
      <line x1={x - 2.5} y1={y + 9} x2={x + 2.5} y2={y + 9} strokeWidth={1.4} />
    </g>
  );
}

/** op-amp triangle: inputs on the left at y − 14 (`top`) and y + 14, output tip at (x + w, y) */
export function OpAmp({
  x,
  y,
  w = 50,
  top,
  color,
  fill = '#fff',
  name,
  sat,
}: {
  x: number;
  y: number;
  w?: number;
  top: '+' | '−';
  color: string;
  fill?: string;
  name: string;
  sat?: boolean;
}) {
  const h = 30;
  return (
    <g>
      <polygon
        points={`${x},${y - h} ${x},${y + h} ${x + w},${y}`}
        fill={sat ? '#fef2f2' : fill}
        stroke={sat ? C.red : color}
        strokeWidth={sat ? 2.6 : 2.1}
        strokeLinejoin="round"
      />
      <text x={x + 5} y={y - 10} className="w37-pin" fill={sat ? C.redT : color}>
        {top}
      </text>
      <text x={x + 5} y={y + 19} className="w37-pin" fill={sat ? C.redT : color}>
        {top === '+' ? '−' : '+'}
      </text>
      <text x={x + 18} y={y + 4} className="w37-uname" fill={sat ? C.redT : color}>
        {name}
      </text>
    </g>
  );
}

/** a rounded value bubble centred at (x, y) */
export function Bubble({ x, y, text, color, bg, w }: { x: number; y: number; text: string; color: string; bg: string; w?: number }) {
  const width = w ?? Math.max(44, text.length * 6.6 + 16);
  return (
    <g>
      <rect x={x - width / 2} y={y - 11} width={width} height={22} rx={11} fill={bg} stroke={color} strokeWidth={1.2} />
      <text x={x} y={y + 4} className="w37-bub" textAnchor="middle" fill={color}>
        {text}
      </text>
    </g>
  );
}

export function Seg<T extends string>({
  label,
  value,
  options,
  onPick,
  disabled,
  hot,
}: {
  label: string;
  value: T;
  options: { v: T; text: string; short?: string }[];
  onPick: (v: T) => void;
  disabled?: boolean;
  hot?: string;
}) {
  const h = useHot(hot ?? '');
  return (
    <div className={`w37-seg ${hot && h.lit ? 'lit' : ''}`} role="radiogroup" aria-label={label} {...(hot ? h.on : {})}>
      {options.map((o) => (
        <button key={o.v} role="radio" aria-checked={value === o.v} className={value === o.v ? 'on' : ''} disabled={disabled} onClick={() => onPick(o.v)}>
          <span className="full">{o.text}</span>
          <span className="short">{o.short ?? o.text}</span>
        </button>
      ))}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  show,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  show: string;
  disabled?: boolean;
}) {
  return (
    <label className={`w37-slider ${disabled ? 'off' : ''}`}>
      <span>{label}</span>
      <b>{show}</b>
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

/** a telemetry chip, optionally linked to a hover-map id */
export function Chip({ k, v, tone, id }: { k: string; v: string; tone?: 'ok' | 'bad' | 'hid' | 'info'; id?: string }) {
  const h = useHot(id ?? '');
  return (
    <span className={`w37-chip ${tone ?? ''} ${id && h.lit ? 'lit' : ''}`} {...(id ? h.on : {})}>
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </span>
  );
}
