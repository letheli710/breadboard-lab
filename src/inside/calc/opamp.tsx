// Calculation cards: op-amps (open loop, follower, non-inverting, inverting, summing, GBW, slew).

import { tr } from '../../core/i18n';
import type { CalcCard, CalcGroup } from '../types';
import { Dot, Gnd, OpAmp, Path, R, T } from './fig';

export const group = (): CalcGroup => ({
  id: 'opamp',
  title: tr('op-amp 电路', 'Op-amp circuits'),
  intro: tr(
    '全部从两条黄金法则推出来：虚短 $v_+ = v_-$，虚断 $i_+ = i_- = 0$。先看“拆开看 LM358”，再来这里算。',
    'All derived from the two golden rules: virtual short $v_+ = v_-$ and virtual open $i_+ = i_- = 0$. Read the LM358 teardown first, then calculate here.',
  ),
});

/** a non-inverting amplifier figure (shared) */
function NonInvFig({ follower }: { follower?: boolean }) {
  return (
    <g>
      <OpAmp x={100} y={80} />
      <Path d="30,100 100,100" />
      <Dot x={30} y={100} />
      <T x={26} y={92} anchor="end">
        v_in
      </T>
      <Path d="170,80 230,80" />
      <Dot x={230} y={80} />
      <T x={234} y={70} anchor="end">
        vₒ
      </T>
      {follower ? (
        <Path d="200,80 200,30 80,30 80,60 100,60" />
      ) : (
        <>
          <Path d="200,80 200,30 160,30" />
          <R x1={160} y1={30} x2={80} y2={30} label="R_f" />
          <Path d="80,30 80,60 100,60" />
          <R x1={60} y1={60} x2={60} y2={130} label="R₁" lx={30} />
          <Path d="60,60 80,60" />
          <Gnd x={60} y={132} />
        </>
      )}
    </g>
  );
}

