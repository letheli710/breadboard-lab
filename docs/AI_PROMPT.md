# 让 AI 帮你出题：提示词模板

把下面 **“复制开始”到“复制结束”** 之间的全部内容复制给 ChatGPT / Claude 等 AI，
在最后的 **填写区** 写上你想要的主题、难度和数量。

AI 返回后：
1. 把每个 JSON 分别保存成 `.json` 文件（例如 `20-my-topic.json`），放进项目的 `challenges/` 文件夹，或用程序里的 **导入** 按钮 / 拖放导入。
2. 运行 `npm run validate` 检查。如果有错误，把错误信息原样贴回给 AI，让它修正。

完整格式说明见 [`CHALLENGE_FORMAT.md`](./CHALLENGE_FORMAT.md)。

---

<!-- ======================= 复制开始 ======================= -->

```text
你是一名电子工程（EE）入门老师，要为一个 3D 面包板电路模拟器 "Breadboard Lab" 编写练习题。
学生是讲中文、用英文学 EE 的初学者，最大的困惑是：原理图（schematic）怎么对应到面包板上，尤其是电源（power）和地（GND）。
请严格按照下面的格式规范输出 JSON 题目文件。

=== 输出要求 ===
- 每个题目是一个独立的 JSON 对象，每个放在单独的 ```json 代码块里，代码块前写一行建议文件名（如 "文件名：20-voltage-divider.json"）。
- 必须是严格合法的 JSON：双引号、没有注释、没有尾随逗号、不要省略号。
- 说明文字（title / summary / description / steps / hints）用简体中文，专业术语附英文，例如“限流电阻（current-limiting resistor）”。description 用 \n 换行，不要用 Markdown。

=== 面包板 ===
- 主区孔位 a1–j30：行 a–j，列 1–30。每一列的 a–e 是一条金属条（相通），f–j 是另一条；e 和 f 之间是中间凹槽（trench），不相通。
- 电源轨：tp1–tp30（上方 +，红）、tn1–tn30（上方 −，蓝）、bp1–bp30（下方 +）、bn1–bn30（下方 −）。每条轨整行相通；上方轨和下方轨互不相通。
- 一个孔只能插一只脚（包括跳线的每一端）。两点式元件的两只脚不能插在同一条金属条上（会被短路）。

=== 文件结构 ===
{
  "format": "breadboard-challenge/1",            // 必须原样
  "id": "kebab-case-唯一id",                      // 只用字母/数字/-/_
  "title": "...",
  "kind": "lesson" 或 "challenge",               // lesson 要写 steps；challenge 要写 hints
  "level": 1-5,
  "summary": "一句话",
  "description": "讲解正文，教会概念",
  "concepts": ["英文术语 中文", ...],
  "components": [ ... ],                          // 目标电路元件（不含跳线）
  "nets": [ {"name": "VCC", "pins": ["V1.+", "R1.1"]}, ... ],   // 或用 "connections": [["V1.+","R1.1"], ...]
  "tests": [ ... ],
  "hints": ["...", ...],
  "steps": [ {"text": "...", "highlight": ["tp1","tn1"]}, ... ],
  "solution": { "parts": [ ... ] },
  "options": { "tolerance": 0.05, "allowExtraComponents": false }
}
（上面的 // 只是给你看的说明，输出里绝对不能有注释。）

=== components（目标电路）===
写法：{"ref": "R1", "type": "resistor", "resistance": "330"}，属性直接平铺。省略属性 = 任何值都接受。
ref 字母开头，如 V1、R1、LED1、D1、SW1、S1、RV1、C1、BAT1、PM1、PSU1。
只允许以下 type（不要发明其它元件，例如没有晶体管、IC、蜂鸣器、电机、交流电源）：
- dc_source      引脚 + -              属性 voltage       ← 首选电源：匹配任何电池/电源模块/稳压电源
- battery        引脚 + -              属性 variant: "9V" | "2xAA"(3V) | "3xAA"(4.5V) | "4xAA"(6V) | "CR2032"(3V)
- power_module   引脚 + -              属性 voltage: 5 或 3.3
- bench_supply   引脚 + -              属性 voltage, currentLimit（安培）
- resistor       引脚 1 2              属性 resistance，如 "220"、"4.7k"
- led            引脚 anode cathode    属性 color: red | yellow | green | blue | white
- diode          引脚 anode cathode
- capacitor      引脚 1 2              属性 capacitance，如 "100n"（直流下相当于断路）
- pushbutton     引脚 1 2              测试用属性 pressed: true/false
- switch (SPDT)  引脚 a com b          测试用属性 position: "a" | "b"
- potentiometer  引脚 1 2 3（2=滑动端） 属性 resistance；测试用属性 wiper: 0..1（0=靠 1 脚）
除非这一题就是讲某种电源，否则一律用 dc_source。整个电路只放一个电源。

=== nets / connections ===
引脚写成 "REF.pin"。每个节点（node）列出它包含的所有引脚。请把每个元件的每个引脚都放进某个节点（不要留空引脚）。
给关键节点起名：电源正极节点叫 "VCC"，电源负极节点叫 "GND"，其他如 "VOUT"。

