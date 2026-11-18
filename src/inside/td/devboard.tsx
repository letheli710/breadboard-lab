// Teardown: the dev board and one GPIO pin. Outside (ESP32-DevKitC, pin groups) → X-ray of the
// power path (USB 5 V → Schottky → 5V pin → AMS1117 → 3V3) → inside one pin (push-pull P/N
// transistors, Schmitt input buffer, pull resistors, clamp diodes) → input thresholds → the
// equivalent circuit of each pin mode → source vs sink → the LED resistor with R_out, step by
// step → limits (pin current, 3.3 V vs 5 V, the clamp diodes).

import './mcu.css';
import type { ReactNode } from 'react';
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

/** diode centred on (x, y); `dir` = direction of forward current (anode → cathode) */
function Diode({ x, y, dir, part }: { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right'; part?: string }) {
  const s = 8;
  const tri =
    dir === 'up'
      ? `${x - s},${y + 7} ${x + s},${y + 7} ${x},${y - 7}`
      : dir === 'down'
        ? `${x - s},${y - 7} ${x + s},${y - 7} ${x},${y + 7}`
        : dir === 'right'
          ? `${x - 7},${y - s} ${x - 7},${y + s} ${x + 7},${y}`
          : `${x + 7},${y - s} ${x + 7},${y + s} ${x - 7},${y}`;
  const bar =
    dir === 'up' ? [x - s, y - 7, x + s, y - 7] : dir === 'down' ? [x - s, y + 7, x + s, y + 7] : dir === 'right' ? [x + 7, y - s, x + 7, y + s] : [x - 7, y - s, x - 7, y + s];
  return (
    <g data-part={part}>
      <polygon points={tri} className="mc-box" />
      <line x1={bar[0]} y1={bar[1]} x2={bar[2]} y2={bar[3]} className="mc-w" />
    </g>
  );
}

function Src({ x, y, part }: { x: number; y: number; part?: string }) {
  return (
    <g data-part={part}>
      <circle cx={x} cy={y} r={14} className="mc-box" />
      <text x={x} y={y - 2} textAnchor="middle" className="mc-lbl plus">
        +
      </text>
      <text x={x} y={y + 11} textAnchor="middle" className="mc-lbl minus">
        −
      </text>
    </g>
  );
}

/** a MOSFET symbol: channel at x − 16, leads to x at y ± 14; gate from the left */
function Mos({ x, y, p, part }: { x: number; y: number; p?: boolean; part?: string }) {
  return (
    <g data-part={part}>
      <line x1={x - 16} y1={y - 20} x2={x - 16} y2={y + 20} className="mc-w" />
      <line x1={x - 23} y1={y - 15} x2={x - 23} y2={y + 15} className="mc-w" />
      <path d={`M${x - 16} ${y - 14} H${x} M${x - 16} ${y + 14} H${x}`} className="mc-w" />
      {p && <circle cx={x - 28} cy={y} r={4} className="mc-box" />}
    </g>
  );
}

/* ------------------------------------------------------------------ the board (layers 0–1) */

type Pad = [label: string, cls: string, part: string];
const UPPER: Pad[] = [
  ['GND', 'gnd', 'g-gnd'],
  ['IO23', 'io', 'g-gpio'],
  ['IO22', 'io', 'g-gpio'],
  ['TX', 'uart', 'g-uart'],
  ['RX', 'uart', 'g-uart'],
  ['IO21', 'io', 'g-gpio'],
  ['GND', 'gnd', 'g-gnd'],
  ['IO19', 'io', 'g-gpio'],
  ['IO18', 'io', 'g-gpio'],
  ['IO5', 'strap', 'g-strap'],
  ['IO17', 'io', 'g-gpio'],
  ['IO16', 'io', 'g-gpio'],
  ['IO4', 'io', 'g-gpio'],
  ['IO0', 'strap', 'g-strap'],
  ['IO2', 'strap', 'g-strap'],
  ['IO15', 'strap', 'g-strap'],
  ['SD1', 'flash', 'g-flash'],
  ['SD0', 'flash', 'g-flash'],
  ['CLK', 'flash', 'g-flash'],
];
const LOWER: Pad[] = [
  ['3V3', 'pw', 'g-3v3'],
  ['EN', 'en', 'g-en'],
  ['VP', 'inonly', 'g-inonly g-adc1'],
  ['VN', 'inonly', 'g-inonly g-adc1'],
  ['IO34', 'inonly', 'g-inonly g-adc1'],
  ['IO35', 'inonly', 'g-inonly g-adc1'],
  ['IO32', 'adc', 'g-gpio g-adc1'],
  ['IO33', 'adc', 'g-gpio g-adc1'],
  ['IO25', 'io', 'g-gpio'],
  ['IO26', 'io', 'g-gpio'],
  ['IO27', 'io', 'g-gpio'],
  ['IO14', 'io', 'g-gpio'],
  ['IO12', 'strap', 'g-strap'],
  ['GND', 'gnd', 'g-gnd'],
  ['IO13', 'io', 'g-gpio'],
  ['SD2', 'flash', 'g-flash'],
  ['SD3', 'flash', 'g-flash'],
  ['CMD', 'flash', 'g-flash'],
  ['5V', 'v5', 'g-5v'],
];
const PX = (i: number) => 84 + i * 22;
const TOP_Y = 158;
const BOT_Y = 312;

function Board({ layer }: { layer: number }) {
  const xray = layer >= 1;
  return (
    <g className={vis(layer, 0, 1)}>
      <g style={{ opacity: xray ? 0.28 : 1, transition: 'opacity .45s' }}>
        <rect x={60} y={146} width={460} height={178} rx={8} className="mc-pcb" data-part="pcb" />
        {/* the module: antenna + shield can */}
        <g data-part="module chip">
          <rect x={24} y={174} width={192} height={120} rx={4} className="mc-modpcb" />
          <path d="M32 186 h30 v14 h-24 v14 h24 v14 h-24 v14 h24 v14 h-24 v14 h24" className="mc-w" style={{ stroke: '#d9b44a', strokeWidth: 2.5 }} />
          <rect x={78} y={180} width={132} height={108} rx={3} className="mc-can" />
          <text x={144} y={226} textAnchor="middle" className="mc-silk dark">
            ESP32-WROOM-32
          </text>
          <text x={144} y={242} textAnchor="middle" className="mc-silk dark">
            {tr('（芯片 + 闪存 flash）', '(chip + flash)')}
          </text>
        </g>
        {/* buttons */}
        <g data-part="buttons">
          <rect x={232} y={180} width={22} height={22} rx={3} className="mc-can" />
          <circle cx={243} cy={191} r={6} className="mc-ic" />
          <text x={243} y={214} textAnchor="middle" className="mc-silk">
            EN
          </text>
          <rect x={232} y={262} width={22} height={22} rx={3} className="mc-can" />
          <circle cx={243} cy={273} r={6} className="mc-ic" />
          <text x={243} y={257} textAnchor="middle" className="mc-silk">
            BOOT
          </text>
        </g>
        <text x={380} y={192} textAnchor="middle" className="mc-silk" style={{ fontSize: 12 }}>
          ESP32-DevKitC V4
        </text>
        {/* regulator, diode, USB bridge, power LED */}
        <g data-part="ldo">
          <rect x={306} y={204} width={34} height={10} className="mc-tab" />
          <rect x={300} y={214} width={46} height={32} rx={2} className="mc-ic" />
          <text x={323} y={262} textAnchor="middle" className="mc-silk">
            AMS1117-3.3
          </text>
        </g>
        <g data-part="schottky">
          <rect x={410} y={221} width={22} height={14} rx={2} className="mc-ic" />
          <rect x={412} y={221} width={4} height={14} className="mc-tab" />
          <text x={421} y={215} textAnchor="middle" className="mc-silk">
            D1
          </text>
        </g>
        <rect x={400} y={252} width={40} height={36} rx={2} className="mc-ic" />
        <text x={420} y={274} textAnchor="middle" className="mc-silk" style={{ fontSize: 8 }}>
          CP2102
        </text>
        <rect x={272} y={270} width={10} height={8} rx={1} fill="#e63946" />
        <text x={288} y={278} className="mc-silk">
          PWR
        </text>
        <g data-part="usb">
          <rect x={492} y={210} width={54} height={36} rx={3} className="mc-can" />
          <rect x={500} y={221} width={40} height={14} rx={2} className="mc-ic" />
        </g>
        <text x={470} y={262} textAnchor="middle" className="mc-silk">
          USB
        </text>
      </g>
      {/* header pads + their names */}
      {[UPPER, LOWER].map((row, r) =>
        row.map(([label, cls, part], i) => {
          const x = PX(i);
          const y = r === 0 ? TOP_Y : BOT_Y;
          return (
            <g key={`${r}-${i}`} data-part={part}>
              <rect x={x - 7} y={y - 7} width={14} height={14} rx={2} className={`mc-pad ${cls}`} />
              <circle cx={x} cy={y} r={2.6} fill="#0f1013" />
              <text
                x={x + 4}
                y={r === 0 ? y - 12 : y + 12}
                textAnchor={r === 0 ? 'start' : 'end'}
                transform={`rotate(-90 ${x + 4} ${r === 0 ? y - 12 : y + 12})`}
                className="mc-pinlbl"
              >
                {label}
              </text>
            </g>
          );
        }),
      )}
      {/* legend (outside view only) */}
      <g className={vis(layer, 0, 0)}>
        {(
          [
            ['pw', 'g-3v3', tr('3V3 电源', '3V3 power')],
            ['v5', 'g-5v', tr('5V（USB）', '5V (USB)')],
            ['gnd', 'g-gnd', 'GND'],
            ['en', 'g-en', tr('EN 复位', 'EN reset')],
            ['io', 'g-gpio', tr('普通 GPIO', 'plain GPIO')],
            ['adc', 'g-adc1', tr('ADC1 + 输出', 'ADC1 + output')],
            ['inonly', 'g-inonly', tr('只能输入', 'input only')],
            ['strap', 'g-strap', tr('启动脚', 'strapping')],
            ['uart', 'g-uart', tr('串口 UART', 'UART')],
            ['flash', 'g-flash', tr('闪存，别用', 'flash: no')],
          ] as const
        ).map(([cls, part, name], k) => (
          <g key={part} data-part={part} transform={`translate(${24 + (k % 5) * 106} ${k < 5 ? 392 : 418})`}>
            <rect x={0} y={-10} width={12} height={12} rx={2} className={`mc-pad ${cls}`} />
            <text x={17} y={0} className="td-small">
              {name}
            </text>
          </g>
        ))}
      </g>
      {/* X-ray: the power path */}
      <g className={vis(layer, 1, 1)}>
        <path d="M492 228 H429" className="mc-w plus bold" data-part="vbus" />
        <Diode x={421} y={228} dir="left" part="schottky" />
        <path d="M413 228 H372 M372 228 H346" className="mc-w plus bold" data-part="v5" />
        <path d="M372 228 V300 H480 V306" className="mc-w plus bold" data-part="v5" />
        <Dot x={372} y={228} />
        <rect x={300} y={212} width={46} height={34} rx={3} className="mc-box" data-part="ldo" />
        <text x={323} y={233} textAnchor="middle" className="mc-lbl" data-part="ldo">
          LDO
        </text>
        <path d="M300 228 H216 M230 228 V300 H84 V306" className="mc-w plus bold" data-part="v3v3" />
        <Dot x={230} y={228} />
        <rect x={104} y={204} width={74} height={50} rx={4} className="mc-box" data-part="chip" />
        <text x={141} y={226} textAnchor="middle" className="mc-lbl" data-part="chip">
          ESP32
        </text>
        <text x={141} y={243} textAnchor="middle" className="td-small" data-part="chip">
          ≈ 50 mA
        </text>
        <text x={470} y={220} textAnchor="middle" className="mc-lbl plus" data-part="vbus">
          5.0 V
        </text>
        <text x={376} y={218} className="mc-lbl plus" data-part="v5">
          4.7 V
        </text>
        <text x={280} y={220} textAnchor="middle" className="mc-lbl plus" data-part="v3v3">
          3.3 V
        </text>
        <text x={430} y={296} textAnchor="middle" className="td-small" data-part="v5">
          {tr('5V 脚', '5V pin')}
        </text>
        <text x={160} y={296} textAnchor="middle" className="td-small" data-part="v3v3">
          {tr('3V3 脚', '3V3 pin')}
        </text>
        <text x={280} y={60} textAnchor="middle" className="mc-big">
          {tr('USB 5 V → 二极管 → 5V → LDO → 3V3', 'USB 5 V → diode → 5V → LDO → 3V3')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ inside one pin (layer 2) */

const RT = 70; // 3V3 rail
const RB = 400; // GND rail
const NY = 235; // the pin node

function PinInside({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 2, 2)}>
      <path d={`M280 ${RT} H470`} className="mc-w plus bold" data-part="rail3v3" />
      <text x={276} y={RT + 4} textAnchor="end" className="mc-lbl plus" data-part="rail3v3">
        3V3 (VDD)
      </text>
      <path d={`M280 ${RB} H470`} className="mc-w minus bold" data-part="railgnd" />
      <text x={276} y={RB + 4} textAnchor="end" className="mc-lbl minus" data-part="railgnd">
        GND
      </text>
      {/* output control → the two gates */}
      <g data-part="drv">
        <rect x={30} y={90} width={130} height={50} rx={6} className="mc-box" />
        <text x={95} y={111} textAnchor="middle" className="mc-lbl">
          {tr('输出控制', 'output control')}
        </text>
        <text x={95} y={128} textAnchor="middle" className="td-small">
          {tr('（输出寄存器）', '(output register)')}
        </text>
      </g>
      <path d="M160 116 H230 V150 H268" className="mc-w" data-part="drv pmos" />
      <path d="M130 140 V225 a10 10 0 0 1 0 20 V320 H277" className="mc-w" data-part="drv nmos" />
      {/* push-pull stage */}
      <g data-part="pmos">
        <Mos x={300} y={150} p />
        <path d={`M300 136 V${RT} M300 164 V${NY}`} className="mc-w" />
        <text x={310} y={146} className="mc-lbl">
          P-MOS
        </text>
        <text x={310} y={162} className="mc-tiny">
          {tr('导通 ≈ 25 Ω', 'on ≈ 25 Ω')}
        </text>
      </g>
      <g data-part="nmos">
        <Mos x={300} y={320} />
        <path d={`M300 306 V${NY} M300 334 V${RB}`} className="mc-w" />
        <text x={310} y={316} className="mc-lbl">
          N-MOS
        </text>
        <text x={310} y={332} className="mc-tiny">
          {tr('导通 ≈ 25 Ω', 'on ≈ 25 Ω')}
        </text>
      </g>
      {/* the node and the input buffer */}
      <path d={`M220 ${NY} H480`} className="mc-w" data-part="node" />
      <Dot x={300} y={NY} />
      <g data-part="schmitt">
        <polygon points={`220,${NY - 20} 220,${NY + 20} 182,${NY}`} className="mc-box" />
        <path d={`M198 ${NY + 5} h7 v-10 h7 M201 ${NY + 5} h7 v-10`} className="mc-w thin" />
        <path d={`M182 ${NY} H100`} className="mc-w" />
        <rect x={22} y={NY - 18} width={78} height={36} rx={5} className="mc-box" />
        <text x={61} y={NY - 1} textAnchor="middle" className="mc-lbl">
          IN
        </text>
        <text x={61} y={NY + 13} textAnchor="middle" className="mc-tiny">
          {tr('输入寄存器', 'input register')}
        </text>
        <text x={202} y={NY + 36} textAnchor="middle" className="mc-tiny">
          Schmitt
        </text>
      </g>
      {/* pull-up / pull-down */}
      <g data-part="rpu">
        <path d={`M390 ${RT} V82 M390 104 V112`} className="mc-w" />
        <circle cx={390} cy={82} r={2.5} className="mc-solid" />
        <circle cx={390} cy={104} r={2.5} className="mc-solid" />
        <line x1={390} y1={104} x2={381} y2={85} className="mc-w" />
        <Res x1={390} y1={112} x2={390} y2={172} />
        <path d={`M390 172 V${NY}`} className="mc-w" />
        <text x={400} y={140} className="mc-lbl">
          {sub('R_PU')}
        </text>
        <text x={400} y={155} className="mc-tiny">
          45 kΩ
        </text>
      </g>
      <g data-part="rpd">
        <path d={`M390 ${NY} V290 M390 350 V362 M390 384 V${RB}`} className="mc-w" />
        <Res x1={390} y1={290} x2={390} y2={350} />
        <circle cx={390} cy={362} r={2.5} className="mc-solid" />
        <circle cx={390} cy={384} r={2.5} className="mc-solid" />
        <line x1={390} y1={384} x2={381} y2={365} className="mc-w" />
        <text x={400} y={318} className="mc-lbl">
          {sub('R_PD')}
        </text>
        <text x={400} y={333} className="mc-tiny">
          45 kΩ
        </text>
      </g>
      <Dot x={390} y={NY} />
      {/* clamp diodes */}
      <g data-part="clamp">
        <path d={`M450 ${NY} V147 M450 133 V${RT}`} className="mc-w" />
        <Diode x={450} y={140} dir="up" />
        <path d={`M450 ${RB} V337 M450 323 V${NY}`} className="mc-w" />
        <Diode x={450} y={330} dir="up" />
        <text x={462} y={114} className="mc-tiny">
          {tr('钳位', 'clamp')}
        </text>
        <text x={462} y={358} className="mc-tiny">
          {tr('钳位', 'clamp')}
        </text>
      </g>
      <Dot x={450} y={NY} />
      {/* pad and pin */}
      <g data-part="pad">
        <rect x={480} y={NY - 14} width={28} height={28} rx={2} className="mc-gold" />
        <path d={`M508 ${NY} H544`} className="mc-w" />
        <circle cx={546} cy={NY} r={4} className="mc-box" />
        <text x={526} y={NY - 22} textAnchor="middle" className="mc-lbl">
          {tr('引脚', 'pin')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ input thresholds (layer 3) */

function Thresholds({ layer }: { layer: number }) {
  const y = (v: number) => 390 - (v / 3.3) * 300;
  const gx = (v: number) => 330 + (v / 3.3) * 180;
  const gy = (o: number) => 360 - (o / 3.3) * 190;
  const up = 1.75;
  const dn = 1.35;
  return (
    <g className={vis(layer, 3, 3)}>
      <rect x={14} y={40} width={532} height={390} rx={14} className="td-panel" />
      <text x={150} y={70} textAnchor="middle" className="td-panel-title">
        {tr('输入电压怎么读成 0 / 1（ESP32）', 'How a voltage reads as 0 / 1 (ESP32)')}
      </text>
      <rect x={64} y={y(3.3)} width={36} height={y(2.475) - y(3.3)} className="mc-zone-hi" data-part="vih" />
      <rect x={64} y={y(2.475)} width={36} height={y(0.825) - y(2.475)} className="mc-zone-x" data-part="undef" />
      <rect x={64} y={y(0.825)} width={36} height={y(0) - y(0.825)} className="mc-zone-lo" data-part="vil" />
      <rect x={64} y={y(3.3)} width={36} height={300} className="mc-w thin" />
      {(
        [
          [3.3, '3.3 V'],
          [2.475, '2.475'],
          [0.825, '0.825'],
          [0, '0 V'],
        ] as const
      ).map(([v, t]) => (
        <text key={t} x={58} y={y(v) + 4} textAnchor="end" className="mc-tiny">
          {t}
        </text>
      ))}
      <g data-part="vih">
        <text x={108} y={y(2.9)} className="mc-lbl plus">
          HIGH = 1
        </text>
        <text x={108} y={y(2.9) + 16} className="mc-tiny">
          {sub('≥ V_IH = 0.75·VDD')}
        </text>
      </g>
      <g data-part="undef">
        <text x={108} y={y(1.75)} className="mc-lbl">
          {tr('不确定', 'undefined')}
        </text>
        <text x={108} y={y(1.75) + 16} className="mc-tiny">
          {tr('可能读 0 也可能读 1', 'may read 0 or 1')}
        </text>
      </g>
      <g data-part="vil">
        <text x={108} y={y(0.5)} className="mc-lbl minus">
          LOW = 0
        </text>
        <text x={108} y={y(0.5) + 16} className="mc-tiny">
          {sub('≤ V_IL = 0.25·VDD')}
        </text>
      </g>
      {/* the Schmitt trigger's transfer curve */}
      <g data-part="hyst">
        <rect x={gx(dn)} y={gy(3.3)} width={gx(up) - gx(dn)} height={gy(0) - gy(3.3)} className="mc-zone-x" />
        <path d={`M${gx(0)} ${gy(0) - 2} H${gx(up)} V${gy(3.3) - 2} H${gx(3.3)}`} className="mc-curve r" />
        <path d={`M${gx(3.3)} ${gy(3.3) + 2} H${gx(dn)} V${gy(0) + 2} H${gx(0)}`} className="mc-curve b" />
        <path d={`M${gx(up)} ${gy(1.2)} V${gy(2.1)}`} className="mc-w plus" markerEnd="url(#dv-ah)" />
        <path d={`M${gx(dn)} ${gy(2.1)} V${gy(1.2)}`} className="mc-w minus" markerEnd="url(#dv-ah)" />
        <text x={gx(up) + 4} y={gy(0) + 30} className="mc-lbl plus">
          {sub('V_T+')}
        </text>
        <text x={gx(dn) - 4} y={gy(0) + 30} textAnchor="end" className="mc-lbl minus">
          {sub('V_T−')}
        </text>
      </g>
      <path d={`M${gx(0)} ${gy(0)} H${gx(3.3) + 12} M${gx(0)} ${gy(0)} V${gy(3.3) - 24}`} className="mc-axis" />
      <text x={gx(3.3) + 10} y={gy(0) + 16} textAnchor="end" className="td-small">
        {tr('引脚电压 →', 'pin voltage →')}
      </text>
      <text x={gx(0) + 6} y={gy(3.3) - 12} className="td-small">
        {tr('读到的值', 'reading')}
      </text>
      <text x={gx(0) - 6} y={gy(3.3) + 4} textAnchor="end" className="mc-tiny">
        1
      </text>
      <text x={gx(0) - 6} y={gy(0) + 4} textAnchor="end" className="mc-tiny">
        0
      </text>
      <text x={430} y={110} textAnchor="middle" className="mc-lbl acc">
        {tr('施密特触发器：两个阈值', 'Schmitt trigger: two thresholds')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ modes (layer 4) */

function ModePanel({ x, y, part, title, note, children }: { x: number; y: number; part: string; title: string; note: string; children: ReactNode }) {
  return (
    <g data-part={part}>
      <rect x={x} y={y} width={172} height={180} rx={10} className="mc-box soft" />
      <text x={x + 86} y={y + 21} textAnchor="middle" className="mc-lbl">
        {title}
      </text>
      {children}
      <text x={x + 86} y={y + 168} textAnchor="middle" className="mc-tiny">
        {note}
      </text>
    </g>
  );
}

const Pin = ({ x, y }: { x: number; y: number }) => (
  <g>
    <circle cx={x} cy={y} r={4} className="mc-box" />
    <text x={x} y={y - 9} textAnchor="middle" className="mc-tiny">
      {tr('引脚', 'pin')}
    </text>
  </g>
);

function Modes({ layer }: { layer: number }) {
  const c = [14, 194, 374];
  const r = [42, 240];
  return (
    <g className={vis(layer, 4, 4)}>
      {/* OUT HIGH */}
      <ModePanel x={c[0]} y={r[0]} part="m-hi" title={tr('输出高 OUT HIGH', 'OUT HIGH')} note={tr('V = 3.3 V − 25 Ω·I（流出）', 'V = 3.3 V − 25 Ω·I (out)')}>
        <Src x={c[0] + 36} y={r[0] + 98} />
        <path d={`M${c[0] + 36} ${r[0] + 84} V${r[0] + 60} H${c[0] + 64} M${c[0] + 120} ${r[0] + 60} H${c[0] + 148}`} className="mc-w" />
        <Res x1={c[0] + 64} y1={r[0] + 60} x2={c[0] + 120} y2={r[0] + 60} />
        <path d={`M${c[0] + 36} ${r[0] + 112} V${r[0] + 130}`} className="mc-w" />
        <Gnd x={c[0] + 36} y={r[0] + 130} />
        <Pin x={c[0] + 152} y={r[0] + 60} />
        <text x={c[0] + 56} y={r[0] + 104} className="mc-tiny">
          3.3 V
        </text>
        <text x={c[0] + 92} y={r[0] + 84} textAnchor="middle" className="mc-tiny">
          {sub('R_out 25 Ω')}
        </text>
      </ModePanel>
      {/* OUT LOW */}
      <ModePanel x={c[1]} y={r[0]} part="m-lo" title={tr('输出低 OUT LOW', 'OUT LOW')} note={tr('V = 25 Ω·I（流入）', 'V = 25 Ω·I (in)')}>
        <path d={`M${c[1] + 148} ${r[0] + 60} H${c[1] + 120} M${c[1] + 64} ${r[0] + 60} H${c[1] + 36} V${r[0] + 130}`} className="mc-w" />
        <Res x1={c[1] + 64} y1={r[0] + 60} x2={c[1] + 120} y2={r[0] + 60} />
        <Gnd x={c[1] + 36} y={r[0] + 130} />
        <Pin x={c[1] + 152} y={r[0] + 60} />
        <text x={c[1] + 92} y={r[0] + 84} textAnchor="middle" className="mc-tiny">
          {sub('R_out 25 Ω')}
        </text>
      </ModePanel>
      {/* INPUT */}
      <ModePanel x={c[2]} y={r[0]} part="m-in" title={tr('输入 INPUT', 'INPUT')} note={tr('I ≈ 0：没人驱动就“悬空”', 'I ≈ 0: floats if nothing drives it')}>
        <path d={`M${c[2] + 148} ${r[0] + 70} H${c[2] + 70} V${r[0] + 94} M${c[2] + 70} ${r[0] + 101} V${r[0] + 130}`} className="mc-w" />
        <path d={`M${c[2] + 58} ${r[0] + 94} H${c[2] + 82} M${c[2] + 58} ${r[0] + 101} H${c[2] + 82}`} className="mc-w" />
        <Gnd x={c[2] + 70} y={r[0] + 130} />
        <Pin x={c[2] + 152} y={r[0] + 70} />
        <text x={c[2] + 88} y={r[0] + 102} className="mc-tiny">
          {tr('几 pF', 'a few pF')}
        </text>
        <text x={c[2] + 110} y={r[0] + 124} textAnchor="middle" className="mc-tiny">
          {tr('漏电 < 1 µA', 'leak < 1 µA')}
        </text>
      </ModePanel>
      {/* PULL-UP */}
      <ModePanel
        x={c[0]}
        y={r[1]}
        part="m-pu"
        title={tr('输入 + 上拉', 'INPUT + PULL-UP')}
        note={tr('按下接 GND：I = 3.3 V / 45 kΩ = 73 µA', 'pressed to GND: I = 3.3/45k = 73 µA')}
      >
        <path d={`M${c[0] + 28} ${r[1] + 44} H${c[0] + 52} M${c[0] + 40} ${r[1] + 44} V${r[1] + 54}`} className="mc-w plus" />
        <text x={c[0] + 60} y={r[1] + 48} className="mc-lbl plus">
          3V3
        </text>
        <Res x1={c[0] + 40} y1={r[1] + 54} x2={c[0] + 40} y2={r[1] + 112} />
        <path d={`M${c[0] + 40} ${r[1] + 112} V${r[1] + 120} H${c[0] + 148}`} className="mc-w" />
        <Pin x={c[0] + 152} y={r[1] + 120} />
        <text x={c[0] + 54} y={r[1] + 82} className="mc-tiny">
          {sub('R_PU')}
        </text>
        <text x={c[0] + 54} y={r[1] + 96} className="mc-tiny">
          45 kΩ
        </text>
      </ModePanel>
      {/* OPEN-DRAIN */}
      <ModePanel x={c[1]} y={r[1]} part="m-od" title={tr('开漏 open-drain', 'OPEN-DRAIN')} note={tr('只会拉低；高电平靠外部上拉', 'pulls low only; HIGH needs a pull-up')}>
        <path d={`M${c[1] + 148} ${r[1] + 70} H${c[1] + 60} V${r[1] + 84} M${c[1] + 60} ${r[1] + 108} V${r[1] + 130}`} className="mc-w" />
        <circle cx={c[1] + 60} cy={r[1] + 84} r={2.5} className="mc-solid" />
        <circle cx={c[1] + 60} cy={r[1] + 108} r={2.5} className="mc-solid" />
        <line x1={c[1] + 60} y1={r[1] + 108} x2={c[1] + 51} y2={r[1] + 88} className="mc-w" />
        <Gnd x={c[1] + 60} y={r[1] + 130} />
        <Pin x={c[1] + 152} y={r[1] + 70} />
        <text x={c[1] + 72} y={r[1] + 100} className="mc-tiny">
          {tr('只有 N-MOS', 'N-MOS only')}
        </text>
      </ModePanel>
      {/* PWM */}
      <ModePanel x={c[2]} y={r[1]} part="m-pwm" title="PWM" note={tr('高低来回切换：平均 = D·3.3 V', 'toggles: average = D·3.3 V')}>
        <Src x={c[2] + 30} y={r[1] + 92} />
        <path
          d={`M${c[2] + 30} ${r[1] + 78} V${r[1] + 50} H${c[2] + 60} M${c[2] + 60} ${r[1] + 74} H${c[2] + 50} V${r[1] + 126} M${c[2] + 30} ${r[1] + 106} V${r[1] + 126} H${c[2] + 50}`}
          className="mc-w"
        />
        <circle cx={c[2] + 60} cy={r[1] + 50} r={2.5} className="mc-solid" />
        <circle cx={c[2] + 60} cy={r[1] + 74} r={2.5} className="mc-solid" />
        <circle cx={c[2] + 86} cy={r[1] + 62} r={2.5} className="mc-solid" />
        <line x1={c[2] + 86} y1={r[1] + 62} x2={c[2] + 62} y2={r[1] + 52} className="mc-w" />
        <Gnd x={c[2] + 40} y={r[1] + 126} />
        <path d={`M${c[2] + 86} ${r[1] + 62} H${c[2] + 94} M${c[2] + 140} ${r[1] + 62} H${c[2] + 148}`} className="mc-w" />
        <Res x1={c[2] + 94} y1={r[1] + 62} x2={c[2] + 140} y2={r[1] + 62} />
        <Pin x={c[2] + 152} y={r[1] + 62} />
        <path d={`M${c[2] + 76} ${r[1] + 140} h8 v-24 h14 v24 h24 v-24 h14 v24 h12`} className="mc-w acc thin" />
      </ModePanel>
    </g>
  );
}

/* ------------------------------------------------------------------ source vs sink (layer 5) */

function SourceSink({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 5, 5)}>
      {/* SOURCE */}
      <g data-part="source">
        <text x={144} y={70} textAnchor="middle" className="mc-big">
          {tr('拉电流 source', 'SOURCE')}
        </text>
        <rect x={28} y={96} width={112} height={266} rx={8} className="mc-chipbox" />
        <text x={84} y={116} textAnchor="middle" className="mc-tiny">
          {tr('芯片：OUT = HIGH', 'chip: OUT = HIGH')}
        </text>
        <Src x={64} y={250} />
        <path d="M64 236 V180 H82 M132 180 H210 M210 250 V273 M210 287 V330 H64 V264" className="mc-w" />
        <Res x1={82} y1={180} x2={132} y2={180} />
        <Res x1={210} y1={180} x2={210} y2={250} />
        <Diode x={210} y={280} dir="down" />
        <Gnd x={137} y={330} />
        <Dot x={140} y={180} />
        <text x={84} y={254} className="mc-tiny">
          3.3 V
        </text>
        <text x={107} y={166} textAnchor="middle" className="mc-tiny">
          {sub('R_out 40 Ω')}
        </text>
        <text x={222} y={212} className="mc-tiny">
          R1 220 Ω
        </text>
        <text x={224} y={284} className="mc-tiny">
          LED1
        </text>
        <text x={146} y={200} className="mc-lbl acc">
          3.08 V
        </text>
        <path d="M150 166 H196" className="mc-w cur" markerEnd="url(#dv-ahc)" />
        <text x={174} y={158} textAnchor="middle" className="mc-lbl cur">
          5.5 mA →
        </text>
        <text x={144} y={392} textAnchor="middle" className="td-small">
          {tr('HIGH 时亮；电流从引脚流出', 'lit when HIGH; current flows out')}
        </text>
      </g>
      {/* SINK */}
      <g data-part="sink">
        <text x={416} y={70} textAnchor="middle" className="mc-big">
          {tr('灌电流 sink', 'SINK')}
        </text>
        <path d="M468 100 H492 M480 100 V110" className="mc-w plus" />
        <text x={480} y={92} textAnchor="middle" className="mc-lbl plus">
          3V3
        </text>
        <Res x1={480} y1={110} x2={480} y2={180} />
        <Diode x={480} y={210} dir="down" />
        <path d="M480 180 V203 M480 217 V260 H418 M368 260 H350 V330" className="mc-w" />
        <rect x={300} y={160} width={118} height={202} rx={8} className="mc-chipbox" />
        <text x={359} y={180} textAnchor="middle" className="mc-tiny">
          {tr('芯片：OUT = LOW', 'chip: OUT = LOW')}
        </text>
        <Res x1={418} y1={260} x2={368} y2={260} />
        <Gnd x={350} y={330} />
        <Dot x={418} y={260} />
        <text x={393} y={246} textAnchor="middle" className="mc-tiny">
          {sub('R_out 40 Ω')}
        </text>
        <text x={492} y={150} className="mc-tiny">
          R2 220 Ω
        </text>
        <text x={494} y={214} className="mc-tiny">
          LED2
        </text>
        <text x={426} y={284} className="mc-lbl acc">
          0.22 V
        </text>
        <path d="M470 246 H430" className="mc-w cur" markerEnd="url(#dv-ahc)" />
        <text x={450} y={238} textAnchor="middle" className="mc-lbl cur">
          ← 5.5 mA
        </text>
        <text x={416} y={392} textAnchor="middle" className="td-small">
          {tr('LOW 时亮；电流流进引脚', 'lit when LOW; current flows in')}
        </text>
      </g>
      <line x1={280} y1={50} x2={280} y2={410} className="mc-dash" />
    </g>
  );
}

/* ------------------------------------------------------------------ the LED resistor (layer 6) */

function LedCalc({ layer }: { layer: number }) {
  const bx = (v: number) => 60 + v * 133.3;
  const segs: [number, number, string, string, string][] = [
    [0, 0.238, '#7a3fc0', 'b-rout', '0.24'],
    [0.238, 1.379, '#d9b44a', 'b-r', '1.14 V'],
    [1.379, 1.494, '#9aa0aa', 'b-rled', '0.11'],
    [1.494, 3.294, '#e63946', 'b-vf', '1.80 V'],
  ];
  return (
    <g className={vis(layer, 6, 6)}>
      <rect x={34} y={58} width={160} height={176} rx={8} className="mc-chipbox" data-part="b-rout" />
      <text x={84} y={214} className="mc-tiny">
        {tr('ESP32 引脚（OUT HIGH）', 'ESP32 pin (OUT HIGH)')}
      </text>
      <rect x={430} y={100} width={104} height={118} rx={8} className="mc-chipbox" data-part="b-vf b-rled" />
      <text x={478} y={232} className="mc-tiny">
        {tr('红色 LED 模型', 'red LED model')}
      </text>
      <Src x={70} y={160} />
      <path d="M70 146 V90 H100 M170 90 H250 M330 90 H470 V110 M470 160 V179 M470 193 V250 H70 V174" className="mc-w" />
      <Res x1={100} y1={90} x2={170} y2={90} part="b-rout" />
      <Res x1={250} y1={90} x2={330} y2={90} part="b-r" />
      <Res x1={470} y1={110} x2={470} y2={160} part="b-rled" />
      <Diode x={470} y={186} dir="down" part="b-vf" />
      <Dot x={215} y={90} />
      <text x={222} y={78} className="mc-tiny">
        {tr('引脚', 'pin')} 3.06 V
      </text>
      <text x={90} y={165} className="mc-lbl">
        3.3 V
      </text>
      <text x={135} y={74} textAnchor="middle" className="mc-tiny" data-part="b-rout">
        {sub('R_out = 25 Ω')}
      </text>
      <text x={135} y={116} textAnchor="middle" className="mc-lbl acc" data-part="b-rout">
        0.24 V
      </text>
      <text x={290} y={74} textAnchor="middle" className="mc-tiny" data-part="b-r">
        R = 120 Ω
      </text>
      <text x={290} y={116} textAnchor="middle" className="mc-lbl acc" data-part="b-r">
        1.14 V
      </text>
      <text x={484} y={132} className="mc-tiny" data-part="b-rled">
        12 Ω
      </text>
      <text x={484} y={146} className="mc-lbl acc" data-part="b-rled">
        0.11 V
      </text>
      <text x={484} y={184} className="mc-tiny" data-part="b-vf">
        {sub('V_f')}
      </text>
      <text x={484} y={198} className="mc-lbl acc" data-part="b-vf">
        1.80 V
      </text>
      <path d="M350 78 H404" className="mc-w cur" markerEnd="url(#dv-ahc)" />
      <text x={377} y={70} textAnchor="middle" className="mc-lbl cur">
        I = 9.5 mA
      </text>
      {/* the voltage budget */}
      <text x={280} y={290} textAnchor="middle" className="mc-lbl">
        {tr('3.3 V 被这样分掉（KVL）', 'Where the 3.3 V goes (KVL)')}
      </text>
      {segs.map(([a, b, col, part, t]) => (
        <g key={part} data-part={part}>
          <rect x={bx(a)} y={306} width={bx(b) - bx(a)} height={26} fill={col} stroke="#1f2a44" strokeWidth={1} />
          <text x={(bx(a) + bx(b)) / 2} y={350} textAnchor="middle" className="mc-tiny">
            {t}
          </text>
        </g>
      ))}
      <text x={bx(0.119)} y={300} textAnchor="middle" className="mc-tiny" data-part="b-rout">
        {sub('R_out')}
      </text>
      <text x={bx(0.81)} y={300} textAnchor="middle" className="mc-tiny" data-part="b-r">
        R
      </text>
      <text x={bx(1.44)} y={300} textAnchor="middle" className="mc-tiny" data-part="b-rled">
        12 Ω
      </text>
      <text x={bx(2.39)} y={300} textAnchor="middle" className="mc-tiny" data-part="b-vf">
        {sub('V_f')}
      </text>
      <text x={280} y={396} textAnchor="middle" className="td-small">
        {sub('I = (3.3 − 1.8) / (25 + 120 + 12) = 1.5 / 157 = 9.5 mA')}
      </text>
      <text x={280} y={420} textAnchor="middle" className="mc-lbl plus" data-part="nores">
        {tr('不加 R：I = 1.5 / 37 Ω = 40 mA，引脚掉到 2.29 V', 'no R: I = 1.5 / 37 Ω = 40 mA, pin sags to 2.29 V')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ limits (layer 7) */

function Limits({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 7, 7)}>
      <g data-part="ext5v">
        <Src x={66} y={236} />
        <path d="M66 222 V150 H110 M170 150 H270 M66 250 V330 H120" className="mc-w" />
        <Res x1={110} y1={150} x2={170} y2={150} />
        <Gnd x={120} y={330} />
        <text x={86} y={242} className="mc-lbl">
          5 V
        </text>
        <text x={140} y={136} textAnchor="middle" className="mc-tiny">
          {sub('R_s = 1 kΩ')}
        </text>
        <text x={66} y={196} textAnchor="middle" className="mc-tiny">
          {tr('5 V 模块', '5 V module')}
        </text>
      </g>
      <rect x={270} y={137} width={22} height={26} rx={2} className="mc-gold" data-part="pad" />
      <rect x={292} y={70} width={250} height={300} rx={10} className="mc-chipbox" />
      <text x={417} y={362} textAnchor="middle" className="mc-tiny">
        {tr('ESP32（非 5 V 容忍引脚）', 'ESP32 (not 5 V tolerant)')}
      </text>
      <path d="M292 150 H360" className="mc-w" />
      <Dot x={360} y={150} />
      <g data-part="clamp">
        <path d="M360 150 V119 M360 105 V96" className="mc-w" />
        <Diode x={360} y={112} dir="up" />
        <path d="M360 150 V243 M360 257 V320" className="mc-w" />
        <Diode x={360} y={250} dir="up" />
        <text x={346} y={110} textAnchor="end" className="mc-tiny">
          {tr('上钳位', 'upper clamp')}
        </text>
        <text x={346} y={254} textAnchor="end" className="mc-tiny">
          {tr('下钳位', 'lower clamp')}
        </text>
      </g>
      <path d="M320 96 H530" className="mc-w plus bold" data-part="rail3v3" />
      <text x={530} y={88} textAnchor="end" className="mc-lbl plus" data-part="rail3v3">
        3V3
      </text>
      <path d="M320 320 H530" className="mc-w minus bold" />
      <text x={530} y={340} textAnchor="end" className="mc-lbl minus">
        GND
      </text>
      <g data-part="ldo">
        <rect x={440} y={130} width={84} height={44} rx={6} className="mc-box" />
        <text x={482} y={150} textAnchor="middle" className="mc-tiny">
          {tr('LDO 只能输出', 'LDO can only')}
        </text>
        <text x={482} y={164} textAnchor="middle" className="mc-tiny">
          {tr('不能吸收电流', 'source, not sink')}
        </text>
        <path d="M482 130 V96" className="mc-w" />
      </g>
      <g data-part="core">
        <rect x={440} y={210} width={84} height={44} rx={6} className="mc-box" />
        <text x={482} y={236} textAnchor="middle" className="mc-tiny">
          {tr('芯片内核', 'chip core')}
        </text>
        <path d="M430 96 V232 H440 M482 254 V320" className="mc-w" />
      </g>
      <path d="M78 140 H370 V106 H420 V222 H436" className="mc-dash cur" data-part="inject" markerEnd="url(#dv-ahc)" />
      <text x={200} y={124} textAnchor="middle" className="mc-lbl cur" data-part="inject">
        {sub('I_inj ≈ 1.1 mA')}
      </text>
      <text x={280} y={404} textAnchor="middle" className="td-small" data-part="inject">
        {sub(tr('I_inj = (5 − 3.3 − 0.6) V / 1 kΩ ≈ 1.1 mA，流进 3V3', 'I_inj = (5 − 3.3 − 0.6) V / 1 kΩ ≈ 1.1 mA into 3V3'))}
      </text>
      <text x={280} y={424} textAnchor="middle" className="td-small">
        {sub(tr('不加 R_s：几十 mA，3V3 被顶高，芯片可能损坏', 'no R_s: tens of mA, 3V3 is pushed up, the chip may die'))}
      </text>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="dv-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="mc-ah" />
        </marker>
        <marker id="dv-ahc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="mc-ah cur" />
        </marker>
      </defs>
      <Board layer={layer} />
      <PinInside layer={layer} />
      <Thresholds layer={layer} />
      <Modes layer={layer} />
      <SourceSink layer={layer} />
      <LedCalc layer={layer} />
      <Limits layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'devboard',
    title: tr('开发板与 GPIO：一只引脚里面有什么', 'The dev board and GPIO: what is inside one pin'),
    subtitle: tr(
      'GPIO = General-Purpose Input/Output（通用输入输出）。从 ESP32 开发板的外形拆到电源路径，再拆到一只引脚里的两个晶体管、输入缓冲、上下拉电阻和钳位二极管；每一种模式都化成一个电路课能算的等效电路，最后用它算 LED 电阻和电流极限。',
      'GPIO = General-Purpose Input/Output. We go from the outside of an ESP32 dev board to its power path, then into one pin — two transistors, an input buffer, pull resistors and clamp diodes — turn every pin mode into an equivalent circuit you can calculate with, and use it for the LED resistor and the current limits.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'outside',
        short: tr('外形', 'Outside'),
        title: tr('① 外形：一块板 = 芯片模块 + 稳压器 + USB + 两排针', '① Outside: a module, a regulator, USB and two rows of pins'),
        body: tr(
          `**dev board（开发板）** 不是芯片本身，而是把芯片做成“插上 USB 就能用”的一块小电路板。以 ESP32-DevKitC 为例：
- 左边的 [[module|金属屏蔽罩模块]] 里是真正的 ESP32 芯片和存程序的 flash（闪存），左端露出的弯曲铜线是 Wi-Fi 天线；
- [[usb|micro-USB 口]] 同时做两件事：给板子供 5 V 电，和电脑传程序（经过 CP2102 这颗 USB 转串口芯片）；
- [[ldo|AMS1117-3.3]] 是 **LDO（低压差线性稳压器）**，把 5 V 降成芯片要的 3.3 V；
- [[buttons|EN 和 BOOT 两个按键]]：EN 是复位，BOOT 按住再复位进入下载模式；
- 上下两排共 38 只针，插在面包板上每只针旁边还空着一个孔。

一个关键事实：**这块板的逻辑电平是 3.3 V**。引脚输出高电平就是 3.3 V，输入能承受的上限也是 3.3 V——不是 5 V。

38 只针不是都一样，按用途分成下表这几组。悬停表格每一行，看它们在板上的位置。`,
          `A **dev board** is not the chip itself but a small board that makes the chip "plug in USB and go". Take the ESP32-DevKitC:
- the [[module|metal-shielded module]] on the left holds the actual ESP32 chip and the flash that stores the program; the wiggly copper at the left end is the Wi-Fi antenna;
- the [[usb|micro-USB socket]] does two jobs: it powers the board with 5 V and carries the program from the PC (through the CP2102 USB-to-serial chip);
- [[ldo|AMS1117-3.3]] is an **LDO (low-dropout linear regulator)** that turns 5 V into the 3.3 V the chip runs on;
- [[buttons|the EN and BOOT buttons]]: EN is reset; hold BOOT while resetting to enter download mode;
- 38 pins in two rows; on a breadboard each pin keeps one free hole beside it.

One key fact: **the logic level of this board is 3.3 V**. A pin driven high is at 3.3 V, and 3.3 V is also the most an input may see — not 5 V.

The 38 pins are not all alike; they fall into the groups in the table. Hover a row to see where they are on the board.`,
        ),
        table: {
          head: [tr('组', 'Group'), tr('引脚', 'Pins'), tr('能做什么', 'What it can do'), tr('注意', 'Watch out')],
          rows: [
            [
              tr('3V3 电源', '3V3 power'),
              '3V3',
              tr('LDO 的输出，给外部传感器供 3.3 V', 'the LDO output: 3.3 V for sensors'),
              tr('总电流受 LDO 和 USB 限制', 'total current limited by LDO and USB'),
            ],
            [
              tr('5V 电源', '5V power'),
              '5V',
              tr('USB 5 V 经二极管后的电压 ≈ 4.7 V', 'USB 5 V after a diode ≈ 4.7 V'),
              tr('只能接 5 V 器件的电源，不能接 GPIO', 'for 5 V parts’ power, never a GPIO'),
            ],
            ['GND', 'GND ×3', tr('公共地，所有电压的参考点', 'common ground, reference of every voltage'), tr('外接电源必须共地', 'external supplies must share it')],
            ['EN', 'EN', tr('高 = 运行，拉低 = 复位', 'high = run, low = reset'), tr('板上已有 10 kΩ 上拉', 'has a 10 kΩ pull-up on board')],
            [tr('普通 GPIO', 'plain GPIO'), '4, 13, 14, 16–19, 21–23, 25–27', tr('输出 / 输入 / 上下拉 / PWM', 'output / input / pulls / PWM'), tr('首选这些', 'use these first')],
            [
              tr('ADC1 模拟输入', 'ADC1 analog'),
              '32–39（VP = 36，VN = 39）',
              tr('读 0–3.3 V 电压', 'read 0–3.3 V'),
              tr('ADC2 的脚开 Wi-Fi 时不能用', 'ADC2 pins stop working with Wi-Fi'),
            ],
            [tr('只能输入', 'input only'), '34, 35, 36, 39', tr('只能输入 / ADC', 'input / ADC only'), tr('没有输出级，也没有内部上下拉', 'no output stage, no internal pulls')],
            [
              tr('启动脚 strapping', 'strapping'),
              '0, 2, 5, 12, 15',
              tr('上电时被采样，决定启动方式', 'sampled at power-up to pick the boot mode'),
              tr('别接按键 / 上拉 / 负载', 'keep buttons, pulls and loads off'),
            ],
            [tr('串口 UART', 'UART'), 'TX (1), RX (3)', tr('下载程序和串口打印', 'upload and serial print'), tr('占用了就不能下载', 'busy = no uploads')],
            [tr('闪存 flash', 'flash'), '6–11（CLK, SD0–3, CMD）', tr('接板上 flash 芯片', 'wired to the onboard flash'), tr('绝对不要用', 'never use')],
          ],
          parts: ['g-3v3', 'g-5v', 'g-gnd', 'g-en', 'g-gpio', 'g-adc1', 'g-inonly', 'g-strap', 'g-uart', 'g-flash'],
        },
        callouts: [{ part: 'usb', label: tr('micro-USB：5 V + 数据', 'micro-USB: 5 V + data'), x: 528, y: 246, lx: 540, ly: 374, anchor: 'end' }],
      },
      {
        id: 'power',
        short: tr('电源路径', 'Power'),
        title: tr('② X 光：电从 USB 到芯片走了哪条路', '② X-ray: the path from USB to the chip'),
        body: tr(
          `把电路板变透明，只看电源。电流走的是一条串联的路：
1. [[vbus|USB 给 5.0 V]]；
2. 经过一个 [[schottky|肖特基二极管 Schottky diode]]（防止 5V 脚上的外部电源倒灌进电脑），压降约 0.3 V，所以 [[v5|5V 脚实际约 4.7 V]]（第 15 课用万用表量到的就是它）；
3. [[ldo|LDO]] 把它降到 [[v3v3|3.3 V]]，供给 [[chip|ESP32 芯片]] 和 3V3 脚。

LDO 是“线性”稳压器：它像一个自动调节的电阻，把多出来的电压 **烧成热**。它要正常稳压，输入必须比输出高出一个 **dropout（压差）**：
$$V_{in} ≥ V_{out} + V_{dropout} = 3.3 + 1.1 = 4.4 V$$
4.7 V > 4.4 V，够用；但如果你用两节 AA 电池（3 V）从 5V 脚供电，LDO 就掉出稳压，3V3 会跟着掉。

所有 GPIO 输出电流、3V3 脚上外接的传感器，都从这一条路上来，所以有一个 **总预算**：芯片自己 ≈ 50 mA（开 Wi-Fi 发射时峰值几百 mA），USB 口最多 500 mA。

Blue Pill（STM32F103）的结构一样，只是数字不同，见下表。`,
          `Make the board transparent and look only at power. The current follows one series path:
1. [[vbus|USB supplies 5.0 V]];
2. through a [[schottky|Schottky diode]] (it stops an external supply on the 5V pin from back-feeding the PC), dropping about 0.3 V, so [[v5|the 5V pin is really about 4.7 V]] (what you measured in lesson 15);
3. the [[ldo|LDO]] brings it down to [[v3v3|3.3 V]] for the [[chip|ESP32 chip]] and the 3V3 pins.

An LDO is a *linear* regulator: it acts like a self-adjusting resistor and **burns the extra voltage as heat**. To regulate, its input must be at least one **dropout** voltage above the output:
$$V_{in} ≥ V_{out} + V_{dropout} = 3.3 + 1.1 = 4.4 V$$
4.7 V > 4.4 V, fine; feed the 5V pin from two AA cells (3 V) instead and the LDO drops out — 3V3 sags with it.

Every GPIO output current and every sensor on the 3V3 pin comes down this one path, so there is a **total budget**: the chip itself takes ≈ 50 mA (hundreds of mA in Wi-Fi transmit peaks), and a USB port gives at most 500 mA.

The Blue Pill (STM32F103) has the same structure with different numbers — see the table.`,
        ),
        table: {
          head: [tr('参数', 'Parameter'), 'ESP32-DevKitC', 'Blue Pill (STM32F103)'],
          rows: [
            [tr('逻辑电平 VDD', 'logic level VDD'), '3.3 V', '3.3 V'],
            [tr('稳压器（压差 / 上限）', 'regulator (dropout / limit)'), 'AMS1117: 1.1 V / 1 A', '3.3 V LDO: 0.25 V / 300 mA'],
            [tr('芯片自身电流', 'chip current'), '≈ 50 mA', '≈ 20 mA'],
            [tr('输出电阻 R_out（仿真）', 'output resistance R_out (sim)'), '25 Ω', '40 Ω'],
            [tr('每脚推荐 / 绝对最大', 'per pin: recommended / abs. max'), '20 mA / 40 mA', '20 mA / 25 mA（PC13–15：3 mA）'],
            ['$V_{IL}$ / $V_{IH}$', '0.825 V / 2.475 V', '1.16 V / 2.15 V'],
            [tr('内部上下拉', 'internal pulls'), '45 kΩ', '40 kΩ'],
            [tr('5 V 容忍', '5 V tolerant'), tr('没有任何脚', 'no pin'), tr('FT 脚：PA8–15、PB2–4、PB6–15', 'FT pins: PA8–15, PB2–4, PB6–15')],
            [tr('掉电复位 brown-out', 'brown-out reset'), '2.5 V', '2.0 V'],
          ],
          parts: [null, 'ldo', 'chip', null, null, null, null, null, null],
        },
        formulas: [
          { tex: 'V_{5V} = 5.0 - 0.3 = 4.7 V', note: tr('USB 经肖特基二极管', 'USB through the Schottky diode') },
          { tex: 'V_{in} ≥ 3.3 + 1.1 = 4.4 V', note: tr('AMS1117 能稳压的最低输入', 'lowest input the AMS1117 regulates from') },
          { tex: 'P_{LDO} = (V_{in} - 3.3 V)·I = 1.4 V × 0.1 A = 0.14 W', note: tr('100 mA 负载时 LDO 发的热', 'heat in the LDO at a 100 mA load') },
        ],
      },
      {
        id: 'pin',
        short: tr('一只引脚', 'One pin'),
        title: tr('③ 拆开一只引脚：两个晶体管、一个输入缓冲、两个电阻、两个二极管', '③ Inside one pin: two transistors, an input buffer, two resistors, two diodes'),
        body: tr(
          `芯片手册里每只 GPIO 都画成这样一张图（STM32 参考手册 “I/O port bit” 那一节就是）。从右往左看：
- [[pad|焊盘 pad]]：芯片硅片上的一块金属，经金线连到外面的针；
- [[clamp|两个钳位二极管 clamp diode]]：一个从引脚接到 3V3、一个从 GND 接到引脚。平时都反偏、不导电；引脚电压一旦高于 3V3 + 0.6 V 或低于 −0.6 V 就导通，把静电（ESD）泄放到电源轨上；
- [[rpu|上拉电阻 $R_PU$]] 和 [[rpd|下拉电阻 $R_PD$]]：各串一个开关，由程序决定接不接，约 45 kΩ；
- **输出级**：[[pmos|上管 P-MOS]] 接 3V3，[[nmos|下管 N-MOS]] 接 GND，两个管子的栅极都由 [[drv|输出控制]] 驱动。这种一上一下的结构叫 **push-pull（推挽）**；
- [[schmitt|输入缓冲 input buffer]]：一个带回差的比较器（**Schmitt trigger，施密特触发器**），把引脚电压变成 0 或 1 存进输入寄存器。

注意输入缓冲 **一直接在引脚上**：不管引脚是不是输出，芯片都能读回它的电平。`,
          `The datasheet draws every GPIO like this (see the "I/O port bit" section of the STM32 reference manual). Right to left:
- [[pad|the pad]]: a square of metal on the die, bonded to the outside pin;
- [[clamp|two clamp diodes]]: one from the pin up to 3V3, one from GND up to the pin. Normally both are reverse-biased and off; once the pin goes above 3V3 + 0.6 V or below −0.6 V they conduct and dump static (ESD) into the supply rails;
- [[rpu|pull-up $R_PU$]] and [[rpd|pull-down $R_PD$]]: each behind a switch that the program opens or closes, about 45 kΩ;
- **the output stage**: [[pmos|a P-MOS high side]] to 3V3 and [[nmos|an N-MOS low side]] to GND, both gates driven by [[drv|the output control]]. One transistor up, one down: **push-pull**;
- [[schmitt|the input buffer]]: a comparator with hysteresis (a **Schmitt trigger**) that turns the pin voltage into a 0 or 1 in the input register.

Note the input buffer is **always connected**: the chip can read the pin's level back even while it is an output.`,
        ),
        table: {
          head: [tr('部件', 'Part'), tr('它是什么', 'What it is'), tr('什么时候起作用', 'When it matters'), tr('数值（ESP32 仿真）', 'Value (ESP32 sim)')],
          rows: [
            ['P-MOS', tr('引脚到 3V3 的开关', 'switch from pin to 3V3'), tr('输出 HIGH 时导通', 'on for output HIGH'), tr('导通电阻 ≈ 25 Ω', 'on-resistance ≈ 25 Ω')],
            ['N-MOS', tr('引脚到 GND 的开关', 'switch from pin to GND'), tr('输出 LOW 时导通', 'on for output LOW'), '≈ 25 Ω'],
            [tr('施密特输入缓冲', 'Schmitt input buffer'), tr('把电压变成 0 / 1', 'voltage → 0 / 1'), tr('一直在读', 'always reading'), tr('输入电流 ≈ 0', 'input current ≈ 0')],
            ['$R_{PU}$ / $R_{PD}$', tr('可开关的上 / 下拉', 'switchable pull-up / down'), tr('输入模式选了上拉 / 下拉', 'input mode with pull'), '45 kΩ'],
            [tr('钳位二极管', 'clamp diodes'), tr('静电保护', 'ESD protection'), tr('引脚 > 3.9 V 或 < −0.6 V', 'pin > 3.9 V or < −0.6 V'), tr('注入 < 5 mA', 'inject < 5 mA')],
            [tr('输出控制', 'output control'), tr('决定哪个管子导通', 'decides which transistor is on'), tr('程序写 1 / 0', 'program writes 1 / 0'), '—'],
          ],
          parts: ['pmos', 'nmos', 'schmitt', 'rpu', 'clamp', 'drv'],
        },
      },
      {
        id: 'input',
        short: tr('输入', 'Input'),
        title: tr('④ 输入：阈值、悬空和上拉电阻', '④ Input: thresholds, floating, and the pull-up'),
        body: tr(
          `做输入时两个管子都关断，引脚只接着输入缓冲，它几乎不取电流（漏电小于 1 µA）。读数规则：
- 电压 [[vil|≤ $V_IL$ = 0.825 V（0.25·VDD）]] → 保证读 0；
- 电压 [[vih|≥ $V_IH$ = 2.475 V（0.75·VDD）]] → 保证读 1；
- [[undef|中间那一段]] → 手册不保证，可能 0 也可能 1。

真正的翻转点在中间，而且 **上升和下降不是同一个点**：[[hyst|施密特触发器]] 上升时要过 $V_{T+}$ 才变 1，下降时要低于 $V_{T-}$ 才变 0。这段 **回差（hysteresis）** 让一个慢慢变化、带点噪声的信号（例如按键抖动、长导线）不会在阈值附近来回乱跳。

**悬空（floating）**：一只没人驱动的输入引脚，等效电路只是几 pF 的电容对地——电荷稍有扰动（手靠近、旁边导线的耦合）电压就变，读数随机。所以按键必须配一个 **上拉 / 下拉电阻**，给引脚一个确定的“默认电压”：
- 上拉（pull-up）：松开时电阻把引脚拉到 3.3 V 读 1；按下时按键把引脚接到 GND 读 0（**active-low，低有效**）；
- 按下时上拉电阻里有电流：$I = \\frac{3.3 V}{45 kΩ} = 73 µA$，很小，所以选几十 kΩ：大到不浪费电，小到压得住噪声。`,
          `As an input both transistors are off and the pin sees only the input buffer, which draws almost nothing (less than 1 µA of leakage). Reading rules:
- voltage [[vil|≤ $V_IL$ = 0.825 V (0.25·VDD)]] → guaranteed 0;
- voltage [[vih|≥ $V_IH$ = 2.475 V (0.75·VDD)]] → guaranteed 1;
- [[undef|in between]] → not guaranteed: it may read 0 or 1.

The real switching point is somewhere in the middle, and **rising and falling use different points**: the [[hyst|Schmitt trigger]] needs the voltage to rise past $V_{T+}$ to switch to 1 and fall below $V_{T-}$ to switch back to 0. This **hysteresis** keeps a slow, slightly noisy signal (a bouncing button, a long wire) from chattering around the threshold.

**Floating**: an input that nothing drives is, electrically, just a few pF to ground — any disturbance (a hand nearby, coupling from a neighbouring wire) moves its voltage and the reading is random. That is why a button needs a **pull-up or pull-down resistor** to give the pin a definite default:
- pull-up: released, the resistor pulls the pin to 3.3 V and it reads 1; pressed, the button ties it to GND and it reads 0 (**active-low**);
- while pressed a current flows in the pull-up: $I = \\frac{3.3 V}{45 kΩ} = 73 µA$ — small. Tens of kΩ is the compromise: large enough not to waste power, small enough to swamp noise.`,
        ),
        table: {
          head: [tr('输入模式', 'Input mode'), tr('按键接法', 'Button wiring'), tr('松开读', 'Released'), tr('按下读', 'Pressed'), tr('按下时电流', 'Current when pressed')],
          rows: [
            [tr('输入（无上下拉）', 'input (no pull)'), tr('任意', 'any'), tr('悬空，乱跳', 'floating, random'), '?', '—'],
            [tr('输入 + 内部上拉', 'input + pull-up'), tr('引脚 → 按键 → GND', 'pin → button → GND'), '1', '0', '3.3 V / 45 kΩ = 73 µA'],
            [tr('输入 + 内部下拉', 'input + pull-down'), tr('3V3 → 按键 → 引脚', '3V3 → button → pin'), '0', '1', '73 µA'],
            [
              tr('输入 + 外部 10 kΩ 下拉（实验 5-3）', 'input + external 10 kΩ pull-down (lab 5-3)'),
              tr('3V3 → 按键 → 引脚', '3V3 → button → pin'),
              '0',
              '1',
              '3.3 V / 10 kΩ = 0.33 mA',
            ],
          ],
          parts: ['undef', 'vih', 'vil', null],
        },
        formulas: [
          { tex: 'V_{IL} = 0.25·V_{DD} = 0.825 V,   V_{IH} = 0.75·V_{DD} = 2.475 V', note: tr('ESP32；Blue Pill 是 1.16 V / 2.15 V', 'ESP32; the Blue Pill uses 1.16 V / 2.15 V') },
          { tex: 'I_{PU} = \\frac{V_{DD}}{R_{PU}} = \\frac{3.3}{45 k} = 73 µA', note: tr('按键按下时', 'while the button is pressed') },
        ],
        calcs: ['pullup-current'],
      },
      {
        id: 'modes',
        short: tr('等效电路', 'Models'),
        title: tr('⑤ 每种模式的等效电路：引脚就是“电源 + 电阻”', '⑤ The equivalent circuit of each mode: a pin is a source plus a resistor'),
        body: tr(
          `把上一层的图按模式“删掉不导通的部分”，剩下的就是电路课里能直接算的模型：
- [[m-hi|OUT HIGH]]：上管导通 → 引脚 = **3.3 V 理想电压源串联 $R_{out}$**（戴维南等效，Thevenin equivalent）。$R_{out}$ 就是 P-MOS 的导通电阻，ESP32 约 25 Ω、Blue Pill 约 40 Ω；
- [[m-lo|OUT LOW]]：下管导通 → 引脚经 $R_{out}$ 接 GND（0 V 电源串 $R_{out}$）；
- [[m-in|INPUT]]：两管都关 → 引脚几乎是 **开路**，只剩几 pF 电容；
- [[m-pu|INPUT + 上拉]]：开路 + 一个 45 kΩ 接 3V3。这其实还是戴维南电路：3.3 V 串 45 kΩ——只不过电阻大了一千多倍，所以它只能“建议”电平，任何外部驱动都能压过它；
- [[m-od|open-drain（开漏）]]：上管永远不用，只有下管：要么拉到 GND，要么断开。高电平靠外部上拉电阻，好处是外部上拉可以接 5 V（电平转换）、多个开漏输出可以并在一根线上（I²C 总线）；
- [[m-pwm|PWM]]：输出级在 HIGH 和 LOW 之间按占空比 D 来回切换，下一个拆解（PWM 与 ADC）细讲。

有了这些模型，接上外部电路就是一道普通的 KVL / 分压题。`,
          `Take the last picture and delete whatever is off in each mode; what is left is a model you can calculate with directly:
- [[m-hi|OUT HIGH]]: the high side is on → the pin is **an ideal 3.3 V source in series with $R_{out}$** (a Thevenin equivalent). $R_{out}$ is the P-MOS on-resistance: about 25 Ω on the ESP32, 40 Ω on the Blue Pill;
- [[m-lo|OUT LOW]]: the low side is on → the pin goes through $R_{out}$ to GND (a 0 V source with $R_{out}$);
- [[m-in|INPUT]]: both off → the pin is almost an **open circuit**, just a few pF;
- [[m-pu|INPUT + pull-up]]: open circuit plus 45 kΩ to 3V3. That is still a Thevenin circuit — 3.3 V behind 45 kΩ — but with a resistance a thousand times larger, so it only "suggests" a level and anything driving the pin wins;
- [[m-od|open-drain]]: the high side is never used, only the low side: pull to GND or let go. HIGH comes from an external pull-up, which may go to 5 V (level shifting), and several open-drain outputs can share one wire (the I²C bus);
- [[m-pwm|PWM]]: the output stage toggles between HIGH and LOW with a duty cycle D — the next teardown (PWM and ADC) covers it.

With these models, hooking up an external circuit is an ordinary KVL / divider problem.`,
        ),
        table: {
          head: [tr('模式', 'Mode'), tr('等效电路', 'Equivalent circuit'), tr('引脚电压', 'Pin voltage'), tr('典型用途', 'Typical use')],
          rows: [
            ['OUT HIGH', tr('3.3 V 串 25 Ω', '3.3 V + 25 Ω'), '$3.3 - 25·I$', tr('点 LED、驱动晶体管基极 / 栅极', 'LED, transistor base / gate')],
            ['OUT LOW', tr('0 V 串 25 Ω', '0 V + 25 Ω'), '$25·I$', tr('灌电流点 LED', 'sinking an LED')],
            ['INPUT', tr('开路（几 pF）', 'open (a few pF)'), tr('由外部决定', 'set by the outside'), tr('读有源信号', 'reading a driven signal')],
            [
              tr('INPUT + 上拉 / 下拉', 'INPUT + pull-up / down'),
              tr('3.3 V 或 0 V 串 45 kΩ', '3.3 V or 0 V + 45 kΩ'),
              tr('松开时 3.3 V / 0 V', '3.3 V / 0 V when released'),
              tr('按键、开关', 'buttons, switches'),
            ],
            ['open-drain', tr('开关到 GND', 'switch to GND'), tr('0 V 或由外部上拉', '0 V or the pull-up'), tr('I²C、电平转换', 'I²C, level shifting')],
            ['PWM', tr('HIGH / LOW 交替', 'HIGH / LOW alternating'), tr('平均 D·3.3 V', 'average D·3.3 V'), tr('调光、调速', 'dimming, motor speed')],
            ['ADC', tr('开路 + 采样电容', 'open + sampling capacitor'), tr('被测量', 'measured'), tr('读传感器电压', 'sensor voltages')],
          ],
          parts: ['m-hi', 'm-lo', 'm-in', 'm-pu', 'm-od', 'm-pwm', 'm-in'],
        },
      },
      {
        id: 'source-sink',
        short: tr('拉 / 灌', 'Source / sink'),
        title: tr('⑥ 拉电流和灌电流：LED 接上面还是接下面', '⑥ Source and sink: LED below the pin or above it'),
        body: tr(
          `推挽输出级有两个管子，所以一只引脚能用两种方向驱动负载（实验 5-2，Blue Pill，$R_{out}$ = 40 Ω）：
- [[source|source（拉电流）]]：负载接在引脚和 GND 之间，引脚 HIGH 时上管把电流 **推出** 引脚。
$$I_1 = \\frac{3.3 - 1.8}{40 + 220 + 12} = \\frac{1.5}{272} = 5.5 mA，V_{pin} = 3.3 - 40 × 5.5 mA = 3.08 V$$
- [[sink|sink（灌电流）]]：负载接在 3V3 和引脚之间，引脚 LOW 时下管把电流 **吸进** 引脚到 GND。
$$I_2 = \\frac{1.5}{272} = 5.5 mA，V_{pin} = 40 × 5.5 mA = 0.22 V$$

灌电流接法下，“写 0 灯亮、写 1 灯灭”，叫 **active-low（低有效）**。Blue Pill 板上 PC13 的 LED 就是这样接的：3V3 → 510 Ω → LED → PC13，PC13 输出 LOW 时灌入 $\\frac{1.5}{510 + 40 + 12} ≈ 2.7 mA$。

仿真里两个管子电阻相同，所以两种接法电流相等；**真实芯片里 N-MOS 一般比 P-MOS 强**（同样面积导通电阻更小，因为电子比空穴跑得快），灌电流时压降更小。老式 TTL 和 8051 几乎只能灌不能拉，所以很多经典电路都是低电平点灯。`,
          `A push-pull stage has two transistors, so a pin can drive a load in two directions (lab 5-2, Blue Pill, $R_{out}$ = 40 Ω):
- [[source|source]]: the load sits between the pin and GND; with the pin HIGH the high side **pushes** current out of the pin.
$$I_1 = \\frac{3.3 - 1.8}{40 + 220 + 12} = \\frac{1.5}{272} = 5.5 mA, V_{pin} = 3.3 - 40 × 5.5 mA = 3.08 V$$
- [[sink|sink]]: the load sits between 3V3 and the pin; with the pin LOW the low side **pulls** current into the pin and down to GND.
$$I_2 = \\frac{1.5}{272} = 5.5 mA, V_{pin} = 40 × 5.5 mA = 0.22 V$$

When sinking, "write 0 = on, write 1 = off": **active-low**. The Blue Pill's onboard LED on PC13 is wired this way: 3V3 → 510 Ω → LED → PC13; with PC13 LOW it sinks $\\frac{1.5}{510 + 40 + 12} ≈ 2.7 mA$.

In the simulator both transistors have the same resistance, so both currents are equal; **in a real chip the N-MOS is usually stronger** than the P-MOS (lower on-resistance for the same area, because electrons move faster than holes), so it drops less when sinking. Old TTL and the 8051 could sink but barely source, which is why so many classic circuits light their LEDs on LOW.`,
        ),
        table: {
          head: ['', tr('拉电流 source', 'source'), tr('灌电流 sink', 'sink')],
          rows: [
            [tr('负载接在', 'load between'), tr('引脚 ↔ GND', 'pin ↔ GND'), tr('3V3 ↔ 引脚', '3V3 ↔ pin')],
            [tr('亮的时候引脚是', 'lit when the pin is'), 'HIGH', tr('LOW（低有效）', 'LOW (active-low)')],
            [tr('导通的管子', 'transistor that is on'), tr('上管 P-MOS', 'high side P-MOS'), tr('下管 N-MOS', 'low side N-MOS')],
            [tr('引脚电流（仿真符号）', 'pin current (sim sign)'), tr('+5.5 mA（流出）', '+5.5 mA (out)'), tr('−5.5 mA（流入）', '−5.5 mA (in)')],
            [tr('引脚电压', 'pin voltage'), '3.08 V', '0.22 V'],
            [tr('例子', 'example'), tr('实验 5-1 的 LED', 'the LED of lab 5-1'), tr('Blue Pill 的 PC13 LED', 'Blue Pill PC13 LED')],
          ],
          parts: [null, null, null, null, null, null],
        },
        formulas: [
          { tex: 'I = \\frac{V_{DD} - V_f}{R_{out} + R + R_{LED}}', note: tr('两种接法是同一个回路，只是开关的位置不同', 'both are the same loop; only the switch moved') },
        ],
        calcs: ['led-resistor'],
      },
      {
        id: 'led-resistor',
        short: tr('算电阻', 'Resistor'),
        title: tr('⑦ 一步步算：3.3 V 引脚点一个 LED 要多大电阻', '⑦ Step by step: the LED resistor on a 3.3 V pin'),
        body: tr(
          `实验 5-1：ESP32 引脚 HIGH → R → 红色 LED → GND，目标 10 mA。把每个元件换成第 ⑤ 层的模型：
- 引脚 = 3.3 V 串 [[b-rout|$R_out$ = 25 Ω]]；
- 红色 LED = [[b-vf|$V_f$ = 1.8 V]] 串 [[b-rled|12 Ω]]（仿真模型）；
- 中间是我们要求的 [[b-r|R]]。

**第 1 步 · KVL**：绕回路一圈，电压升 = 电压降：
$$3.3 = I·R_{out} + I·R + I·R_{LED} + V_f$$
**第 2 步 · 解出 R**：
$$R = \\frac{3.3 - V_f}{I} - R_{out} - R_{LED} = \\frac{1.5 V}{10 mA} - 25 - 12 = 150 - 37 = 113 Ω$$
**第 3 步 · 选标准值**：E12 系列里最近的是 120 Ω（100 Ω 也行）。
**第 4 步 · 反过来验算**：$I = \\frac{1.5}{25 + 120 + 12} = 9.5 mA$；引脚电压 $V_{pin} = 3.3 - 25 × 9.5 mA = 3.06 V$——带了负载，HIGH 就不是 3.3 V 了。

**如果不加电阻**（实验的初始电路）：$I = \\frac{1.5}{25 + 12} = 40 mA$，正好是绝对最大值；引脚掉到 $3.3 - 25 × 40 mA = 2.29 V$，比 $V_{IH}$ = 2.475 V 还低——连一个合格的 HIGH 都不是了。很多人以为“3.3 V 很低，LED 不用电阻”，问题就在于：限流的只剩 $R_{out}$ 和 LED 的内阻。`,
          `Lab 5-1: ESP32 pin HIGH → R → red LED → GND, target 10 mA. Replace every part with its model from layer ⑤:
- the pin = 3.3 V behind [[b-rout|$R_out$ = 25 Ω]];
- the red LED = [[b-vf|$V_f$ = 1.8 V]] plus [[b-rled|12 Ω]] (simulator model);
- in between, the [[b-r|R]] we want.

**Step 1 · KVL**: around the loop, rises = drops:
$$3.3 = I·R_{out} + I·R + I·R_{LED} + V_f$$
**Step 2 · solve for R**:
$$R = \\frac{3.3 - V_f}{I} - R_{out} - R_{LED} = \\frac{1.5 V}{10 mA} - 25 - 12 = 150 - 37 = 113 Ω$$
**Step 3 · standard value**: the nearest E12 value is 120 Ω (100 Ω also works).
**Step 4 · check backwards**: $I = \\frac{1.5}{25 + 120 + 12} = 9.5 mA$; pin voltage $V_{pin} = 3.3 - 25 × 9.5 mA = 3.06 V$ — under load, HIGH is no longer 3.3 V.

**Without a resistor** (the lab's starting board): $I = \\frac{1.5}{25 + 12} = 40 mA$ — exactly the absolute maximum; the pin sags to $3.3 - 25 × 40 mA = 2.29 V$, below $V_{IH}$ = 2.475 V, so it is not even a valid HIGH any more. The myth "3.3 V is low, an LED needs no resistor" fails because the only things left limiting the current are $R_{out}$ and the LED's own resistance.`,
        ),
        table: {
          head: ['R', 'I', tr('引脚电压', 'pin voltage'), tr('结论', 'verdict')],
          rows: [
            [tr('0 Ω（直连）', '0 Ω (jumper)'), '40 mA', '2.29 V', tr('引脚损坏', 'pin damaged')],
            ['100 Ω', '10.9 mA', '3.03 V', tr('可以', 'fine')],
            ['120 Ω', '9.5 mA', '3.06 V', tr('本实验的答案', 'this lab’s answer')],
            ['150 Ω', '8.0 mA', '3.10 V', tr('亮，但低于 8.5 mA 窗口', 'lit, below the 8.5 mA window')],
            ['1 kΩ', '1.4 mA', '3.26 V', tr('指示灯常用，够亮', 'typical indicator, bright enough')],
          ],
          parts: ['nores', 'b-r', 'b-r', 'b-r', 'b-r'],
        },
        formulas: [
          { tex: 'R = \\frac{V_{DD} - V_f}{I} - R_{out} - R_{LED}', note: tr('从 KVL 解出', 'solved from KVL') },
          { tex: 'V_{pin} = V_{DD} - I·R_{out}', note: tr('带载后的高电平', 'the HIGH level under load') },
        ],
        calcs: ['gpio-led-resistor', 'led-resistor'],
      },
      {
        id: 'limits',
        short: tr('极限', 'Limits'),
        title: tr('⑧ 局限：电流上限、3.3 V 不是 5 V、钳位二极管', '⑧ Limits: current, 3.3 V is not 5 V, the clamp diodes'),
        body: tr(
          `**电流**：$R_{out}$ 上的压降 $I·R_{out}$ 和发热 $I^{2}·R_{out}$ 随电流增大。ESP32 每脚推荐 ≤ 20 mA、绝对最大 40 mA（Blue Pill 25 mA，PC13–15 只有 3 mA）。还有 **所有引脚加起来** 的上限：电流都从芯片的几只 VDD 脚和 LDO 来。要驱动蜂鸣器、继电器、电机，用三极管或 MOSFET（后面两个拆解）。

**电压**：ESP32 的引脚 **没有一只能接 5 V**。原因就在 [[clamp|上钳位二极管]]：把一个 5 V 模块的输出经 [[ext5v|$R_s$]] 接到引脚上，引脚被二极管钳在约 3.9 V，多出的电压全落在 R_s 上，电流 [[inject|注入 3V3 电源轨]]：
$$I_{inj} = \\frac{5 - 3.3 - 0.6}{1 kΩ} ≈ 1.1 mA$$
这股电流没地方去——[[ldo|LDO 只能输出电流，不能吸收]]——于是它给 [[core|芯片内核]] 和其他负载供电，3V3 被“反向供电”顶高。不加电阻直接接 5 V，注入电流几十 mA，芯片可能当场损坏。仿真里注入超过 5 mA 就判损坏。

**正确做法**：分压电阻（5 V → 10 kΩ / 20 kΩ → 3.3 V）、电平转换芯片，或者用开漏输出 + 上拉到对方的电源（实验 5-10、5-11）。Blue Pill 的 **FT 脚**（five-volt tolerant）没有上钳位二极管，数字模式下能接 5 V；但 **一旦设成模拟输入（ADC）就不再容忍 5 V**。

**模型没画的**：$R_{out}$ 其实随电流和温度变化，固件可以调驱动强度；真实输入有几 µA 漏电。`,
          `**Current**: the drop $I·R_{out}$ and the heat $I^{2}·R_{out}$ grow with current. On the ESP32 the recommended maximum is 20 mA per pin and the absolute maximum 40 mA (Blue Pill 25 mA; PC13–15 only 3 mA). There is also a limit for **all pins together**: the current comes through the chip's few VDD pins and the LDO. For buzzers, relays and motors use a transistor or a MOSFET (the next two teardowns).

**Voltage**: **no ESP32 pin may see 5 V**. The reason is the [[clamp|upper clamp diode]]: connect a 5 V module's output through [[ext5v|$R_s$]] and the diode holds the pin at about 3.9 V; the rest of the voltage drops across R_s and a current is [[inject|injected into the 3V3 rail]]:
$$I_{inj} = \\frac{5 - 3.3 - 0.6}{1 kΩ} ≈ 1.1 mA$$
That current has nowhere to go — [[ldo|an LDO can only source current, not sink it]] — so it feeds [[core|the chip core]] and other loads and pushes 3V3 up ("back-powering"). Without a resistor the injected current is tens of mA and the chip can die on the spot. The simulator flags a pin as damaged above 5 mA of injection.

**Do it properly**: a divider (5 V → 10 kΩ / 20 kΩ → 3.3 V), a level-shifter chip, or an open-drain output with a pull-up to the other side's supply (labs 5-10, 5-11). The Blue Pill's **FT pins** (five-volt tolerant) have no upper clamp diode and take 5 V in digital mode — but **not once they are set to analog input (ADC)**.

**What the model leaves out**: the real $R_{out}$ changes with current and temperature and firmware can set the drive strength; real inputs leak a few µA.`,
        ),
        table: {
          head: [tr('极限', 'Limit'), 'ESP32', 'Blue Pill', tr('超过会怎样', 'Beyond it')],
          rows: [
            [tr('每脚推荐电流', 'per-pin recommended'), '20 mA', tr('20 mA（PC13–15：3 mA）', '20 mA (PC13–15: 3 mA)'), tr('警告：压降大、发热', 'warning: big drop, heat')],
            [tr('每脚绝对最大', 'per-pin absolute max'), '40 mA', '25 mA', tr('引脚损坏', 'pin damaged')],
            [tr('引脚电压范围', 'pin voltage range'), '−0.3 … 3.6 V', tr('非 FT：同左；FT：≤ 5.5 V', 'non-FT: same; FT: ≤ 5.5 V'), tr('钳位二极管导通', 'clamp diode conducts')],
            [tr('钳位注入电流', 'clamp injection'), '< 5 mA', '< 5 mA', tr('损坏，3V3 被顶高', 'damage, 3V3 pushed up')],
            [tr('USB 总电流', 'USB total'), '500 mA', '500 mA', tr('电脑口限流 / 掉电', 'port limits / browns out')],
            [tr('LDO 上限', 'LDO limit'), '1 A', '300 mA', tr('稳压器过热 / 限流', 'regulator overheats / limits')],
          ],
          parts: [null, null, 'clamp', 'inject', null, 'ldo'],
        },
        formulas: [{ tex: 'I_{inj} = \\frac{V_{ext} - V_{DD} - 0.6 V}{R_s}', note: tr('外部高于 3V3 时钳位二极管里的电流', 'clamp current when the outside is above 3V3') }],
        calcs: ['pullup-current', 'i2c-rise-time'],
      },
    ],
    recap: tr(
      '一只 GPIO = 两个开关（P-MOS 到 3V3、N-MOS 到 GND）+ 一个施密特输入 + 可开关的 45 kΩ 上下拉 + 两个钳位二极管。输出时它是“3.3 V 串 25 Ω”，输入时它是开路；算 LED 电阻要把 $R_{out}$ 算进 KVL，电流 ≤ 20 mA，电压永远不超过 3.3 V。',
      'A GPIO = two switches (P-MOS to 3V3, N-MOS to GND) + a Schmitt input + switchable 45 kΩ pulls + two clamp diodes. As an output it is "3.3 V behind 25 Ω", as an input it is an open circuit; put $R_{out}$ into the KVL for the LED resistor, keep the current ≤ 20 mA and the voltage never above 3.3 V.',
    ),
  };
}
