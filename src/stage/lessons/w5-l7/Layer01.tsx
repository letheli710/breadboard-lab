// Layer "01 2D 电路与传递函数 H(ω) 实时化简台", three views:
//  - RC 电路: the act 1 RC low-pass in the frequency domain (R and C sliders, the cursor ω): Z_R, Z_C,
//    the black box H(ω) = 1/(1 + jω/ω_c), its pole s = −1/(RC), ω_c, f_c and H at the cursor;
//  - 分贝尺: the act 2 dB ruler — one log axis read three ways: amplitude ratio |H| (log), its dB
//    20 log10|H| (linear) and the power ratio |H|² (10 log10 gives the same dB); the half-power point;
//  - 标准形式: one click per step from the given form to Bode standard form, the constants of the
//    first-order factors pulled out and merged into K (the guided example's K stays "?" until found).

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Tex } from '../../StageText';
import { dbOfPower, dbOfRatio, fmt, fmtC, fmtR, fmtS, fmtW, kOf, RAW, rcTF, totalDb, totalPhase, type Preset } from './model';
import { Cell, COLOR, HSubs, Obj, P, PRESET_LABEL, Seg, Subs, useClearHoverOnUnmount, useHot, useLab, type Lab, type View } from './state';
import { useStageParam } from '../../stageStore';
import { stdBlock, stdRc, stdTwoPole, STD_GUIDED_MASKED } from './tex';
import './w5l7.css';

const lg = Math.log10;

/* ------------------------------------------------------------------ log slider */

