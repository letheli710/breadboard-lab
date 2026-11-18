# 重构计划 / Rebuild plan

课程按 **World** 组织：8 个主线 World 加 1 个 UB 衔接区。每个 World 对应一门 QCC 课程和教材章节。配置在 `course/worlds.json`，应用里的“路线”页（`#/map`）、挑战列表和练习区的章节列表都按它分组。传送门见 `docs/PORTALS.md`，学习单元格式见 `docs/UNIT_FORMAT.md`。

The course is organised in **Worlds**: 8 main-line Worlds plus the UB bridge area, each tied to a QCC course and textbook chapters. The configuration is `course/worlds.json`; the Map page (`#/map`), the challenge list and the Practice chapter list are grouped by it.

**红线 / Rule:** 重新分组只改 `course/worlds.json`（归属和显示顺序），不改任何单元原有的 id 和文件名（本地进度、交叉引用、e2e 都靠它们）。新单元用新 id。
Regrouping only edits `course/worlds.json`; existing ids and file names never change. New units get new ids.

EE-204 的官方 syllabus 没有周课表，所以只按教材章节标注，不写周次。World 6–8 的课程 syllabus 没有列教材，不写教材名。
EE-204's syllabus has no weekly schedule, so Worlds are labelled by textbook chapter, not by week. Worlds 6–8 name no textbook because their syllabi list none.

## 1. World 结构 / World structure

| World | 主题 | 课程 | 教材 |
|---|---|---|---|
| 1 | 基础定律与直流分压 | EE-204 Midterm 1 · ET-110 Exam 1 | Sadiku Ch 1–2 |
| 2 | 网络分析与电路定理 | EE-204 Midterm 2 · ET-110 Exam 2 | Sadiku Ch 3–4 |
| 3 📍 | 运算放大器基础（当前进度） | EE-204 期末 | Sadiku Ch 5 |
| 4 | 储能元件与一阶 / 二阶暂态 | EE-204 期末 · ET-110 Week 11–12 | Sadiku Ch 6–8 |
| 5 | 正弦稳态、相量与交流功率（Part A：ET-110 期末；Part B：ET-140） | ET-110 · ET-140 | Sadiku Ch 9–14 · Boylestad |
| 6 | 半导体器件与分立放大器 | ET-210（寒假）· ET-140 Lab #2–#11 | — |
| 7 | 模拟 IC 进阶：非理想 op-amp、波特图、有源滤波、555 与功放 | ET-220 | — |
| 8 | 数字逻辑、MCU 与传感器实战 | ET-540 · 硬件项目 | — |
| UB | UB 衔接 / 选修理论区（不计入主线进度） | 回 UB 后的 EE 课程 | Sadiku 后半本 |

每个 World 包含哪些课程、实验、单元和理论章节，以 `course/worlds.json` 为准；`npm run validate` 保证每个课程 / 实验 / 章节 / 单元恰好出现在一个 World 里。

World 5 的说明：Part B 前半（相量、阻抗、RC 频率响应）是 World 7 波特图与滤波的前置。

## 2. 待建单元 / Units to build

下面每个 id 都登记在 `course/pending.json` 里。传送门可以指向它们（显示为“即将上线”）；建好一个同 id 的单元或实验后，传送门自动接通，再把它从 `pending` 删掉即可（`npm run validate` 会提醒）。
Every id below is in `course/pending.json`. Portals may point at them (shown as "coming soon"); once a unit or lab with the same id exists they connect by themselves.

### World 5
- `w5-ac-power-pfc` 交流功率与功率因数校正（面包板）/ AC power and power-factor correction (lab)

