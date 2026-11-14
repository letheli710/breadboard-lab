# Breadboard Lab · 面包板实验室

一个 3D 面包板电路模拟器 + 大一大二《电路分析》练习平台（中英双语）。帮助 EE 初学者理解“原理图 → 面包板”的对应关系，并练习电路分析课程的核心内容。课程规划见 [`docs/ROADMAP.md`](docs/ROADMAP.md)。

**覆盖范围（按邱关源、罗先觉《电路》第 5 版的章节对照）**：理论练习区覆盖第 1–18 章——电路模型与定律、电阻电路等效变换、一般分析方法（支路/网孔/回路/结点法）、电路定理、含运放电路、储能元件、一阶/二阶电路时域分析（零输入/零状态/全响应、阶跃响应）、相量法、正弦稳态分析与功率、耦合电感与理想变压器、频率响应与谐振、三相电路、非正弦周期电流电路（傅里叶级数与频谱、谐波分析、有效值与平均功率、三相电路中的高次谐波）、线性动态电路的复频域分析（拉普拉斯变换及性质、运算电路与附加电源、部分分式展开、网络函数与零极点、冲激响应与阶跃响应、卷积积分、稳定性）、电路方程的矩阵形式（电路的图、树、割集，关联矩阵 A、基本回路矩阵 B_f、基本割集矩阵 Q_f，结点/回路/割集方程的矩阵形式（含受控源、互感），状态方程）、二端口网络、非线性电阻电路（压控/流控、静态与动态电阻、曲线相交法、分段线性化与理想二极管、多个工作点、小信号分析；第 17 章的非线性动态电路——相平面、自激振荡——不在其中）、均匀传输线（原参数与副参数、双曲函数形式的正弦稳态解、行波与反射系数、匹配、无损耗线的输入阻抗与开路/短路线、λ/4 变换器与驻波、无畸变线、无损耗线的波过程与反射网格图）。
**尚未覆盖**：第 17 章的非线性动态电路；第 18 章只缺有损耗线的暂态和电感/电容端接的波过程。这些都列在 [`docs/ROADMAP.md`](docs/ROADMAP.md) 的待办里。