export const cards = (): CalcCard[] => [
  {
    id: 'opamp-open-loop',
    group: 'opamp',
    title: tr('开环：vₒ = A·v_d（会不会饱和？）', 'Open loop: vₒ = A·v_d (will it saturate?)'),
    tex: 'v_o = A(v_+ - v_-)',
    use: tr('不接反馈时输出是多少；算出来超出电源范围就是饱和。', 'The output with no feedback; if the answer is outside the supply range, the op-amp saturates.'),
    vars: [
      { sym: 'vp', name: 'v₊', unit: 'V', def: 2.001 },
      { sym: 'vn', name: 'v₋', unit: 'V', def: 2 },
      { sym: 'A', name: tr('开环增益 A', 'open-loop gain A'), unit: '', def: 100000 },
      { sym: 'Vp', name: tr('电源 V+', 'supply V+'), unit: 'V', def: 9 },
    ],
    out: { sym: 'vₒ', name: tr('输出（LM358 夹在 0 … V+ − 1.5 V）', 'output (LM358 clamps to 0 … V+ − 1.5 V)'), unit: 'V' },
    compute: (v) => Math.min(Math.max(v.A * (v.vp - v.vn), 0), v.Vp - 1.5),
    why: tr(
      `等效电路里的受控源：$v_o = A·v_d$。可 A ≈ $10^5$，1 mV 的输入差就要求 100 V 输出——电源给不了，输出就停在边界（饱和）。线性区只有 $|v_d| < \\frac{V_{sat}}{A}$，几十 µV。
试试把 v₊ 改成 2.00005 V：这时 $v_d = 50 µV$，输出 5 V，才在线性区里。`,
      `The dependent source of the model: $v_o = A·v_d$. With A ≈ $10^5$, a 1 mV input difference asks for 100 V at the output — the supply can’t give it, so the output sits at the limit (saturation). The linear region is only $|v_d| < \\frac{V_{sat}}{A}$, tens of µV.
Try v₊ = 2.00005 V: now $v_d = 50 µV$ and the output is 5 V — finally in the linear region.`,
    ),
    teardowns: ['lm358'],
    lessons: ['lesson-lm358'],
    chapter: 'opamp',
  },
  {
    id: 'opamp-follower',
    group: 'opamp',
    title: tr('电压跟随器 Voltage follower', 'Voltage follower'),
    tex: 'v_o = \\frac{A}{1 + A} v_{in} ≈ v_{in}',
    use: tr('增益 1 的缓冲器：输入不取电流，输出能带负载。', 'A gain-of-1 buffer: the input draws no current, the output can drive a load.'),
    vars: [
      { sym: 'vin', name: 'v_in', unit: 'V', def: 4.5 },
      { sym: 'A', name: tr('开环增益 A', 'open-loop gain A'), unit: '', def: 100000 },
    ],
    out: { sym: 'vₒ', name: tr('输出', 'output'), unit: 'V' },
    compute: (v) => (v.A / (1 + v.A)) * v.vin,
    why: tr(
      `接线：$v_+ = v_{in}$，$v_- = v_o$。代入 $v_o = A(v_+ - v_-)$：
$$v_o = A(v_{in} - v_o) ⇒ v_o = \\frac{A}{1+A}v_{in}$$
A = 10⁵ 时误差只有 $\\frac{1}{1+A} ≈ 0.001\\%$。黄金法则（虚短）直接给出 $v_o = v_{in}$。`,
      `Wiring: $v_+ = v_{in}$, $v_- = v_o$. Into $v_o = A(v_+ - v_-)$:
$$v_o = A(v_{in} - v_o) ⇒ v_o = \\frac{A}{1+A}v_{in}$$
With A = 10⁵ the error is only $\\frac{1}{1+A} ≈ 0.001\\%$. The golden rule (virtual short) gives $v_o = v_{in}$ at once.`,
    ),
    pitfalls: [tr('LM358 单电源：$v_{in}$ 超过 V+ − 1.5 V 时输出跟不上（第 14 课）。', 'Single-supply LM358: above V+ − 1.5 V the output can’t follow (lesson 14).')],
    Figure: () => <NonInvFig follower />,
    teardowns: ['lm358'],
    lessons: ['lesson-lm358', 'exp-voltage-follower', 'exp4-buffered-bandpass'],
    chapter: 'opamp',
  },
  {
    id: 'opamp-noninverting',
    group: 'opamp',
    title: tr('同相放大器 Non-inverting amplifier', 'Non-inverting amplifier'),
    tex: 'v_o = (1 + \\frac{R_f}{R_1}) v_{in}',
    use: tr('把信号放大、不反相，输入电阻极大。', 'Amplify a signal without inverting it, with a huge input resistance.'),
    vars: [
      { sym: 'vin', name: 'v_in', unit: 'V', def: 0.5 },
      { sym: 'Rf', name: 'R_f', unit: 'Ω', def: 20000 },
      { sym: 'R1', name: 'R₁', unit: 'Ω', def: 10000 },
    ],
    out: { sym: 'vₒ', name: tr('输出', 'output'), unit: 'V' },
    compute: (v) => (1 + v.Rf / v.R1) * v.vin,
    why: tr(
      `1. 虚断：IN− 不取电流，R_f 和 R₁ 串联分压：$v_- = \\frac{R_1}{R_1 + R_f}v_o = βv_o$
2. 虚短：$v_- = v_+ = v_{in}$
3. 所以 $v_o = \\frac{v_{in}}{β} = (1 + \\frac{R_f}{R_1})v_{in}$

有限 A 时：$v_o = \\frac{A}{1 + Aβ}v_{in}$，$Aβ ≫ 1$ 时就是上式。增益最小是 1（R_f = 0 就是跟随器）。`,
      `1. Virtual open: IN− takes no current, R_f and R₁ are a plain divider: $v_- = \\frac{R_1}{R_1 + R_f}v_o = βv_o$
2. Virtual short: $v_- = v_+ = v_{in}$
3. So $v_o = \\frac{v_{in}}{β} = (1 + \\frac{R_f}{R_1})v_{in}$

With a finite A: $v_o = \\frac{A}{1 + Aβ}v_{in}$, which is the line above when $Aβ ≫ 1$. The gain is never below 1 (R_f = 0 is the follower).`,
    ),
    example: tr('R_f = 20 k、R₁ = 10 k：增益 3；0.5 V 进，1.5 V 出。', 'R_f = 20 k, R₁ = 10 k: gain 3; 0.5 V in, 1.5 V out.'),
    pitfalls: [
      tr('是 1 + R_f/R₁，不是 R_f/R₁（那是反相放大器的大小）。', 'It is 1 + R_f/R₁, not R_f/R₁ (that is the inverting amplifier’s magnitude).'),
      tr('输出不能超过 V+ − 1.5 V：先算再看会不会饱和。', 'The output can’t exceed V+ − 1.5 V: calculate, then check for saturation.'),
    ],
    Figure: () => <NonInvFig />,
    teardowns: ['lm358'],
    lessons: ['exp-noninverting-amp'],
    chapter: 'opamp',
  },
  {
    id: 'opamp-inverting',
    group: 'opamp',
    title: tr('反相放大器 Inverting amplifier', 'Inverting amplifier'),
    tex: 'v_o = -\\frac{R_f}{R_1} v_{in}',
    use: tr('放大并反相；IN− 是“虚地”。', 'Amplify and invert; IN− is a "virtual ground".'),
    vars: [
      { sym: 'vin', name: 'v_in', unit: 'V', def: 0.5 },
      { sym: 'Rf', name: 'R_f', unit: 'Ω', def: 47000 },
      { sym: 'R1', name: 'R₁', unit: 'Ω', def: 10000 },
    ],
    out: { sym: 'vₒ', name: tr('输出', 'output'), unit: 'V' },
    compute: (v) => (-v.Rf / v.R1) * v.vin,
    why: tr(
      `1. IN+ 接地，虚短：$v_- = 0$（**虚地**）
2. 流过 R₁ 的电流：$i_1 = \\frac{v_{in} - 0}{R_1}$
3. 虚断：这个电流不进 IN−，全部流过 R_f：$i_1 = \\frac{0 - v_o}{R_f}$
4. 两式相等：$v_o = -\\frac{R_f}{R_1}v_{in}$

输入电阻就是 $R_1$（信号源看进去，IN− 是 0 V）。单电源的 LM358 输出不能为负，所以实验 2-7 用 ±9 V 双电源。`,
      `1. IN+ grounded, virtual short: $v_- = 0$ (a **virtual ground**)
2. Current in R₁: $i_1 = \\frac{v_{in} - 0}{R_1}$
3. Virtual open: it doesn’t enter IN−, it all goes through R_f: $i_1 = \\frac{0 - v_o}{R_f}$
4. Equate: $v_o = -\\frac{R_f}{R_1}v_{in}$

The input resistance is just $R_1$ (the source sees 0 V at IN−). A single-supply LM358 can’t output negative voltages, which is why lab 2-7 uses a ±9 V dual supply.`,
    ),
    Figure: () => (
      <g>
        <OpAmp x={110} y={80} />
        <R x1={30} y1={60} x2={95} y2={60} label="R₁" />
        <Path d="95,60 110,60" />
        <Dot x={30} y={60} />
        <T x={26} y={52} anchor="end">
          v_in
        </T>
        <Path d="110,100 95,100 95,128" />
        <Gnd x={95} y={128} />
        <Path d="180,80 235,80" />
        <Path d="210,80 210,25 180,25" />
        <R x1={180} y1={25} x2={100} y2={25} label="R_f" />
        <Path d="100,25 100,60" />
        <Dot x={100} y={60} />
        <T x={235} y={70} anchor="end">
          vₒ
        </T>
      </g>
    ),
    teardowns: ['lm358'],
    lessons: ['exp-inverting-amp', 'exp4-active-lowpass'],
    chapter: 'opamp',
  },
  {
    id: 'opamp-summing',
    group: 'opamp',
    title: tr('反相求和 Inverting summer', 'Inverting summer'),
    tex: 'v_o = -R_f(\\frac{v_1}{R_1} + \\frac{v_2}{R_2})',
    use: tr('把两个信号按权重相加（再反相）。', 'Add two signals with weights (and invert).'),
    vars: [
      { sym: 'v1', name: 'v₁', unit: 'V', def: 1 },
      { sym: 'R1', name: 'R₁', unit: 'Ω', def: 10000 },
      { sym: 'v2', name: 'v₂', unit: 'V', def: 0.5 },
      { sym: 'R2', name: 'R₂', unit: 'Ω', def: 10000 },
      { sym: 'Rf', name: 'R_f', unit: 'Ω', def: 10000 },
    ],
    out: { sym: 'vₒ', name: tr('输出', 'output'), unit: 'V' },
    compute: (v) => -v.Rf * (v.v1 / v.R1 + v.v2 / v.R2),
    why: tr(
      `IN− 是虚地，所以每个输入各自产生电流 $\\frac{v_k}{R_k}$，互不影响。在 IN− 结点用 KCL（虚断：不流进 op-amp）：
$$\\frac{v_1}{R_1} + \\frac{v_2}{R_2} = \\frac{0 - v_o}{R_f}$$
这就是“求和”：每路的权重是 $\\frac{R_f}{R_k}$。`,
      `IN− is a virtual ground, so each input drives its own current $\\frac{v_k}{R_k}$ without disturbing the others. KCL at IN− (virtual open: nothing enters the op-amp):
$$\\frac{v_1}{R_1} + \\frac{v_2}{R_2} = \\frac{0 - v_o}{R_f}$$
That is the "sum": each input is weighted by $\\frac{R_f}{R_k}$.`,
    ),
    teardowns: ['lm358'],
    lessons: ['exp-summing-amp'],
    chapter: 'opamp',
  },
  {
    id: 'opamp-gbw',
    group: 'opamp',
    title: tr('增益带宽积 GBW', 'Gain-bandwidth product'),
    tex: 'f_{-3dB} ≈ \\frac{GBW}{G}',
    use: tr('放大倍数定了以后，这个放大器能放大到多高的频率。', 'Once the gain is set, how high in frequency the amplifier still works.'),
    vars: [
      { sym: 'GBW', name: tr('增益带宽积（LM358 ≈ 1 MHz）', 'gain-bandwidth (LM358 ≈ 1 MHz)'), unit: 'Hz', def: 1e6 },
      { sym: 'G', name: tr('闭环增益（同相：1 + R_f/R₁）', 'closed-loop gain (non-inv.: 1 + R_f/R₁)'), unit: '', def: 100 },
    ],
    out: { sym: 'f', name: tr('−3 dB 带宽', '−3 dB bandwidth'), unit: 'Hz' },
    compute: (v) => v.GBW / v.G,
    why: tr(
      `内部补偿电容让开环增益从很低的频率起就按 20 dB/十倍频 下降，$A(f) ≈ \\frac{GBW}{f}$。闭环增益 G 只能在 $A(f) > G$ 的频率内保持，交点就是带宽：$f = \\frac{GBW}{G}$。增益和带宽可以“交换”，乘积不变。`,
      `The internal compensation capacitor makes the open-loop gain fall at 20 dB/decade from a low frequency on: $A(f) ≈ \\frac{GBW}{f}$. A closed-loop gain G holds only while $A(f) > G$; the crossing is the bandwidth: $f = \\frac{GBW}{G}$. Gain and bandwidth trade against each other; their product stays fixed.`,
    ),
    teardowns: ['lm358'],
    chapter: 'frequency',
  },
  {
    id: 'opamp-slew',
    group: 'opamp',
    title: tr('压摆率 Slew rate', 'Slew rate'),
    tex: 'f_{max} = \\frac{SR}{2π V_p}',
    use: tr('输出幅度为 V_p 的正弦波，最高能到多少频率而不变成三角波。', 'The highest frequency a sine of amplitude V_p can have before it turns into a triangle.'),
    vars: [
      { sym: 'SR', name: tr('压摆率（LM358 ≈ 0.3 V/µs）', 'slew rate (LM358 ≈ 0.3 V/µs)'), unit: 'V/s', def: 3e5 },
      { sym: 'Vp', name: tr('输出正弦峰值', 'output sine peak'), unit: 'V', def: 3 },
    ],
    out: { sym: 'f_max', name: tr('最高频率', 'highest frequency'), unit: 'Hz' },
    compute: (v) => v.SR / (2 * Math.PI * v.Vp),
    why: tr(
      `$v_o = V_p \\sin(2πft)$ 变化最快的地方（过零点）斜率是 $2πfV_p$。输出级最快只能以 SR 的速度变化，所以要求 $2πfV_p ≤ SR$。`,
      `$v_o = V_p \\sin(2πft)$ changes fastest at its zero crossings, with slope $2πfV_p$. The output can change at most at the rate SR, so $2πfV_p ≤ SR$.`,
    ),
    teardowns: ['lm358'],
  },
];
