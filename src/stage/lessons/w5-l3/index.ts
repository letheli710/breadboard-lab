// W5-L3 · 交流稳态节点分析法与网孔分析法（复数域系统求解） (lesson sheet: docs/lessons/W5-L3.md).
// Type B, strictly 2D: no three.js anywhere in this folder (lesson.test.ts checks it). The professor's
// opening and the text of the five acts, the act diagrams (svgs.ts), the guided example and the
// diagnostic quiz are reproduced from the sheet; [[id|…]] only links a term to the stage (the words
// are unchanged). Every complex number of the sheet is recomputed by the one solver in model.ts and
// asserted in model.test.ts (all of them are right). Changes from the sheet, of form:
// - display formulas sit in ② / ③ cards (a lead-in sentence becomes the card's title, a sub-bullet
//   of a ③ a numbered step; where the sheet writes a sentence after a display formula, that
//   sentence is its own step); the sub-headings (1.1, 2.1 …) are bold lines; the opening is the
//   first paragraph of act 1; the sub-bullets of act 1's three-step method run in one item; the
//   italics of the two division methods are plain text; the act diagrams stand where the sheet has
//   them (figure blocks); the sheet's TeX `\angle -45^\circ` is written `\angle{-}45^\circ` (KaTeX
//   would space the minus as a subtraction) and the longest ③ chains break into two aligned lines;
// - plain-text symbols of the guided-example and quiz JSON (I_s, V1, 6∠-90° …) are set as TeX; the
//   sheet gives one professor_intercept per step: it answers the wrong option it was written for,
//   the other wrong option gets its own intercept, the right one praise; the right answer of step 3
//   moves to the last place (the steps then use all three places); the board TeX of steps 1, 4
//   and 5 is written as two lines (so it fits a phone); the quiz options are reordered so the right
//   answer is not B four times;
// - anti-spoiler: the guided example is its own problem (no act works it), so no ③ moves. Its step
//   hints printed the step's answer (the hint is on demand, inside the step), so each hint keeps its
//   method and stops before the result; its numbers on the stage (layer 02) stay covered while it
//   runs (stage param w53_g = steps solved; done_params uncovers them). No step diagram prints its
//   own step's answer.
// - left out (build instructions, not lesson text): the 「Claude 工程落地清单」 (5.3) and its mention
//   in act 5's title, the JSON headings, the quiz's passing score (the site uses 4/4).
// Added (the sheet has none): the hover map; the three stage layers' controls as the sheet lists
// them; praise for right options and the guided example's conclusion; per-option quiz feedback
// written from the explanations; the quiz figures (figures.ts); the next-lesson line after the quiz.

import { lazy } from 'react';
import type { StageLesson, StageSync } from '../../types';
import { SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './figures';
import { L1, L2, L3, P_DOM, P_F2, P_G, P_MV, P_NC, P_NODE, P_SUPER, P_TRAP, P_VIEW2, P_W } from './parts';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5 } from './svgs';

const Layer01 = lazy(() => import('./Domain'));
const Layer02 = lazy(() => import('./Nodal'));
const Layer03 = lazy(() => import('./Mesh'));

const R = String.raw;
/** inline `code` inside a String.raw text */
const code = (s: string) => `\`${s}\``;

const at = (layer: string, halo: string[], params: Record<string, unknown>): StageSync => ({ layer, halo, params });
/** a guided step's stage: the guided circuit on layer 02, `solved` steps uncovered */
const G = (solved: number) => ({ [P_NC]: 'guided', [P_VIEW2]: 'circuit', [P_G]: solved });

