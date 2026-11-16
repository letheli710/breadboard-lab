// Inspector panels for the phase-5 parts: dev boards (USB power, per-pin modes and live pin
// readings) and devices (transistors, relay, motor, buzzer, LDO, LDR, NTC).

import { useEffect, useRef, useState } from 'react';
import { BUZZER, LDO, MOSFETS, MOTOR, NPN, RELAY, ldrResistance, ntcResistance } from '../core/devices';
import { amps, formatSI, ohms, parseValue, volts } from '../core/format';
import { tr } from '../core/i18n';
import { isFloating } from '../core/netlist';
import { MCU_BOARDS, adcRaw, isOutputMode, modeName, modesFor, pinConfig, type McuPinDef, type McuType } from '../core/mcu';
import type { LogicLevel, McuState, PinState, RegMode } from '../core/solver';
import type { MosfetModel, PartProps, PartType, PinConfig, PinMode, PinRule, PlacedPart } from '../core/types';
import { pinReadout, useDerived } from '../state/derived';
import { HIDDEN, useReadingsHidden } from '../state/readingsHidden';
import { HiddenReadingsNote } from './HiddenReadings';
import { useStore } from '../state/store';
import { prefersReducedMotion } from './reveal';

const T = (p: [string, string]) => tr(p[0], p[1]);

/* ------------------------------------------------------------------ helpers */

const mA = (a: number) => {
  const v = a * 1000;
  const s = Math.abs(v) < 0.0005 ? '0' : Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2);
  return `${s} mA`;
};

/** Formatters for simulated values: "—" while a lab hides its readings (state/readingsHidden.ts). */
const readoutFormat = (hide: boolean) =>
  hide
    ? { volts: () => HIDDEN, amps: () => HIDDEN, mA: () => HIDDEN, adc: () => HIDDEN }
    : { volts, amps, mA, adc: (a: { volts: number; raw: number }) => `ADC ${a.volts.toFixed(2)} V · ${a.raw}` };

const LOGIC: Record<LogicLevel, [string, string]> = {
  high: ['高 HIGH', 'HIGH'],
  low: ['低 LOW', 'LOW'],
  undefined: ['不确定', 'undefined'],
  floating: ['悬空', 'floating'],
};

const REG_MODE: Record<RegMode, [string, string]> = {
  reg: ['稳压中', 'regulating'],
  dropout: ['压差不足（输出跟着输入往下掉）', 'dropout (output sags with the input)'],
  limit: ['限流中（过载）', 'current limit (overloaded)'],
  off: ['没有输入（关闭）', 'off (no input)'],
};

const MODE_SHORT: Record<PinMode, [string, string]> = {
  out_high: ['输出 高', 'OUT HIGH'],
  out_low: ['输出 低', 'OUT LOW'],
  input: ['输入', 'INPUT'],
  input_pullup: ['输入 上拉', 'IN pull-up'],
  input_pulldown: ['输入 下拉', 'IN pull-down'],
  pwm: ['PWM', 'PWM'],
  adc: ['ADC', 'ADC'],
  rule: ['规则', 'RULE'],
};

function Badges({ def }: { def: McuPinDef }) {
  const c = def.gpio;
  const out: [string, string, string][] = []; // class, text, title
  if (def.kind === 'flash') out.push(['b-bad', tr('Flash', 'flash'), tr('接着板载 Flash，不能用', 'wired to the onboard flash — do not use')]);
  if (c) {
    if (c.ft) out.push(['b-ft', 'FT', tr('耐 5 V（5 V tolerant）', '5 V tolerant')]);
    if (c.adc) out.push([c.adc2 ? 'b-warn' : 'b-adc', c.adc2 ? 'ADC2' : 'ADC', c.adc2 ? tr(`${c.adc}：开 Wi-Fi 时不能用`, `${c.adc}: unusable while Wi-Fi is on`) : c.adc]);
    if (c.pwm && c.output) out.push(['b-pwm', 'PWM', tr('可输出 PWM', 'PWM capable')]);
    if (!c.output) out.push(['b-warn', tr('仅输入', 'IN only'), tr('只能输入，没有内部上拉/下拉', 'input only, no internal pull-up/down')]);
    if (c.weak) out.push(['b-warn', '3 mA', tr('弱驱动：最多 3 mA', 'weak driver: 3 mA max')]);
    if (c.note === 'strap')
      out.push([
        'b-note',
        tr('启动脚', 'strap'),
        tr('上电时决定启动模式：外部电路不要把它拉到错误电平', 'sampled at boot to pick the boot mode: keep external circuits from forcing the wrong level'),
      ]);
    if (c.note === 'tx' || c.note === 'rx') out.push(['b-note', c.note.toUpperCase(), tr('串口（下载 / 打印用）', 'serial port (used for upload / logs)')]);
    if (c.note === 'usb') out.push(['b-note', 'USB', tr('接着 USB 数据线', 'used by USB data')]);
    if (c.note === 'led') out.push(['b-note', 'LED', tr('板载 LED（低电平亮）', 'onboard LED (lit when LOW)')]);
  }
  return (
    <span className="pin-badges">
      {out.map(([cls, t, title]) => (
        <span key={t} className={`pbadge ${cls}`} title={title}>
          {t}
        </span>
      ))}
    </span>
  );
}

