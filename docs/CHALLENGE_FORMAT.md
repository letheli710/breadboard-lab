# 题目文件格式 `breadboard-challenge/1`

Breadboard Lab 的每一节课（lesson）和每一道挑战题（challenge）都是一个 **JSON 文件**。
你可以自己写，也可以让 AI 帮你写（见 [`AI_PROMPT.md`](./AI_PROMPT.md)）。

解析器 `src/core/challenge.ts`（`parseChallenge`）是格式的唯一标准；本文档是它的人类可读版本。
编辑器校验用的 JSON Schema 在 [`schema/challenge.schema.json`](../schema/challenge.schema.json)。

---

## 0. 怎么加载题目

| 方式 | 说明 |
|---|---|
| **放进 `challenges/` 文件夹** | 把 `.json` 文件放到项目根目录的 `challenges/` 里，程序启动时自动加载；开发模式（`npm run dev`）下修改或新增文件会**热更新**（hot reload），不用重启。 |
| **“导入”（Import）按钮** | 在程序里点 **导入**，选择一个或多个 `.json` 文件。 |
| **拖放（drag-and-drop）** | 把 `.json` 文件或**整个文件夹**拖进程序窗口。 |

规则：
- 只读取 `*.json`。文件名以 `_` 开头的文件、以及 `*.schema.json` 会被跳过（可以用来放草稿）。
- 列表按文件名排序，所以建议用两位数字前缀：`01-xxx.json`、`02-xxx.json`……
- `id` 必须全局唯一；id 相同的题目会互相覆盖。
- 写完后运行校验：

```bash
npm run validate              # 校验 ./challenges
npm run validate my-folder    # 校验别的文件夹（递归）或单个文件
```

校验器会：解析文件 → 用目标电路自己跑一遍 tests（检查题目本身是否可解）→ 如果有 `solution`，把它搭到面包板上判分，必须满分 → 如果有 `start`，检查它能正常构建。任何错误都会让退出码为 1。

### 在编辑器里获得自动补全 / 校验

在文件开头加一行 `"$schema"`（程序会忽略这个字段）：

```json
{
  "$schema": "../schema/challenge.schema.json",
  "format": "breadboard-challenge/1",
  ...
}
```

VS Code 等编辑器会据此提示字段名、检查孔位写法等。路径是相对于这个 JSON 文件的。

---

## 1. 面包板与孔位命名（hole naming）

```
        1  2  3  4  5 ...                     30
 tp   ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●     ← 上方 + 电源轨（红线）  整行相通
 tn   ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●     ← 上方 − 电源轨（蓝线）  整行相通

 a    ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  ┐
 b    ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │ 每一列的 a–e 是一条金属条
 c    ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │
 d    ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │
 e    ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  ┘
      ════════════ 中间凹槽 (trench) ════════════
 f    ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  ┐
 g    ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │ 每一列的 f–j 是另一条金属条
 h    ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │
 i    ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │
 j    ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  ┘

 bp   ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●     ← 下方 + 电源轨（红线）
 bn   ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●     ← 下方 − 电源轨（蓝线）
```

- 主区孔位：`<行><列>`，行 `a`–`j`，列 `1`–`30`，例如 `a1`、`e15`、`j30`。
- 电源轨孔位：`tp1`–`tp30`（top positive）、`tn1`–`tn30`（top negative）、`bp1`–`bp30`（bottom positive）、`bn1`–`bn30`（bottom negative）。
- **连通关系**：同一列的 `a–e` 相通；同一列的 `f–j` 相通；`e` 和 `f` 不通（隔着凹槽）；每条电源轨整行相通；上方轨和下方轨**互不相通**。
- **一个孔只能插一只脚**（one leg per hole）。

---

