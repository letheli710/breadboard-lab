// Teardown: the diode. Outside (band = cathode, 1N4148 / 1N4007) → the PN junction (doped
// silicon) → the depletion region and its built-in barrier → forward vs reverse bias → the I–V
// curve (Shockley, numbers per decade) → three models (ideal, 0.7 V, piecewise linear = simulator)
// worked through the reverse-protection lab → two jobs: reverse-polarity protection and the
// flyback diode across a relay coil.

import './passives.css';
import type { ReactNode } from 'react';
import { tr } from '../../core/i18n';
import { sub } from '../TeardownView';
import type { Teardown } from '../types';

const show = (c: boolean) => (c ? 'td-show' : 'td-hide');

function Zig({ x1, y1, x2, y2, part, body = 46 }: { x1: number; y1: number; x2: number; y2: number; part?: string; body?: number }) {
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

/** diode symbol; horizontal (anode left) or vertical (anode on top) */
function DSym({
  x,
  y,
  vertical = false,
  size = 13,
  fill = '#fff',
  part,
  led = false,
}: {
  x: number;
  y: number;
  vertical?: boolean;
  size?: number;
  fill?: string;
  part?: string;
  led?: boolean;
}) {
  const s = size;
  const tri = vertical ? `${x - s},${y - s * 0.8} ${x + s},${y - s * 0.8} ${x},${y + s * 0.8}` : `${x - s * 0.8},${y - s} ${x - s * 0.8},${y + s} ${x + s * 0.8},${y}`;
  return (
    <g data-part={part}>
      <polygon points={tri} fill={fill} stroke="var(--ink)" strokeWidth={1.8} />
      {vertical ? (
        <line x1={x - s} y1={y + s * 0.8} x2={x + s} y2={y + s * 0.8} className="pv-wire" />
      ) : (
        <line x1={x + s * 0.8} y1={y - s} x2={x + s * 0.8} y2={y + s} className="pv-wire" />
      )}
      {led && <path d={`M${x + s + 3} ${y - 2} l9 -7 M${x + s + 3} ${y + 6} l9 -7`} stroke="#e63946" strokeWidth={1.6} markerEnd="url(#dd-ah)" />}
    </g>
  );
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

/* ------------------------------------------------------------------ layer 0: packages */

function Packages({ layer }: { layer: number }) {
  return (
    <g className={show(layer === 0)}>
      {/* 1N4148: glass */}
      <g data-part="d4148">
        <line x1={40} y1={110} x2={520} y2={110} stroke="#9aa0a6" strokeWidth={4} strokeLinecap="round" />
        <rect x={200} y={88} width={160} height={44} rx={20} fill="#f2a65a" fillOpacity={0.55} stroke="#b0682a" strokeWidth={1.6} />
        <rect x={240} y={104} width={80} height={12} fill="#7d8088" />
        <rect x={322} y={88} width={18} height={44} fill="#1b1b1b" data-part="band" />
        <text x={280} y={160} textAnchor="middle" className="pv-lbl">
          {tr('1N4148：玻璃小信号二极管', '1N4148: glass small-signal diode')}
        </text>
      </g>
      {/* 1N4007: black */}
      <g data-part="d4007">
        <line x1={40} y1={230} x2={520} y2={230} stroke="#9aa0a6" strokeWidth={5} strokeLinecap="round" />
        <rect x={190} y={200} width={180} height={60} rx={12} fill="#262626" stroke="#000" strokeWidth={1.6} />
        <rect x={334} y={200} width={20} height={60} fill="#c0c0c0" data-part="band" />
        <text x={262} y={236} textAnchor="middle" className="pv-lbl pv-white">
          1N4007
        </text>
        <text x={280} y={290} textAnchor="middle" className="pv-lbl">
          {tr('1N4007：塑封整流二极管', '1N4007: plastic rectifier diode')}
        </text>
      </g>
      {/* symbol aligned */}
      <g data-part="sym">
        <line x1={150} y1={370} x2={258} y2={370} className="pv-wire" />
        <DSym x={280} y={370} size={20} />
        <line x1={296} y1={370} x2={410} y2={370} className="pv-wire" />
        <circle cx={150} cy={370} r={4} className="pv-term" />
        <circle cx={410} cy={370} r={4} className="pv-term" />
      </g>
      <text x={146} y={400} textAnchor="middle" className="pv-lbl pv-red" data-part="anode">
        {tr('阳极 A', 'anode A')}
      </text>
      <text x={414} y={400} textAnchor="middle" className="pv-lbl pv-blue" data-part="cathode">
        {tr('阴极 K', 'cathode K')}
      </text>
      <path d="M200 350 L250 350" stroke="#e63946" strokeWidth={2} markerEnd="url(#dd-ahr)" />
      <text x={200} y={340} className="td-small">
        {tr('电流方向', 'current')}
      </text>
      <path d="M300 340 L330 300" className="pv-dash" />
      <text x={334} y={322} className="td-small">
        {tr('竖线 = 色环', 'bar = band')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ layers 1–2: junction */

const P_HOLES = [
  [92, 125],
  [172, 125],
  [124, 175],
  [208, 175],
  [80, 225],
  [152, 225],
  [244, 125],
  [254, 225],
];
const N_ELEC = [
  [312, 175],
  [404, 125],
  [482, 125],
  [352, 225],
  [444, 175],
  [320, 125],
  [400, 225],
  [470, 225],
];

function Junction({ layer }: { layer: number }) {
  const dep = layer === 2;
  const W = 46; // half-width of the depletion region
  const inDep = (x: number) => dep && Math.abs(x - 280) < W + 6;
  return (
    <g className={show(layer === 1 || layer === 2)}>
      <rect x={50} y={80} width={230} height={200} fill="#ffe1e4" stroke="#c62f3b" strokeWidth={1.5} data-part="p" />
      <rect x={280} y={80} width={230} height={200} fill="#dde7fb" stroke="#2b59c3" strokeWidth={1.5} data-part="n" />
      <rect x={40} y={80} width={10} height={200} fill="#c9ccd1" stroke="#7d8088" data-part="anode" />
      <rect x={510} y={80} width={10} height={200} fill="#c9ccd1" stroke="#7d8088" data-part="cathode" />
      <text x={165} y={70} textAnchor="middle" className="pv-lbl pv-red">
        {tr('p 型硅（掺硼）', 'p-type Si (boron)')}
      </text>
      <text x={395} y={70} textAnchor="middle" className="pv-lbl pv-blue">
        {tr('n 型硅（掺磷）', 'n-type Si (phosphorus)')}
      </text>
      <text x={30} y={186} textAnchor="end" className="pv-lbl pv-red">
        A
      </text>
      <text x={530} y={186} className="pv-lbl pv-blue">
        K
      </text>
      {/* fixed ions everywhere (shown as small signed squares) */}
      <g data-part="ions">
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3, 4].map((c) => {
            const xp = 70 + c * 44 + (r % 2) * 18;
            const xn = 302 + c * 44 + (r % 2) * 18;
            const y = 100 + r * 50;
            return (
              <g key={`${r}-${c}`}>
                <text x={xp} y={y + 5} textAnchor="middle" className="pv-tiny" style={{ fill: '#c62f3b', fontSize: inDep(xp) ? 16 : 10, fontWeight: 700 }}>
                  ⊖
                </text>
                <text x={xn} y={y + 5} textAnchor="middle" className="pv-tiny" style={{ fill: '#2b59c3', fontSize: inDep(xn) ? 16 : 10, fontWeight: 700 }}>
                  ⊕
                </text>
              </g>
            );
          }),
        )}
      </g>
      {/* mobile carriers: hidden inside the depletion region */}
      <g data-part="hole">
        {P_HOLES.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={7} fill="#fff" stroke="#c62f3b" strokeWidth={2} style={{ opacity: inDep(x) ? 0 : 1, transition: 'opacity .45s' }} />
        ))}
      </g>
      <g data-part="elec">
        {N_ELEC.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={6} fill="#2b59c3" style={{ opacity: inDep(x) ? 0 : 1, transition: 'opacity .45s' }} />
        ))}
      </g>
      <g className={show(!dep)}>
        <line x1={280} y1={80} x2={280} y2={280} stroke="var(--ink)" strokeWidth={2} strokeDasharray="5 4" data-part="junction" />
        <text x={280} y={300} textAnchor="middle" className="td-small" data-part="junction">
          {tr('PN 结（junction）', 'PN junction')}
        </text>
        <g>
          <circle cx={90} cy={334} r={7} fill="#fff" stroke="#c62f3b" strokeWidth={2} />
          <text x={104} y={338} className="td-small">
            {tr('空穴（可移动，+）', 'hole (mobile, +)')}
          </text>
          <circle cx={300} cy={334} r={6} fill="#2b59c3" />
          <text x={314} y={338} className="td-small">
            {tr('电子（可移动，−）', 'electron (mobile, −)')}
          </text>
          <text x={90} y={372} textAnchor="middle" className="pv-lbl pv-red">
            ⊖
          </text>
          <text x={104} y={372} className="td-small">
            {tr('受主离子（固定）', 'acceptor ion (fixed)')}
          </text>
          <text x={300} y={372} textAnchor="middle" className="pv-lbl pv-blue">
            ⊕
          </text>
          <text x={314} y={372} className="td-small">
            {tr('施主离子（固定）', 'donor ion (fixed)')}
          </text>
        </g>
      </g>
      <g className={show(dep)}>
        <rect x={280 - W} y={80} width={2 * W} height={200} fill="#fff8d6" fillOpacity={0.2} stroke="#c9a227" strokeWidth={2} strokeDasharray="6 4" data-part="dep" />
        <path d={`M${280 + W - 6} 296 L${280 - W + 6} 296`} stroke="var(--ink)" strokeWidth={2} markerEnd="url(#dd-ah)" data-part="field" />
        <text x={280} y={316} textAnchor="middle" className="pv-lbl" data-part="field">
          {tr('内建电场 E', 'built-in field E')}
        </text>
        {/* barrier */}
        <g data-part="barrier">
          <rect x={50} y={330} width={460} height={100} rx={12} className="td-panel" />
          <text x={66} y={352} className="td-small">
            {tr('电位 φ', 'potential φ')}
          </text>
          <path d={`M70 410 L${280 - W} 410 C ${280 - W / 2} 410, ${280 + W / 2} 362, ${280 + W} 362 L490 362`} className="pv-curve violet" />
          <path d="M500 410 L500 362" className="pv-thin" markerStart="url(#dd-ah)" markerEnd="url(#dd-ah)" />
          <text x={494} y={392} textAnchor="end" className="pv-lbl pv-violet">
            ≈ 0.7 V
          </text>
          <text x={150} y={402} textAnchor="middle" className="td-small">
            p
          </text>
          <text x={400} y={354} textAnchor="middle" className="td-small">
            n
          </text>
        </g>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 3: bias */

