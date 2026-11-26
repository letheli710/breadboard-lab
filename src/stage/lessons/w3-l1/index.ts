// W3-L1 · 认识真实运放：LM358/LM741 封装、VCVS 模型与三区饱和 (lesson sheet: docs/lessons/W3-L1.md).
// The professor's text of the five acts is reproduced from the sheet as written; [[id|…]] only
// links a term to the stage (the words are unchanged). Changes of form, none of wording:
// - the 教授导言 opens act 1; the sheet's numbered sub-headings (1.1 … 5.4) are bold lines; the
//   "联动左侧舞台" lines (layer names and renderer ids) are left out — each act card names its layer;
//   the italic book title loses its asterisks (the inline markup has no italics);
// - display formulas sit in the ①/②/③ cards (a lead-in sentence becomes the card title); the
//   formulas inside 3.1's numbered list are set inline;
// - sheet act 5 is split like W2-L8: 5.1–5.2 (act 5), the guided example 5.3 (its own act, so the
//   stage can follow its steps) and the quiz 5.4 (the last act); 5.1's "引出下一课（W3-L2）" bullet
//   is the next-lesson preview after the quiz;
// - the sheet's JSON (guided example, quiz) is mapped onto types.ts: label / text → option text,
//   professor_intercept → feedback, hint_latex → hint, board_append_latex → board, explanation →
//   feedback_correct; plain-text symbols (v_d, R_o, i_- …) in prompts and options are set as TeX;
// - dev-facing parts are left out: the "Claude 工程落地清单", "Socratic Stepper JSON" and
//   "Diagnostic Quiz JSON" tags, the passing_score 3 (the site passes at 4 / 4).
// Corrections (listed in the report): figure 1.4's banner put pins 1–4 in column e — the lab chip
//   (Lm358.tsx) sits with pins 1–4 in row f, so the banner says f / e (1.1's "左侧引脚插在 e 列" is
//   kept: it describes a board turned with a–e on the left, and a note after 1.2 maps it onto the
//   stage); figure 2.2 said i_- is negative only when sinking (it is −1 mA when
//   sourcing too); figure 4.3 said 3 mV is "33.3 倍于悬崖宽" (it is 33.3 × the 90 μV boundary,
//   16.7 × the 180 μV width); act 2's "不足万分之零点四" → "仅约万分之零点四" (0.0002 / 5 is exactly
//   0.4 in ten thousand).
// Added: the safety checklist, supply modes and scaling note of breadboard_safety_and_scaling (act
// 1, as the sheet's checklist asks for a banner at the top); a note on how the stage's board is
// turned; the guided example's praise for right options, problem figure and conclusion; a figure
// for the guided act, each quiz question and the quiz act; per-option quiz feedback written from the
// sheet's explanations.
// Anti-spoiler: the guided example (±9 V, v_d = 60 μV, R_L = 1.5 kΩ) is not one of the acts'
// worked examples (act 3: 50 μV into 2 kΩ; act 4: the ±90 μV boundaries), so no ③ calc moved.
// While it runs the stage hides the numbers it asks for (param `mask`), uncovered by done_params.

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import type { StageLesson, StageSync } from '../../types';
import { ADDED_GD_ACT, ADDED_GD_PROBLEM, ADDED_Q1, ADDED_Q2, ADDED_Q3, ADDED_Q4, ADDED_QUIZ_ACT } from './figures';
import { CHIP_C0, CHIP_NAME, PINS, type ChipKind, type PinNo } from './model';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SHEET_ACT1, SHEET_ACT2, SHEET_ACT3, SHEET_ACT4, SHEET_ACT5 } from './svgs';

const ChipBench3D = lazy(() => import('./ChipBench3D'));
const KclLayer = lazy(() => import('./KclLayer'));
const Teardown3D = lazy(() => import('./Teardown3D'));
const TransferLayer = lazy(() => import('./TransferLayer'));

const R = String.raw;
/** inline code inside String.raw text */
const code = (s: string) => '`' + s + '`';

const L1 = 'layer_01';
const L2 = 'layer_02';
const L3 = 'layer_03';
const L4 = 'layer_04';

/** every act sets all of the stage, so scrolling back restores it */
const P = (p: Record<string, unknown> = {}): StageSync['params'] => ({
  mask: false,
  chip: 'lm358',
  xray1: false,
  pins1: 'all',
  cam1: 'iso',
  load: 'source',
  rl2: 1,
  kcl_box: true,
  explode: 0,
  overlay: false,
  vd3: 50,
  rl3: 2,
  sup: 'dual',
  vd4: 0,
  vos: false,
  cmp: false,
  vin: 3,
  ...p,
});

/** the guided example's stage: its circuit, numbers hidden */
const GD = (p: Record<string, unknown> = {}) => P({ mask: true, chip: 'lm741', explode: 100, overlay: true, vd3: 60, rl3: 1.5, vd4: 60, ...p });

/** tooltip of a pin: "LM358 Pin 8 · V+" */
function describePin(id: string) {
  const m = /^chip_(lm358|lm741)_p([1-8])$/.exec(id);
  if (!m) return null;
  const chip = m[1] as ChipKind;
  const p = Number(m[2]) as PinNo;
  const row = p <= 4 ? 'f' : 'e';
  const col = p <= 4 ? CHIP_C0 + p - 1 : CHIP_C0 + 8 - p;
  return { label: `${CHIP_NAME[chip]} Pin ${p} · ${PINS[chip][p].name}`, desc: `${PINS[chip][p].zh}；面包板上插在 ${row}${col}，同列另外 4 个孔与它相通` };
}

