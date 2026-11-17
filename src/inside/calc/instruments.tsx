// Calculation cards: sources and instruments (battery internal resistance, meter loading, the
// bench supply’s CV / CC, the generator’s 50 Ω, amplitude / Vpp / RMS, period and phase) —
// lessons 8–13 and every lab that reads an instrument.

import { tr } from '../../core/i18n';
import type { CalcCard, CalcGroup } from '../types';
import { D, Dot, Gnd, I, Path, R, T, V, VArrow } from './fig';
import { Arrow, Box, Meter } from './figx';

export const group = (): CalcGroup => ({
  id: 'instruments',
  title: tr('电源与仪器 Sources and instruments', 'Sources and instruments'),
  intro: tr(
    '电池的内阻、电压表和电流表的影响、稳压电源的 CV / CC、信号发生器的 50 Ω、示波器上的 Vpp、有效值、周期和相位——第 8–13 课。',
    'A battery’s internal resistance, what voltmeters and ammeters do to a circuit, the bench supply’s CV / CC, the generator’s 50 Ω, and reading Vpp, RMS, period and phase off a scope — lessons 8–13.',
  ),
});

/** points of a sine wave for a polyline: centre y0, amplitude a, from x0 to x1, period p, delay d */
const sine = (x0: number, x1: number, y0: number, a: number, p: number, d = 0) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 2) pts.push(`${x},${(y0 - a * Math.sin((2 * Math.PI * (x - x0 - d)) / p)).toFixed(1)}`);
  return pts.join(' ');
};

