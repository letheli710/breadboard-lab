import { useState } from 'react';
import { holeLabel } from '../core/breadboard';
import { amps, formatSI, ohms, parseValue, resistorBands, volts } from '../core/format';
import { getLang, tr } from '../core/i18n';
import { isFloating } from '../core/netlist';
import { BATTERIES, LED_COLORS, PARTS, nextScopeChannel, terminalName } from '../core/parts';
import type { BatteryVariant, LedColor, PartProps, PartType, PlacedPart, Waveform } from '../core/types';
import { vavg, vmax, vmin, vrms } from '../core/transient';
import { ammeterAc, ammeterReading, ledOf, useDerived } from '../state/derived';
import { CH_COLORS } from '../three/common';
import { WIRE_COLORS, useStore } from '../state/store';
import { PartIcon } from './Icons';

const R_VALUES = [10, 47, 100, 150, 220, 330, 470, 680, 1000, 2200, 4700, 10000, 22000, 47000, 100000, 1000000];

function PropEditor({ type, props, onChange }: { type: PartType; props: PartProps; onChange: (p: PartProps) => void }) {
  const [custom, setCustom] = useState('');
  switch (type) {
    case 'resistor': {
      const bands = resistorBands(props.resistance ?? 330);
      return (
        <div className="editor">
          <label>{tr('阻值 Resistance', 'Resistance')}</label>
          <div className="chips">
            {R_VALUES.map((v) => (
              <button key={v} className={props.resistance === v ? 'on' : ''} onClick={() => onChange({ resistance: v })}>
                {ohms(v).replace(' ', '')}
              </button>
            ))}
          </div>
          <div className="row">
            <input
              placeholder={tr('自定义，如 560 或 3.3k', 'Custom, e.g. 560 or 3.3k')}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                const v = parseValue(custom);
                if (e.key === 'Enter' && v && v > 0) onChange({ resistance: v });
              }}
            />
          </div>
          <label>{tr('色环 Color code', 'Colour code')}</label>
          <div className="bands">
            {bands.map((b, i) => (
              <div key={i} className="band">
                <span style={{ background: b.hex }} />
                <small>{b.name}</small>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'potentiometer':
      return (
        <div className="editor">
          <label>{tr('总阻值', 'Total resistance')}</label>
          <div className="chips">
            {[1000, 10000, 100000].map((v) => (
              <button key={v} className={props.resistance === v ? 'on' : ''} onClick={() => onChange({ resistance: v })}>
                {ohms(v)}
              </button>
            ))}
          </div>
          <label>
            {tr('旋钮位置（滑动端 2 脚）：', 'Knob position (wiper, pin 2): ')}
            {Math.round((props.wiper ?? 0.5) * 100)}%
          </label>
          <input type="range" min={0} max={1} step={0.01} value={props.wiper ?? 0.5} onChange={(e) => onChange({ wiper: +e.target.value })} />
        </div>
      );
    case 'led':
      return (
        <div className="editor">
          <label>{tr('颜色（不同颜色的导通压降 Vf 不同）', 'Colour (each colour has a different forward voltage Vf)')}</label>
          <div className="chips">
            {(Object.keys(LED_COLORS) as LedColor[]).map((c) => (
              <button key={c} className={props.color === c ? 'on' : ''} onClick={() => onChange({ color: c })}>
                <span className="swatch" style={{ background: LED_COLORS[c].hex }} />
                {LED_COLORS[c].name} {LED_COLORS[c].vf}V
              </button>
            ))}
          </div>
        </div>
      );
    case 'battery':
      return (
        <div className="editor">
          <label>{tr('电池类型', 'Battery type')}</label>
          <div className="chips col">
            {(Object.keys(BATTERIES) as BatteryVariant[]).map((v) => (
              <button key={v} className={(props.variant ?? '9V') === v ? 'on' : ''} onClick={() => onChange({ variant: v })}>
                {BATTERIES[v].name} · {tr('内阻', 'internal R')} {BATTERIES[v].rint}Ω
              </button>
            ))}
          </div>
        </div>
      );
    case 'bench_supply':
      return (
        <div className="editor">
          <label>
            {tr('输出电压设定（CV）：', 'Output voltage (CV): ')}
            {(props.voltage ?? 5).toFixed(1)} V
          </label>
          <input type="range" min={0} max={30} step={0.1} value={props.voltage ?? 5} onChange={(e) => onChange({ voltage: +e.target.value })} />
          <label>
            {tr('限流设定（CC）：', 'Current limit (CC): ')}
            {((props.currentLimit ?? 0.1) * 1000).toFixed(0)} mA
          </label>
          <input
            type="range"
            min={0.01}
            max={2}
            step={0.01}
            value={props.currentLimit ?? 0.1}
            onChange={(e) => onChange({ currentLimit: +e.target.value })}
          />
          <p className="note">
            {tr(
              '做实验时先把限流调小（例如 50–100 mA），万一接错短路，电源只会输出这么多电流，不会烧东西。',
              'Start experiments with a low current limit (e.g. 50–100 mA): if you wire a short by mistake, the supply only delivers that much and nothing burns.',
            )}
          </p>
        </div>
      );
    case 'power_module':
      return (
        <div className="editor">
          <label>{tr('输出电压（模块上的跳线帽）', 'Output voltage (jumper cap on the module)')}</label>
          <div className="chips">
            {[5, 3.3].map((v) => (
              <button key={v} className={(props.voltage ?? 5) === v ? 'on' : ''} onClick={() => onChange({ voltage: v })}>
                {v} V
              </button>
            ))}
          </div>
        </div>
      );
    case 'pushbutton':
      return (
        <div className="editor">
          <button className={`big-toggle ${props.pressed ? 'on' : ''}`} onClick={() => onChange({ pressed: !props.pressed })}>
            {props.pressed ? tr('● 已按下（接通）', '● Pressed (closed)') : tr('○ 松开（断开）', '○ Released (open)')}
          </button>
          <p className="note">{tr('也可以直接在 3D 视图里点击按键。', 'You can also click the button in the 3D view.')}</p>
        </div>
      );
    case 'switch':
      return (
        <div className="editor">
          <label>{tr('拨杆位置', 'Lever position')}</label>
          <div className="chips">
            {(['a', 'b'] as const).map((p) => (
              <button key={p} className={(props.position ?? 'a') === p ? 'on' : ''} onClick={() => onChange({ position: p })}>
                com ↔ {p}
              </button>
            ))}
          </div>
        </div>
      );
    case 'wire':
      return (
        <div className="editor">
          <label>{tr('颜色（只为了好认，电气上没有区别）', 'Colour (just to tell wires apart — electrically all the same)')}</label>
          <div className="chips">
            {WIRE_COLORS.map((c) => (
              <button key={c} className={props.wireColor === c ? 'on' : ''} onClick={() => onChange({ wireColor: c })}>
                <span className="swatch" style={{ background: c }} />
              </button>
            ))}
          </div>
        </div>
      );
    case 'capacitor':
      return (
        <div className="editor">
          <label>{tr('电容值', 'Capacitance')}</label>
          <div className="chips">
            {[10e-9, 100e-9, 1e-6, 10e-6].map((v) => (
              <button key={v} className={props.capacitance === v ? 'on' : ''} onClick={() => onChange({ capacitance: v })}>
                {v >= 1e-6 ? `${v * 1e6}µF` : `${Math.round(v * 1e9)}nF`}
              </button>
            ))}
          </div>
        </div>
      );
    case 'inductor':
      return (
        <div className="editor">
          <label>{tr('电感量', 'Inductance')}</label>
          <div className="chips">
            {L_VALUES.map((v) => (
              <button key={v} className={props.inductance === v ? 'on' : ''} onClick={() => onChange({ inductance: v })}>
                {formatSI(v, 'H').replace(' ', '')}
              </button>
            ))}
          </div>
          <div className="row">
            <input
              placeholder={tr('自定义，如 2.2m 或 330u', 'Custom, e.g. 2.2m or 330u')}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                const v = parseValue(custom);
                if (e.key === 'Enter' && v && v > 0) onChange({ inductance: v });
              }}
            />
          </div>
        </div>
      );
    case 'function_gen': {
      const g = { waveform: props.waveform ?? 'sine', frequency: props.frequency ?? 1000, amplitude: props.amplitude ?? 1, offset: props.offset ?? 0 };
      return (
        <div className="editor">
          <label>{tr('波形', 'Waveform')}</label>
          <div className="chips">
            {(['sine', 'square', 'triangle'] as Waveform[]).map((w) => (
              <button key={w} className={g.waveform === w ? 'on' : ''} onClick={() => onChange({ waveform: w })}>
                <WaveGlyph w={w} />
                {w === 'sine' ? tr('正弦波', 'Sine') : w === 'square' ? tr('方波', 'Square') : tr('三角波', 'Triangle')}
              </button>
            ))}
          </div>
          <label>
            {tr('频率：', 'Frequency: ')}
            {formatSI(g.frequency, 'Hz', 4)}
          </label>
          <div className="chips">
            {F_VALUES.map((v) => (
              <button key={v} className={g.frequency === v ? 'on' : ''} onClick={() => onChange({ frequency: v })}>
                {formatSI(v, 'Hz').replace(' ', '')}
              </button>
            ))}
          </div>
          <div className="row">
            <input
              placeholder={tr('自定义频率，如 2.5k 或 60', 'Custom frequency, e.g. 2.5k or 60')}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                const v = parseValue(custom);
                if (e.key === 'Enter' && v && v > 0) onChange({ frequency: Math.min(v, 1e6) });
              }}
            />
          </div>
          <label>
            {tr('幅度（峰值）：', 'Amplitude (peak): ')}
            {g.amplitude.toFixed(2)} Vp · {(2 * g.amplitude).toFixed(2)} Vpp
          </label>
          <input type="range" min={0} max={10} step={0.05} value={g.amplitude} onChange={(e) => onChange({ amplitude: +e.target.value })} />
          <label>
            {tr('直流偏置：', 'DC offset: ')}
            {g.offset >= 0 ? '+' : ''}
            {g.offset.toFixed(2)} V
          </label>
          <input type="range" min={-5} max={5} step={0.05} value={g.offset} onChange={(e) => onChange({ offset: +e.target.value })} />
          <p className="note">
            {tr(
              `输出在 ${(g.offset - g.amplitude).toFixed(2)} V 到 ${(g.offset + g.amplitude).toFixed(2)} V 之间变化（空载时）。把示波器探头接到电路上就能看到波形。`,
              `The output swings between ${(g.offset - g.amplitude).toFixed(2)} V and ${(g.offset + g.amplitude).toFixed(2)} V (with no load). Put a scope probe on the circuit to see the waveform.`,
            )}
          </p>
        </div>
      );
    }
    case 'scope_probe':
      return (
        <div className="editor">
          <label>{tr('示波器通道', 'Scope channel')}</label>
          <div className="chips">
            {([1, 2] as const).map((c) => (
              <button key={c} className={(props.channel ?? 1) === c ? 'on' : ''} onClick={() => onChange({ channel: c })}>
                <span className="swatch" style={{ background: CH_COLORS[c] }} />
                CH{c}
              </button>
            ))}
          </div>
          <p className="note">
            {tr('探头和屏幕上的波形颜色一致：CH1 黄色，CH2 青色。', 'Probe colour matches its trace on the screen: CH1 yellow, CH2 cyan.')}
          </p>
        </div>
      );
    default:
      return null;
  }
}

