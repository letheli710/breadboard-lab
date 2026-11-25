// W3-L2 · 理想运放公式与节点分析（虚断与虚短黄金法则） (lesson sheet: docs/lessons/W3-L2.md).
// The professor's text of the five acts, the act diagrams (svgs.ts), the guided example and the
// self-test are reproduced from the sheet; [[id|…]] only links a term to the stage (the words are
// unchanged). Changes from the sheet:
// - form: the display formulas of a ① origin run inline in its card (numbered items as bold
//   lead-ins); each display formula of ② is a blue card with its lead-in sentence as the title;
//   the professor's opening opens act 1; section headings (1.1 …) are bold lines, the diagram
//   headings figure captions; the two red-line warnings of act 2 are two notes; in the guided
//   example and the quiz, symbols the sheet writes with an underscore (R_f, V_CC …) and the
//   equations in the options are set in TeX;
// - anti-spoiler: the guided example (act 5) is act 4's Example 5.2, so act 4 keeps ① and ② and
//   the circuit and its ③ calculation moves behind the guided block as the 「通关复盘」 board
//   (with the full Fig. 5.9); act 4's Fig. 5.9 and mini diagrams 2–4 print "?" for the answers
//   (svgs.ts); layer 03 keeps Example 5.2's numbers covered until the guided example is done
//   (done_params) or the student asks;
// - fixed: act 3 ① cites `W2-L1 节点分析法` for the rule that the current of a voltage source is
//   an unknown of its own; that is W2-L2 (voltage sources in nodal analysis), so it cites W2-L2;
// - quiz: the right answer sat at B, B, B, C; the options are reordered (C, A, D, B);
// - left out: the sheet's appendix (the front-end checklist for developers) and its passing_score
//   / concept radar (the site keeps 4/4, see docs/STAGE_LESSONS.md);
// - added (the sheet has none): the hover map; the right-answer remarks of the guided steps, its
//   problem line and closing line; feedback for each wrong quiz option (from the sheet's
//   explanations); the quiz figures and the W3-L3 preview (quizFigures.ts); one line in act 4
//   pointing to the guided example.

import { lazy } from 'react';
import type { StageLesson, StageSync } from '../../types';
import { L1, L2, L3 } from './parts';
import { SVG_NEXT, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './quizFigures';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, PROBLEM, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT4_FULL, SVG_ACT5 } from './svgs';

const Real741Layer = lazy(() => import('./Real741Layer'));
const GoldenRulesLayer = lazy(() => import('./GoldenRulesLayer'));
const Ex52Layer = lazy(() => import('./Ex52Layer'));

const R = String.raw;
/** a backtick-quoted `code` span inside a String.raw template */
const code = (s: string) => '`' + s + '`';

/** layer 03 with Example 5.2's numbers covered */
const EX52_HIDDEN = { w32_step: 0, w32_rl: 0, w32_cmp: false, w32_reveal: false };
const at = (layer: string, halo: string[], params: Record<string, unknown>): StageSync => ({ layer, halo, params });

