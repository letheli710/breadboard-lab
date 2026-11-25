# 新版课（stage lessons）制作说明 / Authoring stage lessons

课程总规范：[`BLUEPRINT_V2.md`](BLUEPRINT_V2.md)；每节课的执行稿：`docs/lessons/W1-Ln.md`。页面：`#/lesson/<slug>`（`w1-l0` …）。

## 文件 / Files

| 位置 | 作用 |
|---|---|
| `src/stage/registry.ts` | 登记：slug、编号、World、标题、分钟数（不加载课程本身） |
| `src/stage/lessons/index.ts` | slug → 课程文件（懒加载） |
| `course/worlds.json` | `"lesson:<slug>"` 放进 World 的某一节；`npm run validate` 检查 |
| `src/stage/lessons/<slug>/index.ts` | **课程本身**：`export default` 一个 `StageLesson`（`src/stage/types.ts`） |
| `src/stage/lessons/<slug>/*.tsx` | 这节课自己的左侧图层组件（用 `React.lazy` 挂到 `renderers`） |

## StageLesson 要点

- `renderers: { [layerId]: Component }`：每个 `left_stage_spec.layers[i].id` 都要有一个组件。组件填满左侧舞台区域（flex 列），自己画控件和 SVG。
- `right_acts[]`：每幕 `sync`（滚到这一幕时左侧切到哪个图层、点亮哪些 id、设什么参数），`blocks`，`inline_svg`（每幕必有一张局部图），最后一幕可带 `quiz`。
- Block 类型：`p`、`ol`、`ul`、`origin`（① 公理溯源）、`formula`（② 蓝色符号通式卡，TeX）、`calc`（③ 绿色逐步计算卡）、`note`、`figure`、`table`、`guided`（苏格拉底引导例题）、`colorcode`。
- 行内记号：`**粗体**`、`` `代码` ``、`$TeX$`（KaTeX）、`[[id1,id2|术语]]`（与左侧舞台对象双向高亮）。
- `guided`：`problem`、`problem_svg?`、`steps[]`（每步 `title`、`mini_svg?`、`question`、`hint`、`options[{text, correct, feedback}]`、`board[]`（答对后写上黑板的 TeX）、`halo?`、`params?`、`layer?`（这一步要看的图层；学生手动选了图层时不切）），`done_params?`（最后一步答完后写入的舞台参数，例如揭晓舞台上为防剧透而遮住的数值），`conclusion?`。
- `quiz[]`：选项可带各自的 `feedback`。

## 舞台与讲解的联动 / Stage state (`src/stage/stageStore.ts`)

- `useLit()`：当前点亮的 id（悬停 > 引导例题当前步 > 本幕 `halo`）。图层里被点亮的对象要明显高亮。
- 图层里的对象悬停时调用 `useStage.getState().setHover([id])`，离开时 `setHover(null)`，正文里的 `[[id|…]]` 会跟着亮。
- `useStageParam(key, fallback)`：课程自定义参数（滑块、开关、模式……）。幕的 `sync.params`、引导步骤的 `params` 会写入；图层控件也可以改。
- 悬停表 `hover_map` 里的 id 在左下角显示名称和说明；生成的 id 用 `describeTarget`。

## 可复用的部件

- 3D 面包板：`src/stage/BreadboardXray.tsx` 导出 `colX`、`ROW_Z`、`RAIL_Z`、`Shell`、`Clips`、`SurfaceGlow`、`TrenchGlow`、`Resistor`、`Lead`、`Chip`、`CameraRig`；W1-L0 的场景是范例。
- 万用表接法台：`src/stage/DmmProbe.tsx`。色环：`src/stage/colorCode.ts`。
- 公式：`Tex`（`src/stage/StageText.tsx`）。
- **宽图在手机上**：viewBox 宽 ≥ 700 的插图（双栏对照图）在 640px 以下保持 600px 宽、在卡片内横向滚动，不用各课自己写规则。
- **深色 SVG → 浅色主题**：执行稿里写死深色背景（`#0f172a`）的内联 SVG，一律用 `lightSvg(svg)`（`src/stage/svgTheme.ts`）转成站点的暖白主题，全站同一套映射；个别对比度不够的地方再在本课里微调。

## 课程结构约定

- 引导例题不剧透：同一道题的完整推导（③ 代入数值）放在 `guided` 之后，作为“通关复盘”板书。
- 下节预告放在 `after_quiz`（自测之后）。
- 自测：每个错选项都有自己的 `feedback`，每道题有一张不泄题的小图（`figure`）。

## 检查 / Checks

`npx tsc -b`、`npx eslint src/stage`、`npx prettier --check src/stage`、`npx vitest run src/stage`、`npm run validate`。页面上不能残留 `$` 或 `\frac` 源码（KaTeX 渲染失败时会退回到普通文字，检查时看 `.tex-fallback` 数量应为 0）。
