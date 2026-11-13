# 理论题文件格式 `circuit-problem/1` / Theory problem format

「练习 Practice」模式里的每一道理论题（看电路图、算数、填答案）都是一个 **JSON 文件**，放在 `problems/<chapter>/` 文件夹里。
题目通常由 AI 来写（提示词见 [`AI_PROMPT_PROBLEMS.md`](./AI_PROMPT_PROBLEMS.md)），程序负责把关：

- **电路由画图决定**：元件和导线画在整数网格上，网表（谁和谁相连）从几何关系自动推出。学生看到的图和引擎计算的电路永远一致。
- **答案由引擎核对**：每个数值答案都会被理想电路分析引擎重新计算；和作者写的 `answer` 相差超过 0.5% 就拒绝这个文件，并报出两个数。

Every theory problem is one JSON file in `problems/<chapter>/`. The circuit is defined by its **drawing** (elements and wires on an integer grid; the netlist is derived from the geometry), and **every numeric answer is recomputed** by the ideal analysis engine — a file whose `answer` is more than 0.5 % off is rejected.

标准 / Source of truth: `src/core/problem/types.ts`（契约 contract）、`src/core/problem/parse.ts`（解析与校验 parser）、`src/core/problem/geometry.ts`（画图 → 网表）。编辑器用的 JSON Schema：[`schema/problem.schema.json`](../schema/problem.schema.json)。

---

## 0. 加载与校验 / Loading and validating

| 方式 Way | 说明 |
|---|---|
| `problems/<chapter>/*.json` | 启动时自动加载，开发模式下热更新。文件夹名就是章节 id（见 §2）。 |
| 导入 Import 页面 | 拖入文件夹或 `.json` 文件。面包板题和理论题可以混放，程序按 `"format"` 自动分类。 |

- 以 `_` 开头的文件和 `*.schema.json` 会被跳过（可以放草稿）。
- 同一章节内按 `level`、再按文件名排序，建议文件名用两位数字前缀：`01-…json`。
- `id` 必须全局唯一。

```bash
npm run validate                    # 校验 challenges/ 和 problems/（按 format 分别处理）
npm run validate problems/basics    # 只校验一个文件夹（递归）或一个文件
npm run validate -- --lang en       # 英文报错信息
```

在文件开头写 `"$schema": "../../schema/problem.schema.json"` 可以在 VS Code 里获得补全和检查（程序会忽略这个字段）。

---

## 1. 顶层字段 / Top-level fields

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `format` | string | ✔ | 必须是 `"circuit-problem/1"` |
| `id` | string | ✔ | 字母、数字、`-`、`_`，例如 `"theorems-thevenin-03"` |
| `chapter` | string | ✔ | 章节 id，见 §2 |
| `title` | string | ✔ | 标题 |
| `level` | 1–5 | ✔ | 难度（整数）。1 = 直接套公式，3 = 典型课后题，5 = 综合/考研难度 |
| `tags` | string[] | | 知识点标签，例如 `["KVL", "受控源 CCVS"]` |
| `statement` | string 或 string[] | ✔ | 题干。数组会用换行拼接。支持 `**粗体**`、`` `代码` ``、`- ` 列表、`#` 小标题 |
| `schematic` | object | ✔ | 电路图（§3） |
| `analysis` | object | ✔ | 分析类型（§5） |
| `questions` | array | ✔ | 小题（§6） |
| `hints` | string[] | 建议 | 提示，由浅入深，学生点一次显示一条 |
| `solution` | string 或 string[] | 建议 | 完整的解题过程（Markdown 子集，同 statement） |
| `lang` | `"zh"` \| `"en"` | | 顶层文字用的语言，默认 `"zh"` |
| `i18n` | object | 建议 | 另一种语言的翻译（§8） |
| `$schema` | string | | 只给编辑器用 |

缺少 `hints`、`solution`、翻译，或计算题缺少 `unit` 时，校验器给出**警告**（不算错误，但内置题目要求零警告）。

---

## 2. 章节 / Chapters

| 期 phase | `chapter` | 内容 |
|---|---|---|
| 1 | `basics` | 电路模型与基本定律：参考方向、功率、独立源、受控源、KCL/KVL |
| 1 | `equivalence` | 电阻电路的等效变换：串并联、Y–Δ、电源等效变换、输入电阻 |
| 2 | `methods` | 支路电流法、网孔/回路电流法、结点电压法 |
| 2 | `theorems` | 叠加、替代、戴维宁/诺顿、最大功率传输、互易 |
| 2 | `opamp` | 含理想运放的电阻电路 |
| 3 | `storage` | 电容与电感 |
| 3 | `first-order` | 一阶电路：零输入/零状态/全响应、三要素法、阶跃响应 |
| 3 | `second-order` | 二阶 RLC 电路：过阻尼/临界/欠阻尼 |
| 4 | `phasors` | 相量法 |
| 4 | `ac-analysis` | 阻抗导纳、正弦稳态分析 |
| 4 | `ac-power` | 有功/无功/视在/复功率、功率因数校正 |
| 4 | `coupled` | 互感、理想变压器 |
| 4 | `frequency` | 网络函数、串并联谐振、滤波器 |
| 4 | `three-phase` | 三相电路 |
| 4 | `two-port` | 二端口网络 |

章节列表定义在 `src/core/problem/chapters.ts`。

---

## 3. 电路图 / The schematic

```json
"schematic": {
  "elements": [ ... ],
  "wires":    [ [[0,0],[2,0]], [[6,0],[8,0],[8,2]] ],
  "labels":   [ { "at": [8,0], "name": "a" } ],
  "grounds":  [ [0,4] ],
  "terminals":[ { "at": [12,0], "name": "a" }, { "at": [12,4], "name": "b" } ],
  "marks":    [ { "kind": "i", "el": "R1", "name": "i1" }, { "kind": "v", "el": "C", "name": "u_C" } ],
  "loops":    [ { "at": [4,2], "name": "i_m1" }, { "at": [10,2], "name": "i_m2", "dir": "ccw" } ],
  "notes":    [ { "at": [3,-1], "text": "t = 0", "i18n": { "en": "t = 0" } } ]
}
```

### 3.1 网格 / Grid

- 坐标是**整数** `[x, y]`：x 向右，**y 向下**（和 SVG 一样）。所以“上面”是 y 更小。
- 二端元件从 `from`（端子 **p**）画到 `to`（端子 **n**），必须**水平或竖直**，长度至少 2；建议 3–4，给符号和标签留出空间。元件符号画在线段中间。
- 典型布局：电源竖放在左边 `x = 0`（`from: [0,0]` 在上、`to: [0,4]` 在下），顶边一条导线，元件往右排，底边一条导线回到电源，地放在左下角。元件之间留 2 格间距。

### 3.2 连接规则 / Connectivity

1. 导线 `wires` 是折线：`[[x1,y1],[x2,y2],...]`，相邻两点必须水平或竖直对齐。
2. **端点或折点落在另一条导线上就相连**（包括落在导线中间——T 形接点）。程序会在 ≥3 条连接的地方画实心圆点。
3. 两条导线只是**交叉**（没有共同的点）**不相连**。
4. 元件端子坐标相同就相连；元件的端子落在导线上也相连。
5. 元件**本体**（两端之间的线段）不和任何东西相连；导线压在元件上会产生警告。
6. `grounds` 里的每个点都是地，结点名 `"0"`。至少要有一个地。
7. `labels`、`terminals` 必须放在导线或元件端子上，用来给结点**命名**；题目里引用结点都用这些名字。没有名字的结点自动叫 `_1`、`_2`……（不要在题目里引用它们）。
8. 名字 `"0"` / `"gnd"` 保留给地。一个端子（例如戴维宁题的 `b`）如果放在地上，它就是 `"0"` 的别名，可以在 `port` 里直接写 `"b"`。
9. **地结点可以有多个名字**：例如二端口题把 `1'` 和 `2'` 两个端子都画在底部的接地导线上，它们都是 `"0"` 的别名，`"ports": [["1","1'"],["2","2'"]]` 可以直接用。**其他**结点只能有一个名字（同一结点两个不同名字是错误）。名字可以带撇号，如 `1'`、`a'`。 / The ground node may carry several names (e.g. two-port terminals `1'` and `2'` both on the bottom ground wire) — all are aliases of `"0"`. Any other node may have only one name. Primed names such as `1'` work everywhere.

### 3.3 元件 / Elements

所有元件都有唯一的 `ref`（例如 `"R1"`、`"Us"`、`"Is"`、`"G1"`）。数值可以写数字或带 SI 前缀的字符串：`2`、`"4.7k"`、`"50u"`、`"8m"`、`"1M"`（`m` = 毫，`M` = 兆）。