const W3_L1: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: ChipBench3D, [L2]: KclLayer, [L3]: Teardown3D, [L4]: TransferLayer },
  describeTarget: (id) => describePin(id) ?? genericLabel(id),
  lesson_meta: {
    lesson_id: 'W3-L1',
    world: 'World 3',
    title: '认识真实运放：LM358/LM741 封装、VCVS 模型与三区饱和',
    subtitle: '从 8 脚黑匣子到受控源剥壳与微伏级线性悬崖',
    lesson_type: 'A',
    lesson_type_label: 'Type A · 器件导论课（含 3D 器件剥壳 + 3D 面包板认引脚）',
    estimated_minutes: 45,
    textbook_primary: {
      book: 'Fundamentals of Electric Circuits, 2026 Release（Alexander, Sadiku & Fredette）',
      sections: ['Section 5.1 Introduction', 'Section 5.2 Operational Amplifiers（p. 174–176；Eq. (5.1)、Table 5.1）'],
    },
    prerequisites: ['W1-L2 受控源', 'W1-L5 KCL', 'W2-L7 戴维南等效'],
    learning_objectives: [
      '能用缺口与 Pin 1 圆点数清 DIP-8 引脚，把芯片跨中央隔离沟插上面包板，并牢记 LM358 与 LM741 的致命引脚差异',
      '能用 Sadiku **Eq. (5.1)** 供电轨 KCL 说清：输入电流近似为零时，输出电流从电源轨来，而不是凭空冒出来',
      R`掌握真实运放的线性区等效电路（$R_i$、$A v_d$、$R_o$），熟知 **Table 5.1** 参数数量级与分贝增益 $A_{\text{dB}}$`,
      R`读懂三区传输特性：算出 $\pm 90\ \mu\text{V}$ 饱和悬崖，解释 $3\text{ mV}$ 失调电压为何让开环运放必然“拍顶”，分清 $\pm 9\text{ V}$ 双电源与单 $+9\text{ V}$ 的摆幅`,
    ],
    pass_message: '真实运放诊断测验通过！',
    next_lesson: 'W3-L2',
    next_lesson_title: '理想运放与虚短虚断',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 3D 芯片封装与面包板跨沟插法',
        short: '01 跨沟插法',
        render_mode: '3D_THREEJS_DEVICE_AND_BREADBOARD',
        caption:
          '01 3D 芯片封装与面包板跨沟插法：实验箱 LM358（或 LM741）骑跨中央隔离沟，台式电源 ±9 V 接三条电源轨；可切换芯片、透视簧片、按组高亮引脚、换镜头（缺口俯视 / 跨沟斜视 / Pin 1 特写）。',
      },
      {
        id: L2,
        label: '02 供电轨 KCL 能量通道 (Eq. 5.1)',
        short: '02 供电轨 KCL',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 供电轨 KCL 能量通道：虚线封闭面包住整颗芯片，五路电流 i₁、i₂、i₊、i₋、i_o 的箭头粗细与方向跟着工况（拉电流 +5 V / 灌电流 −4 V）和 R_L 实时变化，下方核对 Eq. (5.1)。',
      },
      {
        id: L3,
        label: '03 3D 剥壳等效 VCVS 模型',
        short: '03 VCVS 剥壳',
        render_mode: '3D_THREEJS_TEARDOWN',
        caption:
          '03 3D 剥壳：拖动滑块掀开环氧树脂外壳，露出引线框架、金丝键合线与硅片上的输入级 / 增益级 / 输出级；打开等效映射，把它们对到 R_i、A·v_d、R_o，v_d 滑块实时算 i_in、v_oc 与带载 v_o。',
      },
      {
        id: L4,
        label: '04 三区传输曲线与双/单电源切换',
        short: '04 三区曲线',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '04 三区传输曲线：左边 mV 尺度（线性区缩成一道竖线），右边 μV 放大窗口（±90 μV、斜率 A = 10⁵）；可切换双电源 ±9 V / 单电源 +9 V/0 V、注入 3 mV 失调电压、打开比较器演示。',
      },
    ],
    hover_map: {
      // layer 01
      chip_lm358: { label: 'LM358 双运放（实验箱芯片）', desc: '一颗 DIP-8 里装两套独立运放：V+ 在 Pin 8，V−/GND 在 Pin 4；缺口朝左插时 Pin 1–4 在 f 行、Pin 5–8 在 e 行' },
      chip_lm741: { label: 'LM741 单运放（Sadiku 范例）', desc: 'DIP-8 里只有一套运放：2 IN−、3 IN+、6 OUT、7 V+、4 V−；1 与 5 是失调调零脚，8 是空脚 NC' },
      notch: { label: '缺口（Notch）', desc: '封装一端的半圆形凹槽：缺口朝上放，左上角就是 Pin 1，然后逆时针数到 8' },
      pin1_dot: { label: 'Pin 1 压印圆点', desc: '缺口旁的小圆点标出 Pin 1；左侧舞台上缺口朝左，圆点在左下角（f 行一侧）' },
      center_trench: { label: '中央隔离沟（Center Trench）', desc: 'e 与 f 之间的长槽：两侧金属簧片互不导通，DIP-8 必须骑跨它，左右两排引脚才各自独立' },
      rail_vcc: { label: '+9 V 电源轨', desc: '顶部红色轨，接台式电源 +9 V 端子；红色跳线把它接到芯片的 V+ 脚（LM358 Pin 8 / LM741 Pin 7）' },
      rail_gnd: { label: 'GND 公共地轨', desc: '顶部蓝色轨，接台式电源 COM 端（两路 9 V 串联的中间节点）' },
      rail_vee: { label: '−9 V 电源轨', desc: '底部蓝色轨，接台式电源 −9 V 端子；蓝色跳线把它接到 Pin 4' },
      rail_unused: { label: '底部红色轨（本课未用）', desc: '双电源接法只用三条轨：+9 V、GND、−9 V' },
      bench_psu: { label: '台式可调直流电源（±9 V）', desc: '双路输出 +9 V / COM / −9 V，经引线接到三条电源轨；上电前先用万用表确认三条轨之间无短路' },
      // layer 02
      i1: { label: '反相输入电流 i₁', desc: '流入芯片，极微弱（本课取 0.1 μA = 0.0001 mA）' },
      i2: { label: '同相输入电流 i₂', desc: '流入芯片，极微弱（0.1 μA）：输入端只做“阀门控制”' },
      i_plus: { label: '正电源轨电流 i₊', desc: '从 +V_CC 流入芯片：拉电流时负载的电流几乎全部从这里来' },
      i_minus: { label: '负电源轨电流 i₋', desc: '按 Sadiku 正方向约定定义为从 −V_EE 流入芯片；两种工况下都是负值（实际从 −V_EE 脚流出）' },
      i_o: { label: '输出电流 i_o', desc: 'i_o = v_o / R_L，从输出脚流向负载；灌电流时为负（电流从地经 R_L 倒灌进输出脚）' },
      rl2: { label: '负载电阻 R_L', desc: '接在输出端与地之间，滑块 1–10 kΩ（第 2 幕算例取 1 kΩ）' },
      kcl_box: { label: 'KCL 封闭面（超节点）', desc: '把整颗芯片连同供电脚包起来：流入 = 流出，i_o = i₁ + i₂ + i₊ + i₋' },
      eq51: { label: 'Sadiku Eq. (5.1)', desc: 'i_o = i₁ + i₂ + i₊ + i₋：输入仅做阀门控制，供电轨才是供水主管道' },
      // layer 03
      epoxy: { label: '环氧树脂外壳', desc: '黑色塑封体：拖动「剥壳」滑块把上半壳掀开、变透明' },
      die: { label: '硅片（Die）', desc: '几毫米见方的硅片，几十颗晶体管做成输入级、增益级、输出级' },
      lead_frame: { label: '引线框架', desc: '铜质框架：中间的载片台托住硅片，八根内引线通到外面的 8 条腿' },
      bond_wire: { label: '金丝键合线', desc: '把硅片上的焊盘连到引线框架的细金丝（LM741 的 Pin 8 是空脚，没有键合线）' },
      ri: { label: '输入电阻 R_i（输入级）', desc: '跨在 v₁ 与 v₂ 之间，典型 2 MΩ（Table 5.1：10⁵–10¹³ Ω）：几乎不从信号源吸电流' },
      vcvs: { label: '压控电压源 A·v_d（增益级）', desc: '空载输出 v_oc = A·v_d = A(v₂ − v₁)，A 为开环差模电压增益（本课 10⁵）' },
      ro: { label: '输出电阻 R_o（输出级）', desc: '与 A·v_d 串联，典型 75 Ω（Table 5.1：10–100 Ω）：输出端就是戴维南等效 V_Th = A·v_d、R_Th = R_o' },
      vd: { label: '差模输入电压 v_d', desc: 'v_d = v₂ − v₁：永远是同相端（+）减反相端（−）' },
      rl_load: { label: '外部负载 R_L 与带载输出 v_o', desc: 'v_o = R_L / (R_o + R_L) · A·v_d：kΩ 级负载时 R_o 只吃掉几个百分点' },
      gain_db: { label: '分贝开环增益 A_dB', desc: 'A_dB = 20 log₁₀ A：10⁵ = 100 dB，10⁸ = 160 dB，2 × 10⁵ ≈ 106 dB' },
      // layer 04
      region_pos: { label: '正饱和区', desc: 'v_d > +V_CC / A（±9 V、A = 10⁵ 时 > +90 μV）：输出被削平在正电源轨' },
      region_lin: { label: '线性放大区', desc: '−V_EE / A ≤ v_d ≤ +V_CC / A：仅 ±90 μV（总宽 180 μV），v_o = A·v_d' },
      region_neg: { label: '负饱和区', desc: 'v_d < −V_EE / A：输出被削平在负电源轨（单电源时贴近 0 V）' },
      swing_real: { label: 'LM358 真实摆幅', desc: '正饱和实际约 +7.5 V（V_CC − 1.5 V）；双电源负饱和可逼近 −8.9 V，单电源下限贴近 0 V（典型 5–20 mV）' },
      single_supply: { label: '单电源 +9 V / 0 V', desc: '台式可调直流电源（单 +9 V）只用 + 路，Pin 4 接 GND：芯片彻底失去负电压输出能力，LM358 输出约 0 V … +7.5 V' },
      vos: { label: '输入失调电压 V_OS ≈ 3 mV', desc: '差分对晶体管的微小失配：3000 μV 是饱和边界 90 μV 的 33.3 倍，开环一上电就拍顶或拍底' },
      comparator: { label: '开环比较器', desc: '不加反馈：v₂ 比 v₁ 高 0.1 mV 就翻到正饱和，低 0.1 mV 就翻到负饱和（或单电源 0 V）' },
      vref: { label: '参考阈值电压 V_ref', desc: '接在反相端 v₁ 的报警线（本演示 2.5 V）' },
      vin: { label: '实时信号 v_in', desc: '接在同相端 v₂ 的传感器信号：超过 V_ref 输出拍顶、LED 亮' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '黑匣子里的 8 条腿——DIP-8 封装、跨沟插法与 LM358 vs LM741 引脚生死线',
      sync: { layer: L1, halo: ['chip_lm358', 'notch', 'center_trench'], params: P({ cam1: 'iso' }) },
      blocks: [
        {
          kind: 'p',
          text: R`**教授导言**：同学们好，欢迎进入第三周。前两周我们一直在和电阻、独立源、受控源以及戴维南等效打交道。很多同学在学完 ${code('W1-L2 受控源')} 时心里一定嘀咕过：“教授，书上画的那个菱形压控电压源（VCVS）现实里到底长什么样？我去电子市场能买到一颗菱形元件吗？”今天我就把一颗真实的黑色塑料小爬虫——[[chip_lm358|**运算放大器（Operational Amplifier, 简称运放）**]]——拍在面包板上。它内部塞了几十颗晶体管，但在电路分析的视角下，剥开环氧树脂外壳，它本质上就是一颗**高增益、高输入电阻、低输出电阻的真实 VCVS 受控源**。本课严格对齐 Fundamentals of Electric Circuits, 2026 Release (Alexander, Sadiku & Fredette) **Section 5.1 & 5.2 (p. 174–176)**，我们先认清它的 8 条腿、搞懂它的能量来源，再把它的内部模型和“微伏级悬崖”彻底看透。`,
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**面包板安全清单（上电前逐条核对）**：① DIP-8 芯片必须跨过面包板[[center_trench|中央隔离沟]]（E/F 排之间）插入，严禁 8 脚全部插在同一侧导致左右引脚两两短路。② 插入前必须先认清半圆形[[notch|缺口（Notch）]]与 [[pin1_dot|Pin 1 圆点]]，沿逆时针方向数清 1–8 脚。③ 严禁将 LM358 与 LM741 直接互换插拔：两者 Pin 4 同为负电源/地，但正电源 $V_{CC}$ 在 LM358 是 [[chip_lm358_p8|Pin 8]]，在 LM741 却是 [[chip_lm741_p7|Pin 7]]；若直接替换会导致电源接错甚至烧毁芯片。④ 上电前务必用万用表确认 [[rail_vcc|+9 V]]、[[rail_gnd|GND]]、[[rail_vee|-9 V]] 轨无短路，禁止带电插拔芯片。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**供电方式**：[[bench_psu|双电源 ±9 V]]（台式可调直流电源（±9 V）两路串联，中点 COM 为公共地 GND），提供对称正负输出摆幅。**单电源回退**（$+9\text{ V} / 0\text{ V}$）：输出下限贴近 0 V（LM358 典型 ~5–20 mV，具备近地感应能力；LM741 则在单 9 V 下下限约 1.5–2 V，不推荐单电源低压使用），上限约 +7.5 V（受内部输出级达林顿射极跟随器压降 $V_{CC} - 1.5\text{ V}$ 限制）。**元件缩放**：本课不缩放——本课电路与算例所用外部负载电阻均为 kΩ 级（1 kΩ–2 kΩ），在 ±9 V 供电下输出电流位于 2.4–6.0 mA 安全工作区，远低于 LM358/LM741 输出短路电流限值（典型 25–40 mA）及 1/4 W 碳膜电阻功率上限，无需元件缩放。`,
        },
        { kind: 'p', text: '**本幕目标**：掌握 DIP-8 封装缺口定位法、面包板跨沟插法，并牢记实验室最常用的两颗芯片 **LM358（双运放）** 与 **LM741（单运放）** 的致命引脚差异。' },
        { kind: 'p', text: '**1.1 为什么芯片必须“跨过那条沟”？**' },
        {
          kind: 'p',
          text: R`拿到一颗直插式双列 8 脚封装（**DIP-8**）芯片，先别急着往面包板上按。你盯着面包板正中央看，会发现一条贯通左右的长槽，我们叫它[[center_trench|**中央隔离沟（Center Trench）**]]。面包板同一行中，沟左边的 ${code('a–b–c–d–e')} 五个孔在内部由同一根金属簧片连通，沟右边的 ${code('f–g–h–i–j')} 五个孔由另一根金属簧片连通，左右两排互不导通。`,
        },
        {
          kind: 'p',
          text: R`如果把 DIP-8 芯片插在沟的同一侧，左边第 1 脚和右边第 8 脚就会被同一根金属簧片直接短接，电源和信号全乱套；**唯有让芯片像跨河架桥一样骑在[[center_trench|中央隔离沟]]上（左侧引脚插在 ${code('e')} 列，右侧引脚插在 ${code('f')} 列）**，8 条引脚才各自拥有独立的 4 个外部接线孔。`,
        },
        { kind: 'p', text: '**1.2 认引脚的黄金法则：缺口朝左，逆时针数 1 到 8**' },
        {
          kind: 'p',
          text: R`观察芯片顶面：一端有一个半圆形凹槽（[[notch|**Notch / 缺口**]]），缺口左下方通常还有一个[[pin1_dot|压印小圆点]]。把缺口朝左（或朝上）放好：`,
        },
        {
          kind: 'ul',
          items: [
            R`**缺口朝上时**：左上角就是 [[chip_lm358_p1,pin1_dot|**Pin 1**]]，沿左侧向下依次是 ${code('1 → 2 → 3 → 4')}，跨过底部到右侧再向上依次是 ${code('5 → 6 → 7 → 8')}（整体呈 **U 形逆时针** 排列）。`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**对照左侧舞台**：舞台上的面包板是横放的——$a\text{–}e$ 在[[center_trench|中央隔离沟]]远侧、$f\text{–}j$ 在近侧；实验箱的 LM358 [[notch|缺口朝左]]，[[pin1_dot|Pin 1]] 在左下角，引脚 1–4 插在 $f$ 行（第 14–17 列）、5–8 沿 $e$ 行折回。点镜头「缺口朝上俯视」，就是上面这条“缺口朝上、左上角 Pin 1、U 形逆时针”的视角。`,
        },
        { kind: 'p', text: '**1.3 LM358 vs LM741：千万别凭感觉互换！**' },
        {
          kind: 'p',
          text: R`教材 Section 5.2 重点以经典的 [[chip_lm741|**741 单运放**]] 为例，而同学们手头的实验套件里最常见的是 [[chip_lm358|**LM358 双运放**]]（一颗 DIP-8 里装了两套完全独立的运放）。请务必死盯住两者的 **供电脚（$V_{CC}$ / $V_{EE}$）** 与 **输出脚**：`,
        },
        {
          kind: 'table',
          head: ['引脚编号', 'LM358（双运放，Dual）', 'LM741（单运放，Single）', '实验室踩坑警示'],
          rows: [
            ['[[chip_lm358_p1,chip_lm741_p1|**Pin 1**]]', '**OUT1**（运放 A 输出）', 'Offset Null（失调调零）', 'LM358 是输出，LM741 悬空不接'],
            ['[[chip_lm358_p2,chip_lm741_p2|**Pin 2**]]', R`**IN1−**（运放 A 反相输入 $v_1$）`, R`**IN−**（反相输入 $v_1$）`, '两者一致'],
            ['[[chip_lm358_p3,chip_lm741_p3|**Pin 3**]]', R`**IN1+**（运放 A 同相输入 $v_2$）`, R`**IN+**（同相输入 $v_2$）`, '两者一致'],
            ['[[chip_lm358_p4,chip_lm741_p4|**Pin 4**]]', R`**GND / $V_{EE}$**（负电源或地）`, R`**$V_{EE}$ / $V^-$**（负电源）`, '**两者 Pin 4 同为负电源轨**'],
            ['[[chip_lm358_p5,chip_lm741_p5|**Pin 5**]]', '**IN2+**（运放 B 同相输入）', 'Offset Null（失调调零）', 'LM741 悬空不接'],
            ['[[chip_lm358_p6,chip_lm741_p6|**Pin 6**]]', '**IN2−**（运放 B 反相输入）', R`**OUT**（唯一输出 $v_o$）`, 'LM741 的输出在 Pin 6！'],
            ['[[chip_lm358_p7,chip_lm741_p7|**Pin 7**]]', '**OUT2**（运放 B 输出）', R`**$V_{CC}$ / $V^+$**（正电源）`, '**致命差异：LM741 正电源在 Pin 7**'],
            ['[[chip_lm358_p8,chip_lm741_p8|**Pin 8**]]', R`**$V_{CC}$ / $V^+$**（正电源）`, 'NC（空脚，无内部连接）', '**致命差异：LM358 正电源在 Pin 8**'],
          ],
        },
        {
          kind: 'note',
          tone: 'warn',
          text: R`**教授敲黑板**：上电前务必核对丝印型号！把 LM358 插进按 LM741 接好线的面包板，等于把 $+9\text{ V}$ 正电源直接捅进 LM358 的 [[chip_lm358_p7|**OUT2（Pin 7）输出级**]]，轻则芯片滚烫冒烟，重则电源拉垮。`,
        },
        { kind: 'p', text: '**1.4 内联原理图：DIP-8 引脚对照与面包板跨沟插法**' },
      ],
      inline_svg: SHEET_ACT1,
      figure_caption: '图 1-4：DIP-8 真实封装引脚生死对照（LM358 双运放 vs LM741 单运放）与面包板跨沟插法',
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '输出电流从哪来？——打破“永动机”错觉与 Eq. (5.1) 供电轨 KCL',
      sync: { layer: L2, halo: ['kcl_box', 'i_plus', 'i_minus', 'i_o'], params: P({ load: 'source', rl2: 1, kcl_box: true }) },
      blocks: [
        { kind: 'p', text: R`**前置衔接**：${code('W1-L5 KCL（基尔霍夫电流定律）')}` },
        {
          kind: 'p',
          text: '**本幕目标**：理解为什么工程电路图常常省略供电脚，但物理上绝不能忘掉供电脚；用 Sadiku **Eq. (5.1)** 彻底打破“输入电流近似为零，输出电流怎么凭空冒出来”的迷思。',
        },
        { kind: 'p', text: '**2.1 打破“永动机”错觉：有源器件的隐藏能量门**' },
        {
          kind: 'p',
          text: R`以后我们在画运放电路原理图时，为了画面清爽，常常只画 3 条线：反相输入 $v_1$、同相输入 $v_2$、输出 $v_o$。于是很多初学者一上来就犯晕：`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`“老师，你马上要告诉我运放两个输入端的电流 $i_1 \approx 0$、$i_2 \approx 0$，可输出端却能点亮一颗 $5\text{ mA}$ 的 LED！这不违反 ${code('W1-L5')} 学的 KCL 吗？”`,
        },
        {
          kind: 'p',
          text: R`**绝没有违反 KCL！** 运放不是无源电阻，它是一个**有源器件（Active Element）**。把整个运放芯片连同它的供电脚 $+V_{CC}$ 和 $-V_{EE}$ 用一个[[kcl_box|封闭曲面（超节点）]]包起来，你会看到它一共有 **5 条电流通道**：`,
        },
        {
          kind: 'ul',
          items: [
            R`[[i1|反相输入电流 $i_1$]]（流入芯片）`,
            R`[[i2|同相输入电流 $i_2$]]（流入芯片）`,
            R`[[i_plus|正电源轨电流 $i_+$]]（从 $+V_{CC}$ 流入芯片）`,
            R`[[i_minus|负电源轨电流 $i_-$]]（按 Sadiku 正方向约定，定义为从 $-V_{EE}$ 流入芯片）`,
            R`[[i_o|输出电流 $i_o$]]（从输出端流出芯片，流向[[rl2|负载 $R_L$]]）`,
          ],
        },
        { kind: 'p', text: '**2.2 内联原理图：Eq. (5.1) 真实芯片五电流 KCL 节点图**' },
        { kind: 'figure', svg: SHEET_ACT2, caption: '图 2-2：Sadiku Eq. 5.1 真实运放五电流 KCL 封闭面节点图' },
        { kind: 'p', text: '**2.3 教授三段式板书推导：Eq. (5.1) 拉电流（Sourcing）与灌电流（Sinking）算例**' },
        {
          kind: 'p',
          text: R`**场景设定**：某真实运放接双电源 $\pm 9\text{ V}$，输出端接负载电阻 $R_L = 1\text{ k}\Omega$ 到地。已知输入偏置电流极小，取 $i_1 = i_2 = 0.1\ \mu\text{A} = 0.0001\text{ mA}$。分别考察：`,
        },
        {
          kind: 'ul',
          items: [
            R`**工况 A（拉电流 Sourcing）**：输出 $v_o = +5.0\text{ V}$，芯片内部静态电流经负电源流出 $1.0\text{ mA}$（即按流入方向 $i_- = -1.0000\text{ mA}$），求正电源供电电流 $i_+$。`,
            R`**工况 B（灌电流 Sinking）**：输出 $v_o = -4.0\text{ V}$，芯片内部静态电流从正电源流入 $i_+ = +1.0000\text{ mA}$，求负电源引脚电流 $i_-$。`,
          ],
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`对包含整个运放封装的[[kcl_box|封闭超节点]]应用基尔霍夫电流定律（${code('W1-L5 KCL')}：流入封闭面的总电流等于流出封闭面的总电流），并结合负载端欧姆定律：$\displaystyle \sum i_{\text{in}} = \sum i_{\text{out}} \implies i_1 + i_2 + i_+ + i_- = i_o \quad \text{[Sadiku Eq. (5.1)]}$，$\displaystyle i_o = \frac{v_o}{R_L}$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：由 [[eq51|Eq. (5.1)]] 移项，分别解出正电源电流 $i_+$ 与负电源电流 $i_-$ 的纯符号表达式`,
          tex: R`\begin{gathered} i_+ = \frac{v_o}{R_L} - i_1 - i_2 - i_- \\ i_- = \frac{v_o}{R_L} - i_1 - i_2 - i_+ \end{gathered}`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简 · **工况 A（拉电流，$v_o = +5.0\text{ V}$）**`,
          steps: [
            { label: '1', text: R`先算负载电流：$i_o = \dfrac{+5.0\text{ V}}{1\text{ k}\Omega} = +5.0000\text{ mA}$` },
            { label: '2', text: R`代入 $i_+$ 通式（统一换算为 $\text{mA}$）：`, tex: R`i_+ = 5.0000 - 0.0001 - 0.0001 - (-1.0000) = 5.9998\text{ mA} \approx 6.00\text{ mA}` },
            {
              label: '3',
              text: R`**物理读解**：负载拿走的 $5.00\text{ mA}$ 几乎 100% 来自[[i_plus|正电源 $+V_{CC}$]]（另外 $1.00\text{ mA}$ 维持芯片内部电路偏置并经 $-V_{EE}$ 回流），输入端贡献仅 $0.0002\text{ mA}$（仅约万分之零点四）。`,
            },
          ],
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简 · **工况 B（灌电流，$v_o = -4.0\text{ V}$）**`,
          steps: [
            { label: '1', text: R`先算负载电流：$i_o = \dfrac{-4.0\text{ V}}{1\text{ k}\Omega} = -4.0000\text{ mA}$（负号表示电流从地经 $R_L$ 倒灌进运放输出脚）` },
            { label: '2', text: R`代入 $i_-$ 通式：`, tex: R`i_- = -4.0000 - 0.0001 - 0.0001 - 1.0000 = -5.0002\text{ mA} \approx -5.00\text{ mA}` },
            {
              label: '3',
              text: R`**物理读解**：[[i_minus|$i_- = -5.0002\text{ mA}$]] 的负号意味着实际有 $5.0002\text{ mA}$ 电流从芯片的 $-V_{EE}$ 引脚**流出**并回到 $-9\text{ V}$ 电源负极（其中 $4.00\text{ mA}$ 来自负载倒灌，$1.00\text{ mA}$ 来自正电源静态偏置）。KCL 严丝合缝！`,
            },
          ],
        },
        { kind: 'note', tone: 'tip', text: '左侧 02 层切到「灌电流 −4 V」就是工况 B；拖动 R_L 滑块，看 i₊、i₋ 怎样跟着负载电流变，而 Eq. (5.1) 的合计始终等于 i_o。' },
      ],
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '剥开环氧树脂——内部 VCVS 受控源模型与 Table 5.1 参数数量级',
      sync: { layer: L3, halo: ['ri', 'vcvs', 'ro'], params: P({ chip: 'lm741', explode: 70, overlay: true, vd3: 50, rl3: 2 }) },
      blocks: [
        { kind: 'p', text: R`**前置衔接**：${code('W1-L2 受控源')}、${code('W2-L7 戴维南等效')}` },
        {
          kind: 'p',
          text: R`**本幕目标**：掌握真实运放的线性区等效电路（$R_i$、$A v_d$、$R_o$），熟知 Sadiku **Table 5.1** 真实参数数量级与分贝增益 $A_{\text{dB}}$，并用戴维南分压算清输出电阻 $R_o$ 的真实负载效应。`,
        },
        { kind: 'p', text: '**3.1 剥壳后的三大核心元件**' },
        {
          kind: 'p',
          text: R`把塑料封装剥开，无论内部是 20 颗还是 50 颗晶体管，只要运放工作在线性区，对外端口的电气行为都可以用 ${code('W1-L2')} 学过的 [[vcvs|**压控电压源（VCVS）**]] 和 ${code('W2-L7')} 学过的 **戴维南等效电路** 精准刻画：`,
        },
        {
          kind: 'ol',
          items: [
            R`**输入端口等效**：反相端 $v_1$ 与同相端 $v_2$ 之间跨接一个极大的[[ri|**输入电阻 $R_i$**]]。定义[[vd|差模输入电压（Differential Input Voltage）]]为：$v_d = v_2 - v_1$。注意减法顺序永远是 **“同相端（+）减反相端（−）”**！`,
            R`**核心放大引擎**：输出侧含有一个[[vcvs|压控电压源（VCVS）]]，其空载输出电压为：$v_{oc} = A v_d = A (v_2 - v_1)$。这里的 $A$ 称为**开环差模电压增益（Open-loop Voltage Gain）**。`,
            R`**输出端口等效**：受控源 $A v_d$ 并非直接连到输出引脚，而是串联了一个很小的[[ro|**输出电阻 $R_o$**]]——这正是我们在 ${code('W2-L7')} 学过的标准戴维南等效结构！`,
          ],
        },
        { kind: 'p', text: R`**3.2 内联原理图：真实运放内部 VCVS 等效电路（含外部负载 $R_L$）**` },
        { kind: 'figure', svg: SHEET_ACT3, caption: '图 3-2：真实运放内部剥壳 VCVS 受控源等效电路模型' },
        { kind: 'p', text: '**3.3 Sadiku Table 5.1：真实参数范围与理想模型对照**' },
        { kind: 'p', text: '下表严格对应 Sadiku **Table 5.1 (p. 176)**，把真实芯片的数量级和我们下一课要用的理想化极限并排摆在一起：' },
        {
          kind: 'table',
          head: ['参数名称', '符号', '真实运放典型范围 (Table 5.1)', '典型值示例（LM741 / LM358）', '理想运放值', '工程直觉与物理意义'],
          rows: [
            [R`[[vcvs|**开环差模增益**]]`, R`$A$`, R`$10^5\text{–}10^8$`, R`$10^5\text{–}2\times 10^5$`, R`$\infty$`, R`极小的 $v_d$ 就能撬动伏特级输出`],
            [
              R`[[gain_db|**分贝开环增益**]]`,
              R`$A_{\text{dB}}$`,
              R`$100\text{–}160\text{ dB}$`,
              R`$100\text{–}106\text{ dB}$`,
              R`$\infty\text{ dB}$`,
              '工程数据手册用对数标尺表示巨大倍数',
            ],
            [R`[[ri|**输入电阻**]]`, R`$R_i$`, R`$10^5\text{–}10^{13}\ \Omega$`, R`$2\text{ M}\Omega$`, R`$\infty\ \Omega$`, '几乎不从前级信号源“吸电流”，避免加载效应'],
            [R`[[ro|**输出电阻**]]`, R`$R_o$`, R`$10\text{–}100\ \Omega$`, R`$75\ \Omega$`, R`$0\ \Omega$`, R`像强壮的电压源，带 $\text{k}\Omega$ 级负载压降极小`],
            ['**电源电压**', R`$V_{CC}$`, R`$5\text{–}24\text{ V}$`, R`$\pm 9\text{ V}$（本课）`, '—', '划定输出电压的天花板与地板'],
          ],
        },
        { kind: 'p', text: '**3.4 教授三段式板书推导：分贝增益换算与戴维南负载分压误差**' },
        {
          kind: 'p',
          text: R`**算例设定**：已知某真实运放开环增益 $A = 10^5$，输入电阻 $R_i = 2\text{ M}\Omega$，输出电阻 $R_o = 75\ \Omega$，双电源供电 $\pm 9\text{ V}$。现令差模输入电压 $v_d = +50\ \mu\text{V}$，输出端接负载电阻 $R_L = 2\text{ k}\Omega$。求：（a）分贝增益 $A_{\text{dB}}$；（b）输入电流 $i_{\text{in}}$；（c）带载输出电压 $v_o$ 与加载压降百分比。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`1. 电压增益的分贝（dB）定义（Sadiku Section 5.2）：$\displaystyle A_{\text{dB}} = 20 \log_{10} A$。2. 输入侧欧姆定律与输出侧戴维南分压原理（${code('W2-L7')}）：$\displaystyle i_{\text{in}} = \frac{v_d}{R_i}, \qquad v_o = \frac{R_L}{R_o + R_L} \cdot v_{oc}, \qquad v_{oc} = A v_d$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：联立消去中间量 $v_{oc}$，得到带载输出电压与相对压降误差 $\varepsilon_{\text{load}}$ 的纯符号通式`,
          tex: R`\begin{gathered} v_o = \left(\frac{R_L}{R_o + R_L}\right) A v_d \\ \varepsilon_{\text{load}} = \left(1 - \frac{R_L}{R_o + R_L}\right) \times 100\% = \frac{R_o}{R_o + R_L} \times 100\% \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`1. [[gain_db|分贝增益]]`,
              tex: R`A_{\text{dB}} = 20 \log_{10}(10^5) = 20 \times 5 = 100\text{ dB}`,
            },
            {
              label: '换算对照',
              text: R`（若 $A = 10^8$，同理 $A_{\text{dB}} = 20 \times 8 = 160\text{ dB}$；若 $A = 2 \times 10^5$，则 $A_{\text{dB}} = 20 \log_{10}(2\times 10^5) \approx 106.02\text{ dB}$。）`,
            },
            {
              label: R`2. [[ri|输入电流]]`,
              tex: R`i_{\text{in}} = \frac{50 \times 10^{-6}\text{ V}}{2 \times 10^{6}\ \Omega} = 25 \times 10^{-12}\text{ A} = 25\text{ pA}`,
            },
            { label: '数量级', text: R`区区 $25\text{ pA}$（皮安），比常见毫安级信号电流小 8 个数量级！` },
            {
              label: R`3. [[vcvs|空载 VCVS 电压]]与[[rl_load|带载输出电压]]`,
              tex: R`\begin{gathered} v_{oc} = 10^5 \times (50 \times 10^{-6}\text{ V}) = +5.000\text{ V} \\ v_o = \frac{2000\ \Omega}{75\ \Omega + 2000\ \Omega} \times 5.000\text{ V} = \frac{2000}{2075} \times 5.000\text{ V} \approx 4.8193\text{ V} \end{gathered}`,
            },
            {
              label: R`4. 输出电流与[[ro|负载压降误差]]`,
              tex: R`i_o = \frac{4.8193\text{ V}}{2000\ \Omega} \approx 2.4096\text{ mA}, \qquad \varepsilon_{\text{load}} = \frac{75}{2075} \times 100\% \approx 3.61\%`,
            },
          ],
        },
        {
          kind: 'p',
          text: R`可见在 $R_L = 2\text{ k}\Omega$ 时，$75\ \Omega$ [[ro|输出电阻]]仅吃掉了 $3.61\%$ 的电压，这就是为什么我们必须坚持使用 **$\text{k}\Omega$ 级负载**（如果误接 $10\ \Omega$ 负载，绝大部分电压都会白白掉在芯片内部的 $R_o$ 上并导致芯片过热）。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: R`微伏级悬崖——三区传输特性曲线、$3\text{ mV}$ 失调电压与双/单电源摆幅`,
      sync: { layer: L4, halo: ['region_pos', 'region_lin', 'region_neg'], params: P({ sup: 'dual', vd4: 50 }) },
      blocks: [
        {
          kind: 'p',
          text: R`**本幕目标**：彻底吃透真实运放的**三区传输特性**（正饱和、极窄线性区、负饱和），算出 $\pm 90\ \mu\text{V}$ 饱和悬崖，理解 $3\text{ mV}$ 输入失调电压为何会让开环运放必然“拍顶”，并分清双电源 $\pm 9\text{ V}$ 与单电源 $+9\text{ V}/0\text{ V}$ 的真实摆幅差异。`,
        },
        { kind: 'p', text: '**4.1 输出电压的物理天花板：三区传输特性**' },
        {
          kind: 'p',
          text: R`上一幕的公式 $v_o = A v_d$ 有一个铁律前提：**输出电压绝不可能超过供电轨**！运放不是升压器，在 Sadiku 的简化三区模型下，无论你给多大的差模输入 $v_d$，输出电压都被牢牢锁在 $[-V_{EE}, +V_{CC}]$ 之间，划分为三个工作区：`,
        },
        {
          kind: 'ol',
          items: [
            R`[[region_pos|**正饱和区（Positive Saturation）**]]：当 $v_d > +\frac{V_{CC}}{A}$ 时，输出被削平在 $+V_{CC}$；`,
            R`[[region_lin|**线性放大区（Linear Region）**]]：当 $-\frac{V_{EE}}{A} \le v_d \le +\frac{V_{CC}}{A}$ 时，输出严格按 $v_o = A v_d$ 线性变化；`,
            R`[[region_neg|**负饱和区（Negative Saturation）**]]：当 $v_d < -\frac{V_{EE}}{A}$ 时，输出被削平在 $-V_{EE}$。`,
          ],
        },
        { kind: 'p', text: R`**4.2 真实芯片的摆幅折损：双电源 $\pm 9\text{ V}$ vs 单电源 $+9\text{ V} / 0\text{ V}$**` },
        {
          kind: 'p',
          text: '在理想教材曲线里，输出可以顶到 +9 V 和 −9 V；但同学们把 LM358 插到面包板上接示波器时，立刻会发现两个非常真实的硬件细节：',
        },
        {
          kind: 'ul',
          items: [
            R`**双电源 $\pm 9\text{ V}$ 模式（本课默认）**：输出可在正负之间对称摆动，正饱和上限受内部输出级晶体管压降限制，实际约停在 [[swing_real|**$+7.5\text{ V}$**]]（即 $V_{CC} - 1.5\text{ V}$），负饱和下限在 LM358 上可逼近 **$-8.9\text{ V}$**（LM741 则在约 $\pm 7.5\text{ V}$）。`,
            R`[[single_supply|**单电源 $+9\text{ V} / 0\text{ V}$ 模式**]]：若只用台式可调直流电源（单 $+9\text{ V}$）的 + 路，将 Pin 4 直接接 GND（$0\text{ V}$）。此时芯片**彻底失去负电压输出能力**；LM358 的输出下限可贴近 **$0\text{ V}$**（典型 $5\text{–}20\text{ mV}$），而输出上限依旧被限制在约 **$+7.5\text{ V}$**。`,
          ],
        },
        { kind: 'p', text: '**4.3 内联原理图：三区传输特性曲线与微伏级线性区放大窗口**' },
        { kind: 'figure', svg: SHEET_ACT4, caption: '图 4-3：真实运放三区传输特性曲线与微伏级线性区放大窗口及双单电源摆幅对比' },
        { kind: 'p', text: R`**4.4 教授三段式板书推导：$\pm 90\ \mu\text{V}$ 饱和悬崖与 $3\text{ mV}$ 输入失调电压直觉**` },
        {
          kind: 'p',
          text: R`**算例设定**：在双电源 $\pm 9\text{ V}$、开环增益 $A = 10^5$ 的条件下，求：（a）线性区的差模输入边界 $v_{d,\text{sat}}$ 与总窗口宽度 $\Delta v_{d,\text{lin}}$；（b）若真实芯片存在典型的 [[vos|$V_{OS} = 3\text{ mV}$ 输入失调电压]]，即使在面包板上将两个输入脚直接短接到地，该失调电压是饱和边界的多少倍？`,
        },
        { kind: 'origin', title: '① 公理溯源', text: R`线性区需同时满足 $v_o = A v_d$ 与电源轨约束 $-V_{EE} \le v_o \le +V_{CC}$。` },
        {
          kind: 'formula',
          title: '② 纯符号通式：将线性方程代入电源轨约束，解出线性区边界与总宽度',
          tex: R`\begin{gathered} -\frac{V_{EE}}{A} \le v_d \le +\frac{V_{CC}}{A} \\ \Delta v_{d,\text{lin}} = \frac{V_{CC} + V_{EE}}{A}, \qquad k_{OS} = \frac{V_{OS}}{V_{CC} / A} \end{gathered}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: R`1. [[region_lin|饱和边界与线性区总宽度]]`,
              tex: R`\begin{gathered} v_{d,\text{sat}+} = +\frac{9\text{ V}}{10^5} = +9 \times 10^{-5}\text{ V} = +90\ \mu\text{V} \\ v_{d,\text{sat}-} = -\frac{9\text{ V}}{10^5} = -9 \times 10^{-5}\text{ V} = -90\ \mu\text{V} \\ \Delta v_{d,\text{lin}} = 90\ \mu\text{V} - (-90\ \mu\text{V}) = 180\ \mu\text{V} \end{gathered}`,
            },
            {
              label: R`2. [[vos|输入失调电压倍数]]`,
              text: R`将 $V_{OS} = 3\text{ mV}$ 统一换算为微伏：$V_{OS} = 3000\ \mu\text{V}$。`,
              tex: R`k_{OS} = \frac{3000\ \mu\text{V}}{90\ \mu\text{V}} = \frac{100}{3} \approx 33.33\text{ 倍}`,
            },
            {
              label: '3. 工程直觉',
              text: R`哪怕你用镊子把真实运放的 Pin 2 和 Pin 3 死死短接在一起（理论 $v_d = 0$），芯片内部差分对晶体管制造工艺的微小失配等效出来的 $3\text{ mV}$ 失调电压，就已经超出线性区悬崖 **33.3 倍**！所以**开环运放在现实中根本不可能停在线性区**——一上电就会啪地一声拍死在正电源轨或负电源轨上。`,
            },
          ],
        },
        { kind: 'note', tone: 'tip', text: '左侧 04 层按「+3 mV 失调」：工作点瞬间飞出 μV 放大窗口，停在正饱和；再切到「+9 V/0 V」单电源，看负半边整个消失。' },
      ],
    },
    /* ---------------------------------------------------------------- act 5 (sheet 5.1–5.2) */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '工程视角与实战演练——开环即比较器、苏格拉底引导例题与诊断测验',
      sync: { layer: L4, halo: ['comparator', 'vref', 'vin'], params: P({ cmp: true, vin: 3 }) },
      blocks: [
        {
          kind: 'p',
          text: '**本幕目标**：把开环饱和转化为有用的工程视角（**比较器**），预告下一课（W3-L2）**负反馈**如何把运放锁回线性区，并完成分步实战演练与过关诊断。',
        },
        { kind: 'p', text: '**5.1 工程视角：把“悬崖”当武器——开环即比较器（Comparator）**' },
        {
          kind: 'p',
          text: R`既然开环运放几乎没有线性区，只要 $v_2$ 比 $v_1$ 高出哪怕 $0.1\text{ mV}$ 输出就立刻翻转到正饱和，只要 $v_2$ 比 $v_1$ 低出 $0.1\text{ mV}$ 输出就立刻翻转到负饱和——这在工程上并不是“废品”，而恰恰是 [[comparator|**电压比较器（Comparator）**]] 的核心工作原理！`,
        },
        {
          kind: 'ul',
          items: [
            R`**应用场景**：把 $v_1$ 接到一个[[vref|参考阈值电压]]（例如温度传感器设定的 $2.5\text{ V}$ 报警线），把 $v_2$ 接到[[vin|实时温度信号]]。一旦温度超标（$v_2 > v_1$），输出瞬间跳变到正饱和点亮报警 LED；温度降回阈值以下（$v_2 < v_1$），输出瞬间翻回负饱和（或单电源 $0\text{ V}$）熄灭 LED。`,
          ],
        },
        { kind: 'note', tone: 'tip', text: '左侧 04 层已切到比较器演示：拖动 v_in 滑过 2.5 V，看输出在两条饱和电平之间翻转、LED 跟着亮灭。' },
        { kind: 'p', text: '**5.2 内联原理图：开环比较器模式 vs 负反馈线性锁定预告**' },
      ],
      inline_svg: SHEET_ACT5,
      figure_caption: '图 5-2：开环比较器工作模式与负反馈线性区锁定对比',
    },
    /* ---------------------------------------------------------------- act 6: the guided example (sheet 5.3) */
    {
      act_index: 6,
      badge: '第 5 幕 · 引导例题',
      title: '苏格拉底式分步引导例题——剥壳算透一颗真实运放',
      sync: { layer: L4, halo: ['vd'], params: GD() },
      blocks: [
        { kind: 'p', text: '**5.3 苏格拉底式分步引导例题**' },
        { kind: 'figure', svg: ADDED_GD_ACT, caption: '引导例题的五步路线' },
        {
          kind: 'guided',
          title: '剥壳算透一颗真实运放：从线性区带载到失调饱和',
          source: 'W3-L1-SOCRATIC-01 · Alexander, Sadiku & Fredette (2026) Section 5.2',
          problem: R`某真实运放接双电源 $\pm 9\text{ V}$，内部参数为 $A = 10^5$、[[ri|$R_i = 2\text{ M}\Omega$]]、[[ro|$R_o = 75\ \Omega$]]，输出端外接[[rl_load|负载电阻 $R_L = 1.5\text{ k}\Omega$]] 到地。初始状态下测得反相端电压 $v_1 = 1.50000\text{ V}$，同相端电压 $v_2 = 1.50006\text{ V}$。请随教授分 5 步拆解其工作状态。`,
          problem_svg: ADDED_GD_PROBLEM,
          // all steps answered: the stage uncovers the numbers it hid
          done_params: { mask: false },
          steps: [
            {
              title: '第一步：判别差模输入与工作区',
              mini_svg: MINI_STEP1,
              question: R`第一步先算差模输入电压 $v_d = v_2 - v_1$，并对照 $\pm 9\text{ V}$、$A = 10^5$ 时的饱和边界（$\pm 90\ \mu\text{V}$），判断此时运放处于哪个工作区？`,
              hint: R`$v_d = v_2 - v_1, \quad v_{d,\text{sat}} = \pm \dfrac{V_{CC}}{A}$`,
              options: [
                {
                  text: R`$v_d = +60\ \mu\text{V}$，处于线性放大区`,
                  correct: true,
                  feedback: R`对！$v_d = v_2 - v_1 = +60\ \mu\text{V}$，落在 $\pm 90\ \mu\text{V}$ 的悬崖之内——此刻运放在线性放大区。`,
                },
                {
                  text: R`$v_d = -60\ \mu\text{V}$，处于线性放大区`,
                  correct: false,
                  feedback: R`停一下！你把减法顺序写反了。记住口诀：永远是同相端（+）减反相端（−），即 $v_d = v_2 - v_1$，不是 $v_1 - v_2$。`,
                },
                {
                  text: R`$v_d = +60\ \mu\text{V}$，已进入正饱和区`,
                  correct: false,
                  feedback: R`别急着判饱和！先算一下悬崖位置：$V_{CC} / A = 9\text{ V} / 10^5 = 90\ \mu\text{V}$。$+60\ \mu\text{V}$ 还没越过 $90\ \mu\text{V}$ 边界，芯片依然稳稳待在线性区里。`,
                },
              ],
              board: [
                R`\text{Step 1: } v_d = v_2 - v_1 = 1.50006 - 1.50000 = +60\ \mu\text{V}`,
                R`+60\ \mu\text{V} \in [-90\ \mu\text{V},\ +90\ \mu\text{V}] \implies \text{线性区}`,
              ],
              halo: ['vd', 'region_lin'],
              params: GD({ vd4: 60 }),
              layer: L4,
            },
            {
              title: '第二步：计算内部 VCVS 空载开路电压',
              mini_svg: MINI_STEP2,
              question: R`确认在线性区后，剥开芯片看内部受控源：[[vcvs|压控电压源 $A \cdot v_d$]] 产生的空载开路电压 $v_{oc}$ 是多少？`,
              hint: R`$v_{oc} = A \cdot v_d = 10^5 \times (60 \times 10^{-6}\text{ V})$`,
              options: [
                {
                  text: R`$+0.60\text{ V}$`,
                  correct: false,
                  feedback: R`数量级少了一位！$1\ \mu\text{V} = 10^{-6}\text{ V}$，所以 $60 \times 10^{-6} \times 10^5 = 60 \times 10^{-1} = 6.00\text{ V}$。`,
                },
                {
                  text: R`$+6.00\text{ V}$`,
                  correct: true,
                  feedback: R`正确：$v_{oc} = 10^5 \times 60 \times 10^{-6}\text{ V} = 6.00\text{ V}$，还在 $\pm 9\text{ V}$ 电源轨以内。`,
                },
                {
                  text: R`$+60.0\text{ V}$`,
                  correct: false,
                  feedback: R`60 V 既算错了指数（$10^{-6} \times 10^5 = 10^{-1}$），而且芯片供电才 $\pm 9\text{ V}$，怎么可能凭空造出 60 V？`,
                },
              ],
              board: [R`\text{Step 2: } v_{oc} = A v_d = 10^5 \times 60\times 10^{-6}\text{ V} = +6.00\text{ V}`],
              halo: ['vcvs'],
              params: GD(),
              layer: L3,
            },
            {
              title: '第三步：核验输入端电流数量级',
              mini_svg: MINI_STEP3,
              question: R`顺手算一下流过芯片[[ri|输入电阻 $R_i = 2\text{ M}\Omega$]] 的输入电流 $i_{\text{in}} = v_d / R_i$，亲眼看看为什么后续可以做“虚断”近似：`,
              hint: R`$i_{\text{in}} = \dfrac{v_d}{R_i} = \dfrac{60\times 10^{-6}\text{ V}}{2\times 10^{6}\ \Omega}$`,
              options: [
                {
                  text: R`30 pA（皮安，$3\times 10^{-11}\text{ A}$）`,
                  correct: true,
                  feedback: R`没错：$60\times 10^{-6} / (2\times 10^6) = 30 \times 10^{-12}\text{ A} = 30\text{ pA}$。皮安级的输入电流，就是下一课“虚断”近似的底气。`,
                },
                {
                  text: R`30 μA（微安，$3\times 10^{-5}\text{ A}$）`,
                  correct: false,
                  feedback: R`把 MΩ 的指数看漏啦！$60\times 10^{-6} / (2\times 10^6) = 30 \times 10^{-12}\text{ A}$，$10^{-12}\text{ A}$ 是皮安（pA），比微安还要小一百万倍！`,
                },
                {
                  text: R`30 mA（毫安，$3\times 10^{-2}\text{ A}$）`,
                  correct: false,
                  feedback: R`30 mA 足以把输入级保护二极管烧穿了，再仔细检查一下 $10^{-6}$ 除以 $10^6$ 等于多少。`,
                },
              ],
              board: [R`\text{Step 3: } i_{\text{in}} = \frac{60\times 10^{-6}}{2\times 10^{6}} = 30\text{ pA} \approx 0`],
              halo: ['ri'],
              params: GD(),
              layer: L3,
            },
            {
              title: '第四步：戴维南带载分压与 Eq. (5.1) 能量溯源',
              mini_svg: MINI_STEP4,
              question: R`接上外部[[rl_load|负载 $R_L = 1.5\text{ k}\Omega$]] 后，计入[[ro|输出电阻 $R_o = 75\ \Omega$]] 的分压，实际输出电压 $v_o$ 与负载电流 $i_o$ 是多少？这股电流由谁提供？`,
              hint: R`$v_o = \dfrac{R_L}{R_o + R_L} v_{oc}, \quad i_o = \dfrac{v_o}{R_L}$`,
              options: [
                {
                  text: R`$v_o \approx 5.714\text{ V}$，$i_o \approx 3.810\text{ mA}$，由正电源轨 $+V_{CC}$（$i_+$）提供`,
                  correct: true,
                  feedback: R`完全正确：$v_o = \dfrac{1500}{1575} \times 6.00 \approx 5.714\text{ V}$，$i_o \approx 3.810\text{ mA}$；输入端只有 30 pA，这股拉电流只能按 Eq. (5.1) 由正电源轨 $+V_{CC}$ 的 $i_+$ 供给。`,
                },
                {
                  text: R`$v_o = 6.000\text{ V}$，$i_o = 4.000\text{ mA}$，由输入端 $i_2$ 提供`,
                  correct: false,
                  feedback: R`犯了两个错：第一忽略了 75 Ω 输出电阻的分压（$1500/1575 \approx 0.9524$）；第二忘了 Eq. (5.1)，输入端只有 30 pA，根本供不出 3.81 mA！`,
                },
                {
                  text: R`$v_o \approx 5.714\text{ V}$，$i_o \approx 3.810\text{ mA}$，由输入端 $i_1$ 与 $i_2$ 共同提供`,
                  correct: false,
                  feedback: R`分压算对了，但物理图像还没转过来！回头看第 3 步：输入电流才 30 pA，负载需要的 3.810 mA 拉电流只能经 Eq. (5.1) 从正电源轨 $+V_{CC}$ 的 $i_+$ 流出。`,
                },
              ],
              board: [R`\text{Step 4: } v_o = \frac{1500}{75+1500}\times 6.00 = 5.714\text{ V}`, R`i_o = \frac{5.714}{1500} = 3.810\text{ mA}\ (\text{来自 }+V_{CC})`],
              halo: ['ro', 'rl_load'],
              params: GD(),
              layer: L3,
            },
            {
              title: '第五步：微扰触发饱和翻转（比较器直觉）',
              mini_svg: MINI_STEP5,
              question: R`现在仅让同相端电压 $v_2$ 轻轻往上抖动 0.10 mV（从 1.50006 V 变为 1.50016 V，此时 $v_d = +160\ \mu\text{V}$）。输出电压会变成多少？`,
              hint: R`$A v_d = 10^5 \times 160\ \mu\text{V} = +16\text{ V} > +V_{CC}\ (+9\text{ V})$`,
              options: [
                {
                  text: R`$+16.0\text{ V}$（线性继续放大）`,
                  correct: false,
                  feedback: R`掉进纯数学陷阱了！$A \cdot v_d = 10^5 \times 160\ \mu\text{V} = +16\text{ V}$，但供电轨只有 $\pm 9\text{ V}$，运放绝不可能变出高于电源轨的电压，它会被直接削平在正饱和区。`,
                },
                {
                  text: R`进入正饱和区：理论轨上限 $+9\text{ V}$（LM358 实测约 $+7.5\text{ V}$）`,
                  correct: true,
                  feedback: R`对！$A v_d = 16\text{ V}$ 越过了 $+9\text{ V}$ 轨，输出被削平在正饱和：理论 $+9\text{ V}$，LM358 实测约 $+7.5\text{ V}$。区区 0.1 mV 的抖动就让输出从 5.7 V 冲到电源轨——这正是比较器的直觉。`,
                },
                {
                  text: R`进入负饱和区：$-9\text{ V}$`,
                  correct: false,
                  feedback: R`注意符号：$v_d = v_2 - v_1 = +160\ \mu\text{V} > 0$，输出一定拍向正饱和轨，而不是负饱和轨。`,
                },
              ],
              board: [R`\text{Step 5: } v_d = +160\ \mu\text{V} > +90\ \mu\text{V} \implies \text{正饱和}`, R`(+9\text{ V 理论轨 / }\approx +7.5\text{ V 实测})`],
              halo: ['region_pos', 'vd'],
              params: GD({ vd4: 160 }),
              layer: L4,
            },
          ],
          conclusion: R`五步通关：$v_d = +60\ \mu\text{V}$ 在线性区，$v_{oc} = 6.00\text{ V}$，$i_{\text{in}} = 30\text{ pA}$，带载 $v_o \approx 5.714\text{ V}$、$i_o \approx 3.810\text{ mA}$（来自 $+V_{CC}$）；$v_2$ 再抬 0.10 mV，$v_d = 160\ \mu\text{V}$ 越过 $90\ \mu\text{V}$ 边界，输出拍到正饱和。左侧 03 / 04 层的数值已经揭晓，可以拖动滑块复盘。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 7: the diagnostic quiz (sheet 5.4) */
    {
      act_index: 7,
      badge: '诊断测验',
      title: '课后诊断测验——四个真实运放考点',
      sync: { layer: L1, halo: [], params: P() },
      blocks: [
        { kind: 'p', text: '**5.4 课后诊断测验（4 题）**' },
        {
          kind: 'p',
          text: '四道题分别对应本课的四个考点：DIP-8 引脚与面包板安全、Eq. (5.1) 供电轨 KCL、Table 5.1 参数与 VCVS 模型、三区传输曲线与单/双电源摆幅。四题全部答对即通关。',
        },
      ],
      inline_svg: ADDED_QUIZ_ACT,
      figure_caption: '诊断测验的四个考点',
      quiz: [
        {
          id: 'w3l1_q1',
          concept: 'LM358 与 LM741 引脚差异',
          review_act: 1,
          question: R`某同学在面包板上按 LM741 的接线方式搭好了双电源 $\pm 9\text{ V}$ 电路（Pin 7 接 +9 V，Pin 4 接 −9 V），实验中途发现 LM741 坏了，于是直接拔下来换插了一颗 LM358。上电后会发生什么？`,
          options: [
            {
              key: 'A',
              text: '正常工作，因为两者都是 DIP-8 运放且 Pin 2/3/4 完全一致',
              correct: false,
              feedback: R`Pin 2/3/4 确实一致，但正电源脚不一样：LM741 的 $V_{CC}$ 在 Pin 7，而 LM358 的 Pin 7 是第二路输出 OUT2，它真正的正电源脚 Pin 8 在 LM741 的接法里是空着的 NC 位置。封装相同不等于引脚兼容。`,
            },
            {
              key: 'B',
              text: '芯片可能损坏：LM358 的正电源脚是 Pin 8，而 Pin 7 是第二路输出 OUT2，把 +9 V 强行接到 OUT2 会造成供电错接与过流风险',
              correct: true,
            },
            {
              key: 'C',
              text: '输出电压自动减半，但不会有任何安全隐患',
              correct: false,
              feedback: '芯片不会“自动减半”：+9 V 被直接接到 LM358 的 OUT2（Pin 7）输出级，而它的正电源脚 Pin 8 根本没通电——这是供电错接，伴随过流发热的风险，谈不上安全。',
            },
            {
              key: 'D',
              text: '只需把芯片旋转 180 度倒插即可兼容',
              correct: false,
              feedback:
                '倒插后，原来 Pin 4 的孔里是 LM358 的 Pin 8（V+），原来 Pin 7 的孔里是 Pin 3（IN1+）：−9 V 被接到正电源脚、+9 V 打进同相输入端，电源反接，比不改线更危险。唯一正确的做法是按 LM358 的引脚重新接线。',
            },
          ],
          feedback_correct: R`LM358 与 LM741 虽同为 DIP-8 且 Pin 4 均为负电源/地，但正电源 $V_{CC}$ 在 LM358 是 Pin 8，在 LM741 却是 Pin 7（LM358 的 Pin 7 是 OUT2）。严禁未改线直接互换，也绝不可旋转 180 度倒插。`,
          feedback_wrong: '对照第 1 幕的引脚表：两颗芯片的正电源脚各在第几脚？LM358 的 Pin 7 是什么？',
          figure: ADDED_Q1,
          sync: { layer: L1, halo: ['chip_lm741_p7', 'chip_lm741_p4'], params: P({ chip: 'lm741', pins1: 'power', cam1: 'iso' }) },
        },
        {
          id: 'w3l1_q2',
          concept: '供电轨 KCL（Eq. 5.1）',
          review_act: 2,
          question: R`某双电源运放输出端处于灌电流（Sinking）状态，负载电流 $i_o = -4.0\text{ mA}$（即 4.0 mA 从外部负载倒灌进运放输出脚），已知输入电流 $i_1$、$i_2$ 均为纳安级可忽略，正电源静态流入电流 $i_+ = +1.0\text{ mA}$。根据 Sadiku Eq. (5.1)（$i_o = i_1 + i_2 + i_+ + i_-$），负电源引脚的电流 $i_-$ 约为多少？`,
          options: [
            {
              key: 'A',
              text: R`$+3.0\text{ mA}$（3.0 mA 从 $-V_{EE}$ 流入芯片）`,
              correct: false,
              feedback: R`+3.0 mA 是把 $i_o$ 的符号弄反了（$4.0 - 1.0$）。灌电流时 $i_o = -4.0\text{ mA}$，代入 Eq. (5.1)：$i_- = i_o - i_1 - i_2 - i_+ \approx -4.0 - 1.0$。`,
            },
            {
              key: 'B',
              text: R`$-3.0\text{ mA}$（3.0 mA 从芯片经 $-V_{EE}$ 流出）`,
              correct: false,
              feedback: R`−3.0 mA 把正电源的静态电流当成了“抵消”灌电流（$-4.0 + 1.0$）。可 $i_+ = +1.0\text{ mA}$ 也是流入芯片的，它和倒灌进来的 4.0 mA 一样都得从 $-V_{EE}$ 脚出去，移项时 $i_+$ 前面是减号。`,
            },
            {
              key: 'C',
              text: R`$-5.0\text{ mA}$（5.0 mA 从芯片经 $-V_{EE}$ 流出至负电源轨）`,
              correct: true,
            },
            {
              key: 'D',
              text: R`0 mA，灌电流全部经输入脚流走了`,
              correct: false,
              feedback: '输入脚只有纳安级电流，承担不了毫安级的灌电流。封闭面上能把倒灌进来的电流送走的，只剩负电源脚。',
            },
          ],
          feedback_correct: R`由 Eq. (5.1) 得 $i_- = i_o - i_1 - i_2 - i_+ \approx -4.0 - 0 - 0 - 1.0 = -5.0\text{ mA}$。负号说明 5.0 mA 实际从芯片 $-V_{EE}$ 引脚流出，回到 −9 V 电源负极。`,
          feedback_wrong: R`把 Eq. (5.1) 移项解出 $i_-$，注意 $i_o$ 带负号代入。`,
          figure: ADDED_Q2,
          sync: { layer: L2, halo: ['i_minus', 'kcl_box'], params: P({ load: 'sink', rl2: 1, mask: true }) },
        },
        {
          id: 'w3l1_q3',
          concept: 'Table 5.1 参数与 VCVS 模型',
          review_act: 3,
          question: R`某精密运放数据手册标称其直流开环增益为 120 dB，输出电阻 $R_o = 50\ \Omega$。则其线性倍数开环增益 $A$ 为多少？为何 Table 5.1 期望真实运放具备极高 $R_i$ 与极低 $R_o$？`,
          options: [
            {
              key: 'A',
              text: R`$A = 10^6$；高 $R_i$ 减少对前级信号源的吸流（加载效应），低 $R_o$ 减少驱动外部负载时的内部压降`,
              correct: true,
            },
            {
              key: 'B',
              text: R`$A = 10^{12}$；高 $R_i$ 用来增大输入电流，低 $R_o$ 用来限制输出功率`,
              correct: false,
              feedback: R`$10^{12}$ 是按 $10\log_{10}$（功率比的分贝）算的：120 / 10 = 12。电压增益的分贝是 $A_{\text{dB}} = 20\log_{10}A$，120 / 20 = 6。另外高 $R_i$ 恰恰是为了**减小**输入电流，低 $R_o$ 是为了减小内部压降，不是限制输出功率。`,
            },
            {
              key: 'C',
              text: R`$A = 1.2 \times 10^5$；$R_i$ 与 $R_o$ 对电路性能没有影响`,
              correct: false,
              feedback: R`$1.2 \times 10^5$ 是把分贝数直接当成了倍数。分贝是对数标尺，要用 $A = 10^{A_{\text{dB}}/20}$ 换回去。$R_i$、$R_o$ 也绝非无关：第 3 幕算过，$R_o = 75\ \Omega$ 带 2 kΩ 负载就吃掉 3.61% 的电压。`,
            },
            {
              key: 'D',
              text: R`$A = 10^6$；高 $R_i$ 是为了提高芯片散热效率`,
              correct: false,
              feedback: R`增益算对了，但 $R_i$ 与散热无关：高输入电阻的作用是几乎不从前级信号源吸电流（避免加载效应）；还要说出低 $R_o$ 的作用——让输出端更接近理想电压源。`,
            },
          ],
          feedback_correct: R`由 $A_{\text{dB}} = 20 \log_{10}(A) = 120\text{ dB}$ 得 $\log_{10}(A) = 6$，即 $A = 10^6$。高输入电阻 $R_i$ 避免吸取前级信号电流，低输出电阻 $R_o$ 使输出端更接近理想电压源。`,
          feedback_wrong: R`电压增益的分贝定义是 $A_{\text{dB}} = 20\log_{10}A$；再想想 $R_i$、$R_o$ 分别出现在输入侧和输出侧的哪个分压里。`,
          figure: ADDED_Q3,
          sync: { layer: L3, halo: ['ri', 'ro'], params: P({ chip: 'lm741', explode: 100, overlay: true }) },
        },
        {
          id: 'w3l1_q4',
          concept: '三区饱和与单电源摆幅',
          review_act: 4,
          question: '使用单节 9 V 电池给一颗真实 LM358 供电（Pin 8 接 +9 V，Pin 4 接 0 V），且未接任何负反馈（开环）。下列说法正确的是？',
          options: [
            {
              key: 'A',
              text: '只要把两个输入端短接到地，输出就会稳定停在 +4.5 V',
              correct: false,
              feedback:
                '+4.5 V 是“电源中点”的直觉。但开环增益 10⁵ 下线性区只有微伏宽，而约 3 mV 的输入失调电压远超这个宽度：输入短接后输出仍被推到某一侧的饱和电平，不可能稳在中点。',
            },
            {
              key: 'B',
              text: '因存在典型 ~3 mV 输入失调电压（远超微伏级线性区），输出会直接饱和；其下限可贴近 0 V，上限约受限于 +7.5 V，无法输出负电压',
              correct: true,
            },
            {
              key: 'C',
              text: '输出可以在 −9 V 到 +9 V 之间对称摆动',
              correct: false,
              feedback: 'Pin 4 接的是 0 V，芯片里没有比 0 V 更低的电位可用，输出不可能变成负电压；对称摆动需要双电源 ±9 V。',
            },
            {
              key: 'D',
              text: '开环运放永远不能在工程中使用',
              correct: false,
              feedback: '开环不等于没用：第 5 幕讲过，开环运放正是电压比较器的工作方式（例如温度超标报警），在工程中大量使用。',
            },
          ],
          feedback_correct:
            '开环增益极高导致线性区仅微伏级，3 mV 输入失调电压会直接把输出推向饱和；LM358 在单 +9 V 供电下下限接近 0 V、上限约 V_CC − 1.5 V ≈ +7.5 V。且开环模式在工程中广泛用作比较器。',
          feedback_wrong: '先比一比失调电压和线性区的宽度，再想想 Pin 4 接 0 V 时输出最低能到哪里。',
          figure: ADDED_Q4,
          sync: { layer: L4, halo: ['vos'], params: P({ sup: 'dual', mask: true }) },
        },
      ],
      after_quiz: [
        { kind: 'p', text: '**下节预告：W3-L2 理想运放与虚短虚断**' },
        {
          kind: 'p',
          text: R`**引出下一课（W3-L2）**：那如果我们想做**线性放大器**（比如把麦克风的 $10\text{ mV}$ 语音信号不失真地放大 100 倍到 $1\text{ V}$），绝不能让运放开环裸奔！我们必须在输出端与反相输入端之间拉一条**负反馈（Negative Feedback）**通路，利用负反馈自动把 $v_d$ 死死按回 $0\text{ V}$ 附近的微伏级线性区内——这就是下一课“理想运放与虚短虚断”的全部奥秘。`,
        },
      ],
    },
  ],
};

export default W3_L1;
