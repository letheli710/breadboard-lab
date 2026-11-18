// Teardown: the LED. Outside (long leg = anode, flat edge = cathode) → X-ray (epoxy lens, anvil
// with the reflector cup, die, bond wire, post) → the PN junction where electrons and holes
// recombine and give off light (colour = band gap) → the I–V curve with its knee at Vf → the
// simulator model (Vf + 12 Ω) → the series resistor, derived with KVL and drawn as a load line →
// why parallel LEDs each need their own resistor.

import './passives.css';
import { tr } from '../../core/i18n';
import { sub } from '../TeardownView';
import type { Teardown } from '../types';

const show = (c: boolean) => (c ? 'td-show' : 'td-hide');

/* ---------------------------------------------------------------- I–V curves (real + model) */

/** real LED: V(I) = n·V_T·ln(1 + I/I_s) + I·12 Ω, with n·V_T = 50 mV, chosen so V(20 mA) = Vf + 0.24 V */
const realU = (i: number, vf: number) => 0.05 * Math.log(1 + i / (0.02 * Math.exp(-(vf - 0.0) / 0.05))) + i * 12;

interface G {
  x0: number;
  y0: number;
  sx: number; // px per volt
  sy: number; // px per mA
}
const gx = (g: G, u: number) => g.x0 + u * g.sx;
const gy = (g: G, ma: number) => g.y0 - ma * g.sy;

function realPath(g: G, vf: number, imax: number, umin = -0.6) {
  const pts: string[] = [`${gx(g, umin)},${gy(g, 0)}`, `${gx(g, 0)},${gy(g, 0)}`];
  for (let k = 0; k <= 80; k++) {
    const i = 1e-6 * Math.pow((imax * 1e-3) / 1e-6, k / 80);
    pts.push(`${gx(g, realU(i, vf))},${gy(g, i * 1000)}`);
  }
  return pts.join(' ');
}

function Axes({ g, umin, umax, imax, uTicks, iTicks }: { g: G; umin: number; umax: number; imax: number; uTicks: number[]; iTicks: number[] }) {
  return (
    <g>
      {uTicks.map((u) => (
        <g key={u}>
          <line x1={gx(g, u)} y1={gy(g, 0)} x2={gx(g, u)} y2={gy(g, imax)} className="pv-grid" />
          <text x={gx(g, u)} y={g.y0 + 16} textAnchor="middle" className="td-small">
            {u}
          </text>
        </g>
      ))}
      {iTicks.map((m) => (
        <g key={m}>
          <line x1={gx(g, umin)} y1={gy(g, m)} x2={gx(g, umax)} y2={gy(g, m)} className="pv-grid" />
          <text x={gx(g, 0) - 6} y={gy(g, m) + 4} textAnchor="end" className="td-small">
            {m}
          </text>
        </g>
      ))}
      <line x1={gx(g, umin)} y1={g.y0} x2={gx(g, umax) + 14} y2={g.y0} className="pv-axis" markerEnd="url(#ld-ah)" />
      <line x1={gx(g, 0)} y1={g.y0 + 6} x2={gx(g, 0)} y2={gy(g, imax) - 14} className="pv-axis" markerEnd="url(#ld-ah)" />
      <text x={gx(g, umax) + 14} y={g.y0 - 8} textAnchor="end" className="pv-lbl pv-blue">
        V / V
      </text>
      <text x={gx(g, 0) + 8} y={gy(g, imax) - 6} className="pv-lbl pv-red">
        I / mA
      </text>
    </g>
  );
}

/* ---------------------------------------------------------------- small symbols */

function LedSym({ x, y, len = 44, fill = '#ffb3b8', part }: { x: number; y: number; len?: number; fill?: string; part?: string }) {
  // vertical LED: anode at (x, y), cathode at (x, y + len); current flows down
  const m = y + len / 2;
  return (
    <g data-part={part}>
      <line x1={x} y1={y} x2={x} y2={m - 10} className="pv-wire" />
      <polygon points={`${x - 12},${m - 10} ${x + 12},${m - 10} ${x},${m + 9}`} fill={fill} stroke="var(--ink)" strokeWidth={1.8} />
      <line x1={x - 12} y1={m + 9} x2={x + 12} y2={m + 9} className="pv-wire" />
      <line x1={x} y1={m + 9} x2={x} y2={y + len} className="pv-wire" />
      <path d={`M${x + 15} ${m - 4} l9 -7 M${x + 15} ${m + 4} l9 -7`} stroke="#e63946" strokeWidth={1.6} markerEnd="url(#ld-ah)" />
    </g>
  );
}

