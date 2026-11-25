// W3-L7 · 级联运放电路：零加载效应与多级增益分解 (lesson sheet: docs/lessons/W3-L7.md).
// The professor's text of the six acts, the act diagrams (sheetSvgs.ts), the guided example and
// the diagnostic quiz are reproduced from the sheet; every number was re-derived (model.test.ts)
// and agrees with it. Changes, of form unless stated:
// - the opening remarks open act 1 as a tip note; display formulas sit in the ① / ② / ③ cards (a
//   lead-in sentence of ② becomes the card's title); bulleted ① origins run as one paragraph;
//   act 2's five-step routine is its ③ card (each bold lead is a step label); act 4's ③
//   sub-bullets are calc steps;
// - [[id|…]] only links a term to the stage (the words are unchanged); the sheet gives no hover
//   map, so the stage ids are this lesson's;
// - the layer labels on the lens bar are shortened (the sheet's names are in the captions);
// - act 6 drops "与工程落地清单" from its title: §6.3 is the front-end build checklist,
//   implemented on the stage, not shown to students; the JSON headings lose "JSON";
// - anti-spoiler: the guided example is not one of the acts' worked examples, so no ③ card moves;
//   on layer 02 its chain keeps every number covered until the steps uncover them (d_show) and the
//   example is finished (done_params);
// - the guided steps have no options in the sheet: each gets three (the right one from
//   expected_answer, one built on common_mistake with the sheet's intervention as its intercept,
//   one more with its own intercept). Step 5's intervention is praise, so it is the right option's
//   feedback and the mistake option gets a written intercept; step 4's intercept says the −15 V
//   rail is the floor (地板), not the ceiling (天花板);
// - the long board lines are split in two (narrow screens);
// - added: subtitle line of the guided example's problem, the step diagrams, act 6's map and the
//   quiz figures (figures.ts); feedback for every wrong quiz option, written from the explanation.

