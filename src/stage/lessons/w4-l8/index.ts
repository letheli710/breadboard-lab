// W4-L8 · RLC 阶跃响应与一般二阶电路通用求解流程 (lesson sheet: docs/lessons/W4-L8.md). The
// professor's text of the six acts, the figures, the guided example and the self-test are
// reproduced from the sheet; [[id|…]] only links a term to the stage (the words are unchanged).
// Changes of form:
// - the opening remarks open act 1; the sheet's numbered sub-headings are bold lines (without
//   "内联 2D <svg>：" / "内联 2D 原理图："); display formulas sit in ① / ② / ③ cards (a lead-in
//   sentence becomes the card title); the "题目设定" and "教授点睛 / 拍黑板" quotes are notes;
// - act 3's circuit figure (sheet 3.2) is the guided example's problem figure, its heading is
//   folded into 3.3; act 6 drops the sheet's JSON ids and its 6.3 checklist for the developers;
//   the World 4 closing and World 5 preview follow the self-test (after_quiz; the sheet has none);
// - the guided example (parallel RLC, I_s = 6 A) shares no problem with act 2's or act 4's worked
//   example, so no ③ card moves; its step diagrams are redrawn without their answers (svgs.ts),
//   and the stage hides the parallel numbers until the example reaches them (pReveal).
// Changes of content:
// - act 1.2's "接入 V_s = 5 V 电池" → 台式可调直流电源（5 V） (no battery as a supply); act 2's
//   "一颗 5 V 电源" → 一台;
// - act 3.2's heading "并联 RLC 临界阻尼阶跃实战电路" gave step 2's answer away: "临界阻尼" dropped;
// - guided step 2, option C read "alpha = 25 Np/s" while its intercept explains 1/(RC) = 10
//   (forgetting the ½): the option is now α = 10 Np/s, matching the intercept;
// - the bench (sheet's safety block): the peak loop current is 34.35 mA at t = 0.134 ms, not
//   52.1 mA (that is the amplitude V_s/(Lω_d) of e^{−αt} sin ω_d t, which never reaches it), so
//   the resistor peak is ≈ 66 mW, not 152 mW, and the average is C V_s² f = 5 mW in all; the
//   "500 Ω pot + 47 Ω guard" leaves at least 47 + 50 Ω (generator) + DCR ≈ 101 Ω in the loop and
//   never reaches the 56 Ω under-damped setting the lab asks for: the generator's own 50 Ω limits
//   the current, the guard resistor goes (R_total = 50 + 4 + R_pot).
// Added: the bench's safety / scaling table and wiring table, the act-1 and act-3 figures, the
// ground-clip figure, the guided example's conclusion, per-option quiz feedback written from the
// sheet's explanations, quiz figures; the quiz's right answers are spread over A–D.

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import type { StageLesson, StageSync } from '../../types';
import {
  MINI_STEP1,
  MINI_STEP2,
  MINI_STEP3,
  MINI_STEP4,
  MINI_STEP5,
  SVG_CURVES,
  SVG_DUAL,
  SVG_GENERAL,
  SVG_GROUND,
  SVG_PAR_PROBLEM,
  SVG_PCB,
  SVG_Q1,
  SVG_Q2,
  SVG_Q3,
  SVG_Q4,
  SVG_R_ROLE,
  SVG_TRAP,
  SVG_TREE,
} from './svgs';

const Schematic = lazy(() => import('./Schematic'));
const Scope = lazy(() => import('./Scope'));
const Bench3D = lazy(() => import('./Bench3D'));

const R = String.raw;
/** inline code inside String.raw text */
const code = (s: string) => '`' + s + '`';

const L1 = 'schematic';
const L2 = 'scope';
const L3 = 'bench3d';

/** every act sets the whole stage circuit, so scrolling back restores it */
const P = (p: Record<string, unknown> = {}): StageSync['params'] => ({ topo: 'series', view: '0p', r: 56, tb: 'edge', clip2: 'gnd', hide: false, ...p });
/** guided example: the parallel page, the view of the step, how far the example has got */
const GD = (view: string, reveal: number): StageSync['params'] => ({ topo: 'parallel', view, hide: false, pReveal: reveal });

