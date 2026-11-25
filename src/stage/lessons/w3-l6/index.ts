// W3-L6 · 差分放大器（双解法推导与共模抑制） (lesson sheet: docs/lessons/W3-L6.md).
// The professor's text of the five acts, the act diagrams (svgs.ts), the guided example and the
// diagnostic quiz are reproduced from the sheet; [[id|…]] only links a term to the stage (the words
// are unchanged). Changes from the sheet, of form:
// - display formulas sit in the ① / ② / ③ cards (a lead-in sentence becomes the card's title); a
//   display formula inside a ① runs inline in its card; the numbered ① items run as one paragraph;
//   the sub-headings (教授板书 …) are bold lines; the bold sentence after act 4's case A and the
//   closing remark after case B sit between the two ③ cards;
// - anti-spoiler: act 5's 「③ 代入数值逐步化简」 (the Ex 5.7 solution) moved behind the guided
//   example as the 「通关复盘」 board, with the finished figure 5.1; act 5 keeps ① and ② and shows
//   the circuit with R2, R4 as "?" (svgs.ts). Stage readouts of Ex 5.7 stay covered while the
//   example runs (stage param w36_ex = steps solved; done_params uncovers them);
// - plain-text symbols of the guided-example and quiz JSON (v_o, R_2/R_1 …) are set as TeX; the
//   step prompts get a title; the sheet's one intercept per step is the feedback of the wrong
//   option it answers, the other wrong options get their own (step 5's "intercept" is praise for the
//   right answer, so it is that option's feedback);
// - left out (build instructions, not lesson text): the sentence introducing the guided-example
//   JSON, the quiz's passing score (the site uses 4/4), the 「Claude 工程落地清单」;
// - fixed: act 4 ② wrote the floating-source condition as $i_2 = -i_1$; the current into the v2
//   input is $i_3$ (figure 2.1), so it reads $i_3 = -i_1$.
// Added (the sheet has none): the hover map; the guided example's step titles, praise for right
// options and conclusion; a note in act 5 pointing to the guided example; per-option quiz feedback
// written from the explanations; the quiz figures and the W3-L8 preview (figures.ts).

import { lazy } from 'react';
import type { StageLesson, StageSync } from '../../types';
import { SVG_NEXT, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './figures';
import { L1, L2, L3 } from './parts';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT5_TASK } from './svgs';

const SignalLayer = lazy(() => import('./SignalLayer'));
const AnalysisLayer = lazy(() => import('./AnalysisLayer'));
const MismatchLayer = lazy(() => import('./MismatchLayer'));

const R = String.raw;

const at = (layer: string, halo: string[], params: Record<string, unknown>): StageSync => ({ layer, halo, params });
const BENCH = (view: string, preset: string, inp: string) => ({ w36_view: view, w36_preset: preset, w36_in: inp });
const EX = (view: string, ex: number) => ({ ...BENCH(view, 'sadiku_example_5_7', 'cm2'), w36_ex: ex });