import { lazy } from 'react';
import type { StageLesson, StageSync } from '../../types';
import { MINI_1, MINI_2, MINI_3, MINI_4, MINI_5, PROBLEM_SVG, SVG_ACT6, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './figures';
import { L1, L2, L3 } from './parts';
import { SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5 } from './sheetSvgs';

const LoadingLayer = lazy(() => import('./LoadingLayer'));
const ChainLayer = lazy(() => import('./ChainLayer'));
const GlobalLayer = lazy(() => import('./GlobalLayer'));

const R = String.raw;

const at = (layer: string, halo: string[], params: Record<string, unknown>): StageSync => ({ layer, halo, params });

/** the guided example's chain on layer 02, at input `vi`, with `show` uncovered */
const drill = (vi: number, show: string[]) => ({ l2_circuit: 'drill', d_vi: vi, d_show: show });

const W3_L7: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: LoadingLayer, [L2]: ChainLayer, [L3]: GlobalLayer },
  lesson_meta: {
    lesson_id: 'W3-L7',
    world: 'World 3',
    title: '级联运放电路：零加载效应与多级增益分解',
    subtitle: 'Cascaded Op Amp Circuits: Zero Loading Effect & Multi-Stage Gain Decomposition',
    lesson_type: 'B',
    lesson_type_label: 'Type B（纯公式/方法论课）',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Section 5.8 Cascaded Op Amp Circuits (p. 189–191)', 'Fig. 5.23', 'Eq. 5.21', 'Example 5.8', 'Example 5.9'],
    },
    prerequisites: [
      'W3-L3：反相放大器（Inverting Amplifier）',
      'W3-L4：同相放大器与电压跟随器（Noninverting Amplifier & Voltage Follower）',
      'W3-L5：反相加法器（Summing Amplifier）',
    ],
    next_lesson: 'W3-L8',
    next_lesson_title: '运放工程综合实战（二进制加权 DAC、仪表放大器与比较器边界总结）',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 加载塌陷 vs 零加载',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '无源级联加载塌陷 vs 运放级联零加载对比：拖动后级输入电阻 R_in2，切换“无源直连 / 理想运放隔离”，看 v₁ 塌不塌、总增益离 0.25 有多远。',
      },
      {
        id: L2,
        label: '02 逐级电位追踪',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '多级运放逐级电位追踪与增益链：自左向右算出每一级输出，下方“电源轨走廊”里越轨的一级变红、被钳位，后级拿到的是钳位值。',
      },
      {
        id: L3,
        label: '03 局部级联 vs 跨级反馈',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '局部级联 vs 跨级全局反馈辨析台：闭合跨级电阻 R_G，乘法法则失效，徽章切换到全局节点法。',
      },
    ],
    hover_map: {
      ld_src: { label: '输入 vᵢ = 10 V', desc: '两级分压器的输入电压（对地）' },
      ld_r1: { label: '前级上臂 R = 10 kΩ', desc: '第一级分压器的上臂电阻' },
      ld_r2: { label: '前级下臂 R = 10 kΩ', desc: '无源直连时，后级的输入电阻 R_in2 直接并联在它两端' },
      ld_v1: { label: '前级输出节点 v₁', desc: '空载 5.0 V；无源直连时被后级拽低（R_in2 = 20 kΩ 时只剩 4.0 V），运放隔离时纹丝不动' },
      ld_vo: { label: '后级输出 vₒ', desc: '后级分压器自身增益 0.5：vₒ = v₁ / 2' },
      ld_stage2: { label: '后级分压器（输入电阻 R_in2）', desc: '两只 R_in2/2 电阻：自身增益恒为 0.5，对前级来说是一个 R_in2 的负载' },
      ld_iload: { label: '级间电流 i_load', desc: '后级从前级节点抽走的电流 v₁ / R_in2：无源时它拽低 v₁，运放隔离时由电源轨提供' },
      ld_buffer: { label: '理想运放（电压跟随器）', desc: '输入端 i₊ = 0（不抽前级），输出端 R_o = 0（硬顶后级）' },
      ld_rth: { label: '前级输出内阻', desc: '无源分压器：R_th1 = R ∥ R = 5 kΩ ≠ 0；理想运放：R_o = 0' },
      ch_vi: { label: '输入信号', desc: '链路最左侧的已知输入（第 4 幕的加法器另有 v₂ = 2.0 V 经 R_b 输入）' },
      ch_u1: { label: '运放 U₁（第 1 级）', desc: '反相前级 A₁ = −R_f1/R₁；线性输出越过电源轨时三角形变红' },
      ch_u2: { label: '运放 U₂（第 2 级）', desc: '同相放大器（第 3 幕、引导例题）或反相加法器（第 4 幕）' },
      ch_u3: { label: '运放 U₃（第 3 级）', desc: '反相衰减级：|A₃| < 1' },
      ch_vo1: { label: '第 1 级输出 v_o1', desc: '零内阻电压源：接上后级也不变；越轨则钳位在电源轨' },
      ch_vo2: { label: '第 2 级输出 v_o2', desc: '由钳位后的 v_o1 算出：前级一旦削波，这里拿到的就是被污染的输入' },
      ch_vo3: { label: '第 3 级输出 v_o3', desc: '最终输出：只看它在不在电源轨以内是不够的' },
      ch_rf: { label: '各级反馈电阻 R_fk', desc: '自身反馈电流 i_fk 从运放输出端流经它：输出电流 KCL 里绝不能漏' },
      ch_rin: { label: '后级输入电阻', desc: '反相 / 加法后级的输入电阻有限，从前级输出抽走电流；同相后级 i₊ = 0' },
      ch_rl: { label: '负载 R_L = 2 kΩ', desc: '接在最终输出与地之间，末级输出电流要算上 vₒ / R_L' },
      ch_io: { label: '运放输出电流 i_ok', desc: 'KCL：i_ok = 自身反馈电流 i_fk + 后级（或负载）抽走的电流，流出为正' },
      ch_rails: { label: '电源轨走廊 ±V_CC', desc: '每一级输出都必须落在走廊内；越轨即饱和削波，后级拿到的是钳位值' },
      ch_gain: { label: '总增益 A = A₁A₂…Aₙ', desc: 'Eq. 5.21：只在无跨级反馈且各级都未饱和时成立' },
      gf_rg: { label: '跨级电阻 R_G = 30 kΩ', desc: '把第二级输出 vₒ 连回第一级反相输入 v₋₁：构成全局反馈，乘法法则失效' },
      gf_vm1: { label: '节点 v₋₁（虚地）', desc: '全局负反馈下仍有 v₋₁ = 0；闭合 R_G 后这里汇聚 R₁、R_f1、R_G 三条支路' },
      gf_rf1: { label: '局部反馈 R_f1 = 20 kΩ', desc: '第一级自身的反馈电阻（断开 R_G 时 A₁ = −2）' },
      gf_u1: { label: 'U₁ 反相级', desc: 'R₁ = 10 kΩ，R_f1 = 20 kΩ，局部 A₁ = −2' },
      gf_u2: { label: 'U₂ 同相级', desc: 'R₂ = 10 kΩ，R_f2 = 20 kΩ，局部 A₂ = +3：v₊₂ 无跨级回流，vₒ = A₂ v_o1 仍成立' },
      gf_vo1: { label: '中间节点 v_o1', desc: '闭合 R_G 时 v_o1 = vₒ / A₂ = −2/3 V（vᵢ = 1 V）' },
      gf_vo: { label: '输出 vₒ', desc: '断开 R_G：−6 V；闭合 R_G：−2 V（vᵢ = 1 V）' },
      gf_badge: { label: '分析方法', desc: '纯级联用乘法法则；存在跨级反馈时切回全局节点分析法' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '无源级联的“加载塌陷” vs 运放级联的“零加载奇迹”',
      sync: at(L1, ['ld_v1', 'ld_iload', 'ld_stage2'], { ld_mode: 'passive', ld_rin2: 20 }),
      blocks: [
        {
          kind: 'note',
          tone: 'tip',
          text: '**教授开场白**：同学们，前面几节课我们已经把反相放大器、同相放大器和加法器这些“单兵作战”的运放积木打磨得非常熟练了。但在真实工程世界里——从心电图前置放大链到音频调音台，再到精密传感器调理电路——你几乎不可能只用一颗运放干完所有活。我们要把多级运放**首尾相连**，也就是**级联（Cascade）**起来。',
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '今天这节课（对应 Sadiku《电路基础》2026 版第 5.8 节，p. 189–191）我们要彻底搞懂三个决定了你能否在考场和实验台上一击制胜的核心问题：**第一，为什么无源电阻级联一接就“塌陷”，而理想运放级联却能直接把各级增益相乘？第二，遇到多级混合运放电路，怎样做到算得又快又准、且绝不漏掉“中间级先行饱和”这颗暗雷？第三，什么时候绝对不能直接套用乘法法则，必须立刻切回全局节点分析？**',
        },
        { kind: 'p', text: R`**1.1 物理直觉：为什么 $0.5 \times 0.5$ 在电阻电路里不等于 $0.25$？**` },
        {
          kind: 'p',
          text: R`很多同学刚学电路时，脑子里都有一个非常自然的直觉：如果第一级电路把电压衰减一半（$A_1 = 0.5$），第二级电路也把电压衰减一半（$A_2 = 0.5$），那把两级串在一起，总增益不就应该是 $0.5 \times 0.5 = 0.25$ 吗？`,
        },
        { kind: 'p', text: '**在无源电阻网络中，这个直觉是错的！**' },
        { kind: 'p', text: R`假设我们拿两级完全相同的电阻分压器（每级由两个 $R = 10\text{ k}\Omega$ 电阻构成），输入 $v_i = 10\text{ V}$：` },
        {
          kind: 'ul',
          items: [
            R`**单级空载时**：第一级输出 $v_{o1} = 5.0\text{ V}$，空载增益 $A_1 = 0.5$。`,
            R`**直接级联后**：当你把第二级分压器接到第一级输出端 $v_1$ 时，第二级相当于一个总阻值为 $R_{\text{in2}} = R + R = 20\text{ k}\Omega$ 的负载，直接[[ld_stage2,ld_r2|**并联**]]在了第一级的下臂电阻 $R = 10\text{ k}\Omega$ 两端！第二级从第一级抽走了电流，强行把第一级的输出节点电位从 $5.0\text{ V}$ 拽低到了 $4.0\text{ V}$——这就是电路学中臭名昭著的[[ld_v1,ld_iload|**加载效应（Loading Effect）**]]。最终第二级输出只有 $2.0\text{ V}$，总增益跌至 $0.20$，平白蒸发了 $20\%$ 的信号幅度！`,
          ],
        },
        { kind: 'p', text: '而**理想运算放大器（Ideal Op Amp）**之所以在多级系统中堪称奇迹，核心就藏在它输出端的戴维南等效模型里：' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**核心机理（Zero Loading Effect）**：在理想运放模型中，输出端是一个[[ld_buffer,ld_rth|**输出电阻 $R_o = 0$ 的理想受控电压源**]]。无论后级电路的输入电阻 $R_{\text{in2}}$ 是 $100\text{ k}\Omega$ 还是 $1\text{ k}\Omega$，只要后级抽走的电流不超过运放的物理输出电流极限，级间分压系数恒为：$\displaystyle \frac{R_{\text{in2}}}{R_{\text{in2}} + R_o} = \frac{R_{\text{in2}}}{R_{\text{in2}} + 0} \equiv 1$ 换句话说，**后级需要多少电流，前级运放的输出级（通过供电电源轨 $\pm V_{CC}$）就按需补多少电流，而输出电压 $v_{o1}$ 纹丝不动！** 这就是[[ld_buffer|“级间隔离（Inter-stage Isolation）”]]的本质。`,
        },
        { kind: 'figure', svg: SVG_ACT1, caption: '1.2 内联 2D 原理图：无源加载塌陷 vs 理想运放零加载（对应左舞台 Layer 01）' },
        { kind: 'p', text: '**1.3 教授三段式板书推导：无源直连加载效应定量证明**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`欧姆定律与电阻串并联等效定理：后级分压器输入端等效阻值 $R_{\text{in2}} = R + R = 2R$ 并联在第一级下臂电阻 $R$ 两端。分压公式（Voltage Division Rule）：串联电阻网络中某段电阻两端电压与该段阻值成正比。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：设两级相同分压器的所有电阻均为 $R$。单级空载增益为：`,
          tex: R`A_{1,\text{unloaded}} = A_{2,\text{unloaded}} = \frac{R}{R + R} = \frac{1}{2}`,
        },
        { kind: 'formula', title: R`当两级直接级联时，节点 $v_1$ 对地的总等效电阻为：`, tex: R`R_{\text{eq}} = R \parallel (R + R) = \frac{R \cdot 2R}{R + 2R} = \frac{2}{3}R` },
        {
          kind: 'formula',
          title: R`于是第一级实际输出节点电压 $v_1$ 与第二级输出电压 $v_o$ 分别为：`,
          tex: R`\begin{gathered} v_1 = \frac{R_{\text{eq}}}{R + R_{\text{eq}}} v_i = \frac{\frac{2}{3}R}{R + \frac{2}{3}R} v_i = \frac{2}{5} v_i \\[8pt] v_o = \frac{R}{R + R} v_1 = \frac{1}{2} \left(\frac{2}{5} v_i\right) = \frac{1}{5} v_i \end{gathered}`,
        },
        {
          kind: 'formula',
          title: '因此无源直连的实际总电压增益为：',
          tex: R`A_{\text{passive}} = \frac{v_o}{v_i} = \frac{1}{5} < A_{1,\text{unloaded}} A_{2,\text{unloaded}} = \frac{1}{4}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: R`代入 $v_i = 10\text{ V}$、$R = 10\text{ k}\Omega$`, tex: R`R_{\text{eq}} = \frac{2}{3} \times 10\text{ k}\Omega = 6.667\text{ k}\Omega` },
            { label: R`$v_1$`, tex: R`v_1 = \frac{2}{5} \times 10\text{ V} = 4.0\text{ V} \quad (\text{较空载 } 5.0\text{ V 塌陷 } 1.0\text{ V})` },
            { label: R`$v_o$`, tex: R`v_o = \frac{1}{5} \times 10\text{ V} = 2.0\text{ V} \quad (\text{较理想乘积 } 2.5\text{ V 损失 } 20\%)` },
          ],
        },
        {
          kind: 'p',
          text: R`反之，若在两级之间插入[[ld_buffer|理想运放（$R_o = 0$）]]，则级间传递系数恒为 $1$，$v_1 = 5.0\text{ V}$，$v_o = 2.5\text{ V}$，总增益严格满足 $A = A_1 A_2 = 0.25$。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '级联增益乘法法则（Eq. 5.21）与“自左向右逐级解耦”黄金流程',
      sync: at(L2, ['ch_u1', 'ch_u2', 'ch_u3', 'ch_gain'], { l2_circuit: 'ex2', v_i: 0.25, V_rail: 12, l2_mode: 'high' }),
      blocks: [
        { kind: 'p', text: '**2.1 Sadiku Fig. 5.23 与 Eq. 5.21：把复杂大电路切成独立积木**' },
        {
          kind: 'p',
          text: '在 Sadiku 第 5.8 节中，[[ch_u1,ch_u2,ch_u3|**级联运放电路（Cascaded Op Amp Circuit）**]]被严格定义为：将两个或多个运放基本放大级首尾顺次相连，使得**前一级的输出端直接作为后一级的输入端，且不存在将后级信号反馈回前级输入端的跨级支路**。',
        },
        {
          kind: 'p',
          text: R`由于每一级理想运放的输出端都是一个零内阻受控电压源（$R_o = 0$），前级输出电压 $v_k$ 仅由前级自身电路拓扑和输入决定，完全不受后级接入与否的影响。由此直接导出 **Sadiku Eq. 5.21**：`,
        },
        { kind: 'formula', title: 'Sadiku Eq. 5.21', tex: R`A = \frac{v_o}{v_i} = A_1 A_2 A_3 \cdots A_n` },
        { kind: 'p', text: R`其中 $A_k = \frac{v_{ok}}{v_{o(k-1)}}$ 为第 $k$ 级单独工作时的闭环电压增益。` },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授特别提醒（高频易错点）**：级联运放的**电压是逐级独立、零加载的**，但[[ch_rin,ch_io|**级间电流并不是零**]]！如果第 $k+1$ 级是反相放大器（输入电阻 $R_{\text{in}(k+1)} = R_{k+1}$ 有限），它会从第 $k$ 级输出端抽取电流 $i_{\text{in}(k+1)} = \frac{v_{ok}}{R_{k+1}}$。只不过因为第 $k$ 级运放输出内阻 $R_o = 0$，这股电流**不会拉低 $v_{ok}$**，但它会与第 $k$ 级自身的反馈电流 $i_{fk}$ 一起，构成第 $k$ 级运放输出端的[[ch_io|总输出电流 $i_{ok}$]]！`,
        },
        { kind: 'figure', svg: SVG_ACT2, caption: '2.2 内联 2D 原理图：Sadiku Fig. 5.23 三级级联增益链与逐级电位气泡（对应左舞台 Layer 02）' },
        { kind: 'p', text: '**2.3 教授三段式板书推导：Eq. 5.21 与“自左向右逐级解耦”五步法**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`理想运放三公理：① 虚短 $v_+ = v_-$（负反馈线性区）；② 虚断 $i_+ = i_- = 0$；③ 零输出内阻 $R_o = 0$。基尔霍夫电流定律（KCL）：任一运放输出节点的流出电流等于该节点相连所有外部支路电流之和。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：设电路由 $n$ 级局部负反馈运放顺序级联而成，且无跨级反馈支路。因为第 $k$ 级输出内阻 $R_{ok} = 0$，接入第 $k+1$ 级后，第 $k$ 级闭环传递关系不变：`,
          tex: R`v_{o1} = A_1 v_i, \quad v_{o2} = A_2 v_{o1}, \quad \dots, \quad v_{on} = A_n v_{o(n-1)}`,
        },
        {
          kind: 'formula',
          title: '由链式恒等式直接得到总电压增益（Eq. 5.21）：',
          tex: R`A = \frac{v_{on}}{v_i} = \frac{v_{o1}}{v_i} \cdot \frac{v_{o2}}{v_{o1}} \cdots \frac{v_{on}}{v_{o(n-1)}} = \prod_{k=1}^{n} A_k`,
        },
        { kind: 'formula', title: R`同时，对第 $k$ 级运放输出端写 KCL，得该级运放实际须提供的输出电流：`, tex: R`i_{ok} = i_{fk} + i_{\text{in}(k+1)}` },
        {
          kind: 'p',
          text: R`其中 $i_{fk}$ 为第 $k$ 级自身反馈电阻支路电流，$i_{\text{in}(k+1)}$ 为第 $k+1$ 级从该节点抽取的输入电流（若后级为同相端接入，则 $i_{\text{in}(k+1)} = 0$；若后级为反相端接入，则 $i_{\text{in}(k+1)} = \frac{v_{ok}}{R_{k+1}}$）。`,
        },
        {
          kind: 'calc',
          title: '③ “自左向右逐级解耦”五步黄金解题流程',
          steps: [
            {
              label: '1. 拓扑体检',
              text: '检查是否存在从后级输出拉回前级输入端的**跨级全局反馈电阻**。若有，立刻停用乘法法则，改用第 5 幕的全局节点法；若无，进入第 2 步。',
            },
            { label: '2. 逐级识图写通式', text: R`自左向右给每一级贴标签（反相、同相、跟随器、加法器、减法器），分别写出各级的纯符号增益 $A_1, A_2, \dots, A_n$。` },
            { label: '3. 自左向右算电位', text: R`从最左侧已知输入出发，依次算出 $v_{o1} \to v_{o2} \to \dots \to v_o$。` },
            {
              label: '4. 逐级饱和安检',
              text: R`每算出一级电位 $v_{ok}$，立刻与该级[[ch_rails|电源轨 $[-V_{EE}, +V_{CC}]$]] 核对！一旦某一级越轨，后续所有级必须以**钳位后的饱和电压**作为输入继续计算。`,
            },
            {
              label: '5. KCL 核算输出电流',
              text: R`若题目要求求某一级输出电流 $i_{ok}$，回到该级输出节点，把[[ch_rf|**自身反馈支路电流**]]与**后级/负载抽走电流**叠加即可（切忌遗漏自身反馈电流！）。`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '经典实战（一）—— 两级混合级联与输出电流剖析（对应 Sadiku Example 5.8）',
      sync: at(L2, ['ch_rf', 'ch_io', 'ch_rl'], { l2_circuit: 'ex1', v_i: 0.4, V_rail: 15, l2_mode: 'high' }),
      blocks: [
        { kind: 'p', text: '**3.1 题目设定**' },
        { kind: 'p', text: R`考虑如图所示的两级混合级联运放电路，两颗运放均视为理想运放，对称电源轨为 $\pm 15\text{ V}$：` },
        {
          kind: 'ul',
          items: [
            R`**输入信号**：$v_i = 0.4\text{ V}$。`,
            R`**Stage 1（反相放大器）**：输入电阻 $R_1 = 2\text{ k}\Omega$，反馈电阻 $R_{f1} = 10\text{ k}\Omega$。`,
            R`**Stage 2（同相放大器）**：同相输入端直接接第一级输出 $v_{o1}$，反相端接地电阻 $R_2 = 4\text{ k}\Omega$，反馈电阻 $R_{f2} = 12\text{ k}\Omega$。`,
            R`[[ch_rl|**外部负载**]]：$R_L = 2\text{ k}\Omega$ 接于最终输出端 $v_o$ 与地之间。`,
          ],
        },
        { kind: 'p', text: R`**求解目标**：求总电压增益 $A$、各级输出电压 $v_{o1}$ 与 $v_o$，以及两颗运放的输出端电流 $i_{o1}$ 与 $i_{o2}$。` },
        { kind: 'figure', svg: SVG_ACT3, caption: '3.2 内联 2D 原理图：两级混合级联电路（反相级 → 同相级）' },
        { kind: 'p', text: '**3.3 教授三段式板书推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`拓扑检查：无跨级全局反馈支路，满足纯级联条件，适用 Sadiku Eq. 5.21（$A = A_1 A_2$）。前置模块公式：反相放大器 $A_{\text{inv}} = -\frac{R_f}{R_{\text{in}}}$；同相放大器 $A_{\text{non}} = 1 + \frac{R_f}{R_{\text{gnd}}}$。输出节点 KCL：定义 $i_{ok}$ 为**流出**第 $k$ 颗运放输出端的电流（若算得负值，表示运放输出端实际在**吸收/灌入**电流）。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式：各级电压增益与总增益：',
          tex: R`A_1 = -\frac{R_{f1}}{R_1}, \qquad A_2 = 1 + \frac{R_{f2}}{R_2}, \qquad A = A_1 A_2 = -\frac{R_{f1}}{R_1}\left(1 + \frac{R_{f2}}{R_2}\right)`,
        },
        { kind: 'formula', title: '各级输出电压：', tex: R`v_{o1} = A_1 v_i = -\frac{R_{f1}}{R_1} v_i, \qquad v_o = A_2 v_{o1} = A v_i` },
        {
          kind: 'formula',
          title: R`两颗运放输出电流（注意 Stage 1 虚地 $v_{-1} = 0$，Stage 2 虚短 $v_{-2} = v_{+2} = v_{o1}$ 且虚断 $i_{+2} = 0$）：`,
          tex: R`\begin{gathered} i_{o1} = \frac{v_{o1} - v_{-1}}{R_{f1}} + i_{+2} = \frac{v_{o1}}{R_{f1}} \\[8pt] i_{o2} = i_{f2} + i_L = \frac{v_o - v_{-2}}{R_{f2}} + \frac{v_o}{R_L} = \frac{v_o - v_{o1}}{R_{f2}} + \frac{v_o}{R_L} \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '第一步：计算增益与逐级电位',
              tex: R`A_1 = -\frac{10\text{ k}\Omega}{2\text{ k}\Omega} = -5, \qquad A_2 = 1 + \frac{12\text{ k}\Omega}{4\text{ k}\Omega} = +4, \qquad A = (-5)(+4) = -20`,
            },
            { label: R`$v_{o1}$`, tex: R`v_{o1} = (-5) \times 0.4\text{ V} = -2.0\text{ V} \quad (|-2.0\text{ V}| < 15\text{ V，线性区 ✓})` },
            { label: R`$v_o$`, tex: R`v_o = (+4) \times (-2.0\text{ V}) = -8.0\text{ V} \quad (|-8.0\text{ V}| < 15\text{ V，线性区 ✓})` },
            {
              label: '第二步：核算两级运放输出电流',
              tex: R`i_{o1} = \frac{-2.0\text{ V}}{10\text{ k}\Omega} = -0.20\text{ mA} \quad (\text{即 } U_1 \text{ 输出端吸收 } 0.20\text{ mA 反馈电流})`,
            },
            { label: R`$i_{f2}$`, tex: R`i_{f2} = \frac{-8.0\text{ V} - (-2.0\text{ V})}{12\text{ k}\Omega} = \frac{-6.0\text{ V}}{12\text{ k}\Omega} = -0.50\text{ mA}` },
            { label: R`$i_L$`, tex: R`i_L = \frac{-8.0\text{ V}}{2\text{ k}\Omega} = -4.00\text{ mA}` },
            { label: R`$i_{o2}$`, tex: R`i_{o2} = i_{f2} + i_L = -0.50\text{ mA} + (-4.00\text{ mA}) = -4.50\text{ mA} \quad (\text{即 } U_2 \text{ 吸收 } 4.50\text{ mA})` },
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授点评**：请盯紧 [[ch_io|$i_{o1} = -0.20\text{ mA}$]] 这个结果！考试中至少有三分之一的学生因为看到后级是同相输入（$i_{+2} = 0$），就脱口而出“$i_{o1} = 0$”。错了！**零加载不等于零电流**，第一级运放的[[ch_rf|反馈电阻 $R_{f1}$]] 依然接在它的输出端上，必须把自身反馈电流算进去。`,
        },
      ],
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '经典实战（二）—— 三级混合级联与“中间级先行饱和削波”警报（对应 Sadiku Example 5.9 进阶）',
      sync: at(L2, ['ch_u1', 'ch_vo1', 'ch_rails'], { l2_circuit: 'ex2', v_i: 1.5, V_rail: 12, l2_mode: 'high' }),
      blocks: [
        { kind: 'p', text: '**4.1 工程暗雷：最终输出看似没超轨，整条链路却已经失真！**' },
        { kind: 'p', text: R`许多同学做级联运放题时，习惯直接把总公式一乘到底，最后看一眼 $|v_o| < V_{CC}$ 就高枕无忧地交卷了。**在工程和考试中，这是最致命的盲区！**` },
        { kind: 'p', text: R`如果一个三级系统的电源轨是 $\pm 12\text{ V}$：` },
        {
          kind: 'ul',
          items: [
            R`**Stage 1（反相前级）**：输入 $v_1 = 1.5\text{ V}$，$R_1 = 2\text{ k}\Omega$，$R_{f1} = 20\text{ k}\Omega$（$A_1 = -10$）。`,
            R`**Stage 2（反相加法器）**：将 $v_{o1}$（经 $R_a = 10\text{ k}\Omega$）与另一路输入 $v_2 = 2.0\text{ V}$（经 $R_b = 5\text{ k}\Omega$）相加，反馈电阻 $R_{f2} = 10\text{ k}\Omega$。`,
            R`**Stage 3（反相衰减级）**：输入电阻 $R_3 = 20\text{ k}\Omega$，反馈电阻 $R_{f3} = 10\text{ k}\Omega$（$A_3 = -0.5$）。`,
          ],
        },
        {
          kind: 'p',
          text: R`**盲算陷阱**：如果你不查中间电位，直接把 $v_{o1,\text{ideal}} = -15.0\text{ V}$ 往后代，会算出 $v_{o2,\text{naive}} = +11.0\text{ V}$、$v_{o3,\text{naive}} = -5.5\text{ V}$——看起来都在 $\pm 12\text{ V}$ 以内，好像风平浪静！`,
        },
        {
          kind: 'p',
          text: R`**物理真相**：[[ch_u1|第一颗运放 $U_1$]] 的[[ch_rails|电源轨只有 $\pm 12\text{ V}$]]，它根本吐不出 $-15.0\text{ V}$！$v_{o1}$ 在第一级出口就被死死钳位在了 [[ch_vo1|**$-12.0\text{ V}$**]]！一旦信号在第一级被“削了头”，后面不管怎么加减、怎么衰减，被切掉的信息永远找不回来了！`,
        },
        { kind: 'figure', svg: SVG_ACT4, caption: '4.2 内联 2D 原理图：三级混合级联与中间级饱和警报（对应左舞台 Layer 02）' },
        { kind: 'p', text: '**4.3 教授三段式板书推导**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`逐级解耦公理（无跨级反馈）+ 运放物理饱和约束（Saturation Clipping）：任一级实际输出必须满足 $v_{ok,\text{actual}} = \text{clip}\left(v_{ok,\text{linear}}, -V_{EE}, +V_{CC}\right)$。反相加法器通式（W3-L5）：$v_{o2} = -\left(\frac{R_{f2}}{R_a} v_{o1} + \frac{R_{f2}}{R_b} v_2\right)$。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式：三级依次传递关系：',
          tex: R`\begin{gathered} v_{o1,\text{linear}} = -\frac{R_{f1}}{R_1} v_1, \qquad v_{o1} = \text{clip}\left(v_{o1,\text{linear}}, -V_{EE}, +V_{CC}\right) \\[8pt] v_{o2,\text{linear}} = -\left(\frac{R_{f2}}{R_a} v_{o1} + \frac{R_{f2}}{R_b} v_2\right), \qquad v_{o2} = \text{clip}\left(v_{o2,\text{linear}}, -V_{EE}, +V_{CC}\right) \\[8pt] v_{o3,\text{linear}} = -\frac{R_{f3}}{R_3} v_{o2}, \qquad v_o = \text{clip}\left(v_{o3,\text{linear}}, -V_{EE}, +V_{CC}\right) \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`代入 $V_{CC} = 12\text{ V}, V_{EE} = 12\text{ V}$，$v_1 = 1.5\text{ V}, v_2 = 2.0\text{ V}$ · **Stage 1（反相前级）**`,
              tex: R`v_{o1,\text{linear}} = -\frac{20\text{ k}\Omega}{2\text{ k}\Omega} \times 1.5\text{ V} = -15.0\text{ V}`,
            },
            { label: R`由于 $-15.0\text{ V} < -12.0\text{ V}$，**Stage 1 发生负向饱和削波**：`, tex: R`v_{o1,\text{actual}} = -12.0\text{ V}` },
            {
              label: R`**Stage 2（反相加法器）**：必须把**钳位后**的 $v_{o1,\text{actual}} = -12.0\text{ V}$ 代入：`,
              tex: R`v_{o2,\text{actual}} = -\left(\frac{10\text{ k}\Omega}{10\text{ k}\Omega}(-12.0\text{ V}) + \frac{10\text{ k}\Omega}{5\text{ k}\Omega}(2.0\text{ V})\right) = -(-12.0\text{ V} + 4.0\text{ V}) = +8.0\text{ V}`,
            },
            { label: '注', text: R`（注：$|+8.0\text{ V}| < 12\text{ V}$，Stage 2 自身未饱和，但输入信号已被污染；若盲用 $-15.0\text{ V}$ 会误算为 $+11.0\text{ V}$。）` },
            { label: '**Stage 3（反相衰减级）**', tex: R`v_{o,\text{actual}} = -\frac{10\text{ k}\Omega}{20\text{ k}\Omega} \times (+8.0\text{ V}) = -4.0\text{ V}` },
            { label: '对比', text: R`与盲算线性结果 $-5.5\text{ V}$ 相比，绝对误差达 $1.5\text{ V}$，相对失真高达 $-27.3\%$。` },
            {
              label: R`**增益分配修复（Gain Staging）**：将 $R_{f1}$ 由 $20\text{ k}\Omega$ 减半至 $10\text{ k}\Omega$（$A_1 = -5$），同时将 $R_a$ 由 $10\text{ k}\Omega$ 减半至 $5\text{ k}\Omega$（$v_{o1}$ 通道权重翻倍为 $-2$），则：`,
              tex: R`\begin{gathered} v_{o1,\text{fix}} = (-5)(1.5\text{ V}) = -7.5\text{ V} \quad (\text{安全 ✓}) \\[6pt] v_{o2,\text{fix}} = -\left(2(-7.5\text{ V}) + 2(2.0\text{ V})\right) = +11.0\text{ V} \quad (\text{安全 ✓}) \\[6pt] v_{o,\text{fix}} = (-0.5)(+11.0\text{ V}) = -5.5\text{ V} \quad (\text{完全恢复无失真线性输出 ✓}) \end{gathered}`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '隐蔽陷阱辨析 —— 局部级联 vs 跨级全局反馈',
      sync: at(L3, ['gf_rg', 'gf_vm1'], { gf_rg: true, gf_vi: 1 }),
      blocks: [
        { kind: 'p', text: R`**5.1 什么时候乘法法则 $A = A_1 A_2$ 彻底失效？**` },
        { kind: 'p', text: '并不是“图上画了两颗首尾相连的运放”就一定能用乘法法则！请牢记教授的[[gf_rg|**跨级反馈红线**]]：' },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**红线判定标准**：用手指从第二级输出端 $v_o$ 出发，沿着电路图往回看——只要发现哪怕[[gf_rg|**一根电阻（或电容）跨过第一级运放，把后级输出 $v_o$ 连回第一级的输入节点**]]（[[gf_vm1|$v_{-1}$ 或 $v_{+1}$]]），这就不再是纯级联电路，而是**全局反馈耦合网络（Global Feedback Network）**！`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`此时前级反相端 $v_{-1}$ 的 KCL 方程中同时出现了 $v_{o1}$ 和 $v_o$，两级状态深度耦合，**$A \neq A_1 A_2$**，必须毫不犹豫地回归[[gf_badge|**全局节点分析法（Nodal Analysis）**]]！`,
        },
        { kind: 'figure', svg: SVG_ACT5, caption: '5.2 内联 2D 原理图：局部纯级联 vs 跨级全局负反馈辨析台（对应左舞台 Layer 03）' },
        { kind: 'p', text: '**5.3 教授三段式板书推导：全局节点分析法破解跨级反馈**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`反馈极性核验：$v_{-1} \uparrow \implies v_{o1} \downarrow$（反相）$\implies v_o \downarrow$（同相）$\implies$ 经 $R_G$ 拉低 $v_{-1}$，构成**稳定的全局负反馈**，故两颗运放均满足虚短与虚断公理。对节点 $v_{-1} = 0$ 列 KCL（三条支路汇聚：$R_1, R_{f1}, R_G$）。Stage 2 自身输入端 $v_{+2}$ 无跨级回流，仍满足标准同相放大器关系 $v_o = A_2 v_{o1}$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：由节点 $v_{-1} = 0$ 的 KCL 方程与 Stage 2 局部方程联立：`,
          tex: R`\begin{cases} \dfrac{v_i - 0}{R_1} + \dfrac{v_{o1} - 0}{R_{f1}} + \dfrac{v_o - 0}{R_G} = 0 \\[10pt] v_o = \left(1 + \dfrac{R_{f2}}{R_2}\right) v_{o1} \triangleq A_2 v_{o1} \end{cases}`,
        },
        {
          kind: 'formula',
          title: R`将 $v_{o1} = \dfrac{v_o}{A_2}$ 代入第一式消去中间变量 $v_{o1}$：`,
          tex: R`\frac{v_i}{R_1} + v_o \left(\frac{1}{A_2 R_{f1}} + \frac{1}{R_G}\right) = 0`,
        },
        {
          kind: 'formula',
          title: '整理得含跨级全局反馈时的精确闭环增益通式：',
          tex: R`A_{\text{global}} = \frac{v_o}{v_i} = -\frac{1}{R_1 \left(\dfrac{1}{A_2 R_{f1}} + \dfrac{1}{R_G}\right)} = -\frac{A_2 R_{f1} R_G}{R_1 \left(R_G + A_2 R_{f1}\right)}`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**极限自检**：令 $R_G \to \infty$（断开跨级电阻），分子分母同除以 $R_G$，上式立即退化为 $-\dfrac{R_{f1}}{R_1} A_2 = A_1 A_2$，完美回到纯级联乘法法则！`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`代入 $R_1 = 10\text{ k}\Omega, R_{f1} = 20\text{ k}\Omega, R_2 = 10\text{ k}\Omega, R_{f2} = 20\text{ k}\Omega, R_G = 30\text{ k}\Omega$，$v_i = 1.0\text{ V}$`,
              tex: R`A_2 = 1 + \frac{20\text{ k}\Omega}{10\text{ k}\Omega} = +3`,
            },
            { label: R`$A_{\text{global}}$`, tex: R`A_{\text{global}} = -\frac{3 \times 20 \times 30}{10 \times (30 + 3 \times 20)} = -\frac{1800}{10 \times 90} = -2` },
            {
              label: '于是实际节点电压为：',
              tex: R`v_o = (-2) \times 1.0\text{ V} = -2.0\text{ V}, \qquad v_{o1} = \frac{v_o}{A_2} = -\frac{2}{3}\text{ V} \approx -0.667\text{ V}`,
            },
            { label: '对比', text: R`（对比：若误用纯级联乘法法则，会算出 $A = (-2)(+3) = -6$、$v_o = -6.0\text{ V}$，整整错出三倍！）` },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 6: guided example + self-test */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式 5 步实战演练与诊断测验',
      sync: at(L2, ['ch_u1', 'ch_u2', 'ch_u3'], drill(0.25, [])),
      blocks: [
        { kind: 'p', text: '**6.1 苏格拉底式分步引导例题（三级混合运放 + 输出电流 + 中间级饱和检验）**' },
        { kind: 'figure', svg: SVG_ACT6, caption: '本幕演练的路线图：第 2 幕的五步黄金流程' },
        {
          kind: 'guided',
          title: '三级混合级联运放全流程解剖：增益、电流与中间级饱和暗雷',
          problem: R`三颗理想运放顺序级联，对称电源轨 $\pm 15\text{ V}$。**Stage 1** 为反相放大器（$R_1 = 2\text{ k}\Omega$，$R_{f1} = 16\text{ k}\Omega$）；**Stage 2** 为同相放大器（$R_2 = 5\text{ k}\Omega$，$R_{f2} = 15\text{ k}\Omega$）；**Stage 3** 为反相衰减级（$R_3 = 20\text{ k}\Omega$，$R_{f3} = 5\text{ k}\Omega$），末级输出接负载 $R_L = 2\text{ k}\Omega$。先在常规输入 $v_i = 0.25\text{ V}$ 下求增益、各级电位与输出电流，再把输入翻倍到 $v_i = 0.50\text{ V}$ 做过载测试。`,
          problem_svg: PROBLEM_SVG,
          steps: [
            {
              title: 'Step 1 · 拓扑判定与逐级增益分解',
              mini_svg: MINI_1,
              question: '观察三级电路：是否存在跨级全局反馈电阻？若无，请分别写出三级各自的闭环增益 A₁、A₂、A₃ 及总线性增益 A。',
              hint: R`$A_1 = -\frac{R_{f1}}{R_1}, \quad A_2 = 1 + \frac{R_{f2}}{R_2}, \quad A_3 = -\frac{R_{f3}}{R_3}, \quad A = A_1 A_2 A_3$`,
              options: [
                {
                  text: R`无跨级反馈，适用乘法法则：$A_1 = -8$，$A_2 = +3$，$A_3 = -0.25$，总增益 $A = +6$`,
                  correct: false,
                  feedback: '停一下！看清楚 Stage 2 的接法：前级输出进了它的同相端（+），同相放大器增益公式里那个“1 +”绝对不能丢！另外，两级反相负负得正，总增益一定是正数。',
                },
                {
                  text: R`无跨级反馈，适用乘法法则：$A_1 = -8$，$A_2 = +4$，$A_3 = -0.25$，总增益 $A = (-8)\times(+4)\times(-0.25) = +8$`,
                  correct: true,
                  feedback: R`拓扑体检通过、三级标签贴对：两次反相负负得正，$A = +8$。注意这还只是“纸面”增益——能不能真的乘出来，要等第 4 步的饱和安检说了算。`,
                },
                {
                  text: R`无跨级反馈，适用乘法法则：$A_1 = -8$，$A_2 = +4$，$A_3 = -4$，总增益 $A = +128$`,
                  correct: false,
                  feedback: R`Stage 3 的比值倒过来了！反相级增益永远是“反馈电阻 ÷ 输入电阻”：$A_3 = -\frac{R_{f3}}{R_3} = -\frac{5}{20}$。它叫“衰减级”，正是因为 $|A_3| < 1$。`,
                },
              ],
              board: [R`A_1 = -\frac{16}{2} = -8, \quad A_2 = 1 + \frac{15}{5} = +4, \quad A_3 = -\frac{5}{20} = -0.25`, R`\implies A = (-8)(+4)(-0.25) = +8`],
              halo: ['ch_u1', 'ch_u2', 'ch_u3'],
              params: drill(0.25, []),
              layer: L2,
            },
            {
              title: 'Step 2 · 常规输入（v_i = 0.25 V）自左向右电位追踪',
              mini_svg: MINI_2,
              question: '当输入 v_i = 0.25 V、电源轨为 ±15 V 时，请自左向右依次计算 v_o1、v_o2、v_o3，并核对每一级是否都在线性区。',
              hint: R`$v_{o1} = A_1 v_i, \quad v_{o2} = A_2 v_{o1}, \quad v_{o3} = A_3 v_{o2}, \quad |v_{ok}| < 15\text{ V}$`,
              options: [
                {
                  text: R`直接用总增益：$v_{o3} = 8 \times 0.25 = +2.0\text{ V}$，远小于 $15\text{ V}$，中间级不用再查`,
                  correct: false,
                  feedback: '就算最终结果 +2.0 V 看起来很温柔，也绝对不能跳过中间级！养成肌肉记忆：先算 v_o1 = -2.0 V，再算 v_o2 = -8.0 V，确认每一级都在 ±15 V 铁轨以内。',
                },
                {
                  text: R`$v_{o1} = +2.0\text{ V}$，$v_{o2} = +8.0\text{ V}$，$v_{o3} = -2.0\text{ V}$；三级均在线性区`,
                  correct: false,
                  feedback: R`极性从第一级就错了：Stage 1 是反相放大器，正的 $v_i$ 进去出来的是负电压，$v_{o1} = (-8)(0.25\text{ V})$ 应为负值；之后每一级都按自己的增益符号逐级传下去。`,
                },
                {
                  text: R`$v_{o1} = -2.0\text{ V}$，$v_{o2} = -8.0\text{ V}$，$v_{o3} = +2.0\text{ V}$；三级绝对值均小于 $15\text{ V}$，全部工作在线性区`,
                  correct: true,
                  feedback: '逐级追踪、逐级安检，一步不跳：−2.0 V → −8.0 V → +2.0 V，三级都在 ±15 V 铁轨以内。',
                },
              ],
              board: [
                R`v_i = 0.25\text{ V} \implies v_{o1} = -2.0\text{ V} \; (\checkmark)`,
                R`\implies v_{o2} = -8.0\text{ V} \; (\checkmark) \implies v_{o3} = +2.0\text{ V} \; (\checkmark)`,
              ],
              halo: ['ch_vo1', 'ch_vo2', 'ch_vo3', 'ch_rails'],
              params: drill(0.25, ['A']),
              layer: L2,
            },
            {
              title: 'Step 3 · 级间电流 i_o2 与末级输出电流 i_o3（KCL 核算）',
              mini_svg: MINI_3,
              question: '仍在 v_i = 0.25 V 条件下，求第二级运放输出电流 i_o2（流出为正）和第三级运放输出电流 i_o3（接 R_L = 2 kΩ）。',
              hint: R`$i_{o2} = \frac{v_{o2} - v_{o1}}{R_{f2}} + \frac{v_{o2} - 0}{R_3}, \qquad i_{o3} = \frac{v_{o3} - 0}{R_{f3}} + \frac{v_{o3}}{R_L}$`,
              options: [
                {
                  text: R`$i_{o2} = -0.80\text{ mA}$（吸收 $0.80\text{ mA}$）；$i_{o3} = +1.40\text{ mA}$（提供 $1.40\text{ mA}$）`,
                  correct: true,
                  feedback: R`输出端 KCL 两条支路都没漏：$U_2$ 的 $R_{f2}$ 与 $R_3$ 各走 $-0.40\text{ mA}$，$U_3$ 的 $R_{f3}$ 走 $0.40\text{ mA}$、$R_L$ 走 $1.00\text{ mA}$。`,
                },
                {
                  text: R`$i_{o2} = -0.40\text{ mA}$；$i_{o3} = +1.00\text{ mA}$`,
                  correct: false,
                  feedback:
                    '记住输出端 KCL 的铁律：每一颗运放输出端都同时连着“自己的反馈电阻”和“下一级/负载”。Stage 2 的 v_-2 = v_o1 = -2 V，所以反馈支路还要走 (-8 - (-2))/15 kΩ = -0.40 mA！' +
                    R`Stage 3 同理：$R_L$ 之外还有 $R_{f3}$ 支路。`,
                },
                {
                  text: R`$i_{o2} \approx -0.93\text{ mA}$；$i_{o3} = +1.40\text{ mA}$`,
                  correct: false,
                  feedback: R`$U_3$ 算对了，$U_2$ 的反馈电流算多了：你把 Stage 2 的反相端当成了虚地。Stage 2 是同相级，虚短让 $v_{-2} = v_{+2} = v_{o1} = -2\text{ V}$，$R_{f2}$ 两端压差是 $-8 - (-2) = -6\text{ V}$，不是 $-8\text{ V}$。`,
                },
              ],
              board: [
                R`i_{o2} = \frac{-8 - (-2)}{15\text{ k}\Omega} + \frac{-8}{20\text{ k}\Omega} = -0.40 - 0.40 = -0.80\text{ mA}`,
                R`i_{o3} = \frac{2.0}{5\text{ k}\Omega} + \frac{2.0}{2\text{ k}\Omega} = 0.40 + 1.00 = +1.40\text{ mA}`,
              ],
              halo: ['ch_io', 'ch_rf', 'ch_rin', 'ch_rl'],
              params: drill(0.25, ['A', 'v1', 'v2', 'v3']),
              layer: L2,
            },
            {
              title: 'Step 4 · 输入翻倍至 v_i = 0.50 V 时的中间级饱和安检',
              mini_svg: MINI_4,
              question: '现在把输入电压翻倍至 v_i = 0.50 V（电源轨仍为 ±15 V）。如果盲算总增益，v_o3 = 8 × 0.50 = +4.0 V 似乎远小于 15 V。请逐级检查：哪一级发生了先行饱和？',
              hint: R`$v_{o1} = A_1 v_i, \quad v_{o2,\text{ideal}} = A_2 v_{o1} \stackrel{?}{\in} [-15\text{ V}, +15\text{ V}]$`,
              options: [
                {
                  text: R`没有任何一级饱和：最终 $v_{o3} = +4.0\text{ V} < 15\text{ V}$，全链路工作在线性区`,
                  correct: false,
                  feedback:
                    '抓到暗雷了！Stage 2 的理论值是 -16.0 V，已经一头撞上了 -15 V 的地板（负轨）。前面放大太猛、后面又用 0.25 倍衰减回来，正是工程里最典型的“隐蔽中间级削波”！',
                },
                {
                  text: R`Stage 1 先行饱和：它的增益最大（$|A_1| = 8$），所以最先撞轨`,
                  correct: false,
                  feedback: R`增益大不等于先饱和，要看的是这一级输出电压的绝对值：$v_{o1} = (-8)(0.50\text{ V}) = -4.0\text{ V}$，离 $-15\text{ V}$ 还远。真正危险的是把这 $-4.0\text{ V}$ 再放大的那一级。`,
                },
                {
                  text: R`Stage 1 输出 $v_{o1} = -4.0\text{ V}$（线性）；Stage 2 理论输出 $v_{o2} = 4 \times (-4.0) = -16.0\text{ V}$，超出 $-15\text{ V}$ 负电源轨，发生先行负饱和，被钳位在 $-15.0\text{ V}$`,
                  correct: true,
                  feedback: R`暗雷排除！最终输出看起来只有几伏，可 Stage 2 已经一头撞上了负轨：从这里往后，所有级都只能拿钳位后的 $-15.0\text{ V}$ 继续算。`,
                },
              ],
              board: [
                R`v_i = 0.50\text{ V} \implies v_{o1} = -4.0\text{ V} \; (\checkmark)`,
                R`\implies v_{o2,\text{ideal}} = -16.0\text{ V} < -15\text{ V} \implies v_{o2,\text{actual}} = -15.0\text{ V} \; (\text{饱和削波！})`,
              ],
              halo: ['ch_vo1', 'ch_vo2', 'ch_vo3', 'ch_rails'],
              params: drill(0.5, ['A']),
              layer: L2,
            },
            {
              title: 'Step 5 · 计算失真后的真实末级输出并提出增益分配修复方案',
              mini_svg: MINI_5,
              question: '基于第 4 步钳位后的 v_o2 = -15.0 V，计算实际输出 v_o3；并提出一种不改变总线性增益 A = +8 的电阻修改方案，使 v_i = 0.50 V 时全链路无饱和。',
              hint: R`$v_{o3,\text{actual}} = A_3 \cdot v_{o2,\text{actual}}, \quad A_1' A_2' A_3' = +8 \text{ 且 } |v_{ok}'| < 15\text{ V}$`,
              options: [
                {
                  text: R`实际输出仍是 $v_{o3} = +4.00\text{ V}$：后面的 $0.25$ 倍衰减会把削波“救”回来；修复只需把电源轨加大`,
                  correct: false,
                  feedback: R`被削掉的那一截信号在 Stage 2 出口就永远丢了：Stage 3 只看得到钳位后的 $-15.0\text{ V}$，乘上 $A_3 = -0.25$ 得到的就不再是 $+4.00\text{ V}$。至于修复，题目要的是不改总增益、只改电阻的增益重新分配，不是换一组更高的电源轨。`,
                },
                {
                  text: R`实际输出 $v_{o3} = (-0.25)\times(-15.0\text{ V}) = +3.75\text{ V}$（而非 $+4.00\text{ V}$）。修复方案：将 Stage 1 改为 $R_{f1} = 8\text{ k}\Omega$（$A_1 = -4$），Stage 3 改为 $R_{f3} = 10\text{ k}\Omega$（$A_3 = -0.5$），总增益仍为 $(-4)(+4)(-0.5) = +8$，但 $v_{o1} = -2.0\text{ V}$、$v_{o2} = -8.0\text{ V}$、$v_{o3} = +4.0\text{ V}$，全链路留足余量`,
                  correct: true,
                  feedback:
                    '非常漂亮！记住增益分配（Gain Staging）的黄金原则：别让中间级把信号吹成气球再放气，把过高的前级增益匀给后级，就能在不改变总增益的前提下把动态余量拉满。',
                },
                {
                  text: R`实际输出 $v_{o3} = +3.75\text{ V}$。修复方案：把 Stage 2 改为 $R_{f2} = 5\text{ k}\Omega$（$A_2 = +2$），$v_{o2}$ 降到 $-8.0\text{ V}$，全链路不再饱和`,
                  correct: false,
                  feedback: R`$+3.75\text{ V}$ 算对了，可这个修复把总增益改成了 $(-8)(+2)(-0.25) = +4$，题目要求总线性增益保持 $+8$。正确思路是“匀”增益：前级降多少倍，后级就补回多少倍。`,
                },
              ],
              board: [
                R`v_{o3,\text{actual}} = (-0.25)(-15.0\text{ V}) = +3.75\text{ V} \neq +4.00\text{ V}`,
                R`\text{修复：} A_1'=-4, A_2'=+4, A_3'=-0.5 \implies v_{o2}' = -8.0\text{ V} \; (\checkmark)`,
              ],
              halo: ['ch_vo3', 'ch_u1', 'ch_u3'],
              params: drill(0.5, ['A', 'v1', 'v2']),
              layer: L2,
            },
          ],
          done_params: { d_done: true, v_i: 0.5, V_rail: 15, l2_mode: 'high' },
          conclusion: R`五步一步不落：拓扑体检 → 逐级增益 → 自左向右算电位 → 逐级饱和安检 → KCL 核算输出电流。$A = +8$ 只是纸面乘积：$v_i = 0.50\text{ V}$ 时 Stage 2 先行钳位在 $-15\text{ V}$，真实输出只有 $+3.75\text{ V}$。左侧舞台的引导例题已解锁：切到“均衡增益分配”，看同样的总增益怎样让全链路回到走廊里。`,
        },
        { kind: 'p', text: '**6.2 诊断测验（4 题）**' },
      ],
      quiz: [
        {
          id: 'w3l7_q1',
          question: '将两级理想运放放大器直接级联时，总电压增益严格等于 A = A₁ A₂（无后级加载前级导致的电压塌陷）。其最根本的物理原因是：',
          options: [
            {
              key: 'A',
              text: '后级运放电路的输入电阻一定为无穷大，不会从前级抽取任何电流',
              correct: false,
              feedback: R`“一定为无穷大”不成立：后级若是反相放大器，它的输入电阻就是有限的 $R_{\text{in2}}$，确实会从前级抽电流。零加载靠的不是“后级不抽电流”，而是前级抽多少都不掉电压。`,
            },
            {
              key: 'B',
              text: '前级理想运放的输出端等效为零内阻受控电压源（R_o = 0），无论后级抽取多少线性范围内电流，前级输出电压 v_o1 保持不变',
              correct: true,
            },
            {
              key: 'C',
              text: '理想运放开环增益 A_OL = ∞，因此两级之间不存在电流流动',
              correct: false,
              feedback: R`$A_{OL} = \infty$ 带来的是虚短（$v_+ = v_-$），不是“级间零电流”：反相后级照样从级间导线抽走 $v_{o1}/R_{\text{in2}}$。电压不塌陷的原因要到前级的输出端去找。`,
            },
            {
              key: 'D',
              text: '级联后两颗运放共用同一个虚地点，自动抵消了负载电阻的影响',
              correct: false,
              feedback: '两颗运放并不共用虚地：每颗运放的虚地只是它自己反相端的电位约束，后级是同相接入时甚至根本没有虚地。负载影响不是被“抵消”的，而是前级输出端根本不怕被拉。',
            },
          ],
          feedback_correct:
            '即使后级是反相放大器（其输入电阻等于有限的 R_in2，会从前级抽取电流），只要前级输出电阻 R_o = 0，级间分压比 R_in2 / (R_in2 + R_o) 恒为 1，前级输出电压 v_o1 不会跌落。因此 A、C 均错，B 揭示了核心物理本质。',
          feedback_wrong: '回到第 1 幕：级间分压比 R_in2 / (R_in2 + R_o) 里，哪个量让它恒等于 1？',
          figure: SVG_Q1,
          sync: { layer: L1 },
        },
        {
          id: 'w3l7_q2',
          question:
            '一个三级纯级联理想运放电路由以下三级顺序组成：Stage 1 为反相放大器（R₁ = 10 kΩ, Rf₁ = 30 kΩ）；Stage 2 为电压跟随器；Stage 3 为反相放大器（R₃ = 5 kΩ, Rf₃ = 20 kΩ）。若输入 v_i = 0.5 V，电源轨为 ±15 V，则最终输出电压 v_o 为：',
          options: [
            {
              key: 'A',
              text: '−6.0 V',
              correct: false,
              feedback: R`符号丢了：两级反相（$-3$ 与 $-4$）负负得正，电压跟随器 $A_2 = +1$ 不改变符号，所以输出不可能是负的。`,
            },
            {
              key: 'B',
              text: '+3.5 V',
              correct: false,
              feedback: R`增益不能相加：把两级反相增益的大小加起来（$3 + 4 = 7$）再乘 $0.5\text{ V}$ 没有物理意义。级联总增益是各级增益的**乘积** $A_1 A_2 A_3$。`,
            },
            { key: 'C', text: '+6.0 V', correct: true },
            {
              key: 'D',
              text: '+12.0 V',
              correct: false,
              feedback: R`$+12$ 是总增益 $A$ 的数值，不是输出电压：最后还要乘上输入 $v_i = 0.5\text{ V}$。`,
            },
          ],
          feedback_correct:
            '逐级增益：A₁ = −30/10 = −3，A₂ = +1（电压跟随器），A₃ = −20/5 = −4。总增益 A = (−3)(+1)(−4) = +12。逐级电位：v_o1 = −1.5 V，v_o2 = −1.5 V，v_o = (+12)(0.5 V) = +6.0 V，全部在线性区。',
          feedback_wrong: '先逐级写出 A₁、A₂、A₃（跟随器 A = +1），相乘得总增益，再乘输入，并检查每一级是否在 ±15 V 以内。',
          figure: SVG_Q2,
          sync: { layer: L2 },
        },
        {
          id: 'w3l7_q3',
          question: '某三级纯级联运放电路采用 ±12 V 对称供电，三级线性增益依次为 A₁ = +5、A₂ = −4、A₃ = +0.2。当输入信号 v_i = 0.8 V 时，电路的真实最终输出电压 v_o 为：',
          options: [
            {
              key: 'A',
              text: '−3.2 V（全链路未饱和）',
              correct: false,
              feedback: R`这正是“一乘到底”的盲算：$(+5)(-4)(+0.2)(0.8\text{ V}) = -3.2\text{ V}$ 默认每一级都线性。逐级查一下 Stage 2 的理论输出 $(-4)(+4.0\text{ V})$，它已越过 $-12\text{ V}$ 的负轨。`,
            },
            { key: 'B', text: '−2.4 V（Stage 2 先行负饱和被钳位在 −12 V）', correct: true },
            {
              key: 'C',
              text: '−12.0 V（末级发生饱和）',
              correct: false,
              feedback: R`末级增益只有 $+0.2$：它的输入就算被钳在电源轨上，输出也到不了 $-12\text{ V}$，末级不可能饱和。被钳位的是中间级的输出，钳位值还要再经过末级。`,
            },
            {
              key: 'D',
              text: '+2.4 V（极性反转且中间级饱和）',
              correct: false,
              feedback: R`极性判断错了：Stage 2 的线性输出越过的是**负**轨，被钳在 $-12\text{ V}$；末级增益 $+0.2$ 为正，不会把负电压翻成正电压。`,
            },
          ],
          feedback_correct:
            '自左向右逐级追踪：v_o1 = (+5)(0.8 V) = +4.0 V（未饱和）；v_o2,ideal = (−4)(+4.0 V) = −16.0 V，超出 −12 V 负轨，故 Stage 2 先行饱和并钳位在 v_o2,actual = −12.0 V；最终输出 v_o = (+0.2)(−12.0 V) = −2.4 V（盲算 −3.2 V 是典型错误）。',
          feedback_wrong: '别一乘到底：从 v_o1 开始，每算出一级就和 ±12 V 比一次。',
          figure: SVG_Q3,
          sync: { layer: L2 },
        },
        {
          id: 'w3l7_q4',
          question:
            '某两级运放电路中，Stage 1 为反相级（R₁ = 10 kΩ, Rf₁ = 40 kΩ），Stage 2 为同相级（R₂ = 10 kΩ, Rf₂ = 10 kΩ，局部增益 A₂ = +2）。现有一根跨级全局反馈电阻 R_G = 80 kΩ 将 Stage 2 输出 v_o 拉回 Stage 1 反相输入端 v₋₁。若 v_i = 2.0 V（电源轨 ±15 V），则真实输出 v_o 为：',
          options: [
            {
              key: 'A',
              text: '−16.0 V（按纯级联 A = −8 计算）',
              correct: false,
              feedback: R`存在跨级电阻 $R_G$ 时，$v_{-1}$ 的 KCL 里同时出现 $v_{o1}$ 和 $v_o$，乘法法则 $A = A_1 A_2$ 失效，$-8$ 的“纯级联增益”不是这个电路的增益。`,
            },
            {
              key: 'B',
              text: '−15.0 V（按纯级联算得 −16 V 后被负轨钳位）',
              correct: false,
              feedback: R`钳位这一步没错，可前一步用错了方法：$-16\text{ V}$ 来自被禁止的乘法法则。$R_G$ 把输出拉回 $v_{-1}$，构成全局负反馈，实际增益比 $-8$ 小得多，输出离电源轨还远。`,
            },
            { key: 'C', text: '−8.0 V（全局节点分析法得 A = −4）', correct: true },
            {
              key: 'D',
              text: '−4.0 V（全局节点分析法得 A = −2）',
              correct: false,
              feedback: R`$A = -2$ 是第 5 幕那道题（$R_G = 30\text{ k}\Omega$、$R_{f1} = 20\text{ k}\Omega$、$A_2 = +3$）的结果，不能照搬：增益随 $R_G$、$R_{f1}$、$A_2$ 而变。把本题数值代进 $v_{-1}$ 的 KCL 重新消元。`,
            },
          ],
          feedback_correct:
            '因存在跨级电阻 R_G，禁止用纯级联乘法。对 v₋₁ = 0 列 KCL：v_i/10 + v_o1/40 + v_o/80 = 0；又 v_o = 2 v_o1 ⇒ v_o1 = v_o/2。代入得 2/10 + v_o/80 + v_o/80 = 0 ⇒ 0.2 + v_o/40 = 0 ⇒ v_o = −8.0 V（v_o1 = −4.0 V，均在 ±15 V 线性区内）。',
          feedback_wrong: '先做拓扑体检：有跨级电阻，就对 v₋₁ 列三支路 KCL，再用 v_o = A₂ v_o1 消去 v_o1。',
          figure: SVG_Q4,
          sync: { layer: L3, params: { gf_rg: true } },
        },
      ],
    },
  ],
};

export default W3_L7;