### World 6 · 半导体器件 / Semiconductor devices
- `w6-half-wave-rectifier` 半波整流与电容滤波
- `w6-zener-regulator` 齐纳稳压
- `w6-clipper-clamper` 二极管削波与钳位（ET-140 Lab #5）
- `w6-bridge-rectifier` 全波桥式整流与直流电源链
- `w6-bjt-bias` BJT 特性曲线、分压式偏置与直流负载线
- `w6-diff-pair` 差分对（与 World 3 op-amp 内部互链）
- `w6-ce-amp` BJT 小信号 r_e 模型、共射放大器与射极跟随器
- `w6-jfet-cs` JFET 共源放大

### World 7 · 模拟 IC / Analog ICs
- `w7-lm358-inside` 拆开 LM358 内部三级的定量分析
- `w7-gbw` 非理想 op-amp：增益带宽积 GBW（ET-220 Lab 9–10）
- `w7-slew-offset` 压摆率与失调（ET-220 Lab 9–10）
- `w7-r2r-dac` R-2R DAC
- `w7-bode` 分贝与波特图
- `w7-active-hp-notch` 二阶有源高通与陷波器（Lab 11–12）
- `w7-ce-freq-response` 共射放大器频率响应（ET-220 Week 11）
- `w7-555` 555 定时器与压控振荡器 VCO
- `w7-push-pull` Class A / B / AB 推挽功放与 op-amp 输出扩流（Lab 13）
- `w7-schmitt` 施密特触发器

### World 8 · 数字逻辑 / Digital logic
- `w8-cmos-74hc` CMOS 反相器与 74HC 逻辑门
- `w8-boolean-kmap` 布尔代数、德摩根定律与卡诺图
- `w8-adders` 半加器与全加器
- `w8-bcd-7seg` BCD 七段译码器
- `w8-flipflops-counters` D / JK 触发器与同步计数器
- `w8-clock-555` 555 时钟（ET-540 Lab 9）

## 3. 长期规划 / Long term

- 五层单元结构（直觉 → 交互推导 → 仿真 → 面包板 → 回链）逐步推广到 World 1–2、4–8。World 3 是第一个完整按单元组织的 World。
  Extend the five-layer unit structure to Worlds 1–2 and 4–8; World 3 is the first World built from units.
- 为电容、二极管、BJT、555、逻辑门分别建立“器件档案”单元，结构参照 World 3 的 `w3-chip`（怎么用 → 内部方块图 → 通用计算流程 → 常见问题表）。
  Device-profile units for the capacitor, diode, BJT, 555 and logic gates, modelled on `w3-chip`.
- 可选：World 2 末尾加直流电压表、电流表设计（倍压电阻与分流电阻，ET-110 Lab 12）。
  Optional: DC voltmeter / ammeter design at the end of World 2 (multiplier and shunt resistors, ET-110 Lab 12).

---

# 第二部分：界面、卡片与符号 / Part 2: interface, cards and notation

> 下面来自“界面整理 / 卡片式单元”那条线（分支 `claude/adoring-fermat-4b7jp1`），2026-11-17 和上面的 8 个 World 合并。**World 的划分和顺序以上面的 `course/worlds.json` 为准**；下面说到的“5 个 World”已经换成 8 个，单元编号（3.5、8.2 …）由 `src/core/course.ts` 按 `course/worlds.json` 的分组自动生成。合并时为了先修关系做的调整：信号发生器 / 示波器三节仪器课放到 World 3（反相、求和放大器要用）；三极管、MOSFET、继电器、LDO 实验放到 World 8 开发板之后（都由 GPIO 驱动）；“两颗 LED 串联”留在 World 1 串联单元，“二极管反接保护”放到 World 6；已经做好的施密特触发器、功率因数校正、半波整流实验替换了待建清单里的同名项。
> From the interface / card-unit line, merged with the 8 Worlds above on 2026-11-17. **Worlds and their order come from `course/worlds.json`**; unit numbers are generated from its sections by `src/core/course.ts`. Prerequisite moves made in the merge: the generator / scope lessons sit in World 3 (the inverting and summing labs need them); the transistor, MOSFET, relay and LDO labs sit in World 8 after the dev board (they are driven from a GPIO pin); the finished Schmitt-trigger, power-factor and half-wave-rectifier labs replace their pending entries.

