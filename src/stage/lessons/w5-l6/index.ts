// W5-L6 · 视在功率、复功率、功率三角形与功率因数校正 (lesson sheet: docs/lessons/W5-L6.md).
// Type D, strictly 2D (course owner rule): no three.js anywhere in this folder (lesson.test.ts
// checks it). The professor's opening, the text of the five acts, the act diagrams (svgs.ts), the
// guided example and the diagnostic quiz are reproduced from the sheet; [[id|…]] only links a term
// to the stage (the words are unchanged). Changes of form:
// - the opening opens act 1; the numbered sub-headings (1.1 … 5.3) are bold lines; display formulas
//   sit in ① / ② / ③ cards or formula cards (a lead-in sentence becomes the card's title); the act
//   diagrams stand where the sheet has them; the sheet's *(…)* italic aside in act 2 is a plain
//   parenthesis (the inline markup has no italics);
// - the guided steps had no options: each gets three — the sheet's expected answer (praise), the
//   mistake its professor_intercept corrects (that intercept), one more plausible mistake with its
//   own intercept; the right one moves between positions; plain-text symbols of the JSON (Q1, Q_C,
//   V_rms …) are set as TeX; long board lines are split at their commas (phone width); the quiz
//   options are reordered so the right answer is not B / C every time;
// - left out (build instructions, not lesson text): the 「Claude 工程落地清单」 (5.4) and its
//   mention in act 5's title, the JSON headings and ids, the quiz's passing score (the site uses 4/4).
// Anti-spoiler: the guided example (20 kW / 240 V / 60 Hz) is not worked in any act (act 4 works
// Sadiku's 4 kW / 120 V), so no ③ moves; act 5's wiring diagram printed the example's answers
// before it, so it shows them as "?" in place and the full diagram follows the guided block as its
// review (svgs.ts); the step 5 diagram's answers are "?"; on the stage the factory scenario keeps
// its numbers covered until the example reaches them (w56_g; done_params uncovers them).
// Fixed (the sheet's errors): act 4's PFC example is Sadiku §11.8 (Power Factor Correction), not
// §11.7 (Conservation of AC Power, act 3) — the textbook sections are 11.5–11.8; act 4.1's
// "0.95 → 1.00 needs about 45 % more capacitor" is 78 % for the lesson's pf1 = 0.80 (Q_C grows
// from 0.421 P to 0.750 P); quiz Q2's option B, √(8² + 5²) = 9.434 kVA, is numerically *right*
// (the two S vectors are 90° apart: +36.87° and −53.13°), so that question had two correct options:
// B is now the scalar difference 8 − 5 = 3 kVA, and the explanation says why √(8² + 5²) happens to
// work here; the act 4 diagram and the step 1–3 diagrams drew the triangles at unequal scales (the
// drawn angles did not match their labels) — redrawn at equal scales (svgs.ts).
// Added (the sheet has none): the hover map; the three live layers; praise for right options and the
// guided example's conclusion; per-option quiz feedback written from the explanations; the quiz
// figures.

import { lazy } from 'react';
import type { StageLesson, StageSync } from '../../types';
import { SCENARIOS, capFor } from './model';
import { L1, L2, L3, P } from './parts';
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
  SVG_ACT5_ASKED,
  SVG_Q1,
  SVG_Q2,
  SVG_Q3,
  SVG_Q4,
} from './svgs';

const TriangleLayer = lazy(() => import('./TriangleLayer'));
const LoadsLayer = lazy(() => import('./LoadsLayer'));
const PfcLayer = lazy(() => import('./PfcLayer'));

const R = String.raw;
/** inline `code` inside a String.raw text */
const code = (s: string) => `\`${s}\``;

/** act 2's load Z = 12 + j16 Ω: θ_Z = 53.13°, at 120 V and 6 A: S = 720 VA, P = 432 W, Q = 576 VAR */
const THETA_Z = (Math.atan2(16, 12) * 180) / Math.PI;
const SAD = SCENARIOS.sadiku;
/** act 4's capacitor: 310.44 µF (exact, so the stage shows the calc's Q_C) */
const C_SADIKU = capFor(SAD.P, SAD.V, SAD.f, SAD.pf1, 0.95);
const F = SCENARIOS.factory;
/** the guided example's capacitor: 388.05 µF */
const C_FACTORY = capFor(F.P, F.V, F.f, F.pf1, 0.95);

const one = (theta: number, trap = false) => ({ [P.theta]: theta, [P.v]: 120, [P.i]: 6, [P.trap]: trap });
const loads = { [P.l1]: 10, [P.l2]: 6, [P.l3]: 5, [P.on1]: true, [P.on2]: true, [P.on3]: true };
const at = (layer: string, halo: string[], params: Record<string, unknown>): StageSync => ({ layer, halo, params });
/** a guided step's stage: the factory scenario, `solved` steps uncovered (C set once step 4 is solved) */
const G = (solved: number) => ({ [P.scn]: 'factory', [P.g]: solved, [P.c]: solved >= 4 ? C_FACTORY : 0, [P.pf2]: 0.95 });

