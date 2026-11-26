// W5-L7 · 传递函数、分贝刻度与波特图（Bode Plots）渐近线画法 (lesson sheet: docs/lessons/W5-L7.md).
// Type D, strictly 2D: no three.js anywhere in this folder (lesson.test.ts checks it); the Bode plots,
// the factor build-up and the dB ruler are live SVG on log-frequency axes. The professor's opening,
// the text of the six acts, the act figures (svgs.ts), the guided example and the diagnostic quiz are
// reproduced from the sheet; [[id|…]] only links a term to the stage (the words are unchanged).
// Changes of form:
// - the opening remarks open act 1; the sub-headings (1.1 … 6.1) are bold lines; display formulas
//   sit in ① / ② / ③ cards (a lead-in sentence becomes the card title, the ① axioms run inline); the
//   numbered items of a ③ are its steps (their sub-bullets run as one sentence); in act 4's ② the
//   low- and mid-band bullets lead into the plateau formula, the other two follow as a list;
// - the guided example (the sheet's JSON) keeps its five steps and four options with their
//   intercepts; plain-text symbols in it (ω_c, (1 + jω/ω_c), √(2×100) …) are set as TeX; each step's
//   board TeX is written as two lines where it is long; the right option moves (steps 4 and 5 and
//   quiz Q2 and Q3 are reordered: the sheet put it at B five times out of nine);
// - left out (build notes, not lesson text): 「（Python 精确生成）」 in the figure headings, the
//   sentence of act 5 announcing "the reference plot and the JSON for the front end", the JSON ids,
//   the quiz's passing score (the site uses 4/4), act 6's stage-architecture diagram and the
//   「Claude 工程落地清单」 (and its mention in act 6's title).
// Anti-spoiler: act 5's reference Bode plot (参考波特图) printed the guided example's results (23.01 dB
// at both corners, the 26.02 dB plateau, the slopes) before the example; it now stands right after the
// guided block as its 通关复盘 figure, and the example gets a blank semilog problem figure. The step
// diagrams of steps 1, 3, 4 and 5 printed their own answers (2 × 100 = 200; the flat-then-falling
// asymptote; "向下偏离 ≈ 3.01 dB"; +90° → −90° and ω0 = √(p1·p2)): those parts are "?" now (svgs.ts).
// While the example runs, the stage draws only what it has reached (stage param w57_g = steps
// solved: K, then the low-frequency line, the asymptote, the exact curve, the phase); done_params
// uncovers the rest. Act 4's ③ is a different function (poles 2 and 10), so it stays in place.
// Fixed TeX: the sheet's formulas drop many closing braces (§1.3, §2.1, §3.2, §4.1); restored, see
// the report in the commit. Fixed text: step 1's intercept for K = 100 said "只除以了 20（或漏提了其中
// 一个因子）" — leaving out one factor gives 1000 or 20, not 100, so the parenthesis is dropped.
// Added (the sheet has none): the hover map; praise for the right options and the guided example's
// conclusion; per-option quiz feedback written from the explanations; act 6's figure and the quiz
// figures.

import { lazy } from 'react';
import type { StageLesson, StageSync } from '../../types';
import { L1, L2, L3, P } from './state';
import type { Preset } from './model';
import {
  MINI_STEP1,
  MINI_STEP2,
  MINI_STEP3,
  MINI_STEP4,
  MINI_STEP5,
  SVG_ACT1,
  SVG_ACT2,
  SVG_ACT3,
  SVG_ACT4_MAG,
  SVG_ACT4_PHASE,
  SVG_ACT6,
  SVG_GUIDED_PROBLEM,
  SVG_GUIDED_REVIEW,
  SVG_Q1,
  SVG_Q2,
  SVG_Q3,
  SVG_Q4,
} from './svgs';

const Layer01 = lazy(() => import('./Layer01'));
const Layer02 = lazy(() => import('./Layer02'));
const Layer03 = lazy(() => import('./Layer03'));

const R = String.raw;
/** inline `code` inside a String.raw text */
const code = (s: string) => `\`${s}\``;

/** a guided step's stage: the guided example, `solved` steps uncovered */
const G = (solved: number, extra: Record<string, unknown> = {}) => ({ [P.preset]: 'guided' as Preset, [P.g]: solved, ...extra });
const at = (layer: string, halo: string[], params: Record<string, unknown>): StageSync => ({ layer, halo, params });

