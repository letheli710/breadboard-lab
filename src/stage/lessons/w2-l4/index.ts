// W2-L4 · 节点法 vs 网孔法选型策略与矩阵直写法 (lesson sheet: docs/lessons/W2-L4.md).
// The professor's text of the six acts is reproduced from the sheet as written; [[id|…]] only links
// a term to the stage (the words are unchanged). Changes from the sheet, all of form:
// - the sheet's sub-headings (1.1, 1.2 …) are bold lead lines; its display formulas sit in the
//   ② blue / ③ green cards (a lead-in sentence becomes the card title); its italic notes are
//   plain text (the page has no italics);
// - two notes addressed to the front-end are left out: "（前端请绑定至 `01 观察法矩阵直写对照台`）"
//   in act 1 and the "Claude 工程落地清单" (6.4, an implementation checklist), so act 6's title
//   drops "与 Claude 工程落地清单";
// - plain-text symbols in the JSON parts (I_o, Ri=v, [i1, i2, i3]^T, G_kj …) are set as TeX;
//   the R / v options of the guided example are written as matrices;
// - the guided steps show step diagrams that leave the answer open (svgs.ts); the sheet's own five
//   cards follow the example in the 通关复盘 board.
// Added (the sheet has none): titles of the five guided steps, the problem line, the 通关复盘 board
// (Cramer's rule for 图 6-1, worked out from the sheet's matrices and checked in model.test.ts), a
// feedback for every wrong quiz option (from the sheet's explanations) and the four quiz diagrams.

import { lazy } from 'react';
import type { StageLesson } from '../../types';
import {
  MINI_STEP1,
  MINI_STEP2,
  MINI_STEP3,
  MINI_STEP4,
  MINI_STEP5,
  SVG_ACT1,
  SVG_ACT2,
  SVG_ACT3,
  SVG_ACT4,
  SVG_ACT5,
  SVG_ACT6,
  SVG_Q1,
  SVG_Q2,
  SVG_Q3,
  SVG_Q4,
  SVG_REVIEW,
} from './svgs';

const MatrixLayer = lazy(() => import('./MatrixLayer'));
const CompareLayer = lazy(() => import('./CompareLayer'));
const DecisionLayer = lazy(() => import('./DecisionLayer'));

const L1 = 'layer-01-inspection';
const L2 = 'layer-02-compare';
const L3 = 'layer-03-decision';

const R = String.raw;

/** layer 01 set-up (every act sets all of it, so scrolling back restores the act's view) */
const l1 = (mode: 'nodal' | 'mesh', num: boolean, extra: Record<string, unknown> = {}) => ({ l1_mode: mode, l1_num: num, l1_dep: false, ...extra });

