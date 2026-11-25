// W5-L9 · 无源与有源滤波器（Phase 1 收官实战 + 3D 面包板扫频） (lesson sheet: docs/lessons/W5-L9.md).
// The professor's text of the seven acts, the figures, the guided design and the self-test are
// reproduced from the sheet; [[id|…]] only links a term to the stage (the words are unchanged).
// Changes of form:
// - the opening remarks open act 1; the sheet's numbered sub-headings are bold lines; display
//   formulas sit in ① / ② / ③ cards (a lead-in sentence stays a paragraph or becomes the title);
//   the sheet's JSON (guided example, quiz) is mapped onto the lesson types, its plain variable
//   names written as TeX; act 7 drops "与 Claude 工程落地清单" from its title and its 7.4 checklist
//   for the developers; the Phase 1 closing and the Phase 2 preview follow the self-test;
// - anti-spoiler: 7.1's preview figure printed the guided design's results (51 kΩ, 3.3 nF,
//   945.7 Hz, 6.12 V): before the guided block it stands with "?" (SVG_PREVIEW_MASKED), the full
//   figure follows it as the 通关复盘 with a review card; the step diagrams are redrawn without
//   their own answers (svgs.ts); the stage's design page (mode 'design') hides R_i, R_f, C_f, the
//   real f_c, the Bode curve and V_out,peak until the example reaches them (dReveal).
// Changes of content (see the report):
// - the LM358's swing on the ±9 V supply is +7.5 V / −8.9 V (light load), not "±7.5 V" (safety
//   rule, guided problem, step 5, 7.1 figure); step 5's option B read 10.20 V while its intercept
//   explained 5.1 × 2.4 Vpp (= 12.24 V): the option is now 12.24 V, the intercept says so;
// - the 5.2 table's rounding: 200 Hz |H| 2.120, 723.4 Hz passive −10.51 dB, 1 kHz |H| 1.289 and
//   −10.85 dB, 10 kHz −23.04 dB; its header's "\|H\|" (a Markdown escape) is |H|;
// - act 6's band pass: +2.2 is the product of the stages' pass-band gains; with f_c2/f_c1 ≈ 9.7 the
//   skirts overlap, the real peak at f0 is ≈ 1.99 (+6.0 dB) and the −3 dB edges ≈ 285 Hz / 3.91 kHz
//   (a note added); the 6.1 banner's world list follows the course map;
// - quiz Q3's right answer moves from B to D (the four right answers are A, B, D, C).
// Added: the bench's safety / BOM table and wiring table, the GBW note, the 通关复盘 card, the
// guided conclusion, per-option quiz feedback written from the sheet's explanations, quiz figures.

import { lazy } from 'react';
import { BENCH_NAMES } from '../../benchNames';
import { genericLabel } from '../../breadboardIds';
import type { StageLesson, StageSync } from '../../types';
import { CF, RF, RI } from './model';
import { SVG_ACTIVE, SVG_BODE, SVG_BPF, SVG_FAMILY, SVG_LOADING, SVG_PASSIVE, SVG_PREVIEW, SVG_PREVIEW_MASKED } from './sheetSvgs';
import { MINI_STEP1, MINI_STEP2, MINI_STEP3, MINI_STEP4, MINI_STEP5, SVG_Q1, SVG_Q2, SVG_Q3, SVG_Q4 } from './svgs';

const Schematic = lazy(() => import('./Schematic'));
const Bode = lazy(() => import('./Bode'));
const Bench3D = lazy(() => import('./Bench3D'));

const R = String.raw;
/** inline code inside String.raw text */
const code = (s: string) => '`' + s + '`';

const L1 = 'schematic';
const L2 = 'bode';
const L3 = 'bench3d';

const SUPPLY = `${BENCH_NAMES.supply}（±9 V）`;
const GEN = BENCH_NAMES.generator;
const SCOPE = BENCH_NAMES.scope;

/** every act sets the whole stage circuit, so scrolling back restores it */
const P = (p: Record<string, unknown> = {}): StageSync['params'] => ({ mode: 'plpf', load: false, vg: false, view: 'compare', ri: RI, rf: RF, cf: CF, dReveal: 9, ...p });

