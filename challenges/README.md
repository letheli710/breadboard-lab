# challenges/

这个文件夹里的每个 `.json` 文件就是 Breadboard Lab 里的一节课（lesson）或一道挑战题（challenge）。
构建时会为这里的所有题目生成一个轻量索引（`virtual:challenge-index`，见 `../scripts/challenge-index-plugin.ts`），列表只用索引；完整题目按组（课程、入门、第 1–5 期）分块，打开该组的某道题时才加载。开发模式（`npm run dev`）下修改文件会热更新。
Every file here is listed in a build-time index; the full files are code-split per group (lessons, intro, phase 1–5) and loaded when a challenge of that group is opened.

- 格式说明：[`../docs/CHALLENGE_FORMAT.md`](../docs/CHALLENGE_FORMAT.md)
- 让 AI 帮你出题：[`../docs/AI_PROMPT.md`](../docs/AI_PROMPT.md)
- 编辑器校验用的 JSON Schema：[`../schema/challenge.schema.json`](../schema/challenge.schema.json)

约定：
- 文件名用两位数字前缀排序：`01-…` 到 `08-…` 是入门课，`09-…` 起是挑战题。
- 课程各期的实验（`"phase": 1–5`，见 `../docs/ROADMAP.md`）用三位编号：第 1 期 `201-…`，第 2 期 `221-…`，第 3 期 `241-…`，第 4 期 `261-…`，第 5 期（单片机外围电路）`280-…`。挑战列表会按“入门 / 第1期 / …”分组显示。
  Course-phase experiments (`"phase": 1–5`) use three-digit numbers: phase 1 `201-…`, phase 2 `221-…`, phase 3 `241-…`, phase 4 `261-…`, phase 5 (MCU peripherals) `280-…`; the challenge list groups them by phase.
- 以 `_` 开头的文件不会被加载（可以放草稿）。
- 内置题目以中文为基础语言，`"i18n": { "en": { ... } }` 里是英文翻译（界面切到 English 时显示）。修改中文的 steps / hints / tests 时，记得同步修改对应位置的英文（按位置一一对应）。格式见 `CHALLENGE_FORMAT.md` §11。
  Built-in challenges are written in Chinese with an English translation in `i18n.en`, shown when the UI is in English. When you edit the Chinese steps / hints / tests, update the English entry at the same position too.
- 新增或修改后运行 `npm run validate`，确保全部 ✔。
