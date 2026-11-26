// W5-L2 · 元件相量关系、复阻抗与 3D 面包板 RC 相移实操 (lesson sheet: docs/lessons/W5-L2.md). The
// professor's text of the six acts, the figures, the guided example and the self-test are
// reproduced from the sheet; [[id|…]] only links a term to the stage (the words are unchanged).
// Changes of form:
// - the opening remarks open act 1; the sheet's numbered sub-headings are bold lines (without
//   "内联 2D 矢量图：" / "内联 2D 原理图：" / "JSON"); display formulas sit in ① / ② / ③ cards (a
//   lead-in sentence becomes the card title); the "例题" and "警示 / 点睛 / 禁令" quotes are notes;
//   nested bullet lists are flattened into a lead line and a list;
// - act 6 drops the sheet's developer checklist (6.4) and with it "工程落地清单" from its title; the
//   sheet's safety block (breadboard_safety_and_scaling) is a table in act 5; the W5-L3 preview
//   follows the self-test (after_quiz; the sheet only names W5-L3 in the checklist);
// - the guided example (30 cos(200t + 20°) V network) shares no problem with any ③ card, so no card
//   moves; its step diagrams only ask, and the 01 layer's "引导例题" page hides its numbers until
//   the example reaches them (gReveal, uncovered by done_params).
// Changes of content:
// - act 5.1 ①: "电流会飙升至 2.5 A … 瞬间烧毁" ignored the generator's own 50 Ω: with it the current
//   is only ≈ 96 mA and the output collapses to ≈ 0.19 V; the text now says 2.5 A is what an ideal
//   source would need, and what really happens with the 50 Ω generator;
// - act 2.4's figure drew Z at 32° and the triangle at 47° (mixed scales), both labelled 53.13°:
//   redrawn to scale (svgs.ts);
// - the 01 layer's ω slider spans 10 … 10⁵ rad/s (the sheet's 100 … 10⁵ leaves out act 3's
//   ω = 50 rad/s).
// Added: stage tips under acts 1–5, per-option intercepts for the guided example (the sheet gives
// one intercept per step) and per-option quiz feedback written from the sheet's explanations, quiz
// figures, the guided example's conclusion; the quiz's right answers (all B in the sheet) are
// spread over A–D.

import { lazy } from 'react';
import { BENCH_NAMES } from '../../benchNames';
import { genericLabel } from '../../breadboardIds';
import { lightSvg } from '../../svgTheme';
import type { StageLesson, StageSync } from '../../types';
import {
  MINI_STEP1,
  MINI_STEP2,
  MINI_STEP3,
  MINI_STEP4,
  MINI_STEP5,
  SVG_EX_PROBLEM,
  SVG_GROUND,
  SVG_MIX,
  SVG_Q1,
  SVG_Q2,
  SVG_Q3,
  SVG_Q4,
  SVG_RLC_ANGLES,
  SVG_SCOPE_DARK,
  SVG_Z_TRIANGLE,
} from './svgs';

const Phasors = lazy(() => import('./Phasors'));
const Scope = lazy(() => import('./Scope'));
const Bench3D = lazy(() => import('./Bench3D'));

const R = String.raw;
/** inline code inside String.raw text */
const code = (s: string) => '`' + s + '`';

const L1 = 'layer_01';
const L2 = 'layer_02';
const L3 = 'layer_03';

const GEN = BENCH_NAMES.generator;
const SCOPE = BENCH_NAMES.scope;

/** act 4's scope figure on the light theme; its two legend texts (#fef08a, #a5f3fc) are not in
 *  lightSvg's text table, so they get their deep shades here */
const SCOPE_LIGHT = lightSvg(SVG_SCOPE_DARK).replace('fill="#fef08a"', 'fill="#a16207"').replace('fill="#a5f3fc"', 'fill="#0e7490"');

/** every act sets the whole stage, so scrolling back restores it */
const P = (p: Record<string, unknown> = {}): StageSync['params'] => ({ elem: 'L', omega: 4000, freq: 1000, rval: 1600, ch2: 'vc', clip2: 'gnd', ...p });
/** guided example: the 01 layer's guided page, and how far the example has got */
const GD = (reveal: number): StageSync['params'] => ({ elem: 'ex', omega: 200, gReveal: reveal });

