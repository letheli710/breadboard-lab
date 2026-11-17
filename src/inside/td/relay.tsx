// Teardown: the 5 V electromagnetic relay (SRD-05VDC). Outside and pins (coil1, coil2, COM, NC,
// NO) → X-ray side view (coil, iron core, yoke, armature, spring, contacts) → energised: the
// magnetic circuit pulls the armature, COM moves to NO → pull-in / drop-out hysteresis (the
// simulator's 53 mA / 7 mA) → equivalent circuit (coil = L + R, contacts = switch) and the coil
// current's rise → why switching the coil off makes a spike (u = L di/dt) → the flyback diode.

import './power.css';
import { tr } from '../../core/i18n';
import { sub, vis } from '../TeardownView';
import type { Teardown } from '../types';

function Res({ x1, y1, x2, y2, part }: { x1: number; y1: number; x2: number; y2: number; part?: string }) {
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
  return <polyline points={pts.join(' ')} className="oa-wire" data-part={part} />;
}

/** inductor: four bumps along a vertical line from (x, y1) to (x, y2) */
function Ind({ x, y1, y2, part }: { x: number; y1: number; y2: number; part?: string }) {
  const n = 4;
  const h = (y2 - y1) / n;
  let d = `M${x} ${y1}`;
  for (let k = 0; k < n; k++) d += ` a ${h / 2} ${h / 2} 0 0 1 0 ${h}`;
  return <path d={d} className="oa-wire" data-part={part} />;
}

function Gnd({ x, y, part }: { x: number; y: number; part?: string }) {
  return (
    <g className="oa-wire" data-part={part}>
      <line x1={x - 12} y1={y} x2={x + 12} y2={y} />
      <line x1={x - 7} y1={y + 5} x2={x + 7} y2={y + 5} />
      <line x1={x - 3} y1={y + 10} x2={x + 3} y2={y + 10} />
    </g>
  );
}

/* --------------------------------------------------------------- layer 0: outside and pins */

function Outside({ layer }: { layer: number }) {
  const X = (c: number) => 190 + c * 60;
  const pins: [string, number, number, string][] = [
    ['coil1', X(0), 312, 'coil1'],
    ['coil2', X(3), 312, 'coil2'],
    ['COM', X(0), 372, 'com'],
    ['NC', X(2), 372, 'nc'],
    ['NO', X(3), 372, 'no'],
  ];
  return (
    <g className={vis(layer, 0, 0)}>
      <rect x={150} y={50} width={260} height={180} rx={8} fill="#2f6fd0" stroke="#173f80" strokeWidth={2} data-part="case" />
      <text x={280} y={96} textAnchor="middle" className="pw-on-dark" fontSize={16}>
        SRD-05VDC-SL-C
      </text>
      <text x={280} y={130} textAnchor="middle" className="pw-on-dark" fontSize={12}>
        10A 250VAC · 10A 30VDC
      </text>
      <g data-part="coil-spec">
        <rect x={210} y={150} width={140} height={28} rx={4} fill="#173f80" />
        <text x={280} y={169} textAnchor="middle" className="pw-on-dark" fontSize={13}>
          {tr('线圈 5 V DC', 'coil 5 V DC')}
        </text>
      </g>
      <text x={280} y={206} textAnchor="middle" className="pw-on-dark" fontSize={11}>
        {tr('触点额定', 'contact rating')} ↑ · {tr('线圈电压', 'coil voltage')} ↑
      </text>
      {/* footprint on the breadboard (bottom view) */}
      <text x={280} y={266} textAnchor="middle" className="td-small" fontWeight={700}>
        {tr('脚位（模拟器里的插法，跨凹槽）', 'pins (as placed in the simulator, across the trench)')}
      </text>
      <rect x={150} y={280} width={260} height={124} rx={8} fill="#f2ede2" stroke="#b8ab8f" />
      <rect x={154} y={330} width={252} height={22} fill="#e2dacb" />
      <text x={146} y={316} textAnchor="end" className="pw-tiny">
        e
      </text>
      <text x={146} y={376} textAnchor="end" className="pw-tiny">
        f
      </text>
      {[0, 1, 2, 3].map((c) => (
        <text key={c} x={X(c)} y={420} textAnchor="middle" className="pw-tiny">
          {c === 0 ? 'c' : `c+${c}`}
        </text>
      ))}
      {pins.map(([name, x, y, part]) => (
        <g key={name} data-part={part}>
          <circle cx={x} cy={y} r={8} fill="#c9ccd1" stroke="#555" strokeWidth={1.5} />
          <text x={x + 12} y={y + (y < 340 ? -8 : 20)} className="oa-lbl">
            {name}
          </text>
        </g>
      ))}
    </g>
  );
}

/* --------------------------------------------------------------- layers 1–2: x-ray side view */

const PIV = { x: 260, y: 140 };