| `type` | 元件 | `value` | 其他字段 |
|---|---|---|---|
| `R` | 电阻 | Ω | |
| `C` | 电容 | F | `ic`：t = 0− 时的电压（一般不用，初值由 t<0 稳态决定；写了就以 `ic` 为准） |
| `L` | 电感 | H | `ic`：t = 0− 时的电流（写了就以 `ic` 为准） |
| `V` | 独立电压源 | 见 §4 | p 端是 **“+”** |
| `I` | 独立电流源 | 见 §4 | 箭头从 p 指向 n |
| `VCVS` | 电压控制电压源 | 增益 (V/V) | `ctrl: {"v": "R1"}` 或 `{"vnodes": ["a","b"]}` |
| `VCCS` | 电压控制电流源 | 跨导 (S) | `ctrl: {"v": ...}` 或 `{"vnodes": ...}` |
| `CCVS` | 电流控制电压源 | 转移电阻 (Ω) | `ctrl: {"i": "R1"}` |
| `CCCS` | 电流控制电流源 | 电流增益 (A/A) | `ctrl: {"i": "R1"}` |
| `SW` | 理想开关 | — | `state: {"before": "closed", "after": "open"}`（默认 before 断开、after 闭合） |
| `Z` | 一般阻抗（交流题） | `{"re": 3, "im": 4}` Ω | 只在给定频率下有效 |
| `ammeter` | 理想电流表（0 Ω） | — | 读数 = 从 p 流到 n 的电流 |
| `voltmeter` | 理想电压表（开路） | — | 读数 = V(p) − V(n) |
| `OPAMP` | 理想运放 | — | `at`, `orient`, `flip`（见下） |
| `XFMR` | 理想变压器 n:1 | — | `at`, `n` |
| `K` | 耦合电感 | — | `l1`, `l2`, `k` 或 `M` |

二端元件的可选字段：`label`（图上显示的文字，代替自动的 “R1 = 2 Ω”，例如 `"3i"`、`"jωL"`、`"R"`）、`hideValue: true`（题目要求解这个值时隐藏数值）。

**受控源的控制量**：`{"v": "R1"}` = R1 两端电压（R1 的 p 减 n）；`{"i": "R1"}` = 流过 R1 的电流（R1 的关联参考方向，从 p 到 n）；`{"vnodes": ["a","b"]}` = V(a) − V(b)。把控制量画进图里：给控制元件加一个 `marks` 并在题干里写清楚。

**理想运放 `OPAMP`**（V+ = V−，输入电流为零）：端子相对 `at`：反相输入 (−) 在 (−2, −1)，同相输入 (+) 在 (−2, +1)，输出在 (+2, 0)（`orient: "right"`，默认）。`flip: true` 上下交换两个输入；`orient: "left"` 左右镜像。输出对地。网表引脚名：`minus`、`plus`、`out`。`{"kind": "i", "el": "A"}` 是**从运放输出端流出**（流进输出结点）的电流；负值表示电流流入输出端（运放在“吸收”电流）。 / `{"kind":"i","el":<op-amp>}` is the current flowing **out of the output terminal** into the output node.

**理想变压器 `XFMR`**（n:1，u1 = n·u2，i1 = −i2/n，电流以流入同名端为正）：端子相对 `at`：p1 (−2, −1)、n1 (−2, +1)、p2 (+2, −1)、n2 (+2, +1)；同名端（黑点）在 p1 和 p2。

**耦合电感 `K`**：`{"ref": "K1", "type": "K", "l1": "L1", "l2": "L2", "k": 0.5}` 或 `"M": "2m"`。同名端在两个电感各自的 **p 端**——所以要靠 `from`/`to` 的方向来摆同名端。

### 3.4 参考方向与符号约定 / Sign conventions

- **关联参考方向（passive sign convention）**：每个二端元件 u = V(p) − V(n)，i 从 p 经元件流向 n，**吸收**功率 P = u·i。负值表示实际发出功率。
- **电压源**：p 端为 “+”。它的电流 i 也按关联方向（从 + 端流进去）——正常供电的电源，i 是负的，吸收功率也是负的。
- **电流源**：箭头从 p 指向 n，源内部从 p 推 `value` 安培到 n（电流从 n 端流出）。它的关联电流就是 +value。想让电流源向结点 a 注入电流，就让 `to`（n）接 a。
- 想让学生用某个方向，就**画出来**：`marks` 里的 `{"kind": "i", "el": "R1", "name": "i1"}` 在 R1 上画一个从 p 指向 n 的电流箭头，标 `i1`；`{"kind": "v", "el": "C", "name": "u_C"}` 在 p 端标 “+”、n 端标 “−”。所以**元件的 from/to 方向就是参考方向**——先想好方向再画。
- **运放的输出电流**：`{"kind": "i", "el": "A", "name": "i_o"}` 在运放的输出引线上画一个**背离运放**（指向输出结点）的箭头，和引擎的 `{"kind": "i", "el": "A"}`（从输出端流出的电流）同号。运放不能加 `"v"` 标记（它没有“元件电压”，用结点标签）；变压器 `XFMR`、耦合 `K` 不能加任何标记（给与绕组串联的元件加）。 / On an op-amp, `{"kind":"i","el":"A","name":"i_o"}` draws an arrow on the output lead pointing **away from the op-amp**, matching the engine's sign (current out of the output terminal). `"v"` marks on op-amps and any mark on `XFMR` / `K` are errors.
- 题目问到某个元件的电流（`kind: "i"`）或电压（`kind: "v"` + `el`）而图里还没有对应的标记时，程序**自动加一个**，名字是 `i_R1`、`u_R1`（中英文界面都用 u）；问运放的输出电流时自动加 `i_A`。题干里如果用了自己的符号（如 i₁、i_o），请自己写 `marks` 并用同一个名字。 / Asked element currents/voltages (and op-amp output currents) get a mark automatically unless one is listed; write your own to use the symbol from the text.

### 3.5 标签、端子、注释 / labels, terminals, notes

- `labels: [{ "at": [x,y], "name": "a", "hidden": false }]`：结点名，画在该点旁边；`hidden: true` 只命名不显示。
- `terminals: [{ "at": [x,y], "name": "a" }]`：开路端子（小圆圈），用于戴维宁/二端口题，同时也是结点名。
- `notes: [{ "at": [x,y], "text": "t = 0", "i18n": { "en": "..." } }]`：图上的自由文字（例如开关旁边的 “t = 0”）。

### 3.6 网孔 / 回路电流 / Mesh and loop currents: `loops`

网孔电流法、回路电流法的题目，把题干里定义的网孔电流画出来：

```json
"loops": [
  { "at": [4, 3], "name": "i_m1" },
  { "at": [12, 3], "name": "i_m2", "dir": "ccw" }
]
```

- 在 `at` 处画一个直径约 1.4 格的圆弧箭头（开口约 60°），`name` 写在圆心（`i_m1` → i 带下标 m1，规则同 `marks`）。颜色比电路浅一些。
- `dir`：`"cw"` 顺时针（**默认**）或 `"ccw"` 逆时针——指**屏幕上看到的**方向。
- `at` 一般取网孔的中心，可以是半格（如 `[3.5, 2]`）；不能压在导线或元件上（校验器报错）。
- **只是标注**：不影响网表和任何计算。网孔电流本身不能用 `find` 求；要问它的值，就问与它相等的支路电流（例如只属于这个网孔的电阻的电流），题干里说明。
- 题干里写的名字和方向要与 `loops` 一致；回路电流法中跨过多个网孔的回路，箭头放在只有它经过的那部分。

`loops` draws a circular arrow (≈ 1.4 grid units across, clockwise by default as seen on screen, `"dir": "ccw"` for counter-clockwise) centred at `at` with `name` in the middle. Put it in the empty middle of the mesh (half units allowed; it must not sit on a wire or element). It is a pure annotation: it does not change the netlist and cannot be asked with `find` — ask for a branch current that equals the mesh current instead, and use the same names and directions in the text.

---

## 4. 独立源的取值 / Source values

| 写法 | 含义 |
|---|---|
| `12` 或 `"12"` | 直流 12 V（或 12 A） |
| `{ "dc": 5 }` | 同上 |
| `{ "ac": { "mag": 100, "phase": 30 } }` | 正弦稳态相量 100∠30°；`mag` 按 `analysis.phasor` 的约定（默认**有效值 rms**），`phase` 单位是度 |
| `{ "dc": 2, "ac": { "mag": 1 } }` | 直流 + 交流（正弦稳态分析只用 ac 部分，直流分析只用 dc 部分） |
| `{ "step": { "before": 0, "after": 10 } }` | 阶跃：t < 0 为 0，t ≥ 0 为 10（暂态分析） |
| `{ "sin": { "amp": 10, "freq": 50, "phase": 0, "offset": 0 } }` | 时域正弦 offset + amp·sin(2πft + phase°)（暂态分析） |

