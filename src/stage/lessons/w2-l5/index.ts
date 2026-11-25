// W2-L5 · 线性性质与叠加定理 (lesson sheet: docs/lessons/W2-L5.md).
// The professor's text, formulas, the act diagrams (svgs.ts), the guided example and the
// self-test are reproduced from the sheet. Changes from the sheet, all of form, none of wording:
// - `$$…$$` display formulas sit in the ② blue / ③ green cards, the lead-in sentence as the
//   card's title; the display formula inside acts 1 and 4's ① runs inline in its card; the
//   bullets of act 2's ① follow the card;
// - the professor's opening (教授开场白) opens act 1; the section headings (1.1 …) are bold lines;
// - anti-spoiler: act 5's 反例 B is the act 6 challenge (18 V / 3 A↓ / 4 Ω / 2 Ω: i₁ = 3 A,
//   i₂ = −2 A, p = 2 W). Act 5 shows its diagram's left panel and the 反例 A calculation; the
//   full two-panel diagram and the 反例 B calculation follow the guided example in act 6 as the
//   通关复盘 board (as W1-L4 act 5);
// - in the guided example and the quiz, sheet symbols written with an underscore (i_o, p_1, …)
//   are set in TeX; the step prompts split into a title and the question;
// - the sheet's 6.4 engineering checklist is build instructions, not lesson text (left out);
// - [[id|…]] only links a term to the stage (the words are unchanged);
// - added (the sheet has none): the hover map; the right-answer remarks of the guided example and
//   its closing line; feedback for each wrong quiz option (from the sheet's explanations);
//   diagrams for the four quiz questions; the k (homogeneity) slider on layer 02 for act 1.

import { lazy } from 'react';
import type { StageLesson } from '../../types';
import { L1, L2, L3 } from './parts';
import { SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './quizFigures';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT5_A, SVG_ACT6 } from './svgs';

const SourceKillLayer = lazy(() => import('./SourceKillLayer'));
const AccumulatorLayer = lazy(() => import('./AccumulatorLayer'));
const PowerLayer = lazy(() => import('./PowerLayer'));

/** every act and quiz item drops a guided step's layer request (w5_layer, see parts.tsx) */
const free = { w5_layer: null };

