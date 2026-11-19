# 课程内容导出 / Course export

生成时间：2026-11-19 · 生成命令：`node scripts/course-export/export.cjs` · 99 项（实验 / 课程 85，理论单元 14）

按课程顺序（`course/worlds.json`）每项一个 Markdown 文件，给逐课改写教学文本的人 / AI 用。每个实验文件里：

1. **左侧工作台**：3D 面包板换成俯视截图（起点、每一步之后、参考答案）+ 元件表；目标原理图。
2. **右侧面板**：学生从上往下看到的全部内容（单轨流的每个节点：文字、步骤和它的自动检查、插图、拆解层、推导、测量题）。
3. **测量题一览**（含参考答案的读数）、对比、提示、功能测试。
4. 用到的**拆解**和**计算卡片**的全文。
5. **English**：界面英文版的同一份内容。

理论单元（`units/`）按“直觉 → 推导 → 仿真 → 面包板 → 回链”五层逐块列出。

改写规则见 `docs/CHALLENGE_FORMAT.md` §17（轨道格式）和 `docs/RAIL_PLAN.md`；样板课：3.1 LM358、1.1 面包板、1.5 电流表。

## World 1 · 基础定律与直流分压

| 编号 | 标题 | 类型 | id | 文件 |
|---|---|---|---|---|
| 1.1 | [面包板：孔底下的金属条](w1/1.01-1-lesson-breadboard-basics.md) | 课程（分步） | lesson-breadboard-basics | challenges/01-breadboard-basics.json |
| 1.2 | [电源与 GND：电流回家的路](w1/1.02-1-lesson-power-and-ground.md) | 课程（分步） | lesson-power-and-ground | challenges/02-power-and-ground.json |
| 1.3 | [LED：为什么一定要限流电阻](w1/1.03-1-lesson-light-an-led.md) | 课程（分步） | lesson-light-an-led | challenges/03-light-an-led.json |
| 1.4-1 | [万用表：看见电压](w1/1.04-1-lesson-multimeter.md) | 课程（分步） | lesson-multimeter | challenges/101-lesson-multimeter.json |
| 1.4-2 | [分压器：从 9 V 得到 3 V](w1/1.04-2-challenge-voltage-divider.md) | 实验 | challenge-voltage-divider | challenges/10-voltage-divider.json |
| 1.5 | [电流表：串联才能测电流](w1/1.05-1-lesson-ammeter.md) | 课程（分步） | lesson-ammeter | challenges/102-lesson-ammeter.json |
| 1.6 | [从原理图到面包板](w1/1.06-1-lesson-schematic-to-breadboard.md) | 课程（分步） | lesson-schematic-to-breadboard | challenges/04-schematic-to-breadboard.json |
| 1.7-1 | [串联：只有一条路](w1/1.07-1-lesson-series.md) | 课程（分步） | lesson-series | challenges/05-series-resistors.json |
| 1.7-2 | [两颗 LED 串联](w1/1.07-2-challenge-two-leds-series.md) | 实验 | challenge-two-leds-series | challenges/09-two-leds-series.json |
| 1.7-3 | [KVL：绕一圈，电压加起来是 0](w1/1.07-3-exp-kvl-loops.md) | 实验 | exp-kvl-loops | challenges/202-kvl-loops.json |
| 1.8-1 | [并联：每条路有自己的电流](w1/1.08-1-lesson-parallel.md) | 课程（分步） | lesson-parallel | challenges/06-parallel-leds.json |
| 1.8-2 | [KCL：流进结点的 = 流出结点的](w1/1.08-2-exp-kcl-ammeters.md) | 实验 | exp-kcl-ammeters | challenges/201-kcl-ammeters.json |
| 1.9-1 | [按键：一个能合上的缺口](w1/1.09-1-lesson-pushbutton.md) | 课程（分步） | lesson-pushbutton | challenges/07-pushbutton.json |
| 1.9-2 | [电位器调光](w1/1.09-2-challenge-pot-dimmer.md) | 实验 | challenge-pot-dimmer | challenges/11-pot-dimmer.json |
| 1.9-3 | [拨动开关：红灯还是绿灯](w1/1.09-3-challenge-spdt-selector.md) | 实验 | challenge-spdt-selector | challenges/12-spdt-selector.json |
| 1.9-4 | [一个按键控制两颗 LED](w1/1.09-4-challenge-button-parallel.md) | 实验 | challenge-button-parallel | challenges/13-button-parallel-leds.json |
| 1.10-1 | [电源大比较：电池、电源模块、稳压电源](w1/1.10-1-lesson-power-supplies.md) | 课程（分步） | lesson-power-supplies | challenges/08-power-supplies.json |
| 1.10-2 | [纽扣电池：内阻看得见](w1/1.10-2-challenge-coin-cell.md) | 实验 | challenge-coin-cell | challenges/17-coin-cell.json |
| 1.10-3 | [蓝色 LED：3.3 V 还是 5 V？](w1/1.10-3-challenge-module-blue-led.md) | 实验 | challenge-module-blue-led | challenges/16-module-5v-blue-led.json |
| 1.10-4 | [稳压电源：恒压、恒流和限流](w1/1.10-4-lesson-bench-supply.md) | 课程（分步） | lesson-bench-supply | challenges/103-lesson-bench-supply.json |
| 1.10-5 | [稳压电源 12 V 点亮两颗白光 LED](w1/1.10-5-challenge-bench-supply.md) | 实验 | challenge-bench-supply | challenges/18-bench-supply-12v.json |
| 1.11-1 | [稳压电源的恒流模式：一个电流源](w1/1.11-1-exp-cc-current-source.md) | 实验 | exp-cc-current-source | challenges/204-cc-current-source.json |
| 1.11-2 | [分流：10 mA 怎么分给几条支路](w1/1.11-2-exp-current-divider.md) | 实验 | exp-current-divider | challenges/205-current-divider.json |
| 1.12-1 | [排错：这颗 LED 为什么不亮？](w1/1.12-1-challenge-fix-the-circuit.md) | 实验 | challenge-fix-the-circuit | challenges/19-fix-the-circuit.json |
| 1.12-2 | [串并联混合网络](w1/1.12-2-challenge-series-parallel.md) | 实验 | challenge-series-parallel | challenges/15-series-parallel-network.json |
| 1.12-3 | [测出一个网络的等效电阻](w1/1.12-3-exp-measure-req.md) | 实验 | exp-measure-req | challenges/207-measure-req.json |