## 2. 顶层字段一览

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `format` | string | ✔ | 必须是 `"breadboard-challenge/1"` |
| `id` | string | ✔ | 唯一 id，只能用字母、数字、`-`、`_`，例如 `"challenge-voltage-divider"` |
| `title` | string | ✔ | 标题 |
| `kind` | `"lesson"` \| `"challenge"` | | 默认 `"challenge"`。lesson = 带步骤引导的课；challenge = 自己解的题 |
| `level` | number 1–5 | | 难度，默认 1（会四舍五入并限制在 1–5） |
| `summary` | string | | 一句话简介，显示在列表里 |
| `description` | string 或 string[] | | 正文讲解。纯文本，用 `\n` 换行；如果是数组，会用换行拼接。支持少量格式：`**粗体**`、以 `- ` 或 `1. ` 开头的列表行 |
| `concepts` | string[] | | 涉及的概念标签，例如 `["series 串联", "KVL"]` |
| `lang` | `"zh"` \| `"en"` | | 上面这些文字字段（以及 steps / hints / tests 的名字）用的语言，默认 `"zh"`（见 §11） |
| `i18n` | object | | 其他语言的翻译，例如 `{ "en": { "title": "..." } }`（见 §11） |
| `components` | array | ✔ | 目标电路里的元件（见 §3） |
| `connections` | array | ✔* | 连接关系（见 §4）。`connections` 和 `nets` 至少要有一个 |
| `nets` | array | ✔* | 带名字的连接关系（见 §4） |
| `tests` | array | | 行为测试（见 §6）。强烈建议写 |
| `hints` | string[] | | 提示，学生卡住时逐条显示 |
| `steps` | array | | 步骤引导，lesson 必备（见 §7） |
| `solution` | layout | | 参考答案在面包板上的摆法（见 §5）。强烈建议写，校验器会用它证明题目可解 |
| `start` | layout | | 题目开始时面包板上已经摆好的东西（例如“找错题”） |
| `options` | object | | `tolerance`、`allowExtraComponents`（见 §8） |
| `$schema` | string | | 仅供编辑器使用，程序忽略 |

未知字段会被忽略。

---

## 3. `components`：目标电路的元件

每个元件是一个对象，属性**直接平铺**写在对象里：

```json
{ "ref": "R1", "type": "resistor", "resistance": "330" }
```

- `ref`：元件名，字母开头，只含字母 / 数字 / `_`，例如 `R1`、`LED1`、`V1`、`SW1`。在同一个文件里不能重复。
- `type`：见下表。
- 其余是属性（props）。**省略某个属性 = 任何值都接受**。也可以写 `"any"`。

### 3.1 元件类型与引脚名（pin names）

| `type` | 中文 | 引脚（terminals） | 可用别名（aliases，不区分大小写） | 属性 |
|---|---|---|---|---|
| `resistor` | 电阻 | `1`, `2` | — | `resistance`（或 `value`） |
| `led` | LED 发光二极管 | `anode`, `cathode` | anode: `a` `+`；cathode: `k` `c` `-` | `color`: `red` `yellow` `green` `blue` `white` |
| `diode` | 二极管 | `anode`, `cathode` | 同 LED | — |
| `capacitor` | 电容 | `1`, `2` | — | `capacitance`（或 `value`） |
| `pushbutton` | 四脚按键 | `1`, `2` | `a`→`1`，`b`→`2` | `pressed`（布尔） |
| `switch` | 单刀双掷拨动开关 SPDT | `a`, `com`, `b` | com: `c` `common` | `position`: `a` \| `b` |
| `potentiometer` | 电位器 | `1`, `2`, `3`（`2` = 滑动端） | `2`: `w` `wiper` | `resistance`（或 `value`）、`wiper` 0–1 |
| `battery` | 电池 | `+`, `-` | +: `pos` `positive` `vcc`；−: `neg` `negative` `gnd` | `variant`: `9V` `2xAA` `3xAA` `4xAA` `CR2032` |
| `bench_supply` | 直流稳压电源 | `+`, `-` | +: `pos` `positive`；−: `neg` `negative` `gnd` `com` | `voltage`、`currentLimit`（安培） |
| `power_module` | 面包板电源模块 | `+`, `-` | +: `pos` `vcc`；−: `neg` `gnd` | `voltage`（5 或 3.3） |
| `dc_source` | 任意直流电源 | `+`, `-` | 同 battery | `voltage` |

说明：
- **`dc_source`** 只能出现在 `components` 里，它可以匹配学生面包板上的**任何**电池 / 稳压电源 / 电源模块（如果写了 `voltage`，电压要一致）。除非这一课就是讲某种特定电源，否则**优先用 `dc_source`**。
- 电池的电压由 `variant` 决定：`9V`=9V、`2xAA`=3V、`3xAA`=4.5V、`4xAA`=6V、`CR2032`=3V。也可以对电池只写 `voltage`（例如 `9`），这样任何 9V 的电池都行。
- 按键的 `1`/`2`、电阻和电容的两脚、电位器的 `1`/`3`、开关的 `a`/`b` 被视为**可互换**（对称），判分时自动尝试两种方向。LED、二极管、电源有极性，方向必须对。

### 3.2 数值写法（values）