## 原计划 / The card-unit plan

> 这份文件取代 Gemini 对话里的《Breadboard Lab 2.0 执行手册》，是重构的唯一依据。它保留了那份手册里对的部分，改正了和代码不符的地方，并记录已经完成了什么、还剩什么。
> This file replaces the "Breadboard Lab 2.0 execution manual" from the Gemini conversation as the single source of truth for the rebuild: what was decided, what in that manual was checked and corrected, what is done and what is left.

**一句话**：这是给你自己用的学习程序。主干按 Alexander & Sadiku《Fundamentals of Electric Circuits》的章节走，用 Boylestad《Introductory Circuit Analysis》的小步子和有效值相量，用 Platt《Make: Electronics》的“先动手、再讲道理”，第 5 世界用 Scherz & Monk《Practical Electronics for Inventors》和 ESP32 教程。每个单元是几张短卡片，一次只看一张。

**In one line**: a study app for one learner. The backbone follows Sadiku's chapters; Boylestad sets the pace and the rms phasors; Make: Electronics sets the "do it first, explain it after" order; World 5 draws on Practical Electronics for Inventors and ESP32 tutorials. Every unit is a few short cards, shown one at a time.

教材只用来对照章节结构和符号约定；课程里的文字、例子和题目都是自己写的，不抄书。
The textbooks are used for chapter structure and conventions only; all lesson text, examples and problems are written for this project, not copied.

---

## 1. 已经定下的决定 / Decisions

| 事项 | 决定 | 理由 |
|---|---|---|
| 主干教材 | Sadiku（章节顺序、理论题对照） | 讲法清楚、自学友好；理论题章节按它排（`src/core/problem/chapters.ts`） |
| 节奏 | Boylestad 的小步子：串联、并联、混联各成一课 | 直流部分一次只加一个新概念 |
| 开局方式 | Make: Electronics：先动手、先看现象（可以故意做错），再讲原因 | 先有“咦？”再有公式，更容易保持专注 |
| 电压符号 | **v / V**（不再用 u / U），电流 i / I | 两本美国教材都这样写 |
| 阶跃函数 | **u(t)**（不再用 ε(t)） | Sadiku 的写法；电压改用 v 后不再冲突 |
| 相量大小 | **有效值**（rms），题干写明“（有效值）” | 和你上课用的 Boylestad、和万用表读数一致；Sadiku 用振幅相量，差 √2 |
| 正弦参考 | cos（Sadiku）；给 sin 时先换成 cos | Boylestad 用 sin，换算一步就够 |
| 双曲函数 | cosh / sinh / tanh | 美国教材写法 |
| 状态方程 | ẋ = A·x + B·z（z 是输入向量） | Sadiku 的写法 |
| 节奏安排 | 先做 World 1 的样板，你试用之后再做 World 2–5 | 避免同一种写法上的问题重复 76 次 |

符号细节见 [`NOTATION.md`](NOTATION.md)。旧题目已经全部迁移；题目 id、问题 id 和 JSON 数据键没有改，所以错题本和进度不受影响。

## 2. 对 Gemini 手册的核对 / What the Gemini manual got right and wrong

