// The capacitors and inductors used on every World 4 breadboard (and later), in the board
// coordinates of BreadboardXray (colX / ROW_Z), so one part looks the same in every lesson:
//  - Capacitor 'ceramic'      small disc (0.1 µF decoupling, small pF / nF parts), blue-orange
//  - Capacitor 'film'         box film capacitor (accurate nF / µF timing parts), yellow-green box
//  - Capacitor 'electrolytic' can (µF and up), with the − stripe on the negative lead's side
//  - Inductor  'radial'       drum-core choke (mH), copper winding on a ferrite drum
// Each stands upright between two holes p1 and p2 ([x, z] board units, e.g. [colX(20), ROW_Z.c]).
// For an electrolytic, p1 is the + lead and p2 the − lead.
// Stage id: `id` (lit by useLit, and set as the hover on pointer enter / leave, like every stage
// object). `label` is the floating tag ('' hides it). Instrument names shared by the lessons are in
// BENCH_NAMES.

import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useLit, useStage } from './stageStore';

/** The names every lesson uses for the bench instruments (3D tags, readouts, hover text). */
export const BENCH_NAMES = {
  supply: '台式可调直流电源',
  generator: '函数信号发生器',
  scope: '双通道示波器',
  dmm: '数字万用表',
} as const;

const hover = (ids: string[] | null) => (e: ThreeEvent<PointerEvent>) => {
  e.stopPropagation();
  useStage.getState().setHover(ids);
};

const LEAD = { color: '#c3c8ce', metalness: 0.8, roughness: 0.3 } as const;

function Legs({ p1, p2, h }: { p1: [number, number]; p2: [number, number]; h: number }) {
  return (
    <>
      {[p1, p2].map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2 - 0.2, z]}>
          <cylinderGeometry args={[0.06, 0.06, h + 0.4, 8]} />
          <meshStandardMaterial {...LEAD} />
        </mesh>
      ))}
    </>
  );
}

function Tag({ x, y, z, label }: { x: number; y: number; z: number; label: string }) {
  if (!label) return null;
  return (
    <Html position={[x, y, z]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className="bb3d-tag chip">{label}</div>
    </Html>
  );
}

const glow = (on: boolean) => ({ emissive: on ? '#f59e0b' : '#000000', emissiveIntensity: on ? 0.45 : 0 });

export function Capacitor({
  p1,
  p2,
  kind = 'ceramic',
  id,
  label = '',
}: {
  p1: [number, number];
  p2: [number, number];
  kind?: 'ceramic' | 'film' | 'electrolytic';
  id: string;
  label?: string;
}) {
  const lit = !!useLit()?.includes(id);
  const mx = (p1[0] + p2[0]) / 2;
  const mz = (p1[1] + p2[1]) / 2;
  const ang = Math.atan2(-(p2[1] - p1[1]), p2[0] - p1[0]);
  const ev = { onPointerEnter: hover([id]), onPointerLeave: hover(null) };
  if (kind === 'electrolytic') {
    const h = 2.2;
    return (
      <group>
        <Legs p1={p1} p2={p2} h={0.5} />
        <group position={[mx, 0.5 + h / 2, mz]} rotation={[0, ang, 0]}>
          <mesh {...ev}>
            <cylinderGeometry args={[0.85, 0.85, h, 28]} />
            <meshStandardMaterial color="#1f3a68" roughness={0.45} {...glow(lit)} />
          </mesh>
          {/* the − stripe faces the − lead (p2) */}
          <mesh position={[0.62, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.5, h * 0.98, 0.9]} />
            <meshStandardMaterial color="#cfd8e6" roughness={0.5} />
          </mesh>
          <mesh position={[0, h / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.8, 28]} />
            <meshStandardMaterial color="#9aa3ad" metalness={0.6} roughness={0.35} />
          </mesh>
        </group>
        <Tag x={mx} y={0.5 + h + 0.9} z={mz} label={label} />
      </group>
    );
  }
  if (kind === 'film') {
    return (
      <group>
        <Legs p1={p1} p2={p2} h={0.4} />
        <mesh position={[mx, 1.2, mz]} rotation={[0, ang, 0]} {...ev}>
          <boxGeometry args={[Math.max(1.4, Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) + 0.5), 1.7, 0.8]} />
          <meshStandardMaterial color="#c9b23a" roughness={0.5} {...glow(lit)} />
        </mesh>
        <Tag x={mx} y={2.9} z={mz} label={label} />
      </group>
    );
  }
  // ceramic disc, standing on edge across the two holes
  return (
    <group>
      <Legs p1={p1} p2={p2} h={0.6} />
      <mesh position={[mx, 1.35, mz]} rotation={[Math.PI / 2, 0, ang]} {...ev}>
        <cylinderGeometry args={[0.75, 0.75, 0.32, 24]} />
        <meshStandardMaterial color="#d98a2b" roughness={0.6} {...glow(lit)} />
      </mesh>
      <Tag x={mx} y={2.8} z={mz} label={label} />
    </group>
  );
}

export function Inductor({ p1, p2, id, label = '' }: { p1: [number, number]; p2: [number, number]; id: string; label?: string }) {
  const lit = !!useLit()?.includes(id);
  const mx = (p1[0] + p2[0]) / 2;
  const mz = (p1[1] + p2[1]) / 2;
  const ev = { onPointerEnter: hover([id]), onPointerLeave: hover(null) };
  return (
    <group>
      <Legs p1={p1} p2={p2} h={0.4} />
      {/* ferrite drum: two flanges and a copper winding between them */}
      {[0.55, 2.35].map((y) => (
        <mesh key={y} position={[mx, y, mz]}>
          <cylinderGeometry args={[1.0, 1.0, 0.3, 28]} />
          <meshStandardMaterial color="#3b3f45" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[mx, 1.45, mz]} {...ev}>
        <cylinderGeometry args={[0.82, 0.82, 1.5, 28]} />
        <meshStandardMaterial color="#b8732e" metalness={0.55} roughness={0.35} {...glow(lit)} />
      </mesh>
      {[0.85, 1.15, 1.45, 1.75, 2.05].map((y) => (
        <mesh key={y} position={[mx, y, mz]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.83, 0.05, 6, 28]} />
          <meshStandardMaterial color="#d08a3f" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <Tag x={mx} y={3.4} z={mz} label={label} />
    </group>
  );
}
