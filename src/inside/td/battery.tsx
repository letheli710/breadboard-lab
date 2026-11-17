// Teardown: batteries. The three the course uses (9 V block, AA pack, CR2032 coin cell) → X-ray
// (six 1.5 V cells inside the 9 V block, the coin cell's layers) → chemistry → EMF, cells in
// series → the equivalent circuit (ideal E in series with r) → U = E − I·r with the course's
// numbers and the battery's U–I line → the coin cell and the LED "without a resistor" → + / − and
// what GND means → the limits of the model (discharge, r rising).

import './power.css';
import { tr } from '../../core/i18n';
import { sub, vis } from '../TeardownView';
import type { Teardown } from '../types';

/** zig-zag resistor between two points */
function Res({ x1, y1, x2, y2, part }: { x1: number; y1: number; x2: number; y2: number; part?: string }) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const body = Math.min(48, L - 8);
  const a = (L - body) / 2;
  const pts: string[] = [`${x1},${y1}`, `${x1 + ux * a},${y1 + uy * a}`];
  for (let k = 1; k <= 6; k++) {
    const t = a + (body * k) / 6.5;
    const s = k % 2 ? 7 : -7;
    pts.push(`${x1 + ux * t - uy * s},${y1 + uy * t + ux * s}`);
  }
  pts.push(`${x1 + ux * (a + body)},${y1 + uy * (a + body)}`, `${x2},${y2}`);
  return <polyline points={pts.join(' ')} className="oa-wire" data-part={part} />;
}

function Gnd({ x, y, part }: { x: number; y: number; part?: string }) {
  return (
    <g className="oa-wire" data-part={part}>
      <line x1={x} y1={y} x2={x} y2={y + 8} />
      <line x1={x - 12} y1={y + 8} x2={x + 12} y2={y + 8} />
      <line x1={x - 7} y1={y + 13} x2={x + 7} y2={y + 13} />
      <line x1={x - 3} y1={y + 18} x2={x + 3} y2={y + 18} />
    </g>
  );
}

/** ideal voltage source (circle with + / −), vertical, + on top */
function Src({ x, y, r = 22, part, label }: { x: number; y: number; r?: number; part?: string; label?: string }) {
  return (
    <g data-part={part}>
      <circle cx={x} cy={y} r={r} className="oa-src" />
      <text x={x} y={y - 4} textAnchor="middle" className="oa-src-sign">
        +
      </text>
      <text x={x} y={y + 14} textAnchor="middle" className="oa-src-sign">
        −
      </text>
      {label && (
        <text x={x - r - 8} y={y + 5} textAnchor="end" className="oa-lbl">
          {label}
        </text>
      )}
    </g>
  );
}

/* --------------------------------------------------------------- layers 0–1: the three batteries */

const CELL_X = [52, 75, 98, 121, 144, 167];

function NineVolt({ layer }: { layer: number }) {
  const xray = layer >= 1;
  return (
    <g>
      <text x={115} y={62} textAnchor="middle" className="tdp-big">
        {tr('9 V 方块电池', '9 V block')}
      </text>
      {/* snaps: + small round stud, − bigger hexagon */}
      <g data-part="plus snap">
        <rect x={74} y={98} width={22} height={22} rx={3} className="tdp-metal" />
        <circle cx={85} cy={96} r={9} className="tdp-metal" />
        <text x={85} y={86} textAnchor="middle" className="oa-lbl plus">
          +
        </text>
      </g>
      <g data-part="minus snap">
        <polygon points="132,86 158,86 166,101 158,116 132,116 124,101" className="tdp-metal" />
        <circle cx={145} cy={101} r={6} fill="#7d8088" />
        <text x={145} y={80} textAnchor="middle" className="oa-lbl minus">
          −
        </text>
      </g>
      <g data-part="b9v" className="pw-fade" style={{ opacity: xray ? 0.22 : 1 }}>
        <rect x={40} y={118} width={150} height={252} rx={10} fill="#1f2a44" stroke="#0f1525" strokeWidth={2} />
        <rect x={40} y={118} width={150} height={60} rx={10} fill="#c9a227" />
        <rect x={40} y={160} width={150} height={18} fill="#c9a227" />
        <text x={115} y={265} textAnchor="middle" className="pw-on-dark" fontSize={44}>
          9V
        </text>
        <text x={115} y={295} textAnchor="middle" className="pw-on-dark" fontSize={12}>
          ALKALINE
        </text>
      </g>
      <g className={vis(layer, 1, 1)} data-part="cells">
        {CELL_X.map((x, i) => {
          const up = i % 2 === 0; // + at the top for cells 1, 3, 5
          return (
            <g key={i}>
              <rect x={x} y={150} width={18} height={196} rx={4} fill="#5f7fb8" stroke="#1f2a44" strokeWidth={1.4} />
              <rect x={x + 5} y={up ? 144 : 346} width={8} height={6} fill="#c9ccd1" stroke="#7d8088" />
              <text x={x + 9} y={166} textAnchor="middle" className="pw-on-dark" fontSize={11}>
                {up ? '+' : '−'}
              </text>
              <text x={x + 9} y={340} textAnchor="middle" className="pw-on-dark" fontSize={11}>
                {up ? '−' : '+'}
              </text>
              <text x={x + 13} y={250} textAnchor="middle" className="pw-on-dark" fontSize={10} transform={`rotate(-90 ${x + 13} 250)`}>
                1.5 V
              </text>
            </g>
          );
        })}
        {/* series straps: 1−2 bottom, 2−3 top, 3−4 bottom, 4−5 top, 5−6 bottom */}
        <path d="M61 352 L61 358 L84 358 L84 352 M107 352 L107 358 L130 358 L130 352 M153 352 L153 358 L176 358 L176 352" stroke="#c9a227" strokeWidth={3} fill="none" />
        <path d="M84 144 L84 136 L107 136 L107 144 M130 144 L130 136 L153 136 L153 144" stroke="#c9a227" strokeWidth={3} fill="none" />
        <path d="M61 144 L61 128 L85 128 L85 116" className="oa-wire plus" />
        <path d="M176 144 L176 128 L145 128 L145 116" className="oa-wire minus" />
        <text x={115} y={392} textAnchor="middle" className="oa-lbl">
          6 × 1.5 V = 9 V
        </text>
      </g>
    </g>
  );
}

function AAPack({ layer }: { layer: number }) {
  const xray = layer >= 1;
  return (
    <g>
      <text x={287} y={62} textAnchor="middle" className="tdp-big">
        {tr('2 节 AA 电池盒', '2 × AA holder')}
      </text>
      <path d="M252 150 C 252 110, 250 100, 262 90" className="oa-wire plus" data-part="plus" />
      <path d="M322 150 C 322 110, 324 100, 312 90" className="oa-wire minus" data-part="minus" />
      <text x={258} y={84} textAnchor="end" className="oa-lbl plus" data-part="plus">
        +
      </text>
      <text x={318} y={84} className="oa-lbl minus" data-part="minus">
        −
      </text>
      <rect x={222} y={146} width={130} height={214} rx={6} fill="#26272b" data-part="aa" />
      {[237, 292].map((x, i) => (
        <g key={x} data-part="aa">
          <rect x={x} y={170} width={46} height={164} rx={6} fill={i ? '#3b7d4f' : '#3b7d4f'} stroke="#173b25" strokeWidth={1.5} />
          <rect x={x + 16} y={i ? 334 : 163} width={14} height={7} fill="#c9ccd1" stroke="#7d8088" />
          <text x={x + 23} y={i ? 186 : 326} textAnchor="middle" className="pw-on-dark" fontSize={12}>
            −
          </text>
          <text x={x + 23} y={i ? 326 : 186} textAnchor="middle" className="pw-on-dark" fontSize={12}>
            +
          </text>
          <text x={x + 28} y={252} textAnchor="middle" className="pw-on-dark" fontSize={12} transform={`rotate(-90 ${x + 28} 252)`}>
            AA 1.5V
          </text>
        </g>
      ))}
      {/* springs on the − ends */}
      <path d="M252 344 l6 4 l-12 4 l12 4 l-6 4" stroke="#c9ccd1" strokeWidth={1.5} fill="none" />
      <path d="M315 150 l6 4 l-12 4 l12 4 l-6 4" stroke="#c9ccd1" strokeWidth={1.5} fill="none" />
      <g className={vis(layer, 1, 1)}>
        <path d="M260 341 L260 352 L315 352 L315 341" stroke="#c9a227" strokeWidth={4} fill="none" data-part="aa" />
        <text x={287} y={392} textAnchor="middle" className="oa-lbl">
          1.5 V + 1.5 V = 3 V
        </text>
      </g>
      <text x={287} y={418} textAnchor="middle" className={`td-small ${xray ? 'td-hide' : 'td-show'}`}>
        {tr('3 节 4.5 V · 4 节 6 V', '3 × AA 4.5 V · 4 × AA 6 V')}
      </text>
    </g>
  );
}

