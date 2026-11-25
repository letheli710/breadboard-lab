// W4-L6 · 二阶电路初值与终值确定（t=0⁻, 0⁺, ∞ 三时刻等效替换法） (lesson sheet: docs/lessons/W4-L6.md).
// Type B, pure 2D: no three.js anywhere in this folder (lesson.test.ts checks it). The professor's
// opening and the text of the five acts, the act diagrams (svgs.ts), the guided example and the
// diagnostic quiz are reproduced from the sheet; [[id|…]] only links a term to the stage (the words
// are unchanged). Changes from the sheet, of form:
// - display formulas sit in ② / ③ cards (a lead-in sentence becomes the card's title); the given
//   values of acts 3 and 4 run inline in their sentence; the numbered ① items run as one paragraph;
//   the sub-bullets of a ③ are numbered steps; the sub-headings (1.1, 2.1, 3.3 …) are bold lines;
//   the professor's opening is the first paragraph of act 1;
// - the act 3 and act 4 diagrams stand where the sheet has them (after the problem), acts 1 and 2
//   end with theirs; act 5's circuit is the guided example's problem diagram;
// - plain-text symbols of the guided-example and quiz JSON (i_L(0⁺), dv_C(0⁺)/dt …) are set as TeX;
//   the guided steps had no options: each gets three — the sheet's expected answer (praise), the
//   mistake its professor_intercept corrects (that intercept), and one more plausible mistake with
//   its own intercept (where the sheet gives two intercepts, both are used); the right answer moves
//   between positions; each step's board TeX is written as two lines (split at its comma, so it
//   fits a phone); the quiz options are reordered so the right answer is not B three times;
// - anti-spoiler: the guided example is its own problem (no act works it), so no ③ moves; its step
//   2–4 diagrams lost what gave the answer away (svgs.ts), and its numbers on the stage stay covered
//   while it runs (stage param w46_g = steps solved; done_params uncovers them);
// - left out (build instructions, not lesson text): 「（可复制 2D SVG）」 in the figure headings, the
//   heading of the guided-example JSON, the quiz's passing score (the site uses 4/4), the
//   「Claude 工程落地清单」 and its mention in act 5's title.
// Added (the sheet has none): the hover map; the stage's waveform view; praise for right options and
// the guided example's conclusion; per-option quiz feedback written from the explanations; the
// quiz figures (figures.ts).

import { lazy } from 'react';
import type { StageLesson, StageSync } from '../../types';
import { SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './figures';
import type { Preset } from './model';
import { L1, L2, L3, P_GUIDED, P_PRESET, P_VIEW, type View } from './parts';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5 } from './svgs';

const Layer01 = lazy(() => import('./SnapLayer').then((m) => ({ default: m.Layer01 })));
const Layer02 = lazy(() => import('./SnapLayer').then((m) => ({ default: m.Layer02 })));
const Layer03 = lazy(() => import('./SnapLayer').then((m) => ({ default: m.Layer03 })));

const R = String.raw;
/** inline `code` inside a String.raw text */
const code = (s: string) => `\`${s}\``;

const stage = (preset: Preset, view: View = 'circuit') => ({ [P_PRESET]: preset, [P_VIEW]: view });
const at = (layer: string, halo: string[], preset: Preset, view: View = 'circuit'): StageSync => ({ layer, halo, params: stage(preset, view) });
/** a guided step's stage: the guided circuit, `solved` steps uncovered */
const G = (solved: number) => ({ ...stage('guided'), [P_GUIDED]: solved });

