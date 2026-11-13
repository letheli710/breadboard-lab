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

校验器会：解析文件 → 用目标电路自己跑一遍 tests（检查题目本身是否可解）→ 如果有 `solution`，把它搭到面包板上判分，必须满分，而且不能触发任何“错误”级的实时诊断（否则界面不会判对）→ 如果有 `start`，检查它能正常构建。任何错误都会让退出码为 1。

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
| `phase` | `1` \| `2` \| `3` \| `4` \| `5` | | 属于课程第几期（见 [`ROADMAP.md`](./ROADMAP.md)）：1 基本定律与等效变换，2 分析方法 / 定理 / 运放，3 暂态，4 交流，5 单片机外围电路（§14，文件名 `280-…`–`299-…`）。省略 = 原来的入门题。挑战列表按期分组显示（“入门 / 第1期 / …”）。约定文件名：第 1 期 `201-…`–`219-…`，第 2 期 `221-…`–`239-…`，以此类推 |
| `summary` | string | | 一句话简介，显示在列表里 |
| `description` | string 或 string[] | | 正文讲解。纯文本，用 `\n` 换行；如果是数组，会用换行拼接。支持少量格式：`**粗体**`、以 `- ` 或 `1. ` 开头的列表行。实验题按 [`NOTATION.md`](./NOTATION.md) §8 的段落结构写（目标 / 电路 / 先预测 / 测量 / 对比），用语和符号见 NOTATION.md（“结点”、u/U、cos 参考；挑战文字不支持下标） |
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
| `inductor` | 电感 | `1`, `2` | — | `inductance`（或 `value`），如 `"10m"`、`"10mH"` |
| `ammeter` | 电流表（万用表 A 档） | `+`（红表笔，电流流入）, `-`（黑表笔 COM） | +: `red` `pos` `in`；−: `com` `black` `neg` `out` | — |
| `opamp` | 运放 LM358（双运放 DIP-8） | `outA`, `inA-`, `inA+`, `v-`, `inB+`, `inB-`, `outB`, `v+` | 见 §13.2 | — |
| `function_gen` | 信号发生器 | `+`（红，信号）, `-`（黑，COM） | +: `out` `sig` `red`；−: `com` `gnd` `black` | `waveform`: `sine` `square` `triangle`；`frequency`（Hz）；`amplitude`（峰值 V）；`offset`（V） |
| `esp32_devkit` / `stm32_bluepill` / `mcu` | 单片机开发板（`mcu` = 两种都行） | 电源脚 `3V3` `5V` `GND` `EN`（Blue Pill 叫 `NRST`），GPIO 用**逻辑引脚** `GPIO_OUT1`、`GPIO_IN1`、`ADC1`、`PWM1`、`GPIO_FT1`、`IO1`（或物理引脚 `GPIO2`、`PA0`） | 见 §14.2 | `modes`（引脚模式）、`usb` |
| `npn` | NPN 三极管 2N2222（TO-92） | `e`, `b`, `c` | `emitter` `base` `collector` | `beta`（默认 150） |
| `nmos` | N-MOSFET（TO-220） | `g`, `d`, `s` | `gate` `drain` `source` | `model`: `IRLZ44N`（逻辑电平）\| `IRF540N` |
| `relay` | 5 V 继电器 | `coil1`, `coil2`, `com`, `nc`, `no` | `coil+`/`a1`→coil1，`coil-`/`a2`→coil2，`common`→com | — |
| `motor` | 直流电机 | `+`, `-` | `pos` `red` / `neg` `black` | — |
| `buzzer` | 有源蜂鸣器 | `+`, `-` | `long` / `short` | — |
| `ldo` | LDO 稳压器 LM1117 | `gnd`, `out`, `in` | `1`/`adj`→gnd，`2`/`vout`→out，`3`/`vin`→in | `voltage`（3.3 或 5） |
| `ldr` | 光敏电阻 | `1`, `2` | — | `lux` |
| `ntc` | NTC 热敏电阻 10k | `1`, `2` | — | `temperature`（°C） |