function Coin({ layer }: { layer: number }) {
  const xray = layer >= 1;
  return (
    <g>
      <text x={465} y={62} textAnchor="middle" className="tdp-big">
        CR2032
      </text>
      <g className={xray ? 'td-hide' : 'td-show'} data-part="coin">
        <circle cx={465} cy={190} r={58} fill="#d4d6db" stroke="#7d8088" strokeWidth={2} />
        <circle cx={465} cy={190} r={50} fill="none" stroke="#b7bac1" strokeWidth={1} />
        <text x={465} y={182} textAnchor="middle" className="tdp-lbl">
          CR2032
        </text>
        <text x={465} y={202} textAnchor="middle" className="tdp-lbl">
          3V
        </text>
        <text x={465} y={226} textAnchor="middle" className="oa-lbl plus">
          +
        </text>
        <text x={465} y={278} textAnchor="middle" className="td-small">
          {tr('Ø 20 mm × 3.2 mm', 'Ø 20 mm × 3.2 mm')}
        </text>
        {/* side view */}
        <rect x={409} y={318} width={112} height={14} rx={3} fill="#d4d6db" stroke="#7d8088" data-part="plus" />
        <rect x={421} y={311} width={88} height={8} rx={2} fill="#a9adb5" stroke="#7d8088" data-part="minus" />
        <text x={400} y={318} textAnchor="end" className="oa-lbl minus" data-part="minus">
          −
        </text>
        <text x={400} y={334} textAnchor="end" className="oa-lbl plus" data-part="plus">
          +
        </text>
        <text x={465} y={352} textAnchor="middle" className="td-small">
          {tr('侧面', 'side view')}
        </text>
      </g>
      {/* x-ray: cross-section */}
      <g className={vis(layer, 1, 1)} data-part="coin">
        <text x={465} y={110} textAnchor="middle" className="td-small">
          {tr('剖面（放大）', 'cross-section (enlarged)')}
        </text>
        <rect x={400} y={140} width={130} height={170} rx={8} fill="#c9ccd1" stroke="#7d8088" strokeWidth={2} data-part="plus" />
        <rect x={409} y={140} width={112} height={161} fill="#fffdf8" />
        <rect x={409} y={248} width={112} height={53} fill="#2c2c30" data-part="cathode" />
        <text x={465} y={280} textAnchor="middle" className="pw-on-dark" fontSize={12}>
          MnO₂ (+)
        </text>
        <rect x={409} y={238} width={112} height={10} fill="#efe9da" stroke="#b8ab8f" strokeDasharray="3 2" data-part="separator" />
        <rect x={418} y={176} width={94} height={62} fill="#9aa3b5" data-part="anode" />
        <text x={465} y={212} textAnchor="middle" className="pw-on-dark" fontSize={12}>
          Li (−)
        </text>
        <rect x={414} y={150} width={102} height={26} rx={3} fill="#a9adb5" stroke="#7d8088" data-part="minus" />
        <text x={465} y={168} textAnchor="middle" className="pw-tiny">
          {tr('负极盖 −', '− cap')}
        </text>
        <rect x={403} y={146} width={11} height={34} fill="#1c1d21" />
        <rect x={516} y={146} width={11} height={34} fill="#1c1d21" />
        <text x={465} y={330} textAnchor="middle" className="td-small">
          {tr('外壳 = + 极', 'the can = +')}
        </text>
        <text x={465} y={392} textAnchor="middle" className="oa-lbl">
          Li / MnO₂ ≈ 3 V
        </text>
      </g>
    </g>
  );
}

/* --------------------------------------------------------------- layer 2: chemistry, cells in series */

function Chemistry({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 2, 2)}>
      <text x={150} y={24} textAnchor="middle" className="td-panel-title">
        {tr('一节碱性 AA 的剖面', 'An alkaline AA, cut open')}
      </text>
      {/* can (+), cathode ring, separator, zinc gel, collector nail */}
      <rect x={140} y={62} width={20} height={10} fill="#c9ccd1" stroke="#7d8088" data-part="plus" />
      <rect x={90} y={72} width={120} height={300} rx={8} fill="#c9ccd1" stroke="#7d8088" strokeWidth={2} data-part="plus" />
      <rect x={98} y={80} width={104} height={276} fill="#2c2c30" data-part="cathode" />
      <rect x={118} y={92} width={64} height={256} fill="#efe9da" data-part="separator" />
      <rect x={122} y={96} width={56} height={248} fill="#9aa3b5" data-part="anode" />
      <rect x={147} y={120} width={6} height={248} fill="#c9a227" data-part="minus" />
      <rect x={96} y={356} width={108} height={14} fill="#a9adb5" stroke="#7d8088" data-part="minus" />
      <text x={136} y={236} textAnchor="middle" className="pw-on-dark" fontSize={12} transform="rotate(-90 136 236)">
        Zn {tr('锌膏', 'gel')} (−)
      </text>
      <text x={106} y={230} textAnchor="middle" className="pw-on-dark" fontSize={11} transform="rotate(-90 106 230)">
        MnO₂ (+)
      </text>
      <text x={150} y={398} textAnchor="middle" className="td-small">
        {tr('电解液 KOH 浸满隔膜', 'KOH electrolyte soaks the separator')}
      </text>
      {/* external circuit with electrons */}
      <path d="M160 62 L160 46 L250 46 L250 160" className="oa-wire" />
      <Res x1={250} y1={160} x2={250} y2={290} part="load" />
      <path d="M250 290 L250 386 L150 386 L150 370" className="oa-wire" />
      <path d="M262 340 L262 300" className="pw-electron" markerEnd="url(#bt-ah-e)" data-part="electrons" />
      <text x={268} y={326} className="pw-lbl-blue" fontSize={12} data-part="electrons">
        e⁻
      </text>
      <path d="M238 110 L238 150" className="oa-cur" markerEnd="url(#bt-ah-i)" />
      <text x={232} y={130} textAnchor="end" className="pw-lbl-amber" fontSize={12}>
        I
      </text>

      {/* six cells in series */}
      <text x={430} y={24} textAnchor="middle" className="td-panel-title">
        {tr('串联：E 相加，r 也相加', 'In series: E adds, so does r')}
      </text>
      <line x1={400} y1={70} x2={400} y2={86} className="oa-wire plus" />
      {Array.from({ length: 6 }, (_, i) => {
        const y = 90 + i * 48;
        return (
          <g key={i} data-part="series">
            <line x1={380} y1={y} x2={420} y2={y} className="oa-wire" />
            <line x1={390} y1={y + 10} x2={410} y2={y + 10} className="oa-wire" style={{ strokeWidth: 4 }} />
            <line x1={400} y1={y + 10} x2={400} y2={y + 48} className="oa-wire" />
            <text x={430} y={y + 9} className="td-small">
              1.5 V, 0.25 Ω
            </text>
          </g>
        );
      })}
      <path d="M520 86 C 532 86, 528 230, 538 236 C 528 242, 532 386, 520 386" className="oa-wire" fill="none" style={{ strokeWidth: 1.4 }} />
      <text x={536} y={406} textAnchor="end" className="oa-lbl">
        E = 9 V, r = 1.5 Ω
      </text>
      <text x={392} y={80} textAnchor="end" className="oa-lbl plus">
        +
      </text>
      <text x={392} y={390} textAnchor="end" className="oa-lbl minus">
        −
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layer 3: equivalent circuit */

