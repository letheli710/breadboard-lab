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

- [ ] **A. 基础设施**
  - [ ] A1 理想电路分析引擎 `src/core/analysis`（MNA：R、C、L、V、I、四种受控源、理想运放、理想开关、耦合电感、理想变压器；直流、暂态、正弦稳态；戴维宁、等效电阻、二端口参数等派生量）
  - [ ] A2 电路图格式 + 渲染 `src/core/problem/geometry.ts`、`src/ui/ProblemSchematic.tsx`（从画图几何推出网表）
  - [ ] A3 理论题格式解析与校验 `src/core/problem/parse.ts`，`npm run validate` 同时校验 `problems/`，「练习」模式界面，`docs/PROBLEM_FORMAT.md` 和出题提示词
- [ ] **B. 理论题内容**（按章节并行出题，每章约 12–20 题，覆盖该章所有知识点，难度 1–5）
- [ ] **C. 面包板引擎扩展**：电流表、运放 LM358、电感、信号发生器、示波器、面包板电路的暂态/交流仿真
- [ ] **D. 面包板题内容**（每期 4–8 题）

## 约定 / Conventions

- 题目文件一律双语：基础语言写在顶层，另一种语言写在 `i18n`。
- 理论题的数值答案用 SI 基本单位（V、A、W、Ω、Hz、s；相位用度）。
- 任何题目合并前必须通过 `npm run validate` 和 `npm test`。
