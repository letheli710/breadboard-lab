# 课程扩展路线图 / Course roadmap

目标：覆盖大一、大二《电路分析》的全部内容（参照邱关源《电路》的章节），分 4 期完成，外加一个**纯理论练习区**。所有新题都是中英双语，由 AI 出题，并由程序自动核对答案。

Goal: cover a full first/second-year circuit analysis course in four phases, plus a **theory practice area**. Every new item is bilingual (zh/en), written by AI, and machine-checked.

## 两种题目 / Two kinds of content

| | 面包板题 Breadboard (`challenges/*.json`, `breadboard-challenge/1`) | 理论题 Theory (`problems/<chapter>/*.json`, `circuit-problem/1`) |
|---|---|---|
| 学生做什么 | 在 3D 面包板上搭电路 | 看电路图，算数，填答案 |
| 引擎 | 面包板 DC 求解器（真实元件模型：电池内阻、LED Vf+12Ω） | 理想电路分析引擎 `src/core/analysis`（DC / 暂态 / 正弦稳态，受控源、理想运放、耦合电感、理想变压器） |
| 自动核对 | 拓扑比对 + tests + 参考答案自检 | 每个数值答案都由引擎重算，和作者答案不一致就拒绝 |

## 四期 / Phases

| 期 | 章节 chapter id | 理论练习区 | 面包板 |
|---|---|---|---|
| 1 | `basics` 电路模型与基本定律（参考方向、功率、独立源、受控源、KCL/KVL）<br>`equivalence` 等效变换（串并联、Y–Δ、电源等效变换、输入电阻） | ✔ | KCL/KVL 实测（电流表）、分压分流、惠斯通电桥、稳压电源 CC 模式当电流源 |
| 2 | `methods` 支路电流法、网孔/回路电流法、结点电压法<br>`theorems` 叠加、替代、戴维宁/诺顿、最大功率传输、互易<br>`opamp` 含理想运放的电阻电路 | ✔ | 双电源叠加、测戴维宁等效（开路电压+短路电流）、电位器找最大功率、LM358 同相/反相放大 |
| 3 | `storage` 电容与电感<br>`first-order` 一阶电路（零输入/零状态/全响应、三要素法、阶跃响应）<br>`second-order` RLC 二阶电路（过阻尼/临界/欠阻尼） | ✔ | 信号发生器方波 + 示波器：RC 充放电、RL、RLC 振铃 |
| 4 | `phasors` 相量法<br>`ac-analysis` 阻抗导纳、正弦稳态分析<br>`ac-power` 有功/无功/视在/复功率、功率因数校正<br>`coupled` 互感、理想变压器<br>`frequency` 网络函数、串并联谐振、滤波器<br>`three-phase` 三相电路<br>`two-port` 二端口网络 | ✔ | 信号发生器正弦 + 示波器：RC 低通/高通、相移、谐振 |

## 阶段 / Stages

- [x] **A. 基础设施**
  - [x] A1 理想电路分析引擎 `src/core/analysis`（MNA：R、C、L、V、I、四种受控源、理想运放、理想开关、耦合电感、理想变压器；直流、暂态、正弦稳态；戴维宁、等效电阻、二端口参数等派生量）
  - [x] A2 电路图格式 + 渲染 `src/core/problem/geometry.ts`、`src/ui/ProblemSchematic.tsx`（从画图几何推出网表）
  - [x] A3 理论题格式解析与校验 `src/core/problem/parse.ts`，`npm run validate` 同时校验 `problems/`，「练习」模式界面，`docs/PROBLEM_FORMAT.md` 和出题提示词
- [x] **B. 理论题内容**：15 章共 216 题，全部由引擎核对答案 / 216 problems across 15 chapters, all engine-checked
- [x] **C. 面包板引擎扩展**：电流表、运放 LM358、电感、信号发生器、示波器、面包板电路的暂态/交流仿真
- [x] **D. 面包板题内容**：第 1–4 期共 31 个实验（201–208、221–228、241–247、261–268）

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
`pins: { [pin]: PinConfig }` with `PinConfig = { mode, duty?, frequency? }`, modes
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

## 待办 / Backlog (engine gaps reported by problem authors)

- 单刀双掷开关（SPDT `SW` 三端）/ an SPDT switch element (currently two `SW` acting at t = 0)
- 开关在 t ≠ 0 时再次动作（两次换路问题）/ switching events at times other than 0 (classic "switch again at t = t1" problems)
- 正弦源用 `omega` 指定角频率 / `sin.omega` so authors don't write f = 15.9155 Hz for ω = 100 rad/s
- 暂态中的稳态振幅 / steady-state amplitude of a sinusoidal transient response as a checkable quantity
- `twoport` 支持 `exclude`（图中画了负载时仍能求参数）/ `exclude` on `twoport` so parameters can be asked with a load drawn
- 导纳量 `{ kind: 'yeq', port }` / an admittance quantity
- 打包体积约 2.7 MB（题库全部内嵌）：可以按章节懒加载 / bundle is ~2.7 MB because every problem is bundled; lazy-load per chapter
- 图上参考标记名的翻译（中文 u、英文 v）/ translatable mark names (zh "u", en "v") — today English text reuses the drawn u/U
