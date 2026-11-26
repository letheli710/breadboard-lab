// W3-L4 · 同相放大器与电压跟随器（缓冲隔离与面包板实测） (lesson sheet: docs/lessons/W3-L4.md).
// The professor's text of the five acts is reproduced from the sheet as written; [[id|…]] only
// links a term to the stage (the words are unchanged). Changes of form, none of wording:
// - the sheet's sub-headings (教授板书 …, 对比计算 …) are bold lines; a figure sits where the sheet
//   puts it (`figure`) or closes the act (`inline_svg`); display formulas sit in the ①/②/③ cards
//   (a lead-in sentence becomes the card title; the numbered ① items run as one paragraph); the
//   sheet's italic asides are tip notes;
// - plain-text symbols of the JSON parts (v_−, R_f, i_1 …) are set as TeX;
// - anti-spoiler: act 4 is Sadiku Example 5.5, and so is the guided example. Act 4 keeps the
//   circuit, ① and ②; its ③ calculation and the superposition cross-check move behind the guided
//   block as the 「通关复盘」 board. Figure 4-1's "v_− = 4 V" reads "v_− = ?", and the stage hides the
//   example's numbers (params `ex55` = how far the guided example has got; `done_params` uncovers
//   them);
// - dev-facing text is left out: "（2D 可复制内联 SVG）" in the figure titles, "交互引擎 JSON" / "通关
//   JSON" in the headings, the YAML keys, and the closing "Claude 工程落地清单" (its stage spec is
//   what the three layers build).
// Added: the safety capsule at the top of act 1 and the safety checks in act 5 (from the sheet's
// breadboard_safety_and_scaling block; Pin 8 is top-LEFT and Pin 4 bottom-RIGHT with the notch on
// the left — the sheet had them swapped), a tip in act 5 that the +7.5 V ceiling is the same on
// ±9 V, the 3D board's wiring table, the guided example's step titles, praise lines and
// conclusion, the quiz figures and per-option feedback (written from the sheet's explanations),
// and a mixed answer order in the quiz (the sheet's right answers are B, B, C, A).

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import type { StageLesson, StageSync } from '../../types';
import {
  MINI_STEP1,
  MINI_STEP2,
  MINI_STEP3,
  MINI_STEP4,
  MINI_STEP5,
  SVG_FIG11,
  SVG_FIG21,
  SVG_FIG31,
  SVG_FIG32,
  SVG_FIG41,
  SVG_FIG51,
  SVG_Q1,
  SVG_Q2,
  SVG_Q3,
  SVG_Q4,
  SVG_QUIZ_ACT,
} from './svgs';

const Schematic = lazy(() => import('./Schematic'));
const BufferBench = lazy(() => import('./BufferBench'));
const Bench3D = lazy(() => import('./Bench3D'));

const R = String.raw;
/** inline code inside String.raw text */
const code = (s: string) => '`' + s + '`';

const L1 = 'schematic';
const L2 = 'buffer';
const L3 = 'bench3d';

/** layer 01 set-up: the act-2 values (every act sets all of it, so scrolling back restores it) */
const ni = (p: Record<string, unknown> = {}): StageSync['params'] => ({ sch: 'ni', r1: 10e3, rf: 20e3, vi: 1.5, divider: false, supply: 'dual', ...p });
/** layer 01 on Example 5.5 with `reveal` values found */
const ex = (reveal: number): StageSync['params'] => ({ sch: 'ex55', divider: false, supply: 'dual', ex55: reveal });

const PIN = (n: number, name: string, zh: string, hole: string) => ({ label: `LM358 Pin ${n}（${name}）`, desc: `${zh}；本课面包板上插在 ${hole}` });