const W4_L6: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Layer01, [L2]: Layer02, [L3]: Layer03 },
  lesson_meta: {
    lesson_id: 'W4-L6',
    world: 'World 4',
    title: '二阶电路初值与终值确定（t=0⁻, 0⁺, ∞ 三时刻等效替换法）',
    subtitle: '在解二阶微分方程之前，用三张电路快照锁死全部 6 个边界条件',
    lesson_type: 'B',
    lesson_type_label: '纯公式 / 方法论课（无 3D 面包板，2D 三层等效替换舞台）',
    estimated_minutes: 35,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Section 8.1–8.2: Finding Initial and Final Values'],
    },
    prerequisites: ['W2-L1 节点分析法（Nodal Analysis）', 'W4-L1 电容伏安特性与储能连续性', 'W4-L2 电感伏安特性与储能连续性'],
    next_lesson: 'W4-L7',
    next_lesson_title: '无源串联/并联 RLC 自然响应（特征方程与三种阻尼状态）',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 t=0⁻ 稳态拍照 (C开路/L短路)',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '直流稳态下 dv_C/dt = 0 ⇒ i_C(0⁻) = 0（电容换开路）；di_L/dt = 0 ⇒ v_L(0⁻) = 0（电感换短路）。',
      },
      {
        id: L2,
        label: '02 t=0⁺ 冻结替换台 (C变电压源/L变电流源)',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '开关已动作！由能量守恒得 v_C(0⁺)=v_C(0⁻)、i_L(0⁺)=i_L(0⁻)。将电容替换为独立电压源 v_C(0⁺)，将电感替换为独立电流源 i_L(0⁺)，化为纯电阻直流电路求 i_C(0⁺) 与 v_L(0⁺)。',
      },
      {
        id: L3,
        label: '03 t=∞ 新稳态拍照',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '开关保持在 t>0 新位置且过渡过程结束，再次令电容开路、电感短路，求解直流新稳态终值。',
      },
    ],
    hover_map: {
      vs: { label: '直流电压源', desc: '例题一：V₁ = 12 V（位置 a）/ V₂ = 30 V（位置 b）；例题二：V_s = 24 V；引导例题：V_s = 36 V' },
      is: { label: '独立直流电流源 I_s', desc: '例题二：6 A，向上注入节点 B' },
      r1: { label: '电阻 R₁', desc: '电源与主干之间的串联电阻' },
      r2: { label: '电阻 R₂', desc: '例题一、引导例题：节点到地；例题二：与电感串联在节点 A 到地之间' },
      r3: { label: '电阻 R₃（开关支路）', desc: '与开关 S 串联：例题二里 S 闭合才接入；引导例题里 S 断开就被切除' },
      r4: { label: '电阻 R₄', desc: '例题二：节点 B 到地，t < 0 时 I_s 全部流过它' },
      node_a: { label: '节点 A', desc: '例题二：v_A 由 KCL 求出；t = 0⁺ 时电感电流源 i_L(0⁺) 从这里流出' },
      node_b: { label: '节点 B', desc: '电容所在节点：t = 0⁺ 时被电压源 v_C(0⁺) 钳位，v_B(0⁺) = v_C(0⁺)' },
      switch_before: { label: '开关 · t < 0 的位置', desc: '旧拓扑：t = 0⁻ 的稳态快照按开关动作之前的位置画' },
      switch_after: { label: '开关 · t > 0 的位置', desc: '新拓扑：t = 0⁺ 与 t = ∞ 两张快照都按开关动作之后的位置画' },
      cap_open: { label: '电容 → 开路', desc: '直流稳态（t = 0⁻ 与 t = ∞）：dv_C/dt = 0 ⇒ i_C = 0，两端只剩开路电压 v_C' },
      ind_short: { label: '电感 → 短路', desc: '直流稳态（t = 0⁻ 与 t = ∞）：di_L/dt = 0 ⇒ v_L = 0，只剩短路电流 i_L' },
      cap_vsrc: { label: '电容 → 独立电压源 v_C(0⁺)', desc: 't = 0⁺：电容电压被钉死在 v_C(0⁺) = v_C(0⁻)，极性与 v_C 参考极性一致' },
      ind_isrc: { label: '电感 → 独立电流源 i_L(0⁺)', desc: 't = 0⁺：电感电流被钉死在 i_L(0⁺) = i_L(0⁻)，箭头与 i_L 参考方向一致' },
      psc_arrows: { label: '无源符号约定', desc: 'i_C 从电容的“+”端流入；v_L 以 i_L 流入端为“+”。方向一反，导数初值就变号' },
      ro_vc0: { label: '守恒初值 v_C(0⁺) = v_C(0⁻)', desc: 't = 0⁻ 快照里电容开路端电压，跨 t = 0 不跳变' },
      ro_il0: { label: '守恒初值 i_L(0⁺) = i_L(0⁻)', desc: 't = 0⁻ 快照里电感短路支路电流，跨 t = 0 不跳变' },
      ro_ic: { label: '电容电流 i_C(0⁺)', desc: '流过替换电压源的电流（从“+”端流入）：允许跃变' },
      ro_vl: { label: '电感电压 v_L(0⁺)', desc: '替换电流源两端电压（电流流入端为“+”）：允许跃变' },
      ro_dvc: { label: '导数初值 dv_C(0⁺)/dt', desc: '= i_C(0⁺)/C' },
      ro_dil: { label: '导数初值 di_L(0⁺)/dt', desc: '= v_L(0⁺)/L' },
      ro_vcinf: { label: '终值 v_C(∞)', desc: 't = ∞ 新稳态：电容开路端电压' },
      ro_ilinf: { label: '终值 i_L(∞)', desc: 't = ∞ 新稳态：电感短路支路电流' },
      wave_state: { label: '状态守恒量 v_C、i_L（实线）', desc: '跨 t = 0 连续：曲线在开关动作处不断开，只是开始弯折' },
      wave_jump: { label: '非状态变量 i_C、v_L（虚线）', desc: '可以在 t = 0 瞬间跃变：0⁻ 处为 0（空心点），0⁺ 处跳到新值（实心点）' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '为什么二阶电路必须求“导数初值”？——从两个待定常数与能量守恒出发',
      sync: at(L1, ['wave_state', 'wave_jump'], 'ex2', 'wave'),
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎回到 Breadboard Lab。上一阶段我们用“三要素法”轻松拿下了含单个储能元件的一阶 RC/RL 电路；今天起，我们正式踏入 **Alexander, Sadiku & Fredette《电路基础》（2026 版）第 8 章——二阶电路（Second-Order Circuits）**。很多同学一见到 RLC 串联或并联电路就急着列二阶微分方程，结果解到最后卡在“待定常数 $A_1, A_2$ 算不出来”或者“符号全反”。请记住我一句话：**二阶电路的胜负，80% 在列微分方程之前就已经决定了——它取决于你能不能把 $t=0^-$、$t=0^+$、$t=\infty$ 这三张快照拍得滴水不漏。** 这节课是纯方法论课，左侧舞台为你准备了三层 2D 交互原理图，我们一幕一幕把这套“三时刻等效替换法”刻进肌肉记忆。`,
        },
        { kind: 'p', text: '**1.1 教授讲授：一阶与二阶的根本鸿沟**' },
        {
          kind: 'p',
          text: R`在一阶电路（只有一个独立电容或电感）中，电路方程是一阶常微分方程，通解只有一个待定常数 $A$，因此只要知道一个初值 $x(0^+)$ 和一个终值 $x(\infty)$，整个时间波形就被唯一锁死。`,
        },
        {
          kind: 'formula',
          title: R`然而，当电路中同时存在**两个独立储能元件**（例如一个电感 $L$ 和一个电容 $C$）时，电路的控制方程升阶为二阶线性常微分方程：`,
          tex: R`\frac{d^2 x(t)}{dt^2} + 2\alpha \frac{dx(t)}{dt} + \omega_0^2 x(t) = f_{\text{dc}}`,
        },
        {
          kind: 'p',
          text: R`高等数学告诉我们：一个二阶微分方程的通解必然包含**两个独立的待定常数 $A_1$ 和 $A_2$**（例如过阻尼时的 $x(t) = x(\infty) + A_1 e^{s_1 t} + A_2 e^{s_2 t}$）。要解出两个未知数，必须提供**两个在 $t=0^+$ 时刻的独立初始条件**：`,
        },
        {
          kind: 'ol',
          items: [
            R`**状态变量本身的初值**：[[ro_vc0|$v_C(0^+)$]] 与 [[ro_il0|$i_L(0^+)$]]；`,
            R`**状态变量一阶导数的初值**：[[ro_dvc|$\left.\dfrac{dv_C}{dt}\right|_{t=0^+}$]] 与 [[ro_dil|$\left.\dfrac{di_L}{dt}\right|_{t=0^+}$]]。`,
          ],
        },
        {
          kind: 'formula',
          title: R`可是，导数 $\frac{dv_C(0^+)}{dt}$ 和 $\frac{di_L(0^+)}{dt}$ 并不能直接拿万用表去测，我们怎么从电路图里把它算出来？答案就藏在 ${code('W4-L1')} 与 ${code('W4-L2')} 学过的元件本构关系（Element Constitutive Equations）里：`,
          tex: R`\frac{dv_C(0^+)}{dt} = \frac{i_C(0^+)}{C}, \qquad \frac{di_L(0^+)}{dt} = \frac{v_L(0^+)}{L}`,
        },
        {
          kind: 'p',
          text: R`请盯紧这两个等式！它们把“看不见的微积分导数”，精准翻译成了“$t=0^+$ 这一瞬间的普通电流 [[ro_ic|$i_C(0^+)$]] 和普通电压 [[ro_vl|$v_L(0^+)$]]”。`,
        },
        { kind: 'p', text: '**1.2 核心物理边界：谁绝对不能突变？谁可以瞬间跃变？**' },
        { kind: 'p', text: '这是初学者踩坑最多的地方。在有限功率（不含冲激电源）的实际电路中：' },
        {
          kind: 'table',
          head: ['变量类别', '物理量', R`跨 $t=0$ 开关瞬间是否连续？`, '物理根源'],
          rows: [
            [
              '[[wave_state|**状态守恒变量（不可跃变）**]]',
              R`电容电压 $v_C(t)$`,
              R`**严格连续**：$v_C(0^+) = v_C(0^-)$`,
              R`电场储能 $w_C = \frac{1}{2} C v_C^2$ 不能在零时间内突变，否则功率 $p_C = \frac{dw_C}{dt} \to \infty$`,
            ],
            [
              '[[wave_state|**状态守恒变量（不可跃变）**]]',
              R`电感电流 $i_L(t)$`,
              R`**严格连续**：$i_L(0^+) = i_L(0^-)$`,
              R`磁场储能 $w_L = \frac{1}{2} L i_L^2$ 不能在零时间内突变，否则功率 $p_L = \frac{dw_L}{dt} \to \infty$`,
            ],
            [
              '[[wave_jump|**非状态变量（允许跃变！）**]]',
              R`电容电流 $i_C(t)$`,
              R`**允许突变**：通常 $i_C(0^+) \neq i_C(0^-)$`,
              R`仅改变电容电压的变化率 $\frac{dv_C}{dt}$，不违背能量连续性`,
            ],
            [
              '[[wave_jump|**非状态变量（允许跃变！）**]]',
              R`电感电压 $v_L(t)$`,
              R`**允许突变**：通常 $v_L(0^+) \neq v_L(0^-)$`,
              R`仅改变电感电流的变化率 $\frac{di_L}{dt}$，不违背能量连续性`,
            ],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授红牌警告**：在 $t=0^-$ 直流稳态下，确实有 $i_C(0^-) = 0$ 且 $v_L(0^-) = 0$；在 $t=\infty$ 新稳态下，也确实有 $\frac{dv_C(\infty)}{dt} = 0$ 且 $\frac{di_L(\infty)}{dt} = 0$。**但绝不能把这两个“零”搬到 $t=0^+$！** 开关动作的瞬间，电容电流 $i_C(0^+)$ 和电感电压 $v_L(0^+)$ 往往会从 $0$ 瞬间跳变到一个巨大的非零值，从而推动整个二阶电路开启充放电振荡！`,
        },
        { kind: 'p', text: '**1.3 第 1 幕配图：二阶电路边界条件与守恒/跃变变量对照图**' },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '二阶电路 6 个边界值与“守恒 vs 跃变”物理边界',
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: R`三时刻拍照法总览——$t=0^-$、$t=0^+$、$t=\infty$ 三联等效电路对比`,
      sync: at(L2, ['cap_vsrc', 'ind_isrc'], 'demo'),
      blocks: [
        { kind: 'p', text: '**2.1 教授讲授：把动态电路拆成三张纯电阻直流快照**' },
        {
          kind: 'p',
          text: R`请把目光投向左侧舞台的三个切换标签：${code('01 t=0⁻ 稳态拍照')}、${code('02 t=0⁺ 冻结替换台')}、${code('03 t=∞ 新稳态拍照')}。无论二阶 RLC 电路画得多复杂，只要严格执行以下三步等效替换，任何微积分难题都会瞬间退化成你在 ${code('W2-L1')} 就已经滚瓜烂熟的**纯电阻直流电路分析**：`,
        },
        { kind: 'p', text: R`**1. 第一张快照：$t = 0^-$ 稳态电路（开关尚未动作）**` },
        {
          kind: 'ul',
          items: [
            R`**等效规则**：直流稳态下，电容电压不再变化 $\Rightarrow i_C(0^-) = 0$，[[cap_open|**电容替换成开路（Open Circuit）**]]；电感电流不再变化 $\Rightarrow v_L(0^-) = 0$，[[ind_short|**电感替换成短路（Short Circuit）**]]。`,
          ],
        },
        {
          kind: 'formula',
          title: R`**唯一任务**：只求两个守恒量——电容两端开路电压 [[ro_vc0|$v_C(0^-)$]]、电感支路短路电流 [[ro_il0|$i_L(0^-)$]]。求出后立刻根据能量守恒写下：`,
          tex: R`v_C(0^+) = v_C(0^-), \qquad i_L(0^+) = i_L(0^-)`,
        },
        {
          kind: 'ul',
          items: [
            R`**顺带提醒**：标清参考方向！电容电流 $i_C$ 与电容电压 $v_C$、电感电压 $v_L$ 与电感电流 $i_L$ [[psc_arrows|**必须满足无源符号约定（Passive Sign Convention）**]]——即电流从元件的“$+$”端流入、“$-$”端流出。`,
          ],
        },
        { kind: 'p', text: R`**2. 第二张快照：$t = 0^+$ 冻结瞬间电路（开关已动作！核心替换台）**` },
        {
          kind: 'ul',
          items: [
            R`**物理原理**：在 $t=0^+$ 这一冻结瞬间，电容两端电压被强行钉死在 $v_C(0^+)$，不管流过它的电流是多少，它的端电压此刻就是 $v_C(0^+)$——这在电路定义上就是一个[[cap_vsrc|**数值等于 $v_C(0^+)$ 的独立直流电压源**]]！同理，电感支路电流被强行钉死在 $i_L(0^+)$，不管它两端电压是多少，流过它的电流此刻就是 $i_L(0^+)$——这在电路定义上就是一个[[ind_isrc|**数值等于 $i_L(0^+)$ 的独立直流电流源**]]！`,
            R`**等效规则**：`,
          ],
        },
        {
          kind: 'ul',
          items: [
            R`画出[[switch_after|**开关动作后**]]的拓扑；`,
            R`[[cap_vsrc|**电容 $\longrightarrow$ 独立电压源 $v_C(0^+)$**]]（极性与 $v_C$ 参考极性完全一致）；`,
            R`[[ind_isrc|**电感 $\longrightarrow$ 独立电流源 $i_L(0^+)$**]]（箭头方向与 $i_L$ 参考方向完全一致）。`,
          ],
        },
        {
          kind: 'formula',
          title: R`**核心任务**：用普通直流电路方法（KCL、KVL、节点分析法）算出流过该替换电压源的电流 [[ro_ic|$i_C(0^+)$]]（从“$+$”端流入）以及该替换电流源两端的电压 [[ro_vl|$v_L(0^+)$]]（电流流入端为“$+$”），随后立刻除以 $C$ 和 $L$：`,
          tex: R`\left.\frac{dv_C}{dt}\right|_{t=0^+} = \frac{i_C(0^+)}{C}, \qquad \left.\frac{di_L}{dt}\right|_{t=0^+} = \frac{v_L(0^+)}{L}`,
        },
        { kind: 'p', text: R`**3. 第三张快照：$t = \infty$ 新稳态电路（开关保持在新位置）**` },
        {
          kind: 'ul',
          items: [
            R`**等效规则**：过渡过程全部衰减完毕，电路进入新的直流稳态。再次将[[cap_open|**电容替换成开路**]]、[[ind_short|**电感替换成短路**]]（注意：[[switch_after|开关保持在 $t>0$ 的新位置]]！）。`,
            R`**核心任务**：算出终值 [[ro_vcinf|$v_C(\infty)$]] 和 [[ro_ilinf|$i_L(\infty)$]]。`,
          ],
        },
        { kind: 'p', text: R`**2.2 第 2 幕配图：同一二阶 RLC 电路在 $t=0^-$、$t=0^+$、$t=\infty$ 的三联等效替换对比图**` },
        {
          kind: 'p',
          text: R`下面这张三联图以一个典型含开关串联主干 RLC 电路（[[vs|$V_s$]]、[[r1|$R_1$]]、$L$、[[r2|$R_2$]]、[[switch_before,switch_after|开关 $S$]] 在 $t=0$ 断开 [[r3|$R_3$]] 支路、并联电容 $C$）为例，清晰展示同一电路在三个时刻的元件替换细节：`,
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '三时刻拍照法三联对比（同一 RLC 电路的等效替换全景）',
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '经典例题精讲（一）——串联型单刀双掷开关 RLC 电路（Sadiku 8.2 模型 1）',
      sync: at(L2, ['switch_after', 'ind_isrc', 'cap_vsrc'], 'ex1'),
      blocks: [
        { kind: 'p', text: '**3.1 题目描述**' },
        {
          kind: 'p',
          text: R`如图所示的单刀双掷（SPDT）开关二阶 RLC 电路：在 $t < 0$ 时[[switch_before|开关长期接在位置 $a$]]（接入直流电压源 [[vs|$V_1 = 12\text{ V}$]]），电路已达直流稳态。在 $t = 0$ 瞬间，[[switch_after|开关迅速切换至位置 $b$]]（接入直流电压源 [[vs|$V_2 = 30\text{ V}$]]）。已知：$V_1 = 12\text{ V}, \quad V_2 = 30\text{ V}, \quad R_1 = 6\ \Omega, \quad R_2 = 6\ \Omega, \quad L = 0.5\text{ H}, \quad C = 0.25\text{ F}$`,
        },
        {
          kind: 'p',
          text: R`求全部 6 个边界值：$i_L(0^+)$、$v_C(0^+)$、$\dfrac{di_L(0^+)}{dt}$、$\dfrac{dv_C(0^+)}{dt}$、$i_L(\infty)$、$v_C(\infty)$。`,
        },
        { kind: 'p', text: '**3.2 第 3 幕配图：串联型 SPDT 开关 RLC 三时刻等效电路图**' },
        { kind: 'figure', svg: SVG_ACT3, caption: 'Act 3 例题一（串联主干 SPDT RLC）：t=0⁻、t=0⁺（替换源）、t=∞ 三联图' },
        { kind: 'p', text: '**3.3 三段式教授板书推导（严禁符号与数字混写）**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. **直流稳态条件**（$t=0^-$ 与 $t=\infty$）：$\dfrac{dv_C}{dt} = 0 \implies i_C = 0$（[[cap_open|电容开路]]）；$\dfrac{di_L}{dt} = 0 \implies v_L = 0$（[[ind_short|电感短路]]）。2. **能量连续性公理**（跨 $t=0$）：$i_L(0^+) = i_L(0^-)$，$v_C(0^+) = v_C(0^-)$。3. **无源符号约定与本构方程**（$t=0^+$）：$v_L(0^+) = L\dfrac{di_L(0^+)}{dt}$，$i_C(0^+) = C\dfrac{dv_C(0^+)}{dt}$，并配合 KVL、KCL 求解纯电阻等效替换电路。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（全程不代入任何具体数值）· **快照 1（$t = 0^-$，接 $V_1$）**：[[r1|$R_1$]] 与 [[r2|$R_2$]] 串联，[[cap_open|$C$ 开路]]并联在 $R_2$ 两端：`,
          tex: R`i_L(0^+) = i_L(0^-) = \frac{V_1}{R_1 + R_2}, \qquad v_C(0^+) = v_C(0^-) = \frac{R_2}{R_1 + R_2} V_1`,
        },
        {
          kind: 'formula',
          title: R`**快照 2（$t = 0^+$，切至 $V_2$，用 [[ind_isrc|$i_L(0^+)$ 电流源]]与 [[cap_vsrc|$v_C(0^+)$ 电压源]]替换）**· 对左侧主回路列 KVL：`,
          tex: R`V_2 - R_1 i_L(0^+) - v_L(0^+) - v_C(0^+) = 0 \implies v_L(0^+) = V_2 - R_1 i_L(0^+) - v_C(0^+)`,
        },
        {
          kind: 'formula',
          title: R`将 $R_1 i_L(0^+) + v_C(0^+) = V_1$ 代入得简洁纯符号式：`,
          tex: R`v_L(0^+) = V_2 - V_1 \implies \left.\frac{di_L}{dt}\right|_{t=0^+} = \frac{v_L(0^+)}{L} = \frac{V_2 - V_1}{L}`,
        },
        {
          kind: 'formula',
          title: '对右侧并联节点列 KCL：',
          tex: R`i_L(0^+) = \frac{v_C(0^+)}{R_2} + i_C(0^+) \implies i_C(0^+) = i_L(0^+) - \frac{v_C(0^+)}{R_2} = 0 \implies \left.\frac{dv_C}{dt}\right|_{t=0^+} = \frac{i_C(0^+)}{C} = 0`,
        },
        {
          kind: 'formula',
          title: R`**快照 3（$t = \infty$，保持接 $V_2$）**：`,
          tex: R`i_L(\infty) = \frac{V_2}{R_1 + R_2}, \qquad v_C(\infty) = \frac{R_2}{R_1 + R_2} V_2`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简：将 $V_1 = 12\text{ V}$、$V_2 = 30\text{ V}$、$R_1 = 6\ \Omega$、$R_2 = 6\ \Omega$、$L = 0.5\text{ H}$、$C = 0.25\text{ F}$ 依次代入：`,
          steps: [
            { label: 'Step 1', text: R`**状态初值**：`, tex: R`i_L(0^+) = \frac{12}{6 + 6} = 1\text{ A}, \qquad v_C(0^+) = \frac{6}{6 + 6} \times 12 = 6\text{ V}` },
            {
              label: 'Step 2',
              text: R`**导数初值**：`,
              tex: R`\begin{gathered} v_L(0^+) = 30 - 6 \times 1 - 6 = 18\text{ V} \implies \left.\frac{di_L}{dt}\right|_{t=0^+} = \frac{18}{0.5} = 36\text{ A/s} \\[6pt] i_C(0^+) = 1 - \frac{6}{6} = 0\text{ A} \implies \left.\frac{dv_C}{dt}\right|_{t=0^+} = \frac{0}{0.25} = 0\text{ V/s} \end{gathered}`,
            },
            { label: 'Step 3', text: R`**新稳态终值**：`, tex: R`i_L(\infty) = \frac{30}{6 + 6} = 2.5\text{ A}, \qquad v_C(\infty) = \frac{6}{6 + 6} \times 30 = 15\text{ V}` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授点评**：请留意这道题里的一个绝佳物理洞察！开关切到 $30\text{ V}$ 的瞬间，[[ro_vl|电感电压 $v_L$ 从 $0\text{ V}$ 猛然跃升到 $18\text{ V}$]]，因此电感电流立刻以 $36\text{ A/s}$ 的陡峭斜率往上冲；而[[ro_ic|电容电流 $i_C(0^+)$]] **恰好算出来是 $0\text{ A}$**——原因不是“偷懒照抄 $i_C(0^-)=0$”，而是因为电感锁死了流入节点的电流 $1\text{ A}$，电容锁死了节点电压 $6\text{ V}$ 使 $R_2$ 分流仍是 $1\text{ A}$，两者相减才碰巧为零。下一幕的混合型双电源电路里，你会亲眼看到 $i_C(0^+)$ 和 $v_L(0^+)$ **双双剧烈跃变**！`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '经典例题精讲（二）——并联/混合型双电源含开关 RLC 电路（Sadiku 8.2 模型 2）',
      sync: at(L2, ['node_a', 'node_b', 'switch_after'], 'ex2'),
      blocks: [
        { kind: 'p', text: '**4.1 题目描述**' },
        { kind: 'p', text: R`如图所示的混合型双电源 RLC 网络包含两个非参考节点 [[node_a|$A$]]、[[node_b|$B$]]：` },
        {
          kind: 'ul',
          items: [
            R`**节点 $A$ 左侧网络**：[[vs|直流电压源 $V_s = 24\text{ V}$]] 经串联电阻 [[r1|$R_1 = 4\ \Omega$]] 接至节点 $A$；节点 $A$ 至地之间串联电阻 [[r2|$R_2 = 4\ \Omega$]] 与电感 $L = 0.5\text{ H}$（$i_L$ 向下，$v_L$ 上正下负）。`,
            R`**节点 $B$ 右侧网络**：[[is|独立直流电流源 $I_s = 6\text{ A}$]]（向上注入节点 $B$）与电阻 [[r4|$R_4 = 6\ \Omega$]]、电容 $C = 0.25\text{ F}$（$v_C$ 上正下负，$i_C$ 向下）并联接至地。`,
            R`**耦合开关支路**：节点 $A$ 与节点 $B$ 之间串联开关 $S$ 与电阻 [[r3|$R_3 = 4\ \Omega$]]。[[switch_before|开关 $S$ 在 $t < 0$ 时长期**断开**]]（左右两半电路独立稳态），[[switch_after|在 $t = 0$ 瞬间**闭合**]]！`,
          ],
        },
        {
          kind: 'p',
          text: R`求全部 6 个边界值：$i_L(0^+)$、$v_C(0^+)$、$\dfrac{di_L(0^+)}{dt}$、$\dfrac{dv_C(0^+)}{dt}$、$i_L(\infty)$、$v_C(\infty)$。`,
        },
        { kind: 'p', text: '**4.2 第 4 幕配图：并联/混合型双电源 RLC 三时刻等效电路图**' },
        { kind: 'figure', svg: SVG_ACT4, caption: 'Act 4 例题二（混合型双电源 RLC，S 在 t=0 闭合）：三时刻等效替换图' },
        { kind: 'p', text: '**4.3 三段式教授板书推导（严禁符号与数字混写）**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. **直流稳态替换**（$t=0^-$ 与 $t=\infty$）：[[cap_open|$C \to$ 开路]]，[[ind_short|$L \to$ 短路]]。2. **能量守恒**（$t=0^- \to 0^+$）：$i_L(0^+) = i_L(0^-)$，$v_C(0^+) = v_C(0^-)$。3. **冻结替换与节点分析法**（${code('W2-L1')}）：在 $t=0^+$，将 [[cap_vsrc|$C$ 换为电压源 $v_C(0^+)$]]（从而节点 $B$ 电位直接钳位为 $v_B(0^+) = v_C(0^+)$），将 [[ind_isrc|$L$ 换为电流源 $i_L(0^+)$]]；对节点 $A$、$B$ 分别列 KCL 方程，再利用本构关系求导数初值。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（全程不代入任何具体数值）· **快照 1（$t = 0^-$，$S$ 断开，左右解耦）**：`,
          tex: R`i_L(0^+) = i_L(0^-) = \frac{V_s}{R_1 + R_2}, \qquad v_C(0^+) = v_C(0^-) = I_s R_4`,
        },
        {
          kind: 'formula',
          title: R`**快照 2（$t = 0^+$，$S$ 闭合，$v_B(0^+) = v_C(0^+)$）**· 对[[node_a|节点 $A$]] 列 KCL（流出为正）：`,
          tex: R`\frac{v_A(0^+) - V_s}{R_1} + i_L(0^+) + \frac{v_A(0^+) - v_C(0^+)}{R_3} = 0`,
        },
        {
          kind: 'formula',
          title: R`解出节点 $A$ 的瞬时电位：`,
          tex: R`v_A(0^+) = \frac{\dfrac{V_s}{R_1} + \dfrac{v_C(0^+)}{R_3} - i_L(0^+)}{\dfrac{1}{R_1} + \dfrac{1}{R_3}}`,
        },
        {
          kind: 'formula',
          title: R`由 $R_2$ 与电感串联支路的 KVL 求电感端电压 [[ro_vl|$v_L(0^+)$]] 及电流变化率：`,
          tex: R`v_L(0^+) = v_A(0^+) - R_2 i_L(0^+), \qquad \left.\frac{di_L}{dt}\right|_{t=0^+} = \frac{v_L(0^+)}{L}`,
        },
        {
          kind: 'formula',
          title: R`对[[node_b|节点 $B$]] 列 KCL（流入等于流出）求电容电流 [[ro_ic|$i_C(0^+)$]] 及电压变化率：`,
          tex: R`i_C(0^+) = I_s - \frac{v_C(0^+)}{R_4} + \frac{v_A(0^+) - v_C(0^+)}{R_3}, \qquad \left.\frac{dv_C}{dt}\right|_{t=0^+} = \frac{i_C(0^+)}{C}`,
        },
        {
          kind: 'formula',
          title: R`**快照 3（$t = \infty$，$S$ 闭合，$L$ 短路，$C$ 开路）**：对节点 $A$ 与节点 $B$ 联立两阶节点电压方程：`,
          tex: R`\begin{cases} \left(\dfrac{1}{R_1} + \dfrac{1}{R_2} + \dfrac{1}{R_3}\right) v_A(\infty) - \dfrac{1}{R_3} v_B(\infty) = \dfrac{V_s}{R_1} \\[10pt] -\dfrac{1}{R_3} v_A(\infty) + \left(\dfrac{1}{R_3} + \dfrac{1}{R_4}\right) v_B(\infty) = I_s \end{cases}`,
        },
        {
          kind: 'formula',
          title: R`解出 $v_A(\infty)$ 与 $v_B(\infty)$ 后即得：`,
          tex: R`i_L(\infty) = \frac{v_A(\infty)}{R_2}, \qquad v_C(\infty) = v_B(\infty)`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简：代入 $V_s = 24\text{ V}$、$I_s = 6\text{ A}$、$R_1 = 4\ \Omega$、$R_2 = 4\ \Omega$、$R_3 = 4\ \Omega$、$R_4 = 6\ \Omega$、$L = 0.5\text{ H}$、$C = 0.25\text{ F}$：`,
          steps: [
            { label: 'Step 1', text: R`**状态初值（$t=0^- \to 0^+$）**：`, tex: R`i_L(0^+) = \frac{24}{4 + 4} = 3\text{ A}, \qquad v_C(0^+) = 6 \times 6 = 36\text{ V}` },
            {
              label: 'Step 2',
              text: R`**导数初值（$t=0^+$ 冻结替换台）**：求节点 $A$ 电位：`,
              tex: R`v_A(0^+) = \frac{\dfrac{24}{4} + \dfrac{36}{4} - 3}{\dfrac{1}{4} + \dfrac{1}{4}} = \frac{6 + 9 - 3}{0.5} = \frac{12}{0.5} = 24\text{ V}`,
            },
            {
              label: 'Step 3',
              text: '求电感电压与电感电流导数：',
              tex: R`v_L(0^+) = 24 - 4 \times 3 = 12\text{ V} \implies \left.\frac{di_L}{dt}\right|_{t=0^+} = \frac{12}{0.5} = +24\text{ A/s}`,
            },
            {
              label: 'Step 4',
              text: '求电容电流与电容电压导数：',
              tex: R`i_C(0^+) = 6 - \frac{36}{6} + \frac{24 - 36}{4} = 6 - 6 - 3 = -3\text{ A} \implies \left.\frac{dv_C}{dt}\right|_{t=0^+} = \frac{-3}{0.25} = -12\text{ V/s}`,
            },
            {
              label: 'Step 5',
              text: R`**新稳态终值（$t=\infty$）**：联立节点方程（两边同乘 $12$ 消去分母）：`,
              tex: R`\begin{cases} 9 v_A(\infty) - 3 v_B(\infty) = 72 \\ -3 v_A(\infty) + 5 v_B(\infty) = 72 \end{cases} \implies \begin{cases} 3 v_A(\infty) - v_B(\infty) = 24 \\ -3 v_A(\infty) + 5 v_B(\infty) = 72 \end{cases}`,
            },
            {
              label: 'Step 6',
              text: R`两式相加得 $4 v_B(\infty) = 96 \implies v_B(\infty) = 24\text{ V}$，代回得 $v_A(\infty) = \dfrac{24 + 24}{3} = 16\text{ V}$。`,
            },
            { label: 'Step 7', text: '因此终值为：', tex: R`i_L(\infty) = \frac{16}{4} = 4\text{ A}, \qquad v_C(\infty) = 24\text{ V}` },
          ],
        },
        { kind: 'p', text: '**4.4 Python SymPy 验算汇总与常见致命误区红黑榜**' },
        { kind: 'p', text: '以下两道经典例题的全部 6 个边界值均已通过 Python SymPy 符号与数值双校验，结果 100% 吻合：' },
        {
          kind: 'table',
          head: ['边界值', '例题一（串联 SPDT RLC）', '例题二（混合双电源 RLC）', '物理意义自检'],
          rows: [
            [R`$i_L(0^+)$`, R`$1\text{ A}$`, R`$3\text{ A}$`, R`继承自 $t=0^-$，不可跃变`],
            [R`$v_C(0^+)$`, R`$6\text{ V}$`, R`$36\text{ V}$`, R`继承自 $t=0^-$，不可跃变`],
            [R`$\dfrac{di_L(0^+)}{dt}$`, R`$+36\text{ A/s}$`, R`$+24\text{ A/s}$`, '正斜率：电感电流从初值向上爬升趋向终值'],
            [R`$\dfrac{dv_C(0^+)}{dt}$`, R`$0\text{ V/s}$`, R`$-12\text{ V/s}$`, R`负斜率：例题二电容从 $36\text{ V}$ 立刻开始放电降向 $24\text{ V}$`],
            [R`$i_L(\infty)$`, R`$2.5\text{ A}$`, R`$4\text{ A}$`, R`$t=\infty$ 新稳态电感短路电流`],
            [R`$v_C(\infty)$`, R`$15\text{ V}$`, R`$24\text{ V}$`, R`$t=\infty$ 新稳态电容开路电压`],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**致命误区红黑榜（考场必查 3 条）**：1. **误区 1（拿稳态当瞬间）**：以为 $i_C(0^-)=0$ 所以 $i_C(0^+)=0$。反例见例题二：$i_C$ 在开关合上瞬间从 $0\text{ A}$ 骤跳至 $-3\text{ A}$！2. **误区 2（混淆初值导数与终值导数）**：终值稳态确实有 $\frac{dv_C(\infty)}{dt}=0$，但初值瞬间 $\frac{dv_C(0^+)}{dt}=-12\text{ V/s} \neq 0$。3. **误区 3（违背[[psc_arrows|无源符号约定]]）**：在 $t=0^+$ 算 $i_C(0^+)$ 时，若电流箭头画成从电压源“$-$”端流入，就会把 $-12\text{ V/s}$ 算成 $+12\text{ V/s}$，导致整个二阶响应波形完全颠倒！`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 5 (guided example, quiz) */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '苏格拉底式 5 步交互引导例题与诊断测验',
      sync: at(L3, [], 'guided'),
      blocks: [
        { kind: 'p', text: '**5.1 交互引导例题电路图（开关断开释放支路型 RLC 网络）**' },
        {
          kind: 'guided',
          title: '含开关释放支路二阶 RLC 网络：全套 6 边界值 5 步苏格拉底引导',
          problem: R`**题目设定**：[[vs|$V_s = 36\text{ V}$]] 经 [[r1|$R_1 = 6\ \Omega$]]、电感 $L = 0.25\text{ H}$ 接至[[node_b|节点 $B$]]；节点 $B$ 至地之间并联三条支路：① [[r2|$R_2 = 6\ \Omega$]]；② [[switch_before,switch_after|开关 $S$]]（$t<0$ 闭合，$t=0$ **断开**）串联 [[r3|$R_3 = 6\ \Omega$]]；③ 电容 $C = 0.5\text{ F}$。请通过下方 5 步苏格拉底交互引导求出全部 6 个边界值。`,
          problem_svg: SVG_ACT5,
          steps: [
            {
              title: R`第 1 步：拍下 $t=0^-$ 稳态快照，锁死两个守恒量`,
              mini_svg: MINI_STEP1,
              question: R`在 $t=0^-$ 时开关 $S$ 处于闭合稳态，电容 $C$ 换开路、电感 $L$ 换短路。此时 $R_2=6\ \Omega$ 与 $R_3=6\ \Omega$ 并联后再与 $R_1=6\ \Omega$ 串联。请算出电感电流初值 $i_L(0^+)$ 和电容电压初值 $v_C(0^+)$。`,
              hint: R`$R_p = R_2 \parallel R_3 = \frac{6 \times 6}{6 + 6} = 3\ \Omega,\quad i_L(0^-) = \frac{V_s}{R_1 + R_p},\quad v_C(0^-) = i_L(0^-) R_p$`,
              options: [
                {
                  text: R`$i_L(0^+) = 3\text{ A}$，$v_C(0^+) = 18\text{ V}$`,
                  correct: false,
                  feedback: R`停一下！你算的是开关断开后的 $R_1+R_2=12\ \Omega$，那可是 $t=\infty$ 的终值！在 $t=0^-$ 时刻，开关 $S$ 还是闭合的，$R_3=6\ \Omega$ 正在与 $R_2$ 并联分流呢。`,
                },
                {
                  text: R`$i_L(0^+) = 4\text{ A}$，$v_C(0^+) = 12\text{ V}$`,
                  correct: true,
                  feedback: R`漂亮！$t=0^-$ 时 $R_2 \parallel R_3 = 3\ \Omega$ 与 $R_1$ 串联，$i_L = 36/9 = 4\text{ A}$，节点 $B$ 电位 $4 \times 3 = 12\text{ V}$ 就是电容开路端电压——两个守恒量锁死了。`,
                },
                {
                  text: R`$i_L(0^+) = 0\text{ A}$，$v_C(0^+) = 36\text{ V}$`,
                  correct: false,
                  feedback: R`别忘了电感 $L$ 在直流稳态是短路而不是开路，而且节点 $B$ 下方挂着 $R_2 \parallel R_3$，电容两端电压是分压后的节点 $B$ 电位，不是整整 $36\text{ V}$。`,
                },
              ],
              board: [R`i_L(0^+) = i_L(0^-) = \frac{36}{6+3} = 4\text{ A},`, R`v_C(0^+) = v_C(0^-) = 4 \times 3 = 12\text{ V}`],
              halo: ['switch_before', 'cap_open', 'ind_short'],
              params: G(0),
              layer: L1,
            },
            {
              title: R`第 2 步：进入 $t=0^+$ 冻结替换台，替换储能元件`,
              mini_svg: MINI_STEP2,
              question: R`$t=0^+$ 开关 $S$ 已经断开（$R_3$ 支路彻底切除）。现在要把动态元件换成独立直流电源：电感 $L$ 应替换成什么电源？电容 $C$ 应替换成什么电源？`,
              hint: R`$\text{电容：} v_C(0^+) = 12\text{ V} \Rightarrow \text{独立电压源}; \qquad \text{电感：} i_L(0^+) = 4\text{ A} \Rightarrow \text{独立电流源}$`,
              options: [
                {
                  text: R`$L$ 替换为 $4\text{ A}$ 独立电流源，$C$ 替换为 $12\text{ V}$ 独立电压源`,
                  correct: true,
                  feedback: R`完全正确！电感电流守恒 ⇒ 冻结成 $4\text{ A}$ 电流源（箭头沿 $i_L$ 向右）；电容电压守恒 ⇒ 冻结成 $12\text{ V}$ 电压源（上正下负）。`,
                },
                {
                  text: R`$L$ 替换为 $12\text{ V}$ 独立电压源，$C$ 替换为 $4\text{ A}$ 独立电流源`,
                  correct: false,
                  feedback: '警报！你把两者的替身搞反了！记住口诀：谁守恒就变成谁的电源——电容电压守恒 ⇒ 变电压源；电感电流守恒 ⇒ 变电流源！',
                },
                {
                  text: R`$L$ 仍换成短路，$C$ 仍换成开路（和 $t=0^-$ 一样）`,
                  correct: false,
                  feedback: R`千万别在 $t=0^+$ 用开路/短路！开路和短路是稳态（$0^-$ 和 $\infty$）的专利，$t=0^+$ 必须用独立电压源与电流源冻结瞬间状态。`,
                },
              ],
              board: [R`\text{在 } t=0^+: \quad L \longrightarrow 4\text{ A 独立电流源（向右）},`, R`C \longrightarrow 12\text{ V 独立电压源（上正下负）}`],
              halo: ['switch_after', 'cap_vsrc', 'ind_isrc'],
              params: G(1),
              layer: L2,
            },
            {
              title: R`第 3 步：在纯电阻替换电路中求 $i_C(0^+)$ 与 $v_L(0^+)$`,
              mini_svg: MINI_STEP3,
              question: R`在 $t=0^+$ 替换电路中，节点 $B$ 被 $12\text{ V}$ 电压源钳位（$v_B(0^+)=12\text{ V}$），$R_3$ 支路已断开，仅有 $4\text{ A}$ 电流源流入节点 $B$、$R_2=6\ \Omega$ 接地与 $12\text{ V}$ 电压源支路。请用节点 $B$ 的 KCL 算出 $i_C(0^+)$，再用左侧回路 KVL 算出 $v_L(0^+)$。`,
              hint: R`$i_C(0^+) = i_L(0^+) - \frac{v_C(0^+)}{R_2}, \qquad v_L(0^+) = V_s - R_1 i_L(0^+) - v_C(0^+)$`,
              options: [
                {
                  text: R`$i_C(0^+) = 0\text{ A}$，$v_L(0^+) = 0\text{ V}$`,
                  correct: false,
                  feedback: R`你掉进最经典的陷阱啦！$i_C(0^-)=0$ 是断开之前的事。开关一断开，原来流过 $R_3$ 的 $2\text{ A}$ 电流瞬间无处可去，被电感 $4\text{ A}$ 电流源硬生生顶进了电容支路，所以 $i_C(0^+)$ 跃变到了 $2\text{ A}$！`,
                },
                {
                  text: R`$i_C(0^+) = 2\text{ A}$，$v_L(0^+) = 12\text{ V}$`,
                  correct: false,
                  feedback: R`再核对一下左侧回路 KVL：电源 $36\text{ V}$ 减去 $R_1$ 压降 $6 \times 4 = 24\text{ V}$，再减去节点 $B$ 电位 $12\text{ V}$，$36 - 24 - 12$ 正好等于 $0\text{ V}$！`,
                },
                {
                  text: R`$i_C(0^+) = 2\text{ A}$，$v_L(0^+) = 0\text{ V}$`,
                  correct: true,
                  feedback: R`对！$R_2$ 只分走 $12/6 = 2\text{ A}$，电感推来的 $4\text{ A}$ 里剩下 $2\text{ A}$ 只能灌进电容：$i_C$ 从 $0$ 跳到 $2\text{ A}$；而左侧回路 $36 - 24 - 12 = 0$，$v_L(0^+) = 0$。`,
                },
              ],
              board: [R`i_C(0^+) = 4 - \frac{12}{6} = 2\text{ A},`, R`v_L(0^+) = 36 - 6 \times 4 - 12 = 0\text{ V}`],
              halo: ['node_b', 'psc_arrows', 'ro_ic', 'ro_vl'],
              params: G(2),
              layer: L2,
            },
            {
              title: '第 4 步：由本构关系转化为一阶导数初值',
              mini_svg: MINI_STEP4,
              question: R`已知 $i_C(0^+) = 2\text{ A}$、$v_L(0^+) = 0\text{ V}$，且 $C = 0.5\text{ F}$、$L = 0.25\text{ H}$。请立刻算出两个导数初值 $\dfrac{dv_C(0^+)}{dt}$ 和 $\dfrac{di_L(0^+)}{dt}$（注意单位）。`,
              hint: R`$\left.\frac{dv_C}{dt}\right|_{t=0^+} = \frac{i_C(0^+)}{C}, \qquad \left.\frac{di_L}{dt}\right|_{t=0^+} = \frac{v_L(0^+)}{L}$`,
              options: [
                {
                  text: R`$\dfrac{dv_C(0^+)}{dt} = 0\text{ V/s}$，$\dfrac{di_L(0^+)}{dt} = 0\text{ A/s}$`,
                  correct: false,
                  feedback: R`别把 $t=\infty$ 的“导数为零”搬到 $t=0^+$！$v_L(0^+) = 0$ 只说明电感电流此刻的斜率为零；可电容电流 $i_C(0^+) = 2\text{ A}$ 不为零，电容电压此刻正在往上爬。`,
                },
                {
                  text: R`$\dfrac{dv_C(0^+)}{dt} = 4\text{ V/s}$，$\dfrac{di_L(0^+)}{dt} = 0\text{ A/s}$`,
                  correct: true,
                  feedback: R`正是如此：$2 / 0.5 = 4\text{ V/s}$，$0 / 0.25 = 0\text{ A/s}$。电容电压立刻以 $4\text{ V/s}$ 上升，电感电流则从水平切线起步。`,
                },
                {
                  text: R`$\dfrac{dv_C(0^+)}{dt} = 1\text{ V/s}$，$\dfrac{di_L(0^+)}{dt} = 0\text{ A/s}$`,
                  correct: false,
                  feedback: R`小心！是除以 $C$ 而不是乘以 $C$：由 $i_C = C \dfrac{dv_C}{dt}$ 移项得 $\dfrac{dv_C}{dt} = \dfrac{i_C}{C} = \dfrac{2}{0.5} = 4\text{ V/s}$。`,
                },
              ],
              board: [R`\left.\frac{dv_C}{dt}\right|_{t=0^+} = \frac{2}{0.5} = 4\text{ V/s},`, R`\left.\frac{di_L}{dt}\right|_{t=0^+} = \frac{0}{0.25} = 0\text{ A/s}`],
              halo: ['ro_dvc', 'ro_dil'],
              params: G(3),
              layer: L2,
            },
            {
              title: R`第 5 步：拍下 $t=\infty$ 新稳态快照，锁死终值`,
              mini_svg: MINI_STEP5,
              question: R`最后切换到 03 层（$t=\infty$ 新稳态）：开关 $S$ 保持断开，再次将电容 $C$ 换开路、电感 $L$ 换短路。此时仅剩 $R_1=6\ \Omega$ 与 $R_2=6\ \Omega$ 串联接在 $36\text{ V}$ 电源上。请算出终值 $i_L(\infty)$ 与 $v_C(\infty)$。`,
              hint: R`$i_L(\infty) = \frac{V_s}{R_1 + R_2}, \qquad v_C(\infty) = i_L(\infty) R_2$`,
              options: [
                {
                  text: R`$i_L(\infty) = 3\text{ A}$，$v_C(\infty) = 18\text{ V}$`,
                  correct: true,
                  feedback: R`通关在望！$36/(6+6) = 3\text{ A}$，$3 \times 6 = 18\text{ V}$：$i_L$ 从 $4\text{ A}$ 降到 $3\text{ A}$，$v_C$ 从 $12\text{ V}$ 升到 $18\text{ V}$。`,
                },
                {
                  text: R`$i_L(\infty) = 4\text{ A}$，$v_C(\infty) = 12\text{ V}$`,
                  correct: false,
                  feedback: R`注意检查开关状态！在 $t=\infty$ 时开关 $S$ 仍然处于断开状态，$R_3$ 已经不在电路里了，不要再把 $R_3$ 并进来。`,
                },
                {
                  text: R`$i_L(\infty) = 6\text{ A}$，$v_C(\infty) = 0\text{ V}$`,
                  correct: false,
                  feedback: R`替换规则用反了！$t=\infty$ 新稳态和 $t=0^-$ 一样：电容换开路、电感换短路。你把电容当成了短路，节点 $B$ 被直接拉到地，才得出 $36/6 = 6\text{ A}$、$0\text{ V}$。`,
                },
              ],
              board: [R`i_L(\infty) = \frac{36}{6+6} = 3\text{ A},`, R`v_C(\infty) = 3 \times 6 = 18\text{ V}`],
              halo: ['switch_after', 'cap_open', 'ind_short', 'ro_vcinf', 'ro_ilinf'],
              params: G(4),
              layer: L3,
            },
          ],
          done_params: { [P_GUIDED]: 5 },
          conclusion: R`通关！全部 6 个边界值：$i_L(0^+) = 4\text{ A}$、$v_C(0^+) = 12\text{ V}$、$\dfrac{di_L(0^+)}{dt} = 0\text{ A/s}$、$\dfrac{dv_C(0^+)}{dt} = 4\text{ V/s}$、$i_L(\infty) = 3\text{ A}$、$v_C(\infty) = 18\text{ V}$。左侧三层舞台上引导例题的数值和波形已经揭晓：切到“波形”看 $i_C$ 在 $t=0$ 从 $0$ 跳到 $2\text{ A}$，而 $v_C$、$i_L$ 连续。`,
        },
        { kind: 'p', text: '**5.3 诊断测验（4 题，精准打击高频误区）**' },
      ],
      quiz: [
        {
          id: 'w4l6_q1',
          question: R`在一个不含冲激电源的二阶 RLC 开关电路中，开关在 $t=0$ 动作瞬间，下列哪一组物理量是允许发生瞬间跃变（不连续）的？`,
          options: [
            {
              key: 'A',
              text: R`电容电压 $v_C$ 与电感电流 $i_L$`,
              correct: false,
              feedback: R`这两个恰恰是绝对不能跳的状态守恒量：电场储能 $\frac{1}{2}Cv_C^2$ 与磁场储能 $\frac{1}{2}Li_L^2$ 若在零时间内突变，功率就要趋于无穷大。`,
            },
            {
              key: 'B',
              text: R`电容电压 $v_C$ 与电感电压 $v_L$`,
              correct: false,
              feedback: R`只对了一半：$v_L$ 确实可以跳（它只决定 $\frac{di_L}{dt}$），但 $v_C$ 是电容的状态守恒量，$v_C(0^+) = v_C(0^-)$，不能跳。`,
            },
            { key: 'C', text: R`电容电流 $i_C$ 与电感电压 $v_L$`, correct: true },
            {
              key: 'D',
              text: R`电容电流 $i_C$ 与电感电流 $i_L$`,
              correct: false,
              feedback: R`只对了一半：$i_C$ 确实可以跳（它只决定 $\frac{dv_C}{dt}$），但 $i_L$ 是电感的状态守恒量，$i_L(0^+) = i_L(0^-)$，不能跳。`,
            },
          ],
          feedback_correct: R`由能量连续性公理，电容电压 $v_C$ 与电感电流 $i_L$ 是状态守恒量，不能跃变；而电容电流 $i_C$ 与电感电压 $v_L$ 分别决定它们的变化率，在开关动作瞬间允许发生阶跃跳变。`,
          feedback_wrong: '回到第 1 幕的对照表：哪两个量背着储能，哪两个量只管变化率？',
          figure: SVG_Q1,
          sync: at(L1, [], 'demo'),
        },
        {
          id: 'w4l6_q2',
          question: R`在构建 $t=0^+$ 冻结瞬间等效电路以求解 $\dfrac{dv_C(0^+)}{dt}$ 和 $\dfrac{di_L(0^+)}{dt}$ 时，已知 $v_C(0^-)=10\text{ V}$、$i_L(0^-)=2\text{ A}$，应如何替换电容 $C$ 与电感 $L$？`,
          options: [
            { key: 'A', text: R`电容换 $10\text{ V}$ 独立电压源，电感换 $2\text{ A}$ 独立电流源`, correct: true },
            {
              key: 'B',
              text: '电容换开路，电感换短路',
              correct: false,
              feedback: R`开路/短路是直流稳态（$t=0^-$ 与 $t=\infty$）的专利：那时 $\frac{dv_C}{dt} = 0$、$\frac{di_L}{dt} = 0$。$t=0^+$ 是过渡过程的起点，导数正是要求的东西，不能预先假设它为零。`,
            },
            {
              key: 'C',
              text: R`电容换 $2\text{ A}$ 独立电流源，电感换 $10\text{ V}$ 独立电压源`,
              correct: false,
              feedback: R`替身搞反了：谁守恒就变成谁的电源——被锁死的是电容的电压 $10\text{ V}$（→ 电压源）和电感的电流 $2\text{ A}$（→ 电流源）。`,
            },
            {
              key: 'D',
              text: '电容换短路，电感换开路',
              correct: false,
              feedback: R`这既不是稳态替换，也不是冻结替换：电容此刻两端电压是 $10\text{ V}$ 而不是 $0$（短路），电感此刻电流是 $2\text{ A}$ 而不是 $0$（开路）。`,
            },
          ],
          feedback_correct: R`$t=0^+$ 瞬间电容电压锁死在 $v_C(0^+)=10\text{ V}$，等效为 $10\text{ V}$ 独立电压源；电感电流锁死在 $i_L(0^+)=2\text{ A}$，等效为 $2\text{ A}$ 独立电流源。开路/短路仅适用于直流稳态（$t=0^-$ 与 $t=\infty$）。`,
          feedback_wrong: '想一想：开关动作的瞬间，电容和电感各自“锁死”的是哪个量？',
          figure: SVG_Q2,
          sync: at(L1, ['cap_open', 'ind_short'], 'demo'),
        },
        {
          id: 'w4l6_q3',
          question: R`在某二阶电路的 $t=0^+$ 等效替换图中，电容 $C = 0.25\text{ F}$ 已替换为 $36\text{ V}$ 独立电压源（上正下负）。通过节点 KCL 算得从电压源“$+$”端流入的电流 $i_C(0^+) = -3\text{ A}$。则 $\dfrac{dv_C(0^+)}{dt}$ 等于多少？`,
          options: [
            {
              key: 'A',
              text: R`$0\text{ V/s}$（因为 $t=0^-$ 稳态时电容电流为零）`,
              correct: false,
              feedback: R`$i_C(0^-) = 0$ 是开关动作之前的稳态，搬到 $t=0^+$ 正是误区 1。题目已给出 $t=0^+$ 时 $i_C(0^+) = -3\text{ A}$，导数要用它来算。`,
            },
            {
              key: 'B',
              text: R`$+12\text{ V/s}$`,
              correct: false,
              feedback: R`符号丢了：电流从“$+$”端流入为正，$i_C(0^+) = -3\text{ A}$ 是负的，$\frac{dv_C}{dt}$ 也必须是负的。把箭头当成从“$-$”端流入，整条二阶响应波形就会被颠倒。`,
            },
            {
              key: 'C',
              text: R`$-0.75\text{ V/s}$`,
              correct: false,
              feedback: R`乘除搞反了：$-0.75 = -3 \times 0.25$ 是 $i_C \cdot C$。由 $i_C = C\frac{dv_C}{dt}$ 移项，$\frac{dv_C}{dt} = \frac{i_C}{C}$。`,
            },
            { key: 'D', text: R`$-12\text{ V/s}$`, correct: true },
          ],
          feedback_correct: R`在无源符号约定下，$\dfrac{dv_C(0^+)}{dt} = \dfrac{i_C(0^+)}{C} = \dfrac{-3\text{ A}}{0.25\text{ F}} = -12\text{ V/s}$。负号说明电容在 $t=0^+$ 瞬间正立刻开始对外放电。`,
          feedback_wrong: R`用本构关系 $\frac{dv_C}{dt} = \frac{i_C}{C}$，并注意无源符号约定下 $i_C$ 的正负。`,
          figure: SVG_Q3,
          sync: at(L2, ['psc_arrows'], 'demo'),
        },
        {
          id: 'w4l6_q4',
          question: R`关于直流激励下的二阶 RLC 开关电路在 $t=0^+$ 与 $t=\infty$ 两个时刻的导数，下列说法完全正确的是？`,
          options: [
            {
              key: 'A',
              text: R`两个时刻的 $\dfrac{dv_C}{dt}$ 与 $\dfrac{di_L}{dt}$ 都必然等于 $0$`,
              correct: false,
              feedback: R`$t=\infty$ 新稳态的导数确实为 $0$，但 $t=0^+$ 是过渡过程的起点：电感电压与电容电流在开关动作瞬间往往跃变为非零值，导数初值通常不为零（例题二：$\frac{dv_C(0^+)}{dt} = -12\text{ V/s}$）。`,
            },
            {
              key: 'B',
              text: R`$t=0^+$ 时刻 $\dfrac{dv_C(0^+)}{dt}$ 与 $\dfrac{di_L(0^+)}{dt}$ 通常非零；$t=\infty$ 新直流稳态时两者均为 $0$`,
              correct: true,
            },
            {
              key: 'C',
              text: R`$t=0^+$ 时刻两者必然为 $0$，$t=\infty$ 时刻两者通常非零`,
              correct: false,
              feedback: R`时刻搞反了：直流激励下 $t=\infty$ 一切电压电流恒定，导数必然为 $0$；通常非零的恰恰是 $t=0^+$ 的导数初值。`,
            },
            {
              key: 'D',
              text: '只要开关是断开动作，两个导数初值就必然为负',
              correct: false,
              feedback: R`导数的正负由 $t=0^+$ 替换电路里 $i_C(0^+)$、$v_L(0^+)$ 的实际方向决定，与开关是断开还是闭合无关：第 5 幕引导例题里开关正是断开动作，可 $\frac{dv_C(0^+)}{dt} = +4\text{ V/s}$，$\frac{di_L(0^+)}{dt} = 0$。`,
            },
          ],
          feedback_correct: R`直流激励下 $t=\infty$ 进入新稳态，所有电压电流恒定，导数均为 $0$；但 $t=0^+$ 是过渡过程起点，电感电压与电容电流往往发生跃变，因此一阶导数初值通常非零，必须通过 $t=0^+$ 等效替换电路求解。`,
          feedback_wrong: '分开想两个时刻：哪一个是过渡过程的起点，哪一个是过渡过程的终点？',
          figure: SVG_Q4,
          sync: at(L1, [], 'demo'),
        },
      ],
    },
  ],
};

export default W4_L6;
