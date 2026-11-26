# 传送门 / Portals

当一个单元提到后面（或前面）某个 World 才详细展开的概念时，在它底部放一个**传送门**，直接通到那里；目标单元的顶部自动出现一条**反向链接**，指回来源。所有传送门登记在一张表里：`course/portals.json`。界面从这张表生成，单元文件里不硬编码链接（单元可以用 `portal` block 指定传送门显示的位置，见 `docs/UNIT_FORMAT.md`）。

A unit that mentions an idea taught in another World gets a **portal** to it at the bottom; the target shows a **reverse link** at the top. All portals live in one table, `course/portals.json`; the UI is generated from it.

## 1. 一条传送门 / One portal

```json
{
  "id": "preview-integrator",
  "from": "unit:w3-5j-preview",
  "to": "challenge:exp3-opamp-integrator",
  "what": { "zh": "门后讲什么（一句话）", "en": "…" },
  "back": { "zh": "反向链接上的那句话：为什么来源指向这里", "en": "…" },
  "prereq": ["unit:w3-5e-inverting", "chapter:storage"],
  "minutes": 30
}
```

| 字段 | 说明 |
|---|---|
| `from`、`to` | 引用 / refs：`challenge:<id>`（课程或实验）、`chapter:<id>`（理论章节）、`problem:<id>`、`unit:<id>`（学习单元）、`lesson:<slug>`（新版课，`src/stage/registry.ts`，World 里也可以放）、`pending:<id>`（已登记、还没建的单元） |
| `what` | 门后讲什么 |
| `back` | 反向链接的说明，**必填** |
| `prereq` | 前置要求（引用，可以为空）。界面按学习进度显示“现在可看”，或“建议先学 World X”；**门不上锁**，随时能点进去 |
| `minutes` | 预计时长 |

“学过”的判定：课程 / 实验通过；单元点了“完成”；理论题做完；理论章节做完一半以上的题。

## 2. 界面 / In the app

- 来源页底部：传送门卡片（门后讲什么、前置要求和状态、预计时长），旁边有“稍后再看”。面包板课程 / 实验在任务面板底部，理论章节在要点页底部，学习单元在页尾（或 `portal` block 所在的位置）。
- 目标页顶部：反向链接，写着从哪里来、为什么。
- 穿过传送门后，页面顶部有一条面包屑，一键回到来源。
- “稍后再看”队列：页眉的“待看”按钮随时打开；每条显示来源和目标，看完可以勾掉。存在本地存储 `bb.course.later`。
- 目标还没建好（`pending:`）：卡片显示“即将上线”，不能点；建好同 id 的单元后自动接通。

## 3. 检查 / Checks (`npm run validate`, part of `npm run check`)

- **断链**：`from`、`to`、`prereq` 或单元里的引用指向不存在的内容。
- **缺少反向链接**：传送门没有 `back`。
- **指向未登记单元**：`pending:<id>` 不在 `course/pending.json` 里，或待建单元没有登记在 `docs/REBUILD_PLAN.md`（写成 `` `<id>` ``）。
- 另外：每个课程 / 实验 / 理论章节 / 单元恰好放在一个 World 里；单元里的 `portal` block 必须是从本单元出发的传送门。