---

## 5. 分析类型 / `analysis`

| 写法 | 含义 |
|---|---|
| `{ "type": "dc" }` | 直流电阻电路（电容开路、电感短路） |
| `{ "type": "ac", "freq": 50 }` 或 `{ "type": "ac", "omega": 1000 }` | 正弦稳态，单一频率。只写 `freq`（Hz）或 `omega`（rad/s）中的一个 |
| `{ "type": "ac", "omega": 1000, "phasor": "peak" }` | 相量取**幅值**（默认 `"rms"` 有效值，与大多数教材一致） |
| `{ "type": "tran" }` | 暂态：开关、阶跃源在 **t = 0** 动作 |

**相量约定（phasor）**：`"rms"`（默认）时 |U| 是有效值，P = Re(U·I*)；`"peak"` 时 |U| 是幅值，P = ½·Re(U·I*)。题干要写明“有效值”还是“幅值”。

**暂态语义（tran）**：
- t < 0：电路处于**直流稳态**，开关取 `state.before`，阶跃源取 `before`。电容电压、电感电流的初值由此决定。
- t = 0：开关切到 `state.after`，阶跃源变为 `after`。
- 问题用 `find.t` 指定时刻：`"0-"`（换路前）、`"0+"`（换路后瞬间：电容电压、电感电流连续，其他量可以跳变）、一个秒数（如 `0.4`）、`"inf"`（t → ∞ 的新稳态）。暂态题里除 `tau` 外每个问题都**必须**写 `t`。
- `tau`：t > 0 一阶电路的时间常数（RC 或 L/R，从储能元件看进去的等效电阻）。并联电容、串联电感等可以合并成一个储能元件的电路也算一阶。不是一阶时引擎报错。
- `find.t` 写 `0` 等同于 `"0+"`；负的秒数表示 t < 0 时的值。
- **默认“初始不带电”**：t < 0 时，如果某些结点只通过电容（以及断开的开关）和电路其余部分相连——例如被断开的开关隔开的电容——引擎认为这部分**不带电荷**（电容初始电压按电荷为零算出，常见的就是 0）。同理，只由电感（和短路线）构成的回路按**零磁链**处理（并联电感的电流按 1/L 分配）。题目里电容原来带电，就写 `ic`。
- t < 0 时如果接着 `sin` 源，初值取 t < 0 的正弦稳态在 t = 0 的值。
- `"inf"`：t → ∞ 的直流稳态。有 `sin` 源、电路不稳定或无损振荡（纯 LC）时没有终值，引擎报错。
- 电感、电容的初值在任何时刻都由电路算出；换路瞬间电容被并联到不同电压上（电荷重新分配）也能正确处理。

**Semantics (English summary).** DC analysis uses each switch's `after` state and each step's `after` value (unless `t` is `"0-"` or negative). AC analysis uses `after` too. In AC a bare number source is a 0° phasor and `{ "dc": … }` alone contributes nothing; `step` / `sin` sources are rejected in AC (write `{ "ac": { "mag", "phase" } }`), and `ac` phasor sources are rejected in transient analysis (write `{ "sin": … }`). Nodes that reach the rest of the circuit only through capacitors are taken as **uncharged** (zero net charge) and loops of inductors as carrying zero flux, unless `ic` says otherwise. Transient values are exact (matrix exponential), not time-stepped.

---

## 6. 小题 / `questions`

每道题至少一个小题。两种小题：

**计算题**（引擎核对）：

```json
{ "id": "i1", "ask": "求 i1。", "find": { "kind": "i", "el": "R1" }, "answer": 0.25, "unit": "mA", "tol": 0.02, "explain": "……" }
```

**选择题**（概念题）：

```json
{ "id": "why", "ask": "受控源在这里是……", "choices": ["吸收功率", "发出功率"], "correct": 1, "explain": "……" }
```

| 字段 | 说明 |
|---|---|
| `id` | 小题 id，题内唯一（如 `"a"`、`"i1"`、`"P"`） |
| `ask` | 问题文字（string 或 string[]） |
| `find` | 要计算的量（见下表），可加 `part`、`t` |
| `answer` | 作者算出的答案，**SI 基本单位**：V、A、W、var、VA、Ω、S、Hz、s、F、H；相位用**度** |
| `unit` | 输入框旁边显示给学生的单位。可以带前缀，例如 `"mA"`：学生只输入数字时按 mA 理解（`answer` 仍然写安培）。无量纲写 `""` |
| `tol` | 学生答案的相对误差，默认 `0.02`（2%）。接近 0 的答案绝对误差 1e-9。相位（`part: "phase"` 或单位 `°`）不用 `tol`：固定 ±1°，按 360° 取模比较 |
| `choices` / `correct` | 选择题的选项和正确选项下标（从 0 开始） |
| `choiceExplain` | 选择题可选：每个选项为什么对/错，和 `choices` 一样长（没有解释的写 `""`）。学生选了这个选项就显示。建议给每个错误选项写一句 |
| `explain` | 答对或点“看答案”后显示的解释 |

**学生可以输入的答案 / Accepted answer syntax**

- 数字：`2.5`、`-3`、`.5`、`1.2e-3`、`1.2×10^-3`、`1.2×10⁻³`、全角 `－3`、`1，5`（小数逗号）、`1,234`（千位分隔）。
- 算式（不用 eval，自带的小解析器）：`+ - × * · / ÷ ^`（或 `**`）、括号、`√2` / `sqrt(2)`、`π` / `pi`、`e`、`exp()`、`ln()`、`log()`（以 10 为底）、百分号 `60%`（= 0.6）、省略乘号 `2√2`、`2π`、`3(1+2)`。例如 `12/6`、`2/3`、`10/√2`、`2(1-e^-1)`。
- 单位和前缀写在最后：`2.5k`、`2.5 kΩ`、`-3mA`、`12/6 mA`、`4.7µF`；数字后面也可以直接带前缀：`1k+500`。什么都不写时按输入框旁的 `unit` 理解（`unit` 是 `"mA"` 时 `2` 就是 2 mA）。`1/s` 的题可以写 `-2 1/s` 或 `3 s⁻¹`。
- 相位默认是**度**：`30`、`-53.13°`、`30deg`；弧度要写 `rad`：`π/6 rad`、`0.5236rad`。
- 极坐标 `4∠30`（也可 `4/_30`）：相位题取角度，`re` / `im` 题取 4·cos30° / 4·sin30°，其他取模 4。
- 看不懂的输入会给出原因和例子；单位和 `unit` 不一致（例如要 A 却写 V）提示“单位不对”。

**判错时的提示 / Feedback on wrong answers**：误差在 5% 以内（相位 5° 以内）提示“很接近，检查四舍五入”；还能识别符号相反、差 10³ / 10⁶ / 10⁹ 倍（前缀）、差 √2（峰值/有效值）、差 √3（线/相）、差 2π（ω/f）、倒数（R/G、T/f）、把弧度当成度、相位差 180°。答题框下方显示这道题的允许误差。

### 6.1 可计算的量 / Quantities (`find.kind`)

