# 章节要点文件格式 `chapter-summary/1` / Chapter summary format

「练习 Practice」里每一章的侧栏最上面有一个「要点 / Key points」入口，打开的就是这一章的要点页：**要点**（按顺序的短段落，每条链接练习它的题目）、**公式表**（每个公式都写明成立条件和参考方向约定，可单独打印）、一到两道**例题**（电路图用题目的同一套画图 JSON，分步讲解，结果由引擎核对）和**易错点**。

Each Practice chapter has a key-points page: ordered **key ideas** (each linking the problems that practise it), a printable **formula sheet** (every formula with the conditions under which it holds and its reference-direction conventions), one or two **worked examples** (drawn with the same schematic JSON as problems, verified by the engine) and **common mistakes**.

- 文件：`summaries/<chapter>.json`，每章一个，文件名就是章节 id（见 [`PROBLEM_FORMAT.md`](./PROBLEM_FORMAT.md) §2）。以 `_` 开头的文件会被跳过。
- 编辑器 schema：[`schema/summary.schema.json`](../schema/summary.schema.json)；契约：`src/core/summary/types.ts`；校验器：`src/core/summary/parse.ts`（`parseSummary`）。
- 符号与用语严格按 [`NOTATION.md`](./NOTATION.md)（结点；u/i 小写瞬时值；`U̇_x` 相量；cos 参考；英文也用 u/U）。
- 运行时每章的要点是一个单独按需加载的 chunk，不影响首屏大小。

```bash
npm run validate              # challenges/、problems/、summaries/ 全部校验
npm run validate summaries    # 只校验要点
```

---

## 1. 顶层字段 / Top level

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `format` | string | ✔ | `"chapter-summary/1"` |
| `chapter` | string | ✔ | 章节 id，必须与文件名一致 |
| `lang` | `"zh"` \| `"en"` | | 正文语言，默认 `"zh"` |
| `intro` | text | | 一两句引言：这一章讲什么、最重要的习惯是什么 |
| `ideas` | array | ✔ | 要点（§2），按讲授顺序 |
| `formulas` | array | ✔ | 公式表（§3） |
| `examples` | array | ✔ | 例题（§4），1–2 道（最多 3 道） |
| `mistakes` | array | ✔ | 易错点（§5） |
| `i18n` | object | 建议 | `{ "en": { "intro": "..." } }` |

text = 字符串或字符串数组（数组按行拼接）。正文支持题目的 Markdown 子集（`**粗体**`、`` `代码` ``、`- ` / `1. ` 列表、`#` 小标题）和符号标记（下面 §6）。

**翻译放在每一项旁边**：每个 idea / formula / example / mistake 都有自己的 `i18n.en`（基础语言是英文时写 `i18n.zh`）。缺翻译是警告——内置内容要求零警告。

## 2. 要点 `ideas`

```json
{
  "id": "ref-dir",
  "title": "参考方向与关联参考方向",
  "text": ["第一段……", "第二段……"],
  "problems": ["basics-02-reference-direction", "basics-05-source-properties"],
  "i18n": { "en": { "title": "...", "text": ["...", "..."] } }
}
```

- `id`：字母、数字、`-`、`_`，文件内唯一。题目页的「本章要点」链接会跳到链接了这道题的**第一个**要点。
- `problems`：练习这个要点的题目 id（必须是本章的题目）。一题可以出现在多个要点里。
- **链接完整性（错误）**：每个链接的 id 都必须存在并且属于本章；本章的**每一道题**都必须至少被一个要点链接——这保证题目用到的每种方法都在要点里讲过。新增题目时，记得把它加到对应要点的 `problems` 里。
- 写法：像一位好老师在两页纸上讲给学生听——定义、为什么、怎么用、什么时候不能用。和本章题目的考点一致，不写题目用不到的偏门内容。

## 3. 公式表 `formulas`

```json
{
  "id": "ohm",
  "idea": "ohm",
  "name": "欧姆定律",
  "expr": "u = Ri　（非关联：u = −Ri）",
  "when": "线性电阻；u、i 为关联参考方向时取正号。",
  "note": "可选的补充说明",
  "i18n": { "en": { "name": "Ohm's law", "expr": "...", "when": "..." } }
}
```