const W5_L9: StageLesson = {
  format: 'lesson-stage/2',
  renderers: { [L1]: Schematic, [L2]: Bode, [L3]: Bench3D },
  describeTarget: (id) => genericLabel(id),
  lesson_meta: {
    lesson_id: 'W5-L9',
    world: 'World 5',
    title: '无源与有源滤波器（Phase 1 收官实战 + 3D 面包板扫频）',
    subtitle: '从无源 RC 加载塌陷到 LM358 有源低通/高通/带通全频段掌控',
    lesson_type: 'C',
    lesson_type_label: 'Type C（经典拓扑 + 波特图 + 3D 面包板扫频实测课）',
    estimated_minutes: 55,
    textbook_primary: {
      book: 'Alexander, Sadiku & Fredette, Fundamentals of Electric Circuits, 2026 Release',
      sections: ['Section 14.7 Passive Filters', 'Section 14.8 Active Filters'],
    },
    textbook_supplement: 'Introductory Circuit Analysis, 14th Ed. (Boylestad) — Chapter 21 Filters（音频分频器与工程直觉）',
    prerequisites: ['W3-L3 反相放大器（虚短与虚断）', 'W5-L4 交流运放与复阻抗反馈', 'W5-L7 波特图（分贝、十倍频程与 -20 dB/dec 滚降）', 'W5-L8 串联/并联谐振与品质因数 Q'],
    pass_message: '随堂自测通过！Phase 1 模拟电路核心基石全部通关。',
  },
  left_stage_spec: {
    use_3d: true,
    layers: [
      {
        id: L1,
        label: '01 滤波器原理图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '01 2D 无源 vs 有源低通/高通/带通切换原理图：一键切换无源 RC 低通 / 高通、反相有源低通 / 高通、级联有源带通；接入 / 断开 10 kΩ 负载 RL，高亮虚地；Ri、Rf、Cf 滑块（E12 标称值，无源 RC 取 R = Rf、C = Cf）。下方读数：通带增益、截止频率、负载的影响。',
      },
      {
        id: L2,
        label: '02 实时波特图',
        render_mode: '2D_INTERACTIVE_SVG',
        caption:
          '02 实时幅频/相频波特图（无源带载塌陷 vs 有源带增益稳如磐石对比）：10 Hz – 100 kHz 对数轴；绿 = 有源反相 LPF（带 10 kΩ 负载），蓝 = 无源 RC LPF 空载，红虚线 = 同一 RC 带 10 kΩ 负载；也可只看 01 层当前拓扑。扫频游标与 03 层的信号源共用一个频率。',
      },
      {
        id: L3,
        label: '03 3D 扫频实测',
        render_mode: '3D_THREEJS_BREADBOARD',
        caption: `03 3D LM358 ±9V 双电源有源低通滤波器面包板扫频实测：${SUPPLY}（两路串联、COM 作 GND）经引线接 +9 V / GND / −9 V 轨，${GEN}正弦 1 Vpp 扫频 100 Hz → 10 kHz，${SCOPE} CH1 看 Vin、CH2 看 Pin 1 输出；可在 Pin 1 接入 10 kΩ 负载、加大输入看削波。`,
      },
    ],
    hover_map: {
      // 01 schematic
      sch_vi: { label: '输入信号 Vi', desc: '正弦输入（面包板上由函数信号发生器给出），参考地是 GND' },
      sch_r: { label: '电阻 R', desc: '无源低通里是串联臂（默认 22 kΩ，= Rf 滑块）；无源高通里是对地的并联臂（10 kΩ）' },
      sch_c: { label: '电容 C', desc: 'Z_C = 1/(jωC)：低通里对地旁路高频（默认 10 nF，= Cf 滑块）；高通里串联、隔直通交（100 nF）' },
      sch_rl: { label: '负载 RL = 10 kΩ', desc: '后级电路的等效输入电阻：并在无源 RC 的输出端会抢电流、拉低通带、挪动 fc；接在运放输出端则纹丝不动' },
      sch_vo: { label: '输出 Vo', desc: '传递函数 H(jω) = Vo / Vi' },
      sch_ri: { label: '输入电阻 Ri', desc: '反相有源滤波器的输入阻抗；通带增益 −Rf/Ri（默认 10 kΩ）' },
      sch_rf: { label: '反馈电阻 Rf', desc: '决定通带增益 −Rf/Ri；有源低通里还与 Cf 一起决定 fc = 1/(2π Rf Cf)（默认 22 kΩ）' },
      sch_cf: { label: '反馈电容 Cf', desc: '并联在 Rf 两端：高频时把反馈阻抗短路，形成 −20 dB/dec 滚降（默认 10 nF）' },
      sch_ci: { label: '输入电容 Ci', desc: '有源高通里串在 Ri 前面：fc = 1/(2π Ri Ci)，隔断直流' },
      sch_vg: { label: '虚地节点（Pin 2）', desc: '虚短 v− = v+ = 0，虚断 i− = 0：输入电流全部流进反馈支路，H = −Zf/Zi' },
      sch_opamp: { label: 'LM358（±9 V）', desc: '台式可调直流电源（±9 V）供电；输出摆幅约 +7.5 V / −8.9 V（轻载）；增益带宽积约 1 MHz' },
      sch_thev: { label: '戴维南等效', desc: '把 C 拿走看进去：Vth = RL/(R + RL) · Vi，Rth = R ∥ RL —— 通带与 fc 双双改变' },
      sch_buffer: { label: '运放输出缓冲', desc: '负载电流由运放输出级供给，反馈环路自动补足：增益与 fc 都不受 RL 影响' },
      sch_stage1: { label: '第 1 级：有源高通', desc: 'Ci1 47 nF、Ri1 10 kΩ、Rf1 10 kΩ：fc1 ≈ 338.6 Hz，增益 −1' },
      sch_stage2: { label: '第 2 级：有源低通 + 增益', desc: 'Ri2 10 kΩ、Rf2 22 kΩ ∥ Cf2 2.2 nF：fc2 ≈ 3288 Hz，增益 −2.2' },
      sch_kdc: { label: '通带增益', desc: '线性值与分贝值；反相级为负（相位 180°）' },
      sch_fc: { label: '截止频率 fc', desc: '幅度跌到通带最大值的 1/√2（−3.01 dB，半功率点）处的频率' },
      // 02 Bode
      bd_active: { label: '有源反相 LPF（带 10 kΩ 负载）', desc: '通带 20 log(Rf/Ri)（默认 +6.85 dB），fc = 1/(2π Rf Cf)（默认 723.4 Hz），之后 −20 dB/dec；负载不改变曲线' },
      bd_passive: { label: '无源 RC LPF 空载', desc: '通带 0 dB，fc = 1/(2π RC)（默认 723.4 Hz，−3.01 dB）' },
      bd_loaded: { label: '无源 RC LPF 带 10 kΩ 负载', desc: '通带跌到 20 log(RL/(R+RL))（默认 −10.10 dB），fc 右移到 1/(2π (R∥RL) C)（默认 2315 Hz）' },
      bd_topo: { label: '当前拓扑的曲线', desc: '01 层选中的拓扑（含负载开关）' },
      bd_design: { label: '设计结果曲线', desc: '引导例题的标准件：Ri 10 kΩ、Rf 51 kΩ、Cf 3.3 nF（第 4 步答完后显示）' },
      bd_target: { label: '设计目标', desc: '|K| = 5（+13.98 dB），fc = 1.0 kHz' },
      bd_fc: { label: '截止频率标记', desc: '曲线比自己的通带低 3.01 dB 的点；相频上对应极点相移 −45°（高通 +45°）' },
      bd_3db: { label: '−3 dB 线', desc: '通带最大值的 0.7071 倍：输出功率恰好减半' },
      bd_slope: { label: '−20 dB/dec 滚降', desc: '一阶滤波器越过 fc 后每十倍频程下降 20 dB' },
      bd_phase: { label: '相频曲线', desc: '极点相移：反相级的 −180° 已扣除（总相角 = −180° + 图中值）' },
      bd_cursor: { label: '扫频游标 f', desc: '与 03 层函数信号发生器同一个频率：读出每条曲线在 f 处的增益与相角' },
      // 03 bench
      bb_psu: { label: SUPPLY, desc: '两路 9 V 输出串联，中点 COM 作 GND：红线 + → 顶部外侧轨（+9 V），黑线 COM → 两条内侧 GND 轨，蓝线 − → 底部外侧轨（−9 V）' },
      bb_gen: { label: `${GEN}（正弦 · 1 Vpp）`, desc: '正弦 1.0 Vpp、0 V 直流偏置，100 Hz → 10 kHz 对数扫频；红夹接输入节点（第 22 列），黑夹接 GND 轨' },
      bb_scope: { label: SCOPE, desc: 'CH1（黄）看输入 Vin（i22），CH2（绿）看 Pin 1 输出 Vout（g38）；两只地夹都夹 GND 轨' },
      chip_lm358: { label: 'LM358N（双运放 DIP-8，用通道 A）', desc: '缺口朝左，Pin 1 在左下（第 30 列）：Pin 1 OUT、Pin 2 IN−、Pin 3 IN+、Pin 4 V− = −9 V、Pin 8 V+ = +9 V' },
      chip_lm358_p1: { label: 'Pin 1 · OUT A', desc: '滤波器输出（第 30 列下半）：Rf、Cf 的一端，黄跳线把它引到第 38 列（CH2、负载 RL）' },
      chip_lm358_p2: { label: 'Pin 2 · IN− A（虚地）', desc: '第 31 列下半：Ri、Rf、Cf 在这里汇合，电压被反馈钉在 0 V' },
      chip_lm358_p3: { label: 'Pin 3 · IN+ A', desc: '黑跳线直接接 GND 轨' },
      chip_lm358_p4: { label: 'Pin 4 · V−', desc: '蓝跳线接 −9 V 轨；旁边一颗 100 nF 去耦电容到 GND（上电前断电核对，严禁反接）' },
      chip_lm358_p5: { label: 'Pin 5 · IN+ B', desc: '通道 B 本课不用' },
      chip_lm358_p6: { label: 'Pin 6 · IN− B', desc: '通道 B 本课不用' },
      chip_lm358_p7: { label: 'Pin 7 · OUT B', desc: '通道 B 本课不用' },
      chip_lm358_p8: { label: 'Pin 8 · V+', desc: '红跳线接 +9 V 轨；a30 一颗 100 nF 去耦电容到 GND' },
      bb_ri: { label: 'Ri 10 kΩ（棕黑黑红棕）', desc: '1/4 W 1% 金属膜：g22（输入节点）→ g31（Pin 2）' },
      bb_rf: { label: 'Rf 22 kΩ（红红黑红棕）', desc: '1/4 W 1% 金属膜，立式跨接 j31（Pin 2）与 j30（Pin 1）' },
      bb_cf: { label: 'Cf 10 nF（103）', desc: '独石 / 薄膜电容，跨接 Pin 1 与 Pin 2（i30 – i31），与 Rf 并联' },
      bb_rl: { label: '测试负载 RL 10 kΩ', desc: '接在输出节点（第 38 列，经黄跳线 = Pin 1）与 GND 轨之间：示波器 CH2 纹丝不动' },
      bb_dec: { label: '去耦电容 2 × 100 nF（104）', desc: '紧贴 Pin 8 → GND 与 Pin 4 → GND，防止高频自激' },
      rail_p9: { label: '+9 V 轨（顶部外侧）', desc: '台式可调直流电源 CH1 的 +；Pin 8 由红跳线取电' },
      rail_gnd: { label: 'GND 公共地轨（两条内侧轨）', desc: '电源 COM、Pin 3、信号源黑夹、CH1 / CH2 地夹、负载与去耦电容都接这里' },
      rail_m9: { label: '−9 V 轨（底部外侧）', desc: '台式可调直流电源 CH2 的 −；Pin 4 由蓝跳线取电' },
      node_vin: { label: '输入节点 Vin（第 22 列）', desc: '信号源红夹、Ri 左端、CH1 探头' },
      node_vg: { label: '虚地节点（第 31 列 = Pin 2）', desc: 'Ri、Rf、Cf 汇合，0 V' },
      node_vout: { label: '输出节点 Vout（Pin 1 → 第 38 列）', desc: 'Pin 1、Rf、Cf，经黄跳线到第 38 列：CH2 探头与负载 RL' },
      ch1_probe: { label: 'CH1 探头（黄）', desc: '探头尖 i22：输入 Vin = 1.0 Vpp' },
      ch2_probe: { label: 'CH2 探头（绿）', desc: '探头尖 g38：输出 Vout（反相，通带 2.18 Vpp）' },
      center_trench: { label: '中间凹槽', desc: 'LM358 跨在凹槽上：两排引脚各占一列，互不短路' },
      safety_note: { label: '安全与缩放', desc: '±9 V 先断电核对 Pin 8 / Pin 4；所有地共接 GND 轨；kΩ 级元件按原值搭建、无需缩放；输入不超过约 6.5 Vpp 以免削波' },
    },
  },
  right_acts: [
    /* ---------------------------------------------------------------- act 1 */
    {
      act_index: 1,
      badge: '第 1 幕',
      title: '从音频分频器看懂四大滤波器家族（LPF / HPF / BPF / BSF）',
      sync: { layer: L2, halo: ['bd_3db', 'bd_fc'], params: P({ view: 'topo', mode: 'plpf' }) },
      blocks: [
        {
          kind: 'p',
          text: R`**教授开场白**：欢迎来到 Phase 1 模拟电路核心基石的**收官之战**！从 World 1 的欧姆定律、World 3 的运放虚短虚断，一路走到 World 5 的相量、交流运放、波特图与谐振，你手里已经握齐了所有拼图。今天这堂课，我们要把它们全部熔炼成电子工程最核心的武器之一——**频率选择性滤波器（Frequency-Selective Filters）**。不仅要从第一性原理推导无源与有源滤波器的传递函数，我们还要当场“揭穿”无源 RC 滤波器接上负载就塌陷的致命硬伤，最后在 3D 面包板上亲手搭起一颗 $\pm 9\text{ V}$ 供电的 **LM358 有源低通滤波器**，从 $100\text{ Hz}$ 一路扫频到 $10\text{ kHz}$，亲眼见证 $+6.85\text{ dB}$ 通带平台与 $-20\text{ dB/dec}$ 教科书级滚降！`,
        },
        { kind: 'p', text: '**1.1 工程直觉：为什么音响里需要“交通警察”？**' },
        {
          kind: 'p',
          text: R`想象你正在听一首现场摇滚乐：鼓手踩下底鼓产生 $40\text{ Hz}\sim 150\text{ Hz}$ 的浑厚低音，主唱人声集中在 $300\text{ Hz}\sim 3.4\text{ kHz}$，镲片和泛音则延伸到 $8\text{ kHz}\sim 18\text{ kHz}$。如果你把整段混合电信号直接灌进同一个喇叭，大口径低音单元根本来不及跟着 $15\text{ kHz}$ 振动，而娇嫩的高音球顶单元会被 $50\text{ Hz}$ 的大振幅低频瞬间烧毁。`,
        },
        { kind: 'p', text: '正如 Boylestad 第 21 章所展示的经典**三分频音箱（3-Way Crossover Network）**：' },
        {
          kind: 'ul',
          items: [
            R`**低通滤波器（LPF, Low-Pass Filter）**：只放行低频，把高频挡在门外 $\rightarrow$ 专供低音炮（Woofer）。`,
            R`**高通滤波器（HPF, High-Pass Filter）**：只放行高频，把低频和直流分量挡在门外 $\rightarrow$ 专供高音头（Tweeter）。`,
            R`**带通滤波器（BPF, Band-Pass Filter）**：只放行中间一段指定频带 $\rightarrow$ 专供中音单元（Midrange）或无线电调谐选台。`,
            R`**带阻 / 陷波滤波器（BSF / Notch Filter）**：放行两侧频段，精准“挖掉”中间某一窄带干扰 $\rightarrow$ 心电图（ECG）前端精准滤除 $50\text{ Hz}/60\text{ Hz}$ 市电工频哼声。`,
          ],
        },
        { kind: 'p', text: R`**1.2 核心指标：通带、阻带与 $-3\text{ dB}$ 半功率截止频率**` },
        {
          kind: 'p',
          text: R`理想滤波器像一堵垂直的“砖墙（Brick Wall）”，但在因果物理世界中，电容与电感的阻抗随频率连续变化，因此真实滤波器必然存在平滑的**过渡带（Transition Band）**。工程上统一定义**[[bd_fc|截止频率（Cutoff Frequency）]]** $\omega_c$（或 $f_c = \frac{\omega_c}{2\pi}$）为幅频响应跌落至通带最大值的 $\frac{1}{\sqrt{2}} \approx 0.7071$ 倍处的频率：`,
        },
        { kind: 'formula', title: '② 截止频率的定义', tex: R`|\mathbf{H}(\omega_c)| = \frac{H_{\max}}{\sqrt{2}} \approx 0.7071\, H_{\max}` },
        { kind: 'p', text: R`换算成你在 ${code('W5-L7')} 学过的分贝（dB）标尺，对应的相对增益跌落恰好是：` },
        { kind: 'formula', title: '换算成分贝', tex: R`20\log_{10}\!\left(\frac{1}{\sqrt{2}}\right) = -10\log_{10}(2) \approx -3.01\text{ dB} \approx -3\text{ dB}` },
        {
          kind: 'p',
          text: R`由于功率 $P \propto V^2$，电压幅度变为 $\frac{1}{\sqrt{2}}$ 倍意味着输出功率恰好降至通带最大功率的 **[[bd_3db|$\frac{1}{2}$（半功率点，Half-Power Frequency）]]**。`,
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 02 层此刻画的是一阶无源 RC 低通：[[bd_3db|−3 dB 线]]与曲线的交点就是 [[bd_fc|$f_c$]]；拖动扫频游标，看幅度在 $f_c$ 之后怎样一路下滑。`,
        },
        { kind: 'p', text: '**1.3 四大滤波器家族全景图（理想砖墙 vs 实际一阶/二阶响应）**' },
      ],
      inline_svg: SVG_FAMILY,
      figure_caption: '四大滤波器家族幅频特性全景：理想砖墙（虚线）vs 实际响应（实线）',
    },
    /* ---------------------------------------------------------------- act 2 */
    {
      act_index: 2,
      badge: '第 2 幕',
      title: '无源 RC / RLC 滤波器与三段式教授板书推导',
      sync: { layer: L1, halo: ['sch_r', 'sch_c'], params: P({ mode: 'plpf' }) },
      blocks: [
        {
          kind: 'p',
          text: R`无源滤波器仅由**[[sch_r|电阻 $R$]]、[[sch_c|电容 $C$]]、电感 $L$** 构成，不需要外部直流电源供电。它们的核心工作机制非常朴素：**利用电容（$\mathbf{Z}_C = \frac{1}{j\omega C}$）与电感（$\mathbf{Z}_L = j\omega L$）的阻抗随频率变化的特性，组成“随频率自动调档的交流分压器”**。`,
        },
        { kind: 'p', text: '**2.1 无源一阶 RC 低通与高通原理图**' },
        { kind: 'figure', svg: SVG_PASSIVE, caption: '(a) 无源一阶 RC 低通（R = 22 kΩ，C = 10 nF）与 (b) 无源一阶 RC 高通（C = 100 nF，R = 10 kΩ）' },
        { kind: 'p', text: '**2.2 教授板书：无源一阶 RC 低通滤波器（严格三段式推导）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（相量域分压法则）',
          text: R`在空载（输出端开路，输出电流 $\mathbf{I}_o = 0$）条件下，电阻阻抗 $\mathbf{Z}_R = R$ 与电容阻抗 $\mathbf{Z}_C = \frac{1}{j\omega C}$ 串联分压，传递函数定义为输出与输入相量之比：`,
        },
        { kind: 'formula', title: '空载分压', tex: R`\mathbf{H}_{\text{LPF}}(\omega) = \frac{\mathbf{V}_o}{\mathbf{V}_i} = \frac{\mathbf{Z}_C}{\mathbf{Z}_R + \mathbf{Z}_C}` },
        {
          kind: 'formula',
          title: R`② 纯符号通式（化为标准一阶形式与截止频率公式）：将 $\mathbf{Z}_R = R$ 与 $\mathbf{Z}_C = \frac{1}{j\omega C}$ 代入并上下同乘 $j\omega C$`,
          tex: R`\mathbf{H}_{\text{LPF}}(\omega) = \frac{\frac{1}{j\omega C}}{R + \frac{1}{j\omega C}} = \frac{1}{1 + j\omega RC}`,
        },
        {
          kind: 'formula',
          title: '取模与相角',
          tex: R`|\mathbf{H}_{\text{LPF}}(\omega)| = \frac{1}{\sqrt{1 + (\omega RC)^2}}, \qquad \angle\mathbf{H}_{\text{LPF}}(\omega) = -\arctan(\omega RC)`,
        },
        {
          kind: 'formula',
          title: R`令 $|\mathbf{H}_{\text{LPF}}(\omega_c)| = \frac{1}{\sqrt{2}}$，解得 $\omega_c RC = 1$，故角截止频率与赫兹截止频率的纯符号通式为`,
          tex: R`\omega_c = \frac{1}{RC}, \qquad f_c = \frac{1}{2\pi RC}`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（基准件 $R = 22\text{ k}\Omega,\; C = 10\text{ nF}$）`,
          steps: [
            { label: '代入', text: R`代入 $R = 22 \times 10^{3}\;\Omega$、$C = 10 \times 10^{-9}\;\text{F}$：` },
            { label: '角截止频率', tex: R`\omega_c = \frac{1}{(22 \times 10^{3}) \times (10 \times 10^{-9})} = \frac{1}{2.2 \times 10^{-4}} \approx 4545.45\text{ rad/s}` },
            { label: '赫兹截止频率', tex: R`f_c = \frac{\omega_c}{2\pi} = \frac{4545.45}{2\pi} \approx 723.43\text{ Hz}` },
            {
              label: '两个关键点',
              text: R`在直流（$\omega = 0$）处，$|\mathbf{H}(0)| = 1$（$0.00\text{ dB}$）；在 $f = f_c = 723.43\text{ Hz}$ 处，$|\mathbf{H}(\omega_c)| = 0.7071$（$-3.01\text{ dB}$），相位滞后 $-45^\circ$。`,
            },
          ],
        },
        { kind: 'p', text: '**2.3 教授板书：无源一阶 RC 高通滤波器（严格三段式推导）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（相量域分压法则）',
          text: R`互换 $R$ 与 $C$ 的位置，从电阻 $R$ 两端取输出电压，空载分压给出：`,
        },
        { kind: 'formula', title: '空载分压', tex: R`\mathbf{H}_{\text{HPF}}(\omega) = \frac{\mathbf{V}_o}{\mathbf{V}_i} = \frac{\mathbf{Z}_R}{\mathbf{Z}_C + \mathbf{Z}_R}` },
        {
          kind: 'formula',
          title: R`② 纯符号通式：代入 $\mathbf{Z}_R = R$ 与 $\mathbf{Z}_C = \frac{1}{j\omega C}$，上下同乘 $j\omega C$`,
          tex: R`\mathbf{H}_{\text{HPF}}(\omega) = \frac{R}{\frac{1}{j\omega C} + R} = \frac{j\omega RC}{1 + j\omega RC}`,
        },
        {
          kind: 'formula',
          title: '取模与截止频率',
          tex: R`|\mathbf{H}_{\text{HPF}}(\omega)| = \frac{\omega RC}{\sqrt{1 + (\omega RC)^2}}, \qquad \omega_c = \frac{1}{RC}, \qquad f_c = \frac{1}{2\pi RC}`,
        },
        {
          kind: 'p',
          text: R`注意：当 $\omega \to 0$ 时 $|\mathbf{H}| \to 0$（完美隔直）；当 $\omega \to \infty$ 时 $|\mathbf{H}| \to 1$（$0\text{ dB}$）；在 $\omega = \omega_c$ 处相位超前 $+45^\circ$。`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（标准件 $R = 10\text{ k}\Omega,\; C = 100\text{ nF}$）`,
          steps: [
            { label: '代入', text: R`代入 $R = 10 \times 10^{3}\;\Omega$、$C = 100 \times 10^{-9}\;\text{F}$：` },
            { label: '角截止频率', tex: R`\omega_c = \frac{1}{(10 \times 10^{3}) \times (100 \times 10^{-9})} = \frac{1}{1.0 \times 10^{-3}} = 1000.00\text{ rad/s}` },
            { label: '赫兹截止频率', tex: R`f_c = \frac{1000.00}{2\pi} \approx 159.15\text{ Hz}` },
          ],
        },
        { kind: 'p', text: '**2.4 强回链 W5-L8：无源 RLC 带通与带阻滤波器的谐振本质**' },
        {
          kind: 'p',
          text: R`上一课 ${code('W5-L8')} 我们刚把串联 RLC 谐振吃透！现在换个视角看，**串联 RLC 谐振电路本身就是一个二阶无源滤波器**：`,
        },
        {
          kind: 'ul',
          items: [
            R`**从电阻 $R$ 两端取输出 $\rightarrow$ 无源带通滤波器（BPF）**：在谐振角频率 $\omega_0 = \frac{1}{\sqrt{LC}}$ 处，感抗与容抗精确抵消（$j\omega_0 L + \frac{1}{j\omega_0 C} = 0$），输入电压全部落在 $R$ 上，$|\mathbf{H}(\omega_0)| = 1$；带宽 $B = \frac{R}{L}$，品质因数 $Q = \frac{\omega_0}{B} = \frac{\omega_0 L}{R}$ 越高，选频峰越尖锐。`,
            R`**从 $L$ 与 $C$ 串联组合两端取输出 $\rightarrow$ 无源带阻 / 陷波滤波器（BSF）**：在 $\omega_0 = \frac{1}{\sqrt{LC}}$ 处，$LC$ 串联支路等效短路，输出电压骤降为零，精准剔除 $\omega_0$ 频率干扰！`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 01 层切换 RC 低通 / RC 高通：[[sch_c|电容]]从“对地旁路”挪到“串联隔直”，同一对 $R$、$C$ 就从低通变成高通；拖 R、C 滑块，读数里的 [[sch_fc|$f_c$]] 跟着 $\frac{1}{2\pi RC}$ 变。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 3 */
    {
      act_index: 3,
      badge: '第 3 幕',
      title: '点破无源滤波器的三大工程硬伤——加载效应塌陷实证',
      sync: { layer: L1, halo: ['sch_rl', 'sch_thev'], params: P({ mode: 'plpf', load: true }) },
      blocks: [
        {
          kind: 'p',
          text: '同学们，如果无源滤波器这么简洁，为什么现代模拟电路和仪器仪表里几乎清一色采用**有源滤波器**？让我用一个真实面包板实验，为你点破无源滤波器的**三大致命硬伤**：',
        },
        {
          kind: 'ol',
          items: [
            R`**硬伤一：天生无增益（通带最大只能 $0\text{ dB}$）**：无源网络没有外部能源注入，永远只能衰减信号，无法放大微弱传感器或麦克风信号（$|\mathbf{H}(\omega)| \le 1 \Rightarrow \le 0\text{ dB}$）。`,
            R`**硬伤二：灾难性的加载效应（Loading Effect）**：你在纸上算好 $R = 22\text{ k}\Omega, C = 10\text{ nF} \Rightarrow f_c = 723.43\text{ Hz}$，满心欢喜地把后级电路（等效输入负载 [[sch_rl|$R_L = 10\text{ k}\Omega$]]）接上去——结果**通带幅度当场腰斩还多，截止频率直接跑偏 $3.2$ 倍**！`,
            R`**硬伤三：低频滤波需要笨重昂贵的电感**：要想用无源 RLC 做音频或心电图（$50\text{ Hz}$）陷波器，所需电感高达数亨利（$\text{H}$），不仅体积像砖头、绕线寄生电阻破坏 $Q$ 值，还像一根天线一样狂吸周围磁场噪声。`,
          ],
        },
        { kind: 'p', text: R`**3.1 加载效应诊断图：接上 [[sch_rl|$R_L = 10\text{ k}\Omega$]] 发生了什么？**` },
        { kind: 'figure', svg: SVG_LOADING, caption: '无源 RC 低通接入后级负载 RL = 10 kΩ：戴维南等效揭示“双塌陷”' },
        { kind: 'p', text: '**3.2 教授板书：带载无源 RC 低通的塌陷推导（三段式）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（戴维南等效定理）',
          text: R`将电容 $C$ 从电路中暂时移去，求 $V_i$、$R$ 与 $R_L$ 组成的左侧网络对电容端口的[[sch_thev|戴维南等效电压源 $\mathbf{V}_{\text{th}}$ 与等效电阻 $R_{\text{th}}$]]：`,
        },
        { kind: 'formula', title: '戴维南等效', tex: R`\mathbf{V}_{\text{th}} = \frac{R_L}{R + R_L}\mathbf{V}_i, \qquad R_{\text{th}} = R \parallel R_L = \frac{R R_L}{R + R_L}` },
        {
          kind: 'formula',
          title: R`② 纯符号通式：重新接回电容 $C$，带载传递函数与带载截止频率为`,
          tex: R`\mathbf{H}_{\text{loaded}}(\omega) = \frac{R_L}{R + R_L} \cdot \frac{1}{1 + j\omega (R \parallel R_L) C}, \qquad f_{c,\text{loaded}} = \frac{1}{2\pi (R \parallel R_L) C}`,
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（$R = 22\text{ k}\Omega,\; R_L = 10\text{ k}\Omega,\; C = 10\text{ nF}$）`,
          steps: [
            {
              label: '直流增益塌陷',
              tex: R`K_{\text{DC,loaded}} = \frac{10\text{ k}\Omega}{22\text{ k}\Omega + 10\text{ k}\Omega} = \frac{10}{32} = 0.3125 \implies 20\log_{10}(0.3125) \approx -10.10\text{ dB}`,
            },
            { label: '等效时间常数电阻', tex: R`R_{\text{th}} = \frac{22 \times 10}{22 + 10}\text{ k}\Omega = 6.875\text{ k}\Omega` },
            { label: '漂移后的截止频率', tex: R`f_{c,\text{loaded}} = \frac{1}{2\pi \times (6.875 \times 10^{3}) \times (10 \times 10^{-9})} \approx 2314.98\text{ Hz}` },
            {
              label: '结论',
              text: R`比原设计的 $723.43\text{ Hz}$ 暴涨了 $\frac{2314.98}{723.43} = 3.20$ 倍！这就是为什么工程上绝不允许把普通无源 RC 直接怼到中等阻值负载上。`,
            },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 01 层已经接上了 [[sch_rl|10 kΩ 负载]]：读数里通带增益是 $0.3125$（$-10.10\text{ dB}$），[[sch_fc|$f_c$]] 是 $2315\text{ Hz}$；点“断开 RL”，两项立刻回到 $0\text{ dB}$ 与 $723.4\text{ Hz}$。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 4 */
    {
      act_index: 4,
      badge: '第 4 幕',
      title: '有源滤波器的破局之道——反相有源低通与高通（强回链 W3-L3 & W5-L4）',
      sync: { layer: L1, halo: ['sch_vg', 'sch_rf', 'sch_cf'], params: P({ mode: 'alpf', load: true, vg: true }) },
      blocks: [
        {
          kind: 'p',
          text: R`怎么一招根治上述三大硬伤？请出我们在 ${code('W3-L3')} 与 ${code('W5-L4')} 征服过的老朋友——**[[sch_opamp|运算放大器（Op-Amp）]]**！`,
        },
        {
          kind: 'p',
          text: R`在 ${code('W5-L4')} 我们已经证明，只要在反相放大器的输入支路放入复阻抗 $\mathbf{Z}_i(\omega)$、反馈支路放入复阻抗 $\mathbf{Z}_f(\omega)$，借助运放的**[[sch_vg|虚短（$v_- = v_+ = 0$）与虚断（$i_- = 0$）]]**，闭环传递函数恒为：`,
        },
        { kind: 'formula', title: '交流反相放大器的复阻抗比', tex: R`\mathbf{H}(\omega) = \frac{\mathbf{V}_o}{\mathbf{V}_i} = -\frac{\mathbf{Z}_f(\omega)}{\mathbf{Z}_i(\omega)}` },
        {
          kind: 'p',
          text: R`同时，由于运放输出端具备**[[sch_buffer|极低的输出阻抗（近似理想受控电压源）]]**，只要输出电流不超过芯片限流且不触及电源轨饱和，无论你在输出端接上 $10\text{ k}\Omega$ 还是 $2\text{ k}\Omega$ 的[[sch_rl|负载电阻 $R_L$]]，反馈环路都会自动补足电流，**通带增益与截止频率 $f_c$ 纹丝不动（零后级加载）**！`,
        },
        { kind: 'p', text: '**4.1 一阶反相有源低通与一阶反相有源高通原理图**' },
        { kind: 'figure', svg: SVG_ACTIVE, caption: '(a) 一阶反相有源低通与 (b) 一阶反相有源高通（LM358，±9 V）' },
        { kind: 'p', text: '**4.2 教授板书：一阶反相有源低通滤波器（严格三段式推导）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（反相端 KCL + 理想运放虚短虚断）',
          text: R`因为 $v_- = v_+ = 0$ 且 $i_- = 0$，输入阻抗为 $\mathbf{Z}_i(\omega) = R_i$，反馈支路为 [[sch_rf|$R_f$]] 与 [[sch_cf|$C_f$]] 并联：`,
        },
        {
          kind: 'formula',
          title: '输入与反馈阻抗',
          tex: R`\mathbf{H}_{\text{ALPF}}(\omega) = -\frac{\mathbf{Z}_f(\omega)}{\mathbf{Z}_i(\omega)}, \qquad \mathbf{Z}_f(\omega) = R_f \parallel \frac{1}{j\omega C_f}`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式（增益与截止频率完全解耦！）：计算并联反馈阻抗 $\mathbf{Z}_f(\omega)$`,
          tex: R`\mathbf{Z}_f(\omega) = \frac{R_f \cdot \frac{1}{j\omega C_f}}{R_f + \frac{1}{j\omega C_f}} = \frac{R_f}{1 + j\omega R_f C_f}`,
        },
        {
          kind: 'formula',
          title: R`代入 $\mathbf{H}_{\text{ALPF}}(\omega) = -\frac{\mathbf{Z}_f(\omega)}{R_i}$，立得教科书黄金公式`,
          tex: R`\mathbf{H}_{\text{ALPF}}(\omega) = -\frac{R_f}{R_i} \cdot \frac{1}{1 + j\omega R_f C_f}`,
        },
        { kind: 'p', text: '观察这个公式的美妙结构：' },
        {
          kind: 'ul',
          items: [
            R`**[[sch_kdc|直流/通带增益]]**：$K_{\text{DC}} = -\frac{R_f}{R_i}$（由 $R_f / R_i$ 决定，可自由放大！）；`,
            R`**[[sch_fc|截止频率]]**：$\omega_c = \frac{1}{R_f C_f},\; f_c = \frac{1}{2\pi R_f C_f}$（仅取决于反馈支路 $R_f, C_f$，**与 $R_i$ 无关，更与后级负载 $R_L$ 无关！**）；`,
            R`**相频响应**：$\angle\mathbf{H}_{\text{ALPF}}(\omega) = -180^\circ - \arctan(\omega R_f C_f)$（负号带来基础 $180^\circ$ 反相，叠加低通极点滞后）。`,
          ],
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（面包板实测标准件：$R_i = 10\text{ k}\Omega,\; R_f = 22\text{ k}\Omega,\; C_f = 10\text{ nF}$）`,
          steps: [
            {
              label: '1. 通带直流增益与分贝值',
              tex: R`K_{\text{DC}} = -\frac{22\text{ k}\Omega}{10\text{ k}\Omega} = -2.20 \implies |K_{\text{DC}}|_{\text{dB}} = 20\log_{10}(2.20) \approx +6.85\text{ dB}`,
            },
            {
              label: '2. 截止频率',
              tex: R`\omega_c = \frac{1}{(22 \times 10^{3}) \times (10 \times 10^{-9})} \approx 4545.45\text{ rad/s}, \qquad f_c = \frac{4545.45}{2\pi} \approx 723.43\text{ Hz}`,
            },
            {
              label: R`3. 截止频率处幅值与实测输出峰峰值（输入 $V_{\text{in}} = 1.00\text{ V}_{\text{pp}}$）`,
              tex: R`|\mathbf{H}(\omega_c)| = \frac{2.20}{\sqrt{2}} \approx 1.5556 \implies 20\log_{10}(1.5556) \approx +3.84\text{ dB} \quad (\text{精确跌落 } 3.01\text{ dB})`,
            },
            { label: '', tex: R`V_{\text{out,pp}}(723.4\text{ Hz}) = 1.5556 \times 1.00\text{ V}_{\text{pp}} \approx 1.56\text{ V}_{\text{pp}}` },
          ],
        },
        { kind: 'p', text: '**4.3 教授板书：一阶反相有源高通滤波器（严格三段式推导）**' },
        {
          kind: 'origin',
          title: '① 公理溯源（交流反相放大器复阻抗比）',
          text: R`将[[sch_ci|电容 $C_i$]] 串联在输入电阻 $R_i$ 支路中，反馈支路仅留电阻 $R_f$：`,
        },
        {
          kind: 'formula',
          title: '输入与反馈阻抗',
          tex: R`\mathbf{Z}_i(\omega) = R_i + \frac{1}{j\omega C_i}, \qquad \mathbf{Z}_f(\omega) = R_f, \qquad \mathbf{H}_{\text{AHPF}}(\omega) = -\frac{\mathbf{Z}_f(\omega)}{\mathbf{Z}_i(\omega)}`,
        },
        {
          kind: 'formula',
          title: R`② 纯符号通式：代入 $\mathbf{Z}_i(\omega)$ 与 $\mathbf{Z}_f(\omega)$，分子分母同乘 $j\omega C_i$`,
          tex: R`\mathbf{H}_{\text{AHPF}}(\omega) = -\frac{R_f}{R_i + \frac{1}{j\omega C_i}} = -\frac{R_f}{R_i} \cdot \frac{j\omega R_i C_i}{1 + j\omega R_i C_i}`,
        },
        {
          kind: 'ul',
          items: [R`**高频通带增益**：$K_{\infty} = -\frac{R_f}{R_i}$；`, R`**截止频率**：$\omega_c = \frac{1}{R_i C_i},\; f_c = \frac{1}{2\pi R_i C_i}$。`],
        },
        {
          kind: 'calc',
          title: R`③ 代入数值逐步化简（$R_i = 10\text{ k}\Omega,\; R_f = 33\text{ k}\Omega,\; C_i = 100\text{ nF}$）`,
          steps: [
            { label: '高频通带增益', tex: R`|K_{\infty}| = \frac{33\text{ k}\Omega}{10\text{ k}\Omega} = 3.30 \implies 20\log_{10}(3.30) \approx +10.37\text{ dB}` },
            { label: '截止频率', tex: R`f_c = \frac{1}{2\pi \times (10 \times 10^{3}) \times (100 \times 10^{-9})} \approx 159.15\text{ Hz}` },
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 01 层是有源反相低通，[[sch_vg|虚地]]已高亮、[[sch_rl|10 kΩ 负载]]已接上：读数仍是 $-2.2$（$+6.85\text{ dB}$）与 $723.4\text{ Hz}$。拖 Ri 只改增益、拖 Rf 增益与 $f_c$ 一起变、拖 Cf 只改 $f_c$——这就是“解耦”。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 5 */
    {
      act_index: 5,
      badge: '第 5 幕',
      title: '波特图巅峰对决——无源带载塌陷 vs 有源带增益稳如磐石（强回链 W5-L7）',
      sync: { layer: L2, halo: ['bd_active', 'bd_passive', 'bd_loaded'], params: { ...P({ view: 'compare' }), f: 723.43 } },
      blocks: [
        {
          kind: 'p',
          text: R`下面这张图不是示意图，而是用 Python 按对数频率轴（$10\text{ Hz}\sim 100\text{ kHz}$，跨度 4 个十倍频程）逐点精确计算的**双联波特图对比**！三条曲线放在同一坐标系下，差距一目了然：`,
        },
        {
          kind: 'ul',
          items: [
            R`**[[bd_active|绿色实线（有源反相 LPF，$R_i=10\text{ k}\Omega, R_f=22\text{ k}\Omega, C_f=10\text{ nF}$，接 $R_L=10\text{ k}\Omega$）]]**：通带稳居 **$+6.85\text{ dB}$**，在 $f_c = 723.4\text{ Hz}$ 精确落到 $+3.84\text{ dB}$，随后以标准 **[[bd_slope|$-20\text{ dB/dec}$]]** 笔直滚降；`,
            R`**[[bd_passive|蓝色实线（无源 RC LPF，$R=22\text{ k}\Omega, C=10\text{ nF}$，空载）]]**：通带最高 $0.00\text{ dB}$，$f_c = 723.4\text{ Hz}$ 处为 $-3.01\text{ dB}$；`,
            R`**[[bd_loaded|红色实线（同一无源 RC LPF 接上 $R_L=10\text{ k}\Omega$）]]**：通带惨跌至 **$-10.10\text{ dB}$**，截止频率右漂至 **$2315\text{ Hz}$**（$-13.11\text{ dB}$），相频曲线同步右偏！`,
          ],
        },
        { kind: 'p', text: '**5.1 Python 精确绘制：幅频与相频波特图对比**' },
        { kind: 'figure', svg: SVG_BODE, caption: '精确波特图对比：有源带载稳如磐石 (+6.85 dB) vs 无源空载 (0 dB) vs 无源带载塌陷 (−10.10 dB)' },
        { kind: 'p', text: R`**5.2 扫频实测对照表（输入 $V_{\text{in}} = 1.00\text{ V}_{\text{pp}}$，带载 $R_L = 10\text{ k}\Omega$）**` },
        {
          kind: 'table',
          head: [R`扫频频点 $f$`, R`有源反相 LPF 幅值 $|H|$`, '有源增益 (dB)', R`有源输出 $V_{\text{out,pp}}$`, '有源总相角', '无源带载增益 (dB)', '工程解读'],
          rows: [
            [
              R`**$100\text{ Hz}$**`,
              R`$2.179$`,
              R`$+6.77\text{ dB}$`,
              R`$2.18\text{ V}_{\text{pp}}$`,
              R`$-187.9^\circ$`,
              R`$-10.11\text{ dB}$`,
              R`通带平坦区，有源高出无源带载近 $17\text{ dB}$`,
            ],
            [
              R`**$200\text{ Hz}$**`,
              R`$2.120$`,
              R`$+6.53\text{ dB}$`,
              R`$2.12\text{ V}_{\text{pp}}$`,
              R`$-195.5^\circ$`,
              R`$-10.14\text{ dB}$`,
              R`通带内衰减不足 $0.35\text{ dB}$`,
            ],
            [R`**$500\text{ Hz}$**`, R`$1.810$`, R`$+5.15\text{ dB}$`, R`$1.81\text{ V}_{\text{pp}}$`, R`$-214.7^\circ$`, R`$-10.30\text{ dB}$`, R`进入 $-3\text{ dB}$ 过渡膝盖区`],
            [
              R`**$723.4\text{ Hz}$ ($f_c$)**`,
              R`**$1.556$**`,
              R`**$+3.84\text{ dB}$**`,
              R`**$1.56\text{ V}_{\text{pp}}$**`,
              R`**$-225.0^\circ$**`,
              R`$-10.51\text{ dB}$`,
              R`**精准 $-3.01\text{ dB}$ 转折点（相位滞后 $45^\circ$）**`,
            ],
            [
              R`**$1000\text{ Hz}$**`,
              R`$1.289$`,
              R`$+2.21\text{ dB}$`,
              R`$1.29\text{ V}_{\text{pp}}$`,
              R`$-234.1^\circ$`,
              R`$-10.85\text{ dB}$`,
              R`越过截止频率，斜率迅速逼近 $-20\text{ dB/dec}$`,
            ],
            [
              R`**$2000\text{ Hz}$**`,
              R`$0.748$`,
              R`$-2.52\text{ dB}$`,
              R`$0.75\text{ V}_{\text{pp}}$`,
              R`$-250.1^\circ$`,
              R`$-12.52\text{ dB}$`,
              R`高频衰减进入阻带（穿越 $0\text{ dB}$ 线）`,
            ],
            [R`**$5000\text{ Hz}$**`, R`$0.315$`, R`$-10.03\text{ dB}$`, R`$0.32\text{ V}_{\text{pp}}$`, R`$-261.8^\circ$`, R`$-17.63\text{ dB}$`, '接近十倍频程滚降'],
            [
              R`**$10000\text{ Hz}$**`,
              R`**$0.159$**`,
              R`**$-15.99\text{ dB}$**`,
              R`**$0.16\text{ V}_{\text{pp}}$**`,
              R`**$-265.9^\circ$**`,
              R`$-23.04\text{ dB}$`,
              R`与 $1\text{ kHz}$ 相比下降 $18.2\text{ dB}$（高频趋近 $-20\text{ dB/dec}$）`,
            ],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`左侧 02 层就是这张图的实时版：拖[[bd_cursor|扫频游标]]到表里的任一频点，下方读数与表中数值一致；回到 01 层拖 Ri、Rf、Cf，三条曲线一起重算。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 6 */
    {
      act_index: 6,
      badge: '第 6 幕',
      title: '零电感级联有源带通 + 3D 面包板扫频实战 + Phase 1 收官与 Phase 2 预告',
      sync: { layer: L3, halo: ['bb_gen', 'bb_scope', 'chip_lm358'], params: { ...P({ mode: 'alpf' }), f: 100, vpp: 1, cam: 'bench' } },
      blocks: [
        { kind: 'p', text: '**6.1 零电感奇迹：用级联有源高通 + 有源低通实现带通滤波器**' },
        {
          kind: 'p',
          text: R`既然运放已经消除了级间加载效应，我们就能像搭乐高一样，把**一阶有源高通（下限 $f_{c1}$）**直接串接在**一阶有源低通（上限 $f_{c2}$，且满足 $f_{c1} \ll f_{c2}$）**前面，彻底抛弃笨重的电感！`,
        },
        { kind: 'p', text: R`以**语音/人声通信带通滤波器**（目标通带 $300\text{ Hz}\sim 3.4\text{ kHz}$）为例：` },
        {
          kind: 'ul',
          items: [
            R`**[[sch_stage1|第一级（有源高通 HPF）]]**：$R_{i1} = 10\text{ k}\Omega,\; C_{i1} = 47\text{ nF},\; R_{f1} = 10\text{ k}\Omega \implies f_{c1} = \frac{1}{2\pi \times 10\text{ k}\Omega \times 47\text{ nF}} \approx 338.6\text{ Hz}$，增益 $-1$；`,
            R`**[[sch_stage2|第二级（有源低通 LPF + 增益）]]**：$R_{i2} = 10\text{ k}\Omega,\; R_{f2} = 22\text{ k}\Omega,\; C_{f2} = 2.2\text{ nF} \implies f_{c2} = \frac{1}{2\pi \times 22\text{ k}\Omega \times 2.2\text{ nF}} \approx 3288.3\text{ Hz}$，增益 $-2.2$；`,
            R`**级联总指标**：几何中心频率 $f_0 = \sqrt{f_{c1} f_{c2}} \approx 1055.2\text{ Hz}$，带宽 $B = f_{c2} - f_{c1} \approx 2949.7\text{ Hz}$，而且**两级反相相乘负负得正**，中频总增益为 $+2.2$（$+6.85\text{ dB}$，**总输出同相**！）。同理，在心电（ECG）监测前端，也可以用级联高通（$0.5\text{ Hz}$ 去基线漂移）+ 低通（$40\text{ Hz}$ 滤高频肌电噪声）构成核心抗干扰调理链。`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**精确一点**：$+2.2$ 是两级通带增益之积，是 $f_{c1} \ll f \ll f_{c2}$ 时的渐近值。本例 $f_{c2}/f_{c1} \approx 9.7$，两条裙边在中间重叠：$f_0$ 处每一级各让出 $\frac{1}{\sqrt{1 + 0.32^2}} \approx 0.952$，实际 $|\mathbf{H}(f_0)| \approx 2.2 \times 0.952^2 \approx 1.99$（$+6.0\text{ dB}$），以这个峰值为准的 $-3\text{ dB}$ 点约在 $285\text{ Hz}$ 与 $3.91\text{ kHz}$。两个截止频率拉得越开，实际值越贴近 $+2.2$。在左侧 01 层选“带通”看读数。`,
        },
        { kind: 'figure', svg: SVG_BPF, caption: '零电感级联型有源带通滤波器架构（级间零加载，自由叠加增益）与 Phase 1 → Phase 2 路线' },
        { kind: 'p', text: R`**6.2 3D 面包板实测指引：LM358 $\pm 9\text{ V}$ 有源低通扫频操作清单**` },
        { kind: 'p', text: R`切换左侧舞台至 **${code('03 3D LM358 ±9V 双电源有源低通滤波器面包板扫频实测')}**，按以下步骤亲手验证：` },
        {
          kind: 'ol',
          items: [
            R`**双电源与去耦检查**：确认 LM358 的 **[[chip_lm358_p8,rail_p9|Pin 8 接 $+9\text{ V}$]]**、**[[chip_lm358_p4,rail_m9|Pin 4 接 $-9\text{ V}$]]**，两颗 [[bb_dec|$100\text{ nF}$ 瓷片去耦电容]]紧贴芯片引脚对地跨接，防止高频自激。`,
            R`**核心拓扑接线**：[[chip_lm358_p3|Pin 3（IN+）]]直接接地；[[bb_ri|$R_i = 10\text{ k}\Omega$]] 连接信号源输出与 [[chip_lm358_p2|Pin 2（IN-）]]；[[bb_rf|$R_f = 22\text{ k}\Omega$]] 与 [[bb_cf|$C_f = 10\text{ nF}$]] 并联跨接在 Pin 2（IN-）与 [[chip_lm358_p1|Pin 1（OUT）]]之间。`,
            R`**示波器双通道挂接**：[[ch1_probe|CH1（黄色）]]测输入 $V_{\text{in}}$（$1.0\text{ V}_{\text{pp}}$ 正弦波），[[ch2_probe|CH2（绿色）]]测 Pin 1 输出 $V_{\text{out}}$。`,
            R`**[[bb_gen|对数扫频观测（$100\text{ Hz} \to 10\text{ kHz}$）]]**：`,
          ],
        },
        {
          kind: 'ul',
          items: [
            R`在 **$100\text{ Hz}$**：观测 CH2 峰峰值稳定在 **$2.18\text{ V}_{\text{pp}}$**（反相 $180^\circ$）；`,
            R`拨动旋钮至 **$723\text{ Hz}$**：观测 CH2 恰好跌至 **$1.56\text{ V}_{\text{pp}}$**（约为通带 $2.2\text{ V}_{\text{pp}}$ 的 $0.707$ 倍），同时波形再多滞后 $45^\circ$（总相移 $-225^\circ$）；`,
            R`扫至 **$10\text{ kHz}$**：CH2 衰减至 **$0.16\text{ V}_{\text{pp}}$**，完美验证 $-20\text{ dB/dec}$ 滚降；`,
            R`**终极压力测试**：点击舞台按钮在 Pin 1 接入 [[bb_rl|$R_L = 10\text{ k}\Omega$ 负载]]，观察示波器波形与波特图——**纹丝不动！**`,
          ],
        },
        {
          kind: 'table',
          caption: '面包板安全与参数（运放电路本就是 kΩ 级，按原值搭建、无需缩放）',
          head: ['项目', '取值', '说明'],
          rows: [
            [`[[bb_psu|供电]]`, `${SUPPLY}`, '两路 9 V 串联，中点 COM 作 GND：红线 + → +9 V 轨（顶部外侧），黑线 COM → 两条 GND 轨，蓝线 − → −9 V 轨（底部外侧）'],
            ['[[chip_lm358|芯片]]', 'LM358N（双运放 DIP-8，本课使用通道 A）', 'Pin 1 OUT / Pin 2 IN− / Pin 3 IN+ / Pin 4 V− = −9 V / Pin 8 V+ = +9 V'],
            ['[[bb_ri|Ri]]', '10 kΩ（1/4 W 1% 金属膜，棕黑黑红棕）', '输入电阻，也是本级的输入阻抗'],
            ['[[bb_rf|Rf]]', '22 kΩ（1/4 W 1% 金属膜，红红黑红棕）', R`通带增益 $-R_f/R_i = -2.20$`],
            ['[[bb_cf|Cf]]', '10 nF（103 独石/薄膜电容，跨接 Pin 1 与 Pin 2）', R`$f_c = 1/(2\pi R_f C_f) = 723.43\text{ Hz}$`],
            ['[[bb_rl|RL_test]]', '10 kΩ', '用于对比无源带载塌陷与有源稳如磐石的测试负载'],
            ['[[bb_dec|去耦电容]]', '2 × 100 nF（104 瓷片电容）', '紧贴 Pin 8→GND 与 Pin 4→GND 去耦'],
            ['标称性能', R`$K = -2.20$（$+6.85\text{ dB}$），$\omega_c = 4545.45\text{ rad/s}$，$f_c = 723.43\text{ Hz}$`, R`$f_c$ 处 $+3.84\text{ dB}$，此后 $-20\text{ dB/dec}$`],
            [`[[bb_gen|信号源]]`, `${GEN}：正弦 1.0 Vpp，0 V 直流偏置`, '100 Hz → 10 kHz 对数扫频'],
          ],
        },
        { kind: 'p', text: '**面包板安全规则**' },
        {
          kind: 'ul',
          items: [
            R`双电源 $\pm 9\text{ V}$ 必须在断电状态下核对 [[chip_lm358_p8|Pin 8 (+9V)]] 与 [[chip_lm358_p4|Pin 4 (-9V)]]，严禁反接导致芯片烧毁。`,
            R`所有参考地（信号源地、示波器 CH1/CH2 探头地、电源中点 GND、Pin 3 同相端）必须共接同一[[rail_gnd|地轨]]。`,
            R`LM358 在 $\pm 9\text{ V}$ 供电下线性输出摆幅约 $+7.5\text{ V}$ / $-8.9\text{ V}$（轻载；正向距正轨约 $1.5\text{ V}$，负向几乎能摆到负轨）；输入 $1\text{ V}_{\text{pp}}$ 时通带峰值输出约 $1.1\text{ V}$（$2.2\text{ V}_{\text{pp}}$），距离削波安全裕量充足。`,
            R`禁止直接将信号源大振幅（$> 6.5\text{ V}_{\text{pp}}$）接入本级增益 $-2.2$ 的滤波器，以免运放饱和削波破坏波特图扫频线性度。`,
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`**LM358 的带宽够不够？** 它的增益带宽积约 $1\text{ MHz}$。本级的噪声增益在通带是 $1 + R_f/R_i = 3.2$，闭环带宽约 $1\text{ MHz}/3.2 \approx 310\text{ kHz}$，比扫频上限 $10\text{ kHz}$ 高出 30 倍；越过 $f_c$ 后 $C_f$ 把噪声增益压向 1，余量更大。所以 $100\text{ Hz}\sim 10\text{ kHz}$ 的扫频结果就是 $\mathbf{H} = -\frac{R_f}{R_i}\cdot\frac{1}{1 + j\omega R_f C_f}$ 本身（按 GBW = 1 MHz 算，与理想值相差不到 0.02 dB、不到 1°，所以 03 层直接按这个公式显示）。`,
        },
        {
          kind: 'table',
          caption: '左侧 03 层的逐孔接线（LM358 缺口朝左，Pin 1 与 Pin 8 在第 30 列）',
          head: ['元件 / 导线', '位置', '作用'],
          rows: [
            [`[[bb_psu|${SUPPLY}]]`, '红线 → +9 V 轨；黑线 → 两条内侧 GND 轨；蓝线 → −9 V 轨', '两路串联，COM = GND'],
            ['[[chip_lm358_p8|Pin 8 V+]]', 'b30 红跳线 → +9 V 轨；a30 去耦 100 nF → GND 轨', '正电源'],
            ['[[chip_lm358_p4|Pin 4 V−]]', 'i33 蓝跳线 → −9 V 轨；j33 去耦 100 nF → GND 轨', '负电源'],
            ['[[chip_lm358_p3|Pin 3 IN+]]', 'j32 黑跳线 → GND 轨', '同相端接地'],
            ['[[bb_ri|Ri 10 kΩ]]', 'g22 → g31', R`[[node_vin|输入节点]] → [[node_vg|Pin 2 虚地]]`],
            ['[[bb_cf|Cf 10 nF]] 与 [[bb_rf|Rf 22 kΩ]]', 'i30 – i31；立式 j31 – j30', '都直接跨接 Pin 2 与 Pin 1'],
            ['[[node_vout|黄跳线]]', 'h30 → h38', 'Pin 1 输出引到第 38 列'],
            ['[[bb_gen|函数信号发生器]]', '红夹 h22；黑夹 GND 轨第 18 列', '正弦 1 Vpp 送入输入节点'],
            ['[[ch1_probe|CH1]] / [[ch2_probe|CH2]] 探头', '探头尖 i22 / g38；地夹 GND 轨第 20 / 40 列', '看 Vin / Vout'],
            ['[[bb_rl|RL 10 kΩ]]（可插拔）', 'j38 → GND 轨', '终极压力测试'],
          ],
        },
        {
          kind: 'note',
          tone: 'tip',
          text: R`在左侧 03 层点“自动扫频”，或点 100 Hz / fc / 1 kHz / 10 kHz 频点：示波器上 [[ch2_probe|CH2]] 从 $2.18$ 到 $1.56$ 再到 $0.16\text{ V}_{\text{pp}}$；把 Vin 推过约 $6.8\text{ V}_{\text{pp}}$，通带里的 CH2 顶部会先撞上 $+7.5\text{ V}$ 被削平（负半周要到 $-8.9\text{ V}$ 才削）。`,
        },
      ],
    },
    /* ---------------------------------------------------------------- act 7 */
    {
      act_index: 7,
      badge: '第 7 幕',
      title: '苏格拉底式分步工程设计与诊断测验',
      sync: { layer: L1, halo: ['sch_ri', 'sch_rf', 'sch_cf'], params: P({ mode: 'design', dReveal: 0 }) },
      blocks: [
        { kind: 'p', text: '**7.1 工程设计题架构预览图**' },
        { kind: 'figure', svg: SVG_PREVIEW_MASKED, caption: '设计指标与 5 步选型路径（标准件落地结果由你在引导例题里求出）' },
        { kind: 'p', text: '**7.2 苏格拉底式分步引导例题（5 步完整工程设计）**' },
        {
          kind: 'guided',
          title: '工程设计：传感器抗混叠一阶反相有源低通滤波器（选型 + 防饱和校验）',
          problem: R`你需要为 Phase 2 的 ESP32 采集系统设计一个前端一阶反相有源低通滤波器，使用 $\pm 9\text{ V}$ 双电源供电的 LM358（线性输出摆幅约 $+7.5\text{ V}$ / $-8.9\text{ V}$）。设计指标：通带直流电压放大倍数 $|K_{\text{DC}}| = 5$（约 $+14\text{ dB}$），$-3\text{ dB}$ 截止频率 $f_c = 1.0\text{ kHz}$，输入信号最大峰值 $V_{\text{in,peak}} = 1.2\text{ V}$（$2.4\text{ V}_{\text{pp}}$）。请分 5 步完成元件选型与不饱和校验。`,
          steps: [
            {
              title: 'Step 1 · 选定输入电阻 Ri（兼顾输入阻抗与热噪声）',
              mini_svg: MINI_STEP1,
              question: R`在一阶反相有源低通拓扑中，输入阻抗等于 $R_i$。为了避免拖垮前级传感器（要求 $R_i \ge 10\text{ k}\Omega$）同时避免阻值过大引入运放偏置电流误差，最经典的工程起步标准值应选多少？`,
              hint: R`$R_{\text{in}} = R_i \in [5\text{ k}\Omega,\; 50\text{ k}\Omega]$`,
              options: [
                {
                  text: R`$R_i = 100\ \Omega$（超低阻值，越大越好通电流）`,
                  correct: false,
                  feedback: R`停一下！$R_i = 100\ \Omega$ 会让前级传感器承受 $12\text{ mA}$ 灌电流，直接把传感器信号拉垮（加载效应反噬）。`,
                },
                {
                  text: R`$R_i = 10\text{ k}\Omega$（经典黄金平衡点）`,
                  correct: true,
                  feedback: R`非常稳健的工程直觉！$10\text{ k}\Omega$ 既能保证前级轻载，又让后续反馈电阻落在几十 $\text{k}\Omega$ 的黄金区间。`,
                },
                {
                  text: R`$R_i = 10\text{ M}\Omega$（超高阻值，绝对无电流）`,
                  correct: false,
                  feedback: R`太极端了！$10\text{ M}\Omega$ 配合 5 倍增益需要 $50\text{ M}\Omega$ 反馈电阻，运放输入偏置电流和面包板漏电会彻底淹没信号。`,
                },
              ],
              board: [R`\text{Step 1: 选定输入电阻 } R_i = 10\text{ k}\Omega`],
              halo: ['sch_ri', 'sch_vg'],
              params: { dReveal: 0 },
              layer: L1,
            },
            {
              title: 'Step 2 · 计算反馈电阻 Rf 并圆整至 E24 标准件',
              mini_svg: MINI_STEP2,
              question: R`已知通带直流增益 $|K_{\text{DC}}| = R_f / R_i = 5$，且已选定 $R_i = 10\text{ k}\Omega$。理论 $R_f$ 为 $50\text{ k}\Omega$，若实验室手头只有 E24 系列标称电阻（$47\text{ k}\Omega$、$51\text{ k}\Omega$、$56\text{ k}\Omega$），选哪一颗最接近目标增益 5（$+13.98\text{ dB}$）？`,
              hint: R`$|K_{\text{DC}}| = \frac{R_f}{R_i} \implies R_f = |K_{\text{DC}}| \cdot R_i$`,
              options: [
                {
                  text: R`$R_f = 47\text{ k}\Omega$（$|K| = 4.7$，$+13.44\text{ dB}$）`,
                  correct: false,
                  feedback: R`$47\text{ k}\Omega$ 也能工作，但误差为 $-6\%$，在 E24 序列里还有更精准的选择！`,
                },
                {
                  text: R`$R_f = 51\text{ k}\Omega$（$|K| = 5.1$，$+14.15\text{ dB}$，误差仅 $+2\%$）`,
                  correct: true,
                  feedback: R`漂亮！$51\text{ k}\Omega$ 是 E24 标准件中最贴近 $50\text{ k}\Omega$ 的阻值，实际通带增益 $K_{\text{DC}} = -5.10$（$+14.15\text{ dB}$），误差仅 $2\%$。`,
                },
                {
                  text: R`$R_f = 56\text{ k}\Omega$（$|K| = 5.6$，$+14.96\text{ dB}$）`,
                  correct: false,
                  feedback: R`$56\text{ k}\Omega$ 误差达到 $+12\%$，且会让后续饱和裕量变紧张。`,
                },
              ],
              board: [
                R`\text{Step 2: } R_{f,\text{ideal}} = 5 \times 10\text{ k}\Omega = 50\text{ k}\Omega \xrightarrow{\text{E24}} R_f = 51\text{ k}\Omega,\; K_{\text{DC}} = -5.10\; (+14.15\text{ dB})`,
              ],
              halo: ['sch_rf', 'sch_kdc'],
              params: { dReveal: 1 },
              layer: L1,
            },
            {
              title: 'Step 3 · 由目标截止频率反推反馈电容 Cf 并选取 E12 标准件',
              mini_svg: MINI_STEP3,
              question: R`使用截止频率公式 $f_c = 1 / (2\pi R_f C_f)$，代入 $R_f = 51\text{ k}\Omega$ 与目标 $f_c = 1000\text{ Hz}$，求得理论 $C_f$ 约为多少？对应哪一颗 E12 标称电容？`,
              hint: R`$C_f = \frac{1}{2\pi R_f f_c}$`,
              options: [
                {
                  text: R`理论 $3.12\text{ nF}$ → 选用 E12 标准件 $C_f = 3.3\text{ nF}$（标号 332）`,
                  correct: true,
                  feedback: R`精准无误！$1 / (2\pi \times 51\text{ k}\Omega \times 1\text{ kHz}) \approx 3.12\text{ nF}$，取最邻近的 E12 标准件 $3.3\text{ nF}$（电容标号 332）。`,
                },
                {
                  text: R`理论 $15.9\text{ nF}$ → 选用 E12 标准件 $C_f = 15\text{ nF}$（标号 153）`,
                  correct: false,
                  feedback: R`小心！你是不是把 $R_i = 10\text{ k}\Omega$ 代进了截止频率公式？记住：有源低通的 $f_c$ 只由反馈支路的 $R_f$ 和 $C_f$ 决定！`,
                },
                {
                  text: R`理论 $0.31\text{ nF}$ → 选用 E12 标准件 $C_f = 330\text{ pF}$（标号 331）`,
                  correct: false,
                  feedback: R`数量级差了 10 倍，再检查一下 $1 / (2\pi \times 51\times 10^{3} \times 10^{3})$ 的指数运算。`,
                },
              ],
              board: [R`\text{Step 3: } C_{f,\text{ideal}} = \frac{1}{2\pi (51\times 10^3)(10^3)} \approx 3.12\text{ nF} \xrightarrow{\text{E12}} C_f = 3.3\text{ nF}`],
              halo: ['sch_cf', 'sch_fc'],
              params: { dReveal: 2 },
              layer: L1,
            },
            {
              title: 'Step 4 · 核算标准件落地后的真实截止频率与 10 kHz 阻带衰减',
              mini_svg: MINI_STEP4,
              question: R`用最终选定的标准件 $R_f = 51\text{ k}\Omega$、$C_f = 3.3\text{ nF}$ 回代验算，实际截止频率 $f_{c,\text{actual}}$ 是多少？在 $10\text{ kHz}$ 处高频干扰会被压制到多少 dB？`,
              hint: R`$f_{c,\text{actual}} = \frac{1}{2\pi R_f C_f},\quad |H(f)| = \frac{R_f / R_i}{\sqrt{1 + (f/f_c)^2}}$`,
              options: [
                {
                  text: R`$f_{c,\text{actual}} = 945.7\text{ Hz}$（偏差 $-5.4\%$），$10\text{ kHz}$ 处增益跌至 $-6.37\text{ dB}$`,
                  correct: true,
                  feedback: R`完全正确！实际 $f_c = 945.66\text{ Hz}$，相对 $1\text{ kHz}$ 仅偏移 $-5.4\%$；在 $10\text{ kHz}$ 处相对通带已衰减 $20.52\text{ dB}$（绝对增益 $-6.37\text{ dB}$）。`,
                },
                {
                  text: R`$f_{c,\text{actual}} = 1054\text{ Hz}$（偏差 $+5.4\%$），$10\text{ kHz}$ 处增益仍为 $+14.15\text{ dB}$`,
                  correct: false,
                  feedback: R`电容变大（$3.12\text{ nF} \to 3.3\text{ nF}$）会让截止频率降低而非升高，且 $10\text{ kHz}$ 早已进入 $-20\text{ dB/dec}$ 滚降区。`,
                },
                {
                  text: R`$f_{c,\text{actual}} = 4823\text{ Hz}$，$10\text{ kHz}$ 处增益为 $0\text{ dB}$`,
                  correct: false,
                  feedback: R`又错用了 $R_i = 10\text{ k}\Omega$ 来算 $f_c$！请始终锁定 $R_f = 51\text{ k}\Omega$。`,
                },
              ],
              board: [
                R`\text{Step 4: } f_{c,\text{actual}} = \frac{1}{2\pi (51\text{ k}\Omega)(3.3\text{ nF})} \approx 945.7\text{ Hz},\quad |H(10\text{ kHz})|_{\text{dB}} \approx -6.37\text{ dB}`,
              ],
              halo: ['bd_target', 'bd_design'],
              params: { dReveal: 3 },
              layer: L2,
            },
            {
              title: 'Step 5 · 校验 LM358 输出不饱和安全裕量（决定是否削波）',
              mini_svg: MINI_STEP5,
              question: R`已知输入低频通带信号最大峰值 $V_{\text{in,peak}} = 1.2\text{ V}$，LM358 在 $\pm 9\text{ V}$ 供电下安全线性输出摆幅约为 $+7.5\text{ V}$ / $-8.9\text{ V}$（正向更紧）。本电路输出峰值电压是多少？是否会发生削波失真？`,
              hint: R`$|V_{\text{out,peak}}| = |K_{\text{DC}}| \cdot V_{\text{in,peak}} < V_{\text{swing,max}}$`,
              options: [
                {
                  text: R`$V_{\text{out,peak}} = 6.12\text{ V} < 7.5\text{ V}$，留有 $1.38\text{ V}$ 裕量，不饱和 ✓`,
                  correct: true,
                  feedback: R`满分通关！$|V_{\text{out,peak}}| = 5.10 \times 1.2\text{ V} = 6.12\text{ V}$，稳稳落在 $+7.5\text{ V}$ / $-8.9\text{ V}$ 线性区内（离较紧的 $+7.5\text{ V}$ 还有 $1.38\text{ V}$ 安全裕量），绝不削波！`,
                },
                {
                  text: R`$V_{\text{out,peak}} = 12.24\text{ V} > 7.5\text{ V}$，会严重削波失真 ✗`,
                  correct: false,
                  feedback: R`你是不是把峰峰值 $2.4\text{ V}_{\text{pp}}$ 当成峰值乘了 5.1？$5.1 \times 2.4\text{ V} = 12.24\text{ V}$ 是输出的峰峰值，不是峰值。重新乘一下 $5.1 \times 1.2\text{ V}$！`,
                },
                {
                  text: R`$V_{\text{out,peak}} = 1.20\text{ V}$，因为滤波器不放大电压`,
                  correct: false,
                  feedback: R`那是无源滤波器的局限！我们设计的可是带 $+14.15\text{ dB}$ 增益的有源低通滤波器。`,
                },
              ],
              board: [R`\text{Step 5: } |V_{\text{out,peak}}| = 5.10 \times 1.2\text{ V} = 6.12\text{ V} < 7.5\text{ V}\; (\text{无削波，安全裕量 } 1.38\text{ V})`],
              halo: ['sch_opamp', 'sch_kdc'],
              params: { dReveal: 4 },
              layer: L1,
            },
          ],
          done_params: { dReveal: 9 },
          conclusion: R`五步落地：$R_i = 10\text{ k}\Omega$、$R_f = 51\text{ k}\Omega$（E24）、$C_f = 3.3\text{ nF}$（E12），实际 $K_{\text{DC}} = -5.10$（$+14.15\text{ dB}$）、$f_c \approx 945.7\text{ Hz}$，输出峰值 $6.12\text{ V}$ 不削波。左侧 01 层与 02 层的设计页现在全部揭晓。`,
        },
        { kind: 'p', text: '**通关复盘：标准件落地结果**' },
        { kind: 'figure', svg: SVG_PREVIEW, caption: '苏格拉底工程实战目标：设计抗混叠有源低通前端（|K| ≈ 5 / +14 dB，fc ≈ 1.0 kHz）——标准件落地结果' },
        {
          kind: 'calc',
          title: '通关复盘 · 五步代入数值（引导例题的完整板书）',
          steps: [
            { label: 'Step 1', tex: R`R_i = 10\text{ k}\Omega \quad (\text{输入阻抗} = R_i)` },
            {
              label: 'Step 2',
              tex: R`R_{f,\text{ideal}} = 5 \times 10\text{ k}\Omega = 50\text{ k}\Omega \xrightarrow{\text{E24}} 51\text{ k}\Omega, \quad K_{\text{DC}} = -\frac{51}{10} = -5.10 \;(+14.15\text{ dB})`,
            },
            { label: 'Step 3', tex: R`C_{f,\text{ideal}} = \frac{1}{2\pi \times 51\times 10^{3} \times 10^{3}} \approx 3.12\text{ nF} \xrightarrow{\text{E12}} 3.3\text{ nF}` },
            {
              label: 'Step 4',
              tex: R`f_{c,\text{actual}} = \frac{1}{2\pi \times 51\times 10^{3} \times 3.3\times 10^{-9}} \approx 945.7\text{ Hz}, \quad |H(10\text{ kHz})| = \frac{5.10}{\sqrt{1 + (10000/945.7)^2}} \approx 0.480 \;(-6.37\text{ dB})`,
            },
            { label: 'Step 5', tex: R`|V_{\text{out,peak}}| = 5.10 \times 1.2\text{ V} = 6.12\text{ V} < 7.5\text{ V} \quad (\text{负半周离 } -8.9\text{ V} \text{ 更远})` },
          ],
        },
        {
          kind: 'p',
          text: '**7.3 诊断测验（4 题核心能力检验）**：四道题覆盖本课四个考点——有源低通的增益与截止频率解耦、无源 RC 的带载塌陷、零电感级联带通的工程理由、面包板扫频的 −3 dB 读数。四题全部答对即通关本课，也为整个 Phase 1 收官。',
        },
      ],
      quiz: [
        {
          id: 'w5l9_q1',
          question: R`一个一阶反相有源低通滤波器使用 $R_i = 10\text{ k}\Omega$、$R_f = 22\text{ k}\Omega$、$C_f = 10\text{ nF}$。如果将输入电阻 $R_i$ 从 $10\text{ k}\Omega$ 换为 $5\text{ k}\Omega$（$R_f$ 与 $C_f$ 保持不变），会发生什么变化？`,
          options: [
            { key: 'A', text: R`通带直流增益翻倍至 $-4.4$（$+12.87\text{ dB}$），截止频率 $f_c$ 保持 $723.4\text{ Hz}$ 不变`, correct: true },
            {
              key: 'B',
              text: R`通带直流增益不变，截止频率 $f_c$ 翻倍至 $1446.9\text{ Hz}$`,
              correct: false,
              feedback: R`截止频率 $f_c = 1/(2\pi R_f C_f)$ 里根本没有 $R_i$：换 $R_i$ 不会挪动 $f_c$。真正跟着 $R_i$ 变的是通带增益 $-R_f/R_i$，它不可能“不变”。`,
            },
            {
              key: 'C',
              text: '通带增益与截止频率同时翻倍',
              correct: false,
              feedback: R`增益确实翻倍，但 $f_c$ 只由反馈支路的 $R_f$、$C_f$ 决定，与 $R_i$ 完全解耦——两者不会一起翻倍。`,
            },
            {
              key: 'D',
              text: '通带增益减半，截止频率减半',
              correct: false,
              feedback: R`方向反了：$|K_{\text{DC}}| = R_f/R_i$，$R_i$ 变小增益变大；而 $f_c$ 与 $R_i$ 无关，不会减半。`,
            },
          ],
          feedback_correct: R`反相有源低通的直流增益 $K_{\text{DC}} = -R_f/R_i$，$R_i$ 减半则 $|K_{\text{DC}}|$ 翻倍（$2.2 \to 4.4$）；而截止频率 $f_c = 1/(2\pi R_f C_f)$ 仅取决于反馈支路的 $R_f$ 与 $C_f$，与 $R_i$ 完全解耦，因此 $f_c$ 仍为 $723.4\text{ Hz}$。`,
          feedback_wrong: R`回到第 4 幕的黄金公式 $\mathbf{H} = -\frac{R_f}{R_i}\cdot\frac{1}{1 + j\omega R_f C_f}$：哪一项含 $R_i$？`,
          figure: SVG_Q1,
          sync: { layer: L1, halo: ['sch_ri', 'sch_kdc', 'sch_fc'], params: P({ mode: 'alpf' }) },
        },
        {
          id: 'w5l9_q2',
          question: R`某同学搭建了 $R = 22\text{ k}\Omega$、$C = 10\text{ nF}$ 的无源 RC 低通滤波器（空载 $f_c = 723.4\text{ Hz}$），随后直接在输出端并联了一个 $R_L = 10\text{ k}\Omega$ 的后级负载电阻。此时实测通带增益与截止频率会如何变化？`,
          options: [
            {
              key: 'A',
              text: R`通带增益仍为 $0\text{ dB}$，$f_c$ 降低至约 $226\text{ Hz}$`,
              correct: false,
              feedback: R`负载会抢走电流，通带不可能还是 $0\text{ dB}$；而且电容看到的电阻变成 $R \parallel R_L$，比 $R$ 小，$f_c$ 只会升高，不会降到 $226\text{ Hz}$。`,
            },
            { key: 'B', text: R`通带增益暴跌至 $-10.10\text{ dB}$，$f_c$ 反而升高至约 $2315\text{ Hz}$`, correct: true },
            {
              key: 'C',
              text: R`通带增益暴跌至 $-10.10\text{ dB}$，但 $f_c$ 保持 $723.4\text{ Hz}$ 不变`,
              correct: false,
              feedback: R`通带塌陷说对了，但 $f_c$ 也变了：$f_c = 1/(2\pi R_{\text{th}} C)$，而 $R_{\text{th}} = R \parallel R_L$ 比 $R$ 小得多，截止频率随之升高。`,
            },
            {
              key: 'D',
              text: '通带增益升高，fc 降低',
              correct: false,
              feedback: R`无源网络带载只会更衰减：分压系数 $R_L/(R+R_L) < 1$，增益不可能升高；等效电阻变小，$f_c$ 也是升高而非降低。`,
            },
          ],
          feedback_correct: R`由戴维南等效定理，带载后通带分压系数跌至 $R_L/(R+R_L) = 10/32 = 0.3125$（$-10.10\text{ dB}$），等效时间常数电阻缩小为 $R_{\text{th}} = R \parallel R_L = 6.875\text{ k}\Omega$，导致截止频率 $f_c = 1/(2\pi R_{\text{th}} C)$ 飙升 $3.20$ 倍至 $2315\text{ Hz}$。`,
          feedback_wrong: R`回到第 3 幕：把电容拿走，求左边网络的戴维南等效 $V_{\text{th}}$ 与 $R_{\text{th}}$。`,
          figure: SVG_Q2,
          sync: { layer: L1, halo: ['sch_rl'], params: P({ mode: 'plpf' }) },
        },
        {
          id: 'w5l9_q3',
          question: '在音频或心电（ECG）前端设计低频（如 0.5 Hz–40 Hz）带通滤波器时，工程师几乎总是用「有源高通 + 有源低通级联」而非无源 RLC 谐振电路，最核心的综合原因是：',
          options: [
            {
              key: 'A',
              text: '无源 RLC 无法实现任何带通响应',
              correct: false,
              feedback: R`无源 RLC 当然能做带通——第 2 幕的串联 RLC 从 $R$ 两端取输出就是。问题不在“能不能”，而在低频时所需的电感太大、太重、太吸噪声。`,
            },
            {
              key: 'B',
              text: '有源滤波器不需要任何电源供电，功耗为零',
              correct: false,
              feedback: R`恰恰相反：有源滤波器离不开电源，LM358 要台式可调直流电源（±9 V）供电才能工作；也正因为有外部能源注入，它才能提供增益。`,
            },
            {
              key: 'C',
              text: '有源一阶滤波器的滚降斜率天然是 -80 dB/dec',
              correct: false,
              feedback: R`一阶滤波器（不论有源无源）只有一个极点，越过截止频率后是 $-20\text{ dB/dec}$；$-80\text{ dB/dec}$ 需要四阶。`,
            },
            { key: 'D', text: '有源级联可彻底避免低频所需的高值笨重电感、消除级间加载效应，并能同步提供信号放大', correct: true },
          ],
          feedback_correct:
            '低频无源 RLC 需要亨利级大电感（笨重、昂贵、易受磁干扰且 Q 值受绕线内阻恶化）；级联有源 RC 滤波器彻底消除电感，运放缓冲消除级间加载，并可按需分配通带增益。',
          feedback_wrong: '回到第 3 幕的三大硬伤与第 6 幕的“零电感奇迹”：有源级联一次解决了哪几条？',
          figure: SVG_Q3,
          sync: { layer: L1, halo: ['sch_stage1', 'sch_stage2'], params: P({ mode: 'bpf' }) },
        },
        {
          id: 'w5l9_q4',
          question: R`在 3D 面包板上测试本课推荐的 $\pm 9\text{ V}$ LM358 有源低通滤波器（$R_i = 10\text{ k}\Omega$、$R_f = 22\text{ k}\Omega$、$C_f = 10\text{ nF}$，$f_c = 723.4\text{ Hz}$），输入 $1.0\text{ V}_{\text{pp}}$ 正弦波。当频率从 $100\text{ Hz}$ 缓慢扫频到 $723.4\text{ Hz}$ 时，示波器 CH2（输出）的峰峰值最接近：`,
          options: [
            {
              key: 'A',
              text: R`$0.71\text{ V}_{\text{pp}}$（相对输入 $-3\text{ dB}$）`,
              correct: false,
              feedback: R`$0.707$ 要乘在通带输出上，而不是输入上：这一级通带就把 $1.0\text{ V}_{\text{pp}}$ 放大成 $2.20\text{ V}_{\text{pp}}$，$-3\text{ dB}$ 是相对这个通带平台说的。`,
            },
            {
              key: 'B',
              text: R`$1.10\text{ V}_{\text{pp}}$（通带峰峰值减半）`,
              correct: false,
              feedback: R`$-3\text{ dB}$ 是电压幅度乘 $1/\sqrt{2} \approx 0.707$（功率减半），不是电压减半；电压减半（$2.20 \to 1.10\text{ V}_{\text{pp}}$）对应的是 $-6\text{ dB}$。`,
            },
            { key: 'C', text: R`$1.56\text{ V}_{\text{pp}}$（通带 $2.20\text{ V}_{\text{pp}}$ 的 $0.707$ 倍，即 $+3.84\text{ dB}$）`, correct: true },
            {
              key: 'D',
              text: R`$2.20\text{ V}_{\text{pp}}$（截止频率处幅值不衰减）`,
              correct: false,
              feedback: R`截止频率的定义就是比通带低 $3\text{ dB}$ 的点：到 $f_c$ 时幅度已经跌到通带的 $0.707$ 倍，不会还停在 $2.20\text{ V}_{\text{pp}}$。`,
            },
          ],
          feedback_correct: R`通带最大增益为 $2.20$（输入 $1.0\text{ V}_{\text{pp}}$ 对应通带输出 $2.20\text{ V}_{\text{pp}}$）。$-3\text{ dB}$ 截止频率是指跌落至通带最大值的 $0.7071$ 倍，即 $2.20 \times 0.7071 = 1.556\text{ V}_{\text{pp}}$（$+3.84\text{ dB}$），而非 $0.707\text{ V}_{\text{pp}}$！`,
          feedback_wrong: R`先求通带输出 $|K_{\text{DC}}| \times 1.0\text{ V}_{\text{pp}}$，再想 $-3\text{ dB}$ 是乘多少。`,
          figure: SVG_Q4,
          sync: { layer: L3, halo: ['ch2_probe', 'bb_scope'], params: { ...P({ mode: 'alpf' }), f: 100, vpp: 1, cam: 'scope' } },
        },
      ],
      after_quiz: [
        { kind: 'p', text: '**Phase 1 收官 · 模拟电路核心基石全部拼齐**' },
        {
          kind: 'ul',
          items: [
            'Phase 1 知识收官：W1 欧姆/基尔霍夫 → W2 等效/电路定理 → W3 运放 → W4 储能/瞬态 → W5 相量/波特图/谐振/有源滤波。每一块拼图都已经在面包板上亲手验证过。',
            R`今天这一课把它们熔在了一起：相量分压给出 $\mathbf{H}(\omega)$，戴维南等效解释无源 RC 的带载塌陷，运放的虚短虚断给出 $-\mathbf{Z}_f/\mathbf{Z}_i$，分贝与对数频率轴把 $100\text{ Hz}\sim 10\text{ kHz}$ 的扫频结果画成波特图。`,
          ],
        },
        { kind: 'p', text: '**预告 Phase 2 — ESP32 硬件实战：ADC 抗混叠滤波、传感器调理与实时数字采集**' },
        {
          kind: 'ul',
          items: [
            '下一站 Phase 2（ESP32 硬件实战）：用今天的 LM358 有源低通做 ADC 抗混叠前端，让微控制器精准读懂真实物理世界！',
            '第 7 幕的引导例题就是这样一个前端：先定增益与截止频率，再按 E24 / E12 选标准件，最后核对输出不越过运放的摆幅。',
          ],
        },
      ],
    },
  ],
};

export default W5_L9;