说明：
- **`dc_source`** 只能出现在 `components` 里，它可以匹配学生面包板上的**任何**电池 / 稳压电源 / 电源模块（如果写了 `voltage`，电压要一致）。除非这一课就是讲某种特定电源，否则**优先用 `dc_source`**。
- 电池的电压由 `variant` 决定：`9V`=9V、`2xAA`=3V、`3xAA`=4.5V、`4xAA`=6V、`CR2032`=3V。也可以对电池只写 `voltage`（例如 `9`），这样任何 9V 的电池都行。
- 按键的 `1`/`2`、电阻、电容和电感的两脚、电位器的 `1`/`3`、开关的 `a`/`b` 被视为**可互换**（对称），判分时自动尝试两种方向。LED、二极管、电源、电流表、信号发生器有极性，方向必须对。运放的 A、B 两半可互换（见 §13.2）。
- **`scope_probe`（示波器探头）不能写进 `components`**：它是测量工具，用 tests 里的 `"scope"` 测量（§13.4）。

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
| `inductor` | `1`, `2` |
| `ammeter` / `function_gen` | `+`, `-` |
| `scope_probe` | `tip`, `gnd`（可选 `channel`: 1 或 2） |

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
| `opamp` | `at` 必须在 **e 行**：(e, c..c+3) → 物理脚 `1` `2` `3` `4`；(f, c..c+3) → `8` `7` `6` `5` | 例如 `"at": "e10"`：1=e10（OUT A）、2=e11（IN− A）、3=e12（IN+ A）、4=e13（V−）、8=f10（V+）、7=f11（OUT B）、6=f12（IN− B）、5=f13（IN+ B）。芯片横跨凹槽，每只脚独占一列金属条 |

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
| `voltages` | 电压测试数组：`pin` 相对 `ref` 的电压必须在 `[min, max]` 之间（单位 V）。`ref` 省略 = 相对 GND（第一个电源的 − 端）。`min` / `max` 可以只写一个。有信号发生器时取**平均值**（万用表直流档读数） |
| `currents` | 电流测试数组（§13.3）：`{ "el": "AM1", "mode"?: "dc" \| "rms", "min", "max" }`，单位 A |
| `scope` | 示波器测量数组（§13.4）：`{ "pin", "ref"?, "measure", "vs"?, "min", "max" }` |

`set`、`expect`、`voltages` 里的 ref 和引脚都是 **`components` 里的名字**（目标电路的名字），程序会自动对应到学生面包板上的元件。

### 仿真模型（写数值时用）

- 没有信号发生器时只算直流稳态（DC）：电容 = 断路，电感 = 1 Ω。有信号发生器时见 §13。
- LED：正向压降 Vf 红 1.8V、黄 2.0V、绿 2.1V、蓝 / 白 3.0V，外加约 12Ω 串联内阻；电流 > 0.5 mA 算“亮”，> 30 mA 过流警告，> 60 mA 烧坏。
- 二极管：Vf ≈ 0.65V，内阻 0.8Ω。
- 电源内阻：9V 电池 1.5Ω；AA 每节 0.15Ω（2xAA 0.3Ω、3xAA 0.45Ω、4xAA 0.6Ω）；CR2032 15Ω；电源模块 0.1Ω；稳压电源 0.02Ω，超过 `currentLimit`（默认 0.1A）进入恒流（CC）模式。
- 按键 / 开关接通电阻 0.02Ω。电位器：1–2 之间 = R × wiper，2–3 之间 = R × (1 − wiper)。
- 电感线圈电阻 1 Ω；电流表内阻 0.1 Ω；信号发生器输出电阻 50 Ω；运放见 §13.2。

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
6. 测量工具：学生板上的示波器探头**永远忽略**；如果目标电路里**没有**电流表，学生的电流表被当作一根导线（见 §13.3）。

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

---

## 13. 交流、运放与仪器（stage C）

板上一旦有**信号发生器**（`function_gen`），电路就在时域里仿真（`src/core/transient.ts`），直到进入稳定的周期状态，然后用最后 2 个周期做测量。没有信号发生器时一切照旧（直流）。

### 13.1 信号发生器 `function_gen`

