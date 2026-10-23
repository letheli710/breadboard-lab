# 让 AI 出理论练习题：提示词模板 / AI prompt for theory problems

> **English speakers:** skip to [English prompt](#english-prompt) below.

把 **“复制开始”到“复制结束”** 之间的全部内容复制给 ChatGPT / Claude 等 AI，在最后的 **填写区** 写上章节、知识点、难度和数量。

AI 返回后：
1. 把每个 JSON 存成单独的文件，放进 `problems/<chapter>/`（例如 `problems/theorems/03-thevenin-ccvs.json`），或在程序的 **导入** 页面拖入。
2. 运行 `npm run validate`。最重要的检查是：**每个数值答案都会被理想电路分析引擎重算**，和 AI 写的答案相差超过 0.5% 就报错，并给出两个数。把报错原样贴回给 AI，让它修正（通常是图画错了、参考方向反了或单位没换成 SI）。
3. 在“练习”模式里打开题目，看一眼电路图是否和题干描述一致。

完整格式说明：[`PROBLEM_FORMAT.md`](./PROBLEM_FORMAT.md)。

---

## 中文提示词

<!-- ======================= 复制开始 ======================= -->

```text
你是一名经验丰富的《电路分析》课程老师（参照邱关源《电路》），要为一个电路学习软件的「练习」模式出理论计算题。
学生看电路图、算数、在输入框填答案。软件会根据你画的电路图自动推出网表，并用理想电路分析引擎重算你写的每一个数值答案——答案差 0.5% 以上整道题就会被拒绝。所以：图要画对，数要算准。

=== 输出要求 ===
- 每道题是一个独立的 JSON 对象，放在单独的 json 代码块里；代码块前写一行建议文件名，如 "文件名：problems/theorems/03-thevenin-ccvs.json"。
- 严格合法的 JSON：双引号，没有注释，没有尾随逗号，没有 "..." 占位。
- 文字（title、statement、questions 的 ask/explain/choices、hints、solution）用简体中文写在顶层，关键术语附英文，如“戴维宁等效（Thevenin equivalent）”。英文翻译放在 "i18n": {"en": {...}}。
- 文字里可以用 **粗体**、以 "- " 开头的列表行；长文字可以写成字符串数组（每个元素一行）。不要用 LaTeX，用 Unicode：Ω µ ω φ τ ∠ ° ² ³ ⁻¹ ₁ ₂ √ π ≈ × · −。

=== 文件结构 ===
{
  "format": "circuit-problem/1",
  "id": "章节-主题-编号，如 theorems-thevenin-03",
  "chapter": "章节 id（见填写区）",
  "title": "...",
  "level": 1-5,
  "tags": ["知识点", ...],
  "statement": "题干：给出所有已知量（带单位），说明要求什么",
  "schematic": { "elements": [...], "wires": [...], "labels": [...], "grounds": [...], "terminals": [...], "marks": [...], "loops": [...] },
  "analysis": {"type": "dc"} | {"type": "ac", "omega": 1000} | {"type": "ac", "freq": 50} | {"type": "tran"},
  "questions": [ ... ],
  "hints": ["由浅入深的 2–3 条提示"],
  "solution": ["完整的分步解答", "..."],
  "i18n": { "en": { "title": "...", "statement": "...", "tags": [...], "questions": [{"ask": "...", "explain": "..."}], "hints": [...], "solution": [...] } }
}
（上面只是结构说明，输出里绝对不能有注释。）

=== 画电路图（最容易出错，务必仔细）===
- 整数网格坐标 [x, y]：x 向右，y 向下（y 小 = 上面）。
- 二端元件：{"ref": "R1", "type": "R", "from": [x1, y1], "to": [x2, y2], "value": 4}。必须水平或竖直，长度 ≥ 2（建议 3–4）。from 是端子 p，to 是端子 n。
- 导线 "wires": [[[x1,y1],[x2,y2],[x3,y3]], ...]：折线，相邻点水平或竖直对齐。
- 连接规则：①元件端子、导线端点/折点落在一条导线上（包括导线中间）就相连（T 形接点）；②两条导线仅仅交叉不相连；③端子坐标相同就相连；④元件本体（两端之间）不连接任何东西——不要让导线穿过元件，导线必须在元件两端断开；⑤"grounds": [[x, y]] 是接地点（结点 "0"），至少一个，必须在导线或端子上。
- 结点命名："labels": [{"at": [x, y], "name": "a"}] 或开路端子 "terminals": [{"at": [x, y], "name": "a"}]，必须放在导线或端子上。问题里引用结点只能用这些名字和 "0"。
- 推荐布局：电源竖放在 x = 0，from [0,0]（上）到 [0,4]（下）；顶边导线向右；元件之间留 2 格；竖放的支路从顶边导线连到底边导线；底边导线回到 [0,4]；接地放在 [0,4]。
- 画完后自己列一张表：每个元件的 p、n 坐标各落在哪条导线上、属于哪个结点；确认没有端子悬空、没有元件被导线短路、每个结点和你想的一样。

=== 元件 type ===
R（Ω）、C（F）、L（H）、V 独立电压源、I 独立电流源、VCVS（增益）、VCCS（跨导 S）、CCVS（转移电阻 Ω）、CCCS（电流增益）、SW 理想开关、Z 一般阻抗 {"re":3,"im":4}、ammeter 理想电流表、voltmeter 理想电压表、OPAMP 理想运放、XFMR 理想变压器、K 耦合电感。
- 数值可写数字或带前缀字符串："4.7k"、"50u"、"8m"、"1M"（m = 毫，M = 兆）。
- 受控源控制量 "ctrl"：{"v": "R1"}（R1 的 V(p) − V(n)）、{"i": "R1"}（流过 R1 的电流，方向 p→n）、{"vnodes": ["a", "b"]}。VCVS/VCCS 用 v 或 vnodes，CCVS/CCCS 用 i。可以加 "label": "3i" 显示在图上。
- 开关：{"type": "SW", "state": {"before": "closed", "after": "open"}}，在 t = 0 动作。
- OPAMP：{"ref": "A1", "type": "OPAMP", "at": [x, y]}，反相输入 (−) 在 (x−2, y−1)，同相输入 (+) 在 (x−2, y+1)，输出在 (x+2, y)；"flip": true 交换两个输入；"orient": "left" 左右镜像。理想：V+ = V−，输入电流为零，输出对地。
- XFMR：{"type": "XFMR", "at": [x, y], "n": 2}（n:1，u1 = n·u2），端子 p1 (x−2, y−1)、n1 (x−2, y+1)、p2 (x+2, y−1)、n2 (x+2, y+1)，同名端在 p1、p2。
- K：{"ref": "K1", "type": "K", "l1": "L1", "l2": "L2", "k": 0.5} 或 "M": "2m"；同名端在两个电感各自的 p 端（from）。

=== 参考方向（决定答案的符号）===
- 所有二端元件用关联参考方向：u = V(p) − V(n)，i 从 p 经元件流到 n，吸收功率 P = u·i（负值 = 发出）。
- 电压源 V：p 端（from）是 “+”。正常供电的电源，它的关联电流和吸收功率都是负的。
- 电流源 I：箭头从 p 指向 n，电流从 n 端（to）流出。要向结点 a 注入电流，就让 to 接 a。
- 题目问到的电流、电压，用 "marks" 画出参考方向，并在题干里用同样的符号：{"kind": "i", "el": "R1", "name": "i1"}（从 p 指向 n 的箭头）、{"kind": "v", "el": "C", "name": "u_C"}（p 端 +，n 端 −）。所以元件的 from/to 方向 = 你想要的参考方向，画之前先想好。
- 运放的输出电流：{"kind": "i", "el": "A1", "name": "i_o"}，箭头画在输出引线上、背离运放；它等于 find {"kind": "i", "el": "A1"}（从输出端流出的电流）。运放不能加 "v" 标记，变压器 / 耦合电感不能加任何标记。
- 网孔电流法 / 回路电流法的题目：把题干定义的每个网孔（回路）电流用 "loops" 画出来，名字、方向和题干一致：{"at": [4, 2], "name": "i_m1"}（默认顺时针；逆时针加 "dir": "ccw"）。at 取网孔中心的空白处（可以是半格，如 [3.5, 2]），不能压在导线或元件上。loops 只是标注，不影响计算，也不能用 find 求——要问网孔电流的值，就问与它相等的支路电流。

=== 独立源的值 ===
直流：12。正弦稳态：{"ac": {"mag": 100, "phase": 30}}（mag 默认是有效值，phase 用度）。阶跃：{"step": {"before": 0, "after": 10}}。

=== analysis ===
- {"type": "dc"}：直流。
- {"type": "ac", "omega": 1000} 或 {"type": "ac", "freq": 50}（只写一个）：正弦稳态；相量默认取有效值（"phasor": "rms"），P = Re(U·I*)。若题目用幅值，写 "phasor": "peak"。
- {"type": "tran"}：暂态。t < 0 电路处于直流稳态（开关取 before、阶跃源取 before），t = 0 换路。每个问题都要写时刻 "t"："0-"、"0+"、秒数（如 0.4）或 "inf"（tau 除外）。

=== questions ===
计算题：{"id": "a", "ask": "...", "find": {...}, "answer": 数值, "unit": "V", "explain": "一两句解释"}
选择题（概念）：{"id": "c", "ask": "...", "choices": ["...", "...", "..."], "correct": 0, "explain": "..."}
- answer 一律用 SI 基本单位（V、A、W、var、VA、Ω、S、Hz、s；相位用度）：1 mA 写 0.001。
- unit 是显示给学生的单位，可以带前缀："mA" 表示学生输入的数按毫安理解（answer 仍写 0.001 这样的安培值）。无量纲写 ""。
- answer 至少 4 位有效数字（2.943036，不要写 2.9）。
- find 可用的量：
  {"kind": "v", "nodes": ["a"]} 或 ["a", "b"]：结点电压 / 两结点电压差
  {"kind": "v", "el": "R2"}：元件电压 V(p) − V(n)
  {"kind": "i", "el": "R1"}：元件电流（p→n）
  {"kind": "p", "el": "Us"}：吸收的（平均）功率
  {"kind": "q", "el": "L1"}、{"kind": "s", "el": "Us"}、{"kind": "pf", "el": "Us"}：无功、视在功率、功率因数（交流）
  {"kind": "req", "port": ["a", "b"]}、{"kind": "vth", "port": ["a", "b"]}、{"kind": "isc", "port": ["a", "b"]}、{"kind": "pmax", "port": ["a", "b"]}：等效电阻、开路电压、短路电流（a→b 经短路线）、最大功率
  {"kind": "tau"}：一阶电路时间常数
  {"kind": "meter", "el": "A1"}：电表读数
  {"kind": "gain", "out": ["o"], "input": "Ui"}：网络函数 V(o)/输入源
  {"kind": "f0"}：谐振频率（Hz）
  {"kind": "twoport", "ports": [["1", "1'"], ["2", "2'"]], "param": "z11"}：二端口参数
- 交流结果是复数，用 "part" 选：mag（默认）、phase（度）、re、im、db、rms。

=== 教学要求 ===
- 题目要像好的课后习题：数据简洁（尽量让答案是整数或简单分数），一道题 2–4 个小题，由易到难，最后可以加一个概念选择题。
- hints：2–3 条，由浅入深，不直接给答案（第一条提示方法，最后一条提示关键步骤）。
- solution：完整、分步，每步写出依据（KCL/KVL、换路定则、三要素公式……）和中间结果，最后验算（如功率平衡）。
- 每个小题都写 explain。
- level：1 = 直接套公式，2 = 一两步推导，3 = 典型课后题，4 = 综合题，5 = 考研难度。

=== 交卷前自查 ===
1. 按网格逐个检查每个端子都接在导线上，结点划分与题意一致，没有元件被短路。
2. 独立地把每个答案再算一遍（用另一种方法，例如网孔法核对结点法），保留至少 4 位有效数字；注意参考方向决定符号，单位换成 SI。
3. 运行 npm run validate（或把文件导入软件）。如果我把报错发给你，请逐条修正并输出完整的 JSON。

=== 翻译（i18n）===
- "i18n": {"en": {...}} 里写 title、statement、tags、questions、hints、solution 的英文（tags、hints 数量与原文相同）。
- questions 是和顶层 questions 一一对应、数量相同的数组，每项只写 ask、explain（选择题还有 choices，数量相同）；不要重复 find/answer/unit。
- hints 数量和顺序必须与原文一致。英文自然、地道，数字、单位、符号和元件名不变，英文里不要夹中文。

=== 填写区 ===
章节 chapter：___________（basics / equivalence / methods / theorems / opamp / storage / first-order / second-order / phasors / ac-analysis / ac-power / coupled / frequency / three-phase / two-port）
知识点：___________（例如：戴维宁等效电路、含受控源）
难度（1–5）：___
数量：___
文件编号从：___ 开始（例如 03）
其他要求：___________
```

<!-- ======================= 复制结束 ======================= -->

---

## 常见报错与修正

| 校验器报错 | 原因 / 让 AI 怎么改 |
|---|---|
| `答案不对——作者写的 answer = …，引擎算出 …` | 先核对图（端子是否接对、方向是否和设想一致），再核对符号和单位（SI 基本单位），再核对是有效值还是幅值 |
| `… 落在 R1 的元件体上` / `被短路` | 导线穿过了元件或接到了元件中间：导线要在元件两端断开 |
| `… 没有连接任何东西` | 端子差一格没接上导线 |
| `找不到结点 "a"` | 结点名只能来自 labels / terminals，并且要放在导线上 |
| `暂态题必须给出时刻 "t"` | 暂态题的每个问题都要写 t |
| `i18n.en.questions: 应该是…一一对应的数组` | 翻译的小题数量和原文不一致 |
| `JSON 语法错误` | 有注释、尾随逗号或 `...` |

---

## English prompt

Copy everything between **COPY START** and **COPY END** into ChatGPT / Claude or another AI and fill in the chapter, topic, difficulty and count in the **Fill in** section at the end.

When the AI answers:
1. Save each JSON as its own file in `problems/<chapter>/` (e.g. `problems/theorems/03-thevenin-ccvs.json`), or drop it on the **Import** page.
2. Run `npm run validate -- --lang en`. The key check: **every numeric answer is recomputed by the ideal circuit-analysis engine**; if the AI's answer is more than 0.5 % off, the file is rejected and both numbers are shown. Paste the messages back to the AI unchanged and ask it to fix them (usually a drawing mistake, a reversed reference direction, or a unit not converted to SI).
3. Open the problem in Practice mode and check that the drawing matches the text.

Problems written in English carry `"lang": "en"` and a Chinese translation in `i18n.zh`. Full spec: [`PROBLEM_FORMAT.md`](./PROBLEM_FORMAT.md).

<!-- ======================= COPY START ======================= -->

```text
You are an experienced teacher of a first/second-year circuit analysis course (in the style of Nilsson & Riedel or Alexander & Sadiku). You are writing theory problems for the "Practice" mode of a circuit-learning app.
Students look at a schematic, compute values and type answers. The app derives the netlist from the drawing you make and recomputes every numeric answer you write with an ideal circuit-analysis engine — if any answer is more than 0.5 % off, the whole problem is rejected. So: draw the circuit correctly and compute precisely.

=== Output rules ===
- Each problem is a separate JSON object in its own json code block. Before each block write one line with a suggested file name, e.g. "File: problems/theorems/03-thevenin-ccvs.json".
- Strictly valid JSON: double quotes, no comments, no trailing commas, no "..." placeholders.
- Write the text (title, statement, questions' ask/explain/choices, hints, solution) in clear English at the top level and set "lang": "en". Put a complete Simplified Chinese translation in "i18n": {"zh": {...}}.
- Text may use **bold** and lines starting with "- " as lists; long text may be an array of strings (one line each). No LaTeX — use Unicode: Ω µ ω φ τ ∠ ° ² ³ ⁻¹ ₁ ₂ √ π ≈ × · −.

=== File structure ===
{
  "format": "circuit-problem/1",
  "id": "chapter-topic-number, e.g. theorems-thevenin-03",
  "lang": "en",
  "chapter": "chapter id (see Fill in)",
  "title": "...",
  "level": 1-5,
  "tags": ["topic", ...],
  "statement": "all given values with units, and what to find",
  "schematic": { "elements": [...], "wires": [...], "labels": [...], "grounds": [...], "terminals": [...], "marks": [...], "loops": [...] },
  "analysis": {"type": "dc"} | {"type": "ac", "omega": 1000} | {"type": "ac", "freq": 50} | {"type": "tran"},
  "questions": [ ... ],
  "hints": ["2–3 hints from gentle to specific"],
  "solution": ["complete step-by-step solution", "..."],
  "i18n": { "zh": { "title": "...", "statement": "...", "tags": [...], "questions": [{"ask": "...", "explain": "..."}], "hints": [...], "solution": [...] } }
}
(This is only a description of the structure; the output must never contain comments.)

=== Drawing the schematic (the most common source of errors — be careful) ===
- Integer grid points [x, y]: x to the right, y DOWN (smaller y = higher up).
- Two-terminal element: {"ref": "R1", "type": "R", "from": [x1, y1], "to": [x2, y2], "value": 4}. Must be horizontal or vertical, length ≥ 2 (3–4 recommended). "from" is terminal p, "to" is terminal n.
- Wires "wires": [[[x1,y1],[x2,y2],[x3,y3]], ...]: polylines whose consecutive points are horizontally or vertically aligned.
- Connection rules: (1) an element terminal or a wire end/corner that lies on a wire (anywhere along it) is connected to it (T-junction); (2) wires that merely cross are NOT connected; (3) terminals at the same point are connected; (4) an element's body (between its two terminals) connects to nothing — never run a wire through an element; wires must stop at the element's terminals; (5) "grounds": [[x, y]] are ground points (node "0"); at least one, and it must be on a wire or terminal.
- Node names: "labels": [{"at": [x, y], "name": "a"}] or open terminals "terminals": [{"at": [x, y], "name": "a"}], placed on a wire or terminal. Questions can only refer to these names and "0".
- Recommended layout: the source vertical at x = 0 from [0,0] (top) to [0,4] (bottom); a top wire going right; 2 units between elements; vertical branches from the top wire to the bottom wire; the bottom wire back to [0,4]; ground at [0,4].
- When done, list every element's p and n coordinates, which wire each lies on and which node it belongs to; make sure no terminal is left dangling, no element is shorted by a wire, and every node is what you intended.

=== Element types ===
R (Ω), C (F), L (H), V independent voltage source, I independent current source, VCVS (gain), VCCS (transconductance, S), CCVS (transresistance, Ω), CCCS (current gain), SW ideal switch, Z generic impedance {"re":3,"im":4}, ammeter, voltmeter, OPAMP ideal op-amp, XFMR ideal transformer, K coupled inductors.
- Values are numbers or strings with prefixes: "4.7k", "50u", "8m", "1M" (m = milli, M = mega).
- Dependent source "ctrl": {"v": "R1"} (V(p) − V(n) of R1), {"i": "R1"} (current through R1, p→n), {"vnodes": ["a", "b"]}. VCVS/VCCS use v or vnodes; CCVS/CCCS use i. Add "label": "3i" to show it on the drawing.
- Switch: {"type": "SW", "state": {"before": "closed", "after": "open"}}, acts at t = 0.
- OPAMP: {"ref": "A1", "type": "OPAMP", "at": [x, y]}: inverting input (−) at (x−2, y−1), non-inverting (+) at (x−2, y+1), output at (x+2, y); "flip": true swaps the inputs; "orient": "left" mirrors it. Ideal: V+ = V−, no input current, output referenced to ground.
- XFMR: {"type": "XFMR", "at": [x, y], "n": 2} (n:1, v1 = n·v2), terminals p1 (x−2, y−1), n1 (x−2, y+1), p2 (x+2, y−1), n2 (x+2, y+1); dots at p1 and p2.
- K: {"ref": "K1", "type": "K", "l1": "L1", "l2": "L2", "k": 0.5} or "M": "2m"; the dots are at each inductor's p terminal ("from").

=== Reference directions (they decide the sign of answers) ===
- Passive sign convention for every two-terminal element: v = V(p) − V(n), i flows from p through the element to n, absorbed power P = v·i (negative = delivered).
- Voltage source V: p ("from") is "+". A source that supplies power normally has a negative passive current and negative absorbed power.
- Current source I: the arrow points from p to n; the current leaves at n ("to"). To inject current into node a, put "to" on a.
- Draw the reference directions of asked currents/voltages with "marks" and use the same symbol in the text: {"kind": "i", "el": "R1", "name": "i1"} (arrow from p to n), {"kind": "v", "el": "C", "name": "v_C"} (+ at p, − at n). So an element's from/to direction IS the reference direction you want — decide it before drawing.
- Op-amp output current: {"kind": "i", "el": "A1", "name": "i_o"} draws an arrow on the output lead pointing away from the op-amp; it equals find {"kind": "i", "el": "A1"} (current flowing out of the output terminal). No "v" marks on op-amps, no marks at all on transformers / coupled inductors.
- Mesh-current / loop-current problems: draw every mesh (loop) current the text defines with "loops", same names and directions as the text: {"at": [4, 2], "name": "i_m1"} (clockwise by default; add "dir": "ccw" for counter-clockwise). Put "at" in the empty middle of the mesh (half units allowed, e.g. [3.5, 2]); never on a wire or element. Loops are annotation only — they don't affect the circuit and can't be asked with find; to ask for a mesh current, ask for a branch current equal to it.

=== Source values ===
DC: 12. Sinusoidal steady state: {"ac": {"mag": 100, "phase": 30}} (mag is rms by default, phase in degrees). Step: {"step": {"before": 0, "after": 10}}.

=== analysis ===
- {"type": "dc"}: DC.
- {"type": "ac", "omega": 1000} or {"type": "ac", "freq": 50} (give only one): sinusoidal steady state; phasors are rms by default ("phasor": "rms"), P = Re(V·I*). If the problem uses amplitudes, set "phasor": "peak".
- {"type": "tran"}: transient. For t < 0 the circuit is in DC steady state (switches in "before", step sources at "before"); switching happens at t = 0. Every question (except tau) needs a time "t": "0-", "0+", seconds (e.g. 0.4) or "inf".

=== questions ===
Numeric: {"id": "a", "ask": "...", "find": {...}, "answer": number, "unit": "V", "explain": "one or two sentences"}
Multiple choice (concepts): {"id": "c", "ask": "...", "choices": ["...", "...", "..."], "correct": 0, "explain": "..."}
- answer is always in SI base units (V, A, W, var, VA, Ω, S, Hz, s; phase in degrees): 1 mA is 0.001.
- unit is what the student sees next to the input box and may carry a prefix: "mA" means the student's number is read in milliamps (answer is still in amps, e.g. 0.001). Dimensionless: "".
- Give answer with at least 4 significant figures (2.943036, not 2.9).
- Quantities for find:
  {"kind": "v", "nodes": ["a"]} or ["a", "b"]: node voltage / voltage between two nodes
  {"kind": "v", "el": "R2"}: element voltage V(p) − V(n)
  {"kind": "i", "el": "R1"}: element current (p→n)
  {"kind": "p", "el": "Us"}: absorbed (average) power
  {"kind": "q", "el": "L1"}, {"kind": "s", "el": "Us"}, {"kind": "pf", "el": "Us"}: reactive power, apparent power, power factor (AC)
  {"kind": "req", "port": ["a", "b"]}, {"kind": "vth", "port": ["a", "b"]}, {"kind": "isc", "port": ["a", "b"]}, {"kind": "pmax", "port": ["a", "b"]}: equivalent resistance, open-circuit voltage, short-circuit current (a→b through the short), maximum power
  {"kind": "tau"}: time constant of a first-order circuit
  {"kind": "meter", "el": "A1"}: meter reading
  {"kind": "gain", "out": ["o"], "input": "Vi"}: network function V(o)/input source
  {"kind": "f0"}: resonant frequency (Hz)
  {"kind": "twoport", "ports": [["1", "1'"], ["2", "2'"]], "param": "z11"}: two-port parameters
- AC results are complex; pick with "part": mag (default), phase (degrees), re, im, db, rms.

=== Teaching quality ===
- Make it a good textbook exercise: clean data (answers preferably integers or simple fractions), 2–4 sub-questions per problem from easy to harder, optionally a final conceptual multiple-choice question.
- hints: 2–3, from gentle to specific, never just the answer (the first names the method, the last points at the key step).
- solution: complete and step by step; state the reason for each step (KCL/KVL, switching rule, three-element formula, …) with intermediate results, and end with a check (e.g. power balance).
- Write an explain for every question.
- level: 1 = plug into a formula, 2 = one or two steps, 3 = typical homework problem, 4 = combines several ideas, 5 = exam-challenge level.

=== Check before you answer ===
1. Go through the grid: every terminal is on a wire, the nodes match the intended circuit, no element is shorted.
2. Recompute every answer independently (with a second method, e.g. mesh analysis to check nodal analysis), to at least 4 significant figures; the reference direction decides the sign; convert units to SI.
3. Run npm run validate (or import the file into the app). If I send you validator messages, fix every one and output the complete JSON again.

=== Translation (i18n) ===
- Put the Chinese title, statement, tags, questions, hints and solution (tags and hints with the same count as the originals) in "i18n": {"zh": {...}}.
- questions is an array matching the top-level questions one to one (same count); each item has only ask and explain (and choices for multiple choice, same count); do not repeat find/answer/unit.
- hints must have the same count and order as the originals. Write natural Simplified Chinese for students, with the English term after key concepts, e.g. "戴维宁等效（Thevenin equivalent）". Keep numbers, units, symbols and element names unchanged.

=== Fill in ===
Chapter: ___________ (basics / equivalence / methods / theorems / opamp / storage / first-order / second-order / phasors / ac-analysis / ac-power / coupled / frequency / three-phase / two-port)
Topic: ___________ (e.g. Thevenin equivalent with a dependent source)
Difficulty (1–5): ___
How many: ___
Start file numbering at: ___ (e.g. 03)
Other requirements: ___________
```

<!-- ======================= COPY END ======================= -->

### Common validator messages and fixes

| Validator message | Cause / what to ask the AI to fix |
|---|---|
| `wrong answer — the file says answer = …, the engine computes …` | Check the drawing first (terminals connected as intended? directions?), then the sign and the units (SI base units), then rms vs peak |
| `… lies on the body of R1` / `… are on the same node (shorted)` | A wire runs through an element or ends in its middle: wires must stop at the element's terminals |
| `… is not connected to anything` | A terminal is one grid step away from the wire |
| `no node "a"` | Node names come only from labels / terminals, placed on a wire |
| `transient questions need a time "t"` | Every transient question needs t |
| `i18n.zh.questions: should be an array matching …` | The translated questions have a different count |
| `JSON syntax error` | Comments, trailing commas or `...` |
