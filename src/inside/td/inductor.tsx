// Teardown: the inductor. Outside (colour-band and drum-core inductors) → X-ray (copper winding on
// a ferrite core) → the magnetic field and L = NΦ/I = μN²A/l with numbers → v = L di/dt and the
// energy ½LI² → why switching an inductor off makes a voltage spike (relay coil numbers) → RL
// step response (τ = L/R, the square-wave lab) → reactance X_L = 2πfL → the real inductor:
// winding resistance (simulator 1 Ω), saturation, self-resonance.

import './passives.css';
import { tr } from '../../core/i18n';
import { sub } from '../TeardownView';
import type { Teardown } from '../types';

const show = (c: boolean) => (c ? 'td-show' : 'td-hide');

function Zig({ x1, y1, x2, y2, part, body = 44 }: { x1: number; y1: number; x2: number; y2: number; part?: string; body?: number }) {
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

/** coil symbol (bumps) from (x, y) to the right, n bumps of radius r */
function CoilH({ x, y, n = 4, r = 9, part }: { x: number; y: number; n?: number; r?: number; part?: string }) {
  let d = `M${x} ${y}`;
  for (let k = 0; k < n; k++) d += ` a${r} ${r} 0 0 1 ${2 * r} 0`;
  return <path d={d} className="pv-wire" data-part={part} />;
}
/** vertical coil from (x, y) downwards */
function CoilV({ x, y, n = 4, r = 9, part }: { x: number; y: number; n?: number; r?: number; part?: string }) {
  let d = `M${x} ${y}`;
  for (let k = 0; k < n; k++) d += ` a${r} ${r} 0 0 1 0 ${2 * r}`;
  return <path d={d} className="pv-wire" data-part={part} />;
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

/* ------------------------------------------------------------------ layers 0–1: the part */

function Part({ layer }: { layer: number }) {
  const xray = layer === 1;
  return (
    <g className={show(layer <= 1)}>
      {/* axial colour-band inductor (top) */}
      <g data-part="axial">
        <line x1={30} y1={110} x2={530} y2={110} stroke="#9aa0a6" strokeWidth={4} strokeLinecap="round" />
        <g className={show(xray)}>
          <rect x={170} y={96} width={220} height={28} rx={4} fill="#4a4a4a" data-part="core" />
          {Array.from({ length: 22 }, (_, k) => (
            <ellipse key={k} cx={180 + k * 9.5} cy={110} rx={4} ry={22} fill="none" stroke="#c87533" strokeWidth={3} data-part="winding" />
          ))}
        </g>
        <g style={{ opacity: xray ? 0.15 : 1, transition: 'opacity .45s' }}>
          <rect x={150} y={78} width={260} height={64} rx={30} fill="#5aa469" stroke="#2f6e3d" strokeWidth={1.8} />
          {['#7b4a24', '#1b1b1b', '#f08a24', '#c0c0c0'].map((c, i) => (
            <rect key={i} x={[196, 230, 264, 360][i]} y={78} width={18} height={64} fill={c} data-part="bands" />
          ))}
        </g>
        <text x={280} y={166} textAnchor="middle" className="pv-lbl">
          {tr('色环电感 10 mH（棕黑橙 = 10 × 10³ µH）', 'colour-band inductor 10 mH (brown black orange = 10 × 10³ µH)')}
        </text>
      </g>
      {/* drum core (bottom) */}
      <g data-part="drum">
        <rect x={255} y={370} width={7} height={60} fill="#c9ccd1" stroke="#7d8088" />
        <rect x={298} y={370} width={7} height={60} fill="#c9ccd1" stroke="#7d8088" />
        <rect x={200} y={200} width={160} height={22} rx={4} fill="#3d3d3d" data-part="core" />
        <rect x={200} y={348} width={160} height={22} rx={4} fill="#3d3d3d" data-part="core" />
        <rect x={250} y={222} width={60} height={126} fill="#3d3d3d" data-part="core" />
        <g data-part="winding">
          {Array.from({ length: 12 }, (_, k) => (
            <rect key={k} x={218} y={226 + k * 10} width={124} height={9} rx={4.5} fill="#c87533" stroke="#8a4a1a" strokeWidth={0.8} style={{ opacity: xray ? 0.35 : 1 }} />
          ))}
        </g>
        <text x={420} y={290} className="pv-lbl">
          {tr('工字电感', 'drum-core')}
        </text>
        <text x={420} y={308} className="td-small">
          {tr('（铁氧体 + 铜线）', '(ferrite + copper)')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 2: field */

function Field({ layer }: { layer: number }) {
  const turns = 7;
  return (
    <g className={show(layer === 2)}>
      {/* field lines */}
      <g data-part="flux">
        {[40, 70, 100].map((h, i) => (
          <g key={h}>
            <path
              d={`M140 ${200 - 12 + i * 8} C 60 ${200 - h - 40}, 500 ${200 - h - 40}, 420 ${200 - 12 + i * 8}`}
              fill="none"
              stroke="#7a3fc0"
              strokeWidth={1.4}
              strokeDasharray="6 4"
            />
            <path
              d={`M140 ${200 + 12 - i * 8} C 60 ${200 + h + 40}, 500 ${200 + h + 40}, 420 ${200 + 12 - i * 8}`}
              fill="none"
              stroke="#7a3fc0"
              strokeWidth={1.4}
              strokeDasharray="6 4"
            />
          </g>
        ))}
        <path d="M150 200 L420 200" stroke="#7a3fc0" strokeWidth={3} markerEnd="url(#ind-ahv)" />
        <text x={470} y={196} className="pv-lbl pv-violet">
          B, Φ
        </text>
      </g>
      <rect x={150} y={182} width={260} height={36} rx={4} fill="#4a4a4a" fillOpacity={0.6} data-part="core" />
      <g data-part="winding">
        {Array.from({ length: turns }, (_, k) => (
          <ellipse key={k} cx={175 + k * 35} cy={200} rx={10} ry={40} fill="none" stroke="#c87533" strokeWidth={4} />
        ))}
        <path d="M175 240 L175 300 L120 300" stroke="#c87533" strokeWidth={4} fill="none" />
        <path d="M385 240 L385 300 L440 300" stroke="#c87533" strokeWidth={4} fill="none" />
      </g>
      <path d="M100 300 L60 300" stroke="#e63946" strokeWidth={2.4} markerStart="url(#ind-ahr)" data-part="i" />
      <text x={64} y={290} className="pv-lbl pv-red" data-part="i">
        i
      </text>
      <path d="M135 154 L135 246" className="pv-thin" markerStart="url(#ind-ah)" markerEnd="url(#ind-ah)" data-part="area" />
      <text x={128} y={160} textAnchor="end" className="pv-lbl" data-part="area">
        A
      </text>
      <path d="M165 322 L395 322" className="pv-thin" markerStart="url(#ind-ah)" markerEnd="url(#ind-ah)" data-part="len" />
      <text x={280} y={340} textAnchor="middle" className="pv-lbl" data-part="len">
        {tr('长度 l，N 匝', 'length l, N turns')}
      </text>
      <text x={280} y={372} textAnchor="middle" className="pv-eq">
        {tr('L = N·Φ / i = μ·N²·A / l', 'L = N·Φ / i = μ·N²·A / l')}
      </text>
      <text x={280} y={396} textAnchor="middle" className="td-small">
        {sub('μ = μ_r·μ_0,  μ_0 = 4π × 10⁻⁷ H/m')}
      </text>
      <text x={280} y={418} textAnchor="middle" className="td-small">
        {sub(tr('N = 250，A = 20 mm²，l = 15 mm，μ_r ≈ 100 → L ≈ 10 mH', 'N = 250, A = 20 mm², l = 15 mm, μ_r ≈ 100 → L ≈ 10 mH'))}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 3: v = L di/dt */

function Didt({ layer }: { layer: number }) {
  const T = (ms: number) => 90 + ms * 70;
  const I = (ma: number) => 190 - ma * 10;
  const V = (v: number) => 320 - v * 80;
  return (
    <g className={show(layer === 3)}>
      <text x={280} y={42} textAnchor="middle" className="pv-lbl">
        {tr('10 mH：电流怎么变 → 电压就是多少', '10 mH: how the current moves sets the voltage')}
      </text>
      <line x1={T(0)} y1={I(0)} x2={T(6.2)} y2={I(0)} className="pv-axis" markerEnd="url(#ind-ah)" />
      <line x1={T(0)} y1={I(0)} x2={T(0)} y2={I(12)} className="pv-axis" markerEnd="url(#ind-ah)" />
      <text x={T(0) - 8} y={I(11.5)} textAnchor="end" className="pv-lbl pv-red">
        i / mA
      </text>
      <text x={T(0) - 8} y={I(10) + 4} textAnchor="end" className="td-small">
        10
      </text>
      <polyline points={`${T(0)},${I(0)} ${T(1)},${I(0)} ${T(2)},${I(10)} ${T(4)},${I(10)} ${T(4.1)},${I(0)} ${T(6)},${I(0)}`} className="pv-curve" data-part="i" />
      <line x1={T(0)} y1={V(0)} x2={T(6.2)} y2={V(0)} className="pv-axis" markerEnd="url(#ind-ah)" />
      <line x1={T(0)} y1={V(-1.15)} x2={T(0)} y2={V(0.5)} className="pv-axis" markerEnd="url(#ind-ah)" />
      <text x={T(0) - 8} y={V(0.4)} textAnchor="end" className="pv-lbl pv-blue">
        v / V
      </text>
      <text x={T(0) - 8} y={V(-1) + 4} textAnchor="end" className="td-small">
        −1
      </text>
      <polyline
        points={`${T(0)},${V(0)} ${T(1)},${V(0)} ${T(1)},${V(0.1)} ${T(2)},${V(0.1)} ${T(2)},${V(0)} ${T(4)},${V(0)} ${T(4)},${V(-1)} ${T(4.1)},${V(-1)} ${T(4.1)},${V(0)} ${T(6)},${V(0)}`}
        className="pv-curve blue"
        data-part="u"
      />
      {[1, 2, 4].map((t) => (
        <line key={t} x1={T(t)} y1={I(11)} x2={T(t)} y2={V(-1.1)} className="pv-dash" />
      ))}
      <text x={T(1.5)} y={V(0.1) - 10} textAnchor="middle" className="pv-lbl pv-blue" data-part="u">
        +0.1 V
      </text>
      <text x={T(3)} y={I(10) - 8} textAnchor="middle" className="td-small" data-part="flat">
        {tr('i 不变', 'i constant')}
      </text>
      <text x={T(3)} y={V(0) - 8} textAnchor="middle" className="pv-lbl" data-part="flat">
        v = 0
      </text>
      <text x={T(4.3)} y={V(-1) + 4} className="pv-lbl pv-blue" data-part="u">
        {tr('−1 V（0.1 ms 内降到 0）', '−1 V (down to 0 in 0.1 ms)')}
      </text>
      <text x={T(6.2)} y={V(0) + 18} textAnchor="end" className="td-small">
        t / ms
      </text>
      <text x={280} y={420} textAnchor="middle" className="pv-eq">
        v = L·di/dt = 10 mH × 10 mA / 1 ms = 0.1 V
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 4: turn-off spike */

function Spike({ layer }: { layer: number }) {
  return (
    <g className={show(layer === 4)}>
      {/* circuit */}
      <text x={110} y={46} textAnchor="middle" className="pv-lbl pv-red">
        +5 V
      </text>
      <line x1={110} y1={54} x2={110} y2={80} className="pv-wire" />
      <CoilV x={110} y={80} n={5} part="coil" />
      <Zig x1={110} y1={170} x2={110} y2={220} body={30} part="rw" />
      <text x={90} y={130} textAnchor="end" className="pv-lbl" data-part="coil">
        150 mH
      </text>
      <text x={90} y={200} textAnchor="end" className="td-small" data-part="rw">
        70 Ω
      </text>
      <line x1={110} y1={220} x2={110} y2={250} className="pv-wire" />
      <circle cx={110} cy={250} r={3.5} className="pv-dot" />
      <text x={118} y={268} className="pv-lbl pv-blue" data-part="node">
        {sub('V_C')}
      </text>
      <g data-part="switch">
        <line x1={110} y1={250} x2={110} y2={290} className="pv-wire" />
        <line x1={110} y1={290} x2={136} y2={318} className="pv-wire" />
        <circle cx={110} cy={290} r={3} className="pv-dot" />
        <circle cx={110} cy={326} r={3} className="pv-dot" />
        <text x={142} y={310} className="td-small">
          {tr('开关断开', 'switch opens')}
        </text>
      </g>
      <line x1={110} y1={326} x2={110} y2={346} className="pv-wire" />
      <Gnd x={110} y={346} />
      <g data-part="diode">
        <path d="M110 64 L180 64 L180 140" className="pv-wire" strokeDasharray="5 4" />
        <polygon points="168,170 192,170 180,152" fill="#ffe7a8" stroke="var(--ink)" strokeWidth={1.6} />
        <line x1={168} y1={152} x2={192} y2={152} className="pv-wire" />
        <path d="M180 170 L180 240 L110 240" className="pv-wire" strokeDasharray="5 4" />
        <text x={180} y={190} textAnchor="middle" className="td-small">
          {tr('续流二极管', 'flyback diode')}
        </text>
      </g>
      {/* waveform */}
      <rect x={262} y={60} width={278} height={300} rx={12} className="td-panel" />
      <line x1={280} y1={320} x2={520} y2={320} className="pv-axis" markerEnd="url(#ind-ah)" />
      <line x1={280} y1={330} x2={280} y2={80} className="pv-axis" markerEnd="url(#ind-ah)" />
      <text x={286} y={92} className="pv-lbl pv-blue">
        {sub('V_C / V')}
      </text>
      <line x1={280} y1={300} x2={510} y2={300} className="pv-dash" />
      <text x={276} y={304} textAnchor="end" className="pv-tiny">
        5
      </text>
      <text x={276} y={124} textAnchor="end" className="pv-tiny">
        29
      </text>
      <polyline points="280,316 360,316 361,120 366,290 372,300 510,300" className="pv-curve" data-part="nodiode" />
      <polyline points="280,316 360,316 361,294 420,296 470,300 510,300" className="pv-curve green" data-part="diode" />
      <text x={370} y={124} className="pv-lbl pv-red" data-part="nodiode">
        {tr('无二极管：≈ 29 V', 'no diode: ≈ 29 V')}
      </text>
      <text x={400} y={286} className="pv-lbl pv-green" data-part="diode">
        {tr('有二极管：5.7 V', 'with diode: 5.7 V')}
      </text>
      <text x={360} y={338} textAnchor="middle" className="pv-tiny">
        {tr('断开', 'off')}
      </text>
      <text x={280} y={400} textAnchor="middle" className="pv-eq">
        {tr('v = L·di/dt = 150 mH × 71 mA / 1 µs ≈ 10 kV', 'v = L·di/dt = 150 mH × 71 mA / 1 µs ≈ 10 kV')}
      </text>
      <text x={280} y={422} textAnchor="middle" className="td-small">
        {tr('（理论值；实际被三极管击穿或续流二极管限住）', '(in theory; in practice limited by breakdown or the flyback diode)')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 5: RL step */

function Step({ layer }: { layer: number }) {
  const T = (tau: number) => 90 + tau * 80;
  const Ii = (ma: number) => 330 - ma * 12; // i: −6.6 … 6.6 mA around y 330
  const Uu = (v: number) => 330 - v * 70;
  const ipts = Array.from({ length: 61 }, (_, k) => {
    const t = (k / 60) * 5.2;
    return `${T(t)},${Ii(-6.6 + 13.2 * (1 - Math.exp(-t)))}`;
  }).join(' ');
  const upts = Array.from({ length: 61 }, (_, k) => {
    const t = (k / 60) * 5.2;
    return `${T(t)},${Uu(2 * Math.exp(-t))}`;
  }).join(' ');
  return (
    <g className={show(layer === 5)}>
      {/* circuit */}
      <circle cx={60} cy={84} r={16} className="pv-term" data-part="src" />
      <path d="M52 90 L52 78 L60 78 L60 90 L68 90 L68 78" fill="none" stroke="var(--ink)" strokeWidth={1.4} />
      <path d="M60 68 L60 46 L100 46" className="pv-wire" />
      <Zig x1={100} y1={46} x2={180} y2={46} part="r" body={40} />
      <text x={140} y={30} textAnchor="middle" className="pv-lbl" data-part="r">
        100 Ω
      </text>
      <path d="M180 46 L230 46 L230 56" className="pv-wire" />
      <CoilV x={230} y={56} n={3} r={8} part="l" />
      <text x={248} y={84} className="pv-lbl" data-part="l">
        10 mH (1 Ω)
      </text>
      <path d="M230 104 L230 116 L60 116 L60 100" className="pv-wire" />
      <circle cx={230} cy={46} r={3.5} className="pv-dot" />
      <text x={238} y={40} className="pv-lbl pv-blue">
        {sub('v_L')}
      </text>
      <text x={340} y={40} className="td-small">
        {tr('方波 ±1 V（每次跳 2 V）', 'square wave ±1 V (2 V jumps)')}
      </text>
      <text x={340} y={60} className="pv-lbl">
        {sub('R_tot = 100 + 50 + 1 = 151 Ω')}
      </text>
      <text x={340} y={80} className="pv-lbl">
        τ = 10 mH / 151 Ω ≈ 66 µs
      </text>
      {/* graph */}
      <line x1={T(0)} y1={330} x2={T(5.5)} y2={330} className="pv-axis" markerEnd="url(#ind-ah)" />
      <line x1={T(0)} y1={Ii(-7.5)} x2={T(0)} y2={Uu(2.3)} className="pv-axis" markerEnd="url(#ind-ah)" />
      {[1, 2, 3, 4, 5].map((t) => (
        <text key={t} x={T(t)} y={346} textAnchor="middle" className="td-small">
          {t}τ
        </text>
      ))}
      <line x1={T(0)} y1={Ii(6.6)} x2={T(5.3)} y2={Ii(6.6)} className="pv-dash" />
      <line x1={T(0)} y1={Ii(-6.6)} x2={T(5.3)} y2={Ii(-6.6)} className="pv-dash" />
      <text x={T(5.3)} y={Ii(6.6) + 16} textAnchor="end" className="pv-lbl pv-red">
        +6.6 mA
      </text>
      <text x={T(0) + 6} y={Ii(-6.6) + 16} className="pv-lbl pv-red">
        −6.6 mA
      </text>
      <polyline points={ipts} className="pv-curve" data-part="i" />
      <polyline points={upts} className="pv-curve blue" data-part="ul" />
      <circle cx={T(0)} cy={Uu(2)} r={4.5} fill="#2b59c3" />
      <text x={T(0) + 10} y={Uu(2) + 4} className="pv-lbl pv-blue" data-part="ul">
        {sub(tr('v_L 跳到 ≈ 2 V（电压可以跳）', 'v_L jumps to ≈ 2 V (voltage can jump)'))}
      </text>
      <text x={T(1.6)} y={Ii(-3.6)} className="pv-lbl pv-red" data-part="i">
        {tr('i 连续变化（不能跳）', 'i changes smoothly (cannot jump)')}
      </text>
      <circle cx={T(1)} cy={Ii(-6.6 + 13.2 * 0.632)} r={4.5} fill="#e63946" data-part="tau" />
      <text x={T(1) + 8} y={Ii(-6.6 + 13.2 * 0.632) + 18} className="td-small" data-part="tau">
        63%
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 6: reactance */

function Reactance({ layer }: { layer: number }) {
  const F = (f: number) => 100 + (Math.log10(f) - 1) * 80;
  const X = (x: number) => 380 - (Math.log10(x) + 1) * 46; // 0.1 Ω … 100 kΩ
  const xl = (f: number) => 2 * Math.PI * f * 0.01;
  const pts: [number, string, string][] = [
    [160, '160 Hz', '10 Ω'],
    [1600, '1.6 kHz', '100 Ω'],
    [16000, '16 kHz', '1 kΩ'],
  ];
  return (
    <g className={show(layer === 6)}>
      {[0, 1, 2, 3, 4, 5].map((d) => (
        <g key={d}>
          <line x1={F(10)} y1={X(10 ** d)} x2={F(1e6)} y2={X(10 ** d)} className="pv-grid" />
          <text x={F(10) - 8} y={X(10 ** d) + 4} textAnchor="end" className="td-small">
            {['1', '10', '100', '1k', '10k', '100k'][d]}
          </text>
        </g>
      ))}
      {[1, 2, 3, 4, 5, 6].map((d) => (
        <g key={d}>
          <line x1={F(10 ** d)} y1={X(0.1)} x2={F(10 ** d)} y2={X(1e5)} className="pv-grid" />
          <text x={F(10 ** d)} y={X(0.1) + 16} textAnchor="middle" className="td-small">
            {['10', '100', '1k', '10k', '100k', '1M'][d - 1]}
          </text>
        </g>
      ))}
      <line x1={F(10)} y1={X(0.1)} x2={F(1e6) + 14} y2={X(0.1)} className="pv-axis" markerEnd="url(#ind-ah)" />
      <line x1={F(10)} y1={X(0.1)} x2={F(10)} y2={X(1e5) - 14} className="pv-axis" markerEnd="url(#ind-ah)" />
      <text x={F(1e6) + 14} y={X(0.1) + 32} textAnchor="end" className="pv-lbl">
        f / Hz
      </text>
      <text x={F(10) + 8} y={X(1e5) - 4} className="pv-lbl pv-orange">
        {sub('X_L / Ω  (L = 10 mH)')}
      </text>
      <line x1={F(10)} y1={X(xl(10))} x2={F(1e6)} y2={X(xl(1e6))} stroke="#f08a24" strokeWidth={3} data-part="xl" />
      <line x1={F(10)} y1={X(1)} x2={F(1e6)} y2={X(1)} stroke="#2b59c3" strokeWidth={2} strokeDasharray="6 4" data-part="rw" />
      <text x={F(1e6)} y={X(1) + 18} textAnchor="end" className="pv-lbl pv-blue" data-part="rw">
        {tr('线圈电阻 1 Ω（仿真器）', 'winding 1 Ω (simulator)')}
      </text>
      {pts.map(([f, fl, x]) => (
        <g key={f} data-part="pts">
          <circle cx={F(f)} cy={X(xl(f))} r={5} fill="#f08a24" />
          <text x={F(f) - 8} y={X(xl(f)) - 8} textAnchor="end" className="pv-lbl pv-orange">
            {`${fl}: ${x}`}
          </text>
        </g>
      ))}
      <g data-part="dc">
        <rect x={100} y={404} width={150} height={30} rx={8} className="td-panel" />
        <text x={175} y={424} textAnchor="middle" className="pv-lbl">
          {tr('直流：短路（导线）', 'DC: a short (wire)')}
        </text>
      </g>
      <g data-part="hf">
        <rect x={350} y={404} width={170} height={30} rx={8} className="td-panel" />
        <text x={435} y={424} textAnchor="middle" className="pv-lbl">
          {tr('高频：接近断路', 'high f: nearly open')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 7: real inductor */

function Real({ layer }: { layer: number }) {
  return (
    <g className={show(layer === 7)}>
      <text x={280} y={42} textAnchor="middle" className="pv-lbl">
        {tr('真实电感的等效电路', 'equivalent circuit of a real inductor')}
      </text>
      <circle cx={60} cy={130} r={4} className="pv-term" />
      <line x1={64} y1={130} x2={110} y2={130} className="pv-wire" />
      <circle cx={110} cy={130} r={3.5} className="pv-dot" />
      <CoilH x={140} y={130} n={4} part="lideal" />
      <line x1={110} y1={130} x2={140} y2={130} className="pv-wire" />
      <line x1={212} y1={130} x2={250} y2={130} className="pv-wire" />
      <Zig x1={250} y1={130} x2={340} y2={130} part="rw" body={40} />
      <line x1={340} y1={130} x2={450} y2={130} className="pv-wire" />
      <circle cx={450} cy={130} r={3.5} className="pv-dot" />
      <line x1={450} y1={130} x2={496} y2={130} className="pv-wire" />
      <circle cx={500} cy={130} r={4} className="pv-term" />
      <g data-part="cpar">
        <path d="M110 130 L110 80 L270 80 M290 80 L450 80 L450 130" className="pv-wire" />
        <line x1={270} y1={66} x2={270} y2={94} className="pv-wire" style={{ strokeWidth: 3 }} />
        <line x1={290} y1={66} x2={290} y2={94} className="pv-wire" style={{ strokeWidth: 3 }} />
        <text x={280} y={60} textAnchor="middle" className="pv-lbl pv-violet">
          {sub(tr('匝间电容 C_p ≈ 10–50 pF', 'winding capacitance C_p ≈ 10–50 pF'))}
        </text>
      </g>
      <text x={176} y={162} textAnchor="middle" className="pv-lbl" data-part="lideal">
        L
      </text>
      <text x={295} y={162} textAnchor="middle" className="pv-lbl pv-red" data-part="rw">
        {sub(tr('线圈电阻 R_w', 'winding R_w'))}
      </text>
      <text x={295} y={180} textAnchor="middle" className="pv-tiny" data-part="rw">
        {tr('仿真 1 Ω，真实 10–30 Ω', 'sim 1 Ω, real 10–30 Ω')}
      </text>
      {/* saturation */}
      <g data-part="sat">
        <rect x={40} y={210} width={240} height={212} rx={12} className="td-panel" />
        <text x={160} y={234} textAnchor="middle" className="pv-lbl">
          {tr('磁芯饱和', 'core saturation')}
        </text>
        <line x1={70} y1={390} x2={260} y2={390} className="pv-axis" />
        <line x1={70} y1={390} x2={70} y2={250} className="pv-axis" />
        <path d="M70 270 L170 272 C 200 276, 210 330, 250 370" className="pv-curve violet" />
        <text x={64} y={274} textAnchor="end" className="pv-tiny">
          L
        </text>
        <line x1={185} y1={390} x2={185} y2={280} className="pv-dash" />
        <text x={185} y={406} textAnchor="middle" className="pv-tiny">
          {sub('I_sat')}
        </text>
        <text x={250} y={406} textAnchor="end" className="pv-tiny">
          i
        </text>
      </g>
      {/* self resonance */}
      <g data-part="srf">
        <rect x={290} y={210} width={240} height={212} rx={12} className="td-panel" />
        <text x={410} y={234} textAnchor="middle" className="pv-lbl">
          {tr('自谐振', 'self-resonance')}
        </text>
        <line x1={320} y1={390} x2={510} y2={390} className="pv-axis" />
        <line x1={320} y1={390} x2={320} y2={250} className="pv-axis" />
        <path d="M320 380 L420 300 C 430 290, 434 262, 440 262 C 446 262, 450 290, 460 300 L510 340" className="pv-curve" style={{ stroke: '#f08a24' }} />
        <text x={316} y={258} textAnchor="end" className="pv-tiny">
          |Z|
        </text>
        <line x1={440} y1={390} x2={440} y2={262} className="pv-dash" />
        <text x={440} y={406} textAnchor="middle" className="pv-tiny">
          {sub('f_SRF')}
        </text>
        <text x={366} y={316} textAnchor="middle" className="pv-tiny">
          {tr('像电感', 'inductive')}
        </text>
        <text x={500} y={290} textAnchor="middle" className="pv-tiny">
          {tr('像电容', 'capacitive')}
        </text>
      </g>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="ind-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pv-ah" />
        </marker>
        <marker id="ind-ahr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#e63946" />
        </marker>
        <marker id="ind-ahv" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#7a3fc0" />
        </marker>
      </defs>
      <Part layer={layer} />
      <Field layer={layer} />
      <Didt layer={layer} />
      <Spike layer={layer} />
      <Step layer={layer} />
      <Reactance layer={layer} />
      <Real layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'inductor',
    title: tr('电感 Inductor：一卷导线，抗拒电流变化', 'The inductor: a coil of wire that resists change in current'),
    subtitle: tr(
      '电感是电容的“对偶”：电容存电场能、电压不能跳；电感存磁场能、电流不能跳。拆开是绕在磁芯上的一卷铜线；由此推出 L = μN²A/l、v = L di/dt、W = ½LI²，再看关断时的高压尖峰、RL 的时间常数 τ = L/R 和感抗 2πfL。',
      'An inductor is the capacitor’s dual: a capacitor stores field energy and its voltage cannot jump; an inductor stores magnetic energy and its current cannot jump. Inside is a coil of copper on a magnetic core; from it come L = μN²A/l, v = L di/dt and W = ½LI², then the turn-off spike, the RL time constant τ = L/R and the reactance 2πfL.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'outside',
        short: tr('外形', 'Outside'),
        title: tr('① 外形：像电阻的色环电感、工字电感', '① Outside: resistor-like colour bands, and the drum core'),
        body: tr(
          `课程里的电感有两种常见外形：
- [[axial|色环电感 axial inductor]]：长得像一个胖电阻（常是绿色身体），也用色环标值，但单位是 **µH**：[[bands|棕 黑 橙]] = 10 × 10³ µH = **10 mH**（RL、RLC 实验用的就是这个值）。别把它当成电阻插错！用万用表一量就知道：电阻是 10 kΩ，电感只有几 Ω 到几十 Ω。
- [[drum|工字电感 drum-core inductor]]：一个“工”字形的黑色铁氧体磁芯，上面绕着一层层铜漆包线，两只脚朝下。

**inductance（电感）L** 的单位是亨利 H。常用 mH（10⁻³）、µH（10⁻⁶）。电感 **没有极性**，两只脚可以互换。

课程里会遇到的电感：`,
          `The inductors in this course come in two common shapes:
- [[axial|axial (colour-band) inductor]]: looks like a fat resistor (often a green body) and uses colour bands too, but in **µH**: [[bands|brown black orange]] = 10 × 10³ µH = **10 mH** (the value in the RL and RLC labs). Do not mistake it for a resistor! A multimeter tells at once: the resistor reads 10 kΩ, the inductor only a few to tens of ohms.
- [[drum|drum-core inductor]]: a black ferrite core shaped like a spool, wound with layers of enamelled copper wire, legs pointing down.

**Inductance L** is measured in henries (H); mH (10⁻³) and µH (10⁻⁶) are common. An inductor has **no polarity**; the legs are interchangeable.

The inductors you will meet:`,
        ),
        table: {
          head: [tr('在哪', 'Where'), 'L', tr('线圈电阻', 'Winding R'), tr('用途', 'Purpose')],
          rows: [
            [tr('RL / RLC 实验', 'RL / RLC labs'), '10 mH', tr('仿真 1 Ω（真实 10–30 Ω）', 'sim 1 Ω (real 10–30 Ω)'), tr('看 τ = L/R、振铃、相量', 'τ = L/R, ringing, phasors')],
            [tr('继电器线圈', 'relay coil'), '150 mH', '70 Ω', tr('电磁铁吸合触点', 'electromagnet pulls the contact')],
            [tr('直流电机', 'DC motor'), '2 mH', '8 Ω', tr('线圈产生转矩', 'coils make torque')],
          ],
          parts: ['axial', 'drum', 'drum'],
        },
        callouts: [{ part: 'bands', label: tr('棕黑橙 = 10 mH', 'brown black orange = 10 mH'), x: 240, y: 80, lx: 30, ly: 46, anchor: 'start' }],
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：磁芯上绕着很多圈铜线', '② X-ray: many turns of copper on a core'),
        body: tr(
          `把外皮变透明，两种电感里都只有两样东西：
1. [[winding|绕组 winding]]：一根很长的 **漆包铜线**（表面一层绝缘漆，所以一圈挨一圈也不会短路），绕了 N 圈。10 mH 的小电感有几百圈，线径只有 0.1 mm 左右——所以它的直流电阻并不小（10–30 Ω）。
2. [[core|磁芯 core]]：一般是 **ferrite（铁氧体）**，一种铁的氧化物陶瓷。它的 **相对磁导率** $μ_r$ 有几百到几千：同样的电流，磁芯里的磁场比空气里强几百倍，于是同样的圈数电感大几百倍（下一层的公式）。

电感 **就是一段导线**：电流不变的时候，它对电流没有任何“阻碍”，只剩导线本身的电阻。它的全部本事都在 **电流变化** 的时候才显出来。`,
          `Make the coating transparent: both kinds contain only two things:
1. [[winding|the winding]]: one long **enamelled copper wire** (an insulating varnish lets the turns touch without shorting) wound N times. A small 10 mH inductor has hundreds of turns of wire only about 0.1 mm thick — so its DC resistance is not small (10–30 Ω).
2. [[core|the core]]: usually **ferrite**, an iron-oxide ceramic. Its **relative permeability** $μ_r$ is hundreds to thousands: for the same current the field in the core is hundreds of times stronger than in air, so the same turns give hundreds of times more inductance (formula in the next layer).

An inductor **is just a piece of wire**: while the current is constant it offers no opposition at all beyond the wire’s own resistance. All its tricks appear only when the **current changes**.`,
        ),
        callouts: [
          { part: 'winding', label: tr('漆包铜线 N 圈', 'enamelled copper, N turns'), x: 330, y: 260, lx: 548, ly: 190, anchor: 'end' },
          { part: 'core', label: tr('铁氧体磁芯', 'ferrite core'), x: 210, y: 210, lx: 100, ly: 230 },
        ],
      },
      {
        id: 'field',
        short: tr('磁场', 'Field'),
        title: tr('③ 电流产生磁场：L = NΦ/i = μN²A/l', '③ Current makes a magnetic field: L = NΦ/i = μN²A/l'),
        body: tr(
          `电流流过 [[winding|线圈]]，会在线圈里面产生 **magnetic field（磁场）** B，方向由右手定则决定，[[flux|磁力线]] 从线圈一端出来、绕回另一端。穿过线圈截面 [[area|A]] 的磁场总量叫 **magnetic flux（磁通）** Φ = B·A。

磁通和电流成正比；N 圈线圈每一圈都被同一个 Φ 穿过，总的 **flux linkage（磁链）** 是 NΦ。定义：
$$L = \\frac{NΦ}{i}$$
对一个长螺线管，$B = \\frac{μNi}{l}$，代入得
$$L = \\frac{μN^{2}A}{l},   μ = μ_r μ_0,   μ_0 = 4π×10^{-7} H/m$$
- **N²**：圈数加倍，磁场加倍，被它穿过的圈数也加倍 → L × 4；
- [[core|磁芯]] 的 $μ_r$：铁氧体让 L 大几百倍；
- 截面积 A 大、[[len|长度 l]] 短 → L 大。

**带数字**：N = 250，A = 20 mm²，l = 15 mm，有效 $μ_r ≈ 100$：
$$L = \\frac{100 × 4π×10^{-7} × 250^{2} × 20×10^{-6}}{0.015} ≈ 10.5 mH$$
同样的线圈不加磁芯（$μ_r = 1$）只有约 0.1 mH。`,
          `Current through [[winding|the coil]] creates a **magnetic field** B inside it (direction by the right-hand rule); [[flux|the field lines]] leave one end and loop back into the other. The total field through the coil’s cross-section [[area|A]] is the **magnetic flux** Φ = B·A.

Flux is proportional to current; the same Φ passes through each of the N turns, so the total **flux linkage** is NΦ. Definition:
$$L = \\frac{NΦ}{i}$$
For a long solenoid $B = \\frac{μNi}{l}$; substituting,
$$L = \\frac{μN^{2}A}{l},   μ = μ_r μ_0,   μ_0 = 4π×10^{-7} H/m$$
- **N²**: double the turns and the field doubles *and* it links twice as many turns → L × 4;
- the [[core|core]]’s $μ_r$: ferrite makes L hundreds of times larger;
- larger area A and shorter [[len|length l]] → larger L.

**With numbers**: N = 250, A = 20 mm², l = 15 mm, effective $μ_r ≈ 100$:
$$L = \\frac{100 × 4π×10^{-7} × 250^{2} × 20×10^{-6}}{0.015} ≈ 10.5 mH$$
The same coil without a core ($μ_r = 1$) is only about 0.1 mH.`,
        ),
        formulas: [{ tex: 'L = \\frac{NΦ}{i} = \\frac{μ_r μ_0 N^{2} A}{l}', note: tr('L ∝ N²：圈数翻倍，电感 ×4', 'L ∝ N²: double the turns, ×4 the inductance') }],
      },
      {
        id: 'didt',
        short: 'v = L di/dt',
        title: tr('④ v = L di/dt：电压只看电流变化得多快', '④ v = L di/dt: voltage depends on how fast the current changes'),
        body: tr(
          `**Faraday’s law（法拉第电磁感应定律）**：线圈里的磁链变化时，线圈两端感应出电压 $v = \\frac{d(NΦ)}{dt}$。代入 $NΦ = Li$：
$$v = L\\frac{di}{dt}$$
（关联参考方向）。感应电压的方向总是 **阻碍电流的变化**（**Lenz’s law 楞次定律**）：电流要增大，它就“顶”回去；电流要减小，它就“推”着电流继续走。

和电容 $i = C\\frac{dv}{dt}$ 一一对应（**duality 对偶**：v ↔ i，C ↔ L）：
1. [[flat|电流不变 → 电压为 0]]。直流稳态下理想电感就是 **短路**（一根导线）。
2. [[i|电流匀速上升]] → 电压恒定：10 mH 在 1 ms 内从 0 升到 10 mA，$v = 10 mH × \\frac{10 mA}{1 ms} = 0.1 V$。在 0.1 ms 内降回 0，[[u|电压是 −1 V]]——变化快 10 倍，电压大 10 倍。
3. **电感电流不能跳变**：$i_L(0^+) = i_L(0^-)$。要在 0 秒内改变电流，需要无穷大的电压。

**储存的能量**：$p = vi = Li\\frac{di}{dt}$，从 0 到 I 积分：
$$W = \\frac{1}{2}LI^{2}$$
- 10 mH、10 mA：$\\frac{1}{2} × 0.01 × 10^{-4} = 0.5 µJ$；
- 继电器线圈 150 mH、71 mA：$\\frac{1}{2} × 0.15 × 0.071^{2} ≈ 0.38 mJ$——关断时这些能量必须有地方去（下一层）。`,
          `**Faraday’s law**: when the flux linkage of a coil changes, a voltage $v = \\frac{d(NΦ)}{dt}$ is induced across it. Substituting $NΦ = Li$:
$$v = L\\frac{di}{dt}$$
(passive sign convention). The induced voltage always **opposes the change in current** (**Lenz’s law**): if the current rises it pushes back; if the current falls it pushes the current onward.

It mirrors the capacitor’s $i = C\\frac{dv}{dt}$ (**duality**: v ↔ i, C ↔ L):
1. [[flat|Constant current → zero voltage]]. In DC steady state an ideal inductor is a **short** (a wire).
2. [[i|A current ramping steadily]] → a constant voltage: 10 mH going from 0 to 10 mA in 1 ms gives $v = 10 mH × \\frac{10 mA}{1 ms} = 0.1 V$. Back to 0 in 0.1 ms gives [[u|−1 V]] — ten times faster, ten times the voltage.
3. **An inductor’s current cannot jump**: $i_L(0^+) = i_L(0^-)$. Changing it in zero time would need infinite voltage.

**Stored energy**: $p = vi = Li\\frac{di}{dt}$; integrating from 0 to I:
$$W = \\frac{1}{2}LI^{2}$$
- 10 mH at 10 mA: $\\frac{1}{2} × 0.01 × 10^{-4} = 0.5 µJ$;
- the relay coil, 150 mH at 71 mA: $\\frac{1}{2} × 0.15 × 0.071^{2} ≈ 0.38 mJ$ — at switch-off this energy has to go somewhere (next layer).`,
        ),
        table: {
          head: ['', tr('电容 C', 'Capacitor C'), tr('电感 L', 'Inductor L')],
          rows: [
            [tr('基本关系', 'law'), '$i = C\\frac{dv}{dt}$', '$v = L\\frac{di}{dt}$'],
            [tr('不能跳变的量', 'cannot jump'), tr('电压 $v_C$', 'voltage $v_C$'), tr('电流 $i_L$', 'current $i_L$')],
            [tr('直流稳态', 'DC steady state'), tr('断路', 'open'), tr('短路', 'short')],
            [tr('储能', 'energy'), '$\\frac{1}{2}CV^{2}$（电场）', '$\\frac{1}{2}LI^{2}$（磁场）'],
            [tr('时间常数', 'time constant'), 'τ = RC', 'τ = L/R'],
          ],
          parts: ['u', 'i', 'flat', null, null],
        },
        formulas: [
          { tex: 'v = L\\frac{di}{dt}', note: tr('直流稳态：di/dt = 0 → v = 0（短路）', 'DC steady state: di/dt = 0 → v = 0 (short)') },
          { tex: 'W = \\frac{1}{2}LI^{2}', note: tr('150 mH、71 mA：0.38 mJ', '150 mH at 71 mA: 0.38 mJ') },
        ],
      },
      {
        id: 'spike',
        short: tr('关断尖峰', 'Spike'),
        title: tr('⑤ 电流不能跳 → 断开电感会产生高压', '⑤ Current cannot jump → opening an inductor makes high voltage'),
        body: tr(
          `继电器实验（exp5-relay-flyback）：+5 V → [[coil|继电器线圈 150 mH]] + [[rw|70 Ω]] → [[switch|三极管（开关）]] → GND。导通时线圈电流 $I = \\frac{5}{70} ≈ 71 mA$。

现在开关在约 1 µs 内断开。电感说：“我的电流不能跳。”可是电流已经无路可走——于是 $\\frac{di}{dt}$ 非常大，按 $v = L\\frac{di}{dt}$：
$$v ≈ 0.15 H × \\frac{0.071 A}{1 µs} ≈ 10 000 V$$
这当然达不到——电压会一直升高，直到 **某个东西被击穿、给电流开出一条路**：三极管 C–E 击穿（约 40 V）、开关触点间拉出电弧……仿真里 [[node|集电极]] 的尖峰约 [[nodiode|29 V]]（受仿真步长和三极管关断过程限制），真实电路可能更高。这就是线圈驱动电路里三极管莫名其妙烧掉的原因，也是汽车点火线圈产生上万伏高压的原理。

**解决**：并一个 [[diode|续流二极管]]（阴极接 +5 V）。开关断开时，电流改走“线圈 → 二极管 → 线圈”这个小回路，集电极电压被钳在 $5 + 0.7 = 5.7 V$；0.38 mJ 的能量按 $τ = \\frac{L}{R} = \\frac{150 mH}{70 Ω} ≈ 2.1 ms$ 慢慢消耗在线圈电阻和二极管上。（二极管拆解的第 ⑦ 层有详细说明。）`,
          `The relay lab (exp5-relay-flyback): +5 V → [[coil|the relay coil, 150 mH]] + [[rw|70 Ω]] → [[switch|a transistor (the switch)]] → GND. While on, the coil carries $I = \\frac{5}{70} ≈ 71 mA$.

Now the switch opens in about 1 µs. The inductor says: "my current cannot jump." But the current has nowhere to go — so $\\frac{di}{dt}$ is enormous, and by $v = L\\frac{di}{dt}$:
$$v ≈ 0.15 H × \\frac{0.071 A}{1 µs} ≈ 10 000 V$$
That never actually happens — the voltage keeps rising until **something breaks down and opens a path**: the transistor’s C–E junction (about 40 V), an arc across switch contacts … In the simulator [[node|the collector]] spikes to about [[nodiode|29 V]] (limited by the time step and the transistor’s turn-off), and a real circuit can go higher. This is why transistors driving coils die mysteriously, and how a car’s ignition coil makes tens of kilovolts.

**The fix**: a [[diode|flyback diode]] across the coil (cathode to +5 V). When the switch opens the current takes the small loop "coil → diode → coil", the collector is clamped at $5 + 0.7 = 5.7 V$, and the 0.38 mJ drains away in the coil resistance and the diode with $τ = \\frac{L}{R} = \\frac{150 mH}{70 Ω} ≈ 2.1 ms$. (Layer ⑦ of the diode teardown has the details.)`,
        ),
        formulas: [
          { tex: 'v = L\\frac{di}{dt} ≈ 0.15 × \\frac{0.071}{10^{-6}} ≈ 10 kV', note: tr('理论值：说明必须给电流留一条路', 'theory: shows the current must be given a path') },
          { tex: 'V_{clamp} = 5 V + 0.7 V = 5.7 V', note: tr('有续流二极管时', 'with a flyback diode') },
        ],
        calcs: ['rl-time-constant'],
      },
      {
        id: 'rl',
        short: tr('RL：τ = L/R', 'RL: τ = L/R'),
        title: tr('⑥ RL 阶跃：电流按 τ = L/R 慢慢跟上', '⑥ RL step: the current catches up with τ = L/R'),
        body: tr(
          `RL 方波实验（exp3-rl-square）：[[src|信号发生器]]（50 Ω）→ [[r|100 Ω]] → [[l|10 mH（线圈电阻 1 Ω）]] → GND，方波 ±1 V，每次跳 2 V。

**推导**（和 RC 完全对偶）：
1. KVL：$V = R_{tot} i + L\\frac{di}{dt}$，$R_{tot} = 100 + 50 + 1 = 151 Ω$；
2. 一阶线性微分方程，时间常数
$$τ = \\frac{L}{R_{tot}} = \\frac{10 mH}{151 Ω} ≈ 66 µs$$
3. 终值 $I_∞ = \\frac{V}{R_{tot}} = \\frac{1 V}{151 Ω} ≈ 6.6 mA$。方波从 −1 V 跳到 +1 V：电流从 −6.6 mA 出发，[[i|连续地]] 走向 +6.6 mA：
$$i(t) = I_∞ + (i(0) - I_∞)e^{-t/τ}$$
4. 电感电压 [[ul|在跳变瞬间跳到约 2 V]]：因为电流不能跳，电阻上的电压也不能跳，2 V 的跳变全部落在电感上；然后按 $e^{-t/τ}$ 衰减到 0（剩下 1 Ω × 6.6 mA ≈ 7 mV）。

**和 RC 对比**：RC 中电容 **电压** 连续、电流可以跳；RL 中电感 **电流** 连续、电压可以跳。

**带数字**：1 kHz 方波半周期 0.5 ms ≈ 7.6τ，电流每次都走完全程；10 kHz 半周期 50 µs ≈ 0.76τ，电流只走到一半就反向，波形变成三角波。`,
          `The RL square-wave lab (exp3-rl-square): [[src|the generator]] (50 Ω) → [[r|100 Ω]] → [[l|10 mH (1 Ω winding)]] → GND, a ±1 V square wave jumping 2 V each time.

**Derivation** (exactly dual to RC):
1. KVL: $V = R_{tot} i + L\\frac{di}{dt}$, with $R_{tot} = 100 + 50 + 1 = 151 Ω$;
2. a first-order linear ODE with time constant
$$τ = \\frac{L}{R_{tot}} = \\frac{10 mH}{151 Ω} ≈ 66 µs$$
3. final value $I_∞ = \\frac{V}{R_{tot}} = \\frac{1 V}{151 Ω} ≈ 6.6 mA$. As the square wave jumps from −1 V to +1 V, the current starts at −6.6 mA and moves [[i|smoothly]] to +6.6 mA:
$$i(t) = I_∞ + (i(0) - I_∞)e^{-t/τ}$$
4. The inductor voltage [[ul|jumps to about 2 V at the edge]]: the current cannot jump, so neither can the resistor voltage, and the whole 2 V step lands on the inductor; then it decays as $e^{-t/τ}$ to 0 (leaving 1 Ω × 6.6 mA ≈ 7 mV).

**Compared with RC**: in RC the capacitor **voltage** is continuous and the current may jump; in RL the inductor **current** is continuous and the voltage may jump.

**With numbers**: at 1 kHz the half-period is 0.5 ms ≈ 7.6τ, so the current completes every swing; at 10 kHz the half-period is 50 µs ≈ 0.76τ, the current turns back halfway and the waveform becomes a triangle.`,
        ),
        formulas: [
          {
            tex: 'τ = \\frac{L}{R_{tot}} = \\frac{10 mH}{151 Ω} ≈ 66 µs',
            note: tr('$R_tot$ 要算上信号发生器 50 Ω 和线圈 1 Ω', '$R_tot$ includes the generator’s 50 Ω and the 1 Ω winding'),
          },
          { tex: 'i(t) = I_∞ + (i(0) - I_∞)e^{-t/τ}', note: tr('三要素法', 'the three-element method') },
        ],
        calcs: ['rl-time-constant'],
      },
      {
        id: 'ac',
        short: tr('感抗', 'Reactance'),
        title: tr('⑦ 频率：直流短路，高频断路', '⑦ Frequency: a short at DC, open at high frequency'),
        body: tr(
          `通正弦电流 $i = I_m sin ωt$，代入 $v = L\\frac{di}{dt}$：
$$v = ωLI_m cos ωt$$
- 电压幅值 / 电流幅值 = ωL，这就是 **inductive reactance（感抗）**：
$$X_L = ωL = 2πfL$$
- 电感的 **电流落后电压 90°**（和电容相反）。相量：$Z_L = jωL$。

[[xl|感抗和频率成正比]]。对 10 mH：
- [[pts|160 Hz]]：10 Ω；1.6 kHz：100 Ω；16 kHz：1 kΩ；
- [[dc|直流]]：$X_L = 0$，只剩线圈电阻——**短路**；
- [[hf|高频]]：$X_L$ 很大，接近 **断路**。所以电感用来 **通直流、阻交流**：电源滤波、扼流圈（choke）。

RL 相量实验（exp4-rl-phasors）选 1.6 kHz 正是因为这时 $X_L ≈ 100 Ω = R$：总阻抗 $Z = (R + r) + jωL ≈ 101 + j100.5 Ω$，电流落后电压约 45°，$V_R$ 和 $V_L$ 大小差不多。低于约 [[rw|1 Ω / (2π × 10 mH) ≈ 16 Hz]] 时，线圈电阻比感抗还大，电感就“看起来像电阻”了。`,
          `Drive a sine current $i = I_m sin ωt$ and substitute into $v = L\\frac{di}{dt}$:
$$v = ωLI_m cos ωt$$
- voltage amplitude / current amplitude = ωL — the **inductive reactance**:
$$X_L = ωL = 2πfL$$
- in an inductor **the current lags the voltage by 90°** (the opposite of a capacitor). As a phasor: $Z_L = jωL$.

[[xl|Reactance is proportional to frequency]]. For 10 mH:
- [[pts|160 Hz]]: 10 Ω; 1.6 kHz: 100 Ω; 16 kHz: 1 kΩ;
- [[dc|DC]]: $X_L = 0$, only the winding resistance is left — a **short**;
- [[hf|high frequency]]: $X_L$ is large, nearly **open**. So inductors **pass DC and block AC**: supply filters, chokes.

The RL phasor lab (exp4-rl-phasors) uses 1.6 kHz because there $X_L ≈ 100 Ω = R$: the total impedance is $Z = (R + r) + jωL ≈ 101 + j100.5 Ω$, the current lags by about 45°, and $V_R$ and $V_L$ are about equal. Below about [[rw|1 Ω / (2π × 10 mH) ≈ 16 Hz]] the winding resistance exceeds the reactance and the inductor "looks like a resistor".`,
        ),
        table: {
          head: ['f', tr('$X_L$（10 mH）', '$X_L$ (10 mH)'), tr('相当于', 'acts like')],
          rows: [
            [tr('0（直流）', '0 (DC)'), tr('0（剩 1 Ω 线圈电阻）', '0 (1 Ω winding left)'), tr('短路', 'short')],
            ['160 Hz', '10 Ω', tr('小电阻', 'a small resistor')],
            ['1.6 kHz', '100 Ω', tr('= R：RL 相量实验', '= R: the RL phasor lab')],
            ['16 kHz', '1 kΩ', tr('大阻抗', 'a large impedance')],
          ],
          parts: ['dc', 'pts', 'pts', 'hf'],
        },
        formulas: [{ tex: 'X_L = 2πfL', note: tr('电流落后电压 90°；$Z_L$ = jωL', 'current lags voltage by 90°; $Z_L$ = jωL') }],
        calcs: ['inductive-reactance', 'lc-resonance'],
      },
      {
        id: 'real',
        short: tr('局限', 'Limits'),
        title: tr('⑧ 真实电感：线圈电阻、饱和、自谐振', '⑧ Real inductors: winding resistance, saturation, self-resonance'),
        body: tr(
          `真实电感 = 理想 [[lideal|L]] + 几个寄生效应：
- [[rw|线圈电阻 $R_w$]]：几百圈细铜线，真实 10 mH 小电感有 10–30 Ω（**仿真器只算 1 Ω**）。它串在回路里：RL 实验的 $τ = \\frac{L}{R}$ 变小、稳态电流变小；RLC 实验的衰减更快；相量实验里电流落后的角度变小。只有直流电源时，仿真器把电感当成 1 Ω 的导线。
- [[sat|磁芯饱和 saturation]]：电流超过 $I_{sat}$ 后，磁芯里的磁畴全部排好了队，$μ_r$ 迅速下降，L 也跟着骤降——电流会突然涨得很快。选电感时除了 L 还要看 **饱和电流** 和 **额定电流**（发热）。
- [[cpar|匝间电容 $C_p$]]：相邻两圈导线之间有几 pF 到几十 pF。它和 L 组成并联谐振，频率高于 [[srf|自谐振频率]] $f_{SRF} = \\frac{1}{2π\\sqrt{LC_p}}$ 时电感反而像电容。10 mH、20 pF：约 360 kHz。
- 磁芯损耗：铁氧体在高频有磁滞和涡流损耗，相当于又多一个随频率增大的电阻。

**仿真器里**：电感是 L 串 1 Ω，没有饱和、匝间电容和磁芯损耗。时域仿真的步长有限，太快的 LC 振荡（每个周期不到 10 步）会被抹平，诊断面板会提示。`,
          `A real inductor = an ideal [[lideal|L]] + a few parasitics:
- [[rw|winding resistance $R_w$]]: hundreds of turns of thin copper; a real small 10 mH part has 10–30 Ω (**the simulator uses 1 Ω**). It is in series with the loop: in the RL lab $τ = \\frac{L}{R}$ gets smaller and so does the steady current; in the RLC lab ringing dies faster; in the phasor lab the current lags by less. With only DC sources the simulator treats the inductor as a 1 Ω wire.
- [[sat|core saturation]]: above $I_{sat}$ the core’s magnetic domains are all lined up, $μ_r$ collapses and L drops sharply — the current suddenly rises much faster. Choose an inductor by its **saturation current** and **rated current** (heating), not only by L.
- [[cpar|winding capacitance $C_p$]]: neighbouring turns form a few to tens of pF. With L it makes a parallel resonance; above the [[srf|self-resonant frequency]] $f_{SRF} = \\frac{1}{2π\\sqrt{LC_p}}$ the inductor behaves like a capacitor. 10 mH and 20 pF: about 360 kHz.
- core loss: ferrite has hysteresis and eddy-current losses at high frequency, like an extra resistance that grows with frequency.

**In the simulator** an inductor is L in series with 1 Ω — no saturation, winding capacitance or core loss. The time step is finite: LC ringing much faster than the source (fewer than 10 steps per cycle) gets smeared out, and the diagnostics panel warns about it.`,
        ),
        table: {
          head: [tr('参数', 'Parameter'), tr('真实 10 mH 小电感', 'Real small 10 mH'), tr('仿真器', 'Simulator')],
          rows: [
            [tr('线圈电阻', 'winding resistance'), '10–30 Ω', '1 Ω'],
            [tr('饱和电流', 'saturation current'), tr('几十 mA', 'tens of mA'), tr('不饱和', 'never saturates')],
            [tr('匝间电容 / 自谐振', 'winding C / self-resonance'), tr('≈ 20 pF / ≈ 360 kHz', '≈ 20 pF / ≈ 360 kHz'), tr('无', 'none')],
            [tr('误差', 'tolerance'), '±10%', '0'],
          ],
          parts: ['rw', 'sat', 'srf', 'lideal'],
        },
        formulas: [{ tex: 'f_{SRF} = \\frac{1}{2π\\sqrt{L C_p}}', note: tr('10 mH、20 pF：≈ 356 kHz', '10 mH, 20 pF: ≈ 356 kHz') }],
        calcs: ['rl-time-constant', 'lc-resonance'],
      },
    ],
    recap: tr(
      '电感 = 磁芯上的一卷导线：$L = \\frac{μN^{2}A}{l}$。它的全部行为是 $v = L\\frac{di}{dt}$：电流不能跳变，直流稳态短路，储能 $\\frac{1}{2}LI^{2}$；突然断开会产生高压尖峰，所以线圈要并续流二极管；RL 电路 $τ = \\frac{L}{R}$；交流下 $X_L = 2πfL$，频率越高越像断路。真实电感有线圈电阻（仿真 1 Ω，真实 10–30 Ω）、会饱和。',
      'An inductor is a coil on a core: $L = \\frac{μN^{2}A}{l}$. All it does is $v = L\\frac{di}{dt}$: its current cannot jump, it is a short in DC steady state, it stores $\\frac{1}{2}LI^{2}$; opening it suddenly makes a voltage spike, so coils get a flyback diode; an RL circuit has $τ = \\frac{L}{R}$; for AC $X_L = 2πfL$, nearer open the higher the frequency. Real ones have winding resistance (1 Ω in the simulator, 10–30 Ω for real) and saturate.',
    ),
  };
}