- 引脚 `+`（红，信号）和 `-`（黑，COM）。黑夹子一般接 GND。只有信号发生器、没有直流电源时，它的 `-` 就是 GND。
- 属性：`waveform`（`sine` / `square` / `triangle`，默认 `sine`）、`frequency`（Hz，默认 1000，可写 `"1k"`、`"1kHz"`）、`amplitude`（**峰值** V，默认 1；Vpp = 2 × amplitude）、`offset`（直流偏置 V，默认 0，可以为负）。
- 模型：理想波形源串联 50 Ω。直流（没有时域仿真时）= `offset` 串 50 Ω。
- 波形从 t = 0 开始：正弦从偏置值向上过零；方波在 t = 0 上升，前半周期为高。
- `components` 里写了的属性会被当作要求（例如要求学生把频率调到 1 kHz）；**一般不写**，而是在每个 test 的 `set` 里设定：`"set": { "FG1": { "waveform": "sine", "frequency": 1000, "amplitude": 0.5 } }`。
- 多个信号发生器时，第一个决定时间基准，其他的频率最好是它的整数倍。

### 13.2 运放 `opamp`（LM358）

- 一个 `opamp` 元件 = 整颗 LM358 芯片（两个运放 A、B，共用电源脚）。逻辑引脚：`outA` `inA-` `inA+` `v-` `inB+` `inB-` `outB` `v+`。
- 别名（不区分大小写）：物理脚号 `1`–`8`；`out1/in1-/in1+`、`out2/in2-/in2+`；只用一个运放时可写 `out`、`in-`、`in+`（= A 半）；`v+`: `vcc` `vdd`；`v-`: `vee` `vss` `gnd`。
- **判分**：A、B 两半可以互换——题目写的是 A 半，学生用 B 半也算对（电源脚共用）。没用到的那一半的引脚不写 = 不检查。另外会识别两种常见错误并直接指出：芯片插反（转了 180°）、IN+ 和 IN− 接反。
- 模型：开环增益 1e5，输出电阻 10 Ω，输出限制在 [V(v−), V(v+) − 1.5 V]（超出就削顶）；V+ 与 V− 之间小于 3 V 视为没通电（输出约等于 V−）；输入不取电流；没有压摆率 / 带宽限制。
- 单电源（9 V + GND）放大交流信号时，要给信号加偏置（`offset`），或者用分压电阻给 IN+ 偏置，否则负半周会被削掉。
- 双电源：用两个电源串联（例如两个 `dc_source` 9 V：V1.- 和 V2.+ 接 GND，V2.- 接运放 `v-`）。GND 仍然是第一个电源的 − 端。

### 13.3 电流表 `ammeter` 与电流测试 `currents`

- 电流表引脚 `+`（红）和 `-`（黑 COM），内阻 0.1 Ω；读数 = 从 `+` 流进、从 `-` 流出的电流（反接读数为负）。
- **判分规则（教学考虑）**：
  - 目标电路**没写**电流表：学生板上的电流表被当成一根导线。所以学生为了“看看电流”而串联一个电流表，不会被判错；但把电流表**并联**在元件或电源两端（经典错误）会把两点短接，判为“多连了”，并附带说明“电流表要串联”。
  - 目标电路**写了**电流表：它和其他元件一样必须一一对应地接对（包括方向，反接会提示“表笔接反”）。
  - 示波器探头无论如何都被忽略。
- `currents` 测试（单位 A）：

```json
"currents": [
  { "el": "AM1", "min": 0.0095, "max": 0.0105 },
  { "el": "R2", "mode": "rms", "min": 0.0006, "max": 0.0008 }
]
```

| 字段 | 说明 |
|---|---|
| `el` | 元件 ref（也可写 `meter`）。可用：`ammeter`（读数）、`resistor` / `inductor`（从 1 脚流向 2 脚）、`led` / `diode`（正极 → 负极）、电源和信号发生器（从 `+` 流出） |
| `mode` | `"dc"`（默认）：直流电流；有信号发生器时为平均值（万用表直流档）。`"rms"`：有效值（真有效值） |
| `min` / `max` | 范围，可以只写一个 |