=== tests（必须有，用来检查电路行为）===
{"name": "按下按键：LED 亮", "set": {"SW1": {"pressed": true}}, "expect": {"LED1": "on"},
 "voltages": [{"pin": "R2.1", "ref": "V1.-", "min": 2.85, "max": 3.15}]}
- expect 只能用于 LED："on" 或 "off"（电流 > 0.5mA 算亮）。
- voltages：pin 相对 ref 的电压（伏）在 [min, max] 之间；ref 省略 = 相对 GND。范围留 ±5% 左右余量。
- 有按键/开关/电位器时，每种状态各写一个测试（例如松开→灭、按下→亮）。
- 所有 ref 和引脚都用 components 里的名字。

=== 直流仿真模型（DC only，用来算数值）===
- LED 正向压降 Vf：红 1.8V，黄 2.0V，绿 2.1V，蓝/白 3.0V；另有约 12Ω 内阻。二极管 Vf ≈ 0.65V。
- 电源内阻：9V 电池 1.5Ω，AA 每节 0.15Ω，CR2032 15Ω，电源模块 0.1Ω，稳压电源 0.02Ω。
- 每个 LED 必须串联限流电阻，使电流在 5–20mA，绝不超过 25mA：R ≈ (V − Vf) / I。并联 LED 时每个 LED 有自己的电阻。
- 电容在直流下是断路；没有交流、没有时间变化（不要出 RC 延时、闪烁、PWM 类题目）。

=== solution（强烈建议提供：证明题目可解）===
{"parts": [
  {"type": "battery", "ref": "BAT1", "variant": "9V", "pins": {"+": "tp1", "-": "tn1"}},
  {"type": "wire", "pins": {"a": "tp5", "b": "a5"}, "color": "red"},
  {"type": "resistor", "ref": "R1", "resistance": "470", "pins": {"1": "c5", "2": "c9"}},
  {"type": "led", "ref": "LED1", "color": "red", "pins": {"anode": "d9", "cathode": "d12"}},
  {"type": "wire", "pins": {"a": "a12", "b": "tn12"}, "color": "blue"}
]}
- 布局里不能用 dc_source，要写具体电源（battery / power_module / bench_supply），电压要和 components 一致。
- 两点式元件用 "pins"，引脚名必须是原名：wire a/b；resistor 1/2；led、diode anode/cathode；capacitor 1/2；battery、bench_supply +/-。
- 占位式元件用 "at"：
  · pushbutton  "at": "e5" → 占 e5、e7、f5、f7，横跨凹槽；第 5 列（e5/f5）是引脚 1，第 7 列（e7/f7）是引脚 2。按键的 at 一律用 e 行。
  · switch      "at": "c10" → a=c10, com=c11, b=c12（同一行连续 3 列）
  · potentiometer "at": "c4" → 1=c4, 2=c5, 3=c6
  · power_module "at": "tp1" → 插入 tp1、tn1、bp1、bn1，上下两组轨道都有电
- 跳线 color 只能用 red / blue / green / yellow / white（红=+，蓝=GND）。
- 每个孔只用一次！写完后逐个孔检查有没有重复，检查每个节点的所有引脚确实在同一条金属条（或用跳线连通），不同节点没有误连。
- 惯例：电源接在第 1 列的轨道上（tp1/tn1），元件从左往右排，用主区 a–e（或 f–j），GND 用跳线接回 tn（或 bn）。

=== 限制 ===
- 每题不超过 8 个元件（跳线不算）。
- lesson：description 详细讲解概念；steps 一步一步，每步 highlight 相关孔位；必须有 solution。
- challenge：description 写清楚要求（包括电源接哪个脚、哪个灯接开关哪一侧——开关 a/b、电位器 1/3 在判分时可互换，测试却依赖它们）；hints 2–3 条，由浅入深；必须有 solution。
- 输出前自己验算：每个 LED 的电流、每个电压测试的期望值。

=== 填写区 ===
主题：___________（例如：分压器 / 按键 + LED / 认识 GND / 二极管 / 电位器）
难度（1–5）：___
类型：lesson / challenge / 都要
数量：___
文件名编号从：___ 开始（例如 20）
其他要求：___________
```

<!-- ======================= 复制结束 ======================= -->

---

## 常见 AI 错误与修正

| 校验器报错 | 原因 / 让 AI 怎么改 |
|---|---|
| `"format" 必须是 "breadboard-challenge/1"` | 拼写错误或漏写 |
| `孔 xx 已经被 xx 占用` | 同一个孔插了两只脚，换一个空孔 |
| `LED 颜色必须是 ...`（出现在跳线上） | 跳线 color 用了 `#xxxxxx` 或 `black`，改成 red/blue/green/yellow/white |
| `solution 不正确 — 断开了 / 多连了` | 布局和 components 的连接对不上：让 AI 逐个节点检查金属条 |
| `target 自检失败 — 测试失败` | 测试期望值算错了，或题目本身不可能实现：让 AI 重新计算 |
| `电流 xx mA，超过 25 mA` | 限流电阻太小，换大一点 |
| `JSON 语法错误` | AI 加了注释、尾随逗号或省略号 |
