# challenges/

这个文件夹里的每个 `.json` 文件就是 Breadboard Lab 里的一节课（lesson）或一道挑战题（challenge）。
程序启动时会自动加载这里的所有题目；开发模式（`npm run dev`）下修改文件会热更新。

- 格式说明：[`../docs/CHALLENGE_FORMAT.md`](../docs/CHALLENGE_FORMAT.md)
- 让 AI 帮你出题：[`../docs/AI_PROMPT.md`](../docs/AI_PROMPT.md)
- 编辑器校验用的 JSON Schema：[`../schema/challenge.schema.json`](../schema/challenge.schema.json)

约定：
- 文件名用两位数字前缀排序：`01-…` 到 `08-…` 是入门课，`09-…` 起是挑战题。
- 以 `_` 开头的文件不会被加载（可以放草稿）。
- 新增或修改后运行 `npm run validate`，确保全部 ✔。