| `kind` | 写法 | 含义 | 单位 |
|---|---|---|---|
| `v` | `{"kind":"v","nodes":["a"]}` / `{"kind":"v","nodes":["a","b"]}` | 结点电压 V(a)（对地）或 V(a) − V(b) | V |
| `v` | `{"kind":"v","el":"R2"}` | 元件电压 V(p) − V(n) | V |
| `i` | `{"kind":"i","el":"R1"}` | 元件电流（关联方向 p → n）；运放：从输出端**流出**的电流 | A |
| `p` | `{"kind":"p","el":"Us"}` | 元件**吸收**的功率（直流 u·i；交流为平均功率 P） | W |
| `q` | `{"kind":"q","el":"L1"}` | 交流：元件吸收的无功功率 | var |
| `s` | `{"kind":"s","el":"Us"}` | 交流：视在功率 \|S\| | VA |
| `pf` | `{"kind":"pf","el":"Us"}` | 功率因数 \|P\|/\|S\|，总是 ≥ 0（对电源：它所带负载的功率因数）。**不带超前/滞后符号**——问“超前还是滞后”请用选择题 | — |
| `req` | `{"kind":"req","port":["a","b"]}` | 端口等效电阻（交流为 \|Z\|），独立源置零、受控源保留。可加 `exclude`（§6.1.1） | Ω |
| `vth` | `{"kind":"vth","port":["a","b"]}` | 开路电压 V(a) − V(b)（戴维宁电压）。可加 `exclude` | V |
| `isc` | `{"kind":"isc","port":["a","b"]}` | 短路电流：用导线短接 a、b，从 a 经短路线流到 b 的电流（诺顿电流）。可加 `exclude` | A |
| `pmax` | `{"kind":"pmax","port":["a","b"],"exclude":["RL"]}` | 端口能输出给负载的最大功率（直流 Uoc²/(4R₀)，交流 \|Uoc\|²/(4·Re Z₀)）。负载画在图上时用 `exclude` 去掉它 | W |
| `tau` | `{"kind":"tau"}` | 一阶电路 t > 0 的时间常数 | s |
| `meter` | `{"kind":"meter","el":"A1"}` | 电流表 / 电压表读数 | A / V |
| `gain` | `{"kind":"gain","out":["o"],"input":"Ui"}` | 网络函数 V(out) / 输入源的值（交流为复数，用 `part` 取模、相位或 dB） | — |
| `f0` | `{"kind":"f0"}` / `{"kind":"f0","port":["a","b"]}` | 谐振频率：输入阻抗为纯电阻时的频率 | Hz |
| `twoport` | `{"kind":"twoport","ports":[["1","1'"],["2","2'"]],"param":"z11"}` | 二端口参数 z11…z22、y11…y22、h11…h22、a/b/c/d | 视参数而定 |
| `w` | `{"kind":"w","el":"C"}` | 储能：电容 ½Cu²、电感 ½Li²（直流；暂态在 `t` 时刻）。`el` 写耦合 `K` 的 ref 得这对耦合电感的总能量 ½L₁i₁² + ½L₂i₂² + M·i₁i₂；写单个电感只算它自己的 ½Li²（**不含**互感储能） | J |
| `val` | `{"kind":"val","el":"C"}` | 元件自身的值（R、C、L、受控源增益、变压器 n、K 的 M、Z、电源值），用于“求 C 使……”（§6.1.4） | 元件的单位 |
| `wattmeter` | `{"kind":"wattmeter","current":"W1","nodes":["A","B"]}` | 功率表读数（§6.1.5） | W |
| `root` | `{"kind":"root","n":1}` | t > 0 电路的第 n 个固有频率（特征根），按实部从大到小、再按虚部从大到小排列；`part`：`"re"`（默认）、`"im"`、`"mag"`（§6.1.3） | 1/s |
| `alpha` | `{"kind":"alpha"}` | 衰减系数 α：二阶电路 −(s₁+s₂)/2；更高阶取主导共轭复根的 −Re | 1/s |
| `omega_d` | `{"kind":"omega_d"}` | 阻尼振荡角频率 ω_d = 主导共轭复根的 \|Im\|（特征根为实数时报错） | rad/s |
| `omega0` | `{"kind":"omega0"}` | 二阶电路的谐振（无阻尼）角频率 ω₀ = √(s₁s₂) | rad/s |
| `fc` | `{"kind":"fc","out":["o"],"input":"Ui","which":"low"}` | −3 dB 截止频率：\|H\| = max\|H\|/√2 处的频率（H = V(out)/输入源）。只有一个截止频率时可省略 `which`（§6.1.6） | Hz |
| `bw` | `{"kind":"bw","out":["o"],"input":"Ui"}` | −3 dB 带宽 = 上截止频率 − 下截止频率 | Hz |
| `Q` | `{"kind":"Q"}` / `{"kind":"Q","port":["a","b"]}` | 品质因数（§6.1.6） | — |

**修饰字段 / Modifiers**：`"deriv": 1`（暂态题的 `v` / `i`：求 t 时刻的导数，§6.1.2）；`"freq"` / `"omega"`（交流题：这个小题在另一个频率下计算，§6.1.6）。

#### 6.1.1 去掉负载：`exclude` / Removing the drawn load

`req`、`vth`、`isc`、`pmax` 默认按**图上画的电路**计算：画在端口上的负载电阻也算在网络里。题目是“R_L 为多少时获得最大功率、最大功率是多少”而 R_L 画在 a、b 之间时，用 `exclude` 列出要先拿掉（断开）的元件：

By default the port quantities use the circuit exactly as drawn, so a load drawn across the port is part of the network. List the elements to take out (open-circuit) first in `exclude`:

```json
{ "id": "pm", "ask": "R_L 为多少时获得最大功率？最大功率是多少？", "find": { "kind": "pmax", "port": ["a", "b"], "exclude": ["RL"] }, "answer": 2, "unit": "W" }
```

同样 `{"kind":"req","port":["a","b"],"exclude":["RL"]}` 就是 R_L 应取的值（R_L = R₀）。`exclude` 里的 ref 必须存在，否则报错；列出的元件一律按开路处理（列一个电源也只是把它断开）。暂态题里，直接跨接在端口上的电容/电感会被自动拿掉（“从储能元件看进去”）。

#### 6.1.2 导数 / Time derivatives (`deriv`)

暂态题里 `v`、`i` 可以加 `"deriv": 1`，得到 t 时刻的导数（V/s、A/s）。`t: "0+"` 用换路后瞬间的值：例如 du_C/dt(0₊) = i_C(0₊)/C，di_L/dt(0₊) = u_L(0₊)/L——二阶电路求两个初始条件时常用。`"0-"` 是换路前稳态的导数（直流稳态为 0），`"inf"` 为 0。

`"deriv": 1` on `v` / `i` in a transient problem gives d/dt at `t` (V/s, A/s); at `"0+"` it uses the values right after switching (du_C/dt(0+) = i_C(0+)/C, di_L/dt(0+) = u_L(0+)/L).

```json
{ "id": "dudt", "ask": "du_C/dt(0₊) = ?", "find": { "kind": "v", "el": "C", "t": "0+", "deriv": 1 }, "answer": 0, "unit": "V/s" }
```

#### 6.1.3 固有频率 / Natural frequencies: `root`, `alpha`, `omega_d`, `omega0`

这些量描述 t > 0 的电路本身（与激励无关），暂态题里**不用写 `t`**。串联 RLC（R = 2 Ω、L = 1 H、C = 0.25 F）：特征方程 s² + (R/L)s + 1/(LC) = s² + 2s + 4 = 0，s₁,₂ = −1 ± j√3，所以

These describe the t > 0 circuit itself (no `t` needed). For the series RLC with R = 2 Ω, L = 1 H, C = 0.25 F (s² + 2s + 4 = 0, s = −1 ± j√3):

| find | 结果 / result |
|---|---|
| `{"kind":"root","n":1}` | −1（实部 / real part） |
| `{"kind":"root","n":1,"part":"im"}` | 1.732051（= √3；n = 2 的虚部是 −√3） |
| `{"kind":"alpha"}` | 1（α = R/2L） |
| `{"kind":"omega_d"}` | 1.732051（ω_d = √(ω₀² − α²)） |
| `{"kind":"omega0"}` | 2（ω₀ = 1/√(LC)） |

过阻尼时两个根都是实数（`root` 1、2 按从大到小，即 n = 1 是衰减最慢的那个），`omega_d` 报错；临界阻尼时两个根相等。电容只通过电容相连的结点（电荷守恒）、只由电感构成的回路（磁链守恒）带来的零根不算在内。完整例子见 §9 例 4。

Over-damped circuits have two real roots (n = 1 is the slowest one) and `omega_d` is an error. Zero roots caused by charge / flux conservation are not listed. See worked example 4 in §9.

#### 6.1.4 元件值 / `val` — “求 C 使……”

题目要求“求电容 C 使功率因数为 1”这类问题时：作者先算出 C，把它写进图里并加 `"hideValue": true`（学生看不到），再用 `{"kind":"val","el":"C"}` 问它。`val` 只是读出作者写的值，**不检验条件本身**，所以**必须再加一个由引擎核对条件的小题**（例如 `{"kind":"pf","el":"Us"}` 答案 1，或 `{"kind":"f0"}`、`{"kind":"q","el":"Us"}` 为 0），这样隐藏的值确实满足题目说的条件。

For "find C such that …": put the value you computed into the drawing with `"hideValue": true` and ask `{"kind":"val","el":"C"}`. `val` only reads the value back — **also add a question the engine checks against the condition** (e.g. pf = 1, Q = 0, f0), so the hidden value is verified to do what the problem says.

#### 6.1.5 功率表 / Wattmeter

画法：电流线圈画成一个**串联**在线路里的 `ammeter`，`label` 写 `"W"`（或 `"W1"`）；电压线圈的两个接点各放一个结点名（`labels`），例如 `A`、`B`。读数：

Draw the current coil as an `ammeter` in series with the line (label `"W"`), and name the two nodes of the voltage coil with `labels`. The reading is:

