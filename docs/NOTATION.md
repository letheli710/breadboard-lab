# 符号与用语约定 / Notation and wording conventions

本文件规定题目（`problems/`）、面包板课程与挑战（`challenges/`）和界面说明文字里的符号与用语。约定以 邱关源《电路》为准。写新内容（包括让 AI 写）时请遵守；`AI_PROMPT.md`、`AI_PROMPT_PROBLEMS.md` 里已经包含了简短版本。

This file fixes the symbols and wording used in theory problems (`problems/`), breadboard lessons and challenges (`challenges/`) and the in-app help text. The reference is the textbook 邱关源《电路》. Follow it for new content (including AI-written content); `AI_PROMPT.md` and `AI_PROMPT_PROBLEMS.md` contain a short version.

---

## 1. 两种文字渲染器 / Two text renderers

| 内容 Content | 渲染器 Renderer | 支持 Supports |
|---|---|---|
| 理论题的 title、statement、questions、hints、solution | `src/ui/Practice.tsx`（`PrMd` + `richRuns`，与电路图同一套规则 / same rules as the drawing） | `**粗体**`、`` `代码` ``、`- ` / `1. ` 列表、`#` 小标题，以及**下标**：`X_abc`、`X_{...}` |
| 课程与挑战的 description、hints、steps | `src/ui/Panel.tsx`（`Md`） | `**粗体**`、`` `代码` ``、`- ` 列表、空行分段。**没有下标** / no subscripts |

- 理论题里的下标规则：一个字母（拉丁或希腊）后面紧跟 `_`，再跟一串字母数字（`R_1`、`U_s1`、`u_ab`、`z_11`）或花括号里的任意文字（`u_{+}`、`R_{左}`、`U̇_{线圈}`）。下标只到第一个非字母数字字符为止。
  In problem text a letter followed by `_` and a run of letters/digits, or by `{…}`, becomes a subscript. The run ends at the first character that is not a letter or digit.
- 挑战（面包板）里元件名和电流写成普通文字：`R1`、`I1`、`AM2`，和面包板上元件的名字一致。
  In challenges write part names and currents as plain text (`R1`, `I1`, `AM2`), exactly as the parts are named on the board.

## 2. 变量名与下标 / Variable names and subscripts（理论题 problems）

- 正文里的变量名一律用下标标记，和图上画出来的一致：`R_1`、`U_s`、`U_s2`、`I_s`、`i_1`、`u_2`、`u_ab`、`u_oc`、`R_eq`、`z_11`、`y_21`、`k_1`。不要写成 `R1`、`Us`、`i1`。
  Write every variable name in prose with the subscript markup so it matches the drawing (`R_1`, `U_s`, `i_1`, `u_ab`, `z_11`), never `R1`, `Us`, `i1`.
- 图上的元件名由程序自动加下标（`R1` → R₁，`Us` → U_s，`RL` → R_L），`schematic` 里的 `ref`、`marks` 的 `name` 照常写 `R1`、`i1`，**不用改**。
  Element refs and mark names inside `schematic` stay `R1`, `i1`: the drawing subscripts them automatically.
- 两个带下标的量**直接相乘**（中间没有 `·`、空格或括号）时必须用花括号，否则下标会把后面的字母吞掉：`R_{1}R_{4}`、`L_{1}L_{2}`、`ωR_{2}C_{2}`。也可以写 `R_1·R_4`。
  Juxtaposed products need braces (`R_{1}R_{4}`) or a `·` between factors; otherwise the first subscript swallows the next letter.
- 系数加符号可以直接写：`2i_1`、`j4İ_1`、`0.5u_1`。
- 下标是中文或 `+`、`−` 时用花括号：`u_{+}`、`u_{−}`、`R_{左}`。
- `frequency` 章里出现的 Unicode 下标数字（`R₁`、`ω₀`、`f₀`）也能正常显示，可以保留；新内容优先用 `_` 标记。
- 不要把专有名词或运算当成变量加下标：`Re`、`Im`（实部、虚部）、`RC`、`LC`（乘积或电路名）、`KCL`、`dB`、`Hz`。

## 3. 电压用 u / U / Voltage is u / U

