// Teardown: the LM358 dual op-amp. Package and pinout → X-ray (two op-amps on one die, shared
// power) → the triangle symbol → the equivalent circuit the professor draws (R_in, A·v_d, R_out)
// → the transfer curve (why an op-amp without feedback slams into a rail) → the ideal op-amp and
// its two golden rules → negative feedback, derived step by step (follower, non-inverting,
// inverting) → what is really inside (input pair, gain stage, output stage) and why the output
// can't reach V+.

import { tr } from '../../core/i18n';
import { sub, vis } from '../TeardownView';
import type { Teardown } from '../types';

// symbol geometry (layers 2–7)
const TL = { x: 150, y: 110 };
const BL = { x: 150, y: 350 };
const AP = { x: 410, y: 230 };
const Y_INN = 170;
const Y_INP = 290;

function Triangle({ faint, part = 'tri' }: { faint?: boolean; part?: string }) {
  return <polygon points={`${TL.x},${TL.y} ${BL.x},${BL.y} ${AP.x},${AP.y}`} className={`oa-tri ${faint ? 'faint' : ''}`} data-part={part} />;
}

/** zig-zag resistor between two points (vertical or horizontal) */
function Res({ x1, y1, x2, y2, part, cls = '' }: { x1: number; y1: number; x2: number; y2: number; part?: string; cls?: string }) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const nx = -uy;
  const ny = ux;
  const body = 44;
  const a = (L - body) / 2;
  const pts: string[] = [`${x1},${y1}`, `${x1 + ux * a},${y1 + uy * a}`];
  for (let k = 1; k <= 6; k++) {
    const t = a + (body * k) / 6.5;
    const s = k % 2 ? 7 : -7;
    pts.push(`${x1 + ux * t + nx * s},${y1 + uy * t + ny * s}`);
  }
  pts.push(`${x1 + ux * (a + body)},${y1 + uy * (a + body)}`, `${x2},${y2}`);
  return <polyline points={pts.join(' ')} className={`oa-wire ${cls}`} fill="none" data-part={part} />;
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

/* --------------------------------------------------------------------- the package (layers 0–1) */

const PIN_Y = [130, 190, 250, 310];
const PINS: { n: number; side: 'L' | 'R'; y: number; name: string; part: string }[] = [
  { n: 1, side: 'L', y: PIN_Y[0], name: 'OUT A', part: 'outA' },
  { n: 2, side: 'L', y: PIN_Y[1], name: 'IN− A', part: 'innA' },
  { n: 3, side: 'L', y: PIN_Y[2], name: 'IN+ A', part: 'inpA' },
  { n: 4, side: 'L', y: PIN_Y[3], name: 'V− / GND', part: 'vminus' },
  { n: 8, side: 'R', y: PIN_Y[0], name: 'V+', part: 'vplus' },
  { n: 7, side: 'R', y: PIN_Y[1], name: 'OUT B', part: 'outB' },
  { n: 6, side: 'R', y: PIN_Y[2], name: 'IN− B', part: 'innB' },
  { n: 5, side: 'R', y: PIN_Y[3], name: 'IN+ B', part: 'inpB' },
];

function Package({ layer }: { layer: number }) {
  const xray = layer >= 1;
  return (
    <g className={vis(layer, 0, 1)}>
      <rect x={220} y={96} width={120} height={248} rx={8} className="oa-body" data-part="body" style={{ opacity: xray ? 0.25 : 1 }} />
      <path d="M262 96 a18 18 0 0 0 36 0" className="oa-notch" data-part="notch" />
      <circle cx={236} cy={118} r={5} className="oa-dot" data-part="dot" />
      {PINS.map((p) => {
        const x = p.side === 'L' ? 196 : 340;
        return (
          <g key={p.n} data-part={`${p.part} pin${p.n}`}>
            <rect x={x} y={p.y - 9} width={24} height={18} rx={2} className="oa-pin" />
            <text x={p.side === 'L' ? 186 : 374} y={p.y + 5} textAnchor={p.side === 'L' ? 'end' : 'start'} className="oa-pin-name">
              {p.name}
            </text>
            <text x={p.side === 'L' ? 208 : 352} y={p.y + 5} textAnchor="middle" className="oa-pin-num">
              {p.n}
            </text>
          </g>
        );
      })}
      <text x={280} y={226} textAnchor="middle" className={`oa-mark ${xray ? 'td-hide' : 'td-show'}`} transform="rotate(-90 280 226)">
        LM358
      </text>
      {/* pin-numbering arrow */}
      <path d="M100 122 C 92 190, 92 260, 100 318" className={`oa-arrow ${xray ? 'td-hide' : 'td-show'}`} markerEnd="url(#oa-ah)" />
      <text x={40} y={348} className={`td-small ${xray ? 'td-hide' : 'td-show'}`}>
        {tr('从缺口逆时针数', 'count anticlockwise')}
      </text>

      {/* X-ray: die, two amplifiers, bond wires, shared power */}
      <g className={vis(layer, 1, 1)}>
        <rect x={244} y={150} width={72} height={140} rx={4} className="oa-die" data-part="die" />
        <polygon points="252,166 252,206 284,186" className="oa-mini" data-part="ampA" />
        <text x={262} y={190} className="oa-mini-lbl">
          A
        </text>
        <polygon points="308,236 308,276 276,256" className="oa-mini" data-part="ampB" />
        <text x={292} y={260} className="oa-mini-lbl">
          B
        </text>
        <g className="oa-bond" data-part="bond">
          <path d="M252 172 L220 130" />
          <path d="M252 180 L220 190" />
          <path d="M252 198 L220 250" />
          <path d="M308 244 L340 190" />
          <path d="M308 252 L340 250" />
          <path d="M276 256 L340 310" />
        </g>
        <path d="M262 155 L262 150 M262 150 L340 130" className="oa-power plus" data-part="vplus" />
        <path d="M296 285 L296 290 M296 290 L220 310" className="oa-power minus" data-part="vminus" />
        <path d="M262 155 L262 166 M296 285 L296 276 M262 155 L300 155 L300 236 M296 285 L260 285 L260 206" className="oa-power shared" data-part="vplus vminus" />
      </g>
    </g>
  );
}

