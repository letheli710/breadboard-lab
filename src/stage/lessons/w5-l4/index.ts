// W5-L4 · 交流网络定理与交流运放电路（叠加、电源变换、交流戴维南与运放） (lesson sheet:
// docs/lessons/W5-L4.md). Type B, strictly 2D: no three.js anywhere in this folder (lesson.test.ts
// checks it); the op amp is a 2D schematic symbol, not the 3D LM358. The professor's opening and
// the text of the six acts, the act diagrams (svgs.ts), the guided example and the diagnostic quiz
// are reproduced from the sheet; [[id|…]] only links a term to the stage (the words are unchanged).
// Changes from the sheet, of form:
// - display formulas sit in ① / ② / ③ cards (a lead-in sentence becomes the card's title or the
//   step's label; ①'s closing formula runs inline at the end of its sentence); the sub-headings
//   (1.1, 1.2 …) are bold lines; the professor's opening is the first paragraph of act 1; each act's
//   diagram stands where the sheet has it (a figure block); a long chain of equalities in ③ is set
//   over two lines (aligned), so it fits a phone;
// - plain-text symbols of the guided-example and quiz JSON (Z_L, V_o1, 1.6 + j0.8 …) are set as TeX;
//   the guided steps had no options: each gets three — the sheet's expected answer (praise), the
//   mistake its professor_intercept corrects (that intercept), and one more plausible mistake with
//   its own intercept; the right answer moves between positions; the quiz options are reordered so
//   the right answer is not B three times;
// - anti-spoiler: the guided example (DC + ω1 = 2 + ω2 = 4) is its own problem (act 1 works the
//   DC + 2 + 5 one), so no ③ moves; its step diagrams lost what gave each step's answer away
//   (svgs.ts), and its numbers on stage layer 01 stay covered while it runs (stage param w54_g =
//   steps solved; done_params uncovers them);
// - fixes (see the report): the AC maximum-power lesson is W5-L5 in this course (the sheet says
//   W5-L7/L8); the power note of the 口诀 now says which powers may not be added (the average
//   powers of components of different frequencies do add, so "绝不能" was too strong);
// - left out (build instructions, not lesson text): the word "JSON" in the 6.2 / 6.3 headings, the
//   quiz's passing score (the site uses 4/4), the 「Claude 工程落地清单」 (6.4) and the
//   「与工程落地」 of act 6's title that announced it.
// Added (the sheet has none): the hover map; the guided example's circuit diagram and conclusion;
// praise for right options; per-option quiz feedback written from the explanations; the quiz
// figures (figures.ts); the op-amp layer's note on the lab LM358's swing on ±9 V.

import { lazy } from 'react';
import type { StageLesson, StageSync } from '../../types';
import { SVG_GUIDED, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './figures';
import { L1, L2, L3, P, type EqView, type SupPreset, type Uni } from './parts';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_ACT1, SVG_ACT2, SVG_ACT3, SVG_ACT4, SVG_ACT5, SVG_ACT6 } from './svgs';

const Layer01 = lazy(() => import('./Superpose'));
const Layer02 = lazy(() => import('./Equiv'));
const Layer03 = lazy(() => import('./OpAmp'));

const R = String.raw;
/** inline `code` inside a String.raw text */
const code = (s: string) => `\`${s}\``;

const sup = (preset: SupPreset, uni: Uni = 'all') => ({ [P.sup]: preset, [P.uni]: uni });
const at = (layer: string, halo: string[], params: Record<string, unknown>): StageSync => ({ layer, halo, params });
/** a guided step's stage: the guided circuit in one universe, `solved` steps uncovered */
const G = (solved: number, uni: Uni) => ({ ...sup('guided', uni), [P.g]: solved });
const eq = (view: EqView, extra: Record<string, unknown> = {}) => ({ [P.eq]: view, ...extra });

