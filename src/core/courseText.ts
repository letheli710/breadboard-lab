// Titles of the course map's Worlds and units (core/course.ts), kept apart from the structure so the
// startup bundle carries only ids and order; the pages that show titles are loaded lazily.

import { tr } from './i18n';

const WORLD: Record<number, { title: () => string; blurb: () => string }> = {
  1: {
    title: () => tr('看见看不见的电', 'Seeing the invisible'),
    blurb: () => tr('直流基础：面包板、电源、LED，先学会用表，再学串联、并联和 KCL/KVL。', 'DC basics: breadboard, supplies, LEDs — meters first, then series, parallel, KCL/KVL.'),
  },
  2: {
    title: () => tr('驯服电路网络与运放', 'Taming networks and op-amps'),
    blurb: () => tr('分析方法、电路定理，然后认识运放——受控源就是放大器。', 'Analysis methods and theorems, then the op-amp — a dependent source you can hold.'),
  },
  3: {
    title: () => tr('掌控时间：电容、电感与暂态', 'Taming time: capacitors, inductors, transients'),
    blurb: () => tr('信号发生器和示波器，方波下的 RC、RL、RLC。', 'Function generator and scope; RC, RL and RLC under a square wave.'),
  },
  4: {
    title: () => tr('掌控频率：交流电与滤波器', 'Taming frequency: AC and filters'),
    blurb: () =>
      tr('相量、功率、频率响应与谐振；拉普拉斯、傅里叶和二端口按需选学。', 'Phasors, power, frequency response and resonance; Laplace, Fourier and two-ports when you need them.'),
  },
  5: {
    title: () => tr('从元件到 ESP32 项目', 'From parts to ESP32 projects'),
    blurb: () =>
      tr(
        '二极管、三极管、MOSFET，开发板供电、GPIO、ADC 传感器和 PWM，最后做一个完整系统。',
        'Diodes, transistors, MOSFETs; board power, GPIO, ADC sensors and PWM — then a complete system.',
      ),
  },
};

const UNIT: Record<string, () => string> = {
  '1.1': () => tr('面包板：孔底下的金属条', 'The breadboard: strips under the holes'),
  '1.2': () => tr('电源与 GND：电流回家的路', 'Power and GND: the way home'),
  '1.3': () => tr('LED：为什么一定要限流电阻', 'LEDs: why the resistor is not optional'),
  '1.4': () => tr('万用表：看见电压', 'The multimeter: seeing voltage'),
  '1.5': () => tr('电流表：串联才能测电流', 'The ammeter: in series, always'),
  '1.6': () => tr('从原理图到面包板', 'From schematic to breadboard'),
  '1.7': () => tr('串联与 KVL', 'Series circuits and KVL'),
  '1.8': () => tr('并联与 KCL', 'Parallel circuits and KCL'),
  '1.9': () => tr('开关、按键与电位器', 'Switches, buttons and pots'),
  '1.10': () => tr('真实的电源：内阻、模块、稳压电源', 'Real supplies: internal resistance, modules, bench supply'),
  '1.11': () => tr('混联、电桥与排错', 'Series-parallel, bridges and fault-finding'),
  '2.1': () => tr('电流源与分流', 'Current sources and current division'),
  '2.2': () => tr('结点电压法', 'Nodal analysis'),
  '2.3': () => tr('电源变换与叠加', 'Source transformation and superposition'),
  '2.4': () => tr('戴维宁等效与最大功率', 'Thevenin and maximum power'),
  '2.5': () => tr('LM358：拯救被负载压垮的分压器', 'LM358: rescuing a loaded divider'),
  '2.6': () => tr('同相放大器', 'The non-inverting amplifier'),
  '3.1': () => tr('信号发生器和示波器', 'Function generator and oscilloscope'),
  '3.2': () => tr('运放遇上交流信号', 'Op-amps meet AC signals'),
  '3.3': () => tr('呼吸灯：看得见的充放电', 'Breathing LED: charging you can see'),
  '3.4': () => tr('RC 时间常数', 'The RC time constant'),
  '3.5': () => tr('微分、积分与运放积分器', 'Differentiators, integrators, the op-amp integrator'),
  '3.6': () => tr('电感的脾气', "The inductor's temper"),
  '3.7': () => tr('RLC 振铃', 'RLC ringing'),
  '4.1': () => tr('相量：RL 电路的电压三角形', 'Phasors: the voltage triangle of an RL circuit'),
  '4.2': () => tr('滤波器与谐振', 'Filters and resonance'),
  '4.3': () => tr('有源滤波与级间缓冲', 'Active filters and buffering stages'),
  '4.4': () => tr('交流功率、三相与变压器（理论）', 'AC power, three-phase, transformers (theory)'),
  '4.5': () => tr('选学：拉普拉斯、傅里叶、二端口', 'Elective: Laplace, Fourier, two-ports'),
  '5.1': () => tr('二极管与非线性元件', 'Diodes and nonlinear parts'),
  '5.2': () => tr('开发板与 GPIO', 'Dev boards and GPIO'),
  '5.3': () => tr('NPN 三极管开关', 'NPN transistor switches'),
  '5.4': () => tr('MOSFET 与继电器', 'MOSFETs and relays'),
  '5.5': () => tr('供电：LDO 与电流预算', 'Power: LDOs and current budgets'),
  '5.6': () => tr('3.3 V 和 5 V 对话', '3.3 V talking to 5 V'),
  '5.7': () => tr('ADC 与模拟传感器', 'ADC and analog sensors'),
  '5.8': () => tr('PWM：调光、DAC 与调速', 'PWM: dimming, DAC, motor speed'),
  '5.9': () => tr('综合项目：温控风扇', 'Capstone: a temperature-controlled fan'),
};

export const worldTitle = (id: number): string => WORLD[id]?.title() ?? `World ${id}`;
export const worldBlurb = (id: number): string => WORLD[id]?.blurb() ?? '';
export const unitTitle = (num: string): string => UNIT[num]?.() ?? num;
