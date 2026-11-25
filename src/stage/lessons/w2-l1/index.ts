// W2-L1 · 节点分析法（Nodal Analysis） (lesson sheet: docs/lessons/W2-L1.md).
// The professor's text of the five acts, the act diagrams (svgs.ts), the guided example and the
// self-test are reproduced from the sheet; [[id|…]] only links a term to the stage (the words are
// unchanged). Changes from the sheet, of form:
// - display formulas sit in the ① / ② / ③ cards; bulleted ① origins run as one paragraph; the
//   sub-bullets of a calc step become its lines (a lead-in sentence is the line's label, lines of
//   one step can share one aligned / gathered formula);
// - stage ids are lower case (branch_r1, src_is1 …: the inline link syntax takes lower case only);
// - anti-spoiler: the guided example is act 3's circuit, so it follows act 3 as its own act (4),
//   and act 3's ③ calculation and the professor's comment on v₂ = −15 V moved behind it as the
//   「通关复盘」 board; act 3 keeps ① and ② and the circuit (sheet acts 4 and 5 are acts 5 and 6);
//   the step-5 mini diagram no longer prints the step's answer;
// - added: one line in act 3 pointing to the guided act; the guided example's problem line; the
//   example-1 conductance matrix in act 6 with a note that the symmetry check is made before the
//   denominators are cleared (the cleared rows 3v₁ − v₂ = 60, −3v₁ + 5v₂ = −120 are not symmetric);
//   rewritten feedback for three wrong quiz options (Q1 C, Q1 D, Q2 C) so they say why the option
//   is wrong instead of giving the answer; the quiz figures and the W2-L2 preview (figures.ts).

import { lazy } from 'react';
import type { StageLesson, StageSync } from '../../types';
import { SVG_NEXT, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './figures';
import { L1, L2, L3 } from './parts';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, PROBLEM, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5 } from './svgs';

const NodesLayer = lazy(() => import('./NodesLayer'));
const KclLayer = lazy(() => import('./KclLayer'));
const SolverLayer = lazy(() => import('./SolverLayer'));

const R = String.raw;

/** an act's (or quiz item's) stage set-up; `w21_layer` follows the layer so guided steps can move it */
const at = (layer: string, halo: string[], params: Record<string, unknown>): StageSync => ({ layer, halo, params: { w21_layer: layer, ...params } });

const CORE = { w21_circuit: 'core', w21_ref: 'v0' };