## World 2 · 网络分析与电路定理

| 编号 | 标题 | 类型 | id | 文件 |
|---|---|---|---|---|
| 2.1 | [结点电压法：一个电压源加一个电流源](w2/2.01-1-exp-nodal-analysis.md) | 实验 | exp-nodal-analysis | challenges/224-nodal-analysis.json |
| 2.2-1 | [叠加定理：两台电源分别作用，再相加](w2/2.02-1-exp-superposition.md) | 实验 | exp-superposition | challenges/221-superposition.json |
| 2.2-2 | [电源等效变换：诺顿 ⇄ 戴维宁](w2/2.02-2-exp-source-transformation.md) | 实验 | exp-source-transformation | challenges/208-source-transformation.json |
| 2.3-1 | [戴维宁等效：量开路电压和短路电流](w2/2.03-1-exp-thevenin-measure.md) | 实验 | exp-thevenin-measure | challenges/222-thevenin-measure.json |
| 2.3-2 | [最大功率传输：转电位器，找功率最大的点](w2/2.03-2-exp-max-power.md) | 实验 | exp-max-power | challenges/223-max-power.json |
| 2.4 | [惠斯通电桥：把电流表调到零](w2/2.04-1-exp-wheatstone-bridge.md) | 实验 | exp-wheatstone-bridge | challenges/206-wheatstone-bridge.json |
| 2.5 | [分压器接上负载会怎样](w2/2.05-1-exp-loaded-divider.md) | 实验 | exp-loaded-divider | challenges/203-loaded-divider.json |

