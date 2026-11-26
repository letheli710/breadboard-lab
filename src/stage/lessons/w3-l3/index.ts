// W3-L3 · 反相放大器（虚地推导、输入电阻与 ±9V 双电源面包板实测） (lesson sheet: docs/lessons/W3-L3.md).
// The professor's text of the six acts is reproduced from the sheet as written; [[id|…]] only links
// a term to the stage (the words are unchanged). Changes of form:
// - the opening remarks open act 1; the sheet's numbered sub-headings (1.1 … 6.4) are bold lines;
//   `$$…$$` display formulas sit in the ① / ② / ③ cards (a lead-in sentence becomes the card title)
//   or, outside a derivation, in a formula card after their sentence; a bulleted ① runs as one
//   paragraph; the "本幕内联 2D 原理图" headings become the figure captions; *italic* (not part of
//   the inline markup) is plain text;
// - act 6 is split in two (wiring / measuring and troubleshooting) so the 3D camera can frame each,
//   and the quiz is an act of its own;
// - the sheet's JSON (guided example, quiz) is mapped onto types.ts: prompt → question,
//   hint_latex → hint (in $…$), board_append_latex → board, professor_intercept → the feedback of
//   the option that embodies it; the sheet's engineering checklist ("Claude 工程落地清单") is not
//   lesson text and is left out.
// Anti-spoiler: the guided example is Example 5.3 of act 4, so act 4 keeps the problem, ① and ② and
// its ③ calculation moved behind the guided block as the 「通关复盘」 board; fig 4.1 (which prints
// the answers) closes the act, the problem figure before it is fig 4.1's left panel without them;
// step 4's mini diagram no longer prints the 1.25 V drop; while the example runs the stage shows
// its circuit with the unanswered numbers as "?" (param reveal, uncovered by done_params).
// Course-owner rule: the ±9 V supply is the 台式可调直流电源（±9 V） (two 9 V outputs in series, COM =
// GND), not two 9 V batteries: 6.1 step 1, the 6.3 fix, 5.3's single-supply mistake and fig 6.1
// say so; the op amp on the board is the shared LM358 (Lm358.tsx).
// Added: the guided example's options (3 per step: the right one, the sheet's common mistake with
// its intercept, one more wrong one), praise, problem line and conclusion; the quiz's per-option
// feedback and figures; the breadboard safety / component table and the 3D wiring table in act 6;
// a note on the stage's fault switch in act 6.3; the W3-L4 preview after the quiz.

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import { LM358_PINS, type Lm358Pin } from '../../Lm358';
import type { StageLesson, StageSync } from '../../types';
import { EX53, SUPPLY_NAME } from './common';
import {
  EX53_PROBLEM,
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
  SVG_FAULTS,
  SVG_NEXT,
  SVG_Q1,
  SVG_Q2,
  SVG_Q3,
  SVG_Q4,
  SVG_QUIZ_ACT,
} from './svgs';

const SchematicLayer = lazy(() => import('./SchematicLayer'));
const TransferLayer = lazy(() => import('./TransferLayer'));
const Bench3D = lazy(() => import('./Bench3D'));

const R = String.raw;
/** inline code inside String.raw text */
const code = (s: string) => '`' + s + '`';

const L1 = 'schematic';
const L2 = 'transfer';
const L3 = 'bench3d';

/** the lab circuit (R1 = 10 kΩ, R_f = 22 kΩ, v_i = +1 V on ±9 V); every act sets all of it */
const BASE = { case: 'free', reveal: 9, vi: 1, r1: 10_000, rf: 22_000, supply: 'dual', fault: 'none', labRf: 22_000 };
const lab = (p: Record<string, unknown> = {}): StageSync['params'] => ({ ...BASE, ...p });
/** Example 5.3 on the stage, `reveal` = how much of it is found so far */
const ex = (reveal: number) => lab({ ...EX53, reveal });

/** what each LM358 pin does in this lesson's circuit */
const PIN_ROLE: Record<number, string> = {
  1: '输出 vₒ（f44），Rf 一端在 g44',
  2: '虚地 v₋（f45），R₁ 右脚与 Rf 另一端在这一列',
  3: '接 GND（j46 → 底部 GND 轨）',
  4: '接 −9 V（j47 → 底部 − 轨）',
  5: '通道 B，本课未用',
  6: '通道 B，本课未用',
  7: '通道 B，本课未用',
  8: '接 +9 V（a44 → 顶部 + 轨）',
};