不需要学生真的放电流表：`"el": "R2"` 直接测流过 R2 的电流。只有题目要练习“怎么接电流表”时才把 `ammeter` 写进 `components`。

### 13.4 示波器测量 `scope`

学生板上的示波器探头（`scope_probe`，`tip` + `gnd`，CH1 / CH2）只用来观察；判分用 tests 里的 `scope`，它直接测引脚电压，不需要学生放探头：

```json
"scope": [
  { "pin": "C1.1", "measure": "vpp", "min": 1.3, "max": 1.5 },
  { "pin": "C1.1", "measure": "phase", "vs": "FG1.+", "min": -48, "max": -42 },
  { "pin": "C1.1", "measure": "gain", "vs": "FG1.+", "min": 0.68, "max": 0.73 },
  { "pin": "U1.out", "ref": "V1.-", "measure": "vmax", "max": 7.6 }
]
```

| 字段 | 说明 |
|---|---|
| `pin` | 被测引脚 `"REF.pin"` |
| `ref` | 参考引脚，省略 = GND。测的是 V(pin) − V(ref) |
| `measure` | `vpp` 峰峰值；`vmax` / `vmin` 最大 / 最小值；`vavg` 平均值；`vrms` 有效值（含直流分量）；`freq` 频率（Hz，用过均值点计算）；`phase` 相位差（度，−180 ~ 180，**正数 = pin 超前 vs**，用基波计算，方波也适用）；`gain` 基波幅度之比 \|pin\| / \|vs\| |
| `vs` | `phase` 和 `gain` 必填：用来比较的引脚（同样相对 `ref`） |
| `vsref` | 可选：`vs` 信号的参考引脚，省略 = 和 `ref` 相同。比较的是 V(pin) − V(ref) 和 V(vs) − V(vsref)，用来比较两个“浮地”的电压，例如串联 RL 里电感电压和电阻电压：`{ "pin": "L1.1", "ref": "L1.2", "measure": "phase", "vs": "R1.1", "vsref": "R1.2", "min": 85, "max": 91 }`（V_L 超前 V_R 约 90°） |
| `min` / `max` | 范围（V、Hz、度或倍数），至少写一个 |

小贴士：
- 测滤波器时用 `"vs": "FG1.+"`（信号发生器的输出端）而不是固定幅度，这样 50 Ω 输出电阻的影响会自动抵消。
- RC 低通在截止频率 fc = 1/(2πRC) 处：`gain` ≈ 0.707、`phase` ≈ −45°；高通：+45°。
- 范围留 ±3–5% 余量（相位留 ±3°）。
- 有信号发生器时，`expect` 的 LED 亮 / 灭按**平均电流**（> 0.5 mA 算亮）判断。

### 13.5 完整例子

见 `src/core/fixtures/rc-lowpass-scope.json`（RC 低通，测增益、相位、频率）和 `src/core/fixtures/opamp-noninverting.json`（LM358 同相放大，单电源 + 偏置，测 Vpp、相位、平均电压、电阻电流和削顶；参考答案用的是 B 半，还串了一个电流表——都能判对）。可以用 `npm run validate src/core/fixtures` 校验。

---

## 14. 单片机外围电路（phase 5）

第 5 期教的是单片机项目的**电路部分**：引脚电流、3.3 V 和 5 V、上拉 / 下拉、三极管和 MOSFET 开关、续流二极管、稳压器、ADC 分压、PWM + RC 滤波。**这里没有程序**：开发板的每个 GPIO 有一个**模式**（mode），模式就是“程序”。模型细节见 [`ROADMAP.md`](./ROADMAP.md) 的 “Phase 5 contract”，代码在 `src/core/mcu.ts`、`src/core/devices.ts`。

### 14.1 开发板