- 中英文一律用 **u、U** 表示电压（教材用法），**不用 v、V**；电流用 i、I。这与电路图一致：`marks` 的名字、自动标注都画成 u。英文里写 `u_C`、`U_s`、`u_ab`，不写 `v_C`、`V_s`。`V` 只作单位“伏特”。
  Use **u / U for voltage in both languages** (as in the textbook and as the drawings show it); the English text never switches to v / V. `V` is only the unit volt. Mark names drawn on diagrams cannot be translated yet, so the English text has to use the same letters as the drawing.
- 小写 u、i：随时间变化的瞬时值、一般的电压电流变量（`u_C(t)`、`i_L(0₊)`）。大写 U、I：直流量、有效值（`U_s = 12 V`、`I = 5 A`）。
  Lower case u, i: instantaneous values and general variables. Upper case U, I: DC quantities and rms values.
- 结点电压写 `u_a`（直流、暂态）或 `U̇_a`（相量）、`U_a`（有效值）。
- 功率：P（有功）、Q（无功）、S（视在）、复功率 `S̄`（S + U+0304 组合横线）。

## 4. 相量 / Phasors

- 相量上面加点：**U̇**（字母 U 后接组合字符 U+0307）、**İ**（U+0130）。带下标时写 `U̇_s`、`İ_1`、`U̇_ab`、`U̇_{线圈}`，不写 `U̇s`、`İ1`。
  Phasors carry a dot: **U̇** (U followed by combining U+0307) and **İ** (U+0130), with the subscript markup: `U̇_s`, `İ_1`, `U̇_ab`.
- 其他字母的点用组合字符 U+0307（如电动势 `Ė_3` 写成 E + U+0307），不要用预组合的 `Ė`（U+0116）——它后面的 `_` 不会变成下标。
  Dot other letters with combining U+0307 (`Ė_3` = E + U+0307), not the precomposed Ė (U+0116), whose `_` would not become a subscript.
- **只有相量加点**。下面这些不加点：有效值或模（`U_s = 100 V`、`I_1 = 0.25 A`、`|U̇_a| = 10 V`）、极坐标形式中 ∠ 前面的模（`U̇_2 = U_2∠0°`）、平方（`I²R`、`I_2²(6 + j2)`）、阻抗 Z、导纳 Y。
  Only phasors are dotted. Magnitudes and rms values (`U_s = 100 V`, `|U̇_a|`), the magnitude in front of ∠ (`U̇_2 = U_2∠0°`), squares (`I²R`) and impedances/admittances Z, Y are not.
- 共轭写 `İ*`；复功率 `S̄ = U̇·İ*`。振幅相量写 `U̇_m`、`İ_m`。默认相量是**有效值相量**（`analysis.phasor` 默认 `"rms"`），题干里写“（有效值）/ (rms)”。
- 渲染：`richRuns`（`src/ui/ProblemSchematic.tsx`）把“带点字母 + `_` 下标”画成带点的斜体字母加下标（`U̇_s`、`İ_1`、`U̇_{AB}`）。挑战文字（`Md`）没有下标，写 `U̇L`、`İC` 这样的普通文字即可。
  Rendering: `richRuns` subscripts a dotted letter (`U̇_s`, `İ_1`); challenge text (`Md`) has no subscripts, so write plain `U̇L`, `İC` there.
- **第二组量的“^”**：特勒根定理、互易定理里另一次实验的量写成带帽的字母加下标：`û_1`、`î_2`、`î_k`（预组合 û U+00FB、î U+00EE、Û、Î，或字母后接组合字符 U+0302）。复功率的横线 `S̄`（U+0304）后面同样可以带下标：`S̄_Us`。不要写成 `û1`、`î2`。
  **Hats for the second set of quantities** (Tellegen, reciprocity): `û_1`, `î_2`, `î_k` (precomposed û U+00FB, î U+00EE, Û, Î, or a letter followed by combining U+0302); the complex-power bar also takes a subscript, `S̄_Us`. Never `û1`, `î2`. `richRuns` keeps the dot (U+0307), hat (U+0302) or bar (U+0304) on the italic base letter.
- 只有上面这些带符号的字母（U+0307/U+0302/U+0304 组合字符，以及预组合的 İ、û、î、Û、Î）能带下标；其他带变音符号的字母后面的 `_` 会原样显示。
  Only these marked letters take subscripts; after any other accented letter the `_` is shown literally.

