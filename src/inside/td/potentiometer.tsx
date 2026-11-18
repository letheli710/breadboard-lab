// Teardown: the potentiometer. Outside (knob, three legs) → X-ray (horseshoe carbon track, wiper,
// collector ring) → equivalent circuit (R·x and R·(1−x)) → used as a voltage divider → used as a
// variable resistor (rheostat) in the dimmer and max-power labs → loading the divider (Thevenin
// view, numbers) → marking, taper and the limits of a real pot.

import './passives.css';
import { tr } from '../../core/i18n';
import { sub } from '../TeardownView';
import type { Teardown } from '../types';

const show = (c: boolean) => (c ? 'td-show' : 'td-hide');

const CX = 280;
const CY = 180;
const RT = 92; // track radius
const X_DEMO = 0.3;
const pt = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
};
/** arc of the track from fraction f0 to f1 (0 = pin 1 end, 1 = pin 3 end) */
const arc = (f0: number, f1: number, r = RT) => {
  const a0 = 135 + 270 * f0;
  const a1 = 135 + 270 * f1;
  const p0 = pt(a0, r);
  const p1 = pt(a1, r);
  return `M${p0.x} ${p0.y} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p1.x} ${p1.y}`;
};
const LEG_X = [220, 280, 340];

function Zig({ x1, y1, x2, y2, part, body = 56 }: { x1: number; y1: number; x2: number; y2: number; part?: string; body?: number }) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const a = (L - body) / 2;
  const pts = [`${x1},${y1}`, `${x1 + ux * a},${y1 + uy * a}`];
  for (let k = 1; k <= 6; k++) {
    const t = a + (body * k) / 6.5;
    const s = k % 2 ? 8 : -8;
    pts.push(`${x1 + ux * t - uy * s},${y1 + uy * t + ux * s}`);
  }
  pts.push(`${x1 + ux * (a + body)},${y1 + uy * (a + body)}`, `${x2},${y2}`);
  return <polyline points={pts.join(' ')} className="pv-wire" data-part={part} />;
}

function Gnd({ x, y }: { x: number; y: number }) {
  return (
    <g className="pv-wire">
      <line x1={x - 12} y1={y} x2={x + 12} y2={y} />
      <line x1={x - 7} y1={y + 5} x2={x + 7} y2={y + 5} />
      <line x1={x - 3} y1={y + 10} x2={x + 3} y2={y + 10} />
    </g>
  );
}

function Led({ x, y, part }: { x: number; y: number; part?: string }) {
  // vertical LED symbol, anode on top at (x, y), cathode at y + 40
  return (
    <g data-part={part}>
      <line x1={x} y1={y} x2={x} y2={y + 10} className="pv-wire" />
      <polygon points={`${x - 11},${y + 10} ${x + 11},${y + 10} ${x},${y + 28}`} fill="#ffb3b8" stroke="var(--ink)" strokeWidth={1.8} />
      <line x1={x - 11} y1={y + 28} x2={x + 11} y2={y + 28} className="pv-wire" />
      <line x1={x} y1={y + 28} x2={x} y2={y + 40} className="pv-wire" />
      <path d={`M${x + 14} ${y + 14} l10 -6 M${x + 14} ${y + 22} l10 -6`} stroke="#e63946" strokeWidth={1.6} markerEnd="url(#pt-ah)" />
    </g>
  );
}

/* ------------------------------------------------------------------ the pot itself (layers 0–1) */