| Gemini 说的 | 核对结果 | 怎么处理 |
|---|---|---|
| 入门课 2/4/5/7 里“电池”和 `V1` 理想源混用，内阻不一致 | **不对**。`dc_source` 是有意的通配类型，能匹配任何电源；参考答案本来就用 9 V 电池（含 1.5 Ω 内阻） | 不改 |
| 入门课 1–8 没有步骤检查 | 对 | World 1 的课程每个搭建步骤都加了 `check` |
| 题面里出现 `tests`、`currents`、`regions`、`usb: false`、`rise` | 对（16 处） | 全部改成界面上的叫法 |
| 挑战 6 的二极管写“约 0.7 V”，和模型 0.65 V + 0.8 Ω 不一致 | 对 | 改成模型参数和约 0.66 V |
| 5-8 和 5-15 电路几乎一样 | 对 | 已解决：287 只讲直流开关和 IRF540N 对比，PWM 调速全部放到 294 |
| 符号全部改成 Sadiku（包括**振幅相量**） | **不妥**：你上课用的 Boylestad 是有效值相量；只把 ε(t) 改成 u(t) 而电压还叫 u，会和电压冲突 | 改成 v/V + u(t) + **有效值相量**（见 §1） |
| 开放式设计题“只要放宽 target 就行” | **不对**：判分先比对电路连接（拓扑） | ✅ 引擎加了“只看表现”判分：`options.grading: "behaviour"` 只跑 tests（第一题 298 天黑自动亮灯） |
| 公式用 `$…$` LaTeX | 当时课程文字**没有**公式渲染 | 已加：课程文字支持 `$…$` / `$$…$$`（复用练习区的公式排版，没有引入新库） |
| Make: Electronics 第 3 版 | 你给的是第 2 版 | 实验编号按第 2 版对照 |
| 4-7 + 4-8、1-3 + 2-5 等“合并” | 方向对，但合并成一个巨大的文件不利于专注 | 改成**放进同一个单元**，按顺序做，每一项仍然短 |
| 挑战 2（分压器）删掉、并进万用表课 | 部分采纳 | 保留成万用表课后面的自己动手练习（1.4b），加了测量题 |
| 2-7、2-8 留在第 2 世界 | **不对**：它们要用信号发生器和示波器，那是第 3 世界才教 | 移到 3.2 |
| 第 5 世界先做三极管、再讲开发板 GPIO | **不对**：三极管实验要用 GPIO，先修课是开发板课 | 5.2 先讲开发板和 GPIO，再做三极管 |
| 示波器双通道课放在第 4 世界 | **不对**：第 3 世界的微分 / 积分实验就要用双通道 | 移到 3.1 |

## 3. 交互结构 / How a unit works

- **Learn 页面 = 整个课程地图**（`src/core/course.ts`）：课程、挑战、实验按顺序混排。地图平时收起：Logo 旁边的「课程地图」按钮显示当前位置和进度，点开是左侧的面板（World 1–5 标签，按单元分组，编号 1.1、1.4a、1.4b……）；任务面板顶部的“World · 单元”也能打开它，旁边的 ‹ › 跳到上一个 / 下一个。挑战页的地图只列挑战和实验。
- **元件箱**（`src/core/partLevels.ts`）：左栏只放工具和本课用到的元件；「全部元件」面板按课程进度分三组（基础 / 信号与 op-amp / 单片机与器件），屏幕够大时全部展开，否则只展开当前 World 对应的一组。
- **工作台操作**（来自「电路编辑器交互优化」分支 `claude/adoring-fermat-4b7jp1`，已合并；操作表见 README「工作台操作」）：左键点元件在旁边看详情、随时改参数（不用退回前面的步骤），右键出菜单，拖空白处或右键拖动平移、中键旋转；电池等板外仪器可拖动、按 T 转向；橡皮擦（E）在元件箱最下方；放好元件自动回到「选择」，下方「常用」五格放最近用过的元件；工作台左上「元件」开关收起元件箱；右侧面板可拖宽、双击复原、收起。课程列表只从 Logo 旁的课程地图进入（那个分支里工作台左上的课程抽屉没有并进来，免得两个入口）。
- **卡片**（`docs/CHALLENGE_FORMAT.md` §16）：🔥 试一试 → 💡 想明白 → 🛠️ 动手做 → 🚀 带走，一次只显示一张。每张卡片拥有一段步骤，步骤带自动检查；测量题在“动手做”卡片上；“带走”卡片链接到理论章节和下一个单元。
- **理论练习**按 Sadiku 的章节顺序，按 World 分组；`matrix-form`、`transmission-line` 放到“选学”。受控源单独成一章（`dependent-sources`），放在 op-amp 之后。
- 测量题的期望值永远按你自己的面包板仿真；卡片文字里不写测量题的答案（校验器会检查）。