- `idea`：所属要点的 id；公式表按要点分组显示。
- `when`（必填）：**成立条件**（线性、直流稳态、t ≥ 0₊、正弦稳态、理想运放工作在线性区……）和**参考方向约定**（关联/非关联、同名端、相量用有效值……）。没有条件的公式是最常见的错误来源。
- `expr` 中英文相同时也要在 `i18n.en` 里写一遍（含中文的下标如 `P_{吸}` 要译成 `P_{abs}`）。

## 4. 例题 `examples`

例题就是一道“带完整解答的题目”：电路图、分析类型、数值结果的写法与 `circuit-problem/1` **完全相同**（`schematic`、`analysis`、`find`），校验时被转换成一道题交给 `parseProblem`——几何 → 网表 → 引擎重新计算每个结果，误差超过 0.5% 报错。

```json
{
  "id": "power-signs",
  "ideas": ["power", "kcl"],
  "title": "两个电源，谁在发出功率？",
  "statement": "图示电路中 U_s = 10 V，R_1 = 2 Ω……求……",
  "schematic": { "elements": [...], "wires": [...], "grounds": [[0, 4]], "marks": [...] },
  "analysis": { "type": "dc" },
  "results": [
    { "id": "ua", "ask": "u_a", "find": { "kind": "v", "nodes": ["a"] }, "answer": 8, "unit": "V" }
  ],
  "steps": ["1. **找未知数。** ……", "2. **KCL（结点 a）。** …… **u_a = 8 V**……"],
  "i18n": { "en": { "title": "...", "statement": "...", "results": [{ "ask": "u_a" }], "steps": ["..."], "notes": [] } }
}
```

- `results`：例题得到的**每一个**数值（包括步骤里的中间结果）都写成一个带 `find` 和 `answer` 的结果（字段同题目的 question）。页面上显示为“结果（已由引擎核对）”。`ask` 写成量的名字（`u_a`、`P_Us（吸收）`），不要写“= ?”。
- `steps`：分步讲解（`1. ` 列表、`**粗体**`）。
- **没有未经核对的数字（错误）**：`steps`（以及它的翻译）里每一个“数字 + 单位”（`8 V`、`1.5 A`、`4.7 kΩ`、`0.05 s`、`36.87°`、`50 Hz`、`−81 W`……）都必须是**已知量**（图中元件值、电源值、分析频率、题干里写出的数）或**某个 result 的值**（按绝对值比较，允许 1% 的舍入误差；15° 的整数倍的角度总是允许）。所以：算出来的数一律加进 `results`；不带单位的算式（`12/4 = 3`、`1² × 2`）不检查。
- `i18n.<lang>.results` 与 `results` 按位置一一对应，只翻译 `ask`；`notes` 翻译图上的注释（同题目格式）。
- 暂态例题（`analysis.type: "tran"`）里问 `req` 时也要写 `t`（例如 `"t": "inf"`，换路后的电路），和题目的规则一样。
- 例题不要和本章某道练习题一模一样（换电路或换数值），但要用到本章最核心的方法。

## 5. 易错点 `mistakes`

```json
{ "id": "ohm-sign", "idea": "ohm", "text": "u、i 非关联时仍写 u = Ri……", "i18n": { "en": { "text": "..." } } }
```

`idea` 可选：写了就在易错点下面显示一个回到该要点的链接。写学生**真的会犯**的错误，并说明怎样避免。

## 6. 公式排版 / Formula markup

除了题目文字的下标规则（`R_1`、`u_ab`、`U̇_s`、`R_{左}`，见 NOTATION.md §2、§4），要点页（以及所有题目文字）还支持四种排版标记，大括号可以嵌套：

| 写法（JSON 里反斜杠要写两个） | 显示 |
|---|---|
| `\\frac{U_s}{R_1 + R_2}` | 分式（分子在上、分母在下） |
| `\\sqrt{LC}` | 带横线的根号 |
| `e^{−t/τ}`、`I^{2}R` | 上标 |
| `∫_{0}^{t}`、`(…)_{max}` | 非字母后面的下标 |

除此之外都是普通文字：Unicode 的 `²`、`√2`、`∠`、`ω`、`τ`、`·`、`×` 直接写。分式只用在公式表和需要的地方，正文里简单的比值写成 `u/R` 即可。旧题目里的 `e^(−5t)` 写法不受影响（只有 `^{` 才是上标）。

## 7. 打印 / Printing

公式表右上角的“打印”只打印公式表（打印样式表隐藏页面其余部分）；在要点页直接用浏览器打印则打印整页（折叠的部分也会展开）。
