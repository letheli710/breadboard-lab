# 学习单元格式 / Learning unit format (`learning-unit/1`)

一个单元只回答**一个问题**，10–15 分钟能学完。文件放在 `units/*.json`，在 `course/worlds.json` 的某个 World 里登记（`"unit:<id>"`），页面地址 `#/unit/<id>`。`npm run validate` 会检查格式、公式、链接（见 `docs/PORTALS.md`）。

A unit answers **one question** in 10–15 minutes. Files live in `units/*.json`, are listed in a World of `course/worlds.json` (`"unit:<id>"`) and open at `#/unit/<id>`. `npm run validate` checks the structure, every formula and every link.

## 1. 顶层 / Top level

```json
{
  "format": "learning-unit/1",
  "id": "w3-5b-virtual-short",
  "world": "w3",
  "code": "5b",
  "title": { "zh": "为什么有虚短", "en": "Where the virtual short comes from" },
  "question": { "zh": "负反馈为什么让 v₊ ≈ v₋？", "en": "Why does negative feedback make v₊ ≈ v₋?" },
  "minutes": 12,
  "connects": ["unit:w3-5a-black-box"],
  "layers": [ { "layer": "intuition", "blocks": [ … ] }, { "layer": "derive", "blocks": [ … ] } ]
}
```

| 字段 | 说明 |
|---|---|
| `id` | 小写字母、数字、`-`；新单元用新 id，不复用 / new id, never reused |
| `world` | World 的 id（`w1` … `w8`、`ub`），必须和 `course/worlds.json` 里放的位置一致 |
| `code` | 卡片上的短编号（≤ 8 字符），如 `5b`、`5-chip` |
| `title`、`question` | 标题；这个单元回答的那一个问题 |
| `minutes` | 预计分钟数 |
| `connects` | “接回什么”：已经学过的内容的引用（`unit:`、`challenge:`、`chapter:`、`problem:`），显示在页首 |
| `layers` | 最多五层，**顺序固定**：`intuition` 直觉 → `derive` 交互推导 → `sim` 仿真 → `bench` 面包板 → `connect` 回链。可以缺层，不能换序，每层最多一次。每层可选 `title` 覆盖默认标题 |

**所有可见文字都写两种语言**：`{ "zh": …, "en": … }`，值可以是字符串或字符串数组（数组按行拼接，方便写段落和列表）。
Every visible string is bilingual `{ "zh": …, "en": … }`; a value may be an array of lines.

## 2. 文字 / Text

文字（`md`、`ask`、`explain`、`caption`、步骤……）支持：空行分段、`- ` / `1. ` 列表、`#` 小标题、`| 表格 |`（第一行是表头）、`**粗体**`、`` `代码` ``，以及理论题的公式记号：下标 `v_o`、`R_f`、`v_{+}`、`v_{−}`（`+`、`−` 和中文下标要加花括号），`\\frac{A}{1 + Aβ}`、`x^{2}`、`\\sqrt{LC}`（JSON 里反斜杠写两次）。

记号：单元跟着 Sadiku，**电压用 v**（`v_o`、`v_{in}`、`v_{+}`），电流用 i。练习区的理论题沿用 u（中文教材），第一次在单元里提到练习题时说一句即可。
Units follow Sadiku: **voltage is v**. The theory problems keep u (Chinese textbook); say so once when a unit first links to them.

写作要求：短句、白话；每个新符号第一次出现时用一句话说明它是什么。能用一张图或一个类比说清楚的，不要用一段推导。
Short, plain sentences; explain each new symbol the first time it appears.

## 3. Block 类型 / Block types