## 4. 写作规范 / Writing rules for cards

1. **先现象，后公式。** “试一试”卡片只给动作和一个问题；公式留给“想明白”。
2. **一张卡片 2–5 个短段落或要点**，一句话一件事。长解释拆成两句，不要塞进括号。
3. **动作加粗，孔位和数值用代码样式**：**`b4`**、**`150 Ω`**。三秒内能找到“拿什么、插哪里、调什么”。
4. **一个核心公式**，用 `$…$` / `$$…$$` 写，然后代入数字。
5. **不出现程序里的字段名**：写“点「检查我的电路」”“在右侧「属性」里取消勾选「USB 供电」”。
6. **不超前用术语**：后面才讲的概念，用一句大白话代替。
7. **模型参数说一致**：LED = Vf + 12 Ω；硅二极管 = 0.65 V + 0.8 Ω；电池内阻 9 V 1.5 Ω、AA 0.15 Ω、CR2032 15 Ω。
8. 双语：中文在顶层，英文在 `i18n.en`，按位置一一对应。
9. **“想明白”卡片配图**（`figures`，CHALLENGE_FORMAT §16.3）：讲连接关系用面包板图，讲电流 / 电压用电路图（电流箭头、+/− 标记、回路箭头），讲“随着什么变”用曲线。图紧跟它解释的那一段；图注一句话说清“看哪里”。图上不写测量题的答案。面包板图上的文字由程序摆放：先放在板上不挡信息的位置，放不下再用引线标到板外（你在原型 `prototypes/figure-labels.html` 里选的 D + C）；电路图、曲线照常画。

## 5. 课程地图与进度 / Course map and status

✅ = 已改成卡片式　⬜ = 还是旧写法（能用，但还没重写）

### World 1 · 看见看不见的电（S 1–2 · B 1–7 · M 1–6）✅ 全部完成

插图：1.1–1.11 的“想明白”卡片都已配图（面包板金属条、电流回路、LED 特性曲线、万用表和电流表接法、串联、KVL 回路、KCL、并联、开关与四脚按键、电位器、单刀双掷、电池与电源轨、内阻、电压余量、CV/CC、串并联网络、电桥、排错路径）。

| 单元 | 内容 | 文件 |
|---|---|---|
| 1.1 | 面包板：孔底下的金属条 | 01 |
| 1.2 | 电源与 GND：电流回家的路 | 02 |
| 1.3 | LED：为什么一定要限流电阻（先烧一颗） | 03 |
| 1.4 | 万用表：看见电压；分压器 | 101、10 |
| 1.5 | 电流表：串联才能测电流（先接错一次） | 102 |
| 1.6 | 从原理图到面包板 | 04 |
| 1.7 | 串联与 KVL | 05、09、202 |
| 1.8 | 并联与 KCL（两颗灯共用一个电阻） | 06、201 |
| 1.9 | 开关、按键与电位器 | 07、11、12、13 |
| 1.10 | 真实的电源：内阻、模块、稳压电源 | 08、17、16、103、18 |
| 1.11 | 混联、电桥与排错 | 19、15、207、206 |
| 理论 | 基本概念与基本定律、串并联与等效变换 | `basics`、`equivalence`（受控源题已移走） |

### World 2 · 驯服电路网络与 op-amp（S 3–5 · B 8–9）✅ 卡片式完成

每个“想明白”卡片都配了图：电流源回路和 CC/CV 曲线、分流、两个结点、置零的电压源、诺顿 / 戴维宁两个盒子、置零后看进去的电阻、P–R_L 曲线、分压器的戴维宁等效、LM358 引脚（面包板图）、跟随器、缓冲器、同相放大器的反馈分压。

