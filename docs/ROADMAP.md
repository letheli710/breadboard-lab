# 课程扩展路线图 / Course roadmap

目标：覆盖大一、大二《电路分析》的核心内容（参照邱关源、罗先觉《电路》第 5 版的章节），分 4 期完成，外加一个**纯理论练习区**。所有新题都是中英双语，由 AI 出题，并由程序自动核对答案。

Goal: cover the core of a first/second-year circuit analysis course in four phases, plus a **theory practice area**. Every new item is bilingual (zh/en), written by AI, and machine-checked.

### 与教材的对照 / Coverage against the textbook (《电路》第 5 版)

| 章 | 内容 | 状态 |
|---|---|---|
| 1–2 | 电路模型和电路定律；电阻电路的等效变换 | ✔ `basics`、`equivalence` |
| 3 | 电阻电路的一般分析 | ✔ `methods`（支路/网孔/回路/结点法）；“电路的图”（树、连支、独立方程数）在 `matrix-form` |
| 4–5 | 电路定理；含有运算放大器的电阻电路 | ✔ `theorems`、`opamp` |
| 6–7 | 储能元件；一阶和二阶电路的时域分析 | ✔ `storage`、`first-order`、`second-order`；冲激响应与卷积积分放在 `s-domain` |
| 8–11 | 相量法；正弦稳态分析；耦合电感；频率响应 | ✔ `phasors`、`ac-analysis`、`ac-power`、`coupled`、`frequency` |
| 12 | 三相电路 | ✔ `three-phase` |
| 13 | 非正弦周期电流电路和信号的频谱 | ✔ `non-sinusoidal`（傅里叶级数与对称性、有效值/平均值、平均功率、谐波分析、谐波谐振与滤波、三相电路中的 3 次谐波）；信号频谱只到振幅频谱，没有傅里叶变换 |
| 14 | 线性动态电路的复频域分析（拉普拉斯变换） | ✔ `s-domain`（变换与性质、初值/终值定理、运算电路与附加电源（含耦合电感）、部分分式（单根、重根、共轭复根）、网络函数与零极点、极点与时域响应/频率响应、稳定性、冲激响应与阶跃响应、卷积积分；引擎 `src/core/analysis/sdomain.ts`：H(s)、极点零点、系数、响应象函数的留数，冲激与指数电源） |
| 15 | 电路方程的矩阵形式（关联矩阵、割集、状态方程） | ✔ `matrix-form`（电路的图、树与连支、割集；关联矩阵 A、基本回路矩阵 B_f、基本割集矩阵 Q_f 及其关系；标准支路与支路矩阵（含受控源、互感）；结点、回路、割集方程的矩阵形式；常态树与状态方程；引擎 `src/core/analysis/matrixform.ts`，有向图 `GraphFigure`，矩阵排版 `\mat{…}`）；列表法不单独出题 |
| 16 | 二端口网络 | ✔ `two-port` |
| 17 | 非线性电路 | ✔ `nonlinear`（非线性电阻电路：压控/流控、静态与动态电阻、串并联、曲线相交法、解析法、分段线性化与理想二极管、多个工作点与稳定性、小信号分析；引擎元件 `NR`）；**非线性动态电路（状态方程、相平面、自激振荡）未覆盖** |
| 18 | 均匀传输线 | ✔ `transmission-line`（分布参数电路、原参数与副参数、双曲函数形式的正弦稳态解、行波与反射系数、匹配、无损耗线的输入阻抗与开路/短路线、λ/4 与 λ/2 线、驻波、无畸变线、λ/4 变换器与单支节匹配、无损耗线的波过程（反射网格图）；引擎 `src/core/analysis/tline.ts`：二端口元件 `TL`（精确链参数模型，可与任何元件共存），量 `tl`）；有损耗线的暂态、电感/电容端接的波过程未覆盖 |

Not covered yet: ch. 17 beyond resistive circuits (nonlinear dynamic circuits); in ch. 18 transients on lossy lines and wave processes with L/C terminations. See the backlog below.

## 两种题目 / Two kinds of content

