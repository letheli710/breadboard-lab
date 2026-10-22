import { useMemo } from 'react';
import { amps, ohms, volts } from '../core/format';
import { BATTERIES, LED_COLORS, isPower, sourceVoltage } from '../core/parts';
import { layoutSchematic, type SElement } from '../core/schematic';
import type { SimResult } from '../core/solver';
import type { Circuit } from '../core/types';

interface Props {
  circuit: Circuit;
  sim?: SimResult | null;
  showValues?: boolean;
  hoverNet?: string | null;
  onHoverNet?: (n: string | null) => void;
  highlightRefs?: string[];
  emptyText?: string;
}

const INK = 'var(--ink)';

function valueText(el: SElement, sim?: SimResult | null): string[] {
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
      if (p.color) out.push(`${LED_COLORS[p.color].name}色`);
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
  }
  if (sim) {
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
    case 'potentiometer': {
      const pts = ['0,-22', '0,-15'];
      for (let i = 0; i < 6; i++) pts.push(`${i % 2 ? -7 : 7},${-15 + 2.5 + i * 5}`);
      pts.push('0,15', '0,22');
      body = <polyline points={pts.join(' ')} {...common} />;
      break;
    }
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
          {st?.burnt && <text x={-26} y={4} fontSize={14}>💥</text>}
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
  return <g transform={`translate(${el.x},${el.y}) rotate(${el.rot})`}>{body}</g>;
}

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

export function SchematicView({ circuit, sim, showValues = true, hoverNet, onHoverNet, highlightRefs = [], emptyText }: Props) {
  const lay = useMemo(() => layoutSchematic(circuit, sim), [circuit, sim]);
  const hl = new Set(highlightRefs);
  if (circuit.components.length === 0)
    return <div className="schem-empty">{emptyText ?? '面包板上还没有元件。放上元件后，这里会自动画出对应的电路图。'}</div>;

  return (
    <div className="schem-wrap">
      <svg viewBox={`0 0 ${lay.width} ${lay.height}`} width="100%" style={{ maxWidth: lay.width, minWidth: Math.min(lay.width, 380) }} className="schem" onMouseLeave={() => onHoverNet?.(null)}>
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
                {b.net.startsWith('悬空') ? '悬空' : b.net}
              </text>
              {showValues && b.voltage !== undefined && (
                <text x={x1 - (dangling ? 18 : 10)} y={b.y + 13} textAnchor="end" className="net-volt">
                  {volts(b.voltage)}
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
        {lay.elements.map((el) => (
          <g key={el.ref}>
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
            {el.comp.type === 'switch' ? <SwitchSymbol el={el} hl={hl.has(el.ref)} /> : <Symbol el={el} sim={sim} hl={hl.has(el.ref)} />}
            {el.comp.type === 'potentiometer' && (
              <g stroke={INK} strokeWidth={2} fill={INK}>
                <line x1={el.extra!.wx} y1={el.y} x2={el.x + 10} y2={el.y} />
                <polygon points={`${el.x + 9},${el.y} ${el.x + 16},${el.y - 4} ${el.x + 16},${el.y + 4}`} />
              </g>
            )}
            <text x={el.x + (el.comp.type === 'potentiometer' ? 40 : el.comp.type === 'switch' ? 26 : 18)} y={el.y - 4} className="ref-label">
              {el.ref}
            </text>
            {showValues &&
              valueText(el, sim).map((t, i) => (
                <text key={i} x={el.x + (el.comp.type === 'potentiometer' ? 40 : el.comp.type === 'switch' ? 26 : 18)} y={el.y + 11 + i * 13} className="val-label">
                  {t}
                </text>
              ))}
            {isPower(el.comp.type) && sim?.sources.get(el.ref)?.shorted && (
              <text x={el.x - 20} y={el.y - 26} className="val-label bad">
                短路!
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