| | `esp32_devkit`（ESP32-DevKitC，38 针） | `stm32_bluepill`（STM32F103C8T6，40 针） |
|---|---|---|
| 摆放（`at`） | 左上角 GND 脚所在的孔，必须在 **b 行**；占 19 列，上排针在 b 行、下排针在 i 行（a、j 行每个引脚留一个空孔） | 左上角 GND 脚，必须在 **c 行**；占 20 列，上排 c 行、下排 g 行 |
| 上排（左→右） | GND, GPIO23, GPIO22, GPIO1(TX), GPIO3(RX), GPIO21, GND, GPIO19, GPIO18, GPIO5, GPIO17, GPIO16, GPIO4, GPIO0, GPIO2, GPIO15, GPIO8, GPIO7, GPIO6 | GND, GND, 3V3, NRST, PB11, PB10, PB1, PB0, PA7, PA6, PA5, PA4, PA3, PA2, PA1, PA0, PC15, PC14, PC13, VBAT |
| 下排（左→右） | 3V3, EN, GPIO36(VP), GPIO39(VN), GPIO34, GPIO35, GPIO32, GPIO33, GPIO25, GPIO26, GPIO27, GPIO14, GPIO12, GND, GPIO13, GPIO9, GPIO10, GPIO11, 5V | PB12, PB13, PB14, PB15, PA8, PA9, PA10, PA11, PA12, PA15, PB3, PB4, PB5, PB6, PB7, PB8, PB9, 5V, GND, 3V3 |
| 逻辑电平 | 3.3 V；VIL ≤ 0.825 V，VIH ≥ 2.475 V | 3.3 V；VIL ≤ 1.16 V，VIH ≥ 2.15 V |
| 输出 | 25 Ω 接到 3V3 / GND；建议 ≤ 20 mA，> 40 mA 引脚损坏 | 40 Ω；建议 ≤ 20 mA（PC13–15 ≤ 3 mA），> 25 mA 损坏 |
| 内部上下拉 | 45 kΩ；GPIO34–39 **没有** | 40 kΩ |
| 只能输入 | GPIO34, 35, 36, 39 | — |
| ADC（12 位，0–3.3 V） | ADC1：GPIO32–39（ADC2 引脚能用，但开 Wi-Fi 时不行，会给提示） | PA0–PA7, PB0, PB1 |
| 耐 5 V | 没有 | FT 引脚：PA8–PA15、PB3、PB4、PB6–PB15 |
| 不要用 | GPIO6–11（接板载 Flash） | — |
| 供电 | `usb: true`（默认）= 插着 USB：5 V →肖特基二极管→ 5V 脚（约 4.7 V）→ AMS1117（压差 1.1 V，最多 1 A）→ 3V3；芯片本身约 50 mA | 同上，板载 LDO 压差 0.25 V、最多 300 mA；芯片约 20 mA；PC13 上有板载 LED（引脚输出低电平时亮） |

`usb: false` 时板子要从面包板供电（5V 脚接 5 V，或 3V3 脚接 3.3 V）；3V3 和 5V 脚也可以给面包板供电。3V3 低于约 2.5 V（STM32 2.0 V）或 EN / NRST 被拉低时芯片不工作，所有引脚变成高阻。

### 14.2 逻辑引脚与匹配规则（matching rule）

目标电路里的开发板引脚可以写：
- **电源脚**：`3V3`、`5V`、`GND`、`EN`（`NRST` 等价）——按名字对应学生板子上的同名脚（多个 GND 脚在板上是连通的）。
- **逻辑引脚**（推荐）：`<角色><编号>`，学生用**任何一个**有这种能力的空闲 GPIO 都算对：

| 逻辑引脚 | 能匹配的物理引脚 |
|---|---|
| `GPIO_OUT1`、`GPIO_OUT2`… | 能输出的 GPIO（ESP32 不含 34–39 和 6–11） |
| `PWM1`… | 能输出 PWM 的 GPIO（ESP32 全部输出脚；STM32 PA0–3、PA6–11、PB0、PB1、PB6–9） |
| `GPIO_IN1`… | 任何 GPIO（包括只能输入的脚） |
| `ADC1`… | ADC 引脚（ESP32 只算 ADC1：GPIO32–39；STM32 PA0–7、PB0、PB1） |
| `GPIO_FT1`… | 耐 5 V 的引脚（只有 STM32 的 FT 引脚） |
| `IO1`… | 任何能输入也能输出的 GPIO |