function Model({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 3, 3)}>
      <rect x={70} y={92} width={210} height={270} rx={12} className="pw-dashbox" data-part="box" />
      <text x={175} y={84} textAnchor="middle" className="oa-lbl">
        {tr('电池（虚线框里）', 'the battery (inside the dashes)')}
      </text>
      <Src x={140} y={280} part="emf" label="E" />
      <path d="M140 258 L140 140 L160 140" className="oa-wire" />
      <Res x1={160} y1={140} x2={250} y2={140} part="rint" />
      <text x={205} y={124} textAnchor="middle" className="oa-lbl" data-part="rint">
        r
      </text>
      <path d="M140 302 L140 330 L280 330" className="oa-wire" />
      <line x1={250} y1={140} x2={280} y2={140} className="oa-wire" />
      <circle cx={280} cy={140} r={5} className="oa-term" data-part="plus" />
      <circle cx={280} cy={330} r={5} className="oa-term" data-part="minus" />
      <text x={286} y={128} className="oa-lbl plus" data-part="plus">
        +
      </text>
      <text x={286} y={354} className="oa-lbl minus" data-part="minus">
        −
      </text>
      {/* load */}
      <path d="M280 140 L450 140 L450 180" className="oa-wire" />
      <Res x1={450} y1={180} x2={450} y2={290} part="load" />
      <text x={464} y={240} className="oa-lbl" data-part="load">
        {sub('R_L')}
      </text>
      <path d="M450 290 L450 330 L280 330" className="oa-wire" />
      <path d="M360 128 L400 128" className="oa-cur" markerEnd="url(#bt-ah-i)" data-part="cur" />
      <text x={380} y={120} textAnchor="middle" className="pw-lbl-amber" fontSize={13} data-part="cur">
        I
      </text>
      {/* terminal voltage U */}
      <g data-part="u">
        <path d="M330 318 L330 152" className="oa-vd" markerEnd="url(#bt-ah-v)" />
        <text x={338} y={240} className="pw-lbl-purple" fontSize={14}>
          U
        </text>
      </g>
      <Gnd x={380} y={330} part="minus" />
      <text x={394} y={362} className="td-small" data-part="minus">
        GND = 0 V
      </text>
      <text x={205} y={170} textAnchor="middle" className="td-small" data-part="rint">
        {tr('压降 I·r', 'drop I·r')}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layer 4: U–I line of a CR2032 */

const gx = (i: number) => 90 + (i / 0.2) * 400; // I in A, 0..0.2
const gy = (u: number) => 370 - (u / 3.2) * 270; // U in V, 0..3.2

function ULine({ layer }: { layer: number }) {
  const pts: [string, number, number, string][] = [
    ['p47', 0.0162, 2.757, tr('47 Ω + LED：16 mA, 2.76 V', '47 Ω + LED: 16 mA, 2.76 V')],
    ['p0', 0.0444, 2.333, tr('只有 LED：44 mA, 2.33 V', 'LED only: 44 mA, 2.33 V')],
    ['pmax', 0.1, 1.5, tr('R = r = 15 Ω：功率最大', 'R = r = 15 Ω: max power')],
  ];
  return (
    <g className={vis(layer, 4, 4)}>
      <rect x={30} y={40} width={510} height={380} rx={14} className="td-panel" />
      <text x={285} y={66} textAnchor="middle" className="td-panel-title">
        {tr('CR2032 的外特性：U = 3 V − I × 15 Ω', 'CR2032 output line: U = 3 V − I × 15 Ω')}
      </text>
      {[0.05, 0.1, 0.15].map((i) => (
        <line key={i} x1={gx(i)} y1={gy(3.2)} x2={gx(i)} y2={gy(0)} className="pw-grid" />
      ))}
      {[1, 2, 3].map((u) => (
        <line key={u} x1={gx(0)} y1={gy(u)} x2={gx(0.2)} y2={gy(u)} className="pw-grid" />
      ))}
      <line x1={gx(0)} y1={gy(0)} x2={gx(0.2) + 16} y2={gy(0)} className="oa-axis" />
      <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(3.2) - 6} className="oa-axis" />
      {[0, 0.05, 0.1, 0.15, 0.2].map((i) => (
        <text key={i} x={gx(i)} y={gy(0) + 18} textAnchor="middle" className="td-small">
          {i * 1000}
        </text>
      ))}
      <text x={gx(0.2) + 12} y={gy(0) + 34} textAnchor="end" className="oa-lbl">
        I (mA)
      </text>
      {[0, 1, 2, 3].map((u) => (
        <text key={u} x={gx(0) - 8} y={gy(u) + 4} textAnchor="end" className="td-small">
          {u}
        </text>
      ))}
      <text x={gx(0) - 4} y={gy(3.2) - 12} textAnchor="middle" className="oa-lbl">
        U (V)
      </text>
      <line x1={gx(0)} y1={gy(3)} x2={gx(0.2)} y2={gy(0)} className="pw-curve-purple" data-part="line" />
      <text x={gx(0.005)} y={gy(3) - 8} className="oa-lbl" data-part="emf">
        E = 3 V
      </text>
      <text x={gx(0.185)} y={gy(0) - 10} textAnchor="end" className="oa-lbl" data-part="isc">
        {tr('短路 E/r = 200 mA', 'short: E/r = 200 mA')}
      </text>
      <text x={gx(0.115)} y={gy(1.275) + 20} className="td-small" data-part="line" transform={`rotate(32 ${gx(0.115)} ${gy(1.275) + 20})`}>
        {tr('斜率 = −r = −15 Ω', 'slope = −r = −15 Ω')}
      </text>
      {pts.map(([id, i, u, label], k) => (
        <g key={id} data-part={id}>
          <line x1={gx(i)} y1={gy(u)} x2={gx(i)} y2={gy(0)} className="oa-dash" />
          <circle cx={gx(i)} cy={gy(u)} r={6} className="pw-pt" />
          <text x={gx(i) + 10} y={gy(u) + (k === 0 ? -10 : k === 1 ? -8 : -10)} className="td-small" fontWeight={700}>
            {label}
          </text>
        </g>
      ))}
    </g>
  );
}

/* --------------------------------------------------------------- layer 5: coin cell + LED */

