# 让 AI 帮你出题：提示词模板 / AI prompt template

> **English speakers:** skip to [English prompt](#english-prompt) below.

把下面 **“复制开始”到“复制结束”** 之间的全部内容复制给 ChatGPT / Claude 等 AI，
在最后的 **填写区** 写上你想要的主题、难度和数量。

AI 返回后：
1. 把每个 JSON 分别保存成 `.json` 文件（例如 `20-my-topic.json`），放进项目的 `challenges/` 文件夹，或用程序里的 **导入** 按钮 / 拖放导入。
2. 运行 `npm run validate` 检查。如果有错误，把错误信息原样贴回给 AI，让它修正。

完整格式说明见 [`CHALLENGE_FORMAT.md`](./CHALLENGE_FORMAT.md)。

题目可以用中文或英文写；提示词会让 AI 同时附上另一种语言的翻译（`i18n`），这样切换界面语言时题目也跟着切换。

---

## 中文提示词

<!-- ======================= 复制开始 ======================= -->

```text
你是一名电子工程（EE）入门老师，要为一个 3D 面包板电路模拟器 "Breadboard Lab" 编写练习题。
学生是讲中文、用英文学 EE 的初学者，最大的困惑是：原理图（schematic）怎么对应到面包板上，尤其是电源（power）和地（GND）。
请严格按照下面的格式规范输出 JSON 题目文件。

=== 输出要求 ===
- 每个题目是一个独立的 JSON 对象，每个放在单独的 ```json 代码块里，代码块前写一行建议文件名（如 "文件名：20-voltage-divider.json"）。
- 必须是严格合法的 JSON：双引号、没有注释、没有尾随逗号、不要省略号。
- 说明文字（title / summary / description / concepts / steps / hints / tests 的 name）用简体中文写在顶层，专业术语附英文，例如“限流电阻（current-limiting resistor）”。description 用 \n 换行，不要用 Markdown 标题、表格或链接（小标题可以写成 **粗体** 单独一行）。
- 同时在 "i18n": {"en": {...}} 里给出完整的英文翻译（见下面的“翻译”一节）。

=== 面包板 ===
- 主区孔位 a1–j30：行 a–j，列 1–30。每一列的 a–e 是一条金属条（相通），f–j 是另一条；e 和 f 之间是中间凹槽（trench），不相通。
- 电源轨：tp1–tp30（上方 +，红）、tn1–tn30（上方 −，蓝）、bp1–bp30（下方 +）、bn1–bn30（下方 −）。每条轨整行相通；上方轨和下方轨互不相通。
- 一个孔只能插一只脚（包括跳线的每一端）。两点式元件的两只脚不能插在同一条金属条上（会被短路）。

=== 文件结构 ===
{
  "format": "breadboard-challenge/1",            // 必须原样
  "id": "kebab-case-唯一id",                      // 只用字母/数字/-/_
  "title": "...",
  "kind": "lesson" 或 "challenge",               // lesson 要写 steps；challenge 要写 hints
  "level": 1-5,
  "summary": "一句话",
  "description": "讲解正文，教会概念",
  "concepts": ["英文术语 中文", ...],
  "i18n": { "en": { "title": "...", "summary": "...", "description": "...", "concepts": [...], "steps": [...], "hints": [...], "tests": [...] } },
  "components": [ ... ],                          // 目标电路元件（不含跳线）
  "nets": [ {"name": "VCC", "pins": ["V1.+", "R1.1"]}, ... ],   // 或用 "connections": [["V1.+","R1.1"], ...]
  "tests": [ ... ],
  "hints": ["...", ...],
  "steps": [ {"text": "...", "highlight": ["tp1","tn1"]}, ... ],
  "solution": { "parts": [ ... ] },
  "options": { "tolerance": 0.05, "allowExtraComponents": false }
}
（上面的 // 只是给你看的说明，输出里绝对不能有注释。）

=== components（目标电路）===
写法：{"ref": "R1", "type": "resistor", "resistance": "330"}，属性直接平铺。省略属性 = 任何值都接受。
ref 字母开头，如 V1、R1、LED1、D1、SW1、S1、RV1、C1、BAT1、PM1、PSU1。
只允许以下 type（不要发明其它元件，例如没有晶体管、IC、蜂鸣器、电机、交流电源）：
- dc_source      引脚 + -              属性 voltage       ← 首选电源：匹配任何电池/电源模块/稳压电源
- battery        引脚 + -              属性 variant: "9V" | "2xAA"(3V) | "3xAA"(4.5V) | "4xAA"(6V) | "CR2032"(3V)
- power_module   引脚 + -              属性 voltage: 5 或 3.3
- bench_supply   引脚 + -              属性 voltage, currentLimit（安培）
- resistor       引脚 1 2              属性 resistance，如 "220"、"4.7k"
- led            引脚 anode cathode    属性 color: red | yellow | green | blue | white
- diode          引脚 anode cathode
- capacitor      引脚 1 2              属性 capacitance，如 "100n"（直流下相当于断路）
- pushbutton     引脚 1 2              测试用属性 pressed: true/false
- switch (SPDT)  引脚 a com b          测试用属性 position: "a" | "b"
- potentiometer  引脚 1 2 3（2=滑动端） 属性 resistance；测试用属性 wiper: 0..1（0=靠 1 脚）
除非这一题就是讲某种电源，否则一律用 dc_source。整个电路只放一个电源。

=== nets / connections ===
引脚写成 "REF.pin"。每个节点（node）列出它包含的所有引脚。请把每个元件的每个引脚都放进某个节点（不要留空引脚）。
给关键节点起名：电源正极节点叫 "VCC"，电源负极节点叫 "GND"，其他如 "VOUT"。

=== tests（必须有，用来检查电路行为）===
{"name": "按下按键：LED 亮", "set": {"SW1": {"pressed": true}}, "expect": {"LED1": "on"},
 "voltages": [{"pin": "R2.1", "ref": "V1.-", "min": 2.85, "max": 3.15}]}
- expect 只能用于 LED："on" 或 "off"（电流 > 0.5mA 算亮）。
- voltages：pin 相对 ref 的电压（伏）在 [min, max] 之间；ref 省略 = 相对 GND。范围留 ±5% 左右余量。
- 有按键/开关/电位器时，每种状态各写一个测试（例如松开→灭、按下→亮）。
- 所有 ref 和引脚都用 components 里的名字。

=== 直流仿真模型（DC only，用来算数值）===
- LED 正向压降 Vf：红 1.8V，黄 2.0V，绿 2.1V，蓝/白 3.0V；另有约 12Ω 内阻。二极管 Vf ≈ 0.65V。
- 电源内阻：9V 电池 1.5Ω，AA 每节 0.15Ω，CR2032 15Ω，电源模块 0.1Ω，稳压电源 0.02Ω。
- 每个 LED 必须串联限流电阻，使电流在 5–20mA，绝不超过 25mA：R ≈ (V − Vf) / I。并联 LED 时每个 LED 有自己的电阻。
- 电容在直流下是断路；没有交流、没有时间变化（不要出 RC 延时、闪烁、PWM 类题目）。

=== solution（强烈建议提供：证明题目可解）===
{"parts": [
  {"type": "battery", "ref": "BAT1", "variant": "9V", "pins": {"+": "tp1", "-": "tn1"}},
  {"type": "wire", "pins": {"a": "tp5", "b": "a5"}, "color": "red"},
  {"type": "resistor", "ref": "R1", "resistance": "470", "pins": {"1": "c5", "2": "c9"}},
  {"type": "led", "ref": "LED1", "color": "red", "pins": {"anode": "d9", "cathode": "d12"}},
  {"type": "wire", "pins": {"a": "a12", "b": "tn12"}, "color": "blue"}
]}
- 布局里不能用 dc_source，要写具体电源（battery / power_module / bench_supply），电压要和 components 一致。
- 两点式元件用 "pins"，引脚名必须是原名：wire a/b；resistor 1/2；led、diode anode/cathode；capacitor 1/2；battery、bench_supply +/-。
- 占位式元件用 "at"：
  · pushbutton  "at": "e5" → 占 e5、e7、f5、f7，横跨凹槽；第 5 列（e5/f5）是引脚 1，第 7 列（e7/f7）是引脚 2。按键的 at 一律用 e 行。
  · switch      "at": "c10" → a=c10, com=c11, b=c12（同一行连续 3 列）
  · potentiometer "at": "c4" → 1=c4, 2=c5, 3=c6
  · power_module "at": "tp1" → 插入 tp1、tn1、bp1、bn1，上下两组轨道都有电
- 跳线 color 只能用 red / blue / green / yellow / white（红=+，蓝=GND）。
- 每个孔只用一次！写完后逐个孔检查有没有重复，检查每个节点的所有引脚确实在同一条金属条（或用跳线连通），不同节点没有误连。
- 惯例：电源接在第 1 列的轨道上（tp1/tn1），元件从左往右排，用主区 a–e（或 f–j），GND 用跳线接回 tn（或 bn）。

=== 翻译（i18n）===
- 顶层文字是中文（不用写 "lang"，默认就是 "zh"）。英文翻译放在 "i18n": {"en": {...}}，位置在 concepts 后面、components 前面。
- 可写的键：title、summary、description、concepts、steps、hints、tests。不要放别的键。
- steps：只写每一步的英文文字（字符串数组），数量和顺序必须与顶层 steps 完全一致；highlight 不用重复写。
- hints：数量和顺序与顶层 hints 完全一致。
- tests：只写测试名（字符串数组），顺序与顶层 tests 一致。
- 英文要自然、适合初学者；数字、单位、孔位名（tp4、a11…）、公式、元件 ref 保持原样。英文里不要夹中文。
- 标题格式："第 3 课 · ……" → "Lesson 3 · ..."，"挑战 11 · ……" → "Challenge 11 · ..."。

=== 限制 ===
- 每题不超过 8 个元件（跳线不算）。
- lesson：description 详细讲解概念；steps 一步一步，每步 highlight 相关孔位；必须有 solution。
- challenge：description 写清楚要求（包括电源接哪个脚、哪个灯接开关哪一侧——开关 a/b、电位器 1/3 在判分时可互换，测试却依赖它们）；hints 2–3 条，由浅入深；必须有 solution。
- 输出前自己验算：每个 LED 的电流、每个电压测试的期望值。

=== 填写区 ===
主题：___________（例如：分压器 / 按键 + LED / 认识 GND / 二极管 / 电位器）
难度（1–5）：___
类型：lesson / challenge / 都要
数量：___
文件名编号从：___ 开始（例如 20）
其他要求：___________
```

<!-- ======================= 复制结束 ======================= -->

---

## 常见 AI 错误与修正

| 校验器报错 | 原因 / 让 AI 怎么改 |
|---|---|
| `"format" 必须是 "breadboard-challenge/1"` | 拼写错误或漏写 |
| `孔 xx 已经被 xx 占用` | 同一个孔插了两只脚，换一个空孔 |
| `solution 不正确 — 断开了 / 多连了` | 布局和 components 的连接对不上：让 AI 逐个节点检查金属条 |
| `target 自检失败 — 测试失败` | 测试期望值算错了，或题目本身不可能实现：让 AI 重新计算 |
| `电流 xx mA，超过 25 mA` | 限流电阻太小，换大一点 |
| `i18n.xx.steps: 应该是和 "steps" 一一对应的数组` | 翻译的 steps / hints / tests 数量和原文不一致：让 AI 逐条一一对应地翻译 |
| `JSON 语法错误` | AI 加了注释、尾随逗号或省略号 |

---

## English prompt

Copy everything between **COPY START** and **COPY END** below into ChatGPT / Claude or another AI, and fill in the topic, difficulty and number of challenges in the **Fill in** section at the end.

When the AI answers:
1. Save each JSON as its own `.json` file (e.g. `20-my-topic.json`) in the project's `challenges/` folder, or load it with the **Import** button / drag and drop.
2. Run `npm run validate`. If there are errors, paste the messages back to the AI unchanged and ask it to fix them.

Challenges written in English carry `"lang": "en"`; the prompt also asks for a Chinese translation in `i18n.zh`, so the challenge switches language together with the UI. Full format reference: [`CHALLENGE_FORMAT.md`](./CHALLENGE_FORMAT.md) (written in Chinese, but the field names, tables and examples are the same).

<!-- ======================= COPY START ======================= -->

```text
You are an introductory electrical engineering (EE) teacher writing practice exercises for "Breadboard Lab", a 3D breadboard circuit simulator.
The students are EE beginners. Their biggest confusion is how a schematic maps onto a breadboard, especially power and ground (GND).
Output challenge files as JSON, following the format below exactly.

=== Output rules ===
- Each challenge is a separate JSON object in its own ```json code block. Before each block, write one line with a suggested file name (e.g. "File: 20-voltage-divider.json").
- Output strictly valid JSON: double quotes, no comments, no trailing commas, no "..." placeholders.
- Write the text fields (title / summary / description / concepts / steps / hints / test names) at the top level in clear, simple English for beginners, and set "lang": "en". Use \n for line breaks in description; no Markdown headings, tables or links (a sub-heading may be a **bold** line on its own).
- Also give a complete Chinese (Simplified) translation in "i18n": {"zh": {...}} (see "Translation" below).

=== Breadboard ===
- Main area holes a1–j30: rows a–j, columns 1–30. In each column, a–e is one metal strip (connected) and f–j is another; between e and f is the trench in the middle, which is NOT connected.
- Power rails: tp1–tp30 (top +, red), tn1–tn30 (top −, blue), bp1–bp30 (bottom +), bn1–bn30 (bottom −). Each rail is connected along its whole length; the top rails and the bottom rails are NOT connected to each other.
- One hole holds only one lead (including each end of a jumper wire). The two leads of a two-lead part must not be on the same metal strip (it would be shorted out).

=== File structure ===
{
  "format": "breadboard-challenge/1",            // exactly this
  "id": "kebab-case-unique-id",                   // letters/digits/-/_ only
  "lang": "en",
  "title": "...",
  "kind": "lesson" or "challenge",               // lesson needs steps; challenge needs hints
  "level": 1-5,
  "summary": "one sentence",
  "description": "explanation that teaches the concept",
  "concepts": ["English term", ...],
  "i18n": { "zh": { "title": "...", "summary": "...", "description": "...", "concepts": [...], "steps": [...], "hints": [...], "tests": [...] } },
  "components": [ ... ],                          // target circuit parts (no jumper wires)
  "nets": [ {"name": "VCC", "pins": ["V1.+", "R1.1"]}, ... ],   // or "connections": [["V1.+","R1.1"], ...]
  "tests": [ ... ],
  "hints": ["...", ...],
  "steps": [ {"text": "...", "highlight": ["tp1","tn1"]}, ... ],
  "solution": { "parts": [ ... ] },
  "options": { "tolerance": 0.05, "allowExtraComponents": false }
}
(The // notes above are only for you; the output must never contain comments.)

=== components (target circuit) ===
Form: {"ref": "R1", "type": "resistor", "resistance": "330"}, with properties written flat in the object. Omitting a property = any value is accepted.
ref starts with a letter, e.g. V1, R1, LED1, D1, SW1, S1, RV1, C1, BAT1, PM1, PSU1.
Only these types are allowed (do not invent other parts; there are no transistors, ICs, buzzers, motors or AC sources):
- dc_source      pins + -              props voltage       ← preferred source: matches any battery / power module / bench supply
- battery        pins + -              props variant: "9V" | "2xAA"(3V) | "3xAA"(4.5V) | "4xAA"(6V) | "CR2032"(3V)
- power_module   pins + -              props voltage: 5 or 3.3
- bench_supply   pins + -              props voltage, currentLimit (amps)
- resistor       pins 1 2              props resistance, e.g. "220", "4.7k"
- led            pins anode cathode    props color: red | yellow | green | blue | white
- diode          pins anode cathode
- capacitor      pins 1 2              props capacitance, e.g. "100n" (an open circuit at DC)
- pushbutton     pins 1 2              test prop pressed: true/false
- switch (SPDT)  pins a com b          test prop position: "a" | "b"
- potentiometer  pins 1 2 3 (2=wiper)  props resistance; test prop wiper: 0..1 (0 = toward pin 1)
Use dc_source unless the challenge is specifically about one kind of power source. Use only one power source per circuit.

=== nets / connections ===
Write pins as "REF.pin". Each node lists all the pins it contains. Put every pin of every component into some node (no unconnected pins).
Name the key nodes: the supply + node "VCC", the supply − node "GND", others e.g. "VOUT".

=== tests (required; they check the circuit's behaviour) ===
{"name": "Button pressed: LED on", "set": {"SW1": {"pressed": true}}, "expect": {"LED1": "on"},
 "voltages": [{"pin": "R2.1", "ref": "V1.-", "min": 2.85, "max": 3.15}]}
- expect works only for LEDs: "on" or "off" (more than 0.5mA counts as on).
- voltages: the voltage of pin relative to ref (in volts) must be within [min, max]; omitting ref = relative to GND. Leave about ±5% margin.
- With a push button / switch / potentiometer, write one test per state (e.g. released → off, pressed → on).
- All refs and pins use the names from components.

=== DC simulation model (use it to work out values) ===
- LED forward voltage Vf: red 1.8V, yellow 2.0V, green 2.1V, blue/white 3.0V; plus about 12Ω internal resistance. Diode Vf ≈ 0.65V.
- Source internal resistance: 9V battery 1.5Ω, AA 0.15Ω per cell, CR2032 15Ω, power module 0.1Ω, bench supply 0.02Ω.
- Every LED needs a current-limiting resistor in series so its current is 5–20mA, never above 25mA: R ≈ (V − Vf) / I. LEDs in parallel each get their own resistor.
- Capacitors are open circuits at DC; there is no AC and nothing changes over time (no RC delay, blinking or PWM exercises).

=== solution (strongly recommended: proves the challenge is solvable) ===
{"parts": [
  {"type": "battery", "ref": "BAT1", "variant": "9V", "pins": {"+": "tp1", "-": "tn1"}},
  {"type": "wire", "pins": {"a": "tp5", "b": "a5"}, "color": "red"},
  {"type": "resistor", "ref": "R1", "resistance": "470", "pins": {"1": "c5", "2": "c9"}},
  {"type": "led", "ref": "LED1", "color": "red", "pins": {"anode": "d9", "cathode": "d12"}},
  {"type": "wire", "pins": {"a": "a12", "b": "tn12"}, "color": "blue"}
]}
- A layout cannot use dc_source; use a concrete source (battery / power_module / bench_supply) with the same voltage as in components.
- Two-point parts use "pins" with the original pin names only: wire a/b; resistor 1/2; led, diode anode/cathode; capacitor 1/2; battery, bench_supply +/-.
- Footprint parts use "at":
  · pushbutton  "at": "e5" → occupies e5, e7, f5, f7, straddling the trench; column 5 (e5/f5) is pin 1, column 7 (e7/f7) is pin 2. Always use row e for a push button's at.
  · switch      "at": "c10" → a=c10, com=c11, b=c12 (3 neighbouring columns in one row)
  · potentiometer "at": "c4" → 1=c4, 2=c5, 3=c6
  · power_module "at": "tp1" → plugs into tp1, tn1, bp1, bn1; both the top and bottom rails are powered
- Jumper color must be one of red / blue / green / yellow / white (red = +, blue = GND).
- Use every hole only once! When done, check every hole for duplicates, check that all pins of each node really are on the same metal strip (or joined by jumpers), and that different nodes are not accidentally connected.
- Conventions: connect the source to the rails at column 1 (tp1/tn1), place parts left to right in the main area a–e (or f–j), and return to GND with a jumper to tn (or bn).

=== Translation (i18n) ===
- The top-level text is English ("lang": "en"). Put the Chinese translation in "i18n": {"zh": {...}}, after concepts and before components.
- Allowed keys: title, summary, description, concepts, steps, hints, tests. No other keys.
- steps: only the text of each step (an array of strings), with exactly the same number and order as the top-level steps; do not repeat highlight.
- hints: exactly the same number and order as the top-level hints.
- tests: only the test names (an array of strings), in the same order as the top-level tests.
- Write natural Simplified Chinese for beginners, adding the English term to key concepts, e.g. "限流电阻（current-limiting resistor）". Keep numbers, units, hole names (tp4, a11…), formulas and part refs unchanged.
- Title format: "Lesson 3 · ..." → "第 3 课 · ……", "Challenge 11 · ..." → "挑战 11 · ……".

=== Limits ===
- At most 8 components per challenge (jumpers don't count).
- lesson: the description explains the concept in detail; steps go one at a time, each highlighting the relevant holes; a solution is required.
- challenge: the description states the requirements clearly (including which pin the supply goes to and which LED goes on which side of a switch: switch a/b and potentiometer 1/3 are interchangeable when grading, but the tests depend on them); 2–3 hints, from gentle to specific; a solution is required.
- Before answering, check your own numbers: every LED current and the expected value of every voltage test.

=== Fill in ===
Topic: ___________ (e.g. voltage divider / push button + LED / what GND is / diodes / potentiometers)
Difficulty (1–5): ___
Type: lesson / challenge / both
How many: ___
Start file numbering at: ___ (e.g. 20)
Other requirements: ___________
```

<!-- ======================= COPY END ======================= -->

### Common AI mistakes and fixes

Run `npm run validate -- --lang en` to get the messages in English (the app's Import page shows them in the UI language).

| Validator message | Cause / what to ask the AI to fix |
|---|---|
| `"format" must be "breadboard-challenge/1"` | `format` misspelled or missing |
| `hole xx is already used by xx` | Two leads in the same hole: move one to a free hole |
| `solution is wrong — Not connected / Extra connection` | The layout doesn't match the components' connections: have the AI check each node's metal strip |
| `target self-test failed — Test failed` | A test's expected value is wrong, or the circuit can't do what the test asks: have the AI recalculate |
| `draws xx mA ..., above 25 mA` | The current-limiting resistor is too small: use a larger one |
| `i18n.xx.steps: should be an array matching "steps" item by item` | The translated steps / hints / tests have a different count from the originals: translate them one to one |
| `JSON syntax error` | The AI added comments, trailing commas or "..." |