数字或带工程前缀的字符串都行：`330`、`"330"`、`"4.7k"`、`"4k7"`、`"1M"`、`"220Ω"`、`"100nF"`、`"10uF"`、`"0.1µF"`、`9`、`"3.3V"`。
前缀：`p n u µ m k K M G`（注意 `m` = 毫，`M` = 兆）。

通用字段 `value` 会根据类型自动解释：电阻 / 电位器 → 电阻值，电容 → 电容值，电源 → 电压。

---

## 4. `connections` / `nets`：谁和谁连在一起

引脚写成 `"REF.pin"`，例如 `"R1.1"`、`"LED1.anode"`、`"V1.+"`、`"S1.com"`。

**`connections`**：每一项是一个节点（node）里所有引脚的数组。

```json
"connections": [
  ["V1.+", "R1.1"],
  ["R1.2", "LED1.anode"],
  ["LED1.cathode", "V1.-"]
]
```

**`nets`**：同样的意思，但可以给节点起名字（会出现在错误提示里，比如“原理图中的 VOUT”）。

```json
"nets": [
  { "name": "VCC",  "pins": ["V1.+", "R1.1"] },
  { "name": "VOUT", "pins": ["R1.2", "R2.1"] },
  { "name": "GND",  "pins": ["R2.2", "V1.-"] }
]
```

- 两者可以同时使用；含有同一个引脚的组会自动合并成一个节点。
- 一个节点至少要有 2 个引脚才有意义。
- **没有列出的引脚 = 不关心（don't care）**：学生把它接在哪里都不算错。例如按键只列了 `SW1.1` 和 `SW1.2`。
- 建议：每个元件的每个引脚都列出来（除非你确实不在乎），否则自检可能和预期不一样（见 §10）。

---

## 5. 布局 `solution` / `start`：元件在面包板上的摆法

```json
"solution": {
  "parts": [
    { "type": "battery", "ref": "BAT1", "variant": "9V", "pins": { "+": "tp1", "-": "tn1" } },
    { "type": "wire", "pins": { "a": "tp5", "b": "a5" }, "color": "red" },
    { "type": "resistor", "ref": "R1", "resistance": "470", "pins": { "1": "c5", "2": "c9" } },
    { "type": "led", "ref": "LED1", "color": "red", "pins": { "anode": "d9", "cathode": "d12" } },
    { "type": "wire", "pins": { "a": "a12", "b": "tn12" }, "color": "blue" }
  ]
}
```

每个 part：
- `type`：上表中除 `dc_source` 以外的类型，外加 **`wire`**（跳线）。注意布局里**不能**用 `dc_source`，要写具体的电源。
- `ref`：可选（不写会自动起名）。布局里的 ref 不需要和 `components` 一致——判分是按拓扑匹配的。但同一个布局里非跳线元件的 ref 不要重复。
- 属性：和 components 一样平铺（`resistance`、`color`、`variant`、`voltage`、`currentLimit`……），或者放在 `"props": { ... }` 里。
- `pins`（两点式元件）或 `at`（占位式元件），见下。

### 5.1 两点式元件（two-point）：写 `pins`

| type | 物理引脚 |
|---|---|
| `wire` | `a`, `b`（可选 `color`） |
| `resistor` | `1`, `2` |
| `led` / `diode` | `anode`, `cathode` |
| `capacitor` | `1`, `2` |
| `battery` / `bench_supply` | `+`, `-` |

布局里的引脚名**不支持别名**，必须用上表的原名。

**跳线颜色**：请使用 `red` / `blue` / `green` / `yellow` / `white` 之一（习惯：红 = +，蓝 = GND）。也可以写 `black` / `orange`，或直接写十六进制颜色如 `"#d62828"`。

### 5.2 占位式元件（footprint）：写 `"at": "<孔>"`

`at` 是锚点孔（anchor），设锚点在第 r 行、第 c 列：

| type | 占用的孔 → 物理引脚 | 说明 |
|---|---|---|
| `pushbutton` | (r, c)→`1a`，(r, c+2)→`2a`，(r+1, c)→`1b`，(r+1, c+2)→`2b` | **推荐 `at` 用 `e` 行**（如 `"e5"`），这样按键横跨凹槽：`1a`=e5、`1b`=f5（第 c 列）是端子 1，`2a`=e7、`2b`=f7（第 c+2 列）是端子 2。`1a/1b`、`2a/2b` 在按键内部永远相通 |
| `switch` | (r, c)→`a`，(r, c+1)→`com`，(r, c+2)→`b` | 同一行连续 3 列 |
| `potentiometer` | (r, c)→`1`，(r, c+1)→`2`，(r, c+2)→`3` | 同一行连续 3 列，中间是滑动端 |
| `power_module` | 第 c 列的 `tpC`→`+t`，`tnC`→`-t`，`bpC`→`+b`，`bnC`→`-b` | `at` 可以是第 c 列的任意孔（如 `"tp1"`）。模块内部把上下两组轨道连起来，所以**上下两组电源轨都有电** |