- 交流：P_W = Re(U_AB · I*)（`phasor: "peak"` 时为 ½Re(U_AB·I*)），I 是该电流表从 p 流向 n 的电流；直流 / 暂态：U_AB · I。 / AC: Re(U_AB·I*) (½ for peak phasors), I = the ammeter's p→n current; DC / transient: U_AB·I.
- 电流从电流表的 p 端（from）进入、电压线圈的 `nodes[0]` 接“同名端（*）”一侧时，读数就是一般教材的读法。 / With current entering the ammeter's p end and `nodes[0]` on the ± (starred) side, this is the usual textbook reading.

**二瓦计法 / Two-wattmeter method**（三相三线制）：W1 的电流线圈串在 A 线（ammeter `W1`，从电源侧到负载侧），电压线圈接 A、B；W2 的电流线圈串在 C 线，电压线圈接 C、B。总功率 P = P_W1 + P_W2：

```json
[
  { "id": "w1", "ask": "W1 的读数", "find": { "kind": "wattmeter", "current": "W1", "nodes": ["A", "B"] }, "answer": 1229.169, "unit": "W" },
  { "id": "w2", "ask": "W2 的读数", "find": { "kind": "wattmeter", "current": "W2", "nodes": ["C", "B"] }, "answer": 2226.831, "unit": "W" }
]
```

（数值对应线电压 207.8 V、每相 Z = 10 + j5 Ω 的对称 Y 负载；两读数之和 = 3I²R = 3456 W。/ Values for a balanced Y load Z = 10 + j5 Ω per phase at 120 V phase voltage.）

#### 6.1.6 频率响应 / Frequency response: `freq` / `omega`, `fc`, `bw`, `Q`

- **改频率**：交流题的小题可以写 `"freq"`（Hz）或 `"omega"`（rad/s），只在这个小题里替换 `analysis` 的频率。同一道题就能问 100 Hz 和 1 kHz 时的 \|H\|。/ A question may override the analysis frequency with its own `freq` / `omega`.
- **`fc`**：网络函数 H = V(out)/输入源（与 `gain` 相同）的 −3 dB 频率，即 \|H\| 降到最大值的 1/√2 处。低通、高通只有一个；带通有下、上两个，用 `"which": "low"` / `"high"` 选。引擎在电路特征频率的 10⁻⁴～10⁴ 倍范围内搜索。/ −3 dB frequency of V(out)/input relative to max \|H\|; band-pass needs `which`.
- **`bw`**：上截止频率 − 下截止频率（Hz）。只有一个截止频率时报错。
- **`Q`**：谐振频率 f₀ 处（与 `f0` 同样从 `port` 或唯一独立源看进去）的品质因数，定义为 **Q = ω₀ · W / P**，W 为平均储能（所有电感、电容和互感），P 为平均有功功率。它与教材公式一致：串联 RLC 的 Q = ω₀L/R = 1/(ω₀RC)，并联 GCL 的 Q = ω₀C/G = R/(ω₀L)，高 Q 时也等于 f₀/BW。无损电路（Q 无穷大）报错。/ Q = ω₀·(average stored energy)/(average power) at resonance — equals ω₀L/R for series RLC and ω₀C/G for parallel GCL.

### 6.2 复数结果取哪一部分 / `part`

交流结果是复数，用 `find.part` 选择：`"mag"`（**交流默认**，模）、`"phase"`（相位，度）、`"re"`、`"im"`、`"db"`（20·lg|x|）、`"rms"`（换算成有效值——在 `phasor: "peak"` 时有用）。直流和暂态的结果是实数，默认 `"re"`。

```json
{ "id": "ph", "ask": "电流 I 的相位", "find": { "kind": "i", "el": "R", "part": "phase" }, "answer": -53.1301, "unit": "°" }
```

### 6.3 引擎的限制 / Engine limitations

- 耦合系数 k = 1（全耦合电感）只能用于交流题；暂态题请用 k < 1 或理想变压器。 / k = 1 coupling works in AC only.
- 运放积分器（反馈只有电容）在 t < 0 没有确定的直流状态：给电容写 `ic`（通常 `0`）。 / An op-amp integrator needs `ic` on its capacitor.
- `gain`、`f0`、`twoport` 不能用于暂态题；`q`、`s`、`pf` 只用于交流题；`w` 不能用于交流题；`deriv` 只用于暂态题；`part: "rms"` 不能用于暂态的瞬时值。 / `gain`/`f0`/`twoport` are not available in transient problems; `w` is DC / transient only; `deriv` is transient only.
- 变压器两侧没有公共地时，跨两侧的电压没有定义，引擎报错（同一侧内的电压、元件电压没问题）。 / Voltages between galvanically isolated sides of a transformer are undefined and throw.
- 交流分析只有一个频率。`f0` 在电路特征频率的 10⁻⁴～10⁴ 倍范围内搜索，有多个谐振点时给最低的。 / AC is single-frequency; `f0` returns the lowest resonance.
- 电路方程奇异（电压源回路、电流源割集、悬空结点、没有负反馈的运放、恰好在谐振频率上的无损 LC）时引擎给出说明并拒绝。

---

## 7. 答案的精度 / Precision

- 校验器把 `answer` 和引擎结果比较：相对误差 ≤ 0.5%（绝对 1e-9；相位按 360° 取模，至少 0.01°）。**请至少写 4 位有效数字**：`2.943036`，不要写 `2.9`。
- 学生的答案用 `tol`（默认 2%）比较，所以题干里给的数据应能让学生算到 3 位有效数字。

---

## 8. 多语言 / `lang` 与 `i18n`

规则和面包板题一样（见 `CHALLENGE_FORMAT.md` §11）：

- 顶层文字的语言由 `lang` 决定，默认 `"zh"`。另一种语言写在 `i18n.<lang>` 里。
- `i18n.<lang>` 可写：`title`、`statement`、`tags`、`hints`、`solution`、`notes`、`questions`。
- `questions` 是**按位置**一一对应的数组，每项只写文字：`{ "ask": "...", "explain": "...", "choices": [...], "choiceExplain": [...] }`（`choices`、`choiceExplain` 数量必须和原文相同；`choiceExplain` 里空字符串的项用原文）。`find`、`answer`、`unit` 不用重复写。
- `tags`、`hints`、`questions`、`notes` 的数量和原文不一致时校验器警告；`tags`、`hints` 数量不一致时整组翻译被忽略。
- `notes` 也可以在每条注释里写 `"i18n": { "en": "..." }`。
- 缺少的字段回退到顶层文字。

### 8.1 符号约定 / Notation

文字里的符号按 [`NOTATION.md`](./NOTATION.md) 书写，要点：

- 变量名用下标标记，和图一致：`R_1`、`U_s`、`i_1`、`u_ab`、`z_11`（不写 `R1`、`Us`、`i1`）；直接相乘的两个带下标的量要加花括号：`R_{1}R_{4}`；中文或 `+`/`−` 下标写 `u_{+}`、`R_{左}`。`schematic` 里的 `ref` 和 `marks` 的 `name` 照常写 `R1`、`i1`（图上自动加下标）。
- 电压在中英文里都用 u / U（和图一致，英文不用 v / V），电流 i / I；小写 = 瞬时值，大写 = 直流量或有效值。
- 相量加点：`U̇_s`、`İ_1`；有效值、模、∠ 前的模、`I²R` 里的 I、阻抗 Z、导纳 Y 不加点。复功率 `S̄ = U̇·İ*`。
- 正弦量以 cos 为参考：u = √2·U·cos(ωt + ψ) ↔ U̇ = U∠ψ。
- 中文用“结点”。提示由浅入深：方向 → 方法 → 接近答案。

Write symbols as described in [`NOTATION.md`](./NOTATION.md): subscript markup for variable names (`R_1`, `U_s`, `i_1`, braces for products `R_{1}R_{4}`), u / U for voltage in both languages, dotted phasors (`U̇_s`, `İ_1`) but undotted magnitudes, the cosine reference for sinusoids, 结点 in Chinese, and graded hints.

---

## 9. 完整示例 / Worked examples

下面三个例子都能通过校验（`src/core/problem/parse.test.ts` 会自动校验本文件和 `AI_PROMPT_PROBLEMS.md` 里所有完整的 JSON 示例）。另见 `problems/` 里的内置题。

### 例 1：含受控源的直流电路（结点电压法）/ DC with a dependent source

电流源 I_s = 2 A 向结点 a 注入电流；R_1 = 4 Ω 接在 a 与地之间；R_2 = 2 Ω 连接 a、b；R_3 = 4 Ω 接在 b 与地之间；VCCS 从 b 抽走 0.25·u_1 的电流到地，u_1 是 R_1 上的电压。