function LedStateRow({ led }: { led: NonNullable<ReturnType<typeof ledOf>> }) {
  const flicker = 'flicker' in led && led.flicker;
  return (
    <div className={led.burnt ? 'bad' : led.overcurrent ? 'warn' : ''}>
      {tr('状态', 'State')}{' '}
      <b>
        {led.burnt
          ? tr('烧坏了', 'burnt out')
          : flicker
            ? tr('一闪一闪（频率太低）', 'blinking (low frequency)')
            : led.on
              ? tr('导通 / 发光', 'conducting / lit')
              : led.reverse
                ? tr('反向截止', 'reverse-biased (off)')
                : tr('截止（不亮）', 'off')}
      </b>
    </div>
  );
}

function AmmeterReadout({ refName }: { refName: string }) {
  const d = useDerived();
  const I = ammeterReading(d, refName);
  const acm = ammeterAc(d, refName);
  return (
    <div className="readout">
      <div className="eyebrow">{tr('电流表读数', 'Ammeter reading')}</div>
      <div className="am-lcd">{amps(I)}</div>
      {acm && (
        <>
          <div className="ac-tag">{tr('交流电路：电流表（DC 档）显示平均值', 'AC circuit: the meter (DC mode) shows the average')}</div>
          <div>
            {tr('有效值 RMS', 'RMS')} <b>{amps(acm.rms)}</b>
          </div>
          <div>
            {tr('最小 / 最大', 'Min / max')} <b>{`${amps(acm.min)} / ${amps(acm.max)}`}</b>
          </div>
        </>
      )}
      <p className="note">
        {I < -5e-7
          ? tr('读数为负：电流是从黑表笔流进、红表笔流出的，表笔反了。', 'Negative reading: current flows in at the black lead and out at the red one — the leads are swapped.')
          : tr('电流从红表笔流入、黑表笔（COM）流出时读数为正。', 'The reading is positive when current flows in at the red lead and out at the black (COM) lead.')}
      </p>
    </div>
  );
}