/* --------------------------------------------------------------------- symbol and models */

function Inputs({ labels = true }: { labels?: boolean }) {
  return (
    <g>
      <line x1={60} y1={Y_INN} x2={TL.x} y2={Y_INN} className="oa-wire" data-part="inn" />
      <line x1={60} y1={Y_INP} x2={BL.x} y2={Y_INP} className="oa-wire" data-part="inp" />
      <text x={166} y={Y_INN + 6} className="oa-sign" data-part="inn">
        −
      </text>
      <text x={164} y={Y_INP + 7} className="oa-sign" data-part="inp">
        +
      </text>
      {labels && (
        <>
          <text x={56} y={Y_INN - 8} className="oa-lbl" data-part="inn">
            IN− (v₋)
          </text>
          <text x={56} y={Y_INP - 8} className="oa-lbl" data-part="inp">
            IN+ (v₊)
          </text>
        </>
      )}
    </g>
  );
}

function Rails() {
  return (
    <g>
      <line x1={280} y1={170} x2={280} y2={72} className="oa-wire plus" data-part="vplus" />
      <text x={288} y={84} className="oa-lbl plus" data-part="vplus">
        V+ (8)
      </text>
      <line x1={280} y1={290} x2={280} y2={388} className="oa-wire minus" data-part="vminus" />
      <text x={288} y={384} className="oa-lbl minus" data-part="vminus">
        V− (4)
      </text>
    </g>
  );
}

function Output({ x2 = 510 }: { x2?: number }) {
  return (
    <g>
      <line x1={AP.x} y1={AP.y} x2={x2} y2={AP.y} className="oa-wire" data-part="out" />
      <circle cx={x2} cy={AP.y} r={4} className="oa-term" data-part="out" />
      <text x={x2 - 4} y={AP.y - 10} textAnchor="end" className="oa-lbl" data-part="out">
        OUT (vₒ)
      </text>
    </g>
  );
}

function Symbol({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 2, 2)}>
      <Triangle />
      <Inputs />
      <Rails />
      <Output />
      <g data-part="vd">
        <path d={`M98 ${Y_INN + 8} L98 ${Y_INP - 8}`} className="oa-vd" markerStart="url(#oa-ah)" markerEnd="url(#oa-ah)" />
        <text x={104} y={234} className="oa-lbl vd">
          {sub('v_d')}
        </text>
      </g>
    </g>
  );
}

function Model({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 3, 3)}>
      <Triangle faint />
      <Inputs />
      <Rails />
      <Output />
      {/* R_in across the inputs */}
      <line x1={TL.x} y1={Y_INN} x2={200} y2={Y_INN} className="oa-wire" data-part="rin" />
      <line x1={BL.x} y1={Y_INP} x2={200} y2={Y_INP} className="oa-wire" data-part="rin" />
      <Res x1={200} y1={Y_INN} x2={200} y2={Y_INP} part="rin" />
      <text x={210} y={234} className="oa-lbl" data-part="rin">
        {sub('R_in')}
      </text>
      {/* dependent source A·v_d referenced to ground, then R_out */}
      <g data-part="vcvs">
        <polygon points="300,206 324,230 300,254 276,230" className="oa-src" />
        <text x={300} y={226} textAnchor="middle" className="oa-src-sign">
          +
        </text>
        <text x={300} y={246} textAnchor="middle" className="oa-src-sign">
          −
        </text>
        <text x={300} y={196} textAnchor="middle" className="oa-lbl">
          {sub('A·v_d')}
        </text>
        <line x1={300} y1={254} x2={300} y2={300} className="oa-wire" />
      </g>
      <Gnd x={300} y={300} part="vcvs" />
      <line x1={324} y1={230} x2={334} y2={230} className="oa-wire" data-part="rout" />
      <Res x1={334} y1={230} x2={AP.x} y2={AP.y} part="rout" />
      <text x={372} y={204} textAnchor="middle" className="oa-lbl" data-part="rout">
        {sub('R_out')}
      </text>
    </g>
  );
}

function Transfer({ layer }: { layer: number }) {
  // axes: v_d from -150 µV to +150 µV (x 90..470), v_o 0..9 V (y 380..110)
  const x = (uv: number) => 280 + (uv / 150) * 190;
  const y = (v: number) => 380 - (v / 9) * 270;
  return (
    <g className={vis(layer, 4, 4)}>
      <rect x={40} y={70} width={480} height={360} rx={14} className="td-panel" />
      <line x1={70} y1={y(0)} x2={500} y2={y(0)} className="oa-axis" />
      <line x1={280} y1={96} x2={280} y2={400} className="oa-axis" />
      <text x={500} y={y(0) + 18} textAnchor="end" className="oa-lbl">
        {sub('v_d = v₊ − v₋')}
      </text>
      <text x={288} y={104} className="oa-lbl">
        vₒ
      </text>
      <line x1={70} y1={y(9)} x2={500} y2={y(9)} className="oa-rail plus" />
      <text x={74} y={y(9) - 6} className="oa-lbl plus">
        V+ = 9 V
      </text>
      <line x1={70} y1={y(7.5)} x2={500} y2={y(7.5)} className="oa-rail" />
      <text x={74} y={y(7.5) + 16} className="td-small">
        {tr('输出上限 ≈ V+ − 1.5 V = 7.5 V', 'output limit ≈ V+ − 1.5 V = 7.5 V')}
      </text>
      <polyline points={`${x(-150)},${y(0)} ${x(0)},${y(0)}`} className="oa-curve" data-part="sat-lo" />
      <polyline points={`${x(0)},${y(0)} ${x(75)},${y(7.5)}`} className="oa-curve lin" data-part="linear" />
      <polyline points={`${x(75)},${y(7.5)} ${x(150)},${y(7.5)}`} className="oa-curve" data-part="sat-hi" />
      <line x1={x(75)} y1={y(7.5)} x2={x(75)} y2={y(0)} className="oa-dash" />
      <text x={x(75)} y={y(0) + 18} textAnchor="middle" className="oa-lbl">
        75 µV
      </text>
      <text x={x(-75)} y={y(0) - 10} textAnchor="middle" className="td-small" data-part="sat-lo">
        {tr('饱和在 0 V', 'stuck at 0 V')}
      </text>
      <text x={x(112)} y={y(7.5) - 10} textAnchor="middle" className="td-small" data-part="sat-hi">
        {tr('饱和在 7.5 V', 'stuck at 7.5 V')}
      </text>
    </g>
  );
}

