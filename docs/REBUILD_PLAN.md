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
| 7 | 模拟 IC 进阶：非理想运放、波特图、有源滤波、555 与功放 | ET-220 | — |
| 8 | 数字逻辑、MCU 与传感器实战 | ET-540 · 硬件项目 | — |
| UB | UB 衔接 / 选修理论区（不计入主线进度） | 回 UB 后的 EE 课程 | Sadiku 后半本 |

每个 World 包含哪些课程、实验、单元和理论章节，以 `course/worlds.json` 为准；`npm run validate` 保证每个课程 / 实验 / 章节 / 单元恰好出现在一个 World 里。

World 5 的说明：Part B 前半（相量、阻抗、RC 频率响应）是 World 7 波特图与滤波的前置。

## 2. 待建单元 / Units to build

下面每个 id 都登记在 `course/worlds.json` 的 `pending` 里。传送门可以指向它们（显示为“即将上线”）；建好一个同 id 的单元或实验后，传送门自动接通，再把它从 `pending` 删掉即可（`npm run validate` 会提醒）。
Every id below is in the `pending` list of `course/worlds.json`. Portals may point at them (shown as "coming soon"); once a unit or lab with the same id exists they connect by themselves.

### World 5
- `w5-ac-power-pfc` 交流功率与功率因数校正（面包板）/ AC power and power-factor correction (lab)

### World 6 · 半导体器件 / Semiconductor devices
- `w6-half-wave-rectifier` 半波整流与电容滤波
- `w6-zener-regulator` 齐纳稳压
- `w6-clipper-clamper` 二极管削波与钳位（ET-140 Lab #5）
- `w6-bridge-rectifier` 全波桥式整流与直流电源链
- `w6-bjt-bias` BJT 特性曲线、分压式偏置与直流负载线
- `w6-diff-pair` 差分对（与 World 3 运放内部互链）
- `w6-ce-amp` BJT 小信号 r_e 模型、共射放大器与射极跟随器
- `w6-jfet-cs` JFET 共源放大

### World 7 · 模拟 IC / Analog ICs
- `w7-lm358-inside` 拆开 LM358 内部三级的定量分析
- `w7-gbw` 非理想运放：增益带宽积 GBW（ET-220 Lab 9–10）
- `w7-slew-offset` 压摆率与失调（ET-220 Lab 9–10）
- `w7-r2r-dac` R-2R DAC
- `w7-bode` 分贝与波特图
- `w7-active-hp-notch` 二阶有源高通与陷波器（Lab 11–12）
- `w7-ce-freq-response` 共射放大器频率响应（ET-220 Week 11）
- `w7-555` 555 定时器与压控振荡器 VCO
- `w7-push-pull` Class A / B / AB 推挽功放与运放输出扩流（Lab 13）
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