占位式元件也可以直接写 `pins`（用上面的物理引脚名），但 `at` 更简单。锚点只能是主区的孔（`power_module` 除外），放不下（超出第 30 列或 j 行）会报错。

### 5.3 规则

- 孔位必须存在；**一个孔只能插一只脚**（包括跳线的两端）。
- 两点式元件的两只脚不要插在同一条金属条上（例如 `a5` 和 `d5`），否则它被短路——校验会因为“连接不对”而失败。
- 元件的脚可以直接插电源轨（例如电阻 `"1": "tp5"`）。
- `start` 的格式和 `solution` 完全一样，用来给学生一个起始状态（例如“找错题”）。

---

## 6. `tests`：行为测试

拓扑（连线）全部正确之后，程序会对学生的电路做直流仿真（DC simulation），逐个运行 tests。

```json
"tests": [
  { "name": "松开按键：LED 灭", "set": { "SW1": { "pressed": false } }, "expect": { "LED1": "off" } },
  { "name": "按下按键：LED 亮", "set": { "SW1": { "pressed": true } },  "expect": { "LED1": "on" } },
  { "name": "VOUT ≈ 3V", "voltages": [ { "pin": "R2.1", "ref": "V1.-", "min": 2.85, "max": 3.15 } ] }
]
```

| 字段 | 说明 |
|---|---|
| `name` | 测试名，失败时显示 |
| `set` | 测试前临时修改元件状态：`{ "<ref>": { 属性 } }`。常用：按键 `{"pressed": true}`、开关 `{"position": "b"}`、电位器 `{"wiper": 0.2}`（0 = 靠 1 脚，1 = 靠 3 脚） |
| `expect` | `{ "<LED 的 ref>": "on" \| "off" }`。只有 LED 可以写。电流 > 0.5 mA 算亮 |
| `voltages` | 电压测试数组：`pin` 相对 `ref` 的电压必须在 `[min, max]` 之间（单位 V）。`ref` 省略 = 相对 GND（第一个电源的 − 端）。`min` / `max` 可以只写一个 |

`set`、`expect`、`voltages` 里的 ref 和引脚都是 **`components` 里的名字**（目标电路的名字），程序会自动对应到学生面包板上的元件。

### 仿真模型（写数值时用）

- 只算直流稳态（DC only）。电容 = 断路。
- LED：正向压降 Vf 红 1.8V、黄 2.0V、绿 2.1V、蓝 / 白 3.0V，外加约 12Ω 串联内阻；电流 > 0.5 mA 算“亮”，> 30 mA 过流警告，> 60 mA 烧坏。
- 二极管：Vf ≈ 0.65V，内阻 0.8Ω。
- 电源内阻：9V 电池 1.5Ω；AA 每节 0.15Ω（2xAA 0.3Ω、3xAA 0.45Ω、4xAA 0.6Ω）；CR2032 15Ω；电源模块 0.1Ω；稳压电源 0.02Ω，超过 `currentLimit`（默认 0.1A）进入恒流（CC）模式。
- 按键 / 开关接通电阻 0.02Ω。电位器：1–2 之间 = R × wiper，2–3 之间 = R × (1 − wiper)。

电压范围别卡太死：留出 ±5% 左右的余量（电源内阻、元件容差）。

---

## 7. `steps`：步骤引导（lesson 用）

每一步可以是字符串，或带高亮孔位的对象：

```json
"steps": [
  "先观察面包板：上下各有两条电源轨。",
  { "text": "电池红线接 tp1，黑线接 tn1。", "highlight": ["tp1", "tn1"] },
  { "text": "电阻插在 c5 和 c9 之间。", "highlight": ["c5", "c9"] }
]
```

`highlight` 里写孔位，程序会在 3D 面包板上把这些孔标亮。可以高亮一整条金属条（比如 `["a5","b5","c5","d5","e5"]`）来说明“这些孔是相通的”。

---

## 8. `options`

