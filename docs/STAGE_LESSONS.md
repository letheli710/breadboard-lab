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
- `quiz[]`：选项可带各自的 `feedback`；每题可带 `concept`（考的知识点，几个字）和 `review_act`（讲这个知识点的幕号）。答错时出现「回到第 N 幕复习」，通关后显示**错因雷达**（每个知识点一根辐条，第一次答错的列出并带回跳按钮）。
- `lesson_meta.learning_objectives`：学习目标，一行一条，显示在课题下方。
- 图层 `short`：镜头栏里的短名（约 8 个字，如「01 导通透视」）；`label` 保留全名（悬停提示与幕卡里显示）。

## 舞台与讲解的联动 / Stage state (`src/stage/stageStore.ts`)

- `useLit()`：当前点亮的 id（悬停 > 引导例题当前步 > 本幕 `halo`）。图层里被点亮的对象要明显高亮。
- 图层里的对象悬停时调用 `useStage.getState().setHover([id])`，离开时 `setHover(null)`，正文里的 `[[id|…]]` 会跟着亮。
- `useStageParam(key, fallback)`：课程自定义参数（滑块、开关、模式……）。幕的 `sync.params`、引导步骤的 `params` 会写入；图层控件也可以改。
- 悬停表 `hover_map` 里的 id 在左下角显示名称和说明；生成的 id 用 `describeTarget`。

## 可复用的部件

- 3D 面包板：`src/stage/BreadboardXray.tsx` 导出 `colX`、`ROW_Z`、`RAIL_Z`、`Shell`、`Clips`、`SurfaceGlow`、`TrenchGlow`、`Resistor`、`Lead`、`Chip`、`CameraRig`；W1-L0 的场景是范例。
- 万用表接法台：`src/stage/DmmProbe.tsx`。实验台仪器（电源、信号源、示波器）：`src/stage/bench`（见「实验台公共仪器」）。色环：`src/stage/colorCode.ts`。
- 公式：`Tex`（`src/stage/StageText.tsx`）。
- **World 3 的运放芯片**：3D 面包板上的运放一律用 `src/stage/Lm358.tsx` 的 `Lm358`（DIP-8，引脚 1–4 在 f 行、5–8 在 e 行，`lm358Pin(c0, pin)` 求插孔），全章同一个实验箱芯片。
- **学生可见文字里不出现执行稿的字段名**（如 `breadboard_safety_and_scaling`、`component_scaling_applied`）。
- **测验通过后的“主线下一课”**按登记顺序指向下一节新版课（跨 World）；页脚的上一项/下一项仍按课程地图顺序。
- **宽图在手机上**：viewBox 宽 ≥ 700 的插图（双栏对照图）在 640px 以下保持 600px 宽、在卡片内横向滚动，不用各课自己写规则。
- **深色 SVG → 浅色主题**：执行稿里写死深色背景（`#0f172a`）的内联 SVG，一律用 `lightSvg(svg)`（`src/stage/svgTheme.ts`）转成站点的暖白主题，全站同一套映射；个别对比度不够的地方再在本课里微调。

## 实验台公共仪器 (src/stage/bench)

**从现在起，每节课 3D 实验台上的台式可调直流电源、函数信号发生器、双通道示波器一律用 `src/stage/bench` 的组件**（`import { BenchSupply, FunctionGenerator, Oscilloscope } from '../../bench'`），不再在课里自画。名字来自 `BENCH_NAMES`；三件仪器都按舞台规矩：`useLit()` 含 `id`（或 `litIds` 之一）时琥珀色高亮，指针移入 / 移出时 `setHover([id])` / `setHover(null)`（`hoverIds` 可改成别的 id 组）。W4-L8 是迁移范例。

共同约定（`geometry.ts`）：

- 坐标与 `BreadboardXray` 相同；仪器立在台面 y = −1 上。`position: [x, z]` 是机箱中心，`yaw`（弧度，0 = 面板朝 +z 朝向观众）转向，`scale` 整体缩放。
- 面包板上的点 `BoardPoint`：插孔 `'a10'`；电源轨 `'T+3'`（上外侧红 +）、`'T-4'`（上内侧蓝 −）、`'B+3'`（下内侧红 +）、`'B-4'`（下外侧蓝 −）；或板面坐标 `[x, z]`。夹子类的端点还可以给世界坐标 `[x, y, z]`（夹在元件引脚上，不插残线）。
- 引线自动画成一道弧；要绕开别的东西就给 `via` 中间点。
- 读数用 `Html`（手机上也看得清），宽 ≤ 960 px 时示波器设置行里的次要项（`minor`）隐藏，≤ 640 px 时字号缩小。

### `BenchSupply` 台式可调直流电源