function Zig({ x1, y1, x2, y2, part, body = 50 }: { x1: number; y1: number; x2: number; y2: number; part?: string; body?: number }) {
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

/* ---------------------------------------------------------------- layers 0–1: the package */

function Package({ layer }: { layer: number }) {
  const xray = layer === 1;
  return (
    <g className={show(layer <= 1)}>
      {/* legs */}
      <rect x={252} y={262} width={9} height={164} fill="#c9ccd1" stroke="#7d8088" data-part="anode" />
      <rect x={299} y={262} width={9} height={118} fill="#c9ccd1" stroke="#7d8088" data-part="cathode" />
      {/* internal frame (x-ray) */}
      <g className={show(xray)}>
        <path d="M256 262 L256 150 L272 150 L272 140" stroke="#9aa0a6" strokeWidth={9} fill="none" strokeLinejoin="round" data-part="post anode" />
        <polygon points="284,176 330,176 330,142 284,142" fill="#9aa0a6" stroke="#6b7078" data-part="anvil cathode" />
        <rect x={299} y={176} width={9} height={90} fill="#9aa0a6" stroke="#6b7078" data-part="anvil cathode" />
        <polygon points="286,142 328,142 320,160 294,160" fill="#e8e8ea" stroke="#6b7078" data-part="cup" />
        <rect x={300} y={146} width={14} height={9} fill="#7a1f2a" stroke="#3a0d12" data-part="die" />
        <path d="M307 146 C 300 110, 280 118, 272 140" fill="none" stroke="#c9a227" strokeWidth={1.8} data-part="bond" />
        <g data-part="light">
          {[-26, -10, 6, 22].map((dx) => (
            <path key={dx} d={`M${307 + dx * 0.3} 138 L${307 + dx} 72`} stroke="#ff6b6b" strokeWidth={1.6} strokeDasharray="4 4" markerEnd="url(#ld-ahr)" />
          ))}
        </g>
      </g>
      {/* epoxy body: dome + cylinder + flange with flat */}
      <g style={{ opacity: xray ? 0.28 : 1, transition: 'opacity .45s' }}>
        <path d="M232 250 L232 120 A48 48 0 0 1 328 120 L328 250 Z" fill="#e8394a" fillOpacity={0.82} stroke="#a3202d" strokeWidth={1.8} data-part="lens" />
        <path d="M222 250 L330 250 L330 266 L222 266 Z" fill="#d6303f" stroke="#a3202d" strokeWidth={1.8} data-part="flange" />
        <line x1={330} y1={248} x2={330} y2={268} stroke="#3a0d12" strokeWidth={3} data-part="flat cathode" />
        <path d="M246 112 A34 34 0 0 1 280 80" fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={5} strokeLinecap="round" />
      </g>
      <g className={show(!xray)}>
        <text x={256} y={438} textAnchor="middle" className="pv-lbl pv-red">
          + A
        </text>
        <text x={304} y={396} textAnchor="middle" className="pv-lbl pv-blue">
          − K
        </text>
        {/* symbol */}
        <g data-part="sym">
          <line x1={460} y1={140} x2={460} y2={180} className="pv-wire" />
          <polygon points="446,180 474,180 460,204" fill="#ffb3b8" stroke="var(--ink)" strokeWidth={1.8} />
          <line x1={446} y1={204} x2={474} y2={204} className="pv-wire" />
          <line x1={460} y1={204} x2={460} y2={244} className="pv-wire" />
          <path d="M478 186 l10 -8 M478 196 l10 -8" stroke="#e63946" strokeWidth={1.6} markerEnd="url(#ld-ah)" />
          <text x={448} y={150} textAnchor="end" className="pv-lbl pv-red">
            {tr('阳极 A', 'anode A')}
          </text>
          <text x={448} y={240} textAnchor="end" className="pv-lbl pv-blue">
            {tr('阴极 K', 'cathode K')}
          </text>
          <text x={460} y={270} textAnchor="middle" className="td-small">
            {tr('电路符号', 'symbol')}
          </text>
        </g>
      </g>
    </g>
  );
}

/* ---------------------------------------------------------------- layer 2: PN junction */

function Junction({ layer }: { layer: number }) {
  const holes = [
    [80, 120],
    [120, 160],
    [150, 110],
    [190, 145],
    [100, 200],
    [170, 205],
    [215, 185],
    [135, 235],
  ];
  const elecs = [
    [360, 125],
    [410, 160],
    [450, 115],
    [340, 190],
    [395, 210],
    [470, 190],
    [430, 240],
    [370, 245],
  ];
  return (
    <g className={show(layer === 2)}>
      <rect x={50} y={90} width={230} height={180} fill="#ffe1e4" stroke="#c62f3b" strokeWidth={1.5} data-part="p" />
      <rect x={280} y={90} width={230} height={180} fill="#dde7fb" stroke="#2b59c3" strokeWidth={1.5} data-part="n" />
      <text x={165} y={82} textAnchor="middle" className="pv-lbl pv-red">
        {tr('p 区：多空穴 ○', 'p side: holes ○')}
      </text>
      <text x={395} y={82} textAnchor="middle" className="pv-lbl pv-blue">
        {tr('n 区：多电子 ●', 'n side: electrons ●')}
      </text>
      <g data-part="hole">
        {holes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={7} fill="#fff" stroke="#c62f3b" strokeWidth={2} />
        ))}
        <path d="M200 260 L250 260" stroke="#c62f3b" strokeWidth={2} markerEnd="url(#ld-ahr)" />
      </g>
      <g data-part="elec">
        {elecs.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={6} fill="#2b59c3" />
        ))}
        <path d="M360 260 L310 260" stroke="#2b59c3" strokeWidth={2} markerEnd="url(#ld-ahb)" />
      </g>
      {/* recombination at the junction */}
      <g data-part="recomb">
        <line x1={280} y1={90} x2={280} y2={270} stroke="var(--ink)" strokeWidth={2} strokeDasharray="5 4" />
        {[150, 195, 240].map((y) => (
          <g key={y}>
            <circle cx={280} cy={y} r={10} fill="#fff4b0" stroke="#e0a800" strokeWidth={1.5} />
            <path d={`M290 ${y - 6} q 8 -8 16 0 t 16 0 t 16 0`} fill="none" stroke="#e63946" strokeWidth={2.2} markerEnd="url(#ld-ahr)" transform={`rotate(-30 290 ${y - 6})`} />
          </g>
        ))}
      </g>
      <text x={280} y={290} textAnchor="middle" className="td-small">
        {tr('结（junction）：电子落进空穴，放出一个光子', 'junction: an electron drops into a hole and gives off a photon')}
      </text>
      {/* contacts and current */}
      <rect x={40} y={90} width={10} height={180} fill="#c9ccd1" stroke="#7d8088" data-part="anode" />
      <rect x={510} y={90} width={10} height={180} fill="#c9ccd1" stroke="#7d8088" data-part="cathode" />
      <text x={30} y={186} textAnchor="end" className="pv-lbl pv-red" data-part="anode">
        +
      </text>
      <text x={530} y={186} className="pv-lbl pv-blue" data-part="cathode">
        −
      </text>
      {/* band diagram */}
      <g data-part="gap">
        <rect x={50} y={318} width={460} height={110} rx={12} className="td-panel" />
        <line x1={120} y1={348} x2={300} y2={348} stroke="#2b59c3" strokeWidth={3} />
        <line x1={120} y1={404} x2={300} y2={404} stroke="#c62f3b" strokeWidth={3} />
        <text x={114} y={352} textAnchor="end" className="td-small">
          {tr('导带', 'cond.')}
        </text>
        <text x={114} y={408} textAnchor="end" className="td-small">
          {tr('价带', 'valence')}
        </text>
        <circle cx={190} cy={341} r={6} fill="#2b59c3" />
        <path d="M190 350 L190 396" stroke="var(--ink)" strokeWidth={1.6} markerEnd="url(#ld-ah)" />
        <circle cx={190} cy={404} r={6} fill="#fff" stroke="#c62f3b" strokeWidth={2} />
        <text x={200} y={380} className="pv-lbl">
          {sub('E_g')}
        </text>
        <path d="M228 376 q 8 -8 16 0 t 16 0 t 16 0 t 16 0" fill="none" stroke="#e63946" strokeWidth={2.2} markerEnd="url(#ld-ahr)" />
        <text x={318} y={360} className="pv-eq">
          {sub('λ = hc / E_g')}
        </text>
        <text x={318} y={384} className="td-small">
          {tr('红：1.9 eV → 650 nm', 'red: 1.9 eV → 650 nm')}
        </text>
        <text x={318} y={404} className="td-small">
          {tr('蓝：2.7 eV → 460 nm', 'blue: 2.7 eV → 460 nm')}
        </text>
      </g>
    </g>
  );
}

/* ---------------------------------------------------------------- layers 3–4: I–V */

const GIV: G = { x0: 110, y0: 400, sx: 112, sy: 7.6 };