function capsText(def: McuPinDef): string[] {
  const c = def.gpio;
  const out: string[] = [];
  if (def.kind === 'flash') {
    out.push(
      tr(
        '这只脚接着板载 SPI Flash（程序就存在里面）。动它会让芯片死机，所以不能设置模式。',
        'This pin is wired to the onboard SPI flash (where the program lives). Touching it crashes the chip, so its mode cannot be changed.',
      ),
    );
    return out;
  }
  if (!c) return out;
  out.push(c.output ? tr('可以输出（推挽）', 'can output (push-pull)') : tr('只能输入（没有输出驱动）', 'input only (no output driver)'));
  if (c.pull) out.push(tr('有内部上拉 / 下拉电阻', 'internal pull-up / pull-down available'));
  else out.push(tr('没有内部上拉 / 下拉：要自己加电阻', 'no internal pull-up / pull-down: add a resistor yourself'));
  if (c.adc)
    out.push(
      c.adc2
        ? tr(`模拟输入 ${c.adc}（ADC2：开 Wi-Fi 时不能用，优先用 ADC1 的 GPIO32–39）`, `analog input ${c.adc} (ADC2: unusable with Wi-Fi on — prefer ADC1, GPIO32–39)`)
        : tr(`模拟输入 ${c.adc}`, `analog input ${c.adc}`),
    );
  out.push(
    c.ft
      ? tr('耐 5 V（FT）：可以直接接 5 V 信号（作输入）', '5 V tolerant (FT): a 5 V signal may drive it (as an input)')
      : tr('不耐 5 V：电压不要超过 3.3 V', 'not 5 V tolerant: keep it at or below 3.3 V'),
  );
  if (c.weak) out.push(tr('弱驱动脚：输出电流最多 3 mA', 'weak driver: at most 3 mA output'));
  return out;
}

/** A pin the user can change: a GPIO with at least one mode (not flash). */
const editable = (def: McuPinDef | undefined) => !!def && def.kind === 'gpio' && modesFor(def.gpio).length > 0;

function pinAlert(ps: PinState | undefined, mode: PinMode): { cls: string; text: string } | null {
  if (!ps) return null;
  if (ps.damaged) return { cls: 'bad', text: tr('引脚已损坏！', 'pin damaged!') };
  if (ps.overvoltage) return { cls: 'bad', text: tr('电压超过上限', 'over-voltage') };
  if (ps.undervoltage) return { cls: 'bad', text: tr('负电压', 'negative voltage') };
  if (ps.overcurrent) return { cls: 'warn', text: tr('电流超过建议值', 'over the recommended current') };
  if (ps.clamp > 1e-5) return { cls: 'warn', text: tr('保护二极管导通', 'clamp diode conducting') };
  if ((mode === 'input' || mode === 'input_pullup' || mode === 'input_pulldown') && (ps.logic === 'floating' || ps.logic === 'undefined'))
    return {
      cls: 'warn',
      text: ps.logic === 'floating' ? tr('输入悬空，读数不定', 'input floating: reads random') : tr('电压在高低之间，读数不确定', 'between LOW and HIGH: read is undefined'),
    };
  return null;
}

/* ------------------------------------------------------------------ PWM editor */

const PWM_F = [50, 500, 1000, 5000, 20000];

function PwmEditor({ cfg, onChange }: { cfg: { duty: number; frequency: number }; onChange: (c: Partial<PinConfig>) => void }) {
  const [f, setF] = useState('');
  return (
    <div className="editor pwm-editor">
      <label>
        {tr('占空比', 'Duty cycle')} {cfg.duty.toFixed(0)} %
      </label>
      <input type="range" min={0} max={100} step={1} value={cfg.duty} onChange={(e) => onChange({ duty: +e.target.value })} />
      <label>
        {tr('频率', 'Frequency')} {formatSI(cfg.frequency, 'Hz')}
      </label>
      <div className="chips">
        {PWM_F.map((v) => (
          <button key={v} className={cfg.frequency === v ? 'on' : ''} onClick={() => onChange({ frequency: v })}>
            {formatSI(v, 'Hz').replace(' ', '')}
          </button>
        ))}
        <input
          className="pwm-f"
          placeholder={tr('自定义，如 2k', 'custom, e.g. 2k')}
          value={f}
          onChange={(e) => setF(e.target.value)}
          onKeyDown={(e) => {
            const v = parseValue(f);
            if (e.key === 'Enter' && v && v > 0) onChange({ frequency: Math.min(v, 1e6) });
          }}
        />
      </div>
      <p className="note">
        {tr(
          `PWM：引脚在 0 V 和 3.3 V 之间快速切换，平均电压 ≈ ${((cfg.duty / 100) * 3.3).toFixed(2)} V。万用表测到的是平均值，用示波器探头能看到方波。`,
          `PWM: the pin switches between 0 V and 3.3 V; its average is ≈ ${((cfg.duty / 100) * 3.3).toFixed(2)} V. A multimeter shows the average; a scope probe shows the square wave.`,
        )}
      </p>
    </div>
  );
}

/** The board's pins with an ADC, by physical name (what a rule can read). */
const adcPins = (type: McuType) =>
  Object.values(MCU_BOARDS[type].pins)
    .filter((d) => d.kind === 'gpio' && d.gpio?.adc && !d.gpio.adc2)
    .map((d) => d.name);