function Ideal({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 5, 5)}>
      <Triangle faint />
      <Inputs />
      <Rails />
      <Output />
      <g data-part="vopen">
        <path d={`M120 ${Y_INN - 16} l14 0`} className="oa-cur" markerEnd="url(#oa-ah)" />
        <path d={`M120 ${Y_INP - 16} l14 0`} className="oa-cur" markerEnd="url(#oa-ah)" />
        <text x={100} y={Y_INN - 22} className="oa-lbl cur">
          i₋ = 0
        </text>
        <text x={100} y={Y_INP - 22} className="oa-lbl cur">
          i₊ = 0
        </text>
        <line x1={196} y1={Y_INN + 30} x2={204} y2={Y_INN + 22} className="oa-gap" />
        <line x1={196} y1={Y_INP - 30} x2={204} y2={Y_INP - 22} className="oa-gap" />
        <text x={210} y={Y_INN + 30} className="td-small">
          {sub('R_in → ∞')}
        </text>
      </g>
      <g data-part="vshort">
        <path d={`M184 ${Y_INN} L184 ${Y_INP}`} className="oa-short" />
        <text x={188} y={236} className="oa-lbl vd">
          v₊ = v₋
        </text>
      </g>
      <text x={320} y={250} className="oa-lbl" data-part="ainf">
        A → ∞
      </text>
      <text x={430} y={260} className="td-small" data-part="rout">
        {sub('R_out → 0')}
      </text>
    </g>
  );
}

function Follower({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 6, 6)}>
      <Triangle />
      <Inputs labels={false} />
      <Rails />
      <Output x2={500} />
      <path d={`M460 ${AP.y} L460 ${Y_INN - 70} L100 ${Y_INN - 70} L100 ${Y_INN} L150 ${Y_INN}`} className="oa-wire fb" data-part="fb" />
      <circle cx={460} cy={AP.y} r={4} className="oa-term" data-part="fb" />
      <text x={390} y={Y_INN - 78} textAnchor="middle" className="oa-lbl fb" data-part="fb">
        {tr('负反馈：vₒ 接回 IN−', 'negative feedback: vₒ back to IN−')}
      </text>
      <g data-part="vin">
        <circle cx={60} cy={Y_INP} r={4} className="oa-term" />
        <text x={56} y={Y_INP + 22} className="oa-lbl">
          {sub('v_in')}
        </text>
      </g>
    </g>
  );
}

function NonInv({ layer }: { layer: number }) {
  // feedback divider: OUT → Rf → node(v₋) → R1 → GND
  const nx = 110;
  return (
    <g className={vis(layer, 7, 7)}>
      <Triangle />
      <Inputs labels={false} />
      <Rails />
      <Output x2={500} />
      <path d={`M460 ${AP.y} L460 70 L300 70`} className="oa-wire" data-part="rf" />
      <Res x1={300} y1={70} x2={nx} y2={70} part="rf" />
      <text x={205} y={58} textAnchor="middle" className="oa-lbl" data-part="rf">
        {sub('R_f')}
      </text>
      <path d={`M${nx} 70 L${nx} ${Y_INN} L150 ${Y_INN}`} className="oa-wire" data-part="beta" />
      <circle cx={nx} cy={Y_INN} r={4} className="oa-term" data-part="beta" />
      <text x={nx - 6} y={Y_INN + 4} textAnchor="end" className="oa-lbl" data-part="beta">
        βvₒ
      </text>
      <Res x1={nx} y1={Y_INN} x2={nx} y2={250} part="r1" />
      <text x={nx - 10} y={214} textAnchor="end" className="oa-lbl" data-part="r1">
        {sub('R_1')}
      </text>
      <Gnd x={nx} y={250} part="r1" />
      <g data-part="vin">
        <circle cx={60} cy={Y_INP} r={4} className="oa-term" />
        <text x={56} y={Y_INP + 22} className="oa-lbl">
          {sub('v_in')}
        </text>
      </g>
    </g>
  );
}