| | 面包板题 Breadboard (`challenges/*.json`, `breadboard-challenge/1`) | 理论题 Theory (`problems/<chapter>/*.json`, `circuit-problem/1`) |
|---|---|---|
| 学生做什么 | 在 3D 面包板上搭电路 | 看电路图，算数，填答案 |
| 引擎 | 面包板求解器：直流工作点 + 时域仿真（`src/core/solver.ts`、`src/core/transient.ts`；真实元件模型：电池内阻、LED Vf+12Ω、分段线性器件） | 理想电路分析引擎 `src/core/analysis`（DC / 暂态 / 正弦稳态，受控源、理想运放、耦合电感、理想变压器） |
| 自动核对 | 拓扑比对 + tests + 参考答案自检 | 每个数值答案都由引擎重算，和作者答案不一致就拒绝 |

## 四期 / Phases

| 期 | 章节 chapter id | 理论练习区 | 面包板 |
|---|---|---|---|
| 1 | `basics` 电路模型与基本定律（参考方向、功率、独立源、受控源、KCL/KVL）<br>`equivalence` 等效变换（串并联、Y–Δ、电源等效变换、输入电阻） | ✔ | KCL/KVL 实测（电流表）、分压分流、惠斯通电桥、稳压电源 CC 模式当电流源 |
| 2 | `methods` 支路电流法、网孔/回路电流法、结点电压法<br>`theorems` 叠加、替代、戴维宁/诺顿、最大功率传输、互易<br>`opamp` 含理想运放的电阻电路 | ✔ | 双电源叠加、测戴维宁等效（开路电压+短路电流）、电位器找最大功率、LM358 同相/反相放大 |
| 3 | `storage` 电容与电感<br>`first-order` 一阶电路（零输入/零状态/全响应、三要素法、阶跃响应）<br>`second-order` RLC 二阶电路（过阻尼/临界/欠阻尼） | ✔ | 信号发生器方波 + 示波器：RC 充放电、RL、RLC 振铃 |
| 4 | `phasors` 相量法<br>`ac-analysis` 阻抗导纳、正弦稳态分析<br>`ac-power` 有功/无功/视在/复功率、功率因数校正<br>`coupled` 互感、理想变压器<br>`frequency` 网络函数、串并联谐振、滤波器<br>`three-phase` 三相电路<br>`non-sinusoidal` 非正弦周期电路：谐波分析、有效值、平均功率<br>`s-domain` 复频域分析：拉普拉斯变换、运算电路、网络函数与零极点、冲激响应、卷积<br>`two-port` 二端口网络<br>`nonlinear` 非线性电阻电路：工作点、分段线性化、小信号分析<br>`transmission-line` 均匀传输线：副参数、反射与驻波、匹配、波过程 | ✔ | 信号发生器正弦 + 示波器：RC 低通/高通、相移、谐振 |

## 阶段 / Stages

- [x] **A. 基础设施**
  - [x] A1 理想电路分析引擎 `src/core/analysis`（MNA：R、C、L、V、I、四种受控源、理想运放、理想开关、耦合电感、理想变压器；直流、暂态、正弦稳态、非正弦周期稳态（逐次谐波叠加，`src/core/analysis/periodic.ts`）；非线性电阻 `NR`（多项式/分段线性/理想二极管特性，求出全部直流工作点与小信号响应，`src/core/analysis/nonlinear.ts`）；复频域分析（网络函数 H(s)、零极点、响应象函数的部分分式系数，冲激/指数电源，`src/core/analysis/sdomain.ts`）；均匀传输线 `TL`（二端口，正弦稳态精确链参数模型，无损耗线的波过程，`src/core/analysis/tline.ts`）；戴维宁、等效电阻、二端口参数等派生量）
  - [x] A2 电路图格式 + 渲染 `src/core/problem/geometry.ts`、`src/ui/ProblemSchematic.tsx`（从画图几何推出网表）
  - [x] A3 理论题格式解析与校验 `src/core/problem/parse.ts`，`npm run validate` 同时校验 `problems/`，「练习」模式界面，`docs/PROBLEM_FORMAT.md` 和出题提示词
