// Calculation cards: circuit laws and theorems (KCL, KVL, nodal analysis, superposition, Thevenin /
// Norton, maximum power, the Wheatstone bridge, reducing a network) — phases 1 and 2.

import { tr } from '../../core/i18n';
import type { CalcCard, CalcGroup } from '../types';
import { D, Dot, Gnd, I, Path, R, T, V } from './fig';
import { Arrow, Box, Meter, Var } from './figx';

export const group = (): CalcGroup => ({
  id: 'circuit-laws',
  title: tr('电路定律与定理 Circuit laws', 'Circuit laws and theorems'),
  intro: tr(
    'KCL、KVL、结点电压法、叠加、戴维宁 / 诺顿、最大功率、电桥——第 1、2 期实验里每一个“先预测”都靠它们。',
    'KCL, KVL, nodal analysis, superposition, Thevenin / Norton, maximum power and the bridge — every "predict first" of phases 1 and 2 rests on these.',
  ),
});

const par = (a: number, b: number) => (a * b) / (a + b);

/** one node N fed by two sources through R1, R2, with R3 to ground (superposition / Millman) */
function TwoSourceNode({ i3 }: { i3?: boolean }) {
  return (
    <g>
      <V x={30} y1={62} y2={118} label="" />
      <T x={12} y={94} anchor="start">
        U₁
      </T>
      <Path d="30,62 30,40 50,40" />
      <R x1={50} y1={40} x2={115} y2={40} label="R₁" />
      <Path d="115,40 145,40" />
      <R x1={130} y1={40} x2={130} y2={128} label="R₃" />
      <R x1={145} y1={40} x2={205} y2={40} label="R₂" />
      <Path d="205,40 232,40 232,62" />
      <V x={232} y1={62} y2={118} label="" />
      <T x={250} y={94} anchor="end">
        U₂
      </T>
      <Path d="30,118 30,128 232,128 232,118" />
      <Dot x={130} y={40} />
      <T x={130} y={28}>
        N
      </T>
      {i3 && <Arrow x={118} y={95} dir="d" label="I₃" lx={100} />}
      <Gnd x={130} y={132} />
    </g>
  );
}

/** a Thevenin source (U_oc in series with R_eq) with its port a–b, optionally a load */
function TheveninFig({ load, variable }: { load?: boolean; variable?: boolean }) {
  return (
    <g>
      <Box x={14} y={14} w={142} h={122} dashed />
      <V x={45} y1={40} y2={110} label="" />
      <T x={62} y={80} anchor="start">
        U_oc
      </T>
      <Path d="45,40 45,30 70,30" />
      <R x1={70} y1={30} x2={140} y2={30} label="R_eq" />
      <Path d="140,30 170,30" />
      <Path d="45,110 45,120 170,120" />
      <Dot x={170} y={30} />
      <Dot x={170} y={120} />
      <T x={170} y={20}>
        a
      </T>
      <T x={170} y={140}>
        b
      </T>
      {load && (
        <>
          <Path d="170,30 220,30 220,45" />
          <R x1={220} y1={45} x2={220} y2={105} label="R_L" lx={230} />
          {variable && <Var x1={204} y1={95} x2={236} y2={55} />}
          <Path d="220,105 220,120 170,120" />
          <Arrow x={196} y={30} label="I" ly={22} />
        </>
      )}
    </g>
  );
}