const W3_L3: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: SchematicLayer, [L2]: TransferLayer, [L3]: Bench3D },
  describeTarget: (id) => {
    const m = /^chip_lm358_p([1-8])$/.exec(id);
    if (m) {
      const p = LM358_PINS[Number(m[1]) as Lm358Pin];
      return { label: `LM358 Pin ${m[1]} · ${p.name}`, desc: `${p.zh}；本课：${PIN_ROLE[Number(m[1])]}` };
    }
    return genericLabel(id);
  },
  lesson_meta: {
    lesson_id: 'W3-L3',
    world: 'World 3',
    title: '反相放大器（虚地推导、输入电阻与 ±9V 双电源面包板实测）',
    subtitle: 'Inverting Amplifier: Virtual Ground, Input Resistance & Dual ±9V Breadboard Lab',
    lesson_type: 'C',
    lesson_type_label: 'Type C · 经典拓扑 + 3D 面包板实测课',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release（Alexander, Sadiku & Fredette）',
      sections: ['Section 5.4 Inverting Amplifier（p. 179–181）', 'Fig. 5.10 · 5.11 · 5.12 · 5.14；Eq. 5.8 · 5.9；Example 5.3 · 5.4'],
    },
    prerequisites: ['W1-L3 欧姆定律', 'W1-L5 基尔霍夫电流定律 (KCL)', 'W3-L2 理想运放：虚断与虚短'],
    learning_objectives: [
      '准确区分反相端“虚地（Virtual Ground）”与“真实接地”的物理本质，解释电流拐弯机制 $i_1 = i_f$',
      '独立完成反相放大器闭环电压增益 $A_v = -R_f/R_1$（Eq. 5.8 / 5.9）的三段式符号与数值推导',
      R`推导反相放大器输入电阻 $R_{\text{in}} = R_1$，并掌握工程选阻在加载效应、噪声与偏置误差之间的权衡`,
      '熟练求解 Sadiku Example 5.3（增益、输出电压、支路电流与运放输出电流 $i_o$）及 Example 5.4（跨阻放大器视角）',
      R`理解 $\pm 9\text{ V}$ 双电源供电与防削波铁律，能用传输特性曲线算出 LM358 线性输入范围，并排查单电源 0 V 死锁故障`,
    ],
    next_lesson: 'W3-L4',
    next_lesson_title: '同相放大器与电压跟随器（缓冲隔离与面包板实测）',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 2D 动态原理图',
        short: '01 动态原理图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '01 2D 动态原理图：节点 1 的虚地气泡实时显示 v₋（线性区金色 0 V，饱和时变红并显示真实电位）；电流颗粒从 vᵢ 流过 R₁，遇 Pin 2 虚断红叉后 100% 拐弯流经 Rf；可调 vᵢ、R₁、Rf 与电源模式。',
      },
      {
        id: L2,
        label: '02 传输特性曲线与 ±9V 饱和边界',
        short: '02 传输特性',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 vₒ–vᵢ 传输特性曲线：斜率 = −Rf/R₁，LM358 ±9 V 线性区（10 kΩ / 22 kΩ 时 −3.41 V … +4.09 V）与 +7.5 V / −9.0 V 饱和平台；红色虚线叠加“误用单 +9 V”的 0 V 死锁曲线，工作点随 vᵢ 移动。',
      },
      {
        id: L3,
        label: '03 3D LM358 ±9V 双电源面包板实测',
        short: '03 3D 实测',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption: `03 3D 面包板：LM358（DIP-8）+ ${SUPPLY_NAME} + R₁ = 10 kΩ（棕黑橙金）/ Rf = 22 kΩ（红红橙金）；万用表红表笔点测 vᵢ、Pin 1、Pin 2 与供电引脚；电源模式开关对比单 +9 V 错误接法，接线开关演示两种常见故障。`,
      },
    ],
    hover_map: {
      vi_src: { label: '输入电压 vᵢ（信号源）', desc: '左侧输入源；面包板上是可调直流信号源，红夹接第 38 列（R₁ 左脚），黑夹接 GND 轨' },
      r1: { label: '输入电阻 R₁', desc: '10 kΩ（棕-黑-橙-金）：左脚接 vᵢ，右脚在 Pin 2 所在列（面包板 i38 → i45）；右端是虚地，所以 i₁ = vᵢ / R₁' },
      rf: { label: '反馈电阻 Rf', desc: '从输出跨回反相端构成负反馈：22 kΩ（红-红-橙-金），面包板上 g44（Pin 1）– g45（Pin 2）；47 kΩ 用于高增益削波对比' },
      rin: { label: '输入电阻 Rᵢₙ = R₁', desc: '从输入端口看进去 Rᵢₙ = vᵢ / i₁ = R₁（右端被虚地钉在 0 V）；它与信号源内阻 R_s 分压，造成加载衰减' },
      node1: { label: '节点 1 · 虚地（Virtual Ground）', desc: '反相端 Pin 2：线性区 v₋ = v₊ = 0 V，但没有导线接地——是输出经 Rf 不断“拉回”维持的；输出饱和时虚地崩溃' },
      pin_inv: { label: '反相输入端（−）· 虚断', desc: 'LM358 Pin 2（IN1−）：i₋ = 0，电流进不了运放，只能拐弯流经 Rf；切勿用导线把 Pin 2 接到 GND' },
      pin_noninv: { label: '同相输入端（+）· 真实接地', desc: 'LM358 Pin 3（IN1+）：用短跳线接 GND（j46 → 底部 GND 轨），v₊ = 0 V' },
      opamp: { label: '运放 LM358（通道 A）', desc: 'DIP-8 双运放，本课用通道 A：Pin 1 OUT1、Pin 2 IN1−、Pin 3 IN1+、Pin 4 V−、Pin 8 V+' },
      chip_lm358: { label: 'LM358（DIP-8）', desc: '缺口朝左横跨中央隔离槽：Pin 1–4 在下侧（f44–f47），Pin 8–5 在上侧（e44–e47）' },
      vo_out: { label: '输出端 vₒ（Pin 1）', desc: 'vₒ = −(Rf/R₁)·vᵢ，被 LM358 摆幅限制在 [−9.0 V, +7.5 V]（单 +9 V 时下限 0 V）' },
      i1: { label: '输入电流 i₁', desc: 'i₁ = (vᵢ − v₋)/R₁：线性区 v₋ = 0，i₁ = vᵢ/R₁' },
      i_f: { label: '反馈电流 i_f', desc: '虚断 i₋ = 0 + 节点 1 KCL：i_f = i₁，100% 拐弯流过 Rf' },
      io: { label: '运放输出电流 iₒ', desc: '参考方向为从运放输出端向右流出；输出节点 KCL：iₒ + i_f = i_L，空载时 iₒ = −i_f（负号 = 灌电流）' },
      rail_p: { label: '+9 V 电源轨 · Pin 8（V+）', desc: '顶部红色轨，接电源 CH1 正极；红跳线 a44 → + 轨给 Pin 8 供电' },
      rail_n: {
        label: '−9 V 电源轨 · Pin 4（V−）',
        desc: '底部蓝色轨，接电源 CH2 负极；蓝跳线 j47 → − 轨。若 Pin 4 误接 GND（单 +9 V），正输入时输出死锁 0 V；Pin 4 与 Pin 8 严禁反接',
      },
      gnd: { label: '0 V 参考地 GND', desc: '电源两路串联的公共端 COM：顶部 − 轨与底部 + 轨（第 9 列黑跳线相连）都是 GND；Pin 3、去耦电容、信号源与万用表黑表笔都接这里' },
      supply: { label: SUPPLY_NAME, desc: '两路 9 V 输出串联：CH1 − 与 CH2 + 相连作公共端 COM（0 V）；CH1 + → +9 V 轨，CH2 − → −9 V 轨；用红/黑/蓝引线接到面包板电源轨' },
      lin_window: { label: '线性输入窗口', desc: '−(R₁/Rf)·V_o,max ≤ vᵢ ≤ −(R₁/Rf)·V_o,min；10 kΩ / 22 kΩ、±9 V 时为 −3.41 V … +4.09 V' },
      sat_pos: { label: '正饱和平台 +7.5 V', desc: 'LM358 正摆幅受内部达林顿上拉管压降限制，约 V+ − 1.5 V = +7.5 V' },
      sat_neg: { label: '负饱和平台 −9.0 V', desc: 'LM358 输出可下摆到接近负轨 V−；单 +9 V 供电时负轨就是 0 V' },
      slope: { label: '斜率 = −Rf/R₁', desc: '线性段的斜率就是闭环增益 Aᵥ（Eq. 5.9），与芯片开环增益 A 无关' },
      single_curve: { label: '单 +9 V 误接曲线', desc: 'Pin 4 接 GND 时输出下限为 0 V：vᵢ > 0 全部削波死锁在 0 V，虚地崩溃' },
      op_point: { label: '工作点 (vᵢ, vₒ)', desc: '跟随 vᵢ 滑块移动；落在饱和平台上时输出已削波' },
      dmm: { label: '万用表（DC V 档）', desc: '黑表笔固定接 GND 轨（Bg52），红表笔点测 vᵢ（j38）、Pin 1（j44）、Pin 2（j45）、Pin 3、Pin 4、Pin 8' },
      c_dec: { label: '0.1 µF 去耦电容 × 2', desc: '陶瓷电容就近跨接 Pin 8–GND（b44 – 顶部 GND）与 Pin 4–GND（i47 – 底部 GND），旁路电源噪声' },
      safety: { label: '面包板安全说明', desc: '阻值已是 kΩ 级，无需 1000× 缩放；±9 V 双电源，支路电流 ≤ 约 0.9 mA，电阻功耗远低于 1/4 W；Pin 4 / Pin 8 严禁反接' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '虚地（Virtual Ground）的诞生——电位为 0 V，却绝没有接地！',
      sync: { layer: L1, halo: ['node1', 'pin_inv', 'i_f'], params: lab() },
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎回到 Breadboard Lab！上一讲（${code('W3-L2')}）我们拿到了分析一切线性运放电路的“两把尚方宝剑”——**虚断（$i_+ = i_- = 0$）**与**虚短（$v_+ = v_-$）**。今天，我们正式用这两把剑解剖模拟电子世界里最经典、出镜率最高的电路拓扑——**反相放大器（Inverting Amplifier）**。这节课我们严格对齐 Alexander, Sadiku & Fredette Fundamentals of Electric Circuits (2026 Release) **Section 5.4（p. 179–181）**，不仅要把公式推得滴水不漏，更要把你在面包板上最容易踩的“**单电源 0 V 死锁削波**”大坑彻底填平！`,
        },
        { kind: 'p', text: '**1.1 物理直觉：为什么运放能把一个悬空的节点“钉”在 0 V？**' },
        {
          kind: 'formula',
          title: R`观察反相放大器的输入级连接方式：我们把运放的**[[pin_noninv|同相输入端（$+$）]]直接连到参考地（GND）**，因此同相端电位被硬性锁定为：`,
          tex: R`v_+ = 0\text{ V}`,
        },
        {
          kind: 'formula',
          title: R`同时，我们在[[vo_out|输出端 $v_o$]] 与[[pin_inv|反相输入端（$-$）]]之间跨接了一颗[[rf|反馈电阻 $R_f$]]，构成了深度**负反馈（Negative Feedback）**。只要运放工作在线性区（未饱和），根据 ${code('W3-L2')} 建立的**虚短（Virtual Short）**公理，反相输入端（图中记为[[node1|节点 1]]）的电位必须紧紧跟随同相端：`,
          tex: R`v_- = v_+ = 0\text{ V}`,
        },
        { kind: 'p', text: R`这个现象在电路学中被称为**[[node1|虚地（Virtual Ground）]]**。但同学们千万不要被“地”字骗了——请牢记教授的**虚地双铁律**：` },
        {
          kind: 'ol',
          items: [
            R`**电位像地，物理不是地**：节点 1 的对地电压确实是 $0\text{ V}$，但**它绝对没有用导线连到地线上**！它是靠运放输出端 $v_o$ 通过 $R_f$ 不断“向回拉扯”才维持在 $0\text{ V}$ 平衡态的。`,
            R`**电流全部被迫拐弯**：既然节点 1 没有接地，且根据**[[pin_inv|虚断（Virtual Open）]]**公理，流入运放反相端的电流 $i_- = 0$，那么从[[vi_src|输入源 $v_i$]] 经过 [[r1|$R_1$]] 流过来的[[i1|电流 $i_1$]] 到达节点 1 后，面前是两条死路（既无地线可下泄，也钻不进运放内部），它唯一的出路就是**100% 向上拐弯，全部流过[[i_f|反馈电阻 $R_f$]]**：`,
          ],
        },
        { kind: 'formula', title: '电流拐弯：', tex: R`i_f = i_1` },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授防坑提醒**：如果你在面包板上误以为“既然 $v_- = 0\text{ V}$，那我直接拿根跳线把 [[pin_inv|Pin 2]] 接到 [[gnd|GND 轨]]岂不是更稳？”——**绝对不行！** 一旦物理短接到地，输入电流 $i_1$ 会直接泄入大地，反馈回路彻底断链，输出电压 $v_o$ 会瞬间失去控制（归零或撞轨）。`,
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '1.2 本幕内联 2D 原理图：反相端虚地特写与电流拐弯机制',
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '闭环增益的黄金公式——三段式教授板书推导（Eq. 5.8 & Eq. 5.9）',
      sync: { layer: L1, halo: ['r1', 'rf', 'vo_out'], params: lab() },
      blocks: [
        { kind: 'p', text: '**2.1 三段式教授板书推导**' },
        {
          kind: 'p',
          text: '下面我们严格按照 Sadiku **Fig. 5.10**，用**① 公理溯源 → ② 纯符号通式 → ③ 代入数值逐步化简**三段式板书推导反相放大器的闭环传输方程（**Eq. 5.8** 与 **Eq. 5.9**）。',
        },
        {
          kind: 'origin',
          title: '① 公理溯源（物理定律与理想运放公理）',
          text: R`1. **[[node1|节点 1]] 基尔霍夫电流定律（KCL，${code('W1-L5')}）**：流入节点 1 的电流之和等于流出节点 1 的电流之和：$i_1 = i_- + i_f$。2. **欧姆定律（${code('W1-L3')}）**：用节点电位差表示两条支路电流：$i_1 = \dfrac{v_i - v_-}{R_1}, \qquad i_f = \dfrac{v_- - v_o}{R_f}$。3. **理想运放公理（${code('W3-L2')}）**：**[[pin_inv|虚断]]**：$i_- = 0$；**虚短**（结合[[pin_noninv|同相端接地]] $v_+ = 0$）：$v_- = v_+ = 0$。`,
        },
        { kind: 'formula', title: R`② 纯符号通式（严禁混入任何数字）：将虚断 $i_- = 0$ 代入 KCL：`, tex: R`i_1 = i_f` },
        { kind: 'formula', title: '代入欧姆定律表达式：', tex: R`\frac{v_i - v_-}{R_1} = \frac{v_- - v_o}{R_f}` },
        { kind: 'formula', title: R`代入虚地条件 $v_- = 0$：`, tex: R`\frac{v_i - 0}{R_1} = \frac{0 - v_o}{R_f} \implies \frac{v_i}{R_1} = -\frac{v_o}{R_f}` },
        {
          kind: 'formula',
          title: '整理得到 Sadiku **Eq. 5.8**（输出电压通式）与 **Eq. 5.9**（闭环电压增益通式）：',
          tex: R`\begin{gathered} v_o = -\frac{R_f}{R_1} v_i \qquad \text{(Eq. 5.8)} \\[6pt] A_v = \frac{v_o}{v_i} = -\frac{R_f}{R_1} \qquad \text{(Eq. 5.9)} \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（以本课 3D 面包板实测参数为例）',
          steps: [
            {
              label: '已知',
              text: R`取标准 E12 电阻 [[r1|$R_1 = 10\text{ k}\Omega$]]、[[rf|$R_f = 22\text{ k}\Omega$]]，输入直流电压 $v_i = +1.00\text{ V}$（采用 [[supply|$\pm 9\text{ V}$ 双电源]]供电）：`,
            },
            { label: R`1. 计算闭环电压增益 $A_v$：`, tex: R`A_v = -\frac{22\text{ k}\Omega}{10\text{ k}\Omega} = -2.20` },
            { label: R`2. 计算输出电压 $v_o$：`, tex: R`v_o = A_v \cdot v_i = (-2.20) \times (+1.00\text{ V}) = -2.20\text{ V}` },
            {
              label: '3. 核验支路电流：',
              tex: R`i_1 = \frac{+1.00\text{ V} - 0\text{ V}}{10\text{ k}\Omega} = 0.10\text{ mA} = 100\ \mu\text{A}, \qquad i_f = \frac{0\text{ V} - (-2.20\text{ V})}{22\text{ k}\Omega} = 100\ \mu\text{A}`,
            },
            {
              label: '核验结论',
              text: R`两者严丝合缝相等，且 $-2.20\text{ V}$ 稳稳落在 LM358 $\pm 9\text{ V}$ 供电的线性输出区间 $[-9.0\text{ V}, +7.5\text{ V}]$ 内。`,
            },
          ],
        },
        { kind: 'p', text: R`**2.2 深度解读：负号的意义与“与芯片内部 $A$ 无关”的奇迹**` },
        { kind: 'p', text: R`**1. 负号的物理意义（反相 $180^\circ$）**：` },
        {
          kind: 'ul',
          items: [
            '对直流信号：正输入产生负输出，负输入产生正输出。',
            R`对交流正弦信号：输出波形与输入波形**相位完全相反（反相 $180^\circ$）**——输入到达波峰时，输出正好到达波谷。`,
          ],
        },
        { kind: 'p', text: R`**2. 闭环增益为何与芯片内部开环增益 $A$ 无关？**` },
        {
          kind: 'ul',
          items: [R`真实的 LM358 开环增益 $A$ 既庞大又不稳定（受温度、批次影响，可能在 $5 \times 10^4$ 到 $2 \times 10^5$ 之间剧烈漂移）。`],
        },
        {
          kind: 'formula',
          title: R`若计入有限开环增益 $A$，严格推导出的闭环增益为：`,
          tex: R`A_{v,\text{real}} = \frac{-R_f / R_1}{1 + \dfrac{1 + R_f / R_1}{A}}`,
        },
        {
          kind: 'calc',
          title: R`当 $R_f / R_1 = 2.2$、$A = 10^5$ 时，经 Python 精确验算：`,
          steps: [{ label: '代入', tex: R`A_{v,\text{real}} = \frac{-2.2}{1 + 3.2 / 10^5} = -2.1999296` }],
        },
        {
          kind: 'p',
          text: R`与理想值 $-2.20$ 的相对误差仅为 **$-0.0032\%$**！这就是负反馈最伟大的工程魔法：**用两颗廉价但精密的外接电阻比值，换取了不受半导体离散性影响的超高精度增益。**`,
        },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '2.3 本幕内联 2D 原理图：完整反相放大器（对齐 Sadiku Fig. 5.10）',
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: R`输入电阻 $R_{\text{in}} = R_1$ 与工程选阻权衡（Fig. 5.11 等效模型）`,
      sync: { layer: L1, halo: ['rin', 'vi_src'], params: lab() },
      blocks: [
        { kind: 'p', text: R`**3.1 为什么说“反相放大器的输入电阻就是 $R_1$”？**` },
        {
          kind: 'p',
          text: R`虽然运放芯片本身的差分输入电阻趋近于无穷大（$R_i \to \infty$），但从**整个反相放大器的输入端口**往里看，[[vi_src|信号源 $v_i$]] 感受到的[[rin|等效输入电阻 $R_{\text{in}}$]] 却完全不是无穷大！我们用三段式板书把它彻底看穿：`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`输入电阻的定义为输入端口电压与输入端口电流之比：$R_{\text{in}} \triangleq \dfrac{v_i}{i_1}$。同时[[node1|节点 1 为虚地]]（$v_- = 0$），流过 [[r1|$R_1$]] 的电流由欧姆定律给出：$i_1 = \frac{v_i - v_-}{R_1}$。`,
        },
        { kind: 'formula', title: '② 纯符号通式', tex: R`R_{\text{in}} = \frac{v_i}{i_1} = \frac{v_i}{(v_i - 0)/R_1} = R_1` },
        { kind: 'p', text: '这就是 Sadiku **Fig. 5.11** 所揭示的二端口等效模型：' },
        {
          kind: 'ul',
          items: [
            R`**输入侧**：等效为一颗直接接地的电阻 $R_1$（因为右端被虚地钉在 $0\text{ V}$）；`,
            R`**输出侧**：等效为一个受控电压源（VCVS），其电压为 $-\frac{R_f}{R_1} v_i$（理想输出电阻 $R_{\text{out}} = 0$）。`,
          ],
        },
        {
          kind: 'calc',
          title: R`③ 数值对比：前级信号源加载效应（设前级内阻 $R_s = 1\text{ k}\Omega$，开路电动势 $V_s = 1.00\text{ V}$）`,
          steps: [
            {
              label: '分压',
              text: R`实际传感器或信号发生器都有内阻 $R_s$，它会与 [[rin|$R_{\text{in}} = R_1$]] 构成分压器：`,
              tex: R`v_i = V_s \cdot \frac{R_1}{R_s + R_1}`,
            },
          ],
        },
        {
          kind: 'table',
          head: [R`选取的 $R_1$`, R`实际到达放大器输入端的 $v_i$`, '加载衰减误差', '工程评价'],
          rows: [
            [R`$1\text{ k}\Omega$`, R`$0.5000\text{ V}$`, R`**$-50.00\%$**`, '严重加载前级，增益缩水一半！'],
            [R`**$10\text{ k}\Omega$**`, R`**$0.9091\text{ V}$**`, R`**$-9.09\%$**`, '面包板实测甜点区（配合低阻源）'],
            [R`$100\text{ k}\Omega$`, R`$0.9901\text{ V}$`, R`$-0.99\%$`, '加载极轻，但需留意噪声与偏置电流'],
          ],
        },
        { kind: 'p', text: '**3.2 工程选阻的“黄金折中区间”**' },
        {
          kind: 'p',
          text: R`既然 $R_1$ 越大加载越轻，那是不是把 $R_1$ 选成 $10\text{ M}\Omega$ 就万事大吉了？**绝对不行！** 在真实模拟电路中，选阻永远是两头夹击的权衡：`,
        },
        {
          kind: 'ul',
          items: [
            R`**$R_1$ 不能太小（通常 $\ge 1\text{ k}\Omega$）**：不仅会严重加载前级信号源，而且为了维持相同增益，若 $R_f$ 也偏小，会迫使运放输出级提供过大的反馈电流，触发 LM358 的输出电流限流（约 $20\text{ mA}$ 灌电流 / $40\text{ mA}$ 拉电流）并增加发热。`,
            R`**$R_1$ 与 $R_f$ 不能太大（通常 $\le 1\text{ M}\Omega$）**：`,
          ],
        },
        {
          kind: 'ol',
          items: [
            R`**约翰逊热噪声（Thermal Noise）**与电阻平方根成正比（$v_{n,\text{rms}} = \sqrt{4k_B T R \Delta f}$），兆欧级电阻会引入明显底噪；`,
            R`**输入偏置电流误差**：真实 LM358 反相端存在约 $45\text{ nA}$（典型值）的输入偏置电流 $I_B$，流过 $10\text{ M}\Omega$ 的 $R_f$ 就会凭空产生 $45\text{ nA} \times 10\text{ M}\Omega = 0.45\text{ V}$ 的输出直流失调！`,
            R`**寄生电容限带宽**：面包板插孔间存在约 $2\sim 5\text{ pF}$ 的寄生电容，与兆欧电阻形成极低截止频率的低通滤波器，还会诱发高频拾噪。`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授口诀**：面包板运放实验认准 **$\text{k}\Omega$ 级黄金区（$10\text{ k}\Omega \sim 100\text{ k}\Omega$）**——既不拖垮前级，又不招惹噪声与偏置误差。如果前级传感器内阻极高（例如压电陶瓷或 pH 电极），下一讲（${code('W3-L4')}）的**同相放大器 / 电压跟随器**才是正解！`,
        },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '3.3 本幕内联 2D 原理图：输入电阻等效模型（对齐 Sadiku Fig. 5.11）',
    },
    /* ---------------------------------------------------------------- act 4 (Example 5.3: the guided example; Example 5.4) */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '经典例题精讲——Example 5.3 与 Example 5.4（跨阻放大器视角）',
      sync: { layer: L1, halo: ['r1', 'rf', 'node1'], params: ex(0) },
      blocks: [
        { kind: 'p', text: '**4.1 经典例题 Example 5.3（对齐 Sadiku Fig. 5.12）**' },
        {
          kind: 'p',
          text: R`**题目**：如图所示反相放大器电路中，已知 [[r1|$R_1 = 10\text{ k}\Omega$]]，[[rf|$R_f = 25\text{ k}\Omega$]]，[[vi_src|输入电压 $v_i = 0.5\text{ V}$]]（运放理想且供电充足）。试求：`,
        },
        {
          kind: 'ol',
          items: [
            R`闭环电压增益 $A_v$ 与输出电压 $v_o$；`,
            R`流过 $10\text{ k}\Omega$ 输入电阻的电流 [[i1|$i_1$]] 与[[i_f|反馈电阻电流 $i_f$]]；`,
            R`空载时运放输出端流出的电流 [[io|$i_o$]]（并拓展计算：若在输出端接入 $R_L = 5\text{ k}\Omega$ 负载电阻，$i_o$ 变为多少？）。`,
          ],
        },
        { kind: 'figure', svg: EX53_PROBLEM, caption: 'Example 5.3 题图（Sadiku Fig. 5.12）：R₁ = 10 kΩ，Rf = 25 kΩ，vᵢ = 0.5 V' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`[[node1|节点 1（反相端）]]：虚短得 $v_- = v_+ = 0$，虚断得 $i_- = 0$，KCL 得 $i_1 = i_f$。[[vo_out|输出节点（$v_o$ 处）]]：设[[io|运放输出电流 $i_o$]] 的参考方向为**从运放输出端向右流出**，则 KCL 满足 $i_o + i_f = i_L$（空载时 $i_L = 0$）。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式',
          tex: R`\begin{gathered} A_v = -\frac{R_f}{R_1}, \qquad v_o = A_v v_i = -\frac{R_f}{R_1} v_i \\[6pt] i_1 = \frac{v_i - 0}{R_1} = \frac{v_i}{R_1}, \qquad i_f = i_1 \\[6pt] i_o\big|_{\text{空载}} = -i_f = -\frac{v_i}{R_1}, \qquad i_o\big|_{\text{带载 } R_L} = i_L - i_f = \frac{v_o}{R_L} - \frac{v_i}{R_1} \end{gathered}`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '③ 代入数值这一步先不写：下面的苏格拉底引导例题就是这道题。自己闯关之后，完整推导作为“通关复盘”板书紧跟在后面。',
        },
        {
          kind: 'guided',
          title: 'Sadiku Example 5.3 苏格拉底式五步拆解',
          source: 'Alexander, Sadiku & Fredette (2026), Section 5.4, Example 5.3, Fig. 5.12',
          problem: R`同 4.1 题目：$R_1 = 10\text{ k}\Omega$，$R_f = 25\text{ k}\Omega$，$v_i = 0.5\text{ V}$，$\pm 9\text{ V}$ 双电源供电。按五步拆解：先锁定反相端电位，再求 $i_1$、$i_f$，然后求 $A_v$ 与 $v_o$，最后对输出节点列 KCL 求空载 $i_o$。`,
          problem_svg: EX53_PROBLEM,
          // all steps answered: the stage uncovers the example's numbers
          done_params: { reveal: 9 },
          steps: [
            {
              title: 'Step 1 · 锁定反相端电位（虚地识别）',
              mini_svg: MINI_STEP1,
              question:
                '观察 Example 5.3 电路：同相端 (+) 直接接地，反相端 (−) 通过 Rf = 25 kΩ 接至输出端形成负反馈。请问反相端节点 1 的电位 v₋ 是多少伏？它是否用导线物理接到了地线上？',
              hint: R`$v_+ = 0\text{ V} \xrightarrow{\text{虚短}} v_- = v_+ = 0\text{ V}$`,
              options: [
                {
                  text: R`$v_- = 0\text{ V}$，说明节点 1 就是真地：可以直接把它短接到地线，输入电流直接流进地里`,
                  correct: false,
                  feedback: '停一下！同相端才是真地，反相端只是电位被运放“悬空托在” 0 V。如果它真接了地，输入电流就会全部漏进大地，后面 Rf 根本拿不到电流！',
                },
                {
                  text: R`$v_- = 0\text{ V}$；节点 1 没有物理接地，它是负反馈维持的虚地（Virtual Ground）`,
                  correct: true,
                  feedback: '正确！v₊ 接地为 0 V，虚短让 v₋ 紧跟 v₊；但节点 1 没有任何导线通向地线，0 V 是输出经 Rf 不断“拉回”维持的。',
                },
                {
                  text: R`$v_- = v_i = 0.5\text{ V}$：反相端直接跟着输入电压走`,
                  correct: false,
                  feedback:
                    '这是把 R₁ 当成了导线。只要运放工作在线性区，虚短要求 v₋ 紧跟 v₊，而 v₊ 接地为 0 V——负反馈会把 v₋ 拉回 0 V，0.5 V 全部降在 R₁ 两端。（只有 Rf 断开、没有反馈时，v₋ 才会等于 vᵢ。）',
                },
              ],
              board: [R`\text{Step 1 (虚地锁定): } v_- = v_+ = 0\text{ V}`],
              halo: ['node1', 'pin_noninv'],
              params: ex(0),
              layer: L1,
            },
            {
              title: 'Step 2 · 求输入电阻支路电流 i₁',
              mini_svg: MINI_STEP2,
              question: '已知左侧输入电压 vᵢ = 0.5 V，输入电阻 R₁ = 10 kΩ，右端节点 1 为 0 V 虚地。请用欧姆定律计算流过 R₁ 的电流 i₁（建议用 µA 表示）。',
              hint: R`$i_1 = \dfrac{v_i - v_-}{R_1} = \dfrac{0.5\text{ V} - 0\text{ V}}{10\times 10^3\ \Omega}$`,
              options: [
                {
                  text: R`$i_1 = 0.05\text{ A}$（即 $50\text{ mA}$）`,
                  correct: false,
                  feedback: '小心数量级！分母是 10 kΩ（10,000 Ω），伏特除以千欧得到的是毫安（mA），0.05 mA 再乘以 1000 才是 50 µA。',
                },
                {
                  text: R`$i_1 \approx 14.3\ \mu\text{A}$（$0.5\text{ V}$ 除以 $R_1 + R_f = 35\text{ k}\Omega$）`,
                  correct: false,
                  feedback: 'R₁ 和 Rf 并不是串联着接到地上。R₁ 的右端就是 0 V 虚地，所以 R₁ 两端的电压就是 0.5 V − 0 V，电流只由 R₁ 决定。把 Rf 也加进分母，等于假设 v₋ 不是 0 V。',
                },
                {
                  text: R`$i_1 = 50\ \mu\text{A}$（即 $0.05\text{ mA}$）`,
                  correct: true,
                  feedback: '漂亮！i₁ = 0.5 V / 10 kΩ = 0.05 mA = 50 µA，单位换算一步不错。',
                },
              ],
              board: [R`\text{Step 2 (输入电流): } i_1 = \frac{0.5\text{ V}}{10\text{ k}\Omega} = 0.05\text{ mA} = 50\ \mu\text{A}`],
              halo: ['r1', 'i1'],
              params: ex(1),
              layer: L1,
            },
            {
              title: 'Step 3 · 应用虚断与 KCL 确定反馈电流 i_f',
              mini_svg: MINI_STEP3,
              question: '50 µA 的电流到达节点 1 后，面对运放反相输入端和反馈电阻 Rf = 25 kΩ 两条支路。根据虚断公理，流过 Rf 的电流 i_f 是多少？方向如何？',
              hint: R`$\text{KCL at Node 1: } i_1 = i_- + i_f,\quad i_- = 0 \implies i_f = i_1$`,
              options: [
                {
                  text: R`$i_f = i_1 = 50\ \mu\text{A}$，方向从节点 1 向右流过 $25\text{ k}\Omega$ 电阻流向输出端 $v_o$`,
                  correct: true,
                  feedback: '完全正确！虚断让运放输入端对电流完全封闭，50 µA 一点不少地拐弯流过 Rf，方向从节点 1 流向输出端。',
                },
                {
                  text: R`一部分电流分流进运放反相端，所以 $i_f < 50\ \mu\text{A}$`,
                  correct: false,
                  feedback: '记住虚断这堵“高墙”：i₋ = 0 意味着运放输入端对电流完全封闭，50 µA 没有任何分流，只能 100% 拐弯流经 Rf。',
                },
                {
                  text: R`$i_f = 50\ \mu\text{A}$，但方向是从输出端 $v_o$ 向左流回节点 1`,
                  correct: false,
                  feedback:
                    '大小对了，方向反了。i₁ 的 50 µA 从左边流进节点 1，运放输入端又被虚断堵死，KCL 要求这 50 µA 经 Rf 流出节点 1——也就是向右流向 vₒ。如果 i_f 也向左流回节点 1，节点 1 就只有流入、没有流出，违反 KCL。',
                },
              ],
              board: [R`\text{Step 3 (反馈电流): } i_f = i_1 = 50\ \mu\text{A}\ (\text{方向：左} \to \text{右})`],
              halo: ['pin_inv', 'rf', 'i_f'],
              params: ex(2),
              layer: L1,
            },
            {
              title: 'Step 4 · 计算闭环增益 Aᵥ 与输出电压 vₒ',
              mini_svg: MINI_STEP4,
              question: '现在已知 50 µA 的电流从 0 V 虚地出发，向右流过 Rf = 25 kΩ 到达输出端 vₒ。请用两种等价方法（增益公式或欧姆定律压降）算出 Aᵥ 与 vₒ。',
              hint: R`$v_o = 0 - i_f R_f = -(50\ \mu\text{A})(25\text{ k}\Omega) = -\dfrac{R_f}{R_1} v_i$`,
              options: [
                {
                  text: R`$A_v = 2.5$，$v_o = +1.25\text{ V}$`,
                  correct: false,
                  feedback: '检查电流方向！电流永远从高电位流向低电位。既然电流从 0 V 流向 vₒ，说明 vₒ 一定比 0 V 更低，所以必须是负电压 −1.25 V！',
                },
                {
                  text: R`$A_v = -0.4$，$v_o = -0.2\text{ V}$`,
                  correct: false,
                  feedback: '分子分母写反了：增益是 −Rf/R₁，不是 −R₁/Rf。用第二种方法验算一下：50 µA 流过 25 kΩ 的压降 i_f·Rf 远不止 0.2 V。',
                },
                {
                  text: R`$A_v = -2.5$，$v_o = -1.25\text{ V}$`,
                  correct: true,
                  feedback: '两条路殊途同归：Aᵥ = −25 kΩ/10 kΩ = −2.5，vₒ = −2.5 × 0.5 V；或 vₒ = 0 − 50 µA × 25 kΩ，都是 −1.25 V。',
                },
              ],
              board: [R`\text{Step 4 (增益与输出): } A_v = -\frac{25\text{ k}\Omega}{10\text{ k}\Omega} = -2.5,\quad v_o = -1.25\text{ V}`],
              halo: ['rf', 'vo_out'],
              params: ex(3),
              layer: L1,
            },
            {
              title: 'Step 5 · 输出节点 KCL：求运放输出电流 iₒ',
              mini_svg: MINI_STEP5,
              question:
                '最后一步也是最容易考砸的一步：当输出端空载时，定义运放输出电流 iₒ 的参考方向为“从运放输出端向右流出”。请对输出节点列 KCL，求出 iₒ 的大小与正负号，并说明电流实际流向。',
              hint: R`$\text{输出节点 KCL（空载）: } i_o + i_f = 0 \implies i_o = -i_f$`,
              options: [
                {
                  text: R`$i_o = +50\ \mu\text{A}$：运放向右输出 $50\ \mu\text{A}$，推动电流流过 $R_f$`,
                  correct: false,
                  feedback:
                    '方向想反了。i_f 是从节点 1 经 Rf 流进输出节点的，输出节点右侧又是空载开路，KCL：iₒ + i_f = 0，iₒ 只能等于 −i_f。若运放再向外推出 50 µA，输出节点就有 100 µA 流入却无处可去。',
                },
                {
                  text: R`$i_o = -50\ \mu\text{A}$；负号表示运放实际是在吸收（灌入）$50\ \mu\text{A}$ 电流进入其输出端`,
                  correct: true,
                  feedback: '满分通关！Rf 送下来的 50 µA 只能灌进运放输出端，再经芯片内部的负电源轨 V⁻ 回到地：iₒ = −50 µA。',
                },
                {
                  text: R`$i_o = 0$：输出端空载，所以运放不输出电流`,
                  correct: false,
                  feedback:
                    '错！虽然右侧没有接负载，但上方反馈电阻 Rf 源源不断地送下来 50 µA 电流。根据 KCL，这 50 µA 必须全部灌进运放输出端（再经内部负电源轨回地），所以 iₒ = −50 µA 绝不是 0！',
                },
              ],
              board: [R`\text{Step 5 (运放输出电流): } i_o = -i_f = -50\ \mu\text{A}\ (\text{运放灌电流 } 50\ \mu\text{A})`],
              halo: ['io', 'vo_out'],
              params: ex(4),
              layer: L1,
            },
          ],
          conclusion: R`五步通关：$v_- = 0\text{ V}$（虚地）→ $i_1 = i_f = 50\ \mu\text{A}$ → $A_v = -2.5$、$v_o = -1.25\text{ V}$ → 空载 $i_o = -50\ \mu\text{A}$（运放灌电流）。左侧 01 原理图的读数已全部揭晓；下面的通关复盘把这道题的板书完整写一遍，并做带载拓展。`,
        },
        { kind: 'p', text: '**通关复盘 · Example 5.3 三段式板书（③ 代入数值逐步化简）**' },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（Python 精确验算）',
          steps: [
            {
              label: '1. **闭环增益与输出电压**：',
              tex: R`\begin{gathered} A_v = -\frac{25\text{ k}\Omega}{10\text{ k}\Omega} = -2.5 \\ v_o = (-2.5) \times 0.5\text{ V} = -1.25\text{ V} \end{gathered}`,
            },
            {
              label: '2. **输入支路电流与反馈支路电流**：',
              tex: R`i_1 = \frac{0.5\text{ V}}{10\text{ k}\Omega} = 0.05\text{ mA} = 50\ \mu\text{A}, \qquad i_f = i_1 = 50\ \mu\text{A}`,
            },
            { label: '交叉验算', text: R`（交叉验算：$i_f = \frac{0 - (-1.25\text{ V})}{25\text{ k}\Omega} = 0.05\text{ mA} = 50\ \mu\text{A}$，完全吻合！）` },
            {
              label: R`3. **运放输出电流 $i_o$** · **空载情况**：`,
              text: R`$i_o = -i_f = -50\ \mu\text{A}$。负号说明电流实际上是**灌入（Sink）运放输出引脚**，最终经芯片内部负电源轨 $V^-$ 回到地线！`,
            },
            {
              label: R`**拓展带载情况（若接 $R_L = 5\text{ k}\Omega$ 到地）**：`,
              tex: R`\begin{gathered} i_L = \frac{v_o}{R_L} = \frac{-1.25\text{ V}}{5\text{ k}\Omega} = -0.25\text{ mA} = -250\ \mu\text{A} \\ i_o = i_L - i_f = (-250\ \mu\text{A}) - 50\ \mu\text{A} = -300\ \mu\text{A} \end{gathered}`,
            },
            { label: '物理意义', text: R`此时运放同时“吸走”来自 $R_f$ 的 $50\ \mu\text{A}$ 和来自地线经 $R_L$ 倒流的 $250\ \mu\text{A}$，总计灌电流 $300\ \mu\text{A}$。` },
          ],
        },
        { kind: 'p', text: '**4.2 经典例题 Example 5.4：电流-电压转换器（跨阻放大器 TIA）视角**' },
        {
          kind: 'p',
          text: R`Sadiku 在 Section 5.4 紧接着给出了一个极其漂亮的工程变形（**Example 5.4** 视角）：如果我们把反相放大器左侧的“电压源 $v_i$ + 输入电阻 $R_1$”拆掉，直接把一个**电流源 $i_s$**（现实中最典型的就是光纤通信或心率血氧仪里的**光电二极管 Photodiode**）接入反相端，会发生什么？`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`同相端接地 $v_+ = 0 \implies v_- = 0$（虚地）；虚断 $i_- = 0$；节点 1 KCL：$i_s = i_f$。`,
        },
        { kind: 'formula', title: '② 纯符号通式', tex: R`i_s = \frac{0 - v_o}{R_f} \implies v_o = -R_f i_s` },
        { kind: 'p', text: R`定义**跨阻增益（Transresistance Gain）** $R_m \triangleq \frac{v_o}{i_s} = -R_f$（量纲为 $\Omega$ 或 $\text{V/mA}$）。` },
        {
          kind: 'calc',
          title: '③ 代入数值化简',
          steps: [
            {
              label: '代入',
              text: R`设光电二极管光电流 $i_s = 200\ \mu\text{A} = 0.20\text{ mA}$，反馈电阻 $R_f = 20\text{ k}\Omega$，则：`,
              tex: R`v_o = -(20\text{ k}\Omega) \times (0.20\text{ mA}) = -4.00\text{ V}`,
            },
          ],
        },
        {
          kind: 'p',
          text: R`不仅线性地把微弱电流转换成了易于 ADC 采样的伏特级电压，而且由于反相端是 $0\text{ V}$ 虚地，光电二极管两端压降恒定为 $0\text{ V}$，消除了结电容充放电带来的非线性！`,
        },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '4.3 本幕内联 2D 原理图：Example 5.3 与 Example 5.4 双电路对照图',
    },
    /* ---------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: R`电源轨与防削波铁律——为什么必须用 $\pm 9\text{ V}$ 双电源？`,
      sync: { layer: L2, halo: ['lin_window', 'single_curve'], params: lab({ overlay: true }) },
      blocks: [
        { kind: 'p', text: '**5.1 核心必讲：反相放大器的负电压宿命与 LM358 真实输出摆幅**' },
        { kind: 'p', text: '同学们，这是从“纸上谈兵”跨越到“面包板真枪实弹”最致命的一道关卡！' },
        {
          kind: 'p',
          text: R`观察公式 $v_o = -\frac{R_f}{R_1} v_i$：**只要你输入一个正电压（$+v_i > 0$），运放就必须输出一个负电压（$-v_o < 0$）**。然而，运放不是永动机，它输出端的电位永远无法突破自身供电轨 $[V^-, V^+]$ 的天花板与地板。`,
        },
        {
          kind: 'p',
          text: R`以本课 3D 面包板使用的经典芯片 **LM358** 为例，当我们采用 **[[supply|$\pm 9\text{ V}$ 双电源]]**供电（[[rail_p|$V^+ = +9.0\text{ V}$]]，[[rail_n|$V^- = -9.0\text{ V}$]]）时，其真实输出摆幅并不是对称的 $\pm 9.0\text{ V}$，而是：`,
        },
        {
          kind: 'ul',
          items: [
            R`**[[sat_neg|负向极限]]**：$V_{o,\min} \approx V^- = -9.0\text{ V}$（LM358 输出级具备贴近负轨的下摆能力）`,
            R`**[[sat_pos|正向极限]]**：$V_{o,\max} \approx V^+ - 1.5\text{ V} = +7.5\text{ V}$（受内部达林顿上拉管约 $1.5\text{ V}$ 饱和压降限制）`,
          ],
        },
        { kind: 'p', text: '**5.2 三段式推导：线性输入窗口与饱和临界点**' },
        { kind: 'p', text: R`对面包板实测电路（$R_1 = 10\text{ k}\Omega, R_f = 22\text{ k}\Omega, A_v = -2.20$）：` },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`线性工作前提为 $V_{o,\min} \le v_o \le V_{o,\max}$，即 $V_{o,\min} \le -\frac{R_f}{R_1} v_i \le V_{o,\max}$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：注意两边同除以负数 $-\frac{R_f}{R_1}$ 时不等号方向翻转：`,
          tex: R`-\frac{R_1}{R_f} V_{o,\max} \le v_i \le -\frac{R_1}{R_f} V_{o,\min}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`正输入饱和临界点（输出撞上负轨 $-9.0\text{ V}$）：`,
              tex: R`v_{i,\max+} = -\frac{10\text{ k}\Omega}{22\text{ k}\Omega} \times (-9.0\text{ V}) = +4.0909\text{ V} \approx +4.09\text{ V}`,
            },
            {
              label: R`负输入饱和临界点（输出撞上正轨 $+7.5\text{ V}$）：`,
              tex: R`v_{i,\min-} = -\frac{10\text{ k}\Omega}{22\text{ k}\Omega} \times (+7.5\text{ V}) = -3.4091\text{ V} \approx -3.41\text{ V}`,
            },
            {
              label: '**结论**',
              text: R`本电路在 $\pm 9\text{ V}$ LM358 下的不失真[[lin_window|线性输入窗口]]为 **$-3.41\text{ V} \le v_i \le +4.09\text{ V}$**。`,
            },
          ],
        },
        { kind: 'p', text: R`**5.3 红牌警示：若误用单 $+9\text{ V}$ 供电会发生什么？**` },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**严重警告（面包板第一号惨案）**：如果你图省事只接一路 $+9\text{ V}$ 电源（[[rail_n|Pin 4 接 GND]]：$V^+ = +9\text{ V}$，$V^- = 0\text{ V}$），然后照着课本给反相放大器输入 $v_i = +1.0\text{ V}$——理论要求输出 $-2.2\text{ V}$，但芯片最低只能吐出 $0\text{ V}$！结果：**1.** **[[single_curve|输出彻底死锁在 $0\text{ V}$ 削波]]**（实测约 $+5\sim 20\text{ mV}$）；**2.** **负反馈失效、[[node1|虚地当场崩溃]]**：既然 $v_o$ 降不下去，反相端电位 $v_-$ 会被 $v_i$ 通过 $R_1$ 与 $R_f$ 的电阻分压硬生生拉高到 $v_- = v_i \cdot \frac{R_f}{R_1 + R_f} = 1.0 \times \frac{22}{32} \approx +0.69\text{ V} \neq 0\text{ V}$！`,
        },
        { kind: 'p', text: '**工程拓展：单电源系统怎么搭反相放大器？**' },
        {
          kind: 'p',
          text: R`在只有单节电池（如 $+9\text{ V}$ 或 $+5\text{ V}$）的便携设备中，工程师会把同相端（$+$）接到一个由电阻分压生成的 **$V_{CC}/2$ 虚地偏置点**（例如 $+4.5\text{ V}$），并在输入输出端加隔直电容（交流耦合），让输出信号以 $+4.5\text{ V}$ 为中心上下摆动，从而在单电源下实现无削波交流放大。但在本课直流+交流通用的 3D 面包板实测中，我们**严格采用 $\pm 9\text{ V}$ 双电源供电**，让“真地”与“虚地”都落在直观的 $0\text{ V}$！`,
        },
      ],
      inline_svg: SVG_ACT5,
      figure_caption: '5.4 本幕内联 2D 原理图：传输特性曲线与单/双电源削波对比图',
    },
    /* ---------------------------------------------------------------- act 6 (sheet 6.1: wiring) */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: R`3D LM358 $\pm 9\text{ V}$ 双电源面包板实测指南与排障清单`,
      sync: { layer: L3, halo: ['supply', 'rail_p', 'rail_n', 'gnd'], params: lab({ cam: 'bench', probe: 'p1' }) },
      blocks: [
        { kind: 'p', text: `**6.1 面包板接线步骤（LM358 DIP-8 + ${SUPPLY_NAME}）**` },
        { kind: 'p', text: R`在左侧舞台切换至 **${code('03 3D LM358 ±9V 双电源面包板实测')}**，按以下 5 步完成安全搭接：` },
        {
          kind: 'ol',
          items: [
            R`**构造 $\pm 9\text{ V}$ 双电源轨**：将[[supply|台式可调直流电源（±9 V）]]的两路输出串联——CH1 的负极（$-$）与 CH2 的正极（$+$）短接作公共端 COM，定义为 **[[gnd|$0\text{ V}$ 参考地（GND，黑线）]]**；CH1 的正极接顶部红轨（**[[rail_p|$+9\text{ V}$]]**），CH2 的负极接底部蓝轨（**[[rail_n|$-9\text{ V}$]]**）。`,
            R`**跨沟槽插入 [[chip_lm358|LM358（DIP-8）]]**：半圆缺口朝左，横跨面包板中央隔离槽（Pin 1–4 在下侧，Pin 5–8 在上侧）。`,
            R`**连接芯片电源与去耦电容**：[[rail_p|Pin 8 接 $+9\text{ V}$ 红轨]]，[[rail_n|Pin 4 接 $-9\text{ V}$ 蓝轨]]；在 Pin 8–GND 与 Pin 4–GND 之间各就近插一颗 [[c_dec|$0.1\ \mu\text{F}$ 陶瓷电容]]。`,
            R`**连接同相端真地**：用短跳线将 **[[pin_noninv|Pin 3（IN1+）]]直接连到 GND 黑轨**。`,
            R`**插入标准电阻网络**：**[[r1|$R_1 = 10\text{ k}\Omega$（色环：棕-黑-橙-金）]]**：左脚接[[vi_src|输入源 $v_i$]]，右脚插在 **[[pin_inv|Pin 2（IN1-）]]** 所在列；**[[rf|$R_f = 22\text{ k}\Omega$（色环：红-红-橙-金）]]**：跨接在 **Pin 2（IN1-）** 与 **[[vo_out|Pin 1（OUT1）]]** 之间。`,
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`[[safety|**面包板安全铁律**]]：**1.** 严禁将 [[rail_n|Pin 4 (V-)]] 与 [[rail_p|Pin 8 (V+)]] 反接，否则会在数秒内烧毁 LM358 芯片。**2.** 反相放大器输入正电压 ($+v_i$) 时输出必为负电压 ($-v_o$)；若误用单 $+9\text{ V}$ 供电，输出将死锁在 $0\text{ V}$ 削波并破坏虚地。**3.** 切勿用导线直接将[[pin_inv|反相端 (Pin 2)]] 短接到 GND 轨，虚地是由负反馈自动维持的 $0\text{ V}$ 电位，而非物理短接地线。`,
        },
        {
          kind: 'table',
          caption: R`[[safety|面包板安全与器件清单]]：本课阻值本来就是 $\text{k}\Omega$ 级，**无需 $1000\times$ 安全缩放**（缩放只针对原题阻值 $< 100\ \Omega$ 的电路），增益与电流都按原值实测`,
          head: ['项目', '本课面包板取值'],
          rows: [
            ['供电', `[[supply|±9 V 双电源：${SUPPLY_NAME}]]两路串联，公共端 COM 作 0 V 参考地（GND）`],
            ['运放', '[[opamp|LM358]]（DIP-8 双运放，使用通道 A：Pin 1 OUT1、Pin 2 IN1−、Pin 3 IN1+、Pin 4 V−、Pin 8 V+）'],
            ['实际输出摆幅', R`$-9.0\text{ V} \sim +7.5\text{ V}$：负摆幅可逼近 $V^-$，正摆幅受内部达林顿射极跟随器压降限制，上限约 $V^+ - 1.5\text{ V}$`],
            [
              '电阻',
              R`E12 / E24 标准 $\text{k}\Omega$ 级：[[r1|$R_1 = 10\text{ k}\Omega$]]、[[rf|$R_f = 22\text{ k}\Omega$]]（1/4 W，±1% 或 ±5%）；$R_f = 47\text{ k}\Omega$ 用于高增益削波对比实验`,
            ],
            ['去耦电容', '[[c_dec|0.1 µF 陶瓷去耦电容 × 2]]（分别跨接 Pin 8–GND 与 Pin 4–GND）'],
            [
              '支路电流与功耗',
              R`线性区 $|i_f| = |v_o| / R_f \le 9\text{ V} / 10\text{ k}\Omega = 0.9\text{ mA}$；本课 $10\text{ k}\Omega / 22\text{ k}\Omega$ 电阻功耗不到 $5\text{ mW}$，远低于 1/4 W 额定值`,
            ],
          ],
        },
        {
          kind: 'table',
          caption: '左侧 03 层的逐孔接线（830 孔面包板：a–e、f–j 同列竖通，e 与 f 之间是中央隔离槽；LM358 的 Pin 1 与 Pin 8 在第 44 列）',
          head: ['元件 / 导线', '插孔', '作用'],
          rows: [
            [
              `[[supply|${SUPPLY_NAME}]]`,
              'CH1 + → 顶部 + 轨；COM（CH1 − 与 CH2 + 相连）→ 顶部 − 轨；CH2 − → 底部 − 轨',
              '[[rail_p|+9 V]] / [[gnd|GND]] / [[rail_n|−9 V]] 三条电源轨',
            ],
            ['黑色跳线', '顶部 GND 轨第 9 列 → 底部 + 轨第 9 列', '[[gnd|底部 + 轨也作 GND]]'],
            ['[[chip_lm358|LM358（DIP-8）]]', 'Pin 1–4 = f44–f47；Pin 8–5 = e44–e47（缺口朝左）', '骑跨中央隔离槽'],
            ['红色跳线', 'a44（Pin 8）→ 顶部 + 轨', '[[rail_p|V+ = +9 V]]'],
            ['蓝色跳线', 'j47（Pin 4）→ 底部 − 轨', '[[rail_n|V− = −9 V]]'],
            ['黑色跳线', 'j46（Pin 3）→ 底部 GND 轨', '[[pin_noninv|同相端接真地]]'],
            ['[[c_dec|0.1 µF 电容 × 2]]', 'b44 – 顶部 GND 轨；i47 – 底部 GND 轨', '电源去耦'],
            ['[[r1|R₁ 10 kΩ（棕-黑-橙-金）]]', 'i38 → i45', '左脚接 vᵢ（第 38 列），右脚在 [[pin_inv|Pin 2]] 列'],
            ['[[rf|Rf 22 kΩ（红-红-橙-金）]]', 'g44（Pin 1 列）– g45（Pin 2 列），引脚弯到电阻体下方', '反馈：跨接 Pin 2 与 Pin 1'],
            ['[[vi_src|可调直流信号源 vᵢ]]', '红夹 g38；黑夹 底部 GND 轨', '输入电压 −5 V … +5 V'],
            ['[[dmm|万用表 DC V]]', '黑表笔 底部 GND 轨；红表笔 vᵢ = j38、Pin 1 = j44、Pin 2 = j45', '点测 vₒ 与虚地'],
          ],
        },
      ],
      inline_svg: SVG_ACT6,
      figure_caption: '6.4 本幕内联 2D 原理图：LM358 DIP-8 双电源面包板接线俯视图',
    },
    /* ---------------------------------------------------------------- act 7 (sheet 6.2, 6.3: measuring and troubleshooting) */
    {
      act_index: 7,
      badge: '第 6 幕 · 实测',
      title: '实测数据记录与常见故障排障',
      sync: { layer: L3, halo: ['dmm', 'node1', 'vo_out'], params: lab({ cam: 'chip', probe: 'p2' }) },
      blocks: [
        { kind: 'p', text: R`**6.2 实测数据记录与验算对照表（$R_1 = 10\text{ k}\Omega, R_f = 22\text{ k}\Omega$）**` },
        { kind: 'p', text: R`使用 3D 舞台中的[[dmm|虚拟万用表]]（黑表笔固定接 GND），依次调节 [[vi_src|$v_i$]] 并核对下表：` },
        {
          kind: 'table',
          head: [R`输入电压 $v_i$`, R`理想公式 $v_o = -2.2 v_i$`, R`$\pm 9\text{ V}$ LM358 实测 $v_o$`, R`测点 Pin 2 虚地 $v_-$`, '工作状态判定'],
          rows: [
            [R`$-4.00\text{ V}$`, R`$+8.80\text{ V}$`, R`**$+7.50\text{ V}$（削波）**`, R`$\approx -0.41\text{ V}$（失锁）`, R`正向饱和（撞上 $V^+ - 1.5\text{ V}$）`],
            [R`$-2.00\text{ V}$`, R`$+4.40\text{ V}$`, R`**$+4.40\text{ V}$**`, R`$0.00\text{ V}$（虚地成立）`, R`线性放大区（$i_1 = -200\ \mu\text{A}$）`],
            [R`$0.00\text{ V}$`, R`$0.00\text{ V}$`, R`**$0.00\text{ V}$**`, R`$0.00\text{ V}$（虚地成立）`, '静态零点'],
            [R`$+1.00\text{ V}$`, R`$-2.20\text{ V}$`, R`**$-2.20\text{ V}$**`, R`$0.00\text{ V}$（虚地成立）`, R`线性放大区（$i_1 = +100\ \mu\text{A}$）`],
            [R`$+2.00\text{ V}$`, R`$-4.40\text{ V}$`, R`**$-4.40\text{ V}$**`, R`$0.00\text{ V}$（虚地成立）`, R`线性放大区（$i_1 = +200\ \mu\text{A}$）`],
            [R`$+4.09\text{ V}$`, R`$-9.00\text{ V}$`, R`**$-9.00\text{ V}$**`, R`$0.00\text{ V}$（临界点）`, '负向饱和临界点'],
            [R`$+5.00\text{ V}$`, R`$-11.00\text{ V}$`, R`**$-9.00\text{ V}$（削波）**`, R`$\approx +0.63\text{ V}$（失锁）`, R`负向饱和（撞上 $-9.0\text{ V}$ 轨）`],
          ],
        },
        { kind: 'p', text: '**6.3 常见面包板故障快速排障表**' },
        {
          kind: 'table',
          head: ['实测异常现象', '最可能原因', '排查与修复动作'],
          rows: [
            [
              R`$v_i > 0$ 时 $v_o$ 死锁在 $0\text{ V}$，且 $v_- > 0\text{ V}$`,
              R`[[rail_n|Pin 4 误接 GND]]（变成了单 $+9\text{ V}$ 供电）`,
              R`将 Pin 4 改接至 $-9\text{ V}$ 蓝轨，确认电源两路串联的公共端 COM 接地`,
            ],
            [
              R`$v_i$ 稍有正负变化，$v_o$ 立刻在 $-9\text{ V}$ 和 $+7.5\text{ V}$ 之间跳变`,
              R`[[rf|反馈电阻 $R_f$ 虚插/开路]]（运放退化为开环比较器）`,
              R`检查 $R_f$ 两脚是否确实落在 Pin 2 与 Pin 1 同列插孔`,
            ],
            [
              R`$v_o$ 始终为 $0\text{ V}$，且不管 $v_i$ 怎么调 $v_-$ 都死死为 $0\text{ V}$`,
              R`误把 [[pin_inv|Pin 2]] 用导线直接短接到了 GND`,
              R`拆掉 Pin 2 到 GND 的错接跳线，保留 Pin 3 接地`,
            ],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 03 层的「电源模式」开关演示第一行故障（Pin 4 改接 GND），「接线」开关演示后两行（$R_f$ 虚插、Pin 2 误接 GND）。把红表笔分别点在 [[vo_out|Pin 1]] 与 [[node1|Pin 2]] 上（按钮或直接点插孔），对照上表的读数找出故障。`,
        },
      ],
      inline_svg: SVG_FAULTS,
      figure_caption: '6.3 三种常见故障在万用表上的“指纹”（vᵢ = +1 V）',
    },
    /* ---------------------------------------------------------------- act 8: the diagnostic quiz */
    {
      act_index: 8,
      badge: '诊断测验',
      title: 'W3-L3 反相放大器随堂诊断测验',
      sync: { layer: L1, halo: [], params: lab() },
      blocks: [
        {
          kind: 'p',
          text: '以下 4 道诊断题分别对准本课的四个高频陷阱：虚地本质与面包板防坑、输入电阻与前级加载效应、Example 5.3 带载输出电流、单/双电源削波故障诊断。四题全部答对即通关本课。',
        },
      ],
      inline_svg: SVG_QUIZ_ACT,
      figure_caption: '诊断测验的四个概念陷阱',
      quiz: [
        {
          id: 'w3l3_q1',
          concept: '虚地不是真地',
          review_act: 1,
          question: '某同学在面包板上搭建反相放大器（R₁ = 10 kΩ, Rf = 22 kΩ, ±9 V 供电），测得反相端 Pin 2 对地电压为 0 V。以下哪种说法是正确的？',
          options: [
            {
              key: 'A',
              text: '既然 Pin 2 已经是 0 V，可以用一根跳线直接把 Pin 2 接到 GND 轨以提高抗干扰能力',
              correct: false,
              feedback: R`虚地只是“电位等于 0 V”，物理上绝不能短接地线：Pin 2 一旦接到 GND 轨，$i_1$ 会直接泄入大地，$R_f$ 拿不到电流，负反馈回路断链，输出不再受 $v_i$ 控制——这不是提高抗干扰，而是把放大器拆了。`,
            },
            { key: 'B', text: 'Pin 2 是由负反馈维持的 0 V 虚地，未物理接地，因此输入电流 i₁ 全部流过 Rf', correct: true },
            {
              key: 'C',
              text: 'Pin 2 为 0 V 说明运放内部输入电阻为 0 Ω，输入电流全部流入运放内部',
              correct: false,
              feedback: R`说反了：运放输入电阻趋于无穷大，虚断 $i_- = 0$，电流一点也不流进运放内部。Pin 2 的 0 V 是负反馈（虚短）维持的，和“输入电阻为 0”无关；电流全部拐弯流过 $R_f$。`,
            },
            {
              key: 'D',
              text: '只要输入电压超过 5 V，Pin 2 依然会严格保持在 0 V',
              correct: false,
              feedback: R`虚地只在线性区成立。输入 $+5\text{ V}$ 时理想输出 $-11\text{ V}$ 已超出 LM358 的 $-9\text{ V}$ 负轨，输出削波、负反馈失效，Pin 2 会被 $R_1$、$R_f$ 分压拉到约 $+0.63\text{ V}$，不再是 0 V。`,
            },
          ],
          feedback_correct: R`虚地（Virtual Ground）是指在线性区负反馈作用下 $v_- = v_+ = 0\text{ V}$，但物理上绝不能短接地线；同时由虚断 $i_- = 0$，电流全部拐弯流经 $R_f$。一旦输出饱和（例如输入 $+5\text{ V}$ 触发 $-9\text{ V}$ 削波），负反馈失效，虚地也会随之崩溃。`,
          feedback_wrong: 'Pin 2 的 0 V 是谁维持的？想想虚短成立的前提，以及虚断对电流说了什么。',
          figure: SVG_Q1,
          sync: { layer: L1, halo: ['node1', 'pin_inv'], params: lab() },
        },
        {
          id: 'w3l3_q2',
          concept: '输入电阻与前级加载',
          review_act: 3,
          question:
            '一个输出内阻 Rs = 1 kΩ、开路电压 Vs = 1.0 V 的传感器，直接接入 R₁ = 1 kΩ、Rf = 10 kΩ 的反相放大器（±9 V 供电，未饱和）。该放大器的实际输出电压 vₒ 最接近多少？',
          options: [
            {
              key: 'A',
              text: R`$-10.0\text{ V}$`,
              correct: false,
              feedback: R`$-10\text{ V}$ 是忽略传感器内阻的结果 $-(10\text{ k}/1\text{ k}) \times 1.0\text{ V}$。可放大器的输入电阻只有 $R_{\text{in}} = R_1 = 1\text{ k}\Omega$，它和 $R_s = 1\text{ k}\Omega$ 分压，到达输入端的只有一半电压。（$-10\text{ V}$ 本身也超出了 ±9 V 供电的输出摆幅。）`,
            },
            {
              key: 'B',
              text: R`$-9.0\text{ V}$（负向饱和）`,
              correct: false,
              feedback: R`这是把 $-10\text{ V}$ 当成真值再按 −9 V 负轨削波。算上加载后实际 $v_i = 0.5\text{ V}$，$v_o = -10 \times 0.5 = -5\text{ V}$，远在负轨之内，放大器并没有饱和。`,
            },
            { key: 'C', text: R`$-5.0\text{ V}$`, correct: true },
            {
              key: 'D',
              text: R`$-4.55\text{ V}$`,
              correct: false,
              feedback: R`$-4.55\text{ V} \approx -5 \times 0.9091$，相当于在 $-5\text{ V}$ 上又套了一次第 3 幕表格里 $R_1 = 10\text{ k}\Omega$ 时的加载系数。本题 $R_1 = 1\text{ k}\Omega$，分压只算一次：$v_i = 1.0 \times \frac{1}{1+1} = 0.5\text{ V}$。`,
            },
          ],
          feedback_correct: R`反相放大器的输入电阻 $R_{\text{in}} = R_1 = 1\text{ k}\Omega$。由于传感器内阻 $R_s = 1\text{ k}\Omega$ 与 $R_{\text{in}}$ 串联分压，实际到达放大器输入端的电压 $v_i = 1.0\text{ V} \times 1\text{k} / (1\text{k} + 1\text{k}) = 0.5\text{ V}$；或者直接把 $R_s$ 与 $R_1$ 合并为总输入电阻 $2\text{ k}\Omega$，得 $v_o = -(10\text{k} / 2\text{k}) \times 1.0\text{ V} = -5.0\text{ V}$。这正是 $R_1$ 选得过小导致加载误差的典型案例！`,
          feedback_wrong: R`先求真正到达放大器输入端的 $v_i$：$R_s$ 与 $R_{\text{in}} = R_1$ 构成分压器。`,
          figure: SVG_Q2,
          sync: { layer: L1, halo: ['rin', 'vi_src'], params: lab() },
        },
        {
          id: 'w3l3_q3',
          concept: '带载时的输出电流 iₒ',
          review_act: 4,
          question:
            '在 Sadiku Example 5.3（R₁ = 10 kΩ, Rf = 25 kΩ, vᵢ = +0.5 V, vₒ = −1.25 V）中，如果在输出端与地之间额外接入一颗负载电阻 RL = 5 kΩ，则运放输出端需要吸收（灌入）的总电流大小为多少？',
          options: [
            {
              key: 'A',
              text: R`$50\ \mu\text{A}$`,
              correct: false,
              feedback: R`$50\ \mu\text{A}$ 只是反馈支路电流 $i_f$（也就是空载时的 $|i_o|$）。接上 $R_L$ 后，地线还要经 $R_L$ 向 $-1.25\text{ V}$ 的输出端倒流一份电流，它同样只能流进运放输出端。`,
            },
            {
              key: 'B',
              text: R`$200\ \mu\text{A}$`,
              correct: false,
              feedback: R`$200\ \mu\text{A} = 250 - 50$，是把两股电流当成了相互抵消。可 $i_f$ 从虚地经 $R_f$ 流向输出节点，负载电流也从地线经 $R_L$ 流向输出节点，两者同向汇合，必须相加。`,
            },
            {
              key: 'C',
              text: R`$250\ \mu\text{A}$`,
              correct: false,
              feedback: R`$250\ \mu\text{A}$ 只是负载支路 $1.25\text{ V} / 5\text{ k}\Omega$ 的电流，漏掉了反馈支路 $R_f$ 送来的 $50\ \mu\text{A}$。输出节点 KCL：$i_o + i_f = i_L$，两股电流都要由运放吸收。`,
            },
            { key: 'D', text: R`$300\ \mu\text{A}$`, correct: true },
          ],
          feedback_correct: R`由于虚地与负反馈不受负载影响，$v_o$ 仍为 $-1.25\text{ V}$。反馈支路流向输出端的电流 $i_f = 50\ \mu\text{A}$；地线经 $R_L = 5\text{ k}\Omega$ 倒流向输出端（$-1.25\text{ V}$）的电流大小为 $1.25\text{ V} / 5\text{ k}\Omega = 250\ \mu\text{A}$。两者在输出节点汇合后全部灌入运放输出端，总灌电流 $= 50\ \mu\text{A} + 250\ \mu\text{A} = 300\ \mu\text{A}$（即 $i_o = -300\ \mu\text{A}$）。`,
          feedback_wrong: '对输出节点列 KCL：有哪几条支路的电流流向这个节点？',
          figure: SVG_Q3,
          sync: { layer: L1, halo: ['io', 'vo_out'], params: lab({ vi: 0.5, rf: 25_000 }) },
        },
        {
          id: 'w3l3_q4',
          concept: '单/双电源削波诊断',
          review_act: 5,
          question:
            '在面包板上用 LM358 搭建反相放大器（R₁ = 10 kΩ, Rf = 22 kΩ），输入 vᵢ = +1.0 V 时，万用表测得输出端 vₒ ≈ +0.01 V（死锁在 0 V 附近），且反相端 Pin 2 电位高达 +0.69 V。最可能的故障原因是什么？',
          options: [
            {
              key: 'A',
              text: '反馈电阻 Rf 阻值过大导致热噪声超标',
              correct: false,
              feedback: R`热噪声只带来微伏级的随机起伏，不会把输出钉在 0 V，更不会把 Pin 2 抬到 $+0.69\text{ V}$；何况 $22\text{ k}\Omega$ 正在 $\text{k}\Omega$ 级黄金区内。`,
            },
            { key: 'B', text: 'Pin 4 (V−) 误接了 GND 变成了单 +9 V 供电，无法输出负电压 −2.2 V 导致削波且虚地崩溃', correct: true },
            {
              key: 'C',
              text: '输入电阻 R₁ 与反馈电阻 Rf 的位置插反了',
              correct: false,
              feedback: R`$R_1$、$R_f$ 对调后电路仍是反相放大器，只是增益变成 $-10/22 \approx -0.45$：输出约 $-0.45\text{ V}$，Pin 2 仍是 0 V 虚地。实测 Pin 2 = $+0.69\text{ V}$ 说明负反馈已经失效。`,
            },
            {
              key: 'D',
              text: '同相端 Pin 3 悬空未接地',
              correct: false,
              feedback: R`Pin 3 悬空时同相端电位不确定，输出会漂向某一轨，不会恰好停在 0 V。关键线索是 $+0.69\text{ V} = 1.0 \times \frac{22}{32}$：这正是输出卡在 0 V 时 $R_1$–$R_f$ 的无源分压，说明输出想往负走却走不下去。`,
            },
          ],
          feedback_correct: R`单 $+9\text{ V}$ 供电时 LM358 输出下限为 $0\text{ V}$，无法提供所需的 $-2.2\text{ V}$，输出死锁在 0 V 附近；此时电阻网络退化为无源分压器，$v_- = 1.0\text{ V} \times 22\text{k} / (10\text{k} + 22\text{k}) \approx +0.6875\text{ V}$（约 $+0.69\text{ V}$），与实测数据完全吻合。`,
          feedback_wrong: '输出想去哪里、却被什么挡住了？先算一算输出卡在 0 V 时 Pin 2 的分压值。',
          figure: SVG_Q4,
          sync: { layer: L3, halo: ['dmm'], params: lab({ cam: 'chip', probe: 'p1' }) },
        },
      ],
      after_quiz: [
        { kind: 'p', text: '**下节预告：W3-L4 同相放大器与电压跟随器（缓冲隔离与面包板实测）**' },
        {
          kind: 'p',
          text: R`今天的反相放大器有一个绕不开的代价：输入电阻只有 $R_{\text{in}} = R_1$，高内阻的传感器一接上就被“抽血”分压。下节课把信号换到同相端（$+$）输入，$R_1$ 与 $R_f$ 只负责反馈分压：输出与输入同相，输入端几乎不取电流；再把 $R_f$ 短路、$R_1$ 断开，就得到增益为 1 的电压跟随器——专治前级“带不动”。`,
        },
        { kind: 'figure', svg: SVG_NEXT, caption: '下节预告 W3-L4：同相放大器，信号从同相端输入' },
      ],
    },
  ],
};

export default W3_L3;
