// Teardown: the MB102 breadboard power module and the AMS1117 / LM1117 LDO regulator inside it.
// The module (jumpers, both rail pairs) → its schematic (DC jack → AMS1117-5.0 → 5 V bus →
// AMS1117-3.3) → the regulator's pins → its block diagram (reference, error amplifier, pass
// transistor, feedback divider) → equivalent circuit and the V_out–V_in curve (regulation vs
// dropout) → power and efficiency with the lab's numbers → why a Li-ion cell + AMS1117-3.3 fails.

import './power.css';
import { tr } from '../../core/i18n';
import { sub, vis } from '../TeardownView';
import type { Teardown } from '../types';

function Res({ x1, y1, x2, y2, part }: { x1: number; y1: number; x2: number; y2: number; part?: string }) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const body = Math.min(46, L - 8);
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
      <line x1={x - 12} y1={y} x2={x + 12} y2={y} />
      <line x1={x - 7} y1={y + 5} x2={x + 7} y2={y + 5} />
      <line x1={x - 3} y1={y + 10} x2={x + 3} y2={y + 10} />
    </g>
  );
}

function Block({ x, y, w, h, part, t1, t2 }: { x: number; y: number; w: number; h: number; part: string; t1: string; t2?: string }) {
  return (
    <g data-part={part}>
      <rect x={x} y={y} width={w} height={h} rx={6} className="pw-block" />
      <text x={x + w / 2} y={y + (t2 ? h / 2 - 2 : h / 2 + 5)} textAnchor="middle" className="pw-block-t">
        {t1}
      </text>
      {t2 && (
        <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" className="pw-tiny">
          {t2}
        </text>
      )}
    </g>
  );
}

/* --------------------------------------------------------------- layer 0: the MB102 module */

const RY = { tp: 92, tn: 116, bp: 324, bn: 348 };

function Module({ layer }: { layer: number }) {
  const jumper = (y: number, part: string) => (
    <g data-part={part}>
      {[222, 250, 278].map((x) => (
        <rect key={x} x={x - 4} y={y - 4} width={8} height={8} fill="#c9a227" />
      ))}
      <rect x={243} y={y - 9} width={42} height={18} rx={3} fill="#1b1c20" />
      <text x={222} y={y + 22} textAnchor="middle" className="pw-on-dark" fontSize={9}>
        3.3V
      </text>
      <text x={250} y={y + 22} textAnchor="middle" className="pw-on-dark" fontSize={9}>
        OFF
      </text>
      <text x={278} y={y + 22} textAnchor="middle" className="pw-on-dark" fontSize={9}>
        5V
      </text>
    </g>
  );
  return (
    <g className={vis(layer, 0, 0)}>
      {/* breadboard rails continuing to the right */}
      <rect x={280} y={70} width={270} height={300} rx={8} fill="#f2ede2" stroke="#b8ab8f" />
      {(
        [
          ['tp', '#e63946', '+'],
          ['tn', '#2b59c3', '−'],
          ['bp', '#e63946', '+'],
          ['bn', '#2b59c3', '−'],
        ] as const
      ).map(([k, c, s]) => (
        <g key={k} data-part={s === '+' ? 'rail-p' : 'rail-n'}>
          <line x1={300} y1={RY[k]} x2={530} y2={RY[k]} stroke={c} strokeWidth={3} opacity={0.75} />
          <text x={546} y={RY[k] + 4} textAnchor="end" fontSize={13} fontWeight={700} fill={c}>
            {s}
          </text>
        </g>
      ))}
      <text x={420} y={226} textAnchor="middle" className="td-small">
        {tr('面包板', 'breadboard')}
      </text>
      {/* the module */}
      <rect x={40} y={70} width={280} height={300} rx={8} fill="#2c5d8f" stroke="#16314f" strokeWidth={2} data-part="pcb" />
      <g data-part="dc">
        <rect x={22} y={130} width={64} height={50} rx={4} fill="#1b1c20" />
        <circle cx={44} cy={155} r={10} fill="#3a3c42" stroke="#888" />
        <text x={54} y={198} textAnchor="middle" className="pw-halo" fontSize={11}>
          DC 6.5–12 V
        </text>
      </g>
      <g data-part="usb">
        <rect x={22} y={240} width={58} height={40} rx={3} className="tdp-metal" />
        <rect x={32} y={252} width={38} height={14} fill="#1b1c20" />
        <text x={54} y={298} textAnchor="middle" className="pw-halo" fontSize={11}>
          USB 5 V
        </text>
      </g>
      <g data-part="switch">
        <rect x={100} y={300} width={30} height={30} rx={3} fill="#e8e3d8" />
        <circle cx={115} cy={315} r={8} fill="#1b1c20" />
        <text x={115} y={346} textAnchor="middle" className="pw-on-dark" fontSize={10}>
          {tr('开关', 'switch')}
        </text>
      </g>
      <g data-part="led">
        <circle cx={160} cy={318} r={6} fill="#4ade80" stroke="#14532d" />
        <text x={160} y={346} textAnchor="middle" className="pw-on-dark" fontSize={10}>
          LED
        </text>
      </g>
      <g data-part="reg5">
        <rect x={110} y={124} width={56} height={30} fill="#1b1c20" />
        <rect x={118} y={112} width={40} height={12} fill="#c9ccd1" />
        <text x={138} y={170} textAnchor="middle" className="pw-on-dark" fontSize={9}>
          AMS1117-5.0
        </text>
      </g>
      <g data-part="reg33 ldo">
        <rect x={110} y={204} width={56} height={30} fill="#1b1c20" />
        <rect x={118} y={192} width={40} height={12} fill="#c9ccd1" />
        <text x={138} y={250} textAnchor="middle" className="pw-on-dark" fontSize={9}>
          AMS1117-3.3
        </text>
      </g>
      {jumper(140, 'jtop')}
      {jumper(290, 'jbot')}
      {/* header pins into the rails */}
      {(
        [
          ['tp', '+', 'rail-p'],
          ['tn', '−', 'rail-n'],
          ['bp', '+', 'rail-p'],
          ['bn', '−', 'rail-n'],
        ] as const
      ).map(([k, s, part]) => (
        <g key={k} data-part={`pins ${part}`}>
          <rect x={300} y={RY[k] - 5} width={10} height={10} fill="#c9a227" stroke="#7d6510" />
          <text x={292} y={RY[k] + 4} textAnchor="end" className="pw-on-dark" fontSize={12}>
            {s}
          </text>
        </g>
      ))}
      <text x={180} y={56} textAnchor="middle" className="tdp-big">
        {tr('MB102 面包板电源模块', 'MB102 breadboard power module')}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layer 1: module schematic */

function ModuleSch({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 1, 1)}>
      <Block x={20} y={84} w={84} h={46} part="dc" t1="DC" t2="6.5–12 V" />
      {/* reverse-protection diode */}
      <g data-part="diode">
        <line x1={104} y1={107} x2={124} y2={107} className="oa-wire" />
        <polygon points="124,97 124,117 140,107" fill="#1f2a44" />
        <line x1={141} y1={96} x2={141} y2={118} className="oa-wire" />
        <line x1={141} y1={107} x2={156} y2={107} className="oa-wire" />
      </g>
      <Block x={156} y={84} w={60} h={46} part="switch" t1={tr('开关', 'switch')} />
      <line x1={216} y1={107} x2={236} y2={107} className="oa-wire" />
      <Block x={236} y={80} w={98} h={54} part="reg5" t1="AMS1117" t2="5.0 V" />
      <line x1={334} y1={107} x2={370} y2={107} className="oa-wire plus" />
      {/* 5 V bus */}
      <line x1={370} y1={100} x2={370} y2={300} className="oa-wire plus" style={{ strokeWidth: 4 }} data-part="bus5" />
      <text x={378} y={96} className="pw-lbl-red" fontSize={12} data-part="bus5">
        {tr('5 V 母线', '5 V bus')}
      </text>
      <Block x={20} y={180} w={84} h={46} part="usb" t1="USB" t2="5 V" />
      <path d="M104 203 L370 203" className="oa-wire plus" strokeDasharray="6 4" data-part="usb" />
      <text x={238} y={196} textAnchor="middle" className="td-small" data-part="usb">
        {tr('USB 直接接 5 V 母线（不经 5 V 稳压器）', 'USB goes straight to the 5 V bus')}
      </text>
      {/* 3.3 V regulator from the 5 V bus */}
      <path d="M370 260 L330 260" className="oa-wire plus" />
      <Block x={232} y={236} w={98} h={50} part="reg33 ldo" t1="AMS1117" t2="3.3 V" />
      <path d="M232 261 L200 261 L200 340 L420 340" className="oa-wire" style={{ stroke: '#d97706' }} data-part="bus33" />
      <text x={210} y={332} className="pw-lbl-amber" fontSize={12} data-part="bus33">
        {tr('3.3 V 母线', '3.3 V bus')}
      </text>
      {/* jumpers */}
      {(
        [
          [140, 'jtop', tr('上排轨', 'top rails')],
          [300, 'jbot', tr('下排轨', 'bottom rails')],
        ] as const
      ).map(([y, part, lbl]) => (
        <g key={part} data-part={part}>
          <line x1={370} y1={y - 16} x2={440} y2={y - 16} className="oa-wire plus" />
          <circle cx={442} cy={y - 16} r={3.5} className="oa-term" />
          <circle cx={442} cy={y + 16} r={3.5} className="oa-term" />
          <circle cx={478} cy={y} r={3.5} className="oa-term" />
          <line x1={478} y1={y} x2={445} y2={y - 14} className="oa-wire" style={{ strokeWidth: 2.5 }} />
          <line x1={478} y1={y} x2={540} y2={y} className="oa-wire plus" />
          <text x={436} y={y - 22} textAnchor="end" className="pw-tiny">
            5V
          </text>
          <text x={436} y={y + 30} textAnchor="end" className="pw-tiny">
            3.3V
          </text>
          <text x={540} y={y - 8} textAnchor="end" className="oa-lbl">
            {lbl} +
          </text>
        </g>
      ))}
      <path d="M420 340 L420 156 L442 156 M420 316 L442 316" className="oa-wire" style={{ stroke: '#d97706' }} data-part="bus33" />
      {/* ground */}
      <line x1={20} y1={400} x2={540} y2={400} className="oa-wire minus" style={{ strokeWidth: 3 }} data-part="gnd rail-n" />
      <text x={540} y={392} textAnchor="end" className="pw-lbl-blue" fontSize={12} data-part="gnd rail-n">
        {tr('GND：上下两条 − 轨', 'GND: both − rails')}
      </text>
      <path d="M62 226 L62 400 M62 130 L62 146 M285 134 L285 150 M281 286 L281 400" className="oa-wire minus" data-part="gnd" />
      <Gnd x={62} y={146} part="gnd" />
      <Gnd x={285} y={150} part="gnd" />
    </g>
  );
}

