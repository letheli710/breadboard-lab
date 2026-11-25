// W4-L5 · 一阶 RC/RL 阶跃响应与三要素通解（含示波器共地防短路警示与面包板实操） (lesson sheet:
// docs/lessons/W4-L5.md). The professor's text of the six acts is reproduced from the sheet as
// written; [[id|…]] only links a term to the stage (the words are unchanged). Changes of form:
// - the sheet's sub-headings (1.1 教授板书 …) are bold lines; display formulas sit in the ①/②/③
//   cards (a lead-in sentence becomes the card title, a formula right after a ① text gets a short
//   label); the sheet's block quotes are notes; its tables are table blocks;
// - plain-text symbols of the JSON parts (vC(t), i3(0+) …) are set as TeX;
// - anti-spoiler: act 3's worked example (Sadiku 7.5) is the guided example of act 6. Act 3 keeps
//   the circuit, ① and ②; its ③ calculation moves behind the guided block as the 「通关复盘」
//   board, together with the full figure 3.2 (act 3 shows it with "?" for every answer) and the
//   1000× scaling paragraph of 5.1 (its τ = 4 kΩ × 250 µF = 1.0 s and 4 mA are answers of the
//   example). The stage hides the example's numbers (param `ex75` = how far the guided example
//   has got; `done_params` uncovers them); step 5's mini diagram reads "= ?";
// - the guided JSON has no options: each step gets three — the right one (from expected_answer),
//   the mistake its professor_intercept corrects (the intercept as feedback), and one more
//   plausible mistake; step 5's "intercept" is praise ("太漂亮了！…"): the praise opens the right
//   option's feedback, the rest of it is the feedback of the different-τ mistake;
// - every lab supply is named with its voltage (台式可调直流电源（5 V）); emoji are left out of
//   the 5.2 figure and the warning heading;
// - dev-facing text is left out: the YAML keys, "Claude 工程落地清单" (its stage spec is what the
//   three layers build), the JSON tags.
// Fixed: 3.1 says i_3 flows "从 V_2 正极向右流出" — V_2 is on the right and the sheet's figure and
// guided JSON have i_3 flowing left, from V_2's + terminal towards node B: "向左".
// Added: the safety capsule at the top of act 1 (from breadboard_safety_and_scaling), a number
// check after the scope-ground warning, the 3D board's wiring table, the guided example's praise
// lines and conclusion, the quiz figures, per-option feedback and a mixed answer order (the
// sheet's right answers are B, C, C, B).

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import type { StageLesson } from '../../types';
import { SUPPLY_5, SUPPLY_75 } from './model';
import {
  MINI_STEP1,
  MINI_STEP2,
  MINI_STEP3,
  MINI_STEP4,
  MINI_STEP5,
  SVG_FIG1,
  SVG_FIG2,
  SVG_FIG3,
  SVG_FIG3_MASKED,
  SVG_FIG4,
  SVG_FIG5,
  SVG_FIG6,
  SVG_PROBLEM,
  SVG_Q1,
  SVG_Q2,
  SVG_Q3,
  SVG_Q4,
} from './svgs';

const Schematic = lazy(() => import('./Schematic'));
const Curves = lazy(() => import('./Curves'));
const Bench3D = lazy(() => import('./Bench3D'));

const R = String.raw;
/** inline code inside String.raw text */
const code = (s: string) => '`' + s + '`';

const L1 = 'layer_01';
const L2 = 'layer_02';
const L3 = 'layer_03';