const W3_L2: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Real741Layer, [L2]: GoldenRulesLayer, [L3]: Ex52Layer },
  lesson_meta: {
    lesson_id: 'W3-L2',
    world: 'World 3',
    title: '理想运放公式与节点分析（虚断与虚短黄金法则）',
    subtitle: '从真实 741 精确解到零误差级工程抽象：虚断、虚短与输出端 KCL 禁区',
    lesson_type: 'B',
    lesson_type_label: 'Type B · 纯公式/方法论课',
    estimated_minutes: 35,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Ch. 5 Example 5.1 (Fig. 5.6)', 'Sec. 5.3 Ideal Op Amp (Fig. 5.8)', 'Example 5.2 (Fig. 5.9)', 'pp. 177–179'],
    },
    prerequisites: ['W2-L1 节点分析法', 'W3-L1 真实运放模型'],
    next_lesson: 'W3-L3',
    next_lesson_title: '反相放大器（虚地推导、输入电阻与 ±9V 双电源面包板实测）',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 Fig. 5.6 真实 741 精确求解台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: 'Sadiku Fig. 5.6(a)-(b) · Example 5.1：切换“闭环拓扑 / 741 等效模型”，拖动开环增益 A（10² … 10⁷），看两条 KCL 联立的精确解 v₁、v_d、i₁ 与理想增益 3 的误差。',
      },
      {
        id: L2,
        label: '02 Fig. 5.8 理想运放黄金法则 (虚断与虚短)',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: 'Sadiku Fig. 5.8 · Section 5.3：断开负反馈，看虚短失效、虚断仍在；打开 X-Ray，看输出端的受控电压源、暗中供流的电源轨和未知的 iₒ。',
      },
      {
        id: L3,
        label: '03 Fig. 5.9 Example 5.2 节点实战台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: 'Sadiku Fig. 5.9 · Example 5.2：按四步 SOP 逐步高亮节点与支路；接上负载 R_L 看 vₒ 不变、iₒ 变大；打开“对比 741”量化误差。',
      },
    ],
    hover_map: {
      vs: { label: '输入源 vₛ', desc: '独立电压源，接同相端：Example 5.1 / 5.2 中 vₛ = 2 V，节点 2 被它钳位为 v₂ = vₛ' },
      r1: { label: '电阻 R₁ = 10 kΩ', desc: '反相端节点 1 到地：流过它的电流 i = v₁/R₁' },
      rf: { label: '反馈电阻 R_f = 20 kΩ', desc: '从输出节点 o 接回反相端 (−)：负反馈通路，电流 (vₒ − v₁)/R_f' },
      ri: { label: '输入电阻 Rᵢ', desc: '741：2 MΩ，跨在两输入端之间；理想运放 Rᵢ → ∞，两输入端之间是断路（虚断）' },
      ro: { label: '输出电阻 Rₒ', desc: '741：50 Ω；理想运放 Rₒ → 0，输出端成了硬电压源' },
      vcvs: { label: '受控电压源 A·v_d', desc: '运放内部的 VCVS：741 的 A = 2×10⁵，理想运放 A → ∞' },
      opamp: { label: '运放', desc: '电路符号：− 反相输入端，+ 同相输入端，三角形尖端是输出端' },
      node_1: { label: '节点 1（反相输入 −）', desc: 'v₁：真实 741 里比 v₂ 低约 30 μV；有负反馈的理想运放 v₁ = v₂' },
      node_2: { label: '节点 2（同相输入 +）', desc: 'v₂ = vₛ：被独立电压源直接钳位' },
      node_o: { label: '输出节点 o', desc: 'vₒ：理想运放的输出端连着受控电压源，求 vₒ 时不对它列 KCL' },
      vd: { label: '差模电压 v_d', desc: 'v_d = v₂ − v₁：真实 741 只有约 30 μV；理想运放 v_d = vₒ/A → 0' },
      i1: { label: '输入电流 i₁', desc: '流入反相端的电流：真实 741 约 −15 pA（皮安级）；理想运放 i₁ = i₂ = 0' },
      i_loop: { label: '回路电流 i', desc: '流过 R₁ 的电流 i = v₁/R₁；与流过 R_f 的电流只差一个 i₁' },
      io: { label: '输出电流 iₒ', desc: '运放输出端供出的电流：不是 0，事先未知，最后用输出节点 KCL 反算' },
      rl: { label: '负载 R_L', desc: '接在输出节点 o 与地之间：vₒ 不变，iₒ 多出 vₒ/R_L' },
      v_open: { label: '虚断（Virtual Open）', desc: 'Rᵢ → ∞ ⇒ i₁ = i₂ = 0：有没有负反馈都成立' },
      v_short: { label: '虚短（Virtual Short）', desc: '负反馈 + A → ∞ ⇒ v₁ = v₂：两端等电位，但不是导线' },
      fb: { label: '负反馈通路', desc: '输出经 R_f 接回反相端 (−)：虚短成立的前提' },
      rails: { label: '电源轨 ±V_CC', desc: '隐藏的供电：受控源的能量来源，也是输出的上下限（本课 ±15 V）' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '痛点与真相——用真实 741 模型硬解 Fig. 5.6（Example 5.1）',
      sync: at(L1, ['ri', 'ro', 'vcvs'], { w32_model: 'b', w32_a: 2e5 }),
      blocks: [
        {
          kind: 'note',
          tone: 'tip',
          text: '**教授开场白**：欢迎回到 Breadboard Lab。上一讲（`W3-L1`）我们拆开了 741 运放的黑盒，看到了里面的[[ri|输入电阻 $R_i$]]、[[ro|输出电阻 $R_o$]] 和高达二十万倍的[[vcvs|受控电压源 $A v_d$]]。今天这节课是整章运放的**分水岭**——我们先咬牙用真实 741 模型硬解一道 Sadiku 经典闭环电路（Example 5.1），让你亲眼看看精确解到底长什么样；然后，你会瞬间明白为什么全世界的电路工程师都敢把那堆复杂参数扔进垃圾桶，只留两行“黄金法则”就能把误差控制在 **0.002% 以内**。系好安全带，我们直接上黑板。',
        },
        { kind: 'p', text: '**教授讲解：为什么要先“自讨苦吃”算一遍真实模型？**' },
        {
          kind: 'p',
          text: '很多教材一上来就让你背“虚短、虚断”，结果同学们做题时心里总是发虚：“凭什么 $v_1 = v_2$？凭什么 $i_1 = i_2 = 0$？这不会把电路算崩吗？”',
        },
        {
          kind: 'p',
          text: R`在 Breadboard Lab，我们不靠信仰学电路，我们靠**硬核证据**。来看 Sadiku **Example 5.1**：一颗经典的 **741 运放**，参数为开环增益 [[vcvs|$A = 2 \times 10^5$]]、输入电阻 [[ri|$R_i = 2\text{ M}\Omega$]]、输出电阻 [[ro|$R_o = 50\ \Omega$]]，接入 **Fig. 5.6(a)** 所示的同相负反馈电路（[[vs|输入源 $v_s$]] 接同相端，反相端经 [[r1|$R_1 = 10\text{ k}\Omega$]] 接地，输出端经[[rf|反馈电阻 $R_f = 20\text{ k}\Omega$]] 连回反相端）。我们要做两件事：`,
        },
        {
          kind: 'ol',
          items: [
            R`求出精确闭环电压增益 $\dfrac{v_o}{v_s}$；`,
            R`当 $v_s = 2\text{ V}$ 时，求出[[i_loop|反馈回路电流 $i$]]，并顺手把芯片内部真实的[[vd|差模电压 $v_d$]] 和[[i1|输入电流 $i_1$]] 扒出来看个究竟。`,
          ],
        },
        { kind: 'figure', svg: SVG_ACT1, caption: '交互式 2D 原理图：Fig. 5.6(a) 闭环电路与 Fig. 5.6(b) 真实 741 VCVS 等效求解模型' },
        { kind: 'p', text: '**三段式教授板书推导：Example 5.1 真实 741 精确求解**' },
        {
          kind: 'origin',
          title: '① 公理溯源（KCL、欧姆定律与 VCVS 本构关系）',
          text: R`对 **Fig. 5.6(b)**，以公共参考地为 $0\text{ V}$，[[node_2|节点 2]] 直接由独立电压源钳位：$v_2 = v_s, \qquad v_d = v_2 - v_1 = v_s - v_1$。根据基尔霍夫电流定律（KCL，流出节点电流代数和为零）与欧姆定律：[[node_1|**对反相输入节点 1 列 KCL**]]：$\dfrac{v_1 - 0}{R_1} + \dfrac{v_1 - v_o}{R_f} + \dfrac{v_1 - v_s}{R_i} = 0$；[[node_o|**对输出节点 $o$ 列 KCL**]]（注意：此处是真实模型，含非零输出电阻 $R_o$，故可对节点 $o$ 列 KCL）：$\dfrac{v_o - v_1}{R_f} + \dfrac{v_o - A v_d}{R_o} = 0 \implies \dfrac{v_o - v_1}{R_f} + \dfrac{v_o - A(v_s - v_1)}{R_o} = 0$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（联立消去 $v_1$）· 将节点 1 与节点 $o$ 的方程整理为关于 $(v_1, v_o)$ 的标准线性方程组：`,
          tex: R`\begin{cases}
\left(\dfrac{1}{R_1} + \dfrac{1}{R_f} + \dfrac{1}{R_i}\right) v_1 - \dfrac{1}{R_f} v_o = \dfrac{1}{R_i} v_s \\[10pt]
\left(\dfrac{A}{R_o} - \dfrac{1}{R_f}\right) v_1 + \left(\dfrac{1}{R_f} + \dfrac{1}{R_o}\right) v_o = \dfrac{A}{R_o} v_s
\end{cases}`,
        },
        {
          kind: 'formula',
          title: R`联立消去 $v_1$，得到真实运放闭环电压增益与节点 1 电压的**严格纯符号通式**（经 Python SymPy 符号化简验算）：`,
          tex: R`\begin{gathered} \frac{v_o}{v_s} = \frac{A R_1 R_i + A R_f R_i + R_1 R_o}{A R_1 R_i + R_1 R_f + R_1 R_i + R_1 R_o + R_f R_i + R_i R_o} \\[12pt] \frac{v_1}{v_s} = \frac{R_1 (A R_i + R_f + R_o)}{A R_1 R_i + R_1 R_f + R_1 R_i + R_1 R_o + R_f R_i + R_i R_o} \end{gathered}`,
        },
        {
          kind: 'formula',
          title: R`进而，[[vd|差模输入电压 $v_d$]]、[[i1|流入反相端的真实电流 $i_1$]] 以及[[i_loop|流过 $R_1$ 的电流 $i$]] 的纯符号通式为：`,
          tex: R`v_d = v_s - v_1, \qquad i_1 = \frac{v_1 - v_s}{R_i} = -\frac{v_d}{R_i}, \qquad i = \frac{v_1}{R_1}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（真实 741 参数，SymPy 15 位精度验算）',
          steps: [
            { label: R`代入 $A = 2 \times 10^5$、$R_i = 2 \times 10^6\ \Omega$、$R_o = 50\ \Omega$、$R_1 = 10^4\ \Omega$、$R_f = 2 \times 10^4\ \Omega$` },
            {
              label: '1. 计算闭环增益分子与分母 · 分子',
              tex: R`\begin{aligned} A R_1 R_i + A R_f R_i + R_1 R_o &= (2\times 10^5)(10^4 + 2\times 10^4)(2\times 10^6) + (10^4)(50) \\ &= 1.2\times 10^{16} + 5\times 10^5 \end{aligned}`,
            },
            {
              label: '分母',
              tex: R`\begin{gathered} A R_1 R_i = 4\times 10^{15}, \quad R_1 R_f = 2\times 10^8, \\ R_1 R_i = 2\times 10^{10}, \quad R_1 R_o = 5\times 10^5, \\ R_f R_i = 4\times 10^{10}, \quad R_i R_o = 10^8 \end{gathered}`,
            },
            { label: '分母合计', tex: R`\text{分母合计} = 4\times 10^{15} + 6.03\times 10^{10} + 5\times 10^5 = 4{,}000{,}060{,}300{,}500{,}000` },
            { label: R`约去公因子 $5 \times 10^5$ 得精确有理数与小数`, tex: R`\frac{v_o}{v_s} = \frac{24{,}000{,}000{,}001}{8{,}000{,}120{,}601} \approx \mathbf{2.99995478}` },
            {
              label: R`2. 当 $v_s = 2\text{ V}$ 时，逐步算出各节点电压与微弱漏电流 · 精确输出电压`,
              tex: R`v_o = 2.9999547754 \times 2\text{ V} = \mathbf{5.99990955\text{ V}} \approx 5.99991\text{ V}`,
            },
            { label: '精确反相端电压', tex: R`v_1 = \mathbf{1.99996995\text{ V}} \approx 1.99997\text{ V}` },
            {
              label: '真实差模输入电压（仅**几十微伏**！）',
              tex: R`v_d = v_2 - v_1 = 2\text{ V} - 1.99996995\text{ V} = 3.00495 \times 10^{-5}\text{ V} = \mathbf{30.05\ \mu\text{V}}`,
            },
            {
              label: '流入反相输入端的真实电流（仅**皮安级**！）',
              tex: R`i_1 = -\frac{v_d}{R_i} = -\frac{30.0495\ \mu\text{V}}{2\text{ M}\Omega} = \mathbf{-15.02\text{ pA}} \qquad \left(|i_1| \approx 15.02 \times 10^{-12}\text{ A}\right)`,
            },
            {
              label: R`流过 $R_1 = 10\text{ k}\Omega$ 的回路电流 $i$（以及反馈电阻电流 $i_{R_f}$）`,
              tex: R`\begin{gathered} i = \frac{v_1}{R_1} = \frac{1.99996995\text{ V}}{10\text{ k}\Omega} = \mathbf{0.1999970\text{ mA}} \approx 0.200\text{ mA} \\[8pt] i_{R_f} = \frac{v_o - v_1}{R_f} = \frac{5.99990955 - 1.99996995}{20\text{ k}\Omega} = \mathbf{0.1999970\text{ mA}} \end{gathered}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: '**教授敲黑板**：盯着这组数字看三秒！我们费劲巴拉列了二元联立方程、处理了 $10^{16}$ 量级的代数项，最后算出闭环增益是 **`2.999955`**——跟整数 **`3`** 只差了 **`0.001507%`**！更震撼的是：节点 1 的电压是 `1.99997 V`，跟节点 2 的 `2.00000 V` 只差 **`30.05 μV`**；而钻进运放输入端的电流只有 **`15.02 pA`**，比外电路 `0.2 mA` 的主电流小了 **一千万倍以上**！在实验室里，你手里的普通 1% 精度碳膜电阻的误差都比这个大 600 倍。**这就是“理想运放”诞生的物理底气！**',
        },
      ],
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '理想运放三大假设与“虚断·虚短”黄金法则（Section 5.3 / Fig. 5.8）',
      sync: at(L2, ['v_open', 'v_short'], { w32_fb: true, w32_rules: true, w32_xray: false }),
      blocks: [
        { kind: 'p', text: '**教授讲解：从三个极限假设到两条黄金法则**' },
        {
          kind: 'p',
          text: R`既然真实 741 的 $A$ 巨大（$10^5 \sim 10^8$）、$R_i$ 巨大（$10^5 \sim 10^{13}\ \Omega$）、$R_o$ 极小（$10 \sim 100\ \Omega$），Sadiku 在 Section 5.3 正式定义了**理想运放（Ideal Op Amp）的三大理想化假设**：`,
        },
        {
          kind: 'ol',
          items: [R`[[vcvs|**开环电压增益无穷大**]]：$A \to \infty$`, R`[[ri|**输入电阻无穷大**]]：$R_i \to \infty$`, R`[[ro|**输出电阻为零**]]：$R_o \to 0$`],
        },
        {
          kind: 'p',
          text: R`由这三条假设，配合[[fb|**负反馈使运放工作在线性区（输出电压 $v_o$ 有限）**]]，立刻推出电路分析史上最锋利的两把手术刀——**理想运放黄金法则（Golden Rules）**：`,
        },
        {
          kind: 'ul',
          items: [
            R`[[v_open|**黄金法则 ① 虚断（Virtual Open）**]]：$i_1 = i_2 = 0$（由 $R_i \to \infty$ 严格保证，无论有没有负反馈都近似成立）。`,
            R`[[v_short|**黄金法则 ② 虚短（Virtual Short）**]]：$v_1 = v_2$（由 **负反馈 + 有限 $v_o$ + $A \to \infty$** 共同保证）。`,
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授高压红线警告 · 1. 没有负反馈，就没有虚短！** 一旦断开负反馈（开环状态）或错接成正反馈，哪怕输入端只有 $1\text{ mV}$ 的微小压差，乘上 $A \to \infty$ 也会让输出瞬间撞上[[rails|电源轨饱和]]（$v_o = \pm V_{CC}$），此时 $v_1 \neq v_2$，虚短彻底失效！`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**2. 虚短 ≠ 真短！** “虚短”的意思仅仅是“两输入端电位近似相等（$v_1 = v_2$）”，它们之间在物理上依然是 [[ri|$R_i \to \infty$ 的**断路**]]，**绝对没有任何电流**能从 ${code('+')} 端穿过运放内部流到 ${code('−')} 端！`,
        },
        { kind: 'figure', svg: SVG_ACT2, caption: '交互式 2D 原理图：Fig. 5.8 理想运放黄金法则高亮图（含无负反馈对照）' },
        { kind: 'p', text: '**三段式教授板书推导：从三大理想假设到黄金法则与极限验证**' },
        {
          kind: 'origin',
          title: '① 公理溯源（三大理想化假设与线性区约束）',
          text: R`在理想运放模型（Sadiku Section 5.3）中，对真实运放参数取极限：$A \to \infty, \qquad R_i \to \infty, \qquad R_o \to 0$。同时要求外部存在[[fb|**负反馈通路**]]，使运放稳定工作在**线性区**（输出电压 $v_o$ 为有限值，$-V_{CC} < v_o < +V_{CC}$）。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（严格极限推导）· 1. [[v_open|**导出黄金法则 ① —— 虚断（Virtual Open）**]]：由输入回路欧姆定律：`,
          tex: R`i_1 = \frac{v_1 - v_2}{R_i} = -\frac{v_d}{R_i}, \qquad i_2 = \frac{v_2 - v_1}{R_i} = \frac{v_d}{R_i}`,
        },
        { kind: 'formula', title: R`当 $R_i \to \infty$ 时，无论 $v_d$ 为何有限值，均有：`, tex: R`i_1 = i_2 = 0` },
        {
          kind: 'formula',
          title: R`2. [[v_short|**导出黄金法则 ② —— 虚短（Virtual Short）**]]：由受控电压源关系 $v_o = A v_d = A(v_2 - v_1)$（且 $R_o = 0$）：`,
          tex: R`v_d = v_2 - v_1 = \frac{v_o}{A}`,
        },
        {
          kind: 'formula',
          title: R`因为负反馈保证 $v_o$ 为**有限值**，当 $A \to \infty$ 时，分母趋于无穷而分子有限：`,
          tex: R`v_d = \lim_{A \to \infty} \frac{v_o}{A} = 0 \implies v_1 = v_2`,
        },
        {
          kind: 'formula',
          title: R`3. **验证第 1 幕真实通式的理想极限**：对第 1 幕求得的精确闭环增益通式分子分母同除以 $A R_1 R_i$：`,
          tex: R`\frac{v_o}{v_s} = \frac{1 + \dfrac{R_f}{R_1} + \dfrac{R_o}{A R_i}}{1 + \dfrac{R_f}{A R_i} + \dfrac{1}{A} + \dfrac{R_o}{A R_i} + \dfrac{R_f}{A R_1} + \dfrac{R_o}{A R_1}}`,
        },
        {
          kind: 'formula',
          title: R`令 $A \to \infty,\ R_i \to \infty,\ R_o \to 0$，分母所有误差项归零，瞬间坍缩为极其优雅的纯电阻比值公式：`,
          tex: R`\lim_{\substack{A\to\infty,\ R_i\to\infty \\ R_o\to 0}} \frac{v_o}{v_s} = 1 + \frac{R_f}{R_1}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（真实 741 与理想模型误差对照表）',
          steps: [
            {
              label: R`代入 Example 5.1 参数（$R_1 = 10\text{ k}\Omega,\ R_f = 20\text{ k}\Omega,\ v_s = 2\text{ V}$）`,
              tex: R`\left.\frac{v_o}{v_s}\right|_{\text{ideal}} = 1 + \frac{20\text{ k}\Omega}{10\text{ k}\Omega} = 3, \qquad v_{o,\text{ideal}} = 6\text{ V}, \qquad i_{\text{ideal}} = \frac{2\text{ V}}{10\text{ k}\Omega} = 0.2\text{ mA}`,
            },
          ],
        },
        {
          kind: 'table',
          head: ['物理量', '真实 741 精确解（Example 5.1）', '理想运放模型解（Example 5.2）', R`相对误差 $\left|\dfrac{\text{精确}-\text{理想}}{\text{理想}}\right|$`, '工程结论'],
          rows: [
            ['闭环增益 $v_o / v_s$', '$2.99995478$', '$3.00000000$', R`**$0.001507\%$**（$< 0.01\%$）`, '远优于 1% 电阻公差'],
            [R`输出电压 $v_o$（$v_s=2\text{ V}$）`, R`$5.999910\text{ V}$`, R`$6.000000\text{ V}$`, R`**$0.001507\%$**`, '万用表几乎测不出差别'],
            ['[[node_1|反相端电压 $v_1$]]', R`$1.999970\text{ V}$`, R`$2.000000\text{ V}$`, R`**$0.001502\%$**`, R`虚短 $v_1 \approx v_2$ 极度精准`],
            ['[[vd|差模电压 $v_d = v_2 - v_1$]]', R`$30.05\ \mu\text{V}$`, R`$0\text{ V}$`, '—', '仅十万分之三伏特'],
            ['[[i1|输入电流 $i_1$]]', R`$-15.02\text{ pA}$`, R`$0\text{ A}$`, '—', R`比回路电流小 $1.3 \times 10^7$ 倍`],
            ['[[i_loop|回路电流 $i$]]', R`$0.1999970\text{ mA}$`, R`$0.2000000\text{ mA}$`, R`**$0.001502\%$**（$< 0.01\%$）`, '虚断零损耗成立'],
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '最高危易错禁区——为什么绝不能对输出端直接列 KCL？',
      sync: at(L2, ['node_o', 'io'], { w32_fb: true, w32_rules: true, w32_xray: true }),
      blocks: [
        { kind: 'p', text: '**教授讲解：80% 初学者踩过的致命深坑**' },
        {
          kind: 'p',
          text: '学完虚断和虚短后，很多同学做节点分析时会惯性地想：“既然输出端 $v_o$ 是我要求的未知节点，那我直接对[[node_o|输出节点 $o$]] 列一个 KCL 不就行了吗？”',
        },
        { kind: 'p', text: '**绝对不行！立刻停笔！**' },
        {
          kind: 'p',
          text: R`为什么？因为理想运放的输出端在内部连着一个[[vcvs,ro|**输出电阻 $R_o = 0$ 的理想受控电压源**]]（由[[rails|隐藏的电源轨 $+V_{CC}, -V_{CC}$]] 源源不断地提供能量）。这就意味着：`,
        },
        {
          kind: 'ul',
          items: [
            R`运放输出端是一个[[node_o|**硬电压源节点**]]，它往外“吐出”或往里“吸入”的[[io|电流 $i_o$]] **不是零**，而且你**事先根本不知道 $i_o$ 是多少**！`,
            R`如果你一上来就对输出节点 $o$ 列 KCL，方程里必然会冒出一个全新的未知数 $i_o$，你非但消不掉 $v_o$，反而凭空多了一个未知数；更可怕的是，很多同学会**漏写 $i_o$**（以为流出运放输出端的电流是 0），直接列出 $\frac{v_o - v_1}{R_f} + \frac{v_o}{R_L} = 0$ 这种荒谬方程，导致整道题全盘皆输！`,
          ],
        },
        { kind: 'figure', svg: SVG_ACT3, caption: '交互式 2D 原理图：输出端受控源透视图与 KCL 禁区解剖' },
        { kind: 'p', text: '**三段式教授板书推导：输出端 KCL 方程的真实角色**' },
        {
          kind: 'origin',
          title: '① 公理溯源（受控电压源节点的 KCL 约束）',
          text:
            `根据 ${code('W2-L2 含电压源的节点分析')} 的规则，` +
            R`任何连接到理想电压源（含理想受控电压源）的节点，其支路电流都是独立未知量。对理想运放输出节点 $o$ 列 KCL（设流出节点为正）：$-i_o + i_f + i_L = 0$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（为何不能用来求 $v_o$，却能用来反算 $i_o$）· 整理上式得：`,
          tex: R`i_o = \frac{v_o - v_1}{R_f} + \frac{v_o}{R_L}`,
        },
        {
          kind: 'ul',
          items: [
            R`**求解 $v_o$ 阶段**：等式左侧的 $i_o$ 未知，因此该方程**不能**用于求解 $v_o$；必须先通过[[node_1|反相节点 1]] 的 KCL（利用 $i_1 = 0$ 与 $v_1 = v_2$）解出 $v_o$。`,
            R`**反算 $i_o$ 阶段**：一旦 $v_o$ 和 $v_1$ 均已求得，再把它们代回上式，**唯一且合法**地算出运放输出级必须提供的总电流 $i_o$（并检查 $|i_o| \le i_{o,\max}$ 是否超过芯片带载能力）。`,
          ],
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（直觉演示）',
          steps: [
            { label: R`若 $v_1 = 2\text{ V},\ v_o = 6\text{ V},\ R_f = 20\text{ k}\Omega$` },
            { label: R`无外部负载（$R_L \to \infty$，即 Example 5.2）`, text: R`$i_o = \dfrac{6 - 2}{20\text{ k}\Omega} + 0 = 0.2\text{ mA}$。` },
            {
              label: R`若后续并联一个 [[rl|$R_L = 2\text{ k}\Omega$ 负载]]`,
              text: R`$v_o$ 仍死死保持 $6\text{ V}$ 不变，但输出电流自动跃升为：`,
              tex: R`i_o = \frac{6 - 2}{20\text{ k}\Omega} + \frac{6}{2\text{ k}\Omega} = 0.2\text{ mA} + 3.0\text{ mA} = 3.2\text{ mA}`,
            },
          ],
        },
        { kind: 'note', tone: 'tip', text: '这恰好印证了为什么 $i_o$ 必须放到最后一步才算！' },
      ],
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '理想运放节点分析实战——Sadiku Example 5.2（Fig. 5.9）',
      sync: at(L3, ['node_1', 'node_2'], EX52_HIDDEN),
      blocks: [
        { kind: 'p', text: '**教授讲解：用三行公式秒杀 Example 5.1**' },
        {
          kind: 'p',
          text: '现在，我们用刚刚拿到的[[v_open,v_short|**理想运放黄金法则**]]和**四步节点分析 SOP**，重做第 1 幕的那道电路——这就是 Sadiku **Example 5.2 (Fig. 5.9)**：',
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**题目**：将 Fig. 5.6(a) 中的运放视为理想运放（如 **Fig. 5.9** 所示，其中 $R_1 = 10\text{ k}\Omega,\ R_f = 20\text{ k}\Omega$），求闭环电压增益 $\dfrac{v_o}{v_s}$；当 $v_s = 2\text{ V}$ 时，求输出电压 $v_o$ 与运放输出电流 $i_o$（即反馈回路电流 $i$）。`,
        },
        { kind: 'figure', svg: SVG_ACT4, caption: '交互式 2D 原理图：Fig. 5.9 Example 5.2 理想运放节点分析实战图（数值结果在引导例题之后揭晓）' },
        { kind: 'p', text: '**三段式教授板书推导：Sadiku Example 5.2 完整求解**' },
        {
          kind: 'origin',
          title: '① 公理溯源（负反馈检验 + 黄金法则 + 节点 KCL）',
          text: R`**1. 检查负反馈**：[[rf,fb|输出节点 $o$ 经 $R_f$ 接回反相输入端]]（${code('−')}），确认存在负反馈，运放工作在线性区。**2. 应用黄金法则**：$i_1 = i_2 = 0 \quad (\text{虚断}), \qquad v_1 = v_2 \quad (\text{虚短})$。**3. 锁定已知电位**：同相端直接接独立电压源 $v_s$，故：$v_2 = v_s \implies v_1 = v_s$。**4. 选定 KCL 节点（遵守禁区）**：**严禁先对输出节点 $o$ 列 KCL**；只对[[node_1|反相节点 1]] 列 KCL（流入 = 流出）：$\dfrac{v_o - v_1}{R_f} = \dfrac{v_1 - 0}{R_1} + i_1$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（分别求解闭环增益与输出电流）· 将 $i_1 = 0$ 与 $v_1 = v_s$ 代入节点 1 的 KCL 方程：`,
          tex: R`\frac{v_o - v_s}{R_f} = \frac{v_s}{R_1}`,
        },
        { kind: 'formula', title: '两边同乘 $R_f$ 并移项：', tex: R`v_o - v_s = \frac{R_f}{R_1} v_s \implies v_o = \left(1 + \frac{R_f}{R_1}\right) v_s` },
        { kind: 'formula', title: '得到闭环电压增益的纯符号通式：', tex: R`\frac{v_o}{v_s} = 1 + \frac{R_f}{R_1}` },
        {
          kind: 'formula',
          title: R`**最后一步（反算输出电流 $i_o$）**：现在 $v_o$ 和 $v_1$ 均已求得，对[[node_o|输出节点 $o$]] 列 KCL（无外接负载 $R_L$，输出电流全部流经 $R_f$）：`,
          tex: R`i_o = i = \frac{v_o - v_1}{R_f} = \frac{\left(1 + \dfrac{R_f}{R_1}\right) v_s - v_s}{R_f} = \frac{v_s}{R_1}`,
        },
        { kind: 'note', tone: 'tip', text: '③ 代入数值这一步先不写：下一幕的苏格拉底引导例题就是这道题。自己闯关之后，完整推导作为“通关复盘”板书紧跟在后面。' },
      ],
    },

    /* ------------------------------------------------------------- act 5: guided example + self-test */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '苏格拉底式分步实战引导与概念诊断测验',
      sync: at(L3, ['node_1', 'node_o'], EX52_HIDDEN),
      blocks: [
        { kind: 'figure', svg: SVG_ACT5, caption: '交互式 2D 决策树：W3-L2 黄金法则解题作战全景图' },
        {
          kind: 'guided',
          title: '苏格拉底式五步引导：Sadiku Example 5.2 (Fig. 5.9) 理想运放节点分析',
          source: 'Sadiku Fundamentals of Electric Circuits, Example 5.2, Fig. 5.9 (p. 179)',
          problem: R`理想运放，$R_1 = 10\text{ k}\Omega$，$R_f = 20\text{ k}\Omega$，$v_s = 2\text{ V}$（Fig. 5.9）。一步一步求出闭环电压增益 $\dfrac{v_o}{v_s}$、输出电压 $v_o$ 与运放输出电流 $i_o$。`,
          problem_svg: PROBLEM,
          // all five steps answered: layer 03 uncovers Example 5.2's numbers and shows step ④
          done_params: { w32_reveal: true, w32_step: 4 },
          steps: [
            {
              title: 'Step 1 · 负反馈合法性审查',
              mini_svg: MINI_STEP1,
              question: '拿到 Fig. 5.9 电路的第一秒，在你动笔写任何公式之前，必须先确认什么前提才能合法启用“虚短”法则？',
              hint: R`$\text{负反馈条件：输出 } v_o \xrightarrow{R_f} \text{反相端 } (-)\implies v_o \text{ 有限} \implies v_d = \frac{v_o}{A} \xrightarrow{A\to\infty} 0$`,
              options: [
                {
                  text: '输出端通过 20 kΩ 电阻连回反相输入端 (−)，存在负反馈通路',
                  correct: true,
                  feedback: '没错！先看输出有没有经 $R_f$ 回到反相端：有负反馈，$v_o$ 才是有限值，$v_d = v_o/A$ 才会被压到 0，虚短才有资格登场。',
                },
                {
                  text: '只要题目写了“理想运放”，不管怎么连都可以直接用 v₁ = v₂',
                  correct: false,
                  feedback: '停！掉进头号陷阱了！如果运放开环或接成正反馈，A → ∞ 会让输出瞬间撞轨饱和，此时 v₁ ≠ v₂。记住教授的话：没有负反馈就没有虚短！',
                },
                {
                  text: '必须先确认外接电源电压 $V_{CC}$ 的精确数值，否则无法列方程',
                  correct: false,
                  feedback: '电源轨用于最后核验输出是否饱和；在列写线性区符号方程前，首要前提是确认电路存在负反馈通路。',
                },
              ],
              board: [R`\text{Step 1: 输出经 } R_f \text{ 接回反相端 } (-) \implies`, R`\text{负反馈成立，启用理想运放黄金法则。}`],
              halo: ['fb', 'rf'],
              params: { ...EX52_HIDDEN, w32_step: 0 },
              layer: L3,
            },
            {
              title: 'Step 2 · 标注虚断与虚短节点约束',
              mini_svg: MINI_STEP2,
              question: '负反馈已确认。已知同相输入端直接接电压源 vₛ，请根据黄金法则直接写出节点 1（反相端）的电位 v₁ 与输入端电流 i₁、i₂。',
              hint: R`$v_2 = v_s, \quad \text{由虚短得 } v_1 = v_2 = v_s, \quad \text{由虚断得 } i_1 = i_2 = 0$`,
              options: [
                {
                  text: 'v₁ = 0（虚地），且 i₁ = i₂ = 0',
                  correct: false,
                  feedback: '别把“虚短”和“虚地”混为一谈！只有当同相端接地（v₂ = 0）时才有虚地；本题同相端接的是 vₛ，所以 v₁ 紧跟 vₛ，不是 0 V！',
                },
                {
                  text: 'v₁ = v₂ = vₛ，且 i₁ = i₂ = 0',
                  correct: true,
                  feedback: '漂亮！同相端被钉在 $v_s$，虚短让 $v_1$ 紧跟着它：$v_1 = v_2 = v_s$；而在 $R_i \\to \\infty$ 面前，两个输入端的电流都只能是 0。',
                },
                {
                  text: 'v₁ = v₂ = vₛ，但电流从同相端经虚短直接流向反相端',
                  correct: false,
                  feedback: '大忌！虚短绝不是物理导线短路！输入电阻 Rᵢ → ∞ 决定了 i₁ = i₂ = 0，没有任何电流能穿过运放两个输入端。',
                },
              ],
              board: [R`\text{Step 2: } i_1 = i_2 = 0 \;(\text{虚断}), \quad v_1 = v_2 = v_s \;(\text{虚短})`],
              halo: ['node_1', 'node_2'],
              params: { ...EX52_HIDDEN, w32_step: 1 },
              layer: L3,
            },
            {
              title: 'Step 3 · 选定合法 KCL 节点（避开输出端禁区）',
              mini_svg: MINI_STEP3,
              question: '接下来我们要列写 KCL 方程求解输出电压 vₒ。应该对哪一个节点列 KCL？并写出正确的纯符号方程。',
              hint: R`$\text{节点 1 流入电流 = 流出电流：}\frac{v_o - v_1}{R_f} = \frac{v_1 - 0}{R_1} + i_1, \quad i_1 = 0$`,
              options: [
                {
                  text: '对输出节点 o 列 KCL：$(v_o - v_1)/R_f = 0$',
                  correct: false,
                  feedback: '警报拉响！你踩进了输出端 KCL 禁区！输出端接在理想受控电压源上，流出运放的电流 iₒ ≠ 0，漏写 iₒ 会直接推导出 vₒ = v₁ 的荒谬结论！',
                },
                {
                  text: '对反相节点 1 列 KCL：$(0 - v_1)/R_1 + (v_o - v_1)/R_f = 0$',
                  correct: true,
                  feedback: '正中要害！节点 1 上只剩 $R_1$ 和 $R_f$ 两条支路（$i_1 = 0$），流入它的电流之和为零，方程里唯一的未知数就是 $v_o$。',
                },
                {
                  text: '对反相节点 1 列 KCL：$v_1/R_1 + v_o/R_f = 0$',
                  correct: false,
                  feedback: '仔细看 $R_f$ 两端的电位差！$R_f$ 跨接在 vₒ 与 v₁ 之间，流过 $R_f$ 的电流由 $(v_o - v_1)/R_f$ 决定，而不是 $v_o/R_f$（因为 v₁ ≠ 0）。',
                },
              ],
              board: [R`\text{Step 3 (节点 1 KCL): } \frac{v_o - v_1}{R_f} = \frac{v_1}{R_1} \implies \frac{v_o - v_s}{R_f} = \frac{v_s}{R_1}`],
              halo: ['node_1', 'node_o'],
              params: { ...EX52_HIDDEN, w32_step: 2 },
              layer: L3,
            },
            {
              title: 'Step 4 · 导出纯符号闭环增益并代入数值',
              mini_svg: MINI_STEP4,
              question: '化简上一步的纯符号方程得到闭环增益 vₒ/vₛ，再代入 R₁ = 10 kΩ、$R_f$ = 20 kΩ、vₛ = 2 V，算出 vₒ/vₛ 与 vₒ。',
              hint: R`$v_o = v_s + \frac{R_f}{R_1}v_s = \left(1 + \frac{R_f}{R_1}\right)v_s$`,
              options: [
                {
                  text: R`$v_o/v_s = 1 + R_f/R_1 = 3$，故 $v_o = 6\text{ V}$`,
                  correct: true,
                  feedback: R`完全正确！$v_o = v_s + \frac{R_f}{R_1} v_s$，增益 $1 + 2 = 3$，$v_o = 6\text{ V}$——和第 1 幕真实 741 的 $5.99991\text{ V}$ 几乎分不出来。`,
                },
                {
                  text: R`$v_o/v_s = -R_f/R_1 = -2$，故 $v_o = -4\text{ V}$`,
                  correct: false,
                  feedback: '那是反相放大器（输入接反相端、同相端接地）的公式！本题 vₛ 接在同相端 (+)，属于同相放大器，增益必定大于等于 1 且为正。',
                },
                {
                  text: R`$v_o/v_s = R_f/R_1 = 2$，故 $v_o = 4\text{ V}$`,
                  correct: false,
                  feedback: '移项时把左边的 −vₛ 漏掉了！$v_o/R_f = v_s/R_f + v_s/R_1$，两边同乘 $R_f$ 后常数项是 +1，所以是 $1 + R_f/R_1 = 3$。',
                },
              ],
              board: [R`\text{Step 4: } \frac{v_o}{v_s} = 1 + \frac{R_f}{R_1} = 1 + \frac{20\text{ k}\Omega}{10\text{ k}\Omega} = 3, \quad v_o = 3 \times 2\text{ V} = 6\text{ V}`],
              halo: ['r1', 'rf'],
              params: { ...EX52_HIDDEN, w32_step: 2 },
              layer: L3,
            },
            {
              title: 'Step 5 · 解禁输出节点 o，反算输出电流 iₒ',
              mini_svg: MINI_STEP5,
              question: '现在 vₒ = 6 V 与 v₁ = 2 V 均已确定。最后一步，对输出节点 o 列 KCL 反算运放输出电流 iₒ（无外接负载），其数值为多少？',
              hint: R`$i_o = \frac{v_o - v_1}{R_f} = \frac{v_s}{R_1}$`,
              options: [
                {
                  text: 'iₒ = 0 mA，因为理想运放所有引脚电流都是 0',
                  correct: false,
                  feedback: '千万别把虚断推广到输出端！只有两个输入端满足 i₁ = i₂ = 0，输出端连着受控电压源，负责向整个反馈和负载网络供电，iₒ ≠ 0！',
                },
                {
                  text: R`$i_o = (v_o - v_1)/R_f = (6 - 2)/20\text{ k}\Omega = 0.2\text{ mA}$`,
                  correct: true,
                  feedback: R`闭环！$v_o$ 与 $v_1$ 都已求出，这时对节点 o 列 KCL 才合法：$R_f$ 两端压降 $4\text{ V}$，$i_o = 0.2\text{ mA}$，与 $v_s/R_1$ 完全一致。`,
                },
                {
                  text: R`$i_o = v_o/R_f = 6/20\text{ k}\Omega = 0.3\text{ mA}$`,
                  correct: false,
                  feedback: '$R_f$ 的左端是节点 1（v₁ = 2 V），不是地（0 V）！因此 $R_f$ 两端压降是 vₒ − v₁ = 4 V，不是 6 V。',
                },
              ],
              board: [
                R`\text{Step 5 (输出端反算): } i_o = \frac{v_o - v_1}{R_f} = \frac{6\text{ V} - 2\text{ V}}{20\text{ k}\Omega} = 0.2\text{ mA}`,
                R`(\text{与真实 741 误差仅 } 0.0015\%)`,
              ],
              halo: ['node_o', 'io', 'rf'],
              params: { ...EX52_HIDDEN, w32_step: 3 },
              layer: L3,
            },
          ],
          conclusion: '五步走完——一查负反馈，二标断与短，三避输出列节点，四算电流验轨限。左侧实战台的数值已经揭晓；下面是这道题完整的代入计算，作为“通关复盘”板书。',
        },
        { kind: 'p', text: '**通关复盘 · 三段式教授板书推导：Sadiku Example 5.2 完整求解**' },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（SymPy 逐步核验）',
          steps: [
            { label: R`代入 $R_1 = 10\text{ k}\Omega$、$R_f = 20\text{ k}\Omega$、$v_s = 2\text{ V}$` },
            { label: '1. 闭环电压增益', tex: R`\frac{v_o}{v_s} = 1 + \frac{20\text{ k}\Omega}{10\text{ k}\Omega} = 1 + 2 = \mathbf{3}` },
            { label: '2. 输出电压', tex: R`v_o = 3 \times 2\text{ V} = \mathbf{6\text{ V}}` },
            {
              label: R`3. 输出电流（亦即反馈电流 $i$）`,
              tex: R`i_o = \frac{v_o - v_1}{R_f} = \frac{6\text{ V} - 2\text{ V}}{20\text{ k}\Omega} = \frac{4\text{ V}}{20 \times 10^3\ \Omega} = 2 \times 10^{-4}\text{ A} = \mathbf{0.2\text{ mA}}`,
            },
            { label: '交叉验算', text: R`$i_o = \dfrac{v_s}{R_1} = \dfrac{2\text{ V}}{10\text{ k}\Omega} = \mathbf{0.2\text{ mA}}$，完全一致！` },
          ],
        },
        { kind: 'figure', svg: SVG_ACT4_FULL, caption: 'Fig. 5.9 Example 5.2 实战仪表盘（完整标注，含与真实 741 的误差）' },
        { kind: 'p', text: '**W3-L2 核心概念诊断测验（黄金法则边界与 KCL 禁区）**' },
      ],
      quiz: [
        {
          id: 'w3l2_q1',
          question: '某理想运放供电为 ±15 V，未接任何反馈电阻（开环工作）。若反相端接 0 V、同相端接 +0.5 mV，关于该电路的判断正确的是：',
          options: [
            {
              key: 'A',
              text: '因为是理想运放，虚短必然成立，所以反相端电位被拉升至 +0.5 mV',
              correct: false,
              feedback: R`“理想”并不自带虚短：没有反馈，就没有任何机制把 $v_1$ 拉向 $v_2$。$A \to \infty$ 只会把 $+0.5\text{ mV}$ 的压差放大成饱和输出，反相端仍然是 0 V。`,
            },
            {
              key: 'B',
              text: '无负反馈时虚短和虚断同时失效，输入端产生极大短路电流',
              correct: false,
              feedback: R`只说对了一半：虚短确实失效了，但虚断来自 $R_i \to \infty$，与有没有反馈无关——两输入端之间依然是断路，$i_1 = i_2 = 0$，不会出现短路电流。`,
            },
            { key: 'C', text: '无负反馈时虚短失效，输出端直接正向饱和至 +15 V，但虚断 i₁ = i₂ = 0 仍成立', correct: true },
            {
              key: 'D',
              text: '输出电压为 0 V，因为 +0.5 mV 太小不足以驱动运放',
              correct: false,
              feedback: R`恰恰相反：开环增益 $A \to \infty$，哪怕按真实 741 的 $2 \times 10^5$ 算，$0.5\text{ mV}$ 乘上去也有 $100\text{ V}$，远超供电，输出直接撞上 $+15\text{ V}$。`,
            },
          ],
          feedback_correct: R`没有负反馈就没有虚短！开环时 $A \to \infty$ 使微小正压差 $+0.5\text{ mV}$ 立即驱动输出饱和至 $+V_{CC} = +15\text{ V}$，此时 $v_1 = 0\text{ V} \ne v_2 = +0.5\text{ mV}$；但输入电阻 $R_i \to \infty$ 依然成立，因此虚断 $i_1 = i_2 = 0$ 仍然有效。`,
          feedback_wrong: '回想第 2 幕的红线警告：虚短靠什么成立？虚断又靠什么成立？',
          figure: SVG_Q1,
          sync: at(L2, ['fb'], { w32_fb: true, w32_rules: false, w32_xray: false }),
        },
        {
          id: 'w3l2_q2',
          question: '使用节点分析法求解理想运放电路的输出电压 vₒ 时，为什么教材严禁第一步直接对运放输出端列 KCL？',
          options: [
            {
              key: 'A',
              text: R`因为理想运放输出端是 $R_o = 0$ 的受控电压源，输出电流 $i_o$ 未知且非零，先列 KCL 会引入多余未知数（漏写 $i_o$ 则直接算错）`,
              correct: true,
            },
            {
              key: 'B',
              text: '因为基尔霍夫电流定律（KCL）在运放输出节点不成立',
              correct: false,
              feedback: R`KCL 在任何节点都永远成立，运放输出节点也不例外——电荷守恒不会因为接了运放就失效。问题不在定律，而在这个节点上多出来的未知电流 $i_o$。`,
            },
            {
              key: 'C',
              text: '因为输出端电阻太大，导致支路电流太小无法测量',
              correct: false,
              feedback: R`方向反了：理想运放的输出电阻是 $R_o = 0$，不是“太大”；而且禁区与电流能不能测量无关，关键是 $i_o$ 是一个事先不知道的未知数。`,
            },
            {
              key: 'D',
              text: R`因为输出端电位总是等于供电电压 $+V_{CC}$，不需要列方程`,
              correct: false,
              feedback: R`只有开环饱和时输出才贴在电源轨上；有负反馈的线性区里 $v_o$ 是待求量（Example 5.2 里它是 $6\text{ V}$，不是 $15\text{ V}$），当然要列方程求。`,
            },
          ],
          feedback_correct: R`KCL 在任何节点都永远成立！不能先对输出端列 KCL 求 $v_o$，是因为输出端连着理想受控电压源，流出运放的电流 $i_o$ 是一个未知独立变量；只有先通过输入端 KCL 算出 $v_o$ 后，最后才能用输出端 KCL 反算 $i_o$。`,
          feedback_wrong: '回想第 3 幕：输出端连着什么元件？它的电流事先知道吗？',
          figure: SVG_Q2,
          sync: at(L2, ['node_o'], { w32_fb: true, w32_rules: true, w32_xray: false }),
        },
        {
          id: 'w3l2_q3',
          question: '一位同学看到理想运放满足“虚短 v₁ = v₂”，于是将两输入端用一条导线等效短接，并认为信号源的电流可以从同相端直接流向反相端。他的错误本质在于：',
          options: [
            {
              key: 'A',
              text: '忘记了负反馈会让 v₁ = −v₂ 而不是 v₁ = v₂',
              correct: false,
              feedback: R`负反馈带来的是 $v_1 = v_2$（同号同值），从来不是 $v_1 = -v_2$；何况这位同学错的不是符号，而是把“等电位”画成了一根导线。`,
            },
            {
              key: 'B',
              text: '只有反相放大器才能用虚短，同相放大器不能用虚短',
              correct: false,
              feedback: R`虚短不挑放大器种类：同相、反相放大器只要有负反馈都满足 $v_1 = v_2$（Example 5.2 就是同相放大器）。这位同学的错误在于把等电位当成了真导线。`,
            },
            {
              key: 'C',
              text: R`没有考虑 $50\ \Omega$ 输出电阻 $R_o$ 的分流作用`,
              correct: false,
              feedback: R`$R_o$ 在输出端，跟两输入端之间有没有电流毫无关系；理想运放里 $R_o = 0$，也谈不上“分流”。真正的问题出在两输入端之间那道 $R_i \to \infty$ 的断口。`,
            },
            { key: 'D', text: R`混淆了“虚短”与“物理真短”：两输入端仅等电位，物理上因 $R_i \to \infty$ 仍处于断路状态，绝无电流通过`, correct: true },
          ],
          feedback_correct: R`“虚短”是负反馈与无穷大开环增益共同制造的等电位假象（$v_1 = v_2$），而两输入端之间依然横亘着 $R_i \to \infty$ 的高阻断口（$i_1 = i_2 = 0$）。把虚短画成真实导线会导致严重的电流分流错误。`,
          feedback_wrong: '回想第 2 幕的第二条红线：虚短 ≠ 真短。两输入端之间到底是什么？',
          figure: SVG_Q3,
          sync: at(L2, ['node_1', 'node_2'], { w32_fb: true, w32_rules: false, w32_xray: false }),
        },
        {
          id: 'w3l2_q4',
          question: R`在 Sadiku Example 5.2 (Fig. 5.9, $R_1 = 10\text{ k}\Omega$, $R_f = 20\text{ k}\Omega$, $v_s = 2\text{ V}$) 的输出节点 o 额外并联一个 $R_L = 3\text{ k}\Omega$ 的接地负载电阻，采用理想运放模型（供电 ±15 V），则输出电压 vₒ 与运放输出电流 iₒ 分别为：`,
          options: [
            {
              key: 'A',
              text: 'vₒ = 6 V，iₒ = 0.2 mA（接负载不影响输出电流）',
              correct: false,
              feedback: R`$v_o$ 对了，$i_o$ 错了：$R_L$ 接在输出节点上，它的电流 $v_o/R_L$ 也要由运放输出端供给。输出端 KCL 必须把 $R_f$ 和 $R_L$ 两条支路都算进去。`,
            },
            { key: 'B', text: 'vₒ = 6 V，iₒ = 2.2 mA（vₒ 保持不变，输出端 KCL 反算 iₒ = 0.2 mA + 2.0 mA）', correct: true },
            {
              key: 'C',
              text: 'vₒ = 4 V，iₒ = 2.0 mA（负载拉低了输出电压）',
              correct: false,
              feedback: R`理想运放 $R_o = 0$，输出端是硬电压源：接负载只改变它要供出的电流，不会拉低 $v_o$。节点 1 的 KCL 里根本没有 $R_L$，所以 $v_o$ 仍是 $(1 + R_f/R_1)v_s$。`,
            },
            {
              key: 'D',
              text: 'vₒ = 6 V，iₒ = 2.0 mA（输出电流全部流向负载）',
              correct: false,
              feedback: R`漏掉了反馈支路：输出端除了流向负载的 $6\text{ V}/3\text{ k}\Omega$，还有经 $R_f$ 流回节点 1 的 $(v_o - v_1)/R_f$，两者都由 $i_o$ 供给。`,
            },
          ],
          feedback_correct: R`理想运放输出电阻 $R_o = 0$，接上 $R_L = 3\text{ k}\Omega$ 后节点 1 的 KCL 方程不变，故 $v_o$ 仍稳稳保持 $6\text{ V}$（未超 $\pm 15\text{ V}$）。最后对输出节点 o 列 KCL 反算：$i_o = \dfrac{v_o - v_1}{R_f} + \dfrac{v_o}{R_L} = \dfrac{6-2}{20\text{ k}\Omega} + \dfrac{6}{3\text{ k}\Omega} = 0.2\text{ mA} + 2.0\text{ mA} = 2.2\text{ mA}$。`,
          feedback_wrong: '先问节点 1 的 KCL 里有没有 $R_L$；再对输出节点 o 数一数有几条支路要由 iₒ 供电。',
          figure: SVG_Q4,
          sync: at(L3, ['rl', 'node_o'], { w32_step: 0, w32_rl: 0, w32_cmp: false, w32_reveal: true }),
        },
      ],
      after_quiz: [
        { kind: 'p', text: '**下节预告：W3-L3 反相放大器（虚地推导、输入电阻与 ±9V 双电源面包板实测）**' },
        {
          kind: 'p',
          text: R`今天的 Example 5.2 把信号接在同相端；下节课把信号经 $R_1$ 送进反相端、同相端直接接地。黄金法则一条不变：虚短让 $v_1 = v_2 = 0$——这就是第 5 幕引导例题里提到的“虚地”。再加上虚断和节点 1 的 KCL，三行就能写出反相放大器的增益，然后在 $\pm 9\text{ V}$ 双电源的面包板上亲手验证它。`,
        },
        { kind: 'figure', svg: SVG_NEXT, caption: '下节预告 W3-L3：同相端接地，反相端成为“虚地”' },
      ],
    },
  ],
};

export default W3_L2;
