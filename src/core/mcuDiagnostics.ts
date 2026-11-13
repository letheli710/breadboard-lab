// Phase 5 diagnostics: dev-board pins, regulators, transistors, MOSFETs, relays, motors.
// Called from boardDiagnostics (DC) and acDiagnostics (time domain) in diagnostics.ts.

import type { Issue } from './diagnostics';
import { MOSFETS, NPN, RELAY } from './devices';
import { amps, volts } from './format';
import { tr } from './i18n';
import { MCU_BOARDS, VPIN_MAX, VPIN_MAX_FT, boardOf, isMcu, isOutputMode, mcuPin } from './mcu';
import { isFloating, type BoardNetlist } from './netlist';
import { isPower } from './parts';
import type { SimResult } from './solver';
import type { TransientResult } from './transient';
import { pinId } from './types';

const mA = (a: number) => `${(a * 1000).toFixed(Math.abs(a) < 0.01 ? 1 : 0)} mA`;

export function mcuDiagnostics(nl: BoardNetlist, sim: SimResult): Issue[] {
  const out: Issue[] = [];
  const { circuit } = nl;
  const placed = circuit.components.filter((c) => !nl.unplaced.includes(c.ref));
  const netOf = (ref: string, t: string) => nl.pinNet.get(pinId(ref, t));
  const netSize = new Map(circuit.nets.map((n) => [n.name, n.pins.length]));
  const isConn = (ref: string, t: string) => {
    const n = netOf(ref, t);
    return !!n && !isFloating(n) && (netSize.get(n) ?? 0) > 1;
  };
  const holes = (ref: string, ts: string[]) => ts.flatMap((t) => nl.pinHoles.get(pinId(ref, t)) ?? []);
  const issue = (severity: Issue['severity'], title: string, detail: string, refs: string[], h: string[] = []) => out.push({ severity, title, detail, refs, holes: h });

  // nets that are a supply rail: DC source terminals and every board's 3V3 / 5V / GND
  const railNets = new Map<string, string>();
  for (const c of placed) {
    if (isPower(c.type)) for (const t of ['+', '-']) netOf(c.ref, t) && railNets.set(netOf(c.ref, t)!, `${c.ref} ${t}`);
    if (isMcu(c.type)) for (const t of ['3V3', '5V', 'GND']) netOf(c.ref, t) && isConn(c.ref, t) && railNets.set(netOf(c.ref, t)!, `${c.ref} ${t}`);
  }
  const outputsOnNet = new Map<string, { ref: string; pin: string; level: string }[]>();

  for (const c of placed) {
    if (!isMcu(c.type)) continue;
    const st = sim.mcus.get(c.ref);
    if (!st) continue;
    const b = boardOf(c.type);

    if (!st.running) {
      if (!st.usb && st.v5 < 1 && st.v3 < 1)
        issue(
          'info',
          tr(`${c.ref} 没有通电`, `${c.ref} has no power`),
          tr(
            `开发板既没有插 USB（右侧属性里可以“插上”），5V / 3V3 引脚也没有接电源，所以芯片不工作，所有引脚都是高阻态。`,
            `The board has no USB cable (plug it in under Properties) and nothing feeds its 5V / 3V3 pins, so the chip isn't running and every pin is high-impedance.`,
          ),
          [c.ref],
        );
      else if (st.v3 < b.brownout)
        issue(
          'warning',
          tr(`${c.ref} 欠压复位（brown-out）：3V3 只有 ${volts(st.v3)}`, `${c.ref} is in brown-out reset: 3V3 is only ${volts(st.v3)}`),
          tr(
            `芯片需要 3V3 至少约 ${b.brownout} V 才能运行。${st.reg.mode === 'limit' ? '板载稳压器已经到了电流上限——3V3 引脚上的负载太重。' : st.reg.mode === 'dropout' ? `稳压器输入（5V 引脚）只有 ${volts(st.v5)}，不够稳压。` : ''}`,
            `The chip needs at least about ${b.brownout} V on 3V3 to run.${st.reg.mode === 'limit' ? ' The onboard regulator is at its current limit — the load on the 3V3 pin is too heavy.' : st.reg.mode === 'dropout' ? ` The regulator input (5V pin) is only ${volts(st.v5)}, too low to regulate.` : ''}`,
          ),
          [c.ref],
        );
      else
        issue(
          'warning',
          tr(`${c.ref} 处于复位状态：${b.enPin} 被拉低了`, `${c.ref} is held in reset: ${b.enPin} is pulled low`),
          tr(`${b.enPin} 引脚为低电平时芯片停止工作。不要把 ${b.enPin} 接到 GND。`, `The chip stops while ${b.enPin} is low. Don't connect ${b.enPin} to GND.`),
          [c.ref],
          holes(c.ref, [b.enPin]),
        );
    }
    if (st.usbOverload)
      issue(
        'error',
        tr(`${c.ref} 的 USB 过载：${amps(st.usbCurrent)}`, `${c.ref} overloads USB: ${amps(st.usbCurrent)}`),
        tr(
          `电脑的 USB 口一般只能给 500 mA，超过了会触发保护（或者烧坏板上的保险丝 / 二极管）。电机、继电器、灯带这类大电流负载要用独立电源供电，只把 GND 和开发板接在一起。`,
          `A computer USB port normally gives only 500 mA; more trips its protection (or burns the board's fuse / diode). Power motors, relays and LED strips from a separate supply and only join its GND to the board.`,
        ),
        [c.ref],
      );
    if (st.reg.mode === 'limit')
      issue(
        'error',
        tr(`${c.ref} 的板载稳压器过流`, `${c.ref}'s onboard regulator is overloaded`),
        tr(
          `${b.regulator.name} 最多只能输出约 ${amps(b.regulator.limit)}，3V3 掉到了 ${volts(st.v3)}。不要从 3V3 引脚给大电流负载供电。`,
          `The ${b.regulator.name} can only deliver about ${amps(b.regulator.limit)}; 3V3 has dropped to ${volts(st.v3)}. Don't power heavy loads from the 3V3 pin.`,
        ),
        [c.ref],
      );
    else if (st.reg.iout > 0.8 * b.regulator.limit)
      issue(
        'warning',
        tr(`${c.ref} 的 3V3 负载接近上限：${amps(st.reg.iout)}`, `${c.ref}'s 3V3 load is near the limit: ${amps(st.reg.iout)}`),
        tr(`板载稳压器最多约 ${amps(b.regulator.limit)}，而且会发热（${(st.reg.power).toFixed(2)} W）。`, `The onboard regulator gives at most about ${amps(b.regulator.limit)} and gets hot (${st.reg.power.toFixed(2)} W).`),
        [c.ref],
      );
    else if (st.reg.mode === 'dropout' && st.v5 > 1 && st.running)
      issue(
        'warning',
        tr(`${c.ref} 的稳压器压差不够：5V 只有 ${volts(st.v5)}`, `${c.ref}'s regulator is in dropout: 5V is only ${volts(st.v5)}`),
        tr(`${b.regulator.name} 的输入要比 3.3 V 至少高 ${b.regulator.dropout} V，现在 3V3 只有 ${volts(st.v3)}。`, `The ${b.regulator.name} needs its input at least ${b.regulator.dropout} V above 3.3 V; 3V3 is only ${volts(st.v3)} now.`),
        [c.ref],
      );
    if (st.i3v3Out < -0.005 && st.running)
      issue(
        'info',
        tr(`${c.ref} 的 3V3 引脚被外部电源供电`, `${c.ref}'s 3V3 pin is fed from outside`),
        tr(`有 ${amps(-st.i3v3Out)} 从面包板流进 3V3 引脚。可以这样给板子供电，但电压不能超过 3.6 V，也不要同时插 USB 和外部 3.3 V 电源。`, `${amps(-st.i3v3Out)} flows into the 3V3 pin from the breadboard. You can power the board this way, but never above 3.6 V.`),
        [c.ref],
        holes(c.ref, ['3V3']),
      );

    for (const [pin, p] of st.pins) {
      const def = mcuPin(c.type, pin);
      const caps = def?.gpio;
      const h = holes(c.ref, [pin]);
      const name = `${c.ref} ${pin}`;
      if (p.connected && caps && isOutputMode(p.mode) && !caps.output)
        issue(
          'warning',
          tr(`${name} 只能做输入`, `${name} is input-only`),
          tr(`ESP32 的 GPIO34–39 只有输入功能，设成输出没有用。换一个引脚（如 GPIO2、GPIO4、GPIO16–33）。`, `ESP32 GPIO34–39 are input-only; setting them as outputs does nothing. Use another pin (e.g. GPIO2, GPIO4, GPIO16–33).`),
          [c.ref],
          h,
        );
      if (caps && (p.mode === 'input_pullup' || p.mode === 'input_pulldown') && !caps.pull)
        issue(
          'warning',
          tr(`${name} 没有内部上下拉电阻`, `${name} has no internal pull resistor`),
          tr(`GPIO34–39 没有内部上拉 / 下拉，这个模式等于浮空输入。外接一个 10 kΩ 电阻到 3V3（上拉）或 GND（下拉）。`, `GPIO34–39 have no internal pull-up / pull-down, so this mode is just a floating input. Add an external 10 kΩ to 3V3 (pull-up) or GND (pull-down).`),
          [c.ref],
          h,
        );
      if (p.damaged)
        issue(
          'error',
          tr(`${name} 烧坏了！${p.clamp > b.iInjMax ? `保护二极管电流 ${mA(p.clamp)}` : `电流 ${mA(p.current)}`}`, `${name} is damaged! ${p.clamp > b.iInjMax ? `clamp-diode current ${mA(p.clamp)}` : `current ${mA(p.current)}`}`),
          p.clamp > b.iInjMax
            ? tr(
                `引脚电压超出了电源范围（${volts(p.vLocal)}），内部的保护二极管流过了 ${mA(p.clamp)}（最多约 ${mA(b.iInjMax)}）。不要把 5 V 或负电压直接接到 3.3 V 引脚上——用分压电阻或电平转换。`,
                `The pin is outside the supply range (${volts(p.vLocal)}) and its internal protection diode carries ${mA(p.clamp)} (about ${mA(b.iInjMax)} max). Never connect 5 V or a negative voltage straight to a 3.3 V pin — use a divider or a level shifter.`,
              )
            : tr(
                `每个引脚绝对最大约 ${mA(b.iMax)}。引脚很可能被直接接到了 GND / 3V3 / 另一个输出，或者负载没有限流电阻。LED 要串 220 Ω – 1 kΩ；电机、继电器要用三极管或 MOSFET 驱动。`,
                `Each pin can take about ${mA(b.iMax)} at most. It is probably wired straight to GND / 3V3 / another output, or the load has no current-limiting resistor. LEDs need 220 Ω – 1 kΩ in series; motors and relays need a transistor or MOSFET.`,
              ),
          [c.ref],
          h,
        );
      else if (p.overcurrent)
        issue(
          'warning',
          tr(`${name} 电流偏大：${mA(p.current)}`, `${name} current is high: ${mA(p.current)}`),
          tr(
            `建议每个引脚不超过 ${mA(caps?.weak ? b.iWeak : b.iRec)}（绝对最大 ${mA(b.iMax)}）。电流大时输出电压也会下降（现在 ${volts(p.vLocal)}）。加大串联电阻，或用三极管 / MOSFET 驱动负载。`,
            `Keep each pin at or below ${mA(caps?.weak ? b.iWeak : b.iRec)} (${mA(b.iMax)} absolute max). With a heavy load the output voltage sags too (${volts(p.vLocal)} now). Use a bigger series resistor, or drive the load with a transistor / MOSFET.`,
          ),
          [c.ref],
          h,
        );
      if (p.overvoltage && !p.damaged)
        issue(
          'error',
          tr(`${name} 上的电压太高：${volts(p.vLocal)}`, `${name} voltage is too high: ${volts(p.vLocal)}`),
          caps?.ft
            ? tr(`即使是耐 5 V（FT）的引脚，最高也只能到 ${VPIN_MAX_FT} V。`, `Even a 5 V-tolerant (FT) pin only takes up to ${VPIN_MAX_FT} V.`)
            : tr(
                `这个引脚不耐 5 V：最高 ${VPIN_MAX} V。超出的电压正通过保护二极管（${mA(p.clamp)}）灌进 3V3。5 V 的信号要先用分压电阻（如 10 kΩ + 20 kΩ）或电平转换模块降到 3.3 V${c.type === 'stm32_bluepill' ? '，或者换一个标 FT 的引脚（PA8–PA15、PB3、PB4、PB6–PB15）' : ''}。`,
                `This pin is not 5 V tolerant: ${VPIN_MAX} V max. The extra voltage is pushing ${mA(p.clamp)} through its protection diode into 3V3. Bring 5 V signals down to 3.3 V with a divider (e.g. 10 kΩ + 20 kΩ) or a level shifter${c.type === 'stm32_bluepill' ? ', or use an FT pin (PA8–PA15, PB3, PB4, PB6–PB15)' : ''}.`,
              ),
          [c.ref],
          h,
        );
      if (p.undervoltage && !p.damaged)
        issue(
          'warning',
          tr(`${name} 上出现负电压：${volts(p.vLocal)}`, `${name} sees a negative voltage: ${volts(p.vLocal)}`),
          tr(`引脚电压低于 −0.3 V，保护二极管在导通（${mA(p.clamp)}）。常见原因：线圈 / 电机直接接在引脚上，断开时的反向电压。`, `The pin is below −0.3 V and its protection diode conducts (${mA(p.clamp)}). A common cause is a coil or motor wired straight to the pin, kicking back when it switches off.`),
          [c.ref],
          h,
        );
      if (!p.connected) continue;
      if (p.mode === 'adc' && p.vLocal > 3.35 && !p.damaged && !p.overvoltage)
        issue(
          'warning',
          tr(`${name} 的 ADC 满量程了`, `${name}'s ADC is at full scale`),
          tr(`ADC 只能测 0–3.3 V，现在是 ${volts(p.vLocal)}，读数卡在 4095。用分压电阻把被测电压降到 3.3 V 以内。`, `The ADC only measures 0–3.3 V; the pin is at ${volts(p.vLocal)}, so the reading is stuck at 4095. Scale the voltage down with a divider.`),
          [c.ref],
          h,
        );
      if (p.mode === 'adc' && caps?.adc2)
        issue(
          'info',
          tr(`${name} 是 ADC2 通道`, `${name} is an ADC2 channel`),
          tr(`ESP32 打开 Wi-Fi 时 ADC2 不能用。模拟输入最好用 ADC1：GPIO32–39。`, `ESP32 ADC2 can't be used while Wi-Fi is on. Prefer ADC1 for analog inputs: GPIO32–39.`),
          [c.ref],
          h,
        );
      if ((p.mode === 'input' || p.mode === 'input_pullup' || p.mode === 'input_pulldown') && st.running) {
        if (p.logic === 'floating')
          issue(
            'warning',
            tr(`${name} 是浮空输入`, `${name} is a floating input`),
            tr(
              `没有任何东西确定这个输入的电压（按键松开时就是这样），读到的是随机的 0 / 1。用 “输入 + 内部上拉”，或外接 10 kΩ 上拉 / 下拉电阻。`,
              `Nothing defines this input's voltage (e.g. a released button), so it reads random 0s and 1s. Use "input + pull-up", or add an external 10 kΩ pull-up / pull-down.`,
            ),
            [c.ref],
            h,
          );
        else if (p.logic === 'undefined')
          issue(
            'warning',
            tr(`${name} 的电平不确定：${volts(p.vLocal)}`, `${name} level is undefined: ${volts(p.vLocal)}`),
            tr(`数字输入低于 ${volts(b.vil)} 读 0、高于 ${volts(b.vih)} 读 1，中间的电压读数不可靠。`, `A digital input reads 0 below ${volts(b.vil)} and 1 above ${volts(b.vih)}; anything in between is unreliable.`),
            [c.ref],
            h,
          );
      }
      if (def?.kind === 'gpio' && caps?.note && (caps.note === 'tx' || caps.note === 'rx') && c.type === 'esp32_devkit')
        issue('info', tr(`${name} 是串口 ${caps.note.toUpperCase()}`, `${name} is serial ${caps.note.toUpperCase()}`), tr('GPIO1 / GPIO3 接着 USB 串口（下载程序和串口监视器）。尽量用别的引脚。', 'GPIO1 / GPIO3 carry the USB serial port (uploads and the serial monitor). Prefer other pins.'), [c.ref], h);
      const net = netOf(c.ref, pin);
      if (net && isOutputMode(p.mode) && caps?.output) {
        const lvl = p.mode === 'pwm' ? 'pwm' : p.mode;
        outputsOnNet.set(net, [...(outputsOnNet.get(net) ?? []), { ref: c.ref, pin, level: lvl }]);
        const rail = railNets.get(net);
        if (rail)
          issue(
            'error',
            tr(`${name} 的输出直接接在了电源上（${rail}）`, `${name}'s output is wired straight to a supply (${rail})`),
            tr(`输出引脚是一个电压源，直接接到 3V3 / 5V / GND 上会流过很大的电流，把引脚烧坏。中间一定要有负载（例如电阻 + LED）。`, `An output pin is a voltage source; tied straight to 3V3 / 5V / GND a large current flows and burns the pin. There must be a load (e.g. a resistor + LED) in between.`),
            [c.ref],
            h,
          );
      }
    }
    // flash pins
    for (const pin of Object.values(MCU_BOARDS[c.type === 'stm32_bluepill' ? 'stm32_bluepill' : 'esp32_devkit'].pins))
      if (pin.kind === 'flash' && isConn(c.ref, pin.name))
        issue(
          'warning',
          tr(`${c.ref} ${pin.name}（${pin.label}）接着板载 Flash`, `${c.ref} ${pin.name} (${pin.label}) is wired to the onboard flash`),
          tr('GPIO6–11 是 ESP32 读取程序用的 SPI Flash 引脚，接任何东西都可能让板子死机。换一个引脚。', 'GPIO6–11 connect the ESP32 to its SPI flash; wiring anything to them can crash the board. Use another pin.'),
          [c.ref],
          holes(c.ref, [pin.name]),
        );
  }
  for (const [net, outs] of outputsOnNet) {
    if (outs.length < 2) continue;
    const levels = new Set(outs.map((o) => o.level));
    if (levels.size > 1 || levels.has('pwm'))
      issue(
        'error',
        tr('两个输出引脚在“打架”', 'Two output pins are fighting'),
        tr(
          `${outs.map((o) => `${o.ref} ${o.pin}`).join('、')} 在同一个节点（${net}）上，一个想输出高、一个想输出低，大电流从一个引脚直接流进另一个。一个节点上只能有一个输出。`,
          `${outs.map((o) => `${o.ref} ${o.pin}`).join(', ')} are on one node (${net}); one drives high, the other low, and a large current flows straight from one pin into the other. Only one output may drive a node.`,
        ),
        [...new Set(outs.map((o) => o.ref))],
        outs.flatMap((o) => holes(o.ref, [o.pin])),
      );
  }

  // ---- devices
  const diodes = placed.filter((c) => c.type === 'diode' || c.type === 'led');
  const hasFlyback = (ref: string, plus: string, minus: string) => {
    const np = netOf(ref, plus);
    const nm = netOf(ref, minus);
    return diodes.some((d) => netOf(d.ref, 'cathode') === np && netOf(d.ref, 'anode') === nm);
  };
  for (const c of placed) {
    switch (c.type) {
      case 'npn': {
        const q = sim.bjts.get(c.ref);
        if (!q) break;
        if (q.breakdown)
          issue('error', tr(`${c.ref} 击穿了：Vce = ${volts(q.vce)}`, `${c.ref} broke down: Vce = ${volts(q.vce)}`), tr(`2N2222 的 C–E 最多承受约 ${NPN.bv} V。`, `A 2N2222 withstands about ${NPN.bv} V across C–E.`), [c.ref]);
        if (q.ic > NPN.icMax)
          issue('error', tr(`${c.ref} 集电极电流过大：${amps(q.ic)}`, `${c.ref} collector current too high: ${amps(q.ic)}`), tr(`2N2222 最大约 ${amps(NPN.icMax)}。更大的负载用 MOSFET。`, `A 2N2222 handles about ${amps(NPN.icMax)} at most. Use a MOSFET for bigger loads.`), [c.ref]);
        else if (q.power > NPN.pMax)
          issue('warning', tr(`${c.ref} 发热：${q.power.toFixed(2)} W`, `${c.ref} is getting hot: ${q.power.toFixed(2)} W`), tr(`TO-92 封装最多约 ${NPN.pMax} W。让三极管饱和（加大基极电流）可以减小 Vce 和发热。`, `A TO-92 part dissipates about ${NPN.pMax} W at most. Saturating the transistor (more base current) lowers Vce and the heat.`), [c.ref]);
        if (q.ib > 0.05)
          issue('warning', tr(`${c.ref} 的基极电流太大：${amps(q.ib)}`, `${c.ref} base current is too large: ${amps(q.ib)}`), tr('基极和驱动它的引脚之间要串一个电阻（例如 1 kΩ），否则 BE 结相当于一个二极管直接接在电源上。', 'Put a resistor (e.g. 1 kΩ) between the base and whatever drives it; otherwise the B–E junction is a diode straight across the supply.'), [c.ref], holes(c.ref, ['b']));
        if (q.region === 'active' && q.ic > 0.002 && q.vce > 1 && isConn(c.ref, 'c'))
          issue(
            'info',
            tr(`${c.ref} 工作在放大区（没有完全导通）`, `${c.ref} is in the active region (not fully on)`),
            tr(`Ic = ${amps(q.ic)}，Vce = ${volts(q.vce)}。当开关用时，要让 Ib 大于 Ic/β 的 2–10 倍，三极管才会饱和（Vce ≈ 0.2 V）。减小基极电阻。`, `Ic = ${amps(q.ic)}, Vce = ${volts(q.vce)}. As a switch, drive Ib at 2–10 × Ic/β so it saturates (Vce ≈ 0.2 V). Use a smaller base resistor.`),
            [c.ref],
          );
        break;
      }
      case 'nmos': {
        const m = sim.mosfets.get(c.ref);
        if (!m) break;
        const spec = MOSFETS[c.props.model ?? 'IRLZ44N'] ?? MOSFETS.IRLZ44N;
        if (m.gateFloating && isConn(c.ref, 'd'))
          issue('warning', tr(`${c.ref} 的栅极浮空`, `${c.ref}'s gate is floating`), tr('MOSFET 的栅极几乎不取电流，悬空时会随便导通或关断。加一个 10 kΩ – 100 kΩ 下拉电阻（G 到 S）。', 'A MOSFET gate draws almost no current, so a floating gate turns on and off at random. Add a 10 kΩ – 100 kΩ pull-down (G to S).'), [c.ref], holes(c.ref, ['g']));
        if (m.breakdown)
          issue('error', tr(`${c.ref} 雪崩击穿：Vds = ${volts(m.vds)}`, `${c.ref} avalanche breakdown: Vds = ${volts(m.vds)}`), tr(`${spec.name[0]} 的 Vds 最高约 ${spec.bv} V。电感性负载要加续流二极管。`, `The ${spec.name[1]} takes about ${spec.bv} V on Vds at most. Inductive loads need a flyback diode.`), [c.ref]);
        if (m.region === 'saturation' && Math.abs(m.id) > 0.01)
          issue(
            'warning',
            tr(`${c.ref} 没有完全导通（Vgs = ${volts(m.vgs)}）`, `${c.ref} is not fully on (Vgs = ${volts(m.vgs)})`),
            tr(
              `${spec.name[0]} 的阈值约 ${spec.vth} V，要 ${spec.vgsSpec} V 才完全导通；现在它像一个电阻在发热（${m.power.toFixed(2)} W），负载只拿到 ${amps(m.id)}。3.3 V 单片机要选逻辑电平 MOSFET（如 IRLZ44N、AO3400）。`,
              `The ${spec.name[1]} has a threshold around ${spec.vth} V and needs ${spec.vgsSpec} V to turn fully on; right now it acts as a hot resistor (${m.power.toFixed(2)} W) and the load gets only ${amps(m.id)}. With a 3.3 V MCU use a logic-level MOSFET (e.g. IRLZ44N, AO3400).`,
            ),
            [c.ref],
          );
        else if (m.power > spec.pMax)
          issue('warning', tr(`${c.ref} 发热：${m.power.toFixed(2)} W`, `${c.ref} is getting hot: ${m.power.toFixed(2)} W`), tr('TO-220 不加散热片约 2 W 就很烫了。', 'Without a heatsink a TO-220 is very hot at about 2 W.'), [c.ref]);
        break;
      }
      case 'relay': {
        const r = sim.relays.get(c.ref);
        if (!r) break;
        const I = Math.abs(r.coilCurrent);
        if (!r.energized && I > RELAY.dropOut)
          issue(
            'warning',
            tr(`${c.ref} 线圈电流不够，吸合不了：${mA(I)}`, `${c.ref} coil current too low to pull in: ${mA(I)}`),
            tr(`5 V 继电器要约 ${mA(RELAY.pullIn)} 才能吸合（线圈两端至少约 3.75 V）。3.3 V 的引脚直接驱动不了，用三极管或 MOSFET 从 5 V 供电。`, `A 5 V relay needs about ${mA(RELAY.pullIn)} to pull in (at least about 3.75 V across the coil). A 3.3 V pin can't drive it directly: switch it from 5 V with a transistor or MOSFET.`),
            [c.ref],
          );
        const [plus, minus] = r.coilCurrent >= 0 ? ['coil1', 'coil2'] : ['coil2', 'coil1'];
        if (I > 0.005 && !hasFlyback(c.ref, plus, minus))
          issue(
            'warning',
            tr(`${c.ref} 的线圈没有续流二极管`, `${c.ref}'s coil has no flyback diode`),
            tr(
              '线圈是电感：断电的一瞬间电流无处可去，会产生几十伏的反向电压，击穿驱动它的三极管 / 引脚。在线圈两端反向并联一个二极管（1N4148 / 1N4007，负极接线圈的 + 端）。',
              'The coil is an inductor: the instant it switches off its current has nowhere to go and it produces tens of volts in reverse, which can destroy the transistor / pin driving it. Put a diode across the coil (1N4148 / 1N4007, cathode to the coil\'s + end).',
            ),
            [c.ref],
            holes(c.ref, ['coil1', 'coil2']),
          );
        break;
      }
      case 'motor': {
        const m = sim.motors.get(c.ref);
        if (!m || !m.running) break;
        const [plus, minus] = m.current >= 0 ? ['+', '-'] : ['-', '+'];
        if (!hasFlyback(c.ref, plus, minus))
          issue(
            'warning',
            tr(`${c.ref} 没有续流二极管`, `${c.ref} has no flyback diode`),
            tr('电机线圈是电感，关断时会产生反向高压（还会产生火花干扰）。在电机两端反向并联一个二极管（负极接 + 端）。', 'A motor winding is an inductor: switching it off kicks back a high reverse voltage (and electrical noise). Put a diode across the motor, cathode to its + end.'),
            [c.ref],
          );
        break;
      }
      case 'buzzer': {
        const bz = sim.buzzers.get(c.ref);
        if (bz?.reverse)
          issue('warning', tr(`${c.ref} 接反了`, `${c.ref} is backwards`), tr('有源蜂鸣器有极性：长脚（+）接电源正，短脚接 GND。', 'An active buzzer is polarised: long leg (+) to the supply, short leg to GND.'), [c.ref]);
        break;
      }
      case 'ldo': {
        const r = sim.regs.get(c.ref);
        if (!r) break;
        if (r.mode === 'limit')
          issue('error', tr(`${c.ref} 过流限流：${amps(r.iout)}`, `${c.ref} is current-limiting: ${amps(r.iout)}`), tr(`LM1117 最多约 800 mA，输出掉到了 ${volts(r.vout)}。`, `The LM1117 gives about 800 mA at most; its output dropped to ${volts(r.vout)}.`), [c.ref]);
        else if (r.mode === 'dropout' && r.vin > 0.5)
          issue(
            'warning',
            tr(`${c.ref} 压差不够：输入 ${volts(r.vin)}，输出只有 ${volts(r.vout)}`, `${c.ref} is in dropout: ${volts(r.vin)} in, only ${volts(r.vout)} out`),
            tr(`LDO 的输入至少要比输出高约 1.1 V（LM1117 的压差）。3.3 V 输出需要 ≥ 4.4 V 输入。`, `The input must be about 1.1 V above the output (the LM1117 dropout); a 3.3 V output needs ≥ 4.4 V in.`),
            [c.ref],
          );
        if (r.power > 1)
          issue('warning', tr(`${c.ref} 发热：${r.power.toFixed(2)} W`, `${c.ref} is getting hot: ${r.power.toFixed(2)} W`), tr('线性稳压器把 (Vin − Vout) × I 全部变成热量。降低输入电压或电流，或加散热片。', 'A linear regulator turns (Vin − Vout) × I into heat. Lower the input voltage or the current, or add a heatsink.'), [c.ref]);
        const nOut = netOf(c.ref, 'out');
        const nGnd = netOf(c.ref, 'gnd');
        const cap = placed.some((x) => x.type === 'capacitor' && (x.props.capacitance ?? 0) >= 1e-6 && [netOf(x.ref, '1'), netOf(x.ref, '2')].sort().join() === [nOut, nGnd].sort().join());
        if (!cap && r.mode !== 'off' && isConn(c.ref, 'out'))
          issue('info', tr(`${c.ref} 的输出端没有电容`, `${c.ref} has no output capacitor`), tr('LM1117 的输出端要接一个 ≥ 10 µF 的电容到 GND（输入端最好也接一个），否则可能自激振荡。', 'The LM1117 needs ≥ 10 µF from OUT to GND (and preferably one on the input too), or it may oscillate.'), [c.ref], holes(c.ref, ['out']));
        break;
      }
    }
  }
  return out;
}