export const cards = (): CalcCard[] => [
  {
    id: 'battery-terminal-voltage',
    group: 'instruments',
    title: tr('电池的端电压 U = E − Ir', 'Battery terminal voltage U = E − Ir'),
    tex: 'U = E - I r',
    use: tr(
      '电池 = 电动势 E 串内阻 r：取的电流越大，端电压掉得越多。',
      'A battery = an EMF E in series with an internal resistance r: the more current you draw, the lower the terminal voltage.',
    ),
    vars: [
      { sym: 'E', name: tr('电动势（空载电压）', 'EMF (open-circuit voltage)'), unit: 'V', def: 3 },
      { sym: 'r', name: tr('内阻（9 V 电池 1.5 Ω、AA 0.15 Ω、CR2032 15 Ω）', 'internal resistance (9 V 1.5 Ω, AA 0.15 Ω, CR2032 15 Ω)'), unit: 'Ω', def: 15, min: 0 },
      { sym: 'I', name: tr('负载电流', 'load current'), unit: 'A', def: 0.016 },
    ],
    out: { sym: 'U', name: tr('端电压', 'terminal voltage'), unit: 'V' },
    compute: (v) => v.E - v.I * v.r,
    why: tr(
      `1. 化学反应在电池里维持一个电动势 E；电流从电池内部流过时要经过电解液和电极，这部分电阻就是内阻 r。
2. 等效电路：E 串 r，KVL：$U = E - Ir$。
3. 接电阻负载 R 时先求电流：$I = \\frac{E}{R + r}$，再代回去。
4. 反过来测内阻：空载读 E，带载读 U 和 I，$r = \\frac{E - U}{I}$。
5. 短路电流 $\\frac{E}{r}$：9 V 电池约 6 A——会发烫，别短路。`,
      `1. Chemistry keeps an EMF E inside the battery; current flowing through the electrolyte and electrodes meets a resistance, the internal resistance r.
2. The model is E in series with r, and KVL gives $U = E - Ir$.
3. With a resistive load R find the current first: $I = \\frac{E}{R + r}$, then substitute.
4. To measure r: read E with no load, then U and I with a load: $r = \\frac{E - U}{I}$.
5. The short-circuit current is $\\frac{E}{r}$: about 6 A for a 9 V battery — it gets hot; don’t short it.`,
    ),
    example: tr(
      '挑战 9：CR2032（3 V、15 Ω）点一个红 LED，约 16 mA：$U = 3 - 0.016 × 15 ≈ 2.76 V$。第 9 课：9 V 电池只给 2.8 mA，$U = 9 - 0.0028 × 1.5 ≈ 8.996 V$，几乎看不出。',
      'Challenge 9: a CR2032 (3 V, 15 Ω) lighting a red LED at about 16 mA: $U = 3 - 0.016 × 15 ≈ 2.76 V$. Lesson 9: the 9 V battery gives only 2.8 mA, $U = 9 - 0.0028 × 1.5 ≈ 8.996 V$ — hardly visible.',
    ),
    pitfalls: [
      tr(
        '空载时万用表读到的是 E，它说明不了电池还能给多大电流——要带载测。',
        'With no load a meter reads E, which says nothing about how much current the battery can still give — test it under load.',
      ),
      tr(
        '内阻会随电量下降而变大：旧电池空载电压正常，一带载就掉。',
        'The internal resistance grows as the battery runs down: an old battery reads fine open-circuit and sags under load.',
      ),
    ],
    Figure: () => (
      <g>
        <Box x={14} y={14} w={118} h={122} dashed />
        <V x={45} y1={45} y2={105} label="E" />
        <Path d="45,45 45,30 60,30" />
        <R x1={60} y1={30} x2={120} y2={30} label="r" />
        <Path d="120,30 200,30 200,45" />
        <Path d="45,105 45,120 200,120 200,105" />
        <R x1={200} y1={45} x2={200} y2={105} label="R" />
        <Dot x={145} y={30} />
        <Dot x={145} y={120} />
        <VArrow x={155} y1={115} y2={38} label="U" />
        <Arrow x={175} y={30} label="I" ly={22} />
      </g>
    ),
    teardowns: ['battery'],
    lessons: ['lesson-power-supplies', 'challenge-coin-cell', 'lesson-multimeter', 'lesson-power-and-ground'],
    chapter: 'equivalence',
  },
  {
    id: 'voltmeter-loading',
    group: 'instruments',
    title: tr('电压表的负载效应 Voltmeter loading', 'Voltmeter loading'),
    tex: 'U_{read} = U_{th} \\frac{R_V}{R_{th} + R_V}, R_{th} = R_1 ∥ R_2',
    use: tr(
      '真实万用表约 10 MΩ：测高阻分压器时，表本身并在下电阻上，读数偏低。',
      'A real multimeter is about 10 MΩ: on a high-resistance divider it sits in parallel with the lower resistor and reads low.',
    ),
    vars: [
      { sym: 'U_s', name: tr('分压器电源', 'divider supply'), unit: 'V', def: 9 },
      { sym: 'R_1', name: tr('上电阻 R₁', 'top resistor R₁'), unit: 'Ω', def: 1e6 },
      { sym: 'R_2', name: tr('下电阻 R₂（表测它两端）', 'bottom resistor R₂ (the meter is across it)'), unit: 'Ω', def: 1e6 },
      { sym: 'R_V', name: tr('电压表内阻（数字万用表 ≈ 10 MΩ）', 'meter resistance (DMM ≈ 10 MΩ)'), unit: 'Ω', def: 1e7 },
    ],
    out: { sym: 'U_read', name: tr('表的读数', 'meter reading'), unit: 'V' },
    compute: (v) => {
      const uth = (v.U_s * v.R_2) / (v.R_1 + v.R_2);
      const rth = (v.R_1 * v.R_2) / (v.R_1 + v.R_2);
      return (uth * v.R_V) / (rth + v.R_V);
    },
    why: tr(
      `1. 电压表不是“只看不碰”：它是一个大电阻 $R_V$，接上去就和被测元件并联。
2. 从表笔看进去，分压器是一个戴维宁源：$U_{th} = U_s\\frac{R_2}{R_1 + R_2}$，$R_{th} = R_1 ∥ R_2$。
3. 表和 $R_{th}$ 再分一次压：$U_{read} = U_{th}\\frac{R_V}{R_{th} + R_V}$。
4. 相对误差约 $\\frac{R_{th}}{R_V}$：只要 $R_{th}$ 比表的内阻小 1000 倍，误差就在 0.1 % 以内。
模拟器里的万用表是理想的（不取电流）；示波器探头 ×1 档约 1 MΩ，影响更大。`,
      `1. A voltmeter does not "just look": it is a large resistance $R_V$ placed in parallel with what you measure.
2. Seen from the probes the divider is a Thevenin source: $U_{th} = U_s\\frac{R_2}{R_1 + R_2}$, $R_{th} = R_1 ∥ R_2$.
3. The meter and $R_{th}$ divide once more: $U_{read} = U_{th}\\frac{R_V}{R_{th} + R_V}$.
4. The relative error is about $\\frac{R_{th}}{R_V}$: keep $R_{th}$ 1000 times below the meter’s resistance and the error stays under 0.1 %.
The simulator’s multimeter is ideal (it draws nothing); a ×1 scope probe is about 1 MΩ and loads far more.`,
    ),
    example: tr(
      '1 MΩ + 1 MΩ 分 9 V：应为 4.5 V，10 MΩ 的表读 $4.5 × \\frac{10}{10.5} ≈ 4.29 V$（低 4.8 %）。第 9 课的 1 k / 2.2 k：$R_{th} ≈ 688 Ω$，误差只有 0.007 %，看不出。',
      'A 1 MΩ + 1 MΩ divider on 9 V should give 4.5 V; a 10 MΩ meter reads $4.5 × \\frac{10}{10.5} ≈ 4.29 V$ (4.8 % low). Lesson 9’s 1 k / 2.2 k: $R_{th} ≈ 688 Ω$, an error of only 0.007 % — invisible.',
    ),
    pitfalls: [tr('误差看的是戴维宁电阻 R₁ ∥ R₂，不是 R₂ 一个。', 'The error depends on the Thevenin resistance R₁ ∥ R₂, not on R₂ alone.')],
    Figure: () => (
      <g>
        <V x={40} y1={40} y2={110} label="Uₛ" />
        <Path d="40,40 40,20 130,20 130,28" />
        <R x1={130} y1={28} x2={130} y2={72} label="R₁" />
        <R x1={130} y1={78} x2={130} y2={122} label="R₂" />
        <Path d="130,72 130,78" />
        <Path d="40,110 40,130 210,130" />
        <Path d="130,122 130,130" />
        <Path d="130,75 210,75 210,92" />
        <Meter x={210} y={103} letter="V" />
        <Path d="210,114 210,130" />
        <Dot x={130} y={75} />
        <Dot x={130} y={130} />
        <T x={228} y={107} anchor="start" cls="small">
          R_V
        </T>
      </g>
    ),
    teardowns: ['multimeter'],
    lessons: ['lesson-multimeter', 'exp-loaded-divider'],
    chapter: 'equivalence',
  },
  {
    id: 'ammeter-burden',
    group: 'instruments',
    title: tr('电流表的内阻（负担电压）Ammeter burden', 'Ammeter burden'),
    tex: tr('误差 = \\frac{R_A}{R + R_A}, $U_A$ = I $R_A$', 'error = \\frac{R_A}{R + R_A}, $U_A$ = I $R_A$'),
    use: tr('电流表串进回路会多出 R_A：电流变小多少？表上压降多大？', 'An ammeter in series adds R_A to the loop: how much lower is the current, and what does the meter drop?'),
    vars: [
      { sym: 'R', name: tr('回路里其余的电阻（含 LED、电源内阻）', 'the rest of the loop resistance (LED, source included)'), unit: 'Ω', def: 1012 },
      {
        sym: 'R_A',
        name: tr('电流表内阻（模拟 0.1 Ω，真实 mA 档几欧到十几欧）', 'meter resistance (simulated 0.1 Ω, a real mA range a few to 15 Ω)'),
        unit: 'Ω',
        def: 0.1,
        min: 0,
      },
    ],
    out: { sym: 'err', name: tr('电流读数偏小', 'how much low the current reads'), unit: '%' },
    compute: (v) => (v.R_A / (v.R + v.R_A)) * 100,
    why: tr(
      `1. 电流表要 **串联**：电流必须从它里面流过。它里面是一个很小的分流电阻 $R_A$（加上保险丝）。
2. 回路电阻从 R 变成 $R + R_A$，电流从 $\\frac{U}{R}$ 变成 $\\frac{U}{R + R_A}$。
3. 相对误差：$1 - \\frac{R}{R + R_A} = \\frac{R_A}{R + R_A}$。
4. 表两端的压降（负担电压）$U_A = IR_A$；反过来 $R_A = \\frac{U_A}{I}$——第 10 课就这样量内阻。
5. 电流表 **并联** 到元件上 = 用 $R_A$ 把它短路。`,
      `1. An ammeter goes **in series**: the current has to flow through it. Inside is a tiny shunt $R_A$ (plus a fuse).
2. The loop resistance goes from R to $R + R_A$, the current from $\\frac{U}{R}$ to $\\frac{U}{R + R_A}$.
3. Relative error: $1 - \\frac{R}{R + R_A} = \\frac{R_A}{R + R_A}$.
4. The drop across the meter (its burden voltage) is $U_A = IR_A$; turned round, $R_A = \\frac{U_A}{I}$ — how lesson 10 measures it.
5. An ammeter **across** a part shorts it through $R_A$.`,
    ),
    example: tr(
      '第 10 课：回路 1012 Ω，0.1 Ω 的表让电流小 0.01 %，表上压降 $0.1 × 7.1 mA ≈ 0.71 mV$。换成 10 Ω 的真实 mA 档：小约 1 %。实验 2-2 的短路电流：$\\frac{10}{1158 + 10} ≈ 0.86 %$，$R_eq$ 偏大这么多。',
      'Lesson 10: a 1012 Ω loop, the 0.1 Ω meter lowers the current by 0.01 % and drops $0.1 × 7.1 mA ≈ 0.71 mV$. A real 10 Ω mA range: about 1 % low. Lab 2-2’s short-circuit current: $\\frac{10}{1158 + 10} ≈ 0.86 %$, and $R_eq$ comes out that much high.',
    ),
    pitfalls: [
      tr('把电流表并在电源两端：真实表会烧保险丝。', 'An ammeter straight across a supply: a real meter blows its fuse.'),
      tr(
        '低电压、低电阻的回路里负担电压最要命（几百 mV 就能让 LED 电流明显变小）。',
        'Burden matters most in low-voltage, low-resistance loops (a few hundred mV visibly lowers an LED’s current).',
      ),
    ],
    Figure: () => (
      <g>
        <V x={40} y1={45} y2={105} label="U" />
        <Path d="40,45 40,25 104,25" />
        <Meter x={115} y={25} letter="A" />
        <T x={115} y={52} cls="small">
          R_A
        </T>
        <Path d="126,25 210,25 210,45" />
        <R x1={210} y1={45} x2={210} y2={105} label="R" />
        <Path d="210,105 210,125 40,125 40,105" />
        <Arrow x={170} y={25} label="I" ly={17} />
      </g>
    ),
    teardowns: ['ammeter'],
    lessons: ['lesson-ammeter', 'exp-kcl-ammeters', 'exp-thevenin-measure', 'exp-measure-req', 'exp-current-divider'],
    chapter: 'basics',
  },
  {
    id: 'cc-current-source',
    group: 'instruments',
    title: tr('稳压电源的 CV / CC：当电流源用', 'Bench supply CV / CC: a current source'),
    tex: 'I_{want} = \\frac{U_{set} - U_F}{R} > I_{lim} ⇒ U = U_F + I_{lim} R',
    use: tr('判断稳压电源工作在 CV 还是 CC，并算出它实际输出的电压。', 'Decide whether a bench supply runs in CV or CC, and work out the voltage it really gives.'),
    vars: [
      { sym: 'U_set', name: tr('电压设定', 'voltage setting'), unit: 'V', def: 12 },
      { sym: 'I_lim', name: tr('限流设定', 'current limit'), unit: 'A', def: 0.01 },
      { sym: 'R', name: tr('负载电阻（含 LED 内阻）', 'load resistance (LED resistance included)'), unit: 'Ω', def: 482 },
      { sym: 'U_F', name: tr('负载里 LED 的 U_F（没有就填 0）', 'U_F of LEDs in the load (0 if none)'), unit: 'V', def: 1.8, min: 0 },
    ],
    out: { sym: 'U', name: tr('电源实际输出电压', 'actual output voltage'), unit: 'V' },
    compute: (v) => {
      const want = Math.max(0, (v.U_set - v.U_F) / v.R);
      return want > v.I_lim ? v.U_F + v.I_lim * v.R : v.U_set;
    },
    why: tr(
      `1. 稳压电源有两个“上限”：电压不超过 $U_{set}$，电流不超过 $I_{lim}$。哪个先碰到，哪个说了算。
2. 先假设 CV：输出 $U_{set}$，负载想要的电流 $I_{want} = \\frac{U_{set} - U_F}{R}$。
3. $I_{want} ≤ I_{lim}$：确实是 CV，电压 = 设定，电流由负载决定。
4. $I_{want} > I_{lim}$：切到 CC，电流 = $I_{lim}$，电压降到刚好推动这个电流：$U = U_F + I_{lim}R$。
5. 当电流源用：限流设成想要的电流，电压设高一些（留余量）。它能带的最大负载是 $R_{max} = \\frac{U_{set} - U_F}{I_{lim}}$，超过就退回 CV。`,
      `1. A bench supply has two ceilings: voltage at most $U_{set}$, current at most $I_{lim}$. Whichever is hit first is in charge.
2. Assume CV first: it outputs $U_{set}$ and the load wants $I_{want} = \\frac{U_{set} - U_F}{R}$.
3. $I_{want} ≤ I_{lim}$: CV it is — the voltage is the setting and the load sets the current.
4. $I_{want} > I_{lim}$: it switches to CC, the current is $I_{lim}$ and the voltage drops to just what pushes it: $U = U_F + I_{lim}R$.
5. As a current source: set the limit to the current you want and the voltage higher (headroom). The largest load it can drive is $R_{max} = \\frac{U_{set} - U_F}{I_{lim}}$; above that it falls back to CV.`,
    ),
    example: tr(
      `- 第 11 课：12 V、10 mA、470 Ω：想要 25.5 mA > 10 mA → CC，$U = 10 mA × 470 = 4.70 V$；限流 20 mA → 9.4 V；100 mA → CV，12 V、25.5 mA。
- 实验 1-4：$1.8 + 10 mA × (470 + 12) ≈ 6.6 V$（CC）；RV1 = 1 kΩ 时需要 16.6 V > 12 V → CV，$I = \\frac{12 - 1.8}{1482} ≈ 6.9 mA$。
- 挑战 10 电阻被短路：$6 V + 50 mA × 24 Ω = 7.2 V$，电源限住 50 mA。`,
      `- Lesson 11: 12 V, 10 mA, 470 Ω: it wants 25.5 mA > 10 mA → CC, $U = 10 mA × 470 = 4.70 V$; a 20 mA limit → 9.4 V; 100 mA → CV, 12 V and 25.5 mA.
- Lab 1-4: $1.8 + 10 mA × (470 + 12) ≈ 6.6 V$ (CC); with RV1 = 1 kΩ it would need 16.6 V > 12 V → CV, $I = \\frac{12 - 1.8}{1482} ≈ 6.9 mA$.
- Challenge 10 with the resistor shorted: $6 V + 50 mA × 24 Ω = 7.2 V$, the supply holds 50 mA.`,
    ),
    pitfalls: [
      tr('屏幕上小字 “SET …” 是旋钮设定，大字才是实际输出——CC 时两者不一样。', 'The small "SET …" line shows the knobs; the big digits are the actual output — in CC they differ.'),
      tr(
        '电流源也有“顶”：负载太大时它给不出设定的电流（实验 1-4 的 100 %）。',
        'A current source has a ceiling too: with too large a load it cannot deliver the set current (lab 1-4 at 100 %).',
      ),
    ],
    Figure: () => (
      <g>
        <I x={45} y1={40} y2={110} label="" />
        <T x={45} y={142}>
          I_lim (CC)
        </T>
        <Path d="45,40 45,25 200,25 200,30" />
        <R x1={200} y1={30} x2={200} y2={75} label="R" />
        <D x1={200} y1={75} x2={200} y2={115} led />
        <Path d="200,115 200,125 45,125 45,110" />
        <VArrow x={110} y1={120} y2={32} label="U" />
        <T x={230} y={100} anchor="start" cls="small">
          U_F
        </T>
      </g>
    ),
    teardowns: ['bench-supply'],
    lessons: [
      'lesson-bench-supply',
      'lesson-power-supplies',
      'exp-cc-current-source',
      'challenge-bench-supply',
      'exp-current-divider',
      'exp-source-transformation',
      'exp-nodal-analysis',
    ],
    chapter: 'basics',
  },
  {
    id: 'generator-output',
    group: 'instruments',
    title: tr('信号发生器的 50 Ω 输出电阻', 'Generator 50 Ω output divider'),
    tex: 'U_{out} = U_{set} \\frac{R_L}{50 Ω + R_L}',
    use: tr(
      '信号发生器 = 理想波形源串 50 Ω：接上负载以后输出比设定小多少。',
      'A generator = an ideal waveform source behind 50 Ω: how much lower than the setting the output is once loaded.',
    ),
    vars: [
      { sym: 'U_set', name: tr('设定的幅度（或偏置）', 'set amplitude (or offset)'), unit: 'V', def: 1 },
      { sym: 'R_o', name: tr('输出电阻', 'output resistance'), unit: 'Ω', def: 50 },
      { sym: 'R_L', name: tr('负载（电路的输入电阻）', 'load (the circuit’s input resistance)'), unit: 'Ω', def: 50 },
    ],
    out: { sym: 'U_out', name: tr('端口上的实际值', 'actual value at the terminals'), unit: 'V' },
    compute: (v) => (v.U_set * v.R_L) / (v.R_o + v.R_L),
    why: tr(
      `1. 发生器内部 = 一个理想波形源 + 串联的 50 Ω（$R_o$）。空载时端口电压就是设定值。
2. 接负载 $R_L$：$R_o$ 和 $R_L$ 分压，$U_{out} = U_{set}\\frac{R_L}{R_o + R_L}$。交流部分和直流偏置都被同一个比例缩小。
3. $R_L ≫ 50 Ω$（几 kΩ 以上）时差别不到 1 %；50 Ω 负载正好减半。
4. 负载是 RC、RL 时用阻抗的模：$|U_{out}| = U_{set}\\frac{|Z|}{|Z + R_o|}$，而且随频率变——所以滤波实验用端口电压（CH1）做参考。
5. 时间常数里要把 50 Ω 算进 R：$τ = (R + 50)C$。`,
      `1. Inside: an ideal waveform source + 50 Ω in series ($R_o$). With no load the terminals show the setting.
2. With a load $R_L$, $R_o$ and $R_L$ divide: $U_{out} = U_{set}\\frac{R_L}{R_o + R_L}$. The AC part and the DC offset shrink by the same ratio.
3. For $R_L ≫ 50 Ω$ (a few kΩ and up) the difference is under 1 %; a 50 Ω load halves it.
4. With an RC or RL load use impedance magnitudes, $|U_{out}| = U_{set}\\frac{|Z|}{|Z + R_o|}$, which changes with frequency — that is why filter labs use the terminal voltage (CH1) as the reference.
5. In a time constant the 50 Ω belongs in R: $τ = (R + 50)C$.`,
    ),
    example: tr(
      `- 第 12 课：设 1 V，50 Ω 负载：0.5 V 幅度 = 1.0 Vpp；偏置 +1 V 也变成 0.5 V。
- 实验 2-7：反相放大器输入电阻 10 kΩ：$1 × \\frac{10000}{10050} ≈ 0.995$，输出 2.19 Vpp 而不是 2.2。
- 实验 4-3：$|Z| = 142.5 Ω$，$|Z + 50| = |151 + j100.5| ≈ 181 Ω$：端口只有 $\\frac{142.5}{181} ≈ 0.786 V$ 峰值（1.57 Vpp）。`,
      `- Lesson 12: 1 V set into 50 Ω: 0.5 V amplitude = 1.0 Vpp; a +1 V offset also becomes 0.5 V.
- Lab 2-7: the inverting amplifier’s 10 kΩ input: $1 × \\frac{10000}{10050} ≈ 0.995$, so 2.19 Vpp out instead of 2.2.
- Lab 4-3: $|Z| = 142.5 Ω$, $|Z + 50| = |151 + j100.5| ≈ 181 Ω$: the terminals get only $\\frac{142.5}{181} ≈ 0.786 V$ peak (1.57 Vpp).`,
    ),
    pitfalls: [
      tr(
        '很多真实发生器按“接 50 Ω 负载”显示幅度：接高阻电路实际是显示值的两倍（除非设成 High-Z）。',
        'Many real generators display the amplitude assuming a 50 Ω load: into a high-impedance circuit you get twice that (unless set to High-Z).',
      ),
      tr('算 τ、谐振电流、RLC 阻尼时忘了这 50 Ω。', 'Forgetting the 50 Ω in τ, in resonance currents and in RLC damping.'),
    ],
    Figure: () => (
      <g>
        <Box x={14} y={14} w={130} h={122} dashed />
        <circle cx={45} cy={75} r={14} className="cf-w" fill="none" />
        <path d={`M35 75 q5 -10 10 0 q5 10 10 0`} className="cf-w" fill="none" />
        <Path d="45,61 45,30 60,30" />
        <R x1={60} y1={30} x2={130} y2={30} label="50 Ω" />
        <Path d="45,89 45,120 228,120" />
        <Path d="130,30 228,30 228,45" />
        <R x1={228} y1={45} x2={228} y2={105} label="R_L" lx={237} />
        <Path d="228,105 228,120" />
        <Dot x={155} y={30} />
        <Dot x={155} y={120} />
        <VArrow x={165} y1={115} y2={38} label="U_out" />
        <Gnd x={100} y={124} />
      </g>
    ),
    teardowns: ['function-generator'],
    lessons: [
      'lesson-generator-scope',
      'lesson-scope-two-channels',
      'exp-inverting-amp',
      'exp-summing-amp',
      'exp3-rc-square-charging',
      'exp4-rc-lowpass-bode',
      'exp4-rl-phasors',
      'exp4-series-resonance',
    ],
    chapter: 'equivalence',
  },
  {
    id: 'vpp-amplitude',
    group: 'instruments',
    title: tr('幅度、峰峰值与偏置 Amplitude and Vpp', 'Amplitude, peak-to-peak and offset'),
    tex: 'V_{pp} = 2A, U_{max} = U_{off} + A, U_{min} = U_{off} - A',
    use: tr(
      '信号发生器设的是幅度（峰值）和偏置，示波器读的是 Vpp、最大值、最小值：互相换算。',
      'The generator takes an amplitude (peak) and an offset, the scope reads Vpp, maximum and minimum: convert between them.',
    ),
    vars: [{ sym: 'A', name: tr('幅度（中心线到波峰）', 'amplitude (centre line to crest)'), unit: 'V', def: 2.5 }],
    out: { sym: 'V_pp', name: tr('峰峰值', 'peak-to-peak'), unit: 'V' },
    compute: (v) => 2 * v.A,
    why: tr(
      `1. **幅度**（峰值）A：从中心线量到波峰。**峰峰值** Vpp：从波谷量到波峰，所以 $V_{pp} = 2A$。
2. **偏置** $U_{off}$：把整个波形上下平移，就是它的平均值（直流分量）。
3. 最大值 $U_{off} + A$，最小值 $U_{off} - A$。
4. 要一个 0 ↔ 5 V 的方波：$A = \\frac{5 - 0}{2} = 2.5 V$，$U_{off} = \\frac{5 + 0}{2} = 2.5 V$。
5. 在屏幕上数格：峰到谷的格数 × V/div = Vpp。`,
      `1. **Amplitude** (peak) A: from the centre line to a crest. **Peak-to-peak** Vpp: from trough to crest, so $V_{pp} = 2A$.
2. **Offset** $U_{off}$ shifts the whole waveform up or down; it is the average (the DC part).
3. Maximum $U_{off} + A$, minimum $U_{off} - A$.
4. For a 0 ↔ 5 V square wave: $A = \\frac{5 - 0}{2} = 2.5 V$, $U_{off} = \\frac{5 + 0}{2} = 2.5 V$.
5. On the screen: divisions from trough to crest × V/div = Vpp.`,
    ),
    example: tr(
      '实验 3-1：0–5 V 方波 = 幅度 2.5 V + 偏置 2.5 V，Vpp = 5 V。实验 3-5：0 ↔ 9 V = 幅度 4.5 V + 偏置 4.5 V。实验 2-7：幅度 0.5 V → 1 Vpp 输入，×2.2 → 2.2 Vpp 输出。',
      'Lab 3-1: a 0–5 V square = 2.5 V amplitude + 2.5 V offset, Vpp = 5 V. Lab 3-5: 0 ↔ 9 V = 4.5 V amplitude + 4.5 V offset. Lab 2-7: 0.5 V amplitude → 1 Vpp in, × 2.2 → 2.2 Vpp out.',
    ),
    pitfalls: [tr('把发生器的“幅度”当成 Vpp 设：信号大了一倍。', 'Typing the Vpp into the generator’s "amplitude": the signal comes out twice as big.')],
    Figure: () => (
      <g>
        <path d="M15 75 H250" className="cf-w thin" strokeDasharray="4 3" />
        <polyline points={sine(20, 240, 75, 45, 110)} className="cf-w" fill="none" />
        <path d="M47 30 H95 M75 120 H125" className="cf-w thin" strokeDasharray="2 3" />
        <VArrow x={47} y1={75} y2={32} label="A" />
        <path d="M235 120 V30 M231 36 L235 30 L239 36 M231 114 L235 120 L239 114" className="cf-w accent" fill="none" />
        <T x={230} y={80} anchor="end" cls="accent">
          V_pp
        </T>
      </g>
    ),
    teardowns: ['function-generator', 'oscilloscope'],
    lessons: ['lesson-generator-scope', 'exp3-rc-square-charging', 'exp3-led-breathing', 'exp3-rlc-ringing', 'exp-inverting-amp', 'exp4-buffered-bandpass'],
    chapter: 'phasors',
  },
  {
    id: 'rms-sine',
    group: 'instruments',
    title: tr('正弦波的有效值 RMS of a sine', 'RMS of a sine'),
    tex: 'U_{rms} = \\frac{U_p}{\\sqrt{2}} ≈ 0.707 U_p',
    use: tr('正弦信号的有效值：和多大的直流电压在电阻上产生同样的热。', 'A sine’s RMS value: the DC voltage that would heat a resistor just as much.'),
    vars: [{ sym: 'U_p', name: tr('峰值（幅度）', 'peak (amplitude)'), unit: 'V', def: 0.5 }],
    out: { sym: 'U_rms', name: tr('有效值', 'RMS value'), unit: 'V' },
    compute: (v) => v.U_p / Math.SQRT2,
    why: tr(
      `1. 有效值的定义：在电阻上产生相同平均功率的直流值，$U_{rms} = \\sqrt{\\frac{1}{T}∫_{0}^{T} u^{2} dt}$（均方根）。
2. 正弦：$u^{2} = U_p^{2}sin^{2}(ωt) = \\frac{U_p^{2}}{2}(1 - cos 2ωt)$，一个周期里 cos 项平均为 0。
3. 所以均方值是 $\\frac{U_p^{2}}{2}$，开方得 $\\frac{U_p}{\\sqrt{2}}$。
4. **只对正弦成立**：方波（±A）的有效值就是 A；占空比 D 的 0/$V_H$ 方波是 $V_H\\sqrt{D}$。
5. 直流 + 交流：$U_{rms} = \\sqrt{U_{dc}^{2} + U_{ac,rms}^{2}}$。`,
      `1. RMS is defined as the DC value giving the same average power in a resistor: $U_{rms} = \\sqrt{\\frac{1}{T}∫_{0}^{T} u^{2} dt}$ (root mean square).
2. For a sine $u^{2} = U_p^{2}sin^{2}(ωt) = \\frac{U_p^{2}}{2}(1 - cos 2ωt)$, and the cos term averages to 0 over a period.
3. So the mean square is $\\frac{U_p^{2}}{2}$ and its root $\\frac{U_p}{\\sqrt{2}}$.
4. **Only for a sine**: a ±A square wave has RMS A; a 0 / $V_H$ square with duty D has $V_H\\sqrt{D}$.
5. DC plus AC: $U_{rms} = \\sqrt{U_{dc}^{2} + U_{ac,rms}^{2}}$.`,
    ),
    example: tr(
      '第 12 课：50 Ω 负载上 0.5 V 峰值 → $\\frac{0.5}{1.414} ≈ 0.354 V$。实验 4-4：谐振时有效值电流 $\\frac{1/\\sqrt{2}}{101 + 50} ≈ 4.7 mA$。',
      'Lesson 12: 0.5 V peak on the 50 Ω load → $\\frac{0.5}{1.414} ≈ 0.354 V$. Lab 4-4: the RMS current at resonance is $\\frac{1/\\sqrt{2}}{101 + 50} ≈ 4.7 mA$.',
    ),
    pitfalls: [
      tr(
        '普通万用表交流档按正弦标定：测方波、PWM 读数不对，要用真有效值表。',
        'An ordinary meter’s AC range is calibrated for sines: on a square wave or PWM it is wrong — use a true-RMS meter.',
      ),
      tr('有效值、峰值、峰峰值别混着比：先统一成同一种。', 'Don’t compare RMS with peak or peak-to-peak: convert to one kind first.'),
    ],
    teardowns: ['oscilloscope', 'multimeter'],
    lessons: ['lesson-generator-scope', 'exp4-rl-phasors', 'exp4-series-resonance', 'exp4-parallel-lc-tank', 'exp5-pwm-mosfet-motor'],
    chapter: 'non-sinusoidal',
  },
  {
    id: 'period-frequency',
    group: 'instruments',
    title: tr('周期与频率 Period and frequency', 'Period and frequency'),
    tex: 'T = \\frac{1}{f}, T = n_{div} × t_{div}',
    use: tr('频率换周期（反过来也一样），以及从示波器屏幕上数格读周期。', 'Frequency to period and back, and reading a period off the scope by counting divisions.'),
    vars: [{ sym: 'f', name: tr('频率', 'frequency'), unit: 'Hz', def: 1000 }],
    out: { sym: 'T', name: tr('周期', 'period'), unit: 's' },
    compute: (v) => 1 / v.f,
    why: tr(
      `1. 频率 f 是每秒重复多少次，周期 T 是重复一次要多久：$T = \\frac{1}{f}$。
2. 示波器上：一个周期占的横向格数 × 每格时间（time/div）= T。
3. 半个周期 $\\frac{T}{2} = \\frac{1}{2f}$ 是方波高（或低）电平持续的时间——一阶电路实验里要拿它和 τ 比。
4. 角频率 $ω = 2πf$（rad/s），算容抗、感抗用它。`,
      `1. Frequency f is how many times a second it repeats, period T how long one repeat takes: $T = \\frac{1}{f}$.
2. On the scope: divisions in one period × time per division (time/div) = T.
3. Half a period, $\\frac{T}{2} = \\frac{1}{2f}$, is how long a square wave stays high (or low) — the first-order labs compare it with τ.
4. Angular frequency $ω = 2πf$ (rad/s) is what reactances use.`,
    ),
    example: tr(
      '第 12 课：1 kHz → 1 ms = 100 µs/div 下正好 10 格。实验 3-1：500 Hz 的半周期 1 ms ≈ τ；5 kHz 的半周期 0.1 ms = 0.1τ。',
      'Lesson 12: 1 kHz → 1 ms = exactly 10 divisions at 100 µs/div. Lab 3-1: at 500 Hz half a period is 1 ms ≈ τ; at 5 kHz it is 0.1 ms = 0.1τ.',
    ),
    pitfalls: [tr('拿“半周期”当周期，或把 ω 和 f 混用（差 2π ≈ 6.28 倍）。', 'Using half a period as the period, or mixing ω and f up (a factor 2π ≈ 6.28).')],
    teardowns: ['oscilloscope'],
    lessons: ['lesson-generator-scope', 'exp3-rc-square-charging', 'exp3-rc-differentiator-integrator', 'exp3-rlc-ringing', 'exp5-pwm-rc-dac'],
    chapter: 'phasors',
  },
  {
    id: 'phase-from-delay',
    group: 'instruments',
    title: tr('由时间差算相位差 Phase from time delay', 'Phase from a time delay'),
    tex: 'φ = -360° × \\frac{Δt}{T} = -360° × Δt f',
    use: tr(
      '两个同频正弦，CH2 比 CH1 晚 Δt 到峰值：相位差是多少度（落后为负）。',
      'Two sines of one frequency, CH2 peaking Δt after CH1: the phase difference in degrees (lagging is negative).',
    ),
    vars: [
      { sym: 'Δt', name: tr('CH2 比 CH1 晚多少', 'how much later CH2 is'), unit: 's', def: 0.000089 },
      { sym: 'f', name: tr('频率', 'frequency'), unit: 'Hz', def: 1000 },
    ],
    out: { sym: 'φ', name: tr('CH2 相对 CH1 的相位（度）', 'phase of CH2 vs CH1 (degrees)'), unit: '' },
    compute: (v) => -360 * v['Δt'] * v.f,
    why: tr(
      `1. 一个整周期 T 对应 360°。
2. 晚了 Δt，就是晚了 $\\frac{Δt}{T}$ 个周期 = $360° × \\frac{Δt}{T}$。
3. 符号约定：CH2 **晚** 到（落后）记为负，**早** 到（超前）记为正。
4. 反过来：$Δt = \\frac{|φ|}{360°} × T$。
5. 读 Δt：两个波形的过零点（同一方向）之间的格数 × time/div。`,
      `1. One full period T is 360°.
2. Δt later is $\\frac{Δt}{T}$ of a period = $360° × \\frac{Δt}{T}$.
3. Sign convention: CH2 arriving **later** (lagging) is negative, **earlier** (leading) positive.
4. The other way round: $Δt = \\frac{|φ|}{360°} × T$.
5. Reading Δt: divisions between matching zero crossings (same direction) × time/div.`,
    ),
    example: tr(
      '第 13 课：1 kHz、1 kΩ + 100 nF，电容电压落后 $arctan\\frac{1000}{1592}$ ≈ 32°，对应 $Δt = \\frac{32}{360} × 1 ms ≈ 89 µs$。实验 4-1：在 $f_c$ 处 −45° = 晚八分之一周期。',
      'Lesson 13: at 1 kHz with 1 kΩ + 100 nF the capacitor voltage lags by $arctan\\frac{1000}{1592}$ ≈ 32°, i.e. $Δt = \\frac{32}{360} × 1 ms ≈ 89 µs$. Lab 4-1: −45° at $f_c$ = an eighth of a period late.',
    ),
    pitfalls: [
      tr(
        'Δt 超过半个周期时，“晚 Δt”也可以看成“早 T − Δt”：相位通常取 −180° … +180°。',
        'A delay over half a period can also be read as "T − Δt early": phase is usually given in −180° … +180°.',
      ),
      tr('反相放大器的输出和输入差 180°，看起来像“晚了半个周期”。', 'An inverting amplifier’s output is 180° away from its input — it looks like "half a period late".'),
    ],
    Figure: () => (
      <g>
        <path d="M15 75 H250" className="cf-w thin" strokeDasharray="4 3" />
        <polyline points={sine(20, 240, 75, 40, 140)} className="cf-w" fill="none" />
        <polyline points={sine(20, 240, 75, 28, 140, 24)} className="cf-w accent" fill="none" />
        <path d="M90 75 V125 M114 75 V125" className="cf-w thin" strokeDasharray="2 3" />
        <path d="M90 120 H114 M95 116 L90 120 L95 124 M109 116 L114 120 L109 124" className="cf-w accent" fill="none" />
        <T x={102} y={140} cls="accent">
          Δt
        </T>
        <T x={40} y={28}>
          CH1
        </T>
        <T x={78} y={140} cls="accent small">
          CH2
        </T>
      </g>
    ),
    teardowns: ['oscilloscope'],
    lessons: ['lesson-scope-two-channels', 'exp4-rc-lowpass-bode', 'exp4-rc-highpass-coupling', 'exp4-rl-phasors', 'exp4-series-resonance', 'exp3-rc-differentiator-integrator'],
    chapter: 'phasors',
  },
];
