// Calculation cards: op-amps (open loop, follower, non-inverting, inverting, summing, GBW, slew).

import { tr } from '../../core/i18n';
import type { CalcCard, CalcGroup } from '../types';
import { Dot, Gnd, OpAmp, Path, R, T } from './fig';

export const group = (): CalcGroup => ({
  id: 'opamp',
  title: tr('op-amp 电路', 'Op-amp circuits'),
  intro: tr(
    '全部从两条黄金法则推出来：虚短 $v₊ = v₋$，虚断 $i_+ = i_- = 0$。先看“拆开看 LM358”，再来这里算。',
    'All derived from the two golden rules: virtual short $v₊ = v₋$ and virtual open $i_+ = i_- = 0$. Read the LM358 teardown first, then calculate here.',
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
    tex: 'v_o = A(v₊ - v₋)',
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
      `接线：$v₊ = v_{in}$，$v₋ = v_o$。代入 $v_o = A(v₊ - v₋)$：
$$v_o = A(v_{in} - v_o) ⇒ v_o = \\frac{A}{1+A}v_{in}$$
A = 10⁵ 时误差只有 $\\frac{1}{1+A} ≈ 0.001 %$。黄金法则（虚短）直接给出 $v_o = v_{in}$。`,
      `Wiring: $v₊ = v_{in}$, $v₋ = v_o$. Into $v_o = A(v₊ - v₋)$:
$$v_o = A(v_{in} - v_o) ⇒ v_o = \\frac{A}{1+A}v_{in}$$
With A = 10⁵ the error is only $\\frac{1}{1+A} ≈ 0.001 %$. The golden rule (virtual short) gives $v_o = v_{in}$ at once.`,
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
      `1. 虚断：IN− 不取电流，R_f 和 R₁ 串联分压：$v₋ = \\frac{R_1}{R_1 + R_f}v_o = βv_o$
2. 虚短：$v₋ = v₊ = v_{in}$
3. 所以 $v_o = \\frac{v_{in}}{β} = (1 + \\frac{R_f}{R_1})v_{in}$

有限 A 时：$v_o = \\frac{A}{1 + Aβ}v_{in}$，$Aβ ≫ 1$ 时就是上式。增益最小是 1（R_f = 0 就是跟随器）。`,
      `1. Virtual open: IN− takes no current, R_f and R₁ are a plain divider: $v₋ = \\frac{R_1}{R_1 + R_f}v_o = βv_o$
2. Virtual short: $v₋ = v₊ = v_{in}$
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
      `1. IN+ 接地，虚短：$v₋ = 0$（**虚地**）
2. 流过 R₁ 的电流：$i_1 = \\frac{v_{in} - 0}{R_1}$
3. 虚断：这个电流不进 IN−，全部流过 R_f：$i_1 = \\frac{0 - v_o}{R_f}$
4. 两式相等：$v_o = -\\frac{R_f}{R_1}v_{in}$

输入电阻就是 $R_1$（信号源看进去，IN− 是 0 V）。单电源的 LM358 输出不能为负，所以实验 2-7 用 ±9 V 双电源。`,
      `1. IN+ grounded, virtual short: $v₋ = 0$ (a **virtual ground**)
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
      `$v_o = V_p sin(2πft)$ 变化最快的地方（过零点）斜率是 $2πfV_p$。输出级最快只能以 SR 的速度变化，所以要求 $2πfV_p ≤ SR$。`,
      `$v_o = V_p sin(2πft)$ changes fastest at its zero crossings, with slope $2πfV_p$. The output can change at most at the rate SR, so $2πfV_p ≤ SR$.`,
    ),
    teardowns: ['lm358'],
  },
  {
    id: 'opamp-difference',
    group: 'opamp',
    title: tr('差分放大器 Difference amplifier', 'Difference amplifier'),
    tex: 'v_o = -\\frac{R_2}{R_1}v_1 + (1 + \\frac{R_2}{R_1})\\frac{R_4}{R_3 + R_4}v_2 = \\frac{R_2}{R_1}(v_2 - v_1)',
    use: tr(
      '把两个输入相减再放大；R₄/R₃ = R₂/R₁ 时只放大差值、抵消共模。',
      'Subtract two inputs and amplify the difference; with R₄/R₃ = R₂/R₁ it amplifies only the difference and rejects the common part.',
    ),
    vars: [
      { sym: 'v_1', name: tr('经 R₁ 进 IN− 的输入', 'input through R₁ to IN−'), unit: 'V', def: 1.8 },
      { sym: 'v_2', name: tr('经 R₃ 进 IN+ 的输入', 'input through R₃ to IN+'), unit: 'V', def: 2.7 },
      { sym: 'R_1', name: 'R₁', unit: 'Ω', def: 47000 },
      { sym: 'R_2', name: tr('反馈 R₂', 'feedback R₂'), unit: 'Ω', def: 100000 },
      { sym: 'R_3', name: 'R₃', unit: 'Ω', def: 47000 },
      { sym: 'R_4', name: tr('IN+ 到地 R₄', 'R₄ from IN+ to ground'), unit: 'Ω', def: 100000 },
    ],
    out: { sym: 'v_o', name: tr('输出', 'output'), unit: 'V' },
    compute: (v) => -(v.R_2 / v.R_1) * v.v_1 + (1 + v.R_2 / v.R_1) * (v.R_4 / (v.R_3 + v.R_4)) * v.v_2,
    why: tr(
      `1. 有负反馈（R₂ 从 OUT 回到 IN−），所以可以用虚短、虚断。
2. IN+ 不取电流，R₃、R₄ 是普通分压器：$v_+ = v_2\\frac{R_4}{R_3 + R_4}$；虚短 $v_- = v_+$。
3. IN− 结点的 KCL（虚断：电流全部流过 R₂）：$\\frac{v_1 - v_-}{R_1} = \\frac{v_- - v_o}{R_2}$。
4. 解出 $v_o = (1 + \\frac{R_2}{R_1})v_+ - \\frac{R_2}{R_1}v_1$——正好是“v₁ 单独作用的反相放大器”加“v₂ 单独作用的同相放大器”：**叠加定理**。
5. 两个比值相等（$\\frac{R_4}{R_3} = \\frac{R_2}{R_1}$）时化简成 $\\frac{R_2}{R_1}(v_2 - v_1)$：两边加同一个电压（共模）输出为 0。`,
      `1. There is negative feedback (R₂ from OUT back to IN−), so the virtual short and virtual open apply.
2. IN+ draws no current, so R₃ and R₄ are a plain divider: $v_+ = v_2\\frac{R_4}{R_3 + R_4}$; virtual short: $v_- = v_+$.
3. KCL at IN− (virtual open: all of it flows through R₂): $\\frac{v_1 - v_-}{R_1} = \\frac{v_- - v_o}{R_2}$.
4. Solve: $v_o = (1 + \\frac{R_2}{R_1})v_+ - \\frac{R_2}{R_1}v_1$ — exactly "an inverting amplifier for v₁ alone" plus "a non-inverting amplifier for v₂ alone": **superposition**.
5. With matched ratios ($\\frac{R_4}{R_3} = \\frac{R_2}{R_1}$) it reduces to $\\frac{R_2}{R_1}(v_2 - v_1)$: the same voltage on both inputs (common mode) gives 0.`,
    ),
    example: tr(
      '实验 2-9（$\\frac{100}{47} ≈ 2.13$，v₁ = 1.8 V，v₂ = 2.7 V）：只有 v₁：$-2.13 × 1.8 ≈ -3.83 V$；只有 v₂：$v_+ = 2.7 × \\frac{100}{147} ≈ 1.84 V$，$1.84 × 3.13 ≈ 5.74 V$；一起：$-3.83 + 5.74 ≈ 1.91 V = 2.13 × (2.7 - 1.8)$。两个旋钮都在 30 %：0 V。',
      'Lab 2-9 ($\\frac{100}{47} ≈ 2.13$, v₁ = 1.8 V, v₂ = 2.7 V): v₁ alone: $-2.13 × 1.8 ≈ -3.83 V$; v₂ alone: $v_+ = 2.7 × \\frac{100}{147} ≈ 1.84 V$, $1.84 × 3.13 ≈ 5.74 V$; both: $-3.83 + 5.74 ≈ 1.91 V = 2.13 × (2.7 - 1.8)$. Both knobs at 30 %: 0 V.',
    ),
    pitfalls: [
      tr(
        '“关掉”一个输入要把它接地（短路），不是让电阻悬空：悬空时电路变成跟随器，只剩 v₊。',
        'Switching an input "off" means grounding it (a short), not leaving its resistor floating: floating turns the circuit into a follower that outputs just v₊.',
      ),
      tr(
        '比值不匹配时共模不能完全抵消：R₄ 错成 47 kΩ，两边都 2.7 V 时输出约 −1.5 V。',
        'Mismatched ratios leave some common mode: with R₄ wrongly 47 kΩ, 2.7 V on both inputs gives about −1.5 V.',
      ),
    ],
    Figure: () => (
      <g>
        <OpAmp x={120} y={85} />
        <R x1={20} y1={65} x2={95} y2={65} label="R₁" />
        <Path d="95,65 120,65" />
        <R x1={20} y1={105} x2={90} y2={105} label="R₃" ly={122} />
        <Path d="90,105 120,105" />
        <Dot x={100} y={105} />
        <R x1={100} y1={105} x2={100} y2={140} label="R₄" lx={74} />
        <Gnd x={100} y={142} />
        <Path d="190,85 240,85" />
        <Path d="105,65 105,25 135,25" />
        <R x1={135} y1={25} x2={195} y2={25} label="R₂" />
        <Path d="195,25 220,25 220,85" />
        <Dot x={105} y={65} />
        <Dot x={220} y={85} />
        <T x={18} y={58} anchor="start">
          v₁
        </T>
        <T x={18} y={98} anchor="start">
          v₂
        </T>
        <T x={240} y={77} anchor="end">
          vₒ
        </T>
      </g>
    ),
    teardowns: ['lm358'],
    lessons: ['exp-difference-amp'],
    chapter: 'opamp',
  },
  {
    id: 'schmitt-thresholds',
    group: 'opamp',
    title: tr('施密特触发器的两个阈值', 'Schmitt trigger thresholds'),
    tex: 'V_T = \\frac{V_{CC}/R_A + V_o/R_F}{1/R_A + 1/R_B + 1/R_F}',
    use: tr(
      '正反馈比较器：输出高时 IN+ 在上阈值 V_TH，输出低时在下阈值 V_TL，两者之差是回差。',
      'A comparator with positive feedback: with the output high IN+ sits at the upper threshold V_TH, with it low at V_TL; the gap is the hysteresis.',
    ),
    vars: [
      { sym: 'V_CC', name: tr('电源', 'supply'), unit: 'V', def: 9 },
      { sym: 'R_A', name: tr('电源到 IN+ 的 R_A', 'R_A from the supply to IN+'), unit: 'Ω', def: 10000 },
      { sym: 'R_B', name: tr('IN+ 到地的 R_B', 'R_B from IN+ to ground'), unit: 'Ω', def: 10000 },
      { sym: 'R_F', name: tr('OUT 到 IN+ 的反馈 R_F', 'feedback R_F from OUT to IN+'), unit: 'Ω', def: 47000 },
      { sym: 'V_o', name: tr('输出电平（LM358 高 ≈ 7.5 V，低 ≈ 0 V）', 'output level (LM358 high ≈ 7.5 V, low ≈ 0 V)'), unit: 'V', def: 7.5 },
    ],
    out: { sym: 'V_T', name: tr('这时的阈值（IN+ 的电压）', 'the threshold now (IN+ voltage)'), unit: 'V' },
    compute: (v) => (v.V_CC / v.R_A + v.V_o / v.R_F) / (1 / v.R_A + 1 / v.R_B + 1 / v.R_F),
    why: tr(
      `1. 反馈接到 **IN+**（正反馈）：输出一动，IN+ 被推着往同一个方向走，输出就一直走到头——只有高、低两个状态。
2. IN+ 是一个结点，接着三条支路：$R_A$ 到电源、$R_B$ 到地、$R_F$ 到输出。把输出当成又一个电压源，用结点电压法：$V_T = \\frac{V_{CC}/R_A + V_o/R_F}{1/R_A + 1/R_B + 1/R_F}$。
3. 输出高（$V_o ≈ 7.5 V$）时得到上阈值 $V_{TH}$；输出低（0 V）时得到下阈值 $V_{TL}$。
4. 输入（接 IN−）要升过 $V_{TH}$ 输出才翻低，要降到 $V_{TL}$ 以下才翻回高。
5. 回差 $V_{TH} - V_{TL} = ΔV_o\\frac{1/R_F}{1/R_A + 1/R_B + 1/R_F}$：比它小的噪声不会让输出来回抖。`,
      `1. Feedback to **IN+** (positive feedback): once the output moves, IN+ is pushed the same way and the output runs all the way to a rail — just two states, high and low.
2. IN+ is a node with three branches: $R_A$ to the supply, $R_B$ to ground, $R_F$ to the output. Treat the output as one more voltage source and use nodal analysis: $V_T = \\frac{V_{CC}/R_A + V_o/R_F}{1/R_A + 1/R_B + 1/R_F}$.
3. Output high ($V_o ≈ 7.5 V$) gives the upper threshold $V_{TH}$; output low (0 V) the lower one, $V_{TL}$.
4. The input (on IN−) must rise past $V_{TH}$ to flip the output low, and fall below $V_{TL}$ to flip it back.
5. Hysteresis $V_{TH} - V_{TL} = ΔV_o\\frac{1/R_F}{1/R_A + 1/R_B + 1/R_F}$: noise smaller than that can’t make the output chatter.`,
    ),
    example: tr(
      '本实验（9 V、10 k / 10 k、$R_F$ = 47 k）：分母 0.1 + 0.1 + 0.0213 = 0.2213 mS；$V_{TH} = \\frac{0.9 + 7.5/47}{0.2213} ≈ 4.79 V$，$V_{TL} = \\frac{0.9}{0.2213} ≈ 4.07 V$，回差 ≈ 0.72 V。幅度 0.25 V 的三角波（4.25–4.75 V）碰不到阈值，输出不翻转。',
      'The lab (9 V, 10 k / 10 k, $R_F$ = 47 k): the denominator is 0.1 + 0.1 + 0.0213 = 0.2213 mS; $V_{TH} = \\frac{0.9 + 7.5/47}{0.2213} ≈ 4.79 V$, $V_{TL} = \\frac{0.9}{0.2213} ≈ 4.07 V$, hysteresis ≈ 0.72 V. A 0.25 V-amplitude triangle (4.25–4.75 V) reaches neither threshold, so the output never flips.',
    ),
    pitfalls: [
      tr('把反馈接到 IN−：那是负反馈放大器，不是比较器。', 'Feedback to IN− makes a negative-feedback amplifier, not a comparator.'),
      tr('输出高电平用 V+ − 1.5 V（LM358），不是 9 V。', 'Use the real high level, V+ − 1.5 V for an LM358, not 9 V.'),
    ],
    Figure: () => (
      <g>
        <OpAmp x={130} y={75} />
        <Path d="40,55 130,55" />
        <T x={36} y={59} anchor="end">
          vᵢ
        </T>
        <R x1={30} y1={95} x2={100} y2={95} label="R_A" />
        <T x={26} y={99} anchor="end" cls="small">
          9 V
        </T>
        <Path d="100,95 130,95" />
        <Dot x={110} y={95} />
        <R x1={50} y1={95} x2={50} y2={140} label="R_B" lx={26} />
        <Gnd x={50} y={142} />
        <Path d="110,95 110,130 130,130" />
        <R x1={130} y1={130} x2={215} y2={130} label="R_F" />
        <Path d="215,130 225,130 225,75 200,75" />
        <Path d="225,75 245,75" />
        <Dot x={225} y={75} />
        <T x={245} y={67} anchor="end">
          vₒ
        </T>
      </g>
    ),
    teardowns: ['lm358'],
    lessons: ['exp-schmitt-trigger', 'exp5-design-night-light'],
    chapter: 'opamp',
  },
];
