// W4-L1 · 电容的物理结构、微分伏安关系与电场储能 (lesson sheet: docs/lessons/W4-L1.md).
// The professor's text of the five acts is reproduced from the sheet as written; [[id|…]] only
// links a term to the stage (the words are unchanged). Changes of form, none of wording:
// - acts 1 and 2 each talk to two stage set-ups, so they are split where the sheet's own
//   sub-headings fall: act 1 → 1.1–1.2 (layer 02 teardown), 1.3–1.4 (layer 01 breadboard) and
//   1.5 Example 1 (layer 02 again); act 2 → 2.1–2.4 (Example 2) and 2.5 (Example 3); the
//   self-test is an act of its own. A continuation act takes its title from the sheet's heading;
// - sub-headings are bold lines; display formulas sit in the ①/②/③ cards (a lead-in sentence
//   becomes the card title); the professor's asides are tip notes; the numbered items with
//   sub-bullets run as a bold line and a list;
// - plain-text symbols of the JSON parts (R5, VC1, w_total …) are set as TeX; the guided
//   options and quiz options lose their "A. " prefixes (the page letters them);
// - the lab supply: 「5 V / 9 V 直流稳压电源或 9 V 电池扣」 is the bench supply
//   「台式可调直流电源（5 V）」 (course owner rule; the breadboard only needs 5 V);
// - anti-spoiler: no worked example shares the guided example's problem; the guided example's
//   step 1, 2 and 4 mini diagrams drew their answers (C2 already open, R_par = 2 kΩ, v_R5 = 0 and
//   V_C2 = V_2) and now ask instead (svgs.ts), and layer 04 hides the example's numbers while it
//   runs (stage param `gd`; `done_params` uncovers them);
// - dev-facing text is left out: the YAML keys, "（内联 2D 图解）"-style headings (they become
//   figure captions), "JSON" in the headings, the concept radar / passing score, and the closing
//   "Claude 工程落地清单" (its stage spec is what the four layers build).
// Added: the safety capsule at the top of the polarity act (from the sheet's safety and scaling
// block), short tips that point to the stage, the guided example's step titles and conclusion,
// the quiz figures and per-option feedback (written from the sheet's explanations), and the
// figures of acts that had none (the water tank, Example 1, Example 3, the self-test).

import { lazy } from 'react';
import { genericLabel } from '../../breadboardIds';
import type { StageLesson } from '../../types';
import { EX5 } from './model';
import {
  MINI_STEP1,
  MINI_STEP2,
  MINI_STEP3,
  MINI_STEP4,
  MINI_STEP5,
  SVG_EX1,
  SVG_EX3,
  SVG_FIG11,
  SVG_FIG21,
  SVG_FIG31,
  SVG_FIG41,
  SVG_FIG51,
  SVG_Q1,
  SVG_Q2,
  SVG_Q3,
  SVG_Q4,
  SVG_QUIZ_ACT,
  SVG_TANK,
} from './svgs';

const Device3D = lazy(() => import('./Device3D'));
const Teardown3D = lazy(() => import('./Teardown3D'));
const Waves = lazy(() => import('./Waves'));
const DcBench = lazy(() => import('./DcBench'));

const R = String.raw;
/** inline code inside String.raw text */
const code = (s: string) => '`' + s + '`';

const L1 = 'device';
const L2 = 'teardown';
const L3 = 'waves';
const L4 = 'dc';

const SUPPLY = '台式可调直流电源（5 V）';
const EX5_PARAMS = { c1: EX5.C1, c2: EX5.C2, c3: EX5.C3, c4: EX5.C4 };