const W3_L4: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Schematic, [L2]: BufferBench, [L3]: Bench3D },
  describeTarget: genericLabel,
  lesson_meta: {
    lesson_id: 'W3-L4',
    world: 'World 3',
    title: '同相放大器与电压跟随器（缓冲隔离与面包板实测）',
    subtitle: '从分压负反馈到无穷大输入阻抗：用 LM358 破解高内阻传感器的带载塌陷',
    lesson_type: 'C',
    lesson_type_label: 'Type C（经典拓扑 + 3D 面包板实测课）',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Alexander, Sadiku & Fredette, Fundamentals of Electric Circuits, 2026 Release',
      sections: ['Section 5.5 Noninverting Amplifier（p. 181–183）'],
    },
    prerequisites: ['W1-L7 分压定律', 'W2-L7 戴维南等效', 'W3-L2 虚断与虚短', 'W3-L3 反相放大器'],
    learning_objectives: [
      '能独立运用虚断与虚短公理，通过 KCL 或分压器双视角完成同相放大器三段式符号推导',
      R`能清晰对比同相放大器与反相放大器在输入电阻、极性与增益范围（$A_v \ge 1$）上的核心工程差异`,
      '能用戴维南等效量化高内阻传感器的带载电压塌陷，并阐明电压跟随器实现阻抗隔离的物理能量来源',
      '能熟练求解 Sadiku Example 5.5（含节点输出电压与各支路电流），并在 LM358 面包板上完成接线实测与单/双电源饱和排查',
    ],
    next_lesson: 'W3-L5',
    next_lesson_title: '反相加法器：Summing Amplifier 与音频混音直觉',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 同相放大原理图',
        short: '01 同相原理图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '01 2D 同相放大与分压反馈原理图：拖动 R_1、R_f、v_i，实时看 A_v = 1 + R_f/R_1、理想 v_o 与 LM358 在 ±9 V / 单 +9 V 下的真实 v_o；「分压链高亮」点亮 v_o → R_f → v− → R_1 → GND，也可切到 Example 5.5 双源电路。',
      },
      {
        id: L2,
        label: '02 带载塌陷 vs 跟随器',
        short: '02 带载对比',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 带载塌陷 vs 电压跟随器隔离对比台：传感器 V_Th = 5 V、R_Th = 10 kΩ，对数滑块调负载 R_L（100 Ω – 100 kΩ），切换直连 / 插入电压跟随器，看 v_L、传感器电流、负载电流与功率。',
      },
      {
        id: L3,
        label: '03 3D LM358 面包板',
        short: '03 3D 面包板',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption:
          '03 3D LM358 面包板实测：台式可调直流电源（±9 V）经导线给 LM358 供电，三套一键接线（同相放大 A_v = 3、电压跟随器、Example 5.5），万用表红表笔可点 v_o、v+、v−；可切换单 +9 V 看饱和削顶。',
      },
    ],
    hover_map: {
      vi: { label: '输入 v_i（同相端 +）', desc: '信号直接接运放同相输入端：虚断 i+ = 0，信号源一滴电流都不出，v+ = v_i；面包板上接 LM358 Pin 3' },
      iplus: { label: '虚断 i+ = 0', desc: '理想运放同相端不取电流：输入电阻 R_in → ∞，高内阻传感器不会被“抽血”' },
      iminus: { label: '虚断 i− = 0', desc: '反相端也不取电流：流进 v− 节点的电流只能全部经 R_f 流走（i_1 = i_f）' },
      vminus: {
        label: '反相端 v−（分压抽头）',
        desc: '负反馈 + 虚短：v− = v+；它同时是 R_f–R_1 分压链的抽头，v− = R_1/(R_1 + R_f) · v_o；面包板上是 Pin 2（橙色跳线引到第 25 列）',
      },
      r1: { label: '接地电阻 R_1', desc: '同相放大器里接在 v− 与地之间（本课 10 kΩ 棕-黑-橙-金）；Example 5.5 里是 6 V 源与 v− 之间的 4 kΩ（面包板用两颗 2 kΩ 串联）' },
      rf: { label: '反馈电阻 R_f', desc: '跨接输出与反相端（本课 20 kΩ 红-黑-橙-金；Example 5.5 为 10 kΩ）；R_f = 0 即短接线 → 电压跟随器' },
      divider: { label: 'R_f–R_1 分压链', desc: '因 i− = 0，R_f 与 R_1 是一条无载串联分压器：v_o 在顶端、GND 在底端、v− 是抽头；运放调节 v_o 直到抽头电压等于 v_i' },
      vo: { label: '输出 v_o', desc: 'v_o = (1 + R_f/R_1) v_i；LM358 不是轨到轨，+9 V 供电时最高约 +7.5 V；面包板上是 Pin 1（运放 A）或 Pin 7（运放 B）' },
      ifb: { label: '反馈电流 i_f', desc: '流过 R_f 的电流；同相放大器中 i_f = i_1 = v_i/R_1（本课 0.15 mA）' },
      opamp: { label: '运放（LM358 的运放 A）', desc: '高增益差分放大级：在负反馈下不断调节 v_o，直到 v− = v+（虚短）' },
      av: { label: '闭环增益 A_v', desc: 'A_v = 1 + R_f/R_1 ≥ 1：只能放大或 1:1 跟随，不能衰减' },
      sat: { label: '线性窗口与饱和', desc: '±9 V：约 [−7.5 V, +7.5 V]；单 +9 V：约 [+0.02 V, +7.5 V]；超出就削顶 / 削底，虚短失效（v− ≠ v+）' },
      psu: {
        label: '台式可调直流电源（±9 V）',
        desc: '运放的电源：+ 接顶部红轨（+9 V），COM 接 GND，− 接底部蓝轨（−9 V）。单 +9 V 时只用 + 路，Pin 4 改接 GND',
      },
      sig_psu: { label: '台式可调直流电源（信号源）', desc: '第二台台式电源，给出输入信号：v_i（1.5 V 可调）、传感器的 5 V，或 Example 5.5 的 6 V 与 4 V；COM 接 GND' },
      vs1: { label: '电压源 V_s1 = 6 V', desc: 'Example 5.5：经 R_1 = 4 kΩ 接反相端' },
      vs2: { label: '电压源 V_s2 = 4 V', desc: 'Example 5.5：直接接同相端，虚短把 v− 也定在这个电位' },
      i1: { label: '输入支路电流 i_1', desc: 'Example 5.5：流过 R_1、从 6 V 源流向节点 v− 的电流，i_1 = (V_s1 − v−)/R_1' },
      buffer: { label: '电压跟随器（单位增益缓冲器）', desc: 'R_f = 0、R_1 开路的同相放大器：v_o = v_i，输入电阻 → ∞、输出电阻 → 0，实现阻抗隔离' },
      vth: { label: '传感器开路电压 V_Th', desc: '高内阻传感器的戴维南等效：V_Th = 5.00 V（面包板上由信号源的 5 V 模拟）' },
      rth: { label: '传感器内阻 R_Th', desc: 'R_Th = 10 kΩ（棕-黑-橙-金）：直连 1 kΩ 负载时，4.545 V 被它吃掉' },
      rl: { label: '负载 R_L', desc: '对比台默认 1 kΩ（对数滑块 100 Ω – 100 kΩ）；面包板上是 1 kΩ 棕-黑-红-金，经跟随器接 Pin 7，“直连”时改插传感器节点' },
      vl: { label: '负载电压 v_L', desc: '直连：v_L = R_L/(R_Th + R_L) · V_Th（1 kΩ 时 0.455 V）；插入跟随器：v_L = V_Th = 5.00 V' },
      isrc: { label: '传感器输出电流', desc: '直连时传感器自己供负载电流（1 kΩ 时 0.455 mA）；插入跟随器后 i+ = 0，传感器零电流' },
      il: { label: '负载电流 i_L', desc: '插入跟随器后 i_L = V_Th/R_L（1 kΩ 时 5.00 mA），由运放从 ±9 V 电源轨送出' },
      pl: { label: '负载功率 P_L', desc: '1 kΩ 时直连约 0.207 mW，插入跟随器 25.00 mW，是直连的 121 倍' },
      ratio: { label: '功率倍数', desc: '跟随器 / 直连的负载功率之比 = ((R_Th + R_L)/R_L)²，1 kΩ 时为 11² = 121' },
      rails: { label: '±9 V 电源轨', desc: '跟随器送给负载的电流来自运放的电源轨（Pin 8 / Pin 4），不是传感器；LM358 可靠输出约 20 mA，R_L < 250 Ω 时限流' },
      chip_lm358: { label: 'LM358N 双运放（DIP-8）', desc: '缺口朝左骑跨中央凹槽：Pin 1–4 在 f 行（左 → 右），Pin 8–5 在 e 行；一片芯片里有运放 A（1–2–3）与运放 B（5–6–7）' },
      chip_lm358_p1: PIN(1, 'OUT A', '运放 A 输出 v_o', 'f28'),
      chip_lm358_p2: PIN(2, 'IN− A', '运放 A 反相输入 v−', 'f29'),
      chip_lm358_p3: PIN(3, 'IN+ A', '运放 A 同相输入 v+', 'f30'),
      chip_lm358_p4: PIN(4, 'V− / GND', '负电源：±9 V 时接 −9 V，单电源时接 GND', 'f31'),
      chip_lm358_p5: PIN(5, 'IN+ B', '运放 B 同相输入（跟随器的输入）', 'e31'),
      chip_lm358_p6: PIN(6, 'IN− B', '运放 B 反相输入（跳线接 Pin 7）', 'e30'),
      chip_lm358_p7: PIN(7, 'OUT B', '运放 B 输出（跟随器的输出）', 'e29'),
      chip_lm358_p8: PIN(8, 'V+', '正电源 +9 V', 'e28'),
      jump_67: { label: 'Pin 6–Pin 7 短接线（橙色）', desc: '电压跟随器的 100% 负反馈：输出直接接回反相端（d29–d30）' },
      dmm: { label: '万用表（DC V 档）', desc: '黑表笔接 GND 轨，红表笔点输出、Pin 3（v+）或 Pin 2（v−）：v+ 与 v− 差几毫伏以上 = 开环或已饱和' },
      rail_p9: { label: '+9 V 电源轨', desc: '顶部红色轨，接台式电源 +；红色跳线送到 Pin 8' },
      rail_gnd: { label: 'GND 公共地', desc: '顶部蓝色轨与底部红色轨，接台式电源 COM（±9 V 的中点）' },
      rail_m9: { label: '−9 V 电源轨', desc: '底部蓝色轨，接台式电源 −；蓝色跳线送到 Pin 4（单 +9 V 时 Pin 4 改接 GND）' },
      center_trench: { label: '中央凹槽（Center Ravine）', desc: 'e 行与 f 行之间绝缘：DIP-8 芯片骑跨在上面，两排引脚互不相通' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '痛点引入与拓扑登场——当信号源怕“被抽血”时，反相放大器为什么会翻车？',
      sync: { layer: L1, halo: ['vi', 'iplus', 'opamp'], params: ni() },
      blocks: [
        {
          kind: 'note',
          tone: 'warn',
          text: R`[[psu|**面包板安全与供电**]]：实测芯片 [[chip_lm358|LM358N]]（双运算放大器，DIP-8 封装）。推荐 $\pm 9\text{ V}$ 双电源（台式可调直流电源（±9 V）两路串联，中点 COM 接公共地 GND），也可单 $+9\text{ V}$ 供电（Pin 8 接 $+9\text{ V}$，Pin 4 接 GND；仅支持正极性输入，实测上轨饱和约 $+7.5\text{ V}$，下轨接近 $+0.02\text{ V}$）。[[sat|线性输出窗口]]：双电源 $[-7.5\text{ V}, +7.5\text{ V}]$，单电源 $[+0.02\text{ V}, +7.5\text{ V}]$。**本课无需阻抗缩放**：标准同相放大器（$R_1 = 10\text{ k}\Omega$, $R_f = 20\text{ k}\Omega$）、缓冲对比台（$R_{Th} = 10\text{ k}\Omega$, $R_L = 1\text{ k}\Omega$）及 Sadiku Example 5.5（$4\text{ k}\Omega$, $10\text{ k}\Omega$）所用电阻均为 $\text{k}\Omega$ 级，各支路工作电流处于 $0.15\text{ mA}$ 至 $5.00\text{ mA}$ 区间，远低于 LM358 输出电流限幅（典型 20–40 mA）及 1/4 W 电阻额定功耗（250 mW），无需阻抗缩放。`,
        },
        { kind: 'p', text: '同学们，欢迎回到 Breadboard Lab 的实验台。' },
        {
          kind: 'p',
          text: R`上一讲（${code('W3-L3')}）我们亲手搭出了运放家族的第一号明星——**反相放大器**，它的闭环增益 $A_v = -R_f / R_1$ 干净利落，既能放大又能衰减。但今天我要先给你泼一盆冷水：在真实的硬件系统里，如果你手里握着一只**高内阻传感器**（比如压电麦克风、pH 电极、高阻热敏电桥，戴维南内阻 $R_{Th}$ 动辄 $10\text{ k}\Omega$ 甚至几兆欧），直接往反相放大器里一插，信号往往瞬间“腰斩”！`,
        },
        {
          kind: 'p',
          text: R`为什么？回想一下 ${code('W3-L3')} 的“虚地”结论：反相放大器的反相端 $v_- = 0\text{ V}$，输入信号 $v_i$ 必须隔着电阻 $R_1$ 直接对地灌电流，所以反相放大器的输入电阻就是 $R_{in} = R_1$。只要你的传感器内阻 $R_{Th}$ 跟 $R_1$ 差不多大，传感器就会在自己的内阻上产生剧烈分压——用工程黑话讲，反相放大器太爱从前级“抽血”了。更麻烦的是，很多单电源传感器（例如 $0 \sim 3\text{ V}$ 的温度计）我们根本不想把它倒扣成负电压。`,
        },
        { kind: 'p', text: '那怎么破局？把输入信号换个门进！' },
        {
          kind: 'p',
          text: R`与其把 $v_i$ 塞进需要靠电阻拉扯的反相端，不如直接把 $v_i$ 送到运放的[[vi|**同相输入端（$+$ 端）**]]！因为理想运放的同相端满足[[iplus|**虚断（$i_+ = 0$）**]]，信号源连着一堵近乎无穷大的绝缘墙，**一滴电流都不会被抽走**。与此同时，我们依然保留反相端的负反馈网络（[[rf|$R_f$]] 跨接输出与反相端，[[r1|$R_1$]] 将反相端接地），让运放乖乖工作在线性区。这就是今天的主角——**同相放大器（Noninverting Amplifier）**。`,
        },
      ],
      inline_svg: SVG_FIG11,
      figure_caption: '图 1-1：同相放大器标准拓扑与虚短/虚断标注',
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: R`三段式板书推导与分压反馈解剖——为什么增益永远 $\ge 1$？`,
      sync: { layer: L1, halo: ['divider', 'vminus'], params: ni({ divider: true }) },
      blocks: [
        {
          kind: 'p',
          text: R`同学们，推导出同相放大器的公式其实有两种绝妙的视角：一种是稳扎稳打的**反相端 KCL 节点法**，另一种是一眼看穿本质的**分压器视角（联动 ${code('W1-L7 分压定律')}）**。`,
        },
        {
          kind: 'p',
          text: R`请先盯着图 2-1 看三秒钟：因为 $i_- = 0$（虚断），[[rf|反馈电阻 $R_f$]] 和[[r1|接地电阻 $R_1$]] 根本没有被运放分流，它们俩就是一条[[divider|**纯粹的串联电阻链**]]！顶端接在[[vo|输出端 $v_o$]]，底端接在 $0\text{ V}$ 地线，中间抽头就是[[vminus|反相端 $v_-$]]。运放内部的高增益差分级像一个极其执着的“伺服管家”，拼命调节输出 $v_o$，直到这个分压器抽头上的电压 $v_-$ 恰好等于你喂给同相端的 $v_i$！`,
        },
        { kind: 'figure', svg: SVG_FIG21, caption: '图 2-1：分压反馈视角解剖图' },
        { kind: 'p', text: '**教授板书：同相放大器三段式严谨推导**' },
        {
          kind: 'p',
          text: R`下面我们严格按 Breadboard Lab 的**三段式板书规范**，先用公理和纯符号推到底，再代入一组将在面包板上实测的参数（$R_1 = 10\text{ k}\Omega$，$R_f = 20\text{ k}\Omega$，$v_i = 1.5\text{ V}$）验证结果。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. **理想运放虚断公理**（${code('W3-L2')}）：流入两个输入端的电流恒为零，即 $i_+ = 0, \qquad i_- = 0$。　2. **理想运放虚短公理**（负反馈线性区成立）：两输入端电位相等，且输入电压直接加在同相端，即 $v_- = v_+ = v_i$。　3. **基尔霍夫电流定律（KCL）** 与 **欧姆定律**（节点 $v_-$ 处流出电流之和等于流入电流之和）。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式推导：对[[vminus|反相输入端节点 $v_-$]] 列写 KCL 方程（取流出节点方向为正）：`,
          tex: R`\frac{v_- - 0}{R_1} + \frac{v_- - v_o}{R_f} + i_- = 0`,
        },
        { kind: 'formula', title: R`代入[[iminus|虚断条件 $i_- = 0$]] 与虚短条件 $v_- = v_i$：`, tex: R`\frac{v_i}{R_1} + \frac{v_i - v_o}{R_f} = 0` },
        {
          kind: 'formula',
          title: R`移项整理，将含 $v_o$ 的项留在右侧：`,
          tex: R`\frac{v_o}{R_f} = \frac{v_i}{R_1} + \frac{v_i}{R_f} = v_i \left(\frac{1}{R_1} + \frac{1}{R_f}\right)`,
        },
        {
          kind: 'formula',
          title: R`两边同乘以 $R_f$，即得同相放大器的[[av|**纯符号闭环电压增益通式**]]：`,
          tex: R`\begin{gathered} v_o = \left(1 + \frac{R_f}{R_1}\right) v_i, \\[4pt] A_v = \frac{v_o}{v_i} = 1 + \frac{R_f}{R_1} \end{gathered}`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`（交叉印证分压器视角：因 $i_- = 0$，由 ${code('W1-L7')} [[divider|分压定律]]直接写出 $v_- = \frac{R_1}{R_1 + R_f} v_o$，令 $v_- = v_i$ 反解 $v_o$，瞬间得到完全一致的 $v_o = \frac{R_1 + R_f}{R_1} v_i = \left(1 + \frac{R_f}{R_1}\right) v_i$。）`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '已知',
              text: R`给定实验室标准实测参数：$R_1 = 10\text{ k}\Omega$，$R_f = 20\text{ k}\Omega$，输入信号 $v_i = 1.5\text{ V}$（电源采用 $\pm 9\text{ V}$ 双电源，线性区 $[-7.5\text{ V}, +7.5\text{ V}]$）`,
            },
            { label: R`1. **计算闭环电压增益 $A_v$**`, tex: R`A_v = 1 + \frac{20\text{ k}\Omega}{10\text{ k}\Omega} = 1 + 2 = 3` },
            { label: R`2. **计算输出电压 $v_o$**`, tex: R`v_o = 3 \times 1.5\text{ V} = 4.5\text{ V}` },
            {
              label: R`3. **检验线性区与反馈支路电流 $i_f$**`,
              text: R`[[sat|$|4.5\text{ V}| < 7.5\text{ V}$]]，运放稳稳工作在线性区；[[ifb|反馈支路电流]]为`,
              tex: R`\begin{aligned} i_f &= \frac{v_o - v_-}{R_f} = \frac{4.5\text{ V} - 1.5\text{ V}}{20\text{ k}\Omega} \\ &= \frac{3.0\text{ V}}{20\text{ k}\Omega} = 0.15\text{ mA} \end{aligned}`,
            },
            { label: '核对', text: R`与接地电阻电流 $i_1 = \frac{1.5\text{ V}}{10\text{ k}\Omega} = 0.15\text{ mA}$ 严格相等。` },
          ],
        },
        { kind: 'p', text: '**同相放大器的两大工程王牌（与反相放大器正面对比）**' },
        {
          kind: 'table',
          head: ['工程维度', R`反相放大器（${code('W3-L3')}）`, R`同相放大器（${code('W3-L4')}）`, '工程选型启示'],
          rows: [
            ['**闭环增益 $A_v$**', R`$-\dfrac{R_f}{R_1}$`, R`$1 + \dfrac{R_f}{R_1}$`, R`同相输出**不倒相**，但增益**永远 $\ge 1$**，无法直接做衰减器`],
            [R`**输入电阻 $R_{in}$**`, R`$R_{in} = R_1$（有限值）`, R`$R_{in} \to \infty$（理想无穷大）`, '**高内阻传感器首选同相结构**，避免前级分压塌陷'],
            [R`**反相端电位 $v_-$**`, R`虚地（$0\text{ V}$）`, R`跟随输入（$v_- = v_i$）`, '同相放大器存在共模输入电压，需留意芯片共模输入范围'],
            ['**单电源适配性**', '正输入出负压，必须双电源', R`正输入出正压，可单 $+9\text{ V}$ 运行`, R`单电源便携设备中同相结构极其常见（需防 $+7.5\text{ V}$ 削顶）`],
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '极限特例与阻抗隔离的威力——为什么我们需要增益为 1 的“电压跟随器”？',
      sync: { layer: L2, halo: ['rth', 'rl', 'vl'], params: { rl: 1000, buf: false } },
      blocks: [
        { kind: 'p', text: '现在我们把同相放大器推向一个极端。' },
        {
          kind: 'formula',
          title: R`请盯着公式 $A_v = 1 + \dfrac{R_f}{R_1}$ 思考：如果我把反馈电阻 $R_f$ 换成一根**零欧姆短接线**（$R_f = 0$），同时把接地电阻 $R_1$ 直接**拔掉开路**（$R_1 \to \infty$），会发生什么？`,
          tex: R`\begin{gathered} \lim_{\substack{R_f \to 0 \\ R_1 \to \infty}} \left(1 + \frac{R_f}{R_1}\right) = 1 + 0 = 1 \\[4pt] \implies v_o = v_i \end{gathered}`,
        },
        {
          kind: 'p',
          text: '这就是电路史上大名鼎鼎的[[buffer|**电压跟随器（Voltage Follower）**]]，也叫**单位增益缓冲器（Unity-Gain Buffer）**。',
        },
        { kind: 'figure', svg: SVG_FIG31, caption: '图 3-1：从同相放大器到电压跟随器的极限演变' },
        {
          kind: 'p',
          text: R`每届学生看到这里都会举手发问：“教授，输入 $5\text{ V}$、输出还是 $5\text{ V}$，增益只有 $1$，这不就相当于一根导线吗？花钱买块运放芯片插上去不是脱裤子放屁吗？”`,
        },
        {
          kind: 'p',
          text: '**绝不是！** 电压确实没放大，但它放大了**电流驱动能力**和**功率**，完成了电路设计中最关键的动作——[[buffer|**阻抗隔离（Buffer Isolation）**]]。',
        },
        { kind: 'p', text: R`让我们用 ${code('W2-L7 戴维南等效')} 做一场触目惊心的数值对比实验：` },
        { kind: 'p', text: '假设你有一个精密传感器（例如电桥或微弱电池源），其戴维南等效参数为：' },
        { kind: 'ul', items: [R`[[vth|开路电压 $V_{Th} = 5.00\text{ V}$]]`, R`[[rth|内阻 $R_{Th} = 10\text{ k}\Omega$]]`] },
        { kind: 'p', text: R`现在你想用它直接驱动一个 [[rl|$R_L = 1\text{ k}\Omega$]] 的后级负载（比如一块低阻模拟表头或功放输入级）。` },
        { kind: 'p', text: '**对比计算：直连塌陷 vs 电压跟随器隔离（三段式板书）**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`**情形 A（直接连接）**：$R_{Th}$ 与 $R_L$ 构成简单串联回路，遵循 ${code('W1-L7')} **分压定律** 与 **欧姆定律**。　**情形 B（插入电压跟随器）**：传感器接运放同相端，遵循**虚断（$i_+ = 0$）** 与 **虚短（$v_o = v_- = v_+$）**；负载电流由[[rails|运放的外部直流电源轨（$\pm 9\text{ V}$）]]提供。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：**直连负载电压与功率**`,
          tex: R`\begin{gathered} v_{L,\text{direct}} = \frac{R_L}{R_{Th} + R_L} V_{Th}, \\[4pt] P_{L,\text{direct}} = \frac{v_{L,\text{direct}}^2}{R_L} \end{gathered}`,
        },
        {
          kind: 'formula',
          title: R`**插入电压跟随器后的负载电压与功率**：因 [[isrc|$i_{\text{source}} = i_+ = 0$]]，内阻 $R_{Th}$ 上压降为零，故`,
          tex: R`\begin{gathered} v_+ = V_{Th} - i_+ R_{Th} = V_{Th} \\[2pt] \implies v_{L,\text{buf}} = v_o = V_{Th}, \\[4pt] i_{L,\text{buf}} = \frac{V_{Th}}{R_L}, \qquad P_{L,\text{buf}} = \frac{V_{Th}^2}{R_L} \end{gathered}`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（$V_{Th} = 5.00\text{ V}, R_{Th} = 10\text{ k}\Omega, R_L = 1\text{ k}\Omega$）`,
          steps: [
            {
              label: '**情形 A（直连惨案）**',
              tex: R`\begin{aligned} v_{L,\text{direct}} &= \frac{1\text{ k}\Omega}{10\text{ k}\Omega + 1\text{ k}\Omega} \times 5.00\text{ V} \\ &= \frac{1}{11} \times 5.00\text{ V} \approx 0.455\text{ V} \\[4pt] i_{L,\text{direct}} &= \frac{5.00\text{ V}}{11\text{ k}\Omega} \approx 0.455\text{ mA}, \\[4pt] P_{L,\text{direct}} &= \frac{(0.4545\text{ V})^2}{1\text{ k}\Omega} \approx 0.207\text{ mW} \end{aligned}`,
            },
            {
              label: '情形 A 结论',
              text: R`[[vl|电压从 $5.00\text{ V}$ **暴跌至 $0.455\text{ V}$**]]，高达 **90.9%** 的信号电压白白浪费在传感器自身内阻上！`,
            },
            {
              label: '**情形 B（插入电压跟随器后）**',
              tex: R`\begin{aligned} v_+ &= 5.00\text{ V} - 0 \times 10\text{ k}\Omega = 5.00\text{ V} \\ &\implies v_{L,\text{buf}} = 5.00\text{ V} \\[4pt] i_{L,\text{buf}} &= \frac{5.00\text{ V}}{1\text{ k}\Omega} = 5.00\text{ mA}, \\[4pt] P_{L,\text{buf}} &= \frac{(5.00\text{ V})^2}{1\text{ k}\Omega} = 25.00\text{ mW} \end{aligned}`,
            },
            {
              label: '情形 B 结论',
              text: R`负载稳稳拿到完整的 **$5.00\text{ V}$**，[[pl,ratio|负载得到的功率暴涨至直连时的 **121 倍**]]！而这 $5.00\text{ mA}$ 的电流并非凭空变出来的——它是由插在 LM358 Pin 8 / Pin 4 上的 [[rails|**$\pm 9\text{ V}$ 电源轨**]]（台式可调直流电源（±9 V）） 替传感器扛下来的。传感器只负责“报出 $5.00\text{ V}$ 的口令”，运放负责“出钱出力扛重活”！`,
            },
          ],
        },
        { kind: 'figure', svg: SVG_FIG32, caption: '图 3-2：直连塌陷（0.455 V）vs 电压跟随器隔离（5.00 V）对比图' },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**左侧舞台 Layer 2 互动提示**：在「${code('02 带载塌陷 vs 电压跟随器隔离对比台')}」中，把[[rl|负载 $R_L$]] 从 $100\text{ k}\Omega$ 一路往左拖到 $500\,\Omega$：直连曲线会像断崖一样跌到 $0.238\text{ V}$，而[[buffer|电压跟随器]]曲线纹丝不动地咬死在 $5.00\text{ V}$！`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 4: Sadiku Example 5.5 and the guided example */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '教材经典实战——Sadiku Example 5.5（双源混合输入与支路电流精算）',
      sync: { layer: L1, halo: ['vs1', 'vs2', 'r1', 'rf'], params: ex(0) },
      blocks: [
        { kind: 'p', text: '同学们，现在我们直接拿下教材 **Section 5.5 的经典压轴题：Example 5.5 (Fig. 5.19)**。' },
        {
          kind: 'p',
          text: R`这道题妙就妙在：它既不是纯反相，也不是纯同相，而是**反相端接了一个 [[vs1|$6\text{ V}$ 电压源]]（经 [[r1|$R_1 = 4\text{ k}\Omega$]]），同时同相端直接接了一个 [[vs2|$4\text{ V}$ 电压源]]**，[[rf|反馈电阻 $R_f = 10\text{ k}\Omega$]]。题目要求我们：**求输出电压 $v_o$，并进一步算出电路中所有支路电流 $i_1, i_f, i_-, i_+$。**`,
        },
        { kind: 'figure', svg: SVG_FIG41, caption: '图 4-1：Sadiku Example 5.5（Fig. 5.19）电路图与支路电流标注' },
        { kind: 'p', text: '**教授板书：Sadiku Example 5.5 三段式推导（主法：KCL 节点分析法）**' },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. [[iplus,iminus|**虚断公理**]]：$i_+ = 0$，$i_- = 0$。　2. **虚短公理**：同相端直连独立电压源 $V_{s2}$，故 $v_- = v_+ = V_{s2}$。　3. **KCL 与欧姆定律**：在[[vminus|反相输入节点 $v_-$]] 处，流入电流 $i_1$ 必须全部经反馈电阻 $R_f$ 流出成为 $i_f$，即 $i_1 = i_f$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式推导：分别写出[[i1|输入支路电流 $i_1$]] 与[[ifb|反馈支路电流 $i_f$]] 的符号表达式：`,
          tex: R`\begin{gathered} i_1 = \frac{V_{s1} - v_-}{R_1} = \frac{V_{s1} - V_{s2}}{R_1}, \\[4pt] i_f = \frac{v_- - v_o}{R_f} = \frac{V_{s2} - v_o}{R_f} \end{gathered}`,
        },
        { kind: 'formula', title: R`由节点 $v_-$ 的 KCL 方程 $i_1 = i_f + i_-$ 及 $i_- = 0$，得：`, tex: R`\frac{V_{s1} - V_{s2}}{R_1} = \frac{V_{s2} - v_o}{R_f}` },
        {
          kind: 'formula',
          title: R`解出 $v_o$ 的纯符号通式：`,
          tex: R`\begin{aligned} v_o &= V_{s2} - \frac{R_f}{R_1}\left(V_{s1} - V_{s2}\right) \\ &= -\frac{R_f}{R_1} V_{s1} + \left(1 + \frac{R_f}{R_1}\right) V_{s2} \end{aligned}`,
        },
        { kind: 'note', tone: 'tip', text: '（看看最后这个通式！它天然就是“反相放大器分量 + 同相放大器分量”的叠加！）' },
        {
          kind: 'note',
          tone: 'tip',
          text: '③ 代入数值这一步先不写：下面的苏格拉底引导例题就是这道题。自己闯关之后，完整的数值推导与叠加定理交叉验证作为“通关复盘”板书紧跟在后面。',
        },
        { kind: 'p', text: '**苏格拉底式分步引导例题**' },
        {
          kind: 'guided',
          // all steps answered: the stage uncovers the example's numbers
          done_params: { ex55: 9 },
          title: 'Sadiku Example 5.5 苏格拉底式分步推演（双源混合运放电路）',
          source: 'W3-L4-SOCRATIC-EX55 · Alexander, Sadiku & Fredette (2026) Section 5.5 Example 5.5',
          problem: R`[[vs1|$V_{s1} = 6\text{ V}$]] 经 [[r1|$R_1 = 4\text{ k}\Omega$]] 接运放反相端，[[vs2|$V_{s2} = 4\text{ V}$]] 直接接同相端，[[rf|$R_f = 10\text{ k}\Omega$]] 跨接输出与反相端（理想运放，$\pm 9\text{ V}$ 供电）。逐步求出节点电位 $v_-$、支路电流 $i_1, i_f, i_-, i_+$ 与输出电压 $v_o$。`,
          steps: [
            {
              title: 'Step 1 · 锁定基准节点电位',
              mini_svg: MINI_STEP1,
              question: R`观察 Example 5.5 电路：同相端（+）直接接在 4 V 独立电压源上，反相端（−）有 10 kΩ 负反馈电阻连向输出端。请问节点 $v_-$ 的电位是多少？`,
              hint: R`$v_- = v_+ = V_{s2}$`,
              options: [
                {
                  text: '0 V（因为反相端永远是虚地）',
                  correct: false,
                  feedback: R`停一下！‘虚地’只在同相端直接接地时才成立！这一题同相端接的是 4 V 电源，所以不是 0 V 虚地，而是‘虚短’把 $v_-$ 抬到了与 $v_+$ 相同的电位。`,
                },
                {
                  text: R`4 V（因为存在负反馈，满足虚短 $v_- = v_+ = 4\text{ V}$）`,
                  correct: true,
                  feedback: R`漂亮！牢记‘虚短是本质，虚地只是特例’。这里 $v_+ = 4\text{ V}$，所以负反馈瞬间把 $v_-$ 锁死在 4 V。`,
                },
                {
                  text: '6 V（因为左边接了 6 V 电压源）',
                  correct: false,
                  feedback: R`6 V 源和反相端之间隔着一颗 4 kΩ 电阻 $R_1$，电阻上会有压降，所以 $v_-$ 不可能等于 6 V。请看谁直接连在同相端上！`,
                },
                {
                  text: '2 V（两个电源电压之差）',
                  correct: false,
                  feedback: R`2 V 是电阻 $R_1$ 两端的压降，而不是节点 $v_-$ 对地的电位。先用虚短直接读出 $v_- = v_+$。`,
                },
              ],
              board: [R`\text{Step 1: } v_+ = 4\text{ V} \xrightarrow{\text{虚短}} v_- = 4\text{ V}`],
              halo: ['vs2', 'vminus'],
              params: ex(0),
              layer: L1,
            },
            {
              title: R`Step 2 · 计算输入电阻支路电流 $i_1$`,
              mini_svg: MINI_STEP2,
              question: R`现在已经知道 $R_1 = 4\text{ k}\Omega$ 左端接 6 V，右端节点 $v_- = 4\text{ V}$。取从左向右流入节点 $v_-$ 为正方向，支路电流 $i_1$ 等于多少？`,
              hint: R`$i_1 = \dfrac{V_{s1} - v_-}{R_1}$`,
              options: [
                {
                  text: '1.5 mA',
                  correct: false,
                  feedback: '你直接拿 6 V 除以 4 kΩ 了！忘了右端节点是 4 V 而不是 0 V。电阻电流只看两端的电位差。',
                },
                { text: '1.0 mA', correct: false, feedback: '再核对一下分子：6 V 减去 4 V 是 2 V，2 V 除以 4 kΩ 等于多少毫安？' },
                {
                  text: '0.5 mA',
                  correct: true,
                  feedback: R`完全正确！(6 V − 4 V) / 4 kΩ = 0.5 mA，这就是源源不断流向节点 $v_-$ 的电流。`,
                },
                {
                  text: '−0.5 mA',
                  correct: false,
                  feedback: R`方向看反啦！左端 6 V 高于右端 4 V，电流是从高电位流向低电位，所以向着节点 $v_-$ 方向是正值。`,
                },
              ],
              board: [R`\text{Step 2: } i_1 = \frac{6\text{ V} - 4\text{ V}}{4\text{ k}\Omega} = 0.5\text{ mA}`],
              halo: ['vs1', 'r1', 'i1'],
              params: ex(1),
              layer: L1,
            },
            {
              title: R`Step 3 · 应用虚断公理追踪反馈电流 $i_f$`,
              mini_svg: MINI_STEP3,
              question: R`这股 0.5 mA 的电流到达节点 $v_-$ 后，面临两条岔路：一条往右进运放反相端（$i_-$），一条往上走反馈电阻 $R_f = 10\text{ k}\Omega$（$i_f$）。请问 $i_-$ 和 $i_f$ 分别是多少？`,
              hint: R`$i_- = 0 \implies i_f = i_1 - i_- = i_1$`,
              options: [
                { text: R`$i_- = 0.5\text{ mA}$，$i_f = 0\text{ mA}$`, correct: false, feedback: '运放输入端像一堵无穷大电阻的防盗门，电流绝对钻不进去！回想 W3-L2 的虚断公理。' },
                { text: R`$i_- = 0.25\text{ mA}$，$i_f = 0.25\text{ mA}$`, correct: false, feedback: R`输入端不会平分电流哦，理想运放输入阻抗无穷大，$i_-$ 必须严格等于零。` },
                {
                  text: R`$i_- = 0\text{ mA}$，$i_f = 0.5\text{ mA}$`,
                  correct: true,
                  feedback: R`干得漂亮！因为 $i_- = 0$，0.5 mA 电流无路可退，只能 100% 拐弯冲进 10 kΩ 反馈电阻。`,
                },
                {
                  text: R`无法确定，必须先知道输出电压 $v_o$`,
                  correct: false,
                  feedback: R`不需要先知道 $v_o$！只要运用 KCL 和虚断公理 $i_- = 0$，电流 $i_f$ 就被完全锁死了。`,
                },
              ],
              board: [R`\text{Step 3: } i_- = 0,\; i_+ = 0`, R`\implies i_f = i_1 = 0.5\text{ mA}`],
              halo: ['iminus', 'ifb', 'rf'],
              params: ex(2),
              layer: L1,
            },
            {
              title: R`Step 4 · 由反馈电阻压降反推输出电压 $v_o$`,
              mini_svg: MINI_STEP4,
              question: R`现在我们知道 0.5 mA 的电流正从左端（4 V）流经 $R_f = 10\text{ k}\Omega$ 去向右端（$v_o$）。请问输出电压 $v_o$ 等于多少？`,
              hint: R`$v_o = v_- - i_f R_f$`,
              options: [
                {
                  text: '+9 V',
                  correct: false,
                  feedback: R`你把压降加到 4 V 上了！注意电流是从 4 V 流向 $v_o$，说明 4 V 比 $v_o$ 更高，应该是减去压降 5 V。`,
                },
                { text: '+1 V', correct: false, feedback: '符号差了一点点：4 V 减去 5 V 是负一伏，不是正一伏。' },
                {
                  text: '−1 V',
                  correct: true,
                  feedback: R`精准命中！$R_f$ 上压降为 0.5 mA × 10 kΩ = 5 V，因此 $v_o = 4\text{ V} - 5\text{ V} = -1\text{ V}$。`,
                },
                { text: '−5 V', correct: false, feedback: R`5 V 只是电阻 $R_f$ 两端的压降，别忘了起点电位是 +4 V 而不是 0 V！` },
              ],
              board: [R`\text{Step 4: } v_o = 4\text{ V} - (0.5\text{ mA})(10\text{ k}\Omega)`, R`= 4\text{ V} - 5\text{ V} = -1\text{ V}`],
              halo: ['rf', 'vo'],
              params: ex(3),
              layer: L1,
            },
            {
              title: 'Step 5 · 叠加定理与电源轨线性区复核',
              mini_svg: MINI_STEP5,
              question: R`如果我们把这套电路搬到 $\pm 9\text{ V}$ 双电源的 LM358 面包板上实测（线性窗口 $[-7.5\text{ V}, +7.5\text{ V}]$），以下关于“叠加定理”与“实测现象”的说法哪项是正确的？`,
              hint: R`$-7.5\text{ V} \le v_o = -1\text{ V} \le +7.5\text{ V}$`,
              options: [
                {
                  text: R`因为 $v_{o1} = -15\text{ V}$ 超出电源轨，所以两源同时接通时芯片也会饱和，测不到 −1 V`,
                  correct: false,
                  feedback: '芯片是否饱和只看‘实际工作时的最终输出与内部节点’，两源同时接入时输出是 −1 V，芯片非常轻松，根本不会饱和。',
                },
                {
                  text: R`两源同时接通时最终输出 $v_o = -1\text{ V}$ 处于线性区内，实测可得 −1 V；但不可在面包板上单独关掉一个电源去实测叠加分量`,
                  correct: true,
                  feedback: '满分洞察！你已经具备了资深模拟硬件工程师的直觉：纸面叠加用于手算，硬件实测必须核对真实电源轨边界！',
                },
                {
                  text: R`可以用单 +9 V 供电实测 −1 V，因为 −1 V 的绝对值小于 7.5 V`,
                  correct: false,
                  feedback: '单 +9 V 供电的下限是 0 V（GND），芯片绝不可能变出负电压！要测出 −1 V，必须用 ±9 V 双电源。',
                },
                { text: '叠加定理对运放电路根本不适用', correct: false, feedback: '只要运放工作在线性区，它就是一个线性受控源网络，叠加定理在数学上严格成立。' },
              ],
              board: [R`\text{Step 5: } v_o = v_{o1} + v_{o2}`, R`= -15\text{ V} + 14\text{ V} = -1\text{ V}`, R`\in [-7.5\text{ V}, +7.5\text{ V}]`, R`(\text{双电源线性区成立})`],
              halo: ['psu', 'sat', 'dmm'],
              params: { ex55: 4, preset: 'ex55', supply: 'dual', probe: 'out', cam: 'bench' },
              layer: L3,
            },
          ],
          conclusion: R`五步通关：$v_- = 4\text{ V}$，$i_1 = i_f = 0.5\text{ mA}$，$i_- = i_+ = 0$，$v_o = -1\text{ V}$，稳稳落在 $\pm 9\text{ V}$ 双电源的线性窗口内。左侧舞台的数值已经揭晓（03 面包板层的万用表读到 −1.00 V；切到单 +9 V 看看会怎样）。下面的通关复盘把这道题的板书完整写一遍。`,
        },
        { kind: 'p', text: '**通关复盘 · Sadiku Example 5.5 三段式推导 ③ 与叠加定理交叉验证**' },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '已知', text: R`代入题设：$V_{s1} = 6\text{ V}$，$V_{s2} = 4\text{ V}$，$R_1 = 4\text{ k}\Omega$，$R_f = 10\text{ k}\Omega$` },
            {
              label: R`1. **先算输入支路电流 $i_1$ 与反馈支路电流 $i_f$**`,
              tex: R`i_1 = \frac{6\text{ V} - 4\text{ V}}{4\text{ k}\Omega} = \frac{2\text{ V}}{4\text{ k}\Omega} = 0.5\text{ mA}`,
            },
            { label: R`由虚断 $i_- = 0$，得`, tex: R`\begin{gathered} i_f = i_1 = 0.5\text{ mA}, \\[2pt] i_- = 0\text{ mA}, \qquad i_+ = 0\text{ mA} \end{gathered}` },
            {
              label: R`2. **再算输出电压 $v_o$**`,
              tex: R`\begin{aligned} v_o &= 4\text{ V} - \frac{10\text{ k}\Omega}{4\text{ k}\Omega} \times (6\text{ V} - 4\text{ V}) \\ &= 4\text{ V} - 2.5 \times 2\text{ V} = 4\text{ V} - 5\text{ V} = -1\text{ V} \end{aligned}`,
            },
          ],
        },
        { kind: 'p', text: '**叠加定理交叉验证与教授安全提醒（Sadiku Method 1）**：' },
        {
          kind: 'ul',
          items: [
            R`仅保留 $6\text{ V}$（$4\text{ V}$ 短路接地）→ 反相放大：$v_{o1} = -\frac{10}{4} \times 6 = -15\text{ V}$；`,
            R`仅保留 $4\text{ V}$（$6\text{ V}$ 短路接地）→ 同相放大：$v_{o2} = \left(1 + \frac{10}{4}\right) \times 4 = +14\text{ V}$；`,
            R`叠加总输出：$v_o = v_{o1} + v_{o2} = -15\text{ V} + 14\text{ V} = -1\text{ V}$！`,
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**工程彩蛋**：在纸面上用理想运放做叠加完全正确，但在 $\pm 9\text{ V}$ 面包板实测时，你可千万别真把其中一个电源关掉去分别量 $-15\text{ V}$ 和 $+14\text{ V}$——单独通电时 LM358 早就撞上 [[sat|$\pm 7.5\text{ V}$ 电源轨饱和]]了！只有两源同时接入时，最终输出 $-1\text{ V}$ 才稳稳落在 $[-7.5\text{ V}, +7.5\text{ V}]$ 的线性区内。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '3D LM358 面包板实测与单/双电源边界排错',
      sync: { layer: L3, halo: ['chip_lm358'], params: { preset: 'ni', supply: 'dual', bvi: 1.5, probe: 'out', bbuf: true, cam: 'bench', ex55: 9 } },
      blocks: [
        {
          kind: 'p',
          text: R`理论讲透了，现在切换到左侧舞台第 3 层「${code('03 3D LM358 面包板实测')}」，我们把 [[chip_lm358|**LM358N（DIP-8）**]] 真正插到面包板[[center_trench|中沟（Center Ravine）]]上！`,
        },
        { kind: 'p', text: 'LM358N 是一颗性价比极高的**双运放芯片**——一片 8 脚小黑块里住着两个完全独立的运放：' },
        {
          kind: 'ul',
          items: [
            R`**运放 A（左侧 1–2–3 脚）**：我们用来搭建 **$A_v = 3$ 的同相放大器**（[[r1|$R_1 = 10\text{ k}\Omega$]] 接 [[chip_lm358_p2|Pin 2]] 到 GND，[[rf|$R_f = 20\text{ k}\Omega$]] 跨接 [[chip_lm358_p1|Pin 1]] 与 Pin 2，输入 $v_i$ 接 [[chip_lm358_p3|Pin 3]]，输出 $v_o$ 从 Pin 1 测出）。`,
            R`**运放 B（右侧 5–6–7 脚）**：我们顺手用来搭建 **电压跟随器**（一根[[jump_67|短跳线]]直接连通 [[chip_lm358_p6|Pin 6]] 与 [[chip_lm358_p7|Pin 7]]，传感器信号接 [[chip_lm358_p5|Pin 5]]，缓冲后的输出从 Pin 7 带 [[rl|$1\text{ k}\Omega$ 负载]]到 GND）。`,
          ],
        },
        { kind: 'figure', svg: SVG_FIG51, caption: '图 5-1：LM358N（DIP-8）引脚定义与双路实测接线映射图' },
        { kind: 'p', text: '**面包板实测三步检查法与单/双电源避坑指南**' },
        { kind: 'p', text: R`1. **为什么推荐 [[psu|$\pm 9\text{ V}$ 双电源]]，也允许单 $+9\text{ V}$？**` },
        {
          kind: 'ul',
          items: [
            R`同相放大器对正输入输出正电压，所以当你的输入信号严格为正（例如 $v_i = 1.5\text{ V} \to v_o = 4.5\text{ V}$，或电压跟随器 $5\text{ V} \to 5\text{ V}$）时，**单 $+9\text{ V}$ 供电（台式可调直流电源只用 + 路）完全可以正常工作**；`,
            R`但请注意 LM358 不是轨到轨（Rail-to-Rail）运放：在单 $+9\text{ V}$ 供电下，它的输出上限大约比正电源低 $1.5\text{ V}$，即[[sat|**最高只能顶到 $+7.5\text{ V}$**]]！如果你把 $v_i$ 调到 $3.0\text{ V}$（增益 $A_v = 3$，理论 $v_o = 9.0\text{ V}$），万用表会卡死在约 $+7.5\text{ V}$ 不动，同时你会发现 $v_- \approx 2.5\text{ V} \ne v_+ = 3.0\text{ V}$——**一旦进入饱和区，虚短立刻失效！**`,
            R`如果需要处理正负交变信号（或实测 Sadiku Example 5.5 的 $v_o = -1\text{ V}$），请务必切换为 **$\pm 9\text{ V}$ 双电源**（线性窗口 $[-7.5\text{ V}, +7.5\text{ V}]$）。`,
          ],
        },
        {
          kind: 'p',
          text: R`2. **三秒黄金排错法**：[[dmm|万用表]]黑表笔夹紧 GND，红表笔依次点触 ${code('Pin 3')}（$v_+$）与 ${code('Pin 2')}（$v_-$）。如果二者读数差超过几毫伏，只有两种可能：① 你的反馈电阻 $R_f$ 没插进同一排孔（断路开环了）；② 输出已经撞上 $\pm 7.5\text{ V}$ 饱和轨。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 03 层动手验证：选「同相放大 $A_v = 3$」，把 $v_i$ 拖到 $3.0\text{ V}$，红表笔分别点「$v_o$ / $v_+$ / $v_-$」。注意 $\pm 9\text{ V}$ 双电源的正电源同样是 $+9\text{ V}$，所以这时输出在两种供电下都顶在约 $+7.5\text{ V}$；双电源多给的是负半边——选「Example 5.5 复现」再切到单 $+9\text{ V}$，$-1\text{ V}$ 就测不出来了。`,
        },
        { kind: 'p', text: '**面包板安全检查（通电前逐条核对）**' },
        {
          kind: 'ul',
          items: [
            R`通电前务必核对 [[chip_lm358|LM358N]] 缺口朝左：[[chip_lm358_p8|Pin 8（左上）]]接 $+9\text{ V}$，[[chip_lm358_p4|Pin 4（右下）]]接 $-9\text{ V}$（双电源）或 GND（单电源），严禁反接烧毁芯片。`,
            R`同相放大器对正输入输出正电压，若改用单 $+9\text{ V}$ 供电（台式可调直流电源只用 + 路），一旦理论输出超过 $+7.5\text{ V}$ 就会触发 LM358 上轨饱和削顶（例如 $A_v = 3$ 且 $v_i = 3\text{ V}$ 时实测仅约 $7.5\text{ V}$）。`,
            R`反相端（Pin 2 / Pin 6）严禁悬空，必须先插牢反馈电阻或短接线形成负反馈闭环，再接入输入信号。`,
            R`电压跟随器带 $1\text{ k}\Omega$ 负载输出 $5\text{ V}$ 时，负载电流 $5\text{ mA}$ 由[[rails|电源轨]]经运放输出级提供，实测前请确认台式可调直流电源（±9 V）的限流已调小、且未将输出端直接短接到电源轨。`,
          ],
        },
        {
          kind: 'table',
          caption: '左侧 03 层的逐孔接线（830 孔面包板：a–e、f–j 同列竖通，e 与 f 之间是中央凹槽；LM358 缺口朝左，Pin 1 / Pin 8 在第 28 列）',
          head: ['元件 / 导线', '起点', '终点', '作用'],
          rows: [
            [
              '[[psu|台式可调直流电源（±9 V）]]',
              '+ / COM / − 端子',
              '[[rail_p9|顶部 + 轨]] / [[rail_gnd|顶部 − 轨与底部 + 轨]] / [[rail_m9|底部 − 轨]]',
              R`$+9\text{ V}$ / GND / $-9\text{ V}$（单 $+9\text{ V}$ 时不接 −）`,
            ],
            ['红色跳线', '顶部 + 轨第 27 列', '[[chip_lm358_p8|a28（Pin 8）]]', R`$V_+ = +9\text{ V}$`],
            ['蓝色跳线', '[[chip_lm358_p4|j31（Pin 4）]]', '底部 − 轨第 33 列（单电源时改接底部 + 轨 GND）', R`$V_- = -9\text{ V}$ / GND`],
            ['**同相放大 $A_v = 3$**：橙色跳线', '[[chip_lm358_p2|g29（Pin 2）]]', 'g25', R`把 $v_-$ 引到第 25 列`],
            ['[[rf|R_f 20 kΩ（红-黑-橙-金）]]', 'i25', '[[chip_lm358_p1|i28（Pin 1）]]', '反馈电阻'],
            ['[[r1|R_1 10 kΩ（棕-黑-橙-金）]]', 'j25', '底部 + 轨（GND）', '接地电阻'],
            ['[[sig_psu|台式可调直流电源（信号源）]]', '+ 端子 / COM', '[[chip_lm358_p3|j30（Pin 3）]] / 底部 + 轨', R`输入 $v_i$（0–3.5 V 可调，默认 1.5 V）`],
            ['**电压跟随器**：[[jump_67|橙色短跳线]]', '[[chip_lm358_p7|d29（Pin 7）]]', '[[chip_lm358_p6|d30（Pin 6）]]', '100% 负反馈'],
            ['[[rth|R_Th 10 kΩ（棕-黑-橙-金）]]', '[[chip_lm358_p5|c31（Pin 5）]]', 'c36（信号源 5 V 接 a36）', '模拟高内阻传感器'],
            ['[[rl|R_L 1 kΩ（棕-黑-红-金）]]', 'a29（Pin 7）', '顶部 − 轨（GND）', '负载；「拔掉跟随器直连」时改插 a31（传感器节点）'],
            ['**Example 5.5**：R_1 = 4 kΩ', 'h25 → h21，i21 → i17', '信号源 CH1（6 V）接 j17', 'E24 系列没有 4 kΩ：两颗 2 kΩ（红-黑-红-金）串联'],
            ['R_f 10 kΩ（棕-黑-橙-金）', 'i25', 'i28（Pin 1）', '反馈电阻；信号源 CH2（4 V）接 j30（Pin 3）'],
            ['[[dmm|万用表（DC V 档）]]', '红表笔 j28 / h30 / f25（跟随器：c29 / b31 / c30）', '黑表笔 底部 + 轨第 45 列', R`读 $v_o$、$v_+$、$v_-$`],
          ],
        },
      ],
    },
    /* ---------------------------------------------------------------- act 6: the diagnostic quiz */
    {
      act_index: 6,
      badge: '诊断测验',
      title: 'W3-L4 同相放大器与电压跟随器诊断测验',
      sync: { layer: L1, halo: [], params: ni() },
      blocks: [
        {
          kind: 'p',
          text: '以下 4 道诊断题覆盖本课的核心概念：同相与反相的输入电阻对比、为什么不能删掉电压跟随器、同相放大器的增益下限与单 +9 V 饱和边界、双源混合运放的节点计算（仿 Example 5.5）。四题全部答对即通关本课。',
        },
      ],
      inline_svg: SVG_QUIZ_ACT,
      figure_caption: '诊断测验的四个核心概念',
      quiz: [
        {
          id: 'w3l4_q1',
          concept: '同相与反相的输入电阻',
          review_act: 1,
          question: R`某压电传感器的戴维南内阻为 $R_{Th} = 100\text{ k}\Omega$。现需将其信号放大约 5 倍，工程师在“反相放大器（$R_1 = 10\text{ k}\Omega$, $R_f = 50\text{ k}\Omega$）”与“同相放大器（$R_1 = 10\text{ k}\Omega$, $R_f = 40\text{ k}\Omega$）”之间二选一。以下判断正确的是？`,
          options: [
            {
              key: 'A',
              text: '选反相放大器，因为它的虚地能把传感器内阻短路掉',
              correct: false,
              feedback: R`虚地只是让反相端的电位为 0，并不会“短路掉”传感器内阻：信号要经过 $R_1 = 10\text{ k}\Omega$ 才流到虚地，反相放大器的输入电阻就是 $R_{in} = R_1$。它和 $100\text{ k}\Omega$ 内阻串联分压，信号进放大器前只剩 $10/(100 + 10) \approx 9.1\%$。`,
            },
            {
              key: 'B',
              text: R`两者输入电阻都是 $R_1 = 10\text{ k}\Omega$，带载表现完全相同`,
              correct: false,
              feedback: R`只有反相放大器的输入电阻是 $R_1$。同相放大器的信号直接接在虚断的同相端，$i_+ = 0$、$R_{in} \to \infty$；它的 $R_1$ 接在反相端与地之间，根本不在信号源的回路里。`,
            },
            {
              key: 'C',
              text: R`选同相放大器，因为同相放大器输入端直连虚断的（+）端，输入电阻近乎无穷大，不会与 $100\text{ k}\Omega$ 内阻发生分压塌陷`,
              correct: true,
            },
            {
              key: 'D',
              text: '选反相放大器，因为同相放大器无法做到 5 倍增益',
              correct: false,
              feedback: R`同相放大器 $A_v = 1 + R_f/R_1 = 1 + 40/10 = 5$，正好 5 倍。它的限制只是增益不能小于 1，放大 5 倍毫无问题。`,
            },
          ],
          feedback_correct: R`反相放大器输入电阻 $R_{in} = R_1 = 10\text{ k}\Omega$，接上 $R_{Th} = 100\text{ k}\Omega$ 传感器后，信号进入放大器前就会分压跌去 90.9%；而同相放大器输入信号直连虚断同相端，$i_+ = 0$，$R_{in} \to \infty$，传感器无损耗传递完整电压，且 $A_v = 1 + 40/10 = 5$ 恰好满足要求。`,
          feedback_wrong: R`先比较两种结构的输入电阻 $R_{in}$：从传感器看进去，哪一种会和 $100\text{ k}\Omega$ 内阻分压？`,
          figure: SVG_Q1,
        },
        {
          id: 'w3l4_q2',
          concept: '跟随器的阻抗隔离',
          review_act: 3,
          question: R`新手同学审查电路图时，看到传感器（$V_{Th} = 5\text{ V}$, $R_{Th} = 10\text{ k}\Omega$）和 $1\text{ k}\Omega$ 负载之间插了一个增益为 1 的电压跟随器，提议“为了省成本，把它删掉换成一根导线，反正 $v_o = v_i$”。为什么资深教授坚决否决？`,
          options: [
            {
              key: 'A',
              text: '因为电压跟随器虽然电压增益为 1，但提供了极高输入阻抗与极低输出阻抗的阻抗隔离；若换成导线直连，负载电压会因分压暴跌至 0.455 V',
              correct: true,
            },
            {
              key: 'B',
              text: '因为删掉后输出电压极性会反转成 −5 V',
              correct: false,
              feedback: R`跟随器和导线都不会反相：信号从同相端进、$v_o = v_i$，极性始终一致；就算换成导线直连，负载上也仍是正电压。删掉它的问题不在极性。`,
            },
            {
              key: 'C',
              text: '因为电压跟随器可以把 5 V 升压到 9 V',
              correct: false,
              feedback: R`跟随器的电压增益恰好是 1，$v_o = v_+ = 5\text{ V}$，不会升压到 9 V。它多给的是电流：从传感器抽取 0 电流，由运放的电源轨向负载送出 $5.00\text{ mA}$。`,
            },
            {
              key: 'D',
              text: '因为导线无法通过直流电流',
              correct: false,
              feedback: R`导线当然能通直流。真正的麻烦恰恰在于它“通”：直连后负载电流要全部从传感器经 $R_{Th} = 10\text{ k}\Omega$ 流出，想想内阻上会落掉多少电压。`,
            },
          ],
          feedback_correct: R`电压跟随器是功率与电流缓冲器：它从传感器抽取 0 电流（保住 $5.00\text{ V}$），并由运放自身的外部电源轨向 $1\text{ k}\Omega$ 负载提供 $5.00\text{ mA}$ 电流。一旦删掉改用导线直连，$R_{Th}$ 与 $R_L$ 分压使负载仅剩 $5 \times 1/(10+1) \approx 0.455\text{ V}$。`,
          feedback_wrong: R`想一想：去掉跟随器后，传感器的 $10\text{ k}\Omega$ 内阻和 $1\text{ k}\Omega$ 负载构成了什么电路？`,
          figure: SVG_Q2,
        },
        {
          id: 'w3l4_q3',
          concept: '增益 ≥ 1 与单电源饱和',
          review_act: 5,
          question: R`在单 $+9\text{ V}$ 供电的 LM358 面包板上（线性输出上限约 $+7.5\text{ V}$），搭建了一个 $R_1 = 10\text{ k}\Omega$、$R_f = 20\text{ k}\Omega$ 的同相放大器。关于该电路的说法，哪一项是正确的？`,
          options: [
            {
              key: 'A',
              text: R`当输入 $v_i = 3.0\text{ V}$ 时，实测输出电压将是完美的 $9.0\text{ V}$`,
              correct: false,
              feedback: R`理论值 $3 \times 3.0 = 9.0\text{ V}$ 没错，但“完美”二字错了：LM358 不是轨到轨运放，$+9\text{ V}$ 供电时输出到不了 $9.0\text{ V}$——回头看题目给的线性输出上限。`,
            },
            {
              key: 'B',
              text: R`只要把 $R_f$ 调小到 $5\text{ k}\Omega$，就能做出 0.5 倍衰减器`,
              correct: false,
              feedback: R`$R_f = 5\text{ k}\Omega$ 时 $A_v = 1 + 5/10 = 1.5$，仍然是放大。$A_v = 1 + R_f/R_1$ 里的 $R_f/R_1$ 不可能为负，$R_f$ 再小也只能逼近 1（电压跟随器），永远做不成衰减器。`,
            },
            {
              key: 'C',
              text: R`单 $+9\text{ V}$ 供电时，该同相放大器无法放大 $v_i = 1.5\text{ V}$ 的正直流信号`,
              correct: false,
              feedback: R`同相放大器正输入出正输出，正适合单电源：$v_i = 1.5\text{ V}$ 时 $v_o = 3 \times 1.5 = 4.5\text{ V}$，落在 $[+0.02\text{ V}, +7.5\text{ V}]$ 的线性窗口里，能正常放大。`,
            },
            {
              key: 'D',
              text: R`该拓扑闭环增益永远 $\ge 1$（当前 $A_v = 3$）；当 $v_i = 3.0\text{ V}$ 时，理论输出 $9.0\text{ V}$ 超过 LM358 上轨上限，实测会饱和削顶在约 $+7.5\text{ V}$，此时虚短失效`,
              correct: true,
            },
          ],
          feedback_correct: R`同相放大器 $A_v = 1 + R_f/R_1 \ge 1$，不可能做衰减器（$R_f = 5\text{ k}\Omega$ 时 $A_v = 1.5$）。当 $A_v = 3$ 且 $v_i = 3.0\text{ V}$ 时，理想输出 $9.0\text{ V}$ 超出单 $+9\text{ V}$ 下 LM358 的 $+7.5\text{ V}$ 线性上限，芯片进入正饱和削顶，虚短不再成立。`,
          feedback_wrong: R`分两件事看：$A_v = 1 + R_f/R_1$ 能不能小于 1？$A_v \cdot v_i$ 超过 $+7.5\text{ V}$ 时 LM358 会怎样？`,
          figure: SVG_Q3,
        },
        {
          id: 'w3l4_q4',
          concept: '双源混合节点计算',
          review_act: 4,
          question: R`在类似 Sadiku Example 5.5 的理想运放电路中，同相端直接接 $+3\text{ V}$ 电源；反相端经 $R_1 = 2\text{ k}\Omega$ 接 $+5\text{ V}$ 电源，并经反馈电阻 $R_f = 6\text{ k}\Omega$ 接输出端 $v_o$（双电源 $\pm 12\text{ V}$ 供电）。请问输出电压 $v_o$ 等于多少？`,
          options: [
            {
              key: 'A',
              text: R`$+3\text{ V}$`,
              correct: false,
              feedback: R`$+3\text{ V}$ 是同相端（也是虚短后反相端）的电位 $v_- = v_+ = 3\text{ V}$，不是输出。输出还要再减去反馈电阻上的压降 $i_f R_f$。`,
            },
            { key: 'B', text: R`$-3\text{ V}$`, correct: true },
            {
              key: 'C',
              text: R`$-6\text{ V}$`,
              correct: false,
              feedback: R`$6\text{ V}$ 是反馈电阻上的压降 $(1.0\text{ mA})(6\text{ k}\Omega)$，不是输出电压本身。压降的起点是 $v_-$，而 $v_-$ 并不是 $0\text{ V}$。`,
            },
            {
              key: 'D',
              text: R`$+9\text{ V}$`,
              correct: false,
              feedback: R`你把压降加到了 $3\text{ V}$ 上（$3 + 6 = 9$）。$i_f$ 从 $v_-$ 流向 $v_o$，说明 $v_o$ 比 $3\text{ V}$ 低，应该减去压降。`,
            },
          ],
          feedback_correct: R`由虚短得 $v_- = v_+ = 3\text{ V}$；输入电流 $i_1 = (5\text{ V} - 3\text{ V}) / 2\text{ k}\Omega = 1.0\text{ mA}$；由虚断 $i_f = i_1 = 1.0\text{ mA}$；故 $v_o = v_- - i_f R_f = 3\text{ V} - (1.0\text{ mA})(6\text{ k}\Omega) = 3\text{ V} - 6\text{ V} = -3\text{ V}$。`,
          feedback_wrong: R`照 Example 5.5 的四步走：虚短定 $v_-$ → 算 $i_1$ → 虚断得 $i_f = i_1$ → $v_o = v_- - i_f R_f$。`,
          figure: SVG_Q4,
        },
      ],
    },
  ],
};

export default W3_L4;