| type | 字段 | 显示 |
|---|---|---|
| `text` | `md` | 一段文字 |
| `note` | `tone`: `info` / `tip` / `warn`，`md` | 提示框（如“合理性检查”“常见错误”） |
| `steps` | `title?`，`steps`: [文字, …]（≥ 2） | 推导分步显示：一次揭开一步，“下一步”按钮 |
| `predict` | `ask`，`explain`，再选**一种**答案：`choices` + `correct`（从 0 起）；或 `answer`（数字）+ `tol?`（相对误差，默认 0.05）+ `unit?`；或 `text`（可接受的文字答案数组，比较时忽略大小写和空格） | 先作答，再揭晓 `explain`；可以“直接看答案” |
| `explore` | `title?`，`params`（滑块），`outputs`，`note?` | 滑块 + 实时结果表 |
| `sim` | `title?`，`intro?`，`params`（固定值，不显示滑块），`outputs`，`scenarios` | 每个情景：先预测（选择）→ 点“运行”→ 看结果 → 解释为什么 |
| `circuit` | `schematic`（理论题的电路图格式，`docs/PROBLEM_FORMAT.md`，可以有 `OPAMP`；校验时按理论题的几何规则提取电路，需要接地符号），`caption` | 一张电路图 |
| `bench` | `challenge`（课程或实验的 id），`note` | 面包板入口卡片 |
| `problems` | `ids`（理论题 id），`note?` | 理论题链接；一道题只能挂在一个单元下。World 的 `unitsCover` 列出的章节，每道题都必须挂在该 World 的某个单元下 |
| `portal` | `id`（`course/portals.json` 里的传送门，来源必须是本单元） | 把传送门放在这个位置；没有放的传送门自动列在页尾 |

### 3.1 `params` 与 `outputs`（explore / sim）

```json
"params": [
  { "id": "A", "label": { "zh": "开环增益 A", "en": "open-loop gain A" }, "value": 1000, "min": 10, "max": 100000, "log": true },
  { "id": "beta", "label": { "zh": "反馈系数 β", "en": "feedback factor β" }, "value": 0.1, "min": 0.01, "max": 1 },
  { "id": "vin", "label": { "zh": "输入 v_{in}", "en": "input v_{in}" }, "value": 0.1, "min": -1, "max": 1, "unit": "V" }
],
"outputs": [
  { "id": "G", "label": { "zh": "闭环增益", "en": "closed-loop gain" }, "expr": "A / (1 + A * beta)" },
  { "label": { "zh": "理想值 1/β", "en": "ideal 1/β" }, "expr": "1 / beta" },
  { "label": { "zh": "v₊ − v₋", "en": "v₊ − v₋" }, "expr": "vin / (1 + A * beta)", "unit": "V" },
  { "label": { "zh": "输出 v_o", "en": "output v_o" }, "expr": "clamp(G * vin, -13.5, 13.5)", "unit": "V" }
]
```

- 参数：`id`（变量名）、`label`、`value`；滑块还要 `min`、`max`，`log: true` 按十倍频移动（`min > 0`），`unit` 可选。`sim` 的参数不需要 `min` / `max`，`label` 可省。
- 输出：`expr` 公式，`label`，可选 `id`（后面的输出可以用它）、`unit`（SI 单位，自动加前缀：`0.002 V` → `2 mV`）、`digits`（有效数字，默认 3）、`percent: true`（×100 显示为 %）。
- 公式：数字、参数名、前面输出的 `id`，`+ - * / ^`、括号，函数 `abs sqrt exp ln log10 sin cos atan atand atan2d min max pow clamp(x, lo, hi) step(x) if(c, a, b)`，常数 `pi`、`e`。`step(x)` 在 x > 0 时为 1；`if(c, a, b)` 在 c > 0 时取 a。
- 校验：默认值、以及每个滑块分别拉到 min 和 max 时，所有输出都必须是有限数。

### 3.2 `scenarios`（sim）

```json
"scenarios": [
  {
    "label": { "zh": "拔掉反馈", "en": "Remove the feedback" },
    "set": { "beta": 0 },
    "ask": { "zh": "输出会是多少？", "en": "What will the output be?" },
    "choices": [ { "zh": "约 1 V", "en": "about 1 V" }, { "zh": "顶到 13.5 V 不动", "en": "stuck at 13.5 V" } ],
    "correct": 1,
    "explain": { "zh": "没有反馈，A × v_{in} = 100 V，远超电源，只能顶在摆幅上限。", "en": "…" }
  }
]
```

`set` 覆盖参数的值。

### 3.3 数字答案 / Numeric answers

`answer` 写成**显示单位里的数**：`"answer": 0.45, "unit": "mA"` 表示 0.45 mA（学生填 `0.45`、`0.45 mA` 都对，后缀单位会被去掉）。允许 `answer: 0`（此时要求填 0）。学生可以写 `10k`、`1/11` 这类式子。
`answer` is a number in the displayed unit; a typed trailing unit is ignored. `0` is allowed (then the student must type 0).情景应该包括“故意做坏事”：拔掉反馈、对调输入端、输入太大。

## 4. 例子 / Example

`units/w3-5b-virtual-short.json`。