结点方程：a：2 = u_a/4 + (u_a − u_b)/2；b：(u_a − u_b)/2 = 0.25·u_a + u_b/4 → u_a = 3u_b → u_b = 8/7 V，u_a = 24/7 ≈ 3.428571 V。R_2 电流 (u_a − u_b)/2 = 8/7 ≈ 1.142857 A。VCCS 吸收功率 u_b × 0.25·u_a = 48/49 ≈ 0.979592 W。

```json
{
  "format": "circuit-problem/1",
  "id": "example-nodal-vccs",
  "chapter": "methods",
  "title": "含 VCCS 的结点电压法",
  "level": 3,
  "tags": ["结点电压法", "受控源 VCCS"],
  "statement": "图中 I_s = 2 A，R_1 = 4 Ω，R_2 = 2 Ω，R_3 = 4 Ω。电压控制电流源 G 的电流为 0.25·u_1（方向向下），u_1 是 R_1 两端电压（+ 在上）。求 u_a、R_2 的电流 i_2，以及 G 吸收的功率。",
  "schematic": {
    "elements": [
      { "ref": "Is", "type": "I", "from": [0, 4], "to": [0, 0], "value": 2 },
      { "ref": "R1", "type": "R", "from": [3, 0], "to": [3, 4], "value": 4 },
      { "ref": "R2", "type": "R", "from": [6, 0], "to": [10, 0], "value": 2 },
      { "ref": "G", "type": "VCCS", "from": [13, 0], "to": [13, 4], "value": 0.25, "ctrl": { "v": "R1" }, "label": "0.25u1" },
      { "ref": "R3", "type": "R", "from": [16, 0], "to": [16, 4], "value": 4 }
    ],
    "wires": [
      [[0, 0], [6, 0]],
      [[10, 0], [16, 0]],
      [[16, 4], [0, 4]]
    ],
    "labels": [{ "at": [6, 0], "name": "a" }, { "at": [10, 0], "name": "b" }],
    "grounds": [[0, 4]],
    "marks": [{ "kind": "v", "el": "R1", "name": "u1" }, { "kind": "i", "el": "R2", "name": "i2" }]
  },
  "analysis": { "type": "dc" },
  "questions": [
    { "id": "ua", "ask": "u_a = ?", "find": { "kind": "v", "nodes": ["a"] }, "answer": 3.428571, "unit": "V", "explain": "两个结点方程联立：u_a = 3u_b，1.75u_b = 2 → u_b = 8/7 V，u_a = 24/7 V。" },
    { "id": "i2", "ask": "i_2 = ?", "find": { "kind": "i", "el": "R2" }, "answer": 1.142857, "unit": "A", "explain": "i_2 = (u_a − u_b)/R_2 = (16/7)/2 = 8/7 A。" },
    { "id": "pg", "ask": "G 吸收的功率 = ?", "find": { "kind": "p", "el": "G" }, "answer": 0.979592, "unit": "W", "explain": "G 两端电压 u_b，电流 0.25·u_a 从上往下（关联方向），P = u_b × 0.25u_a = 48/49 W。" }
  ],
  "hints": ["对 a、b 两个结点列 KCL；控制量 u_1 就是 u_a。", "先用 b 的方程得到 u_a 与 u_b 的关系。"],
  "solution": [
    "**结点 a：** I_s = u_a/R_1 + (u_a − u_b)/R_2 → 2 = 0.75u_a − 0.5u_b。",
    "**结点 b：** (u_a − u_b)/R_2 = 0.25·u_1 + u_b/R_3，u_1 = u_a → 0.25u_a = 0.75u_b，即 u_a = 3u_b。",
    "代入：2 = 2.25u_b − 0.5u_b = 1.75u_b → **u_b = 8/7 V，u_a = 24/7 ≈ 3.429 V**。",
    "i_2 = (u_a − u_b)/2 = **8/7 ≈ 1.143 A**；P_G = u_b × 0.25u_a = **48/49 ≈ 0.980 W**（吸收）。"
  ],
  "i18n": {
    "en": {
      "tags": ["nodal analysis", "dependent source VCCS"],
      "title": "Nodal analysis with a VCCS",
      "statement": "I_s = 2 A, R_1 = 4 Ω, R_2 = 2 Ω, R_3 = 4 Ω. The voltage-controlled current source G carries 0.25·u_1 (downwards), where u_1 is the voltage across R_1 (+ at the top). Find u_a, the current i_2 in R_2 and the power absorbed by G.",
      "questions": [
        { "ask": "u_a = ?", "explain": "Solve the two node equations: u_a = 3u_b, 1.75u_b = 2 → u_b = 8/7 V, u_a = 24/7 V." },
        { "ask": "i_2 = ?", "explain": "i_2 = (u_a − u_b)/R_2 = (16/7)/2 = 8/7 A." },
        { "ask": "Power absorbed by G = ?", "explain": "G has voltage u_b and current 0.25·u_a flowing downwards (passive convention): P = u_b × 0.25u_a = 48/49 W." }
      ],
      "hints": ["Write KCL at nodes a and b; the controlling voltage u_1 is just u_a.", "The equation at b gives the relation between u_a and u_b first."],
      "solution": [
        "**Node a:** I_s = u_a/R_1 + (u_a − u_b)/R_2 → 2 = 0.75u_a − 0.5u_b.",
        "**Node b:** (u_a − u_b)/R_2 = 0.25·u_1 + u_b/R_3 with u_1 = u_a → 0.25u_a = 0.75u_b, i.e. u_a = 3u_b.",
        "Substitute: 2 = 2.25u_b − 0.5u_b = 1.75u_b → **u_b = 8/7 V, u_a = 24/7 ≈ 3.429 V**.",
        "i_2 = (u_a − u_b)/2 = **8/7 ≈ 1.143 A**; P_G = u_b × 0.25u_a = **48/49 ≈ 0.980 W** (absorbed)."
      ]
    }
  }
}
```

注意 Is 是从 `[0,4]`（p，下）画到 `[0,0]`（n，上）：箭头向上，电流从顶端流出、注入 a。R1 的上端 `[3,0]` 落在顶边导线中间，形成 T 形接点。

### 例 2：功率因数校正（交流功率）/ AC power and power-factor correction

Us = 220 V（有效值），ω = 100 rad/s，负载 R = 30 Ω 串 L = 0.4 H（X_L = 40 Ω，Z = 50∠53.13° Ω），负载两端并联 C = 160 µF。负载电流 4.4∠−53.13° A，P = 580.8 W，Q_L = 774.4 var；Q_C = −U²ωC = −774.4 var，正好补偿，电源电流 = P/U = 2.64 A，功率因数 = 1。

