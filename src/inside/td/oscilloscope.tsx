// Teardown: the oscilloscope. Front (screen grid, V/div, time/div, CH1/CH2, trigger, probe) →
// reading the screen (Vpp and period by counting divisions) → X-ray (attenuator, amplifier, ADC
// sampling, memory, display, trigger comparator) → sampling and triggering (why the picture stands
// still) → equivalent circuit of one channel (1 MΩ ∥ 15 pF to a grounded chassis) → why the ground
// clip may only go on GND (lesson 13's mistake, through the earth wire) → two channels and the
// phase difference Δφ = 360°·Δt/T with lesson 13's numbers.

import './instruments.css';
import type { ReactNode } from 'react';
import { tr } from '../../core/i18n';
import { vis } from '../TeardownView';
import type { Teardown } from '../types';
import { Circ, Defs, Dot, Gnd, Res } from './multimeter';
import { wave } from './function-generator';

const Panel = ({ title }: { title: ReactNode }) => (
  <>
    <rect x={20} y={20} width={520} height={400} rx={14} className="td-panel" />
    <text x={280} y={48} textAnchor="middle" className="td-panel-title">
      {title}
    </text>
  </>
);

/** an earth symbol (three lines) under (x, y) */
function Earth({ x, y, part }: { x: number; y: number; part?: string }) {
  return <Gnd x={x} y={y} part={part} />;
}

/** screen with a grid of nx × ny divisions of `d` px, top-left (x, y) */
function Screen({ x, y, d, nx = 10, ny = 8, part = 'screen' }: { x: number; y: number; d: number; nx?: number; ny?: number; part?: string }) {
  const lines: ReactNode[] = [];
  for (let i = 0; i <= nx; i++) lines.push(<line key={`v${i}`} x1={x + i * d} y1={y} x2={x + i * d} y2={y + ny * d} className={i === nx / 2 ? 'ins-grid-axis' : 'ins-grid'} />);
  for (let j = 0; j <= ny; j++) lines.push(<line key={`h${j}`} x1={x} y1={y + j * d} x2={x + nx * d} y2={y + j * d} className={j === ny / 2 ? 'ins-grid-axis' : 'ins-grid'} />);
  return (
    <g data-part={part}>
      <rect x={x - 6} y={y - 6} width={nx * d + 12} height={ny * d + 12} rx={6} className="ins-screen" />
      {lines}
    </g>
  );
}

/* ------------------------------------------------------------------ front */

function Front({ xray }: { xray: boolean }) {
  const op = xray ? 0.1 : 1;
  const knob = (cx: number, cy: number, r: number, part: string, label: string, sub2?: string) => (
    <g data-part={part}>
      <circle cx={cx} cy={cy} r={r} className="ins-knob" />
      <line x1={cx} y1={cy} x2={cx + r * 0.6} y2={cy - r * 0.75} className="ins-pointer" style={{ strokeWidth: 3 }} />
      <text x={cx} y={cy - r - 8} textAnchor="middle" className="tdp-lbl" style={{ fontSize: 12 }}>
        {label}
      </text>
      {sub2 && (
        <text x={cx} y={cy + r + 14} textAnchor="middle" className="td-small">
          {sub2}
        </text>
      )}
    </g>
  );
  return (
    <g style={{ opacity: op }}>
      <rect x={24} y={30} width={512} height={310} rx={14} className="ins-case grey" data-part="case" />
      <Screen x={46} y={54} d={30} />
      <path d={wave('sine', 46, 300, 174, 60, 2)} className="ins-ch1" data-part="ch1" />
      <text x={52} y={70} className="ins-ch1-t" style={{ fontSize: 11 }} data-part="ch1">
        CH1
      </text>
      <line x1={46} y1={174} x2={346} y2={174} className="ins-trig" data-part="trig" />
      <text x={186} y={318} textAnchor="middle" className="td-small" data-part="readout" style={{ fontFamily: 'monospace' }}>
        CH1 500mV/ · 200µs/ · Vpp 2.00V · f 1.000kHz
      </text>
      {knob(398, 98, 24, 'vdiv', 'V/div', '500 mV')}
      {knob(486, 98, 24, 'tdiv', tr('时间/格', 'time/div'), '200 µs')}
      {knob(486, 196, 18, 'trig', tr('触发电平', 'trig level'))}
      <g data-part="ch1">
        <rect x={372} y={168} width={52} height={24} rx={5} className="ins-btn on" />
        <text x={398} y={185} textAnchor="middle" className="tdp-lbl" style={{ fontSize: 12 }}>
          CH1
        </text>
      </g>
      <g data-part="ch2">
        <rect x={372} y={198} width={52} height={24} rx={5} className="ins-btn" style={{ fill: '#bfeef3' }} />
        <text x={398} y={215} textAnchor="middle" className="tdp-lbl" style={{ fontSize: 12 }}>
          CH2
        </text>
      </g>
      <g data-part="auto">
        <rect x={456} y={236} width={60} height={22} rx={5} className="ins-btn" />
        <text x={486} y={252} textAnchor="middle" className="tdp-lbl" style={{ fontSize: 11 }}>
          AUTO
        </text>
      </g>
      <g data-part="in1">
        <text x={392} y={262} textAnchor="middle" className="tdp-lbl" style={{ fontSize: 11 }}>
          CH1
        </text>
        <circle cx={392} cy={290} r={16} className="ins-bnc" style={{ stroke: '#d4a400', strokeWidth: 4 }} />
        <circle cx={392} cy={290} r={5} className="ins-node" />
      </g>
      <g data-part="in2">
        <text x={440} y={262} textAnchor="middle" className="tdp-lbl" style={{ fontSize: 11 }}>
          CH2
        </text>
        <circle cx={440} cy={290} r={16} className="ins-bnc" style={{ stroke: '#1aa6b7', strokeWidth: 4 }} />
        <circle cx={440} cy={290} r={5} className="ins-node" />
      </g>
      <text x={466} y={326} className="td-small" data-part="in1 in2">
        1 MΩ ∥ 15 pF
      </text>
    </g>
  );
}