| 字段 | 默认 | 说明 |
|---|---|---|
| `tolerance` | `0.05` | 元件数值的相对容差（0.05 = ±5%）。例如要求 330Ω，则 313.5–346.5Ω 都算对 |
| `allowExtraComponents` | `false` | `false`：学生面包板上多出来的元件算错误；`true`：允许多余元件 |

---

## 9. 判分是怎么做的（matching）

1. 学生的面包板被转换成**网表**（netlist）：哪些引脚通过金属条 / 跳线连成了同一个节点。
2. 判分是**拓扑匹配**（topological）：**位置无所谓**，只看连接关系。电阻插在第 5 列还是第 20 列、用不用跳线、走上方轨还是下方轨，都不影响结果——只要该连的连上、不该连的没连。
3. 程序会自动寻找“目标元件 ↔ 学生元件”的最佳对应（同类型；`dc_source` 对应任意电源），对称元件会尝试两个方向。
4. 然后报告差异：
   - 缺少元件 / 元件参数不对（超出 `tolerance`）；
   - **多出元件**（除非 `allowExtraComponents: true`）；跳线不算元件；
   - LED / 二极管 / 电源**接反**；
   - **断开了**：目标里同一节点的引脚，在学生电路里分散在不同节点；
   - **多连了 / 短路**：目标里不同节点的引脚被连到了一起；
   - 目标里**没有列出的引脚不检查**（don't care）。
5. 只有拓扑完全正确时才运行 `tests`；全部通过 = 完成。

---

## 10. 注意事项与已知限制

- 一个电路里最好只有**一个电源**（GND 取第一个电源的 − 端）。
- `set` 里的 `position`（开关）和 `wiper`（电位器）是按**目标电路的引脚名**理解的。由于 `a`/`b`、`1`/`3` 在拓扑匹配时可互换，学生如果镜像接线（比如红灯接在 b 侧），连线判对但测试可能失败。所以题目描述里要**写清楚**哪个灯接哪一侧、电源接电位器哪只脚。
- 目标电路自检时，**没有列出的引脚会被当作接在 GND 上**。因此像“电位器只用 1、2 脚”这样的写法，自检结果可能和真实电路不一样——要么把 3 脚也列进某个节点（例如和 2 脚连在一起），要么不要依赖它的测试。
- 题目里的 LED 都要有限流，保证电流 ≤ 25 mA（校验器会对超过 25 mA 给出警告，超过 60 mA 报错）。

---

## 11. 多语言：`lang` 与 `i18n`（translations）

程序界面可以切换中文 / English。题目文件的文字也可以带翻译：

- **`lang`**：顶层文字字段（`title`、`summary`、`description`、`concepts`、`steps`、`hints`、tests 的 `name`）是用哪种语言写的。可选 `"zh"` / `"en"`，**默认 `"zh"`**。用英文写题目时请加上 `"lang": "en"`。
- **`i18n`**：其他语言的翻译，按语言分组：`{ "en": { ... } }` 或 `{ "zh": { ... } }`。界面是哪种语言，就用哪一组覆盖顶层文字。

`i18n.<lang>` 里可以写的字段（都可选）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `title` | string | 标题 |
| `summary` | string | 一句话简介 |
| `description` | string 或 string[] | 正文，规则同顶层 |
| `concepts` | string[] | 概念标签（可以和顶层数量不同） |
| `steps` | string[] | **只写文字**，和顶层 `steps` **按位置一一对应、数量相同**。高亮孔位（`highlight`）沿用顶层 steps，不用重复写 |
| `hints` | string[] | 和顶层 `hints` 按位置一一对应、数量相同 |
| `tests` | string[] | **只写测试名**，和顶层 `tests` 按位置一一对应（`set` / `expect` / `voltages` 不用重复写） |

回退规则（fallback）：
- 缺少的字段一律用顶层（基础语言）的文字。例如只翻译了 `title` 和 `summary`，正文就还是原文。
- 界面语言和 `lang` 相同时，`i18n` 不起作用。
- `steps` / `hints` / `tests` 是**按位置**对应的：第 1 条翻译对应第 1 条原文。数组长度和顶层不一致时校验器会给出警告；其中 `hints` 长度不一致时整组翻译会被忽略（仍显示原文）。
- 只翻译文字。元件、连接、测试条件、答案布局等都只写一次，和语言无关。

例子（中文为基础语言，附英文翻译）：

