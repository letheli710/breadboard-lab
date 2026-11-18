// Teardown: the digital multimeter, voltage mode. Front panel (dial, jacks, probes) → X-ray (input
// divider, ADC, display) → the range divider with real values → equivalent circuit (ideal
// voltmeter ∥ 10 MΩ) and why it goes in parallel → the loading error with numbers → floating
// points and the other limits of a real meter vs the simulator.
//
// The meter front and a few circuit symbols are exported for the ammeter teardown (same meter,
// other dial position) and the other instrument teardowns.

import './instruments.css';
import { tr } from '../../core/i18n';
import { sub, vis } from '../TeardownView';
import type { Teardown } from '../types';

/* ------------------------------------------------------------------ shared symbols */

/** arrowhead markers: `${id}-ah` (ink), `${id}-ahp` (purple), `${id}-ahg` (green), `${id}-ahr` (red) */
export function Defs({ id }: { id: string }) {
  const m = (suffix: string, cls: string) => (
    <marker id={`${id}-${suffix}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10z" className={cls} />
    </marker>
  );
  return (
    <defs>
      {m('ah', 'ins-ah')}
      {m('ahp', 'ins-ah-p')}
      {m('ahg', 'ins-ah-g')}
      {m('ahr', 'ins-ah-r')}
    </defs>
  );
}

/** zig-zag resistor between two points (any direction) */
export function Res({ x1, y1, x2, y2, part, cls = 'tdp-line', body = 44 }: { x1: number; y1: number; x2: number; y2: number; part?: string; cls?: string; body?: number }) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const nx = -uy;
  const ny = ux;
  const a = (L - body) / 2;
  const pts: string[] = [`${x1},${y1}`, `${x1 + ux * a},${y1 + uy * a}`];
  for (let k = 1; k <= 6; k++) {
    const t = a + (body * k) / 6.5;
    const s = k % 2 ? 7 : -7;
    pts.push(`${x1 + ux * t + nx * s},${y1 + uy * t + ny * s}`);
  }
  pts.push(`${x1 + ux * (a + body)},${y1 + uy * (a + body)}`, `${x2},${y2}`);
  return <polyline points={pts.join(' ')} className={cls} data-part={part} />;
}

export function Gnd({ x, y, part }: { x: number; y: number; part?: string }) {
  return (
    <g className="tdp-line" data-part={part}>
      <line x1={x - 12} y1={y} x2={x + 12} y2={y} />
      <line x1={x - 7} y1={y + 5} x2={x + 7} y2={y + 5} />
      <line x1={x - 3} y1={y + 10} x2={x + 3} y2={y + 10} />
    </g>
  );
}

/** a vertical battery between yTop (+) and yBot (−), plates at the middle */
export function Batt({ x, yTop, yBot, part }: { x: number; yTop: number; yBot: number; part?: string }) {
  const m = (yTop + yBot) / 2;
  return (
    <g data-part={part}>
      <path d={`M${x} ${yTop} V${m - 8} M${x} ${m + 8} V${yBot}`} className="tdp-line" />
      <line x1={x - 18} y1={m - 8} x2={x + 18} y2={m - 8} className="tdp-line" />
      <line x1={x - 10} y1={m + 8} x2={x + 10} y2={m + 8} className="tdp-line" style={{ strokeWidth: 4 }} />
      <text x={x + 22} y={m - 12} className="tdp-lbl" style={{ fill: '#e63946' }}>
        +
      </text>
    </g>
  );
}

/** a round meter / source symbol with a letter in it */
export function Circ({ x, y, r = 22, t, part }: { x: number; y: number; r?: number; t: string; part?: string }) {
  return (
    <g data-part={part}>
      <circle cx={x} cy={y} r={r} className="tdp-fill" />
      <text x={x} y={y + 6} textAnchor="middle" className="tdp-big">
        {t}
      </text>
    </g>
  );
}

export function Dot({ x, y, part }: { x: number; y: number; part?: string }) {
  return <circle cx={x} cy={y} r={4} className="ins-node" data-part={part} />;
}

/* ------------------------------------------------------------------ the meter front */

const C = { x: 235, y: 236 };
const POS = [
  { k: 'pos-off', t: 'OFF' },
  { k: 'pos-dcv', t: 'DCV' },
  { k: 'pos-acv', t: 'ACV' },
  { k: 'pos-ohm', t: 'Ω' },
  { k: 'pos-diode', t: '→|' },
  { k: 'pos-ma', t: 'mA' },
  { k: 'pos-a', t: '10A' },
];
const ANG = (i: number) => ((i * 52) / 180) * Math.PI;
export const JACK = { a10: 170, com: 235, v: 300, y: 362 };

/** The meter, front view. `sel` = dial position index, `red` = jack of the red lead. */
export function MeterFront({ sel, red, reading, mode, xray }: { sel: number; red: 'v' | 'a10'; reading: string; mode: string; xray?: boolean }) {
  const op = xray ? 0.16 : 1;
  const rx = JACK[red];
  return (
    <g>
      <rect x={110} y={14} width={250} height={404} rx={26} className="ins-case" data-part="case" style={{ opacity: op }} />
      <rect x={126} y={30} width={218} height={372} rx={16} className="ins-face" style={{ opacity: op }} />
      <g data-part="lcd">
        <rect x={146} y={46} width={178} height={76} rx={6} className="ins-lcd" />
        <text x={154} y={64} className="ins-lcd-s">
          {mode}
        </text>
        <text x={292} y={108} textAnchor="end" className="ins-lcd-t">
          {reading}
        </text>
      </g>
      <g style={{ opacity: xray ? 0.07 : 1 }}>
        <circle cx={C.x} cy={C.y} r={46} className="ins-dial" data-part="dial" />
        {POS.map((p, i) => {
          const a = ANG(i);
          const s = Math.sin(a);
          const c = Math.cos(a);
          return (
            <g key={p.k} data-part={`${p.k} dial`}>
              <line x1={C.x + 50 * s} y1={C.y - 50 * c} x2={C.x + 57 * s} y2={C.y - 57 * c} className="ins-tick" />
              <text x={C.x + 72 * s} y={C.y - 72 * c + 4} textAnchor="middle" className={`ins-pos ${i === sel ? 'sel' : ''}`}>
                {p.t}
              </text>
            </g>
          );
        })}
        <line
          x1={C.x - 34 * Math.sin(ANG(sel))}
          y1={C.y + 34 * Math.cos(ANG(sel))}
          x2={C.x + 38 * Math.sin(ANG(sel))}
          y2={C.y - 38 * Math.cos(ANG(sel))}
          className="ins-pointer"
          data-part="dial"
        />
      </g>
      {(
        [
          ['a10', JACK.a10, '10A', 'jack-a10'],
          ['com', JACK.com, 'COM', 'jack-com'],
          ['v', JACK.v, 'VΩmA', 'jack-v'],
        ] as const
      ).map(([k, x, t, part]) => (
        <g key={k} data-part={part}>
          <circle cx={x} cy={JACK.y} r={12} className={`ins-jack ${k === 'com' ? '' : 'red'}`} />
          <text x={x} y={JACK.y - 20} textAnchor="middle" className="ins-jack-t">
            {t}
          </text>
        </g>
      ))}
      {/* leads and probes */}
      <path d={`M${rx} ${JACK.y + 12} C${rx} 432 455 432 455 352`} className="ins-red" data-part="probe-red" />
      <path d={`M${JACK.com} ${JACK.y + 12} C${JACK.com} 438 515 438 515 352`} className="ins-black" data-part="probe-black" />
      <g data-part="probe-red">
        <line x1={455} y1={236} x2={455} y2={168} className="ins-tip" />
        <rect x={446} y={244} width={18} height={108} rx={6} className="ins-probe-red" />
        <rect x={441} y={236} width={28} height={8} rx={3} className="ins-probe-red" />
      </g>
      <g data-part="probe-black">
        <line x1={515} y1={236} x2={515} y2={168} className="ins-tip" />
        <rect x={506} y={244} width={18} height={108} rx={6} className="ins-probe-black" />
        <rect x={501} y={236} width={28} height={8} rx={3} className="ins-probe-black" />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ x-ray: the blocks inside */

function Xray() {
  return (
    <g>
      <g data-part="divider">
        <rect x={252} y={180} width={90} height={90} rx={8} className="ins-block" />
        <text x={297} y={214} textAnchor="middle" className="ins-block-t">
          {tr('分压器', 'divider')}
        </text>
        <text x={297} y={234} textAnchor="middle" className="td-small">
          10 MΩ
        </text>
        <text x={297} y={252} textAnchor="middle" className="td-small">
          {tr('+ 量程开关', '+ range switch')}
        </text>
      </g>
      <g data-part="adc">
        <rect x={132} y={180} width={90} height={90} rx={8} className="ins-block" />
        <text x={177} y={220} textAnchor="middle" className="ins-block-t">
          ADC
        </text>
        <text x={177} y={240} textAnchor="middle" className="td-small">
          ±200 mV
        </text>
      </g>
      <line x1={252} y1={225} x2={226} y2={225} className="tdp-line" markerEnd="url(#mm-ah)" data-part="adc" />
      <line x1={177} y1={180} x2={177} y2={128} className="tdp-line" markerEnd="url(#mm-ah)" data-part="lcd" />
      <path d={`M${JACK.v + 12} ${JACK.y} H322 V270`} className="ins-red" data-part="jack-v divider" />
      <path d={`M${JACK.com - 12} ${JACK.y} H205 V300 M177 270 V300 H272 V270`} className="tdp-line" data-part="jack-com com" />
      <text x={214} y={294} className="td-small" data-part="com">
        COM
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ the range divider */

const TAPS = [
  { y: 90, t: '÷1 · 200 mV' },
  { y: 190, t: '÷10 · 2 V' },
  { y: 260, t: '÷100 · 20 V' },
  { y: 320, t: '÷1000 · 200 V' },
];

function Divider() {
  return (
    <g>
      <rect x={20} y={20} width={520} height={400} rx={14} className="td-panel" />
      <text x={280} y={48} textAnchor="middle" className="td-panel-title">
        {tr('电压档里面：分压器 + 量程开关 + ADC', 'Inside the volts range: divider + range switch + ADC')}
      </text>
      <g data-part="jack-v">
        <circle cx={72} cy={90} r={6} className="tdp-fill" />
        <text x={62} y={94} textAnchor="end" className="tdp-lbl">
          VΩmA
        </text>
      </g>
      <g data-part="jack-com">
        <circle cx={72} cy={400} r={6} className="tdp-fill" />
        <text x={62} y={404} textAnchor="end" className="tdp-lbl">
          COM
        </text>
      </g>
      <g data-part="divider rin">
        <path d="M78 90 H140" className="tdp-line" />
        <Res x1={140} y1={90} x2={140} y2={190} />
        <Res x1={140} y1={190} x2={140} y2={260} />
        <Res x1={140} y1={260} x2={140} y2={320} />
        <Res x1={140} y1={320} x2={140} y2={380} />
        <path d="M140 380 V400 H78" className="tdp-line" />
        {(
          [
            [144, '9 MΩ'],
            [229, '900 kΩ'],
            [294, '90 kΩ'],
            [354, '10 kΩ'],
          ] as const
        ).map(([y, t]) => (
          <text key={t} x={126} y={y} textAnchor="end" className="tdp-lbl">
            {t}
          </text>
        ))}
      </g>
      <g data-part="taps">
        {TAPS.map((p) => (
          <g key={p.y}>
            <line x1={140} y1={p.y} x2={236} y2={p.y} className="tdp-line" />
            <circle cx={240} cy={p.y} r={4} className="tdp-fill" />
            <text x={192} y={p.y - 6} textAnchor="middle" className="td-small">
              {p.t}
            </text>
          </g>
        ))}
      </g>
      <g data-part="range-sw">
        <line x1={300} y1={240} x2={244} y2={259} className="tdp-line" style={{ strokeWidth: 3 }} />
        <circle cx={300} cy={240} r={5} className="ins-node" />
        <text x={250} y={292} className="td-small">
          {tr('量程开关（选 20 V）', 'range switch (20 V)')}
        </text>
      </g>
      <line x1={305} y1={240} x2={340} y2={240} className="tdp-line" data-part="adc" />
      <g data-part="adc">
        <rect x={340} y={200} width={120} height={80} rx={8} className="ins-block" />
        <text x={400} y={234} textAnchor="middle" className="ins-block-t">
          ADC
        </text>
        <text x={400} y={254} textAnchor="middle" className="td-small">
          {tr('满量程 ±200 mV', 'full scale ±200 mV')}
        </text>
        <path d="M460 260 H505 V400 H140" className="tdp-line" />
      </g>
      <line x1={400} y1={200} x2={400} y2={150} className="tdp-line" markerEnd="url(#mm-ah)" data-part="lcd" />
      <g data-part="lcd">
        <rect x={330} y={84} width={140} height={60} rx={6} className="ins-lcd" />
        <text x={338} y={100} className="ins-lcd-s">
          DC 20V
        </text>
        <text x={440} y={132} textAnchor="end" className="ins-lcd-t" style={{ fontSize: 28 }}>
          6.18
        </text>
        <text x={446} y={132} className="ins-lcd-s">
          V
        </text>
      </g>
      <g data-part="ratio-ex">
        <text x={250} y={318} className="td-small">
          {tr('被测 V = 6.18 V，量程 20 V：', 'V = 6.18 V on the 20 V range:')}
        </text>
        <text x={250} y={338} className="td-small">
          {tr('ADC 看到 6.18 V ÷ 100 = 61.8 mV', 'the ADC sees 6.18 V ÷ 100 = 61.8 mV')}
        </text>
        <text x={250} y={358} className="td-small">
          {tr('显示时再 × 100 → 6.18 V', 'the display multiplies back × 100 → 6.18 V')}
        </text>
      </g>
      <text x={250} y={384} className="tdp-lbl" data-part="rin">
        {sub('R_in')} = 9M + 900k + 90k + 10k = 10 MΩ
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ equivalent circuit */

function Equiv() {
  return (
    <g>
      <rect x={20} y={20} width={520} height={400} rx={14} className="td-panel" />
      <text x={280} y={48} textAnchor="middle" className="td-panel-title">
        {sub(tr('等效电路：理想电压表 ∥ R_in，并联在被测两点上', 'Equivalent circuit: ideal voltmeter ∥ R_in, across the two points'))}
      </text>
      <text x={40} y={74} className="td-small" data-part="im">
        {sub(tr('表取的电流 i_m = 6.18 V ÷ 10 MΩ ≈ 0.62 µA ≪ 电路电流 2.81 mA', 'meter current i_m = 6.18 V ÷ 10 MΩ ≈ 0.62 µA ≪ circuit current 2.81 mA'))}
      </text>
      <g data-part="circuit">
        <Batt x={70} yTop={150} yBot={330} />
        <text x={46} y={244} textAnchor="end" className="tdp-lbl">
          9 V
        </text>
        <path d="M70 150 V100 H250" className="tdp-line" />
        <Res x1={250} y1={100} x2={250} y2={210} />
        <Res x1={250} y1={210} x2={250} y2={330} />
        <path d="M250 330 V380 H70 V330" className="tdp-line" />
        <path d="M160 380 V392" className="tdp-line" />
        <Gnd x={160} y={392} />
        <text x={264} y={152} className="tdp-lbl">
          R1
        </text>
        <text x={264} y={168} className="td-small">
          1 kΩ
        </text>
        <text x={264} y={266} className="tdp-lbl">
          R2
        </text>
        <text x={264} y={282} className="td-small">
          2.2 kΩ
        </text>
      </g>
      <g data-part="node-m">
        <Dot x={250} y={210} />
        <text x={238} y={214} textAnchor="end" className="tdp-lbl">
          M
        </text>
      </g>
      <path d="M250 210 H350" className="ins-red" data-part="probe-red" />
      <path d="M350 380 H250" className="ins-black" data-part="probe-black" />
      <text x={300} y={202} textAnchor="middle" className="td-small" data-part="probe-red">
        {tr('红 +', 'red +')}
      </text>
      <text x={300} y={398} textAnchor="middle" className="td-small" data-part="probe-black">
        {tr('黑 COM', 'black COM')}
      </text>
      <rect x={330} y={160} width={200} height={250} rx={10} className="ins-xbox" data-part="meter" />
      <text x={430} y={182} textAnchor="middle" className="ins-xbox-t" data-part="meter">
        {tr('万用表（电压档）', 'multimeter (volts)')}
      </text>
      <path d="M350 210 H470 M350 380 H470 M400 210 V273 M400 317 V380" className="tdp-line" data-part="meter" />
      <Dot x={350} y={210} />
      <Dot x={350} y={380} />
      <Circ x={400} y={295} t="V" part="ideal-v" />
      <text x={372} y={300} textAnchor="end" className="td-small" data-part="ideal-v">
        i=0
      </text>
      <Res x1={470} y1={210} x2={470} y2={380} part="rin" />
      <text x={484} y={290} className="tdp-lbl" data-part="rin">
        {sub('R_in')}
      </text>
      <text x={484} y={306} className="td-small" data-part="rin">
        10 MΩ
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ loading error */

function Loading() {
  return (
    <g>
      <rect x={20} y={20} width={520} height={400} rx={14} className="td-panel" />
      <text x={280} y={48} textAnchor="middle" className="td-panel-title">
        {sub(tr('从表看进去：电路 = V_th + R_th，表 = R_in', 'Seen from the meter: circuit = V_th + R_th, meter = R_in'))}
      </text>
      <g data-part="thevenin">
        <circle cx={110} cy={250} r={24} className="tdp-fill" />
        <text x={110} y={244} textAnchor="middle" className="tdp-lbl" style={{ fill: '#e63946' }}>
          +
        </text>
        <text x={110} y={266} textAnchor="middle" className="tdp-lbl">
          −
        </text>
        <text x={78} y={246} textAnchor="end" className="tdp-lbl">
          {sub('V_th')}
        </text>
        <text x={78} y={262} textAnchor="end" className="td-small">
          4.5 V
        </text>
        <path d="M110 226 V140 H170 M290 140 H420 M110 274 V360 H420" className="tdp-line" />
        <Res x1={170} y1={140} x2={290} y2={140} part="rth" />
        <text x={230} y={122} textAnchor="middle" className="tdp-lbl" data-part="rth">
          {sub('R_th')}
        </text>
        <text x={230} y={166} textAnchor="middle" className="td-small" data-part="rth">
          500 kΩ
        </text>
        <Dot x={330} y={140} />
        <Dot x={330} y={360} />
        <text x={330} y={130} textAnchor="middle" className="tdp-lbl">
          a
        </text>
        <text x={330} y={380} textAnchor="middle" className="tdp-lbl">
          b
        </text>
      </g>
      <g data-part="umeas">
        <path d="M318 154 V346" className="ins-meas" markerStart="url(#mm-ahp)" />
        <text x={310} y={244} textAnchor="end" className="ins-meas-t">
          {sub('V_meas')}
        </text>
        <text x={310} y={262} textAnchor="end" className="ins-meas-t">
          4.29 V
        </text>
      </g>
      <rect x={380} y={104} width={140} height={290} rx={10} className="ins-xbox" data-part="rin" />
      <text x={450} y={124} textAnchor="middle" className="ins-xbox-t">
        {tr('万用表', 'meter')}
      </text>
      <path d="M420 140 H450 M420 360 H450" className="tdp-line" />
      <Res x1={450} y1={140} x2={450} y2={360} part="rin" />
      <text x={466} y={244} className="tdp-lbl" data-part="rin">
        {sub('R_in')}
      </text>
      <text x={466} y={262} className="td-small" data-part="rin">
        10 MΩ
      </text>
      <g data-part="result">
        <text x={40} y={394} className="tdp-lbl">
          {sub('V_meas = 4.5 V × 10 / (10 + 0.5) = 4.29 V')}
        </text>
        <text x={40} y={412} className="td-small">
          {tr('两个 1 MΩ 分 9 V：应该是 4.50 V，表上 4.29 V，偏小 4.8 %', 'two 1 MΩ across 9 V: should be 4.50 V, reads 4.29 V, 4.8 % low')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ floating point and limits */

function Floating() {
  return (
    <g>
      <rect x={20} y={20} width={520} height={400} rx={14} className="td-panel" />
      <text x={280} y={48} textAnchor="middle" className="td-panel-title">
        {tr('表笔点在悬空的点上：读到的是什么？', 'A probe on a floating point: what does it read?')}
      </text>
      <g data-part="mains">
        <text x={44} y={80} className="tdp-lbl">
          {tr('墙里的 220 V 50 Hz 电线', '220 V 50 Hz wiring in the wall')}
        </text>
        <path d="M60 92 q7.5 -8 15 0 t15 0 t15 0 t15 0" className="tdp-line" />
      </g>
      <g data-part="cstray">
        <path d="M90 96 V122 M90 130 V150" className="tdp-line" />
        <line x1={76} y1={122} x2={104} y2={122} className="tdp-line" />
        <line x1={76} y1={130} x2={104} y2={130} className="tdp-line" />
        <text x={110} y={130} className="td-small">
          {sub('C_stray ≈ 1 pF')}
        </text>
      </g>
      <g data-part="strip">
        <rect x={80} y={150} width={20} height={110} rx={4} className="tdp-copper" />
        <text x={40} y={280} className="td-small">
          {tr('h20：这条金属什么都没接', 'h20: a strip with nothing on it')}
        </text>
      </g>
      <path d="M100 200 H280" className="ins-red" data-part="probe-red" />
      <rect x={260} y={88} width={260} height={210} rx={10} className="ins-xbox" data-part="meter" />
      <text x={390} y={106} textAnchor="middle" className="ins-xbox-t">
        {tr('万用表', 'meter')}
      </text>
      <path d="M280 200 H300 V130 H330 V140 M330 260 V280 H220" className="tdp-line" data-part="rin" />
      <Res x1={330} y1={140} x2={330} y2={260} part="rin" />
      <text x={344} y={204} className="tdp-lbl" data-part="rin">
        10 MΩ
      </text>
      <path d="M220 280 V290" className="ins-black" data-part="probe-black" />
      <Gnd x={220} y={290} part="probe-black" />
      <g data-part="lcd">
        <rect x={392} y={150} width={118} height={56} rx={6} className="ins-lcd" />
        <text x={400} y={164} className="ins-lcd-s">
          AC?
        </text>
        <text x={500} y={196} textAnchor="end" className="ins-lcd-t" style={{ fontSize: 26 }}>
          0.69
        </text>
        <text x={451} y={226} textAnchor="middle" className="td-small">
          {tr('数字乱跳', 'wandering digits')}
        </text>
      </g>
      <g data-part="divider-calc">
        <text x={40} y={330} className="tdp-lbl">
          {tr('一个“隐形的分压器”：', 'An invisible divider:')}
        </text>
        <text x={40} y={350} className="td-small">
          {tr('1 pF 在 50 Hz 的阻抗 = 1 / (2π·50·1 pF) ≈ 3.2 GΩ', '1 pF at 50 Hz: 1 / (2π·50·1 pF) ≈ 3.2 GΩ')}
        </text>
        <text x={40} y={370} className="td-small">
          {tr('220 V × 10 MΩ / 3.2 GΩ ≈ 0.69 V —— 一个没有意义的数', '220 V × 10 MΩ / 3.2 GΩ ≈ 0.69 V — a meaningless number')}
        </text>
        <text x={40} y={396} className="td-small">
          {sub(tr('仿真里的表没有 R_in，也没有墙里的电线：直接显示“悬空”。', 'The simulated meter has no R_in and no wiring nearby: it just says "floating".'))}
        </text>
      </g>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <Defs id="mm" />
      <g className={vis(layer, 0, 2)}>
        <MeterFront sel={1} red="v" reading="6.18" mode={layer === 1 ? 'DC  V' : 'DC  V  AUTO'} xray={layer >= 2} />
      </g>
      <g className={vis(layer, 2, 2)}>
        <Xray />
      </g>
      <g className={vis(layer, 3, 3)}>
        <Divider />
      </g>
      <g className={vis(layer, 4, 4)}>
        <Equiv />
      </g>
      <g className={vis(layer, 5, 5)}>
        <Loading />
      </g>
      <g className={vis(layer, 6)}>
        <Floating />
      </g>
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'multimeter',
    title: tr('万用表（电压档）：一个 10 MΩ 的“探针”', 'Multimeter (volts): a 10 MΩ probe'),
    subtitle: tr(
      'multimeter（万用表）= 一台小小的数字电压表 + 一组开关和电阻，拨盘换一个位置，它就变成电流表或欧姆表。这一篇只拆电压档：从面板拆到里面的分压器和 ADC，再拆成电路课里能算的模型，最后算出“表本身让读数偏多少”。',
      'A multimeter is a small digital voltmeter plus a set of switches and resistors; turn the dial and it becomes an ammeter or an ohmmeter. This teardown covers the volts range: from the front panel to the divider and ADC inside, then to the circuit model you can calculate with, and finally how much the meter itself shifts the reading.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'front',
        short: tr('面板', 'Front'),
        title: tr('① 面板：一个屏幕、一个拨盘、三个插孔、两支表笔', '① Front: a display, a dial, three jacks, two probes'),
        body: tr(
          `拿起一块数字万用表（digital multimeter, DMM），从上往下只有四样东西：
- [[lcd|显示屏（LCD）]]：数字 + 单位 + 模式（DC / AC、量程）；
- [[dial|拨盘（rotary switch）]]：选“量什么”。它其实是一个多刀多掷的机械开关，转到不同位置，里面接通的是不同的电阻和电路；
- 三个插孔（jack）：下一层细讲；
- 两支 [[probe-red|红表笔]] / [[probe-black|黑表笔]]（probe）：金属针尖碰到哪里，就是在量哪一点。

**量电压** 把拨盘转到 [[pos-dcv|DCV]]（直流电压，DC = direct current）。下表是拨盘上每个位置的意思。注意：同一块表、同两支表笔，**拨盘的位置决定了表笔之间接的是什么**——在电压档表笔之间是 10 MΩ，在电流档表笔之间是不到 1 Ω。拨错档是烧表最常见的原因。`,
          `A digital multimeter (DMM) has only four things on its front, top to bottom:
- the [[lcd|display (LCD)]]: digits, unit and mode (DC / AC, range);
- the [[dial|dial (rotary switch)]]: chooses *what* to measure. It is a mechanical many-pole switch: each position connects a different set of resistors and circuits inside;
- three jacks: next layer;
- two probes, [[probe-red|red]] and [[probe-black|black]]: wherever the metal tip touches is the point you measure.

**To measure voltage** turn the dial to [[pos-dcv|DCV]] (direct-current volts). The table lists every dial position. Note: same meter, same two probes — **the dial decides what sits between the probes**. On volts it is 10 MΩ; on amps it is less than 1 Ω. The wrong range is the most common way to blow a meter.`,
        ),
        table: {
          head: [tr('拨盘位置', 'Dial'), tr('量什么', 'Measures'), tr('表笔之间是什么', 'Between the probes'), tr('怎么接', 'How to connect')],
          rows: [
            ['OFF', tr('关机', 'off'), '—', '—'],
            ['DCV', tr('直流电压', 'DC voltage'), tr('10 MΩ（很大）', '10 MΩ (huge)'), tr('**并联**在两点上', '**in parallel** across two points')],
            ['ACV', tr('交流电压有效值（RMS）', 'AC voltage, RMS'), tr('≈ 10 MΩ + 整流 / 有效值电路', '≈ 10 MΩ + RMS converter'), tr('并联', 'in parallel')],
            ['Ω', tr('电阻', 'resistance'), tr('表内的小电流源', 'a small current source inside'), tr('元件 **断电**，并在两端', 'part **unpowered**, across it')],
            ['→|', tr('二极管压降 / 通断蜂鸣', 'diode drop / continuity beep'), tr('≈ 1 mA 电流源', '≈ 1 mA current source'), tr('红接阳极（anode）', 'red on the anode')],
            [
              'mA',
              tr('小电流 ≤ 200 mA', 'small current ≤ 200 mA'),
              tr('≈ 1 Ω 分流电阻 + 保险丝', '≈ 1 Ω shunt + fuse'),
              tr('**串联**（见“电流表”）', '**in series** (see “Ammeter”)'),
            ],
            ['10A', tr('大电流 ≤ 10 A', 'large current ≤ 10 A'), tr('0.01 Ω 分流电阻', '0.01 Ω shunt'), tr('串联，红表笔换到 10A 孔', 'in series, red lead in the 10A jack')],
          ],
          parts: ['pos-off', 'pos-dcv', 'pos-acv', 'pos-ohm', 'pos-diode', 'pos-ma', 'pos-a'],
        },
        callouts: [
          { part: 'lcd', label: tr('显示屏', 'display'), x: 324, y: 84, lx: 400, ly: 60 },
          { part: 'dial', label: tr('拨盘：转到 DCV', 'dial: set to DCV'), x: 270, y: 210, lx: 400, ly: 130 },
        ],
      },
      {
        id: 'jacks',
        short: tr('插孔', 'Jacks'),
        title: tr('② 三个插孔：黑笔永远在 COM，红笔看量什么', '② Three jacks: black always in COM, red depends on what you measure'),
        body: tr(
          `三个插孔是表里三条电路的入口：
- [[jack-com|COM]]（common，公共端）：表里的“地”，所有测量的参考点。**黑表笔永远插这里**；
- [[jack-v|VΩmA]]：量电压、电阻、小电流时 [[probe-red|红表笔]] 插这里；
- [[jack-a10|10A]]：量大电流（> 200 mA）时红表笔改插这里。

读数的定义只有一句话：
$$V_{读数} = V_{红} - V_{黑}$$
红表笔那一点的电压 **减去** 黑表笔那一点的电压。所以“量 M 点的电压”其实是“量 M 点对黑表笔所在点（通常是 GND）的电压”。仿真里只放红表笔时，黑表笔默认接在 GND。

⚠ 量完电流以后，红表笔还插在 10A 孔里，下一次直接去量电池电压——表笔之间只有 0.01 Ω，等于把电池短路。养成习惯：**量完电流，马上把红表笔插回 VΩmA**。`,
          `The three jacks are the entrances to three circuits inside:
- [[jack-com|COM]] (common): the meter's own "ground", the reference of every reading. **The black probe always goes here**;
- [[jack-v|VΩmA]]: the [[probe-red|red probe]] for voltage, resistance and small currents;
- [[jack-a10|10A]]: the red probe moves here for large currents (> 200 mA).

The reading is defined by one sentence:
$$V_{reading} = V_{red} - V_{black}$$
the voltage at the red tip **minus** the voltage at the black tip. "The voltage of M" really means "M relative to wherever the black probe is (usually GND)". In the simulator, with only the red probe placed, the black one sits on GND.

⚠ After measuring current, the red lead is still in the 10A jack; you go to measure a battery and put 0.01 Ω across it — a short. Make it a habit: **after measuring current, move the red lead back to VΩmA**.`,
        ),
        table: {
          head: [tr('插孔', 'Jack'), tr('接什么', 'Takes'), tr('里面通到哪', 'Leads inside to'), tr('什么时候用', 'When')],
          rows: [
            ['COM', tr('黑表笔', 'black probe'), tr('表的地 / ADC 的参考', 'meter ground / ADC reference'), tr('每次都用', 'always')],
            [
              'VΩmA',
              tr('红表笔', 'red probe'),
              tr('10 MΩ 分压器、Ω 电流源、mA 分流电阻（经保险丝）', '10 MΩ divider, Ω source, mA shunt (via a fuse)'),
              tr('电压、电阻、≤ 200 mA', 'volts, ohms, ≤ 200 mA'),
            ],
            ['10A', tr('红表笔', 'red probe'), tr('0.01 Ω 分流电阻（经 10 A 保险丝）', '0.01 Ω shunt (via a 10 A fuse)'), tr('> 200 mA 的电流', 'currents > 200 mA')],
          ],
          parts: ['jack-com', 'jack-v', 'jack-a10'],
        },
        formulas: [{ tex: 'V_{reading} = V_{red} - V_{black}', note: tr('万用表永远量的是两点之差', 'a meter always reads the difference of two points') }],
        callouts: [
          { part: 'jack-com', label: tr('黑：COM', 'black: COM'), x: 235, y: 374, lx: 100, ly: 424 },
          { part: 'jack-v', label: tr('红：VΩmA', 'red: VΩmA'), x: 310, y: 352, lx: 374, ly: 300, anchor: 'start' },
          { part: 'jack-a10', label: '> 200 mA', x: 160, y: 356, lx: 100, ly: 300 },
        ],
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('③ X 光：分压器 → ADC → 显示屏', '③ X-ray: divider → ADC → display'),
        body: tr(
          `把外壳变透明，电压档里只有三块：
1. [[divider|分压器（voltage divider）+ 量程开关]]：一串总共 **10 MΩ** 的精密电阻，接在 [[jack-v|VΩmA]] 和 [[jack-com|COM]] 之间。它把被测电压缩小到 ADC 能接受的范围；
2. [[adc|ADC（analog-to-digital converter，模数转换器）]]：真正“量”电压的芯片，但它只能量 ±200 mV 左右的小电压，输出一个数（比如 −1999 … +1999）；
3. [[lcd|显示屏]]：把这个数乘上量程的倍数，点上小数点，再加单位。

所以万用表并不是“直接看到 6.18 V”，而是：**先按比例缩小，再数字化，再按同样的比例放大回来显示**。下一层把分压器拆开看。`,
          `Make the case transparent; the volts range has only three blocks:
1. the [[divider|voltage divider + range switch]]: a string of precision resistors totalling **10 MΩ** between [[jack-v|VΩmA]] and [[jack-com|COM]]. It scales the input down to what the ADC can take;
2. the [[adc|ADC (analog-to-digital converter)]]: the chip that really measures, but only small voltages of about ±200 mV; it outputs a number (e.g. −1999 … +1999);
3. the [[lcd|display]]: multiplies the number by the range factor, places the decimal point and adds the unit.

So the meter doesn't "see 6.18 V" directly: it **scales down by a known ratio, digitises, and scales back up by the same ratio for the display**. The next layer opens the divider.`,
        ),
        table: {
          head: [tr('方块', 'Block'), tr('输入', 'Input'), tr('输出', 'Output'), tr('它决定了什么', 'It sets')],
          rows: [
            [
              tr('分压器 + 量程开关', 'divider + range switch'),
              tr('被测电压 V', 'the voltage V'),
              'V ÷ 1, 10, 100, 1000',
              tr('**输入电阻 10 MΩ**、量程', '**input resistance 10 MΩ**, range'),
            ],
            ['ADC', '≤ ±200 mV', tr('一个整数（3½ 位：±1999）', 'an integer (3½ digits: ±1999)'), tr('分辨率、精度', 'resolution, accuracy')],
            [tr('显示屏', 'display'), tr('整数 + 量程', 'integer + range'), '6.18 V', tr('小数点位置', 'decimal point')],
          ],
          parts: ['divider', 'adc', 'lcd'],
        },
      },
      {
        id: 'divider',
        short: tr('分压器', 'Divider'),
        title: tr('④ 分压器：四个电阻、四个量程，总是 10 MΩ', '④ The divider: four resistors, four ranges, always 10 MΩ'),
        body: tr(
          `经典的 3½ 位万用表里，分压器是四个电阻串联：[[divider|9 MΩ + 900 kΩ + 90 kΩ + 10 kΩ = 10 MΩ]]。每两个电阻之间引出一个 [[taps|抽头（tap）]]，[[range-sw|量程开关]]（就是拨盘的一部分，自动量程的表由芯片切换）选一个抽头送给 [[adc|ADC]]。

抽头的分压比就是分压公式：抽头以下的电阻 ÷ 总电阻。例如 20 V 量程的抽头下面是 90 k + 10 k = 100 kΩ：
$$\\frac{V_{ADC}}{V} = \\frac{100 kΩ}{10 MΩ} = \\frac{1}{100}$$
[[ratio-ex|量 6.18 V]]：ADC 看到 61.8 mV，在 ±200 mV 以内，显示时乘回 100。

**关键**：不管选哪个量程，从 VΩmA 到 COM 看进去 **永远是整串 10 MΩ**（ADC 的输入几乎不取电流）。这个 10 MΩ 就是说明书上的 **输入电阻**（input resistance, $R_{in}$），下一层它要进入等效电路。

量程越小，分辨率越高（最后一位代表的电压越小），但超过满量程就显示“OL”（overload）。`,
          `In a classic 3½-digit meter the divider is four resistors in series: [[divider|9 MΩ + 900 kΩ + 90 kΩ + 10 kΩ = 10 MΩ]]. A [[taps|tap]] comes out between each pair, and the [[range-sw|range switch]] (part of the dial; auto-ranging meters switch it with the chip) feeds one tap to the [[adc|ADC]].

The ratio of a tap is the divider formula: the resistance below the tap ÷ the total. On the 20 V range the tap has 90 k + 10 k = 100 kΩ below it:
$$\\frac{V_{ADC}}{V} = \\frac{100 kΩ}{10 MΩ} = \\frac{1}{100}$$
[[ratio-ex|Measuring 6.18 V]]: the ADC sees 61.8 mV, inside ±200 mV, and the display multiplies back by 100.

**The key point**: whatever the range, from VΩmA to COM you **always see the whole 10 MΩ string** (the ADC input takes almost no current). That 10 MΩ is the **input resistance** $R_{in}$ in the manual, and it goes into the equivalent circuit in the next layer.

A smaller range gives finer resolution (the last digit is worth less), but above full scale the display shows "OL" (overload).`,
        ),
        table: {
          head: [tr('量程', 'Range'), tr('抽头下面的电阻', 'Below the tap'), tr('分压比', 'Ratio'), tr('满量程显示', 'Full scale'), tr('最后一位 = ', 'Last digit =')],
          rows: [
            ['200 mV', '10 MΩ', '1', '199.9 mV', '0.1 mV'],
            ['2 V', '1 MΩ', '1/10', '1.999 V', '1 mV'],
            ['20 V', '100 kΩ', '1/100', '19.99 V', '10 mV'],
            ['200 V', '10 kΩ', '1/1000', '199.9 V', '0.1 V'],
          ],
          parts: ['taps', 'taps', 'range-sw', 'taps'],
        },
        formulas: [
          { tex: '\\frac{V_{ADC}}{V} = \\frac{R_{below}}{R_{in}}', note: tr('分压公式：抽头以下的电阻 / 总电阻', 'divider formula: resistance below the tap / total') },
          { tex: 'R_{in} = 9 M + 900 k + 90 k + 10 k = 10 MΩ', note: tr('与量程无关', 'independent of the range') },
        ],
        calcs: ['voltage-divider'],
      },
      {
        id: 'equiv',
        short: tr('等效电路', 'Model'),
        title: tr('⑤ 等效电路：理想电压表并联 10 MΩ——所以它要并联', '⑤ Equivalent circuit: an ideal voltmeter in parallel with 10 MΩ — and why it goes in parallel'),
        body: tr(
          `把上一层的三块“装回去”，从两个插孔看进去，电压档的万用表等效成两样东西 **并联**：
- [[ideal-v|理想电压表（ideal voltmeter）]]：只读出两端电压，**不取任何电流**（$i = 0$，相当于开路）；
- [[rin|输入电阻]] $R_{in}$ = 10 MΩ：真实的表必须有的那串分压电阻。

**为什么电压表要并联？** 电压是 **两点之间** 的量。想知道 [[node-m|M 点]] 对 GND 的电压，表的两个端子就必须一个碰 M、一个碰 GND——这两点正好也是 R2 的两端，所以表 **自然就和 R2 并联**。不需要拆开电路，直接点上去就行。

**接上表会改变电路吗？** 用第 9 课的电路算（9 V，R1 = 1 kΩ，R2 = 2.2 kΩ）：
1. 不接表：$I = \\frac{9}{1k + 2.2k} = 2.81 mA$，$V_M = 2.2k × 2.81 mA = 6.18 V$；
2. 接上表：R2 变成 $2.2k ∥ 10M = 2199.5 Ω$，[[im|表取的电流]] $i_m = \\frac{6.18 V}{10 MΩ} = 0.62 µA$，只有电路电流的 0.02 %；
3. 读数变成 6.1871 V——第四位才变。所以量 kΩ 级的电路，可以放心把表当理想的。

**表笔接反**：[[probe-red|红]] 在 GND、[[probe-black|黑]] 在 M，读数 = $V_{GND} - V_M = -6.18 V$。电压没变，变的是 **参考方向**（reference direction）。`,
          `Put the three blocks back together. Seen from the two jacks, a meter on volts is two things **in parallel**:
- an [[ideal-v|ideal voltmeter]]: reads the voltage across it and **takes no current at all** ($i = 0$, an open circuit);
- the the [[rin|input resistance]] $R_{in}$ = 10 MΩ: the divider string every real meter has.

**Why does a voltmeter go in parallel?** Voltage is a quantity **between two points**. To know the voltage of [[node-m|node M]] relative to GND, one terminal of the meter must touch M and the other GND — and those are also the two ends of R2, so the meter is **automatically in parallel with R2**. You don't open the circuit; you just touch the two points.

**Does the meter change the circuit?** Take lesson 9's circuit (9 V, R1 = 1 kΩ, R2 = 2.2 kΩ):
1. without the meter: $I = \\frac{9}{1k + 2.2k} = 2.81 mA$, $V_M = 2.2k × 2.81 mA = 6.18 V$;
2. with the meter: R2 becomes $2.2k ∥ 10M = 2199.5 Ω$, and the [[im|meter current]] is $i_m = \\frac{6.18 V}{10 MΩ} = 0.62 µA$ — 0.02 % of the circuit current;
3. the reading becomes 6.1871 V — only the fourth digit moves. For kΩ circuits you can treat the meter as ideal.

**Probes swapped**: [[probe-red|red]] on GND, [[probe-black|black]] on M: reading = $V_{GND} - V_M = -6.18 V$. The voltage hasn't changed; your **reference direction** has.`,
        ),
        table: {
          head: [tr('量哪里（第 9 课）', 'What (lesson 9)'), tr('红表笔', 'Red'), tr('黑表笔', 'Black'), tr('读数', 'Reading')],
          rows: [
            [tr('电池两端', 'battery'), tr('+ 轨', '+ rail'), 'GND', '9.00 V'],
            [tr('M 对 GND（结点电压）', 'M to GND (node voltage)'), 'M', 'GND', '6.18 V'],
            [tr('R1 两端', 'across R1'), tr('+ 轨', '+ rail'), 'M', '2.81 V'],
            [tr('R1 两端，表笔接反', 'across R1, swapped'), 'M', tr('+ 轨', '+ rail'), '−2.81 V'],
          ],
          parts: ['circuit', 'node-m', 'probe-red', 'probe-black'],
        },
        formulas: [
          { tex: 'R_{meter} = R_{in} ∥ ∞ = 10 MΩ', note: tr('理想电压表是开路，只剩 $R_{in}$', 'the ideal voltmeter is an open circuit, leaving $R_{in}$') },
          { tex: 'i_m = \\frac{V}{R_{in}} = \\frac{6.18 V}{10 MΩ} = 0.62 µA', note: tr('表从电路里“借走”的电流', 'the current the meter borrows from the circuit') },
        ],
        calcs: ['parallel-resistance', 'voltage-divider'],
      },
      {
        id: 'loading',
        short: tr('负载误差', 'Loading'),
        title: tr('⑥ 负载误差：表本身让读数偏小多少？', '⑥ Loading error: how much does the meter pull the reading down?'),
        body: tr(
          `一般的情况：不管电路多复杂，从表的两个表笔看进去，电路都可以用 **戴维南等效**（Thévenin equivalent）换成 [[thevenin|一个电压源串一个电阻]]（$V_{th}$ 串 $R_{th}$）。$V_{th}$ 就是“不接表时那两点的真实电压”，$R_{th}$ 是从那两点看进去的电阻。

接上表，$R_{th}$ 和 [[rin|表的输入电阻]] $R_{in}$ 组成一个分压器，表读到的是 [[umeas|$R_{in}$ 上分到的那部分]]：
$$V_{meas} = V_{th} \\frac{R_{in}}{R_{in} + R_{th}}$$
相对误差：
$$\\frac{V_{meas} - V_{th}}{V_{th}} = -\\frac{R_{th}}{R_{in} + R_{th}} ≈ -\\frac{R_{th}}{R_{in}}$$
一步步代数字。9 V 加在两个相等的电阻上，量中点：$V_{th} = 4.5 V$，$R_{th} = R ∥ R = R/2$。

**经验规则**：$R_{th}$ 比 $R_{in}$ 小 1000 倍以上（也就是 $R_{th}$ < 10 kΩ），误差 < 0.1 %，可以忽略；电阻到了 MΩ 级，表本身就是电路的一部分了。

仿真里的万用表 **没有输入电阻**（$R_{in} = ∞$），所以永远读到 $V_{th}$；真实的表在第 3 行、第 4 行会让你“测不准”。`,
          `The general case: however complicated the circuit, seen from the two probes it can be replaced by its **Thévenin equivalent**: [[thevenin|a source in series with a resistor]] ($V_{th}$ in series with $R_{th}$). $V_{th}$ is the true voltage between the two points without the meter, and $R_{th}$ is the resistance seen looking into them.

With the meter on, $R_{th}$ and [[rin|the meter's input resistance]] $R_{in}$ form a divider, and the meter reads [[umeas|the share across $R_{in}$]]:
$$V_{meas} = V_{th} \\frac{R_{in}}{R_{in} + R_{th}}$$
Relative error:
$$\\frac{V_{meas} - V_{th}}{V_{th}} = -\\frac{R_{th}}{R_{in} + R_{th}} ≈ -\\frac{R_{th}}{R_{in}}$$
Put numbers in. 9 V across two equal resistors, measuring the middle: $V_{th} = 4.5 V$, $R_{th} = R ∥ R = R/2$.

**Rule of thumb**: if $R_{th}$ is more than 1000 times smaller than $R_{in}$ (i.e. $R_{th}$ < 10 kΩ) the error is < 0.1 % — ignore it. Once the resistors are in the MΩ range, the meter has become part of the circuit.

The simulated meter has **no input resistance** ($R_{in} = ∞$), so it always reads $V_{th}$; a real meter will mislead you in rows 3 and 4.`,
        ),
        table: {
          head: [tr('电路', 'Circuit'), '$V_{th}$', '$R_{th}$', tr('表上读到', 'Meter reads'), tr('误差', 'Error')],
          rows: [
            [tr('第 9 课 M 点（1k / 2.2k）', 'lesson 9, node M (1k / 2.2k)'), '6.1875 V', '687.5 Ω', '6.1871 V', '−0.007 %'],
            [tr('两个 100 kΩ', 'two 100 kΩ'), '4.5 V', '50 kΩ', '4.478 V', '−0.5 %'],
            [tr('两个 1 MΩ', 'two 1 MΩ'), '4.5 V', '500 kΩ', '4.286 V', '−4.8 %'],
            [tr('两个 10 MΩ', 'two 10 MΩ'), '4.5 V', '5 MΩ', '3.000 V', '−33 %'],
          ],
          parts: [null, null, 'result', null],
        },
        formulas: [
          { tex: 'V_{meas} = V_{th} \\frac{R_{in}}{R_{in} + R_{th}}', note: tr('表和电路的戴维南电阻分压', 'the meter divides with the circuit’s Thévenin resistance') },
          { tex: '\\frac{ΔV}{V_{th}} ≈ -\\frac{R_{th}}{R_{in}}', note: tr('$R_{th} ≪ R_{in}$ 时的近似', 'approximation for $R_{th} ≪ R_{in}$') },
        ],
        calcs: ['voltmeter-loading', 'loaded-divider'],
      },
      {
        id: 'limits',
        short: tr('局限', 'Limits'),
        title: tr('⑦ 局限：悬空的点、分辨率和精度、仿真和真表', '⑦ Limits: floating points, resolution and accuracy, simulated vs real'),
        body: tr(
          `**悬空点（floating node）**：表笔点在 [[strip|一条什么都没接的金属条]] 上，那一点不属于电路的任何结点，没有确定的电压。真实的表这时 **不会显示 0**，而是一个乱跳的数。原因是一个“隐形的分压器”：墙里 220 V 的电线通过 [[cstray|约 1 pF 的杂散电容]] 耦合到金属条，再经 [[rin|10 MΩ]] 到 COM：
$$V ≈ 220 V × \\frac{10 MΩ}{3.2 GΩ} ≈ 0.69 V$$
手一靠近、线一动，杂散电容就变，[[lcd|读数]] 就跳。**看到乱跳的小读数，先怀疑那一点没接上。**仿真里的表直接告诉你“悬空”。

**分辨率和精度**：3½ 位的表最多显示 1999 个数。20 V 量程最后一位是 10 mV；精度典型为 ±(0.5 % + 2 个字)，量 6.18 V 时：
$$±(0.5 % × 6.18 + 2 × 0.01) = ±0.05 V$$
所以 6.18 V 和 6.20 V 在真实的表上是“一样的”。实验里读数和预测差 1 % 以内就是对的。`,
          `**Floating node**: put the probe on [[strip|a metal strip with nothing on it]] and that point belongs to no node of the circuit; it has no defined voltage. A real meter does **not show 0** there but a wandering number. The cause is an invisible divider: the 220 V wiring in the wall couples to the strip through [[cstray|about 1 pF of stray capacitance]], then through [[rin|10 MΩ]] to COM:
$$V ≈ 220 V × \\frac{10 MΩ}{3.2 GΩ} ≈ 0.69 V$$
Move your hand or the lead and the stray capacitance changes, so [[lcd|the reading]] jumps. **A small wandering reading means: suspect that the point isn't connected.** The simulated meter just says "floating".

**Resolution and accuracy**: a 3½-digit meter shows at most 1999 counts. On the 20 V range the last digit is 10 mV; a typical accuracy is ±(0.5 % + 2 digits), so for 6.18 V:
$$±(0.5 % × 6.18 + 2 × 0.01) = ±0.05 V$$
6.18 V and 6.20 V are "the same" on a real meter. A lab reading within 1 % of the prediction is right.`,
        ),
        table: {
          head: [tr('项目', 'Item'), tr('真实万用表', 'Real meter'), tr('仿真里的万用表', 'Simulated meter')],
          rows: [
            [tr('输入电阻', 'input resistance'), '≈ 10 MΩ', tr('∞（不取电流）', '∞ (no current)')],
            [tr('悬空点', 'floating point'), tr('乱跳的小数（几百 mV）', 'a wandering number (100s of mV)'), tr('显示“悬空”', 'says "floating"')],
            [tr('分辨率', 'resolution'), tr('3½ 位：1999 个字', '3½ digits: 1999 counts'), tr('3 位有效数字', '3 significant digits')],
            [tr('精度', 'accuracy'), '±(0.5 % + 2)', tr('精确（模型值）', 'exact (model value)')],
            [
              tr('交流档 ACV', 'AC volts'),
              tr('正弦波有效值；非正弦要 True RMS 表', 'sine RMS; non-sine needs a True RMS meter'),
              tr('用示波器的 RMS 读数', 'use the scope’s RMS readout'),
            ],
            [tr('表笔接反', 'probes swapped'), tr('读数带负号', 'negative reading'), tr('读数带负号', 'negative reading')],
          ],
          parts: ['rin', 'strip', 'lcd', 'lcd', null, 'probe-red'],
        },
        formulas: [{ tex: '|Z_C| = \\frac{1}{2π f C} = \\frac{1}{2π × 50 × 1 pF} ≈ 3.2 GΩ', note: tr('杂散电容在 50 Hz 的阻抗', 'impedance of the stray capacitance at 50 Hz') }],
        calcs: ['capacitive-reactance'],
      },
    ],
    recap: tr(
      '电压档的万用表 = 理想电压表并联 10 MΩ。它量两点之差（红 − 黑），所以并联在两点上；它从电路借走 $V/R_{in}$ 的电流，读数偏小约 $R_{th}/R_{in}$——kΩ 级的电路可以忽略，MΩ 级的电路不行。',
      'A meter on volts = an ideal voltmeter in parallel with 10 MΩ. It reads the difference of two points (red − black), so it goes in parallel across them; it borrows $V/R_{in}$ from the circuit and reads low by about $R_{th}/R_{in}$ — negligible for kΩ circuits, not for MΩ ones.',
    ),
  };
}