function Pot({ layer }: { layer: number }) {
  const xray = layer === 1;
  const w = pt(135 + 270 * X_DEMO, RT);
  return (
    <g className={show(layer <= 1)}>
      {/* legs */}
      {LEG_X.map((x, i) => (
        <g key={x} data-part={`leg${i + 1}`}>
          <rect x={x - 6} y={286} width={12} height={110} rx={2} fill="#c9ccd1" stroke="#7d8088" />
          <circle cx={x} cy={414} r={12} fill="#fffdf8" stroke="var(--ink)" strokeWidth={1.4} />
          <text x={x} y={419} textAnchor="middle" className="pv-lbl">
            {i + 1}
          </text>
        </g>
      ))}
      {/* body */}
      <circle cx={CX} cy={CY} r={128} fill="#2f4d8a" stroke="#1d335f" strokeWidth={2} data-part="body" style={{ opacity: xray ? 0.15 : 1, transition: 'opacity .45s' }} />
      <rect x={196} y={270} width={168} height={26} rx={4} fill="#1d335f" style={{ opacity: xray ? 0.15 : 1, transition: 'opacity .45s' }} />
      <g className={show(!xray)}>
        <circle cx={CX} cy={CY} r={46} fill="#e9e4d8" stroke="#8a8478" strokeWidth={2} data-part="knob" />
        <line x1={CX} y1={CY} x2={w.x - (w.x - CX) * 0.5} y2={w.y - (w.y - CY) * 0.5} stroke="#1d335f" strokeWidth={5} strokeLinecap="round" data-part="knob" />
        <text x={CX} y={CY + 82} textAnchor="middle" className="pv-lbl pv-white">
          B103
        </text>
        <path d={arc(0.02, 0.98, 112)} fill="none" stroke="#fff" strokeWidth={1.5} strokeDasharray="4 4" markerEnd="url(#pt-ahw)" />
        <text x={CX - 100} y={CY + 100} textAnchor="middle" className="pv-tiny" style={{ fill: '#fff' }}>
          0%
        </text>
        <text x={CX + 100} y={CY + 100} textAnchor="middle" className="pv-tiny" style={{ fill: '#fff' }}>
          100%
        </text>
      </g>
      {/* X-ray: track, wiper, collector */}
      <g className={show(xray)}>
        <path d={arc(0, 1)} fill="none" stroke="#3a3a3a" strokeWidth={20} data-part="track" />
        <circle cx={CX} cy={CY} r={22} fill="none" stroke="#c9a227" strokeWidth={8} data-part="collector" />
        <line x1={CX} y1={CY} x2={w.x} y2={w.y} stroke="#c9a227" strokeWidth={7} strokeLinecap="round" data-part="wiper" />
        <circle cx={w.x} cy={w.y} r={8} fill="#c9a227" stroke="#7a5f10" strokeWidth={1.5} data-part="wiper" />
        {/* connections to the legs */}
        <path d={`M${pt(135, RT).x} ${pt(135, RT).y} L220 286`} stroke="#c9a227" strokeWidth={5} data-part="leg1" />
        <path d={`M${pt(45, RT).x} ${pt(45, RT).y} L340 286`} stroke="#c9a227" strokeWidth={5} data-part="leg3" />
        <path d={`M${CX} ${CY + 22} L${CX} 286`} stroke="#c9a227" strokeWidth={5} data-part="leg2" />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ equivalent circuit (layer 2) */

function Equivalent({ layer }: { layer: number }) {
  const x1 = 70;
  const x3 = 490;
  const xw = x1 + (x3 - x1) * X_DEMO;
  return (
    <g className={show(layer === 2)}>
      <text x={280} y={46} textAnchor="middle" className="td-small">
        {tr('把马蹄形的碳道拉直', 'straighten the horseshoe track')}
      </text>
      <rect x={x1} y={92} width={xw - x1} height={22} fill="#3a3a3a" data-part="rx" />
      <rect x={xw} y={92} width={x3 - xw} height={22} fill="#6b6b6b" data-part="r1x" />
      <path d={`M${xw} 64 L${xw} 88`} stroke="#c9a227" strokeWidth={5} markerEnd="url(#pt-ah)" data-part="wiper" />
      <text x={xw} y={58} textAnchor="middle" className="pv-lbl" data-part="wiper">
        {tr('2（滑动端）', '2 (wiper)')}
      </text>
      <text x={x1} y={140} textAnchor="middle" className="pv-lbl">
        1
      </text>
      <text x={x3} y={140} textAnchor="middle" className="pv-lbl">
        3
      </text>
      <text x={(x1 + xw) / 2} y={140} textAnchor="middle" className="td-small" data-part="rx">
        {tr('x = 0.3 的长度', 'fraction x = 0.3')}
      </text>
      <text x={(xw + x3) / 2} y={140} textAnchor="middle" className="td-small" data-part="r1x">
        {tr('剩下 1 − x = 0.7', 'the rest, 1 − x = 0.7')}
      </text>
      <path d="M280 160 L280 200" className="pv-thin" markerEnd="url(#pt-ah)" />
      {/* the equivalent circuit */}
      <circle cx={x1} cy={270} r={5} className="pv-term" />
      <circle cx={x3} cy={270} r={5} className="pv-term" />
      <Zig x1={x1 + 5} y1={270} x2={xw} y2={270} part="rx" />
      <Zig x1={xw} y1={270} x2={x3 - 5} y2={270} part="r1x" />
      <circle cx={xw} cy={270} r={4} className="pv-dot" />
      <line x1={xw} y1={270} x2={xw} y2={330} className="pv-wire" data-part="wiper" />
      <circle cx={xw} cy={334} r={5} className="pv-term" data-part="wiper" />
      <text x={x1} y={300} textAnchor="middle" className="pv-lbl">
        1
      </text>
      <text x={x3} y={300} textAnchor="middle" className="pv-lbl">
        3
      </text>
      <text x={xw + 12} y={340} className="pv-lbl">
        2
      </text>
      <text x={(x1 + xw) / 2} y={246} textAnchor="middle" className="pv-lbl pv-red" data-part="rx">
        {sub('R_12 = R·x')}
      </text>
      <text x={(xw + x3) / 2} y={246} textAnchor="middle" className="pv-lbl pv-blue" data-part="r1x">
        {sub('R_23 = R·(1 − x)')}
      </text>
      <text x={(x1 + xw) / 2} y={300} textAnchor="middle" className="td-small" data-part="rx">
        = 3 kΩ
      </text>
      <text x={(xw + x3) / 2} y={300} textAnchor="middle" className="td-small" data-part="r1x">
        = 7 kΩ
      </text>
      <text x={280} y={392} textAnchor="middle" className="pv-eq">
        {sub('R_12 + R_23 = R = 10 kΩ')}
      </text>
      <text x={280} y={414} textAnchor="middle" className="td-small">
        {tr('无论旋钮在哪，两段加起来总是 R', 'wherever the knob is, the two parts add up to R')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ divider (layer 3) */

function Divider({ layer }: { layer: number }) {
  const x = 120;
  const gx = 310;
  const gy = 380;
  const GX = (f: number) => gx + f * 200;
  const GY = (v: number) => gy - v * 46;
  return (
    <g className={show(layer === 3)}>
      <text x={x} y={52} textAnchor="middle" className="pv-lbl pv-red">
        +5 V
      </text>
      <circle cx={x} cy={64} r={4} className="pv-term" />
      <line x1={x} y1={68} x2={x} y2={100} className="pv-wire" />
      <text x={x - 14} y={98} textAnchor="end" className="td-small">
        1
      </text>
      <Zig x1={x} y1={100} x2={x} y2={210} part="rx" />
      <circle cx={x} cy={210} r={4} className="pv-dot" />
      <Zig x1={x} y1={210} x2={x} y2={320} part="r1x" />
      <text x={x - 14} y={330} textAnchor="end" className="td-small">
        3
      </text>
      <line x1={x} y1={320} x2={x} y2={350} className="pv-wire" />
      <Gnd x={x} y={350} />
      <text x={x - 16} y={160} textAnchor="end" className="pv-lbl pv-red" data-part="rx">
        R·x
      </text>
      <text x={x - 16} y={270} textAnchor="end" className="pv-lbl pv-blue" data-part="r1x">
        R(1−x)
      </text>
      <g data-part="vout">
        <line x1={x} y1={210} x2={x + 90} y2={210} className="pv-wire" />
        <circle cx={x + 94} cy={210} r={4} className="pv-term" />
        <text x={x + 52} y={202} textAnchor="middle" className="td-small">
          2
        </text>
        <path d={`M${x + 94} 220 L${x + 94} 344`} className="pv-thin" markerEnd="url(#pt-ah)" />
        <text x={x + 102} y={286} className="pv-lbl pv-violet">
          {sub('V_out')}
        </text>
      </g>
      {/* V_out vs x */}
      <rect x={gx - 40} y={96} width={260} height={324} rx={12} className="td-panel" />
      <line x1={gx} y1={gy} x2={GX(1.08)} y2={gy} className="pv-axis" markerEnd="url(#pt-ah)" />
      <line x1={gx} y1={gy} x2={gx} y2={GY(5.6)} className="pv-axis" markerEnd="url(#pt-ah)" />
      {[0, 0.5, 1].map((f) => (
        <text key={f} x={GX(f)} y={gy + 18} textAnchor="middle" className="td-small">
          {f}
        </text>
      ))}
      {[1, 2, 3, 4, 5].map((v) => (
        <text key={v} x={gx - 8} y={GY(v) + 4} textAnchor="end" className="td-small">
          {v}
        </text>
      ))}
      <text x={GX(1.08)} y={gy - 8} textAnchor="end" className="pv-lbl">
        x
      </text>
      <text x={gx + 8} y={GY(5.5)} className="pv-lbl pv-violet">
        {sub('V_out / V')}
      </text>
      <line x1={GX(0)} y1={GY(5)} x2={GX(1)} y2={GY(0)} className="pv-curve violet" data-part="vout" />
      <line x1={GX(0.3)} y1={GY(3.5)} x2={GX(0.3)} y2={gy} className="pv-dash" />
      <line x1={gx} y1={GY(3.5)} x2={GX(0.3)} y2={GY(3.5)} className="pv-dash" />
      <circle cx={GX(0.3)} cy={GY(3.5)} r={5} fill="#7a3fc0" />
      <text x={GX(0.3) + 10} y={GY(3.5) - 8} className="pv-lbl pv-violet">
        x = 0.3 → 3.5 V
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ rheostat (layer 4) */

function Rheostat({ layer }: { layer: number }) {
  const x = 100;
  const gx = 290;
  const gy = 380;
  const GX = (f: number) => gx + f * 220;
  const GY = (ma: number) => gy - ma * 17;
  const pts = Array.from({ length: 51 }, (_, k) => {
    const f = k / 50;
    return `${GX(f)},${GY((3.2 / (232 + 10000 * f)) * 1000)}`;
  }).join(' ');
  return (
    <g className={show(layer === 4)}>
      <text x={x} y={48} textAnchor="middle" className="pv-lbl pv-red">
        +5 V
      </text>
      <circle cx={x} cy={60} r={4} className="pv-term" />
      <line x1={x} y1={64} x2={x} y2={84} className="pv-wire" />
      <Zig x1={x} y1={84} x2={x} y2={184} part="rx" />
      <line x1={x} y1={184} x2={x} y2={210} className="pv-wire" />
      <path d="M128 134 L108 134" stroke="#c9a227" strokeWidth={4} markerEnd="url(#pt-ah)" data-part="short" />
      <path d={`M128 134 L150 134 L150 196 L${x} 196`} className="pv-wire" data-part="short" />
      <circle cx={x} cy={196} r={3.5} className="pv-dot" />
      <text x={x - 14} y={92} textAnchor="end" className="td-small">
        1
      </text>
      <text x={158} y={130} className="td-small">
        2
      </text>
      <text x={x - 14} y={190} textAnchor="end" className="td-small">
        3
      </text>
      <text x={x - 18} y={140} textAnchor="end" className="pv-lbl pv-red" data-part="rx">
        R·x
      </text>
      <text x={160} y={176} className="td-small" data-part="short">
        {tr('2、3 短接', '2–3 joined')}
      </text>
      <Zig x1={x} y1={210} x2={x} y2={290} part="r220" body={40} />
      <text x={x + 16} y={256} className="pv-lbl" data-part="r220">
        220 Ω
      </text>
      <Led x={x} y={290} part="led" />
      <text x={x + 30} y={318} className="td-small" data-part="led">
        {tr('红 LED', 'red LED')}
      </text>
      <line x1={x} y1={330} x2={x} y2={350} className="pv-wire" />
      <Gnd x={x} y={350} />
      {/* I vs x */}
      <rect x={gx - 46} y={90} width={300} height={330} rx={12} className="td-panel" />
      <line x1={gx} y1={gy} x2={GX(1.08)} y2={gy} className="pv-axis" markerEnd="url(#pt-ah)" />
      <line x1={gx} y1={gy} x2={gx} y2={GY(15.5)} className="pv-axis" markerEnd="url(#pt-ah)" />
      {[0, 0.25, 0.5, 1].map((f) => (
        <text key={f} x={GX(f)} y={gy + 18} textAnchor="middle" className="td-small">
          {f}
        </text>
      ))}
      {[5, 10, 15].map((m) => (
        <text key={m} x={gx - 8} y={GY(m) + 4} textAnchor="end" className="td-small">
          {m}
        </text>
      ))}
      <text x={GX(1.08)} y={gy - 8} textAnchor="end" className="pv-lbl">
        x
      </text>
      <text x={gx + 8} y={GY(15)} className="pv-lbl pv-red">
        I / mA
      </text>
      <polyline points={pts} className="pv-curve" data-part="curve" />
      <circle cx={GX(0)} cy={GY(13.8)} r={5} fill="#e63946" />
      <text x={GX(0) + 10} y={GY(13.8) + 4} className="pv-lbl pv-red">
        x = 0 → 13.8 mA
      </text>
      <text x={GX(1)} y={GY(2.4)} textAnchor="end" className="pv-lbl pv-red">
        x = 1 → 0.31 mA
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ loading (layer 5) */

function Loading({ layer }: { layer: number }) {
  const x = 90;
  const cases: [string, number, string][] = [
    [tr('空载', 'no load'), 4.5, '#7a3fc0'],
    ['$R_L$ = 100 kΩ', 4.39, '#7a3fc0'],
    ['$R_L$ = 10 kΩ', 3.6, '#f08a24'],
    ['$R_L$ = 1 kΩ', 1.29, '#e63946'],
  ];
  return (
    <g className={show(layer === 5)}>
      <text x={x} y={42} textAnchor="middle" className="pv-lbl pv-red">
        +9 V
      </text>
      <circle cx={x} cy={54} r={4} className="pv-term" />
      <Zig x1={x} y1={58} x2={x} y2={160} part="rx" />
      <circle cx={x} cy={160} r={4} className="pv-dot" />
      <Zig x1={x} y1={160} x2={x} y2={262} part="r1x" />
      <line x1={x} y1={262} x2={x} y2={284} className="pv-wire" />
      <Gnd x={x} y={284} />
      <text x={x - 14} y={114} textAnchor="end" className="pv-lbl">
        5 k
      </text>
      <text x={x - 14} y={216} textAnchor="end" className="pv-lbl">
        5 k
      </text>
      <g data-part="load">
        <line x1={x} y1={160} x2={190} y2={160} className="pv-wire" />
        <circle cx={190} cy={160} r={3.5} className="pv-dot" />
        <Zig x1={190} y1={160} x2={190} y2={262} part="load" body={46} />
        <line x1={190} y1={262} x2={190} y2={284} className="pv-wire" />
        <Gnd x={190} y={284} />
        <text x={204} y={216} className="pv-lbl pv-orange">
          {sub('R_L')}
        </text>
      </g>
      <text x={140} y={150} textAnchor="middle" className="pv-lbl pv-violet">
        {sub('V_out')}
      </text>
      {/* Thevenin */}
      <g data-part="thev">
        <text x={420} y={42} textAnchor="middle" className="pv-lbl">
          {tr('从滑动端看进去（戴维宁）', 'seen from the wiper (Thévenin)')}
        </text>
        <circle cx={330} cy={150} r={20} className="pv-term" />
        <text x={330} y={146} textAnchor="middle" className="pv-lbl">
          +
        </text>
        <text x={330} y={162} textAnchor="middle" className="pv-lbl">
          −
        </text>
        <text x={322} y={196} textAnchor="end" className="pv-lbl">
          {sub('V_th = 4.5 V')}
        </text>
        <path d="M330 130 L330 90 L370 90" className="pv-wire" />
        <Zig x1={370} y1={90} x2={470} y2={90} body={46} />
        <text x={420} y={74} textAnchor="middle" className="pv-lbl">
          {sub('R_th = 2.5 kΩ')}
        </text>
        <line x1={470} y1={90} x2={500} y2={90} className="pv-wire" />
        <circle cx={504} cy={90} r={4} className="pv-term" />
        <path d="M330 170 L330 220 L500 220" className="pv-wire" />
        <circle cx={504} cy={220} r={4} className="pv-term" />
        <path d="M504 100 L504 208" className="pv-thin" markerEnd="url(#pt-ah)" />
        <text x={498} y={160} textAnchor="end" className="pv-lbl pv-violet">
          {sub('V_out')}
        </text>
      </g>
      {/* bar chart */}
      <text x={280} y={322} textAnchor="middle" className="pv-lbl">
        {sub(tr('V_out（旋钮在中间，x = 0.5）', 'V_out (knob in the middle, x = 0.5)'))}
      </text>
      {cases.map(([label, v, c], i) => (
        <g key={i} data-part={i === 0 ? 'thev' : 'load'}>
          <text x={150} y={348 + i * 22} textAnchor="end" className="td-small">
            {sub(label)}
          </text>
          <rect x={158} y={336 + i * 22} width={v * 60} height={16} rx={3} fill={c} opacity={0.85} />
          <text x={164 + v * 60} y={348 + i * 22} className="pv-lbl">
            {v.toFixed(2)} V
          </text>
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ marking / taper (layer 6) */

function Taper({ layer }: { layer: number }) {
  const gx = 90;
  const gy = 400;
  const GX = (f: number) => gx + f * 220;
  const GY = (f: number) => gy - f * 220;
  const log = Array.from({ length: 41 }, (_, k) => {
    const f = k / 40;
    const r = (Math.pow(10, 2 * f) - 1) / 99;
    return `${GX(f)},${GY(r)}`;
  }).join(' ');
  return (
    <g className={show(layer === 6)}>
      <g data-part="mark">
        <circle cx={140} cy={92} r={58} fill="#2f4d8a" stroke="#1d335f" strokeWidth={2} />
        <text x={140} y={100} textAnchor="middle" className="pv-eq" style={{ fill: '#fff', fontSize: 22 }}>
          B103
        </text>
      </g>
      <text x={220} y={66} className="pv-lbl" data-part="taperB">
        {tr('B = 线性（linear）', 'B = linear taper')}
      </text>
      <text x={220} y={90} className="pv-lbl" data-part="mark">
        {tr('103 = 10 × 10³ Ω = 10 kΩ', '103 = 10 × 10³ Ω = 10 kΩ')}
      </text>
      <text x={220} y={114} className="td-small">
        {tr('（A = 对数 / 音频 audio taper）', '(A = logarithmic / audio taper)')}
      </text>
      <rect x={gx - 50} y={160} width={300} height={270} rx={12} className="td-panel" />
      <line x1={gx} y1={gy} x2={GX(1.08)} y2={gy} className="pv-axis" markerEnd="url(#pt-ah)" />
      <line x1={gx} y1={gy} x2={gx} y2={GY(1.06)} className="pv-axis" markerEnd="url(#pt-ah)" />
      <text x={GX(1)} y={gy + 18} textAnchor="end" className="td-small">
        {tr('转角 100%', 'rotation 100%')}
      </text>
      <text x={gx - 6} y={GY(1) + 4} textAnchor="end" className="td-small">
        R
      </text>
      <text x={gx + 8} y={GY(1.04)} className="pv-lbl">
        {sub('R_12')}
      </text>
      <line x1={GX(0)} y1={GY(0)} x2={GX(1)} y2={GY(1)} className="pv-curve violet" data-part="taperB" />
      <polyline points={log} className="pv-curve" data-part="taperA" />
      <text x={GX(0.5) - 8} y={GY(0.5) - 8} textAnchor="end" className="pv-lbl pv-violet" data-part="taperB">
        B
      </text>
      <text x={GX(0.93)} y={GY(0.6)} className="pv-lbl pv-red" data-part="taperA">
        A (log)
      </text>
      {/* real-pot notes */}
      <g data-part="wiperlim">
        <rect x={360} y={180} width={180} height={88} rx={10} className="td-panel" />
        <text x={450} y={204} textAnchor="middle" className="pv-lbl">
          {tr('滑动端电流', 'wiper current')}
        </text>
        <text x={450} y={226} textAnchor="middle" className="td-small">
          {tr('最好 ≤ 1–5 mA', 'best ≤ 1–5 mA')}
        </text>
        <text x={450} y={246} textAnchor="middle" className="td-small">
          {tr('电流挤在一个接触点上', 'squeezed through one contact')}
        </text>
      </g>
      <g data-part="power">
        <rect x={360} y={284} width={180} height={88} rx={10} className="td-panel" />
        <text x={450} y={308} textAnchor="middle" className="pv-lbl">
          {tr('额定 ≈ 0.1–0.25 W', 'rated ≈ 0.1–0.25 W')}
        </text>
        <text x={450} y={330} textAnchor="middle" className="td-small">
          {tr('x 很小时，全部功率', 'at small x all the power')}
        </text>
        <text x={450} y={350} textAnchor="middle" className="td-small">
          {tr('落在一小段碳道上', 'lands on a short piece of track')}
        </text>
      </g>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="pt-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pv-ah" />
        </marker>
        <marker id="pt-ahw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#fff" />
        </marker>
      </defs>
      <Pot layer={layer} />
      <Equivalent layer={layer} />
      <Divider layer={layer} />
      <Rheostat layer={layer} />
      <Loading layer={layer} />
      <Taper layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'potentiometer',
    title: tr('电位器 Potentiometer：一个可以滑动的分压器', 'The potentiometer: a voltage divider you can slide'),
    subtitle: tr(
      '三只脚、一条马蹄形碳道、一个在上面滑动的触点。拆开后它就是两个电阻 R·x 和 R·(1−x)。接法不同，它可以当分压器（输出可调电压），也可以当可变电阻（rheostat，调电流）。',
      'Three legs, a horseshoe carbon track and a contact sliding on it. Taken apart it is two resistors, R·x and R·(1−x). Wired one way it is a voltage divider (an adjustable voltage); wired another, a variable resistor (rheostat, an adjustable current).',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'outside',
        short: tr('外形', 'Outside'),
        title: tr('① 外形：一个旋钮、三只脚', '① Outside: one knob, three legs'),
        body: tr(
          `**potentiometer（电位器，常简称 pot）** 是一个可以调的电阻。从外面看：一个能转约 270° 的 [[knob|旋钮 knob]]，下面三只排成一排的脚：
- [[leg1|1 脚]] 和 [[leg3|3 脚]]：碳道的 **两端**，它们之间的电阻 **固定**，就是标称值（这里 10 kΩ）；
- [[leg2|2 脚]]（中间）：**wiper（滑动端）**，跟着旋钮在碳道上移动。

旋钮位置用 **x** 表示（0 … 1，也就是 0% … 100%）：本课程（和仿真器）规定 x 是 **从 1 脚量起** 的比例。x = 0 时滑动端就在 1 脚上；x = 1 时在 3 脚上。

[[body|外壳]] 上印着 **B103**：B 表示线性，103 表示 10 kΩ（第 ⑦ 层解释）。在面包板上三只脚各占一列，绝对不能插在同一列里——那样三只脚被短接，电位器就没用了。`,
          `A **potentiometer** (pot) is an adjustable resistor. From outside: a [[knob|knob]] that turns about 270°, and three legs in a row:
- [[leg1|leg 1]] and [[leg3|leg 3]]: the **two ends** of the track; the resistance between them is **fixed** — the nominal value (here 10 kΩ);
- [[leg2|leg 2]] (middle): the **wiper**, which moves along the track with the knob.

The knob position is called **x** (0 … 1, i.e. 0 % … 100 %). In this course (and in the simulator) x is measured **from leg 1**: at x = 0 the wiper sits on leg 1; at x = 1 on leg 3.

The [[body|case]] says **B103**: B means linear, 103 means 10 kΩ (layer ⑦). On the breadboard each leg gets its own column — never put them in one column, which would short all three and make the pot useless.`,
        ),
        table: {
          head: [tr('脚', 'Leg'), tr('名字', 'Name'), tr('接在碳道哪里', 'Where on the track'), tr('对其他脚的电阻', 'Resistance to other legs')],
          rows: [
            ['1', tr('端点 A（end）', 'end A'), tr('碳道起点（x = 0）', 'start of the track (x = 0)'), tr('到 3：R；到 2：R·x', 'to 3: R; to 2: R·x')],
            ['2', tr('滑动端（wiper）', 'wiper'), tr('跟着旋钮走', 'moves with the knob'), tr('到 1：R·x；到 3：R·(1−x)', 'to 1: R·x; to 3: R·(1−x)')],
            ['3', tr('端点 B（end）', 'end B'), tr('碳道终点（x = 1）', 'end of the track (x = 1)'), tr('到 1：R；到 2：R·(1−x)', 'to 1: R; to 2: R·(1−x)')],
          ],
          parts: ['leg1', 'leg2', 'leg3'],
        },
        callouts: [
          { part: 'knob', label: tr('旋钮（约 270°）', 'knob (≈ 270°)'), x: 300, y: 160, lx: 450, ly: 40 },
          { part: 'leg2', label: tr('2 = 滑动端', '2 = wiper'), x: 286, y: 360, lx: 420, ly: 380 },
          { part: 'leg1', label: tr('1、3 = 两端', '1, 3 = the ends'), x: 214, y: 360, lx: 120, ly: 380 },
        ],
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：马蹄形碳道和一个滑动触点', '② X-ray: a horseshoe track and a sliding contact'),
        body: tr(
          `把外壳变透明：
1. [[track|碳道 resistive track]]：印在绝缘底板上的一条 **马蹄形** 碳膜（270° 的圆弧）。它的两端分别接 [[leg1|1 脚]] 和 [[leg3|3 脚]]。它就是一个 **被弯成弧形的电阻**：和上一个拆解里的螺旋膜一样，$R = \\frac{ρL}{A}$，整条碳道 10 kΩ。
2. [[wiper|滑动触点 wiper]]：一片铜弹片，固定在旋钮轴上，压在碳道表面。转旋钮，它就沿碳道滑动。
3. [[collector|集电环 collector ring]]：轴周围的一圈金属，滑片的另一端一直压着它；它接 [[leg2|2 脚]]。这样不管滑片转到哪，2 脚都和触点相连。

所以：从 1 脚走到触点，电流要走过碳道的 **x** 那一段；从触点走到 3 脚，走过剩下的 **1 − x**。电阻和长度成正比 → 下一层的等效电路。`,
          `Make the case transparent:
1. [[track|the resistive track]]: a **horseshoe** of carbon film (a 270° arc) printed on an insulating base. Its ends go to [[leg1|leg 1]] and [[leg3|leg 3]]. It is simply **a resistor bent into an arc**: like the spiral film in the resistor teardown, $R = \\frac{ρL}{A}$, 10 kΩ for the whole track.
2. [[wiper|the wiper]]: a copper spring fixed to the knob shaft, pressing on the track. Turn the knob and it slides along.
3. [[collector|the collector ring]]: a metal ring round the shaft that the other end of the wiper always touches; it goes to [[leg2|leg 2]]. So wherever the wiper is, leg 2 is connected to it.

So from leg 1 to the contact the current crosses the fraction **x** of the track, and from the contact to leg 3 the remaining **1 − x**. Resistance is proportional to length → the equivalent circuit in the next layer.`,
        ),
        callouts: [
          { part: 'track', label: tr('碳道（10 kΩ）', 'carbon track (10 kΩ)'), x: 350, y: 110, lx: 440, ly: 40 },
          { part: 'wiper', label: tr('滑片', 'wiper'), x: 230, y: 160, lx: 90, ly: 100 },
          { part: 'collector', label: tr('集电环 → 2 脚', 'collector → leg 2'), x: 298, y: 196, lx: 460, ly: 250 },
        ],
      },
      {
        id: 'model',
        short: tr('等效电路', 'Model'),
        title: tr('③ 等效电路：两个电阻 R·x 和 R·(1−x)', '③ Equivalent circuit: two resistors, R·x and R·(1−x)'),
        body: tr(
          `把碳道拉直，电阻和长度成正比（$R ∝ L$），所以滑动端把总电阻 R 切成两段：
$$R_{12} = R·x,   R_{23} = R·(1-x)$$
- [[rx|1–2 之间]]：$R·x$；
- [[r1x|2–3 之间]]：$R·(1-x)$；
- 两段之和永远是 R：$R_{12} + R_{23} = R$。

**带数字**：10 kΩ、旋钮在 x = 0.3：$R_{12} = 3 kΩ$，$R_{23} = 7 kΩ$。转到 x = 0.9：$R_{12} = 9 kΩ$，$R_{23} = 1 kΩ$。

所以电位器 **不是** 一种新元件——它是两个串联电阻，中间那个结点（[[wiper|2 脚]]）引了出来，而且两个电阻的比例可以调。后面两层是它的两种用法：三只脚都用（分压器），或只用两只脚（可变电阻）。`,
          `Straighten the track: resistance is proportional to length ($R ∝ L$), so the wiper cuts the total R into two parts:
$$R_{12} = R·x,   R_{23} = R·(1-x)$$
- [[rx|between 1 and 2]]: $R·x$;
- [[r1x|between 2 and 3]]: $R·(1-x)$;
- they always add up to R: $R_{12} + R_{23} = R$.

**With numbers**: 10 kΩ, knob at x = 0.3: $R_{12} = 3 kΩ$, $R_{23} = 7 kΩ$. At x = 0.9: $R_{12} = 9 kΩ$, $R_{23} = 1 kΩ$.

So a pot is **not** a new kind of part — it is two resistors in series with the middle node ([[wiper|leg 2]]) brought out, and an adjustable ratio. The next two layers are its two uses: all three legs (a divider) or only two (a variable resistor).`,
        ),
        formulas: [{ tex: 'R_{12} = R·x, R_{23} = R·(1-x)', note: tr('x 从 1 脚量起，0 … 1', 'x measured from leg 1, 0 … 1') }],
        calcs: ['series-resistance'],
      },
      {
        id: 'divider',
        short: tr('分压器', 'Divider'),
        title: tr('④ 用法一：三只脚都接——可调的分压器', '④ Use 1: all three legs — an adjustable voltage divider'),
        body: tr(
          `1 脚接 +5 V，3 脚接 GND，从 2 脚取 [[vout|输出电压]]。这就是 **voltage divider（分压器）**：两个串联电阻，取中间结点的电压。

推导（2 脚不接负载，没有电流流出）：
1. 两个电阻串联，电流相同：$I = \\frac{V_s}{R·x + R(1-x)} = \\frac{V_s}{R}$
2. 输出电压就是 [[r1x|下面那段]] 上的电压：$V_{out} = I·R(1-x)$
3. 代入：
$$V_{out} = V_s·\\frac{R_{23}}{R_{12}+R_{23}} = V_s·(1-x)$$
**带数字**：$V_s = 5 V$，x = 0.3 → $V_{out} = 5 × 0.7 = 3.5 V$。x 从 0 转到 1，输出从 5 V **线性地** 降到 0 V（右图的直线）。想让顺时针转电压升高，就把 1、3 两只脚对调。

注意结果 **和 R 无关**：1 kΩ 还是 100 kΩ 的电位器，空载时输出一样。R 决定的是电位器自己耗多少电流：$\\frac{5 V}{10 kΩ} = 0.5 mA$。`,
          `Leg 1 to +5 V, leg 3 to GND, and take the [[vout|output voltage]] from leg 2. This is a **voltage divider**: two resistors in series, tapping the middle node.

Derivation (nothing connected to leg 2, so no current leaves it):
1. Series resistors carry the same current: $I = \\frac{V_s}{R·x + R(1-x)} = \\frac{V_s}{R}$
2. The output is the voltage across [[r1x|the lower part]]: $V_{out} = I·R(1-x)$
3. Substitute:
$$V_{out} = V_s·\\frac{R_{23}}{R_{12}+R_{23}} = V_s·(1-x)$$
**With numbers**: $V_s = 5 V$, x = 0.3 → $V_{out} = 5 × 0.7 = 3.5 V$. Turning x from 0 to 1 moves the output **linearly** from 5 V to 0 V (the straight line on the right). Swap legs 1 and 3 if you want clockwise to mean "more".

The result **does not depend on R**: a 1 kΩ or a 100 kΩ pot gives the same unloaded output. R sets how much current the pot itself draws: $\\frac{5 V}{10 kΩ} = 0.5 mA$.`,
        ),
        formulas: [
          { tex: 'V_{out} = V_s·\\frac{R_{23}}{R_{12} + R_{23}} = V_s·(1-x)', note: tr('空载（2 脚不取电流）', 'unloaded (no current out of leg 2)') },
          { tex: 'V_{out} = 5 V × (1 - 0.3) = 3.5 V' },
        ],
        calcs: ['voltage-divider'],
      },
      {
        id: 'rheostat',
        short: tr('可变电阻', 'Rheostat'),
        title: tr('⑤ 用法二：只用两只脚——可变电阻（调光实验）', '⑤ Use 2: two legs only — a variable resistor (the dimmer lab)'),
        body: tr(
          `调光实验（challenge-pot-dimmer）这样接：+5 V → 1 脚；[[short|2 脚和 3 脚连在一起]]；再串 [[r220|220 Ω]] 和 [[led|红色 LED]] 到 GND。

2、3 短接后，$R_{23}$ 被短路，只剩 [[rx|$R_{12} = R·x$]]——电位器变成一个 **rheostat（可变电阻）**，从 0 调到 10 kΩ。为什么要把 2、3 连起来，而不是让 3 脚空着？如果滑片接触不良（旧电位器常见），电流还能走 3 脚，电阻最多是 R，**不会突然断路**。

用 LED 模型（红：1.8 V + 12 Ω）写 KVL：
$$I = \\frac{V_s - V_F}{R·x + 220 + 12} = \\frac{3.2 V}{232 Ω + 10 kΩ·x}$$
- x = 0：$I = \\frac{3.2}{232} = 13.8 mA$，最亮；
- x = 0.1：2.6 mA；x = 0.25：1.17 mA；x = 0.5：0.61 mA；
- x = 1：$I = \\frac{3.2}{10232} = 0.31 mA$，几乎灭。

曲线是 [[curve|双曲线]]：大部分亮度变化挤在 x < 0.2 那一小段（这就是调光要用对数电位器的原因，见第 ⑦ 层）。**220 Ω 为什么不能省**：x = 0 时电位器是 0 Ω，没有它 LED 直接接在 5 V 上：$\\frac{3.2}{12} ≈ 270 mA$，立刻烧掉。

最大功率实验（exp-max-power）用的是同一种接法：2.2 kΩ 电位器当负载 $R_L = 2.2 kΩ·x$，$R_L = R_{eq} = 1158 Ω$（x ≈ 53%）时负载功率最大。`,
          `The dimmer challenge (challenge-pot-dimmer) is wired: +5 V → leg 1; [[short|legs 2 and 3 joined]]; then [[r220|220 Ω]] and a [[led|red LED]] to GND.

With 2 and 3 joined, $R_{23}$ is shorted and only [[rx|$R_{12} = R·x$]] is left — the pot is now a **rheostat** (variable resistor) from 0 to 10 kΩ. Why join 2 and 3 instead of leaving 3 open? If the wiper loses contact (common on old pots) the current can still go through leg 3, so the resistance is at most R — **never a sudden open circuit**.

KVL with the LED model (red: 1.8 V + 12 Ω):
$$I = \\frac{V_s - V_F}{R·x + 220 + 12} = \\frac{3.2 V}{232 Ω + 10 kΩ·x}$$
- x = 0: $I = \\frac{3.2}{232} = 13.8 mA$, brightest;
- x = 0.1: 2.6 mA; x = 0.25: 1.17 mA; x = 0.5: 0.61 mA;
- x = 1: $I = \\frac{3.2}{10232} = 0.31 mA$, nearly off.

The curve is a [[curve|hyperbola]]: most of the change in brightness is squeezed into x < 0.2 (which is why dimmers use log pots, layer ⑦). **Why the 220 Ω must stay**: at x = 0 the pot is 0 Ω, and without it the LED sits straight on 5 V: $\\frac{3.2}{12} ≈ 270 mA$ — instantly dead.

The max-power lab (exp-max-power) uses the same wiring: a 2.2 kΩ pot as the load $R_L = 2.2 kΩ·x$; the load power peaks at $R_L = R_{eq} = 1158 Ω$ (x ≈ 53 %).`,
        ),
        table: {
          head: ['x', tr('电位器 R·x', 'pot R·x'), tr('总电阻', 'total R'), tr('LED 电流', 'LED current')],
          rows: [
            ['0', '0 Ω', '232 Ω', '13.8 mA'],
            ['0.1', '1 kΩ', '1.23 kΩ', '2.6 mA'],
            ['0.25', '2.5 kΩ', '2.73 kΩ', '1.17 mA'],
            ['0.5', '5 kΩ', '5.23 kΩ', '0.61 mA'],
            ['1', '10 kΩ', '10.2 kΩ', '0.31 mA'],
          ],
          parts: ['curve', 'curve', 'curve', 'curve', 'curve'],
        },
        formulas: [{ tex: 'I = \\frac{V_s - V_F}{R·x + R_{series} + 12 Ω}', note: tr('2、3 短接的可变电阻 + LED', 'rheostat (2–3 joined) + LED') }],
        calcs: ['led-resistor', 'ohm'],
      },
      {
        id: 'loading',
        short: tr('负载', 'Loading'),
        title: tr('⑥ 分压器接上负载，电压就掉', '⑥ Load the divider and its voltage drops'),
        body: tr(
          `第 ④ 层的 $V_{out} = V_s(1-x)$ 有个前提：**2 脚不取电流**。接上一个 [[load|负载 $R_L$]]，它和下面那段 $R_{23}$ **并联**，下面那段的等效电阻变小，输出就下降。

**例**：9 V，10 kΩ 电位器转到中间（5 k / 5 k），空载 4.5 V。
- $R_L = 100 kΩ$：$5k ∥ 100k = 4.76 kΩ$，$V_{out} = 9 × \\frac{4.76}{5 + 4.76} = 4.39 V$（只掉 2%）；
- $R_L = 10 kΩ$：$5k ∥ 10k = 3.33 kΩ$，$V_{out} = 3.6 V$（掉 20%）；
- $R_L = 1 kΩ$：$5k ∥ 1k = 0.83 kΩ$，$V_{out} = 1.29 V$（掉 71%）！

**更快的看法：戴维宁（Thévenin）**。从 2 脚看进去，电位器等于 [[thev|一个电压源串一个电阻]]：
$$V_{th} = V_s(1-x),   R_{th} = R_{12} ∥ R_{23} = R·x(1-x)$$
x = 0.5 时 $R_{th}$ 最大，$= \\frac{R}{4} = 2.5 kΩ$。于是 $V_{out} = V_{th}·\\frac{R_L}{R_{th}+R_L}$，一眼就能看出：**$R_L$ 要比 $R_th$ 大 10 倍以上**，误差才 < 10%。

所以电位器分压适合给“几乎不取电流”的输入（op-amp 输入、ADC、示波器）提供电压；要带 1 kΩ 这种重负载，要么换小阻值电位器，要么在后面加一个 op-amp 跟随器（voltage follower）。`,
          `The $V_{out} = V_s(1-x)$ of layer ④ assumed **no current out of leg 2**. Connect a [[load|load $R_L$]] and it sits **in parallel** with the lower part $R_{23}$; the lower part’s resistance shrinks and the output drops.

**Example**: 9 V, 10 kΩ pot in the middle (5 k / 5 k), 4.5 V unloaded.
- $R_L = 100 kΩ$: $5k ∥ 100k = 4.76 kΩ$, $V_{out} = 9 × \\frac{4.76}{5 + 4.76} = 4.39 V$ (2 % down);
- $R_L = 10 kΩ$: $5k ∥ 10k = 3.33 kΩ$, $V_{out} = 3.6 V$ (20 % down);
- $R_L = 1 kΩ$: $5k ∥ 1k = 0.83 kΩ$, $V_{out} = 1.29 V$ (71 % down)!

**The quick way: Thévenin.** Seen from leg 2 the pot is [[thev|a voltage source in series with a resistor]]:
$$V_{th} = V_s(1-x),   R_{th} = R_{12} ∥ R_{23} = R·x(1-x)$$
$R_{th}$ is largest at x = 0.5: $\\frac{R}{4} = 2.5 kΩ$. Then $V_{out} = V_{th}·\\frac{R_L}{R_{th}+R_L}$, and you see at once that **$R_L$ must be over 10× $R_th$** for an error under 10 %.

So a pot divider is for inputs that draw almost no current (op-amp inputs, an ADC, a scope). To drive a heavy 1 kΩ load either use a smaller pot or buffer it with an op-amp voltage follower.`,
        ),
        formulas: [
          { tex: 'R_{th} = R·x(1-x) ≤ \\frac{R}{4}', note: tr('10 kΩ 电位器最多 2.5 kΩ', 'at most 2.5 kΩ for a 10 kΩ pot') },
          { tex: 'V_{out} = V_{th}·\\frac{R_L}{R_{th} + R_L}', note: tr('$R_L$ = 1 kΩ：4.5 × 1 / 3.5 = 1.29 V', '$R_L$ = 1 kΩ: 4.5 × 1 / 3.5 = 1.29 V') },
        ],
        calcs: ['loaded-divider', 'voltage-divider', 'parallel-resistance'],
      },
      {
        id: 'limits',
        short: tr('局限', 'Limits'),
        title: tr('⑦ 型号、阻值曲线和真实电位器的局限', '⑦ Markings, taper and the limits of a real pot'),
        body: tr(
          `**读型号**：[[mark|B103]]——字母是 **taper（阻值曲线）**，数字是阻值：前两位是有效数字，第三位是 10 的几次方：103 = 10 × 10³ Ω = 10 kΩ，502 = 5 kΩ，104 = 100 kΩ。

**两种曲线**：
- [[taperB|B = 线性（linear）]]：$R_{12}$ 和转角成正比，本课程和仿真器都用这种；
- [[taperA|A = 对数（logarithmic / audio）]]：开始变得很慢，最后很快。人耳和人眼对强度的感觉是 **对数** 的，所以音量、调光用 A 型，转起来感觉才“均匀”。

**真实电位器的局限**：
- [[wiperlim|滑片电流]]：所有电流都挤过一个小接触点，一般不超过几 mA；接触不良时会“沙沙”响、读数跳动（noise）。
- [[power|额定功率]] 0.1–0.25 W 指的是 **整条碳道** 均匀发热。当可变电阻用、x 很小时，同样的电流只流过一小段碳道，那一小段会局部过热。所以调光电路一定要串保护电阻。
- 端点残余电阻：转到头也不是精确的 0 Ω，常有几 Ω 到几十 Ω；误差一般 ±20%。
- 寿命：碳膜电位器约 1 万次旋转。

**仿真器里**：电位器是理想的线性电位器：$R_{12} = R·x$ 精确成立，x 可以连续取 0 … 1，没有残余电阻、噪声和功率限制。`,
          `**Reading the marking**: [[mark|B103]] — the letter is the **taper**, the digits the value: two significant digits and a power of ten: 103 = 10 × 10³ Ω = 10 kΩ, 502 = 5 kΩ, 104 = 100 kΩ.

**Two tapers**:
- [[taperB|B = linear]]: $R_{12}$ is proportional to rotation; this course and the simulator use it;
- [[taperA|A = logarithmic (audio)]]: slow at first, fast at the end. Ears and eyes sense intensity **logarithmically**, so volume and dimmer knobs use A to feel "even".

**Limits of a real pot**:
- [[wiperlim|wiper current]]: all the current squeezes through one small contact, so keep it to a few mA; a dirty contact crackles and makes readings jump (noise).
- [[power|power rating]] of 0.1–0.25 W assumes the **whole track** heats evenly. Used as a rheostat at small x, the same current flows through a short piece of track, which overheats locally. Always keep the protective series resistor in a dimmer.
- End resistance: fully turned it is not exactly 0 Ω but a few to tens of ohms; tolerance is typically ±20 %.
- Life: a carbon pot lasts about 10 000 turns.

**In the simulator** a pot is ideal and linear: $R_{12} = R·x$ exactly, x anywhere from 0 to 1, no end resistance, noise or power limit.`,
        ),
        table: {
          head: [tr('参数', 'Parameter'), tr('常见真实值', 'Typical real value'), tr('仿真器', 'Simulator')],
          rows: [
            [tr('阻值误差', 'Tolerance'), '±20%', '0'],
            [tr('曲线', 'Taper'), tr('A（对数）或 B（线性）', 'A (log) or B (linear)'), tr('B（线性）', 'B (linear)')],
            [tr('额定功率', 'Power rating'), '0.1–0.25 W', tr('不检查', 'not checked')],
            [tr('滑片电流', 'Wiper current'), tr('≤ 几 mA', '≤ a few mA'), tr('不限', 'unlimited')],
            [tr('端点残余电阻', 'End resistance'), tr('几 Ω – 几十 Ω', 'a few – tens of Ω'), '0'],
          ],
          parts: ['mark', 'taperB', 'power', 'wiperlim', 'mark'],
        },
      },
    ],
    recap: tr(
      '电位器 = 一条碳道 + 一个滑片 = **两个串联电阻 R·x 和 R·(1−x)**，中间结点引出来。三只脚都接是分压器 $V_{out} = V_s(1-x)$（只在空载时准，$R_L ≫ R_{th} = R·x(1-x)$）；2、3 短接是可变电阻 $R·x$，一定要串保护电阻。',
      'A pot is a track plus a wiper = **two series resistors R·x and R·(1−x)** with the middle node brought out. All three legs: a divider, $V_{out} = V_s(1-x)$ (exact only unloaded, $R_L ≫ R_{th} = R·x(1-x)$). Legs 2–3 joined: a variable resistor $R·x$ — always with a protective series resistor.',
    ),
  };
}
