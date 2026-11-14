import { useMemo } from 'react';
import { FigureFrame } from './FigureFrame';
import { tr } from '../core/i18n';
import { isFloating } from '../core/netlist';
import { acVolts, amps, ohms, volts } from '../core/format';
import { ldrResistance, ntcResistance } from '../core/devices';
import { BATTERIES, LED_COLORS, describeComponent, isPower, sourceVoltage, terminalLabel } from '../core/parts';
import { layoutSchematic, type SElement } from '../core/schematic';
import type { SimResult } from '../core/solver';
import type { TransientResult } from '../core/transient';
import { nodeAc } from '../state/derived';
import type { Circuit } from '../core/types';

interface Props {
  circuit: Circuit;
  sim?: SimResult | null;
  /** transient result (generator on the board): node labels show average + AC swing */
  ac?: TransientResult | null;
  showValues?: boolean;
  /** keep part values but leave out simulated currents and node voltages (a lab whose
   *  measurement questions ask for exactly those readings) */
  hideReadings?: boolean;
  hoverNet?: string | null;
  onHoverNet?: (n: string | null) => void;
  highlightRefs?: string[];
  emptyText?: string;
}

const INK = 'var(--ink)';

function valueText(el: SElement, sim?: SimResult | null, readings = true): string[] {
  const c = el.comp;
  const p = c.props;
  const out: string[] = [];
  switch (c.type) {
    case 'resistor':
      if (p.resistance !== undefined) out.push(ohms(p.resistance));
      break;
    case 'potentiometer':
      if (p.resistance !== undefined) out.push(ohms(p.resistance));
      break;
    case 'led':
      if (p.color) out.push(tr(`${LED_COLORS[p.color].name}色`, LED_COLORS[p.color].name.toLowerCase()));
      break;
    case 'battery':
      out.push(BATTERIES[p.variant ?? '9V'].name.replace(/ .*/, ''));
      out.push(`${sourceVoltage(c)}V`);
      break;
    case 'bench_supply':
    case 'power_module':
    case 'dc_source':
      if (c.type === 'dc_source' && p.voltage === undefined) break;
      out.push(`${sourceVoltage(c)}V`);
      break;
    case 'npn':
      out.push(`β=${p.beta ?? 150}`);
      if (sim?.bjts.get(c.ref)) out.push({ cutoff: tr('截止', 'cutoff'), active: tr('放大', 'active'), saturation: tr('饱和', 'saturated') }[sim.bjts.get(c.ref)!.region]);
      break;
    case 'nmos':
      out.push(p.model ?? 'IRLZ44N');
      if (sim?.mosfets.get(c.ref)) out.push({ off: tr('截止', 'off'), ohmic: tr('导通', 'on'), saturation: tr('半导通', 'partly on') }[sim.mosfets.get(c.ref)!.region]);
      break;
    case 'ldo':
      out.push(`${(p.voltage ?? 3.3).toFixed(1)}V`);
      break;
    case 'ldr':
      if (p.lux !== undefined) out.push(`${p.lux} lx`, ohms(ldrResistance(p.lux)));
      break;
    case 'ntc':
      if (p.temperature !== undefined) out.push(`${p.temperature}°C`, ohms(ntcResistance(p.temperature)));
      else out.push('10k');
      break;
    case 'relay':
      if (el.sub === 'coil') out.push('5V');
      if (el.sub === 'contact' && sim?.relays.get(c.ref)) out.push(sim.relays.get(c.ref)!.energized ? tr('吸合', 'ON') : tr('释放', 'off'));
      break;
    case 'motor':
      if (sim?.motors.get(c.ref)?.running) out.push(tr('转动', 'running'));
      break;
    case 'buzzer':
      if (sim?.buzzers.get(c.ref)?.on) out.push(tr('响', 'beeping'));
      break;
  }
  // a dev board's own current readings are per pin (inspector); the relay contact has none
  if (el.box || el.sub === 'contact') return out;
  if (sim && readings) {
    const I = sim.current.get(c.ref);
    if (I !== undefined && Math.abs(I) > 2e-6 && c.type !== 'switch') out.push(`I=${amps(Math.abs(I))}`);
  }
  return out;
}