## World 3 · 运算放大器基础

| 编号 | 标题 | 类型 | id | 文件 |
|---|---|---|---|---|
| 3.1-1 | [芯片与内部结构](w3/3.01-1-w3-chip.md) | 理论单元 | w3-chip | units/w3-chip.json |
| 3.1-2 | [LM358 上面包板：先不接反馈，再接成跟随器](w3/3.01-2-lesson-lm358.md) | 课程（分步） | lesson-lm358 | challenges/106-lesson-lm358.json |
| 3.2-1 | [op-amp（运算放大器）只做一件事](w3/3.02-1-w3-5a-black-box.md) | 理论单元 | w3-5a-black-box | units/w3-5a-black-box.json |
| 3.2-2 | [为什么有虚短](w3/3.02-2-w3-5b-virtual-short.md) | 理论单元 | w3-5b-virtual-short | units/w3-5b-virtual-short.json |
| 3.3-1 | [电压跟随器：增益 1 有什么用](w3/3.03-1-w3-5c-follower.md) | 理论单元 | w3-5c-follower | units/w3-5c-follower.json |
| 3.3-2 | [电压跟随器：把塌下去的电压救回来](w3/3.03-2-exp-voltage-follower.md) | 实验 | exp-voltage-follower | challenges/225-voltage-follower.json |
| 3.4-1 | [同相放大器：反馈网络就是一个分压器](w3/3.04-1-w3-5d-noninverting.md) | 理论单元 | w3-5d-noninverting | units/w3-5d-noninverting.json |
| 3.4-2 | [同相放大器：反馈里放两个电阻](w3/3.04-2-exp-noninverting-amp.md) | 实验 | exp-noninverting-amp | challenges/226-noninverting-amp.json |
| 3.5-1 | [信号发生器和示波器：第一条波形](w3/3.05-1-lesson-generator-scope.md) | 课程（分步） | lesson-generator-scope | challenges/104-lesson-generator-scope.json |
| 3.5-2 | [信号发生器里的 50 Ω，探头的接地夹](w3/3.05-2-lesson-generator-load.md) | 课程（分步） | lesson-generator-load | challenges/250-lesson-generator-load.json |
| 3.5-3 | [示波器双通道：谁先到、谁后到](w3/3.05-3-lesson-scope-two-channels.md) | 课程（分步） | lesson-scope-two-channels | challenges/105-lesson-scope-two-channels.json |
| 3.6-1 | [反相放大器：虚地和跷跷板](w3/3.06-1-w3-5e-inverting.md) | 理论单元 | w3-5e-inverting | units/w3-5e-inverting.json |
| 3.6-2 | [反相放大器：翻个身，再放大](w3/3.06-2-exp-inverting-amp.md) | 实验 | exp-inverting-amp | challenges/227-inverting-amp.json |
| 3.7-1 | [加法器：电流在虚地相加](w3/3.07-1-w3-5f-summing.md) | 理论单元 | w3-5f-summing | units/w3-5f-summing.json |
| 3.7-2 | [反相加法器：把直流和交流加在一起](w3/3.07-2-exp-summing-amp.md) | 实验 | exp-summing-amp | challenges/228-summing-amp.json |
| 3.7-3 | [差分放大器：各自作用，再加起来](w3/3.07-3-w3-5g-difference.md) | 理论单元 | w3-5g-difference | units/w3-5g-difference.json |
| 3.7-4 | [实验 2-9 · 差分放大器：两路输入分别作用，再加起来](w3/3.07-4-exp-difference-amp.md) | 实验 | exp-difference-amp | challenges/229-difference-amp.json |
| 3.8-1 | [级联：为什么不用担心负载效应](w3/3.08-1-w3-5h-cascade.md) | 理论单元 | w3-5h-cascade | units/w3-5h-cascade.json |
| 3.8-2 | [没有反馈：比较器](w3/3.08-2-w3-5i-comparator.md) | 理论单元 | w3-5i-comparator | units/w3-5i-comparator.json |
| 3.8-3 | [把电阻换成别的](w3/3.08-3-w3-5j-preview.md) | 理论单元 | w3-5j-preview | units/w3-5j-preview.json |

