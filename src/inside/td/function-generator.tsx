// Teardown: the function generator. Front panel (waveform, frequency, amplitude, offset, output)
// → X-ray (clock, DDS, DAC, filter, amplitude, offset, power amplifier, 50 Ω) → how DDS makes an
// exact frequency (phase accumulator, staircase, filter) → equivalent circuit (ideal source
// v_s(t) = offset + A·sin(2πft) in series with 50 Ω) → amplitude vs Vpp vs RMS for sine / square /
// triangle → loading by a resistor (a divider with 50 Ω) → limits (50 Ω vs High-Z display, …).

import './instruments.css';
import type { ReactNode } from 'react';
import { tr } from '../../core/i18n';
import { sub, vis } from '../TeardownView';
import type { Teardown } from '../types';
import { Defs, Dot, Gnd, Res } from './multimeter';

type Kind = 'sine' | 'square' | 'triangle';

/** value of a unit waveform at phase p (in periods) */
function unit(kind: Kind, p: number) {
  const f = p - Math.floor(p);
  if (kind === 'sine') return Math.sin(2 * Math.PI * f);
  if (kind === 'square') return f < 0.5 ? 1 : -1;
  return f < 0.25 ? 4 * f : f < 0.75 ? 2 - 4 * f : 4 * f - 4;
}