/** Editor of a threshold rule (pin mode `rule`): which ADC pin, above / below, threshold, hysteresis,
 *  and what the rule sees right now. */
function RuleEditor({ part, pin, rule, onChange }: { part: PlacedPart; pin: string; rule?: PinRule; onChange: (r: PinRule) => void }) {
  const d = useDerived();
  const hide = useReadingsHidden();
  const pins = adcPins(part.type as McuType);
  const r: PinRule = rule ?? { adc: pins[0] ?? '', above: 2048 };
  const below = r.below !== undefined;
  const thr = (below ? r.below : r.above) ?? 2048;
  const set = (p: Partial<PinRule> & { cmp?: 'above' | 'below'; thr?: number }) => {
    const cmp = p.cmp ?? (below ? 'below' : 'above');
    const t = Math.round(Math.min(4095, Math.max(0, p.thr ?? thr)));
    onChange({
      adc: p.adc ?? r.adc,
      ...(cmp === 'below' ? { below: t } : { above: t }),
      ...((p.hysteresis ?? r.hysteresis) ? { hysteresis: Math.max(0, Math.round(p.hysteresis ?? r.hysteresis ?? 0)) } : {}),
    });
  };
  const st = d.sim.mcus.get(part.ref);
  const v = st?.pins.get(r.adc)?.vLocal;
  const out = st?.pins.get(pin)?.logic;
  return (
    <div className="editor rule-editor">
      <code className="rule-code">{`if (analogRead(${r.adc}) ${below ? '<' : '>'} ${thr}) ${pin} = HIGH; else ${pin} = LOW;`}</code>
      <div className="row">
        <label>
          {tr('读哪个 ADC 引脚', 'ADC pin to read')}{' '}
          <select value={r.adc} onChange={(e) => set({ adc: e.target.value })}>
            {pins.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          {tr('条件', 'Condition')}{' '}
          <select value={below ? 'below' : 'above'} onChange={(e) => set({ cmp: e.target.value as 'above' | 'below' })}>
            <option value="above">{tr('读数 > 阈值 → 高', 'reading > threshold → HIGH')}</option>
            <option value="below">{tr('读数 < 阈值 → 高', 'reading < threshold → HIGH')}</option>
          </select>
        </label>
      </div>
      <label>
        {tr('阈值', 'Threshold')} {thr} <small>{`≈ ${((thr / 4095) * 3.3).toFixed(2)} V`}</small>
      </label>
      <input type="range" min={0} max={4095} step={1} value={thr} aria-label={tr('阈值（ADC 读数）', 'Threshold (ADC counts)')} onChange={(e) => set({ thr: +e.target.value })} />
      <label>
        {tr('回差', 'Hysteresis')} {r.hysteresis ?? 0}
        <small>
          {tr('（读数要退回这么多才关断，防止在阈值附近来回跳）', ' (the reading must fall back this far before the output turns off, so it does not chatter at the threshold)')}
        </small>
      </label>
      <input
        type="range"
        min={0}
        max={500}
        step={5}
        value={r.hysteresis ?? 0}
        aria-label={tr('回差（ADC 读数）', 'Hysteresis (ADC counts)')}
        onChange={(e) => set({ hysteresis: +e.target.value })}
      />
      <p className="note">
        {v === undefined
          ? tr(`${r.adc} 没有接线：规则读不到电压，输出保持低。`, `${r.adc} is not wired: the rule reads nothing, so the output stays LOW.`)
          : hide
            ? tr(
                `现在 ${pin} 输出${out === 'high' ? '高' : '低'}（ADC 读数先隐藏，答完测量题再看）。`,
                `${pin} is ${out === 'high' ? 'HIGH' : 'LOW'} now (the ADC number stays hidden until the measurement questions are answered).`,
              )
            : tr(
                `现在 ${r.adc} 读到 ${adcRaw(v)}（${v.toFixed(2)} V）→ ${pin} 输出${out === 'high' ? '高' : '低'}。`,
                `${r.adc} reads ${adcRaw(v)} (${v.toFixed(2)} V) now → ${pin} is ${out === 'high' ? 'HIGH' : 'LOW'}.`,
              )}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ dev board */

function PinRow({
  part,
  def,
  ps,
  rd,
  wired,
  net,
  selected,
  onSelect,
  setPin,
  rowRef,
}: {
  part: PlacedPart;
  def: McuPinDef;
  ps?: PinState;
  /** voltage / current to show: time averages under PWM or a generator (pinReadout) */
  rd?: { voltage: number; current: number; averaged: boolean };
  wired: boolean;
  net?: string;
  selected: boolean;
  onSelect: () => void;
  setPin: (c: PinConfig | null) => void;
  rowRef: (el: HTMLDivElement | null) => void;
}) {
  const { volts, mA, adc } = readoutFormat(useReadingsHidden());
  const cfg = pinConfig(part.props, def.name);
  const can = editable(def);
  const modes = modesFor(def.gpio);
  const alert = pinAlert(ps, cfg.mode);
  const showReadings = wired || cfg.mode !== 'input' || !!ps?.damaged;
  const label = def.label !== def.name.replace(/^GPIO|^P/, '') ? def.label : null;
  const isInput = cfg.mode === 'input' || cfg.mode === 'input_pullup' || cfg.mode === 'input_pulldown';
  const isOut = isOutputMode(cfg.mode);
  /** new config for a mode: keeps the PWM settings and open-drain where they still apply */
  const withMode = (m: PinMode): PinConfig | null =>
    m === 'input'
      ? null
      : {
          mode: m,
          ...(m === 'pwm' ? { duty: cfg.duty, frequency: cfg.frequency } : {}),
          ...(m === 'rule' ? { rule: cfg.rule ?? { adc: adcPins(part.type as McuType)[0] ?? '', above: 2048 } } : {}),
          ...(cfg.openDrain && isOutputMode(m) ? { openDrain: true } : {}),
        };
  return (
    <div ref={rowRef} className={`pin-row ${selected ? 'sel' : ''} ${ps?.damaged ? 'dmg' : ''} ${can ? '' : 'locked'}`}>
      <div className="pin-line" onClick={onSelect}>
        <span className="pin-name">
          {def.name}
          {label && <small>{label}</small>}
        </span>
        <Badges def={def} />
        {can ? (
          <select
            value={cfg.mode}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const m = e.target.value as PinMode;
              setPin(withMode(m));
            }}
          >
            {modes.map((m) => (
              <option key={m} value={m}>
                {T(modeName(m))}
              </option>
            ))}
          </select>
        ) : (
          <span className="pin-locked">{tr('不可用', 'n/a')}</span>
        )}
      </div>
      {showReadings && (
        <div className="pin-read" onClick={onSelect}>
          {ps ? (
            <>
              {isOut && cfg.openDrain && <span className="pbadge b-note">OD</span>}
              {rd?.averaged && (
                <span className="pbadge b-note" title={tr('时域仿真的平均值（万用表直流档读到的值）', 'time-domain average (what a multimeter on DC shows)')}>
                  {tr('平均', 'avg')}
                </span>
              )}
              <span>{volts(rd?.voltage ?? ps.voltage)}</span>
              <span title={tr('流出引脚为正，流入（灌电流）为负', 'positive = out of the pin, negative = into it (sinking)')}>{mA(rd?.current ?? ps.current)}</span>
              {cfg.mode === 'pwm' ? null : cfg.mode === 'adc' && ps.adc ? (
                <span className="pin-adc">{adc(ps.adc)}</span>
              ) : (
                <span className={`pin-logic ${isInput && (ps.logic === 'floating' || ps.logic === 'undefined') ? 'warn' : ps.logic}`}>{T(LOGIC[ps.logic])}</span>
              )}
              {cfg.mode === 'pwm' && (
                <span className="pin-adc">
                  PWM {cfg.duty.toFixed(0)}% · {formatSI(cfg.frequency, 'Hz')}
                </span>
              )}
            </>
          ) : (
            <span className="muted">{wired ? tr('（等待仿真结果）', '(no simulation data)') : tr('未接线', 'not wired')}</span>
          )}
          {net && !isFloating(net) && wired && <span className="net-chip">{net}</span>}
          {alert && <span className={`pin-alert ${alert.cls}`}>{alert.text}</span>}
        </div>
      )}
      {selected && (
        <div className="pin-detail">
          {can && (
            <div className="chips">
              {modes.map((m) => (
                <button key={m} className={cfg.mode === m ? 'on' : ''} onClick={() => setPin(withMode(m))}>
                  {T(MODE_SHORT[m])}
                </button>
              ))}
            </div>
          )}
          {isOut && (
            <label className="od-check">
              <input
                type="checkbox"
                checked={cfg.openDrain}
                onChange={(e) => setPin({ ...(part.props.pins?.[def.name] ?? { mode: cfg.mode }), openDrain: e.target.checked || undefined })}
              />
              {tr('开漏输出（open-drain）', 'Open-drain output')}
              <small>
                {tr(
                  '：“高”时引脚松开（高阻），只能往下拉——需要外部上拉电阻（I²C 就是这样）',
                  ': "high" releases the pin (high-Z), it can only pull down — needs an external pull-up (like I²C)',
                )}
              </small>
            </label>
          )}
          {cfg.mode === 'rule' && (
            <RuleEditor part={part} pin={def.name} rule={cfg.rule} onChange={(rule) => setPin({ mode: 'rule', rule, ...(cfg.openDrain ? { openDrain: true } : {}) })} />
          )}
          {cfg.mode === 'pwm' && <PwmEditor cfg={cfg} onChange={(c) => setPin({ ...cfg, ...c, mode: 'pwm', openDrain: cfg.openDrain || undefined })} />}
          <ul className="pin-caps">
            {capsText(def).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {ps && (
            <div className="pin-more">
              <div>
                {tr('引脚电压', 'Pin voltage')} <b>{volts(ps.voltage)}</b>
              </div>
              {Math.abs(ps.vLocal - ps.voltage) > 0.01 && (
                <div>
                  {tr('相对板子 GND', 'vs the board GND')} <b>{volts(ps.vLocal)}</b>
                </div>
              )}
              <div>
                {tr('引脚电流（流出为正）', 'Pin current (out = +)')} <b>{mA(ps.current)}</b>
              </div>
              {isInput && (
                <div className={ps.logic === 'floating' || ps.logic === 'undefined' ? 'warn' : ''}>
                  {tr('数字读数', 'Digital read')} <b>{T(LOGIC[ps.logic])}</b>
                </div>
              )}
              {cfg.mode === 'adc' && (
                <div>
                  ADC <b>{volts(0) === HIDDEN ? HIDDEN : ps.adc ? `${ps.adc.volts.toFixed(3)} V · ${ps.adc.raw} / 4095` : `${adcRaw(ps.voltage)} / 4095`}</b>
                </div>
              )}
              {ps.clamp > 1e-6 && (
                <div className="warn">
                  {tr('保护二极管电流', 'Clamp diode current')} <b>{mA(ps.clamp)}</b>
                </div>
              )}
              {ps.damaged && (
                <div className="bad">
                  {tr(
                    '这只脚已经烧坏了：电流或电压超过了绝对最大值。改好电路后删掉开发板重新放一块。',
                    'This pin is damaged: current or voltage went past the absolute maximum. Fix the circuit, then delete the board and place a new one.',
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function McuInspector({ part }: { part: PlacedPart }) {
  const { volts, mA } = readoutFormat(useReadingsHidden());
  const type = part.type as McuType;
  const b = MCU_BOARDS[type];
  const d = useDerived();
  const st: McuState | undefined = d.sim.mcus.get(part.ref);
  const updateProps = useStore((s) => s.updateProps);
  const selectedPin = useStore((s) => s.selectedPin);
  const selectPin = useStore((s) => s.selectPin);
  const [filter, setFilter] = useState<'all' | 'used'>('all');
  const rows = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    if (!selectedPin) return;
    if (filter === 'used') setFilter('all');
    const el = rows.current.get(selectedPin);
    el?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPin]);

  const netOf = (pin: string) => d.nl.pinNet.get(`${part.ref}.${pin}`);
  const wiredNet = (pin: string) => {
    const n = netOf(pin);
    if (isFloating(n)) return false;
    return (d.nl.circuit.nets.find((x) => x.name === n)?.pins.length ?? 0) > 1;
  };
  const order = [...new Set([...b.upper, ...b.lower])].filter((p) => b.pins[p] && (b.pins[p].kind === 'gpio' || b.pins[p].kind === 'flash'));
  const shown = order.filter((p) => filter === 'all' || wiredNet(p) || part.props.pins?.[p] || st?.pins.get(p)?.damaged);
  const setPin = (pin: string) => (c: PinConfig | null) => {
    const pins = { ...(part.props.pins ?? {}) };
    if (c) pins[pin] = c;
    else delete pins[pin];
    updateProps(part.id, { pins });
  };
  const usb = part.props.usb !== false;
  const nConfigured = Object.keys(part.props.pins ?? {}).length;
  const power = (pin: string) => (wiredNet(pin) ? netOf(pin) : null);

  return (
    <>
      <div className="editor">
        <label>{tr('USB 供电', 'USB power')}</label>
        <button className={`big-toggle ${usb ? 'on' : ''}`} onClick={() => updateProps(part.id, { usb: !usb })}>
          {usb ? tr('● USB 线已插上（电脑供 5 V）', '● USB cable plugged in (5 V from the computer)') : tr('○ USB 线已拔掉', '○ USB cable unplugged')}
        </button>
        <p className="note">
          {usb
            ? tr(
                `USB 给板子 5V 脚供电（最多约 ${(b.usbLimit * 1000).toFixed(0)} mA），板载 ${b.regulator.name} 降成 3.3 V。3V3 和 5V 脚都可以给面包板供电。`,
                `USB feeds the board's 5V pin (up to about ${(b.usbLimit * 1000).toFixed(0)} mA); the onboard ${b.regulator.name} makes 3.3 V. Both the 3V3 and 5V pins can power the breadboard.`,
              )
            : tr(
                '拔掉 USB 后，板子要从 5V 脚（经稳压器）或 3V3 脚获得电源，否则不工作。',
                'Without USB the board must be powered through its 5V pin (via the regulator) or its 3V3 pin, otherwise it does not run.',
              )}
        </p>
      </div>

      <div className="readout">
        <div className="eyebrow">{tr('板子状态', 'Board status')}</div>
        {st ? (
          <>
            <div className={st.running ? 'ok' : 'bad'}>
              {tr('芯片', 'Chip')}{' '}
              <b>
                {st.running
                  ? tr('运行中', 'running')
                  : st.v3 > 0.3
                    ? tr(`欠压复位（3V3 < ${b.brownout} V）`, `brown-out reset (3V3 < ${b.brownout} V)`)
                    : tr('没有供电', 'no power')}
              </b>
            </div>
            <div>
              {tr('3V3 电源轨', '3V3 rail')} <b>{volts(st.v3)}</b>
            </div>
            <div>
              {tr('5V 电源轨', '5V rail')} <b>{volts(st.v5)}</b>
            </div>
            <div className={st.usbOverload ? 'bad' : ''}>
              {tr('USB 电流', 'USB current')} <b>{st.usb ? `${mA(st.usbCurrent)}${st.usbOverload ? tr(' 过载！', ' overload!') : ''}` : tr('未插', 'unplugged')}</b>
            </div>
            <div className={st.reg.mode === 'limit' ? 'bad' : st.reg.mode === 'dropout' ? 'warn' : ''}>
              {b.regulator.name} <b>{T(REG_MODE[st.reg.mode])}</b>
            </div>
            <div>
              {tr('稳压器输出', 'Regulator output')}{' '}
              <b>
                {mA(st.reg.iout)} / {mA(st.reg.limit)} · {(st.reg.power * 1000).toFixed(0)} mW
              </b>
            </div>
            {power('3V3') && (
              <div>
                {tr('3V3 脚对外供电', '3V3 pin supplies')} <b>{mA(st.i3v3Out)}</b>
              </div>
            )}
            {power('5V') && (
              <div>
                {tr('5V 脚对外供电', '5V pin supplies')} <b>{mA(st.i5vOut)}</b>
              </div>
            )}
            <div>
              {tr('电源指示灯', 'Power LED')} <b>{st.powerLed ? tr('亮', 'on') : tr('灭', 'off')}</b>
            </div>
            {b.userLed && (
              <div>
                {tr(`板载 LED（${b.userLed.pin}）`, `Onboard LED (${b.userLed.pin})`)} <b>{st.userLed ? tr('亮', 'on') : tr('灭', 'off')}</b>
              </div>
            )}
          </>
        ) : (
          <div className="muted">{tr('（暂时没有这块板子的仿真结果）', '(no simulation result for this board yet)')}</div>
        )}
      </div>

      <div className="readout pin-table">
        <div className="pin-head">
          <div className="eyebrow">{tr('引脚模式（没有程序：模式就是程序）', 'Pin modes (no firmware: the mode is the program)')}</div>
          <div className="chips">
            <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>
              {tr(`全部 ${order.length}`, `All ${order.length}`)}
            </button>
            <button className={filter === 'used' ? 'on' : ''} onClick={() => setFilter('used')}>
              {tr('已接线 / 已设置', 'Wired / set')}
              {nConfigured ? ` · ${nConfigured}` : ''}
            </button>
          </div>
        </div>
        <p className="note">
          {tr('点一行（或 3D 里点引脚）展开详细设置。电流以“流出引脚”为正。', 'Click a row (or a pin in the 3D view) for details. Current is positive flowing out of the pin.')}
        </p>
        {shown.length === 0 && <div className="muted">{tr('还没有接线或设置过的引脚。', 'No pins wired or set yet.')}</div>}
        {shown.map((pin) => (
          <PinRow
            key={pin}
            part={part}
            def={b.pins[pin]}
            ps={st?.pins.get(pin)}
            rd={st?.pins.get(pin) ? pinReadout(d, part.ref, pin, st.pins.get(pin)!) : undefined}
            wired={wiredNet(pin)}
            net={netOf(pin)}
            selected={selectedPin === pin}
            onSelect={() => selectPin(part.id, selectedPin === pin ? null : pin)}
            setPin={setPin(pin)}
            rowRef={(el) => {
              if (el) rows.current.set(pin, el);
              else rows.current.delete(pin);
            }}
          />
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ devices: property editors */

const LUX_STEPS = [0.1, 1, 10, 100, 1000, 10000, 100000];
const luxName = (lux: number) =>
  lux < 1
    ? tr('几乎全黑', 'nearly dark')
    : lux < 20
      ? tr('昏暗房间', 'dim room')
      : lux < 300
        ? tr('室内灯光', 'indoor light')
        : lux < 3000
          ? tr('明亮窗边', 'bright window')
          : lux < 30000
            ? tr('阴天户外', 'overcast daylight')
            : tr('阳光直射', 'direct sunlight');

const fmtLux = (l: number) => (l >= 1000 ? `${+(l / 1000).toPrecision(3)}k` : l >= 10 ? l.toFixed(0) : l.toFixed(1));

/** Property editors for the phase-5 device types (null for other types). */
export function DeviceEditor({ type, props, onChange }: { type: PartType; props: PartProps; onChange: (p: PartProps) => void }) {
  const [beta, setBeta] = useState('');
  switch (type) {
    case 'ldr': {
      const lux = props.lux ?? 100;
      const x = Math.log10(Math.max(0.1, Math.min(100000, lux)));
      return (
        <div className="editor">
          <label>
            {tr('光照', 'Light level')} {fmtLux(lux)} lux · {luxName(lux)}
          </label>
          <input
            type="range"
            min={-1}
            max={5}
            step={0.02}
            value={x}
            onChange={(e) => {
              const v = Math.pow(10, +e.target.value);
              onChange({ lux: +v.toPrecision(v < 10 ? 2 : 3) });
            }}
          />
          <div className="chips">
            {LUX_STEPS.map((v) => (
              <button key={v} className={lux === v ? 'on' : ''} onClick={() => onChange({ lux: v })}>
                {fmtLux(v)}
              </button>
            ))}
          </div>
          <p className="note">
            {tr('电阻', 'Resistance')} <b>{ohms(ldrResistance(lux))}</b> {tr('（越亮越小）', '(brighter = lower)')}
          </p>
        </div>
      );
    }
    case 'ntc': {
      const t = props.temperature ?? 25;
      return (
        <div className="editor">
          <label>
            {tr('温度', 'Temperature')} {t.toFixed(0)} °C
          </label>
          <input type="range" min={-20} max={120} step={1} value={t} onChange={(e) => onChange({ temperature: +e.target.value })} />
          <div className="chips">
            {[0, 25, 37, 60, 100].map((v) => (
              <button key={v} className={t === v ? 'on' : ''} onClick={() => onChange({ temperature: v })}>
                {v} °C
              </button>
            ))}
          </div>
          <p className="note">
            {tr('电阻', 'Resistance')} <b>{ohms(ntcResistance(t))}</b> {tr('（越热越小；25 °C 时 10 kΩ）', '(hotter = lower; 10 kΩ at 25 °C)')}
          </p>
        </div>
      );
    }
    case 'npn': {
      const bv = props.beta ?? NPN.beta;
      return (
        <div className="editor">
          <label>{tr('电流放大倍数 β (hFE)', 'Current gain β (hFE)')}</label>
          <div className="chips">
            {[50, 100, 150, 300].map((v) => (
              <button key={v} className={bv === v ? 'on' : ''} onClick={() => onChange({ beta: v })}>
                β = {v}
              </button>
            ))}
            <input
              className="pwm-f"
              placeholder={tr('自定义', 'custom')}
              value={beta}
              onChange={(e) => setBeta(e.target.value)}
              onKeyDown={(e) => {
                const v = parseValue(beta);
                if (e.key === 'Enter' && v && v > 0) onChange({ beta: Math.min(1000, v) });
              }}
            />
          </div>
          <p className="note">
            {tr(
              `当前 β = ${bv}：放大区 Ic = β·Ib。做开关时让 Ib 大于 Ic/β（通常取 Ic/10），三极管就会饱和。`,
              `β = ${bv} now: in the active region Ic = β·Ib. As a switch, give it more than Ic/β of base current (Ic/10 is typical) and it saturates.`,
            )}
          </p>
        </div>
      );
    }
    case 'nmos': {
      const m = props.model ?? 'IRLZ44N';
      return (
        <div className="editor">
          <label>{tr('型号', 'Model')}</label>
          <div className="chips col">
            {(Object.keys(MOSFETS) as MosfetModel[]).map((k) => (
              <button key={k} className={m === k ? 'on' : ''} onClick={() => onChange({ model: k })}>
                {T(MOSFETS[k].name)} · Vth {MOSFETS[k].vth} V · Rds(on) {MOSFETS[k].rdsOn * 1000} mΩ @ {MOSFETS[k].vgsSpec} V
              </button>
            ))}
          </div>
        </div>
      );
    }
    case 'ldo': {
      const v = props.voltage ?? 3.3;
      return (
        <div className="editor">
          <label>{tr('输出电压（型号）', 'Output voltage (part number)')}</label>
          <div className="chips">
            {[3.3, 5].map((x) => (
              <button key={x} className={v === x ? 'on' : ''} onClick={() => onChange({ voltage: x })}>
                LM1117-{x.toFixed(1)}
              </button>
            ))}
          </div>
          <p className="note">
            {tr(
              `输入至少要 ${(v + LDO.dropout).toFixed(1)} V（输出 + ${LDO.dropout} V 压差）才能稳压；最大 ${LDO.limit * 1000} mA。`,
              `The input needs at least ${(v + LDO.dropout).toFixed(1)} V (output + ${LDO.dropout} V dropout) to regulate; ${LDO.limit * 1000} mA max.`,
            )}
          </p>
        </div>
      );
    }
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ devices: live readouts */

const Row = ({ k, v, cls }: { k: string; v: string; cls?: string }) => (
  <div className={cls}>
    {k} <b>{v}</b>
  </div>
);

/** Live readout block for a phase-5 device (null if the type has none). */
export function DeviceReadout({ part }: { part: PlacedPart }) {
  const { sim } = useDerived();
  const hide = useReadingsHidden();
  const ref = part.ref;
  const none = <div className="muted">{tr('（暂时没有仿真结果）', '(no simulation result yet)')}</div>;
  let body: JSX.Element | null = null;
  switch (part.type) {
    case 'npn': {
      const s = sim.bjts.get(ref);
      const region = s
        ? { cutoff: tr('截止（关）', 'cutoff (off)'), active: tr('放大区', 'active (amplifying)'), saturation: tr('饱和（完全导通）', 'saturation (fully on)') }[s.region]
        : '';
      body = s ? (
        <>
          <Row k={tr('工作区', 'Region')} v={region} cls={s.breakdown ? 'bad' : ''} />
          <Row k="Ib" v={amps(s.ib)} />
          <Row k="Ic" v={amps(s.ic)} cls={s.ic > NPN.icMax ? 'bad' : ''} />
          <Row k="Vbe" v={volts(s.vbe)} />
          <Row k="Vce" v={volts(s.vce)} />
          <Row k={tr('功耗', 'Power')} v={`${(s.power * 1000).toFixed(0)} mW`} cls={s.power > NPN.pMax ? 'bad' : ''} />
          {s.ib > 1e-9 && s.region !== 'cutoff' && <Row k="Ic / Ib" v={(s.ic / s.ib).toFixed(0)} />}
          {s.baseFloating && <div className="warn">{tr('基极悬空：加一个下拉电阻到 GND', 'Base floating: add a pull-down to GND')}</div>}
          {s.breakdown && <div className="bad">{tr('C–E 击穿！（多半是线圈断电时的反向尖峰，加续流二极管）', 'C–E breakdown! (usually a coil kick — add a flyback diode)')}</div>}
        </>
      ) : (
        none
      );
      break;
    }
    case 'nmos': {
      const s = sim.mosfets.get(ref);
      const region = s
        ? { off: tr('截止（关）', 'off'), ohmic: tr('完全导通（线性区）', 'fully on (ohmic)'), saturation: tr('半导通（饱和区，会发热）', 'partly on (saturation, gets hot)') }[
            s.region
          ]
        : '';
      body = s ? (
        <>
          <Row k={tr('工作区', 'Region')} v={region} cls={s.region === 'saturation' ? 'warn' : s.breakdown ? 'bad' : ''} />
          <Row k="Vgs" v={volts(s.vgs)} />
          <Row k="Vds" v={volts(s.vds)} />
          <Row k="Id" v={amps(s.id)} />
          <Row k="Rds" v={Number.isFinite(s.rds) ? ohms(s.rds) : '∞'} />
          <Row k={tr('功耗', 'Power')} v={`${(s.power * 1000).toFixed(0)} mW`} cls={s.power > 1 ? 'warn' : ''} />
          {s.gateFloating && <div className="warn">{tr('栅极悬空：加 10–100 kΩ 下拉到 GND', 'Gate floating: add a 10–100 kΩ pull-down to GND')}</div>}
          {s.breakdown && <div className="bad">{tr('D–S 雪崩击穿！', 'D–S avalanche breakdown!')}</div>}
        </>
      ) : (
        none
      );
      break;
    }
    case 'relay': {
      const s = sim.relays.get(ref);
      body = s ? (
        <>
          <Row
            k={tr('触点', 'Contacts')}
            v={s.energized ? tr('吸合：COM ↔ NO', 'energised: COM ↔ NO') : tr('释放：COM ↔ NC', 'released: COM ↔ NC')}
            cls={s.energized ? 'ok' : ''}
          />
          <Row k={tr('线圈电流', 'Coil current')} v={mA(s.coilCurrent)} />
          <Row k={tr('线圈电压', 'Coil voltage')} v={volts(s.coilVoltage)} />
          <p className="note">
            {tr(
              `吸合电流约 ${RELAY.pullIn * 1000} mA，低于 ${RELAY.dropOut * 1000} mA 才释放。`,
              `Pulls in at about ${RELAY.pullIn * 1000} mA; releases below ${RELAY.dropOut * 1000} mA.`,
            )}
          </p>
        </>
      ) : (
        none
      );
      break;
    }
    case 'motor': {
      const s = sim.motors.get(ref);
      body = s ? (
        <>
          <Row
            k={tr('状态', 'State')}
            v={s.running ? (s.direction > 0 ? tr('正转', 'running forward') : tr('反转', 'running in reverse')) : tr('停止', 'stopped')}
            cls={s.running ? 'ok' : ''}
          />
          <Row k={tr('电流', 'Current')} v={amps(Math.abs(s.current))} />
          <Row k={tr('电压', 'Voltage')} v={volts(s.voltage)} />
          <Row k={tr('转速（相对）', 'Speed (relative)')} v={`${Math.round(Math.abs(s.speed) * 100)} %`} />
          {!s.running && Math.abs(s.current) > 1e-4 && (
            <p className="note">{tr(`电流不到 ${MOTOR.runCurrent * 1000} mA，电机转不起来。`, `Below ${MOTOR.runCurrent * 1000} mA the motor cannot start.`)}</p>
          )}
        </>
      ) : (
        none
      );
      break;
    }
    case 'buzzer': {
      const s = sim.buzzers.get(ref);
      body = s ? (
        <>
          <Row
            k={tr('状态', 'State')}
            v={s.on ? tr('响', 'beeping') : s.reverse ? tr('接反了（不响）', 'reversed (silent)') : tr('不响', 'silent')}
            cls={s.reverse ? 'warn' : s.on ? 'ok' : ''}
          />
          <Row k={tr('响度', 'Loudness')} v={`${Math.round(s.loudness * 100)} %`} />
          <Row k={tr('电流', 'Current')} v={mA(s.current)} />
          <Row k={tr('电压', 'Voltage')} v={volts(s.voltage)} />
          {!s.on && !s.reverse && <p className="note">{tr(`两端电压要超过约 ${BUZZER.vOn} V 才会响。`, `It needs more than about ${BUZZER.vOn} V to sound.`)}</p>}
        </>
      ) : (
        none
      );
      break;
    }
    case 'ldo': {
      const s = sim.regs.get(ref);
      body = s ? (
        <>
          <Row k={tr('工作状态', 'Mode')} v={T(REG_MODE[s.mode])} cls={s.mode === 'limit' ? 'bad' : s.mode === 'dropout' ? 'warn' : s.mode === 'reg' ? 'ok' : ''} />
          <Row k="Vin" v={volts(s.vin)} />
          <Row k="Vout" v={volts(s.vout)} />
          <Row k="Iout" v={mA(s.iout)} />
          <Row k={tr('发热功率', 'Heat')} v={`${(s.power * 1000).toFixed(0)} mW`} cls={s.power > LDO.pMax ? 'bad' : ''} />
        </>
      ) : (
        none
      );
      break;
    }
    default:
      return null;
  }
  return (
    <div className="readout">
      <div className="eyebrow">{tr('实时测量', 'Live readings')}</div>
      {hide ? <HiddenReadingsNote /> : body}
    </div>
  );
}

/** Types whose readout block replaces the generic "voltage across / current" block. */
export const OWN_READOUT = new Set<PartType>(['esp32_devkit', 'stm32_bluepill', 'npn', 'nmos', 'relay', 'ldo', 'motor', 'buzzer']);
