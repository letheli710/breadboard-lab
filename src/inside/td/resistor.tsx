// Teardown: the axial resistor. Outside (colour bands) → reading the colour code (470 Ω, 10 kΩ)
// → X-ray (ceramic core, carbon / metal film, laser spiral cut, end caps) → why the spiral sets R
// (R = ρL/A with numbers) → Ohm's law as a U–I line → power and heating (1/4 W) → tolerance,
// standard values and the parasitics a real resistor carries.

import './passives.css';
import { tr } from '../../core/i18n';
import { sub } from '../TeardownView';
import type { Teardown } from '../types';

const show = (c: boolean) => (c ? 'td-show' : 'td-hide');

const BAND: Record<string, string> = {
  black: '#1b1b1b',
  brown: '#7b4a24',
  red: '#d62828',
  orange: '#f08a24',
  yellow: '#f5c518',
  green: '#2a9d4b',
  blue: '#2b59c3',
  violet: '#7a3fc0',
  grey: '#8d8d8d',
  white: '#f7f7f7',
  gold: '#c9a227',
  silver: '#c0c0c0',
};
const DIGITS = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'];

/** an axial resistor body (dog-bone shape) with four bands, centred on y = cy */
function Body({
  x,
  cy,
  w,
  h,
  bands,
  id,
  faded = false,
  parts = ['b1', 'b2', 'mult', 'tol'],
}: {
  x: number;
  cy: number;
  w: number;
  h: number;
  bands: string[];
  id: string;
  faded?: boolean;
  parts?: string[];
}) {
  const r = h / 2;
  const neck = h * 0.38;
  const d = `M${x + r} ${cy - r} C ${x + r * 2.2} ${cy - r}, ${x + r * 2.2} ${cy - neck}, ${x + r * 2.9} ${cy - neck}
    L ${x + w - r * 2.9} ${cy - neck} C ${x + w - r * 2.2} ${cy - neck}, ${x + w - r * 2.2} ${cy - r}, ${x + w - r} ${cy - r}
    A ${r} ${r} 0 0 1 ${x + w - r} ${cy + r} C ${x + w - r * 2.2} ${cy + r}, ${x + w - r * 2.2} ${cy + neck}, ${x + w - r * 2.9} ${cy + neck}
    L ${x + r * 2.9} ${cy + neck} C ${x + r * 2.2} ${cy + neck}, ${x + r * 2.2} ${cy + r}, ${x + r} ${cy + r} A ${r} ${r} 0 0 1 ${x + r} ${cy - r} Z`;
  const bx = [0.19, 0.33, 0.46, 0.83].map((f) => x + f * w);
  const bw = w * 0.065;
  return (
    <g style={{ opacity: faded ? 0.16 : 1, transition: 'opacity .45s' }}>
      <defs>
        <clipPath id={`rs-clip-${id}`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill="#e6cf9f" stroke="#8a6d3b" strokeWidth={1.6} data-part="body" />
      <g clipPath={`url(#rs-clip-${id})`}>
        {bands.map((c, i) => (
          <rect key={i} x={bx[i] - bw / 2} y={cy - r - 2} width={bw} height={h + 4} fill={BAND[c]} data-part={parts[i]} />
        ))}
        <rect x={x} y={cy - r} width={w} height={h * 0.28} fill="#fff" opacity={0.18} />
      </g>
    </g>
  );
}

function Lead({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke="#9aa0a6" strokeWidth={5} strokeLinecap="round" data-part="lead" />;
}

/** zig-zag resistor symbol between two points */
function Zig({ x1, y1, x2, y2, part, body = 60 }: { x1: number; y1: number; x2: number; y2: number; part?: string; body?: number }) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const a = (L - body) / 2;
  const pts = [`${x1},${y1}`, `${x1 + ux * a},${y1 + uy * a}`];
  for (let k = 1; k <= 6; k++) {
    const t = a + (body * k) / 6.5;
    const s = k % 2 ? 9 : -9;
    pts.push(`${x1 + ux * t - uy * s},${y1 + uy * t + ux * s}`);
  }
  pts.push(`${x1 + ux * (a + body)},${y1 + uy * (a + body)}`, `${x2},${y2}`);
  return <polyline points={pts.join(' ')} className="pv-wire" data-part={part} />;
}

/* ------------------------------------------------------------------ layer groups */

function Outside({ layer }: { layer: number }) {
  const xray = layer === 2;
  const cy = 210;
  return (
    <g className={show(layer === 0 || layer === 2)}>
      <Lead x1={24} x2={150} y={cy} />
      <Lead x1={410} x2={536} y={cy} />
      {/* X-ray internals (drawn under the faded body) */}
      <g className={show(xray)}>
        <rect x={140} y={cy - 40} width={36} height={80} rx={6} fill="#c9ccd1" stroke="#7d8088" data-part="cap" />
        <rect x={384} y={cy - 40} width={36} height={80} rx={6} fill="#c9ccd1" stroke="#7d8088" data-part="cap" />
        <rect x={170} y={cy - 27} width={220} height={54} rx={4} fill="#f4efe6" stroke="#b9b2a3" data-part="core" />
        <rect x={176} y={cy - 27} width={208} height={54} fill="#4b4b4b" data-part="film" />
        <g data-part="cut">
          {Array.from({ length: 11 }, (_, k) => (
            <line key={k} x1={186 + k * 18} y1={cy - 27} x2={200 + k * 18} y2={cy + 27} stroke="#f4efe6" strokeWidth={4} />
          ))}
        </g>
        <path d={`M150 ${cy} L176 ${cy}`} stroke="#9aa0a6" strokeWidth={5} />
        <path d={`M384 ${cy} L410 ${cy}`} stroke="#9aa0a6" strokeWidth={5} />
      </g>
      <Body x={140} cy={cy} w={280} h={84} bands={['yellow', 'violet', 'brown', 'gold']} id="big" faded={xray} />
      <g className={show(layer === 0)}>
        <text x={280} y={300} textAnchor="middle" className="pv-eq">
          {tr('470 Ω ±5%，1/4 W 碳膜电阻', '470 Ω ±5 %, 1/4 W carbon film')}
        </text>
        <text x={280} y={322} textAnchor="middle" className="td-small">
          {tr('实物长约 6 mm、直径约 2.3 mm（图放大了约 45 倍）', 'real size ≈ 6 mm long, 2.3 mm across (drawn ≈ 45× larger)')}
        </text>
        <path d="M200 360 L360 360" className="pv-thin" markerEnd="url(#rs-ah)" />
        <text x={280} y={384} textAnchor="middle" className="td-small">
          {tr('从靠近一端的色环读起（金 / 银环在最后）', 'read from the band nearest an end (gold / silver last)')}
        </text>
      </g>
    </g>
  );
}

function ColourCode({ layer }: { layer: number }) {
  const row = (y: number, bands: string[], digits: string[], result: string, id: string) => (
    <g>
      <Lead x1={30} x2={64} y={y} />
      <Lead x1={236} x2={270} y={y} />
      <Body x={60} cy={y} w={180} h={54} bands={bands} id={id} />
      {[0.19, 0.33, 0.46, 0.83].map((f, i) => (
        <g key={i}>
          <line x1={60 + f * 180} y1={y + 30} x2={60 + f * 180} y2={y + 44} className="pv-thin" />
          <text x={60 + f * 180} y={y + 58} textAnchor="middle" className="pv-lbl">
            {digits[i]}
          </text>
        </g>
      ))}
      <text x={300} y={y - 6} className="pv-eq">
        {result}
      </text>
    </g>
  );
  return (
    <g className={show(layer === 1)}>
      <g data-part="r470">
        {row(110, ['yellow', 'violet', 'brown', 'gold'], ['4', '7', '×10¹', '±5%'], '4 7 × 10 = 470 Ω', 'a')}
        <text x={300} y={118} className="td-small">
          {tr('黄 紫 棕 金 → 470 Ω ±5%', 'yellow violet brown gold')}
        </text>
        <text x={300} y={136} className="td-small">
          {tr('真实值在 446.5 … 493.5 Ω 之间', 'true value 446.5 … 493.5 Ω')}
        </text>
      </g>
      <g data-part="r10k">
        {row(235, ['brown', 'black', 'orange', 'gold'], ['1', '0', '×10³', '±5%'], '1 0 × 1000 = 10 kΩ', 'b')}
        <text x={300} y={243} className="td-small">
          {tr('棕 黑 橙 金 → 10 kΩ ±5%', 'brown black orange gold')}
        </text>
        <text x={300} y={261} className="td-small">
          {tr('真实值在 9.5 … 10.5 kΩ 之间', 'true value 9.5 … 10.5 kΩ')}
        </text>
      </g>
      <g data-part="code">
        <text x={280} y={336} textAnchor="middle" className="pv-lbl">
          {tr('颜色 → 数字', 'colour → digit')}
        </text>
        {[...DIGITS, 'gold', 'silver'].map((c, i) => (
          <g key={c}>
            <rect x={40 + i * 40} y={348} width={36} height={30} rx={4} fill={BAND[c]} stroke="#555" strokeWidth={0.8} />
            <text x={58 + i * 40} y={398} textAnchor="middle" className="pv-lbl">
              {i < 10 ? i : c === 'gold' ? '×0.1' : '×0.01'}
            </text>
            <text x={58 + i * 40} y={414} textAnchor="middle" className="pv-tiny">
              {i < 10 ? `×10${['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'][i]}` : c === 'gold' ? '±5%' : '±10%'}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}

function Spiral({ layer }: { layer: number }) {
  // serpentine = the spiral film unrolled (≈ 150 squares long)
  const rows = 5;
  const sx0 = 250;
  const sx1 = 520;
  const sy0 = 196;
  const dy = 16;
  let d = `M${sx0} ${sy0}`;
  for (let k = 0; k < rows; k++) {
    const y = sy0 + k * dy;
    d += ` L${k % 2 ? sx0 : sx1} ${y}`;
    if (k < rows - 1) d += ` L${k % 2 ? sx0 : sx1} ${y + dy}`;
  }
  return (
    <g className={show(layer === 3)}>
      {/* the tube with a spiral cut */}
      <g data-part="tube">
        <rect x={150} y={62} width={260} height={56} rx={6} fill="#4b4b4b" />
        {Array.from({ length: 12 }, (_, k) => (
          <line key={k} x1={162 + k * 21} y1={62} x2={178 + k * 21} y2={118} stroke="#f4efe6" strokeWidth={4} />
        ))}
        <rect x={130} y={58} width={24} height={64} rx={5} fill="#c9ccd1" stroke="#7d8088" />
        <rect x={406} y={58} width={24} height={64} rx={5} fill="#c9ccd1" stroke="#7d8088" />
      </g>
      <text x={280} y={46} textAnchor="middle" className="td-small">
        {tr('膜是一根管子，激光沿螺旋线切出一道槽', 'the film is a tube; a laser cuts a helical groove')}
      </text>
      <path d="M280 128 L280 158" className="pv-thin" markerEnd="url(#rs-ah)" />
      <text x={288} y={150} className="td-small">
        {tr('把膜“展开”', 'unroll the film')}
      </text>

      {/* uncut film: a short, wide sheet */}
      <g data-part="uncut">
        <rect x={60} y={190} width={60} height={63} fill="#4b4b4b" />
        <path d="M60 268 L120 268" className="pv-thin" markerStart="url(#rs-ah)" markerEnd="url(#rs-ah)" />
        <text x={90} y={284} textAnchor="middle" className="td-small">
          L = 6 mm
        </text>
        <path d="M46 190 L46 253" className="pv-thin" markerStart="url(#rs-ah)" markerEnd="url(#rs-ah)" />
        <text x={40} y={226} textAnchor="end" className="td-small">
          w
        </text>
        <text x={90} y={180} textAnchor="middle" className="pv-lbl">
          {tr('不切：≈ 29 Ω', 'uncut: ≈ 29 Ω')}
        </text>
      </g>
      {/* cut film: a long, narrow strip */}
      <g data-part="strip">
        <path d={d} fill="none" stroke="#4b4b4b" strokeWidth={6} strokeLinejoin="round" />
        <text x={385} y={180} textAnchor="middle" className="pv-lbl">
          {tr('螺旋切后：≈ 4.5 kΩ', 'spiral cut: ≈ 4.5 kΩ')}
        </text>
        <text x={385} y={284} textAnchor="middle" className="td-small">
          {tr('一条长 75 mm、宽 0.5 mm 的窄带', 'a strip 75 mm long, 0.5 mm wide')}
        </text>
      </g>

      {/* R = ρL/A bar */}
      <g data-part="bar">
        <rect x={70} y={330} width={250} height={44} fill="#d9d4c7" stroke="var(--ink)" strokeWidth={1.4} />
        <ellipse cx={320} cy={352} rx={10} ry={22} fill="#bdb6a6" stroke="var(--ink)" strokeWidth={1.4} />
        <ellipse cx={70} cy={352} rx={10} ry={22} fill="#d9d4c7" stroke="var(--ink)" strokeWidth={1.4} />
        <text x={195} y={357} textAnchor="middle" className="pv-lbl">
          ρ
        </text>
        <path d="M70 392 L320 392" className="pv-thin" markerStart="url(#rs-ah)" markerEnd="url(#rs-ah)" />
        <text x={195} y={410} textAnchor="middle" className="td-small">
          {tr('长度 L', 'length L')}
        </text>
        <text x={340} y={340} className="td-small">
          {tr('截面积 A', 'cross-section A')}
        </text>
        <text x={400} y={372} className="pv-eq">
          R = ρ·L / A
        </text>
      </g>
    </g>
  );
}

function Ohm({ layer }: { layer: number }) {
  const ox = 90;
  const oy = 392;
  const X = (u: number) => ox + u * 42;
  const Y = (ma: number) => oy - ma * 10.5;
  return (
    <g className={show(layer === 4)}>
      {/* symbol */}
      <g data-part="sym">
        <line x1={60} y1={78} x2={210} y2={78} className="pv-wire" />
        <Zig x1={210} y1={78} x2={310} y2={78} />
        <line x1={310} y1={78} x2={380} y2={78} className="pv-wire" />
        <circle cx={60} cy={78} r={4} className="pv-term" />
        <circle cx={380} cy={78} r={4} className="pv-term" />
        <text x={260} y={58} textAnchor="middle" className="pv-lbl">
          R
        </text>
        <path d="M110 66 L160 66" className="pv-thin" markerEnd="url(#rs-ah)" data-part="cur" />
        <text x={135} y={58} textAnchor="middle" className="pv-lbl pv-red" data-part="cur">
          I
        </text>
        <path d="M210 108 L310 108" className="pv-thin" markerStart="url(#rs-ah)" />
        <text x={204} y={112} textAnchor="end" className="pv-lbl">
          +
        </text>
        <text x={316} y={112} className="pv-lbl">
          −
        </text>
        <text x={260} y={126} textAnchor="middle" className="pv-lbl pv-blue">
          U
        </text>
        <rect x={430} y={68} width={60} height={20} fill="none" className="pv-wire" />
        <line x1={410} y1={78} x2={430} y2={78} className="pv-wire" />
        <line x1={490} y1={78} x2={510} y2={78} className="pv-wire" />
        <text x={460} y={110} textAnchor="middle" className="td-small">
          {tr('IEC 画法', 'IEC symbol')}
        </text>
      </g>
      {/* U–I graph */}
      <g>
        {[2, 4, 6, 8, 10].map((u) => (
          <g key={u}>
            <line x1={X(u)} y1={Y(0)} x2={X(u)} y2={Y(20)} className="pv-grid" />
            <text x={X(u)} y={oy + 16} textAnchor="middle" className="td-small">
              {u}
            </text>
          </g>
        ))}
        {[5, 10, 15, 20].map((m) => (
          <g key={m}>
            <line x1={X(0)} y1={Y(m)} x2={X(10)} y2={Y(m)} className="pv-grid" />
            <text x={ox - 8} y={Y(m) + 4} textAnchor="end" className="td-small">
              {m}
            </text>
          </g>
        ))}
        <line x1={ox} y1={oy} x2={X(10.6)} y2={oy} className="pv-axis" markerEnd="url(#rs-ah)" />
        <line x1={ox} y1={oy} x2={ox} y2={Y(21.5)} className="pv-axis" markerEnd="url(#rs-ah)" />
        <text x={X(10.6)} y={oy + 18} textAnchor="middle" className="pv-lbl pv-blue">
          U / V
        </text>
        <text x={ox + 8} y={Y(21.3)} className="pv-lbl pv-red">
          I / mA
        </text>
        <line x1={X(0)} y1={Y(0)} x2={X(9.8)} y2={Y(20.85)} className="pv-curve" data-part="l470" />
        <line x1={X(0)} y1={Y(0)} x2={X(10)} y2={Y(10)} className="pv-curve violet" data-part="l1k" />
        <line x1={X(0)} y1={Y(0)} x2={X(10)} y2={Y(1)} className="pv-curve blue" data-part="l10k" />
        <circle cx={X(9)} cy={Y(19.15)} r={5} fill="#e63946" data-part="l470" />
        <line x1={X(9)} y1={Y(19.15)} x2={X(9)} y2={oy} className="pv-dash" />
        <text x={X(9) - 8} y={Y(19.15) - 2} textAnchor="end" className="pv-lbl pv-red" data-part="l470">
          470 Ω: 9 V → 19.1 mA
        </text>
        <text x={X(10) + 4} y={Y(10) + 18} textAnchor="end" className="pv-lbl pv-violet" data-part="l1k">
          1 kΩ
        </text>
        <text x={X(10)} y={Y(1) - 8} textAnchor="end" className="pv-lbl pv-blue" data-part="l10k">
          10 kΩ: 9 V → 0.9 mA
        </text>
      </g>
    </g>
  );
}

function Power({ layer }: { layer: number }) {
  const x0 = 220;
  const sc = 290; // px per watt
  const bars: [string, number][] = [
    [tr('470 Ω · 第 1 课 · 7.0 V', '470 Ω · lesson 1 · 7.0 V'), 0.104],
    [tr('220 Ω · 串联课 · 3.5 V', '220 Ω · series lesson · 3.5 V'), 0.056],
    [tr('470 Ω 直接接 9 V', '470 Ω straight on 9 V'), 0.172],
    [tr('220 Ω 直接接 9 V', '220 Ω straight on 9 V'), 0.368],
    [tr('100 Ω 直接接 9 V', '100 Ω straight on 9 V'), 0.81],
  ];
  return (
    <g className={show(layer === 5)}>
      <g data-part="heat">
        <Lead x1={150} x2={196} y={96} />
        <Lead x1={364} x2={410} y={96} />
        <Body x={190} cy={96} w={180} h={52} bands={['yellow', 'violet', 'brown', 'gold']} id="pw" />
        {[220, 262, 304, 346].map((x) => (
          <path key={x} d={`M${x} 62 q -7 -8 0 -16 q 7 -8 0 -16`} stroke="#f08a24" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        ))}
        <text x={280} y={146} textAnchor="middle" className="td-small">
          {tr('ΔT ≈ P × 250 °C/W：0.10 W → 约热 26 °C', 'ΔT ≈ P × 250 °C/W: 0.10 W → about 26 °C warmer')}
        </text>
      </g>
      <g>
        <text x={280} y={184} textAnchor="middle" className="pv-lbl">
          {tr('功率 P = U²/R，和 1/4 W 额定值比', 'power P = U²/R against the 1/4 W rating')}
        </text>
        {bars.map(([label, p], i) => {
          const y = 206 + i * 40;
          const over = p > 0.25;
          return (
            <g key={i} data-part={over ? 'over' : 'ok'}>
              <text x={x0 - 8} y={y + 15} textAnchor="end" className="td-small">
                {label}
              </text>
              <rect x={x0} y={y} width={p * sc} height={22} rx={3} fill={over ? '#e63946' : '#2a9d4b'} opacity={0.85} />
              <text x={Math.max(x0 + p * sc, x0 + 0.25 * sc) + 8} y={y + 15} className={`pv-lbl ${over ? 'pv-red' : 'pv-green'}`}>
                {p.toFixed(2)} W{over ? ' ✘' : ''}
              </text>
            </g>
          );
        })}
        <g data-part="rating">
          <line x1={x0 + 0.25 * sc} y1={196} x2={x0 + 0.25 * sc} y2={408} stroke="#c62f3b" strokeWidth={2} strokeDasharray="6 4" />
          <text x={x0 + 0.25 * sc} y={424} textAnchor="middle" className="pv-lbl pv-red">
            {tr('额定 0.25 W', 'rated 0.25 W')}
          </text>
        </g>
        <line x1={x0} y1={196} x2={x0} y2={408} className="pv-axis" />
      </g>
    </g>
  );
}

function Limits({ layer }: { layer: number }) {
  const X = (r: number) => 60 + (r - 400) * 3.14;
  const vals: [number, string][] = [
    [430, '#7a3fc0'],
    [470, '#e63946'],
    [510, '#2b59c3'],
  ];
  return (
    <g className={show(layer === 6)}>
      <g data-part="tol">
        <text x={280} y={50} textAnchor="middle" className="pv-lbl">
          {tr('±5% 误差带与 E24 标准值', '±5 % bands and the E24 standard values')}
        </text>
        <line x1={X(400)} y1={130} x2={X(540)} y2={130} className="pv-axis" />
        {vals.map(([r, c], i) => (
          <g key={r}>
            <rect x={X(r * 0.95)} y={82 + i * 12} width={X(r * 1.05) - X(r * 0.95)} height={10} rx={3} fill={c} opacity={0.55} />
            <line x1={X(r)} y1={78} x2={X(r)} y2={136} stroke={c} strokeWidth={2} />
            <text x={X(r)} y={154} textAnchor="middle" className="pv-lbl">
              {r}
            </text>
          </g>
        ))}
        {[400, 420, 440, 460, 480, 500, 520, 540].map((r) => (
          <line key={r} x1={X(r)} y1={126} x2={X(r)} y2={134} className="pv-thin" />
        ))}
        <text x={X(470)} y={176} textAnchor="middle" className="td-small">
          {tr('470 Ω ±5% = 446.5 … 493.5 Ω：相邻值的误差带刚好接上', '470 Ω ±5 % = 446.5 … 493.5 Ω: neighbouring bands just meet')}
        </text>
      </g>
      <g>
        <text x={280} y={226} textAnchor="middle" className="pv-lbl">
          {tr('真实电阻的等效电路', 'equivalent circuit of a real resistor')}
        </text>
        <circle cx={70} cy={330} r={4} className="pv-term" />
        <circle cx={490} cy={330} r={4} className="pv-term" />
        <line x1={74} y1={330} x2={150} y2={330} className="pv-wire" />
        <path d="M150 330 a10 10 0 0 1 20 0 a10 10 0 0 1 20 0 a10 10 0 0 1 20 0 a10 10 0 0 1 20 0" className="pv-wire" data-part="ls" />
        <line x1={230} y1={330} x2={280} y2={330} className="pv-wire" />
        <Zig x1={280} y1={330} x2={400} y2={330} part="rideal" />
        <line x1={400} y1={330} x2={486} y2={330} className="pv-wire" />
        <g data-part="cp">
          <path d="M110 330 L110 270 L270 270 M290 270 L450 270 L450 330" className="pv-wire" />
          <line x1={270} y1={254} x2={270} y2={286} className="pv-wire" />
          <line x1={290} y1={254} x2={290} y2={286} className="pv-wire" />
          <circle cx={110} cy={330} r={3.5} className="pv-dot" />
          <circle cx={450} cy={330} r={3.5} className="pv-dot" />
          <text x={280} y={246} textAnchor="middle" className="pv-lbl pv-violet">
            {sub('C_p ≈ 0.3 pF')}
          </text>
        </g>
        <text x={190} y={360} textAnchor="middle" className="pv-lbl pv-orange" data-part="ls">
          {sub('L_s ≈ 5 nH')}
        </text>
        <text x={340} y={360} textAnchor="middle" className="pv-lbl" data-part="rideal">
          R (1 + α·ΔT)
        </text>
        <text x={280} y={400} textAnchor="middle" className="td-small">
          {sub(tr('1 MHz 时：X_L ≈ 0.03 Ω，X_C ≈ 530 kΩ —— 本课程里都可以忽略', 'at 1 MHz: X_L ≈ 0.03 Ω, X_C ≈ 530 kΩ — negligible in this course'))}
        </text>
      </g>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="rs-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pv-ah" />
        </marker>
      </defs>
      <Outside layer={layer} />
      <ColourCode layer={layer} />
      <Spiral layer={layer} />
      <Ohm layer={layer} />
      <Power layer={layer} />
      <Limits layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'resistor',
    title: tr('电阻 Resistor：一圈碳膜决定的数字', 'The resistor: a number set by a spiral of film'),
    subtitle: tr(
      '从色环读数，到陶瓷棒上的碳膜（carbon film）和激光切出的螺旋，再到 R = ρL/A、欧姆定律的直线、额定功率和误差。看完你就知道“470 Ω”这个数字是怎么做出来的，以及它在什么时候不再可信。',
      'From reading the colour bands, to the carbon film on a ceramic rod and the laser-cut spiral, to R = ρL/A, the straight line of Ohm’s law, the power rating and the tolerance. You will know how "470 Ω" is made, and when to stop trusting it.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'outside',
        short: tr('外形', 'Outside'),
        title: tr('① 外形：两只脚、一段带色环的小棒', '① Outside: two leads and a little rod with coloured bands'),
        body: tr(
          `这是课程里最常见的 **axial resistor（轴向引线电阻）**：一段 [[body|米黄色的小棒]]，两头各伸出一根 [[lead|镀锡铜引线 lead]]。它 **没有极性**（polarity）：两只脚完全一样，怎么插都行。

小棒上印的不是数字，而是 4 条 **colour band（色环）**：
- 前两条 [[b1|第 1 环]]、[[b2|第 2 环]] 是阻值的两位 **有效数字**；
- [[mult|第 3 环]] 是 **倍率**（multiplier），即乘以 10 的几次方；
- 和其他环隔开一点的 [[tol|第 4 环]] 是 **误差**（tolerance），金色 = ±5%。

为什么不直接印数字？电阻是圆柱，印的字转过去就看不见，而且只有几毫米长；色环 **从任何方向都能读**。大小则决定了它能承受的 **功率**：这种 6 mm 长的是 **1/4 W**（0.25 W），后面第 ⑥ 层会算它。`,
          `This is the most common resistor in the course, an **axial resistor**: a little [[body|beige rod]] with a [[lead|tinned copper lead]] at each end. It has **no polarity**: the two leads are identical, plug it in either way.

The rod carries no digits but 4 **colour bands**:
- the first two, [[b1|band 1]] and [[b2|band 2]], are the two **significant digits** of the value;
- [[mult|band 3]] is the **multiplier**, the power of ten;
- [[tol|band 4]], set a little apart, is the **tolerance** — gold = ±5 %.

Why not print digits? A resistor is a cylinder a few millimetres long — printed text would be hidden on the far side. Bands **read from any angle**. The size sets the **power** it can take: this 6 mm one is a **1/4 W** (0.25 W) part, which layer ⑥ calculates with.`,
        ),
        table: {
          head: [tr('部位', 'Part'), tr('是什么', 'What it is'), tr('图上这只（470 Ω）', 'This one (470 Ω)')],
          rows: [
            [tr('第 1 环', 'Band 1'), tr('第一位有效数字', 'first digit'), tr('黄 = 4', 'yellow = 4')],
            [tr('第 2 环', 'Band 2'), tr('第二位有效数字', 'second digit'), tr('紫 = 7', 'violet = 7')],
            [tr('第 3 环', 'Band 3'), tr('倍率 ×10ⁿ', 'multiplier ×10ⁿ'), tr('棕 = ×10¹', 'brown = ×10¹')],
            [tr('第 4 环', 'Band 4'), tr('误差', 'tolerance'), tr('金 = ±5%', 'gold = ±5 %')],
            [tr('引线', 'Leads'), tr('镀锡铜线，无极性', 'tinned copper, no polarity'), tr('插进面包板两条不同的金属条', 'into two different breadboard strips')],
          ],
          parts: ['b1', 'b2', 'mult', 'tol', 'lead'],
        },
        callouts: [
          { part: 'b1', label: tr('第 1 环', 'band 1'), x: 193, y: 172, lx: 120, ly: 118 },
          { part: 'b2', label: tr('第 2 环', 'band 2'), x: 232, y: 178, lx: 232, ly: 112, anchor: 'middle' },
          { part: 'mult', label: tr('倍率', 'multiplier'), x: 269, y: 178, lx: 320, ly: 112, anchor: 'start' },
          { part: 'tol', label: tr('误差（金）', 'tolerance (gold)'), x: 372, y: 172, lx: 430, ly: 130 },
          { part: 'lead', label: tr('引线', 'lead'), x: 500, y: 210, lx: 500, ly: 262, anchor: 'middle' },
        ],
      },
      {
        id: 'bands',
        short: tr('色环', 'Bands'),
        title: tr('② 读色环：470 Ω 和 10 kΩ', '② Reading the bands: 470 Ω and 10 kΩ'),
        body: tr(
          `规则只有一句：**阻值 = (第 1 环)(第 2 环) × 10^(第 3 环)**。每种颜色对应一个数字，见下表和 [[code|图下方的色卡]]。

**例 1**：[[r470|黄 紫 棕 金]]（第 1 课、第 3 课用的那只）
$$R = 47 × 10^{1} = 470 Ω，误差 ±5% → 446.5 … 493.5 Ω$$
**例 2**：[[r10k|棕 黑 橙 金]]（电位器、分压实验里常见）
$$R = 10 × 10^{3} = 10 000 Ω = 10 kΩ，误差 ±5% → 9.5 … 10.5 kΩ$$

**从哪头读？** 金、银环一定在最后；第 1 环更靠近端头。拿不准时就两头都读一遍，读出的值不在标准系列（E12 / E24，见第 ⑦ 层）里的那个方向就是反的。

**蓝色身体、5 条环** 的是 **metal film resistor（金属膜电阻）**：前三条是有效数字，第 4 条是倍率，第 5 条是误差（棕 = ±1%）。例如 470 Ω ±1% = 黄 紫 黑 黑 棕（470 × 10⁰）。

记颜色的顺序：黑棕红橙黄绿蓝紫灰白，正好是彩虹（红→紫）夹在“黑棕”和“灰白”之间。`,
          `One rule: **value = (band 1)(band 2) × 10^(band 3)**. Each colour stands for a digit — see the table and [[code|the colour chart at the bottom]].

**Example 1**: [[r470|yellow violet brown gold]] (the one in lessons 1 and 3)
$$R = 47 × 10^{1} = 470 Ω, tolerance ±5% → 446.5 … 493.5 Ω$$
**Example 2**: [[r10k|brown black orange gold]] (common in the pot and divider labs)
$$R = 10 × 10^{3} = 10 000 Ω = 10 kΩ, tolerance ±5% → 9.5 … 10.5 kΩ$$

**Which end first?** Gold and silver are always last; band 1 sits closer to its end. If unsure, read both ways — the reading that is not a standard value (E12 / E24, layer ⑦) is the backwards one.

A **blue body with 5 bands** is a **metal film resistor**: three digits, then the multiplier, then the tolerance (brown = ±1 %). 470 Ω ±1 % = yellow violet black black brown (470 × 10⁰).

The order black, brown, red, orange, yellow, green, blue, violet, grey, white is the rainbow (red → violet) between "black brown" and "grey white".`,
        ),
        table: {
          head: [tr('颜色', 'Colour'), tr('数字', 'Digit'), tr('倍率', 'Multiplier'), tr('误差', 'Tolerance')],
          rows: [
            [tr('黑', 'black'), '0', '×1', '—'],
            [tr('棕', 'brown'), '1', '×10', '±1%'],
            [tr('红', 'red'), '2', '×100', '±2%'],
            [tr('橙', 'orange'), '3', '×1 k', '—'],
            [tr('黄', 'yellow'), '4', '×10 k', '—'],
            [tr('绿', 'green'), '5', '×100 k', '±0.5%'],
            [tr('蓝', 'blue'), '6', '×1 M', '±0.25%'],
            [tr('紫', 'violet'), '7', '×10 M', '±0.1%'],
            [tr('灰', 'grey'), '8', '—', '—'],
            [tr('白', 'white'), '9', '—', '—'],
            [tr('金', 'gold'), '—', '×0.1', '±5%'],
            [tr('银', 'silver'), '—', '×0.01', '±10%'],
          ],
          parts: ['code', 'code', 'code', 'code', 'code', 'code', 'code', 'code', 'code', 'code', 'code', 'code'],
        },
        formulas: [
          {
            tex: 'R = (d_1 d_2) × 10^{m}',
            note: tr('黄紫棕：47 × 10¹ = 470 Ω；棕黑橙：10 × 10³ = 10 kΩ', 'yellow violet brown: 47 × 10¹ = 470 Ω; brown black orange: 10 × 10³ = 10 kΩ'),
          },
        ],
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('③ X 光：陶瓷棒、一层膜、一道螺旋槽', '③ X-ray: a ceramic rod, a thin film, a spiral groove'),
        body: tr(
          `把那层米黄色的 **epoxy paint（环氧漆）** 变透明，里面只有四样东西：
1. [[core|陶瓷棒 ceramic core]]：绝缘、耐热，只是个“骨架”，电流不走它。
2. [[film|导电膜 film]]：棒外面镀的一层很薄的膜，**电流全部从这层膜里流过**。碳膜电阻（carbon film，米黄色身体）镀的是碳，约 1 µm 厚；金属膜电阻（metal film，蓝色身体）镀的是镍铬合金（NiCr），只有几十 nm 厚。
3. [[cut|螺旋槽 spiral cut]]：工厂用激光沿螺旋线把膜切开，电流只能 **沿着螺旋绕圈** 从一头走到另一头。
4. [[cap|金属端帽 end cap]]：压在两端，把膜和 [[lead|引线]] 连起来。

**阻值就是由这道螺旋决定的**：切得越密、绕的圈越多，电阻越大。生产时一边切一边测，测到 470 Ω 就停——这叫 **laser trimming（激光修调）**。下一层用公式解释为什么。`,
          `Make the beige **epoxy paint** transparent and there are only four things inside:
1. [[core|a ceramic core]]: insulating and heat-proof, just a skeleton; no current flows in it.
2. [[film|a conducting film]] coated on the rod — **all the current flows in this film**. A carbon film resistor (beige body) has about 1 µm of carbon; a metal film resistor (blue body) has a few tens of nm of nickel-chromium (NiCr).
3. [[cut|a spiral cut]]: a laser cuts the film along a helix, so the current has to **wind round and round** from one end to the other.
4. [[cap|metal end caps]] pressed on the ends join the film to the [[lead|leads]].

**The spiral sets the value**: a finer cut with more turns means more resistance. The factory measures while it cuts and stops at 470 Ω — **laser trimming**. The next layer shows why with a formula.`,
        ),
        callouts: [
          { part: 'core', label: tr('陶瓷棒（绝缘）', 'ceramic core (insulator)'), x: 172, y: 236, lx: 60, ly: 318, anchor: 'start' },
          { part: 'film', label: tr('碳膜 ≈ 1 µm', 'carbon film ≈ 1 µm'), x: 250, y: 190, lx: 190, ly: 120 },
          { part: 'cut', label: tr('激光螺旋槽', 'laser spiral cut'), x: 330, y: 200, lx: 380, ly: 120 },
          { part: 'cap', label: tr('端帽', 'end cap'), x: 410, y: 245, lx: 450, ly: 300 },
        ],
      },
      {
        id: 'rho',
        short: 'R = ρL/A',
        title: tr('④ 为什么螺旋决定阻值：R = ρL/A', '④ Why the spiral sets the value: R = ρL/A'),
        body: tr(
          `一段均匀导体的电阻由三件事决定：材料的 **resistivity（电阻率）ρ**、长度 L、截面积 A：
$$R = \\frac{ρL}{A}$$
- 越 [[bar|长]]，电子要走的路越远 → R ∝ L；
- 越 [[bar|粗]]，并排能走的路越多 → R ∝ 1/A。

膜很薄（厚度 t），截面积 $A = w·t$（w 是膜的宽度），所以 $R = \\frac{ρ}{t}·\\frac{L}{w}$。$R_□ = \\frac{ρ}{t}$ 叫 **sheet resistance（方块电阻）**，单位 Ω/□：一块 **正方形** 膜（L = w）不管多大，电阻都是 $R_□$。于是阻值 = $R_□$ × “这条膜有几个方块长”。

**带数字算一遍**（碳膜：ρ ≈ 3×10⁻⁵ Ω·m，t ≈ 1 µm → $R_□ ≈ 30 Ω/□$；棒长 6 mm，周长 6.3 mm）：
- [[uncut|不切]]：电流沿 6 mm 长、6.3 mm 宽的一整张膜走，$R = 30 × \\frac{6}{6.3} ≈ 29 Ω$；
- [[strip|螺旋切成 0.5 mm 宽、绕 12 圈]]：膜变成一条 12 × 6.3 ≈ 75 mm 长、0.5 mm 宽的窄带，$R = 30 × \\frac{75}{0.5} = 30 × 150 = 4.5 kΩ$。

同一根棒、同一种膜，只靠切法就从 29 Ω 变到 4.5 kΩ——这就是 [[tube|激光螺旋]] 的作用。要 MΩ 级就换 $R_□$ 更大的膜，要几 Ω 就用更厚的膜或金属丝绕（wirewound）。`,
          `The resistance of a uniform conductor depends on three things: the material’s **resistivity ρ**, the length L and the cross-section A:
$$R = \\frac{ρL}{A}$$
- [[bar|longer]]: the electrons travel further → R ∝ L;
- [[bar|fatter]]: more paths side by side → R ∝ 1/A.

The film is thin (thickness t), so $A = w·t$ (w is the film width) and $R = \\frac{ρ}{t}·\\frac{L}{w}$. $R_□ = \\frac{ρ}{t}$ is the **sheet resistance**, in Ω/□: a **square** of film (L = w), of any size, has resistance $R_□$. So the value = $R_□$ × "how many squares long the film path is".

**With numbers** (carbon film: ρ ≈ 3×10⁻⁵ Ω·m, t ≈ 1 µm → $R_□ ≈ 30 Ω/□$; rod 6 mm long, 6.3 mm round):
- [[uncut|no cut]]: the current crosses one sheet 6 mm long and 6.3 mm wide, $R = 30 × \\frac{6}{6.3} ≈ 29 Ω$;
- [[strip|a spiral 0.5 mm wide, 12 turns]]: the film becomes a strip 12 × 6.3 ≈ 75 mm long and 0.5 mm wide, $R = 30 × \\frac{75}{0.5} = 30 × 150 = 4.5 kΩ$.

Same rod, same film — the cut alone takes it from 29 Ω to 4.5 kΩ. That is what [[tube|the laser spiral]] does. For MΩ values a film with a larger $R_□$ is used; for a few ohms, a thicker film or wound wire (wirewound).`,
        ),
        formulas: [
          { tex: 'R = \\frac{ρL}{A} = R_□ · \\frac{L}{w}', note: tr('$R_□$ = ρ / t：方块电阻', '$R_□$ = ρ / t: the sheet resistance') },
          { tex: 'R = 30 Ω × \\frac{75 mm}{0.5 mm} = 4.5 kΩ', note: tr('螺旋切后的膜：150 个方块', 'the spiral-cut film: 150 squares') },
        ],
      },
      {
        id: 'ohm',
        short: tr('欧姆定律', 'Ohm’s law'),
        title: tr('⑤ 等效电路：一个 R，一条过原点的直线', '⑤ Equivalent circuit: one R, a straight line through zero'),
        body: tr(
          `在电路里，电阻就是 [[sym|一个参数 R]]（ANSI 画锯齿，IEC 画方框）。它的全部行为是 **Ohm’s law（欧姆定律）**：
$$U = R·I ⇔ I = \\frac{U}{R}$$
注意参考方向：[[cur|电流 I]] 从 [[sym|U 的 + 端]] 流进（**关联参考方向** associated reference direction），这样公式里没有负号。

把它画成 **U–I 图**：每个电阻是一条 **过原点的直线**，斜率是 $\\frac{1}{R}$（也叫 **conductance 电导** G，单位 S）：
- [[l470|470 Ω]]：9 V 时 $I = \\frac{9}{470} = 19.1 mA$；
- [[l1k|1 kΩ]]：9 V 时 9 mA；
- [[l10k|10 kΩ]]：9 V 时只有 0.9 mA，线几乎贴着横轴。

“直线”是电阻最重要的性质——**linear（线性）**：电压加倍，电流也加倍；正反两个方向一样。后面的 LED、二极管就 **不是** 直线，这正是它们需要单独拆开讲的原因。`,
          `In a circuit a resistor is [[sym|a single parameter R]] (a zig-zag in ANSI, a box in IEC). Its entire behaviour is **Ohm’s law**:
$$U = R·I ⇔ I = \\frac{U}{R}$$
Mind the reference directions: [[cur|the current I]] enters at [[sym|the + end of U]] (the **associated reference direction**), so the formula has no minus sign.

Draw it as a **U–I graph**: every resistor is a **straight line through the origin** with slope $\\frac{1}{R}$ (the **conductance** G, in siemens):
- [[l470|470 Ω]]: at 9 V, $I = \\frac{9}{470} = 19.1 mA$;
- [[l1k|1 kΩ]]: 9 mA at 9 V;
- [[l10k|10 kΩ]]: only 0.9 mA at 9 V — the line hugs the axis.

"Straight" is the key property of a resistor — it is **linear**: double the voltage and the current doubles; both directions behave the same. The LED and the diode are **not** straight lines, which is why they get their own teardowns.`,
        ),
        formulas: [
          { tex: 'U = R·I', note: tr('关联参考方向（电流从 + 端流入）', 'associated reference directions (current enters at +)') },
          { tex: 'G = \\frac{1}{R} = \\frac{1}{470 Ω} = 2.13 mS', note: tr('U–I 图里直线的斜率', 'the slope of the line in the U–I graph') },
        ],
        calcs: ['ohm', 'series-resistance', 'parallel-resistance'],
      },
      {
        id: 'power',
        short: tr('功率', 'Power'),
        title: tr('⑥ 电阻会发热：功率和 1/4 W 额定值', '⑥ Resistors get hot: power and the 1/4 W rating'),
        body: tr(
          `电流流过膜时，电子不断撞上原子，电能全部变成 **热**（焦耳热 Joule heating）。每秒变成热的能量就是功率：
$$P = U·I = I^{2}R = \\frac{U^{2}}{R}$$
三个式子是同一件事，用欧姆定律互换。哪个量已知就用哪个。

**第 1 课的 470 Ω**：9 V 电池、红 LED，电流约 14.9 mA，电阻两端约 7.0 V：
$$P = I^{2}R = (0.0149)^{2} × 470 ≈ 0.104 W$$
小于 [[rating|额定值 0.25 W]]，[[ok|安全]]。这时它比室温高约 $0.104 × 250 ≈ 26 °C$（250 °C/W 是这种小电阻的 **thermal resistance 热阻**）——摸上去温温的，正常。

**危险的情况**：把一个 220 Ω 直接接在 9 V 上，$P = \\frac{81}{220} = 0.37 W$，[[over|超过额定值]]，会烫手、变色、冒烟，阻值永久漂移。100 Ω 直接接 9 V 是 0.81 W，几秒就烧焦。

**反过来算**：1/4 W 的 470 Ω 两端最多能加 $U = \\sqrt{P·R} = \\sqrt{0.25 × 470} ≈ 10.8 V$。经验是只用到额定值的一半，即 ≤ 0.125 W。`,
          `When current flows through the film the electrons keep bumping into atoms and all the electrical energy becomes **heat** (Joule heating). The energy turned into heat per second is the power:
$$P = U·I = I^{2}R = \\frac{U^{2}}{R}$$
The three forms are the same thing, swapped with Ohm’s law. Use whichever quantities you know.

**The 470 Ω in lesson 1**: 9 V battery, red LED, about 14.9 mA, about 7.0 V across the resistor:
$$P = I^{2}R = (0.0149)^{2} × 470 ≈ 0.104 W$$
Below [[rating|the 0.25 W rating]] — [[ok|safe]]. It runs about $0.104 × 250 ≈ 26 °C$ above room temperature (250 °C/W is the **thermal resistance** of such a small part) — warm to the touch, which is normal.

**The dangerous case**: a 220 Ω straight across 9 V gives $P = \\frac{81}{220} = 0.37 W$, [[over|over the rating]]: too hot to touch, discoloured, smoking, its value drifts for good. 100 Ω across 9 V is 0.81 W and chars within seconds.

**The other way round**: a 1/4 W 470 Ω can take at most $U = \\sqrt{P·R} = \\sqrt{0.25 × 470} ≈ 10.8 V$. Good practice is to use only half the rating, ≤ 0.125 W.`,
        ),
        table: {
          head: [tr('情况', 'Case'), 'U', 'I', 'P', tr('1/4 W 行吗', 'OK for 1/4 W?')],
          rows: [
            [tr('第 1 课 470 Ω', 'lesson 1, 470 Ω'), '7.0 V', '14.9 mA', '0.10 W', tr('✔ 温温的', '✔ warm')],
            [tr('串联课 220 Ω', 'series lesson, 220 Ω'), '3.5 V', '16 mA', '0.056 W', '✔'],
            [tr('220 Ω 直接接 9 V', '220 Ω across 9 V'), '9 V', '41 mA', '0.37 W', tr('✘ 过热', '✘ overheats')],
            [tr('100 Ω 直接接 9 V', '100 Ω across 9 V'), '9 V', '90 mA', '0.81 W', tr('✘ 烧焦', '✘ burns')],
          ],
          parts: ['ok', 'ok', 'over', 'over'],
        },
        formulas: [
          { tex: 'P = U·I = I^{2}R = \\frac{U^{2}}{R}', note: tr('单位 W（瓦）= V·A', 'unit W (watt) = V·A') },
          { tex: 'U_{max} = \\sqrt{P_{rated}·R} = \\sqrt{0.25 × 470} ≈ 10.8 V' },
        ],
        calcs: ['power', 'ohm'],
      },
      {
        id: 'limits',
        short: tr('局限', 'Limits'),
        title: tr('⑦ 真实电阻差多少：误差、温漂、寄生参数', '⑦ How real resistors differ: tolerance, drift, parasitics'),
        body: tr(
          `**误差 tolerance**：金环 ±5% 的 470 Ω，真实值在 446.5–493.5 Ω 之间任何地方。所以电阻只做成 **标准值系列**：E12（±10%，每十倍 12 个值：10、12、15、18、22、27、33、39、47、56、68、82）和 E24（±5%，再插进 11、13、16、20、24、30、36、43、51、62、75、91）。相邻值的 [[tol|误差带刚好接上]]，任何阻值都能找到一个“误差范围内”的标准件。算出 467 Ω → 选 470 Ω。

**温漂 temperature coefficient**：$R(T) = R_0(1 + α·ΔT)$。碳膜 α ≈ −300 ppm/°C（变热时阻值 **下降**），金属膜约 ±50 ppm/°C。前面那只热了 26 °C 的 470 Ω 只变了约 $470 × 300×10^{-6} × 26 ≈ 3.7 Ω$，比误差小得多。

**寄生参数 parasitics**：螺旋膜本身就是一个小 **线圈**，带来 [[ls|串联电感 $L_s$]] 几 nH；两个端帽像两块极板，带来 [[cp|并联电容 $C_p$]] 零点几 pF。它们只有在几十 MHz 以上才显出来；本课程最高到几百 kHz，可以忽略。

**仿真器里**：电阻是 [[rideal|理想的 R]]——精确等于标称值、没有误差、不发热、**不检查功率**。所以仿真里 100 Ω 接 9 V 不会冒烟，但真实的 1/4 W 电阻会。每次接线前都用上一层的 $P = \\frac{U^{2}}{R}$ 检查一遍。`,
          `**Tolerance**: a gold-band 470 Ω can be anywhere from 446.5 to 493.5 Ω. That is why resistors come only in **standard series**: E12 (±10 %, 12 values per decade: 10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82) and E24 (±5 %, adding 11, 13, 16, 20, 24, 30, 36, 43, 51, 62, 75, 91). Neighbouring values’ [[tol|tolerance bands just meet]], so any value lies within tolerance of some standard part. Calculated 467 Ω → use 470 Ω.

**Temperature coefficient**: $R(T) = R_0(1 + α·ΔT)$. Carbon film has α ≈ −300 ppm/°C (the value **drops** when hot), metal film about ±50 ppm/°C. The 470 Ω that warmed by 26 °C moved only about $470 × 300×10^{-6} × 26 ≈ 3.7 Ω$ — much less than its tolerance.

**Parasitics**: the spiral film is itself a small **coil**, giving [[ls|a series inductance $L_s$]] of a few nH; the two end caps act as plates, giving [[cp|a parallel capacitance $C_p$]] of a few tenths of a pF. They only show up above tens of MHz; this course stays below a few hundred kHz, so ignore them.

**In the simulator** a resistor is [[rideal|an ideal R]] — exactly its nominal value, no tolerance, no heating, and **no power check**. A 100 Ω across 9 V does not smoke in the simulator, but a real 1/4 W part does. Check $P = \\frac{U^{2}}{R}$ from the last layer before you wire anything.`,
        ),
        table: {
          head: [tr('性质', 'Property'), tr('碳膜（米黄）', 'Carbon film (beige)'), tr('金属膜（蓝）', 'Metal film (blue)'), tr('仿真器', 'Simulator')],
          rows: [
            [tr('误差', 'Tolerance'), '±5%', '±1%', '0'],
            [tr('温漂 α', 'Tempco α'), '≈ −300 ppm/°C', '≈ ±50 ppm/°C', '0'],
            [tr('额定功率', 'Power rating'), '1/4 W', '1/4 W', tr('不检查', 'not checked')],
            [tr('寄生 L / C', 'Parasitic L / C'), '≈ 5 nH / 0.3 pF', '≈ 5 nH / 0.3 pF', tr('无', 'none')],
          ],
          parts: ['tol', 'rideal', 'rideal', 'ls'],
        },
        formulas: [{ tex: 'R(T) = R_0 (1 + α·ΔT)', note: tr('碳膜 470 Ω、热 26 °C：约 −3.7 Ω', 'carbon 470 Ω, 26 °C warmer: about −3.7 Ω') }],
        calcs: ['series-resistance', 'parallel-resistance'],
      },
    ],
    recap: tr(
      '电阻 = 陶瓷棒上一层被螺旋切开的膜；**螺旋越长越窄，R = ρL/A 越大**。电路里它就是一条过原点的直线 $U = RI$，代价是发热 $P = I^{2}R$——1/4 W 的电阻要留一半余量。色环告诉你标称值和误差，仿真器把它当成精确、不会烧的理想电阻。',
      'A resistor is a spiral-cut film on a ceramic rod; **the longer and narrower the spiral, the larger R = ρL/A**. In a circuit it is a straight line through zero, $U = RI$, and the price is heat, $P = I^{2}R$ — leave half the 1/4 W rating spare. The bands give the nominal value and tolerance; the simulator treats it as exact and unburnable.',
    ),
  };
}