## 5. 正弦量的参考函数 / Sinusoid reference

- 以 **cos** 为参考：u(t) = √2·U·cos(ωt + ψ) ↔ U̇ = U∠ψ（有效值相量）；u(t) = U_m·cos(ωt + ψ) ↔ U̇_m = U_m∠ψ。
  The reference function is **cosine**: u(t) = √2·U·cos(ωt + ψ) ↔ U̇ = U∠ψ.
- 题目给出 sin 形式时，提示和解答先换成 cos：sin x = cos(x − 90°)，−sin x = cos(x + 90°)。不要反过来把 cos 改写成 sin。
  If a source is given as a sine, hints and solutions convert it to cosine first (sin x = cos(x − 90°)), never the other way round.
- 例外：题目本身明确要求按 sin 形式讨论（例如 `first-order/17` 的合闸相位选择题 `u_s = 20 sin(100t + ψ)`）时，保留题目原来的写法。

### 5.1 复频域 / s-domain

- 象函数用大写字母加 (s)：`U_C(s)`、`I_L(s)`、`U_s(s)`、`F(s)`；时域用小写 `u_C(t)`、`i_L(t)`。变换写 `ℒ[f(t)]`、`ℒ⁻¹[F(s)]`。
  Transforms are capital letters with (s): `U_C(s)`, `I_L(s)`; time functions stay lower case. Write `ℒ[f(t)]`, `ℒ⁻¹[F(s)]`.
- 单位阶跃 `ε(t)`、单位冲激 `δ(t)`（教材用法，不写 u(t)，以免与电压混淆）。初始值一律取 `0₋`：`u_C(0₋)`、`i_L(0₋)`。
  Unit step `ε(t)` and unit impulse `δ(t)` (as in the textbook; never u(t), which would clash with voltage). Initial values are taken at 0−.
- 用语：运算电路 / s-domain circuit，运算阻抗 / s-domain impedance，附加电源 / initial-condition source，网络函数 `H(s)` / network function，极点、零点 / poles, zeros，部分分式 / partial fractions，冲激响应 `h(t)` / impulse response，卷积 / convolution。
- 题干里写清附加电源的方向（例如“电感 = sL 串电压源 L·i_L(0₋)，沿 i_L 方向推动电流”），并在图上画出 u_C、i_L 的参考方向（`marks`），必要时用 `notes` 标出 `u_C(0₋) = 2 V`。
  State the direction of every initial-condition source in the text and draw the references of u_C, i_L with `marks` (and the initial value with a `notes` label when it is given).

### 5.2 矩阵形式 / Matrix form（`matrix-form` 章）

- 矩阵、向量用大写正体字母加下标：关联矩阵 `A`，基本回路矩阵 `B_f`，基本割集矩阵 `Q_f`，支路导纳/阻抗矩阵 `Y`、`Z`，结点导纳矩阵 `Y_n`，结点电压向量 `U_n`，回路电流 `I_l`，树支电压 `U_t`，电源向量 `U_s`、`I_s`；元素用小写 `a_jk`、`b_jk`、`q_jk`，或 `Y_11`、`Z_l13`。转置写 `ᵀ`（U+1D40）：`Aᵀ`、`B_fᵀ`。乘号用 `·`：`A·Y·Aᵀ·U_n`。
  Matrices and vectors are capital letters with subscripts (A, B_f, Q_f, Y, Z, Y_n, U_n, I_l, U_t, U_s, I_s); entries a_jk, b_jk, q_jk or Y_11; transpose ᵀ (U+1D40); products with ·.
- 矩阵用 `\\mat{1 & 0 ; 0 & 1}` 排版（SUMMARY_FORMAT §6），列向量写 `(3, 0, 1.5)ᵀ`。
- 用语：图 / graph，有向图 / directed graph，树、树支、连支 / tree, tree branch, link，割集、基本割集 / cut-set, fundamental cut-set，基本回路 / fundamental loop，标准支路（复合支路）/ standard (composite) branch，常态树 / proper tree，状态变量、状态方程 / state variables, state equations。
- 题干必须写明：支路编号与方向（有向图）、参考结点、所选的树、A 的行序（结点顺序），以及标准支路中电源的符号约定。