- [x] **B. 理论题内容**：20 章共 291 题，全部由引擎核对答案 / 291 problems across 20 chapters, all engine-checked
- [x] **C. 面包板引擎扩展**：电流表、运放 LM358、电感、信号发生器、示波器、面包板电路的暂态/交流仿真
- [x] **D. 面包板题内容**：第 1–4 期共 31 个实验（201–208、221–228、241–247、261–268）
- [x] **E. 第 5 期：单片机外围电路**：平台（ESP32 / Blue Pill、器件、诊断、§14 格式）+ 18 个实验（280–297）/ Phase 5 platform + 18 MCU-peripheral experiments
- [x] **F. 测量题 / measurement questions**：实验分两步——电路正确，再读自己面包板上的仪表（期望值按学生自己的电路仿真，CHALLENGE_FORMAT §15）。已加到 12 个实验：201、202、203、206、222、223、241、244、261、264、291、295 / labs are two-stage — circuit right, then readings from the student's own board (expected values simulated on their circuit); 12 labs so far
  - 待办 / to do：其余实验（204、205、207、208、221、224–228、242、243、245–247、262、263、265–268、280–290、292–294、296、297）补测量题 / add questions to the remaining labs

## 约定 / Conventions

- 题目文件一律双语：基础语言写在顶层，另一种语言写在 `i18n`。
- 理论题的数值答案用 SI 基本单位（V、A、W、Ω、Hz、s；相位用度）。
- 任何题目合并前必须通过 `npm run validate` 和 `npm test`。

## C 阶段契约 / Stage C contract (breadboard instruments)

New `PartType`s (src/core/types.ts) and their physical pins:

| type | name | placement | pins | props |
|---|---|---|---|---|
| `inductor` | 电感 Inductor | two-point | `1`, `2` | `inductance` (H, default 10 mH); winding resistance 1 Ω in DC |
| `ammeter` | 电流表 Ammeter (multimeter in A mode, red/black leads) | two-point | `+` (red), `-` (black, COM) | — ; 0.1 Ω burden; reading = current flowing in at `+` |
| `opamp` | 运放 LM358 (dual, DIP-8, straddles the centre gap) | footprint, anchor = pin 1 in row e | `1` OUT A, `2` IN− A, `3` IN+ A, `4` V−/GND, `5` IN+ B, `6` IN− B, `7` OUT B, `8` V+ (pins 1–4 in row e, columns c..c+3; pins 8..5 in row f, columns c..c+3) | — ; model: open-loop gain 1e5, output clamped to [V− , V+ − 1.5 V], output resistance ~10 Ω, no input current |
| `function_gen` | 信号发生器 Function generator (red + / black COM leads) | two-point | `+`, `-` | `waveform: 'sine' | 'square' | 'triangle'`, `frequency` (Hz, default 1 kHz), `amplitude` (V peak, default 1), `offset` (V, default 0); 50 Ω output resistance |
| `scope_probe` | 示波器探头 Scope probe (tip + ground clip) | two-point | `tip`, `gnd` | `channel: 1 | 2` (auto: first probe CH1, second CH2) |

Simulation: when the board contains a `function_gen`, the board is also simulated in the time domain (`src/core/transient.ts`) until periodic steady state, and the scope shows each probe's `V(tip) − V(gnd)` over the last periods. Without a generator, everything works as before (DC). Circuit-level types: the same names are valid in challenge `components` (`opamp` as one component with logical pins `outA, inA-, inA+, v-, inB+, inB-, outB, v+` — aliases allowed per docs; `function_gen` matches any generator).

Challenge tests can measure with the scope: `"scope": [{ "pin": "C1.1", "ref": "V1.-", "measure": "vpp" | "vmax" | "vmin" | "vavg" | "vrms" | "freq" | "phase", "vs"?: "<pin>", "min", "max" }]` and `"set"` may change a generator's `frequency` / `amplitude` / `waveform`. Ammeter readings: `"currents": [{ "el": "AM1"?..., }]` — exact shape defined in docs/CHALLENGE_FORMAT.md by the implementer.

## 第 5 期契约 / Phase 5 contract (MCU peripheral circuits)

Phase 5 teaches the **electrical side** of microcontroller projects (no firmware: every GPIO has a
*mode* set in the inspector or by a challenge `set`). All models live in `src/core/mcu.ts`
(board tables + pin model) and `src/core/devices.ts` (device constants); they are compiled by
`src/core/solver.ts` (DC) and `src/core/transient.ts` (time domain).

### Dev boards (footprint parts, anchor = first leg of the upper row)