const W2_L4: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: MatrixLayer, [L2]: CompareLayer, [L3]: DecisionLayer },
  lesson_meta: {
    lesson_id: 'W2-L4',
    world: 'World 2',
    title: '节点法 vs 网孔法选型策略与矩阵直写法',
    subtitle: 'Nodal & Mesh Analyses by Inspection + Engineering Selection Decision Tree',
    lesson_type: 'B',
    lesson_type_label: 'Type B (纯公式/方法论课)',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release（Alexander, Sadiku & Fredette）',
      sections: ['Section 3.6: Nodal and Mesh Analyses by Inspection', 'Section 3.7: Nodal Versus Mesh Analysis'],
    },
    prerequisites: ['W2-L1 节点分析法 (Nodal Analysis)', 'W2-L2 超节点 (Supernode)', 'W2-L3 网孔与超网孔 (Mesh & Supermesh)'],
    next_lesson: 'W2-L5',
    next_lesson_title: '线性性质与叠加定理',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 观察法矩阵直写对照台 (Gv=i / Ri=v)',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '悬停（或轻点）任一矩阵元素：自电导 / 自电阻点亮节点或网孔上的全部支路，互电导 / 互电阻同时点亮对称格与共享支路；“注入 1 个受控源”看对称性怎样失效。',
      },
      {
        id: L2,
        label: '02 同电路双解法方程数实时对比台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '同一张 3 节点 6 支路电路：节点视角只有 2 个未知节点和 2×2 矩阵，网孔视角是 4 个顺时针网孔、1 个超网孔和 4 条方程。',
      },
      {
        id: L3,
        label: '03 选型决策树与非平面电路识别',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '逐级点亮四步选型漏斗；拖动 K₃,₃ 的节点或按“尝试平面重绘”，实时数交叉点——惠斯通电桥能消到 0，K₃,₃ 永远至少剩 1 个。',
      },
    ],
    hover_map: {
      gv_g11: { label: '自电导 G₁₁', desc: '直接连在节点 1 上的全部电导之和：G₁ + G₁₂ + G₁₃（恒为正）' },
      gv_g22: { label: '自电导 G₂₂', desc: '直接连在节点 2 上的全部电导之和：G₂ + G₁₂ + G₂₃' },
      gv_g33: { label: '自电导 G₃₃', desc: '直接连在节点 3 上的全部电导之和：G₃ + G₁₃ + G₂₃' },
      gv_g12: { label: '互电导 G₁₂ = G₂₁', desc: '节点 1 与 2 之间的共享电导，取负；对称格 (2,1) 同值' },
      gv_g13: { label: '互电导 G₁₃ = G₃₁', desc: '节点 1 与 3 之间的共享电导（顶部跨接支路），取负' },
      gv_g23: { label: '互电导 G₂₃ = G₃₂', desc: '节点 2 与 3 之间的共享电导，取负' },
      gv_diag: { label: '主对角线（自电导）', desc: 'G_kk：每个节点上全部电导之和，恒 > 0' },
      gv_offdiag: { label: '非对角线（负互电导）', desc: 'G_kj = G_jk：两节点间共享电导之和的相反数，≤ 0，关于主对角线镜像对称' },
      gv_rhs: { label: '激励电流向量 i', desc: '流入节点 k 的独立电流源代数和（流入为正、流出为负）' },
      gv_ref: { label: '参考节点 0 (GND)', desc: '电位规定为 0，不列方程：n = N − 1 个未知节点' },
      gv_dep: { label: '受控源（对称性破坏者）', desc: '控制量 v₃ 只进第 1 行：G₁₃ ≠ G₃₁，观察法禁用' },
      ri_r11: { label: '自电阻 R₁₁', desc: '网孔 1 回路上的全部电阻之和：R₁ + R₁₂ + R₁₃（恒为正）' },
      ri_r22: { label: '自电阻 R₂₂', desc: '网孔 2 回路上的全部电阻之和：R₂ + R₁₂ + R₂₃' },
      ri_r33: { label: '自电阻 R₃₃', desc: '网孔 3 回路上的全部电阻之和：R₃ + R₁₃ + R₂₃' },
      ri_r12: { label: '互电阻 R₁₂ = R₂₁', desc: '网孔 1 与 2 的公共电阻（中心竖支路），统一顺时针时取负' },
      ri_r13: { label: '互电阻 R₁₃ = R₃₁', desc: '网孔 1 与 3 的公共电阻，取负' },
      ri_r23: { label: '互电阻 R₂₃ = R₃₂', desc: '网孔 2 与 3 的公共电阻，取负' },
      ri_diag: { label: '主对角线（自电阻）', desc: 'R_kk：网孔 k 周界上的全部电阻之和，恒 > 0' },
      ri_offdiag: { label: '非对角线（负互电阻）', desc: 'R_kj = R_jk：公共支路电阻之和的相反数；前提是所有网孔电流统一顺时针' },
      ri_rhs: { label: '激励电压向量 v', desc: '沿网孔 k 顺时针：由 − 到 + 记 +Vs，由 + 到 − 记 −Vs' },
      ri_cw: { label: '顺时针网孔电流 i₁, i₂, i₃', desc: '强制约定全部取顺时针（CW）：公共支路上相邻网孔电流必然反向' },
      ri_dep: { label: '受控源（对称性破坏者）', desc: '控制量 i₃ 只进第 1 行：R₁₃ ≠ R₃₁，观察法禁用' },
      ex_io: { label: '中心 4 Ω 支路电流 Iₒ', desc: '例题 6-1 的待求量：向下为正' },
      cmp_nodes: { label: '2 个未知节点 v₁、v₂', desc: '节点视角：N − 1 = 2 个方程，观察法直写 2×2 矩阵' },
      cmp_meshes: { label: '4 个顺时针网孔', desc: '网孔视角：M = B − N + 1 = 6 − 3 + 1 = 4 个未知网孔电流' },
      cmp_super: { label: '超网孔 1-2', desc: '4 A 电流源夹在网孔 1 与 2 之间：只能绕开它列大回路 KVL' },
      cmp_is1: { label: '4 A 电流源（网孔 1、2 公共支路）', desc: '电流源在公共支路上 → 超网孔约束 i₂ − i₁ = 4' },
      cmp_count: { label: '方程计数徽章', desc: '节点法 N − 1 = 2 个方程 vs 网孔法 4 个未知量 + 1 个超网孔' },
      dt_s1: { label: '① 平面性检查', desc: '存在无法消除的交叉 → 强制节点法（网孔法彻底失效）' },
      dt_s2: { label: '② 比较方程数', desc: '节点数 (N − 1) vs 网孔数 M：谁方程少选谁' },
      dt_s3: { label: '③ 主导电源类型', desc: '电流源多 → 节点法；电压源多 → 网孔法（能否触发观察法直写）' },
      dt_s4: { label: '④ 目标量与器件', desc: '求节点电压 / 运放、晶体管 → 节点法；求支路电流 / 串联回路功率 → 网孔法' },
      k33_graph: { label: 'K₃,₃ 交叉桥', desc: '顶部 A、B、C 与底部 D、E、F 两两全连通：9 条支路' },
      k33_cross: { label: '不可消除的交叉点', desc: '拖动节点、重绘都消不掉：K₃,₃ 至少保留 1 个交叉 → 非平面' },
      bridge_graph: { label: '惠斯通电桥（假交叉）', desc: '把一条对角线拉到外侧就没交叉了：平面电路' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '从笨重列式到 10 秒直写——电导矩阵 Gv = i 的公理溯源与硬边界',
      sync: { layer: L1, halo: ['gv_g11', 'gv_g12'], params: l1('nodal', false) },
      blocks: [
        { kind: 'p', text: "**教授开场白（Professor's Opening）**" },
        {
          kind: 'p',
          text: '欢迎回到 Breadboard Lab！前三节课里，你已经把节点分析法、超节点、网孔分析法和超网孔这四把“重武器”全部练熟了。但在真实的工程现场——或者在 90 分钟的期末考场上——高手和新手的分水岭，往往不在“会不会列 KCL/KVL”，而在两件决定生死的效率大事：',
        },
        {
          kind: 'ol',
          items: [
            '**第一件：选型（Strategy）**——拿到一张陌生电路图，3 秒内判断该用节点法还是网孔法。选对了，2 个方程半分钟收工；选错了，4 个方程加超网孔算到怀疑人生。',
            R`**第二件：直写（Inspection）**——在满足条件的电路里，彻底跳过“先写零散 KCL/KVL、再移项合并同类项”的繁琐草稿，像扫描仪一样 10 秒直接把标准矩阵方程 $\mathbf{G}\mathbf{v} = \mathbf{i}$ 或 $\mathbf{R}\mathbf{i} = \mathbf{v}$ 拍在纸上。`,
          ],
        },
        {
          kind: 'p',
          text: '今天这节课，我们不讲任何花架子，直接把 Sadiku 教材第 3.6 节和第 3.7 节的精髓揉碎了讲透。准备好了吗？让我们把左侧交互舞台切到 **01 号图层**，从矩阵的“骨骼结构”看起！',
        },
        { kind: 'p', text: '**1.1 场景导入与左侧舞台联动**' },
        {
          kind: 'p',
          text: R`在 W2-L1 中，每遇到一个 3 节点电路，你都要老老实实地在节点 1、2、3 分别写三行分数形式的 KCL 方程，然后再通分、去括号、按 $v_1, v_2, v_3$ 整理系数。你有没有发现一个惊人的规律？**只要电路里只有电阻和独立电流源，最后整理出来的系数矩阵永远是对称的，而且每一个格子里的数字，其实早就明晃晃地写在电路图上了！**`,
        },
        { kind: 'p', text: R`下面这张 2D 原理图展示了 3 节点纯独立电流源电路的支路电导与 $\mathbf{G}$ 矩阵元素的精确映射关系：` },
        { kind: 'figure', svg: SVG_ACT1, caption: '图 1-1：电导矩阵 Gv = i 与电路支路的直写映射关系（纯独立电流源电路）' },
        { kind: 'p', text: R`**1.2 三段式教授板书推导：电导矩阵 $\mathbf{G}\mathbf{v} = \mathbf{i}$**` },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: R`很多同学把观察法当成“背口诀”，这是电路学的大忌！观察法根本不是凭空发明的捷径，而是 **KCL 与欧姆定律经过代数标准化整理后的必然拓扑结构**。考虑一个仅由线性电阻（电导 $G = 1/R$）和**独立电流源**组成的 $N$ 节点电路（含 1 个参考节点 $0$，剩余 $n = N-1$ 个非参考节点）。对任意节点 $k$ 列写 KCL（规定“流出节点的电阻电流之和 = 流入节点的独立电流源代数和”）：`,
        },
        {
          kind: 'ul',
          items: [
            R`节点 $k$ 经由[[gv_ref|接地电导]] $G_{k0}$ 流出电流：$G_{k0} v_k$`,
            R`节点 $k$ 经由与邻接节点 $j$ 之间的[[gv_offdiag|互电导]] $G_{kj}^{\text{branch}}$ 流出电流：$G_{kj}^{\text{branch}} (v_k - v_j)$`,
          ],
        },
        {
          kind: 'p',
          text: R`把所有含 $v_k$ 的项合并在一起，它的系数必然是**[[gv_diag|直接连在节点 $k$ 上的所有电导之和]]**（永远为正）；而每个其他节点电压 $v_j$ ($j \neq k$) 前面的系数，必然是**[[gv_offdiag|连接节点 $k$ 与节点 $j$ 的电导之和的相反数]]**（永远为负或零）。因为电阻是双向无源元件（节点 $k$ 到 $j$ 的支路与节点 $j$ 到 $k$ 是同一条支路），所以必然满足**互易对称性**：$G_{kj} = G_{jk}$。`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: '**教授红线警告（绝对禁区）**：一旦电路中含有**[[gv_dep|受控源（Dependent Sources）]]**，控制变量（如某个支路电流或另一对节点的电压差）会以**单向耦合**的形式强行注入某一行的 KCL 方程，破坏双向互易性，导致 $G_{kj} \\neq G_{jk}$。因此：**观察法矩阵直写严格仅适用于“不含受控源”的电路！**遇到受控源，立刻老老实实退回 W2-L1/L2 的标准 KCL 列式法！',
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（General Formula）：对于含 $n = N - 1$ 个非参考节点、且**仅含线性电阻与独立电流源**的电路，节点电压方程的矩阵直写通式为：`,
          tex: R`\mathbf{G}\mathbf{v} = \mathbf{i}`,
        },
        {
          kind: 'formula',
          title: R`展开为 $n \times n$ 线性方程组：`,
          tex: R`\begin{bmatrix} G_{11} & G_{12} & \cdots & G_{1n} \\ G_{21} & G_{22} & \cdots & G_{2n} \\ \vdots & \vdots & \ddots & \vdots \\ G_{n1} & G_{n2} & \cdots & G_{nn} \end{bmatrix} \begin{bmatrix} v_1 \\ v_2 \\ \vdots \\ v_n \end{bmatrix} = \begin{bmatrix} i_1 \\ i_2 \\ \vdots \\ i_n \end{bmatrix}`,
        },
        { kind: 'p', text: '其中每个矩阵与向量元素的严格定义如下：' },
        { kind: 'formula', title: '**[[gv_diag|主对角线元素（自电导，Self-Conductance）]]**：', tex: R`G_{kk} = \sum (\text{直接连接在节点 } k \text{ 上的所有电导之和}) > 0` },
        {
          kind: 'formula',
          title: '**[[gv_offdiag|非对角线元素（负互电导，Negative Mutual Conductance）]]**：',
          tex: R`G_{kj} = G_{jk} = -\sum (\text{直接连接在节点 } k \text{ 与节点 } j \text{ 之间的所有电导之和}) \le 0 \quad (k \neq j)`,
        },
        { kind: 'formula', title: '**未知节点电压列向量**：', tex: R`\mathbf{v} = \begin{bmatrix} v_1 & v_2 & \cdots & v_n \end{bmatrix}^T` },
        {
          kind: 'formula',
          title: '**[[gv_rhs|激励电流列向量]]**：',
          tex: R`i_k = \sum (\text{流入节点 } k \text{ 的独立电流源}) - \sum (\text{流出节点 } k \text{ 的独立电流源})`,
        },
        { kind: 'p', text: R`（注：数值代入与 $3\times 3$ 完整求解演示将在第 3 幕集中展开，严格做到符号推导与数值运算彻底分离。）` },
      ],
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '对偶之美——网孔法的电阻矩阵直写 Ri = v',
      sync: { layer: L1, halo: ['ri_cw', 'ri_offdiag'], params: l1('mesh', false) },
      blocks: [
        { kind: 'p', text: '**2.1 场景导入与左侧舞台联动**' },
        {
          kind: 'p',
          text: '电路学最迷人的地方在于**对偶性（Duality）**。只要把第 1 幕里的“节点 → 网孔”、“电导 $G$ → 电阻 $R$”、“电流源 $i$ → 电压源 $v$”、“KCL → KVL”全部镜像替换，你就瞬间拿到了网孔分析法的矩阵直写公式！',
        },
        { kind: 'p', text: '请把左侧舞台 `01 观察法矩阵直写对照台` 切换至 `mesh_Ri_v` 模式，观察电阻矩阵元素与网孔支路的精准连线：' },
        { kind: 'figure', svg: SVG_ACT2, caption: '图 2-1：电阻矩阵 Ri = v 与平面网孔支路的直写映射关系（纯独立电压源电路）' },
        { kind: 'p', text: R`**2.2 三段式教授板书推导：电阻矩阵 $\mathbf{R}\mathbf{i} = \mathbf{v}$**` },
        {
          kind: 'origin',
          title: '① 公理溯源（Origin）',
          text: R`考虑一个**平面电路（Planar Circuit）**，仅由线性电阻和**独立电压源**组成，共有 $m$ 个网孔。**强制约定所有网孔电流 $i_1, i_2, \dots, i_m$ 均取[[ri_cw|顺时针方向（Clockwise, CW）]]**。对网孔 $k$ 沿顺时针方向列写 KVL（规定“网孔内所有电阻压降之和 = 网孔内独立电压源的顺时针升压代数和”）：`,
        },
        {
          kind: 'ul',
          items: [
            R`网孔 $k$ 的独有电阻 $R_{k,\text{own}}$ 产生压降：$R_{k,\text{own}} i_k$`,
            R`网孔 $k$ 与相邻网孔 $j$ [[ri_offdiag|共享的电阻]] $R_{kj}^{\text{shared}}$ 上，由于 $i_k$ 和 $i_j$ 均取顺时针方向，两者在公共支路上**必然反向**，产生压降：$R_{kj}^{\text{shared}}(i_k - i_j)$`,
          ],
        },
        {
          kind: 'p',
          text: R`将 $i_k$ 合并，系数恰好是网孔 $k$ 回路周界上所有电阻之和（[[ri_diag|自电阻]]，恒正）；相邻网孔电流 $i_j$ 的系数恰好是公共电阻的相反数（[[ri_offdiag|负互电阻]]，恒为负或零）。同样由于线性电阻的双向互易性，电阻矩阵严格对称：$R_{kj} = R_{jk}$。`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: '**两条硬性适用边界**：1. 必须是**平面电路**（非平面电路不存在良定义的网孔，连网孔法都失效）；2. **仅含独立电压源，严禁含[[ri_dep|受控源]]**（含受控源则矩阵失对称；含电流源则会破坏纯网孔结构，需退回超网孔法）。',
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（General Formula）：对于含 $m$ 个网孔、仅含线性电阻与独立电压源的平面电路（网孔电流统一取顺时针方向），网孔电流方程的矩阵直写通式为：`,
          tex: R`\mathbf{R}\mathbf{i} = \mathbf{v}`,
        },
        {
          kind: 'formula',
          title: R`展开为 $m \times m$ 线性方程组：`,
          tex: R`\begin{bmatrix} R_{11} & R_{12} & \cdots & R_{1m} \\ R_{21} & R_{22} & \cdots & R_{2m} \\ \vdots & \vdots & \ddots & \vdots \\ R_{m1} & R_{m2} & \cdots & R_{mm} \end{bmatrix} \begin{bmatrix} i_1 \\ i_2 \\ \vdots \\ i_m \end{bmatrix} = \begin{bmatrix} v_1 \\ v_2 \\ \vdots \\ v_m \end{bmatrix}`,
        },
        { kind: 'p', text: '各元素严格定义如下：' },
        { kind: 'formula', title: '**[[ri_diag|主对角线元素（自电阻，Self-Resistance）]]**：', tex: R`R_{kk} = \sum (\text{网孔 } k \text{ 回路上的所有电阻之和}) > 0` },
        {
          kind: 'formula',
          title: '**[[ri_offdiag|非对角线元素（负互电阻，Negative Mutual Resistance）]]**：',
          tex: R`R_{kj} = R_{jk} = -\sum (\text{网孔 } k \text{ 与网孔 } j \text{ 公共支路上的所有电阻之和}) \le 0 \quad (k \neq j)`,
        },
        { kind: 'formula', title: '**[[ri_cw|未知网孔电流列向量（统一顺时针）]]**：', tex: R`\mathbf{i} = \begin{bmatrix} i_1 & i_2 & \cdots & i_m \end{bmatrix}^T` },
        {
          kind: 'formula',
          title: '**[[ri_rhs|激励电压列向量]]**：',
          tex: R`v_k = \sum (\text{沿网孔 } k \text{ 顺时针方向从 } - \text{ 到 } + \text{ 的独立电压源}) - \sum (\text{从 } + \text{ 到 } - \text{ 的独立电压源})`,
        },
        {
          kind: 'table',
          caption: '**2.3 观察法双矩阵完全对偶速查表**',
          head: ['对比维度', '节点观察法（Nodal by Inspection）', '网孔观察法（Mesh by Inspection）'],
          rows: [
            ['**标准矩阵方程**', R`$\mathbf{G}\mathbf{v} = \mathbf{i}$`, R`$\mathbf{R}\mathbf{i} = \mathbf{v}$`],
            ['**适用电路限制**', '仅含电阻与**独立电流源**（可非平面，**严禁受控源**）', '仅含电阻与**独立电压源**（**必须平面**，**严禁受控源**）'],
            ['**方向/参考约定**', '选定 1 个参考节点 $0$（GND）', '所有网孔电流**统一取顺时针（CW）**'],
            ['**主对角线元素**', '$G_{kk} =$ 汇入节点 $k$ 的所有电导之和（$>0$）', '$R_{kk} =$ 网孔 $k$ 回路上的所有电阻之和（$>0$）'],
            ['**非对角线元素**', '$G_{kj} = G_{jk} = -$ 节点 $k,j$ 间的互电导之和（$\\le 0$）', '$R_{kj} = R_{jk} = -$ 网孔 $k,j$ 间的公共电阻之和（$\\le 0$）'],
            ['**右端激励向量**', '$i_k =$ 流入节点 $k$ 的独立电流源代数和', '$v_k =$ 沿网孔 $k$ 顺时针方向电压源升压代数和'],
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '10 秒直写实战——3×3 矩阵求解、克莱默法则与矩阵求逆直觉',
      sync: { layer: L1, halo: ['gv_rhs'], params: l1('nodal', true) },
      blocks: [
        { kind: 'p', text: '**3.1 实战电路原理图**' },
        {
          kind: 'p',
          text: R`光说不练假把式。现在看下面这道典型的 3 节点 6 电阻纯独立电流源电路。我们要用**观察法在 10 秒内直接写出 $3\times 3$ 电导矩阵 $\mathbf{G}\mathbf{v} = \mathbf{i}$**，并一步步严格核算行列式与最终节点电压。`,
        },
        { kind: 'figure', svg: SVG_ACT3, caption: '图 3-1：3×3 节点观察法实战例题（已知所有电阻与独立电流源，求 v₁, v₂, v₃）' },
        { kind: 'p', text: '**3.2 三段式教授板书推导：③ 代入数值 · 逐步化简（Step-by-Step Calculation）**' },
        {
          kind: 'calc',
          title: '第一步：10 秒观察法直写矩阵',
          steps: [
            { label: '适用条件', text: R`确认电路中**只有线性电阻与独立电流源，不含任何受控源**，完全满足观察法适用条件。将所有电阻心算为电导（$G = 1/R$）：` },
            { label: '[[gv_g11|节点 1 自电导]]', tex: R`G_{11} = \frac{1}{2} + \frac{1}{1} + \frac{1}{2} = 0.5 + 1 + 0.5 = 2\text{ S}` },
            { label: '[[gv_g22|节点 2 自电导]]', tex: R`G_{22} = \frac{1}{1} + \frac{1}{1} + \frac{1}{1} = 1 + 1 + 1 = 3\text{ S}` },
            { label: '[[gv_g33|节点 3 自电导]]', tex: R`G_{33} = \frac{1}{1} + \frac{1}{2} + \frac{1}{2} = 1 + 0.5 + 0.5 = 2\text{ S}` },
            {
              label: '[[gv_offdiag|互电导（全部取负）]]',
              tex: R`G_{12} = G_{21} = -\frac{1}{1} = -1\text{ S}, \quad G_{13} = G_{31} = -\frac{1}{2} = -0.5\text{ S}, \quad G_{23} = G_{32} = -\frac{1}{1} = -1\text{ S}`,
            },
            {
              label: '[[gv_rhs|右端流入电流列向量]]',
              text: R`注意节点 3 的 $3\text{ A}$ 电流源箭头**向下流出节点 3**，故记为 $-3\text{ A}$：`,
              tex: R`i_1 = +12\text{ A}, \quad i_2 = +4\text{ A}, \quad i_3 = -3\text{ A}`,
            },
            {
              label: '直接写出完整 3×3 矩阵方程',
              tex: R`\begin{bmatrix} 2 & -1 & -0.5 \\ -1 & 3 & -1 \\ -0.5 & -1 & 2 \end{bmatrix} \begin{bmatrix} v_1 \\ v_2 \\ v_3 \end{bmatrix} = \begin{bmatrix} 12 \\ 4 \\ -3 \end{bmatrix}`,
            },
            { label: '核验', text: R`（核验对称性：$\mathbf{G} = \mathbf{G}^T$，主对角线全为正且严格占优，无错漏！）` },
          ],
        },
        {
          kind: 'calc',
          title: "第二步：克莱默法则（Cramer's Rule）逐步求解",
          steps: [
            {
              label: R`1. 计算系数矩阵主行列式 $\Delta = \det(\mathbf{G})$（按第 1 行展开）`,
              tex: R`\begin{aligned} \Delta &= 2 \begin{vmatrix} 3 & -1 \\ -1 & 2 \end{vmatrix} - (-1) \begin{vmatrix} -1 & -1 \\ -0.5 & 2 \end{vmatrix} + (-0.5) \begin{vmatrix} -1 & 3 \\ -0.5 & -1 \end{vmatrix} \\ &= 2\big(3\times 2 - (-1)(-1)\big) + 1\big((-1)(2) - (-1)(-0.5)\big) - 0.5\big((-1)(-1) - 3(-0.5)\big) \\ &= 2(6 - 1) + 1(-2 - 0.5) - 0.5(1 + 1.5) \\ &= 10 - 2.5 - 1.25 = 6.25 = \frac{25}{4} \end{aligned}`,
            },
            {
              label: R`2. 计算 $\Delta_1$（将第 1 列替换为激励向量 $\mathbf{i}$）`,
              tex: R`\begin{aligned} \Delta_1 &= \begin{vmatrix} 12 & -1 & -0.5 \\ 4 & 3 & -1 \\ -3 & -1 & 2 \end{vmatrix} \\ &= 12(6 - 1) + 1(8 - 3) - 0.5(-4 + 9) \\ &= 60 + 5 - 2.5 = 62.5 = \frac{125}{2} \end{aligned}`,
            },
            {
              label: R`3. 计算 $\Delta_2$（将第 2 列替换为激励向量 $\mathbf{i}$）`,
              tex: R`\begin{aligned} \Delta_2 &= \begin{vmatrix} 2 & 12 & -0.5 \\ -1 & 4 & -1 \\ -0.5 & -3 & 2 \end{vmatrix} \\ &= 2(8 - 3) - 12(-2 - 0.5) - 0.5(3 + 2) \\ &= 10 + 30 - 2.5 = 37.5 = \frac{75}{2} \end{aligned}`,
            },
            {
              label: R`4. 计算 $\Delta_3$（将第 3 列替换为激励向量 $\mathbf{i}$）`,
              tex: R`\begin{aligned} \Delta_3 &= \begin{vmatrix} 2 & -1 & 12 \\ -1 & 3 & 4 \\ -0.5 & -1 & -3 \end{vmatrix} \\ &= 2(-9 + 4) + 1(3 + 2) + 12(1 + 1.5) \\ &= -10 + 5 + 30 = 25 \end{aligned}`,
            },
            {
              label: '5. 得出最终节点电压',
              tex: R`v_1 = \frac{\Delta_1}{\Delta} = \frac{62.5}{6.25} = 10\text{ V}, \qquad v_2 = \frac{\Delta_2}{\Delta} = \frac{37.5}{6.25} = 6\text{ V}, \qquad v_3 = \frac{\Delta_3}{\Delta} = \frac{25}{6.25} = 4\text{ V}`,
            },
          ],
        },
        {
          kind: 'calc',
          title: '第三步：KCL 回代终极验算',
          steps: [
            { label: '节点 1 流出电阻电流', tex: R`\frac{10}{2} + \frac{10-6}{1} + \frac{10-4}{2} = 5 + 4 + 3 = 12\text{ A} = i_1 \quad (\text{吻合！})` },
            { label: '节点 2 流出电阻电流', tex: R`\frac{6-10}{1} + \frac{6}{1} + \frac{6-4}{1} = -4 + 6 + 2 = 4\text{ A} = i_2 \quad (\text{吻合！})` },
            { label: '节点 3 流出电阻电流', tex: R`\frac{4-10}{2} + \frac{4-6}{1} + \frac{4}{2} = -3 - 2 + 2 = -3\text{ A} = i_3 \quad (\text{吻合！})` },
          ],
        },
        { kind: 'p', text: R`**3.3 教授点拨：矩阵求逆的物理直觉 ($\mathbf{v} = \mathbf{G}^{-1}\mathbf{i}$)**` },
        {
          kind: 'formula',
          title: '在计算机仿真软件（如 SPICE、MATLAB）中，机器从来不用手算克莱默法则，而是直接对矩阵求逆（或 LU 分解）：',
          tex: R`\mathbf{v} = \mathbf{G}^{-1}\mathbf{i} = \mathbf{Z}_{\text{node}}\mathbf{i}, \qquad \mathbf{i} = \mathbf{R}^{-1}\mathbf{v} = \mathbf{Y}_{\text{mesh}}\mathbf{v}`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**记住这个直觉**：$\mathbf{G}$ 和 $\mathbf{R}$ 只由电路的**无源电阻拓扑**决定，和外接电源毫无关系！一旦你算出了 $\mathbf{G}^{-1}$，以后客户无论怎么改动外部电流源 $\mathbf{i}$，都只需要做一次简单的矩阵乘法就能瞬间算出新的电压响应——这就是现代电路仿真器能在一秒内扫频上万次的底层秘密。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '效率碾压实验——同一电路的“节点法 2 方程 vs 网孔法 4 方程”',
      sync: { layer: L2, halo: ['cmp_count'], params: { l2_view: 'split', l2_super: true } },
      blocks: [
        { kind: 'p', text: '**4.1 同一电路双视角对比图（左侧舞台 `02 号图层`）**' },
        {
          kind: 'p',
          text: '很多同学做题时习惯“只会一招走天下”，拿到任何电路都无脑列网孔方程。下面我们拿一张完全相同的 3 节点 6 支路电路做一场**公开处刑式的效率对比实验**：左边叠加[[cmp_nodes|节点视角]]，右边叠加[[cmp_meshes|网孔视角]]，看看选型失误会让你多花多少倍的算力！',
        },
        { kind: 'figure', svg: SVG_ACT4, caption: '图 4-1：同一电路双视角对比——节点法（2 方程秒杀）vs 网孔法（4 方程 + 超网孔）' },
        { kind: 'p', text: '**4.2 同电路双解法严格数值对照**' },
        { kind: 'p', text: '**题目**：求图 4-1 所示电路的节点电压 $v_1$ 与 $v_2$。' },
        {
          kind: 'calc',
          title: '方案 A：节点分析法（观察法直写，仅 2 个方程）',
          steps: [
            { label: '[[cmp_nodes|2 个非参考节点]]', text: R`电路只有 2 个非参考节点（$v_1, v_2$），且全为独立电流源，直接套用 $\mathbf{G}\mathbf{v} = \mathbf{i}$：` },
            {
              label: '自电导与互电导',
              tex: R`G_{11} = \frac{1}{4} + \frac{1}{2} = \frac{3}{4}\text{ S}, \quad G_{22} = \frac{1}{2} + \frac{1}{6} = \frac{2}{3}\text{ S}, \quad G_{12} = G_{21} = -\frac{1}{2}\text{ S}`,
            },
            {
              label: '激励',
              text: R`$i_1 = 4 + 2 = 6\text{ A}$（$4\text{ A}$ 与 $2\text{ A}$ 均流入节点 1）；$i_2 = 4 - 2 = 2\text{ A}$（$4\text{ A}$ 流入节点 2，$2\text{ A}$ 流出节点 2）`,
            },
            {
              label: '矩阵方程',
              tex: R`\begin{bmatrix} \dfrac{3}{4} & -\dfrac{1}{2} \\[8pt] -\dfrac{1}{2} & \dfrac{2}{3} \end{bmatrix} \begin{bmatrix} v_1 \\ v_2 \end{bmatrix} = \begin{bmatrix} 6 \\ 2 \end{bmatrix}`,
            },
            { label: '行列式计算（2 步出答案）', tex: R`\Delta = \frac{3}{4}\cdot\frac{2}{3} - \left(-\frac{1}{2}\right)^2 = \frac{1}{2} - \frac{1}{4} = \frac{1}{4}` },
            { label: R`$\Delta_1$`, tex: R`\Delta_1 = 6\cdot\frac{2}{3} - 2\cdot\left(-\frac{1}{2}\right) = 4 + 1 = 5 \implies v_1 = \frac{5}{1/4} = 20\text{ V}` },
            {
              label: R`$\Delta_2$`,
              tex: R`\Delta_2 = \frac{3}{4}\cdot 2 - \left(-\frac{1}{2}\right)\cdot 6 = \frac{3}{2} + 3 = \frac{9}{2} \implies v_2 = \frac{9/2}{1/4} = 18\text{ V}`,
            },
          ],
        },
        {
          kind: 'calc',
          title: '方案 B：网孔分析法（强行求解，4 个未知量 + 1 个超网孔）',
          steps: [
            {
              label: '[[cmp_meshes|4 个顺时针网孔]]',
              text: R`必须定义 4 个顺时针网孔电流 $i_1, i_2, i_3, i_4$，且因 [[cmp_is1|$4\text{ A}$ 电流源]]夹在网孔 1 与网孔 2 之间，**不能用观察法**，必须引入**[[cmp_super|超网孔 1-2]]**：`,
            },
            { label: '1. 超网孔 1-2 约束方程（KCL）', tex: R`i_2 - i_1 = 4` },
            { label: '2. 网孔 3 外围电流源约束', tex: R`i_3 = -2\text{ A}\quad (2\text{ A 逆时针})` },
            { label: '3. 网孔 4 外围电流源约束', tex: R`i_4 = -4\text{ A}\quad (4\text{ A 逆时针})` },
            { label: '4. 超网孔 1-2 大回路 KVL', tex: R`4i_1 + 2(i_2 - i_3) + 6(i_2 - i_4) = 0` },
            {
              label: '代入',
              text: R`将方程 (2)(3) 及 $i_1 = i_2 - 4$ 代入方程 (4)：`,
              tex: R`4(i_2 - 4) + 2(i_2 + 2) + 6(i_2 + 4) = 0 \implies 12i_2 + 12 = 0 \implies i_2 = -1\text{ A}`,
            },
            { label: '回代', text: R`由此回代得 $i_1 = -5\text{ A}$。` },
            {
              label: '还没完！',
              text: R`题目求的是节点电压 $v_1, v_2$，你还得额外做一步欧姆定律换算：`,
              tex: R`v_1 = 4\cdot(-i_1) = 4\times 5 = 20\text{ V}, \qquad v_2 = 6\cdot(i_2 - i_4) = 6\times (-1 + 4) = 18\text{ V}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授点评**：两种方法结果严丝合缝（$v_1 = 20\text{ V},\ v_2 = 18\text{ V}$），但过程天差地别——节点法 **2 方程、零超节点、10 秒直写**；网孔法 **4 未知量、超网孔约束 + 额外反算**。这就是为什么我们在动手列方程之前，必须先花 3 秒跑一遍**工程选型决策树**！`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '工程选型决策树与“网孔法禁区”——非平面电路识别',
      sync: { layer: L3, halo: ['dt_s1', 'k33_cross'], params: { l3_step: 0, l3_panel: 'tree', l3_graph: 'k33', l3_hl: true } },
      blocks: [
        { kind: 'p', text: '**5.1 四步工程选型决策树与非平面桥式交叉电路图（左侧舞台 `03 号图层`）**' },
        {
          kind: 'p',
          text: '对齐 Sadiku 教材 **Section 3.7 (Nodal Versus Mesh Analysis)**，任何陌生电路拿到手，按以下 [[dt_s1,dt_s2,dt_s3,dt_s4|4 级漏斗]]从上往下扫描，3 秒锁定最优解法：',
        },
        { kind: 'figure', svg: SVG_ACT5, caption: '图 5-1：节点法 vs 网孔法四步工程选型决策树 & 经典非平面电路（K₃,₃ 交叉桥）' },
        { kind: 'p', text: '**5.2 关键辨析：别被“假交叉”骗了！**' },
        { kind: 'p', text: '同学们常犯的一个错误是：看到原理图上两条导线画了个“跨桥（跳线）”，就立刻宣称这是非平面电路。**大错特错！**' },
        {
          kind: 'ul',
          items: [
            '**平面电路的严格定义**：只要能通过**重新排布元件位置**（不改变电气连接关系），把电路画在二维平面上且**没有任何两条支路交叉**，它就是平面电路（例如经典的[[bridge_graph|惠斯通电桥]]画成带对角线的正方形时有交叉，但把一条对角线拉到外侧绕过去就没交叉了，所以惠斯通电桥是平面电路！）。',
            R`**真正的非平面电路**：根据图论库拉托夫斯基定理（Kuratowski's Theorem），只有包含 **[[k33_graph|$K_{3,3}$（3 对 3 全连通二部图）]]** 或 **$K_5$（5 节点全连通图）** 子结构的电路，才[[k33_cross|无论怎么重画都无法消除交叉]]。此时**网孔法彻底失效，必须使用节点分析法**（这也是为什么 SPICE 仿真器底层统一采用改进节点分析法 MNA，因为节点法通吃平面与非平面电路）。`,
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式分步引导例题与诊断测验',
      sync: { layer: L1, halo: [], params: l1('mesh', true, { l1_reveal: 0 }) },
      blocks: [
        { kind: 'p', text: '**6.1 综合例题原理图（先选型、再观察法直写求解）**' },
        {
          kind: 'p',
          text: R`下面这道综合例题完美覆盖 Sadiku Section 3.6 & 3.7 的核心考法：**先对比节点数与网孔数完成选型，再用观察法 10 秒直写 $3\times 3$ 电阻矩阵 $\mathbf{R}\mathbf{i} = \mathbf{v}$，求解全部网孔电流并提取公共支路电流 [[ex_io|$I_o$]]**。`,
        },
        {
          kind: 'guided',
          title: '先选型、再矩阵直写：3 网孔平面电压源电路求支路电流 $I_o$',
          source: 'Alexander, Sadiku & Fredette (2026), Sections 3.6 & 3.7',
          problem: R`图 6-1：3 个独立电压源（18 V、3 V、8 V）与 6 个电阻，不含受控源，平面电路。求 [[ex_io|$I_o$]]（流过中心 4 Ω 电阻的向下电流）。左侧舞台 01 切到了这张电路的网孔模式，矩阵的格子随引导步骤逐格揭晓。`,
          problem_svg: SVG_ACT6,
          steps: [
            {
              title: 'Step 1 · 先跑选型决策树',
              mini_svg: MINI_STEP1,
              question: R`动手列方程之前，先跑一遍工程选型决策树：图 6-1 是平面电路、全部为独立电压源（含 1 个顶部悬浮 8 V 电压源），待求量为中心支路电流 $I_o$。你应该首选哪种方法？`,
              hint: R`$\text{平面电路} + \text{纯独立电压源} + M=3 < (N-1) \implies \text{首选 } \mathbf{R}\mathbf{i}=\mathbf{v}$`,
              options: [
                {
                  text: '节点分析法，因为电路底部有一条公共参考线',
                  correct: false,
                  feedback: '别被公共底线迷惑！数一数非参考节点：左中、右中、中心三岔口，外加顶部 8 V 悬浮电压源两端，至少 4 个未知节点还要处理超节点！换个视角数数网孔有几个？',
                },
                {
                  text: R`网孔分析法（且可直接用观察法直写 $\mathbf{R}\mathbf{i}=\mathbf{v}$），因为它是仅含独立电压源的 3 网孔平面电路`,
                  correct: true,
                  feedback: '一针见血！平面电路 + 纯独立电压源 + 无受控源 + 仅 3 个网孔 + 目标是支路电流，四个选型指标全票投给网孔观察法！',
                },
                {
                  text: '两种方法都不能用观察法，必须老实列 KCL/KVL',
                  correct: false,
                  feedback: R`检查一下电路里有没有受控源或电流源？一个都没有！纯电阻 + 纯独立电压源的平面电路，正是电阻矩阵观察法 $\mathbf{R}\mathbf{i}=\mathbf{v}$ 的主场。`,
                },
              ],
              board: [R`\textbf{Step 1 选型结论：}\text{采用网孔观察法 } \mathbf{R}\mathbf{i}=\mathbf{v}`, R`\text{（3 个顺时针网孔电流 } i_1, i_2, i_3\text{，无超网孔）。}`],
              halo: [],
              params: { l1_reveal: 0 },
            },
            {
              title: 'Step 2 · 直写电阻矩阵 R',
              mini_svg: MINI_STEP2,
              question:
                '现在用观察法直写 3×3 电阻矩阵 $\\mathbf{R}$（所有网孔电流统一取顺时针 CW）。以下哪个电阻矩阵 $\\mathbf{R}$ 的主对角线（自电阻）与非对角线（负互电阻）完全正确？',
              hint: R`$R_{kk} = \sum R_{\text{mesh } k} > 0, \quad R_{kj} = R_{jk} = -\sum R_{\text{shared}(k,j)} \le 0$`,
              options: [
                {
                  text: R`$\mathbf{R} = \begin{bmatrix} 8 & -4 & -2 \\ -4 & 8 & -1 \\ -2 & -1 & 6 \end{bmatrix}$`,
                  correct: true,
                  feedback: R`完全精准！主对角线 $[8, 8, 6]$ 全正，非对角线互电阻全负，且 $R_{12}=R_{21}=-4$、$R_{13}=R_{31}=-2$、$R_{23}=R_{32}=-1$ 严格对称。`,
                },
                {
                  text: R`$\mathbf{R} = \begin{bmatrix} 8 & 4 & 2 \\ 4 & 8 & 1 \\ 2 & 1 & 6 \end{bmatrix}$`,
                  correct: false,
                  feedback: '警报！非对角线漏了负号！因为所有网孔电流都取顺时针方向，相邻网孔在公共电阻上的电流方向必然相反，所以互电阻项必须全取负号。',
                },
                {
                  text: R`$\mathbf{R} = \begin{bmatrix} 6 & -4 & -2 \\ -4 & 7 & -1 \\ -2 & -1 & 6 \end{bmatrix}$`,
                  correct: false,
                  feedback: R`自电阻算漏了外围电阻！记住：$R_{11}$ 是网孔 1 周界上的“全部”电阻（外围 2Ω + 共享 4Ω + 共享 2Ω = 8Ω），不能漏掉外围支路。`,
                },
              ],
              board: [R`\mathbf{R} = \begin{bmatrix} 8 & -4 & -2 \\ -4 & 8 & -1 \\ -2 & -1 & 6 \end{bmatrix}\ \Omega`],
              halo: ['ri_diag', 'ri_offdiag'],
              params: { l1_reveal: 0 },
            },
            {
              title: 'Step 3 · 右端激励电压向量 v',
              mini_svg: MINI_STEP3,
              question: R`接下来确定右端激励电压向量 $\mathbf{v} = [v_1, v_2, v_3]^T$。请沿每个网孔的顺时针（CW）方向走一圈，判断三个电压源（18 V、3 V、8 V）的升压/降压正负号：`,
              hint: R`$\text{CW 穿行电源：由 } - \to + \text{ 记 } +V_s\text{；由 } + \to - \text{ 记 } -V_s$`,
              options: [
                {
                  text: R`$\mathbf{v} = [18,\ 3,\ 8]^T$`,
                  correct: false,
                  feedback: R`小心网孔 2 右侧的 3 V 电压源！它的 + 极在上、− 极在下，而顺时针电流 $i_2$ 在右侧边是“向下”流的，从 + 进、− 出是降压，所以右端应记为 −3 V！`,
                },
                {
                  text: R`$\mathbf{v} = [18,\ -3,\ 8]^T$`,
                  correct: true,
                  feedback: '太稳了！左侧 18 V 顺时针升压（+18），右侧 3 V 顺时针降压（-3），顶部 8 V 左负右正顺时针向右升压（+8）。符号零失误！',
                },
                {
                  text: R`$\mathbf{v} = [-18,\ 3,\ -8]^T$`,
                  correct: false,
                  feedback: R`你把整个右端向量的符号全写反了！在标准形式 $\mathbf{R}\mathbf{i} = \mathbf{v}$ 中，等号左边是电阻压降之和，等号右边必须是电压源的“升压”代数和（由 − 到 + 记正）。`,
                },
              ],
              board: [
                R`\begin{bmatrix} 8 & -4 & -2 \\ -4 & 8 & -1 \\ -2 & -1 & 6 \end{bmatrix} \begin{bmatrix} i_1 \\ i_2 \\ i_3 \end{bmatrix} = \begin{bmatrix} 18 \\ -3 \\ 8 \end{bmatrix}`,
              ],
              halo: ['ri_rhs'],
              params: { l1_reveal: 1 },
            },
            {
              title: 'Step 4 · 克莱默法则求网孔电流',
              mini_svg: MINI_STEP4,
              question: R`用克莱默法则求解上述 3×3 矩阵方程：已知主行列式 $\Delta = 232$，且 $\Delta_1 = 928$，$\Delta_2 = 464$，$\Delta_3 = 696$。请算出三个网孔电流 $[i_1, i_2, i_3]^T$：`,
              hint: R`$i_1 = \frac{\Delta_1}{\Delta} = \frac{928}{232}, \quad i_2 = \frac{\Delta_2}{\Delta} = \frac{464}{232}, \quad i_3 = \frac{\Delta_3}{\Delta} = \frac{696}{232}$`,
              options: [
                {
                  text: R`$i_1 = 4\text{ A},\ i_2 = 2\text{ A},\ i_3 = 3\text{ A}$`,
                  correct: true,
                  feedback: '计算丝滑！928/232 = 4 A，464/232 = 2 A，696/232 = 3 A。可以心算代入第 1 行验算：8(4) - 4(2) - 2(3) = 32 - 8 - 6 = 18 V，完美吻合！',
                },
                {
                  text: R`$i_1 = 4\text{ A},\ i_2 = -2\text{ A},\ i_3 = 3\text{ A}$`,
                  correct: false,
                  feedback: R`注意 $\Delta_2 = +464$，除以 $\Delta = 232$ 得到的是 +2 A，不是 -2 A。代入第 2 行验算：-4(4) + 8(2) - 1(3) = -16 + 16 - 3 = -3 V，正好吻合右端！`,
                },
              ],
              board: [R`\Delta = 232,\ \Delta_1 = 928,\ \Delta_2 = 464,\ \Delta_3 = 696`, R`\implies i_1 = 4\text{ A},\ i_2 = 2\text{ A},\ i_3 = 3\text{ A}`],
              halo: [],
              params: { l1_reveal: 2 },
            },
            {
              title: 'Step 5 · 从网孔电流提取支路电流 Iₒ',
              mini_svg: MINI_STEP5,
              question: R`临门一脚！题目要求的是中心 4 Ω 电阻上“向下”流动的支路电流 $I_o$。结合网孔 1（$i_1=4$ A）和网孔 2（$i_2=2$ A）的顺时针方向，$I_o$ 等于多少？`,
              hint: '$I_o = i_1 - i_2$',
              options: [
                {
                  text: R`$I_o = i_1 + i_2 = 6\text{ A}$`,
                  correct: false,
                  feedback: '方向看反啦！$i_1$ 顺时针经过中心支路是“向下”的，但 $i_2$ 顺时针经过中心支路是“向上”的，两者方向相反，应该是相减而不是相加！',
                },
                {
                  text: R`$I_o = i_1 - i_2 = 2\text{ A}$`,
                  correct: true,
                  feedback: R`满分收官！$i_1$ 与 $I_o$ 同向（向下），$i_2$ 与 $I_o$ 反向（向上），因此 $I_o = i_1 - i_2 = 4 - 2 = 2\text{ A}$。你已经彻底掌握了“选型 + 矩阵直写 + 支路反推”的全套工程闭环！`,
                },
                {
                  text: R`$I_o = i_2 - i_1 = -2\text{ A}$`,
                  correct: false,
                  feedback: '你把目标参考方向看反了：题目规定 $I_o$ 向下，而向下流的是 $i_1$，所以应当用 $i_1$ 减去向上的 $i_2$。',
                },
              ],
              board: [R`I_o = i_1 - i_2 = 4 - 2 = 2\text{ A}\ (\text{向下})\quad \blacksquare`],
              halo: ['ex_io'],
              params: { l1_reveal: 3 },
            },
          ],
          conclusion: R`选型（网孔观察法）→ 直写 $\mathbf{R}$ → 定 $\mathbf{v}$ → 克莱默法则 → 支路反推：$I_o = i_1 - i_2 = 2\text{ A}$（向下）。下面的通关复盘把这道题的板书完整写一遍。`,
        },
        { kind: 'p', text: '**通关复盘 · 例题 6-1 的完整板书**（左侧舞台按“揭晓全部”，矩阵、网孔电流与 $I_o$ 一并显示）' },
        { kind: 'figure', svg: SVG_REVIEW, caption: '执行稿的五张步骤卡片：选型 → 自电阻与互电阻 → 电源符号 → 克莱默法则 → 支路电流' },
        {
          kind: 'calc',
          title: '③ 代入数值 · 逐步化简：克莱默法则全过程',
          steps: [
            {
              label: 'Step A · 主行列式（按第 1 行展开）',
              tex: R`\begin{aligned} \Delta &= 8\begin{vmatrix} 8 & -1 \\ -1 & 6 \end{vmatrix} - (-4)\begin{vmatrix} -4 & -1 \\ -2 & 6 \end{vmatrix} + (-2)\begin{vmatrix} -4 & 8 \\ -2 & -1 \end{vmatrix} \\ &= 8(47) + 4(-26) - 2(20) = 232 \end{aligned}`,
            },
            {
              label: R`Step B · $\Delta_1$（第 1 列换成 $\mathbf{v}$）`,
              tex: R`\begin{aligned} \Delta_1 &= \begin{vmatrix} 18 & -4 & -2 \\ -3 & 8 & -1 \\ 8 & -1 & 6 \end{vmatrix} \\ &= 18(47) + 4(-18 + 8) - 2(3 - 64) \\ &= 846 - 40 + 122 = 928 \end{aligned}`,
            },
            {
              label: R`Step C · $\Delta_2$（第 2 列换成 $\mathbf{v}$）`,
              tex: R`\begin{aligned} \Delta_2 &= \begin{vmatrix} 8 & 18 & -2 \\ -4 & -3 & -1 \\ -2 & 8 & 6 \end{vmatrix} \\ &= 8(-18 + 8) - 18(-24 - 2) - 2(-32 - 6) \\ &= -80 + 468 + 76 = 464 \end{aligned}`,
            },
            {
              label: R`Step D · $\Delta_3$（第 3 列换成 $\mathbf{v}$）`,
              tex: R`\begin{aligned} \Delta_3 &= \begin{vmatrix} 8 & -4 & 18 \\ -4 & 8 & -3 \\ -2 & -1 & 8 \end{vmatrix} \\ &= 8(64 - 3) + 4(-32 - 6) + 18(4 + 16) \\ &= 488 - 152 + 360 = 696 \end{aligned}`,
            },
            { label: 'Step E · 网孔电流', tex: R`i_1 = \frac{928}{232} = 4\text{ A}, \qquad i_2 = \frac{464}{232} = 2\text{ A}, \qquad i_3 = \frac{696}{232} = 3\text{ A}` },
            {
              label: 'Step F · KVL 回代验算（第 3 行）',
              tex: R`-2(4) - 1(2) + 6(3) = -8 - 2 + 18 = 8\text{ V} = v_3 \quad \checkmark`,
            },
            { label: 'Step G · 支路电流', tex: R`I_o = i_1 - i_2 = 4 - 2 = 2\text{ A}\ (\text{向下})` },
          ],
        },
        { kind: 'p', text: '**6.3 诊断测验**' },
        {
          kind: 'p',
          text: '以下 4 道高频诊断题专门瞄准学生最容易踩坑的四大雷区：**选型判断、受控源破坏矩阵对称性、非平面电路禁区、观察法方向与符号陷阱**。',
        },
      ],
      quiz: [
        {
          id: 'w2l4_q1',
          question: R`某 3 节点电阻电路包含 2 个独立电流源和 1 个压控电流源（VCCS，大小 $2v_x$）。一位同学试图用观察法直接写出对称电导矩阵 $\mathbf{G}\mathbf{v} = \mathbf{i}$。以下判断正确的是：`,
          options: [
            {
              key: 'A',
              text: R`可以直接用观察法，只要把受控源当成普通独立电流源放进右端向量 $\mathbf{i}$ 即可`,
              correct: false,
              feedback: R`受控源的大小 $2v_x$ 含未知量：把它放进右端，右端就不再是已知激励。$v_x$ 移回左边后只改动某一行的系数，矩阵随之失去对称性。`,
            },
            {
              key: 'B',
              text: R`不能直接用观察法：受控源引入的单向耦合会破坏电导矩阵的对称性（$G_{kj} \neq G_{jk}$），必须回归标准 KCL 列方程再整理`,
              correct: true,
            },
            {
              key: 'C',
              text: '只要将受控源替换为等效电阻，就能恢复对称性并套用观察法',
              correct: false,
              feedback: R`压控电流源一般受别处的电压 $v_x$ 控制，不是自身两端电压的电阻，换不成一颗双向互易的电阻；单向耦合的那一项仍只出现在一行里。`,
            },
            {
              key: 'D',
              text: R`节点观察法失效，但改用网孔观察法 $\mathbf{R}\mathbf{i} = \mathbf{v}$ 仍然保持对称`,
              correct: false,
              feedback: '对称性依赖的是线性电阻的双向互易性，网孔法同样依赖它：受控源在网孔方程里也只改动某一行，R 矩阵照样失对称。',
            },
          ],
          feedback_correct:
            '观察法矩阵直写的对称性（$G_{kj} = G_{jk}$ 或 $R_{kj} = R_{jk}$）严格依赖线性电阻的双向互易性，仅适用于不含受控源的电路。一旦出现受控源，控制变量移项到左侧后只改变某一行某一列的系数，必然破坏矩阵对称性。',
          feedback_wrong: '再想一想：观察法的对称性从哪里来？受控源的控制量移到等号左边后，改动的是几行？',
          figure: SVG_Q1,
          sync: { layer: L1, halo: [], params: l1('nodal', false) },
        },
        {
          id: 'w2l4_q2',
          question: R`某立体电阻网络经拓扑检查与 $K_{3,3}$ 同胚（存在无论如何重绘都无法消除的支路交叉），且电路中有 4 个独立电压源。工程师应如何选择分析方法？`,
          options: [
            { key: 'A', text: '必须使用节点分析法，因为非平面电路无法定义不含内部支路的网孔，网孔法彻底失效', correct: true },
            {
              key: 'B',
              text: '优先使用网孔分析法，因为电路中有 4 个独立电压源，符合电源亲和度原则',
              correct: false,
              feedback: '电源类型只是决策树的第 ③ 级；排在最前面的平面性检查有“一票否决权”。非平面电路连网孔都定义不出来，电压源再多也用不了网孔法。',
            },
            {
              key: 'C',
              text: '把交叉点强行当作一个新节点，然后就能用网孔分析法求解',
              correct: false,
              feedback: '交叉的两条支路在实物里并不相连，把交叉点焊成一个节点就改变了电气连接关系，算出来的是另一张电路。',
            },
            {
              key: 'D',
              text: '节点法和网孔法都失效，只能用基尔霍夫原始支路电流法',
              correct: false,
              feedback: '节点法只需要选一个参考节点、对其余节点列 KCL，和电路能不能画平毫无关系——它通吃平面与非平面电路（SPICE 的 MNA 正是节点法）。',
            },
          ],
          feedback_correct:
            '在选型决策树中，拓扑平面性检查拥有“一票否决权”。非平面电路无法在二维平面上无交叉绘制，不存在良定义的网孔（Mesh），因此网孔法不适用，必须采用节点分析法。',
          feedback_wrong: '回到决策树：第 ① 级检查的是什么？它一旦判“是”，后面几级还用看吗？',
          figure: SVG_Q2,
          sync: { layer: L3, halo: [], params: { l3_step: 0, l3_panel: 'graph', l3_graph: 'k33', l3_hl: false } },
        },
        {
          id: 'w2l4_q3',
          question: '一个平面电路共有 3 个节点（含参考节点）、7 条支路，其中包含 4 个并联的独立电流源和 3 个电阻，要求计算各节点对地电压。选择哪种方法效率最高？',
          options: [
            {
              key: 'A',
              text: '网孔法，因为只需要列 3 个方程',
              correct: false,
              feedback: '网孔数不能凭感觉：用 M = B − N + 1 = 7 − 3 + 1 算一算。而且电流源多会触发超网孔，网孔法一点都不省事。',
            },
            {
              key: 'B',
              text: R`节点法，因为只需列 $N-1 = 2$ 个节点方程，且可直接用观察法 $\mathbf{G}\mathbf{v} = \mathbf{i}$ 直写；而网孔法需要 $B-N+1 = 5$ 个网孔方程且含超网孔`,
              correct: true,
            },
            {
              key: 'C',
              text: '两种方法方程数完全相同，任选其一',
              correct: false,
              feedback: '分别算出来比一比：节点法 N − 1，网孔法 B − N + 1。两者差得远，选型决策树第 ② 级就能分出胜负。',
            },
            {
              key: 'D',
              text: '必须先对所有电流源做电源等效变换，再列网孔方程',
              correct: false,
              feedback: '没有这个“必须”：电流源多正是节点法的主场，直接写 Gv = i 就行；绕道电源变换再列网孔方程是多走弯路。',
            },
          ],
          feedback_correct:
            '由欧拉公式，该平面电路网孔数 M = B - N + 1 = 7 - 3 + 1 = 5，且含多个电流源会触发超网孔；而节点法仅需 N - 1 = 2 个未知节点电压，且全为独立电流源，用观察法 5 秒即可写出 2×2 矩阵。',
          feedback_wrong: '把两种方法的方程数都算出来：N − 1 与 M = B − N + 1，再看电源是哪一类。',
          figure: SVG_Q3,
          sync: { layer: L2, halo: ['cmp_count'], params: { l2_view: 'split', l2_super: true } },
        },
        {
          id: 'w2l4_q4',
          question: R`在平面纯独立电压源电路中使用观察法直写 $\mathbf{R}\mathbf{i} = \mathbf{v}$ 时，如果网孔 1 取顺时针方向、网孔 2 意外取了逆时针方向，而两者共享一个 5 Ω 电阻，则矩阵中 $R_{12}$ 与 $R_{21}$ 应该为：`,
          options: [
            {
              key: 'A',
              text: '依然是 −5 Ω，因为观察法规定非对角线永远为负',
              correct: false,
              feedback: '“非对角线永远为负”不是无条件的规定，而是“全部网孔统一顺时针”带来的结果；方向约定一变，这个结论就跟着变。',
            },
            {
              key: 'B',
              text: '变为 +5 Ω，因为两网孔电流在共享 5 Ω 电阻上方向相同，不再满足“统一顺时针则非对角线全负”的直写约定',
              correct: true,
            },
            {
              key: 'C',
              text: R`$R_{12} = -5\ \Omega$，$R_{21} = +5\ \Omega$，矩阵失去对称性`,
              correct: false,
              feedback: '两行写的是同一颗 5 Ω 电阻、同一对电流方向：网孔 1 的方程和网孔 2 的方程看到的耦合完全相同，所以两个格子必然同号同值，对称性还在。',
            },
            {
              key: 'D',
              text: '变为 0 Ω，因为反向网孔电流互相抵消',
              correct: false,
              feedback: '公共电阻还在电路里，耦合不会消失：方向约定只决定这一项的正负号，不会让它变成 0。',
            },
          ],
          feedback_correct:
            '观察法中“非对角线恒为负互电阻”的严格前提是所有网孔电流统一取相同绕行方向（通常统一顺时针 CW）。若相邻网孔一顺一逆，两者在共享支路上同向叠加，互电阻系数变为 +5 Ω。因此实战中务必强制所有网孔统一顺时针！',
          feedback_wrong: '画一画：网孔 1 顺时针、网孔 2 逆时针时，两股电流在共享的 5 Ω 上是同向还是反向？',
          figure: SVG_Q4,
          sync: { layer: L1, halo: ['ri_cw'], params: l1('mesh', false) },
        },
      ],
    },
  ],
};

export default W2_L4;