function CoinLed({ layer }: { layer: number }) {
  const by = (mA: number) => 370 - mA * 5;
  return (
    <g className={vis(layer, 5, 5)}>
      <rect x={24} y={120} width={104} height={250} rx={10} className="pw-dashbox" />
      <text x={128} y={112} textAnchor="end" className="oa-lbl">
        CR2032
      </text>
      <Src x={73} y={310} r={20} part="emf" />
      <text x={99} y={306} className="td-small">
        E
      </text>
      <text x={99} y={322} className="td-small">
        3 V
      </text>
      <path d="M73 290 L73 270" className="oa-wire" />
      <Res x1={73} y1={270} x2={73} y2={170} part="rint" />
      <text x={86} y={224} className="oa-lbl" data-part="rint">
        15 Ω
      </text>
      <path d="M73 170 L73 80 L140 80" className="oa-wire" />
      <Res x1={140} y1={80} x2={230} y2={80} part="r47" />
      <text x={185} y={64} textAnchor="middle" className="oa-lbl" data-part="r47">
        47 Ω
      </text>
      <path d="M230 80 L270 80 L270 150" className="oa-wire" />
      {/* LED model: V_f + 12 Ω */}
      <rect x={236} y={140} width={82} height={190} rx={10} className="pw-dashbox" data-part="ledm" />
      <g data-part="ledm">
        <polygon points="256,160 284,160 270,184" fill="#e63946" stroke="#1f2a44" strokeWidth={1.5} />
        <line x1={256} y1={186} x2={284} y2={186} className="oa-wire" />
        <text x={288} y={178} className="td-small">
          1.8 V
        </text>
      </g>
      <line x1={270} y1={186} x2={270} y2={220} className="oa-wire" />
      <Res x1={270} y1={220} x2={270} y2={300} part="ledm" />
      <text x={284} y={266} className="td-small" data-part="ledm">
        12 Ω
      </text>
      <text x={314} y={346} textAnchor="end" className="td-small" data-part="ledm">
        LED
      </text>
      <path d="M270 300 L270 390 L73 390 L73 330" className="oa-wire" />

      {/* bars */}
      <line x1={340} y1={370} x2={540} y2={370} className="oa-axis" />
      <g data-part="p0">
        <rect x={360} y={by(44)} width={60} height={44 * 5} fill="#e63946" opacity={0.75} />
        <text x={390} y={by(44) - 8} textAnchor="middle" className="oa-lbl">
          44 mA
        </text>
        <text x={390} y={388} textAnchor="middle" className="td-small">
          {tr('无电阻', 'no resistor')}
        </text>
      </g>
      <g data-part="p47">
        <rect x={450} y={by(16.2)} width={60} height={16.2 * 5} fill="#2ba59b" opacity={0.8} />
        <text x={480} y={by(16.2) - 8} textAnchor="middle" className="oa-lbl">
          16 mA
        </text>
        <text x={480} y={388} textAnchor="middle" className="td-small">
          + 47 Ω
        </text>
      </g>
      <g data-part="imax">
        <line x1={346} y1={by(20)} x2={536} y2={by(20)} className="pw-curve-red" style={{ strokeWidth: 1.6 }} strokeDasharray="6 4" />
        <text x={538} y={by(20) - 6} textAnchor="end" className="pw-lbl-red" fontSize={11}>
          {tr('LED 上限 20 mA', 'LED max 20 mA')}
        </text>
      </g>
    </g>
  );
}

/* --------------------------------------------------------------- layer 6: + / − and GND */

function Terminals({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 6, 6)}>
      <line x1={60} y1={100} x2={530} y2={100} className="oa-wire plus" style={{ strokeWidth: 4 }} data-part="rail-p" />
      <text x={530} y={88} textAnchor="end" className="pw-lbl-red" fontSize={13} data-part="rail-p">
        {tr('红轨 VCC = +9 V', 'red rail VCC = +9 V')}
      </text>
      <line x1={60} y1={340} x2={530} y2={340} className="oa-wire minus" style={{ strokeWidth: 4 }} data-part="rail-n" />
      <text x={530} y={366} textAnchor="end" className="pw-lbl-blue" fontSize={13} data-part="rail-n">
        {tr('蓝轨 GND = 0 V', 'blue rail GND = 0 V')}
      </text>
      {/* battery symbol */}
      <g data-part="bat">
        <line x1={90} y1={100} x2={90} y2={220} className="oa-wire" />
        <line x1={66} y1={220} x2={114} y2={220} className="oa-wire" style={{ strokeWidth: 2.4 }} />
        <line x1={78} y1={232} x2={102} y2={232} className="oa-wire" style={{ strokeWidth: 5 }} />
        <line x1={90} y1={232} x2={90} y2={340} className="oa-wire" />
        <text x={120} y={216} className="oa-lbl plus">
          +
        </text>
        <text x={120} y={244} className="oa-lbl minus">
          −
        </text>
        <text x={58} y={232} textAnchor="end" className="oa-lbl">
          9 V
        </text>
      </g>
      {/* a branch: 470 Ω + red LED */}
      <Res x1={260} y1={100} x2={260} y2={210} part="r470" />
      <text x={274} y={160} className="td-small" data-part="r470">
        470 Ω
      </text>
      <circle cx={260} cy={226} r={4} className="oa-term" data-part="mid" />
      <line x1={260} y1={210} x2={260} y2={262} className="oa-wire" />
      <polygon points="246,262 274,262 260,286" fill="#e63946" stroke="#1f2a44" strokeWidth={1.5} data-part="led" />
      <line x1={246} y1={288} x2={274} y2={288} className="oa-wire" />
      <line x1={260} y1={288} x2={260} y2={340} className="oa-wire" />
      {/* node voltages */}
      <g data-part="v-top">
        <circle cx={420} cy={100} r={6} className="pw-pt" />
        <text x={420} y={130} textAnchor="middle" className="pw-lbl-red" fontSize={13}>
          A: V = 9 V
        </text>
      </g>
      <g data-part="mid">
        <text x={252} y={230} textAnchor="end" className="pw-lbl-purple" fontSize={13}>
          V ≈ 1.98 V
        </text>
      </g>
      <g data-part="v-bot">
        <circle cx={420} cy={340} r={6} className="pw-pt" />
        <text x={420} y={324} textAnchor="middle" className="pw-lbl-blue" fontSize={13}>
          B: V = 0 V
        </text>
      </g>
      {/* several ground symbols hanging off the − rail = one node */}
      <g data-part="gnd">
        <line x1={160} y1={340} x2={160} y2={356} className="oa-wire" />
        <Gnd x={160} y={356} />
        <line x1={350} y1={340} x2={350} y2={356} className="oa-wire" />
        <Gnd x={350} y={356} />
        <path d="M160 384 Q 255 410 350 384" className="oa-dash" fill="none" />
        <text x={255} y={424} textAnchor="middle" className="td-small">
          {tr('画了几个 ⏚，其实是同一个结点', 'several ⏚ drawn, one and the same node')}
        </text>
      </g>
      <g data-part="u">
        <path d="M480 330 L480 112" className="oa-vd" markerEnd="url(#bt-ah-v)" />
        <text x={488} y={244} className="pw-lbl-purple" fontSize={13}>
          {sub('U_AB')}
        </text>
        <text x={488} y={262} className="pw-lbl-purple" fontSize={13}>
          = 9 − 0
        </text>
      </g>
    </g>
  );
}

/* --------------------------------------------------------------- layer 7: limits (discharge) */

