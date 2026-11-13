# Breadboard Lab · 面包板实验室

一个 3D 面包板电路模拟器 + 大一大二《电路分析》练习平台（中英双语）。帮助 EE 初学者理解“原理图 → 面包板”的对应关系，并覆盖电路分析课程的全部内容。课程规划见 [`docs/ROADMAP.md`](docs/ROADMAP.md)。

## 运行

双击 `run.bat`（首次会自动 `npm install`），或：

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:5180

## 功能

| 模式 | 说明 |
|---|---|
| 课程 Learn | 8 节分步课程：面包板结构、电源与 GND、LED、原理图→面包板方法、串并联、按键、电源对比。步骤会在 3D 面包板上高亮要插的孔。 |
| 挑战 Challenges | 看原理图在面包板上搭电路，点“检查”：全对会庆祝 🎉；错了会指出缺少/多出的元件、参数不对、哪几只脚该连没连、哪些不该连却连了、哪个元件接反了，并在 3D 中高亮。按期分组：入门 11 题 + 第 1–4 期实验 31 个（KCL/KVL 实测、戴维宁、运放、RC/RL/RLC 暂态、滤波器、谐振……用电流表、信号发生器和示波器测量）。 |
| 练习 Practice | 纯理论练习区：15 章 216 题，覆盖电路模型与定律、等效变换、结点/网孔法、电路定理、运放、一阶/二阶电路、相量、正弦稳态、功率、耦合电感、频率响应、三相电路、二端口。看电路图填数值答案（支持 2.5k、-3mA 等写法），有提示和完整解答。所有答案都由理想电路分析引擎自动核对。 |
| 自由编辑 Sandbox | 随便搭。右侧实时生成**原理图**（按电压从高到低排，GND 在最底下）和节点表；可导出为题目 JSON。 |
| 知识 Guide | 面包板内部结构、GND 是什么、五步法、电源种类、常见错误。 |
| 导入 Import | 拖入题目文件夹 / JSON 文件；格式错误会逐条列出，可一键复制给 AI 修正。内含 AI 出题提示词。 |

电源：9V / AA 电池组 / CR2032（含内阻）、MB102 面包板电源模块（5V/3.3V，同时供上下两组电源轨）、可调稳压电源（CV/CC 限流）。
元件：跳线、电阻（色环）、LED（5 色）、二极管、电容、电感、四脚按键、拨动开关、电位器、LM358 运放。
仪器：电流表（串联测电流）、信号发生器（正弦/方波/三角波）、双通道示波器（自动 V/div、time/div，Vpp/频率/相位读数）。有信号发生器时，面包板电路按时域仿真。
单片机（第 5 期，只教电路、不跑程序）：ESP32-DevKitC 和 STM32 Blue Pill 开发板——每个 GPIO 在属性里设模式（输出高/低、输入、内部上拉/下拉、PWM、ADC、开漏），实时显示引脚电压、电流、读到的电平和 ADC 值；真实的输出电阻、引脚电流上限（超限“烧坏”）、3.3 V 不耐 5 V（STM32 的 FT 引脚除外）、板载稳压器和 USB 供电。器件：NPN 三极管、N-MOSFET（逻辑电平 / 标准电平）、5 V 继电器、直流电机、有源蜂鸣器、LDO 稳压器、光敏电阻、NTC 热敏电阻。PWM 按时域仿真（可接 RC 滤波、调速、看反电动势）。详见 `docs/ROADMAP.md` 的 Phase 5 contract 和规范第 14 节。
工具：万用表（点孔读电压）、节点着色、悬停孔位显示内部相通的孔。实时诊断：短路、LED 烧毁/接反、元件被同一列短路、引脚悬空、多电源未共地。

## 题库文件夹

- `challenges/` —— 放入符合 `breadboard-challenge/1` 规范的 `.json` 即自动加载（开发模式热更新）。
- 规范：[`docs/CHALLENGE_FORMAT.md`](docs/CHALLENGE_FORMAT.md)，JSON Schema：`schema/challenge.schema.json`
- 让 AI 出题：[`docs/AI_PROMPT.md`](docs/AI_PROMPT.md)
- `problems/<章节>/` —— 理论题，规范 `circuit-problem/1`：[`docs/PROBLEM_FORMAT.md`](docs/PROBLEM_FORMAT.md)，AI 出题提示词 [`docs/AI_PROMPT_PROBLEMS.md`](docs/AI_PROMPT_PROBLEMS.md)，大纲 [`docs/SYLLABUS.md`](docs/SYLLABUS.md)
- 校验题目（含自洽性测试和参考答案验证）：`npm run validate` 或 `npm run validate -- 某个文件夹`；加 `-- --lang en` 输出英文信息
- 界面语言：右上角 **中文 / EN** 切换（记在浏览器里）。题目文件可以带 `i18n` 翻译，见规范第 11 节。

## 开发

```bash
npm test        # 引擎单元测试 + 所有内置题目的验证
npm run build   # 类型检查 + 生产构建（dist/）
```

代码结构：`src/core`（面包板几何、元件库、网表、直流求解器、诊断、答案匹配、原理图布局——纯 TS，无 UI 依赖）、`src/three`（3D 场景）、`src/ui`（界面）、`src/state`（状态）。

模拟限制：仅直流稳态（电容视为断路），LED/二极管为分段线性模型。
