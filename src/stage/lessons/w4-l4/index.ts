// W4-L4 · 无源 RC/RL 一阶自然响应（时间常数 τ 与指数衰减） (lesson sheet: docs/lessons/W4-L4.md).
// The professor's text of the six acts is reproduced from the sheet as written; [[id|…]] only links a
// term to the stage (the words are unchanged). Changes of form:
// - the opening remarks open act 1; the sheet's numbered sub-headings (1.1 … 6.2) are bold lines;
//   `$$…$$` display formulas sit in the ① / ② / ③ cards (a lead-in sentence becomes the card title),
//   a display formula inside a ① runs inline in its card; the bulleted ① of 5.3 runs as one
//   paragraph; the "内联 2D 教学图" headings become figure captions; the 「板书铁律」 quote and the
//   act-4 safety reminder are notes;
// - the sheet's JSON (guided example, quiz) is mapped onto types.ts: step_title → title,
//   prompt_question → question, hint_latex → hint (in $…$), board_append_latex → board; plain-text
//   symbols (v_C(0-), v_{R2} …) in the step questions are set as TeX; the quiz's "A. …" prefixes
//   become option keys;
// - left out (not lesson text): the sheet's engineering checklist 「Claude 工程落地清单」, the quiz's
//   passing score (the site uses 4/4) and its concept tags; act 6.1's render-mode name
//   (`3D_THREEJS_BREADBOARD`) reads 「03 3D 面包板」.
// Course-owner rules:
// - the guided example's options: the sheet gives one expected answer and one intercept per step;
//   each step has three options (the right one with praise, the sheet's mistake with its intercept,
//   one more wrong one with its own intercept), the right one in a different place each step;
// - anti-spoiler: the guided example is 5.3's 24 V network, so act 5 keeps the circuit, ① and ②, and
//   its 「③ 代入数值 · 逐步化简」 moved right after the guided block as the 「通关复盘」 board. Fig. 5-1
//   before the example prints "?" for the node voltages, R_Th and τ (svgs.ts: SVG_ACT5_TASK); the
//   sheet's figure closes the act. The step 2–5 diagrams ask instead of answering. While the
//   example runs, the stage (layer 01 network, layer 02 waveforms) shows its answers as "?" (param
//   reveal, raised step by step; done_params uncovers the rest);
// - the lab supply is the 台式可调直流电源（5 V）, a separate box wired to the rails (3D tag, HUD,
//   hover text, layer 01's breadboard circuit, fig. 6-1 and act 6's table).
// Added: the hover map; praise and the extra wrong options of the guided example, its problem line
// and conclusion; the quiz's per-option feedback (from the explanations) and figures; act 6's
// theory-vs-breadboard table (from the sheet's safety and scaling data), the 3D wiring table and
// the sheet's safety rule as a visible note; the W4-L5 preview after the quiz.
// Fixed: fig. 3-1 said "剩余 < 0.67%" for t ≥ 5τ (at 5τ it is exactly 0.67 %): "≤".

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import type { StageLesson, StageSync } from '../../types';
import { LAB, SUPPLY_NAME } from './model';
import { L1, L2, L3 } from './state';
import {
  ADDED_NEXT,
  ADDED_Q1,
  ADDED_Q2,
  ADDED_Q3,
  ADDED_Q4,
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
  SVG_ACT5_TASK,
  SVG_ACT6,
} from './svgs';

const Schematic = lazy(() => import('./Schematic'));
const Scope = lazy(() => import('./Scope'));
const Bench3D = lazy(() => import('./Bench3D'));

const R = String.raw;

/** the breadboard RC on layer 01 / 02 (5 V, 10 kΩ, 100 µF) */
const LABP = { rS: LAB.r, cS: LAB.c };
const at = (layer: string, halo: string[], params: Record<string, unknown>): StageSync => ({ layer, halo, params });
/** act 5's network on layer 01 with `reveal` steps solved */
const net = (reveal: number, p: Record<string, unknown> = {}) => ({ topo: 'net', reveal, ...p });