function Limits({ layer }: { layer: number }) {
  // 9 V alkaline at ~25 mA: 9.4 V fresh → plateau ~8 V → knee → 5.4 V cut-off
  const x = (p: number) => 90 + p * 4.2; // % used 0..100
  const y = (v: number) => 380 - ((v - 4) / 6) * 280; // 4..10 V
  const curve: [number, number][] = [
    [0, 9.5],
    [5, 9.1],
    [20, 8.6],
    [40, 8.2],
    [60, 7.8],
    [75, 7.3],
    [85, 6.7],
    [93, 6.0],
    [100, 5.4],
  ];
  return (
    <g className={vis(layer, 7)}>
      <rect x={30} y={40} width={510} height={380} rx={14} className="td-panel" />
      <text x={285} y={66} textAnchor="middle" className="td-panel-title">
        {tr('真实 9 V 电池：一边用，E 一边降，r 一边升', 'A real 9 V battery: as it drains E falls and r rises')}
      </text>
      <line x1={x(0)} y1={y(4)} x2={x(100) + 10} y2={y(4)} className="oa-axis" />
      <line x1={x(0)} y1={y(4)} x2={x(0)} y2={y(10)} className="oa-axis" />
      {[5, 6, 7, 8, 9, 10].map((v) => (
        <g key={v}>
          <line x1={x(0)} y1={y(v)} x2={x(100)} y2={y(v)} className="pw-grid" />
          <text x={x(0) - 8} y={y(v) + 4} textAnchor="end" className="td-small">
            {v}
          </text>
        </g>
      ))}
      {[0, 25, 50, 75, 100].map((p) => (
        <text key={p} x={x(p)} y={y(4) + 18} textAnchor="middle" className="td-small">
          {p}%
        </text>
      ))}
      <text x={x(100)} y={y(4) + 34} textAnchor="end" className="oa-lbl">
        {tr('已用掉的容量', 'capacity used')}
      </text>
      <text x={x(0) - 6} y={y(10) - 16} textAnchor="middle" className="oa-lbl">
        U (V)
      </text>
      <line x1={x(0)} y1={y(9)} x2={x(100)} y2={y(9)} className="pw-curve-green" strokeDasharray="7 4" style={{ strokeWidth: 2 }} data-part="model" />
      <text x={x(52)} y={y(9) - 8} className="pw-lbl-green" fontSize={12} data-part="model">
        {tr('仿真：E = 9 V 恒定，r = 1.5 Ω', 'simulator: E = 9 V fixed, r = 1.5 Ω')}
      </text>
      <polyline points={curve.map(([p, v]) => `${x(p)},${y(v)}`).join(' ')} className="pw-curve-red" data-part="real" />
      <text x={x(30)} y={y(7.6)} className="pw-lbl-red" fontSize={12} data-part="real">
        {tr('真实（约 25 mA 放电）', 'real (≈ 25 mA load)')}
      </text>
      <line x1={x(0)} y1={y(5.4)} x2={x(100)} y2={y(5.4)} className="oa-dash" data-part="cutoff" />
      <text x={x(4)} y={y(5.4) - 6} className="td-small" data-part="cutoff">
        {tr('截止 ≈ 5.4 V（每节 0.9 V）', 'cut-off ≈ 5.4 V (0.9 V per cell)')}
      </text>
      <text x={x(4)} y={y(4.4)} className="td-small" data-part="rgrow">
        {tr('内阻：新 ≈ 1.5 Ω → 快没电 ≈ 5–10 Ω', 'r: fresh ≈ 1.5 Ω → nearly empty ≈ 5–10 Ω')}
      </text>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="bt-ah-i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pw-ah-cur" />
        </marker>
        <marker id="bt-ah-v" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pw-ah-accent" />
        </marker>
        <marker id="bt-ah-e" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#2b59c3" />
        </marker>
      </defs>
      <g className={vis(layer, 0, 1)}>
        <NineVolt layer={layer} />
        <AAPack layer={layer} />
        <Coin layer={layer} />
      </g>
      <Chemistry layer={layer} />
      <Model layer={layer} />
      <ULine layer={layer} />
      <CoinLed layer={layer} />
      <Terminals layer={layer} />
      <Limits layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'battery',
    title: tr('电池：电动势 E + 内阻 r', 'Battery: an EMF E plus an internal resistance r'),
    subtitle: tr(
      '课程里用到三种电池：9 V 方块电池、AA 电池盒、CR2032 纽扣电池。我们把它们拆开，找到每一节 cell（电芯），从化学反应得到 EMF（电动势），再画出电路课里的模型——理想电压源串一个 internal resistance（内阻）——并用它算出“带上负载以后电压为什么会掉”。',
      'The course uses three batteries: the 9 V block, an AA pack and a CR2032 coin cell. We open them up, find the cells inside, get the EMF from the chemistry, draw the model used in circuit analysis — an ideal source in series with an internal resistance — and use it to work out why the voltage sags under load.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'outside',
        short: tr('外形', 'Outside'),
        title: tr('① 外形：课程里的三种电池', '① Outside: the three batteries in the course'),
        body: tr(
          `在模拟器里选中一个电池，属性里可以换 **variant（型号）**。它们看起来完全不一样，但电路上都只有两个端子：[[plus|+ 正极]] 和 [[minus|− 负极]]。
- [[b9v|9 V 方块电池]]：顶上两个按扣（snap）。小的圆柱形是 **+**，大的六角形是 **−**——形状不同，电池扣就插不反。
- [[aa|AA 电池盒]]：2、3、4 节 AA 串联，得到 3 V、4.5 V、6 V；红线 +、黑线 −。
- [[coin|CR2032 纽扣电池]]：直径 20 mm、厚 3.2 mm（名字就是这么来的：CR + 20 + 32）。刻着字的大平面是 **+**，另一面较小的圆片是 **−**。

下表是模拟器里用的数字，后面几层都会用到。注意最后一列：它们的 **内阻差了 100 倍**。`,
          `Select a battery in the simulator and you can change its **variant** in the properties. They look nothing alike, but electrically each has just two terminals: [[plus|+ (positive)]] and [[minus|− (negative)]].
- [[b9v|9 V block]]: two snaps on top. The small round one is **+**, the bigger hexagonal one is **−** — different shapes, so the clip can't go on backwards.
- [[aa|AA holder]]: 2, 3 or 4 AA cells in series give 3 V, 4.5 V or 6 V; red lead +, black lead −.
- [[coin|CR2032 coin cell]]: 20 mm across, 3.2 mm thick (that's the name: CR + 20 + 32). The big flat face with the writing is **+**, the smaller disc on the other side is **−**.

The table lists the numbers the simulator uses; the next layers use them. Look at the last column: their **internal resistances differ by a factor of 100**.`,
        ),
        table: {
          head: [tr('型号', 'Variant'), tr('里面', 'Inside'), tr('E（电动势）', 'E (EMF)'), tr('r（内阻）', 'r (internal R)'), tr('短路电流 E/r', 'short-circuit E/r')],
          rows: [
            [tr('9 V 方块', '9 V block'), tr('6 节 1.5 V 串联', '6 × 1.5 V in series'), '9 V', '1.5 Ω', '6 A'],
            ['2 × AA', tr('2 节串联', '2 in series'), '3 V', '0.3 Ω', '10 A'],
            ['3 × AA', tr('3 节串联', '3 in series'), '4.5 V', '0.45 Ω', '10 A'],
            ['4 × AA', tr('4 节串联', '4 in series'), '6 V', '0.6 Ω', '10 A'],
            ['CR2032', tr('1 节锂电池', '1 lithium cell'), '3 V', '15 Ω', '0.2 A'],
          ],
          parts: ['b9v', 'aa', 'aa', 'aa', 'coin'],
        },
        callouts: [
          { part: 'plus', label: tr('+ 小圆扣', '+ small stud'), x: 80, y: 92, lx: 28, ly: 30, anchor: 'start' },
          { part: 'minus', label: tr('− 六角扣', '− hex snap'), x: 160, y: 92, lx: 200, ly: 108, anchor: 'start' },
        ],
        calcs: ['battery-terminal-voltage'],
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：9 V 电池里是 6 节 1.5 V', '② X-ray: a 9 V battery is six 1.5 V cells'),
        body: tr(
          `把外壳变透明：
- [[cells|9 V 方块电池]] 里面是 **6 节细长的 1.5 V 碱性电芯**（AAAA 尺寸），一正一反排成一排，用金属片首尾相连——一节的 − 接下一节的 +，这就是 **series（串联）**。第一节的 + 接到小圆扣，最后一节的 − 接到六角扣。
- [[aa|AA 电池盒]] 也一样：盒底的金属片把第一节的 − 接到第二节的 +，所以 1.5 V + 1.5 V = 3 V。
- [[coin|CR2032]] 只有 **一节**，但化学体系不同：负极是金属锂 [[anode|Li]]，正极是二氧化锰 [[cathode|MnO₂]]，中间隔着 [[separator|隔膜 separator]]。锂的电动势高，一节就有 3 V；但电极是薄薄的一层，面积小——这就是它内阻大（15 Ω）的原因。

**结论**：一节电芯的电压由化学决定（1.5 V、3 V……），想要更高的电压就把好几节 **串起来**。`,
          `Make the cases transparent:
- inside the [[cells|9 V block]] are **six slim 1.5 V alkaline cells** (AAAA size), alternately up and down in a row, joined end to end by metal straps — one cell's − to the next cell's +. That is **series**. The first cell's + goes to the small stud, the last cell's − to the hex snap.
- the [[aa|AA holder]] is the same: the strap at the bottom joins cell 1's − to cell 2's +, so 1.5 V + 1.5 V = 3 V.
- the [[coin|CR2032]] is **one** cell of a different chemistry: lithium metal [[anode|Li]] as the negative, manganese dioxide [[cathode|MnO₂]] as the positive, with a [[separator|separator]] between. Lithium gives a higher EMF, 3 V from one cell; but the electrodes are thin layers with a small area — that is why its internal resistance is large (15 Ω).

**Bottom line**: one cell's voltage is fixed by its chemistry (1.5 V, 3 V …); for more voltage you **stack cells in series**.`,
        ),
        callouts: [
          { part: 'cells', label: tr('6 节电芯', '6 cells'), x: 120, y: 200, lx: 210, ly: 108, anchor: 'start' },
          { part: 'separator', label: tr('隔膜', 'separator'), x: 520, y: 243, lx: 548, ly: 345, anchor: 'end' },
        ],
      },
      {
        id: 'chemistry',
        short: tr('化学', 'Chemistry'),
        title: tr('③ 电动势从哪来：化学反应把电子“推”到负极', '③ Where the EMF comes from: chemistry pushes electrons to the − end'),
        body: tr(
          `切开一节碱性 AA：中心是 [[anode|锌膏（Zn）]]，外圈是 [[cathode|二氧化锰（MnO₂）]]，中间是浸满 KOH 电解液的 [[separator|隔膜]]，钢壳是 [[plus|+ 极]]，中间那根铜钉连到底部的 [[minus|− 极]]。

- 负极（anode）：锌被氧化，**放出** 电子：$Zn + 2OH^{-} → ZnO + H_{2}O + 2e^{-}$
- 正极（cathode）：二氧化锰被还原，**吃掉** 电子：$2MnO_{2} + H_{2}O + 2e^{-} → Mn_{2}O_{3} + 2OH^{-}$

两个反应的“推力”之差就是 **EMF（electromotive force，电动势）** E ≈ 1.5 V。它不是电阻上的压降，而是化学能变成电能的本事：每把 1 C 的电荷从 − 搬到 +，化学反应做 1.5 J 的功。

只有接上 [[load|外电路]] 反应才进行：[[electrons|电子 e⁻]] 从锌出发，经过外电路流到正极；我们画的 **电流 I** 方向规定为正电荷方向，正好相反——从 + 出来，经负载，回到 −。

[[series|串联]] 时每节的 E 相加、内阻也相加：$E = n·E_{cell}$，$r = n·r_{cell}$。9 V 电池：6 × 1.5 V = 9 V，6 × 0.25 Ω = 1.5 Ω。`,
          `Cut an alkaline AA open: in the centre is [[anode|zinc gel (Zn)]], around it [[cathode|manganese dioxide (MnO₂)]], between them a [[separator|separator]] soaked in KOH electrolyte; the steel can is the [[plus|+ terminal]] and the brass nail in the middle goes to the [[minus|− terminal]] at the bottom.

- Negative electrode (anode): zinc is oxidised and **gives up** electrons: $Zn + 2OH^{-} → ZnO + H_{2}O + 2e^{-}$
- Positive electrode (cathode): MnO₂ is reduced and **takes** electrons: $2MnO_{2} + H_{2}O + 2e^{-} → Mn_{2}O_{3} + 2OH^{-}$

The difference in the "push" of the two reactions is the **EMF (electromotive force)** E ≈ 1.5 V. It is not a drop across a resistor; it is the cell's ability to turn chemical energy into electrical energy: for every 1 C moved from − to +, the reaction does 1.5 J of work.

The reaction only runs when an [[load|external circuit]] is connected: [[electrons|electrons e⁻]] leave the zinc and travel through the outside circuit to the positive electrode; the **current I** we draw is defined as the flow of positive charge, the opposite way — out of +, through the load, back into −.

In [[series|series]] the cells' E add and so do their resistances: $E = n·E_{cell}$, $r = n·r_{cell}$. The 9 V block: 6 × 1.5 V = 9 V, 6 × 0.25 Ω = 1.5 Ω.`,
        ),
        table: {
          head: [tr('化学体系', 'Chemistry'), tr('每节电动势', 'EMF per cell'), tr('例子', 'Examples'), tr('特点', 'Notes')],
          rows: [
            [tr('碱性 Zn / MnO₂', 'alkaline Zn / MnO₂'), '1.5 V', 'AA, AAA, 9 V', tr('便宜，内阻中等', 'cheap, moderate r')],
            [tr('锂 Li / MnO₂', 'lithium Li / MnO₂'), '3.0 V', 'CR2032', tr('电压高、自放电小，但内阻大', 'high voltage, low self-discharge, but large r')],
            [tr('镍氢 NiMH', 'NiMH'), '1.2 V', tr('充电 AA', 'rechargeable AA'), tr('内阻小，能给大电流', 'low r, high current')],
            [
              tr('锂离子 Li-ion', 'Li-ion'),
              tr('3.7 V（4.2 → 3.0 V）', '3.7 V (4.2 → 3.0 V)'),
              '18650',
              tr('见“稳压器”拆解：配 LDO 的坑', 'see the regulator teardown: the LDO trap'),
            ],
          ],
          parts: ['anode', 'cathode', null, null],
        },
        formulas: [{ tex: 'E = n·E_{cell}, r = n·r_{cell}', note: tr('n 节相同的电芯串联', 'n identical cells in series') }],
      },
      {
        id: 'model',
        short: tr('等效电路', 'Model'),
        title: tr('④ 等效电路：理想电压源 E 串联内阻 r', '④ Equivalent circuit: an ideal source E in series with r'),
        body: tr(
          `电路课里把电池画成 [[box|虚线框里的两个元件]]：
1. [[emf|理想电压源 E]]：不管流过多少电流，它两端永远是 E——这代表化学反应的“推力”；
2. [[rint|内阻 r]]：电流在电解液、电极、连接片里走，都会遇到电阻。把它们合起来，就是一个和 E **串联** 的电阻。

我们在外面能摸到、能测到的只有两个端子 [[plus|+]] 和 [[minus|−]]，它们之间的电压叫 **terminal voltage（端电压）** [[u|U]]。接上 [[load|负载 R_L]] 以后，电流 [[cur|I]] 流过 r，在 r 上产生压降 $I·r$——这部分电压“被电池自己吃掉了”，到不了负载。

这就是“电压源的实际模型”。它和戴维南等效电路（Thévenin equivalent）是同一个东西：$E = U_{oc}$（开路电压），$r = R_{th}$。`,
          `In circuit analysis a battery is drawn as [[box|two elements inside the dashed box]]:
1. [[emf|an ideal voltage source E]]: whatever current flows, its voltage is always E — the "push" of the chemistry;
2. [[rint|the internal resistance r]]: the current meets resistance in the electrolyte, the electrodes and the straps. Lumped together that is one resistor **in series** with E.

All we can touch and measure from outside are the two terminals [[plus|+]] and [[minus|−]]; the voltage between them is the **terminal voltage** [[u|U]]. With a [[load|load R_L]] connected, the current [[cur|I]] flows through r and drops $I·r$ across it — voltage the battery "uses up" itself, which never reaches the load.

This is the "practical voltage source" model. It is exactly a Thévenin equivalent: $E = U_{oc}$ (the open-circuit voltage), $r = R_{th}$.`,
        ),
        table: {
          head: [tr('符号', 'Symbol'), tr('名字', 'Name'), tr('物理意义', 'Physical meaning'), tr('怎么测', 'How to measure')],
          rows: [
            ['E', tr('电动势 EMF', 'EMF'), tr('化学反应的推力', 'the chemistry’s push'), tr('不接负载时用电压表量 U（I = 0 → U = E）', 'voltmeter with no load (I = 0 → U = E)')],
            [
              'r',
              tr('内阻', 'internal resistance'),
              tr('电解液 + 电极 + 连接', 'electrolyte + electrodes + straps'),
              tr('接一个已知负载，$r = \\frac{E - U}{I}$', 'add a known load, $r = \\frac{E - U}{I}$'),
            ],
            ['U', tr('端电压', 'terminal voltage'), tr('负载真正拿到的电压', 'what the load actually gets'), tr('带载时量 + 和 −', 'measure + to − under load')],
            ['I', tr('电流', 'current'), tr('由负载决定', 'set by the load'), tr('电流表串联', 'ammeter in series')],
          ],
          parts: ['emf', 'rint', 'u', 'cur'],
        },
        calcs: ['battery-terminal-voltage'],
      },
      {
        id: 'calc',
        short: tr('U = E − Ir', 'U = E − Ir'),
        title: tr('⑤ 推公式：U = E − I·r，以及电池的外特性直线', '⑤ Derivation: U = E − I·r and the battery’s output line'),
        body: tr(
          `对上一层的回路写 KVL（Kirchhoff’s voltage law，基尔霍夫电压定律），从 − 端出发绕一圈：
1. 经过 E 升高 E，经过 r 降低 $I·r$，经过负载降低 $I·R_L$：$E - I·r - I·R_L = 0$
2. 所以电流 $I = \\frac{E}{r + R_L}$
3. 端电压就是负载上的电压：$U = I·R_L = E - I·r$

$U = E - I·r$ 在 U–I 平面上是一条 [[line|斜率为 −r 的直线]]（右图，CR2032）：
- I = 0（开路）时 [[emf|U = E = 3 V]]；
- 负载越重（R_L 越小、I 越大），U 越低；
- U = 0 时 [[isc|I = E/r]]——**短路电流**，是这块电池能给出的最大电流。CR2032：3 / 15 = 0.2 A；9 V 电池：9 / 1.5 = 6 A。

**带数字**（挑战 9）：CR2032 → 47 Ω → 红色 LED（$V_f$ = 1.8 V，内阻 12 Ω）：
$$I = \\frac{3 - 1.8}{15 + 47 + 12} = \\frac{1.2}{74} = 16.2 mA$$
$$U = 3 - 0.0162 × 15 = 2.76 V$$
这就是 [[p47|工作点]]，测试要求的“端电压约 2.75 V”就是它。

再看第 2 课的 9 V 电池：两条支路（470 Ω + 红 LED、470 Ω + 黄 LED）共约 29 mA，$U = 9 - 0.029 × 1.5 ≈ 8.96 V$——内阻只有 1.5 Ω，压降 0.04 V，几乎看不出来。**内阻要不要考虑，看 I·r 和 E 比起来大不大。**

最后一个点：负载从电池拿到的功率 $P = U·I = \\frac{E^{2}R_L}{(r + R_L)^{2}}$，在 [[pmax|R_L = r]] 时最大，$P_{max} = \\frac{E^{2}}{4r}$（CR2032：0.15 W）——这就是“最大功率传输定理”。`,
          `Write KVL (Kirchhoff’s voltage law) around the loop of the last layer, starting at the − terminal:
1. Up E through the source, down $I·r$ across r, down $I·R_L$ across the load: $E - I·r - I·R_L = 0$
2. So the current is $I = \\frac{E}{r + R_L}$
3. The terminal voltage is the load's voltage: $U = I·R_L = E - I·r$

$U = E - I·r$ is a [[line|straight line of slope −r]] in the U–I plane (right, for a CR2032):
- at I = 0 (open circuit) [[emf|U = E = 3 V]];
- the heavier the load (smaller R_L, larger I), the lower U;
- U = 0 at [[isc|I = E/r]] — the **short-circuit current**, the most this battery can ever deliver. CR2032: 3 / 15 = 0.2 A; 9 V block: 9 / 1.5 = 6 A.

**With numbers** (challenge 9): CR2032 → 47 Ω → red LED ($V_f$ = 1.8 V, 12 Ω inside):
$$I = \\frac{3 - 1.8}{15 + 47 + 12} = \\frac{1.2}{74} = 16.2 mA$$
$$U = 3 - 0.0162 × 15 = 2.76 V$$
That is the [[p47|operating point]], and it is the "terminal voltage about 2.75 V" the test checks.

Now lesson 2's 9 V battery: two branches (470 Ω + red LED, 470 Ω + yellow LED) draw about 29 mA together, $U = 9 - 0.029 × 1.5 ≈ 8.96 V$ — with only 1.5 Ω the drop is 0.04 V, hardly visible. **Whether r matters depends on how big I·r is compared with E.**

One more point: the power the load gets, $P = U·I = \\frac{E^{2}R_L}{(r + R_L)^{2}}$, is largest at [[pmax|R_L = r]], $P_{max} = \\frac{E^{2}}{4r}$ (CR2032: 0.15 W) — the maximum power transfer theorem.`,
        ),
        formulas: [
          { tex: 'I = \\frac{E}{r + R_L}', note: tr('KVL：E 被 r 和 R_L 分掉', 'KVL: E is shared by r and R_L') },
          { tex: 'U = E - I·r', note: tr('端电压：电流越大越低', 'terminal voltage: lower at higher current') },
          { tex: 'I_{sc} = \\frac{E}{r}', note: tr('短路电流 = 最大电流', 'short-circuit current = the maximum') },
          { tex: 'P_{max} = \\frac{E^{2}}{4r}', note: tr('R_L = r 时负载功率最大', 'load power peaks at R_L = r') },
        ],
        calcs: ['battery-terminal-voltage', 'ohm', 'power', 'max-power'],
      },
      {
        id: 'coin-led',
        short: tr('纽扣点灯', 'Coin + LED'),
        title: tr('⑥ 纽扣电池能“不加电阻”点 LED？——算一算', '⑥ Can a coin cell light an LED “without a resistor”? Do the sum'),
        body: tr(
          `网上常说 CR2032 可以直接点 LED，因为它的 [[rint|15 Ω 内阻]] 本身就在限流。这话 **一半对**：确实有一个电阻在限流，它就在电池里。但限得够不够？把 [[r47|47 Ω]] 拿掉，回路里只剩 15 Ω + [[ledm|LED 的 12 Ω]]：
$$I = \\frac{E - V_f}{r + R_{LED}} = \\frac{3 - 1.8}{15 + 12} = 44 mA$$
[[p0|44 mA]] 是普通 LED 最大电流（[[imax|20 mA]]）的两倍多。再看电池这边：
- 内阻上发热 $I^{2}r = 0.044^{2} × 15 = 29 mW$；
- CR2032 的标称容量约 220 mAh 是在 **0.2 mA** 这种小电流下测的。几十 mA 时化学反应跟不上，电压很快塌下去，实际能放出的电量少得多。

加上 47 Ω：[[p47|16 mA]]，LED 亮度合适，电池也轻松。

**为什么“不加电阻”有时看起来也行？** 蓝、白 LED 的 $V_f$ ≈ 3.0 V，和 E 一样大，电流本来就很小；而且电池越用 E 越低、r 越大。靠内阻限流就是靠一个 **你控制不了、会变** 的数。工程上的做法：**电流由你选的电阻决定，不由电池的内阻决定。**`,
          `You often read that a CR2032 can drive an LED directly because its [[rint|15 Ω internal resistance]] limits the current. That is **half right**: there is a current-limiting resistor — it is inside the battery. But is it enough? Remove the [[r47|47 Ω]] and the loop holds only 15 Ω + [[ledm|the LED's 12 Ω]]:
$$I = \\frac{E - V_f}{r + R_{LED}} = \\frac{3 - 1.8}{15 + 12} = 44 mA$$
[[p0|44 mA]] is more than twice a normal LED's [[imax|20 mA]] maximum. And on the battery side:
- the heat in r is $I^{2}r = 0.044^{2} × 15 = 29 mW$;
- the CR2032's rated ~220 mAh is measured at about **0.2 mA**. At tens of mA the chemistry can't keep up, the voltage collapses early and you get far less charge out.

With the 47 Ω: [[p47|16 mA]], the LED is nicely bright and the cell is comfortable.

**Why does "no resistor" sometimes seem fine?** Blue and white LEDs have $V_f$ ≈ 3.0 V, about E, so the current is small anyway; and as the cell drains, E falls and r grows. Limiting with the internal resistance means relying on a number **you don't control and that drifts**. The engineering rule: **the current is set by a resistor you chose, not by the battery's internal resistance.**`,
        ),
        table: {
          head: [tr('电路', 'Circuit'), tr('回路总电阻', 'Loop resistance'), 'I', tr('端电压 U', 'Terminal U'), tr('评价', 'Verdict')],
          rows: [
            [tr('CR2032 + LED', 'CR2032 + LED'), '15 + 12 = 27 Ω', '44 mA', '2.33 V', tr('LED 过流，电池过载', 'LED over-driven, cell overloaded')],
            [tr('CR2032 + 47 Ω + LED', 'CR2032 + 47 Ω + LED'), '74 Ω', '16 mA', '2.76 V', tr('正好（挑战 9）', 'just right (challenge 9)')],
            [tr('9 V + LED（没电阻）', '9 V + LED (no resistor)'), '1.5 + 12 = 13.5 Ω', '530 mA', '8.2 V', tr('LED 立刻烧毁', 'the LED dies instantly')],
          ],
          parts: ['p0', 'p47', null],
        },
        formulas: [
          { tex: 'I = \\frac{E - V_f}{r + R + R_{LED}}', note: tr('内阻和你的电阻、LED 的电阻串在一起', 'r is in series with your resistor and the LED’s own resistance') },
        ],
        calcs: ['led-resistor', 'battery-terminal-voltage'],
      },
      {
        id: 'gnd',
        short: tr('+ / − / GND', '+ / − / GND'),
        title: tr('⑦ + 和 −，以及 GND 到底是什么', '⑦ + and −, and what GND really means'),
        body: tr(
          `电压永远是 **两点之间的差**：$U_{AB} = V_A - V_B$。说“某点是 5 V”时省略了“相对谁”。这个默认的参考点就是 **GND（ground，地）**，规定它是 0 V。

在电池供电的电路里，我们把 [[bat|电池的 − 端]] 定义为 GND。于是：
- [[rail-p|红轨]] 接 +，所有点都是 [[v-top|9 V]]；
- [[rail-n|蓝轨]] 接 −，所有点都是 [[v-bot|0 V]]；
- 电路里任何一点的“电压”都是它相对蓝轨的电压，例如 [[mid|LED 正极]] 是 $1.8 + 0.0149 × 12 ≈ 1.98 V$。

原理图里画了好几个 [[gnd|⏚ 地符号]]，意思都是“这根线接回电源 −”，它们在实物上是 **同一个结点**。GND 不是大地，也不是“电流消失的地方”：电流从 + 出来，流过负载，**全部** 从 − 回到电池里（return path，回路）。

一个常见的坑：两个电源（比如电池和开发板）一起用时，它们的 − 必须连在一起，“0 V”才是同一个 0 V。`,
          `A voltage is always **a difference between two points**: $U_{AB} = V_A - V_B$. "This point is at 5 V" leaves out "relative to what". That default reference point is **GND (ground)**, defined as 0 V.

In a battery-powered circuit we define [[bat|the battery's − terminal]] as GND. Then:
- the [[rail-p|red rail]] is on +, every point on it is at [[v-top|9 V]];
- the [[rail-n|blue rail]] is on −, every point on it is at [[v-bot|0 V]];
- "the voltage" of any point in the circuit is its voltage relative to the blue rail, e.g. [[mid|the LED's anode]] is at $1.8 + 0.0149 × 12 ≈ 1.98 V$.

A schematic may show several [[gnd|⏚ ground symbols]]; each means "this wire goes back to the supply's −", and in the real circuit they are **one node**. GND is not the earth and not "where current disappears": current leaves +, flows through the load and **all of it** returns into the battery at − (the return path).

A classic trap: when two supplies are used together (say a battery and a dev board), their − terminals must be connected, or the two "0 V"s are not the same 0 V.`,
        ),
        table: {
          head: [tr('名字', 'Name'), tr('接哪', 'Where'), tr('电压（相对 GND）', 'Voltage (to GND)'), tr('面包板上', 'On the breadboard')],
          rows: [
            ['+ / VCC', tr('电池正极', 'battery +'), '+9 V', tr('红轨（+）', 'red rail (+)')],
            ['− / GND', tr('电池负极', 'battery −'), tr('0 V（定义）', '0 V (by definition)'), tr('蓝轨（−）', 'blue rail (−)')],
            [tr('LED 正极', 'LED anode'), tr('470 Ω 和 LED 之间', 'between 470 Ω and the LED'), '≈ 1.98 V', tr('某一列', 'some column')],
          ],
          parts: ['rail-p', 'rail-n', 'mid'],
        },
        formulas: [{ tex: 'U_{AB} = V_A - V_B', note: tr('V_B = GND = 0 V 时，U_AB 就是 A 点的“电压”', 'with V_B = GND = 0 V, U_AB is simply “the voltage at A”') }],
      },
      {
        id: 'limits',
        short: tr('局限', 'Limits'),
        title: tr('⑧ 模型的局限：真实电池的 E 和 r 都在变', '⑧ Limits: in a real battery both E and r change'),
        body: tr(
          `模拟器里电池是 [[model|E 和 r 都不变]] 的理想模型。真实电池：
- **E 随放电下降**：碱性电芯从新的 1.6 V 慢慢降到 0.9 V 左右就算用完，9 V 电池就是 9.5 V → [[cutoff|5.4 V]]，[[real|曲线]] 一路往下；
- **r 随放电上升**：[[rgrow|9 V 电池新的时候约 1.5 Ω，快没电时 5–10 Ω]]；所以“用电压表量没负载的电池还有 8 V”不代表它还能带得动负载——要 **带载** 量；
- **r 随温度变**：冷天内阻变大，所以冬天车钥匙、遥控器“没电”；
- **大电流放电容量变小**：容量（mAh）是在规定的小电流下测的，电流越大能放出的越少（对 CR2032 尤其明显）；
- **短路**：模拟器在电流超过限值时报警（9 V：1 A，AA：2 A，CR2032：50 mA），真实电池会发烫，锂电池甚至可能起火。`,
          `In the simulator a battery is an ideal model with [[model|fixed E and r]]. A real battery:
- **E falls as it discharges**: an alkaline cell goes from 1.6 V new down to about 0.9 V when spent; a 9 V block goes 9.5 V → [[cutoff|5.4 V]], the [[real|curve]] sloping down all the way;
- **r rises as it discharges**: [[rgrow|a fresh 9 V block is about 1.5 Ω, nearly flat about 5–10 Ω]]; so "the voltmeter says 8 V with no load" doesn't mean it can still drive a load — measure **under load**;
- **r depends on temperature**: cold raises it, which is why car keys and remotes "die" in winter;
- **capacity shrinks at high current**: mAh ratings are measured at a small specified current; the more current, the less you get out (very marked for a CR2032);
- **short circuits**: the simulator warns above a limit (9 V: 1 A, AA: 2 A, CR2032: 50 mA); a real battery gets hot, and a lithium one can even catch fire.`,
        ),
        table: {
          head: [tr('现象', 'Effect'), tr('模拟器', 'Simulator'), tr('真实电池', 'Real battery')],
          rows: [
            [tr('电动势 E', 'EMF E'), tr('恒定', 'constant'), tr('随放电下降（1.6 → 0.9 V / 节）', 'falls with use (1.6 → 0.9 V per cell)')],
            [tr('内阻 r', 'internal r'), tr('恒定', 'constant'), tr('随放电、低温上升', 'rises with use and cold')],
            [tr('容量', 'capacity'), tr('无限', 'unlimited'), tr('有限，大电流时更少', 'finite, less at high current')],
            [tr('短路', 'short circuit'), tr('报警', 'warning'), tr('发热，可能损坏 / 起火', 'heat, damage, even fire')],
          ],
          parts: ['model', 'rgrow', null, null],
        },
      },
    ],
    recap: tr(
      '电池 = 理想电压源 E 串联内阻 r。E 由化学决定（每节 1.5 V 或 3 V，串联相加），r 决定它能给多大电流：$U = E - I·r$，最大电流 $E/r$。I·r 和 E 比很小时（9 V + LED）可以忽略内阻；很大时（CR2032）要算进去——但限流还是要靠你自己的电阻。电池的 − 端就是电路的 GND（0 V 参考点）。',
      'A battery is an ideal source E in series with an internal resistance r. E comes from the chemistry (1.5 V or 3 V per cell, adding in series); r decides how much current it can give: $U = E - I·r$, at most $E/r$. When I·r is small next to E (9 V + LED) you can ignore r; when it is large (CR2032) include it — but still limit the current with your own resistor. The battery’s − terminal is the circuit’s GND, the 0 V reference.',
    ),
  };
}