| 属性 | 说明 |
|---|---|
| `id`、`position`、`yaw?`、`scale?` | 舞台 id 与摆放 |
| `channels` | 1–3 路输出：`{ v, limit?, i?, readout?, color? }`——设定电压（V，取正值）、限流（A）、实时电流（A，显示「12.3 mA · CV」，到限流显示 CC）、替换第二行的自定义文字、+ 端子颜色 |
| `series?` | CH1、CH2 串联成 ±V：端子 `'+'`（红，+V）、`'com'`（黑，中点 = GND）、`'-'`（蓝，−V）；有第三路时再加 `'3+'`、`'3-'` |
| `label?` | 默认 `supplyLabel(channels, series)`：「台式可调直流电源（5 V）」「（±9 V）」「（18 V / 36 V）」 |
| `leads?` | `{ from: 端子, to: BoardPoint \| BoardPoint[], color?, litIds?, via? }`，每个 `to` 一根插进孔里的引线。单路的端子是 `'+'`、`'-'`；多路独立是 `'1+'`、`'1-'`、`'2+'` … |
| `lcd?`、`off?`、`litIds?`、`hoverIds?` | 整块替换显示屏的行（`{ text, strong? }[]`）；输出关闭（屏变粉）；额外点亮 / 悬停 id |

```tsx
<BenchSupply
  id="bb_psu"
  position={[-21, -18]}
  channels={[{ v: 9 }, { v: 9 }]}
  series
  leads={[
    { from: '+', to: 'T+6', litIds: ['rail_p9'] },
    { from: 'com', to: ['T-7', 'B+6'], litIds: ['rail_gnd'] },
    { from: '-', to: 'B-7', litIds: ['rail_m9'] },
  ]}
/>
```

### `FunctionGenerator` 函数信号发生器

| 属性 | 说明 |
|---|---|
| `id`、`position`、`yaw?`、`scale?` | 舞台 id 与摆放 |
| `waveform` | `'sine' \| 'square' \| 'triangle'` |
| `frequency`、`vpp`、`offset?` | 频率（Hz）、**峰峰值**（V）、直流偏置（V），显示在屏上 |
| `readout?` | `'vpp'`（默认，「5.00 Vpp · OFS 0 V」）或 `'span'`（「0 … 5.00 V」低 … 高） |
| `impedance?`、`output?`、`offNote?` | 输出阻抗（屏上加「· 50 Ω」）；输出开关（默认开：绿灯；关：红灯、屏变粉，`offNote` 接在「OUTPUT OFF ·」后） |
| `out?`、`gnd?`、`outVia?`、`gndVia?` | BNC 转鳄鱼夹的红夹 / 黑夹：`BoardPoint`（夹在插孔里的残线上）或世界坐标 |
| `knob?` | `{ range: [fMin, fMax], onChange(f), id? }`：面板上可拖动的频率旋钮（对数刻度，向右 / 向上拖 200 px = 一个十倍频，取两位有效数字），悬停 id 默认 `${id}_knob` |
| `lcd?`、`label?`、`litIds?`、`hoverIds?` | 替换显示屏；浮动名牌（默认 `BENCH_NAMES.generator`） |

```tsx
<FunctionGenerator id="bb_gen" position={[-43, -2]} waveform="sine" frequency={f} vpp={1} out="h22" gnd="T-18"
  knob={{ range: [10, 100_000], onChange: (f) => lab.set({ f }) }} />
```

### `Oscilloscope` 双通道示波器

| 属性 | 说明 |
|---|---|
| `id`、`position`、`yaw?`、`scale?` | 舞台 id 与摆放 |
| `ch1?`、`ch2?`、`math?` | `{ data, vdiv, pos?, color?, on?, label?, width? }`：`data` 是函数 `v(t)`（t 秒、v 伏）或采样点 `[t, v][]`；`vdiv` V/div；`pos` 0 V 在中心线上方几格；颜色默认 CH1 琥珀、CH2 青绿、MATH 紫（`TRACE_COLORS`）；`label` 改设置行文字 |
| `time` | `{ div, start?, label? }`：s/div、屏幕左边缘的时刻（默认 0） |
| `trigger?` | `{ source: 'ch1' \| 'ch2', level, edge?, at?, label? }`：右边缘画触发电平、上边缘画触发时刻，设置行加「Trig ↑ CH1 +2.50 V」 |
| `cursors?` | `{ kind: 't', at }` 或 `{ kind: 'v', ch, at }`，可带 `label`、`color`、`dashed`（默认虚线）；也可画削波线等参考线 |
| `osd?`、`autoOsd?` | 接在设置行后面的读数 `{ text, tone?: 'ch1' \| 'ch2' \| 'math' \| 'warn', minor? }`；`autoOsd={false}` 去掉自动的 V/div、s/div、触发项 |
| `probes?` | `{ ch1?, ch2? }`，每个 `{ tip, ground?, id?, groundId?, litIds?, groundLitIds?, groundBad?, color? }`：探头钩插在 `tip`，地夹在 `ground`（`BoardPoint` 或世界坐标），`groundBad` 把地夹涂红；id 默认 `${id}_ch1`、`${probe id}_gnd` |
| `progress?` | 0 … 1，单次扫描从左往右画到哪里（动画由课程自己推进） |
| `label?`、`litIds?`、`hoverIds?`、`samples?` | 浮动名牌（默认 `BENCH_NAMES.scope`）；函数波形的采样点数（默认 800） |