/* --------------------------------------------------------------- layer 2: packages and pins */

function Packages({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 2, 2)}>
      <text x={140} y={56} textAnchor="middle" className="tdp-big">
        AMS1117 (SOT-223)
      </text>
      <rect x={90} y={100} width={100} height={36} fill="#c9ccd1" stroke="#7d8088" data-part="out" />
      <text x={140} y={124} textAnchor="middle" className="td-small" data-part="out">
        {tr('散热片 = OUT', 'tab = OUT')}
      </text>
      <rect x={70} y={136} width={140} height={100} rx={4} fill="#1b1c20" />
      <text x={140} y={180} textAnchor="middle" className="pw-on-dark" fontSize={13}>
        AMS1117
      </text>
      <text x={140} y={198} textAnchor="middle" className="pw-on-dark" fontSize={13}>
        3.3
      </text>
      {(
        [
          [100, '1', 'GND/ADJ', 'gnd'],
          [140, '2', 'OUT', 'out'],
          [180, '3', 'IN', 'in'],
        ] as const
      ).map(([x, n, name, part]) => (
        <g key={n} data-part={part}>
          <rect x={x - 7} y={236} width={14} height={40} fill="#c9ccd1" stroke="#7d8088" />
          <text x={x} y={294} textAnchor="middle" className="oa-lbl">
            {n}
          </text>
          <text x={x} y={312} textAnchor="middle" className="pw-tiny">
            {name}
          </text>
        </g>
      ))}

      <text x={410} y={56} textAnchor="middle" className="tdp-big">
        {tr('LM1117（TO-220，仿真用）', 'LM1117 (TO-220, simulator)')}
      </text>
      <g data-part="out">
        <rect x={350} y={78} width={120} height={64} rx={4} fill="#c9ccd1" stroke="#7d8088" />
        <circle cx={410} cy={104} r={10} fill="#fffdf8" stroke="#7d8088" />
        <text x={410} y={134} textAnchor="middle" className="td-small">
          {tr('散热片 = OUT', 'tab = OUT')}
        </text>
      </g>
      <rect x={356} y={142} width={108} height={104} rx={3} fill="#1b1c20" />
      <text x={410} y={190} textAnchor="middle" className="pw-on-dark" fontSize={13}>
        LM1117
      </text>
      <text x={410} y={208} textAnchor="middle" className="pw-on-dark" fontSize={13}>
        -3.3
      </text>
      {(
        [
          [380, 'GND', 'gnd'],
          [410, 'OUT', 'out'],
          [440, 'IN', 'in'],
        ] as const
      ).map(([x, name, part]) => (
        <g key={name} data-part={part}>
          <rect x={x - 5} y={246} width={10} height={60} fill="#c9ccd1" stroke="#7d8088" />
          <text x={x} y={324} textAnchor="middle" className="oa-lbl">
            {name}
          </text>
        </g>
      ))}
      <text x={410} y={350} textAnchor="middle" className="td-small">
        {tr('印字面朝你，从左到右', 'printed face towards you, left to right')}
      </text>
      <g data-part="caps">
        <text x={280} y={392} textAnchor="middle" className="td-small" fontWeight={700}>
          {tr('IN、OUT 各接 10 µF 到 GND（OUT 的电容不能省）', '10 µF from IN and from OUT to GND (the OUT one is not optional)')}
        </text>
      </g>
    </g>
  );
}

/* --------------------------------------------------------------- layer 3: block diagram */

