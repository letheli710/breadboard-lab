// Teardown: PWM and the ADC. PWM = the GPIO output stage flipping between 0 and 3.3 V → its
// average D·V_H (the area under the wave) → an RC low-pass turns it into DC plus a ripple, derived
// with numbers from lab 5-14 → the ADC: sample-and-hold, the SAR comparator's binary search →
// quantisation and resolution → reading back a divided battery (lab 5-4) → the limits of a real
// ESP32 ADC and of PWM.

import './mcu.css';
import { tr } from '../../core/i18n';
import { sub, vis } from '../TeardownView';
import type { Teardown } from '../types';

/* ------------------------------------------------------------------ small schematic pieces */

function Res({ x1, y1, x2, y2, part, cls = '' }: { x1: number; y1: number; x2: number; y2: number; part?: string; cls?: string }) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const body = Math.min(40, L - 8);
  const a = (L - body) / 2;
  const pts: string[] = [`${x1},${y1}`, `${x1 + ux * a},${y1 + uy * a}`];
  for (let k = 1; k <= 6; k++) {
    const t = a + (body * k) / 6.5;
    const s = k % 2 ? 6 : -6;
    pts.push(`${x1 + ux * t - uy * s},${y1 + uy * t + ux * s}`);
  }
  pts.push(`${x1 + ux * (a + body)},${y1 + uy * (a + body)}`, `${x2},${y2}`);
  return <polyline points={pts.join(' ')} className={`mc-w ${cls}`} data-part={part} />;
}

function Gnd({ x, y, part }: { x: number; y: number; part?: string }) {
  return (
    <g className="mc-w minus" data-part={part}>
      <line x1={x - 11} y1={y} x2={x + 11} y2={y} />
      <line x1={x - 6} y1={y + 5} x2={x + 6} y2={y + 5} />
      <line x1={x - 2} y1={y + 10} x2={x + 2} y2={y + 10} />
    </g>
  );
}

const Dot = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r={3.5} className="mc-solid" />;

/** a capacitor on a vertical wire, plates centred on (x, y) */
function Cap({ x, y, part }: { x: number; y: number; part?: string }) {
  return (
    <g data-part={part}>
      <path d={`M${x - 14} ${y - 4} H${x + 14} M${x - 14} ${y + 4} H${x + 14}`} className="mc-w" />
    </g>
  );
}

/** a PWM square wave: baseline y0 (0 V), h px for 3.3 V, period T px, duty D */
function Wave({
  x0,
  y0,
  h,
  D,
  T,
  n,
  vh = 3.2,
  area,
  avg,
  cls = 'mc-curve',
  part,
}: {
  x0: number;
  y0: number;
  h: number;
  D: number;
  T: number;
  n: number;
  vh?: number;
  area?: boolean;
  avg?: boolean;
  cls?: string;
  part?: string;
}) {
  const yh = y0 - (vh / 3.3) * h;
  let d = `M${x0} ${y0}`;
  const rects: JSX.Element[] = [];
  for (let k = 0; k < n; k++) {
    const xs = x0 + k * T;
    d += ` V${yh} H${xs + D * T} V${y0} H${xs + T}`;
    if (area) rects.push(<rect key={k} x={xs} y={yh} width={D * T} height={y0 - yh} className="mc-area" />);
  }
  const ya = y0 - ((D * vh) / 3.3) * h;
  return (
    <g data-part={part}>
      {rects}
      <path d={d} className={cls} />
      {avg && <line x1={x0 - 6} y1={ya} x2={x0 + n * T + 6} y2={ya} className="mc-dash cur" data-part="avg" />}
    </g>
  );
}

/* ------------------------------------------------------------------ PWM (layers 0–2) */

function PwmSource({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 0, 0)}>
      <rect x={16} y={42} width={284} height={120} rx={10} className="mc-chipbox" />
      <text x={30} y={60} className="mc-tiny">
        {tr('芯片内部', 'inside the chip')}
      </text>
      <g data-part="timer">
        <rect x={26} y={78} width={96} height={46} rx={6} className="mc-box" />
        <text x={74} y={98} textAnchor="middle" className="mc-lbl">
          {tr('定时器', 'timer')}
        </text>
        <text x={74} y={114} textAnchor="middle" className="mc-tiny">
          {tr('数到 D·T 就翻转', 'flips at D·T')}
        </text>
        <path d="M122 100 H172" className="mc-dash" markerEnd="url(#pa-ah)" />
      </g>
      <g data-part="sw">
        <path d="M178 58 H202 M190 58 V74 M190 126 V134" className="mc-w" />
        <path d="M178 58 H202" className="mc-w plus" />
        <text x={208} y={62} className="mc-lbl plus">
          3.3 V
        </text>
        <circle cx={190} cy={74} r={2.5} className="mc-solid" />
        <circle cx={190} cy={126} r={2.5} className="mc-solid" />
        <circle cx={226} cy={100} r={2.5} className="mc-solid" />
        <line x1={226} y1={100} x2={193} y2={77} className="mc-w" />
        <Gnd x={190} y={134} />
        <text x={226} y={130} className="mc-tiny">
          {tr('推挽输出级', 'push-pull stage')}
        </text>
      </g>
      <path d="M226 100 H236 M282 100 H330 M390 100 H406 M420 100 H450 V136" className="mc-w" />
      <Res x1={236} y1={100} x2={282} y2={100} part="sw" />
      <text x={259} y={88} textAnchor="middle" className="mc-tiny">
        {sub('R_out 25 Ω')}
      </text>
      <Dot x={300} y={100} />
      <text x={304} y={120} className="mc-tiny" data-part="pin">
        GPIO2
      </text>
      <g data-part="load">
        <Res x1={330} y1={100} x2={390} y2={100} />
        <polygon points="406,91 406,109 420,100" className="mc-box" />
        <line x1={420} y1={91} x2={420} y2={109} className="mc-w" />
        <path d="M412 86 l8 -10 M420 88 l8 -10" className="mc-w thin" />
        <text x={360} y={88} textAnchor="middle" className="mc-tiny">
          330 Ω
        </text>
        <text x={430} y={78} className="mc-tiny">
          LED
        </text>
        <Gnd x={450} y={136} />
      </g>
    </g>
  );
}

const W = { x0: 80, y0: 384, h: 150, T: 140 };
const vy = (v: number, y0 = W.y0, h = W.h) => y0 - (v / 3.3) * h;

function PwmWave({ layer }: { layer: number }) {
  const { x0, y0, h, T } = W;
  return (
    <g className={vis(layer, 0, 0)}>
      <path d={`M${x0 - 10} ${y0} H530 M${x0 - 10} ${y0} V${vy(3.3) - 16}`} className="mc-axis" />
      <Wave x0={x0} y0={y0} h={h} D={0.25} T={T} n={3} part="wave" />
      <text x={x0 - 14} y={vy(3.2) + 4} textAnchor="end" className="mc-lbl plus" data-part="v-high">
        {sub('V_H')}
      </text>
      <text x={x0 - 14} y={vy(3.2) + 18} textAnchor="end" className="mc-tiny" data-part="v-high">
        3.2 V
      </text>
      <text x={x0 - 14} y={y0 + 4} textAnchor="end" className="mc-tiny">
        0 V
      </text>
      <g data-part="t-period">
        <path d={`M${x0} ${vy(3.3) - 6} H${x0 + T}`} className="mc-w acc thin" markerStart="url(#pa-ah)" markerEnd="url(#pa-ah)" />
        <text x={x0 + T / 2} y={vy(3.3) - 12} textAnchor="middle" className="mc-lbl acc">
          {tr('周期 T = 1 ms（1 kHz）', 'period T = 1 ms (1 kHz)')}
        </text>
      </g>
      <g data-part="t-on">
        <path d={`M${x0 + T} ${y0 + 14} H${x0 + T + 0.25 * T}`} className="mc-w cur thin" markerStart="url(#pa-ahc)" markerEnd="url(#pa-ahc)" />
        <text x={x0 + T + 0.125 * T} y={y0 + 32} textAnchor="middle" className="mc-lbl cur">
          {sub('t_on')}
        </text>
        <text x={x0 + T + 0.125 * T + 26} y={y0 + 32} className="mc-tiny">
          {tr('= D·T = 0.25 ms', '= D·T = 0.25 ms')}
        </text>
      </g>
      <text x={530} y={y0 + 18} textAnchor="end" className="td-small">
        t →
      </text>
      <text x={430} y={vy(1.6)} textAnchor="middle" className="mc-big">
        D = 25 %
      </text>
    </g>
  );
}

