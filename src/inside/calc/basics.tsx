// Calculation cards: DC basics (Ohm, series / parallel, dividers, power, the LED resistor).

import { tr } from '../../core/i18n';
import type { CalcCard, CalcGroup } from '../types';
import { D, Dot, Gnd, I, Path, R, T, V, VArrow, W } from './fig';

export const group = (): CalcGroup => ({
  id: 'dc',
  title: tr('直流基础 DC basics', 'DC basics'),
  intro: tr(
    '欧姆定律、串并联、分压分流、功率——第 1–8 课和第 1 期实验的每一个数都从这里来。',
    'Ohm’s law, series / parallel, dividers and power — every number in lessons 1–8 and phase 1 comes from here.',
  ),
});

export const cards = (): CalcCard[] => [
  {
    id: 'ohm',
    group: 'dc',
    title: tr('欧姆定律 Ohm’s law', 'Ohm’s law'),
    tex: 'I = \\frac{V}{R}',
    use: tr('知道电阻两端的电压，求流过它的电流（或反过来）。', 'Know the voltage across a resistor, find the current through it (or the other way round).'),
    vars: [
      { sym: 'V', name: tr('电阻两端电压', 'voltage across R'), unit: 'V', def: 9 },
      { sym: 'R', name: tr('电阻', 'resistance'), unit: 'Ω', def: 1000, min: 1e-3 },
    ],
    out: { sym: 'I', name: tr('电流', 'current'), unit: 'A' },
    compute: (v) => v.V / v.R,
    why: tr(
      `电阻的定义就是“电压和电流成正比”：$V = IR$。比例系数 R 越大，同样的电压推出的电流越小。
- **关联参考方向**（电流从标“+”的一端流进）时 $V = IR$；非关联时 $V = -IR$。
- 只对 **一个电阻** 用：V 必须是 **这个电阻两端** 的电压，不是电源电压（除非电阻直接接在电源上）。`,
      `A resistor is defined by "voltage proportional to current": $V = IR$. The larger R, the smaller the current the same voltage pushes.
- With **associated reference directions** (current enters the "+" end) $V = IR$; otherwise $V = -IR$.
- Use it on **one resistor**: V must be the voltage **across that resistor**, not the supply voltage (unless the resistor sits straight across the supply).`,
    ),
    example: tr('9 V 直接接 1 kΩ：$I = \\frac{9}{1000} = 9 mA$。', '9 V straight across 1 kΩ: $I = \\frac{9}{1000} = 9 mA$.'),
    pitfalls: [
      tr('单位：kΩ 和 mA 搭配，V / kΩ = mA，最不容易错。', 'Units: V / kΩ = mA is the easiest pairing to get right.'),
      tr('电源电压 ≠ 某个电阻两端的电压（串联时要先分压）。', 'The supply voltage ≠ the voltage across one resistor (in series, divide first).'),
    ],
    Figure: () => (
      <g>
        <V x={50} y1={40} y2={110} label="V" />
        <Path d="50,40 50,25 200,25 200,50" />
        <R x1={200} y1={50} x2={200} y2={100} label="R" />
        <Path d="200,100 200,125 50,125 50,110" />
        <path d="M120 18 l10 0 M126 14 l6 4 l-6 4" className="cf-w accent" fill="none" />
        <T x={125} y={14} cls="accent">
          I
        </T>
      </g>
    ),
    lessons: ['lesson-light-an-led', 'lesson-multimeter'],
    chapter: 'basics',
  },
  {
    id: 'series-resistance',
    group: 'dc',
    title: tr('串联电阻 Series resistors', 'Series resistors'),
    tex: 'R_{eq} = R_1 + R_2 + R_3',
    use: tr('几个电阻首尾相连、流过同一个电流时，求总电阻。', 'Resistors end to end, carrying the same current: find the total resistance.'),
    vars: [
      { sym: 'R1', name: 'R₁', unit: 'Ω', def: 1000 },
      { sym: 'R2', name: 'R₂', unit: 'Ω', def: 2200 },
      { sym: 'R3', name: tr('R₃（没有就填 0）', 'R₃ (0 if none)'), unit: 'Ω', def: 0, min: 0 },
    ],
    out: { sym: 'R_eq', name: tr('等效电阻', 'equivalent resistance'), unit: 'Ω' },
    compute: (v) => v.R1 + v.R2 + v.R3,
    why: tr(
      `串联 = 同一个电流 I 依次流过每个电阻。由 KVL，总电压是各段电压之和：
$$V = IR_1 + IR_2 + IR_3 = I(R_1 + R_2 + R_3)$$
所以对外看，它们等于一个 $R_{eq} = R_1 + R_2 + R_3$ 的电阻。串联总电阻 **一定比其中最大的还大**。`,
      `Series = one current I flows through every resistor in turn. By KVL the total voltage is the sum of the pieces:
$$V = IR_1 + IR_2 + IR_3 = I(R_1 + R_2 + R_3)$$
So from outside they act like one resistor $R_{eq} = R_1 + R_2 + R_3$. A series total is **always larger than the largest one**.`,
    ),
    pitfalls: [
      tr('“首尾相连”不够：中间结点不能再接别的支路，否则就不是串联。', '"End to end" is not enough: the node between them must have no other branch, or it isn’t series.'),
    ],
    Figure: () => (
      <g>
        <R x1={20} y1={75} x2={90} y2={75} label="R₁" />
        <R x1={90} y1={75} x2={160} y2={75} label="R₂" />
        <R x1={160} y1={75} x2={230} y2={75} label="R₃" />
        <Dot x={20} y={75} />
        <Dot x={230} y={75} />
        <T x={125} y={120}>
          R_eq = R₁ + R₂ + R₃
        </T>
      </g>
    ),
    lessons: ['lesson-series', 'challenge-series-parallel'],
    chapter: 'equivalence',
  },
  {
    id: 'parallel-resistance',
    group: 'dc',
    title: tr('并联电阻 Parallel resistors', 'Parallel resistors'),
    tex: 'R_1 ∥ R_2 = \\frac{R_1 R_2}{R_1 + R_2}',
    use: tr('两个电阻接在同一对结点之间（两端电压相同）时，求总电阻。', 'Two resistors between the same pair of nodes (same voltage): find the total resistance.'),
    vars: [
      { sym: 'R1', name: 'R₁', unit: 'Ω', def: 10000 },
      { sym: 'R2', name: 'R₂', unit: 'Ω', def: 1000 },
    ],
    out: { sym: 'R_eq', name: tr('等效电阻', 'equivalent resistance'), unit: 'Ω' },
    compute: (v) => (v.R1 * v.R2) / (v.R1 + v.R2),
    why: tr(
      `并联 = 两端是同一个电压 V。由 KCL，总电流是两条支路电流之和：
$$I = \\frac{V}{R_1} + \\frac{V}{R_2} = V(\\frac{1}{R_1} + \\frac{1}{R_2})$$
所以 $\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2}$，两个电阻时化简成“积除以和”。用 **电导** $G = \\frac{1}{R}$ 想更直观：并联时电导相加。
**快速估算**：并联总电阻 **一定比最小的还小**；10 kΩ ∥ 1 kΩ ≈ 0.91 kΩ，大电阻几乎不起作用。`,
      `Parallel = both ends at the same voltage V. By KCL the total current is the sum of the branch currents:
$$I = \\frac{V}{R_1} + \\frac{V}{R_2} = V(\\frac{1}{R_1} + \\frac{1}{R_2})$$
So $\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2}$, which for two resistors is "product over sum". Thinking in **conductance** $G = \\frac{1}{R}$ is easier: conductances in parallel add.
**Quick check**: a parallel total is **always smaller than the smallest**; 10 kΩ ∥ 1 kΩ ≈ 0.91 kΩ — the big one hardly matters.`,
    ),
    pitfalls: [tr('“积除以和”只适用于两个电阻；三个以上用倒数和。', '"Product over sum" is for two resistors only; for three or more add the reciprocals.')],
    Figure: () => (
      <g>
        <Path d="40,30 220,30" />
        <Path d="40,120 220,120" />
        <R x1={90} y1={30} x2={90} y2={120} label="R₁" />
        <R x1={170} y1={30} x2={170} y2={120} label="R₂" />
        <Dot x={40} y={30} />
        <Dot x={40} y={120} />
        <VArrow x={20} y1={118} y2={34} label="V" />
      </g>
    ),
    lessons: ['lesson-parallel', 'challenge-series-parallel', 'exp-measure-req'],
    chapter: 'equivalence',
  },
  {
    id: 'voltage-divider',
    group: 'dc',
    title: tr('分压器 Voltage divider', 'Voltage divider'),
    tex: 'V_{out} = V_s \\frac{R_2}{R_1 + R_2}',
    use: tr('用两个串联电阻从一个大电压里取出一个小电压。', 'Take a smaller voltage out of a larger one with two series resistors.'),
    vars: [
      { sym: 'Vs', name: tr('电源电压', 'supply'), unit: 'V', def: 9 },
      { sym: 'R1', name: tr('上面的电阻 R₁', 'top resistor R₁'), unit: 'Ω', def: 20000 },
      { sym: 'R2', name: tr('下面的电阻 R₂', 'bottom resistor R₂'), unit: 'Ω', def: 10000 },
    ],
    out: { sym: 'V_out', name: tr('R₂ 上的电压', 'voltage across R₂'), unit: 'V' },
    compute: (v) => (v.Vs * v.R2) / (v.R1 + v.R2),
    why: tr(
      `三步推出来：
1. 串联：$I = \\frac{V_s{R_1 + R_2}$
2. 欧姆定律用在 R₂ 上：$V_{out} = I R_2$
3. 代入：$V_{out} = V_s \\frac{R_2}{R_1 + R_2}$

**前提**：R₁ 和 R₂ 流过 **同一个电流**——输出端不接负载（或负载电流远小于 I）。接了负载 R_L，下面的电阻就变成 $R_2 ∥ R_L$，输出会 **降低**（实验 1-3、2-5）。`,
      `Three steps:
1. Series: $I = \\frac{V_s{R_1 + R_2}$
2. Ohm’s law on R₂: $V_{out} = I R_2$
3. Substitute: $V_{out} = V_s \\frac{R_2}{R_1 + R_2}$

**Assumption**: R₁ and R₂ carry **the same current** — nothing loads the output (or the load current is much smaller than I). With a load R_L the bottom resistor becomes $R_2 ∥ R_L$ and the output **drops** (labs 1-3, 2-5).`,
    ),
    example: tr(
      '9 V，R₁ = 20 kΩ，R₂ = 10 kΩ：$V_{out} = 9 × \\frac{10}{30} = 3 V$（挑战 2）。',
      '9 V, R₁ = 20 kΩ, R₂ = 10 kΩ: $V_{out} = 9 × \\frac{10}{30} = 3 V$ (challenge 2).',
    ),
    pitfalls: [
      tr('分子是 **输出所在的那个** 电阻（R₂），不是 R₁。', 'The numerator is the resistor **the output is taken across** (R₂), not R₁.'),
      tr('接了负载以后公式里的 R₂ 要换成 R₂ ∥ R_L。', 'With a load, replace R₂ by R₂ ∥ R_L.'),
    ],
    Figure: () => (
      <g>
        <V x={40} y1={30} y2={120} label="Vₛ" />
        <Path d="40,30 40,20 140,20 140,30" />
        <R x1={140} y1={30} x2={140} y2={72} label="R₁" />
        <R x1={140} y1={78} x2={140} y2={120} label="R₂" />
        <W x1={140} y1={72} x2={140} y2={78} />
        <Path d="140,120 140,130 40,130 40,120" />
        <W x1={140} y1={75} x2={200} y2={75} />
        <Dot x={200} y={75} />
        <VArrow x={210} y1={128} y2={80} label="V_out" />
        <Gnd x={140} y={134} />
      </g>
    ),
    lessons: ['challenge-voltage-divider', 'exp-loaded-divider', 'exp5-adc-battery-divider', 'challenge-pot-dimmer'],
    chapter: 'equivalence',
  },
  {
    id: 'loaded-divider',
    group: 'dc',
    title: tr('带负载的分压器 Loaded divider', 'Loaded divider'),
    tex: 'V_{out} = V_s \\frac{R_2 ∥ R_L}{R_1 + R_2 ∥ R_L}',
    use: tr('分压器输出接上负载后，输出会掉多少。', 'How far a divider’s output drops once a load is connected.'),
    vars: [
      { sym: 'Vs', name: tr('电源电压', 'supply'), unit: 'V', def: 9 },
      { sym: 'R1', name: 'R₁', unit: 'Ω', def: 10000 },
      { sym: 'R2', name: 'R₂', unit: 'Ω', def: 10000 },
      { sym: 'RL', name: tr('负载 R_L', 'load R_L'), unit: 'Ω', def: 1000 },
    ],
    out: { sym: 'V_out', name: tr('负载上的电压', 'voltage on the load'), unit: 'V' },
    compute: (v) => {
      const p = (v.R2 * v.RL) / (v.R2 + v.RL);
      return (v.Vs * p) / (v.R1 + p);
    },
    why: tr(
      `负载 R_L 和 R₂ 接在同一对结点之间，是 **并联**。所以先把它们合成一个电阻 $R_2 ∥ R_L$，再用普通分压公式。
负载越小（越“重”），$R_2 ∥ R_L$ 越小，输出越低。经验：要让输出基本不变，$R_L$ 至少是 $R_2$ 的 10 倍以上——否则就在中间加一个 **电压跟随器**（实验 2-5）。`,
      `The load R_L sits between the same two nodes as R₂: they are **in parallel**. So combine them into $R_2 ∥ R_L$ first, then use the plain divider formula.
The smaller (heavier) the load, the smaller $R_2 ∥ R_L$ and the lower the output. Rule of thumb: for the output to barely move, $R_L$ should be at least 10 × $R_2$ — otherwise put a **voltage follower** in between (lab 2-5).`,
    ),
    example: tr(
      '9 V、10 k / 10 k、R_L = 1 kΩ：$R_2 ∥ R_L = 909 Ω$，$V_{out} = 9 × \\frac{909}{10909} ≈ 0.75 V$（空载 4.5 V）。',
      '9 V, 10 k / 10 k, R_L = 1 kΩ: $R_2 ∥ R_L = 909 Ω$, $V_{out} = 9 × \\frac{909}{10909} ≈ 0.75 V$ (4.5 V unloaded).',
    ),
    teardowns: ['lm358'],
    lessons: ['exp-loaded-divider', 'exp-voltage-follower'],
    chapter: 'equivalence',
  },
  {
    id: 'current-divider',
    group: 'dc',
    title: tr('分流 Current divider', 'Current divider'),
    tex: 'I_1 = I \\frac{R_2}{R_1 + R_2}',
    use: tr('总电流流进两条并联支路，每条分到多少。', 'A total current splits into two parallel branches: how much goes each way.'),
    vars: [
      { sym: 'I', name: tr('总电流', 'total current'), unit: 'A', def: 0.01 },
      { sym: 'R1', name: 'R₁', unit: 'Ω', def: 1000 },
      { sym: 'R2', name: 'R₂', unit: 'Ω', def: 3000 },
    ],
    out: { sym: 'I_1', name: tr('流过 R₁ 的电流', 'current in R₁'), unit: 'A' },
    compute: (v) => (v.I * v.R2) / (v.R1 + v.R2),
    why: tr(
      `并联两端电压相同：$V = I (R_1 ∥ R_2)$，于是 $I_1 = \\frac{V}{R_1} = I \\frac{R_2}{R_1 + R_2}$。
注意分子是 **另一条** 支路的电阻：电流更愿意走电阻小的路，R₁ 越小 I₁ 越大。`,
      `Both branches see the same voltage: $V = I (R_1 ∥ R_2)$, so $I_1 = \\frac{V}{R_1} = I \\frac{R_2}{R_1 + R_2}$.
Note the numerator is the **other** branch’s resistance: current prefers the easier path, so the smaller R₁ the larger I₁.`,
    ),
    pitfalls: [tr('和分压公式正好“反过来”：分子是对面那条支路。', 'It is the mirror of the divider formula: the numerator is the opposite branch.')],
    Figure: () => (
      <g>
        <I x={40} y1={30} y2={120} label="I" />
        <Path d="40,30 40,22 200,22 200,40" />
        <Path d="40,120 40,128 200,128 200,110" />
        <R x1={120} y1={22} x2={120} y2={128} label="R₁" />
        <R x1={200} y1={40} x2={200} y2={110} label="R₂" />
        <Dot x={120} y={22} />
        <Dot x={120} y={128} />
      </g>
    ),
    lessons: ['exp-current-divider', 'exp-kcl-ammeters'],
    chapter: 'equivalence',
  },
  {
    id: 'power',
    group: 'dc',
    title: tr('功率 Power', 'Power'),
    tex: 'P = UI = I^{2}R = \\frac{V^{2}}{R}',
    use: tr('元件消耗多少瓦——选电阻功率、判断会不会烫。', 'How many watts a part burns — to pick a resistor rating and see whether it gets hot.'),
    vars: [
      { sym: 'V', name: tr('电阻两端电压', 'voltage across R'), unit: 'V', def: 5 },
      { sym: 'R', name: tr('电阻', 'resistance'), unit: 'Ω', def: 100, min: 1e-3 },
    ],
    out: { sym: 'P', name: tr('功率', 'power'), unit: 'W' },
    compute: (v) => (v.V * v.V) / v.R,
    why: tr(
      `功率 = 每秒做的功 = 电压 × 电流：$P = UI$。把欧姆定律 $V = IR$ 代进去得到另外两种写法。
- 普通直插电阻是 **1/4 W**（0.25 W）。算出来超过它的一半，就换大功率电阻。
- 关联参考方向下 $P > 0$ 表示 **吸收** 功率，$P < 0$ 表示 **发出** 功率（电源）。`,
      `Power = work per second = voltage × current: $P = UI$. Substituting Ohm’s law $V = IR$ gives the other two forms.
- A normal through-hole resistor is **1/4 W** (0.25 W). If your number is more than half of that, use a bigger resistor.
- With associated reference directions $P > 0$ means **absorbed**, $P < 0$ means **delivered** (a source).`,
    ),
    example: tr(
      '5 V 加在 100 Ω 上：$P = \\frac{25}{100} = 0.25 W$——1/4 W 电阻刚好满载，会很烫。',
      '5 V across 100 Ω: $P = \\frac{25}{100} = 0.25 W$ — a 1/4 W resistor at its full rating; it gets hot.',
    ),
    lessons: ['exp-max-power', 'exp5-board-power-budget'],
    chapter: 'basics',
  },
  {
    id: 'led-resistor',
    group: 'dc',
    title: tr('LED 限流电阻 LED series resistor', 'LED series resistor'),
    tex: 'R = \\frac{V_s - V_F{I_F}',
    use: tr('给 LED 选串联电阻，让它亮又不烧。', 'Pick the resistor in series with an LED so it lights without burning out.'),
    vars: [
      { sym: 'Vs', name: tr('电源电压', 'supply'), unit: 'V', def: 9 },
      { sym: 'VF', name: tr('LED 正向压降 V_F（红 ≈ 2 V，蓝/白 ≈ 3 V）', 'LED forward voltage V_F (red ≈ 2 V, blue/white ≈ 3 V)'), unit: 'V', def: 2 },
      { sym: 'IF', name: tr('想要的电流（5–15 mA）', 'wanted current (5–15 mA)'), unit: 'A', def: 0.015 },
    ],
    out: { sym: 'R', name: tr('串联电阻', 'series resistor'), unit: 'Ω' },
    compute: (v) => (v.Vs - v.VF) / v.IF,
    why: tr(
      `LED 不是电阻：一旦导通，它两端的电压几乎固定在 $V_F$，电流却可以变得很大。所以必须串一个电阻来 **定电流**：
1. KVL：$V_s = V_R + V_F$，所以电阻上的电压 $V_R = V_s - V_F$
2. 欧姆定律：$I_F = \\frac{V_R{R}$
3. 解出 $R = \\frac{V_s - V_F{I_F}$，再选一个 **稍大** 的标准值（E12：330、470、680、1 k …）`,
      `An LED is not a resistor: once it conducts its voltage stays near $V_F$ while the current can grow huge. A series resistor has to **set the current**:
1. KVL: $V_s = V_R + V_F$, so the resistor sees $V_R = V_s - V_F$
2. Ohm’s law: $I_F = \\frac{V_R{R}$
3. Solve: $R = \\frac{V_s - V_F{I_F}$, then pick the next **larger** standard value (E12: 330, 470, 680, 1 k …)`,
    ),
    example: tr(
      '9 V、红 LED、15 mA：$R = \\frac{9 - 2}{0.015} ≈ 467 Ω$ → 选 470 Ω（第 1 课）。',
      '9 V, red LED, 15 mA: $R = \\frac{9 - 2}{0.015} ≈ 467 Ω$ → use 470 Ω (lesson 1).',
    ),
    pitfalls: [
      tr('忘了减 V_F：用 $\\frac{V_s{I}$ 会得到偏大的电阻（不危险，只是暗）。', 'Forgetting V_F: $\\frac{V_s{I}$ gives too large a resistor (safe, just dim).'),
      tr('不串电阻直接接电池：电流只受内阻限制，LED 立刻烧掉。', 'No resistor at all: only the battery’s internal resistance limits the current and the LED dies.'),
    ],
    Figure: () => (
      <g>
        <V x={40} y1={30} y2={120} label="Vₛ" />
        <Path d="40,30 40,22 70,22" />
        <R x1={70} y1={22} x2={150} y2={22} label="R" />
        <Path d="150,22 210,22 210,45" />
        <D x1={210} y1={45} x2={210} y2={105} label="V_F" led />
        <Path d="210,105 210,128 40,128 40,120" />
      </g>
    ),
    lessons: ['lesson-light-an-led', 'lesson-breadboard-basics', 'exp5-gpio-led-resistor', 'challenge-coin-cell'],
    chapter: 'basics',
  },
  {
    id: 'series-resistance-contact',
    group: 'dc',
    title: tr('接触电阻带来的误差', 'Error from contact resistance'),
    tex: tr('误差 = \\frac{2R_c}{R}', 'error = \\frac{2R_c}{R}'),
    use: tr('面包板触点串进来的电阻占多大比例。', 'How big a share the breadboard contacts add in series.'),
    vars: [
      { sym: 'R', name: tr('元件电阻', 'part resistance'), unit: 'Ω', def: 470 },
      { sym: 'Rc', name: tr('每个触点的接触电阻', 'contact resistance per contact'), unit: 'Ω', def: 0.03 },
    ],
    out: { sym: 'err', name: tr('相对误差', 'relative error'), unit: '%' },
    compute: (v) => ((2 * v.Rc) / v.R) * 100,
    why: tr(
      `元件的两只脚各经过一个触点，相当于串联了 $2R_c$。相对误差就是 $\\frac{2R_c}{R}$。几百欧以上的电阻可以忽略；测零点几欧的电阻时完全不能忽略（这时要用“四线法”）。`,
      `Each of the part’s two leads goes through one contact, adding $2R_c$ in series. The relative error is $\\frac{2R_c}{R}$. Negligible for hundreds of ohms; not at all negligible when measuring fractions of an ohm (that is what four-wire measurement is for).`,
    ),
    teardowns: ['breadboard'],
    lessons: ['lesson-breadboard-basics'],
  },
];