- **物理引脚**：`GPIO2`、`PA0` 等，只匹配那一个脚（别名：`D2`/`IO2`/`2` → `GPIO2`，`A0` → `PA0`，`VIN` → `5V`，`3.3V` → `3V3`，`G` → `GND`）。

判分时，每个逻辑引脚对应到学生实际接线的那个物理引脚（它所在的节点上有目标电路里和它相连的其他引脚）。编号不同的逻辑引脚必须用不同的物理引脚。如果学生接的是一个没有这种能力的脚（例如用 GPIO34 当输出），会提示“GPIO34 不能当 GPIO_OUT1 用（只能输入）”。`type: "mcu"` 匹配任意一种开发板（只能用电源脚和逻辑引脚）。

### 14.3 引脚模式 `modes`

```json
{ "ref": "U1", "type": "esp32_devkit", "modes": { "GPIO_OUT1": "out_high", "PWM1": { "mode": "pwm", "duty": 25, "frequency": 1000 } } }
```

模式：`out_high`（输出高）、`out_low`（输出低）、`input`（浮空输入）、`input_pullup`（输入 + 内部上拉）、`input_pulldown`（输入 + 内部下拉）、`pwm`（`duty` 0–100 %，默认 50；`frequency` Hz，默认 1000）、`adc`（模拟输入）。没写的引脚是 `input`。输出模式（`out_high` / `out_low` / `pwm`）可以加 `"openDrain": true`（开漏）：输出“高”时只是松开引脚，要靠上拉电阻拉高——I²C 总线就是这样，可以配合示波器的 `rise` 测上拉电阻 × 总线电容决定的上升时间（约 2.2·R·C），例如 `{ "mode": "pwm", "duty": 50, "frequency": 100000, "openDrain": true }`。引脚不支持的模式会报错（例如 GPIO34 的 `out_high`）。

- 写在**目标电路**里的模式是答案的一部分：学生必须在属性里把对应的引脚设成同样的模式（PWM 的占空比相差 ≤ 1 %、频率在 `tolerance` 内）。如果模式不是考点，就不要写在目标里，而是在每个 test 的 `set` 里设置。
- 目标里没写模式的逻辑引脚，自检时按默认模式仿真：`GPIO_OUT` → `out_low`，`PWM` → `pwm`，`ADC` → `adc`，其他 → `input`。
- `set` 里改模式：`"set": { "U1": { "modes": { "GPIO_OUT1": "out_low" } } }`（会翻译成学生实际用的物理引脚；只改列出的引脚）。也可以 `"usb": false` 拔掉 USB。
- 参考答案 `solution` 里的开发板写 `"at"` 和 `"props": { "usb": true, "modes": { "GPIO2": "out_high" } }`——这里必须用物理引脚名，并且必须放在 `props` 里（布局元件顶层的 `pins` 是孔位）。
- 在 `components` 和 `set` 里 `pins` 是 `modes` 的别名。

### 14.4 新器件的模型（写数值时用）

| 器件 | 模型 |
|---|---|
| `npn` | BE 结 0.65 V + 20 Ω；放大区 Ic = β·Ib（β 默认 150）；饱和 Vce = 0.15 V + 1 Ω × Ic；C–E 击穿 40 V；Ic 最大 600 mA，功耗 625 mW |
| `nmos` | IRLZ44N：Vth 1.5 V，Rds(on) 22 mΩ @ 5 V（3.3 V 栅压时 ≈ 43 mΩ）；IRF540N：Vth 3 V，44 mΩ @ 10 V（3.3 V 栅压时几乎不导通）。Id = min(K·Vov·Vds, K·Vov²/2)；栅极不取电流；体二极管 S→D |
| `relay` | 线圈 70 Ω + 150 mH；电流 ≥ 53 mA 吸合，< 7 mA 释放；触点 0.05 Ω |
| `motor` | 8 Ω + 2 mH（不考虑反电动势）；电流 ≥ 0.1 A 算“转动” |
| `buzzer` | 1.0 V + 140 Ω（5 V 时约 28 mA）；≥ 2.5 V 才响 |
| `ldo` | 稳压 / 压差（1.1 V + 0.2 Ω）/ 限流 800 mA / 关断；静态电流 5 mA |
| `ldr` | R = 15 kΩ × (lux / 10)^−0.7，限制在 100 Ω – 1 MΩ（0 lux = 1 MΩ） |
| `ntc` | R = 10 kΩ × exp(3950 × (1/T − 1/298.15))，T = 温度 + 273.15 |
| GPIO | 见 §14.1；输入的“浮空” = 直流下到任何东西的阻抗 > 50 MΩ |

