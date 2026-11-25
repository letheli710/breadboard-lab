// W5-L8 · 串联与并联谐振（品质因数 Q、带宽与 3D 面包板扫频实操） (lesson sheet: docs/lessons/W5-L8.md).
// The professor's text of the six acts, the figures, the guided example and the self-test are
// reproduced from the sheet; [[id|…]] only links a term to the stage (the words are unchanged).
// Changes of form:
// - the opening remarks open act 1; the sheet's numbered sub-headings are bold lines; display
//   formulas sit in ① / ② / ③ cards (a lead-in sentence becomes the card title); "教授提醒",
//   "工程红灯警示", "例题背景" and "教授加餐" quotes are notes; nested lists are flattened;
// - act 6 drops "Claude 工程落地清单" from its title, the JSON ids and the 6.4 checklist for the
//   developers; its quick-reference card opens the act; a W5-L9 preview follows the self-test;
// - the guided example's steps had no options: each step has three (the right one from the sheet's
//   expected answer, one wrong one embodying the mistake its intercept corrects, one more with its
//   own intercept); step 5's intercept is the 25 V capacitor's;
// - anti-spoiler: act 3's error table row "临界判据（本课例题）" (Q = 10: 0.9512, 0.131 %) is the
//   guided step 4's answer, so it moves to right after the guided block (通关复盘); step 5's diagram
//   printed "50 V / 需 ≥ 100 V" and is redrawn (svgs.ts), the example's title "…到 50 V 过压安全核验"
//   becomes "…到高 Q 过压安全核验" (50 V is step 5's answer); the stage hides the numbers each step
//   asks for (w58g, see state.tsx) and done_params uncovers them;
// - act 4's table "\|V_L\|" (a Markdown-escaped bar, ‖ in TeX) → |V_L|.
// Added: the bench's safety / ratings table (the sheet's safety block), a note that the capacitor
// voltage of a low-Q loop peaks slightly below f0 (Q = 3.16: 3.20 Vpp at ≈ 4.91 kHz), the stage
// tips, per-option quiz feedback written from the sheet's explanations, quiz figures; the quiz's
// right answers are spread over A–D.

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import type { StageLesson, StageSync } from '../../types';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT6 } from './sheetSvgs';
import { MINI_STEP5, SVG_PROBLEM, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './svgs';

const Circuit = lazy(() => import('./Circuit'));
const Curves = lazy(() => import('./Curves'));
const Bench3D = lazy(() => import('./Bench3D'));

const R = String.raw;
/** inline code inside String.raw text */
const code = (s: string) => '`' + s + '`';

const L1 = 'resonance';
const L2 = 'qcurve';
const L3 = 'bench3d';

/** every act sets the whole stage, so scrolling back restores it (w58g: 0 = nothing hidden) */
const P = (p: Record<string, unknown> = {}): StageSync['params'] => ({
  topo: 'series',
  phasors: true,
  u: 1,
  q: 5,
  presets: [2, 5, 10],
  hp: true,
  f: 2000,
  vpp: 1,
  probe: 'vC',
  para: false,
  cam: 'bench',
  sweepLog: [],
  w58g: 0,
  ...p,
});

const W5_L8: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Circuit, [L2]: Curves, [L3]: Bench3D },
  describeTarget: (id) => genericLabel(id),
  lesson_meta: {
    lesson_id: 'W5-L8',
    world: 'World 5',
    title: '串联与并联谐振（品质因数 Q、带宽与 3D 面包板扫频实操）',
    subtitle: '从感抗与容抗精确抵消到 Q 倍过压奇观、半功率带宽与面包板扫频找谐振峰',
    lesson_type: 'D',
    lesson_type_label: 'Type D（动态频响 + 3D 面包板扫频找谐振点实操课）',
    estimated_minutes: 75,
    textbook_primary: {
      book: 'Alexander, Sadiku & Fredette, Fundamentals of Electric Circuits, 2026 Release',
      sections: ['Section 14.5 Series Resonance', 'Section 14.6 Parallel Resonance'],
    },
    textbook_supplement: 'Boylestad, Introductory Circuit Analysis, 14th Ed. · Chapter 20 Resonance（秋千共振直觉与谐振曲线尖锐度）',
    prerequisites: ['W4-L7 RLC 自然响应', 'W5-L2 复阻抗', 'W5-L7 传递函数与 -3dB 点'],
    pass_message: '随堂自测通过！串联与并联谐振、Q 值与带宽全部拿下。',
    next_lesson: 'W5-L9',
    next_lesson_title: '无源与有源滤波器（Phase 1 收官实战 + 3D 面包板扫频）',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 谐振电路',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '01 2D 串联/并联谐振电路切换图（标出 VL 与 VC 反向抵消）：切换串联 RLC（电压源）/ 并联 RLC（电流源），拖 ω/ω0 与 Q；右上是阻抗响应 |Z|/R（串联谷底、并联尖峰），右下按同一比例叠加 VL/VC（或 IL/IC）相量，谐振时二者等大反向、各为 Q 倍。',
      },
      {
        id: L2,
        label: '02 Q 值频响',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 实时 Q 值谐振频响曲线（对比 Q=2 / Q=5 / Q=10 的尖锐度与 -3dB 带宽 B）：|I(ω)/Imax| 随 ω/ω0 的精确曲线，Q 滑块 1–20；标出 0.707 半功率线、精确 ω1、ω2（实心）与高 Q 近似 ω0 ∓ B/2（空心）及其误差。',
      },
      {
        id: L3,
        label: '03 3D 扫频实操',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption:
          '03 3D 面包板串联 RLC + 信号发生器扫频找谐振峰实操：函数信号发生器（正弦 1–15 kHz，≤ 2 Vpp）驱动 100 Ω、10 mH、100 nF 串联回路，双通道示波器 CH1 看发生器输出、CH2 看最下端接地的 R 或 C；可启用电感铜损 20 Ω 与信号源 50 Ω 内阻。',
      },
    ],
    hover_map: {
      // 01 resonance: series
      s_src: { label: '正弦电压源 Vs = Vm∠0°', desc: '串联页的激励；谐振时 VR = Vs，电源只补充电阻 R 的热损耗' },
      s_r: { label: '串联电阻 R', desc: '串联回路里唯一耗能的元件：谐振时 Z(ω0) = R，I_max = Vm/R；R 越小 Q = ω0L/R 越高' },
      s_l: { label: '电感 L · Z_L = jωL', desc: '感抗 X_L = ωL 随频率升高而增大（通低频、阻高频）；谐振时 |VL| = Q·Vm，朝上 +90°' },
      s_c: { label: '电容 C · Z_C = −j/(ωC)', desc: '容抗 X_C = 1/(ωC) 随频率降低而增大（通高频、阻低频）；谐振时 |VC| = Q·Vm，朝下 −90°' },
      s_i: { label: '回路电流 I(ω)', desc: '串联回路里处处相同；ω = ω0 时达到最大 Vm/R，并与电源同相' },
      // 01 resonance: parallel
      p_src: { label: '正弦电流源 Is = Im∠0°', desc: '并联页的激励（如收音机天线感应出的微弱高频电流）' },
      p_r: { label: '并联电阻 R', desc: '谐振时 L、C 支路电纳抵消，Z(ω0) = R（阻抗最大）；R 越大 Q = R/(ω0L) = ω0RC 越高' },
      p_l: { label: '并联电感 L', desc: '电纳 −1/(ωL)；谐振时支路电流 |IL| = Q·Im，滞后端电压 90°' },
      p_c: { label: '并联电容 C', desc: '电纳 ωC；谐振时支路电流 |IC| = Q·Im，超前端电压 90°，与 IL 反相抵消' },
      p_v: { label: '并联端电压 v', desc: '谐振时冲上峰值 V_max = Im·R：收音机选台就靠这一尖峰' },
      ph_vr: { label: '相量 VR', desc: '电阻电压 = I·R，与电流同相；谐振时 VR = Vs（单位：Vm）' },
      ph_vl: { label: '相量 VL', desc: '电感电压 = jωL·I，超前电流 90°；谐振时 |VL| = Q·Vm' },
      ph_vc: { label: '相量 VC', desc: '电容电压 = I/(jωC)，滞后电流 90°；谐振时 |VC| = Q·Vm，与 VL 精确相差 180°' },
      ph_ir: { label: '相量 IR', desc: '电阻支路电流 = V/R；谐振时 IR = Is（单位：Im）' },
      ph_il: { label: '相量 IL', desc: '电感支路电流 = V/(jωL)；谐振时 |IL| = Q·Im' },
      ph_ic: { label: '相量 IC', desc: '电容支路电流 = jωC·V；谐振时 |IC| = Q·Im，与 IL 反相 180°' },
      z_curve: { label: '阻抗响应 |Z(ω)|/R', desc: '串联：√(1 + Q²(u − 1/u)²)，在 ω0 跌到谷底 R；并联：其倒数，在 ω0 冲上尖峰 R（u = ω/ω0）' },
      u_slider: { label: '归一化频率 ω/ω0', desc: 'u < 1 串联呈容性、u > 1 呈感性；“回到 ω0”一键回到谐振点' },
      q_slider: { label: '品质因数 Q', desc: '01、02 两个图层共用：Q 越高谐振峰越尖、带宽 B = ω0/Q 越窄，谐振时 L、C 上的电压（或电流）是激励的 Q 倍' },
      r_z: { label: 'Z/R（并联：Y·R）', desc: '归一化的复阻抗（复导纳）：实部 1，虚部 Q(u − 1/u)；谐振时虚部为 0' },
      r_kind: { label: '电路性质与相角', desc: '串联：低于 ω0 容性、高于 ω0 感性；并联恰好相反。谐振时纯阻性，θ = 0°' },
      // 02 Q curves
      curve_live: { label: '当前 Q 的频响曲线', desc: '|H(u)| = 1/√(1 + Q²(u − 1/u)²)，u = ω/ω0：串联的 |I/Imax|，也是并联的 |V/Vmax|' },
      curve_q2: { label: 'Q = 2 对比曲线（蓝）', desc: '平缓宽带：B = 0.5 ω0，曲线明显向左偏斜' },
      curve_q5: { label: 'Q = 5 对比曲线（绿）', desc: '中度选择性：B = 0.2 ω0' },
      curve_q10: { label: 'Q = 10 对比曲线（红）', desc: '尖峰窄带：B = 0.1 ω0，已接近对称' },
      hp_line: { label: '半功率线 0.707（−3 dB）', desc: '|I| = I_max/√2 ⇔ P = P_max/2 ⇔ |Z| = √2·R' },
      hp_pts: { label: '精确半功率频率 ω1、ω2', desc: 'u1,2 = ∓1/(2Q) + √(1/(4Q²) + 1)：几何平均严格等于 ω0' },
      hp_approx: { label: '高 Q 对称近似 ω0 ∓ B/2', desc: '空心圈；Q ≥ 10 时与精确值相差不到 0.14 %，Q = 2 时误差近 4 %' },
      bw: { label: '带宽 B = ω2 − ω1', desc: '对任意 Q 都严格等于 ω0/Q（串联 R/L，并联 1/(RC)）' },
      peak: { label: '谐振峰 ω = ω0', desc: '|I| = I_max：串联电流最大、并联电压最大' },
      // 03 bench
      bb_gen: {
        label: '函数信号发生器（正弦 1–15 kHz，≤ 2 Vpp）',
        desc: '频率旋钮对数刻度、步进 10 Hz；红夹 a10、黑夹 GND 轨。启用寄生参数后它带 50 Ω 输出内阻。本实验不需要台式可调直流电源',
      },
      bb_scope: { label: '双通道示波器', desc: 'CH1（黄）看发生器输出端，CH2（蓝）看最下端接地的 R 或 C；两通道同一 V/div，屏幕下方读 CH1/CH2 峰峰值与相位差 Δφ' },
      bb_r: { label: '100 Ω 金属膜电阻（1/4 W，±1%）', desc: '限流 / 采样电阻：v_R = i·R，与电流同相；1 Vpp 时功耗仅 1.25 mW' },
      bb_l: { label: '10 mH 工字电感', desc: '谐振时电抗 316.23 Ω；真实电感铜线约有 R_L ≈ 20 Ω 直流内阻（“启用真实寄生参数”后计入）' },
      bb_c: { label: '100 nF 聚酯/CBB 薄膜电容（无极性，50 V）', desc: '谐振时承受 Q 倍电压：1 Vpp 输入时 3.16 Vpp，远低于 50 V；严禁用有极性电解电容' },
      rail_gnd: { label: 'GND 公共地轨（顶部内侧）', desc: '信号源黑夹、CH1 与 CH2 两只地夹、最下端元件都接这里：面包板上唯一的地' },
      node_n1: { label: '节点 N1：信号源输出', desc: '第 10 列：红夹、CH1 探头尖、第一个串联元件的上端' },
      node_n2: { label: '节点 N2：中间节点（浮地）', desc: '两个串联元件之间的节点；不接地，严禁夹示波器地夹' },
      node_n3: { label: '节点 N3：CH2 测量点', desc: '最下端接地元件（v_C 模式是 C，v_R 模式是 R）的上端：CH2 探头尖' },
      ch1_probe: { label: 'CH1 探头', desc: '挂在信号源输出端 N1（e10）：理想源时就是 1 Vpp；有 50 Ω 内阻时谐振附近会被拉低' },
      ch2_probe: { label: 'CH2 探头', desc: '挂在最下端元件的上端 N3：v_C 模式看 Q 倍过压峰，v_R 模式看电流（与 CH1 同相即谐振）' },
      ch1_clip: { label: 'CH1 地夹', desc: '夹在 GND 轨（第 6 列的短跳线）' },
      ch2_clip: { label: 'CH2 地夹', desc: '同样只能夹 GND 轨：两只地夹在示波器内部共地，夹到 N2 会把元件直接短路' },
      bench_f0: { label: '频率读数与谐振锁定', desc: '理论 f0 = 1/(2π√(LC)) ≈ 5.03 kHz；旋到 f0 ± 30 Hz 时屏幕显示“谐振锁定”' },
      bench_phase: { label: '相位差 Δφ', desc: 'CH2 相对 CH1：v_R 模式谐振时 0°，v_C 模式谐振时 −90°' },
      bench_q: { label: '有效电阻 Reff 与 Q', desc: '理想：Reff = 100 Ω，Q ≈ 3.16；计入 R_L = 20 Ω 与 R_gen = 50 Ω 后 Reff = 170 Ω，Q ≈ 1.86，带宽约 2.71 kHz' },
      safety_note: { label: '安全与额定值', desc: '谐振时 |VC| = |VL| = Q·Vm；2 Vpp 上限时电容上约 6.3 Vpp、电流峰值 10 mA、电阻 5 mW，全部远低于 50 V / 1/4 W 额定' },
      sweep_rec: { label: '扫频记录', desc: '每拧一次频率记一个点（CH2 峰峰值）；“理论曲线”叠加同一模型的完整扫频曲线' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '秋千共振与串联 RLC 谐振条件（感抗与容抗的精确抵消）',
      sync: { layer: L1, halo: ['s_l', 's_c'], params: P() },
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：同学们好！前几讲我们一路打通了 ${code('W4-L7 RLC 自然响应')}、${code('W5-L2 复阻抗')} 和 ${code('W5-L7 传递函数与 -3dB 点')}。今天我们要迎来交流稳态电路中最具戏剧性、也最贴近真实射频与音频工程的现象——**谐振（Resonance）**。`,
        },
        {
          kind: 'p',
          text: R`你小时候一定荡过秋千（Boylestad Ch. 20 的经典直觉）：如果你胡乱用力乱推，秋千只会原地晃动；可只要你**踩准秋千的固有节奏**轻轻一推，哪怕每次力气很小，秋千也能越荡越高！在 RLC 电路里，电感 $L$ 与电容 $C$ 组成的储能“秋千”也有一个独一无二的固有节奏 $\omega_0$。一旦外部正弦激励的频率踩中了这个点，奇迹就会发生——**5 V 的信号源，竟然能在电容两端憋出 50 V 的高压！** 今天我们就从物理直觉、严谨三段式推导，一路讲到 3D 面包板亲手扫频抓出这个谐振峰。`,
        },
        { kind: 'p', text: '**1.1 物理直觉：为什么存在唯一“通畅频率”？**' },
        {
          kind: 'p',
          text: R`在串联 RLC 电路中，[[s_i|电流 $\mathbf{I}$]] 必须依次穿过[[s_r|电阻 $R$]]、[[s_l|电感 $L$]] 和[[s_c|电容 $C$]]。根据我们在 ${code('W5-L2')} 学过的复阻抗概念：`,
        },
        {
          kind: 'ul',
          items: [
            R`[[s_l|电感的阻抗]] $\mathbf{Z}_L = j\omega L$，频率越**高**，阻碍越强（通低频、阻高频）；`,
            R`[[s_c|电容的阻抗]] $\mathbf{Z}_C = \frac{1}{j\omega C} = -j\frac{1}{\omega C}$，频率越**低**，阻碍越强（通高频、阻低频）。`,
          ],
        },
        { kind: 'formula', title: '把它们串联在一起，总复阻抗就是：', tex: R`\mathbf{Z}(j\omega) = R + j\left(\omega L - \frac{1}{\omega C}\right) = R + j(X_L - X_C)` },
        { kind: 'p', text: '注意括号里那个迷人的**减号**！' },
        {
          kind: 'ul',
          items: [
            R`当频率偏低（$\omega < \omega_0$）时，$X_C > X_L$，总阻抗虚部为负，电路呈**容性**（电流超前电压）；`,
            R`当频率偏高（$\omega > \omega_0$）时，$X_L > X_C$，总阻抗虚部为正，电路呈**感性**（电流滞后电压）；`,
            R`唯独在**某个精确的交叉点 $\omega = \omega_0$** 上，感抗 $X_L(\omega_0)$ 与容抗 $X_C(\omega_0)$ **大小相等、符号相反，彼此彻底归零**！`,
          ],
        },
        {
          kind: 'formula',
          title: '此时，电路对外仿佛电感和电容“双双隐身”，总阻抗跌到全频段的绝对谷底：',
          tex: R`\mathbf{Z}(j\omega_0) = R \quad (\text{纯阻性，相角 } \theta = 0^\circ)`,
        },
        {
          kind: 'formula',
          title: '回路电流一举冲上最大值，且与电源电压完全同相：',
          tex: R`I_{\max} = \frac{V_m}{R}, \qquad \omega_0 = \frac{1}{\sqrt{LC}}, \qquad f_0 = \frac{1}{2\pi\sqrt{LC}}`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授提醒**：请立刻对照 ${code('W4-L7')} 的无阻尼自然频率！你会惊喜地发现，强迫正弦稳态的串联谐振角频率 $\omega_0 = \frac{1}{\sqrt{LC}}$，与零输入自然响应的固有频率**完全是同一个数**——外部推力的频率精准命中了系统天生的固有频率，这就是共振的统一之美。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`对照左侧 01 图层：拖动[[u_slider|频率 ω/ω0]]，看[[z_curve|阻抗曲线]]上的红点在 ω0 跌到谷底 $R$；[[r_kind|电路性质]]在 ω0 以下读“容性”、以上读“感性”。`,
        },
        { kind: 'p', text: R`**1.2 第 1 幕图解：串联 RLC 电路与电抗 $X_L, -X_C, X_{\text{net}}$ 抵消曲线**` },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '串联 RLC 谐振电路与电抗过零抵消曲线',
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '高 Q 过压奇观与能量交换（5 V 信号源如何憋出 50 V 高压？）',
      sync: { layer: L1, halo: ['ph_vl', 'ph_vc'], params: P({ q: 10 }) },
      blocks: [
        { kind: 'p', text: '**2.1 表面波澜不惊，内部暗流汹涌**' },
        {
          kind: 'p',
          text: R`很多同学第一次看串联谐振，会犯一个致命直觉错误：“既然谐振时 $\mathbf{V}_L + \mathbf{V}_C = 0$，那电感和电容两端的电压是不是都很小？”`,
        },
        {
          kind: 'p',
          text: R`**大错特错！** 让我们算一笔账：在谐振频率 $\omega_0$ 处，回路电流高达 $\mathbf{I}(\omega_0) = \frac{\mathbf{V}_s}{R}$（设 $\mathbf{V}_s = V_m \angle 0^\circ$）。此时三个元件各自的相量电压为：`,
        },
        {
          kind: 'formula',
          title: '谐振时三个元件的相量电压',
          tex: R`\begin{aligned} \mathbf{V}_R &= R \mathbf{I} = V_m \angle 0^\circ \\ \mathbf{V}_L &= j\omega_0 L \cdot \frac{V_m}{R} = \left(\frac{\omega_0 L}{R}\right) V_m \angle +90^\circ = Q V_m \angle +90^\circ \\ \mathbf{V}_C &= \frac{1}{j\omega_0 C} \cdot \frac{V_m}{R} = \left(\frac{1}{\omega_0 R C}\right) V_m \angle -90^\circ = Q V_m \angle -90^\circ \end{aligned}`,
        },
        { kind: 'p', text: R`这里冒出了整个谐振理论的灵魂无量纲参数——**品质因数（Quality Factor）$Q$**：` },
        { kind: 'formula', title: '串联品质因数', tex: R`Q_{\text{series}} = \frac{\omega_0 L}{R} = \frac{1}{\omega_0 R C} = \frac{1}{R}\sqrt{\frac{L}{C}}` },
        {
          kind: 'p',
          text: R`看到了吗？虽然 [[ph_vl|$\mathbf{V}_L$]]（朝上 $+90^\circ$）与 [[ph_vc|$\mathbf{V}_C$]]（朝下 $-90^\circ$）在串联回路总和里**精确相差 $180^\circ$ 互相抵消**（KVL 依然完美满足 $\mathbf{V}_R + \mathbf{V}_L + \mathbf{V}_C = \mathbf{V}_s$），但如果你拿示波器探头单独去量电容或电感两端，它们的幅值竟然被**放大了 $Q$ 倍**：`,
        },
        { kind: 'formula', title: '谐振时电感与电容各自的电压幅值', tex: R`|\mathbf{V}_L(\omega_0)| = |\mathbf{V}_C(\omega_0)| = Q V_m` },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**工程红灯警示（High-Q Overvoltage Hazard）**：在一个 $Q = 10$ 的串联谐振回路里，哪怕你只输入 $V_m = 5\text{ V}$ 的安全低压正弦源，电感与电容各自两端也会憋出高达 **$50\text{ V}$ 峰值（$100\text{ V}_{\text{pp}}$）** 的高压！如果 $Q = 50$，更是直冲 $250\text{ V}$！`,
        },
        {
          kind: 'ul',
          items: [
            R`**能量守恒没破产**：这并不是凭空造出了能量，而是电感的磁场能 $\frac{1}{2}LI^2$ 与电容的电场能 $\frac{1}{2}CV^2$ 在内部以 $\omega_0$ 的节拍高速“左手倒右手”，电源只需补充电阻 $R$ 每周期消耗掉的那一小部分热量。`,
            R`**物理本质定义**：事实上，品质因数 $Q$ 最根本的物理定义正是：`,
          ],
        },
        { kind: 'formula', title: '品质因数的能量定义', tex: R`Q = 2\pi \cdot \frac{\text{谐振时的峰值储能}}{\text{每周期耗散的能量}}` },
        {
          kind: 'p',
          text: R`损耗 $R$ 越小，系统越像一个几乎无摩擦的秋千，只需微弱推力就能把内部摆幅推到极高——这就是串联谐振的**电压放大效应**。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 01 图层已拨到 $Q = 10$：[[ph_vl|VL]] 与 [[ph_vc|VC]] 两根相量各长 10 倍，[[ph_vr|VR]] 只剩短短一截（就是 $V_s$）。拖 [[q_slider|Q 滑块]]看它们同步伸缩。`,
        },
        { kind: 'p', text: R`**2.2 第 2 幕图解：串联谐振 $V_L$ 与 $V_C$ 反向 $Q$ 倍放大相量图**` },
      ],
      inline_svg: SVG_ACT2,
      figure_caption: '串联谐振高 Q 过压相量图：VL 与 VC 反向 180° 抵消，幅值高达 Q 倍 Vm',
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '品质因数 Q、半功率频率与带宽 B（选择性与通频带的黄金权衡）',
      sync: { layer: L2, halo: ['hp_line', 'bw'], params: P() },
      blocks: [
        { kind: 'p', text: R`**3.1 核心权衡：$Q$ 越高，峰越尖，带宽 $B$ 越窄**` },
        {
          kind: 'p',
          text: R`在 ${code('W5-L7')} 中我们确立了**[[hp_pts|半功率频率]]（Half-Power Frequencies，即 $-3\text{ dB}$ 点）** $\omega_1, \omega_2$ 的定义：电路吸收的有功功率跌落到谐振峰值功率一半时的两个边界频率。由于电阻功率 $P(\omega) = \frac{1}{2}|I(\omega)|^2 R$，功率减半等价于电流幅值跌落至最大值的 [[hp_line|$\frac{1}{\sqrt{2}} \approx 0.7071$]]：`,
        },
        { kind: 'formula', title: '半功率条件', tex: R`|I(\omega_{1,2})| = \frac{I_{\max}}{\sqrt{2}} = \frac{V_m}{\sqrt{2}R} \iff |\mathbf{Z}(\omega_{1,2})| = \sqrt{2}R` },
        {
          kind: 'p',
          text: '让我们用**三段式教授板书推导**（严格区分公理溯源、纯符号通式与数值代入，绝不混写）彻底打通 Sadiku Section 14.5 的经典例题！',
        },
        { kind: 'p', text: R`**3.2 三段式教授板书推导（串联 RLC：Sadiku 14.5 经典高 $Q$ 例题与低 $Q$ 误差对比）**` },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**例题背景（Sadiku 14.5 经典参数）**：一串联 RLC 电路由 $R = 2\ \Omega$、$L = 1\text{ mH}$、$C = 0.4\ \mu\text{F}$ 组成，外接正弦电压源 $v_s(t) = 5\cos(\omega t)\text{ V}$。求：（1）谐振频率 $\omega_0, f_0$；（2）品质因数 $Q$ 与带宽 $B$；（3）精确半功率频率 $\omega_1, \omega_2$ 与高 $Q$ 对称近似值及其误差；（4）谐振时电流峰值 $I_{\max}$ 与电容峰值电压 $|V_C(\omega_0)|$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. **串联复阻抗定义**（由 KVL 与元件相量 VCR 导出）：$\mathbf{Z}(j\omega) = R + j\left(\omega L - \frac{1}{\omega C}\right)$，$|\mathbf{Z}(j\omega)| = \sqrt{R^2 + \left(\omega L - \frac{1}{\omega C}\right)^2}$；2. **串联谐振公理**：令总阻抗虚部 $\operatorname{Im}\{\mathbf{Z}(j\omega_0)\} = 0$；3. **半功率（$-3\text{ dB}$）定义**：$P(\omega_{1,2}) = \frac{1}{2}P_{\max} \iff |\mathbf{Z}(j\omega_{1,2})| = \sqrt{2}R$。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式 · 1. 谐振频率通式',
          tex: R`\omega_0 L - \frac{1}{\omega_0 C} = 0 \implies \omega_0 = \frac{1}{\sqrt{LC}}, \qquad f_0 = \frac{1}{2\pi\sqrt{LC}}`,
        },
        { kind: 'formula', title: '2. 品质因数通式', tex: R`Q = \frac{\omega_0 L}{R} = \frac{1}{\omega_0 R C}` },
        {
          kind: 'formula',
          title: R`3. 精确半功率频率通式：由 $|\mathbf{Z}| = \sqrt{2}R$ 得 $\omega L - \frac{1}{\omega C} = \pm R$，整理为两道一元二次方程 $\omega^2 \mp \frac{R}{L}\omega - \frac{1}{LC} = 0$，舍去负根得：`,
          tex: R`\omega_1 = -\frac{R}{2L} + \sqrt{\left(\frac{R}{2L}\right)^2 + \frac{1}{LC}}, \qquad \omega_2 = +\frac{R}{2L} + \sqrt{\left(\frac{R}{2L}\right)^2 + \frac{1}{LC}}`,
        },
        {
          kind: 'formula',
          title: R`4. 几何平均与带宽精确恒等式（对**任意 $Q$ 值**均严格成立！）`,
          tex: R`\omega_1 \omega_2 = \left(\frac{R}{2L}\right)^2 + \frac{1}{LC} - \left(\frac{R}{2L}\right)^2 = \frac{1}{LC} = \omega_0^2 \implies \omega_0 = \sqrt{\omega_1 \omega_2}`,
        },
        { kind: 'formula', title: '', tex: R`B = \omega_2 - \omega_1 = \frac{R}{L} = \frac{\omega_0}{Q}, \qquad B_f = \frac{B}{2\pi} = \frac{f_0}{Q}` },
        {
          kind: 'formula',
          title: R`5. 高 $Q$ 对称近似公式（当 $Q \ge 10$ 时，$\left(\frac{R}{2L}\right)^2 = \left(\frac{\omega_0}{2Q}\right)^2 \ll \omega_0^2$）`,
          tex: R`\omega_{1,\text{approx}} \approx \omega_0 - \frac{B}{2}, \qquad \omega_{2,\text{approx}} \approx \omega_0 + \frac{B}{2}`,
        },
        { kind: 'formula', title: '6. 谐振电流与电容电压峰值通式', tex: R`I_{\max} = \frac{V_m}{R}, \qquad |V_C(\omega_0)| = |V_L(\omega_0)| = Q V_m` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（Python 精确验算）',
          steps: [
            { label: R`已知 $R = 2\ \Omega$，$L = 1 \times 10^{-3}\text{ H}$，$C = 0.4 \times 10^{-6}\text{ F}$，$V_m = 5\text{ V}$：` },
            {
              label: '1. 谐振频率',
              tex: R`\omega_0 = \frac{1}{\sqrt{(1 \times 10^{-3})(0.4 \times 10^{-6})}} = \frac{1}{\sqrt{4 \times 10^{-10}}} = 50{,}000\text{ rad/s} = 50\text{ krad/s}`,
            },
            { label: '', tex: R`f_0 = \frac{50{,}000}{2\pi} \approx 7{,}957.75\text{ Hz} \approx 7.96\text{ kHz}` },
            { label: '2. 品质因数与带宽', tex: R`Q = \frac{\omega_0 L}{R} = \frac{50{,}000 \times 10^{-3}}{2} = 25` },
            { label: '', tex: R`B = \frac{\omega_0}{Q} = \frac{50{,}000}{25} = 2{,}000\text{ rad/s} \quad \left(B_f = \frac{2{,}000}{2\pi} \approx 318.31\text{ Hz}\right)` },
            {
              label: R`3. 精确半功率频率 vs 高 $Q$ 近似对比`,
              text: R`令 $\alpha = \frac{R}{2L} = \frac{2}{2 \times 10^{-3}} = 1{,}000\text{ rad/s}$：`,
              tex: R`\sqrt{\alpha^2 + \omega_0^2} = \sqrt{1{,}000^2 + 50{,}000^2} = \sqrt{2.501 \times 10^9} \approx 50{,}009.999\text{ rad/s}`,
            },
            { label: '', tex: R`\omega_1 = -1{,}000 + 50{,}009.999 = 49{,}009.999\text{ rad/s}, \qquad \omega_2 = +1{,}000 + 50{,}009.999 = 51{,}009.999\text{ rad/s}` },
            { label: '验算几何平均', text: R`$\sqrt{49{,}009.999 \times 51{,}009.999} = 50{,}000.000\text{ rad/s} = \omega_0$（严格吻合！）。` },
            {
              label: R`高 $Q$ 对称近似（因 $Q = 25 \ge 10$）`,
              tex: R`\omega_{1,\text{approx}} = 50{,}000 - 1{,}000 = 49{,}000\text{ rad/s}, \qquad \omega_{2,\text{approx}} = 50{,}000 + 1{,}000 = 51{,}000\text{ rad/s}`,
            },
            { label: '相对误差', text: R`仅 **$0.020\%$**！完全满足工程精度要求。` },
            { label: '4. 谐振电流与惊人的电容过压', tex: R`I_{\max} = \frac{5}{2} = 2.5\text{ A}, \qquad |V_C(\omega_0)| = |V_L(\omega_0)| = 25 \times 5 = 125\text{ V}` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授加餐：什么时候不能偷懒用高 $Q$ 对称近似？** 下表由 Python 精确计算了不同 $Q$ 值下的误差。一旦 $Q < 10$（例如 $Q=2$ 或面包板实操的 $Q=3.16$），谐振曲线向左显著偏斜，对称近似的误差会立刻飙升到 $1\%\sim 4\%$，此时**必须使用精确二次方程根公式**！`,
        },
        {
          kind: 'table',
          caption: '（$Q = 10$ 的“临界判据（本课例题）”一行，留到第 6 幕引导例题之后的通关复盘）',
          head: ['场景对比', '$Q$ 值', R`精确 $\omega_1 / \omega_0$`, R`近似 $\omega_1 / \omega_0$`, R`$\omega_1$ 相对误差`, '结论'],
          rows: [
            [R`Sadiku 14.5 高 $Q$ 例题`, '$25.0$', '$0.9802$', '$0.9800$', R`$0.020\%$`, R`高 $Q$ 对称近似极准`],
            ['3D 面包板实操参数', '$3.16$', '$0.8543$', '$0.8419$', R`$1.454\%$`, '明显非对称，须用精确式'],
            [R`低 $Q$ 宽带回路`, '$2.0$', '$0.7808$', '$0.7500$', R`$3.942\%$`, '严禁对称近似！'],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 02 图层就是下图的“活”版本：拖 [[q_slider|Q 滑块]]，[[hp_pts|实心圈]]是精确 $\omega_1, \omega_2$，[[hp_approx|空心圈]]是对称近似 $\omega_0 \mp B/2$；Q 越低两者错得越开，而 [[bw|带宽]]始终是 $\omega_0/Q$。`,
        },
        { kind: 'p', text: R`**3.3 第 3 幕图解：Python 精确逐点绘制的不同 $Q$ 值谐振频响对比曲线**` },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '不同 Q 值（Q = 2、Q = 5、Q = 10）归一化谐振频响曲线与 0.707 半功率带宽对比图',
    },
    /* ---------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '并联 RLC 谐振与串并联对偶宇宙（收音机调谐选台原理）',
      sync: { layer: L1, halo: ['ph_il', 'ph_ic', 'z_curve'], params: P({ topo: 'parallel' }) },
      blocks: [
        { kind: 'p', text: '**4.1 对偶思维：把串联里的“阻抗、电压、电流”全盘镜像！**' },
        {
          kind: 'p',
          text: R`现在把 [[p_r|$R$]]、[[p_l|$L$]]、[[p_c|$C$]] 改接为**并联**，由[[p_src|电流源 $\mathbf{I}_s$]] 激励（比如收音机天线感应出的微弱高频电流）。此时用**复导纳（Admittance）** $\mathbf{Y}(j\omega) = \frac{1}{\mathbf{Z}(j\omega)}$ 来分析简直如丝般顺滑：`,
        },
        { kind: 'formula', title: '并联复导纳', tex: R`\mathbf{Y}(j\omega) = \frac{1}{R} + j\left(\omega C - \frac{1}{\omega L}\right)` },
        { kind: 'p', text: R`当导纳虚部（总电纳）精确抵消时，即 $\omega_0 C = \frac{1}{\omega_0 L}$：` },
        {
          kind: 'ul',
          items: [
            R`**谐振频率完全相同**：$\omega_0 = \frac{1}{\sqrt{LC}}$；`,
            R`**总导纳最小、总阻抗最大**：$\mathbf{Y}(\omega_0) = \frac{1}{R} \implies \mathbf{Z}(\omega_0) = R$（串联是阻抗谷底，并联是[[z_curve|阻抗尖峰]]！）；`,
            R`**[[p_v|端电压]]冲上峰值**：$V_{\max} = I_m R$（这就是老式 AM/FM 收音机选台的秘诀——旋转可变电容 $C$ 改变 $\omega_0$，只有目标电台频率能激发最大谐振电压，其余干扰电台全被低阻抗“旁路短接”掉了！）；`,
            R`**内部 $Q$ 倍环流奇观**：虽然外部电流源只送进来 $I_m$，但在电感与电容支路之间却奔腾着 $Q$ 倍大小、反相 $180^\circ$ 互相抵消的循环大电流：`,
          ],
        },
        { kind: 'formula', title: '谐振时 L、C 支路的环流', tex: R`|\mathbf{I}_L(\omega_0)| = |\mathbf{I}_C(\omega_0)| = Q I_m, \qquad \mathbf{I}_L + \mathbf{I}_C = 0` },
        { kind: 'p', text: '**4.2 串联 vs 并联 RLC 谐振对偶速查表**' },
        {
          kind: 'table',
          head: ['核心物理量', '串联 RLC 谐振（Sadiku 14.5）', '并联 RLC 谐振（Sadiku 14.6）', '对偶记忆口诀'],
          rows: [
            [R`谐振角频率 $\omega_0$`, R`$\dfrac{1}{\sqrt{LC}}$`, R`$\dfrac{1}{\sqrt{LC}}$`, '频率公式完全一致'],
            [R`谐振时阻抗 $\mathbf{Z}(\omega_0)$`, '**最小值** $R$（纯阻性）', '**最大值** $R$（纯阻性）', '串最小（通流）、并最大（保压）'],
            ['品质因数 $Q$', R`$\dfrac{\omega_0 L}{R} = \dfrac{1}{\omega_0 R C}$`, R`$\dfrac{R}{\omega_0 L} = \omega_0 R C$`, '串联 $R$ 越小 $Q$ 越高；并联 $R$ 越大 $Q$ 越高'],
            [R`带宽 $B = \omega_2 - \omega_1$`, R`$\dfrac{\omega_0}{Q} = \dfrac{R}{L}$`, R`$\dfrac{\omega_0}{Q} = \dfrac{1}{RC}$`, R`永远满足 $B = \omega_0 / Q$`],
            ['半功率几何平均', R`$\omega_0 = \sqrt{\omega_1 \omega_2}$`, R`$\omega_0 = \sqrt{\omega_1 \omega_2}$`, '严格成立（无论 $Q$ 大小）'],
            ['谐振内部放大效应', R`**电压放大**：$|V_L|=|V_C| = Q V_m$`, R`**电流放大**：$|I_L|=|I_C| = Q I_m$`, '串联防电容过压，并联防电感过流'],
          ],
        },
        { kind: 'p', text: '**4.3 三段式教授板书推导（并联 RLC：Sadiku 14.6 经典调谐回路例题）**' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**例题背景**：一台选频接收机前端采用并联 RLC 谐振回路，已知 $R = 1\text{ k}\Omega$、$L = 4\text{ mH}$、$C = 0.1\ \mu\text{F}$，等效天线输入电流源 $i_s(t) = 10\cos(\omega t)\text{ mA}$。求：（1）$\omega_0$ 与 $f_0$；（2）品质因数 $Q$ 与带宽 $B$；（3）精确半功率频率 $\omega_1, \omega_2$ 与对称近似误差；（4）谐振时端口峰值电压 $V_{\max}$ 与电感/电容支路环流幅值 $|I_L|, |I_C|$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. **并联复导纳定义**（由 KCL 与元件相量 VCR 导出）：$\mathbf{Y}(j\omega) = \frac{1}{R} + j\left(\omega C - \frac{1}{\omega L}\right)$，$|\mathbf{Y}(j\omega)| = \sqrt{\frac{1}{R^2} + \left(\omega C - \frac{1}{\omega L}\right)^2}$；2. **并联谐振公理**：令总电纳 $\operatorname{Im}\{\mathbf{Y}(j\omega_0)\} = 0$；3. **半功率（$-3\text{ dB}$）定义**：$|V(\omega_{1,2})| = \frac{V_{\max}}{\sqrt{2}} \iff |\mathbf{Y}(j\omega_{1,2})| = \frac{\sqrt{2}}{R}$。`,
        },
        { kind: 'formula', title: '② 纯符号通式 · 1. 谐振频率与品质因数', tex: R`\omega_0 = \frac{1}{\sqrt{LC}}, \qquad Q = \frac{R}{\omega_0 L} = \omega_0 R C` },
        {
          kind: 'formula',
          title: R`2. 精确半功率频率与带宽：由 $\omega C - \frac{1}{\omega L} = \pm \frac{1}{R}$ 得：`,
          tex: R`\omega_1 = -\frac{1}{2RC} + \sqrt{\left(\frac{1}{2RC}\right)^2 + \frac{1}{LC}}, \qquad \omega_2 = +\frac{1}{2RC} + \sqrt{\left(\frac{1}{2RC}\right)^2 + \frac{1}{LC}}`,
        },
        { kind: 'formula', title: '', tex: R`B = \omega_2 - \omega_1 = \frac{1}{RC} = \frac{\omega_0}{Q}` },
        { kind: 'formula', title: '3. 谐振端电压与支路环流', tex: R`V_{\max} = I_m R, \qquad |I_L(\omega_0)| = |I_C(\omega_0)| = Q I_m` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（Python 精确验算）',
          steps: [
            { label: R`已知 $R = 1{,}000\ \Omega$，$L = 4 \times 10^{-3}\text{ H}$，$C = 0.1 \times 10^{-6}\text{ F}$，$I_m = 10\text{ mA}$：` },
            {
              label: '1. 谐振频率',
              tex: R`\omega_0 = \frac{1}{\sqrt{(4 \times 10^{-3})(0.1 \times 10^{-6})}} = \frac{1}{\sqrt{4 \times 10^{-10}}} = 50{,}000\text{ rad/s}, \qquad f_0 = \frac{50{,}000}{2\pi} \approx 7{,}957.75\text{ Hz}`,
            },
            { label: '2. 品质因数与带宽', tex: R`Q = \omega_0 R C = (50{,}000)(1{,}000)(0.1 \times 10^{-6}) = 5` },
            { label: '', tex: R`B = \frac{\omega_0}{Q} = \frac{50{,}000}{5} = 10{,}000\text{ rad/s} \quad \left(B_f = \frac{10{,}000}{2\pi} \approx 1{,}591.55\text{ Hz}\right)` },
            {
              label: '3. 精确半功率频率 vs 对称近似对比',
              text: R`令 $\alpha = \frac{1}{2RC} = \frac{1}{2 \times 1{,}000 \times 10^{-7}} = 5{,}000\text{ rad/s}$：`,
              tex: R`\sqrt{\alpha^2 + \omega_0^2} = \sqrt{5{,}000^2 + 50{,}000^2} \approx 50{,}249.378\text{ rad/s}`,
            },
            {
              label: '',
              tex: R`\omega_1 = 45{,}249.378\text{ rad/s} \ (f_1 \approx 7.20\text{ kHz}), \qquad \omega_2 = 55{,}249.378\text{ rad/s} \ (f_2 \approx 8.79\text{ kHz})`,
            },
            {
              label: '对称近似',
              text: R`（因为 $Q = 5 < 10$，已产生可见偏差）：$\omega_{1,\text{approx}} = 45{,}000\text{ rad/s}$（误差 $0.551\%$），$\omega_{2,\text{approx}} = 55{,}000\text{ rad/s}$（误差 $0.451\%$）。`,
            },
            {
              label: '4. 端口电压峰值与内部环流',
              tex: R`V_{\max} = (10 \times 10^{-3})(1{,}000) = 10\text{ V}, \qquad |I_L(\omega_0)| = |I_C(\omega_0)| = 5 \times 10\text{ mA} = 50\text{ mA}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**收音机超高 $Q$ 选台延伸（Sadiku Example 14.9）**：若把并联电阻提高到 $R = 8\text{ k}\Omega$ 并配 $L = 0.2\text{ mH}, C = 8\ \mu\text{F}$，则 $\omega_0 = 25{,}000\text{ rad/s}$，$Q = \omega_0 R C = 1{,}600$，带宽 $B_f$ 骤缩至区区 **$2.49\text{ Hz}$**！这正是窄带选频电路从万千杂波中精准锁定单一载波电台的威力。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 01 图层切到了并联页：谐振时 [[ph_il|IL]] 与 [[ph_ic|IC]] 等大反向、各为 $Q$ 倍 $I_m$，[[ph_ir|IR]] 就是 $I_s$；[[z_curve|阻抗曲线]]从串联的谷底翻成了尖峰。`,
        },
        { kind: 'p', text: '**4.4 第 4 幕图解：串联与并联 RLC 谐振双栏对偶对比图**' },
      ],
      inline_svg: SVG_ACT4,
      figure_caption: '串联与并联 RLC 谐振对偶电路与阻抗响应对比图',
    },
    /* ---------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '3D 面包板串联 RLC 扫频找谐振峰实操（工程安全缩放与实测误差溯源）',
      sync: { layer: L3, halo: ['bb_gen', 'bb_scope'], params: P({ cam: 'bench' }) },
      blocks: [
        { kind: 'p', text: R`**5.1 为什么选 $L = 10\text{ mH}, C = 100\text{ nF}, R = 100\ \Omega$？**` },
        {
          kind: 'p',
          text: R`书本上的例题常常出现 $R = 2\ \Omega$、电流高达 $2.5\text{ A}$、电容憋出 $125\text{ V}$ 的参数——这在真实面包板上会瞬间烧焦电阻并触发信号发生器过载保护！在 Breadboard Lab 的 3D 实操舞台中，我们采用了严格缩放的**黄金安全实验室参数**：`,
        },
        {
          kind: 'ul',
          items: [
            R`**元件清单**：[[bb_l|$L = 10\text{ mH}$]]、[[bb_c|$C = 100\text{ nF}$]]（50 V 无极性薄膜电容）、[[bb_r|$R = 100\ \Omega$]]（1/4 W）；`,
            R`**理论工作点**（Python 精确验算）：`,
          ],
        },
        {
          kind: 'ul',
          items: [
            R`谐振频率：$f_0 = \frac{1}{2\pi\sqrt{10 \times 10^{-3} \times 100 \times 10^{-9}}} \approx \mathbf{5.03\text{ kHz}}$（$\omega_0 \approx 31{,}622.78\text{ rad/s}$，恰好落在普通函数发生器与音频示波器最舒适的频段！）；`,
            R`谐振电抗：$\omega_0 L = \frac{1}{\omega_0 C} \approx \mathbf{316.23\ \Omega}$；`,
            R`理论品质因数：$Q = \frac{316.23}{100} \approx \mathbf{3.16}$；`,
            R`理论带宽：$B_f = \frac{5.03\text{ kHz}}{3.16} \approx \mathbf{1.59\text{ kHz}}$（精确 $f_1 \approx 4.30\text{ kHz}$，$f_2 \approx 5.89\text{ kHz}$）；`,
          ],
        },
        {
          kind: 'ul',
          items: [
            R`**安全扫频激励**：[[bb_gen|函数信号发生器]]输出 **$1.0\text{ V}_{\text{pp}}$** 正弦波，从 $1\text{ kHz}$ 缓慢扫频至 $15\text{ kHz}$。此时最大回路电流仅 $5\text{ mA}$ 峰值，电阻耗散功率仅 $1.25\text{ mW}$，而在 $f_0 \approx 5.03\text{ kHz}$ 处，你可以在电容两端安全观测到高达 **$3.16\text{ V}_{\text{pp}}$** 的清脆过压峰——既震撼，又绝不击穿任何元件！`,
          ],
        },
        {
          kind: 'table',
          caption: '面包板安全与额定值核验（激励只用函数信号发生器，不需要台式可调直流电源；谐振时 L、C 上的电压是输入的 Q 倍）',
          head: ['项目', '取值', '核验'],
          rows: [
            [
              '[[bb_gen|激励源]]',
              R`函数信号发生器：正弦波，$1.0\text{ V}_{\text{pp}}$（$V_m = 0.5\text{ V}$，$V_{\text{rms}} \approx 0.354\text{ V}$），扫频 $1.0\text{–}15.0\text{ kHz}$；舞台上限 $2\text{ V}_{\text{pp}}$`,
              R`回路电流峰值 $V_m/R = 5\text{ mA}$（$2\text{ V}_{\text{pp}}$ 时 $10\text{ mA}$），远在发生器输出能力之内`,
            ],
            [
              '[[bb_r|电阻]]',
              R`$R = 100\ \Omega$，1/4 W 金属膜，$\pm 1\%$`,
              R`平均功耗 $\frac{1}{2}I_m^2 R = 1.25\text{ mW}$（$2\text{ V}_{\text{pp}}$ 时 $5\text{ mW}$），远低于 $250\text{ mW}$`,
            ],
            [
              '[[bb_c|电容]]',
              R`$C = 100\text{ nF}$ 聚酯 / CBB 薄膜，无极性，耐压 $\ge 50\text{ V}$`,
              R`谐振时 $|V_C| = QV_m = 1.58\text{ V}$ 峰值（$3.16\text{ V}_{\text{pp}}$；$2\text{ V}_{\text{pp}}$ 时 $3.16\text{ V}$ 峰值），远低于 $50\text{ V}$`,
            ],
            [
              '[[bb_l|电感]]',
              R`$L = 10\text{ mH}$ 工字 / 色环电感，典型直流内阻 $R_L \approx 15\text{–}30\ \Omega$`,
              R`谐振时 $|V_L| \approx QV_m$，同样约 $3.16\text{ V}_{\text{pp}}$；电流峰值 $5\text{ mA}$，远低于常见 10 mH 电感约 $50\text{–}100\text{ mA}$ 的额定电流`,
            ],
            ['理论工作点', R`$f_0 = 5.03\text{ kHz}$，$X_0 = 316.23\ \Omega$，$Q = 3.16$`, R`$B_f = 1.59\text{ kHz}$，精确 $f_1 = 4.30\text{ kHz}$、$f_2 = 5.89\text{ kHz}$`],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**安全红线**：严禁将高 $Q$（$Q \ge 10$）回路直接接入 $10\text{ V}_{\text{pp}}$ 以上大信号源：例如 $5\text{ V}$ 峰值在 $Q=10$ 电容两端将产生 $50\text{ V}$ 峰值（$100\text{ V}_{\text{pp}}$），易击穿低压电解电容或触发人体触电/仪器过载。面包板实操必须选用无极性薄膜电容（CBB/Mylar，耐压 $\ge 50\text{ V}$），禁止使用有极性电解电容承受交流反偏电压。双通道示波器测量时，CH1 与 CH2 黑色接地鳄鱼夹内部共地，必须全部接在信号源 GND 节点；若需观测非接地元件电压，请将待测元件移至最下端接地位置或使用示波器 MATH(CH1-CH2) 差分功能，严禁跨接短路元件。`,
        },
        { kind: 'p', text: '**5.2 面包板扫频实操三步法（务必防共地短路！）**' },
        { kind: 'p', text: '1. **接法排布（把被测元件放到最下端接地）**：' },
        {
          kind: 'ul',
          items: [
            R`若要测**回路电流幅值与相位**（通过 $v_R = i R$ 间接观测），按 ${code('信号源(+) → L → C → R → GND')} 串联，[[ch1_probe|CH1 探头]]接信号源正端，[[ch2_probe|CH2 探头]]接 $R$ 上端，两只黑色地夹**同接 [[rail_gnd|GND 轨道]]**。缓慢旋动频率旋钮，当 CH2 波形幅值达到最大且与 CH1 **完全同相（相位差 $\Delta\phi = 0^\circ$）** 时，频率读数即为实测 $f_0$！`,
            R`若要亲眼见证**高 $Q$ 电容过压峰**，将 $C$ 换到最下端接地（${code('信号源(+) → R → L → C → GND')}），CH2 探头接 $C$ 上端。扫频至 $f_0 \approx 5.03\text{ kHz}$ 附近，CH2 幅值将冲破输入 $1\text{ V}_{\text{pp}}$ 直达 $3.16\text{ V}_{\text{pp}}$，且[[bench_phase|相位]]滞后 CH1 恰好 **$90^\circ$**！`,
          ],
        },
        {
          kind: 'p',
          text: R`2. **寻找 $-3\text{ dB}$ 带宽 $B_f$**：在测 $v_R$ 模式下，记下谐振峰值 $V_{R,\max}$，向低频与高频微调旋钮，分别找到幅值跌落至 $0.707\,V_{R,\max}$ 时的 $f_1$ 与 $f_2$，计算实测带宽 $B_{\text{meas}} = f_2 - f_1$ 与实测品质因数 $Q_{\text{meas}} = f_0 / B_{\text{meas}}$。`,
        },
        {
          kind: 'p',
          text: R`3. **真实工程排障（为什么实测 $Q$ 比 $3.16$ 小？）**：打开 3D 舞台的“启用真实寄生参数”开关后你会发现：真实 $10\text{ mH}$ 电感铜线自带约 $R_L \approx 20\ \Omega$ 直流内阻，标准函数发生器自带 $R_{\text{gen}} = 50\ \Omega$ 输出阻抗。它们与外接 $R = 100\ \Omega$ 串联，使回路[[bench_q|有效总阻]]变为 $R_{\text{eff}} = 100 + 20 + 50 = 170\ \Omega$！于是：`,
        },
        { kind: 'formula', title: '计入寄生电阻后的实测 Q', tex: R`Q_{\text{real}} = \frac{316.23}{170} \approx 1.86 < 3.16` },
        {
          kind: 'p',
          text: R`电容峰值电压随之回落至约 $1.86\text{ V}_{\text{pp}}$，带宽变宽至约 $2.71\text{ kHz}$。**能看懂理想模型与真实寄生参数的这一差距，你就真正踏入了硬件工程师的大门！**`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**扫频时的两个小细节**：① 低 $Q$ 回路里电容电压的最大值并不恰好落在 $f_0$：$|V_C|/V_m = (Q/u)\big/\sqrt{1 + Q^2(u - 1/u)^2}$ 在 $u = \sqrt{1 - 1/(2Q^2)}$ 处最大。$Q = 3.16$ 时最大值约 $3.20\text{ V}_{\text{pp}}$、出现在约 $4.91\text{ kHz}$；正好在 $5.03\text{ kHz}$ 处才是 $3.16\text{ V}_{\text{pp}}$、相位恰好 $-90^\circ$。所以判定 $f_0$ 要看 $v_R$ 的峰值与同相（或 $v_C$ 恰好滞后 $90^\circ$），而不是 $v_C$ 的最高点。② 开启寄生参数后，[[ch1_probe|CH1]] 量的是发生器输出端：$50\ \Omega$ 内阻上的压降让谐振附近的 CH1 跌到约 $0.71\text{ V}_{\text{pp}}$；$1.86\text{ V}_{\text{pp}}$ 是相对发生器设定的 $1\text{ V}_{\text{pp}}$ 而言的。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 03 图层动手：用 [[bb_gen|f 旋钮]]（$\pm 10$、$\pm 100\text{ Hz}$ 微调）从 $1\text{ kHz}$ 往上扫，看[[sweep_rec|扫频记录]]里一点点长出谐振峰；扫到 $f_0 \pm 30\text{ Hz}$ 时屏幕亮起“谐振锁定”。再切换 CH2 到 $v_R$、勾上“寄生内阻”，对比 [[bench_q|Reff 与 Q]] 的变化。`,
        },
        { kind: 'p', text: '**5.3 第 5 幕图解：面包板串联 RLC 扫频接线与双通道示波器共地测量图**' },
      ],
      inline_svg: SVG_ACT5,
      figure_caption: '面包板串联 RLC 扫频接线与双通道示波器安全共地测量拓扑图',
    },
    /* ---------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式分步引导与诊断测验',
      sync: { layer: L1, halo: [], params: P() },
      blocks: [
        { kind: 'p', text: '**6.1 第 6 幕图解：串联与并联谐振核心公式与决策全景速查卡**' },
        { kind: 'figure', svg: SVG_ACT6, caption: '串联与并联谐振核心公式与工程决策全景速查卡' },
        { kind: 'p', text: '**6.2 苏格拉底式 5 步分步引导例题**' },
        {
          kind: 'guided',
          title: '串联 RLC 音频选频回路设计：从谐振频率到高 Q 过压安全核验',
          problem: '工程师设计了一个串联 RLC 谐振回路，参数为 R = 10 Ω，L = 2 mH，C = 0.2 μF，由正弦信号源 vs(t) = 5 cos(ωt) V 驱动。请分 5 步完成全参数求解与元件耐压安全评估。',
          problem_svg: SVG_PROBLEM,
          steps: [
            {
              title: 'Step 1 · 求解谐振角频率 ω0 与谐振频率 f0',
              mini_svg: MINI_STEP1,
              question: '在什么角频率 ω0 下，电感感抗 ωL 与电容容抗 1/(ωC) 精确抵消？请计算 ω0（rad/s）和 f0（kHz）。',
              hint: R`$\omega_0 = \frac{1}{\sqrt{LC}}, \quad LC = (2\times 10^{-3})(0.2\times 10^{-6}) = 4\times 10^{-10}\text{ s}^2, \quad f_0 = \frac{\omega_0}{2\pi}$`,
              options: [
                {
                  text: R`$\omega_0 = \dfrac{1}{\sqrt{RLC}} \approx 15{,}811\text{ rad/s}$，$f_0 \approx 2.52\text{ kHz}$`,
                  correct: false,
                  feedback:
                    '别急着把 R = 10 Ω 塞进谐振频率公式！串联谐振频率只由电感 L 和电容 C 的储能节奏决定，和电阻 R 毫无关系。同时小心单位换算：mH 是 10^-3 H，μF 是 10^-6 F。',
                },
                {
                  text: R`$\omega_0 = 50{,}000\text{ rad/s}$（50 krad/s），$f_0 \approx 7.96\text{ kHz}$`,
                  correct: true,
                  feedback: R`漂亮！$LC = 4\times 10^{-10}\text{ s}^2$，开方取倒数就是 $50{,}000\text{ rad/s}$，再除以 $2\pi$ 才是赫兹。$R$ 全程没有出场——谐振点只由两个储能元件决定。`,
                },
                {
                  text: R`$\omega_0 = 50{,}000\text{ rad/s}$，所以 $f_0 = 50\text{ kHz}$`,
                  correct: false,
                  feedback: R`角频率和频率差着一个 $2\pi$！$\omega_0$ 的单位是 rad/s，换成信号发生器上的赫兹必须 $f_0 = \omega_0/(2\pi)$。把 rad/s 直接读成 Hz，你会把旋钮拧到真实谐振点的 6 倍多，屏幕上根本找不到峰。`,
                },
              ],
              board: [R`\omega_0 = \frac{1}{\sqrt{4\times 10^{-10}}} = 50{,}000\text{ rad/s}, \qquad f_0 = \frac{50{,}000}{2\pi} \approx 7.96\text{ kHz}`],
              halo: ['s_l', 's_c'],
              params: { topo: 'series', u: 1, w58g: 1 },
              layer: L1,
            },
            {
              title: 'Step 2 · 计算品质因数 Q',
              mini_svg: MINI_STEP2,
              question: '利用刚求出的 ω0 = 50,000 rad/s，计算该串联 RLC 回路的品质因数 Q，并判断它是否属于高 Q 回路（Q ≥ 10）。',
              hint: R`$Q_{\text{series}} = \frac{\omega_0 L}{R} = \frac{1}{\omega_0 R C}$`,
              options: [
                {
                  text: R`$Q = \dfrac{R}{\omega_0 L} = 0.1$，是低 $Q$ 回路`,
                  correct: false,
                  feedback: '千万不要把串联 Q 公式和并联 Q 公式搞反！在串联电路里，电阻 R 是消耗能量的“阻力”，R 越小、Q 越高，所以 R 一定在分母上。',
                },
                {
                  text: R`$Q = \omega_0 L = 100$，远超高 $Q$ 判据`,
                  correct: false,
                  feedback: R`$\omega_0 L = 100\ \Omega$ 只是谐振时的电抗，带着欧姆的单位；品质因数是无量纲的比值，还要再除以串联电阻：$Q = \omega_0 L / R$。少了这一步，Q 和带宽都会差十倍。`,
                },
                {
                  text: R`$Q = 10$（刚好达到高 $Q$ 判据 $Q \ge 10$）`,
                  correct: true,
                  feedback: R`完全正确！$\omega_0 L = 100\ \Omega$，除以 $R = 10\ \Omega$ 得 $Q = 10$；用 $1/(\omega_0 RC) = 1/(50{,}000 \times 10 \times 0.2\times 10^{-6})$ 交叉验算也是 10。`,
                },
              ],
              board: [R`Q = \frac{(50{,}000)(2\times 10^{-3})}{10} = \frac{100}{10} = 10 \quad (\text{满足 } Q \ge 10 \text{ 高 } Q \text{ 判据})`],
              halo: ['s_r', 's_l'],
              params: { topo: 'series', u: 1, w58g: 2 },
              layer: L1,
            },
            {
              title: 'Step 3 · 计算半功率带宽 B',
              mini_svg: MINI_STEP3,
              question: '已知 ω0 = 50,000 rad/s 且 Q = 10，求该回路的角频率带宽 B（rad/s）以及对应的赫兹带宽 Bf（Hz）。',
              hint: R`$B = \frac{\omega_0}{Q} = \frac{R}{L}, \qquad B_f = \frac{B}{2\pi}$`,
              options: [
                {
                  text: R`$B = 5{,}000\text{ rad/s}$（5 krad/s），$B_f \approx 795.77\text{ Hz}$`,
                  correct: true,
                  feedback: R`对！$\omega_0/Q = 50{,}000/10 = 5{,}000\text{ rad/s}$，用串联专属公式 $R/L = 10/(2\times10^{-3})$ 交叉验算完全一致；再除以 $2\pi$ 得 $795.77\text{ Hz}$。`,
                },
                {
                  text: R`$B = Q\,\omega_0 = 500{,}000\text{ rad/s}$，$B_f \approx 79.58\text{ kHz}$`,
                  correct: false,
                  feedback: '记住谐振世界的黄金权衡：Q 越高，带宽 B 越窄！你也可以用串联专属公式 B = R/L 交叉验算，两条路必须算出完全一致的答案。',
                },
                {
                  text: R`$B = 5{,}000\text{ Hz}$（rad/s 与 Hz 在这里不必区分）`,
                  correct: false,
                  feedback: R`$B = \omega_0/Q$ 给出的是角频率带宽，单位 rad/s；在信号发生器或频谱仪上读的赫兹带宽还要再除以 $2\pi$。把 rad/s 当成 Hz，通频带就被夸大了 6 倍多，选频回路会把相邻电台一起放进来。`,
                },
              ],
              board: [R`B = \frac{50{,}000}{10} = 5{,}000\text{ rad/s}, \qquad B_f = \frac{5{,}000}{2\pi} \approx 795.77\text{ Hz}`],
              halo: ['curve_live', 'bw'],
              params: { q: 10, hp: true, w58g: 3 },
              layer: L2,
            },
            {
              title: 'Step 4 · 求解半功率频率 ω1, ω2（高 Q 近似 vs 精确值）',
              mini_svg: MINI_STEP4,
              question: '既然 Q = 10 达到高 Q 阈值，请先用对称近似公式口算出 ω1, ω2，再核对精确二次方程根，看看误差有多小。',
              hint: R`$\omega_{1,2,\text{approx}} = \omega_0 \mp \frac{B}{2}, \qquad \omega_{1,2,\text{exact}} = \mp \frac{R}{2L} + \sqrt{\left(\frac{R}{2L}\right)^2 + \omega_0^2}$`,
              options: [
                {
                  text: R`近似：$\omega_1 = 47{,}500$、$\omega_2 = 52{,}500\text{ rad/s}$；精确：$\omega_1 \approx 47{,}437.54$、$\omega_2 \approx 52{,}437.54\text{ rad/s}$（两个都略向左偏）`,
                  correct: false,
                  feedback:
                    '注意看！对称近似的中心是算术平均，而真实半功率频率满足几何平均 ω0 = √(ω1·ω2)。所以精确的 ω1 和 ω2 都会比对称近似值略微向右偏一点点（本例中同向右偏约 62.5 rad/s）。',
                },
                {
                  text: R`$Q \ge 10$ 时对称近似就是精确解：$\omega_1 = 47{,}500$、$\omega_2 = 52{,}500\text{ rad/s}$，误差为 0`,
                  correct: false,
                  feedback: R`$Q \ge 10$ 只说明对称近似“足够准”，不说明它“严格成立”。精确根 $\mp\frac{R}{2L} + \sqrt{(\frac{R}{2L})^2 + \omega_0^2}$ 里的根号比 $\omega_0$ 略大，两个半功率频率都会比近似值多出一点；严格成立的只有 $B = \omega_2 - \omega_1$ 和 $\omega_1\omega_2 = \omega_0^2$。`,
                },
                {
                  text: R`近似：$\omega_1 = 47{,}500\text{ rad/s}, \omega_2 = 52{,}500\text{ rad/s}$；精确：$\omega_1 \approx 47{,}562.46\text{ rad/s}, \omega_2 \approx 52{,}562.46\text{ rad/s}$（误差仅 $0.13\%$）`,
                  correct: true,
                  feedback: R`精彩！$\sqrt{2{,}500^2 + 50{,}000^2} \approx 50{,}062.46$，减、加 $R/(2L) = 2{,}500$ 就是两个精确根，同向右偏 $62.46\text{ rad/s}$；它们的差仍严格等于 $B = 5{,}000$，乘积严格等于 $\omega_0^2$。`,
                },
              ],
              board: [
                R`\omega_{1,\text{approx}} = 47{,}500\text{ rad/s},\ \omega_{2,\text{approx}} = 52{,}500\text{ rad/s};`,
                R`\omega_{1,\text{exact}} = 47{,}562.46\text{ rad/s},\ \omega_{2,\text{exact}} = 52{,}562.46\text{ rad/s}`,
              ],
              halo: ['hp_pts', 'hp_approx'],
              params: { q: 10, hp: true, w58g: 4 },
              layer: L2,
            },
            {
              title: 'Step 5 · 谐振电容电压 |VC(ω0)| 计算与耐压选型评估',
              mini_svg: MINI_STEP5,
              question: '激励源峰值 Vm = 5 V。求谐振时电容两端的峰值电压 |VC(ω0)|。手头只有一颗耐压 25 V 的电容，能直接焊上去吗？',
              hint: R`$|V_C(\omega_0)| = |V_L(\omega_0)| = Q V_m, \qquad V_{\text{rated}} \ge 2\,|V_C(\omega_0)|$`,
              options: [
                {
                  text: R`$|V_C(\omega_0)| = Q \cdot V_m = 50\text{ V}$；绝对不能用 25 V 电容，至少应选 100 V 耐压无极性薄膜电容`,
                  correct: true,
                  feedback: R`这才是工程师的答案！$10 \times 5\text{ V} = 50\text{ V}$ 峰值（$100\text{ V}_{\text{pp}}$），按 $V_{\text{rated}} \ge 2|V_C|$ 留足余量选 100 V，而且必须无极性。`,
                },
                {
                  text: R`$|V_C(\omega_0)| = Q V_m = 50\text{ V}$，选一颗 50 V 耐压的电解电容刚好够用`,
                  correct: false,
                  feedback: R`峰值 50 V 正好顶在额定值上，没有任何余量——工程上要求 $V_{\text{rated}} \ge 2|V_C(\omega_0)| = 100\text{ V}$。更致命的是电解电容有极性：谐振电压每半个周期都会反向加在它两端，必须用无极性薄膜电容。`,
                },
                {
                  text: R`$|V_C| = V_m = 5\text{ V}$（$V_L$ 与 $V_C$ 互相抵消，电容只分到电源电压），25 V 电容绰绰有余`,
                  correct: false,
                  feedback: '这就是工程师和纯做题家的分水岭！虽然电源只有 5 V，但谐振时电容两端憋出了整整 50 V 峰值电压（100 Vpp）。拿 25 V 电容上电轻则漏电发热，重则直接放烟花！',
                },
              ],
              board: [R`|V_C(\omega_0)| = 10 \times 5\text{ V} = 50\text{ V} \ (100\text{ V}_{\text{pp}})`, R`\implies \text{严禁选用 25 V 电容，建议选 100 V 无极性薄膜电容}`],
              halo: ['ph_vc', 'ph_vl'],
              params: { topo: 'series', q: 10, u: 1, phasors: true, w58g: 5 },
              layer: L1,
            },
          ],
          done_params: { w58g: 0 },
          conclusion: R`五步走完：$\omega_0 = 50\text{ krad/s}$（$f_0 \approx 7.96\text{ kHz}$）、$Q = 10$、$B = 5\text{ krad/s}$（$B_f \approx 795.77\text{ Hz}$）、$\omega_{1,2} \approx 47{,}562.46 / 52{,}562.46\text{ rad/s}$、谐振电容电压 $50\text{ V}$ 峰值。左侧舞台的数值已全部揭晓：01 图层里 [[ph_vc|VC]] 与 [[ph_vl|VL]] 各为 10 倍 Vm，02 图层的 [[hp_pts|ω1/ω0 = 0.9512]] 正是下面这一行。`,
        },
        {
          kind: 'table',
          caption: '通关复盘：第 3 幕误差对照表留到这里的一行——Q = 10 就是本题（$47{,}562.46 / 50{,}000 = 0.9512$）',
          head: ['场景对比', '$Q$ 值', R`精确 $\omega_1 / \omega_0$`, R`近似 $\omega_1 / \omega_0$`, R`$\omega_1$ 相对误差`, '结论'],
          rows: [['临界判据（本课例题）', '$10.0$', '$0.9512$', '$0.9500$', R`$0.131\%$`, R`$Q \ge 10$ 可放心近似`]],
        },
        { kind: 'p', text: '**6.3 诊断测验（4 题）**' },
      ],
      quiz: [
        {
          id: 'w5l8_q1',
          question: '一串联 RLC 电路在角频率 ω = ω0 处发生谐振。关于此时电路端口的总阻抗与电流特征，下列哪项描述完全正确？',
          figure: SVG_Q1,
          sync: { layer: L1, halo: ['s_r', 'z_curve'], params: P() },
          options: [
            { key: 'A', text: '总阻抗达到最小值 Z(ω0) = R 且呈纯阻性，回路电流达到峰值且与电源电压同相', correct: true },
            {
              key: 'B',
              text: '总阻抗达到最大值且呈纯阻性，回路电流达到最小值',
              correct: false,
              feedback: '这是并联谐振的特征：并联时总导纳最小、总阻抗最大。串联谐振恰好相反——感抗与容抗相互抵消，总阻抗跌到全频段最小值 R，电流冲到峰值 Vm/R。',
            },
            {
              key: 'C',
              text: '电感电压与电容电压各自均为零，因此总电压全部落在电阻上',
              correct: false,
              feedback: '经典陷阱！为零的是 VL + VC 这个和，而它们各自一点也不小：大小都是 Q·Vm，只是相位相反 180° 而互相抵消。拿示波器单独量电容，会看到 Q 倍于电源的电压。',
            },
            {
              key: 'D',
              text: '总阻抗为零，回路发生理想短路',
              correct: false,
              feedback: '抵消掉的只是虚部 XL − XC，电阻 R 一直串在回路里：Z(ω0) = R，不是 0。电流被 R 限制在 Vm/R，不会变成无穷大的短路电流。',
            },
          ],
          feedback_correct:
            '串联谐振时 ω0L = 1/(ω0C)，感抗与容抗相互抵消，总阻抗跌至最小值 R（相角 0°），电流冲至峰值 Vm/R 且与电源电压同相。注意 C 是经典陷阱：VL 与 VC 并非各自为零，而是大小均为 Q·Vm、反相 180° 之和为零。',
          feedback_wrong: '回到第 1 幕：谐振时抵消的是感抗与容抗（虚部），电阻 R 仍在回路里。',
        },
        {
          id: 'w5l8_q2',
          question: '某串联 RLC 回路谐振时品质因数 Q = 15，信号源为 vs(t) = 4 cos(ω0 t) V。此时用示波器测得电容两端的电压峰值约为多少？',
          figure: SVG_Q2,
          sync: { layer: L1, halo: ['ph_vc'], params: P() },
          options: [
            { key: 'A', text: '4 V', correct: false, feedback: '4 V 是电源峰值，也就是谐振时电阻上的电压 VR = Vs。电容和电感各自承受的是它的 Q 倍。' },
            { key: 'B', text: '0 V', correct: false, feedback: '为零的是 VL + VC 这个和，不是电容电压本身；VC 与 VL 各自都是 Q·Vm，只是反相 180°。' },
            { key: 'C', text: '60 V', correct: true },
            {
              key: 'D',
              text: '0.27 V',
              correct: false,
              feedback: '0.27 V ≈ 4/15，是把 Q 当成了衰减倍数去除。串联谐振是电压放大：|VC(ω0)| = Q·Vm，要乘以 Q 而不是除以 Q。',
            },
          ],
          feedback_correct: '串联谐振时电感与电容各自承受 Q 倍电源电压：|VC(ω0)| = |VL(ω0)| = Q·Vm = 15 × 4 V = 60 V。工程选型必须按 60 V 峰值留足耐压余量。',
          feedback_wrong: '回到第 2 幕：|VL(ω0)| = |VC(ω0)| = Q·Vm。',
        },
        {
          id: 'w5l8_q3',
          question: '在一台采用并联 RLC 调谐回路的收音机中，若保持 L、C 不变，将并联电阻 R 增大为原来的 2 倍，则该调谐回路的品质因数 Q 与带宽 B 将如何变化？',
          figure: SVG_Q3,
          sync: { layer: L1, halo: ['p_r'], params: P({ topo: 'parallel' }) },
          options: [
            {
              key: 'A',
              text: 'Q 减半，带宽 B 加倍（选台变钝）',
              correct: false,
              feedback: '这是串联电路的规律（串联 Q = ω0L/R，R 越大 Q 越低）。并联谐振里 R 是与 L、C 并联的泄放通道，R 越大泄放越少：Q = R/(ω0L) = ω0RC 与 R 成正比。',
            },
            {
              key: 'B',
              text: 'Q 和带宽 B 均保持不变',
              correct: false,
              feedback: 'ω0 = 1/√(LC) 确实不变，但 Q 与带宽都和 R 有关：并联 Q = ω0RC 随 R 线性增大，B = 1/(RC) 随之减小。',
            },
            { key: 'C', text: 'Q 加倍，带宽 B 也加倍', correct: false, feedback: 'Q 与 B 永远满足 B = ω0/Q：ω0 不变时 Q 加倍，带宽必然减半，不可能同时加倍。' },
            { key: 'D', text: 'Q 加倍，带宽 B 减半（选台更尖锐）', correct: true },
          ],
          feedback_correct:
            '并联谐振中 Q = R/(ω0L) = ω0RC，与 R 成正比！R 增大为 2 倍时，并联阻尼损耗减小，Q 加倍，从而带宽 B = ω0/Q 减半，谐振峰更尖锐、选台选择性更高（恰与串联电路相反）。',
          feedback_wrong: '回到第 4 幕的对偶速查表：并联 Q = R/(ω0L) = ω0RC，B = 1/(RC)。',
        },
        {
          id: 'w5l8_q4',
          question:
            '在面包板上搭建 L = 10 mH、C = 100 nF、R = 100 Ω 的串联 RLC 回路（理论 Q ≈ 3.16），用 1 Vpp 正弦波扫频时，发现电容峰值电压仅约 1.9 Vpp 且实测带宽明显比理论值更宽。最合理的工程解释是？',
          figure: SVG_Q4,
          sync: { layer: L3, halo: ['bb_l', 'bb_gen'], params: P({ cam: 'board' }) },
          options: [
            {
              key: 'A',
              text: '谐振频率公式 ω0 = 1/√(LC) 在 kHz 频段失效',
              correct: false,
              feedback: 'ω0 = 1/√(LC) 从音频到射频都成立；而且谐振频率本身并没有变——峰仍在 5 kHz 附近，变的只是峰高和带宽，这指向回路电阻，而不是 L、C。',
            },
            {
              key: 'B',
              text: '电感自身的铜线直流内阻 RL 与函数信号发生器的 50 Ω 输出阻抗串联进入回路，增大了有效总电阻 Reff，导致实测 Q 下降、带宽变宽',
              correct: true,
            },
            {
              key: 'C',
              text: '100 nF 薄膜电容发生了击穿短路',
              correct: false,
              feedback: '电容若击穿短路，C 两端电压会接近 0，回路也不再谐振；而实测仍有约 1.9 Vpp 的清晰谐振峰，只是更矮更宽。何况 3.16 Vpp 远低于它 50 V 的耐压。',
            },
            {
              key: 'D',
              text: '示波器探头使电感量增大了一倍',
              correct: false,
              feedback: '示波器探头是高阻（约 1 MΩ 并联十几 pF）挂在节点上，不会串进电感、更不会让 L 翻倍；L 翻倍会让 f0 降到约 3.56 kHz，而不是让峰变矮变宽。',
            },
          ],
          feedback_correct:
            '真实串联回路的有效电阻为 Reff = R + RL + Rgen。例如 100 Ω + 20 Ω + 50 Ω = 170 Ω，使实测 Q 从 3.16 降至 316.2/170 ≈ 1.86，电容峰值随之降至约 1.86 Vpp，同时带宽 B = Reff/L 相应变宽。',
          feedback_wrong: '回到第 5 幕第 3 步：Reff = R + RL + Rgen。',
        },
      ],
      after_quiz: [
        {
          kind: 'p',
          text: R`**下节预告 · W5-L9 无源与有源滤波器**：今天在电阻上取出的 $v_R$，本身就是一个中心频率 $\omega_0$、带宽 $B = \omega_0/Q$ 的带通滤波器；而电容、电感上的电压分别给出低通与高通的雏形。下一讲我们把 RC / RLC 无源滤波器和 World 3 的运放拼在一起，完成 Phase 1 收官实战，并继续在 3D 面包板上扫频验证。`,
        },
      ],
    },
  ],
};

export default W5_L8;
