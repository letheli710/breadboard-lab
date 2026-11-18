// Teardown: the capacitor. Outside (ceramic disc "104", electrolytic can with its − stripe) →
// inside (MLCC electrode stack, rolled aluminium foil) → the parallel-plate model (q = Cv,
// C = εA/d with numbers) → i = C dv/dt and the stored energy ½CV² → charging through R
// (τ = RC, 63 %, the square-wave lab) → frequency: open at DC, short at high frequency (X_C) →
// the real capacitor: ESR, ESL, leakage, polarity, and what the simulator leaves out.

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

/** horizontal capacitor symbol centred at (x, y), plates vertical */
function CapH({ x, y, part, gap = 10, h = 28 }: { x: number; y: number; part?: string; gap?: number; h?: number }) {
  return (
    <g data-part={part}>
      <line x1={x - gap / 2} y1={y - h / 2} x2={x - gap / 2} y2={y + h / 2} className="pv-wire" style={{ strokeWidth: 3 }} />
      <line x1={x + gap / 2} y1={y - h / 2} x2={x + gap / 2} y2={y + h / 2} className="pv-wire" style={{ strokeWidth: 3 }} />
    </g>
  );
}

/** vertical capacitor symbol centred at (x, y), plates horizontal */
function CapV({ x, y, part, gap = 10, w = 32 }: { x: number; y: number; part?: string; gap?: number; w?: number }) {
  return (
    <g data-part={part}>
      <line x1={x - w / 2} y1={y - gap / 2} x2={x + w / 2} y2={y - gap / 2} className="pv-wire" style={{ strokeWidth: 3 }} />
      <line x1={x - w / 2} y1={y + gap / 2} x2={x + w / 2} y2={y + gap / 2} className="pv-wire" style={{ strokeWidth: 3 }} />
    </g>
  );
}

/* ------------------------------------------------------------------ layer 0: outside */