```json
{
  "format": "circuit-problem/1",
  "id": "example-pf-correction",
  "chapter": "ac-power",
  "title": "并联电容提高功率因数",
  "level": 3,
  "tags": ["功率因数校正", "无功功率"],
  "statement": "U̇_s = 220∠0° V（有效值），ω = 100 rad/s。感性负载 R = 30 Ω、L = 0.4 H，并联电容 C = 160 µF。求负载电流的相位、电容的无功功率、电源电流和电源的功率因数。",
  "schematic": {
    "elements": [
      { "ref": "Us", "type": "V", "from": [0, 0], "to": [0, 6], "value": { "ac": { "mag": 220, "phase": 0 } } },
      { "ref": "C", "type": "C", "from": [4, 0], "to": [4, 6], "value": "160u" },
      { "ref": "R", "type": "R", "from": [8, 0], "to": [8, 3], "value": 30 },
      { "ref": "L", "type": "L", "from": [8, 3], "to": [8, 6], "value": 0.4 }
    ],
    "wires": [
      [[0, 0], [8, 0]],
      [[8, 6], [0, 6]]
    ],
    "grounds": [[0, 6]],
    "marks": [{ "kind": "i", "el": "R", "name": "I_L" }]
  },
  "analysis": { "type": "ac", "omega": 100 },
  "questions": [
    { "id": "ph", "ask": "负载电流 I_L 的相位 = ?", "find": { "kind": "i", "el": "R", "part": "phase" }, "answer": -53.1301, "unit": "°", "explain": "İ_L = 220 / (30 + j40) = 4.4∠−53.13° A。" },
    { "id": "qc", "ask": "电容吸收的无功功率 Q_C = ?", "find": { "kind": "q", "el": "C" }, "answer": -774.4, "unit": "var", "explain": "Q_C = −U²ωC = −220² × 100 × 160×10⁻⁶ = −774.4 var（电容发出无功）。" },
    { "id": "is", "ask": "电源电流有效值 I = ?", "find": { "kind": "i", "el": "Us" }, "answer": 2.64, "unit": "A", "explain": "无功完全补偿后只剩有功：I = P / U = 580.8 / 220 = 2.64 A（补偿前是 4.4 A）。" },
    { "id": "pf", "ask": "电源的功率因数 = ?", "find": { "kind": "pf", "el": "Us" }, "answer": 1, "unit": "", "explain": "Q_L + Q_C = 774.4 − 774.4 = 0，所以 cos φ = 1。" }
  ],
  "hints": ["先算负载电流和负载的 P、Q。", "电容的无功 Q_C = −U²ωC；总无功为零时功率因数为 1。"],
  "solution": [
    "**负载：** Z = 30 + j40 = 50∠53.13° Ω，İ_L = 220/Z = **4.4∠−53.13° A**；P = I_L²R = 580.8 W，Q_L = I_L²X_L = 774.4 var。",
    "**电容：** Q_C = −U²ωC = **−774.4 var**。",
    "**电源：** Q = Q_L + Q_C = 0，S = P = 580.8 VA，I = S/U = **2.64 A**，cos φ = **1**。"
  ],
  "i18n": {
    "en": {
      "tags": ["power-factor correction", "reactive power"],
      "title": "Power-factor correction with a parallel capacitor",
      "statement": "U̇_s = 220∠0° V (rms), ω = 100 rad/s. An inductive load R = 30 Ω, L = 0.4 H has a capacitor C = 160 µF in parallel. Find the phase of the load current, the reactive power of the capacitor, the source current and the source power factor.",
      "questions": [
        { "ask": "Phase of the load current I_L = ?", "explain": "İ_L = 220 / (30 + j40) = 4.4∠−53.13° A." },
        { "ask": "Reactive power absorbed by the capacitor, Q_C = ?", "explain": "Q_C = −U²ωC = −220² × 100 × 160×10⁻⁶ = −774.4 var (the capacitor supplies reactive power)." },
        { "ask": "rms source current I = ?", "explain": "With the reactive power fully compensated only real power is left: I = P / U = 580.8 / 220 = 2.64 A (it was 4.4 A without C)." },
        { "ask": "Power factor of the source = ?", "explain": "Q_L + Q_C = 774.4 − 774.4 = 0, so cos φ = 1." }
      ],
      "hints": ["Start with the load current and the load's P and Q.", "The capacitor's reactive power is Q_C = −U²ωC; when the total Q is zero the power factor is 1."],
      "solution": [
        "**Load:** Z = 30 + j40 = 50∠53.13° Ω, İ_L = 220/Z = **4.4∠−53.13° A**; P = I_L²R = 580.8 W, Q_L = I_L²X_L = 774.4 var.",
        "**Capacitor:** Q_C = −U²ωC = **−774.4 var**.",
        "**Source:** Q = Q_L + Q_C = 0, S = P = 580.8 VA, I = S/U = **2.64 A**, cos φ = **1**."
      ]
    }
  }
}
```

R 和 L 首尾相接（R 的 n 端和 L 的 p 端都在 `[8,3]`），不需要导线。C 的两端落在上下两条导线的中间。

### 例 3：RL 电路的阶跃响应（暂态）/ RL step response

Us 在 t = 0 从 0 跳到 10 V，R = 5 Ω，L = 0.5 H。i_L(0+) = 0，i_L(∞) = 2 A，τ = L/R = 0.1 s，i_L(t) = 2(1 − e^(−10t)) A，i_L(0.1) = 2(1 − e⁻¹) ≈ 1.264241 A，u_L(0+) = 10 V。

```json
{
  "format": "circuit-problem/1",
  "id": "example-rl-step",
  "chapter": "first-order",
  "title": "RL 电路的阶跃响应",
  "level": 2,
  "tags": ["三要素法", "零状态响应"],
  "statement": "电压源在 t = 0 由 0 V 跳变为 10 V，R = 5 Ω，L = 0.5 H。求 u_L(0₊)、i_L(∞)、τ 和 t = 0.1 s 时的 i_L。",
  "schematic": {
    "elements": [
      { "ref": "Us", "type": "V", "from": [0, 0], "to": [0, 4], "value": { "step": { "before": 0, "after": 10 } }, "label": "10ε(t) V" },
      { "ref": "R", "type": "R", "from": [2, 0], "to": [6, 0], "value": 5 },
      { "ref": "L", "type": "L", "from": [8, 0], "to": [8, 4], "value": 0.5 }
    ],
    "wires": [
      [[0, 0], [2, 0]],
      [[6, 0], [8, 0]],
      [[8, 4], [0, 4]]
    ],
    "grounds": [[0, 4]],
    "marks": [{ "kind": "i", "el": "L", "name": "i_L" }, { "kind": "v", "el": "L", "name": "u_L" }]
  },
  "analysis": { "type": "tran" },
  "questions": [
    { "id": "u0", "ask": "u_L(0₊) = ?", "find": { "kind": "v", "el": "L", "t": "0+" }, "answer": 10, "unit": "V", "explain": "i_L(0₊) = i_L(0₋) = 0，R 上没有压降，电源电压全部加在 L 上。" },
    { "id": "iinf", "ask": "i_L(∞) = ?", "find": { "kind": "i", "el": "L", "t": "inf" }, "answer": 2, "unit": "A", "explain": "新稳态时电感短路：i_L = 10 / 5 = 2 A。" },
    { "id": "tau", "ask": "τ = ?", "find": { "kind": "tau" }, "answer": 0.1, "unit": "s", "explain": "τ = L / R = 0.5 / 5 = 0.1 s。" },
    { "id": "i1", "ask": "t = 0.1 s 时 i_L = ?", "find": { "kind": "i", "el": "L", "t": 0.1 }, "answer": 1.264241, "unit": "A", "explain": "三要素法：i_L(t) = 2 + (0 − 2)e^(−t/0.1)，t = 0.1 s 时 = 2(1 − e⁻¹) ≈ 1.264 A。" }
  ],
  "hints": ["电感电流不能跃变。", "三要素：初值、终值、时间常数。"],
  "solution": [
    "**初值：** i_L(0₊) = i_L(0₋) = 0，所以 u_L(0₊) = 10 − 5×0 = **10 V**。",
    "**终值：** 电感短路，i_L(∞) = 10/5 = **2 A**。",
    "**时间常数：** τ = L/R = **0.1 s**。",
    "**三要素公式：** i_L(t) = 2(1 − e^(−t/0.1)) A，i_L(0.1) = 2(1 − e⁻¹) ≈ **1.264 A**。"
  ],
  "i18n": {
    "en": {
      "tags": ["three-element method", "zero-state response"],
      "title": "Step response of an RL circuit",
      "statement": "The source jumps from 0 V to 10 V at t = 0, R = 5 Ω, L = 0.5 H. Find u_L(0+), i_L(∞), τ and i_L at t = 0.1 s.",
      "questions": [
        { "ask": "u_L(0+) = ?", "explain": "i_L(0+) = i_L(0−) = 0, so there is no drop across R and the whole source voltage is across L." },
        { "ask": "i_L(∞) = ?", "explain": "In the new steady state the inductor is a short: i_L = 10 / 5 = 2 A." },
        { "ask": "τ = ?", "explain": "τ = L / R = 0.5 / 5 = 0.1 s." },
        { "ask": "i_L at t = 0.1 s = ?", "explain": "Three-element formula: i_L(t) = 2 + (0 − 2)e^(−t/0.1); at t = 0.1 s it is 2(1 − e⁻¹) ≈ 1.264 A." }
      ],
      "hints": ["The inductor current can't jump.", "Three elements: initial value, final value, time constant."],
      "solution": [
        "**Initial value:** i_L(0+) = i_L(0−) = 0, so u_L(0+) = 10 − 5×0 = **10 V**.",
        "**Final value:** the inductor is a short, i_L(∞) = 10/5 = **2 A**.",
        "**Time constant:** τ = L/R = **0.1 s**.",
        "**Formula:** i_L(t) = 2(1 − e^(−t/0.1)) A, i_L(0.1) = 2(1 − e⁻¹) ≈ **1.264 A**."
      ]
    }
  }
}
```

### 例 4：RLC 串联电路的固有频率与初始条件（二阶）/ Series RLC: natural frequencies

Us 在 t = 0 从 0 跳到 10 V，R = 2 Ω，L = 1 H，C = 0.25 F，换路前电路不带电。特征方程 s² + 2s + 4 = 0，s₁,₂ = −1 ± j√3：欠阻尼，α = 1 s⁻¹，ω_d = √3 ≈ 1.732051 rad/s，ω₀ = 2 rad/s。初始条件：u_C(0₊) = 0，du_C/dt(0₊) = i_L(0₊)/C = 0，di_L/dt(0₊) = u_L(0₊)/L = 10 A/s。

