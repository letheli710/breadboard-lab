// Teardown: the lab bench power supply. Front panel (display, knobs, CV / CC lights, terminals)
// → inside (transformer, rectifier, pass transistor, sense resistor, two error amplifiers with a
// "lowest wins" selector) → the two control loops → equivalent circuit (ideal voltage source in
// CV, ideal current source in CC) → the V–I plane with load lines (R = V_set / I_set decides) →
// the lessons' numbers (103, 204, challenge 18) → limits (compliance, output capacitor, heat).

import './power.css';
import { tr } from '../../core/i18n';
import { sub, vis } from '../TeardownView';
import type { Teardown } from '../types';

function Res({ x1, y1, x2, y2, part }: { x1: number; y1: number; x2: number; y2: number; part?: string }) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const body = Math.min(44, L - 8);
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

function Block({ x, y, w, h, part, t1, t2 }: { x: number; y: number; w: number; h: number; part: string; t1: string; t2?: string }) {
  return (
    <g data-part={part}>
      <rect x={x} y={y} width={w} height={h} rx={6} className="pw-block" />
      <text x={x + w / 2} y={y + (t2 ? h / 2 - 2 : h / 2 + 5)} textAnchor="middle" className="pw-block-t" fontSize={12}>
        {t1}
      </text>
      {t2 && (
        <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" className="pw-tiny">
          {t2}
        </text>
      )}
    </g>
  );
}

function Knob({ x, y, r = 30, angle = -40, part }: { x: number; y: number; r?: number; angle?: number; part: string }) {
  const a = (angle * Math.PI) / 180;
  return (
    <g data-part={part}>
      <circle cx={x} cy={y} r={r + 6} fill="#d9d4c7" />
      {Array.from({ length: 11 }, (_, k) => {
        const t = ((-135 + k * 27) * Math.PI) / 180;
        return (
          <line
            key={k}
            x1={x + Math.sin(t) * (r + 7)}
            y1={y - Math.cos(t) * (r + 7)}
            x2={x + Math.sin(t) * (r + 11)}
            y2={y - Math.cos(t) * (r + 11)}
            stroke="#555"
            strokeWidth={1.2}
          />
        );
      })}
      <circle cx={x} cy={y} r={r} fill="#2a2b30" stroke="#111" strokeWidth={2} />
      <line x1={x} y1={y} x2={x + Math.sin(a) * (r - 4)} y2={y - Math.cos(a) * (r - 4)} stroke="#f2ede2" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

/* --------------------------------------------------------------- layer 0: the front panel */

function Panel({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 0, 0)}>
      <rect x={30} y={60} width={500} height={330} rx={14} fill="#e9e5dc" stroke="#8c8577" strokeWidth={2} />
      <text x={50} y={86} className="tdp-lbl">
        DC POWER SUPPLY 0–30 V / 0–3 A
      </text>
      {/* display */}
      <g data-part="display">
        <rect x={50} y={100} width={250} height={130} rx={8} fill="#121317" />
        <text x={160} y={146} textAnchor="end" className="pw-seg">
          4.70
        </text>
        <text x={168} y={146} className="pw-on-dark" fontSize={14}>
          V
        </text>
        <text x={160} y={186} textAnchor="end" className="pw-seg green">
          0.010
        </text>
        <text x={168} y={186} className="pw-on-dark" fontSize={14}>
          A
        </text>
        <text x={175} y={216} textAnchor="middle" className="pw-on-dark" fontSize={10} data-part="setline">
          {tr('设定 12.00 V / 0.010 A', 'SET 12.00 V / 0.010 A')}
        </text>
      </g>
      {/* CV / CC lamps */}
      <g data-part="cv">
        <circle cx={232} cy={140} r={9} fill="#2f5a3f" stroke="#111" />
        <text x={248} y={145} className="pw-on-dark" fontSize={12}>
          CV
        </text>
      </g>
      <g data-part="cc">
        <circle cx={232} cy={180} r={9} fill="#ff4d4d" stroke="#111" />
        <circle cx={232} cy={180} r={14} fill="none" stroke="#ff4d4d" opacity={0.4} strokeWidth={3} />
        <text x={248} y={185} className="pw-on-dark" fontSize={12}>
          CC
        </text>
      </g>
      {/* knobs */}
      <Knob x={110} y={300} angle={60} part="vknob" />
      <text x={110} y={360} textAnchor="middle" className="tdp-lbl" data-part="vknob">
        VOLTAGE
      </text>
      <Knob x={220} y={300} angle={-110} part="iknob" />
      <text x={220} y={360} textAnchor="middle" className="tdp-lbl" data-part="iknob">
        CURRENT
      </text>
      {/* output button, power */}
      <g data-part="output">
        <rect x={320} y={110} width={70} height={34} rx={6} fill="#2a2b30" />
        <text x={355} y={132} textAnchor="middle" className="pw-on-dark" fontSize={11}>
          OUTPUT
        </text>
      </g>
      <g data-part="power">
        <rect x={420} y={110} width={84} height={34} rx={6} fill="#c0392b" />
        <text x={462} y={132} textAnchor="middle" className="pw-on-dark" fontSize={11}>
          POWER
        </text>
      </g>
      {/* terminals */}
      <g data-part="plus">
        <circle cx={360} cy={300} r={22} fill="#d0343f" stroke="#7a1d23" strokeWidth={2} />
        <circle cx={360} cy={300} r={7} fill="#3b1013" />
        <text x={360} y={348} textAnchor="middle" className="pw-lbl-red" fontSize={16}>
          +
        </text>
      </g>
      <g data-part="minus">
        <circle cx={480} cy={300} r={22} fill="#1b1c20" stroke="#000" strokeWidth={2} />
        <circle cx={480} cy={300} r={7} fill="#555" />
        <text x={480} y={348} textAnchor="middle" className="oa-lbl" fontSize={16}>
          − COM
        </text>
      </g>
      <g data-part="earth">
        <circle cx={420} cy={240} r={14} fill="#2e8b57" stroke="#14532d" strokeWidth={2} />
        <text x={420} y={272} textAnchor="middle" className="pw-tiny">
          ⏚ {tr('机壳地', 'chassis')}
        </text>
      </g>
    </g>
  );
}

/* --------------------------------------------------------------- layers 1–2: inside, two loops */