function LogSlider({
  label,
  value,
  min,
  max,
  onChange,
  text,
  id,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  text: string;
  id: string;
}) {
  const hot = useHot(id);
  const t = (lg(value) - lg(min)) / (lg(max) - lg(min));
  return (
    <div className={`w57-slider${hot.lit ? ' lit' : ''}`} {...hot.on}>
      <label>
        <HSubs s={label} /> <b>{text}</b>
      </label>
      <input
        type="range"
        min={0}
        max={1000}
        step={1}
        value={Math.round(t * 1000)}
        aria-label={label}
        onChange={(e) => {
          const v = 10 ** (lg(min) + (Number(e.target.value) / 1000) * (lg(max) - lg(min)));
          onChange(Number(v.toPrecision(2)));
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ RC circuit */

function zig(x1: number, x2: number, y: number) {
  const n = 6;
  const d = (x2 - x1) / (n + 1);
  const pts = [`${x1},${y}`];
  for (let k = 0; k < n; k++) pts.push(`${x1 + d * (k + 1)},${y + (k % 2 ? 7 : -7)}`);
  pts.push(`${x2},${y}`);
  return pts.join(' ');
}

function RcView({ lab }: { lab: Lab }) {
  const wc = 1 / (lab.R * lab.C);
  const fs = rcTF(lab.R, lab.C);
  const w = lab.preset === 'rc' ? lab.w : wc;
  const mag = totalDb(fs, w);
  const ph = totalPhase(fs, w);
  const xc = 1 / (w * lab.C);
  const use = (f: () => void) => () => {
    f();
    if (lab.preset !== 'rc') lab.setPreset('rc');
  };
  return (
    <>
      <div className="w57-svgwrap">
        <svg viewBox="0 0 500 200" className="w57-svg" role="img" aria-label="一阶 RC 低通网络：频域复阻抗分压与传递函数黑箱">
          <rect x="1" y="1" width="498" height="198" rx="10" className="w57-bg" />
          <Obj id="vin">
            <circle cx={38} cy={52} r={4.5} fill="#fff" stroke="#0284c7" strokeWidth={2} />
            <circle cx={38} cy={156} r={4.5} fill="#fff" stroke="#0284c7" strokeWidth={2} />
            <text x={20} y={57} className="w57-sym" fill="#0369a1">
              +
            </text>
            <text x={20} y={161} className="w57-sym" fill="#0369a1">
              −
            </text>
            <text x={14} y={109} className="w57-lbl" fill="#0369a1">
              <Subs s="V_i(ω)" />
            </text>
          </Obj>
          <path d="M 42.5 52 H 78 M 150 52 H 262 M 42.5 156 H 262" className="w57-wire" />
          <Obj id="r">
            <polyline points={zig(78, 150, 52)} className="w57-res" />
            <text x={114} y={32} className="w57-lbl" textAnchor="middle" fill="#b45309">
              R = {fmtR(lab.R)}
            </text>
            <text x={114} y={76} className="w57-tick" textAnchor="middle">
              <Subs s="Z_R = R" />
            </text>
          </Obj>
          <circle cx={200} cy={52} r={3.4} fill={COLOR.ink} />
          <circle cx={200} cy={156} r={3.4} fill={COLOR.ink} />
          <Obj id="c">
            <path d="M 200 52 V 98 M 200 110 V 156" className="w57-wire" />
            <line x1={182} x2={218} y1={98} y2={98} stroke="#059669" strokeWidth={3.2} />
            <line x1={182} x2={218} y1={110} y2={110} stroke="#059669" strokeWidth={3.2} />
            <text x={176} y={100} className="w57-lbl" textAnchor="end" fill="#047857">
              C = {fmtC(lab.C)}
            </text>
            <text x={176} y={116} className="w57-tick" textAnchor="end">
              <Subs s="Z_C = 1/(jωC)" />
            </text>
          </Obj>
          <Obj id="vout">
            <circle cx={266} cy={52} r={4.5} fill="#fff" stroke="#059669" strokeWidth={2} />
            <circle cx={266} cy={156} r={4.5} fill="#fff" stroke="#059669" strokeWidth={2} />
            <text x={276} y={57} className="w57-sym" fill="#047857">
              +
            </text>
            <text x={276} y={161} className="w57-sym" fill="#047857">
              −
            </text>
            <text x={272} y={109} className="w57-lbl" fill="#047857">
              <Subs s="V_o(ω)" />
            </text>
          </Obj>
          <Obj id="hbox">
            <rect x={334} y={14} width={156} height={66} rx={8} fill="#f5f3ff" stroke="#7c3aed" strokeWidth={1.8} />
            <text x={412} y={34} className="w57-lbl" textAnchor="middle" fill="#6d28d9">
              H(ω)
            </text>
            <text x={412} y={52} className="w57-tick" textAnchor="middle" fill={COLOR.ink}>
              1 / (1 + jω/{fmtW(wc)})
            </text>
            <text x={412} y={69} className="w57-tick" textAnchor="middle" fill={COLOR.muted}>
              {`|H|=${fmt(10 ** (mag / 20), 4)}  ∠${fmtS(ph)}°`}
            </text>
          </Obj>
          <Obj id="pole">
            <text x={412} y={102} className="w57-lbl small" textAnchor="middle" fill="#be123c">
              极点 s = −1/(RC)
            </text>
            <text x={412} y={116} className="w57-lbl small" textAnchor="middle" fill="#be123c">
              = −{fmtW(wc)} rad/s
            </text>
            <text x={412} y={131} className="w57-tick" textAnchor="middle">
              有限零点：无
            </text>
          </Obj>
          <Obj id="wc">
            <text x={412} y={156} className="w57-lbl small" textAnchor="middle" fill="#b45309">
              <Subs s="ω_c = 1/(RC)" />
            </text>
            <text x={412} y={171} className="w57-lbl small" textAnchor="middle" fill="#b45309">
              = {fmtW(wc)} rad/s
            </text>
            <text x={412} y={190} className="w57-tick" textAnchor="middle">
              <Subs s={`f_c = ω_c/2π ≈ ${fmt(wc / (2 * Math.PI), 2)} Hz`} />
            </text>
          </Obj>
        </svg>
      </div>
      <div className="w57-sliders">
        <LogSlider id="r" label="R" value={lab.R} min={100} max={10000} text={fmtR(lab.R)} onChange={(v) => use(() => lab.setR(v))()} />
        <LogSlider id="c" label="C" value={lab.C} min={1e-7} max={1e-5} text={fmtC(lab.C)} onChange={(v) => use(() => lab.setC(v))()} />
        <LogSlider id="cursor" label="游标 ω" value={Math.min(1e6, Math.max(1, w))} min={1} max={1e6} text={`${fmtW(w)} rad/s`} onChange={(v) => use(() => lab.setW(v))()} />
      </div>
      <div className="w57-readout">
        <div className="w57-rgrid four">
          <Cell id="c" k={<HSubs s="Z_C = −j/(ωC)" />} v={`−j${fmtW(xc)} Ω`} />
          <Cell id="hbox" k="|H(ω)|" v={fmt(10 ** (mag / 20), 4)} />
          <Cell id="hbox" k="20 log|H|" v={`${fmt(mag)} dB`} />
          <Cell id="hbox" k="∠H(ω)" v={`${fmtS(ph)}°`} />
        </div>
        {lab.preset !== 'rc' && (
          <div className="w57-readout-foot">
            <span>波特图层正在画「{PRESET_LABEL[lab.preset][0]}」。</span>
            <button className="w57-btn" onClick={() => (lab.setPreset('rc'), lab.setW(wc))}>
              改画这个 RC 电路
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ dB ruler */

const RX0 = 40;
const RX1 = 440;
const rx = (r: number) => RX0 + ((lg(r) + 2) / 4) * (RX1 - RX0);
const SPECIAL = [0.01, 0.1, 0.5, Math.SQRT1_2, 1, 2, 10, 100];
const CHIPS: [number, string][] = [
  [0.1, '0.1'],
  [0.5, '0.5'],
  [Math.SQRT1_2, '1/√2'],
  [1, '1'],
  [2, '2'],
  [10, '10'],
  [100, '100'],
];

function DbView() {
  const [ratio, setRatio] = useStageParam<number>(P.ratio, Math.SQRT1_2);
  const svgRef = useRef<SVGSVGElement>(null);
  const r = Math.min(100, Math.max(0.01, ratio));
  const drag = (e: RPointerEvent<SVGSVGElement>) => {
    if (e.type === 'pointerdown') svgRef.current?.setPointerCapture?.(e.pointerId);
    else if (!e.buttons) return;
    const m = svgRef.current?.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    let v = 10 ** (((Math.min(RX1, Math.max(RX0, p.x)) - RX0) / (RX1 - RX0)) * 4 - 2);
    for (const s of SPECIAL) if (Math.abs(lg(v) - lg(s)) < 0.03) v = s;
    setRatio(Number(v.toPrecision(6)));
  };
  const half = Math.abs(r - Math.SQRT1_2) < 1e-6;
  const rows: { y: number; id: string; title: string; ticks: [number, string][]; marks: [number, string][] }[] = [
    {
      y: 46,
      id: 'db_ratio',
      title: '幅值比 |H| = V₂/V₁（对数刻度）',
      ticks: [
        [0.01, '0.01'],
        [0.1, '0.1'],
        [1, '1'],
        [10, '10'],
        [100, '100'],
      ],
      marks: [
        [Math.SQRT1_2, '0.707'],
        [2, '2'],
      ],
    },
    {
      y: 104,
      id: 'db_ruler',
      title: '分贝 20 log₁₀|H|（线性刻度）',
      ticks: [
        [0.01, '−40'],
        [0.1, '−20'],
        [1, '0 dB'],
        [10, '+20'],
        [100, '+40'],
      ],
      marks: [
        [Math.SQRT1_2, '−3.01'],
        [2, '+6.02'],
      ],
    },
    {
      y: 162,
      id: 'db_power',
      title: '功率比 P₂/P₁ = |H|²（10 log₁₀ 得同一个 dB）',
      ticks: [
        [0.01, '10⁻⁴'],
        [0.1, '0.01'],
        [1, '1'],
        [10, '100'],
        [100, '10⁴'],
      ],
      marks: [
        [Math.SQRT1_2, '1/2'],
        [2, '4'],
      ],
    },
  ];
  const minors: number[] = [];
  for (const d of [0.01, 0.1, 1, 10]) for (let m = 2; m <= 9; m++) minors.push(d * m);
  return (
    <>
      <div className="w57-svgwrap">
        <svg
          ref={svgRef}
          viewBox="0 0 460 196"
          className="w57-svg w57-drag"
          role="img"
          aria-label="分贝尺：幅值比、分贝与功率比共用一条对数轴"
          onPointerDown={drag}
          onPointerMove={drag}
        >
          <rect x="1" y="1" width="458" height="194" rx="10" className="w57-bg" />
          {rows.map((row) => (
            <Obj key={row.id} id={row.id}>
              <text x={RX0} y={row.y - 20} className="w57-lbl small" fill={COLOR.ink}>
                {row.title}
              </text>
              <line x1={RX0} x2={RX1} y1={row.y} y2={row.y} stroke={COLOR.ink} strokeWidth={1.6} />
              {minors.map((m) => (
                <line key={m} x1={rx(m)} x2={rx(m)} y1={row.y - 3} y2={row.y + 3} stroke={COLOR.axis} strokeWidth={1} />
              ))}
              {row.ticks.map(([v, t]) => (
                <g key={v}>
                  <line x1={rx(v)} x2={rx(v)} y1={row.y - 7} y2={row.y + 7} stroke={COLOR.ink} strokeWidth={1.4} />
                  <text x={rx(v)} y={row.y + 19} className="w57-tick" textAnchor="middle">
                    {t}
                  </text>
                </g>
              ))}
            </Obj>
          ))}
          <Obj id="half_power">
            <line x1={rx(Math.SQRT1_2)} x2={rx(Math.SQRT1_2)} y1={36} y2={170} stroke={COLOR.err} strokeWidth={1.2} strokeDasharray="3 3" />
            {rows.map((row) => (
              <text key={row.id} x={rx(Math.SQRT1_2) - 3} y={row.y - 6} className="w57-tick" textAnchor="end" fill={COLOR.errT}>
                {row.marks[0][1]}
              </text>
            ))}
            <text x={rx(Math.SQRT1_2) - 3} y={190} className="w57-tick" textAnchor="end" fill={COLOR.errT}>
              半功率点
            </text>
          </Obj>
          {rows.map((row) => (
            <text key={row.id} x={rx(2) + 3} y={row.y - 6} className="w57-tick" fill={COLOR.muted}>
              {row.marks[1][1]}
            </text>
          ))}
          <g className="w57-marker">
            <line x1={rx(r)} x2={rx(r)} y1={30} y2={172} stroke={COLOR.exact} strokeWidth={2.2} />
            {rows.map((row) => (
              <circle key={row.id} cx={rx(r)} cy={row.y} r={5} fill={COLOR.exact} stroke="#fff" strokeWidth={1.5} />
            ))}
          </g>
        </svg>
      </div>
      <div className="w57-controls">
        <span className="w57-chips" role="group" aria-label="常用幅值比">
          {CHIPS.map(([v, t]) => (
            <button key={t} className={Math.abs(r - v) < 1e-9 ? 'on' : ''} onClick={() => setRatio(v)}>
              ×{t}
            </button>
          ))}
        </span>
      </div>
      <div className="w57-readout">
        <div className="w57-rgrid four">
          <Cell id="db_ratio" k="|H| = V₂/V₁" v={fmt(r, r < 0.1 ? 4 : 3)} />
          <Cell id="db_ruler" k="20 log₁₀|H|" v={`${fmtS(dbOfRatio(r))} dB`} />
          <Cell id="db_power" k="P₂/P₁ = |H|²" v={fmt(r * r, r * r < 0.1 ? 4 : 3)} />
          <Cell id={half ? 'half_power' : 'db_power'} k="10 log₁₀(P₂/P₁)" v={`${fmtS(dbOfPower(r * r))} dB`} />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ standard form */

function StdView({ lab }: { lab: Lab }) {
  const [step, setStep] = useState(0);
  const hot = useHot('std_form');
  const kHot = useHot('k_gain');
  const p = lab.preset;
  useEffect(() => setStep(0), [p]);
  let lines: string[];
  let k: string;
  let note = '';
  let can = true;
  if (p === 'rc') {
    lines = stdRc(1 / (lab.R * lab.C));
    k = 'K = 1 → 0 dB';
  } else if (p === 'ex4' || p === 'guided') {
    const masked = p === 'guided' && !lab.rev.k;
    lines = masked ? STD_GUIDED_MASKED : stdTwoPole(p);
    const K = kOf(RAW[p]);
    k = masked ? 'K = ?' : `K = ${K} → 20 log K = ${fmtS(20 * lg(K))} dB`;
    if (masked) {
      can = false;
      note = '这正是第 5 幕引导例题第 1 步要你做的：先自己提取常数，答对后这里揭晓。';
    }
  } else {
    lines = [stdBlock(lab.block, lab.bk, lab.sign, lab.zeta)];
    k = '基本因子本身已是标准形式';
  }
  const shown = can ? lines.slice(0, step + 1) : lines.slice(0, 1);
  return (
    <>
      <div className="w57-controls">
        <Seg<Preset>
          label="传递函数"
          value={p}
          options={(['rc', 'ex4', 'guided', 'block'] as Preset[]).map((v) => ({ v, full: PRESET_LABEL[v][0], short: PRESET_LABEL[v][1] }))}
          onChange={(v) => lab.setPreset(v)}
        />
        {lines.length > 1 && (
          <button className="w57-btn" disabled={!can} onClick={() => setStep((s) => (s + 1 >= lines.length ? 0 : s + 1))}>
            {step + 1 >= lines.length ? '重来' : step === 0 ? '一键化标准形式 ▸' : '下一步 ▸'}
          </button>
        )}
      </div>
      <div className={`w57-std${hot.lit ? ' lit' : ''}`} {...hot.on}>
        {shown.map((t, i) => (
          <div key={i} className={`w57-std-line${i === shown.length - 1 ? ' last' : ''}`}>
            <Tex tex={t} display />
          </div>
        ))}
        {!can && (
          <div className="w57-std-line">
            <Tex tex={lines[1]} display />
          </div>
        )}
        {note && <p className="w57-note">{note}</p>}
      </div>
      <div className="w57-readout">
        <div className={`w57-kcell${kHot.lit ? ' lit' : ''}`} {...kHot.on}>
          <span className="k">常数增益</span>
          <b>{k}</b>
          {(p === 'ex4' || (p === 'guided' && lab.rev.k)) && (
            <span className="k">
              <HSubs s={`转折频率 ${RAW[p].poles.map((c, i) => `ω_p${i + 1} = ${c}`).join('，')} rad/s`} />
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default function Layer01() {
  useClearHoverOnUnmount();
  const lab = useLab();
  const [view, setView] = useStageParam<View>(P.view, 'circuit');
  return (
    <div className="w57-layer">
      <div className="w57-controls">
        <Seg<View>
          label="视图"
          value={view}
          options={[
            { v: 'circuit', full: 'RC 电路', short: '电路' },
            { v: 'db', full: '分贝尺', short: '分贝尺' },
            { v: 'std', full: '化标准形式', short: '标准形式' },
          ]}
          onChange={setView}
        />
      </div>
      {view === 'circuit' ? <RcView lab={lab} /> : view === 'db' ? <DbView /> : <StdView lab={lab} />}
    </div>
  );
}