function PwmAverage({ layer }: { layer: number }) {
  const T = 120;
  const x0 = 90;
  const rows: [number, number, string][] = [
    [0.25, 200, '0.25 × 3.2 V = 0.80 V'],
    [0.75, 390, '0.75 × 3.2 V = 2.40 V'],
  ];
  return (
    <g className={vis(layer, 1, 1)}>
      {rows.map(([D, y0, t]) => (
        <g key={D}>
          <path d={`M${x0 - 10} ${y0} H${x0 + 3 * T + 16} M${x0 - 10} ${y0} V${y0 - 140}`} className="mc-axis" />
          <Wave x0={x0} y0={y0} h={120} D={D} T={T} n={3} area avg part="wave" />
          <text x={x0 - 14} y={vy(3.2, y0, 120) + 4} textAnchor="end" className="mc-tiny">
            3.2 V
          </text>
          <text x={x0 - 14} y={y0 + 4} textAnchor="end" className="mc-tiny">
            0
          </text>
          <text x={x0 + 3 * T + 26} y={y0 - 112} className="mc-big">
            D = {D * 100} %
          </text>
          <text x={x0 + 3 * T + 26} y={vy(D * 3.2, y0, 120) + 4} className="mc-lbl cur" data-part="avg">
            {sub('V̄')}
          </text>
          <text x={x0 + 3 * T + 26} y={y0 - 8} className="mc-tiny" data-part="avg">
            {t}
          </text>
        </g>
      ))}
      <text x={280} y={42} textAnchor="middle" className="td-small" data-part="area">
        {tr('阴影面积 ÷ 周期 = 平均值', 'shaded area ÷ period = average')}
      </text>
    </g>
  );
}