function Inside({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 3, 3)}>
      <rect x={70} y={60} width={420} height={330} rx={14} className="pw-dashbox" />
      <text x={280} y={52} textAnchor="middle" className="oa-lbl">
        {tr('LDO 稳压器内部（固定 3.3 V 版）', 'Inside the LDO (fixed 3.3 V version)')}
      </text>
      {/* IN rail and pass transistor */}
      <circle cx={40} cy={110} r={5} className="oa-term" data-part="in" />
      <text x={34} y={98} className="oa-lbl" data-part="in">
        IN
      </text>
      <line x1={40} y1={110} x2={222} y2={110} className="oa-wire" data-part="in" />
      <g data-part="pass">
        <circle cx={250} cy={118} r={24} className="oa-src" />
        <line x1={234} y1={130} x2={266} y2={130} className="oa-wire" style={{ strokeWidth: 3 }} />
        <line x1={240} y1={130} x2={226} y2={110} className="oa-wire" />
        <line x1={260} y1={130} x2={274} y2={110} className="oa-wire" markerEnd="url(#rg-ah)" />
        <line x1={222} y1={110} x2={226} y2={110} className="oa-wire" />
        <text x={250} y={82} textAnchor="middle" className="pw-tiny">
          {tr('调整管 pass transistor', 'pass transistor')}
        </text>
      </g>
      <line x1={274} y1={110} x2={520} y2={110} className="oa-wire" data-part="out" />
      <circle cx={520} cy={110} r={5} className="oa-term" data-part="out" />
      <text x={526} y={98} textAnchor="end" className="oa-lbl" data-part="out">
        OUT
      </text>
      {/* feedback divider */}
      <circle cx={420} cy={110} r={4} className="oa-term" />
      <Res x1={420} y1={110} x2={420} y2={226} part="div" />
      <text x={434} y={172} className="oa-lbl" data-part="div">
        {sub('R_1')}
      </text>
      <circle cx={420} cy={240} r={4} className="oa-term" data-part="fb" />
      <text x={430} y={244} className="pw-lbl-purple" fontSize={12} data-part="fb">
        {sub('V_FB')}
      </text>
      <line x1={420} y1={226} x2={420} y2={240} className="oa-wire" />
      <Res x1={420} y1={240} x2={420} y2={346} part="div" />
      <text x={434} y={300} className="oa-lbl" data-part="div">
        {sub('R_2')}
      </text>
      {/* error amplifier */}
      <g data-part="ea">
        <polygon points="350,212 350,288 280,250" className="oa-tri" />
        <text x={330} y={238} className="oa-sign" fontSize={16}>
          −
        </text>
        <text x={328} y={274} className="oa-sign" fontSize={16}>
          +
        </text>
        <text x={318} y={204} textAnchor="middle" className="pw-tiny">
          {tr('误差放大器', 'error amplifier')}
        </text>
      </g>
      <path d="M420 240 L380 240 L380 232 L350 232" className="oa-wire" data-part="fb" />
      <path d="M280 250 L250 250 L250 130" className="oa-wire" data-part="ea" />
      {/* reference */}
      <path d="M350 268 L370 268 L370 296" className="oa-wire" data-part="vref" />
      <g data-part="vref">
        <circle cx={370} cy={314} r={18} className="oa-src" />
        <text x={370} y={310} textAnchor="middle" className="oa-src-sign">
          +
        </text>
        <text x={370} y={326} textAnchor="middle" className="oa-src-sign">
          −
        </text>
        <text x={346} y={318} textAnchor="end" className="oa-lbl">
          {sub('V_ref')} 1.25 V
        </text>
      </g>
      <path d="M370 332 L370 346 L420 346" className="oa-wire" />
      {/* GND pin */}
      <path d="M370 346 L280 346 L280 410" className="oa-wire" data-part="gnd" />
      <circle cx={280} cy={410} r={5} className="oa-term" data-part="gnd" />
      <text x={290} y={420} className="oa-lbl" data-part="gnd">
        GND / ADJ
      </text>
      <path d="M120 140 Q 180 170 236 132" className="oa-cur" fill="none" markerEnd="url(#rg-ah-i)" data-part="pass" />
      <text x={120} y={160} className="pw-lbl-amber" fontSize={11} data-part="pass">
        {tr('I 从 IN 流到 OUT', 'I flows IN → OUT')}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layer 4: model and V_out(V_in) */

const gx = (v: number) => 300 + v * 24; // V_in 0..10
const gy = (v: number) => 380 - v * 62; // V_out 0..4
const VOUT = (vin: number) => Math.max(0, Math.min(3.3, vin - 1.1 - 0.2 * 0.056));

function Model({ layer }: { layer: number }) {
  const pts = [3.4, 3.7, 4.0, 5, 9];
  return (
    <g className={vis(layer, 4, 4)}>
      {/* equivalent circuit */}
      <circle cx={40} cy={130} r={5} className="oa-term" data-part="in" />
      <text x={40} y={116} textAnchor="middle" className="oa-lbl" data-part="in">
        IN
      </text>
      <line x1={40} y1={130} x2={80} y2={130} className="oa-wire" />
      <Res x1={80} y1={130} x2={190} y2={130} part="rpass" />
      <path d="M100 160 L172 100" className="oa-wire" markerEnd="url(#rg-ah)" data-part="rpass" />
      <text x={135} y={176} textAnchor="middle" className="oa-lbl" data-part="rpass">
        {sub('R_pass')}
      </text>
      <line x1={190} y1={130} x2={240} y2={130} className="oa-wire" />
      <circle cx={240} cy={130} r={5} className="oa-term" data-part="out" />
      <text x={240} y={116} textAnchor="middle" className="oa-lbl" data-part="out">
        OUT
      </text>
      <text x={140} y={206} textAnchor="middle" className="td-small" data-part="rpass">
        {tr('自动调节，让 OUT = 3.3 V', 'auto-adjusted so OUT = 3.3 V')}
      </text>
      <g data-part="iq">
        <line x1={60} y1={130} x2={60} y2={250} className="oa-wire" strokeDasharray="4 3" />
        <Gnd x={60} y={250} />
        <text x={70} y={240} className="td-small">
          {sub('I_q')} ≈ 5 mA
        </text>
      </g>
      <text x={40} y={300} className="td-small" fontWeight={700} data-part="reg">
        {sub(tr('稳压：R_pass = (V_in − 3.3) / I', 'regulating: R_pass = (V_in − 3.3) / I'))}
      </text>
      <text x={40} y={322} className="td-small" fontWeight={700} data-part="drop">
        {sub(tr('压差：R_pass 已到最小，', 'dropout: R_pass is at its minimum,'))}
      </text>
      <text x={40} y={340} className="td-small" fontWeight={700} data-part="drop">
        {sub(tr('V_out = V_in − 1.1 V − 0.2 Ω × I', 'V_out = V_in − 1.1 V − 0.2 Ω × I'))}
      </text>

      {/* graph */}
      <rect x={gx(0)} y={gy(4)} width={gx(4.41) - gx(0)} height={gy(0) - gy(4)} className="pw-area-cc" data-part="drop" />
      <rect x={gx(4.41)} y={gy(4)} width={gx(10) - gx(4.41)} height={gy(0) - gy(4)} className="pw-area-cv" data-part="reg" />
      <line x1={gx(0)} y1={gy(0)} x2={gx(10) + 8} y2={gy(0)} className="oa-axis" />
      <line x1={gx(0)} y1={gy(0)} x2={gx(0)} y2={gy(4) - 8} className="oa-axis" />
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <text key={v} x={gx(v)} y={gy(0) + 16} textAnchor="middle" className="pw-tiny">
          {v}
        </text>
      ))}
      {[1, 2, 3].map((v) => (
        <text key={v} x={gx(0) - 6} y={gy(v) + 4} textAnchor="end" className="pw-tiny">
          {v}
        </text>
      ))}
      <text x={gx(10)} y={gy(0) + 34} textAnchor="end" className="oa-lbl">
        {sub('V_in')} (V)
      </text>
      <text x={gx(0) + 4} y={gy(4) - 12} className="oa-lbl">
        {sub('V_out')} (V)
      </text>
      <line x1={gx(0)} y1={gy(2.5)} x2={gx(10)} y2={gy(2.5)} className="pw-curve-red" style={{ strokeWidth: 1.4 }} strokeDasharray="5 4" data-part="bor" />
      <text x={gx(10) - 2} y={gy(2.5) + 14} textAnchor="end" className="pw-lbl-red" fontSize={10} data-part="bor">
        {tr('ESP32 欠压 2.5 V', 'ESP32 brown-out 2.5 V')}
      </text>
      <polyline points={[1.1, 4.41, 10].map((v) => `${gx(v)},${gy(VOUT(v))}`).join(' ')} className="pw-curve-blue" data-part="curve" />
      {pts.map((v) => (
        <g key={v} data-part={v < 4.41 ? 'drop' : 'reg'}>
          <circle cx={gx(v)} cy={gy(VOUT(v))} r={4.5} className="pw-pt" />
          <text x={gx(v) + (v < 4.41 ? -9 : 0)} y={gy(VOUT(v)) - (v < 4.41 ? 0 : 10)} textAnchor={v < 4.41 ? 'end' : 'middle'} className="pw-tiny" fontWeight={700}>
            {VOUT(v).toFixed(2)}
          </text>
        </g>
      ))}
      <text x={gx(2.2)} y={gy(3.75)} textAnchor="middle" className="pw-lbl-red" fontSize={11} data-part="drop">
        {tr('压差区', 'dropout')}
      </text>
      <text x={gx(7.2)} y={gy(3.75)} textAnchor="middle" className="pw-lbl-green" fontSize={11} data-part="reg">
        {tr('稳压区', 'regulating')}
      </text>
      <text x={gx(4.41)} y={gy(0) - 6} textAnchor="middle" className="pw-tiny" fontWeight={700}>
        4.41
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layer 5: power and efficiency */