Coverage (mapped to Qiu & Luo, *Circuits*, 5th ed.): the practice area covers chapters 1–18 (laws, equivalence, nodal/mesh analysis, theorems, op-amps, storage elements, first/second-order time-domain response, phasors, AC analysis and power, coupled inductors, frequency response, three-phase, non-sinusoidal periodic circuits — Fourier spectra, harmonic analysis, rms values and average power, harmonics in three-phase systems — Laplace / s-domain analysis — transform properties, s-domain circuits with initial-condition sources, partial fractions, network functions, poles and zeros, impulse and step responses, convolution, stability — the matrix formulation (network graphs, trees and cut-sets; incidence, fundamental loop and cut-set matrices; node, loop and cut-set equations in matrix form with controlled sources and coupling; state equations), two-ports, and nonlinear resistive circuits: static and dynamic resistance, load lines, piecewise-linear and ideal-diode analysis, multiple operating points, small-signal analysis — and uniform transmission lines: primary and secondary parameters, the hyperbolic steady-state solution, travelling waves, reflection coefficient and matching, lossless lines with open/shorted stubs, λ/4 transformers and standing waves, the distortionless line, and waves on a lossless line with the bounce diagram). **Not covered yet:** nonlinear dynamic circuits (the rest of ch. 17); transients on lossy lines and wave processes with L/C terminations (ch. 18).

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
| 课程 Learn | 16 节分步课程：8 节面包板基础（面包板结构、电源与 GND、LED、原理图→面包板方法、串并联、按键、电源对比）+ 8 节仪器课（万用表、电流表、稳压电源 CV/CC、信号发生器与示波器、示波器双通道相位差、LM358 运放、开发板 GPIO、PWM 与 ADC），做实验之前先学会读表。步骤会在 3D 面包板上高亮要插的孔，每一步自动检查有没有做对，最后亲手读一个测量值。实验题顶部链接到它的先修课程。 |
| 挑战 Challenges | 看原理图在面包板上搭电路，点“检查”：全对会庆祝 🎉；错了会指出缺少/多出的元件、参数不对、哪几只脚该连没连、哪些不该连却连了、哪个元件接反了，并在 3D 中高亮。按期分组：入门 11 题 + 第 1–5 期实验 49 个（KCL/KVL 实测、戴维宁、运放、RC/RL/RLC 暂态、滤波器、谐振……用电流表、信号发生器和示波器测量；第 5 期 18 个单片机外围电路实验：GPIO 限流、拉/灌电流、上下拉、ADC 分压、光敏/热敏电阻、三极管/MOSFET 开关、继电器续流、5 V 电平转换、开漏、LDO 压差、供电预算、PWM DAC/调速、I²C 上拉、综合项目）。 |
| 练习 Practice | 纯理论练习区：20 章 291 题，覆盖电路模型与定律、等效变换、结点/网孔法、电路定理、运放、一阶/二阶电路、相量、正弦稳态、功率、耦合电感、频率响应、三相电路、非正弦周期电路（谐波分析）、复频域分析（拉普拉斯变换、网络函数与零极点、冲激响应与卷积）、电路方程的矩阵形式（关联矩阵、回路矩阵、割集矩阵、状态方程，带有向图）、二端口、非线性电阻电路（工作点、小信号分析，带 u–i 特性图和负载线）、均匀传输线（副参数、反射与驻波、输入阻抗、λ/4 变换器与短截线匹配、无损耗线的波过程）。看电路图填数值答案（支持 2.5k、-3mA 等写法），有提示和完整解答。每章侧栏最上面有「要点」页：按顺序讲的要点（各自链接练习题）、可打印的公式表（含成立条件和参考方向约定）、例题（结果由引擎核对）和易错点；答错时可一键回到本章要点。所有答案都由理想电路分析引擎自动核对（`npm run validate`）。**错题本 / 复习 / 测验**（侧栏上方）：答错或看过答案的每一问自动记进错题本（填了什么、识别出的错误类型如符号 / ×10³ / √2、日期、怎样改正），按章节和错误类型统计、可筛选、可盲做重试；莱特纳盒子间隔复习（1、3、7、21 天，答错回第 1 盒），页眉显示今日到期数；章节测验按难度分层抽题、限时可暂停、交卷前无任何反馈，交卷后逐题反馈和解答，错题自动入本。全部存在本机，可随进度一起导出/导入。 |
| 自由编辑 Sandbox | 随便搭。右侧实时生成**原理图**（按电压从高到低排，GND 在最底下）和结点表；可导出为题目 JSON。 |
| 知识 Guide | 面包板内部结构、GND 是什么、五步法、电源种类、常见错误。 |
| 导入 Import | 拖入题目文件夹 / JSON 文件；格式错误会逐条列出，可一键复制给 AI 修正。内含 AI 出题提示词。 |