const W2_L5: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: SourceKillLayer, [L2]: AccumulatorLayer, [L3]: PowerLayer },
  lesson_meta: {
    lesson_id: 'W2-L5',
    world: 'World 2 · 网络分析与电路定理',
    title: '线性性质与叠加定理',
    subtitle: 'Linearity & Superposition：一次只开一个独立源，分别求解，再带符号相加——受控源绝不置零，功率绝不直接叠加',
    lesson_type: 'B',
    lesson_type_label: 'Type B（纯公式/方法论课 · 2D 交互原理图驱动）',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Section 4.1–4.3 Linearity Property & Superposition（含 Example 4.3）'],
    },
    textbook_supplement: 'Introductory Circuit Analysis, 14th Ed. (Boylestad) — Chapter 9 Superposition Theorem（多水泵水压/水流直觉）',
    prerequisites: ['W1-L2 功率与受控源', 'W1-L7 分压分流', 'W2-L1 节点分析法'],
    next_lesson: 'W2-L6',
    next_lesson_title: '电源变换',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 独立源一键置零演示 (短路/开路)',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '拨动两个开关给独立源“关机”：电压源置零 → 洋红短路线（v = 0 V），电流源置零 → 虚线断口（i = 0 A）；紫色菱形受控源锁定在原位，点它听教授怎么说。',
      },
      {
        id: L2,
        label: '02 分电路求解与分量累加台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '在原电路、子电路 1、子电路 2 与代数叠加对照之间切换；“同向增强”是 Sadiku Ex 4.3，“反向抵消”是第 6 幕实战题；k 滑块把所有独立源同乘 k。',
      },
      {
        id: L3,
        label: '03 功率不可叠加反例对比台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '拖动 i₁、i₂：上方三根柱子比较错误叠加 p₁ + p₂、交叉项 2i₁i₂R 与真实功率；下方抛物线 p = R·i² 上，空心点与实心点之间的落差就是交叉项。',
      },
    ],
    hover_map: {
      hl_vs: { label: '独立电压源 Vs', desc: '圆形符号，上正下负；置零 = 强制两端 v = 0 = 一根短路线' },
      hl_is: { label: '独立电流源 Is', desc: '圆形符号带箭头；置零 = 强制支路 i = 0 = 开路断口' },
      hl_dep: { label: '受控源 2iₓ（CCCS，菱形）', desc: '电路内部的线性耦合关系（电导矩阵 G 的一部分）：每个子电路里都原位保留，绝不置零' },
      hl_r1: { label: '电阻 R₁', desc: '与电压源串联，接到顶节点' },
      hl_r2: { label: '电阻 R₂（待求支路）', desc: '待求电压 v（上正下负）与向下电流 i 都在这条支路上' },
      hl_short: { label: '置零的电压源 → 短路线', desc: 'v = 0 V，但允许任意电流通过：两端电位相等' },
      hl_open: { label: '置零的电流源 → 开路断口', desc: 'i = 0 A，但两端允许存在任意电压：支路完全断流' },
      hl_readout: { label: '分量累加读数', desc: 'v = v′ + v″，i = i′ + i″：各分量带符号代数相加' },
      hl_scale: { label: '齐次性缩放 k', desc: '所有独立源同乘 k：每个电压、电流都乘 k，功率却乘 k²' },
      hl_wrong_sum: { label: '错误叠加 p₁ + p₂', desc: '把各子电路里的功率直接相加：漏掉了交叉项' },
      hl_cross: { label: '交叉项 2i₁i₂R', desc: 'i₁、i₂ 同号为正（真实功率更大），异号为负（真实功率更小）' },
      hl_true_p: { label: '真实总功率 p = (i₁ + i₂)²R', desc: '先叠加总电流，再平方乘电阻' },
      hl_parabola: { label: '抛物线 p(i) = R·i²', desc: '二次函数：既不满足齐次性，也不满足可加性' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '为什么多电源电路可以“分而治之”？——线性性质与水泵直觉',
      sync: { layer: L2, halo: ['hl_scale'], params: { ...free, w5_mode: 'AIDING', w5_tab: 'total', w5_k: 1 } },
      blocks: [
        {
          kind: 'p',
          text: '**教授开场白**：同学们，上一周我们学了节点分析法和网孔分析法，它们就像“重型推土机”，不管电路里有几个电源，列出一堆联立方程总能硬推出来。但今天我要教给你们一把电路分析界的“外科手术刀”——**叠加定理（Superposition Theorem）**。当你面对一个同时挂着电压源和电流源的线性电路时，你根本不必同时被它们两个折磨：**一次只开一个独立源，把其余独立源统统“关机”，分别算出简单分电路的响应，最后直接相加！** 但这把手术刀有两条带电的红线：第一，[[hl_dep|**受控源绝不能关机**]]；第二，[[hl_wrong_sum|**功率绝对不能直接叠加**]]。今天我们用六幕把它彻底讲透。',
        },
        { kind: 'p', text: '**1.1 教学直觉（Boylestad 水泵类比）**' },
        { kind: 'p', text: '想象一片由平滑直管道组成的水网（对应纯电阻线性网络），同时接了两台水泵：' },
        {
          kind: 'ul',
          items: [
            String.raw`**水泵 A**（独立电源 1）单独开启时，把出水口水压推高了 $2\text{ m}$，水流速度为 $0.5\text{ L/s}$；`,
            String.raw`**水泵 B**（独立电源 2）单独开启时，把同一个出水口水压推高了 $8\text{ m}$，水流速度为 $2.0\text{ L/s}$。`,
          ],
        },
        {
          kind: 'p',
          text: String.raw`如果管道是**理想线性管道**（水压与水流严格成正比，没有单向阀、没有湍流阻力突变），那么两台水泵同时开启时，出水口的总水压就精准等于 $2 + 8 = 10\text{ m}$，总水流就精准等于 $0.5 + 2.0 = 2.5\text{ L/s}$。这就是电路中**线性（Linearity）**赋予我们的超能力。`,
        },
        { kind: 'p', text: '**1.3 三段式教授板书推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: String.raw`一个电路被称为**线性电路（Linear Circuit）**，当且仅当它仅由线性元件（如定值电阻 $v = iR$）、线性受控源和独立源组成。当我们对这样的电路列写 KCL 与 KVL 时，得到的是一组**线性代数方程组**：$\mathbf{G}\mathbf{v} = \mathbf{i}_s$ 其中电导矩阵 $\mathbf{G}$ 仅取决于电阻值与线性受控源的增益系数，与独立源向量 $\mathbf{i}_s$ 无关。由线性代数的基本性质，矩阵逆映射 $\mathbf{v} = \mathbf{G}^{-1}\mathbf{i}_s$ 天然满足[[hl_scale|**齐次性**]]与[[hl_readout|**可加性**]]——这就是叠加定理成立的数学根基！如果电路中混入了二极管、饱和电感或计算对象是二次量（如功率 $p = i^2 R$），映射不再是线性矩阵乘法，叠加定理立刻失效。`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式（General Formula）：设电路响应（某支路电压或电流）是激励（独立源）的映射 $y = \mathcal{L}(x)$，则线性性质严格等价于同时满足以下两条公理：`,
          tex: String.raw`\begin{gathered} \text{齐次性（Homogeneity）：}\quad \mathcal{L}(k x) = k\,\mathcal{L}(x) \\ \text{可加性（Additivity）：}\quad \mathcal{L}(x_1 + x_2) = \mathcal{L}(x_1) + \mathcal{L}(x_2) \end{gathered}`,
        },
        {
          kind: 'formula',
          title: '合并为线性叠加通式（对任意 $N$ 个独立源）：',
          tex: String.raw`\mathcal{L}\!\left(\sum_{j=1}^{N} k_j x_j\right) = \sum_{j=1}^{N} k_j\,\mathcal{L}(x_j)`,
        },
        { kind: 'formula', title: '对纯电阻分压器，输出电压与输入电压的符号关系为：', tex: String.raw`v_o = \frac{R_2}{R_1 + R_2}\,v_s` },
        {
          kind: 'calc',
          title: String.raw`③ 代入数值 · 逐步化简（Step-by-Step Calculation）：在图 1 左侧分压电路中，取 $R_1 = 4\ \Omega$、$R_2 = 6\ \Omega$，验证齐次性：`,
          steps: [
            {
              label: 'Step 1',
              text: String.raw`当输入 $v_s = 10\text{ V}$ 时：`,
              tex: String.raw`v_{o1} = \frac{6}{4 + 6} \times 10 = \frac{6}{10} \times 10 = 6\text{ V}, \qquad i_1 = \frac{10}{4 + 6} = 1\text{ A}`,
            },
            {
              label: 'Step 2',
              text: String.raw`将输入放大 $k = 3$ 倍，令 $v_s' = 3 \times 10 = 30\text{ V}$：`,
              tex: String.raw`v_{o2} = \frac{6}{4 + 6} \times 30 = 18\text{ V} = 3\,v_{o1}, \qquad i_2 = \frac{30}{10} = 3\text{ A} = 3\,i_1`,
            },
            {
              label: 'Step 3',
              text: String.raw`**警钟预埋**：顺手看一眼电阻 $R_2$ 的功率变化——输入放大 $3$ 倍时，$p_1 = i_1^2 R_2 = 1^2 \times 6 = 6\text{ W}$，而 $p_2 = i_2^2 R_2 = 3^2 \times 6 = 54\text{ W} = 9\,p_1 \neq 3\,p_1$！[[hl_scale|功率按 $k^2$ 缩放]]，**从第一幕起它就不满足齐次性**。`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '图 1 · 线性电路的两大支柱：齐次性（比例缩放）与可加性（多源叠加）',
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '叠加定理的核心手术——独立源如何“置零”？（短路 vs. 开路）',
      sync: { layer: L1, halo: ['hl_short', 'hl_open'], params: { ...free, w5_vs: 'SHORT_ZERO', w5_is: 'OPEN_ZERO' } },
      blocks: [
        { kind: 'p', text: '**2.1 教授点拨：别死记硬背！看“谁等于零”**' },
        { kind: 'p', text: '很多同学初学叠加定理时，最容易把“电压源短路、电流源开路”记反。我教你们一个**永远不会记混的物理判据**：' },
        {
          kind: 'ul',
          items: [
            String.raw`**把[[hl_vs|独立电压源]]“置零”** $\implies$ 强制其两端电压 $v_s = 0\text{ V}$，但允许任意电流通过 $\implies$ 两端电位相等 $\implies$ [[hl_short|**理想导线（短路，Short Circuit）**]]！`,
            String.raw`**把[[hl_is|独立电流源]]“置零”** $\implies$ 强制其支路电流 $i_s = 0\text{ A}$，但允许两端存在任意电压 $\implies$ 支路完全断流 $\implies$ [[hl_open|**断开导线（开路，Open Circuit）**]]！`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '**反证记忆法**：如果你把电压源“开路”了，断口两端会有电压，并没有让 $v=0$；如果你把电流源“短路”了，短路线里会流过电流，并没有让 $i=0$！',
        },
        { kind: 'p', text: '**2.3 三段式教授板书推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: String.raw`在线性电路的节点方程 $\mathbf{G}\mathbf{v} = \mathbf{i}_s$ 中，右侧的激励向量可以拆分为各个独立源的贡献之和：$\mathbf{i}_s = \mathbf{i}_{s1} + \mathbf{i}_{s2} + \cdots + \mathbf{i}_{sN}$。为了单独求解第 $k$ 个独立源对应的分量 $\mathbf{v}^{(k)} = \mathbf{G}^{-1}\mathbf{i}_{sk}$，我们必须保持左侧电导矩阵 $\mathbf{G}$ 的拓扑结构不变，仅令其余所有独立源的输出值为 $0$：`,
        },
        {
          kind: 'ul',
          items: [
            String.raw`独立电压源输出 $v_s = 0$，其伏安特性退化为 $v = 0$（对任意 $i$），物理实现就是一根[[hl_short|**零电阻短路线**]]。`,
            String.raw`独立电流源输出 $i_s = 0$，其伏安特性退化为 $i = 0$（对任意 $v$），物理实现就是一个[[hl_open|**无穷大电阻断口（开路）**]]。`,
            String.raw`[[hl_dep|**为什么受控源不能动？**]] 因为受控源的激励与电路内部未知变量成正比（如 $2i_x$），它在方程中属于**左侧矩阵 $\mathbf{G}$ 的一部分**，而非右侧独立激励 $\mathbf{i}_s$。一旦把受控源置零，你就篡改了矩阵 $\mathbf{G}$ 本身，拆出来的根本不是原来的电路！`,
          ],
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式（General Formula）：对图 2 所示的双独立源网络（$V_s$ 与 $R_1$ 串联，$R_2$ 与 $I_s$ 并联），叠加定理三步法给出任意支路电压 $v$ 与电流 $i$ 的纯符号分解式：`,
          tex: String.raw`v = v' + v'', \qquad i = i' + i''`,
        },
        {
          kind: 'formula',
          title: String.raw`**子电路 1（仅保留 $V_s$，$I_s$ 开路）**：$R_1$ 与 $R_2$ 串联分压`,
          tex: String.raw`v' = V_s\,\frac{R_2}{R_1 + R_2}, \qquad i' = \frac{V_s}{R_1 + R_2}`,
        },
        {
          kind: 'formula',
          title: String.raw`**子电路 2（仅保留 $I_s$，$V_s$ 短路）**：$R_1$ 与 $R_2$ 并联分流`,
          tex: String.raw`i'' = I_s\,\frac{R_1}{R_1 + R_2}, \qquad v'' = i'' R_2 = I_s\,\frac{R_1 R_2}{R_1 + R_2}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）：叠加定理标准**三步法口诀**（请刻进肌肉记忆）：',
          steps: [
            {
              label: 'Step 1（关机留一）',
              text: '每次只保留 **1 个独立源**工作，将所有其余[[hl_short|**独立电压源短路**]]、[[hl_open|**独立电流源开路**]]，[[hl_dep|**所有受控源原位保留**]]。',
            },
            { label: 'Step 2（分别求解）', text: '利用串并联、分压分流或节点法，算出该子电路下目标电压/电流的分量（务必标注与原电路完全一致的参考极性/方向！）。' },
            { label: 'Step 3（代数累加）', text: '对所有独立源重复上述两步，将各分量**带符号代数相加**，得到最终电压或电流。' },
          ],
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '图 2 · 原电路 → 子电路 1（电流源开路）+ 子电路 2（电压源短路）拓扑演化',
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '经典实战——双独立源电路的分步叠加（Sadiku Example 4.3 经典原型）',
      sync: { layer: L2, halo: ['hl_readout'], params: { ...free, w5_mode: 'AIDING', w5_tab: 'sum', w5_k: 1 } },
      blocks: [
        { kind: 'p', text: '**3.1 题目陈述**' },
        {
          kind: 'p',
          text: String.raw`如图所示电路，已知 $V_s = 6\text{ V}$，$I_s = 3\text{ A}$（向上注入节点），$R_1 = 8\ \Omega$，$R_2 = 4\ \Omega$。请用**叠加定理**求 [[hl_r2|$4\ \Omega$ 电阻上的电压 $v$、向下流过的电流 $i$]]，并用 $W2\text{-}L1$ 学过的节点分析法进行交叉验算。`,
        },
        { kind: 'p', text: '**3.3 三段式教授板书推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: String.raw`本电路仅含定值电阻 $R_1, R_2$ 与两个独立源 $V_s, I_s$，严格满足线性条件。将节点 $v$ 处电压拆分为 $V_s$ 单独作用时的 $v'$ 与 $I_s$ 单独作用时的 $v''$，两者参考极性均取“上正下负”，电流 $i', i''$ 参考方向均取“向下流过 $R_2$”。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（General Formula）',
          tex: String.raw`\begin{gathered} v = v' + v'' = V_s\,\frac{R_2}{R_1 + R_2} + I_s\,\frac{R_1 R_2}{R_1 + R_2} \\[4pt] i = i' + i'' = \frac{V_s}{R_1 + R_2} + I_s\,\frac{R_1}{R_1 + R_2} \end{gathered}`,
        },
        {
          kind: 'calc',
          title: String.raw`③ 代入数值 · 逐步化简（Step-by-Step Calculation）：已知 $V_s = 6\text{ V}$，$I_s = 3\text{ A}$，$R_1 = 8\ \Omega$，$R_2 = 4\ \Omega$：`,
          steps: [
            {
              label: 'Step 1',
              text: String.raw`**子电路 1（仅保留 $6\text{ V}$ 电压源，$3\text{ A}$ 电流源开路）**：`,
              tex: String.raw`\begin{gathered} v' = 6 \times \frac{4}{8 + 4} = 6 \times \frac{4}{12} = 2\text{ V} \\[4pt] i' = \frac{v'}{4} = \frac{2}{4} = 0.5\text{ A} \quad (\text{向下}) \end{gathered}`,
            },
            {
              label: 'Step 2',
              text: String.raw`**子电路 2（仅保留 $3\text{ A}$ 电流源，$6\text{ V}$ 电压源短路）**：此时 $8\ \Omega$ 与 $4\ \Omega$ 并联，用并联分流公式求流过 $4\ \Omega$ 的电流 $i''$：`,
              tex: String.raw`\begin{gathered} i'' = 3 \times \frac{8}{8 + 4} = 3 \times \frac{8}{12} = 2\text{ A} \quad (\text{向下}) \\[4pt] v'' = i'' \times 4 = 2 \times 4 = 8\text{ V} \end{gathered}`,
            },
            {
              label: 'Step 3',
              text: '[[hl_readout|**代数叠加总解**]]：',
              tex: String.raw`\begin{gathered} v = v' + v'' = 2 + 8 = 10\text{ V} \\ i = i' + i'' = 0.5 + 2 = 2.5\text{ A} \end{gathered}`,
            },
            {
              label: 'Step 4',
              text: '**用节点分析法（W2-L1）交叉验算**：对原电路顶节点列写 KCL：',
              tex: String.raw`\frac{v - 6}{8} + \frac{v}{4} = 3 \implies (v - 6) + 2v = 24 \implies 3v = 30 \implies v = 10\text{ V}, \quad i = \frac{10}{4} = 2.5\text{ A}`,
            },
          ],
        },
        { kind: 'p', text: '结果分毫不差！' },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: 'Sadiku 4.3 经典原型：6 V 电压源 + 3 A 电流源叠加求 4 Ω 电阻电压 v 与电流 i',
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '禁区警告（一）——受控源绝不置零！含受控源的叠加实战',
      sync: { layer: L1, halo: ['hl_dep'], params: { ...free, w5_vs: 'ACTIVE', w5_is: 'ACTIVE' } },
      blocks: [
        { kind: 'p', text: '**4.1 教授敲黑板：为什么受控源是“不可触碰的菱形”？**' },
        {
          kind: 'note',
          tone: 'warn',
          text: String.raw`**头号高频错题警告**：考场上超过 40% 的丢分，源于学生看见[[hl_dep|菱形受控源（例如 $2i_x$）]]也顺手把它“开路”或“短路”了！`,
        },
        {
          kind: 'p',
          text: String.raw`请记住：**叠加定理只对独立源（圆形符号）动手术，[[hl_dep|对受控源（菱形符号）绝对禁止置零！]]** 因为受控源不是外部独立能源，而是电路内部的线性放大/耦合元件（比如晶体管或运放模型）。在每个子电路里，受控源都要**原封不动地留在原地**，只是它的控制量会随之变成该子电路对应的分量（例如从 $2i_x$ 变为 $2i_x'$ 和 $2i_x''$）。`,
        },
        { kind: 'p', text: '**4.3 三段式教授板书推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: String.raw`设顶节点电压为 $v$，中间支路 $R_2$ 向下流过的控制电流为 $i_x = v/R_2$，流控电流源（CCCS）$\beta i_x$ 向下流出顶节点。对原电路列写 KCL：$\dfrac{v - V_s}{R_1} + \dfrac{v}{R_2} + \beta\dfrac{v}{R_2} = I_s \implies \left(\dfrac{1}{R_1} + \dfrac{1 + \beta}{R_2}\right)v = \dfrac{V_s}{R_1} + I_s$ 看清左侧括号了吗？受控源系数 $\beta$ 直接融进了等效电导 $G_{\text{eq}} = \frac{1}{R_1} + \frac{1+\beta}{R_2}$ 中！因此拆分独立源 $V_s$ 和 $I_s$ 时，左侧的 $G_{\text{eq}}$ 必须保持不变，[[hl_dep|受控源 $\beta i_x$ 绝不可置零]]。`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式（General Formula）：保留受控源 $\beta i_x$，分别求两个独立源的分量：`,
          tex: String.raw`\begin{gathered} v' = \frac{V_s / R_1}{\dfrac{1}{R_1} + \dfrac{1 + \beta}{R_2}}, \qquad v'' = \frac{I_s}{\dfrac{1}{R_1} + \dfrac{1 + \beta}{R_2}} \\[6pt] v = v' + v'', \qquad i_x = i_x' + i_x'' = \frac{v'}{R_2} + \frac{v''}{R_2} \end{gathered}`,
        },
        {
          kind: 'calc',
          title: String.raw`③ 代入数值 · 逐步化简（Step-by-Step Calculation）：已知 $V_s = 16\text{ V}$，$I_s = 6\text{ A}$（向上），$R_1 = 4\ \Omega$，$R_2 = 4\ \Omega$，受控电流源 $2i_x$（向下，即 $\beta = 2$）：`,
          steps: [
            {
              label: 'Step 1',
              text: String.raw`**子电路 1（仅保留 $16\text{ V}$，$6\text{ A}$ 开路，保留 $2i_x'$）**：因为 $i_x' = \dfrac{v'}{4}$，对顶节点列写 KCL：`,
              tex: String.raw`\begin{gathered} \frac{v' - 16}{4} + \frac{v'}{4} + 2\left(\frac{v'}{4}\right) = 0 \implies \frac{4v' - 16}{4} = 0 \implies v' = 4\text{ V} \\[4pt] i_x' = \frac{v'}{4} = \frac{4}{4} = 1\text{ A} \end{gathered}`,
            },
            {
              label: 'Step 2',
              text: String.raw`**子电路 2（仅保留 $6\text{ A}$，$16\text{ V}$ 短路，保留 $2i_x''$）**：因为 $i_x'' = \dfrac{v''}{4}$，对顶节点列写 KCL：`,
              tex: String.raw`\begin{gathered} \frac{v''}{4} + \frac{v''}{4} + 2\left(\frac{v''}{4}\right) = 6 \implies \frac{4v''}{4} = 6 \implies v'' = 6\text{ V} \\[4pt] i_x'' = \frac{v''}{4} = \frac{6}{4} = 1.5\text{ A} \end{gathered}`,
            },
            {
              label: 'Step 3',
              text: '**代数叠加总解**：',
              tex: String.raw`v = v' + v'' = 4 + 6 = 10\text{ V}, \qquad i_x = i_x' + i_x'' = 1 + 1.5 = 2.5\text{ A}`,
            },
            {
              label: 'Step 4',
              text: String.raw`**反面教材警示（若误把 $2i_x$ 开路置零）**：错误子电路 1 会算出 $v_{\text{err}}' = 8\text{ V}$，错误子电路 2 会算出 $v_{\text{err}}'' = 12\text{ V}$，得到荒谬的 $v_{\text{err}} = 20\text{ V}$（整整大了一倍！）。记住：[[hl_dep|**菱形受控源，永远锁死在原地！**]]`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '含流控电流源（CCCS 2iₓ）的叠加拓扑：菱形在两个子电路中原位保留',
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '禁区警告（二）——功率为何不能叠加？二次非线性与交叉项陷阱',
      sync: { layer: L3, halo: ['hl_cross'], params: { ...free, w5_scn: 'A', w5_i1: 0.5, w5_i2: 2 } },
      blocks: [
        { kind: 'p', text: '**5.1 教授灵魂拷问**' },
        {
          kind: 'p',
          text: String.raw`刚才第 3 幕里，我们算出 $4\ \Omega$ 电阻在子电路 1 中的电流是 $i_1 = 0.5\text{ A}$（对应功率 $p_1 = 1\text{ W}$），在子电路 2 中的电流是 $i_2 = 2\text{ A}$（对应功率 $p_2 = 16\text{ W}$）。`,
        },
        { kind: 'p', text: String.raw`那么，两个电源同时接上时，$4\ \Omega$ 电阻消耗的真实总功率是 [[hl_wrong_sum|$1 + 16 = 17\text{ W}$]] 吗？` },
        {
          kind: 'p',
          text: String.raw`**大错特错！[[hl_true_p|真实功率是 $25\text{ W}$]]！凭空多出来的 $8\text{ W}$ 从哪来？** 来自二次展开式里被你扔掉的[[hl_cross|**交叉项 $2 i_1 i_2 R$**]]！`,
        },
        { kind: 'p', text: '**5.3 三段式教授板书推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: String.raw`电阻吸收的瞬时功率 $p = i^2 R = \dfrac{v^2}{R}$ 是电流或电压的[[hl_parabola|**二次函数（Quadratic Function）**]]。二次函数 $f(x) = Rx^2$ 既不满足齐次性（$f(kx) = k^2 f(x) \neq kf(x)$），也不满足可加性（$f(x_1+x_2) \neq f(x_1)+f(x_2)$）。因此，**求功率时必须先用叠加定理求出总电流 $i$（或总电压 $v$），最后再平方求功率**。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（General Formula）',
          tex: String.raw`p = i^2 R = (i_1 + i_2)^2 R = i_1^2 R + i_2^2 R + 2 i_1 i_2 R = p_1 + p_2 + 2 i_1 i_2 R \neq p_1 + p_2`,
        },
        {
          kind: 'formula',
          title: '等价的电压展开式：',
          tex: String.raw`p = \frac{(v_1 + v_2)^2}{R} = \frac{v_1^2}{R} + \frac{v_2^2}{R} + \frac{2 v_1 v_2}{R} = p_1 + p_2 + \frac{2 v_1 v_2}{R} \neq p_1 + p_2`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: String.raw`**唯一例外（思考题）**：只有当 $i_1 = 0$ 或 $i_2 = 0$（某独立源对该电阻毫无贡献）时，交叉项 $2i_1 i_2 R = 0$，功率才会碰巧等于 $p_1 + p_2$（在交流稳态里，若两电源频率不同，平均功率也可叠加，那是后续周次的精彩故事）。`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            { label: String.raw`反例 A（第 3 幕 Sadiku 4.3 电路，$R_2 = 4\ \Omega$）` },
            { label: '分量功率', text: String.raw`$p_1 = i_1^2 R_2 = (0.5)^2 \times 4 = 1\text{ W}$，$p_2 = i_2^2 R_2 = 2^2 \times 4 = 16\text{ W}$。` },
            { label: '错误直接相加', text: String.raw`[[hl_wrong_sum|$p_{\text{wrong}} = p_1 + p_2 = 1 + 16 = 17\text{ W}$]]。` },
            {
              label: '正确真实功率',
              text: String.raw`先得总电流 $i = 0.5 + 2 = 2.5\text{ A}$，再计算：`,
              tex: String.raw`p_{\text{true}} = i^2 R_2 = (2.5)^2 \times 4 = 6.25 \times 4 = 25\text{ W}`,
            },
            { label: '交叉项核验', text: String.raw`[[hl_cross|$2 i_1 i_2 R_2 = 2 \times 0.5 \times 2 \times 4 = +8\text{ W}$]]，正好满足 $17 + 8 = 25\text{ W}$！` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: String.raw`反例 B（反向抵消电路，$R_2 = 2\ \Omega$）就是第 6 幕的实战题：先在第 6 幕亲手闯关，它的逐步验算放在引导例题之后的“通关复盘”里。左侧 03 对比台可以先拖一拖 $i_1$、$i_2$，让两者异号，看交叉项柱条怎样变红变负。`,
        },
      ],
      inline_svg: SVG_ACT5_A,
      figure_caption: '功率不可叠加反例对比台 · 反例 A（第 3 幕电路，同向增强）',
    },

    /* ------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式分步引导实战、诊断测验与工程落地',
      sync: { layer: L2, halo: ['hl_is'], params: { ...free, w5_mode: 'OPPOSING', w5_tab: 'total', w5_k: 1 } },
      blocks: [
        { kind: 'p', text: '**6.1 实战挑战电路图（反向抵消型双源电路）**' },
        {
          kind: 'guided',
          title: '苏格拉底引导：双独立源反向抵消电路的电流与真实功率求解',
          problem:
            '已知电路中独立电压源 Vs = 18 V（上正下负）与 R1 = 4 Ω 串联接至节点 A，R2 = 2 Ω 接于节点 A 与地之间，独立电流源 Is = 3 A 从节点 A 向下流向地。请用叠加定理逐步求出流过 2 Ω 电阻的向下电流 $i_o$ 以及它消耗的真实功率 $p$。',
          problem_svg: SVG_ACT6,
          steps: [
            {
              title: '第 1 步（构建子电路 1）',
              mini_svg: MINI_STEP1,
              question: '我们先只保留 18 V 电压源工作。此时，右侧的 3 A 独立电流源应当如何“置零”？',
              hint: String.raw`$i_s = 0\ \text{A} \iff \text{Open Circuit（开路）}$`,
              options: [
                { text: '将 3 A 电流源替换为开路（断开导线，强制 i = 0）', correct: true, feedback: '对！电流源置零就是强制 i = 0：断开它，3 A 支路里一点电流也没有。' },
                {
                  text: '将 3 A 电流源替换为短路（导线直连，强制 v = 0）',
                  correct: false,
                  feedback:
                    '慢着！如果把 3 A 电流源短路了，你相当于把 2 Ω 电阻直接短接到了地，还会强行导通电流——这并没有让电流源输出 0 A！记住：电流源置零是强制 i = 0，必须开路。',
                },
              ],
              board: [String.raw`\text{Subcircuit 1: } I_s = 3\text{ A} \to \text{Open Circuit (} i=0\text{)}`],
              halo: ['hl_is'],
              params: { w5_layer: L2, w5_mode: 'OPPOSING', w5_tab: 'total', w5_k: 1, w5_shown: 0 },
            },
            {
              title: String.raw`第 2 步（求解分量 $i_o'$）`,
              mini_svg: MINI_STEP2,
              question: String.raw`3 A 电流源开路后，4 Ω 与 2 Ω 构成纯串联回路接在 18 V 上。流过 2 Ω 电阻的向下电流分量 $i_o'$ 是多少？`,
              hint: String.raw`$i_o' = \frac{V_s}{R_1 + R_2} = \frac{18}{4 + 2}$`,
              options: [
                { text: String.raw`$i_o' = +3\text{ A}$`, correct: true, feedback: '正确：18 V 除以串联总电阻 4 + 2 = 6 Ω，得 3 A，方向与向下参考方向一致。' },
                {
                  text: String.raw`$i_o' = +9\text{ A}$`,
                  correct: false,
                  feedback: '你漏掉了串联在回路里的 4 Ω 电阻！18 V 不是直接加在 2 Ω 上的，总电阻是 R1 + R2 = 4 + 2 = 6 Ω。',
                },
                {
                  text: String.raw`$i_o' = -3\text{ A}$`,
                  correct: false,
                  feedback: '看清楚 18 V 电压源的极性：上正下负，电流顺时针流出，进入节点 A 后向下流过 2 Ω，与 $i_o$ 的参考方向完全一致，应为正值！',
                },
              ],
              board: [String.raw`i_o' = \frac{18}{4 + 2} = +3\text{ A}, \quad v_o' = 3 \times 2 = +6\text{ V}`],
              halo: ['hl_r2', 'hl_open'],
              params: { w5_layer: L2, w5_mode: 'OPPOSING', w5_tab: 'sub1', w5_k: 1, w5_shown: 1 },
            },
            {
              title: String.raw`第 3 步（构建子电路 2 并求解分量 $i_o''$）`,
              mini_svg: MINI_STEP3,
              question: String.raw`现在只保留 3 A 向下电流源，将 18 V 电压源短路。此时 4 Ω 与 2 Ω 并联。注意电流源是向下抽走电流的！请问向下参考方向的 $i_o''$ 是多少？`,
              hint: String.raw`$i_o'' = -I_s \cdot \frac{R_1}{R_1 + R_2} = -3 \times \frac{4}{4 + 2}$`,
              options: [
                { text: String.raw`$i_o'' = -2\text{ A}$`, correct: true, feedback: '正确：2 Ω 分得 4/(4+2) = 2/3 的 3 A，即 2 A，但实际向上流——对向下参考方向记作 −2 A。' },
                {
                  text: String.raw`$i_o'' = +2\text{ A}$`,
                  correct: false,
                  feedback: '方向陷阱！3 A 电流源从节点 A 向下抽水，所以 4 Ω 和 2 Ω 两条支路都必须从地“向上”往节点 A 补水。电流实际向上流过 2 Ω，与向下参考方向相反，必须带负号！',
                },
                {
                  text: String.raw`$i_o'' = -1\text{ A}$`,
                  correct: false,
                  feedback: '并联分流公式分子放的是“对方电阻”！流过 2 Ω 的分流比例是 4/(4+2) = 2/3，而不是 2/(4+2) = 1/3。',
                },
              ],
              board: [String.raw`i_o'' = -3 \times \frac{4}{4 + 2} = -2\text{ A}, \quad v_o'' = -4\text{ V}`],
              halo: ['hl_short', 'hl_r2'],
              params: { w5_layer: L2, w5_mode: 'OPPOSING', w5_tab: 'sub2', w5_k: 1, w5_shown: 2 },
            },
            {
              title: '第 4 步（代数叠加总电流）',
              mini_svg: MINI_STEP4,
              question: String.raw`将两个子电路求得的电流分量叠加，流过 2 Ω 电阻的总电流 $i_o$ 是多少？`,
              hint: String.raw`$i_o = i_o' + i_o'' = 3 + (-2)$`,
              options: [
                { text: String.raw`$i_o = 3 + (-2) = +1\text{ A}$`, correct: true, feedback: '正确：带符号相加，两股电流在 2 Ω 支路里抵消掉 2 A，只剩向下 1 A。' },
                {
                  text: String.raw`$i_o = 3 + 2 = 5\text{ A}$`,
                  correct: false,
                  feedback: '叠加是“代数相加”（带正负号），不是绝对值相加！两股电流在 2 Ω 支路里迎头相撞，互相抵消了 2 A。',
                },
              ],
              board: [String.raw`i_o = i_o' + i_o'' = 3 + (-2) = 1\text{ A} \quad (v_o = 2\text{ V})`],
              halo: ['hl_readout'],
              params: { w5_layer: L2, w5_mode: 'OPPOSING', w5_tab: 'sum', w5_k: 1, w5_shown: 3 },
            },
            {
              title: '第 5 步（终极防坑：求真实功率 $p$）',
              mini_svg: MINI_STEP5,
              question: String.raw`已知子电路 1 中 2 Ω 电阻消耗 $p_1 = 3^2 \times 2 = 18\text{ W}$，子电路 2 中消耗 $p_2 = (-2)^2 \times 2 = 8\text{ W}$。请问原电路中 2 Ω 电阻消耗的真实总功率 $p$ 是多少？`,
              hint: String.raw`$p = i_o^2 R_2 = (i_o' + i_o'')^2 R_2$`,
              options: [
                {
                  text: String.raw`$p = 1^2 \times 2 = 2\text{ W}$`,
                  correct: true,
                  feedback: '正确：先叠加出总电流 1 A，再平方乘电阻，2 Ω 只消耗 2 W——比任何一个电源单独作用时都小。',
                },
                {
                  text: String.raw`$p = 18 + 8 = 26\text{ W}$`,
                  correct: false,
                  feedback: String.raw`踩进功率叠加陷阱啦！你漏掉了负的交叉项 $2 \cdot i_o' \cdot i_o'' \cdot R_2 = 2 \times 3 \times (-2) \times 2 = -24\text{ W}$。必须先算总电流 $i_o = 1\text{ A}$，再算 $p = i_o^2 R_2 = 2\text{ W}$！`,
                },
                {
                  text: String.raw`$p = 18 - 8 = 10\text{ W}$`,
                  correct: false,
                  feedback: String.raw`功率既不能直接相加，也不能直接相减！请老老实实用总电流平方乘以电阻：$p = (i_o' + i_o'')^2 R_2$。`,
                },
              ],
              board: [String.raw`p_{\text{true}} = (1)^2 \times 2 = 2\text{ W} \neq p_1 + p_2 = 26\text{ W}`],
              halo: ['hl_true_p', 'hl_cross'],
              params: { w5_layer: L3, w5_scn: 'B', w5_i1: 3, w5_i2: -2, w5_shown: 4 },
            },
          ],
          conclusion: String.raw`通关！$i_o = 1\text{ A}$，$p = 2\text{ W}$：先叠加电流，最后才平方求功率。`,
        },
        { kind: 'p', text: '**通关复盘 · 第 5 幕反例 B：功率不可叠加反例对比台（同向增强 vs. 反向抵消）**' },
        { kind: 'figure', svg: SVG_ACT5, caption: '功率不可叠加反例对比台：同向增强 vs. 反向抵消（第 5 幕原图）' },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            { label: String.raw`反例 B（反向抵消电路，$R_2 = 2\ \Omega$，$i_1 = +3\text{ A}$，$i_2 = -2\text{ A}$）` },
            { label: '分量功率', text: String.raw`$p_1 = 3^2 \times 2 = 18\text{ W}$，$p_2 = (-2)^2 \times 2 = 8\text{ W}$；[[hl_wrong_sum|错误直接相加高达 $26\text{ W}$]]！` },
            {
              label: '正确真实功率',
              text: String.raw`总电流 $i = 3 + (-2) = 1\text{ A}$，真实功率仅：`,
              tex: String.raw`p_{\text{true}} = 1^2 \times 2 = 2\text{ W}`,
            },
            {
              label: '交叉项核验',
              text: String.raw`[[hl_cross|$2 i_1 i_2 R_2 = 2 \times 3 \times (-2) \times 2 = -24\text{ W}$]]，$26 - 24 = 2\text{ W}$！两股反向水流互相抵消，耗散功率反而比单独开任何一个电源都小！`,
            },
          ],
        },
        { kind: 'p', text: '**6.3 高区分度诊断测验**' },
      ],
      quiz: [
        {
          id: 'w2l5_q1',
          question: '在使用叠加定理分析线性电路时，若要“关闭（置零）”一个 12 V 独立电压源和一个 5 A 独立电流源，正确的替换操作分别是：',
          options: [
            {
              key: 'A',
              text: '12 V 电压源用开路替换；5 A 电流源用短路替换',
              correct: false,
              feedback: '正好记反了：开路后的电压源断口两端仍可以有电压，并没有让 v = 0；短路后的电流源里仍会流过电流，并没有让 i = 0。',
            },
            { key: 'B', text: '12 V 电压源用短路替换；5 A 电流源用开路替换', correct: true },
            {
              key: 'C',
              text: '两者均用短路替换',
              correct: false,
              feedback: '电压源这一半对了；可电流源一旦短路，短路线里照样有电流流过，i ≠ 0，它并没有被“关掉”。',
            },
            {
              key: 'D',
              text: '两者均用开路替换',
              correct: false,
              feedback: '电流源这一半对了；可电压源一旦开路，断口两端照样可以有电压，v ≠ 0，它并没有被“关掉”。',
            },
          ],
          feedback_correct: '电压源置零意味着强制 v = 0 V，对应理想导线（短路）；电流源置零意味着强制 i = 0 A，对应断开导线（开路）。',
          feedback_wrong: '置零看“谁等于零”：电压源让 v = 0，电流源让 i = 0。哪种导线能做到？',
          figure: SVG_Q1,
          sync: { layer: L1, halo: [], params: { ...free, w5_vs: 'ACTIVE', w5_is: 'ACTIVE' } },
        },
        {
          id: 'w2l5_q2',
          question: '某线性电路包含 2 个独立电压源、1 个独立电流源和 2 个受控源（1 个 VCVS 与 1 个 CCCS）。应用叠加定理时，应将该电路拆分为几个子电路？受控源如何处理？',
          options: [
            {
              key: 'A',
              text: '拆分为 5 个子电路，每次仅保留 1 个源（含受控源）',
              correct: false,
              feedback: '受控源不是独立激励：它的输出取决于电路内部的 vₓ、iₓ。只留一个受控源、关掉所有独立源，电路里没有任何激励，响应全为零——子电路只按独立源来数。',
            },
            {
              key: 'B',
              text: '拆分为 3 个子电路，并在所有子电路中将 2 个受控源置零',
              correct: false,
              feedback: '个数数对了，处理错了：受控源属于电导矩阵 G，置零就等于换了一个电路（第 4 幕把 2iₓ 开路，答案错成了 20 V）。',
            },
            { key: 'C', text: '拆分为 3 个子电路，并在每个子电路中将 2 个受控源原位保留', correct: true },
            {
              key: 'D',
              text: '含受控源的电路不满足线性性质，不能使用叠加定理',
              correct: false,
              feedback: '增益为常数的受控源（如 2iₓ、μvₓ）是线性元件，电路仍是一组线性方程，齐次性与可加性照样成立。',
            },
          ],
          feedback_correct: '子电路数量仅等于独立源的个数（2 + 1 = 3）。线性受控源属于电路内部线性耦合网络（电导矩阵 G 的一部分），在所有子电路中必须原位保留，绝不可置零。',
          feedback_wrong: '先分清圆形（独立源）与菱形（受控源）：子电路按哪一类来数？另一类在子电路里怎么办？',
          figure: SVG_Q2,
          sync: { layer: L1, halo: [], params: { ...free, w5_vs: 'ACTIVE', w5_is: 'ACTIVE' } },
        },
        {
          id: 'w2l5_q3',
          question:
            '某 5 Ω 电阻在独立源 A 单独作用时流过向右电流 2 A（消耗功率 20 W），在独立源 B 单独作用时流过向右电流 4 A（消耗功率 80 W）。两电源同时作用时，该 5 Ω 电阻消耗的真实功率为：',
          options: [
            {
              key: 'A',
              text: '100 W',
              correct: false,
              feedback: '这是 20 W + 80 W 直接相加：功率是电流的二次函数，不满足可加性，漏掉了交叉项 2 × 2 × 4 × 5 = 80 W。',
            },
            { key: 'B', text: '180 W', correct: true },
            {
              key: 'C',
              text: '60 W',
              correct: false,
              feedback: '这是 80 W − 20 W：功率不能直接相减。两股电流同向（同号），交叉项为正，真实功率只会比 100 W 更大。',
            },
            {
              key: 'D',
              text: '20 W',
              correct: false,
              feedback: '这相当于 (4 − 2)² × 5：把两股同向电流当成了互相抵消。题中两股电流都向右，应先算 2 + 4。',
            },
          ],
          feedback_correct: '必须先叠加电流：i = 2 + 4 = 6 A，再算真实功率 p = i²R = 6² × 5 = 180 W。直接把 20 W + 80 W = 100 W 漏算了交叉项 2×2×4×5 = 80 W。',
          feedback_wrong: '先叠加电流，再求功率：两股向右电流合起来是多少？',
          figure: SVG_Q3,
          sync: { layer: L3, halo: [], params: { ...free, w5_scn: 'A', w5_i1: 0.5, w5_i2: 2 } },
        },
        {
          id: 'w2l5_q4',
          question: String.raw`接上题条件，若将独立源 B 的极性反接，使其单独作用时在 5 Ω 电阻中产生向左的 4 A 电流（即 $i_B = -4\text{ A}$，单独功率仍为 80 W）。此时两电源同时作用，5 Ω 电阻消耗的真实功率为：`,
          options: [
            {
              key: 'A',
              text: '100 W',
              correct: false,
              feedback: '还是把 20 W + 80 W 直接相加：B 反接后交叉项 2 × 2 × (−4) × 5 = −80 W 是负的，真实功率应比 100 W 小得多。',
            },
            {
              key: 'B',
              text: '60 W',
              correct: false,
              feedback: '这是 80 W − 20 W：功率不能直接加减。先把电流带符号相加：2 + (−4) 是多少？',
            },
            { key: 'C', text: '20 W', correct: true },
            {
              key: 'D',
              text: '0 W',
              correct: false,
              feedback: '两股电流没有完全抵消：2 + (−4) = −2 A ≠ 0，平方后功率不为零（只有 $i_A = -i_B$ 时才会是 0 W）。',
            },
          ],
          feedback_correct:
            '总电流 i = 2 + (-4) = -2 A，真实总功率 p = (-2)² × 5 = 20 W（交叉项为 2×2×(-4)×5 = -80 W，100 - 80 = 20 W）。反向抵消时，总功率甚至可以远小于单个电源作用时的功率。',
          feedback_wrong: '反接后电流带负号：先算总电流 2 + (−4)，再平方乘电阻。',
          figure: SVG_Q4,
          sync: { layer: L3, halo: [], params: { ...free, w5_scn: 'A', w5_i1: 0.5, w5_i2: 2 } },
        },
      ],
    },
  ],
};

export default W2_L5;