function Bias({ layer }: { layer: number }) {
  const block = (y: number, w: number) => (
    <g data-part="fwd">
      <rect x={110} y={y} width={170} height={90} fill="#ffe1e4" stroke="#c62f3b" />
      <rect x={280} y={y} width={170} height={90} fill="#dde7fb" stroke="#2b59c3" />
      <rect x={280 - w} y={y} width={2 * w} height={90} fill="#fff8d6" stroke="#c9a227" strokeWidth={2} strokeDasharray="6 4" />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <circle cx={130 + k * 34} cy={y + 30 + (k % 2) * 30} r={6} fill="#fff" stroke="#c62f3b" strokeWidth={2} />
          <circle cx={430 - k * 34} cy={y + 30 + (k % 2) * 30} r={5} fill="#2b59c3" />
        </g>
      ))}
      {/* battery and wires */}
      <path d={`M110 ${y + 45} L70 ${y + 45} L70 ${y + 120} L262 ${y + 120}`} className="pv-wire" />
      <path d={`M450 ${y + 45} L490 ${y + 45} L490 ${y + 120} L298 ${y + 120}`} className="pv-wire" />
      <line x1={262} y1={y + 104} x2={262} y2={y + 136} className="pv-wire" />
      <line x1={274} y1={y + 112} x2={274} y2={y + 128} className="pv-wire" style={{ strokeWidth: 4 }} />
      <line x1={274} y1={y + 120} x2={298} y2={y + 120} className="pv-wire" />
      <text x={256} y={y + 104} textAnchor="end" className="pv-lbl pv-red">
        +
      </text>
      <text x={280} y={y + 104} className="pv-lbl pv-blue">
        −
      </text>
    </g>
  );
  return (
    <g className={show(layer === 3)}>
      <text x={280} y={44} textAnchor="middle" className="pv-lbl pv-green">
        {tr('正向偏置：A 接 +', 'forward bias: A to +')}
      </text>
      {block(56, 12)}
      <path d="M310 162 L440 162" stroke="#e63946" strokeWidth={2.4} markerEnd="url(#dd-ahr)" data-part="fwd" />
      <text x={376} y={156} textAnchor="middle" className="pv-lbl pv-red" data-part="fwd">
        I
      </text>
      <text x={280} y={216} textAnchor="middle" className="td-small">
        {tr('耗尽区变窄 → 电流流过，压降 ≈ 0.7 V', 'depletion narrows → current flows, ≈ 0.7 V drop')}
      </text>

      <text x={280} y={252} textAnchor="middle" className="pv-lbl pv-red">
        {tr('反向偏置：A 接 −', 'reverse bias: A to −')}
      </text>
      <g>
        <rect x={110} y={264} width={170} height={90} fill="#ffe1e4" stroke="#c62f3b" data-part="rev" />
        <rect x={280} y={264} width={170} height={90} fill="#dde7fb" stroke="#2b59c3" data-part="rev" />
        <rect x={200} y={264} width={160} height={90} fill="#fff8d6" stroke="#c9a227" strokeWidth={2} strokeDasharray="6 4" data-part="rev" />
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <circle cx={126 + k * 26} cy={294 + (k % 2) * 30} r={6} fill="#fff" stroke="#c62f3b" strokeWidth={2} />
            <circle cx={434 - k * 26} cy={294 + (k % 2) * 30} r={5} fill="#2b59c3" />
          </g>
        ))}
        <path d="M110 309 L70 309 L70 384 L262 384" className="pv-wire" />
        <path d="M450 309 L490 309 L490 384 L298 384" className="pv-wire" />
        <line x1={274} y1={368} x2={274} y2={400} className="pv-wire" />
        <line x1={262} y1={376} x2={262} y2={392} className="pv-wire" style={{ strokeWidth: 4 }} />
        <line x1={274} y1={384} x2={298} y2={384} className="pv-wire" />
        <text x={256} y={372} textAnchor="end" className="pv-lbl pv-blue">
          −
        </text>
        <text x={282} y={372} className="pv-lbl pv-red">
          +
        </text>
        <text x={280} y={426} textAnchor="middle" className="td-small" data-part="rev">
          {tr('耗尽区变宽 → 只有 nA 级漏电流', 'depletion widens → only nA of leakage')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 4: I–V */

// 1N4148-like: I = I_s (e^{V / (n V_T)} − 1), I_s = 4 nA, n V_T = 49.4 mV, plus 0.6 Ω
const uOf = (i: number) => 0.0494 * Math.log(1 + i / 4e-9) + i * 0.6;

function IV({ layer }: { layer: number }) {
  const x0 = 250;
  const y0 = 360;
  const X = (u: number) => x0 + u * 250;
  const Y = (ma: number) => y0 - ma * 5;
  const pts: string[] = [`${X(0)},${Y(0)}`];
  for (let k = 0; k <= 80; k++) {
    const i = 1e-7 * Math.pow(0.05 / 1e-7, k / 80);
    pts.push(`${X(uOf(i))},${Y(i * 1000)}`);
  }
  return (
    <g className={show(layer === 4)}>
      {[0.2, 0.4, 0.6, 0.8, 1].map((u) => (
        <g key={u}>
          <line x1={X(u)} y1={Y(0)} x2={X(u)} y2={Y(50)} className="pv-grid" />
          <text x={X(u)} y={y0 + 16} textAnchor="middle" className="td-small">
            {u}
          </text>
        </g>
      ))}
      {[10, 20, 30, 40, 50].map((m) => (
        <g key={m}>
          <line x1={X(0)} y1={Y(m)} x2={X(1.05)} y2={Y(m)} className="pv-grid" />
          <text x={X(0) - 6} y={Y(m) + 4} textAnchor="end" className="td-small">
            {m}
          </text>
        </g>
      ))}
      <line x1={40} y1={y0} x2={X(1.12)} y2={y0} className="pv-axis" markerEnd="url(#dd-ah)" />
      <line x1={x0} y1={y0 + 40} x2={x0} y2={Y(54)} className="pv-axis" markerEnd="url(#dd-ah)" />
      <text x={X(1.12)} y={y0 - 8} textAnchor="end" className="pv-lbl pv-blue">
        V / V
      </text>
      <text x={x0 + 8} y={Y(53)} className="pv-lbl pv-red">
        I / mA
      </text>
      <polyline points={pts.join(' ')} className="pv-curve" data-part="fwdcurve" />
      {/* reverse side, compressed */}
      <g data-part="revcurve">
        <polyline points={`${x0},${y0} ${90},${y0 + 1} ${74},${y0 + 8} ${66},${y0 + 60}`} className="pv-curve blue" />
        <text x={160} y={y0 - 10} textAnchor="middle" className="td-small">
          {tr('反向：≈ −5 nA', 'reverse: ≈ −5 nA')}
        </text>
        <text x={84} y={y0 + 40} className="td-small">
          {tr('击穿', 'breakdown')}
        </text>
        <text x={84} y={y0 + 56} className="td-small">
          −100 V
        </text>
        <path d="M120 354 l6 12 M128 354 l6 12" stroke="var(--ink)" strokeWidth={1.4} />
      </g>
      {/* decade markers */}
      <g data-part="decade">
        {[1, 10, 40].map((ma) => (
          <g key={ma}>
            <circle cx={X(uOf(ma / 1000))} cy={Y(ma)} r={4.5} fill="#e63946" />
            <text x={X(uOf(ma / 1000)) - 8} y={Y(ma) + (ma === 1 ? -10 : 4)} textAnchor="end" className="pv-lbl pv-red">
              {`${uOf(ma / 1000).toFixed(2)} V → ${ma} mA`}
            </text>
          </g>
        ))}
      </g>
      <line x1={X(0.7)} y1={y0} x2={X(0.7)} y2={Y(50)} className="pv-dash" data-part="knee" />
      <text x={X(0.7)} y={Y(52)} textAnchor="middle" className="pv-lbl" data-part="knee">
        ≈ 0.7 V
      </text>
      <text x={280} y={60} textAnchor="middle" className="pv-eq">
        {sub('I = I_s (e^V/(nV_T) − 1)')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 5: models */

function Models({ layer }: { layer: number }) {
  const panel = (x0: number, part: string, title: string, curve: string, sym: ReactNode, note: string) => (
    <g data-part={part}>
      <rect x={x0} y={46} width={168} height={380} rx={12} className="td-panel" />
      <text x={x0 + 84} y={72} textAnchor="middle" className="pv-lbl">
        {title}
      </text>
      <line x1={x0 + 16} y1={230} x2={x0 + 156} y2={230} className="pv-axis" markerEnd="url(#dd-ah)" />
      <line x1={x0 + 40} y1={240} x2={x0 + 40} y2={96} className="pv-axis" markerEnd="url(#dd-ah)" />
      <text x={x0 + 150} y={248} textAnchor="end" className="pv-tiny">
        V
      </text>
      <text x={x0 + 46} y={104} className="pv-tiny">
        I
      </text>
      <polyline points={curve} className="pv-curve" />
      <g transform={`translate(${x0} 0)`}>{sym}</g>
      <text x={x0 + 84} y={410} textAnchor="middle" className="td-small">
        {note}
      </text>
    </g>
  );
  const vx = (x0: number, u: number) => x0 + 40 + u * 110;
  return (
    <g className={show(layer === 5)}>
      {panel(
        10,
        'm-ideal',
        tr('① 理想', '① ideal'),
        `${10 + 16},230 ${vx(10, 0)},230 ${vx(10, 0)},104`,
        <g>
          <line x1={30} y1={300} x2={70} y2={300} className="pv-wire" />
          <DSym x={84} y={300} />
          <line x1={95} y1={300} x2={140} y2={300} className="pv-wire" />
          <text x={84} y={340} textAnchor="middle" className="td-small">
            {tr('导通 = 导线', 'on = a wire')}
          </text>
          <text x={84} y={358} textAnchor="middle" className="td-small">
            {tr('截止 = 断开', 'off = open')}
          </text>
        </g>,
        tr('只判断通不通', 'on or off only'),
      )}
      {panel(
        196,
        'm-cd',
        tr('② 恒压降 0.7 V', '② constant 0.7 V'),
        `${196 + 16},230 ${vx(196, 0.7)},230 ${vx(196, 0.7)},104`,
        <g>
          <line x1={20} y1={300} x2={48} y2={300} className="pv-wire" />
          <DSym x={60} y={300} />
          <line x1={71} y1={300} x2={100} y2={300} className="pv-wire" />
          <line x1={100} y1={286} x2={100} y2={314} className="pv-wire" />
          <line x1={110} y1={292} x2={110} y2={308} className="pv-wire" style={{ strokeWidth: 4 }} />
          <line x1={110} y1={300} x2={148} y2={300} className="pv-wire" />
          <text x={105} y={280} textAnchor="middle" className="pv-tiny">
            0.7 V
          </text>
          <text x={84} y={340} textAnchor="middle" className="td-small">
            {tr('导通时 V = 0.7 V', 'on: V = 0.7 V')}
          </text>
        </g>,
        tr('手算最常用', 'the hand-calc default'),
      )}
      {panel(
        382,
        'm-pwl',
        tr('③ 分段线性', '③ piecewise linear'),
        `${382 + 16},230 ${vx(382, 0.65)},230 ${vx(382, 1.0)},104`,
        <g>
          <line x1={14} y1={300} x2={34} y2={300} className="pv-wire" />
          <DSym x={44} y={300} size={11} />
          <line x1={53} y1={300} x2={68} y2={300} className="pv-wire" />
          <line x1={68} y1={288} x2={68} y2={312} className="pv-wire" />
          <line x1={77} y1={293} x2={77} y2={307} className="pv-wire" style={{ strokeWidth: 4 }} />
          <line x1={77} y1={300} x2={90} y2={300} className="pv-wire" />
          <Zig x1={90} y1={300} x2={156} y2={300} body={34} />
          <text x={72} y={280} textAnchor="middle" className="pv-tiny">
            0.65 V
          </text>
          <text x={124} y={280} textAnchor="middle" className="pv-tiny">
            {sub('r_d')}
          </text>
          <text x={84} y={340} textAnchor="middle" className="td-small">
            {tr('仿真器：0.65 V + 0.8 Ω', 'simulator: 0.65 V + 0.8 Ω')}
          </text>
        </g>,
        tr('最接近真实曲线', 'closest to the real curve'),
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ layer 6: uses */

function Uses({ layer }: { layer: number }) {
  return (
    <g className={show(layer === 6)}>
      {/* reverse-polarity protection */}
      <g data-part="protect">
        <rect x={10} y={40} width={260} height={380} rx={12} className="td-panel" />
        <text x={140} y={64} textAnchor="middle" className="pv-lbl">
          {tr('防反接（challenge 14）', 'reverse protection (ch. 14)')}
        </text>
        <text x={50} y={100} textAnchor="middle" className="pv-lbl pv-red">
          +9 V
        </text>
        <circle cx={50} cy={112} r={4} className="pv-term" />
        <line x1={54} y1={112} x2={100} y2={112} className="pv-wire" />
        <DSym x={116} y={112} part="dprot" />
        <line x1={127} y1={112} x2={180} y2={112} className="pv-wire" />
        <circle cx={180} cy={112} r={3.5} className="pv-dot" />
        <text x={190} y={98} className="pv-lbl pv-violet">
          8.3 V
        </text>
        <Zig x1={180} y1={112} x2={180} y2={220} />
        <text x={194} y={170} className="td-small">
          470 Ω
        </text>
        <line x1={180} y1={220} x2={180} y2={240} className="pv-wire" />
        <DSym x={180} y={256} vertical fill="#a7e8b8" led />
        <line x1={180} y1={268} x2={180} y2={300} className="pv-wire" />
        <Gnd x={180} y={300} />
        <text x={116} y={146} textAnchor="middle" className="td-small" data-part="dprot">
          ≈ 0.66 V
        </text>
        <text x={140} y={346} textAnchor="middle" className="td-small">
          {tr('正接：通，I ≈ 12.9 mA', 'right way: on, I ≈ 12.9 mA')}
        </text>
        <text x={140} y={366} textAnchor="middle" className="td-small">
          {tr('反接：截止，I ≈ 0', 'reversed: off, I ≈ 0')}
        </text>
        <text x={140} y={392} textAnchor="middle" className="td-small">
          {tr('代价：永远少 0.7 V', 'cost: 0.7 V lost, always')}
        </text>
      </g>
      {/* flyback */}
      <g data-part="flyback">
        <rect x={290} y={40} width={260} height={380} rx={12} className="td-panel" />
        <text x={420} y={64} textAnchor="middle" className="pv-lbl">
          {tr('续流二极管（exp 5-9）', 'flyback diode (exp 5-9)')}
        </text>
        <text x={380} y={96} textAnchor="middle" className="pv-lbl pv-red">
          +5 V
        </text>
        <line x1={380} y1={104} x2={380} y2={130} className="pv-wire" />
        <path d="M380 130 L420 130 M380 130 L380 140" className="pv-wire" />
        <path d="M380 140 a8 8 0 0 1 0 16 a8 8 0 0 1 0 16 a8 8 0 0 1 0 16 a8 8 0 0 1 0 16" className="pv-wire" data-part="coil" />
        <text x={370} y={176} textAnchor="end" className="td-small" data-part="coil">
          {tr('线圈', 'coil')}
        </text>
        <text x={370} y={192} textAnchor="end" className="pv-tiny" data-part="coil">
          150 mH
        </text>
        <text x={370} y={206} textAnchor="end" className="pv-tiny" data-part="coil">
          70 Ω
        </text>
        <path d="M380 204 L380 226 L420 226" className="pv-wire" />
        <line x1={420} y1={130} x2={420} y2={160} className="pv-wire" />
        <DSym x={420} y={178} vertical part="dfly" fill="#ffe7a8" />
        <line x1={420} y1={190} x2={420} y2={226} className="pv-wire" />
        <text x={436} y={176} className="td-small" data-part="dfly">
          {tr('K 朝 +5 V', 'K to +5 V')}
        </text>
        <line x1={380} y1={226} x2={380} y2={246} className="pv-wire" />
        <circle cx={380} cy={226} r={3.5} className="pv-dot" />
        <circle cx={420} cy={226} r={3.5} className="pv-dot" />
        <text x={388} y={262} className="td-small">
          {tr('→ 三极管 C', '→ transistor C')}
        </text>
        {/* spike waveform */}
        <line x1={310} y1={400} x2={530} y2={400} className="pv-axis" />
        <line x1={320} y1={410} x2={320} y2={286} className="pv-axis" />
        <text x={316} y={300} textAnchor="end" className="pv-tiny">
          {sub('V_C')}
        </text>
        <polyline points="320,398 380,398 381,296 384,384 388,382 520,382" className="pv-curve thin" data-part="spike" />
        <polyline points="320,398 380,398 381,374 440,376 480,382 520,382" className="pv-curve green thin" data-part="clamp" />
        <text x={388} y={300} className="pv-lbl pv-red" data-part="spike">
          {tr('无二极管 ≈ 29 V', 'no diode ≈ 29 V')}
        </text>
        <text x={444} y={366} className="pv-lbl pv-green" data-part="clamp">
          5.7 V
        </text>
        <text x={524} y={396} textAnchor="end" className="pv-tiny">
          {tr('关断', 'switch off')}
        </text>
      </g>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="dd-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pv-ah" />
        </marker>
        <marker id="dd-ahr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#e63946" />
        </marker>
      </defs>
      <Packages layer={layer} />
      <Junction layer={layer} />
      <Bias layer={layer} />
      <IV layer={layer} />
      <Models layer={layer} />
      <Uses layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'diode',
    title: tr('二极管 Diode：电流的单向阀', 'The diode: a one-way valve for current'),
    subtitle: tr(
      '色环那一端是阴极。拆开是一块 PN 结：两种掺杂的硅在中间形成一层耗尽区和约 0.7 V 的势垒。正向推得过去，反向推不过去。最后用三种模型算防反接电路，再看续流二极管怎么吃掉继电器线圈的高压尖峰。',
      'The banded end is the cathode. Inside is a PN junction: two kinds of doped silicon that form a depletion region and a barrier of about 0.7 V between them. Forward, current gets over it; reverse, it does not. Then three models applied to the reverse-protection lab, and how a flyback diode swallows a relay coil’s voltage spike.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'outside',
        short: tr('外形', 'Outside'),
        title: tr('① 外形：有色环的那一端是阴极', '① Outside: the banded end is the cathode'),
        body: tr(
          `课程里会见到两种轴向二极管：
- [[d4148|1N4148]]：橙色透明玻璃管，**small-signal diode（小信号二极管）**，电流小（≤ 300 mA）、速度快；
- [[d4007|1N4007]]：黑色塑封，**rectifier diode（整流二极管）**，能过 1 A、耐反压 1000 V，但慢。仿真器里的二极管就是这一类。

二极管 **有极性**。两只脚叫：
- **anode（阳极，A）**：没有色环的那端；
- **cathode（阴极，K）**：[[band|有色环（黑 / 银）的那端]]。

[[sym|电路符号]] 是一个三角形顶着一根竖线：三角形指向 **允许电流流动的方向**（A → K），竖线就是实物上的色环。记法：**“色环 = 竖线 = 阴极 = 电流出口”**。

它的作用一句话：**电流只能从 A 流向 K**，像水管里的单向阀（check valve）。`,
          `You will meet two axial diodes in this course:
- [[d4148|1N4148]]: an orange glass tube, a **small-signal diode** — small currents (≤ 300 mA), fast;
- [[d4007|1N4007]]: black plastic, a **rectifier diode** — 1 A, 1000 V reverse, but slow. The simulator’s diode is this kind.

A diode **has polarity**. Its legs are:
- the **anode (A)**: the end without a band;
- the **cathode (K)**: [[band|the end with the (black / silver) band]].

[[sym|The symbol]] is a triangle against a bar: the triangle points the way **current is allowed to flow** (A → K), and the bar is the band on the part. Remember: **band = bar = cathode = where current comes out**.

Its job in one sentence: **current flows only from A to K**, like a check valve in a water pipe.`,
        ),
        table: {
          head: [tr('型号', 'Part'), tr('外观', 'Looks'), tr('最大电流', 'Max current'), tr('反向耐压', 'Reverse rating'), tr('用途', 'Use')],
          rows: [
            ['1N4148', tr('橙色玻璃，黑环', 'orange glass, black band'), '300 mA', '100 V', tr('信号、逻辑、快速开关', 'signals, logic, fast switching')],
            ['1N4007', tr('黑色塑封，银环', 'black plastic, silver band'), '1 A', '1000 V', tr('整流、防反接、续流', 'rectifying, protection, flyback')],
          ],
          parts: ['d4148', 'd4007'],
        },
        callouts: [{ part: 'band', label: tr('色环 = 阴极', 'band = cathode'), x: 344, y: 200, lx: 440, ly: 180 }],
      },
      {
        id: 'pn',
        short: tr('PN 结', 'PN junction'),
        title: tr('② 拆开：一块 p 型硅贴着一块 n 型硅', '② Inside: a piece of p-type silicon against n-type'),
        body: tr(
          `纯硅几乎不导电：每个原子的 4 个外层电子都被共价键拴住了。**doping（掺杂）** 改变这一点：
- 掺入少量 **硼**（3 个外层电子）→ 每个硼原子缺一个电子，留下一个可以移动的 [[hole|空穴 hole]]（相当于 +）；硼自己变成固定不动的 [[ions|负离子 ⊖]]。这是 [[p|p 型硅]]（p = positive carriers）。
- 掺入少量 **磷**（5 个外层电子）→ 多出一个可以自由移动的 [[elec|电子]]；磷自己变成固定的 [[ions|正离子 ⊕]]。这是 [[n|n 型硅]]（n = negative carriers）。

两块都是 **电中性** 的：每个可移动载流子都有一个固定离子和它抵消。

把它们做在同一块硅片上，交界面叫 [[junction|PN 结]]。p 区接 [[anode|阳极 A]]，n 区接 [[cathode|阴极 K]]。二极管的所有性质都来自交界面上发生的事——下一层。`,
          `Pure silicon barely conducts: each atom’s 4 outer electrons are tied up in bonds. **Doping** changes that:
- add a little **boron** (3 outer electrons) → each boron atom is one electron short, leaving a mobile [[hole|hole]] (acts as +); the boron itself becomes a fixed [[ions|negative ion ⊖]]. This is [[p|p-type silicon]] (p = positive carriers).
- add a little **phosphorus** (5 outer electrons) → one spare electron, free to move [[elec|(electron)]]; the phosphorus becomes a fixed [[ions|positive ion ⊕]]. This is [[n|n-type silicon]] (n = negative carriers).

Both pieces are **neutral**: every mobile carrier is balanced by a fixed ion.

Make them on one silicon chip and the boundary is the [[junction|PN junction]]. The p side goes to [[anode|the anode A]], the n side to [[cathode|the cathode K]]. Everything a diode does comes from what happens at that boundary — next layer.`,
        ),
        table: {
          head: [tr('区', 'Region'), tr('掺杂', 'Dopant'), tr('可移动载流子', 'Mobile carriers'), tr('固定离子', 'Fixed ions'), tr('接', 'Terminal')],
          rows: [
            [tr('p 区', 'p side'), tr('硼（3 价）', 'boron (3 e⁻)'), tr('空穴（+）', 'holes (+)'), '⊖', 'A'],
            [tr('n 区', 'n side'), tr('磷（5 价）', 'phosphorus (5 e⁻)'), tr('电子（−）', 'electrons (−)'), '⊕', 'K'],
          ],
          parts: ['p', 'n'],
        },
      },
      {
        id: 'depletion',
        short: tr('耗尽区', 'Depletion'),
        title: tr('③ 耗尽区：交界处自己筑起一道 0.7 V 的墙', '③ The depletion region: a 0.7 V wall builds itself at the junction'),
        body: tr(
          `刚接触时，交界处两边浓度差很大：n 区的电子向 p 区 **扩散**（diffusion），p 区的空穴向 n 区扩散，在交界附近相遇、复合、一起消失。

消失的只是 **可移动** 的载流子；固定离子留在原地。于是交界两侧出现一层 **没有载流子** 的薄层——[[dep|耗尽区 depletion region]]（约 1 µm 宽）：
- p 一侧留下 ⊖ 离子，n 一侧留下 ⊕ 离子；
- 这两层电荷产生一个从 n 指向 p 的 [[field|内建电场 E]]；
- 这个电场把后来想扩散过去的电子推回 n 区、空穴推回 p 区。

扩散和电场推回达到平衡时，两边的电位差叫 **built-in potential（内建电势）**，硅约 0.6–0.7 V。它就是一道 [[barrier|势垒 barrier]]：载流子要过结，必须先被外加电压“抬”过这道墙。

这就是 **“二极管导通约 0.7 V”** 的来源——不是电阻上的压降，而是 PN 结本身的性质（LED 的材料禁带更宽，所以墙更高，1.8–3 V）。`,
          `At first contact the concentrations on the two sides are very different: electrons **diffuse** from n into p, holes from p into n; near the boundary they meet, recombine and disappear together.

Only the **mobile** carriers disappear; the fixed ions stay. So a thin layer **with no carriers** forms on both sides of the boundary — [[dep|the depletion region]] (about 1 µm wide):
- ⊖ ions are left on the p side, ⊕ ions on the n side;
- these two charge layers create a [[field|built-in field E]] pointing from n to p;
- that field pushes later electrons back into n and holes back into p.

When diffusion and the push-back balance, the potential difference across is the **built-in potential**, about 0.6–0.7 V for silicon. It is a [[barrier|barrier]]: a carrier has to be lifted over this wall by an applied voltage before it can cross.

That is where **"a diode drops about 0.7 V"** comes from — not a resistor’s drop but a property of the junction itself (an LED’s material has a wider band gap, so its wall is higher, 1.8–3 V).`,
        ),
        callouts: [{ part: 'dep', label: tr('耗尽区：只剩固定离子', 'depletion: only fixed ions left'), x: 300, y: 90, lx: 430, ly: 44, anchor: 'middle' }],
      },
      {
        id: 'bias',
        short: tr('正偏 / 反偏', 'Bias'),
        title: tr('④ 正向偏置推倒墙，反向偏置加高墙', '④ Forward bias lowers the wall, reverse bias raises it'),
        body: tr(
          `给二极管加电压，有两种方向：

**[[fwd|正向偏置 forward bias]]**（A 接 +、K 接 −）：外加电压和内建电场 **方向相反**，把墙压低、耗尽区变窄。外加电压接近 0.7 V 时，墙几乎被推平，电子和空穴大量越过结——电流随电压 **指数增长**。二极管两端的电压基本停在 0.6–0.8 V。

**[[rev|反向偏置 reverse bias]]**（A 接 −、K 接 +）：外加电压和内建电场 **方向相同**，把载流子从结边上拉走、耗尽区变宽、墙变高。几乎没有电流，只剩 nA 级的 **leakage（漏电流）**。电压继续加大到 **breakdown voltage（击穿电压）**（1N4148 约 100 V，1N4007 约 1000 V）时，电场强到把共价键扯开，电流猛增——普通二极管这时就可能烧坏（稳压二极管 Zener 是专门工作在击穿区的）。`,
          `There are two ways to apply a voltage:

**[[fwd|Forward bias]]** (A to +, K to −): the applied voltage **opposes** the built-in field, lowering the wall and narrowing the depletion region. Near 0.7 V the wall is almost flat and electrons and holes pour across — the current grows **exponentially** with voltage. The diode voltage stays around 0.6–0.8 V.

**[[rev|Reverse bias]]** (A to −, K to +): the applied voltage **adds to** the built-in field, pulling carriers away from the junction; the depletion region widens and the wall rises. Almost no current, only nA of **leakage**. Raise the voltage to the **breakdown voltage** (about 100 V for a 1N4148, 1000 V for a 1N4007) and the field tears bonds apart and the current surges — an ordinary diode may die (a Zener diode is designed to work in breakdown).`,
        ),
        table: {
          head: [tr('状态', 'State'), tr('接法', 'Wiring'), tr('耗尽区', 'Depletion'), tr('电流', 'Current'), tr('二极管电压', 'Diode voltage')],
          rows: [
            [tr('正偏导通', 'forward, on'), 'A +, K −', tr('变窄', 'narrower'), tr('mA – A（由外电路决定）', 'mA – A (set by the circuit)'), '≈ 0.6–0.8 V'],
            [tr('反偏截止', 'reverse, off'), 'A −, K +', tr('变宽', 'wider'), tr('nA 级', 'nA'), tr('= 外加电压', '= applied voltage')],
            [tr('反向击穿', 'breakdown'), tr('反压 > 击穿电压', 'reverse > rating'), '—', tr('猛增', 'surges'), '≈ −100 V (1N4148)'],
          ],
          parts: ['fwd', 'rev', 'rev'],
        },
      },
      {
        id: 'iv',
        short: tr('I–V 曲线', 'I–V curve'),
        title: tr('⑤ I–V 曲线：Shockley 方程', '⑤ The I–V curve: the Shockley equation'),
        body: tr(
          `PN 结的电流–电压关系由 **Shockley diode equation（肖克利方程）** 描述：
$$I = I_s(e^{V/(nV_T)} - 1)$$
- $I_s$：反向饱和电流，极小（1N4148 约 4 nA）；
- $V_T = \\frac{kT}{q} ≈ 26 mV$（室温的 **thermal voltage 热电压**）；
- n：理想因子，1–2（1N4148 约 1.9）。

**读懂指数**：$nV_T ≈ 49 mV$，所以电压每多 $nV_T·ln 10 ≈ 114 mV$，电流就 **×10**。用这只 1N4148 的数字：
- 1 mA 时 0.61 V，10 mA 时 0.73 V，40 mA 时 0.82 V。

电流涨了 40 倍，电压只多了 0.2 V——这就是 [[fwdcurve|曲线]] 在 [[knee|≈ 0.7 V]] 附近“拐弯”然后变陡的原因，也是“导通压降 0.7 V”这个说法的由来：它只是 **mA 级电流时** 的典型值。

[[revcurve|反向]]：$e^{V/(nV_T)} → 0$，$I ≈ -I_s$，只有几 nA，直到击穿（图上把负电压轴压缩了）。温度每升高 1 °C，同样电流下的正向电压约降 2 mV。`,
          `The current–voltage law of a PN junction is the **Shockley diode equation**:
$$I = I_s(e^{V/(nV_T)} - 1)$$
- $I_s$: the reverse saturation current, tiny (about 4 nA for a 1N4148);
- $V_T = \\frac{kT}{q} ≈ 26 mV$ at room temperature (the **thermal voltage**);
- n: the ideality factor, 1–2 (about 1.9 for a 1N4148).

**Reading the exponential**: $nV_T ≈ 49 mV$, so every extra $nV_T·ln 10 ≈ 114 mV$ multiplies the current by **10**. With this 1N4148’s numbers:
- 0.61 V at 1 mA, 0.73 V at 10 mA, 0.82 V at 40 mA.

The current went up 40×, the voltage only 0.2 V — that is why [[fwdcurve|the curve]] bends near [[knee|≈ 0.7 V]] and turns steep, and where "a diode drops 0.7 V" comes from: it is just the typical value **at mA currents**.

[[revcurve|Reverse]]: $e^{V/(nV_T)} → 0$, $I ≈ -I_s$, a few nA, until breakdown (the negative voltage axis is squashed in the figure). Each 1 °C warmer lowers the forward voltage by about 2 mV at the same current.`,
        ),
        table: {
          head: [tr('电流', 'Current'), tr('正向电压（1N4148）', 'Forward voltage (1N4148)'), tr('比上一行多', 'more than the row above')],
          rows: [
            ['0.1 mA', '0.50 V', '—'],
            ['1 mA', '0.61 V', '+ 0.11 V'],
            ['10 mA', '0.73 V', '+ 0.12 V'],
            ['100 mA', '≈ 0.9 V', tr('+ 0.17 V（体电阻开始起作用）', '+ 0.17 V (bulk resistance shows)')],
          ],
          parts: ['decade', 'decade', 'decade', 'fwdcurve'],
        },
        formulas: [
          { tex: 'I = I_s(e^{V/(nV_T)} - 1)', note: tr('$V_T$ = 26 mV（室温）', '$V_T$ = 26 mV at room temperature') },
          { tex: 'ΔV = nV_T·ln 10 ≈ 114 mV', note: tr('电流每 ×10 需要多加的电压（n = 1.9）', 'extra voltage per ×10 in current (n = 1.9)') },
        ],
        calcs: ['diode-forward'],
      },
      {
        id: 'models',
        short: tr('模型', 'Models'),
        title: tr('⑥ 三种模型：按需要的精度选', '⑥ Three models: pick by the accuracy you need'),
        body: tr(
          `指数方程要迭代才能解。电路课里用三种越来越精确的 **分段线性** 模型：

1. [[m-ideal|理想二极管]]：正偏 = 导线（0 V），反偏 = 断路。只回答“通不通”。
2. [[m-cd|恒压降模型 constant-drop]]：导通时 = 一个 0.7 V 的电压源。手算最常用。
3. [[m-pwl|分段线性 piecewise linear]]：导通时 = $V_F$ 串一个小电阻 $r_d$。**仿真器用的就是这个**：$V_F = 0.65 V$，$r_d = 0.8 Ω$，截止时 1 GΩ。

**用三种模型算防反接实验**（+9 V → 二极管 → 470 Ω → 绿 LED（2.1 V + 12 Ω）→ GND）：
- 理想：$I = \\frac{9 - 2.1}{470 + 12} = 14.3 mA$，二极管阴极 9 V；
- 0.7 V：$I = \\frac{9 - 0.7 - 2.1}{482} = 12.9 mA$，阴极 8.3 V；
- 仿真器：$I = \\frac{9 - 0.65 - 2.1}{482 + 0.8} = 12.9 mA$，二极管压降 $0.65 + 0.0129 × 0.8 ≈ 0.66 V$，阴极 ≈ 8.3 V。

结论：**电源电压比 0.7 V 大得多时，理想模型就够判断；要算具体电压时用 0.7 V**；后两种几乎一样。

**怎么判断二极管是通还是断**（假设–验证法）：先假设导通，算出电流；电流 > 0 就对了。电流 < 0 就改成截止，再验证它两端的电压 < $V_F$。仿真器每一步就是这样迭代的。`,
          `The exponential needs iteration to solve. Circuit courses use three increasingly accurate **piecewise linear** models:

1. [[m-ideal|ideal diode]]: forward = a wire (0 V), reverse = open. It only answers "on or off".
2. [[m-cd|constant drop]]: on = a 0.7 V voltage source. The hand-calculation default.
3. [[m-pwl|piecewise linear]]: on = $V_F$ in series with a small $r_d$. **This is what the simulator uses**: $V_F = 0.65 V$, $r_d = 0.8 Ω$, and 1 GΩ when off.

**The reverse-protection lab with all three** (+9 V → diode → 470 Ω → green LED (2.1 V + 12 Ω) → GND):
- ideal: $I = \\frac{9 - 2.1}{470 + 12} = 14.3 mA$, cathode at 9 V;
- 0.7 V: $I = \\frac{9 - 0.7 - 2.1}{482} = 12.9 mA$, cathode at 8.3 V;
- simulator: $I = \\frac{9 - 0.65 - 2.1}{482 + 0.8} = 12.9 mA$, diode drop $0.65 + 0.0129 × 0.8 ≈ 0.66 V$, cathode ≈ 8.3 V.

Conclusion: **when the supply is much bigger than 0.7 V the ideal model is enough to decide on/off; for actual voltages use 0.7 V**; the last two barely differ.

**Is the diode on or off?** (assume and check): assume on and compute the current; if it is > 0, done. If < 0, assume off instead and check its voltage is < $V_F$. The simulator iterates exactly like this every step.`,
        ),
        table: {
          head: [tr('', ''), tr('真实 1N4007', 'Real 1N4007'), tr('仿真器', 'Simulator')],
          rows: [
            [tr('导通', 'on'), tr('指数曲线，≈ 0.7–1 V', 'exponential, ≈ 0.7–1 V'), '0.65 V + 0.8 Ω'],
            [tr('截止', 'off'), tr('nA 漏电流', 'nA leakage'), '1 GΩ'],
            [tr('反向击穿', 'breakdown'), '1000 V', tr('没有', 'none')],
            [tr('额定电流', 'current rating'), tr('1 A 平均', '1 A average'), tr('> 2 A 平均烧坏', 'burns > 2 A average')],
            [
              tr('开关速度 / 结电容', 'switching speed / capacitance'),
              tr('µs 级反向恢复，约 15 pF', 'µs reverse recovery, ≈ 15 pF'),
              tr('瞬时，无电容', 'instant, no capacitance'),
            ],
          ],
          parts: ['m-pwl', 'm-pwl', null, null, null],
        },
        formulas: [
          { tex: 'V_D = V_F + I·r_d = 0.65 + 0.0129 × 0.8 ≈ 0.66 V', note: tr('防反接实验里二极管的压降（仿真器模型）', 'the diode drop in the protection lab (simulator model)') },
        ],
        calcs: ['diode-forward', 'ohm'],
      },
      {
        id: 'uses',
        short: tr('用途', 'Uses'),
        title: tr('⑦ 两个用途：防反接、续流', '⑦ Two jobs: reverse protection and flyback'),
        body: tr(
          `**1. [[protect|防反接（reverse-polarity protection）]]**：把 [[dprot|二极管]] 串在电源 + 后面。电池接对了，二极管正偏导通，只损失约 0.7 V（阴极 ≈ 8.3 V）；电池接反了，二极管反偏截止，后面的电路一点电流都没有，安全。代价是那 0.7 V 和它上面的功率 $P = 0.66 V × 12.9 mA ≈ 8.5 mW$——大电流时（1 A 就是 0.7 W）会发热，那时改用压降约 0.3 V 的 **Schottky diode（肖特基二极管）** 或 P-MOSFET。

**2. [[flyback|续流二极管（flyback diode）]]**：继电器 [[coil|线圈]] 是一个电感（150 mH + 70 Ω），通电时电流 $\\frac{5 V}{70 Ω} ≈ 71 mA$。三极管突然关断时，电感 **要维持电流不变**（$v = L\\frac{di}{dt}$，见电感拆解），于是集电极电压猛冲上去：仿真里约 [[spike|29 V]]，真实电路可能到三极管击穿。

[[dfly|反并一个二极管]]（**阴极接 +5 V**，阳极接集电极）：正常工作时它反偏，不起作用；关断瞬间集电极一超过 $5 + 0.7 = 5.7 V$，它就导通，给线圈电流一条回路“线圈 → 二极管 → 线圈”，电压被 [[clamp|钳在 5.7 V]]。电流在这个小回路里按 $τ = \\frac{L}{R} = \\frac{150 mH}{70 Ω} ≈ 2.1 ms$ 衰减，能量变成线圈电阻和二极管上的热。`,
          `**1. [[protect|Reverse-polarity protection]]**: put [[dprot|a diode]] in series after the supply’s +. Battery the right way round: the diode is forward-biased and costs only about 0.7 V (cathode ≈ 8.3 V); battery reversed: the diode is reverse-biased and the circuit after it gets no current at all — safe. The price is that 0.7 V and the power in it, $P = 0.66 V × 12.9 mA ≈ 8.5 mW$ — at high current (1 A is 0.7 W) it gets hot, and a **Schottky diode** (≈ 0.3 V) or a P-MOSFET is used instead.

**2. [[flyback|The flyback diode]]**: a relay [[coil|coil]] is an inductor (150 mH + 70 Ω) carrying $\\frac{5 V}{70 Ω} ≈ 71 mA$. When the transistor suddenly switches off, the inductor **insists on keeping its current** ($v = L\\frac{di}{dt}$, see the inductor teardown), so the collector voltage shoots up: about [[spike|29 V]] in the simulator, and in a real circuit up to the transistor’s breakdown.

[[dfly|A diode across the coil]] (**cathode to +5 V**, anode to the collector): in normal operation it is reverse-biased and does nothing; at switch-off, as soon as the collector passes $5 + 0.7 = 5.7 V$ it conducts and gives the coil current a loop "coil → diode → coil", [[clamp|clamping the voltage at 5.7 V]]. The current decays in that loop with $τ = \\frac{L}{R} = \\frac{150 mH}{70 Ω} ≈ 2.1 ms$, and the energy becomes heat in the coil resistance and the diode.`,
        ),
        formulas: [
          { tex: 'V_{clamp} = V_s + V_F = 5 + 0.7 = 5.7 V', note: tr('有续流二极管时集电极的最高电压', 'the collector’s peak with the flyback diode') },
          { tex: 'τ = \\frac{L}{R} = \\frac{150 mH}{70 Ω} ≈ 2.1 ms', note: tr('线圈电流在续流回路里衰减的时间常数', 'decay time constant of the coil current in the loop') },
        ],
        calcs: ['rl-time-constant', 'power'],
      },
    ],
    recap: tr(
      '二极管 = PN 结：p 区（空穴）贴着 n 区（电子），交界处的耗尽区筑起约 0.7 V 的墙。**正偏** 把墙推平，电流按 $I = I_s(e^{V/(nV_T)} - 1)$ 指数增长；**反偏** 把墙加高，只剩 nA 漏电流。手算用 0.7 V 模型，仿真器用 0.65 V + 0.8 Ω。色环 = 阴极 = 电流出口；串联防反接、反并续流。',
      'A diode is a PN junction: p (holes) against n (electrons), with a depletion region that builds a wall of about 0.7 V. **Forward** bias flattens it and the current grows as $I = I_s(e^{V/(nV_T)} - 1)$; **reverse** bias raises it and only nA leak through. Hand calculations use the 0.7 V model; the simulator uses 0.65 V + 0.8 Ω. Band = cathode = where current leaves; in series it protects against reversal, across a coil it catches the flyback.',
    ),
  };
}