电源：9V / AA 电池组 / CR2032（含内阻）、MB102 面包板电源模块（5V/3.3V，同时供上下两组电源轨）、可调稳压电源（CV/CC 限流）。
元件：跳线、电阻（色环）、LED（5 色）、二极管、电容、电感、四脚按键、拨动开关、电位器、LM358 运放。
仪器：电流表（串联测电流）、信号发生器（正弦/方波/三角波）、双通道示波器（自动 V/div、time/div，Vpp/频率/相位读数）。有信号发生器时，面包板电路按时域仿真。
单片机（第 5 期，只教电路、不跑程序）：ESP32-DevKitC 和 STM32 Blue Pill 开发板——每个 GPIO 在属性里设模式（输出高/低、输入、内部上拉/下拉、PWM、ADC、开漏），实时显示引脚电压、电流、读到的电平和 ADC 值；真实的输出电阻、引脚电流上限（超限“烧坏”）、3.3 V 不耐 5 V（STM32 的 FT 引脚除外）、板载稳压器和 USB 供电。器件：NPN 三极管、N-MOSFET（逻辑电平 / 标准电平）、5 V 继电器、直流电机、有源蜂鸣器、LDO 稳压器、光敏电阻、NTC 热敏电阻。PWM 按时域仿真（可接 RC 滤波、调速，看继电器/电机线圈断电时的感应电压尖峰）。详见 `docs/ROADMAP.md` 的 Phase 5 contract 和规范第 14 节。
工具：万用表（点孔读电压）、结点着色、悬停孔位显示内部相通的孔。实时诊断：短路、LED 烧毁/接反、元件被同一列短路、引脚悬空、多电源未共地。

## 链接与浏览器历史 Links

每个页面和打开的题目都有自己的网址（hash 路由，任何静态主机都能用，无需服务器配置），可以收藏、分享，浏览器的后退/前进可用；不带路由打开时回到上次的位置（首次访问进入“课程”）。
Every page and open item has its own URL (hash routes: work on any static host); Back / Forward work, and a visit without a route returns to the last location (Learn for first-time visitors).

| 网址 URL | 页面 Page |
|---|---|
| `#/learn/<lessonId>` | 课程 Learn（省略 id：上次打开的或第一节未完成的课） |
| `#/challenges/<id>` | 挑战 Challenges（id 属于未加载的组时会先加载该组） |
| `#/practice/<problemId>` | 练习 Practice |
| `#/practice/review`、`#/practice/review/due`、`#/practice/review/how`、`#/practice/quiz` | 错题本、今日复习、说明、测验 |
| `#/practice/summary/<chapter>[/<section>]` | 练习：本章要点 Key points（section 如 `idea-kcl`、`formulas`） |
| `#/sandbox` | 自由编辑 Sandbox |
| `#/guide/<section>` | 知识 Guide，可直达某张卡片：`breadboard` `ground` `five-steps` `power` `series-parallel` `led` `mistakes` `basics`（点卡片右上角的编号即可复制链接） |
| `#/import` | 导入 Import |

id 就是题目文件的 `id`（URL 编码）。不存在的 id 会提示并打开该页默认内容。只有切换页面/题目才会产生历史记录，编辑面包板不会。代码：`src/state/router.ts`（解析/生成，纯函数）、`src/state/routeSync.ts`（与 store 同步）。
Ids are the files' `id` (URI-encoded); an unknown id shows a toast and opens the page's default. Only page / item changes add history entries, board edits don't. Code: `src/state/router.ts`, `src/state/routeSync.ts`.

## 题库文件夹

- `challenges/` —— 放入符合 `breadboard-challenge/1` 规范的 `.json` 即自动收录：构建时生成轻量索引（`virtual:challenge-index`），完整题目按组（课程、入门、第 1–5 期）分块，打开该组的题时才加载（开发模式热更新）。
- 规范：[`docs/CHALLENGE_FORMAT.md`](docs/CHALLENGE_FORMAT.md)，JSON Schema：`schema/challenge.schema.json`
- 让 AI 出题：[`docs/AI_PROMPT.md`](docs/AI_PROMPT.md)
- `summaries/<章节>.json` —— 每章的要点页，规范 `chapter-summary/1`：[`docs/SUMMARY_FORMAT.md`](docs/SUMMARY_FORMAT.md)（例题数值由引擎核对，本章每道题都必须被某个要点链接）
- `problems/<章节>/` —— 理论题，规范 `circuit-problem/1`：[`docs/PROBLEM_FORMAT.md`](docs/PROBLEM_FORMAT.md)，AI 出题提示词 [`docs/AI_PROMPT_PROBLEMS.md`](docs/AI_PROMPT_PROBLEMS.md)，大纲 [`docs/SYLLABUS.md`](docs/SYLLABUS.md)
- 校验题目（含自洽性测试和参考答案验证）：`npm run validate` 或 `npm run validate -- 某个文件夹`；加 `-- --lang en` 输出英文信息
- 界面语言：右上角 **中文 / EN** 切换（记在浏览器里）。题目文件可以带 `i18n` 翻译，见规范第 11 节。