function IV({ layer }: { layer: number }) {
  const g = GIV;
  const model = layer === 4;
  return (
    <g className={show(layer === 3 || layer === 4)}>
      <Axes g={g} umin={-0.6} umax={3.5} imax={28} uTicks={[1, 2, 3]} iTicks={[10, 20]} />
      <polyline points={realPath(g, 1.8, 28)} className={`pv-curve ${model ? 'thin' : ''}`} data-part="red" style={{ opacity: model ? 0.5 : 1 }} />
      <polyline points={realPath(g, 3.0, 28)} className={`pv-curve blue ${model ? 'thin' : ''}`} data-part="blue" style={{ opacity: model ? 0.35 : 1 }} />
      <g className={show(!model)}>
        <line x1={gx(g, 1.8)} y1={g.y0} x2={gx(g, 1.8)} y2={gy(g, 26)} className="pv-dash" data-part="knee" />
        <line x1={gx(g, 3.0)} y1={g.y0} x2={gx(g, 3.0)} y2={gy(g, 26)} className="pv-dash" data-part="knee" />
        <text x={gx(g, 1.8) - 6} y={gy(g, 24)} textAnchor="end" className="pv-lbl pv-red" data-part="red">
          {tr('红 ≈ 1.8–2 V', 'red ≈ 1.8–2 V')}
        </text>
        <text x={gx(g, 3.0) - 6} y={gy(g, 24)} textAnchor="end" className="pv-lbl pv-blue" data-part="blue">
          {tr('蓝 ≈ 3 V', 'blue ≈ 3 V')}
        </text>
        <text x={gx(g, 0.9)} y={gy(g, 2.2)} textAnchor="middle" className="td-small" data-part="off">
          {tr('膝点以下 ≈ 0 mA', 'below the knee ≈ 0 mA')}
        </text>
        <text x={gx(g, -0.6)} y={g.y0 + 32} className="td-small" data-part="rev">
          {tr('反向：≈ 0，−5 V 以下会击穿', 'reverse: ≈ 0, breaks down past −5 V')}
        </text>
        <g data-part="colours">
          {(
            [
              ['#ff3b30', tr('红', 'red'), '1.8 V'],
              ['#ffcc00', tr('黄', 'yellow'), '2.0 V'],
              ['#34c759', tr('绿', 'green'), '2.1 V'],
              ['#2f7bff', tr('蓝', 'blue'), '3.0 V'],
              ['#e8e8f8', tr('白', 'white'), '3.0 V'],
            ] as const
          ).map(([c, n, v], i) => (
            <g key={i}>
              <circle cx={70 + i * 96} cy={70} r={12} fill={c} stroke="#555" strokeWidth={1} />
              <text x={88 + i * 96} y={66} className="pv-lbl">
                {n}
              </text>
              <text x={88 + i * 96} y={82} className="td-small">
                {v}
              </text>
            </g>
          ))}
          <text x={280} y={112} textAnchor="middle" className="td-small">
            {sub(tr('本课程 / 仿真器用的正向压降 V_F', 'forward voltage V_F used in the course / simulator'))}
          </text>
        </g>
      </g>
      {/* model overlay */}
      <g className={show(model)}>
        <polyline points={`${gx(g, -0.6)},${g.y0} ${gx(g, 1.8)},${g.y0} ${gx(g, 1.8 + 0.028 * 12)},${gy(g, 28)}`} className="pv-curve ink" data-part="model" />
        <polyline points={`${gx(g, 3.0)},${g.y0} ${gx(g, 3.0 + 0.028 * 12)},${gy(g, 28)}`} className="pv-curve ink" data-part="model" />
        <circle cx={gx(g, 1.8)} cy={g.y0} r={5} className="pv-dot" data-part="vf" />
        <text x={gx(g, 1.8) - 4} y={g.y0 - 10} textAnchor="end" className="pv-lbl" data-part="vf">
          {sub('V_F')}
        </text>
        <text x={gx(g, 2.2)} y={gy(g, 16.7) + 4} className="pv-lbl" data-part="slope">
          {tr('斜率 = 1 / 12 Ω', 'slope = 1 / 12 Ω')}
        </text>
        <circle cx={gx(g, 2.0)} cy={gy(g, 16.7)} r={5} fill="#e63946" />
        <text x={gx(g, 2.0) - 8} y={gy(g, 16.7) - 6} textAnchor="end" className="pv-lbl pv-red">
          2.0 V → 16.7 mA
        </text>
        {/* equivalent circuit */}
        <g>
          <circle cx={60} cy={80} r={4} className="pv-term" />
          <text x={60} y={66} textAnchor="middle" className="pv-lbl pv-red">
            A
          </text>
          <line x1={64} y1={80} x2={110} y2={80} className="pv-wire" />
          <g data-part="sw">
            <polygon points="110,66 110,94 134,80" fill="#fff" stroke="var(--ink)" strokeWidth={1.8} />
            <line x1={134} y1={66} x2={134} y2={94} className="pv-wire" />
            <text x={122} y={118} textAnchor="middle" className="td-small">
              {tr('理想开关', 'ideal switch')}
            </text>
          </g>
          <line x1={134} y1={80} x2={190} y2={80} className="pv-wire" />
          <g data-part="vf">
            <line x1={190} y1={64} x2={190} y2={96} className="pv-wire" />
            <line x1={202} y1={72} x2={202} y2={88} className="pv-wire" style={{ strokeWidth: 4 }} />
            <text x={196} y={56} textAnchor="middle" className="pv-lbl">
              {sub('V_F = 1.8 V')}
            </text>
            <text x={184} y={74} textAnchor="end" className="pv-tiny">
              +
            </text>
          </g>
          <line x1={202} y1={80} x2={260} y2={80} className="pv-wire" />
          <Zig x1={260} y1={80} x2={350} y2={80} part="slope" body={44} />
          <text x={305} y={60} textAnchor="middle" className="pv-lbl" data-part="slope">
            12 Ω
          </text>
          <line x1={350} y1={80} x2={396} y2={80} className="pv-wire" />
          <circle cx={400} cy={80} r={4} className="pv-term" />
          <text x={400} y={66} textAnchor="middle" className="pv-lbl pv-blue">
            K
          </text>
          <text x={430} y={78} className="pv-eq">
            {tr('红 LED', 'red LED')}
          </text>
          <text x={430} y={98} className="td-small">
            {tr('仿真器模型', 'simulator model')}
          </text>
        </g>
      </g>
    </g>
  );
}

/* ---------------------------------------------------------------- layer 5: series resistor */