const W4_L8: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Schematic, [L2]: Scope, [L3]: Bench3D },
  describeTarget: (id) => genericLabel(id),
  lesson_meta: {
    lesson_id: 'W4-L8',
    world: 'World 4',
    title: 'RLC 阶跃响应与一般二阶电路通用求解流程',
    subtitle: '从串联/并联阶跃过冲振铃到一般混合二阶网络的四步法与 PCB 走线端接',
    lesson_type: 'D',
    lesson_type_label: 'Type D（动态阶跃示波器 + 3D 面包板方波激励实操课）',
    estimated_minutes: 60,
    textbook_primary: {
      book: 'Alexander, Sadiku & Fredette, Fundamentals of Electric Circuits, 2026 Release',
      sections: ['Section 8.5 Step Response of a Series RLC Circuit', 'Section 8.6 Step Response of a Parallel RLC Circuit', 'Section 8.7 General Second-Order Circuits'],
    },
    prerequisites: ['W4-L5 一阶 RC/RL 阶跃响应', 'W4-L6 二阶电路初值与终值判定', 'W4-L7 无源串联/并联 RLC 自然响应'],
    learning_objectives: [
      R`掌握二阶阶跃完全响应的统一分解 $x(t) = x_{\text{ss}} + x_t(t)$，彻底规避“仅用暂态项代入初值”的致命错误`,
      '能用三段式推导独立求解串联与并联 RLC 阶跃响应的完整表达式，并定量计算欠阻尼超调量与峰值时间',
      '熟练运用 Section 8.7 通用四步法求解既非纯串联也非纯并联的一般混合二阶电路',
      '建立欠阻尼阶跃振铃与高速 PCB 走线过冲/串联端接电阻之间的工程映射，并在面包板示波器上实测验证',
    ],
    pass_message: '随堂自测通过！World 4 储能元件与暂态响应全章通关。',
    next_lesson: 'W5-L1',
    next_lesson_title: '正弦信号与相量',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 阶跃 RLC 原理图',
        short: '01 原理图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '01 2D 阶跃 RLC 与一般二阶电路原理图：切换串联 / 并联 / 一般混合拓扑，以及 t = 0⁻、t = 0⁺、t → ∞、源置零四种等效视图；下方四格是通用四步法的结果（初值、特征根、稳态、完全响应）。',
      },
      {
        id: L2,
        label: '02 方波阶跃示波器',
        short: '02 阶跃示波器',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 实时方波阶跃示波器：R 阻尼滑块 20–400 Ω（56 / 200 / 250 Ω 快捷挡），CH1 为 0–5 V 200 Hz 激励方波，CH2 为电容电压 v_C(t)；光标标注稳态 5.0 V、峰值时间 t_p、峰值电压与超调量。',
      },
      {
        id: L3,
        label: '03 3D 面包板实操',
        short: '03 3D 实操',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption:
          '03 3D 面包板信号源方波激励 RLC 实操：函数信号发生器经 BNC 转鳄鱼夹接入 500 Ω 电位器、10 mH 电感、1 µF 电容，双通道示波器 CH1 / CH2 探头挂接；拖 R 总电阻看屏幕上的振铃，试着把 CH2 地夹移到非 GND 节点。',
      },
    ],
    hover_map: {
      // 01 schematic: series
      s_vs: {
        label: '阶跃电压源 V_s u(t)',
        desc: '串联页：t = 0 时 0 → 5 V 的阶跃加到 R、L、C 串联回路上（面包板上由函数信号发生器的方波上升沿给出）；源置零视图里它变成一根短路线',
      },
      s_sw: { label: '开关（t = 0 闭合）', desc: 't = 0⁻ 视图里断开，其余视图里闭合' },
      s_r: { label: '串联电阻 R', desc: '与 02 示波器的 R 滑块同步：α = R/(2L)，R 越大阻尼越强；56 Ω 欠阻尼、200 Ω 临界、250 Ω 过阻尼' },
      s_l: { label: '串联电感 L = 10 mH', desc: 't = 0⁺：i_L 不能突变 → 按 0 A 电流源 = 开路；t → ∞ 直流稳态 → 短路' },
      s_c: { label: '电容 C = 1 µF · v_C(t)', desc: '串联电路的主状态变量：t = 0⁺ 时 v_C 不能突变 → 按 0 V 电压源 = 短路；t → ∞ 开路，v_C(∞) = V_s' },
      s_i: { label: '回路电流 i(t)', desc: 'i = C dv_C/dt；t = 0⁺ 与 t → ∞ 时都为 0' },
      // 01 schematic: parallel (the guided example)
      p_is: { label: '阶跃电流源 I_s = 6 u(t) A', desc: '引导例题的激励；t < 0 时为 0，源置零时电流源开路' },
      p_r: { label: '并联电阻 R = 5 Ω', desc: 'α = 1/(2RC)：R 是“旁路排水沟”，R 越大阻尼越弱' },
      p_l: { label: '并联电感 L = 2 H · i_L(t)', desc: '并联电路的主状态变量：t → ∞ 时电感短路，全部电流源电流灌入电感' },
      p_c: { label: '并联电容 C = 20 mF', desc: '并联端电压 v 就是电容电压，不能突变' },
      p_v: { label: '并联端电压 v(t)', desc: 'v = L di_L/dt；t = 0⁺ 与 t → ∞ 时都为 0' },
      // 01 schematic: general
      g_vs: { label: '直流电压源 V_s = 12 V', desc: '一般混合电路的激励；源置零时短路' },
      g_sw: { label: '开关（t = 0 闭合）', desc: 't = 0⁻ 视图里断开' },
      g_r1: { label: '串联限流电阻 R₁ = 4 Ω', desc: '与 L 串联的阻尼通道：特征方程一次项里的 R₁/L' },
      g_l: { label: '电感 L = 1 H · i_L(t)', desc: 't = 0⁺ 时开路，两端承受全部 12 V：i_L′(0⁺) = 12 A/s；t → ∞ 短路，i_L(∞) = 2 A' },
      g_a: { label: '节点 A', desc: 'KCL：i_L = v_C/R₂ + C dv_C/dt' },
      g_r2: { label: '负载电阻 R₂ = 2 Ω', desc: '与 C 并联的阻尼通道：特征方程一次项里的 1/(R₂C)' },
      g_c: { label: '滤波电容 C = 0.5 F · v_C(t)', desc: '目标变量；t → ∞ 开路，v_C(∞) = 12 × 2/(4 + 2) = 4 V' },
      v_0m: { label: 't = 0⁻ 视图', desc: '换路前：零初始储能，v_C(0⁻) = 0、i_L(0⁻) = 0' },
      v_0p: { label: 't = 0⁺ 视图', desc: '换路瞬间：电感电流、电容电压不突变；零储能时电感 = 开路、电容 = 短路' },
      v_inf: { label: 't → ∞ 视图', desc: '直流稳态：电感短路、电容开路，用纯电阻电路求 x_ss' },
      v_zero: { label: '源置零视图', desc: '独立电压源短路、独立电流源开路（受控源保留），剩下的无源网络给出特征方程' },
      step_1: { label: '① 初值锁定', desc: '求目标变量的 x(0⁺) 与 x′(0⁺)（W4-L6 的方法）' },
      step_2: { label: '② 暂态形式', desc: '独立源置零，消去另一个状态变量得特征方程，解出 s₁、s₂ 决定过阻尼 / 临界 / 欠阻尼形式' },
      step_3: { label: '③ 直流稳态', desc: 't → ∞：电感短路、电容开路，求 x_ss = x(∞)' },
      step_4: { label: '④ 合并定常数', desc: '把 x(0⁺)、x′(0⁺) 代入含 x_ss 的完全响应 x(t) = x_ss + x_t(t)，解两个常数' },
      // 02 scope
      sc_r: { label: 'R 阻尼滑块', desc: '回路总电阻 20–400 Ω；快捷挡 56 Ω（欠阻尼）、200 Ω（临界）、250 Ω（过阻尼）' },
      sc_ch1: { label: 'CH1 激励方波 v_s(t)', desc: '0–5 V、200 Hz：每 2.5 ms 一个上升沿或下降沿' },
      sc_ch2: { label: 'CH2 电容电压 v_C(t)', desc: '实时阶跃响应：红 = 欠阻尼，绿 = 临界阻尼，灰 = 过阻尼' },
      sc_final: { label: '稳态基准线 V_s = 5.0 V', desc: 't → ∞ 时电容开路，v_C(∞) = V_s：终值与 R 无关' },
      sc_peak: { label: '峰值 V_peak 与超调量', desc: 'M_p = e^(−πα/ω_d)：R = 56 Ω 时 40.0%，V_peak = 7.00 V；整周期时基下还能看到下降沿的反向下冲' },
      sc_tp: { label: '峰值时间 t_p', desc: 't_p = π/ω_d：R = 56 Ω 时 0.327 ms' },
      sc_ts: { label: '2% 稳定时间', desc: '此后 v_C 一直留在 5.0 V ± 2% 以内；临界阻尼是零过冲里最快的' },
      sc_wd: { label: 'α 与 ω_d（或实根）', desc: 'α = R/(2L)，ω_d = √(ω₀² − α²)；α ≥ ω₀ 时没有振荡，显示两个实根' },
      sc_case: { label: '阻尼状态', desc: 'α < ω₀ 欠阻尼，α = ω₀ 临界阻尼，α > ω₀ 过阻尼（ω₀ = 10000 rad/s 不随 R 变）' },
      // 03 bench
      bb_gen: { label: '函数信号发生器（0–5 V 方波 · 200 Hz）', desc: '单极性方波 0 → 5 V，输出阻抗 50 Ω，经 BNC 转鳄鱼夹接入：红夹 a10，黑夹 GND 轨。本课的激励不用直流电源' },
      bb_scope: { label: '双通道示波器', desc: 'CH1 看信号源输出端，CH2 看电容电压；2 V/div，0.25 ms/div（或 0.5 ms/div 看整个周期），触发 CH1 上升沿' },
      bb_pot: { label: '500 Ω 线性电位器', desc: '端 A（c10）到滑臂（c11）之间的电阻 R_pot；回路总电阻 = 50 Ω（信号源）+ 4 Ω（电感 DCR）+ R_pot' },
      bb_l: { label: '10 mH 电感', desc: '工字电感，DCR 约 4 Ω（< 5 Ω），额定电流 ≥ 150 mA；本课峰值电流约 34 mA' },
      bb_c: { label: '1 µF 无极性薄膜电容', desc: '耐压 ≥ 25 V；振铃峰值约 +7.0 V，下降沿反向约 −2.0 V，所以严禁极性电解电容；下端直接插在 GND 轨' },
      bb_jumper: { label: '黄色跳线 e11 → e16', desc: '把电位器滑臂（第 11 列）接到电感左脚所在的第 16 列：同一个节点 N2' },
      rail_gnd: { label: 'GND 公共地轨（顶部内侧）', desc: '信号源黑夹、电容下端、CH1 与 CH2 两只地夹都接这里：面包板上唯一的地' },
      node_n1: { label: '节点 N1：信号源输出（R 上端）', desc: '第 10 列 a–e：红夹、电位器端 A、CH1 探头尖' },
      node_n2: { label: '节点 N2：R–L 公共节点', desc: '第 11 列（滑臂）与第 16 列（电感左脚），由黄色跳线连通；是浮地节点，严禁夹地夹' },
      node_n3: { label: '节点 N3：L–C 公共节点 = v_C', desc: '第 17 列：电感右脚、电容上端、CH2 探头尖' },
      ch1_probe: { label: 'CH1 探头', desc: '探头尖挂在 N1（e10）：看信号源输出端。边沿后会被 50 Ω 内阻上的压降 50 Ω × i(t) 拉出一个小凹口' },
      ch2_probe: { label: 'CH2 探头', desc: '探头尖挂在 N3（e17）：看电容电压 v_C(t)' },
      ch1_clip: { label: 'CH1 地夹', desc: '夹在 GND 轨（第 6 列的短跳线）' },
      ch2_clip: { label: 'CH2 地夹', desc: '只能夹 GND 轨：两通道 BNC 外壳与信号源外壳都连着市电保护地 PE，夹到 N1 / N2 / N3 会把该节点直接短路' },
      bench_r: { label: '回路总电阻', desc: 'R = 50 Ω（信号源内阻）+ 4 Ω（电感 DCR）+ R_pot：最小 54 Ω，56 Ω 时电位器只需约 2 Ω' },
      safety_note: { label: '安全与缩放', desc: '函数信号发生器 0–5 V 激励，L、C、R 按原值搭建、无需缩放；峰值电流约 34 mA，电阻平均功耗合计 5 mW，远低于 1/4 W' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '从自由衰减到强迫跃迁——二阶阶跃完全响应的统一结构与“头号致命陷阱”',
      sync: { layer: L1, halo: ['s_c', 's_vs'], params: P({ view: 'inf' }) },
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎回到 Breadboard Lab！在上一讲 W4-L7 里，我们把所有电源都拔掉，静静看着储能元件里的能量在 $R, L, C$ 之间自由耗散——那是电路的**自然响应**。但在真实世界里，电路从来不是孤零零地放电：你按下电源开关、单片机 GPIO 输出从 $0\text{ V}$ 翻到 $5\text{ V}$、电机驱动器接通母线，这些全都是**突然施加直流激励的阶跃响应**。今天这一讲，我们要打通二阶瞬态分析的“最后一公里”：不仅拿下串联与并联 RLC 的阶跃过冲与振铃，更要掌握面对任意混合拓扑都能一剑封喉的**通用四步法**，并在面包板示波器上亲眼驯服高速上升沿里的振荡“幽灵”。`,
        },
        { kind: 'p', text: '**1.1 为什么阶跃响应的暂态骨架与无源自然响应完全一致？**' },
        {
          kind: 'p',
          text: R`在 W4-L5 一阶阶跃响应中，你已经见过这个优美的拆分：$x(t) = x_{\text{ss}} + x_t(t)$。来到二阶电路（Fundamentals of Electric Circuits, Sections 8.5–8.6），由于线性定常二阶非齐次微分方程的通解严格等于**对应齐次方程的通解（暂态响应 $x_t(t)$）**加上**一个特解（直流稳态强迫响应 $x_{\text{ss}} = x(\infty)$）**，这个结构丝毫没有改变：`,
        },
        {
          kind: 'formula',
          title: '② 二阶阶跃完全响应的统一结构',
          tex: R`x(t) = \underbrace{x_{\text{ss}}}_{\text{直流稳态强迫响应 } x(\infty)} + \underbrace{x_t(t)}_{\text{与无源电路完全同型的暂态自然响应}}`,
        },
        {
          kind: 'p',
          text: R`请记住这条直觉：**直流电源 $V_s$ 或 $I_s$ 只负责把终点线从 $0$ 抬升到 $x_{\text{ss}}$，它完全不改变电路自身的特征方程、阻尼系数 $\alpha$ 和无阻尼谐振角频率 $\omega_0$！**`,
        },
        {
          kind: 'ul',
          items: [
            R`**串联 RLC 阶跃激励（Section 8.5）**：我们优先选取**[[s_c|电容电压 $v_C(t)$]]** 作为主状态变量，因为 $t \to \infty$ 时电容开路、电流归零，电容稳态电压直接等于[[s_vs|电源电压 $V_s$]]：$v_C(t) = V_s + v_t(t)$`,
            R`**并联 RLC 阶跃激励（Section 8.6）**：按照电路对偶原理，我们优先选取**电感电流 $i_L(t)$** 作为主状态变量，因为 $t \to \infty$ 时电感短路、两端电压归零，全部电流源电流都灌入电感，即 $i_L(\infty) = I_s$：$i_L(t) = I_s + i_t(t)$`,
          ],
        },
        {
          kind: 'table',
          head: ['对比维度', '串联 RLC 阶跃响应 (Section 8.5)', '并联 RLC 阶跃响应 (Section 8.6)'],
          rows: [
            ['激励形式', R`电压阶跃 $V_s u(t)$`, R`电流阶跃 $I_s u(t)$`],
            ['首选主变量', R`电容电压 $v_C(t)$`, R`电感电流 $i_L(t)$`],
            [R`稳态强迫项 $x_{\text{ss}}$`, R`$v_C(\infty) = V_s$`, R`$i_L(\infty) = I_s$`],
            [R`阻尼系数 $\alpha$`, R`$\alpha = \dfrac{R}{2L}$（$R$ 越大，阻尼越强）`, R`$\alpha = \dfrac{1}{2RC}$（$R$ 越大，阻尼越弱）`],
            [R`谐振角频率 $\omega_0$`, R`$\omega_0 = \dfrac{1}{\sqrt{LC}}$`, R`$\omega_0 = \dfrac{1}{\sqrt{LC}}$`],
            ['辅助变量换算', R`$i(t) = C\dfrac{dv_C}{dt}$`, R`$v(t) = L\dfrac{di_L}{dt}$`],
          ],
        },
        { kind: 'p', text: '**1.2 红牌警告：全章最高频的“致命错”！**' },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授拍黑板提醒**：每年期中考试，超过一半丢分的同学不是不会解特征方程，而是栽在下面这一步——**待定常数 $A_1, A_2$（或 $B_1, B_2$ / $D_1, D_2$）必须用包含稳态项 $x_{\text{ss}}$ 的完全响应 $x(t) = x_{\text{ss}} + x_t(t)$ 去代入 $t=0^+$ 初值与导数初值，绝对不能只拿暂态项 $x_t(t)$ 去代初值！**`,
        },
        {
          kind: 'p',
          text: R`我们来做一个最刺痛神经的反证。假设一块完全没充过电的串联 RLC 电路（$v_C(0^-) = 0\text{ V},\ i_L(0^-) = 0\text{ A}$）在 $t=0$ 时突然接入 $V_s = 5\text{ V}$ 的台式可调直流电源（5 V）。此时 $v_C(0^+) = 0$ 且 $v_C'(0^+) = i(0^+)/C = 0$。`,
        },
        {
          kind: 'ul',
          items: [
            R`**错误做法**：只拿 $v_t(t) = e^{-\alpha t}(B_1\cos\omega_d t + B_2\sin\omega_d t)$ 去代 $v_t(0^+)=0, v_t'(0^+)=0$，立刻解出 $B_1 = 0, B_2 = 0$，于是写成 $v_C(t) = 5 + 0 = 5\text{ V}$——电容电压在 $t=0$ 瞬间从 $0\text{ V}$ 跳变到 $5\text{ V}$，彻底违背了电容电压不能突变的物理铁律！`,
            R`**正确做法**：把 $v_C(0^+) = V_s + B_1 = 0$ 写完整，立刻得到 $B_1 = -V_s = -5\text{ V}$，正是这个负的暂态分量在 $t=0^+$ 时刻精准抵消了 $+5\text{ V}$ 的稳态目标，才让电容从 $0\text{ V}$ 平滑起步！`,
          ],
        },
        { kind: 'figure', svg: SVG_TRAP, caption: '同一个零储能电路：只给暂态项代初值（左）与给完全响应代初值（右）' },
        { kind: 'p', text: '**1.3 原理图：串联与并联 RLC 阶跃激励对偶对照**' },
      ],
      inline_svg: SVG_DUAL,
      figure_caption: '串联 RLC 阶跃（Section 8.5）与并联 RLC 阶跃（Section 8.6）的对偶拓扑',
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '串联 RLC 阶跃响应三段式推导与三大阻尼波形全景（Section 8.5）',
      sync: { layer: L2, halo: ['sc_ch2', 'sc_peak'], params: P({ r: 56 }) },
      blocks: [
        { kind: 'p', text: '**2.1 三段式教授板书推导（例题 1：Breadboard Lab 串联 RLC 欠阻尼阶跃）**' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**题目设定（与面包板实操参数完全一致）**：串联 RLC 电路由 $0\text{ V}$ 阶跃至 $V_s = 5\text{ V}$ 的方波上升沿激励，元件参数为 [[sc_r|$R = 56\ \Omega$]]、$L = 10\text{ mH}$、$C = 1\ \mu\text{F}$。设换路前电路处于零初始储能状态，即 $v_C(0^-) = 0\text{ V},\ i(0^-) = 0\text{ A}$。求 $t > 0$ 时的[[sc_ch2|电容电压 $v_C(t)$]]、回路电流 $i(t)$，以及首次过冲[[sc_tp|峰值时间 $t_p$]]、[[sc_peak|峰值电压 $v_{\text{peak}}$ 与百分比超调量 $M_p$]]。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源（物理定律列式）',
          text: R`对 $t > 0$ 的串联闭合回路应用基尔霍夫电压定律（KVL）：$v_R(t) + v_L(t) + v_C(t) = V_s$。代入三个元件的电压-电流约束关系（VCR）：$v_R = Ri$，$v_L = L\dfrac{di}{dt}$，$i = C\dfrac{dv_C}{dt}$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（严禁提前代入数字）：将 $i = C\dfrac{dv_C}{dt}$ 与 $\dfrac{di}{dt} = C\dfrac{d^2 v_C}{dt^2}$ 代入 KVL，得关于 $v_C(t)$ 的二阶常系数非齐次微分方程`,
          tex: R`LC\frac{d^2 v_C}{dt^2} + RC\frac{dv_C}{dt} + v_C = V_s`,
        },
        { kind: 'formula', title: R`两边同除以 $LC$，化为标准型`, tex: R`\frac{d^2 v_C}{dt^2} + \frac{R}{L}\frac{dv_C}{dt} + \frac{1}{LC}v_C = \frac{V_s}{LC}` },
        { kind: 'formula', title: R`定义串联阻尼系数 $\alpha$ 与无阻尼自然谐振角频率 $\omega_0$`, tex: R`\alpha = \frac{R}{2L}, \qquad \omega_0 = \frac{1}{\sqrt{LC}}` },
        {
          kind: 'p',
          text: R`当 $\alpha < \omega_0$（欠阻尼态）时，特征方程 $s^2 + 2\alpha s + \omega_0^2 = 0$ 具有一对共轭复根 $s_{1,2} = -\alpha \pm j\omega_d$，其中[[sc_wd|阻尼振荡角频率]]为 $\omega_d = \sqrt{\omega_0^2 - \alpha^2}$。`,
        },
        {
          kind: 'formula',
          title: '由线性微分方程叠加结构，电容电压完全响应的纯符号通式为',
          tex: R`v_C(t) = V_s + e^{-\alpha t}\left(B_1\cos\omega_d t + B_2\sin\omega_d t\right)`,
        },
        {
          kind: 'formula',
          title: '对其求导',
          tex: R`\frac{dv_C}{dt} = e^{-\alpha t}\left[\left(-\alpha B_1 + \omega_d B_2\right)\cos\omega_d t + \left(-\alpha B_2 - \omega_d B_1\right)\sin\omega_d t\right]`,
        },
        {
          kind: 'formula',
          title: R`由储能连续性，零初始储能意味着 $v_C(0^+) = v_C(0^-) = 0$，且 $v_C'(0^+) = \dfrac{i(0^+)}{C} = \dfrac{i(0^-)}{C} = 0$。将两个初值**完整代入包含 $V_s$ 的方程**`,
          tex: R`\begin{cases} v_C(0^+) = V_s + B_1 = 0 \implies B_1 = -V_s \\ v_C'(0^+) = -\alpha B_1 + \omega_d B_2 = 0 \implies B_2 = \dfrac{\alpha}{\omega_d}B_1 = -\dfrac{\alpha}{\omega_d}V_s \end{cases}`,
        },
        {
          kind: 'formula',
          title: '回代得到零状态串联欠阻尼阶跃响应纯符号解析解',
          tex: R`v_C(t) = V_s\left[1 - e^{-\alpha t}\left(\cos\omega_d t + \frac{\alpha}{\omega_d}\sin\omega_d t\right)\right]`,
        },
        {
          kind: 'formula',
          title: R`进一步利用 $i(t) = C\dfrac{dv_C}{dt}$ 并结合 $\alpha^2 + \omega_d^2 = \omega_0^2 = \dfrac{1}{LC}$，化简得回路电流的极简纯符号通式`,
          tex: R`i(t) = C\cdot e^{-\alpha t}\left(\frac{\alpha^2 + \omega_d^2}{\omega_d}V_s\right)\sin\omega_d t = \frac{V_s}{L\omega_d}e^{-\alpha t}\sin\omega_d t`,
        },
        {
          kind: 'formula',
          title: R`令 $\dfrac{dv_C}{dt} = 0$（即 $\sin\omega_d t_p = 0$ 的首个正根），得到首次过冲峰值时间与百分比超调量通式`,
          tex: R`t_p = \frac{\pi}{\omega_d}, \qquad M_p = \frac{v_C(t_p) - V_s}{V_s} = e^{-\pi\alpha/\omega_d}`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（经 Python 精确验证，ODE 残差 $< 10^{-12}$）`,
          steps: [
            { label: '代入', text: R`代入 $V_s = 5\text{ V}$、$R = 56\ \Omega$、$L = 10\times 10^{-3}\text{ H}$、$C = 1\times 10^{-6}\text{ F}$` },
            { label: '1. 特征参数计算', tex: R`\alpha = \frac{56}{2 \times 10^{-2}} = 2800\text{ Np/s}` },
            { label: '', tex: R`\omega_0 = \frac{1}{\sqrt{10^{-2} \times 10^{-6}}} = 10000\text{ rad/s}` },
            {
              label: '',
              text: R`由于 $\alpha = 2800 < \omega_0 = 10000$，电路处于**欠阻尼态**，阻尼比 $\zeta = \dfrac{\alpha}{\omega_0} = 0.28$。注意到 $(7, 24, 25)$ 勾股数结构，阻尼振荡角频率为精确整数`,
              tex: R`\omega_d = \sqrt{10000^2 - 2800^2} = 9600\text{ rad/s}`,
            },
            {
              label: '2. 待定常数计算',
              tex: R`B_1 = -5\text{ V}, \qquad B_2 = -\frac{2800}{9600} \times 5 = -\frac{7}{24} \times 5 = -\frac{35}{24}\text{ V} \approx -1.458\text{ V}`,
            },
            { label: R`3. 最终解析表达式（$t \ge 0$）`, tex: R`v_C(t) = 5 - e^{-2800t}\left(5\cos 9600t + \frac{35}{24}\sin 9600t\right)\text{ V}` },
            { label: '', tex: R`i(t) = \frac{5}{0.01 \times 9600}e^{-2800t}\sin 9600t = \frac{5}{96}e^{-2800t}\sin 9600t\text{ A} \approx 52.08\,e^{-2800t}\sin(9600t)\text{ mA}` },
            {
              label: '4. 过冲指标定量计算',
              tex: R`t_p = \frac{\pi}{9600} \approx 0.327\text{ ms}, \qquad M_p = e^{-\pi \times 2800 / 9600} = e^{-7\pi/24} \approx 0.4000 = 40.0\%`,
            },
            { label: '', tex: R`v_{\text{peak}} = 5 \times (1 + 0.4000) = 7.00\text{ V}` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授点睛**：看这个惊人的物理事实！你只接了一台 $5\text{ V}$ 电源，但在 $t = 0.327\text{ ms}$ 这一瞬间，电容两端居然冲到了 **$7.00\text{ V}$**（高出电源整整 $2\text{ V}$）！多出来的能量从哪来？正是上升阶段流过电感的电流在磁场中攒下的动能 $\frac{1}{2}Li^2$，在电容充到 $5\text{ V}$ 时电流还没归零，电感惯性硬把电荷继续往电容里“顶”，顶出了 $+40\%$ 的过冲！`,
        },
        { kind: 'p', text: R`**2.2 同一组 $L, C$ 下三大阻尼态解析对照**` },
        {
          kind: 'p',
          text: R`保持 $V_s = 5\text{ V},\ L = 10\text{ mH},\ C = 1\ \mu\text{F}$（临界电阻 $R_{\text{crit}} = 2\sqrt{L/C} = 200\ \Omega$）不变，仅调节[[sc_r|电阻 $R$]]：`,
        },
        {
          kind: 'ul',
          items: [
            R`**欠阻尼（$R = 56\ \Omega < 200\ \Omega$）**：$\alpha = 2800,\ \omega_d = 9600$，$v_C(t) = 5 - e^{-2800t}(5\cos 9600t + \frac{35}{24}\sin 9600t)\text{ V}$。上升最猛，但过冲高达 $7.00\text{ V}$（$+40\%$）且剧烈振铃。`,
            R`**临界阻尼（$R = 200\ \Omega = R_{\text{crit}}$）**：$\alpha = \omega_0 = 10000$，$v_C(t) = 5 - (5 + 50000t)e^{-10000t}\text{ V}$。**零过冲前提下最快的稳定曲线**，$t = 0.5\text{ ms}$ 时已达 $4.80\text{ V}$（稳态的 $96\%$）。`,
            R`**过阻尼（$R = 250\ \Omega > 200\ \Omega$）**：$\alpha = 12500$，两实根 $s_1 = -5000\text{ s}^{-1},\ s_2 = -20000\text{ s}^{-1}$，$v_C(t) = 5 - \frac{20}{3}e^{-5000t} + \frac{5}{3}e^{-20000t}\text{ V}$。无过冲但拖尾迟缓，$t = 0.5\text{ ms}$ 时仅达 $4.45\text{ V}$。`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`对照左侧 02 示波器：点 56 / 200 / 250 Ω 三个快捷挡，[[sc_case|阻尼状态]]、[[sc_peak|峰值与超调]]、[[sc_tp|$t_p$]] 与 [[sc_ts|2% 稳定时间]]的读数都由同一套通用解法（初值 → 特征根 → 稳态 → 常数）实时算出；切到“整周期”时基还能看到下降沿后电容被反向“顶”到约 $-2.0\text{ V}$。`,
        },
        { kind: 'p', text: '**2.3 Python 逐点精确绘制的串联 RLC 阶跃三阻尼曲线对比图**' },
      ],
      inline_svg: SVG_CURVES,
      figure_caption: '串联 RLC 阶跃响应精确波形对照：欠阻尼 56 Ω、临界阻尼 200 Ω、过阻尼 250 Ω',
    },
    /* ---------------------------------------------------------------- act 3: the guided example */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '并联 RLC 阶跃响应与苏格拉底式 5 步互动实战（Section 8.6）',
      sync: { layer: L1, halo: ['p_r'], params: P({ topo: 'parallel', view: '0p' }) },
      blocks: [
        { kind: 'p', text: R`**3.1 并联电路的反直觉物理：为什么增大 $R$ 反而更爱振铃？**` },
        { kind: 'formula', title: '① 对并联 RLC 阶跃电路的上节点列写 KCL', tex: R`i_R + i_L + i_C = I_s \implies \frac{v}{R} + i_L + C\frac{dv}{dt} = I_s` },
        {
          kind: 'formula',
          title: R`② 利用电感 VCR 关系 $v = L\dfrac{di_L}{dt}$ 消去 $v$，立刻得到与串联完全对偶的标准二阶非齐次方程`,
          tex: R`\frac{d^2 i_L}{dt^2} + \frac{1}{RC}\frac{di_L}{dt} + \frac{1}{LC}i_L = \frac{I_s}{LC}`,
        },
        {
          kind: 'p',
          text: R`这里的阻尼系数是 $\alpha = \dfrac{1}{2RC}$，临界阻尼电阻是 $R_{\text{crit}} = \dfrac{1}{2}\sqrt{\dfrac{L}{C}}$。请把物理图像刻进脑海里：`,
        },
        {
          kind: 'ul',
          items: [
            R`在**串联**回路里，电阻 $R$ 挡在电流必经之路上，$R$ 越大越“刹车”，所以阻尼越强；`,
            R`在**并联**电路里，[[p_r|电阻 $R$]] 是一条把 $L, C$ 振荡能量漏掉的“旁路排水沟”。如果把 $R$ 调大甚至开路（$R \to \infty$），排水沟堵死了，能量只能在 $L$ 和 $C$ 之间无休止地来回倒腾，所以 **$R$ 越大反而阻尼越弱（越容易欠阻尼振铃）**！`,
          ],
        },
        { kind: 'figure', svg: SVG_R_ROLE, caption: '同一颗 R：串联时挡在电流必经之路上，并联时是旁路排水沟' },
        { kind: 'p', text: R`**3.2–3.3 并联 RLC 阶跃实战电路与苏格拉底式 5 步引导例题（完整求解 $i_L(t)$ 与 $v(t)$）**` },
        {
          kind: 'guided',
          // all five steps answered: the parallel page of the 01 schematic shows every number
          done_params: { pReveal: 9 },
          title: '并联 RLC 阶跃响应 5 步苏格拉底引导求解',
          source: 'W4-L8 · Alexander, Sadiku & Fredette (2026) Section 8.6',
          problem: R`并联 RLC 电路接入[[p_is|阶跃电流源 $I_s = 6u(t)\text{ A}$]]，元件参数 [[p_r|$R = 5\ \Omega$]], [[p_l|$L = 2\text{ H}$]], [[p_c|$C = 20\text{ mF}\ (0.02\text{ F})$]]，换路前零初始储能 $i_L(0^-) = 0\text{ A}$, $v(0^-) = 0\text{ V}$。求 $t > 0$ 的电感电流 $i_L(t)$ 与[[p_v|并联端电压 $v(t)$]]。`,
          problem_svg: SVG_PAR_PROBLEM,
          steps: [
            {
              title: R`步骤 1：锁定 $t=0^+$ 初值与导数初值`,
              mini_svg: MINI_STEP1,
              question: R`换路前零初始储能，那么在 $t = 0^+$ 瞬间，电感电流 $i_L(0^+)$ 和它的变化率 $di_L(0^+)/dt$ 分别是多少？`,
              hint: R`$i_L(0^+) = i_L(0^-), \quad \left.\dfrac{di_L}{dt}\right|_{0^+} = \dfrac{v(0^+)}{L} = \dfrac{v(0^-)}{L}$`,
              options: [
                {
                  text: R`$i_L(0^+) = 0\text{ A}$，$di_L(0^+)/dt = 0\text{ A/s}$`,
                  correct: true,
                  feedback: R`对！电感电流不能突变，$i_L(0^+) = 0$；电容电压也不能突变，$v(0^+) = 0$，电感两端没有电压，$di_L/dt$ 在 $0^+$ 也是 0。那一瞬间 6 A 全部流进了电容。`,
                },
                {
                  text: R`$i_L(0^+) = 0\text{ A}$，$di_L(0^+)/dt = 3\text{ A/s}$`,
                  correct: false,
                  feedback: R`等等！是谁在控制 $di_L/dt$？是电感两端电压 $v(0^+)/L$！别忘了并联电容电压不能突变，$t=0^+$ 时 $v(0^+) = v(0^-) = 0\text{ V}$，所以 $6\text{ A}$ 电流源在那一瞬间全被电容短路吃掉了，电感两端电压为 0！`,
                },
                {
                  text: R`$i_L(0^+) = 6\text{ A}$，$di_L(0^+)/dt = 0\text{ A/s}$`,
                  correct: false,
                  feedback: R`停！电感电流具有惯性，绝不能在 $t=0$ 瞬间从 $0\text{ A}$ 跳变到 $6\text{ A}$。$6\text{ A}$ 是 $t \to \infty$ 的稳态值，不是 $t = 0^+$ 的初值。`,
                },
              ],
              board: [R`i_L(0^+) = 0\text{ A}, \qquad v(0^+) = 0\text{ V} \implies i_L'(0^+) = \frac{v(0^+)}{L} = 0\text{ A/s}`],
              halo: ['p_l', 'p_c'],
              params: GD('0p', 0),
              layer: L1,
            },
            {
              title: '步骤 2：求特征参数并判定阻尼类型',
              mini_svg: MINI_STEP2,
              question: R`计算该并联 RLC 电路的阻尼系数 $\alpha$ 与谐振角频率 $\omega_0$，它属于哪种阻尼态？`,
              hint: R`$\alpha = \dfrac{1}{2RC}, \qquad \omega_0 = \dfrac{1}{\sqrt{LC}}$`,
              options: [
                {
                  text: R`$\alpha = 1.25\text{ Np/s}$, $\omega_0 = 5\text{ rad/s}$（欠阻尼）`,
                  correct: false,
                  feedback: R`你把串联公式 $\alpha = R/(2L)$ 套到并联电路里啦！并联电路的阻尼系数是 $\alpha = 1/(2RC)$，立刻重算。`,
                },
                {
                  text: R`$\alpha = 5\text{ Np/s}$, $\omega_0 = 5\text{ rad/s}$（临界阻尼）`,
                  correct: true,
                  feedback: R`完全正确！$\alpha = 1/(2 \times 5 \times 0.02) = 5$，$\omega_0 = 1/\sqrt{2 \times 0.02} = 5$，$\alpha = \omega_0$：重根 $s_1 = s_2 = -5$，临界阻尼。`,
                },
                {
                  text: R`$\alpha = 10\text{ Np/s}$, $\omega_0 = 5\text{ rad/s}$（过阻尼）`,
                  correct: false,
                  feedback: R`检查一下分母里的因子 2！$1/(RC) = 10$，除以 2 之后 $\alpha$ 才是 $5\text{ Np/s}$。`,
                },
              ],
              board: [
                R`\alpha = \frac{1}{2(5)(0.02)} = 5\text{ Np/s}, \quad \omega_0 = \frac{1}{\sqrt{2 \times 0.02}} = 5\text{ rad/s} \implies s_1 = s_2 = -5\text{ s}^{-1}\text{（临界阻尼）}`,
              ],
              halo: ['p_r', 'p_l', 'p_c', 'step_2'],
              params: GD('zero', 1),
              layer: L1,
            },
            {
              title: '步骤 3：写出含稳态项的完全响应结构',
              mini_svg: MINI_STEP3,
              question: R`求出 $t \to \infty$ 稳态电感电流 $i_L(\infty)$，并写出 $i_L(t)$ 的完全响应通式：`,
              hint: R`$i_L(t) = i_L(\infty) + (D_1 + D_2 t)e^{-\alpha t}$`,
              options: [
                {
                  text: R`$i_L(t) = (D_1 + D_2 t) e^{-5t}$`,
                  correct: false,
                  feedback: R`红牌警告！你漏掉了稳态强迫项 $i_{\text{ss}} = 6\text{ A}$！如果丢掉 6，下一步代零初值会直接把 $D_1, D_2$ 全算成 0！`,
                },
                {
                  text: R`$i_L(t) = 6 + (D_1 + D_2 t) e^{-5t}$`,
                  correct: true,
                  feedback: R`对！$t \to \infty$ 时电感短路、电容开路，$6\text{ A}$ 全部灌进电感：$i_L(\infty) = 6\text{ A}$；临界阻尼的暂态项是 $(D_1 + D_2 t)e^{-5t}$。`,
                },
                {
                  text: R`$i_L(t) = 6 + D_1 e^{-5t} + D_2 e^{5t}$`,
                  correct: false,
                  feedback: R`重根 $s_1 = s_2 = -5$ 的临界阻尼暂态项是 $(D_1 + D_2 t)e^{-5t}$，绝不会出现发散的 $e^{+5t}$！`,
                },
              ],
              board: [R`i_L(\infty) = I_s = 6\text{ A} \implies i_L(t) = 6 + (D_1 + D_2 t)e^{-5t}\text{ A}`],
              halo: ['p_l', 'step_3'],
              params: GD('inf', 2),
              layer: L1,
            },
            {
              title: R`步骤 4：将初值代入完全响应确定 $D_1, D_2$`,
              mini_svg: MINI_STEP4,
              question: R`把步骤 1 的 $i_L(0^+) = 0$ 和 $i_L'(0^+) = 0$ 代入完全响应 $i_L(t) = 6 + (D_1 + D_2 t)e^{-5t}$，解出 $D_1$ 和 $D_2$：`,
              hint: R`$\dfrac{d}{dt}\left[(D_1 + D_2 t)e^{-5t}\right]_{t=0^+} = D_2 - 5D_1 = 0$`,
              options: [
                {
                  text: R`$D_1 = -6\text{ A}$，$D_2 = -30\text{ A/s}$`,
                  correct: true,
                  feedback: R`漂亮！$6 + D_1 = 0$ 给出 $D_1 = -6$；$D_2 - 5D_1 = 0$ 给出 $D_2 = 5D_1 = -30$。负的暂态项在 $0^+$ 刚好抵消 6 A 的稳态目标。`,
                },
                {
                  text: R`$D_1 = -6\text{ A}$，$D_2 = +30\text{ A/s}$`,
                  correct: false,
                  feedback: R`符号出错啦！求导得 $i_L'(0^+) = D_2 - 5 D_1 = 0$，把 $D_1 = -6$ 代进去是 $D_2 - 5(-6) = D_2 + 30 = 0$，所以 $D_2$ 必须是 $-30$！`,
                },
                {
                  text: R`$D_1 = 0\text{ A}$，$D_2 = 0\text{ A/s}$`,
                  correct: false,
                  feedback: R`你又掉进“只拿暂态项代初值”的陷阱了！必须带回稳态常数 6：$6 + D_1 = 0$。`,
                },
              ],
              board: [R`6 + D_1 = 0 \implies D_1 = -6; \quad D_2 - 5(-6) = 0 \implies D_2 = -30 \implies i_L(t) = 6 - (6 + 30t)e^{-5t}\text{ A}`],
              halo: ['p_l', 'step_4'],
              params: GD('0p', 3),
              layer: L1,
            },
            {
              title: R`步骤 5：反推并联端电压 $v(t)$ 并做物理自检`,
              mini_svg: MINI_STEP5,
              question: R`利用 $v(t) = L\,di_L/dt$ 求出并联端电压 $v(t)$，并检查 $t=0^+$ 与 $t\to\infty$ 是否合理：`,
              hint: R`$v(t) = L\dfrac{di_L}{dt} = 2 \cdot \dfrac{d}{dt}\left[6 - (6 + 30t)e^{-5t}\right]$`,
              options: [
                {
                  text: R`$v(t) = 150 t e^{-5t}\text{ V}$`,
                  correct: false,
                  feedback: R`你算出了正确的 $di_L/dt = 150 t e^{-5t}\text{ A/s}$，但别忘了乘以电感值 $L = 2\text{ H}$！`,
                },
                {
                  text: R`$v(t) = 300 t e^{-5t}\text{ V}$`,
                  correct: true,
                  feedback: R`满分通关！$v(0^+) = 0$（电容电压不突变）、$v(\infty) = 0$（电感短路），中间是一个单峰脉冲：$t = 1/\alpha = 0.2\text{ s}$ 时达到最大 $300 \times 0.2 \times e^{-1} \approx 22.07\text{ V}$。`,
                },
                {
                  text: R`$v(t) = 30 + 300 t e^{-5t}\text{ V}$`,
                  correct: false,
                  feedback: R`做个终值自检：$t \to \infty$ 时电感把并联节点直接短路了，端电压 $v(\infty)$ 必须衰减回 $0\text{ V}$，不可能留着 $30\text{ V}$ 稳态！`,
                },
              ],
              board: [R`v(t) = 2 \cdot \left[(-30 + 30 + 150t)e^{-5t}\right] = 300 t e^{-5t}\text{ V} \quad (v(0^+)=0,\ v(\infty)=0,\ v_{\max}=22.07\text{ V})`],
              halo: ['p_v', 'p_l'],
              params: GD('inf', 4),
              layer: L1,
            },
          ],
          conclusion: R`五步通关：$\alpha = \omega_0 = 5$（临界阻尼，$s_1 = s_2 = -5$），$i_L(t) = 6 - (6 + 30t)e^{-5t}\text{ A}$，$v(t) = 300te^{-5t}\text{ V}$，峰值 $22.07\text{ V}$ 出现在 $t = 0.2\text{ s}$。左侧 01 原理图的并联页已揭晓全部数值：切换四个等效视图，对照下方四步法读数复盘黑板。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '走出温室——一般非标准二阶电路通用四步法（Section 8.7）',
      sync: { layer: L1, halo: ['g_r1', 'g_r2'], params: P({ topo: 'general', view: 'zero' }) },
      blocks: [
        { kind: 'p', text: '**4.1 当电路既非纯串联也非纯并联时，怎么办？**' },
        {
          kind: 'p',
          text: R`打开任何一块真实电路板，你会发现元件几乎从不乖乖排成纯串联或纯并联——比如电源经[[g_r1|串联限流电阻 $R_1$]] 与[[g_l|电感 $L$]] 后，再接入并联的[[g_r2|负载电阻 $R_2$]] 和[[g_c|滤波电容 $C$]]，或者电路里藏着受控源。此时，$\alpha = \dfrac{R}{2L}$ 和 $\alpha = \dfrac{1}{2RC}$ **全部失效**！`,
        },
        { kind: 'p', text: R`幸运的是，Alexander & Sadiku 在 **Section 8.7** 给了我们一把放之四海而皆准的万能钥匙——**一般二阶电路通用四步法**：` },
        {
          kind: 'ol',
          items: [
            R`**[[step_1,v_0p|第一步（初值锁定）]]**：沿用 W4-L6 的方法，由 $t=0^-$ 稳态得到 $v_C(0^-), i_L(0^-)$，画出 $t=0^+$ 等效电路，求出目标变量 $x(0^+)$ 与其一阶导数 $x'(0^+)$。`,
            R`**[[step_2,v_zero|第二步（求暂态形式 $x_t(t)$）]]**：将电路中所有**独立源置零**（独立电压源短路，独立电流源开路；受控源保留！），在无源网络中列出两个状态变量（$v_C, i_L$）的 KCL/KVL 方程，**消去另一个状态变量**，导出二阶齐次微分方程与特征方程，解出特征根 $s_1, s_2$，据此写出 $x_t(t)$ 的对应形式（过阻尼 / 临界阻尼 / 欠阻尼）。`,
            R`**[[step_3,v_inf|第三步（求直流稳态 $x_{\text{ss}}$）]]**：恢复独立直流源，令 $t \to \infty$（电感短路、电容开路），用纯电阻分压/分流求出稳态强迫响应 $x_{\text{ss}} = x(\infty)$。`,
            R`**[[step_4|第四步（合并定常数）]]**：写出完全响应 $x(t) = x_{\text{ss}} + x_t(t)$，将第一步求得的 $x(0^+)$ 与 $x'(0^+)$ **代入完全响应**，解出两个待定常数；最后可按需由元件关系反推其余支路电压或电流并做双向自检。`,
          ],
        },
        { kind: 'p', text: '**4.2 原理图：一般混合二阶电路例题拓扑**' },
        { kind: 'figure', svg: SVG_GENERAL, caption: '一般混合二阶电路例题（Section 8.7）：V_s = 12 V，R₁ = 4 Ω，L = 1 H，R₂ = 2 Ω，C = 0.5 F' },
        { kind: 'p', text: '**4.3 三段式教授板书推导（例题 2：一般混合二阶电路完整求解）**' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**题目设定**：上图所示混合二阶电路中，[[g_vs|$V_s = 12\text{ V}$]]，[[g_r1|$R_1 = 4\ \Omega$]]，[[g_r2|$R_2 = 2\ \Omega$]]，[[g_l|$L = 1\text{ H}$]]，[[g_c|$C = 0.5\text{ F}$]]。开关在 $t=0$ 时刻闭合，换路前零初始储能（$v_C(0^-) = 0\text{ V},\ i_L(0^-) = 0\text{ A}$）。按通用四步法求 $t > 0$ 的电容电压 $v_C(t)$ 与电感电流 $i_L(t)$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源（物理定律列式）',
          text: R`对[[g_a|节点 A]] 列写 KCL，并对左侧回路列写 KVL：节点 A (KCL)：$i_L(t) = \dfrac{v_C(t)}{R_2} + C\dfrac{dv_C(t)}{dt}$；左侧回路 (KVL)：$R_1 i_L(t) + L\dfrac{di_L(t)}{dt} + v_C(t) = V_s$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（按通用四步法展开）· 步骤 1（初值）：由连续性 $v_C(0^+) = v_C(0^-)$，$i_L(0^+) = i_L(0^-)$。由节点 A 的 KCL 得导数初值`,
          tex: R`v_C'(0^+) = \frac{1}{C}\left(i_L(0^+) - \frac{v_C(0^+)}{R_2}\right)`,
        },
        {
          kind: 'formula',
          title: R`步骤 2（独立源置零导出特征方程）：令 $V_s = 0$，将 $i_L = \dfrac{v_C}{R_2} + C\dfrac{dv_C}{dt}$ 及其导数 $\dfrac{di_L}{dt} = \dfrac{1}{R_2}\dfrac{dv_C}{dt} + C\dfrac{d^2 v_C}{dt^2}$ 代入齐次 KVL 方程`,
          tex: R`LC\frac{d^2 v_C}{dt^2} + \left(R_1 C + \frac{L}{R_2}\right)\frac{dv_C}{dt} + \left(1 + \frac{R_1}{R_2}\right)v_C = 0`,
        },
        { kind: 'formula', title: R`两边同除以 $LC$，得到该混合拓扑的纯符号特征方程`, tex: R`s^2 + \left(\frac{R_1}{L} + \frac{1}{R_2 C}\right)s + \frac{R_1 + R_2}{R_2 LC} = 0` },
        {
          kind: 'note',
          tone: 'tip',
          text: R`（教授点评：仔细看一次项系数 $\frac{R_1}{L} + \frac{1}{R_2 C}$——它恰好是串联阻尼通道与并联阻尼通道的叠加！这就是混合拓扑不能套单一公式的根本原因。）`,
        },
        {
          kind: 'formula',
          title: R`步骤 3（直流稳态）：令 $t \to \infty$，电感短路、电容开路，$R_1$ 与 $R_2$ 构成纯电阻分压`,
          tex: R`v_C(\infty) = V_s\frac{R_2}{R_1 + R_2}, \qquad i_L(\infty) = \frac{V_s}{R_1 + R_2}`,
        },
        {
          kind: 'formula',
          title: R`步骤 4（合并通式）：若特征方程有两个不等负实根 $s_1, s_2$（过阻尼），则完全响应通式为`,
          tex: R`v_C(t) = v_C(\infty) + A_1 e^{s_1 t} + A_2 e^{s_2 t}`,
        },
        { kind: 'p', text: R`其中 $A_1, A_2$ 由 $v_C(0^+) = v_C(\infty) + A_1 + A_2$ 与 $v_C'(0^+) = s_1 A_1 + s_2 A_2$ 联立求得。` },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（经 Python 精确验证，ODE 残差 $< 10^{-12}$）`,
          steps: [
            { label: '1. 代入求初值', tex: R`v_C(0^+) = 0\text{ V}, \quad i_L(0^+) = 0\text{ A} \implies v_C'(0^+) = \frac{1}{0.5}\left(0 - \frac{0}{2}\right) = 0\text{ V/s}` },
            { label: '2. 代入求特征根', tex: R`\frac{R_1}{L} + \frac{1}{R_2 C} = \frac{4}{1} + \frac{1}{2 \times 0.5} = 4 + 1 = 5\text{ s}^{-1}` },
            { label: '', tex: R`\frac{R_1 + R_2}{R_2 LC} = \frac{4 + 2}{2 \times 1 \times 0.5} = 6\text{ s}^{-2}` },
            { label: '', text: R`特征方程为 $s^2 + 5s + 6 = (s + 2)(s + 3) = 0$，得两个不等实根（过阻尼）`, tex: R`s_1 = -2\text{ s}^{-1}, \qquad s_2 = -3\text{ s}^{-1}` },
            { label: '3. 代入求直流稳态', tex: R`v_C(\infty) = 12 \times \frac{2}{4 + 2} = 4\text{ V}, \qquad i_L(\infty) = \frac{12}{4 + 2} = 2\text{ A}` },
            { label: R`4. 合并代入初值定 $A_1, A_2$`, tex: R`v_C(t) = 4 + A_1 e^{-2t} + A_2 e^{-3t}` },
            { label: '', tex: R`\begin{cases} v_C(0^+) = 4 + A_1 + A_2 = 0 \implies A_1 + A_2 = -4 \\ v_C'(0^+) = -2A_1 - 3A_2 = 0 \implies A_1 = -\dfrac{3}{2}A_2 \end{cases}` },
            { label: '', text: R`解得 $A_1 = -12\text{ V},\ A_2 = +8\text{ V}$，于是完整电容电压为（$t \ge 0$）`, tex: R`v_C(t) = 4 - 12e^{-2t} + 8e^{-3t}\text{ V}` },
            {
              label: '5. 反推电感电流并做物理双向自检',
              tex: R`i_L(t) = \frac{v_C(t)}{2} + 0.5\frac{dv_C(t)}{dt} = \left(2 - 6e^{-2t} + 4e^{-3t}\right) + 0.5\left(24e^{-2t} - 24e^{-3t}\right)`,
            },
            { label: '', tex: R`i_L(t) = 2 + 6e^{-2t} - 8e^{-3t}\text{ A}` },
            {
              label: '物理自检',
              text: R`$i_L(0^+) = 2 + 6 - 8 = 0\text{ A}$（吻合）；$i_L'(0^+) = -12 + 24 = 12\text{ A/s}$，而 $t=0^+$ 时电感两端承受全部电源电压 $v_L(0^+) = 12\text{ V}$，故 $\frac{v_L(0^+)}{L} = \frac{12}{1} = 12\text{ A/s}$（完全吻合！）；$i_L(\infty) = 2\text{ A}$（吻合）。`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`对照左侧 01 原理图的“一般混合二阶”页：[[v_0p|t = 0⁺]] 视图里电感开路、两端承受全部 12 V；[[v_zero|源置零]] 视图给出特征方程；[[v_inf|t → ∞]] 视图是 $R_1$、$R_2$ 分压。下方四格就是四步法的四个结果。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '工程真相与 3D 面包板实操——PCB 走线振铃、串联端接与示波器安全',
      sync: { layer: L3, halo: ['bb_gen', 'bb_scope'], params: P({ r: 56, cam: 'bench' }) },
      blocks: [
        { kind: 'p', text: R`**5.1 为什么高速 PCB 走线必须串一颗 $22\ \Omega\text{–}47\ \Omega$ 端接电阻？**` },
        {
          kind: 'p',
          text: R`在单片机 SPI、时钟总线或 DDR 接口设计中，你一定在芯片引脚旁见过一排不起眼的 $22\ \Omega$ 或 $33\ \Omega$ 贴片电阻，它们叫**源端串联端接电阻（Series Termination Resistor）**。为什么工程师要故意在信号线上加电阻？`,
        },
        {
          kind: 'p',
          text: R`因为当驱动器 GPIO 在 $1\text{–}2\text{ ns}$ 内完成 $0\text{ V} \to 3.3\text{ V}$ 阶跃翻转时，一根 $5\text{ cm}$ 长的 PCB 铜皮走线不再是理想导线，它带有寄生电感 $L_{\text{trace}} \approx 25\text{ nH}$，而接收端芯片引脚带有输入电容 $C_{\text{in}} \approx 10\text{ pF}$。驱动器内阻 $R_{\text{out}}$ 通常只有 $10\text{–}15\ \Omega$，而该寄生回路的临界阻尼电阻高达：`,
        },
        {
          kind: 'formula',
          title: '寄生回路的临界阻尼电阻',
          tex: R`R_{\text{crit}} = 2\sqrt{\frac{L_{\text{trace}}}{C_{\text{in}}}} = 2\sqrt{\frac{25\times 10^{-9}}{10\times 10^{-12}}} = 2 \times 50 = 100\ \Omega`,
        },
        {
          kind: 'ul',
          items: [
            R`**不加端接电阻（$R_{\text{total}} \approx 15\ \Omega \ll 100\ \Omega$）**：系统处于深度欠阻尼（$\zeta \approx 0.15$），上升沿会在接收端炸出超过 $+60\%$ 的高压过冲（击穿芯片 ESD 二极管）和剧烈下冲（导致时钟沿重复误触发、EMI 辐射超标）！`,
            R`**串联端接电阻 $R_{\text{term}} = 33\ \Omega\text{–}47\ \Omega$**：人为把总阻尼拉向临界阻尼（工程上通常取 $\zeta \approx 0.6\text{–}0.8$ 或匹配传输线特性阻抗 $Z_0 = 50\ \Omega$），瞬间把振铃抹平，同时保持足够陡峭的上升沿。`,
          ],
        },
        { kind: 'p', text: '**5.2 PCB 走线寄生 RLC 阶跃振铃与串联端接抑制示意图**' },
        { kind: 'figure', svg: SVG_PCB, caption: '工程映射：PCB 数字走线寄生 RLC 模型与串联端接电阻消振原理' },
        { kind: 'p', text: '**5.3 3D 面包板实操指南与示波器共地安全铁律**' },
        { kind: 'p', text: '切换到左侧舞台 **第 3 层（3D 面包板方波激励实操）**，按以下 4 步亲手复现第 2 幕的理论波形：' },
        {
          kind: 'ol',
          items: [
            R`**搭建串联回路**：在面包板上按 ${code('信号源红夹 -> 可调电阻 R -> 10 mH 电感 L -> 1 uF 非极性电容 C -> 公共 GND 轨')} 的顺序串联，确保 **[[bb_c|电容 C]] 的负端直接插在 [[rail_gnd|GND 轨]]上**。`,
            R`**设定激励源**：将[[bb_gen|函数信号发生器]]设为 **0–5 V 单极性方波、频率 200 Hz**（每个上升沿后有 $2.5\text{ ms}$ 平台供瞬态充分收敛），输出阻抗 $50\ \Omega$（注意：实际[[bench_r|回路总电阻]]为 $R_{\text{ext}} + 50\ \Omega + R_{\text{DCR}}$，仿真与实验校准时需计入信号源内阻）。`,
            R`**双通道安全挂接（红线铁律！）**：[[ch1_probe|CH1 探头]]挂在信号源输出节点，**[[ch1_clip|地夹]]接 GND 轨**；[[ch2_probe|CH2 探头]]挂在 $L$ 与 $C$ 的公共节点（即 [[node_n3|$v_C(t)$]]），**[[ch2_clip|地夹]]同样接在 GND 轨**。**安全禁令**：严禁为了直接看 $v_L(t)$ 或 $v_R(t)$ 而把 CH2 黑色地夹夹到非地节点！示波器通道外壳与信号源外壳均直通市电地线，浮地夹接会瞬间短路元件并可能烧毁信号源输出级。`,
            R`**旋钮扫阻观察**：缓慢旋转[[bb_pot|电位器]]，将回路总电阻从 $56\ \Omega$ 调升至 $200\ \Omega$ 再调至 $250\ \Omega$，观察示波器 CH2 上升沿如何从 $7.0\text{ V}$ 剧烈振铃精准收缩为无过冲的最快上升沿，再变为迟缓拖尾。`,
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**示波器共地安全铁律**：CH1 探头尖端接信号源输出端 $v_s(t)$，黑色地夹接面包板唯一公共 GND 轨；CH2 探头尖端接电容上端 $v_C(t)$，黑色地夹接同一公共 GND 轨（确保电容下端直接接地）。严禁将 CH2 地夹夹在串联电阻 $R$ 或电感 $L$ 的浮地引脚上！因为示波器两通道 BNC 外壳与信号发生器外壳均连通市电保护地 PE，浮地夹接会直接将电容或信号源短路。若需观察串联电感或电阻两端电压，请保持两地夹共接 GND，开启示波器 MATH 功能计算 CH1 − CH2。`,
        },
        { kind: 'figure', svg: SVG_GROUND, caption: '两只地夹都只能夹 GND 轨：信号源与示波器经市电保护地 PE 已经共地' },
        {
          kind: 'table',
          caption: '面包板安全与参数（激励是函数信号发生器，不用直流电源；元件按原值搭建，无需缩放）',
          head: ['项目', '取值', '说明'],
          rows: [
            [
              '[[bb_gen|激励源]]',
              '函数信号发生器：0–5 V 单极性方波，200 Hz（周期 5 ms），输出阻抗 50 Ω',
              R`半周期 $2.5\text{ ms}$ 大于欠阻尼态 $5/\alpha = 1.79\text{ ms}$ 的稳定时间，每个上升沿都能锁定完整振铃并收敛到 $5.0\text{ V}$`,
            ],
            ['[[bb_l|电感]]', 'L = 10 mH（色环 / 工字电感）', 'DCR < 5 Ω（本板按 4 Ω 计），额定电流 ≥ 150 mA'],
            ['[[bb_c|电容]]', 'C = 1 µF 非极性聚丙烯薄膜或 X7R 陶瓷，耐压 ≥ 25 V', R`严禁极性电解电容：上升沿振铃到 $+7.0\text{ V}$，下降沿把电容反向“顶”到约 $-2.0\text{ V}$`],
            [
              '[[bb_pot|可调电阻]]',
              '500 Ω 线性电位器（1/4 W）',
              R`回路总电阻 $= 50\ \Omega$（信号源内阻）$+ 4\ \Omega$（DCR）$+ R_{\text{pot}}$：$56\ \Omega$ 挡电位器约 $2\ \Omega$，$200\ \Omega$ 挡 $146\ \Omega$，$250\ \Omega$ 挡 $196\ \Omega$。信号源的 $50\ \Omega$ 内阻本身就限流，不再另串 $47\ \Omega$ 保护电阻（否则总电阻至少约 $101\ \Omega$，到不了 $56\ \Omega$ 欠阻尼挡）`,
            ],
            ['特征参数', R`$\omega_0 = 10000\text{ rad/s}$（$1591.55\text{ Hz}$），$R_{\text{crit}} = 200\ \Omega$`, '三挡：56 Ω 欠阻尼、200 Ω 临界、250 Ω 过阻尼'],
            [
              '电气极限',
              R`$v_C$ 峰值约 $7.0\text{ V}$（超调 $40\%$）；峰值电流约 $34\text{ mA}$（$34.35\text{ mA}$，$t \approx 0.134\text{ ms}$）`,
              R`远低于面包板 $500\text{ mA}$ 接触上限与电感 $150\text{ mA}$ 额定；电阻瞬时功率峰值约 $66\text{ mW}$，平均功耗合计只有 $CV_s^2 f = 5\text{ mW}$（每个边沿耗 $\tfrac{1}{2}CV_s^2$，与 $R$ 无关），远低于 $250\text{ mW}$`,
            ],
          ],
        },
        {
          kind: 'table',
          caption: '左侧 03 层的逐孔接线（顶部内侧蓝色 − 轨作 GND 轨）',
          head: ['元件 / 导线', '位置', '作用'],
          rows: [
            ['[[bb_gen|函数信号发生器]] BNC 转鳄鱼夹', '红夹 → a10（[[node_n1|节点 N1]]）；黑夹 → GND 轨第 4 列', '0–5 V 方波送入回路'],
            ['[[bb_pot|500 Ω 电位器]]', 'c10 / c11 / c12（端 A、滑臂、端 B 悬空）', R`端 A 到滑臂之间的电阻就是 $R_{\text{pot}}$`],
            ['[[bb_jumper|黄色跳线]]', 'e11 → e16', '滑臂（[[node_n2|节点 N2]]）接到电感左脚所在列'],
            ['[[bb_l|10 mH 电感]]', 'c16 – c17', '串联在 N2 与 N3 之间'],
            ['[[bb_c|1 µF 薄膜电容]]', 'a17 → GND 轨', R`上端是 [[node_n3|N3 = $v_C$]]，下端直接插 GND 轨`],
            ['[[ch1_probe|CH1 探头]]', '探头尖 e10；[[ch1_clip|地夹]] GND 轨第 6 列', '看信号源输出端'],
            ['[[ch2_probe|CH2 探头]]', '探头尖 e17；[[ch2_clip|地夹]] GND 轨第 21 列', R`看电容电压 $v_C(t)$`],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 03 层拖 [[bench_r|R 总]] 或点 56 / 200 / 250 Ω，示波器屏幕上的 CH2 跟着从振铃变为干净的上升沿；再把 [[ch2_clip|CH2 地夹]]改到 N1、N2 或 N3 试试——台面会立刻切断激励并弹出红色安全拦截。03 层的 CH1 接在信号源输出端，每个边沿后会被 $50\ \Omega$ 内阻上的压降 $50\ \Omega \times i(t)$ 拉出一个小凹口；02 层的 CH1 是理想方波。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 6: decision tree and quiz */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '知识决策树与诊断测验',
      sync: { layer: L1, halo: ['step_1', 'step_2', 'step_3', 'step_4'], params: P() },
      blocks: [
        { kind: 'p', text: '**6.1 W4-L8 二阶阶跃与一般二阶电路求解决策树**' },
        { kind: 'figure', svg: SVG_TREE, caption: 'W4-L8 二阶阶跃与一般二阶电路求解总决策流程图' },
        {
          kind: 'p',
          text: '**6.2 诊断测验（4 题核心概念与计算检验）**：四道题覆盖本课四个考点——代初值必须带上稳态项、串联临界电阻、并联电阻的阻尼方向、一般混合电路的四步法。四题全部答对即通关本课，也为整个 World 4 收官。',
        },
      ],
      quiz: [
        {
          id: 'w4l8_q1',
          concept: '完全响应代入初值',
          review_act: 1,
          question:
            '某零初始储能串联 RLC 电路在 $t = 0$ 接入 $10\\text{ V}$ 阶跃电压源，已知其处于过阻尼态，特征根为 $s_1 = -2, s_2 = -5$。以下关于求取待定常数 $A_1, A_2$ 的方程组，哪一项完全正确？',
          options: [
            {
              key: 'A',
              text: R`$A_1 + A_2 = 0$ 且 $-2A_1 - 5A_2 = 0$`,
              correct: false,
              feedback: R`这正是“遗漏稳态项”的致命错：完全响应是 $v_C(t) = 10 + A_1 e^{-2t} + A_2 e^{-5t}$，$t = 0^+$ 时那个 $10$ 也在。只拿暂态项代零初值，会把 $A_1, A_2$ 全解成 0，电容电压一上电就跳到 $10\text{ V}$。`,
            },
            { key: 'B', text: R`$10 + A_1 + A_2 = 0$ 且 $-2A_1 - 5A_2 = 0$`, correct: true },
            {
              key: 'C',
              text: R`$10 + A_1 + A_2 = 10$ 且 $-2A_1 - 5A_2 = 10$`,
              correct: false,
              feedback: R`两个方程的右边都错了：零初始储能时 $v_C(0^+) = 0$（不是终值 $10\text{ V}$），导数初值 $v_C'(0^+) = i(0^+)/C = 0$（电感电流不突变）。`,
            },
            {
              key: 'D',
              text: R`$A_1 + A_2 = 10$ 且 $-2A_1 - 5A_2 = 0$`,
              correct: false,
              feedback: R`仍是只对暂态项代初值，而且符号也反了：把 $10 + A_1 + A_2 = 0$ 写完整，得到的是 $A_1 + A_2 = -10$，不是 $+10$。`,
            },
          ],
          feedback_correct: R`完全响应为 $v_C(t) = 10 + A_1 e^{-2t} + A_2 e^{-5t}$。零初始储能有 $v_C(0^+) = 0$ 和 $v_C'(0^+) = i(0^+)/C = 0$，必须连同稳态项 10 一起代入，得 $10 + A_1 + A_2 = 0$ 且 $-2A_1 - 5A_2 = 0$。A 选项是典型的遗漏稳态项致命错。`,
          feedback_wrong: R`先写出含稳态项的完全响应 $v_C(t) = 10 + A_1e^{-2t} + A_2e^{-5t}$，再代 $v_C(0^+)$ 与 $v_C'(0^+)$。`,
          figure: SVG_Q1,
          sync: { layer: L1, halo: ['step_4'], params: P({ view: '0p' }) },
        },
        {
          id: 'w4l8_q2',
          concept: '串联 RLC 临界阻尼',
          review_act: 2,
          question:
            '面包板串联 RLC 阶跃实验中，$L = 10\\text{ mH}$，$C = 1\\ \\mu\\text{F}$，信号源提供 0–5 V 方波。若要消除电容电压上升沿的所有过冲振铃，并获得无过冲前提下最快的上升速度，回路总电阻 $R$ 应调至多少？',
          options: [
            {
              key: 'A',
              text: '50 Ω',
              correct: false,
              feedback: R`$50\ \Omega$ 只有临界值的四分之一：$\alpha = R/(2L) = 2500 < \omega_0 = 10000$，仍是欠阻尼（$\zeta = 0.25$），过冲约 $44\%$。`,
            },
            {
              key: 'B',
              text: '100 Ω',
              correct: false,
              feedback: R`$100\ \Omega$ 时 $\zeta = 0.5$，仍是欠阻尼，过冲约 $16\%$。临界电阻是 $2\sqrt{L/C}$，别漏了因子 2。`,
            },
            { key: 'C', text: '200 Ω', correct: true },
            {
              key: 'D',
              text: '400 Ω',
              correct: false,
              feedback: R`$400\ \Omega$ 是过阻尼（$\zeta = 2$）：虽然无过冲，但慢根 $s_1 \approx -2680\text{ s}^{-1}$ 拖尾，上升比临界阻尼慢得多——“无过冲且最快”只有临界阻尼一个点。`,
            },
          ],
          feedback_correct: R`无过冲且最快收敛对应临界阻尼态 $\alpha = \omega_0$，即 $R_{\text{crit}} = 2\sqrt{L/C} = 2\sqrt{10\times10^{-3} / 1\times10^{-6}} = 2 \times 100 = 200\ \Omega$。`,
          feedback_wrong: R`令 $\alpha = R/(2L)$ 等于 $\omega_0 = 1/\sqrt{LC}$，解出 $R$。`,
          figure: SVG_Q2,
          sync: { layer: L2, halo: ['sc_r', 'sc_ch2'], params: P({ r: 56 }) },
        },
        {
          id: 'w4l8_q3',
          concept: '并联 RLC 阻尼方向',
          review_act: 3,
          question: '某并联 RLC 阶跃电路原本处于临界阻尼态。现保持 $L$、$C$ 与阶跃电流源 $I_s$ 不变，仅将并联电阻 $R$ 增大为原来的 2 倍，电路将进入哪种阻尼态？',
          options: [
            { key: 'A', text: '欠阻尼态（出现过冲与振铃）', correct: true },
            {
              key: 'B',
              text: '过阻尼态（响应变慢，无振荡）',
              correct: false,
              feedback: R`这是串联电路的直觉：只有串联 $\alpha = R/(2L)$ 才是 R 越大阻尼越强。并联 $\alpha = 1/(2RC)$，R 加倍让 $\alpha$ 减半，阻尼变弱。`,
            },
            {
              key: 'C',
              text: '仍保持临界阻尼态',
              correct: false,
              feedback: R`$\omega_0 = 1/\sqrt{LC}$ 确实不变，但 $\alpha = 1/(2RC)$ 跟着 R 变：R 加倍后 $\alpha = \omega_0/2$，不再等于 $\omega_0$。`,
            },
            {
              key: 'D',
              text: '变为无阻尼等幅振荡',
              correct: false,
              feedback: R`等幅振荡要求 $\alpha = 0$，即并联电阻开路（$R \to \infty$）。R 只是加倍，$\alpha$ 减半而不为零，振铃仍会衰减。`,
            },
          ],
          feedback_correct: R`并联 RLC 的阻尼系数 $\alpha = 1/(2RC)$。当 R 增大为 2 倍时，$\alpha$ 减小为原来的一半，导致 $\alpha < \omega_0$，电路进入欠阻尼态并出现过冲振铃。`,
          feedback_wrong: R`回到第 3 幕：并联电路里 R 是“旁路排水沟”，$\alpha = 1/(2RC)$。`,
          figure: SVG_Q3,
          sync: { layer: L1, halo: ['p_r'], params: P({ topo: 'parallel', view: 'zero' }) },
        },
        {
          id: 'w4l8_q4',
          concept: '一般二阶电路四步法',
          review_act: 4,
          question:
            '在一般混合二阶电路中（$V_s = 12\\text{ V}$ 经 $R_1 = 4\\ \\Omega$ 与 $L = 1\\text{ H}$ 串联后，接至 $R_2 = 2\\ \\Omega$ 与 $C = 0.5\\text{ F}$ 的并联组合），在运用 Section 8.7 通用四步法求暂态特征方程与稳态电容电压 $v_C(\\infty)$ 时，正确的结果是：',
          options: [
            {
              key: 'A',
              text: R`特征方程 $s^2 + 4s + 2 = 0$，$v_C(\infty) = 12\text{ V}$`,
              correct: false,
              feedback: R`这是把纯串联公式 $s^2 + (R_1/L)s + 1/(LC)$ 硬套上来：漏掉了并联通道 $1/(R_2C)$ 和 $R_2$ 对常数项的贡献；$v_C(\infty) = 12\text{ V}$ 又忽略了稳态电流 $2\text{ A}$ 在 $R_1$ 上的 $8\text{ V}$ 压降。`,
            },
            {
              key: 'B',
              text: R`特征方程 $s^2 + 5s + 6 = 0$，$v_C(\infty) = 8\text{ V}$`,
              correct: false,
              feedback: R`特征方程对了，稳态电压却取成了 $R_1$ 上的压降：$v_C$ 是 $R_2$ 两端的电压，$12 \times \frac{2}{4+2} = 4\text{ V}$，不是 $12 \times \frac{4}{4+2} = 8\text{ V}$。`,
            },
            {
              key: 'C',
              text: R`特征方程 $s^2 + 6s + 5 = 0$，$v_C(\infty) = 4\text{ V}$`,
              correct: false,
              feedback: R`一次项与常数项对调了：一次项是两条阻尼通道之和 $R_1/L + 1/(R_2C) = 4 + 1 = 5$，常数项是 $(R_1 + R_2)/(R_2LC) = 6$。`,
            },
            { key: 'D', text: R`特征方程 $s^2 + 5s + 6 = 0$，$v_C(\infty) = 4\text{ V}$`, correct: true },
          ],
          feedback_correct: R`独立源置零消元得 $s^2 + (R_1/L + 1/(R_2 C))s + (R_1 + R_2)/(R_2 L C) = s^2 + 5s + 6 = 0$；直流稳态时电感短路、电容开路，$v_C(\infty) = 12 \times 2 / (4 + 2) = 4\text{ V}$。`,
          feedback_wrong: R`按第 4 幕的四步法：源置零消元求特征方程，再令 $t \to \infty$ 做纯电阻分压。`,
          figure: SVG_Q4,
          sync: { layer: L1, halo: ['g_r1', 'g_r2'], params: P({ topo: 'general', view: '0m', hide: true }) },
        },
      ],
      after_quiz: [
        { kind: 'p', text: '**World 4 收官 · 承上启下：通往 World 5 交流正弦稳态**' },
        {
          kind: 'ul',
          items: [
            R`到这里，World 4 的储能元件与一阶 / 二阶暂态全部打通：无论电路是一阶还是二阶、纯串、纯并还是混合，**先锁初值、再求特征根、再定稳态、最后把初值代入完全响应**，这套流程不会变。`,
            R`**预告 W5-L1（正弦信号与相量）**：今天的激励是“一跳就停”的直流阶跃；World 5 换成永不停歇的正弦波 $V_m\cos(\omega t + \phi)$。暂态衰减完之后剩下的正弦稳态，可以用旋转相量 $\mathbf{V} = V_m\angle\phi$ 一笔算出，不再解微分方程。`,
            R`**预告 W5-L8（串联与并联谐振）**：今天反复出现的 $\omega_0 = 1/\sqrt{LC}$（面包板上 $10000\text{ rad/s} \approx 1.59\text{ kHz}$）会以“谐振频率”的身份回来：用函数信号发生器扫频，你会在同一块 RLC 面包板上看到响应在 $\omega_0$ 附近冲到最大。`,
          ],
        },
      ],
    },
  ],
};

export default W4_L8;
