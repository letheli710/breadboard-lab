// W2-L3 · 网孔分析法与超网孔（Mesh & Supermesh Analysis） (lesson sheet: docs/lessons/W2-L3.md).
// The professor's text, the three-part derivations, the act diagrams (sheetSvgs.ts), the guided
// example and the diagnostic quiz are reproduced from the sheet; every number was re-derived
// (circuits.test.ts) and agrees with it. Changes, all of form, none of wording:
// - the sheet's bulleted list items with a bold lead run as a bold line and a paragraph; the
//   numbered points of act 2's ① follow its card as a list; act 4's two numbered points of ① are
//   two ① cards, its 秒判口诀 sub-bullet a tip note; ③ sub-bullets join into their Step's text
//   (" · " after the bold lead), a Step with two display formulas is two items with the same label;
// - figures sit where the sheet puts them (acts 2–4: before the derivation, as figure blocks);
// - act 6 drops "与 Claude 工程落地清单" from its title: §6.1 (the stage architecture diagram) and
//   §6.3 (the front-end checklist) are build instructions, implemented on the stage, not shown;
// - [[id|…]] only links a term to the stage (the words are unchanged);
// - the guided example's problem figure leaves out the dashed supermesh outline, and three step
//   diagrams their printed answers (see sheetSvgs.ts) — they are shown with the question;
// - sheet SVG colours lightSvg does not map are replaced by mapped ones, node dots drawn in ink,
//   two labels moved off lines (sheetSvgs.ts);
// - the long board lines of guided steps 2, 4 and 5 are split into two lines (narrow screens);
// - the guided example has no ③ card after it: its circuit is not one of the acts' worked
//   examples (act 4's numbers stay before it), and the board itself is the full derivation;
// - the sheet's hover/stage ids (no hover map is given) and the stage params are this lesson's
//   (ids.ts, the layer files); the guided steps reveal the example's numbers on the stage one
//   by one (ex_reveal), so the stage never shows an answer before its step;
// - added (the sheet has none): subtitle; praise for the right guided options and the
//   conclusion; feedback for each wrong quiz option (from the sheet's explanation); the four quiz
//   figures and act 6's method map (figures.ts); act 6's one-line lead-in.

import { lazy } from 'react';
import { lightSvg } from '../../svgTheme';
import type { StageLesson } from '../../types';
import { SVG_ACT6, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './figures';
import { HOVER_MAP } from './ids';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_PROBLEM5 } from './sheetSvgs';

const MeshLayer = lazy(() => import('./MeshLayer'));
const SourceLayer = lazy(() => import('./SourceLayer'));
const SolverLayer = lazy(() => import('./SolverLayer'));

/** a sheet figure drawn 780–820 wide: light theme, and marked so that on a phone it keeps a
 *  legible size and scrolls sideways (w2l3.css) */
const wide = (svg: string) => lightSvg(svg).replace('<svg ', '<svg data-w23-wide="" ');

const L1 = 'layer_01';
const L2 = 'layer_02';
const L3 = 'layer_03';