const W4_L1: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Device3D, [L2]: Teardown3D, [L3]: Waves, [L4]: DcBench },
  describeTarget: genericLabel,
  lesson_meta: {
    lesson_id: 'W4-L1',
    world: 'World 4',
    title: '电容的物理结构、微分伏安关系与电场储能',
    subtitle: 'Capacitors: Physical Structure, Differential i-v Relation & Electric Field Energy Storage',
    lesson_type: 'A',
    lesson_type_label: 'Type A（器件导论课 — 含 3D 器件剥壳 + 3D 面包板认极性）',
    estimated_minutes: 55,
    textbook_primary: {
      book: 'Alexander, Sadiku & Fredette, Fundamentals of Electric Circuits, 2026 Release',
      sections: ['Section 6.1–6.3（Capacitors; Energy Storage; Series and Parallel Capacitors）'],
    },
    textbook_supplement: 'Boylestad, Introductory Circuit Analysis, 14th Edition — Chapter 10（物理直觉：弹性隔膜水箱类比与铝电解电容极性安全）',
    prerequisites: ['W1-L1 电流与电压', 'W1-L2 功率与能量', 'W1-L7 电阻串并联'],
    learning_objectives: [
      R`掌握平行板电容物理公式 $C = \varepsilon A/d$ 及电介质相对介电常数对电容量的影响`,
      '熟练识别瓷片电容（无极性）与铝电解电容（白条负极、长脚正极）并在面包板上安全插接',
      R`掌握电容微分伏安关系 $i = C\,dv/dt$ 与积分形式，理解“电容两端电压不能发生瞬时突变”的物理铁律`,
      R`掌握电场储能公式 $w = \frac{1}{2}Cv^2$ 及直流稳态下电容等效为开路的分析方法`,
      '熟练计算电容串并联等效容量与串联反比分压，理解其与电阻串并联公式“镜像相反”的物理本质',
    ],
    next_lesson: 'W4-L2',
    next_lesson_title: '电感的物理结构、电磁感应伏安关系与磁场储能',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 3D 瓷片/电解电容封装与面包板插法',
        short: '01 封装插法',
        render_mode: '3D_THREEJS_DEVICE_AND_BREADBOARD',
        caption: `01 3D 器件与面包板：切换 104 瓷片电容（无极性）/ 100 μF 25 V 铝电解电容（有极性），看白条负极与长短脚；${SUPPLY}经导线接电源轨，演练正确插接、反接报警（防爆阀鼓包）、两脚同列短路，以及断电后用 1 kΩ 电阻放电。`,
      },
      {
        id: L2,
        label: '02 3D 平行板剥壳与电场储能透视',
        short: '02 剥壳储能',
        render_mode: '3D_THREEJS_TEARDOWN',
        caption:
          '02 3D 平行板剥壳透视：滑块调极板面积 A、间距 d 与电压 v，切换电介质（空气 1 / 聚酯 3 / 云母 5 / 陶瓷 1000），实时看 C = εr·ε0·A/d、±q 电荷密度、电场线疏密与偶极子极化；左下角弹性隔膜水箱同步鼓起。',
      },
      {
        id: L3,
        label: '03 2D 原理图与分段线性 v(t)↔i(t) 微积分波形联动',
        short: '03 v↔i 波形',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '03 v(t)、i(t)、w(t) 三通道对齐波形：拖时间游标读 dv/dt、i = C·dv/dt 与 w = ½Cv²；例题 2 可把上升时间 Δt 压向 0 做斜率突变压力测试，例题 3 由电流积分求电压（可切换“漏加 v(0)”）。',
      },
      {
        id: L4,
        label: '04 串并联等效与直流稳态开路分析台',
        short: '04 串并联稳态',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '04 直流稳态与串并联分析台：例题 4 与实战题一键把电容换成开路虚线、标出零电流支路与节点电压；例题 5 混联电容可点击换容量、逐级化简，并与同数字电阻的镜像公式对照。',
      },
    ],
    hover_map: {
      /* layer 01 */
      psu: { label: SUPPLY, desc: '实验台上的台式电源：+ 端子接顶部外侧红轨（+5 V），COM 接内侧蓝轨（GND）；通电 / 断电在面板上切换' },
      rail_p5: { label: '+5 V 电源轨', desc: '顶部外侧红轨，接台式电源 +；红色跳线把它送到第 30 列' },
      rail_gnd: { label: 'GND 电源轨', desc: '顶部内侧蓝轨，接台式电源 COM；黑色跳线把它送到第 31 列' },
      jump_red: { label: '红色跳线 a30 → +5 V 轨', desc: '把第 30 列（a–e）变成 +5 V 节点：电解电容的长脚（+）插这一列' },
      jump_black: { label: '黑色跳线 a31 → GND 轨', desc: '把第 31 列（a–e）变成 GND 节点：白条一侧的短脚（−）插这一列' },
      node_p: { label: '第 30 列 a–e（+5 V）', desc: '红色跳线接到 +5 V：正确插法里长脚（+）在 c30' },
      node_n: { label: '第 31 列 a–e（GND）', desc: '黑色跳线接到 GND：正确插法里短脚（−）在 c31' },
      cap_cer: { label: '104 瓷片电容', desc: '土黄色扁圆片，104 = 10 × 10⁴ pF = 0.1 μF；无极性，两脚等长，正反都能插' },
      cap_elec: { label: '100 μF 25 V 铝电解电容', desc: '蓝色圆柱铝壳，强极性；靠阳极铝箔上纳米级氧化铝膜做介质，体积小、容量大' },
      stripe: { label: '白色负号条带', desc: '外壳侧面印一排“−”的白条：这一侧的引脚是负极（短脚），必须接低电位' },
      lead_pos: { label: '长脚 = 正极（+）', desc: '出厂较长的引脚是正极，接高电位（本台 +5 V）' },
      lead_neg: { label: '短脚 = 负极（−）', desc: '白条一侧、出厂较短的引脚是负极，接低电位（GND）' },
      vent: { label: '十字 / K 字防爆纹', desc: '铝壳顶部刻的减薄纹：反接击穿时电解液汽化，从这里鼓包泄压，严重时爆浆喷溅' },
      r_dis: { label: '1 kΩ 放电电阻（棕-黑-红-金）', desc: '断电后跨接电解电容两脚，τ = 1 kΩ × 100 μF = 0.1 s，约 0.5 s 放完残余电荷再拆' },
      vc: { label: '电容两端电压 v', desc: '长脚（+）对短脚（−）的电压：正确插接通电后为 +5 V；断电后残留，直到放电' },
      status: { label: '插接状态', desc: '正常充电 / 反接报警 / 同列短路 / 断电残留 / 已放电' },
      rating: { label: '耐压裕量（2 倍原则）', desc: '额定耐压 ≥ 2 × 电源电压：5 V 电路选 16 V 或 25 V，本课 25 V' },
      energy: { label: '电场储能 w = ½Cv²', desc: '电容两板间电场里存的能量；电压翻倍，储能变 4 倍' },
      center_trench: { label: '中央凹槽', desc: 'e 行与 f 行之间绝缘：上下两半的同一列互不相通' },
      /* layer 02 */
      plate_top: { label: '上极板（+q）', desc: '接电源正端的导电金属板：电子被抽走，带正电 +q' },
      plate_bot: { label: '下极板（−q）', desc: '接电源负端的导电金属板：电子被搬来，带负电 −q' },
      dielectric: { label: '绝缘电介质', desc: '夹在两板之间的绝缘层（空气、聚酯、云母、陶瓷）：电子穿不过去，但分子会极化' },
      eps_r: { label: '相对介电常数 εr', desc: '空气 ≈ 1，聚酯 ≈ 3，云母 ≈ 5，高介电陶瓷可达数千；ε = εr·ε0' },
      area_a: { label: '正对面积 A', desc: '两板正对的有效面积：越大，“停车场”越大，C 越大（C ∝ A）' },
      gap_d: { label: '极板间距 d', desc: '两板距离：越近，异种电荷吸得越紧，C 越大（C ∝ 1/d）' },
      volt_v: { label: '外加电压 v', desc: '电源加在两板间的电压：q = Cv，E = v/d，w = ½Cv²' },
      charge_q: { label: '极板电荷 ±q', desc: 'q = Cv：两板上等量异号的电荷；小圆点的多少随 q 增减（对数刻度示意）' },
      efield: { label: '电场 E', desc: '从 +q 板指向 −q 板的匀强电场，E = v/d：固定电压时只取决于间距' },
      dipole: { label: '介质偶极子', desc: '插入电介质后分子偶极子顺电场排列（− 端朝 +q 板），部分削弱内部电场，同等电压下能容纳更多电荷' },
      cap_c: { label: '电容量 C', desc: 'C = εr·ε0·A/d，单位法拉 F（1 F = 1 C/V）；面包板常见 μF、nF、pF' },
      tank: { label: '弹性隔膜水箱（Boylestad）', desc: '水管中间绷一张橡胶隔膜：水穿不过去，但左进多少、右出多少；隔膜鼓起 ↔ 电荷 q，绷紧 ↔ 电场储能' },
      membrane: { label: '橡胶隔膜', desc: '对应电介质 + 电场：鼓得越多（q 越大），反推力（电压）越大，储存的能量越多' },
      /* layer 03 */
      v_t: { label: '电容电压 v(t)', desc: '一条连续曲线：可以有折角，但绝不能有垂直断崖' },
      i_t: { label: '电容电流 i(t)', desc: 'i = C·dv/dt：只看电压变化有多快，可以瞬时跳变（方波）' },
      w_t: { label: '储能 w(t) = ½Cv²', desc: '只和电压的平方有关：v = ±10 V 时都是最大值' },
      slope: { label: '斜率 dv/dt', desc: '当前线段的电压变化率（V/s）；乘以 C 就是电流' },
      cursor: { label: '时间游标 t', desc: '拖动它，读出该时刻的 v、dv/dt、i、w 与 p = vi' },
      rise_test: { label: '斜率突变压力测试 Δt', desc: '把第一段 0 → 10 V 的上升时间压短：i = C·10 V/Δt，Δt → 0 时 i → ∞' },
      power: { label: '瞬时功率 p = vi', desc: 'p > 0：电容从电路吸能存进电场；p < 0：把能量原封不动还回电路' },
      charge_int: { label: '累积电荷 ∫i dτ', desc: '电流曲线下的面积 = 流进电容的电荷；除以 C 就是电压的变化量' },
      v0: { label: '初值 v(t₀)', desc: '积分伏安关系末尾那一项：电容在初始时刻已经存着的电压——千万别漏加' },
      /* layer 04: example 4 */
      e4_vs: { label: '例题 4 电源 Vs = 12 V', desc: '直流电压源，经 R1 给整个网络供电' },
      e4_r1: { label: 'R1 = 3 kΩ', desc: '干路电阻：总电流 Is 全部流过它' },
      e4_r2: { label: 'R2 = 6 kΩ', desc: '节点 A 对地；C1 与它并联' },
      e4_r3: { label: 'R3 = 2 kΩ', desc: '节点 A → 节点 B 的串联电阻' },
      e4_r4: { label: 'R4 = 4 kΩ', desc: '节点 B 对地；C2 与它并联' },
      e4_c1: { label: 'C1 = 10 μF', desc: '跨接节点 A 与地：稳态电压 = VA' },
      e4_c2: { label: 'C2 = 20 μF', desc: '跨接节点 B 与地：稳态电压 = VB' },
      e4_na: { label: '节点 A', desc: 'R1、R2、R3、C1 的公共节点' },
      e4_nb: { label: '节点 B', desc: 'R3、R4、C2 的公共节点' },
      /* layer 04: the guided example */
      g_vs: { label: '实战题电源 Vs = 9 V', desc: '直流电压源，经 R1 = 1 kΩ 给网络供电' },
      g_r1: { label: 'R1 = 1 kΩ', desc: '干路电阻' },
      g_r2: { label: 'R2 = 3 kΩ', desc: '节点 1 对地；C1 与它并联' },
      g_r3: { label: 'R3 = 3 kΩ', desc: '节点 1 → 节点 2 的串联电阻' },
      g_r4: { label: 'R4 = 3 kΩ', desc: '节点 2 对地' },
      g_r5: { label: 'R5 = 2 kΩ（与 C2 串联）', desc: '从节点 2 经 R5 才到 C2：直流稳态下这条支路里有没有电流？先想清楚再答' },
      g_c1: { label: 'C1 = 100 μF（25 V）', desc: '直接并联在 R2 两端（节点 1 对地），极性上正下负' },
      g_c2: { label: 'C2 = 200 μF（25 V）', desc: '经 R5 接在节点 2 与地之间，极性上正下负' },
      g_na: { label: '节点 1（V1）', desc: 'R1、R2、R3、C1 的公共节点' },
      g_nb: { label: '节点 2（V2）', desc: 'R3、R4、R5 的公共节点' },
      /* layer 04: shared */
      dc_open: { label: '直流稳态开路替换', desc: 'dv/dt = 0 ⇒ iC = 0：把电容画成断开的虚线空口，标好原来的极性与节点' },
      i_zero: { label: '零电流支路', desc: '电容开路后它所在支路电流为 0：串在这条支路里的电阻压降也为 0' },
      is_total: { label: '总电阻与总电流', desc: '电容开路后剩下的纯电阻网络：Req 与 Is = Vs/Req' },
      w_c: { label: '各电容储能', desc: 'wC = ½ C VC²' },
      w_total: { label: '总储能', desc: '各电容储能之和（例题 5 也可用 ½ Ceq Vs² 验算）' },
      /* layer 04: example 5 */
      x_vs: { label: '例题 5 电源 Vs = 9 V', desc: '直流电源，四颗电容初始均未充电' },
      x_c1: { label: 'C1（串联前端）', desc: '串在干路上：总电荷 Q 全部经过它，VC1 = Q/C1' },
      x_c2: { label: 'C2', desc: '与 C3–C4 串联支路并联：两端电压 = V234' },
      x_c3: { label: 'C3', desc: '与 C4 串联：两者电荷相等，反比分压' },
      x_c4: { label: 'C4', desc: '与 C3 串联：两者电荷相等，反比分压' },
      x_c34: { label: 'C34 = C3 与 C4 串联', desc: '倒数相加：C34 = C3·C4/(C3 + C4)，比最小的那颗还小' },
      x_c234: { label: 'C234 = C2 ∥ C34', desc: '并联直接相加：C234 = C2 + C34' },
      x_ceq: { label: '总等效电容 Ceq', desc: 'C1 与 C234 串联：Ceq = C1·C234/(C1 + C234)；总电荷 Q = Ceq·Vs' },
      mirror: { label: '镜像对照', desc: '同样的数字换成电阻、同样的连接：串联与并联的公式正好对调' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1: 1.1–1.2 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '剥开电容——物理结构、弹性隔膜直觉与面包板极性铁律',
      sync: { layer: L2, halo: ['plate_top', 'plate_bot', 'dielectric'], params: { tdA: 20, tdD: 1, tdEr: 'air', tdV: 5, peel: true } },
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎进入第四周！前三周我们打交道的电阻是电路里的“耗能苦力”——电流一过，电能立刻变成热量散失，永远不会还给你。今天我们要认识第一位**储能元件（Energy-Storage Element）**：**电容（Capacitor）**。它不烧能量，它把电能存进两块金属板之间的**电场**里，需要时再还给电路。更迷人的是，它的电压和电流不再是简单的欧姆定律乘法关系，而是第一次把**微积分**请进了我们的电路方程。准备好了吗？我们从把一颗电容剥开来看开始。`,
        },
        { kind: 'p', text: '**1.1 电容长什么样？物理公式从何而来**' },
        {
          kind: 'p',
          text: R`不管外观是土黄色扁片状的**瓷片电容（Ceramic Capacitor）**，还是黑蓝圆柱状的**铝电解电容（Aluminum Electrolytic Capacitor）**，拆到最里层，所有电容的本质都只有三样东西：[[plate_top,plate_bot|**两块相互平行的导电金属极板**]]，加上中间夹着的一层[[dielectric|**绝缘电介质（Dielectric）**]]。`,
        },
        {
          kind: 'p',
          text: R`当你在两块极板间加上[[volt_v|电压 $v$]] 时，电源就像一台“电荷搬运泵”：把一块极板上的电子抽走，搬到另一块极板上。于是[[plate_top|上极板带正电 $+q$]]，[[plate_bot|下极板带负电 $-q$]]，两板之间建立起[[efield|电场]]。实验证明，极板上储存的电荷量 $q$ 与两端电压 $v$ 成正比：`,
        },
        { kind: 'formula', title: '电荷与电压成正比', tex: R`q = C v` },
        {
          kind: 'p',
          text: R`比例系数 $C$ 就是[[cap_c|**电容量（Capacitance）**]]，单位是**法拉（Farad, $\text{F}$）**，定义为 $1\ \text{F} = 1\ \text{C/V}$。由于 $1\ \text{F}$ 在普通电子电路中极其庞大，面包板上最常见的是微法（$1\ \mu\text{F} = 10^{-6}\ \text{F}$）、纳法（$1\ \text{nF} = 10^{-9}\ \text{F}$）和皮法（$1\ \text{pF} = 10^{-12}\ \text{F}$）。`,
        },
        {
          kind: 'formula',
          title: '对经典的平行板电容器而言，电容量完全由**几何尺寸**和**介质材料**决定（Sadiku Sec. 6.1）：',
          tex: R`C = \frac{\varepsilon A}{d} = \frac{\varepsilon_r \varepsilon_0 A}{d}`,
        },
        { kind: 'p', text: '其中：' },
        {
          kind: 'ul',
          items: [
            R`[[area_a|$A$ 是两极板的正对有效面积]]（$\text{m}^2$）——**面积越大，能停放电荷的“停车场”越大，$C$ 越大**；`,
            R`[[gap_d|$d$ 是两极板之间的距离]]（$\text{m}$）——**距离越近，异种电荷相互吸引得越紧，同样电压能锁住更多电荷，$C$ 越大**；`,
            R`[[eps_r|$\varepsilon = \varepsilon_r \varepsilon_0$ 是电介质的介电常数]]（$\text{F/m}$），其中真空介电常数 $\varepsilon_0 = 8.854 \times 10^{-12}\ \text{F/m}$，$\varepsilon_r$ 为相对介电常数（空气 $\approx 1$，云母 $\approx 5$，高介电陶瓷可达数千）。插入电介质后，介质内部[[dipole|分子偶极子发生极化]]，部分削弱内部电场，从而在同等电压下容纳更多电荷。`,
          ],
        },
        { kind: 'p', text: '**1.2 Boylestad 物理直觉：把电容想象成“弹性隔膜水箱”**' },
        { kind: 'p', text: '很多同学刚学电容会疑惑：“中间明明是绝缘体，直流电根本穿不过去，怎么会有电流流进流出呢？”' },
        {
          kind: 'p',
          text: R`请借用 Boylestad 第 10 章的经典直觉模型：把电容想象成一根装满水的水管中间，横着绷紧了一张[[tank,membrane|**极具弹性的橡胶隔膜**]]。`,
        },
        {
          kind: 'ul',
          items: [
            R`水滴（电子）绝对**无法穿透**橡胶隔膜；`,
            R`但是，当水泵（电源）从左边把水压进来时，[[membrane|橡胶隔膜向右鼓起]]，同时把隔膜右边等量的水挤出水管！你在外面看，左边流进多少水流，右边就流出多少水流——这就是电容的**充电电流**；`,
            R`随着隔膜越绷越紧，反推力（两端电压 $v$）越来越大，直到反推力等于水泵水压，水流停止（直流稳态开路），但能量已经完完整整储存在紧绷的橡胶隔膜（**电场**）里了！`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 02 层拖动[[area_a|面积 $A$]]、[[gap_d|间距 $d$]] 与[[volt_v|电压 $v$]]，切换[[dielectric|电介质]]：看[[charge_q|极板电荷]]、[[efield|电场线]]与[[dipole|偶极子]]怎么变，左下角的[[tank|隔膜水箱]]跟着鼓起。`,
        },
      ],
      inline_svg: SVG_TANK,
      figure_caption: '弹性隔膜水箱类比（Boylestad 第 10 章）：电子穿不过隔膜，充电电流却左进右出',
    },
    /* ---------------------------------------------------------------- act 2: 1.3–1.4 */
    {
      act_index: 2,
      badge: '第 1 幕 · 续',
      title: '面包板实战安全铁律：认准极性与 2 倍耐压裕量',
      sync: { layer: L1, halo: ['cap_elec', 'stripe', 'lead_pos', 'lead_neg'], params: { dev: 'elec', ins: 'ok', pwr: true, dis: false, cam1: 'device' } },
      blocks: [
        {
          kind: 'note',
          tone: 'warn',
          text: R`**面包板安全与供电**：本课实验电源为[[psu|${SUPPLY}]]，经导线接面包板电源轨。铝电解电容（Aluminum Electrolytic Capacitor）属于强极性器件，严禁正负极反接！外壳上的[[stripe|白色/银色条带与负号（-）]]对应[[lead_neg|负极（短引脚）]]，另一侧[[lead_pos|长引脚为正极（+）]]。若反接，氧化铝绝缘介质层会在反向电场下迅速被电化学击穿，导致漏电流激增、电解液沸腾产气、顶部[[vent|防爆十字纹]]鼓包甚至爆浆喷溅。[[rating|选型必须遵循至少 2 倍耐压裕量原则（2x Derating Rule）]]：5 V 电路优先选用 16 V 或 25 V 耐压电容；9 V 电路必须选用 25 V（最低不低于 16 V）耐压电容，切勿选用 6.3 V 或 10 V 电容贴边运行。实验断电后，大容量电解电容（如 100 μF–1000 μF）极板仍可能残留电荷，拆除前可用 [[r_dis|1 kΩ 电阻跨接两脚释放余电]]。本课为器件导论与直流稳态/分段微积分原理课，实验电路均工作在 5 V–9 V 低压、毫安级（1–10 mA）安全电流区间，无高功耗电阻阻值缩放需求。`,
        },
        { kind: 'p', text: '在 Breadboard Lab 桌面插电路前，先区分两种最常用的电容：' },
        {
          kind: 'p',
          text: R`1. [[cap_cer|**瓷片电容（如标有 ${code('104')} 即 $10 \times 10^4\ \text{pF} = 0.1\ \mu\text{F}$）**]]：**无极性**，两脚随便插，正反都行。`,
        },
        { kind: 'p', text: R`2. [[cap_elec|**铝电解电容（如 ${code('100 μF 25 V')}）**]]：**严格有极性！**` },
        {
          kind: 'ul',
          items: [
            R`**外观辨识双保险**：外壳侧面印有一条醒目的[[stripe|**白色/银色条带，上面带有一排负号（${code('-')}）**]]，对应的引脚是[[lead_neg|**负极（且出厂引脚较短）**]]；另一侧[[lead_pos|**较长的引脚是正极（${code('+')}）**]]。`,
            R`**为什么绝不能反接？** 铝电解电容之所以体积小、容量大，靠的是阳极铝箔表面那层纳米级厚度的氧化铝绝缘膜。如果在 5 V 或 9 V 直流供电下反接，这层氧化膜会在反向电场下迅速发生电化学击穿，电容瞬间变成低阻发热体，内部电解液沸腾汽化，顶部刻有[[vent|“十字/K字防爆纹”]]的铝壳会鼓包甚至**爆浆喷溅**！`,
            R`[[rating|**耐压选型铁律（2 倍裕量）**]]：电路供电 5 V，电容额定耐压选 **16 V 或 25 V**；供电 9 V，首选 **25 V**（最低不低于 16 V），切忌贴边选 6.3 V 或 10 V。`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 01 层动手演练：[[jump_red|红色跳线]]把第 30 列接到 [[rail_p5|+5 V 轨]]、[[jump_black|黑色跳线]]把第 31 列接到 [[rail_gnd|GND 轨]]。点「反接」看防爆纹鼓包报警，点「同列」看两脚插进同一列为什么充不上电；切「断电」后电容仍[[vc|残留 5 V]]，再点「1 kΩ 放电电阻」把它放掉。镜头切到「看脚」可以拿起电容比一比长短脚。`,
        },
      ],
      inline_svg: SVG_FIG11,
      figure_caption: '图 1-1：平行板电容电场储能透视（左）与铝电解电容极性辨识（右）',
    },
    /* ---------------------------------------------------------------- act 3: 1.5 Example 1 */
    {
      act_index: 3,
      badge: '第 1 幕 · 例题 1',
      title: '教授板书例题 1：平行板电容与电介质替换效应（Sadiku Sec. 6.1 典型例题）',
      sync: { layer: L2, halo: ['area_a', 'gap_d', 'dielectric', 'cap_c'], params: { tdA: 20, tdD: 1, tdEr: 'air', tdV: 5, peel: true } },
      blocks: [
        { kind: 'p', text: R`**题目**：一个平行板电容器的两极板正对面积 [[area_a|$A = 20\ \text{cm}^2$]]，极板间距 [[gap_d|$d = 1\ \text{mm}$]]。` },
        {
          kind: 'ol',
          items: [
            R`当极板间充满空气（$\varepsilon_{r1} = 1$）时，求电容量 $C_{\text{air}}$；`,
            R`若在极板间填满相对介电常数 $\varepsilon_{r2} = 5$ 的[[dielectric|云母（Mica）介质]]，求新的电容量 $C_{\text{mica}}$。`,
          ],
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`依据静电学高斯定理与平行板匀强电场关系 $E = \frac{q}{\varepsilon A}$ 及 $v = E d$，由电容定义 $C = \frac{q}{v}$ 可导出平行板电容的物理决定式：$C = \frac{\varepsilon A}{d}, \qquad \varepsilon = \varepsilon_r \varepsilon_0$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：设空气与云母两种工况下的相对介电常数分别为 $\varepsilon_{r1}$ 与 $\varepsilon_{r2}$，则：`,
          tex: R`C_{\text{air}} = \frac{\varepsilon_{r1} \varepsilon_0 A}{d}, \qquad C_{\text{mica}} = \frac{\varepsilon_{r2} \varepsilon_0 A}{d} = \frac{\varepsilon_{r2}}{\varepsilon_{r1}} C_{\text{air}}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            {
              label: '先统一换算为国际单位制（SI）：',
              tex: R`\begin{gathered} A = 20\ \text{cm}^2 = 20 \times 10^{-4}\ \text{m}^2 = 2.0 \times 10^{-3}\ \text{m}^2, \\[2pt] d = 1\ \text{mm} = 1.0 \times 10^{-3}\ \text{m} \end{gathered}`,
            },
            { label: '', tex: R`\varepsilon_0 = 8.854 \times 10^{-12}\ \text{F/m}` },
            {
              label: R`代入空气工况（$\varepsilon_{r1} = 1$）：`,
              tex: R`\begin{aligned} C_{\text{air}} &= \frac{1 \times 8.854 \times 10^{-12} \times 2.0 \times 10^{-3}}{1.0 \times 10^{-3}} \\ &= 1.7708 \times 10^{-11}\ \text{F} \approx 17.71\ \text{pF} \end{aligned}`,
            },
            { label: R`代入云母工况（$\varepsilon_{r2} = 5$）：`, tex: R`C_{\text{mica}} = \frac{5}{1} \times 17.708\ \text{pF} = 88.54\ \text{pF}` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授点评**：看出来了吗？几何尺寸一毫米没动，仅仅把空气换成云母，容量直接翻了 5 倍。这也是为什么你在面包板上买到的陶瓷电容小小一颗就能做到 $0.1\ \mu\text{F}$——工程师把 $\varepsilon_r$ 做到了几千，同时把多层极板叠在一起拼命增大 $A$、压薄 $d$。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 02 层已经调到 $A = 20\ \text{cm}^2$、$d = 1\ \text{mm}$：把[[dielectric|电介质]]从「空气」切到「云母」，[[cap_c|$C$]] 从 17.71 pF 跳到 88.54 pF；再切到「陶瓷」，看看 $\varepsilon_r = 1000$ 意味着什么。`,
        },
      ],
      inline_svg: SVG_EX1,
      figure_caption: '例题 1：同一对极板（A = 20 cm²，d = 1 mm），先空气、后云母',
    },
    /* ---------------------------------------------------------------- act 4: 2.1–2.4 */
    {
      act_index: 4,
      badge: '第 2 幕',
      title: '微积分入场——电容的微分/积分伏安关系与电压连续性铁律',
      sync: { layer: L3, halo: ['v_t', 'i_t', 'slope'], params: { wv: 'ex2', wt: 1, rise: 0 } },
      blocks: [
        { kind: 'p', text: R`**2.1 从 $q = Cv$ 到 $i = C\frac{dv}{dt}$**` },
        {
          kind: 'formula',
          title: R`在 W1-L1 中我们学过，电流是电荷随时间的变化率：$i = \frac{dq}{dt}$。在**无源符号约定（Passive Sign Convention）**下（电流 $i$ 从电容电压 $v$ 的正极性端流入），对 $q = Cv$ 两边同时对时间 $t$ 求导（假设 $C$ 为常数），便得到电容最核心的**微分伏安关系（VCR）**：`,
          tex: R`i(t) = C \frac{dv(t)}{dt}`,
        },
        { kind: 'p', text: '请停下来默念三遍这个公式背后的物理含义：' },
        {
          kind: 'ol',
          items: [
            R`**电容电流不取决于电压有多高，而取决于[[slope|电压变化有多快]]！** 哪怕电容两端顶着 $100\ \text{V}$ 高压，只要电压纹丝不动（$\frac{dv}{dt} = 0$），流过电容的电流就严格等于 $0$。`,
            R`**电容两端电压 $v(t)$ 不能发生瞬时突变（阶跃跳变）！** 如果你想让电容电压在 [[rise_test|$\Delta t \to 0$ 的瞬间]]从 $0\ \text{V}$ 跳到 $5\ \text{V}$，那么 $\frac{dv}{dt} \to \infty$，需要的电流 $i = C\frac{dv}{dt} \to \infty$——物理世界里没有任何电源能提供无穷大电流。因此，[[v_t|**电容电压永远是一条连续曲线**]]（可以有折角，但绝不能有垂直断崖）；相反，[[i_t|**电容电流可以发生瞬时跳变**]]（例如方波）。`,
          ],
        },
        { kind: 'p', text: '**2.2 积分形式与“记忆元件”**' },
        {
          kind: 'formula',
          title: R`将微分关系两边从初值时刻 $t_0$ 到当前时刻 $t$ 积分，便得到已知电流求电压的**积分伏安关系**：`,
          tex: R`v(t) = \frac{1}{C} \int_{t_0}^{t} i(\tau)\,d\tau + v(t_0)`,
        },
        {
          kind: 'p',
          text: R`请注意末尾那一项 [[v0|**$v(t_0)$**]]！电阻只关心“此时此刻”的电流，没有记忆；而电容此刻的电压 $v(t)$ 等于**历史上所有流进去的电流累积效果**，再加上初始时刻已经存着的电压 $v(t_0)$。因此我们称电容为**具有记忆能力的动态元件（Memory Element）**。`,
        },
        { kind: 'figure', svg: SVG_FIG21, caption: '图 2-1：C = 2 μF 分段线性电压 v(t) 与微分电流 i(t) = C·dv/dt 波形精准对齐' },
        { kind: 'p', text: R`**2.4 教授板书例题 2：由分段线性电压 $v(t)$ 求电流 $i(t)$ 与最大储能（Sadiku Sec. 6.2 典型例题）**` },
        { kind: 'p', text: R`**题目**：如图 2-1 所示，一个 $C = 2\ \mu\text{F}$ 的电容两端施加分段线性电压 [[v_t|$v(t)$]]：` },
        {
          kind: 'ul',
          items: [
            R`$0 \le t < 2\ \text{ms}$：$v(t)$ 从 $0\ \text{V}$ 线性升至 $10\ \text{V}$；`,
            R`$2 \le t < 4\ \text{ms}$：$v(t)$ 保持恒定 $10\ \text{V}$；`,
            R`$4 \le t < 6\ \text{ms}$：$v(t)$ 从 $10\ \text{V}$ 线性降至 $-10\ \text{V}$；`,
            R`$6 \le t \le 8\ \text{ms}$：$v(t)$ 从 $-10\ \text{V}$ 线性升至 $0\ \text{V}$。`,
          ],
        },
        { kind: 'p', text: R`求各时间段的电容电流 [[i_t|$i(t)$]] 以及该周期内电容储存的最大电场能量 [[w_t|$w_{\max}$]]。` },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`依据电容微分伏安关系与电场储能公式：$i(t) = C \frac{dv(t)}{dt}, \qquad w(t) = \frac{1}{2} C v^2(t)$`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：对于任意线性区间 $[t_a, t_b]$，设端点电压分别为 $v_a$ 与 $v_b$，则斜率为常数，区间电流为：`,
          tex: R`i_{ab} = C \frac{v_b - v_a}{t_b - t_a}`,
        },
        { kind: 'formula', title: R`最大储能出现在电压绝对值 $|v(t)|_{\max}$ 处：`, tex: R`w_{\max} = \frac{1}{2} C \left(|v(t)|_{\max}\right)^2` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '已知', text: R`已知 $C = 2 \times 10^{-6}\ \text{F}$，逐段计算斜率并乘以 $C$：` },
            {
              label: R`**区间 1（$0 \le t < 2\ \text{ms}$）**：`,
              tex: R`i_1 = (2 \times 10^{-6}) \times \frac{10 - 0}{(2 - 0)\times 10^{-3}} = (2 \times 10^{-6}) \times 5000 = +10\ \text{mA}`,
            },
            { label: R`**区间 2（$2 \le t < 4\ \text{ms}$）**：`, tex: R`i_2 = (2 \times 10^{-6}) \times \frac{10 - 10}{(4 - 2)\times 10^{-3}} = 0\ \text{mA}` },
            {
              label: R`**区间 3（$4 \le t < 6\ \text{ms}$）**：`,
              tex: R`i_3 = (2 \times 10^{-6}) \times \frac{-10 - 10}{(6 - 4)\times 10^{-3}} = (2 \times 10^{-6}) \times (-10000) = -20\ \text{mA}`,
            },
            {
              label: R`**区间 4（$6 \le t \le 8\ \text{ms}$）**：`,
              tex: R`i_4 = (2 \times 10^{-6}) \times \frac{0 - (-10)}{(8 - 6)\times 10^{-3}} = (2 \times 10^{-6}) \times 5000 = +10\ \text{mA}`,
            },
            {
              label: R`**最大电场储能**（$|v|_{\max} = 10\ \text{V}$）：`,
              tex: R`w_{\max} = \frac{1}{2} \times (2 \times 10^{-6}) \times 10^2 = 1.0 \times 10^{-4}\ \text{J} = 100\ \mu\text{J}`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 03 层拖动[[cursor|时间游标]]，逐段读出 [[slope|$\frac{dv}{dt}$]]、[[i_t|$i$]] 与 [[w_t|$w$]]；再把[[rise_test|上升时间 $\Delta t$]] 从 2 ms 往 0 拖，看电流脉冲怎样飙升到报警。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 5: 2.5 Example 3 */
    {
      act_index: 5,
      badge: '第 2 幕 · 例题 3',
      title: R`教授板书例题 3：由分段恒定电流 $i(t)$ 与初值 $v(0)$ 积分求电压与储能`,
      sync: { layer: L3, halo: ['i_t', 'charge_int', 'v0'], params: { wv: 'ex3', wt: 4, v0on: true } },
      blocks: [
        { kind: 'p', text: R`**题目**：一个 $C = 50\ \mu\text{F}$ 的电容在 $t = 0$ 时已存有[[v0|初始电压 $v(0) = 2\ \text{V}$]]。若流入它的[[i_t|电流]]为：` },
        {
          kind: 'ul',
          items: [R`$0 \le t < 4\ \text{ms}$：$i(t) = +15\ \text{mA}$；`, R`$4 \le t \le 10\ \text{ms}$：$i(t) = -10\ \text{mA}$。`],
        },
        { kind: 'p', text: R`求 $v(4\ \text{ms})$、$v(10\ \text{ms})$ 及这两个时刻电容储存的能量 $w(4\ \text{ms})$ 与 $w(10\ \text{ms})$。` },
        { kind: 'origin', title: '① 公理溯源', text: R`依据电容积分伏安关系：$v(t) = \frac{1}{C} \int_{t_0}^{t} i(\tau)\,d\tau + v(t_0)$` },
        {
          kind: 'formula',
          title: R`② 纯符号通式：设第一段 $[0, t_1]$ 恒流为 $I_1$，第二段 $[t_1, t_2]$ 恒流为 $I_2$，则由电压连续性（$v(t_1^+) = v(t_1^-)$）逐段递推：`,
          tex: R`v(t_1) = v(0) + \frac{I_1 t_1}{C}, \qquad v(t_2) = v(t_1) + \frac{I_2 (t_2 - t_1)}{C}`,
        },
        { kind: 'formula', title: '对应储能为：', tex: R`w(t_1) = \frac{1}{2} C v^2(t_1), \qquad w(t_2) = \frac{1}{2} C v^2(t_2)` },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '已知', text: R`已知 $C = 50 \times 10^{-6}\ \text{F}$，$v(0) = 2\ \text{V}$：` },
            {
              label: R`**$t_1 = 4\ \text{ms}$ 时**：`,
              tex: R`v(4\ \text{ms}) = 2 + \frac{(15 \times 10^{-3}) \times (4 \times 10^{-3})}{50 \times 10^{-6}} = 2 + \frac{60 \times 10^{-6}}{50 \times 10^{-6}} = 2 + 1.2 = 3.2\ \text{V}`,
            },
            { label: '', tex: R`w(4\ \text{ms}) = \frac{1}{2} \times (50 \times 10^{-6}) \times 3.2^2 = 25 \times 10^{-6} \times 10.24 = 256\ \mu\text{J}` },
            {
              label: R`**$t_2 = 10\ \text{ms}$ 时**（时间跨度 $t_2 - t_1 = 6\ \text{ms}$）：`,
              tex: R`v(10\ \text{ms}) = 3.2 + \frac{(-10 \times 10^{-3}) \times (6 \times 10^{-3})}{50 \times 10^{-6}} = 3.2 - \frac{60 \times 10^{-6}}{50 \times 10^{-6}} = 3.2 - 1.2 = 2.0\ \text{V}`,
            },
            { label: '', tex: R`w(10\ \text{ms}) = \frac{1}{2} \times (50 \times 10^{-6}) \times 2.0^2 = 25 \times 10^{-6} \times 4 = 100\ \mu\text{J}` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**教授点评**：注意看[[charge_int|电荷收支]]！前 $4\ \text{ms}$ 充入电荷 $+15\ \text{mA} \times 4\ \text{ms} = +60\ \mu\text{C}$，后 $6\ \text{ms}$ 放出电荷 $-10\ \text{mA} \times 6\ \text{ms} = -60\ \mu\text{C}$，净电荷变化为零，所以 $10\ \text{ms}$ 末电压丝毫不差地回到了初值 $2.0\ \text{V}$！千万别漏加 [[v0|$v(0)$]]。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 03 层已切到例题 3：把[[cursor|游标]]拖到 4 ms 与 10 ms 读出 $v$ 与 $w$；再点「忘了加 $v(0)$」，看整条电压曲线怎样整体下沉 2 V（虚线是正确答案）。`,
        },
      ],
      inline_svg: SVG_EX3,
      figure_caption: '例题 3：电流曲线下的面积就是电荷，电压从 v(0) = 2 V 出发逐段累积',
    },
    /* ---------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 3 幕',
      title: '电场储能与直流稳态“开路等效”',
      sync: { layer: L4, halo: ['dc_open', 'e4_c1', 'e4_c2'], params: { dc: 'ex4', open: true } },
      blocks: [
        { kind: 'p', text: '**3.1 瞬时功率与电场储能的严谨推导**' },
        {
          kind: 'formula',
          title: R`在 W1-L2 中我们知道任意二端元件的瞬时吸收功率为 $p(t) = v(t) i(t)$。把电容的 $i(t) = C\frac{dv}{dt}$ 代入，并对时间从 $-\infty$（此时电容完全未充电，$v(-\infty) = 0$）积分到当前时刻 $t$：`,
          tex: R`\begin{aligned} w(t) &= \int_{-\infty}^{t} p(\tau)\,d\tau = \int_{-\infty}^{t} C v \frac{dv}{d\tau}\,d\tau \\ &= C \int_{0}^{v(t)} v\,dv = \frac{1}{2} C v^2(t) = \frac{q^2(t)}{2C} \end{aligned}`,
        },
        { kind: 'p', text: '请注意这个公式的两个重要推论：' },
        {
          kind: 'ol',
          items: [
            R`理想电容是**无损储能元件**：充电时 $p > 0$（从电路吸能存入电场），放电时 $p < 0$（把电场能量原封不动还回电路），自身不产生焦耳热。`,
            R`能量 [[w_c|$w = \frac{1}{2}Cv^2$]] 与电压的**平方**成正比——电压翻倍，储能变为原来的 **4 倍**！`,
          ],
        },
        { kind: 'p', text: '**3.2 直流稳态铁律：为什么电容“相当于开路”？**' },
        {
          kind: 'formula',
          title: R`当一个由**直流电源、电阻和电容**组成的电路通电足够长时间、所有暂态充放电彻底结束后，电路进入**直流稳态（DC Steady State）**。此时电路中所有节点的电压都稳定为恒定直流值，不再随时间变化：`,
          tex: R`\frac{dv}{dt} = 0 \implies i_C = C \frac{dv}{dt} = 0`,
        },
        { kind: 'p', text: R`**电流恒为零、但两端可以维持非零电压**——这在电路模型里就是[[dc_open|**开路（Open Circuit）**]]的定义！` },
        { kind: 'p', text: '**直流稳态解题黄金三步法**：' },
        {
          kind: 'ol',
          items: [
            R`[[dc_open|**开路替换**]]：把电路中所有电容都画成断开的虚线空口（标记好原来的正负极性与节点位置）；`,
            R`**纯阻求压**：在剩下的纯电阻网络中，用欧姆定律、串联分压或节点分析求出电容两端对应的节点电压差 $V_C$（切记：[[i_zero|**与电容串联的孤立支路电阻电流也为 $0$，压降为 $0\ \text{V}$**]]）；`,
            R`[[w_c,w_total|**代入储能**]]：用 $w_C = \frac{1}{2} C V_C^2$ 算出每个电容的储能并求和。`,
          ],
        },
        { kind: 'figure', svg: SVG_FIG31, caption: '图 3-1：例题 4 直流稳态分析 — 原电路（左）与开路等效电路（右）' },
        { kind: 'p', text: '**3.4 教授板书例题 4：直流稳态双电容网络求电压与总储能（Sadiku Ex. 6.6 同型题）**' },
        {
          kind: 'p',
          text: R`**题目**：如图 3-1 所示直流电路，电源 [[e4_vs|$V_s = 12\ \text{V}$]]，电阻 [[e4_r1|$R_1 = 3\ \text{k}\Omega$]]、[[e4_r2|$R_2 = 6\ \text{k}\Omega$]]、[[e4_r3|$R_3 = 2\ \text{k}\Omega$]]、[[e4_r4|$R_4 = 4\ \text{k}\Omega$]]，电容 [[e4_c1|$C_1 = 10\ \mu\text{F}$]] 并联在 $R_2$ 两端（[[e4_na|节点 A]] 对地），[[e4_c2|$C_2 = 20\ \mu\text{F}$]] 并联在 $R_4$ 两端（[[e4_nb|节点 B]] 对地）。电路处于直流稳态，求 $V_{C1}$、$V_{C2}$ 以及两电容储存的总能量 $w_{\text{total}}$。`,
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`直流稳态下电压不随时间变化（$\frac{dv}{dt} = 0$），电容电流 $i_C = C\frac{dv}{dt} = 0$，等效为[[dc_open|**开路**]]。剩余纯电阻网络遵循欧姆定律与串并联分压定律，电容储能满足 $w = \frac{1}{2} C v^2$。`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：将 $C_1$、$C_2$ 开路后，右侧支路 $R_3$ 与 $R_4$ 串联后再与 $R_2$ 并联，记并联等效电阻为 $R_p$：`,
          tex: R`R_p = R_2 \parallel (R_3 + R_4) = \frac{R_2 (R_3 + R_4)}{R_2 + R_3 + R_4}`,
        },
        { kind: 'formula', title: '回路总电阻与总电流为：', tex: R`R_{\text{tot}} = R_1 + R_p, \qquad I_s = \frac{V_s}{R_{\text{tot}}}` },
        {
          kind: 'formula',
          title: R`电容 $C_1$ 跨接于节点 A 与地之间，电容 $C_2$ 跨接于节点 B 与地之间（由 $R_3, R_4$ 串联分压得 $V_B$）：`,
          tex: R`V_{C1} = V_A = I_s R_p = V_s \frac{R_p}{R_1 + R_p}, \qquad V_{C2} = V_B = V_A \frac{R_4}{R_3 + R_4}`,
        },
        {
          kind: 'formula',
          title: '各电容储能与总储能为：',
          tex: R`w_{C1} = \frac{1}{2} C_1 V_{C1}^2, \qquad w_{C2} = \frac{1}{2} C_2 V_{C2}^2, \qquad w_{\text{total}} = w_{C1} + w_{C2}`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '计算并联与总电阻：', tex: R`R_3 + R_4 = 2\ \text{k}\Omega + 4\ \text{k}\Omega = 6\ \text{k}\Omega` },
            {
              label: '',
              tex: R`R_p = \frac{6\ \text{k}\Omega \times 6\ \text{k}\Omega}{6\ \text{k}\Omega + 6\ \text{k}\Omega} = 3\ \text{k}\Omega, \qquad R_{\text{tot}} = 3\ \text{k}\Omega + 3\ \text{k}\Omega = 6\ \text{k}\Omega`,
            },
            { label: '计算总电流与电容稳态电压：', tex: R`I_s = \frac{12\ \text{V}}{6\ \text{k}\Omega} = 2\ \text{mA}` },
            { label: '', tex: R`V_{C1} = V_A = (2\ \text{mA}) \times (3\ \text{k}\Omega) = 6\ \text{V}` },
            { label: '', tex: R`V_{C2} = V_B = 6\ \text{V} \times \frac{4\ \text{k}\Omega}{2\ \text{k}\Omega + 4\ \text{k}\Omega} = 4\ \text{V}` },
            { label: '计算各自储能与总储能：', tex: R`w_{C1} = \frac{1}{2} \times (10 \times 10^{-6}) \times 6^2 = 180\ \mu\text{J}` },
            { label: '', tex: R`w_{C2} = \frac{1}{2} \times (20 \times 10^{-6}) \times 4^2 = 160\ \mu\text{J}` },
            { label: '', tex: R`w_{\text{total}} = 180\ \mu\text{J} + 160\ \mu\text{J} = 340\ \mu\text{J}` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 04 层的例题 4 已经[[dc_open|开路替换]]：两条电容支路标着 $i_C = 0$，干路 2 mA 在节点 A 平分成两路 1 mA。再点一次按钮把电容放回去对照原电路。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 7 */
    {
      act_index: 7,
      badge: '第 4 幕',
      title: '电容串并联——与电阻“镜像相反”的物理本质',
      sync: { layer: L4, halo: ['x_c1', 'x_c2', 'x_c3', 'x_c4', 'mirror'], params: { dc: 'ex5', red: 0, ...EX5_PARAMS } },
      blocks: [
        { kind: 'p', text: '**4.1 为什么电容串并联公式与电阻正好相反？**' },
        {
          kind: 'p',
          text: R`很多初学者做题一紧张就会把电容串并联和 W1-L7 的电阻公式搞混。别死记硬背，用**物理图像 + KCL/KVL**一次打通，一辈子都不会忘：`,
        },
        { kind: 'p', text: R`1. [[x_c234|**电容并联（$C_{\text{eq}} = C_1 + C_2 + \dots + C_N$）——相当于增大极板面积 $A$！**]]` },
        {
          kind: 'ul',
          items: [
            R`所有并联电容承受**相同的电压 $v$**，由 KCL 得总电流 $i = i_1 + i_2 + \dots + i_N = (C_1 + C_2 + \dots + C_N)\frac{dv}{dt}$。`,
            R`物理上，把两块平行板并排连在一起，相当于把极板总面积相加：$A_{\text{eq}} = A_1 + A_2$，所以容量**直接相加**，越并越大！`,
          ],
        },
        { kind: 'p', text: R`2. [[x_c34|**电容串联（$\frac{1}{C_{\text{eq}}} = \frac{1}{C_1} + \frac{1}{C_2} + \dots + \frac{1}{C_N}$）——相当于拉大极板间距 $d$！**]]` },
        {
          kind: 'ul',
          items: [
            R`所有串联电容流过**相同的电流 $i$**（因而积累相同的电荷变化量 $q$），由 KVL 得总电压 $v = v_1 + v_2 + \dots + v_N = \left(\frac{1}{C_1} + \frac{1}{C_2} + \dots + \frac{1}{C_N}\right)\int i\,dt$。`,
            R`物理上，把两个电容首尾相接，中间串联的两块极板正负电荷相互抵消，等效于把总极板间距拉大为 $d_{\text{eq}} = d_1 + d_2$，所以容量**倒数相加**，越串越小（永远小于最小的那一颗电容）！`,
            R`两电容串联的常用速算式：$C_{\text{eq}} = \frac{C_1 C_2}{C_1 + C_2}$。`,
          ],
        },
        { kind: 'p', text: '**4.2 重要推论：串联电容的“反比分压”规律**' },
        {
          kind: 'formula',
          title: R`两个初始未充电的电容 $C_1$、$C_2$ 串联接在总电压 $V_s$ 上，它们储存的电荷量严格相等：$q = C_1 V_1 = C_2 V_2$。由此立刻推出：`,
          tex: R`V_1 = V_s \frac{C_2}{C_1 + C_2}, \qquad V_2 = V_s \frac{C_1}{C_1 + C_2}`,
        },
        {
          kind: 'p',
          text: R`**规律警句**：串联电容分压，**容量越小的电容，分到的电压反而越大**！在工程上，绝对不能把一颗小电容和一颗大电容随便串联去分高压，因为绝大部分电压都会砸在小电容头上，极易将其击穿。`,
        },
        { kind: 'figure', svg: SVG_FIG41, caption: '图 4-1：电容与电阻串并联“镜像对照”（左）与例题 5 混联电容网络（右）' },
        { kind: 'p', text: '**4.4 教授板书例题 5：混联电容网络化简、反比分压与能量守恒验算（Sadiku Sec. 6.3 典型例题）**' },
        {
          kind: 'p',
          text: R`**题目**：如图 4-1 右侧所示，[[x_c1|$C_1 = 60\ \mu\text{F}$]]，[[x_c2|$C_2 = 20\ \mu\text{F}$]]，[[x_c3|$C_3 = 20\ \mu\text{F}$]]，[[x_c4|$C_4 = 20\ \mu\text{F}$]]，整体接入 [[x_vs|$V_s = 9\ \text{V}$]] 直流电源（初始均未充电）。`,
        },
        {
          kind: 'ol',
          items: [
            R`求[[x_ceq|总等效电容 $C_{\text{eq}}$]]；`,
            R`求各电容两端的稳态电压 $V_{C1}, V_{C2}, V_{C3}, V_{C4}$；`,
            R`分别通过“总等效电容”与“四颗电容储能逐个求和”两种方法计算总储能，验证能量守恒。`,
          ],
        },
        {
          kind: 'origin',
          title: '① 公理溯源',
          text: R`依据电容串联公式 $\frac{1}{C_{\text{ser}}} = \sum \frac{1}{C_k}$、并联公式 $C_{\text{par}} = \sum C_k$、电荷守恒 $Q = C V$ 以及电场储能公式 $w = \frac{1}{2} C V^2$。`,
        },
        {
          kind: 'formula',
          title: '② 纯符号通式：由右向左逐级归并：',
          tex: R`C_{34} = \frac{C_3 C_4}{C_3 + C_4}, \qquad C_{234} = C_2 + C_{34}, \qquad C_{\text{eq}} = \frac{C_1 C_{234}}{C_1 + C_{234}}`,
        },
        {
          kind: 'formula',
          title: R`总电荷量 $Q_{\text{tot}} = C_{\text{eq}} V_s$ 全部储存在串联前端电容 $C_1$ 及等效组合 $C_{234}$ 上，由反比分压得：`,
          tex: R`V_{C1} = \frac{Q_{\text{tot}}}{C_1} = V_s \frac{C_{234}}{C_1 + C_{234}}, \qquad V_{C2} = V_{234} = V_s \frac{C_1}{C_1 + C_{234}}`,
        },
        {
          kind: 'formula',
          title: R`右侧串联支路 $C_3$ 与 $C_4$ 共享电压 $V_{234}$：`,
          tex: R`V_{C3} = V_{234} \frac{C_4}{C_3 + C_4}, \qquad V_{C4} = V_{234} \frac{C_3}{C_3 + C_4}`,
        },
        {
          kind: 'formula',
          title: '总储能两种算法：',
          tex: R`w_{\text{eq}} = \frac{1}{2} C_{\text{eq}} V_s^2, \qquad w_{\text{sum}} = \frac{1}{2} \left(C_1 V_{C1}^2 + C_2 V_{C2}^2 + C_3 V_{C3}^2 + C_4 V_{C4}^2\right)`,
        },
        {
          kind: 'calc',
          title: '③ 代入数值逐步化简',
          steps: [
            { label: '**总等效电容**：', tex: R`C_{34} = \frac{20 \times 20}{20 + 20} = 10\ \mu\text{F}` },
            { label: '', tex: R`C_{234} = 20 + 10 = 30\ \mu\text{F}` },
            { label: '', tex: R`C_{\text{eq}} = \frac{60 \times 30}{60 + 30} = 20\ \mu\text{F}` },
            {
              label: R`**各电容电压**（$V_s = 9\ \text{V}$，总电荷 $Q_{\text{tot}} = 20\ \mu\text{F} \times 9\ \text{V} = 180\ \mu\text{C}$）：`,
              tex: R`V_{C1} = \frac{180\ \mu\text{C}}{60\ \mu\text{F}} = 3\ \text{V}, \qquad V_{C2} = V_{234} = \frac{180\ \mu\text{C}}{30\ \mu\text{F}} = 6\ \text{V}`,
            },
            { label: '', text: R`（验证 KVL：$V_{C1} + V_{234} = 3 + 6 = 9\ \text{V}$！）` },
            { label: '', tex: R`V_{C3} = 6\ \text{V} \times \frac{20}{20 + 20} = 3\ \text{V}, \qquad V_{C4} = 6\ \text{V} \times \frac{20}{20 + 20} = 3\ \text{V}` },
            { label: '**能量守恒双路验算**：', text: R`等效电容法：$w_{\text{eq}} = \frac{1}{2} \times (20 \times 10^{-6}) \times 9^2 = 810\ \mu\text{J}$` },
            {
              label: '逐个求和法：',
              tex: R`\begin{aligned} w_{\text{sum}} &= \tfrac{1}{2}(60 \times 3^2 + 20 \times 6^2 + 20 \times 3^2 + 20 \times 3^2)\ \mu\text{J} \\ &= (270 + 360 + 90 + 90)\ \mu\text{J} = 810\ \mu\text{J} \end{aligned}`,
            },
            { label: '', text: R`两者严格相等，$w_{\text{eq}} = w_{\text{sum}} = 810\ \mu\text{J}$！` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 04 层按「C34 → C234 → Ceq」逐级化简；回到「原图」点任意一颗电容换容量（10–100 μF），看[[x_c1|小电容]]怎样分走更大的电压，并对照[[mirror|同数字电阻]]的镜像结果。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 8: the guided example */
    {
      act_index: 8,
      badge: '第 5 幕',
      title: '综合实战——苏格拉底式 5 步引导、诊断测验与工程落地',
      sync: { layer: L4, halo: ['g_r5', 'g_c1', 'g_c2'], params: { dc: 'gd', open: false, gd: 0 } },
      blocks: [
        { kind: 'p', text: R`**5.1 实战主电路图（含“死胡同电阻 [[g_r5|$R_5$]]”陷阱）**` },
        { kind: 'figure', svg: SVG_FIG51, caption: '图 5-1：苏格拉底 5 步实战引导题 — 9 V 直流稳态含电容网络（注意 R5 支路！）' },
        {
          kind: 'guided',
          title: '直流稳态含电容与死胡同电阻网络：求各电容电压与总储能',
          problem: R`[[g_vs|$V_s = 9\ \text{V}$]], [[g_r1|$R_1 = 1\ \text{k}\Omega$]], [[g_r2|$R_2 = 3\ \text{k}\Omega$]], [[g_r3|$R_3 = 3\ \text{k}\Omega$]], [[g_r4|$R_4 = 3\ \text{k}\Omega$]], [[g_r5|$R_5 = 2\ \text{k}\Omega$]] (与 $C_2$ 串联), [[g_c1|$C_1 = 100\ \mu\text{F}$]] (并联于 $R_2$), [[g_c2|$C_2 = 200\ \mu\text{F}$]] (经 $R_5$ 接节点 2 与地之间)。电路处于直流稳态。`,
          steps: [
            {
              title: 'Step 1 · 直流稳态等效替换与零电流支路识别',
              mini_svg: MINI_STEP1,
              question: R`电路已通电很长时间进入直流稳态。此时 $C_1$、$C_2$ 等效为什么元件？与 $C_2$ 串联的电阻 $R_5$（$2\ \text{k}\Omega$）上流过的电流是多少？`,
              hint: R`$i_C = C\frac{dv}{dt} = 0 \implies i_{R5} = i_{C2} = 0$`,
              options: [
                {
                  text: R`$C_1$、$C_2$ 等效为短路，$R_5$ 上电流最大`,
                  correct: false,
                  feedback: R`等等！把电容当短路是交流高频或电感直流稳态时的直觉。再想一下 $i = C(dv/dt)$：直流稳态下电压不再变化，$dv/dt = 0$，电流怎么会最大呢？`,
                },
                {
                  text: R`$C_1$、$C_2$ 等效为开路，因此串联的 $R_5$ 支路电流严格为 $0\ \text{A}$`,
                  correct: true,
                  feedback: R`漂亮！一眼看穿了 $R_5$ 是“死胡同支路”。直流稳态下 $C_1$、$C_2$ 皆开路，$i_{R5} = 0$，所以 $R_5$ 根本不参与主干电阻网络的串并联！`,
                },
                {
                  text: R`$C_1$ 等效为开路，但 $R_5$ 与 $C_2$ 串联仍有微弱分流`,
                  correct: false,
                  feedback: R`既然 $C_2$ 已经变成开路（断线），水管的尽头完全堵死了，串联在它前面的 $R_5$ 里还能有水流过去吗？`,
                },
              ],
              board: [R`\text{① 直流稳态：} C_1, C_2 \text{ 均开路}`, R`\implies i_{C1} = i_{C2} = i_{R5} = 0`],
              halo: ['g_c1', 'g_c2', 'g_r5'],
              params: { dc: 'gd', gd: 0, open: false },
              layer: L4,
            },
            {
              title: 'Step 2 · 计算纯电阻网络总等效电阻与总电流',
              mini_svg: MINI_STEP2,
              question: R`去掉开路的 $C_1$、$C_2$ 及无电流的 $R_5$ 后，剩余网络为 $R_1$($1\ \text{k}\Omega$) 串联 [$R_2$($3\ \text{k}\Omega$) 并联 ($R_3$($3\ \text{k}\Omega$) + $R_4$($3\ \text{k}\Omega$))]。电源看到的总等效电阻 $R_{\text{eq}}$ 与总电流 $I_s$ 分别是多少？`,
              hint: R`$R_{\text{eq}} = R_1 + R_2 \parallel (R_3 + R_4), \quad I_s = \frac{V_s}{R_{\text{eq}}}$`,
              options: [
                {
                  text: R`$R_{\text{eq}} = 3\ \text{k}\Omega$，$I_s = 3\ \text{mA}$`,
                  correct: true,
                  feedback: R`心算非常稳！$3\text{k} \parallel 6\text{k} = 2\text{k}$，加上 $R_1 = 1\text{k}$ 得总电阻 $3\ \text{k}\Omega$，$9\ \text{V}$ 除以 $3\ \text{k}\Omega$ 恰好流出 $3\ \text{mA}$。`,
                },
                {
                  text: R`$R_{\text{eq}} = 4\ \text{k}\Omega$，$I_s = 2.25\ \text{mA}$`,
                  correct: false,
                  feedback: R`检查一下 $3\ \text{k}\Omega$ 与 $6\ \text{k}\Omega$ 并联的积除以和：$(3 \times 6)/(3+6) = 18/9 = 2\ \text{k}\Omega$，再加上 $R_1 = 1\ \text{k}\Omega$ 是多少？`,
                },
                {
                  text: R`$R_{\text{eq}} = 5\ \text{k}\Omega$，$I_s = 1.8\ \text{mA}$`,
                  correct: false,
                  feedback: R`你是不是把 $R_5 = 2\ \text{k}\Omega$ 也加进去了？记住步骤 1 的结论：$R_5$ 支路开路无电流，不参与等效电阻计算！`,
                },
              ],
              board: [
                R`\text{② } R_{\text{par}} = 3\text{ k}\Omega \parallel (3+3)\text{ k}\Omega = 2\text{ k}\Omega`,
                R`R_{\text{eq}} = 1 + 2 = 3\text{ k}\Omega`,
                R`I_s = \frac{9\text{ V}}{3\text{ k}\Omega} = 3\text{ mA}`,
              ],
              halo: ['g_r1', 'g_r2', 'g_r3', 'g_r4', 'is_total'],
              params: { dc: 'gd', gd: 1, open: true },
              layer: L4,
            },
            {
              title: R`Step 3 · 求解电容 $C_1$ 两端稳态电压`,
              mini_svg: MINI_STEP3,
              question: R`已知总电流 $I_s = 3\ \text{mA}$，节点 1 对地等效并联电阻 $R_{\text{par}} = 2\ \text{k}\Omega$，且 $C_1$ 直接并联在 $R_2$ 两端（节点 1 对地）。求稳态电压 $V_{C1}$。`,
              hint: R`$V_{C1} = V_1 = V_s - I_s R_1 = I_s R_{\text{par}}$`,
              options: [
                {
                  text: R`$V_{C1} = 3\ \text{V}$`,
                  correct: false,
                  feedback: R`$3\ \text{V}$ 是电阻 $R_1$ 上的压降（$3\ \text{mA} \times 1\ \text{k}\Omega = 3\ \text{V}$），别把 $R_1$ 压降当成节点 1 对地电压！`,
                },
                {
                  text: R`$V_{C1} = 6\ \text{V}$`,
                  correct: true,
                  feedback: R`精准！$V_1 = 9\ \text{V} - 3\ \text{V} = 6\ \text{V}$（或 $3\ \text{mA} \times 2\ \text{k}\Omega = 6\ \text{V}$），两路互验完全吻合。`,
                },
                {
                  text: R`$V_{C1} = 9\ \text{V}$`,
                  correct: false,
                  feedback: R`电源 $9\ \text{V}$ 还要先经过 $R_1 = 1\ \text{k}\Omega$ 产生压降，节点 1 不可能还等于 $9\ \text{V}$。`,
                },
              ],
              board: [R`\text{③ } V_{C1} = V_1 = (3\text{ mA})(2\text{ k}\Omega) = 6\text{ V}`],
              halo: ['g_na', 'g_c1'],
              params: { dc: 'gd', gd: 2, open: true },
              layer: L4,
            },
            {
              title: R`Step 4 · 求解电容 $C_2$ 两端稳态电压（跨越死胡同电阻 $R_5$）`,
              mini_svg: MINI_STEP4,
              question: R`节点 1 电压 $V_1 = 6\ \text{V}$，经过串联分压电阻 $R_3$($3\ \text{k}\Omega$) 与 $R_4$($3\ \text{k}\Omega$) 到地得到节点 2 电压 $V_2$。那么经过 $R_5$($2\ \text{k}\Omega$) 连接到节点 2 的电容 $C_2$，其两端电压 $V_{C2}$ 等于多少？`,
              hint: R`$V_2 = V_1 \frac{R_4}{R_3 + R_4}, \quad v_{R5} = i_{R5} R_5 = 0 \implies V_{C2} = V_2$`,
              options: [
                {
                  text: R`$V_{C2} = 0\ \text{V}$（因为 $R_5$ 挡住了电流）`,
                  correct: false,
                  feedback: R`小心这个经典误区！稳态电流为 0 意味着不再充电，不代表电容电压为 0——电容在达到稳态之前早就充饱到和节点 2 一样高了！`,
                },
                {
                  text: R`$V_{C2} = 2\ \text{V}$（因为 $R_5$ 分走了一部分电压）`,
                  correct: false,
                  feedback: R`用欧姆定律算算 $R_5$ 的压降：$v_{R5} = i_{R5} \times R_5 = 0 \times 2\ \text{k}\Omega = 0\ \text{V}$。没有电流，电阻就分不走一毫伏电压！`,
                },
                {
                  text: R`$V_{C2} = 3\ \text{V}$（因为 $i_{R5} = 0$ 导致 $v_{R5} = 0\ \text{V}$，$V_{C2}$ 严格等于 $V_2$）`,
                  correct: true,
                  feedback: R`太棒了！你完美跨过了 Sadiku 课后题最爱考的“零电流电阻零压降”陷阱：$V_2 = 6 \times (3/6) = 3\ \text{V}$，$V_{C2} = V_2 = 3\ \text{V}$。`,
                },
              ],
              board: [R`\text{④ } V_2 = 6 \times \frac{3}{3+3} = 3\text{ V}`, R`v_{R5} = 0 \implies V_{C2} = 3\text{ V}`],
              halo: ['g_nb', 'g_r5', 'g_c2', 'i_zero'],
              params: { dc: 'gd', gd: 3, open: true },
              layer: L4,
            },
            {
              title: 'Step 5 · 计算各电容电场储能与总储能',
              mini_svg: MINI_STEP5,
              question: R`已知 $C_1 = 100\ \mu\text{F}$（$V_{C1} = 6\ \text{V}$）、$C_2 = 200\ \mu\text{F}$（$V_{C2} = 3\ \text{V}$）。求两电容各自储存的电场能量 $w_{C1}$、$w_{C2}$ 以及网络总储能 $w_{\text{total}}$。`,
              hint: R`$w = \frac{1}{2} C v^2, \quad 1\text{ mJ} = 1000\ \mu\text{J}$`,
              options: [
                {
                  text: R`$w_{C1} = 1.80\ \text{mJ}$，$w_{C2} = 0.90\ \text{mJ}$，$w_{\text{total}} = 2.70\ \text{mJ}$`,
                  correct: true,
                  feedback: R`满分通关！$w_{C1} = 1800\ \mu\text{J} = 1.80\ \text{mJ}$，$w_{C2} = 900\ \mu\text{J} = 0.90\ \text{mJ}$，总储能 $2.70\ \text{mJ}$。注意体会“电压平方项”对储能的放大威力！`,
                },
                {
                  text: R`$w_{C1} = 0.90\ \text{mJ}$，$w_{C2} = 0.90\ \text{mJ}$，$w_{\text{total}} = 1.80\ \text{mJ}$`,
                  correct: false,
                  feedback: R`看看 $C_1$ 的电压平方：$6^2 = 36$，而 $3^2 = 9$！$C_1$ 虽然容量只有 $C_2$ 的一半，但电压是 2 倍，平方后储能反而是 $C_2$ 的 2 倍。`,
                },
                {
                  text: R`$w_{C1} = 3.60\ \text{mJ}$，$w_{C2} = 1.80\ \text{mJ}$，$w_{\text{total}} = 5.40\ \text{mJ}$`,
                  correct: false,
                  feedback: R`别忘了储能公式前面的系数 $1/2$！$w = \frac{1}{2}Cv^2$，漏掉 $1/2$ 结果会整整大一倍。`,
                },
              ],
              board: [R`\text{⑤ } w_{C1} = 1.80\text{ mJ}, \quad w_{C2} = 0.90\text{ mJ}`, R`w_{\text{total}} = 2.70\text{ mJ}`],
              halo: ['g_c1', 'g_c2', 'w_total'],
              params: { dc: 'gd', gd: 4, open: true },
              layer: L4,
            },
          ],
          done_params: { dc: 'gd', gd: 9, open: true },
          conclusion: R`五步通关：直流稳态下 $C_1$、$C_2$ 开路，死胡同电阻 $R_5$ 电流为 0、压降为 0；$I_s = 3\ \text{mA}$，$V_{C1} = 6\ \text{V}$，$V_{C2} = V_2 = 3\ \text{V}$，总储能 $2.70\ \text{mJ}$。左侧 04 层的实战题数值已全部揭晓，可以开关「开路替换」对照原电路。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 9: the diagnostic quiz */
    {
      act_index: 9,
      badge: '诊断测验',
      title: 'W4-L1 电容诊断测验（4 题）',
      sync: { layer: L2, halo: [], params: { tdA: 20, tdD: 1, tdEr: 'air', tdV: 5, peel: true } },
      blocks: [
        {
          kind: 'p',
          text: '以下 4 道诊断题覆盖本课的核心概念：铝电解电容的极性与耐压选型、微分伏安关系与电压连续性、直流稳态开路与电场储能、电容串联的反比分压。四题全部答对即通关本课。',
        },
      ],
      inline_svg: SVG_QUIZ_ACT,
      figure_caption: '诊断测验的四个核心概念',
      quiz: [
        {
          id: 'w4l1_q1',
          concept: '电解电容极性与耐压',
          review_act: 2,
          question: '你在 9 V 直流面包板电路中需要接入一颗 100 μF 铝电解电容。以下选型与插法完全正确且安全的是哪一项？',
          options: [
            {
              key: 'A',
              text: '选用 100 μF / 10 V 电容，任意方向插入面包板',
              correct: false,
              feedback: R`两处都错：$10\text{ V}$ 只比 $9\text{ V}$ 高一点，是“贴边运行”，不满足 2 倍耐压裕量（至少 $18\text{ V}$，应选 $25\text{ V}$）；铝电解电容是强极性器件，“任意方向”意味着一半的机会反接击穿。`,
            },
            { key: 'B', text: '选用 100 μF / 25 V 电容，将外壳白色负号条带侧（短脚）接低电位，长脚接高电位', correct: true },
            {
              key: 'C',
              text: '选用 100 μF / 25 V 电容，将外壳白色负号条带侧（短脚）接 9 V 正极以增强氧化膜',
              correct: false,
              feedback: '25 V 耐压选对了，但白条短脚是负极：把它接到 9 V 正极就是反接。反向电场不会“增强”氧化膜，而是把它电化学击穿，漏电流激增、电解液汽化、防爆纹鼓包。',
            },
            {
              key: 'D',
              text: '选用 100 μF / 6.3 V 电容，长脚接 9 V 正极，短脚接地',
              correct: false,
              feedback: R`极性接对了，可 $6.3\text{ V}$ 的额定耐压比电源 $9\text{ V}$ 还低——连“贴边”都谈不上，直接过压击穿。2 倍裕量要求至少 $18\text{ V}$，应选 $25\text{ V}$。`,
            },
          ],
          feedback_correct: '9 V 供电下需遵循至少 2 倍耐压裕量（选 25 V，排除 A、D）；铝电解电容严禁反接，外壳白色条带与短脚为负极，必须接低电位，长脚正极接高电位（排除 C）。',
          feedback_wrong: '分两件事检查：额定耐压够不够 2 × 9 V？白条短脚是哪一极、该接高电位还是低电位？',
          figure: SVG_Q1,
        },
        {
          id: 'w4l1_q2',
          concept: '电容伏安关系与电压连续',
          review_act: 4,
          question: '一个 C = 10 μF 的理想电容两端电压在 2 ms 内从 2 V 线性上升到 10 V。此期间流入电容的电流大小以及为什么电容电压不能发生瞬时突变，下列说法正确的是？',
          options: [
            { key: 'A', text: R`电流为 40 mA；因为电压瞬时突变意味着 $dv/dt \to \infty$，需要无穷大电流，物理上不可实现`, correct: true },
            {
              key: 'B',
              text: '电流为 50 mA；因为电容内部是绝缘介质，电流不能突变',
              correct: false,
              feedback: R`50 mA 是把电压当成从 $0$ 升到 $10\text{ V}$ 算的（$10\ \mu\text{F} \times 10\text{ V}/2\text{ ms}$）；电压变化量是 $10 - 2 = 8\text{ V}$。理由也反了：绝缘介质挡住的是电子穿越，电容电流恰恰可以突变（方波），不能突变的是电压。`,
            },
            {
              key: 'C',
              text: '电流为 40 mA；因为电容电流必须连续，不能发生跳变',
              correct: false,
              feedback: R`40 mA 算对了，但连续性说反了：$i = C\,dv/dt$，斜率一变电流就跳（例题 2 的方波电流就是例子）。必须连续的是电容电压，因为电压跳变要 $dv/dt \to \infty$。`,
            },
            {
              key: 'D',
              text: '电流为 4 mA；因为电阻限制了电压上升速度',
              correct: false,
              feedback: R`题目里只有一颗理想电容，没有电阻；电流完全由电压的变化率决定：$i = (10 \times 10^{-6}) \times 8\text{ V}/(2 \times 10^{-3}\text{ s})$。4 mA 差了 10 倍，检查一下 μ 和 m 的换算。`,
            },
          ],
          feedback_correct: R`由 $i = C\frac{dv}{dt} = (10 \times 10^{-6}) \times \frac{10 - 2}{2 \times 10^{-3}} = 40\text{ mA}$。电容电压必须连续（不能突变），否则需要无穷大电流；而电容电流本身是可以瞬时跳变的（如方波）。`,
          feedback_wrong: R`先算斜率 $\frac{\Delta v}{\Delta t}$ 再乘以 $C$；再想想 $i = C\frac{dv}{dt}$ 里，哪一个量跳变会要求无穷大？`,
          figure: SVG_Q2,
          sync: { layer: L3, params: { wv: 'ex2', wt: 1, rise: 0 } },
        },
        {
          id: 'w4l1_q3',
          concept: '直流稳态与电场储能',
          review_act: 6,
          question: '两个完全相同的 50 μF 电容在直流稳态下，电容 A 两端电压为 4 V，电容 B 两端电压为 8 V。关于两者的稳态电流与储能对比，正确的是？',
          options: [
            {
              key: 'A',
              text: '两者电流均为 0 A；电容 B 的储能是电容 A 的 2 倍',
              correct: false,
              feedback: R`电流为 0 对了，但储能不是跟电压成正比：$w = \frac{1}{2}Cv^2$ 里电压是平方项，电压翻倍、储能变成 $2^2 = 4$ 倍。`,
            },
            {
              key: 'B',
              text: '电容 B 的漏电流是 A 的 2 倍；电容 B 的储能是电容 A 的 4 倍',
              correct: false,
              feedback: R`4 倍储能对了，但题目说的是理想电容的直流稳态：$dv/dt = 0$，$i = C\,dv/dt = 0$，两者电流都严格为 0，没有“漏电流”可比。`,
            },
            { key: 'C', text: '两者电流均为 0 A；电容 B 的储能（1.6 mJ）是电容 A（0.4 mJ）的 4 倍', correct: true },
            {
              key: 'D',
              text: '两者均相当于短路，储能均为 0 J',
              correct: false,
              feedback: '直流稳态下电容相当于开路，不是短路：电流为 0，两端却维持着 4 V 和 8 V。只要两端有电压，电场里就存着能量 w = ½Cv²，不会是 0 J。',
            },
          ],
          feedback_correct: R`直流稳态下 $dv/dt = 0$，理想电容等效开路，电流均为 0 A。由 $w = \frac{1}{2}Cv^2$，$w_A = 0.5 \times 50\ \mu\text{F} \times 16 = 400\ \mu\text{J} = 0.4\text{ mJ}$，$w_B = 0.5 \times 50\ \mu\text{F} \times 64 = 1600\ \mu\text{J} = 1.6\text{ mJ}$，电压翻倍则储能变为 4 倍。`,
          feedback_wrong: R`直流稳态下 $dv/dt$ 等于多少？储能公式里电压是一次方还是平方？`,
          figure: SVG_Q3,
          sync: { layer: L4, params: { dc: 'ex4', open: true } },
        },
        {
          id: 'w4l1_q4',
          concept: '电容串联反比分压',
          review_act: 7,
          question: '将一颗 30 μF 电容与一颗 60 μF 电容串联后接到 12 V 直流电源上（初始均未充电）。稳定后两者的总等效电容 Ceq 以及 30 μF 电容分得的电压分别是多少？',
          options: [
            {
              key: 'A',
              text: 'Ceq = 90 μF，30 μF 电容分压 4 V',
              correct: false,
              feedback: R`90 μF 是把串联当成并联直接相加了——那是电阻串联的规律。电容串联要倒数相加，结果比最小的 30 μF 还小。分压也反了：容量小的电容分到的电压更大。`,
            },
            {
              key: 'B',
              text: 'Ceq = 20 μF，30 μF 电容分压 4 V',
              correct: false,
              feedback: R`$C_{\text{eq}} = 20\ \mu\text{F}$ 对了，但分压按电阻的正比思路分反了：串联电荷相等 $Q = C_1V_1 = C_2V_2$，容量越小电压越大，30 μF 那颗应分到更大的一份。`,
            },
            { key: 'C', text: 'Ceq = 20 μF，30 μF 电容分压 8 V', correct: true },
            {
              key: 'D',
              text: 'Ceq = 45 μF，30 μF 电容分压 6 V',
              correct: false,
              feedback: R`45 μF 是两颗电容的平均值，6 V 是平分电压——两样都不是串联的规律。串联倒数相加 $C_{\text{eq}} = \frac{C_1C_2}{C_1+C_2}$，再由 $Q = C_{\text{eq}}V_s$ 求各自电压。`,
            },
          ],
          feedback_correct: R`电容串联倒数相加：$C_{\text{eq}} = \frac{30 \times 60}{30 + 60} = 20\ \mu\text{F}$。串联电荷相等 $Q = 20\ \mu\text{F} \times 12\text{ V} = 240\ \mu\text{C}$，因此 30 μF 电容电压 $V_1 = 240\ \mu\text{C} / 30\ \mu\text{F} = 8\text{ V}$（容量越小分压越大）。`,
          feedback_wrong: R`串联电容：等效电容是倒数相加；各电容电荷相等，$V = Q/C$——容量小的分到的电压是大还是小？`,
          figure: SVG_Q4,
          sync: { layer: L4, params: { dc: 'ex5', red: 0, ...EX5_PARAMS } },
        },
      ],
    },
  ],
};

export default W4_L1;