const W5_L7: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Layer01, [L2]: Layer02, [L3]: Layer03 },
  lesson_meta: {
    lesson_id: 'W5-L7',
    world: 'World 5',
    title: '传递函数、分贝刻度与波特图（Bode Plots）渐近线画法',
    subtitle: '一支铅笔、一张半对数坐标纸和四条乐高式法则：60 秒画出任意电路的频率肖像',
    lesson_type: 'D',
    lesson_type_label: '动态频响波特图课（纯 2D 交互舞台）',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Section 14.1–14.4 (Transfer Function, The Decibel Scale, Bode Plots)'],
    },
    textbook_supplement: 'Boylestad, Introductory Circuit Analysis, 14th Ed., Ch. 21 (Decibels, Logarithmic Scales & Decade Intuition)',
    prerequisites: ['W3-L1 分贝增益', 'W5-L2 复阻抗'],
    learning_objectives: [
      R`由电路写出传递函数 $\mathbf{H}(\omega)$，认出它的零点与极点`,
      R`在幅值比、功率比与分贝之间换算，说明半功率点为什么就是 $-3\text{ dB}$`,
      R`把 $\mathbf{H}(\omega)$ 化为波特图标准形式、提取常数 $K$，画出四种基本因子的渐近线`,
      '把多因子传递函数的渐近线逐段叠加，画出完整的幅频与相频波特图',
    ],
    next_lesson: 'W5-L8',
    next_lesson_title: '串联与并联谐振（品质因数 Q、带宽与 3D 面包板扫频实操）',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 H(ω) 化简台',
        short: '01 H(ω) 化简台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '01 2D 电路与传递函数 H(ω) 实时化简台：拖动 R、C 实时刷新复阻抗与 H(ω)；分贝尺把幅值比、分贝与功率比放在同一条对数轴上；一键把非标准分式化为波特图标准形式并提取常数 K。',
      },
      {
        id: L2,
        label: '02 波特图',
        short: '02 波特图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 交互式半对数幅频/相频波特图 (渐近线 vs 精确曲线 + 可拖频率游标)：幅频 (dB) 与相频 (°) 共享对数横轴；拖动游标读渐近值、精确值与误差（转折处 −3.01 dB）；渐近线 / 精确曲线 / 误差标注可独立开关。',
      },
      {
        id: L3,
        label: '03 逐项叠加',
        short: '03 逐项叠加',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '03 多因子逐项叠加分解面板：分色勾选常数 K、原点零/极点、一阶实零/极点、二阶共轭极点；逐段斜率累加表（+20 / 0 / −20 dB/dec）与相角转折区间实时联动。',
      },
    ],
    hover_map: {
      vin: { label: '输入相量 Vᵢ(ω)', desc: '正弦稳态下的输入电压相量（激励）' },
      r: { label: '电阻 R', desc: '复阻抗就是 R 本身，与频率无关' },
      c: { label: '电容 C', desc: '复阻抗 1/(jωC)：低频近似开路，高频近似短路' },
      vout: { label: '输出相量 Vₒ(ω)', desc: '电容两端电压：电容阻抗占总阻抗的比例乘以 Vᵢ' },
      hbox: { label: '传递函数黑箱 H(ω)', desc: 'H(ω) = Vₒ/Vᵢ = |H|∠φ：幅频决定振幅缩放，相频决定相位滞后' },
      pole: { label: '极点 s = −1/(RC)', desc: '分母 1 + jωRC 的根：高频滚降的转折起点（左半平面，稳定）' },
      wc: { label: '转折角频率 ωc', desc: 'ωc = 1/(RC)；fc = ωc/2π。R = 1 kΩ、C = 1 µF 时 ωc = 1000 rad/s' },
      db_ratio: { label: '幅值比 |H| = V₂/V₁', desc: '对数刻度：每 ×10 走一格' },
      db_ruler: { label: '分贝刻度 20 log₁₀|H|', desc: '线性刻度：|H| 每 ×10 加 20 dB，每 ×2 加 6.02 dB' },
      db_power: { label: '功率比 P₂/P₁ = |H|²', desc: '阻抗相等时功率比是电压比的平方；10 log₁₀(P₂/P₁) 与 20 log₁₀|H| 是同一个 dB' },
      half_power: { label: '半功率点', desc: 'P₂/P₁ = 1/2 ⇔ |H| = 1/√2 ≈ 0.707 ⇔ −3.01 dB：同一物理事实的三种说法' },
      std_form: { label: '波特图标准形式', desc: '每个 (jω + p) 写成 p(1 + jω/p)，提出的常数全部并进 K：低频时每个括号都等于 1（0 dB）' },
      k_gain: { label: '常数增益 K', desc: '标准形式里提出来的总常数：20 log₁₀K 是一条水平线' },
      mag_plot: { label: '幅频图（dB）', desc: '20 log₁₀|H(ω)| 对 log ω：乘除变加减，曲线变直线' },
      phase_plot: { label: '相频图（°）', desc: '∠H(ω) 对 log ω：各因子相角直接相加' },
      asym: { label: '渐近线（直线近似）', desc: '各因子直线段的代数和：转折频率处改变斜率' },
      exact: { label: '精确曲线', desc: '直接用复数求出的 20 log₁₀|H(jω)| 与 ∠H(jω)' },
      err3: { label: '转折处误差', desc: '精确值 − 渐近值：单个一阶极点在 ωc 处为 −3.01 dB；邻近极点会再添一点' },
      corner: { label: '转折频率', desc: '一阶因子的 ωc（二阶因子的 ωₙ）：幅频斜率在这里改变；相频在它两侧各一个十倍频程内过渡' },
      cursor: { label: '频率游标', desc: '拖动它读出该频率的渐近值、精确值与误差；靠近转折频率等特殊点会吸附' },
      omega0: { label: '0° 相移中心频率 ω₀', desc: 'ω₀ = √(ωp1 ωp2)：对数轴上两个极点的几何中点，精确相角在这里穿过 0°' },
      peak: { label: '谐振尖峰', desc: 'ζ < 1/√2 时在 ωᵣ = ωₙ√(1 − 2ζ²) 出现峰值 Mᵣ = 1/(2ζ√(1 − ζ²))' },
      f_k: { label: '因子 ①：常数增益 K', desc: '水平直线 20 log₁₀|K|，斜率 0 dB/dec；K > 0 相角 0°（K < 0 为 −180°）' },
      f_origin: { label: '因子 ②：原点零/极点 jω、1/(jω)', desc: '过 (ω = 1, 0 dB)，全频段 ±20 dB/dec；相角恒为 ±90°' },
      f_p1: { label: '第一实极点 1/(1 + jω/ωp1)', desc: 'ωp1 以下 0 dB，以上 −20 dB/dec；相角在 [0.1ωp1, 10ωp1] 内以 −45°/dec 降 90°' },
      f_p2: { label: '第二实极点 1/(1 + jω/ωp2)', desc: 'ωp2 以下 0 dB，以上 −20 dB/dec；相角在 [0.1ωp2, 10ωp2] 内以 −45°/dec 降 90°' },
      f_real: { label: '因子 ③：一阶实零/极点 (1 + jω/ωc)', desc: 'ωc 以下 0 dB，以上 ±20 dB/dec；ωc 处精确偏离 ±3.01 dB；相角 ±45°/dec 过渡两个十倍频程' },
      f_quad: { label: '因子 ④：二阶共轭极点', desc: 'ωₙ 以下 0 dB，以上 −40 dB/dec；ωₙ 处为 −20 log₁₀(2ζ)；相角 0° → −180°' },
      slope_table: { label: '逐段斜率累加表', desc: '每个频率区间里把各因子的斜率相加，得到合成幅频斜率与相频斜率' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: R`从黑箱到频率肖像——传递函数 $\mathbf{H}(\omega)$ 与零极点直觉`,
      sync: at(L1, ['hbox', 'wc'], { [P.view]: 'circuit', [P.preset]: 'rc', [P.R]: 1000, [P.C]: 1e-6, [P.w]: 1000 }),
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎回到 Breadboard Lab！前几节课我们学会了用**复阻抗**（${code('W5-L2')}）在单个频率下算稳态电路。但真实世界里的音频、无线电、电源纹波和传感器信号，从来不是单一频率的孤立正弦波，而是横跨成千上万赫兹的频率洪流。今天我们要掌握电路工程师手里最锋利的“频率X光机”——**[[hbox|传递函数 $\mathbf{H}(\omega)$]]** 与 **[[mag_plot,phase_plot|波特图（Bode Plots）]]**。学完这 6 幕，你不需要计算器，仅凭一支铅笔、一张半对数坐标纸和四条乐高式法则，就能在 60 秒内把任意高阶电路的频率肖像画得八九不离十！`,
        },
        { kind: 'p', text: '**1.1 什么是传递函数？四大家族一次认全**' },
        {
          kind: 'formula',
          title: R`在正弦稳态下，对于任意线性时不变（LTI）电路，**传递函数（Transfer Function）** $\mathbf{H}(\omega)$ 定义为[[vout|输出相量]] $\mathbf{Y}(\omega)$ 与[[vin|输入相量]] $\mathbf{X}(\omega)$ 之比（假设所有初始储能为零）：`,
          tex: R`\mathbf{H}(\omega) = \frac{\mathbf{Y}(\omega)}{\mathbf{X}(\omega)} = |\mathbf{H}(\omega)|\angle\phi(\omega)`,
        },
        { kind: 'p', text: R`它是一个随角频率 $\omega$ 变化的**复函数**：` },
        {
          kind: 'ul',
          items: [
            R`**[[mag_plot|幅频响应（Magnitude Response）]]** $|\mathbf{H}(\omega)|$：告诉你频率为 $\omega$ 的正弦波穿过电路后，振幅被放大还是衰减了多少倍；`,
            R`**[[phase_plot|相频响应（Phase Response）]]** $\phi(\omega) = \angle\mathbf{H}(\omega)$：告诉你输出波形相对输入波形超前或滞后了多少度。`,
          ],
        },
        { kind: 'p', text: '根据输入与输出物理量是电压还是电流，Sadiku Section 14.1 将传递函数分为四大类型：' },
        {
          kind: 'table',
          head: ['传递函数类型', '符号定义', '量纲/单位', '典型工程场景'],
          rows: [
            ['**电压增益（Voltage Gain）**', R`$\mathbf{H}_v(\omega) = \frac{\mathbf{V}_o(\omega)}{\mathbf{V}_i(\omega)}$`, '无量纲（V/V 或 dB）', '滤波器、运放电压放大器'],
            ['**电流增益（Current Gain）**', R`$\mathbf{H}_i(\omega) = \frac{\mathbf{I}_o(\omega)}{\mathbf{I}_i(\omega)}$`, '无量纲（A/A 或 dB）', '电流镜、BJT 共射极电流放大'],
            ['**转移阻抗（Transfer Impedance）**', R`$\mathbf{Z}(\omega) = \frac{\mathbf{V}_o(\omega)}{\mathbf{I}_i(\omega)}$`, R`$\Omega$（V/A）`, '光电二极管跨阻放大器（TIA）'],
            [
              '**转移导纳（Transfer Admittance）**',
              R`$\mathbf{Y}(\omega) = \frac{\mathbf{I}_o(\omega)}{\mathbf{V}_i(\omega)}$`,
              R`$\text{S}$（A/V）`,
              '跨导放大器（OTA）、压控电流源',
            ],
          ],
        },
        { kind: 'p', text: '**1.2 零点（Zeros）与极点（Poles）的物理直觉**' },
        {
          kind: 'formula',
          title: R`把 $j\omega$ 推广为复频率 $s = j\omega$ 后，任意集总参数线性电路的传递函数都可以写成两个多项式之比：`,
          tex: R`\mathbf{H}(s) = \frac{\mathbf{N}(s)}{\mathbf{D}(s)} = K_0 \frac{(s - z_1)(s - z_2)\cdots(s - z_m)}{(s - p_1)(s - p_2)\cdots(s - p_n)}`,
        },
        {
          kind: 'ul',
          items: [
            R`**零点（Zeros，$\mathbf{N}(s) = 0$ 的根 $z_i$）**：物理上是电路的**“信号黑洞”或“陷波点”**。当激励频率逼近零点时，输出趋近于零（例如串联 LC 支路在谐振频率把输出短路到地，或隔直电容在 $\omega = 0$ 处阻断直流形成原点零点）。`,
            R`**[[pole|极点（Poles，$\mathbf{D}(s) = 0$ 的根 $p_i$）]]**：物理上是电路的**“固有时间常数/谐振指纹”**。极点决定了电路在何处发生能量滚降或剧烈谐振；对于无源或稳定电路，所有极点都必须位于复平面左半平面（$\text{Re}(p_i) < 0$），否则系统会自激振荡发散！`,
          ],
        },
        { kind: 'p', text: '**1.3 教授三段式板书推导：一阶 RC 低通电路的传递函数**' },
        { kind: 'p', text: '我们用最经典的 RC 低通网络做一次标准的三段式板书推导（严守“公理溯源 → 纯符号通式 → 代入数值”纪律）：' },
        {
          kind: 'origin',
          title: '① 公理溯源（Axiomatic Origin）',
          text: R`根据频域复阻抗定义（${code('W5-L2')}）与线性串联网络的分压定理（Voltage Division）：$Z_R = R, \qquad Z_C = \frac{1}{j\omega C}, \qquad \mathbf{V}_o(\omega) = \frac{Z_C}{Z_R + Z_C}\mathbf{V}_i(\omega)$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（Pure Symbolic Derivation）：由传递函数定义 $\mathbf{H}(\omega) = \mathbf{V}_o(\omega)/\mathbf{V}_i(\omega)$，代入阻抗并上下同乘 $j\omega C$：`,
          tex: R`\mathbf{H}(\omega) = \frac{\dfrac{1}{j\omega C}}{R + \dfrac{1}{j\omega C}} = \frac{1}{1 + j\omega RC} = \frac{1}{1 + j\dfrac{\omega}{\omega_c}}, \qquad \omega_c \triangleq \frac{1}{RC}`,
        },
        {
          kind: 'formula',
          title: '由此分离出幅频与相频通式：',
          tex: R`|\mathbf{H}(\omega)| = \frac{1}{\sqrt{1 + (\omega/\omega_c)^2}}, \qquad \phi(\omega) = -\arctan\left(\frac{\omega}{\omega_c}\right)`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（Numerical Substitution）：取 [[r|$R = 1\text{ k}\Omega = 10^3\ \Omega$]]，[[c|$C = 1\ \mu\text{F} = 10^{-6}\text{ F}$]]`,
          steps: [
            {
              label: '计算转折角频率',
              text: R`[[wc|$\omega_c = \frac{1}{10^3 \times 10^{-6}} = 1000\text{ rad/s}$]]（对应 $f_c = \frac{\omega_c}{2\pi} \approx 159.15\text{ Hz}$）；`,
            },
            { label: '写出传递函数', text: R`$\mathbf{H}(\omega) = \frac{1}{1 + j\omega/1000}$，[[pole|极点位于 $s = -1000\text{ rad/s}$]]；` },
            {
              label: R`代入转折频率 $\omega = 1000\text{ rad/s}$ 检验`,
              tex: R`|\mathbf{H}(1000)| = \frac{1}{\sqrt{1 + 1^2}} = \frac{1}{\sqrt{2}} \approx 0.7071, \qquad \phi(1000) = -\arctan(1) = -45.00^\circ`,
            },
          ],
        },
        { kind: 'p', text: '**1.4 2D 电路与传递函数黑箱图示**' },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '一阶 RC 低通网络：频域复阻抗分压与传递函数黑箱映射',
    },
    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '为什么工程界离不开分贝与对数坐标？',
      sync: at(L1, ['db_ruler', 'half_power'], { [P.view]: 'db', [P.ratio]: Math.SQRT1_2 }),
      blocks: [
        { kind: 'p', text: '**2.1 分贝（Decibel）的本质与三段式推导（Sadiku 14.2 + Boylestad Ch. 21）**' },
        {
          kind: 'p',
          text: R`人类听觉、视觉对强度的感知遵循对数规律，而通信与电路系统常常要同时观察从 $1\text{ Hz}$ 到 $100\text{ MHz}$（跨越 8 个数量级！）的频率响应，以及从 $10^{-4}$ 到 $10^{4}$ 的增益变化。如果用线性坐标，低频细节会被压缩成一条看不见的缝！`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`贝尔（Bel）定义为功率比 $P_2/P_1$ 的常用对数，而工程中常用的**[[db_ruler|分贝（Decibel, dB）]]**是贝尔的十分之一：$G_{\text{dB}} = 10\log_{10}\left(\frac{P_2}{P_1}\right)$ 对于线性纯阻性端口，平均功率与电压/电流幅值的平方成正比：$P_1 = \frac{V_1^2}{R_1} = I_1^2 R_1, \qquad P_2 = \frac{V_2^2}{R_2} = I_2^2 R_2$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：当输入与输出端口阻抗相等（$R_1 = R_2$）时，将[[db_power|功率表达式]]代入分贝定义：`,
          tex: R`G_{\text{dB}} = 10\log_{10}\left(\frac{V_2^2 / R_2}{V_1^2 / R_1}\right) = 10\log_{10}\left(\frac{V_2}{V_1}\right)^2 = 20\log_{10}\left|\frac{\mathbf{V}_2}{\mathbf{V}_1}\right| = 20\log_{10}|\mathbf{H}(\omega)|`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授重要提醒**：在波特图工程约定中，即便输入与输出阻抗不相等，我们仍然**统一**使用 $H_{\text{dB}}(\omega) = 20\log_{10}|\mathbf{H}(\omega)|$ 来衡量电压增益、电流增益乃至转移阻抗/导纳的幅频响应。`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值验证“半功率点 = −3 dB”奇迹：为什么电路课本里到处都在喊 **$-3\text{ dB}$ 截止频率**？代入[[half_power|半功率条件 $P_2/P_1 = 1/2$]] 立刻水落石出`,
          steps: [
            { label: '按功率比计算', text: R`$G_{\text{dB}} = 10\log_{10}(0.5) \approx 10 \times (-0.30103) = -3.0103\text{ dB} \approx -3\text{ dB}$；` },
            { label: '对应电压比', text: R`$\frac{V_2}{V_1} = \sqrt{\frac{P_2}{P_1}} = \frac{1}{\sqrt{2}} \approx 0.7071$；` },
            { label: '按电压比计算', text: R`$H_{\text{dB}} = 20\log_{10}\left(\frac{1}{\sqrt{2}}\right) = -10\log_{10}(2) \approx -3.0103\text{ dB} \approx -3\text{ dB}$。` },
          ],
        },
        {
          kind: 'p',
          text: R`也就是说，**[[half_power|半功率点（$P_2/P_1 = 1/2$）]]**、**电压 $0.707$ 倍点（$1/\sqrt{2}$）** 和 **$-3\text{ dB}$ 点**，是同一物理事实的三种等价表达！`,
        },
        { kind: 'p', text: '**2.2 常用分贝速查表与“乘除变加减”的魔法**' },
        {
          kind: 'formula',
          title:
            '在 Boylestad Ch. 21 中，把横轴频率也取对数（每增大 10 倍称为 **1 个十倍频程 / 1 Decade**；每增大 2 倍称为 **1 个倍频程 / 1 Octave**），会触发波特图最核心的数学魔法：',
          tex: R`20\log_{10}\left|\frac{K \cdot N_1(\omega) \cdot N_2(\omega)}{D_1(\omega) \cdot D_2(\omega)}\right| = 20\log_{10}K + 20\log_{10}|N_1| + 20\log_{10}|N_2| - 20\log_{10}|D_1| - 20\log_{10}|D_2|`,
        },
        {
          kind: 'formula',
          title: '同时，复数相乘相除时**相角天然相加减**：',
          tex: R`\angle\mathbf{H}(\omega) = \angle K + \angle N_1 + \angle N_2 - \angle D_1 - \angle D_2`,
        },
        { kind: 'p', text: '**把令人头疼的复函数乘除，变成半对数坐标纸上的直线段加减！** 记熟下面几组黄金换算，手算波特图快如闪电：' },
        {
          kind: 'table',
          head: [R`幅值比 $|\mathbf{H}|$`, R`分贝值 $20\log_{10}|\mathbf{H}|$`, '频率间隔', '斜率对应关系'],
          rows: [
            [R`$1$`, R`$0\text{ dB}$`, R`1 倍频程（Octave，$\times 2$）`, R`$\pm 6.02\text{ dB/oct}$`],
            [R`$1/\sqrt{2} \approx 0.707$`, R`$-3.01\text{ dB} \approx -3\text{ dB}$`, R`**1 十倍频程（Decade，$\times 10$）**`, R`**$\pm 20\text{ dB/dec}$**`],
            [R`$2$`, R`$+6.02\text{ dB} \approx +6\text{ dB}$`, R`2 十倍频程（$\times 100$）`, R`$\pm 40\text{ dB}$`],
            [R`$10$`, R`$+20.00\text{ dB}$`, '二阶系统 1 十倍频程', R`$\pm 40\text{ dB/dec}$`],
            [R`$100$`, R`$+40.00\text{ dB}$`, '三阶系统 1 十倍频程', R`$\pm 60\text{ dB/dec}$`],
          ],
        },
        { kind: 'p', text: '**2.3 线性坐标 vs 半对数分贝坐标对比图**' },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '线性坐标 vs 半对数分贝坐标：为什么波特图能把曲线“拉直”？',
    },
    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '波特图的四块乐高积木——标准形式与基本因子渐近线法则',
      sync: at(L2, ['asym', 'exact', 'err3'], { [P.preset]: 'block', [P.block]: 'real', [P.sign]: -1, [P.w]: 10 }),
      blocks: [
        { kind: 'p', text: '**3.1 画图前的铁律：先化为波特图标准形式（Standard Form）**' },
        {
          kind: 'formula',
          title: R`拿到任意传递函数 $\mathbf{H}(\omega)$，**动手画图前必须先化为[[std_form|标准形式]]**：把所有非原点的一阶因子 $(j\omega + p)$ 提取常数 $p$ 变成 $p(1 + j\omega/p)$，把所有二阶因子化为 $\left[1 + j2\zeta(\omega/\omega_n) - (\omega/\omega_n)^2\right]$，并将所有提出来的常数统统合并进[[k_gain|总增益系数 $K$]]：`,
          tex: R`\mathbf{H}(\omega) = \frac{K\,(j\omega)^{\pm 1}\,\left(1 + j\dfrac{\omega}{z_1}\right)\cdots}{\left(1 + j\dfrac{\omega}{p_1}\right)\left[1 + j2\zeta\dfrac{\omega}{\omega_n} - \left(\dfrac{\omega}{\omega_n}\right)^2\right]\cdots}`,
        },
        {
          kind: 'p',
          text: R`为什么要这么麻烦？因为只有写成 $(1 + j\omega/\omega_c)$ 形式，它在低频 $\omega \ll \omega_c$ 时的值才严格等于 $1$（即 **$0\text{ dB}$**），才不会污染低频段的基准高度！`,
        },
        { kind: 'p', text: '**3.2 四大基本因子渐近线全表（Sadiku 14.4）**' },
        {
          kind: 'table',
          head: ['基本因子', '幅频渐近线法则', '幅频精确误差特征', '相频渐近线法则'],
          rows: [
            [
              R`**[[f_k|1. 常数增益 $K$]]**`,
              R`全频段水平直线 $20\log_{10}|K|$（斜率 $0\text{ dB/dec}$）`,
              '无误差（完全精确）',
              R`$K>0$ 恒为 $0^\circ$；$K<0$ 恒为 $-180^\circ$（或 $+180^\circ$）`,
            ],
            [
              R`**[[f_origin|2. 原点零/极点 $(j\omega)^{\pm 1}$]]**`,
              R`过点 $(\omega=1,\ 0\text{ dB})$，全频段斜率 $\pm 20\text{ dB/dec}$`,
              '无误差（完全精确）',
              R`零点恒为 $+90^\circ$；极点恒为 $-90^\circ$`,
            ],
            [
              R`**[[f_real|3. 一阶实零/极点 $(1 + j\omega/\omega_c)^{\pm 1}$]]**`,
              R`$\omega \le \omega_c$ 为 $0\text{ dB}$；$\omega > \omega_c$ 斜率变为 $\pm 20\text{ dB/dec}$`,
              R`在转折频率 $\omega_c$ 处[[err3|偏离 **$\pm 3.01\text{ dB}$**]]（零点向上 $+3\text{ dB}$，极点向下 $-3\text{ dB}$）；在 $0.5\omega_c$ 与 $2\omega_c$ 处偏离 $\pm 0.97\text{ dB}$`,
              R`在 $[0.1\omega_c,\ 10\omega_c]$ 两十倍频程内以 **$\pm 45^\circ/\text{dec}$** 线性过渡：$\omega_c$ 处精确为 $\pm 45^\circ$；在 $0.1\omega_c$ 与 $10\omega_c$ 处最大误差 $\pm 5.71^\circ$`,
            ],
            [
              R`**[[f_quad|4. 二阶共轭极点 $\left[1 + j2\zeta\frac{\omega}{\omega_n} - \left(\frac{\omega}{\omega_n}\right)^2\right]^{-1}$]]**`,
              R`$\omega \le \omega_n$ 为 $0\text{ dB}$；$\omega > \omega_n$ 斜率变为 **$-40\text{ dB/dec}$**`,
              R`强烈依赖阻尼比 $\zeta$：在 $\omega_n$ 处幅值为 $-20\log_{10}(2\zeta)$；当 **$\zeta < 1/\sqrt{2} \approx 0.707$** 时在 $\omega_r = \omega_n\sqrt{1-2\zeta^2}$ 出现**[[peak|谐振尖峰]]** $M_r = \frac{1}{2\zeta\sqrt{1-\zeta^2}}$`,
              R`在 $[0.1\omega_n,\ 10\omega_n]$ 区间从 $0^\circ$ 过渡至 $-180^\circ$（近似斜率 $-90^\circ/\text{dec}$，在 $\omega_n$ 处精确为 $-90^\circ$；$\zeta$ 越小相角跳变越陡峭）`,
            ],
          ],
        },
        { kind: 'p', text: '**[[peak|小阻尼谐振尖峰速览]]（NumPy 精确验算）**：' },
        {
          kind: 'ul',
          items: [
            R`$\zeta = 1.000$（临界阻尼）：无尖峰，$\omega_n$ 处 $-6.02\text{ dB}$；`,
            R`$\zeta = 0.707$（巴特沃斯最平坦响应）：临界无尖峰，$\omega_n$ 处 $-3.01\text{ dB}$；`,
            R`$\zeta = 0.300$：$\omega_r = 0.906\,\omega_n$，谐振峰值 $M_r = 1.747$（**$+4.85\text{ dB}$**）；`,
            R`$\zeta = 0.100$：$\omega_r = 0.990\,\omega_n$，谐振峰值 $M_r = 5.025$（**$+14.02\text{ dB}$**）——电源滤波器与控制系统若出现这种尖峰极易烧毁或振荡！`,
          ],
        },
        { kind: 'p', text: '**3.3 四大基本因子特征全景图**' },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '波特图四大基本因子（幅频渐近线 vs 精确曲线特征全景）',
    },
    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '综合实战——多因子复合传递函数逐段叠加全演示',
      sync: at(L3, ['f_k', 'f_origin', 'f_p1', 'f_p2', 'slope_table'], { [P.preset]: 'ex4', [P.off]: [], [P.w]: 2 }),
      blocks: [
        {
          kind: 'formula',
          title: '现在我们拿 Sadiku Section 14.4 最经典的复合传递函数开刀，完整演练从化简到逐段叠加的每一个动作：',
          tex: R`\mathbf{H}(\omega) = \frac{200\,j\omega}{(j\omega + 2)(j\omega + 10)}`,
        },
        { kind: 'p', text: '**4.1 教授三段式板书推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`依据波特图对数分解定理，若标准形式传递函数由[[f_k|常数增益 $K$]]、[[f_origin|原点零点 $(j\omega)$]] 及两个一阶实极点 [[f_p1|$(1+j\omega/\omega_{p1})^{-1}$]]、[[f_p2|$(1+j\omega/\omega_{p2})^{-1}$]] 构成，则总幅频（dB）与总相频（°）严格等于各因子响应的代数和：$H_{\text{dB}}(\omega) = 20\log_{10}K + 20\log_{10}\omega - 20\log_{10}\sqrt{1+\left(\frac{\omega}{\omega_{p1}}\right)^2} - 20\log_{10}\sqrt{1+\left(\frac{\omega}{\omega_{p2}}\right)^2}$ $\phi(\omega) = 90^\circ - \arctan\left(\frac{\omega}{\omega_{p1}}\right) - \arctan\left(\frac{\omega}{\omega_{p2}}\right)$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（分段斜率与中频平顶公式）：设 $\omega_{p1} < \omega_{p2}$，按转折频率划分为三段——低频段（$\omega < \omega_{p1}$）：净斜率 $+20\text{ dB/dec}$，在 $\omega=1$ 处锚定 $20\log_{10}K$；中频段（$\omega_{p1} < \omega < \omega_{p2}$）：净斜率 $(+20) + (-20) = 0\text{ dB/dec}$，渐近平顶高度为：`,
          tex: R`H_{\text{dB,mid}} = 20\log_{10}K + 20\log_{10}\omega_{p1} = 20\log_{10}(K\omega_{p1})`,
        },
        {
          kind: 'ul',
          items: [
            R`高频段（$\omega > \omega_{p2}$）：净斜率 $0 + (-20) = -20\text{ dB/dec}$；`,
            R`精确相角过零频率（由 $\tan(\arctan(\omega/\omega_{p1}) + \arctan(\omega/\omega_{p2})) \to \infty$ 得）：[[omega0|$\omega_0 = \sqrt{\omega_{p1}\omega_{p2}}$]]。`,
          ],
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '**化标准形式**',
              text: R`从分母分别提取常数 $2$ 与 $10$：`,
              tex: R`\mathbf{H}(\omega) = \frac{200\,j\omega}{2\left(1 + j\dfrac{\omega}{2}\right) \cdot 10\left(1 + j\dfrac{\omega}{10}\right)} = \frac{10\,j\omega}{\left(1 + j\dfrac{\omega}{2}\right)\left(1 + j\dfrac{\omega}{10}\right)}`,
            },
            {
              label: '**拆解四块积木**',
              text: R`[[f_k|常数增益 $K = 10 \implies 20\log_{10}(10) = +20.00\text{ dB}$]]，相角 $0^\circ$；[[f_origin|原点零点 $(j\omega)$]]：过 $(\omega=1,\ 0\text{ dB})$，斜率 $+20\text{ dB/dec}$，相角恒为 $+90^\circ$；[[f_p1|第一实极点 $(1 + j\omega/2)^{-1}$]]：转折频率 $\omega_{p1} = 2\text{ rad/s}$，幅频斜率 $-20\text{ dB/dec}$，相角在 $[0.2,\ 20]\text{ rad/s}$ 降 $-90^\circ$；[[f_p2|第二实极点 $(1 + j\omega/10)^{-1}$]]：转折频率 $\omega_{p2} = 10\text{ rad/s}$，幅频斜率 $-20\text{ dB/dec}$，相角在 $[1,\ 100]\text{ rad/s}$ 降 $-90^\circ$。`,
            },
            {
              label: '**计算关键特征值**',
              text: R`中频渐近平顶：$H_{\text{dB,mid}} = 20\log_{10}(10 \times 2) = 20\log_{10}(20) \approx 26.02\text{ dB}$；[[omega0|相角过零中心频率]]：$\omega_0 = \sqrt{2 \times 10} = \sqrt{20} \approx 4.472\text{ rad/s}$。`,
            },
          ],
        },
        { kind: 'p', text: '**4.2 [[slope_table|转折频率与分段斜率叠加表]]**' },
        {
          kind: 'table',
          head: ['频率区间（rad/s）', '活跃因子斜率贡献（dB/dec）', '合成幅频斜率', '相频斜率（°/dec）'],
          rows: [
            [R`$\omega < 0.2$`, R`$(j\omega): +20$`, R`$+20\text{ dB/dec}$`, R`$0^\circ/\text{dec}$（恒为 $+90^\circ$）`],
            [R`$0.2 < \omega < 1$`, R`$(j\omega): +20$`, R`$+20\text{ dB/dec}$`, R`$-45^\circ/\text{dec}$（$p_1$ 相角启动）`],
            [R`$1 < \omega < 2$`, R`$(j\omega): +20$`, R`$+20\text{ dB/dec}$`, R`$-90^\circ/\text{dec}$（$p_1, p_2$ 相角叠加）`],
            [
              R`$2 < \omega < 10$`,
              R`$(j\omega): +20,\ p_1: -20$`,
              R`**$0\text{ dB/dec}$（平顶 $26.02\text{ dB}$）**`,
              R`$-90^\circ/\text{dec}$（于 $\omega_0 \approx 4.47$ 过 $0^\circ$）`,
            ],
            [R`$10 < \omega < 20$`, R`$(j\omega): +20,\ p_1: -20,\ p_2: -20$`, R`$-20\text{ dB/dec}$`, R`$-90^\circ/\text{dec}$`],
            [R`$20 < \omega < 100$`, R`$(j\omega): +20,\ p_1: -20,\ p_2: -20$`, R`$-20\text{ dB/dec}$`, R`$-45^\circ/\text{dec}$（$p_1$ 相角结束）`],
            [R`$\omega > 100$`, R`$(j\omega): +20,\ p_1: -20,\ p_2: -20$`, R`$-20\text{ dB/dec}$`, R`$0^\circ/\text{dec}$（恒为 $-90^\circ$）`],
          ],
        },
        { kind: 'p', text: '**4.3 Python NumPy 全关键频率点精确核验表**' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授放大镜**：请特别注意 $\omega = 2$ 与 $\omega = 10$ 两处！单极点的理论转折偏差是 $-3.01\text{ dB}$，但因为本例中两个极点 $2$ 和 $10$ 只隔了 5 倍（不到 1 个十倍频程），另一个极点在转折处额外贡献了 $-0.17\text{ dB}$，所以[[err3|总偏差是 **$-3.18\text{ dB}$**]]（精确值 $22.84\text{ dB}$）；在中频几何中心 $\omega_0 = 4.472$ 处，精确峰值达到 $24.44\text{ dB}$（比渐近平顶低 $1.58\text{ dB}$），而[[omega0|精确相角分毫不差地穿过 **$0.00^\circ$**]]！`,
        },
        {
          kind: 'table',
          head: [R`角频率 $\omega$ (rad/s)`, '渐近幅值 (dB)', '精确幅值 (dB)', '幅值偏差 (dB)', '渐近相角 (°)', '精确相角 (°)', '相角偏差 (°)'],
          rows: [
            [R`$0.100$`, R`$0.00$`, R`$-0.01$`, R`$-0.01$`, R`$+90.00^\circ$`, R`$+86.56^\circ$`, R`$-3.44^\circ$`],
            [R`$0.200$`, R`$6.02$`, R`$5.98$`, R`$-0.04$`, R`$+90.00^\circ$`, R`$+83.14^\circ$`, R`$-6.86^\circ$`],
            [R`$1.000$`, R`$20.00$`, R`$18.99$`, R`$-1.01$`, R`$+58.55^\circ$`, R`$+57.72^\circ$`, R`$-0.82^\circ$`],
            [R`**$2.000$ ($\omega_{p1}$)**`, R`**$26.02$**`, R`**$22.84$**`, R`**$-3.18$**`, R`$+31.45^\circ$`, R`$+33.69^\circ$`, R`$+2.24^\circ$`],
            [R`**$4.472$ ($\omega_0$)**`, R`**$26.02$**`, R`**$24.44$**`, R`**$-1.58$**`, R`**$0.00^\circ$**`, R`**$0.00^\circ$**`, R`**$0.00^\circ$**`],
            [R`**$10.000$ ($\omega_{p2}$)**`, R`**$26.02$**`, R`**$22.84$**`, R`**$-3.18$**`, R`$-31.45^\circ$`, R`$-33.69^\circ$`, R`$-2.24^\circ$`],
            [R`$20.000$`, R`$20.00$`, R`$18.99$`, R`$-1.01$`, R`$-58.55^\circ$`, R`$-57.72^\circ$`, R`$+0.82^\circ$`],
            [R`$100.000$`, R`$6.02$`, R`$5.98$`, R`$-0.04$`, R`$-90.00^\circ$`, R`$-83.14^\circ$`, R`$+6.86^\circ$`],
            [R`$1000.000$`, R`$-13.98$`, R`$-13.98$`, R`$0.00$`, R`$-90.00^\circ$`, R`$-89.31^\circ$`, R`$+0.69^\circ$`],
          ],
        },
        { kind: 'p', text: '**4.4 幅频波特图（分量 + 渐近线 + 精确曲线）**' },
        { kind: 'figure', svg: SVG_ACT4_MAG, caption: '复合传递函数 H(ω) = 200jω / [(jω+2)(jω+10)] 幅频波特图（渐近线 vs 精确曲线）' },
        { kind: 'p', text: '**4.5 相频波特图（分量 + 渐近线 + 精确曲线）**' },
      ],
      inline_svg: SVG_ACT4_PHASE,
      figure_caption: '复合传递函数 H(ω) = 200jω / [(jω+2)(jω+10)] 相频波特图（渐近线 vs 精确曲线）',
    },
    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '苏格拉底式分步交互例题',
      sync: at(L2, ['corner'], { [P.preset]: 'guided', [P.w]: 1 }),
      blocks: [
        {
          kind: 'formula',
          title: R`现在轮到你上手实战！我们把第二个极点推远到 $\omega_{p2} = 100\text{ rad/s}$，组成宽带带通网络：`,
          tex: R`\mathbf{H}(\omega) = \frac{2000\,j\omega}{(j\omega + 2)(j\omega + 100)}`,
        },
        {
          kind: 'guided',
          title: '多因子复合传递函数波特图五步拆解实战',
          problem: R`已知某宽带带通放大网络的频率传递函数为 $\mathbf{H}(\omega) = \frac{2000\,j\omega}{(j\omega + 2)(j\omega + 100)}$。请按波特图标准流程完成：化标准形式、定低频增益、划转折频率、画幅频渐近线与相频渐近线。`,
          problem_svg: SVG_GUIDED_PROBLEM,
          steps: [
            {
              title: '第一步：化为波特图标准形式并提取常数增益 K',
              mini_svg: MINI_STEP1,
              question: R`要画出波特图，切忌直接把分子的 2000 当作常数增益！请把分母中的两个一阶因子 $(j\omega+2)$ 与 $(j\omega+100)$ 化为 $(1 + j\omega/\omega_c)$ 的标准形式，化简后整体常数增益 $K$ 是多少？`,
              hint: R`$K = \frac{2000}{2 \times 100} = 10, \quad \mathbf{H}(\omega) = \frac{10\,j\omega}{\left(1 + j\frac{\omega}{2}\right)\left(1 + j\frac{\omega}{100}\right)}$`,
              options: [
                {
                  text: '$K = 2000$',
                  correct: false,
                  feedback: R`停一下！你直接把分子的 2000 抄下来了，却忘了分母括号里还藏着常数 2 和 100。不把它们提出来变成 $(1 + j\omega/\omega_c)$，低频直流项就不是 1，整个增益基准会高出整整 46 dB！`,
                },
                {
                  text: '$K = 100$',
                  correct: false,
                  feedback: R`差一点！你只除以了 20。分母是 $(j\omega+2)(j\omega+100) = 2(1+j\omega/2)\cdot 100(1+j\omega/100)$，两项常数相乘是 $2\times 100 = 200$。`,
                },
                {
                  text: '$K = 10$',
                  correct: true,
                  feedback: '非常精准！提取分母常数 2×100 = 200 后，K = 2000 / 200 = 10。记住：先化标准形式再读 K，是画波特图的第一铁律。',
                },
                { text: '$K = 20$', correct: false, feedback: '注意核对除法：2000 除以 (2×100) 等于 2000 / 200，不是 20 哦，再算一次。' },
              ],
              board: [R`\mathbf{H}(\omega) = \frac{10\,j\omega}{\left(1 + j\frac{\omega}{2}\right)\left(1 + j\frac{\omega}{100}\right)},`, R`K = 10`],
              halo: ['std_form', 'k_gain'],
              params: G(0, { [P.view]: 'std' }),
              layer: L1,
            },
            {
              title: '第二步：确定低频段（ω < 2 rad/s）的起始斜率与参考锚点',
              mini_svg: MINI_STEP2,
              question: R`在远低于第一个转折频率 $\omega_{p1} = 2\text{ rad/s}$ 的低频段，两个极点因子都近似为 1，只剩下 $10\,j\omega$。请问低频渐近线的斜率，以及它在 $\omega = 1\text{ rad/s}$ 处的渐近分贝值分别是多少？`,
              hint: R`$H_{\text{dB,low}}(\omega) = 20\log_{10}(10) + 20\log_{10}(\omega) = 20 + 20\log_{10}(\omega) \implies H_{\text{dB,low}}(1) = 20\text{ dB}$`,
              options: [
                {
                  text: '斜率 0 dB/dec，在 ω = 1 处为 20 dB',
                  correct: false,
                  feedback: R`别漏掉分子上的原点零点 $(j\omega)$！如果只有常数 10 才是水平线 0 dB/dec，乘上 $j\omega$ 后低频段是一条向上爬坡的斜线。`,
                },
                {
                  text: '斜率 +20 dB/dec，在 ω = 1 处为 20 dB',
                  correct: true,
                  feedback: R`漂亮！$20\log_{10}(10) = +20$ dB，而原点零点 $(j\omega)$ 在 $\omega=1$ 处恰好贡献 $20\log_{10}(1) = 0$ dB 且斜率为 +20 dB/dec。两者相加：过点 (1, 20 dB) 且以 +20 dB/dec 上升！`,
                },
                {
                  text: '斜率 +20 dB/dec，在 ω = 1 处为 0 dB',
                  correct: false,
                  feedback: R`原点零点 $(j\omega)$ 单独在 $\omega=1$ 处确实是 0 dB，但别忘了前面还有常数 $K=10$ 把整条线向上平移了 +20 dB！`,
                },
                {
                  text: '斜率 −20 dB/dec，在 ω = 1 处为 20 dB',
                  correct: false,
                  feedback: R`注意 $j\omega$ 在分子上，属于原点零点而非原点极点，频率越高幅值越大，斜率应为正值。`,
                },
              ],
              board: [R`\omega < 2\text{ rad/s}: \quad \text{斜率 } +20\text{ dB/dec},`, R`\text{锚点 } (\omega=1,\ 20.00\text{ dB})`],
              halo: ['f_k', 'f_origin', 'cursor'],
              params: G(1, { [P.w]: 1, [P.off]: [] }),
              layer: L3,
            },
            {
              title: '第三步：逐段累加幅频斜率并求中频平顶增益',
              mini_svg: MINI_STEP3,
              question: R`越过 $\omega_{p1} = 2\text{ rad/s}$ 后，系统进入中频段 $2 < \omega < 100\text{ rad/s}$；越过 $\omega_{p2} = 100\text{ rad/s}$ 后进入高频段。请问中频段与高频段的合成斜率，以及中频平顶的渐近增益值分别是多少？`,
              hint: R`$H_{\text{dB,asym}}(2) = 20 + 20\log_{10}(2) \approx 26.02\text{ dB}; \quad \text{斜率变化：}+20 \xrightarrow{\omega=2} 0 \xrightarrow{\omega=100} -20\text{ dB/dec}$`,
              options: [
                {
                  text: '中频 0 dB/dec（平顶 26.02 dB），高频 −20 dB/dec',
                  correct: true,
                  feedback: R`完全正确！从 $\omega=1$ 到 $\omega=2$ 翻了一倍（1 个倍频程），按 +20 dB/dec 爬升了 $20\log_{10}(2) \approx +6.02$ dB，到达 20 + 6.02 = 26.02 dB 后被第一极点拉平为 0 dB/dec，到 $\omega=100$ 再被第二极点掰成 −20 dB/dec。`,
                },
                {
                  text: '中频 0 dB/dec（平顶 20.00 dB），高频 −20 dB/dec',
                  correct: false,
                  feedback: R`斜率全对，但平顶高度算漏了一小段！20 dB 是 $\omega=1$ 处的高度，渐近线要一直以 +20 dB/dec 爬升到 $\omega=2$ 才拐弯，所以要加上 $20\log_{10}(2) \approx 6.02$ dB！`,
                },
                {
                  text: '中频 +20 dB/dec，高频 0 dB/dec',
                  correct: false,
                  feedback: R`分母的 $(1 + j\omega/2)$ 是极点，每个一阶极点在转折频率后贡献的是 −20 dB/dec，而不是 +20 dB/dec。`,
                },
                {
                  text: '中频 −20 dB/dec，高频 −40 dB/dec',
                  correct: false,
                  feedback: '别忘了低频段起始斜率是 +20 dB/dec！加上第一个极点的 −20 dB/dec 后，中频净斜率是 (+20) + (−20) = 0 dB/dec。',
                },
              ],
              board: [R`2 < \omega < 100:\ 0\text{ dB/dec}\ (26.02\text{ dB});`, R`\omega > 100:\ -20\text{ dB/dec}`],
              halo: ['f_origin', 'f_p1', 'f_p2', 'slope_table'],
              params: G(2, { [P.off]: [], [P.w]: 10 }),
              layer: L3,
            },
            {
              title: '第四步：在转折频率处做 −3 dB 精确曲线修正',
              mini_svg: MINI_STEP4,
              question: R`直线渐近线画好后，我们需要手绘平滑的精确幅频曲线。由于本例中两个极点 $\omega_{p1}=2$ 与 $\omega_{p2}=100$ 相距整整 50 倍（远大于 1 个十倍频程），彼此几乎互不干扰。请问在 $\omega = 2\text{ rad/s}$ 和 $\omega = 100\text{ rad/s}$ 两处的精确幅值大约是多少？`,
              hint: R`$|\mathbf{H}(2)|_{\text{dB}} \approx 26.02 - 3.01 = 23.01\text{ dB}, \quad |\mathbf{H}(100)|_{\text{dB}} \approx 26.02 - 3.01 = 23.01\text{ dB}$`,
              options: [
                {
                  text: '均为 29.03 dB（向上偏离 +3.01 dB）',
                  correct: false,
                  feedback: R`方向反啦！向上偏离 +3.01 dB 是一阶零点 $(1+j\omega/\omega_c)$ 的特征；这里是极点 $1/(1+j\omega/\omega_c)$，精确曲线应弯在渐近线下方。`,
                },
                {
                  text: '均为 26.02 dB（无偏差）',
                  correct: false,
                  feedback: R`在转折频率 $\omega=\omega_c$ 处，$|1 + j1| = \sqrt{2}$，因此 $20\log_{10}(1/\sqrt{2}) = -3.01$ dB，精确曲线不会贴着尖角走。`,
                },
                {
                  text: '均为 20.00 dB（向下偏离 −6.02 dB）',
                  correct: false,
                  feedback: R`−6.02 dB 是二重实极点 $(1+j\omega/\omega_c)^{-2}$ 的转折偏差，这里两个极点分别是单极点且相距很远。`,
                },
                {
                  text: '均为 23.01 dB（向下偏离 −3.01 dB）',
                  correct: true,
                  feedback:
                    '丝滑准确！26.02 − 3.01 = 23.01 dB。而且 NumPy 精确验算显示，由于 2 与 100 相隔 50 倍，另一极点在转折处的附加衰减仅 0.002 dB，精确值稳稳落在 23.01 dB！',
                },
              ],
              board: [R`|\mathbf{H}(2)|_{\text{dB}} = |\mathbf{H}(100)|_{\text{dB}} = 23.01\text{ dB}`, R`(\text{相对渐近线 }-3.01\text{ dB})`],
              halo: ['corner', 'err3'],
              params: G(3, { [P.w]: 2, [P.asym]: true, [P.exact]: true, [P.err]: true }),
              layer: L2,
            },
            {
              title: R`第五步：画出相频波特图并定位 $0^\circ$ 相移中心频率`,
              mini_svg: MINI_STEP5,
              question: R`最后看相频响应 $\angle\mathbf{H}(\omega)$：原点零点 $(j\omega)$ 恒定贡献 $+90^\circ$，两个一阶实极点分别在 $[0.2, 20]$ 与 $[10, 1000]\text{ rad/s}$ 区间内各以 $-45^\circ/\text{dec}$ 线性下降 $90^\circ$。请问极低频与极高频的渐近相角，以及精确相角恰好穿过 $0^\circ$ 的频率 $\omega_0$ 分别是多少？`,
              hint: R`$\angle\mathbf{H}(\omega) = 90^\circ - \arctan\left(\frac{\omega}{2}\right) - \arctan\left(\frac{\omega}{100}\right) = 0^\circ \iff \omega_0 = \sqrt{2 \times 100} \approx 14.14\text{ rad/s}$`,
              options: [
                {
                  text: R`由 $0^\circ$ 降至 $-180^\circ$，中心频率 $\omega_0 = 51\text{ rad/s}$`,
                  correct: false,
                  feedback: R`忘了原点零点 $(j\omega)$ 自带的 $+90^\circ$ 相移啦！所以起点是 $+90^\circ$，两个极点总共拉低 $180^\circ$，终点是 $+90^\circ - 180^\circ = -90^\circ$。`,
                },
                {
                  text: R`由 $+90^\circ$ 降至 $-90^\circ$，中心频率 $\omega_0 = (2+100)/2 = 51\text{ rad/s}$`,
                  correct: false,
                  feedback: R`起止相角对了，但注意波特图横轴是对数坐标！对称中心是几何平均 $\sqrt{p_1 p_2} \approx 14.14\text{ rad/s}$，而不是算术平均 $51\text{ rad/s}$。`,
                },
                {
                  text: R`由 $+90^\circ$ 降至 $-90^\circ$，中心频率 $\omega_0 = \sqrt{2\times 100} \approx 14.14\text{ rad/s}$`,
                  correct: true,
                  feedback: R`满分收官！对数坐标上的中点不是算术平均，而是几何平均 $\omega_0 = \sqrt{2\times 100} = \sqrt{200} \approx 14.14\text{ rad/s}$。在 $\omega_0$ 处，$\arctan(\omega_0/2) + \arctan(\omega_0/100) = 90^\circ$，恰好抵消原点零点的 $+90^\circ$，实现 $0^\circ$ 相移！`,
                },
                {
                  text: R`由 $+90^\circ$ 降至 $0^\circ$，中心频率 $\omega_0 = 10\text{ rad/s}$`,
                  correct: false,
                  feedback: R`每个实极点总共贡献 $-90^\circ$ 相移，两个实极点总共贡献 $-180^\circ$，从 $+90^\circ$ 减去 $180^\circ$ 会降到 $-90^\circ$ 而不是 $0^\circ$。`,
                },
              ],
              board: [R`\angle\mathbf{H}(\omega): +90^\circ \xrightarrow{\omega_0 = \sqrt{200} \approx 14.14} 0^\circ \xrightarrow{\omega \to \infty} -90^\circ`],
              halo: ['phase_plot', 'f_origin', 'f_p1', 'f_p2'],
              params: G(4, { [P.w]: 10 }),
              layer: L2,
            },
          ],
          done_params: { [P.g]: 5 },
          conclusion: R`通关！$K = 10$；低频 $+20\text{ dB/dec}$ 过 $(1,\ 20\text{ dB})$，$\omega = 2$ 起平顶 $26.02\text{ dB}$，$\omega = 100$ 起 $-20\text{ dB/dec}$；两个转折处的精确值都是 $23.01\text{ dB}$；相角从 $+90^\circ$ 经 $\omega_0 = \sqrt{200} \approx 14.14\text{ rad/s}$ 的 $0^\circ$ 降到 $-90^\circ$。左侧波特图与逐项叠加面板已全部揭晓（拖动游标到 $\omega_0$ 看相角过零），下面是这道题的参考幅频图。`,
        },
        { kind: 'p', text: '**通关复盘：引导例题的精确幅频参考图**' },
        {
          kind: 'figure',
          svg: SVG_GUIDED_REVIEW,
          caption: '苏格拉底例题 H(ω) = 2000jω / [(jω+2)(jω+100)] 幅频波特图参考：两个极点相隔 50 倍，转折处各自只偏离 −3.01 dB',
        },
      ],
    },
    /* ------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '诊断测验',
      sync: at(L2, [], { [P.preset]: 'ex4', [P.w]: 2 }),
      blocks: [{ kind: 'p', text: '**6.1 四题诊断测验（即时纠偏与掌握度验收）**' }],
      inline_svg: SVG_ACT6,
      figure_caption: '诊断测验：四道题，四个考点',
      quiz: [
        {
          id: 'w5l7_q1',
          concept: '半功率点与 −3 dB',
          review_act: 2,
          question: R`某放大器在截止频率 $\omega_c$ 处的输出电压幅值下降为中频最大值的 $\frac{1}{\sqrt{2}} \approx 0.707$。假设负载电阻不变，此时输出功率与分贝增益变化量分别是多少？`,
          options: [
            { key: 'A', text: '输出功率降为原来的 1/2，增益下降约 3.01 dB', correct: true },
            {
              key: 'B',
              text: '输出功率降为原来的 0.707，增益下降约 3.01 dB',
              correct: false,
              feedback: R`0.707 是电压比，不是功率比：负载 $R$ 不变时 $P \propto V^2$，功率要按平方缩小，$(1/\sqrt{2})^2 = 1/2$。`,
            },
            {
              key: 'C',
              text: '输出功率降为原来的 1/2，增益下降约 6.02 dB',
              correct: false,
              feedback: R`功率减半是对的，但半功率对应 $10\log_{10}(1/2) \approx -3.01\text{ dB}$；$-6.02\text{ dB}$ 是电压降为一半（功率降为 1/4）的情形。`,
            },
            {
              key: 'D',
              text: '输出功率降为原来的 1/4，增益下降约 6.02 dB',
              correct: false,
              feedback: R`1/4 功率、$-6.02\text{ dB}$ 是电压降到 $1/2$ 倍时的结果；这里电压只降到 $1/\sqrt{2}$ 倍，平方后功率是 $1/2$。`,
            },
          ],
          feedback_correct: R`负载电阻 $R$ 不变时，$P \propto V^2$，电压变为 $1/\sqrt{2}$ 倍则功率变为 $(1/\sqrt{2})^2 = 1/2$（半功率点）。按功率分贝公式 $10\log_{10}(1/2) \approx -3.01\text{ dB}$，按电压分贝公式 $20\log_{10}(1/\sqrt{2}) \approx -3.01\text{ dB}$，两者严格等价。`,
          feedback_wrong: '回到第 2 幕的半功率点：电压比、功率比和 dB 三者怎么换算？',
          figure: SVG_Q1,
          sync: { layer: L1, halo: ['half_power'], params: { [P.view]: 'db', [P.ratio]: 1 } },
        },
        {
          id: 'w5l7_q2',
          concept: '标准形式提取常数 K',
          review_act: 3,
          question: R`将传递函数 $\mathbf{H}(\omega) = \frac{50(j\omega + 4)}{(j\omega + 2)(j\omega + 20)}$ 化为波特图标准形式后，常数增益 $K$ 及其对应的分贝值 $20\log_{10}K$ 是多少？`,
          options: [
            {
              key: 'A',
              text: 'K = 50，对应 +33.98 dB',
              correct: false,
              feedback: R`50 只是分子前面的系数：分子的 $(j\omega + 4)$ 里还能提出 4，分母的两个括号里还要提出 2 和 20，它们都要并进 $K$。`,
            },
            {
              key: 'B',
              text: 'K = 10，对应 +20.00 dB',
              correct: false,
              feedback: R`$50 \times 4 / 20 = 10$：你只除掉了分母里的 20，漏了 $(j\omega + 2) = 2(1 + j\omega/2)$ 里的 2。`,
            },
            {
              key: 'C',
              text: 'K = 1.25，对应 +1.94 dB',
              correct: false,
              feedback: R`$50 / (2 \times 20) = 1.25$：分母的常数提对了，却漏了分子 $(j\omega + 4) = 4(1 + j\omega/4)$ 里的 4。零点因子也要化成 $(1 + j\omega/\omega_c)$。`,
            },
            { key: 'D', text: 'K = 5，对应 +13.98 dB', correct: true },
          ],
          feedback_correct: R`将分子与分母所有一阶因子化为 $(1 + j\omega/\omega_c)$：$K = \frac{50 \times 4}{2 \times 20} = \frac{200}{40} = 5$，因此 $20\log_{10}(5) \approx +13.98\text{ dB}$。`,
          feedback_wrong: '分子、分母里的每个 (jω + p) 都要先写成 p(1 + jω/p)，再把所有常数合并。',
          figure: SVG_Q2,
          sync: { layer: L1, halo: ['std_form', 'k_gain'], params: { [P.view]: 'std', [P.preset]: 'ex4' } },
        },
        {
          id: 'w5l7_q3',
          concept: '由斜率反推零极点',
          review_act: 4,
          question: R`观察某电路的幅频波特图渐近线：在 $\omega < 10\text{ rad/s}$ 时为水平线（$0\text{ dB/dec}$）；在 $10 < \omega < 100\text{ rad/s}$ 区间斜率变为 $-20\text{ dB/dec}$；当 $\omega > 100\text{ rad/s}$ 时斜率恢复为 $0\text{ dB/dec}$。该传递函数包含哪些非原点零极点？`,
          options: [
            {
              key: 'A',
              text: 'ω = 10 处有一个零点，ω = 100 处有一个极点',
              correct: false,
              feedback: R`零点会让斜率增加 $+20\text{ dB/dec}$；可在 $\omega = 10$ 处斜率从 0 变成 $-20$，变化量是 $-20$，那是极点的特征；$\omega = 100$ 处则反过来。`,
            },
            {
              key: 'B',
              text: 'ω = 10 与 ω = 100 处各有一个极点',
              correct: false,
              feedback: R`若 $\omega = 100$ 处还是极点，斜率会继续下降到 $-40\text{ dB/dec}$；图中却恢复为 $0$，说明那里的斜率变化是 $+20\text{ dB/dec}$。`,
            },
            { key: 'C', text: 'ω = 10 处有一个极点，ω = 100 处有一个零点', correct: true },
            {
              key: 'D',
              text: 'ω = 10 处有一个二重极点，ω = 100 处有一个零点',
              correct: false,
              feedback: R`二重极点在 $\omega = 10$ 处会让斜率一次下降 $-40\text{ dB/dec}$，可图中只降到 $-20\text{ dB/dec}$；而且之后一个零点也只能把它抬回 $-20$，回不到 $0$。`,
            },
          ],
          feedback_correct: R`斜率变化规律为：在 $\omega=10$ 处斜率变化量 $\Delta m = -20\text{ dB/dec}$，说明此处有一个一阶极点；在 $\omega=100$ 处斜率由 $-20$ 变回 $0$，变化量 $\Delta m = +20\text{ dB/dec}$，说明此处有一个一阶零点。`,
          feedback_wrong: '看每个转折处斜率的变化量：每个一阶极点带来 −20 dB/dec，每个一阶零点带来 +20 dB/dec。',
          figure: SVG_Q3,
          sync: { layer: L3, halo: ['slope_table'], params: { [P.preset]: 'ex4', [P.off]: [] } },
        },
        {
          id: 'w5l7_q4',
          concept: '二阶极点与谐振尖峰',
          review_act: 3,
          question: R`对于标准二阶低通环节 $\mathbf{H}(\omega) = \frac{1}{1 + j2\zeta(\omega/\omega_n) - (\omega/\omega_n)^2}$，下列关于其幅频波特图特征的说法哪一项是正确的？`,
          options: [
            {
              key: 'A',
              text: '高频渐近线斜率为 −20 dB/dec，任何 ζ < 1 都会出现谐振尖峰',
              correct: false,
              feedback: R`$-20\text{ dB/dec}$ 是一阶极点的高频斜率；二阶共轭极点是两阶叠加，$-40\text{ dB/dec}$。尖峰也不是 $\zeta < 1$ 就有：$1/\sqrt{2} \le \zeta < 1$ 时 $1 - 2\zeta^2 \le 0$，没有谐振峰。`,
            },
            { key: 'B', text: '高频渐近线斜率为 −40 dB/dec，仅当 ζ < 1/√2 ≈ 0.707 时才出现谐振尖峰', correct: true },
            {
              key: 'C',
              text: R`高频渐近线斜率为 −40 dB/dec，当 ζ = 0.707 时在 $\omega_n$ 处谐振峰值最高`,
              correct: false,
              feedback: R`斜率对了，但 $\zeta = 0.707$ 恰是最平坦（巴特沃斯）响应：$1 - 2\zeta^2 = 0$，没有尖峰，$\omega_n$ 处是 $-3.01\text{ dB}$；$\zeta$ 越小，峰才越高。`,
            },
            {
              key: 'D',
              text: '高频渐近线斜率为 −60 dB/dec，相角最终稳定在 −270°',
              correct: false,
              feedback: R`$-60\text{ dB/dec}$ 与 $-270^\circ$ 属于三阶系统；二阶共轭极点的高频斜率是 $-40\text{ dB/dec}$，相角从 $0^\circ$ 过渡到 $-180^\circ$。`,
            },
          ],
          feedback_correct: R`二阶共轭极点在 $\omega > \omega_n$ 后的高频渐近斜率为 $-40\text{ dB/dec}$，相角从 $0^\circ$ 过渡到 $-180^\circ$。由谐振频率公式 $\omega_r = \omega_n\sqrt{1 - 2\zeta^2}$ 可知，仅当 $1 - 2\zeta^2 > 0$ 即 $\zeta < 1/\sqrt{2} \approx 0.707$ 时才会出现幅值大于 $0\text{ dB}$ 的谐振尖峰。`,
          feedback_wrong: R`回到第 3 幕的第 4 块积木：它的高频斜率是多少？$\omega_r$ 的根号里什么时候为正？`,
          figure: SVG_Q4,
          sync: { layer: L2, halo: ['peak'], params: { [P.preset]: 'block', [P.block]: 'quad', [P.w]: 10 } },
        },
      ],
    },
  ],
};

export default W5_L7;