function Inside({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 1, 2)}>
      <Block x={14} y={88} w={62} h={44} part="mains" t1={tr('市电', 'mains')} t2="230 V~" />
      <line x1={76} y1={110} x2={90} y2={110} className="oa-wire" />
      <Block x={90} y={88} w={70} h={44} part="xfmr" t1={tr('变压器', 'transformer')} />
      <line x1={160} y1={110} x2={172} y2={110} className="oa-wire" />
      <Block x={172} y={88} w={86} h={44} part="rect" t1={tr('整流 + 滤波', 'rectifier + C')} t2="≈ 35 V DC" />
      <line x1={258} y1={110} x2={300} y2={110} className="oa-wire plus" />
      <Block x={300} y={88} w={86} h={44} part="pass" t1={tr('调整管', 'pass transistor')} />
      <line x1={386} y1={110} x2={520} y2={110} className="oa-wire plus" data-part="plus" />
      <circle cx={520} cy={110} r={6} className="oa-term" data-part="plus" />
      <text x={526} y={98} textAnchor="end" className="pw-lbl-red" fontSize={14} data-part="plus">
        +
      </text>
      {/* divider */}
      <circle cx={450} cy={110} r={3.5} className="oa-term" />
      <Res x1={450} y1={110} x2={450} y2={186} part="div" />
      <circle cx={450} cy={196} r={3.5} className="oa-term" data-part="div" />
      <line x1={450} y1={186} x2={450} y2={204} className="oa-wire" />
      <Res x1={450} y1={204} x2={450} y2={280} part="div" />
      <path d="M450 280 L450 296 L362 296 L362 390" className="oa-wire" />
      <text x={462} y={156} className="pw-tiny" data-part="div">
        {tr('分压', 'divider')}
      </text>
      {/* return path with sense resistor */}
      <path d="M190 132 L190 390 L380 390" className="oa-wire minus" />
      <Res x1={380} y1={390} x2={470} y2={390} part="rs" />
      <text x={425} y={376} textAnchor="middle" className="oa-lbl" data-part="rs">
        {sub('R_s')}
      </text>
      <line x1={470} y1={390} x2={520} y2={390} className="oa-wire minus" data-part="minus" />
      <circle cx={520} cy={390} r={6} className="oa-term" data-part="minus" />
      <text x={526} y={380} textAnchor="end" className="pw-lbl-blue" fontSize={14} data-part="minus">
        −
      </text>
      {/* CV amplifier */}
      <Block x={240} y={176} w={92} h={46} part="cvamp" t1={tr('CV 误差放大', 'CV error amp')} t2={tr('比较电压', 'compares voltage')} />
      <path d="M450 196 L332 196" className="oa-wire" data-part="div" />
      <g data-part="vknob">
        <circle cx={380} cy={232} r={11} fill="#2a2b30" />
        <line x1={380} y1={232} x2={386} y2={224} stroke="#f2ede2" strokeWidth={2} />
        <text x={396} y={236} className="pw-tiny" fontWeight={700}>
          {sub('V_set')}
        </text>
        <path d="M369 232 L350 232 L350 212 L332 212" className="oa-wire" />
      </g>
      {/* CC amplifier */}
      <Block x={240} y={300} w={92} h={46} part="ccamp" t1={tr('CC 误差放大', 'CC error amp')} t2={tr('比较电流', 'compares current')} />
      <g data-part="iknob">
        <circle cx={300} cy={268} r={11} fill="#2a2b30" />
        <line x1={300} y1={268} x2={292} y2={261} stroke="#f2ede2" strokeWidth={2} />
        <text x={316} y={272} className="pw-tiny" fontWeight={700}>
          {sub('I_set')}
        </text>
        <line x1={300} y1={279} x2={300} y2={300} className="oa-wire" />
      </g>
      <path d="M470 390 L470 414 L286 414 L286 346" className="oa-wire" data-part="rs" />
      <text x={380} y={428} textAnchor="middle" className="pw-tiny" data-part="rs">
        {sub(tr('R_s 上的电压 = I × R_s', 'voltage on R_s = I × R_s'))}
      </text>
      {/* "lowest wins" selector */}
      <g data-part="sel">
        <polygon points="216,192 216,206 230,199" fill="#1f2a44" />
        <line x1={231} y1={191} x2={231} y2={207} className="oa-wire" />
        <polygon points="216,316 216,330 230,323" fill="#1f2a44" />
        <line x1={231} y1={315} x2={231} y2={331} className="oa-wire" />
        <path d="M231 199 L240 199 M231 323 L240 323" className="oa-wire" />
        <path d="M216 199 L206 199 L206 323 L216 323 M206 260 L206 150 L343 150 L343 132" className="oa-wire" />
        <circle cx={206} cy={260} r={3.5} className="oa-term" />
        <text x={184} y={262} textAnchor="end" className="pw-tiny" fontWeight={700}>
          {tr('谁低听谁', 'lowest wins')}
        </text>
      </g>
      {/* layer 2: the two loops, as broad translucent bands over the wires */}
      <g className={vis(layer, 2, 2)}>
        <path
          d="M343 132 L343 150 L206 150 L206 199 L240 199 M332 196 L450 196 L450 110 L386 110"
          fill="none"
          stroke="#2ba59b"
          strokeWidth={9}
          strokeOpacity={0.4}
          strokeLinejoin="round"
          data-part="cvloop"
        />
        <text x={346} y={170} className="pw-lbl-green" fontSize={13} data-part="cvloop">
          {tr('CV 环', 'CV loop')}
        </text>
        <path
          d="M386 110 L520 110 Q 552 250 520 390 L470 390 L470 414 L286 414 L286 346 M240 323 L206 323 L206 150 L343 150 L343 132"
          fill="none"
          stroke="#e63946"
          strokeWidth={9}
          strokeOpacity={0.3}
          strokeLinejoin="round"
          data-part="ccloop"
        />
        <text x={540} y={250} textAnchor="end" className="pw-lbl-red" fontSize={11} data-part="ccloop">
          {tr('负载', 'load')}
        </text>
        <text x={130} y={362} className="pw-lbl-red" fontSize={13} data-part="ccloop">
          {tr('CC 环', 'CC loop')}
        </text>
      </g>
    </g>
  );
}

/* --------------------------------------------------------------- layer 3: equivalent circuits */

