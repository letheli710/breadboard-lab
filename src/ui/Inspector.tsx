import { useState } from 'react';
import { holeLabel } from '../core/breadboard';
import { amps, ohms, parseValue, resistorBands, volts } from '../core/format';
import { BATTERIES, LED_COLORS, PARTS, TERMINAL_LABEL } from '../core/parts';
import type { BatteryVariant, LedColor, PartProps, PartType } from '../core/types';
import { useDerived } from '../state/derived';
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
          <label>阻值 Resistance</label>
          <div className="chips">
            {R_VALUES.map((v) => (
              <button key={v} className={props.resistance === v ? 'on' : ''} onClick={() => onChange({ resistance: v })}>
                {ohms(v).replace(' ', '')}
              </button>
            ))}
          </div>
          <div className="row">
            <input
              placeholder="自定义，如 560 或 3.3k"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                const v = parseValue(custom);
                if (e.key === 'Enter' && v && v > 0) onChange({ resistance: v });
              }}
            />
          </div>
          <label>色环 Color code</label>
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
          <label>总阻值</label>
          <div className="chips">
            {[1000, 10000, 100000].map((v) => (
              <button key={v} className={props.resistance === v ? 'on' : ''} onClick={() => onChange({ resistance: v })}>
                {ohms(v)}
              </button>
            ))}
          </div>
          <label>旋钮位置（滑动端 2 脚）：{Math.round((props.wiper ?? 0.5) * 100)}%</label>
          <input type="range" min={0} max={1} step={0.01} value={props.wiper ?? 0.5} onChange={(e) => onChange({ wiper: +e.target.value })} />
        </div>
      );
    case 'led':
      return (
        <div className="editor">
          <label>颜色（不同颜色的导通压降 Vf 不同）</label>
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
          <label>电池类型</label>
          <div className="chips col">
            {(Object.keys(BATTERIES) as BatteryVariant[]).map((v) => (
              <button key={v} className={(props.variant ?? '9V') === v ? 'on' : ''} onClick={() => onChange({ variant: v })}>
                {BATTERIES[v].name} · 内阻 {BATTERIES[v].rint}Ω
              </button>
            ))}
          </div>
        </div>
      );
    case 'bench_supply':
      return (
        <div className="editor">
          <label>输出电压设定（CV）：{(props.voltage ?? 5).toFixed(1)} V</label>
          <input type="range" min={0} max={30} step={0.1} value={props.voltage ?? 5} onChange={(e) => onChange({ voltage: +e.target.value })} />
          <label>限流设定（CC）：{((props.currentLimit ?? 0.1) * 1000).toFixed(0)} mA</label>
          <input
            type="range"
            min={0.01}
            max={2}
            step={0.01}
            value={props.currentLimit ?? 0.1}
            onChange={(e) => onChange({ currentLimit: +e.target.value })}
          />
          <p className="note">做实验时先把限流调小（例如 50–100 mA），万一接错短路，电源只会输出这么多电流，不会烧东西。</p>
        </div>
      );
    case 'power_module':
      return (
        <div className="editor">
          <label>输出电压（模块上的跳线帽）</label>
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
            {props.pressed ? '● 已按下（接通）' : '○ 松开（断开）'}
          </button>
          <p className="note">也可以直接在 3D 视图里点击按键。</p>
        </div>
      );
    case 'switch':
      return (
        <div className="editor">
          <label>拨杆位置</label>
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
          <label>颜色（只为了好认，电气上没有区别）</label>
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
          <label>电容值</label>
          <div className="chips">
            {[10e-9, 100e-9, 1e-6, 10e-6].map((v) => (
              <button key={v} className={props.capacitance === v ? 'on' : ''} onClick={() => onChange({ capacitance: v })}>
                {v >= 1e-6 ? `${v * 1e6}µF` : `${Math.round(v * 1e9)}nF`}
              </button>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function Inspector() {
  const selectedId = useStore((s) => s.selectedId);
  const layout = useStore((s) => s.layout);
  const tool = useStore((s) => s.tool);
  const placingProps = useStore((s) => s.placingProps);
  const setPlacingProps = useStore((s) => s.setPlacingProps);
  const updateProps = useStore((s) => s.updateProps);
  const removePart = useStore((s) => s.removePart);
  const { sim, nl } = useDerived();
  const part = layout.parts.find((p) => p.id === selectedId);

  if (!part) {
    if (tool !== 'select' && tool !== 'probe') {
      const def = PARTS[tool];
      return (
        <div className="inspector">
          <div className="insp-head">
            <PartIcon type={tool} size={44} />
            <div>
              <div className="eyebrow">即将放置</div>
              <h3>
                {def.name} <small>{def.nameEn}</small>
              </h3>
            </div>
          </div>
          <p className="blurb">{def.blurb}</p>
          <PropEditor type={tool} props={{ ...def.defaults, ...placingProps[tool] }} onChange={(p) => setPlacingProps(tool, p)} />
        </div>
      );
    }
    return (
      <div className="inspector empty">
        <p>在 3D 视图中点击一个元件来查看和修改它的参数。</p>
        <p>或者从左侧工具栏选择一个元件放到面包板上。</p>
        <ul className="keys">
          <li>
            <kbd>Esc</kbd> 取消放置
          </li>
          <li>
            <kbd>Delete</kbd> 删除选中的元件
          </li>
          <li>
            <kbd>Ctrl</kbd>+<kbd>Z</kbd> 撤销
          </li>
          <li>拖动旋转视角，滚轮缩放，右键平移</li>
        </ul>
      </div>
    );
  }

  const def = PARTS[part.type];
  const I = sim.current.get(part.ref);
  const Vd = sim.vdrop.get(part.ref);
  const led = sim.leds.get(part.ref);
  const src = sim.sources.get(part.ref);
  return (
    <div className="inspector">
      <div className="insp-head">
        <PartIcon type={part.type} size={44} />
        <div>
          <div className="eyebrow">{part.ref}</div>
          <h3>
            {def.name} <small>{def.nameEn}</small>
          </h3>
        </div>
        <button className="danger" onClick={() => removePart(part.id)}>
          删除
        </button>
      </div>
      <p className="blurb">{def.blurb}</p>
      <PropEditor type={part.type} props={part.props} onChange={(p) => updateProps(part.id, p)} />

      {part.type !== 'wire' && (
        <div className="readout">
          <div className="eyebrow">实时测量</div>
          {src ? (
            <>
              <div>
                端电压 <b>{volts(src.terminalVoltage)}</b>
              </div>
              <div>
                输出电流 <b>{amps(src.current)}</b>
              </div>
              {src.ccMode && <div className="warn">限流中（CC 模式）</div>}
              {src.shorted && <div className="bad">短路！</div>}
            </>
          ) : (
            <>
              {Vd !== undefined && (
                <div>
                  两端电压 <b>{volts(Vd)}</b>
                </div>
              )}
              {I !== undefined && (
                <div>
                  电流 <b>{amps(Math.abs(I))}</b>
                </div>
              )}
              {I !== undefined && Vd !== undefined && Math.abs(I) > 1e-6 && (
                <div>
                  功率 <b>{(Math.abs(I * Vd) * 1000).toFixed(1)} mW</b>
                </div>
              )}
              {led && (
                <div className={led.burnt ? 'bad' : led.overcurrent ? 'warn' : ''}>
                  状态 <b>{led.burnt ? '烧坏了' : led.on ? '导通 / 发光' : led.reverse ? '反向截止' : '截止（不亮）'}</b>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="readout">
        <div className="eyebrow">引脚位置</div>
        {Object.entries(part.pins).map(([pin, hole]) => {
          const term = def.terminalOf[pin];
          const tl = TERMINAL_LABEL[part.type]?.[term] ?? `${pin} 脚`;
          const net = nl.holeNet.get(hole);
          return (
            <div key={pin} className="pinrow">
              <span>{part.type === 'wire' ? (pin === 'a' ? '起点' : '终点') : tl}</span>
              <span>{holeLabel(hole)}</span>
              {net && !net.startsWith('悬空') && <span className="net-chip">{net}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