```tsx
const ch1 = useMemo(() => ({ data: b.vin, vdiv: 1 }), [b]);
const ch2 = useMemo(() => ({ data: b.vout, vdiv: 1, pos: -1 }), [b]);
<Oscilloscope id="bb_scope" position={[12, -20]} ch1={ch1} ch2={ch2} time={{ div: 0.2e-3 }}
  trigger={{ source: 'ch1', level: 0 }} osd={[{ text: `CH2 ${vpp.toFixed(2)} Vpp`, tone: 'ch2' }]}
  probes={{ ch1: { tip: 'i22', ground: 'T-20' }, ch2: { tip: 'g38', ground: 'T-40' } }} />
```

屏幕只用**一张画布贴图**（`scopeCanvas.ts`）：网格、地标、触发标、光标、波形都画进 1024 px 宽的 2D 画布，只有显示内容变了（波形按 1/200 格取指纹）才重画、上传一次贴图并 `invalidate()`。清晰（远看有 mipmap）、便宜（一个面片，没有每帧工作，也不会每次渲染重建线条几何体），在 `frameloop="demand"` 下正确。设置行是 `Html` 文字，手机上也看得清。不要再用 drei `Line` 或 `Html` 里的 SVG 画示波器屏幕。

### 小部件与纯函数

- `Wire`（管线）、`PlugLead`（插进孔里的引线）、`ClipLead`（带鳄鱼夹的引线）、`ProbeLead`（示波器探头 + 地线）、`AlligatorClip`、`Stub`、`NameTag`、`Lcd`、`BenchTable`（可选的台面，y = −1）、`hoverHandlers(ids)`、`useAnyLit(ids)`。
- 纯函数（有单元测试）：`supplyLabel`、`supplyTerminals`、`supplyLcd`、`genLcd`、`knobAngle`、`dragFrequency`、`fmtHz`、`fmtVdiv`、`fmtTdiv`、`boardXZ`、`toWorld`、`sampleTrace`、`traceDivs`、`scopeScreen`。

### 课程迁移步骤

1. 删掉课里自画的电源盒 / 信号源 / 示波器 / 探头（连同只为它们写的 `Clip`、`Stub`、`Line` 屏幕），改用上面三个组件；**舞台 id、悬停文字、镜头预设不变**（`position` 填原来机箱中心的 x、z，镜头框就不用动）。
2. 课里的 `hole()` 写法换成 `BoardPoint`（`'G4'` 这类自定义写法改成 `'T-4'` 等）；原来夹在元件引脚上的夹子用世界坐标。
3. 波形函数或采样数组、V/div、s/div 原样交给 `ch1` / `ch2`；传进去的对象用 `useMemo` 包一下（不包也对，只是每次渲染多采样一次）。课里自己的读数放 `osd`。
4. 课文里提到颜色的（如「蓝色 CH2」）就用 `color` 保持原色；否则用默认色。
5. 前后各截一次图（宽屏 + 390 px，每个镜头预设）对比，检查悬停、点亮与控件联动。

## 课程结构约定

- 引导例题不剧透：同一道题的完整推导（③ 代入数值）放在 `guided` 之后，作为“通关复盘”板书。
- 下节预告放在 `after_quiz`（自测之后）。
- 自测：每个错选项都有自己的 `feedback`，每道题有一张不泄题的小图（`figure`）。

## 检查 / Checks

`npx tsc -b`、`npx eslint src/stage`、`npx prettier --check src/stage`、`npx vitest run src/stage`、`npm run validate`。页面上不能残留 `$` 或 `\frac` 源码（KaTeX 渲染失败时会退回到普通文字，检查时看 `.tex-fallback` 数量应为 0）。

## 全站统一升级（Phase 1 封板后，已完成）

- 自测门槛：保持全站 4/4 全对通过（执行稿的 `passing_score` 不启用）。
- 错因雷达与回跳按钮：`QuizItem.concept` / `review_act`，42 课全部补齐（各 World 的 `upgrade.test.ts` 检查）。
- 学习目标：`lesson_meta.learning_objectives`，42 课全部补齐。
- 图层短标题：`StageLayer.short`，镜头栏一行放下。
- 手机舞台内控件：触控目标 36 px（舞台外仍是 44 px）。
- 实验台公共仪器：`src/stage/bench`（台式电源、函数信号发生器、示波器），16 节 3D 课全部迁移。
- 共享 `Resistor` 支持五环；`lightSvg` 处理 `<style>` 类规则。
- 舞台图层切换防抖（150 ms）并对出错图层重试一次。

### 仍可选做
- 轴向色环电感（课程负责人确认暂不需要）。
- 示波器探头"搁在桌上"状态、光标线宽、包络/带状波形、电源引线单独悬停 id、转向电源的铭牌/显示位置。
- W1 各课只有 2 道自测题，错因雷达只显示列表（雷达图需要至少 3 个知识点）。