function Symbol({ el, sim, hl }: { el: SElement; sim?: SimResult | null; hl: boolean }) {
  const c = el.comp;
  const stroke = hl ? 'var(--bad)' : INK;
  const sw = hl ? 2.6 : 2;
  const common = { stroke, strokeWidth: sw, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let body: JSX.Element;
  switch (c.type) {
    case 'resistor':
    case 'potentiometer':
    case 'ldr':
    case 'ntc': {
      const pts = ['0,-22', '0,-15'];
      for (let i = 0; i < 6; i++) pts.push(`${i % 2 ? -7 : 7},${-15 + 2.5 + i * 5}`);
      pts.push('0,15', '0,22');
      body = (
        <g>
          <polyline points={pts.join(' ')} {...common} />
          {c.type === 'ldr' && (
            <g {...common} strokeWidth={1.5}>
              {/* light falling on it: two arrows pointing in */}
              <path d="M-22,-16 L-11,-7 M-14.5,-7.4 L-11,-7 L-11.6,-10.5" />
              <path d="M-22,-5 L-11,4 M-14.5,3.6 L-11,4 L-11.6,0.5" />
            </g>
          )}
          {c.type === 'ntc' && (
            <g {...common} strokeWidth={1.5}>
              {/* thermistor: a diagonal line with a flat foot, marked −t° */}
              <path d="M-13,14 L13,-14 L19,-14" />
              <text x={-24} y={-10} fontSize={10} fill={stroke} stroke="none">
                −t°
              </text>
            </g>
          )}
        </g>
      );
      break;
    }
    case 'inductor':
      body = (
        <g {...common}>
          <line x1={0} y1={-22} x2={0} y2={-16} />
          <path d="M0,-16 a6,4 0 0 1 0,8 a6,4 0 0 1 0,8 a6,4 0 0 1 0,8 a6,4 0 0 1 0,8" />
          <line x1={0} y1={16} x2={0} y2={22} />
        </g>
      );
      break;
    case 'relay':
      // the coil (the contacts are drawn by ContactSymbol)
      body = (
        <g {...common}>
          <line x1={0} y1={-22} x2={0} y2={-12} />
          <line x1={0} y1={12} x2={0} y2={22} />
          <rect x={-8} y={-12} width={16} height={24} fill="var(--paper)" />
          <line x1={-8} y1={12} x2={8} y2={-12} strokeWidth={1.4} />
        </g>
      );
      break;
    case 'motor':
      body = (
        <g {...common}>
          <line x1={0} y1={-22} x2={0} y2={-13} />
          <line x1={0} y1={13} x2={0} y2={22} />
          <circle cx={0} cy={0} r={13} fill="var(--paper)" />
          <text x={0} y={5} fontSize={14} fontWeight={700} textAnchor="middle" fill={stroke} stroke="none" transform={el.rot === 180 ? 'rotate(180)' : undefined}>
            M
          </text>
          <text x={-9} y={-15} fontSize={10} fill={stroke} stroke="none" transform={el.rot === 180 ? 'rotate(180 -9 -18)' : undefined}>
            +
          </text>
        </g>
      );
      break;
    case 'buzzer':
      body = (
        <g {...common}>
          <line x1={0} y1={-22} x2={0} y2={-8} />
          <line x1={0} y1={8} x2={0} y2={22} />
          {/* a bell-shaped sounder, with + at the top terminal */}
          <path d="M-4,-12 L4,-12 L4,12 L-4,12 Z" fill="var(--paper)" />
          <path d="M4,-12 L13,-19 L13,19 L4,12" fill="var(--paper)" />
          <text x={-12} y={-12} fontSize={10} fill={stroke} stroke="none" transform={el.rot === 180 ? 'rotate(180 -10 -15)' : undefined}>
            +
          </text>
        </g>
      );
      break;
    case 'npn':
      body = (
        <g {...common}>
          <circle cx={-4} cy={0} r={15} fill="var(--paper)" />
          <line x1={-22} y1={0} x2={-9} y2={0} />
          <line x1={-9} y1={-9} x2={-9} y2={9} strokeWidth={sw + 0.8} />
          <path d="M-9,-4 L0,-12 L0,-22" />
          <path d="M-9,4 L0,12 L0,22" />
          {/* emitter arrow pointing out */}
          <polygon points="0,12 -5.5,11 -2.6,6.6" fill={stroke} />
        </g>
      );
      break;
    case 'nmos':
      body = (
        <g {...common}>
          <circle cx={-4} cy={0} r={15} fill="var(--paper)" />
          <line x1={-22} y1={0} x2={-13} y2={0} />
          <line x1={-13} y1={-9} x2={-13} y2={9} />
          <line x1={-8} y1={-11} x2={-8} y2={-5} strokeWidth={sw + 0.6} />
          <line x1={-8} y1={-3} x2={-8} y2={3} strokeWidth={sw + 0.6} />
          <line x1={-8} y1={5} x2={-8} y2={11} strokeWidth={sw + 0.6} />
          <path d="M-8,-8 L0,-8 L0,-22" />
          <path d="M-8,8 L0,8 L0,22" />
          <path d="M-8,0 L0,0 L0,8" />
          {/* N channel: arrow points into the channel */}
          <polygon points="-8,0 -3,-3 -3,3" fill={stroke} />
        </g>
      );
      break;
    case 'opamp':
      body = (
        <g {...common}>
          <polygon points="-26,-22 -26,22 30,0" fill="var(--paper)" />
          <text x={-22} y={-6} fontSize={12} fill={stroke} stroke="none">
            −
          </text>
          <text x={-22} y={14} fontSize={12} fill={stroke} stroke="none">
            +
          </text>
        </g>
      );
      break;
    case 'ammeter':
      body = (
        <g {...common}>
          <line x1={0} y1={-22} x2={0} y2={-13} />
          <line x1={0} y1={13} x2={0} y2={22} />
          <circle cx={0} cy={0} r={13} fill="var(--paper)" />
          <text x={0} y={5} fontSize={14} fontWeight={700} textAnchor="middle" fill={stroke} stroke="none" transform={el.rot === 180 ? 'rotate(180)' : undefined}>
            A
          </text>
        </g>
      );
      break;
    case 'function_gen':
      body = (
        <g {...common}>
          <line x1={0} y1={-22} x2={0} y2={-14} />
          <line x1={0} y1={14} x2={0} y2={22} />
          <circle cx={0} cy={0} r={14} fill="var(--paper)" />
          <path d="M-8,0 Q-4,-9 0,0 T8,0" />
        </g>
      );
      break;
    case 'led':
    case 'diode': {
      const st = sim?.leds.get(c.ref);
      const col = c.type === 'led' ? LED_COLORS[c.props.color ?? 'red'].hex : INK;
      const on = st?.on && !st.burnt;
      body = (
        <g>
          <line x1={0} y1={-22} x2={0} y2={-8} {...common} />
          <line x1={0} y1={7} x2={0} y2={22} {...common} />
          {on && c.type === 'led' && <circle cx={0} cy={0} r={15} fill={col} opacity={0.25} />}
          <polygon points="-9,-8 9,-8 0,7" {...common} fill={c.type === 'led' ? (on ? col : 'var(--paper)') : INK} />
          <line x1={-9} y1={7} x2={9} y2={7} {...common} />
          {c.type === 'led' && (
            <g {...common} strokeWidth={1.5}>
              <path d="M11,-4 L19,-10 M15.5,-10.5 L19,-10 L18,-6.5" />
              <path d="M11,3 L19,-3 M15.5,-3.5 L19,-3 L18,0.5" />
            </g>
          )}
          {st?.burnt && (
            <text x={-26} y={4} fontSize={14}>
              💥
            </text>
          )}
        </g>
      );
      break;
    }
    case 'capacitor':
      body = (
        <g {...common}>
          <line x1={0} y1={-22} x2={0} y2={-4} />
          <line x1={0} y1={4} x2={0} y2={22} />
          <line x1={-11} y1={-4} x2={11} y2={-4} />
          <line x1={-11} y1={4} x2={11} y2={4} />
        </g>
      );
      break;
    case 'pushbutton': {
      const pressed = !!c.props.pressed;
      const bx = pressed ? -2.5 : -9;
      body = (
        <g {...common}>
          <line x1={0} y1={-22} x2={0} y2={-9} />
          <line x1={0} y1={9} x2={0} y2={22} />
          <circle cx={0} cy={-9} r={2.2} fill="var(--paper)" />
          <circle cx={0} cy={9} r={2.2} fill="var(--paper)" />
          <line x1={bx} y1={-12} x2={bx} y2={12} />
          <line x1={bx} y1={0} x2={bx - 8} y2={0} />
          <line x1={bx - 8} y1={-5} x2={bx - 8} y2={5} />
        </g>
      );
      break;
    }
    case 'battery':
      body = (
        <g {...common}>
          <line x1={0} y1={-22} x2={0} y2={-10} />
          <line x1={0} y1={10} x2={0} y2={22} />
          <line x1={-13} y1={-10} x2={13} y2={-10} />
          <line x1={-7} y1={-4} x2={7} y2={-4} strokeWidth={sw + 1.5} />
          <line x1={-13} y1={4} x2={13} y2={4} />
          <line x1={-7} y1={10} x2={7} y2={10} strokeWidth={sw + 1.5} />
          <text x={-22} y={-12} fontSize={12} fill={stroke} stroke="none">
            +
          </text>
        </g>
      );
      break;
    default:
      // bench supply, power module, generic DC source
      body = (
        <g {...common}>
          <line x1={0} y1={-22} x2={0} y2={-14} />
          <line x1={0} y1={14} x2={0} y2={22} />
          <circle cx={0} cy={0} r={14} fill="var(--paper)" />
          <text x={0} y={-2} fontSize={12} textAnchor="middle" fill={stroke} stroke="none">
            +
          </text>
          <text x={0} y={11} fontSize={12} textAnchor="middle" fill={stroke} stroke="none">
            −
          </text>
        </g>
      );
  }
  // three-terminal transistors flip vertically (base / gate stays on the left)
  const flipOnly = c.type === 'npn' || c.type === 'nmos';
  return <g transform={`translate(${el.x},${el.y}) ${flipOnly ? (el.rot === 180 ? 'scale(1,-1)' : '') : `rotate(${el.rot})`}`}>{body}</g>;
}

/** Dev board / regulator: a labelled box with its pin names. */
function BoxSymbol({ el, hl }: { el: SElement; hl: boolean }) {
  const b = el.box!;
  const stroke = hl ? 'var(--bad)' : INK;
  return (
    <g>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={4} fill="var(--paper)" stroke={stroke} strokeWidth={hl ? 2.6 : 2} />
      {el.comp.type !== 'ldo' && (
        <text x={b.x + b.w / 2} y={b.y + 15} textAnchor="middle" className="ref-label">
          {el.ref} · {b.title}
        </text>
      )}
      {el.labels?.map((l, i) => (
        <text key={i} x={l.x} y={l.y} textAnchor={l.anchor} className={l.kind === 'pin' ? 'pin-label' : 'mode-label'}>
          {l.text}
        </text>
      ))}
    </g>
  );
}

/** Relay contacts: COM switches between NC and NO; dashed line = mechanical link to the coil. */
function ContactSymbol({ el, hl }: { el: SElement; hl: boolean }) {
  const stroke = hl ? 'var(--bad)' : INK;
  const up = el.rot === 0;
  const s = up ? 1 : -1;
  const ax = el.extra!.ax;
  const bx = el.extra!.bx;
  const pos = el.extra!.on ? bx : ax;
  const yCom = el.y + s * 14;
  const yC = el.y - s * 14;
  const mx = (el.x + pos) / 2;
  const my = (yCom + yC + s * 3) / 2;
  return (
    <g stroke={stroke} strokeWidth={2} fill="none" strokeLinecap="round">
      <line x1={el.extra!.coilX + 9} y1={el.extra!.coilY} x2={mx} y2={my} strokeDasharray="3 3" strokeWidth={1.2} />
      <circle cx={el.x} cy={yCom} r={2.4} fill="var(--paper)" />
      <circle cx={ax} cy={yC} r={2.4} fill="var(--paper)" />
      <circle cx={bx} cy={yC} r={2.4} fill="var(--paper)" />
      <line x1={el.x} y1={yCom} x2={pos} y2={yC + s * 3} />
      <text x={ax - 5} y={yC - s * 6 + (up ? 0 : 8)} fontSize={10} fill={stroke} stroke="none" textAnchor="end">
        NC
      </text>
      <text x={bx + 5} y={yC - s * 6 + (up ? 0 : 8)} fontSize={10} fill={stroke} stroke="none">
        NO
      </text>
    </g>
  );
}

const labelDx = (el: SElement) =>
  el.comp.type === 'potentiometer'
    ? 40
    : el.comp.type === 'switch' || el.sub === 'contact'
      ? 26
      : el.comp.type === 'npn' || el.comp.type === 'nmos'
        ? 16
        : el.comp.type === 'opamp'
          ? 8
          : 18;

function SwitchSymbol({ el, hl }: { el: SElement; hl: boolean }) {
  const stroke = hl ? 'var(--bad)' : INK;
  const up = el.rot === 0;
  const s = up ? 1 : -1;
  const ax = el.extra!.ax;
  const bx = el.extra!.bx;
  const pos = el.comp.props.position === 'b' ? bx : ax;
  const yCom = el.y + s * 14;
  const yC = el.y - s * 14;
  return (
    <g stroke={stroke} strokeWidth={2} fill="none" strokeLinecap="round">
      <circle cx={el.x} cy={yCom} r={2.4} fill="var(--paper)" />
      <circle cx={ax} cy={yC} r={2.4} fill="var(--paper)" />
      <circle cx={bx} cy={yC} r={2.4} fill="var(--paper)" />
      <line x1={el.x} y1={yCom} x2={pos} y2={yC + s * 3} />
      <text x={ax - 6} y={yC - s * 6} fontSize={10} fill={stroke} stroke="none" textAnchor="end">
        a
      </text>
      <text x={bx + 6} y={yC - s * 6} fontSize={10} fill={stroke} stroke="none">
        b
      </text>
    </g>
  );
}

/** Text alternative of a breadboard schematic: the parts, then every node with what it connects. */
export function describeCircuit(c: Circuit, sim?: SimResult | null): string {
  const comps = new Map(c.components.map((x) => [x.ref, x]));
  const parts = c.components.map((x) => `${x.ref} ${describeComponent(x)}`);
  const nets = c.nets
    .filter((n) => n.pins.length > 1)
    .map((n) => {
      const pins = n.pins.map((p) => {
        const i = p.lastIndexOf('.');
        const comp = comps.get(p.slice(0, i));
        return comp ? terminalLabel(comp, p.slice(i + 1)) : p;
      });
      const v = sim?.nodeV.get(n.name);
      const name = isFloating(n.name) ? tr('悬空结点', 'floating node') : tr(`结点 ${n.name}`, `node ${n.name}`);
      return `${name}${v !== undefined ? ` (${volts(v)})` : ''}: ${pins.join(tr('、', ', '))}`;
    });
  return tr(`电路图，元件：${parts.join('、')}。连接：`, `Schematic. Parts: ${parts.join(', ')}. Connections: `) + nets.join(tr('；', '; ')) + tr('。', '.');
}

export function SchematicView({ circuit, sim, ac, showValues = true, hideReadings = false, hoverNet, onHoverNet, highlightRefs = [], emptyText }: Props) {
  const lay = useMemo(() => layoutSchematic(circuit, sim), [circuit, sim]);
  const hl = new Set(highlightRefs);
  if (circuit.components.length === 0)
    return (
      <div className="schem-empty">
        {emptyText ??
          tr('面包板上还没有元件。放上元件后，这里会自动画出对应的电路图。', 'No parts on the breadboard yet. Place some and the matching schematic is drawn here automatically.')}
      </div>
    );

  return (
    <FigureFrame label={tr('电路图（可滚动）', 'Schematic (scrollable)')} className="schem-wrap">
      <svg
        viewBox={`0 0 ${lay.width} ${lay.height}`}
        width="100%"
        style={{ maxWidth: lay.width, minWidth: Math.min(lay.width, 380) }}
        className="schem"
        role="img"
        aria-label={describeCircuit(circuit, showValues && !hideReadings ? sim : null)}
        onMouseLeave={() => onHoverNet?.(null)}
      >
        {lay.buses.map((b) => {
          const active = hoverNet === b.net;
          const xs = [...b.attachX].sort((p, q) => p - q);
          const x1 = xs[0];
          const x2 = xs[xs.length - 1];
          const dangling = xs.length === 1;
          return (
            <g key={b.net} onMouseEnter={() => onHoverNet?.(b.net)} className="bus">
              <line x1={x1 - 4} y1={b.y} x2={x2 + 4} y2={b.y} stroke="transparent" strokeWidth={16} />
              <line
                x1={dangling ? x1 - 10 : x1}
                y1={b.y}
                x2={dangling ? x1 + 10 : x2}
                y2={b.y}
                stroke={active ? 'var(--accent)' : b.isSupply ? 'var(--plus)' : b.isGround ? 'var(--minus)' : INK}
                strokeWidth={active ? 4 : b.isSupply || b.isGround ? 3 : 2}
                strokeLinecap="round"
              />
              {xs.slice(1, -1).map((x) => (
                <circle key={x} cx={x} cy={b.y} r={3.6} fill={INK} />
              ))}
              {dangling && <circle cx={x1 - 10} cy={b.y} r={3} fill="var(--paper)" stroke={INK} strokeWidth={1.5} />}
              <text x={x1 - (dangling ? 18 : 10)} y={b.y - 6} textAnchor="end" className={`net-label ${active ? 'on' : ''}`}>
                {isFloating(b.net) ? tr('悬空', 'floating') : b.net}
              </text>
              {showValues && !hideReadings && b.voltage !== undefined && (
                <text x={x1 - (dangling ? 18 : 10)} y={b.y + 13} textAnchor="end" className="net-volt">
                  {(() => {
                    const a = nodeAc({ ac: ac ?? null }, b.net);
                    return a ? acVolts(a.avg, a.pp) : volts(b.voltage);
                  })()}
                </text>
              )}
              {b.isGround && (
                <g stroke="var(--minus)" strokeWidth={2} transform={`translate(${x1 + (x2 - x1) / 2},${b.y})`}>
                  <line x1={0} y1={0} x2={0} y2={12} />
                  <line x1={-12} y1={12} x2={12} y2={12} />
                  <line x1={-7} y1={17} x2={7} y2={17} />
                  <line x1={-3} y1={22} x2={3} y2={22} />
                </g>
              )}
            </g>
          );
        })}
        {lay.elements.map((el, k) => (
          <g key={`${el.ref}.${el.half ?? el.sub ?? ''}.${k}`}>
            {el.leads.map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={hoverNet === l.net ? 'var(--accent)' : hl.has(el.ref) ? 'var(--bad)' : INK}
                strokeWidth={hoverNet === l.net ? 3.5 : 2}
                strokeLinecap="round"
                onMouseEnter={() => onHoverNet?.(l.net)}
              />
            ))}
            {el.box ? (
              <BoxSymbol el={el} hl={hl.has(el.ref)} />
            ) : el.sub === 'contact' ? (
              <ContactSymbol el={el} hl={hl.has(el.ref)} />
            ) : el.comp.type === 'switch' ? (
              <SwitchSymbol el={el} hl={hl.has(el.ref)} />
            ) : (
              <Symbol el={el} sim={sim} hl={hl.has(el.ref)} />
            )}
            {el.comp.type === 'potentiometer' && (
              <g stroke={INK} strokeWidth={2} fill={INK}>
                <line x1={el.extra!.wx} y1={el.y} x2={el.x + 10} y2={el.y} />
                <polygon points={`${el.x + 9},${el.y} ${el.x + 16},${el.y - 4} ${el.x + 16},${el.y + 4}`} />
              </g>
            )}
            {el.box ? (
              // the regulator's ref sits above its box; a dev board's is in its title row
              el.comp.type === 'ldo' && (
                <text x={el.box.x + el.box.w / 2} y={el.box.y - 6} textAnchor="middle" className="ref-label">
                  {el.ref}
                  {showValues &&
                    valueText(el, sim, !hideReadings).map((t, i) => (
                      <tspan key={i} className="val-label" dx={6}>
                        {t}
                      </tspan>
                    ))}
                </text>
              )
            ) : (
              <>
                <text x={el.x + labelDx(el)} y={el.y - 4 + (el.comp.type === 'opamp' ? -16 : 0)} className="ref-label">
                  {el.ref}
                  {el.half ? el.half : ''}
                </text>
                {showValues &&
                  valueText(el, sim, !hideReadings).map((t, i) => (
                    <text key={i} x={el.x + labelDx(el)} y={el.y + 11 + i * 13 + (el.comp.type === 'opamp' ? 18 : 0)} className="val-label">
                      {t}
                    </text>
                  ))}
              </>
            )}
            {isPower(el.comp.type) && sim?.sources.get(el.ref)?.shorted && (
              <text x={el.x - 20} y={el.y - 26} className="val-label bad">
                {tr('短路!', 'SHORT!')}
              </text>
            )}
          </g>
        ))}
      </svg>
    </FigureFrame>
  );
}