## 开发

```bash
npm test             # 引擎单元测试（vitest）+ 所有内置题目的验证（npm run validate）
npm run test:slow    # 慢的第二路线核对（均匀传输线各题换成细分的集总 RLGC/LC 链路；CI 里单独一个 job）
npm run lint         # ESLint（typescript-eslint + react-hooks）
npm run format:check # Prettier 格式检查（CI 必须通过；`npm run format` 自动修正。题目 / 要点 JSON、schema 和 Markdown 不参与，见 .prettierignore）
npm run build        # 类型检查 + 生产构建（dist/）
npm run size         # 构建后检查入口体积预算（入口 ≤ 225 kB，入口 + 预加载块 ≤ 375 kB；入口里的题目索引每题约 265 B）
npm run check        # 以上全部：tsc -b、lint、format:check、test、vite build、size（和 CI 一致）
```

浏览器测试 Browser tests（Playwright + Chromium；CI 里单独的 `e2e` job，失败时上传截图）：

```bash
npm run e2e              # VITE_E2E=1 构建到 dist-e2e/，启动 vite preview，依次运行 scripts/e2e-routes.cjs（路由 / 历史）、scripts/e2e-bench.cjs（3D 工作台冒烟测试）和 scripts/e2e-a11y.cjs（axe 无障碍检查）
npm run e2e -- --no-build bench   # 复用 dist-e2e/，只跑某个套件（routes、bench、a11y）
```

工作台测试覆盖：第 1 课的孔位标签和步骤高亮、点孔放元件（核对保存的布局）、悬停提示、拖动移动和被拒绝的放置、撤销 / 重做、属性滑块一次拖动 = 一步撤销、删除 + 撤销提示、示波器实验（参考答案、检查、波形、测量题对错——正确读数取自校验器 `--readings`）、第 5 期 PWM 实验的按需渲染（空闲 3 秒 0 帧）、视角按钮、切换语言不重建画布、损坏的 `bb.layout.*`、ErrorBoundary。测试钩子（`window.__bb`：孔位 → 屏幕坐标、帧计数；`?e2e&crash=canvas` 注入渲染错误）只在 `VITE_E2E=1` 的构建里、且网址带 `?e2e` 时存在，正式构建里整段代码被去掉（`src/e2e/flag.ts`）。
Accessibility (WCAG 2.1 AA, axe results, keyboard building on the bench, known limits): [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md); the a11y suite fails on any new serious / critical axe violation. 无障碍说明见该文件。
The bench suite drives the real production build through test hooks that exist only in `VITE_E2E=1` builds and only with `?e2e` in the URL (`src/e2e/flag.ts`); a normal build contains none of it. Chromium needs WebGL (SwiftShader flags are passed). Locally Playwright's preinstalled Chromium is used; in CI the workflow installs it (`npx playwright install --with-deps chromium`).

CI：`.github/workflows/ci.yml` 在每次 push / PR 时运行 `npm ci`、`tsc -b`、lint、`npm test`（含 validate）、`vite build`、体积预算检查（`npm run size`）和 Prettier 格式检查。工具链：Vite 8（Rolldown）、Vitest 5，需要 Node 20.19+ 或 22.12+。运行时：React 18.3、zustand 5、three.js r182、@react-three/fiber 8、@react-three/drei 9（three 停在 r182：r183 起 `THREE.Clock` 弃用，而 r3f 8 / 9 都还在用它，每次加载都会打印警告；React 19 + fiber 9 + drei 10 已经验证可用，但 react-dom 19 让每个页面的首屏 JS 多约 77 kB，超出体积预算，暂未采用，见 ROADMAP）。`npm audit` 剩 10 个 moderate，全部是 ESLint / typescript-eslint 依赖的 minimatch，上游尚无修复（只影响开发工具，不进入构建产物）。格式化提交记录在 `.git-blame-ignore-revs`（本地 `git config blame.ignoreRevsFile .git-blame-ignore-revs`）。