function Equivalent({ layer }: { layer: number }) {
  const load = (x: number) => (
    <g>
      <path d={`M${x} 120 L${x + 120} 120 L${x + 120} 170`} className="oa-wire" />
      <Res x1={x + 120} y1={170} x2={x + 120} y2={270} part="load" />
      <text x={x + 134} y={226} className="oa-lbl" data-part="load">
        R
      </text>
      <path d={`M${x + 120} 270 L${x + 120} 320 L${x} 320`} className="oa-wire" />
    </g>
  );
  return (
    <g className={vis(layer, 3, 3)}>
      <text x={140} y={60} textAnchor="middle" className="tdp-big">
        {tr('CV：电压源', 'CV: a voltage source')}
      </text>
      <text x={420} y={60} textAnchor="middle" className="tdp-big">
        {tr('CC：电流源', 'CC: a current source')}
      </text>
      {/* CV */}
      <g data-part="vsrc">
        <circle cx={80} cy={220} r={26} className="oa-src" />
        <text x={80} y={214} textAnchor="middle" className="oa-src-sign">
          +
        </text>
        <text x={80} y={236} textAnchor="middle" className="oa-src-sign">
          −
        </text>
        <text x={46} y={225} textAnchor="end" className="oa-lbl">
          {sub('V_set')}
        </text>
      </g>
      <path d="M80 194 L80 120 L100 120" className="oa-wire" />
      <path d="M80 246 L80 320 L100 320" className="oa-wire" />
      <text x={90} y={110} className="pw-tiny" data-part="vsrc">
        {tr('内阻 0.02 Ω', 'r = 0.02 Ω')}
      </text>
      {load(100)}
      <text x={140} y={364} textAnchor="middle" className="td-small" fontWeight={700} data-part="vsrc">
        {sub(tr('V = V_set，I = V_set / R', 'V = V_set, I = V_set / R'))}
      </text>
      <text x={140} y={384} textAnchor="middle" className="pw-lbl-green" fontSize={12} data-part="vsrc">
        {sub(tr('条件：V_set / R < I_set', 'when V_set / R < I_set'))}
      </text>
      {/* CC */}
      <g data-part="isrc">
        <circle cx={360} cy={220} r={26} className="oa-src" />
        <path d="M360 238 L360 202" className="oa-wire" markerEnd="url(#bs-ah)" />
        <text x={326} y={225} textAnchor="end" className="oa-lbl">
          {sub('I_set')}
        </text>
      </g>
      <path d="M360 194 L360 120 L380 120" className="oa-wire" />
      <path d="M360 246 L360 320 L380 320" className="oa-wire" />
      {load(380)}
      <text x={420} y={364} textAnchor="middle" className="td-small" fontWeight={700} data-part="isrc">
        {sub(tr('I = I_set，V = I_set × R', 'I = I_set, V = I_set × R'))}
      </text>
      <text x={420} y={384} textAnchor="middle" className="pw-lbl-red" fontSize={12} data-part="isrc">
        {sub(tr('条件：I_set × R < V_set', 'when I_set × R < V_set'))}
      </text>
      <line x1={280} y1={80} x2={280} y2={400} className="oa-dash" />
      <text x={280} y={424} textAnchor="middle" className="oa-lbl" data-part="rc">
        {sub(tr('分界：R_c = V_set / I_set', 'boundary: R_c = V_set / I_set'))}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layers 4–5: the V–I plane */

const X = (mA: number) => 80 + mA * 28; // 0..15 mA
const Y = (v: number) => 380 - v * 22; // 0..14 V

function Plane({ layer }: { layer: number }) {
  const lines: [string, number, string, string][] = [
    ['r2k2', 2200, '2.2 kΩ', 'CV'],
    ['rc', 1200, '1.2 kΩ', ''],
    ['r470', 470, '470 Ω', 'CC'],
  ];
  return (
    <g className={vis(layer, 4, 5)}>
      <rect x={20} y={40} width={520} height={390} rx={14} className="td-panel" />
      <rect x={X(0)} y={Y(12)} width={X(10) - X(0)} height={Y(0) - Y(12)} className="pw-area-cv" />
      <line x1={X(0)} y1={Y(0)} x2={X(15)} y2={Y(0)} className="oa-axis" />
      <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(14)} className="oa-axis" />
      {[0, 5, 10, 15].map((i) => (
        <text key={i} x={X(i)} y={Y(0) + 16} textAnchor="middle" className="pw-tiny">
          {i}
        </text>
      ))}
      {[4, 8, 12].map((v) => (
        <text key={v} x={X(0) - 6} y={Y(v) + 4} textAnchor="end" className="pw-tiny">
          {v}
        </text>
      ))}
      <text x={X(15)} y={Y(0) + 32} textAnchor="end" className="oa-lbl">
        I (mA)
      </text>
      <text x={X(0) - 8} y={Y(13.4)} textAnchor="end" className="oa-lbl">
        V (V)
      </text>
      {/* the supply's output characteristic */}
      <line x1={X(0)} y1={Y(12)} x2={X(10)} y2={Y(12)} className="pw-curve-green" style={{ strokeWidth: 4 }} data-part="cvline" />
      <text x={X(0.3)} y={Y(12) - 8} className="pw-lbl-green" fontSize={12} data-part="cvline">
        {tr('CV：V = 12 V', 'CV: V = 12 V')}
      </text>
      <line x1={X(10)} y1={Y(12)} x2={X(10)} y2={Y(0)} className="pw-curve-red" style={{ strokeWidth: 4 }} data-part="ccline" />
      <text x={X(10) + 8} y={Y(1.2)} className="pw-lbl-red" fontSize={12} data-part="ccline">
        {tr('CC：I = 10 mA', 'CC: I = 10 mA')}
      </text>
      <g className={vis(layer, 4, 4)}>
        {lines.map(([id, R, lbl, mode]) => {
          const iEnd = Math.min(15, (13.5 / R) * 1000);
          const iOp = Math.min(10, (12 / R) * 1000);
          const vOp = (iOp / 1000) * R;
          return (
            <g key={id} data-part={id}>
              <line x1={X(0)} y1={Y(0)} x2={X(iEnd)} y2={Y((iEnd / 1000) * R)} className="pw-load" />
              <text x={X(iEnd) + 4} y={Y((iEnd / 1000) * R) + 4} className="pw-tiny" fontWeight={700}>
                {lbl}
              </text>
              <circle cx={X(iOp)} cy={Y(vOp)} r={6} className="pw-pt" />
              {mode && (
                <text
                  x={X(iOp) + (mode === 'CC' ? 10 : -8)}
                  y={Y(vOp) + (mode === 'CC' ? 4 : 22)}
                  textAnchor={mode === 'CC' ? 'start' : 'end'}
                  className="td-small"
                  fontWeight={700}
                >
                  {mode === 'CC' ? `CC: 10 mA, 4.7 V` : `CV: 12 V, 5.45 mA`}
                </text>
              )}
            </g>
          );
        })}
        <text x={X(10) + 10} y={Y(10.4)} className="oa-lbl" fontSize={12} data-part="rc">
          {sub(tr('拐角 R_c = 12 V / 10 mA', 'corner R_c = 12 V / 10 mA'))}
        </text>
        <text x={X(10) + 10} y={Y(10.4) + 16} className="oa-lbl" fontSize={12} data-part="rc">
          = 1.2 kΩ
        </text>
      </g>
      {/* layer 5: lab 204 — LED + 482 Ω + RV */}
      <g className={vis(layer, 5, 5)}>
        {(
          [
            ['rv0', 482, 0.01, tr('RV 0%：6.62 V', 'RV 0%: 6.62 V')],
            ['rv40', 882, 0.01, tr('RV 40%：10.62 V', 'RV 40%: 10.62 V')],
            ['rv100', 1482, 0.00688, tr('RV 100%：12 V，6.88 mA', 'RV 100%: 12 V, 6.88 mA')],
          ] as const
        ).map(([id, R, iOp, lbl]) => {
          const iEnd = Math.min(15, ((13.5 - 1.8) / R) * 1000);
          return (
            <g key={id} data-part={id}>
              <line x1={X(0)} y1={Y(1.8)} x2={X(iEnd)} y2={Y(1.8 + (iEnd / 1000) * R)} className="pw-load" />
              <circle cx={X(iOp * 1000)} cy={Y(1.8 + iOp * R)} r={6} className="pw-pt" />
              <text
                x={X(iOp * 1000) + (id === 'rv100' ? -10 : 10)}
                y={Y(1.8 + iOp * R) + (id === 'rv100' ? 22 : 4)}
                textAnchor={id === 'rv100' ? 'end' : 'start'}
                className="td-small"
                fontWeight={700}
              >
                {lbl}
              </text>
            </g>
          );
        })}
        <text x={X(0) - 6} y={Y(1.8) + 4} textAnchor="end" className="pw-tiny" fontWeight={700} data-part="ledvf">
          1.8 V
        </text>
        <text x={280} y={64} textAnchor="middle" className="td-panel-title">
          {tr('实验 204：负载线 V = 1.8 V + I × (482 Ω + RV)', 'Lab 204: load line V = 1.8 V + I × (482 Ω + RV)')}
        </text>
      </g>
      <text x={280} y={64} textAnchor="middle" className={`td-panel-title ${layer === 4 ? 'td-show' : 'td-hide'}`}>
        {tr('V–I 平面：电源的特性 + 负载线 = 工作点', 'V–I plane: supply curve + load line = operating point')}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layer 6: limits */

function Limits({ layer }: { layer: number }) {
  const x = (us: number) => 300 + us * 2.1; // 0..100 µs
  const y = (mA: number) => 380 - mA * 2.2; // 0..120 mA
  return (
    <g className={vis(layer, 6)}>
      {/* setting the limit with a short */}
      <text x={140} y={56} textAnchor="middle" className="tdp-big">
        {tr('设限流：先短路输出', 'Setting the limit: short the output')}
      </text>
      <rect x={30} y={76} width={220} height={200} rx={10} fill="#e9e5dc" stroke="#8c8577" strokeWidth={1.5} />
      <rect x={46} y={92} width={188} height={70} rx={6} fill="#121317" data-part="display" />
      <text x={150} y={122} textAnchor="end" className="pw-seg" fontSize={18}>
        0.02
      </text>
      <text x={156} y={122} className="pw-on-dark" fontSize={12}>
        V
      </text>
      <text x={150} y={150} textAnchor="end" className="pw-seg green" fontSize={18}>
        0.050
      </text>
      <text x={156} y={150} className="pw-on-dark" fontSize={12}>
        A
      </text>
      <circle cx={206} cy={112} r={6} fill="#2f5a3f" />
      <circle cx={206} cy={142} r={6} fill="#ff4d4d" />
      <circle cx={90} cy={226} r={16} fill="#d0343f" data-part="plus" />
      <circle cx={190} cy={226} r={16} fill="#1b1c20" data-part="minus" />
      <path d="M90 226 C 110 270, 170 270, 190 226" stroke="#c9a227" strokeWidth={5} fill="none" data-part="short" />
      <text x={140} y={300} textAnchor="middle" className="td-small" fontWeight={700} data-part="short">
        {tr('短路线：CC 灯亮，转 CURRENT 到 0.050 A', 'shorting lead: CC lit, turn CURRENT to 0.050 A')}
      </text>
      <text x={140} y={318} textAnchor="middle" className="td-small" data-part="short">
        {tr('再拆掉短路线，接电路', 'then remove it and connect the circuit')}
      </text>
      {/* the output-capacitor spike */}
      <text x={410} y={56} textAnchor="middle" className="tdp-big">
        {tr('接上负载的一瞬间', 'The instant a load is connected')}
      </text>
      <line x1={x(0)} y1={y(0)} x2={x(100)} y2={y(0)} className="oa-axis" />
      <line x1={x(0)} y1={y(0)} x2={x(0)} y2={y(125)} className="oa-axis" />
      <text x={x(100)} y={y(0) + 18} textAnchor="end" className="pw-tiny" fontWeight={700}>
        t (µs)
      </text>
      <text x={x(0) + 6} y={y(125)} className="pw-tiny" fontWeight={700}>
        I (mA)
      </text>
      <line x1={x(0)} y1={y(50)} x2={x(100)} y2={y(50)} className="oa-dash" />
      <text x={x(100)} y={y(50) - 6} textAnchor="end" className="pw-tiny">
        {tr('限流 50 mA', 'limit 50 mA')}
      </text>
      <polyline points={`${x(0)},${y(50)} ${x(100)},${y(50)}`} className="pw-curve-green" style={{ strokeWidth: 2.5 }} data-part="sim" />
      <path
        d={`M${x(0)} ${y(0)} L${x(2)} ${y(115)} ${Array.from({ length: 40 }, (_, k) => {
          const t = 2 + (k + 1) * 2;
          return `L${x(t)} ${y(50 + 65 * Math.exp(-(t - 2) / 12))}`;
        }).join(' ')}`}
        className="pw-curve-red"
        strokeWidth={2.2}
        data-part="real"
      />
      <text x={x(8)} y={y(112)} className="pw-lbl-red" fontSize={11} data-part="real">
        {tr('真实：输出电容放电，尖峰', 'real: the output capacitor dumps a spike')}
      </text>
      <text x={x(30)} y={y(50) + 18} className="pw-lbl-green" fontSize={11} data-part="sim">
        {tr('仿真：立刻 50 mA', 'simulator: 50 mA at once')}
      </text>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="bs-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pw-ah" />
        </marker>
      </defs>
      <Panel layer={layer} />
      <Inside layer={layer} />
      <Equivalent layer={layer} />
      <Plane layer={layer} />
      <Limits layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'bench-supply',
    title: tr('直流稳压电源：CV 和 CC 谁说了算', 'Bench supply: when CV rules and when CC rules'),
    subtitle: tr(
      '实验室的 bench power supply（直流稳压电源）有两个旋钮：电压和限流。它里面有两个 control loop（控制环），一个想让电压等于设定值（CV，constant voltage，恒压），一个想让电流不超过设定值（CC，constant current，恒流）。负载决定哪个环说了算——我们用 V–I 平面上的负载线把这件事画清楚。',
      'A lab bench power supply has two knobs: voltage and current limit. Inside are two control loops: one wants the voltage at its setting (CV, constant voltage), the other wants the current no higher than its setting (CC, constant current). The load decides which loop is in charge — and a load line on the V–I plane makes that picture exact.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'panel',
        short: tr('面板', 'Panel'),
        title: tr('① 面板：两个旋钮、两盏灯、一块表', '① The front panel: two knobs, two lights, one display'),
        body: tr(
          `第 11 课（lesson 103）的电源调到 12 V、限流 10 mA，接一个 470 Ω：面板就是图上这样。先认清每个东西：
- [[display|显示屏]] 的大字是 **实际输出** 的电压和电流（4.70 V、0.010 A），下面一行小字 [[setline|设定 12.00 V / 0.010 A]] 是旋钮的位置。**设定值 ≠ 实际值**，这是新手最常看错的地方。
- [[vknob|VOLTAGE]] 旋钮设电压上限，[[iknob|CURRENT]] 旋钮设电流上限。
- [[cv|CV 灯]] 亮 = 恒压，[[cc|CC 灯]] 亮 = 恒流。图上 CC 亮：负载“想要”12 V / 470 Ω = 25.5 mA，超过了 10 mA，电源把电流卡在 10 mA，电压降到 10 mA × 470 Ω = 4.7 V。
- [[plus|红色 +]] 和 [[minus|黑色 − / COM]] 是输出；绿色 [[earth|⏚]] 接机壳和插头的地线，平时不用接。
- [[output|OUTPUT]] 键开 / 关输出：先调好再打开。`,
          `Lesson 11 (lesson 103) sets the supply to 12 V, limit 10 mA, with a 470 Ω load: the panel looks like this. Get to know each piece:
- the [[display|display]]'s big digits are the **actual output** voltage and current (4.70 V, 0.010 A); the small line [[setline|SET 12.00 V / 0.010 A]] shows the knob settings. **Setting ≠ actual** — the most common beginner misreading.
- the [[vknob|VOLTAGE]] knob sets the voltage ceiling, the [[iknob|CURRENT]] knob the current ceiling.
- [[cv|CV]] lit = constant voltage, [[cc|CC]] lit = constant current. Here CC is lit: the load "wants" 12 V / 470 Ω = 25.5 mA, more than 10 mA, so the supply holds the current at 10 mA and the voltage drops to 10 mA × 470 Ω = 4.7 V.
- [[plus|red +]] and [[minus|black − / COM]] are the output; the green [[earth|⏚]] is the chassis / mains earth, normally left unconnected.
- the [[output|OUTPUT]] key switches the output on and off: set it up first, then switch on.`,
        ),
        table: {
          head: [tr('部件', 'Item'), tr('作用', 'What it does'), tr('仿真里', 'In the simulator')],
          rows: [
            [tr('显示屏（大字）', 'display (big digits)'), tr('实际输出 V、I', 'actual output V, I'), tr('同', 'same')],
            [tr('设定行（小字）', 'set line (small)'), tr('旋钮的设定值', 'the knob settings'), tr('属性 voltage、currentLimit', 'properties voltage, currentLimit')],
            ['VOLTAGE', tr('电压上限 V_set', 'voltage ceiling V_set'), tr('0–30 V', '0–30 V')],
            ['CURRENT', tr('电流上限 I_set', 'current ceiling I_set'), tr('默认 0.1 A', 'default 0.1 A')],
            [tr('CV 灯', 'CV light'), tr('恒压模式', 'constant-voltage mode'), tr('CV 时内阻 0.02 Ω', 'CV: 0.02 Ω inside')],
            [tr('CC 灯', 'CC light'), tr('恒流（限流）模式', 'constant-current (limiting) mode'), tr('I 正好等于 I_set', 'I exactly I_set')],
            ['+ / − COM', tr('输出端子', 'output terminals'), tr('红夹子 / 黑夹子', 'red / black clip')],
          ],
          parts: ['display', 'setline', 'vknob', 'iknob', 'cv', 'cc', 'plus'],
        },
      },
      {
        id: 'inside',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：一个调整管，两个误差放大器', '② X-ray: one pass transistor, two error amplifiers'),
        body: tr(
          `一台线性稳压电源里面：
1. [[mains|市电]] 经 [[xfmr|变压器]] 降压，[[rect|整流 + 滤波电容]] 变成不太稳的约 35 V 直流；
2. [[pass|调整管]] 串在输出 + 上，像一个可调的阀门，吃掉多余的电压——和“稳压器”拆解里的 LDO 是同一个原理，只是大得多；
3. 输出电压经 [[div|分压电阻]] 送到 [[cvamp|CV 误差放大器]]，和 [[vknob|V_set]] 比较；
4. 负载电流全部流过回路里的 [[rs|采样电阻 R_s]]（零点几欧），它上面的电压 $I × R_s$ 送到 [[ccamp|CC 误差放大器]]，和 [[iknob|I_set]] 比较；
5. 两个放大器的输出经二极管接到同一根驱动线上：[[sel|谁的输出低就听谁的]]（低选，minimum selector）。哪个二极管导通，面板上就亮哪盏灯。

“谁低听谁”的意思：两个环都 **只会往小了拧** 调整管。电压到了 V_set，CV 环拦住；电流到了 I_set，CC 环拦住。先碰到哪个限制，哪个就接管。`,
          `Inside a linear bench supply:
1. the [[mains|mains]] is stepped down by a [[xfmr|transformer]], and a [[rect|rectifier + filter capacitor]] makes a rough ~35 V DC;
2. the [[pass|pass transistor]] sits in series with the + output like an adjustable valve, eating the extra voltage — the same idea as the LDO in the regulator teardown, only much bigger;
3. the output voltage goes through a [[div|divider]] to the [[cvamp|CV error amplifier]], which compares it with [[vknob|V_set]];
4. all the load current flows through a [[rs|sense resistor R_s]] (a fraction of an ohm) in the return path; its voltage $I × R_s$ goes to the [[ccamp|CC error amplifier]], which compares it with [[iknob|I_set]];
5. both amplifiers drive one line through diodes: [[sel|whichever output is lower wins]] (a minimum selector). Whichever diode conducts decides which panel light is on.

"Lowest wins" means both loops can only **turn the valve down**. The voltage reaches V_set: the CV loop stops it. The current reaches I_set: the CC loop stops it. Whichever limit is hit first takes over.`,
        ),
        callouts: [{ part: 'pass', label: tr('和 LDO 一样的“阀门”', 'the same “valve” as an LDO'), x: 343, y: 88, lx: 400, ly: 52, anchor: 'start' }],
      },
      {
        id: 'loops',
        short: tr('两个环', 'Two loops'),
        title: tr('③ 两个控制环：各管一个量', '③ Two control loops, each guarding one quantity'),
        body: tr(
          `把两条反馈路径画出来：
- [[cvloop|CV 环]]：输出电压 → 分压 → CV 放大器 → 调整管 → 输出电压。它和同相放大器一样是 **负反馈**：输出偏高，放大器把调整管关小，输出回落。平衡时 $V_{out} = V_{set}$。
- [[ccloop|CC 环]]：负载电流 → R_s 上的电压 → CC 放大器 → 调整管 → 负载电流。平衡时 $I × R_s = I_{set} × R_s$，即 $I = I_{set}$。

两个环不能同时“平衡”（除非负载正好在分界点上）：
- 负载轻（R 大）：电流还没到 I_set，CC 放大器的输出很高、二极管截止，**只有 CV 环在工作**；
- 负载重（R 小）：要维持 V_set 就得超过 I_set，CC 放大器的输出先降下来接管，CV 放大器“想要”更高的电压但被二极管隔开，**只有 CC 环在工作**，电压被迫降下来。

仿真里电源的判断就是这么简单：先按 CV 算，如果算出来 $I > I_{set}$，就改成 CC。`,
          `Draw the two feedback paths:
- [[cvloop|the CV loop]]: output voltage → divider → CV amp → pass transistor → output voltage. Like a non-inverting amplifier it is **negative feedback**: output too high, the amp turns the valve down and the output falls back. In balance $V_{out} = V_{set}$.
- [[ccloop|the CC loop]]: load current → voltage on R_s → CC amp → pass transistor → load current. In balance $I × R_s = I_{set} × R_s$, i.e. $I = I_{set}$.

The two loops can't both be in balance (unless the load sits exactly on the boundary):
- light load (large R): the current hasn't reached I_set, the CC amp's output is high and its diode is off — **only the CV loop is working**;
- heavy load (small R): holding V_set would need more than I_set, so the CC amp's output drops first and takes over; the CV amp "wants" more voltage but is cut off by its diode — **only the CC loop is working**, and the voltage is forced down.

The simulator decides it just like that: solve as CV first; if that gives $I > I_{set}$, switch to CC.`,
        ),
        table: {
          head: [tr('环', 'Loop'), tr('测什么', 'Senses'), tr('和谁比', 'Compared with'), tr('保持', 'Holds'), tr('什么时候接管', 'In charge when')],
          rows: [
            ['CV', tr('输出电压（分压后）', 'output voltage (divided)'), 'V_set', '$V = V_{set}$', '$\\frac{V_{set}}{R} < I_{set}$'],
            ['CC', '$I × R_s$', '$I_{set} × R_s$', '$I = I_{set}$', '$\\frac{V_{set}}{R} > I_{set}$'],
          ],
          parts: ['cvloop', 'ccloop'],
        },
      },
      {
        id: 'model',
        short: tr('等效电路', 'Model'),
        title: tr('④ 等效电路：要么是电压源，要么是电流源', '④ Equivalent circuit: a voltage source or a current source'),
        body: tr(
          `从输出端看进去，电源只可能是两种理想元件之一：
- **CV 模式** = [[vsrc|理想电压源 V_set]]（串一个很小的内阻，仿真 0.02 Ω）。电压固定，电流由负载决定：$I = \\frac{V_{set}}{R}$。
- **CC 模式** = [[isrc|理想电流源 I_set]]。电流固定，电压由负载决定：$V = I_{set} × R$。

哪一个？把两个条件放在一起：
1. 假设 CV：$I = \\frac{V_{set}}{R}$，要求 $I ≤ I_{set}$，即 $R ≥ \\frac{V_{set}}{I_{set}}$；
2. 假设 CC：$V = I_{set}R$，要求 $V ≤ V_{set}$，即 $R ≤ \\frac{V_{set}}{I_{set}}$。

所以分界就是一个电阻值：
$$R_c = \\frac{V_{set}}{I_{set}}$$
[[load|负载]] 比 [[rc|R_c]] 大 → CV；比 R_c 小 → CC。lesson 103：$R_c = \\frac{12 V}{10 mA} = 1.2 kΩ$，470 Ω < 1.2 kΩ，所以是 CC，$V = 10 mA × 470 Ω = 4.7 V$。

这就是电路课里“实际电源”的两种模型在实验桌上的样子：电路理论里的理想电流源，在实验室里就是“调高电压、调低限流”的稳压电源。`,
          `Seen from its terminals, the supply is one of two ideal elements:
- **CV mode** = [[vsrc|an ideal voltage source V_set]] (with a tiny series resistance, 0.02 Ω in the simulator). Voltage fixed, current set by the load: $I = \\frac{V_{set}}{R}$.
- **CC mode** = [[isrc|an ideal current source I_set]]. Current fixed, voltage set by the load: $V = I_{set} × R$.

Which one? Put the two conditions together:
1. Assume CV: $I = \\frac{V_{set}}{R}$, which needs $I ≤ I_{set}$, i.e. $R ≥ \\frac{V_{set}}{I_{set}}$;
2. Assume CC: $V = I_{set}R$, which needs $V ≤ V_{set}$, i.e. $R ≤ \\frac{V_{set}}{I_{set}}$.

So the boundary is a single resistance:
$$R_c = \\frac{V_{set}}{I_{set}}$$
A [[load|load]] above [[rc|R_c]] → CV; below R_c → CC. Lesson 103: $R_c = \\frac{12 V}{10 mA} = 1.2 kΩ$; 470 Ω < 1.2 kΩ, so CC, and $V = 10 mA × 470 Ω = 4.7 V$.

These are the two "practical source" models of circuit theory on the lab bench: the ideal current source of the textbook is, in the lab, a supply with the voltage turned up and the limit turned down.`,
        ),
        formulas: [
          { tex: 'R_c = \\frac{V_{set}}{I_{set}}', note: tr('R > R_c：CV；R < R_c：CC', 'R > R_c: CV; R < R_c: CC') },
          { tex: 'CV: I = \\frac{V_{set}}{R}    CC: V = I_{set}·R', note: tr('固定一个量，另一个由负载决定', 'one quantity fixed, the other set by the load') },
        ],
        calcs: ['cc-current-source', 'ohm'],
      },
      {
        id: 'plane',
        short: tr('V–I 平面', 'V–I plane'),
        title: tr('⑤ 画出来：电源的“直角”和负载线', '⑤ Picture it: the supply’s corner and the load line'),
        body: tr(
          `在 V–I 平面上（横轴 I、纵轴 V）：
- 电源能输出的所有点是一个 **直角**：[[cvline|一条水平线 V = 12 V]]（CV，I 从 0 到 10 mA），接 [[ccline|一条竖直线 I = 10 mA]]（CC，V 从 12 V 往下）；
- 一个电阻负载的所有点是一条过原点的直线 $V = I·R$——**负载线**（load line），斜率就是 R。

两条线的交点就是 **工作点**：
- [[r2k2|2.2 kΩ]]：负载线陡，先碰到水平线 → CV，12 V、$\\frac{12}{2200}$ = 5.45 mA；
- [[r470|470 Ω]]：负载线平，先碰到竖直线 → CC，10 mA、4.7 V；
- [[rc|1.2 kΩ]]：正好穿过直角的拐角——这就是 $R_c$。

这幅图把“CV 还是 CC”变成了一个几何问题：负载线穿过直角的哪一条边。`,
          `On the V–I plane (I across, V up):
- every point the supply can deliver lies on a **right angle**: [[cvline|a horizontal line V = 12 V]] (CV, I from 0 to 10 mA) joined to [[ccline|a vertical line I = 10 mA]] (CC, V from 12 V down);
- every point a resistive load can have lies on a line through the origin, $V = I·R$ — the **load line**, whose slope is R.

Where they cross is the **operating point**:
- [[r2k2|2.2 kΩ]]: a steep load line meets the horizontal edge first → CV, 12 V, $\\frac{12}{2200}$ = 5.45 mA;
- [[r470|470 Ω]]: a shallow load line meets the vertical edge → CC, 10 mA, 4.7 V;
- [[rc|1.2 kΩ]]: passes exactly through the corner — that is $R_c$.

The picture turns "CV or CC?" into geometry: which edge of the right angle the load line crosses.`,
        ),
        table: {
          head: [tr('负载 R', 'Load R'), tr('想要的电流 V_set/R', 'Wanted current V_set/R'), tr('模式', 'Mode'), 'V', 'I'],
          rows: [
            ['2.2 kΩ', '5.45 mA', 'CV', '12 V', '5.45 mA'],
            ['1.2 kΩ', '10 mA', tr('拐点', 'corner'), '12 V', '10 mA'],
            ['470 Ω', '25.5 mA', 'CC', '4.7 V', '10 mA'],
          ],
          parts: ['r2k2', 'rc', 'r470'],
        },
        calcs: ['cc-current-source'],
      },
      {
        id: 'labs',
        short: tr('实验数字', 'Lab numbers'),
        title: tr('⑥ 课程里的数字：负载线不过原点时', '⑥ The course’s numbers: when the load line misses the origin'),
        body: tr(
          `**实验 204（CC 当电流源）**：12 V、限流 10 mA，负载是红 LED（1.8 V + 12 Ω）+ 470 Ω + 电位器 RV（0–1 kΩ）。LED 让负载线 [[ledvf|从 1.8 V 起步]]：$V = 1.8 + I(482 + R_{RV})$。维持 10 mA 需要的电压：
- [[rv0|RV = 0%]]：$1.8 + 0.01 × 482 = 6.62 V$ < 12 V → CC，10 mA；
- [[rv40|RV = 40%（400 Ω）]]：$1.8 + 0.01 × 882 = 10.62 V$ → 还是 CC，10 mA，电压升高了；
- [[rv100|RV = 100%（1 kΩ）]]：需要 $1.8 + 0.01 × 1482 = 16.62 V$ > 12 V，做不到 → 退回 CV，$I = \\frac{12 - 1.8}{1482} = 6.88 mA$。

前两档就是“电流源”的定义：负载变了，电流不变，变的是电压。第三档说明电流源有 **compliance voltage（输出电压上限）**，这里就是 V_set = 12 V。

**挑战 18（限流当保护）**：12 V、限流 50 mA，330 Ω + 两颗白 LED（各 3.0 V + 12 Ω）。正常时 $I = \\frac{12 - 6}{330 + 24} ≈ 17 mA$，CV。如果电阻被短路：不限流时 $\\frac{12 - 6}{24} = 250 mA$，LED 烧掉；有限流时电源进入 CC，50 mA，电压降到 $6 + 0.05 × 24 = 7.2 V$。`,
          `**Lab 204 (CC as a current source)**: 12 V, 10 mA limit, load = red LED (1.8 V + 12 Ω) + 470 Ω + a pot RV (0–1 kΩ). The LED makes the load line [[ledvf|start at 1.8 V]]: $V = 1.8 + I(482 + R_{RV})$. The voltage needed for 10 mA:
- [[rv0|RV = 0%]]: $1.8 + 0.01 × 482 = 6.62 V$ < 12 V → CC, 10 mA;
- [[rv40|RV = 40% (400 Ω)]]: $1.8 + 0.01 × 882 = 10.62 V$ → still CC, 10 mA, at a higher voltage;
- [[rv100|RV = 100% (1 kΩ)]]: needs $1.8 + 0.01 × 1482 = 16.62 V$ > 12 V, impossible → back to CV, $I = \\frac{12 - 1.8}{1482} = 6.88 mA$.

The first two are the definition of a current source: the load changes, the current doesn't, the voltage does. The third shows a current source has a **compliance voltage** — here V_set = 12 V.

**Challenge 18 (the limit as protection)**: 12 V, 50 mA limit, 330 Ω + two white LEDs (3.0 V + 12 Ω each). Normally $I = \\frac{12 - 6}{330 + 24} ≈ 17 mA$, CV. If the resistor gets shorted: with no limit $\\frac{12 - 6}{24} = 250 mA$ and the LEDs die; with the limit the supply goes CC at 50 mA and the voltage drops to $6 + 0.05 × 24 = 7.2 V$.`,
        ),
        table: {
          head: [tr('情况', 'Case'), tr('需要的电压', 'Voltage needed'), tr('模式', 'Mode'), 'V', 'I'],
          rows: [
            ['204 · RV 0%', '6.62 V', 'CC', '6.62 V', '10 mA'],
            ['204 · RV 40%', '10.62 V', 'CC', '10.62 V', '10 mA'],
            ['204 · RV 100%', '16.62 V', 'CV', '12 V', '6.88 mA'],
            [tr('18 · 正常', '18 · normal'), '—', 'CV', '12 V', '17 mA'],
            [tr('18 · 电阻短路', '18 · resistor shorted'), '7.2 V', 'CC', '7.2 V', '50 mA'],
          ],
          parts: ['rv0', 'rv40', 'rv100', null, null],
        },
        formulas: [{ tex: 'V_{need} = V_f + I_{set}·R_{load}', note: tr('V_need < V_set → CC 维持得住；否则退回 CV', 'V_need < V_set → CC holds; otherwise back to CV') }],
        calcs: ['cc-current-source', 'led-resistor'],
      },
      {
        id: 'limits',
        short: tr('局限', 'Limits'),
        title: tr('⑦ 真实电源和理想模型的差别', '⑦ Real supply vs the ideal model'),
        body: tr(
          `模拟器里的电源是理想的：CV 时 0.02 Ω，CC 时电流正好等于设定值，切换瞬间完成。真实电源要注意：
- **怎么设限流**：限流旋钮的刻度不准。常用办法是 [[short|把输出短路]]，看着电流表把 CURRENT 转到想要的值（短路时一定是 CC，显示的电流就是限流值），再拆掉短路线接电路。新手调试建议 50–100 mA。
- **输出电容**：输出端有几百 µF 的电容，充到 V_set。接上负载（或短路）的一瞬间，电容先放电，[[real|电流尖峰]] 远超限流值，几十微秒后 CC 环才追上。对 LED 这种怕过流的器件，先接好电路再打开 OUTPUT。仿真里 [[sim|没有这个尖峰]]。
- **调整管发热**：线性电源里调整管的功耗 $P = (V_{raw} - V_{out})·I$。35 V 内部电压、输出 5 V、1 A：30 W——所以电源有散热片和风扇，有的还会按输出电压切换变压器抽头。
- **显示精度**：一般只有 3–4 位，0.010 A 也许实际是 9.6 mA；精确测量还是要用万用表。`,
          `The simulator's supply is ideal: 0.02 Ω in CV, exactly the set current in CC, instant switching. A real one has catches:
- **Setting the limit**: the CURRENT knob's scale isn't accurate. The usual trick is to [[short|short the output]] and turn CURRENT while watching the display (shorted, it is certainly in CC, so the current shown is the limit), then remove the short and connect the circuit. As a beginner, use 50–100 mA.
- **Output capacitor**: there are hundreds of µF across the output, charged to V_set. The instant you connect a load (or a short) the capacitor discharges first: a [[real|current spike]] far above the limit, until the CC loop catches up tens of microseconds later. For current-sensitive parts like LEDs, wire first, then press OUTPUT. The simulator has [[sim|no such spike]].
- **Pass-transistor heat**: in a linear supply it dissipates $P = (V_{raw} - V_{out})·I$. With 35 V inside, 5 V out at 1 A: 30 W — hence the heatsink and fan, and why some supplies switch transformer taps with the output voltage.
- **Display resolution**: often only 3–4 digits; 0.010 A may really be 9.6 mA. For accurate numbers, use a multimeter.`,
        ),
        table: {
          head: [tr('项目', 'Item'), tr('模拟器', 'Simulator'), tr('真实电源', 'Real supply')],
          rows: [
            [tr('CV 内阻', 'CV output resistance'), '0.02 Ω', tr('毫欧级（引线还有几十 mΩ）', 'milliohms (plus tens of mΩ in the leads)')],
            [tr('CC 电流', 'CC current'), tr('正好等于 I_set', 'exactly I_set'), tr('旋钮刻度不准，要短路设定', 'knob scale inexact: set it with a short')],
            [tr('模式切换', 'mode switch'), tr('瞬间，无过冲', 'instant, no overshoot'), tr('输出电容放电，有电流尖峰', 'output capacitor dumps a spike')],
            [tr('发热', 'heat'), tr('不计', 'ignored'), '$(V_{raw} - V_{out})·I$'],
          ],
          parts: [null, 'short', 'real', null],
        },
      },
    ],
    recap: tr(
      '稳压电源 = 一个调整管 + 两个“谁低听谁”的控制环。CV 时它是理想电压源（V = V_set），CC 时是理想电流源（I = I_set）。负载电阻和 $R_c = V_{set}/I_{set}$ 比：大则 CV，小则 CC；在 V–I 平面上就是负载线穿过直角的哪一条边。把电压调高、限流调到想要的电流，它就是一个有 compliance voltage 的电流源。',
      'A bench supply is one pass transistor plus two control loops where the lower one wins. In CV it is an ideal voltage source (V = V_set), in CC an ideal current source (I = I_set). Compare the load with $R_c = V_{set}/I_{set}$: above → CV, below → CC; on the V–I plane, it is which edge of the right angle the load line crosses. Turn the voltage up and set the limit to the current you want, and it is a current source with a compliance voltage.',
    ),
  };
}