```json
{
  "format": "breadboard-challenge/1",
  "id": "example-led",
  "title": "示例 · 点亮 LED",
  "summary": "+5V → 220Ω → LED → GND。",
  "description": "LED 有方向：长脚（anode）接 + 那一侧。",
  "concepts": ["polarity 极性"],
  "i18n": {
    "en": {
      "title": "Example · Light an LED",
      "summary": "+5V → 220Ω → LED → GND.",
      "description": "An LED has a direction: the long lead (anode) goes toward the + side.",
      "concepts": ["polarity"],
      "steps": ["Plug the power module into column 1.", "Resistor from tp5 to b5; LED long lead c5, short lead c8."],
      "hints": ["Long lead toward +, short lead toward GND."],
      "tests": ["LED is on"]
    }
  },
  "components": [ ... ],
  "tests": [{ "name": "LED 亮", "expect": { "LED1": "on" } }],
  "steps": [
    { "text": "电源模块插在第 1 列。", "highlight": ["tp1", "tn1", "bp1", "bn1"] },
    { "text": "电阻 tp5 – b5；LED 长脚 c5、短脚 c8。", "highlight": ["tp5", "b5", "c5", "c8"] }
  ],
  "hints": ["长脚朝 +，短脚朝 GND。"]
}
```

反过来，用英文写的题目加 `"lang": "en"`，再在 `"i18n": { "zh": { ... } }` 里放中文翻译即可。
建议把 `i18n` 放在 `description` / `concepts` 后面、`components` 前面，方便对照。内置的 `challenges/*.json` 都带有英文翻译，可以参考。

---

## 12. 完整示例

一个带按键、有名字节点、带步骤和答案的完整 lesson：

```json
{
  "$schema": "../schema/challenge.schema.json",
  "format": "breadboard-challenge/1",
  "id": "example-button-led",
  "title": "示例 · 按键点灯",
  "kind": "lesson",
  "level": 2,
  "summary": "按下按键，LED 亮。",
  "concepts": ["push button", "current-limiting resistor 限流电阻"],
  "description": "+5V 经过按键、220Ω 电阻和红色 LED 回到 GND。\n按键横跨中间凹槽，左边一列是输入，右边一列是输出。",
  "components": [
    { "ref": "V1", "type": "dc_source", "voltage": 5 },
    { "ref": "SW1", "type": "pushbutton" },
    { "ref": "R1", "type": "resistor", "resistance": "220" },
    { "ref": "LED1", "type": "led", "color": "red" }
  ],
  "nets": [
    { "name": "VCC", "pins": ["V1.+", "SW1.1"] },
    { "name": "SWOUT", "pins": ["SW1.2", "R1.1"] },
    { "pins": ["R1.2", "LED1.anode"] },
    { "name": "GND", "pins": ["LED1.cathode", "V1.-"] }
  ],
  "tests": [
    { "name": "松开：灭", "set": { "SW1": { "pressed": false } }, "expect": { "LED1": "off" } },
    {
      "name": "按下：亮，SWOUT≈5V",
      "set": { "SW1": { "pressed": true } },
      "expect": { "LED1": "on" },
      "voltages": [{ "pin": "SW1.2", "min": 4.8, "max": 5.05 }]
    }
  ],
  "steps": [
    { "text": "电源模块插在第 1 列，上下轨道都有 5V。", "highlight": ["tp1", "tn1", "bp1", "bn1"] },
    { "text": "红色跳线 tp5 → a5。", "highlight": ["tp5", "a5"] },
    { "text": "按键放在 e5，横跨凹槽。", "highlight": ["e5", "e7", "f5", "f7"] },
    { "text": "电阻 h7 – h11，LED 长脚 i11、短脚 i14。", "highlight": ["h7", "h11", "i11", "i14"] },
    { "text": "蓝色跳线 j14 → bn14。", "highlight": ["j14", "bn14"] }
  ],
  "hints": ["按键要横跨中间凹槽。"],
  "solution": {
    "parts": [
      { "type": "power_module", "ref": "PM1", "voltage": 5, "at": "tp1" },
      { "type": "wire", "pins": { "a": "tp5", "b": "a5" }, "color": "red" },
      { "type": "pushbutton", "ref": "SW1", "at": "e5" },
      { "type": "resistor", "ref": "R1", "resistance": "220", "pins": { "1": "h7", "2": "h11" } },
      { "type": "led", "ref": "LED1", "color": "red", "pins": { "anode": "i11", "cathode": "i14" } },
      { "type": "wire", "pins": { "a": "j14", "b": "bn14" }, "color": "blue" }
    ]
  },
  "options": { "tolerance": 0.05, "allowExtraComponents": false }
}
```

更多例子见 `challenges/` 文件夹里的内置课程。