function Stages({ layer }: { layer: number }) {
  const box = (x: number, part: string, t1: string, t2: string) => (
    <g data-part={part}>
      <rect x={x} y={170} width={130} height={110} rx={10} className="oa-stage" />
      <text x={x + 65} y={210} textAnchor="middle" className="oa-stage-t">
        {t1}
      </text>
      <text x={x + 65} y={232} textAnchor="middle" className="td-small">
        {t2}
      </text>
    </g>
  );
  return (
    <g className={vis(layer, 8)}>
      <rect x={20} y={70} width={520} height={360} rx={14} className="td-panel" />
      <text x={280} y={98} textAnchor="middle" className="td-panel-title">
        {tr('真正的 LM358 内部（简化框图）', 'Inside a real LM358 (simplified)')}
      </text>
      <line x1={40} y1={130} x2={520} y2={130} className="oa-wire plus" data-part="vplus" />
      <text x={44} y={124} className="oa-lbl plus" data-part="vplus">
        V+
      </text>
      <line x1={40} y1={330} x2={520} y2={330} className="oa-wire minus" data-part="vminus" />
      <text x={44} y={350} className="oa-lbl minus" data-part="vminus">
        V− / GND
      </text>
      {box(40, 'stage-in', tr('① 输入级', '① input stage'), tr('PNP 差分对', 'PNP differential pair'))}
      {box(210, 'stage-gain', tr('② 增益级', '② gain stage'), tr('电压放大 ×10⁵', 'voltage gain ×10⁵'))}
      {box(380, 'stage-out', tr('③ 输出级', '③ output stage'), tr('推挽 push-pull', 'push-pull'))}
      <line x1={170} y1={225} x2={210} y2={225} className="oa-wire" markerEnd="url(#oa-ah)" />
      <line x1={340} y1={225} x2={380} y2={225} className="oa-wire" markerEnd="url(#oa-ah)" />
      <g data-part="cc">
        <path d="M275 170 L275 150 L292 150 M298 150 L318 150 L318 170" className="oa-wire" />
        <line x1={292} y1={140} x2={292} y2={160} className="oa-wire" />
        <line x1={298} y1={140} x2={298} y2={160} className="oa-wire" />
        <text x={330} y={150} className="oa-lbl">
          {sub('C_c')}
        </text>
      </g>
      <g data-part="headroom">
        <path d="M480 132 L480 168" className="oa-vd" markerStart="url(#oa-ah)" markerEnd="url(#oa-ah)" />
        <text x={488} y={156} className="oa-lbl vd">
          ≈1.5 V
        </text>
      </g>
      <g data-part="cm">
        <path d="M60 280 L60 328" className="oa-vd" markerStart="url(#oa-ah)" markerEnd="url(#oa-ah)" />
        <text x={66} y={312} className="td-small">
          {tr('输入可到 0 V', 'inputs down to 0 V')}
        </text>
      </g>
      <text x={30} y={210} className="oa-lbl" data-part="stage-in">
        IN±
      </text>
      <text x={522} y={222} textAnchor="end" className="oa-lbl" data-part="stage-out">
        OUT
      </text>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="oa-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="oa-ah" />
        </marker>
      </defs>
      <Package layer={layer} />
      <Symbol layer={layer} />
      <Model layer={layer} />
      <Transfer layer={layer} />
      <Ideal layer={layer} />
      <Follower layer={layer} />
      <NonInv layer={layer} />
      <Stages layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'lm358',
    title: tr('LM358：一颗芯片里的两个 op-amp', 'LM358: two op-amps in one chip'),
    subtitle: tr(
      'op-amp = operational amplifier（运算放大器）。我们从芯片外形一路拆到教授在黑板上画的那个三角形，再拆到三角形里面的等效电路，最后用它推出每一个放大器公式。',
      'op-amp = operational amplifier. We take the chip apart from its package down to the triangle your professor draws, then into the equivalent circuit inside the triangle, and derive every amplifier formula from it.',
    ),
    viewBox: '0 0 560 460',
    Figure,
    layers: [
      {
        id: 'package',
        short: tr('外形', 'Package'),
        title: tr('① 外形：8 只脚的黑色小芯片（DIP-8）', '① Package: a small black 8-pin chip (DIP-8)'),
        body: tr(
          `LM358 装在 **DIP-8** 封装里（Dual In-line Package，两排直插，8 只脚）。怎么找 1 脚：
- 芯片一端有个 [[notch|半圆缺口 notch]]，缺口朝上时，左上角有个 [[dot|小圆点]] 的就是 **1 脚**；
- 从 1 脚开始 **逆时针** 数：左边一排从上往下 1、2、3、4，再从右边一排从下往上 5、6、7、8。

8 只脚分成三类：**A 号 op-amp 的 3 只脚**、**B 号 op-amp 的 3 只脚**、**两个 op-amp 共用的 2 只电源脚**。把鼠标放到下表每一行上，看它在芯片上的位置。`,
          `The LM358 comes in a **DIP-8** package (Dual In-line Package: two rows, 8 pins). Finding pin 1:
- one end has a [[notch|half-moon notch]]; with the notch at the top, the corner with the [[dot|little dot]] (top left) is **pin 1**;
- count **anticlockwise** from pin 1: down the left side 1, 2, 3, 4, then up the right side 5, 6, 7, 8.

The 8 pins fall into three groups: **3 pins of op-amp A**, **3 pins of op-amp B**, and **2 power pins shared by both**. Hover each row of the table to see where it is on the chip.`,
        ),
        table: {
          head: [tr('脚', 'Pin'), tr('名字', 'Name'), tr('属于', 'Belongs to'), tr('它是什么', 'What it is'), tr('单电源时接哪', 'Single supply: connect to')],
          rows: [
            ['1', 'OUT A', 'op-amp A', tr('输出（output）', 'output'), tr('负载 / 反馈网络', 'the load / feedback network')],
            ['2', 'IN− A', 'op-amp A', tr('反相输入（inverting input）', 'inverting input'), tr('反馈回来的信号', 'the feedback signal')],
            ['3', 'IN+ A', 'op-amp A', tr('同相输入（non-inverting input）', 'non-inverting input'), tr('要放大的信号 / 参考电压', 'the signal / a reference')],
            ['4', 'V− (GND)', tr('A、B 共用', 'shared'), tr('负电源', 'negative supply'), 'GND'],
            ['5', 'IN+ B', 'op-amp B', tr('同相输入', 'non-inverting input'), tr('不用时接固定电压', 'unused: tie to a fixed voltage')],
            ['6', 'IN− B', 'op-amp B', tr('反相输入', 'inverting input'), tr('不用时接 7 脚（跟随器）', 'unused: tie to pin 7 (follower)')],
            ['7', 'OUT B', 'op-amp B', tr('输出', 'output'), '—'],
            ['8', 'V+', tr('A、B 共用', 'shared'), tr('正电源 3–32 V', 'positive supply 3–32 V'), '+5 V / +9 V'],
          ],
          parts: ['outA', 'innA', 'inpA', 'vminus', 'inpB', 'innB', 'outB', 'vplus'],
        },
        callouts: [
          { part: 'notch', label: tr('缺口：这一端是上', 'notch: this end up'), x: 280, y: 112, lx: 420, ly: 60 },
          { part: 'dot', label: tr('1 脚标记', 'pin-1 mark'), x: 236, y: 118, lx: 110, ly: 104 },
        ],
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：硅片上有两个 op-amp，电源脚共用', '② X-ray: two op-amps on the silicon, sharing the power pins'),
        body: tr(
          `把黑色塑料变透明：中间是一小块 [[die|硅片 die]]，细细的 [[bond|金线 bond wire]] 把硅片连到 8 只脚上。硅片上做了两个完全一样、互相独立的放大器：[[ampA|op-amp A]] 和 [[ampB|op-amp B]]。

“**Dual**（双）”就是这个意思。它们只共用两样东西：[[vplus|V+（8 脚）]] 和 [[vminus|V−（4 脚）]]。所以：
- 只要芯片插上电，A 和 B **都** 通电了，哪怕你只用 A；
- 不用的那一半不能让它的输入悬空——悬空的输入会让它乱跳甚至振荡，干扰另一半。通常把它接成跟随器（7 脚接 6 脚），5 脚接一个固定电压。`,
          `Make the black plastic transparent: in the middle is a small [[die|silicon die]], and thin [[bond|bond wires]] connect it to the 8 pins. On the die are two identical, independent amplifiers: [[ampA|op-amp A]] and [[ampB|op-amp B]].

That is what "**dual**" means. They share only two things: [[vplus|V+ (pin 8)]] and [[vminus|V− (pin 4)]]. So:
- once the chip is powered, **both** A and B are on, even if you only use A;
- don't leave the unused half's inputs floating — a floating input lets it swing around or oscillate and disturb the other half. Wire it as a follower (pin 7 to pin 6) with pin 5 on a fixed voltage.`,
        ),
        callouts: [
          { part: 'die', label: tr('硅片', 'die'), x: 316, y: 220, lx: 440, ly: 220 },
          { part: 'bond', label: tr('金线', 'bond wires'), x: 236, y: 160, lx: 120, ly: 60 },
        ],
      },
      {
        id: 'symbol',
        short: tr('符号', 'Symbol'),
        title: tr('③ 符号：教授画的那个三角形', '③ The symbol: the triangle on the blackboard'),
        body: tr(
          `原理图里，一个 op-amp 画成一个 [[tri|三角形]]，信号从左往右走：
- [[inn|IN−（反相输入 inverting input）]]：标“−”的那只脚，它上面的电压记作 $v₋$；
- [[inp|IN+（同相输入 non-inverting input）]]：标“+”的那只脚，电压记作 $v₊$；
- [[out|OUT（输出）]]：三角形的尖，电压 $v_o$；
- [[vplus|V+]] 和 [[vminus|V−]]：电源脚。理论题里常常 **省略不画**，但真实电路里必须接，否则它不工作。

注意：“+”“−”不是电源正负极，而是“这只输入对输出的作用是同向还是反向”。op-amp 只关心两个输入之间的 **差**：
$$v_d = v₊ - v₋$$
[[vd|v_d]] 叫 **差模输入电压**（differential input voltage）。`,
          `On a schematic an op-amp is a [[tri|triangle]] and signals flow left to right:
- [[inn|IN− (inverting input)]]: the pin marked "−"; its voltage is $v₋$;
- [[inp|IN+ (non-inverting input)]]: the pin marked "+"; its voltage is $v₊$;
- [[out|OUT]]: the tip of the triangle, voltage $v_o$;
- [[vplus|V+]] and [[vminus|V−]]: the power pins. Theory problems often **leave them out**, but a real circuit needs them or nothing works.

Note: "+" and "−" are not the supply polarity. They say whether that input pushes the output the same way or the opposite way. An op-amp only cares about the **difference** between its inputs:
$$v_d = v₊ - v₋$$
[[vd|v_d]] is the **differential input voltage**.`,
        ),
        table: {
          head: [tr('端子', 'Terminal'), tr('符号', 'Symbol'), tr('LM358 A 的脚', 'LM358 pin (A)'), tr('作用', 'Role')],
          rows: [
            ['IN+', '$v₊$', '3', tr('$v₊$ 升高 → $v_o$ 升高', '$v₊$ up → $v_o$ up')],
            ['IN−', '$v₋$', '2', tr('$v₋$ 升高 → $v_o$ 降低', '$v₋$ up → $v_o$ down')],
            ['OUT', '$v_o$', '1', tr('输出 $A·v_d$', 'outputs $A·v_d$')],
            ['V+ / V−', '—', '8 / 4', tr('能量从这里来，也限制 $v_o$ 的范围', 'power comes from here; it also limits $v_o$')],
          ],
          parts: ['inp', 'inn', 'out', 'vplus'],
        },
        formulas: [{ tex: 'v_d = v₊ - v₋', note: tr('op-amp 唯一“看”的量', 'the only thing an op-amp looks at') }],
      },
      {
        id: 'model',
        short: tr('等效电路', 'Model'),
        title: tr('④ 拆开三角形：三个元件的等效电路', '④ Inside the triangle: a three-element equivalent circuit'),
        body: tr(
          `教授说“把 op-amp 拆成电路”，拆出来就是这三样（这是电路课里 op-amp 的 **线性模型**）：

1. [[rin|输入电阻 R_in]]：接在两个输入之间。LM358 的输入只取约 20 nA 的偏置电流，等效 $R_{in}$ 在 MΩ 以上，计算时可以当成 **开路**——输入端几乎不取电流。
2. [[vcvs|受控电压源 A·v_d]]：一个电压 **控制** 的电压源（VCVS），它的电压是输入差的 A 倍。A 叫 **开环增益**（open-loop gain），LM358 约 $10^5$（100 dB）。
3. [[rout|输出电阻 R_out]]：受控源到输出脚之间，几十 Ω 量级。

于是不接任何反馈时：
$$v_o = A·v_d = A(v₊ - v₋)$$
这个电路你在第 5 章“含运算放大器的电阻电路”和受控源那一节都能直接用结点法分析。`,
          `When the professor "takes the op-amp apart into a circuit", these three elements come out (the **linear model** of an op-amp used in circuit analysis):

1. [[rin|input resistance R_in]] between the two inputs. The LM358's inputs draw only about 20 nA of bias current, so $R_{in}$ is in the MΩ range and up — treat it as an **open circuit**: the inputs take almost no current.
2. [[vcvs|a dependent source A·v_d]]: a voltage-controlled voltage source (VCVS) whose voltage is A times the input difference. A is the **open-loop gain**, about $10^5$ (100 dB) for the LM358.
3. [[rout|output resistance R_out]] between the source and the output pin, tens of ohms.

So with no feedback at all:
$$v_o = A·v_d = A(v₊ - v₋)$$
You can analyse this with nodal analysis exactly like any circuit with a dependent source (chapter 5, op-amp circuits).`,
        ),
        table: {
          head: [tr('参数', 'Parameter'), tr('LM358（典型）', 'LM358 (typical)'), tr('理想 op-amp', 'Ideal op-amp'), tr('计算时', 'In calculations')],
          rows: [
            [tr('开环增益 A', 'open-loop gain A'), '≈ 10⁵ (100 dB)', '∞', tr('很大 → 得出“虚短”', 'huge → "virtual short"')],
            [tr('输入电阻 R_in', 'input resistance R_in'), tr('MΩ 以上（偏置 20 nA）', '≥ MΩ (20 nA bias)'), '∞', tr('开路 → 得出“虚断”', 'open → "virtual open"')],
            [tr('输出电阻 R_out', 'output resistance R_out'), tr('几十 Ω（仿真 10 Ω）', 'tens of Ω (sim: 10 Ω)'), '0', tr('反馈后更小，可忽略', 'smaller still with feedback')],
          ],
          parts: ['vcvs', 'rin', 'rout'],
        },
        formulas: [{ tex: 'v_o = A(v₊ - v₋)', note: tr('开环（不接反馈），且输出没到电源边界时', 'open loop, while the output is inside the supply range') }],
        calcs: ['opamp-open-loop'],
      },
      {
        id: 'transfer',
        short: tr('不接反馈', 'No feedback'),
        title: tr('⑤ 不接反馈会怎样？——输出一下子撞到电源', '⑤ What without feedback? The output slams into a rail'),
        body: tr(
          `用上一层的公式算一下。LM358 接 9 V 单电源，输出最多到约 7.5 V。要让输出在 0–7.5 V 之间（[[linear|线性区]]），输入差只能是：
$$0 < v_d < \\frac{7.5 V}{10^5} = 75 µV$$
75 微伏！你手一碰导线、电位器动一点点、甚至输入失调电压（LM358 典型 2 mV）都比它大几十倍。所以 **开环** 的 op-amp 几乎永远停在两头：
- $v₊ > v₋$（哪怕多 1 mV）→ 输出 [[sat-hi|顶到 ≈ V+ − 1.5 V]]
- $v₊ < v₋$ → 输出 [[sat-lo|掉到 ≈ 0 V]]

这叫 **饱和**（saturation）。这样用 op-amp 就成了 **比较器**（comparator）：只回答“哪个输入大”。想让它当放大器，必须加 **负反馈**——下面两层就讲为什么反馈能把 $v_d$ 稳稳地压在 75 µV 以内。`,
          `Use the formula from the last layer. On a 9 V single supply the LM358 output reaches about 7.5 V at most. For the output to stay between 0 and 7.5 V (the [[linear|linear region]]) the input difference must be:
$$0 < v_d < \\frac{7.5 V}{10^5} = 75 µV$$
75 microvolts! Touching a wire, nudging a pot, even the input offset voltage (2 mV typical for the LM358) is tens of times bigger. So an **open-loop** op-amp almost always sits at one end:
- $v₊ > v₋$ (by even 1 mV) → the output [[sat-hi|tops out at ≈ V+ − 1.5 V]]
- $v₊ < v₋$ → the output [[sat-lo|drops to ≈ 0 V]]

That is **saturation**. Used this way an op-amp is a **comparator**: it only says which input is larger. To make it an amplifier you need **negative feedback** — the next two layers show how feedback holds $v_d$ inside those 75 µV.`,
        ),
        formulas: [{ tex: '|v_d| < \\frac{V_{sat}}{A} = \\frac{7.5}{10^{5}} = 75 µV', note: tr('线性区有多窄', 'how narrow the linear region is') }],
        calcs: ['opamp-open-loop'],
      },
      {
        id: 'ideal',
        short: tr('理想化', 'Ideal'),
        title: tr('⑥ 理想 op-amp 的两条黄金法则：虚短、虚断', '⑥ The ideal op-amp: two golden rules'),
        body: tr(
          `把等效电路里的三个参数推到极限：$A → ∞$、$R_{in} → ∞$、$R_{out} → 0$。电路课的所有 op-amp 题都用这两条法则：

**法则 1 · 虚断（virtual open）**：$R_{in} → ∞$，所以 [[vopen|两个输入端都不取电流]]：
$$i_+ = i_- = 0$$
**法则 2 · 虚短（virtual short）**：有负反馈、输出没饱和时，$v_o$ 是有限值（几伏），而 $v_d = \\frac{v_o}{A}$，A → ∞，所以 [[vshort|两个输入电压相等]]：
$$v₊ = v₋$$
“虚”的意思：两个输入 **电压相等，但并没有真的连在一起**（没有电流流过）。

⚠ 虚短 **只在有负反馈时成立**。上一层的开环电路里 $v₊ ≠ v₋$，输出是饱和的。`,
          `Push the three parameters of the model to their limits: $A → ∞$, $R_{in} → ∞$, $R_{out} → 0$. Every op-amp problem in a circuits course uses these two rules:

**Rule 1 · virtual open**: $R_{in} → ∞$, so [[vopen|neither input takes current]]:
$$i_+ = i_- = 0$$
**Rule 2 · virtual short**: with negative feedback and an unsaturated output, $v_o$ is finite (a few volts) and $v_d = \\frac{v_o}{A}$ with A → ∞, so [[vshort|the two input voltages are equal]]:
$$v₊ = v₋$$
"Virtual" means the inputs are at **the same voltage but not actually connected** (no current flows between them).

⚠ The virtual short **only holds with negative feedback**. In the open-loop circuit of the last layer $v₊ ≠ v₋$ and the output is saturated.`,
        ),
        table: {
          head: [tr('法则', 'Rule'), tr('式子', 'Equation'), tr('来自', 'Comes from'), tr('什么时候成立', 'Holds when')],
          rows: [
            [tr('虚断', 'virtual open'), '$i_+ = i_- = 0$', '$R_{in} → ∞$', tr('总是（输入电流 nA 级）', 'always (nA input current)')],
            [tr('虚短', 'virtual short'), '$v₊ = v₋$', '$A → ∞$', tr('有负反馈且输出未饱和', 'negative feedback and no saturation')],
          ],
          parts: ['vopen', 'vshort'],
        },
      },
      {
        id: 'follower',
        short: tr('跟随器', 'Follower'),
        title: tr('⑦ 负反馈第一例：电压跟随器，一步步推', '⑦ Feedback, example 1: the voltage follower, step by step'),
        body: tr(
          `把 [[fb|输出直接接回 IN−]]，[[vin|信号接 IN+]]。先 **不用** 黄金法则，用 ④ 的模型硬算（忽略 $R_{out}$）：
1. 接线告诉我们：$v₊ = v_{in}$，$v₋ = v_o$
2. op-amp 的方程：$v_o = A(v₊ - v₋) = A(v_{in} - v_o)$
3. 移项：$v_o(1 + A) = A·v_{in}$
4. 所以 $v_o = \\frac{A}{1+A}v_{in}$。代入 $A = 10^5$：$v_o = 0.99999 v_{in}$

再看反馈 **为什么能稳住**：如果 $v_o$ 偏低，$v_d = v_{in} - v_o$ 变大，A 倍放大后把 $v_o$ 往上推；偏高则往下拉。输出一直“追”着输入，$v_d$ 只剩 $\\frac{v_o}{A}$——几十 µV。

用黄金法则一行就出来：虚短 $v₋ = v₊$，而 $v₋ = v_o$，所以 $v_o = v_{in}$。两种方法结果一致，这就是黄金法则的来历。

**用处**：输入几乎不取电流（虚断），输出能提供几十 mA——它把“带不动负载的信号”变成“能带负载的信号”，叫 **缓冲器**（buffer）。`,
          `Wire [[fb|the output straight back to IN−]] and [[vin|the signal to IN+]]. First solve it **without** the golden rules, with the model of ④ (ignoring $R_{out}$):
1. The wiring says: $v₊ = v_{in}$, $v₋ = v_o$
2. The op-amp's equation: $v_o = A(v₊ - v₋) = A(v_{in} - v_o)$
3. Rearrange: $v_o(1 + A) = A·v_{in}$
4. So $v_o = \\frac{A}{1+A}v_{in}$. With $A = 10^5$: $v_o = 0.99999 v_{in}$

Now **why feedback holds it steady**: if $v_o$ is a bit low, $v_d = v_{in} - v_o$ grows and, multiplied by A, pushes $v_o$ up; too high, it pulls it down. The output keeps chasing the input, and $v_d$ is left at only $\\frac{v_o}{A}$ — tens of µV.

With the golden rules it is one line: virtual short $v₋ = v₊$, and $v₋ = v_o$, so $v_o = v_{in}$. Both methods agree — that is where the golden rules come from.

**What for**: the input takes almost no current (virtual open) while the output can supply tens of mA — it turns "a signal that can't drive a load" into one that can. It is called a **buffer**.`,
        ),
        formulas: [{ tex: 'v_o = \\frac{A}{1+A} v_{in} ≈ v_{in}', note: tr('有限 A 的精确结果', 'exact result with a finite A') }],
        calcs: ['opamp-follower'],
      },
      {
        id: 'noninv',
        short: tr('放大器', 'Amplifiers'),
        title: tr('⑧ 负反馈第二例：同相放大器和反相放大器', '⑧ Feedback, example 2: non-inverting and inverting amplifiers'),
        body: tr(
          `跟随器把 **全部** 输出送回 IN−。如果只送回 **一部分**，就能放大。用 [[rf|R_f]] 和 [[r1|R_1]] 分压，送回 IN− 的是 [[beta|βvₒ]]：
$$β = \\frac{R_1}{R_1 + R_f}$$
**同相放大器**（non-inverting），信号接 IN+：
1. 虚断：IN− 不取电流，所以 R_f、R_1 是简单的串联分压：$v₋ = β v_o$
2. 虚短：$v₋ = v₊ = v_{in}$
3. 所以 $β v_o = v_{in}$，$v_o = \\frac{1}{β}v_{in} = (1 + \\frac{R_f}{R_1})v_{in}$

用有限 A 推（同 ⑦ 的方法）得到 $v_o = \\frac{A}{1+Aβ}v_{in}$：只要 $Aβ ≫ 1$，增益就只由 **两个电阻** 决定，和 op-amp 本身的 A 无关——这就是负反馈的价值。

**反相放大器**（inverting）：IN+ 接 GND，信号经 $R_1$ 接 IN−，$R_f$ 从 OUT 接回 IN−。
1. 虚短：$v₋ = v₊ = 0$，IN− 是 **虚地**（virtual ground）
2. 虚断：流进 $R_1$ 的电流全部流过 $R_f$：$\\frac{v_{in} - 0}{R_1} = \\frac{0 - v_o}{R_f}$
3. 所以 $v_o = -\\frac{R_f}{R_1}v_{in}$（负号 = 反相）`,
          `The follower sends **all** of the output back to IN−. Send back only **part** of it and you get gain. [[rf|R_f]] and [[r1|R_1]] form a divider, and what reaches IN− is [[beta|βvₒ]]:
$$β = \\frac{R_1}{R_1 + R_f}$$
**Non-inverting amplifier**, signal on IN+:
1. Virtual open: IN− takes no current, so R_f and R_1 are a plain series divider: $v₋ = β v_o$
2. Virtual short: $v₋ = v₊ = v_{in}$
3. So $β v_o = v_{in}$, $v_o = \\frac{1}{β}v_{in} = (1 + \\frac{R_f}{R_1})v_{in}$

With a finite A (the method of ⑦) you get $v_o = \\frac{A}{1+Aβ}v_{in}$: as long as $Aβ ≫ 1$ the gain is set by **two resistors only**, not by the op-amp's A — that is the point of negative feedback.

**Inverting amplifier**: IN+ to GND, the signal through $R_1$ into IN−, $R_f$ from OUT back to IN−.
1. Virtual short: $v₋ = v₊ = 0$ — IN− is a **virtual ground**
2. Virtual open: all the current in $R_1$ goes on through $R_f$: $\\frac{v_{in} - 0}{R_1} = \\frac{0 - v_o}{R_f}$
3. So $v_o = -\\frac{R_f}{R_1}v_{in}$ (the minus sign = inverted)`,
        ),
        table: {
          head: [tr('电路', 'Circuit'), tr('增益 vₒ / v_in', 'Gain vₒ / v_in'), tr('输入电阻', 'Input resistance'), tr('实验', 'Lab')],
          rows: [
            [tr('跟随器', 'follower'), '1', '∞', '2-5'],
            [tr('同相放大', 'non-inverting'), '$1 + \\frac{R_f}{R_1}$', '∞', '2-6'],
            [tr('反相放大', 'inverting'), '$-\\frac{R_f}{R_1}$', '$R_1$', '2-7'],
            [tr('反相求和', 'inverting summer'), '$-R_f(\\frac{v_1}{R_1} + \\frac{v_2}{R_2})$', '$R_1$, $R_2$', '2-8'],
          ],
          parts: [null, 'rf', 'r1', null],
        },
        formulas: [
          { tex: 'β = \\frac{R_1}{R_1 + R_f}', note: tr('反馈系数：输出送回 IN− 的比例', 'feedback factor: the share of vₒ fed back to IN−') },
          { tex: 'v_o = \\frac{A}{1 + Aβ} v_{in} ≈ \\frac{1}{β} v_{in}', note: tr('Aβ ≫ 1 时增益只取决于电阻', 'for Aβ ≫ 1 the gain depends only on the resistors') },
        ],
        calcs: ['opamp-noninverting', 'opamp-inverting', 'opamp-summing'],
      },
      {
        id: 'stages',
        short: tr('晶体管级', 'Transistors'),
        title: tr('⑨ 再往里：三级晶体管电路，和它的“缺点”', '⑨ Deeper: three transistor stages, and their limits'),
        body: tr(
          `三角形里真正的东西是约 20 个晶体管，分三级：
1. [[stage-in|输入级：PNP 差分对]]——只放大两个输入的 **差**。LM358 用 PNP 管，所以 [[cm|输入电压可以低到 0 V（GND）]]，这就是它能单电源工作的原因；输入上限约 V+ − 1.5 V。
2. [[stage-gain|增益级]]——提供 $10^5$ 倍的电压增益。里面的 [[cc|补偿电容 C_c]] 让高频增益逐渐下降，防止接反馈后振荡，代价是 **带宽**：增益 × 带宽 ≈ 1 MHz（GBW）。
3. [[stage-out|输出级：推挽]]——一个管子往上推电流、一个往下拉，提供几十 mA。往上推的那一路有两个 $V_{BE}$ 压降，所以 [[headroom|输出到不了 V+，差约 1.5 V]]；往下拉的那一路能接近 0 V。

这一层解释了你在课里看到的三个“现象”：
- 第 14 课：输入 9 V，输出只有 7.5 V → 输出级的余量；
- 放大倍数做 100 倍时带宽只剩约 10 kHz → $GBW ≈ 1 MHz$；
- 方波边沿变成斜坡，约 0.3 V/µs → **压摆率**（slew rate），由 C_c 的充电电流决定。`,
          `What is really inside the triangle is about 20 transistors in three stages:
1. [[stage-in|input stage: a PNP differential pair]] — amplifies only the **difference** of the inputs. The LM358 uses PNP transistors, so [[cm|the inputs can go down to 0 V (GND)]] — that is why it works from a single supply; the input upper limit is about V+ − 1.5 V.
2. [[stage-gain|gain stage]] — provides the $10^5$ voltage gain. Its [[cc|compensation capacitor C_c]] rolls the gain off at high frequency so the amplifier doesn't oscillate with feedback; the price is **bandwidth**: gain × bandwidth ≈ 1 MHz (GBW).
3. [[stage-out|output stage: push-pull]] — one transistor pushes current up, one pulls it down, tens of mA. The upper path has two $V_{BE}$ drops, so [[headroom|the output can't reach V+; it stops about 1.5 V short]]; the lower path gets close to 0 V.

This layer explains three things you saw in the labs:
- lesson 14: 9 V in, only 7.5 V out → the output stage's headroom;
- at a gain of 100 the bandwidth is only about 10 kHz → $GBW ≈ 1 MHz$;
- square-wave edges turn into ramps of about 0.3 V/µs → the **slew rate**, set by the current that charges C_c.`,
        ),
        table: {
          head: [tr('参数', 'Parameter'), tr('LM358 典型值', 'LM358 typical'), tr('影响什么', 'What it limits')],
          rows: [
            [tr('电源电压', 'supply'), '3–32 V（±1.5–±16 V）', tr('能用的电源', 'usable supplies')],
            [tr('输出摆幅', 'output swing'), '0 … V+ − 1.5 V', tr('输出最大值', 'the largest output')],
            [tr('共模输入范围', 'input common-mode range'), '0 … V+ − 1.5 V', tr('输入能接多高', 'how high the inputs may go')],
            [tr('增益带宽积 GBW', 'gain-bandwidth GBW'), '≈ 1 MHz', tr('$f_{max} ≈ \\frac{GBW}{增益}$', '$f_{max} ≈ \\frac{GBW}{gain}$')],
            [tr('压摆率 SR', 'slew rate SR'), '≈ 0.3 V/µs', tr('大信号的最高频率', 'large-signal speed')],
            [tr('输入失调电压', 'input offset'), '≈ 2 mV', tr('直流误差 × 增益', 'DC error × gain')],
          ],
          parts: [null, 'headroom', 'cm', 'cc', 'cc', 'stage-in'],
        },
        formulas: [
          { tex: 'f_{-3dB} ≈ \\frac{GBW}{G}', note: tr('G = 闭环增益（同相放大器的 1 + R_f/R_1）', 'G = closed-loop gain (1 + R_f/R_1 for a non-inverting amp)') },
          { tex: 'f_{max} = \\frac{SR}{2π V_p}', note: tr('不失真的最大正弦频率', 'highest undistorted sine frequency') },
        ],
        calcs: ['opamp-gbw', 'opamp-slew'],
      },
    ],
    recap: tr(
      'op-amp = 一个只看 $v₊ - v₋$ 的超高增益放大器。开环时它是比较器；加了负反馈，输出会调到让 $v₊ = v₋$（虚短），输入不取电流（虚断）——从这两条就能推出所有放大器公式。',
      'An op-amp is a huge-gain amplifier that only looks at $v₊ - v₋$. Open loop it is a comparator; with negative feedback its output settles where $v₊ = v₋$ (virtual short) while the inputs take no current (virtual open) — every amplifier formula follows from those two rules.',
    ),
  };
}