function Outside({ layer }: { layer: number }) {
  return (
    <g className={show(layer === 0)}>
      {/* ceramic disc */}
      <g data-part="ceramic">
        <rect x={124} y={210} width={7} height={170} fill="#c9ccd1" stroke="#7d8088" />
        <rect x={169} y={210} width={7} height={170} fill="#c9ccd1" stroke="#7d8088" />
        <ellipse cx={150} cy={170} rx={62} ry={58} fill="#e9a23b" stroke="#a8691a" strokeWidth={2} />
        <text x={150} y={168} textAnchor="middle" className="pv-eq" style={{ fontSize: 22 }} data-part="code">
          104
        </text>
        <text x={150} y={192} textAnchor="middle" className="pv-lbl">
          50V
        </text>
        <text x={150} y={410} textAnchor="middle" className="pv-lbl">
          {tr('瓷片电容 100 nF', 'ceramic 100 nF')}
        </text>
        <text x={150} y={428} textAnchor="middle" className="td-small">
          {tr('无极性', 'no polarity')}
        </text>
      </g>
      {/* electrolytic */}
      <g data-part="elec">
        <rect x={372} y={300} width={7} height={100} fill="#c9ccd1" stroke="#7d8088" data-part="plus" />
        <rect x={421} y={300} width={7} height={70} fill="#c9ccd1" stroke="#7d8088" data-part="minus" />
        <rect x={340} y={70} width={120} height={230} rx={14} fill="#2b4f9e" stroke="#1d335f" strokeWidth={2} />
        <rect x={420} y={70} width={40} height={230} fill="#cfd8ea" data-part="stripe minus" />
        <rect x={440} y={70} width={20} height={230} rx={0} fill="#2b4f9e" opacity={0} />
        {[100, 150, 200, 250].map((y) => (
          <text key={y} x={440} y={y + 8} textAnchor="middle" className="pv-eq" style={{ fill: '#1d335f', fontSize: 26 }} data-part="stripe">
            −
          </text>
        ))}
        <text x={378} y={150} textAnchor="middle" className="pv-lbl pv-white">
          1000µF
        </text>
        <text x={378} y={172} textAnchor="middle" className="pv-lbl pv-white">
          16V
        </text>
        <path d="M352 84 L408 84" stroke="#fff" strokeOpacity={0.5} strokeWidth={2} />
        <text x={360} y={414} textAnchor="middle" className="pv-lbl pv-red" data-part="plus">
          + {tr('长脚', 'long')}
        </text>
        <text x={444} y={386} className="pv-lbl pv-blue" data-part="minus">
          − {tr('短脚', 'short')}
        </text>
        <text x={400} y={34} textAnchor="middle" className="pv-lbl">
          {tr('电解电容（有极性）', 'electrolytic (polarised)')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 1: inside */

function Inside({ layer }: { layer: number }) {
  // archimedean spiral for the rolled foil
  const spiral = (phase: number) => {
    const pts: string[] = [];
    for (let k = 0; k <= 220; k++) {
      const t = (k / 220) * 5 * 2 * Math.PI;
      const r = 8 + (t / (2 * Math.PI)) * 13 + phase;
      pts.push(`${420 + r * Math.cos(t)},${130 + r * Math.sin(t)}`);
    }
    return pts.join(' ');
  };
  return (
    <g className={show(layer === 1)}>
      {/* MLCC */}
      <text x={140} y={44} textAnchor="middle" className="pv-lbl">
        {tr('瓷片 / 贴片陶瓷电容（MLCC）剖面', 'ceramic (MLCC) cross-section')}
      </text>
      <rect x={40} y={70} width={200} height={140} fill="#efe1c0" stroke="#a8915e" data-part="dielec" />
      <rect x={30} y={66} width={20} height={148} fill="#c9ccd1" stroke="#7d8088" data-part="term" />
      <rect x={230} y={66} width={20} height={148} fill="#c9ccd1" stroke="#7d8088" data-part="term" />
      {Array.from({ length: 8 }, (_, k) => {
        const y = 82 + k * 16;
        const left = k % 2 === 0;
        return <rect key={k} x={left ? 50 : 66} y={y} width={164} height={5} fill={left ? '#e63946' : '#2b59c3'} data-part="electrodes" />;
      })}
      <text x={140} y={232} textAnchor="middle" className="td-small">
        {tr('红 / 蓝电极交替接两端，中间是陶瓷', 'red / blue electrodes alternate to the two ends')}
      </text>
      <text x={140} y={250} textAnchor="middle" className="td-small">
        {tr('每层 d ≈ 5 µm，叠几十到几百层', 'each layer d ≈ 5 µm, tens to hundreds of layers')}
      </text>

      {/* electrolytic roll */}
      <text x={420} y={44} textAnchor="middle" className="pv-lbl">
        {tr('电解电容：卷起来的铝箔', 'electrolytic: a rolled foil')}
      </text>
      <polyline points={spiral(0)} fill="none" stroke="#9aa0a6" strokeWidth={3} data-part="anodefoil" />
      <polyline points={spiral(6.5)} fill="none" stroke="#e9d9a8" strokeWidth={3} data-part="paper" />
      {/* unrolled layers */}
      <path d="M420 228 L420 262" className="pv-thin" markerEnd="url(#cp-ah)" />
      <text x={428} y={252} className="td-small">
        {tr('展开一小段', 'unroll a piece')}
      </text>
      <g>
        <rect x={60} y={286} width={460} height={18} fill="#c9ccd1" stroke="#7d8088" data-part="anodefoil" />
        <rect x={60} y={304} width={460} height={6} fill="#7a3fc0" data-part="oxide" />
        <rect x={60} y={310} width={460} height={28} fill="#e9d9a8" stroke="#b5a36a" data-part="paper" />
        <rect x={60} y={338} width={460} height={18} fill="#9aa0a6" stroke="#6b7078" data-part="cathodefoil" />
        <text x={56} y={300} textAnchor="end" className="pv-lbl pv-red" data-part="anodefoil">
          +
        </text>
        <text x={56} y={352} textAnchor="end" className="pv-lbl pv-blue" data-part="cathodefoil">
          −
        </text>
        <text x={290} y={299} textAnchor="middle" className="td-small" data-part="anodefoil">
          {tr('阳极铝箔（腐蚀出极大表面积）', 'anode Al foil (etched: huge area)')}
        </text>
        <text x={290} y={329} textAnchor="middle" className="td-small" data-part="paper">
          {tr('浸了电解液的纸 = 真正的阴极', 'paper soaked in electrolyte = the real cathode')}
        </text>
        <text x={290} y={351} textAnchor="middle" className="td-small" data-part="cathodefoil">
          {tr('阴极铝箔', 'cathode Al foil')}
        </text>
        <path d="M480 307 L520 380" className="pv-thin" />
        <text x={520} y={396} textAnchor="end" className="pv-lbl pv-violet" data-part="oxide">
          {tr('氧化铝 Al₂O₃ 介质，d ≈ 十几 nm', 'Al₂O₃ dielectric, d ≈ 10–20 nm')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 2: plates */

function Plates({ layer }: { layer: number }) {
  return (
    <g className={show(layer === 2)}>
      <line x1={280} y1={40} x2={280} y2={92} className="pv-wire" />
      <line x1={280} y1={318} x2={280} y2={370} className="pv-wire" />
      <rect x={120} y={92} width={320} height={14} fill="#c9ccd1" stroke="#7d8088" data-part="top" />
      <rect x={120} y={304} width={320} height={14} fill="#c9ccd1" stroke="#7d8088" data-part="bot" />
      <rect x={120} y={106} width={320} height={198} fill="#fff3d6" stroke="#d9c38c" data-part="dielec" />
      {Array.from({ length: 9 }, (_, k) => (
        <g key={k}>
          <text x={136 + k * 36} y={88} textAnchor="middle" className="pv-lbl pv-red" data-part="top">
            +
          </text>
          <text x={136 + k * 36} y={336} textAnchor="middle" className="pv-lbl pv-blue" data-part="bot">
            −
          </text>
        </g>
      ))}
      <g data-part="field">
        {[160, 240, 320, 400].map((x) => (
          <path key={x} d={`M${x} 112 L${x} 296`} stroke="#e63946" strokeWidth={1.4} strokeDasharray="5 4" markerEnd="url(#cp-ahr)" />
        ))}
      </g>
      <g data-part="dipole">
        {[
          [200, 160],
          [280, 210],
          [360, 160],
          [200, 260],
          [360, 260],
        ].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={10} ry={18} fill="#fff" stroke="#7a3fc0" strokeWidth={1.4} />
            <text x={x} y={y - 4} textAnchor="middle" className="pv-tiny" style={{ fill: '#2b59c3', fontWeight: 700 }}>
              −
            </text>
            <text x={x} y={y + 13} textAnchor="middle" className="pv-tiny" style={{ fill: '#c62f3b', fontWeight: 700 }}>
              +
            </text>
          </g>
        ))}
      </g>
      <path d="M466 106 L466 304" className="pv-thin" markerStart="url(#cp-ah)" markerEnd="url(#cp-ah)" data-part="d" />
      <text x={474} y={210} className="pv-lbl" data-part="d">
        d
      </text>
      <text x={110} y={102} textAnchor="end" className="pv-lbl" data-part="top">
        {tr('面积 A', 'area A')}
      </text>
      <text x={296} y={56} className="pv-lbl pv-red">
        +q
      </text>
      <text x={296} y={362} className="pv-lbl pv-blue">
        −q
      </text>
      <path d="M80 110 L80 300" className="pv-thin" markerStart="url(#cp-ah)" data-part="u" />
      <text x={70} y={214} textAnchor="end" className="pv-lbl pv-blue" data-part="u">
        v
      </text>
      <text x={280} y={406} textAnchor="middle" className="pv-eq">
        q = C·v ; C = ε·A / d
      </text>
      <text x={280} y={428} textAnchor="middle" className="td-small">
        {sub('ε = ε_r·ε_0,  ε_0 = 8.85 pF/m')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 3: i = C dv/dt */

function Didt({ layer }: { layer: number }) {
  const T = (ms: number) => 90 + ms * 70; // 0..6 ms
  const V = (v: number) => 190 - v * 22;
  const I = (ma: number) => 310 - ma * 70;
  return (
    <g className={show(layer === 3)}>
      <text x={280} y={42} textAnchor="middle" className="pv-lbl">
        {tr('100 nF：电压怎么变 → 电流就是多少', '100 nF: how the voltage moves sets the current')}
      </text>
      {/* v(t) */}
      <line x1={T(0)} y1={V(0)} x2={T(6.2)} y2={V(0)} className="pv-axis" markerEnd="url(#cp-ah)" />
      <line x1={T(0)} y1={V(0)} x2={T(0)} y2={V(6)} className="pv-axis" markerEnd="url(#cp-ah)" />
      <text x={T(0) - 8} y={V(5.6)} textAnchor="end" className="pv-lbl pv-blue">
        v / V
      </text>
      <text x={T(0) - 8} y={V(5) + 4} textAnchor="end" className="td-small">
        5
      </text>
      <polyline points={`${T(0)},${V(0)} ${T(1)},${V(0)} ${T(2)},${V(5)} ${T(4)},${V(5)} ${T(4.5)},${V(0)} ${T(6)},${V(0)}`} className="pv-curve blue" data-part="u" />
      {/* i(t) */}
      <line x1={T(0)} y1={I(0)} x2={T(6.2)} y2={I(0)} className="pv-axis" markerEnd="url(#cp-ah)" />
      <line x1={T(0)} y1={I(-1.2)} x2={T(0)} y2={I(1.1)} className="pv-axis" markerEnd="url(#cp-ah)" />
      <text x={T(0) - 8} y={I(0.95)} textAnchor="end" className="pv-lbl pv-red">
        i / mA
      </text>
      <text x={T(0) - 8} y={I(0.5) + 4} textAnchor="end" className="td-small">
        0.5
      </text>
      <text x={T(0) - 8} y={I(-1) + 4} textAnchor="end" className="td-small">
        −1
      </text>
      <polyline
        points={`${T(0)},${I(0)} ${T(1)},${I(0)} ${T(1)},${I(0.5)} ${T(2)},${I(0.5)} ${T(2)},${I(0)} ${T(4)},${I(0)} ${T(4)},${I(-1)} ${T(4.5)},${I(-1)} ${T(4.5)},${I(0)} ${T(6)},${I(0)}`}
        className="pv-curve"
        data-part="i"
      />
      {[1, 2, 4, 4.5].map((t) => (
        <line key={t} x1={T(t)} y1={V(5.4)} x2={T(t)} y2={I(-1.1)} className="pv-dash" />
      ))}
      <text x={T(1.5)} y={V(2.5) - 14} textAnchor="end" className="td-small" data-part="u">
        {tr('5 V / 1 ms', '5 V in 1 ms')}
      </text>
      <text x={T(1.5)} y={I(0.5) - 8} textAnchor="middle" className="pv-lbl pv-red" data-part="i">
        +0.5 mA
      </text>
      <text x={T(3)} y={V(5) - 8} textAnchor="middle" className="td-small" data-part="flat">
        {tr('v 不变', 'v constant')}
      </text>
      <text x={T(3)} y={I(0) - 8} textAnchor="middle" className="pv-lbl" data-part="flat">
        i = 0
      </text>
      <text x={T(4.6)} y={I(-1) + 4} className="pv-lbl pv-red" data-part="i">
        −1 mA
      </text>
      <text x={T(6.2)} y={I(0) + 18} textAnchor="end" className="td-small">
        t / ms
      </text>
      <text x={280} y={420} textAnchor="middle" className="pv-eq">
        {tr('i = C·dv/dt = 100 nF × 5 V / 1 ms = 0.5 mA', 'i = C·dv/dt = 100 nF × 5 V / 1 ms = 0.5 mA')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 4: RC charging */

function Charging({ layer }: { layer: number }) {
  const T = (tau: number) => 90 + tau * 82; // 0..5.4 τ
  const V = (v: number) => 400 - v * 44; // 0..5 V
  const pts = Array.from({ length: 61 }, (_, k) => {
    const t = (k / 60) * 5.2;
    return `${T(t)},${V(5 * (1 - Math.exp(-t)))}`;
  }).join(' ');
  const ipts = Array.from({ length: 61 }, (_, k) => {
    const t = (k / 60) * 5.2;
    return `${T(t)},${V(5 * Math.exp(-t))}`;
  }).join(' ');
  const marks: [number, string][] = [
    [1, '63%'],
    [3, '95%'],
    [5, '99.3%'],
  ];
  return (
    <g className={show(layer === 4)}>
      {/* circuit */}
      <g>
        <circle cx={70} cy={84} r={16} className="pv-term" data-part="src" />
        <path d="M62 90 L62 78 L70 78 L70 90 L78 90 L78 78" fill="none" stroke="var(--ink)" strokeWidth={1.4} data-part="src" />
        <path d="M70 68 L70 46 L120 46" className="pv-wire" />
        <Zig x1={120} y1={46} x2={210} y2={46} part="r" />
        <text x={165} y={30} textAnchor="middle" className="pv-lbl" data-part="r">
          10 kΩ
        </text>
        <path d="M210 46 L260 46 L260 70" className="pv-wire" />
        <CapV x={260} y={76} part="c" />
        <text x={284} y={80} className="pv-lbl" data-part="c">
          100 nF
        </text>
        <path d="M260 82 L260 112 L70 112 L70 100" className="pv-wire" />
        <circle cx={260} cy={46} r={3.5} className="pv-dot" />
        <text x={268} y={40} className="pv-lbl pv-blue">
          {sub('v_C')}
        </text>
        <text x={330} y={44} className="td-small">
          {tr('方波 0 → 5 V（信号发生器 50 Ω）', 'square wave 0 → 5 V (generator 50 Ω)')}
        </text>
        <text x={330} y={64} className="pv-lbl">
          τ = (10 k + 50) × 100 n ≈ 1.0 ms
        </text>
      </g>
      {/* graph */}
      <line x1={T(0)} y1={V(0)} x2={T(5.5)} y2={V(0)} className="pv-axis" markerEnd="url(#cp-ah)" />
      <line x1={T(0)} y1={V(0)} x2={T(0)} y2={V(5.6)} className="pv-axis" markerEnd="url(#cp-ah)" />
      <line x1={T(0)} y1={V(5)} x2={T(5.3)} y2={V(5)} className="pv-dash" />
      <text x={T(0) - 8} y={V(5) + 4} textAnchor="end" className="td-small">
        5 V
      </text>
      {[1, 2, 3, 4, 5].map((t) => (
        <text key={t} x={T(t)} y={V(0) + 16} textAnchor="middle" className="td-small">
          {t}τ
        </text>
      ))}
      <text x={T(5.5)} y={V(0) + 30} textAnchor="end" className="td-small">
        {tr('t（1τ ≈ 1 ms）', 't (1τ ≈ 1 ms)')}
      </text>
      <polyline points={ipts} className="pv-curve thin dashed" data-part="ic" />
      <polyline points={pts} className="pv-curve blue" data-part="uc" />
      <line x1={T(0)} y1={V(0)} x2={T(1)} y2={V(5)} className="pv-thin" data-part="tangent" strokeDasharray="3 3" />
      {marks.map(([t, l]) => {
        const v = 5 * (1 - Math.exp(-t));
        return (
          <g key={t} data-part={t === 1 ? 'tau' : 'uc'}>
            <line x1={T(t)} y1={V(0)} x2={T(t)} y2={V(v)} className="pv-dash" />
            <circle cx={T(t)} cy={V(v)} r={4.5} fill="#2b59c3" />
            <text x={T(t) + 6} y={V(v) + 18} className="pv-lbl pv-blue">
              {l}
            </text>
          </g>
        );
      })}
      <text x={T(1) + 8} y={V(3.16) + 34} className="td-small" data-part="tau">
        3.16 V
      </text>
      <text x={T(2.3)} y={V(0.9)} className="pv-lbl pv-red" data-part="ic">
        {tr('电流 i ∝ e^(−t/τ)（虚线）', 'current i ∝ e^(−t/τ) (dashed)')}
      </text>
      <text x={T(3.3)} y={V(4.3) + 30} className="pv-lbl pv-blue" data-part="uc">
        {sub('v_C = V(1 − e^(−t/τ))')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 5: reactance */

function Reactance({ layer }: { layer: number }) {
  const F = (f: number) => 100 + (Math.log10(f) - 1) * 80; // 10 Hz … 1 MHz
  const X = (x: number) => 380 - Math.log10(x) * 46; // 1 Ω … 1 MΩ
  const xc = (f: number) => 1 / (2 * Math.PI * f * 100e-9);
  const pts: [number, string, string][] = [
    [50, '50 Hz', '31.8 kΩ'],
    [1000, '1 kHz', '1.59 kΩ'],
    [100e3, '100 kHz', '15.9 Ω'],
  ];
  return (
    <g className={show(layer === 5)}>
      {[1, 2, 3, 4, 5, 6].map((d) => (
        <g key={d}>
          <line x1={F(10)} y1={X(10 ** d)} x2={F(1e6)} y2={X(10 ** d)} className="pv-grid" />
          <text x={F(10) - 8} y={X(10 ** d) + 4} textAnchor="end" className="td-small">
            {['10', '100', '1k', '10k', '100k', '1M'][d - 1]}
          </text>
        </g>
      ))}
      {[1, 2, 3, 4, 5, 6].map((d) => (
        <g key={d}>
          <line x1={F(10 ** d)} y1={X(1)} x2={F(10 ** d)} y2={X(1e6)} className="pv-grid" />
          <text x={F(10 ** d)} y={X(1) + 16} textAnchor="middle" className="td-small">
            {['10', '100', '1k', '10k', '100k', '1M'][d - 1]}
          </text>
        </g>
      ))}
      <line x1={F(10)} y1={X(1)} x2={F(1e6) + 14} y2={X(1)} className="pv-axis" markerEnd="url(#cp-ah)" />
      <line x1={F(10)} y1={X(1)} x2={F(10)} y2={X(1e6) - 14} className="pv-axis" markerEnd="url(#cp-ah)" />
      <text x={F(1e6) + 14} y={X(1) + 32} textAnchor="end" className="pv-lbl">
        f / Hz
      </text>
      <text x={F(10) + 8} y={X(1e6) - 4} className="pv-lbl pv-violet">
        {sub('X_C / Ω  (C = 100 nF)')}
      </text>
      <line x1={F(10)} y1={X(xc(10))} x2={F(1e6)} y2={X(xc(1e6))} className="pv-curve violet" data-part="xc" />
      {pts.map(([f, fl, xl]) => (
        <g key={f} data-part="pts">
          <circle cx={F(f)} cy={X(xc(f))} r={5} fill="#7a3fc0" />
          <text x={F(f) + 8} y={X(xc(f)) - 8} className="pv-lbl pv-violet">
            {`${fl}: ${xl}`}
          </text>
        </g>
      ))}
      <g data-part="dc">
        <rect x={100} y={404} width={150} height={30} rx={8} className="td-panel" />
        <text x={175} y={424} textAnchor="middle" className="pv-lbl">
          {tr('直流：断路 ∞', 'DC: open ∞')}
        </text>
      </g>
      <g data-part="hf">
        <rect x={350} y={404} width={170} height={30} rx={8} className="td-panel" />
        <text x={435} y={424} textAnchor="middle" className="pv-lbl">
          {tr('高频：接近短路', 'high f: nearly a short')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ layer 6: real capacitor */

function Real({ layer }: { layer: number }) {
  return (
    <g className={show(layer === 6)}>
      <text x={280} y={42} textAnchor="middle" className="pv-lbl">
        {tr('真实电容的等效电路', 'equivalent circuit of a real capacitor')}
      </text>
      <circle cx={40} cy={130} r={4} className="pv-term" />
      <line x1={44} y1={130} x2={90} y2={130} className="pv-wire" />
      <path d="M90 130 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0 a9 9 0 0 1 18 0" className="pv-wire" data-part="esl" />
      <line x1={144} y1={130} x2={180} y2={130} className="pv-wire" />
      <Zig x1={180} y1={130} x2={260} y2={130} part="esr" body={40} />
      <line x1={260} y1={130} x2={310} y2={130} className="pv-wire" />
      <circle cx={310} cy={130} r={3.5} className="pv-dot" />
      <path d="M310 130 L310 90 L380 90" className="pv-wire" />
      <path d="M310 130 L310 170 L380 170" className="pv-wire" />
      <CapH x={385} y={90} part="cideal" />
      <line x1={390} y1={90} x2={460} y2={90} className="pv-wire" />
      <Zig x1={340} y1={170} x2={430} y2={170} part="leak" body={40} />
      <path d="M430 170 L460 170 L460 90" className="pv-wire" />
      <circle cx={460} cy={130} r={3.5} className="pv-dot" />
      <line x1={460} y1={130} x2={516} y2={130} className="pv-wire" />
      <circle cx={520} cy={130} r={4} className="pv-term" />
      <text x={117} y={110} textAnchor="middle" className="pv-lbl pv-orange" data-part="esl">
        ESL
      </text>
      <text x={117} y={158} textAnchor="middle" className="pv-tiny" data-part="esl">
        ≈ 5–20 nH
      </text>
      <text x={220} y={110} textAnchor="middle" className="pv-lbl pv-red" data-part="esr">
        ESR
      </text>
      <text x={220} y={158} textAnchor="middle" className="pv-tiny" data-part="esr">
        {tr('电解 ≈ 0.1–1 Ω', 'electrolytic ≈ 0.1–1 Ω')}
      </text>
      <text x={385} y={70} textAnchor="middle" className="pv-lbl" data-part="cideal">
        C
      </text>
      <text x={385} y={196} textAnchor="middle" className="pv-tiny" data-part="leak">
        {sub(tr('漏电 R_leak ≈ MΩ（电解）', 'leakage R_leak ≈ MΩ (electrolytic)'))}
      </text>
      {/* polarity warning */}
      <g data-part="polarity">
        <rect x={40} y={226} width={230} height={196} rx={12} className="td-panel" />
        <rect x={56} y={262} width={60} height={110} rx={8} fill="#2b4f9e" stroke="#1d335f" strokeWidth={2} />
        <rect x={96} y={262} width={20} height={110} fill="#cfd8ea" />
        <path d="M60 262 q 26 -26 52 0" fill="#d0d0d0" stroke="#888" />
        <path d="M86 250 l-8 -14 M86 250 l0 -18 M86 250 l8 -14" stroke="#e63946" strokeWidth={2} />
        <text x={198} y={286} textAnchor="middle" className="pv-lbl pv-red">
          {tr('接反：', 'reversed:')}
        </text>
        <text x={198} y={306} textAnchor="middle" className="td-small">
          {tr('氧化层被还原', 'oxide dissolves')}
        </text>
        <text x={198} y={324} textAnchor="middle" className="td-small">
          {tr('漏电 → 发热 → 产气', 'leakage → heat → gas')}
        </text>
        <text x={198} y={342} textAnchor="middle" className="td-small">
          {tr('鼓包、喷液、爆开', 'bulges, vents, bursts')}
        </text>
        <text x={155} y={404} textAnchor="middle" className="pv-lbl">
          {tr('仿真器不检查极性！', 'the simulator does not check!')}
        </text>
      </g>
      {/* DC bias */}
      <g data-part="bias">
        <rect x={290} y={226} width={230} height={196} rx={12} className="td-panel" />
        <text x={405} y={250} textAnchor="middle" className="pv-lbl">
          {tr('陶瓷 X7R：电压越高 C 越小', 'ceramic X7R: C drops with voltage')}
        </text>
        <line x1={320} y1={390} x2={500} y2={390} className="pv-axis" />
        <line x1={320} y1={390} x2={320} y2={270} className="pv-axis" />
        <path d="M320 284 C 380 288, 420 320, 500 350" className="pv-curve violet" />
        <text x={316} y={288} textAnchor="end" className="pv-tiny">
          100%
        </text>
        <text x={500} y={372} textAnchor="end" className="pv-tiny">
          ≈ 60%
        </text>
        <text x={410} y={408} textAnchor="middle" className="pv-tiny">
          {tr('直流偏压 → 额定电压', 'DC bias → rated voltage')}
        </text>
      </g>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="cp-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pv-ah" />
        </marker>
        <marker id="cp-ahr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#e63946" />
        </marker>
      </defs>
      <Outside layer={layer} />
      <Inside layer={layer} />
      <Plates layer={layer} />
      <Didt layer={layer} />
      <Charging layer={layer} />
      <Reactance layer={layer} />
      <Real layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'capacitor',
    title: tr('电容 Capacitor：两块极板夹一层绝缘', 'The capacitor: two plates and an insulator'),
    subtitle: tr(
      '电容储存的是电荷和电场能量。拆开是两块金属极板中间夹一层介质（dielectric）；由此推出 q = Cv、C = εA/d、i = C dv/dt、W = ½CV²，再推出 RC 充电的指数曲线（τ = RC）和“直流断路、高频短路”的容抗。最后看真实电容差在哪：ESR、漏电、极性。',
      'A capacitor stores charge and electric-field energy. Inside are two metal plates with a dielectric between them; from that come q = Cv, C = εA/d, i = C dv/dt and W = ½CV², then the exponential RC charge (τ = RC) and the reactance that makes it "open at DC, short at high frequency". Last, how real ones differ: ESR, leakage, polarity.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'outside',
        short: tr('外形', 'Outside'),
        title: tr('① 外形：瓷片电容和电解电容', '① Outside: ceramic and electrolytic'),
        body: tr(
          `课程里有两种电容：
- [[ceramic|瓷片电容 ceramic capacitor]]：橙色小圆片，**没有极性**，容量小（pF – 几 µF）。上面印 [[code|三位数代码]]，单位是 **pF**：前两位是有效数字，第三位是 10 的几次方。**104** = 10 × 10⁴ pF = 100 000 pF = **100 nF** = 0.1 µF。102 = 1 nF，103 = 10 nF，105 = 1 µF。
- [[elec|电解电容 electrolytic capacitor]]：铝壳圆柱，容量大（1 µF – 几万 µF），**有极性**：[[plus|长脚是 +]]，外壳上 [[stripe|印着一串“−”的白条]] 那边是 [[minus|−（短脚）]]。直接印着容量和耐压，比如 1000 µF 16 V。

两种电容的 **耐压**（rated voltage）都要大于电路里的最高电压，一般留 1.5–2 倍余量：9 V 电路用 16 V 或 25 V 的。

呼吸灯实验（exp3-led-breathing）用的 1000 µF 就是电解电容：长脚（+）接 VC，短脚接 GND。`,
          `Two kinds of capacitor appear in this course:
- [[ceramic|ceramic capacitor]]: a small orange disc, **no polarity**, small values (pF – a few µF). It carries a [[code|three-digit code]] in **pF**: two digits and a power of ten. **104** = 10 × 10⁴ pF = 100 000 pF = **100 nF** = 0.1 µF. 102 = 1 nF, 103 = 10 nF, 105 = 1 µF.
- [[elec|electrolytic capacitor]]: an aluminium can, large values (1 µF – tens of thousands of µF), **polarised**: [[plus|the long leg is +]], and the side of the sleeve with [[stripe|a white stripe of "−" signs]] is [[minus|− (the short leg)]]. Value and voltage are printed in full, e.g. 1000 µF 16 V.

For both, the **rated voltage** must exceed the highest voltage in the circuit, usually with a 1.5–2× margin: use 16 V or 25 V parts in a 9 V circuit.

The 1000 µF in the LED-breathing lab (exp3-led-breathing) is an electrolytic: long leg (+) to VC, short leg to GND.`,
        ),
        table: {
          head: [tr('类型', 'Type'), tr('标记', 'Marking'), tr('极性', 'Polarity'), tr('常见范围', 'Typical range'), tr('课程里', 'In this course')],
          rows: [
            [
              tr('瓷片 / 陶瓷', 'ceramic'),
              tr('三位代码（pF）：104 = 100 nF', '3-digit code (pF): 104 = 100 nF'),
              tr('无', 'none'),
              '1 pF – 10 µF',
              tr('RC 实验的 100 nF', 'the 100 nF in the RC labs'),
            ],
            [
              tr('铝电解', 'aluminium electrolytic'),
              tr('直接印 µF 和 V；“−”条 = 负极', 'µF and V printed; "−" stripe = negative'),
              tr('有：长脚 +', 'yes: long leg +'),
              '1 µF – 47 mF',
              tr('呼吸灯的 1000 µF', 'the 1000 µF in the breathing LED'),
            ],
          ],
          parts: ['ceramic', 'elec'],
        },
        callouts: [{ part: 'stripe', label: tr('“−”条 = 负极', '"−" stripe = negative'), x: 440, y: 110, lx: 552, ly: 60, anchor: 'end' }],
      },
      {
        id: 'inside',
        short: tr('内部', 'Inside'),
        title: tr('② 拆开：电极、介质，一层又一层', '② Inside: electrodes and dielectric, layer after layer'),
        body: tr(
          `每个电容不管长什么样，里面都是同一个结构：**两个互相绝缘的导体（电极 electrode），中间夹一层绝缘体（介质 dielectric）**。工厂做的事情，就是在小体积里把“面积做大、距离做小”。

**陶瓷电容（MLCC，多层陶瓷电容）**：几十到几百层 [[electrodes|金属电极]] 和 [[dielec|陶瓷介质]] 交替叠在一起，单数层接左边的 [[term|端电极]]，双数层接右边——等于很多个电容 **并联**。陶瓷（钛酸钡）的相对介电常数 $ε_r$ 很大（X7R 约 2000），每层只有几 µm 厚。

**铝电解电容**：一条 [[anodefoil|阳极铝箔]] 和一条 [[cathodefoil|阴极铝箔]]，中间夹 [[paper|浸了电解液的纸]]，卷成一卷装进铝壳。真正的介质是阳极箔表面电化学生长出来的一层 [[oxide|氧化铝 Al₂O₃]]，只有十几 nm 厚；铝箔还被腐蚀得坑坑洼洼，实际表面积是平面的几十倍。所以它能在小体积里做出 1000 µF。

**极性的来源**：氧化层只在阳极箔上，而且只有阳极电压更高时才稳定。电压反过来，电化学反应会把它还原掉（第 ⑦ 层）。`,
          `Whatever it looks like, every capacitor has the same structure inside: **two conductors insulated from each other (electrodes), with an insulator (the dielectric) between them**. The factory’s job is to make the area large and the gap small in a small volume.

**Ceramic (MLCC, multilayer ceramic capacitor)**: tens to hundreds of [[electrodes|metal electrodes]] stacked with [[dielec|ceramic dielectric]] between them; odd layers go to the left [[term|terminal]], even layers to the right — many capacitors **in parallel**. The ceramic (barium titanate) has a huge relative permittivity $ε_r$ (about 2000 for X7R), and each layer is only a few µm thick.

**Aluminium electrolytic**: an [[anodefoil|anode foil]] and a [[cathodefoil|cathode foil]] with [[paper|electrolyte-soaked paper]] between them, rolled up into the can. The real dielectric is a layer of [[oxide|aluminium oxide Al₂O₃]] grown electrochemically on the anode foil, only 10–20 nm thick; the foil is also etched rough, giving tens of times its flat area. That is how 1000 µF fits in a small can.

**Where the polarity comes from**: the oxide is only on the anode foil, and it is only stable while the anode is the more positive side. Reverse the voltage and the chemistry strips it away (layer ⑦).`,
        ),
      },
      {
        id: 'plates',
        short: 'q = Cv',
        title: tr('③ 模型：平行板，q = Cv，C = εA/d', '③ The model: parallel plates, q = Cv, C = εA/d'),
        body: tr(
          `把电容理想化成两块面积为 A、距离为 d 的 [[top|平行金属板]]。加电压 v：电源从 [[bot|下板]] 抽走电子送到上板的反面……结果是上板带 **+q**，下板带 **−q**，两板之间出现 [[field|电场]]。电荷和电压成正比，比例系数就是 **capacitance（电容）C**：
$$q = C·v$$
单位：法拉 F = C/V。1 F 很大，常用 µF（10⁻⁶）、nF（10⁻⁹）、pF（10⁻¹²）。

C 由几何和材料决定：
$$C = \\frac{εA}{d},   ε = ε_r ε_0,   ε_0 = 8.85 pF/m$$
- 面积 A 越大 → 能放的电荷越多；
- 距离 [[d|d]] 越小 → 同样电压下电场越强、吸住的电荷越多；
- [[dipole|介质]] 被电场 **极化**（polarization）：分子里的正负电荷被拉开，抵消掉一部分电场，于是同样的 v 能多放 $ε_r$ 倍的电荷。

**带数字**：空气、1 cm² 的两块板、相距 1 mm：$C = \\frac{8.85×10^{-12} × 10^{-4}}{10^{-3}} ≈ 0.89 pF$——小得可怜。
一层 MLCC：$ε_r = 2000$，A = 2 mm × 1.2 mm，d = 5 µm：$C = \\frac{8.85×10^{-12} × 2000 × 2.4×10^{-6}}{5×10^{-6}} ≈ 8.5 nF$；叠 12 层并联 ≈ **100 nF**。`,
          `Idealise the capacitor as two [[top|parallel metal plates]] of area A, a distance d apart. Apply a voltage v: the source pulls electrons off one plate and pushes them onto [[bot|the other]], so the top plate holds **+q**, the bottom **−q**, and an [[field|electric field]] appears between them. Charge is proportional to voltage, and the constant is the **capacitance C**:
$$q = C·v$$
Unit: the farad, F = C/V. 1 F is huge; µF (10⁻⁶), nF (10⁻⁹) and pF (10⁻¹²) are common.

C depends on geometry and material:
$$C = \\frac{εA}{d},   ε = ε_r ε_0,   ε_0 = 8.85 pF/m$$
- larger area A → room for more charge;
- smaller gap [[d|d]] → a stronger field for the same voltage, holding more charge;
- the [[dipole|dielectric]] is **polarised** by the field: the charges in its molecules are pulled apart and cancel part of the field, so the same v stores $ε_r$ times more charge.

**With numbers**: air, two 1 cm² plates 1 mm apart: $C = \\frac{8.85×10^{-12} × 10^{-4}}{10^{-3}} ≈ 0.89 pF$ — tiny.
One MLCC layer: $ε_r = 2000$, A = 2 mm × 1.2 mm, d = 5 µm: $C = \\frac{8.85×10^{-12} × 2000 × 2.4×10^{-6}}{5×10^{-6}} ≈ 8.5 nF$; 12 layers in parallel ≈ **100 nF**.`,
        ),
        formulas: [
          { tex: 'q = C·v', note: tr('定义：每伏电压存多少库仑', 'definition: coulombs stored per volt') },
          { tex: 'C = \\frac{ε_r ε_0 A}{d}', note: tr('平行板；MLCC 再乘层数', 'parallel plates; times the number of layers for an MLCC') },
        ],
      },
      {
        id: 'didt',
        short: 'i = C dv/dt',
        title: tr('④ i = C dv/dt：电流只看电压变化得多快', '④ i = C dv/dt: current depends on how fast the voltage changes'),
        body: tr(
          `对 $q = Cv$ 两边对时间求导，左边 $\\frac{dq}{dt}$ 就是流进极板的电流：
$$i = C\\frac{dv}{dt}$$
（关联参考方向：电流从 + 端流入）。这是电容 **唯一** 的 V–I 关系，三个推论都从这里来：

1. [[flat|电压不变 → 电流为 0]]。直流稳态下电容就是 **断路**（open circuit）。
2. [[u|电压匀速上升]] → 电流恒定：100 nF 在 1 ms 内从 0 升到 5 V，$i = 100 nF × \\frac{5 V}{1 ms} = 0.5 mA$。下降得快一倍（0.5 ms），[[i|电流就是 −1 mA]]（反向流出）。
3. **电容电压不能跳变**：要在 0 秒内改变电压，需要无穷大的电流。所以开关动作的瞬间 $v_C(0^+) = v_C(0^-)$——这是一阶电路“三要素法”的出发点。

**储存的能量**：功率 $p = vi = Cv\\frac{dv}{dt}$，从 0 充到 V 积分：
$$W = ∫_{0}^{V} Cv dv = \\frac{1}{2}CV^{2}$$
- 100 nF 充到 5 V：$\\frac{1}{2} × 10^{-7} × 25 = 1.25 µJ$；
- 1000 µF 充到 9 V：$\\frac{1}{2} × 10^{-3} × 81 = 40.5 mJ$——足够让 LED 亮好几秒（呼吸灯实验）。

能量存在两板之间的 **电场** 里，不是“存了电流”。理想电容不消耗能量，只是借进来、再还回去。`,
          `Differentiate $q = Cv$ with respect to time; $\\frac{dq}{dt}$ on the left is the current into the plate:
$$i = C\\frac{dv}{dt}$$
(passive sign convention: current enters at +). This is the capacitor’s **only** V–I law, and three consequences follow:

1. [[flat|Constant voltage → zero current]]. In DC steady state a capacitor is an **open circuit**.
2. [[u|A voltage ramping steadily]] → a constant current: 100 nF going from 0 to 5 V in 1 ms needs $i = 100 nF × \\frac{5 V}{1 ms} = 0.5 mA$. Coming down twice as fast (0.5 ms) gives [[i|−1 mA]] (flowing out).
3. **A capacitor’s voltage cannot jump**: changing it in zero time would need infinite current. So at a switching instant $v_C(0^+) = v_C(0^-)$ — the starting point of the three-element method for first-order circuits.

**Stored energy**: the power is $p = vi = Cv\\frac{dv}{dt}$; integrate from 0 to V:
$$W = ∫_{0}^{V} Cv dv = \\frac{1}{2}CV^{2}$$
- 100 nF at 5 V: $\\frac{1}{2} × 10^{-7} × 25 = 1.25 µJ$;
- 1000 µF at 9 V: $\\frac{1}{2} × 10^{-3} × 81 = 40.5 mJ$ — enough to keep an LED lit for seconds (the breathing-LED lab).

The energy sits in the **electric field** between the plates — the capacitor does not "store current". An ideal capacitor dissipates nothing; it borrows energy and gives it back.`,
        ),
        formulas: [
          { tex: 'i = C\\frac{dv}{dt}', note: tr('直流稳态：dv/dt = 0 → i = 0（断路）', 'DC steady state: dv/dt = 0 → i = 0 (open)') },
          { tex: 'W = \\frac{1}{2}CV^{2}', note: tr('1000 µF、9 V：40.5 mJ', '1000 µF at 9 V: 40.5 mJ') },
        ],
      },
      {
        id: 'rc',
        short: tr('RC 充电', 'RC charge'),
        title: tr('⑤ 通过电阻充电：τ = RC，1τ 走完 63%', '⑤ Charging through a resistor: τ = RC, 63 % after 1τ'),
        body: tr(
          `RC 方波实验（exp3-rc-square-charging）：[[src|信号发生器]]（内阻 50 Ω）→ [[r|10 kΩ]] → [[c|100 nF]] → GND，方波在 0 和 5 V 之间跳。

**推导**（方波刚跳到 5 V，电容从 0 V 开始）：
1. KVL：$V = Ri + v_C$；
2. 代入 $i = C\\frac{dv_C}{dt}$：$RC\\frac{dv_C}{dt} + v_C = V$，一阶线性微分方程；
3. 初值 $v_C(0) = 0$（电压不能跳），终值 $v_C(∞) = V$（充满后 i = 0），解是：
$$v_C(t) = V(1 - e^{-t/τ}),   τ = RC$$
4. 电流 $i = \\frac{V - v_C}{R} = \\frac{V}{R}e^{-t/τ}$：[[ic|一开始最大]]（0.5 mA），然后指数衰减。开始瞬间电容像 **短路**，充满后像 **断路**。

**τ（time constant，时间常数）** 的意义：
- [[tau|t = τ]]：$1 - e^{-1} = 63%$，到 3.16 V；
- t = 3τ：95%；t = 5τ：99.3%，工程上算“充满”；
- [[tangent|起点的切线]] 恰好在 t = τ 时到达终值。

**带数字**：$τ = (10 kΩ + 50 Ω) × 100 nF ≈ 1.0 ms$。500 Hz 方波半周期 1 ms ≈ 1τ，电容只能充到约 63% 就开始放电；50 Hz 半周期 10 ms = 10τ，每次都充满放空，[[uc|波形是完整的指数曲线]]；5 kHz 半周期 0.1τ，电容几乎来不及动，输出是一个小三角波。`,
          `The RC square-wave lab (exp3-rc-square-charging): [[src|the generator]] (50 Ω inside) → [[r|10 kΩ]] → [[c|100 nF]] → GND, the square wave jumping between 0 and 5 V.

**Derivation** (the square wave has just jumped to 5 V, the capacitor starts at 0 V):
1. KVL: $V = Ri + v_C$;
2. substitute $i = C\\frac{dv_C}{dt}$: $RC\\frac{dv_C}{dt} + v_C = V$, a first-order linear ODE;
3. initial value $v_C(0) = 0$ (no jump), final value $v_C(∞) = V$ (charged: i = 0); the solution is
$$v_C(t) = V(1 - e^{-t/τ}),   τ = RC$$
4. the current $i = \\frac{V - v_C}{R} = \\frac{V}{R}e^{-t/τ}$ [[ic|starts at its maximum]] (0.5 mA) and decays exponentially. At the first instant the capacitor acts like a **short**; once charged, like an **open**.

What **τ (the time constant)** means:
- [[tau|t = τ]]: $1 - e^{-1} = 63%$, i.e. 3.16 V;
- t = 3τ: 95 %; t = 5τ: 99.3 %, "fully charged" for engineers;
- [[tangent|the tangent at the start]] reaches the final value exactly at t = τ.

**With numbers**: $τ = (10 kΩ + 50 Ω) × 100 nF ≈ 1.0 ms$. At 500 Hz the half-period is 1 ms ≈ 1τ, so the capacitor only reaches about 63 % before discharging; at 50 Hz the half-period is 10 ms = 10τ, it charges and empties fully and [[uc|you see the whole exponential]]; at 5 kHz the half-period is 0.1τ, the capacitor barely moves and the output is a small triangle.`,
        ),
        table: {
          head: ['t', tr('已充到', 'charged to'), tr('5 V 方波时 $v_C$', '$v_C$ with a 5 V step'), tr('电流 i', 'current i')],
          rows: [
            ['0', '0%', '0 V', '0.50 mA'],
            ['1τ = 1 ms', '63%', '3.16 V', '0.18 mA'],
            ['2τ', '86%', '4.32 V', '0.068 mA'],
            ['3τ', '95%', '4.75 V', '0.025 mA'],
            ['5τ', '99.3%', '4.97 V', '0.003 mA'],
          ],
          parts: ['ic', 'tau', 'uc', 'uc', 'uc'],
        },
        formulas: [
          { tex: 'v_C(t) = V(1 - e^{-t/τ}), τ = RC', note: tr('充电；放电时 $v_C$ = V·e^{−t/τ}', 'charging; discharging: $v_C$ = V·e^{−t/τ}') },
          { tex: 'τ = (10 kΩ + 50 Ω) × 100 nF ≈ 1.0 ms' },
        ],
        calcs: ['rc-time-constant', 'rc-charging'],
      },
      {
        id: 'ac',
        short: tr('容抗', 'Reactance'),
        title: tr('⑥ 频率：直流断路，高频短路', '⑥ Frequency: open at DC, a short at high frequency'),
        body: tr(
          `接正弦电压 $v = V_m sin ωt$，代入 $i = C\\frac{dv}{dt}$：
$$i = ωCV_m cos ωt$$
两点结论：
- 电流的幅值是 $ωCV_m$，所以电压幅值 / 电流幅值 = $\\frac{1}{ωC}$，这就是 **capacitive reactance（容抗）**：
$$X_C = \\frac{1}{ωC} = \\frac{1}{2πfC}$$
- cos 比 sin 早 90°：电容的 **电流超前电压 90°**。用相量写：$Z_C = \\frac{1}{jωC}$。

[[xc|容抗和频率成反比]]，在双对数坐标上是一条斜率 −1 的直线。对 100 nF：
- [[pts|50 Hz]]：31.8 kΩ；1 kHz：1.59 kΩ；100 kHz：15.9 Ω；
- [[dc|f → 0（直流）]]：$X_C → ∞$，**断路**；
- [[hf|f 很高]]：$X_C → 0$，接近 **短路**。

这就是电容的两大用途：**隔直流、通交流**（耦合电容 coupling capacitor），以及把高频噪声 **旁路到地**（去耦 / 旁路电容 bypass capacitor，每个芯片电源脚旁边那颗 100 nF）。RC 低通、高通滤波器的截止频率 $f_c = \\frac{1}{2πRC}$ 就是 $X_C = R$ 的那个频率：10 kΩ 和 100 nF 时 $f_c ≈ 159 Hz$。`,
          `Apply a sine $v = V_m sin ωt$ and substitute into $i = C\\frac{dv}{dt}$:
$$i = ωCV_m cos ωt$$
Two conclusions:
- the current amplitude is $ωCV_m$, so voltage amplitude / current amplitude = $\\frac{1}{ωC}$ — the **capacitive reactance**:
$$X_C = \\frac{1}{ωC} = \\frac{1}{2πfC}$$
- cos is 90° ahead of sin: in a capacitor **the current leads the voltage by 90°**. As a phasor: $Z_C = \\frac{1}{jωC}$.

[[xc|Reactance is inversely proportional to frequency]] — a line of slope −1 on log–log axes. For 100 nF:
- [[pts|50 Hz]]: 31.8 kΩ; 1 kHz: 1.59 kΩ; 100 kHz: 15.9 Ω;
- [[dc|f → 0 (DC)]]: $X_C → ∞$, an **open circuit**;
- [[hf|high f]]: $X_C → 0$, nearly a **short**.

Hence the capacitor’s two big jobs: **block DC, pass AC** (the coupling capacitor), and **shunt high-frequency noise to ground** (the bypass / decoupling capacitor — the 100 nF next to every chip’s supply pin). The cut-off of an RC low-pass or high-pass, $f_c = \\frac{1}{2πRC}$, is the frequency where $X_C = R$: about 159 Hz for 10 kΩ and 100 nF.`,
        ),
        table: {
          head: ['f', tr('$X_C$（100 nF）', '$X_C$ (100 nF)'), tr('相当于', 'acts like')],
          rows: [
            [tr('0（直流）', '0 (DC)'), '∞', tr('断路', 'open')],
            ['50 Hz', '31.8 kΩ', tr('大电阻', 'a large resistor')],
            ['159 Hz', '10 kΩ', tr('= R：RC 截止频率', '= R: the RC cut-off')],
            ['1 kHz', '1.59 kΩ', '—'],
            ['100 kHz', '15.9 Ω', tr('接近短路', 'nearly a short')],
          ],
          parts: ['dc', 'pts', 'xc', 'pts', 'hf'],
        },
        formulas: [
          { tex: 'X_C = \\frac{1}{2πfC}', note: tr('电流超前电压 90°；$Z_C$ = 1/(jωC)', 'current leads voltage by 90°; $Z_C$ = 1/(jωC)') },
          { tex: 'f_c = \\frac{1}{2πRC} = \\frac{1}{2π × 10 kΩ × 100 nF} ≈ 159 Hz' },
        ],
        calcs: ['capacitive-reactance', 'rc-cutoff'],
      },
      {
        id: 'real',
        short: tr('局限', 'Limits'),
        title: tr('⑦ 真实电容：ESR、ESL、漏电、极性', '⑦ Real capacitors: ESR, ESL, leakage, polarity'),
        body: tr(
          `真实电容 = 理想 [[cideal|C]] + 三个寄生元件：
- [[esr|ESR（equivalent series resistance，等效串联电阻）]]：引线、电极和电解液的电阻。电解电容约 0.1–1 Ω，陶瓷电容只有几 mΩ。纹波电流流过它会发热：1 A 纹波、0.5 Ω → 0.5 W。
- [[esl|ESL（equivalent series inductance，等效串联电感）]]：引线和卷绕带来的几 nH 到几十 nH。频率高到一定程度（**self-resonance 自谐振**，100 nF 陶瓷约 10–20 MHz），电容反而变成电感。所以去耦时大电容和小电容并联使用。
- [[leak|漏电电阻 $R_leak$]]：介质不是完美的绝缘体。电解电容的漏电流约 0.01CV（1000 µF、9 V 时几十 µA），充满的电解电容放几小时电压就掉下去了。

**[[polarity|电解电容接反]]**：阳极的氧化层被电化学反应还原掉，漏电流变大 → 发热 → 电解液汽化 → 外壳顶部的十字防爆纹 **鼓包、喷液甚至炸开**。几伏的反压就可能开始损坏。

**[[bias|陶瓷电容的直流偏压效应]]**：X7R、Y5V 这类高介电常数陶瓷，加的直流电压越高，$ε_r$ 越小，实际容量可能只剩一半。精确的 RC 定时要用 C0G（NP0）陶瓷或薄膜电容。

**仿真器里**：电容是 **理想电容**——没有 ESR、ESL、漏电，也 **不区分电解电容的极性**（接反不会报错）。只有直流电源时它按断路处理；有信号发生器或 PWM 时按时域仿真。真实搭电路时，电解电容一定要按极性插。`,
          `A real capacitor = an ideal [[cideal|C]] + three parasitics:
- [[esr|ESR (equivalent series resistance)]]: the resistance of the leads, electrodes and electrolyte. About 0.1–1 Ω for an electrolytic, a few mΩ for a ceramic. Ripple current through it makes heat: 1 A ripple in 0.5 Ω is 0.5 W.
- [[esl|ESL (equivalent series inductance)]]: a few to tens of nH from the leads and the winding. Above the **self-resonant frequency** (about 10–20 MHz for a 100 nF ceramic) the capacitor behaves like an inductor — which is why decoupling pairs a big and a small capacitor in parallel.
- [[leak|leakage resistance $R_leak$]]: the dielectric is not a perfect insulator. An electrolytic leaks about 0.01CV (tens of µA for 1000 µF at 9 V), so a charged one loses its voltage over hours.

**[[polarity|An electrolytic in backwards]]**: the anode’s oxide is chemically stripped, leakage rises → heat → the electrolyte boils → the cross-scored vent on top **bulges, sprays, or bursts**. Even a few volts reversed can start the damage.

**[[bias|DC-bias effect in ceramics]]**: in high-$ε_r$ ceramics like X7R and Y5V, $ε_r$ falls as the DC voltage rises; the real capacitance can drop to half. For precise RC timing use C0G (NP0) ceramic or film capacitors.

**In the simulator** capacitors are **ideal** — no ESR, ESL or leakage, and **no electrolytic polarity** (a reversed one raises no error). With only DC sources it is treated as open; with a generator or PWM the board runs in the time domain. On a real board, always insert electrolytics the right way round.`,
        ),
        table: {
          head: [tr('参数', 'Parameter'), tr('陶瓷 100 nF', 'Ceramic 100 nF'), tr('电解 1000 µF', 'Electrolytic 1000 µF'), tr('仿真器', 'Simulator')],
          rows: [
            ['ESR', tr('几 mΩ', 'a few mΩ'), '0.1–1 Ω', '0'],
            ['ESL', '≈ 1–5 nH', '≈ 10–20 nH', '0'],
            [tr('漏电', 'leakage'), tr('nA', 'nA'), tr('几十 µA', 'tens of µA'), '0'],
            [tr('误差', 'tolerance'), '±10%', '±20%', '0'],
            [tr('极性', 'polarity'), tr('无', 'none'), tr('有，接反会坏', 'yes; reversed = damaged'), tr('不检查', 'not checked')],
          ],
          parts: ['esr', 'esl', 'leak', 'cideal', 'polarity'],
        },
        formulas: [
          {
            tex: 'f_{SRF} = \\frac{1}{2π\\sqrt{ESL·C}}',
            note: tr('100 nF、1 nH：≈ 16 MHz。高于它电容就成了电感', '100 nF, 1 nH: ≈ 16 MHz. Above it the capacitor acts as an inductor'),
          },
        ],
      },
    ],
    recap: tr(
      '电容 = 两块极板夹一层介质：$q = Cv$，$C = \\frac{εA}{d}$。它的全部行为是 $i = C\\frac{dv}{dt}$：电压不能跳变，直流稳态断路，储能 $\\frac{1}{2}CV^{2}$；经电阻充电按 $τ = RC$ 指数变化（1τ 63%，5τ 充满）；交流下 $X_C = \\frac{1}{2πfC}$，频率越高越接近短路。真实电容有 ESR、漏电，电解电容有极性——仿真器都不管，你得管。',
      'A capacitor is two plates and a dielectric: $q = Cv$, $C = \\frac{εA}{d}$. All it does is $i = C\\frac{dv}{dt}$: its voltage cannot jump, it is open in DC steady state, it stores $\\frac{1}{2}CV^{2}$; charged through R it follows $τ = RC$ (63 % at 1τ, full at 5τ); for AC $X_C = \\frac{1}{2πfC}$, nearer a short the higher the frequency. Real ones have ESR and leakage, and electrolytics have polarity — the simulator ignores these, you must not.',
    ),
  };
}