function Mechanism({ layer }: { layer: number }) {
  const on = layer >= 2;
  const ang = on ? -2 : 6;
  return (
    <g className={vis(layer, 1, 2)}>
      <rect x={30} y={40} width={500} height={370} rx={10} fill="rgba(47,111,208,0.06)" stroke="#2f6fd0" strokeDasharray="6 4" />
      <text x={40} y={60} className="td-small">
        {tr('外壳（透明）', 'case (transparent)')}
      </text>
      {/* yoke (L-shaped iron) */}
      <path d="M100 330 L100 350 L270 350 L270 152 L250 152 L250 330 Z" fill="#7d8088" stroke="#4a4c53" data-part="yoke" />
      {/* core and coil */}
      <rect x={100} y={156} width={34} height={174} fill="#8e9199" stroke="#4a4c53" data-part="core" />
      <g data-part="coil">
        <rect x={74} y={176} width={86} height={140} rx={6} fill={on ? '#e2a23a' : '#c98a1a'} stroke="#7a4f08" />
        {Array.from({ length: 12 }, (_, k) => (
          <line key={k} x1={74} y1={186 + k * 11} x2={160} y2={186 + k * 11} stroke="#7a4f08" strokeWidth={1} />
        ))}
      </g>
      {/* coil leads to the pins */}
      <path d="M80 316 L80 400" className="oa-wire" data-part="coil1" />
      <path d="M154 316 L154 380 L200 380 L200 400" className="oa-wire" data-part="coil2" />
      <text x={80} y={424} textAnchor="middle" className="oa-lbl" data-part="coil1">
        coil1
      </text>
      <text x={200} y={424} textAnchor="middle" className="oa-lbl" data-part="coil2">
        coil2
      </text>
      {/* fixed contacts */}
      <g data-part="no">
        <rect x={420} y={112} width={60} height={14} fill="#c9a227" />
        <path d="M480 119 L500 119 L500 400" className="oa-wire" />
        <text x={500} y={424} textAnchor="middle" className="oa-lbl">
          NO
        </text>
      </g>
      <g data-part="nc">
        <rect x={420} y={166} width={60} height={14} fill="#c9a227" />
        <path d="M470 180 L470 400" className="oa-wire" />
        <text x={462} y={424} textAnchor="end" className="oa-lbl">
          NC
        </text>
      </g>
      {/* armature + moving blade, pivoting at the yoke corner */}
      <g transform={`rotate(${ang} ${PIV.x} ${PIV.y})`} style={{ transition: 'transform 0.45s ease' }}>
        <rect x={90} y={134} width={176} height={12} rx={2} fill="#6b6e75" stroke="#3a3c42" data-part="armature" />
        <path d={`M${PIV.x} ${PIV.y} L440 ${PIV.y}`} stroke="#c9a227" strokeWidth={5} data-part="com" />
        <circle cx={440} cy={PIV.y} r={8} fill="#e0b84a" stroke="#7d6510" data-part="com" />
        <path d="M350 144 l8 6 l-16 6 l16 6 l-16 6 l16 6 l-16 6 l8 6" stroke="#4a4c53" strokeWidth={1.8} fill="none" data-part="spring" />
      </g>
      <path d="M350 186 L350 210" stroke="#4a4c53" strokeWidth={1.8} data-part="spring" />
      <rect x={336} y={210} width={28} height={6} fill="#4a4c53" data-part="spring" />
      <circle cx={PIV.x} cy={PIV.y} r={5} fill="#1f2a44" data-part="pivot" />
      {/* COM: flexible lead from the pivot */}
      <path d={`M${PIV.x} ${PIV.y + 4} C 300 240, 310 300, 320 400`} className="oa-wire" style={{ stroke: '#b8901a' }} data-part="com" />
      <text x={320} y={424} textAnchor="middle" className="oa-lbl" data-part="com">
        COM
      </text>
      {/* layer 2: flux and current */}
      <g className={vis(layer, 2, 2)}>
        <path d="M117 300 L117 150 Q 120 128 160 136 L 252 136 Q 260 140 260 160 L260 340 L117 340 Z" className="pw-flux" data-part="flux" />
        <text x={190} y={378} textAnchor="middle" className="pw-lbl-purple" fontSize={12} data-part="flux">
          {tr('磁通 Φ：铁芯 → 衔铁 → 轭铁', 'flux Φ: core → armature → yoke')}
        </text>
        <path d="M60 330 L60 200" className="oa-cur" markerEnd="url(#ry-ah-i)" data-part="icoil" />
        <text x={54} y={270} textAnchor="end" className="pw-lbl-amber" fontSize={12} data-part="icoil">
          I
        </text>
        <text x={440} y={92} textAnchor="middle" className="pw-lbl-green" fontSize={12} data-part="no">
          {tr('COM–NO 接通', 'COM–NO closed')}
        </text>
      </g>
      <text x={440} y={212} textAnchor="middle" className={`pw-lbl-green ${on ? 'td-hide' : 'td-show'}`} fontSize={12} data-part="nc">
        {tr('COM–NC 接通', 'COM–NC closed')}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layer 3: hysteresis */

function Hysteresis({ layer }: { layer: number }) {
  const x = (mA: number) => 80 + mA * 5.4; // 0..80 mA
  const yOff = 300;
  const yOn = 160;
  return (
    <g className={vis(layer, 3, 3)}>
      <rect x={20} y={40} width={520} height={380} rx={14} className="td-panel" />
      <text x={280} y={66} textAnchor="middle" className="td-panel-title">
        {tr('触点状态 vs 线圈电流：吸合 53 mA，释放 7 mA', 'Contacts vs coil current: pull-in 53 mA, drop-out 7 mA')}
      </text>
      <line x1={x(0)} y1={340} x2={x(80) + 10} y2={340} className="oa-axis" />
      <line x1={x(0)} y1={340} x2={x(0)} y2={120} className="oa-axis" />
      <text x={x(0) - 8} y={yOff + 4} textAnchor="end" className="td-small">
        {tr('释放', 'released')}
      </text>
      <text x={x(0) - 8} y={yOn + 4} textAnchor="end" className="td-small">
        {tr('吸合', 'pulled in')}
      </text>
      {[0, 20, 40, 60, 80].map((m) => (
        <text key={m} x={x(m)} y={358} textAnchor="middle" className="pw-tiny">
          {m}
        </text>
      ))}
      <text x={x(80)} y={378} textAnchor="end" className="oa-lbl">
        {sub(tr('线圈电流 I_coil (mA)', 'coil current I_coil (mA)'))}
      </text>
      {/* rising path */}
      <path d={`M${x(0)} ${yOff} L${x(53)} ${yOff} L${x(53)} ${yOn} L${x(78)} ${yOn}`} className="pw-curve-red" fill="none" data-part="up" />
      <path d={`M${x(30)} ${yOff} l10 0`} className="pw-curve-red" markerEnd="url(#ry-ah-r)" data-part="up" />
      <path d={`M${x(53)} ${yOff - 50} l0 -12`} className="pw-curve-red" markerEnd="url(#ry-ah-r)" data-part="up" />
      {/* falling path */}
      <path d={`M${x(78)} ${yOn - 4} L${x(7)} ${yOn - 4} L${x(7)} ${yOff - 4} L${x(0)} ${yOff - 4}`} className="pw-curve-blue" fill="none" data-part="down" />
      <path d={`M${x(32)} ${yOn - 4} l-10 0`} className="pw-curve-blue" markerEnd="url(#ry-ah-b)" data-part="down" />
      <path d={`M${x(7)} ${yOn + 60} l0 12`} className="pw-curve-blue" markerEnd="url(#ry-ah-b)" data-part="down" />
      <text x={x(53) + 6} y={yOff + 22} className="pw-lbl-red" fontSize={12} data-part="up">
        {tr('吸合 53 mA（3.7 V）', 'pull-in 53 mA (3.7 V)')}
      </text>
      <text x={x(7) + 6} y={yOn + 30} className="pw-lbl-blue" fontSize={12} data-part="down">
        {tr('释放 7 mA（0.5 V）', 'drop-out 7 mA (0.5 V)')}
      </text>
      <g data-part="op">
        <line x1={x(65)} y1={yOn} x2={x(65)} y2={340} className="oa-dash" />
        <circle cx={x(65)} cy={yOn} r={6} className="pw-pt" />
        <text x={x(65)} y={yOn - 16} textAnchor="middle" className="td-small" fontWeight={700}>
          {tr('实验 288：≈ 65 mA', 'lab 288: ≈ 65 mA')}
        </text>
      </g>
      <text x={x(30)} y={yOff - 70} textAnchor="middle" className="pw-lbl-purple" fontSize={12} data-part="band">
        {tr('7–53 mA：保持原状态', '7–53 mA: keeps its state')}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layer 4: equivalent circuit */

function Model({ layer }: { layer: number }) {
  const t = (ms: number) => 300 + ms * 22; // 0..10 ms
  const yi = (mA: number) => 400 - mA * 1.9; // 0..70 mA
  const tau = 0.15 / 70;
  const I0 = 65.7;
  return (
    <g className={vis(layer, 4, 4)}>
      {/* coil model */}
      <rect x={30} y={60} width={140} height={250} rx={10} className="pw-dashbox" />
      <text x={100} y={52} textAnchor="middle" className="oa-lbl">
        {tr('线圈', 'coil')}
      </text>
      <line x1={80} y1={60} x2={80} y2={80} className="oa-wire" />
      <Ind x={80} y1={80} y2={170} part="lcoil" />
      <text x={100} y={130} className="oa-lbl" data-part="lcoil">
        L = 150 mH
      </text>
      <line x1={80} y1={170} x2={80} y2={190} className="oa-wire" />
      <Res x1={80} y1={190} x2={80} y2={270} part="rcoil" />
      <text x={96} y={236} className="oa-lbl" data-part="rcoil">
        R = 70 Ω
      </text>
      <line x1={80} y1={270} x2={80} y2={310} className="oa-wire" />
      <circle cx={80} cy={60} r={4} className="oa-term" />
      <circle cx={80} cy={310} r={4} className="oa-term" />
      <text x={72} y={78} textAnchor="end" className="pw-tiny" fontWeight={700}>
        coil1
      </text>
      <text x={72} y={302} textAnchor="end" className="pw-tiny" fontWeight={700}>
        coil2
      </text>
      {/* contacts */}
      <g data-part="contacts">
        <circle cx={226} cy={190} r={4} className="oa-term" />
        <line x1={226} y1={190} x2={272} y2={214} className="oa-wire" style={{ strokeWidth: 2.5 }} />
        <circle cx={276} cy={150} r={4} className="oa-term" />
        <circle cx={276} cy={220} r={4} className="oa-term" />
        <text x={226} y={176} textAnchor="middle" className="pw-tiny" fontWeight={700}>
          COM
        </text>
        <text x={284} y={154} className="pw-tiny" fontWeight={700}>
          NO
        </text>
        <text x={284} y={224} className="pw-tiny" fontWeight={700}>
          NC
        </text>
      </g>
      <path d="M170 190 L220 190" className="oa-dash" style={{ strokeWidth: 2 }} data-part="link" />
      <text x={226} y={260} textAnchor="middle" className="pw-tiny" data-part="link">
        {tr('机械联动', 'mechanical link')}
      </text>
      <text x={226} y={276} textAnchor="middle" className="pw-tiny" data-part="link">
        {tr('电气隔离', 'electrically isolated')}
      </text>
      <text x={160} y={350} textAnchor="middle" className="td-small" fontWeight={700} data-part="contacts">
        {tr('触点：接通 0.05 Ω，断开 ∞', 'contacts: 0.05 Ω closed, open otherwise')}
      </text>

      {/* coil current rising */}
      <line x1={t(0)} y1={yi(0)} x2={t(10) + 6} y2={yi(0)} className="oa-axis" />
      <line x1={t(0)} y1={yi(0)} x2={t(0)} y2={yi(75)} className="oa-axis" />
      <text x={t(0) + 6} y={yi(75)} className="oa-lbl">
        {sub('i_L')} (mA)
      </text>
      <text x={t(10)} y={yi(0) + 30} textAnchor="end" className="pw-tiny" fontWeight={700}>
        t (ms)
      </text>
      {[0, 2, 4, 6, 8, 10].map((m) => (
        <text key={m} x={t(m)} y={yi(0) + 14} textAnchor="middle" className="pw-tiny">
          {m}
        </text>
      ))}
      <path
        d={`M${t(0)} ${yi(0)} ${Array.from({ length: 50 }, (_, k) => {
          const ms = (k + 1) * 0.2;
          return `L${t(ms)} ${yi(I0 * (1 - Math.exp(-ms / 1000 / tau)))}`;
        }).join(' ')}`}
        className="pw-curve-blue"
        data-part="rise"
      />
      <line x1={t(0)} y1={yi(I0)} x2={t(10)} y2={yi(I0)} className="oa-dash" />
      <text x={t(10)} y={yi(I0) - 6} textAnchor="end" className="pw-tiny" fontWeight={700}>
        65.7 mA
      </text>
      <line x1={t(0)} y1={yi(53)} x2={t(10)} y2={yi(53)} className="pw-curve-red" style={{ strokeWidth: 1.2 }} strokeDasharray="4 3" />
      <text x={t(10)} y={yi(53) + 14} textAnchor="end" className="pw-lbl-red" fontSize={10}>
        {tr('吸合 53 mA', 'pull-in 53 mA')}
      </text>
      <g data-part="tpull">
        <line x1={t(3.5)} y1={yi(53)} x2={t(3.5)} y2={yi(0)} className="oa-dash" />
        <circle cx={t(3.5)} cy={yi(53)} r={5} className="pw-pt" />
        <text x={t(3.5) + 8} y={yi(20)} className="td-small" fontWeight={700}>
          3.5 ms
        </text>
      </g>
      <g data-part="tau">
        <line x1={t(2.14)} y1={yi(I0 * 0.632)} x2={t(2.14)} y2={yi(0)} className="oa-dash" />
        <text x={t(2.14) - 4} y={yi(8)} textAnchor="end" className="pw-lbl-purple" fontSize={11}>
          τ
        </text>
      </g>
      <text x={420} y={160} textAnchor="middle" className="td-small" fontWeight={700} data-part="rise">
        {sub('i_L')}(t) = 65.7 mA × (1 − e
        <tspan baselineShift="super" fontSize="0.75em">
          −t/τ
        </tspan>
        )
      </text>
      <text x={420} y={182} textAnchor="middle" className="td-small" data-part="tau">
        τ = L/R = 2.14 ms
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layers 5–6: spike and diode */

function Driver({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 5)}>
      <line x1={60} y1={70} x2={250} y2={70} className="oa-wire plus" style={{ strokeWidth: 3 }} />
      <text x={60} y={60} className="pw-lbl-red" fontSize={13}>
        +5 V
      </text>
      <rect x={110} y={88} width={80} height={170} rx={8} className="pw-dashbox" />
      <line x1={150} y1={70} x2={150} y2={100} className="oa-wire" />
      <Ind x={150} y1={100} y2={170} part="lcoil" />
      <line x1={150} y1={170} x2={150} y2={184} className="oa-wire" />
      <Res x1={150} y1={184} x2={150} y2={244} part="rcoil" />
      <line x1={150} y1={244} x2={150} y2={280} className="oa-wire" />
      <text x={104} y={140} textAnchor="end" className="pw-tiny" fontWeight={700} data-part="lcoil">
        150 mH
      </text>
      <text x={104} y={218} textAnchor="end" className="pw-tiny" fontWeight={700} data-part="rcoil">
        70 Ω
      </text>
      <text x={196} y={104} className="pw-tiny" fontWeight={700}>
        K1
      </text>
      <circle cx={150} cy={280} r={4} className="oa-term" data-part="vc" />
      <text x={142} y={278} textAnchor="end" className="pw-lbl-purple" fontSize={12} data-part="vc">
        {sub('V_C')}
      </text>
      {/* NPN */}
      <g data-part="q1">
        <circle cx={150} cy={318} r={22} className="oa-src" />
        <line x1={140} y1={305} x2={140} y2={331} className="oa-wire" style={{ strokeWidth: 3 }} />
        <line x1={140} y1={311} x2={150} y2={296} className="oa-wire" />
        <line x1={140} y1={325} x2={150} y2={340} className="oa-wire" markerEnd="url(#ry-ah)" />
        <line x1={150} y1={280} x2={150} y2={296} className="oa-wire" />
        <text x={178} y={322} className="pw-tiny" fontWeight={700}>
          Q1
        </text>
      </g>
      <line x1={150} y1={340} x2={150} y2={370} className="oa-wire" />
      <Gnd x={150} y={370} />
      <line x1={100} y1={318} x2={140} y2={318} className="oa-wire" />
      <Res x1={50} y1={318} x2={100} y2={318} part="rb" />
      <line x1={30} y1={318} x2={50} y2={318} className="oa-wire" />
      <circle cx={30} cy={318} r={4} className="oa-term" />
      <text x={30} y={344} className="pw-tiny" fontWeight={700}>
        GPIO
      </text>
      <text x={75} y={304} textAnchor="middle" className="pw-tiny">
        1 kΩ
      </text>
      {/* flyback diode (layer 6) */}
      <g className={vis(layer, 6)} data-part="diode">
        <path d="M150 280 L230 280 L230 190" className="oa-wire" />
        <polygon points="218,190 242,190 230,170" fill="#1f2a44" />
        <line x1={216} y1={168} x2={244} y2={168} className="oa-wire" style={{ strokeWidth: 3 }} />
        <path d="M230 168 L230 70" className="oa-wire" />
        <text x={248} y={184} className="oa-lbl">
          D1
        </text>
      </g>
      <g className={vis(layer, 6)} data-part="loop">
        <path d="M164 110 L164 266 L216 266 L216 86 L164 86 L164 104" fill="none" stroke="#c98a1a" strokeWidth={2.4} strokeDasharray="6 4" markerEnd="url(#ry-ah-i)" />
        <text x={190} y={404} textAnchor="middle" className="pw-lbl-amber" fontSize={11}>
          {tr('断电后电流在小回路里转圈', 'after turn-off the current circulates')}
        </text>
        <text x={190} y={420} textAnchor="middle" className="pw-lbl-amber" fontSize={11}>
          {tr('线圈 → D1 → 线圈', 'coil → D1 → coil')}
        </text>
      </g>
      <text x={190} y={404} textAnchor="middle" className={`pw-lbl-red ${layer === 5 ? 'td-show' : 'td-hide'}`} fontSize={11}>
        {tr('没有 D1：电流无路可走', 'no D1: the current has nowhere to go')}
      </text>
    </g>
  );
}

function Wave({ layer }: { layer: number }) {
  const x = (ms: number) => 300 + ms * 22; // 0..10 ms
  const y = (v: number) => 360 - v * 8.5; // 0..32 V
  const diode = layer >= 6;
  const tau = 2.14;
  const pts: string[] = [`${x(0)},${y(0.1)}`, `${x(2)},${y(0.1)}`];
  if (diode) {
    for (let k = 0; k <= 40; k++) {
      const ms = 2 + k * 0.2;
      const i = Math.exp(-(ms - 2) / tau);
      pts.push(`${x(ms)},${y(5 + (i > 0.05 ? 0.7 : 0.7 * (i / 0.05)))}`);
    }
  } else {
    pts.push(
      `${x(2)},${y(29)}`,
      `${x(2.15)},${y(29)}`,
      `${x(2.3)},${y(3)}`,
      `${x(2.45)},${y(7)}`,
      `${x(2.6)},${y(4.4)}`,
      `${x(2.8)},${y(5.2)}`,
      `${x(3.1)},${y(5)}`,
      `${x(10)},${y(5)}`,
    );
  }
  if (diode) pts.push(`${x(10)},${y(5)}`);
  return (
    <g className={vis(layer, 5)}>
      <text x={410} y={52} textAnchor="middle" className="tdp-big">
        {sub(tr('集电极电压 V_C（GPIO 在 2 ms 时关断）', 'Collector voltage V_C (GPIO off at 2 ms)'))}
      </text>
      <line x1={x(0)} y1={y(0)} x2={x(10) + 6} y2={y(0)} className="oa-axis" />
      <line x1={x(0)} y1={y(0)} x2={x(0)} y2={y(32)} className="oa-axis" />
      {[0, 5, 10, 20, 30].map((v) => (
        <text key={v} x={x(0) - 6} y={y(v) + 4} textAnchor="end" className="pw-tiny">
          {v}
        </text>
      ))}
      <text x={x(10)} y={y(0) + 18} textAnchor="end" className="pw-tiny" fontWeight={700}>
        t (ms)
      </text>
      <line x1={x(0)} y1={y(5)} x2={x(10)} y2={y(5)} className="oa-dash" />
      <text x={x(10)} y={y(5) + 14} textAnchor="end" className="pw-tiny">
        +5 V
      </text>
      <polyline points={pts.join(' ')} className={diode ? 'pw-curve-green' : 'pw-curve-red'} data-part="vc" />
      <g className={vis(layer, 5, 5)} data-part="spike">
        <text x={x(2.4)} y={y(29) + 4} className="pw-lbl-red" fontSize={12}>
          {tr('尖峰 ≈ 29 V（仿真）', 'spike ≈ 29 V (simulator)')}
        </text>
        <text x={x(2.4)} y={y(29) + 20} className="td-small">
          {tr('真实：直到 Q1 击穿（≈ 40 V）', 'real: up to Q1 breakdown (≈ 40 V)')}
        </text>
        <line x1={x(0)} y1={y(29)} x2={x(2)} y2={y(29)} className="oa-dash" />
      </g>
      <g className={vis(layer, 6)} data-part="clamp">
        <line x1={x(0)} y1={y(5.7)} x2={x(10)} y2={y(5.7)} className="pw-curve-green" style={{ strokeWidth: 1.2 }} strokeDasharray="4 3" />
        <text x={x(2.6)} y={y(5.7) - 12} className="pw-lbl-green" fontSize={12}>
          {tr('钳在 5 V + 0.7 V = 5.7 V', 'clamped at 5 V + 0.7 V = 5.7 V')}
        </text>
        <text x={x(2.6)} y={y(5.7) - 30} className="td-small">
          {tr('电流按 τ = L/R ≈ 2 ms 衰减', 'the current decays with τ = L/R ≈ 2 ms')}
        </text>
      </g>
      <text x={x(1)} y={y(0.1) - 8} textAnchor="middle" className="pw-tiny" fontWeight={700}>
        {tr('导通 0.1 V', 'on: 0.1 V')}
      </text>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="ry-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pw-ah" />
        </marker>
        <marker id="ry-ah-i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pw-ah-cur" />
        </marker>
        <marker id="ry-ah-r" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#d0343f" />
        </marker>
        <marker id="ry-ah-b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#2b59c3" />
        </marker>
      </defs>
      <Outside layer={layer} />
      <Mechanism layer={layer} />
      <Hysteresis layer={layer} />
      <Model layer={layer} />
      <Driver layer={layer} />
      <Wave layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'relay',
    title: tr('继电器：用小电流控制一个机械开关', 'Relay: a small current flipping a mechanical switch'),
    subtitle: tr(
      'electromagnetic relay（电磁继电器）= 一个电磁铁 + 一个被它拉动的开关。线圈和触点之间只有磁和机械联系，没有电的连接。我们拆开看线圈、iron core（铁芯）、armature（衔铁）、spring（弹簧）和 COM / NO / NC 三个触点；再把线圈当成电感 L + 电阻 R，推出为什么断电会产生高压尖峰，以及 flyback diode（续流二极管）怎样把它钳住。',
      'An electromagnetic relay is an electromagnet plus a switch it pulls. Between the coil and the contacts there is only magnetism and mechanics — no electrical connection. We open it to see the coil, iron core, armature, spring and the COM / NO / NC contacts; then model the coil as an inductor L plus a resistance R, derive why switching it off makes a high-voltage spike, and how a flyback diode clamps it.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'outside',
        short: tr('外形', 'Outside'),
        title: tr('① 外形：蓝色小方块，5 只脚', '① Outside: a small blue cube with 5 pins'),
        body: tr(
          `实验 288 用的是最常见的 5 V 继电器 SRD-05VDC-SL-C。外壳上印着两组数字，意思完全不同：
- [[coil-spec|线圈电压 5 V DC]]：**控制侧**，给线圈加多少伏它才能可靠吸合；
- [[case|触点额定 10 A 250 VAC / 10 A 30 VDC]]：**负载侧**，触点能开关多大的电压和电流。

5 只脚分成两组：两只 [[coil1|线圈脚]]（coil1、coil2，没有正负，但接了续流二极管以后就有了方向），三只 [[com|触点脚]]。模拟器里它横跨凹槽：e 行是两只线圈脚，f 行是 COM、NC、NO。`,
          `Lab 288 uses the most common 5 V relay, the SRD-05VDC-SL-C. Its case carries two sets of numbers that mean very different things:
- [[coil-spec|coil voltage 5 V DC]]: the **control side** — what the coil needs to pull in reliably;
- [[case|contact rating 10 A 250 VAC / 10 A 30 VDC]]: the **load side** — the voltage and current the contacts can switch.

The 5 pins form two groups: two [[coil1|coil pins]] (coil1, coil2 — no polarity of their own, though the flyback diode gives them one) and three [[com|contact pins]]. In the simulator it straddles the trench: row e holds the two coil pins, row f COM, NC and NO.`,
        ),
        table: {
          head: [tr('脚', 'Pin'), tr('属于', 'Side'), tr('含义', 'Meaning'), tr('实验 288 接到', 'Lab 288 goes to')],
          rows: [
            ['coil1', tr('线圈', 'coil'), tr('线圈一端', 'one end of the coil'), tr('开发板 5V 脚', 'the board’s 5V pin')],
            ['coil2', tr('线圈', 'coil'), tr('线圈另一端', 'the other end'), tr('Q1 集电极', 'Q1 collector')],
            ['COM', tr('触点', 'contacts'), tr('公共端 common，跟着衔铁动', 'common, moves with the armature'), tr('9 V 电池 +', '9 V battery +')],
            ['NC', tr('触点', 'contacts'), tr('常闭 normally closed：线圈没电时接 COM', 'normally closed: joined to COM when the coil is off'), tr('不用', 'unused')],
            ['NO', tr('触点', 'contacts'), tr('常开 normally open：线圈有电时接 COM', 'normally open: joined to COM when the coil is on'), '1 kΩ → LED'],
          ],
          parts: ['coil1', 'coil2', 'com', 'nc', 'no'],
        },
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：线圈、铁芯、衔铁、弹簧、触点', '② X-ray: coil, core, armature, spring, contacts'),
        body: tr(
          `把外壳变透明，从侧面看：
- [[coil|线圈]]：几千圈细漆包线，两头就是 coil1、coil2；
- [[core|铁芯]]：线圈中间的软铁柱，和 L 形的 [[yoke|轭铁]] 连在一起；
- [[armature|衔铁]]：一块可以绕 [[pivot|支点]] 转动的铁片，横在铁芯上方，留着一条空气隙；
- 衔铁另一头连着一片弹性铜片，铜片末端是 **动触点**，它通过软导线接到 [[com|COM]]；
- [[spring|弹簧]] 把铜片往下拉，所以没通电时动触点压在下面的 [[nc|NC 静触点]] 上；上面的 [[no|NO 静触点]] 悬空。

这就是“常闭 / 常开”名字的由来：**常（normally）= 线圈不通电时**。`,
          `Make the case transparent and look from the side:
- the [[coil|coil]]: thousands of turns of fine enamelled wire; its two ends are coil1 and coil2;
- the [[core|core]]: a soft-iron post inside the coil, joined to the L-shaped [[yoke|yoke]];
- the [[armature|armature]]: an iron plate that can rock about a [[pivot|pivot]], lying over the core with an air gap;
- the armature's other end carries a springy copper blade; at its tip is the **moving contact**, wired by a flexible lead to [[com|COM]];
- a [[spring|spring]] pulls the blade down, so with no coil current the moving contact rests on the lower [[nc|NC contact]], and the upper [[no|NO contact]] is left open.

That is where the names come from: **normally = with the coil unpowered**.`,
        ),
        callouts: [
          { part: 'armature', label: tr('衔铁', 'armature'), x: 140, y: 136, lx: 60, ly: 100 },
          { part: 'spring', label: tr('弹簧', 'spring'), x: 352, y: 180, lx: 400, ly: 260, anchor: 'start' },
        ],
      },
      {
        id: 'energised',
        short: tr('吸合', 'Pull-in'),
        title: tr('③ 通电：磁力把衔铁拉下来，COM 换到 NO', '③ Energised: the magnet pulls the armature, COM moves to NO'),
        body: tr(
          `给线圈通 [[icoil|电流 I]]：
1. 电流产生磁场，[[core|铁芯]] 把它集中起来，[[flux|磁通 Φ]] 沿着 铁芯 → 空气隙 → [[armature|衔铁]] → [[yoke|轭铁]] 走一圈（一个 **磁路**，magnetic circuit）；
2. 磁通想让磁路的“磁阻”最小，于是把衔铁吸向铁芯，关上空气隙；
3. 衔铁绕支点转动，另一头翘起：动触点离开 NC，压到 [[no|NO]] 上——**COM–NO 接通**；
4. 断电后磁力消失，[[spring|弹簧]] 把它拉回 NC。

力有多大取决于 **安匝数** $N·I$：线圈圈数 N 是固定的，所以吸不吸合取决于 **线圈电流**。实验 288：线圈从开发板 5V 脚取电（USB 5 V 经肖特基二极管约 4.7 V），三极管饱和压降约 0.1 V：
$$I = \\frac{4.7 - 0.1}{70 Ω} ≈ 65 mA$$
比 GPIO 能给的 20 mA 大得多——所以要用三极管驱动。`,
          `Pass a [[icoil|current I]] through the coil:
1. the current makes a magnetic field; the [[core|core]] concentrates it, and the [[flux|flux Φ]] goes round core → air gap → [[armature|armature]] → [[yoke|yoke]] (a **magnetic circuit**);
2. the flux "wants" the least reluctance, so it pulls the armature onto the core and closes the gap;
3. the armature rocks about its pivot, its other end lifts: the moving contact leaves NC and presses on [[no|NO]] — **COM–NO closed**;
4. switch off and the force is gone; the [[spring|spring]] pulls it back to NC.

The force depends on the **ampere-turns** $N·I$: the number of turns N is fixed, so whether it pulls in depends on the **coil current**. Lab 288: the coil runs from the board's 5V pin (USB 5 V through a Schottky ≈ 4.7 V) and the transistor's saturation drop is about 0.1 V:
$$I = \\frac{4.7 - 0.1}{70 Ω} ≈ 65 mA$$
far more than the 20 mA a GPIO can give — hence the transistor driver.`,
        ),
        formulas: [
          {
            tex: 'I_{coil} = \\frac{V_{supply} - V_{CE(sat)}}{R_{coil}}',
            note: tr('稳态时电感相当于导线，只剩线圈电阻', 'in steady state the inductance is a wire; only the winding resistance is left'),
          },
        ],
        calcs: ['ohm'],
      },
      {
        id: 'hysteresis',
        short: tr('回差', 'Hysteresis'),
        title: tr('④ 吸合 53 mA、释放 7 mA：回差', '④ Pull in at 53 mA, drop out at 7 mA: hysteresis'),
        body: tr(
          `模拟器的继电器模型（和真实器件的数据手册一致）：
- 电流从 0 往上加：[[up|到 53 mA 才吸合]]（线圈电压约 $0.053 × 70 = 3.7 V$，数据手册写“吸合电压 ≤ 3.75 V”）；
- 吸合以后电流往下减：[[down|要降到 7 mA 以下才释放]]（约 0.5 V）；
- [[band|7–53 mA 之间]]，它保持原来的状态。

为什么吸合比保持难得多？因为磁力和空气隙有关：吸合前空气隙大，磁阻大，要很大的电流才能拉动衔铁；吸合后空气隙几乎为 0，很小的电流就能吸住。这叫 **hysteresis（回差 / 滞回）**，它有好处：电压在阈值附近抖一抖，触点也不会来回“打架”。

实验 288 的 [[op|65 mA]] 在 53 mA 之上，留了约 20% 余量。如果用 3.3 V 驱动 5 V 继电器：$\\frac{3.3}{70} = 47 mA$ < 53 mA，**吸不动**——所以 3.3 V 系统要买 3 V 线圈的继电器。`,
          `The simulator's relay model (in line with the real part's datasheet):
- raising the current from 0: [[up|it pulls in only at 53 mA]] (coil voltage about $0.053 × 70 = 3.7 V$; the datasheet says "pull-in voltage ≤ 3.75 V");
- once in, lowering the current: [[down|it drops out only below 7 mA]] (about 0.5 V);
- [[band|between 7 and 53 mA]] it keeps whatever state it was in.

Why is pulling in so much harder than holding? Because the force depends on the air gap: before pull-in the gap is wide, the reluctance high, and it takes a lot of current to move the armature; once closed the gap is almost zero and a little current holds it. This is **hysteresis**, and it helps: a voltage wobbling near a threshold won't make the contacts chatter.

Lab 288's [[op|65 mA]] sits above 53 mA with about 20% margin. Drive a 5 V relay from 3.3 V: $\\frac{3.3}{70} = 47 mA$ < 53 mA — **it won't pull in**, which is why 3.3 V systems need a 3 V-coil relay.`,
        ),
        table: {
          head: [tr('参数', 'Parameter'), tr('电流', 'Current'), tr('线圈电压（× 70 Ω）', 'Coil voltage (× 70 Ω)'), tr('意思', 'Meaning')],
          rows: [
            [tr('吸合', 'pull-in'), '53 mA', '3.7 V', tr('超过它才动作', 'must exceed it to operate')],
            [tr('释放', 'drop-out'), '7 mA', '0.5 V', tr('低于它才松开', 'must fall below it to release')],
            [tr('额定', 'nominal'), '71 mA', '5 V', tr('数据手册的工作点', 'the datasheet operating point')],
            [tr('实验 288', 'lab 288'), '≈ 65 mA', '≈ 4.6 V', tr('可靠吸合', 'pulls in reliably')],
          ],
          parts: ['up', 'down', null, 'op'],
        },
      },
      {
        id: 'model',
        short: tr('等效电路', 'Model'),
        title: tr('⑤ 等效电路：线圈 = L + R，触点 = 开关', '⑤ Equivalent circuit: coil = L + R, contacts = a switch'),
        body: tr(
          `电路上，继电器拆成两半，中间只有一条 [[link|虚线（机械联动）]]：
- **线圈** = [[lcoil|电感 L = 150 mH]] 串 [[rcoil|电阻 R = 70 Ω]]（铜线的电阻）；
- **触点** = 一个 [[contacts|单刀双掷开关]]（COM–NO / COM–NC，接通 0.05 Ω），由线圈电流控制。

两半之间 **电气隔离**：控制侧可以是 5 V 的单片机电路，负载侧可以是完全不共地的另一路电源。

线圈是电感，所以电流不能突变。接通 V 的那一刻起，这是一个 RL 一阶电路：
1. KVL：$V = L\\frac{di}{dt} + Ri$
2. 解：$i(t) = \\frac{V}{R}(1 - e^{-t/τ})$，时间常数 $τ = \\frac{L}{R} = \\frac{0.15}{70} = 2.14 ms$
3. [[rise|电流]] 从 0 爬到 65.7 mA；到 [[tpull|53 mA]] 的时间：$t = -τ·ln(1 - \\frac{53}{65.7}) = 2.14 × 1.65 ≈ 3.5 ms$

真实继电器还要再加几毫秒让衔铁“走过去”（动作时间约 5–10 ms）；模拟器 **没有机械时间**，电流到 53 mA 的那一刻触点就换了。`,
          `Electrically the relay splits into two halves joined only by a [[link|dashed line (the mechanical link)]]:
- the **coil** = [[lcoil|an inductance L = 150 mH]] in series with [[rcoil|a resistance R = 70 Ω]] (the copper wire);
- the **contacts** = [[contacts|a single-pole double-throw switch]] (COM–NO / COM–NC, 0.05 Ω closed), controlled by the coil current.

The halves are **electrically isolated**: the control side can be a 5 V microcontroller circuit, the load side a separate supply with no common ground.

The coil is an inductor, so its current can't jump. From the moment V is applied this is a first-order RL circuit:
1. KVL: $V = L\\frac{di}{dt} + Ri$
2. Solution: $i(t) = \\frac{V}{R}(1 - e^{-t/τ})$, time constant $τ = \\frac{L}{R} = \\frac{0.15}{70} = 2.14 ms$
3. The [[rise|current]] climbs from 0 to 65.7 mA; it reaches [[tpull|53 mA]] after $t = -τ·ln(1 - \\frac{53}{65.7}) = 2.14 × 1.65 ≈ 3.5 ms$

A real relay then needs a few more milliseconds for the armature to travel (operate time ≈ 5–10 ms); the simulator has **no mechanical time** — the contacts change the moment the current reaches 53 mA.`,
        ),
        table: {
          head: [tr('元件', 'Element'), tr('值（仿真）', 'Value (sim)'), tr('来自', 'Comes from')],
          rows: [
            [tr('线圈电感 L', 'coil inductance L'), '150 mH', tr('线圈圈数 + 铁芯', 'turns + iron core')],
            [tr('线圈电阻 R', 'coil resistance R'), '70 Ω', tr('细铜线', 'the fine copper wire')],
            [tr('时间常数 τ = L/R', 'time constant τ = L/R'), '2.14 ms', tr('电流涨 / 落的快慢', 'how fast the current rises / falls')],
            [tr('触点电阻', 'contact resistance'), '0.05 Ω', tr('接通时', 'when closed')],
          ],
          parts: ['lcoil', 'rcoil', 'tau', 'contacts'],
        },
        formulas: [
          { tex: 'τ = \\frac{L}{R} = \\frac{150 mH}{70 Ω} = 2.14 ms', note: tr('RL 电路的时间常数', 'the RL time constant') },
          { tex: 'i(t) = \\frac{V}{R}(1 - e^{-t/τ})', note: tr('接通后线圈电流', 'coil current after switch-on') },
        ],
        calcs: ['rl-time-constant'],
      },
      {
        id: 'spike',
        short: tr('断电尖峰', 'Spike'),
        title: tr('⑥ 断电那一刻：u = L di/dt 产生高压尖峰', '⑥ The moment it switches off: u = L di/dt makes a spike'),
        body: tr(
          `GPIO 变低，[[q1|Q1]] 截止。线圈里本来有 65 mA，电感的电压–电流关系是：
$$u_L = L\\frac{di}{dt}$$
三极管在约 1 µs 内关断，如果电流真的在 1 µs 里从 65 mA 变成 0：
$$|u_L| = 0.15 × \\frac{0.065}{10^{-6}} ≈ 9750 V$$
当然不会真有 1 万伏：电感会 **自己抬高电压**，直到找到一条能让电流继续流的路。没有别的路时，[[vc|集电极电压 V_C]] 一路往上冲（这时线圈的极性反过来，下端比 +5 V 高），直到三极管的 C–E 被击穿（2N2222 约 40 V）或者靠线圈的分布电容慢慢放掉。仿真里看到的 [[spike|尖峰约 29 V]]（受步长和三极管关断过程限制），真实电路还可能更高。

换个角度看能量：线圈里存着 $W = \\frac{1}{2}LI^{2} = \\frac{1}{2} × 0.15 × 0.065^{2} ≈ 0.32 mJ$。这点能量必须找个地方放掉——没有二极管时，就是在三极管里“砸”出来。每秒开关 10 次，三极管每次都被打一下，迟早损坏；尖峰还会通过电源线干扰单片机，让它复位。`,
          `The GPIO goes low and [[q1|Q1]] turns off. The coil was carrying 65 mA, and an inductor obeys:
$$u_L = L\\frac{di}{dt}$$
The transistor switches off in about 1 µs; if the current really went from 65 mA to 0 in 1 µs:
$$|u_L| = 0.15 × \\frac{0.065}{10^{-6}} ≈ 9750 V$$
Of course there are no ten thousand volts: the inductor **raises the voltage itself** until it finds a path that lets the current keep flowing. With no other path, the [[vc|collector voltage V_C]] shoots up (the coil's polarity has reversed, its lower end now above +5 V) until the transistor's C–E breaks down (about 40 V for a 2N2222) or the coil's stray capacitance soaks it up. The simulator shows a [[spike|spike of about 29 V]] (limited by its time step and the transistor's turn-off), and a real circuit can be higher.

In energy terms: the coil stores $W = \\frac{1}{2}LI^{2} = \\frac{1}{2} × 0.15 × 0.065^{2} ≈ 0.32 mJ$. That energy has to go somewhere — without a diode it is slammed into the transistor. Ten times a second, every switch-off hits it again until it fails; the spike also couples into the supply and can reset the microcontroller.`,
        ),
        formulas: [
          { tex: 'u_L = L\\frac{di}{dt}', note: tr('电流变得越快，电压越高', 'the faster the current changes, the higher the voltage') },
          { tex: 'W = \\frac{1}{2}LI^{2} ≈ 0.32 mJ', note: tr('断电时必须释放的能量', 'the energy that must go somewhere at switch-off') },
        ],
        calcs: ['flyback-spike', 'rl-time-constant'],
      },
      {
        id: 'diode',
        short: tr('续流二极管', 'Flyback diode'),
        title: tr('⑦ 续流二极管：给电流一条路，把电压钳住', '⑦ The flyback diode: give the current a path, clamp the voltage'),
        body: tr(
          `在线圈两端反着并一个 [[diode|二极管 D1]]：**负极（有环的一端）接 +5 V**，正极接集电极。
- 通电时：集电极约 0.1 V，比 +5 V 低，D1 反偏，**不起作用**；
- 断电时：线圈要维持电流方向，集电极电压往上升；一旦比 +5 V 高 0.7 V，D1 导通，电流沿着 [[loop|线圈 → D1 → 线圈]] 这个小回路继续流；
- 于是 [[clamp|V_C 被钳在 5 + 0.7 = 5.7 V]]（实验 288 的测试：Vmax 在 5.1–5.7 V 之间），三极管再也看不到高压。

回路里的电流按 $i = I_0 e^{-t/τ}$ 衰减，τ = L/R ≈ 2 ms，0.32 mJ 的能量慢慢变成线圈电阻和二极管上的热。代价是继电器 **释放得慢一点**（几毫秒）；要释放得快，可以在 D1 上再串一个齐纳二极管，让钳位电压高一些、能量放得更快。

二极管用 1N4007 或 1N4148 就够：它只需要承受 65 mA、几毫秒。买到的“继电器模块”板上已经有三极管和这个二极管。`,
          `Put a [[diode|diode D1]] across the coil, reversed: **cathode (the end with the band) to +5 V**, anode to the collector.
- While on: the collector is at about 0.1 V, below +5 V, so D1 is reverse-biased and **does nothing**;
- At switch-off: the coil keeps its current flowing and the collector voltage rises; as soon as it is 0.7 V above +5 V, D1 conducts and the current circulates round the small loop [[loop|coil → D1 → coil]];
- so [[clamp|V_C is clamped at 5 + 0.7 = 5.7 V]] (lab 288's test: Vmax between 5.1 and 5.7 V) and the transistor never sees a high voltage.

The loop current decays as $i = I_0 e^{-t/τ}$ with τ = L/R ≈ 2 ms, and the 0.32 mJ slowly becomes heat in the coil resistance and the diode. The price is that the relay **releases a little later** (a few ms); for a faster release, add a Zener in series with D1 so the clamp is higher and the energy goes faster.

A 1N4007 or 1N4148 is plenty: it only carries 65 mA for a few milliseconds. Ready-made "relay modules" already have the transistor and this diode on board.`,
        ),
        table: {
          head: [tr('项目', 'Item'), tr('模拟器', 'Simulator'), tr('真实继电器', 'Real relay')],
          rows: [
            [tr('没有 D1 的尖峰', 'spike without D1'), '≈ 29 V', tr('可到 Q1 击穿（≈ 40 V）甚至更高', 'up to Q1 breakdown (≈ 40 V) or more')],
            [tr('有 D1 的钳位', 'clamp with D1'), '5.7 V', tr('5 V + V_F（0.7–1 V）', '5 V + V_F (0.7–1 V)')],
            [tr('动作 / 释放时间', 'operate / release time'), tr('无（只看电流）', 'none (current only)'), '≈ 5–10 ms'],
            [tr('触点抖动', 'contact bounce'), tr('无', 'none'), tr('约 1 ms', '≈ 1 ms')],
            [tr('触点寿命', 'contact life'), tr('无限', 'unlimited'), tr('满载约 10 万次', '≈ 100 000 operations at full load')],
          ],
          parts: ['vc', 'clamp', null, null, null],
        },
        formulas: [
          { tex: 'V_{C,max} = V_{CC} + V_F = 5 + 0.7 = 5.7 V', note: tr('二极管把集电极钳住', 'the diode clamps the collector') },
          { tex: 'i(t) = I_0 e^{-t/τ}, τ = \\frac{L}{R} ≈ 2 ms', note: tr('断电后线圈电流在小回路里衰减', 'after switch-off the coil current decays round the loop') },
        ],
        calcs: ['flyback-spike', 'rl-time-constant'],
      },
    ],
    recap: tr(
      '继电器 = 电磁铁 + 开关：线圈电流超过吸合值（仿真 53 mA），衔铁被吸下，COM 从 NC 换到 NO；电流低于释放值（7 mA）才弹回。线圈是 L + R（150 mH、70 Ω，τ ≈ 2 ms），所以电流不能突变：断电时 $u = L·di/dt$ 会把集电极顶到几十伏。反并一个续流二极管（负极接 +5 V），电流有路可走，电压被钳在约 5.7 V。',
      'A relay is an electromagnet plus a switch: once the coil current passes the pull-in value (53 mA in the simulator) the armature is pulled in and COM moves from NC to NO; it springs back only below the drop-out value (7 mA). The coil is L + R (150 mH, 70 Ω, τ ≈ 2 ms), so its current can’t jump: at switch-off $u = L·di/dt$ drives the collector to tens of volts. A reversed flyback diode (cathode to +5 V) gives the current a path and clamps the voltage at about 5.7 V.',
    ),
  };
}