function Power({ layer }: { layer: number }) {
  const W = (p: number) => p * 640; // 0.5 W → 320 px
  const row = (y: number, vin: number, part: string) => {
    const pin = vin * 0.056 + vin * 0.005;
    const pout = 3.3 * 0.056;
    const heat = pin - pout;
    return (
      <g data-part={part}>
        <text x={40} y={y + 22} className="oa-lbl">
          {vin} V
        </text>
        <rect x={100} y={y} width={W(pout)} height={34} fill="#2ba59b" />
        <rect x={100 + W(pout)} y={y} width={W(heat)} height={34} fill="#e63946" opacity={0.8} />
        <text x={100 + W(pout) / 2} y={y + 22} textAnchor="middle" className="pw-on-dark" fontSize={11}>
          {Math.round(pout * 1000)} mW
        </text>
        <text x={100 + W(pout) + W(heat) / 2} y={y + 22} textAnchor="middle" className="pw-on-dark" fontSize={11}>
          {Math.round(heat * 1000)} mW
        </text>
        <text x={100} y={y + 52} className="td-small">
          {tr(`η = ${Math.round((pout / pin) * 100)}%，输入 ${Math.round(pin * 1000)} mW`, `η = ${Math.round((pout / pin) * 100)}%, input ${Math.round(pin * 1000)} mW`)}
        </text>
      </g>
    );
  };
  return (
    <g className={vis(layer, 5, 5)}>
      <text x={280} y={50} textAnchor="middle" className="td-panel-title">
        {tr('输入功率 = 给负载的 + 变成热的（56 mA 负载）', 'Input power = to the load + to heat (56 mA load)')}
      </text>
      <g>
        <rect x={100} y={70} width={14} height={14} fill="#2ba59b" />
        <text x={120} y={82} className="td-small">
          {sub(tr('给负载 V_out·I', 'to the load V_out·I'))}
        </text>
        <rect x={300} y={70} width={14} height={14} fill="#e63946" opacity={0.8} />
        <text x={320} y={82} className="td-small">
          {tr('稳压器发热', 'heat in the regulator')}
        </text>
      </g>
      {row(110, 5, 'p5')}
      {row(200, 9, 'p9')}
      <g data-part="p12">
        <rect x={40} y={290} width={480} height={104} rx={10} className="pw-dashbox" />
        <text x={280} y={316} textAnchor="middle" className="oa-lbl">
          {tr('12 V → 3.3 V，500 mA：', '12 V → 3.3 V at 500 mA:')}
        </text>
        <text x={280} y={342} textAnchor="middle" className="pw-lbl-red" fontSize={15}>
          P = (12 − 3.3) × 0.5 = 4.35 W
        </text>
        <text x={280} y={366} textAnchor="middle" className="td-small">
          {tr('SOT-223 约 90 °C/W → 温升 390 °C：不可能。改用 buck 开关电源。', 'SOT-223 ≈ 90 °C/W → +390 °C: impossible. Use a buck converter.')}
        </text>
        <text x={280} y={384} textAnchor="middle" className="td-small">
          {tr('仿真里 LDO 超过 1 W 会报警', 'the simulator flags an LDO above 1 W')}
        </text>
      </g>
    </g>
  );
}

/* --------------------------------------------------------------- layer 6: Li-ion + AMS1117 */