| 单元 | 内容 | 文件 |
|---|---|---|
| 2.1 | 电流源与分流（CC 模式；电流表并在结点上先“抢走”全部电流） | 204、205 |
| 2.2 | 结点电压法（电流源把结点推得比电压源还高） | 224 |
| 2.3 | 叠加，然后电源变换（按 Sadiku 第 4 章的顺序） | 221、208 |
| 2.4 | 戴维宁与最大功率（9 V 电池 1.5 Ω 当例子） | 222、223 |
| 2.5 | 分压器被 1 kΩ 压垮 → LM358（先不接反馈，输出顶到头）→ 跟随器把电压救回来 | 203、106、225 |
| 2.6 | 同相放大器（饱和时虚短失效） | 226 |
| 理论 | 分析方法、电路定理、op-amp、受控源 | `methods`、`theorems`、`opamp`、`dependent-sources` |

### World 3 · 掌控时间（S 6–8 · B 10–11, 25 · M 9）✅ 全部完成

插图：3.1–3.7 的“想明白”卡片都已配图（示波器上的正弦和周期、信号发生器里的 50 Ω、探头接法、两通道的时间差、反相放大器和加法器、电容放电回路和呼吸曲线、RC 充电曲线和 τ、戴维宁 R_eq、微分尖峰和积分三角波、op-amp 积分器、RL 的尖峰和斜坡、三种阻尼）。

| 单元 | 内容 | 文件 |
|---|---|---|
| 3.1 | 信号发生器和示波器：第一条波形；信号发生器里的 50 Ω 和探头接地夹（故意夹错一次）；双通道与相位差 | 104、250（新）、105 |
| 3.2 | op-amp 遇上交流信号：反相放大器、加法器、施密特触发器 | 227、228、230 |
| 3.3 | 呼吸灯：电容是装电荷的水桶（dv/dt = i/C） | 245 |
| 3.4 | RC 时间常数；电容旁并电阻：戴维宁求 τ | 241、247 |
| 3.5 | RC 微分与积分电路；op-amp 积分器 | 242、246 |
| 3.6 | 电感：电流不能突变（RL 方波） | 243 |
| 3.7 | RLC 振铃：欠阻尼、临界阻尼、过阻尼 | 244 |
| 理论 | 储能元件、一阶电路、二阶电路 | `storage`、`first-order`、`second-order` |

### World 4 · 掌控频率（S 9–17, 19 · B 13–24, 26）✅ 全部完成

每个“想明白”卡片都配了图（波形、相量三角形、幅频曲线、谐振峰、等效电路）。示波器没有 MATH 相减功能，这里的探头量的是“针尖 − 接地夹”，所以 v_L、v_C 都是把 CH2 夹在元件两端读的（“带走”卡片提醒：真实示波器的接地夹连着地线，不能这样夹）。

| 单元 | 内容 | 文件 |
|---|---|---|
| 4.1 | RL 串联：电流为什么慢半拍（相量三角形） | 263 |
| 4.2 | 滤波器与谐振：RC 低通、RC 高通（隔直）、RLC 串联谐振、LC 并联槽路 | 261、262、264、265 |
| 4.3 | 有源低通；两级 RC 的负载效应 → 加跟随器 | 266、267、268 |
| 4.4 | 交流功率：功率因数校正（新实验） | 270 |
| 4.5 | 半波整流 + 电容滤波（新实验，非正弦波的入口）；选学：拉普拉斯、二端口 | 271 |
| 理论 | `phasors`、`ac-analysis`、`frequency`；`ac-power`、`three-phase`、`coupled`（4.4）；`non-sinusoidal`、`s-domain`、`two-port`（4.5）。9 章要点和 126 道题都已按写作规范润色：要点改成一条一件事，题干拆成短句，去掉了泄露别的小题答案的选项和提示，旧记号 U 改成 V | |

### World 5 · 从元件到 ESP32 项目（P 3–6, 12 · M 7, 10–11）✅ 全部完成