性能：内置理论题在运行时**不再**用引擎重算答案（这一步由 `npm run validate` 和 `npm test` 保证，修改题目后务必运行）；侧栏用构建时生成的轻量索引（`virtual:problem-index`，见 `scripts/problem-index-plugin.ts`），完整题目按章节分块、打开时才加载。导入页导入的文件仍然完整校验。练习 / 导入 / 知识页面和 three.js 各自单独分块，练习、导入和知识页面不加载 three.js 和面包板侧栏；面包板题同样只在打开所在分组时加载。实测体积见 [`docs/ROADMAP.md`](docs/ROADMAP.md) 的“性能”一节。3D 工具栏的 **流畅** 按钮切换低画质（阴影 1024、像素比 ≤ 1.5），弱设备上会自动开启，选择记在浏览器里。

代码结构：`src/core`（面包板几何、元件库、网表、直流求解器、时域仿真、诊断、答案匹配、原理图布局、理论题分析引擎——纯 TS，无 UI 依赖）、`src/three`（3D 场景）、`src/ui`（界面）、`src/state`（状态）。

模拟限制（面包板仿真；理论题引擎是理想元件，不受这些限制）：

- 没有信号发生器 / PWM 时只算**直流工作点**（电容开路、电感 = 1 Ω 绕组电阻）；有信号发生器或 PWM 引脚时按**时域**仿真到周期稳态（BDF2 定步长）。
- 时域步长固定：每个周期 256 步起，最多 **4096 步**。若电路的 LC 振荡比信号源快得多（每个振荡周期不到 10 步，例如 1 Hz 方波驱动 159 kHz 的 LC），振铃会被抹平——示波器和诊断面板会给出警告。第一个信号源决定时间基准，其他信号源最好是它的整数倍频率。
- 二极管、LED（Vf + 12 Ω）、蜂鸣器、三极管、MOSFET、运放输出限幅、稳压器、单片机引脚钳位都是**分段线性**模型；每步最多迭代 30 次（直流 150 次），没收敛时诊断面板会提示。
- LM358：开环增益 1e5、输出 10 Ω、输出范围 [V−, V+ − 1.5 V]；没有压摆率 / 增益带宽积限制，输入电流为 0，输出电流不计入电源负载。
- 仪器理想化：电流表内阻 0.1 Ω；万用表电压档和示波器探头**没有输入阻抗**（不负载电路），探头接地夹不接大地；信号发生器内阻 50 Ω。
- 电容为理想电容：没有 ESR、漏电，也**不区分电解电容极性**（反接不会报错）。
- 第 5 期器件：直流电机 = 8 Ω + 2 mH，**没有反电动势**和转速模型；继电器按线圈电流吸合/释放（有回差），没有触点抖动和动作时间；MOSFET 的过驱动电压按 5 mV 量化，没有栅极电容；PWM 占空比量化到时间网格；单片机不运行程序，每个 GPIO 的模式是静态设置的。

Simulation limits (breadboard only): DC operating point unless a generator / PWM pin is present, then fixed-step BDF2 to periodic steady state, 256–4096 steps per period (under-resolved LC ringing is flagged); piecewise-linear diodes/LEDs/transistors/regulators (30 iterations per step, unsettled steps flagged); LM358 without slew rate or GBW; 0.1 Ω ammeter, voltmeter/scope with no input impedance; ideal capacitors with no electrolytic polarity; motor without back-EMF; no firmware (static GPIO modes).