const W2_L3: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: MeshLayer, [L2]: SourceLayer, [L3]: SolverLayer },
  lesson_meta: {
    lesson_id: 'W2-L3',
    world: 'World 2',
    title: '网孔分析法与超网孔（Mesh & Supermesh Analysis）',
    subtitle: '以 KVL 为主引擎：顺时针网孔电流、边缘电流源锁死与超网孔“去源绕大环”',
    lesson_type: 'B',
    lesson_type_label: 'Type B（纯公式/方法论课 · 2D 交互式原理图驱动，无需 3D 面包板）',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Sec. 3.4 网孔分析法（Mesh Analysis）', 'Sec. 3.5 含电流源的网孔分析（超网孔 Supermesh）'],
    },
    textbook_supplement: 'Introductory Circuit Analysis, 14th Ed. (Boylestad) — Ch. 8 Mesh Analysis',
    prerequisites: ['W1-L4 节点/支路/回路（Nodes, Branches & Loops）', 'W1-L5 基尔霍夫电流定律（KCL）', 'W1-L6 基尔霍夫电压定律（KVL）'],
    next_lesson: 'W2-L4',
    next_lesson_title: '节点法 vs 网孔法选型策略与矩阵直写法',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 顺时针网孔电流与共享支路叠加',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '切换“网孔窗格 / 大外环回路 / 非平面反例”；悬停共享电阻 R₂ 拆出 i₁↓ 与 ↑i₂；拖动 V₁、V₂，看两条 KVL 验算始终归零。',
      },
      {
        id: L2,
        label: '02 含电流源与超网孔外环绕行',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: 'Case 1 边缘电流源直接锁死 i₂；Case 2 按“构造超网孔”切除共享支路、沿琥珀虚线绕大外环；打开节点 b 的 KCL；拖动串联电阻，看网孔电流纹丝不动。',
      },
      {
        id: L3,
        label: '03 网孔方程联立求解台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '选一道题看 R·i = v：悬停主对角线点亮该网孔边框上的电阻，悬停非对角线只点亮共享电阻；下方逐步消元并还原支路电流。',
      },
    ],
    hover_map: HOVER_MAP,
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '平面电路前提与“网孔”直觉——窗格里的循环气流',
      sync: { layer: L1, halo: ['mesh_window', 'shared_r2'], params: { l1_view: 'mesh', l1_v1: 20, l1_v2: 5 } },
      blocks: [
        {
          kind: 'p',
          text: '**教授开场白**：上一讲我们用**节点电压法（Nodal Analysis）**以 KCL 为武器，把全电路的未知数压缩到了“独立节点数”。今天，我们切换到一个与节点法完全对偶的视角——**网孔分析法（Mesh Analysis）**。它以 **W1-L6 的 KVL** 为主引擎，把未知数设为每一个最小窗格内的虚拟循环电流。当你面对电压源居多、支路并联较少、或者需要直接求某条支路电流的平面电路时，网孔法往往能让你用最少的方程一锤定音。准备好了吗？我们推开第一扇窗。',
        },
        { kind: 'p', text: '**教授讲授：先守规矩，再谈直觉**' },
        { kind: 'p', text: '在动笔列任何网孔方程之前，你必须先过**一道不可逾越的安检门**：' },
        { kind: 'p', text: '**铁律前提：仅适用于平面电路（Planar Circuit）**' },
        {
          kind: 'p',
          text: String.raw`什么是平面电路？如果一个电路能画在一张平展的纸上，并且**没有任何两条导线在非节点处交叉**，它就是平面电路。反过来，如果无论你怎么重新排布元件位置，总有导线被迫“架立交桥”交叉（例如经典的三节点对三节点二分图 $K_{3,3}$ 拓扑），这就是[[nonplanar_k33|**非平面电路（Non-planar Circuit）**]]——此时“窗格”的概念崩塌，网孔分析法**彻底失效**，你必须退回节点电压法或更通用的回路分析法。`,
        },
        { kind: 'p', text: '**精准辨析：回路（Loop）vs. 网孔（Mesh）**（回链 W1-L4）' },
        {
          kind: 'ul',
          items: [
            '[[outer_loop|**回路（Loop）**]]：电路中任意一条闭合路径，内部可以套着其他支路。',
            '[[mesh_window|**网孔（Mesh）**]]：**内部不再包含任何其他回路的“最小闭合回路”**。',
          ],
        },
        {
          kind: 'p',
          text: '借用 Boylestad《电路分析导论》第 8 章最传神的比喻：把平面电路想象成一扇**田字格窗户**，每一块独立的玻璃窗格就是一个[[mesh_window|**网孔**]]。[[outer_loop|整个大窗框是一个回路，但不是网孔]]；而每一块小玻璃内部空无一物，它才是网孔。',
        },
        { kind: 'p', text: '**物理直觉：网孔电流 vs. 真实支路电流**' },
        { kind: 'p', text: '在每个窗格内部，我们想象有一股[[mesh_i1,mesh_i2|**顺时针循环的气流**]]（网孔电流 $i_1, i_2, i_3$）：' },
        {
          kind: 'ul',
          items: [
            '在[[edge_branch|**外围边缘支路**]]（只属于某一个窗格的边），真实流过导线的支路电流**就等于**该网孔电流（注意方向是否一致）。',
            '在[[shared_r2|**共享内部支路**]]（夹在两个相邻窗格之间的边），同时受到左侧窗格向下吹的气流 $i_1$ 和右侧窗格向上吹的气流 $i_2$ 挤压——因此，共享电阻上的**真实支路电流是两股网孔电流的矢量叠加（代数差）**：向下为 $i_1 - i_2$，向上为 $i_2 - i_1$。',
          ],
        },
      ],
      inline_svg: wide(SVG_ACT1),
      figure_caption: '图 1-1：平面三网孔“窗格气流”与共享支路矢量叠加（右附非平面反例）',
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '标准网孔分析法（纯电压源与电阻）——顺时针约定与三段式板书推导',
      sync: { layer: L3, halo: ['mat_diag'], params: { l3_prob: 'std', l3_step: 0, l3_num: false } },
      blocks: [
        { kind: 'figure', svg: wide(SVG_ACT2), caption: '图 2-1：标准双网孔电路（V₁ = 20 V，R₁ = 5 Ω，R₂ = 10 Ω，R₃ = 5 Ω，V₂ = 5 V）' },
        { kind: 'p', text: '**教授板书三段式推导（标准双网孔与 $n$ 网孔对称矩阵规律）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: String.raw`回到 **W1-L6 基尔霍夫电压定律（KVL）** 与 **欧姆定律**：沿任意闭合回路绕行一周，所有元件电压降的代数和恒为零（$\sum v_{\text{drop}} = 0$）。为什么教材强烈建议**把所有网孔电流统一设为顺时针方向**？这里藏着一个极其优雅的符号机制：`,
        },
        {
          kind: 'ol',
          items: [
            String.raw`[[mat_diag|**本网孔自电阻项永远带正号**]]：当你顺时针沿 Mesh $k$ 绕行时，你的绕行方向与本网孔电流 $i_k$ 的方向**完全一致**。按被动符号约定，电流从电阻正端流入，顺着 $i_k$ 走过的每一个电阻都产生**正向压降** $+R \cdot i_k$。`,
            String.raw`[[mat_off|**相邻共享电阻项永远带负号**]]：当你顺时针经过 Mesh $k$ 与相邻 Mesh $j$ 共享的电阻 $R_{\text{shared}}$ 时，相邻网孔电流 $i_j$ 也在自己窗格里顺时针转——这意味着它在共享边上的方向**必然与你当前的绕行方向相反**！因此，流过共享电阻沿你绕行方向的净电流一定是 $(i_k - i_j)$，展开后相邻网孔电流前**永远出现负号** $-R_{\text{shared}} i_j$。`,
            String.raw`[[mat_rhs|**电压源符号**]]：顺时针绕行时，若先遇到电压源的**负号（$-$）**、从正号（$+$）穿出，则是电位升高（压降为 $-V_s$）；若先遇到**正号（$+$）**、从负号（$-$）穿出，则是电位降低（压降为 $+V_s$）。`,
          ],
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（General Formula）· 对图 2-1 所示的标准双网孔电路，分别沿 Mesh 1 与 Mesh 2 顺时针列 KVL：',
          tex: String.raw`\begin{cases}
-V_1 + R_1 i_1 + R_2 (i_1 - i_2) = 0 \\
R_2 (i_2 - i_1) + R_3 i_2 + V_2 = 0
\end{cases}`,
        },
        {
          kind: 'formula',
          title: String.raw`整理合并同类项，写成标准网孔矩阵形式 $\mathbf{R}\mathbf{i} = \mathbf{v}$：`,
          tex: String.raw`\begin{bmatrix}
R_1 + R_2 & -R_2 \\
-R_2 & R_2 + R_3
\end{bmatrix}
\begin{bmatrix}
i_1 \\
i_2
\end{bmatrix}
=
\begin{bmatrix}
V_1 \\
-V_2
\end{bmatrix}`,
        },
        {
          kind: 'formula',
          title: '推广至仅含独立电压源与电阻的 $n$ 网孔平面电路（Sadiku Sec. 3.4 目测法 / Inspection Method），矩阵元素满足严格的对称规律：',
          tex: String.raw`\begin{bmatrix}
R_{11} & -R_{12} & \cdots & -R_{1n} \\
-R_{21} & R_{22} & \cdots & -R_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
-R_{n1} & -R_{n2} & \cdots & R_{nn}
\end{bmatrix}
\begin{bmatrix}
i_1 \\
i_2 \\
\vdots \\
i_n
\end{bmatrix}
=
\begin{bmatrix}
v_1 \\
v_2 \\
\vdots \\
v_n
\end{bmatrix}`,
        },
        { kind: 'p', text: '其中：' },
        {
          kind: 'ul',
          items: [
            String.raw`主对角线 $R_{kk}$ 为第 $k$ 个网孔的[[mat_diag|**自电阻**]]（该网孔边框上所有电阻之和，$R_{kk} > 0$）；`,
            String.raw`非对角线 $-R_{kj}$ 为网孔 $k$ 与网孔 $j$ 之间的[[mat_off|**互电阻负值**]]（两者共享支路上的电阻之和，且矩阵对称 $R_{kj} = R_{jk}$）；`,
            String.raw`右端 $v_k$ 为顺时针绕行网孔 $k$ 时，所有独立电压源[[mat_rhs|**电位升高的代数和**]]（从 $-$ 到 $+$ 取正，从 $+$ 到 $-$ 取负）。`,
          ],
        },
        {
          kind: 'p',
          text: String.raw`已知图 2-1 参数：$V_1 = 20\text{ V}$，$V_2 = 5\text{ V}$，$R_1 = 5\ \Omega$，$R_2 = 10\ \Omega$，$R_3 = 5\ \Omega$。`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            {
              label: 'Step A',
              text: '**代入数值建立原始 KVL 方程组**',
              tex: String.raw`\begin{aligned} &\text{Mesh 1：} -20 + 5 i_1 + 10(i_1 - i_2) = 0 \\ &\text{Mesh 2：} 10(i_2 - i_1) + 5 i_2 + 5 = 0 \end{aligned}`,
            },
            {
              label: 'Step B',
              text: '**合并同类项并约分化简**',
              tex: String.raw`\begin{aligned} &\text{Mesh 1：} 15 i_1 - 10 i_2 = 20 \;\xrightarrow{\div 5}\; 3 i_1 - 2 i_2 = 4 \quad \text{(式 1)} \\ &\text{Mesh 2：} -10 i_1 + 15 i_2 = -5 \;\xrightarrow{\div 5}\; -2 i_1 + 3 i_2 = -1 \quad \text{(式 2)} \end{aligned}`,
            },
            {
              label: 'Step C',
              text: String.raw`**加减消元求解网孔电流 $i_1, i_2$** · 将 $\text{(式 1)} \times 3$ 与 $\text{(式 2)} \times 2$ 相加消去 $i_2$：`,
              tex: String.raw`(9 i_1 - 6 i_2) + (-4 i_1 + 6 i_2) = 12 + (-2) \implies 5 i_1 = 10 \implies i_1 = 2\text{ A}`,
            },
            {
              label: 'Step C',
              text: String.raw`将 $i_1 = 2\text{ A}$ 代回 $\text{(式 2)}$：`,
              tex: String.raw`-2(2) + 3 i_2 = -1 \implies 3 i_2 = 3 \implies i_2 = 1\text{ A}`,
            },
            {
              label: 'Step D',
              text: String.raw`**还原真实支路电流并做 KVL 闭环验算** · [[shared_r2|共享支路 $R_2$]] 上的真实向下电流：$I_{R_2} = i_1 - i_2 = 2 - 1 = 1\text{ A}$。验算各元件压降：$v_{R_1} = 5 \times 2 = 10\text{ V}$，$v_{R_2} = 10 \times 1 = 10\text{ V}$，$v_{R_3} = 5 \times 1 = 5\text{ V}$。Mesh 1 验算：$-20 + 10 + 10 = 0\text{ V}$；Mesh 2 验算：$-10 + 5 + 5 = 0\text{ V}$。全盘闭合无误！`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '含电流源的网孔分析 Case 1——边缘电流源直接锁死网孔电流',
      sync: { layer: L2, halo: ['edge_is', 'series_r'], params: { l2_case: 'c1', l2_cut: false, l2_kcl: false } },
      blocks: [
        { kind: 'p', text: '**教授讲授：遇到电流源先别慌，它其实是来“送分”的**' },
        { kind: 'p', text: '很多同学一看见网孔里混进了电流源就卡壳：“教授，理想电流源两端的电压是未知的，我列 KVL 绕到它那儿怎么写压降啊？”' },
        {
          kind: 'p',
          text: '问得好！这正是 Sadiku Section 3.5 的核心洞察：**我们根本不需要对含电流源的网孔强行列 KVL**。根据电流源所在的位置，分两种情况处理——先看最爽的 [[edge_is|**Case 1：电流源位于外围边缘支路（只属于一个网孔）**]]。',
        },
        {
          kind: 'p',
          text: '由于外围支路的真实电流就等于该网孔电流本身，这个[[edge_is|边缘电流源]]**直接把该网孔电流锁死为一个已知常数**，直接帮我们消掉了一个未知数！你唯一要瞪大眼睛看清的，只有**方向正负号**：',
        },
        {
          kind: 'ul',
          items: [String.raw`电流源箭头与顺时针网孔电流**同向** $\implies i_k = +I_s$；`, String.raw`电流源箭头与顺时针网孔电流**反向** $\implies i_k = -I_s$。`],
        },
        { kind: 'figure', svg: wide(SVG_ACT3), caption: '图 3-1：Case 1 边缘电流源电路（V₁ = 24 V，R₁ = 2 Ω，R₂ = 4 Ω，R₃ = 6 Ω，右侧向上 Is = 3 A）' },
        { kind: 'p', text: '**教授板书三段式推导（边缘电流源降维法）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: String.raw`在图 3-1 中，独立电流源 $I_s$ 位于右侧最外缘支路，仅隶属于 Mesh 2。按 **W1-L4 支路电流定义**，该支路向下的电流就是顺时针网孔电流 $i_2$；而 $I_s$ 强行规定该支路向上的电流为 $I_s$。两者方向相反，故瞬间锁定 $i_2 = -I_s$。同时请注意：[[series_r|$R_3$ 与理想电流源 $I_s$ 串联]]，无论 $R_3$ 阻值多大，它都无法改变 $I_s$ 强行推入节点的电流，因此 $R_3$ **完全不进入**求解 $i_1, i_2$ 的方程（它只影响电流源自身两端的端电压）。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式（General Formula）',
          tex: String.raw`\begin{cases}
i_2 = -I_s \\
-V_1 + R_1 i_1 + R_2 (i_1 - i_2) = 0
\end{cases}`,
        },
        { kind: 'formula', title: '消去 $i_2$ 后直接得 $i_1$ 的闭式通解：', tex: String.raw`i_1 = \frac{V_1 + R_2 i_2}{R_1 + R_2} = \frac{V_1 - R_2 I_s}{R_1 + R_2}` },
        {
          kind: 'p',
          text: String.raw`已知图 3-1 参数：$V_1 = 24\text{ V}$，$R_1 = 2\ \Omega$，$R_2 = 4\ \Omega$，$R_3 = 6\ \Omega$，$I_s = 3\text{ A}$（方向向上）。`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            { label: 'Step A', text: String.raw`**直接读取边缘电流源约束** · $I_s$ 向上，顺时针 $i_2$ 在右侧支路向下，方向相反：`, tex: String.raw`i_2 = -3\text{ A}` },
            { label: 'Step B', text: '**对不含电流源的 Mesh 1 列标准 KVL**', tex: String.raw`-24 + 2 i_1 + 4(i_1 - i_2) = 0 \implies 6 i_1 - 4 i_2 = 24` },
            {
              label: 'Step C',
              text: String.raw`**代入 $i_2 = -3\text{ A}$ 求解 $i_1$**`,
              tex: String.raw`6 i_1 - 4(-3) = 24 \implies 6 i_1 + 12 = 24 \implies 6 i_1 = 12 \implies i_1 = 2\text{ A}`,
            },
            {
              label: 'Step D',
              text: String.raw`**还原共享支路真实电流并核验顶部节点电压** · 中间共享电阻 $R_2$ 向下的真实电流：$I_{R_2} = i_1 - i_2 = 2 - (-3) = 5\text{ A}$（两股电流在 $R_2$ 上实际上是同向汇合向下！）。节点电压交叉验算：从左侧算[[node_a|顶部中节点]] $V_a = 24 - 2 \times 2 = 20\text{ V}$；从中间算 $V_a = 4 \times 5 = 20\text{ V}$。完全一致！顺带一提，若追问电流源两端电压，则 $V_{I_s} = V_a + R_3 I_s = 20 + 6 \times 3 = 38\text{ V}$，这验证了 $R_3$ 只影响 $V_{I_s}$ 而丝毫不影响 $i_1, i_2$。`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '含电流源的网孔分析 Case 2——超网孔（Supermesh）与“去源绕大环”',
      sync: { layer: L2, halo: ['supermesh', 'kcl_node_b', 'series_r'], params: { l2_case: 'c2', l2_cut: true, l2_kcl: true } },
      blocks: [
        { kind: 'p', text: '**教授讲授：当电流源卡在两个网孔的“共享墙”上**' },
        {
          kind: 'p',
          text: '现在进入本课真正的重头戏——[[shared_is|**Case 2：电流源位于两个网孔的共享支路上**]]。此时，没有任何一个网孔电流能单独被锁死，而且无论你沿 Mesh 1 还是沿 Mesh 2 列 KVL，都会一头撞上这个不知端电压的电流源。怎么办？',
        },
        { kind: 'p', text: 'Sadiku Section 3.5 给出了一个堪称外科手术般精准的解法——[[supermesh|**构造超网孔（Supermesh）**]]：' },
        {
          kind: 'ol',
          items: [
            String.raw`**外科“开路切除”**：把包含该共享电流源的整条共享支路（[[series_r|**连同与该电流源串联的任何电阻 $R_s$ 一起**]]）暂时移出视野（开路处理），让左右两个网孔合并成一个[[supermesh|**大外环——超网孔**]]。`,
            String.raw`**对大外环列 KVL**：顺时针沿着这个大外环绕行一周，列一个 KVL 方程。注意！每个外围电阻上仍然流过**各自原属网孔的电流**（左侧电阻用 $i_1$，右侧电阻用 $i_2$），千万不要误以为合并后电流变成同一个了！`,
            String.raw`[[kcl_node_b|**补回内部 KCL 约束**]]：两个未知数只靠一个大外环 KVL 解不出来。我们把刚才移除的共享支路放回原位，在它连接的上下任意一个节点上应用 **W1-L5 KCL**，写出 $i_1, i_2$ 与共享电流源 $I_s$ 的线性差值关系！`,
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: String.raw`**教授划重点（高频考点）**：为什么与共享电流源**串联**的电阻 $R_s$ 在超网孔大环 KVL 中“消失”了？因为超网孔大外环是一条绕过共享支路的闭合路径，压根没有经过 $R_s$；而在共享支路内部，$I_s$ 已经强行锁死了流过 $R_s$ 的电流恒为 $I_s$。所以 $R_s$ **既不影响大外环 KVL，也不影响内部 KCL 约束，因而对所有网孔电流 $i_1, i_2$ 零影响**（但它依然消耗真实功率 $P_{R_s} = I_s^2 R_s$，且会改变电流源两端的实际电压！）。`,
        },
        {
          kind: 'figure',
          svg: wide(SVG_ACT4),
          caption: '图 4-1：Case 2 超网孔（V₁ = 20 V，R₁ = 6 Ω，R₂ = 10 Ω，R₃ = 4 Ω，共享支路 Is = 6 A 向上串联 Rs = 2 Ω）',
        },
        { kind: 'p', text: '**教授板书三段式推导（超网孔大外环 KVL + 内部 KCL 约束）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）· 1. 大外环 KVL 的合法性',
          text: String.raw`**W1-L6 KVL** 适用于**任何闭合回路**，绝不仅限于最小网孔！将共享电流源支路（含其串联电阻 $R_s$）暂时开路后留下的[[supermesh|大外环]]，本身就是原电路中一条货真价实的闭合回路，因此沿大外环顺时针累加压降必为零。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）· 2. 内部 KCL 约束的合法性',
          text: String.raw`大外环 KVL 把两个网孔压缩成了 1 个方程，还差 1 个方程才能解出 2 个未知数 $(i_1, i_2)$。将共享支路放回，在底部[[kcl_node_b|节点 $b$]]（或顶部节点 $a$）应用 **W1-L5 KCL**：进入节点 $b$ 的网孔电流为 $i_2$（从右向左进入节点 $b$），离开节点 $b$ 的电流为 $i_1$（继续向左离开节点 $b$）加上向上的电流源 $I_s$。故 $i_2 = i_1 + I_s$，即 $i_2 - i_1 = I_s$。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: String.raw`**秒判口诀**：**谁在共享支路上与电流源箭头同向，谁就在前面带正号！** 这里 $i_2$ 在中间支路向上（与 $I_s$ 同向），$i_1$ 在中间支路向下（与 $I_s$ 反向），所以一定是 $i_2 - i_1 = I_s$。`,
        },
        {
          kind: 'formula',
          title: String.raw`② 纯符号通式（General Formula）· 对图 4-1 所示的含共享向上电流源 $I_s$（串联 $R_s$）的超网孔电路：`,
          tex: String.raw`\begin{cases}
-V_1 + R_1 i_1 + R_2 i_2 + R_3 i_2 = 0 & \text{（超网孔大外环 KVL，不含 } R_s\text{）} \\
i_2 - i_1 = I_s & \text{（共享支路内部 KCL 约束）}
\end{cases}`,
        },
        {
          kind: 'formula',
          title: '将第二式 $i_2 = i_1 + I_s$ 代入第一式，可得纯符号闭式解：',
          tex: String.raw`i_1 = \frac{V_1 - (R_2 + R_3) I_s}{R_1 + R_2 + R_3}, \qquad i_2 = i_1 + I_s = \frac{V_1 + R_1 I_s}{R_1 + R_2 + R_3}`,
        },
        {
          kind: 'p',
          text: String.raw`已知图 4-1 参数：$V_1 = 20\text{ V}$，$R_1 = 6\ \Omega$，$R_2 = 10\ \Omega$，$R_3 = 4\ \Omega$，共享支路含 $I_s = 6\text{ A}$（向上）与串联电阻 $R_s = 2\ \Omega$。`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简（Step-by-Step Calculation）',
          steps: [
            {
              label: 'Step A',
              text: String.raw`**沿超网孔大外环顺时针列 KVL（绕过共享支路，$R_s$ 不参与）**`,
              tex: String.raw`-20 + 6 i_1 + 10 i_2 + 4 i_2 = 0 \implies 6 i_1 + 14 i_2 = 20 \;\xrightarrow{\div 2}\; 3 i_1 + 7 i_2 = 10 \quad \text{(式 1)}`,
            },
            {
              label: 'Step B',
              text: String.raw`**在共享支路处列内部 KCL 约束方程** · $I_s = 6\text{ A}$ 向上；顺时针 $i_2$ 在中间支路向上（同向），顺时针 $i_1$ 在中间支路向下（反向）：`,
              tex: String.raw`i_2 - i_1 = 6 \implies i_2 = i_1 + 6 \quad \text{(式 2)}`,
            },
            {
              label: 'Step C',
              text: '**将 (式 2) 代入 (式 1) 逐步化简求解**',
              tex: String.raw`3 i_1 + 7(i_1 + 6) = 10 \implies 3 i_1 + 7 i_1 + 42 = 10 \implies 10 i_1 = -32 \implies i_1 = -3.2\text{ A}`,
            },
            { label: 'Step C', text: String.raw`回代 $\text{(式 2)}$ 得：`, tex: String.raw`i_2 = -3.2 + 6 = 2.8\text{ A}` },
            {
              label: 'Step D',
              text: String.raw`**物理意义解读与全电路电位验算** · $i_1 = -3.2\text{ A}$ 为负，说明左侧 $20\text{ V}$ 电压源实际上正被右侧强大的 $6\text{ A}$ 电流源“倒灌充电”，真实电流沿 $R_1$ 从右向左流，大小为 $3.2\text{ A}$。`,
            },
            {
              label: 'Step D',
              text: String.raw`**[[node_a|顶部中节点电位 $V_a$]] 双路径验算**：从左侧路径：$V_a = 20 - 6(-3.2) = 20 + 19.2 = 39.2\text{ V}$；从右侧路径：$V_a = (10 + 4) \times 2.8 = 14 \times 2.8 = 39.2\text{ V}$。精确吻合！`,
            },
            {
              label: 'Step D',
              text: String.raw`**揭秘[[series_r|串联电阻 $R_s = 2\ \Omega$]] 的真正角色**：流过 $R_s$ 的向上电流锁定为 $6\text{ A}$，其压降为 $v_{R_s} = 2 \times 6 = 12\text{ V}$（下正上负），因此 $6\text{ A}$ 电流源自身的端电压高达 $V_{I_s} = V_a + 12 = 51.2\text{ V}$。无论把 $R_s$ 换成 $20\ \Omega$ 还是 $0\ \Omega$，$i_1 = -3.2\text{ A}$ 与 $i_2 = 2.8\text{ A}$ 纹丝不动！`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '苏格拉底式分步引导例题（Guided Derivation）——双电压源 + 向下共享电流源超网孔实战',
      sync: { layer: L2, halo: ['shared_is'], params: { l2_case: 'ex', l2_cut: false, l2_kcl: false, ex_reveal: 0, l3_prob: 'ex', l3_step: 0 } },
      blocks: [
        {
          kind: 'guided',
          // all steps answered: the stage uncovers the example's numbers
          done_params: { ex_reveal: 5 },
          title: '含向下共享电流源与串联电阻的超网孔实战',
          source: 'Sadiku 2026 Sec. 3.5 Supermesh Analysis',
          problem: String.raw`**经典 Sadiku 3.5 实战题**：如图所示双网孔电路中，左侧电压源 $V_1 = 30\text{ V}$（上正下负），右侧电压源 $V_2 = 6\text{ V}$（上正下负），外围电阻 $R_1 = 4\ \Omega$、$R_2 = 2\ \Omega$、$R_3 = 6\ \Omega$。中间共享支路包含一个**向下**的独立电流源 $I_s = 3\text{ A}$ 以及与之串联的电阻 $R_s = 5\ \Omega$。请分步求出：(1) 网孔电流 $i_1, i_2$；(2) 串联电阻 $R_s$ 消耗的功率 $P_{R_s}$ 及电流源两端的电压 $V_{I_s}$（上正下负）。`,
          problem_svg: wide(SVG_PROBLEM5),
          steps: [
            {
              title: '第 1 步（拓扑诊断）',
              mini_svg: lightSvg(MINI_STEP1),
              question: '观察中间共享支路，发现 3 A 独立电流源夹在 Mesh 1 与 Mesh 2 之间，且上方串联了 Rs = 5 Ω 电阻。为了列写第一个 KVL 方程，我们应该怎么做？',
              hint: String.raw`$\text{共享支路整条开路} \implies \text{大外环仅含 } V_1, R_1, R_2, R_3, V_2$`,
              options: [
                {
                  text: '将 3 A 电流源和串联的 Rs = 5 Ω 整条共享支路暂时开路，沿外围大环列写超网孔 KVL。',
                  correct: true,
                  feedback: '对！共享电流源连同与它串联的 Rs 整条切除，左右两个网孔合并成超网孔大外环，接下来沿它顺时针列 KVL。',
                },
                {
                  text: '只移除 3 A 电流源，但把 Rs = 5 Ω 留在超网孔大环方程里，写成 5(i₁ - i₂)。',
                  correct: false,
                  feedback: '慢着！Rs = 5 Ω 和 3 A 电流源是串联在中间那条支路上的。当你绕着大外环走一圈时，你根本没有踏进中间这条支路半步，所以 Rs 不会出现在超网孔大环 KVL 里！',
                },
                {
                  text: '直接令 i₁ = 3 A，然后只对 Mesh 2 列写普通 KVL。',
                  correct: false,
                  feedback:
                    '踩坑啦！只有当电流源位于‘外围边缘支路’（只属于一个网孔）时才能直接锁死单个网孔电流。这里的 3 A 源夹在 Mesh 1 和 Mesh 2 中间，是共享电流源，必须用超网孔！',
                },
              ],
              board: [String.raw`\text{Step 1: 构造超网孔（切除含 } I_s=3\text{ A 与 } R_s=5\ \Omega \text{ 的共享支路）}`],
              halo: ['shared_is', 'series_r'],
              params: { l2_case: 'ex', l2_cut: false, l2_kcl: false, ex_reveal: 0 },
            },
            {
              title: '第 2 步（列超网孔大外环 KVL）',
              mini_svg: lightSvg(MINI_STEP2),
              question: '从左下角出发，顺时针绕行大外环一周（依次经过 V1=30V, R1=4Ω, R2=2Ω, R3=6Ω, V2=6V）。以下哪个方程完全正确？',
              hint: String.raw`$-V_1 + R_1 i_1 + (R_2 + R_3) i_2 + V_2 = 0$`,
              options: [
                {
                  text: '-30 + 4i₁ + 2i₂ + 6i₂ + 6 = 0',
                  correct: true,
                  feedback: '正确！向上穿过 V₁ 是电位升高（−30），R₁ 在左半边走 i₁，R₂、R₃ 在右半边走 i₂，向下穿过 V₂ 是电位降低（+6）。',
                },
                {
                  text: '-30 + 4i₁ + 2i₁ + 6i₁ + 6 = 0',
                  correct: false,
                  feedback: '经典误区！合并成超网孔只是帮我们绕过电流源列 KVL，左右两半的真实电流依然分别是 i₁ 和 i₂——R2 与 R3 在右半边，流过它们的电流必须是 i₂！',
                },
                {
                  text: '-30 + 4i₁ + 2i₂ + 6i₂ - 6 = 0',
                  correct: false,
                  feedback: '盯紧右侧 V2 = 6 V 的极性！我们顺时针向下经过 V2 时，先碰到的是上面的‘+’号、从下面的‘-’号出去，这是电位下降（压降为 +6 V），而不是 -6 V！',
                },
              ],
              board: [String.raw`-30 + 4 i_1 + (2 + 6) i_2 + 6 = 0`, String.raw`\implies 4 i_1 + 8 i_2 = 24 \implies i_1 + 2 i_2 = 6 \quad (\text{式 1})`],
              halo: ['supermesh'],
              params: { l2_case: 'ex', l2_cut: true, l2_kcl: false, ex_reveal: 1 },
            },
            {
              title: '第 3 步（补内部 KCL 约束）',
              mini_svg: lightSvg(MINI_STEP3),
              question: '把共享支路放回原位。注意这里的 Is = 3 A 箭头朝下！结合顺时针设定的 i₁（在中间支路向下）与 i₂（在中间支路向上），正确的内部 KCL 约束方程是？',
              hint: String.raw`$\text{向下净电流} = i_1 - i_2 = I_s$`,
              options: [
                {
                  text: 'i₂ - i₁ = 3',
                  correct: false,
                  feedback:
                    '方向写反了！记住教授的秒判口诀：‘谁与电流源同向，谁在前面带正号’。本题 3 A 源箭头向下，顺时针的 i₁ 在中间也是向下（同向），i₂ 是向上（反向），所以必须是 i₁ - i₂ = 3！',
                },
                { text: 'i₁ - i₂ = 3', correct: true, feedback: '漂亮！3 A 源箭头向下，与中间支路上向下的 i₁ 同向，所以 i₁ 在前面带正号：i₁ − i₂ = 3。' },
                { text: 'i₁ + i₂ = 3', correct: false, feedback: 'i₁ 和 i₂ 在共享支路上一个向下、一个向上，是彼此抵消的关系，绝不会同向相加！' },
              ],
              board: [String.raw`i_1 - i_2 = 3 \implies i_1 = i_2 + 3 \quad (\text{式 2})`],
              halo: ['kcl_node_b'],
              params: { l2_case: 'ex', l2_cut: false, l2_kcl: true, ex_reveal: 2 },
            },
            {
              title: '第 4 步（联立求解）',
              mini_svg: lightSvg(MINI_STEP4),
              question: '将 (式 2) i₁ = i₂ + 3 代入化简后的 (式 1) i₁ + 2i₂ = 6，解出的网孔电流 (i₁, i₂) 是多少？',
              hint: String.raw`$(i_2 + 3) + 2 i_2 = 6 \implies 3 i_2 = 3 \implies i_2 = 1\text{ A}$`,
              options: [
                {
                  text: 'i₁ = 4 A, i₂ = 1 A',
                  correct: true,
                  feedback: '完全正确！i₂ = 1 A，i₁ = 4 A。再用顶节点验算：从左 Vₐ = 30 − 4×4 = 14 V，从右 Vₐ = 6 + 8×1 = 14 V，两路一致。',
                },
                { text: 'i₁ = 3 A, i₂ = 1.5 A', correct: false, feedback: '代回 (式 2) 验算一下：3 - 1.5 = 1.5 ≠ 3！把 (i₂ + 3) + 2i₂ = 6 仔细展开：3i₂ + 3 = 6，故 3i₂ = 3。' },
                { text: 'i₁ = 1 A, i₂ = 4 A', correct: false, feedback: '把 i₁ 和 i₂ 弄颠倒了！若 i₁ = 1, i₂ = 4，则 i₁ - i₂ = -3 A，与向下的 3 A 源相反。' },
              ],
              board: [String.raw`i_2 = 1\text{ A}, \quad i_1 = 1 + 3 = 4\text{ A}`, String.raw`(\text{验算顶节点 } V_a = 30 - 4\times 4 = 14\text{ V} = 6 + 8\times 1)`],
              halo: ['mesh_i1', 'mesh_i2'],
              params: { l2_case: 'ex', l2_cut: false, l2_kcl: false, ex_reveal: 3 },
            },
            {
              title: '第 5 步（深度追问）',
              mini_svg: lightSvg(MINI_STEP5),
              question: '虽然 Rs = 5 Ω 没有进入超网孔 KVL 方程，但它真实消耗的功率 P_Rs 以及 3 A 电流源两端的电压 V_Is（上正下负）分别是多少？',
              hint: String.raw`$P_{R_s} = I_s^2 R_s, \quad V_{I_s} = V_a - I_s R_s$`,
              options: [
                {
                  text: 'P_Rs = 0 W（因为没进超网孔方程），V_Is = 14 V',
                  correct: false,
                  feedback: '大忌！Rs 不进超网孔 KVL 是因为大环绕过了它，但 3 A 的真实电流正实打实地流过它，发热功率 P = I²R = 3²×5 = 45 W 一瓦都不会少！',
                },
                {
                  text: 'P_Rs = 45 W，V_Is = -1 V',
                  correct: true,
                  feedback: '满分通关！Rs 虽然不进超网孔方程，照样实打实耗电 3²×5 = 45 W；从 Vₐ = 14 V 往下经过 Rs 的 15 V 压降，电流源上端只剩 −1 V。',
                },
                {
                  text: 'P_Rs = 45 W，V_Is = +29 V',
                  correct: false,
                  feedback: '电位差方向搞反了！3 A 电流向下流过 Rs = 5 Ω，上端 Va = 14 V，经过 15 V 压降后，到达电流源上端的电位是 14 - 15 = -1 V！',
                },
              ],
              board: [String.raw`P_{R_s} = 3^2 \times 5 = 45\text{ W}`, String.raw`V_{I_s} = 14 - 3 \times 5 = -1\text{ V}`],
              halo: ['series_r', 'node_a'],
              params: { l2_case: 'ex', l2_cut: false, l2_kcl: false, ex_reveal: 4 },
            },
          ],
          conclusion: String.raw`通关！$i_1 = 4\text{ A}$，$i_2 = 1\text{ A}$；$P_{R_s} = 45\text{ W}$，$V_{I_s} = -1\text{ V}$（上正下负）。串联电阻 $R_s$ 不进任何网孔方程，却实实在在地耗电，并决定了电流源两端的电压。左侧舞台的“揭晓例题数值”可以对照全部结果。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '高区分度诊断测验',
      sync: { layer: L3, halo: ['mat_diag', 'mat_off'], params: { l3_prob: 'std', l3_num: false } },
      blocks: [{ kind: 'p', text: '四道诊断题，各瞄准一个高频错点：平面前提、共享支路电流、超网孔 KCL 方向、与共享电流源串联的电阻。先对照下面的决策图回顾一遍，再动手。' }],
      inline_svg: wide(SVG_ACT6),
      figure_caption: '网孔分析法解题决策图：平面前提 → 统一顺时针 → 按电流源位置分三种情况',
      quiz: [
        {
          id: 'w2l3_q1',
          question: '以下关于网孔分析法（Mesh Analysis）适用范围的判断，哪一项是完全正确的？',
          options: [
            {
              key: 'A',
              text: '只要电路里全都是线性电阻和独立电压源，无论导线如何交叉都能用网孔分析法。',
              correct: false,
              feedback: '“全是电阻和电压源”只说明了元件类型，网孔法卡的是拓扑：怎么重画都消不掉交叉的电路（如 K₃,₃）根本没有清晰的窗格可设网孔电流，元件再规整也没用。',
            },
            {
              key: 'B',
              text: '网孔分析法仅适用于平面电路；若电路拓扑无论如何重画都存在无法消除的非节点导线交叉，则不能用网孔法，应改用节点电压法。',
              correct: true,
            },
            {
              key: 'C',
              text: '只要电路图里画出了两条交叉的导线，它就一定是非平面电路，绝对不能用网孔分析法。',
              correct: false,
              feedback: '画出来有交叉 ≠ 非平面。平面电路的定义是“存在至少一种无交叉的画法”——很多电路只是这一次画交叉了，挪一挪元件就能消掉；只有怎么重画都消不掉的交叉才算非平面。',
            },
            {
              key: 'D',
              text: '网孔分析法只适用于两个网孔以下的电路，三网孔以上必须用超网孔。',
              correct: false,
              feedback: '网孔个数不是限制：三网孔、四网孔照样列 n 个 KVL（目测法直接写 n×n 矩阵）。超网孔只在电流源卡在两个网孔的共享支路上时才用，与网孔多少无关。',
            },
          ],
          feedback_correct:
            '平面电路的定义是‘存在至少一种无交叉的平面画法’。选项 C 的陷阱在于：有些平面电路只是暂时画交叉了，重画即可消除交叉；而真正无法消除交叉的非平面电路（如 K3,3）才无法定义网孔，必须改用节点电压法。',
          feedback_wrong: '回到第 1 幕：网孔法要先能把电路画成一块块“窗格”。',
          figure: lightSvg(SVG_Q1),
          sync: { layer: L1, halo: ['mesh_window'], params: { l1_view: 'mesh' } },
        },
        {
          id: 'w2l3_q2',
          question: '在一个双网孔电路中，统一顺时针设 Mesh 1（左）电流为 i₁ = 2 A，Mesh 2（右）电流为 i₂ = -3 A。则夹在两个网孔中间的共享电阻 R₂ 上，真实向下的支路电流是多少？',
          options: [
            {
              key: 'A',
              text: '-1 A（实际向上 1 A）',
              correct: false,
              feedback: '这是把两股网孔电流直接相加：2 + (−3) = −1。共享支路上两股顺时针网孔电流方向相反，向下的净电流要相减：I↓ = i₁ − i₂。',
            },
            {
              key: 'B',
              text: '1 A（实际向下 1 A）',
              correct: false,
              feedback: '1 A 是把 i₂ 当成了 +3 A 去相减（丢了负号）。i₂ = −3 A 的符号必须原样带进去：I↓ = 2 − (−3)。',
            },
            { key: 'C', text: '5 A（实际向下 5 A）', correct: true },
            {
              key: 'D',
              text: '-5 A（实际向上 5 A）',
              correct: false,
              feedback: '大小对了，方向反了：−5 A 是 i₂ − i₁，那是向上为正的写法。题目问向下的电流，应取 i₁ − i₂。',
            },
          ],
          feedback_correct:
            '共享电阻上向下的真实支路电流定义为 I_down = i₁ - i₂。代入符号：I_down = 2 - (-3) = 5 A！物理上，i₂ = -3 A 意味着右侧网孔电流其实是逆时针流动的，在中间支路也向下，因此与左侧向下的 2 A 同向叠加成 5 A。',
          feedback_wrong: '共享支路上向下的电流 = i₁ − i₂，负号要原样代入。',
          figure: lightSvg(SVG_Q2),
          sync: { layer: L1, halo: ['shared_r2'], params: { l1_view: 'mesh', l1_v1: 20, l1_v2: 5 } },
        },
        {
          id: 'w2l3_q3',
          question:
            '在双网孔电路中，Mesh 1 在左，Mesh 2 在右，均设为顺时针网孔电流 i₁, i₂。若两者之间的共享支路含有一个箭头向上的 4 A 独立电流源，则超网孔配套的内部 KCL 约束方程必须是？',
          options: [
            {
              key: 'A',
              text: 'i₁ - i₂ = 4',
              correct: false,
              feedback: '方向写反了：顺时针的 i₁ 在共享支路上是向下走的，与向上的 4 A 源反向，它应该带负号；与电流源同向的是 i₂。可以回到第 4 幕的节点 b 放大图再看一眼。',
            },
            { key: 'B', text: 'i₂ - i₁ = 4', correct: true },
            {
              key: 'C',
              text: 'i₁ + i₂ = 4',
              correct: false,
              feedback: 'i₁ 与 i₂ 在共享支路上一个向下、一个向上，彼此抵消，不会同向相加——内部 KCL 约束一定是两者之差。',
            },
            {
              key: 'D',
              text: 'i₁ = 4 且 i₂ = -4',
              correct: false,
              feedback: '这是把共享电流源当成了边缘电流源。只有只属于一个网孔的电流源才能直接锁死该网孔电流；共享电流源只给出 i₁、i₂ 的差值关系，另一个方程要靠超网孔大外环 KVL。',
            },
          ],
          feedback_correct:
            '牢记口诀‘谁与电流源同向，谁在前面带正号’：顺时针 i₂ 在中间共享支路是向上走的，与 4 A 电流源同向；顺时针 i₁ 在中间是向下走的，与电流源反向。因此必为 i₂ - i₁ = 4。',
          feedback_wrong: '看清 i₁、i₂ 在共享支路上各朝哪个方向，再和电流源的箭头比一比。',
          figure: lightSvg(SVG_Q3),
          sync: { layer: L2, halo: ['shared_is'], params: { l2_case: 'c2', l2_cut: false, l2_kcl: false } },
        },
        {
          id: 'w2l3_q4',
          question: '某超网孔的共享支路中，一个 5 A 电流源与一个 10 Ω 电阻串联。若将该 10 Ω 电阻悄悄换成 20 Ω，电路中会发生什么变化？',
          options: [
            {
              key: 'A',
              text: '超网孔大外环 KVL 方程改变，导致所有网孔电流重新分配。',
              correct: false,
              feedback: '超网孔大外环绕过了整条共享支路，这颗电阻根本不在大环 KVL 里；换阻值不会改动任何一个网孔方程。',
            },
            {
              key: 'B',
              text: '所有网孔电流 i₁, i₂ 保持完全不变，但该串联电阻消耗的功率翻倍，且 5 A 电流源两端的电压也会相应改变。',
              correct: true,
            },
            {
              key: 'C',
              text: '因为该电阻不进入超网孔方程，所以它不消耗任何功率，电流源端电压也不变。',
              correct: false,
              feedback: '不进方程 ≠ 不耗电。5 A 实打实地流过这颗电阻，功率按 I²R 计算；电阻变大，电流源还得抬高端电压才能把这 5 A 推过去。',
            },
            {
              key: 'D',
              text: '内部 KCL 约束方程右侧的 5 A 会因为电阻增大而减小。',
              correct: false,
              feedback: '理想电流源输出的就是 5 A，与串联电阻多大无关——KCL 约束右边的 Is 不变。电阻变大，变的是电流源两端的电压。',
            },
          ],
          feedback_correct:
            '与理想电流源串联的电阻被超网孔大环绕过，且无法改变电流源强制输出的 5 A 电流，因此所有网孔电流纹丝不动；但该电阻实实在在流过 5 A 电流，阻值翻倍会使功耗从 250 W 增至 500 W，同时迫使电流源输出更高的端电压来维持 5 A。',
          feedback_wrong: '分开想：这颗电阻在不在大外环 KVL 里？它上面有没有电流流过？',
          figure: lightSvg(SVG_Q4),
          sync: { layer: L2, halo: ['series_r'], params: { l2_case: 'c2', l2_cut: false, l2_kcl: false } },
        },
      ],
    },
  ],
};

export default W2_L3;