const W2_L1: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: NodesLayer, [L2]: KclLayer, [L3]: SolverLayer },
  lesson_meta: {
    lesson_id: 'W2-L1',
    world: 'World 2 · 网络分析与电路定理',
    title: '节点分析法（Nodal Analysis）',
    subtitle: 'Nodal Analysis (Circuits Without Voltage Sources)',
    lesson_type: 'B',
    lesson_type_label: 'Type B (纯公式/方法论课：2D 交互式原理图 + 三段式板书推导)',
    estimated_minutes: 35,
    textbook_primary: { book: 'Alexander, Sadiku & Fredette, Fundamentals of Electric Circuits (2026 Release)', sections: ['Sec. 3.1–3.2'] },
    textbook_supplement: 'Boylestad, Introductory Circuit Analysis (14th Ed.), Ch. 8',
    prerequisites: ['W1-L3 欧姆定律', 'W1-L4 节点/支路/回路', 'W1-L5 KCL'],
    next_lesson: 'W2-L2',
    next_lesson_title: '含电压源的节点分析与超节点（Supernode）',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 节点标注与参考地选择',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '按等电位金属导线着色区分各非参考节点与参考地母线，直观呈现 n 与 n-1 的数量关系：点任意节点把它设为参考地，看全图电位整体平移。',
      },
      {
        id: L2,
        label: '02 支路电流翻译为电位差',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '在选中节点上动态弹出“统一流出法”支路电流矢量与欧姆定律表达式气泡，区分电阻支路与独立电流源：换一个站位节点，气泡和方程跟着换。',
      },
      {
        id: L3,
        label: '03 节点方程联立求解台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '同步展示通分消分母、标准线性方程组矩阵 Gv = i、高斯消元过程以及反算后的真实支路电流方向动画：一步一步点“下一步”。',
      },
    ],
    hover_map: {
      node_v1: { label: '节点 v₁', desc: '红色整片导线：一个非参考节点，电位 v₁ 是它相对参考地的“海拔”' },
      node_v2: { label: '节点 v₂', desc: '蓝色整片导线：另一个非参考节点，电位 v₂ 相对参考地测量' },
      node_v3: { label: '节点 v₃', desc: '例题 2 的紫色节点：R₁₃、R₂₃ 与受控源 2iₓ 在这里汇合' },
      node_gnd: { label: '参考地（底部母线）', desc: '连接支路最多的公共母线，规定为 0 V；改选别的参考地后，它就是普通节点 v₀' },
      branch_r1: { label: 'R₁（v₁ — 地）', desc: '热身 3 Ω · 例题 1 2 Ω：站在 v₁ 写作 (v₁ − 0)/R₁' },
      branch_r2: { label: 'R₂（v₁ — v₂）', desc: '热身 6 Ω · 例题 1 4 Ω：跨接两个非参考节点，v₁ 和 v₂ 的方程里都有它' },
      branch_r3: { label: 'R₃（v₂ — 地）', desc: '热身与例题 1 都是 6 Ω：站在 v₂ 写作 (v₂ − 0)/R₃' },
      src_is1: { label: '接地电流源 Iₛ（5 A）', desc: '箭头自参考地指向 v₁：对 v₁ 是流入，记在等号右边取 +' },
      src_is2: { label: '跨接电流源 Iₛ₂ = 10 A', desc: '箭头由 v₂ 指向 v₁：对 v₁ 流入（+10），对 v₂ 流出（−10）' },
      branch_r12: { label: 'R₁₂ = 2 Ω（v₁ — v₂）', desc: '例题 2：它的电流就是控制量 iₓ = (v₁ − v₂)/2' },
      branch_r13: { label: 'R₁₃ = 4 Ω（v₁ — v₃）', desc: '例题 2 顶部跨接电阻' },
      branch_r2g: { label: 'R₂g = 4 Ω（v₂ — 地）', desc: '例题 2：站在 v₂ 写作 v₂/4' },
      branch_r23: { label: 'R₂₃ = 8 Ω（v₂ — v₃）', desc: '例题 2：跨接 v₂ 与 v₃' },
      src_dep: { label: '受控电流源 2iₓ（CCCS）', desc: '菱形：从 v₃ 向下流出到地，大小跟着 iₓ 变' },
      ctrl_ix: { label: '控制量 iₓ', desc: '流经 R₁₂ 的电流（v₁ → v₂）：必须用节点电压写成 (v₁ − v₂)/2 才能从方程里消掉' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '海拔直觉与参考地选择——为什么只需要 $n - 1$ 个数字？',
      sync: at(L1, ['node_v1', 'node_v2', 'node_gnd'], { w21_circuit: 'generic', w21_ref: 'v0', w21_reveal: false, w21_solve: 0 }),
      blocks: [
        {
          kind: 'note',
          tone: 'tip',
          text: '**教授开场白**：欢迎进入 Week 2！在第一周，我们手里已经握紧了三把钥匙：`W1-L3 欧姆定律`、`W1-L4 节点/支路/回路` 和 `W1-L5 基尔霍夫电流定律（KCL）`。但你有没有发现，当电路里同时冒出五六只电阻、两三个电源时，靠“串联/并联化简”根本拆不动了？今天，我们要把这三把钥匙熔铸成电路分析的第一套**工业级通用算法——节点分析法（Nodal Analysis）**。只要学会这套系统化步骤，无论多复杂的纯电流源电阻网络，你都能像写程序一样稳稳解出全图每一处的电压和电流。',
        },
        { kind: 'p', text: '**教授讲透直觉（Boylestad Ch. 8 坡度补位）**' },
        {
          kind: 'p',
          text: '在直接列方程之前，我们先打通一个终生受用的物理直觉（对应 Introductory Circuit Analysis, 14th Ed. Ch. 8 的入门坡度）：**把电路中的“节点电位”想象成地理上的“海拔高度”，把“支路电流”想象成“水流”。**',
        },
        {
          kind: 'p',
          text: R`假设山坡上有两座水塔，水塔 1 海拔 $h_1$，水塔 2 海拔 $h_2$，中间连着一根水管。决定水流方向和流速的，不是水塔离地心有多远，而是**两座水塔之间的海拔高度差 $h_1 - h_2$**。为了让每个人报海拔时都有统一标准，地理学规定：**海平面海拔为 $0\,\text{m}$**。`,
        },
        { kind: 'p', text: '电路世界完全一样：' },
        {
          kind: 'ol',
          items: [
            R`[[node_gnd|**参考节点（Reference Node / Ground）**]]就是电路里的“海平面”，我们人为指定它的电位为 **$0\,\text{V}$**。`,
            R`其余每一个非参考节点 $k$ 的[[node_v1,node_v2|**节点电压（Node Voltage）$v_k$**]]，指的就是“节点 $k$ 相对于参考地的电位差”（$v_k = V_k - V_{\text{ref}} = V_k - 0$）。`,
            R`**为什么它如此高效？** 一旦你求出了所有非参考节点的“海拔”（$v_1, v_2, \dots, v_{n-1}$），电路中任意一只跨接在节点 $a$ 和节点 $b$ 之间的电阻 $R$，其两端电压立刻就是 $v_{ab} = v_a - v_b$，流过它的电流立刻就是 $i = \dfrac{v_a - v_b}{R}$——**全图信息一网打尽！**`,
          ],
        },
        { kind: 'figure', svg: SVG_ACT1, caption: '本幕 2D 教学原理图（海拔直觉 vs. 节点标注）' },
        { kind: 'p', text: '**参考节点选择与 $n - 1$ 定律**' },
        {
          kind: 'ul',
          items: [
            R`**选谁当参考地？** 理论上任意节点都可以当参考地，但工程上有一条偷懒黄金法则：[[node_gnd|**优先选择连接支路最多的节点**]]（通常是电路底部的公共汇流母线）。接在参考地上的电阻越多，方程里出现的“$- 0$”项就越多，代数化简越轻松。`,
            R`**为什么只需要列 $n - 1$ 个方程？** 如果电路共有 $n$ 个节点（例如上图 $n = 3$），选定 $1$ 个参考节点后，只剩 $n - 1$ 个未知节点电位。如果对第 $n$ 个节点（参考地）也强行列 KCL，你会发现它恰好等于前 $n - 1$ 个 KCL 方程之和取反，属于线性相关方程，不提供任何新信息。`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授提醒（常见接地符号辨析）**：在 Sadiku Sec. 3.2 中，参考地常用三种符号：三条递减短线（大地接地 Earth Ground）、三斜杠耙子（机壳接地 Chassis Ground）或空心倒三角（公共端 Common）。在理想电路分析中，三者含义完全相同：**$0\,\text{V}$ 电位基准点**。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '核心心法——“统一流出法”与支路电流翻译引擎',
      sync: at(L2, ['node_v1', 'node_v2', 'branch_r2'], {
        w21_circuit: 'warmup',
        w21_ref: 'v0',
        w21_stand: 'v1',
        w21_dual: true,
        w21_eq: true,
        w21_sym: false,
        w21_reveal: true,
        w21_solve: 4,
      }),
      blocks: [
        { kind: 'p', text: '**为什么新手列节点方程老是正负号出错？**' },
        {
          kind: 'p',
          text: '我批改过上千份电路作业，90% 的节点分析法失分都源于同一个坏习惯：**列方程前先在图上随手乱画一堆电阻电流箭头，结果列到节点 1 时是流出，列到节点 2 时又得抬头看刚才箭头画的是进还是出，正负号瞬间乱成一锅粥。**',
        },
        { kind: 'p', text: '今天教授教你一套**零失误机械心法——“统一流出法”**：' },
        {
          kind: 'ol',
          items: [
            R`[[branch_r1,branch_r2,branch_r3|**电阻支路**]]：每当你站到某个非参考节点 $v_k$ 上列 KCL 时，**无条件假设所有与节点 $v_k$ 相连的电阻支路电流全部从 $v_k$ 流出**！经电阻 $R$ 流向邻居节点 $v_j$ 的电流，直接写为 $\dfrac{v_k - v_j}{R}$；经电阻 $R$ 流向参考地 ($0\,\text{V}$) 的电流，直接写为 $\dfrac{v_k - 0}{R} = \dfrac{v_k}{R}$。`,
            R`[[src_is1|**独立电流源支路**]]：电流源的箭头方向是电路给定的铁律，不可更改。采用最直观的平衡式：`,
          ],
        },
        {
          kind: 'formula',
          title: '“统一流出法”平衡式',
          tex: R`\sum i_{\text{流出当前节点的电阻电流}} = \sum I_{\text{流入当前节点的独立电流源}} - \sum I_{\text{流出当前节点的独立电流源}}`,
        },
        { kind: 'p', text: '（等价写法：所有流出电流代数和 $= 0$，此时流入的电流源取负号、流出的电流源取正号。）' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**直觉释疑**：站到 $v_1$ 时我们假设 [[branch_r2|$R_2$ 电流]]向右流出（$\frac{v_1 - v_2}{R_2}$），站到 $v_2$ 时我们又假设 $R_2$ 电流向左流出（$\frac{v_2 - v_1}{R_2}$），这不矛盾吗？**完全不矛盾！** 因为 $\frac{v_2 - v_1}{R_2} = -\frac{v_1 - v_2}{R_2}$，代数符号已经自动保证了同一条支路的真实电流唯一确定。`,
        },
        { kind: 'figure', svg: SVG_ACT2, caption: '本幕 2D 教学原理图（“统一流出法”双向视角翻译）' },
        { kind: 'p', text: '**三段式教授板书推导（通式建立与热身演练）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text:
            '回链 `W1-L5 KCL`：' +
            R`对任意非参考节点 $k$，流出该节点的所有支路电流代数和恒为零（$\sum i_{\text{out}} = 0$）。` +
            '回链 `W1-L3 欧姆定律`：' +
            R`对连接节点 $k$ 与节点 $j$ 的线性电阻 $R_{kj}$，沿 $k \to j$ 方向的支路电流由两节点电位差驱动：$i_{k \to j} = \dfrac{v_k - v_j}{R_{kj}} = G_{kj}(v_k - v_j)$，其中电导 $G_{kj} = \dfrac{1}{R_{kj}}$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（General Formula）：对上图中含 $n - 1 = 2$ 个非参考节点的通用网络（电阻 $R_1, R_2, R_3$，独立电流源 $I_s$ 流入节点 $1$）：`,
          tex: R`\begin{cases} \dfrac{v_1 - 0}{R_1} + \dfrac{v_1 - v_2}{R_2} = I_s \\[10pt] \dfrac{v_2 - v_1}{R_2} + \dfrac{v_2 - 0}{R_3} = 0 \end{cases}`,
        },
        {
          kind: 'formula',
          title: R`改写为**电导标准形式**（$G_1 = \frac{1}{R_1},\; G_2 = \frac{1}{R_2},\; G_3 = \frac{1}{R_3}$）：`,
          tex: R`\begin{cases} (G_1 + G_2)v_1 - G_2 v_2 = I_s \\[6pt] -G_2 v_1 + (G_2 + G_3)v_2 = 0 \end{cases}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            { label: '热身参数', text: R`以上图热身参数 $I_s = 5\,\text{A},\; R_1 = 3\,\Omega,\; R_2 = 6\,\Omega,\; R_3 = 6\,\Omega$ 为例` },
            { label: 'Step A（代入元件数值）', tex: R`\begin{cases} \dfrac{v_1}{3} + \dfrac{v_1 - v_2}{6} = 5 \\[8pt] \dfrac{v_2 - v_1}{6} + \dfrac{v_2}{6} = 0 \end{cases}` },
            { label: 'Step B（通分消分母）', text: '两式两边同时乘以最小公倍数 $6$', tex: R`\begin{cases} 2v_1 + (v_1 - v_2) = 30 \\ (v_2 - v_1) + v_2 = 0 \end{cases}` },
            { label: 'Step C（合并同类项并求解）', tex: R`\begin{cases} 3v_1 - v_2 = 30 \\ -v_1 + 2v_2 = 0 \implies v_1 = 2v_2 \end{cases}` },
            { label: '将 $v_1 = 2v_2$ 代入第一式', tex: R`3(2v_2) - v_2 = 30 \implies 5v_2 = 30 \implies v_2 = 6\,\text{V},\quad v_1 = 12\,\text{V}` },
            {
              label: 'Step D（反求支路电流与 KCL 闭环验算）',
              tex: R`i_1 = \frac{12}{3} = 4\,\text{A},\quad i_2 = \frac{12 - 6}{6} = 1\,\text{A},\quad i_3 = \frac{6}{6} = 1\,\text{A}`,
            },
            { label: 'KCL 闭环', text: R`核验节点 $v_1$：流出 $4 + 1 = 5\,\text{A} =$ 流入 $I_s = 5\,\text{A}$ ✓；核验节点 $v_2$：流入 $1\,\text{A} =$ 流出 $1\,\text{A}$ ✓。` },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '经典实战（一）——含跨接独立电流源的 2 节点电路（Sadiku 3.2 核心例题）',
      sync: at(L2, ['src_is2', 'node_v1', 'node_v2'], { ...CORE, w21_stand: 'v1', w21_dual: false, w21_eq: true, w21_sym: true, w21_reveal: false, w21_solve: 0 }),
      blocks: [
        { kind: 'p', text: '**场景升级与易错点预警**' },
        {
          kind: 'p',
          text: R`现在我们来看 Sadiku Section 3.2 最具代表性的 2 节点电路：除了[[src_is1|左侧接地的 $I_{s1} = 5\,\text{A}$ 电流源]]，电路顶部还多了一个[[src_is2|**跨接在 $v_2$ 与 $v_1$ 之间的独立电流源 $I_{s2} = 10\,\text{A}$**]]（箭头由右向左，从 $v_2$ 指向 $v_1$）。`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授划重点**：跨接在两个非参考节点之间的独立电流源，是期中考试头号“符号杀手”！请死死盯住箭头：**对 $v_1$ 而言，$10\,\text{A}$ 是流入（$+$）；对 $v_2$ 而言，同一个 $10\,\text{A}$ 却是流出（$-$）！**`,
        },
        { kind: 'figure', svg: SVG_ACT3, caption: '本幕 2D 教学原理图（Sadiku 3.2 经典 2 节点电路）' },
        { kind: 'p', text: '**三段式教授板书推导（经典例题 1 完整求解）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text:
            R`全图共有 $n = 3$ 个节点（$v_1, v_2$ 及底部参考地 $0$），依据 ` +
            '`W1-L5 KCL`' +
            R` 与节点分析法规则，列出 $n - 1 = 2$ 个独立 KCL 方程。所有电阻支路电流按“统一流出法”由 ` +
            '`W1-L3 欧姆定律`' +
            R` 改写为节点电位差除以电阻值；跨接独立电流源 $I_{s2}$ 严格按箭头方向在节点 $1$ 计入流入、在节点 $2$ 计入流出。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（General Formula）：以纯字母 $R_1, R_2, R_3$ 及 $I_{s1}, I_{s2}$ 列写两节点 KCL（流出电阻电流之和 $=$ 净流入独立电流源之和）：`,
          tex: R`\begin{cases} \dfrac{v_1}{R_1} + \dfrac{v_1 - v_2}{R_2} = I_{s1} + I_{s2} \\[10pt] \dfrac{v_2 - v_1}{R_2} + \dfrac{v_2}{R_3} = -I_{s2} \end{cases}`,
        },
        {
          kind: 'formula',
          title: R`等价写为电导矩阵形式 $\mathbf{G}\mathbf{v} = \mathbf{i}$：`,
          tex: R`\begin{bmatrix} \dfrac{1}{R_1} + \dfrac{1}{R_2} & -\dfrac{1}{R_2} \\[10pt] -\dfrac{1}{R_2} & \dfrac{1}{R_2} + \dfrac{1}{R_3} \end{bmatrix} \begin{bmatrix} v_1 \\[6pt] v_2 \end{bmatrix} = \begin{bmatrix} I_{s1} + I_{s2} \\[6pt] -I_{s2} \end{bmatrix}`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '③ 代入数值这一步先不写：下一幕的苏格拉底引导例题就是这道题。自己闯关之后，完整推导作为“通关复盘”板书紧跟在后面。',
        },
      ],
    },

    /* ------------------------------------------------------------- act 4 (the guided example) */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '苏格拉底式分步引导例题（第 3 幕 Sadiku 3.2 核心例题）',
      sync: at(L1, ['node_v1', 'node_v2', 'node_gnd'], { ...CORE, w21_reveal: false, w21_eq: false, w21_solve: 0 }),
      blocks: [
        {
          kind: 'guided',
          title: '苏格拉底式分步求解：Sadiku 3.2 核心 2 节点双独立电流源电路',
          source: 'Alexander, Sadiku & Fredette, Fundamentals of Electric Circuits (2026 Release), Sec. 3.2',
          problem: R`$I_{s1} = 5\,\text{A}$ 流入 $v_1$，$I_{s2} = 10\,\text{A}$ 从 $v_2$ 跨接流入 $v_1$；$R_1 = 2\,\Omega$（$v_1$–地），$R_2 = 4\,\Omega$（$v_1$–$v_2$），$R_3 = 6\,\Omega$（$v_2$–地）。用节点分析法求 $v_1$、$v_2$，并判断 $R_3$ 上的真实电流方向。`,
          problem_svg: PROBLEM,
          steps: [
            {
              title: 'Step 1 · 锁定节点总数与参考地',
              mini_svg: MINI_STEP1,
              question: R`观察左侧原理图：全图共有 $n = 3$ 个节点，我们选底部连接支路最多的公共母线作为参考节点（$0\,\text{V}$）。接下来需要列写多少个独立的节点 KCL 方程？`,
              hint: R`记住节点分析法的核心数量规律：参考节点电位已锁定为 $0\,\text{V}$，只需对剩余的非参考节点列 KCL。`,
              options: [
                {
                  text: '$3$ 个（对 $v_1$、$v_2$ 和参考节点各列一个）',
                  correct: false,
                  feedback: R`慢着！参考节点的电位已经定义为 $0\,\text{V}$ 了。如果你把三个节点的 KCL 全列出来，会发现第三个方程其实就是前两个方程相加取反，属于冗余方程。我们只需要 $n - 1$ 个！`,
                },
                {
                  text: '$2$ 个（仅对非参考节点 $v_1$ 和 $v_2$ 列 KCL）',
                  correct: true,
                  feedback: '精准！$n = 3$ 个节点减去 $1$ 个参考地，恰好需要 $n - 1 = 2$ 个独立 KCL 方程，对应 $2$ 个未知节点电位 $v_1, v_2$。',
                },
                {
                  text: '$5$ 个（电路有 5 条支路，每条支路列一个）',
                  correct: false,
                  feedback: '别把支路数和节点数混了！节点分析法之所以威力巨大，正是因为它把 5 个未知支路电流压缩成了仅仅 $n - 1 = 2$ 个未知节点电位。',
                },
              ],
              board: [R`\text{Step 1: } n = 3 \implies \text{选底部为参考地 } (v_0 = 0\,\text{V})\text{，需列 } n - 1 = 2 \text{ 个独立 KCL 方程。}`],
              halo: ['node_v1', 'node_v2', 'node_gnd'],
              params: { w21_layer: L1, ...CORE, w21_reveal: false },
            },
            {
              title: 'Step 2 · 列写节点 v₁ 的 KCL 方程',
              mini_svg: MINI_STEP2,
              question: '现在站到节点 $v_1$ 上！用“统一流出法”（流出电阻支路电流之和 $=$ 流入独立电流源之和），节点 $v_1$ 的 KCL 方程应该是哪一个？',
              hint: R`先看两个独立电流源箭头：$5\,\text{A}$ 和顶部的 $10\,\text{A}$ 都是指向 $v_1$ 的（流入）；两条电阻支路按统一流出法分别写作 $\frac{v_1 - 0}{2}$ 和 $\frac{v_1 - v_2}{4}$。`,
              options: [
                {
                  text: R`$\dfrac{v_1}{2} + \dfrac{v_1 - v_2}{4} = 5 + 10$`,
                  correct: true,
                  feedback: R`漂亮！左边两条电阻支路电流都假设流出 $v_1$，右边 $5\,\text{A}$ 与 $10\,\text{A}$ 两个电流源都指向并流入 $v_1$，一进一出完全平衡！`,
                },
                {
                  text: R`$\dfrac{v_1}{2} + \dfrac{v_1 - v_2}{4} = 5 - 10$`,
                  correct: false,
                  feedback: R`停！抬头看顶部 $10\,\text{A}$ 电流源的箭头方向——它是指向**左边**（流入 $v_1$）的！既然和 $5\,\text{A}$ 一样都在给 $v_1$ 灌入电流，右边应该是 $5 + 10$，不能减！`,
                },
                {
                  text: R`$\dfrac{v_1}{2} + \dfrac{v_2 - v_1}{4} = 5 + 10$`,
                  correct: false,
                  feedback: '注意分子顺序！我们现在站在 $v_1$ 上假设电流**从 $v_1$ 流向 $v_2$**，高电位减去低电位，分子必须是 $v_1 - v_2$，写成 $v_2 - v_1$ 就反号了。',
                },
              ],
              board: [R`\text{节点 } v_1 \text{ KCL: } \frac{v_1}{2} + \frac{v_1 - v_2}{4} = 5 + 10 \implies 3v_1 - v_2 = 60 \quad (1)`],
              halo: ['node_v1', 'src_is1', 'src_is2', 'branch_r1', 'branch_r2'],
              params: { w21_layer: L2, ...CORE, w21_stand: 'v1', w21_eq: false, w21_dual: false, w21_sym: false },
            },
            {
              title: 'Step 3 · 列写节点 v₂ 的 KCL 方程',
              mini_svg: MINI_STEP3,
              question: R`切换到节点 $v_2$！注意顶部 $10\,\text{A}$ 电流源从 $v_2$ **流出**。按“流出电流总和 $= 0$”列写节点 $v_2$ 的 KCL 方程，正确的是？`,
              hint: R`站在 $v_2$ 上，三条支路全按流出写：经 $R_2=4\,\Omega$ 流向 $v_1$ 是 $\frac{v_2 - v_1}{4}$，经 $R_3=6\,\Omega$ 流向地是 $\frac{v_2}{6}$，再加上明确流出的 $10\,\text{A}$。`,
              options: [
                {
                  text: R`$\dfrac{v_2 - v_1}{4} + \dfrac{v_2}{6} = 10$`,
                  correct: false,
                  feedback: R`抓到一个高频符号坑！如果把 $10$ 写在等号右边，意味着 $10\,\text{A}$ 是**流入** $v_2$ 的；但图上 $10\,\text{A}$ 箭头明确**离开** $v_2$！所以它应该和流出电阻电流待在等号同一侧（或移到右边变成 $-10$）。`,
                },
                {
                  text: R`$\dfrac{v_2 - v_1}{4} + \dfrac{v_2}{6} + 10 = 0$`,
                  correct: true,
                  feedback: '太稳了！同一条跨接电流源支路，对 $v_1$ 是流入（右边 $+10$），对 $v_2$ 就必然是流出（左边 $+10$，等价于右边 $-10$）。',
                },
                {
                  text: R`$\dfrac{v_1 - v_2}{4} + \dfrac{v_2}{6} + 10 = 0$`,
                  correct: false,
                  feedback: '你把站位忘了！既然换到了节点 $v_2$，流出 $R_2$ 的电流必须以 $v_2$ 为起点，分子是 $v_2 - v_1$，不能直接照抄节点 1 的 $v_1 - v_2$。',
                },
              ],
              board: [R`\text{节点 } v_2 \text{ KCL: } \frac{v_2 - v_1}{4} + \frac{v_2}{6} + 10 = 0 \implies -3v_1 + 5v_2 = -120 \quad (2)`],
              halo: ['node_v2', 'src_is2', 'branch_r2', 'branch_r3'],
              params: { w21_layer: L2, ...CORE, w21_stand: 'v2', w21_eq: false, w21_dual: false, w21_sym: false },
            },
            {
              title: 'Step 4 · 通分消分母并消元求 v₂',
              mini_svg: MINI_STEP4,
              question: '方程 (1) 两边乘 $4$ 得 $3v_1 - v_2 = 60$，方程 (2) 两边乘 $12$ 得 $-3v_1 + 5v_2 = -120$。将两式直接相加消去 $v_1$，求得 $v_2$ 为多少？',
              hint: '$(3v_1 - 3v_1) + (-v_2 + 5v_2) = 60 + (-120)$，注意右边是 $60 - 120$。',
              options: [
                {
                  text: R`$v_2 = +15\,\text{V}$`,
                  correct: false,
                  feedback: R`负号跑丢啦！右边 $60 + (-120) = -60$，除以 $4$ 得到的是 $-15\,\text{V}$，不是 $+15\,\text{V}$。在电路里，正负号直接决定电流方向！`,
                },
                {
                  text: R`$v_2 = -15\,\text{V}$`,
                  correct: true,
                  feedback: R`干净利落！$4v_2 = -60 \implies v_2 = -15\,\text{V}$。不要害怕算出负数，这说明节点 2 的电位比参考地低了 $15\,\text{V}$。`,
                },
                { text: R`$v_2 = -30\,\text{V}$`, correct: false, feedback: R`检查左边系数：$-v_2 + 5v_2 = 4v_2$，不是 $2v_2$；$-60 / 4 = -15\,\text{V}$。` },
              ],
              board: [R`(1) + (2):\; 4v_2 = -60 \implies v_2 = -15\,\text{V}`],
              halo: ['node_v1', 'node_v2'],
              params: { w21_layer: L3, ...CORE, w21_solve: 1 },
            },
            {
              title: 'Step 5 · 回代求 v₁ 并解读支路电流 i₃',
              mini_svg: MINI_STEP5,
              question: R`把 $v_2 = -15\,\text{V}$ 代回 $3v_1 - v_2 = 60$ 求出 $v_1$，并判断流经 $R_3 = 6\,\Omega$ 的真实电流方向。`,
              hint: R`$3v_1 - (-15) = 60 \implies 3v_1 = 45$；再算 $i_3 = \frac{v_2 - 0}{6}$ 看正负。`,
              options: [
                {
                  text: R`$v_1 = 15\,\text{V}$；$i_3 = -2.5\,\text{A}$，说明有 $2.5\,\text{A}$ 从参考地向上流入 $v_2$`,
                  correct: true,
                  feedback: R`满分闭环！$v_1 = 15\,\text{V}, v_2 = -15\,\text{V}$。参考地 ($0\,\text{V}$) 比 $v_2$ ($-15\,\text{V}$) 电位更高，所以真实水流（电流）是从参考地经 $6\,\Omega$ 向上爬进 $v_2$ 的！`,
                },
                {
                  text: R`$v_1 = 25\,\text{V}$；$i_3 = -2.5\,\text{A}$`,
                  correct: false,
                  feedback: '小心双重负号陷阱！$3v_1 - (-15) = 60$ 化简是 $3v_1 + 15 = 60$，移项后是 $60 - 15 = 45$，不是 $60 + 15 = 75$ 哦！',
                },
                {
                  text: R`$v_1 = 15\,\text{V}$；$i_3 = -2.5\,\text{A}$，说明 $R_3$ 上有 $2.5\,\text{A}$ 向下流向参考地`,
                  correct: false,
                  feedback: R`前面算对了 $i_3 = -2.5\,\text{A}$，但方向解读反了！我们定义 $i_3$ 是向下流出 $v_2$ 的，算出负值意味着真实电流与假设方向**相反**，即自地向上流入 $v_2$。`,
                },
              ],
              board: [R`3v_1 - (-15) = 60 \implies v_1 = 15\,\text{V},\quad i_3 = \frac{-15}{6} = -2.5\,\text{A}\;(\text{实际自地向上流入 } v_2)`],
              halo: ['node_v1', 'node_v2', 'branch_r3'],
              params: { w21_layer: L3, ...CORE, w21_solve: 3 },
            },
          ],
          conclusion: R`满分闭环！$v_1 = 15\,\text{V}, v_2 = -15\,\text{V}$。参考地 ($0\,\text{V}$) 比 $v_2$ ($-15\,\text{V}$) 电位更高，所以真实水流（电流）是从参考地经 $6\,\Omega$ 向上爬进 $v_2$ 的！`,
        },
        { kind: 'p', text: '**通关复盘 · 三段式教授板书推导（经典例题 1 完整求解）**' },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            { label: '已知', text: R`$I_{s1} = 5\,\text{A},\; I_{s2} = 10\,\text{A},\; R_1 = 2\,\Omega,\; R_2 = 4\,\Omega,\; R_3 = 6\,\Omega$` },
            { label: 'Step A（代入数值）', tex: R`\begin{cases} \dfrac{v_1}{2} + \dfrac{v_1 - v_2}{4} = 5 + 10 \\[8pt] \dfrac{v_2 - v_1}{4} + \dfrac{v_2}{6} = -10 \end{cases}` },
            {
              label: 'Step B（通分消分母）',
              text: R`方程 (1) 两边同乘 $4$：$2v_1 + (v_1 - v_2) = 60$；方程 (2) 两边同乘 $12$（$4$ 与 $6$ 的最小公倍数）：$3(v_2 - v_1) + 2v_2 = -120$`,
            },
            { label: 'Step C（整理标准方程组并消元求解）', tex: R`\begin{cases} 3v_1 - v_2 = 60 & \text{(1)} \\ -3v_1 + 5v_2 = -120 & \text{(2)} \end{cases}` },
            { label: '将 (1) $+$ (2) 直接消去 $v_1$', tex: R`4v_2 = -60 \implies v_2 = -15\,\text{V}` },
            { label: R`将 $v_2 = -15\,\text{V}$ 代回 (1)`, tex: R`3v_1 - (-15) = 60 \implies 3v_1 + 15 = 60 \implies 3v_1 = 45 \implies v_1 = 15\,\text{V}` },
            {
              label: 'Step D（回代反求全部支路电流 + 物理意义解码）',
              tex: R`\begin{gathered} i_1 = \frac{v_1 - 0}{R_1} = \frac{15}{2} = 7.5\,\text{A} \;(\text{自 } v_1 \text{ 向下流向地}) \\[6pt] i_2 = \frac{v_1 - v_2}{R_2} = \frac{15 - (-15)}{4} = \frac{30}{4} = 7.5\,\text{A} \;(\text{自 } v_1 \text{ 向右流向 } v_2) \end{gathered}`,
            },
            {
              label: '$i_3$',
              text: R`$i_3 = \dfrac{v_2 - 0}{R_3} = \dfrac{-15}{6} = -2.5\,\text{A}$（负号表示真实电流为 $2.5\,\text{A}$ 自参考地向上流入 $v_2$!）`,
            },
            {
              label: 'KCL 终极验算',
              text: R`节点 $v_1$：流入 $= 5 + 10 = 15\,\text{A}$，流出 $= i_1 + i_2 = 7.5 + 7.5 = 15\,\text{A}$ ✓；节点 $v_2$：流入 $= i_2 + (-i_3) = 7.5 + 2.5 = 10\,\text{A}$，流出 $= I_{s2} = 10\,\text{A}$ ✓`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授物理点评**：算出了 $v_2 = -15\,\text{V}$ 千万别慌！这就像吐鲁番盆地海拔 $-154\,\text{m}$ 一样完全正常——$10\,\text{A}$ 强力水泵拼命从节点 $2$ 往外抽水，把节点 $2$ 的“电气海拔”抽到了海平面（参考地）以下 $15\,\text{V}$，于是参考地反而经由 $R_3 = 6\,\Omega$ 向上倒灌 $2.5\,\text{A}$ 进来补水。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 5 (sheet act 4) */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '进阶实战（二）——含受控电流源的 3 节点电路（Sadiku 3.2 进阶例题）',
      sync: at(L2, ['src_dep', 'ctrl_ix', 'branch_r12'], {
        w21_circuit: 'cccs',
        w21_ref: 'v0',
        w21_stand: 'v3',
        w21_dual: false,
        w21_eq: true,
        w21_sym: false,
        w21_reveal: true,
        w21_solve: 4,
      }),
      blocks: [
        { kind: 'p', text: '**受控源（Dependent Source）怎么破？两步口诀搞定！**' },
        {
          kind: 'p',
          text: R`在真实电子电路（如晶体管放大器、运放等效模型）中，菱形符号的[[src_dep|**受控电流源**]]无处不在。面对受控源，很多同学一看方程里多出一个 $i_x$ 就卡壳了。其实只要牢记教授的两步口诀，它和独立源一样简单：`,
        },
        {
          kind: 'ol',
          items: [
            R`**第一步（一视同仁）**：先假装受控电流源 $2i_x$ 就是一个普通电流源，照常对所有 $n - 1$ 个非参考节点列 KCL。`,
            R`**第二步（消去控制量）**：立即写下**控制变量约束方程**，用节点电压把[[ctrl_ix|控制量 $i_x$]] 翻译出来（本例中 $i_x = \dfrac{v_1 - v_2}{R_{12}}$），代入 KCL 方程彻底消灭 $i_x$——**最终方程组里只允许留下节点电压 $v_1, v_2, v_3$！**`,
          ],
        },
        { kind: 'figure', svg: SVG_ACT4, caption: '本幕 2D 教学原理图（含 CCCS 2iₓ 的 3 节点电路）' },
        { kind: 'p', text: '**三段式教授板书推导（进阶例题 2 完整求解）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: R`全图共有 $n = 4$ 个节点（$v_1, v_2, v_3$ 及参考地 $0$），需列写 $n - 1 = 3$ 个节点 KCL 方程；菱形元件 $2i_x$ 为电流控制电流源（CCCS），位于节点 $v_3$ 与参考地之间且箭头向下（从 $v_3$ 流出），其控制变量 $i_x$ 为流经 $R_{12}$（$v_1 \to v_2$）的支路电流，依据欧姆定律补写约束方程 $i_x = \dfrac{v_1 - v_2}{R_{12}}$。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（General Formula）：三节点 KCL 与控制变量约束方程组（纯符号形式）：',
          tex: R`\begin{cases} \dfrac{v_1 - v_2}{R_{12}} + \dfrac{v_1 - v_3}{R_{13}} = I_s & \text{(节点 } 1\text{)} \\[10pt] \dfrac{v_2 - v_1}{R_{12}} + \dfrac{v_2}{R_{2g}} + \dfrac{v_2 - v_3}{R_{23}} = 0 & \text{(节点 } 2\text{)} \\[10pt] \dfrac{v_3 - v_1}{R_{13}} + \dfrac{v_3 - v_2}{R_{23}} + \beta i_x = 0 & \text{(节点 } 3\text{)} \\[10pt] i_x = \dfrac{v_1 - v_2}{R_{12}} & \text{(控制变量约束)} \end{cases}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            { label: '已知', text: R`$I_s = 5\,\text{A},\; R_{12} = 2\,\Omega,\; R_{13} = 4\,\Omega,\; R_{2g} = 4\,\Omega,\; R_{23} = 8\,\Omega,\; \beta = 2$` },
            {
              label: R`Step A（代入数值并立即消去控制变量 $i_x = \dfrac{v_1 - v_2}{2}$）`,
              tex: R`\begin{aligned} &\text{节点 1：} && \dfrac{v_1 - v_2}{2} + \dfrac{v_1 - v_3}{4} = 5 \\[8pt] &\text{节点 2：} && \dfrac{v_2 - v_1}{2} + \dfrac{v_2}{4} + \dfrac{v_2 - v_3}{8} = 0 \\[8pt] &\text{节点 3：} && \dfrac{v_3 - v_1}{4} + \dfrac{v_3 - v_2}{8} + 2\left(\dfrac{v_1 - v_2}{2}\right) = 0 \end{aligned}`,
            },
            {
              label: 'Step B（通分消分母，整理为标准三元一次方程组）',
              tex: R`\begin{aligned} &\text{节点 1 两边乘 } 4: && 2(v_1 - v_2) + (v_1 - v_3) = 20 \implies 3v_1 - 2v_2 - v_3 = 20 \quad (1) \\ &\text{节点 2 两边乘 } 8: && 4(v_2 - v_1) + 2v_2 + (v_2 - v_3) = 0 \implies -4v_1 + 7v_2 - v_3 = 0 \quad (2) \\ &\text{节点 3 两边乘 } 8: && 2(v_3 - v_1) + (v_3 - v_2) + 8(v_1 - v_2) = 0 \implies 6v_1 - 9v_2 + 3v_3 = 0 \end{aligned}`,
            },
            { label: '两边同除以 $3$ 化简得', tex: R`2v_1 - 3v_2 + v_3 = 0 \quad (3)` },
            {
              label: R`Step C（消元求解 $v_1, v_2, v_3$）：用 $(1) + (3)$ 消去 $v_3$`,
              tex: R`(3v_1 - 2v_2 - v_3) + (2v_1 - 3v_2 + v_3) = 20 \implies 5v_1 - 5v_2 = 20 \implies v_1 - v_2 = 4 \implies v_1 = v_2 + 4 \quad (4)`,
            },
            { label: '用 $(2) + (3)$ 消去 $v_3$', tex: R`(-4v_1 + 7v_2 - v_3) + (2v_1 - 3v_2 + v_3) = 0 \implies -2v_1 + 4v_2 = 0 \implies v_1 = 2v_2 \quad (5)` },
            { label: '联立 $(4)$ 与 $(5)$', tex: R`2v_2 = v_2 + 4 \implies v_2 = 4\,\text{V},\quad v_1 = 8\,\text{V}` },
            { label: '代回 $(3)$ 求 $v_3$', tex: R`v_3 = 3v_2 - 2v_1 = 3(4) - 2(8) = 12 - 16 = -4\,\text{V}` },
            {
              label: 'Step D（反算受控源与全图支路电流 + 逐节点 KCL 验算）',
              text: R`控制电流 $i_x = \dfrac{v_1 - v_2}{2} = \dfrac{8 - 4}{2} = 2\,\text{A}$，因此受控电流源输出 $2i_x = 4\,\text{A}$；其余支路电流：$i_{13} = \dfrac{8 - (-4)}{4} = 3\,\text{A}$，$i_{2g} = \dfrac{4}{4} = 1\,\text{A}$，$i_{23} = \dfrac{4 - (-4)}{8} = 1\,\text{A}$；`,
            },
            {
              label: '逐节点验算',
              text: R`节点 $v_1$：流入 $5\,\text{A} =$ 流出 $i_x + i_{13} = 2 + 3 = 5\,\text{A}$ ✓；节点 $v_2$：流入 $i_x = 2\,\text{A} =$ 流出 $i_{2g} + i_{23} = 1 + 1 = 2\,\text{A}$ ✓；节点 $v_3$：流入 $i_{13} + i_{23} = 3 + 1 = 4\,\text{A} =$ 流出 $2i_x = 4\,\text{A}$ ✓`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 6 (sheet act 5) + self-test */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '参考地切换不变性与“一眼写矩阵”检验法',
      sync: at(L1, ['node_v2', 'node_gnd'], { ...CORE, w21_ref: 'v2', w21_reveal: true, w21_solve: 2 }),
      blocks: [
        { kind: 'p', text: '**破除最大直觉误区：换一个节点接地，结果会变吗？**' },
        {
          kind: 'p',
          text: R`很多同学会问：“教授，如果我在第 3 幕的电路里，偏不选底部接地，而是把[[node_v2|**节点 2 设为参考地（$v_2' = 0\,\text{V}$）**]]，算出来的结果会怎样？”`,
        },
        { kind: 'p', text: '答案非常优雅：' },
        {
          kind: 'ul',
          items: [
            R`**所有节点的“绝对海拔数字”会整体平移同一个常数**（本例中全部 $+15\,\text{V}$）：原来：$(v_1, v_2, v_0) = (+15\,\text{V},\; -15\,\text{V},\; 0\,\text{V})$；切换后：$(v_1', v_2', v_0') = (+30\,\text{V},\; 0\,\text{V},\; +15\,\text{V})$`,
            R`**所有物理可测量（任意电阻两端电压差、任意支路电流、任意元件功率）纹丝不动！** [[branch_r2|$R_2 = 4\,\Omega$ 两端压差]]：$v_1' - v_2' = 30 - 0 = 30\,\text{V} = v_1 - v_2$，电流仍是 $i_2 = 7.5\,\text{A}$！[[branch_r1|$R_1 = 2\,\Omega$ 两端压差]]：$v_1' - v_0' = 30 - 15 = 15\,\text{V} = v_1 - v_0$，电流仍是 $i_1 = 7.5\,\text{A}$！`,
          ],
        },
        { kind: 'figure', svg: SVG_ACT5, caption: '本幕 2D 教学原理图（参考地切换不变性对比）' },
        { kind: 'p', text: '**教授压箱底验算“X 光机”：电导矩阵 $\\mathbf{G}\\mathbf{v} = \\mathbf{i}$ 速查规律**' },
        { kind: 'p', text: '对于**仅含电阻与独立电流源（不含受控源）**的电路，标准节点方程组写成矩阵 $\\mathbf{G}\\mathbf{v} = \\mathbf{i}$ 时，必然同时满足以下三条铁律：' },
        {
          kind: 'ol',
          items: [
            R`**主对角元素 $G_{kk}$（自电导）**：等于直接连在节点 $k$ 上的**所有电阻电导之和**，恒为**正数**。`,
            R`**非对角元素 $G_{kj}$（互电导，$k \ne j$）**：等于直接跨接在节点 $k$ 与 $j$ 之间的电导之和的**负值**，且矩阵严格对称（$G_{kj} = G_{jk}$）。`,
            R`**右端向量 $i_k$**：等于直接**流入**节点 $k$ 的独立电流源代数和（流出取负）。`,
          ],
        },
        {
          kind: 'formula',
          title: '例题 1 的电导矩阵（乘公倍数之前）：对角为正、互导为负且对称',
          tex: R`\begin{bmatrix} \tfrac{1}{2} + \tfrac{1}{4} & -\tfrac{1}{4} \\[6pt] -\tfrac{1}{4} & \tfrac{1}{4} + \tfrac{1}{6} \end{bmatrix} \begin{bmatrix} v_1 \\[6pt] v_2 \end{bmatrix} = \begin{bmatrix} 5 + 10 \\[6pt] -10 \end{bmatrix}`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**考场自检神技**：做**无受控源**题目时，如果整理完发现 $G_{12} \ne G_{21}$（比如例题 1 中两式 $v_2$ 与 $v_1$ 的互导项都是 $-1/4$），**100% 说明你某个地方写错了符号或漏了支路！** 做**含受控源**题目时（如例题 2），受控源消元会把控制节点电位带入被控节点方程，**系数矩阵 $\mathbf{G}$ 的对称性会被打破**——千万不要死套对称矩阵去蒙答案！`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`注意：对称性要在**乘公倍数之前**的电导形式上检验。例题 1 两式分别乘了 $4$ 和 $12$，整数式 $3v_1 - v_2 = 60$、$-3v_1 + 5v_2 = -120$ 的互导系数 $-1$ 与 $-3$ 不相等，这并不是写错。`,
        },
        { kind: 'p', text: '最后用 4 道诊断题检验今天的节点分析功力：' },
      ],
      quiz: [
        {
          id: 'w2l1_q1',
          question: R`在例题 1（底部接地时求得 $v_1 = 15\,\text{V},\; v_2 = -15\,\text{V}$）中，若将参考地改选在节点 2（即强行规定新参考电位 $v_2' = 0\,\text{V}$），电路其他元件完全不变，则下列说法正确的是？`,
          options: [
            {
              key: 'A',
              text: '所有节点电位保持不变，因为物理电路没有改接线',
              correct: false,
              feedback: '误区：节点电位是相对于参考地的“相对海拔”。海平面换了，各地海拔数字必然整体平移！',
            },
            {
              key: 'B',
              text: R`$v_1'$ 变为 $30\,\text{V}$，原底节点电位 $v_0'$ 变为 $+15\,\text{V}$，但 $R_2 = 4\,\Omega$ 两端电压差与电流 $i_2 = 7.5\,\text{A}$ 保持不变`,
              correct: true,
            },
            {
              key: 'C',
              text: R`$v_1'$ 变为 $0\,\text{V}$，因此流经 $R_2$ 的电流 $i_2$ 会归零`,
              correct: false,
              feedback: R`错误：新的参考地是节点 2，被规定为 $0\,\text{V}$ 的是 $v_2'$，不是 $v_1'$；何况参考地只是数学计算时的零点标尺，改选参考地绝不会改变电路里的真实电流。`,
            },
            {
              key: 'D',
              text: R`$v_1'$ 变为 $30\,\text{V}$，导致 $R_1 = 2\,\Omega$ 的功耗翻倍`,
              correct: false,
              feedback: R`警惕：功耗由 $R_1$ 两端的压差决定，而不是由 $v_1'$ 这一个读数决定。$R_1$ 接在节点 1 和原底节点之间，换参考地时这两个节点的电位平移同一个常数，压差不变，功耗丝毫未变。`,
            },
          ],
          feedback_correct: R`完全正确！参考地切换相当于给全图每个节点电位同时加上 $+15\,\text{V}$，所有两点间的电位差（支路电压）与支路电流严格不变。`,
          feedback_wrong: '再想一想：换参考地改变的是“海平面”，各节点海拔怎么变？两点间的差呢？',
          figure: SVG_Q1,
          sync: at(L1, ['node_v2', 'node_gnd'], { ...CORE, w21_reveal: true }),
        },
        {
          id: 'w2l1_q2',
          question: R`某独立电流源 $I_s = 8\,\text{A}$ 跨接在非参考节点 $v_a$ 和 $v_b$ 之间，箭头由 $v_a$ 指向 $v_b$。若两个节点均采用标准形式“流出电阻电流之和 $=$ 流入独立电流源之和”列写 KCL，则 $I_s$ 在 $v_a$ 和 $v_b$ 方程的**等号右侧**分别应写作？`,
          options: [
            { key: 'A', text: '$v_a$ 右侧写 $+8$，$v_b$ 右侧写 $+8$', correct: false, feedback: '违反电荷守恒！同一电流源不可能同时向两端都“流入”电流。' },
            { key: 'B', text: '$v_a$ 右侧写 $-8$，$v_b$ 右侧写 $+8$', correct: true },
            {
              key: 'C',
              text: '$v_a$ 右侧写 $+8$，$v_b$ 右侧写 $-8$',
              correct: false,
              feedback: '正负号写反了！等号右侧记的是“流入当前节点的电流源之和”。箭头从 $v_a$ 出发、指向 $v_b$：对 $v_a$ 来说这 8 A 是离开的，不能记正。',
            },
            {
              key: 'D',
              text: '只需在 $v_a$ 方程里写一次，在 $v_b$ 方程里可以忽略',
              correct: false,
              feedback: '绝对不行！跨接在两个非参考节点之间的任何元件，都必须同时出现在这两个节点的 KCL 方程中。',
            },
          ],
          feedback_correct: '精准！箭头从 $v_a$ 指向 $v_b$，说明对 $v_a$ 是流出（等号右侧取 $-8$），对 $v_b$ 是流入（等号右侧取 $+8$）。',
          feedback_wrong: '看箭头：对每个节点分别问一句“这 8 A 是进来还是出去？”',
          figure: SVG_Q2,
          sync: at(L2, ['src_is2'], { ...CORE, w21_stand: 'v2', w21_eq: false, w21_sym: false, w21_dual: false }),
        },
        {
          id: 'w2l1_q3',
          question: R`用节点分析法解得某电路节点电位 $v_3 = -4\,\text{V}$，$v_2 = +4\,\text{V}$，两节点之间接有一只 $R_{23} = 8\,\Omega$ 的电阻。则流经 $R_{23}$ 的电流大小与真实方向为？`,
          options: [
            {
              key: 'A',
              text: R`$0\,\text{A}$，因为正负电位相互抵消`,
              correct: false,
              feedback: R`高发误区！电位差是相减不是相加：$v_2 - v_3 = 4 - (-4) = 8\,\text{V}$，不是 $4 + (-4) = 0$！`,
            },
            { key: 'B', text: R`$1\,\text{A}$，真实方向从 $v_2$ 流向 $v_3$`, correct: true },
            {
              key: 'C',
              text: R`$1\,\text{A}$，真实方向从 $v_3$ 流向 $v_2$`,
              correct: false,
              feedback: R`方向反了！$+4\,\text{V}$ 高于 $-4\,\text{V}$，被动电阻上的电流永远从高电位流向低电位。`,
            },
            {
              key: 'D',
              text: '无法确定，必须先知道参考地的位置才能算电流',
              correct: false,
              feedback: '只要 $v_2$ 和 $v_3$ 是在同一个参考地基准下求得的，直接相减就能算出精确的支路电压和电流。',
            },
          ],
          feedback_correct: R`完全正确！$i_{23} = \frac{v_2 - v_3}{R_{23}} = \frac{4 - (-4)}{8} = 1\,\text{A}$，电流由高电位 ($+4\,\text{V}$) 流向低电位 ($-4\,\text{V}$)。`,
          feedback_wrong: '先求两节点的电位差（相减），再用欧姆定律；电流从高电位流向低电位。',
          figure: SVG_Q3,
          sync: at(L1, ['node_v2', 'node_v3', 'branch_r23'], { w21_circuit: 'cccs', w21_ref: 'v0', w21_reveal: true }),
        },
        {
          id: 'w2l1_q4',
          question: R`当电路中引入了一个电流控制电流源（CCCS）$2i_x$（其中 $i_x = \frac{v_1 - v_2}{2}$）后，关于节点分析法的正确做法与电导矩阵 $\mathbf{G}$ 的特征，以下哪项正确？`,
          options: [
            {
              key: 'A',
              text: R`先将 $2i_x$ 当作普通电流源列 KCL，再代入 $i_x = \frac{v_1 - v_2}{2}$ 消元；整理后的系数矩阵 $\mathbf{G}$ 通常不再对称`,
              correct: true,
            },
            {
              key: 'B',
              text: '含受控源的电路无法使用节点分析法，必须改用网孔分析法',
              correct: false,
              feedback: '错误：节点分析法完全适用于含受控源的线性电路，只需多写一步控制变量约束方程。',
            },
            {
              key: 'C',
              text: '保留 $i_x$ 作为独立未知数即可，不需要写出 $i_x$ 与节点电压的关系',
              correct: false,
              feedback: '如果不补写控制变量方程，未知数个数会比方程数多 1 个，线性方程组将欠定无唯一解。',
            },
            {
              key: 'D',
              text: R`即使含有受控源，电导矩阵 $\mathbf{G}$ 也必然严格满足 $G_{ij} = G_{ji}$`,
              correct: false,
              feedback: '陷阱！对称性 $G_{ij} = G_{ji}$ 仅适用于**不含受控源**的纯无源电阻 + 独立电流源网络。',
            },
          ],
          feedback_correct: '直击要害！受控源消元后会将控制节点的电位引入被控节点的方程，从而打破纯电阻网络电导矩阵的对称性。',
          feedback_wrong: '回想第 5 幕的两步口诀，再看受控源消元后各节点方程里出现了哪些电位。',
          figure: SVG_Q4,
          sync: at(L2, ['src_dep', 'ctrl_ix'], { w21_circuit: 'cccs', w21_ref: 'v0', w21_stand: 'v3', w21_eq: true, w21_sym: false, w21_dual: false }),
        },
      ],
      after_quiz: [
        { kind: 'p', text: '**下节预告：W2-L2 含电压源的节点分析与超节点（Supernode）**' },
        {
          kind: 'p',
          text: R`今天的电路里只有电流源和电阻，每一条电阻支路的电流都能写成 $\dfrac{v_a - v_b}{R}$。下节课电路里会冒出理想电压源：它没有电阻，它的电流 $i_{V_s}$ 没法用节点电压写出来。Sadiku Section 3.3 的答案是——电压源恰恰是来帮你“减少未知数”的：接地的电压源直接给出一个节点电位；跨在两个非参考节点之间时，就把它和两端节点圈成一个**超节点**。`,
        },
        { kind: 'figure', svg: SVG_NEXT, caption: '下节预告 W2-L2：悬空电压源与超节点' },
      ],
    },
  ],
};

export default W2_L1;