function Series({ layer }: { layer: number }) {
  const g: G = { x0: 320, y0: 410, sx: 48, sy: 9 };
  const loadEnd = 4;
  const lx = 220; // LED column
  return (
    <g className={show(layer === 5)}>
      {/* loop: battery (left), 470 Ω (top), LED (right) */}
      <g data-part="bat">
        <line x1={60} y1={150} x2={60} y2={200} className="pv-wire" />
        <line x1={44} y1={200} x2={76} y2={200} className="pv-wire" />
        <line x1={52} y1={210} x2={68} y2={210} className="pv-wire" style={{ strokeWidth: 4 }} />
        <line x1={60} y1={210} x2={60} y2={240} className="pv-wire" />
        <text x={36} y={208} textAnchor="end" className="pv-lbl">
          9 V
        </text>
        <Zig x1={60} y1={240} x2={60} y2={300} body={34} part="rint" />
        <text x={44} y={276} textAnchor="end" className="td-small" data-part="rint">
          1.5 Ω
        </text>
      </g>
      <path d="M60 150 L60 80 L100 80" className="pv-wire" />
      <Zig x1={100} y1={80} x2={180} y2={80} part="res" body={44} />
      <text x={140} y={58} textAnchor="middle" className="pv-lbl" data-part="res">
        470 Ω
      </text>
      <text x={140} y={112} textAnchor="middle" className="pv-lbl pv-violet" data-part="res">
        {sub('V_R = 7.0 V')}
      </text>
      <path d={`M180 80 L${lx} 80 L${lx} 180`} className="pv-wire" />
      <path d={`M${lx + 12} 100 L${lx + 12} 140`} stroke="#e63946" strokeWidth={2} markerEnd="url(#ld-ahr)" />
      <text x={lx + 20} y={126} className="pv-lbl pv-red">
        I = 14.9 mA
      </text>
      <LedSym x={lx} y={180} len={70} part="led" />
      <text x={lx - 18} y={224} textAnchor="end" className="pv-lbl pv-red" data-part="led">
        1.98 V
      </text>
      <path d={`M${lx} 250 L${lx} 340 L60 340 L60 300`} className="pv-wire" />
      {/* load line */}
      <line x1={gx(g, 0)} y1={g.y0} x2={gx(g, loadEnd) + 12} y2={g.y0} className="pv-axis" markerEnd="url(#ld-ah)" />
      <line x1={gx(g, 0)} y1={g.y0} x2={gx(g, 0)} y2={gy(g, 22)} className="pv-axis" markerEnd="url(#ld-ah)" />
      {[1, 2, 3, 4].map((u) => (
        <text key={u} x={gx(g, u)} y={g.y0 + 16} textAnchor="middle" className="td-small">
          {u}
        </text>
      ))}
      {[10, 20].map((m) => (
        <text key={m} x={gx(g, 0) - 6} y={gy(g, m) + 4} textAnchor="end" className="td-small">
          {m}
        </text>
      ))}
      <text x={gx(g, loadEnd) + 12} y={g.y0 - 8} textAnchor="end" className="pv-lbl pv-blue">
        {sub('V_LED / V')}
      </text>
      <text x={gx(g, 0) + 8} y={gy(g, 22)} className="pv-lbl pv-red">
        I / mA
      </text>
      <polyline points={realPath(g, 1.8, 22, 0)} className="pv-curve" data-part="led" />
      <line x1={gx(g, 0)} y1={gy(g, 19.09)} x2={gx(g, loadEnd)} y2={gy(g, ((9 - loadEnd) / 471.5) * 1000)} className="pv-curve violet" data-part="loadline" />
      <circle cx={gx(g, 1.98)} cy={gy(g, 14.9)} r={6} fill="#7a3fc0" stroke="#fff" strokeWidth={1.5} data-part="op" />
      <text x={gx(g, 2.25)} y={gy(g, 9.5)} className="pv-lbl pv-violet" data-part="op">
        {tr('工作点', 'operating point')}
      </text>
      <text x={gx(g, 2.25)} y={gy(g, 9.5) + 16} className="td-small" data-part="op">
        1.98 V, 14.9 mA
      </text>
      <text x={gx(g, 2.3)} y={gy(g, 21)} className="pv-lbl pv-violet" data-part="loadline">
        {tr('负载线', 'load line')}
      </text>
      <text x={gx(g, 2.3)} y={gy(g, 21) + 16} className="td-small" data-part="loadline">
        I = (9 − V) / 471.5 Ω
      </text>
    </g>
  );
}

/* ---------------------------------------------------------------- layer 6: parallel LEDs */