function LiIon({ layer }: { layer: number }) {
  const x = (p: number) => 90 + p * 4.2; // % used
  const y = (v: number) => 390 - ((v - 1.6) / 3.0) * 300; // 1.6..4.6 V
  const bat: [number, number][] = [
    [0, 4.2],
    [5, 4.08],
    [15, 3.95],
    [30, 3.83],
    [50, 3.72],
    [70, 3.63],
    [85, 3.5],
    [93, 3.35],
    [100, 3.0],
  ];
  return (
    <g className={vis(layer, 6)}>
      <rect x={30} y={30} width={510} height={400} rx={14} className="td-panel" />
      <text x={285} y={54} textAnchor="middle" className="td-panel-title">
        {tr('锂电池 + AMS1117-3.3：输出跟着电池往下掉', 'Li-ion + AMS1117-3.3: the output follows the cell down')}
      </text>
      <line x1={x(0)} y1={y(1.6)} x2={x(100) + 8} y2={y(1.6)} className="oa-axis" />
      <line x1={x(0)} y1={y(1.6)} x2={x(0)} y2={y(4.6)} className="oa-axis" />
      {[2, 2.5, 3, 3.5, 4, 4.5].map((v) => (
        <g key={v}>
          <line x1={x(0)} y1={y(v)} x2={x(100)} y2={y(v)} className="pw-grid" />
          <text x={x(0) - 6} y={y(v) + 4} textAnchor="end" className="pw-tiny">
            {v}
          </text>
        </g>
      ))}
      {[0, 50, 100].map((p) => (
        <text key={p} x={x(p)} y={y(1.6) + 16} textAnchor="middle" className="pw-tiny">
          {p}%
        </text>
      ))}
      <text x={x(100)} y={y(1.6) + 30} textAnchor="end" className="td-small" fontWeight={700}>
        {tr('电池已用容量', 'cell capacity used')}
      </text>
      <line x1={x(0)} y1={y(4.41)} x2={x(100)} y2={y(4.41)} className="pw-curve-red" style={{ strokeWidth: 1.8 }} strokeDasharray="6 4" data-part="need" />
      <text x={x(100)} y={y(4.41) - 11} textAnchor="end" className="pw-lbl-red" fontSize={11} data-part="need">
        {sub(tr('AMS1117 需要 V_in ≥ 3.3 + 1.1 = 4.4 V', 'AMS1117 needs V_in ≥ 3.3 + 1.1 = 4.4 V'))}
      </text>
      <line x1={x(0)} y1={y(3.45)} x2={x(100)} y2={y(3.45)} className="pw-curve-green" style={{ strokeWidth: 1.8 }} strokeDasharray="6 4" data-part="good" />
      <text x={x(2)} y={y(3.45) + 14} className="pw-lbl-green" fontSize={11} data-part="good">
        {tr('真 LDO（压差 0.15 V）只要 3.45 V', 'a true LDO (0.15 V dropout) needs only 3.45 V')}
      </text>
      <polyline points={bat.map(([p, v]) => `${x(p)},${y(v)}`).join(' ')} className="pw-curve-blue" data-part="bat" />
      <text x={x(30)} y={y(3.83) - 10} className="pw-lbl-blue" fontSize={12} data-part="bat">
        {tr('锂电池电压 4.2 → 3.0 V', 'Li-ion cell 4.2 → 3.0 V')}
      </text>
      <polyline points={bat.map(([p, v]) => `${x(p)},${y(VOUT(v))}`).join(' ')} className="pw-curve-purple" strokeWidth={3} data-part="vout" />
      <text x={x(28)} y={y(2.83)} className="pw-lbl-purple" fontSize={12} data-part="vout">
        {sub(tr('AMS1117 输出 = V_bat − 1.11 V', 'AMS1117 output = V_bat − 1.11 V'))}
      </text>
      <line x1={x(0)} y1={y(3.0)} x2={x(100)} y2={y(3.0)} className="oa-dash" data-part="spec" />
      <text x={x(2)} y={y(3.0) - 5} className="td-small" data-part="spec">
        {tr('ESP32 规格下限 3.0 V', 'ESP32 spec minimum 3.0 V')}
      </text>
      <line x1={x(0)} y1={y(2.5)} x2={x(100)} y2={y(2.5)} className="pw-curve-red" style={{ strokeWidth: 1.4 }} data-part="bor" />
      <text x={x(2)} y={y(2.5) + 14} className="pw-lbl-red" fontSize={11} data-part="bor">
        {tr('欠压复位 2.5 V（仿真）', 'brown-out reset 2.5 V (sim)')}
      </text>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="rg-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pw-ah" />
        </marker>
        <marker id="rg-ah-i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pw-ah-cur" />
        </marker>
      </defs>
      <Module layer={layer} />
      <ModuleSch layer={layer} />
      <Packages layer={layer} />
      <Inside layer={layer} />
      <Model layer={layer} />
      <Power layer={layer} />
      <LiIon layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'regulator',
    title: tr('电源模块和 LDO 稳压器', 'The power module and the LDO regulator'),
    subtitle: tr(
      'MB102 面包板电源模块能输出稳稳的 5 V 或 3.3 V，靠的是上面两颗 AMS1117 linear regulator（线性稳压器）。我们先看模块，再拆开稳压器：reference（基准）、error amplifier（误差放大器）、pass transistor（调整管）、feedback divider（反馈分压）；然后用它算 dropout（压差）和发热，最后解释“锂电池 + AMS1117-3.3”为什么会出问题。',
      'The MB102 breadboard power module gives a steady 5 V or 3.3 V thanks to two AMS1117 linear regulators. We look at the module first, then open the regulator: reference, error amplifier, pass transistor, feedback divider; then use it to work out dropout and heat, and finally why "Li-ion cell + AMS1117-3.3" goes wrong.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'module',
        short: tr('电源模块', 'Module'),
        title: tr('① 外形：MB102 面包板电源模块', '① Outside: the MB102 breadboard power module'),
        body: tr(
          `MB102 插在面包板的一端，底下的 [[pins|4 根针]] 同时插进 **上下两组** 电源轨：上面的 + / −、下面的 + / −。所以第 7、8 课里，上半区和下半区都能直接取电——这是它和电池、稳压电源（只接一组轨道）最大的不同。

取电有两条路：[[dc|DC 插座]]（6.5–12 V）或 [[usb|USB]]（5 V）。[[switch|开关]] 打开后 [[led|指示灯]] 亮。

每组轨道各有一个 [[jtop|跳线帽]]：插在 “5V” 一边，这组轨道是 5 V；插在 “3.3V” 一边就是 3.3 V；拔掉（OFF）这组轨道没电。所以真实模块上 **上下两组可以是不同电压**。模拟器简化了：一个 voltage 属性同时决定两组，内阻 0.1 Ω，超过约 0.5 A 报过载。

**挑战 8（蓝色 LED）**：蓝 LED 的 $V_f$ ≈ 3.0 V。选 3.3 V：$I = \\frac{3.3 - 3.0}{100 + 12} ≈ 2.7 mA$，很暗；选 5 V：$I = \\frac{5 - 3.0}{112} ≈ 18 mA$。电压余量（headroom）要够。`,
          `The MB102 plugs into one end of the breadboard; its [[pins|4 pins]] go into **both** pairs of rails at once: top + / − and bottom + / −. That's why in lessons 7 and 8 both halves of the board have power — the big difference from a battery or a bench supply, which feed only one pair.

Power comes in one of two ways: the [[dc|DC jack]] (6.5–12 V) or [[usb|USB]] (5 V). Turn the [[switch|switch]] on and the [[led|LED]] lights.

Each rail pair has its own [[jtop|jumper cap]]: on the "5V" side that pair is 5 V; on the "3.3V" side it is 3.3 V; removed (OFF) that pair is dead. So on a real module **the two pairs can be at different voltages**. The simulator simplifies: one voltage property sets both, internal resistance 0.1 Ω, overload flagged above about 0.5 A.

**Challenge 8 (blue LED)**: a blue LED has $V_f$ ≈ 3.0 V. At 3.3 V: $I = \\frac{3.3 - 3.0}{100 + 12} ≈ 2.7 mA$, dim; at 5 V: $I = \\frac{5 - 3.0}{112} ≈ 18 mA$. You need enough headroom.`,
        ),
        table: {
          head: [tr('部件', 'Part'), tr('作用', 'What it does'), tr('数字', 'Numbers')],
          rows: [
            [tr('DC 插座', 'DC jack'), tr('外接电源适配器', 'wall adapter in'), '6.5–12 V'],
            ['USB', tr('从电脑 / 充电器取 5 V', '5 V from a computer / charger'), tr('5 V，约 500 mA', '5 V, ≈ 500 mA')],
            [tr('开关 + LED', 'switch + LED'), tr('总开关、电源指示', 'on/off, power indicator'), '—'],
            ['AMS1117-5.0', tr('DC 输入 → 5 V', 'DC input → 5 V'), tr('最大约 1 A（实际受发热限制）', '≤ 1 A (heat-limited)')],
            ['AMS1117-3.3', tr('5 V → 3.3 V', '5 V → 3.3 V'), tr('同上', 'same')],
            [tr('跳线帽 ×2', 'jumper caps ×2'), tr('每组轨道选 5 V / 3.3 V / OFF', 'per rail pair: 5 V / 3.3 V / OFF'), tr('上下两组各一个', 'one per pair')],
            [tr('针脚 ×4', 'pins ×4'), tr('插进上下两组 + / − 轨', 'into both pairs of + / − rails'), tr('+ 要对准红线', '+ must face the red line')],
          ],
          parts: ['dc', 'usb', 'switch', 'reg5', 'reg33', 'jtop', 'pins'],
        },
        callouts: [{ part: 'reg33', label: tr('这颗就是 LDO', 'this is the LDO'), x: 166, y: 222, lx: 200, ly: 252, anchor: 'start' }],
        calcs: ['led-resistor'],
      },
      {
        id: 'schematic',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：模块的电路——两颗稳压器串起来', '② X-ray: the module’s circuit — two regulators in a chain'),
        body: tr(
          `把模块“画成原理图”：
1. [[dc|DC 插座]] → [[diode|二极管]]（防反接：插头极性反了它不导通，保护后面）→ [[switch|开关]] → [[reg5|AMS1117-5.0]] → [[bus5|5 V 母线]]；
2. 用 [[usb|USB]] 供电时，USB 本来就是 5 V，直接接到 5 V 母线，**不经过** 5 V 稳压器；
3. 5 V 母线再喂给 [[reg33|AMS1117-3.3]]，得到 [[bus33|3.3 V 母线]]；
4. [[jtop|上排跳线]]、[[jbot|下排跳线]] 各自从 5 V 或 3.3 V 里选一个送到轨道的 +；
5. 所有的 GND 连在一起，接到 [[gnd|上下两条 − 轨]]。

注意第 2 点：USB 供电时“5 V”其实就是 USB 的电压（4.75–5.25 V 都算合格），不是稳压器给的。`,
          `Draw the module as a schematic:
1. [[dc|DC jack]] → [[diode|diode]] (reverse protection: with the plug's polarity wrong it blocks and protects what follows) → [[switch|switch]] → [[reg5|AMS1117-5.0]] → [[bus5|5 V bus]];
2. powered from [[usb|USB]], which is already 5 V, it goes straight to the 5 V bus, **not** through the 5 V regulator;
3. the 5 V bus feeds the [[reg33|AMS1117-3.3]], giving the [[bus33|3.3 V bus]];
4. the [[jtop|top jumper]] and [[jbot|bottom jumper]] each pick 5 V or 3.3 V for their rail pair's +;
5. all the GNDs are one node, wired to [[gnd|both − rails]].

Note point 2: on USB power the "5 V" is simply the USB voltage (anything from 4.75 to 5.25 V is in spec), not a regulator's output.`,
        ),
      },
      {
        id: 'pins',
        short: tr('引脚', 'Pins'),
        title: tr('③ 稳压器本身：3 只脚 IN、GND、OUT', '③ The regulator itself: three pins, IN, GND, OUT'),
        body: tr(
          `MB102 上用的是贴片封装 **SOT-223** 的 AMS1117；第 5 期实验（291）里用的是直插 **TO-220** 的 LM1117（印字面朝你，从左到右 GND、OUT、IN）。两者电路上完全一样，3 只脚：
- [[in|IN]]：接较高的输入电压；
- [[out|OUT]]：输出稳定的 3.3 V（或 5 V）。注意 **散热片（tab）也是 OUT**——别让它碰到别的金属；
- [[gnd|GND / ADJ]]：固定电压版接 GND；可调版（ADJ）接反馈电阻。

外面还要两颗 [[caps|电容]]：IN 到 GND 10 µF，OUT 到 GND 10 µF。OUT 的电容是稳压器 **稳定性** 的一部分：没有它，内部的反馈环可能自激振荡，输出变成一串高频波。`,
          `The MB102 uses the AMS1117 in a surface-mount **SOT-223**; lab 291 uses the through-hole **TO-220** LM1117 (printed face towards you, left to right: GND, OUT, IN). Electrically they are the same, three pins:
- [[in|IN]]: the higher input voltage;
- [[out|OUT]]: the steady 3.3 V (or 5 V). Note that **the tab is also OUT** — keep it off other metal;
- [[gnd|GND / ADJ]]: to GND on fixed versions; to the feedback resistors on the adjustable (ADJ) one.

Two [[caps|capacitors]] go outside: 10 µF from IN to GND and 10 µF from OUT to GND. The OUT capacitor is part of the regulator's **stability**: without it the internal feedback loop can oscillate and the output becomes a high-frequency wave.`,
        ),
        table: {
          head: [tr('脚', 'Pin'), 'SOT-223', tr('TO-220（仿真）', 'TO-220 (sim)'), tr('接哪', 'Connect to'), tr('仿真参数', 'Sim model')],
          rows: [
            ['GND / ADJ', '1', tr('左', 'left'), 'GND', tr('静态电流 I_q = 5 mA 从这里流出', 'quiescent current I_q = 5 mA flows out here')],
            ['OUT', tr('2 + 散热片', '2 + tab'), tr('中', 'middle'), tr('负载 + 10 µF', 'load + 10 µF'), tr('3.3 V，限流 800 mA', '3.3 V, 800 mA limit')],
            ['IN', '3', tr('右', 'right'), tr('输入 + 10 µF', 'input + 10 µF'), tr('≥ V_out + 1.1 V', '≥ V_out + 1.1 V')],
          ],
          parts: ['gnd', 'out', 'in'],
        },
      },
      {
        id: 'inside',
        short: tr('内部框图', 'Inside'),
        title: tr('④ 内部：基准 + 误差放大器 + 调整管 + 分压反馈', '④ Inside: reference, error amplifier, pass transistor, divider'),
        body: tr(
          `稳压器是一个 **负反馈** 系统，和 LM358 拆解里的同相放大器是同一个结构：
1. [[vref|基准电压 V_ref]]：一个 bandgap reference（带隙基准），不管输入、温度怎么变都稳定在 1.25 V；
2. [[div|分压电阻 R_1、R_2]] 把输出分一部分回来：$V_{FB} = V_{out}\\frac{R_2}{R_1 + R_2}$；
3. [[ea|误差放大器]] 比较 $V_{FB}$ 和 $V_{ref}$：$V_{FB}$ 偏低 → 输出升高 → 把 [[pass|调整管]] 打开一点，更多电流流向 OUT；偏高则关小；
4. 平衡时（虚短）$V_{FB} = V_{ref}$，所以
$$V_{out} = V_{ref}(1 + \\frac{R_1}{R_2})$$
3.3 V 版：$\\frac{R_1}{R_2} = \\frac{3.3}{1.25} - 1 = 1.64$。

调整管串在 IN 和 OUT 之间，**所有** 负载电流都从它身上流过，它两端的电压 $V_{in} - V_{out}$ 就落在它身上——这一层解释了下面两层的“压差”和“发热”。

（可调版 LM1117-ADJ：1.25 V 在 OUT 和 ADJ 之间，数据手册写作 $V_{out} = 1.25 V × (1 + \\frac{R_2}{R_1})$，常用 R_1 = 120 Ω、R_2 = 200 Ω → 3.33 V，名字和这里的图正好反过来。）`,
          `A regulator is a **negative-feedback** system with the same structure as the non-inverting amplifier in the LM358 teardown:
1. [[vref|the reference V_ref]]: a bandgap reference that stays at 1.25 V whatever the input or temperature;
2. [[div|the divider R_1, R_2]] feeds part of the output back: $V_{FB} = V_{out}\\frac{R_2}{R_1 + R_2}$;
3. the [[ea|error amplifier]] compares $V_{FB}$ with $V_{ref}$: $V_{FB}$ low → its output rises → it opens the [[pass|pass transistor]] a little, more current flows to OUT; high → it closes it;
4. in balance (virtual short) $V_{FB} = V_{ref}$, so
$$V_{out} = V_{ref}(1 + \\frac{R_1}{R_2})$$
For 3.3 V: $\\frac{R_1}{R_2} = \\frac{3.3}{1.25} - 1 = 1.64$.

The pass transistor sits in series between IN and OUT; **all** the load current flows through it, and the voltage $V_{in} - V_{out}$ sits across it — this explains the "dropout" and the "heat" of the next two layers.

(The adjustable LM1117-ADJ has the 1.25 V between OUT and ADJ; its datasheet writes $V_{out} = 1.25 V × (1 + \\frac{R_2}{R_1})$ with R_1 = 120 Ω, R_2 = 200 Ω → 3.33 V — the names are swapped relative to this figure.)`,
        ),
        table: {
          head: [tr('方块', 'Block'), tr('作用', 'Job'), tr('类比', 'Analogy')],
          rows: [
            [tr('基准 V_ref', 'reference V_ref'), tr('一个不变的 1.25 V', 'a fixed 1.25 V'), tr('同相放大器的 v_in', 'the v_in of a non-inverting amp')],
            [tr('分压 R_1、R_2', 'divider R_1, R_2'), tr('把 V_out 缩小送回', 'feeds back a fraction of V_out'), tr('β = R_2/(R_1 + R_2)', 'β = R_2/(R_1 + R_2)')],
            [tr('误差放大器', 'error amplifier'), tr('放大 V_ref − V_FB', 'amplifies V_ref − V_FB'), 'op-amp'],
            [tr('调整管', 'pass transistor'), tr('可变“阀门”，吃掉多余电压', 'a variable “valve” that eats the extra voltage'), tr('op-amp 的输出级', 'the op-amp’s output stage')],
          ],
          parts: ['vref', 'div', 'ea', 'pass'],
        },
        formulas: [
          {
            tex: 'V_{out} = V_{ref}(1 + \\frac{R_1}{R_2})',
            note: tr('V_ref = 1.25 V；和同相放大器 1 + R_f/R_1 同一个式子', 'V_ref = 1.25 V; the same formula as a non-inverting amp’s 1 + R_f/R_1'),
          },
        ],
        calcs: ['opamp-noninverting'],
      },
      {
        id: 'model',
        short: tr('压差', 'Dropout'),
        title: tr('⑤ 等效电路：一个自动调节的电阻，以及压差', '⑤ Equivalent circuit: a self-adjusting resistor, and dropout'),
        body: tr(
          `从外面看，线性稳压器就是一个串在 IN 和 OUT 之间的 [[rpass|自动调节的电阻 R_pass]]，再加一点流到 GND 的 [[iq|静态电流 I_q]]。

**稳压区**：反馈环把 $R_{pass}$ 调到正好 $R_{pass} = \\frac{V_{in} - 3.3}{I}$。例如 5 V、56 mA：$R_{pass} = \\frac{1.7}{0.056} ≈ 30 Ω$。

**压差区**：输入降低，$R_{pass}$ 就得变小……但调整管再怎么全开，也要留一个最小压降——**dropout voltage（压差）**。LM1117 / AMS1117 约 1.1 V（它的调整管是 NPN，基极驱动要再多一个 $V_{BE}$，所以不算真正的“低”压差）。于是：
$$V_{in} ≥ V_{out} + V_{dropout} = 3.3 + 1.1 = 4.4 V$$
不满足时 [[drop|输出跟着输入往下掉]]。仿真模型：$V_{out} = V_{in} - 1.1 V - 0.2 Ω × I$。

**实验 291 的数字**（负载 56 mA，拐点 $1.1 + 0.2 × 0.056 + 3.3 = 4.41 V$）：
- 5 V、9 V：[[reg|稳压]]，3.30 V；
- 4.0 V：$4.0 - 1.11 = 2.89 V$——已经不是 3.3 V，但 ESP32 还在跑；
- 3.7 V：2.59 V；
- 3.4 V：2.29 V，低于 [[bor|欠压阈值 2.5 V]]，ESP32 复位，LED 灭。`,
          `From outside, a linear regulator is just a [[rpass|self-adjusting resistor R_pass]] in series between IN and OUT, plus a little [[iq|quiescent current I_q]] to GND.

**Regulating**: the feedback loop sets $R_{pass}$ to exactly $R_{pass} = \\frac{V_{in} - 3.3}{I}$. E.g. 5 V at 56 mA: $R_{pass} = \\frac{1.7}{0.056} ≈ 30 Ω$.

**Dropout**: as the input falls, $R_{pass}$ must shrink … but even fully on the pass transistor needs a minimum voltage across it — the **dropout voltage**. For the LM1117 / AMS1117 it is about 1.1 V (its pass device is an NPN whose base drive needs one more $V_{BE}$, so it isn't truly "low" dropout). Hence:
$$V_{in} ≥ V_{out} + V_{dropout} = 3.3 + 1.1 = 4.4 V$$
Below that [[drop|the output follows the input down]]. Simulator model: $V_{out} = V_{in} - 1.1 V - 0.2 Ω × I$.

**Lab 291's numbers** (56 mA load, knee at $1.1 + 0.2 × 0.056 + 3.3 = 4.41 V$):
- 5 V, 9 V: [[reg|regulating]], 3.30 V;
- 4.0 V: $4.0 - 1.11 = 2.89 V$ — no longer 3.3 V, but the ESP32 still runs;
- 3.7 V: 2.59 V;
- 3.4 V: 2.29 V, below the [[bor|2.5 V brown-out threshold]]: the ESP32 resets, the LED goes out.`,
        ),
        table: {
          head: [tr('V_in', 'V_in'), tr('模式', 'Mode'), 'V_out', 'ESP32'],
          rows: [
            ['9 V', tr('稳压', 'regulating'), '3.30 V', tr('运行（但很热）', 'runs (but hot)')],
            ['5 V', tr('稳压', 'regulating'), '3.30 V', tr('运行', 'runs')],
            ['4.0 V', tr('压差', 'dropout'), '2.89 V', tr('运行（低于 3.0 V 规格）', 'runs (below the 3.0 V spec)')],
            ['3.7 V', tr('压差', 'dropout'), '2.59 V', tr('勉强', 'barely')],
            ['3.4 V', tr('压差', 'dropout'), '2.29 V', tr('欠压复位', 'brown-out reset')],
          ],
          parts: ['reg', 'reg', 'drop', 'drop', 'bor'],
        },
        formulas: [
          { tex: 'V_{in} ≥ V_{out} + V_{dropout}', note: tr('稳压的条件；LM1117 / AMS1117：V_dropout ≈ 1.1 V', 'the condition to regulate; LM1117 / AMS1117: V_dropout ≈ 1.1 V') },
          { tex: 'V_{out} = V_{in} - 1.1 V - 0.2 Ω × I', note: tr('压差区（仿真模型）', 'in dropout (simulator model)') },
        ],
        calcs: ['ldo-dropout'],
      },
      {
        id: 'power',
        short: tr('发热', 'Heat'),
        title: tr('⑥ 发热和效率：多出来的电压全变成热', '⑥ Heat and efficiency: the extra voltage all turns into heat'),
        body: tr(
          `线性稳压器 **不能** 把多出来的电压“换成”电流：输入电流 ≈ 输出电流（再加 $I_q$）。功率守恒：
1. 输入功率：$P_{in} = V_{in}(I + I_q)$
2. 给负载的：$P_{out} = V_{out}·I$
3. 差值全部在调整管上变成热：$P = (V_{in} - V_{out})·I + V_{in}·I_q$
4. 效率：$η = \\frac{P_{out}}{P_{in}} ≈ \\frac{V_{out}}{V_{in}}$

**实验 291**（I = 56 mA，$I_q$ = 5 mA）：
- [[p5|5 V]]：$(5 - 3.3) × 0.056 = 95 mW$，加上 $I_q$ 的 25 mW 约 120 mW，η ≈ 61%；
- [[p9|9 V]]：$(9 - 3.3) × 0.056 = 319 mW$，加 45 mW 约 364 mW，η ≈ 34%——2/3 的能量变成热。

温度怎么估：$ΔT = P × θ_{JA}$。SOT-223 焊在小板上 $θ_{JA}$ ≈ 90 °C/W：0.36 W → 温升约 33 °C，摸上去烫手但还行。[[p12|12 V → 3.3 V、500 mA]] 就是 4.35 W，根本不可能——要用 **buck（降压）开关电源**，效率 85–95%。

MB102 也一样：DC 插座接 12 V、5 V 轨上拉 200 mA，AMS1117-5.0 要发热 $(12 - 5) × 0.2 = 1.4 W$。所以 **DC 输入用 7–9 V 最好**，够压差、又不太热。`,
          `A linear regulator **cannot** trade extra voltage for current: input current ≈ output current (plus $I_q$). Power balance:
1. Input power: $P_{in} = V_{in}(I + I_q)$
2. To the load: $P_{out} = V_{out}·I$
3. The difference becomes heat in the pass transistor: $P = (V_{in} - V_{out})·I + V_{in}·I_q$
4. Efficiency: $η = \\frac{P_{out}}{P_{in}} ≈ \\frac{V_{out}}{V_{in}}$

**Lab 291** (I = 56 mA, $I_q$ = 5 mA):
- [[p5|5 V]]: $(5 - 3.3) × 0.056 = 95 mW$, plus 25 mW for $I_q$ ≈ 120 mW, η ≈ 61%;
- [[p9|9 V]]: $(9 - 3.3) × 0.056 = 319 mW$, plus 45 mW ≈ 364 mW, η ≈ 34% — two thirds of the energy becomes heat.

Estimating temperature: $ΔT = P × θ_{JA}$. A SOT-223 on a small board has $θ_{JA}$ ≈ 90 °C/W: 0.36 W → about 33 °C rise, hot to the touch but OK. [[p12|12 V → 3.3 V at 500 mA]] is 4.35 W — impossible; use a **buck (step-down) switching converter**, 85–95% efficient.

The MB102 is the same: 12 V into the DC jack and 200 mA drawn from the 5 V rails heats the AMS1117-5.0 by $(12 - 5) × 0.2 = 1.4 W$. So **7–9 V is the best DC input**: enough headroom, not too hot.`,
        ),
        table: {
          head: [tr('情况', 'Case'), tr('发热 P', 'Heat P'), tr('效率 η', 'Efficiency η'), tr('温升（90 °C/W）', 'Rise (90 °C/W)')],
          rows: [
            ['5 V → 3.3 V, 56 mA', '≈ 0.12 W', '61%', '≈ 11 °C'],
            ['9 V → 3.3 V, 56 mA', '≈ 0.36 W', '34%', '≈ 33 °C'],
            ['12 V → 5 V, 200 mA (MB102)', '1.4 W', '42%', tr('≈ 126 °C：过热保护', '≈ 126 °C: thermal shutdown')],
            ['12 V → 3.3 V, 500 mA', '4.35 W', '28%', tr('不可能', 'impossible')],
          ],
          parts: ['p5', 'p9', null, 'p12'],
        },
        formulas: [
          { tex: 'P = (V_{in} - V_{out})·I', note: tr('调整管的发热（忽略 I_q）', 'heat in the pass transistor (ignoring I_q)') },
          { tex: 'η ≈ \\frac{V_{out}}{V_{in}}', note: tr('线性稳压器效率的上限', 'the best a linear regulator can do') },
        ],
        calcs: ['ldo-dropout', 'power'],
      },
      {
        id: 'li-ion',
        short: tr('锂电池', 'Li-ion'),
        title: tr('⑦ 为什么“锂电池 + AMS1117-3.3”会出问题', '⑦ Why “Li-ion cell + AMS1117-3.3” fails'),
        body: tr(
          `一节锂离子电池满电 4.2 V、标称 3.7 V、放完 3.0 V，[[bat|大部分时间在 3.6–3.9 V]]。把它接到 AMS1117-3.3 的 IN：
- 稳压需要 [[need|V_in ≥ 4.4 V]]——**整条曲线都在它下面**，连满电的 4.2 V 都不够；
- 所以稳压器一直在压差区，[[vout|输出 = V_bat − 1.11 V]]：满电 3.09 V，标称 2.6 V，已经低于 ESP32 的 [[spec|3.0 V 规格下限]]；
- 再一开 Wi-Fi（电流尖峰几百 mA），$0.2 Ω × I$ 再往下拉，碰到 [[bor|欠压阈值]] 就复位，然后又启动、又复位……

**正确做法**：
- 选真正的 low-dropout（低压差）LDO：ME6211、HT7333、XC6220、RT9080，压差 0.1–0.25 V，[[good|只要约 3.45 V]] 就能稳压，几乎用完整节电池；
- 或者用 buck-boost（升降压）开关电源，电池从 4.2 V 到 3.0 V 都能输出 3.3 V；
- ESP32-DevKitC 板上就是 AMS1117：用锂电池时不要接 5V 脚，接到 3V3 脚并在前面用低压差 LDO。

**这一层的局限也一并列出**：仿真的 LDO 没有输出电容的稳定性问题、没有温度和热关断，压差是一个固定的 1.1 V + 0.2 Ω。`,
          `A Li-ion cell is 4.2 V full, 3.7 V nominal and 3.0 V empty, [[bat|spending most of its life at 3.6–3.9 V]]. Connect it to the IN of an AMS1117-3.3:
- regulation needs [[need|V_in ≥ 4.4 V]] — **the whole curve is below it**; even 4.2 V full is not enough;
- so the regulator is always in dropout and [[vout|the output = V_bat − 1.11 V]]: 3.09 V full, 2.6 V nominal, already below the ESP32's [[spec|3.0 V minimum]];
- switch on Wi-Fi (current spikes of a few hundred mA) and $0.2 Ω × I$ pulls it down further; it hits the [[bor|brown-out threshold]], resets, boots, resets …

**What to do instead**:
- use a true low-dropout LDO: ME6211, HT7333, XC6220, RT9080, with 0.1–0.25 V dropout; [[good|about 3.45 V is enough]], so almost the whole cell is usable;
- or a buck-boost switching converter, which gives 3.3 V from 4.2 V all the way down to 3.0 V;
- the ESP32-DevKitC carries an AMS1117: on a Li-ion cell don't feed the 5V pin; feed the 3V3 pin from a low-dropout LDO.

**The limits of the model, too**: the simulated LDO has no output-capacitor stability issue, no temperature or thermal shutdown, and its dropout is a fixed 1.1 V + 0.2 Ω.`,
        ),
        table: {
          head: [tr('稳压器', 'Regulator'), tr('压差', 'Dropout'), tr('锂电池可用到', 'Usable down to'), tr('效率', 'Efficiency')],
          rows: [
            ['AMS1117 / LM1117', '1.1 V', tr('4.4 V（一点都用不了）', '4.4 V (none of the cell)'), 'V_out / V_in'],
            ['ME6211 / HT7333', '0.1–0.25 V', '≈ 3.45 V', 'V_out / V_in'],
            [tr('Buck-boost 开关电源', 'buck-boost converter'), '—', '≈ 2.5 V', '85–95%'],
          ],
          parts: ['need', 'good', null],
        },
        calcs: ['ldo-dropout'],
      },
    ],
    recap: tr(
      'MB102 = DC 插座 → AMS1117-5.0 → 5 V，再 → AMS1117-3.3 → 3.3 V，跳线帽给上下两组轨道各选一个电压。LDO 内部是带负反馈的“自动可变电阻”：$V_{out} = V_{ref}(1 + R_1/R_2)$；要稳压必须 $V_{in} ≥ V_{out} + V_{dropout}$（AMS1117 约 1.1 V）；多出来的电压全变成热 $P = (V_{in} - V_{out})·I$。锂电池配 AMS1117-3.3 永远在压差区——换真正的低压差 LDO 或开关电源。',
      'MB102 = DC jack → AMS1117-5.0 → 5 V, then → AMS1117-3.3 → 3.3 V, with a jumper choosing the voltage of each rail pair. Inside an LDO is a "self-adjusting resistor" under negative feedback: $V_{out} = V_{ref}(1 + R_1/R_2)$; to regulate you need $V_{in} ≥ V_{out} + V_{dropout}$ (≈ 1.1 V for the AMS1117); the extra voltage all becomes heat, $P = (V_{in} - V_{out})·I$. A Li-ion cell on an AMS1117-3.3 is always in dropout — use a true low-dropout LDO or a switching converter.',
    ),
  };
}