```json
{
  "format": "circuit-problem/1",
  "id": "example-rlc-roots",
  "chapter": "second-order",
  "title": "RLC 串联电路的固有频率",
  "level": 3,
  "tags": ["特征根", "欠阻尼"],
  "statement": "电压源在 t = 0 由 0 V 跳变为 10 V，R = 2 Ω，L = 1 H，C = 0.25 F，换路前电路不带电。求 t > 0 电路的衰减系数 α、阻尼振荡角频率 ω_d、谐振角频率 ω₀，以及 di_L/dt(0₊)。",
  "schematic": {
    "elements": [
      { "ref": "Us", "type": "V", "from": [0, 0], "to": [0, 4], "value": { "step": { "before": 0, "after": 10 } }, "label": "10ε(t) V" },
      { "ref": "R", "type": "R", "from": [2, 0], "to": [6, 0], "value": 2 },
      { "ref": "L", "type": "L", "from": [8, 0], "to": [12, 0], "value": 1 },
      { "ref": "C", "type": "C", "from": [14, 0], "to": [14, 4], "value": 0.25 }
    ],
    "wires": [
      [[0, 0], [2, 0]],
      [[6, 0], [8, 0]],
      [[12, 0], [14, 0]],
      [[14, 4], [0, 4]]
    ],
    "grounds": [[0, 4]],
    "marks": [{ "kind": "i", "el": "L", "name": "i_L" }, { "kind": "v", "el": "C", "name": "u_C" }]
  },
  "analysis": { "type": "tran" },
  "questions": [
    { "id": "alpha", "ask": "α = ?", "find": { "kind": "alpha" }, "answer": 1, "unit": "1/s", "explain": "α = R/(2L) = 2/2 = 1 s⁻¹。" },
    { "id": "wd", "ask": "ω_d = ?", "find": { "kind": "omega_d" }, "answer": 1.732051, "unit": "rad/s", "explain": "ω_d = √(ω₀² − α²) = √(4 − 1) = √3 rad/s。" },
    { "id": "w0", "ask": "ω₀ = ?", "find": { "kind": "omega0" }, "answer": 2, "unit": "rad/s", "explain": "ω₀ = 1/√(LC) = 1/√0.25 = 2 rad/s。" },
    { "id": "s1", "ask": "特征根 s₁ = −α + jω_d 的虚部 = ?", "find": { "kind": "root", "n": 1, "part": "im" }, "answer": 1.732051, "unit": "rad/s", "explain": "s₁,₂ = −1 ± j√3。" },
    { "id": "didt", "ask": "di_L/dt(0₊) = ?", "find": { "kind": "i", "el": "L", "t": "0+", "deriv": 1 }, "answer": 10, "unit": "A/s", "explain": "i_L(0₊) = 0、u_C(0₊) = 0，所以 u_L(0₊) = 10 V，di_L/dt = u_L/L = 10 A/s。" }
  ],
  "hints": ["写出 t > 0 的特征方程 LCs² + RCs + 1 = 0。", "初始条件来自 u_C(0₊)、i_L(0₊)。"],
  "solution": [
    "**特征方程：** s² + (R/L)s + 1/(LC) = s² + 2s + 4 = 0，s₁,₂ = −1 ± j√3，欠阻尼。",
    "**参数：** α = **1 s⁻¹**，ω_d = **√3 ≈ 1.732 rad/s**，ω₀ = **2 rad/s**。",
    "**初始条件：** u_L(0₊) = 10 − 2×0 − 0 = 10 V，di_L/dt(0₊) = **10 A/s**。"
  ],
  "i18n": {
    "en": {
      "tags": ["characteristic roots", "under-damped"],
      "title": "Natural frequencies of a series RLC circuit",
      "statement": "The source jumps from 0 V to 10 V at t = 0, R = 2 Ω, L = 1 H, C = 0.25 F, and the circuit is de-energised before t = 0. Find the damping coefficient α, the damped frequency ω_d, the undamped frequency ω₀ of the t > 0 circuit, and di_L/dt(0+).",
      "questions": [
        { "ask": "α = ?", "explain": "α = R/(2L) = 2/2 = 1 1/s." },
        { "ask": "ω_d = ?", "explain": "ω_d = √(ω₀² − α²) = √(4 − 1) = √3 rad/s." },
        { "ask": "ω₀ = ?", "explain": "ω₀ = 1/√(LC) = 1/√0.25 = 2 rad/s." },
        { "ask": "Imaginary part of the root s₁ = −α + jω_d = ?", "explain": "s₁,₂ = −1 ± j√3." },
        { "ask": "di_L/dt(0+) = ?", "explain": "i_L(0+) = 0 and u_C(0+) = 0, so u_L(0+) = 10 V and di_L/dt = u_L/L = 10 A/s." }
      ],
      "hints": ["Write the characteristic equation of the t > 0 circuit: LCs² + RCs + 1 = 0.", "The initial conditions come from u_C(0+) and i_L(0+)."],
      "solution": [
        "**Characteristic equation:** s² + (R/L)s + 1/(LC) = s² + 2s + 4 = 0, s₁,₂ = −1 ± j√3 (under-damped).",
        "**Parameters:** α = **1 1/s**, ω_d = **√3 ≈ 1.732 rad/s**, ω₀ = **2 rad/s**.",
        "**Initial condition:** u_L(0+) = 10 − 2×0 − 0 = 10 V, di_L/dt(0+) = **10 A/s**."
      ]
    }
  }
}
```

---

## 10. 常见错误 / Common mistakes

| 校验器报错 / 现象 | 原因与修正 |
|---|---|
| `答案不对——作者写的 answer = …，引擎算出 …` / `wrong answer — the file says …, the engine computes …` | ① 真的算错了：重算，保留 ≥4 位有效数字。② **符号**：元件的 from/to 方向就是参考方向——电压源正常供电时它的关联电流和吸收功率都是负的。③ **单位**：`answer` 必须是 SI 基本单位（1 mA 写 `0.001`），`unit` 只是显示用。④ 交流题默认 `part` 是模；相量默认**有效值**。⑤ 图画得和想的不一样（见下几行）。 |
| `… lies on the body of R1` / `落在 R1 的元件体上` | 导线端点或别的端子落在元件两端之间：元件本体不连接任何东西。把导线接到元件的端点上。 |
| `… is not connected to anything` / `没有连接任何东西` | 端点差一格没接上。逐个核对每个元件的 from/to 是否正好在导线上。 |
| `Both terminals of X are on the same node` / `被短路` | 一条导线从元件一端连到了另一端（例如顶边导线穿过了水平放置的元件），或者元件放在一条连续导线上。导线要在元件两端断开。 |
| 两条导线交叉却没连上 | 交叉不相连。要连接就让一条导线的端点/折点落在另一条上。 |
| `Loop current … sits on …` / `回路电流 … 压在 … 上` | `loops` 的圆心要放在网孔中间的空白处，不能在导线或元件上。 |
| `Op-amp A only takes a current mark` / `Reference marks need a two-terminal element` | 运放只能加 `"i"` 标记（输出电流）；变压器、耦合电感不能加标记，给与绕组串联的元件加。 |
| `no node "a"` / `找不到结点` | 结点名只来自 `labels` / `terminals`，而且要放在导线或端子上。地写 `"0"`。 |
| `No ground symbol` / `没有接地符号` | `grounds` 至少一个点，并且要在导线或端子上。 |
| `transient questions need a time "t"` | 暂态题每个问题（除 `tau`）都要写 `t`：`"0-"`、`"0+"`、秒数或 `"inf"`。 |
| `"freq" and "omega" disagree` | 只写一个。 |
| 受控源控制量不对 | `{"i": "R1"}` 是 R1 **关联方向**（p→n）的电流；`{"v": "R1"}` 是 V(p) − V(n)。画控制元件时先想好方向，并加 `marks`。 |
| `pmax` / `req` 和预期不一样 | 负载画在端口上时被算进网络了：加 `"exclude": ["RL"]`。 |
| `tau: … not first-order` / `omega_d: … real` | 电路的阶数或阻尼类型和题目想的不一样：先用 `root` 看看引擎算出的特征根（报错信息里会列出来）。 |
| “求 C 使……”只能出选择题 | 用 `val` + `hideValue`，并加一个核对条件的小题（§6.1.4）。 |
| `pf` 想要负数 / 想区分超前滞后 | `pf` 总是 ≥ 0；超前/滞后用选择题问。 |
| `Cannot determine the initial state at t = 0−` | t < 0 的直流状态不确定（例如运放积分器）：给电容/电感写 `ic`。 |
| 电流源方向反了 | 箭头从 p（from）指向 n（to），电流从 n 端流出。要向结点 a 注入电流，`to` 放在 a 上。 |
| `i18n.en.questions: should be an array matching …` | 翻译的小题数量必须和原文一样，一一对应。 |
| `JSON syntax error` | 注释、尾随逗号、`...` 占位符。 |
