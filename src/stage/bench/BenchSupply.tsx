// The one 台式可调直流电源 of every bench (after W4-L3 / W5-L9): a light grey box, a green display
// with each channel's set voltage and current, two knobs, and its binding posts along the foot of
// the front panel, each with a lead plugged into the board.
//  - 1 channel: posts + (red) and − (black);
//  - 2–3 independent channels: '1+' '1-' '2+' '2-' ('3+' '3-');
//  - series (±V): CH1 and CH2 in series, posts + (red, +V), COM (black, the middle point = GND),
//    − (blue, −V); a third channel adds '3+' '3-'.
// Its name defaults to supplyLabel(): 「台式可调直流电源（5 V）」 「（±9 V）」 「（18 V / 36 V）」.

import { resolveTerminal, supplyLabel, supplyLcd, supplyTerminals, type LcdLine, type SupplyChannel, type SupplyTerminal } from './format';
import { frontDir, toWorld, type BoardPoint, type Placement, type V3 } from './geometry';
import { AMBER, hoverHandlers, Lcd, NameTag, PlugLead, useAnyLit } from './parts';

export interface SupplyLead {
  /** the post the lead starts from */
  from: SupplyTerminal;
  /** the hole(s) it plugs into: one lead per point ('T+3', 'B-4', 'a10', [x, z]) */
  to: BoardPoint | BoardPoint[];
  /** lead colour (default the post's colour) */
  color?: string;
  /** ids that light this lead (it is also lit with the supply) */
  litIds?: string[];
  /** waypoints between the post and the hole (default: one arc) */
  via?: V3[];
}

export interface BenchSupplyProps extends Placement {
  /** stage id: hover sets [id] (or hoverIds), lit when useLit() has it (or one of litIds) */
  id: string;
  /** 1–3 output channels: set voltage, current limit, live current or a custom second line */
  channels: SupplyChannel[];
  /** CH1 and CH2 in series for ±V, the middle COM = GND */
  series?: boolean;
  /** the floating name (default supplyLabel(channels, series), e.g. 「台式可调直流电源（±9 V）」) */
  label?: string;
  /** replaces the whole display (first line big) */
  lcd?: LcdLine[];
  /** output off: the display turns rose */
  off?: boolean;
  leads?: SupplyLead[];
  litIds?: string[];
  hoverIds?: string[];
}

const D = 7;
const H = 5;
const PITCH = 1.8;

/** the box width for n posts (posts on the left, two knobs on the right) */
export const supplyWidth = (n: number) => Math.max(10, 2.2 + PITCH * n + 3.6);

function Lead({ from, out, lead, to, color, supplyLit }: { from: V3; out: V3; lead: SupplyLead; to: BoardPoint; color: string; supplyLit: boolean }) {
  const lit = useAnyLit(lead.litIds ?? []);
  return <PlugLead from={from} out={out} to={to} color={color} lit={supplyLit || lit} via={lead.via} />;
}

export function BenchSupply(p: BenchSupplyProps) {
  const pl: Placement = { position: p.position, yaw: p.yaw, scale: p.scale };
  const lit = useAnyLit([p.id, ...(p.litIds ?? [])]);
  const terms = supplyTerminals(p.channels, p.series);
  const w = supplyWidth(terms.length);
  const postX = (k: number) => -w / 2 + 1.6 + k * PITCH;
  const out = frontDir(pl);
  const lines = p.lcd ?? supplyLcd(p.channels, p.series);
  return (
    <group name="bench_supply">
      <group position={toWorld(pl, [0, 0, 0])} rotation={[0, pl.yaw ?? 0, 0]} scale={pl.scale ?? 1} {...hoverHandlers(p.hoverIds ?? [p.id])}>
        <mesh position={[0, H / 2, 0]}>
          <boxGeometry args={[w, H, D]} />
          <meshStandardMaterial color="#d9dde3" roughness={0.55} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.3 : 0} />
        </mesh>
        <mesh position={[0, H / 2, D / 2 + 0.01]}>
          <planeGeometry args={[w - 0.6, H - 0.5]} />
          <meshStandardMaterial color="#3b4250" roughness={0.7} />
        </mesh>
        {[w / 2 - 2.6, w / 2 - 1.2].map((x) => (
          <mesh key={x} position={[x, H - 1.6, D / 2 + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.6, 20]} />
            <meshStandardMaterial color="#9aa1ab" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {terms.map((t, k) => (
          <mesh key={t.key} position={[postX(k), 1.6, D / 2 + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.5, 14]} />
            <meshStandardMaterial color={t.color} />
          </mesh>
        ))}
      </group>
      {(p.leads ?? []).flatMap((lead, i) => {
        const t = resolveTerminal(lead.from, terms);
        if (!t) return [];
        const from = toWorld(pl, [postX(terms.indexOf(t)), 1.6, D / 2 + 0.5]);
        const tos = Array.isArray(lead.to) && typeof lead.to[0] !== 'number' ? (lead.to as BoardPoint[]) : [lead.to as BoardPoint];
        return tos.map((to, j) => <Lead key={`${i}-${j}`} from={from} out={out} lead={lead} to={to} color={lead.color ?? t.color} supplyLit={lit} />);
      })}
      <Lcd position={toWorld(pl, [-w / 2 + 3.6, H - 1.3, D / 2 + 0.05])} lines={lines} off={p.off} />
      <NameTag position={toWorld(pl, [0, H + 1.9, -D / 2])} text={p.label ?? supplyLabel(p.channels, p.series)} tone="psu" lit={lit} />
    </group>
  );
}