const W4_L5: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Schematic, [L2]: Curves, [L3]: Bench3D },
  describeTarget: genericLabel,
  lesson_meta: {
    lesson_id: 'W4-L5',
    world: 'World 4',
    title: '一阶 RC/RL 阶跃响应与三要素通解（含示波器共地防短路警示与面包板实操）',
    subtitle: 'First-Order RC/RL Step Response, Three-Element Formula, Oscilloscope Ground Safety & Breadboard Lab',
    lesson_type: 'C',
    lesson_type_label: 'Type C（经典拓扑 + 示波器与 3D 面包板实测课）',
    estimated_minutes: 55,
    textbook_primary: {
      book: 'Alexander, Sadiku & Fredette, Fundamentals of Electric Circuits, 2026 Release',
      sections: ['Section 7.4–7.6（Singularity Functions, Step Response of RC & RL Circuits）'],
    },
    textbook_supplement: 'Boylestad, Introductory Circuit Analysis, 14th Ed. — Ch. 10（RC 充电曲线 1 − e^(−t/τ)，1τ 时 63.2%，5τ 充满）',
    prerequisites: ['W2-L7 戴维南等效（Thevenin’s Theorem）', 'W4-L4 一阶自然响应（Source-Free First-Order Circuits）'],
    next_lesson: 'W4-L6',
    next_lesson_title: '二阶电路初值与终值确定（t=0⁻, 0⁺, ∞ 三时刻等效替换法）',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 2D 三要素求解原理图 (0- / 0+ / ∞ 三态切换)',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '01 三要素求解原理图：阶跃充电、Sadiku 7.5（RC 单刀双掷）、Sadiku 7.6（RL）三套电路，一键切换 t = 0⁻ / 0⁺ / ∞ 三张快照——直流稳态 C 开路、L 短路，0⁺ 瞬间 C 换恒压源、L 换恒流源；可高亮储能元件等效、戴维南端口与非状态变量突变。',
      },
      {
        id: L2,
        label: '02 实时示波器充电曲线 (63.2% at 1τ + 暂态/稳态分量拆解)',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 实时充电曲线：V_s = 5 V，拖动 R（1–50 kΩ）与 C（10–470 µF）实时重算 τ = RC 与时基；可单独开关完全响应、稳态分量 V_s 与暂态分量 −V_s e^(−t/τ)，游标卡在 1τ … 5τ 读电压、百分比与电流。',
      },
      {
        id: L3,
        label: '03 3D 面包板 RC 充放电 + 示波器探头共地接线实操',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption: `03 3D 面包板：${SUPPLY_5}经导线接红轨 / 蓝轨，拨动开关充电 / 放电，或改用函数信号发生器的 0–5 V 方波；双通道示波器 CH1 / CH2 探头与黑色地线夹可放在正确的 GND 轨或错误的节点 B（短路警示）；右上角是示波器屏幕。另有 Sadiku 7.5 的 1000× 缩放套件（${SUPPLY_75}，引导例题完成后解锁读数）。`,
      },
    ],
    hover_map: {
      // act 1–2: the step source and the RC kit
      vs: { label: '阶跃激励 V_s u(t)', desc: '在 t = 0 接入的直流电压源：t < 0 为 0，t > 0 为 V_s；本课实测 V_s = 5 V' },
      sw: { label: '开关 S（t = 0 闭合）', desc: '真实开关动作 ≡ 阶跃源 V_s u(t)：换路前瞬间记为 0⁻，换路后瞬间记为 0⁺' },
      r: { label: '串联电阻 R', desc: '本课实测 10 kΩ（棕-黑-橙-金），与 C 决定 τ = RC；充电峰值电流 V_s/R = 0.5 mA' },
      cap: { label: '储能电容 C', desc: '本课实测 100 µF 电解电容；直流稳态等效开路，0⁺ 瞬间等效为数值 v_C(0⁺) 的恒压源' },
      vc: { label: '电容电压 v_C(t)', desc: '状态变量，受储能 W_C = ½Cv_C² 保护不能突变：v_C(0⁺) = v_C(0⁻)；零状态充电 v_C = V_s(1 − e^(−t/τ))' },
      ic: { label: '充电电流 i_C(t)', desc: '非状态变量：i_C = C dv_C/dt = (V_s/R) e^(−t/τ)，0⁺ 瞬间从 0 跳到峰值 V_s/R' },
      tau: { label: '时间常数 τ', desc: 'RC 电路 τ = R_th C，RL 电路 τ = L/R_th；每过 1τ 剩余差距缩为 e⁻¹ ≈ 36.8%' },
      vf: { label: '强迫 / 稳态分量 v_f', desc: 'v_f = V_s：由外部直流源决定、t → ∞ 时留下的部分' },
      vn: { label: '自然 / 暂态分量 v_n', desc: 'v_n = (V_0 − V_s) e^(−t/τ)：由电路自身决定、按 τ 指数衰减到 0 的部分' },
      m63: { label: '1τ 黄金标定点', desc: 't = τ 时零状态充电达到 1 − e⁻¹ = 63.21%（5 V 时 3.161 V）：示波器游标实测 τ 的标定点' },
      m5tau: { label: '5τ 充满点', desc: 't = 5τ 时达到 99.33%（4.966 V）：工程上视为进入新稳态' },
      tangent: { label: '初始斜率切线', desc: '从 (0, 0) 以初始斜率 V_s/τ 出发的切线，恰在 t = τ 处与 V_s 相交' },
      // act 3: Sadiku 7.5 (the guided example — no answers here)
      v1: { label: '电压源 V₁ = 18 V', desc: 'Sadiku 7.5 左侧（A 侧）电源，串 R₁、并 R₂ 接向开关 A 端' },
      r1: { label: '电阻 R₁ = 3 Ω', desc: 'A 侧串联电阻（面包板 1000× 缩放为 3 kΩ，橙-黑-红-金）' },
      r2: { label: '电阻 R₂ = 6 Ω', desc: 'A 侧并联电阻（面包板缩放为 6 kΩ，蓝-黑-红-金）' },
      sw75: { label: '单刀双掷开关 S', desc: '长期停在 A，t = 0 瞬间切到 B；刀片一端接电容正极' },
      c75: { label: '电容 C = 0.25 F', desc: '状态变量 v_C 连续；面包板缩放为 250 µF（÷1000），τ 保持不变' },
      r3: { label: '电阻 R₃ = 6 Ω', desc: 'B 侧串联电阻，连接 V₂ 与节点 B（面包板缩放为 6 kΩ）' },
      r4: { label: '电阻 R₄ = 12 Ω', desc: 'B 侧节点 B 到地的电阻（面包板缩放为 12 kΩ，棕-红-橙-金）' },
      v2: { label: '电压源 V₂ = 36 V', desc: 'Sadiku 7.5 右侧（B 侧）电源' },
      i3: { label: '电阻电流 i₃(t)', desc: '流过 R₃、由 V₂ 正极流向节点 B 的电流：非状态变量，0⁺ 必须现算' },
      ic75: { label: '电容电流 i_C(t)', desc: '非状态变量：i_C = C dv_C/dt = i₃ − v_C/R₄，0⁻ 时为 0' },
      thev: { label: '戴维南端口（从储能元件看进去）', desc: 't > 0 时独立源置零求 R_th，开路电压即 V_th = x(∞)；τ = R_th C 或 L/R_th' },
      equiv: { label: '储能元件等效替换', desc: '0⁻ 与 ∞：C 开路、L 短路；0⁺：C 换成数值 v_C(0⁺) 的恒压源，L 换成数值 i_L(0⁺) 的恒流源' },
      jump: { label: '非状态变量 0⁺ 突变', desc: 'i_R、i_C、v_L 等没有能量连续性保护：绝不能拿 x(0⁻) 当 x(0⁺)，必须在 0⁺ 等效电路里现算' },
      // act 4: Sadiku 7.6
      vs76: { label: '电压源 V_s = 24 V', desc: 'Sadiku 7.6 的直流电源，依次串联 R₁、R₂' },
      r1_76: { label: '电阻 R₁ = 4 Ω', desc: '与电源串联的第一颗电阻' },
      r2_76: { label: '电阻 R₂ = 4 Ω', desc: 't < 0 被开关 S 短接，t = 0 后串入电路' },
      s76: { label: '开关 S（跨接 R₂）', desc: 't < 0 长期闭合（短接 R₂），t = 0 瞬间断开' },
      r3_76: { label: '电阻 R₃ = 8 Ω', desc: '与电感并联；t < 0 被电感短接，0⁺ 时电流从地经 R₃ 倒灌' },
      l76: { label: '电感 L = 2 H', desc: '状态变量 i_L 连续（磁链守恒）；直流稳态等效短路，0⁺ 瞬间等效为恒流源 i_L(0⁺)' },
      il: { label: '电感电流 i_L(t)', desc: '状态变量：i_L(0⁺) = i_L(0⁻) = 6 A，i_L(t) = 3 + 3e^(−2t) A' },
      vl: { label: '电感电压 v_L(t)', desc: '非状态变量：v_L = L di_L/dt，0⁻ 时为 0，0⁺ 瞬间突变（感性反电动势）' },
      ir3: { label: '支路电流 i_R3(t)', desc: 'R₃ 支路电流（向下为正）：i_R3 = v_L/R₃' },
      // act 5: the 3D bench
      psu: { label: SUPPLY_5, desc: '基础 RC 套件的电源：+ 接顶部红轨（+5 V），COM 接蓝轨 GND；负极与示波器、发生器的地同接市电保护地 PE' },
      psu75: { label: SUPPLY_75, desc: 'Sadiku 7.5 缩放套件的电源：CH1 18 V 接 V₁ 端、CH2 36 V 接 V₂ 端，COM 接底部 GND 轨' },
      fg: { label: '函数信号发生器', desc: '独立仪器：输出 0–5 V、0.1 Hz 方波（高 5 s、低 5 s，各 5τ），OUT 接节点 A，COM 接 GND；它的 BNC 地同样接 PE' },
      scope: { label: '双通道示波器', desc: 'CH1 / CH2 两个通道 + MATH 数学通道；所有 BNC 外壳与探头黑夹在内部直通市电保护地 PE' },
      ch1: { label: 'CH1 探头（黄色）', desc: '红钩接测量点（本套件：节点 A，电源端），黑色鳄鱼夹必须接 GND 轨' },
      ch2: { label: 'CH2 探头（青色）', desc: '红钩接节点 B（电容正极），测接地电容电压 v_C(t)；黑夹同样接 GND 轨' },
      math: { label: 'MATH：CH1 − CH2', desc: '示波器数学通道：v_R = v_A − v_C，安全测得悬浮电阻电压，无需把黑夹接到悬浮节点' },
      gnd_clip: { label: '黑色鳄鱼夹（地线夹）', desc: '与 BNC 外壳、市电 PE 低阻相连：只能夹在 GND 参考地，夹在任何其他节点都会经 PE 把该节点短到电源负极' },
      gnd_loop: { label: 'GND 接地测试环', desc: '插在蓝色 GND 轨上的裸线环，专供探头黑夹夹持（点击把 CH1 黑夹夹回这里）' },
      pe: { label: '保护大地 PE', desc: '市电三脚插头的保护接地：示波器、电源、发生器的地都通到这里，形成看不见的低阻共地路径' },
      node_a: { label: '节点 A（电源端）', desc: '开关公共端 = 电阻 R 左端：充电时 5 V、放电时 0 V；CH1 红钩接这里' },
      node_b: { label: '节点 B（R–C 之间，电容正极）', desc: '悬浮节点：CH2 红钩可以接，黑色地线夹绝不能夹（点击演示错误接法）' },
      bb_r: { label: 'R 10 kΩ（棕-黑-橙-金）', desc: 'd19 → d26，峰值电流 0.5 mA、峰值功耗 2.5 mW（1/4 W 的 1%）' },
      bb_c: { label: 'C 100 µF 电解电容', desc: '长脚正极插 b26（接电阻端），带白色负号条纹的短脚负极插 b27、经黑色跳线 a27 接蓝色 GND 轨，严禁反接' },
      bb_sw: { label: '单刀双掷拨动开关', desc: 'c18 / c19 / c20：拨向 18 接 +5 V（充电），拨向 20 接 GND（放电）；点击拨动' },
      rail_p5: { label: '+5 V 电源轨（红）', desc: '顶部外侧红轨，接台式可调直流电源（5 V）的 +' },
      rail_gnd: { label: 'GND 参考地轨（蓝）', desc: '顶部内侧蓝轨（7.5 套件另用底部外侧蓝轨，两轨用黑色跳线相连）：所有探头黑夹的唯一归宿' },
      center_trench: { label: '中央凹槽', desc: 'e 行与 f 行之间绝缘，上下两半互不相通' },
      scale_note: { label: '安全缩放（1000×）', desc: '理论阻值 < 100 Ω 时电阻 ×1000、电容 ÷1000：τ 不变，电流降到 mA 级' },
      n75_v1: { label: '7.5 套件：V₁ 端（第 38 列）', desc: '18 V 引线插 j38，R₁ 从 h38 出发' },
      n75_a: { label: '7.5 套件：A 节点（第 43 列）', desc: 'R₁、R₂ 与开关 A 端的公共节点' },
      n75_c: { label: '7.5 套件：电容正极（第 44 / 47 列）', desc: '开关公共端（第 44 列）经橙色跳线接 250 µF 正极（j47）；负极 j48 经黑色跳线接 GND 轨' },
      n75_b: { label: '7.5 套件：节点 B（第 45 列）', desc: 'R₃、R₄ 与开关 B 端的公共节点；CH2 红钩接这里' },
      n75_v2: { label: '7.5 套件：V₂ 端（第 50 列）', desc: '36 V 引线插 j50；CH1 红钩接这里，MATH = CH1 − CH2 = v_R3' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: R`单位阶跃函数 $u(t)$ 与开关闭合的数学建模`,
      sync: { layer: L1, halo: ['sw', 'vs'], params: { sch: 'step', st: '0m' } },
      blocks: [
        {
          kind: 'note',
          tone: 'tip',
          text: R`**课程定位**：本课对应 *Fundamentals of Electric Circuits, 2026 Release* (Alexander, Sadiku & Fredette) **Section 7.4–7.6**，并融合 *Introductory Circuit Analysis, 14th Ed.* (Boylestad) **Ch. 10** 的充电曲线直觉。上一课（${code('W4-L4')}）我们研究了“撤掉电源后”储能元件自由释放能量的自然响应；今天我们正式把直流电源接回来——看看开关一合上，电容电压与电感电流究竟如何从旧稳态爬升或跌落到新稳态，并用**三要素通解**与**真实示波器**把整个暂态过程彻底看透。`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`[[scale_note|**面包板安全与缩放**]]：若理论例题阻值 < 100 Ω，3D 面包板实操层必须按 1000× 安全缩放至 kΩ 级（同时电容按 1/1000 缩放至 μF 级以保持时间常数 τ 不变），将支路电流限制在安全 mA 级，防止 1/4W 碳膜电阻过热烧毁或直流电源过流保护。本课基础 RC 示波器实测套件：[[psu|台式可调直流电源（5 V）]]，$R = 10\text{ k}\Omega$，$C = 100\ \mu\text{F}$，$\tau = 1.0\text{ s}$，峰值充电电流 $0.5\text{ mA}$，电阻峰值功耗 $2.5\text{ mW}$。[[bb_c|100 μF 电解电容]]长脚为正极（接电阻端），带白色负号条纹的短脚为负极（接蓝色 GND 轨），严禁反接。示波器探头的[[gnd_clip|黑色鳄鱼夹]]只能夹在 GND 参考地——这条防短路铁律见第五幕。`,
        },
        {
          kind: 'p',
          text: R`同学们好。在实验室里，合上一个拨动开关只需要指尖一按；但在微分方程的世界里，我们怎么精确描述“在 $t = 0$ 之前电路里没有电压，在 $t = 0$ 这一瞬间突然接入一个恒定直流电压 $V_s$”这件事呢？`,
        },
        { kind: 'p', text: R`工程数学为我们准备了一把最锋利的开关刻刀——**单位阶跃函数（Unit Step Function）$u(t)$**。` },
        { kind: 'p', text: '**1.1 教授板书：单位阶跃函数与阶跃激励建模**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`根据奇异函数（Singularity Functions）定义，单位阶跃函数 $u(t)$ 是一个在 $t = 0$ 处发生幅度为 $1$ 的瞬时跳变的无量纲分段函数：`,
        },
        { kind: 'formula', title: R`单位阶跃函数 $u(t)$`, tex: R`u(t) = \begin{cases} 0, & t < 0 \\ 1, & t > 0 \end{cases}` },
        {
          kind: 'formula',
          title: R`注意在 $t = 0$ 这一点函数不连续，因此电路分析中严格区分换路前瞬间 $t = 0^-$ 与换路后瞬间 $t = 0^+$。若开关动作发生在任意时刻 $t = t_0$，则由时间平移性质得到延时阶跃函数：`,
          tex: R`u(t - t_0) = \begin{cases} 0, & t < t_0 \\ 1, & t > t_0 \end{cases}`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：一个在 $t = 0$ 闭合、将直流电源 $V_s$ 接入线性网络的理想[[sw|开关]]，其等效电源激励可写成：`,
          tex: R`v_s(t) = V_s\,u(t)`,
        },
        {
          kind: 'formula',
          title: R`若电源在 $t = t_1$ 接通、在 $t = t_2$（$t_2 > t_1$）断开，形成矩形脉冲激励，则由两个阶跃函数相减构造门函数：`,
          tex: R`v_{\text{pulse}}(t) = V_s\,[u(t - t_1) - u(t - t_2)]`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '已知', text: R`以我们稍后在面包板上实测的 $5\ \text{V}$ 直流充电实验为例：设 $V_s = 5\ \text{V}$，在 $t = 0\ \text{s}$ 合上充电开关：` },
            { label: R`1. $t < 0\ \text{s}$ 时`, text: R`$u(t) = 0 \implies v_s(t) = 5 \times 0 = 0\ \text{V}$；` },
            { label: R`2. $t > 0\ \text{s}$ 时`, text: R`$u(t) = 1 \implies v_s(t) = 5 \times 1 = 5\ \text{V}$；` },
            { label: '3. 放电', text: R`若我们在 $t = 5\ \text{s}$ 时把开关切回地端放电，整个充放电激励可统一写作 $v_s(t) = 5[u(t) - u(t - 5)]\ \text{V}$。` },
          ],
        },
      ],
      inline_svg: SVG_FIG1,
      figure_caption: '1.2 单位阶跃函数与开关等效模型',
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '一阶 RC 阶跃响应推导与“完全响应 = 暂态 + 稳态”分解',
      sync: { layer: L2, halo: ['vc', 'vf', 'vn'], params: { rk: 10, cu: 100, dTot: true, dSs: true, dTr: true, cur: 1 } },
      blocks: [
        {
          kind: 'formula',
          title: R`现在开关在 $t = 0$ 闭合了。设电容在换路前已存有初始电压 $v_C(0^-) = V_0$，由于电容储能 $W_C = \frac{1}{2}Cv_C^2$ 不能在零时间内突变，[[vc|电容电压]]必然连续：`,
          tex: R`v_C(0^+) = v_C(0^-) = V_0`,
        },
        { kind: 'p', text: '我们来严格从基尔霍夫定律出发，推导出整个 $t \\ge 0$ 时段的精确波形，并看清它背后的物理结构。' },
        { kind: 'p', text: '**2.1 教授板书：RC 阶跃响应微分方程求解**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`在 $t > 0$ 的闭合回路中，对电容上节点应用 **KCL**，并代入电阻欧姆定律与电容元件特性方程（VCR）：`,
        },
        { kind: 'formula', title: '元件特性方程（VCR）', tex: R`i_C(t) = C\frac{dv_C}{dt}, \qquad i_R(t) = \frac{v_C(t) - V_s}{R}` },
        {
          kind: 'formula',
          title: R`由 KCL 得 $i_C(t) + i_R(t) = 0$，整理为标准一阶线性常系数**非齐次微分方程**：`,
          tex: R`RC\frac{dv_C}{dt} + v_C = V_s, \quad t > 0`,
        },
        { kind: 'formula', title: R`定义[[tau|时间常数 $\tau = RC$]]，方程可写成：`, tex: R`\frac{dv_C}{dt} + \frac{1}{\tau}v_C = \frac{V_s}{\tau}` },
        { kind: 'formula', title: '② 纯符号通式：将方程分离变量：', tex: R`\frac{dv_C}{v_C - V_s} = -\frac{1}{\tau}\,dt` },
        {
          kind: 'formula',
          title: R`两端从 $t = 0^+$（对应 $v_C = V_0$）积分到任意时刻 $t$（对应 $v_C(t)$）：`,
          tex: R`\begin{gathered} \int_{V_0}^{v_C(t)} \frac{dv_C}{v_C - V_s} = -\int_{0}^{t} \frac{1}{\tau}\,dt \\[4pt] \implies \ln\left(\frac{v_C(t) - V_s}{V_0 - V_s}\right) = -\frac{t}{\tau} \end{gathered}`,
        },
        {
          kind: 'formula',
          title: R`两边取指数并整理，得到一阶 RC 阶跃响应的**完全响应通式**（[[vf|强迫 / 稳态响应 $v_f$]] + [[vn|自然 / 暂态响应 $v_n$]]）：`,
          tex: R`v_C(t) = \underbrace{V_s}_{\substack{\text{强迫响应 / 稳态响应} \\ v_f}} + \underbrace{(V_0 - V_s)\,e^{-t/\tau}}_{\substack{\text{自然响应 / 暂态响应} \\ v_n}}, \quad t \ge 0`,
        },
        {
          kind: 'formula',
          title: '如果重新按激励来源分组，同一条公式还可以改写为**零输入响应（ZIR）+ 零状态响应（ZSR）**：',
          tex: R`v_C(t) = \underbrace{V_0\,e^{-t/\tau}}_{\substack{\text{零输入响应} \\ \text{(仅由初始储能驱动)}}} + \underbrace{V_s\left(1 - e^{-t/\tau}\right)}_{\substack{\text{零状态响应} \\ \text{(仅由外部阶跃源驱动)}}}`,
        },
        {
          kind: 'formula',
          title: R`当电容初始未充电（$V_0 = 0$）时，得到 *Boylestad Ch. 10* 最经典的**零状态充电公式**与[[ic|充电电流]]公式：`,
          tex: R`v_C(t) = V_s\left(1 - e^{-t/\tau}\right), \qquad i_C(t) = C\frac{dv_C}{dt} = \frac{V_s}{R}\,e^{-t/\tau}, \quad t \ge 0`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（面包板实测标准参数）',
          steps: [
            {
              label: '已知',
              text: R`取实验室面包板安全实测套件参数：$V_s = 5\ \text{V}$，[[r|$R = 10\ \text{k}\Omega = 10^4\ \Omega$]]，[[cap|$C = 100\ \mu\text{F} = 10^{-4}\ \text{F}$]]，初始完全放电 $V_0 = 0\ \text{V}$：`,
            },
            { label: '1. 计算时间常数：', tex: R`\tau = RC = (10 \times 10^3\ \Omega) \times (100 \times 10^{-6}\ \text{F}) = 1.0\ \text{s}` },
            {
              label: R`2. 代入电容电压与充电电流通式（$t \ge 0$）：`,
              tex: R`\begin{gathered} v_C(t) = 5\left(1 - e^{-t/1.0}\right) = 5 - 5e^{-t}\ \text{V} \\[4pt] i_C(t) = \frac{5\ \text{V}}{10\ \text{k}\Omega}e^{-t} = 0.5\,e^{-t}\ \text{mA} \end{gathered}`,
            },
            { label: '3. 计算 **Boylestad 充电曲线五大关键里程碑**（经 Python SymPy 精确验算）：' },
          ],
        },
        {
          kind: 'table',
          head: ['时刻 $t$', '充电百分比 $1 - e^{-t/\\tau}$', '实测目标电压 $v_C(t)$（$V_s=5\\ \\text{V}$）', '充电电流 $i_C(t)$', '工程判读'],
          rows: [
            ['$t = 0^+$', '$0.00\\%$', '$0.000\\ \\text{V}$', '$0.500\\ \\text{mA}$', '电容瞬时等效短路，电流达峰值'],
            ['[[m63|**$t = 1\\tau = 1\\ \\text{s}$**]]', '**$63.21\\%$**', '**$3.161\\ \\text{V}$**', '$0.184\\ \\text{mA}$', '**示波器游标实测 $\\tau$ 的黄金标定点**'],
            ['$t = 2\\tau = 2\\ \\text{s}$', '$86.47\\%$', '$4.323\\ \\text{V}$', '$0.068\\ \\text{mA}$', '充电速率明显放缓'],
            ['$t = 3\\tau = 3\\ \\text{s}$', '$95.02\\%$', '$4.751\\ \\text{V}$', '$0.025\\ \\text{mA}$', '剩余误差不足 $5\\%$'],
            ['$t = 4\\tau = 4\\ \\text{s}$', '$98.17\\%$', '$4.908\\ \\text{V}$', '$0.009\\ \\text{mA}$', '接近稳态'],
            ['[[m5tau|**$t = 5\\tau = 5\\ \\text{s}$**]]', '**$99.33\\%$**', '**$4.966\\ \\text{V}$**', '$0.003\\ \\text{mA}$', '**工程上视为完全充满（进入新稳态）**'],
          ],
        },
      ],
      inline_svg: SVG_FIG2,
      figure_caption: R`2.2 RC 充电曲线 1 − e^(−t/τ) 与暂态 / 稳态分量拆解`,
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: R`电路学最强捷径——三要素通解与非状态变量 $0^+$ 突变铁律`,
      sync: { layer: L1, halo: ['c75', 'sw75'], params: { sch: 'rc75', st: '0m' } },
      blocks: [
        { kind: 'p', text: '如果我们每遇到一个含多个电阻和电源的一阶电路，都要从头列写 KCL/KVL 微分方程、分离变量再求积分，不仅费时，而且极易在代数整理中出错。' },
        {
          kind: 'formula',
          title: R`请同学们把目光锁定在上一幕推导出的完全响应通式上，并把它推广到**任意一阶线性常系数直流激励电路**。只要电路中只含一个独立储能元件（或可化简为单个等效电容 $C_{\text{eq}}$ / 单个等效电感 $L_{\text{eq}}$），电路中**任意一条支路的电压或电流 $x(t)$**，在 $t \ge 0$ 时都严格服从同一条黄金公式——**三要素通解（Three-Element Formula）**：`,
          tex: R`x(t) = x(\infty) + \left[x(0^+) - x(\infty)\right] e^{-t/\tau}, \quad t \ge 0`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授敲黑板（本课最核心的避坑铁律）**：三要素公式确实对电路中**任何**电压或电流都成立——但有一个生死攸关的前提必须刻在脑子里：　1. **只有状态变量（电容电压 $v_C$ 与电感电流 $i_L$）受能量连续性保护**，满足 $v_C(0^+) = v_C(0^-)$、$i_L(0^+) = i_L(0^-)$；　2. [[jump|**所有非状态变量（如电阻电流 $i_R$、电容电流 $i_C$、电感电压 $v_L$）在 $t = 0^+$ 换路瞬间都允许发生阶跃突变**]]！求非状态变量 $x(t)$ 时，**绝不能拿 $x(0^-)$ 当作 $x(0^+)$**，必须在 $t = 0^+$ 等效电路里（[[equiv|把电容换成数值为 $v_C(0^+)$ 的恒压源，把电感换成数值为 $i_L(0^+)$ 的恒流源]]）现算 $x(0^+)$！`,
        },
        { kind: 'p', text: '**3.1 教授板书：Sadiku 7.5 经典 RC 三要素综合例题（含非状态变量突变）**' },
        {
          kind: 'p',
          text: R`**题目设定**：如下图所示，[[sw75|单刀双掷开关 $S$]] 在位置 $A$ 停留了足够长时间，于 $t = 0$ 瞬间切换至位置 $B$。已知 [[v1|$V_1 = 18\ \text{V}$]]，[[r1|$R_1 = 3\ \Omega$]]，[[r2|$R_2 = 6\ \Omega$]]，[[c75|$C = 0.25\ \text{F}$]]，[[v2|$V_2 = 36\ \text{V}$]]，[[r3|$R_3 = 6\ \Omega$]]，[[r4|$R_4 = 12\ \Omega$]]。`,
        },
        {
          kind: 'p',
          text: R`**求解目标**：求 $t \ge 0$ 时的电容电压 $v_C(t)$、[[i3|电阻 $R_3$ 电流 $i_3(t)$]]（方向从 $V_2$ 正极向左流出）以及[[ic75|电容电流 $i_C(t)$]]，并检验 $i_3$ 在 $t = 0$ 处的跳变。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. **直流稳态性质**：直流稳态下电容电流 $i_C = C\frac{dv_C}{dt} = 0$，电容等效为**开路**；　2. **换路定则（能量连续性）**：$v_C(0^+) = v_C(0^-)$；　3. [[thev|**戴维南等效（${code('W2-L7')}）**]]：对 $t > 0$ 的线性含源二端网络从电容两端看进去，可等效为 $V_{\text{th}}$ 与 $R_{\text{th}}$ 串联，时间常数 $\tau = R_{\text{th}} C$；　4. **三要素通解**：对状态变量 $v_C(t)$ 与非状态变量 $i_3(t)$ 均适用 $x(t) = x(\infty) + [x(0^+) - x(\infty)]e^{-t/\tau}$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · 1. **$t = 0^-$（开关在 $A$，直流稳态，$C$ 开路）**：`,
          tex: R`v_C(0^-) = V_1\frac{R_2}{R_1 + R_2}, \qquad i_3(0^-) = \frac{V_2}{R_3 + R_4}`,
        },
        {
          kind: 'formula',
          title: R`2. **$t > 0$ 戴维南等效与时间常数（开关在 $B$）**：`,
          tex: R`R_{\text{th}} = R_3 \parallel R_4 = \frac{R_3 R_4}{R_3 + R_4}, \qquad V_{\text{th}} = V_2\frac{R_4}{R_3 + R_4}, \qquad \tau = R_{\text{th}} C`,
        },
        {
          kind: 'formula',
          title: R`3. **状态变量 $v_C(t)$ 的三要素通式**：`,
          tex: R`\begin{gathered} v_C(0^+) = v_C(0^-), \qquad v_C(\infty) = V_{\text{th}} \\[4pt] v_C(t) = V_{\text{th}} + \left[v_C(0^+) - V_{\text{th}}\right]e^{-t/\tau} \end{gathered}`,
        },
        {
          kind: 'formula',
          title: R`4. **非状态变量 $i_3(t)$ 的 $0^+$ 现算与三要素通式**：在 $t = 0^+$ 瞬间，$C$ 等效为电压源 $v_C(0^+)$，由欧姆定律现算 $i_3(0^+)$；在 $t = \infty$ 时 $C$ 再次开路，节点电压为 $v_C(\infty) = V_{\text{th}}$：`,
          tex: R`\begin{gathered} i_3(0^+) = \frac{V_2 - v_C(0^+)}{R_3}, \qquad i_3(\infty) = \frac{V_2 - V_{\text{th}}}{R_3} = \frac{V_2}{R_3 + R_4} \\[4pt] i_3(t) = i_3(\infty) + \left[i_3(0^+) - i_3(\infty)\right]e^{-t/\tau} \end{gathered}`,
        },
        {
          kind: 'formula',
          title: R`5. **电容电流 $i_C(t)$ 交叉校验**：`,
          tex: R`i_C(t) = C\frac{dv_C}{dt} = -\frac{v_C(0^+) - V_{\text{th}}}{R_{\text{th}}}e^{-t/\tau} = i_3(t) - \frac{v_C(t)}{R_4}`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: '这道例题的 ③ 代入数值，就是第六幕苏格拉底式引导例题的五步：先自己闯关，通关后在引导例题下方的「通关复盘」看完整板书。下图 3.2 的数值也先打上问号，左侧 01 层同样等你作答后逐个揭晓。',
        },
      ],
      inline_svg: SVG_FIG3_MASKED,
      figure_caption: '3.2 RC 三要素综合例题原理图与 0⁻ / 0⁺ / ∞ 三态对照（数值在第六幕通关后揭晓）',
    },
    /* ---------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '一阶 RL 阶跃响应与电感反向电动势突变',
      sync: { layer: L1, halo: ['l76', 'jump'], params: { sch: 'rl76', st: '0p' } },
      blocks: [
        {
          kind: 'p',
          text: R`理解了 RC 电路之后，RL 电路就是一面完美的物理对偶镜。在 RL 电路中，受磁场储能 $W_L = \frac{1}{2}L i_L^2$ 保护的连续状态变量是[[il|**电感电流 $i_L(t)$**]]，而允许在换路瞬间猛烈跳变的非状态变量则是[[vl|**电感电压 $v_L(t)$**]]。在工程上，切断感性负载时产生的剧烈负电压跳变就是大名鼎鼎的**感性反向电动势（Inductive Kickback）**——这也是为什么继电器线圈旁必须并联续流二极管的原因。`,
        },
        { kind: 'p', text: '**4.1 教授板书：Sadiku 7.6 经典 RL 阶跃响应例题**' },
        {
          kind: 'p',
          text: R`**题目设定**：直流电压源 [[vs76|$V_s = 24\ \text{V}$]] 依次串联电阻 [[r1_76|$R_1 = 4\ \Omega$]]、[[r2_76|$R_2 = 4\ \Omega$]]，接入由 [[r3_76|$R_3 = 8\ \Omega$]] 与[[l76|电感 $L = 2\ \text{H}$]] 并联组成的负载网络。[[s76|开关 $S$]] 跨接在 $R_2$ 两端，在 $t < 0$ 时长期闭合（将 $R_2$ 短路），于 $t = 0$ 瞬间断开。`,
        },
        {
          kind: 'p',
          text: R`**求解目标**：求 $t \ge 0$ 时的电感电流 $i_L(t)$、电感两端电压 $v_L(t)$（上正下负）以及 [[ir3|$R_3$ 支路电流 $i_{R3}(t)$]]（向下为正）。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. **直流稳态性质**：直流稳态下 $v_L = L\frac{di_L}{dt} = 0$，电感等效为**短路**；　2. **换路定则（磁链守恒）**：$i_L(0^+) = i_L(0^-)$；　3. [[thev|**戴维南等效与 RL 时间常数**]]：从电感端口看入 $t > 0$ 的线性含源网络得 $V_{\text{th}}, R_{\text{th}}$，时间常数为 $\tau = \frac{L}{R_{\text{th}}}$；　4. **三要素通解**：$x(t) = x(\infty) + [x(0^+) - x(\infty)]e^{-t/\tau}$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式 · 1. **$t = 0^-$（开关 $S$ 闭合短接 $R_2$，电感 $L$ 直流短路并短接 $R_3$）**：`,
          tex: R`i_L(0^-) = \frac{V_s}{R_1}, \qquad v_L(0^-) = 0, \qquad i_{R3}(0^-) = 0`,
        },
        {
          kind: 'formula',
          title: R`2. **$t > 0$ 戴维南等效与时间常数（开关 $S$ 断开，$R_1 + R_2$ 串入）**：`,
          tex: R`\begin{gathered} R_{\text{th}} = (R_1 + R_2) \parallel R_3 = \frac{(R_1 + R_2)R_3}{R_1 + R_2 + R_3} \\[4pt] V_{\text{th}} = V_s\frac{R_3}{R_1 + R_2 + R_3}, \qquad \tau = \frac{L}{R_{\text{th}}} \end{gathered}`,
        },
        {
          kind: 'formula',
          title: R`3. **状态变量 $i_L(t)$ 的三要素通式**：`,
          tex: R`\begin{gathered} i_L(0^+) = i_L(0^-), \qquad i_L(\infty) = \frac{V_{\text{th}}}{R_{\text{th}}} = \frac{V_s}{R_1 + R_2} \\[4pt] i_L(t) = i_L(\infty) + \left[i_L(0^+) - i_L(\infty)\right]e^{-t/\tau} \end{gathered}`,
        },
        {
          kind: 'formula',
          title: R`4. **非状态变量 $v_L(t)$ 与 $i_{R3}(t)$ 的 $0^+$ 现算与三要素通式**：在 $t = 0^+$ 瞬间，[[equiv|$L$ 替换为恒流源 $i_L(0^+)$]]，对电感上节点列 KCL：`,
          tex: R`\begin{gathered} \frac{v_L(0^+) - V_s}{R_1 + R_2} + \frac{v_L(0^+)}{R_3} + i_L(0^+) = 0 \\[4pt] \implies v_L(0^+) = R_{\text{th}}\left(\frac{V_s}{R_1 + R_2} - i_L(0^+)\right) \end{gathered}`,
        },
        {
          kind: 'formula',
          title: R`又因 $v_L(\infty) = 0$，故：`,
          tex: R`v_L(t) = v_L(0^+)\,e^{-t/\tau}, \qquad i_{R3}(t) = \frac{v_L(t)}{R_3} = \frac{v_L(0^+)}{R_3}\,e^{-t/\tau}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（Python SymPy 全程验算）',
          steps: [
            { label: R`1. **求 $t = 0^-$ 初值**：`, tex: R`i_L(0^-) = \frac{24}{4} = 6\ \text{A}, \qquad v_L(0^-) = 0\ \text{V}, \qquad i_{R3}(0^-) = 0\ \text{A}` },
            {
              label: R`2. **求 $t > 0$ 戴维南参数与 $\tau$**：`,
              tex: R`\begin{gathered} R_1 + R_2 = 4 + 4 = 8\ \Omega \\[2pt] R_{\text{th}} = 8 \parallel 8 = 4\ \Omega, \qquad V_{\text{th}} = 24 \times \frac{8}{8 + 8} = 12\ \text{V} \\[2pt] \tau = \frac{L}{R_{\text{th}}} = \frac{2\ \text{H}}{4\ \Omega} = 0.5\ \text{s} \implies \frac{1}{\tau} = 2\ \text{s}^{-1} \end{gathered}`,
            },
            {
              label: R`3. **写出状态变量 $i_L(t)$**`,
              text: R`$i_L(0^+) = 6\ \text{A}$，$i_L(\infty) = \frac{24}{8} = 3\ \text{A}$：`,
              tex: R`i_L(t) = 3 + (6 - 3)e^{-t/0.5} = 3 + 3e^{-2t}\ \text{A}, \quad t \ge 0`,
            },
            { label: R`4. **现算非状态变量 $v_L(t)$ 与 $i_{R3}(t)$**`, text: R`在 $t = 0^+$ 瞬间：`, tex: R`v_L(0^+) = 4 \times (3 - 6) = -12\ \text{V}` },
            {
              label: R`代入三要素通解（并可用 $L\frac{di_L}{dt} = 2 \times (-6e^{-2t}) = -12e^{-2t}\ \text{V}$ 交叉核对）：`,
              tex: R`v_L(t) = -12e^{-2t}\ \text{V}, \qquad i_{R3}(t) = \frac{-12e^{-2t}}{8} = -1.5e^{-2t}\ \text{A}, \quad t > 0`,
            },
            {
              label: '物理直觉',
              text: R`开关一断开，电感为了拼命维持 $6\ \text{A}$ 的旧电流，瞬间把上端电位拉低到 $-12\ \text{V}$，迫使 $1.5\ \text{A}$ 的电流从地经 $R_3$ 倒灌上来补充（同时电源支路提供 $\frac{24 - (-12)}{8} = 4.5\ \text{A}$，$4.5 + 1.5 = 6\ \text{A}$，KCL 严丝合缝！）。`,
            },
          ],
        },
        { kind: 'p', text: '**4.2 RC 与 RL 三要素对偶速查表**' },
        {
          kind: 'table',
          head: ['核心属性', '一阶 RC 阶跃电路', '一阶 RL 阶跃电路'],
          rows: [
            ['连续状态变量（不可突变）', '电容电压 $v_C(t)$：$v_C(0^+) = v_C(0^-)$', '电感电流 $i_L(t)$：$i_L(0^+) = i_L(0^-)$'],
            ['允许突变的非状态变量', '电容电流 $i_C(t)$、各电阻电流 $i_R(t)$', '电感电压 $v_L(t)$、各电阻电压/电流'],
            ['直流稳态等效（$0^-$ 与 $\\infty$）', '**开路（Open Circuit）**', '**短路（Short Circuit）**'],
            ['$t = 0^+$ 现算等效替换', '替换为恒压源 $v_C(0^+)$', '替换为恒流源 $i_L(0^+)$'],
            ['时间常数公式', '$\\tau = R_{\\text{th}} C$', '$\\tau = \\dfrac{L}{R_{\\text{th}}}$'],
          ],
        },
      ],
      inline_svg: SVG_FIG4,
      figure_caption: '4.3 RL 阶跃响应原理图与反电动势突变波形',
    },
    /* ---------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '仪器安全红线与 3D 面包板示波器实操',
      sync: { layer: L3, halo: ['gnd_clip', 'gnd_loop'], params: { kit: 'rc', src: 'dc', sw: 'charge', probe: 'safe', cam: 'bench' } },
      blocks: [
        {
          kind: 'p',
          text: '理论公式全部打通后，现在我们把视线转向实验台。本课是同学们**第一次在真实面包板上连接台式示波器**实测一阶充放电波形。在通电按下电源开关之前，请先停下来，把下面这条足以救下你整套实验板和示波器探头的安全铁律读三遍！',
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**示波器探头地线夹共地防短路警示（仪器安全硬性红线）**　**物理真相**：真实台式示波器所有通道 BNC 端口的外壳、以及探头上的[[gnd_clip|**黑色鳄鱼夹（地线夹）**]]，在仪器内部直接连通到市电三脚插头的[[pe|**保护大地（PE, Protective Earth）**]]。与此同时，实验室里的直流稳压电源负极或函数发生器参考地通常也连接到同一大地（或通过仪器机壳共地）。`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**致命错误**：很多初学者想直接看串联电阻 $R$ 两端的电压 $v_R(t)$，于是顺手把示波器探头红钩夹在 $V_s$ 正极，把**黑色鳄鱼夹夹在电阻 $R$ 与电容 $C$ 之间的[[node_b|悬浮节点]]**。这一夹下去，黑色鳄鱼夹立刻通过市电 PE 大地把 $R$ 与 $C$ 的节点直接**零欧姆短路到电源负极（GND）**！结果：电容被瞬间短接旁路，测量波形彻底失真，更危险的是电阻 $R$ 直接跨接电源两端导致过流发烫甚至烧毁电源或探头地线！`,
        },
        { kind: 'p', text: '**唯一正确操作**：' },
        {
          kind: 'ol',
          items: [
            R`**共地铁律**：无论连接多少个通道，所有示波器探头的**黑色鳄鱼夹必须全部统一夹在面包板[[rail_gnd|蓝色的公共负极轨（GND）]]**；`,
            R`**测接地电容电压 $v_C(t)$**：[[ch1|CH1]] 红色探针钩住电容正极节点，黑色鳄鱼夹夹蓝色 GND 轨；`,
            R`**测悬浮电阻电压 $v_R(t)$（双通道数学差分法）**：[[ch1|CH1]] 测电阻左端（[[node_a|电源端 $v_A(t)$]]），[[ch2|CH2]] 测电阻右端（[[node_b|电容端 $v_C(t)$]]），两个黑色鳄鱼夹**全部夹在蓝色 GND 轨**，然后按下示波器面板上的 [[math|**${code('MATH')} 键，选择 ${code('CH1 − CH2')}**]]，即可安全、无损地读出悬浮电阻电压 $v_R(t)$！`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`（数值核对：本套件的 $R = 10\text{ k}\Omega$ 把电阻电流限制在 $5\text{ V} / 10\text{ k}\Omega = 0.5\text{ mA}$，所以黑夹夹在节点 B 时首先毁掉的是测量——电容被旁路，充好的电荷经地线夹瞬间泄放，屏幕上只剩一条直线；真正的大电流烧毁发生在低阻电路上，或黑夹落在电源正极一侧的节点时（电源经地线直接短路）。在左侧 03 层把「探头黑夹」切到「黑夹夹节点 B（错误）」，亲眼看一次短路警示，再切回 GND 轨。）`,
        },
        { kind: 'p', text: '**5.1 面包板元器件安全缩放与实操配置**' },
        {
          kind: 'note',
          tone: 'tip',
          text: '1. **理论低阻电路的 1000× 安全缩放**：这一段要用到第三幕例题的答案（时间常数与最大支路电流），已移到第六幕引导例题之后的「通关复盘」。',
        },
        { kind: 'p', text: '2. **基础 RC 充电实测套件**：' },
        {
          kind: 'ul',
          items: [
            R`[[psu|台式可调直流电源（5 V）]]：$V_s = 5.0\ \text{V}$（[[rail_p5|红轨接正]]，[[rail_gnd|蓝轨接 GND]]）；`,
            R`[[bb_r|串联电阻]]：$R = 10\ \text{k}\Omega$（棕-黑-橙-金，峰值功耗仅 $2.5\ \text{mW}$，绝对安全）；`,
            R`[[bb_c|储能电容]]：$C = 100\ \mu\text{F}$ 电解电容（**长脚正极接电阻，带白条短脚负极接蓝色 GND 轨，严禁反接**）；`,
            R`[[scope|示波器设置]]：垂直档位 ${code('1 V/div')}，水平时基 ${code('500 ms/div')}（单屏显示 $5\ \text{s} = 5\tau$），触发模式选 ${code('Single')} 上升沿触发（触发电平 ${code('0.5 V')}）或 ${code('Roll')} 滚动模式，用游标卡在 $t = 1.0\ \text{s}$ 处即可亲眼验证 [[m63|$v_C(1\tau) \approx 3.16\ \text{V}$（$63.2\%$）]]。`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 03 层动手：拨动开关（或在 3D 场景里点开关）在「充电 → 5 V」与「放电 → GND」之间切换，右上角示波器屏幕按 ${code('500 ms/div')} 实时扫出 CH1 $v_A$、CH2 $v_C$ 与 MATH $v_R = \text{CH1} - \text{CH2}$，游标停在 $1\tau$；把「信号源」换成[[fg|函数信号发生器]]的 $0$–$5\ \text{V}$、$0.1\ \text{Hz}$ 方波，就是第一幕的 $v_s(t) = 5[u(t) - u(t - 5)]\ \text{V}$ 周而复始；镜头「夹子」特写黑夹，「屏幕」特写示波器。`,
        },
        {
          kind: 'table',
          caption: '左侧 03 层的逐孔接线（830 孔面包板：a–e、f–j 同列竖通，e 与 f 之间是中央凹槽）',
          head: ['元件 / 导线', '起点', '终点', '作用'],
          rows: [
            ['[[psu|台式可调直流电源（5 V）]]', '+ / COM 端子', '[[rail_p5|顶部外侧红轨]] / [[rail_gnd|顶部内侧蓝轨]]', R`$+5\ \text{V}$ / GND`],
            ['[[bb_sw|单刀双掷拨动开关]]', 'c18 / c19 / c20', '红色跳线 a18 → 红轨；黑色跳线 a20 → 蓝轨', '公共端 c19 = [[node_a|节点 A]]：拨向 18 充电，拨向 20 放电'],
            ['[[bb_r|R 10 kΩ（棕-黑-橙-金）]]', 'd19', 'd26', '串联电阻；d26 所在列 = [[node_b|节点 B]]'],
            ['[[bb_c|C 100 µF 电解电容]]', '长脚 + b26', '白条短脚 − b27，黑色跳线 a27 → 蓝色 GND 轨', '储能电容，严禁反接'],
            ['[[gnd_loop|GND 接地测试环]]', '蓝轨第 32 列', '蓝轨第 34 列', '探头黑夹的夹持点'],
            ['[[ch1|CH1 探头（黄）]]', '红钩：R 左脚（节点 A）', '[[gnd_clip|黑夹]]：GND 测试环', R`测 $v_A(t)$`],
            ['[[ch2|CH2 探头（青）]]', '红钩：R 右脚（节点 B）', '[[gnd_clip|黑夹]]：GND 测试环', R`测 $v_C(t)$；[[math|MATH]] CH1 − CH2 = $v_R(t)$`],
            ['[[fg|函数信号发生器]]（选「方波」时）', 'OUT 红线 → a19（节点 A）', 'COM 黑线 → 蓝轨第 41 列', '拨动开关拔下，方波直接驱动 RC'],
          ],
        },
      ],
      inline_svg: SVG_FIG5,
      figure_caption: '5.2 示波器探头地线夹错误短路红线警示 vs. 正确差分接法',
    },
    /* ---------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '苏格拉底式 5 步引导例题与诊断测验',
      sync: { layer: L1, halo: ['c75'], params: { sch: 'rc75', st: '0m' } },
      blocks: [
        { kind: 'p', text: '在进入最终测评前，我们把三要素求解的 5 步标准动作浓缩为一张闭环决策图——每次面对一阶动态电路，顺着这 5 个关卡走一遍，绝不会踩坑。' },
        { kind: 'figure', svg: SVG_FIG6, caption: '6.1 三要素求解 5 步闭环决策图' },
        { kind: 'p', text: R`**6.2 苏格拉底式分步引导例题（Sadiku 7.5 含开关同时求 $v_C(t)$ 与非状态变量 $i_3(t)$）**` },
        {
          kind: 'guided',
          // all steps answered: the stage uncovers the example's numbers
          done_params: { ex75: 9 },
          title: '含单刀双掷开关的 RC 三要素求解与非状态变量突变剖析',
          source: 'W4-L5-SOCRATIC-01 · Alexander, Sadiku & Fredette (2026) Section 7.5',
          problem: R`开关 S 长期位于位置 A（左侧 18V 电压源串联 $R_1 = 3\,\Omega$、并联 $R_2 = 6\,\Omega$ 接向 $C = 0.25\,\text{F}$），于 $t = 0$ 瞬间切至位置 B（右侧 36V 电压源串联 $R_3 = 6\,\Omega$、并联 $R_4 = 12\,\Omega$）。求 $t \ge 0$ 时的电容电压 $v_C(t)$ 与电阻 $R_3$ 的电流 $i_3(t)$（方向由 36V 正极流向节点 B）。`,
          problem_svg: SVG_PROBLEM,
          steps: [
            {
              title: R`Step 1 · 锁定换路前稳态初值 $v_C(0^-)$`,
              mini_svg: MINI_STEP1,
              question: R`在 $t = 0^-$ 时开关已经在 A 点停了很久，电容 C 处于什么等效状态？此时 $v_C(0^-)$ 等于多少伏？`,
              hint: R`$v_C(0^-) = V_1 \cdot \frac{R_2}{R_1 + R_2} = 18 \times \frac{6}{3 + 6}$`,
              options: [
                {
                  text: R`电容开路，但要把 B 侧也算进来：$v_C(0^-) = 36 \times \frac{12}{6 + 12} = 24\ \text{V}$`,
                  correct: false,
                  feedback: R`别急着把右边的 36V 电源也算进来！在 $t < 0$ 时，开关还在 A 位置，电容与 B 侧完全断开。直流稳态下电容相当于开路，只看左侧分压器即可。`,
                },
                {
                  text: R`电容开路，只看左侧分压器：$v_C(0^-) = 18 \times \frac{6}{3 + 6} = 12\ \text{V}$`,
                  correct: true,
                  feedback: R`完全正确！直流稳态下电容开路，电容两端就是 $R_2$ 上分到的电压 $12\ \text{V}$；它是状态变量，换路瞬间 $v_C(0^+) = v_C(0^-) = 12\ \text{V}$。`,
                },
                {
                  text: R`电容开路、支路没有电流，所以 $R_1$ 上没有压降：$v_C(0^-) = 18\ \text{V}$`,
                  correct: false,
                  feedback: R`电容支路确实没有电流，可 $R_2$ 还在！18 V 经 $R_1$ 和 $R_2$ 形成一条通路，电流照样流过 $R_1$、产生压降；电容并在 $R_2$ 两端，只分到 $R_2$ 那一份电压——用分压公式算一算。`,
                },
              ],
              board: [R`v_C(0^+) = v_C(0^-)`, R`= 18 \times \frac{6}{3 + 6} = 12\ \text{V}`],
              halo: ['c75', 'r1', 'r2', 'v1'],
              params: { sch: 'rc75', st: '0m', ex75: 0 },
              layer: L1,
            },
            {
              title: R`Step 2 · 求 $t > 0$ 戴维南等效电阻 $R_{\text{th}}$ 与时间常数 $\tau$`,
              mini_svg: MINI_STEP2,
              question: R`开关切到 B 后（$t > 0$），从电容 C 两端向右看入，把 36V 电压源置零（短路），戴维南等效电阻 $R_{\text{th}}$ 和时间常数 $\tau$ 分别是多少？`,
              hint: R`$R_{\text{th}} = R_3 \parallel R_4 = \frac{6 \times 12}{6 + 12}, \quad \tau = R_{\text{th}} C$`,
              options: [
                {
                  text: R`$R_{\text{th}} = 6 \parallel 12 = 4\ \Omega$，$\tau = 4 \times 0.25 = 1\ \text{s}$`,
                  correct: true,
                  feedback: R`漂亮！36 V 一置零，$R_3$ 的右端也落到地上，$R_3$ 与 $R_4$ 都跨在电容两端之间，是并联：$R_{\text{th}} = 4\ \Omega$，$\tau = R_{\text{th}} C = 1\ \text{s}$。`,
                },
                {
                  text: R`$R_{\text{th}} = 4\ \Omega$，$\tau = \dfrac{R_{\text{th}}}{C} = \dfrac{4}{0.25} = 16\ \text{s}$`,
                  correct: false,
                  feedback: R`$R_{\text{th}}$ 找对了，可时间常数公式记混了：RC 电路是 $\tau = R_{\text{th}} C$（欧姆 × 法拉 = 秒），$L/R_{\text{th}}$ 才是 RL 电路的写法；$R/C$ 的量纲根本不是秒。`,
                },
                {
                  text: R`$R_{\text{th}} = 6 + 12 = 18\ \Omega$，$\tau = 18 \times 0.25 = 4.5\ \text{s}$`,
                  correct: false,
                  feedback: R`常见误区是把 $R_3$ 和 $R_4$ 当成串联相加得 18Ω！请把 36V 电源短路到地，从电容端口出发，电流可以兵分两路分别经过 $R_4$ 到地和经过 $R_3$ 到地，所以它们是并联关系。`,
                },
              ],
              board: [R`R_{\text{th}} = 6 \parallel 12 = 4\ \Omega,`, R`\tau = 4 \times 0.25 = 1\ \text{s}`],
              halo: ['thev', 'r3', 'r4'],
              params: { sch: 'rc75', st: 'inf', ex75: 1 },
              layer: L1,
            },
            {
              title: R`Step 3 · 求新稳态 $v_C(\infty)$ 并写出状态变量 $v_C(t)$`,
              mini_svg: MINI_STEP3,
              question: R`当 $t \to \infty$ 时电容在 B 侧再次达到直流稳态（开路），此时 $v_C(\infty)$ 是多少？代入三要素通解写出 $v_C(t)$。`,
              hint: R`$v_C(\infty) = V_2 \cdot \frac{R_4}{R_3 + R_4} = 24\ \text{V}, \quad v_C(t) = 24 + (12 - 24)e^{-t/1}$`,
              options: [
                {
                  text: R`$v_C(\infty) = 36\ \text{V}$（电容最终充到电源电压），$v_C(t) = 36 - 24e^{-t}\ \text{V}$`,
                  correct: false,
                  feedback: R`电容最终充不到 36 V！稳态时 C 开路，$R_3$ 与 $R_4$ 仍串联在 36 V 上分压，电容并在 $R_4$ 两端，只拿到 $R_4$ 那一份：$V_{\text{th}} = 36 \times \frac{12}{6 + 12}$。“充到电源电压”只在电源与电容之间仅有串联电阻时才成立。`,
                },
                {
                  text: R`$v_C(\infty) = 24\ \text{V}$，$v_C(t) = 24 + 12e^{-t}\ \text{V}$`,
                  correct: false,
                  feedback: R`稳态值 $v_C(\infty)$ 其实就是 B 侧网络的开路电压 $V_{\text{th}}$。注意符号方向：$v_C(0^+) - v_C(\infty) = 12 - 24 = -12\ \text{V}$，负号代表电容正在从 12 V 向上充电至 24 V。`,
                },
                {
                  text: R`$v_C(\infty) = 24\ \text{V}$，$v_C(t) = 24 - 12e^{-t}\ \text{V}$`,
                  correct: true,
                  feedback: R`正是如此！$v_C(\infty) = V_{\text{th}} = 24\ \text{V}$，$[v_C(0^+) - v_C(\infty)] = -12\ \text{V}$：电容从 12 V 出发、按 $\tau = 1\ \text{s}$ 爬向 24 V。代 $t = 0$ 检查：$24 - 12 = 12\ \text{V}$，与初值吻合。`,
                },
              ],
              board: [R`v_C(\infty) = 24\ \text{V}`, R`\implies v_C(t) = 24 - 12e^{-t}\ \text{V}\quad (t \ge 0)`],
              halo: ['c75', 'thev'],
              params: { sch: 'rc75', st: 'inf', ex75: 2 },
              layer: L1,
            },
            {
              title: R`Step 4 · 避开突变陷阱：现算非状态变量 $i_3(0^+)$`,
              mini_svg: MINI_STEP4,
              question: R`关键陷阱题！已知换路前 $i_3(0^-) = 36/(6+12) = 2\ \text{A}$。现在要求 $t \ge 0$ 时的电阻电流 $i_3(t)$，请问 $i_3(0^+)$ 等于 2 A 吗？如果不等于，应该如何现算？`,
              hint: R`$i_3(0^+) = \frac{V_2 - v_C(0^+)}{R_3} = \frac{36 - 12}{6}$`,
              options: [
                {
                  text: R`不等于 2 A：把电容换成 12 V 恒压源现算，$i_3(0^+) = \frac{36 - 12}{6} = 4\ \text{A}$`,
                  correct: true,
                  feedback: R`一针见血！电阻电流是非状态变量，换路瞬间从 2 A 跳到 4 A；只有 $v_C$ 受连续性保护，所以 0⁺ 电路里电容是 12 V 恒压源，$R_3$ 两端压差 24 V。`,
                },
                {
                  text: R`等于 2 A：电流不能突变，$i_3(0^+) = i_3(0^-) = 2\ \text{A}$`,
                  correct: false,
                  feedback: R`停！千万不能直接用 $i_3(0^-) = 2\ \text{A}$！电阻电流是非状态变量，没有能量守恒保护。在 $t = 0^+$ 瞬间，把电容替换成一个 12 V 的理想恒压源接在节点 B，立刻用欧姆定律重算流过 $R_3$ 的电流！`,
                },
                {
                  text: R`不等于 2 A：0⁺ 时电容相当于短路，$i_3(0^+) = \frac{36}{6} = 6\ \text{A}$`,
                  correct: false,
                  feedback: R`电容在 0⁺ 不是短路！它此刻带着 12 V 的电荷——只有初始未充电（$v_C(0^+) = 0$）的电容才能在 0⁺ 当作短路。正确的替换是一个 12 V 恒压源，$R_3$ 两端的电压是 $36 - 12$，而不是 36。`,
                },
              ],
              board: [R`i_3(0^+) = \frac{36 - 12}{6} = 4\ \text{A}`, R`(\text{发生 } 2\ \text{A} \to 4\ \text{A 突变!})`],
              halo: ['jump', 'i3', 'r3'],
              params: { sch: 'rc75', st: '0p', ex75: 3 },
              layer: L1,
            },
            {
              title: R`Step 5 · 完成 $i_3(t)$ 三要素表达式并交叉验算`,
              mini_svg: MINI_STEP5,
              question: R`结合 $i_3(0^+) = 4\ \text{A}$、$i_3(\infty) = (36 - 24)/6 = 2\ \text{A}$ 与相同的 $\tau = 1\ \text{s}$，写出 $i_3(t)$ 的完整表达式，并用 $(36 - v_C(t))/6$ 验证结果是否一致。`,
              hint: R`$i_3(t) = i_3(\infty) + [i_3(0^+) - i_3(\infty)]e^{-t/\tau} = 2 + (4 - 2)e^{-t}$`,
              options: [
                {
                  text: R`$i_3(t) = 4 - 2e^{-t}\ \text{A}$`,
                  correct: false,
                  feedback: R`初值和终值放反了：三要素公式里 $x(\infty)$ 在前，$[x(0^+) - x(\infty)]$ 乘指数。代 $t = 0$ 检查：$4 - 2 = 2\ \text{A}$，可 $i_3(0^+)$ 明明是 4 A。`,
                },
                {
                  text: R`$i_3(t) = 2 + 2e^{-t}\ \text{A}$`,
                  correct: true,
                  feedback: R`太漂亮了！$[36 - (24 - 12e^{-t})]/6 = 2 + 2e^{-t}\ \text{A}$：用三要素直接写出的 $i_3(t)$ 与通过 $v_C(t)$ 反推的结果逐项吻合，这就是工程验算的底气。`,
                },
                {
                  text: R`$i_3(t) = 2 + 2e^{-t/1.5}\ \text{A}$（电阻支路另用 $\tau = R_3 C = 1.5\ \text{s}$）`,
                  correct: false,
                  feedback: R`同一阶电路里所有支路共享完全相同的时间常数 $\tau = 1\ \text{s}$。用三要素直接写出的 $i_3(t)$ 与通过 $v_C(t)$ 反推的结果逐项吻合，这就是工程验算的底气。`,
                },
              ],
              board: [R`i_3(t) = 2 + 2e^{-t}\ \text{A}\quad (t \ge 0),`, R`i_C(t) = C\frac{dv_C}{dt} = 3e^{-t}\ \text{A}`],
              halo: ['i3', 'ic75'],
              params: { sch: 'rc75', st: 'inf', ex75: 4 },
              layer: L1,
            },
          ],
          conclusion: R`五步通关：$v_C(0^+) = 12\ \text{V}$，$R_{\text{th}} = 4\ \Omega$、$\tau = 1\ \text{s}$，$v_C(t) = 24 - 12e^{-t}\ \text{V}$，$i_3$ 在换路瞬间从 2 A 跳到 4 A，$i_3(t) = 2 + 2e^{-t}\ \text{A}$。左侧 01 层的数值已经揭晓（切换 0⁻ / 0⁺ / ∞ 看看），03 层「7.5 例题 ×1000 缩放」套件也已解锁。下面的通关复盘把第三幕这道题的板书完整写一遍。`,
        },
        { kind: 'p', text: '**通关复盘 · Sadiku 7.5 三段式推导 ③（Python SymPy 全程验算）**' },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简（Python SymPy 全程验算）',
          steps: [
            {
              label: R`1. **求 $t = 0^-$ 初值**：`,
              tex: R`v_C(0^-) = 18 \times \frac{6}{3 + 6} = 12\ \text{V}`,
            },
            { label: R`此时 $B$ 侧独立构成回路`, text: R`$i_3(0^-) = \frac{36}{6 + 12} = 2\ \text{A}$，$i_C(0^-) = 0\ \text{A}$。` },
            {
              label: R`2. **求 $t > 0$ 戴维南参数与 $\tau$**：`,
              tex: R`\begin{gathered} R_{\text{th}} = \frac{6 \times 12}{6 + 12} = 4\ \Omega, \qquad V_{\text{th}} = 36 \times \frac{12}{6 + 12} = 24\ \text{V} \\[2pt] \tau = R_{\text{th}} C = 4 \times 0.25 = 1\ \text{s} \end{gathered}`,
            },
            {
              label: R`3. **写出状态变量 $v_C(t)$**`,
              text: R`由连续性得 $v_C(0^+) = v_C(0^-) = 12\ \text{V}$，稳态值 $v_C(\infty) = V_{\text{th}} = 24\ \text{V}$：`,
              tex: R`v_C(t) = 24 + (12 - 24)e^{-t/1} = 24 - 12e^{-t}\ \text{V}, \quad t \ge 0`,
            },
            {
              label: R`4. **现算非状态变量 $i_3(0^+)$ 并写出 $i_3(t)$（关键陷阱拆解！）**`,
              text: R`在 $t = 0^+$ 瞬间，$C$ 钳位在 $12\ \text{V}$：`,
              tex: R`i_3(0^+) = \frac{36 - 12}{6} = 4\ \text{A} \neq i_3(0^-) = 2\ \text{A}`,
            },
            { label: R`在 $t = \infty$ 稳态，$v_C(\infty) = 24\ \text{V}$：`, tex: R`i_3(\infty) = \frac{36 - 24}{6} = 2\ \text{A}` },
            { label: '代入三要素通解：', tex: R`i_3(t) = 2 + (4 - 2)e^{-t} = 2 + 2e^{-t}\ \text{A}, \quad t \ge 0` },
            {
              label: '**陷阱警示**',
              text: R`如果某位同学错误地把 $i_3(0^-) = 2\ \text{A}$ 当成 $i_3(0^+)$，代入后会算出 $i_3(t) = 2 + (2 - 2)e^{-t} = 2\ \text{A}$ 的荒谬常数，完全丢失了换路瞬间高达 $+2\ \text{A}$ 的浪涌电流！`,
            },
            {
              label: R`5. **用 KCL 与微积分双路径校验 $i_C(t)$**`,
              text: R`微分法：$i_C(t) = C\frac{dv_C}{dt} = 0.25 \times 12e^{-t} = 3e^{-t}\ \text{A}$（从 $0\ \text{A}$ 突变到 $3\ \text{A}$）；KCL 法：$i_4(t) = \frac{v_C(t)}{12} = 2 - e^{-t}\ \text{A} \implies i_3(t) - i_4(t) = (2 + 2e^{-t}) - (2 - e^{-t}) = 3e^{-t}\ \text{A}$。两法完全一致，SymPy ${code('dsolve')} 残差为 ${code('0')}！`,
            },
          ],
        },
        { kind: 'figure', svg: SVG_FIG3, caption: '3.2 RC 三要素综合例题原理图与 0⁻ / 0⁺ / ∞ 三态对照（完整数值）' },
        {
          kind: 'p',
          text: R`**理论低阻电路的 $1000\times$ 安全缩放**（第五幕 5.1 第 1 条）：在第三幕的理论例题中，$R_1 = 3\ \Omega, R_2 = 6\ \Omega, R_3 = 6\ \Omega, R_4 = 12\ \Omega$，若直接按此阻值接上 $36\ \text{V}$ 电源，支路电流高达 $4\ \text{A}$，瞬间功率近百瓦，普通 $1/4\ \text{W}$ 面包板电阻会在 $0.1\ \text{s}$ 内冒烟烧断。因此在 3D 面包板实操层中，我们将全部电阻按 [[scale_note|**$1000\times$**]] 缩放至 $3\ \text{k}\Omega, 6\ \text{k}\Omega, 12\ \text{k}\Omega$，并将电容按 **$1/1000$** 缩放至 $250\ \mu\text{F}$——时间常数 $\tau = R_{\text{th}}C = 4\ \text{k}\Omega \times 250\ \mu\text{F} = 1.0\ \text{s}$ 完全不变，而最大电流骤降至安全的 $4\ \text{mA}$！`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 03 层选「7.5 例题 ×1000 缩放」：[[psu75|台式可调直流电源（18 V / 36 V）]]给两侧网络供电，CH1 钩 $V_2$ 端、CH2 钩节点 B、双黑夹同接 GND，${code('MATH')} = CH1 − CH2 = $v_{R3} = 6\ \text{k}\Omega \cdot i_3$。把开关从 A 拨到 B：MATH 从 $12\ \text{V}$ 一步跳到 $24\ \text{V}$（$i_3$：$2 \to 4\ \text{mA}$），再按 $\tau = 1\ \text{s}$ 落回 $12\ \text{V}$；$R_3$ 的峰值功耗 $(4\ \text{mA})^2 \times 6\ \text{k}\Omega = 96\ \text{mW}$，仍在 $1/4\ \text{W}$ 以内。`,
        },
        {
          kind: 'p',
          text: '**6.3 诊断测验**：以下 4 道题覆盖本课的核心概念——Boylestad 充电曲线与时间常数实测、三要素通解与非状态变量 0⁺ 突变陷阱、一阶 RL 阶跃响应与反电动势、示波器探头共地防短路安全。四题全部答对即通关本课。',
        },
      ],
      quiz: [
        {
          id: 'w4l5_q1',
          question: R`在面包板上用 5 V 直流电源通过 $R = 10\ \text{k}\Omega$ 电阻给完全放电的 $C = 100\ \mu\text{F}$ 电容充电。示波器在开关合上后 $t = 1.0\ \text{s}$ 时刻测得的电容电压最接近以下哪个数值？`,
          options: [
            {
              key: 'A',
              text: '2.50 V (50.0%)',
              correct: false,
              feedback: R`50% 是“走一半”的直觉，但指数充电在 $1\tau$ 时已走完 $1 - e^{-1} \approx 63.2\%$；升到 2.50 V 只需 $t = \tau \ln 2 \approx 0.69\ \text{s}$。`,
            },
            {
              key: 'B',
              text: '4.32 V (86.5%)',
              correct: false,
              feedback: R`4.32 V（86.5%）是 $2\tau$ 时的读数。先算 $\tau = RC = 10\ \text{k}\Omega \times 100\ \mu\text{F} = 1.0\ \text{s}$：$t = 1.0\ \text{s}$ 只是 $1\tau$。`,
            },
            { key: 'C', text: '3.16 V (63.2%)', correct: true },
            {
              key: 'D',
              text: '4.97 V (99.3%)',
              correct: false,
              feedback: R`99.3% 是 $5\tau = 5\ \text{s}$ 时的工程“充满”点；$t = 1.0\ \text{s}$ 时电容才走完第一个时间常数，离稳态还差 36.8%。`,
            },
          ],
          feedback_correct: R`时间常数 $\tau = RC = 10\ \text{k}\Omega \times 100\ \mu\text{F} = 1.0\ \text{s}$。在 $t = 1\tau$ 时，零状态充电电压达到稳态值的 $1 - e^{-1} \approx 63.21\%$，即 $5 \times 0.6321 \approx 3.16\ \text{V}$。`,
          feedback_wrong: R`先求 $\tau = RC$，再看 $t = 1.0\ \text{s}$ 是几个 $\tau$，最后代入 $1 - e^{-t/\tau}$。`,
          figure: SVG_Q1,
          sync: { layer: L1, params: { sch: 'step', st: '0m' } },
        },
        {
          id: 'w4l5_q2',
          question: R`在一个含开关的一阶 RC 电路中，已知某电阻支路电流在换路前稳态值 $i_R(0^-) = 2\ \text{A}$，换路后稳态值 $i_R(\infty) = 2\ \text{A}$，而电容在 $t = 0^+$ 瞬间钳位导致该电阻两端压差骤增。关于直接应用三要素通解求 $i_R(t)$ $(t \ge 0)$，以下哪项判断正确？`,
          options: [
            {
              key: 'A',
              text: R`三要素通解仍然适用，但必须先在 $t = 0^+$ 等效电路（电容换恒压源 $v_C(0^+)$）中现算 $i_R(0^+)$，不可照搬 $i_R(0^-)$`,
              correct: true,
            },
            {
              key: 'B',
              text: R`因为 $i_R(0^-) = i_R(\infty) = 2\ \text{A}$，所以 $i_R(t)$ 恒等于 2 A 无暂态过程`,
              correct: false,
              feedback: R`这正是三要素的头号陷阱：$i_R(0^-)$ 不是 $i_R(0^+)$。电阻电流不是状态变量，换路瞬间可以跳变；题目说电容钳位让电阻压差骤增，$i_R(0^+) \ne 2\ \text{A}$，暂态照样存在（Sadiku 7.5 里就是 2 A → 4 A → 2 A）。`,
            },
            {
              key: 'C',
              text: R`三要素通解只适用于 $v_C(t)$ 和 $i_L(t)$，不能用于电阻电流 $i_R(t)$`,
              correct: false,
              feedback: R`三要素通解对一阶线性电路中任意支路的电压、电流都成立；受限制的只是“谁连续”——只有 $v_C$、$i_L$ 满足 $x(0^+) = x(0^-)$，其他变量的初值要在 0⁺ 等效电路里现算。`,
            },
            {
              key: 'D',
              text: '电阻电流的时间常数与电容电压的时间常数不同，需重新列写二阶方程',
              correct: false,
              feedback: R`一阶电路只有一个独立储能元件，所有支路共享同一个 $\tau = R_{\text{th}} C$；电阻电流只是 $v_C$ 的线性组合（如 $i_3 = (36 - v_C)/6$），用不着二阶方程。`,
            },
          ],
          feedback_correct: R`三要素通解适用于一阶线性电路中的任意支路电压或电流，且所有变量共享同一时间常数 $\tau$；但只有状态变量 $v_C$ 和 $i_L$ 连续，非状态变量 $i_R$ 允许在 $t = 0^+$ 突变，必须在 $0^+$ 等效电路中现算 $i_R(0^+)$。`,
          feedback_wrong: R`分清两件事：三要素公式对谁适用？哪些变量在 $0^-$ 到 $0^+$ 之间保持连续？`,
          figure: SVG_Q2,
          sync: { layer: L1, params: { sch: 'rc75', st: '0m' } },
        },
        {
          id: 'w4l5_q3',
          question: R`在第四幕的 RL 电路中，$L = 2\ \text{H}$，换路后从电感端口看入的戴维南等效电阻 $R_{\text{th}} = 4\ \Omega$，电感电流由 $i_L(0^-) = 6\ \text{A}$ 过渡至新稳态 $i_L(\infty) = 3\ \text{A}$。则该电路的时间常数 $\tau$ 以及换路瞬间电感电压 $v_L(0^+)$ 分别为：`,
          options: [
            {
              key: 'A',
              text: R`$\tau = 8\ \text{s}$，$v_L(0^+) = 0\ \text{V}$`,
              correct: false,
              feedback: R`$\tau = L \cdot R_{\text{th}} = 8\ \text{s}$ 把公式乘反了：RL 电路是 $\tau = L / R_{\text{th}} = 2/4 = 0.5\ \text{s}$。而且 $v_L(0^+)$ 也不是 0——0 V 是换路前直流稳态的电感电压。`,
            },
            {
              key: 'B',
              text: R`$\tau = 0.5\ \text{s}$，$v_L(0^+) = 0\ \text{V}$`,
              correct: false,
              feedback: R`$\tau$ 算对了，但 $v_L(0^+) = 0$ 照搬了 $0^-$ 的值。电感电压是非状态变量，换路瞬间会跳：$i_L(t) = 3 + 3e^{-2t}\ \text{A}$ 在 $0^+$ 的斜率不为零，$v_L = L\,di_L/dt$ 也就不为零。`,
            },
            {
              key: 'C',
              text: R`$\tau = 2\ \text{s}$，$v_L(0^+) = +12\ \text{V}$`,
              correct: false,
              feedback: R`$\tau = 2\ \text{s}$ 把 $L$ 的数值直接当成了时间常数；$+12\ \text{V}$ 的符号也反了：电流从 6 A 往 3 A 下降，$di_L/dt < 0$，$v_L = L\,di_L/dt$ 必然为负（电感拼命维持旧电流，上端被拉低）。`,
            },
            { key: 'D', text: R`$\tau = 0.5\ \text{s}$，$v_L(0^+) = -12\ \text{V}$`, correct: true },
          ],
          feedback_correct: R`RL 电路时间常数 $\tau = L / R_{\text{th}} = 2 / 4 = 0.5\ \text{s}$。因为 $i_L(t) = 3 + 3e^{-2t}\ \text{A}$，所以 $v_L(t) = L\,\frac{di_L}{dt} = 2 \times (-6e^{-2t}) = -12e^{-2t}\ \text{V}$，在 $t = 0^+$ 发生由 0 V 跳变至 −12 V 的感性反电动势。`,
          feedback_wrong: R`两步走：RL 电路的 $\tau$ 是 $L$ 与 $R_{\text{th}}$ 怎样组合？再写出 $i_L(t)$，用 $v_L = L\,di_L/dt$ 求 $0^+$ 的值。`,
          figure: SVG_Q3,
          sync: { layer: L1, params: { sch: 'rl76', st: '0m' } },
        },
        {
          id: 'w4l5_q4',
          question: R`在面包板实测 5 V 电源串联 10 kΩ 电阻 R 与 100 μF 接地电容 C 的充电过程时，如果你想用台式示波器观察悬浮电阻 R 两端的电压波形 $v_R(t)$，以下哪种接线方式是绝对安全且正确的？`,
          options: [
            {
              key: 'A',
              text: '将 CH1 探头红钩夹在 5 V 电源正极，黑色鳄鱼夹直接夹在 R 与 C 之间的节点',
              correct: false,
              feedback: '黑色鳄鱼夹经 BNC 外壳直通市电 PE，而电源负极也接 PE：夹在 R–C 节点，等于用一根导线把这个节点接到 GND——电容被旁路、波形失真，这正是第五幕的“致命错误”。',
            },
            {
              key: 'B',
              text: '将 CH1 红钩接 5 V 端，CH2 红钩接 R 与 C 节点，两个探头的黑色鳄鱼夹全部夹在蓝色公共 GND 轨，并在示波器开启 MATH (CH1 - CH2)',
              correct: true,
            },
            {
              key: 'C',
              text: '拔掉示波器三脚电源插头的接地脚，然后把黑色鳄鱼夹随意夹在悬浮节点上',
              correct: false,
              feedback: '拔掉接地脚（“浮地”示波器）会让仪器外壳失去保护接地：一旦漏电，外壳和所有 BNC 都可能带上危险电压，有触电风险，绝对禁止。',
            },
            {
              key: 'D',
              text: '将两个探头的黑色鳄鱼夹分别夹在 R 的左端和右端以实现双端浮地测量',
              correct: false,
              feedback: '两个黑夹在示波器内部是连在一起的（都接 PE）：分别夹在 R 两端，等于用地线把 R 直接短路，同时把两端都拉到地，非但测不到 v_R，还制造了两条短路回路。',
            },
          ],
          feedback_correct:
            '台式示波器探头黑色鳄鱼夹直接连着市电保护地 PE。选项 A 和 D 会通过 PE 大地把悬浮节点直接短路到电源负极 GND；选项 C 破坏设备安全接地极度危险（触电风险）。正确做法是双通道黑夹同接 GND，用 MATH 通道 CH1 - CH2 差分显示 vR(t)。',
          feedback_wrong: '先想清楚：示波器的黑夹在仪器内部接到了哪里？电源负极又接到了哪里？',
          figure: SVG_Q4,
          sync: { layer: L3, params: { kit: 'rc', cam: 'clip' } },
        },
      ],
    },
  ],
};

export default W4_L5;