const W5_L4: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Layer01, [L2]: Layer02, [L3]: Layer03 },
  lesson_meta: {
    lesson_id: 'W5-L4',
    world: 'World 5',
    title: '交流网络定理与交流运放电路（叠加、电源变换、交流戴维南与运放）',
    subtitle: 'AC Network Theorems & AC Op-Amp Circuits: Superposition, Source Transformation, Thevenin/Norton & Complex-Impedance Op Amps',
    lesson_type: 'B',
    lesson_type_label: '纯公式/方法论课（无 3D 面包板，聚焦频域定理与复阻抗抽象）',
    estimated_minutes: 55,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette)',
      sections: [
        'Section 10.4 Superposition Theorem',
        'Section 10.5 Source Transformation',
        'Section 10.6 Thevenin and Norton Equivalent Circuits',
        'Section 10.7 Op Amp AC Circuits',
      ],
    },
    textbook_supplement: 'Introductory Circuit Analysis, 14th Edition (Boylestad) · Chapter 18 Network Theorems (ac) — 直流与交流定理直觉对比',
    prerequisites: [
      'W2-L5: 叠加定理（直流）',
      'W2-L6: 电源变换（直流）',
      'W2-L7: 戴维南与诺顿等效（直流）',
      'W3-L3/L4: 理想运算放大器（虚短、虚断、反相与同相放大器）',
      'W5-L3: 交流节点电压法与网孔电流法',
    ],
    next_lesson: 'W5-L5',
    next_lesson_title: '瞬时功率、平均功率、有效值（RMS）与交流最大功率传输',
  },
  left_stage_spec: {
    use_3d: false,
    layers: [
      {
        id: L1,
        label: '01 分频叠加台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '01 多频率叠加按频拆分台 (DC + ω1 + ω2)：在原始混合激励电路与三个独立频率子宇宙（ω=0 直流开/短路态、ω1 = 2 rad/s、ω2）之间切换，L、C 的复阻抗随频率变化；底部同步合成时域波形 v_o(t) = v_o0 + v_o1(t) + v_o2(t)——两个相量转速不同，只把它们的时域投影相加。',
      },
      {
        id: L2,
        label: '02 等效切换台',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 复阻抗戴维南等效与源变换切换台：在原始交流网络、逐步电源变换视图、戴维南等效（V_Th 串联 Z_Th）、诺顿等效（I_N 并联 Z_N）及受控源 1∠0° V 测试源注入视图之间切换，挂上负载 Z_L 看端口 a-b 的外特性不变。',
      },
      {
        id: L3,
        label: '03 运放复增益',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '03 交流运放复阻抗增益分析台：反馈支路 C_f 与 R_f 并联的交流反相运放，拖动角频率 ω 对数滑块，实时计算 Z_f(jω)、复增益 A_v(jω) 的幅值与相移，高亮虚地点 V₋ = 0 并联动幅频衰减曲线。',
      },
    ],
    hover_map: {
      // layer 01
      node_vo: { label: '输出节点 v_o', desc: '四条支路的公共节点：v_o(t) = v_o0 + v_o1(t) + v_o2(t)' },
      v0: { label: '直流源 V₀', desc: 'ω₀ = 0：例题 1 为 12 V，引导例题为 6 V；在 ω₁、ω₂ 子宇宙里置零 = 短路' },
      r1: { label: '电阻 R₁', desc: '与直流源、电感串联：对所有频率一视同仁' },
      ind: { label: '电感 L', desc: 'Z_L = jωL：直流时为 0（短路），频率越高阻抗越大' },
      cap: { label: '电容 C', desc: 'Z_C = 1/(jωC)：直流时为 ∞（开路），频率越高阻抗越小' },
      v1: { label: '交流电压源 v₁（ω₁ = 2 rad/s）', desc: '与电容串联；在直流与 ω₂ 子宇宙里置零 = 短路' },
      rl: { label: '负载电阻 R_L', desc: '节点 v_o 到地，4 Ω' },
      i2: { label: '交流电流源 i₂（ω₂）', desc: '注入节点 v_o；在直流与 ω₁ 子宇宙里置零 = 开路' },
      uni_dc: { label: '子宇宙 ①：直流 ω₀ = 0', desc: '只留 V₀：v₁ 短路、i₂ 开路，L 短路、C 开路，电阻分压' },
      uni_w1: { label: '子宇宙 ②：ω₁', desc: '只留 v₁：V₀ 短路、i₂ 开路，L、C 换成 ω₁ 下的复阻抗' },
      uni_w2: { label: '子宇宙 ③：ω₂', desc: '只留 i₂：V₀、v₁ 短路，L、C 换成 ω₂ 下的复阻抗，三支路并联' },
      wave_dc: { label: '直流分量 v_o0', desc: '不随时间变化的一条水平线' },
      wave_w1: { label: '分量 v_o1(t)', desc: 'Re{V_o1 e^{jω₁t}}：以 ω₁ 振荡' },
      wave_w2: { label: '分量 v_o2(t)', desc: 'Re{V_o2 e^{jω₂t}}：以 ω₂ 振荡' },
      wave_total: { label: '总输出 v_o(t)', desc: '三个分量在时域逐点相加：一条非正弦的周期波形' },
      ph_w1: { label: '旋转相量 V_o1 e^{jω₁t}', desc: '以 ω₁ 逆时针旋转；它在实轴上的投影就是 v_o1(t)' },
      ph_w2: { label: '旋转相量 V_o2 e^{jω₂t}', desc: '以 ω₂ 逆时针旋转，比 V_o1 转得快：两支箭头的夹角时刻在变' },
      no_phasor_sum: { label: '异频相量不能直接相加', desc: '转速不同的两个相量没有固定的合成：只能各自取实部（回时域）后再相加' },
      // layer 02 · source transformation (act 2)
      st_vs: { label: '电压源 V_s = 24∠0° V', desc: '与 R₁ = 6 Ω 串联：第一次变换的对象' },
      st_r1: { label: 'R₁ = 6 Ω', desc: '变换后留作电流源的并联内阻' },
      st_zc: { label: '电容支路 Z_C = −j6 Ω', desc: '中间节点到地，与变换出的电流源并联合并' },
      st_zser: { label: '串联阻抗 Z_ser = 5 + j3 Ω', desc: '第二次变换后与 Z_eq1 串联，虚部 −j3 与 +j3 抵消' },
      st_i2: { label: '电流源 I₂ = 2∠90° A', desc: '向上注入节点 x，最后与 I_left 直接复数相加' },
      st_r3: { label: '负载 R₃ = 8 Ω（保护）', desc: '目标变量 V_x 所在支路：不能被吞进电源变换' },
      st_vx: { label: '节点电压 V_x', desc: '每一步变换后算出的 V_x 都相同：6 + j2 V' },
      st_src: { label: '本步的等效源', desc: '电压源 ↔ 电流源来回变换：V_s = Z_s I_s' },
      st_step: { label: '本步的等效内阻', desc: '变换前后保持不变的 Z_s，与相邻元件串并联合并' },
      // layer 02 · Thévenin / Norton (act 3)
      th_vs: { label: '电压源 V_s = 50∠0° V', desc: '求 Z_Th 时置零 = 短路' },
      th_z1: { label: 'Z₁ = 6 − j8 Ω', desc: '求 Z_Th 时与 Z₂ 并联' },
      th_z2: { label: 'Z₂ = j10 Ω', desc: '节点 1 到地；Z₁ ∥ Z₂ = 15 + j5 Ω' },
      th_r2: { label: 'R₂ = 4 Ω', desc: '节点 1 到端口 a；开路时 I_s 全部流过它' },
      th_is: { label: '电流源 I_s = 2∠90° A', desc: '注入端口 a；求 Z_Th 时置零 = 开路' },
      port_ab: { label: '端口 a-b', desc: '外部只看得到端口电压与电流：原电路与等效电路在这里完全一样' },
      zload: { label: '负载 Z_L = R_L + jX_L', desc: '挂在端口 a-b 上：三种视图算出的 V_ab、I_ab 一致' },
      vth: { label: '戴维南电压 V_Th = V_oc', desc: '端口开路电压' },
      zth: { label: '等效阻抗 Z_Th = Z_N', desc: 'R_Th + jX_Th：X_Th > 0 呈感性，X_Th < 0 呈容性' },
      in_n: { label: '诺顿电流 I_N = I_sc', desc: 'I_N = V_Th / Z_Th，端口短路电流' },
      z_tri: { label: '阻抗三角形', desc: '实部 R_Th、虚部 X_Th、模 |Z_Th| 与阻抗角 θ' },
      // layer 02 · dependent source (act 4)
      t4_vs: { label: '电压源 V_s = 12∠0° V', desc: 'Step A 保留；Step B 置零 = 短路' },
      t4_r1: { label: 'R₁ = 4 Ω', desc: '电源到节点 1' },
      t4_zl: { label: 'Z_L = j4 Ω', desc: '节点 1 到端口 a' },
      vx_ctrl: { label: '控制电压 V_x', desc: '节点 1 对地电压（电容 −j4 Ω 两端）' },
      dep_src: { label: '压控电流源 0.5V_x', desc: '受控源：任何时候都不能置零，求 Z_Th 时也完整保留' },
      test_src: { label: '测试源 V_t = 1∠0° V', desc: '独立源置零后加在端口上：Z_Th = V_t / I_t' },
      it: { label: '测试电流 I_t', desc: '流入端口 a 的电流' },
      // layer 03
      vin: { label: '输入 V_i', desc: 'v_i(t) = 2cos(ωt) V，相量 2∠0° V' },
      op_r1: { label: '输入电阻 Z₁ = R₁ = 10 kΩ', desc: '反相：V_i 到虚地；同相：反相端到地' },
      op_rf: { label: '反馈电阻 R_f = 50 kΩ', desc: '低频时反馈支路就剩它：增益 −R_f/R₁ = −5' },
      op_cf: { label: '反馈电容 C_f = 20 nF', desc: '高频时阻抗趋近 0，把反馈支路短路' },
      zf: { label: '反馈复阻抗 Z_f = R_f ∥ (1/jωC_f)', desc: 'Z_f = R_f / (1 + jωR_fC_f)：随 ω 变化' },
      op_amp: { label: '理想运放', desc: '线性负反馈区：虚断 I₋ = I₊ = 0，虚短 V₋ = V₊' },
      vgnd: { label: '虚地 / 虚短', desc: '反相：V₊ 接地，所以 V₋ = 0；同相：V₋ = V₊。输入端电流为零（虚断）' },
      vout: { label: '输出 V_o', desc: 'V_o = A_v(jω) V_i' },
      av: { label: '复增益 A_v(jω)', desc: '反相 −Z_f/Z₁，同相 1 + Z_f/Z₁：幅值与相移都随 ω 变化' },
      av_curve: { label: '幅频曲线 |A_v|（dB）', desc: '低频平台 20log₁₀5 ≈ 13.98 dB，ω_c 之后每十倍频下降 20 dB' },
      wc_badge: { label: '−3 dB 截止角频率 ω_c', desc: 'ω_c = 1/(R_f C_f) = 1000 rad/s：增益降到直流的 1/√2（预告 W5-L9）' },
    },
  },
  right_acts: [
    /* ------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '多频率激励的“分频宇宙”法则——交流叠加定理（Sadiku §10.4）',
      sync: at(L1, ['wave_total', 'no_phasor_sum'], { ...sup('ex1'), [P.kill]: true }),
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎回到 Breadboard Lab 的理论黑板前。上一课（${code('W5-L3')}）我们把节点电压法和网孔电流法搬进了相量域，你大概已经体会到一个惊人的事实：**只要进入相量域，所有电阻、电感、电容都统一成了复阻抗 $\mathbf{Z}$，基尔霍夫定律和欧姆定律长相与直流一模一样**。`,
        },
        {
          kind: 'p',
          text: R`那么今天，我们把 ${code('World 2')} 的三大网络神器（叠加定理、电源变换、戴维南/诺顿等效）以及 ${code('World 3')} 的王牌器件（理想运算放大器）全部升级到交流频域！但是，请先收起“直接照抄直流公式”的轻敌心态——**今天这堂课藏着交流电路里最致命的一个物理陷阱，也是交流叠加定理真正的杀手锏：多频率激励**。此外，当你把一颗小小的电容放进运放反馈支路时，你会亲眼见证一个放大器如何瞬间蜕变成 ${code('W5-L9')} 的**有源滤波器**。拿好笔记本，我们直接开讲！`,
        },
        { kind: 'p', text: '**1.1 为什么交流叠加的真正杀手锏是“多频率”？**' },
        {
          kind: 'p',
          text: R`在 ${code('W2-L5')} 学直流叠加定理时，很多同学会问：“节点电压法已经够快了，干嘛还要把电路拆成好几个子电路算叠加？”在直流电路里，叠加定理确实大多只是“锦上添花”。但在交流电路里，当电路中同时存在**不同频率的独立源**（例如一个[[v0|直流偏置电源 $\omega_0 = 0$]]、一个[[v1|低频信号源 $\omega_1 = 2\text{ rad/s}$]]、再加一个[[i2|高频干扰源 $\omega_2 = 5\text{ rad/s}$]]）时，**节点电压法和网孔电流法在单一相量域里彻底失效，叠加定理成为你唯一的救命稻草！**`,
        },
        { kind: 'p', text: '为什么？从物理机制上看：' },
        {
          kind: 'ul',
          items: [
            R`电阻 $R$ 对所有频率一视同仁，但[[ind|电感阻抗 $\mathbf{Z}_L = j\omega L$]] 和[[cap|电容阻抗 $\mathbf{Z}_C = \frac{1}{j\omega C}$]] 是**频率 $\omega$ 的函数**。`,
            R`当电路里同时存在 $\omega_0 = 0$、$\omega_1 = 2$、$\omega_2 = 5$ 时，同一个电容 $C$ 在三个频率下呈现出**三个完全不同的阻抗值**！根本不存在一个“统一的相量电路”能同时容纳它们。`,
            R`更致命的是：**[[no_phasor_sum|绝不能把不同频率的相量直接相加！]]** 相量 $\mathbf{V}_1$ 代表以角速度 $\omega_1$ 旋转的向量 $\mathbf{V}_1 e^{j\omega_1 t}$，而 $\mathbf{V}_2$ 代表以角速度 $\omega_2$ 旋转的向量 $\mathbf{V}_2 e^{j\omega_2 t}$。[[ph_w1,ph_w2|两个转速不同的指针]]在复平面上相对夹角时刻在变，强行写 $\mathbf{V}_1 + \mathbf{V}_2$ 在数学和物理上都是彻头彻尾的错误！`,
          ],
        },
        {
          kind: 'formula',
          title: R`因此，交流多频率叠加定理必须严格遵循**“[[uni_dc,uni_w1,uni_w2|分频拆解 → 各自频域求解]] → [[wave_total|全部还原时域 → 时域求和]]”**的四步铁律：`,
          tex: R`v(t) = v_0 + v_1(t) + v_2(t) + \cdots = V_0 + \operatorname{Re}\!\left\{\mathbf{V}_1 e^{j\omega_1 t}\right\} + \operatorname{Re}\!\left\{\mathbf{V}_2 e^{j\omega_2 t}\right\} + \cdots`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授口诀**：**同频可并相量算，异频必须分宇宙；直流电感短、电容断，最后统统回时域再相加！**（注：仅对电压、电流等线性响应成立；**功率是非线性二次量，绝不能直接用叠加定理求和**——瞬时功率与同频分量的功率都不行；只有频率互异的各分量的**平均**功率恰好可以相加，${code('W5-L5')} 再讲！）`,
        },
        { kind: 'p', text: R`**1.2 交互原理图：多频率（DC + $\omega_1$ + $\omega_2$）三子电路拆分图**` },
        { kind: 'figure', svg: SVG_ACT1, caption: '多频率激励三子电路拆分原理图（左侧 01 舞台可逐个切换三个子宇宙）' },
        { kind: 'p', text: R`**1.3 三段式教授板书推导：例题 1（DC + $\omega_1=2$ + $\omega_2=5$ 多频率叠加）**` },
        {
          kind: 'p',
          text: R`**题目**：如上图所示，电路[[node_vo|节点 $v_o(t)$]] 连接四条支路：① [[v0|直流源 $V_0 = 12\text{ V}$]] 串联 [[r1|$R_1 = 4\ \Omega$]] 与 [[ind|$L = 2\text{ H}$]]；② [[v1|交流源 $v_1(t) = 20\cos(2t)\text{ V}$]] 串联 [[cap|$C = 0.25\text{ F}$]]；③ [[rl|负载电阻 $R_L = 4\ \Omega$]] 接地；④ [[i2|交流电流源 $i_2(t) = 3\sin(5t)\text{ A}$]] 注入节点 $v_o$。求稳态输出电压 $v_o(t)$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`线性时不变（LTI）电路满足齐次性与可加性，但储能元件阻抗 $\mathbf{Z}_L(\omega) = j\omega L$、$\mathbf{Z}_C(\omega) = \frac{1}{j\omega C}$ 显式依赖激励角频率 $\omega$。当激励包含三个互异频率 $\omega_0 = 0$、$\omega_1$、$\omega_2$ 时，必须将原电路拆分为三个单频子电路分别在对应频域求解，再经由逆相量变换 $v_k(t) = \operatorname{Re}\{\mathbf{V}_{ok} e^{j\omega_k t}\}$ 全部还原回时域后求和：$v_o(t) = v_{o0} + v_{o1}(t) + v_{o2}(t)$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · [[uni_dc|**子电路 0（直流 $\omega_0 = 0$）**]]：$v_1$ 短路、$i_2$ 开路；稳态下电感 $L$ 视作短路（$\mathbf{Z}_L(0)=0$），电容 $C$ 视作开路（$\mathbf{Z}_C(0)=\infty$）。由电阻分压公式：`,
          tex: R`v_{o0} = V_0 \frac{R_L}{R_1 + R_L}`,
        },
        {
          kind: 'formula',
          title: R`[[uni_w1|**子电路 1（交流 $\omega_1$）**]]：$V_0$ 短路、$i_2$ 开路。定义 $\mathbf{Z}_{L1} = j\omega_1 L$、$\mathbf{Z}_{C1} = \frac{1}{j\omega_1 C}$，右侧并联等效阻抗为：`,
          tex: R`\mathbf{Z}_{\parallel 1} = (R_1 + \mathbf{Z}_{L1}) \parallel R_L = \frac{(R_1 + \mathbf{Z}_{L1})R_L}{R_1 + \mathbf{Z}_{L1} + R_L}`,
        },
        {
          kind: 'formula',
          title: R`由复阻抗分压公式得相量 $\mathbf{V}_{o1}$：`,
          tex: R`\mathbf{V}_{o1} = \mathbf{V}_1 \frac{\mathbf{Z}_{\parallel 1}}{\mathbf{Z}_{C1} + \mathbf{Z}_{\parallel 1}}`,
        },
        {
          kind: 'formula',
          title: R`[[uni_w2|**子电路 2（交流 $\omega_2$）**]]：$V_0$ 短路、$v_1$ 短路。定义 $\mathbf{Z}_{L2} = j\omega_2 L$、$\mathbf{Z}_{C2} = \frac{1}{j\omega_2 C}$，节点总导纳与相量 $\mathbf{V}_{o2}$ 分别为：`,
          tex: R`\mathbf{Y}_{\text{tot},2} = \frac{1}{R_1 + \mathbf{Z}_{L2}} + \frac{1}{\mathbf{Z}_{C2}} + \frac{1}{R_L}, \qquad \mathbf{V}_{o2} = \frac{\mathbf{I}_2}{\mathbf{Y}_{\text{tot},2}}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`1. **求直流分量 $v_{o0}$**（$V_0 = 12\text{ V}, R_1 = 4\ \Omega, R_L = 4\ \Omega$）：`,
              tex: R`v_{o0} = 12 \times \frac{4}{4 + 4} = 6.00\text{ V}`,
            },
            {
              label: R`2. **求 $\omega_1 = 2\text{ rad/s}$ 分量 $v_{o1}(t)$**（$\mathbf{V}_1 = 20\angle 0^\circ\text{ V}$）：`,
              tex: R`\mathbf{Z}_{L1} = j(2)(2) = j4\ \Omega, \qquad \mathbf{Z}_{C1} = \frac{1}{j(2)(0.25)} = -j2\ \Omega`,
            },
            {
              label: '',
              tex: R`\begin{aligned} \mathbf{Z}_{\parallel 1} &= \frac{(4 + j4)(4)}{4 + j4 + 4} = \frac{16 + j16}{8 + j4} \\ &= \frac{(4 + j4)(2 - j1)}{2^2 + 1^2} = \frac{12 + j4}{5} = 2.4 + j0.8\ \Omega \end{aligned}`,
            },
            {
              label: '',
              tex: R`\begin{aligned} \mathbf{V}_{o1} &= 20 \cdot \frac{2.4 + j0.8}{-j2 + 2.4 + j0.8} = 20 \cdot \frac{2.4 + j0.8}{2.4 - j1.2} \\ &= 20 \cdot \frac{3 + j1}{3 - j1.5} = \frac{40}{3} + j\frac{40}{3} \approx 18.86\angle 45.00^\circ\text{ V} \end{aligned}`,
            },
            { label: '还原回时域：', tex: R`v_{o1}(t) = 18.86\cos(2t + 45^\circ)\text{ V}` },
            {
              label: R`3. **求 $\omega_2 = 5\text{ rad/s}$ 分量 $v_{o2}(t)$**：先统一余弦基准：$i_2(t) = 3\sin(5t) = 3\cos(5t - 90^\circ)\text{ A} \implies \mathbf{I}_2 = 3\angle -90^\circ = -j3\text{ A}$。`,
              tex: R`\mathbf{Z}_{L2} = j(5)(2) = j10\ \Omega, \qquad \mathbf{Z}_{C2} = \frac{1}{j(5)(0.25)} = -j0.8\ \Omega`,
            },
            {
              label: '',
              tex: R`\begin{aligned} \mathbf{Y}_{\text{tot},2} &= \frac{1}{4 + j10} + \frac{1}{-j0.8} + \frac{1}{4} = \frac{4 - j10}{116} + j1.25 + 0.25 \\ &\approx 0.2845 + j1.1638\text{ S} \approx 1.1981\angle 76.26^\circ\text{ S} \end{aligned}`,
            },
            { label: '', tex: R`\mathbf{V}_{o2} = \frac{3\angle -90^\circ}{1.1981\angle 76.26^\circ} \approx 2.504\angle -166.26^\circ\text{ V}` },
            { label: '还原回时域：', tex: R`v_{o2}(t) = 2.50\cos(5t - 166.26^\circ)\text{ V}` },
            { label: R`4. [[wave_total|**时域最终合成**]]：`, tex: R`v_o(t) = 6 + 18.86\cos(2t + 45^\circ) + 2.50\cos(5t - 166.26^\circ)\text{ V}` },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: R`交流电源变换——用 $\mathbf{V}_s = \mathbf{Z}_s \mathbf{I}_s$ 折叠复杂梯形网络（Sadiku §10.5）`,
      sync: at(L2, ['st_src', 'st_step'], eq('source', { [P.st]: 0 })),
      blocks: [
        { kind: 'p', text: '**2.1 从直流到交流：端口等效的复数升级**' },
        {
          kind: 'formula',
          title: R`在 ${code('W2-L6')} 里，我们知道一个电压源串联电阻可以等效为一个电流源并联同一电阻。在**单一角频率 $\omega$** 的相量域中，这一关系原封不动地推广为复阻抗形式：`,
          tex: R`\mathbf{V}_s = \mathbf{Z}_s \mathbf{I}_s \qquad \Longleftrightarrow \qquad \mathbf{I}_s = \frac{\mathbf{V}_s}{\mathbf{Z}_s}`,
        },
        { kind: 'p', text: R`其中 $\mathbf{Z}_s$ 保持**完全不变**（既可以是纯电阻，也可以是 $R + jX$ 复阻抗）。但请牢记三条使用红线：` },
        {
          kind: 'ol',
          items: [
            '**同频前提**：只有同一频率下的源才能在同一相量图里变换并合并。',
            R`**保护目标变量与控制变量**：如果题目要你求某支路的电流或电压，或者受控源的控制量就在某条支路上，**切勿把该支路吞并进电源变换里**，否则会把目标变量或控制变量“变没”。`,
            R`**仅对外端口等效**：[[port_ab|端口 $a$-$b$]] 外部的电压电流完全不变，但电源内部的电流与功耗并不等效。`,
          ],
        },
        { kind: 'p', text: '**2.2 交互原理图：交流电源双向变换与端口等效**' },
        { kind: 'figure', svg: SVG_ACT2, caption: '交流电源变换双向等效原理图' },
        { kind: 'p', text: R`**2.3 三段式教授板书推导：例题 2（连环交流电源变换求 $\mathbf{V}_x$）**` },
        {
          kind: 'p',
          text: R`**题目**：某同频交流梯形网络：最左侧为[[st_vs|电压源 $\mathbf{V}_s = 24\angle 0^\circ\text{ V}$]] 串联 [[st_r1|$R_1 = 6\ \Omega$]]；中间节点接[[st_zc|电容支路 $\mathbf{Z}_C = -j6\ \Omega$]] 到地；向右侧串联[[st_zser|阻抗 $\mathbf{Z}_{\text{ser}} = 5 + j3\ \Omega$]] 后到达[[st_vx|输出节点 $x$]]；节点 $x$ 处接入[[st_i2|向上电流源 $\mathbf{I}_2 = 2\angle 90^\circ\text{ A}$]] 并联[[st_r3|负载电阻 $R_3 = 8\ \Omega$]]。请用交流电源变换法求节点电压相量 $\mathbf{V}_x$（注意保护 $R_3$ 支路不被吞并）。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`对端口外部而言，电压源 $\mathbf{V}_s$ 串联复阻抗 $\mathbf{Z}_s$ 与电流源 $\mathbf{I}_s = \mathbf{V}_s / \mathbf{Z}_s$ 并联复阻抗 $\mathbf{Z}_s$ 完全等效；并联电流源直接做复数叠加，并联阻抗取倒数和之倒数。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · 1. 将左侧电压源 $(\mathbf{V}_s, R_1)$ 变换为电流源并与 $\mathbf{Z}_C$ 合并：`,
          tex: R`\mathbf{I}_{s1} = \frac{\mathbf{V}_s}{R_1}, \qquad \mathbf{Z}_{\text{eq}1} = R_1 \parallel \mathbf{Z}_C = \frac{R_1 \mathbf{Z}_C}{R_1 + \mathbf{Z}_C}`,
        },
        {
          kind: 'formula',
          title: R`2. 将 $(\mathbf{I}_{s1}, \mathbf{Z}_{\text{eq}1})$ 变回电压源，再与 $\mathbf{Z}_{\text{ser}}$ 串联：`,
          tex: R`\mathbf{V}_{\text{eq}1} = \mathbf{I}_{s1}\mathbf{Z}_{\text{eq}1}, \qquad \mathbf{Z}_{\text{left}} = \mathbf{Z}_{\text{eq}1} + \mathbf{Z}_{\text{ser}}`,
        },
        {
          kind: 'formula',
          title: R`3. 将 $(\mathbf{V}_{\text{eq}1}, \mathbf{Z}_{\text{left}})$ 再次变为电流源，与右侧 $(\mathbf{I}_2, R_3)$ 并联求解 $\mathbf{V}_x$：`,
          tex: R`\mathbf{I}_{\text{left}} = \frac{\mathbf{V}_{\text{eq}1}}{\mathbf{Z}_{\text{left}}}, \qquad \mathbf{I}_{\text{tot}} = \mathbf{I}_{\text{left}} + \mathbf{I}_2, \qquad \mathbf{Z}_{\text{tot}} = \mathbf{Z}_{\text{left}} \parallel R_3, \qquad \mathbf{V}_x = \mathbf{I}_{\text{tot}}\mathbf{Z}_{\text{tot}}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`1. [[st_src,st_step|第一次变换（电压源 → 电流源）]]并合并 $\mathbf{Z}_C$：`,
              tex: R`\mathbf{I}_{s1} = \frac{24\angle 0^\circ}{6} = 4\angle 0^\circ\text{ A}`,
            },
            { label: '', tex: R`\mathbf{Z}_{\text{eq}1} = \frac{6 \times (-j6)}{6 - j6} = \frac{-j36}{6(1 - j1)} = \frac{-j6(1 + j1)}{2} = 3 - j3\ \Omega` },
            {
              label: R`2. 第二次变换（电流源 → 电压源）并串联 $\mathbf{Z}_{\text{ser}} = 5 + j3\ \Omega$：`,
              tex: R`\mathbf{V}_{\text{eq}1} = 4 \times (3 - j3) = 12 - j12\text{ V}`,
            },
            { label: '', tex: R`\mathbf{Z}_{\text{left}} = (3 - j3) + (5 + j3) = 8\ \Omega` },
            { label: R`（瞧！虚部 $-j3$ 与 $+j3$ 恰好抵消，左侧等效内阻竟然成了纯实数 $8\ \Omega$！）` },
            { label: '3. 第三次变换并与右侧合并：', tex: R`\mathbf{I}_{\text{left}} = \frac{12 - j12}{8} = 1.5 - j1.5\text{ A}` },
            { label: '', tex: R`\mathbf{I}_{\text{tot}} = (1.5 - j1.5) + j2 = 1.5 + j0.5\text{ A}, \qquad \mathbf{Z}_{\text{tot}} = 8 \parallel 8 = 4\ \Omega` },
            { label: '', tex: R`\mathbf{V}_x = (1.5 + j0.5) \times 4 = 6 + j2\text{ V} \approx 6.32\angle 18.43^\circ\text{ V}` },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '交流戴维南与诺顿等效（独立源情形）——复阻抗黑盒降维（Sadiku §10.6）',
      sync: at(L2, ['vth', 'zth'], eq('thevenin', { [P.load]: false })),
      blocks: [
        { kind: 'p', text: '**3.1 复阻抗戴维南等效的物理深意**' },
        {
          kind: 'formula',
          title: R`在 ${code('W2-L7')} 中，我们把任意含独立源的线性直流二端网络等效为 $V_{Th}$ 串联 $R_{Th}$。到了单一角频率 $\omega$ 的相量域，任意线性二端网络从[[port_ab|端口 $a$-$b$]] 看进去，都可以无损地坍缩为一个**[[vth,zth|戴维南等效电路]]**（$\mathbf{V}_{Th}$ 串联 $\mathbf{Z}_{Th}$）或**[[in_n,zth|诺顿等效电路]]**（$\mathbf{I}_N$ 并联 $\mathbf{Z}_N$）：`,
          tex: R`\mathbf{V}_{Th} = \mathbf{V}_{oc}, \qquad \mathbf{I}_N = \mathbf{I}_{sc} = \frac{\mathbf{V}_{Th}}{\mathbf{Z}_{Th}}, \qquad \mathbf{Z}_{Th} = \mathbf{Z}_N = R_{Th} + jX_{Th}`,
        },
        { kind: 'p', text: R`请特别品味 [[z_tri|$\mathbf{Z}_{Th} = R_{Th} + jX_{Th}$]] 的物理含义：` },
        {
          kind: 'ul',
          items: [
            R`实部 $R_{Th}$ 代表端口内部的等效耗能电阻；`,
            R`虚部 $X_{Th}$ 揭示了端口在当前频率 $\omega$ 下的电抗属性——$X_{Th} > 0$ 呈感性，$X_{Th} < 0$ 呈容性。`,
            R`**重磅剧透（${code('W5-L5')}）**：一旦你把前级庞杂的放大器或输电网络坍缩成了 $(\mathbf{V}_{Th}, \mathbf{Z}_{Th})$，接下来给[[zload|负载 $\mathbf{Z}_L$]] 做**共轭匹配（$\mathbf{Z}_L = \mathbf{Z}_{Th}^*$）以榨干最大平均功率**，瞬间就变成了一行公式的事！`,
          ],
        },
        {
          kind: 'p',
          text: R`当网络**仅含独立源**时，求 $\mathbf{Z}_{Th}$ 最快的方法与直流完全一致：**将所有独立电压源短路、所有独立电流源开路**，直接从端口 $a$-$b$ 向内串并联化简计算输入复阻抗。`,
        },
        { kind: 'p', text: '**3.2 交互原理图：原始交流网络 → 戴维南等效 & 诺顿等效**' },
        { kind: 'figure', svg: SVG_ACT3, caption: '交流戴维南与诺顿等效电路对比图（左侧 02 舞台可挂负载验证端口外特性一致）' },
        { kind: 'p', text: R`**3.3 三段式教授板书推导：例题 3（独立源网络的 $\mathbf{Z}_{Th}$、$\mathbf{V}_{Th}$ 与 $\mathbf{I}_N$）**` },
        {
          kind: 'p',
          text: R`**题目**：求上图左侧交流网络在端口 $a$-$b$ 处的戴维南等效电路（$\mathbf{V}_{Th}, \mathbf{Z}_{Th}$）与诺顿等效电路（$\mathbf{I}_N, \mathbf{Z}_N$）。已知 [[th_vs|$\mathbf{V}_s = 50\angle 0^\circ\text{ V}$]]、[[th_z1|$\mathbf{Z}_1 = 6 - j8\ \Omega$]]、[[th_z2|$\mathbf{Z}_2 = j10\ \Omega$]]、[[th_r2|$R_2 = 4\ \Omega$]]、[[th_is|$\mathbf{I}_s = 2\angle 90^\circ\text{ A}$]]。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`不含受控源的线性交流网络：1. 独立源置零（电压源短路、电流源开路）后，端口 $a$-$b$ 测得的输入阻抗即为 $\mathbf{Z}_{Th} = \mathbf{Z}_N$；2. 端口 $a$-$b$ 开路时，端口电压即为 $\mathbf{V}_{Th} = \mathbf{V}_{oc}$；3. 诺顿短路电流满足 $\mathbf{I}_N = \mathbf{I}_{sc} = \mathbf{V}_{Th} / \mathbf{Z}_{Th}$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · **求 $\mathbf{Z}_{Th}$**：$\mathbf{V}_s$ 短路、$\mathbf{I}_s$ 开路后，$\mathbf{Z}_1$ 与 $\mathbf{Z}_2$ 并联再与 $R_2$ 串联：`,
          tex: R`\mathbf{Z}_{Th} = (\mathbf{Z}_1 \parallel \mathbf{Z}_2) + R_2 = \frac{\mathbf{Z}_1 \mathbf{Z}_2}{\mathbf{Z}_1 + \mathbf{Z}_2} + R_2`,
        },
        {
          kind: 'formula',
          title: R`**求 $\mathbf{V}_{Th}$**：端口 $a$-$b$ 开路时，电流源 $\mathbf{I}_s$ 全部自右向左流过 $R_2$ 进入中间节点 1。对节点 1 列 KCL：`,
          tex: R`\frac{\mathbf{V}_1 - \mathbf{V}_s}{\mathbf{Z}_1} + \frac{\mathbf{V}_1}{\mathbf{Z}_2} = \mathbf{I}_s \implies \mathbf{V}_1 = \frac{\mathbf{V}_s/\mathbf{Z}_1 + \mathbf{I}_s}{1/\mathbf{Z}_1 + 1/\mathbf{Z}_2}`,
        },
        {
          kind: 'formula',
          title: R`再由 KVL 得开路端口电压 $\mathbf{V}_{Th}$ 及诺顿电流 $\mathbf{I}_N$：`,
          tex: R`\mathbf{V}_{Th} = \mathbf{V}_1 + \mathbf{I}_s R_2, \qquad \mathbf{I}_N = \frac{\mathbf{V}_{Th}}{\mathbf{Z}_{Th}}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`1. [[zth|**计算 $\mathbf{Z}_{Th}$**]]：`,
              tex: R`\begin{aligned} \mathbf{Z}_1 \parallel \mathbf{Z}_2 &= \frac{(6 - j8)(j10)}{6 - j8 + j10} = \frac{80 + j60}{6 + j2} \\ &= \frac{(40 + j30)(3 - j1)}{3^2 + 1^2} = \frac{150 + j50}{10} = 15 + j5\ \Omega \end{aligned}`,
            },
            { label: '', tex: R`\mathbf{Z}_{Th} = (15 + j5) + 4 = 19 + j5\ \Omega \approx 19.65\angle 14.74^\circ\ \Omega` },
            {
              label: R`2. [[vth|**计算 $\mathbf{V}_{Th}$**]]：`,
              tex: R`\frac{\mathbf{V}_s}{\mathbf{Z}_1} = \frac{50}{6 - j8} = \frac{50(6 + j8)}{100} = 3 + j4\text{ A}, \qquad \mathbf{I}_s = j2\text{ A}`,
            },
            {
              label: '',
              tex: R`\begin{aligned} \mathbf{V}_1 &= \left(\frac{\mathbf{V}_s}{\mathbf{Z}_1} + \mathbf{I}_s\right)(\mathbf{Z}_1 \parallel \mathbf{Z}_2) = (3 + j6)(15 + j5) \\ &= (45 - 30) + j(15 + 90) = 15 + j105\text{ V} \end{aligned}`,
            },
            { label: '', tex: R`\mathbf{V}_{Th} = \mathbf{V}_1 + \mathbf{I}_s R_2 = (15 + j105) + (j2)(4) = 15 + j113\text{ V} \approx 113.99\angle 82.44^\circ\text{ V}` },
            {
              label: R`3. [[in_n|**计算 $\mathbf{I}_N$（并核验端口短路电流）**]]：`,
              tex: R`\mathbf{I}_N = \frac{\mathbf{V}_{Th}}{\mathbf{Z}_{Th}} = \frac{113.99\angle 82.44^\circ}{19.65\angle 14.74^\circ} \approx 5.80\angle 67.70^\circ\text{ A} \approx 2.20 + j5.37\text{ A}`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: R`含受控源的交流戴维南等效——$1\angle 0^\circ\text{ V}$ 测试源法（Sadiku §10.6 进阶）`,
      sync: at(L2, ['dep_src', 'test_src'], eq('test', { [P.ts]: 'B' })),
      blocks: [
        { kind: 'p', text: R`**4.1 为什么有受控源时不能直接“串并联”求 $\mathbf{Z}_{Th}$？**` },
        {
          kind: 'p',
          text: R`如果网络里藏着一个[[dep_src|受控源]]（比如晶体管或运放的小信号模型 $g_m \mathbf{V}_x$ 或 $\beta \mathbf{I}_x$），**受控源绝对不能置零**！因为受控源代表了电路内部的能量耦合机制，关掉它就等于拆毁了器件本身。`,
        },
        { kind: 'p', text: '此时求 $\\mathbf{Z}_{Th}$ 有两种万无一失的方法：' },
        {
          kind: 'formula',
          title: R`1. **[[test_src,it|外加测试源法]]（首选，永远适用）**：将所有**独立源置零**（保留受控源不动），在端口 $a$-$b$ 外加一个单位测试电压源 $\mathbf{V}_t = 1\angle 0^\circ\text{ V}$（或单位测试电流源 $\mathbf{I}_t = 1\angle 0^\circ\text{ A}$），求出端口流入电流 $\mathbf{I}_t$（或端口电压 $\mathbf{V}_t$），则：`,
          tex: R`\mathbf{Z}_{Th} = \frac{\mathbf{V}_t}{\mathbf{I}_t}`,
        },
        {
          kind: 'p',
          text: R`2. **开路电压/短路电流法**：保留独立源，分别求端口开路电压 $\mathbf{V}_{oc}$ 与端口短路电流 $\mathbf{I}_{sc}$，则 $\mathbf{Z}_{Th} = \mathbf{V}_{oc} / \mathbf{I}_{sc}$。（注意：若电路不含独立源，则 $\mathbf{V}_{oc} = 0, \mathbf{I}_{sc} = 0$，此法出现 $0/0$ 失效，必须用方法 1！）`,
        },
        { kind: 'p', text: R`**4.2 交互原理图：含压控电流源（VCCS）外加 $1\angle 0^\circ\text{ V}$ 测试源**` },
        { kind: 'figure', svg: SVG_ACT4, caption: '含受控源交流戴维南等效与 1 V 测试源法原理图（左侧 02 舞台“测试源”视图可切换 Step A / Step B）' },
        { kind: 'p', text: '**4.3 三段式教授板书推导：例题 4（含受控源的交流戴维南等效）**' },
        {
          kind: 'p',
          text: R`**题目**：如上图所示，含[[dep_src|压控电流源 $g_m \mathbf{V}_x$]]（$g_m = 0.5\text{ S}$）的交流电路中，[[t4_vs|$\mathbf{V}_s = 12\angle 0^\circ\text{ V}$]]、[[t4_r1|$R_1 = 4\ \Omega$]]、[[vx_ctrl|$\mathbf{Z}_C = -j4\ \Omega$]]、[[t4_zl|$\mathbf{Z}_L = j4\ \Omega$]]，[[vx_ctrl|控制电压 $\mathbf{V}_x$]] 为节点 1 对地电压。求端口 $a$-$b$ 处的 $\mathbf{V}_{Th}$ 与 $\mathbf{Z}_{Th}$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`对含受控源的线性交流网络：1. 求 $\mathbf{V}_{Th}$ 时保持端口 $a$-$b$ 开路，同时保留独立源与受控源，列写节点 KCL 方程求解端口电压 $\mathbf{V}_{oc}$；2. 求 $\mathbf{Z}_{Th}$ 时仅将独立源置零（$\mathbf{V}_s = 0$ 短路），**完整保留受控源**，在端口外加测试电压源 $\mathbf{V}_t = 1\angle 0^\circ\text{ V}$，求流入端口的测试电流 $\mathbf{I}_t$，由定义得 $\mathbf{Z}_{Th} = \mathbf{V}_t / \mathbf{I}_t$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · **Step A（开路求 $\mathbf{V}_{Th}$）**：端口开路时，流出节点 $a$ 进入 $\mathbf{Z}_L$ 的电流等于受控源注入电流 $g_m \mathbf{V}_x$：`,
          tex: R`\frac{\mathbf{V}_{Th} - \mathbf{V}_x}{\mathbf{Z}_L} = g_m \mathbf{V}_x \implies \mathbf{V}_{Th} = \mathbf{V}_x (1 + g_m \mathbf{Z}_L)`,
        },
        {
          kind: 'formula',
          title: R`对节点 1（电压即 $\mathbf{V}_x$）列 KCL（注意由 $\mathbf{Z}_L$ 流入节点 1 的电流就是 $g_m \mathbf{V}_x$）：`,
          tex: R`\frac{\mathbf{V}_x - \mathbf{V}_s}{R_1} + \frac{\mathbf{V}_x}{\mathbf{Z}_C} - g_m \mathbf{V}_x = 0 \implies \mathbf{V}_x = \frac{\mathbf{V}_s / R_1}{1/R_1 + 1/\mathbf{Z}_C - g_m}`,
        },
        {
          kind: 'formula',
          title: R`**Step B（外加测试源 $\mathbf{V}_t$ 求 $\mathbf{Z}_{Th}$）**：令 $\mathbf{V}_s = 0$，端口接 $\mathbf{V}_t$。对节点 1 列 KCL：`,
          tex: R`\mathbf{V}_x \left(\frac{1}{R_1} + \frac{1}{\mathbf{Z}_C} + \frac{1}{\mathbf{Z}_L}\right) = \frac{\mathbf{V}_t}{\mathbf{Z}_L}`,
        },
        {
          kind: 'formula',
          title: R`再对端口节点 $a$ 列 KCL 求流入网络的测试电流 $\mathbf{I}_t$：`,
          tex: R`\mathbf{I}_t = \frac{\mathbf{V}_t - \mathbf{V}_x}{\mathbf{Z}_L} - g_m \mathbf{V}_x, \qquad \mathbf{Z}_{Th} = \frac{\mathbf{V}_t}{\mathbf{I}_t}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`1. [[vth|**代入求 $\mathbf{V}_{Th}$**]]（$\mathbf{V}_s = 12\text{ V}, R_1 = 4\ \Omega, \mathbf{Z}_C = -j4\ \Omega, \mathbf{Z}_L = j4\ \Omega, g_m = 0.5\text{ S}$）：`,
              tex: R`\mathbf{V}_x = \frac{12 / 4}{0.25 + j0.25 - 0.5} = \frac{3}{-0.25 + j0.25} = \frac{3(-0.25 - j0.25)}{0.125} = -6 - j6\text{ V}`,
            },
            {
              label: '',
              tex: R`\begin{aligned} \mathbf{V}_{Th} &= (-6 - j6)\bigl(1 + 0.5(j4)\bigr) = (-6 - j6)(1 + j2) \\ &= (-6 + 12) + j(-12 - 6) = 6 - j18\text{ V} \approx 18.97\angle -71.57^\circ\text{ V} \end{aligned}`,
            },
            {
              label: R`2. [[zth|**代入求 $\mathbf{Z}_{Th}$**]]（取 $\mathbf{V}_t = 1\angle 0^\circ\text{ V}$）：`,
              tex: R`\begin{aligned} &\mathbf{V}_x \left(\frac{1}{4} + \frac{1}{-j4} + \frac{1}{j4}\right) = \frac{1}{j4} \\ \implies &\mathbf{V}_x (0.25 + j0.25 - j0.25) = -j0.25 \implies \mathbf{V}_x = -j1\text{ V} \end{aligned}`,
            },
            { label: '（电感与电容在节点 1 的导纳恰好谐振抵消，算术瞬间变清爽！）' },
            { label: '', tex: R`\mathbf{I}_t = \frac{1 - (-j1)}{j4} - 0.5(-j1) = (0.25 - j0.25) + j0.5 = 0.25 + j0.25\text{ A}` },
            { label: '', tex: R`\mathbf{Z}_{Th} = \frac{1}{0.25 + j0.25} = \frac{4}{1 + j1} = 2 - j2\ \Omega \approx 2.83\angle -45.00^\circ\ \Omega` },
            {
              label: R`**物理洞察**：虽然电路中接入了感性元件 $\mathbf{Z}_L = j4\ \Omega$，但在受控源反馈作用下，[[z_tri|端口等效阻抗虚部为 $-j2\ \Omega$，整体呈现**容性**]]！`,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '交流运放电路——当“虚短虚断”遇上复阻抗（强回链 World 3 & 预告 W5-L9）（Sadiku §10.7）',
      sync: at(L3, ['vgnd', 'zf'], { [P.w]: 1000, [P.topo]: 'inv', [P.vs]: true }),
      blocks: [
        { kind: 'p', text: '**5.1 复阻抗让放大器长出了“频率选择性”**' },
        {
          kind: 'p',
          text: R`还记得 ${code('W3-L3/L4')} 里我们刻在骨子里的理想运放两大黄金法则吗？只要运放工作在线性区（存在负反馈），在相量域中这两条法则依然是铁律：`,
        },
        {
          kind: 'ol',
          items: [R`[[vgnd|**虚断（Virtual Open）**]]：$\mathbf{I}_+ = \mathbf{I}_- = 0$`, R`[[vgnd|**虚短（Virtual Short）**]]：$\mathbf{V}_+ = \mathbf{V}_-$`],
        },
        {
          kind: 'formula',
          title: R`把 ${code('World 3')} 里的电阻 $R_1, R_f$ 全部替换为广义复阻抗 $\mathbf{Z}_1, \mathbf{Z}_f$，反相与同相放大器的频域闭环电压增益公式瞬间诞生：`,
          tex: R`\begin{gathered} \text{交流反相放大器：}\quad \mathbf{A}_v(j\omega) = \frac{\mathbf{V}_o}{\mathbf{V}_i} = -\frac{\mathbf{Z}_f}{\mathbf{Z}_1} \\[6pt] \text{交流同相放大器：}\quad \mathbf{A}_v(j\omega) = \frac{\mathbf{V}_o}{\mathbf{V}_i} = 1 + \frac{\mathbf{Z}_f}{\mathbf{Z}_1} \end{gathered}`,
        },
        {
          kind: 'p',
          text: R`**等等，这可不只是换个字母那么简单！**在纯电阻运放里，反相放大器的增益 $-R_f/R_1$ 是一个死板的负实数：幅值恒定，相移永远死锁在 $180^\circ$。但现在，我们在[[op_rf|反馈电阻 $R_f$]] 两端**[[op_cf|并联一颗电容 $C_f$]]**，于是 [[zf|$\mathbf{Z}_f = R_f \parallel \frac{1}{j\omega C_f}$]]：`,
        },
        {
          kind: 'ul',
          items: [
            R`**低频时（$\omega \to 0$）**：$C_f$ 相当于开路，$\mathbf{Z}_f \approx R_f$，放大器老老实实以最大增益 $-R_f/R_1$ 放大小信号；`,
            R`**高频时（$\omega \to \infty$）**：$C_f$ 阻抗趋近于 $0$，把反馈支路直接短路，于是 $\mathbf{Z}_f \to 0 \implies \mathbf{V}_o \to 0$，高频噪声被彻底掐死！`,
          ],
        },
        {
          kind: 'p',
          text: R`**恭喜你！你刚刚在无意间发明了 ${code('W5-L9')} 的核心主角——[[av_curve|一阶有源低通滤波器（Active Low-Pass Filter）]]！**`,
        },
        { kind: 'p', text: R`**5.2 交互原理图：含反馈电容 $C_f \parallel R_f$ 的交流反相运放电路**` },
        { kind: 'figure', svg: SVG_ACT5, caption: '含反馈电容的交流反相运算放大器原理图（左侧 03 舞台可拖动 ω）' },
        { kind: 'p', text: '**5.3 三段式教授板书推导：例题 5（含反馈电容的交流反相运放）**' },
        {
          kind: 'p',
          text: R`**题目**：如上图所示，[[op_amp|理想运放]]构成交流反相电路，[[vin|输入电压 $v_i(t) = 2\cos(1000t)\text{ V}$]]（$\omega = 1000\text{ rad/s}$），[[op_r1|$R_1 = 10\text{ k}\Omega$]]，[[op_rf|$R_f = 50\text{ k}\Omega$]]，[[op_cf|$C_f = 20\text{ nF}$]]。求闭环复增益 $\mathbf{A}_v(j\omega)$ 与稳态输出电压 $v_o(t)$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`工作在线性负反馈区的理想运放满足相量域虚断（$\mathbf{I}_- = \mathbf{I}_+ = 0$）与虚短（$\mathbf{V}_- = \mathbf{V}_+$）。因为同相端接地（$\mathbf{V}_+ = 0$），故反相端构成[[vgnd|虚地 $\mathbf{V}_- = 0$]]。对反相输入节点列 KCL 即得输入电流等于反馈电流。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · 输入阻抗 $\mathbf{Z}_1 = R_1$，反馈复阻抗为电阻 $R_f$ 与电容 $\mathbf{Z}_{C_f} = \frac{1}{j\omega C_f}$ 并联：`,
          tex: R`\mathbf{Z}_f = R_f \parallel \frac{1}{j\omega C_f} = \frac{R_f \cdot \frac{1}{j\omega C_f}}{R_f + \frac{1}{j\omega C_f}} = \frac{R_f}{1 + j\omega R_f C_f}`,
        },
        {
          kind: 'formula',
          title: R`对虚地节点 $\mathbf{V}_- = 0$ 列 KCL：`,
          tex: R`\begin{gathered} \frac{\mathbf{V}_i - 0}{\mathbf{Z}_1} + \frac{\mathbf{V}_o - 0}{\mathbf{Z}_f} = 0 \implies \mathbf{A}_v(j\omega) = \frac{\mathbf{V}_o}{\mathbf{V}_i} = -\frac{\mathbf{Z}_f}{\mathbf{Z}_1} = -\frac{R_f / R_1}{1 + j\omega R_f C_f} \\[6pt] \mathbf{V}_o = \mathbf{A}_v(j\omega)\,\mathbf{V}_i \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`1. **计算无量纲频率因子 $\omega R_f C_f$ 与反馈复阻抗 $\mathbf{Z}_f$**：`,
              tex: R`\omega R_f C_f = (1000\text{ rad/s}) \times (50 \times 10^3\ \Omega) \times (20 \times 10^{-9}\text{ F}) = 1.00`,
            },
            { label: '', tex: R`\mathbf{Z}_{C_f} = \frac{1}{j(1000)(20 \times 10^{-9})} = -j50\text{ k}\Omega` },
            { label: '', tex: R`\mathbf{Z}_f = \frac{50\text{ k}\Omega}{1 + j1} = 25 - j25\text{ k}\Omega \approx 35.36\angle -45^\circ\text{ k}\Omega` },
            {
              label: R`2. [[av|**计算复增益 $\mathbf{A}_v(j1000)$**]]：`,
              tex: R`\mathbf{A}_v = -\frac{50\text{ k}\Omega / 10\text{ k}\Omega}{1 + j1} = -\frac{5}{1 + j1} = -2.5 + j2.5 = \frac{5}{\sqrt{2}}\angle 135^\circ \approx 3.536\angle 135.00^\circ`,
            },
            {
              label: R`（注意：直流增益幅值为 $5$（$13.98\text{ dB}$），而在 $\omega = 1000\text{ rad/s}$ 时幅值恰好跌到 $5/\sqrt{2} \approx 3.536$（$10.97\text{ dB}$），正好下降了 **$-3.01\text{ dB}$**！这就是 ${code('W5-L9')} 里大名鼎鼎的[[wc_badge|**$-3\text{ dB}$ 截止角频率 $\omega_c = \frac{1}{R_f C_f}$**]]！）`,
            },
            {
              label: R`3. [[vout|**计算稳态输出相量 $\mathbf{V}_o$ 并还原回时域**]]：`,
              tex: R`\mathbf{V}_o = \mathbf{A}_v \mathbf{V}_i = (3.536\angle 135^\circ)(2\angle 0^\circ) \approx 7.07\angle 135^\circ\text{ V}`,
            },
            { label: '', tex: R`v_o(t) = 7.07\cos(1000t + 135^\circ)\text{ V}` },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '交流方法论武器库总图景与苏格拉底实战（Boylestad Ch. 18 直觉整合）',
      sync: at(L1, [], { ...sup('guided'), [P.kill]: true }),
      blocks: [
        { kind: 'p', text: '**6.1 什么时候该掏出哪把武器？**' },
        {
          kind: 'p',
          text: R`学完 ${code('W5-L3')} 与 ${code('W5-L4')}，你的交流电路工具箱已经全部配齐。结合 Boylestad 第 18 章的直觉对比，下面这张决策表和决策树帮你在 5 秒内锁定最优解法：`,
        },
        {
          kind: 'table',
          head: ['场景特征', '最佳武器', '关键前提 / 致命禁忌'],
          rows: [
            [R`**同时存在直流源与多个不同频率 $\omega_1, \omega_2$**`, '**交流叠加定理**（唯一解）', '必须按频拆分，**严禁跨频相量直接相加**，全部回时域后再叠加'],
            ['**同频梯形网络，且目标支路位于最末端**', '**交流电源变换**', R`$\mathbf{V}_s = \mathbf{Z}_s \mathbf{I}_s$，切勿吞并目标支路或受控源控制支路`],
            [
              R`**负载 $\mathbf{Z}_L$ 会反复变动，或要找最大功率匹配**`,
              '**交流戴维南 / 诺顿等效**',
              R`含受控源时不可关断受控源，必须外加 $\mathbf{V}_t = 1\angle 0^\circ\text{ V}$ 测试源求 $\mathbf{Z}_{Th}$`,
            ],
            [
              '**含理想运放（负反馈）的多元件交流电路**',
              '**复阻抗虚短虚断 + 节点法**',
              R`先标出 $\mathbf{V}_- = \mathbf{V}_+$ 与 $\mathbf{I}_- = \mathbf{I}_+ = 0$，绝不需对运放输出端列 KCL`,
            ],
            ['**同频多源强耦合一般网络**', `**${code('W5-L3')} 交流节点/网孔法**`, '节点少用节点法，网孔少用网孔法'],
          ],
        },
        { kind: 'figure', svg: SVG_ACT6, caption: '交流电路分析方法论决策树' },
        { kind: 'p', text: R`**6.2 苏格拉底式 5 步分步引导例题（多频率叠加：DC + $\omega_1=2$ + $\omega_2=4$）**` },
        {
          kind: 'guided',
          title: '多频率混合激励电路的叠加求解实战（DC + ω₁=2 + ω₂=4）',
          source: '交流多频率叠加定理（分频拆解与时域合成）',
          problem: R`某线性电路的[[node_vo|输出节点 $v_o(t)$]] 连接四条支路：① [[v0|直流源 $V_0 = 6\text{ V}$]] 串联 [[r1|$R_1 = 2\ \Omega$]] 与 [[ind|$L = 1\text{ H}$]]；② [[v1|交流电压源 $v_1(t) = 10\cos(2t)\text{ V}$]] 串联 [[cap|$C = 0.25\text{ F}$]]；③ [[i2|交流电流源 $i_2(t) = 5\cos(4t)\text{ A}$]] 注入节点 $v_o$；④ [[rl|负载电阻 $R_L = 4\ \Omega$]] 接地。请分 5 步求解稳态输出电压 $v_o(t)$。`,
          problem_svg: SVG_GUIDED,
          steps: [
            {
              title: '第一步：识别频率成分，规避相量域致命陷阱',
              mini_svg: MINI_STEP1,
              question: R`该电路中共有几个不同的激励角频率？我们能否把 $6\text{ V}$、$10\angle 0^\circ\text{ V}$ 和 $5\angle 0^\circ\text{ A}$ 放进同一张相量电路里一次列节点电压方程求解？`,
              hint: R`$\mathbf{Z}_L(\omega) = j\omega L, \quad \mathbf{Z}_C(\omega) = \frac{1}{j\omega C} \implies \omega_0=0,\; \omega_1=2,\; \omega_2=4\text{ 必须分频求解}$`,
              options: [
                {
                  text: R`只有 2 个频率（$\omega_1 = 2$、$\omega_2 = 4\text{ rad/s}$）：直流源没有频率，它的 $6\text{ V}$ 可以直接和两个交流相量写进同一组方程`,
                  correct: false,
                  feedback: R`直流也是一个频率：$\omega_0 = 0$！在它的子宇宙里 $\mathbf{Z}_L(0) = 0$（短路）、$\mathbf{Z}_C(0) = \infty$（开路），和 $\omega_1$、$\omega_2$ 下的阻抗完全不同，同样必须单独拆出来求，最后回时域再相加。`,
                },
                {
                  text: R`共 3 个互异角频率（$\omega_0=0,\ \omega_1=2,\ \omega_2=4\text{ rad/s}$）；电感与电容阻抗随 $\omega$ 变化，绝不能在单一相量域内直接求解或把不同频率相量直接相加，必须拆分为 3 个独立子电路`,
                  correct: true,
                  feedback: R`完全正确！同一个 $L$、同一个 $C$ 在三个频率下是三组不同的阻抗，所以要拆成三个“平行宇宙”各自求解，最后回时域再相加。`,
                },
                {
                  text: R`能：把 $6\text{ V}$、$10\angle 0^\circ\text{ V}$、$5\angle 0^\circ\text{ A}$ 全部代入同一张相量电路，一次列节点电压方程即可`,
                  correct: false,
                  feedback: R`慢着！如果你试图直接写 $(\mathbf{V}_o - 6)/\mathbf{Z}_1 + \cdots$，请问这里的 $\mathbf{Z}_L$ 到底该代 $j2$ 还是 $j4$ 还是 $0$？同一个电感不可能在同一张图里同时拥有三个阻抗！必须先拆成三个“平行宇宙”！`,
                },
              ],
              board: [R`v_o(t) = v_{o0} + v_{o1}(t) + v_{o2}(t)`, R`(\text{禁止 } \mathbf{V}_{o0} + \mathbf{V}_{o1} + \mathbf{V}_{o2}\text{ 相量直加})`],
              halo: ['uni_dc', 'uni_w1', 'uni_w2', 'no_phasor_sum'],
              params: G(0, 'all'),
              layer: L1,
            },
            {
              title: '第二步：求解子电路 0（直流稳态 ω₀ = 0）',
              mini_svg: MINI_STEP2,
              question: R`仅保留直流源 $V_0 = 6\text{ V}$（将 $v_1$ 短路、$i_2$ 开路）。直流稳态下电感 $L$ 与电容 $C$ 分别等效为什么？此时直流输出电压 $v_{o0}$ 是多少？`,
              hint: R`$v_{o0} = V_0 \frac{R_L}{R_1 + R_L}$`,
              options: [
                {
                  text: R`$L$ 短路、$C$ 开路；$v_{o0} = 6 \times \frac{4}{2 + 4} = 4.00\text{ V}$`,
                  correct: true,
                  feedback: R`对！$\omega = 0$ 时 $\mathbf{Z}_L = 0$、$\mathbf{Z}_C = \infty$：电容支路（连同已短路的 $v_1$）整条断开，只剩 $R_1$ 与 $R_L$ 分压。`,
                },
                {
                  text: R`$L$ 开路、$C$ 短路；$v_{o0} = 0\text{ V}$`,
                  correct: false,
                  feedback: R`别把 $C$ 和 $L$ 搞反啦！记住直流 $\omega=0$：$\mathbf{Z}_L = j \cdot 0 \cdot L = 0$（短路），$\mathbf{Z}_C = \frac{1}{j \cdot 0 \cdot C} = \infty$（开路），所以电容支路直接断开，不影响分压！`,
                },
                {
                  text: R`$L$ 短路、$C$ 开路；$v_{o0} = 6\text{ V}$（直流源电压全部落在 $R_L$ 上）`,
                  correct: false,
                  feedback: R`$L$ 短路、$C$ 开路没错，可 $R_1 = 2\ \Omega$ 并没有消失：直流电流依次流过 $R_1$ 与 $R_L$，$v_{o0}$ 是两者的分压 $V_0 \frac{R_L}{R_1 + R_L}$，不是整整 $6\text{ V}$。`,
                },
              ],
              board: [R`v_{o0} = 6 \times \frac{4}{2 + 4} = 4.00\text{ V}`],
              halo: ['ind', 'cap', 'uni_dc'],
              params: G(1, 'dc'),
              layer: L1,
            },
            {
              title: '第三步：求解子电路 1（ω₁ = 2 rad/s）',
              mini_svg: MINI_STEP3,
              question: R`仅保留 $v_1(t) = 10\cos(2t)\text{ V}$（$V_0$ 短路、$i_2$ 开路）。请计算 $\omega_1 = 2\text{ rad/s}$ 时的 $\mathbf{Z}_{L1}$、$\mathbf{Z}_{C1}$，并求出相量 $\mathbf{V}_{o1}$。`,
              hint: R`$\mathbf{Z}_{\parallel 1} = (2+j2)\parallel 4 = 1.6 + j0.8\ \Omega, \quad \mathbf{V}_{o1} = 10\angle 0^\circ \cdot \frac{\mathbf{Z}_{\parallel 1}}{-j2 + \mathbf{Z}_{\parallel 1}}$`,
              options: [
                {
                  text: R`$\mathbf{Z}_{L1} = j2\ \Omega$，$\mathbf{Z}_{C1} = -j0.5\ \Omega$（$-j\omega C$）`,
                  correct: false,
                  feedback: R`电容阻抗是 $\frac{1}{j\omega C}$，不是 $-j\omega C$：$\omega_1 C = 2 \times 0.25 = 0.5$，要取倒数，$|\mathbf{Z}_{C1}| = \frac{1}{0.5} = 2\ \Omega$。`,
                },
                {
                  text: R`$\mathbf{Z}_{L1} = j2\ \Omega$，$\mathbf{Z}_{C1} = -j2\ \Omega$；但分母只取 $\mathbf{Z}_{\parallel 1}$，所以 $\mathbf{V}_{o1} = 10\angle 0^\circ\text{ V}$`,
                  correct: false,
                  feedback: R`注意 $V_0$ 短路后，$2\ \Omega$ 与 $j2\ \Omega$ 是串联后再与 $4\ \Omega$ 并联，最后整体跟 $-j2\ \Omega$ 串联分压！别忘了把 $1.6 + j0.8$ 加上 $-j2$ 得到分母 $1.6 - j1.2$。`,
                },
                {
                  text: R`$\mathbf{Z}_{L1} = j2\ \Omega$，$\mathbf{Z}_{C1} = -j2\ \Omega$；右侧并联 $(2+j2)\parallel 4 = 1.6 + j0.8\ \Omega$；分压得 $\mathbf{V}_{o1} = 4 + j8\text{ V} \approx 8.94\angle 63.43^\circ\text{ V}$`,
                  correct: true,
                  feedback: R`漂亮！$\mathbf{Z}_{C1}$ 与 $\mathbf{Z}_{\parallel 1}$ 串联分压，分母 $1.6 - j1.2$ 的虚部为负，所以 $\mathbf{V}_{o1}$ 反而超前了 $63.43^\circ$，幅值还比源电压略小。`,
                },
              ],
              board: [R`\mathbf{V}_{o1} = 10 \cdot \frac{1.6 + j0.8}{1.6 - j1.2} = 4 + j8\text{ V}`, R`\approx 8.94\angle 63.43^\circ\text{ V}`],
              halo: ['ind', 'cap', 'uni_w1'],
              params: G(2, 'w1'),
              layer: L1,
            },
            {
              title: '第四步：求解子电路 2（ω₂ = 4 rad/s）',
              mini_svg: MINI_STEP4,
              question: R`仅保留电流源 $i_2(t) = 5\cos(4t)\text{ A}$（$V_0$ 与 $v_1$ 均短路）。此时 $\omega_2 = 4\text{ rad/s}$，阻抗必须重新计算！请算出 $\mathbf{Z}_{L2}$、$\mathbf{Z}_{C2}$ 及节点相量 $\mathbf{V}_{o2}$。`,
              hint: R`$\mathbf{Y}_{\text{tot},2} = \frac{1}{2+j4} + \frac{1}{-j1} + \frac{1}{4} = (0.1 - j0.2) + j1 + 0.25 = 0.35 + j0.80\text{ S}$`,
              options: [
                {
                  text: R`$\mathbf{Z}_{L2} = j4\ \Omega$，$\mathbf{Z}_{C2} = -j1\ \Omega$；三支路并联总导纳 $\mathbf{Y}_{\text{tot},2} = 0.35 + j0.80\text{ S} \approx 0.8732\angle 66.37^\circ\text{ S}$；$\mathbf{V}_{o2} = 5 / \mathbf{Y}_{\text{tot},2} \approx 5.73\angle -66.37^\circ\text{ V}$`,
                  correct: true,
                  feedback: R`对！频率翻倍，$\mathbf{Z}_L$ 翻倍、$\mathbf{Z}_C$ 减半；三条支路并联，电容那条导纳 $j1\text{ S}$ 最大，节点电压因此滞后电流源 $66.37^\circ$。`,
                },
                {
                  text: R`$\mathbf{Z}_{L2} = j4\ \Omega$；$v_1$ 已短路，电容支路不起作用：$\mathbf{V}_{o2} = 5 \Big/ \left(\frac{1}{2+j4} + \frac{1}{4}\right) \approx 12.40\angle 29.74^\circ\text{ V}$`,
                  correct: false,
                  feedback: R`$v_1$ 短路只是把电压源换成一根导线，电容 $C$ 仍然从节点 $v_o$ 接到地：它是第三条并联支路，导纳 $\frac{1}{-j1} = j1\text{ S}$ 一点也不能少——在 $\omega_2$ 下它正是最“通”的一条。`,
                },
                {
                  text: R`沿用上一步：$\mathbf{Z}_{L2} = j2\ \Omega$，$\mathbf{Z}_{C2} = -j2\ \Omega$；$\mathbf{V}_{o2} \approx 8.94\angle -26.57^\circ\text{ V}$`,
                  correct: false,
                  feedback: R`高频翻倍了！很多同学忘了重新算电感和电容阻抗，顺手抄了上一步的 $j2$ 和 $-j2$——在 $\omega_2 = 4\text{ rad/s}$ 下，$\mathbf{Z}_{L2}$ 变成 $j4\ \Omega$，$\mathbf{Z}_{C2}$ 缩水成 $-j1\ \Omega$！`,
                },
              ],
              board: [R`\mathbf{V}_{o2} = \frac{5\angle 0^\circ}{0.35 + j0.80} = \frac{5\angle 0^\circ}{0.8732\angle 66.37^\circ}`, R`\approx 5.73\angle -66.37^\circ\text{ V}`],
              halo: ['ind', 'cap', 'i2', 'uni_w2'],
              params: G(3, 'w2'),
              layer: L1,
            },
            {
              title: R`第五步：各自还原回时域并最终合成 $v_o(t)$`,
              mini_svg: MINI_STEP5,
              question: R`把三个子宇宙的结果全部转换回时域函数并写出最终答案 $v_o(t)$。`,
              hint: R`$v_o(t) = v_{o0} + |\mathbf{V}_{o1}|\cos(\omega_1 t + \angle\mathbf{V}_{o1}) + |\mathbf{V}_{o2}|\cos(\omega_2 t + \angle\mathbf{V}_{o2})$`,
              options: [
                {
                  text: R`$v_o(t) = 4 + 8.94\angle 63.43^\circ + 5.73\angle -66.37^\circ\text{ V}$`,
                  correct: false,
                  feedback: R`最后一步绝不能手滑写成 $4 + 8.94\angle 63.43^\circ + 5.73\angle -66.37^\circ$！必须分别带上各自的角频率 $2t$ 和 $4t$ 写回余弦函数！`,
                },
                {
                  text: R`先把相量相加：$\mathbf{V}_{o1} + \mathbf{V}_{o2} \approx (4 + j8) + (2.30 - j5.25) \approx 6.87\angle 23.63^\circ\text{ V}$，再写成 $v_o(t) = 4 + 6.87\cos(2t + 23.63^\circ)\text{ V}$`,
                  correct: false,
                  feedback: R`两个相量转速不同（$2$ 与 $4\text{ rad/s}$），夹角时时在变，加在一起不对应任何一个时间函数——更不能随手挑一个频率 $2t$ 去还原！各自回时域，再代数相加。`,
                },
                {
                  text: R`$v_o(t) = 4 + 8.94\cos(2t + 63.43^\circ) + 5.73\cos(4t - 66.37^\circ)\text{ V}$`,
                  correct: true,
                  feedback: R`通关！每个分量带着自己的 $\omega t$ 回到时域：$\operatorname{Re}\{\mathbf{V}_{o1} e^{j2t}\}$ 与 $\operatorname{Re}\{\mathbf{V}_{o2} e^{j4t}\}$，再与直流 $4\text{ V}$ 逐点相加。`,
                },
              ],
              board: [R`v_o(t) = 4 + 8.94\cos(2t + 63.43^\circ)`, R`\qquad + 5.73\cos(4t - 66.37^\circ)\text{ V}`],
              halo: ['wave_total', 'ph_w1', 'ph_w2', 'no_phasor_sum'],
              params: G(4, 'all'),
              layer: L1,
            },
          ],
          done_params: { [P.g]: 5 },
          conclusion: R`通关！$v_o(t) = 4 + 8.94\cos(2t + 63.43^\circ) + 5.73\cos(4t - 66.37^\circ)\text{ V}$。左侧 01 舞台已揭晓引导例题的全部数值：点“播放”看两个相量以 $2$ 与 $4\text{ rad/s}$ 各转各的，它们在实轴上的投影（时域值）与直流 $4\text{ V}$ 逐点相加，才是那条非正弦的 $v_o(t)$。`,
        },
        { kind: 'p', text: '**6.3 诊断测验（4 题全覆盖）**' },
      ],
      quiz: [
        {
          id: 'w5l4_q1',
          question: R`某线性交流电路由两个不同频率的独立源激励，分别单独作用时求得输出相量 $\mathbf{V}_1 = 10\angle 0^\circ\text{ V}$（$\omega_1 = 2\text{ rad/s}$）与 $\mathbf{V}_2 = 10\angle 90^\circ\text{ V}$（$\omega_2 = 5\text{ rad/s}$）。则总稳态输出电压 $v(t)$ 应如何表达？`,
          options: [
            {
              key: 'A',
              text: R`先将相量相加得 $\mathbf{V} = 14.14\angle 45^\circ\text{ V}$，再任选一个频率还原回时域`,
              correct: false,
              feedback: R`$\mathbf{V}_1$ 以 $2\text{ rad/s}$ 旋转、$\mathbf{V}_2$ 以 $5\text{ rad/s}$ 旋转，两者夹角时时在变：$14.14\angle 45^\circ$ 只是 $t = 0$ 那一瞬两支箭头的合成，下一瞬就不对了，也没有哪一个频率能把它还原成真实的波形。`,
            },
            { key: 'B', text: R`分别还原回时域后再相加：$v(t) = 10\cos(2t) + 10\cos(5t + 90^\circ)\text{ V}$`, correct: true },
            {
              key: 'C',
              text: R`相量幅值直接相加得 $20\cos(7t + 90^\circ)\text{ V}$`,
              correct: false,
              feedback: R`幅值不能直接相加（只有同频同相才行），频率更不能相加：$2 + 5 = 7\text{ rad/s}$ 的余弦在这个电路里根本不存在。`,
            },
            {
              key: 'D',
              text: '不同频率的交流电路不满足线性叠加定理，必须用数值微分方程求解',
              correct: false,
              feedback: '叠加定理只要求电路线性，与激励频率是否相同无关；恰恰是多频率激励时它最有用：按频拆分、各自求相量、回时域再相加，完全不用解微分方程。',
            },
          ],
          feedback_correct: R`不同频率的相量对应不同角速度的旋转向量，绝不能直接做复数相加！必须各自转换回时域后再做代数相加：$v(t) = v_1(t) + v_2(t)$。`,
          feedback_wrong: '回到第 1 幕：两个转速不同的指针，能不能在同一张相量图里相加？',
          figure: SVG_Q1,
          sync: at(L1, ['ph_w1', 'ph_w2', 'no_phasor_sum'], sup('ex1')),
        },
        {
          id: 'w5l4_q2',
          question: R`将电压源 $\mathbf{V}_s = 12\angle 30^\circ\text{ V}$ 与串联复阻抗 $\mathbf{Z}_s = 3 + j4\ \Omega$ 等效变换为实际电流源，其等效电流源相量 $\mathbf{I}_s$ 与并联阻抗 $\mathbf{Z}_p$ 分别为：`,
          options: [
            { key: 'A', text: R`$\mathbf{I}_s = 2.4\angle -23.13^\circ\text{ A},\quad \mathbf{Z}_p = 3 + j4\ \Omega$`, correct: true },
            {
              key: 'B',
              text: R`$\mathbf{I}_s = 2.4\angle 83.13^\circ\text{ A},\quad \mathbf{Z}_p = 3 - j4\ \Omega$`,
              correct: false,
              feedback: R`幅值 $12/5 = 2.4$ 对了，可相量相除时角度相减：$30^\circ - 53.13^\circ = -23.13^\circ$，不是相加；而且并联阻抗就是原来的 $\mathbf{Z}_s$，不取共轭。`,
            },
            {
              key: 'C',
              text: R`$\mathbf{I}_s = 60\angle 83.13^\circ\text{ A},\quad \mathbf{Z}_p = 3 + j4\ \Omega$`,
              correct: false,
              feedback: R`$60\angle 83.13^\circ$ 是 $\mathbf{V}_s \times \mathbf{Z}_s$：电源变换是 $\mathbf{I}_s = \mathbf{V}_s / \mathbf{Z}_s$，要做除法。`,
            },
            {
              key: 'D',
              text: R`$\mathbf{I}_s = 2.4\angle -23.13^\circ\text{ A},\quad \mathbf{Z}_p = 3 - j4\ \Omega$`,
              correct: false,
              feedback: R`$\mathbf{I}_s$ 算对了，但变换前后内阻抗保持不变：$\mathbf{Z}_p = \mathbf{Z}_s = 3 + j4\ \Omega$。共轭 $3 - j4$ 是 ${code('W5-L5')} 最大功率匹配时挑负载的办法，不是电源变换。`,
            },
          ],
          feedback_correct: R`$\mathbf{Z}_s = 3 + j4 = 5\angle 53.13^\circ\ \Omega$。由交流电源变换公式 $\mathbf{I}_s = \mathbf{V}_s / \mathbf{Z}_s = (12\angle 30^\circ)/(5\angle 53.13^\circ) = 2.4\angle -23.13^\circ\text{ A}$，且并联阻抗保持不变 $\mathbf{Z}_p = \mathbf{Z}_s = 3 + j4\ \Omega$。`,
          feedback_wrong: R`回到第 2 幕：$\mathbf{V}_s = \mathbf{Z}_s \mathbf{I}_s$，而 $\mathbf{Z}_s$ 本身保持不变。`,
          figure: SVG_Q2,
          sync: at(L2, ['st_src', 'st_step'], eq('source', { [P.st]: 1 })),
        },
        {
          id: 'w5l4_q3',
          question: R`对某含受控源的交流二端网络，将其所有独立源置零并保留受控源后，在端口 $a$-$b$ 外加测试电压源 $\mathbf{V}_t = 1\angle 0^\circ\text{ V}$，测得流入端口的电流为 $\mathbf{I}_t = 0.1 - j0.1\text{ A}$。则该端口的戴维南等效阻抗 $\mathbf{Z}_{Th}$ 为：`,
          options: [
            {
              key: 'A',
              text: R`$5 - j5\ \Omega$（容性）`,
              correct: false,
              feedback: R`取倒数时分母要乘共轭：$\frac{1}{0.1 - j0.1} = \frac{0.1 + j0.1}{0.1^2 + 0.1^2}$，虚部变成正的。电流 $\mathbf{I}_t$ 滞后于 $\mathbf{V}_t$，端口应呈感性。`,
            },
            {
              key: 'B',
              text: R`$0.1 - j0.1\ \Omega$（容性）`,
              correct: false,
              feedback: R`这是测得的电流本身（也就是导纳 $\mathbf{Y} = \mathbf{I}_t / \mathbf{V}_t$），阻抗要反过来：$\mathbf{Z}_{Th} = \mathbf{V}_t / \mathbf{I}_t$。`,
            },
            { key: 'C', text: R`$5 + j5\ \Omega$（感性）`, correct: true },
            {
              key: 'D',
              text: R`$10 + j10\ \Omega$（感性）`,
              correct: false,
              feedback: R`分母 $|\mathbf{I}_t|^2 = 0.1^2 + 0.1^2 = 0.02$，不是 $0.01$：$\frac{0.1 + j0.1}{0.02} = 5 + j5\ \Omega$。`,
            },
          ],
          feedback_correct: R`由测试源定义 $\mathbf{Z}_{Th} = \mathbf{V}_t / \mathbf{I}_t = \frac{1}{0.1 - j0.1} = \frac{0.1 + j0.1}{0.01 + 0.01} = 5 + j5\ \Omega$，虚部为正，呈感性。`,
          feedback_wrong: R`回到第 4 幕：测试源法的定义是 $\mathbf{Z}_{Th} = \mathbf{V}_t / \mathbf{I}_t$，复数取倒数要乘共轭。`,
          figure: SVG_Q3,
          sync: at(L2, ['test_src', 'it'], eq('test', { [P.ts]: 'B' })),
        },
        {
          id: 'w5l4_q4',
          question: R`一理想反相交流运放电路中，输入电阻 $R_1 = 2\text{ k}\Omega$，反馈支路为 $R_f = 10\text{ k}\Omega$ 与 $C_f = 0.1\ \mu\text{F}$ 并联。当输入信号角频率 $\omega = 1000\text{ rad/s}$ 时，闭环复电压增益 $\mathbf{A}_v = \mathbf{V}_o / \mathbf{V}_i$ 为：`,
          options: [
            {
              key: 'A',
              text: R`$-5.00\angle 0^\circ$（与频率无关）`,
              correct: false,
              feedback: R`那是去掉 $C_f$ 的纯电阻反相放大器。并上 $C_f$ 后 $\mathbf{Z}_f = \frac{R_f}{1 + j\omega R_f C_f}$ 随频率变化，此时 $\omega R_f C_f = 1$，幅值已从 $5$ 跌到 $5/\sqrt{2}$。`,
            },
            {
              key: 'B',
              text: R`$-2.5 - j2.5 = 3.54\angle -135^\circ$`,
              correct: false,
              feedback: R`有理化时虚部的符号反了：$-\frac{5}{1 + j1} = -\frac{5(1 - j1)}{2} = -2.5 + j2.5$。$-2.5 - j2.5$ 相当于把分母写成了 $1 - j1$。`,
            },
            {
              key: 'C',
              text: R`$2.5 - j2.5 = 3.54\angle -45^\circ$`,
              correct: false,
              feedback: R`漏了反相放大器的负号：$\mathbf{A}_v = -\mathbf{Z}_f / \mathbf{Z}_1$。$2.5 - j2.5$ 是 $+\frac{5}{1 + j1}$，相位差了 $180^\circ$。`,
            },
            { key: 'D', text: R`$-2.5 + j2.5 = 3.54\angle 135^\circ$`, correct: true },
          ],
          feedback_correct: R`$\omega R_f C_f = 1000 \times 10^4 \times 10^{-7} = 1$，故 $\mathbf{A}_v = -\frac{R_f/R_1}{1 + j\omega R_f C_f} = -\frac{5}{1 + j1} = -2.5 + j2.5 \approx 3.54\angle 135^\circ$。`,
          feedback_wrong: R`回到第 5 幕：先算无量纲因子 $\omega R_f C_f$，再代入 $\mathbf{A}_v = -\frac{R_f/R_1}{1 + j\omega R_f C_f}$，别丢负号。`,
          figure: SVG_Q4,
          sync: at(L3, ['zf', 'av'], { [P.w]: 100, [P.topo]: 'inv' }),
        },
      ],
    },
  ],
};

export default W5_L4;
