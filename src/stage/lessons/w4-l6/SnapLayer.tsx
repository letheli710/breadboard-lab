// W4-L6 layers 01 / 02 / 03: one circuit in one snapshot (t = 0⁻, 0⁺, ∞). Controls: the circuit
// (act 2's symbolic demo, example 1 of act 3, example 2 of act 4, the guided example of act 5) and
// the view (the snapshot's equivalent circuit, or the waveforms around t = 0 with the snapshot
// marked). Under the drawing, the snapshot's outputs: 01 v_C(0⁻), i_L(0⁻); 02 i_C(0⁺), v_L(0⁺)
// and the two derivatives; 03 v_C(∞), i_L(∞). The guided example's numbers stay covered until the
// example reaches them (stage param w46_g = steps solved) or the student asks.

import type { ReactNode } from 'react';
import { TopoE1, TopoE2, TopoG, type Show } from './Circuits';
import { CIRCUITS, bounds, fmt, type Bounds, type Moment, type Preset } from './model';
import { HSubs, useClearHoverOnUnmount, useGuided, useHot, usePreset, useView } from './parts';
import Wave from './Wave';
import './w4l6.css';

const PRESETS: { id: Preset; label: string; short: string }[] = [
  { id: 'demo', label: '符号演示', short: '符号' },
  { id: 'ex1', label: '例题一', short: '例一' },
  { id: 'ex2', label: '例题二', short: '例二' },
  { id: 'guided', label: '引导例题', short: '引导' },
];

const B: Record<Exclude<Preset, 'demo'>, Bounds> = {
  ex1: bounds(CIRCUITS.ex1),
  ex2: bounds(CIRCUITS.ex2),
  guided: bounds(CIRCUITS.guided),
};

const MOMENT_NOTE: Record<Moment, string> = {
  pre: 't = 0⁻：开关未动作 · C 开路 · L 短路',
  zero: 't = 0⁺：开关已动作 · C → 电压源 · L → 电流源',
  inf: 't = ∞：开关保持新位置 · C 开路 · L 短路',
};

interface Cell {
  id: string;
  label: string;
  text: string;
}

function cells(m: Moment, b: Bounds | null, show: Show): Cell[] {
  const v = (x: number | undefined, unit: string, on: boolean, sym: string) => (show.sym || !b || x === undefined ? sym : on ? `${fmt(x, 2)} ${unit}` : `? ${unit}`);
  if (m === 'pre')
    return [
      { id: 'ro_vc0', label: 'v_C(0⁻) = v_C(0⁺)', text: v(b?.vC0, 'V', show.pre, 'C 开路端电压') },
      { id: 'ro_il0', label: 'i_L(0⁻) = i_L(0⁺)', text: v(b?.iL0, 'A', show.pre, 'L 短路支路电流') },
      { id: 'cap_open', label: 'i_C(0⁻)', text: '0 A（开路）' },
      { id: 'ind_short', label: 'v_L(0⁻)', text: '0 V（短路）' },
    ];
  if (m === 'zero')
    return [
      { id: 'ro_ic', label: 'i_C(0⁺)', text: v(b?.iC0p, 'A', show.jump, '流入“+”端') },
      { id: 'ro_vl', label: 'v_L(0⁺)', text: v(b?.vL0p, 'V', show.jump, '电流流入端为“+”') },
      { id: 'ro_dvc', label: 'dv_C(0⁺)/dt', text: v(b?.dvC, 'V/s', show.jump && show.fin, 'i_C(0⁺)/C') },
      { id: 'ro_dil', label: 'di_L(0⁺)/dt', text: v(b?.diL, 'A/s', show.jump && show.fin, 'v_L(0⁺)/L') },
    ];
  return [
    { id: 'ro_vcinf', label: 'v_C(∞)', text: v(b?.vCinf, 'V', show.fin, 'C 开路端电压') },
    { id: 'ro_ilinf', label: 'i_L(∞)', text: v(b?.iLinf, 'A', show.fin, 'L 短路支路电流') },
  ];
}