function Probe() {
  return (
    <g>
      <path d="M392 306 C392 370 300 386 252 388" className="ins-black" style={{ strokeWidth: 5 }} data-part="probe" />
      <g data-part="probe">
        <rect x={140} y={380} width={112} height={18} rx={8} className="ins-probe-black" />
        <rect x={156} y={376} width={8} height={26} rx={2} className="ins-probe-black" />
      </g>
      <g data-part="tip">
        <line x1={140} y1={389} x2={96} y2={389} className="ins-tip" />
        <path d="M96 389 q-8 0 -8 -8" className="ins-tip" />
        <text x={86} y={372} className="tdp-lbl">
          {tr('针尖', 'tip')}
        </text>
      </g>
      <g data-part="clip">
        <path d="M230 398 C230 422 200 424 186 424" className="ins-black" />
        <rect x={160} y={418} width={26} height={12} rx={3} className="ins-probe-black" />
        <text x={196} y={436} className="tdp-lbl">
          {tr('接地夹', 'ground clip')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ reading the screen */

function Reading() {
  const X0 = 60;
  const Y0 = 62;
  const D = 36;
  const yc = Y0 + 4 * D;
  return (
    <g>
      <Screen x={X0} y={Y0} d={D} />
      <path d={wave('sine', X0, 10 * D, yc, 2.5 * D, 1)} className="ins-ch1" data-part="ch1" />
      <g data-part="vpp">
        <path d={`M${X0 + 2.5 * D} ${yc - 2.5 * D} H${X0 + 8.4 * D}`} className="ins-scr-m" strokeDasharray="3 3" />
        <path d={`M${X0 + 7.5 * D} ${yc + 2.5 * D} H${X0 + 8.4 * D}`} className="ins-scr-m" strokeDasharray="3 3" />
        <path d={`M${X0 + 8.2 * D} ${yc - 2.5 * D + 4} V${yc + 2.5 * D - 4}`} className="ins-scr-m" markerStart="url(#os-ah)" markerEnd="url(#os-ah)" />
        <text x={X0 + 8 * D} y={yc - 6} textAnchor="end" className="ins-scr-t" style={{ fontSize: 13 }}>
          5 div
        </text>
        <text x={X0 + 8 * D} y={yc + 12} textAnchor="end" className="ins-scr-t" style={{ fontSize: 13 }}>
          = 1.0 Vpp
        </text>
      </g>
      <g data-part="period">
        <path d={`M${X0 + 4} ${Y0 + 7.5 * D} H${X0 + 10 * D - 4}`} className="ins-scr-m" markerStart="url(#os-ah)" markerEnd="url(#os-ah)" />
        <text x={X0 + 5 * D} y={Y0 + 7.5 * D - 8} textAnchor="middle" className="ins-scr-t" style={{ fontSize: 13 }}>
          {tr('10 div × 100 µs = T = 1 ms', '10 div × 100 µs = T = 1 ms')}
        </text>
      </g>
      <text x={X0 + 6} y={Y0 + 16} className="ins-ch1-t" style={{ fontSize: 11 }} data-part="ch1">
        CH1
      </text>
      <g data-part="readout">
        <text x={60} y={Y0 + 8 * D + 30} className="tdp-lbl" style={{ fontFamily: 'monospace', fontSize: 12 }}>
          CH1 200 mV/div · 100 µs/div
        </text>
        <text x={60} y={Y0 + 8 * D + 50} className="tdp-lbl" style={{ fontFamily: 'monospace', fontSize: 12 }}>
          Vpp 1.00 V · f 1.000 kHz · RMS 354 mV
        </text>
      </g>
      <g data-part="vdiv">
        <text x={434} y={Y0 + 2 * D + 4} className="td-small">
          {tr('↕ 1 格', '↕ 1 div')}
        </text>
        <text x={434} y={Y0 + 2 * D + 20} className="td-small">
          = 200 mV
        </text>
      </g>
      <g data-part="tdiv">
        <text x={434} y={Y0 + 6 * D + 4} className="td-small">
          {tr('↔ 1 格', '↔ 1 div')}
        </text>
        <text x={434} y={Y0 + 6 * D + 20} className="td-small">
          = 100 µs
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ x-ray: signal chain */

function Chain() {
  const b = (x: number, y: number, part: string, t1: string, t2: string) => (
    <g data-part={part} key={part}>
      <rect x={x} y={y} width={104} height={54} rx={8} className="ins-block" />
      <text x={x + 52} y={y + 23} textAnchor="middle" className="ins-block-t">
        {t1}
      </text>
      <text x={x + 52} y={y + 41} textAnchor="middle" className="td-small">
        {t2}
      </text>
    </g>
  );
  const arr = (d: string, part?: string) => <path d={d} className="tdp-line" markerEnd="url(#os-ah)" data-part={part} />;
  return (
    <g>
      {b(34, 76, 'in1', tr('输入 BNC', 'input BNC'), '1 MΩ ∥ 15 pF')}
      {b(160, 76, 'atten', tr('① 衰减器', '① attenuator'), '÷1, ÷10, ÷100')}
      {b(286, 76, 'amp', tr('② 放大器', '② amplifier'), tr('可变增益', 'variable gain'))}
      {b(412, 76, 'adc', tr('③ ADC 采样', '③ ADC sampling'), tr('8 位，1 GSa/s', '8 bit, 1 GSa/s'))}
      {arr('M138 103 H156')}
      {arr('M264 103 H282')}
      {arr('M390 103 H408')}
      <text x={212} y={150} textAnchor="middle" className="td-small" data-part="vdiv">
        {tr('V/div 旋钮选衰减和增益', 'the V/div knob sets attenuation and gain')}
      </text>
      {b(286, 196, 'trig', tr('④ 触发比较器', '④ trigger'), tr('信号 = 电平且上升？', 'level crossed, rising?'))}
      {b(412, 196, 'mem', tr('⑤ 存储器', '⑤ memory'), tr('一屏的采样点', 'one screen of points'))}
      {b(412, 306, 'disp', tr('⑥ 显示', '⑥ display'), tr('画点、算 Vpp、f', 'plot, compute Vpp, f'))}
      {arr('M338 130 V192', 'trig')}
      {arr('M464 130 V192', 'mem')}
      {arr('M390 223 H408', 'trig')}
      {arr('M464 250 V302', 'disp')}
      <text x={400} y={278} textAnchor="end" className="td-small" data-part="tdiv">
        {tr('time/div 决定采样率', 'time/div sets the sample rate')}
      </text>
      <text x={399} y={186} textAnchor="middle" className="td-small" data-part="trig">
        {tr('“开始记录”', '"start"')}
      </text>
      {/* the input's shell goes to the chassis and the earth pin */}
      <g data-part="chassis">
        <path d="M60 130 V330" className="tdp-line" />
        <text x={70} y={250} className="td-small">
          {tr('BNC 外壳 = 机壳', 'BNC shell = chassis')}
        </text>
        <text x={70} y={266} className="td-small">
          {tr('= 电源线的地线', '= mains earth pin')}
        </text>
        <Earth x={60} y={330} />
        <text x={60} y={362} textAnchor="middle" className="tdp-lbl">
          {tr('大地', 'earth')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ sampling and trigger */

function Trigger() {
  const X0 = 40;
  const W = 480;
  const yc = 170;
  const A = 80;
  const per = 240; // px per period
  const y = (x: number, ph = 0) => yc - A * Math.sin((2 * Math.PI * (x - (X0 + W / 2))) / per + ph);
  const dots: ReactNode[] = [];
  for (let x = X0 + 6; x < X0 + W; x += 12) dots.push(<circle key={x} cx={x} cy={y(x)} r={2.4} className="ins-sample" />);
  const path = (ph: number) => {
    let d = '';
    for (let x = X0; x <= X0 + W; x += 3) d += `${x === X0 ? 'M' : 'L'}${x} ${y(x, ph).toFixed(1)}`;
    return d;
  };
  return (
    <g>
      <rect x={X0 - 6} y={64} width={W + 12} height={212} rx={6} className="ins-screen" />
      <line x1={X0} y1={yc} x2={X0 + W} y2={yc} className="ins-grid-axis" />
      <line x1={X0 + W / 2} y1={70} x2={X0 + W / 2} y2={270} className="ins-grid-axis" />
      <g data-part="ghost" style={{ opacity: 0.28 }}>
        <path d={path(1.3)} className="ins-ch1" style={{ strokeWidth: 1.5 }} />
        <path d={path(3.6)} className="ins-ch1" style={{ strokeWidth: 1.5 }} />
      </g>
      <path d={path(0)} className="ins-ch1" data-part="ch1" />
      <g data-part="samples">{dots}</g>
      <g data-part="trig">
        <line x1={X0} y1={yc - 30} x2={X0 + W} y2={yc - 30} className="ins-trig" />
        <text x={X0 + W - 4} y={yc - 36} textAnchor="end" className="ins-trig-t">
          {tr('触发电平 0.3 V', 'trigger level 0.3 V')}
        </text>
        <circle cx={X0 + W / 2 + (per * Math.asin(30 / A)) / (2 * Math.PI)} cy={yc - 30} r={6} className="ins-trig" style={{ strokeDasharray: 'none', strokeWidth: 2.5 }} />
        <path d={`M${X0 + W / 2} 64 l-7 -12 h14 z`} className="ins-sample" />
        <text x={X0 + W / 2 + 12} y={60} className="ins-trig-t">
          {tr('触发点 = 屏幕中心', 'trigger point = screen centre')}
        </text>
      </g>
      <g data-part="numbers">
        <text x={40} y={306} className="tdp-lbl">
          {tr('每次信号“向上穿过触发电平”，就从这一点开始画一屏：', 'Each time the signal crosses the level going up, one screen is drawn from there:')}
        </text>
        <text x={40} y={326} className="td-small">
          {tr(
            '每一屏都对齐在同一点 → 波形静止。没有触发（淡色）→ 每屏起点随机，波形乱跑。',
            'every screen lines up on one point → a still picture. No trigger (faint) → the trace runs.',
          )}
        </text>
        <text x={40} y={354} className="tdp-lbl" data-part="samples">
          {tr('采样（橙点）：', 'Samples (orange dots):')}
        </text>
        <text x={40} y={374} className="td-small" data-part="samples">
          {tr('100 µs/div × 10 格 = 1 ms 一屏，存 1000 点 → 采样率 1 MSa/s（每点 1 µs）', '100 µs/div × 10 div = 1 ms per screen, 1000 points → 1 MSa/s (1 µs apart)')}
        </text>
        <text x={40} y={394} className="td-small" data-part="samples">
          {tr('8 位 ADC：256 级 / 8 格 = 32 级每格；200 mV/div 时一级 ≈ 6.3 mV', '8-bit ADC: 256 levels / 8 div = 32 per div; at 200 mV/div one level ≈ 6.3 mV')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ equivalent circuit of one channel */

function Equiv() {
  return (
    <g>
      <Panel title={tr('一个通道的等效电路', 'Equivalent circuit of one channel')} />
      <rect x={176} y={86} width={240} height={236} rx={10} className="ins-xbox" data-part="channel" />
      <text x={296} y={106} textAnchor="middle" className="ins-xbox-t">
        {tr('示波器 CH1 输入', 'scope CH1 input')}
      </text>
      <g data-part="tip">
        <circle cx={70} cy={140} r={6} className="tdp-fill" />
        <text x={70} y={124} textAnchor="middle" className="tdp-lbl">
          {tr('针尖', 'tip')}
        </text>
      </g>
      <g data-part="clip">
        <circle cx={70} cy={280} r={6} className="tdp-fill" />
        <text x={70} y={304} textAnchor="middle" className="tdp-lbl">
          {tr('接地夹', 'ground clip')}
        </text>
      </g>
      <path d="M76 140 H360 M76 280 H360 M220 140 V160 M220 260 V280 M290 140 V195 M290 205 V280 M360 140 V188 M360 232 V280" className="tdp-line" />
      <Res x1={220} y1={160} x2={220} y2={260} part="rin" />
      <text x={232} y={214} className="tdp-lbl" data-part="rin">
        1 MΩ
      </text>
      <g data-part="cin">
        <line x1={276} y1={195} x2={304} y2={195} className="tdp-line" />
        <line x1={276} y1={205} x2={304} y2={205} className="tdp-line" />
        <text x={296} y={232} className="tdp-lbl">
          15 pF
        </text>
      </g>
      <Circ x={360} y={210} t="V" part="ideal" />
      <Dot x={220} y={140} />
      <Dot x={290} y={140} />
      <Dot x={220} y={280} />
      <Dot x={290} y={280} />
      <g data-part="chassis">
        <path d="M290 280 V350" className="tdp-line" />
        <Earth x={290} y={350} />
        <text x={306} y={344} className="td-small">
          {tr('机壳 → 电源线地线 → 大地', 'chassis → mains earth pin → earth')}
        </text>
      </g>
      <g data-part="sim">
        <text x={436} y={150} className="td-small">
          {tr('仿真里：', 'In the sim:')}
        </text>
        <text x={436} y={168} className="td-small">
          {tr('没有 1 MΩ、15 pF', 'no 1 MΩ, no 15 pF')}
        </text>
        <text x={436} y={186} className="td-small">
          {tr('接地夹不接大地', 'clip not earthed')}
        </text>
      </g>
      <g data-part="xc">
        <text x={40} y={392} className="td-small">
          {tr('15 pF 的容抗：1 kHz 时 10.6 MΩ（可忽略）；1 MHz 时 10.6 kΩ（会拉低高阻电路）', '15 pF: 10.6 MΩ at 1 kHz (negligible); 10.6 kΩ at 1 MHz (loads high-Z circuits)')}
        </text>
        <text x={40} y={410} className="td-small">
          {tr('×10 探头：输入变成 10 MΩ ∥ ≈12 pF，信号缩小 10 倍（示波器自动乘回来）', '×10 probe: input becomes 10 MΩ ∥ ≈12 pF, signal ÷10 (the scope multiplies back)')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ the ground clip mistake */

function Clip() {
  return (
    <g>
      <Panel title={tr('接地夹夹错：通过大地把那一点短路了', 'Clip in the wrong place: that point is shorted through earth')} />
      {/* generator */}
      <rect x={34} y={94} width={118} height={250} rx={10} className="ins-xbox" data-part="gen" />
      <text x={93} y={112} textAnchor="middle" className="ins-xbox-t">
        {tr('信号发生器', 'generator')}
      </text>
      <g data-part="gen">
        <circle cx={66} cy={230} r={22} className="tdp-fill" />
        <path d={wave('sine', 52, 28, 230, 7, 1)} className="tdp-line" />
        <path d="M66 208 V140 H86 M136 140 H200 M66 252 V320 H330" className="tdp-line" />
        <Res x1={86} y1={140} x2={136} y2={140} body={30} />
        <text x={111} y={128} textAnchor="middle" className="td-small">
          50 Ω
        </text>
        <path d="M100 320 V344" className="tdp-line" />
      </g>
      {/* circuit */}
      <g data-part="circuit">
        <Res x1={200} y1={140} x2={300} y2={140} />
        <text x={250} y={124} textAnchor="middle" className="tdp-lbl">
          R1 = 1 kΩ
        </text>
        <path d="M300 140 H330 V222 M330 232 V320" className="tdp-line" />
        <line x1={316} y1={222} x2={344} y2={222} className="tdp-line" />
        <line x1={316} y1={232} x2={344} y2={232} className="tdp-line" />
        <text x={286} y={232} textAnchor="end" className="tdp-lbl">
          C1
        </text>
        <text x={286} y={248} textAnchor="end" className="td-small">
          100 nF
        </text>
      </g>
      <Dot x={200} y={140} part="node-in" />
      <text x={200} y={160} textAnchor="middle" className="tdp-lbl" data-part="node-in">
        IN
      </text>
      <Dot x={330} y={140} part="node-out" />
      <text x={330} y={128} textAnchor="middle" className="tdp-lbl" data-part="node-out">
        OUT
      </text>
      {/* scope */}
      <rect x={400} y={94} width={128} height={250} rx={10} className="ins-xbox" data-part="scope" />
      <text x={464} y={112} textAnchor="middle" className="ins-xbox-t">
        {tr('示波器', 'scope')}
      </text>
      <path d="M200 140 V76 H380 V150 H400" className="ins-ch1" style={{ strokeWidth: 2 }} data-part="ch1" />
      <text x={410} y={154} className="ins-ch1-t" style={{ fill: '#b08900' }}>
        CH1
      </text>
      <path d="M330 140 H366 V200 H400" className="ins-ch2" style={{ strokeWidth: 2 }} data-part="ch2" />
      <text x={410} y={204} className="ins-ch2-t" style={{ fill: '#1a8a98' }}>
        CH2
      </text>
      <path d="M400 290 H240 V146" className="ins-bad" strokeDasharray="6 4" data-part="clip" />
      <text x={392} y={308} textAnchor="end" className="ins-bad-t" data-part="clip">
        {tr('CH2 接地夹（夹错在 IN）', 'CH2 ground clip (wrongly on IN)')}
      </text>
      <path d="M400 290 H510" className="tdp-line" data-part="scope" />
      <text x={464} y={280} textAnchor="middle" className="td-small" data-part="scope">
        {tr('所有接地夹 = 机壳', 'all clips = chassis')}
      </text>
      <path d="M455 290 V344" className="tdp-line" data-part="scope" />
      {/* earth */}
      <g data-part="earth">
        <path d="M100 344 V372 M455 344 V372" className="tdp-line" />
        <path d="M100 384 V396 H455 V384" className="ins-dash" />
        <Earth x={100} y={372} />
        <Earth x={455} y={372} />
        <text x={278} y={410} textAnchor="middle" className="td-small">
          {tr('插座地线：两台仪器的地本来就连在一起', 'outlet earth: the two instruments’ grounds are already joined')}
        </text>
      </g>
      <g data-part="short">
        <text x={170} y={346} className="ins-bad-t" style={{ fontSize: 12 }}>
          {tr('IN 被拉到 0 V', 'IN pulled to 0 V')}
        </text>
        <text x={170} y={364} className="ins-bad-t" style={{ fontSize: 12 }}>
          i = 1 V / 50 Ω = 20 mA
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ two channels and phase */

function Phase() {
  const X0 = 60;
  const Y0 = 58;
  const D = 36;
  const yc = Y0 + 4 * D;
  const shift = 0.89 * D; // 89 µs at 100 µs/div
  const a1 = (1.97 / 2 / 0.5) * D; // 0.985 V at 500 mV/div
  const a2 = (1.67 / 2 / 0.5) * D;
  return (
    <g>
      <Screen x={X0} y={Y0} d={D} />
      <path d={wave('sine', X0, 10 * D, yc, a1, 1)} className="ins-ch1" data-part="ch1" />
      <path d={wave('sine', X0 + shift, 10 * D - shift, yc, a2, (10 * D - shift) / (10 * D))} className="ins-ch2" data-part="ch2" />
      <path d={wave('sine', X0, shift, yc, a2, shift / (10 * D), 1 - shift / (10 * D))} className="ins-ch2" data-part="ch2" />
      <g data-part="dt">
        <line x1={X0 + 2.5 * D} y1={yc - a1} x2={X0 + 2.5 * D} y2={yc - a1 - 26} className="ins-scr-m" />
        <line x1={X0 + 2.5 * D + shift} y1={yc - a2} x2={X0 + 2.5 * D + shift} y2={yc - a1 - 26} className="ins-scr-m" />
        <path d={`M${X0 + 2.5 * D} ${yc - a1 - 20} H${X0 + 2.5 * D + shift}`} className="ins-scr-m" markerStart="url(#os-ah)" markerEnd="url(#os-ah)" />
        <text x={X0 + 2.5 * D + shift + 8} y={yc - a1 - 16} className="ins-scr-t" style={{ fontSize: 13 }}>
          Δt ≈ 89 µs
        </text>
      </g>
      <g data-part="period">
        <path d={`M${X0 + 4} ${Y0 + 7.6 * D} H${X0 + 10 * D - 4}`} className="ins-scr-m" markerStart="url(#os-ah)" markerEnd="url(#os-ah)" />
        <text x={X0 + 5 * D} y={Y0 + 7.6 * D - 8} textAnchor="middle" className="ins-scr-t" style={{ fontSize: 13 }}>
          T = 10 div × 100 µs = 1 ms
        </text>
      </g>
      <text x={X0 + 6} y={Y0 + 16} className="ins-ch1-t" style={{ fontSize: 12 }} data-part="ch1">
        CH1 {tr('输入', 'input')} 1.97 Vpp
      </text>
      <text x={X0 + 6} y={Y0 + 32} className="ins-ch2-t" style={{ fontSize: 12 }} data-part="ch2">
        CH2 OUT 1.67 Vpp
      </text>
      <g data-part="phase">
        <text x={60} y={Y0 + 8 * D + 30} className="tdp-lbl">
          Δφ = −360° × 89 µs / 1 ms ≈ −32°
        </text>
        <text x={60} y={Y0 + 8 * D + 50} className="td-small">
          {tr('负号：CH2 比 CH1 晚到波峰（滞后）', 'minus: CH2 peaks later than CH1 (it lags)')}
        </text>
      </g>
      <text x={434} y={Y0 + 2 * D} className="td-small" data-part="vdiv">
        500 mV/div
      </text>
      <text x={434} y={Y0 + 6 * D} className="td-small" data-part="tdiv">
        100 µs/div
      </text>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <Defs id="os" />
      <g className={vis(layer, 0, 2)}>
        <Front xray={layer >= 1} />
      </g>
      <g className={vis(layer, 0, 0)}>
        <Probe />
      </g>
      <g className={vis(layer, 1, 1)}>
        <rect x={20} y={20} width={520} height={400} rx={14} className="td-panel" />
        <Reading />
      </g>
      <g className={vis(layer, 2, 2)}>
        <Chain />
      </g>
      <g className={vis(layer, 3, 3)}>
        <rect x={20} y={20} width={520} height={400} rx={14} className="td-panel" />
        <Trigger />
      </g>
      <g className={vis(layer, 4, 4)}>
        <Equiv />
      </g>
      <g className={vis(layer, 5, 5)}>
        <Clip />
      </g>
      <g className={vis(layer, 6)}>
        <rect x={20} y={20} width={520} height={400} rx={14} className="td-panel" />
        <Phase />
      </g>
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'oscilloscope',
    title: tr('示波器：会画图的电压表', 'Oscilloscope: a voltmeter that draws'),
    subtitle: tr(
      'oscilloscope（示波器）每秒量电压几百万次，把 **电压随时间的变化** 画成一条曲线：纵轴是电压（V/div），横轴是时间（time/div）。拆开看它是衰减器 → 放大器 → ADC → 存储 → 显示，再加一个让画面静止的触发器；装回去，每个通道是一个对 **大地** 的高阻电压表——所以接地夹只能夹在 GND 上。',
      'An oscilloscope measures a voltage millions of times per second and draws **voltage against time**: volts up (V/div), time across (time/div). Inside it is attenuator → amplifier → ADC → memory → display, plus a trigger that makes the picture stand still. Put back together, each channel is a high-resistance voltmeter **to earth** — which is why the ground clip may only go on GND.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'front',
        short: tr('面板', 'Front'),
        title: tr('① 面板：一块带格子的屏幕、三组旋钮、两个输入', '① Front: a gridded screen, three groups of knobs, two inputs'),
        body: tr(
          `示波器的面板分成四块：
- [[screen|屏幕]]：横向 10 格、纵向 8 格的网格（division，简写 div）。曲线 [[ch1|CH1（黄色）]] 是电压随时间的变化；
- **垂直**（vertical）：[[vdiv|V/div 旋钮]]——纵向 **每格代表多少伏**；
- **水平**（horizontal）：[[tdiv|time/div 旋钮]]——横向 **每格代表多少时间**；
- **触发**（trigger）：[[trig|触发电平]]——让画面静止的那条橙色虚线（第 ④ 层）。

两个输入 [[in1|CH1]]、[[in2|CH2]] 各接一根 [[probe|探头]]：[[tip|针尖]] 碰要看的点，[[clip|接地夹]] 夹在电路的 GND。屏幕上画的是 **针尖 − 接地夹** 的电压。

仿真里两个旋钮默认是 [[auto|自动（AUTO）]]：示波器自己挑合适的 V/div 和 time/div；屏幕下面直接列出 [[readout|读数]]（Vpp、频率、RMS、相位差）。`,
          `A scope's front has four areas:
- the [[screen|screen]]: a grid 10 divisions wide and 8 high (div). The trace [[ch1|CH1 (yellow)]] is the voltage against time;
- **vertical**: the [[vdiv|V/div knob]] — **volts per division** up the screen;
- **horizontal**: the [[tdiv|time/div knob]] — **time per division** across;
- **trigger**: the [[trig|trigger level]] — the orange dashed line that makes the picture stand still (layer ④).

The two inputs [[in1|CH1]] and [[in2|CH2]] each take a [[probe|probe]]: the [[tip|tip]] touches the point you want, the [[clip|ground clip]] goes on the circuit's GND. The screen shows **tip − ground clip**.

In the simulator both knobs default to [[auto|AUTO]]: the scope picks a sensible V/div and time/div itself, and the [[readout|readouts]] under the screen list Vpp, frequency, RMS and phase.`,
        ),
        table: {
          head: [tr('控件', 'Control'), tr('作用', 'Does'), tr('单位', 'Unit'), tr('怎么用', 'How to use')],
          rows: [
            [tr('屏幕网格', 'screen grid'), tr('10 × 8 格', '10 × 8 divisions'), 'div', tr('数格子', 'count divisions')],
            ['V/div', tr('纵向每格的电压', 'volts per vertical div'), 'mV/div, V/div', tr('让波形占 4–6 格高', 'make the wave 4–6 div tall')],
            ['time/div', tr('横向每格的时间', 'time per horizontal div'), 'µs/div, ms/div', tr('让屏幕上有 1–3 个周期', 'show 1–3 periods')],
            [tr('触发电平', 'trigger level'), tr('从哪个电压开始画', 'the voltage a sweep starts at'), 'V', tr('放在波形中间', 'inside the waveform')],
            ['CH1 / CH2', tr('打开 / 关闭通道', 'channel on / off'), '—', tr('CH1 看输入，CH2 看输出', 'CH1 input, CH2 output')],
            [tr('探头', 'probe'), tr('针尖 + 接地夹', 'tip + ground clip'), '×1 / ×10', tr('接地夹 **只** 夹 GND', 'clip on GND **only**')],
          ],
          parts: ['screen', 'vdiv', 'tdiv', 'trig', 'ch1', 'probe'],
        },
      },
      {
        id: 'reading',
        short: tr('读屏幕', 'Reading'),
        title: tr('② 读屏幕：数格子 × 每格多少', '② Reading the screen: divisions × value per division'),
        body: tr(
          `示波器上的一切读数都是 **格数 × 每格的值**：
- 纵向：[[vpp|波谷到波峰的格数]] × [[vdiv|V/div]] = 峰峰值 Vpp；
- 横向：[[period|一个周期的格数]] × [[tdiv|time/div]] = 周期 T；再取倒数得到频率。

用第 12 课的数字（1 kHz，设定幅度 1 V，接 50 Ω 负载）一步步来：
1. 示波器设在 200 mV/div、100 µs/div；
2. 波峰到波谷占 5 格：$Vpp = 5 × 200 mV = 1.0 V$（被 50 Ω 分掉了一半，第 ⑥ 层“信号发生器”）；
3. 一个周期占 10 格：$T = 10 × 100 µs = 1 ms$；
4. 频率 $f = \\frac{1}{T} = \\frac{1}{1 ms} = 1 kHz$；
5. 正弦的有效值 $V_{rms} = \\frac{Vpp}{2\\sqrt{2}} = \\frac{1.0}{2.83} ≈ 0.354 V$。

[[readout|屏幕下面的读数]] 就是示波器替你数好的结果。自己数一遍的意义在于：读数“看起来不对”时，你能从格子上一眼判断是波形不对，还是档位不对。`,
          `Every scope reading is **divisions × value per division**:
- vertically: [[vpp|divisions from trough to peak]] × [[vdiv|V/div]] = peak-to-peak Vpp;
- horizontally: [[period|divisions in one period]] × [[tdiv|time/div]] = period T; its reciprocal is the frequency.

With lesson 12's numbers (1 kHz, amplitude set to 1 V, 50 Ω load), step by step:
1. the scope is on 200 mV/div and 100 µs/div;
2. trough to peak is 5 divisions: $Vpp = 5 × 200 mV = 1.0 V$ (half lost in the 50 Ω — see the generator teardown, layer ⑥);
3. one period is 10 divisions: $T = 10 × 100 µs = 1 ms$;
4. frequency $f = \\frac{1}{T} = \\frac{1}{1 ms} = 1 kHz$;
5. the sine's RMS: $V_{rms} = \\frac{Vpp}{2\\sqrt{2}} = \\frac{1.0}{2.83} ≈ 0.354 V$.

The [[readout|readouts under the screen]] are the scope counting for you. Counting yourself pays off when a readout "looks wrong": the grid tells you at a glance whether the wave or the setting is off.`,
        ),
        formulas: [
          { tex: 'Vpp = N_{v} × (V/div)', note: tr('$N_v$ = 波谷到波峰的格数', '$N_v$ = divisions from trough to peak') },
          { tex: 'T = N_{t} × (time/div);  f = \\frac{1}{T}', note: tr('$N_t$ = 一个周期的格数', '$N_t$ = divisions in one period') },
        ],
        calcs: ['period-frequency', 'vpp-amplitude', 'rms-sine'],
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('③ X 光：衰减 → 放大 → ADC → 存储 → 显示，旁边一个触发器', '③ X-ray: attenuate → amplify → ADC → memory → display, with a trigger beside'),
        body: tr(
          `数字示波器（DSO，digital storage oscilloscope）里的信号路径：
1. [[in1|输入 BNC]]：对地 1 MΩ ∥ 15 pF；
2. [[atten|衰减器（attenuator）]]：大信号先除以 10 或 100，免得把后面烧坏；
3. [[amp|放大器]]：小信号放大，让它刚好占满 ADC 的输入范围。[[vdiv|V/div 旋钮]] 实际上就是在选“衰减多少、放大多少”；
4. [[adc|ADC]]：每隔一小段时间“拍一张”电压，变成 8 位数字（0–255）。[[tdiv|time/div]] 决定隔多久拍一次（采样率）；
5. [[mem|存储器]]：存下一屏的采样点；
6. [[disp|显示]]：把点画成曲线，顺便算出 Vpp、频率、RMS；
7. [[trig|触发比较器]]：一直盯着信号，等它“向上穿过触发电平”的那一刻，告诉存储器“从这里开始记”。

还有一根看不见但最重要的线：输入 BNC 的 [[chassis|金属外壳接机壳，机壳接电源线的地线，也就是大地]]。探头的接地夹就连在这个外壳上。第 ⑥ 层会看到它的后果。`,
          `The signal path in a digital storage oscilloscope (DSO):
1. the [[in1|input BNC]]: 1 MΩ ∥ 15 pF to ground;
2. the [[atten|attenuator]]: divides big signals by 10 or 100 so they don't damage what follows;
3. the [[amp|amplifier]]: boosts small signals to fill the ADC's input range. The [[vdiv|V/div knob]] really chooses "how much attenuation, how much gain";
4. the [[adc|ADC]]: takes a "snapshot" of the voltage at regular intervals and turns it into an 8-bit number (0–255). [[tdiv|time/div]] sets how often (the sample rate);
5. [[mem|memory]]: stores one screen of samples;
6. the [[disp|display]]: draws the points as a curve and computes Vpp, frequency, RMS;
7. the [[trig|trigger comparator]]: watches the signal and, the moment it crosses the trigger level going up, tells the memory "start recording here".

One more line you can't see but which matters most: the input BNC's [[chassis|metal shell goes to the chassis, and the chassis to the earth pin of the mains plug]]. The probe's ground clip is connected to that shell. Layer ⑥ shows the consequence.`,
        ),
        table: {
          head: [tr('方块', 'Block'), tr('作用', 'Job'), tr('由哪个旋钮控制', 'Set by')],
          rows: [
            [tr('衰减器', 'attenuator'), tr('大信号 ÷10、÷100', 'divides big signals'), 'V/div'],
            [tr('放大器', 'amplifier'), tr('小信号放大到满量程', 'fills the ADC range'), 'V/div'],
            ['ADC', tr('采样 + 量化（8 位）', 'samples and quantises (8 bit)'), tr('time/div（采样率）', 'time/div (sample rate)')],
            [tr('触发比较器', 'trigger comparator'), tr('决定从哪一刻开始画', 'decides when a sweep starts'), tr('触发电平', 'trigger level')],
            [tr('存储 + 显示', 'memory + display'), tr('画曲线、算读数', 'draws, computes readouts'), '—'],
          ],
          parts: ['atten', 'amp', 'adc', 'trig', 'mem'],
        },
      },
      {
        id: 'trigger',
        short: tr('采样与触发', 'Sampling & trigger'),
        title: tr('④ 采样和触发：为什么画面能静止', '④ Sampling and triggering: why the picture stands still'),
        body: tr(
          `**采样**：屏幕上那条“连续”的线其实是一串点（[[samples|橙色的点]]）。一屏有固定的点数（比如 1000 点），所以：
$$f_s = \\frac{N}{10 × (time/div)}$$
100 µs/div 时一屏 1 ms、1000 点，采样率 $f_s$ = 1 MSa/s，每 1 µs 一个点——对 1 kHz 的正弦来说一个周期有 1000 个点，绰绰有余。规则：一个周期至少要有十几个点，波形才像样；少于 2 个点（奈奎斯特 Nyquist）就会画出一个假的、慢得多的波形（混叠 aliasing）。

**量化**：8 位 ADC 只有 $2^{8} = 256$ 级，分到 8 格上是每格 32 级。200 mV/div 时每级 $\\frac{200 mV}{32} ≈ 6.3 mV$——这就是为什么要把波形调到占满屏幕：占得越满，读数越准。

**触发**：示波器一屏一屏地画，每秒画几十屏。如果每屏从随机时刻开始，波形就 [[ghost|在屏幕上乱跑]]。触发的规则是：[[trig|信号向上穿过触发电平的那一刻放在屏幕正中]]。周期信号每个周期都会穿过一次，于是每屏都对齐在同一点，画面就静止了。触发电平放到波形范围之外（比如 5 V），就永远等不到触发，画面停住或乱跑。`,
          `**Sampling**: the "continuous" line on screen is really a row of points ([[samples|the orange dots]]). A screen has a fixed number of points (say 1000), so:
$$f_s = \\frac{N}{10 × (time/div)}$$
At 100 µs/div one screen is 1 ms with 1000 points: $f_s$ = 1 MSa/s, one point every 1 µs — 1000 points per period of a 1 kHz sine, plenty. Rule: you need at least a dozen points per period for a decent picture; below 2 (Nyquist) you get a false, much slower waveform (aliasing).

**Quantisation**: an 8-bit ADC has only $2^{8} = 256$ levels, 32 per division over 8 divisions. At 200 mV/div one level is $\\frac{200 mV}{32} ≈ 6.3 mV$ — that is why you make the wave fill the screen: the fuller, the more precise.

**Triggering**: the scope draws screen after screen, dozens per second. If each began at a random moment the wave would [[ghost|run across the screen]]. The rule: [[trig|the moment the signal crosses the trigger level going up is placed at the centre]]. A periodic signal crosses once every period, so every screen lines up on the same point and the picture stands still. Put the level outside the waveform (say 5 V) and the trigger never comes: the picture freezes or runs.`,
        ),
        formulas: [
          { tex: 'f_s = \\frac{N}{10 × (time/div)} = \\frac{1000}{1 ms} = 1 MSa/s', note: tr('采样率', 'sample rate') },
          { tex: 'ΔV = \\frac{8 × (V/div)}{2^{8}} = \\frac{8 × 200 mV}{256} ≈ 6.3 mV', note: tr('8 位 ADC 的一级', 'one step of an 8-bit ADC') },
        ],
      },
      {
        id: 'equiv',
        short: tr('等效电路', 'Model'),
        title: tr('⑤ 一个通道的等效电路：对大地的 1 MΩ ∥ 15 pF', '⑤ One channel’s equivalent circuit: 1 MΩ ∥ 15 pF to earth'),
        body: tr(
          `从探头看进去，一个通道是：
- [[ideal|理想电压表]]（只读电压，不取电流）；
- 并联 [[rin|输入电阻 1 MΩ]] 和 [[cin|输入电容约 15 pF]]；
- 另一端（接地夹）接 [[chassis|机壳，机壳接大地]]。

和万用表比：万用表是 **两端都浮空** 的 10 MΩ（红、黑都可以放在任何地方）；示波器的 **一端已经接地**——它量的是“针尖对大地”。

负载效应照样用戴维南算：$V_{meas} = V_{th}\\frac{Z_{in}}{Z_{in} + R_{th}}$，只是 $Z_{in}$ 现在是 1 MΩ ∥ 15 pF，随频率变：
- 1 kHz：$X_C = \\frac{1}{2π × 1000 × 15 pF} ≈ 10.6 MΩ$，主要是 1 MΩ 在起作用；量 1 kΩ 级的电路，误差约 $\\frac{1 kΩ}{1 MΩ} = 0.1 %$；
- 1 MHz：$X_C ≈ 10.6 kΩ$，量 10 kΩ 级的高阻点就会明显变小、变慢。

所以高频、高阻时用 **×10 探头**（输入变成 10 MΩ ∥ 约 12 pF，信号缩小到 1/10，示波器自动乘回来）。仿真里的探头是理想的：[[sim|没有 1 MΩ、没有 15 pF、接地夹也不接大地]]。`,
          `Seen from the probe, one channel is:
- an [[ideal|ideal voltmeter]] (reads voltage, takes no current);
- in parallel with an [[rin|input resistance of 1 MΩ]] and an [[cin|input capacitance of about 15 pF]];
- with its other end (the ground clip) on the [[chassis|chassis, which is earthed]].

Compare with a multimeter: a multimeter is a 10 MΩ with **both ends floating** (red and black can go anywhere); a scope has **one end already grounded** — it measures "tip relative to earth".

Loading is computed with Thévenin as before, $V_{meas} = V_{th}\\frac{Z_{in}}{Z_{in} + R_{th}}$, but now $Z_{in}$ = 1 MΩ ∥ 15 pF depends on frequency:
- 1 kHz: $X_C = \\frac{1}{2π × 1000 × 15 pF} ≈ 10.6 MΩ$, so the 1 MΩ dominates; on a 1 kΩ-level circuit the error is about $\\frac{1 kΩ}{1 MΩ} = 0.1 %$;
- 1 MHz: $X_C ≈ 10.6 kΩ$ — a 10 kΩ-level node is visibly reduced and slowed.

Hence the **×10 probe** for high frequency or high impedance (input becomes 10 MΩ ∥ about 12 pF, signal ÷10, the scope multiplies back). The simulator's probe is ideal: [[sim|no 1 MΩ, no 15 pF, and the clip is not earthed]].`,
        ),
        table: {
          head: ['', tr('万用表（电压档）', 'Multimeter (volts)'), tr('示波器通道（×1）', 'Scope channel (×1)'), tr('仿真探头', 'Sim probe')],
          rows: [
            [tr('输入电阻', 'input resistance'), '10 MΩ', '1 MΩ', '∞'],
            [tr('输入电容', 'input capacitance'), tr('不计', '—'), '≈ 15 pF', '0'],
            [tr('黑 / 接地端', 'black / ground end'), tr('浮空，放哪都行', 'floating, anywhere'), tr('**接大地**', '**earthed**'), tr('不接大地', 'not earthed')],
            [tr('读的是', 'reads'), tr('一个数（直流或 RMS）', 'one number (DC or RMS)'), tr('整条 v(t) 曲线', 'the whole v(t)'), tr('整条 v(t) 曲线', 'the whole v(t)')],
          ],
          parts: ['rin', 'cin', 'chassis', 'ideal'],
        },
        formulas: [{ tex: 'X_C = \\frac{1}{2π f C_{in}}', note: tr('15 pF：1 kHz 时 10.6 MΩ，1 MHz 时 10.6 kΩ', '15 pF: 10.6 MΩ at 1 kHz, 10.6 kΩ at 1 MHz') }],
        calcs: ['voltmeter-loading', 'capacitive-reactance'],
      },
      {
        id: 'ground',
        short: tr('接地夹', 'Ground clip'),
        title: tr('⑥ 接地夹为什么只能夹 GND', '⑥ Why the ground clip may only go on GND'),
        body: tr(
          `上一层说了：接地夹 = 机壳 = 大地。信号发生器也一样，它的 COM 也通过电源线接大地。所以 **两台仪器的地，在插座里早就连在一起了**（图下方的 [[earth|虚线]]）。

第 13 课的电路：[[gen|信号发生器]] → R1（1 kΩ）→ OUT → C1（100 nF）→ GND。如果把 [[clip|CH2 的接地夹夹在 IN 点]]，会发生什么？一步步看：
1. 接地夹把 [[node-in|IN]] 连到示波器机壳 → 大地；
2. 大地经过插座连到信号发生器的 COM；
3. 所以 IN 和 COM 之间多了一根导线：信号发生器的输出被 **短路**，只剩它自己的 50 Ω 限流：
$$i = \\frac{1 V}{50 Ω} = 20 mA（峰值）$$
4. [[short|IN 被拉到 0 V]]，[[ch1|CH1]] 看到一条平线，整个电路都变了。

能量大一点的电路（比如接市电的电源），这根“看不见的线”会烧掉探头甚至电路板。规则只有一句：**所有接地夹只夹在电路的 GND（信号发生器 COM 接的那一点）上。**

想看一个两端都不接地的元件（比如 R1）上的电压：两个探头都把接地夹放在 GND，CH1 量 IN、CH2 量 OUT，再用 MATH 功能看 CH1 − CH2。仿真里接地夹不接大地，夹错了也只是测“针尖 − 接地夹”，并给一条提示：这时 CH2 = OUT − IN = −V(R1)。`,
          `The last layer said: ground clip = chassis = earth. The generator is the same: its COM is earthed through its mains lead. So **the two instruments' grounds are already joined inside the wall outlet** (the [[earth|dashed line]] at the bottom).

Lesson 13's circuit: [[gen|generator]] → R1 (1 kΩ) → OUT → C1 (100 nF) → GND. What happens if [[clip|CH2's ground clip goes on IN]]? Step by step:
1. the clip connects [[node-in|IN]] to the scope chassis → earth;
2. earth connects through the outlet to the generator's COM;
3. so there is now a wire between IN and COM: the generator output is **shorted**, limited only by its own 50 Ω:
$$i = \\frac{1 V}{50 Ω} = 20 mA (peak)$$
4. [[short|IN is pulled to 0 V]], [[ch1|CH1]] shows a flat line, and the whole circuit has changed.

In a circuit with more energy (say, a mains-powered supply) this invisible wire burns the probe or the board. The rule is one sentence: **every ground clip goes only on the circuit's GND (where the generator's COM is).**

To see the voltage across a part with neither end grounded (like R1): both clips on GND, CH1 on IN, CH2 on OUT, and look at CH1 − CH2 with the MATH function. In the simulator the clip is not earthed; clipped wrong it still measures tip − clip and you get a note: CH2 = OUT − IN = −V(R1).`,
        ),
        table: {
          head: [tr('接地夹夹在', 'Clip on'), tr('真实示波器', 'Real scope'), tr('仿真', 'Simulator')],
          rows: [
            [tr('电路 GND', 'circuit GND'), tr('正确', 'correct'), tr('正确', 'correct')],
            [
              tr('IN（信号发生器输出）', 'IN (generator output)'),
              tr('输出被短路，IN = 0 V，20 mA', 'output shorted, IN = 0 V, 20 mA'),
              tr('CH2 = OUT − IN，给提示', 'CH2 = OUT − IN, with a note'),
            ],
            [
              tr('任何别的点', 'any other point'),
              tr('那一点被接地，电路变了', 'that point is grounded, circuit changes'),
              tr('测两点之差，给提示', 'difference of two points, with a note'),
            ],
          ],
          parts: ['earth', 'clip', 'short'],
        },
      },
      {
        id: 'phase',
        short: tr('双通道相位', 'Two channels'),
        title: tr('⑦ 两个通道：峰峰值之比和相位差', '⑦ Two channels: amplitude ratio and phase difference'),
        body: tr(
          `第 13 课：[[ch1|CH1]] 看 RC 的输入，[[ch2|CH2]] 看电容上的电压 OUT，两个接地夹都在 GND。同一个时基下，两条曲线可以直接比较。

**先算**（R = 1 kΩ，C = 100 nF，f = 1 kHz）：
1. 容抗 $X_C = \\frac{1}{2π f C} = \\frac{1}{2π × 1000 × 100 nF} ≈ 1592 Ω$；
2. 幅度比 $\\frac{V_{OUT}}{V_{IN}} = \\frac{X_C}{\\sqrt{R^{2} + X_C^{2}}} = \\frac{1592}{1880} ≈ 0.847$；
3. 输入端被信号发生器的 50 Ω 拉低一点：CH1 ≈ 1.97 Vpp，CH2 ≈ 0.847 × 1.97 ≈ 1.67 Vpp；
4. 相位 $φ = -arctan\\frac{R}{X_C} = -arctan\\frac{1000}{1592} ≈ -32°$。

**再在屏幕上读**：两个同频率的正弦，[[dt|CH2 比 CH1 晚 Δt 到达波峰]]。一个 [[period|周期 T]] 对应 360°，所以
$$Δφ = -360° × \\frac{Δt}{T}$$
反过来 $Δt = \\frac{32°}{360°} × 1 ms ≈ 89 µs$，在 100 µs/div 下不到 1 格——要读准，可以把 time/div 调小，或者直接看屏幕下面的“相位差”读数。

[[phase|负号]] 表示 CH2 **滞后**（lag）：电容要先充电，电压总是慢半拍。第 4 期的滤波器、相量实验都靠这个读数。`,
          `Lesson 13: [[ch1|CH1]] on the RC's input, [[ch2|CH2]] on the capacitor voltage OUT, both clips on GND. With one time base the two traces can be compared directly.

**Predict** (R = 1 kΩ, C = 100 nF, f = 1 kHz):
1. reactance $X_C = \\frac{1}{2π f C} = \\frac{1}{2π × 1000 × 100 nF} ≈ 1592 Ω$;
2. amplitude ratio $\\frac{V_{OUT}}{V_{IN}} = \\frac{X_C}{\\sqrt{R^{2} + X_C^{2}}} = \\frac{1592}{1880} ≈ 0.847$;
3. the generator's 50 Ω pulls the input down slightly: CH1 ≈ 1.97 Vpp, CH2 ≈ 0.847 × 1.97 ≈ 1.67 Vpp;
4. phase $φ = -arctan\\frac{R}{X_C} = -arctan\\frac{1000}{1592} ≈ -32°$.

**Then read it off the screen**: of two sines at the same frequency, [[dt|CH2 reaches its peak Δt after CH1]]. One [[period|period T]] is 360°, so
$$Δφ = -360° × \\frac{Δt}{T}$$
Backwards: $Δt = \\frac{32°}{360°} × 1 ms ≈ 89 µs$, less than one division at 100 µs/div — to read it precisely, reduce time/div, or read the "phase" line under the screen.

The [[phase|minus sign]] means CH2 **lags**: the capacitor has to charge first, so its voltage is always a little late. Every filter and phasor lab in phase 4 relies on this reading.`,
        ),
        table: {
          head: [tr('读数', 'Reading'), tr('预测', 'Predicted'), tr('屏幕上怎么读', 'On screen')],
          rows: [
            ['CH1 Vpp', '1.97 V', tr('≈ 3.9 格 × 500 mV', '≈ 3.9 div × 500 mV')],
            ['CH2 Vpp', '1.67 V', tr('≈ 3.3 格 × 500 mV', '≈ 3.3 div × 500 mV')],
            ['T', '1 ms', tr('10 格 × 100 µs', '10 div × 100 µs')],
            ['Δt', '89 µs', tr('≈ 0.9 格 × 100 µs', '≈ 0.9 div × 100 µs')],
            [tr('相位差 CH2 相对 CH1', 'phase CH2 vs CH1'), '−32°', '$-360° × \\frac{Δt}{T}$'],
          ],
          parts: ['ch1', 'ch2', 'period', 'dt', 'phase'],
        },
        formulas: [
          { tex: 'Δφ = -360° × \\frac{Δt}{T} = -360° × \\frac{89 µs}{1 ms} ≈ -32°', note: tr('CH2 晚到 → 负号（滞后）', 'CH2 later → negative (lag)') },
          { tex: '\\frac{V_{OUT}}{V_{IN}} = \\frac{X_C}{\\sqrt{R^{2} + X_C^{2}}} ≈ 0.847', note: tr('RC 低通在 1 kHz', 'RC low-pass at 1 kHz') },
        ],
        calcs: ['phase-from-delay', 'period-frequency', 'capacitive-reactance'],
      },
    ],
    recap: tr(
      '示波器 = 每秒采样几百万次的电压表，画的是“针尖 − 接地夹”随时间的变化。读数 = 格数 × 每格的值：$Vpp = N_v × V/div$，$T = N_t × time/div$，$f = 1/T$，$Δφ = -360°·Δt/T$。每个通道是对 **大地** 的 1 MΩ ∥ 15 pF，所以接地夹只能夹 GND。',
      'A scope = a voltmeter sampling millions of times per second, drawing "tip − ground clip" against time. Readings = divisions × value per division: $Vpp = N_v × V/div$, $T = N_t × time/div$, $f = 1/T$, $Δφ = -360°·Δt/T$. Each channel is 1 MΩ ∥ 15 pF **to earth**, so the ground clip goes on GND only.',
    ),
  };
}