function RcFilter({ layer }: { layer: number }) {
  const x0 = 80;
  const y0 = 404;
  const h = 170;
  const T = 120;
  const lo = 1.4;
  const hi = 1.9;
  const pts: string[] = [];
  for (let k = 0; k <= 6; k++) pts.push(`${x0 + (k * T) / 2},${vy(k % 2 ? hi : lo, y0, h)}`);
  return (
    <g className={vis(layer, 2, 2)}>
      <g data-part="pwm-in">
        <rect x={24} y={70} width={88} height={52} rx={6} className="mc-box" />
        <path d="M34 110 h10 v-28 h10 v28 h10 v-28 h10 v28 h10" className="mc-w acc thin" />
        <text x={68} y={140} textAnchor="middle" className="mc-tiny">
          {tr('PWM 引脚', 'PWM pin')}
        </text>
      </g>
      <path d="M112 96 H150 M230 96 H330 M262 96 V114 M262 122 V140" className="mc-w" />
      <Res x1={150} y1={96} x2={230} y2={96} part="rf" />
      <Cap x={262} y={118} part="cf" />
      <Gnd x={262} y={140} part="cf" />
      <Dot x={262} y={96} />
      <text x={190} y={80} textAnchor="middle" className="mc-lbl" data-part="rf">
        R = 10 kΩ
      </text>
      <text x={282} y={124} className="mc-lbl" data-part="cf">
        C = 1 µF
      </text>
      <text x={262} y={84} textAnchor="middle" className="mc-lbl acc" data-part="vdac">
        VDAC
      </text>
      <g data-part="adcpin">
        <rect x={330} y={76} width={82} height={40} rx={6} className="mc-box" />
        <text x={371} y={100} textAnchor="middle" className="mc-tiny">
          {tr('ADC 引脚', 'ADC pin')}
        </text>
      </g>
      <text x={430} y={90} className="mc-lbl" data-part="rf cf">
        {sub('f_c = 16 Hz')}
      </text>
      <text x={430} y={108} className="mc-lbl" data-part="rf cf">
        τ = RC = 10 ms
      </text>
      {/* waveforms */}
      <path d={`M${x0 - 10} ${y0} H530 M${x0 - 10} ${y0} V${vy(3.3, y0, h) - 14}`} className="mc-axis" />
      <Wave x0={x0} y0={y0} h={h} D={0.5} T={T} n={3} vh={3.3} cls="mc-curve faint" part="pwm-in" />
      <polyline points={pts.join(' ')} className="mc-curve o" data-part="vdac ripple" />
      <line x1={x0 - 6} y1={vy(1.65, y0, h)} x2={x0 + 3 * T + 6} y2={vy(1.65, y0, h)} className="mc-dash" data-part="avg" />
      <text x={x0 - 14} y={vy(1.65, y0, h) + 4} textAnchor="end" className="mc-tiny" data-part="avg">
        1.65
      </text>
      <text x={x0 - 14} y={vy(3.3, y0, h) + 4} textAnchor="end" className="mc-tiny">
        3.3 V
      </text>
      <g data-part="ripple">
        <path d={`M${x0 + 3 * T + 20} ${vy(hi, y0, h)} V${vy(lo, y0, h)}`} className="mc-w cur thin" markerStart="url(#pa-ahc)" markerEnd="url(#pa-ahc)" />
        <text x={x0 + 3 * T + 26} y={vy(1.65, y0, h) + 4} className="mc-lbl cur">
          ΔV
        </text>
      </g>
      <text x={300} y={vy(3.3, y0, h) - 20} textAnchor="middle" className="td-small">
        {tr('紫：引脚上的方波　橙：电容电压（纹波放大约 6 倍画）', 'purple: pin square wave   orange: capacitor (ripple drawn ≈ 6× larger)')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ ADC (layers 3–5) */

function AdcBlock({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 3, 3)}>
      <rect x={128} y={60} width={414} height={350} rx={12} className="mc-chipbox" />
      <text x={140} y={80} className="mc-tiny">
        {tr('芯片内部的 ADC（12 位 SAR）', 'the ADC inside the chip (12-bit SAR)')}
      </text>
      <g data-part="rsrc">
        <circle cx={34} cy={200} r={4} className="mc-box" />
        <text x={34} y={186} textAnchor="middle" className="mc-tiny">
          {sub('V_in')}
        </text>
        <path d="M38 200 H54 M104 200 H128" className="mc-w" />
        <Res x1={54} y1={200} x2={104} y2={200} />
        <text x={79} y={226} textAnchor="middle" className="mc-tiny">
          {sub('R_src')}
        </text>
      </g>
      <g data-part="sh">
        <path d="M128 200 H150 M186 200 H230 V180 H262 M212 200 V256 M212 264 V292" className="mc-w" />
        <circle cx={150} cy={200} r={2.5} className="mc-solid" />
        <circle cx={186} cy={200} r={2.5} className="mc-solid" />
        <line x1={150} y1={200} x2={182} y2={186} className="mc-w" />
        <text x={168} y={176} textAnchor="middle" className="mc-tiny">
          {tr('采样开关', 'sample switch')}
        </text>
        <Cap x={212} y={260} />
        <Gnd x={212} y={292} />
        <Dot x={212} y={200} />
        <text x={150} y={264} className="mc-lbl">
          {sub('C_SH')}
        </text>
        <text x={150} y={280} className="mc-tiny">
          {tr('几 pF', 'a few pF')}
        </text>
      </g>
      <g data-part="cmp">
        <polygon points="262,160 262,240 330,200" className="mc-box" />
        <text x={268} y={186} className="mc-lbl plus">
          +
        </text>
        <text x={268} y={226} className="mc-lbl minus">
          −
        </text>
        <text x={296} y={154} textAnchor="middle" className="mc-tiny">
          {tr('比较器', 'comparator')}
        </text>
        <path d="M330 200 H370" className="mc-w" markerEnd="url(#pa-ah)" />
      </g>
      <g data-part="sar">
        <rect x={372} y={168} width={152} height={64} rx={8} className="mc-box" />
        <text x={448} y={190} textAnchor="middle" className="mc-lbl">
          {tr('SAR 逻辑', 'SAR logic')}
        </text>
        <text x={448} y={214} textAnchor="middle" className="mc-mono">
          1 0 1 0 0 0 …
        </text>
        <path d="M448 232 V326 H342" className="mc-w" markerEnd="url(#pa-ah)" />
        <text x={456} y={290} className="mc-tiny">
          {tr('试探码', 'trial code')}
        </text>
        <path d="M448 168 V112" className="mc-w" markerEnd="url(#pa-ah)" />
        <text x={456} y={126} className="mc-lbl acc">
          {tr('结果 0…4095', 'result 0…4095')}
        </text>
      </g>
      <g data-part="dac">
        <rect x={260} y={300} width={80} height={50} rx={6} className="mc-box" />
        <text x={300} y={330} textAnchor="middle" className="mc-lbl">
          DAC
        </text>
        <path d="M300 300 V272 H244 V220 H262" className="mc-w" />
        <path d="M300 350 V372" className="mc-w plus" />
        <text x={300} y={390} textAnchor="middle" className="mc-lbl plus" data-part="vref">
          {sub('V_ref = 3.3 V')}
        </text>
      </g>
    </g>
  );
}

function SarSteps({ layer }: { layer: number }) {
  const y = (v: number) => 380 - (v / 3.3) * 280;
  const vin = 2.084;
  const steps: [number, boolean, string][] = [
    [1.65, true, '1'],
    [2.475, false, '0'],
    [2.0625, true, '1'],
    [2.269, false, '0'],
  ];
  return (
    <g className={vis(layer, 4, 4)}>
      <path d={`M70 ${y(0)} H520 M70 ${y(0)} V${y(3.3) - 10}`} className="mc-axis" />
      {[0, 1.65, 3.3].map((v) => (
        <text key={v} x={64} y={y(v) + 4} textAnchor="end" className="mc-tiny">
          {v} V
        </text>
      ))}
      <line x1={70} y1={y(vin)} x2={520} y2={y(vin)} className="mc-w acc" data-part="vin" />
      <text x={520} y={y(vin) + 18} textAnchor="end" className="mc-lbl acc" data-part="vin">
        {sub('V_in = 2.084 V')}
      </text>
      {steps.map(([v, keep, bit], i) => {
        const x = 110 + i * 100;
        return (
          <g key={i} data-part={`step${i}`}>
            <line x1={x - 34} y1={y(v)} x2={x + 34} y2={y(v)} className={`mc-curve ${keep ? 'g' : 'r'}`} />
            <circle cx={x} cy={y(v)} r={5} fill={keep ? '#2a9d6f' : '#e63946'} />
            <text x={x} y={y(v) - 10} textAnchor="middle" className="mc-tiny">
              {v.toFixed(3)} V
            </text>
            <text x={x} y={y(0) + 20} textAnchor="middle" className="mc-tiny">
              {tr(`第 ${i + 1} 步`, `step ${i + 1}`)}
            </text>
            <text x={x} y={y(0) + 40} textAnchor="middle" className="mc-big" fill={keep ? '#2a9d6f' : '#e63946'}>
              b{3 - i} = {bit}
            </text>
            {i < 3 && <path d={`M${x + 34} ${y(v)} L${x + 66} ${y(steps[i + 1][0])}`} className="mc-dash" />}
          </g>
        );
      })}
      <text x={300} y={52} textAnchor="middle" className="mc-big" data-part="result">
        {tr('4 位示例：结果 1010₂ = 10 → 10 × 0.206 V = 2.06 V', '4-bit example: result 1010₂ = 10 → 10 × 0.206 V = 2.06 V')}
      </text>
    </g>
  );
}

function Quant({ layer }: { layer: number }) {
  // 3-bit illustration: code = round(V / 3.3 · 7)
  const x = (v: number) => 80 + (v / 3.3) * 400;
  const y = (c: number) => 370 - c * 38;
  let d = `M${x(0)} ${y(0)}`;
  for (let c = 0; c < 7; c++) {
    const xe = x(((c + 0.5) / 7) * 3.3);
    d += ` H${xe} V${y(c + 1)}`;
  }
  d += ` H${x(3.3)}`;
  return (
    <g className={vis(layer, 5, 5)}>
      <path d={`M${x(0)} ${y(0)} H${x(3.3) + 20} M${x(0)} ${y(0)} V${y(7) - 24}`} className="mc-axis" />
      {Array.from({ length: 8 }, (_, c) => (
        <text key={c} x={x(0) - 8} y={y(c) + 4} textAnchor="end" className="mc-tiny">
          {c}
        </text>
      ))}
      <line x1={x(0)} y1={y(0)} x2={x(3.3)} y2={y(7)} className="mc-dash" data-part="ideal" />
      <path d={d} className="mc-curve" data-part="stairs" />
      <g data-part="lsb">
        <path d={`M${x((2.5 / 7) * 3.3)} ${y(3) + 16} H${x((3.5 / 7) * 3.3)}`} className="mc-w cur thin" markerStart="url(#pa-ahc)" markerEnd="url(#pa-ahc)" />
        <text x={x((3 / 7) * 3.3)} y={y(3) + 32} textAnchor="middle" className="mc-lbl cur">
          1 LSB
        </text>
      </g>
      <g data-part="qerr">
        <path d={`M${x((5 / 7) * 3.3)} ${y(5)} V${y(5) + 19}`} className="mc-w acc thin" />
        <text x={x((5 / 7) * 3.3) + 6} y={y(5) + 16} className="mc-tiny">
          {tr('误差 ≤ ½ LSB', 'error ≤ ½ LSB')}
        </text>
      </g>
      <text x={x(3.3) + 16} y={y(0) + 20} textAnchor="end" className="td-small">
        {sub('V_in → 3.3 V')}
      </text>
      <text x={x(0) + 6} y={y(7) - 12} className="td-small">
        {tr('数字码', 'code')}
      </text>
      <text x={330} y={56} textAnchor="middle" className="mc-big">
        {tr('3 位示例：8 个台阶；12 位有 4096 个', '3-bit example: 8 steps; 12 bits have 4096')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ battery divider (layer 6) */

function Battery({ layer }: { layer: number }) {
  const sx1 = 360;
  const sx2 = 480;
  const yb = (v: number) => 390 - (v / 13.3) * 300;
  const pts: [number, string][] = [
    [6.0, '6.0 V → 1847'],
    [7.4, '7.4 V → 2278'],
    [8.4, '8.4 V → 2586'],
    [12, '12 V → 3695'],
  ];
  return (
    <g className={vis(layer, 6, 6)}>
      <g data-part="vbat">
        <circle cx={50} cy={230} r={16} className="mc-box" />
        <text x={50} y={228} textAnchor="middle" className="mc-lbl plus">
          +
        </text>
        <text x={50} y={242} textAnchor="middle" className="mc-lbl minus">
          −
        </text>
        <text x={60} y={198} className="mc-lbl">
          {sub('V_BAT')}
        </text>
        <text x={60} y={276} className="mc-tiny">
          6.0–8.4 V
        </text>
      </g>
      <path d="M50 214 V90 H170 V104 M170 168 V200 M170 260 V350 H50 V246 M170 200 H250 M220 200 V244 M220 252 V350" className="mc-w" />
      <Res x1={170} y1={104} x2={170} y2={168} part="r1" />
      <Res x1={170} y1={200} x2={170} y2={260} part="r2" />
      <Cap x={220} y={248} part="c1" />
      <Gnd x={110} y={350} />
      <Dot x={170} y={200} />
      <Dot x={220} y={200} />
      <Dot x={170} y={350} />
      <Dot x={220} y={350} />
      <text x={182} y={140} className="mc-lbl" data-part="r1">
        R1 100 kΩ
      </text>
      <text x={158} y={234} textAnchor="end" className="mc-lbl" data-part="r2">
        R2 33 kΩ
      </text>
      <text x={232} y={262} className="mc-tiny" data-part="c1">
        C1 100 nF
      </text>
      <g data-part="adcpin">
        <rect x={250} y={184} width={70} height={32} rx={5} className="mc-box" />
        <text x={285} y={204} textAnchor="middle" className="mc-tiny">
          GPIO34
        </text>
      </g>
      <text x={196} y={192} textAnchor="middle" className="mc-lbl acc" data-part="vsense">
        VSENSE
      </text>
      {/* two scales: battery side and ADC side, k = 0.248 */}
      <g data-part="scales">
        <path d={`M${sx1} ${yb(0)} V${yb(13.3)} M${sx2} ${yb(0)} V${yb(13.3)}`} className="mc-axis" />
        <text x={sx1} y={yb(13.3) - 24} textAnchor="middle" className="mc-lbl">
          {sub('V_BAT')}
        </text>
        <text x={sx2} y={yb(13.3) - 24} textAnchor="middle" className="mc-lbl">
          {sub('V_ADC')}
        </text>
        <text x={sx1} y={yb(13.3) - 8} textAnchor="middle" className="mc-tiny">
          13.3 V
        </text>
        <text x={sx2} y={yb(13.3) - 8} textAnchor="middle" className="mc-tiny">
          3.3 V = 4095
        </text>
        <text x={sx1} y={yb(0) + 16} textAnchor="middle" className="mc-tiny">
          0
        </text>
        <text x={sx2} y={yb(0) + 16} textAnchor="middle" className="mc-tiny">
          0
        </text>
        <text x={(sx1 + sx2) / 2} y={yb(0) + 34} textAnchor="middle" className="mc-lbl cur">
          × k = 0.248
        </text>
        {pts.map(([v, t]) => (
          <g key={v}>
            <line x1={sx1} y1={yb(v)} x2={sx2} y2={yb(v)} className={v === 12 ? 'mc-dash' : 'mc-w thin'} />
            <circle cx={sx1} cy={yb(v)} r={3} className="mc-solid" />
            <circle cx={sx2} cy={yb(v)} r={3} className="mc-solid" />
            <text x={sx2 + 8} y={yb(v) + 4} className="mc-tiny">
              {t}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ limits (layer 7) */

function RealAdc({ layer }: { layer: number }) {
  const x = (v: number) => 90 + (v / 3.3) * 400;
  const y = (c: number) => 380 - (c / 4095) * 290;
  // a rough ESP32-like curve: dead below 0.1 V, linear to 2.45 V, bending to saturation near 3.1 V
  const real: string[] = [];
  for (let v = 0; v <= 3.3001; v += 0.05) {
    let c: number;
    if (v < 0.1) c = 0;
    else if (v < 2.45) c = ((v - 0.1) / 3.0) * 4095;
    else {
      const base = (2.35 / 3.0) * 4095;
      const t = Math.min(1, (v - 2.45) / 0.65);
      c = Math.min(4095, base + (4095 - base) * (1 - (1 - t) * (1 - t)));
    }
    real.push(`${x(v)},${y(c)}`);
  }
  return (
    <g className={vis(layer, 7, 7)}>
      <rect x={x(0.15)} y={y(4095)} width={x(2.45) - x(0.15)} height={y(0) - y(4095)} className="mc-zone-lo" data-part="good" />
      <text x={(x(0.15) + x(2.45)) / 2} y={y(4095) + 18} textAnchor="middle" className="mc-lbl minus" data-part="good">
        {tr('线性好的区间 0.15–2.45 V', 'the linear range 0.15–2.45 V')}
      </text>
      <path d={`M${x(0)} ${y(0)} H${x(3.3) + 16} M${x(0)} ${y(0)} V${y(4095) - 16}`} className="mc-axis" />
      <line x1={x(0)} y1={y(0)} x2={x(3.3)} y2={y(4095)} className="mc-dash" data-part="ideal" />
      <polyline points={real.join(' ')} className="mc-curve r" data-part="real" />
      <text x={x(3.3) - 4} y={y(4095) - 6} textAnchor="end" className="td-small" data-part="ideal">
        {tr('仿真（理想）', 'simulator (ideal)')}
      </text>
      <text x={x(2.9)} y={y(2600)} textAnchor="middle" className="mc-lbl plus" data-part="real">
        {tr('真实 ESP32', 'real ESP32')}
      </text>
      <text x={x(0)} y={y(0) + 18} className="mc-tiny" data-part="real">
        {tr('< 0.1 V 读不出', '< 0.1 V reads 0')}
      </text>
      <text x={x(3.3) + 16} y={y(0) + 18} textAnchor="end" className="td-small">
        {sub('V_in → 3.3 V')}
      </text>
      <text x={x(0) - 8} y={y(4095) + 4} textAnchor="end" className="mc-tiny">
        4095
      </text>
      <text x={x(0) - 8} y={y(0) + 4} textAnchor="end" className="mc-tiny">
        0
      </text>
      <text x={x(0) + 8} y={y(4095) - 20} className="td-small">
        {tr('读数', 'reading')}
      </text>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="pa-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="mc-ah" />
        </marker>
        <marker id="pa-ahc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="mc-ah cur" />
        </marker>
      </defs>
      <PwmSource layer={layer} />
      <PwmWave layer={layer} />
      <PwmAverage layer={layer} />
      <RcFilter layer={layer} />
      <AdcBlock layer={layer} />
      <SarSteps layer={layer} />
      <Quant layer={layer} />
      <Battery layer={layer} />
      <RealAdc layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'pwm-adc',
    title: tr('PWM 与 ADC：数字引脚怎么“输出”和“读入”模拟量', 'PWM and ADC: how a digital chip puts out and reads in analog'),
    subtitle: tr(
      'PWM = Pulse-Width Modulation（脉冲宽度调制），ADC = Analog-to-Digital Converter（模数转换器）。芯片只会输出 0 和 3.3 V、只会处理数字——我们拆开看它怎样用“快速开关 + 平均”假装输出模拟电压，又怎样用“采样 + 二分查找”把电压变成数字。',
      'PWM = Pulse-Width Modulation, ADC = Analog-to-Digital Converter. A chip can only put out 0 or 3.3 V and only handles numbers. We take apart how it fakes an analog output by switching fast and averaging, and how it turns a voltage into a number by sampling and binary search.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'pwm',
        short: 'PWM',
        title: tr('① PWM：同一个输出级，开开关关', '① PWM: the same output stage, switched on and off'),
        body: tr(
          `PWM 不是新的硬件，就是上一个拆解里那个 [[sw|推挽输出级]]，只不过由芯片里的 [[timer|定时器 timer]] 自动地、很快地在 HIGH 和 LOW 之间切换：
- 每个 [[t-period|周期 T]] 开始时引脚变 HIGH；
- 定时器数到 [[t-on|$t_on$]] 就把它变 LOW，等下一个周期。

高电平占整个周期的比例叫 **duty cycle（占空比）**：
$$D = \\frac{t_{on}}{T}$$
第 16 课：GPIO2 设成 PWM，1 kHz（T = 1 ms），D = 25 %，所以 $t_{on}$ = 0.25 ms。

注意 [[v-high|高电平]] 不是 3.3 V 而是 3.2 V：高电平期间引脚就是“3.3 V 串 25 Ω”，[[load|LED 和 330 Ω]] 上的电流 $I = \\frac{3.3 - 1.8}{25 + 330 + 12} = 4.1 mA$ 在 $R_{out}$ 上压掉 $25 × 4.1 mA ≈ 0.1 V$。示波器上量到的 Vpp ≈ 3.2 V。

**PWM 没有改变“每一刻”的电流**：亮的那 25 % 时间里 LED 照样流 4.1 mA。它不能绕过引脚的电流上限。`,
          `PWM is not new hardware. It is the [[sw|push-pull output stage]] of the last teardown, switched automatically and quickly between HIGH and LOW by a [[timer|timer]] inside the chip:
- at the start of every [[t-period|period T]] the pin goes HIGH;
- when the timer has counted to [[t-on|$t_on$]] it goes LOW until the next period.

The fraction of the period spent high is the **duty cycle**:
$$D = \\frac{t_{on}}{T}$$
Lesson 16: GPIO2 in PWM mode, 1 kHz (T = 1 ms), D = 25 %, so $t_{on}$ = 0.25 ms.

Note that [[v-high|the high level]] is 3.2 V, not 3.3 V: while high, the pin is "3.3 V behind 25 Ω", and the current through [[load|the LED and 330 Ω]], $I = \\frac{3.3 - 1.8}{25 + 330 + 12} = 4.1 mA$, drops $25 × 4.1 mA ≈ 0.1 V$ in $R_{out}$. The scope shows Vpp ≈ 3.2 V.

**PWM does not change the current at any instant**: during the 25 % on-time the LED still carries 4.1 mA. It is no way around a pin's current limit.`,
        ),
        table: {
          head: [tr('量', 'Quantity'), tr('符号', 'Symbol'), tr('第 16 课的值', 'Lesson 16')],
          rows: [
            [tr('频率', 'frequency'), '$f = \\frac{1}{T}$', '1 kHz'],
            [tr('周期', 'period'), 'T', '1 ms'],
            [tr('占空比', 'duty cycle'), '$D = \\frac{t_{on}}{T}$', '25 %'],
            [tr('高电平时间', 'on-time'), '$t_{on}$', '0.25 ms'],
            [tr('高电平', 'high level'), '$V_H$', '3.3 − 25 Ω × 4.1 mA ≈ 3.2 V'],
            [tr('高电平期间的 LED 电流', 'LED current while high'), '$I_{on}$', '4.1 mA'],
          ],
          parts: ['t-period', 't-period', 't-on', 't-on', 'v-high', 'load'],
        },
      },
      {
        id: 'average',
        short: tr('平均值', 'Average'),
        title: tr('② 平均值 = 占空比 × 高电平：面积除以时间', '② Average = duty × high level: area divided by time'),
        body: tr(
          `万用表的直流档很“慢”，它显示的是一段时间里的 **平均值**。平均值的定义：一个周期内电压对时间的积分（[[area|阴影面积]]）除以周期：
$$V̄ = \\frac{1}{T}∫_{0}^{T} v(t) dt$$
PWM 的 $v(t)$ 只有两段：$t_{on}$ 内是 $V_H$，其余时间是 0，所以积分就是一个矩形：
$$V̄ = \\frac{V_H·t_{on} + 0·(T - t_{on})}{T} = D·V_H$$
代数字（第 16 课）：
- D = 25 %：[[avg|V̄]] = 0.25 × 3.2 V = **0.80 V**（万用表读数）；
- D = 75 %：V̄ = 0.75 × 3.2 V = **2.40 V**，正好是 25 % 时的 3 倍；
- LED 的平均电流同理：0.25 × 4.1 mA ≈ **1.0 mA**。

眼睛也是“慢”的：几百 Hz 以上看不出闪，只感觉到平均亮度。所以 PWM 能调光、调速——改变的是 **平均** 功率，而不是瞬时电压。`,
          `A multimeter's DC range is "slow": it shows the **average** over time. By definition the average is the integral of voltage over one period (the [[area|shaded area]]) divided by the period:
$$V̄ = \\frac{1}{T}∫_{0}^{T} v(t) dt$$
A PWM $v(t)$ has only two pieces — $V_H$ for $t_{on}$ and 0 for the rest — so the integral is one rectangle:
$$V̄ = \\frac{V_H·t_{on} + 0·(T - t_{on})}{T} = D·V_H$$
With numbers (lesson 16):
- D = 25 %: [[avg|V̄]] = 0.25 × 3.2 V = **0.80 V** (the multimeter reading);
- D = 75 %: V̄ = 0.75 × 3.2 V = **2.40 V**, exactly 3 times the 25 % value;
- the LED's average current likewise: 0.25 × 4.1 mA ≈ **1.0 mA**.

The eye is slow too: above a few hundred Hz it sees no flicker, only the average brightness. That is why PWM dims LEDs and sets motor speed — it changes the **average** power, not the instantaneous voltage.`,
        ),
        table: {
          head: [tr('仪器', 'Instrument'), tr('它看到什么', 'What it sees'), tr('D = 25 % 时读数', 'Reading at D = 25 %')],
          rows: [
            [tr('示波器', 'oscilloscope'), tr('真实方波：0 和 3.2 V', 'the real square wave: 0 and 3.2 V'), 'Vpp ≈ 3.2 V'],
            [tr('万用表直流档', 'multimeter DC'), tr('平均值', 'the average'), '≈ 0.80 V'],
            [tr('万用表电流档（串在 LED 上）', 'DC ammeter in series'), tr('平均电流', 'average current'), '≈ 1.0 mA'],
            [tr('眼睛', 'the eye'), tr('平均亮度', 'average brightness'), tr('约全亮的 1/4', 'about ¼ of full')],
          ],
          parts: ['wave', 'avg', 'avg', 'area'],
        },
        formulas: [{ tex: 'V̄ = \\frac{1}{T}∫_{0}^{T} v dt = D·V_H', note: tr('任何 PWM 波形的直流分量', 'the DC component of any PWM wave') }],
        calcs: ['pwm-average'],
      },
      {
        id: 'rc',
        short: tr('RC 滤波', 'RC filter'),
        title: tr('③ 加一个 RC：把方波变成直流（PWM DAC）', '③ Add an RC: turn the square wave into DC (a PWM DAC)'),
        body: tr(
          `实验 5-14：引脚 → [[rf|R = 10 kΩ]] → 结点 [[vdac|VDAC]] → [[cf|C = 1 µF]] → GND，VDAC 再接回一个 [[adcpin|ADC 引脚]] 自己读。

**为什么能得到直流**：方波 = 直流分量 $D·V_H$ + 频率为 f、2f、3f… 的交流分量。RC 低通对直流是开路（电容不通直流），直流全部通过；对交流的衰减约为 $\\frac{f_c}{f}$：
$$f_c = \\frac{1}{2πRC} = \\frac{1}{2π × 10 kΩ × 1 µF} ≈ 16 Hz$$
1 kHz 的基波只剩 16/1000 ≈ 1.6 %。

**剩下的纹波（ripple）有多大**：τ = RC = 10 ms ≫ T = 1 ms，电容电压几乎不变，约等于 V̄。高电平期间流进电容的电流 $\\frac{V_H - V̄}{R}$ 近似恒定，持续 $D·T$，电容电压升高
$$ΔV = \\frac{I·t_{on}}{C} = \\frac{(V_H - D V_H)·D T}{RC} = \\frac{V_H·D(1 - D)}{f·R·C}$$
- 1 kHz、50 %：$\\frac{3.3 × 0.25}{1000 × 10 ms}$ ≈ **82 mV**（仿真 82 mV）；
- 25 % 或 75 %：D(1 − D) = 0.1875 → **62 mV**——50 % 时纹波最大；
- 10 kHz：频率 ×10，纹波 ÷10 → **8.2 mV**；
- 100 Hz：T = τ，近似不再成立，精确值 $3.3·tanh(\\frac{T}{4τ})$ ≈ **0.81 V**——这已经不是“直流”了。

**代价**：RC 越大纹波越小，但改占空比后 VDAC 要等 4.6τ ≈ 46 ms 才稳定到 1 % 以内。想又小又快，就提高 PWM 频率。`,
          `Lab 5-14: pin → [[rf|R = 10 kΩ]] → node [[vdac|VDAC]] → [[cf|C = 1 µF]] → GND, with VDAC wired back to an [[adcpin|ADC pin]] so the chip reads it itself.

**Why you get DC**: a square wave = a DC component $D·V_H$ + AC at f, 2f, 3f… An RC low-pass is open to DC (a capacitor passes no DC), so all of the DC gets through; AC is attenuated by about $\\frac{f_c}{f}$:
$$f_c = \\frac{1}{2πRC} = \\frac{1}{2π × 10 kΩ × 1 µF} ≈ 16 Hz$$
Only 16/1000 ≈ 1.6 % of the 1 kHz fundamental is left.

**How big is the remaining ripple**: τ = RC = 10 ms ≫ T = 1 ms, so the capacitor voltage hardly moves and stays ≈ V̄. While the pin is high the current into the capacitor, $\\frac{V_H - V̄}{R}$, is nearly constant for $D·T$, raising its voltage by
$$ΔV = \\frac{I·t_{on}}{C} = \\frac{(V_H - D V_H)·D T}{RC} = \\frac{V_H·D(1 - D)}{f·R·C}$$
- 1 kHz, 50 %: $\\frac{3.3 × 0.25}{1000 × 10 ms}$ ≈ **82 mV** (simulated 82 mV);
- 25 % or 75 %: D(1 − D) = 0.1875 → **62 mV** — the ripple peaks at 50 %;
- 10 kHz: frequency ×10, ripple ÷10 → **8.2 mV**;
- 100 Hz: T = τ and the approximation fails; the exact value $3.3·tanh(\\frac{T}{4τ})$ ≈ **0.81 V** — no longer "DC".

**The price**: a larger RC means less ripple but, after a duty change, VDAC needs 4.6τ ≈ 46 ms to settle within 1 %. For small *and* fast, raise the PWM frequency.`,
        ),
        table: {
          head: [tr('频率', 'Frequency'), 'D', tr('平均 VDAC', 'Average VDAC'), tr('ADC 读数', 'ADC code'), tr('纹波 Vpp', 'Ripple Vpp')],
          rows: [
            ['1 kHz', '25 %', '0.824 V', '1023', '62 mV'],
            ['1 kHz', '50 %', '1.649 V', '2045', '82 mV'],
            ['1 kHz', '75 %', '2.473 V', '3068', '62 mV'],
            ['100 Hz', '50 %', '1.649 V', '2045', '0.81 V'],
            ['10 kHz', '50 %', '1.649 V', '2045', '8.2 mV'],
          ],
          parts: ['avg', 'ripple', 'avg', 'ripple', 'ripple'],
        },
        formulas: [
          { tex: 'f_c = \\frac{1}{2πRC} ≈ 16 Hz', note: tr('截止频率要远低于 PWM 频率', 'keep it far below the PWM frequency') },
          { tex: 'ΔV ≈ \\frac{V_H·D(1 - D)}{f·R·C}', note: tr('τ ≫ T 时的纹波（峰峰值）', 'peak-to-peak ripple for τ ≫ T') },
        ],
        calcs: ['pwm-rc-ripple', 'pwm-average'],
      },
      {
        id: 'adc',
        short: 'ADC',
        title: tr('④ 反过来：ADC 里面是采样保持 + 比较器 + DAC', '④ The other way: inside the ADC, a sample-and-hold, a comparator and a DAC'),
        body: tr(
          `ADC 把电压变成数字，ESP32 和 STM32 用的都是 **SAR ADC（逐次逼近型，Successive Approximation Register）**。它由四块组成：
1. [[sh|采样保持 sample-and-hold]]：一个开关 + 一个几 pF 的电容 $C_{SH}$。开关闭合一小段时间（采样），电容充到输入电压；然后开关断开（保持），后面怎么比较输入都不会变；
2. [[dac|DAC（数模转换器）]]：把一个试探码变回电压，满量程等于 [[vref|参考电压 $V_ref$ = 3.3 V]]；
3. [[cmp|比较器 comparator]]：只回答一个问题——采样到的电压比 DAC 的电压高还是低？
4. [[sar|SAR 逻辑]]：根据比较结果一位一位地定下数字码。

**源阻抗**：采样时 $C_{SH}$ 要经过外部电路的电阻 [[rsrc|$R_src$]] 充电。要在采样时间内充到误差小于半个 LSB，需要大约 $(N + 1)·ln2 ≈ 9$ 个时间常数（12 位）。$R_{src}$ 太大，读数偏低、发抖。实验 5-4 的分压器源阻抗 = 100 kΩ ∥ 33 kΩ ≈ 24.8 kΩ，所以在引脚上并一个 100 nF 电容做“小水库”：采样那一下从电容取电荷，而不是从 24.8 kΩ 后面取。`,
          `An ADC turns a voltage into a number; the ESP32 and the STM32 both use a **SAR ADC (Successive Approximation Register)**. It has four blocks:
1. [[sh|sample-and-hold]]: a switch and a capacitor $C_{SH}$ of a few pF. The switch closes briefly (sampling) and the capacitor charges to the input voltage; then it opens (hold), so the input can't change during the comparisons;
2. [[dac|a DAC (digital-to-analog converter)]]: turns a trial code back into a voltage; full scale is the [[vref|reference $V_ref$ = 3.3 V]];
3. [[cmp|a comparator]]: answers one question — is the sampled voltage above or below the DAC's?
4. [[sar|the SAR logic]]: decides the code one bit at a time from those answers.

**Source impedance**: during sampling $C_{SH}$ charges through the outside circuit's resistance [[rsrc|$R_src$]]. To settle within half an LSB it needs about $(N + 1)·ln2 ≈ 9$ time constants (12 bits). Too much $R_{src}$ and the readings come out low and noisy. The divider of lab 5-4 has a source impedance of 100 kΩ ∥ 33 kΩ ≈ 24.8 kΩ, so a 100 nF capacitor on the pin acts as a small reservoir: the sampler takes its charge from the capacitor, not through 24.8 kΩ.`,
        ),
        table: {
          head: [tr('块', 'Block'), tr('作用', 'Job'), tr('数值 / 注意', 'Value / note')],
          rows: [
            [tr('采样保持', 'sample-and-hold'), tr('冻结输入电压', 'freezes the input'), tr('$C_{SH}$ 几 pF；采样时间 µs 级', '$C_{SH}$ a few pF; µs sampling')],
            ['DAC', tr('试探码 → 电压', 'trial code → voltage'), '$V = \\frac{code}{4095}·V_{ref}$'],
            [tr('比较器', 'comparator'), tr('高还是低', 'above or below'), tr('每一步 1 位', '1 bit per step')],
            [tr('SAR 逻辑', 'SAR logic'), tr('二分查找', 'binary search'), tr('12 位 = 12 步', '12 bits = 12 steps')],
            [tr('源阻抗', 'source impedance'), tr('给 $C_{SH}$ 充电的路径', 'what charges $C_{SH}$'), tr('ESP32 宜 < 10 kΩ，或加电容', 'ESP32: < 10 kΩ or add a capacitor')],
          ],
          parts: ['sh', 'dac', 'cmp', 'sar', 'rsrc'],
        },
      },
      {
        id: 'sar',
        short: tr('逐次逼近', 'SAR steps'),
        title: tr('⑤ SAR：一次比一位的二分查找', '⑤ SAR: a binary search, one bit per comparison'),
        body: tr(
          `用一个 4 位 ADC（16 个台阶，每个台阶 $\\frac{3.3}{16}$ = 0.206 V）演示，输入是实验 5-4 满电时的 [[vin|$V_in$ = 2.084 V]]。SAR 从最高位开始猜：
1. [[step0|试 1000₂ = 8 → 1.650 V]]：V_in 更高 → 这一位 **保留 1**；
2. [[step1|试 1100₂ = 12 → 2.475 V]]：V_in 更低 → 这一位 **改回 0**；
3. [[step2|试 1010₂ = 10 → 2.063 V]]：V_in 更高 → **保留 1**；
4. [[step3|试 1011₂ = 11 → 2.269 V]]：V_in 更低 → **改回 0**。

[[result|结果 1010₂ = 10]]，代表 10 × 0.206 = 2.06 V，和真实值差不到一个台阶。

每一步把可能的范围砍掉一半，所以 N 位只要 N 次比较：12 位的 ESP32 / STM32 是 12 步，加上采样，一次转换只要几微秒。这和你猜 1–100 之间的数“先猜 50”是同一个道理。`,
          `Take a 4-bit ADC (16 steps, each $\\frac{3.3}{16}$ = 0.206 V) and the input of lab 5-4 with a full battery, [[vin|$V_in$ = 2.084 V]]. The SAR guesses from the top bit down:
1. [[step0|try 1000₂ = 8 → 1.650 V]]: V_in is higher → **keep 1**;
2. [[step1|try 1100₂ = 12 → 2.475 V]]: V_in is lower → **back to 0**;
3. [[step2|try 1010₂ = 10 → 2.063 V]]: V_in is higher → **keep 1**;
4. [[step3|try 1011₂ = 11 → 2.269 V]]: V_in is lower → **back to 0**.

[[result|The result is 1010₂ = 10]], meaning 10 × 0.206 = 2.06 V — within one step of the true value.

Every step halves the remaining range, so N bits take N comparisons: 12 steps for the 12-bit ESP32 / STM32, a few microseconds per conversion including the sample. It is the same trick as guessing a number from 1 to 100 by starting at 50.`,
        ),
        table: {
          head: [tr('步', 'Step'), tr('试探码', 'Trial code'), tr('DAC 电压', 'DAC voltage'), tr('比较', 'Compare'), tr('这一位', 'Bit')],
          rows: [
            ['1', '1000₂ = 8', '1.650 V', '2.084 > 1.650', 'b3 = 1'],
            ['2', '1100₂ = 12', '2.475 V', '2.084 < 2.475', 'b2 = 0'],
            ['3', '1010₂ = 10', '2.063 V', '2.084 > 2.063', 'b1 = 1'],
            ['4', '1011₂ = 11', '2.269 V', '2.084 < 2.269', 'b0 = 0'],
          ],
          parts: ['step0', 'step1', 'step2', 'step3'],
        },
      },
      {
        id: 'quant',
        short: tr('量化', 'Quantisation'),
        title: tr('⑥ 量化：台阶有多细（分辨率）', '⑥ Quantisation: how fine the steps are (resolution)'),
        body: tr(
          `ADC 的输出只能是整数，所以输入和输出之间是一条 [[stairs|台阶]]，而不是 [[ideal|直线]]。一个台阶叫 **1 LSB**（Least Significant Bit，最低有效位），它就是分辨率：
$$1 LSB = \\frac{V_{ref}}{2^{N}} = \\frac{3.3 V}{4096} = 0.806 mV$$
本仿真器的读数规则（和第 16 课一样）：
$$code = round(\\frac{V}{V_{ref}}·(2^{N} - 1)) = round(\\frac{V}{3.3}·4095)$$
- 第 16 课，电位器中点 1.65 V：$\\frac{1.65}{3.3} × 4095 = 2047.5$ → **2048**；
- 实验 5-4 满电 2.084 V：$\\frac{2.084}{3.3} × 4095$ → **2586**。

（教材有的写 $2^{N}$、有的写 $2^{N} - 1$，差 1/4096 = 0.02 %，远小于真实 ADC 的误差。）

四舍五入意味着 [[qerr|量化误差]] 最多 ±½ LSB——这是 ADC 再理想也去不掉的误差。位数每多 1 位，台阶细一倍。`,
          `An ADC can only output whole numbers, so input to output is a [[stairs|staircase]], not a [[ideal|straight line]]. One step is **1 LSB** (Least Significant Bit) — the resolution:
$$1 LSB = \\frac{V_{ref}}{2^{N}} = \\frac{3.3 V}{4096} = 0.806 mV$$
The simulator's rule (as in lesson 16):
$$code = round(\\frac{V}{V_{ref}}·(2^{N} - 1)) = round(\\frac{V}{3.3}·4095)$$
- lesson 16, pot at mid-travel 1.65 V: $\\frac{1.65}{3.3} × 4095 = 2047.5$ → **2048**;
- lab 5-4 full battery, 2.084 V: $\\frac{2.084}{3.3} × 4095$ → **2586**.

(Some books divide by $2^{N}$, some by $2^{N} - 1$: a difference of 1/4096 = 0.02 %, far below a real ADC's error.)

Rounding means the [[qerr|quantisation error]] is at most ±½ LSB — an error no ADC, however ideal, can remove. Each extra bit halves the step.`,
        ),
        table: {
          head: [tr('位数 N', 'Bits N'), tr('台阶数 2^N', 'Steps 2^N'), tr('1 LSB（V_ref = 3.3 V）', '1 LSB (V_ref = 3.3 V)'), tr('例子', 'Example')],
          rows: [
            ['8', '256', '12.9 mV', tr('ESP32 的 DAC（GPIO25 / 26）', 'ESP32 DAC (GPIO25 / 26)')],
            ['10', '1024', '3.22 mV', 'Arduino Uno（5 V：4.9 mV）'],
            ['12', '4096', '0.806 mV', 'ESP32 / STM32F103 ADC'],
            ['16', '65536', '50 µV', tr('外置 ADC（ADS1115）', 'external ADC (ADS1115)')],
          ],
          parts: ['lsb', 'lsb', 'lsb', 'lsb'],
        },
        formulas: [
          { tex: 'code = round(\\frac{V}{V_{ref}}·(2^{N} - 1))', note: tr('仿真器的读数公式', 'the simulator’s reading') },
          { tex: '1 LSB = \\frac{V_{ref}}{2^{N}} = 0.806 mV', note: tr('12 位、3.3 V', '12 bits, 3.3 V') },
        ],
        calcs: ['adc-code'],
      },
      {
        id: 'battery',
        short: tr('读电池', 'Battery'),
        title: tr('⑦ 量一个比 3.3 V 高的电压：先分压，再读，再乘回去', '⑦ Measuring above 3.3 V: divide, read, multiply back'),
        body: tr(
          `实验 5-4：2S 锂电池 6.0–8.4 V，比 ADC 的 3.3 V 满量程高，直接接会烧引脚。用 [[r1|R1 = 100 kΩ]] 和 [[r2|R2 = 33 kΩ]] 分压，[[vsense|VSENSE]] 接 [[adcpin|GPIO34]]：
$$k = \\frac{R_2}{R_1 + R_2} = \\frac{33}{133} = 0.248$$
**第 1 步 · 电池 → ADC 电压**：$V_{ADC} = k·V_{BAT}$，8.4 V → 2.084 V。
**第 2 步 · ADC 电压 → 读数**：$code = round(\\frac{2.084}{3.3} × 4095)$ = **2586**。
**第 3 步 · 固件反算**：
$$V_{BAT} = \\frac{code·3.3 / 4095}{k} ≈ code × 3.25 mV$$
每一个读数代表电池上的 3.25 mV。

[[scales|右边两根刻度尺]] 就是这个乘以 k 的映射：电池 0–13.3 V 对应 ADC 0–3.3 V。所以充电器接错成 12 V 时，ADC 只看到 2.98 V，引脚安全。

为什么不选 22 k / 10 k 让满电更接近 3.3 V？真实 ESP32 的 ADC 在 2.45 V 以上开始弯曲（见下一层），把满电放在 2.1 V 左右留了余量。

[[c1|C1 = 100 nF]] 是上一层说的“小水库”。分压器还一直从电池取电：$I = \\frac{8.4 V}{133 kΩ} ≈ 63 µA$，一年约 550 mAh——深度睡眠的设备要用更大的电阻或用 MOSFET 只在测量时接通。`,
          `Lab 5-4: a 2S Li-ion pack, 6.0–8.4 V, is above the ADC's 3.3 V full scale and would damage the pin. Divide it with [[r1|R1 = 100 kΩ]] and [[r2|R2 = 33 kΩ]] and feed [[vsense|VSENSE]] to [[adcpin|GPIO34]]:
$$k = \\frac{R_2}{R_1 + R_2} = \\frac{33}{133} = 0.248$$
**Step 1 · battery → ADC voltage**: $V_{ADC} = k·V_{BAT}$, 8.4 V → 2.084 V.
**Step 2 · ADC voltage → code**: $code = round(\\frac{2.084}{3.3} × 4095)$ = **2586**.
**Step 3 · the firmware goes back**:
$$V_{BAT} = \\frac{code·3.3 / 4095}{k} ≈ code × 3.25 mV$$
Each count stands for 3.25 mV of battery voltage.

[[scales|The two scales on the right]] are this multiply-by-k mapping: battery 0–13.3 V lands on ADC 0–3.3 V. A wrong 12 V charger shows only 2.98 V at the ADC, so the pin is safe.

Why not 22 k / 10 k to bring a full battery closer to 3.3 V? A real ESP32 ADC starts to bend above 2.45 V (next layer); a full battery at about 2.1 V leaves headroom.

[[c1|C1 = 100 nF]] is the reservoir of layer ④. The divider also drains the battery all the time: $I = \\frac{8.4 V}{133 kΩ} ≈ 63 µA$, about 550 mAh a year — a deep-sleep device needs larger resistors or a MOSFET that connects the divider only while measuring.`,
        ),
        table: {
          head: [tr('电池', 'Battery'), '$V_{ADC} = 0.248·V_{BAT}$', tr('12 位读数', '12-bit code'), tr('说明', 'Note')],
          rows: [
            ['8.4 V', '2.084 V', '2586', tr('满电', 'full')],
            ['7.4 V', '1.836 V', '2278', tr('标称', 'nominal')],
            ['6.0 V', '1.489 V', '1847', tr('没电', 'empty')],
            ['12 V', '2.977 V', '3695', tr('接错充电器，仍 < 3.3 V', 'wrong charger, still < 3.3 V')],
          ],
          parts: ['scales', 'scales', 'scales', 'scales'],
        },
        formulas: [
          { tex: 'V_{ADC} = \\frac{R_2}{R_1 + R_2}·V_{BAT}', note: tr('无负载分压（ADC 输入不取电流）', 'unloaded divider (the ADC input takes no current)') },
          { tex: 'R_{src} = R_1 ∥ R_2 = 24.8 kΩ', note: tr('ADC 看进去的源阻抗', 'the source impedance the ADC sees') },
        ],
        calcs: ['adc-divider', 'voltage-divider', 'adc-code'],
      },
      {
        id: 'limits',
        short: tr('局限', 'Limits'),
        title: tr('⑧ 局限：真实 ADC 不是直线，PWM 也不是万能', '⑧ Limits: a real ADC is not a straight line, and PWM is not magic'),
        body: tr(
          `仿真器里的 ADC 是 [[ideal|理想直线]]。真实的 ESP32 ADC（11 dB 衰减档）是 [[real|红色那条]]：
- 低于约 0.1 V 读 0；
- [[good|0.15–2.45 V]] 比较线性，但不同芯片之间偏差可达 ±6 %，要用 ESP-IDF 的校准（eFuse 里的出厂 V_ref）；
- 高于约 2.45 V 开始弯，约 3.1 V 饱和。

所以设计时把有用的电压放在中间，多次采样取平均。STM32 的 ADC 线性好得多，满量程 = VDDA（3.3 V）。

**ADC 的硬性规则**：
- 输入不能超过 3.3 V（会经钳位二极管注入，见“开发板”拆解），STM32 的 FT 脚设成模拟输入后也 **不** 耐 5 V；
- ESP32 只用 ADC1（GPIO32–39）：ADC2 在开 Wi-Fi 时不能用；
- 测量地必须和被测电路共地。

**PWM 的限制**：
- 不能突破引脚的电流上限（每个高电平期间都是满电流）；
- ESP32 的 PWM（LEDC）频率和分辨率互相牵制：$f × 2^{bits} ≤ 80 MHz$，例如 10 位最高约 78 kHz，12 位只到 19.5 kHz；
- 驱动电机、灯带这样的大电流负载要接 MOSFET（见 MOSFET 拆解）。`,
          `The simulator's ADC is [[ideal|an ideal straight line]]. A real ESP32 ADC (11 dB attenuation) is [[real|the red curve]]:
- below about 0.1 V it reads 0;
- [[good|0.15–2.45 V]] is fairly linear, but chips differ by up to ±6 % — use ESP-IDF calibration (the factory V_ref in eFuse);
- above about 2.45 V it bends, saturating near 3.1 V.

So keep the useful voltage in the middle and average several samples. The STM32's ADC is far more linear, with full scale = VDDA (3.3 V).

**Hard rules for the ADC**:
- never above 3.3 V (it injects through the clamp diode — see the dev board teardown); an STM32 FT pin in analog mode is **not** 5 V tolerant;
- on the ESP32 use ADC1 only (GPIO32–39): ADC2 stops working with Wi-Fi on;
- the measured circuit must share ground with the board.

**Limits of PWM**:
- it can't beat the pin's current limit (every high carries the full current);
- on the ESP32 (LEDC) frequency and resolution trade off: $f × 2^{bits} ≤ 80 MHz$ — 10 bits up to about 78 kHz, 12 bits only to 19.5 kHz;
- big loads such as motors and LED strips need a MOSFET (see the MOSFET teardown).`,
        ),
        table: {
          head: ['', tr('仿真', 'Simulator'), 'ESP32', 'STM32F103'],
          rows: [
            [tr('分辨率', 'resolution'), tr('12 位', '12 bits'), tr('12 位', '12 bits'), tr('12 位', '12 bits')],
            [tr('满量程', 'full scale'), '3.3 V', tr('≈ 3.1 V（11 dB）', '≈ 3.1 V (11 dB)'), 'VDDA = 3.3 V'],
            [tr('线性', 'linearity'), tr('理想', 'ideal'), tr('0.15–2.45 V 较好，需校准', 'good 0.15–2.45 V, calibrate'), tr('好', 'good')],
            [tr('ADC 引脚', 'ADC pins'), 'ADC1 / ADC', 'GPIO32–39（ADC1）', 'PA0–PA7, PB0, PB1'],
            [tr('PWM', 'PWM'), tr('任意频率', 'any frequency'), tr('$f × 2^{bits} ≤ 80 MHz$', '$f × 2^{bits} ≤ 80 MHz$'), tr('定时器通道', 'timer channels')],
          ],
          parts: [null, 'real', 'good', null, null],
        },
        calcs: ['adc-code', 'pwm-rc-ripple'],
      },
    ],
    recap: tr(
      'PWM：输出级快速开关，平均值 $V̄ = D·V_H$，RC 低通把它变成直流，纹波 $ΔV ≈ \\frac{V_H·D(1 - D)}{fRC}$。ADC：采样保持 + 比较器 + DAC 做二分查找，$code = round(\\frac{V}{3.3}·4095)$，1 LSB = 0.806 mV；高于 3.3 V 的电压先分压，固件再乘回去。',
      'PWM: the output stage switches fast, the average is $V̄ = D·V_H$, an RC low-pass turns it into DC with a ripple $ΔV ≈ \\frac{V_H·D(1 - D)}{fRC}$. ADC: sample-and-hold, comparator and DAC run a binary search, $code = round(\\frac{V}{3.3}·4095)$, 1 LSB = 0.806 mV; divide anything above 3.3 V first and multiply back in firmware.',
    ),
  };
}