## World 4 · 储能元件与一阶 / 二阶暂态

| 编号 | 标题 | 类型 | id | 文件 |
|---|---|---|---|---|
| 4.1 | [呼吸灯：电容让 LED 慢慢亮、慢慢暗](w4/4.01-1-exp3-led-breathing.md) | 实验 | exp3-led-breathing | challenges/245-led-breathing.json |
| 4.2-1 | [RC 充放电：用方波看时间常数](w4/4.02-1-exp3-rc-square-charging.md) | 实验 | exp3-rc-square-charging | challenges/241-rc-square-charging.json |
| 4.2-2 | [电容旁边并一个电阻：戴维宁求 τ](w4/4.02-2-exp3-rc-thevenin-tau.md) | 实验 | exp3-rc-thevenin-tau | challenges/247-rc-thevenin-tau.json |
| 4.3-1 | [RC 微分电路与积分电路](w4/4.03-1-exp3-rc-differentiator-integrator.md) | 实验 | exp3-rc-differentiator-integrator | challenges/242-rc-differentiator-integrator.json |
| 4.3-2 | [op-amp积分器：方波变三角波](w4/4.03-2-exp3-opamp-integrator.md) | 实验 | exp3-opamp-integrator | challenges/246-opamp-integrator.json |
| 4.4 | [RL 电路：电感电压的尖峰，电流的斜坡](w4/4.04-1-exp3-rl-square.md) | 实验 | exp3-rl-square | challenges/243-rl-square.json |
| 4.5-1 | [RLC 振铃：欠阻尼、临界阻尼、过阻尼](w4/4.05-1-exp3-rlc-ringing.md) | 实验 | exp3-rlc-ringing | challenges/244-rlc-ringing.json |
| 4.5-2 | [实验 3-8 · RLC 串联阶跃响应：先算 α 和 ω0，再从示波器上读回来](w4/4.05-2-exp3-rlc-step-response.md) | 实验 | exp3-rlc-step-response | challenges/248-rlc-step-response.json |

## World 5 · 正弦稳态、相量与交流功率

| 编号 | 标题 | 类型 | id | 文件 |
|---|---|---|---|---|
| 5.1-1 | [RL 串联：电流为什么慢半拍](w5/5.01-1-exp4-rl-phasors.md) | 实验 | exp4-rl-phasors | challenges/263-rl-phasors.json |
| 5.1-2 | [实验 4-0 · RLC 串联交流电路：感抗和容抗互相抵消，阻抗三角形](w5/5.01-2-exp4-rlc-series-ac.md) | 实验 | exp4-rlc-series-ac | challenges/260-rlc-series-ac.json |
| 5.2 | [Midterm 2 交流版：把 R 换成 Z](w5/5.02-1-w5-ac-midterm2.md) | 理论单元 | w5-ac-midterm2 | units/w5-ac-midterm2.json |
| 5.3-1 | [RC 低通：高音被电容抄了近路](w5/5.03-1-exp4-rc-lowpass-bode.md) | 实验 | exp4-rc-lowpass-bode | challenges/261-rc-lowpass-bode.json |
| 5.3-2 | [RC 高通：电容挡住直流，放过交流](w5/5.03-2-exp4-rc-highpass-coupling.md) | 实验 | exp4-rc-highpass-coupling | challenges/262-rc-highpass-coupling.json |
| 5.3-3 | [两级 RC 带通：后一级拖累前一级](w5/5.03-3-exp4-rc-bandpass-loading.md) | 实验 | exp4-rc-bandpass-loading | challenges/267-rc-bandpass-loading.json |
| 5.4-1 | [RLC 串联谐振：扫频找 f0](w5/5.04-1-exp4-series-resonance.md) | 实验 | exp4-series-resonance | challenges/264-series-resonance.json |
| 5.4-2 | [LC 并联槽路：只让一个频率通过](w5/5.04-2-exp4-parallel-lc-tank.md) | 实验 | exp4-parallel-lc-tank | challenges/265-parallel-lc-tank.json |
| 5.5 | [功率因数校正：并一个电容，电流变小了](w5/5.05-1-exp4-pf-correction.md) | 实验 | exp4-pf-correction | challenges/270-pf-correction.json |

