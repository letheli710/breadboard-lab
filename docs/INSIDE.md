# 拆开看 / Inside — 项目哲学与写法 / Project philosophy and how to write it

## 哲学 / Philosophy

**每遇到一个新东西，先拆开，再动手。** 面包板、电池、LED、万用表、LM358、开发板……学生第一次碰到它时，先看它的“拆解”（teardown）：

1. **外形**：它长什么样，每只脚 / 每个旋钮叫什么（用表格列清楚）；
2. **透视**：把外壳变透明，里面有什么；
3. **内部结构**：真正起作用的部件是怎么连的；
4. **等效电路**：拆成电路课里能计算的模型（电阻、电源、受控源……）；
5. **怎么算**：从模型一步步推出公式，带数字，链接到“计算”页可以改数的计算卡片；
6. **局限**：真实器件和理想模型差多少，什么时候不能忽略。

左边是一层一层的文字，右边是跟着一层层拆开的图（SVG）；文字里带下划线的词和图上的部分互相高亮。由外到内（top-down）看懂结构，再由内到外（bottom-up）用公式把它“装回去”。

**Every new thing gets taken apart before it is used.** Outside → x-ray → inner structure → equivalent circuit → the formulas, derived step by step with numbers → the limits of the model. Text on the left, a picture on the right that comes apart layer by layer; underlined words and parts of the picture highlight each other.

### 搭还是不搭 / Build it or start from a kit

- **自己从零搭**：本课要学的就是“怎么接”（面包板结构、电源轨、元件极性、串并联、第一次接一个芯片的电源脚）——搭的过程就是学习内容。
- **给半成品（`start` + `startNote`）**：本课要学的是“测量 / 现象 / 计算”，而接线本身是之前学过的重复劳动（信号发生器 + 示波器 + 一堆 RC、MCU 外围电路的供电部分）。只留下与本课知识点有关的那几根线让学生补齐，或者直接测。`startNote` 告诉学生哪些已经搭好、为什么、他要补什么。

## 术语 / Terms

中文正文里第一次出现的术语写成 **English（中文）**，之后直接用英文，例如 op-amp（运算放大器）、node（结点）、rail（电源轨）。不要写“运放”这类缩写。引脚、参数、模式这类“有好几项”的信息一律用表格。

## 代码结构 / Code

| 文件 | 作用 |
|---|---|
| `src/inside/types.ts` | `Teardown`、`Layer`、`Callout`、`CalcCard` 类型 |
| `src/inside/registry.ts` | 轻量索引：每个拆解的 id、标题、哪些课 / 实验用到它（课程面板据此显示“第 0 步 · 先拆开看”，第一次打开时自动显示） |
| `src/inside/td/<id>.tsx` | 一个拆解：`Figure`（SVG，按 `layer` 显示 / 隐藏各组）+ 各层文字 |
| `src/inside/calc/*.tsx` | 计算卡片，按组；`all.ts` 汇总 |
| `src/inside/TeardownView.tsx` | 左文右图、滚动切换图层、高亮联动；`vis(layer, from, to)`、`sub('R_out')` |
| `src/inside/pages.tsx` | `#/inside`、`#/calc` 页面，课程里的 `BenchInside` / `LookInside` / `LessonCalcs` |

样板：`td/breadboard.tsx`、`td/lm358.tsx`、`calc/basics.tsx`、`calc/opamp.tsx`。

### 写一个拆解 / Writing a teardown

- 所有文字用 `tr('中文', 'English')`；`build()` 每次渲染都会调用（切换语言即重建）。
- 图：`viewBox` 约 `0 0 560 440`。每个可以被指到的部分加 `data-part="名字"`（可以有多个名字，空格分隔）。层的显示 / 隐藏用 `className={vis(layer, from, to)}`。SVG 文本里的下标用 `{sub('R_in')}`。通用样式类：`tdp-line`、`tdp-fill`、`tdp-metal`、`tdp-copper`、`tdp-plus`、`tdp-minus`、`tdp-accent`、`tdp-lbl`、`tdp-big`、`td-panel`、`td-panel-title`、`td-small`（见 `inside.css`）；颜色固定写也可以，但高亮靠 `.td-on`（滤镜发光，`tdp-*` 类还会变色）。
- 正文（`body`）：`[[part|词]]` 链接到图上的部分；`$…$` 行内公式、单独一行 `$$…$$` 是展示公式，用 `MathText` 写法：`\\frac{a}{b}`、`\\sqrt{x}`、`x^{2}`、`R_{in}`、`U_s`（在 TS 字符串里反斜杠写两次）。
- `table`：表头 + 行，`parts` 给每一行指定一个图上的部分（悬停行即高亮）。
- `formulas`：深色公式条 + 说明。`calcs`：链接到计算卡片 id。
- `callouts`：引线标注 `{ part, label, x, y, lx, ly, anchor? }`，(x, y) 是图上的点，(lx, ly) 是文字位置；注意别超出 viewBox。
- 至少 5 层：外形 → 透视 → 内部 → 等效电路 → 计算（→ 局限）。每层的文字要像教授在课上讲：先说是什么，再说为什么，再给数字。

### 写一张计算卡片 / Writing a calc card

`{ id, group, title, tex, use, vars, out, compute, why, example?, pitfalls?, Figure?, teardowns?, lessons?, chapter? }`。`why` 是一步步的推导（编号列表），`example` 带真实数字（最好就是某个实验里的值），`lessons` 列出用到它的课 / 实验 id（课程面板会显示“这一课要会算”），`chapter` 是练习区章节 id（`basics`、`equivalence`、`methods`、`theorems`、`opamp`、`storage`、`first-order`、`second-order`、`phasors`、`ac-analysis`、`ac-power`、`frequency`……）。`Figure` 用 `calc/fig.tsx` 里的小元件（`R`、`C`、`L`、`V`、`I`、`D`、`Gnd`、`OpAmp`、`Path`、`Dot`、`T`、`VArrow`），viewBox `0 0 260 150`。