### 5.3 均匀传输线 / Transmission lines（`transmission-line` 章）

- 坐标：x 从始端量起，x′ = l − x 从终端量起，题干必须写明；u 是两导线间的电压，i 沿 +x 方向（终端电流 İ_2 流进负载）。始端量带下标 1（U̇_1、İ_1），终端量带下标 2（U̇_2、İ_2、Z_2）。
  x is measured from the start and x′ = l − x from the end (say which in the text); u is the voltage between the conductors and i flows in +x (İ_2 flows into the load). Start quantities carry the subscript 1, end quantities 2.
- 原参数 R_0、L_0、G_0、C_0；Z_0 = R_0 + jωL_0、Y_0 = G_0 + jωC_0；副参数 Z_c（特性阻抗）、γ = α + jβ（传播常数）。入射波、反射波写 U̇⁺、U̇⁻（上标 ⁺ ⁻ 用 Unicode 字符），反射系数 Γ（终端 Γ_2，始端 Γ_1），驻波比写 VSWR。双曲函数写 ch、sh、th（教材用法），波长 λ，相速 v。
  Primary parameters R_0, L_0, G_0, C_0; secondary Z_c and γ = α + jβ. Incident and reflected waves U̇⁺, U̇⁻ (Unicode superscripts), reflection coefficient Γ (Γ_2 at the end, Γ_1 at the start), VSWR. Hyperbolic functions ch, sh, th as in the textbook.
- 用语：均匀传输线 / uniform transmission line，分布参数电路 / distributed-parameter circuit，无损耗线 / lossless line，无畸变线 / distortionless line，行波 / travelling wave，驻波 / standing wave，波腹、波节 / voltage maximum, minimum，匹配 / matched，短截线 / stub，反射网格图 / bounce (lattice) diagram。

## 6. 用语 / Wording

| 中文 | English | 说明 |
|---|---|---|
| **结点** | node | 教材用语。电路理论里的“结点”一律写“结点”，不写“节点”（包括面包板课程、Guide） |
| 网孔 / 回路 | mesh / loop | |
| 参考方向、关联参考方向 | reference direction, passive sign convention | |
| 0₊、0₋ | 0+, 0− | 换路时刻；JSON 的 `t` 字段仍写 `"0+"` / `"0-"` |
| 有效值 | rms value | |

界面文字（按钮“结点着色”、“结点表”、诊断信息）也统一用“结点”。

## 7. 提示（hints）/ Hints

提示由浅入深，学生点一次看一条：

1. **方向**：用什么定律或方法，先看哪里；
2. **方法**：怎样列方程或怎样检查，要用到哪些量；
3. **接近答案**：关键的中间结果或一个化简后的方程。

不要在前面的提示里直接写出全部方程、最终数值，或者（找错题里）逐条点名错误所在。最后一条可以接近答案，但留给学生最后一步。

Hints go from direction (which law/method, where to look) to method (how to set up the equations or the check) to near-answer (one key intermediate result). Earlier hints must not write out all the equations, the final numbers, or — in fault-finding tasks — name the faults one by one.

## 8. 实验说明的结构 / Lab description layout

第 2–4 期的实验（`challenges/2xx-…`）的 `description` 用短段落，每段以粗体标签开头：

| 中文 | English | 内容 |
|---|---|---|
| **目标** | **Goal** | 一两句：要验证什么 |
| **电路** | **Circuit** | 搭什么、面包板上已经有什么，可以用列表 |
| （可选）**怎么接…** | **How to …** | 仪表接法等操作说明 |
| **先预测** | **Predict first** | 动手前要先算出哪些量、用什么方法——**不写结果** |
| **测量** | **Measure** | 读哪些表、示波器看什么 |
| **对比** | **Compare** | 计算过程与预期读数；读数不符时先检查什么 |
| （可选）**想一想** | **Think about it** | 延伸问题 |
| （可选）**真实电路里** | **In a real circuit** | 仿真模型与真实器件的差别：仪表负担电阻、电感绕线电阻、电解电容极性、LM358 的共模输入范围和压摆率等 |

预期读数只放在“对比”里，放在“先预测”之后。每段尽量不超过三四行。

Expected readings go only in **Compare**, after **Predict first**. Keep each paragraph to a few lines.