全部改成卡片式；每个“想明白”卡片都配了图（二极管特性、引脚 = 3.3 V 串 25 Ω、上拉 / 下拉、钳位二极管、三极管和 MOSFET 的开关曲线、反电动势尖峰、稳压器压差、分压、LDR / NTC 曲线、PWM 平均值、I²C 上升沿、风扇支路）。每个实验都有测量题。

| 单元 | 内容 | 文件 |
|---|---|---|
| 5.1 | 二极管：电流的单行道（先插反一次） | 14 |
| 5.2 | 开发板与 GPIO；**新课** Blue Pill 引脚（FT 耐 5 V、PC13 只能 3 mA、ADC 引脚） | 107、280、**300**、281、282 |
| 5.3 | NPN 三极管开关 | 286 |
| 5.4 | MOSFET（直流开关 + IRF540N 对比 + 工作区对照表）、继电器与续流二极管、高边还是低边 | 287、288、297 |
| 5.5 | 供电：稳压器压差、电流预算 | 291、292 |
| 5.6 | 3.3 V 和 5 V：分压 / FT 引脚、开漏 + 上拉 | 289、290 |
| 5.7 | ADC 与传感器（108 里的 PWM 只是预告） | 108、283、284、285 |
| 5.8 | PWM：RC 当 DAC、电机调速、I²C 上拉 | 293、294、295 |
| 5.9 | 综合项目：温控风扇（引脚用阈值规则自动联动）；开放设计：天黑自动亮灯（只看表现判分） | 296、298 |
| 理论 | 非线性电阻电路（要点和题干已按写作规范润色） | `nonlinear` |

297 从 5.3 移到 5.4 末尾：它用到继电器和续流二极管（288 才教）。300 放在 281 前面：281 是第一个 Blue Pill 实验。

### 选学 / Electives

`matrix-form`（电路方程的矩阵形式）、`transmission-line`（均匀传输线）：不在主线里，练习页最下面。

## 6. 待办 / Backlog（World 2–5）

每个世界的做法和 World 1 一样：每个文件改成四张卡片，课程的每个搭建步骤加检查，挑战题加测量题，用 `npm run validate -- <文件> --readings` 核对读数。

**World 2**
- ~~2.1–2.6 全部改成卡片式~~（完成）。2.5 的顺序改成“问题 → 工具 → 解决”：203 → 106 → 225。
- 新实验 **施密特触发器**（`challenges/230-schmitt-trigger.json`）：已上线，放在 **3.2**（要用 3.1 教的信号发生器和示波器）。模拟器已修：op-amp 离开电源轨后线性解又落到同一侧（正反馈），就跳到另一侧电源轨；直流起点在线性状态时，再试两条电源轨，能自己保持住的就是真实的状态。`--readings` 和手算一致：V_TH ≈ 4.79 V，V_TL ≈ 4.07 V，输出高 7.5 V；小信号（0.25 V）时输出不翻转。
- `check.ts` 的“IN+ / IN− 接反”提示：已按目标电路判断——目标本来就把反馈接到 IN+（施密特触发器）时，提示改说“这里故意接成正反馈，接反就成了普通放大器，回差没了”；其他电路仍是“反馈必须接到 IN−”。
- `dependent-sources` 章的要点开头已经写了“受控源就是放大器”；题目文字按新规范润色。

**World 3**（已完成：104 拆成 104 + 250，3.1–3.7 改成卡片式并配图）
- 剩下的：理论章 `storage`、`first-order`、`second-order` 的题干和解答按新规范润色。
- 105 用到电容（3.3 才正式讲），卡片里只用一句大白话带过；相位差的大小怎么算留给第 4 世界。242 原来的“基波相位”题需要相量，已换成一道看现象的选择题。