const W5_L2: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Phasors, [L2]: Scope, [L3]: Bench3D },
  describeTarget: (id) => genericLabel(id),
  lesson_meta: {
    lesson_id: 'W5-L2',
    world: 'World 5',
    title: '元件相量关系、复阻抗与 3D 面包板 RC 相移实操',
    subtitle: '从 d/dt ↔ jω 推出 R、L、C 的频域欧姆定律，到复阻抗 / 复导纳、频域 KCL·KVL 混联化简，再到双通道示波器读相与面包板 RC 相移实操',
    lesson_type: 'D',
    lesson_type_label: 'Type D（动态相移示波器 + 3D 面包板 RC 相移实操课）',
    estimated_minutes: 55,
    textbook_primary: {
      book: 'Alexander, Sadiku & Fredette, Fundamentals of Electric Circuits, 2026 Release',
      sections: ['Section 9.4 Phasor Relationships for Circuit Elements', 'Section 9.5 Impedance and Admittance', 'Section 9.6 Impedance Combinations'],
    },
    textbook_supplement: 'Boylestad, Introductory Circuit Analysis, 14th Ed., Chapter 15 Series and Parallel AC Circuits（感抗 / 容抗频率依赖直觉与 ELI the ICE man 记忆锚点）',
    prerequisites: ['W1-L7 分压分流', 'W4-L1 电容与储能动态特性', 'W4-L2 电感与磁通储能特性', 'W5-L1 正弦稳态与相量变换'],
    learning_objectives: [
      R`运用相量微分法则（$\frac{d}{dt} \leftrightarrow j\omega$）严格推导出 R、L、C 三大元件的频域欧姆定律与复阻抗表达式。`,
      R`辨析复阻抗 $\mathbf{Z} = R + jX$ 与复导纳 $\mathbf{Y} = G + jB$ 的物理本质，明确 $\mathbf{Z}$ 是复数算子而非相量，规避 $G = 1/R$ 的经典误区。`,
      '将直流 KCL、KVL、串并联及分压分流公式全面升级至复数域，独立完成混联 RLC 复阻抗化简与时域波形还原。',
      R`在 2D 双通道示波器与 3D 面包板 RC 相移实操中，通过时差 $\Delta t$ 精确换算相移 $\Delta\phi$，并严格遵守双通道探头共地安全红线。`,
    ],
    next_lesson: 'W5-L3',
    next_lesson_title: '交流稳态节点分析法与网孔分析法',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 复阻抗相量',
        short: '01 复阻抗相量',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '01 2D 复阻抗原理图与元件相量矢量：切换 R / L / C、串联 RLC、混联例题与引导例题，拖角频率 ω；左为频域等效电路，中为同速旋转的电压 / 电流相量（含 V/I 夹角），右为复阻抗平面（阻抗三角形）。',
      },
      {
        id: L2,
        label: '02 双通道示波器',
        short: '02 双通道示波器',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 实时双通道示波器（CH1 输入正弦 vs CH2 电容 / 电阻滞后 / 超前相移波形）：R = 1.6 kΩ（或 1.5 kΩ）、C = 100 nF，拖频率 f；CH2 可看 v_C、对调 R/C 看 v_R 或开 MATH；可拖动时间游标 Δt，自动读出 Δφ = −(Δt/T) × 360°。',
      },
      {
        id: L3,
        label: '03 3D 面包板实操',
        short: '03 3D 实操',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption:
          '03 3D 面包板 RC 相移电路 + 信号发生器与双通道示波器实操：830 孔面包板上的 1.6 kΩ 色环电阻与 100 nF 陶瓷电容，函数信号发生器 BNC 鳄鱼夹与双通道示波器探头；拖频率旋钮扫频，试着把 CH2 地夹挪到 R–C 节点看红灯告警。',
      },
    ],
    hover_map: {
      // 01 layer
      el_src: { label: '正弦激励源', desc: '单元件与串联 RLC 页：v(t) = 12cos(ωt + 30°) V（例题 1.1），相量 V = 12∠30° V；混联页 30∠10° V，引导例题页 30∠20° V' },
      el_elem: { label: '被测元件', desc: '电阻 R = 30 Ω、电感 L = 5 mH 或电容 C = 10 µF；下方写着它在当前 ω 下的复阻抗' },
      p_v: { label: '电压相量 V', desc: '旋转相量 V e^{jωt}（动画放慢）：它在实轴上的投影就是瞬时值 v(t)' },
      p_i: { label: '电流相量 I = V / Z', desc: '与 V 同速旋转：两者夹角恒等于阻抗角 θ_Z，转动时不变' },
      p_ia: { label: '感性支路电流 I_A', desc: '例题 3.1：流过 R₂ + L 支路，I_A = Z_B/(Z_A + Z_B) · I' },
      p_ib: { label: '容性支路电流 I_B', desc: '例题 3.1：流过 C₂ 支路，I_B = Z_A/(Z_A + Z_B) · I；与 I_A 相差 126.87°，所以两支路电流都可以比干路大' },
      p_kcl: { label: '频域 KCL 平行四边形', desc: 'I = I_A + I_B 是复数（矢量）相加，不是幅值相加' },
      p_angle: { label: 'V 与 I 的夹角 θ_Z', desc: 'φ_v − φ_i = θ_Z：电阻 0°，电感 +90°（ELI），电容 −90°（ICE）' },
      z_vec: { label: '复阻抗 Z = R + jX', desc: '静态的复数算子（不是相量，不旋转）：把电流相量缩放 |Z| 倍、旋转 θ_Z 得到电压相量' },
      z_r: { label: '实部 R（电阻）', desc: '串联 RLC：R = 30 Ω，沿实轴，与 ω 无关' },
      z_xl: { label: '感抗 +jX_L = jωL', desc: '正虚轴，随 ω 线性增大；例题 2.1：ω = 1000 rad/s 时 +j80 Ω' },
      z_xc: { label: '容抗 −jX_C = −j/(ωC)', desc: '负虚轴，随 ω 增大而减小；例题 2.1：ω = 1000 rad/s 时 −j40 Ω' },
      z_1: { label: '干路串联块 Z₁', desc: '混联页：Z₁ = R₁ + 1/(jωC₁)；引导例题页：Z₁ = R₁ + jωL₁' },
      z_p: { label: '并联块 Z_p', desc: '积除以和：Z_p = Z_A Z_B/(Z_A + Z_B)，分子分母同乘分母的共轭' },
      z_eq: { label: '总复阻抗 Z_eq = Z₁ + Z_p', desc: '串联叠加：实部加实部、虚部加虚部' },
      c_x: { label: '电抗 X', desc: 'X_L = ωL，X_C = 1/(ωC)：拖 ω 看它们一个上升一个下降' },
      c_y: { label: '复导纳 Y = 1/Z = G + jB', desc: '分母有理化：G = R/(R² + X²)，B = −X/(R² + X²)；X ≠ 0 时 G ≠ 1/R' },
      c_nature: { label: '负载性质', desc: 'X > 0 感性（电流滞后），X < 0 容性（电流超前），X = 0 纯阻性（谐振）' },
      c_omega: { label: '角频率 ω 滑块', desc: '10 … 10⁵ rad/s（对数刻度）；快捷挡是各例题的 ω' },
      c_it: { label: '时域电流 i(t)', desc: '逆相量变换：i(t) = Re{I e^{jωt}} = I_m cos(ωt + φ_i)' },
      mx_r1: { label: 'R₁ = 2 Ω', desc: '例题 3.1 干路电阻' },
      mx_c1: { label: 'C₁ = 5 mF', desc: 'ω = 50 rad/s 时 −j4 Ω' },
      mx_r2: { label: 'R₂ = 8 Ω', desc: '支路 A 的电阻（与 L 串联）' },
      mx_l: { label: 'L = 120 mH', desc: 'ω = 50 rad/s 时 +j6 Ω' },
      mx_c2: { label: 'C₂ = 2 mF', desc: '支路 B：ω = 50 rad/s 时 −j10 Ω' },
      ex_r1: { label: 'R₁ = 3 Ω', desc: '引导例题干路电阻' },
      ex_l1: { label: 'L₁ = 55 mH', desc: '引导例题干路电感：它在 ω = 200 rad/s 下的复阻抗是第 1 步要求的' },
      ex_r2: { label: 'R₂ = 10 Ω', desc: '引导例题并联支路的电阻' },
      ex_c: { label: 'C = 500 µF', desc: '引导例题并联支路的电容：它的复阻抗是第 1 步要求的' },
      // 02 layer
      sc_freq: { label: '信号发生器频率 f', desc: '100 Hz … 10 kHz（对数刻度）；1 kHz 时 X_C ≈ R，相移正好约 −45°' },
      sc_ch1: { label: 'CH1 输入 v_in(t)', desc: '黄色：信号发生器输出，5.0 V 峰值（10 Vpp）正弦，作为相位参考 0°' },
      sc_ch2: { label: 'CH2 v_C(t) 或 v_R(t)', desc: '青色：探针挂在 R–C 中间节点 OUT。R 在上时是 v_C（滞后）；对调 R、C 后是 v_R（超前）' },
      sc_math: { label: 'MATH = CH1 − CH2', desc: '示波器内部差分：v_in − v_C = v_R，不动电路、不动地夹就能看电阻电压' },
      sc_dt: { label: '峰值时差 Δt', desc: 'Δt = t_CH2,peak − t_CH1,peak：右移为正（滞后），左移为负（超前）' },
      sc_T: { label: '周期 T = 1/f', desc: 'Δφ = −(Δt/T) × 360°：1 kHz 时 T = 1 ms = 4 格（250 µs/div）' },
      sc_cursor: { label: '时间游标 A / B', desc: '游标 A 固定在 CH1 第一个波峰；拖动游标 B，读出 Δt 与对应的 Δφ' },
      c_xc: { label: '容抗 X_C = 1/(2πfC)', desc: '1 kHz、100 nF 时 1591.55 Ω ≈ 1.59 kΩ' },
      c_gain: { label: '幅值比 |H|', desc: '|H_C| = 1/√(1 + (ωRC)²)；R = 1.6 kΩ、1 kHz 时 0.7052' },
      c_phase: { label: '相移 Δφ', desc: 'Δφ_C = −arctan(ωRC)，Δφ_R = 90° − arctan(ωRC)' },
      // 03 layer
      bb_gen: {
        label: `${GEN}（正弦 1 kHz · 10 Vpp）`,
        desc: '正弦 5.0 V 峰值、直流偏置 0 V、输出阻抗 50 Ω，经 BNC 转鳄鱼夹接入：红夹 e10（IN），黑夹 GND 轨。本实验不用直流电源',
      },
      bb_knob: { label: '频率旋钮', desc: '拖动旋钮（或滑块）在 100 Hz … 10 kHz 间扫频：屏幕上的 CH2 跟着变小、右移' },
      bb_scope: { label: SCOPE, desc: 'CH1 看 IN，CH2 看 OUT；两通道 2.5 V/div，时基取约 1/4 周期一格；两只黑色地夹在机箱内经 BNC 外壳连到市电保护地 PE' },
      bb_r: { label: '1.6 kΩ 金属膜电阻（可换 1.5 kΩ）', desc: '1.6 kΩ ±1%（E24）五环 棕-蓝-黑-棕-棕；备选 1.5 kΩ ±5%（E12）四环 棕-绿-红-金；1/4 W' },
      bb_c: { label: '100 nF 陶瓷电容（104）', desc: '无极性，耐压 50 V；1 kHz 时容抗 1591.55 Ω' },
      bb_jumper: { label: '黑色跳线 b15 → GND 轨', desc: '第 15 列是接地端：把电容的下端（对调后是电阻的下端）接到 GND 轨' },
      rail_gnd: { label: 'GND 公共地轨（顶部内侧）', desc: '信号源黑夹、CH1 与 CH2 两只地夹、电容下端都接这里：三地合一' },
      node_in: { label: '输入节点 IN', desc: '第 10 列：信号源红夹、电阻上端、CH1 探针' },
      node_out: { label: 'R–C 中间节点 OUT', desc: 'CH2 探针挂这里。它是浮地节点：严禁把 CH2 地夹夹在这里' },
      ch1_probe: { label: 'CH1 探针', desc: '探针尖钩在 IN（a10）：看 v_in(t)。信号源 50 Ω 内阻让它略低于 5 V' },
      ch2_probe: { label: 'CH2 探针', desc: '探针尖钩在 OUT：R 在上时看 v_C(t)，对调后看 v_R(t)' },
      ch1_clip: { label: 'CH1 黑色地夹', desc: '夹在 GND 轨（第 6 列的短跳线）' },
      ch2_clip: { label: 'CH2 黑色地夹', desc: '只能夹 GND 轨：它与 CH1 地夹、市电保护地 PE 在机箱内直接连通，夹到 OUT 会把下面的元件短路' },
      bench_i: { label: '回路电流', desc: '1 kHz、1.6 kΩ：峰值约 2.18 mA，有效值约 1.54 mA（计入信号源 50 Ω 内阻；理想 5 V 源时为 2.22 / 1.57 mA）' },
      bench_p: { label: '电阻功耗', desc: 'P = I_rms² R ≈ 3.8 mW（理想 5 V 源时 3.93 mW），远低于 1/4 W 额定（不足 1.6%）' },
      safety_note: { label: '安全与缩放', desc: '函数信号发生器 10 Vpp 正弦激励，不用直流电源；R 取 kΩ 级、C 取 100 nF，电流只有毫安级' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '从微积分到复代数——三大元件的相量关系与 ELI the ICE man',
      sync: { layer: L1, halo: ['p_v', 'p_i', 'p_angle'], params: P({ elem: 'L', omega: 4000 }) },
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：同学们，上一讲（W5-L1）我们刚拿到了一把极其锋利的“魔法钥匙”——**相量变换**，它能把时域里烦人的微积分运算 $d/dt$ 变成乘以 $j\omega$。今天这节课，我们要用这把钥匙，把整门交流电路分析的大门彻底推开！你将亲眼见证：电阻、电感、电容这三位脾气截然不同的主角，如何在频域里被统一收编到**[[z_vec|复阻抗 $\mathbf{Z}$]]** 的麾下；更棒的是，我们还要亲自在 3D 面包板上搭出 RC 相移电路，接上双通道示波器，亲眼盯着屏幕上那条滞后整整 $-45^\circ$、幅值缩到 $0.707$ 倍的青色正弦波。准备好了吗？让我们从第一幕开始！`,
        },
        { kind: 'p', text: '**1.1 为什么交流电路里不能再只用“电阻”说话？**' },
        {
          kind: 'p',
          text: R`在第四周（W4-L1/L2）我们吃过苦头：一旦电路里出现电感 $L$ 和电容 $C$，电压和电流的关系就不再是简单的比例常数，而是带有时间导数的微分方程：`,
        },
        { kind: 'ul', items: [R`电阻：$v(t) = R\,i(t)$`, R`电感：$v(t) = L\frac{di(t)}{dt}$`, R`电容：$i(t) = C\frac{dv(t)}{dt}$`] },
        {
          kind: 'p',
          text: R`只要处于**正弦稳态**，根据 W5-L1 建立的相量微分法则 $\frac{d}{dt} \longleftrightarrow j\omega$，时域里所有的导数瞬间坍缩为复平面上的**代数乘法**。请看黑板上的三段式严格推导！`,
        },
        { kind: 'p', text: '**1.2 三段式教授板书推导：三大元件频域欧姆定律与单元件激励求解**' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**例题 1.1**：已知[[el_src|正弦电压源 $v(t) = 12\cos(4000t + 30^\circ)\text{ V}$]]，分别单独施加在 $L = 5\text{ mH}$ 的纯电感与 $C = 10\ \mu\text{F}$ 的纯电容两端。试从元件时域伏安关系出发，推导频域相量关系，并求出稳态电流 $i_L(t)$ 与 $i_C(t)$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源（Axiomatic Origin）',
          text: R`依据三大理想无源元件的时域本构方程及正弦稳态相量映射 $\mathcal{P}\{x(t)\} = \mathbf{X}$、$\mathcal{P}\{\frac{dx}{dt}\} = j\omega\mathbf{X}$：电阻本构方程 $v_R(t) = R\,i_R(t)$；电感本构方程 $v_L(t) = L\frac{di_L(t)}{dt}$；电容本构方程 $i_C(t) = C\frac{dv_C(t)}{dt}$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（Pure Symbolic Derivation）：对上述三式两端分别取相量变换，整理出[[p_v|电压相量 $\mathbf{V}$]] 与[[p_i|电流相量 $\mathbf{I}$]] 的比值（定义该比值为复阻抗 $\mathbf{Z} \triangleq \frac{\mathbf{V}}{\mathbf{I}}$）。1. **电阻元件**`,
          tex: R`\mathbf{V}_R = R\,\mathbf{I}_R \implies \mathbf{Z}_R = \frac{\mathbf{V}_R}{\mathbf{I}_R} = R = R\angle 0^\circ`,
        },
        { kind: 'p', text: R`电压与电流**同相**（相位差 $0^\circ$），与角频率 $\omega$ 无关。` },
        {
          kind: 'formula',
          title: '2. **电感元件**',
          tex: R`\mathbf{V}_L = j\omega L\,\mathbf{I}_L \implies \mathbf{Z}_L = \frac{\mathbf{V}_L}{\mathbf{I}_L} = j\omega L = \omega L\angle 90^\circ, \qquad X_L \triangleq \omega L`,
        },
        {
          kind: 'formula',
          title: R`其中 $X_L = \omega L$ 称为**[[c_x|感抗（Inductive Reactance）]]**。因为乘以 $j = 1\angle 90^\circ$，所以**电感电压超前电流 $90^\circ$**。由此得纯电感电流相量通式`,
          tex: R`\mathbf{I}_L = \frac{\mathbf{V}}{\mathbf{Z}_L} = \frac{V_m\angle\phi_v}{\omega L\angle 90^\circ} = \frac{V_m}{\omega L}\angle(\phi_v - 90^\circ)`,
        },
        {
          kind: 'formula',
          title: '3. **电容元件**',
          tex: R`\mathbf{I}_C = j\omega C\,\mathbf{V}_C \implies \mathbf{Z}_C = \frac{\mathbf{V}_C}{\mathbf{I}_C} = \frac{1}{j\omega C} = -\frac{j}{\omega C} = \frac{1}{\omega C}\angle -90^\circ, \qquad X_C \triangleq \frac{1}{\omega C}`,
        },
        {
          kind: 'formula',
          title: R`其中 $X_C = \frac{1}{\omega C}$ 称为**容抗（Capacitive Reactance）**。因为乘以 $-j = 1\angle -90^\circ$，所以**电容电流超前电压 $90^\circ$**（即电压滞后电流 $90^\circ$）。由此得纯电容电流相量通式`,
          tex: R`\mathbf{I}_C = \frac{\mathbf{V}}{\mathbf{Z}_C} = j\omega C\,\mathbf{V} = \omega C V_m\angle(\phi_v + 90^\circ)`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（Numerical Substitution & Simplification）',
          steps: [
            {
              label: '提取频域参数',
              text: R`从 $v(t) = 12\cos(4000t + 30^\circ)\text{ V}$ 提取频域参数：$V_m = 12\text{ V}$，$\phi_v = 30^\circ$，$\omega = 4000\text{ rad/s}$，电压相量 $\mathbf{V} = 12\angle 30^\circ\text{ V}$。`,
            },
            {
              label: R`**电感支路**（$L = 5\times 10^{-3}\text{ H}$）`,
              tex: R`X_L = (4000)(5\times 10^{-3}) = 20\ \Omega \implies \mathbf{Z}_L = j20 = 20\angle 90^\circ\ \Omega`,
            },
            { label: '', tex: R`\mathbf{I}_L = \frac{12\angle 30^\circ}{20\angle 90^\circ} = 0.60\angle(30^\circ - 90^\circ) = 0.60\angle -60^\circ\text{ A}` },
            { label: '还原至时域', tex: R`i_L(t) = 0.60\cos(4000t - 60^\circ)\text{ A}` },
            {
              label: R`**电容支路**（$C = 10\times 10^{-6}\text{ F}$）`,
              tex: R`X_C = \frac{1}{(4000)(10\times 10^{-6})} = \frac{1}{0.04} = 25\ \Omega \implies \mathbf{Z}_C = -j25 = 25\angle -90^\circ\ \Omega`,
            },
            { label: '', tex: R`\mathbf{I}_C = \frac{12\angle 30^\circ}{25\angle -90^\circ} = 0.48\angle(30^\circ - (-90^\circ)) = 0.48\angle 120^\circ\text{ A}` },
            { label: '还原至时域', tex: R`i_C(t) = 0.48\cos(4000t + 120^\circ)\text{ A}` },
          ],
        },
        { kind: 'p', text: '**1.3 Boylestad 频率直觉与“ELI the ICE man”记忆锚点**' },
        { kind: 'p', text: '同学们千万别死背正负号！Boylestad 第 15 章给出了电路工程师一生受用的两个超级直觉：' },
        { kind: 'p', text: R`1. **口诀锚点——“ELI the ICE man”**（$E$ 代表电动势/电压，$I$ 代表电流）：` },
        {
          kind: 'ul',
          items: [
            R`**E-L-I**：在电感（**L**）中，**E（电压）在 I（电流）前面** $\implies$ 电压超前电流 $90^\circ$（因为电感阻碍电流突变，电流总是慢半拍！）。`,
            R`**I-C-E**：在电容（**C**）中，**I（电流）在 E（电压）前面** $\implies$ 电流超前电压 $90^\circ$（因为电容必须先充进电流，极板电压才能慢慢抬升！）。`,
          ],
        },
        { kind: 'p', text: '2. **极端频率的物理直觉**：' },
        {
          kind: 'ul',
          items: [
            R`**直流极限（$\omega \to 0$）**：$X_L = \omega L \to 0$（电感变**短路**导线）；$X_C = \frac{1}{\omega C} \to \infty$（电容变**开路**断线）。`,
            R`**高频极限（$\omega \to \infty$）**：$X_L = \omega L \to \infty$（电感变**开路**阻断高频）；$X_C = \frac{1}{\omega C} \to 0$（电容变**短路**旁路高频）。`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 01 层切换[[el_elem|电阻 / 电感 / 电容]]：[[p_v|V]] 与 [[p_i|I]] 一起旋转，[[p_angle|夹角]]始终是 $0^\circ$、$+90^\circ$ 或 $-90^\circ$；把 [[c_omega|ω 滑块]]拖向两端，看 [[c_x|感抗 / 容抗]]怎样一个趋于 0、一个趋于 $\infty$。`,
        },
        { kind: 'p', text: '**1.4 R / L / C 三元件相量电压-电流夹角对比**' },
      ],
      inline_svg: SVG_RLC_ANGLES,
      figure_caption: 'R、L、C 三大元件相量电压电流夹角对比（以电流相量 I 为 0° 参考基准）',
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: R`复阻抗 $\mathbf{Z}$ 与复导纳 $\mathbf{Y}$——非相量的复数算子`,
      sync: { layer: L1, halo: ['z_vec', 'z_r', 'z_xl', 'z_xc'], params: P({ elem: 'RLC', omega: 1000 }) },
      blocks: [
        { kind: 'p', text: R`**2.1 核心概念警示：复阻抗 $\mathbf{Z}$ 绝对不是相量！**` },
        { kind: 'p', text: '在 Sadiku Section 9.5 中，有一句每个电路学教授都会拍着黑板强调三遍的铁律：' },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**概念红线警示**：尽管[[z_vec|复阻抗 $\mathbf{Z} = R + jX = |\mathbf{Z}|\angle\theta_Z$]] 和相量一样写成复数与极坐标形式，但 **$\mathbf{Z}$ 本身不是相量（NOT a phasor）**！`,
        },
        {
          kind: 'formula',
          title: R`**为什么？** 相量 $\mathbf{V}$ 与 $\mathbf{I}$ 背后隐含了旋转因子 $e^{j\omega t}$，它们对应着真实的时域正弦波 $v(t)$ 和 $i(t)$。当你把两个旋转速度相同的相量相除时`,
          tex: R`\mathbf{Z} = \frac{\mathbf{V}\,e^{j\omega t}}{\mathbf{I}\,e^{j\omega t}} = \frac{\mathbf{V}}{\mathbf{I}}`,
        },
        { kind: 'p', text: R`时间因子 $e^{j\omega t}$ 被**彻底约掉了**！` },
        {
          kind: 'p',
          text: R`**本质是什么？** $\mathbf{Z}$ 是一个**静态的频域复数算子（Complex Operator）**。它不随时间旋转，也没有所谓的“时域阻抗正弦波 $z(t)$”；它的物理职责是把电流相量缩放 $|\mathbf{Z}|$ 倍、并旋转 $\theta_Z$ 角度，从而映射出电压相量。`,
        },
        {
          kind: 'table',
          head: [R`复阻抗 $\mathbf{Z} = R + jX$`, '虚部符号', '负载性质', '电压与电流相位关系', R`复导纳 $\mathbf{Y} = G + jB$ 虚部符号`],
          rows: [
            [R`$X > 0$（感抗占优）`, R`$+j$`, '**感性负载（Inductive）**', '电流滞后电压（Lagging）', R`$B < 0$（感纳为负）`],
            [R`$X < 0$（容抗占优）`, R`$-j$`, '**容性负载（Capacitive）**', '电流超前电压（Leading）', R`$B > 0$（容纳为正）`],
            [R`$X = 0$（感容抵消）`, R`$0$`, '**纯阻性 / 谐振（Resistive）**', '电流与电压同相', R`$B = 0$`],
          ],
        },
        { kind: 'p', text: R`**2.2 复导纳 $\mathbf{Y}$ 与“$G \neq 1/R$”的高频陷阱**` },
        {
          kind: 'formula',
          title: R`在并联电路中，用复阻抗的倒数——**[[c_y|复导纳（Admittance）]]** $\mathbf{Y} = \frac{1}{\mathbf{Z}} = G + jB$（单位：西门子 $\text{S}$）往往更顺手。但请务必盯紧分母有理化`,
          tex: R`\mathbf{Y} = \frac{1}{R + jX} = \frac{R - jX}{R^2 + X^2} = \underbrace{\frac{R}{R^2 + X^2}}_{G\text{ (电导)}} + j\underbrace{\left(\frac{-X}{R^2 + X^2}\right)}_{B\text{ (电纳)}}`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**高频易错预警**：只要电抗 $X \neq 0$，就有 **$G \neq \frac{1}{R}$** 且 **$B \neq \frac{1}{X}$**！千万不要分别对实部和虚部直接取倒数！`,
        },
        { kind: 'p', text: '**2.3 三段式教授板书推导：串联 RLC 复阻抗与复导纳互化**' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**例题 2.1**：一个串联 RLC 支路包含 [[z_r|$R = 30\ \Omega$]]、[[z_xl|$L = 80\text{ mH}$]]、[[z_xc|$C = 25\ \mu\text{F}$]]，工作在角频率 $\omega = 1000\text{ rad/s}$ 下。求该支路的等效复阻抗 $\mathbf{Z}$（直角与极坐标形式）及等效复导纳 $\mathbf{Y} = G + jB$，并判断电路的感/容性质。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`依据串联复阻抗叠加律与复导纳定义：$\mathbf{Z} = \mathbf{Z}_R + \mathbf{Z}_L + \mathbf{Z}_C$，$\mathbf{Y} = \frac{1}{\mathbf{Z}} = G + jB$`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式：代入三元件频域阻抗表达式，分离实部与虚部',
          tex: R`\mathbf{Z} = R + j\omega L + \frac{1}{j\omega C} = R + j\left(\omega L - \frac{1}{\omega C}\right) = R + j(X_L - X_C) \triangleq R + jX`,
        },
        { kind: 'formula', title: '其极坐标模与阻抗角为', tex: R`|\mathbf{Z}| = \sqrt{R^2 + X^2}, \qquad \theta_Z = \arctan\left(\frac{X}{R}\right)` },
        { kind: 'formula', title: '复导纳的直角与极坐标通式为', tex: R`\mathbf{Y} = \frac{R}{R^2 + X^2} - j\frac{X}{R^2 + X^2} = \frac{1}{|\mathbf{Z}|}\angle(-\theta_Z)` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`1. 计算感抗与容抗（$\omega = 1000\text{ rad/s}$）`,
              tex: R`X_L = (1000)(80\times 10^{-3}) = 80\ \Omega, \qquad X_C = \frac{1}{(1000)(25\times 10^{-6})} = 40\ \Omega`,
            },
            { label: '', text: R`净电抗 $X = X_L - X_C = 80 - 40 = +40\ \Omega > 0$（呈**感性**）。` },
            { label: '2. 合成复阻抗', tex: R`\mathbf{Z} = 30 + j40\ \Omega` },
            { label: '', tex: R`|\mathbf{Z}| = \sqrt{30^2 + 40^2} = 50\ \Omega, \qquad \theta_Z = \arctan\left(\frac{40}{30}\right) = 53.13^\circ` },
            { label: '', tex: R`\mathbf{Z} = 50\angle 53.13^\circ\ \Omega` },
            { label: '3. 求解复导纳', tex: R`G = \frac{30}{30^2 + 40^2} = \frac{30}{2500} = 0.012\text{ S} = 12\text{ mS}` },
            { label: '', tex: R`B = \frac{-40}{30^2 + 40^2} = \frac{-40}{2500} = -0.016\text{ S} = -16\text{ mS}` },
            { label: '', tex: R`\mathbf{Y} = 0.012 - j0.016 = 0.020\angle -53.13^\circ\text{ S}` },
            { label: '', text: R`（顺手核对陷阱：$1/R = 1/30 \approx 0.0333\text{ S} \neq 0.012\text{ S}$，验证了绝不可分项取倒数！）` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 01 层的“串联 RLC”页就是例题 2.1：[[z_r|R]]、[[z_xl|$+jX_L$]]、[[z_xc|$-jX_C$]] 首尾相接，合成 [[z_vec|$\mathbf{Z}$]]。把 [[c_omega|ω]] 拖到约 $707\text{ rad/s}$，$X_L = X_C$，$\mathbf{Z}$ 落回实轴（纯阻性）；再往低拖，$\mathbf{Z}$ 翻到实轴下方变成容性。`,
        },
        { kind: 'p', text: R`**2.4 串联 RLC 复阻抗矢量三角形（$\mathbf{Z} = 30 + j40\ \Omega$）**` },
      ],
      inline_svg: SVG_Z_TRIANGLE,
      figure_caption: '串联 RLC 复阻抗矢量合成与阻抗三角形（ω = 1000 rad/s）',
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '频域 KCL/KVL 与复阻抗混联——直流定律的全面复数升级',
      sync: { layer: L1, halo: ['z_eq', 'p_kcl'], params: P({ elem: 'mix', omega: 50 }) },
      blocks: [
        { kind: 'p', text: '**3.1 好消息：第一周学的所有直流定律，换上复数外衣全部通用！**' },
        {
          kind: 'p',
          text: R`在 Sadiku Section 9.6 中，最令人振奋的结论莫过于：**由于线性微分算子的线性叠加性，基尔霍夫定律与串并联化简在频域完全成立**，只是把实数 $R$ 全部替换为复数 $\mathbf{Z}$：`,
        },
        {
          kind: 'ul',
          items: [
            R`**频域 KVL**：$\sum_{k=1}^{n} \mathbf{V}_k = 0$（注意是复数矢量和，不再是标量幅值代数和！甚至可能出现分电压幅值大于总电源幅值的现象）。`,
            R`**[[p_kcl|频域 KCL]]**：$\sum_{k=1}^{n} \mathbf{I}_k = 0$。`,
            R`**串联复阻抗**：$\mathbf{Z}_{\text{eq}} = \mathbf{Z}_1 + \mathbf{Z}_2 + \dots + \mathbf{Z}_n$。`,
            R`**并联复阻抗**：$\frac{1}{\mathbf{Z}_{\text{eq}}} = \frac{1}{\mathbf{Z}_1} + \frac{1}{\mathbf{Z}_2} + \dots + \frac{1}{\mathbf{Z}_n}$，两支路并联特例 $\mathbf{Z}_{\text{eq}} = \frac{\mathbf{Z}_1 \mathbf{Z}_2}{\mathbf{Z}_1 + \mathbf{Z}_2}$（亦可用导纳直接相加 $\mathbf{Y}_{\text{eq}} = \mathbf{Y}_1 + \mathbf{Y}_2$）。`,
            R`**复数分压法则（衔接 W1-L7）**：$\mathbf{V}_k = \frac{\mathbf{Z}_k}{\mathbf{Z}_1 + \mathbf{Z}_2}\mathbf{V}_s$。`,
            R`**复数分流法则（衔接 W1-L7）**：$\mathbf{I}_1 = \frac{\mathbf{Z}_2}{\mathbf{Z}_1 + \mathbf{Z}_2}\mathbf{I}_s$。`,
          ],
        },
        { kind: 'p', text: '**3.2 Sadiku 9.6 混联复阻抗经典例题（时域/频域双层标注）**' },
        { kind: 'figure', svg: SVG_MIX, caption: 'Sadiku 9.6 混联 RLC 网络（ω = 50 rad/s · 蓝字为频域复阻抗等效值）' },
        { kind: 'p', text: '**3.3 三段式教授板书推导：混联复阻抗、总电流与复数分流**' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**例题 3.1**：针对上图所示混联电路，激励源 $v_s(t) = 30\cos(50t + 10^\circ)\text{ V}$。求总输入复阻抗 [[z_eq|$\mathbf{Z}_{\text{eq}}$]]、干路稳态电流 $i(t)$ 以及两并联支路电流相量 [[p_ia|$\mathbf{I}_A$]]、[[p_ib|$\mathbf{I}_B$]]。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`依据元件频域阻抗定义、串并联复阻抗等效法则、频域欧姆定律及复数分流法则：$\mathbf{Z}_p = \mathbf{Z}_A \parallel \mathbf{Z}_B = \frac{\mathbf{Z}_A \mathbf{Z}_B}{\mathbf{Z}_A + \mathbf{Z}_B}$，$\mathbf{Z}_{\text{eq}} = \mathbf{Z}_1 + \mathbf{Z}_p$，$\mathbf{I} = \frac{\mathbf{V}_s}{\mathbf{Z}_{\text{eq}}}$`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式：写出各子块复阻抗的符号表达式',
          tex: R`\mathbf{Z}_1 = R_1 - \frac{j}{\omega C_1}, \qquad \mathbf{Z}_A = R_2 + j\omega L, \qquad \mathbf{Z}_B = -\frac{j}{\omega C_2}`,
        },
        {
          kind: 'formula',
          title: '并联阻抗与支路分流公式为',
          tex: R`\mathbf{Z}_p = \frac{\mathbf{Z}_A \mathbf{Z}_B}{\mathbf{Z}_A + \mathbf{Z}_B}, \qquad \mathbf{I}_A = \frac{\mathbf{Z}_B}{\mathbf{Z}_A + \mathbf{Z}_B}\,\mathbf{I}, \qquad \mathbf{I}_B = \frac{\mathbf{Z}_A}{\mathbf{Z}_A + \mathbf{Z}_B}\,\mathbf{I}`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（已知 $\omega = 50\text{ rad/s}$，$\mathbf{V}_s = 30\angle 10^\circ\text{ V}$）`,
          steps: [
            { label: '1. 逐一转换元件复阻抗', tex: R`\mathbf{Z}_{C1} = \frac{-j}{(50)(5\times 10^{-3})} = -j4\ \Omega \implies \mathbf{Z}_1 = 2 - j4\ \Omega` },
            { label: '', tex: R`\mathbf{Z}_L = j(50)(120\times 10^{-3}) = j6\ \Omega \implies \mathbf{Z}_A = 8 + j6\ \Omega` },
            { label: '', tex: R`\mathbf{Z}_B = \frac{-j}{(50)(2\times 10^{-3})} = -j10\ \Omega` },
            { label: R`2. 计算[[z_p|并联等效阻抗 $\mathbf{Z}_p$]]`, tex: R`\mathbf{Z}_p = \frac{(8 + j6)(-j10)}{(8 + j6) + (-j10)} = \frac{60 - j80}{8 - j4}` },
            {
              label: '',
              text: R`分子分母同乘共轭复数 $(8 + j4)$：`,
              tex: R`\mathbf{Z}_p = \frac{(60 - j80)(8 + j4)}{8^2 + 4^2} = \frac{480 + j240 - j640 + 320}{80} = \frac{800 - j400}{80} = 10 - j5\ \Omega`,
            },
            { label: R`3. 串联叠加求总阻抗 $\mathbf{Z}_{\text{eq}}$`, tex: R`\mathbf{Z}_{\text{eq}} = \mathbf{Z}_1 + \mathbf{Z}_p = (2 - j4) + (10 - j5) = 12 - j9\ \Omega` },
            {
              label: '',
              text: '转为极坐标：',
              tex: R`|\mathbf{Z}_{\text{eq}}| = \sqrt{12^2 + (-9)^2} = 15\ \Omega, \qquad \theta_Z = \arctan\left(\frac{-9}{12}\right) = -36.87^\circ`,
            },
            { label: '', tex: R`\mathbf{Z}_{\text{eq}} = 15\angle -36.87^\circ\ \Omega` },
            {
              label: '4. 求干路电流相量并还原时域',
              tex: R`\mathbf{I} = \frac{30\angle 10^\circ}{15\angle -36.87^\circ} = 2.00\angle 46.87^\circ\text{ A} \implies i(t) = 2.00\cos(50t + 46.87^\circ)\text{ A}`,
            },
            {
              label: '5. 复数分流求支路电流',
              text: R`已知 $\mathbf{Z}_A + \mathbf{Z}_B = 8 - j4 = 4\sqrt{5}\angle -26.57^\circ\ \Omega$：`,
              tex: R`\mathbf{I}_A = \frac{10\angle -90^\circ}{4\sqrt{5}\angle -26.57^\circ}(2.00\angle 46.87^\circ) = \sqrt{5}\angle -16.57^\circ \approx 2.24\angle -16.57^\circ\text{ A}`,
            },
            {
              label: '',
              tex: R`\mathbf{I}_B = \frac{10\angle 36.87^\circ}{4\sqrt{5}\angle -26.57^\circ}(2.00\angle 46.87^\circ) = \sqrt{5}\angle 110.30^\circ \approx 2.24\angle 110.30^\circ\text{ A}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授点睛**：你发现神奇的地方了吗？干路总电流幅值只有 $2.00\text{ A}$，可两个并联支路的电流幅值居然都是 $2.24\text{ A}$——**每个支路的电流都比总电流还大**！这在直流电路里绝不可能发生，但在交流电路里，[[p_ia|感性支路 $\mathbf{I}_A$]] 和[[p_ib|容性支路 $\mathbf{I}_B$]] 相位差高达 $126.87^\circ$，二者矢量合成时彼此抵消了一部分，精准满足[[p_kcl|频域 KCL]]：$\mathbf{I}_A + \mathbf{I}_B = 2.00\angle 46.87^\circ\text{ A}$！`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 01 层的“混联”页：中间是 [[p_i|$\mathbf{I}$]]、[[p_ia|$\mathbf{I}_A$]]、[[p_ib|$\mathbf{I}_B$]] 三个电流相量和虚线平行四边形，右边是 [[z_1|$\mathbf{Z}_1$]] 与 [[z_p|$\mathbf{Z}_p$]] 首尾相接得到 [[z_eq|$\mathbf{Z}_{\text{eq}}$]]。拖 ω 离开 $50\text{ rad/s}$，看支路电流比干路大多少。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '双通道示波器读相法——实时观测 RC 相移与幅值衰减',
      sync: { layer: L2, halo: ['sc_ch1', 'sc_ch2', 'sc_dt'], params: P() },
      blocks: [
        {
          kind: 'p',
          text: R`现在，请把目光切到左侧舞台的 **Layer 2：${code('02 实时双通道示波器')}**。我们把纸面上的复数分压搬到真实实验室里最经典的 **RC 相移网络** 上：用函数信号发生器输出 [[sc_freq|$f = 1\text{ kHz}$]]、峰值 $V_{\text{in,pk}} = 5.0\text{ V}$（$10\text{ V}_{\text{pp}}$）的正弦波，串联一颗 $R = 1.6\text{ k}\Omega$（或 $1.5\text{ k}\Omega$）电阻与一颗 $C = 100\text{ nF}$ 电容。`,
        },
        { kind: 'p', text: R`**4.1 三段式教授板书推导：RC 相移与示波器时间差 $\Delta t$ 换算**` },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`依据频域复数分压法则及正弦波周期与相位线性对应关系：$\mathbf{V}_C = \frac{\mathbf{Z}_C}{\mathbf{Z}_R + \mathbf{Z}_C}\mathbf{V}_{\text{in}}$，$\Delta\phi = -\frac{\Delta t}{T} \times 360^\circ$，其中 [[sc_dt|$\Delta t = t_{\text{CH2,peak}} - t_{\text{CH1,peak}}$]] 为输出波形相对输入波形在示波器水平轴上的延迟时间（右移为滞后，取负号）。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：将 $\mathbf{Z}_R = R$、$\mathbf{Z}_C = \frac{1}{j\omega C}$ 代入复数分压式，分子分母同乘 $j\omega C$`,
          tex: R`\mathbf{H}_C(j\omega) \triangleq \frac{\mathbf{V}_C}{\mathbf{V}_{\text{in}}} = \frac{1/(j\omega C)}{R + 1/(j\omega C)} = \frac{1}{1 + j\omega RC} = \frac{1}{1 + j(R/X_C)}`,
        },
        {
          kind: 'formula',
          title: '提取幅值衰减比与相移角通式',
          tex: R`|\mathbf{H}_C(j\omega)| = \frac{1}{\sqrt{1 + (\omega RC)^2}}, \qquad \Delta\phi_C = -\arctan(\omega RC) = -\arctan\left(\frac{R}{X_C}\right)`,
        },
        {
          kind: 'formula',
          title: '同步给出电阻两端电压传递比（供超前相移对比）',
          tex: R`\mathbf{H}_R(j\omega) = \frac{\mathbf{V}_R}{\mathbf{V}_{\text{in}}} = \frac{j\omega RC}{1 + j\omega RC} \implies \Delta\phi_R = 90^\circ - \arctan(\omega RC) > 0`,
        },
        {
          kind: 'formula',
          title: R`由 $\Delta\phi_C = -\frac{\Delta t}{T}\times 360^\circ$ 反解示波器上的水平延迟时间`,
          tex: R`\Delta t = \frac{|\Delta\phi_C|}{360^\circ}\,T = \frac{|\Delta\phi_C|}{360^\circ f}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '给定标准实验参数',
              text: R`$f = 1000\text{ Hz}$（周期 $T = 1.00\text{ ms} = 1000\ \mu\text{s}$，$\omega = 2\pi f \approx 6283.19\text{ rad/s}$），$C = 100\text{ nF} = 10^{-7}\text{ F}$，$V_{\text{in,pk}} = 5.0\text{ V}$。`,
            },
            {
              label: R`1. 计算[[c_xc|容抗 $X_C$]]`,
              tex: R`X_C = \frac{1}{2\pi (1000)(100\times 10^{-9})} = \frac{10^4}{2\pi} \approx 1591.55\ \Omega \approx 1.59\text{ k}\Omega`,
            },
            { label: R`2. 主推荐方案（$R = 1.6\text{ k}\Omega$ E24 金属膜电阻）`, tex: R`\frac{R}{X_C} = \frac{1600}{1591.55} = 1.0053` },
            { label: '', tex: R`|\mathbf{H}_C| = \frac{1}{\sqrt{1 + 1.0053^2}} = 0.7052 \approx 0.707 \implies V_{C,\text{pk}} = 5.0 \times 0.7052 = 3.53\text{ V}` },
            { label: '', tex: R`\Delta\phi_C = -\arctan(1.0053) = -45.15^\circ \approx -45^\circ` },
            { label: '', tex: R`\Delta t = \frac{45.15^\circ}{360^\circ} \times 1000\ \mu\text{s} = 125.42\ \mu\text{s} \approx \frac{1}{8}T` },
            { label: '', text: R`（若改测电阻两端，则 $\Delta\phi_R = +44.85^\circ \approx +45^\circ$，波形相对 CH1 **向左超前** $1/8$ 个周期！）` },
            {
              label: R`3. 备选常见方案（$R = 1.5\text{ k}\Omega$ E12 碳膜电阻）`,
              tex: R`|\mathbf{H}_C| = 0.7277 \ (V_{C,\text{pk}} = 3.64\text{ V}), \quad \Delta\phi_C = -43.30^\circ, \quad \Delta t = 120.29\ \mu\text{s}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 02 层：[[sc_ch1|CH1]] 是输入，[[sc_ch2|CH2]] 是电容电压；拖动 [[sc_cursor|游标 B]] 去对齐 CH2 的波峰，读 [[sc_dt|$\Delta t$]] 与 $\Delta\phi$。把 [[sc_freq|f]] 拖到 100 Hz 和 10 kHz，看相移怎样逼近 $0^\circ$ 与 $-90^\circ$；切到“对调 R/C”或 [[sc_math|MATH]]，CH2 换成向左超前的 $v_R$。`,
        },
        { kind: 'p', text: R`**4.2 示波器波形图：CH1 输入 vs CH2 电容 $-45^\circ$ 相移精确波形**` },
      ],
      inline_svg: SCOPE_LIGHT,
      figure_caption: '双通道示波器实测：R = 1.6 kΩ, C = 100 nF, f = 1 kHz（250 µs/div · 2.5 V/div）',
    },
    /* ---------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '3D 面包板 RC 相移实操与双通道探头共地安全规范',
      sync: { layer: L3, halo: ['bb_gen', 'bb_scope', 'rail_gnd'], params: P({ cam: 'bench' }) },
      blocks: [
        {
          kind: 'p',
          text: R`请切换到左侧舞台的 **Layer 3：${code('03 3D 面包板 RC 相移电路 + 信号发生器与双通道示波器实操')}**。现在我们要像真正的电子工程师一样，把[[bb_r|电阻]]、[[bb_c|电容]]、[[bb_gen|信号发生器]]和[[bb_scope|示波器]]接在 830 孔面包板上。`,
        },
        { kind: 'p', text: R`**5.1 为什么实验室选 $R = 1.6\text{ k}\Omega$、$C = 100\text{ nF}$、$f = 1\text{ kHz}$？**` },
        {
          kind: 'p',
          text: R`初学面包板实操的同学常问：“老师，教材例题里经常写 $R = 2\ \Omega$、$C = 5\text{ mF}$，我为什么不能直接把那些元件插到面包板上？”这里藏着至关重要的**工程缩放与安全规范**：`,
        },
        {
          kind: 'ol',
          items: [
            R`**防过载与保功率**：若在 $5\text{ V}_{\text{pk}}$ 下接 $2\ \Omega$ 电阻，按理想电压源计算电流会飙升至 $2.5\text{ A}$（电阻功耗约 $6.25\text{ W}$），远超函数信号发生器 $50\ \Omega$ 内阻的驱动极限——实际上信号源输出会被拉垮到约 $0.19\text{ V}$、电流只有约 $96\text{ mA}$，波形面目全非；换成能输出大电流的功率信号源，则会瞬间烧毁面包板簧片与 $1/4\text{ W}$ 电阻！而选用 $R = 1.6\text{ k}\Omega$（或常见 $1.5\text{ k}\Omega$）配 $C = 100\text{ nF}$，总阻抗 $|\mathbf{Z}| \approx 2.26\text{ k}\Omega$，峰值电流仅 $2.22\text{ mA}$（$I_{\text{rms}} = 1.57\text{ mA}$），[[bench_p|电阻发热功率]]仅 $3.93\text{ mW}$，安全裕度超过 $60$ 倍！`,
            R`**肉眼黄金辨识点**：在 $f = 1\text{ kHz}$ 下，$X_C \approx 1.59\text{ k}\Omega \approx R$，此时电容相移刚好落在 $-45^\circ$（$1/8$ 个周期），幅值衰减到 $0.707$ 倍（$-3\text{ dB}$ 截止点），示波器上既不会因为相移太小看不清，也不会因为衰减太狠淹没在噪声里。`,
            R`**3D 扫频交互任务**：请在 3D 实操面板中拖动[[bb_knob|信号发生器频率旋钮]]，记录以下三个典型频点的物理演化：`,
          ],
        },
        {
          kind: 'ul',
          items: [
            R`**$f = 100\text{ Hz}$**（低频区）：$X_C = 15.92\text{ k}\Omega \gg R \implies |\mathbf{H}_C| = 0.995$，$\Delta\phi_C = -5.74^\circ$（电容近似开路，输出几乎紧贴输入）。`,
            R`**$f = 1\text{ kHz}$**（转折点）：$X_C = 1.59\text{ k}\Omega \approx R \implies |\mathbf{H}_C| = 0.705$，$\Delta\phi_C = -45.15^\circ$（黄金 $-45^\circ$ 相移）。`,
            R`**$f = 10\text{ kHz}$**（高频区）：$X_C = 159.2\ \Omega \ll R \implies |\mathbf{H}_C| = 0.099$，$\Delta\phi_C = -84.32^\circ$（电容近似短路，幅值剧烈衰减，相位逼近 $-90^\circ$）。`,
          ],
        },
        { kind: 'p', text: '**5.2 实验室头号安全红线：双通道示波器探头共地规范**' },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**绝对禁令（Common Ground Rule）**：台式双通道示波器的 **[[ch1_clip|CH1 黑色地夹]]** 与 **[[ch2_clip|CH2 黑色地夹]]**，在示波器机箱内部通过 BNC 外壳**直接短接在一起并连向市电保护地（PE）**！`,
        },
        {
          kind: 'ul',
          items: [
            R`**正确做法**：信号发生器黑夹、CH1 黑夹、CH2 黑夹**三根地线全部统一夹在[[rail_gnd|面包板蓝色负极轨（GND，即电容下端）]]**；[[ch1_probe|CH1 红探针]]钩住[[node_in|输入节点 ${code('IN')}]]，[[ch2_probe|CH2 红探针]]钩住 [[node_out|R-C 中间节点 ${code('OUT')}]]。`,
            R`**致命错误**：如果你为了同时看 $v_{\text{in}}$ 和 $v_R$，把 CH2 的黑色地夹直接夹在了 R-C 中间节点 ${code('OUT')} 上，示波器内部地线会立刻把节点 ${code('OUT')} 拉死到 ${code('GND')}——**你亲手用示波器把电容给短路了！** 此时不仅测不出 $v_R$，在带电源大电流电路中甚至会瞬间烧毁探头地线或炸保险丝。`,
            R`**安全测 $v_R(t)$ 的两种正确方法**：① 在电路板上物理对调 $R$ 与 $C$ 的上下位置，让电阻下端接地；② 保持共地接法不变，在示波器上开启 [[sc_math|${code('MATH = CH1 - CH2')}]] 差分波形。`,
          ],
        },
        {
          kind: 'table',
          caption: '面包板安全与参数（激励是函数信号发生器，不用直流电源；R、C 已按面包板安全量级选取）',
          head: ['项目', '取值', '说明'],
          rows: [
            ['[[bb_r|主推荐电阻]]', '1.6 kΩ，±1%（E24 金属膜），0.25 W（1/4 W）', '色环：棕-蓝-黑-棕-棕（5 环）'],
            ['[[bb_r|备选电阻]]', '1.5 kΩ，±5%（E12 碳膜），0.25 W（1/4 W）', '色环：棕-绿-红-金（4 环）'],
            ['[[bb_c|电容]]', '100 nF（0.1 µF，标识 104），耐压 50 V', '陶瓷片状或薄膜无极性电容'],
            [
              '[[bb_gen|函数信号发生器]]',
              R`正弦波，$f = 1000\text{ Hz}$（周期 $1.0\text{ ms}$），峰值 $5.0\text{ V}$（$10\text{ V}_{\text{pp}}$），直流偏置 $0\text{ V}$`,
              R`输出阻抗 $50\ \Omega$；引起的负载误差低于 $2.3\%$`,
            ],
            ['阻抗（1 kHz，1.6 kΩ）', R`$X_C = 1591.55\ \Omega$，$|\mathbf{Z}| = 2256.77\ \Omega$`, R`$X_C \approx R$：转折点`],
            [
              '[[bench_i|电流]]与[[bench_p|功耗]]',
              R`峰值 $2.22\text{ mA}$，有效值 $1.57\text{ mA}$；电阻功耗 $3.93\text{ mW}$`,
              R`不足 $1/4\text{ W}$ 额定功率的 $1.6\%$，安全裕度 $63.6$ 倍，无过热过载风险`,
            ],
            ['预期读数（1.6 kΩ）', R`$|\mathbf{H}_C| = 0.7052$，$\Delta\phi_C = -45.15^\circ$，$\Delta t = 125.42\ \mu\text{s}$`, '约 −45° 相移与 0.707 倍幅值衰减'],
            ['预期读数（1.5 kΩ）', R`$|\mathbf{H}_C| = 0.7277$，$\Delta\phi_C = -43.30^\circ$，$\Delta t = 120.29\ \mu\text{s}$`, '同样清晰可辨'],
            [
              '[[ch2_clip|探头共地]]（头号红线）',
              'CH1、CH2 黑色地夹与信号源黑夹全部夹在公共参考地轨 GND（电容下端）',
              R`严禁把 CH2 地夹跨接在 R-C 中间节点去测 $v_R(t)$；改用对调 R/C 或 ${code('MATH = CH1 - CH2')}`,
            ],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在 1 kHz、10 Vpp 正弦激励下，1.6 kΩ（或 1.5 kΩ）与 100 nF 组合可呈现肉眼极其清晰的约 $-45^\circ$ 相移与 $0.707$ 倍幅值衰减；实测电阻功耗仅 $3.93\text{ mW}$，不足 1/4 W 额定功率的 $1.6\%$，完全无过热过载风险，且信号发生器 $50\ \Omega$ 内阻引起的负载误差低于 $2.3\%$。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 03 层：拖 [[bb_knob|频率旋钮]]（或滑块）扫过 100 Hz、1 kHz、10 kHz，[[bb_scope|示波器]]屏幕与下方读数跟着变；切到“对调”看 [[bb_r|R]] 与 [[bb_c|C]] 换位后的超前波形。再把 [[ch2_clip|CH2 地夹]]挪到 [[node_out|OUT]] 试试——CH2 立刻变成一条直线，台面亮起红灯告警。实测的 [[ch1_probe|CH1]] 因信号源 $50\ \Omega$ 内阻略低于 $5\text{ V}$（约 $4.92\text{ V}$），但 CH2 相对 CH1 的比值 $0.7052$ 与相移 $-45.15^\circ$ 不变。`,
        },
        { kind: 'p', text: '**5.3 接线对比图：面包板 RC 正确共地接法 vs 探头误接短路警示**' },
      ],
      inline_svg: SVG_GROUND,
      figure_caption: '双通道示波器探头共地安全红线对比（台式示波器 CH1 GND ≡ CH2 GND ≡ PE）',
    },
    /* ---------------------------------------------------------------- act 6: guided example and quiz */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式分步实战与诊断测验',
      sync: { layer: L1, halo: ['z_eq'], params: { ...P(), ...GD(0) } },
      blocks: [
        { kind: 'p', text: '**6.1 实战例题拓扑图（与 5 步苏格拉底引导同步）** · **6.2 苏格拉底式 5 步分步引导例题**' },
        {
          kind: 'guided',
          // all five steps answered: the 01 layer's guided page shows every number
          done_params: { gReveal: 9 },
          title: 'RLC 混联电路复阻抗化简、总电流相量与时域波形还原',
          source: 'W5-L2 · Alexander, Sadiku & Fredette (2026) Section 9.6',
          problem: R`如图所示混联电路，电源为 [[el_src|$v_s(t) = 30\cos(200t + 20^\circ)\text{ V}$]]，干路串联 [[ex_r1|$R_1 = 3\ \Omega$]] 与 [[ex_l1|$L_1 = 55\text{ mH}$]]，后接 [[ex_r2|$R_2 = 10\ \Omega$]] 与 [[ex_c|$C = 500\ \mu\text{F}$]] 构成的并联支路。请分 5 步求出总复阻抗 $\mathbf{Z}_{\text{eq}}$、总电流相量 $\mathbf{I}$ 并还原时域稳态电流 $i(t)$。`,
          problem_svg: SVG_EX_PROBLEM,
          steps: [
            {
              title: '第一步：时域元件转频域复阻抗',
              mini_svg: MINI_STEP1,
              question: R`已知角频率 $\omega = 200\text{ rad/s}$，请分别写出电感 $L_1 = 55\text{ mH}$ 与电容 $C = 500\ \mu\text{F}$ 的复阻抗 $\mathbf{Z}_{L1}$ 和 $\mathbf{Z}_C$。`,
              hint: R`$\mathbf{Z}_{L1} = j\omega L_1 = j(200)(55\times 10^{-3}), \quad \mathbf{Z}_C = \frac{-j}{\omega C} = \frac{-j}{(200)(500\times 10^{-6})}$`,
              options: [
                {
                  text: R`$\mathbf{Z}_{L1} = +j11\ \Omega$，$\mathbf{Z}_C = -j10\ \Omega$`,
                  correct: true,
                  feedback: R`对！$\mathbf{Z}_{L1} = j(200)(0.055) = j11\ \Omega$，$\mathbf{Z}_C = -j/(200 \times 5\times 10^{-4}) = -j/0.1 = -j10\ \Omega$。干路串联块因此是 $\mathbf{Z}_1 = 3 + j11\ \Omega$。`,
                },
                {
                  text: R`$\mathbf{Z}_{L1} = -j11\ \Omega$，$\mathbf{Z}_C = +j10\ \Omega$`,
                  correct: false,
                  feedback: R`慢着！符号反了，立刻回想 ELI the ICE man：电感总是 $+j\omega L$（电压超前电流），电容总是 $-j/(\omega C)$（电流超前电压）。`,
                },
                {
                  text: R`$\mathbf{Z}_{L1} = +j11\ \Omega$，$\mathbf{Z}_C = -j100\ \Omega$`,
                  correct: false,
                  feedback: R`电感对了，电容的单位换算错了一个数量级：$500\ \mu\text{F} = 5\times 10^{-4}\text{ F}$，$\omega C = 200 \times 5\times 10^{-4} = 0.1$，所以 $1/(\omega C) = 10\ \Omega$。`,
                },
                {
                  text: R`$\mathbf{Z}_{L1} = +j55\ \Omega$，$\mathbf{Z}_C = -j500\ \Omega$`,
                  correct: false,
                  feedback: R`慢着！你把元件标称值直接当成了欧姆数，漏掉了 $\omega$ 和单位换算：$55\text{ mH} = 0.055\text{ H}$，$\omega L_1 = 200 \times 0.055 = 11\ \Omega$；$500\ \mu\text{F} = 5\times 10^{-4}\text{ F}$，$1/(\omega C) = 10\ \Omega$。`,
                },
              ],
              board: [R`\mathbf{Z}_{L1} = j11\ \Omega, \quad \mathbf{Z}_C = -j10\ \Omega, \quad \mathbf{Z}_1 = 3 + j11\ \Omega`],
              halo: ['ex_l1', 'ex_c'],
              params: GD(0),
              layer: L1,
            },
            {
              title: R`第二步：计算右侧并联块复阻抗 $\mathbf{Z}_p$`,
              mini_svg: MINI_STEP2,
              question: R`右侧并联块由 $R_2 = 10\ \Omega$ 与 $\mathbf{Z}_C = -j10\ \Omega$ 并联构成，请计算等效复阻抗 $\mathbf{Z}_p = R_2 \parallel \mathbf{Z}_C$。`,
              hint: R`$\mathbf{Z}_p = \frac{(10)(-j10)}{10 - j10} = \frac{-j100(10 + j10)}{10^2 + 10^2}$`,
              options: [
                {
                  text: R`$10 - j10\ \Omega$`,
                  correct: false,
                  feedback: R`千万别把并联当成直接相加！$10 - j10$ 是 $R_2$ 与 $\mathbf{Z}_C$ **串联**的结果。并联要用积除以和 $\frac{(10)(-j10)}{10 - j10}$，再分子分母同乘共轭复数 $(10 + j10)$。`,
                },
                {
                  text: R`$5 - j5\ \Omega$`,
                  correct: true,
                  feedback: R`完全正确！$\mathbf{Z}_p = \frac{-j100(10 + j10)}{200} = \frac{1000 - j1000}{200} = 5 - j5\ \Omega$：并联块呈容性，模 $5\sqrt{2} \approx 7.07\ \Omega$，比任一支路的 $10\ \Omega$ 都小。`,
                },
                {
                  text: R`$5 + j5\ \Omega$`,
                  correct: false,
                  feedback: R`大小对了，符号错了：分子 $-j100(10 + j10) = -j1000 - j^2 1000 = 1000 - j1000$，注意 $(-j)(+j) = +1$，而 $-j1000$ 仍留在虚部。并联块里只有电容一种电抗，结果必然是负虚部。`,
                },
                {
                  text: R`$-j5\ \Omega$`,
                  correct: false,
                  feedback: R`实部不见了！$-j5$ 像是把 $-j10$ 直接减半——那只在两条支路都是 $-j10$ 时才成立。$10\ \Omega$ 与 $-j10\ \Omega$ 并联必须用积除以和，再有理化分母。`,
                },
              ],
              board: [R`\mathbf{Z}_p = \frac{1000 - j1000}{200} = 5 - j5\ \Omega`],
              halo: ['ex_r2', 'ex_c', 'z_p'],
              params: GD(1),
              layer: L1,
            },
            {
              title: R`第三步：串联叠加求总复阻抗 $\mathbf{Z}_{\text{eq}}$ 并转极坐标`,
              mini_svg: MINI_STEP3,
              question: R`将干路串联块 $\mathbf{Z}_1 = 3 + j11\ \Omega$ 与并联块 $\mathbf{Z}_p = 5 - j5\ \Omega$ 相加，得到总复阻抗 $\mathbf{Z}_{\text{eq}}$ 的直角与极坐标形式。`,
              hint: R`$\mathbf{Z}_{\text{eq}} = (3+5) + j(11-5), \quad |\mathbf{Z}_{\text{eq}}| = \sqrt{8^2+6^2}, \quad \theta_Z = \arctan(6/8)$`,
              options: [
                {
                  text: R`$8 + j16\ \Omega = 17.89\angle 63.43^\circ\ \Omega$`,
                  correct: false,
                  feedback: R`虚部加错了号：$\mathbf{Z}_p$ 的虚部是 $-j5$，复数相加时虚部加虚部，$(+j11) + (-j5) = +j6$，不是 $+j16$。`,
                },
                {
                  text: R`$8 + j6\ \Omega = 10\angle 36.87^\circ\ \Omega$`,
                  correct: true,
                  feedback: R`漂亮！$(3 + 5) + j(11 - 5) = 8 + j6\ \Omega$，勾股数 6-8-10 一眼出答案：$|\mathbf{Z}_{\text{eq}}| = 10\ \Omega$，$\theta_Z = \arctan(6/8) = 36.87^\circ$，整体呈感性。`,
                },
                {
                  text: R`$8 - j6\ \Omega = 10\angle -36.87^\circ\ \Omega$`,
                  correct: false,
                  feedback: R`电抗的符号反了：干路电感的 $+j11$ 比并联块的 $-j5$ 大，$(+j11) + (-j5) = +j6$，所以最终电抗为正（感性），不是容性。`,
                },
                {
                  text: R`$2 + j6\ \Omega = 6.32\angle 71.57^\circ\ \Omega$`,
                  correct: false,
                  feedback: R`实部做成了减法：串联叠加时实部加实部，$3 + 5 = 8\ \Omega$，不是 $5 - 3 = 2\ \Omega$。`,
                },
              ],
              board: [R`\mathbf{Z}_{\text{eq}} = 8 + j6 = 10\angle 36.87^\circ\ \Omega`],
              halo: ['z_1', 'z_p', 'z_eq'],
              params: GD(2),
              layer: L1,
            },
            {
              title: R`第四步：频域欧姆定律求总电流相量 $\mathbf{I}$`,
              mini_svg: MINI_STEP4,
              question: R`已知电源电压相量 $\mathbf{V}_s = 30\angle 20^\circ\text{ V}$，总阻抗 $\mathbf{Z}_{\text{eq}} = 10\angle 36.87^\circ\ \Omega$，求总电流相量 $\mathbf{I}$。`,
              hint: R`$\mathbf{I} = \frac{V_m\angle\phi_v}{|\mathbf{Z}_{\text{eq}}|\angle\theta_Z} = \frac{30}{10}\angle(20^\circ - 36.87^\circ)$`,
              options: [
                {
                  text: R`$3.00\angle 56.87^\circ\text{ A}$`,
                  correct: false,
                  feedback: R`注意极坐标相除的规则：模相除，幅角是“分子角减去分母角”！把两个角相加是乘法的规则，$20^\circ - 36.87^\circ = -16.87^\circ$。`,
                },
                {
                  text: R`$3.00\angle -16.87^\circ\text{ A}$`,
                  correct: true,
                  feedback: R`对！$\mathbf{I} = \frac{30}{10}\angle(20^\circ - 36.87^\circ) = 3.00\angle -16.87^\circ\text{ A}$。整体呈感性，电流比电压滞后整整 $\theta_Z = 36.87^\circ$。`,
                },
                {
                  text: R`$3.00\angle 16.87^\circ\text{ A}$`,
                  correct: false,
                  feedback: R`减法的顺序反了：幅角是分子角减分母角，$20^\circ - 36.87^\circ = -16.87^\circ$，而不是 $36.87^\circ - 20^\circ$。整体呈感性，电流必须比电压滞后 $36.87^\circ$。`,
                },
                {
                  text: R`$300\angle -16.87^\circ\text{ A}$`,
                  correct: false,
                  feedback: R`模不是相乘：频域欧姆定律 $\mathbf{I} = \mathbf{V}_s/\mathbf{Z}_{\text{eq}}$，模相除 $30/10 = 3\text{ A}$。$30\text{ V}$ 加在 $10\ \Omega$ 上也绝不可能流过 $300\text{ A}$。`,
                },
              ],
              board: [R`\mathbf{I} = 3.00\angle -16.87^\circ\text{ A}`],
              halo: ['p_v', 'p_i'],
              params: GD(3),
              layer: L1,
            },
            {
              title: R`第五步：逆相量变换还原时域电流 $i(t)$`,
              mini_svg: MINI_STEP5,
              question: R`将总电流相量 $\mathbf{I} = 3.00\angle -16.87^\circ\text{ A}$ 还原为完整的时域稳态电流表达式 $i(t)$（保持余弦基准与角频率 $\omega = 200\text{ rad/s}$）。`,
              hint: R`$i(t) = \text{Re}\{\mathbf{I}\,e^{j\omega t}\} = I_m\cos(\omega t + \phi_i)$`,
              options: [
                {
                  text: R`$i(t) = 3.00\cos(200t - 16.87^\circ)\text{ A}$`,
                  correct: true,
                  feedback: R`完美收官！余弦基准、$\omega = 200\text{ rad/s}$ 和相角 $-16.87^\circ$ 原封不动带回时域：$i(t) = 3.00\cos(200t - 16.87^\circ)\text{ A}$。`,
                },
                {
                  text: R`$i(t) = 3.00\sin(200t - 16.87^\circ)\text{ A}$`,
                  correct: false,
                  feedback: R`别忘了电压源是以余弦 $\cos(200t + 20^\circ)$ 为基准进入频域的，所以还原回时域必须同样用 cos；换成 sin 等于凭空让波形再滞后 $90^\circ$。`,
                },
                {
                  text: R`$i(t) = 3.00\cos(200t + 16.87^\circ)\text{ A}$`,
                  correct: false,
                  feedback: R`相角的符号丢了：相量 $3.00\angle -16.87^\circ$ 的幅角是 $-16.87^\circ$，原样写进余弦里，电流才是滞后于电压的感性响应。`,
                },
                {
                  text: R`$i(t) = 3.00\cos(50t - 16.87^\circ)\text{ A}$`,
                  correct: false,
                  feedback: R`角频率 $\omega = 200\text{ rad/s}$ 必须原封不动带回来；$50\text{ rad/s}$ 是第 3 幕例题 3.1 的频率。相量里不含 $\omega$，还原时只能用本题电源的 $\omega$。`,
                },
              ],
              board: [R`i(t) = 3.00\cos(200t - 16.87^\circ)\text{ A}`],
              halo: ['p_i', 'c_it'],
              params: GD(4),
              layer: L1,
            },
          ],
          conclusion: R`五行黑板就是交流稳态分析的完整流水线：时域元件 → 复阻抗 → 串并联化简 → 频域欧姆定律 → 逆相量变换。左侧 01 层的“引导例题”页现在写出了全部数值：[[z_1|$\mathbf{Z}_1$]] 与 [[z_p|$\mathbf{Z}_p$]] 首尾相接得到 [[z_eq|$\mathbf{Z}_{\text{eq}}$]]，[[p_i|$\mathbf{I}$]] 比 [[p_v|$\mathbf{V}_s$]] 滞后 $36.87^\circ$。`,
        },
        {
          kind: 'p',
          text: '**6.3 诊断测验（4 题全覆盖核心考点）**：四道题覆盖本课四个考点——元件相量关系与极端频率、复阻抗的非相量本质与复导纳陷阱、复数分流、示波器读相与共地安全。四题全部答对即通关本课。',
        },
      ],
      quiz: [
        {
          id: 'w5l2_q1',
          concept: '元件相量关系与极端频率',
          review_act: 1,
          question: '关于纯电感 $L$ 与纯电容 $C$ 在正弦稳态下的相量关系，下列哪项叙述完全正确？',
          options: [
            {
              key: 'A',
              text: '在电感中电流超前电压 90°，直流时电感相当于开路。',
              correct: false,
              feedback: R`两处都反了：ELI——电感里是电压超前电流 $90^\circ$；直流时 $X_L = \omega L \to 0$，电感相当于短路导线，不是开路。`,
            },
            {
              key: 'B',
              text: R`电感的复阻抗为 $\mathbf{Z}_L = -j\omega L$，相位角为 $-90^\circ$。`,
              correct: false,
              feedback: R`电感乘的是 $+j$：$\mathbf{Z}_L = j\omega L = \omega L\angle +90^\circ$。$-j$ 与 $-90^\circ$ 属于电容 $\mathbf{Z}_C = -j/(\omega C)$。`,
            },
            { key: 'C', text: '在电容中电流超前电压 90°，直流时电容相当于开路、高频时趋于短路。', correct: true },
            {
              key: 'D',
              text: R`容抗 $X_C = \omega C$，频率越高容抗越大。`,
              correct: false,
              feedback: R`容抗是 $X_C = 1/(\omega C)$，与 $\omega$ 成反比：频率越高容抗越小，高频时电容趋于短路、旁路高频。`,
            },
          ],
          feedback_correct: R`依据 ICE 口诀，电容电流超前电压 $90^\circ$，且 $\mathbf{Z}_C = -j/(\omega C)$。当 $\omega \to 0$（直流）时 $X_C \to \infty$（开路）；当 $\omega \to \infty$（高频）时 $X_C \to 0$（短路）。`,
          feedback_wrong: R`回到第 1 幕：ELI the ICE man，以及 $X_L = \omega L$、$X_C = 1/(\omega C)$ 在两个极端频率下的极限。`,
          figure: SVG_Q1,
          sync: { layer: L1, halo: ['p_angle', 'c_x'], params: P({ elem: 'C', omega: 4000 }) },
        },
        {
          id: 'w5l2_q2',
          concept: '复阻抗非相量与复导纳',
          review_act: 2,
          question: R`某二端网络的复阻抗为 $\mathbf{Z} = 6 - j8\ \Omega$。关于该网络及其复导纳 $\mathbf{Y} = G + jB$，下列说法正确的是：`,
          options: [
            { key: 'A', text: R`$\mathbf{Z}$ 是非相量的复数算子，网络呈容性，其复导纳为 $\mathbf{Y} = 0.06 + j0.08\text{ S}$。`, correct: true },
            {
              key: 'B',
              text: R`$\mathbf{Z}$ 是一个随时间旋转的相量，其电导 $G = 1/6\text{ S} \approx 0.167\text{ S}$。`,
              correct: false,
              feedback: R`两处都错：$\mathbf{Z} = \mathbf{V}/\mathbf{I}$ 相除时 $e^{j\omega t}$ 已经约掉，Z 是不旋转的复数算子；而且 $X \neq 0$ 时 $G \neq 1/R$，应为 $G = 6/(6^2 + 8^2) = 0.06\text{ S}$。`,
            },
            {
              key: 'C',
              text: R`因为虚部为 $-8\ \Omega$，所以电纳 $B = -1/8\text{ S} = -0.125\text{ S}$。`,
              correct: false,
              feedback: R`不能对虚部单独取倒数：分母有理化后 $B = \frac{-X}{R^2 + X^2} = \frac{8}{100} = +0.08\text{ S}$——大小不是 $0.125$，符号也相反。`,
            },
            {
              key: 'D',
              text: R`$\mathbf{Z}$ 是非相量的复数算子，网络呈感性，其复导纳为 $\mathbf{Y} = 0.06 - j0.08\text{ S}$。`,
              correct: false,
              feedback: R`虚部 $X = -8\ \Omega < 0$ 说明容抗占优，网络呈容性而非感性；$1/(6 - j8) = (6 + j8)/100$，电纳 $B = +0.08\text{ S}$ 为正（容纳为正）。`,
            },
          ],
          feedback_correct: R`复阻抗 $\mathbf{Z}$ 不是相量（时间因子 $e^{j\omega t}$ 已消去）；虚部 $X = -8\ \Omega < 0$ 表明呈容性。$\mathbf{Y} = 1/(6 - j8) = (6 + j8)/(36 + 64) = 0.06 + j0.08\text{ S}$，切忌直接分项取倒数。`,
          feedback_wrong: R`回到第 2 幕：Z 为什么不是相量，以及 $\mathbf{Y} = \frac{R - jX}{R^2 + X^2}$ 的分母有理化。`,
          figure: SVG_Q2,
          sync: { layer: L1, halo: ['z_vec', 'c_y'], params: P({ elem: 'RLC', omega: 500 }) },
        },
        {
          id: 'w5l2_q3',
          concept: '复数分流',
          review_act: 3,
          question: R`电流源 $\mathbf{I}_s = 5\angle 0^\circ\text{ A}$ 注入由电感 $\mathbf{Z}_L = j10\ \Omega$ 与电阻 $\mathbf{Z}_R = 10\ \Omega$ 构成的并联电路，流过电感支路的电流相量 $\mathbf{I}_L$ 为：`,
          options: [
            {
              key: 'A',
              text: R`$2.50\angle 0^\circ\text{ A}$`,
              correct: false,
              feedback: R`这是把两条支路当成两只相等的电阻平分电流。$j10$ 与 $10$ 模相等、相位却差 $90^\circ$，分流比 $\frac{10}{10 + j10}$ 是复数，模是 $0.707$ 而不是 $0.5$，还带 $-45^\circ$ 的角。`,
            },
            {
              key: 'B',
              text: R`$3.54\angle +45^\circ\text{ A}$`,
              correct: false,
              feedback: R`这是电阻支路的电流 $\mathbf{I}_R = \frac{\mathbf{Z}_L}{\mathbf{Z}_L + \mathbf{Z}_R}\mathbf{I}_s$。分流公式的分子是**对面**支路的阻抗：求 $\mathbf{I}_L$ 时分子应是 $\mathbf{Z}_R = 10$，分母角 $+45^\circ$ 被减掉，结果是 $-45^\circ$。`,
            },
            {
              key: 'C',
              text: R`$5.00\angle -90^\circ\text{ A}$`,
              correct: false,
              feedback: R`电流不会全部挤进电感：电阻支路同样分走一份。$\mathbf{I}_L = \frac{10}{10 + j10} \times 5\angle 0^\circ$，模只有 $5/\sqrt{2} \approx 3.54\text{ A}$，角度 $-45^\circ$ 而不是 $-90^\circ$。`,
            },
            { key: 'D', text: R`$3.54\angle -45^\circ\text{ A}$`, correct: true },
          ],
          feedback_correct: R`由复数分流公式：$\mathbf{I}_L = \frac{\mathbf{Z}_R}{\mathbf{Z}_L + \mathbf{Z}_R}\mathbf{I}_s = \frac{10}{10 + j10} \cdot 5\angle 0^\circ = \frac{10}{14.142\angle 45^\circ} \cdot 5\angle 0^\circ = 3.5355\angle -45^\circ\text{ A} \approx 3.54\angle -45^\circ\text{ A}$。`,
          feedback_wrong: R`回到第 3 幕的复数分流法则：$\mathbf{I}_1 = \frac{\mathbf{Z}_2}{\mathbf{Z}_1 + \mathbf{Z}_2}\mathbf{I}_s$，分子是另一条支路。`,
          figure: SVG_Q3,
          sync: { layer: L1, halo: ['p_kcl'], params: P({ elem: 'mix', omega: 50 }) },
        },
        {
          id: 'w5l2_q4',
          concept: '示波器读相与探头共地',
          review_act: 5,
          question:
            '在 2 kHz 的 RC 相移面包板实验中，示波器显示 CH2（电容电压）的波峰比 CH1（输入电压）向右滞后 $\\Delta t = 62.5\\ \\mu\\text{s}$。此时相移 $\\Delta\\phi$ 及若想改测电阻电压 $v_R(t)$ 的安全做法分别是：',
          options: [
            {
              key: 'A',
              text: R`$\Delta\phi = -90^\circ$；将 CH1 与 CH2 地夹都拔掉悬空即可。`,
              correct: false,
              feedback: R`两处都错：$T = 1/(2\text{ kHz}) = 500\ \mu\text{s}$，$\Delta\phi = -(62.5/500)\times 360^\circ = -45^\circ$，不是 $-90^\circ$；地夹全部悬空会丢掉测量参考地，波形漂移、混入工频干扰——正确做法是三地合一夹 GND 轨。`,
            },
            { key: 'B', text: R`$\Delta\phi = -45^\circ$；不可移动 CH2 地夹到 R-C 节点，应物理对调 R/C 位置或使用 ${code('MATH = CH1 - CH2')}。`, correct: true },
            {
              key: 'C',
              text: R`$\Delta\phi = -45^\circ$；直接把 CH2 黑色地夹夹到 R-C 中间节点即可测量 $v_R(t)$。`,
              correct: false,
              feedback: R`相移算对了，接法却是头号安全红线：两通道地夹在机箱内经 BNC 外壳连到市电保护地 PE，CH2 地夹夹在 R-C 节点会把电容直接短路，$v_C$ 被拉成 0，相移消失。`,
            },
            {
              key: 'D',
              text: R`$\Delta\phi = +45^\circ$；应将信号发生器改为直流挡位。`,
              correct: false,
              feedback: R`CH2 向右是滞后，按 $\Delta\phi = -(\Delta t/T)\times 360^\circ$ 要取负号，应为 $-45^\circ$；改成直流挡后电容稳态开路、没有正弦，也就无相移可测。`,
            },
          ],
          feedback_correct: R`$f = 2\text{ kHz}$ 对应周期 $T = 500\ \mu\text{s}$，$\Delta\phi = -(62.5 / 500) \times 360^\circ = -45^\circ$。双通道示波器地夹内部连通，直接将 CH2 地夹夹在 R-C 节点会短路电容，必须对调 R/C 或启用 MATH 差分通道。`,
          feedback_wrong: R`回到第 4 幕的 $\Delta\phi = -(\Delta t/T) \times 360^\circ$ 和第 5 幕的探头共地铁律。`,
          figure: SVG_Q4,
          sync: { layer: L3, halo: ['ch2_clip', 'rail_gnd'], params: P({ cam: 'board' }) },
        },
      ],
      after_quiz: [
        { kind: 'p', text: '**承上启下：下一课 W5-L3（交流稳态节点分析法与网孔分析法）**' },
        {
          kind: 'ul',
          items: [
            R`今天我们把 $R$、$L$、$C$ 统一成复阻抗 $\mathbf{Z}$，并验证了 KCL、KVL、串并联、分压分流在复数域全部照用。`,
            R`**预告 W5-L3**：当电路复杂到无法一路串并联化简时，就把 World 2 的节点分析法与网孔分析法整套搬进复数域——方程还是那几条，只是系数变成复阻抗、未知量变成相量，用复数矩阵一次解出所有节点电压与网孔电流。`,
          ],
        },
      ],
    },
  ],
};

export default W5_L2;