const W3_L6: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: SignalLayer, [L2]: AnalysisLayer, [L3]: MismatchLayer },
  lesson_meta: {
    lesson_id: 'W3-L6',
    world: 'World 3 · 运算放大器基础',
    title: '差分放大器（双解法推导与共模抑制）',
    subtitle: 'Difference Amplifier: Dual-Perspective Derivation & Common-Mode Rejection',
    lesson_type: 'B',
    lesson_type_label: 'Type B（纯公式/方法论课）',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Section 5.7 Difference Amplifier（p. 185–188，Fig. 5.19，Eq. 5.16–5.18，Example 5.7，Practice Problem 5.7）'],
    },
    prerequisites: ['W2-L1 节点分析法', 'W2-L5 叠加定理', 'W3-L3 反相放大器', 'W3-L4 同相放大器'],
    next_lesson: 'W3-L7',
    next_lesson_title: '级联运放电路：零加载效应与多级增益分解',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 差模 vs 共模信号切换交互图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '在长导线传感器模型上实时切换纯差模、纯共模与混合输入，直观观察 50/60 Hz 工频干扰在双线上的同相叠加与相减抵消。',
      },
      {
        id: L2,
        label: '02 节点法与叠加法双视角拆解台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '一键切换『节点法整体视图』、『叠加法子电路 A（v2=0 反相通道）』与『叠加法子电路 B（v1=0 分压+同相通道）』，高亮虚短虚断路径与节点电位。',
      },
      {
        id: L3,
        label: '03 电阻配对与失配共模泄漏对比台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption: '实时拖动四颗电阻的容差偏差（0%、±1%、±5%），对比理想无限大 CMRR 与真实容差失配下的共模噪声泄漏幅度及输入电阻不对称度。',
      },
    ],
    hover_map: {
      noise_vcm: { label: '共模分量 v_cm（工频干扰）', desc: '电网 50/60 Hz 辐射同时感应到两根导线上：两线共同携带的平均对地电位' },
      sensor_vd: { label: '差模分量 v_d（传感器信号）', desc: '两根导线彼此之间的电压差：我们真正想提取的有用信息' },
      wire_v1: { label: '导线 1 对地电压 v₁', desc: 'v₁ = v_cm − v_d/2，接差分放大器的 R₁（反相通道）' },
      wire_v2: { label: '导线 2 对地电压 v₂', desc: 'v₂ = v_cm + v_d/2，接差分放大器的 R₃（分压 + 同相通道）' },
      out_single: { label: '单端 10 倍放大器（只放 v₂）', desc: '10·v₂ 把 5 V 共模也放大成 50 V：撞上 ±15 V 电源轨，饱和削波' },
      out_diff: { label: '理想 10 倍差分放大器', desc: '10·(v₂ − v₁) = 10·v_d：只放大差值，共模被彻底减掉' },
      rail: { label: '±15 V 电源轨', desc: '运放输出摆不出电源轨之外：超过就被削平（饱和）' },
      in_v1: { label: '输入 v₁（反相通道）', desc: '经 R₁ 接到反相输入节点 a' },
      in_v2: { label: '输入 v₂（同相通道）', desc: '经 R₃、R₄ 分压后接到同相输入节点 b' },
      gnd_v1: { label: '置零的 v₁ → 接地', desc: '叠加法子电路 B：v₁ 短路接地，R₁ 左端接地，运放与 R₁、R₂ 成为同相放大器' },
      gnd_v2: { label: '置零的 v₂ → 接地', desc: '叠加法子电路 A：v₂ 短路接地，同相端经 R₃∥R₄ 接地' },
      r1: { label: '输入电阻 R₁', desc: 'v₁ 到节点 a；v₂ = 0 时 v₁ 端看进去的输入电阻就是 R₁' },
      r2: { label: '反馈电阻 R₂', desc: '节点 a 到输出 v_o；反相通道增益 −R₂/R₁' },
      r3: { label: '分压电阻 R₃', desc: 'v₂ 到节点 b，与 R₄ 组成无负载分压器' },
      r4: { label: '接地电阻 R₄', desc: '节点 b 到地；配对条件 R₁/R₂ = R₃/R₄，它一失配共模就泄漏' },
      node_a: { label: '节点 a（反相输入端）', desc: 'KCL：(v₁ − v_a)/R₁ = (v_a − v_o)/R₂' },
      node_b: { label: '节点 b（同相输入端）', desc: 'KCL：(v₂ − v_b)/R₃ = v_b/R₄ ⇒ v_b = R₄/(R₃ + R₄)·v₂' },
      opamp: { label: '理想运放', desc: '负反馈线性区：虚断 i₋ = i₊ = 0，虚短 v_a = v_b' },
      out_vo: { label: '输出 v_o', desc: 'Eq. 5.16：v_o = (1 + R₂/R₁)/(1 + R₃/R₄)·v₂ − (R₂/R₁)·v₁' },
      vshort: { label: '虚短 v_a = v_b', desc: '负反馈让两输入端电位相等——但不是虚地：v_a 一般不为 0' },
      vopen: { label: '虚断 i₋ = i₊ = 0', desc: '运放输入端不取电流：R₁ 与 R₂、R₃ 与 R₄ 各自串着同一电流' },
      divider: { label: 'R₃ / R₄ 分压器', desc: '因 i₊ = 0 无负载效应：v_b2 = R₄/(R₃ + R₄)·v₂，把同相增益里多出的“+1”压回去' },
      ro_va: { label: '节点电位 v_a = v_b', desc: '第 2 幕：4.550 V，不是 0 V（虚短而非虚地）' },
      ro_vo1: { label: '反相通道贡献 v_o1', desc: '子电路 A（v₂ = 0）：v_o1 = −(R₂/R₁)·v₁' },
      ro_vo2: { label: '同相通道贡献 v_o2', desc: '子电路 B（v₁ = 0）：v_o2 = (1 + R₂/R₁)·v_b2' },
      ro_vo: { label: '总输出 v_o = v_o1 + v_o2', desc: '两个子电路代数叠加，与节点法 Eq. 5.16 逐项一致' },
      ad: { label: '差模增益 A_d', desc: 'A_d = (R₁R₄ + R₂R₃ + 2R₂R₄) / [2R₁(R₃ + R₄)]' },
      acm: { label: '共模增益 A_cm', desc: 'A_cm = (R₁R₄ − R₂R₃) / [R₁(R₃ + R₄)]：配对时为 0' },
      cmrr: { label: '共模抑制比 CMRR', desc: 'CMRR = |A_d / A_cm|，CMRR_dB = 20 log₁₀|A_d / A_cm|' },
      signal: { label: '有用差模输出 |v_o,d|', desc: 'A_d × 10 mV' },
      leak: { label: '共模噪声泄漏 |v_o,cm|', desc: 'A_cm × 5 V：电阻失配让工频噪声顺着裂缝漏进输出' },
      rin: { label: '端口输入电阻', desc: 'R_in1 = R₁（v₂ = 0），R_in2 = R₃ + R₄（v₁ = 0），浮地差模 R_id = R₁ + R₃：偏低且不对称' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '工程痛点——长导线里的“50/60 Hz 噪声淹没危机”与信号分解',
      sync: at(L1, ['noise_vcm', 'sensor_vd'], { w36_sig: 'mixed_hum', w36_vcm: 5, w36_vd: 10 }),
      blocks: [
        { kind: 'p', text: '同学们，把目光从前两讲的单端放大器移开，今天我们走进真实的工业与生物医学测量现场。' },
        {
          kind: 'p',
          text: R`想象你在医院监护仪或者工厂应变片测力台上，用两根长达十米的导线把一个微弱传感器的两端引回电路板。[[sensor_vd|传感器本身产生的有效电位差]]非常小，只有区区 $10\text{ mV}$；可这两根长导线就像两根天然的天线，同时耦合了周围电网辐射出来的[[noise_vcm|强 $50/60\text{ Hz}$ 工频电磁干扰]]——假设它在两根导线上同时感应出了高达 $5\text{ V}$ 的对地噪声电位。`,
        },
        {
          kind: 'p',
          text: R`如果我们把两根导线上的对地电压记作 [[wire_v1|$v_1$]] 和 [[wire_v2|$v_2$]]，那么任何一个双端输入信号，都可以严丝合缝地分解成两个正交分量：`,
        },
        {
          kind: 'ul',
          items: [
            R`[[noise_vcm|**共模分量（Common-Mode Signal, $v_{\text{cm}}$）**]]：两根导线**共同携带**的平均对地电位，代表讨厌的工频干扰与零点漂移；`,
            R`[[sensor_vd|**差模分量（Differential-Mode Signal, $v_d$）**]]：两根导线**彼此之间**的电压差，代表我们真正想提取的传感器有用信息。`,
          ],
        },
        {
          kind: 'p',
          text: R`如果你傻傻地只拿前面学过的反相或同相放大器去放大其中一根导线（比如放大 $10$ 倍），$5\text{ V}$ 的工频噪声会被一起放大成 $50\text{ V}$，运放瞬间撞上 [[rail|$\pm 15\text{ V}$ 的电源轨]]进入[[out_single|**饱和削波**]]，那 $10\text{ mV}$ 的有用信号连渣都不剩！我们需要一种能[[out_diff|**只放大差值 $(v_2 - v_1)$、把共同的 $v_{\text{cm}}$ 彻底减掉**]]的电路——这就是 **Sadiku Fig. 5.19 差分放大器（Difference Amplifier）**。`,
        },
        { kind: 'p', text: '**教授板书：三段式推导（信号分解与单端放大失效证明）**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`根据线性信号空间的正交分解定义，任意一对对地输入电压 $(v_1, v_2)$ 均可唯一表示为共模分量 $v_{\text{cm}}$ 与差模分量 $v_d$ 的线性组合：$v_{\text{cm}} \triangleq \dfrac{v_1 + v_2}{2}, \qquad v_d \triangleq v_2 - v_1$ 而理想差分放大器的目标传输特性定义为：输出电压仅与差模分量成正比，对共模分量的响应严格为零，即 $v_o = A_d \, v_d + A_{\text{cm}} \, v_{\text{cm}}$ 且满足 $A_{\text{cm}} = 0$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：联立上述定义式求解 $v_1$ 与 $v_2$ 关于 $v_{\text{cm}}, v_d$ 的显式表达：`,
          tex: R`v_1 = v_{\text{cm}} - \frac{v_d}{2}, \qquad v_2 = v_{\text{cm}} + \frac{v_d}{2}`,
        },
        {
          kind: 'formula',
          title: R`若采用增益为 $A_d$ 的单端同相放大器直接放大 $v_2$，其输出为：`,
          tex: R`v_{o,\text{single}} = A_d v_2 = A_d v_{\text{cm}} + \frac{A_d}{2} v_d`,
        },
        {
          kind: 'formula',
          title: '而理想差分放大器的输出为：',
          tex: R`v_{o,\text{diff}} = A_d (v_2 - v_1) = A_d \left[\left(v_{\text{cm}} + \frac{v_d}{2}\right) - \left(v_{\text{cm}} - \frac{v_d}{2}\right)\right] = A_d v_d`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简：代入现场典型参数：$v_{\text{cm}} = 5\text{ V}$，$v_d = 10\text{ mV} = 0.01\text{ V}$，目标差模增益 $A_d = 10$，运放电源轨 $V_{\text{CC}} = \pm 15\text{ V}$：`,
          steps: [
            {
              label: 'Step 1',
              text: R`两根导线对地电位分别为：`,
              tex: R`v_1 = 5 - \frac{0.01}{2} = 4.995\text{ V}, \qquad v_2 = 5 + \frac{0.01}{2} = 5.005\text{ V}`,
            },
            {
              label: 'Step 2',
              text: R`若误用[[out_single|单端 $10$ 倍放大器]]：`,
              tex: R`v_{o,\text{single}} = 10 \times 5.005 = 50.05\text{ V} > +15\text{ V} \quad (\text{严重正饱和，有效信号完全丢失})`,
            },
            {
              label: 'Step 3',
              text: R`若使用[[out_diff|理想 $10$ 倍差分放大器]]：`,
              tex: R`v_{o,\text{diff}} = 10 \times (5.005 - 4.995) = 10 \times 0.01 = 0.100\text{ V} = 100\text{ mV} \quad (\text{共模 } 5\text{ V 彻底归零})`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '幕内原理图：长导线共模干扰与差模/共模信号分解',
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '视角一——节点分析法严格推导一般式（Eq. 5.16）与配对条件（Eq. 5.17–5.18）',
      sync: at(L2, ['node_a', 'node_b', 'vshort'], BENCH('nodal_full', 'matched_gain_10', 'sensor')),
      blocks: [
        { kind: 'p', text: '现在我们正式拿起粉笔，用最硬核、最不容出错的 **W2-L1 节点分析法**，把 Sadiku Fig. 5.19 的四电阻差分放大器彻彻底底推导一遍。' },
        {
          kind: 'p',
          text: R`记住教授反复强调的铁律：**推导理想运放电路，永远从两条铁律出发——[[vopen|虚断（$i_- = i_+ = 0$）]]与负反馈下的[[vshort|虚短（$v_a = v_b$）]]**。不要一上来就背什么配对公式，先把四个电阻 [[r1,r2,r3,r4|$R_1, R_2, R_3, R_4$]] 当成完全任意的独立参数，导出放之四海而皆准的一般式 **Eq. 5.16**，然后再看共模抑制条件是怎么自然“掉”出来的！`,
        },
        { kind: 'p', text: '**教授板书：三段式推导（节点法导出 Eq. 5.16–5.18）**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. **[[opamp|理想运放双公理（负反馈线性区）]]**：[[vopen|虚断]]：$i_- = 0$，$i_+ = 0$；[[vshort|虚短]]：$v_a = v_b$。2. **基尔霍夫电流定律（KCL）与欧姆定律**：对反相输入[[node_a|节点 $a$]]：$i_1 = i_2 + i_- = i_2$；对同相输入[[node_b|节点 $b$]]：$i_3 = i_4 + i_+ = i_4$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：第一步，对[[node_a|节点 $a$]]列写 KCL 方程并整理出 $v_o$ 关于 $v_1$ 与 $v_a$ 的表达式：`,
          tex: R`\frac{v_1 - v_a}{R_1} = \frac{v_a - v_o}{R_2}`,
        },
        { kind: 'formula', title: R`两端同乘 $R_2$ 并移项：`, tex: R`v_o = \left(1 + \frac{R_2}{R_1}\right) v_a - \frac{R_2}{R_1} v_1` },
        {
          kind: 'formula',
          title: R`第二步，对[[node_b|节点 $b$]]列写 KCL 方程（即[[divider|无负载电阻分压器]]），解出 $v_b$：`,
          tex: R`\frac{v_2 - v_b}{R_3} = \frac{v_b}{R_4} \implies v_b = \frac{R_4}{R_3 + R_4} v_2 = \frac{1}{1 + R_3/R_4} v_2`,
        },
        {
          kind: 'formula',
          title: R`第三步，代入[[vshort|虚短公理 $v_a = v_b$]]，即得 [[out_vo|**Sadiku Eq. 5.16（差分放大器一般输出通式）**]]：`,
          tex: R`v_o = \frac{R_2\left(1 + R_1/R_2\right)}{R_1\left(1 + R_3/R_4\right)} v_2 - \frac{R_2}{R_1} v_1 = \frac{1 + R_2/R_1}{1 + R_3/R_4} v_2 - \frac{R_2}{R_1} v_1`,
        },
        {
          kind: 'formula',
          title: R`第四步，强加**共模抑制条件**：要求当纯共模信号输入（$v_1 = v_2 = v_{\text{cm}} \neq 0$）时，输出严格归零（$v_o = 0$）：`,
          tex: R`v_o = \left(\frac{1 + R_2/R_1}{1 + R_3/R_4} - \frac{R_2}{R_1}\right) v_{\text{cm}} = \frac{R_1 R_4 - R_2 R_3}{R_1(R_3 + R_4)} v_{\text{cm}} = 0`,
        },
        {
          kind: 'formula',
          title: R`由于分母 $R_1(R_3 + R_4) > 0$ 且 $v_{\text{cm}} \neq 0$，必有分子严格为零，由此导出 **Sadiku Eq. 5.17（精密电阻配对条件）**：`,
          tex: R`R_1 R_4 = R_2 R_3 \iff \frac{R_1}{R_2} = \frac{R_3}{R_4}`,
        },
        {
          kind: 'formula',
          title: R`将 $\frac{R_3}{R_4} = \frac{R_1}{R_2}$ 代回 Eq. 5.16 的 $v_2$ 系数中：`,
          tex: R`\frac{1 + R_2/R_1}{1 + R_1/R_2} = \frac{(R_1 + R_2)/R_1}{(R_2 + R_1)/R_2} = \frac{R_2}{R_1}`,
        },
        { kind: 'formula', title: '于是获得极其优雅的 **Sadiku Eq. 5.18（配对差分放大器输出通式）**：', tex: R`v_o = \frac{R_2}{R_1} (v_2 - v_1)` },
        { kind: 'p', text: R`(特别情形：当 $R_1 = R_2 = R_3 = R_4$ 时，$v_o = v_2 - v_1$，即单位增益减法器。)` },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简：取工程常用配对阻值：$R_1 = R_3 = 10\text{ k}\Omega$，$R_2 = R_4 = 100\text{ k}\Omega$，输入第 1 幕的含噪传感器信号 $v_1 = 4.995\text{ V}$，$v_2 = 5.005\text{ V}$：`,
          steps: [
            {
              label: 'Step 1',
              text: '检验配对条件：',
              tex: R`\frac{R_1}{R_2} = \frac{10\text{ k}\Omega}{100\text{ k}\Omega} = 0.1, \qquad \frac{R_3}{R_4} = \frac{10\text{ k}\Omega}{100\text{ k}\Omega} = 0.1 \quad (\text{配对成立})`,
            },
            {
              label: 'Step 2',
              text: R`计算[[ro_va|节点电位 $v_b = v_a$]]：`,
              tex: R`v_b = \frac{100}{10 + 100} \times 5.005 = \frac{10}{11} \times 5.005 = 4.550\text{ V} = v_a`,
            },
            {
              label: 'Step 3',
              text: R`代入配对公式计算[[out_vo|输出电压 $v_o$]]：`,
              tex: R`v_o = \frac{100}{10} \times (5.005 - 4.995) = 10 \times 0.010 = 0.100\text{ V}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授提醒**：请留意刚才算出来的 [[ro_va|$v_a = v_b = 4.550\text{ V}$]]！它**绝不是 $0\text{ V}$**！在差分放大器里，反相端是**[[vshort|虚短（$v_a = v_b$）]]**，而**不是虚地（$v_a = 0$）**——这是期末考卷上最容易踩的坑！`,
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '幕内原理图：标准四电阻差分放大器节点法标注图（Sadiku Fig. 5.19）',
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '视角二——叠加定理双子电路拆解（反相通道 + 分压同相通道）',
      sync: at(L2, ['ro_vo1', 'ro_vo2'], BENCH('superposition_v1_only', 'matched_gain_10', 'sensor')),
      blocks: [
        {
          kind: 'p',
          text: R`节点法严谨无瑕，但如果你想一眼看穿差分放大器的“骨架”，必须动用 **W2-L5 叠加定理**。线性区内的理想运放电路是完全线性的，面对两个独立输入源 $v_1$ 和 $v_2$，我们把它们轮流[[gnd_v1,gnd_v2|**置零（电压源短路接地）**]]，你会惊讶地发现：差分放大器根本不是什么全新物种，它不过是 [[ro_vo1|**W3-L3 反相放大器**]] 与 [[divider,ro_vo2|**分压器 + W3-L4 同相放大器**]] 的“合体”！`,
        },
        { kind: 'p', text: '**教授板书：三段式推导（叠加定理双重印证）**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. **线性叠加定理（W2-L5）**：对于工作在线性区的双输入理想运放电路，总输出等于各独立输入源单独作用（其余独立电压源置零短路）时所产生输出分量的代数和：$v_o = v_{o1}\big|_{v_2=0} + v_{o2}\big|_{v_1=0}$。2. **已知基本放大器结论**：反相放大器（W3-L3）：$v_o = -\frac{R_2}{R_1} v_{\text{in}}$；同相放大器（W3-L4）：$v_o = \left(1 + \frac{R_2}{R_1}\right) v_+$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：1. [[gnd_v2,ro_vo1|**子电路 A（令 $v_2 = 0$，$v_1$ 单独作用）**]]：同相输入端经 $R_3 \parallel R_4$ 接地，因[[vopen|虚断 $i_+ = 0$]]，电阻上无压降，故 $v_{b1} = 0$，电路严格退化为标准反相放大器：`,
          tex: R`v_{o1} = -\frac{R_2}{R_1} v_1`,
        },
        {
          kind: 'formula',
          title: R`2. [[gnd_v1,ro_vo2|**子电路 B（令 $v_1 = 0$，$v_2$ 单独作用）**]]：同相端先经 [[divider|$R_3, R_4$ 构成分压器]]（因 $i_+ = 0$ 无负载效应），得到同相端电位 $v_{b2}$：`,
          tex: R`v_{b2} = \frac{R_4}{R_3 + R_4} v_2 = \frac{1}{1 + R_3/R_4} v_2`,
        },
        {
          kind: 'formula',
          title: R`此时 $R_1$ 左端接地，运放与 $R_1, R_2$ 构成标准同相放大器，对 $v_{b2}$ 施加增益 $\left(1 + \frac{R_2}{R_1}\right)$：`,
          tex: R`v_{o2} = \left(1 + \frac{R_2}{R_1}\right) v_{b2} = \frac{1 + R_2/R_1}{1 + R_3/R_4} v_2`,
        },
        {
          kind: 'formula',
          title: '3. [[ro_vo|**叠加合并**]]：',
          tex: R`v_o = v_{o1} + v_{o2} = \frac{1 + R_2/R_1}{1 + R_3/R_4} v_2 - \frac{R_2}{R_1} v_1`,
        },
        { kind: 'p', text: '与第 2 幕节点法导出的 Sadiku Eq. 5.16 **逐项完全一致**！' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**结构直觉一语道破**：为什么必须要 [[divider|$R_3, R_4$ 分压器]]？因为同相放大器的增益天然比反相放大器多了一个“$+1$”（一个是 $1 + R_2/R_1$，一个是 $-R_2/R_1$）！如果不把 $v_2$ 先分压衰减掉，共模信号就永远减不干净；正是因为加上了配对分压比 $\frac{R_4}{R_3+R_4} = \frac{R_2}{R_1+R_2}$，才把同相增益精准压回 $\left(1 + \frac{R_2}{R_1}\right)\frac{R_2}{R_1+R_2} = \frac{R_2}{R_1}$，从而与反相通道的 $-\frac{R_2}{R_1}$ 实现完美对冲！`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简：继续沿用第 2 幕参数：$R_1 = R_3 = 10\text{ k}\Omega$，$R_2 = R_4 = 100\text{ k}\Omega$，$v_1 = 4.995\text{ V}$，$v_2 = 5.005\text{ V}$：`,
          steps: [
            { label: 'Step 1', text: R`[[ro_vo1|反相通道数学分量 $v_{o1}$]]：`, tex: R`v_{o1} = -\frac{100}{10} \times 4.995 = -49.95\text{ V}` },
            {
              label: 'Step 2',
              text: R`[[ro_vo2|分压 + 同相通道数学分量 $v_{o2}$]]：`,
              tex: R`v_{b2} = \frac{100}{10 + 100} \times 5.005 = 4.550\text{ V}, \qquad v_{o2} = \left(1 + \frac{100}{10}\right) \times 4.550 = 11 \times 4.550 = +50.05\text{ V}`,
            },
            { label: 'Step 3', text: R`[[ro_vo|代数叠加]]：`, tex: R`v_o = v_{o1} + v_{o2} = -49.95 + 50.05 = +0.100\text{ V}` },
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**物理边界警示**：有的同学看到 $v_{o1} = -49.95\text{ V}$ 会吓一跳：“老师，运放供电才 $\pm 15\text{ V}$，这不早就饱和了吗？”**不会！** 真实物理电路中两个源是**同时存在**的，运放输出端实际电压只有 $+0.100\text{ V}$，输入端共模电位 $v_a = v_b = 4.550\text{ V}$ 也在运放共模输入范围之内。叠加法中的 $-49.95\text{ V}$ 与 $+50.05\text{ V}$ 只是线性模型的数学拆解分量。`,
        },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '幕内原理图：叠加定理双子电路并排对比',
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '工程真相——电阻容差失配对 CMRR 的破坏与单运放拓扑短板',
      sync: at(L3, ['r4', 'leak'], { w36_tol: 'single_r4_plus5pct', w36_d4: 5 }),
      blocks: [
        {
          kind: 'p',
          text: R`纸上推导一切完美：只要 $\frac{R_1}{R_2} = \frac{R_3}{R_4}$，[[acm|共模增益 $A_{\text{cm}} = 0$]]，[[cmrr|共模抑制比（Common-Mode Rejection Ratio, $\text{CMRR}$）]]趋于无穷大（$\infty\text{ dB}$）。`,
        },
        {
          kind: 'p',
          text: R`**但是，走出教科书来到面包板，现实会立刻给你一记重拳。** 实验室最常见的碳膜电阻容差是 $\pm 5\%$，哪怕你挑的是高精度金属膜电阻也有 $\pm 1\%$。只要四颗电阻的比值有哪怕一点点失配，$R_1 R_4 - R_2 R_3 \neq 0$，原本应该被彻底抹平的 $5\text{ V}$ 工频共模噪声就会立刻顺着失配裂缝[[leak|**泄漏**]]进输出端！`,
        },
        { kind: 'p', text: '不仅如此，单运放差分放大器还有两个与生俱来的“硬伤”：' },
        {
          kind: 'ol',
          items: [
            R`[[rin|**输入电阻偏低且不对称**]]：对地单端测量时，$v_1$ 端看到的是 $R_{\text{in},1}|_{v_2=0} = R_1$，而 $v_2$ 端看到的是 $R_{\text{in},2}|_{v_1=0} = R_3 + R_4$；即便对浮地差模源，差模输入电阻也只有 $R_{id} = R_1 + R_3 = 2R_1$。如果传感器内阻较高（例如生物电极或压电传感器），低输入电阻会直接产生严重的分压衰减，甚至破坏四电阻配对平衡！`,
            R`**增益难以连续调节**：想把增益从 $10$ 调到 $50$，你必须同时把 [[r2,r4|$R_2$ 和 $R_4$]] 精确同步增大 $5$ 倍，用一颗普通电位器根本做不到！`,
          ],
        },
        {
          kind: 'p',
          text: '正是这两个无法在单运放框架下根治的短板，直接催生了我们在 **W3-L8** 即将登场的终极王牌——**三运放仪表放大器（Instrumentation Amplifier）**！',
        },
        { kind: 'p', text: R`**教授板书：三段式推导（一般失配下的 $A_d$、$A_{\text{cm}}$ 与 CMRR）**` },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`将双端输入分解式 $v_1 = v_{\text{cm}} - \frac{v_d}{2}$、$v_2 = v_{\text{cm}} + \frac{v_d}{2}$ 代入已验证的一般式 Sadiku Eq. 5.16，并按[[cmrr|共模抑制比]]的定义：$v_o = A_d \, v_d + A_{\text{cm}} \, v_{\text{cm}}, \qquad \text{CMRR} \triangleq \left|\dfrac{A_d}{A_{\text{cm}}}\right|, \qquad \text{CMRR}_{\text{dB}} = 20\log_{10}\left|\dfrac{A_d}{A_{\text{cm}}}\right|$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：将 $v_1, v_2$ 代入 Eq. 5.16 并合并 $v_d$ 与 $v_{\text{cm}}$ 同类项，严格导出任意四电阻下的[[ad|差模增益 $A_d$]] 与[[acm|共模增益 $A_{\text{cm}}$]]：`,
          tex: R`\begin{gathered} A_d = \frac{1}{2}\left(\frac{1 + R_2/R_1}{1 + R_3/R_4} + \frac{R_2}{R_1}\right) = \frac{R_1 R_4 + R_2 R_3 + 2 R_2 R_4}{2 R_1 (R_3 + R_4)} \\[8pt] A_{\text{cm}} = \frac{1 + R_2/R_1}{1 + R_3/R_4} - \frac{R_2}{R_1} = \frac{R_1 R_4 - R_2 R_3}{R_1 (R_3 + R_4)} \end{gathered}`,
        },
        {
          kind: 'p',
          text: R`由此可见：哪怕运放芯片本身是绝对理想的，只要外围四颗电阻不满足 $R_1 R_4 = R_2 R_3$，整个电路就会产生非零的[[acm|共模增益 $A_{\text{cm}}$]]。`,
        },
        { kind: 'p', text: R`同时，在标准配对 $R_1 = R_3, R_2 = R_4$ 下，该电路的[[rin|端口输入电阻]]为：` },
        {
          kind: 'ul',
          items: [
            R`单端反相端（$v_2 = 0$）：$R_{\text{in},1} = R_1$；`,
            R`单端同相端（$v_1 = 0$）：$R_{\text{in},2} = R_3 + R_4 = R_1 + R_2$（两输入端明显不对称）；`,
            R`浮地差模源输入电阻（$i_3 = -i_1$）：$R_{id} = R_1 + R_3 = 2 R_1$。`,
          ],
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简：以标称增益 $A_{d,\text{nom}} = 10$（$R_1 = R_3 = 10\text{ k}\Omega, R_2 = R_4 = 100\text{ k}\Omega$）、输入 $v_d = 10\text{ mV}, v_{\text{cm}} = 5\text{ V}$ 为基准，考察两种 $5\%$ 容差失配：`,
          steps: [
            { label: R`1. **情形 A：仅 [[r4|$R_4$ 偏大 $+5\%$]]**（$R_1 = 10\text{ k}\Omega, R_2 = 100\text{ k}\Omega, R_3 = 10\text{ k}\Omega, R_4 = 105\text{ k}\Omega$）` },
            { label: '[[acm|共模增益]]', tex: R`A_{\text{cm}} = \frac{10 \times 105 - 100 \times 10}{10 \times (10 + 105)} = \frac{50}{1150} = \frac{1}{23} \approx +0.04348` },
            { label: '[[ad|差模增益]]', tex: R`A_d = \frac{10 \times 105 + 100 \times 10 + 2 \times 100 \times 105}{2 \times 10 \times 115} = \frac{23050}{2300} \approx 10.0217` },
            {
              label: '[[cmrr|共模抑制比]]',
              tex: R`\text{CMRR} = \left|\frac{10.0217}{0.04348}\right| \approx 230.50 \implies \text{CMRR}_{\text{dB}} = 20\log_{10}(230.50) \approx 47.25\text{ dB}`,
            },
            {
              label: '[[signal,leak|输出端有效信号 vs 噪声泄漏]]',
              tex: R`v_{o,d} = 10.0217 \times 0.010 \approx 0.1002\text{ V}, \qquad v_{o,\text{cm}} = 0.04348 \times 5 \approx +0.2174\text{ V}`,
            },
          ],
        },
        { kind: 'p', text: R`**仅一颗电阻偏差 $5\%$，泄漏进来的工频噪声就已经是有用信号的 $2.17$ 倍！**` },
        {
          kind: 'calc',
          title: R`2. **情形 B：四颗 $5\%$ 电阻最坏组合**（$R_1 = 9.5\text{ k}\Omega, R_2 = 105\text{ k}\Omega, R_3 = 10.5\text{ k}\Omega, R_4 = 95\text{ k}\Omega$）：`,
          steps: [
            {
              label: '[[acm|共模增益]]',
              tex: R`A_{\text{cm}} = \frac{9.5 \times 95 - 105 \times 10.5}{9.5 \times (10.5 + 95)} = \frac{902.5 - 1102.5}{1002.25} = \frac{-200}{1002.25} \approx -0.19955`,
            },
            { label: '[[ad|差模增益]]', tex: R`A_d = \frac{902.5 + 1102.5 + 2 \times 105 \times 95}{2 \times 1002.25} = \frac{21955}{2004.5} \approx 10.9529` },
            {
              label: '[[cmrr,leak|共模抑制比与噪声泄漏]]',
              tex: R`\text{CMRR} \approx 54.89 \ (34.79\text{ dB}), \qquad v_{o,\text{cm}} = -0.19955 \times 5 \approx -0.9978\text{ V}`,
            },
          ],
        },
        {
          kind: 'p',
          text: R`噪声泄漏高达近 $1\text{ V}$，彻底把 $0.1095\text{ V}$ 的有用信号淹没！这就是为什么精密差分放大器必须使用 $0.1\%$ 以上激光微调薄膜电阻网络，或者在 **W3-L8** 中引入前端高阻缓冲级构成**三运放仪表放大器**。`,
        },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '幕内原理图：电阻容差失配共模泄漏与输入电阻不对称分析',
    },

    /* ------------------------------------------------------------- act 5 (Ex 5.7, the guided example, the quiz) */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '教材精讲与综合实战——Sadiku Example 5.7 与苏格拉底引导闯关',
      sync: at(L2, ['r2', 'r4'], BENCH('nodal_full', 'sadiku_example_5_7', 'cm2')),
      blocks: [
        {
          kind: 'p',
          text: '接下来我们完整攻克 **Sadiku Section 5.7 Example 5.7 (p. 187)**。这道题非常经典，因为它故意不让你套用简化的配对公式 Eq. 5.18，而是逼你回到**一般式 Eq. 5.16**，设计一个带有**不对称权重系数**的差分放大器：',
        },
        { kind: 'note', tone: 'tip', text: R`**Sadiku Example 5.7 原题**：设计一个以 $v_1$ 和 $v_2$ 为输入的运放电路，使其输出满足：$v_o = -5 v_1 + 3 v_2$` },
        {
          kind: 'p',
          text: R`(延伸对照 **Sadiku Practice Problem 5.7**：若要求设计一个标准增益为 $4$ 的差分放大器 $v_o = 4(v_2 - v_1)$，则需满足配对条件 $R_2/R_1 = R_4/R_3 = 4$，可选 $R_1 = R_3 = 10\text{ k}\Omega$、$R_2 = R_4 = 40\text{ k}\Omega$。)`,
        },
        { kind: 'figure', svg: SVG_ACT5_TASK, caption: '幕内原理图：Sadiku Example 5.7 待设计电路（R₂、R₄ 留给下面的引导例题求出）' },
        { kind: 'p', text: '**教授板书：三段式推导（Sadiku Example 5.7 完整求解）**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`对比目标式 $v_o = -5v_1 + 3v_2$ 与四电阻差分放大器的一般输出通式（Sadiku Eq. 5.16）：$v_o = \dfrac{1 + R_2/R_1}{1 + R_3/R_4} v_2 - \dfrac{R_2}{R_1} v_1$ 注意到反相通道与同相通道的权重幅值不等（$5 \neq 3$），因此不能使用配对简式 Eq. 5.18，而应采用**待定系数法**逐项匹配。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：设反相通道目标权重为 $K_1 > 0$（即 $-K_1 v_1$），同相通道目标权重为 $K_2 > 0$（即 $+K_2 v_2$），匹配 Eq. 5.16 系数得：`,
          tex: R`\begin{gathered} \frac{R_2}{R_1} = K_1 \\[8pt] \frac{1 + R_2/R_1}{1 + R_3/R_4} = K_2 \implies 1 + \frac{R_3}{R_4} = \frac{1 + K_1}{K_2} \implies \frac{R_3}{R_4} = \frac{1 + K_1}{K_2} - 1 = \frac{1 + K_1 - K_2}{K_2} \end{gathered}`,
        },
        { kind: 'p', text: R`(物理可实现性条件：因为电阻比值必为正数，单级四电阻拓扑直接实现 $-K_1 v_1 + K_2 v_2$ 的充要条件为 $K_2 < 1 + K_1$！)` },
        {
          kind: 'note',
          tone: 'tip',
          text: '③ 代入数值这一步先不写：下面的苏格拉底引导例题就是这道题。自己闯关之后，完整求解作为“通关复盘”板书紧跟在后面。左侧 02 拆解台的 Ex 5.7 预设也会等你闯到哪一步，才亮出哪一步的数值。',
        },
        {
          kind: 'guided',
          title: '苏格拉底闯关：设计非对称加权差分电路（Sadiku Example 5.7 深度版）',
          source: 'Alexander & Sadiku, Fundamentals of Electric Circuits, Section 5.7, Example 5.7 (p. 187)',
          problem: R`请使用单颗理想运算放大器与四颗电阻 $R_1, R_2, R_3, R_4$，设计一个满足 $v_o = -5v_1 + 3v_2$ 的电路（限定 $R_1 = R_3 = 10\text{ k}\Omega$），并回答该电路面对 $v_1 = v_2 = 2\text{ V}$ 共模信号时的输出。`,
          done_params: { w36_ex: 5 },
          steps: [
            {
              title: '第 1 步 · 能不能套配对公式？',
              mini_svg: MINI_STEP1,
              question: R`先停一下！看到目标式 $v_o = -5v_1 + 3v_2$，我们能不能直接套用简化的配对差分公式 $v_o = (R_2/R_1)(v_2 - v_1)$？为什么？`,
              hint: R`$v_o = \frac{1 + R_2/R_1}{1 + R_3/R_4} v_2 - \frac{R_2}{R_1} v_1$`,
              options: [
                {
                  text: R`可以，只要把 $R_2/R_1$ 设为 5 和 3 的平均值 4 就行`,
                  correct: false,
                  feedback: R`千万别拿平均值糊弄物理规律！简式 Eq. 5.18 的前提是 $R_1/R_2 = R_3/R_4$，一旦两项系数幅值不等，就必须从一般式 Eq. 5.16 出发独立定系。`,
                },
                {
                  text: R`不能，因为配对公式强制要求 $v_1$ 与 $v_2$ 的增益幅值相等且反号，本题系数分别为 $-5$ 与 $+3$，必须回到一般式 Eq. 5.16`,
                  correct: true,
                  feedback: R`对！配对公式里 $v_1$、$v_2$ 的系数永远是 $-R_2/R_1$ 与 $+R_2/R_1$——幅值相等、符号相反；$-5$ 与 $+3$ 幅值不等，只能回到一般式 Eq. 5.16 逐项定系。`,
                },
                {
                  text: '不能，因为单颗运放根本无法实现负系数和正系数同时存在',
                  correct: false,
                  feedback: R`单颗运放当然可以：差分放大器本身就是 $v_1$ 走反相通道（负系数）、$v_2$ 走分压 + 同相通道（正系数）。不能套 Eq. 5.18 的原因是两项系数幅值不等，而不是符号。`,
                },
              ],
              board: [R`\text{Step 1: 识别非对称权重 } K_1 = 5 \neq K_2 = 3 \implies \text{采用一般式 Eq. 5.16}`],
              halo: ['r1', 'r2', 'r3', 'r4'],
              params: EX('nodal_full', 0),
              layer: L2,
            },
            {
              title: '第 2 步 · 锁定反相通道（子电路 A）',
              mini_svg: MINI_STEP2,
              question: R`先锁定反相通道！利用叠加法令 $v_2 = 0$，电路退化为反相放大器。若已选定 $R_1 = 10\text{ k}\Omega$，为实现 $-5v_1$ 项，反馈电阻 $R_2$ 应取多大？`,
              hint: R`$-\frac{R_2}{R_1} = -5 \implies R_2 = 5 R_1$`,
              options: [
                {
                  text: R`$R_2 = 40\text{ k}\Omega$`,
                  correct: false,
                  feedback: R`别把反相增益和同相增益搞混了！反相放大器的增益是 $-R_2/R_1$，没有那个 $+1$，所以不需要减 1。`,
                },
                {
                  text: R`$R_2 = 50\text{ k}\Omega$`,
                  correct: true,
                  feedback: R`正确：$-R_2/R_1 = -5 \Rightarrow R_2 = 5R_1 = 50\text{ k}\Omega$。左侧子电路 A 里 $v_2$ 接地、同相端 $v_{b1} = 0$，正是一个标准反相放大器。`,
                },
                {
                  text: R`$R_2 = 60\text{ k}\Omega$`,
                  correct: false,
                  feedback: R`别把反相增益和同相增益搞混了！$R_2 = 60\text{ k}\Omega$ 给出的反相系数是 $-60/10 = -6$：多出来的那个 $1$ 只属于同相增益 $1 + R_2/R_1$，反相放大器的增益就是 $-R_2/R_1$。`,
                },
              ],
              board: [R`\text{Step 2: } \frac{R_2}{R_1} = 5,\; R_1 = 10\text{ k}\Omega \implies R_2 = 50\text{ k}\Omega`],
              halo: ['r1', 'r2', 'gnd_v2'],
              params: EX('superposition_v1_only', 1),
              layer: L2,
            },
            {
              title: '第 3 步 · 锁定同相通道（子电路 B）',
              mini_svg: MINI_STEP3,
              question: R`再锁定同相通道！已知 $R_2/R_1 = 5$，令 $v_1 = 0$ 时，同相放大器的本体增益 $(1 + R_2/R_1)$ 是多少？为了让最终 $v_2$ 的总系数刚好等于 $+3$，$R_3$ 与 $R_4$ 组成的分压比 $R_4/(R_3+R_4)$ 必须等于多少？`,
              hint: R`$\left(1 + \frac{R_2}{R_1}\right) \cdot \frac{R_4}{R_3 + R_4} = 3 \implies 6 \cdot \frac{R_4}{R_3 + R_4} = 3$`,
              options: [
                {
                  text: '本体增益为 5，分压比需为 3/5',
                  correct: false,
                  feedback: R`记住我们在第 3 幕讲的结构直觉：同相放大器自带 $+1$，所以 $1 + R_2/R_1 = 1 + 5 = 6$。要从 6 倍衰减到 3 倍，分压器必须刚好对半分压！`,
                },
                {
                  text: '本体增益为 6，分压比需为 3/6 = 1/2',
                  correct: true,
                  feedback: R`正确：同相本体增益 $1 + 50/10 = 6$，要让 $v_2$ 的总系数为 $+3$，分压比只能是 $3/6 = 1/2$。`,
                },
                {
                  text: '本体增益为 6，分压比需为 1/3',
                  correct: false,
                  feedback: R`本体增益 $6$ 算对了，可分压比 $1/3$ 只给出 $6 \times \frac{1}{3} = 2 \neq 3$。要从 6 倍衰减到 3 倍，分压器必须刚好对半分压！`,
                },
              ],
              board: [R`\text{Step 3: } 1 + \frac{R_2}{R_1} = 6 \implies \frac{R_4}{R_3 + R_4} = \frac{3}{6} = \frac{1}{2}`],
              halo: ['divider', 'r3', 'r4', 'gnd_v1'],
              params: EX('superposition_v2_only', 2),
              layer: L2,
            },
            {
              title: '第 4 步 · 定下接地电阻 R₄',
              mini_svg: MINI_STEP4,
              question: R`既然分压比 $R_4/(R_3 + R_4) = 1/2$，且题目限定 $R_3 = 10\text{ k}\Omega$，那么接地电阻 $R_4$ 应该取多大？`,
              hint: R`$\frac{R_4}{R_3 + R_4} = \frac{1}{2} \iff R_4 = R_3$`,
              options: [
                {
                  text: R`$R_4 = 5\text{ k}\Omega$`,
                  correct: false,
                  feedback: R`解一下简单方程 $R_4 / (10 + R_4) = 1/2$：对半分压意味着上下两颗电阻必须完全相等！$R_4 = 5\text{ k}\Omega$ 给出的分压比是 $5/15 = 1/3$。`,
                },
                {
                  text: R`$R_4 = 10\text{ k}\Omega$`,
                  correct: true,
                  feedback: R`正确：$\frac{R_4}{10 + R_4} = \frac{1}{2} \Rightarrow R_4 = 10\text{ k}\Omega = R_3$。四颗电阻全部定下来了。`,
                },
                {
                  text: R`$R_4 = 20\text{ k}\Omega$`,
                  correct: false,
                  feedback: R`解一下简单方程 $R_4 / (10 + R_4) = 1/2$：对半分压意味着上下两颗电阻必须完全相等！$R_4 = 20\text{ k}\Omega$ 给出的分压比是 $20/30 = 2/3$。`,
                },
              ],
              board: [R`\text{Step 4: } R_4 = R_3 = 10\text{ k}\Omega \implies \text{完整参数 }(10, 50, 10, 10)\text{ k}\Omega`],
              halo: ['r4', 'node_b'],
              params: EX('superposition_v2_only', 3),
              layer: L2,
            },
            {
              title: '第 5 步 · 工程拷问：纯共模输入',
              mini_svg: MINI_STEP5,
              question: R`最后一步工程拷问：如果你把这个设计好的电路（$v_o = -5v_1 + 3v_2$）接入纯共模输入 $v_1 = v_2 = 2\text{ V}$，输出 $v_o$ 会等于 0 吗？实际等于多少？`,
              hint: R`$v_o = (-5 + 3) v_{\text{cm}} = -2 \times 2\text{ V}$`,
              options: [
                {
                  text: R`等于 $0\text{ V}$，因为只要是差分拓扑就能消除共模`,
                  correct: false,
                  feedback: R`拓扑长得像，不等于能抑制共模：本题 $R_1/R_2 = 10/50 = 0.2$，$R_3/R_4 = 10/10 = 1$，配对条件 Eq. 5.17 不成立。直接代入 $v_o = -5(2) + 3(2)$，结果并不为零。`,
                },
                {
                  text: R`等于 $-4\text{ V}$，因为非对称权重破坏了配对条件，共模增益 $A_{\text{cm}} = -2$`,
                  correct: true,
                  feedback: R`太棒了！这正是我们要刻意区分的：『加权减法器』和『共模抑制差分放大器』在拓扑上长得一模一样，但只有满足 $R_1/R_2 = R_3/R_4$ 时才具备共模抑制能力！`,
                },
                {
                  text: R`等于 $+4\text{ V}$，因为同相端占据主导地位`,
                  correct: false,
                  feedback: R`符号反了：反相通道贡献 $-5 \times 2 = -10\text{ V}$，同相通道只贡献 $+3 \times 2 = +6\text{ V}$——权重更大的是反相通道，合起来是负的。`,
                },
              ],
              board: [R`\text{Step 5: } v_1 = v_2 = 2\text{ V} \implies v_o = -5(2) + 3(2) = -4\text{ V}\; (A_{\text{cm}} = -2)`],
              halo: ['acm', 'leak'],
              params: { w36_tol: 'ex57', w36_d4: 0, w36_ex: 4 },
              layer: L3,
            },
          ],
          conclusion: R`通关！$R_1 = 10\text{ k}\Omega$、$R_2 = 50\text{ k}\Omega$、$R_3 = R_4 = 10\text{ k}\Omega$ 实现 $v_o = -5v_1 + 3v_2$；可它的 $A_{\text{cm}} = -2$——这是加权减法器，不是共模抑制差分放大器。左侧两张台子上的 Ex 5.7 数值已经揭晓，下面的通关复盘把这道题的板书完整写一遍。`,
        },
        { kind: 'p', text: '**通关复盘 · 三段式推导（Sadiku Example 5.7 完整求解）**' },
        { kind: 'figure', svg: SVG_ACT5, caption: '幕内原理图：Sadiku Example 5.7 成品设计电路图' },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简：代入本题目标系数 $K_1 = 5$、$K_2 = 3$：`,
          steps: [
            { label: 'Step 1', text: R`检查物理可实现性：$K_2 = 3 < 1 + 5 = 6$，满足条件！` },
            {
              label: 'Step 2',
              text: R`求解反相支路电阻比：$\dfrac{R_2}{R_1} = 5$。工程上选取适中阻值（避免阻值过小导致电流过大，或过大引入热噪声）：取 $R_1 = 10\text{ k}\Omega$，则：`,
              tex: R`R_2 = 5 R_1 = 5 \times 10\text{ k}\Omega = 50\text{ k}\Omega`,
            },
            {
              label: 'Step 3',
              text: R`求解同相支路电阻比：$\dfrac{R_3}{R_4} = \dfrac{1 + 5 - 3}{3} = \dfrac{3}{3} = 1 \implies R_3 = R_4$。取标准阻值 $R_3 = 10\text{ k}\Omega$，则 $R_4 = 10\text{ k}\Omega$（注：取 $R_3 = R_4 = 20\text{ k}\Omega$ 等任意相等阻值在理想模型下均等价）。`,
            },
            {
              label: 'Step 4',
              text: '回代 Eq. 5.16 验算：',
              tex: R`v_o = \frac{1 + 50/10}{1 + 10/10} v_2 - \frac{50}{10} v_1 = \frac{6}{2} v_2 - 5 v_1 = -5 v_1 + 3 v_2 \quad (\text{精确吻合})`,
            },
          ],
        },
        { kind: 'p', text: '**诊断测验（共 4 题）**' },
      ],
      quiz: [
        {
          id: 'w3l6_q1',
          question: R`在标准四电阻差分放大器（Sadiku Fig. 5.19）中，已知 $R_1 = 10\text{ k}\Omega$、$R_2 = 40\text{ k}\Omega$、$R_3 = 20\text{ k}\Omega$。若要使该电路对任意共模信号严格实现 $v_o = 0$（即完全抑制共模），电阻 $R_4$ 应取多大？此时在输入 $v_1 = 2\text{ V}$、$v_2 = 3\text{ V}$ 时，反相端节点电位 $v_a$ 为多少？`,
          options: [
            {
              key: 'A',
              text: R`$R_4 = 40\text{ k}\Omega$，$v_a = 0\text{ V}$`,
              correct: false,
              feedback: R`两处都错：配对条件是比值相等 $R_1/R_2 = R_3/R_4$，不是 $R_4 = R_2$——$R_3$ 已是 $R_1$ 的两倍，$R_4$ 也得是 $R_2$ 的两倍；而且反相端是虚短 $v_a = v_b$，不是虚地，$v_b$ 由 $R_3$、$R_4$ 分压 $v_2$ 得到，不为 0。`,
            },
            { key: 'B', text: R`$R_4 = 80\text{ k}\Omega$，$v_a = 2.4\text{ V}$`, correct: true },
            {
              key: 'C',
              text: R`$R_4 = 80\text{ k}\Omega$，$v_a = 0\text{ V}$`,
              correct: false,
              feedback: R`$R_4 = 80\text{ k}\Omega$ 对了，但 $v_a = 0$ 是把反相放大器的虚地搬了过来：这里同相端不接地，$v_a = v_b = v_2 \cdot R_4/(R_3 + R_4)$。`,
            },
            {
              key: 'D',
              text: R`$R_4 = 5\text{ k}\Omega$，$v_a = 2.4\text{ V}$`,
              correct: false,
              feedback: R`比值倒过来了：$10/40 = 20/R_4$ 解出的是 $R_4 = 80\text{ k}\Omega$。何况 $R_4 = 5\text{ k}\Omega$ 时 $v_b = 3 \times 5/25 = 0.6\text{ V}$，与 $2.4\text{ V}$ 自相矛盾。`,
            },
          ],
          feedback_correct: R`由精密配对条件 $R_1/R_2 = R_3/R_4$ 得 $10/40 = 20/R_4$，解得 $R_4 = 80\text{ k}\Omega$。由虚短 $v_a = v_b$ 及分压公式得 $v_a = v_b = v_2 \cdot R_4/(R_3+R_4) = 3 \times 80/(20+80) = 2.4\text{ V}$（注意差分放大器反相端是虚短而非虚地）。`,
          feedback_wrong: '先用配对条件求 R₄（比值相等），再用虚短 + 分压求 vₐ。',
          figure: SVG_Q1,
          sync: at(L2, ['vshort', 'node_a'], BENCH('nodal_full', 'matched_gain_10', 'mix')),
        },
        {
          id: 'w3l6_q2',
          question: R`用叠加定理分析标准四电阻差分放大器时，若令输入源 $v_2 = 0$（短路接地），则同相输入端通过 $R_3$ 与 $R_4$ 并联接地。此时同相输入端电位 $v_{b1}$ 等于多少？原因是什么？`,
          options: [
            { key: 'A', text: R`$v_{b1} = 0\text{ V}$，因为理想运放虚断 $i_+ = 0$，$R_3 \parallel R_4$ 上没有电流流过故无压降`, correct: true },
            {
              key: 'B',
              text: R`$v_{b1} = v_1 \cdot R_4/(R_3+R_4)$，因为反相端通过虚短把电压耦合过来`,
              correct: false,
              feedback: R`虚短不会把电压从反相端“耦合”到同相端：是负反馈让 $v_a$ 去追 $v_b$，而 $v_b$ 只由接在同相端上的元件决定。$v_2 = 0$ 时那里只有接地的 $R_3$、$R_4$，没有任何源。`,
            },
            {
              key: 'C',
              text: R`$v_{b1}$ 不为零，必须先算出 $R_3 \parallel R_4$ 的阻值才能求压降`,
              correct: false,
              feedback: R`不用算并联阻值：虚断 $i_+ = 0$，压降 $= 0 \times (R_3 \parallel R_4) = 0$，阻值多大都一样。`,
            },
            {
              key: 'D',
              text: R`$v_{b1}$ 等于运放的负电源轨电压`,
              correct: false,
              feedback: '运放并没有饱和：电路工作在负反馈线性区，同相端电位由外接的电阻网络决定，与电源轨无关。',
            },
          ],
          feedback_correct: R`当 $v_2 = 0$ 时，同相输入节点仅连接无源电阻 $R_3$、$R_4$ 到地以及运放同相端。由于虚断 $i_+ = 0$，流过 $R_3 \parallel R_4$ 的总电流为零，因此 $v_{b1} = 0\text{ V}$；再由虚短知 $v_{a1} = 0\text{ V}$，电路严格退化为反相放大器。`,
          feedback_wrong: '想一想：运放同相端取不取电流？没有电流的电阻上压降是多少？',
          figure: SVG_Q2,
          sync: at(L2, ['vopen'], BENCH('nodal_full', 'matched_gain_10', 'sensor')),
        },
        {
          id: 'w3l6_q3',
          question: R`某标称差模增益为 10 的差分放大器（标称 $R_1 = R_3 = 10\text{ k}\Omega$，$R_2 = R_4 = 100\text{ k}\Omega$），因装配失误使 $R_4$ 实际阻值偏大 $+5\%$（变为 $105\text{ k}\Omega$），其余三颗电阻精确无误。若输入纯共模工频噪声 $v_1 = v_2 = 5\text{ V}$（$v_d = 0$），则输出端的共模噪声泄漏电压 $v_o$ 约为多少？`,
          options: [
            {
              key: 'A',
              text: R`$0\text{ V}$（理想运放仍可完全抑制共模）`,
              correct: false,
              feedback: R`共模抑制靠的不是运放有多理想，而是外部四颗电阻配对：$R_1R_4 = 10 \times 105 = 1050 \neq R_2R_3 = 100 \times 10 = 1000$，配对被打破，$A_{\text{cm}} \neq 0$。`,
            },
            {
              key: 'B',
              text: R`$+0.043\text{ V}$`,
              correct: false,
              feedback: R`$0.043$ 是共模增益 $A_{\text{cm}} \approx 0.04348$ 本身，还没有乘上输入的共模电压 $v_{\text{cm}} = 5\text{ V}$。`,
            },
            { key: 'C', text: R`$+0.217\text{ V}$`, correct: true },
            {
              key: 'D',
              text: R`$+0.500\text{ V}$`,
              correct: false,
              feedback: R`$0.5\text{ V}$ 对应 $A_{\text{cm}} = 0.1$，把泄漏估大了一倍多：分子是 $R_1R_4 - R_2R_3 = 50$，分母要用 $R_1(R_3 + R_4) = 10 \times 115 = 1150$，$A_{\text{cm}} = 50/1150 \approx 0.0435$。`,
            },
          ],
          feedback_correct: R`代入共模增益公式 $A_{\text{cm}} = \dfrac{R_1 R_4 - R_2 R_3}{R_1 (R_3 + R_4)} = \dfrac{10\times105 - 100\times10}{10\times(10+105)} = \dfrac{50}{1150} \approx +0.04348$。当 $v_{\text{cm}} = 5\text{ V}$ 时，输出泄漏 $v_o = A_{\text{cm}} \cdot v_{\text{cm}} \approx 0.04348 \times 5 \approx +0.2174\text{ V}$。`,
          feedback_wrong: R`先用 $A_{\text{cm}} = \frac{R_1R_4 - R_2R_3}{R_1(R_3 + R_4)}$ 求共模增益，再乘以共模输入电压。`,
          figure: SVG_Q3,
          sync: at(L3, ['acm'], { w36_tol: 'ideal_0pct', w36_d4: 0 }),
        },
        {
          id: 'w3l6_q4',
          question: '关于单运放四电阻差分放大器的工程局限性及下一讲 W3-L8 三运放仪表放大器的引入动机，以下哪项表述是完全正确的？',
          options: [
            {
              key: 'A',
              text: '单运放差分放大器两输入端阻抗均为无穷大，唯一缺点是不能大于 10 倍增益',
              correct: false,
              feedback: R`两处都不对：$v_1$ 端看进去只有 $R_1$，$v_2$ 端是 $R_3 + R_4$，输入电阻一点也不是无穷大；增益也没有 10 倍的上限，$R_2/R_1$ 取多大就是多大。`,
            },
            {
              key: 'B',
              text: R`单运放差分放大器在配对时，单端输入电阻偏低且不对称（$R_{\text{in}1}|_{v_2=0} = R_1$，$R_{\text{in}2}|_{v_1=0} = R_3 + R_4$），且调节增益需同步精准改变两对电阻，因此高内阻传感器常需前级电压跟随/同相缓冲构成仪表放大器`,
              correct: true,
            },
            {
              key: 'C',
              text: R`只要用单运放拓扑，任何形如 $v_o = -K_1 v_1 + K_2 v_2$ 的正系数 $K_1, K_2$ 都可以直接实现，不受 $K_2 < 1 + K_1$ 限制`,
              correct: false,
              feedback: R`第 5 幕刚推过：$R_3/R_4 = (1 + K_1 - K_2)/K_2$ 必须为正，所以只有 $K_2 < 1 + K_1$ 时单级四电阻拓扑才能直接实现。`,
            },
            {
              key: 'D',
              text: R`单运放差分放大器提高输入电阻的最佳办法是把 $R_1, R_2$ 全部换到 $100\text{ M}\Omega$ 以上，没有任何副作用`,
              correct: false,
              feedback: '副作用很大：百兆欧级电阻会引入严重的热噪声、偏置电流失调与寄生电容带宽下降——这正是工程上改用三运放仪表放大器的原因。',
            },
          ],
          feedback_correct: R`单运放差分放大器的核心工程短板正是输入电阻偏低且双端不对称（浮地差模输入电阻也仅 $2R_1$），且改变增益需同步调节两对匹配电阻；盲目把电阻做到百兆欧级会引入严重的热噪声、偏置电流失调与寄生电容带宽下降，因此工程上引入三运放仪表放大器（W3-L8）。`,
          feedback_wrong: '回到第 4 幕的两个“硬伤”：输入电阻和增益调节各是什么样子？',
          figure: SVG_Q4,
          sync: at(L3, ['rin'], { w36_tol: 'ideal_0pct', w36_d4: 0 }),
        },
      ],
      after_quiz: [
        { kind: 'p', text: '**后续预告：W3-L8 三运放仪表放大器**' },
        {
          kind: 'p',
          text: R`今天的单运放差分放大器留下了三大工程短板：输入电阻偏低、双端不对称，以及增益难以单电阻调节。W3-L8 的三运放仪表放大器先用两颗同相缓冲运放把输入电阻抬到近乎无穷大，再用一颗增益电阻 $R_G$ 统一调节增益——后级仍是今天这颗配对差分放大器。`,
        },
        { kind: 'figure', svg: SVG_NEXT, caption: '预告 W3-L8：两颗高阻缓冲 + 一颗增益电阻 + 今天的配对差分放大器' },
      ],
    },
  ],
};

export default W3_L6;