function Parallel({ layer }: { layer: number }) {
  const panel = (x0: number, good: boolean) => {
    const top = 104;
    return (
      <g data-part={good ? 'good' : 'bad'}>
        <rect x={x0} y={56} width={250} height={370} rx={12} className="td-panel" />
        <text x={x0 + 125} y={82} textAnchor="middle" className={`pv-lbl ${good ? 'pv-green' : 'pv-red'}`}>
          {good ? tr('✔ 每个 LED 自己的电阻', '✔ one resistor each') : tr('✘ 共用一个电阻', '✘ one shared resistor')}
        </text>
        <text x={x0 + 30} y={top + 4} className="pv-lbl pv-red">
          +5 V
        </text>
        {good ? (
          <>
            <path d={`M${x0 + 70} ${top} L${x0 + 190} ${top}`} className="pv-wire" />
            <circle cx={x0 + 70} cy={top} r={4} className="pv-term" />
            {[x0 + 100, x0 + 190].map((x, i) => (
              <g key={x}>
                <circle cx={x} cy={top} r={3.5} className="pv-dot" />
                <Zig x1={x} y1={top} x2={x} y2={210} body={50} />
                <text x={x - 14} y={162} textAnchor="end" className="td-small">
                  150 Ω
                </text>
                <LedSym x={x} y={210} len={70} fill={i ? '#a7e8b8' : '#ffb3b8'} />
                <line x1={x} y1={280} x2={x} y2={330} className="pv-wire" />
              </g>
            ))}
            <path d={`M${x0 + 100} 330 L${x0 + 190} 330`} className="pv-wire" />
            <Gnd x={x0 + 145} y={330} />
            <text x={x0 + 100} y={372} textAnchor="middle" className="pv-lbl pv-red">
              19.8 mA
            </text>
            <text x={x0 + 190} y={372} textAnchor="middle" className="pv-lbl pv-green">
              17.9 mA
            </text>
            <text x={x0 + 145} y={400} textAnchor="middle" className="td-small">
              {tr('两个都亮', 'both light')}
            </text>
          </>
        ) : (
          <>
            <circle cx={x0 + 70} cy={top} r={4} className="pv-term" />
            <path d={`M${x0 + 74} ${top} L${x0 + 145} ${top}`} className="pv-wire" />
            <Zig x1={x0 + 145} y1={top} x2={x0 + 145} y2={190} body={50} />
            <text x={x0 + 160} y={152} className="td-small">
              150 Ω
            </text>
            <path d={`M${x0 + 100} 190 L${x0 + 190} 190`} className="pv-wire" />
            <circle cx={x0 + 145} cy={190} r={3.5} className="pv-dot" />
            <text x={x0 + 145} y={182} textAnchor="middle" className="pv-lbl pv-violet" data-part="node">
              2.04 V
            </text>
            {[x0 + 100, x0 + 190].map((x, i) => (
              <g key={x}>
                <line x1={x} y1={190} x2={x} y2={210} className="pv-wire" />
                <LedSym x={x} y={210} len={70} fill={i ? '#e6efe8' : '#ffb3b8'} />
                <line x1={x} y1={280} x2={x} y2={330} className="pv-wire" />
              </g>
            ))}
            <path d={`M${x0 + 100} 330 L${x0 + 190} 330`} className="pv-wire" />
            <Gnd x={x0 + 145} y={330} />
            <text x={x0 + 100} y={372} textAnchor="middle" className="pv-lbl pv-red">
              19.8 mA
            </text>
            <text x={x0 + 190} y={372} textAnchor="middle" className="pv-lbl pv-mute">
              0 mA
            </text>
            <text x={x0 + 145} y={400} textAnchor="middle" className="td-small">
              {tr('2.04 V < 2.1 V：绿灯不亮', '2.04 V < 2.1 V: green stays dark')}
            </text>
          </>
        )}
      </g>
    );
  };
  return (
    <g className={show(layer === 6)}>
      {panel(20, false)}
      {panel(290, true)}
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="ld-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pv-ah" />
        </marker>
        <marker id="ld-ahr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#e63946" />
        </marker>
        <marker id="ld-ahb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#2b59c3" />
        </marker>
      </defs>
      <Package layer={layer} />
      <Junction layer={layer} />
      <IV layer={layer} />
      <Series layer={layer} />
      <Parallel layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'led',
    title: tr('LED：会发光的二极管', 'The LED: a diode that glows'),
    subtitle: tr(
      'LED = Light-Emitting Diode（发光二极管）。从长短脚和平边，到环氧透镜里的反光杯和一粒小芯片，再到 PN 结里电子和空穴复合发光；最后用 I–V 曲线和 “Vf + 12 Ω” 模型推出限流电阻怎么选、为什么并联的 LED 要各配一个电阻。',
      'LED = Light-Emitting Diode. From the long leg and the flat edge, to the reflector cup and the tiny chip inside the epoxy lens, to electrons and holes recombining in the PN junction; then the I–V curve and the "Vf + 12 Ω" model give us the series resistor and the reason parallel LEDs each need their own.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'outside',
        short: tr('外形', 'Outside'),
        title: tr('① 外形：长脚是阳极，平边是阴极', '① Outside: long leg = anode, flat edge = cathode'),
        body: tr(
          `一颗 5 mm 直插 LED：一个圆顶的 [[lens|环氧树脂透镜 epoxy lens]]，底部一圈 [[flange|凸缘 flange]]，下面两只脚。LED **有极性**（polarity），电流只能从一个方向流：
- [[anode|长脚]] = **anode（阳极，A，+）**：接电源正极一侧；
- [[cathode|短脚]] = **cathode（阴极，K，−）**：接 GND 一侧；凸缘在这一侧被削出一个 [[flat|平边 flat]]。

脚剪短以后看不出长短，就看平边；平边也磨掉了，就对着光看里面——大的那块金属是阴极（下一层）。

[[sym|电路符号]]：三角形指向电流方向（A → K），竖线是阴极，两个小箭头表示“发出光”。和普通二极管符号只差这两个箭头——LED 就是一种二极管。

插反会怎样？没有电流，不亮。5 V 以内一般不会坏；但 LED 的反向耐压 $V_R$ 只有约 5 V，9 V 反接就超规格了。`,
          `A 5 mm through-hole LED: a domed [[lens|epoxy lens]], a [[flange|flange]] round the bottom, two legs. An LED **has polarity**: current can only flow one way:
- [[anode|the long leg]] = **anode (A, +)**: towards the supply’s + side;
- [[cathode|the short leg]] = **cathode (K, −)**: towards GND; the flange has a [[flat|flat edge]] on this side.

Once the legs are trimmed, use the flat; if that is worn away, look inside against the light — the bigger piece of metal is the cathode (next layer).

[[sym|The symbol]]: the triangle points the way current flows (A → K), the bar is the cathode, and two little arrows mean "emits light". It differs from a plain diode only by those arrows — an LED is a diode.

Plugged in backwards? No current, no light. Up to 5 V it is usually fine, but an LED’s reverse rating $V_R$ is only about 5 V, so 9 V backwards is out of spec.`,
        ),
        table: {
          head: [tr('脚', 'Leg'), tr('名字', 'Name'), tr('怎么认', 'How to tell'), tr('接哪', 'Goes to')],
          rows: [
            [
              tr('长脚', 'long'),
              tr('anode 阳极 A（+）', 'anode A (+)'),
              tr('更长；里面是小的那根柱', 'longer; the small post inside'),
              tr('电源 + 一侧（经过电阻）', 'the + side (via the resistor)'),
            ],
            [tr('短脚', 'short'), tr('cathode 阴极 K（−）', 'cathode K (−)'), tr('平边一侧；里面是大的“砧座”', 'flat side; the big anvil inside'), tr('GND 一侧', 'the GND side')],
          ],
          parts: ['anode', 'cathode'],
        },
        callouts: [
          { part: 'lens', label: tr('环氧透镜', 'epoxy lens'), x: 245, y: 110, lx: 120, ly: 70 },
          { part: 'flat', label: tr('平边 = 阴极', 'flat = cathode'), x: 330, y: 258, lx: 410, ly: 320 },
          { part: 'anode', label: tr('长脚 = 阳极', 'long leg = anode'), x: 252, y: 360, lx: 120, ly: 360 },
        ],
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：砧座、反光杯、一粒芯片、一根金线', '② X-ray: anvil, reflector cup, one chip, one gold wire'),
        body: tr(
          `把环氧变透明，里面是一个精巧的小结构：
1. [[anvil|砧座 anvil]]：阴极脚在里面变成一大块金属，顶上冲出一个 [[cup|反光杯 reflector cup]]。
2. [[die|芯片 die]]：一粒约 0.25 mm 见方的半导体晶片，粘在杯底，真正发光的就是它。它的底面通过杯子接阴极。
3. [[bond|金线 bond wire]]：比头发还细（约 25 µm），从芯片顶面连到 [[post|阳极柱 post]]。
4. [[lens|环氧透镜]]：既是外壳，也是透镜：圆顶把芯片发出的光收拢成一个 [[light|向上的光束]]（5 mm LED 常见视角 20–30°）。反光杯把往侧面跑的光也反射上去。

电流的路径：阳极脚 → 阳极柱 → 金线 → 芯片（从上往下穿过它）→ 反光杯 → 阴极脚。所以芯片里 **从上到下** 是一个 PN 结，下一层把它放大。`,
          `Make the epoxy transparent and there is a neat little structure inside:
1. [[anvil|the anvil]]: inside, the cathode leg widens into a big piece of metal with a [[cup|reflector cup]] stamped into the top.
2. [[die|the die]]: a semiconductor chip about 0.25 mm square glued into the cup — this is what actually glows. Its bottom face reaches the cathode through the cup.
3. [[bond|a bond wire]]: thinner than a hair (about 25 µm), from the top of the die to [[post|the anode post]].
4. [[lens|the epoxy lens]]: both the case and a lens; the dome gathers the light into a [[light|beam pointing up]] (a 5 mm LED typically spreads 20–30°). The cup reflects sideways light upwards too.

The current path: anode leg → anode post → bond wire → die (top to bottom) → cup → cathode leg. So **from top to bottom** the die is a PN junction, magnified in the next layer.`,
        ),
        callouts: [
          { part: 'die', label: tr('芯片（发光）', 'die (glows)'), x: 314, y: 150, lx: 440, ly: 120 },
          { part: 'bond', label: tr('金线', 'bond wire'), x: 290, y: 118, lx: 160, ly: 60 },
          { part: 'cup', label: tr('反光杯', 'reflector cup'), x: 326, y: 150, lx: 440, ly: 180 },
          { part: 'anvil', label: tr('砧座 = 阴极', 'anvil = cathode'), x: 305, y: 220, lx: 440, ly: 240 },
          { part: 'post', label: tr('阳极柱', 'anode post'), x: 256, y: 200, lx: 140, ly: 220 },
        ],
      },
      {
        id: 'junction',
        short: tr('PN 结', 'PN junction'),
        title: tr('③ 芯片里：电子掉进空穴，放出光子', '③ Inside the die: electrons fall into holes and give off light'),
        body: tr(
          `芯片由两种 **doped（掺杂）** 半导体拼成：
- [[p|p 区]]（接阳极）：掺了缺电子的杂质，里面有很多可以移动的 **hole（空穴）**——“少了一个电子的位置”，相当于一个 + 电荷；
- [[n|n 区]]（接阴极）：掺了多电子的杂质，有很多可以移动的 **electron（电子）**。

两区交界叫 **PN junction（PN 结）**。加正向电压（[[anode|阳极 +]]、[[cathode|阴极 −]]）时，[[hole|空穴]] 被推向右、[[elec|电子]] 被推向左，在结上相遇：电子 **掉进** 空穴，这叫 **recombination（复合）**。电子掉下的能量差 $E_g$（**band gap 禁带宽度**）以一个 **photon（光子）** 的形式放出——[[recomb|这就是光]]。

光的颜色由 [[gap|禁带宽度]] 决定：
$$λ = \\frac{hc}{E_g} ≈ \\frac{1240}{E_g [eV]} nm$$
红光 AlGaInP 约 1.9 eV → 650 nm；蓝光 InGaN 约 2.7 eV → 460 nm。

**为什么不同颜色的 $V_F$ 不同**：要让电子“爬上”能跳下 $E_g$ 的高度，每个电子至少要被电源推 $E_g / q$ 伏。所以 $V_F ≈ E_g / q$：红 ≈ 1.8–2 V，蓝 ≈ 3 V。颜色越偏蓝，光子能量越大，需要的电压越高。白光 LED = 蓝光芯片 + 黄色荧光粉（phosphor），所以 $V_F$ 和蓝光一样 ≈ 3 V。`,
          `The die is made of two **doped** semiconductors:
- [[p|the p side]] (to the anode) is doped with an electron-poor impurity and has many mobile **holes** — "a missing electron", acting as a + charge;
- [[n|the n side]] (to the cathode) is doped with an electron-rich impurity and has many mobile **electrons**.

Where they meet is the **PN junction**. With forward voltage ([[anode|anode +]], [[cathode|cathode −]]) [[hole|holes]] are pushed right and [[elec|electrons]] left, and they meet at the junction: an electron **drops into** a hole — **recombination**. The energy it drops, $E_g$ (the **band gap**), leaves as a **photon** — [[recomb|that is the light]].

The colour is set by [[gap|the band gap]]:
$$λ = \\frac{hc}{E_g} ≈ \\frac{1240}{E_g [eV]} nm$$
red AlGaInP about 1.9 eV → 650 nm; blue InGaN about 2.7 eV → 460 nm.

**Why each colour has its own $V_F$**: to lift an electron high enough to fall by $E_g$, the supply must push each electron through at least $E_g / q$ volts. So $V_F ≈ E_g / q$: red ≈ 1.8–2 V, blue ≈ 3 V. The bluer the light, the more energy per photon and the higher the voltage. A white LED is a blue die plus yellow phosphor, so its $V_F$ is the blue one, ≈ 3 V.`,
        ),
        table: {
          head: [tr('颜色', 'Colour'), tr('材料', 'Material'), tr('波长', 'Wavelength'), tr('$V_F$（仿真器）', '$V_F$ (simulator)')],
          rows: [
            [tr('红', 'red'), 'AlGaInP', '≈ 630–650 nm', '1.8 V'],
            [tr('黄', 'yellow'), 'AlGaInP', '≈ 590 nm', '2.0 V'],
            [tr('绿', 'green'), 'InGaN / GaP', '≈ 525–570 nm', '2.1 V'],
            [tr('蓝', 'blue'), 'InGaN', '≈ 460 nm', '3.0 V'],
            [tr('白', 'white'), tr('蓝芯片 + 荧光粉', 'blue die + phosphor'), tr('宽谱', 'broad'), '3.0 V'],
          ],
          parts: ['gap', 'gap', 'gap', 'gap', 'gap'],
        },
        formulas: [{ tex: 'V_F ≈ \\frac{E_g}{q}, λ ≈ \\frac{1240}{E_g [eV]} nm', note: tr('越蓝的光，$E_g$ 越大，$V_F$ 越高', 'bluer light: bigger $E_g$, higher $V_F$') }],
      },
      {
        id: 'iv',
        short: tr('I–V 曲线', 'I–V curve'),
        title: tr('④ I–V 曲线：一个膝点，然后几乎竖直', '④ The I–V curve: a knee, then almost vertical'),
        body: tr(
          `把电压从 0 慢慢加上去，测电流，得到 LED 的 **I–V 特性曲线**。它和电阻的直线完全不同：
- [[off|膝点以下]]：电子爬不过 PN 结的势垒，电流几乎是 0，**不亮**；
- 到了 [[knee|膝点（knee）]] 附近的 **forward voltage（正向压降）$V_F$**，电流开始指数增长：电压每多 0.1 V，电流约翻 7 倍；
- 膝点以上曲线 **几乎竖直**：电压只要多零点几伏，电流就从几 mA 冲到几百 mA。

[[red|红色]] 的膝点在约 1.8–2 V，[[blue|蓝色]] 的在约 3 V，见上面的 [[colours|色表]]。

**这条曲线解释了为什么 LED 不能直接接电源**：竖直的那段意味着“电压几乎不变，电流可以任意大”。LED 自己不会限制电流，必须由外面的电阻来定（第 ⑥ 层）。

[[rev|反向]]：电流几乎为 0（nA 级），直到大约 −5 V 被击穿。

规格书上的关键数字：最大连续电流 $I_F$ ≈ 20–25 mA，反向耐压 $V_R$ ≈ 5 V。亮度大致 **和电流成正比**，5–15 mA 就足够亮。`,
          `Raise the voltage slowly from 0 and measure the current: the LED’s **I–V characteristic**. It looks nothing like a resistor’s straight line:
- [[off|below the knee]] electrons cannot climb the junction barrier, the current is almost 0, **no light**;
- near [[knee|the knee]] at the **forward voltage $V_F$** the current starts to grow exponentially: each extra 0.1 V multiplies it by about 7;
- above the knee the curve is **almost vertical**: a few tenths of a volt more and the current goes from a few mA to hundreds.

[[red|Red]] has its knee at about 1.8–2 V, [[blue|blue]] at about 3 V — see the [[colours|colour chart]] above.

**This curve is why an LED cannot go straight on a supply**: the vertical part means "voltage nearly fixed, current anything". The LED does not limit its own current; a resistor outside must set it (layer ⑥).

[[rev|Reverse]]: almost no current (nA) until breakdown at about −5 V.

Key datasheet numbers: maximum continuous current $I_F$ ≈ 20–25 mA, reverse rating $V_R$ ≈ 5 V. Brightness is roughly **proportional to current**; 5–15 mA is plenty.`,
        ),
        table: {
          head: [tr('参数', 'Parameter'), tr('典型值（5 mm）', 'Typical (5 mm)'), tr('超过会怎样', 'If exceeded')],
          rows: [
            [
              tr('正向压降 $V_F$', 'forward voltage $V_F$'),
              tr('红 1.8–2 V，蓝/白 ≈ 3 V', 'red 1.8–2 V, blue/white ≈ 3 V'),
              tr('（不是极限，是工作点）', '(not a limit, the operating point)'),
            ],
            [tr('连续电流 $I_F$', 'continuous current $I_F$'), '20–25 mA', tr('发热、变暗、寿命骤减', 'heat, dimming, short life')],
            [tr('反向电压 $V_R$', 'reverse voltage $V_R$'), '≈ 5 V', tr('反向击穿', 'reverse breakdown')],
          ],
          parts: ['knee', 'red', 'rev'],
        },
        formulas: [{ tex: 'I ≈ I_s·e^{V/(n V_T)}', note: tr('膝点附近：指数增长（$V_T$ = 26 mV，LED 的 n ≈ 2）', 'near the knee: exponential ($V_T$ = 26 mV, n ≈ 2 for an LED)') }],
        calcs: ['diode-forward'],
      },
      {
        id: 'model',
        short: tr('模型', 'Model'),
        title: tr('⑤ 模型：一个开关 + Vf + 12 Ω', '⑤ The model: a switch + Vf + 12 Ω'),
        body: tr(
          `指数曲线不好手算。工程上用 **piecewise linear（分段线性）** 模型把它换成两段直线（图里的黑线）：
- V < $V_F$：[[sw|理想开关]] 断开，I = 0；
- V ≥ $V_F$：开关闭合，LED = 一个 [[vf|电压源 $V_F$]] 串一个 [[slope|小电阻 12 Ω]]：
$$I = \\frac{V - V_F}{12 Ω}$$

本仿真器就是这样算的（红 1.8 V、黄 2.0 V、绿 2.1 V、蓝 / 白 3.0 V，都串 12 Ω）。

**带数字**：红 LED 两端 2.0 V 时，$I = \\frac{2.0 - 1.8}{12} = 16.7 mA$；两端 2.1 V 时已经 25 mA。0.1 V 之差，电流差一半——这就是“几乎竖直”。

**直接接 9 V 电池会怎样**（9 V 电池内阻约 1.5 Ω）：
$$I = \\frac{9 - 1.8}{1.5 + 12} ≈ 533 mA$$
是额定值的 25 倍。仿真器里 LED 平均电流超过 30 mA 会警告，超过 60 mA（或峰值 150 mA）就烧坏；真实的 LED 一闪就灭了。`,
          `An exponential is awkward by hand. Engineers swap it for a **piecewise linear** model of two straight lines (black in the figure):
- V < $V_F$: [[sw|an ideal switch]] is open, I = 0;
- V ≥ $V_F$: the switch closes and the LED is [[vf|a voltage source $V_F$]] in series with [[slope|a small 12 Ω resistor]]:
$$I = \\frac{V - V_F}{12 Ω}$$

The simulator works exactly like this (red 1.8 V, yellow 2.0 V, green 2.1 V, blue / white 3.0 V, each with 12 Ω).

**With numbers**: 2.0 V across a red LED gives $I = \\frac{2.0 - 1.8}{12} = 16.7 mA$; at 2.1 V it is already 25 mA. A 0.1 V difference changes the current by half — that is "almost vertical".

**Straight across a 9 V battery** (about 1.5 Ω internal resistance):
$$I = \\frac{9 - 1.8}{1.5 + 12} ≈ 533 mA$$
25 times the rating. The simulator warns when an LED averages more than 30 mA and burns it above 60 mA (or a 150 mA peak); a real LED flashes once and dies.`,
        ),
        table: {
          head: [tr('', ''), tr('真实 LED', 'Real LED'), tr('仿真器模型', 'Simulator model')],
          rows: [
            [tr('膝点以下', 'below the knee'), tr('指数，极小电流', 'exponential, tiny'), tr('0（开关断开）', '0 (switch open)')],
            [tr('膝点以上', 'above the knee'), tr('指数 + 体电阻', 'exponential + bulk R'), '(V − $V_F$) / 12 Ω'],
            [tr('温度', 'temperature'), tr('$V_F$ 约 −2 mV/°C', '$V_F$ ≈ −2 mV/°C'), tr('不考虑', 'ignored')],
            [tr('反向击穿', 'reverse breakdown'), tr('≈ −5 V', '≈ −5 V'), tr('没有（只提示反接）', 'none (flags reversed LEDs)')],
          ],
          parts: ['sw', 'slope', 'vf', null],
        },
        formulas: [{ tex: 'I = \\frac{V - V_F}{12 Ω}  (V ≥ V_F)', note: tr('红：$V_F$ = 1.8 V；蓝：3.0 V', 'red: $V_F$ = 1.8 V; blue: 3.0 V') }],
        calcs: ['diode-forward', 'ohm'],
      },
      {
        id: 'resistor',
        short: tr('限流电阻', 'Series R'),
        title: tr('⑥ 限流电阻：用 KVL 推出来', '⑥ The series resistor, derived with KVL'),
        body: tr(
          `第 1 课的电路：[[bat|9 V 电池]] → [[res|470 Ω]] → [[led|红 LED]] → 回到电池。沿回路写 **KVL（基尔霍夫电压定律）**——电源电压 = 各元件压降之和：
$$V_s = I·r_{bat} + I·R + V_F + I·12 Ω$$
解出电流：
$$I = \\frac{V_s - V_F}{r_{bat} + R + 12} = \\frac{9 - 1.8}{1.5 + 470 + 12} = \\frac{7.2}{483.5} ≈ 14.9 mA$$
- 电阻上：$V_R = 14.9 mA × 470 Ω ≈ 7.0 V$；
- LED 上：$1.8 + 14.9 mA × 12 Ω ≈ 1.98 V$；
- 电池内阻上：$≈ 0.02 V$。加起来 9 V ✔。

**设计时反过来用**（忽略 12 Ω 和内阻就够了）：
$$R = \\frac{V_s - V_F}{I}$$
9 V、红 LED、15 mA：$R = \\frac{9 - 1.8}{0.015} = 480 Ω$ → 选标准值 470 Ω。

**图解：负载线（load line）**。电阻和电池这一侧要求 $I = \\frac{9 - V}{471.5 Ω}$，是一条 [[loadline|斜直线]]；LED 要求 I 落在 [[led|它的曲线]] 上。两者同时满足的点就是 [[op|工作点]]。电阻越大，负载线越平，交点电流越小。`,
          `The lesson 1 circuit: [[bat|9 V battery]] → [[res|470 Ω]] → [[led|red LED]] → back to the battery. Write **KVL** round the loop — the supply equals the sum of the drops:
$$V_s = I·r_{bat} + I·R + V_F + I·12 Ω$$
Solve for the current:
$$I = \\frac{V_s - V_F}{r_{bat} + R + 12} = \\frac{9 - 1.8}{1.5 + 470 + 12} = \\frac{7.2}{483.5} ≈ 14.9 mA$$
- across the resistor: $V_R = 14.9 mA × 470 Ω ≈ 7.0 V$;
- across the LED: $1.8 + 14.9 mA × 12 Ω ≈ 1.98 V$;
- across the battery’s internal resistance: $≈ 0.02 V$. Total 9 V ✔.

**For design, turn it round** (dropping the 12 Ω and internal resistance is fine):
$$R = \\frac{V_s - V_F}{I}$$
9 V, red LED, 15 mA: $R = \\frac{9 - 1.8}{0.015} = 480 Ω$ → standard value 470 Ω.

**Graphically: the load line.** The battery-and-resistor side demands $I = \\frac{9 - V}{471.5 Ω}$, a [[loadline|sloping straight line]]; the LED demands that I lies on [[led|its curve]]. The point that satisfies both is the [[op|operating point]]. A larger resistor gives a flatter line and a smaller current.`,
        ),
        table: {
          head: [tr('电路', 'Circuit'), tr('计算', 'Calculation'), 'I'],
          rows: [
            [tr('第 1 课：9 V、470 Ω、红', 'lesson 1: 9 V, 470 Ω, red'), '(9 − 1.8) / (1.5 + 470 + 12)', '14.9 mA'],
            [tr('第 3 课：5 V、150 Ω、绿', 'lesson 3: 5 V, 150 Ω, green'), '(5 − 2.1) / (150 + 12)', '17.9 mA'],
            [tr('蓝 LED：5 V、100 Ω', 'blue LED: 5 V, 100 Ω'), '(5 − 3.0) / (100 + 12)', '17.9 mA'],
            [tr('两颗串联：9 V、220 Ω、红 + 绿', 'two in series: 9 V, 220 Ω, red + green'), '(9 − 1.8 − 2.1) / (220 + 24)', '20.9 mA'],
            [tr('纽扣电池：3 V、47 Ω、红', 'coin cell: 3 V, 47 Ω, red'), '(3 − 1.8) / (15 + 47 + 12)', '16 mA'],
          ],
          parts: ['op', 'op', 'op', 'op', 'op'],
        },
        formulas: [
          { tex: 'R = \\frac{V_s - V_F}{I}', note: tr('设计用：选稍大的标准值', 'for design: round up to a standard value') },
          { tex: 'I = \\frac{V_s - V_F}{r_{bat} + R + 12 Ω}', note: tr('校核用：仿真器算出的电流', 'for checking: what the simulator will show') },
        ],
        calcs: ['led-resistor', 'ohm', 'power'],
      },
      {
        id: 'parallel',
        short: tr('并联', 'Parallel'),
        title: tr('⑦ 为什么并联的 LED 要各配一个电阻', '⑦ Why parallel LEDs each need their own resistor'),
        body: tr(
          `想省一个电阻：5 V → [[bad|一个 150 Ω]] → 红、绿两颗 LED 并联 → GND。会怎样？

并联的两颗 LED 两端电压 **必须相同**。设只有红灯导通：
$$I = \\frac{5 - 1.8}{150 + 12} = 19.8 mA,   V_{node} = 1.8 + 0.0198 × 12 = 2.04 V$$
[[node|结点电压 2.04 V]] 比绿灯的 $V_F = 2.1 V$ 还低，绿灯 **根本到不了膝点**：电流 0，不亮。$V_F$ 最低的那颗把电压“钳住”，所有电流都挤进它——两颗同色的 LED 也一样，$V_F$ 差几十 mV（生产误差），电流就会差一倍以上，而且越热 $V_F$ 越低、电流越大（**thermal runaway 热失控**）。

[[good|正确做法]]（第 6 课）：每颗 LED 串自己的电阻，再把这些“电阻 + LED”支路并联。每条支路自己用 KVL：
- 红：$\\frac{5 - 1.8}{150 + 12} = 19.8 mA$
- 绿：$\\frac{5 - 2.1}{150 + 12} = 17.9 mA$

电阻上的压降（约 3 V）远大于 $V_F$ 的差异（零点几伏），所以每条支路的电流 **由自己的电阻决定**，两颗都亮，互不干扰。

**串联** 就没有这个问题：串联电流处处相等，只要电源电压够（9 V > 1.8 + 2.1 V），一个电阻就够了。`,
          `Trying to save a resistor: 5 V → [[bad|one 150 Ω]] → red and green LEDs in parallel → GND. What happens?

Two LEDs in parallel **must have the same voltage**. Suppose only the red one conducts:
$$I = \\frac{5 - 1.8}{150 + 12} = 19.8 mA,   V_{node} = 1.8 + 0.0198 × 12 = 2.04 V$$
[[node|The node at 2.04 V]] is below the green LED’s $V_F = 2.1 V$, so green **never reaches its knee**: zero current, dark. The LED with the lowest $V_F$ clamps the voltage and takes all the current — even two LEDs of the same colour differ by tens of mV (manufacturing spread), enough to make one carry twice the current, and since $V_F$ drops as it warms the hot one takes even more (**thermal runaway**).

[[good|The right way]] (lesson 6): give each LED its own resistor, then put those "resistor + LED" branches in parallel. Each branch gets its own KVL:
- red: $\\frac{5 - 1.8}{150 + 12} = 19.8 mA$
- green: $\\frac{5 - 2.1}{150 + 12} = 17.9 mA$

The drop across each resistor (about 3 V) is much larger than the $V_F$ differences (tenths of a volt), so each branch’s current is **set by its own resistor**: both light, independently.

**Series** has no such problem: the current is the same everywhere, so as long as the supply is high enough (9 V > 1.8 + 2.1 V) one resistor is enough.`,
        ),
        formulas: [{ tex: 'I_k = \\frac{V_s - V_{F,k}}{R_k + 12 Ω}', note: tr('每条支路各算各的', 'each branch on its own') }],
        calcs: ['led-resistor', 'current-divider'],
      },
    ],
    recap: tr(
      'LED = 环氧透镜里的一粒 PN 结芯片：电子掉进空穴放出光子，颜色由禁带宽度决定，**$V_F$ ≈ $E_g$/q**（红 ≈ 1.8–2 V，蓝 ≈ 3 V）。I–V 曲线在 $V_F$ 之后几乎竖直，所以 LED 必须串电阻：$R = \\frac{V_s - V_F}{I}$。仿真器把它当成“开关 + $V_F$ + 12 Ω”。并联 LED 要各配一个电阻。',
      'An LED is a PN-junction chip in an epoxy lens: electrons drop into holes and give off photons whose colour is set by the band gap, **$V_F$ ≈ $E_g$/q** (red ≈ 1.8–2 V, blue ≈ 3 V). The I–V curve is almost vertical past $V_F$, so an LED needs a series resistor: $R = \\frac{V_s - V_F}{I}$. The simulator treats it as "switch + $V_F$ + 12 Ω". Parallel LEDs each need their own resistor.',
    ),
  };
}