## World 6 · 半导体器件与分立放大器

| 编号 | 标题 | 类型 | id | 文件 |
|---|---|---|---|---|
| 6.1 | [二极管：电流的单行道](w6/6.01-1-challenge-reverse-protection.md) | 实验 | challenge-reverse-protection | challenges/14-reverse-protection.json |
| 6.2 | [半波整流 + 电容滤波：把交流变成直流](w6/6.02-1-exp4-half-wave-rectifier.md) | 实验 | exp4-half-wave-rectifier | challenges/271-half-wave-rectifier.json |

## World 7 · 模拟 IC 进阶：非理想 op-amp（运算放大器）、波特图、有源滤波、555 与功放

| 编号 | 标题 | 类型 | id | 文件 |
|---|---|---|---|---|
| 7.1 | [施密特触发器：会“记事”的比较器](w7/7.01-1-exp-schmitt-trigger.md) | 实验 | exp-schmitt-trigger | challenges/230-schmitt-trigger.json |
| 7.2-1 | [有源低通：会“忘掉高音”的放大器](w7/7.02-1-exp4-active-lowpass.md) | 实验 | exp4-active-lowpass | challenges/266-active-lowpass.json |
| 7.2-2 | [加一个电压跟随器：两级不再互相拖累](w7/7.02-2-exp4-buffered-bandpass.md) | 实验 | exp4-buffered-bandpass | challenges/268-buffered-bandpass.json |

## World 8 · 数字逻辑、MCU 与传感器实战