export const cards = (): CalcCard[] => [
  {
    id: 'kcl',
    group: 'circuit-laws',
    title: tr('基尔霍夫电流定律 KCL', 'Kirchhoff’s current law (KCL)'),
    tex: 'Σ i_{in} = Σ i_{out}',
    use: tr(
      '一个结点上流进的电流之和等于流出的电流之和：知道几条支路，求剩下那一条。',
      'At a node the currents flowing in add up to the currents flowing out: know some branches, find the last one.',
    ),
    vars: [
      { sym: 'I_1', name: tr('流进结点的电流', 'current into the node'), unit: 'A', def: 0.00884 },
      { sym: 'I_2', name: tr('流出的另一条支路', 'current out through another branch'), unit: 'A', def: 0.00608 },
    ],
    out: { sym: 'I_3', name: tr('剩下那条支路流出的电流', 'current out through the last branch'), unit: 'A' },
    compute: (v) => v.I_1 - v.I_2,
    why: tr(
      `1. 电荷不会在结点上堆起来，也不会凭空出现：每一时刻流进多少就流出多少。
2. 先给每条支路选一个 **参考方向**（画箭头），再写代数和，比如“流出为正”：$-I_1 + I_2 + I_3 = 0$。
3. 只剩一个未知量时直接解：$I_3 = I_1 - I_2$。
4. 算出负数不是算错：它说明真实电流和你画的箭头方向相反。`,
      `1. Charge neither piles up at a node nor appears from nowhere: whatever flows in at each instant flows out.
2. Give every branch a **reference direction** (draw an arrow), then write the algebraic sum, e.g. "out is positive": $-I_1 + I_2 + I_3 = 0$.
3. With one unknown left, solve: $I_3 = I_1 - I_2$.
4. A negative answer is not a mistake: the real current flows against the arrow you drew.`,
    ),
    example: tr(
      '实验 1-1：$I_1 = \\frac{9 V}{330 + 1k ∥ 2.2k} = \\frac{9}{1017.5} ≈ 8.84 mA$，$I_2 = \\frac{6.08 V}{1 kΩ} ≈ 6.08 mA$，所以 $I_3 = 8.84 - 6.08 = 2.76 mA$——正好等于 $\\frac{6.08 V}{2.2 kΩ}$。实验 1-8：电流源的 10 mA 里有 3.2 mA 进了负载，$R_N$ 分到 10 − 3.2 = 6.8 mA。',
      'Lab 1-1: $I_1 = \\frac{9 V}{330 + 1k ∥ 2.2k} = \\frac{9}{1017.5} ≈ 8.84 mA$, $I_2 = \\frac{6.08 V}{1 kΩ} ≈ 6.08 mA$, so $I_3 = 8.84 - 6.08 = 2.76 mA$ — exactly $\\frac{6.08 V}{2.2 kΩ}$. Lab 1-8: of the source’s 10 mA, 3.2 mA goes into the load, so $R_N$ carries 10 − 3.2 = 6.8 mA.',
    ),
    pitfalls: [
      tr('电流表接反读数是负的：代进 KCL 时要连符号一起代。', 'An ammeter connected backwards reads negative: put the reading into KCL with its sign.'),
      tr(
        '同一条支路上串联的几个元件电流相同，它们之间的连接点不算新的 KCL 方程。',
        'Parts in series on one branch carry the same current; the joints between them give no new KCL equation.',
      ),
    ],
    Figure: () => (
      <g>
        <R x1={15} y1={40} x2={100} y2={40} label="R₁" />
        <Path d="100,40 210,40" />
        <Dot x={130} y={40} />
        <T x={130} y={28}>
          N
        </T>
        <R x1={130} y1={40} x2={130} y2={125} label="R₂" />
        <Path d="210,40 210,55" />
        <R x1={210} y1={55} x2={210} y2={125} label="R₃" />
        <Path d="130,125 210,125" />
        <Gnd x={170} y={125} />
        <Arrow x={110} y={40} label="I₁" ly={58} />
        <Arrow x={118} y={95} dir="d" label="I₂" lx={98} />
        <Arrow x={198} y={95} dir="d" label="I₃" lx={178} />
      </g>
    ),
    lessons: ['exp-kcl-ammeters', 'exp-current-divider', 'exp-nodal-analysis', 'exp-measure-req', 'exp-source-transformation', 'lesson-parallel'],
    chapter: 'basics',
  },
  {
    id: 'kvl',
    group: 'circuit-laws',
    title: tr('基尔霍夫电压定律 KVL', 'Kirchhoff’s voltage law (KVL)'),
    tex: 'Σ u = 0 ⇒ U_3 = U_s - U_1 - U_2',
    use: tr(
      '沿一个闭合回路走一圈，电压的升降加起来是 0：知道其它元件的电压，求剩下那一个。',
      'Around any closed loop the rises and drops add up to 0: know the other voltages, find the last one.',
    ),
    vars: [
      { sym: 'U_s', name: tr('电源电压', 'source voltage'), unit: 'V', def: 9 },
      { sym: 'U_1', name: tr('第一个元件上的电压', 'voltage across the first part'), unit: 'V', def: 7.03 },
      { sym: 'U_2', name: tr('第二个元件上的电压（没有就填 0）', 'voltage across the second part (0 if none)'), unit: 'V', def: 0.62 },
    ],
    out: { sym: 'U_3', name: tr('最后一个元件上的电压', 'voltage across the last part'), unit: 'V' },
    compute: (v) => v.U_s - v.U_1 - v.U_2,
    why: tr(
      `1. 电压是两点的电位差。从一点出发沿回路走一圈回到原点，电位回到原来的值，所以一路上的电压升降之和为 0。
2. 选一个绕行方向：顺着走从 + 到 − 记为降（正），从 − 到 + 记为升（负）。
3. 只有一个未知量时直接解出：$U_3 = U_s - U_1 - U_2$。
4. KVL 只讲电压，不管元件是什么——LED 这种非线性元件也照样成立。没有电源的回路（两条并联支路）告诉你：**并联支路两端电压相同**。`,
      `1. A voltage is a difference of potential. Walk once around a loop back to the start and you are at the same potential again, so the rises and drops along the way add up to 0.
2. Pick a direction: going from + to − counts as a drop (positive), from − to + as a rise (negative).
3. With one unknown, solve: $U_3 = U_s - U_1 - U_2$.
4. KVL only talks about voltages, not about what the parts are — it holds for a non-linear LED as well. A loop with no source (two parallel branches) tells you that **parallel branches have the same voltage**.`,
    ),
    example: tr(
      '实验 1-2 回路③：$9.00 = 7.03 + 0.62 + U_{R3}$，所以 $U_{R3} ≈ 1.35 V$（读数 1.36 V，差在读数的末位）。第 9 课：$6.18 + 2.81 ≈ 9.0 V$。',
      'Lab 1-2, loop ③: $9.00 = 7.03 + 0.62 + U_{R3}$, so $U_{R3} ≈ 1.35 V$ (the meter shows 1.36 V; the difference is in the last digit). Lesson 9: $6.18 + 2.81 ≈ 9.0 V$.',
    ),
    pitfalls: [
      tr(
        '读数的符号由红黑表笔决定：写方程前先定好每个电压的参考方向。',
        'The sign of a reading is set by which probe is red: fix each voltage’s reference direction before writing the equation.',
      ),
      tr(
        '交流电路里 KVL 加的是相量，不是有效值或峰峰值（见“交流 KVL：相量相加”）。',
        'In AC circuits KVL adds phasors, not RMS or peak-to-peak values (see "AC KVL: phasors add").',
      ),
    ],
    Figure: () => (
      <g>
        <V x={40} y1={42} y2={108} label="Uₛ" />
        <Path d="40,42 40,25 70,25" />
        <R x1={70} y1={25} x2={150} y2={25} label="U₁" />
        <Path d="150,25 210,25 210,45" />
        <R x1={210} y1={45} x2={210} y2={105} label="U₂" />
        <Path d="210,105 210,125 150,125" />
        <R x1={150} y1={125} x2={70} y2={125} label="U₃" lx={110} ly={145} />
        <Path d="70,125 40,125 40,108" />
        <path d="M150 75 a26 26 0 1 1 -8 -18 M146 50 l-3 7 l7 1" className="cf-w accent" fill="none" />
        <T x={124} y={80} cls="accent">
          Σu = 0
        </T>
      </g>
    ),
    lessons: ['exp-kvl-loops', 'lesson-multimeter', 'lesson-series', 'lesson-power-and-ground', 'exp-measure-req'],
    chapter: 'basics',
  },
  {
    id: 'led-current',
    group: 'circuit-laws',
    title: tr('LED 回路的电流 LED loop current', 'Current in an LED loop'),
    tex: 'I = \\frac{U_s - ΣU_F}{R + Σr_d + R_{int}}',
    use: tr('电源、电阻和一个或几个串联 LED：LED 实际流过多少电流。', 'A source, a resistor and one or more LEDs in series: how much current really flows.'),
    vars: [
      { sym: 'U_s', name: tr('电源电动势', 'source EMF'), unit: 'V', def: 9 },
      { sym: 'U_F', name: tr('所有 LED 的 U_F 之和（红 1.8、绿 2.1、蓝/白 3.0）', 'sum of the LEDs’ U_F (red 1.8, green 2.1, blue/white 3.0)'), unit: 'V', def: 3.9 },
      { sym: 'R', name: tr('串联电阻（含电位器）', 'series resistance (pot included)'), unit: 'Ω', def: 220 },
      { sym: 'r_d', name: tr('LED 内阻之和（每个 ≈ 12 Ω）', 'sum of the LED resistances (≈ 12 Ω each)'), unit: 'Ω', def: 24, min: 0 },
      {
        sym: 'R_int',
        name: tr('电源内阻（模块 ≈ 0、9 V 电池 1.5 Ω、纽扣电池 15 Ω）', 'source resistance (module ≈ 0, 9 V battery 1.5 Ω, coin cell 15 Ω)'),
        unit: 'Ω',
        def: 0,
        min: 0,
      },
    ],
    out: { sym: 'I', name: tr('回路电流（不够 ΣU_F 时为 0）', 'loop current (0 below ΣU_F)'), unit: 'A' },
    compute: (v) => Math.max(0, (v.U_s - v.U_F) / (v.R + v.r_d + v.R_int)),
    why: tr(
      `1. 导通的 LED 用折线模型看：一个电压源 $U_F$ 串一个小电阻 $r_d ≈ 12 Ω$（模拟器就是这样建模的）。
2. 整个回路串联，处处是同一个电流 I。
3. KVL：$U_s = I R_{int} + I R + ΣU_F + I Σr_d$。
4. 解出 $I = \\frac{U_s - ΣU_F}{R + Σr_d + R_{int}}$。
5. 如果 $U_s < ΣU_F$，LED 根本不导通，I = 0：3 V 点不亮串联的红 + 绿 LED（需要 3.9 V）。
只用 $\\frac{U_s - U_F}{R}$ 估算会偏大 1–2 mA，选电阻时够用；要和读数对比时把 $r_d$ 和内阻加上。`,
      `1. Treat a conducting LED with the piecewise model: a voltage source $U_F$ in series with a small $r_d ≈ 12 Ω$ (that is how the simulator models it).
2. Everything is in series, so one current I flows everywhere.
3. KVL: $U_s = I R_{int} + I R + ΣU_F + I Σr_d$.
4. Solve: $I = \\frac{U_s - ΣU_F}{R + Σr_d + R_{int}}$.
5. If $U_s < ΣU_F$ the LEDs don’t conduct at all and I = 0: 3 V cannot light a red + green pair (they need 3.9 V).
The quick $\\frac{U_s - U_F}{R}$ comes out 1–2 mA high — fine for choosing a resistor; add $r_d$ and the source resistance when you compare with a reading.`,
    ),
    example: tr(
      `- 挑战 1：9 V、220 Ω、红 + 绿：$I = \\frac{9 - 3.9}{220 + 24} ≈ 21 mA$（只用 $U_F$ 估算是 23 mA）。
- 第 3 课：5 V、150 Ω、绿：$\\frac{5 - 2.1}{150 + 12} ≈ 18 mA$，电阻上 $18 mA × 150 Ω ≈ 2.7 V$。
- 挑战 9：CR2032（3 V、15 Ω）、47 Ω、红：$\\frac{3 - 1.8}{47 + 12 + 15} ≈ 16 mA$；不串电阻是 $\\frac{1.2}{27} ≈ 44 mA$。
- 挑战 3：电位器转到 100 %：$\\frac{5 - 1.8}{220 + 10k + 12} ≈ 0.31 mA$，灯灭。`,
      `- Challenge 1: 9 V, 220 Ω, red + green: $I = \\frac{9 - 3.9}{220 + 24} ≈ 21 mA$ (23 mA with $U_F$ alone).
- Lesson 3: 5 V, 150 Ω, green: $\\frac{5 - 2.1}{150 + 12} ≈ 18 mA$; the resistor drops $18 mA × 150 Ω ≈ 2.7 V$.
- Challenge 9: CR2032 (3 V, 15 Ω), 47 Ω, red: $\\frac{3 - 1.8}{47 + 12 + 15} ≈ 16 mA$; with no resistor $\\frac{1.2}{27} ≈ 44 mA$.
- Challenge 3: pot at 100 %: $\\frac{5 - 1.8}{220 + 10k + 12} ≈ 0.31 mA$ — the LED goes out.`,
    ),
    pitfalls: [
      tr(
        '两个 LED 直接并联共用一个电阻：$U_F$ 小的先导通、把电压钳住，另一个几乎不亮——每个 LED 自己串一个电阻。',
        'Two LEDs in parallel sharing one resistor: the one with the lower $U_F$ turns on first and clamps the voltage, the other barely lights — give each LED its own resistor.',
      ),
      tr('电位器当可变电阻用时，它的阻值也在 R 里；转到 0 时只剩保护电阻。', 'A pot used as a rheostat is part of R; at 0 only the protection resistor is left.'),
    ],
    Figure: () => (
      <g>
        <V x={35} y1={40} y2={110} label="Uₛ" />
        <Path d="35,40 35,25 60,25" />
        <R x1={60} y1={25} x2={140} y2={25} label="R" />
        <Path d="140,25 215,25 215,30" />
        <D x1={215} y1={30} x2={215} y2={75} led />
        <D x1={215} y1={75} x2={215} y2={120} led />
        <T x={236} y={56} anchor="start" cls="small">
          U_F
        </T>
        <T x={236} y={101} anchor="start" cls="small">
          U_F
        </T>
        <Path d="215,120 215,128 35,128 35,110" />
        <Arrow x={175} y={25} label="I" ly={17} />
      </g>
    ),
    teardowns: ['led', 'battery'],
    lessons: [
      'lesson-light-an-led',
      'lesson-series',
      'lesson-parallel',
      'lesson-pushbutton',
      'challenge-two-leds-series',
      'challenge-pot-dimmer',
      'challenge-spdt-selector',
      'challenge-button-parallel',
      'challenge-module-blue-led',
      'challenge-coin-cell',
      'challenge-bench-supply',
      'challenge-fix-the-circuit',
      'lesson-ammeter',
      'exp-kvl-loops',
      'exp3-led-breathing',
    ],
    chapter: 'nonlinear',
  },
  {
    id: 'node-voltage',
    group: 'circuit-laws',
    title: tr('结点电压法（一个结点）Node voltage', 'Node-voltage method (one node)'),
    tex: 'U_N = \\frac{\\frac{U_1}{R_1} + \\frac{U_2}{R_2} + I_s}{\\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}}',
    use: tr('几条支路汇到一个结点：一条 KCL 方程直接求出这个结点的电压。', 'Several branches meet at one node: one KCL equation gives that node’s voltage.'),
    vars: [
      { sym: 'U_1', name: tr('电源 1（经 R₁ 接到 N）', 'source 1 (reaches N through R₁)'), unit: 'V', def: 9 },
      { sym: 'R_1', name: 'R₁', unit: 'Ω', def: 1000 },
      { sym: 'U_2', name: tr('电源 2（经 R₂ 接到 N，没有就填 0）', 'source 2 (through R₂; 0 if none)'), unit: 'V', def: 5 },
      { sym: 'R_2', name: 'R₂', unit: 'Ω', def: 2200 },
      { sym: 'R_3', name: tr('N 到地的电阻 R₃', 'R₃ from N to ground'), unit: 'Ω', def: 3300 },
      { sym: 'I_s', name: tr('流进 N 的电流源（没有就填 0）', 'current source into N (0 if none)'), unit: 'A', def: 0 },
    ],
    out: { sym: 'U_N', name: tr('结点 N 的电压', 'voltage of node N'), unit: 'V' },
    compute: (v) => (v.U_1 / v.R_1 + v.U_2 / v.R_2 + v.I_s) / (1 / v.R_1 + 1 / v.R_2 + 1 / v.R_3),
    why: tr(
      `1. 选 GND 做参考结点，未知量只剩 $U_N$。
2. 对 N 写 KCL，每条支路电流都写成“从 N 流出”：$\\frac{U_N - U_1}{R_1} + \\frac{U_N - U_2}{R_2} + \\frac{U_N}{R_3} - I_s = 0$。
3. 把含 $U_N$ 的项合并：左边系数是接在 N 上所有电导之和（**自电导**），右边是每个“电压源 ÷ 串联电阻”加上流进的电流源（**注入电流**）。
4. 解出 $U_N$，再用欧姆定律求每条支路的电流，比如 $I_3 = \\frac{U_N}{R_3}$。
单位技巧：用 V、kΩ、mA，电导就是 mS。`,
      `1. Take GND as the reference node; the only unknown left is $U_N$.
2. Write KCL at N with every branch current "leaving N": $\\frac{U_N - U_1}{R_1} + \\frac{U_N - U_2}{R_2} + \\frac{U_N}{R_3} - I_s = 0$.
3. Collect the $U_N$ terms: on the left the sum of all conductances at N (the **self-conductance**), on the right each "voltage source ÷ its series resistor" plus the current source flowing in (the **injected current**).
4. Solve for $U_N$, then Ohm’s law gives every branch current, e.g. $I_3 = \\frac{U_N}{R_3}$.
Unit trick: in V, kΩ and mA the conductances come out in mS.`,
    ),
    example: tr(
      '实验 2-1（两个电源都接上）：$U_N = \\frac{9/1 + 5/2.2}{1 + 0.4545 + 0.3030} = \\frac{11.27}{1.7576} ≈ 6.41 V$，$I_3 = \\frac{6.41}{3.3} ≈ 1.94 mA$。',
      'Lab 2-1 (both sources on): $U_N = \\frac{9/1 + 5/2.2}{1 + 0.4545 + 0.3030} = \\frac{11.27}{1.7576} ≈ 6.41 V$, $I_3 = \\frac{6.41}{3.3} ≈ 1.94 mA$.',
    ),
    pitfalls: [
      tr('电流源：流进结点为正，流出为负。', 'Current sources: flowing into the node is positive, out of it negative.'),
      tr(
        '和电流源串联的电阻不进自电导（它不影响电流源送进来的电流）。',
        'A resistor in series with a current source does not enter the self-conductance (it doesn’t change the injected current).',
      ),
    ],
    Figure: () => <TwoSourceNode />,
    lessons: ['exp-superposition', 'exp-nodal-analysis', 'exp-kcl-ammeters'],
    chapter: 'methods',
  },
  {
    id: 'nodal-two-node',
    group: 'circuit-laws',
    title: tr('结点电压法（两个结点）Two-node analysis', 'Nodal analysis with two nodes'),
    tex: '\\mat{G_{11} & -G_{12} ; -G_{12} & G_{22}} \\mat{U_1 ; U_2} = \\mat{U_s/R_1 ; I_s}',
    use: tr(
      '实验 2-4 的电路：一个电压源、一个电流源、两个未知结点，写成 2×2 方程组求解。',
      'The lab 2-4 circuit — one voltage source, one current source, two unknown nodes — as a 2 × 2 system.',
    ),
    vars: [
      { sym: 'U_s', name: tr('电压源（经 R₁ 接 N₁）', 'voltage source (through R₁ to N₁)'), unit: 'V', def: 9 },
      { sym: 'R_1', name: 'R₁', unit: 'Ω', def: 1000 },
      { sym: 'R_2', name: tr('N₁ 到地 R₂', 'R₂ from N₁ to ground'), unit: 'Ω', def: 2200 },
      { sym: 'R_3', name: tr('N₁ 到 N₂ 的 R₃', 'R₃ between N₁ and N₂'), unit: 'Ω', def: 1000 },
      { sym: 'R_4', name: tr('N₂ 到地 R₄', 'R₄ from N₂ to ground'), unit: 'Ω', def: 3300 },
      { sym: 'I_s', name: tr('流进 N₂ 的电流源', 'current source into N₂'), unit: 'A', def: 0.005 },
    ],
    out: { sym: 'U_2', name: tr('结点 N₂ 的电压', 'voltage of node N₂'), unit: 'V' },
    compute: (v) => {
      const g11 = 1 / v.R_1 + 1 / v.R_2 + 1 / v.R_3;
      const g12 = 1 / v.R_3;
      const g22 = 1 / v.R_3 + 1 / v.R_4;
      return (g11 * v.I_s + g12 * (v.U_s / v.R_1)) / (g11 * g22 - g12 * g12);
    },
    why: tr(
      `1. GND 是参考结点，未知量是 $U_1$、$U_2$。
2. N₁ 的 KCL：$(\\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3})U_1 - \\frac{1}{R_3}U_2 = \\frac{U_s}{R_1}$
3. N₂ 的 KCL：$-\\frac{1}{R_3}U_1 + (\\frac{1}{R_3} + \\frac{1}{R_4})U_2 = I_s$
4. 规律：对角线是 **自电导** $G_{11}$、$G_{22}$；非对角线是两个结点之间的 **互电导** 取负号；右边是注入电流。
5. 克拉默法则：$U_2 = \\frac{G_{11} I_s + G_{12} U_s/R_1}{G_{11}G_{22} - G_{12}^{2}}$，$U_1 = \\frac{G_{22} U_s/R_1 + G_{12} I_s}{G_{11}G_{22} - G_{12}^{2}}$。`,
      `1. GND is the reference; the unknowns are $U_1$ and $U_2$.
2. KCL at N₁: $(\\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3})U_1 - \\frac{1}{R_3}U_2 = \\frac{U_s}{R_1}$
3. KCL at N₂: $-\\frac{1}{R_3}U_1 + (\\frac{1}{R_3} + \\frac{1}{R_4})U_2 = I_s$
4. The pattern: the diagonal holds the **self-conductances** $G_{11}$, $G_{22}$; off the diagonal the **mutual conductance** between the two nodes with a minus sign; on the right the injected currents.
5. Cramer’s rule: $U_2 = \\frac{G_{11} I_s + G_{12} U_s/R_1}{G_{11}G_{22} - G_{12}^{2}}$, $U_1 = \\frac{G_{22} U_s/R_1 + G_{12} I_s}{G_{11}G_{22} - G_{12}^{2}}$.`,
    ),
    example: tr(
      '实验 2-4（V、kΩ、mA、mS）：$2.4545U_1 - U_2 = 9$，$-U_1 + 1.3030U_2 = 5$。行列式 $2.4545 × 1.3030 - 1 = 2.198$，$U_1 = \\frac{9 × 1.3030 + 5}{2.198} ≈ 7.61 V$，$U_2 = \\frac{2.4545 × 5 + 9}{2.198} ≈ 9.68 V$——比 9 V 电源还高：电流源会把它的结点推到需要的任何电压。$I_{R3} = \\frac{7.61 - 9.68}{1k} ≈ -2.06 mA$。',
      'Lab 2-4 (V, kΩ, mA, mS): $2.4545U_1 - U_2 = 9$, $-U_1 + 1.3030U_2 = 5$. Determinant $2.4545 × 1.3030 - 1 = 2.198$, $U_1 = \\frac{9 × 1.3030 + 5}{2.198} ≈ 7.61 V$, $U_2 = \\frac{2.4545 × 5 + 9}{2.198} ≈ 9.68 V$ — above the 9 V source: a current source pushes its node to whatever voltage it takes. $I_{R3} = \\frac{7.61 - 9.68}{1k} ≈ -2.06 mA$.',
    ),
    pitfalls: [
      tr('互电导项是负号：$-\\frac{1}{R_3}$，写成正号整组解都错。', 'The mutual term is negative: $-\\frac{1}{R_3}$; a plus sign there spoils the whole solution.'),
      tr(
        '稳压电源当电流源用时，结点电压必须低于它的电压设定（实验里是 12 V），否则它退回 CV。',
        'A bench supply acting as a current source only works while the node stays below its voltage setting (12 V here); above that it falls back to CV.',
      ),
    ],
    Figure: () => (
      <g>
        <V x={25} y1={60} y2={118} label="" />
        <T x={8} y={93} anchor="start">
          Uₛ
        </T>
        <Path d="25,60 25,30 40,30" />
        <R x1={40} y1={30} x2={90} y2={30} label="R₁" />
        <Path d="90,30 100,30" />
        <R x1={100} y1={30} x2={100} y2={128} label="R₂" />
        <R x1={100} y1={30} x2={165} y2={30} label="R₃" />
        <R x1={170} y1={30} x2={170} y2={128} label="R₄" />
        <Path d="165,30 235,30 235,60" />
        <I x={235} y1={60} y2={118} />
        <T x={250} y={93} anchor="end">
          Iₛ
        </T>
        <Path d="25,118 25,128 235,128 235,118" />
        <Dot x={100} y={30} />
        <Dot x={170} y={30} />
        <T x={100} y={18}>
          N₁
        </T>
        <T x={170} y={18}>
          N₂
        </T>
        <Gnd x={135} y={132} />
      </g>
    ),
    lessons: ['exp-nodal-analysis'],
    chapter: 'methods',
  },
  {
    id: 'superposition',
    group: 'circuit-laws',
    title: tr('叠加定理 Superposition', 'Superposition'),
    tex: "I_3 = I_3' + I_3''",
    use: tr('几个独立源一起作用的响应 = 每个源单独作用的响应之和。', 'The response to several independent sources = the sum of the responses to each source alone.'),
    vars: [
      { sym: 'U_1', name: tr('电源 1', 'source 1'), unit: 'V', def: 9 },
      { sym: 'U_2', name: tr('电源 2', 'source 2'), unit: 'V', def: 5 },
      { sym: 'R_1', name: 'R₁', unit: 'Ω', def: 1000 },
      { sym: 'R_2', name: 'R₂', unit: 'Ω', def: 2200 },
      { sym: 'R_3', name: 'R₃', unit: 'Ω', def: 3300 },
    ],
    out: { sym: 'I_3', name: tr('两个源一起时 R₃ 的电流', 'current in R₃ with both sources on'), unit: 'A' },
    compute: (v) => {
      const g = 1 / v.R_1 + 1 / v.R_2 + 1 / v.R_3;
      const i1 = v.U_1 / v.R_1 / g / v.R_3;
      const i2 = v.U_2 / v.R_2 / g / v.R_3;
      return i1 + i2;
    },
    why: tr(
      `1. 线性电路里，响应对每个独立源都是“成比例”的，所以可以分开算再相加。
2. 让一个源单独作用时，其余源 **置零**：电压源换成 **短路**，电流源换成 **开路**（受控源保留）。
3. 只有 U₁：$U_N' = \\frac{U_1/R_1}{1/R_1 + 1/R_2 + 1/R_3}$，$I_3' = \\frac{U_N'}{R_3}$。
4. 只有 U₂：$U_N'' = \\frac{U_2/R_2}{1/R_1 + 1/R_2 + 1/R_3}$，$I_3'' = \\frac{U_N''}{R_3}$。
5. 相加（带方向）：$I_3 = I_3' + I_3''$。
**功率不能叠加**：$P = I^{2}R$ 是平方，$(a + b)^{2} ≠ a^{2} + b^{2}$。`,
      `1. In a linear circuit the response is proportional to each independent source, so you may compute them separately and add.
2. While one source acts, **zero** the others: a voltage source becomes a **short**, a current source an **open** (dependent sources stay).
3. U₁ alone: $U_N' = \\frac{U_1/R_1}{1/R_1 + 1/R_2 + 1/R_3}$, $I_3' = \\frac{U_N'}{R_3}$.
4. U₂ alone: $U_N'' = \\frac{U_2/R_2}{1/R_1 + 1/R_2 + 1/R_3}$, $I_3'' = \\frac{U_N''}{R_3}$.
5. Add, with signs: $I_3 = I_3' + I_3''$.
**Power does not superpose**: $P = I^{2}R$ is a square and $(a + b)^{2} ≠ a^{2} + b^{2}$.`,
    ),
    example: tr(
      `实验 2-1：分母 1.7576 mS。只有 9 V：$U_N' ≈ 5.12 V$，$I_3' ≈ 1.55 mA$；只有 5 V：$U_N'' ≈ 1.29 V$，$I_3'' ≈ 0.39 mA$；一起：$1.55 + 0.39 = 1.94 mA$ ✔。R₃ 的功率：7.9 + 0.5 = 8.4 mW，但一起作用时是 $1.94^{2} × 3.3 ≈ 12.5 mW$。`,
      `Lab 2-1: the denominator is 1.7576 mS. 9 V alone: $U_N' ≈ 5.12 V$, $I_3' ≈ 1.55 mA$; 5 V alone: $U_N'' ≈ 1.29 V$, $I_3'' ≈ 0.39 mA$; together $1.55 + 0.39 = 1.94 mA$ ✔. Power in R₃: 7.9 + 0.5 = 8.4 mW, yet with both on it is $1.94^{2} × 3.3 ≈ 12.5 mW$.`,
    ),
    pitfalls: [
      tr(
        '“不作用”的电压源要 **短路**，不是拔掉（开路）——实验里开关拨到 GND，不是悬空。',
        'A source that is "off" must be **shorted**, not removed (opened) — in the lab the switch goes to GND, not left floating.',
      ),
      tr('功率、能量不能叠加；电压、电流可以。', 'Voltages and currents superpose; power and energy do not.'),
    ],
    Figure: () => <TwoSourceNode i3 />,
    lessons: ['exp-superposition'],
    chapter: 'theorems',
  },
  {
    id: 'thevenin',
    group: 'circuit-laws',
    title: tr('戴维宁等效：开路电压 + 短路电流', 'Thevenin from open-circuit voltage and short-circuit current'),
    tex: 'R_{eq} = \\frac{U_{oc}}{I_{sc}}',
    use: tr(
      '测出（或算出）端口的开路电压和短路电流，就得到整个网络的等效电阻。',
      'Measure (or work out) the open-circuit voltage and short-circuit current at a port and you have the whole network’s equivalent resistance.',
    ),
    vars: [
      { sym: 'U_oc', name: tr('开路电压', 'open-circuit voltage'), unit: 'V', def: 6.19 },
      { sym: 'I_sc', name: tr('短路电流', 'short-circuit current'), unit: 'A', def: 0.005345 },
    ],
    out: { sym: 'R_eq', name: tr('等效电阻', 'equivalent resistance'), unit: 'Ω' },
    compute: (v) => v.U_oc / v.I_sc,
    why: tr(
      `1. 任何含源线性二端网络，对外都等效成一个电压源 $U_{oc}$ 串一个电阻 $R_{eq}$。
2. 端口开路：没有电流流过 $R_{eq}$，它上面没有压降，端口电压就是 $U_{oc}$。
3. 端口短路：$I_{sc} = \\frac{U_{oc}}{R_{eq}}$。
4. 两个测量相除：$R_{eq} = \\frac{U_{oc}}{I_{sc}}$。（另一条路：把独立源置零，从端口看进去算电阻——见“戴维宁等效电阻”。）
5. 用法：接上负载 $R_L$，$U_L = U_{oc}\\frac{R_L}{R_{eq} + R_L}$，一步就出来，不用再解整个网络。`,
      `1. Any linear two-terminal network with sources looks, from outside, like a voltage source $U_{oc}$ in series with a resistance $R_{eq}$.
2. Port open: no current flows in $R_{eq}$, so it drops nothing and the port shows $U_{oc}$.
3. Port shorted: $I_{sc} = \\frac{U_{oc}}{R_{eq}}$.
4. Divide the two: $R_{eq} = \\frac{U_{oc}}{I_{sc}}$. (The other way: zero the independent sources and look into the port — see "Thevenin resistance".)
5. What it is for: with a load $R_L$, $U_L = U_{oc}\\frac{R_L}{R_{eq} + R_L}$ in one step, without solving the whole network again.`,
    ),
    example: tr(
      '实验 2-2：$U_{oc} = 9 × \\frac{2.2}{3.2} ≈ 6.19 V$，$I_{sc} ≈ 5.345 mA$，$R_{eq} ≈ 1158 Ω$ = $470 + 1k ∥ 2.2k$ ✔。实验 1-3 的分压器从 VOUT 看是“4.5 V 串 5 kΩ”：接 1 kΩ，$U = 4.5 × \\frac{1}{6} = 0.75 V$。',
      'Lab 2-2: $U_{oc} = 9 × \\frac{2.2}{3.2} ≈ 6.19 V$, $I_{sc} ≈ 5.345 mA$, $R_{eq} ≈ 1158 Ω$ = $470 + 1k ∥ 2.2k$ ✔. The lab 1-3 divider seen from VOUT is "4.5 V in series with 5 kΩ": with 1 kΩ on it, $U = 4.5 × \\frac{1}{6} = 0.75 V$.',
    ),
    pitfalls: [
      tr(
        '短路法只适合短路电流很小的网络——绝不要把电池或电源输出直接短路。',
        'The short-circuit method is only for networks with a small $I_sc$ — never short a battery or a supply output.',
      ),
      tr(
        '真实电流表有几欧内阻，“短路”不彻底：$I_sc$ 偏小，算出的 $R_eq$ 偏大约 1 %。',
        'A real ammeter has a few ohms inside, so the "short" isn’t perfect: $I_sc$ comes out low and $R_eq$ about 1 % high.',
      ),
    ],
    Figure: () => <TheveninFig load />,
    teardowns: ['battery'],
    lessons: ['exp-thevenin-measure', 'exp-max-power', 'exp-loaded-divider', 'exp3-rc-thevenin-tau', 'lesson-power-supplies'],
    chapter: 'theorems',
  },
  {
    id: 'thevenin-resistance',
    group: 'circuit-laws',
    title: tr('戴维宁等效电阻（置零法）', 'Thevenin resistance (zero the sources)'),
    tex: 'R_{eq} = R_3 + R_1 ∥ R_2',
    use: tr(
      '电源置零后从端口往里看的电阻——等效电路的内阻，也是电容 / 电感“看到”的电阻。',
      'The resistance seen into the port with the sources zeroed — the equivalent’s internal resistance, and what a capacitor or inductor “sees”.',
    ),
    vars: [
      { sym: 'R_1', name: tr('电源和结点 A 之间的 R₁（含电源内阻）', 'R₁ between the source and node A (source resistance included)'), unit: 'Ω', def: 1000 },
      { sym: 'R_2', name: tr('A 到地的 R₂', 'R₂ from A to ground'), unit: 'Ω', def: 2200 },
      { sym: 'R_3', name: tr('A 到端口的 R₃（没有就填 0）', 'R₃ from A to the port (0 if none)'), unit: 'Ω', def: 470, min: 0 },
    ],
    out: { sym: 'R_eq', name: tr('从端口看进去的电阻', 'resistance seen into the port'), unit: 'Ω' },
    compute: (v) => v.R_3 + par(v.R_1, v.R_2),
    why: tr(
      `1. 把独立源置零：电压源换成 **导线**，电流源换成 **开路**。
2. 电压源变成导线以后，R₁ 的上端也接到了 GND，所以从 A 往下看，R₁ 和 R₂ **并联**。
3. 再串上 A 到端口的 R₃：$R_{eq} = R_3 + R_1 ∥ R_2$。
4. 开路电压另算：R₃ 里没有电流，$U_{oc} = U_s \\frac{R_2}{R_1 + R_2}$。
5. 一阶电路里，电容 / 电感就是“端口”：$τ = R_{eq}C$ 或 $τ = \\frac{L}{R_{eq}}$。`,
      `1. Zero the independent sources: a voltage source becomes a **wire**, a current source an **open**.
2. With the source a wire, the top of R₁ is at GND too, so looking down from A, R₁ and R₂ are **in parallel**.
3. Add R₃ from A to the port in series: $R_{eq} = R_3 + R_1 ∥ R_2$.
4. The open-circuit voltage separately: R₃ carries no current, so $U_{oc} = U_s \\frac{R_2}{R_1 + R_2}$.
5. In a first-order circuit the capacitor or inductor is the "port": $τ = R_{eq}C$ or $τ = \\frac{L}{R_{eq}}$.`,
    ),
    example: tr(
      `- 实验 2-2：$470 + 1k ∥ 2.2k = 470 + 687.5 = 1157.5 Ω$。
- 实验 3-7：电容看到 $(10k + 50) ∥ 10k ≈ 5.01 kΩ$（R₃ = 0），$τ ≈ 0.50 ms$——只有单纯串联 RC 的一半。
- 实验 3-5 充电：$(220 + 50) ∥ (470 + 12) ≈ 173 Ω$，$τ ≈ 0.17 s$。
- 实验 5-4：ADC 看到 $100k ∥ 33k ≈ 24.8 kΩ$。`,
      `- Lab 2-2: $470 + 1k ∥ 2.2k = 470 + 687.5 = 1157.5 Ω$.
- Lab 3-7: the capacitor sees $(10k + 50) ∥ 10k ≈ 5.01 kΩ$ (R₃ = 0), $τ ≈ 0.50 ms$ — half the plain series RC.
- Lab 3-5, charging: $(220 + 50) ∥ (470 + 12) ≈ 173 Ω$, $τ ≈ 0.17 s$.
- Lab 5-4: the ADC sees $100k ∥ 33k ≈ 24.8 kΩ$.`,
    ),
    pitfalls: [
      tr(
        '信号发生器的 50 Ω 是电源的内阻：电源置零后它还在，串在 R₁ 里。',
        'The generator’s 50 Ω is the source’s own resistance: it stays when the source is zeroed, in series with R₁.',
      ),
      tr('电流源置零是开路，不是短路。', 'A zeroed current source is an open, not a short.'),
    ],
    Figure: () => (
      <g>
        <path d="M40 40 V110" className="cf-w accent" strokeDasharray="5 4" fill="none" />
        <T x={30} y={80} anchor="end" cls="small accent">
          0 V
        </T>
        <Path d="40,40 40,30 55,30" />
        <R x1={55} y1={30} x2={120} y2={30} label="R₁" />
        <Path d="120,30 135,30" />
        <Dot x={130} y={30} />
        <T x={130} y={18}>
          A
        </T>
        <R x1={130} y1={30} x2={130} y2={120} label="R₂" />
        <R x1={135} y1={30} x2={205} y2={30} label="R₃" />
        <Path d="205,30 220,30" />
        <Path d="40,110 40,120 220,120" />
        <Dot x={220} y={30} />
        <Dot x={220} y={120} />
        <Arrow x={238} y={75} dir="l" label="R_eq" lx={236} ly={64} />
      </g>
    ),
    lessons: ['exp-thevenin-measure', 'exp-max-power', 'exp-loaded-divider', 'exp3-rc-thevenin-tau', 'exp3-led-breathing', 'exp5-adc-battery-divider'],
    chapter: 'theorems',
  },
  {
    id: 'source-transformation',
    group: 'circuit-laws',
    title: tr('电源等效变换 Norton ⇄ Thevenin', 'Source transformation (Norton ⇄ Thevenin)'),
    tex: 'U_s = I_s R ⇔ I_s = \\frac{U_s}{R}',
    use: tr(
      '电流源并电阻 ⇄ 电压源串同一个电阻：对外完全一样。计算器给出负载上的电压。',
      'A current source with a parallel resistor ⇄ a voltage source with the same series resistor: identical from outside. The calculator gives the load voltage.',
    ),
    vars: [
      { sym: 'I_s', name: tr('诺顿电流源', 'Norton current source'), unit: 'A', def: 0.01 },
      { sym: 'R', name: tr('并联 / 串联电阻', 'parallel / series resistor'), unit: 'Ω', def: 470 },
      { sym: 'R_L', name: tr('负载', 'load'), unit: 'Ω', def: 1000 },
    ],
    out: { sym: 'U_L', name: tr('负载电压（两种接法一样）', 'load voltage (the same for both)'), unit: 'V' },
    compute: (v) => v.I_s * par(v.R, v.R_L),
    why: tr(
      `1. 诺顿网络：端口电压 U 时，R 里流 $\\frac{U}{R}$，端口电流 $I = I_s - \\frac{U}{R}$。
2. 戴维宁网络：$U = U_s - IR$，也就是 $I = \\frac{U_s}{R} - \\frac{U}{R}$。
3. 两个式子完全相同的条件：$U_s = I_s R$，电阻相同。端口的 U–I 关系一样，接什么负载结果都一样。
4. 负载电压：诺顿看是 $I_s (R ∥ R_L)$，戴维宁看是 $U_s \\frac{R_L}{R + R_L}$——同一个数。
5. 但 **内部不等效**：诺顿的 R 一直在耗电（空载时最多），戴维宁空载时一点不耗。`,
      `1. Norton: at port voltage U the resistor carries $\\frac{U}{R}$, so the port current is $I = I_s - \\frac{U}{R}$.
2. Thevenin: $U = U_s - IR$, i.e. $I = \\frac{U_s}{R} - \\frac{U}{R}$.
3. The two are the same exactly when $U_s = I_s R$ with the same R: the port’s U–I relation is identical, so any load sees the same thing.
4. Load voltage: Norton gives $I_s (R ∥ R_L)$, Thevenin $U_s \\frac{R_L}{R + R_L}$ — the same number.
5. But the **insides differ**: the Norton R always burns power (most with no load), the Thevenin R burns none with no load.`,
    ),
    example: tr(
      '实验 1-8：$U_s = 10 mA × 470 Ω = 4.7 V$。接 1 kΩ：$10 mA × (470 ∥ 1000) = 10 × 0.3197 ≈ 3.20 V$ = $4.7 × \\frac{1000}{1470}$。内部：$R_N$ 流 6.8 mA、耗 21.7 mW；$R_T$ 只流 3.2 mA、耗 4.8 mW；空载时 $R_N$ 一直耗 47 mW。',
      'Lab 1-8: $U_s = 10 mA × 470 Ω = 4.7 V$. With 1 kΩ: $10 mA × (470 ∥ 1000) = 10 × 0.3197 ≈ 3.20 V$ = $4.7 × \\frac{1000}{1470}$. Inside: $R_N$ carries 6.8 mA and burns 21.7 mW; $R_T$ only 3.2 mA and 4.8 mW; with no load $R_N$ keeps burning 47 mW.',
    ),
    pitfalls: [
      tr('电流源箭头指向的那一端 = 等效电压源的 + 端。', 'The end the current-source arrow points to is the + of the equivalent voltage source.'),
      tr(
        '理想电压源（没有串联电阻）不能变成电流源，理想电流源也不能变成电压源。',
        'An ideal voltage source (no series resistor) cannot be turned into a current source, nor an ideal current source into a voltage source.',
      ),
    ],
    Figure: () => (
      <g>
        <I x={30} y1={35} y2={115} />
        <T x={14} y={140} anchor="start">
          Iₛ
        </T>
        <Path d="30,35 30,25 75,25 75,40" />
        <R x1={75} y1={40} x2={75} y2={110} label="R" />
        <Path d="75,110 75,125 30,125 30,115" />
        <Path d="75,25 105,25" />
        <Path d="75,125 105,125" />
        <Dot x={105} y={25} />
        <Dot x={105} y={125} />
        <T x={130} y={80}>
          ⇔
        </T>
        <V x={165} y1={45} y2={105} label="" />
        <T x={150} y={140} anchor="start">
          Uₛ = IₛR
        </T>
        <Path d="165,45 165,25 180,25" />
        <R x1={180} y1={25} x2={235} y2={25} label="R" />
        <Path d="165,105 165,125 245,125" />
        <Path d="235,25 245,25" />
        <Dot x={245} y={25} />
        <Dot x={245} y={125} />
      </g>
    ),
    teardowns: ['bench-supply'],
    lessons: ['exp-source-transformation', 'exp-current-divider'],
    chapter: 'equivalence',
  },
  {
    id: 'max-power',
    group: 'circuit-laws',
    title: tr('最大功率传输 Maximum power transfer', 'Maximum power transfer'),
    tex: 'P_L = \\frac{U_{oc}^{2} R_L}{(R_{eq} + R_L)^{2}}, P_{max} = \\frac{U_{oc}^{2}}{4R_{eq}}',
    use: tr('负载从一个电源网络能拿到多少功率；什么负载拿得最多。', 'How much power a load gets from a source network, and which load gets the most.'),
    vars: [
      { sym: 'U_oc', name: tr('等效电压源', 'Thevenin voltage'), unit: 'V', def: 6.19 },
      { sym: 'R_eq', name: tr('等效电阻', 'Thevenin resistance'), unit: 'Ω', def: 1158 },
      { sym: 'R_L', name: tr('负载', 'load'), unit: 'Ω', def: 1158 },
    ],
    out: { sym: 'P_L', name: tr('负载功率', 'load power'), unit: 'W' },
    compute: (v) => (v.U_oc * v.U_oc * v.R_L) / ((v.R_eq + v.R_L) * (v.R_eq + v.R_L)),
    why: tr(
      `1. 先把网络换成戴维宁等效。负载电流 $I = \\frac{U_{oc}}{R_{eq} + R_L}$，负载功率 $P = I^{2}R_L$。
2. $R_L$ 太小：电流大但电压小；太大：电压大但电流小。中间有个最大值。
3. 对 $R_L$ 求导令它为 0：$(R_{eq} + R_L) - 2R_L = 0$，即 **$R_L = R_{eq}$**（匹配）。
4. 代回去：$P_{max} = \\frac{U_{oc}^{2}}{4R_{eq}}$。这时等效电路里 $R_{eq}$ 和负载各分一半，效率 50 %。
5. 峰很平：$R_L$ 偏离一倍，功率只少约 11 %。`,
      `1. Replace the network by its Thevenin equivalent. Load current $I = \\frac{U_{oc}}{R_{eq} + R_L}$, load power $P = I^{2}R_L$.
2. $R_L$ too small: big current, little voltage; too large: big voltage, little current. There is a maximum in between.
3. Set the derivative with respect to $R_L$ to 0: $(R_{eq} + R_L) - 2R_L = 0$, i.e. **$R_L = R_{eq}$** (matching).
4. Substitute back: $P_{max} = \\frac{U_{oc}^{2}}{4R_{eq}}$. In the equivalent circuit $R_{eq}$ and the load then take half each: 50 % efficiency.
5. The peak is flat: with $R_L$ off by a factor of two, P drops only about 11 %.`,
    ),
    example: tr(
      '实验 2-3：$P_{max} = \\frac{6.19^{2}}{4 × 1158} ≈ 8.27 mW$（电位器约 53 %）；$R_L = 550 Ω$（25 %）：7.2 mW；$R_L = 2.2 kΩ$（100 %）：7.5 mW。',
      'Lab 2-3: $P_{max} = \\frac{6.19^{2}}{4 × 1158} ≈ 8.27 mW$ (pot at about 53 %); $R_L = 550 Ω$ (25 %): 7.2 mW; $R_L = 2.2 kΩ$ (100 %): 7.5 mW.',
    ),
    pitfalls: [
      tr('匹配让负载功率最大，不是让效率最高：电力系统要的是 $R_L ≫ R_{eq}$。', 'Matching maximises the load power, not the efficiency: power systems want $R_L ≫ R_{eq}$.'),
      tr(
        '“效率 50 %”只对等效电路成立；真实的 9 V 电源送出的功率里，到负载的比例要用原电路算。',
        'The "50 %" holds for the equivalent only; the share of the real 9 V supply’s power reaching the load needs the original circuit.',
      ),
    ],
    Figure: () => <TheveninFig load variable />,
    lessons: ['exp-max-power'],
    chapter: 'theorems',
  },
  {
    id: 'wheatstone',
    group: 'circuit-laws',
    title: tr('惠斯通电桥平衡 Wheatstone bridge', 'Wheatstone bridge balance'),
    tex: '\\frac{R_1}{R_2} = \\frac{R_3}{R_4} ⇒ R_4 = \\frac{R_2 R_3}{R_1}',
    use: tr(
      '电桥中间电流为零时，四个电阻满足比例关系：用三个已知电阻求第四个。',
      'When no current flows across the middle of the bridge the four resistors are in proportion: three known ones give the fourth.',
    ),
    vars: [
      { sym: 'R_1', name: tr('左上 R₁', 'top left R₁'), unit: 'Ω', def: 1000 },
      { sym: 'R_2', name: tr('左下 R₂', 'bottom left R₂'), unit: 'Ω', def: 2200 },
      { sym: 'R_3', name: tr('右上 R₃', 'top right R₃'), unit: 'Ω', def: 1000 },
    ],
    out: { sym: 'R_4', name: tr('平衡时右下的电阻', 'bottom right at balance'), unit: 'Ω' },
    compute: (v) => (v.R_2 * v.R_3) / v.R_1,
    why: tr(
      `1. 电桥是并排的两个分压器：$U_A = U_s\\frac{R_2}{R_1 + R_2}$，$U_B = U_s\\frac{R_4}{R_3 + R_4}$。
2. 中间电流表没有电流 ⇔ A、B 等电位 ⇔ 两个分压比相等。
3. 化简：$R_2(R_3 + R_4) = R_4(R_1 + R_2)$ ⇒ $R_1R_4 = R_2R_3$。
4. 平衡条件里 **没有电源电压，也没有电流表的精度**：只要能看出“是不是零”。
5. 不平衡时：$R_4$ 偏大，B 比 A 高，电流从 B 流向 A（红表笔在 A 时读数为负）。`,
      `1. A bridge is two dividers side by side: $U_A = U_s\\frac{R_2}{R_1 + R_2}$, $U_B = U_s\\frac{R_4}{R_3 + R_4}$.
2. No current through the middle ammeter ⇔ A and B at the same potential ⇔ equal divider ratios.
3. Simplify: $R_2(R_3 + R_4) = R_4(R_1 + R_2)$ ⇒ $R_1R_4 = R_2R_3$.
4. The balance condition has **neither the supply voltage nor the ammeter’s accuracy** in it: you only need to see "zero or not".
5. Out of balance: with $R_4$ too large B sits above A and the current flows from B to A (negative with the red lead on A).`,
    ),
    example: tr(
      '实验 1-6：$R_4 = \\frac{2.2k × 1k}{1k} = 2.2 kΩ$，10 kΩ 电位器转到 22 %；这时 $U_A = U_B = 9 × \\frac{2.2}{3.2} ≈ 6.19 V$。转到 10 %（1 kΩ）：B 只有 4.5 V，电流 A → B 约 +1.42 mA；50 %（5 kΩ）：B = 7.5 V，约 −0.86 mA。',
      'Lab 1-6: $R_4 = \\frac{2.2k × 1k}{1k} = 2.2 kΩ$, the 10 kΩ pot at 22 %; then $U_A = U_B = 9 × \\frac{2.2}{3.2} ≈ 6.19 V$. At 10 % (1 kΩ) B is only 4.5 V and about +1.42 mA flows A → B; at 50 % (5 kΩ) B = 7.5 V and it reads about −0.86 mA.',
    ),
    pitfalls: [
      tr('比例写反：是“左上 : 左下 = 右上 : 右下”。', 'Ratio upside down: it is top-left : bottom-left = top-right : bottom-right.'),
      tr(
        '不平衡时 0.1 Ω 的电流表把 A、B 几乎拉到同一电压，万用表量 A–B 看不出差别——看电流表。',
        'Out of balance, the 0.1 Ω ammeter pulls A and B almost together, so a voltmeter across A–B shows nothing — watch the ammeter.',
      ),
    ],
    Figure: () => (
      <g>
        <V x={22} y1={50} y2={100} label="" />
        <Path d="22,50 22,18 130,18" />
        <Path d="22,100 22,132 130,132" />
        <R x1={130} y1={18} x2={72} y2={75} label="R₁" lx={84} ly={38} />
        <R x1={72} y1={75} x2={130} y2={132} label="R₂" lx={84} ly={120} />
        <R x1={130} y1={18} x2={188} y2={75} label="R₃" lx={176} ly={38} />
        <R x1={188} y1={75} x2={130} y2={132} label="R₄" lx={176} ly={120} />
        <Path d="72,75 119,75" />
        <Path d="141,75 188,75" />
        <Meter x={130} y={75} letter="A" />
        <Dot x={72} y={75} />
        <Dot x={188} y={75} />
        <T x={62} y={79} anchor="end">
          A
        </T>
        <T x={198} y={79} anchor="start">
          B
        </T>
      </g>
    ),
    teardowns: ['potentiometer', 'ammeter'],
    lessons: ['exp-wheatstone-bridge'],
    chapter: 'equivalence',
  },
  {
    id: 'equivalent-resistance',
    group: 'circuit-laws',
    title: tr('串并联网络的等效电阻', 'Equivalent resistance of a series-parallel network'),
    tex: 'R_{eq} = R_1 + R_2 ∥ (R_3 + R_4 ∥ R_5)',
    use: tr(
      '从离电源最远的地方往回一层层化简，得到整个网络的等效电阻，再一层层往回求电流电压。',
      'Reduce the network layer by layer from the far end back to the source, then work back out for every current and voltage.',
    ),
    vars: [
      { sym: 'R_1', name: 'R₁', unit: 'Ω', def: 1000 },
      { sym: 'R_2', name: 'R₂', unit: 'Ω', def: 2200 },
      { sym: 'R_3', name: 'R₃', unit: 'Ω', def: 1000 },
      { sym: 'R_4', name: 'R₄', unit: 'Ω', def: 3300 },
      { sym: 'R_5', name: tr('R₅（没有就填 0）', 'R₅ (0 if none)'), unit: 'Ω', def: 4700, min: 0 },
    ],
    out: { sym: 'R_eq', name: tr('等效电阻', 'equivalent resistance'), unit: 'Ω' },
    compute: (v) => {
      const p45 = v.R_5 > 0 ? par(v.R_4, v.R_5) : v.R_4;
      return v.R_1 + par(v.R_2, v.R_3 + p45);
    },
    why: tr(
      `判断规则：**串联** = 流过同一个电流（中间结点没有别的支路）；**并联** = 两端接在同一对结点上。
1. 最远处：R₄ 和 R₅ 都在 B 与 GND 之间，并联：$R_4 ∥ R_5$。
2. R₃ 和这一团流过同一个电流，串联：$R_3 + R_4 ∥ R_5$。
3. 这一支和 R₂ 都在 A 与 GND 之间，并联。
4. 再串上 R₁，得到 $R_{eq}$。
5. 往回走：$I = \\frac{U_s}{R_{eq}}$，$U_A = U_s - IR_1$，$I_2 = \\frac{U_A}{R_2}$，$I_3 = I - I_2$，$U_B = U_A - I_3R_3$……每一步都能用 KCL / KVL 核对。`,
      `The rules: **series** = the same current (no other branch at the joint); **parallel** = both ends on the same pair of nodes.
1. Far end: R₄ and R₅ both sit between B and GND, in parallel: $R_4 ∥ R_5$.
2. R₃ carries the same current as that pair, in series: $R_3 + R_4 ∥ R_5$.
3. That branch and R₂ both sit between A and GND, in parallel.
4. Add R₁ in series: $R_{eq}$.
5. Work back out: $I = \\frac{U_s}{R_{eq}}$, $U_A = U_s - IR_1$, $I_2 = \\frac{U_A}{R_2}$, $I_3 = I - I_2$, $U_B = U_A - I_3R_3$… each step can be checked with KCL / KVL.`,
    ),
    example: tr(
      '实验 1-7：$3.3 ∥ 4.7 ≈ 1.939 k$，$+ 1 = 2.939 k$，$∥ 2.2 ≈ 1.258 k$，$+ 1 ≈ 2.258 kΩ$；$I = \\frac{9}{2.258} ≈ 3.99 mA$，$U_A ≈ 5.01 V$，$U_B ≈ 3.31 V$。挑战 7（R₅ 填 0）：$1k + 2k ∥ (1k + 1k) = 2 kΩ$，M 点 4.5 V，X 点 2.25 V。',
      'Lab 1-7: $3.3 ∥ 4.7 ≈ 1.939 k$, $+ 1 = 2.939 k$, $∥ 2.2 ≈ 1.258 k$, $+ 1 ≈ 2.258 kΩ$; $I = \\frac{9}{2.258} ≈ 3.99 mA$, $U_A ≈ 5.01 V$, $U_B ≈ 3.31 V$. Challenge 7 (R₅ = 0): $1k + 2k ∥ (1k + 1k) = 2 kΩ$, M at 4.5 V, X at 2.25 V.',
    ),
    pitfalls: [
      tr('并联看的是“两端是不是同一对结点”，不是画出来是不是平行。', 'Parallel means "both ends on the same pair of nodes", not "drawn side by side".'),
      tr(
        '真实电流表串在电路里会多出几欧，U/I 法测出的 $R_eq$ 偏大这么多。',
        'A real ammeter in series adds a few ohms, so a U/I measurement of $R_eq$ comes out high by that much.',
      ),
    ],
    Figure: () => (
      <g>
        <R x1={15} y1={30} x2={80} y2={30} label="R₁" />
        <Path d="80,30 150,30" />
        <Dot x={95} y={30} />
        <T x={95} y={18}>
          A
        </T>
        <R x1={95} y1={30} x2={95} y2={125} label="R₂" />
        <R x1={120} y1={30} x2={180} y2={30} label="R₃" />
        <Path d="180,30 240,30" />
        <Dot x={190} y={30} />
        <T x={190} y={18}>
          B
        </T>
        <R x1={190} y1={30} x2={190} y2={125} label="R₄" />
        <Path d="240,30 240,40" />
        <R x1={240} y1={40} x2={240} y2={125} label="R₅" lx={218} />
        <Path d="95,125 240,125" />
        <Gnd x={160} y={125} />
        <Dot x={15} y={30} />
        <Arrow x={30} y={60} dir="r" label="R_eq" ly={78} />
      </g>
    ),
    lessons: ['exp-measure-req', 'challenge-series-parallel'],
    chapter: 'equivalence',
  },
  {
    id: 'current-divider-g',
    group: 'circuit-laws',
    title: tr('分流（三条支路，用电导）', 'Current divider with three branches (conductances)'),
    tex: 'I_k = I \\frac{G_k}{G_1 + G_2 + G_3}, G = \\frac{1}{R}',
    use: tr('一个电流分给三条（或更多）并联支路，每条分到多少。', 'A current shared by three (or more) parallel branches: how much each gets.'),
    vars: [
      { sym: 'I', name: tr('总电流', 'total current'), unit: 'A', def: 0.01 },
      { sym: 'R_1', name: tr('要求的那条支路 R₁', 'the branch you want, R₁'), unit: 'Ω', def: 1000 },
      { sym: 'R_2', name: 'R₂', unit: 'Ω', def: 3300 },
      { sym: 'R_3', name: tr('R₃（没有就填 0）', 'R₃ (0 if none)'), unit: 'Ω', def: 2200, min: 0 },
    ],
    out: { sym: 'I_1', name: tr('R₁ 支路的电流', 'current in R₁'), unit: 'A' },
    compute: (v) => {
      const g = 1 / v.R_1 + 1 / v.R_2 + (v.R_3 > 0 ? 1 / v.R_3 : 0);
      return (v.I * (1 / v.R_1)) / g;
    },
    why: tr(
      `1. 并联支路两端是同一个电压：$U = \\frac{I}{G_1 + G_2 + G_3}$（并联时电导相加）。
2. 每条支路：$I_k = G_k U$。
3. 合起来：$I_k = I\\frac{G_k}{ΣG}$——电导越大（电阻越小）分得越多。
4. 只有两条时就是熟悉的 $I_1 = I\\frac{R_2}{R_1 + R_2}$。
总电流由电流源定死时，加一条支路只改变分配和电压；如果是电压源，总电流会变大。`,
      `1. Parallel branches share one voltage: $U = \\frac{I}{G_1 + G_2 + G_3}$ (conductances in parallel add).
2. Each branch: $I_k = G_k U$.
3. Together: $I_k = I\\frac{G_k}{ΣG}$ — the larger the conductance (the smaller the resistance), the bigger the share.
4. With two branches this is the familiar $I_1 = I\\frac{R_2}{R_1 + R_2}$.
With the total fixed by a current source, an extra branch only changes the shares and the voltage; with a voltage source the total would grow.`,
    ),
    example: tr(
      '实验 1-5（按键按下）：$G = 1 + 0.303 + 0.455 = 1.758 mS$，$I_1 = 10 × \\frac{1}{1.758} ≈ 5.69 mA$，$I_2 ≈ 1.72 mA$，$I_3 ≈ 2.58 mA$，N 点 $\\frac{10}{1.758} ≈ 5.69 V$。松开（R₃ 填 0）：$I_1 ≈ 7.67 mA$。',
      'Lab 1-5 (button held): $G = 1 + 0.303 + 0.455 = 1.758 mS$, $I_1 = 10 × \\frac{1}{1.758} ≈ 5.69 mA$, $I_2 ≈ 1.72 mA$, $I_3 ≈ 2.58 mA$, N at $\\frac{10}{1.758} ≈ 5.69 V$. Released (R₃ = 0): $I_1 ≈ 7.67 mA$.',
    ),
    pitfalls: [
      tr(
        '电流表并在 N 和地之间 = 用 0.1 Ω 把电路短路：所有电流都走电流表。',
        'An ammeter across N and ground shorts the circuit with 0.1 Ω: all the current goes through the meter.',
      ),
    ],
    Figure: () => (
      <g>
        <I x={30} y1={40} y2={110} />
        <T x={12} y={80} anchor="start">
          I
        </T>
        <Path d="30,40 30,25 230,25 230,40" />
        <Path d="30,110 30,125 230,125 230,110" />
        <R x1={100} y1={25} x2={100} y2={125} label="R₁" />
        <R x1={165} y1={25} x2={165} y2={125} label="R₂" />
        <R x1={230} y1={40} x2={230} y2={110} label="R₃" lx={208} />
        <Dot x={100} y={25} />
        <Dot x={165} y={25} />
        <Dot x={100} y={125} />
        <Dot x={165} y={125} />
        <Arrow x={88} y={60} dir="d" label="I₁" lx={70} />
      </g>
    ),
    lessons: ['exp-current-divider'],
    chapter: 'equivalence',
  },
];
