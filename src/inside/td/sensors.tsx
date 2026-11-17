// Teardown: the LDR (photoresistor) and the NTC thermistor. Outside → inside the LDR (a zig-zag
// CdS track between two comb electrodes) → its power-law curve on log-log axes → inside the NTC
// (a sintered oxide bead) and the B equation → both read through a divider into the ADC →
// choosing the fixed resistor (best sensitivity at R_fixed = R_sensor) with labs 5-5 and 5-6 →
// from ADC code back to temperature, and why it isn't linear → limits (self-heating, speed, spread).

import './mcu.css';
import { tr } from '../../core/i18n';
import { sub, vis } from '../TeardownView';
import type { Teardown } from '../types';

/* ------------------------------------------------------------------ models (match src/core/devices.ts) */

const ldrR = (lux: number) => Math.min(1e6, Math.max(100, 15e3 * Math.pow(lux / 10, -0.7)));
const ntcR = (tC: number) => 10e3 * Math.exp(3950 * (1 / (tC + 273.15) - 1 / 298.15));

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

/** LDR symbol on a vertical wire from y1 to y2 */
function LdrSym({ x, y1, y2, part }: { x: number; y1: number; y2: number; part?: string }) {
  const cy = (y1 + y2) / 2;
  return (
    <g data-part={part}>
      <Res x1={x} y1={y1} x2={x} y2={y2} />
      <circle cx={x} cy={cy} r={26} className="mc-w thin" />
      <path d={`M${x - 52} ${cy - 30} l20 14 M${x - 52} ${cy - 14} l20 14`} className="mc-w thin" markerEnd="url(#se-ah)" />
    </g>
  );
}