const W5_L6: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: TriangleLayer, [L2]: LoadsLayer, [L3]: PfcLayer },
  lesson_meta: {
    lesson_id: 'W5-L6',
    world: 'World 5',
    title: '视在功率、复功率、功率三角形与功率因数校正',
    subtitle: 'Apparent Power, Complex Power, Power Triangle & Power Factor Correction',
    lesson_type: 'D',
    lesson_type_label: 'Type D（动态矢量与交互滑块课 · 纯 2D 舞台）',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: ['Sections 11.5–11.8: Apparent Power & Power Factor, Complex Power, Conservation of AC Power, Power Factor Correction'],
    },
    textbook_supplement: 'Boylestad, Introductory Circuit Analysis (14th Ed.), Chapter 19 (Power Triangle Vector Synthesis)',
    prerequisites: ['W5-L2 复阻抗 (Complex Impedance)', 'W5-L5 平均功率与有效值 (Average Power & RMS Values)'],
    next_lesson: 'W5-L7',
    next_lesson_title: '传递函数、分贝刻度与波特图（Bode Plots）渐近线画法',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 功率三角形',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '01 2D 动态功率三角形 (P / Q / S) 与滞后/超前视角：调节阻抗角 θ (−85° ~ +85°) 与 V_rms / I_rms，功率三角形在第一象限（感性滞后 Q>0）与第四象限（容性超前 Q<0）之间翻转，啤酒杯的酒液/泡沫与电流相量的滞后/超前同步变化。',
      },
      {
        id: L2,
        label: '02 多负载叠加',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 多负载复功率叠加台：开关或调节 3 组并联负载（感性电机、纯阻加热炉、容性补偿/同步机），在复功率平面首尾相接画出 S_total = ΣP + jΣQ，并对比真实 |S_total| 与错误的标量和 Σ|S_k|。',
      },
      {
        id: L3,
        label: '03 电容补偿',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '03 并联补偿电容滑块与线路电流实时下降对比台：拖动并联电容 C (µF)，Q_C 向下压缩总无功 Q，有功功率 P 纹丝不动；校正前后的 S、线路电流 I_line、线损降幅与过补偿警告实时刷新。',
      },
    ],
    hover_map: {
      v_phasor: { label: '电压相量 V', desc: '参考相量：θ_v = 0°，长度代表 V_rms' },
      i_phasor: { label: '电流相量 I', desc: 'θ_i = θ_v − θ：θ > 0 时电流滞后（感性），θ < 0 时电流超前（容性）' },
      theta_arc: { label: '功率因数角 θ = θ_v − θ_i', desc: '等于负载阻抗角 θ_Z；pf = cos θ 不分正负，所以必须注明滞后或超前' },
      p_side: { label: '有功功率 P（W）', desc: 'P = V_rms I_rms cos θ：功率三角形的水平直角边，负载真正做功的部分' },
      q_side: { label: '无功功率 Q（VAR）', desc: 'Q = V_rms I_rms sin θ：竖直直角边，感性向上（Q > 0），容性向下（Q < 0）' },
      s_side: { label: '视在功率 S（VA）', desc: 'S = V_rms I_rms = √(P² + Q²)：斜边，决定变压器容量与电缆粗细' },
      conj_trap: { label: '忘记取共轭的 V·I', desc: '辐角变成 θ_v + θ_i：θ_v = 0 时三角形上下翻转，感性负载的 Q 被算成负值' },
      beer_liquid: { label: '酒液 = 有功功率 P', desc: '真正解渴的部分：杯中酒液占比就是 pf = P/S（含酒量）' },
      beer_foam: { label: '泡沫 = 无功功率 Q', desc: '不能解渴，却撑起电机的磁场：在电源与储能元件之间来回吞吐' },
      beer_mug: { label: '整杯容量 = 视在功率 S', desc: '酒液与泡沫按勾股合成占用的总容积（不是简单相加）' },
      ro_pf: { label: '功率因数 pf', desc: 'pf = P/S = cos θ，附带滞后（Q > 0）或超前（Q < 0）标签' },
      s1_vec: { label: '负载 1 · 感应电机群', desc: 'S1 kVA，pf = 0.8 滞后：P1 = 0.8 S1，Q1 = +0.6 S1（向上）' },
      s2_vec: { label: '负载 2 · 电阻加热炉', desc: 'P2 kW，pf = 1.0：Q2 = 0，矢量水平' },
      s3_vec: { label: '负载 3 · 过励磁同步机 / 容性补偿', desc: 'S3 kVA，pf = 0.6 超前：P3 = 0.6 S3，Q3 = −0.8 S3（向下）' },
      stot_vec: { label: '总复功率 S_total', desc: 'S_total = ΣP + jΣQ：从原点指向首尾相接链条的终点' },
      bar_scalar: { label: '错误的标量和 Σ|S_k|', desc: '把各负载的视在功率直接相加：只有各负载功率因数角相同时才成立' },
      bar_true: { label: '真实总视在功率 |S_total|', desc: '√((ΣP)² + (ΣQ)²) ≤ Σ|S_k|：感性与容性无功互相抵消' },
      p_fixed: { label: '有功功率 P（不变）', desc: '电容并联在恒压母线上，负载电压与电流不变，理想电容 P_C = 0：水平边纹丝不动' },
      q1_orig: { label: '校正前无功 Q1 = P tan θ1', desc: '感性负载原本从电网吸收的无功（虚线）' },
      qc_vec: { label: '电容补偿无功 Q_C = ωCV_rms²', desc: '并联电容就地发出的无功（紫色箭头），把总无功向下压' },
      q2_net: { label: '校正后净无功 Q = Q1 − |Q_C|', desc: '母线还需从电网送来的无功；Q_C > Q1 时变负（超前）' },
      s1_orig: { label: '校正前视在功率 S1 = P / pf1', desc: '虚线斜边：校正前电网要送的“整杯”' },
      s2_new: { label: '校正后视在功率 S', desc: '实线斜边：S = √(P² + Q²)，线路电流 I_line = S / V_rms' },
      i_bar: { label: '线路电流 I_line', desc: 'I = P / (V_rms · pf)：与 pf 成反比下降' },
      loss_drop: { label: '电流与线损降幅', desc: '线损 I²R_line ∝ 1/pf²：降幅是电流降幅的“平方版”' },
      cap_slider: { label: '并联补偿电容 C', desc: 'C = Q_C / (ω V_rms²)；绿色刻线是达到目标 pf2 所需的电容' },
      target_pf: { label: '目标功率因数 pf2（滞后）', desc: 'Q2 = P tan θ2，Q_C = P(tan θ1 − tan θ2)' },
      over_warn: { label: '过补偿警告', desc: 'Q_C > Q1：系统进入超前区，线路电流回升，并可能引发母线过电压' },
      ro_pf_net: { label: '母线功率因数', desc: 'pf = P / S，随电容增大而提高；过补偿后变为超前' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: R`啤酒杯直觉——视在功率 $S$、无功功率 $Q$ 与滞后/超前功率因数`,
      sync: at(L1, ['beer_liquid', 'beer_foam', 'beer_mug'], one(37)),
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎回到 Breadboard Lab。上一讲（${code('W5-L5')}）我们搞懂了交流电路里的**平均功率（有功功率）$P$** 与**有效值（RMS）**，知道了真正让电烙铁发热、让电机干活的功率是 $P = V_{\text{rms}} I_{\text{rms}} \cos(\theta_v - \theta_i)$。但今天我要问你一个让无数工厂电工和电网总工头疼的现实问题：`,
        },
        {
          kind: 'p',
          text: R`**既然电机只“吃”了 $4\text{ kW}$ 的有功功率，为什么供电局却要按 $5\text{ kVA}$ 的变压器容量给你配电、按 $41.67\text{ A}$ 的大电流给你拉粗电缆，甚至在你的功率因数低于 $0.90$ 时直接给你开“力调电费”罚单？**`,
        },
        {
          kind: 'p',
          text: R`今天这一课，我们就用五幕完整拆解交流功率体系的终极拼图——从一杯啤酒的工程直觉出发，立起**复功率 $\mathbf{S} = \mathbf{V}_{\text{rms}}\mathbf{I}_{\text{rms}}^*$** 的数学铁律，打通**多负载复功率守恒**，最后亲手设计一套**并联电容功率因数校正（PFC）**方案，把工厂输电线损一口气砍掉近三成！`,
        },
        { kind: 'p', text: R`**1.1 为什么交流电路不能只看有功功率 $P$？**` },
        {
          kind: 'p',
          text: R`在直流电路里，功率只有一种：$P = VI$。但在正弦稳态交流电路中，由于电感（电机绕组、变压器）和电容的存在，电压与电流之间出现了[[theta_arc|相位差 $\theta = \theta_v - \theta_i$]]。`,
        },
        {
          kind: 'p',
          text: R`这就导致了一件很微妙的事：电网送过来的电流里，只有**一部分**在真正对外做功（转化为机械能、热能、光能），另一部分电流则在电源与电感磁场（或电容电场）之间**来回吞吐、原地折返**——它一个周期平均下来不做净功，但它**实实在在地占用了导线的载流截面积、变压器的铁芯容量，并且在输电线电阻上白白产生 $I^2 R_{\text{line}}$ 铜损！**`,
        },
        { kind: 'p', text: '电力工程师发明了一个流传百年的绝妙比喻——**啤酒杯模型**：' },
        {
          kind: 'ul',
          items: [
            R`[[beer_liquid,p_side|**酒液 = 有功功率 $P$（单位：瓦特 $\text{W}$）**]]：你真正喝进肚子解渴的部分，对应负载实际消耗的能量速率：$P = V_{\text{rms}} I_{\text{rms}} \cos(\theta_v - \theta_i)$。`,
            R`[[beer_foam,q_side|**泡沫 = 无功功率 $Q$（单位：乏 $\text{VAR}$，Volt-Ampere Reactive）**]]：虽然不能解渴，但没有泡沫就没有电机的旋转磁场（无法建立励磁），它负责在电源和储能元件之间交换能量：$Q = V_{\text{rms}} I_{\text{rms}} \sin(\theta_v - \theta_i)$。`,
          ],
        },
        {
          kind: 'formula',
          title: R`[[beer_mug,s_side|**整杯容量 = 视在功率 $S$（单位：伏安 $\text{VA}$）**]]：酒液和泡沫合起来占用的杯子总容积（注意在数学上是**勾股合成**而非简单相加！），它直接决定了供电局必须为你配备多大的变压器与多粗的电缆：`,
          tex: R`S = V_{\text{rms}} I_{\text{rms}} = \sqrt{P^2 + Q^2}`,
        },
        {
          kind: 'formula',
          title: R`[[ro_pf|**功率因数 $\text{pf}$**]]：衡量这杯“电啤酒”的**含酒量（有效利用率）**：`,
          tex: R`\text{pf} = \frac{P}{S} = \cos(\theta_v - \theta_i) = \cos\theta`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授敲黑板（单位铁律）**：在国际单位制里，$\text{W}$、$\text{VAR}$、$\text{VA}$ 的量纲全都是 $\text{V}\cdot\text{A}$，但工程上**严禁混用**！看到 $\text{W}$ 就知道是 $P$，看到 $\text{VAR}$ 就知道是 $Q$，看到 $\text{VA}$ 或 $\text{kVA}$ 就知道是视在功率 $S$（这也是为什么变压器铭牌永远标 $\text{kVA}$ 而不是 $\text{kW}$——变压器不在乎你接的是电阻还是电感，它只怕电流超过额定值烧毁绕组！）。`,
        },
        { kind: 'p', text: '**1.2 滞后（Lagging）与超前（Leading）：决定符号的生死线**' },
        {
          kind: 'p',
          text: R`因为 $\cos(-\theta) = \cos(\theta)$，如果我只告诉你“某负载功率因数是 $0.8$”，你根本不知道它是电感性负载还是电容性负载！因此，在工程表达中，**功率因数必须附带“滞后（Lagging）”或“超前（Leading）”标签**，这一称呼永远以**[[i_phasor|电流相量 $\mathbf{I}$]] 相对于[[v_phasor|电压相量 $\mathbf{V}$]] 的相位关系**为准：`,
        },
        {
          kind: 'table',
          head: ['负载性质', '电流与电压相位关系', R`功率因数角 $\theta = \theta_v - \theta_i$`, R`无功功率 $Q$ 符号`, '功率因数标注', '典型工程设备'],
          rows: [
            [
              '**感性负载 (Inductive)**',
              '电流**滞后**于电压',
              R`$\theta > 0$（$0^\circ < \theta \le 90^\circ$）`,
              R`$Q > 0$（**吸收**无功）`,
              '**滞后 (Lagging)**',
              '异步电机、变压器、日光灯镇流器',
            ],
            ['**纯阻负载 (Resistive)**', '电流与电压**同相**', R`$\theta = 0^\circ$`, R`$Q = 0$`, R`**单位功率因数 ($\text{pf}=1$)**`, '电阻炉、白炽灯、电热水器'],
            [
              '**容性负载 (Capacitive)**',
              '电流**超前**于电压',
              R`$\theta < 0$（$-90^\circ \le \theta < 0^\circ$）`,
              R`$Q < 0$（**发出/提供**无功）`,
              '**超前 (Leading)**',
              '并联电力电容器组、过励磁同步调相机',
            ],
          ],
        },
        { kind: 'p', text: '**1.3 第 1 幕内联 2D 教学图：啤酒杯直觉与滞后/超前相量对照**' },
      ],
      inline_svg: SVG_ACT1,
      figure_caption: '啤酒杯功率直觉 vs. 滞后 / 超前相量判别',
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: R`复功率 $\mathbf{S} = \mathbf{V}_{\text{rms}}\mathbf{I}_{\text{rms}}^*$、共轭铁律与功率三角形`,
      sync: at(L1, ['conj_trap', 's_side'], one(THETA_Z, true)),
      blocks: [
        { kind: 'p', text: R`**2.1 为什么必须对电流相量取共轭 $\mathbf{I}_{\text{rms}}^*$？**` },
        {
          kind: 'p',
          text: R`很多同学刚学复功率时，会下意识地写 $\mathbf{S} = \mathbf{V}_{\text{rms}} \mathbf{I}_{\text{rms}}$。**停！这是交流电路分析里最致命的符号错误！**`,
        },
        {
          kind: 'p',
          text: R`让我们亲自试一下如果不取共轭会发生什么惨案：设 $\mathbf{V}_{\text{rms}} = V_{\text{rms}} \angle \theta_v$，$\mathbf{I}_{\text{rms}} = I_{\text{rms}} \angle \theta_i$。`,
        },
        {
          kind: 'formula',
          title: R`[[conj_trap|**错误写法（不取共轭）**]]：`,
          tex: R`\mathbf{V}_{\text{rms}} \mathbf{I}_{\text{rms}} = V_{\text{rms}} I_{\text{rms}} \angle(\theta_v + \theta_i)`,
        },
        {
          kind: 'p',
          text: R`这里相位角变成了**相加** $\theta_v + \theta_i$！哪怕把时间零点平移一下，$\theta_v + \theta_i$ 就会跟着乱变；更糟糕的是，当 $\theta_v = 0^\circ$ 时，感性负载的电流滞后（$\theta_i < 0$），相乘后虚部变成负的——**[[conj_trap|感性负载的 $Q$ 竟然算成了负值，符号全反！]]**`,
        },
        {
          kind: 'formula',
          title: R`**正确定义（对电流取共轭 $\mathbf{I}_{\text{rms}}^*$）**：`,
          tex: R`\mathbf{S} = \mathbf{V}_{\text{rms}} \mathbf{I}_{\text{rms}}^* = \left(V_{\text{rms}} \angle \theta_v\right)\left(I_{\text{rms}} \angle{-}\theta_i\right) = V_{\text{rms}} I_{\text{rms}} \angle(\theta_v - \theta_i)`,
        },
        {
          kind: 'formula',
          title: '展开为直角坐标形式：',
          tex: R`\mathbf{S} = V_{\text{rms}} I_{\text{rms}} \cos(\theta_v - \theta_i) + j\, V_{\text{rms}} I_{\text{rms}} \sin(\theta_v - \theta_i) = P + jQ`,
        },
        { kind: 'p', text: R`你看，加上这个小小的共轭星号 ${code('*')}，奇迹立刻发生：` },
        {
          kind: 'ol',
          items: [
            R`[[p_side|**实部** $\text{Re}(\mathbf{S}) = P$]]，精确等于有功功率；`,
            R`[[q_side|**虚部** $\text{Im}(\mathbf{S}) = Q$]]，精确等于无功功率，且**感性负载 $Q > 0$（第一象限），容性负载 $Q < 0$（第四象限）**；`,
            R`[[s_side|**模长** $|\mathbf{S}| = S = \sqrt{P^2 + Q^2}$]]，精确等于视在功率；`,
            R`[[theta_arc|**辐角** $\angle \mathbf{S} = \theta_v - \theta_i$]]，精确等于负载阻抗角 $\theta_Z$（与电源参考初相完全无关！）。`,
          ],
        },
        {
          kind: 'formula',
          title: R`结合欧姆定律 $\mathbf{V}_{\text{rms}} = \mathbf{Z}\mathbf{I}_{\text{rms}}$，我们还能立刻得到复功率的另外两个黄金等价形式：`,
          tex: R`\mathbf{S} = \mathbf{V}_{\text{rms}}\mathbf{I}_{\text{rms}}^* = I_{\text{rms}}^2 \mathbf{Z} = \frac{V_{\text{rms}}^2}{\mathbf{Z}^*}`,
        },
        { kind: 'p', text: R`（注意最后一个式子：分母上的阻抗 $\mathbf{Z}$ 也必须取共轭 $\mathbf{Z}^*$！）` },
        { kind: 'p', text: '**2.2 第 2 幕内联 2D 教学图：感性 vs. 容性功率三角形对照图**' },
        { kind: 'figure', svg: SVG_ACT2, caption: '感性（滞后）与容性（超前）功率三角形对照' },
        { kind: 'p', text: '**2.3 三段式教授板书推导：单感性负载复功率全量求解**' },
        {
          kind: 'p',
          text: R`**题目条件**：一台单相感性负载阻抗 $\mathbf{Z} = (12 + j16)\,\Omega$，接在有效值 $\mathbf{V}_{\text{rms}} = 120\angle 0^\circ\text{ V}$ 的交流电源上。求电流相量 $\mathbf{I}_{\text{rms}}$、复功率 $\mathbf{S}$、有功功率 $P$、无功功率 $Q$、视在功率 $S$ 及功率因数 $\text{pf}$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`根据交流欧姆定律与复功率基本定义（**严格对电流相量取共轭**）：$\displaystyle \mathbf{I}_{\text{rms}} = \frac{\mathbf{V}_{\text{rms}}}{\mathbf{Z}}, \qquad \mathbf{S} = \mathbf{V}_{\text{rms}}\mathbf{I}_{\text{rms}}^* = P + jQ$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：设 $\mathbf{Z} = R + jX = |\mathbf{Z}|\angle \theta_Z$，其中 $|\mathbf{Z}| = \sqrt{R^2 + X^2}$，$\theta_Z = \arctan(X/R)$。代入复功率定义：`,
          tex: R`\begin{gathered} \mathbf{I}_{\text{rms}} = \frac{V_{\text{rms}}}{|\mathbf{Z}|}\angle(\theta_v - \theta_Z) \\[4pt] \mathbf{S} = \mathbf{V}_{\text{rms}}\mathbf{I}_{\text{rms}}^* = \left(\frac{V_{\text{rms}}}{|\mathbf{Z}|}\right)^2 (R + jX) = I_{\text{rms}}^2 R + j\,I_{\text{rms}}^2 X \end{gathered}`,
        },
        {
          kind: 'formula',
          title: '由此得到各分量的纯符号解析式：',
          tex: R`P = I_{\text{rms}}^2 R, \qquad Q = I_{\text{rms}}^2 X, \qquad S = \sqrt{P^2 + Q^2} = V_{\text{rms}} I_{\text{rms}}, \qquad \text{pf} = \frac{P}{S} = \cos\theta_Z`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '1. **阻抗模与阻抗角**：',
              tex: R`|\mathbf{Z}| = \sqrt{12^2 + 16^2} = \sqrt{144 + 256} = 20\,\Omega, \qquad \theta_Z = \arctan\left(\frac{16}{12}\right) = 53.13^\circ`,
            },
            { label: '2. **电流有效值相量**：', tex: R`\mathbf{I}_{\text{rms}} = \frac{120\angle 0^\circ}{20\angle 53.13^\circ} = 6.00\angle{-}53.13^\circ\text{ A}` },
            {
              label: R`3. **复功率（严格取共轭 $\mathbf{I}_{\text{rms}}^* = 6.00\angle{+}53.13^\circ\text{ A}$）**：`,
              tex: R`\mathbf{S} = (120\angle 0^\circ)(6.00\angle{+}53.13^\circ) = 720\angle 53.13^\circ\text{ VA}`,
            },
            {
              label: R`用 $I_{\text{rms}}^2 \mathbf{Z}$ 交叉验算直角坐标：`,
              tex: R`P = 6.00^2 \times 12 = 432\text{ W}, \qquad Q = 6.00^2 \times 16 = +576\text{ VAR}, \qquad \mathbf{S} = 432 + j576\text{ VA}`,
            },
            {
              label: '4. **视在功率与功率因数**：',
              tex: R`S = \sqrt{432^2 + 576^2} = 720\text{ VA}, \qquad \text{pf} = \frac{432}{720} = 0.60\text{ 滞后 (Lagging)}`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '交流复功率守恒定律与多负载复功率叠加',
      sync: at(L2, ['stot_vec', 'bar_scalar', 'bar_true'], loads),
      blocks: [
        { kind: 'p', text: R`**3.1 为什么 $P$ 和 $Q$ 可以直接相加，但 $S$ 绝不能标量相加？**` },
        {
          kind: 'p',
          text: R`在实际工厂车间里，一条 $220\text{ V}$ 或 $380\text{ V}$ 母线上往往并联着几十台设备：冲床电机（感性）、烘干炉（纯阻）、照明与电容补偿柜（容性）。我们需要算出整条母线的总功率和总电流。`,
        },
        {
          kind: 'formula',
          title: R`**交流复功率守恒定律（Sadiku §11.7）**：无论负载是串联、并联还是混联，整个网络消耗的总复功率等于各支路元件复功率的**复数代数和**：`,
          tex: R`\mathbf{S}_{\text{total}} = \sum_{k=1}^{n} \mathbf{S}_k = \left(\sum_{k=1}^{n} P_k\right) + j\left(\sum_{k=1}^{n} Q_k\right) = P_{\text{total}} + jQ_{\text{total}}`,
        },
        { kind: 'p', text: '请把下面这条**工程铁律**刻进脑子里：' },
        {
          kind: 'ul',
          items: [
            R`**有功功率 $P$ 标量相加**：$P_{\text{total}} = P_1 + P_2 + \cdots + P_n$（无源负载 $P_k \ge 0$）。`,
            R`**无功功率 $Q$ 带符号代数相加**：$Q_{\text{total}} = Q_1 + Q_2 + \cdots + Q_n$（感性为正 $+$，容性为负 $-$，**彼此可以直接抵消！**）。`,
          ],
        },
        {
          kind: 'formula',
          title: R`[[bar_scalar,bar_true|**视在功率 $S$ 严禁直接标量相加！**]]`,
          tex: R`S_{\text{total}} = \sqrt{P_{\text{total}}^2 + Q_{\text{total}}^2} \le \sum_{k=1}^{n} S_k`,
        },
        {
          kind: 'p',
          text: R`只有当所有负载具有完全相同的功率因数角 $\theta_k$ 时等号才成立。如果一个 $10\text{ kVA}$ 感性负载与一个 $5\text{ kVA}$ 容性负载并联，总视在功率**远小于** $15\text{ kVA}$，因为它们的无功分量一上一下互相抵消了！Boylestad 第 19 章用**[[s1_vec,s2_vec,s3_vec,stot_vec|功率三角形首尾相接矢量合成]]**最直观地揭示了这一几何本质。`,
        },
        { kind: 'p', text: '**3.2 第 3 幕内联 2D 教学图：多负载复功率首尾相接矢量叠加图**' },
        { kind: 'figure', svg: SVG_ACT3, caption: '多负载复功率首尾相接矢量合成（S_total = S1 + S2 + S3）' },
        { kind: 'p', text: '**3.3 三段式教授板书推导：三路并联工厂母线总复功率与总电流**' },
        { kind: 'p', text: R`**题目条件**：一条 $V_{\text{rms}} = 220\text{ V}$、$f = 50\text{ Hz}$ 的工厂配电母线上并联了三个负载：` },
        {
          kind: 'ul',
          items: [
            R`[[s1_vec|负载 1（感应电机群）]]：$S_1 = 10\text{ kVA}$，$\text{pf}_1 = 0.8$ 滞后；`,
            R`[[s2_vec|负载 2（电阻加热炉）]]：$P_2 = 6\text{ kW}$，$\text{pf}_2 = 1.0$；`,
            R`[[s3_vec|负载 3（过励磁同步机）]]：$S_3 = 5\text{ kVA}$，$\text{pf}_3 = 0.6$ 超前。`,
          ],
        },
        {
          kind: 'p',
          text: R`求母线总复功率 $\mathbf{S}_{\text{total}}$、总视在功率 $S_{\text{total}}$、总功率因数 $\text{pf}_{\text{total}}$ 以及母线总电流有效值 $I_{\text{total}}$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`依据交流复功率守恒定律，各并联支路复功率的实部与虚部分别代数叠加：$\displaystyle \mathbf{S}_{\text{total}} = \sum_{k=1}^{3} \mathbf{S}_k = \left(\sum_{k=1}^{3} P_k\right) + j\left(\sum_{k=1}^{3} Q_k\right)$ 其中对每个负载，滞后取正号（$+Q$）、超前取负号（$-Q$）。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式',
          tex: R`\begin{gathered} P_k = S_k \cdot \text{pf}_k, \qquad Q_k = \pm S_k \sqrt{1 - \text{pf}_k^2} \\[4pt] P_{\text{total}} = P_1 + P_2 + P_3, \qquad Q_{\text{total}} = Q_1 + Q_2 + Q_3 \\[4pt] S_{\text{total}} = \sqrt{P_{\text{total}}^2 + Q_{\text{total}}^2}, \qquad \text{pf}_{\text{total}} = \frac{P_{\text{total}}}{S_{\text{total}}}, \qquad I_{\text{total}} = \frac{S_{\text{total}}}{V_{\text{rms}}} \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`1. **逐一拆解各负载的 $P_k$ 与 $Q_k$**：负载 1（滞后，$Q_1 > 0$）：`,
              tex: R`P_1 = 10 \times 0.8 = 8.00\text{ kW}, \qquad Q_1 = +10 \times \sqrt{1 - 0.8^2} = +6.00\text{ kVAR}`,
            },
            { label: R`负载 2（纯阻，$Q_2 = 0$）：`, tex: R`P_2 = 6.00\text{ kW}, \qquad Q_2 = 0\text{ kVAR}` },
            { label: R`负载 3（超前，$Q_3 < 0$）：`, tex: R`P_3 = 5 \times 0.6 = 3.00\text{ kW}, \qquad Q_3 = -5 \times \sqrt{1 - 0.6^2} = -4.00\text{ kVAR}` },
            {
              label: '2. **总有功与总无功代数叠加**：',
              tex: R`\begin{gathered} P_{\text{total}} = 8.00 + 6.00 + 3.00 = 17.00\text{ kW} \\ Q_{\text{total}} = +6.00 + 0 - 4.00 = +2.00\text{ kVAR} \\ \mathbf{S}_{\text{total}} = 17.00 + j2.00\text{ kVA} \end{gathered}`,
            },
            {
              label: '3. **总视在功率、总功率因数与母线总电流**：',
              tex: R`S_{\text{total}} = \sqrt{17.00^2 + 2.00^2} = \sqrt{293} = 17.12\text{ kVA} \quad (\text{远小于错误标量之和 } 21\text{ kVA!})`,
            },
            { label: '', tex: R`\text{pf}_{\text{total}} = \frac{17.00}{17.12} = 0.9932\text{ 滞后 (因 } Q_{\text{total}} = +2.00\text{ kVAR} > 0\text{)}` },
            { label: '', tex: R`I_{\text{total}} = \frac{17117.24\text{ VA}}{220\text{ V}} = 77.81\text{ A}` },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '并联电容功率因数校正（Power Factor Correction）',
      sync: at(L3, ['qc_vec', 'p_fixed'], { [P.scn]: 'sadiku', [P.c]: C_SADIKU, [P.pf2]: 0.95 }),
      blocks: [
        { kind: 'p', text: '**4.1 为什么要给感性负载“并联”电容器？三个核心物理真相**' },
        {
          kind: 'p',
          text: R`绝大多数工业负载（异步电动机、电焊机、荧光灯镇流器）都是**感性负载**，自然功率因数往往只有 $0.65 \sim 0.80$ 滞后。为了把功率因数提升到供电局要求的 $0.95$ 滞后，工程师在负载两端**并联**一组电力电容器。`,
        },
        { kind: 'p', text: '请牢记以下**三条铁律**：' },
        {
          kind: 'ol',
          items: [
            R`[[p_fixed|**绝不改变负载本身的有功功率 $P$！**]] 因为电容是**并联**在恒压母线 $V_{\text{rms}}$ 两端的，负载两端的电压 $V_{\text{rms}}$ 纹丝不动，负载内部电流 $\mathbf{I}_L$ 也不变，所以电机照常出力，**有功功率 $P$ 保持绝对不变**。理想电容本身消耗的有功功率 $P_C = 0$。`,
            R`[[qc_vec,q2_net|**就地提供无功，砍断输电线上的“折返泡沫电流”！**]] 并联电容发出负无功功率 $Q_C = -\omega C V_{\text{rms}}^2$（就地向电机磁场供给无功交换），使得供电线路只需送出极少量的净无功 $Q_2 = Q_1 - |Q_C|$。视在功率 $S = P / \text{pf}$ 显著缩小，[[i_bar|线路电流 $I_{\text{line}} = \frac{P}{V_{\text{rms}} \cdot \text{pf}}$]] 与 $\text{pf}$ 成反比下降！`,
            R`[[loss_drop|**输电线损按平方比例暴跌！**]] 由于输电线铜损 $P_{\text{loss}} = I_{\text{line}}^2 R_{\text{line}} \propto \frac{1}{\text{pf}^2}$：`,
          ],
        },
        {
          kind: 'ul',
          items: [
            R`把 $\text{pf}$ 从 $0.70$ 校正到 $0.95$：电流下降 $26.3\%$，**输电线损暴跌 $45.7\%$**！`,
            R`把 $\text{pf}$ 从 $0.80$ 校正到 $0.95$：电流下降 $15.8\%$，**输电线损暴跌 $29.1\%$**！`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授进阶追问**：既然提高 $\text{pf}$ 这么好，为什么工厂通常校正到 $0.95$ 滞后，而不是死磕到 $1.00$ 甚至超前？因为 $\tan\theta$ 在 $\theta \to 0^\circ$ 时边际收益急剧下降（从 $0.95$ 到 $1.00$ 需要额外增加近 $78\%$ 的电容投资——以 $\text{pf}_1 = 0.80$ 为例，$Q_C$ 从 $0.421P$ 增至 $0.750P$——却只换来 $5\%$ 的电流降幅），而且工厂夜间轻载时，过大电容会导致电网变成[[over_warn|**超前容性**]]，引发**母线过电压**甚至谐振烧毁设备！`,
        },
        { kind: 'p', text: '**4.2 第 4 幕内联 2D 教学图：并联电容校正前后功率三角形压缩对比图**' },
        { kind: 'figure', svg: SVG_ACT4, caption: '并联电容功率因数校正——功率三角形压缩对比（P 不变，Q / S / I 显著下降）' },
        { kind: 'p', text: '**4.3 三段式教授板书推导：经典 Sadiku §11.8 并联电容功率因数校正**' },
        {
          kind: 'p',
          text: R`**题目条件**（对标 Sadiku 2026 Release §11.8 经典例题）：一台接在 $V_{\text{rms}} = 120\text{ V}$、$f = 60\text{ Hz}$ 交流电源上的感性负载消耗有功功率 $P = 4\text{ kW}$，初始功率因数为 $\text{pf}_1 = 0.8$ 滞后。现欲在负载两端并联一只电容器，将总功率因数校正到 $\text{pf}_2 = 0.95$ 滞后。求：`,
        },
        {
          kind: 'ol',
          items: [R`所需并联电容的无功容量 $Q_C$ 与电容值 $C$；`, R`校正前后输电线路电流 $I_1, I_2$ 及线损下降百分比。`],
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`并联电容接在理想电压源母线两端，[[p_fixed|负载有功功率 $P$ 保持恒定]]。依据功率三角形几何关系与交流复功率守恒：$\displaystyle Q_1 = P\tan\theta_1, \qquad Q_2 = P\tan\theta_2, \qquad Q_C = Q_1 - Q_2$ 理想电容器在有效值电压 $V_{\text{rms}}$、角频率 $\omega = 2\pi f$ 下发出的无功功率幅值为：$\displaystyle Q_C = \frac{V_{\text{rms}}^2}{|X_C|} = \omega C V_{\text{rms}}^2$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：联立上述两式，消去 $Q_C$，得到电力工程中最核心的**[[cap_slider|功率因数校正电容通式]]**：`,
          tex: R`Q_C = P(\tan\theta_1 - \tan\theta_2), \qquad C = \frac{Q_C}{\omega V_{\text{rms}}^2} = \frac{P(\tan\theta_1 - \tan\theta_2)}{2\pi f V_{\text{rms}}^2}`,
        },
        { kind: 'p', text: R`其中 $\theta_1 = \arccos(\text{pf}_1)$、$\theta_2 = \arccos(\text{pf}_2)$（均取正值，对应滞后状态）。` },
        {
          kind: 'formula',
          title: '校正前后线路电流与线损降幅通式：',
          tex: R`I_1 = \frac{P}{V_{\text{rms}} \cdot \text{pf}_1}, \qquad I_2 = \frac{P}{V_{\text{rms}} \cdot \text{pf}_2}, \qquad \Delta P_{\text{loss}}\% = \left[1 - \left(\frac{\text{pf}_1}{\text{pf}_2}\right)^2\right] \times 100\%`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '1. **计算校正前后功率因数角与无功功率**：',
              tex: R`\theta_1 = \arccos(0.80) = 36.87^\circ \implies \tan\theta_1 = 0.7500, \qquad \theta_2 = \arccos(0.95) = 18.19^\circ \implies \tan\theta_2 = 0.3287`,
            },
            { label: '', tex: R`Q_1 = 4000 \times 0.7500 = 3000.00\text{ VAR}, \qquad Q_2 = 4000 \times 0.328684 = 1314.74\text{ VAR}` },
            {
              label: R`2. **求所需补偿无功 $Q_C$ 与电容值 $C$**：`,
              tex: R`Q_C = Q_1 - Q_2 = 3000.00 - 1314.74 = 1685.26\text{ VAR}, \qquad \omega = 2\pi \times 60 = 376.99\text{ rad/s}`,
            },
            { label: '', tex: R`C = \frac{1685.26}{376.99 \times 120^2} = \frac{1685.26}{5.4287 \times 10^6} = 3.1044 \times 10^{-4}\text{ F} = 310.44\,\mu\text{F}` },
            {
              label: '3. **校正前后线路电流与输电线损对比**：',
              tex: R`I_1 = \frac{4000}{120 \times 0.80} = 41.67\text{ A}, \qquad I_2 = \frac{4000}{120 \times 0.95} = 35.09\text{ A}`,
            },
            { label: '', tex: R`\text{电流降幅} = \frac{41.67 - 35.09}{41.67} \times 100\% = 15.79\%` },
            { label: '', tex: R`\text{线损降幅} = \left[1 - \left(\frac{0.80}{0.95}\right)^2\right] \times 100\% = 29.09\%` },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '苏格拉底式分步引导例题与诊断测验',
      sync: at(L3, ['cap_slider', 'p_fixed'], { [P.scn]: 'factory', [P.pf2]: 0.95 }),
      blocks: [
        { kind: 'p', text: '**5.1 第 5 幕内联 2D 教学图：工厂配电母线与并联电容补偿柜接线示意图**' },
        {
          kind: 'figure',
          svg: SVG_ACT5_ASKED,
          caption: '工厂 20 kW 感性车间并联电容校正接线图（待求量先打上「?」，完整接线图在引导例题之后揭晓）',
        },
        { kind: 'p', text: '**5.2 苏格拉底式分步引导例题（5 步完整交互剧本）**' },
        {
          kind: 'guided',
          title: '工厂 20 kW 感性负载并联电容功率因数校正与线路电流对比',
          problem: R`**场景设定**：某机械加工厂车间总感性负载为 $P = 20\text{ kW}$，接在 $V_{\text{rms}} = 240\text{ V}$、$f = 60\text{ Hz}$ 的单相配电母线上，当前功率因数为 $\text{pf}_1 = 0.80$ 滞后。电力局要求将功率因数校正至 $\text{pf}_2 = 0.95$ 滞后。通过 5 步苏格拉底引导，带学生独立求出补偿电容 $C$ 并量化校正前后的线路电流与线损对比。`,
          steps: [
            {
              title: R`第一步：锁死不变量，求校正前初始无功功率 $Q_1$`,
              mini_svg: MINI_STEP1,
              question: R`我们在负载两端并联电容器把功率因数从 $0.80$ 滞后提到 $0.95$ 滞后。首先请问：校正前，这台 $20\text{ kW}$ 感性负载从电网吸收了多少无功功率 $Q_1$（单位：$\text{VAR}$）？`,
              hint: R`$\theta_1 = \arccos(0.80) = 36.87^\circ,\quad Q_1 = P\tan\theta_1 = P\cdot\frac{\sin\theta_1}{\cos\theta_1}$`,
              options: [
                {
                  text: R`$Q_1 = 12000\text{ VAR}$`,
                  correct: false,
                  feedback: R`慢着！看清单位：$20\text{ kW}$ 是有功功率 $P$（三角形的水平直角边），不是斜边 $S_1$！已知底边 $P$ 和夹角 $\theta_1$，求对边 $Q_1$ 应该用正切 $\tan\theta_1$ 还是正弦 $\sin\theta_1$？`,
                },
                {
                  text: R`$Q_1 = 15000\text{ VAR}$`,
                  correct: true,
                  feedback: R`漂亮！$20\text{ kW}$ 是水平底边 $P$，夹角 $\theta_1 = 36.87^\circ$，竖直对边 $Q_1 = P\tan\theta_1 = 20000 \times 0.75 = 15000\text{ VAR}$，也就是 $15\text{ kVAR}$。`,
                },
                {
                  text: R`$Q_1 = 25000\text{ VAR}$`,
                  correct: false,
                  feedback: R`$20000 / 0.80 = 25000$ 算出的是斜边——视在功率 $S_1 = P/\text{pf}_1$，单位是 $\text{VA}$ 而不是 $\text{VAR}$！$Q_1$ 是竖直的对边：$Q_1 = P\tan\theta_1$（或 $\sqrt{S_1^2 - P^2}$）。`,
                },
              ],
              board: [R`\text{Step 1: } \theta_1 = \arccos(0.80) = 36.87^\circ,`, R`Q_1 = 20000 \times \tan(36.87^\circ) = 20000 \times 0.75 = 15000\text{ VAR}`],
              halo: ['q1_orig', 'p_fixed'],
              params: G(0),
              layer: L3,
            },
            {
              title: R`第二步：利用有功不变性，求校正后目标无功功率 $Q_2$`,
              mini_svg: MINI_STEP2,
              question: R`并联电容接入后，母线电压 $240\text{ V}$ 保持不变，因此负载的有功功率依然死死锁在 $P = 20\text{ kW}$。当总功率因数提升到 $0.95$ 滞后时，新的净无功功率 $Q_2$ 应该是多少 $\text{VAR}$？`,
              hint: R`$\theta_2 = \arccos(0.95) = 18.1949^\circ,\quad Q_2 = P\tan\theta_2$`,
              options: [
                {
                  text: R`$Q_2 = 7806.25\text{ VAR}$`,
                  correct: false,
                  feedback: R`记住并联铁律：理想电容器只交换无功（$P_C = 0$），且并联不改变负载两端电压 $V_{\text{rms}}$，所以水平边 $P = 20\text{ kW}$ 纹丝不动！直接用 $P\tan\theta_2$ 即可。（$7806.25$ 是先把 $P$ 按 $0.95/0.80$ 放大成 $23750\text{ W}$ 再乘 $\tan\theta_2$ 的结果。）`,
                },
                {
                  text: R`$Q_2 = 6245.00\text{ VAR}$`,
                  correct: false,
                  feedback: R`又掉进正弦陷阱了！$P\sin\theta_2 = 20000 \times 0.3122$ 把水平边 $P$ 当成了斜边。新三角形的底边仍是 $P = 20\text{ kW}$，竖直对边要用 $Q_2 = P\tan\theta_2 = 20000 \times 0.3287$。`,
                },
                {
                  text: R`$Q_2 = 6573.68\text{ VAR}$`,
                  correct: true,
                  feedback: R`完全正确！底边 $P = 20000\text{ W}$ 不动，只是夹角缩到 $\theta_2 = 18.19^\circ$：$Q_2 = 20000 \times 0.328684 = 6573.68\text{ VAR}$（约 $6.57\text{ kVAR}$）。`,
                },
              ],
              board: [R`\text{Step 2: } \theta_2 = \arccos(0.95) = 18.19^\circ,`, R`Q_2 = 20000 \times \tan(18.1949^\circ) = 6573.68\text{ VAR}`],
              halo: ['target_pf', 'p_fixed'],
              params: G(1),
              layer: L3,
            },
            {
              title: R`第三步：确定电容器需提供的补偿无功容量 $Q_C$`,
              mini_svg: MINI_STEP3,
              question: R`既然我们需要把净无功从 $Q_1 = 15000\text{ VAR}$ 压缩到 $Q_2 = 6573.68\text{ VAR}$，那么并联电容器必须就地提供多大容量的无功功率 $Q_C$（取幅值，单位：$\text{VAR}$）？`,
              hint: R`$Q_C = Q_1 - Q_2 = P(\tan\theta_1 - \tan\theta_2)$`,
              options: [
                {
                  text: R`$Q_C = 8426.32\text{ VAR}$`,
                  correct: true,
                  feedback: R`对！$Q_1$、$Q_2$、$Q_C$ 同在虚轴上，直接相减：$15000 - 6573.68 = 8426.32\text{ VAR}$——电容器要就地发出约 $8.43\text{ kVAR}$ 的无功。`,
                },
                {
                  text: R`$Q_C = 13482.80\text{ VAR}$`,
                  correct: false,
                  feedback: R`$Q_1$、$Q_2$ 和 $Q_C$ 全部沿着虚轴 $j$ 排成一条直线！同一直线上的矢量抵消直接做代数减法：$Q_C = Q_1 - Q_2$，绝不需要开根号！（$13482.80 = \sqrt{Q_1^2 - Q_2^2}$。）`,
                },
                {
                  text: R`$Q_C = 21573.68\text{ VAR}$`,
                  correct: false,
                  feedback: R`方向反了！电容是把总无功从 $Q_1$ **往下压**到 $Q_2$，补偿量是两者之差。$Q_1 + Q_2$ 相当于又叠加了一份感性无功，功率因数只会更差。`,
                },
              ],
              board: [R`\text{Step 3: } Q_C = Q_1 - Q_2 = 15000 - 6573.68 = 8426.32\text{ VAR}`],
              halo: ['qc_vec', 'q1_orig', 'q2_net'],
              params: G(2),
              layer: L3,
            },
            {
              title: R`第四步：将无功容量 $Q_C$ 换算为所需电容值 $C$`,
              mini_svg: MINI_STEP4,
              question: R`已知母线电压有效值 $V_{\text{rms}} = 240\text{ V}$，电网频率 $f = 60\text{ Hz}$。请算出发出 $Q_C = 8426.32\text{ VAR}$ 所需的并联电容值 $C$（单位：$\mu\text{F}$，保留两位小数）。`,
              hint: R`$\omega = 2\pi f = 2\pi(60) = 376.99\text{ rad/s},\quad C = \frac{Q_C}{\omega V_{\text{rms}}^2}$`,
              options: [
                {
                  text: R`$C = 2438.17\ \mu\text{F}$`,
                  correct: false,
                  feedback: R`注意两个高频扣分点：第一，容抗里用的是角频率 $\omega = 2\pi f = 376.99\text{ rad/s}$，不是 $60$；第二，功率和电压平方成正比，分母必须是 $240^2 = 57600$！`,
                },
                {
                  text: R`$C = 388.05\ \mu\text{F}$`,
                  correct: true,
                  feedback: R`精准！$C = \dfrac{8426.32}{376.99 \times 57600} = 3.8805 \times 10^{-4}\text{ F} = 388.05\ \mu\text{F}$。单位换算也没掉链子。`,
                },
                {
                  text: R`$C = 194.02\ \mu\text{F}$`,
                  correct: false,
                  feedback: R`$240\text{ V}$ 已经是有效值！你把它换成峰值 $240\sqrt{2}\text{ V}$ 再平方，分母翻了一倍，$C$ 就少了一半。$Q_C = \omega C V_{\text{rms}}^2$ 全程用有效值，不再出现 $\sqrt{2}$ 或 $\tfrac{1}{2}$。`,
                },
              ],
              board: [R`\text{Step 4: } C = \frac{8426.32}{2\pi(60)\times 240^2}`, R`= 3.8805\times 10^{-4}\text{ F} = 388.05\,\mu\text{F}`],
              halo: ['cap_slider', 'qc_vec'],
              params: G(3),
              layer: L3,
            },
            {
              title: R`第五步：量化校正前后线路电流 $I_1$ / $I_2$ 与线损降幅`,
              mini_svg: MINI_STEP5,
              question: R`最后一步，算一笔经济账：并联 $388.05\ \mu\text{F}$ 电容前后，输电母线上的总电流有效值 $I_1$ 和 $I_2$ 分别是多少 $\text{A}$？输电线铜损（$I^2R_{\text{line}}$）降低了百分之多少？`,
              hint: R`$I = \frac{P}{V_{\text{rms}}\cdot\text{pf}},\quad \Delta P_{\text{loss}}\% = \left[1 - \left(\frac{I_2}{I_1}\right)^2\right]\times 100\%$`,
              options: [
                {
                  text: R`$I_1 = 104.17\text{ A}$，$I_2 = 87.72\text{ A}$，线损下降 $15.79\%$`,
                  correct: false,
                  feedback: R`别忘了焦耳定律里线损和电流的**平方**成正比！$I_2/I_1 = 0.80/0.95 = 0.8421$，平方后 $(I_2/I_1)^2 = 0.7091$，所以线损整整砍掉了 $1 - 0.7091 = 29.09\%$！`,
                },
                {
                  text: R`$I_1 = I_2 = 83.33\text{ A}$，线损不变`,
                  correct: false,
                  feedback: R`$I = P/V = 20000/240$ 只在 $\text{pf} = 1$ 时成立！线路电流由视在功率决定：$I = S/V_{\text{rms}} = P/(V_{\text{rms}}\cdot\text{pf})$。校正前 $\text{pf} = 0.80$，电缆里流的是 $S_1/V_{\text{rms}}$，而不是 $P/V_{\text{rms}}$。`,
                },
                {
                  text: R`$I_1 = 104.17\text{ A}$，$I_2 = 87.72\text{ A}$，线损下降 $29.09\%$`,
                  correct: true,
                  feedback: R`账算清了！电流下降 $16.45\text{ A}$（$15.79\%$），而线损按平方下降：$1 - (0.80/0.95)^2 = 29.09\%$——这就是开场说的“把线损砍掉近三成”。`,
                },
              ],
              board: [
                R`\text{Step 5: } I_1 = \frac{20000}{240\times 0.80} = 104.17\text{ A},`,
                R`I_2 = \frac{20000}{240\times 0.95} = 87.72\text{ A},`,
                R`\Delta P_{\text{loss}} = -29.09\%`,
              ],
              halo: ['i_bar', 'loss_drop'],
              params: G(4),
              layer: L3,
            },
          ],
          done_params: { [P.g]: 5, [P.c]: C_FACTORY },
          conclusion: R`通关！$Q_1 = 15000\text{ VAR}$ 压到 $Q_2 = 6573.68\text{ VAR}$，电容器补偿 $Q_C = 8426.32\text{ VAR}$，即 $C = 388.05\ \mu\text{F}$；线路电流从 $104.17\text{ A}$ 降到 $87.72\text{ A}$（$-15.79\%$），线损砍掉 $29.09\%$。左侧 03 层“工厂实战”的数值已全部揭晓：拖动电容滑块，看看越过 $388.05\ \mu\text{F}$ 之后 $\text{pf}$ 怎样继续逼近 $1$。`,
        },
        { kind: 'p', text: '**通关复盘：完整接线图**' },
        { kind: 'figure', svg: SVG_ACT5, caption: '通关复盘：并联 388.05 µF 后，线路电流从 104.2 A 降到 87.7 A，电容就地发出 8.43 kVAR 无功' },
        { kind: 'p', text: '**5.3 诊断测验（4 题高区分度概念与计算检测）**' },
      ],
      quiz: [
        {
          id: 'w5l6_q1',
          question: R`某交流负载两端电压相量为 $\mathbf{V}_{\text{rms}} = 100\angle 20^\circ\text{ V}$，流入电流相量为 $\mathbf{I}_{\text{rms}} = 5\angle{-}10^\circ\text{ A}$。该负载的复功率 $\mathbf{S}$ 与性质是？`,
          options: [
            {
              key: 'A',
              text: R`$\mathbf{S} = 500\angle 10^\circ\text{ VA}$，感性滞后负载`,
              correct: false,
              feedback: R`你忘了对电流取共轭，直接把两个相位角相加：$20^\circ + (-10^\circ) = 10^\circ$。复功率的辐角必须是 $\theta_v - \theta_i = 20^\circ - (-10^\circ) = 30^\circ$，否则平移一下时间零点它就会跟着乱变。`,
            },
            { key: 'B', text: R`$\mathbf{S} = 500\angle 30^\circ\text{ VA}$，感性滞后负载（$Q = +250\text{ VAR}$）`, correct: true },
            {
              key: 'C',
              text: R`$\mathbf{S} = 500\angle{-}30^\circ\text{ VA}$，容性超前负载（$Q = -250\text{ VAR}$）`,
              correct: false,
              feedback: R`符号反了：你算的是 $\theta_i - \theta_v$（相当于对电压取了共轭）。电流 $-10^\circ$ 落后于电压 $20^\circ$，电流滞后即感性，$Q = 500\sin 30^\circ = +250\text{ VAR} > 0$。`,
            },
            {
              key: 'D',
              text: R`$\mathbf{S} = 250\angle 30^\circ\text{ VA}$，感性滞后负载`,
              correct: false,
              feedback: R`角度对了，模长却误乘了 $\tfrac{1}{2}$：$\tfrac{1}{2}V_m I_m$ 是用峰值相量时的写法。题目给的已经是有效值 $V_{\text{rms}}$ 与 $I_{\text{rms}}$，$S = 100 \times 5 = 500\text{ VA}$，绝不再乘 $\tfrac{1}{2}$。`,
            },
          ],
          feedback_correct: R`复功率必须对电流取共轭：$\mathbf{S} = \mathbf{V}_{\text{rms}} \mathbf{I}_{\text{rms}}^* = (100\angle 20^\circ)(5\angle{+}10^\circ) = 500\angle 30^\circ\text{ VA} = 433.01 + j250\text{ VA}$。因 $\theta = \theta_v - \theta_i = 20^\circ - (-10^\circ) = +30^\circ > 0$（电流滞后电压 $30^\circ$），$Q = +250\text{ VAR} > 0$，属于感性滞后负载。`,
          feedback_wrong: R`先写出共轭：$\mathbf{I}_{\text{rms}}^*$ 的相位是 $+10^\circ$；再把模长相乘、辐角相加，看虚部的正负。`,
          figure: SVG_Q1,
          sync: at(L1, ['conj_trap', 'theta_arc'], one(37, true)),
        },
        {
          id: 'w5l6_q2',
          question: R`同一配电母线上并联两个负载：负载 A 为 $8\text{ kVA}$（$\text{pf} = 0.8$ 滞后），负载 B 为 $5\text{ kVA}$（$\text{pf} = 0.6$ 超前）。关于母线总视在功率 $S_{\text{total}}$，以下说法正确的是？`,
          options: [
            {
              key: 'A',
              text: R`$S_{\text{total}} = 8 + 5 = 13.00\text{ kVA}$`,
              correct: false,
              feedback: R`视在功率不能标量相加：两个负载的无功一正一负，$Q_A = +4.8\text{ kVAR}$ 与 $Q_B = -4.0\text{ kVAR}$ 大部分互相抵消了，总视在功率远小于 $13\text{ kVA}$。`,
            },
            {
              key: 'B',
              text: R`$S_{\text{total}} = 8 - 5 = 3.00\text{ kVA}$（超前负载的视在功率直接相减）`,
              correct: false,
              feedback: R`只有无功 $Q$ 带符号相抵；视在功率 $S_k$ 是模长，有功功率 $P_A = 6.4\text{ kW}$、$P_B = 3.0\text{ kW}$ 照样要相加。先拆成 $P_k + jQ_k$ 再合成：$9.4 + j0.8\text{ kVA}$。`,
            },
            {
              key: 'C',
              text: R`$S_{\text{total}} = \sqrt{(6.4 + 3.0)^2 + (4.8 + 4.0)^2} = 12.88\text{ kVA}$`,
              correct: false,
              feedback: R`拆分对了，可负载 B 是超前（容性）负载，它的无功 $Q_B = -4.0\text{ kVAR}$ 必须带负号；当成 $+4.0$ 之后，感性和容性就不再抵消了。`,
            },
            {
              key: 'D',
              text: R`$S_{\text{total}} = \sqrt{(6.4 + 3.0)^2 + (4.8 - 4.0)^2} = 9.434\text{ kVA}$，且总功率因数为滞后`,
              correct: true,
            },
          ],
          feedback_correct: R`负载 A：$P_A = 8 \times 0.8 = 6.4\text{ kW}$，$Q_A = +8 \times 0.6 = +4.8\text{ kVAR}$（滞后为正）；负载 B：$P_B = 5 \times 0.6 = 3.0\text{ kW}$，$Q_B = -5 \times 0.8 = -4.0\text{ kVAR}$（超前为负）。总复功率 $\mathbf{S}_{\text{total}} = (6.4 + 3.0) + j(4.8 - 4.0) = 9.4 + j0.8\text{ kVA}$，故 $|\mathbf{S}_{\text{total}}| = \sqrt{9.4^2 + 0.8^2} = 9.434\text{ kVA}$，因 $Q_{\text{total}} = +0.8\text{ kVAR} > 0$，总功率因数为滞后。（巧的是 $\sqrt{8^2 + 5^2}$ 也等于 $9.434$：两个负载的功率因数角 $+36.87^\circ$ 与 $-53.13^\circ$ 恰好相差 $90^\circ$，两条 $\mathbf{S}$ 矢量互相垂直，勾股定理才碰巧成立；一般情况下必须逐项拆分 $P$ 与 $Q$。）`,
          feedback_wrong: '先把每个负载拆成 P + jQ（超前的 Q 带负号），实部、虚部分别相加，最后才取模。',
          figure: SVG_Q2,
          sync: at(L2, ['bar_scalar', 'bar_true'], loads),
        },
        {
          id: 'w5l6_q3',
          question: R`工厂在恒压交流母线的感性电机两端并联了一组电力电容器，将系统功率因数从 $0.75$ 滞后校正到 $0.95$ 滞后。校正之后，以下哪个物理量保持绝对不变？`,
          options: [
            { key: 'A', text: R`电机本身消耗的有功功率 $P$`, correct: true },
            {
              key: 'B',
              text: R`输电线路上的总电流有效值 $I_{\text{line}}$`,
              correct: false,
              feedback: R`线路电流恰恰是校正的目标：$I_{\text{line}} = P/(V_{\text{rms}}\cdot\text{pf})$，$\text{pf}$ 从 $0.75$ 提到 $0.95$，电流降到原来的 $0.75/0.95 \approx 79\%$。`,
            },
            {
              key: 'C',
              text: R`电源向系统输出的总视在功率 $S_{\text{total}}$`,
              correct: false,
              feedback: R`电容就地供给了大部分无功，母线送出的净无功 $Q$ 变小，$S_{\text{total}} = \sqrt{P^2 + Q^2} = P/\text{pf}$ 跟着缩小（降到原来的约 $79\%$）。`,
            },
            {
              key: 'D',
              text: R`输电线路电阻上的功率损耗 $I_{\text{line}}^2 R_{\text{line}}$`,
              correct: false,
              feedback: R`线损 $\propto I_{\text{line}}^2$，降得比电流还猛：$(0.75/0.95)^2 \approx 0.62$，线损约减少 $38\%$。`,
            },
          ],
          feedback_correct: R`电容器并联在恒压母线上，不改变电机两端的电压 $V_{\text{rms}}$，且理想电容不消耗有功功率，因此电机本身消耗的有功功率 $P$ 绝对不变；而总无功 $Q$、总视在功率 $S$、输电线电流 $I_{\text{line}}$ 以及线损 $I_{\text{line}}^2 R_{\text{line}}$ 均显著下降。`,
          feedback_wrong: '想一想：电容并在恒压母线上，电机两端的电压变了没有？理想电容会不会吃掉有功？',
          figure: SVG_Q3,
          sync: at(L3, ['p_fixed'], { [P.scn]: 'sadiku', [P.c]: C_SADIKU, [P.pf2]: 0.95 }),
        },
        {
          id: 'w5l6_q4',
          question: R`一台接在 $220\text{ V}_{\text{rms}}$、$50\text{ Hz}$ 电网上的感性负载消耗有功功率 $P = 10\text{ kW}$，初始功率因数为 $0.70$ 滞后。若并联电容将其校正为 $0.95$ 滞后，所需电容值 $C$ 最接近以下哪一项？`,
          options: [
            {
              key: 'A',
              text: R`$227.4\ \mu\text{F}$`,
              correct: false,
              feedback: R`$227.4\ \mu\text{F}$ 恰好是正确值的一半：你把 $220\text{ V}$ 换成峰值 $220\sqrt{2}\text{ V}$ 代入，$V^2$ 翻了一倍。$Q_C = \omega C V_{\text{rms}}^2$ 里只用有效值。`,
            },
            {
              key: 'B',
              text: R`$691.5\ \mu\text{F}$`,
              correct: false,
              feedback: R`太大了：$691.5\ \mu\text{F}$ 在 $220\text{ V}$、$50\text{ Hz}$ 下发出约 $10.5\text{ kVAR}$，比负载原有的 $Q_1 = P\tan\theta_1 = 10.2\text{ kVAR}$ 还多——比补到 $\text{pf} = 1$（约 $671\ \mu\text{F}$）还多补了一截，系统已过补偿进入超前区。只需补 $Q_C = P(\tan\theta_1 - \tan\theta_2) \approx 6.92\text{ kVAR}$。`,
            },
            { key: 'C', text: R`$454.8\ \mu\text{F}$`, correct: true },
            {
              key: 'D',
              text: R`$909.6\ \mu\text{F}$`,
              correct: false,
              feedback: R`$909.6\ \mu\text{F}$ 是正确值的两倍：角频率少乘了 $2$（写成了 $\omega = \pi f$）。应为 $\omega = 2\pi f = 2\pi \times 50 = 314.159\text{ rad/s}$。`,
            },
          ],
          feedback_correct: R`$\theta_1 = \arccos(0.70) = 45.573^\circ$（$\tan\theta_1 = 1.0202$），$\theta_2 = \arccos(0.95) = 18.195^\circ$（$\tan\theta_2 = 0.3287$）。所需补偿无功 $Q_C = 10000 \times (1.0202 - 0.3287) = 6915.20\text{ VAR}$。角频率 $\omega = 2\pi \times 50 = 314.159\text{ rad/s}$，故 $C = Q_C / (\omega V_{\text{rms}}^2) = 6915.20 / (314.159 \times 220^2) = 4.5479 \times 10^{-4}\text{ F} \approx 454.8\ \mu\text{F}$。`,
          feedback_wrong: R`按第 4 幕的通式：先求 $Q_C = P(\tan\theta_1 - \tan\theta_2)$，再除以 $\omega V_{\text{rms}}^2$（$\omega = 2\pi f$，$V_{\text{rms}} = 220\text{ V}$）。`,
          figure: SVG_Q4,
          sync: at(L3, ['cap_slider', 'target_pf'], { [P.scn]: 'sadiku', [P.pf2]: 0.95 }),
        },
      ],
    },
  ],
};

export default W5_L6;