| type | board | footprint | logic | regulator | GPIO model |
|---|---|---|---|---|---|
| `esp32_devkit` | ESP32-DevKitC, 38 pins (2 × 19), antenna left, micro-USB right | upper header J2 (`GND, GPIO23, GPIO22, GPIO1/TX, GPIO3/RX, GPIO21, GND, GPIO19, GPIO18, GPIO5, GPIO17, GPIO16, GPIO4, GPIO0, GPIO2, GPIO15, GPIO8/SD1, GPIO7/SD0, GPIO6/CLK`) in row **b**, columns c..c+18; lower header J1 (`3V3, EN, GPIO36/VP, GPIO39/VN, GPIO34, GPIO35, GPIO32, GPIO33, GPIO25, GPIO26, GPIO27, GPIO14, GPIO12, GND, GPIO13, GPIO9/SD2, GPIO10/SD3, GPIO11/CMD, 5V`) in row **i**. Rows are 0.9" apart (like the narrow DevKitC/NodeMCU-32S clones) so each pin keeps one free hole (rows a and j). | 3.3 V, VIL ≤ 0.825 V, VIH ≥ 2.475 V | AMS1117-3.3: dropout 1.1 V, limit 1 A; chip load ≈ 50 mA; USB 5 V through a Schottky (≈ 0.3 V), USB budget 500 mA | output 25 Ω to 3V3/GND; recommended ≤ 20 mA, abs max 40 mA; pulls 45 kΩ (not on 34–39); 34–39 input only; ADC1 = GPIO32–39 (ADC2 pins flagged: unusable with Wi-Fi); GPIO6–11 = flash (do not use) |
| `stm32_bluepill` | STM32F103C8T6 "Blue Pill", 40 pins (2 × 20), micro-USB left | upper row (`GND, GND, 3V3, NRST, PB11, PB10, PB1, PB0, PA7, PA6, PA5, PA4, PA3, PA2, PA1, PA0, PC15, PC14, PC13, VBAT`) in row **c**; lower row (`PB12, PB13, PB14, PB15, PA8, PA9, PA10, PA11, PA12, PA15, PB3, PB4, PB5, PB6, PB7, PB8, PB9, 5V, GND, 3V3`) in row **g** (0.6" apart, like a wide DIP) | 3.3 V, VIL ≤ 1.16 V, VIH ≥ 2.15 V | 3.3 V LDO: dropout 0.25 V, limit 300 mA; chip load ≈ 20 mA; USB 5 V through a Schottky | output 40 Ω; recommended ≤ 20 mA (PC13–15: 3 mA), abs max 25 mA; pulls 40 kΩ; **5 V-tolerant (FT)**: PA8–PA15, PB2–PB4, PB6–PB15; not FT: PA0–PA7, PB0, PB1, PB5, PC13–15; ADC: PA0–PA7, PB0, PB1; PWM (timer channels): PA0–3, PA6–11, PB0, PB1, PB6–9; onboard LED on PC13 (to 3V3 through 510 Ω, lit when PC13 is low) |

Logical terminals = physical pin names (`GPIO23`, `PA0`, `3V3`, `5V`, `GND`, `EN`/`NRST`, `VBAT`).
Duplicate legs (`GND_2`, `3V3_2`, …) are joined on the PCB (`internal`).

Props: `usb: boolean` (virtual USB cable, default **true**) and
`pins: { [pin]: PinConfig }` with `PinConfig = { mode, duty?, frequency?, openDrain? }`, modes
`out_high | out_low | input | input_pullup | input_pulldown | pwm | adc`; `duty` in % (0–100,
default 50), `frequency` in Hz (default 1 kHz). Unlisted pins are `input`.

Pin model (per GPIO): output = conductance 1/R_out to the board's 3V3 node (high) or GND (low);
PWM = the same switch toggling in the time domain (DC solver: its average, d·3V3 behind R_out);
input = high impedance + optional internal pull (to 3V3 / GND); ESD clamp diodes pin→3V3 (not on
FT pins) and GND→pin, so a pin driven above 3V3 back-powers the rail. The chip runs when
3V3 ≥ brown-out (2.5 V ESP32 / 2.0 V STM32) and EN/NRST is high; otherwise every pin is high-Z.
Readout per pin: voltage, current out of the pin, logic (`high | low | undefined | floating`,
floating = DC impedance to anything > 50 MΩ), ADC (V and 12-bit raw over 0–3.3 V), damage.

### Devices

| type | part | placement / pins | props | model |
|---|---|---|---|---|
| `npn` | NPN transistor 2N2222A / S8050 (TO-92, flat face to you: **E B C** left→right) | footprint, 3 adjacent columns: `e`, `b`, `c` | `beta` (default 150) | BE: 0.65 V + 20 Ω; active Ic = β·Ib; saturation Vce = 0.15 V + 1 Ω·Ic; Vceo breakdown 40 V; Ic max 600 mA, 625 mW |
| `nmos` | N-MOSFET (TO-220, **G D S**) | footprint, 3 columns: `g`, `d`, `s` | `model: 'IRLZ44N'` (logic level: Vth 1.5 V, Rds(on) 22 mΩ @ 5 V) or `'IRF540N'` (standard: Vth 3.0 V, 44 mΩ @ 10 V) | Id = min(Vds·K·Vov, K·Vov²/2); gate draws no current; body diode S→D; avalanche 55 V / 100 V |
| `relay` | 5 V relay SRD-05VDC (coil 70 Ω, 150 mH; contact COM–NO / COM–NC) | footprint straddling the gap: row e `coil1` (c), `coil2` (c+3); row f `com` (c), `nc` (c+2), `no` (c+3) | — | coil = R + L; pulls in at 53 mA (3.75 V), drops out below 7 mA (hysteresis); contacts 0.05 Ω |
| `motor` | small DC motor (130 size) | two-point `+`, `-` | — | 8 Ω + 2 mH (no back-EMF); runs above 0.1 A |
| `buzzer` | active buzzer 5 V | two-point `+`, `-` | — | polarised: 1.0 V + 140 Ω (≈ 28 mA at 5 V); sounds above 2.5 V |
| `ldo` | LDO LM1117-3.3 (TO-220, **GND OUT IN**) | footprint, 3 columns: `gnd`, `out`, `in` | `voltage` 3.3 (or 5) | regulate / dropout (1.1 V) / current limit (800 mA) / off; Iq 5 mA |
| `ldr` | photoresistor GL5528 | two-point `1`, `2` | `lux` (default 100) | R = 15 kΩ·(lux/10)^−0.7, 100 Ω … 1 MΩ (dark) |
| `ntc` | NTC thermistor 10 kΩ B3950 | two-point `1`, `2` | `temperature` °C (default 25) | R = 10 kΩ·exp(3950·(1/T − 1/298.15)) |

SimResult additions: `mcus`, `bjts`, `mosfets`, `regs`, `relays`, `motors`, `buzzers` (see
`src/core/solver.ts`). Diagnostics (bilingual): pin over-current (warning > recommended, error
> abs max → pin damaged), over-voltage on a non-FT pin / negative voltage (clamp current), ADC
pin above 3.3 V, floating digital input / MOSFET gate / BJT base, output pin on a supply net,
two outputs fighting, flash / input-only / ADC2 misuse, regulator over-current and dropout, USB
over-current, coil without flyback diode (DC) and inductive kick (time domain), transistor over-current.

### Challenge format additions (docs/CHALLENGE_FORMAT.md §8)

- `components` may use `esp32_devkit`, `stm32_bluepill` or the generic `mcu` (matches either
  board), plus every device above. Board pins in a target are **power pins** (`3V3`, `5V`,
  `GND`, `EN`) or **logical roles** `GPIO_OUT<n>`, `GPIO_IN<n>`, `ADC<n>`, `PWM<n>`, `GPIO_FT<n>`,
  `IO<n>` (or exact physical pins). Each role matches any distinct physical GPIO with that
  capability (OUT/PWM: output-capable; IN/IO: any GPIO; ADC: ADC1 / ADC pins; FT: 5 V-tolerant)
  — the one the student actually wired.
- target `pins` modes are part of the answer; tests `set` may change `pins`, `usb`, `lux`,
  `temperature`, `beta`, `model`.
- new test checks: `gpio: [{ pin, read?: 'high'|'low'|'floating', measure?: 'voltage'|'current'|'adc'|'adc_v', min?, max? }]`,
  `regions: { Q1: 'saturation' }`, `expect` also for `relay` / `motor` / `buzzer` (`on`/`off`), `currents` for the new devices.

## 性能 / Performance

- 内置理论题运行时只解析、不重算（`parseProblem(..., { verify: false })`）；答案核对在 `npm run validate` / `npm test`。导入的文件完整核对。
- 题目索引在构建时生成（`scripts/problem-index-plugin.ts`），完整题目按章节分块按需加载；Practice / Import / Guide 懒加载；three / r3f / drei 单独一个 chunk。
- 切换语言不再重新挂载整个应用（3D 场景、相机保持不变）：语言是 store 里的响应式值（`useLang()`），诊断 / 检查结果 / 题目文本在新语言下重新生成。
- 3D 低画质模式（`src/three/quality.ts`）：弱设备（≤ 4 核 / ≤ 4 GB）或前几帧太慢时自动启用，工具栏可手动切换。
- 首次加载体积 / first-load size（某页面静态 import 闭包内 dist 文件的实际字节数；前 = 4bde60b，后 = 44d93c8 / real bytes of the static-import closure of dist files, before → after）：

  | 页面 page | 前 before | 后 after | 备注 notes |
  |---|---|---|---|
  | 入口 entry (`index.html`) | 2,068,199 B | 325,031 B | |
  | 课程 Learn | 2,068,199 B（gzip ≈ 636 kB） | 1,514,007 B（gzip ≈ 460 kB） | 仍需要 three.js / three.js still needed |
  | 练习 Practice（页面 + 解析器 + `basics` 一章） | 2,182,672 B | 537,354 B | 不加载 three.js / no three.js |
  | 知识 Guide | 2,088,452 B | 345,284 B | |
  | 导入 Import | 2,264,361 B | 736,258 B | 不加载 three.js / no three.js |
  | 字体文件 font files | 30 个 | 10 个 | 只引入 latin 子集 / latin subsets only |

- 做法 / how：React / zustand 单独一个 `react` chunk；Workbench / SidePanel / Carousel 懒加载；面包板题用构建时索引 `virtual:challenge-index`（`scripts/challenge-index-plugin.ts`），完整题目按组（课程、入门、第 1–5 期）各一个 chunk、打开该组的题时才加载；题目解析器动态 import。/ React + zustand in their own chunk; Workbench, SidePanel and Carousel lazy; challenges behind a build-time index with one chunk per group (lessons, intro, phase 1–5) loaded on open; parsers dynamically imported.
- 第 3 轮 / round 3：Vite 8（Rolldown，`manualChunks` → `codeSplitting.groups`）、Vitest 5；导入页不再加载面包板侧栏（`Md` 移到 `src/ui/Md.tsx`），只内嵌它展示的四份文档。按页面实际下载的 JS（Playwright，`vite preview`）/ JS actually fetched per route: `#/import` 875,349 → 574,741 B；`#/practice/basics` 589,523 → 584,500 B；`#/guide` 356,022 → 355,653 B；`#/learn/…` 1,570,000 → 1,554,224 B。CI 检查入口体积预算（`npm run size`：入口 ≤ 225 kB，入口 + 预加载块 ≤ 375 kB；入口里的题目 / 实验索引每条约 265–275 B，随内容增长）/ CI enforces an entry-size budget.
- 第 4 轮 / round 4：理论题索引和实验索引各自成为懒加载 chunk（`contentIndexPlugin` 的 `lazyIndex`，`src/state/indexLoader.ts`），与当前页面需要的 chunk 并行请求：练习页要题目索引，课程 / 挑战页要实验索引，导入页两个都要，知识页都不要（页头进度卡在空闲时取课程索引，之前显示 “–/–”）。索引到达前路由处于等待状态：URL、`bb.route`、保存的当前题都不改，标题只显示页面名，之后才打开链接指向的题（不会闪过第 1 题），未知 id 也在那时才提示并回退；`scripts/e2e-routes.cjs` 用延迟 1.5–6 s 的索引请求检查这些。/ The problem and challenge indexes are lazy chunks of their own, fetched in parallel with what the route needs; a route waits for its index without touching the URL, `bb.route` or the saved problem (checked by the e2e script with the index held back).
  - 入口 / entry 199.6 → 111.0 kB；入口 + 预加载 / entry + preloads 348.0 → 259.4 kB；预算 / budgets（`npm run size`）≤ 128 kB / ≤ 300 kB（约 15 % 余量，入口不再随题目数增长 / ≈ 15 % headroom; the entry no longer grows with the content）。
  - 按页面实际下载的 JS（Playwright，`vite preview`）/ JS fetched per route：`#/learn/<id>` 1,569,255 → 1,504,203 B；`#/practice/<id>` 644,262 → 638,716 B；`#/guide` 370,118 → 302,397 B（其中 20.8 kB 的课程索引在空闲时才取 / incl. the 20.8 kB lesson index fetched at idle）；`#/import` 632,340 → 640,748 B（两个索引都要，索引以 `JSON.parse('…')` 字符串输出，解析更快，原始字节多约 9 kB、gzip 后几乎不变 / both indexes; emitted as `JSON.parse` strings for faster parsing, ≈ 9 kB more raw, ≈ same gzipped）。

- 第 4 轮依赖升级 / round 4 dependency upgrades: zustand 4 → 5（无需改代码：所有 selector 都返回原始值或稳定引用 / no code change, every selector returns a primitive or a stable reference）；three r169 → r182（`<Canvas shadows="percentage">`：r182 起 PCFSoftShadowMap 被替换为 PCF 并每帧警告；r183+ 弃用 `THREE.Clock`，r3f 8 和 9.8 都还在 new 它，所以停在 r182 / r183+ deprecates `THREE.Clock`, which r3f 8 and 9.8 still construct）。React 19 + fiber 9 + drei 10 做完并验证（commit 7a10883：类型改 `React.JSX` / `ThreeElements`，Board / Parts 在 canvas 事件连上后的下一个任务里才挂载，否则 drei `<Html>` 在 react-dom 提交中途卸载自己的 root，报 "removeChild … not a child"），但 react chunk 145.8 → 222.8 kB（gzip 47.0 → 68.8 kB），首屏 335 kB > 300 kB 预算，已回退；决定放宽预算后 `git revert` 回退提交即可 / done and verified but reverted for the entry budget; re-apply by reverting the revert.

## 待办 / Backlog (engine gaps reported by problem authors)

- 单刀双掷开关（SPDT `SW` 三端）/ an SPDT switch element (currently two `SW` acting at t = 0)
- 开关在 t ≠ 0 时再次动作（两次换路问题）/ switching events at times other than 0 (classic "switch again at t = t1" problems)
- 正弦源用 `omega` 指定角频率 / `sin.omega` so authors don't write f = 15.9155 Hz for ω = 100 rad/s
- 暂态中的稳态振幅 / steady-state amplitude of a sinusoidal transient response as a checkable quantity
- `twoport` 支持 `exclude`（图中画了负载时仍能求参数）/ `exclude` on `twoport` so parameters can be asked with a load drawn
- 导纳量 `{ kind: 'yeq', port }` / an admittance quantity
- [x] ~~打包体积约 2.7 MB（题库全部内嵌）：可以按章节懒加载~~ — 已完成：题目按章节分块，侧栏用构建时索引 / done: problems are chunked per chapter behind a build-time index (see Performance)
- 图上参考标记名的翻译（中文 u、英文 v）/ translatable mark names (zh "u", en "v") — today English text reuses the drawn u/U

### 未覆盖的教材内容 / Textbook topics not covered yet

每一项都需要先扩展理论题引擎 `src/core/analysis`（或新的量 kind），再按 `docs/SYLLABUS.md` 的格式写大纲和题目。
Each needs engine work in `src/core/analysis` (or new quantity kinds) before a syllabus chapter and problems.

- [x] ~~电路方程的矩阵形式：图、树、割集、关联矩阵；状态方程（第 15 章，以及第 3 章“电路的图”）~~ — 已完成：`matrix-form` 章 / done: the `matrix-form` chapter
- 非线性动态电路：含非线性电感/电容的状态方程、相平面、自激振荡（第 17 章后半；非线性电阻电路已有 `nonlinear` 章）/ nonlinear dynamic circuits: state equations with nonlinear L/C, phase plane, self-oscillation (nonlinear resistive circuits are covered by `nonlinear`)
- [x] ~~均匀传输线：分布参数、行波、正弦稳态（第 18 章）~~ — 已完成：`transmission-line` 章 / done: the `transmission-line` chapter。剩余 / remaining：有损耗线的暂态（需要拉普拉斯反变换或数值方法）、电感/电容端接的波过程 / transients on lossy lines, wave processes with L/C terminations

### 面包板仿真待办 / Breadboard simulation backlog

- 自适应步长（或在步长不足时自动提高每周期步数）以替代 4096 步上限 + 警告 / adaptive time step instead of the 4096-steps-per-period cap + warning
- 运放压摆率 / 增益带宽积；电解电容极性；万用表 / 示波器输入阻抗；电机反电动势 / op-amp slew rate and GBW, electrolytic polarity, meter/scope input impedance, motor back-EMF