/** thermistor symbol: a box with a slanted line */
function NtcSym({ x, y1, y2, part }: { x: number; y1: number; y2: number; part?: string }) {
  const cy = (y1 + y2) / 2;
  return (
    <g data-part={part}>
      <path d={`M${x} ${y1} V${cy - 22} M${x} ${cy + 22} V${y2}`} className="mc-w" />
      <rect x={x - 9} y={cy - 22} width={18} height={44} className="mc-box" />
      <path d={`M${x - 20} ${cy + 22} h6 l28 -44`} className="mc-w thin" />
      <text x={x + 14} y={cy + 30} className="mc-tiny">
        −t°
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ outside (layer 0) */

function Outside({ layer }: { layer: number }) {
  const zz: string[] = [];
  for (let i = 0; i <= 8; i++) zz.push(`${118 + i * 8},${i % 2 ? 150 : 192}`);
  return (
    <g className={vis(layer, 0, 0)}>
      <g data-part="ldr">
        <rect x={136} y={210} width={4} height={180} className="mc-leg" />
        <rect x={170} y={210} width={4} height={180} className="mc-leg" />
        <circle cx={155} cy={170} r={50} className="mc-ceramic" />
        <path d="M115 140 H195 M115 202 H195" className="mc-w" style={{ stroke: '#c9ccd1', strokeWidth: 8 }} />
        <polyline points={zz.join(' ')} className="mc-w" style={{ stroke: '#e0703a', strokeWidth: 4 }} />
        <circle cx={155} cy={170} r={50} fill="rgba(255,255,255,0.18)" stroke="#8a8270" strokeWidth={1.5} />
        <text x={155} y={100} textAnchor="middle" className="mc-big">
          {tr('光敏电阻 LDR', 'LDR (photoresistor)')}
        </text>
        <text x={155} y={414} textAnchor="middle" className="mc-tiny">
          GL5528 · 5 mm
        </text>
      </g>
      <g data-part="ntc">
        <rect x={398} y={196} width={3} height={194} className="mc-leg" />
        <rect x={420} y={196} width={3} height={194} className="mc-leg" />
        <ellipse cx={410} cy={180} rx={22} ry={28} className="mc-epoxy" />
        <text x={410} y={100} textAnchor="middle" className="mc-big">
          {tr('热敏电阻 NTC', 'NTC thermistor')}
        </text>
        <text x={410} y={414} textAnchor="middle" className="mc-tiny">
          10 kΩ · B3950
        </text>
      </g>
      <text x={280} y={60} textAnchor="middle" className="td-small">
        {tr('都只有两只脚、不分正负，就是一个会变的电阻', 'two legs, no polarity: just a resistor that changes')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ LDR inside (layer 1) */

function LdrInside({ layer }: { layer: number }) {
  const top = 96;
  const bot = 372;
  const fa = [110, 190, 270, 350, 430]; // fingers from the top electrode
  const fb = [150, 230, 310, 390]; // fingers from the bottom electrode
  const fw = 24;
  return (
    <g className={vis(layer, 1, 1)}>
      <rect x={90} y={top} width={380} height={bot - top} className="mc-cds" data-part="cds" />
      <g data-part="elA">
        <rect x={90} y={top - 22} width={380} height={22} className="mc-elec" />
        {fa.map((x) => (
          <rect key={x} x={x - fw / 2} y={top} width={fw} height={bot - top - 26} className="mc-elec" />
        ))}
      </g>
      <g data-part="elB">
        <rect x={90} y={bot} width={380} height={22} className="mc-elec" />
        {fb.map((x) => (
          <rect key={x} x={x - fw / 2} y={top + 26} width={fw} height={bot - top - 26} className="mc-elec" />
        ))}
      </g>
      <text x={280} y={top - 7} textAnchor="middle" className="mc-tiny" data-part="elA">
        {tr('电极 1（接一只脚）', 'electrode 1 (one leg)')}
      </text>
      <text x={280} y={bot + 15} textAnchor="middle" className="mc-tiny" data-part="elB">
        {tr('电极 2（接另一只脚）', 'electrode 2 (other leg)')}
      </text>
      {/* photons and freed carriers */}
      <g data-part="photon">
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${470 + i * 26} ${40 + i * 6} q-6 8 -12 6 t-12 6 t-12 6 t-12 6`} className="mc-photon" markerEnd="url(#se-ahy)" />
        ))}
        <text x={548} y={34} textAnchor="end" className="mc-tiny">
          {tr('光子 hν', 'photons hν')}
        </text>
      </g>
      <g data-part="carriers">
        {[
          [170, 160],
          [170, 250],
          [250, 200],
          [330, 300],
          [410, 180],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={5} fill="#2b59c3" />
            <circle cx={x} cy={y + 18} r={5} fill="#fffdf8" stroke="#c0392b" strokeWidth={1.5} />
          </g>
        ))}
      </g>
      <path d="M520 150 V330" className="mc-w acc" markerStart="url(#se-ah)" markerEnd="url(#se-ah)" data-part="gap" />
      <text x={526} y={240} className="mc-tiny" data-part="gap">
        W
      </text>
      <text x={20} y={250} className="mc-tiny" data-part="gap">
        {tr('间隙 L 很窄', 'gap L narrow')}
      </text>
      <path d="M78 246 L120 236" className="mc-w thin" data-part="gap" />
      <text x={280} y={430} textAnchor="middle" className="td-small" data-part="cds">
        {tr('橙色 = CdS 光敏层：蓝 = 光激发的电子，红圈 = 空穴', 'orange = CdS film: blue = electrons freed by light, red rings = holes')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ LDR curve (layer 2) */

function LdrCurve({ layer }: { layer: number }) {
  const x = (lux: number) => 100 + Math.log10(lux) * 126;
  const y = (r: number) => 380 - (Math.log10(r) - 2) * 68;
  const pts: string[] = [];
  for (let e = 0; e <= 3.0001; e += 0.05) pts.push(`${x(10 ** e)},${y(ldrR(10 ** e))}`);
  const marks: [number, string][] = [
    [1, '75 kΩ'],
    [10, '15 kΩ'],
    [100, '3.0 kΩ'],
    [1000, '600 Ω'],
  ];
  return (
    <g className={vis(layer, 2, 2)}>
      {[1, 10, 100, 1000].map((l) => (
        <g key={l}>
          <line x1={x(l)} y1={y(100)} x2={x(l)} y2={y(1e6)} className="mc-grid" />
          <text x={x(l)} y={y(100) + 16} textAnchor="middle" className="mc-tiny">
            {l}
          </text>
        </g>
      ))}
      {[100, 1e3, 1e4, 1e5, 1e6].map((r) => (
        <g key={r}>
          <line x1={x(1)} y1={y(r)} x2={x(1000)} y2={y(r)} className="mc-grid" />
          <text x={x(1) - 8} y={y(r) + 4} textAnchor="end" className="mc-tiny">
            {r >= 1e6 ? '1 MΩ' : r >= 1e3 ? `${r / 1e3} kΩ` : `${r} Ω`}
          </text>
        </g>
      ))}
      <path d={`M${x(1)} ${y(100)} H${x(1000) + 14} M${x(1)} ${y(100)} V${y(1e6) - 14}`} className="mc-axis" />
      <polyline points={pts.join(' ')} className="mc-curve o" data-part="ldrline" />
      {marks.map(([l, t]) => (
        <g key={l} data-part={`lux${l}`}>
          <circle cx={x(l)} cy={y(ldrR(l))} r={5.5} fill="#d17a00" />
          <text x={x(l) + 8} y={y(ldrR(l)) - 8} className="mc-lbl">
            {t}
          </text>
        </g>
      ))}
      <g data-part="slope">
        <path d={`M${x(10)} ${y(ldrR(10))} H${x(100)} V${y(ldrR(100))}`} className="mc-dash" />
        <text x={x(31)} y={y(ldrR(10)) - 8} textAnchor="middle" className="mc-tiny">
          {tr('×10 光照', '×10 light')}
        </text>
        <text x={x(100) + 6} y={(y(ldrR(10)) + y(ldrR(100))) / 2} className="mc-tiny">
          {tr('÷5 电阻', '÷5 resistance')}
        </text>
      </g>
      <text x={x(1000) + 14} y={y(100) + 32} textAnchor="end" className="td-small">
        {tr('照度 lux（对数）→', 'illuminance, lux (log) →')}
      </text>
      <text x={x(1) + 6} y={y(1e6) - 4} className="td-small">
        {tr('电阻（对数）', 'resistance (log)')}
      </text>
      <text x={330} y={60} textAnchor="middle" className="mc-big" data-part="ldrline">
        {sub('R = 15 kΩ·(lux/10)^(−0.7)')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ NTC inside + curve (layer 3) */

function NtcInside({ layer }: { layer: number }) {
  const x = (t: number) => 270 + (t / 100) * 250;
  const y = (r: number) => 370 - (r / 35e3) * 270;
  const pts: string[] = [];
  for (let t = 0; t <= 100.001; t += 2) pts.push(`${x(t)},${y(ntcR(t))}`);
  const marks: [number, string][] = [
    [0, '33.6 kΩ'],
    [25, '10.0 kΩ'],
    [50, '3.59 kΩ'],
    [80, '1.27 kΩ'],
  ];
  return (
    <g className={vis(layer, 3, 3)}>
      {/* the bead, cut open */}
      <g data-part="bead">
        <ellipse cx={120} cy={170} rx={70} ry={86} className="mc-epoxy" />
        <ellipse cx={120} cy={170} rx={52} ry={64} className="mc-ceramic" />
        {Array.from({ length: 24 }, (_, i) => (
          <circle key={i} cx={84 + (i % 6) * 14} cy={128 + Math.floor(i / 6) * 22 + (i % 2) * 6} r={5} fill="#b9ad8f" opacity={0.7} />
        ))}
      </g>
      <g data-part="leads">
        <path d="M104 150 V380 M136 150 V380" className="mc-w" style={{ stroke: '#9aa0aa', strokeWidth: 4 }} />
        <rect x={98} y={140} width={12} height={20} className="mc-metal" />
        <rect x={130} y={140} width={12} height={20} className="mc-metal" />
      </g>
      <text x={120} y={66} textAnchor="middle" className="mc-tiny" data-part="bead">
        {tr('Mn、Ni、Co 氧化物烧结的陶瓷', 'sintered Mn / Ni / Co oxide ceramic')}
      </text>
      <text x={120} y={402} textAnchor="middle" className="mc-tiny" data-part="bead">
        {tr('外面一层环氧 / 玻璃', 'epoxy / glass coat')}
      </text>
      {/* R(T) */}
      {[0, 25, 50, 75, 100].map((t) => (
        <text key={t} x={x(t)} y={y(0) + 16} textAnchor="middle" className="mc-tiny">
          {t}
        </text>
      ))}
      {[0, 10e3, 20e3, 30e3].map((r) => (
        <text key={r} x={x(0) - 8} y={y(r) + 4} textAnchor="end" className="mc-tiny">
          {r / 1e3}k
        </text>
      ))}
      <path d={`M${x(0)} ${y(0)} H${x(100) + 12} M${x(0)} ${y(0)} V${y(35e3) - 10}`} className="mc-axis" />
      <polyline points={pts.join(' ')} className="mc-curve b" data-part="ntcline" />
      {marks.map(([t, s]) => (
        <g key={t} data-part={`t${t}`}>
          <circle cx={x(t)} cy={y(ntcR(t))} r={5.5} fill="#2b59c3" />
          <text x={x(t) + 10} y={y(ntcR(t)) + (t === 0 ? 5 : -8)} className="mc-lbl">
            {s}
          </text>
        </g>
      ))}
      <text x={x(100) + 12} y={y(0) + 32} textAnchor="end" className="td-small">
        T (°C) →
      </text>
      <text x={x(0) + 6} y={y(35e3) - 2} className="td-small">
        {sub('R_NTC')}
      </text>
      <text x={395} y={60} textAnchor="middle" className="mc-big" data-part="ntcline">
        {sub('R = R_0·exp[B(1/T − 1/T_0)]')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ dividers (layer 4) */

function Dividers({ layer }: { layer: number }) {
  const adc = (x: number, y: number, t: string, part: string) => (
    <g data-part={part}>
      <rect x={x} y={y - 15} width={80} height={30} rx={5} className="mc-box" />
      <text x={x + 40} y={y + 4} textAnchor="middle" className="mc-tiny">
        {t}
      </text>
    </g>
  );
  return (
    <g className={vis(layer, 4, 4)}>
      <line x1={280} y1={40} x2={280} y2={420} className="mc-dash" />
      {/* LDR on top */}
      <text x={140} y={46} textAnchor="middle" className="mc-big">
        {tr('实验 5-5：LDR 在上', 'lab 5-5: LDR on top')}
      </text>
      <path d="M108 74 H132 M120 74 V90 M120 170 V240 M120 310 V330 M120 210 H160" className="mc-w" />
      <text x={140} y={78} className="mc-lbl plus">
        3V3
      </text>
      <LdrSym x={120} y1={90} y2={170} part="ldr" />
      <Res x1={120} y1={240} x2={120} y2={310} part="r-ldr" />
      <Gnd x={120} y={330} />
      <Dot x={120} y={210} />
      {adc(160, 210, tr('PA0 (ADC)', 'PA0 (ADC)'), 'adc1')}
      <text x={110} y={202} textAnchor="end" className="mc-lbl acc" data-part="vlight">
        VLIGHT
      </text>
      <text x={132} y={280} className="mc-lbl" data-part="r-ldr">
        R1 6.8 kΩ
      </text>
      <text x={150} y={134} className="mc-tiny" data-part="ldr">
        {sub('R_LDR')}
      </text>
      <text x={140} y={370} textAnchor="middle" className="mc-lbl" data-part="vlight">
        {sub('V = 3.3·R1 / (R1 + R_LDR)')}
      </text>
      <text x={140} y={390} textAnchor="middle" className="td-small" data-part="vlight">
        {tr('越亮 → 电压越高', 'brighter → higher')}
      </text>
      {/* NTC at the bottom */}
      <text x={420} y={46} textAnchor="middle" className="mc-big">
        {tr('实验 5-6：NTC 在下', 'lab 5-6: NTC below')}
      </text>
      <path d="M388 74 H412 M400 74 V90 M400 170 V240 M400 310 V330 M400 210 H440" className="mc-w" />
      <text x={420} y={78} className="mc-lbl plus">
        3V3
      </text>
      <Res x1={400} y1={90} x2={400} y2={170} part="r-ntc" />
      <NtcSym x={400} y1={240} y2={310} part="ntc" />
      <Gnd x={400} y={330} />
      <Dot x={400} y={210} />
      {adc(440, 210, 'GPIO32 (ADC)', 'adc2')}
      <text x={390} y={202} textAnchor="end" className="mc-lbl acc" data-part="vtemp">
        VTEMP
      </text>
      <text x={412} y={134} className="mc-lbl" data-part="r-ntc">
        R1 10 kΩ
      </text>
      <text x={386} y={280} textAnchor="end" className="mc-tiny" data-part="ntc">
        {sub('R_NTC')}
      </text>
      <text x={420} y={370} textAnchor="middle" className="mc-lbl" data-part="vtemp">
        {sub('V = 3.3·R_NTC / (R1 + R_NTC)')}
      </text>
      <text x={420} y={390} textAnchor="middle" className="td-small" data-part="vtemp">
        {tr('越热 → 电压越低', 'hotter → lower')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ choosing R1 (layer 5) */

function ChooseR({ layer }: { layer: number }) {
  const x = (lux: number) => 90 + Math.log10(lux) * 130;
  const y = (v: number) => 370 - (v / 3.3) * 270;
  const curve = (r1: number) => {
    const pts: string[] = [];
    for (let e = 0; e <= 3.0001; e += 0.05) {
      const l = 10 ** e;
      pts.push(`${x(l)},${y((3.3 * r1) / (r1 + ldrR(l)))}`);
    }
    return pts.join(' ');
  };
  const vAt = (r1: number, l: number) => (3.3 * r1) / (r1 + ldrR(l));
  return (
    <g className={vis(layer, 5, 5)}>
      {[1, 10, 100, 1000].map((l) => (
        <g key={l}>
          <line x1={x(l)} y1={y(0)} x2={x(l)} y2={y(3.3)} className="mc-grid" />
          <text x={x(l)} y={y(0) + 16} textAnchor="middle" className="mc-tiny">
            {l}
          </text>
        </g>
      ))}
      {[0, 1.65, 3.3].map((v) => (
        <text key={v} x={x(1) - 8} y={y(v) + 4} textAnchor="end" className="mc-tiny">
          {v} V
        </text>
      ))}
      <line x1={x(1)} y1={y(1.65)} x2={x(1000)} y2={y(1.65)} className="mc-dash" data-part="half" />
      <path d={`M${x(1)} ${y(0)} H${x(1000) + 14} M${x(1)} ${y(0)} V${y(3.3) - 14}`} className="mc-axis" />
      <polyline points={curve(100e3)} className="mc-curve r" data-part="r100k" />
      <polyline points={curve(6.8e3)} className="mc-curve g" data-part="r6k8" />
      <polyline points={curve(1e3)} className="mc-curve b" data-part="r1k" />
      <text x={x(1.05)} y={y(3.0)} className="mc-lbl plus" data-part="r100k">
        R1 = 100 kΩ
      </text>
      <text x={x(1000) - 2} y={y(vAt(100e3, 1000)) + 18} textAnchor="end" className="mc-tiny" data-part="r100k">
        {tr('亮端挤在一起', 'bright end crowded')}
      </text>
      <text x={x(14)} y={y(vAt(6.8e3, 14)) - 12} textAnchor="end" className="mc-lbl" fill="#2a9d6f" data-part="r6k8">
        R1 = 6.8 kΩ ✓
      </text>
      <text x={x(300)} y={y(vAt(1e3, 300)) + 22} className="mc-lbl minus" data-part="r1k">
        R1 = 1 kΩ
      </text>
      <text x={x(1.2)} y={y(0.1) - 6} className="mc-tiny" data-part="r1k">
        {tr('暗端挤在 0 V', 'dark end crowded at 0 V')}
      </text>
      <g data-part="sweet">
        <circle cx={x(Math.pow(6.8e3 / 15e3, -1 / 0.7) * 10)} cy={y(1.65)} r={6} fill="#2a9d6f" />
        <text x={x(Math.pow(6.8e3 / 15e3, -1 / 0.7) * 10) + 10} y={y(1.65) + 18} className="mc-tiny">
          {sub(tr('R_LDR = R1：曲线最陡', 'R_LDR = R1: steepest'))}
        </text>
      </g>
      <text x={x(1000) + 14} y={y(0) + 32} textAnchor="end" className="td-small">
        {tr('照度 lux（对数）→', 'lux (log) →')}
      </text>
      <text x={x(1) + 6} y={y(3.3) - 6} className="td-small">
        {tr('ADC 电压', 'ADC voltage')}
      </text>
      <text x={300} y={50} textAnchor="middle" className="mc-big">
        {sub(tr('同一个 LDR，三个 R1', 'one LDR, three R1'))}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ NTC readout (layer 6) */

function NtcRead({ layer }: { layer: number }) {
  const x = (t: number) => 80 + (t / 100) * 270;
  const y = (c: number) => 370 - (c / 4095) * 280;
  // the board's 3V3 sits at ≈ 3.298 V under load, the ADC full scale is 3.3 V (lab 5-6's numbers)
  const code = (t: number) => Math.round(((3.298 * ntcR(t)) / (10e3 + ntcR(t)) / 3.3) * 4095);
  const pts: string[] = [];
  for (let t = 0; t <= 100.001; t += 2) pts.push(`${x(t)},${y(code(t))}`);
  const marks = [0, 25, 50, 80];
  return (
    <g className={vis(layer, 6, 6)}>
      {[0, 25, 50, 75, 100].map((t) => (
        <text key={t} x={x(t)} y={y(0) + 16} textAnchor="middle" className="mc-tiny">
          {t}
        </text>
      ))}
      {[0, 2048, 4095].map((c) => (
        <text key={c} x={x(0) - 8} y={y(c) + 4} textAnchor="end" className="mc-tiny">
          {c}
        </text>
      ))}
      <path d={`M${x(0)} ${y(0)} H${x(100) + 12} M${x(0)} ${y(0)} V${y(4095) - 12}`} className="mc-axis" />
      <line x1={x(0)} y1={y(code(0))} x2={x(80)} y2={y(code(80))} className="mc-dash" data-part="straight" />
      <polyline points={pts.join(' ')} className="mc-curve b" data-part="codeline" />
      {marks.map((t) => (
        <g key={t} data-part={`c${t}`}>
          <circle cx={x(t)} cy={y(code(t))} r={5} fill="#2b59c3" />
          <text x={x(t) + 8} y={y(code(t)) - 8} className="mc-lbl">
            {code(t)}
          </text>
        </g>
      ))}
      <g data-part="slope">
        <text x={x(12)} y={y(3600)} textAnchor="middle" className="mc-tiny">
          {tr('44 码/°C', '44 /°C')}
        </text>
        <text x={x(37)} y={y(1950)} className="mc-tiny">
          {tr('39 码/°C', '39 /°C')}
        </text>
        <text x={x(66)} y={y(1050)} className="mc-tiny">
          {tr('21 码/°C', '21 /°C')}
        </text>
      </g>
      <text x={x(100) + 12} y={y(0) + 32} textAnchor="end" className="td-small">
        T (°C) →
      </text>
      <text x={x(0) + 6} y={y(4095) - 4} className="td-small">
        {tr('ADC 读数', 'ADC code')}
      </text>
      {/* firmware box */}
      <g data-part="firmware">
        <rect x={380} y={70} width={170} height={250} rx={10} className="mc-box soft" />
        <text x={465} y={92} textAnchor="middle" className="mc-lbl">
          {tr('固件反算（例：1081）', 'firmware (e.g. 1081)')}
        </text>
        {[
          sub('① R = 10k·raw/(4095−raw)'),
          '   = 10k × 1081 / 3014',
          '   = 3.59 kΩ',
          sub('② ln(R/R_0) = ln 0.359'),
          '   = −1.025',
          sub('③ 1/T = 1/298.15'),
          '        + (−1.025)/3950',
          '   = 0.003094 /K',
          '④ T = 323.2 K = 50.0 °C',
        ].map((t, i) => (
          <text key={i} x={390} y={116 + i * 22} className="mc-mono" xmlSpace="preserve" style={{ fontSize: 10 }}>
            {t}
          </text>
        ))}
      </g>
      <text x={250} y={430} textAnchor="middle" className="td-small" data-part="straight">
        {tr('虚线 = 直线插值：中间温度误差好几度', 'dashed = a straight line: degrees off in the middle')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ limits (layer 7) */

function Limits({ layer }: { layer: number }) {
  const x = (t: number) => 90 + (t / 100) * 400;
  const y = (mw: number) => 250 - (mw / 0.3) * 170;
  const p = (t: number) => {
    const r = ntcR(t);
    const v = (3.3 * r) / (10e3 + r);
    return ((v * v) / r) * 1000;
  };
  const pts: string[] = [];
  for (let t = 0; t <= 100.001; t += 2) pts.push(`${x(t)},${y(p(t))}`);
  return (
    <g className={vis(layer, 7, 7)}>
      <text x={280} y={56} textAnchor="middle" className="mc-big" data-part="selfheat">
        {tr('NTC 自己发的热（R1 = 10 kΩ，3.3 V）', 'NTC self-heating (R1 = 10 kΩ, 3.3 V)')}
      </text>
      <path d={`M${x(0)} ${y(0)} H${x(100) + 12} M${x(0)} ${y(0)} V${y(0.3) - 12}`} className="mc-axis" />
      {[0, 25, 50, 75, 100].map((t) => (
        <text key={t} x={x(t)} y={y(0) + 16} textAnchor="middle" className="mc-tiny">
          {t} °C
        </text>
      ))}
      {[0, 0.1, 0.2, 0.3].map((m) => (
        <text key={m} x={x(0) - 8} y={y(m) + 4} textAnchor="end" className="mc-tiny">
          {m} mW
        </text>
      ))}
      <polyline points={pts.join(' ')} className="mc-curve o" data-part="selfheat" />
      <circle cx={x(25)} cy={y(p(25))} r={5.5} fill="#d17a00" data-part="selfheat" />
      <text x={x(25) + 10} y={y(p(25)) - 8} className="mc-lbl cur" data-part="selfheat">
        {sub(tr('25 °C：0.27 mW（最大，R_NTC = R1）', '25 °C: 0.27 mW (max, R_NTC = R1)'))}
      </text>
      <text x={x(60)} y={y(0.05)} className="mc-tiny" data-part="selfheat">
        {tr('÷ 1–2 mW/°C → 自热 0.1–0.3 °C', '÷ 1–2 mW/°C → 0.1–0.3 °C too warm')}
      </text>
      {/* LDR speed */}
      <g data-part="speed">
        <text x={90} y={300} className="mc-lbl">
          {tr('LDR 很慢：', 'LDR is slow:')}
        </text>
        <path d="M90 390 H170 V320 H330 V390 H490" className="mc-w acc thin" />
        <path d="M90 388 H170 C 180 330, 200 324, 330 322 C 350 360, 400 384, 490 388" className="mc-curve o" />
        <text x={176} y={316} className="mc-tiny">
          {tr('光照（开灯 / 关灯）', 'light (on / off)')}
        </text>
        <text x={300} y={412} className="mc-tiny">
          {tr('电导（1/R）跟着变：几十到几百 ms', 'conductance (1/R) follows: tens–hundreds of ms')}
        </text>
      </g>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="se-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="mc-ah" />
        </marker>
        <marker id="se-ahy" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#e0a400" />
        </marker>
      </defs>
      <Outside layer={layer} />
      <LdrInside layer={layer} />
      <LdrCurve layer={layer} />
      <NtcInside layer={layer} />
      <Dividers layer={layer} />
      <ChooseR layer={layer} />
      <NtcRead layer={layer} />
      <Limits layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'sensors',
    title: tr('光敏电阻和热敏电阻：会变的电阻怎么变成数字', 'LDR and NTC: turning a changing resistance into a number'),
    subtitle: tr(
      'LDR = Light-Dependent Resistor（光敏电阻），NTC = Negative Temperature Coefficient thermistor（负温度系数热敏电阻）。两者都是“电阻随外界变化”。我们拆开看它们为什么会变、变化规律的公式，再把它们接成分压器送进 ADC，算出固定电阻该取多大、读数怎么换回光照和温度。',
      'LDR = Light-Dependent Resistor, NTC = Negative Temperature Coefficient thermistor. Both are resistors that follow the outside world. We take apart why they change and the formula they follow, wire them as a divider into the ADC, work out the best fixed resistor, and turn the reading back into light and temperature.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'outside',
        short: tr('外形', 'Outside'),
        title: tr('① 外形：两个两只脚、不分极性的电阻', '① Outside: two two-legged resistors with no polarity'),
        body: tr(
          `- [[ldr|光敏电阻 LDR]]（实验 5-5 的 GL5528）：一个 5 mm 的小圆片，透明涂层下面能看到一条弯弯曲曲的橙红色细线——那就是会感光的材料；
- [[ntc|NTC 热敏电阻]]（实验 5-6，10 kΩ，B = 3950）：一个小小的环氧“珠子”，两根细腿。

它们都 **没有正负极**，在电路里就是一个电阻，只不过阻值不是固定的：
- LDR：**越亮电阻越小**；
- NTC：**越热电阻越小**（Negative Temperature Coefficient = 负温度系数）。

单片机不会直接“量电阻”，它只会用 ADC 量电压。所以下面的路线是：先拆开看电阻为什么变 → 写出变化的公式 → 接成分压器把电阻变成电压 → ADC 把电压变成数字 → 固件再把数字换回光照 / 温度。`,
          `- [[ldr|the LDR]] (GL5528, lab 5-5): a 5 mm disc; under its clear coat you can see a wiggly orange-red line — the light-sensitive material;
- [[ntc|the NTC thermistor]] (lab 5-6, 10 kΩ, B = 3950): a tiny epoxy bead on two thin legs.

Neither has **polarity**; in a circuit each is just a resistor whose value isn't fixed:
- LDR: **brighter → lower resistance**;
- NTC: **hotter → lower resistance** (Negative Temperature Coefficient).

A microcontroller can't measure resistance directly — its ADC measures voltage. So the route is: take them apart to see why the resistance changes → write the formula → wire a divider to turn resistance into voltage → the ADC turns voltage into a number → firmware turns the number back into light / temperature.`,
        ),
        table: {
          head: ['', tr('LDR（GL5528）', 'LDR (GL5528)'), tr('NTC（10 kΩ B3950）', 'NTC (10 kΩ B3950)')],
          rows: [
            [tr('感受', 'senses'), tr('光照（lux）', 'light (lux)'), tr('温度（°C）', 'temperature (°C)')],
            [tr('材料', 'material'), tr('硫化镉 CdS 薄膜', 'cadmium sulphide (CdS) film'), tr('Mn / Ni / Co 氧化物陶瓷', 'Mn / Ni / Co oxide ceramic')],
            [tr('规律', 'law'), '$R = 15 kΩ·(\\frac{lux}{10})^{-0.7}$', '$R = R_0·e^{B(\\frac{1}{T} - \\frac{1}{T_0})}$'],
            [tr('范围', 'range'), tr('100 Ω（强光）… 1 MΩ（全黑）', '100 Ω (bright) … 1 MΩ (dark)'), tr('0 °C 33.6 kΩ … 80 °C 1.27 kΩ', '33.6 kΩ at 0 °C … 1.27 kΩ at 80 °C')],
            [tr('速度', 'speed'), tr('慢：几十–几百 ms', 'slow: tens–hundreds of ms'), tr('取决于珠子的热容：秒级', 'set by the bead’s heat capacity: seconds')],
            [tr('实验', 'lab'), tr('5-5（Blue Pill PA0）', '5-5 (Blue Pill PA0)'), tr('5-6（ESP32 GPIO32）', '5-6 (ESP32 GPIO32)')],
          ],
          parts: [null, null, null, null, null, null],
        },
      },
      {
        id: 'ldr-inside',
        short: tr('LDR 内部', 'Inside the LDR'),
        title: tr('② LDR 内部：两把梳子中间夹一条之字形 CdS', '② Inside the LDR: a zig-zag of CdS between two combs'),
        body: tr(
          `放大看那条橙线：瓷片上镀了两块 **梳子形** 的金属电极 [[elA|电极 1]] 和 [[elB|电极 2]]，梳齿互相插在一起，它们之间留下的那条弯来弯去的缝里是 [[cds|硫化镉 CdS]]——一种半导体。

**为什么光能让电阻变小**：CdS 的禁带宽度约 2.4 eV。黑暗中几乎没有自由载流子，电阻很大（≈ 1 MΩ）。[[photon|光子]] 能量够大时，把价带里的电子打到导带，产生 [[carriers|电子–空穴对]]——载流子越多，电导越大。光越强，产生的载流子越多，电阻越小。

**为什么要做成之字形**：一条导体的电阻是
$$R = ρ·\\frac{L}{W·t}$$
这里电流是“横着”穿过缝的：路程 L = [[gap|缝的宽度]]（很窄），截面宽 W = 缝的总长度（弯来弯去，很长）。之字形让 L 很小、W 很大，CdS 本身电阻率很高也能得到 kΩ 量级的电阻，而且整个缝都对着光。`,
          `Look closely at the orange line: two **comb-shaped** metal electrodes, [[elA|electrode 1]] and [[elB|electrode 2]], are plated on a ceramic disc with their fingers interleaved; the wiggly gap between them is filled with [[cds|cadmium sulphide (CdS)]], a semiconductor.

**Why light lowers the resistance**: CdS has a band gap of about 2.4 eV. In the dark there are almost no free carriers and the resistance is huge (≈ 1 MΩ). A [[photon|photon]] with enough energy lifts an electron from the valence band to the conduction band, creating an [[carriers|electron–hole pair]] — more carriers, more conductance. More light, more carriers, less resistance.

**Why the zig-zag**: a conductor's resistance is
$$R = ρ·\\frac{L}{W·t}$$
Here the current crosses the gap sideways: the path length L = [[gap|the gap width]] (narrow), and the width W = the total length of the gap (it snakes back and forth — long). The zig-zag makes L tiny and W huge, so a high-resistivity material still gives kΩ, and the whole gap faces the light.`,
        ),
        formulas: [
          { tex: 'R = ρ·\\frac{L}{W·t}', note: tr('L = 缝宽（短），W = 缝的总长（长），t = 膜厚', 'L = gap width (short), W = total gap length (long), t = film thickness') },
        ],
      },
      {
        id: 'ldr-curve',
        short: tr('LDR 曲线', 'LDR curve'),
        title: tr('③ LDR 的规律：对数坐标下是一条直线', '③ The LDR law: a straight line on log–log axes'),
        body: tr(
          `把电阻对照度画在 **两个对数轴** 上，GL5528 是一条直线（仿真模型，和实验 5-5 一致）：
$$R_{LDR} = 15 kΩ·(\\frac{lux}{10})^{-0.7}$$
两边取对数：$log R = log 15 k - 0.7·log\\frac{lux}{10}$——斜率 −0.7 的直线。含义：
- 光照 ×10 → 电阻 ÷ $10^{0.7}$ ≈ [[slope|÷5]]；
- 10 lux 时 15 kΩ（这就是 15 kΩ 这个数的来历）。

代入四个测试点：`,
          `Plot resistance against illuminance on **two log axes** and the GL5528 is a straight line (the simulator's model, as in lab 5-5):
$$R_{LDR} = 15 kΩ·(\\frac{lux}{10})^{-0.7}$$
Take logs: $log R = log 15 k - 0.7·log\\frac{lux}{10}$ — a straight line of slope −0.7. Meaning:
- light ×10 → resistance ÷ $10^{0.7}$ ≈ [[slope|÷5]];
- 15 kΩ at 10 lux (that is where the 15 kΩ comes from).

At the four test points:`,
        ),
        table: {
          head: [tr('场景', 'Scene'), tr('照度', 'Illuminance'), '$R_{LDR}$'],
          rows: [
            [tr('很暗（月光）', 'very dark (moonlight)'), '1 lux', '$15 k × 10^{0.7}$ ≈ 75 kΩ'],
            [tr('昏暗', 'dim'), '10 lux', '15 kΩ'],
            [tr('室内', 'indoors'), '100 lux', '15 k ÷ 5 ≈ 3.0 kΩ'],
            [tr('窗边 / 阴天户外', 'by a window / overcast'), '1000 lux', '≈ 600 Ω'],
          ],
          parts: ['lux1', 'lux10', 'lux100', 'lux1000'],
        },
        formulas: [{ tex: 'R_{LDR} = 15 kΩ·(\\frac{lux}{10})^{-0.7}', note: tr('仿真模型（夹在 100 Ω … 1 MΩ）', 'simulator model (clamped to 100 Ω … 1 MΩ)') }],
      },
      {
        id: 'ntc',
        short: 'NTC',
        title: tr('④ NTC 内部和 B 方程：越热电阻越小', '④ Inside the NTC and the B equation: hotter, lower'),
        body: tr(
          `NTC 的 [[bead|珠子]] 是锰、镍、钴等金属氧化物烧结成的陶瓷半导体，两根 [[leads|引线]] 埋在里面，外面包一层环氧或玻璃。

**为什么越热电阻越小**：和金属相反。半导体里的载流子要靠热能“激发”出来，温度越高，激发出的载流子按指数增加，电阻按指数下降。描述它的是 **B 参数方程**（T 用开尔文）：
$$R(T) = R_0·e^{B(\\frac{1}{T} - \\frac{1}{T_0})}$$
$R_0$ = 10 kΩ 是 $T_0$ = 25 °C = 298.15 K 时的阻值，B = 3950 K 描述它有多“陡”。

**一步步算 50 °C**：
1. T = 50 + 273.15 = 323.15 K；
2. $\\frac{1}{T} - \\frac{1}{T_0} = 0.0030945 - 0.0033540 = -0.0002595$ /K；
3. 乘 B：3950 × (−0.0002595) = −1.025；
4. $R = 10 kΩ × e^{-1.025}$ = 10 kΩ × 0.359 = [[t50|3.59 kΩ]]。

同理 [[t0|0 °C 是 33.6 kΩ]]，[[t80|80 °C 是 1.27 kΩ]]——[[ntcline|曲线]] 明显不是直线：低温段很陡，高温段很平。`,
          `The NTC [[bead|bead]] is a ceramic semiconductor sintered from manganese, nickel and cobalt oxides, with two [[leads|lead wires]] embedded and an epoxy or glass coat.

**Why hotter means lower resistance**: the opposite of a metal. In a semiconductor the carriers have to be "excited" by heat; their number grows exponentially with temperature, so the resistance falls exponentially. The **B-parameter equation** (T in kelvin):
$$R(T) = R_0·e^{B(\\frac{1}{T} - \\frac{1}{T_0})}$$
$R_0$ = 10 kΩ is the value at $T_0$ = 25 °C = 298.15 K, and B = 3950 K says how steep it is.

**Step by step at 50 °C**:
1. T = 50 + 273.15 = 323.15 K;
2. $\\frac{1}{T} - \\frac{1}{T_0} = 0.0030945 - 0.0033540 = -0.0002595$ /K;
3. times B: 3950 × (−0.0002595) = −1.025;
4. $R = 10 kΩ × e^{-1.025}$ = 10 kΩ × 0.359 = [[t50|3.59 kΩ]].

Likewise [[t0|33.6 kΩ at 0 °C]] and [[t80|1.27 kΩ at 80 °C]] — the [[ntcline|curve]] is clearly not straight: steep when cold, flat when hot.`,
        ),
        table: {
          head: ['T', 'T (K)', '$\\frac{1}{T} - \\frac{1}{T_0}$', '$R_{NTC}$'],
          rows: [
            ['0 °C', '273.15', '+0.0003070', '33.6 kΩ'],
            ['25 °C', '298.15', '0', '10.0 kΩ'],
            ['50 °C', '323.15', '−0.0002595', '3.59 kΩ'],
            ['80 °C', '353.15', '−0.0005222', '1.27 kΩ'],
          ],
          parts: ['t0', 't25', 't50', 't80'],
        },
        formulas: [{ tex: 'R(T) = R_0·e^{B(\\frac{1}{T} - \\frac{1}{T_0})}', note: tr('R₀ = 10 kΩ，T₀ = 298.15 K，B = 3950 K', 'R₀ = 10 kΩ, T₀ = 298.15 K, B = 3950 K') }],
        calcs: ['ntc-beta'],
      },
      {
        id: 'divider',
        short: tr('分压读数', 'Divider'),
        title: tr('⑤ 接成分压器：电阻 → 电压 → 数字', '⑤ As a divider: resistance → voltage → number'),
        body: tr(
          `ADC 只量电压，所以给传感器串一个固定电阻 R1，接成 **分压器**（voltage divider），中间结点送进 ADC。ADC 输入几乎不取电流，所以就是最简单的无负载分压。

**实验 5-5**（Blue Pill）：3V3 → [[ldr|LDR]] → [[vlight|VLIGHT]] → [[r-ldr|R1 = 6.8 kΩ]] → GND，VLIGHT 接 [[adc1|PA0]]：
$$V = 3.3·\\frac{R_1}{R_1 + R_{LDR}}$$
LDR 在上面：越亮 → $R_{LDR}$ 越小 → 电压越高。

**实验 5-6**（ESP32）：3V3 → [[r-ntc|R1 = 10 kΩ]] → [[vtemp|VTEMP]] → [[ntc|NTC]] → GND，VTEMP 接 [[adc2|GPIO32]]：
$$V = 3.3·\\frac{R_{NTC}}{R_1 + R_{NTC}}$$
NTC 在下面：越热 → 电压越低。

两种接法交换上下位置，规律就反过来——固件里“亮 / 暗”“热 / 冷”的判断方向必须和接线一致。

**比例测量（ratiometric）**：分压器的顶端接 ADC 的参考电压（3V3），读数 $\\frac{V}{3.3} × 4095 = \\frac{R_1}{R_1 + R} × 4095$ 里 3.3 被约掉了——3V3 有点漂也不影响结果。`,
          `The ADC only measures voltage, so put a fixed resistor R1 in series with the sensor to form a **voltage divider** and feed the middle node to the ADC. The ADC input takes almost no current, so it is the simplest unloaded divider.

**Lab 5-5** (Blue Pill): 3V3 → [[ldr|LDR]] → [[vlight|VLIGHT]] → [[r-ldr|R1 = 6.8 kΩ]] → GND, VLIGHT to [[adc1|PA0]]:
$$V = 3.3·\\frac{R_1}{R_1 + R_{LDR}}$$
LDR on top: brighter → smaller $R_{LDR}$ → higher voltage.

**Lab 5-6** (ESP32): 3V3 → [[r-ntc|R1 = 10 kΩ]] → [[vtemp|VTEMP]] → [[ntc|NTC]] → GND, VTEMP to [[adc2|GPIO32]]:
$$V = 3.3·\\frac{R_{NTC}}{R_1 + R_{NTC}}$$
NTC below: hotter → lower voltage.

Swap top and bottom and the direction reverses — the firmware's bright/dark or hot/cold test must match the wiring.

**Ratiometric measurement**: the top of the divider is the ADC's reference (3V3), so in the reading $\\frac{V}{3.3} × 4095 = \\frac{R_1}{R_1 + R} × 4095$ the 3.3 cancels — a slightly drifting 3V3 doesn't matter.`,
        ),
        table: {
          head: [
            tr('实验 5-5（LDR，6.8 kΩ）', 'Lab 5-5 (LDR, 6.8 kΩ)'),
            tr('电压', 'Voltage'),
            tr('读数', 'Code'),
            tr('实验 5-6（NTC，10 kΩ）', 'Lab 5-6 (NTC, 10 kΩ)'),
            tr('电压', 'Voltage'),
            tr('读数', 'Code'),
          ],
          rows: [
            ['1 lux', '0.274 V', '340', '0 °C', '2.541 V', '3154'],
            ['10 lux', '1.029 V', '1277', '25 °C', '1.649 V', '2046'],
            ['100 lux', '2.291 V', '2843', '50 °C', '0.871 V', '1081'],
            ['1000 lux', '3.033 V', '3763', '80 °C', '0.372 V', '461'],
          ],
          parts: ['vlight', 'vlight', 'vtemp', 'vtemp'],
        },
        formulas: [
          { tex: 'code = round(\\frac{R_{bottom}}{R_{top} + R_{bottom}} × 4095)', note: tr('比例测量：与 3V3 的准确值无关', 'ratiometric: independent of the exact 3V3') },
        ],
        calcs: ['adc-divider', 'voltage-divider', 'adc-code'],
      },
      {
        id: 'choose',
        short: tr('选 R1', 'Choosing R1'),
        title: tr('⑥ 固定电阻取多大：R1 = 传感器在量程中间的电阻', '⑥ How big a fixed resistor: R1 = the sensor’s value mid-range'),
        body: tr(
          `R1 取错了，分压器会把有用的变化“挤扁”：
- [[r100k|R1 = 100 kΩ]]：1/10/100/1000 lux 得到 1.88 / 2.87 / 3.20 / 3.28 V——亮的一端全挤在 3.3 V 附近，100 lux 和 1000 lux 只差 0.08 V；
- [[r1k|R1 = 1 kΩ]]：0.04 / 0.21 / 0.83 / 2.07 V——暗的一端全挤在 0 V；
- [[r6k8|R1 = 6.8 kΩ]]：0.27 / 1.03 / 2.29 / 3.03 V，每十倍光照差 0.9–1.6 V，三个十倍都分得清。

**推导**：传感器电阻按比例变（LDR 每十倍光照 ÷5，NTC 是指数），所以要看电压对 $ln R$ 的灵敏度。设传感器在上，$V = V_{cc}\\frac{R_1}{R_1 + R}$：
$$\\frac{dV}{d(ln R)} = R·\\frac{dV}{dR} = -V_{cc}·\\frac{R_1·R}{(R_1 + R)^{2}}$$
令 $x = \\frac{R_1}{R}$，大小是 $V_{cc}\\frac{x}{(1 + x)^{2}}$，在 **x = 1，即 R1 = R** 时最大，等于 $\\frac{V_{cc}}{4}$——此时 V 正好是 $\\frac{V_{cc}}{2}$，[[sweet|曲线最陡]] 的地方。

**规则**：R1 = 你最关心的那一点的传感器电阻；要覆盖一个范围，取两端电阻的 **几何平均**：
$$R_1 = \\sqrt{R_{min}·R_{max}} = \\sqrt{75 kΩ × 0.6 kΩ} ≈ 6.7 kΩ → 6.8 kΩ$$
NTC 同理：R1 = $R_{25}$ = 10 kΩ 把最灵敏点放在室温，适合 0–50 °C；要测 100 °C 左右的 3D 打印机热床，就用 100 °C 时的阻值（≈ 0.7 kΩ）附近的 680 Ω–1 kΩ。`,
          `Pick the wrong R1 and the divider squashes the useful change:
- [[r100k|R1 = 100 kΩ]]: 1/10/100/1000 lux give 1.88 / 2.87 / 3.20 / 3.28 V — the bright end is crammed near 3.3 V; 100 and 1000 lux differ by only 0.08 V;
- [[r1k|R1 = 1 kΩ]]: 0.04 / 0.21 / 0.83 / 2.07 V — the dark end is crammed near 0 V;
- [[r6k8|R1 = 6.8 kΩ]]: 0.27 / 1.03 / 2.29 / 3.03 V, 0.9–1.6 V per decade — all three decades clearly resolved.

**Derivation**: sensor resistances change by ratios (the LDR ÷5 per decade of light, the NTC exponentially), so what matters is the voltage's sensitivity to $ln R$. With the sensor on top, $V = V_{cc}\\frac{R_1}{R_1 + R}$:
$$\\frac{dV}{d(ln R)} = R·\\frac{dV}{dR} = -V_{cc}·\\frac{R_1·R}{(R_1 + R)^{2}}$$
With $x = \\frac{R_1}{R}$ its size is $V_{cc}\\frac{x}{(1 + x)^{2}}$, largest at **x = 1, i.e. R1 = R**, where it equals $\\frac{V_{cc}}{4}$ — and V is exactly $\\frac{V_{cc}}{2}$, the [[sweet|steepest point]] of the curve.

**Rule**: R1 = the sensor's resistance at the point you care most about; to cover a range, take the **geometric mean** of the two ends:
$$R_1 = \\sqrt{R_{min}·R_{max}} = \\sqrt{75 kΩ × 0.6 kΩ} ≈ 6.7 kΩ → 6.8 kΩ$$
The NTC likewise: R1 = $R_{25}$ = 10 kΩ puts the sweet spot at room temperature, good for 0–50 °C; for a 3D printer bed around 100 °C use the value there (≈ 0.7 kΩ), i.e. 680 Ω–1 kΩ.`,
        ),
        table: {
          head: ['R1', '1 lux', '10 lux', '100 lux', '1000 lux', tr('评价', 'Verdict')],
          rows: [
            ['1 kΩ', '0.04 V', '0.21 V', '0.83 V', '2.07 V', tr('暗端挤在 0 V', 'dark end squashed')],
            ['6.8 kΩ', '0.27 V', '1.03 V', '2.29 V', '3.03 V', tr('最好：几何平均', 'best: geometric mean')],
            ['100 kΩ', '1.88 V', '2.87 V', '3.20 V', '3.28 V', tr('亮端挤在 3.3 V', 'bright end squashed')],
          ],
          parts: ['r1k', 'r6k8', 'r100k'],
        },
        formulas: [
          {
            tex: tr('\\frac{dV}{d(ln R)} 最大 ⇔ R_1 = R', '\\frac{dV}{d(ln R)} is largest ⇔ R_1 = R'),
            note: tr('最大值 = Vcc / 4，此时 V = Vcc / 2', 'maximum = Vcc / 4, where V = Vcc / 2'),
          },
          { tex: 'R_1 = \\sqrt{R_{min}·R_{max}}', note: tr('覆盖一个范围时', 'to cover a range') },
        ],
        calcs: ['adc-divider', 'voltage-divider'],
      },
      {
        id: 'readout',
        short: tr('换回温度', 'Back to °C'),
        title: tr('⑦ 从读数换回温度，以及为什么不是直线', '⑦ From the code back to temperature, and why it isn’t a straight line'),
        body: tr(
          `固件拿到的只是一个 0–4095 的数，要倒着走三步（实验 5-6）：
1. **读数 → 电阻**：分压公式反过来（NTC 在下）：
$$R_{NTC} = R_1·\\frac{raw}{4095 - raw}$$
2. **电阻 → 温度**：B 方程取对数解出 T：
$$\\frac{1}{T} = \\frac{1}{T_0} + \\frac{1}{B}ln\\frac{R_{NTC}}{R_0}$$
3. **开尔文 → 摄氏**：减 273.15。

[[firmware|例]]：raw = 1081 → $R_{NTC}$ = 10 k × 1081 / 3014 ≈ 3.59 kΩ → ln 0.359 = −1.025 → $\\frac{1}{T}$ = 0.003354 − 0.000260 = 0.003094 → T ≈ 323.2 K = **50.0 °C**。

**非线性**：[[codeline|读数–温度曲线]] 不是直线。相同的 25 °C 间隔：
- 0 → 25 °C 降 1108 码（约 44 码/°C）；
- 25 → 50 °C 降 965 码（约 39 码/°C）；
- 50 → 80 °C 只降 620 码（约 21 码/°C）。

所以 [[straight|用直线插值]] 会在中间差好几度；一个码在 25 °C 附近代表 0.025 °C，在 80 °C 附近是 0.05 °C。要 ±0.1 °C 的精度，用三项的 Steinhart–Hart 方程 $\\frac{1}{T} = A + Bln R + C(ln R)^{3}$，按厂家的 R–T 表拟合。`,
          `The firmware only gets a number 0–4095 and has to walk back three steps (lab 5-6):
1. **code → resistance**: the divider formula inverted (NTC at the bottom):
$$R_{NTC} = R_1·\\frac{raw}{4095 - raw}$$
2. **resistance → temperature**: take logs of the B equation and solve for T:
$$\\frac{1}{T} = \\frac{1}{T_0} + \\frac{1}{B}ln\\frac{R_{NTC}}{R_0}$$
3. **kelvin → Celsius**: subtract 273.15.

[[firmware|Example]]: raw = 1081 → $R_{NTC}$ = 10 k × 1081 / 3014 ≈ 3.59 kΩ → ln 0.359 = −1.025 → $\\frac{1}{T}$ = 0.003354 − 0.000260 = 0.003094 → T ≈ 323.2 K = **50.0 °C**.

**Non-linearity**: the [[codeline|code–temperature curve]] is not straight. Equal 25 °C steps give:
- 0 → 25 °C: −1108 counts (about 44 per °C);
- 25 → 50 °C: −965 counts (about 39 per °C);
- 50 → 80 °C: only −620 counts (about 21 per °C).

So [[straight|a straight-line fit]] is several degrees off in the middle; one count is 0.025 °C near 25 °C but 0.05 °C near 80 °C. For ±0.1 °C use the three-term Steinhart–Hart equation $\\frac{1}{T} = A + Bln R + C(ln R)^{3}$, fitted to the maker's R–T table.`,
        ),
        table: {
          head: ['T', '$R_{NTC}$', 'V', tr('读数', 'Code'), tr('每 °C 几个码', 'Counts per °C')],
          rows: [
            ['0 °C', '33.6 kΩ', '2.541 V', '3154', tr('≈ 44（0–25 °C）', '≈ 44 (0–25 °C)')],
            ['25 °C', '10.0 kΩ', '1.649 V', '2046', tr('≈ 39（25–50 °C）', '≈ 39 (25–50 °C)')],
            ['50 °C', '3.59 kΩ', '0.871 V', '1081', tr('≈ 21（50–80 °C）', '≈ 21 (50–80 °C)')],
            ['80 °C', '1.27 kΩ', '0.372 V', '461', '—'],
          ],
          parts: ['c0', 'c25', 'c50', 'c80'],
        },
        formulas: [
          { tex: 'R_{NTC} = R_1·\\frac{raw}{4095 - raw}', note: tr('NTC 在下的分压器反算', 'inverse of the divider, NTC at the bottom') },
          { tex: '\\frac{1}{T} = \\frac{1}{T_0} + \\frac{1}{B}ln\\frac{R_{NTC}}{R_0}', note: tr('B 方程解出 T（开尔文）', 'the B equation solved for T (kelvin)') },
        ],
        calcs: ['ntc-beta', 'adc-code'],
      },
      {
        id: 'limits',
        short: tr('局限', 'Limits'),
        title: tr('⑧ 局限：自热、速度、个体差异', '⑧ Limits: self-heating, speed, part-to-part spread'),
        body: tr(
          `**NTC 自热**：测量电流流过 NTC 会让它自己发热，测到的温度偏高。NTC 上的功率
$$P = \\frac{V_{NTC}^{2}}{R_{NTC}}$$
在 $R_{NTC}$ = R1 时最大：$\\frac{1.65^{2}}{10 kΩ}$ ≈ [[selfheat|0.27 mW]]（25 °C，电流 165 µA）。小珠子 NTC 的耗散常数约 1–2 mW/°C，所以自热 0.1–0.3 °C。要更准：用更大的阻值（100 kΩ NTC + 100 kΩ），或者只在测量时给分压器上电。

**LDR 很慢**：光照突变后，[[speed|电阻要几十到几百 ms 才跟上]]（变暗时更慢），不适合测快速闪烁的光。做“天黑开灯”要加 **回差**（两个阈值），否则在阈值附近灯会闪。

**个体差异**：LDR 同型号之间 ±50 % 很常见，还随温度漂移——适合判断亮 / 暗、粗略亮度；要真实 lux 用数字传感器（BH1750、VEML7700）。NTC 电阻公差 ±1–5 %、B 值约 ±1 %，要算进误差预算。CdS 含镉，受 RoHS 限制，新设计多用光电二极管 / 光电三极管。

**接线**：STM32 的模拟引脚（PA0–PA7、PB0、PB1）**不耐 5 V**，分压器顶端只能接 3V3；ADC 引脚到 GND 并一个 100 nF 降噪（NTC 分压器的源阻抗 R1 ∥ $R_{NTC}$ 约 5 kΩ）。`,
          `**NTC self-heating**: the measuring current warms the NTC itself, so it reads high. The power in the NTC,
$$P = \\frac{V_{NTC}^{2}}{R_{NTC}}$$
peaks when $R_{NTC}$ = R1: $\\frac{1.65^{2}}{10 kΩ}$ ≈ [[selfheat|0.27 mW]] (25 °C, 165 µA). A small bead has a dissipation constant of about 1–2 mW/°C, so it warms by 0.1–0.3 °C. For better accuracy use higher values (a 100 kΩ NTC with 100 kΩ) or power the divider only while measuring.

**The LDR is slow**: after a step in light [[speed|its resistance takes tens to hundreds of ms to follow]] (slower going dark) — useless for fast flicker. For "lights on at dusk" add **hysteresis** (two thresholds) or the lamp flickers at the threshold.

**Spread**: LDRs of one type differ by ±50 % and drift with temperature — fine for bright/dark or rough brightness; for real lux use a digital sensor (BH1750, VEML7700). NTCs have ±1–5 % resistance tolerance and about ±1 % on B — put both in the error budget. CdS contains cadmium and is restricted by RoHS; new designs use photodiodes / phototransistors.

**Wiring**: STM32 analog pins (PA0–PA7, PB0, PB1) are **not 5 V tolerant** — feed the divider from 3V3 only; add 100 nF from the ADC pin to GND against noise (the NTC divider's source impedance R1 ∥ $R_{NTC}$ is about 5 kΩ).`,
        ),
        table: {
          head: [tr('问题', 'Issue'), 'LDR', 'NTC', tr('对策', 'Remedy')],
          rows: [
            [tr('速度', 'speed'), tr('几十–几百 ms', 'tens–hundreds of ms'), tr('秒级（热容）', 'seconds (heat capacity)'), tr('软件滤波，回差', 'filtering, hysteresis')],
            [tr('个体差异', 'spread'), '±50 %', tr('R ±1–5 %，B ±1 %', 'R ±1–5 %, B ±1 %'), tr('校准 / 用数字传感器', 'calibrate / digital sensor')],
            [
              tr('自热', 'self-heating'),
              tr('可忽略', 'negligible'),
              tr('≤ 0.27 mW → 0.1–0.3 °C', '≤ 0.27 mW → 0.1–0.3 °C'),
              tr('大阻值，只在测量时上电', 'higher values, power only to measure'),
            ],
            [tr('非线性', 'non-linearity'), tr('幂律', 'power law'), tr('指数', 'exponential'), tr('用公式，不要直线', 'use the formula, not a line')],
          ],
          parts: ['speed', null, 'selfheat', null],
        },
        formulas: [{ tex: 'P_{NTC} = \\frac{V_{NTC}^{2}}{R_{NTC}} ≤ \\frac{V_{cc}^{2}}{4 R_1} = 0.27 mW', note: tr('R_NTC = R1 时最大', 'largest when R_NTC = R1') }],
      },
    ],
    recap: tr(
      'LDR：CdS 被光激发出载流子，$R = 15 kΩ·(\\frac{lux}{10})^{-0.7}$；NTC：氧化物陶瓷被热激发，$R = R_0·e^{B(\\frac{1}{T} - \\frac{1}{T_0})}$。两者都接成分压器给 ADC，R1 取传感器在关心范围中间（几何平均）的阻值，读数用分压公式和 B 方程倒推回光照 / 温度。',
      'LDR: light frees carriers in CdS, $R = 15 kΩ·(\\frac{lux}{10})^{-0.7}$; NTC: heat frees carriers in an oxide ceramic, $R = R_0·e^{B(\\frac{1}{T} - \\frac{1}{T_0})}$. Both go into the ADC through a divider with R1 = the sensor’s value mid-range (geometric mean), and the code is turned back into light / temperature with the divider formula and the B equation.',
    ),
  };
}