const L_VALUES = [100e-6, 1e-3, 4.7e-3, 10e-3, 47e-3, 100e-3, 1];
const F_VALUES = [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];

function WaveGlyph({ w }: { w: Waveform }) {
  const d = w === 'sine' ? 'M1 7 Q 4 -1, 7 7 T 13 7' : w === 'square' ? 'M1 11 V3 H7 V11 H13 V3' : 'M1 11 L4 3 L7 11 L10 3 L13 11';
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
}

/** LM358 top view with pin numbers and what each pin is doing on this board. */
function OpAmpInfo({ part }: { part: PlacedPart }) {
  const d = useDerived();
  const st = d.sim.opamps.get(part.ref);
  const names: Record<string, string> = { '1': 'OUT A', '2': 'IN− A', '3': 'IN+ A', '4': 'V− / GND', '5': 'IN+ B', '6': 'IN− B', '7': 'OUT B', '8': 'V+' };
  const netOf = (pin: string) => {
    const n = d.nl.pinNet.get(`${part.ref}.${PARTS.opamp.terminalOf[pin]}`);
    return isFloating(n) ? null : n;
  };
  const pinBox = (pin: string, x: number, y: number, labelAbove: boolean) => {
    const net = netOf(pin);
    const power = pin === '4' || pin === '8';
    return (
      <g key={pin}>
        <rect x={x - 7} y={y - 7} width="14" height="14" rx="2" fill={net ? (power ? (pin === '8' ? '#e63946' : '#2b59c3') : '#2ba59b') : '#c9ccd1'} />
        <text x={x} y={y + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill={net ? '#fff' : '#1f2a44'}>
          {pin}
        </text>
        <text x={x} y={labelAbove ? y - 12 : y + 21} textAnchor="middle" fontSize="9" fill="#3a4560" fontWeight="600">
          {names[pin]}
        </text>
        {net && (
          <text x={x} y={labelAbove ? y - 23 : y + 32} textAnchor="middle" fontSize="8.5" fill="#2ba59b" fontWeight="700">
            {net}
          </text>
        )}
      </g>
    );
  };
  const xs = [38, 86, 134, 182];
  const half = (h: 'A' | 'B') => {
    const s = st?.[h];
    if (!s || !s.used) return tr('未使用', 'unused');
    if (s.mode === 'off') return tr('没有供电', 'no power');
    const clip = d.ac?.clipping.has(`${part.ref}.${h}`);
    const m = s.mode === 'linear' ? tr('线性放大', 'linear') : s.mode === 'high' ? tr('输出顶到上限（饱和）', 'stuck at the top rail (saturated)') : tr('输出顶到下限（饱和）', 'stuck at the bottom rail (saturated)');
    return `${m}${d.ac ? '' : ` · OUT ${volts(s.out)}`}${clip ? tr(' · 交流时削顶', ' · clips on AC') : ''}`;
  };
  return (
    <div className="readout">
      <div className="eyebrow">{tr('引脚图（俯视）', 'Pinout (top view)')}</div>
      <svg viewBox="0 0 220 150" className="pinout">
        <rect x="22" y="52" width="176" height="46" rx="4" fill="#1c1d21" />
        <path d="M22 66 A9 9 0 0 1 22 84" fill="#4a4c53" />
        <circle cx="38" cy="86" r="4" fill="#4a4c53" />
        <text x="115" y="80" textAnchor="middle" fontSize="15" fill="#d9dce2" fontWeight="700">
          LM358
        </text>
        {['8', '7', '6', '5'].map((p, i) => pinBox(p, xs[i], 40, true))}
        {['1', '2', '3', '4'].map((p, i) => pinBox(p, xs[i], 110, false))}
      </svg>
      <p className="note">
        {tr(
          '缺口和圆点所在的一端是 1 脚，逆时针数到 8 脚。上面 8–5 脚插在 f 行，下面 1–4 脚插在 e 行。绿色 = 已接线，红/蓝 = 电源脚已接。',
          'Pin 1 is at the notch / dot end; count anticlockwise to pin 8. Pins 8–5 sit in row f, pins 1–4 in row e. Green = wired, red/blue = power pin wired.',
        )}
      </p>
      <div className={st?.powered ? '' : 'warn'}>
        {tr('电源', 'Power')}{' '}
        <b>{st?.powered ? `${volts(st.supply)} (V+ − V−)` : tr('未供电：8 脚接 +，4 脚接 GND', 'not powered: pin 8 to +, pin 4 to GND')}</b>
      </div>
      <div>
        {tr('运放 A（1–3 脚）', 'Op-amp A (pins 1–3)')} <b>{half('A')}</b>
      </div>
      <div>
        {tr('运放 B（5–7 脚）', 'Op-amp B (pins 5–7)')} <b>{half('B')}</b>
      </div>
    </div>
  );
}

export function Inspector() {
  const selectedId = useStore((s) => s.selectedId);
  const layout = useStore((s) => s.layout);
  const tool = useStore((s) => s.tool);
  const placingProps = useStore((s) => s.placingProps);
  const setPlacingProps = useStore((s) => s.setPlacingProps);
  const updateProps = useStore((s) => s.updateProps);
  const removePart = useStore((s) => s.removePart);
  const derived = useDerived();
  const { sim, nl, ac } = derived;
  const part = layout.parts.find((p) => p.id === selectedId);

  if (!part) {
    if (tool !== 'select' && tool !== 'probe') {
      const def = PARTS[tool];
      return (
        <div className="inspector">
          <div className="insp-head">
            <PartIcon type={tool} size={44} />
            <div>
              <div className="eyebrow">{tr('即将放置', 'Placing next')}</div>
              <h3>
                {def.name} {getLang() === 'zh' && <small>{def.nameEn}</small>}
              </h3>
            </div>
          </div>
          <p className="blurb">{def.blurb}</p>
          {tool === 'scope_probe' ? (
            <p className="note">
              {nextScopeChannel(layout)
                ? tr(`通道自动分配：这个探头将接到 CH${nextScopeChannel(layout)}。放好后可以在这里改。`, `Channel is assigned automatically: this probe will be CH${nextScopeChannel(layout)}. You can change it after placing.`)
                : tr('CH1 和 CH2 都已经有探头了——先删掉一个探头。', 'CH1 and CH2 both have a probe already — delete one first.')}
            </p>
          ) : (
            <PropEditor type={tool} props={{ ...def.defaults, ...placingProps[tool] }} onChange={(p) => setPlacingProps(tool, p)} />
          )}
        </div>
      );
    }
    return (
      <div className="inspector empty">
        <p>{tr('在 3D 视图中点击一个元件来查看和修改它的参数。', 'Click a part in the 3D view to see and change its settings.')}</p>
        <p>{tr('或者从左侧工具栏选择一个元件放到面包板上。', 'Or pick a part from the toolbox on the left and put it on the breadboard.')}</p>
        <ul className="keys">
          <li>
            <kbd>Esc</kbd> / {tr('右键', 'right-click')} {tr('取消放置', 'cancel placing')}
          </li>
          <li>
            <kbd>Delete</kbd> {tr('删除选中的元件', 'delete the selected part')}
          </li>
          <li>
            <kbd>Ctrl</kbd>+<kbd>Z</kbd> {tr('撤销（也会取消只放了一只脚的元件）', 'undo (also drops a half-placed part)')}
          </li>
          <li>{tr('拖动旋转视角，滚轮缩放，右键拖动平移；右上角“视角”按钮一键切换预设视角', 'Drag to rotate, scroll to zoom, right-drag to pan; the "View" button (top right) cycles preset views')}</li>
        </ul>
      </div>
    );
  }

  const def = PARTS[part.type];
  const I = sim.current.get(part.ref);
  const Vd = sim.vdrop.get(part.ref);
  const led = ledOf(derived, part.ref);
  const src = part.type === 'function_gen' ? undefined : sim.sources.get(part.ref);
  const acI = ac && part.type !== 'scope_probe' && part.type !== 'opamp' ? ac.current(part.ref) : null;
  return (
    <div className="inspector">
      <div className="insp-head">
        <PartIcon type={part.type} size={44} />
        <div>
          <div className="eyebrow">{part.ref}</div>
          <h3>
            {def.name} {getLang() === 'zh' && <small>{def.nameEn}</small>}
          </h3>
        </div>
        <button className="danger" onClick={() => removePart(part.id)}>
          {tr('删除', 'Delete')}
        </button>
      </div>
      <p className="blurb">{def.blurb}</p>
      <PropEditor type={part.type} props={part.props} onChange={(p) => updateProps(part.id, p)} />

      {part.type === 'opamp' && <OpAmpInfo part={part} />}
      {part.type === 'ammeter' && <AmmeterReadout refName={part.ref} />}
      {part.type !== 'wire' && part.type !== 'opamp' && part.type !== 'ammeter' && part.type !== 'scope_probe' && (
        <div className="readout">
          <div className="eyebrow">{tr('实时测量', 'Live readings')}</div>
          {src ? (
            <>
              <div>
                {tr('端电压', 'Terminal voltage')} <b>{volts(src.terminalVoltage)}</b>
              </div>
              <div>
                {tr('输出电流', 'Output current')} <b>{amps(src.current)}</b>
              </div>
              {src.ccMode && <div className="warn">{tr('限流中（CC 模式）', 'Current limiting (CC mode)')}</div>}
              {src.shorted && <div className="bad">{tr('短路！', 'Short circuit!')}</div>}
            </>
          ) : acI ? (
            <>
              <div className="ac-tag">{tr('交流（信号发生器驱动）', 'AC (driven by the generator)')}</div>
              <div>
                {tr('电流 平均值', 'Current, average')} <b>{amps(vavg(acI))}</b>
              </div>
              <div>
                {tr('电流 有效值', 'Current, RMS')} <b>{amps(vrms(acI))}</b>
              </div>
              <div>
                {tr('电流 峰值', 'Current, peak')} <b>{amps(Math.max(Math.abs(vmax(acI)), Math.abs(vmin(acI))))}</b>
              </div>
              {led && <LedStateRow led={led} />}
            </>
          ) : (
            <>
              {Vd !== undefined && (
                <div>
                  {tr('两端电压', 'Voltage across')} <b>{volts(Vd)}</b>
                </div>
              )}
              {I !== undefined && (
                <div>
                  {tr('电流', 'Current')} <b>{amps(Math.abs(I))}</b>
                </div>
              )}
              {I !== undefined && Vd !== undefined && Math.abs(I) > 1e-6 && (
                <div>
                  {tr('功率', 'Power')} <b>{(Math.abs(I * Vd) * 1000).toFixed(1)} mW</b>
                </div>
              )}
              {led && <LedStateRow led={led} />}
            </>
          )}
        </div>
      )}

      <div className="readout">
        <div className="eyebrow">{tr('引脚位置', 'Pin positions')}</div>
        {Object.entries(part.pins).map(([pin, hole]) => {
          const term = def.terminalOf[pin];
          const tl = terminalName(part.type, term);
          const net = nl.holeNet.get(hole);
          return (
            <div key={pin} className="pinrow">
              <span>{part.type === 'wire' ? (pin === 'a' ? tr('起点', 'start') : tr('终点', 'end')) : tl}</span>
              <span>{holeLabel(hole)}</span>
              {!isFloating(net) && <span className="net-chip">{net}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