const W5_L3: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Layer01, [L2]: Layer02, [L3]: Layer03 },
  lesson_meta: {
    lesson_id: 'W5-L3',
    world: 'World 5',
    title: '交流稳态节点分析法与网孔分析法（复数域系统求解）',
    subtitle: 'AC Steady-State Nodal & Mesh Analysis in the Phasor Domain',
    lesson_type: 'B',
    lesson_type_label: '纯公式 / 方法论课（复数域系统线性代数建模与同构迁移，无 3D 面包板）',
    estimated_minutes: 50,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Section 10.1–10.3'],
    },
    textbook_supplement: 'Boylestad, Introductory Circuit Analysis (14th Ed.), Chapter 17 (AC Nodal & Mesh Analysis)',
    prerequisites: ['W2-L1: 直流节点分析法', 'W2-L2: 直流超节点与受控源处理', 'W2-L3: 直流网孔分析法与超网孔', 'W5-L2: 复阻抗与复导纳（Phasor Impedance & Admittance）'],
    learning_objectives: [
      '熟练执行交流稳态分析标准三步法：时域→频域相量等效→复数线性方程求解→时域正弦还原',
      '深刻理解直流分析法（W2）与交流相量分析法（W5）在拓扑与代数结构上的严格同构性',
      '能够对含电感、电容及受控源的交流电路准确列写复数节点/超节点方程与网孔/超网孔方程',
      '掌握复数克莱姆法则与高斯消元中的坐标切换技巧（加减用直角坐标、乘除用极坐标），降低手算错误率',
      '牢记同频红线：单张相量电路图仅适用于单一角频率激励；多频率电路必须留给 W5-L4 叠加定理',
    ],
    next_lesson: 'W5-L4',
    next_lesson_title: '交流网络定理与交流运放电路（叠加、电源变换、交流戴维南与运放）',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 时域→频域',
        short: '01 时域→频域',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '01 时域电路 → 频域复阻抗电路一键转换台：切换时域 / 频域，拖动 ω（10 ~ 500 rad/s）实时刷新 jωL 与 −j/(ωC)；加入第二个电源，看同频红线指示灯。',
      },
      {
        id: L2,
        label: '02 交流节点法',
        short: '02 交流节点法',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '02 交流节点法与复数电位气泡高亮图：点击 V₁ / V₂ 节点气泡高亮它的 KCL 支路，追踪受控源 2I_x 的控制路径，气泡在 a + jb 与 M∠θ 之间切换。',
      },
      {
        id: L3,
        label: '03 网孔/超网孔',
        short: '03 网孔/超网孔',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '03 交流网孔/超网孔复数方程求解台：顺时针网孔电流动画、超网孔虚线外环开关、逐步展开 Δ、Δ₁、Δ₂ 与残差验算；单频合法电路 vs 双频陷阱电路对照。',
      },
    ],
    hover_map: {
      a1_is: { label: '独立电流源 i_s(t)', desc: '10cos(ωt + 30°) A，相量 I_s = 10∠30° A（余弦基准）' },
      a1_r: { label: '电阻 R = 20 Ω', desc: '复阻抗就是它本身：Z_R = 20 Ω，与 ω 无关' },
      a1_l: { label: '电感 L = 0.1 H → jωL', desc: '感抗是正虚数，随 ω 线性增大（ω = 100 rad/s 时 j10 Ω）' },
      a1_c: { label: '电容 C = 0.5 mF → −j/(ωC)', desc: '容抗是负虚数，随 ω 增大而减小（ω = 100 rad/s 时 −j20 Ω）' },
      a1_v: { label: '顶节点电压 v(t) ↔ 相量 V', desc: '节点方程 Y_tot·V = I_s，V = I_s / Y_tot' },
      a1_is2: { label: '第二个电源 5cos(200t) A', desc: '频率 200 rad/s：只有当 ω 也等于 200 rad/s 时，两个电源才能画进同一张相量图' },
      a1_guard: { label: '同频红线指示灯', desc: '全电路所有独立电源的角频率必须完全一致，才能画单张相量电路图' },
      a1_plot: { label: '波形 / 相量图', desc: '时域：两个周期的 i_s(t) 与 v(t)；频域：同一复平面上的 I_s 与 V（逆时针为超前）' },
      ro_y: { label: '总复导纳 Y_tot', desc: '1/R + 1/(jωL) + jωC：直角坐标里实部、虚部分别相加' },
      ro_vt: { label: '时域还原 v(t)', desc: 'v(t) = Re{M e^{jθ} e^{jωt}} = M cos(ωt + θ)' },
      e1_is: { label: '独立电流源 I_s = 5∠0° A', desc: '5cos(10t) A，注入节点 1' },
      e1_c: { label: '电容 Z_C = −j4 Ω', desc: 'C = 25 mF，ω = 10 rad/s：1/(j·10·0.025) = −j4 Ω，节点 1 对地' },
      e1_r1: { label: '桥接电阻 R₁ = 4 Ω', desc: '节点 1 与节点 2 之间：它的电流就是控制量 I_x' },
      e1_ix: { label: '控制电流 I_x', desc: '向右流过 R₁：I_x = (V₁ − V₂)/4，先用节点电压表示再代入 KCL' },
      e1_l: { label: '电感 Z_L = j2 Ω', desc: 'L = 0.2 H，ω = 10 rad/s：j·10·0.2 = j2 Ω，节点 2 对地' },
      e1_cccs: { label: '受控源 2I_x（CCCS）', desc: '电流控制电流源，箭头向上注入节点 2；增益 α = 2' },
      e1_v1: { label: '节点 1 电位气泡 V₁', desc: '点击：高亮与节点 1 相连的电流源、电容、R₁，写出节点 1 的 KCL' },
      e1_v2: { label: '节点 2 电位气泡 V₂', desc: '点击：高亮与节点 2 相连的 R₁、电感、受控源，写出节点 2 的 KCL' },
      e1_res: { label: 'KCL 残差 ‖A·x − b‖', desc: '把解代回复导纳矩阵方程，残差远小于 10⁻¹²' },
      g_is: { label: '引导例题：独立电流源', desc: 'i_s(t) = 6sin(100t) A，注入节点 1（注意：正弦！）' },
      g_r1: { label: '引导例题：R₁ = 10 Ω', desc: '节点 1 对地' },
      g_c: { label: '引导例题：电容 C = 1 mF', desc: '跨接在节点 1 与节点 2 之间' },
      g_r2: { label: '引导例题：R₂ = 10 Ω', desc: '节点 2 对地，与电感并联' },
      g_l: { label: '引导例题：电感 L = 0.1 H', desc: '节点 2 对地，与 R₂ 并联' },
      g_v1: { label: '引导例题：节点 1 电位 V₁', desc: '求解目标：v₁(t)' },
      g_v2: { label: '引导例题：节点 2 电位 V₂', desc: '求解目标：v₂(t)' },
      e2_vs: { label: '电压源 V_s = 20∠0° V', desc: 'v_s(t) = 20cos(5t) V，上正下负，在左网孔' },
      e2_r1: { label: '电阻 R₁ = 4 Ω', desc: '左网孔，与电感串联：Z₁ = R₁ + Z_L' },
      e2_l: { label: '电感 Z_L = j2 Ω', desc: 'L = 0.4 H，ω = 5 rad/s：j·5·0.4 = j2 Ω' },
      e2_c: { label: '电容 Z_C = −j4 Ω', desc: 'C = 50 mF，ω = 5 rad/s：1/(j·5·0.05) = −j4 Ω；右网孔 Z₂ = Z_C + R₂' },
      e2_r2: { label: '电阻 R₂ = 2 Ω', desc: '右网孔的右侧支路' },
      e2_is: { label: '公共支路电流源 I_s = −j4 A', desc: 'i_s(t) = 4sin(5t) = 4cos(5t − 90°) A，方向向上：I₂ − I₁ = I_s' },
      e2_m1: { label: '网孔电流 I₁（顺时针）', desc: '左网孔：I₁ = 5 + j3 A ≈ 5.83∠30.96° A' },
      e2_m2: { label: '网孔电流 I₂（顺时针）', desc: '右网孔：I₂ = 5 − j1 A ≈ 5.10∠−11.31° A' },
      e2_super: { label: '超网孔外大环路', desc: '移开含电流源的公共支路，沿外围大环路列 1 个 KVL：Z₁I₁ + Z₂I₂ = V_s' },
      e2_cramer: { label: '复数克莱姆法则', desc: '[Z₁ Z₂; −1 1]·[I₁; I₂] = [V_s; I_s]：Δ、Δ₁、Δ₂ 逐步展开，再验残差' },
      trap_v1: { label: '电源 v₁ = 10cos(50t) V', desc: 'ω₁ = 50 rad/s' },
      trap_v2: { label: '电源 v₂', desc: '同频 5sin(50t) V / 异频 5cos(120t) V / 直流 5 V（ω = 0）' },
      trap_l: { label: '电感阻抗 jωL', desc: '每个频率下是不同的数：j50L、j120L，直流时为 0（短路）' },
      trap_guard: { label: '同频红线判定', desc: '异频电路不能画在同一张相量图上，留给 W5-L4 叠加定理分频求解' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '从时域到频域——交流稳态分析标准三步法与同构性定理',
      sync: at(L1, ['a1_l', 'a1_c', 'a1_guard'], { [P_W]: 100, [P_DOM]: 'phasor', [P_F2]: false }),
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎回到 Breadboard Lab！上一讲（${code('W5-L2')}）我们把电阻、电感、电容统一写成了**复阻抗 $\mathbf{Z}$**，让交流元件也能像电阻一样做串并联。但现实里的滤波器、放大器偏置网络和电力传输线，往往既不是纯串联也不是纯并联。今天，我们要把第二周（${code('W2-L1/L2/L3')}）学过的两大“核武器”——**节点分析法**与**网孔分析法**——原封不动地升级到复数域！你会惊喜地发现：你根本不需要背一套新理论，你只需要把大脑里的实数 $R$ 替换成复数 $\mathbf{Z}$，把实数电压电流替换成相量 $\mathbf{V}$ 与 $\mathbf{I}$，整个直流分析大厦就会在交流稳态的世界里瞬间复活。`,
        },
        { kind: 'p', text: '**1.1 为什么微积分方程会“坍缩”成复数代数方程？**' },
        {
          kind: 'p',
          text: R`在时域里，只要电路中同时存在电感 [[a1_l|$L$]] 和电容 [[a1_c|$C$]]，列写 KCL 或 KVL 得到的就是令人头疼的**线性常系数微积分方程组**。在 ${code('W5-L1')} 和 ${code('W5-L2')} 中，我们引入了欧拉公式与相量变换。对于**单一角频率 $\omega$** 的正弦稳态激励，电路中所有电压与电流响应都具有相同的复指数因子 $e^{j\omega t}$。`,
        },
        { kind: 'p', text: R`于是，Alexander & Sadiku（Section 10.1）为我们确立了**交流稳态电路分析标准三步法**：` },
        {
          kind: 'ol',
          items: [
            R`**第一步（时域 $\to$ 频域相量电路）**：[[a1_guard|固定唯一的工作角频率 $\omega$]]；统一电源基准为余弦函数（若出现 $\sin(\omega t + \phi)$，先用 $\sin(\omega t + \phi) = \cos(\omega t + \phi - 90^\circ)$ 转换），再写成相量 $\mathbf{V}_s = V_m\angle\phi_v$ 或 $\mathbf{I}_s = I_m\angle\phi_i$；将所有无源元件转化为复阻抗：[[a1_r|$R \to R$]]，[[a1_l|$L \to j\omega L$]]，[[a1_c|$C \to \frac{1}{j\omega C} = -j\frac{1}{\omega C}$]]。`,
            R`**第二步（频域线性代数求解）**：直接套用 ${code('W2-L1/L2/L3')} 的**节点分析法 / 超节点**或**网孔分析法 / 超网孔**，列写以复数电压相量 $\mathbf{V}_k$ 或复数网孔电流相量 $\mathbf{I}_k$ 为未知量的复数线性方程组，利用高斯消元法或克莱姆法则求解。`,
            R`**第三步（频域 $\to$ 时域还原）**：将求得的复数解转化为极坐标形式 $M\angle\theta$；[[ro_vt|还原回时域正弦表达式]]：$x(t) = \operatorname{Re}\{M e^{j\theta} e^{j\omega t}\} = M\cos(\omega t + \theta)$。`,
          ],
        },
        { kind: 'p', text: R`**1.2 强回链 ${code('W2-L1/L2/L3')}：直流与交流的严格同构对照表**` },
        {
          kind: 'table',
          head: ['分析维度', R`直流稳态（${code('W2-L1/L2/L3')}）`, R`交流稳态频域（${code('W5-L3')}）`, '同构映射规则'],
          rows: [
            [
              '元件伏安关系',
              R`$V = R I,\quad I = G V$`,
              R`$\mathbf{V} = \mathbf{Z} \mathbf{I},\quad \mathbf{I} = \mathbf{Y} \mathbf{V}$`,
              R`$R \mapsto \mathbf{Z},\; G \mapsto \mathbf{Y}=1/\mathbf{Z}$`,
            ],
            [
              '节点分析法',
              R`$\sum G_{\text{自}} V_k - \sum G_{\text{互}} V_m = \sum I_s$`,
              R`$\sum \mathbf{Y}_{\text{自}} \mathbf{V}_k - \sum \mathbf{Y}_{\text{互}} \mathbf{V}_m = \sum \mathbf{I}_s$`,
              R`实导纳矩阵 $\mapsto$ 复导纳矩阵`,
            ],
            ['超节点（Supernode）', R`跨接电压源 $V_k - V_m = V_s$`, R`跨接相量电压源 $\mathbf{V}_k - \mathbf{V}_m = \mathbf{V}_s$`, '封闭高斯面 KCL + 电位差约束'],
            [
              '网孔分析法',
              R`$\sum R_{\text{自}} I_k - \sum R_{\text{互}} I_m = \sum V_s$`,
              R`$\sum \mathbf{Z}_{\text{自}} \mathbf{I}_k - \sum \mathbf{Z}_{\text{互}} \mathbf{I}_m = \sum \mathbf{V}_s$`,
              R`实阻抗矩阵 $\mapsto$ 复阻抗矩阵`,
            ],
            ['超网孔（Supermesh）', R`公共电流源 $I_2 - I_1 = I_s$`, R`公共相量电流源 $\mathbf{I}_2 - \mathbf{I}_1 = \mathbf{I}_s$`, '绕行外大环路 KVL + 电流差约束'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授红色警报（[[a1_guard|同频红线原则]]）**：在动笔画频域相量电路之前，必须先检查电路中所有独立电源的角频率 $\omega$ 是否**完全一致**！如果电路中同时出现 $10\cos(100t)\text{ V}$ 和 [[a1_is2|$5\cos(200t)\text{ A}$]] 这类不同频率的电源，电感在 $100\text{ rad/s}$ 和 $200\text{ rad/s}$ 下的感抗 $j\omega L$ 根本不是同一个数，而且不同频率的 $e^{j\omega_1 t}$ 与 $e^{j\omega_2 t}$ 不能约去！**多频率电路绝不能画在同一张相量图上直接列节点或网孔方程**，必须留到下一讲 **W5-L4 叠加定理** 中逐个频率单独建相量模型，最后还原到时域再相加。`,
        },
        { kind: 'p', text: '**1.3 第 1 幕配图：时域电路 ↔ 频域复阻抗电路一键转换对照图**' },
        { kind: 'figure', svg: SVG_ACT1, caption: '时域电路到频域相量等效电路一键转换对照图' },
        { kind: 'p', text: '**1.4 教授三段式板书推导：并联 RLC 节点方程的频域坍缩**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`对左图[[a1_v|顶节点]]应用时域基尔霍夫电流定律（KCL）与 $R, L, C$ 元件本构关系：$\dfrac{v(t)}{R} + \dfrac{1}{L}\int v(t)\,dt + C\dfrac{dv(t)}{dt} = i_s(t)$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · 设全电路受单一角频率 $\omega$ 激励，令 $v(t) = \operatorname{Re}\{\mathbf{V} e^{j\omega t}\}$、$i_s(t) = \operatorname{Re}\{\mathbf{I}_s e^{j\omega t}\}$。由于时域微分对应乘以 $j\omega$、积分对应除以 $j\omega$，提取公共时间因子 $e^{j\omega t}$ 并约去，得到纯符号频域节点方程：`,
          tex: R`\left(\frac{1}{R} + \frac{1}{j\omega L} + j\omega C\right)\mathbf{V} = \mathbf{I}_s \implies \mathbf{Y}_{\text{tot}}\mathbf{V} = \mathbf{I}_s`,
        },
        {
          kind: 'formula',
          title: '其中复阻抗与总复导纳分别为：',
          tex: R`\mathbf{Z}_L = j\omega L,\qquad \mathbf{Z}_C = \frac{1}{j\omega C},\qquad \mathbf{Y}_{\text{tot}} = \frac{1}{R} + \frac{1}{\mathbf{Z}_L} + \frac{1}{\mathbf{Z}_C}`,
        },
        { kind: 'formula', title: '解得节点电压相量通式：', tex: R`\mathbf{V} = \frac{\mathbf{I}_s}{\mathbf{Y}_{\text{tot}}}` },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简 · 已知 $\omega = 100\text{ rad/s}$，$R = 20\,\Omega$，$L = 0.1\text{ H}$，$C = 0.5\text{ mF} = 5 \times 10^{-4}\text{ F}$，[[a1_is|$i_s(t) = 10\cos(100t + 30^\circ)\text{ A}$]]：`,
          steps: [
            {
              label: '求相量与复阻抗',
              tex: R`\begin{gathered}\mathbf{I}_s = 10\angle 30^\circ\text{ A}\\ \mathbf{Z}_L = j(100)(0.1) = j10\,\Omega,\qquad \mathbf{Z}_C = \frac{1}{j(100)(5\times 10^{-4})} = -j20\,\Omega\end{gathered}`,
            },
            {
              label: '求总复导纳（直角坐标加减）',
              tex: R`\mathbf{Y}_{\text{tot}} = \frac{1}{20} + \frac{1}{j10} + \frac{1}{-j20} = 0.05 - j0.10 + j0.05 = 0.05 - j0.05\text{ S}`,
            },
            {
              label: R`转极坐标做除法求 $\mathbf{V}$`,
              tex: R`\begin{aligned}\mathbf{Y}_{\text{tot}} &= \sqrt{0.05^2 + (-0.05)^2}\angle\arctan\left(\frac{-0.05}{0.05}\right)\\ &= 0.05\sqrt{2}\angle{-}45^\circ\text{ S} \approx 0.07071\angle{-}45^\circ\text{ S}\\ \mathbf{V} &= \frac{10\angle 30^\circ}{0.05\sqrt{2}\angle{-}45^\circ} = 100\sqrt{2}\angle (30^\circ - (-45^\circ))\\ &= 100\sqrt{2}\angle 75^\circ\text{ V} \approx 141.42\angle 75^\circ\text{ V}\end{aligned}`,
            },
            { label: '还原时域并核验 KCL 残差', tex: R`v(t) = 141.42\cos(100t + 75^\circ)\text{ V}` },
            {
              label: 'KCL 残差',
              text: R`Python 复数核验残差 $|\mathbf{Y}_{\text{tot}}\mathbf{V} - \mathbf{I}_s| = 0.00 \times 10^{0} < 10^{-12}$，完全精确！`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '交流节点分析法与受控源——经典例题精解',
      sync: at(L2, ['e1_v1', 'e1_v2'], { [P_NC]: 'ex1', [P_VIEW2]: 'circuit' }),
      blocks: [
        { kind: 'p', text: '**2.1 交流节点分析的标准四步走（衔接 Boylestad Ch.17 坡度拆解）**' },
        { kind: 'p', text: '面对含电容、电感与受控源的多节点交流电路，请严格按以下四步执行，绝不跳步：' },
        {
          kind: 'ol',
          items: [
            R`**选参考地与标电位气泡**：选支路最多或接电源负端的节点作为参考地（$0\text{ V}$），给其余 $N-1$ 个非参考节点贴上[[e1_v1,e1_v2|复数电位气泡]] $\mathbf{V}_1, \mathbf{V}_2, \dots$。`,
            R`**检查是否有超节点（Supernode）**：若某独立或受控**电压源**接在两个非参考节点之间，像直流 ${code('W2-L2')} 一样把它们圈成一个**交流超节点**，同时写出电位差约束 $\mathbf{V}_a - \mathbf{V}_b = \mathbf{V}_s$；若无跨接电压源，则直接对各节点列 KCL。`,
            R`**处理受控源控制量**：把受控源的控制电压或控制电流（如 [[e1_ix|$\mathbf{I}_x$]]）立即用节点电压相量表达出来，代入 KCL 方程消元。`,
            R`**整理矩阵与复数求解**：化为标准复数线性方程组 $\mathbf{A}\mathbf{V} = \mathbf{b}$，用克莱姆法则或高斯消元求解，最后转极坐标并还原时域。`,
          ],
        },
        { kind: 'p', text: '**2.2 第 2 幕配图：交流节点法与复数电位气泡高亮图（经典例题 1）**' },
        {
          kind: 'p',
          text: R`**经典例题 1（含 $R, L, C$ 与电流控制电流源 CCCS）**：已知角频率 $\omega = 10\text{ rad/s}$，[[e1_is|独立电流源 $i_s(t) = 5\cos(10t)\text{ A}$]] 注入节点 1；节点 1 对地接[[e1_c|电容 $C = 25\text{ mF}$]]；节点 1 与节点 2 之间接[[e1_r1|电阻 $R_1 = 4\,\Omega$]]，定义向右流过 $R_1$ 的电流为[[e1_ix|控制量 $i_x(t)$]]；节点 2 对地并联[[e1_l|电感 $L = 0.2\text{ H}$]] 与[[e1_cccs|受控电流源 $2i_x(t)$]]（箭头向上注入节点 2）。求稳态节点电压 $v_1(t)$、$v_2(t)$ 与控制电流 $i_x(t)$。`,
        },
        { kind: 'figure', svg: SVG_ACT2, caption: '交流节点分析法与复数电位气泡高亮电路图' },
        { kind: 'p', text: '**2.3 教授三段式板书推导（经典例题 1：交流节点分析 + 受控源）**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`对频域相量电路中的非参考节点 1 与节点 2 分别应用相量形式基尔霍夫电流定律（流出电流之和等于流入电流之和），并结合欧姆定律相量形式 $\mathbf{I} = \mathbf{V}/\mathbf{Z}$：[[e1_v1|节点 1 KCL]]：流经电容支路与桥接电阻支路的流出电流之和等于独立源注入电流 $\mathbf{I}_s$；[[e1_v2|节点 2 KCL]]：流经桥接电阻支路（向左）与电感支路的流出电流之和等于受控电流源注入电流 $\alpha \mathbf{I}_x$；[[e1_ix|控制量约束]]：$\mathbf{I}_x = \frac{\mathbf{V}_1 - \mathbf{V}_2}{R_1}$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · 设受控源增益为 $\alpha$，对节点 1、2 列纯符号相量 KCL 方程：`,
          tex: R`\begin{gathered}\text{节点 1：}\quad \frac{\mathbf{V}_1}{\mathbf{Z}_C} + \frac{\mathbf{V}_1 - \mathbf{V}_2}{R_1} = \mathbf{I}_s\\ \text{节点 2：}\quad \frac{\mathbf{V}_2 - \mathbf{V}_1}{R_1} + \frac{\mathbf{V}_2}{\mathbf{Z}_L} = \alpha\mathbf{I}_x = \alpha\frac{\mathbf{V}_1 - \mathbf{V}_2}{R_1}\end{gathered}`,
        },
        {
          kind: 'formula',
          title: R`整理为复导纳标准矩阵方程 $\mathbf{A}\mathbf{V} = \mathbf{b}$：`,
          tex: R`\begin{bmatrix} \dfrac{1}{\mathbf{Z}_C} + \dfrac{1}{R_1} & -\dfrac{1}{R_1} \\[10pt] -\dfrac{1+\alpha}{R_1} & \dfrac{1+\alpha}{R_1} + \dfrac{1}{\mathbf{Z}_L} \end{bmatrix} \begin{bmatrix} \mathbf{V}_1 \\ \mathbf{V}_2 \end{bmatrix} = \begin{bmatrix} \mathbf{I}_s \\ 0 \end{bmatrix}`,
        },
        {
          kind: 'formula',
          title: R`记系数矩阵为 $\mathbf{A} = \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix}$，由克莱姆法则（Cramer's Rule）得纯符号解：`,
          tex: R`\Delta = a_{11}a_{22} - a_{12}a_{21},\qquad \mathbf{V}_1 = \frac{\mathbf{I}_s a_{22}}{\Delta},\qquad \mathbf{V}_2 = \frac{-\mathbf{I}_s a_{21}}{\Delta},\qquad \mathbf{I}_x = \frac{\mathbf{V}_1 - \mathbf{V}_2}{R_1}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`第一步：时域转频域相量与复阻抗（$\omega = 10\text{ rad/s}$）`,
              tex: R`\begin{gathered}\mathbf{I}_s = 5\angle 0^\circ = 5\text{ A},\qquad R_1 = 4\,\Omega,\qquad \alpha = 2\\ \mathbf{Z}_C = \frac{1}{j(10)(25\times 10^{-3})} = -j4\,\Omega,\qquad \mathbf{Z}_L = j(10)(0.2) = j2\,\Omega\end{gathered}`,
            },
            {
              label: '第二步：代入节点方程并通分去分母',
              text: R`（两边同乘 $4$ 使系数全为复整数，极大幅度降低手算出错率！）[[e1_v1|节点 1]]：$\left(\frac{1}{-j4} + \frac{1}{4}\right)\mathbf{V}_1 - \frac{1}{4}\mathbf{V}_2 = 5 \implies (1 + j1)\mathbf{V}_1 - \mathbf{V}_2 = 20$；[[e1_v2|节点 2]]：$-\frac{3}{4}\mathbf{V}_1 + \left(\frac{3}{4} + \frac{1}{j2}\right)\mathbf{V}_2 = 0 \implies -3\mathbf{V}_1 + (3 - j2)\mathbf{V}_2 = 0$。得到极其清爽的复整数矩阵方程：`,
              tex: R`\begin{bmatrix} 1 + j & -1 \\ -3 & 3 - j2 \end{bmatrix} \begin{bmatrix} \mathbf{V}_1 \\ \mathbf{V}_2 \end{bmatrix} = \begin{bmatrix} 20 \\ 0 \end{bmatrix}`,
            },
            {
              label: '第三步：复数行列式求解（直角坐标算加减，极坐标/共轭法算除法）',
              text: '主行列式（直角坐标展开）：',
              tex: R`\Delta = (1+j)(3-j2) - (-1)(-3) = (3 - j2 + j3 + 2) - 3 = 2 + j`,
            },
            {
              label: '主行列式的极坐标形式',
              text: R`其极坐标形式为 $\Delta = \sqrt{2^2+1^2}\angle\arctan(1/2) = \sqrt{5}\angle 26.57^\circ \approx 2.2361\angle 26.57^\circ$。`,
            },
            {
              label: R`分子行列式 $\Delta_1$ 与 $\Delta_2$`,
              tex: R`\begin{gathered}\Delta_1 = \begin{vmatrix} 20 & -1 \\ 0 & 3-j2 \end{vmatrix} = 60 - j40 \approx 72.1110\angle{-}33.69^\circ\\ \Delta_2 = \begin{vmatrix} 1+j & 20 \\ -3 & 0 \end{vmatrix} = 60 = 60\angle 0^\circ\end{gathered}`,
            },
            {
              label: R`求解 $\mathbf{V}_1$（展示两种等价坐标算法互相验算）`,
              text: '共轭分母实化法（适合精确解析值）：',
              tex: R`\begin{aligned}\mathbf{V}_1 &= \frac{60 - j40}{2 + j} = \frac{(60 - j40)(2 - j)}{2^2 + 1^2}\\ &= \frac{120 - j60 - j80 - 40}{5} = \frac{80 - j140}{5} = 16 - j28\text{ V}\end{aligned}`,
            },
            {
              label: R`求解 $\mathbf{V}_1$（续）`,
              text: '极坐标直接除法（适合工程计算器快速出模角）：',
              tex: R`\begin{aligned}\mathbf{V}_1 &= \frac{72.1110\angle{-}33.69^\circ}{2.2361\angle 26.57^\circ} = 32.25\angle (-33.69^\circ - 26.57^\circ)\\ &= 32.25\angle{-}60.26^\circ\text{ V}\end{aligned}`,
            },
            {
              label: R`求解 $\mathbf{V}_2$`,
              tex: R`\begin{aligned}\mathbf{V}_2 &= \frac{60}{2 + j} = \frac{60(2 - j)}{5} = 24 - j12\text{ V}\\ &= \frac{60\angle 0^\circ}{2.2361\angle 26.57^\circ} \approx 26.83\angle{-}26.57^\circ\text{ V}\end{aligned}`,
            },
            {
              label: R`求解控制电流 [[e1_ix|$\mathbf{I}_x$]]（注意此处是**减法**，必须用直角坐标！）`,
              tex: R`\begin{aligned}\mathbf{I}_x &= \frac{\mathbf{V}_1 - \mathbf{V}_2}{4} = \frac{(16 - j28) - (24 - j12)}{4}\\ &= \frac{-8 - j16}{4} = -2 - j4\text{ A} \approx 4.47\angle{-}116.57^\circ\text{ A}\end{aligned}`,
            },
            {
              label: '提醒',
              text: R`$-2 - j4$ 位于复平面第三象限，主值相角为 $-180^\circ + \arctan(4/2) = -116.57^\circ$，切忌直接按计算器 $\arctan(2) = 63.43^\circ$ 漏掉象限修正！`,
            },
            {
              label: '第四步：还原回时域正弦表达式与 Python 残差验算',
              tex: R`\begin{gathered}v_1(t) = 32.25\cos(10t - 60.26^\circ)\text{ V}\\ v_2(t) = 26.83\cos(10t - 26.57^\circ)\text{ V}\\ i_x(t) = 4.47\cos(10t - 116.57^\circ)\text{ A}\end{gathered}`,
            },
            {
              label: '[[e1_res|Python 残差验算]]',
              text: R`Python 交叉验算两节点 KCL 残差分别为 $8.88\times 10^{-16}\text{ A}$ 与 $1.99\times 10^{-15}\text{ A}$（均远小于 $10^{-12}$），精确无误。`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '交流超节点速览与网孔/超网孔分析法——经典例题精解',
      sync: at(L3, ['e2_super', 'e2_is'], { [P_MV]: 'mesh', [P_SUPER]: true }),
      blocks: [
        { kind: 'p', text: '**3.1 何时选网孔法？超节点与超网孔的对称美学**' },
        {
          kind: 'p',
          text: R`当平面电路的网孔数明显少于非参考节点数，或者电路中含有多个串联电压源时，**交流网孔分析法（AC Mesh Analysis）**比节点法更快。回顾 ${code('W2-L2/L3')}，直流里的两大特殊结构在复数域里完全对称：`,
        },
        {
          kind: 'ul',
          items: [
            R`**交流超节点（AC Supernode）**：当两个非参考节点 $a, b$ 之间直接跨接了一个交流电压源 $\mathbf{V}_s$（例如 $\mathbf{V}_a$ 接正极、$\mathbf{V}_b$ 接负极），我们把两节点与电压源整体圈作一个超节点，列 1 个外围 KCL 方程 + 1 个电位差约束 $\mathbf{V}_a - \mathbf{V}_b = \mathbf{V}_s$。`,
            R`[[e2_super|**交流超网孔（AC Supermesh）**]]：当两个相邻网孔（设为顺时针环流 [[e2_m1|$\mathbf{I}_1$]], [[e2_m2|$\mathbf{I}_2$]]）的**公共支路**上存在一个[[e2_is|交流电流源 $\mathbf{I}_s$]] 时，由于电流源两端电压未知，不能分别对两个小网孔列 KVL！我们必须**移开公共支路**，沿外围大环路列 1 个**超网孔 KVL 方程**，再补上公共支路的**电流差约束方程**（如 $\mathbf{I}_2 - \mathbf{I}_1 = \mathbf{I}_s$）。`,
          ],
        },
        { kind: 'p', text: '**3.2 第 3 幕配图：交流双网孔与超网孔高亮原理图（经典例题 2）**' },
        {
          kind: 'p',
          text: R`**经典例题 2（含 $R, L, C$ 与公共支路交流电流源的超网孔电路）**：已知角频率 $\omega = 5\text{ rad/s}$。左网孔含[[e2_vs|交流电压源 $v_s(t) = 20\cos(5t)\text{ V}$]]（上正下负）、[[e2_r1|电阻 $R_1 = 4\,\Omega$]]、[[e2_l|电感 $L = 0.4\text{ H}$]]；右网孔含[[e2_c|电容 $C = 50\text{ mF}$]]、[[e2_r2|电阻 $R_2 = 2\,\Omega$]]；左右两网孔的公共竖直支路上接有一个方向向上的[[e2_is|交流电流源 $i_s(t) = 4\sin(5t)\text{ A}$]]。求稳态网孔电流 $i_1(t)$ 与 $i_2(t)$。`,
        },
        { kind: 'figure', svg: SVG_ACT3, caption: '交流双网孔与超网孔复数方程求解原理图' },
        { kind: 'p', text: '**3.3 教授三段式板书推导（经典例题 2：交流超网孔 + 高斯消元与坐标切换）**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. 沿移除公共电流源支路后的[[e2_super|**超网孔外大环路**]]（顺时针方向），应用相量形式基尔霍夫电压定律（KVL）：环路电压降总和为零；2. 对[[e2_is|公共电流源支路]]应用相量形式基尔霍夫电流定律（KCL），建立两网孔电流 $\mathbf{I}_1, \mathbf{I}_2$ 与独立电流源 $\mathbf{I}_s$ 之间的电流差约束。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · 令网孔 1 外围串联复阻抗为 $\mathbf{Z}_1 = R_1 + \mathbf{Z}_L$，网孔 2 外围串联复阻抗为 $\mathbf{Z}_2 = \mathbf{Z}_C + R_2$。[[e2_super|**超网孔 KVL 方程**]]：`,
          tex: R`-\mathbf{V}_s + \mathbf{Z}_1 \mathbf{I}_1 + \mathbf{Z}_2 \mathbf{I}_2 = 0 \implies \mathbf{Z}_1 \mathbf{I}_1 + \mathbf{Z}_2 \mathbf{I}_2 = \mathbf{V}_s`,
        },
        {
          kind: 'formula',
          title: R`[[e2_is|**公共支路电流约束**]]（$\mathbf{I}_s$ 方向向上，与顺时针 $\mathbf{I}_2$ 同向、与顺时针 $\mathbf{I}_1$ 反向）：`,
          tex: R`\mathbf{I}_2 - \mathbf{I}_1 = \mathbf{I}_s \implies \mathbf{I}_2 = \mathbf{I}_1 + \mathbf{I}_s`,
        },
        {
          kind: 'formula',
          title: '将约束方程代入超网孔 KVL（复数高斯消元法），解得纯符号通式：',
          tex: R`\begin{gathered}\mathbf{Z}_1 \mathbf{I}_1 + \mathbf{Z}_2(\mathbf{I}_1 + \mathbf{I}_s) = \mathbf{V}_s \implies (\mathbf{Z}_1 + \mathbf{Z}_2)\mathbf{I}_1 = \mathbf{V}_s - \mathbf{Z}_2\mathbf{I}_s\\ \mathbf{I}_1 = \frac{\mathbf{V}_s - \mathbf{Z}_2\mathbf{I}_s}{\mathbf{Z}_1 + \mathbf{Z}_2},\qquad \mathbf{I}_2 = \mathbf{I}_1 + \mathbf{I}_s\end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`第一步：时域转频域相量与复阻抗（$\omega = 5\text{ rad/s}$）`,
              text: R`电压源：$\mathbf{V}_s = 20\angle 0^\circ = 20\text{ V}$；电流源（**注意正弦转余弦！**）：$i_s(t) = 4\sin(5t) = 4\cos(5t - 90^\circ)\text{ A} \implies \mathbf{I}_s = 4\angle{-}90^\circ = -j4\text{ A}$；复阻抗：`,
              tex: R`\begin{gathered}\mathbf{Z}_L = j(5)(0.4) = j2\,\Omega \implies \mathbf{Z}_1 = 4 + j2\,\Omega\\ \mathbf{Z}_C = \frac{1}{j(5)(0.05)} = -j4\,\Omega \implies \mathbf{Z}_2 = 2 - j4\,\Omega\end{gathered}`,
            },
            {
              label: '第二步：用直角坐标做加减与分子化简',
              text: '分母总阻抗：',
              tex: R`\mathbf{Z}_1 + \mathbf{Z}_2 = (4 + j2) + (2 - j4) = 6 - j2\,\Omega`,
            },
            {
              label: R`分子项 $\mathbf{Z}_2\mathbf{I}_s$ 与 $\mathbf{V}_s - \mathbf{Z}_2\mathbf{I}_s$`,
              tex: R`\begin{gathered}\mathbf{Z}_2\mathbf{I}_s = (2 - j4)(-j4) = -j8 + j^2(16) = -16 - j8\text{ V}\\ \mathbf{V}_s - \mathbf{Z}_2\mathbf{I}_s = 20 - (-16 - j8) = 36 + j8\text{ V}\end{gathered}`,
            },
            {
              label: R`第三步：求解 [[e2_m1|$\mathbf{I}_1$]]（极坐标法 vs 共轭实化法双验证）`,
              text: '共轭分母实化法：',
              tex: R`\begin{aligned}\mathbf{I}_1 &= \frac{36 + j8}{6 - j2} = \frac{18 + j4}{3 - j1} = \frac{(18 + j4)(3 + j1)}{3^2 + 1^2}\\ &= \frac{54 + j18 + j12 - 4}{10} = \frac{50 + j30}{10} = 5 + j3\text{ A}\end{aligned}`,
            },
            {
              label: R`求解 $\mathbf{I}_1$（续）`,
              text: '极坐标直接除法（快速核对模值与相角）：',
              tex: R`\begin{gathered}36 + j8 \approx 36.8782\angle 12.53^\circ,\qquad 6 - j2 \approx 6.3246\angle{-}18.43^\circ\\ \mathbf{I}_1 = \frac{36.8782\angle 12.53^\circ}{6.3246\angle{-}18.43^\circ} \approx 5.83\angle (12.53^\circ - (-18.43^\circ)) = 5.83\angle 30.96^\circ\text{ A}\end{gathered}`,
            },
            {
              label: R`第四步：用直角坐标求 [[e2_m2|$\mathbf{I}_2$]] 并转极坐标`,
              tex: R`\mathbf{I}_2 = \mathbf{I}_1 + \mathbf{I}_s = (5 + j3) + (-j4) = 5 - j1\text{ A} \approx 5.10\angle{-}11.31^\circ\text{ A}`,
            },
            {
              label: '第五步：还原回时域正弦表达式与 Python 残差验算',
              tex: R`\begin{gathered}i_1(t) = 5.83\cos(5t + 30.96^\circ)\text{ A}\\ i_2(t) = 5.10\cos(5t - 11.31^\circ)\text{ A}\end{gathered}`,
            },
            {
              label: '[[e2_cramer|Python 残差验算]]',
              text: R`Python 交叉验算超网孔 KVL 残差 $|-\mathbf{V}_s + \mathbf{Z}_1\mathbf{I}_1 + \mathbf{Z}_2\mathbf{I}_2| = 0.00\text{ V}$，电流约束残差 $|(\mathbf{I}_2 - \mathbf{I}_1) - \mathbf{I}_s| = 0.00\text{ A}$（均 $< 10^{-12}$）。`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '苏格拉底式分步交互实战（5 步完整求解并还原时域）',
      sync: at(L2, ['g_v1', 'g_v2'], { [P_NC]: 'guided', [P_VIEW2]: 'circuit', [P_NODE]: 0 }),
      blocks: [
        {
          kind: 'guided',
          title: '两节点交流 RLC 电路完整相量节点求解与时域还原',
          problem: R`**实战背景**：现在轮到你亲自上板！下方是一道经典的**两节点交流 RLC 电路**（$\omega = 100\text{ rad/s}$）：[[g_is|独立电流源 $i_s(t) = 6\sin(100t)\text{ A}$]] 注入节点 1；节点 1 对地接 [[g_r1|$R_1 = 10\,\Omega$]]；节点 1 与节点 2 之间跨接[[g_c|电容 $C = 1\text{ mF}$]]；节点 2 对地并联[[g_r2|电阻 $R_2 = 10\,\Omega$]] 与[[g_l|电感 $L = 0.1\text{ H}$]]。请跟着教授的 5 步苏格拉底追问，完整求出 [[g_v1|$v_1(t)$]] 与 [[g_v2|$v_2(t)$]]！`,
          problem_svg: SVG_ACT4,
          steps: [
            {
              title: '第一步：时域转频域相量与复阻抗',
              mini_svg: MINI_STEP1,
              question: R`已知 $\omega = 100\text{ rad/s}$，电源 $i_s(t) = 6\sin(100t)\text{ A}$，电容 $C = 1\text{ mF}$，电感 $L = 0.1\text{ H}$。转换到以余弦为基准的频域相量电路后，$\mathbf{I}_s$、$\mathbf{Z}_C$、$\mathbf{Z}_L$ 分别是多少？`,
              hint: R`$\sin(\omega t) = \cos(\omega t - 90^\circ),\quad \mathbf{Z}_C = \frac{1}{j(100)(10^{-3})},\quad \mathbf{Z}_L = j(100)(0.1)$`,
              options: [
                {
                  text: R`$\mathbf{I}_s = 6\angle 0^\circ\text{ A}$，$\mathbf{Z}_C = -j10\,\Omega$，$\mathbf{Z}_L = j10\,\Omega$`,
                  correct: false,
                  feedback: R`停一下！看到 $\sin(100t)$ 千万别直接写成 $6\angle 0^\circ$！我们约定余弦 $\cos$ 为 $0^\circ$ 参考基准，因为 $\sin(\omega t) = \cos(\omega t - 90^\circ)$，所以它的相量是 $6\angle{-}90^\circ = -j6\text{ A}$。同时牢记：电感感抗为正虚数 $+j\omega L = j10\,\Omega$，电容容抗为负虚数 $1/(j\omega C) = -j10\,\Omega$。`,
                },
                {
                  text: R`$\mathbf{I}_s = -j6\text{ A}$（即 $6\angle{-}90^\circ\text{ A}$），$\mathbf{Z}_C = -j10\,\Omega$，$\mathbf{Z}_L = j10\,\Omega$`,
                  correct: true,
                  feedback: R`完全正确！$\sin(100t) = \cos(100t - 90^\circ)$，所以 $\mathbf{I}_s = 6\angle{-}90^\circ = -j6\text{ A}$；$\mathbf{Z}_L = j(100)(0.1) = j10\,\Omega$，$\mathbf{Z}_C = \frac{1}{j(100)(10^{-3})} = -j10\,\Omega$。`,
                },
                {
                  text: R`$\mathbf{I}_s = j6\text{ A}$（即 $6\angle 90^\circ\text{ A}$），$\mathbf{Z}_C = j10\,\Omega$，$\mathbf{Z}_L = -j10\,\Omega$`,
                  correct: false,
                  feedback: R`三处符号全反了！$\sin(\omega t) = \cos(\omega t - 90^\circ)$ 是**滞后** $90^\circ$，相量是 $6\angle{-}90^\circ$，不是 $6\angle 90^\circ$；而且电感才是正虚数 $+j\omega L$，电容是负虚数 $\frac{1}{j\omega C} = -\frac{j}{\omega C}$，别把两者对调。`,
                },
              ],
              board: [R`\mathbf{I}_s = -j6\text{ A},\quad R_1 = R_2 = 10\,\Omega,`, R`\mathbf{Z}_C = -j10\,\Omega,\quad \mathbf{Z}_L = j10\,\Omega`],
              halo: ['g_is', 'g_c', 'g_l'],
              params: G(0),
              layer: L2,
            },
            {
              title: '第二步：对节点 1 与节点 2 列写复数 KCL 方程',
              mini_svg: MINI_STEP2,
              question: R`将 $R_1 = 10\,\Omega$、$\mathbf{Z}_C = -j10\,\Omega$、$R_2 = 10\,\Omega$、$\mathbf{Z}_L = j10\,\Omega$ 代入两节点的 KCL 方程（两边同乘 $10$ 消去分母），得到的标准复数方程组是哪一组？`,
              hint: R`$\text{节点 1: } \frac{\mathbf{V}_1}{10} + \frac{\mathbf{V}_1 - \mathbf{V}_2}{-j10} = -j6;\quad \text{节点 2: } \frac{\mathbf{V}_2 - \mathbf{V}_1}{-j10} + \frac{\mathbf{V}_2}{10} + \frac{\mathbf{V}_2}{j10} = 0$`,
              options: [
                {
                  text: R`节点 1：$(1+j)\mathbf{V}_1 - j\mathbf{V}_2 = -j60$；节点 2：$-j\mathbf{V}_1 + \mathbf{V}_2 = 0$`,
                  correct: true,
                  feedback: R`漂亮！$\frac{1}{-j10} = +j0.1\text{ S}$：节点 1 乘 $10$ 后是 $\mathbf{V}_1 + j(\mathbf{V}_1 - \mathbf{V}_2) = -j60$；节点 2 处电容导纳 $+j0.1\text{ S}$ 与电感导纳 $-j0.1\text{ S}$ 正好抵消，自导纳只剩 $0.1\text{ S}$。`,
                },
                {
                  text: R`节点 1：$(1-j)\mathbf{V}_1 + j\mathbf{V}_2 = -j60$；节点 2：$j\mathbf{V}_1 + (1-j2)\mathbf{V}_2 = 0$`,
                  correct: false,
                  feedback: R`小心虚数倒数的符号！$1/(-j) = +j$，而 $1/(+j) = -j$。在节点 2 处，电容导纳 $+j0.1\text{ S}$ 与电感导纳 $-j0.1\text{ S}$ 刚好完全抵消！所以节点 2 的自导纳只剩下纯电阻的 $0.1\text{ S}$，方程瞬间化简为 $-j\mathbf{V}_1 + \mathbf{V}_2 = 0$！`,
                },
                {
                  text: R`节点 1：$(1+j)\mathbf{V}_1 - j\mathbf{V}_2 = 60$；节点 2：$-j\mathbf{V}_1 + (1+j2)\mathbf{V}_2 = 0$`,
                  correct: false,
                  feedback: R`两处出错：节点 1 右边的电源相量是 $\mathbf{I}_s = -j6\text{ A}$，乘 $10$ 得 $-j60$，不是 $60$（那是把 $\sin$ 当成了 $0^\circ$）；节点 2 里电感的导纳是 $\frac{1}{j10} = -j0.1\text{ S}$，不是 $+j0.1\text{ S}$，它要和电容的 $+j0.1\text{ S}$ 相消，而不是相加成 $+j0.2$。`,
                },
              ],
              board: [R`\begin{cases} (1 + j)\mathbf{V}_1 - j\mathbf{V}_2 = -j60 \\ -j\mathbf{V}_1 + \mathbf{V}_2 = 0 \end{cases}`],
              halo: ['g_v1', 'g_v2'],
              params: G(1),
              layer: L2,
            },
            {
              title: '第三步：利用节点 2 关系消元求主系数',
              mini_svg: MINI_STEP3,
              question: R`由节点 2 方程直接得到 $\mathbf{V}_2 = j\mathbf{V}_1$。将其代入节点 1 方程 $(1+j)\mathbf{V}_1 - j\mathbf{V}_2 = -j60$ 后，化简得到的关于 $\mathbf{V}_1$ 的一元复数方程是什么？`,
              hint: R`$-j(\mathbf{V}_2) = -j(j\mathbf{V}_1) = -j^2\mathbf{V}_1$，而 $j^2 = -1$`,
              options: [
                {
                  text: R`$j\mathbf{V}_1 = -j60$`,
                  correct: false,
                  feedback: R`符号翻车了！你把 $-j(j\mathbf{V}_1)$ 算成了 $-\mathbf{V}_1$，于是 $(1+j)\mathbf{V}_1 - \mathbf{V}_1$ 只剩 $j\mathbf{V}_1$。可 $-j \cdot j = -j^2 = +1$：这一项是 $+\mathbf{V}_1$，要和 $(1+j)\mathbf{V}_1$ 相加，实部变成 $2$。`,
                },
                {
                  text: R`$(1 + j2)\mathbf{V}_1 = -j60$`,
                  correct: false,
                  feedback: R`别被连乘的两个 $j$ 绕晕了！$j \times j = -1$，所以 $-j(j\mathbf{V}_1) = -(-1)\mathbf{V}_1 = +\mathbf{V}_1$。加上前面的 $(1+j)\mathbf{V}_1$，实部 $1+1=2$，虚部保持 $+j$，合起来就是 $(2+j)\mathbf{V}_1 = -j60$。`,
                },
                {
                  text: R`$(2 + j)\mathbf{V}_1 = -j60$`,
                  correct: true,
                  feedback: R`对！$-j(j\mathbf{V}_1) = -j^2\mathbf{V}_1 = +\mathbf{V}_1$，与 $(1+j)\mathbf{V}_1$ 合并：实部 $1 + 1 = 2$，虚部保持 $+j$。直角坐标里做加减，一步到位。`,
                },
              ],
              board: [R`\mathbf{V}_2 = j\mathbf{V}_1 \implies (2 + j)\mathbf{V}_1 = -j60`],
              halo: ['g_v1', 'g_v2'],
              params: G(2),
              layer: L2,
            },
            {
              title: R`第四步：求解复数相量 $\mathbf{V}_1$ 与 $\mathbf{V}_2$（直角与极坐标互验）`,
              mini_svg: MINI_STEP4,
              question: R`解方程 $(2+j)\mathbf{V}_1 = -j60$ 并由 $\mathbf{V}_2 = j\mathbf{V}_1$ 求 $\mathbf{V}_2$，正确的直角坐标与极坐标结果是？`,
              hint: R`$\mathbf{V}_1 = \frac{-j60}{2+j} = \frac{-j60(2-j)}{(2+j)(2-j)} = \frac{-j60(2-j)}{5},\quad \mathbf{V}_2 = j\mathbf{V}_1$`,
              options: [
                {
                  text: R`$\mathbf{V}_1 = -12 - j24\text{ V} = 26.83\angle{-}116.57^\circ\text{ V}$；$\mathbf{V}_2 = 24 - j12\text{ V} = 26.83\angle{-}26.57^\circ\text{ V}$`,
                  correct: true,
                  feedback: R`完全正确！$-j60(2-j) = -j120 + j^2(60) = -60 - j120$，除以 $5$ 得 $\mathbf{V}_1 = -12 - j24\text{ V}$，第三象限：$-180^\circ + 63.43^\circ = -116.57^\circ$；乘以 $j$ 逆时针转 $90^\circ$，$\mathbf{V}_2 = 24 - j12\text{ V}$，第四象限 $-26.57^\circ$。`,
                },
                {
                  text: R`$\mathbf{V}_1 = 12 - j24\text{ V} = 26.83\angle{-}63.43^\circ\text{ V}$；$\mathbf{V}_2 = 24 + j12\text{ V} = 26.83\angle 26.57^\circ\text{ V}$`,
                  correct: false,
                  feedback: R`看清楚分子分母共轭相乘的符号！$-j60(2-j) = -j120 + j^2(60) = -60 - j120$，除以 $2^2+1^2=5$ 得到 $\mathbf{V}_1 = -12 - j24\text{ V}$（第三象限，相角 $-116.57^\circ$）。再乘以 $j$（相当于逆时针旋转 $+90^\circ$），得到 $\mathbf{V}_2 = 24 - j12\text{ V}$（第四象限，相角 $-26.57^\circ$）！`,
                },
                {
                  text: R`$\mathbf{V}_1 = -12 + j24\text{ V} = 26.83\angle 116.57^\circ\text{ V}$；$\mathbf{V}_2 = -24 - j12\text{ V} = 26.83\angle{-}153.43^\circ\text{ V}$`,
                  correct: false,
                  feedback: R`你的 $\mathbf{V}_1$ 恰好是正确值的共轭：虚部符号反了，相角从负变成了正。右边是 $-j60$（$\sin$ 滞后 $90^\circ$），分母 $2 + j$ 的相角又是正的，商的相角必然为负：$-90^\circ - 26.57^\circ$。这一错，$\mathbf{V}_2 = j\mathbf{V}_1$ 也被带到了第三象限。`,
                },
              ],
              board: [
                R`\mathbf{V}_1 = -12 - j24\text{ V} \approx 26.83\angle{-}116.57^\circ\text{ V},`,
                R`\mathbf{V}_2 = 24 - j12\text{ V} \approx 26.83\angle{-}26.57^\circ\text{ V}`,
              ],
              halo: ['g_v1', 'g_v2'],
              params: G(3),
              layer: L2,
            },
            {
              title: '第五步：还原时域正弦表达式与物理洞察',
              mini_svg: MINI_STEP5,
              question: R`将相量 $\mathbf{V}_1$、$\mathbf{V}_2$ 还原回时域正弦电压表达式，以下哪一项完全正确？`,
              hint: R`$v(t) = \operatorname{Re}\{M\angle\theta \cdot e^{j\omega t}\} = M\cos(\omega t + \theta)$`,
              options: [
                {
                  text: R`$v_1(t) = 26.83\sin(100t - 116.57^\circ)\text{ V}$，$v_2(t) = 26.83\sin(100t - 26.57^\circ)\text{ V}$`,
                  correct: false,
                  feedback: R`功亏一篑最可惜！我们在第一步把电源统一转成了余弦（$\cos$）基准，所以还原时域时必须写 $\cos(100t + \theta)$，不能写回 $\sin$！`,
                },
                {
                  text: R`$v_1(t) = 26.83\cos(100t - 116.57^\circ)\text{ V}$，$v_2(t) = 26.83\cos(100t - 26.57^\circ)\text{ V}$`,
                  correct: true,
                  feedback: R`通关！余弦基准进、余弦基准出：两个电压振幅相同（$26.83\text{ V}$），$v_2(t)$ 严格超前 $v_1(t)$ $90^\circ$——这正是 $\mathbf{V}_2 = j\mathbf{V}_1$ 在时域里的样子。`,
                },
                {
                  text: R`$v_1(t) = 26.83\cos(10t - 116.57^\circ)\text{ V}$，$v_2(t) = 26.83\cos(10t - 26.57^\circ)\text{ V}$`,
                  correct: false,
                  feedback: R`千万别抄错角频率 $\omega = 100\text{ rad/s}$！相量只记下了模值和相角，频率要你在还原时亲手写回去：本题是 $\cos(100t + \theta)$，$10t$ 是第 2 幕例题 1 的频率。`,
                },
              ],
              board: [R`v_1(t) = 26.83\cos(100t - 116.57^\circ)\text{ V},`, R`v_2(t) = 26.83\cos(100t - 26.57^\circ)\text{ V}\quad (\text{KCL 残差} < 10^{-15})`],
              halo: ['g_v1', 'g_v2'],
              params: G(4),
              layer: L2,
            },
          ],
          done_params: { [P_G]: 5 },
          conclusion: R`通关！$v_1(t) = 26.83\cos(100t - 116.57^\circ)\text{ V}$，$v_2(t) = 26.83\cos(100t - 26.57^\circ)\text{ V}$。左侧 02 层上引导例题的数值已经揭晓：切到“相量图”，看 $\mathbf{V}_2 = j\mathbf{V}_1$ 怎样把 $\mathbf{V}_1$ 逆时针转 $90^\circ$、模值不变。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '同频红线避坑与诊断测验',
      sync: at(L3, ['trap_guard'], { [P_MV]: 'trap', [P_TRAP]: 'diff' }),
      blocks: [
        { kind: 'p', text: '**5.1 第 5 幕配图：单频合法相量电路 vs 双频陷阱电路对照图**' },
        { kind: 'figure', svg: SVG_ACT5, caption: '单频合法相量电路与双频陷阱电路对照决策图' },
        { kind: 'p', text: '**5.2 诊断测验（4 题）**' },
      ],
      quiz: [
        {
          id: 'w5l3_q1',
          concept: '时域转频域与容抗符号',
          review_act: 1,
          question: R`某交流电路角频率 $\omega = 200\text{ rad/s}$，其中包含电压源 $v_s(t) = 12\sin(200t + 30^\circ)\text{ V}$ 与电容 $C = 250\ \mu\text{F}$。将其转换到以余弦为基准的频域相量电路后，$\mathbf{V}_s$ 与 $\mathbf{Z}_C$ 分别为：`,
          options: [
            {
              key: 'A',
              text: R`$\mathbf{V}_s = 12\angle 30^\circ\text{ V}$，$\mathbf{Z}_C = -j20\,\Omega$`,
              correct: false,
              feedback: R`容抗对了，相角没换基准：$12\angle 30^\circ$ 是把 $\sin$ 直接当成了 $\cos$。以余弦为基准，正弦要先减 $90^\circ$：$\sin(200t + 30^\circ) = \cos(200t + 30^\circ - 90^\circ)$。`,
            },
            {
              key: 'B',
              text: R`$\mathbf{V}_s = 12\angle 120^\circ\text{ V}$，$\mathbf{Z}_C = j20\,\Omega$`,
              correct: false,
              feedback: R`两个方向都反了：$\sin$ 转 $\cos$ 是减 $90^\circ$ 而不是加 $90^\circ$；电容的复阻抗 $\frac{1}{j\omega C}$ 是负虚数，$+j20\,\Omega$ 是电感那一侧的符号。`,
            },
            { key: 'C', text: R`$\mathbf{V}_s = 12\angle{-}60^\circ\text{ V}$，$\mathbf{Z}_C = -j20\,\Omega$`, correct: true },
            {
              key: 'D',
              text: R`$\mathbf{V}_s = 12\angle{-}60^\circ\text{ V}$，$\mathbf{Z}_C = -j0.05\,\Omega$`,
              correct: false,
              feedback: R`相量对了，可 $0.05$ 是 $\omega C = 200 \times 250\times 10^{-6}$，它属于导纳 $j\omega C = j0.05\text{ S}$；复阻抗还要取倒数：$\frac{1}{j0.05} = -j20\,\Omega$。`,
            },
          ],
          feedback_correct: R`$\sin(200t + 30^\circ) = \cos(200t + 30^\circ - 90^\circ) = \cos(200t - 60^\circ)$，故 $\mathbf{V}_s = 12\angle{-}60^\circ\text{ V}$；容抗 $\mathbf{Z}_C = 1/(j \times 200 \times 250\times 10^{-6}) = 1/(j0.05) = -j20\,\Omega$。`,
          feedback_wrong: '回到第 1 幕三步法的第一步：先把电源统一成余弦基准，再按 1/(jωC) 写电容的复阻抗。',
          figure: SVG_Q1,
          sync: at(L1, ['a1_c', 'a1_is'], { [P_DOM]: 'phasor', [P_F2]: false }),
        },
        {
          id: 'w5l3_q2',
          concept: '同频红线',
          review_act: 1,
          question: R`一个线性 RLC 电路同时由独立电压源 $v_1(t) = 10\cos(100t)\text{ V}$ 和直流电源 $V_2 = 5\text{ V}$（即 $\omega = 0$）激励。以下关于节点分析法的做法正确的是：`,
          options: [
            {
              key: 'A',
              text: R`不能画在同一张相量电路图上直接求解，必须使用叠加定理：在 $\omega = 100\text{ rad/s}$ 下用相量法求解，在 $\omega = 0$ 下用直流稳态（电感短路、电容开路）求解，最后在时域相加`,
              correct: true,
            },
            {
              key: 'B',
              text: R`直接将 $\omega = 100\text{ rad/s}$ 代入所有电感电容，同时保留 $10\angle 0^\circ\text{ V}$ 与 $5\angle 0^\circ\text{ V}$ 列一个复数节点方程组`,
              correct: false,
              feedback: R`直流电源对应 $\omega = 0$：在它眼里电感是短路、电容是开路。用 $\omega = 100\text{ rad/s}$ 的 $j\omega L$、$\frac{1}{j\omega C}$ 去描述它，阻抗就错了，两个频率的 $e^{j\omega t}$ 也约不掉。`,
            },
            {
              key: 'C',
              text: R`把直流电源写成 $5\angle 90^\circ\text{ V}$ 即可合并到 $\omega = 100\text{ rad/s}$ 的相量电路中`,
              correct: false,
              feedback: R`给直流电源配一个相角改变不了它的频率：直流是 $\omega = 0$，不随 $e^{j100t}$ 旋转，写成 $5\angle 90^\circ$ 反而把它变成了一个 $100\text{ rad/s}$ 的正弦源。`,
            },
            {
              key: 'D',
              text: R`用两频率平均值 $\omega = 50\text{ rad/s}$ 计算复阻抗后再列网孔方程`,
              correct: false,
              feedback: R`不存在“平均频率”：电感电容的阻抗在 $\omega = 0$ 和 $\omega = 100\text{ rad/s}$ 下各是一个确定的值，用 $\omega = 50\text{ rad/s}$ 算出来的阻抗对两个电源都不对。`,
            },
          ],
          feedback_correct: R`直流对应 $\omega = 0$，与 $\omega = 100\text{ rad/s}$ 属于不同频率！电感与电容在两个频率下的复阻抗完全不同，严禁合并到单张相量图，必须留给 W5-L4 叠加定理分频求解并在时域叠加。`,
          feedback_wrong: '先检查同频红线：两个电源的角频率一样吗？',
          figure: SVG_Q2,
          sync: at(L3, ['trap_guard', 'trap_v2'], { [P_MV]: 'trap', [P_TRAP]: 'dc' }),
        },
        {
          id: 'w5l3_q3',
          concept: '交流超节点约束',
          review_act: 3,
          question: R`在交流频域电路中，两个非参考节点 $\mathbf{V}_1$ 与 $\mathbf{V}_2$ 之间直接跨接了一个相量电压源 $\mathbf{V}_s = 10\angle 90^\circ\text{ V}$（正极接节点 1，负极接节点 2）。在采用节点分析法时，除了对由 $\mathbf{V}_1$、$\mathbf{V}_2$ 组成的超节点列写外围复数 KCL 方程外，还必须补充的约束方程是：`,
          options: [
            {
              key: 'A',
              text: R`$\mathbf{V}_1 + \mathbf{V}_2 = j10$`,
              correct: false,
              feedback: '电压源约束的是两端的电位差，不是电位之和：正极节点电位减去负极节点电位，等于电源相量。',
            },
            {
              key: 'B',
              text: R`$\mathbf{V}_2 - \mathbf{V}_1 = j10$`,
              correct: false,
              feedback: R`方向反了：正极接节点 1、负极接节点 2，约束是正极减负极；$\mathbf{V}_2 - \mathbf{V}_1 = j10$ 描述的是正极接在节点 2 的电源。`,
            },
            {
              key: 'C',
              text: R`$\mathbf{V}_1 / \mathbf{V}_2 = j10$`,
              correct: false,
              feedback: R`电压源给出的是两节点电位的差（KVL 是加减关系），不是比值：$\mathbf{V}_1/\mathbf{V}_2$ 与电源相量之间没有这样的约束。`,
            },
            { key: 'D', text: R`$\mathbf{V}_1 - \mathbf{V}_2 = j10$`, correct: true },
          ],
          feedback_correct: R`与直流超节点（W2-L2）完全同构：正极电位减去负极电位等于电压源相量值，即 $\mathbf{V}_1 - \mathbf{V}_2 = 10\angle 90^\circ = j10\text{ V}$。`,
          feedback_wrong: '回想直流超节点（W2-L2）：跨接电压源两端的电位差约束怎么写？',
          figure: SVG_Q3,
          sync: at(L2, ['e1_v1', 'e1_v2'], { [P_NC]: 'ex1', [P_VIEW2]: 'circuit' }),
        },
        {
          id: 'w5l3_q4',
          concept: '复数运算坐标切换',
          review_act: 3,
          question: R`在求解交流双网孔电路时，已列得 $(4 + j2)\mathbf{I}_1 + (2 - j4)\mathbf{I}_2 = 20$ 且公共支路电流约束为 $\mathbf{I}_2 - \mathbf{I}_1 = -j4$。为了最大程度减少手算出错率，下列运算坐标切换策略最合理的是：`,
          options: [
            {
              key: 'A',
              text: '全程使用极坐标进行加减消元，最后再转直角坐标',
              correct: false,
              feedback: R`极坐标下没法直接加减：两个 $M\angle\theta$ 相加，模值并不是模值之和，必须先拆回实部、虚部才能合并。全程极坐标消元只会让手算更容易错。`,
            },
            {
              key: 'B',
              text: R`先在直角坐标下代入消元并合并实部、虚部，化简出单一分式 $(36 + j8)/(6 - j2)$ 后，再转为极坐标做除法（或乘分母共轭）`,
              correct: true,
            },
            {
              key: 'C',
              text: R`直接把实部和虚部分开各自列实数方程组，忽略交叉项 $j^2 = -1$`,
              correct: false,
              feedback: R`交叉项绝不能丢：$(2 - j4)(-j4)$ 里正是 $j \cdot j = -1$ 产生了实部 $-16$。忽略 $j^2 = -1$，实部和虚部就全乱了。`,
            },
            {
              key: 'D',
              text: '先把所有复阻抗取模值变成实数电阻，算出电流模值后再单独算相角',
              correct: false,
              feedback: R`复阻抗取模值就丢掉了相位：$|4 + j2| + |2 - j4| \approx 8.94$，而 $|(4+j2) + (2-j4)| = |6 - j2| \approx 6.32$，模值和相角都没法这样分开算。`,
            },
          ],
          feedback_correct: R`复数加减必须在直角坐标（$a + jb$）下对齐实部与虚部进行；复数乘除则在极坐标（$M\angle\theta$）下模值相乘除、相角相加减最快且最不易出错。`,
          feedback_wrong: '想一想：哪种坐标下加减方便，哪种坐标下乘除方便？',
          figure: SVG_Q4,
          sync: at(L3, ['e2_cramer'], { [P_MV]: 'mesh' }),
        },
      ],
      after_quiz: [
        {
          kind: 'p',
          text: R`**下节预告（W5-L4）**：多频率电路不能画在同一张相量图上——下一讲用**叠加定理**逐个频率单独建相量模型，最后还原到时域再相加；再把电源变换、交流戴维南等效与运放电路一起搬进复数域。`,
        },
      ],
    },
  ],
};

export default W5_L3;