const W4_L4: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Schematic, [L2]: Scope, [L3]: Bench3D },
  describeTarget: (id) => genericLabel(id),
  lesson_meta: {
    lesson_id: 'W4-L4',
    world: 'World 4',
    title: '无源 RC/RL 一阶自然响应（时间常数 τ 与指数衰减）',
    subtitle: 'Source-Free First-Order RC & RL Natural Response: Time Constant τ and Exponential Decay',
    lesson_type: 'D',
    lesson_type_label: 'Type D · 动态暂态 + 3D 面包板实操课',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release（Alexander, Sadiku & Fredette）',
      sections: ['Section 7.1–7.3（The Source-Free RC Circuit & The Source-Free RL Circuit）'],
    },
    textbook_supplement: 'Boylestad, Introductory Circuit Analysis, 14th Ed., Chapter 10–11（指数衰减物理直觉与暂态斜率）',
    prerequisites: ['W2-L7 戴维南等效', 'W4-L1 电容', 'W4-L2 电感'],
    next_lesson: 'W4-L5',
    next_lesson_title: '一阶 RC/RL 阶跃响应与三要素通解（含示波器共地防短路警示与面包板实操）',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 2D 开关切换原理图',
        render_mode: '2D_SCHEMATIC_SVG',
        caption:
          '01 2D 开关切换原理图（t = 0⁻ 充电稳态 ↔ t > 0 放电）：SPDT 开关切换，节点电压气泡与支路电流箭头随时间实时变化；可选面包板 RC、RL 线圈与第 5 幕带开关多电阻网络（叠加戴维南等效 R_Th）。',
      },
      {
        id: L2,
        label: '02 实时指数衰减示波器',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 实时指数衰减示波器：R 滑块（1–50 kΩ）与 C 滑块（10–470 µF）联动刷新 τ = RC；勾选 t = 0 初始切线（交横轴于 t = τ）、1τ（36.8%）与 5τ（0.67%）稳态线；能量条对比电容剩余储能 w_C(t) 与电阻累计耗热 w_R(t)。',
      },
      {
        id: L3,
        label: '03 3D 面包板插 RC 放电实操',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption: `03 3D 面包板：${SUPPLY_NAME} 经引线接电源轨；SPDT 拨动开关（左拨接 5 V 充电，右拨经 10 kΩ 放电）、10 kΩ 碳膜电阻（棕黑橙金）与 100 µF / 16 V 电解电容（带极性反插检测）；虚拟示波器 CH1 夹电容正极、地夹夹负极，拨动开关观测 τ = 1.0 s 的衰减。`,
      },
    ],
    hover_map: {
      cap: { label: '电容 C（100 µF / 16 V 电解）', desc: '储能元件：放电前被充到 V₀ = 5 V，储能 ½CV₀² = 1.25 mJ；长脚为 +（接开关公共端），白色条纹一侧为 −（接 GND）' },
      res: { label: '放电电阻 R（10 kΩ）', desc: '1/4 W 碳膜电阻，棕-黑-橙-金：泄放通道，i = v/R；τ = RC = 10 kΩ × 100 µF = 1.0 s，峰值功耗仅 2.5 mW' },
      v_node: { label: '电容电压 v(t)', desc: '连续的状态量：v(0⁺) = v(0⁻) = V₀，之后按 v(t) = V₀ e^(−t/τ) 衰减' },
      i_r: { label: '泄放电流 i(t) = v(t)/R', desc: '与剩余电压成正比：电压减半，电流减半，|dv/dt| 也减半——所以越放越慢' },
      spdt: { label: 'SPDT 拨动开关', desc: '单刀双掷：公共端接电容 +；左拨接 +5 V 轨给电容充电（t < 0），右拨接 10 kΩ 放电（t > 0）' },
      supply: { label: SUPPLY_NAME, desc: '实验台上单独的直流电源：红色 + 引线接顶部 +5 V 轨，黑色 − 引线接 GND 轨；限流旋钮调到几十毫安即可（电容充满后输出电流为 0）' },
      rail_p: { label: '+5 V 电源轨', desc: `顶部红色轨，由${SUPPLY_NAME}的 + 端供电；红跳线 a20 → 轨，接开关左侧引脚` },
      gnd: { label: 'GND 公共地轨', desc: '顶部蓝色轨，接电源 − 端；电容 − 脚、放电电阻回路与示波器地夹都接这里' },
      curve: { label: '衰减曲线 x(t) = x₀ e^(−t/τ)', desc: '导数与自身成正比的唯一函数：每经过一个 τ，剩余量乘以 0.368' },
      tangent: { label: 't = 0 切线', desc: '斜率 −V₀/τ：若保持初始泄放速率不变，恰好在 t = τ 放光' },
      mark_1tau: { label: '1τ 特征点（36.8%）', desc: 't = τ 时剩余 e^(−1) ≈ 36.79%，已衰减 63.21%，能量已释放 86.47%' },
      steady: { label: '5τ 工程稳态区', desc: 't ≥ 5τ 时剩余 ≤ 0.67%（不足 1%），工程上认为暂态结束' },
      energy: { label: '能量条 w_C(t) vs w_R(t)', desc: '电容剩余储能 w_C/W₀ = e^(−2t/τ)，电阻累计耗热 w_R/W₀ = 1 − e^(−2t/τ)，两者之和恒为 W₀' },
      tau: { label: '时间常数 τ', desc: 'RC 电路 τ = R_Th·C，RL 电路 τ = L/R_Th；单位都是秒' },
      cursor: { label: '时间光标 t', desc: '拖动或播放（每秒 1τ）；读数显示该时刻的剩余量与百分比' },
      ind: { label: '电感 L（0.5 H 继电器线圈）', desc: '维持电流 i(t) 不突变：i(0⁺) = i(0⁻) = I₀ = 2 A；储能 ½LI₀² = 1 J' },
      res_l: { label: '续流回路电阻 R（10 Ω）', desc: '串联在 RL 回路里，p_R = i²R：R 越大，磁能被吃得越快，τ = L/R 越小' },
      i_l: { label: '电感电流 i(t)', desc: '连续的状态量：i(t) = I₀ e^(−t/τ)，τ = L/R = 50 ms' },
      src_rl: { label: '直流源（换路前）', desc: '理论模型：t < 0 时在电感中建立稳态电流 I₀ = 2 A；t = 0 开关把电感切到续流电阻上（先通后断）' },
      vs: { label: '电压源 V_s = 24 V', desc: '理论例题的直流电源：t < 0 经闭合的 S 与 R₁ 供电；t > 0 随 S 断开整条支路脱离电路' },
      sw: { label: '开关 S', desc: 't < 0 长期闭合，t = 0 瞬间断开：V_s 与 R₁ 支路从此与右侧网络脱离' },
      r1: { label: 'R₁ = 6 Ω', desc: '挡在电源出口：t < 0 与右侧 6 Ω 等效电阻分压；S 断开后一端悬空，不再有电流' },
      r2: { label: 'R₂ = 12 Ω', desc: 'A 点到地：t < 0 承受 v_A；t > 0 与 R₃ 串联后接在电容两端，电压可以跳变' },
      r3: { label: 'R₃ = 6 Ω', desc: 'A 点到 B 点：t > 0 与 R₂ 串联（18 Ω）' },
      r4: { label: 'R₄ = 6 Ω', desc: 'B 点到地，直接跨在电容两端：t > 0 与 (R₂ + R₃) 并联' },
      cap_net: { label: '电容 C = 0.2 F', desc: '接在 B 点与地之间：t < 0 直流稳态视为开路，t > 0 向 R₂、R₃、R₄ 放电' },
      node_a: { label: '节点 A', desc: 'R₁、R₂、R₃ 的公共点；t < 0 由分压决定，t > 0 等于 v_R2' },
      node_b: { label: '节点 B（电容 +）', desc: 'R₃、R₄ 与电容的公共点：v_B = v_C' },
      r_th: { label: '戴维南等效电阻 R_Th', desc: 't > 0 时从电容两端向左看进去的纯电阻网络（V_s、R₁ 已脱离）；τ = R_Th·C' },
      jump: { label: 'v_R2 的换路跳变', desc: '电阻不储能，没有连续性约束：S 断开瞬间 v_R2 由电容经分压重新决定' },
      i_r1: { label: 'R₁ 支路电流', desc: 't < 0：电源经 R₁ 流向节点 A 的总电流' },
      i_r2: { label: 'R₂ 支路电流', desc: 't < 0：从 A 经 R₂ 流到地' },
      i_r34: { label: 'R₃–R₄ 支路电流', desc: 't < 0：从 A 经 R₃、R₄ 流到地（电容开路，不分流）' },
      i_r4: { label: 'R₄ 放电电流', desc: 't > 0：v_C / R₄' },
      i_r23: { label: 'R₃–R₂ 放电电流', desc: 't > 0：v_C / (R₂ + R₃)，从 B 经 R₃、A、R₂ 流到地' },
      energy_net: { label: '三个电阻的耗热', desc: 'W_k 随时间累积为 W_k(1 − e^(−2t/τ))，终值之和等于 W₀' },
      curve_r2: { label: 'v_R2(t) 波形', desc: 't < 0 为 v_A(0⁻)，t = 0 跳变后与 v_C(t) 同一个 τ 衰减' },
      scope: { label: '虚拟数字示波器', desc: 'CH1 测电容电压 v_C(t)：拨到放电端后屏幕实时画出 5 e^(−t) V；1 s 读 1.84 V，5 s 读 0.034 V' },
      probe: { label: 'CH1 探头与地夹', desc: '探头钩夹电容正极（长脚），地夹夹负极（GND）' },
      safety: { label: '面包板安全参数', desc: '阻值 < 100 Ω 且电容为毫法 / 法拉级的理论参数严禁直接上板；本课用 5 V / 10 kΩ / 100 µF：峰值 0.5 mA、2.5 mW' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '物理直觉与指数衰减的诞生 — 为什么“越放越慢”？',
      sync: at(L1, ['cap', 'res', 'i_r'], { topo: 'rc', sw: 'discharge', tn: 0.4 }),
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎回到 Breadboard Lab！前几节课我们已经把电容的“电压不能突变”和电感的“电流不能突变”刻进了脑子里。今天我们正式推开**动态电路（暂态分析）**的大门——撤掉外部独立电源，只留下储能元件和电阻，看看电路靠着自己肚子里存的那点能量，会如何优雅地“自然谢幕”。`,
        },
        { kind: 'p', text: '**1.1 教授讲授：从漏水桶到电容放电**' },
        { kind: 'p', text: '同学们先别急着写微分方程，我们先跟着 Boylestad 的思路建立一个极其牢固的物理直觉。' },
        {
          kind: 'p',
          text: '假设你面前有一个蓄满水的大水桶，底部开了一个小孔。刚开始水位最高，水压最大，水流喷得最猛，水位下降得最快；可过了一会儿，水位降了一半，水压也减半，水流变细了，水位下降的速度自然也就慢了一半。越往后，剩下的水越少，推动水流出的压力越小，所以水位**永远越降越慢**。',
        },
        { kind: 'p', text: R`把水桶换成已经充好电（初始电压 $V_0$）的[[cap|电容 $C$]]，把底部小孔换成并联在它两端的[[res|电阻 $R$]]：` },
        {
          kind: 'ol',
          items: [
            R`在 $t = 0^+$ 刚切入放电回路的瞬间，[[v_node|电容电压]]最高为 $V_0$，驱动的[[i_r|泄放电流 $i = v/R$]] 也最大，电荷流失最快，因此电压曲线的初始下降斜率最陡。`,
            R`随着电荷通过电阻变成热量散失，[[v_node|电容电压 $v(t)$]] 下降；电压一下降，流过电阻的[[i_r|电流 $i(t) = v(t)/R$]] 立刻按比例减小，电荷流失随之变慢。`,
            R`用一句话概括自然界最核心的衰减法则：**衰减的速度，严格正比于当前剩余的量**。在数学里，唯一满足“导数与自身成正比”的函数，就是**[[curve|自然指数函数 $e^{-t/\tau}$]]**。`,
          ],
        },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '1.2 内联 2D 教学图：RC 放电物理直觉与斜率递减对照',
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '无源 RC 自然响应的严格推导与能量守恒验证',
      sync: at(L2, ['curve', 'energy'], { mode: 'rc', ...LABP, sw: 'discharge', tn: 1, tan: false, marks: false, bars: true }),
      blocks: [
        { kind: 'figure', svg: SVG_ACT2, caption: '2.1 内联 2D 教学图：无源 RC 放电标准回路与参考方向' },
        { kind: 'p', text: '**2.2 三段式教授板书推导：无源 RC 微分方程与能量守恒**' },
        { kind: 'note', tone: 'tip', text: '**板书铁律**：先把公理和纯符号推到底，绝不在半路塞进具体数字；等通式彻底成型，再代入面包板安全实测参数检验！' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`对图 2-1 顶部节点列基尔霍夫电流定律（KCL，均取流出节点为正），并结合[[cap|电容]]与[[res|电阻]]的伏安关系（VCR）：$i_C(t) + i_R(t) = 0$；$i_C(t) = C\dfrac{dv(t)}{dt}, \qquad i_R(t) = \dfrac{v(t)}{R}$。将两个 VCR 代入 KCL，得到一阶齐次线性常微分方程：`,
        },
        { kind: 'formula', title: '一阶齐次线性常微分方程与初值：', tex: R`C\frac{dv(t)}{dt} + \frac{v(t)}{R} = 0, \qquad \text{初值条件：} v(0^+) = v(0^-) = V_0` },
        { kind: 'formula', title: R`② 纯符号通式：两边同除以 $C$ 并分离变量：`, tex: R`\frac{dv}{dt} + \frac{1}{RC}v = 0 \implies \frac{dv}{v} = -\frac{1}{RC}\,dt` },
        {
          kind: 'formula',
          title: R`从 $t = 0$（对应电压 $V_0$）积分到任意时刻 $t$（对应电压 $v(t)$）：`,
          tex: R`\begin{gathered} \int_{V_0}^{v(t)} \frac{dv'}{v'} = -\int_0^t \frac{1}{RC}\,dt' \\[6pt] \ln\frac{v(t)}{V_0} = -\frac{t}{RC} \end{gathered}`,
        },
        { kind: 'formula', title: R`两边取自然指数，并定义**[[tau|RC 电路时间常数]]** $\tau = RC$：`, tex: R`v(t) = V_0 e^{-t/\tau}, \qquad \tau = RC \quad (t \ge 0)` },
        {
          kind: 'formula',
          title: '接下来我们用纯符号严格验证**能量守恒**！电阻上的瞬时电流与瞬时耗散功率为：',
          tex: R`i_R(t) = \frac{v(t)}{R} = \frac{V_0}{R}e^{-t/\tau}, \qquad p_R(t) = \frac{v^2(t)}{R} = \frac{V_0^2}{R}e^{-2t/\tau}`,
        },
        {
          kind: 'formula',
          title: R`电阻在 $[0, t]$ 内累计耗散的热能为：`,
          tex: R`w_R(t) = \int_0^t p_R(\xi)\,d\xi = \frac{V_0^2}{R}\left[-\frac{\tau}{2}e^{-2\xi/\tau}\right]_0^t = \frac{1}{2}CV_0^2\left(1 - e^{-2t/\tau}\right)`,
        },
        { kind: 'formula', title: R`令 $t \to \infty$，电阻消耗的总热量为：`, tex: R`w_R(\infty) = \int_0^\infty p_R(t)\,dt = \frac{1}{2}CV_0^2 = w_C(0)` },
        {
          kind: 'p',
          text: R`**教授批注**：注意指数上是 $-2t/\tau$！电压按 $e^{-t/\tau}$ 衰减，而能量与电压平方成正比，所以[[energy|能量按 $e^{-2t/\tau}$ 衰减]]——速度是电压衰减的两倍！在 $t = 1\tau$ 时，电容已经释放了 $1 - e^{-2} \approx 86.47\%$ 的能量！`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（面包板安全实测参数）',
          steps: [
            {
              label: '已知',
              text: R`取面包板实操层的安全参数：$V_0 = 5\text{ V}$，[[res|$R = 10\text{ k}\Omega = 10^4\ \Omega$]]，[[cap|$C = 100\ \mu\text{F} = 10^{-4}\text{ F}$]]。`,
            },
            { label: R`1. **求[[tau|时间常数 $\tau$]]**：`, tex: R`\tau = RC = (10^4\ \Omega) \times (10^{-4}\text{ F}) = 1.0\text{ s}` },
            { label: '2. **写电压与电流解析式**：', tex: R`v(t) = 5 e^{-t/1.0} = 5 e^{-t}\text{ V}, \qquad i_R(t) = \frac{5}{10^4}e^{-t} = 0.5 e^{-t}\text{ mA}` },
            {
              label: '3. **验证关键时刻电压与总能量**：',
              text: R`初始峰值电流 $I_0 = 0.50\text{ mA}$，电阻初始峰值功率 $P_0 = \frac{5^2}{10^4} = 2.50\text{ mW} \ll 250\text{ mW}$（绝对安全）。初始储能 $w_C(0) = \frac{1}{2}(10^{-4})(5^2) = 1.25\text{ mJ}$。`,
            },
            { label: R`$t = 1\text{ s}\ (1\tau)$：`, tex: R`v(1) = 5 e^{-1} \approx 1.8394\text{ V} \approx 1.84\text{ V}` },
            { label: R`$t = 5\text{ s}\ (5\tau)$：`, tex: R`v(5) = 5 e^{-5} \approx 0.0337\text{ V} \approx 33.7\text{ mV}` },
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: R`时间常数 $\tau$ 的几何与工程意义（$1\tau$ 切线法则与 $5\tau$ 稳态判据）`,
      sync: at(L2, ['tangent', 'mark_1tau', 'steady'], { mode: 'rc', ...LABP, sw: 'discharge', tn: 1, tan: true, marks: true, bars: false }),
      blocks: [
        { kind: 'p', text: R`**3.1 教授讲授：用几何切线“一眼看穿” $\tau$**` },
        { kind: 'p', text: R`[[tau|时间常数 $\tau$]] 不是一个抽象的代数符号，它在示波器屏幕上有着极其漂亮的几何身份：` },
        { kind: 'formula', title: R`对 $v(t) = V_0 e^{-t/\tau}$ 在 $t = 0$ 处求一阶导数，得到初始下降斜率：`, tex: R`\left.\frac{dv}{dt}\right|_{t=0} = -\frac{V_0}{\tau}` },
        { kind: 'formula', title: R`由此写出 $t = 0$ 处的[[tangent|切线方程]]：`, tex: R`v_{\text{tan}}(t) = V_0 - \frac{V_0}{\tau}t = V_0\left(1 - \frac{t}{\tau}\right)` },
        { kind: 'p', text: R`令 $v_{\text{tan}}(t) = 0$，立即解得 $t = \tau$！` },
        {
          kind: 'p',
          text: R`这句话的物理翻译无比精彩：**如果电容一直保持 $t = 0$ 瞬间那股最猛的初始泄放速率不减缓，它恰好会在 $t = \tau$ 时刻把电彻底放光。** 正是因为它“越放越慢”，所以在真正到达 $t = \tau$ 时，它并没有归零，而是优雅地[[mark_1tau|剩下了 $e^{-1} \approx 36.79\%$]]。`,
        },
        {
          kind: 'table',
          head: ['经过时间', R`剩余电压占比 $v(t)/V_0 = e^{-t/\tau}$`, '已衰减电压占比', R`累计耗散能量占比 $1 - e^{-2t/\tau}$`, '工程意义'],
          rows: [
            [R`$t = 0$`, R`$100.00\%$`, R`$0.00\%$`, R`$0.00\%$`, R`放电起点，初始切线直指 $1\tau$`],
            [R`$t = 1\tau$`, R`$36.79\%$`, R`$63.21\%$`, R`$86.47\%$`, '特征时间点，能量已释放超八成半'],
            [R`$t = 2\tau$`, R`$13.53\%$`, R`$86.47\%$`, R`$98.17\%$`, '绝大部分储能已转化为热能'],
            [R`$t = 3\tau$`, R`$4.98\%$`, R`$95.02\%$`, R`$99.75\%$`, R`剩余电压跌破 $5\%$`],
            [R`$t = 4\tau$`, R`$1.83\%$`, R`$98.17\%$`, R`$99.97\%$`, '逼近稳态边界'],
            [R`$t = 5\tau$`, R`$0.67\%$`, R`$99.33\%$`, R`$\approx 100.00\%$`, R`**[[steady|工程稳态判据]]（剩余不足 $1\%$）**`],
          ],
        },
      ],
      inline_svg: SVG_ACT3,
      figure_caption: '3.2 内联 2D 教学图：精确绘制的 e^(−t/τ) 指数衰减曲线（含 1τ 切线与 1τ–5τ 刻度）',
    },
    /* ---------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: R`对偶之美 — 无源 RL 衰减电路与 $\tau = L/R$ 的物理反直觉`,
      sync: at(L2, ['ind', 'res_l', 'tau'], { mode: 'rl', lS: 0.5, rlR: 10, sw: 'discharge', tn: 1, tan: true, marks: true, bars: true }),
      blocks: [
        { kind: 'p', text: '**4.1 教授讲授：为什么电阻越大，RC 放得越慢，RL 却衰得越快？**' },
        { kind: 'p', text: '这是期末考试和面试里最常让人“脑子打结”的直觉陷阱：' },
        {
          kind: 'ul',
          items: [
            R`在 **无源 RC 电路** 中，$\tau = RC$。电阻 $R$ 越大，泄放通道越窄，电流 $v/R$ 越小，电容里的电荷要排很久才能放完，所以 $\tau$ **变大**（衰减变慢）。`,
            R`在 **无源 RL 电路** 中，$\tau = L/R$。[[ind|电感]]维持的是**[[i_l|电流]]** $i(t)$，抵抗电流消失。此时[[res_l|电阻 $R$]] 串联在回路里，消耗功率 $p_R = i^2 R$。$R$ 越大，同样的电流经过它时被“烧掉”的磁能越猛烈，电感里的磁场能量瞬间就被电阻吃光了，所以 $\tau$ **变小**（衰减变快）！如果 $R \to \infty$（强行拉断电感回路），$\tau \to 0$，电流瞬间跌零就会产生极高的反向感应高压 $v_L = L\frac{di}{dt}$——这就是继电器线圈必须并联续流二极管的原因。`,
          ],
        },
        { kind: 'figure', svg: SVG_ACT4, caption: '4.2 内联 2D 教学图：无源 RL 衰减回路与 RC/RL 对偶关系' },
        { kind: 'p', text: '**4.3 三段式教授板书推导：无源 RL 自然响应**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`对图 4-1 单回路按顺时针方向列基尔霍夫电压定律（KVL），并代入[[ind|电感]]与[[res_l|电阻]]的伏安关系：$v_L(t) + v_R(t) = 0$；$v_L(t) = L\dfrac{di(t)}{dt}, \qquad v_R(t) = R i(t)$。得到无源 RL 一阶齐次线性微分方程：`,
        },
        { kind: 'formula', title: '无源 RL 一阶齐次线性微分方程与初值：', tex: R`L\frac{di(t)}{dt} + R i(t) = 0, \qquad \text{初值条件：} i(0^+) = i(0^-) = I_0` },
        {
          kind: 'formula',
          title: R`② 纯符号通式：两边同除以 $L$ 并分离变量积分：`,
          tex: R`\begin{gathered} \frac{di}{i} = -\frac{R}{L}\,dt \implies \int_{I_0}^{i(t)} \frac{di'}{i'} = -\int_0^t \frac{R}{L}\,dt' \\[6pt] \ln\frac{i(t)}{I_0} = -\frac{R}{L}t \end{gathered}`,
        },
        {
          kind: 'formula',
          title: R`定义**[[tau|RL 电路时间常数]]** $\tau = L/R$，得到自然响应电流通式：`,
          tex: R`i(t) = I_0 e^{-t/\tau}, \qquad \tau = \frac{L}{R} \quad (t \ge 0)`,
        },
        {
          kind: 'formula',
          title: '验证电阻总耗散能量：',
          tex: R`w_R(\infty) = \int_0^\infty i^2(t) R\,dt = I_0^2 R \int_0^\infty e^{-2Rt/L}\,dt = I_0^2 R \cdot \frac{L}{2R} = \frac{1}{2}LI_0^2 = w_L(0)`,
        },
        { kind: 'p', text: '能量再次严丝合缝地守恒！' },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '已知', text: R`设某工业继电器线圈[[ind|电感 $L = 0.5\text{ H}$]]，续流回路总电阻 [[res_l|$R = 10\ \Omega$]]，换路前稳态电流 $I_0 = 2\text{ A}$：` },
            { label: '1. **时间常数**：', tex: R`\tau = \frac{L}{R} = \frac{0.5\text{ H}}{10\ \Omega} = 0.05\text{ s} = 50\text{ ms}` },
            { label: '2. **电流与初始储能**：', tex: R`i(t) = 2 e^{-t/0.05} = 2 e^{-20t}\text{ A}, \qquad w_L(0) = \frac{1}{2}(0.5)(2^2) = 1.0\text{ J}` },
            { label: R`3. **求 $t = 0.1\text{ s}\ (2\tau)$ 时的电流**：`, tex: R`i(0.1\text{ s}) = 2 e^{-20 \times 0.1} = 2 e^{-2} \approx 0.2707\text{ A}` },
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**[[safety|面包板安全提醒]]**：此例题电阻 $R = 10\ \Omega < 100\ \Omega$，初始电流 $2\text{ A}$、瞬时功率高达 $40\text{ W}$，属于理论与电力电子级参数，**不可**直接插在教学面包板上演示。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '带开关多电阻网络的戴维南等效与综合实战',
      sync: at(L1, ['sw', 'r_th'], net(0, { sw: 'charge', tn: 0, thev: false, mode: 'net' })),
      blocks: [
        { kind: 'p', text: '**5.1 教授讲授：复杂开关网络的“四步通关法”**' },
        { kind: 'p', text: '真实电路里极少只有“一个电容配一个电阻”。一旦出现开关和三四个电阻，请严格遵守这四个步骤，绝不会错：' },
        {
          kind: 'ol',
          items: [
            R`**看 $t = 0^-$（换路前稳态）**：直流电源已接通很久，**电容当开路、电感当短路**，求出电容初始电压 $v_C(0^-)$ 或电感初始电流 $i_L(0^-)$。`,
            R`**用换路定则跨过 $t = 0$**：电容电压不突变 $v_C(0^+) = v_C(0^-)$；电感电流不突变 $i_L(0^+) = i_L(0^-)$。（切记：电阻电压和电阻电流**可以**突变！）`,
            R`**看 $t > 0$（换路后无源拓扑）**：把储能元件暂时摘下来，从它的两个端口向剩余纯电阻网络看进去，求出**[[r_th|戴维南等效电阻 $R_{Th}$]]**，从而确定 $\tau = R_{Th} C$ 或 $\tau = L/R_{Th}$。`,
            R`**写通解与算能量分配**：写出 $v_C(t)$ 或 $i_L(t)$，再利用串并联分压/分流求出任意指定电阻的瞬态波形及**能量耗散占比**。`,
          ],
        },
        {
          kind: 'figure',
          svg: SVG_ACT5_TASK,
          caption: '5.2 内联 2D 教学图：带开关多电阻网络 t<0 与 t>0 双拓扑对比（例题要求的数值暂以 ? 表示，引导例题完成后揭晓）',
        },
        { kind: 'p', text: '**5.3 三段式教授板书推导：带开关多电阻 RC 综合例题**' },
        {
          kind: 'p',
          text: R`**题目**：如图 5-1 所示，[[vs|$V_s = 24\text{ V}$]]，[[r1|$R_1 = 6\ \Omega$]]，[[r2|$R_2 = 12\ \Omega$]]，[[r3|$R_3 = 6\ \Omega$]]，[[r4|$R_4 = 6\ \Omega$]]，[[cap_net|$C = 0.2\text{ F}$]]。[[sw|开关 $S$]] 在 $t < 0$ 时已长期闭合，于 $t = 0$ 瞬间断开。求：（1）$t \ge 0$ 时的电容电压 $v_C(t)$ 与 $R_2$ 两端电压 $v_{R_2}(t)$；（2）电容初始储能 $W_0$ 及 $t > 0$ 后三个电阻各自消耗的热能与占比，并验证能量守恒。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`直流稳态公理（$t = 0^-$）：$\frac{dv_C}{dt} = 0 \implies i_C(0^-) = 0$，电容等效为**开路**；由分压与并联化简求 $v_C(0^-)$。换路定则：$v_C(0^+) = v_C(0^-)$。戴维南等效定理（$t > 0$）：无源线性电阻网络从电容端口看入可等效为单一电阻 [[r_th|$R_{Th}$]]，故 $v_C(t)$ 满足一阶无源 RC 微分方程 $C\frac{dv_C}{dt} + \frac{v_C}{R_{Th}} = 0$。焦耳热积分公理：$W_{R_k} = \int_0^\infty p_{R_k}(t)\,dt$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · 1. **$t = 0^-$ 稳态初值**：`,
          tex: R`\begin{gathered} R_{\text{right}} = R_2 \parallel (R_3 + R_4), \qquad v_A(0^-) = V_s \frac{R_{\text{right}}}{R_1 + R_{\text{right}}} \\[6pt] V_0 = v_C(0^+) = v_C(0^-) = v_A(0^-) \frac{R_4}{R_3 + R_4} \end{gathered}`,
        },
        {
          kind: 'formula',
          title: R`2. **$t > 0$ 戴维南等效电阻与时间常数**：开关断开后，$R_2$ 与 $R_3$ 串联，再与 $R_4$ 并联于电容两端：`,
          tex: R`R_{23} = R_2 + R_3, \qquad R_{Th} = R_{23} \parallel R_4 = \frac{(R_2 + R_3)R_4}{R_2 + R_3 + R_4}, \qquad \tau = R_{Th} C`,
        },
        {
          kind: 'formula',
          title: '3. **响应波形通式**：',
          tex: R`v_C(t) = V_0 e^{-t/\tau}, \qquad i_{R_{23}}(t) = \frac{v_C(t)}{R_2 + R_3}, \qquad v_{R_2}(t) = \frac{R_2}{R_2 + R_3}v_C(t)`,
        },
        { kind: 'formula', title: '4. **能量分配通式**：', tex: R`W_0 = \frac{1}{2}CV_0^2` },
        {
          kind: 'formula',
          title: R`由于 $R_4$ 与 $R_{23}$ 并联在相同电压 $v_C(t)$ 两端，其瞬时功率之比恒等于电导之比：`,
          tex: R`\begin{gathered} W_{R_4} = \int_0^\infty \frac{v_C^2(t)}{R_4}\,dt = \frac{V_0^2 \tau}{2 R_4} = W_0 \frac{R_{Th}}{R_4} \\[6pt] W_{R_2} = \int_0^\infty i_{R_{23}}^2(t) R_2\,dt = W_0 \frac{R_{Th}}{R_2 + R_3}\cdot\frac{R_2}{R_2 + R_3}, \qquad W_{R_3} = W_0 \frac{R_{Th}}{R_2 + R_3}\cdot\frac{R_3}{R_2 + R_3} \end{gathered}`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '③ 代入数值这一步先不写：下面的苏格拉底引导例题就是这道题。自己闯关之后，完整推导作为“通关复盘”板书紧跟在后面。左侧 01 原理图切到了这个网络，例题要求的数值暂时显示为“?”。',
        },
        {
          kind: 'guided',
          title: '带开关多电阻 RC 网络的自然响应与能量守恒审计',
          source: '本课 5.3 综合例题（图 5-1）',
          problem: R`同 5.3 题目：$V_s = 24\text{ V}$，$R_1 = 6\ \Omega$，$R_2 = 12\ \Omega$，$R_3 = 6\ \Omega$，$R_4 = 6\ \Omega$，$C = 0.2\text{ F}$；开关 $S$ 在 $t < 0$ 时长期闭合，$t = 0$ 断开。按五步拆解：锁定 $t = 0^-$ 初值 → 跨过 $t = 0$ → 求 $R_{Th}$ 与 $\tau$ → 写出 $v_C(t)$、$v_{R_2}(t)$ → 核算能量守恒。`,
          done_params: { reveal: 9 },
          steps: [
            {
              title: R`第一步：锁定 $t = 0^-$ 稳态初值 $v_C(0^-)$`,
              mini_svg: MINI_STEP1,
              question: R`开关 $S$ 在 $t < 0$ 时已经闭合了很久，此时电容在直流稳态下等效为什么？请由此算出节点 A 电压与电容初始电压 $v_C(0^-)$。`,
              hint: R`$R_{\text{right}} = R_2 \parallel (R_3 + R_4) = 12 \parallel 12 = 6\ \Omega, \quad v_A(0^-) = V_s \frac{R_{\text{right}}}{R_1 + R_{\text{right}}}$`,
              options: [
                {
                  text: R`电容视为短路：B 点被拉到地，$v_C(0^-) = 0\text{ V}$`,
                  correct: false,
                  feedback: R`等一下！直流稳态下 $\frac{dv_C}{dt} = 0$，所以 $i_C = C\frac{dv_C}{dt} = 0$——电容里没有电流，它等效为**开路**，不是导线。把它当短路，B 点就被硬拉到 0 V，电容根本没有储能，后面也就无“自然响应”可言了。`,
                },
                {
                  text: R`电容视为开路；$v_A(0^-) = 12\text{ V}$，$v_C(0^-) = 6\text{ V}$`,
                  correct: true,
                  feedback: R`正确！电容开路后，$R_2$ 与 $(R_3 + R_4)$ 并联只剩 $6\ \Omega$，和 $R_1 = 6\ \Omega$ 对半分得 $v_A = 12\text{ V}$；$R_3$、$R_4$ 再把 12 V 对半分，$v_C(0^-) = 6\text{ V}$。`,
                },
                {
                  text: R`电容视为开路；直接用 24 V 对 $R_3$、$R_4$ 分压：$v_C(0^-) = 12\text{ V}$`,
                  correct: false,
                  feedback:
                    '等等！先别急着对 24 V 直接分压。R1=6 Ω 挡在电源出口，右边是 R2=12 Ω 与 (R3+R4)=12 Ω 并联，它们合起来才 6 Ω！所以节点 A 只能分到一半电压 12 V，电容再从 12 V 里分一半，是多少？',
                },
              ],
              board: [R`v_A(0^-) = 24 \times \frac{6}{6+6} = 12\text{ V}`, R`\implies v_C(0^-) = 12 \times \frac{6}{6+6} = 6\text{ V}`],
              halo: ['node_a', 'node_b', 'cap_net'],
              params: net(0, { sw: 'charge', tn: 0, thev: false }),
              layer: L1,
            },
            {
              title: R`第二步：应用换路定则跨越 $t = 0$`,
              mini_svg: MINI_STEP2,
              question: R`$t = 0$ 开关瞬间断开后，电容电压 $v_C(0^+)$ 与电阻 $R_2$ 两端电压 $v_{R_2}(0^+)$ 哪个保持不变，哪个会发生跳变？`,
              hint: R`$v_C(0^+) = v_C(0^-) = V_0, \quad \text{电阻电压无连续性约束}$`,
              options: [
                {
                  text: R`两个都不能突变：$v_C(0^+) = 6\text{ V}$，$v_{R_2}(0^+) = v_A(0^-) = 12\text{ V}$`,
                  correct: false,
                  feedback:
                    '好险！记住只有储能元件的状态量（电容电压、电感电流）受能量有限性保护不能突变。电阻不储能，开关一断开，R2 失去 24 V 支撑，电压瞬间就由电容经 R3 分压决定，立刻跳变！',
                },
                {
                  text: R`两个都会跳变：开关一断开电容就失去电源支撑，$v_C$ 立刻跌到 $0\text{ V}$`,
                  correct: false,
                  feedback: R`电容电压若在一瞬间跳到 0，储能 $\frac{1}{2}Cv_C^2$ 就要在零时间里消失，需要无穷大的电流 $i_C = C\frac{dv_C}{dt}$——没有任何电阻支路做得到。开关只切断了电源支路，极板上的电荷还在，$v_C(0^+) = v_C(0^-) = 6\text{ V}$。`,
                },
                {
                  text: R`$v_C(0^+) = v_C(0^-) = 6\text{ V}$ 保持不变；$v_{R_2}$ 会发生跳变`,
                  correct: true,
                  feedback: '对！电容电压是受换路定则保护的状态量，稳稳守住 6 V；R₂ 不储能，开关断开后它的电压立刻改由电容经 R₃ 分压决定，发生合法跳变。',
                },
              ],
              board: [R`v_C(0^+) = v_C(0^-) = 6\text{ V}`],
              halo: ['cap_net', 'r2', 'jump'],
              params: net(1, { sw: 'discharge', tn: 0, thev: false }),
              layer: L1,
            },
            {
              title: R`第三步：在 $t > 0$ 无源拓扑中求戴维南等效电阻 $R_{Th}$`,
              mini_svg: MINI_STEP3,
              question: R`开关断开后，$V_s$ 与 $R_1$ 彻底脱离电路。请从电容 $C$ 两端向左看进去，算出戴维南等效电阻 $R_{Th}$ 和时间常数 $\tau$。`,
              hint: R`$R_{Th} = (R_2 + R_3) \parallel R_4 = \frac{18 \times 6}{18 + 6}, \quad \tau = R_{Th} C$`,
              options: [
                {
                  text: R`$R_{Th} = (R_2 + R_3) \parallel R_4 = 18 \parallel 6 = 4.5\ \Omega$，$\tau = R_{Th}C = 0.9\text{ s}$`,
                  correct: true,
                  feedback: R`正确！S 断开后 $R_1$ 一头悬空，只剩 $R_2$、$R_3$ 串联（$18\ \Omega$）再与 $R_4$（$6\ \Omega$）并联：$4.5\ \Omega$；$\tau = 4.5 \times 0.2 = 0.9\text{ s}$。`,
                },
                {
                  text: R`把 $R_1$ 也算进来：$R_{Th} = [(R_1 \parallel R_2) + R_3] \parallel R_4 = 10 \parallel 6 = 3.75\ \Omega$，$\tau = 0.75\text{ s}$`,
                  correct: false,
                  feedback: '停一下！看看开关 S 的位置：它把 Vs 和 R1 整条支路都切掉了，R1 一头悬空，根本没有电流能流过它。请只在真正闭合的 R2、R3、R4 网络里求 R_Th！',
                },
                {
                  text: R`三个电阻首尾串成一串：$R_{Th} = R_2 + R_3 + R_4 = 24\ \Omega$，$\tau = 4.8\text{ s}$`,
                  correct: false,
                  feedback: R`再看一眼 $R_4$ 的两端：一端是 B 点，一端是地——正好就是电容的两个端口。它和 $(R_2 + R_3)$ 这条支路并排挂在电容上，是**并联**；$R_4$ 的放电电流回到地，根本不经过 $R_2$、$R_3$。`,
                },
              ],
              board: [R`R_{Th} = 18 \parallel 6 = 4.5\ \Omega, \quad \tau = 4.5 \times 0.2 = 0.9\text{ s}`],
              halo: ['r_th', 'r2', 'r3', 'r4'],
              params: net(2, { sw: 'discharge', tn: 0, thev: true }),
              layer: L1,
            },
            {
              title: R`第四步：写出自然响应 $v_C(t)$ 与支路电压 $v_{R_2}(t)$`,
              mini_svg: MINI_STEP4,
              question: R`结合初值 $V_0 = 6\text{ V}$ 和时间常数 $\tau = 0.9\text{ s}$，写出 $t \ge 0$ 时的 $v_C(t)$，并用分压公式写出 $t > 0$ 时 $R_2$ 两端电压 $v_{R_2}(t)$。`,
              hint: R`$v_C(t) = V_0 e^{-t/\tau}, \quad v_{R_2}(t) = \frac{R_2}{R_2 + R_3} v_C(t)$`,
              options: [
                {
                  text: R`$v_C(t) = 6 e^{-t/0.9}\text{ V}$，$v_{R_2}(t) = 2 e^{-t/0.9}\text{ V}$`,
                  correct: false,
                  feedback: '检查一下你要算的是哪个电阻！R2 = 12 Ω 和 R3 = 6 Ω 串联承受共同的电压 v_C(t)，大电阻分大电压，R2 应该占 12/(12+6) = 2/3 才对。',
                },
                {
                  text: R`$v_C(t) = 6 e^{-t/0.9}\text{ V}$，$v_{R_2}(t) = 6 e^{-t/0.9}\text{ V}$`,
                  correct: false,
                  feedback: R`$R_2$ 并没有直接跨在电容两端：它和 $R_3$ 串联之后才接到电容上，$v_C(t)$ 要在 $R_2$、$R_3$ 之间按阻值分配。$R_3$ 上也有压降，所以 $v_{R_2}$ 只是 $v_C$ 的一部分。`,
                },
                {
                  text: R`$v_C(t) = 6 e^{-t/0.9}\text{ V}$，$v_{R_2}(t) = 4 e^{-t/0.9}\text{ V}$`,
                  correct: true,
                  feedback: R`完全正确！$R_2$ 与 $R_3$ 串联承受 $v_C(t)$，$R_2$ 分得 $\frac{12}{18} = \frac{2}{3}$：$v_{R_2}(t) = 4e^{-t/0.9}\text{ V}$。两条支路的电压用同一个 $\tau$ 同步衰减。`,
                },
              ],
              board: [R`v_C(t) = 6 e^{-t/0.9}\text{ V},`, R`v_{R_2}(t) = \frac{12}{18} \cdot 6 e^{-t/0.9} = 4 e^{-t/0.9}\text{ V}`],
              halo: ['curve', 'curve_r2'],
              params: net(3, { mode: 'net', sw: 'discharge', tn: 1, tan: false, marks: false, bars: false }),
              layer: L2,
            },
            {
              title: '第五步：计算各电阻耗散能量并验证能量守恒',
              mini_svg: MINI_STEP5,
              question: R`电容初始储存了多少焦耳能量 $W_0$？放电结束后，$R_4$、$R_2$、$R_3$ 各自吃掉了多少焦耳，总和是否严格等于 $W_0$？`,
              hint: R`$W_0 = \frac{1}{2}CV_0^2, \quad W_{R_4} = \int_0^\infty \frac{v_C^2(t)}{R_4}\,dt = W_0 \frac{R_{Th}}{R_4}$`,
              options: [
                {
                  text: R`$W_0 = 3.6\text{ J}$；$W_{R_4} = 5.4\text{ J}$，$W_{R_2} = 1.2\text{ J}$，$W_{R_3} = 0.6\text{ J}$（合计 $7.2\text{ J}$）`,
                  correct: false,
                  feedback: '哇，能量怎么凭空翻倍了？检查你的积分：∫ e^(-2t/τ) dt 等于 τ/2，而不是 τ！那个系数 1/2 刚好把总热能精准拉回 1/2 C V0^2 = 3.6 J！',
                },
                {
                  text: R`$W_0 = 3.6\text{ J}$；$W_{R_4} = 2.7\text{ J}$，$W_{R_2} = 0.6\text{ J}$，$W_{R_3} = 0.3\text{ J}$（合计 $3.6\text{ J}$）`,
                  correct: true,
                  feedback: R`漂亮！$W_0 = \frac{1}{2}(0.2)(6^2) = 3.6\text{ J}$；$R_4$ 拿走 $\frac{R_{Th}}{R_4} = 75\%$，$R_{23}$ 支路的 $25\%$ 再按 $12 : 6$ 分给 $R_2$、$R_3$——一焦耳不多，一焦耳不少。`,
                },
                {
                  text: R`$W_0 = 3.6\text{ J}$；按阻值大小分配：$W_{R_2} = 1.8\text{ J}$，$W_{R_3} = W_{R_4} = 0.9\text{ J}$`,
                  correct: false,
                  feedback: R`热量不是按阻值大小分的！$R_4$ 与 $(R_2 + R_3)$ 并联在同一个 $v_C(t)$ 上，功率 $v^2/R$ 与电阻成**反比**：$6\ \Omega$ 的 $R_4$ 反而吃掉 $\frac{R_{Th}}{R_4} = 75\%$。只有在串联的 $R_2$、$R_3$ 之间（电流相同）才按阻值 $12 : 6$ 分。`,
                },
              ],
              board: [R`W_0 = 3.6\text{ J}`, R`= W_{R_4}(2.7\text{ J}) + W_{R_2}(0.6\text{ J}) + W_{R_3}(0.3\text{ J}) \quad \checkmark`],
              halo: ['r4', 'r2', 'r3', 'energy_net'],
              params: net(4, { sw: 'discharge', tn: 0, thev: true }),
              layer: L1,
            },
          ],
          conclusion: R`五步通关：$v_C(0^-) = 6\text{ V}$ → $v_C(0^+) = 6\text{ V}$（$v_{R_2}$ 跳变）→ $R_{Th} = 4.5\ \Omega$、$\tau = 0.9\text{ s}$ → $v_C(t) = 6e^{-t/0.9}\text{ V}$、$v_{R_2}(t) = 4e^{-t/0.9}\text{ V}$ → $3.6\text{ J} = 2.7 + 0.6 + 0.3\text{ J}$。左侧 01 原理图与 02 示波器的读数已全部揭晓（点「▶ 播放」看三个电阻的耗热累积）；下面的通关复盘把这道题的 ③ 板书完整写一遍。`,
        },
        { kind: 'p', text: '**通关复盘 · 5.3 三段式板书（③ 代入数值逐步化简）**' },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '代入', text: R`$V_s = 24\text{ V}, R_1 = 6\ \Omega, R_2 = 12\ \Omega, R_3 = 6\ \Omega, R_4 = 6\ \Omega, C = 0.2\text{ F}$：` },
            {
              label: R`1. **求 $V_0$**：`,
              tex: R`\begin{gathered} R_{\text{right}} = 12 \parallel (6 + 6) = 12 \parallel 12 = 6\ \Omega \\[6pt] v_A(0^-) = 24 \times \frac{6}{6 + 6} = 12\text{ V}, \qquad V_0 = v_C(0^+) = 12 \times \frac{6}{6 + 6} = 6\text{ V} \end{gathered}`,
            },
            {
              label: R`2. **求 $R_{Th}$ 与 $\tau$**：`,
              tex: R`\begin{gathered} R_{23} = 12 + 6 = 18\ \Omega, \qquad R_{Th} = 18 \parallel 6 = \frac{18 \times 6}{18 + 6} = \frac{108}{24} = 4.5\ \Omega \\[6pt] \tau = R_{Th} C = 4.5 \times 0.2 = 0.9\text{ s} \end{gathered}`,
            },
            {
              label: '3. **求瞬态电压**：',
              tex: R`\begin{gathered} v_C(t) = 6 e^{-t/0.9} = 6 e^{-\frac{10}{9}t}\text{ V} \quad (t \ge 0) \\[6pt] v_{R_2}(t) = \frac{12}{12 + 6} \cdot 6 e^{-t/0.9} = 4 e^{-t/0.9}\text{ V} \quad (t > 0) \end{gathered}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授提醒**：注意到没有？$t = 0^-$ 时 $v_{R_2}(0^-) = v_A(0^-) = 12\text{ V}$，而 $t = 0^+$ 时 $v_{R_2}(0^+) = 4\text{ V}$！电阻电压在换路瞬间发生了从 $12\text{ V}$ 到 $4\text{ V}$ 的**[[jump|合法跳变]]**，只有电容电压稳稳守住了 $6\text{ V}$！`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（续）',
          steps: [
            {
              label: '4. **能量守恒精确核算**：',
              tex: R`\begin{gathered} W_0 = \frac{1}{2} \times 0.2 \times 6^2 = 3.6\text{ J} \\[4pt] W_{R_4} = 3.6 \times \frac{4.5}{6} = 2.7\text{ J}\ (75.00\%) \\[4pt] W_{R_2} = 3.6 \times \frac{4.5}{18} \times \frac{12}{18} = 0.6\text{ J}\ (16.67\%) \\[4pt] W_{R_3} = 3.6 \times \frac{4.5}{18} \times \frac{6}{18} = 0.3\text{ J}\ (8.33\%) \\[4pt] W_{R_4} + W_{R_2} + W_{R_3} = 2.7 + 0.6 + 0.3 = 3.6\text{ J} = W_0 \quad \checkmark \end{gathered}`,
            },
          ],
        },
      ],
      inline_svg: SVG_ACT5,
      figure_caption: '图 5-1（数值已揭晓）：带开关多电阻 RC 网络拓扑切换——左：t < 0 充电稳态；右：t > 0 无源放电求 R_Th',
    },
    /* ---------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '3D 面包板安全实测、工程缩放与综合诊断',
      sync: at(L3, ['supply', 'spdt', 'cap', 'res', 'scope'], { cam: 'bench', reveal: 9, sw: 'charge', tn: 0, pol: 'ok' }),
      blocks: [
        { kind: 'p', text: R`**6.1 教授讲授：为什么实验室要把 $\Omega / \text{F}$ 缩放成 $\text{k}\Omega / \mu\text{F}$？**` },
        {
          kind: 'p',
          text: R`同学们马上要切到左侧舞台第 3 层（03 3D 面包板）亲手插接 RC 放电电路了。先别急着动手，看看为什么刚才第 5 幕的例题（$R_{Th} = 4.5\ \Omega, C = 0.2\text{ F}$）不能直接搬上桌：`,
        },
        {
          kind: 'ul',
          items: [
            R`理论题里为了口算方便常写几欧姆配零点几法拉，但真实世界里 $0.2\text{ F}$ 是超级电容级别，$4.5\ \Omega$ 放电瞬时电流超过 $1.3\text{ A}$，普通面包板弹簧片接触电阻和 $1/4\text{ W}$ 碳膜电阻会瞬间发烫冒烟。`,
            R`工程缩放秘诀：**把电阻放大 $2000\text{ 倍}$ 到 $\text{k}\Omega$ 级，把电容缩小 $2000\text{ 倍}$ 到 $\mu\text{F}$ 级，乘积 $\tau = RC$ 保持在完美的秒级！**`,
            R`本课 3D 实操标准件：[[supply|$V_s = 5\text{ V}$]]，[[res|$R = 10\text{ k}\Omega$]]，[[cap|$C = 100\ \mu\text{F}$]] $\implies \tau = 1.0\text{ s}$。峰值电流仅 $0.5\text{ mA}$，电阻功耗仅 $2.5\text{ mW}$，安全、安静、波形清晰！`,
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**[[safety|面包板安全规则]]**：若理论例题阻值 $< 100\ \Omega$（如 $4.5\ \Omega$ 或 $10\ \Omega$）且电容为毫法/法拉级，严禁直接按理论参数插接物理或 3D 实操面包板，以防瞬时大电流烧毁 $1/4\text{ W}$ 碳膜电阻或触发电源过流保护。`,
        },
        {
          kind: 'table',
          caption: '理论例题参数与面包板实测参数对照',
          head: ['参数', 'RC 理论例题（第 5 幕）', 'RL 理论例题（第 4 幕）', '面包板实测（本幕）'],
          rows: [
            ['电源', R`$V_s = 24\text{ V}$`, R`$I_0 = 2\text{ A}$`, `[[supply|${SUPPLY_NAME}]]`],
            ['电阻', R`$R_{Th} = 4.5\ \Omega$`, R`$R = 10\ \Omega$`, R`[[res|$10\text{ k}\Omega$]]（1/4 W 碳膜，棕黑橙金）`],
            ['储能元件', R`$C = 0.2\text{ F}$`, R`$L = 0.5\text{ H}$`, R`[[cap|$100\ \mu\text{F}$ / 16 V 电解电容]]（注意长脚正极）`],
            ['时间常数', R`$\tau = 0.9\text{ s}$`, R`$\tau = 50\text{ ms}$`, R`$\tau = 1.0\text{ s}$`],
            ['峰值电流', R`$1.33\text{ A}$`, R`$2\text{ A}$`, R`$0.5\text{ mA}$`],
            ['电阻峰值功率', R`$R_4$：$6\text{ W}$`, R`$40\text{ W}$`, R`$2.5\text{ mW}$`],
            ['初始储能', R`$3.6\text{ J}$`, R`$1.0\text{ J}$`, R`$1.25\text{ mJ}$`],
            ['能否上板', '否（远超 1/4 W）', '否（无散热片面包板不适用）', '是'],
          ],
        },
        {
          kind: 'table',
          caption: '3D 面包板接线（左侧 03 层）',
          head: ['元件', '插孔', '作用'],
          rows: [
            [`[[supply|${SUPPLY_NAME}]]`, '红色 + 引线 → 顶部 +5 V 轨；黑色 − 引线 → GND 轨', '实验台上单独的电源盒'],
            ['[[spdt|SPDT 拨动开关]]', '引脚 c20（左）、c21（公共）、c22（右）；红跳线 a20 → +5 V 轨', '左拨：电容接 5 V 充电；右拨：电容接 10 kΩ 放电'],
            ['[[cap|100 µF 电解电容]]', '长脚（+）a21（开关公共端一列）；短脚（−，白色条纹）→ GND 轨', '储能元件；反插会漏电发热'],
            ['[[res|10 kΩ 电阻]]', 'e22 → e27；黑跳线 a27 → GND 轨', '放电通道，τ = RC = 1.0 s'],
            ['[[scope,probe|虚拟示波器]]', 'CH1 探头钩电容正极，地夹夹负极', R`实时显示 $v_C(t)$`],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`$\tau = 1.0\text{ s}$ 时，$5\tau = 5.0\text{ s}$，肉眼可通过 LED 亮度或万用表数字跳变清晰观察衰减，[[scope|虚拟示波器]]采样率 100 Hz 即可完美捕获 $1\tau$（$1.84\text{ V}$）与 $5\tau$（$0.034\text{ V}$）特征点。在左侧 03 层把 SPDT 拨到右侧（或点「▶ 从 t = 0 放电」），对照下图读出 1 s、2 s、5 s 的电压。`,
        },
      ],
      inline_svg: SVG_ACT6,
      figure_caption: '6.2 内联 2D 教学图：面包板实操接线与实测示波器特征读数（5 V / 10 kΩ / 100 µF → τ = 1.0 s）',
      quiz: [
        {
          id: 'w4l4_q1',
          question: '一个无源 RC 放电电路在 t = 0 时初始储能为 W0。当时间恰好经过一个时间常数 t = τ 时，电容中【剩余】的能量约占初始储能 W0 的多少？',
          options: [
            {
              key: 'A',
              text: R`$36.8\%$`,
              correct: false,
              feedback: R`$36.8\% = e^{-1}$ 是 $t = \tau$ 时剩余的**电压**比例。储能 $w_C = \frac{1}{2}Cv^2$ 与电压的平方成正比：电压剩 $36.8\%$，能量只剩 $(0.368)^2 \approx 13.5\%$。`,
            },
            {
              key: 'B',
              text: R`$63.2\%$`,
              correct: false,
              feedback: R`$63.2\% = 1 - e^{-1}$ 是 $t = \tau$ 时已经衰减掉的**电压**比例，既不是能量，也不是“剩余”。剩余能量要把剩余电压比 $e^{-1}$ 平方。`,
            },
            { key: 'C', text: R`$13.5\%$`, correct: true },
            {
              key: 'D',
              text: R`$86.5\%$`,
              correct: false,
              feedback: R`$86.5\% = 1 - e^{-2}$ 是 $t = \tau$ 时已经被电阻**耗散**掉的能量比例；题目问的是电容里**剩余**的能量，两者加起来才是 $100\%$。`,
            },
          ],
          feedback_correct: R`$t = \tau$ 时电容电压降至 $e^{-1} \approx 36.8\%$，但电容储能 $w_C(t) = \frac{1}{2}C v^2(t)$ 与电压平方成正比，因此剩余能量占比为 $e^{-2} \approx 13.53\%$（已耗散 $86.47\%$）。`,
          feedback_wrong: R`能量与电压是什么关系？先写出 $w_C(t) = \frac{1}{2}C v^2(t)$，再代入 $v(\tau) = V_0 e^{-1}$。`,
          figure: ADDED_Q1,
          sync: { layer: L1, halo: ['cap', 'res'], params: { topo: 'rc', sw: 'discharge', tn: 0 } },
        },
        {
          id: 'w4l4_q2',
          question: '某无源 RL 衰减电路中，电感 L = 40 mH 与两个串联电阻 R1 = 8 Ω、R2 = 12 Ω 构成闭合回路。该电路的时间常数 τ 为多少？',
          options: [
            { key: 'A', text: R`$2.0\text{ ms}$`, correct: true },
            {
              key: 'B',
              text: R`$5.0\text{ ms}$`,
              correct: false,
              feedback: R`$5.0\text{ ms} = 40\text{ mH} / 8\ \Omega$，只用了 $R_1$。两个电阻和电感串在同一个回路里，电感电流同时流过 $R_1$ 和 $R_2$，从电感两端看进去 $R_{Th} = 8 + 12 = 20\ \Omega$。`,
            },
            {
              key: 'C',
              text: R`$0.8\text{ s}$`,
              correct: false,
              feedback: R`$0.8 = 0.04 \times 20$，是把 RL 的时间常数写成了 RC 那样的乘法 $L \cdot R$。RL 电路 $\tau = L / R_{Th}$：电阻越大，磁能被消耗得越快，$\tau$ 越小。`,
            },
            {
              key: 'D',
              text: R`$8.3\text{ ms}$`,
              correct: false,
              feedback: R`$8.3\text{ ms} = 40\text{ mH} / 4.8\ \Omega$，是把 $R_1$、$R_2$ 当成了并联（$8 \parallel 12 = 4.8\ \Omega$）。题中两电阻与电感首尾相接构成单回路，是串联。`,
            },
          ],
          feedback_correct: R`从电感两端看进去的等效电阻 $R_{Th} = R_1 + R_2 = 8 + 12 = 20\ \Omega$，故时间常数 $\tau = L / R_{Th} = 0.04\text{ H} / 20\ \Omega = 0.002\text{ s} = 2.0\text{ ms}$。`,
          feedback_wrong: R`先从电感两端看进去求 $R_{Th}$（两个电阻是串联还是并联？），再用 RL 的 $\tau = L / R_{Th}$。`,
          figure: ADDED_Q2,
          sync: { layer: L1, halo: ['ind', 'res_l'], params: { topo: 'rl', sw: 'charge', tn: 0 } },
        },
        {
          id: 'w4l4_q3',
          question: '若将无源 RC 电路和无源 RL 电路中的等效电阻 R_Th 同时增大为原来的 2 倍（L、C 保持不变），两者的暂态衰减速度将如何变化？',
          options: [
            {
              key: 'A',
              text: '两者都变慢一倍',
              correct: false,
              feedback: R`RC 的 $\tau = R_{Th} C$ 确实翻倍、变慢；但 RL 的 $\tau = L / R_{Th}$，$R_{Th}$ 在分母上，翻倍后 $\tau$ 减半——同样的电流在更大的电阻上耗能更猛，衰减更快。`,
            },
            {
              key: 'B',
              text: '两者都变快一倍',
              correct: false,
              feedback: R`RL 的 $\tau = L / R_{Th}$ 确实减半、变快；可 RC 的 $\tau = R_{Th} C$：$R_{Th}$ 越大，泄放电流 $v/R$ 越小，电容放得更慢，$\tau$ 翻倍。`,
            },
            {
              key: 'C',
              text: 'RC 变快（τ 减半），RL 变慢（τ 翻倍）',
              correct: false,
              feedback: R`正好把两个公式记反了：RC 是 $\tau = R_{Th} C$（$R$ 在分子上，越大越慢），RL 是 $\tau = L / R_{Th}$（$R$ 在分母上，越大越快）。`,
            },
            { key: 'D', text: 'RC 变慢（τ 翻倍），RL 变快（τ 减半）', correct: true },
          ],
          feedback_correct: R`RC 电路 $\tau = R_{Th} C$，$R_{Th}$ 翻倍导致 $\tau$ 翻倍、放电变慢；RL 电路 $\tau = L / R_{Th}$，$R_{Th}$ 翻倍导致 $\tau$ 减半、磁能消耗加快、衰减变快。`,
          feedback_wrong: R`分别写出两种电路的 $\tau$：$R_{Th}$ 在 RC 的公式里是乘还是除？在 RL 里呢？`,
          figure: ADDED_Q3,
          sync: { layer: L2, halo: ['tau'], params: { mode: 'rc', ...LABP, sw: 'discharge', tn: 1, tan: true, marks: true, bars: false } },
        },
        {
          id: 'w4l4_q4',
          question: '一个初始储能 W0 = 8 mJ 的电容，在 t = 0 时并联接入 Ra = 10 kΩ 和 Rb = 30 kΩ 两个电阻开始自然放电。直至完全放完电，Ra 上累计消耗的热能是多少？',
          options: [
            {
              key: 'A',
              text: R`$2.0\text{ mJ}$`,
              correct: false,
              feedback: R`$2.0\text{ mJ}$ 是 $R_b$（$30\text{ k}\Omega$）分到的那一份。并联电阻两端电压相同，功率 $v^2/R$ 与电阻成反比：小电阻 $R_a$ 吃得多，拿走 $\frac{3}{4}$。`,
            },
            {
              key: 'B',
              text: R`$4.0\text{ mJ}$`,
              correct: false,
              feedback: R`对半分只在两个电阻相等时成立。$R_a = 10\text{ k}\Omega$ 只有 $R_b$ 的三分之一，同一电压下它的电流是 $R_b$ 的 3 倍，功率之比是 $3 : 1$。`,
            },
            { key: 'C', text: R`$6.0\text{ mJ}$`, correct: true },
            {
              key: 'D',
              text: R`$8.0\text{ mJ}$`,
              correct: false,
              feedback: R`电容的 $8\text{ mJ}$ 由两个并联电阻共同吸收：$R_b$ 两端同样有电压 $v(t)$、同样有电流在发热，$R_a$ 不可能独占全部能量。`,
            },
          ],
          feedback_correct: R`两电阻并联承受相同的瞬态电压 $v(t)$，任意时刻功率比 $p_{R_a} : p_{R_b} = (1/R_a) : (1/R_b) = 3 : 1$，因此总能量也按 $3:1$ 分配，$R_a$ 消耗 $8 \times (3/4) = 6.0\text{ mJ}$。`,
          feedback_wrong: R`两个并联电阻的电压相同，它们的瞬时功率之比是多少？总能量就按这个比例分。`,
          figure: ADDED_Q4,
          sync: { layer: L1, halo: ['res', 'cap'], params: { topo: 'rc', sw: 'discharge', tn: 0 } },
        },
      ],
      after_quiz: [
        { kind: 'p', text: '**下节预告：W4-L5 一阶 RC/RL 阶跃响应与三要素通解**' },
        {
          kind: 'p',
          text: R`今天的电路都是“自然谢幕”：撤掉电源，储能一路衰减到 0。下节课把电源接回来——开关一拨，电容从 $x(0)$ 出发，被电源一路推向新的终值 $x(\infty)$。只要抓住初值、终值和 $\tau$ 这三个要素，任何一阶电路的全响应都能一笔写出：$x(t) = x(\infty) + [x(0) - x(\infty)]e^{-t/\tau}$。面包板上第一次用示波器看充电曲线，还要先学会探头地线夹的共地安全。`,
        },
        { kind: 'figure', svg: ADDED_NEXT, caption: '下节预告 W4-L5：一阶阶跃响应从 x(0) 走向 x(∞)' },
      ],
    },
  ],
};

export default W4_L4;