| 编号 | 标题 | 类型 | id | 文件 |
|---|---|---|---|---|
| 8.1-1 | [数制：二进制、十六进制、BCD](w8/8.01-1-w8-number-systems.md) | 理论单元 | w8-number-systems | units/w8-number-systems.json |
| 8.1-2 | [逻辑门：七种门和它们的真值表](w8/8.01-2-w8-logic-gates.md) | 理论单元 | w8-logic-gates | units/w8-logic-gates.json |
| 8.2-1 | [开发板：供电和 GPIO](w8/8.02-1-lesson-mcu-gpio.md) | 课程（分步） | lesson-mcu-gpio | challenges/107-lesson-mcu-gpio.json |
| 8.2-2 | [GPIO 点灯：算出限流电阻](w8/8.02-2-exp5-gpio-led-resistor.md) | 实验 | exp5-gpio-led-resistor | challenges/280-gpio-led-resistor.json |
| 8.2-3 | [Blue Pill 的引脚：哪个脚能干什么](w8/8.02-3-lesson-bluepill-pins.md) | 课程（分步） | lesson-bluepill-pins | challenges/300-lesson-bluepill-pins.json |
| 8.2-4 | [拉电流与灌电流：低电平点亮的 LED](w8/8.02-4-exp5-sink-vs-source.md) | 实验 | exp5-sink-vs-source | challenges/281-sink-vs-source.json |
| 8.2-5 | [按键的上拉与下拉：别让输入悬空](w8/8.02-5-exp5-button-pull-resistors.md) | 实验 | exp5-button-pull-resistors | challenges/282-button-pull-resistors.json |
| 8.3 | [NPN 三极管开关：3.3 V 引脚开关 5 V 蜂鸣器](w8/8.03-1-exp5-npn-buzzer-switch.md) | 实验 | exp5-npn-buzzer-switch | challenges/286-npn-buzzer-switch.json |
| 8.4-1 | [逻辑电平 MOSFET：3.3 V 引脚开关大电流电机](w8/8.04-1-exp5-mosfet-logic-level.md) | 实验 | exp5-mosfet-logic-level | challenges/287-mosfet-logic-level.json |
| 8.4-2 | [继电器 + 续流二极管：把线圈断电时的高压按住](w8/8.04-2-exp5-relay-flyback.md) | 实验 | exp5-relay-flyback | challenges/288-relay-flyback.json |
| 8.4-3 | [高边还是低边：NPN 为什么要放在负载下面](w8/8.04-3-exp5-high-side-vs-low-side.md) | 实验 | exp5-high-side-vs-low-side | challenges/297-high-side-vs-low-side.json |
| 8.5-1 | [稳压器的压差：电池越来越没电时](w8/8.05-1-exp5-ldo-dropout.md) | 实验 | exp5-ldo-dropout | challenges/291-ldo-dropout.json |
| 8.5-2 | [电流预算：大负载该接 5V 还是 3V3](w8/8.05-2-exp5-board-power-budget.md) | 实验 | exp5-board-power-budget | challenges/292-board-power-budget.json |
| 8.6-1 | [5 V 信号进 3.3 V 引脚：分压，或者用耐 5 V 的引脚](w8/8.06-1-exp5-5v-signal-level-shift.md) | 实验 | exp5-5v-signal-level-shift | challenges/289-5v-signal-level-shift.json |
| 8.6-2 | [开漏输出：3.3 V 单片机送出 5 V 高电平](w8/8.06-2-exp5-open-drain-level-shifter.md) | 实验 | exp5-open-drain-level-shifter | challenges/290-open-drain-level-shifter.json |
| 8.7-1 | [开发板：PWM 预习和 ADC](w8/8.07-1-lesson-mcu-pwm-adc.md) | 课程（分步） | lesson-mcu-pwm-adc | challenges/108-lesson-mcu-pwm-adc.json |
| 8.7-2 | [电池电压监测：用分压器把 8.4 V 缩小](w8/8.07-2-exp5-adc-battery-divider.md) | 实验 | exp5-adc-battery-divider | challenges/283-adc-battery-divider.json |
| 8.7-3 | [光敏电阻测光：固定电阻该选多大](w8/8.07-3-exp5-ldr-light-sensor.md) | 实验 | exp5-ldr-light-sensor | challenges/284-ldr-light-sensor.json |
| 8.7-4 | [NTC 热敏电阻温度计：读数不走直线](w8/8.07-4-exp5-ntc-thermometer.md) | 实验 | exp5-ntc-thermometer | challenges/285-ntc-thermometer.json |
| 8.8-1 | [PWM + RC：最便宜的 DAC](w8/8.08-1-exp5-pwm-rc-dac.md) | 实验 | exp5-pwm-rc-dac | challenges/293-pwm-rc-dac.json |
| 8.8-2 | [PWM 调速：电机电流跟着占空比走](w8/8.08-2-exp5-pwm-mosfet-motor.md) | 实验 | exp5-pwm-mosfet-motor | challenges/294-pwm-mosfet-dimming.json |
| 8.8-3 | [I²C 上拉电阻：上升沿由 R × C 决定](w8/8.08-3-exp5-i2c-pullup-rise-time.md) | 实验 | exp5-i2c-pullup-rise-time | challenges/295-i2c-pullup-rise-time.json |
| 8.9-1 | [综合项目：温控风扇](w8/8.09-1-exp5-capstone-ntc-fan.md) | 实验 | exp5-capstone-ntc-fan | challenges/296-capstone-ntc-fan.json |
| 8.9-2 | [开放设计：天黑自动亮灯](w8/8.09-2-exp5-design-night-light.md) | 实验 | exp5-design-night-light | challenges/298-design-night-light.json |