/** svg path of a waveform: x0..x0+w, centre line yc, peak amp (px), `periods` periods */
export function wave(kind: Kind, x0: number, w: number, yc: number, amp: number, periods: number, phase = 0) {
  const n = kind === 'square' ? 0 : 160;
  if (kind === 'square') {
    const pts: string[] = [];
    const per = w / periods;
    for (let k = 0; k < periods; k++) {
      const xa = x0 + k * per;
      pts.push(`${k === 0 ? 'M' : 'L'}${xa} ${yc - amp}`, `L${xa + per / 2} ${yc - amp}`, `L${xa + per / 2} ${yc + amp}`, `L${xa + per} ${yc + amp}`);
      if (k < periods - 1) pts.push(`L${xa + per} ${yc - amp}`);
    }
    return pts.join(' ');
  }
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + (w * i) / n;
    const y = yc - amp * unit(kind, (periods * i) / n + phase);
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

const Panel = ({ title }: { title: ReactNode }) => (
  <>
    <rect x={20} y={20} width={520} height={400} rx={14} className="td-panel" />
    <text x={280} y={48} textAnchor="middle" className="td-panel-title">
      {title}
    </text>
  </>
);

/* ------------------------------------------------------------------ front panel */

function Front({ xray }: { xray: boolean }) {
  const op = xray ? 0.12 : 1;
  const btn = (x: number, part: string, label: string, kind?: Kind, on?: boolean) => (
    <g data-part={part} key={label}>
      <rect x={x} y={196} width={70} height={32} rx={5} className={`ins-btn ${on ? 'on' : ''}`} />
      {kind ? (
        <path d={wave(kind, x + 14, 42, 212, 8, 1)} className="tdp-line" style={{ strokeWidth: 1.8 }} />
      ) : (
        <text x={x + 35} y={217} textAnchor="middle" className="tdp-lbl" style={{ fontSize: 12 }}>
          {label}
        </text>
      )}
    </g>
  );
  return (
    <g>
      <rect x={24} y={40} width={512} height={250} rx={14} className="ins-case grey" data-part="case" style={{ opacity: op }} />
      <g style={{ opacity: op }}>
        <g data-part="display">
          <rect x={44} y={60} width={250} height={120} rx={6} className="ins-lcd" />
          <path d={wave('sine', 56, 50, 84, 10, 1)} className="tdp-line" data-part="wave" style={{ strokeWidth: 2 }} />
          <text x={116} y={89} className="ins-lcd-s" data-part="wave" style={{ fontSize: 14 }}>
            SINE
          </text>
          <text x={56} y={122} className="ins-lcd-s" data-part="freq" style={{ fontSize: 14 }}>
            FREQ 1.000 kHz
          </text>
          <text x={56} y={146} className="ins-lcd-s" data-part="ampl" style={{ fontSize: 14 }}>
            AMPL 1.000 Vpk
          </text>
          <text x={56} y={170} className="ins-lcd-s" data-part="offs" style={{ fontSize: 14 }}>
            OFFS 0.000 V
          </text>
        </g>
        {btn(44, 'wave', 'sine', 'sine', true)}
        {btn(134, 'wave', 'square', 'square')}
        {btn(224, 'wave', 'triangle', 'triangle')}
        {btn(314, 'freq', 'FREQ')}
        {btn(394, 'ampl', 'AMPL')}
        <g data-part="offs">
          <rect x={314} y={240} width={150} height={32} rx={5} className="ins-btn" />
          <text x={389} y={261} textAnchor="middle" className="tdp-lbl" style={{ fontSize: 12 }}>
            OFFSET
          </text>
        </g>
        <g data-part="knob">
          <circle cx={372} cy={118} r={38} className="ins-knob" />
          <line x1={372} y1={118} x2={392} y2={90} className="ins-pointer" style={{ strokeWidth: 4 }} />
        </g>
        <g data-part="output">
          <text x={478} y={72} textAnchor="middle" className="tdp-lbl" style={{ fontSize: 12 }}>
            OUTPUT 50 Ω
          </text>
          <circle cx={478} cy={110} r={20} className="ins-bnc" />
          <circle cx={478} cy={110} r={6} className="ins-node" />
        </g>
        <g data-part="out-on">
          <rect x={448} y={142} width={60} height={26} rx={5} className="ins-btn on" />
          <text x={478} y={160} textAnchor="middle" className="tdp-lbl" style={{ fontSize: 12 }}>
            ON
          </text>
        </g>
      </g>
      <g data-part="output leads" className={xray ? 'td-hide' : 'td-show'}>
        <path d="M498 110 C540 110 548 130 548 170 V300" className="ins-black" style={{ strokeWidth: 6 }} />
        <path d="M548 300 C548 340 470 330 470 380" className="ins-red" />
        <path d="M548 300 C548 340 530 340 530 380" className="ins-black" />
        <rect x={460} y={380} width={20} height={34} rx={4} className="ins-probe-red" />
        <rect x={520} y={380} width={20} height={34} rx={4} className="ins-probe-black" />
        <text x={452} y={402} textAnchor="end" className="tdp-lbl" style={{ fill: '#e63946' }}>
          + {tr('红', 'red')}
        </text>
        <text x={514} y={432} textAnchor="end" className="tdp-lbl">
          COM {tr('黑', 'black')}
        </text>
      </g>
    </g>
  );
}

/** the little plot under the front panel: what comes out */
function OutPlot() {
  return (
    <g data-part="wave">
      <rect x={30} y={310} width={340} height={116} rx={10} className="td-panel" />
      <line x1={70} y1={380} x2={350} y2={380} className="ins-dash" />
      <path d={wave('sine', 70, 280, 380, 34, 3)} className="tdp-accent" style={{ strokeWidth: 2.5 }} />
      <text x={56} y={330} className="td-small">
        {tr('输出 v(t)：1 kHz，幅度 1 V，偏置 0 V', 'output v(t): 1 kHz, amplitude 1 V, offset 0 V')}
      </text>
      <text x={64} y={384} textAnchor="end" className="td-small">
        0 V
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ x-ray: block chain */

function Blocks() {
  const b = (x: number, y: number, part: string, t1: string, t2: string) => (
    <g data-part={part} key={part}>
      <rect x={x} y={y} width={100} height={52} rx={8} className="ins-block" />
      <text x={x + 50} y={y + 22} textAnchor="middle" className="ins-block-t">
        {t1}
      </text>
      <text x={x + 50} y={y + 40} textAnchor="middle" className="td-small">
        {t2}
      </text>
    </g>
  );
  const arr = (x1: number, x2: number, y: number) => <line x1={x1} y1={y} x2={x2} y2={y} className="tdp-line" markerEnd="url(#fg-ah)" />;
  return (
    <g>
      {b(36, 74, 'clock', tr('① 时钟', '① clock'), tr('晶振 100 MHz', 'crystal 100 MHz'))}
      {b(156, 74, 'dds', tr('② DDS', '② DDS'), tr('相位 → 波形表', 'phase → table'))}
      {b(276, 74, 'dac', tr('③ DAC', '③ DAC'), tr('数字 → 阶梯电压', 'number → steps'))}
      {b(396, 74, 'filter', tr('④ 滤波器', '④ filter'), tr('磨平阶梯', 'smooths the steps'))}
      {arr(136, 152, 100)}
      {arr(256, 272, 100)}
      {arr(376, 392, 100)}
      <path d="M446 126 V156 H86 V182" className="tdp-line" markerEnd="url(#fg-ah)" />
      {b(36, 186, 'ampl', tr('⑤ 幅度', '⑤ amplitude'), tr('× A（衰减 / 放大）', '× A'))}
      {b(156, 186, 'offs', tr('⑥ 加偏置', '⑥ add offset'), '+ offset')}
      {b(276, 186, 'amp', tr('⑦ 功率放大', '⑦ power amp'), tr('能带负载', 'drives a load'))}
      {arr(136, 152, 212)}
      {arr(256, 272, 212)}
      <path d="M210 266 V240" className="tdp-line" markerEnd="url(#fg-ah)" data-part="offs" />
      <text x={210} y={280} textAnchor="middle" className="td-small" data-part="offs">
        {tr('偏置电压（直流）', 'offset voltage (DC)')}
      </text>
      <path d="M376 212 H396" className="tdp-line" />
      <Res x1={396} y1={212} x2={460} y2={212} part="ro" body={36} />
      <text x={428} y={196} textAnchor="middle" className="tdp-lbl" data-part="ro">
        {sub('R_o')} 50 Ω
      </text>
      <path d="M460 212 H480" className="tdp-line" data-part="ro output" />
      <g data-part="output">
        <circle cx={500} cy={212} r={20} className="ins-bnc" />
        <circle cx={500} cy={212} r={6} className="ins-node" />
        <text x={500} y={252} textAnchor="middle" className="tdp-lbl">
          BNC
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ DDS */

function Dds() {
  const cx = 130;
  const cy = 210;
  const r = 78;
  const ph = 0.15; // pointer phase (periods)
  const a = 2 * Math.PI * ph;
  const px = cx + r * Math.cos(a);
  const py = cy - r * Math.sin(a);
  const X0 = 250;
  const W = 270;
  const steps = 16;
  let stair = '';
  for (let k = 0; k <= steps; k++) {
    const x = X0 + (W * k) / steps;
    const y = cy - r * Math.sin((2 * Math.PI * k) / steps);
    stair += k === 0 ? `M${x} ${y}` : ` H${x.toFixed(1)} V${y.toFixed(1)}`;
  }
  return (
    <g>
      <Panel title={tr('DDS：一个转动的“相位”，查表得到正弦', 'DDS: a rotating phase, looked up as a sine')} />
      <g data-part="phase">
        <circle cx={cx} cy={cy} r={r} className="tdp-fill" />
        {Array.from({ length: 16 }, (_, k) => {
          const t = (2 * Math.PI * k) / 16;
          return <circle key={k} cx={cx + r * Math.cos(t)} cy={cy - r * Math.sin(t)} r={2.5} className="ins-node" />;
        })}
        <line x1={cx} y1={cy} x2={px} y2={py} className="tdp-line" style={{ strokeWidth: 3 }} markerEnd="url(#fg-ah)" />
        <path d={`M${cx + 26} ${cy} A26 26 0 0 0 ${cx + 26 * Math.cos(a)} ${cy - 26 * Math.sin(a)}`} className="tdp-accent" />
        <text x={cx + 30} y={cy - 6} className="tdp-lbl" style={{ fill: '#7a3fc0' }}>
          φ
        </text>
        <text x={cx} y={cy + r + 22} textAnchor="middle" className="td-small">
          {tr('相位累加器：每个时钟 φ += M', 'phase accumulator: φ += M each clock')}
        </text>
        <text x={cx} y={cy + r + 38} textAnchor="middle" className="td-small">
          {tr('转一圈 = 一个周期', 'one turn = one period')}
        </text>
      </g>
      <line x1={px} y1={py} x2={X0 + W * ph} y2={py} className="ins-dash" data-part="phase" />
      <line x1={X0} y1={cy} x2={X0 + W} y2={cy} className="ins-dash" />
      <path d={stair} className="tdp-line" data-part="dac" style={{ strokeWidth: 1.6 }} />
      <path d={wave('sine', X0, W, cy, r, 1)} className="tdp-accent" data-part="filter" style={{ strokeWidth: 2.5 }} />
      <text x={X0 + W * 0.3} y={cy - r - 12} textAnchor="middle" className="tdp-lbl" data-part="dac">
        {tr('DAC 输出：阶梯', 'DAC output: steps')}
      </text>
      <text x={X0 + W * 0.78} y={cy - 30} textAnchor="middle" className="tdp-lbl" data-part="filter" style={{ fill: '#7a3fc0' }}>
        {tr('滤波后', 'filtered')}
      </text>
      <g data-part="fout">
        <text x={40} y={360} className="tdp-lbl">
          {sub('f_out = M · f_clk / 2³²')}
        </text>
        <text x={40} y={382} className="td-small">
          {sub(tr('f_clk = 100 MHz：最小步进 100 MHz / 2³² ≈ 0.023 Hz', 'f_clk = 100 MHz: smallest step 100 MHz / 2³² ≈ 0.023 Hz'))}
        </text>
        <text x={40} y={402} className="td-small">
          {tr('要 1 kHz：M = 1000 × 2³² / 10⁸ ≈ 42 950，一个周期 100 000 个点', 'for 1 kHz: M = 1000 × 2³² / 10⁸ ≈ 42 950, 100 000 points per period')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ equivalent circuit */

function Equiv() {
  const y = (v: number) => 310 - v * 60;
  return (
    <g>
      <Panel title={sub(tr('等效电路：理想电压源 v_s(t) 串联 50 Ω', 'Equivalent circuit: an ideal source v_s(t) in series with 50 Ω'))} />
      <rect x={40} y={76} width={250} height={318} rx={10} className="ins-xbox" data-part="inside" />
      <text x={165} y={96} textAnchor="middle" className="ins-xbox-t">
        {tr('信号发生器内部', 'inside the generator')}
      </text>
      <g data-part="vs">
        <circle cx={100} cy={230} r={30} className="tdp-fill" />
        <path d={wave('sine', 82, 36, 230, 9, 1)} className="tdp-line" />
        <text x={100} y={190} textAnchor="middle" className="tdp-lbl" style={{ fill: '#e63946' }}>
          +
        </text>
        <text x={62} y={290} className="tdp-lbl">
          {sub('v_s(t)')}
        </text>
      </g>
      <path d="M100 200 V130 H140 M240 130 H330 M100 260 V340 H330" className="tdp-line" />
      <Res x1={140} y1={130} x2={240} y2={130} part="ro" />
      <text x={190} y={114} textAnchor="middle" className="tdp-lbl" data-part="ro">
        {sub('R_o = 50 Ω')}
      </text>
      <Dot x={330} y={130} part="term" />
      <Dot x={330} y={340} part="term" />
      <text x={338} y={126} className="tdp-lbl" data-part="term" style={{ fill: '#e63946' }}>
        +
      </text>
      <text x={338} y={356} className="tdp-lbl" data-part="term">
        COM
      </text>
      <path d="M200 340 V350" className="tdp-line" />
      <Gnd x={200} y={350} />
      <g data-part="vout">
        <path d="M318 146 V324" className="ins-meas" markerStart="url(#fg-ahp)" />
        <text x={310} y={236} textAnchor="end" className="ins-meas-t">
          {sub('v_out')}
        </text>
      </g>
      {/* the waveform with offset 1 V, amplitude 1 V */}
      <g data-part="plot">
        <line x1={360} y1={y(0)} x2={524} y2={y(0)} className="tdp-line" style={{ strokeWidth: 1 }} />
        <text x={356} y={y(0) + 4} textAnchor="end" className="td-small">
          0
        </text>
        <line x1={360} y1={y(1)} x2={524} y2={y(1)} className="ins-dash" data-part="offset" />
        <path d={wave('sine', 360, 150, y(1), 60, 1.5)} className="tdp-accent" style={{ strokeWidth: 2.5 }} />
      </g>
      <g data-part="offset">
        <path d={`M372 ${y(0) - 2} V${y(1) + 6}`} className="ins-meas" markerEnd="url(#fg-ahp)" />
        <text x={378} y={y(0.45)} className="ins-meas-t">
          {tr('偏置 1 V', 'offset 1 V')}
        </text>
      </g>
      <g data-part="amp">
        <path d={`M398 ${y(1)} V${y(2) + 6}`} className="ins-meas" markerEnd="url(#fg-ahp)" />
        <text x={404} y={y(2) - 6} className="ins-meas-t">
          A = 1 V
        </text>
      </g>
      <g data-part="vpp">
        <path d={`M520 ${y(0) - 4} V${y(2) + 4}`} className="ins-meas" markerStart="url(#fg-ahp)" markerEnd="url(#fg-ahp)" />
        <text x={516} y={y(2) - 10} textAnchor="end" className="ins-meas-t">
          Vpp = 2 V
        </text>
      </g>
      <text x={442} y={y(0) + 30} textAnchor="middle" className="td-small" data-part="vs">
        {sub('v_s = 1 + 1·sin(2π·1000·t) V')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ amplitude, Vpp, RMS */

function Rms() {
  const rows: { k: Kind; y: number; name: string; rms: number; rmsT: string }[] = [
    { k: 'sine', y: 120, name: tr('正弦', 'sine'), rms: 1 / Math.SQRT2, rmsT: 'RMS = A/√2 = 0.707 V' },
    { k: 'square', y: 236, name: tr('方波', 'square'), rms: 1, rmsT: 'RMS = A = 1 V' },
    { k: 'triangle', y: 352, name: tr('三角波', 'triangle'), rms: 1 / Math.sqrt(3), rmsT: 'RMS = A/√3 = 0.577 V' },
  ];
  const amp = 42;
  return (
    <g>
      <Panel title={tr('同样“幅度 1 V”的三种波形', 'Three waveforms, all with “amplitude 1 V”')} />
      {rows.map((r) => (
        <g key={r.k} data-part={r.k}>
          <text x={40} y={r.y - amp - 8} className="tdp-lbl">
            {r.name}
          </text>
          <line x1={60} y1={r.y} x2={330} y2={r.y} className="tdp-line" style={{ strokeWidth: 0.8 }} />
          <line x1={60} y1={r.y - amp * r.rms} x2={330} y2={r.y - amp * r.rms} className="ins-trig" style={{ stroke: '#17756c' }} />
          <path d={wave(r.k, 60, 270, r.y, amp, 2)} className="tdp-accent" style={{ strokeWidth: 2.4 }} />
          <path d={`M346 ${r.y} V${r.y - amp + 4}`} className="ins-meas" markerEnd="url(#fg-ahp)" />
          <path d={`M366 ${r.y + amp - 4} V${r.y - amp + 4}`} className="ins-meas" markerStart="url(#fg-ahp)" markerEnd="url(#fg-ahp)" />
          <text x={384} y={r.y - 20} className="ins-meas-t">
            A = 1 V
          </text>
          <text x={384} y={r.y - 2} className="ins-meas-t">
            Vpp = 2 V
          </text>
          <text x={384} y={r.y + 18} className="ins-cur-t">
            {r.rmsT}
          </text>
        </g>
      ))}
      <text x={40} y={410} className="td-small">
        {tr('绿色虚线 = 有效值（RMS）：同样的电阻上发同样热的直流电压', 'green dashed = RMS: the DC voltage that heats a resistor equally')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ loading */

function Loading() {
  // plot of R/(50+R), R from 10 Ω to 10 kΩ on a log axis
  const X = (R: number) => 330 + ((Math.log10(R) - 1) / 3) * 190;
  const Y = (k: number) => 330 - k * 200;
  let d = '';
  for (let i = 0; i <= 60; i++) {
    const R = 10 ** (1 + (3 * i) / 60);
    d += `${i ? 'L' : 'M'}${X(R).toFixed(1)} ${Y(R / (50 + R)).toFixed(1)}`;
  }
  const pt = (R: number, label: string, part: string, dx = 6, dy = 14) => (
    <g data-part={part}>
      <circle cx={X(R)} cy={Y(R / (50 + R))} r={4.5} className="ins-node" style={{ fill: '#7a3fc0' }} />
      <text x={X(R) + dx} y={Y(R / (50 + R)) + dy} className="ins-meas-t" style={{ fontSize: 11 }}>
        {label}
      </text>
    </g>
  );
  return (
    <g>
      <Panel title={sub(tr('接上负载 R_L：50 Ω 和 R_L 分压', 'With a load R_L: 50 Ω and R_L form a divider'))} />
      <g data-part="vs">
        <circle cx={70} cy={230} r={24} className="tdp-fill" />
        <path d={wave('sine', 56, 28, 230, 7, 1)} className="tdp-line" />
        <text x={102} y={252} className="tdp-lbl">
          {sub('v_s')}
        </text>
        <text x={102} y={268} className="td-small">
          2 Vpp
        </text>
      </g>
      <path d="M70 206 V130 H100 M190 130 H230 V170 M230 290 V340 H70 V254" className="tdp-line" />
      <Res x1={100} y1={130} x2={190} y2={130} part="ro" />
      <text x={145} y={114} textAnchor="middle" className="tdp-lbl" data-part="ro">
        50 Ω
      </text>
      <Res x1={230} y1={170} x2={230} y2={290} part="rl" />
      <text x={246} y={226} className="tdp-lbl" data-part="rl">
        {sub('R_L')}
      </text>
      <text x={246} y={242} className="td-small" data-part="rl">
        50 Ω
      </text>
      <Dot x={230} y={130} />
      <g data-part="vout">
        <path d="M212 176 V284" className="ins-meas" markerStart="url(#fg-ahp)" />
        <text x={204} y={234} textAnchor="end" className="ins-meas-t">
          1 Vpp
        </text>
      </g>
      <text x={40} y={380} className="tdp-lbl" data-part="formula">
        {sub('v_out = v_s · R_L / (50 + R_L)')}
      </text>
      <text x={40} y={400} className="td-small" data-part="formula">
        {tr('50 Ω 负载：2 Vpp × 50/100 = 1 Vpp，偏置 1 V 也变 0.5 V', '50 Ω load: 2 Vpp × 50/100 = 1 Vpp; a 1 V offset becomes 0.5 V too')}
      </text>
      {/* the plot */}
      <g data-part="curve">
        <line x1={330} y1={Y(0)} x2={524} y2={Y(0)} className="tdp-line" style={{ strokeWidth: 1 }} />
        <line x1={330} y1={Y(0)} x2={330} y2={Y(1) - 10} className="tdp-line" style={{ strokeWidth: 1 }} />
        <line x1={330} y1={Y(1)} x2={524} y2={Y(1)} className="ins-dash" />
        <text x={324} y={Y(1) + 4} textAnchor="end" className="td-small">
          1
        </text>
        <text x={324} y={Y(0.5) + 4} textAnchor="end" className="td-small">
          0.5
        </text>
        <text x={324} y={Y(0) + 4} textAnchor="end" className="td-small">
          0
        </text>
        {[10, 100, 1000, 10000].map((R) => (
          <text key={R} x={X(R)} y={Y(0) + 16} textAnchor="middle" className="td-small">
            {R >= 1000 ? `${R / 1000}k` : R}
          </text>
        ))}
        <text x={428} y={Y(0) + 34} textAnchor="middle" className="td-small">
          {sub('R_L (Ω)')}
        </text>
        <text x={336} y={Y(1) - 16} className="td-small">
          {sub('v_out / v_s')}
        </text>
        <path d={d} className="tdp-accent" style={{ strokeWidth: 2.5 }} />
      </g>
      {pt(50, '50 Ω → 0.5', 'rl', 8, 4)}
      {pt(1000, '1 kΩ → 0.95', 'pt-1k', -4, 22)}
      {pt(1880, '1.88 kΩ → 0.97', 'pt-rc', -40, -12)}
    </g>
  );
}

/* ------------------------------------------------------------------ limits: 50 Ω vs High-Z */

function Limits() {
  const scene = (y: number, load: '50' | 'hiz') => (
    <g data-part={load === '50' ? 'set50' : 'hiz'}>
      <rect x={40} y={y} width={150} height={70} rx={8} className="ins-case grey" />
      <rect x={52} y={y + 12} width={126} height={30} rx={4} className="ins-lcd" />
      <text x={60} y={y + 32} className="ins-lcd-s">
        1.000 Vpp [50Ω]
      </text>
      <text x={115} y={y + 60} textAnchor="middle" className="td-small">
        {tr('设定“按 50 Ω 负载”', 'setting assumes 50 Ω load')}
      </text>
      <path d={`M190 ${y + 35} H260`} className="tdp-line" />
      {load === '50' ? (
        <>
          <Res x1={260} y1={y + 35} x2={330} y2={y + 35} />
          <text x={295} y={y + 20} textAnchor="middle" className="td-small">
            {tr('50 Ω 负载', '50 Ω load')}
          </text>
        </>
      ) : (
        <>
          <path d={`M260 ${y + 35} H330`} className="ins-dash" />
          <text x={295} y={y + 20} textAnchor="middle" className="td-small">
            {tr('高阻（示波器、RC）', 'high-Z (scope, RC)')}
          </text>
        </>
      )}
      <path d={wave('sine', 350, 120, y + 35, load === '50' ? 14 : 28, 2)} className="tdp-accent" style={{ strokeWidth: 2.2 }} />
      <text x={480} y={y + 40} className="ins-meas-t">
        {load === '50' ? '1 Vpp' : '2 Vpp!'}
      </text>
    </g>
  );
  return (
    <g>
      <Panel title={tr('真实仪器的一个坑：50 Ω 显示 vs High-Z', 'A real-instrument trap: 50 Ω display vs High-Z')} />
      {scene(80, '50')}
      {scene(190, 'hiz')}
      <g data-part="edges">
        <text x={40} y={300} className="tdp-lbl">
          {tr('方波的边沿不是竖直的：', 'Square-wave edges are not vertical:')}
        </text>
        <path d="M60 390 H120 L132 330 H230 L242 390 H340 L352 330 H420" className="tdp-accent" style={{ strokeWidth: 2.2 }} />
        <path d="M120 404 H132" className="ins-meas" />
        <text x={146} y={410} className="ins-meas-t" style={{ fontSize: 11 }}>
          {tr('上升时间 ≈ 10 ns', 'rise time ≈ 10 ns')}
        </text>
      </g>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <Defs id="fg" />
      <g className={vis(layer, 0, 1)}>
        <Front xray={layer >= 1} />
      </g>
      <g className={vis(layer, 0, 0)}>
        <OutPlot />
      </g>
      <g className={vis(layer, 1, 1)}>
        <Blocks />
      </g>
      <g className={vis(layer, 2, 2)}>
        <Dds />
      </g>
      <g className={vis(layer, 3, 3)}>
        <Equiv />
      </g>
      <g className={vis(layer, 4, 4)}>
        <Rms />
      </g>
      <g className={vis(layer, 5, 5)}>
        <Loading />
      </g>
      <g className={vis(layer, 6)}>
        <Limits />
      </g>
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'function-generator',
    title: tr('信号发生器：一个会变的电压源 + 50 Ω', 'Function generator: a time-varying source plus 50 Ω'),
    subtitle: tr(
      'function generator（信号发生器）按你的设定输出正弦波、方波或三角波。拆开看，它是一条“数字 → 模拟”的流水线；装回去，它就是电路课里的 **理想电压源 $v_s(t)$ 串联 50 Ω 内阻**——幅度、偏置、负载效应都从这个模型算出来。',
      'A function generator outputs the sine, square or triangle wave you set. Taken apart it is a digital-to-analog pipeline; put back together it is the circuit-course model **ideal source $v_s(t)$ in series with 50 Ω** — amplitude, offset and loading all follow from it.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'front',
        short: tr('面板', 'Front'),
        title: tr('① 面板：波形、频率、幅度、偏置、输出', '① Front panel: waveform, frequency, amplitude, offset, output'),
        body: tr(
          `信号发生器的面板只回答四个问题：**什么形状、多快、多大、中心在哪**，再加一个“开不开输出”。
- [[wave|波形按键]]：正弦（sine）、方波（square）、三角波（triangle）；
- [[freq|频率 FREQ]]：每秒重复多少次，单位 Hz；周期 $T = \\frac{1}{f}$；
- [[ampl|幅度 AMPL]]：波形最高点离中心线多远（峰值，peak）。很多仪器也可以按峰峰值 Vpp 或有效值 RMS 输入，**一定要看清单位**；
- [[offs|偏置 OFFSET]]：给整个波形加一个直流电压，把中心线上下平移；
- [[output|输出 OUTPUT]]：一个 BNC 插座，旁边印着 **50 Ω**——这是输出电阻，第 ④ 层的主角。[[out-on|ON 键]] 打开输出。

[[wave|下面的小图]] 是课程默认设定（1 kHz、幅度 1 V、偏置 0）输出的样子。在仿真里，这些设定都在元件的“属性”面板里；它有两根引线：[[leads|红 + 和黑 COM]]，黑的那根接电路的 GND。`,
          `A generator's front panel answers four questions — **what shape, how fast, how big, centred where** — plus "is the output on".
- [[wave|waveform keys]]: sine, square, triangle;
- [[freq|FREQ]]: repetitions per second, in Hz; period $T = \\frac{1}{f}$;
- [[ampl|AMPL]]: how far the top of the wave is from the centre line (the peak). Many instruments also accept Vpp or RMS — **always check the unit**;
- [[offs|OFFSET]]: adds a DC voltage to the whole wave, shifting its centre line up or down;
- [[output|OUTPUT]]: a BNC socket printed with **50 Ω** — the output resistance, the star of layer ④. The [[out-on|ON key]] enables it.

[[wave|The little plot]] shows the course's default setting (1 kHz, amplitude 1 V, offset 0). In the simulator these settings are in the part's Properties; it has two leads, [[leads|red + and black COM]], and the black one goes to the circuit's GND.`,
        ),
        table: {
          head: [tr('控件', 'Control'), tr('设定什么', 'Sets'), tr('课程默认', 'Course default'), tr('在公式里是', 'In the formula')],
          rows: [
            [tr('波形', 'waveform'), tr('正弦 / 方波 / 三角波', 'sine / square / triangle'), tr('正弦', 'sine'), tr('sin(·) 换成方波 / 三角函数', 'sin(·) or square / triangle')],
            [tr('频率 FREQ', 'FREQ'), tr('每秒周期数', 'periods per second'), '1 kHz', '$f$，$T = 1/f$ = 1 ms'],
            [tr('幅度 AMPL', 'AMPL'), tr('峰值（离中心线）', 'peak (from centre)'), '1 V', '$A$'],
            [tr('偏置 OFFSET', 'OFFSET'), tr('直流平移', 'DC shift'), '0 V', '$U_{off}$'],
            [tr('输出 OUTPUT', 'OUTPUT'), tr('开 / 关，内阻 50 Ω', 'on / off, 50 Ω inside'), 'ON', '$R_o$ = 50 Ω'],
          ],
          parts: ['wave', 'freq', 'ampl', 'offs', 'output'],
        },
        callouts: [{ part: 'knob', label: tr('旋钮：改选中的那一项', 'knob: changes the selected item'), x: 372, y: 80, lx: 300, ly: 24, anchor: 'middle' }],
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：时钟 → DDS → DAC → 滤波 → 幅度 → 偏置 → 功放 → 50 Ω', '② X-ray: clock → DDS → DAC → filter → amplitude → offset → power amp → 50 Ω'),
        body: tr(
          `现代信号发生器里，波形是 **先算出来、再变成电压** 的。顺着信号走一遍：
1. [[clock|时钟]]：一颗晶振，给出非常稳定的 100 MHz 节拍——仪器频率准不准，全看它；
2. [[dds|DDS（direct digital synthesis，直接数字合成）]]：每个节拍算出“现在走到一个周期的哪里”，再查表得到这一点的波形值（一个数字）；
3. [[dac|DAC（digital-to-analog converter，数模转换器）]]：把数字变成电压，得到一串 **阶梯**；
4. [[filter|滤波器]]：低通滤波，把阶梯磨成光滑的曲线；
5. [[ampl|幅度]]：衰减器 + 放大器，乘上你设的 A；
6. [[offs|加偏置]]：加上一个直流电压；
7. [[amp|功率放大器]]：能输出几十 mA，带得动负载；
8. [[ro|50 Ω 电阻]]：串在功放和 [[output|BNC]] 之间。它是 **故意放的**：高频电缆（同轴线）的特性阻抗是 50 Ω，源端串 50 Ω 可以吸收反射，波形不“振铃”。

前 4 块决定 **形状和频率**，后 4 块决定 **大小、位置和输出电阻**。下一层先看 DDS 怎么做出一个精确的频率。`,
          `In a modern generator the waveform is **computed first, then turned into a voltage**. Follow the signal:
1. [[clock|clock]]: a crystal giving a very steady 100 MHz beat — the frequency accuracy of the whole instrument comes from it;
2. [[dds|DDS (direct digital synthesis)]]: at each beat, works out "where in the period are we now" and looks up the waveform value there (a number);
3. [[dac|DAC (digital-to-analog converter)]]: turns numbers into voltage — a **staircase**;
4. [[filter|filter]]: a low-pass filter smooths the staircase into a curve;
5. [[ampl|amplitude]]: an attenuator plus amplifier multiplies by your A;
6. [[offs|offset]]: adds a DC voltage;
7. [[amp|power amplifier]]: can deliver tens of mA, enough to drive a load;
8. [[ro|a 50 Ω resistor]] between the amplifier and the [[output|BNC]]. It is there **on purpose**: coaxial cable has a 50 Ω characteristic impedance, and 50 Ω at the source absorbs reflections so the waveform doesn't ring.

The first four blocks set **shape and frequency**; the last four set **size, position and output resistance**. The next layer shows how DDS makes an exact frequency.`,
        ),
        table: {
          head: [tr('方块', 'Block'), tr('输入 → 输出', 'In → out'), tr('决定了', 'Determines')],
          rows: [
            [tr('时钟', 'clock'), tr('— → 100 MHz 节拍', '— → 100 MHz beat'), tr('频率精度', 'frequency accuracy')],
            ['DDS', tr('节拍 → 波形值（数字）', 'beats → sample values'), tr('波形、频率', 'shape, frequency')],
            ['DAC', tr('数字 → 阶梯电压', 'numbers → steps'), tr('分辨率', 'resolution')],
            [tr('滤波器', 'filter'), tr('阶梯 → 平滑', 'steps → smooth'), tr('正弦纯不纯', 'sine purity')],
            [tr('幅度 + 偏置', 'amplitude + offset'), '× A, + offset', '$A$, $U_{off}$'],
            [tr('功放 + 50 Ω', 'power amp + 50 Ω'), tr('→ BNC', '→ BNC'), tr('输出电阻 $R_o$', 'output resistance $R_o$')],
          ],
          parts: ['clock', 'dds', 'dac', 'filter', 'ampl', 'ro'],
        },
      },
      {
        id: 'dds',
        short: 'DDS',
        title: tr('③ DDS：频率 = 每个时钟转多少相位', '③ DDS: frequency = how much phase per clock tick'),
        body: tr(
          `想象一个指针在圆上转（左图）：[[phase|相位累加器]] 是一个 32 位的计数器，每来一个时钟就加上一个固定的数 M。计数器从 0 数到 $2^{32}$ 再回到 0，正好是 **一圈 = 一个周期**。指针的高度（投影）就是 $sin φ$——芯片里不算正弦，而是用 φ 去 **查一张存好的正弦表**。

一步步推频率：
1. 一圈有 $2^{32}$ 个单位，每个时钟走 M 个单位；
2. 转一圈要 $\\frac{2^{32}}{M}$ 个时钟，每个时钟 $\\frac{1}{f_{clk}}$ 秒；
3. 所以周期 $T = \\frac{2^{32}}{M f_{clk}}$，频率
$$f_{out} = \\frac{M f_{clk}}{2^{32}}$$
代数字（$f_{clk}$ = 100 MHz）：要 1 kHz，$M = \\frac{1000 × 2^{32}}{10^{8}} ≈ 42950$；最小步进（M = 1）是 0.023 Hz。这就是为什么信号发生器能把频率设到小数点后好几位。

查表得到的数送进 [[dac|DAC]]，出来的是阶梯；1 kHz 时一个周期有 $\\frac{10^{8}}{10^{3}} = 100000$ 个台阶，细到看不见。频率越高，每周期台阶越少，所以要 [[filter|滤波器]] 磨平。方波和三角波就是换一张表。`,
          `Picture a pointer turning on a circle (left): the [[phase|phase accumulator]] is a 32-bit counter that adds a fixed number M on every clock tick. Counting from 0 up to $2^{32}$ and wrapping to 0 is exactly **one turn = one period**. The pointer's height (its projection) is $sin φ$ — the chip doesn't compute a sine; it uses φ to **look up a stored sine table**.

Derive the frequency:
1. one turn has $2^{32}$ units and each tick advances M units;
2. a turn takes $\\frac{2^{32}}{M}$ ticks of $\\frac{1}{f_{clk}}$ seconds each;
3. so the period is $T = \\frac{2^{32}}{M f_{clk}}$ and the frequency
$$f_{out} = \\frac{M f_{clk}}{2^{32}}$$
With numbers ($f_{clk}$ = 100 MHz): for 1 kHz, $M = \\frac{1000 × 2^{32}}{10^{8}} ≈ 42950$; the smallest step (M = 1) is 0.023 Hz. That is why a generator can be set to many decimal places.

The looked-up numbers go to the [[dac|DAC]], which outputs a staircase; at 1 kHz one period has $\\frac{10^{8}}{10^{3}} = 100000$ steps — too fine to see. At higher frequencies there are fewer steps per period, hence the [[filter|filter]]. Square and triangle waves just use another table.`,
        ),
        formulas: [
          { tex: 'f_{out} = \\frac{M f_{clk}}{2^{32}}', note: tr('DDS 的输出频率', 'DDS output frequency') },
          { tex: 'Δf_{min} = \\frac{f_{clk}}{2^{32}} = \\frac{10^{8}}{4.29 × 10^{9}} ≈ 0.023 Hz', note: tr('频率分辨率', 'frequency resolution') },
        ],
        calcs: ['period-frequency'],
      },
      {
        id: 'equiv',
        short: tr('等效电路', 'Model'),
        title: tr('④ 等效电路：理想电压源串联 50 Ω', '④ Equivalent circuit: an ideal source in series with 50 Ω'),
        body: tr(
          `把八个方块全部装回去，从红、黑两根引线看进去，信号发生器就是电路课里的 **戴维南模型**：
- 一个 [[vs|理想电压源]]，电压随时间变化：
$$v_s(t) = U_{off} + A sin(2π f t)$$
- 串联一个 [[ro|输出电阻]] $R_o$ = 50 Ω。

[[plot|右边的图]] 是 $U_{off}$ = 1 V、A = 1 V、f = 1 kHz：
- [[offset|偏置]] 把中心线抬到 1 V；
- [[amp|幅度 A]] 是中心线到波峰：1 V；
- [[vpp|峰峰值 Vpp]] 是波谷到波峰：$Vpp = 2A$ = 2 V，波形在 0 V 和 2 V 之间。

**不接负载**（开路）时，50 Ω 上没有电流，也就没有压降，[[vout|输出]] 就等于 $v_s(t)$——面板上设的值就是你在引线上看到的值（仿真里的设定就是这个“开路值”）。接上负载以后，第 ⑥ 层再算。

黑引线（COM）接电路的 GND。真实的仪器 COM 还连着外壳和电源插头的地线（大地），这一点在示波器那一篇很重要。`,
          `Put all eight blocks back. Seen from the red and black leads, the generator is a **Thévenin model** from the circuits course:
- an [[vs|ideal voltage source]] whose voltage varies in time:
$$v_s(t) = U_{off} + A sin(2π f t)$$
- in series with the [[ro|output resistance]] $R_o$ = 50 Ω.

[[plot|The plot on the right]] is $U_{off}$ = 1 V, A = 1 V, f = 1 kHz:
- the [[offset|offset]] lifts the centre line to 1 V;
- the [[amp|amplitude A]] is from the centre line to the peak: 1 V;
- [[vpp|peak-to-peak Vpp]] is from trough to peak: $Vpp = 2A$ = 2 V; the wave lives between 0 V and 2 V.

**With no load** (open circuit) no current flows in the 50 Ω, so nothing drops across it and the [[vout|output]] equals $v_s(t)$: what you set is what you get on the leads (the simulator's setting is this open-circuit value). With a load, see layer ⑥.

The black lead (COM) goes to the circuit's GND. On a real instrument COM is also tied to the case and the mains earth — important in the oscilloscope teardown.`,
        ),
        formulas: [
          { tex: 'v_s(t) = U_{off} + A sin(2π f t)', note: tr('理想电压源的电压', 'the ideal source') },
          { tex: 'v_{out} = v_s - i R_o', note: tr('开路时 $i = 0$，$v_{out} = v_s$', 'open circuit: $i = 0$, $v_{out} = v_s$') },
        ],
        calcs: ['generator-output', 'vpp-amplitude'],
      },
      {
        id: 'rms',
        short: tr('幅度 / Vpp / RMS', 'A / Vpp / RMS'),
        title: tr('⑤ 幅度、峰峰值、有效值：三个数说的不是一回事', '⑤ Amplitude, peak-to-peak, RMS: three different numbers'),
        body: tr(
          `同一个波形可以用三个数描述，弄混了读数就差 1.4 倍或 2 倍：
- **幅度 A**（amplitude，峰值 peak）：中心线到波峰；
- **峰峰值 Vpp**（peak-to-peak）：波谷到波峰，$Vpp = 2A$。示波器最容易读的就是它；
- **有效值 RMS**（root mean square，均方根）：在同一个电阻上产生 **同样热量** 的直流电压。万用表交流档读的就是它。

RMS 的定义一步步来：功率 $p = \\frac{u^{2}}{R}$，取一个周期的平均，再问“多大的直流 U 给出同样的平均功率”：
$$U_{rms} = \\sqrt{\\frac{1}{T}∫_{0}^{T} u^{2} dt}$$
正弦：$sin^{2}$ 的平均是 $\\frac{1}{2}$，所以 $U_{rms} = \\frac{A}{\\sqrt{2}}$。方波：$u^{2}$ 一直等于 $A^{2}$，$U_{rms} = A$。三角波：$u^{2}$ 的平均是 $\\frac{A^{2}}{3}$，$U_{rms} = \\frac{A}{\\sqrt{3}}$。

[[sine|正弦]]、[[square|方波]]、[[triangle|三角波]] 幅度都是 1 V（右图，绿色虚线是 RMS）。第 12 课接 50 Ω 负载后幅度 0.5 V：$U_{rms} = \\frac{0.5}{\\sqrt{2}} ≈ 0.354 V$。`,
          `One waveform, three numbers; mix them up and your reading is off by 1.4× or 2×:
- **amplitude A** (peak): centre line to peak;
- **peak-to-peak Vpp**: trough to peak, $Vpp = 2A$. The easiest number to read on a scope;
- **RMS** (root mean square): the DC voltage that makes the **same heat** in the same resistor. A multimeter's AC range reads this.

Derive RMS step by step: power is $p = \\frac{u^{2}}{R}$; average it over one period and ask which DC voltage U gives the same average power:
$$U_{rms} = \\sqrt{\\frac{1}{T}∫_{0}^{T} u^{2} dt}$$
Sine: the average of $sin^{2}$ is $\\frac{1}{2}$, so $U_{rms} = \\frac{A}{\\sqrt{2}}$. Square: $u^{2}$ is always $A^{2}$, so $U_{rms} = A$. Triangle: the average of $u^{2}$ is $\\frac{A^{2}}{3}$, so $U_{rms} = \\frac{A}{\\sqrt{3}}$.

The [[sine|sine]], [[square|square]] and [[triangle|triangle]] on the right all have A = 1 V (green dashed = RMS). In lesson 12, with a 50 Ω load the amplitude is 0.5 V: $U_{rms} = \\frac{0.5}{\\sqrt{2}} ≈ 0.354 V$.`,
        ),
        table: {
          head: [tr('波形', 'Waveform'), tr('幅度 A', 'Amplitude A'), 'Vpp', 'RMS', tr('A = 1 V 时 RMS', 'RMS at A = 1 V'), tr('平均值（无偏置）', 'Average (no offset)')],
          rows: [
            [tr('正弦', 'sine'), 'A', '2A', '$\\frac{A}{\\sqrt{2}}$', '0.707 V', '0'],
            [tr('方波', 'square'), 'A', '2A', 'A', '1.000 V', '0'],
            [tr('三角波', 'triangle'), 'A', '2A', '$\\frac{A}{\\sqrt{3}}$', '0.577 V', '0'],
          ],
          parts: ['sine', 'square', 'triangle'],
        },
        formulas: [
          { tex: 'U_{rms} = \\sqrt{\\frac{1}{T}∫_{0}^{T} u^{2} dt}', note: tr('有效值的定义：等效发热', 'definition: equal heating') },
          {
            tex: 'Vpp = 2A;  U_{rms,sine} = \\frac{A}{\\sqrt{2}}',
            note: tr('有偏置时 RMS 还要算上直流：$\\sqrt{U_{off}^{2} + U_{rms,ac}^{2}}$', 'with an offset the DC adds in: $\\sqrt{U_{off}^{2} + U_{rms,ac}^{2}}$'),
          },
        ],
        calcs: ['rms-sine', 'vpp-amplitude'],
      },
      {
        id: 'loading',
        short: tr('带负载', 'Loading'),
        title: tr('⑥ 接上负载：50 Ω 和负载电阻分压', '⑥ With a load: the 50 Ω and the load form a divider'),
        body: tr(
          `接上 [[rl|负载电阻]] $R_L$，回路里就有了电流，[[ro|50 Ω]] 上开始有压降。这就是一个 **分压器**：
$$v_{out}(t) = v_s(t) \\frac{R_L}{R_o + R_L}$$
注意它对 **每一个瞬间** 都成立，所以幅度、Vpp、RMS、偏置（直流部分）**都乘以同一个比例**，波形形状不变。

一步步代第 12 课的数字（设定 A = 1 V，即 2 Vpp）：
1. $R_L$ = 50 Ω：比例 $\\frac{50}{50 + 50} = 0.5$，[[vout|输出 1 Vpp]]，有效值 $\\frac{0.5}{\\sqrt{2}} = 0.354 V$；偏置设 1 V 时直流也只剩 0.5 V；
2. $R_L$ = 1 kΩ：比例 $\\frac{1000}{1050} = 0.952$，1.905 Vpp；
3. 第 13 课的 RC（1 kHz 时阻抗约 1.88 kΩ）：比例 ≈ 0.974，CH1 ≈ 1.97 Vpp。

[[curve|右图]] 是比例随 $R_L$ 的变化：$R_L$ 比 50 Ω 大 20 倍以上（> 1 kΩ），损失 < 5 %，课程里的 kΩ 级电路基本可以忽略 50 Ω；负载越接近 50 Ω，越不能忽略。

顺便：$R_L = R_o$ = 50 Ω 时负载得到的功率最大（最大功率传输），这正是射频世界都用 50 Ω 的原因之一。`,
          `Connect a [[rl|load resistor]] $R_L$ and current flows, so the [[ro|50 Ω]] starts dropping voltage. It is a **divider**:
$$v_{out}(t) = v_s(t) \\frac{R_L}{R_o + R_L}$$
It holds at **every instant**, so amplitude, Vpp, RMS and the offset (the DC part) **are all scaled by the same ratio** — the shape doesn't change.

Lesson 12's numbers, step by step (A = 1 V set, i.e. 2 Vpp):
1. $R_L$ = 50 Ω: ratio $\\frac{50}{50 + 50} = 0.5$, [[vout|output 1 Vpp]], RMS $\\frac{0.5}{\\sqrt{2}} = 0.354 V$; with a 1 V offset the DC is only 0.5 V too;
2. $R_L$ = 1 kΩ: ratio $\\frac{1000}{1050} = 0.952$, 1.905 Vpp;
3. lesson 13's RC (about 1.88 kΩ at 1 kHz): ratio ≈ 0.974, CH1 ≈ 1.97 Vpp.

[[curve|The plot]] shows the ratio against $R_L$: with $R_L$ more than 20 × 50 Ω (> 1 kΩ) you lose < 5 % — for the kΩ circuits in this course the 50 Ω is nearly negligible; the closer the load gets to 50 Ω, the less you can ignore it.

By the way: $R_L = R_o$ = 50 Ω takes the most power from the generator (maximum power transfer) — one reason the RF world standardised on 50 Ω.`,
        ),
        table: {
          head: [tr('负载 $R_L$', 'Load $R_L$'), tr('比例', 'Ratio'), tr('输出（设 2 Vpp）', 'Output (2 Vpp set)'), tr('哪里见到', 'Where')],
          rows: [
            [tr('开路', 'open'), '1', '2 Vpp', tr('不接负载', 'no load')],
            ['50 Ω', '0.5', '1 Vpp', tr('第 12 课', 'lesson 12')],
            ['1 kΩ', '0.952', '1.905 Vpp', tr('RC 电路', 'RC circuits')],
            ['1.88 kΩ', '0.974', '1.97 Vpp', tr('第 13 课 CH1', 'lesson 13 CH1')],
          ],
          parts: [null, 'rl', 'pt-1k', 'pt-rc'],
        },
        formulas: [{ tex: 'v_{out} = v_s \\frac{R_L}{R_o + R_L}', note: tr('对每个瞬间成立：幅度、偏置一起缩小', 'holds at every instant: amplitude and offset shrink together') }],
        calcs: ['generator-output', 'voltage-divider', 'rms-sine'],
      },
      {
        id: 'limits',
        short: tr('局限', 'Limits'),
        title: tr('⑦ 局限：真实的信号发生器和仿真差在哪', '⑦ Limits: where a real generator differs from the simulator'),
        body: tr(
          `**最常见的坑**：很多真实信号发生器的幅度显示是 **按“接了 50 Ω 负载”算的**。你设 1 Vpp，它内部的 $v_s$ 其实是 2 Vpp，假设会被 50 Ω 负载分掉一半。接到 [[set50|50 Ω 负载]] 上确实是 1 Vpp；但接到示波器、RC 电路这种 [[hiz|高阻负载]] 上，你看到的是 **2 Vpp**——“怎么大了一倍？”解决：把输出设置改成 **High-Z**，显示值就等于开路值。仿真里的设定就是开路值。

其他差别：
- [[edges|方波边沿]] 有上升时间（几 ns 到几十 ns），频率很高时方波会变圆；
- 输出有上限：高阻负载时约 ±10 V，最大电流几十 mA；
- 正弦有一点失真（谐波），DDS 的阶梯会在高频产生杂散；
- 仿真里第一个信号发生器决定时间基准，第二个最好是它的整数倍频率。`,
          `**The classic trap**: many real generators display the amplitude **assuming a 50 Ω load**. Set 1 Vpp and the $v_s$ inside is really 2 Vpp, expecting a 50 Ω load to take half. Into a [[set50|50 Ω load]] you do get 1 Vpp; into a [[hiz|high-impedance load]] like a scope or an RC circuit you see **2 Vpp** — "why is it twice as big?". Fix: set the output to **High-Z**, and the display shows the open-circuit value. The simulator's setting is the open-circuit value.

Other differences:
- [[edges|square-wave edges]] have a rise time (a few to tens of ns), so at high frequencies a square wave gets rounded;
- the output is limited: about ±10 V into high-Z, a few tens of mA at most;
- a sine has a little distortion (harmonics), and DDS steps create spurs at high frequencies;
- in the simulator the first generator sets the time base; a second one should be an integer multiple of its frequency.`,
        ),
        table: {
          head: [tr('项目', 'Item'), tr('真实信号发生器', 'Real generator'), tr('仿真', 'Simulator')],
          rows: [
            [tr('幅度显示', 'amplitude display'), tr('常按 50 Ω 负载；High-Z 才等于开路值', 'often assumes 50 Ω; High-Z shows the open value'), tr('开路值', 'open-circuit value')],
            [tr('输出电阻', 'output resistance'), '50 Ω', '50 Ω'],
            [tr('方波边沿', 'square edges'), tr('上升时间几 ns–几十 ns', 'rise time ns–tens of ns'), tr('按时间步长', 'one time step')],
            [tr('最大输出', 'max output'), tr('≈ ±10 V（高阻），几十 mA', '≈ ±10 V (high-Z), tens of mA'), tr('不限', 'unlimited')],
            [tr('COM', 'COM'), tr('接外壳和大地', 'tied to case and earth'), tr('只是电路里的一个点', 'just a node')],
          ],
          parts: ['set50', 'hiz', 'edges', null, null],
        },
        calcs: ['generator-output'],
      },
    ],
    recap: tr(
      '信号发生器 = 理想电压源 $v_s(t) = U_{off} + Asin(2πft)$ 串联 50 Ω。开路时输出就是设定值；接负载 $R_L$ 时整个波形乘以 $\\frac{R_L}{50 + R_L}$。幅度是峰值，Vpp = 2A，正弦的 RMS = A/√2。',
      'A function generator = an ideal source $v_s(t) = U_{off} + Asin(2πft)$ in series with 50 Ω. Open circuit, the output is the setting; with a load $R_L$ the whole waveform is multiplied by $\\frac{R_L}{50 + R_L}$. Amplitude is the peak, Vpp = 2A, a sine’s RMS = A/√2.',
    ),
  };
}