function Snap({ m }: { m: Moment }) {
  useClearHoverOnUnmount();
  const [preset, setPreset] = usePreset();
  const [view, setView] = useView();
  const [g, setG] = useGuided();
  const b = preset === 'demo' ? null : B[preset];
  const isG = preset === 'guided';
  // guided example: steps solved → 1: the 0⁻ values, 2: the replacement sources, 3: i_C, v_L at 0⁺,
  // 4: the derivatives, 5: the final values and the waveforms
  const seen = (n: number) => !isG || g >= n;
  const show: Show = { sym: preset === 'demo', pre: seen(1), kind: seen(2), jump: seen(3), fin: m === 'zero' ? seen(4) : seen(5) };
  const masked = isG && g < 5;
  const wave = view === 'wave';
  const waveOk = b !== null && !masked;

  let drawing: ReactNode;
  if (preset === 'ex1') drawing = <TopoE1 m={m} b={b} show={show} />;
  else if (preset === 'ex2') drawing = <TopoE2 m={m} b={b} show={show} />;
  else drawing = <TopoG m={m} b={b} show={show} />;

  return (
    <div className="w46-layer">
      <div className="w46-controls">
        <div className="w46-seg" role="radiogroup" aria-label="电路">
          {PRESETS.map((p) => (
            <button key={p.id} role="radio" aria-checked={preset === p.id} className={preset === p.id ? 'on' : ''} onClick={() => setPreset(p.id)}>
              <span className="full">{p.label}</span>
              <span className="short">{p.short}</span>
            </button>
          ))}
        </div>
        <div className="w46-seg" role="radiogroup" aria-label="视图">
          <button role="radio" aria-checked={!wave} className={!wave ? 'on' : ''} onClick={() => setView('circuit')}>
            <span className="full">等效电路</span>
            <span className="short">电路</span>
          </button>
          <button role="radio" aria-checked={wave} className={wave ? 'on' : ''} onClick={() => setView('wave')}>
            波形
          </button>
        </div>
      </div>

      <div className="w46-svgwrap">
        <svg viewBox="0 0 440 232" className="w46-svg" role="img" aria-label={`${MOMENT_NOTE[m]}（${PRESETS.find((p) => p.id === preset)!.label}${wave ? '，波形' : ''}）`}>
          <rect x="1" y="1" width="438" height="230" rx="10" className="w46-bg" />
          {wave && waveOk && b ? (
            <Wave c={CIRCUITS[preset as Exclude<Preset, 'demo'>]} b={b} m={m} />
          ) : wave ? (
            <g>
              <text x={220} y={104} className="w46-lbl" textAnchor="middle" fill="#5f626b">
                {b === null ? '符号演示电路没有具体数值，' : '引导例题的波形会泄露答案，'}
              </text>
              <text x={220} y={124} className="w46-lbl" textAnchor="middle" fill="#5f626b">
                {b === null ? '选“例题一 / 例题二”看波形' : '闯完第 5 幕的 5 步后揭晓'}
              </text>
            </g>
          ) : (
            <>
              <text x={438} y={228} className="w46-tick" textAnchor="end" fill="#5f626b">
                {MOMENT_NOTE[m]}
              </text>
              {drawing}
            </>
          )}
        </svg>
      </div>

      <div className="w46-readout">
        <div className={`w46-rgrid${m === 'inf' ? ' two' : ''}`}>
          {cells(m, b, show).map((c, i) => (
            <Readout key={i} {...c} />
          ))}
        </div>
        {masked && (
          <div className="w46-readout-foot">
            <button className="w46-btn" onClick={() => setG(5)}>
              揭晓数值（第 5 幕引导例题，先自己做）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Readout({ id, label, text }: Cell) {
  const hot = useHot(id);
  return (
    <div className={`w46-cell${hot.lit ? ' lit' : ''}`} {...hot.on}>
      <span className="k">
        <HSubs s={label} />
      </span>
      <b>
        <HSubs s={text} />
      </b>
    </div>
  );
}

export const Layer01 = () => <Snap m="pre" />;
export const Layer02 = () => <Snap m="zero" />;
export const Layer03 = () => <Snap m="inf" />;
