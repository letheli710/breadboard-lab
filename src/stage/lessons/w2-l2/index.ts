// W2-L2 · 含电压源的节点分析与超节点（Supernode） (lesson sheet: docs/lessons/W2-L2.md).
// The professor's text, formulas, the act diagrams (svgs.ts), the guided example and the
// diagnostic quiz are reproduced from the sheet. Changes from the sheet, all of form, none of
// wording:
// - the opening statement (教授开场白) opens act 1;
// - `$$…$$` display formulas sit in the ② blue / ③ green cards; prose between display formulas
//   in one step goes into the step's TeX as \text{…} lines; the in-list KVL formula of act 2
//   stays inline; nested bullets are flattened (sub-bullets follow their item, or run on in it);
// - the hints of the guided JSON (`hint_latex`) mix Chinese and TeX: the Chinese runs as text,
//   the maths as $…$; the long board line of step 5 is split in two;
// - act titles drop the sheet's build notes (act 5's "（`guided_derivation` JSON）", act 6's
//   "与 Claude 工程落地清单" — that checklist is for the build, not the student);
// - Q4's `V_d`, `i_x` run as TeX;
// - the sheet puts every right answer first (option A): `pick` / `relabel` show the options in a
//   mixed order (the source keeps the sheet's order);
// - the layer labels are shortened for the lens bar (the sheet's full labels are the captions' subject);
// - [[id|…]] only links a term to the stage (the words are unchanged).
// Added (the sheet has none): the hover map; praise for the right guided options; feedback for
// each wrong quiz option; the four quiz diagrams; act 6's one-line lead-in.
// Anti-spoiler check: the guided example (Is1 = 6 A, Vs = 3 V …) is not the circuit of any act's
// ③ calculation, so no calculation had to move behind it.

import { lazy } from 'react';
import type { QuizOption, StageLesson } from '../../types';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT6, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './svgs';

const Case1Layer = lazy(() => import('./Case1Layer'));
const SupernodeLayer = lazy(() => import('./SupernodeLayer'));
const SolverLayer = lazy(() => import('./SolverLayer'));

const L1 = 'layer_01';
const L2 = 'layer_02';
const L3 = 'layer_03';

/** the sheet lists every right answer first: show the options in a mixed order (indices into the sheet's list) */
const pick = <T>(xs: T[], order: number[]): T[] => order.map((i) => xs[i]);
/** the same for quiz options, re-keyed A, B, C … in the order shown */
const relabel = (xs: QuizOption[], order: number[]): QuizOption[] => order.map((i, k) => ({ ...xs[i], key: 'ABCDEF'[k] }));

const ACT2_CIRCUIT = { l2_circuit: 'act2', sn_loop: true, sn_rp: true, sn_kvl: true };