### 14.5 新的测试项

```json
{
  "name": "按下：读到低电平",
  "set": { "SW1": { "pressed": true }, "LDR1": { "lux": 1000 } },
  "expect": { "LED1": "on", "K1": "on", "M1": "off", "BZ1": "on" },
  "gpio": [
    { "pin": "U1.GPIO_IN1", "read": "low" },
    { "pin": "U1.ADC1", "measure": "adc", "min": 1900, "max": 2200 },
    { "pin": "U1.ADC1", "measure": "adc_v", "min": 1.5, "max": 1.8 },
    { "pin": "U1.GPIO_OUT1", "measure": "current", "min": 0.004, "max": 0.008 },
    { "pin": "U1.GPIO_OUT1", "measure": "voltage", "min": 3.0, "max": 3.3 }
  ],
  "regions": { "Q1": "saturation", "Q2": "ohmic" },
  "currents": [{ "el": "K1", "min": 0.06, "max": 0.075 }]
}
```

- `expect` 现在也可以写继电器（`on` = 吸合）、电机（`on` = 转动）、蜂鸣器（`on` = 响）。
- `gpio`：`read` 是数字输入读到的电平 `high` / `low` / `floating`；`measure` 是 `voltage`（相对开发板 GND，V）、`current`（从引脚的输出级 / 内部上下拉流出的电流，A，负数 = 灌入）、`adc`（12 位原始值 0–4095）、`adc_v`（ADC 电压）。
- 示波器 `scope` 新增 `measure`: `rise`（10%→90% 上升时间，秒）、`fall`（90%→10% 下降时间）。
- `regions`：`npn` 是 `cutoff` / `active` / `saturation`；`nmos` 是 `off`（也可写 `cutoff`）/ `ohmic` / `saturation`。注意 MOSFET 的 `saturation` 是“恒流区”（没有完全导通），当开关用时应该是 `ohmic`。
- `currents` 新增：`npn`（集电极电流）、`nmos`（漏极电流）、`relay`（线圈电流）、`motor`、`buzzer`、`ldo`（输出电流）、`ldr`、`ntc`。
- 有引脚在 `pwm` 模式时，电路按时域仿真（和信号发生器一样，示波器 `scope` 测量可用）：`voltages`、`currents`、`gpio` 的 `voltage` / `current` 取**平均值**；`read`、`adc`、`regions` 用直流模型（PWM 按平均值，即 duty × 3.3 V 接在 25 Ω 后面）。
- 校验器额外检查：参考答案在任何测试状态下都不能烧坏引脚、不能过压、三极管不能击穿；超过建议电流会给警告。

### 14.6 诊断（学生搭电路时实时提示）

引脚过流（> 建议值警告，> 绝对最大值“引脚损坏”）、非 5 V 耐受引脚过压 / 负电压（保护二极管电流）、ADC 超过 3.3 V、浮空输入 / MOSFET 栅极浮空、输出接在电源上、两个输出打架、只能输入的脚当输出、GPIO6–11、ADC2、串口脚、稳压器过流 / 压差不够、USB 过载、欠压复位、线圈 / 电机没有续流二极管、时域仿真中的反电动势击穿、三极管没饱和、MOSFET 没完全导通、LDO 缺输出电容。

### 14.7 完整例子

见 `src/core/fixtures/mcu-gpio-led.json`（ESP32 任意输出 GPIO → 220 Ω → LED，测 LED、引脚电流和电压；把电阻移到 GPIO4 也判对，移到 GPIO34 会被拒绝）和 `src/core/fixtures/mcu-button-pullup.json`（Blue Pill 按键 + 内部上拉：松开读高、按下读低、浮空）。