/** Time-domain checks: inductive kicks when a coil / motor is switched off. */
export function acMcuDiagnostics(nl: BoardNetlist, ac: TransientResult): Issue[] {
  const out: Issue[] = [];
  const comps = new Map(nl.circuit.components.map((c) => [c.ref, c]));
  for (const ref of ac.breakdowns)
    out.push({
      severity: 'error',
      title: tr(`反电动势！${ref} 在线圈断电时被击穿`, `Inductive kick! ${ref} breaks down when the coil switches off`),
      detail: tr(
        `每次关断时，线圈的电流无处可去，电压一下冲到 ${comps.get(ref)?.type === 'nmos' ? 'MOSFET 的雪崩电压' : '三极管的击穿电压（约 40 V）'}。真实电路里它很快就会损坏。在线圈 / 电机两端反向并联一个续流二极管（负极接 + 端）。`,
        `Every time it switches off, the coil current has nowhere to go and the voltage shoots up to ${comps.get(ref)?.type === 'nmos' ? "the MOSFET's avalanche voltage" : "the transistor's breakdown voltage (about 40 V)"}. A real part would soon fail. Put a flyback diode across the coil / motor (cathode to its + end).`,
      ),
      refs: [ref],
      holes: [],
    });
  let vmax = 0;
  for (const c of nl.circuit.components) if (isPower(c.type)) vmax = Math.max(vmax, Math.abs(c.props.voltage ?? 9));
  vmax = Math.max(vmax, 5);
  for (const [ref, peak] of ac.coilPeak) {
    const c = comps.get(ref);
    if (!c || (c.type !== 'relay' && c.type !== 'motor')) continue;
    if (peak > vmax + 3 && ac.breakdowns.size === 0)
      out.push({
        severity: 'warning',
        title: tr(`${ref} 关断时产生了 ${volts(peak)} 的反向电压`, `${ref} kicks back ${volts(peak)} when it switches off`),
        detail: tr('这是电感的反电动势（v = L·di/dt）。加一个续流二极管把它钳住。', "That's the inductive kick (v = L·di/dt). Clamp it with a flyback diode."),
        refs: [ref],
        holes: [],
      });
  }
  return out;
}