const W2_L2: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Case1Layer, [L2]: SupernodeLayer, [L3]: SolverLayer },
  lesson_meta: {
    lesson_id: 'W2-L2',
    world: 'World 2 · 网络分析与电路定理',
    title: '含电压源的节点分析与超节点（Supernode）',
    subtitle: 'Nodal Analysis with Voltage Sources & Supernode Technique',
    lesson_type: 'B',
    lesson_type_label: 'Type B (纯公式/方法论课)',
    estimated_minutes: 35,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release（Charles K. Alexander, Matthew N. O. Sadiku, & Fredette）',
      sections: ['Section 3.3 Nodal Analysis with Voltage Sources'],
    },
    prerequisites: ['W1-L5 KCL（基尔霍夫电流定律）', 'W1-L6 KVL（基尔霍夫电压定律）', 'W2-L1 节点分析法（标准纯电流源电路）'],
    learning_objectives: [
      '识别节点分析中含电压源的两种典型拓扑：Case 1（接地电压源）与 Case 2（悬空电压源）。',
      '理解理想电压源支路电流无法直接用欧姆定律表示为节点电压函数的原因，掌握用“闭合高斯面（超节点）”消去未知支路电流的本质。',
      '熟练列出超节点外边界 KCL 方程与内部 KVL 电位约束方程，并准确处理超节点内部并联电阻的消元技巧。',
      '掌握含受控电压源（CCVS/VCVS）超节点的完整求解流程（含控制量替换方程）及参考地选点降维策略。',
    ],
    pass_message: '超节点诊断测验通过！',
    next_lesson: 'W2-L3',
    next_lesson_title: '网孔分析法与超网孔（Mesh & Supermesh Analysis）',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 接地源直锁 (Case 1)',
        short: '01 接地源直锁',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '展示理想电压源一端接非参考节点、另一端接参考地时，直接锁定节点电位 v1 = Vs，使未知数个数减 1 的降维机制。',
      },
      {
        id: L2,
        label: '02 超节点虚线包围 (Case 2)',
        short: '02 超节点包围',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '动态演示悬空电压源与两端非参考节点被醒目虚线闭合圈包裹成超节点（Supernode），可视化穿过外边界的所有支路电流，以及内部并联电阻电流自抵消的物理图像。',
      },
      {
        id: L3,
        label: '03 KCL+KVL 联动求解台',
        short: '03 联动求解',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '将左侧原理图支路与右侧板书方程实时联动：悬停方程中的每一项（外边界电流项或 KVL 约束项），左侧对应支路电流箭头或电压源极性同步高亮，并支持一键切换独立源 / 受控源超节点模式。',
      },
    ],
    hover_map: {
      // layer 01 · Case 1
      c1_vs: { label: '接地电压源 Vₛ', desc: '一端接节点 1、另一端接参考地：直接锁定 v₁ = Vₛ（拖动滑块改变 Vₛ）' },
      c1_node1: { label: '节点 1（电位锁定）', desc: 'v₁ = Vₛ 已知：不用对它列 KCL，未知数少 1 个' },
      c1_node2: { label: '节点 2（唯一的未知节点）', desc: '只剩 v₂ 未知：对它列 1 条 KCL 即可' },
      c1_r1: { label: 'R₁ = 2 Ω（节点 1–2）', desc: 'i₁ = (v₂ − v₁)/R₁，离开节点 2 为正' },
      c1_r2: { label: 'R₂ = 4 Ω（节点 2–地）', desc: 'i₂ = v₂/R₂，离开节点 2 为正' },
      c1_is: { label: '电流源 Iₛ = 4 A', desc: '从地向上流入节点 2' },
      gnd: { label: '参考地（0 V）', desc: '所有节点电位都相对它度量' },
      // layers 02 / 03 · the act-2 circuit
      sn_loop: { label: '超节点 (2, 3) 的虚线闭合面', desc: '包住 Vₛ₂、Rₚ 和节点 2、3：外边界 KCL 只看穿过它的电流' },
      sn_cross: { label: '穿过外边界的 4 条支路电流', desc: 'i₁、i₂、i₃ 流出，Iₛ 流入：外边界 KCL 只写这 4 项' },
      sn_vs1: { label: '接地电压源 Vₛ₁ = 10 V（节点 1）', desc: 'Case 1：直接锁定 v₁ = 10 V' },
      sn_vs2: { label: '悬空电压源 Vₛ₂ = 5 V', desc: '两端都不接地：+ 接节点 2，− 接节点 3' },
      sn_kvl: { label: '内部 KVL 约束 v₂ − v₃ = 5 V', desc: '高电位端（+）减低电位端（−）等于 Vₛ₂：盯紧极性' },
      sn_rp: { label: '内部并联电阻 Rₚ = 5 Ω', desc: '电流在闭合面内一进一出：外边界 KCL 可忽略；求 Vₛ₂ 的电流时要算回来' },
      sn_ivs: { label: '电压源电流 i_Vs2', desc: '闭合面内部的“内力”：列外边界 KCL 时自动消去，需要时再回代' },
      sn_r1: { label: 'R₁ = 2 Ω 支路（i₁）', desc: '节点 1–2：i₁ = (v₂ − v₁)/R₁，离开超节点为正' },
      sn_r2: { label: 'R₂ = 4 Ω 支路（i₂）', desc: '节点 2–地：i₂ = v₂/R₂，离开超节点' },
      sn_r3: { label: 'R₃ = 3 Ω 支路（i₃）', desc: '节点 3–地：i₃ = v₃/R₃，离开超节点' },
      sn_is: { label: '电流源 Iₛ = 2 A', desc: '从地向上流入节点 3：流入超节点' },
      sn_node2: { label: '节点 2（v₂）', desc: '超节点内的一个节点：电位与 v₃ 相差 5 V' },
      sn_node3: { label: '节点 3（v₃）', desc: '超节点内的另一个节点：v₃ = v₂ − 5' },
      // layer 03 · reference moved to node 3
      rf_gnd: { label: '新参考地：节点 3', desc: '参考地接在悬空 Vₛ₂ 的一端：Case 2 退化为 Case 1，v₂′ = 5 V' },
      rf_sn01: { label: '新超节点 (0, 1)', desc: '原来的地线（节点 0）不再是参考点：Vₛ₁ 两端都悬空，仍须构造超节点' },
      // layer 03 · act 4's CCVS circuit
      cc_loop: { label: '受控源超节点 (2, 3)', desc: '包住受控源 4iₓ 和节点 2、3：外边界 KCL + 内部 KVL' },
      cc_dep: { label: '流控电压源 4iₓ（菱形）', desc: '+ 接节点 2，− 接节点 3：v₂ − v₃ = 4iₓ' },
      cc_ix: { label: '控制量 iₓ', desc: '流经 R₁ 向下的电流：iₓ = v₁/R₁，要翻译成节点电压' },
      cc_is1: { label: '电流源 Iₛ₁ = 4 A', desc: '从地向上流入节点 1' },
      cc_node1: { label: '普通节点 1', desc: '不在超节点里：照常列 KCL' },
      cc_r1: { label: 'R₁ = 4 Ω（节点 1–地）', desc: '流过它的就是控制电流 iₓ' },
      cc_r2: { label: 'R₂ = 2 Ω（节点 1–2）', desc: '唯一连接节点 1 与超节点的支路' },
      cc_r3: { label: 'R₃ = 6 Ω（节点 2–地）', desc: '穿过超节点外边界，向下流出' },
      cc_r4: { label: 'R₄ = 3 Ω（节点 3–地）', desc: '穿过超节点外边界，向下流出' },
      // layer 02 · act 5's guided example
      gd_loop: { label: '超节点 (1, 2)', desc: '包住 3 V 电压源、Rₚ 和节点 1、2' },
      gd_cross: { label: '穿过超节点 (1, 2) 外边界的支路', desc: 'Iₛ₁、R₁、R₂、Iₛ₂ 这 4 条支路穿过虚线' },
      gd_vs: { label: '悬空电压源 Vₛ = 3 V', desc: '− 接节点 1，+ 接节点 2' },
      gd_rp: { label: '并联电阻 Rₚ = 3 Ω', desc: '两端就是节点 1、2：与 3 V 电压源完全并联' },
      gd_is1: { label: '电流源 Iₛ₁ = 6 A', desc: '从地向上流入节点 1' },
      gd_is2: { label: '电流源 Iₛ₂ = 1 A', desc: '向下流出节点 2' },
      gd_r1: { label: 'R₁ = 3 Ω（节点 1–地）', desc: '节点 1 接地的电阻' },
      gd_r2: { label: 'R₂ = 6 Ω（节点 2–地）', desc: '节点 2 接地的电阻' },
      gd_is: { label: '电压源电流 iₛ', desc: '流经 3 V 电压源，方向由节点 1 指向节点 2' },
      gd_node1: { label: '节点 1（v₁）', desc: '超节点 (1, 2) 里电位较低的一端（接 −）' },
      gd_node2: { label: '节点 2（v₂）', desc: '超节点 (1, 2) 里电位较高的一端（接 +）' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '破局困境——理想电压源为何让普通节点法“卡壳”？（Case 1 接地直锁电位）',
      sync: { layer: L1, halo: ['c1_node1', 'c1_vs'], params: { c1_lock: true, c1_vs: 10 } },
      blocks: [
        {
          kind: 'p',
          text:
            String.raw`**教授开场白**：上一讲（` +
            '`W2-L1`' +
            String.raw`）我们用标准节点分析法干净利落地解决了只含电阻和电流源的电路——每一条支路的电流都能顺理成章地写成 $\frac{v_a - v_b}{R}$。但只要电路里冒出一个**理想电压源**，很多同学写着写着就突然卡壳了：“教授，电压源里没有电阻，它的电流 $i_{V_s}$ 怎么用节点电压写出来？”`,
        },
        {
          kind: 'p',
          text: '别慌！这正是 Sadiku 教材 **Section 3.3** 要教给你的核心武器：**电压源从来不是节点分析法的绊脚石，恰恰相反，它是来帮你“减少未知数”的送分题！** 今天这一课，我们用 6 幕把 **Case 1（接地电压源）**、**Case 2（悬空电压源与超节点）**、**并联电阻消元技巧** 以及 **受控电压源超节点** 一次讲透。',
        },
        {
          kind: 'p',
          text: String.raw`在标准节点分析法中，我们对每一个非参考节点列写 KCL 方程，前提是**每条支路的电流都能表达为节点电压的显式函数**。对于电阻支路，欧姆定律给出了 $i = \frac{v_a - v_b}{R}$；对于理想电流源支路，电流直接等于已知常数 $I_s$。`,
        },
        {
          kind: 'p',
          text: String.raw`然而，[[c1_vs|**理想电压源（Ideal Voltage Source）**]] 的内阻 $R_{\text{int}} = 0$（电导 $G \to \infty$），它的伏安特性是“无论流过多少电流，两端电压恒为 $V_s$”。这意味着**理想电压源的支路电流无法直接用它两端的节点电压求出来**——如果你硬把它的电流设为一个新的未知量 $i_{V_s}$，方程里就会平白多出一个未知数。`,
        },
        { kind: 'p', text: '怎么办？我们根据理想电压源的连接位置，把所有情况一分为二：' },
        {
          kind: 'ul',
          items: [
            String.raw`[[c1_vs|**Case 1（接地电压源）**]]：电压源连接在**某个非参考节点**与[[gnd|**参考节点（地）**]]之间。这简直是天上掉馅饼！你根本不需要对该节点列 KCL 方程，因为[[c1_node1|该节点的电位已经被电压源直接“锁死”为已知值]]：$v_1 = V_s$（若电压源负端接该节点、正端接地，则 $v_1 = -V_s$）。不仅没有增加难度，反而直接消去了一个未知数！`,
          ],
        },
        { kind: 'p', text: '**教授三段式板书推导（Case 1 简化例）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: String.raw`在节点 1 与参考地（$0\text{ V}$）之间直接跨接了理想电压源 $V_s$，根据电势差的定义，[[c1_node1|节点 1 的对地电位 $v_1$ 被唯一固定]]，无需再对节点 1 列写 KCL 方程；只需对剩余的[[c1_node2|非参考节点 2]] 运用 KCL（流出节点 2 的电阻支路电流之和等于流入节点 2 的独立电流源电流）即可直接解出 $v_2$。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（General Formula）',
          tex: String.raw`\begin{gathered} v_1 = V_s \\[4pt] \frac{v_2 - v_1}{R_1} + \frac{v_2}{R_2} = I_s \end{gathered}`,
        },
        {
          kind: 'formula',
          title: '将 $v_1 = V_s$ 代入节点 2 的 KCL 方程并整理，得节点 2 电位通式：',
          tex: String.raw`v_2\left(\frac{1}{R_1} + \frac{1}{R_2}\right) = I_s + \frac{V_s}{R_1}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            { label: '已知', text: String.raw`$V_s = 10\text{ V}$，$R_1 = 2\ \Omega$，$R_2 = 4\ \Omega$，$I_s = 4\text{ A}$` },
            { label: 'Step A（锁定接地节点电位）', tex: String.raw`v_1 = 10\text{ V}` },
            { label: 'Step B（列写节点 2 的 KCL 方程）', tex: String.raw`\frac{v_2 - 10}{2} + \frac{v_2}{4} = 4` },
            { label: 'Step C（两边同乘最小公倍数 $4$ 消分母）', tex: String.raw`\begin{gathered} 2(v_2 - 10) + v_2 = 16 \\ 3v_2 - 20 = 16 \implies 3v_2 = 36 \end{gathered}` },
            { label: 'Step D（求解并回代验算）', tex: String.raw`v_2 = 12\text{ V}` },
            {
              label: '验算',
              text: String.raw`流经 $R_1$ 离开节点 2 的电流 $i_1 = \frac{12 - 10}{2} = 1\text{ A}$，流经 $R_2$ 离开节点 2 的电流 $i_2 = \frac{12}{4} = 3\text{ A}$，流出总和 $1 + 3 = 4\text{ A} = I_s$，完全守恒！`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '本幕 2D 原理图（Case 1：接地电压源直锁电位）',
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: 'Case 2 与超节点（Supernode）的诞生——用“闭合高斯面”绕开未知电流',
      sync: { layer: L2, halo: ['sn_loop', 'sn_cross'], params: ACT2_CIRCUIT },
      blocks: [
        {
          kind: 'p',
          text: '真正的重头戏来了！如果理想电压源**两端都不接地**，而是[[sn_vs2|**悬空（Floating）**]] 接在两个非参考节点（例如节点 2 与节点 3）之间，我们称之为 **Case 2**。',
        },
        {
          kind: 'p',
          text: String.raw`此时，$v_2$ 和 $v_3$ 都不是已知数，你不能像 Case 1 那样直接读出电位；与此同时，[[sn_ivs|电压源支路电流 $i_{V_s}$]] 依然未知，你单独对节点 2 或节点 3 列 KCL 时都会被 $i_{V_s}$ 卡住。`,
        },
        {
          kind: 'p',
          text: '那电路学家们想出了什么绝妙的破局之法？**把视角拉高一层，[[sn_loop|画一个闭合虚线圈]]，把电压源以及它两端的两个非参考节点整体包起来！** 这个广义节点就叫做 [[sn_loop|**超节点（Supernode）**]]。',
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '**超节点（Supernode）的正式定义**（Sadiku Section 3.3）：由连接在两个非参考节点之间的电压源（独立或受控）以及与其并联的任何元件共同构成的闭合区域，称为**超节点**。',
        },
        { kind: 'p', text: '为什么这么一包就柳暗花明了？记住超节点的**三大铁律**：' },
        {
          kind: 'ol',
          items: [
            String.raw`[[sn_cross|**外边界 KCL 消去未知电流**]]：根据 KCL 的广义形式（闭合面电流守恒，宛如电磁学里的“闭合高斯面”），**流出超节点外边界的所有支路电流代数和必为零**。原本棘手的[[sn_ivs|电压源电流 $i_{V_s}$]] 彻底成了闭合面内部的“内力”，一进一出在数学上自动抵消！`,
            String.raw`[[sn_kvl|**补齐一条内部 KVL 约束方程**]]：包成一个超节点后，原来 2 个节点的 2 条 KCL 方程合并成了 1 条超节点 KCL 方程，方程数少了 1 个。别急，我们还没用上电压源的电压值 $V_s$ 呢！沿着超节点内部经过电压源和参考地走一圈 KVL，立刻得到[[sn_kvl|**电位约束方程**]]：$v_2 - v_3 = V_{s2}$（高电位端减低电位端等于电源电压值，务必盯紧 ` +
              '`+` / `−`' +
              ' 极性！）',
            '**超节点的本质属性与“并联电阻隐身术”**：',
          ],
        },
        {
          kind: 'ul',
          items: [
            String.raw`**超节点本身不具备单一电压**（它内部包含两个电位不同的节点 $v_2 \neq v_3$），但**整个超节点同时满足 KCL 与 KVL**。`,
            String.raw`**经典简化技巧**：任何与悬空电压源**直接并联**在超节点内部的电阻（例如下图的 [[sn_rp|$R_p$]]），它的支路电流完全在超节点内部循环，不穿过虚线外边界，因此在**列写超节点外边界 KCL 方程时可以完全忽略不计**！（它不影响节点电位 $v_2, v_3$ 的求解；只有在最后需要单独求电压源自身流过的电流 $i_{V_{s2}}$ 时，才需要回到单个节点把 $R_p$ 的电流算回来。）`,
          ],
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '本幕 2D 原理图（Case 2：悬空电压源与超节点虚线高斯面）',
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '经典标准算例实战（Case 1 + Case 2 + 并联电阻消元）',
      sync: { layer: L3, halo: ['sn_loop', 'sn_rp'], params: { l3_mode: 'std', l3_step: 0 } },
      blocks: [
        { kind: 'p', text: '**教授三段式板书推导（严格分离公理、符号与数值）**' },
        {
          kind: 'p',
          text: String.raw`针对第二幕给出的完整 3 节点电路（含[[sn_vs1|接地电压源 $V_{s1}$]]、[[sn_vs2|悬空电压源 $V_{s2}$]] 以及[[sn_rp|超节点内部并联电阻 $R_p$]]），我们来走一遍最规范的教授三段式板书推导，并顺带揭示**为什么 $R_p$ 会在超节点 KCL 中自动抵消**。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: String.raw`**为什么需要超节点**：设流经悬空电压源 $V_{s2}$（从节点 3 到节点 2）的未知电流为 [[sn_ivs|$i_{V_{s2}}$]]，流经并联电阻 $R_p$（从节点 2 到节点 3）的电流为 [[sn_rp|$i_{R_p}$]]。`,
        },
        {
          kind: 'ul',
          items: [
            String.raw`单独对节点 2 列 KCL：$i_1 + i_2 + i_{R_p} - i_{V_{s2}} = 0$`,
            String.raw`单独对节点 3 列 KCL：$i_3 - I_s - i_{R_p} + i_{V_{s2}} = 0$`,
            String.raw`将两式直接相加，**内部未知电流 $-i_{V_{s2}}$ 与 $+i_{V_{s2}}$ 精确抵消，并联电阻电流 $+i_{R_p}$ 与 $-i_{R_p}$ 也精确抵消！** 剩下的恰好就是[[sn_cross|穿过虚线闭合面的 4 条外边界支路电流]]之和为零。`,
          ],
        },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）· 续',
          text: String.raw`**为什么必须补 KVL 约束**：闭合面把 2 条节点方程合成了 1 条，必须沿“参考地 $\to$ 节点 3 $\to V_{s2} \to$ 节点 2 $\to$ 参考地”列写 KVL，利用 [[sn_kvl|$V_{s2}$ 的极性]]建立 $v_2$ 与 $v_3$ 的线性电位差关系。`,
        },
        { kind: 'formula', title: '② 纯符号通式（General Formula）· 1. **Case 1 接地节点电位锁定**：', tex: String.raw`v_1 = V_{s1}` },
        {
          kind: 'formula',
          title: '2. **Case 2 超节点 $(2, 3)$ 外边界 KCL 通式**（$R_p$ 已消去）：',
          tex: String.raw`\frac{v_2 - v_1}{R_1} + \frac{v_2}{R_2} + \frac{v_3}{R_3} = I_s`,
        },
        { kind: 'formula', title: '3. **超节点内部 KVL 约束方程通式**（正极接节点 2，负极接节点 3）：', tex: String.raw`v_2 - v_3 = V_{s2} \iff v_3 = v_2 - V_{s2}` },
        {
          kind: 'formula',
          title: '4. **超节点内电压源支路电流回代通式**（仅在题目追问 $i_{V_{s2}}$ 时使用，此时须恢复 $R_p$）：',
          tex: String.raw`i_{V_{s2}} = \frac{v_2 - v_1}{R_1} + \frac{v_2}{R_2} + \frac{v_2 - v_3}{R_p}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            {
              label: '代入第二幕原理图参数',
              text: String.raw`$V_{s1} = 10\text{ V}$，$V_{s2} = 5\text{ V}$，$R_1 = 2\ \Omega$，$R_2 = 4\ \Omega$，$R_3 = 3\ \Omega$，$R_p = 5\ \Omega$，$I_s = 2\text{ A}$`,
            },
            {
              label: 'Step A（锁定 Case 1 节点并忽略内部 $R_p$，列外边界 KCL）',
              tex: String.raw`\begin{gathered} v_1 = 10\text{ V} \\ \frac{v_2 - 10}{2} + \frac{v_2}{4} + \frac{v_3}{3} = 2 \end{gathered}`,
            },
            {
              label: 'Step B（通分去分母：两边同乘 $2, 4, 3$ 的最小公倍数 $12$）',
              tex: String.raw`\begin{gathered} 6(v_2 - 10) + 3v_2 + 4v_3 = 24 \\ 9v_2 + 4v_3 = 84 \quad \text{(方程 ①)} \end{gathered}`,
            },
            {
              label: 'Step C（列写超节点内部 KVL 约束方程并代入消元）',
              tex: String.raw`\begin{gathered} v_2 - v_3 = 5 \implies v_3 = v_2 - 5 \quad \text{(方程 ②)} \\ \text{将方程 ② 代入方程 ①：} \\ 9v_2 + 4(v_2 - 5) = 84 \\ 13v_2 - 20 = 84 \implies 13v_2 = 104 \end{gathered}`,
            },
            {
              label: 'Step D（求解节点电位并回代验证，顺求电压源电流 $i_{V_{s2}}$）',
              tex: String.raw`v_2 = \frac{104}{13} = 8\text{ V}, \qquad v_3 = 8 - 5 = 3\text{ V}`,
            },
            {
              label: '外边界 KCL 验算',
              text: String.raw`$i_1 = \frac{8 - 10}{2} = -1\text{ A}$（即有 $1\text{ A}$ 从节点 1 流入超节点）；$i_2 = \frac{8}{4} = 2\text{ A}$（流出），$i_3 = \frac{3}{3} = 1\text{ A}$（流出）；流入总和 $1 + 2 = 3\text{ A} =$ 流出总和 $2 + 1 = 3\text{ A}$，完美自洽！`,
            },
            {
              label: '进阶回代（求 $5\text{ V}$ 电压源自身电流 $i_{V_{s2}}$）',
              text: String.raw`此时须计入并联电阻电流 $i_{R_p} = \frac{v_2 - v_3}{R_p} = \frac{8 - 3}{5} = 1\text{ A}$（由节点 2 流向节点 3），对节点 2 单独列 KCL 得：`,
              tex: String.raw`i_{V_{s2}} = i_1 + i_2 + i_{R_p} = (-1) + 2 + 1 = 2\text{ A}`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '本幕 2D 原理图（KCL + KVL 方程联动求解与电流流向验算图）',
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '进阶挑战——含受控电压源的超节点与“选地降维”策略',
      sync: { layer: L3, halo: ['cc_dep', 'cc_ix'], params: { l3_mode: 'ccvs', l3_step: 0 } },
      blocks: [
        {
          kind: 'p',
          text: String.raw`考试中最爱拉分的一类题，是在超节点里把独立电压源换成[[cc_dep|**受控电压源（Dependent Voltage Source）**]]，比如流控电压源（CCVS，$4i_x$）或压控电压源（VCVS，$2v_x$）。`,
        },
        {
          kind: 'p',
          text: '同学别被那个[[cc_dep|**菱形符号**]]吓住！处理受控电压源超节点，步骤和独立源几乎一模一样，**只多了一步“控制量翻译”**：',
        },
        {
          kind: 'ol',
          items: [
            '照样把受控电压源和它两端的两个非参考节点[[cc_loop|包成一个超节点]]，列写外边界 KCL 方程；',
            '照样列写超节点内部 KVL 约束方程（例如 $v_2 - v_3 = 4i_x$）；',
            String.raw`**关键附加步（Controlling Variable Equation）**：把[[cc_ix|控制量 $i_x$]] 或 $v_x$ 用节点电压表示出来（例如 $i_x = \frac{v_1}{R_1}$），代回 KVL 约束方程，消去控制量后再联立求解！`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '[[rf_gnd|**教授私房技巧：参考地选点降维法**]]　如果题目没有强制指定参考节点（地），**优先把参考地放在连接了最多电压源（尤其是悬空电压源）的那个节点上**！一旦参考地接在悬空电压源的一端，Case 2 立刻降维变成 Case 1，连超节点都省了！（但如果电路中有两个互不相连的悬空电压源，就只能把其中一个变 Case 1，[[rf_sn01|另一个仍须构造成超节点]]。）',
        },
        { kind: 'p', text: '**教授三段式板书推导（含受控电压源超节点）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: String.raw`电路共有 3 个非参考节点 $v_1, v_2, v_3$，其中 $v_2$ 与 $v_3$ 之间跨接了[[cc_dep|流控电压源 $k i_x$]]，构成[[cc_loop|超节点 $(2, 3)$]]。我们需要 3 个独立方程来解 3 个节点电位：`,
        },
        {
          kind: 'ol',
          items: [
            '[[cc_node1|普通节点 1]] 的 KCL 方程；',
            '超节点 $(2, 3)$ 的外边界 KCL 方程；',
            '超节点内部的 KVL 约束方程，并将[[cc_ix|控制电流 $i_x$]] 用欧姆定律替换为节点电压函数。',
          ],
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（General Formula）· 节点 1 KCL：',
          tex: String.raw`\frac{v_1}{R_1} + \frac{v_1 - v_2}{R_2} = I_{s1}`,
        },
        { kind: 'formula', title: '超节点 $(2,3)$ 外边界 KCL：', tex: String.raw`\frac{v_2 - v_1}{R_2} + \frac{v_2}{R_3} + \frac{v_3}{R_4} = 0` },
        {
          kind: 'formula',
          title: '内部 KVL 约束与控制量替换：',
          tex: String.raw`v_2 - v_3 = k i_x, \qquad i_x = \frac{v_1}{R_1} \implies v_2 - v_3 = \frac{k}{R_1} v_1`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            {
              label: '代入参数',
              text: String.raw`$I_{s1} = 4\text{ A}$，$R_1 = 4\ \Omega$，$R_2 = 2\ \Omega$，$R_3 = 6\ \Omega$，$R_4 = 3\ \Omega$，$k = 4\ \Omega$（即受控电压源为 $4i_x$）`,
            },
            {
              label: 'Step A（写节点 1 的 KCL 方程并去分母）',
              tex: String.raw`\frac{v_1}{4} + \frac{v_1 - v_2}{2} = 4 \xrightarrow{\times 4} 3v_1 - 2v_2 = 16 \quad \text{(方程 ①)}`,
            },
            {
              label: 'Step B（写超节点 $(2, 3)$ 的外边界 KCL 并去分母）',
              tex: String.raw`\frac{v_2 - v_1}{2} + \frac{v_2}{6} + \frac{v_3}{3} = 0 \xrightarrow{\times 6} -3v_1 + 4v_2 + 2v_3 = 0 \quad \text{(方程 ②)}`,
            },
            {
              label: String.raw`Step C（写内部 KVL 约束并代入控制量 $i_x = \frac{v_1}{4}$）`,
              tex: String.raw`v_2 - v_3 = 4i_x = 4\left(\frac{v_1}{4}\right) = v_1 \implies v_3 = v_2 - v_1 \quad \text{(方程 ③)}`,
            },
            {
              label: 'Step D（消元求解并验算）',
              text: '将方程 ③（$v_3 = v_2 - v_1$）代入方程 ②：',
              tex: String.raw`\begin{gathered} -3v_1 + 4v_2 + 2(v_2 - v_1) = 0 \implies -5v_1 + 6v_2 = 0 \implies 6v_2 = 5v_1 \\ \text{把方程 ① 两边同乘 } 3 \text{ 得 } 9v_1 - 6v_2 = 48\text{，代入 } 6v_2 = 5v_1\text{：} \\ 9v_1 - 5v_1 = 48 \implies 4v_1 = 48 \implies v_1 = 12\text{ V} \\ \text{依次回代：} \\ v_2 = \frac{5}{6}v_1 = 10\text{ V}, \qquad v_3 = v_2 - v_1 = 10 - 12 = -2\text{ V}, \qquad i_x = \frac{12}{4} = 3\text{ A} \end{gathered}`,
            },
            {
              label: '验算',
              text: String.raw`受控源电压 $4i_x = 12\text{ V}$，而 $v_2 - v_3 = 10 - (-2) = 12\text{ V}$；节点 1 流出电流 $\frac{12}{4} + \frac{12 - 10}{2} = 3 + 1 = 4\text{ A} = I_{s1}$；超节点流出总电流 $\frac{10-12}{2} + \frac{10}{6} + \frac{-2}{3} = -1 + \frac{5}{3} - \frac{2}{3} = 0\text{ A}$。**注意：$v_3 = -2\text{ V}$ 为负电位完全正常**，说明节点 3 电位比参考地低 $2\text{ V}$！`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '本幕 2D 原理图（含流控电压源 CCVS 4iₓ 的超节点电路）',
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '苏格拉底式分步引导例题',
      sync: { layer: L2, halo: ['gd_loop'], params: { l2_circuit: 'guided', gd_reveal: 0, sn_loop: true, sn_rp: true, sn_kvl: false } },
      blocks: [
        {
          kind: 'guided',
          // all steps answered: the stage uncovers the example's numbers
          done_params: { gd_reveal: 2 },
          title: '含悬空电压源与并联电阻的超节点分步求解',
          source: 'Sadiku 2026 Release, Section 3.3 (Example 3.3 Style)',
          problem: String.raw`**例题题干**（改编自 Sadiku Section 3.3 经典双节点超节点题）：如下图所示电路，节点 1 与地之间接有 [[gd_is1|$I_{s1} = 6\text{ A}$（流入节点 1）]]与 [[gd_r1|$R_1 = 3\ \Omega$]]；节点 2 与地之间接有 [[gd_r2|$R_2 = 6\ \Omega$]] 与 [[gd_is2|$I_{s2} = 1\text{ A}$（流出节点 2）]]；节点 1 与节点 2 之间并联了一个 [[gd_vs|$V_s = 3\text{ V}$ 的悬空理想电压源]]（**负极接节点 1，正极接节点 2**）以及一个 [[gd_rp|$R_p = 3\ \Omega$ 的电阻]]。请逐步求出节点电压 $v_1, v_2$ 及流经 $3\text{ V}$ 电压源的电流 [[gd_is|$i_s$]]（方向由节点 1 指向节点 2）。`,
          problem_svg: SVG_ACT5,
          steps: [
            {
              title: 'Step 1 · 识别拓扑与构造超节点',
              mini_svg: MINI_STEP1,
              question: '观察 3 V 理想电压源的位置：它连接在节点 1 与节点 2 之间，两端都未接地。为了绕开未知电流 $i_s$，我们的第一步应该把哪些元件包裹进超节点？',
              hint: 'Case 2 判据：电压源两端均为非参考节点 $\\implies$ 连同并联元件 $R_p$ 一起构造超节点 $(1,2)$',
              options: pick(
                [
                  {
                    text: '把节点 1、节点 2、3 V 电压源以及并联电阻 Rₚ 整体包成超节点 (1, 2)',
                    correct: true,
                    feedback: '没错！Rₚ 的两端就是节点 1 和节点 2，与 3 V 电压源完全并联：连同两个节点一起包进超节点 (1, 2)，未知电流 iₛ 和 Rₚ 的电流都成了闭合面内部的“内力”。',
                  },
                  {
                    text: '只把 3 V 电压源包起来，把并联电阻 Rₚ 留在超节点外面',
                    correct: false,
                    feedback:
                      '同学留步！Rₚ 的两端恰好就是节点 1 和节点 2，它和 3 V 电压源完全并联。把 Rₚ 一并包进超节点内部，它的电流在闭合面内一进一出自动抵消，外边界 KCL 反而更清爽！',
                  },
                  {
                    text: '直接令 v₁ = 3 V，按 Case 1 处理',
                    correct: false,
                    feedback: '小心！3 V 电压源的两端都不是参考地，它只能锁定 v₁ 与 v₂ 的“电位差”，绝不能直接令 v₁ = 3 V。',
                  },
                ],
                [1, 0, 2],
              ),
              board: [String.raw`\text{Step 1：构造超节点 }(1,2)\text{，包裹 } V_s = 3\text{ V 与 } R_p = 3\ \Omega`],
              halo: ['gd_vs', 'gd_rp'],
              params: { sn_loop: false },
            },
            {
              title: 'Step 2 · 列写超节点外边界 KCL 方程',
              mini_svg: MINI_STEP2,
              question: '沿着超节点 (1, 2) 的虚线外边界扫描所有穿出的支路电流（令流出为正、流入为负），下列哪条外边界 KCL 方程是完全正确的？',
              hint: String.raw`$\sum i_{\text{流出外边界}} = \sum i_{\text{流入外边界}} \implies \frac{v_1}{R_1} + \frac{v_2}{R_2} + I_{s2} = I_{s1}$`,
              options: pick(
                [
                  {
                    text: 'v₁/3 + v₂/6 + 1 = 6',
                    correct: true,
                    feedback: '完全正确！穿过虚线边界的只有 4 条支路：R₁、R₂ 和 1 A 电流源向外流出，6 A 电流源向内流入；Rₚ 和电压源都在闭合面内部，不进方程。',
                  },
                  {
                    text: 'v₁/3 + v₂/6 + (v₁ − v₂)/3 + 1 = 6',
                    correct: false,
                    feedback:
                      '中招了吧！你把超节点内部并联电阻 Rₚ 的电流 (v₁ − v₂)/3 写进外边界 KCL 了。记住：Rₚ 没有穿过虚线边界，它在节点 1 流出、在节点 2 流入，合起来正好抵消为 0！',
                  },
                  {
                    text: 'v₁/3 + v₂/6 = 6 + 1',
                    correct: false,
                    feedback: '仔细看最右侧 1 A 电流源的箭头方向：它是向下“流出”节点 2 的，不是流入！所以应该和电阻流出电流站在一起，写成 +1 = 6，而不是 6 + 1。',
                  },
                ],
                [2, 1, 0],
              ),
              board: [String.raw`\frac{v_1}{3} + \frac{v_2}{6} + 1 = 6 \xrightarrow{\times 6} 2v_1 + v_2 = 30 \quad (\text{方程 ①})`],
              halo: ['gd_cross'],
              params: { sn_loop: true },
            },
            {
              title: 'Step 3 · 列写超节点内部 KVL 电位约束方程',
              mini_svg: MINI_STEP3,
              question: '现在我们有 2 个未知数 (v₁, v₂)，但只有 1 条方程 ①。盯紧图中 3 V 电压源的极性（左负 − 接节点 1，右正 + 接节点 2），补齐内部 KVL 约束方程：',
              hint: String.raw`$v_{(+)} - v_{(-)} = V_s \implies v_2 - v_1 = 3\text{ V}$`,
              options: pick(
                [
                  { text: 'v₂ − v₁ = 3', correct: true, feedback: '对！正极（+）接节点 2，负极（−）接节点 1：高电位减低电位，v₂ − v₁ = 3 V。' },
                  {
                    text: 'v₁ − v₂ = 3',
                    correct: false,
                    feedback: '经典符号陷阱！别顺手就写“左减右”！你看清电源符号：正极（+）在右边的节点 2，负极（−）在左边的节点 1，所以电位高的是 v₂，必然是 v₂ − v₁ = 3 V。',
                  },
                  { text: 'v₁ + v₂ = 3', correct: false, feedback: '电压源决定的是两点之间的电位“差”，而不是电位“和”。请用高电位端减去低电位端。' },
                ],
                [0, 1, 2],
              ),
              board: [String.raw`v_2 - v_1 = 3 \implies v_2 = v_1 + 3 \quad (\text{方程 ②})`],
              halo: ['gd_vs'],
              params: { sn_kvl: true },
            },
            {
              title: 'Step 4 · 联立消元求解节点电位',
              mini_svg: MINI_STEP4,
              question: '把方程 ② (v₂ = v₁ + 3) 代入方程 ① (2v₁ + v₂ = 30)，解出节点电位 v₁ 和 v₂：',
              hint: String.raw`$3v_1 + 3 = 30 \implies 3v_1 = 27 \implies v_1 = 9\text{ V},\ v_2 = v_1 + 3 = 12\text{ V}$`,
              options: pick(
                [
                  { text: 'v₁ = 9 V, v₂ = 12 V', correct: true, feedback: '漂亮！3v₁ = 27 ⇒ v₁ = 9 V，v₂ = v₁ + 3 = 12 V。代回方程 ① 验算：2 × 9 + 12 = 30 ✓。' },
                  {
                    text: 'v₁ = 11 V, v₂ = 8 V',
                    correct: false,
                    feedback: '3v₁ = 30 − 3 = 27，不是 30 + 3 = 33！移项时 +3 变 −3，而且 v₂ 比 v₁ 高 3 V，不可能是 8 V。',
                  },
                  { text: 'v₁ = 10 V, v₂ = 13 V', correct: false, feedback: '代入验算一下：2(10) + 13 = 33 ≠ 30，说明算术移项漏减了 3。' },
                ],
                [2, 0, 1],
              ),
              board: [String.raw`2v_1 + (v_1 + 3) = 30 \implies 3v_1 = 27 \implies v_1 = 9\text{ V},\quad v_2 = 12\text{ V}`],
              halo: ['gd_node1', 'gd_node2'],
            },
            {
              title: 'Step 5 · 回代单节点求电压源电流 $i_s$（并联电阻回归！）',
              mini_svg: MINI_STEP5,
              question:
                '最后一步高阶追问：求流经 3 V 电压源的电流 $i_s$（方向从节点 1 指向节点 2）。此时必须回到节点 1 单独列 KCL，且切记把并联电阻 Rₚ = 3 Ω 的电流算回来！$i_s$ 等于多少？',
              hint: String.raw`节点 1 KCL：$6 + \frac{v_2 - v_1}{R_p} = \frac{v_1}{R_1} + i_s \implies 6 + \frac{12 - 9}{3} = \frac{9}{3} + i_s$`,
              options: pick(
                [
                  {
                    text: 'iₛ = 4 A',
                    correct: true,
                    feedback: '满分通关！节点 1：流入 6 A，加上经 Rₚ 倒灌回来的 1 A，共 7 A；流下 R₁ 3 A，剩下 iₛ = 4 A 经电压源流向节点 2。节点 2 交叉验算：1 + 2 + 1 = 4 A ✓。',
                  },
                  {
                    text: 'iₛ = 3 A',
                    correct: false,
                    feedback:
                      '差一点！你算成了 6 − 3 = 3 A，把并联电阻 Rₚ 的电流忘了！虽然求节点电位时 Rₚ 可以忽略，但求电压源自身电流 iₛ 时，节点 2 (12 V) 经 Rₚ=3 Ω 往节点 1 (9 V) 倒灌了 1 A 电流，这 1 A 也必须从电压源流出！',
                  },
                  {
                    text: 'iₛ = 2 A',
                    correct: false,
                    feedback:
                      '方向反了！因为 v₂ = 12 V > v₁ = 9 V，流经 Rₚ 的 1 A 是从节点 2 流“入”节点 1 的，所以流入节点 1 总电流是 6 + 1 = 7 A，减去流下 R₁ 的 3 A，得 iₛ = 4 A。',
                  },
                ],
                [1, 2, 0],
              ),
              board: [String.raw`i_s = 6 + 1 - 3 = 4\text{ A}`, String.raw`(\text{节点 2 交叉验算：} i_s = i_{R_p} + i_{R_2} + I_{s2} = 1 + 2 + 1 = 4\text{ A})`],
              halo: ['gd_rp', 'gd_is', 'gd_r1', 'gd_is1'],
              params: { gd_reveal: 1 },
            },
          ],
          conclusion: '求解完成：v₁ = 9 V，v₂ = 12 V，iₛ = 4 A。',
        },
      ],
    },

    /* ------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '超节点易错点诊断测验',
      sync: { layer: L2, halo: ['sn_kvl', 'sn_rp'], params: ACT2_CIRCUIT },
      blocks: [{ kind: 'p', text: '下面 4 道诊断题，各自对准一个高频雷区（见下图）。选错了先看教授的拦截，再选一次。' }],
      inline_svg: SVG_ACT6,
      figure_caption: '本幕 2D 原理图（超节点四大高频排雷速查图）',
      quiz: [
        {
          id: 'w2l2_q1',
          concept: '超节点同时满足 KCL 与 KVL',
          review_act: 2,
          question: '关于由悬空理想电压源构成的超节点（Supernode），下列哪项陈述是**完全正确**的？',
          options: relabel(
            [
              { key: 'A', text: '超节点本身不具备单一的节点电压，但在求解时必须同时对其应用 KCL（外边界）和 KVL（内部电位约束）。', correct: true },
              {
                key: 'B',
                text: '超节点把两个节点合并成了一个等电位点，因此只需列一条 KCL 方程就能解出它的唯一电压。',
                correct: false,
                feedback:
                  '超节点里的两个节点之间隔着电压源，电位相差 Vₛ，根本不是等电位点。外边界 KCL 只给出 1 条方程，却有 2 个未知电位——少的那一条必须由内部 KVL 补上（雷区 01）。',
              },
              {
                key: 'C',
                text: '超节点只满足 KCL，不满足 KVL，因为理想电压源内阻为零。',
                correct: false,
                feedback: '内阻为零恰恰说明电压源两端的电位差被钉死为 Vₛ——这正是内部 KVL 约束 v(+) − v(−) = Vₛ 的来源。超节点 KCL、KVL 都满足。',
              },
              {
                key: 'D',
                text: '只有独立电压源才能构成超节点，受控电压源不能构成超节点。',
                correct: false,
                feedback: 'Sadiku 的定义写的是“电压源（独立或受控）”：受控电压源跨在两个非参考节点之间时，同样包成超节点，只是要多补一条控制量方程（第 4 幕）。',
              },
            ],
            [1, 2, 0, 3],
          ),
          feedback_correct:
            'Sadiku Section 3.3 明确指出：超节点内部包含两个电位不同的节点，故不具备单一电压；它既是广义闭合面（满足外边界 KCL），又包含电压源支路（须补内部 KVL 约束）；独立或受控电压源均可构成超节点。',
          feedback_wrong: '回想超节点的三大铁律（第 2 幕），再选一次。',
          figure: SVG_Q1,
          sync: { layer: L2, halo: ['sn_loop', 'sn_kvl'], params: ACT2_CIRCUIT },
        },
        {
          id: 'w2l2_q2',
          concept: '内部 KVL 约束的极性',
          review_act: 2,
          question: '在某电路中，节点 2 与节点 3 之间接有一个 8 V 悬空电压源，其**正极（+）接在节点 3**，**负极（−）接在节点 2**。则该超节点的内部 KVL 约束方程应写作：',
          options: relabel(
            [
              { key: 'A', text: 'v₃ − v₂ = 8 V', correct: true },
              {
                key: 'B',
                text: 'v₂ − v₃ = 8 V',
                correct: false,
                feedback: '这是“左减右”的习惯写法。看清极性：正极在节点 3，电位高的是 v₃；写成 v₂ − v₃ = 8 V 等于说节点 2 更高，符号正好反了（雷区 02）。',
              },
              { key: 'C', text: 'v₂ + v₃ = 8 V', correct: false, feedback: '电压源规定的是两端电位的“差”，不是电位的“和”。' },
              {
                key: 'D',
                text: 'v₃ = 8 V',
                correct: false,
                feedback: '只有电压源一端接参考地（Case 1）时才能直接锁定电位；这里两端都是非参考节点，8 V 只约束 v₃ 与 v₂ 之差。',
              },
            ],
            [1, 0, 2, 3],
          ),
          feedback_correct: '永远遵守 v(+) − v(−) = Vₛ。本题正极在节点 3、负极在节点 2，故 v₃ − v₂ = 8 V（也可等价写作 v₂ − v₃ = −8 V）。',
          feedback_wrong: '先找正极接在哪个节点，再选一次。',
          figure: SVG_Q2,
          sync: { layer: L2, halo: ['sn_kvl', 'sn_vs2'], params: ACT2_CIRCUIT },
        },
        {
          id: 'w2l2_q3',
          concept: '超节点内的并联电阻',
          review_act: 3,
          question: '一个 10 Ω 电阻与一个 5 V 悬空电压源直接并联在节点 2 和节点 3 之间（二者均被包入超节点）。下列说法正确的是：',
          options: relabel(
            [
              {
                key: 'A',
                text: '列写超节点外边界 KCL 求节点电位时可忽略该 10 Ω 电阻；但若后续要计算 5 V 电压源自身流过的电流，则必须计入该 10 Ω 电阻的电流。',
                correct: true,
              },
              {
                key: 'B',
                text: '无论求节点电位还是求电压源电流，都必须把 (v₂ − v₃)/10 写进超节点外边界 KCL 方程里。',
                correct: false,
                feedback: '这颗 10 Ω 电阻两端都在超节点内部：它的电流从节点 2 流出、又从节点 3 流入，不穿过虚线外边界。写进外边界 KCL 就是把内部电流当成了外部电流（雷区 03）。',
              },
              {
                key: 'C',
                text: '该 10 Ω 电阻对电路没有任何物理作用，在求电压源电流时也可以直接剪断忽略。',
                correct: false,
                feedback: '求节点电位时它确实不出现，但它真实地从电压源取走 5 V / 10 Ω = 0.5 A：回到单个节点求电压源电流时，这 0.5 A 必须算回来。',
              },
              {
                key: 'D',
                text: '因为并联了 10 Ω 电阻，所以节点 2 和节点 3 不再构成超节点。',
                correct: false,
                feedback: '超节点的定义本来就包括“与电压源并联的任何元件”：并联一颗电阻，节点 2、3 照样构成超节点。',
              },
            ],
            [1, 2, 3, 0],
          ),
          feedback_correct:
            '并联电阻完全位于超节点内部，其电流不穿过外边界，故在求所有节点电位时自动抵消；但它确实从电压源吸取了 5 V / 10 Ω = 0.5 A 的真实电流，因此回代求电压源自身电流时必须计入。',
          feedback_wrong: '想想这颗电阻的电流有没有穿过虚线外边界，再选一次。',
          figure: SVG_Q3,
          sync: { layer: L2, halo: ['sn_rp', 'sn_ivs'], params: ACT2_CIRCUIT },
        },
        {
          id: 'w2l2_q4',
          concept: '受控电压源的控制量方程',
          review_act: 4,
          question:
            '某电路有 3 个非参考节点 (v₁, v₂, v₃)，节点 2 与节点 3 之间接有一个流控电压源 $V_d = 3i_x$（+ 接节点 2，− 接节点 3），其中 $i_x$ 是流经节点 1 接地电阻 R₁ = 6 Ω（方向向下）的电流。将约束方程全部化为节点电位后应为：',
          options: relabel(
            [
              { key: 'A', text: 'v₂ − v₃ = 0.5 v₁', correct: true },
              {
                key: 'B',
                text: 'v₂ − v₃ = 18 v₁',
                correct: false,
                feedback: '18 是把 3 和 R₁ = 6 Ω 乘在了一起。iₓ 是电流，由欧姆定律 iₓ = v₁/R₁：3iₓ 里的 R₁ 应该在分母上，而不是乘上去。',
              },
              { key: 'C', text: 'v₂ − v₃ = 3 v₁', correct: false, feedback: '这一步把 iₓ 直接换成了 v₁，漏掉了欧姆定律的那一除：iₓ 是电流，还要除以 R₁ = 6 Ω（雷区 04）。' },
              {
                key: 'D',
                text: 'v₁ − v₂ = 0.5 v₃',
                correct: false,
                feedback: '受控源跨在节点 2 与节点 3 之间（+ 接节点 2），约束的是 v₂ − v₃；和 v₁ 有关的是控制量 iₓ，不是约束的左边。',
              },
            ],
            [0, 1, 2, 3],
          ),
          feedback_correct: String.raw`由欧姆定律 $i_x = v_1 / R_1 = v_1 / 6$，代入内部 KVL 约束 $v_2 - v_3 = 3i_x$ 得 $v_2 - v_3 = 3(v_1 / 6) = 0.5 v_1$。`,
          feedback_wrong: '先把控制量 iₓ 用节点电压写出来，再选一次。',
          figure: SVG_Q4,
          sync: { layer: L3, halo: ['cc_dep', 'cc_ix'], params: { l3_mode: 'ccvs', l3_step: 0 } },
        },
      ],
    },
  ],
};

export default W2_L2;