**World 4** ✅
- ✅ 新实验 **功率因数校正**（270）：信号发生器 → 电流表 → R + L，按键并联 470 nF，10 Ω 取样电阻让 CH2 显示电流。3D 电流表在交流电路里自动切到 **AC RMS**（平均值不到有效值的 5 % 时）；「属性」里可以手动选 DC 平均值 / AC 有效值（真有效值）。卡片文字已按新屏幕改写（265、270、294）。
- ✅ 新实验 **半波整流 + 电容滤波**（271）：信号发生器 + 二极管 + 1 kΩ，按键接上 100 µF，示波器看平均值和纹波。二极管在这里第一次出现（一句“单向阀”）；5.1 不用再从零讲。
- ✅ 267、268 是 4.3 里前后两项。
- ✅ `s-domain` 的要点分成两组：A · 运算电路与部分分式、B · 网络函数与零极点（标题前缀 + 引言）。
- 待办（引擎 / 界面，不属于内容）：中文电路图里 op-amp 符号的小“▷”字形让卡片插图变宽、出现左右滑动，所以 266、268 的插图没有画 op-amp（268 用“复印 A 点电压”的受控源表示跟随器）；按键支路用新的 `S` 符号画；地图上没有实验的单元看不到（4.4、4.5 现在各有一个实验，问题暂时不出现）。

**World 5**（卡片、配图、测量题已完成；下面是还要引擎 / 界面做的事）
- ✅ 新课 **Blue Pill 引脚**（300）；✅ 287 只留直流开关、IRF540N 对比和工作区对照表，PWM 调速全部在 294（两个文件不再重复）。
- ✅ 综合项目 296 的“自动联动”：新的引脚模式 **阈值规则** `rule`（ADC 读数高于 / 低于阈值 → 输出高，带回差），在直流求解外面迭代到稳定；面包板上拖温度，风扇和灯自己开关。296 的目标、测试和卡片都改用它。
- ✅ **开放式设计题**：`options.grading: "behaviour"` 不比对连接和元件值，只跑 tests（测试点名的元件按类型在板上找）。第一题 **298 天黑自动亮灯**（5.9）：ESP32 阈值规则或一个 NPN 都能通过。
- 插图缺的符号：NPN、N 沟道 MOSFET、开发板引脚、稳压器、电机（现在用开关 `S`、“3.3 V 电池 + 25 Ω”、阻抗框、R + L 代替）；电路图里的结点名 / 元件名会被自动加下标（`PA0`、`GPIO2`、`BUS`、`SW1`），需要一个“原样显示”的写法；曲线图只有一个 y 轴、没有对数轴；面包板图没有二极管、开发板元件。
- 挑战的 `prereq` 只能写课程，不能写另一个实验（294 想写 287）。
- 逻辑引脚 `GPIO_FT1` 和 `U1.5V` 在同一结点时目标电路自检报错，300 只好写物理引脚 `PB6`。

**全局**
- 课程卡片的语言风格统一后，再按同一规范润色理论题的题干和解答。已完成：`nonlinear`、World 4 全部 9 章。剩下 World 1–3 的理论章（`basics`、`equivalence`、`methods`、`theorems`、`opamp`、`dependent-sources`、`storage`、`first-order`、`second-order`）；`theorems` 里第二次实验的电压还写成 `û`，按 NOTATION.md 应为 `v̂`。
- `docs/course-report.html` 是旧结构的快照，重构完成后用 `scripts/course-report.py` 重新生成。

## 7. 检查流程 / How every change is checked

```bash
npm run validate                                     # 全部题目：电路、测试、参考答案、测量题读数、答案泄露
npx tsx scripts/validate-challenges.ts <file> --readings   # 看某个文件每道测量题在参考答案上的读数
npm test                                             # 单元测试 + validate；课程地图测试保证每个文件只出现一次、先修课在前
npm run e2e                                          # 浏览器：路由、3D 工作台、无障碍、仪器课逐步走一遍
npm run check                                        # 和 CI 一样：tsc、lint、格式、测试、构建、体积
```
