// Small 3D pieces shared by the bench instruments (and free for lessons to use): leads as tubes,
// alligator clips on stub wires, scope probes, name tags, front-panel displays, a bench top.

import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useLit, useStage } from '../stageStore';
import { boardXZ, clipAt, clipPath, groundLeadPath, plugPath, probeCablePath, type BoardPoint, type V3 } from './geometry';
import type { LcdLine } from './format';
import './bench.css';

export const AMBER = '#f59e0b';
export const METAL = { color: '#c3c8ce', metalness: 0.8, roughness: 0.3 } as const;

/** true when any of `ids` is lit (hover > guided step > act halo) */
export function useAnyLit(ids: ReadonlyArray<string | undefined>): boolean {
  const lit = useLit();
  return ids.some((id) => !!id && lit.includes(id));
}

/** pointer handlers that set the stage hover to `ids` and clear it on leave, like every stage object */
export function hoverHandlers(ids: string[]) {
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      useStage.getState().setHover(ids);
    },
    onPointerOut: () => useStage.getState().setHover(null),
  };
}

const glow = (lit: boolean, color = AMBER, k = 0.7) => ({ emissive: lit ? color : '#000000', emissiveIntensity: lit ? k : 0 });

/** A wire / cable as a smooth tube through the points (rebuilt only when the points change). */
export function Wire({ pts, color, r = 0.13, lit = false, glowColor = AMBER }: { pts: V3[]; color: string; r?: number; lit?: boolean; glowColor?: string }) {
  const key = pts.map((p) => p.map((n) => n.toFixed(3)).join(',')).join(';');
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      key.split(';').map((s) => new THREE.Vector3(...(s.split(',').map(Number) as V3))),
      false,
      'centripetal',
    );
    return new THREE.TubeGeometry(curve, 72, r, 8, false);
  }, [key, r]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.5} {...glow(lit, glowColor)} />
    </mesh>
  );
}

/** a short stub wire standing in a hole, for an alligator clip to bite on */
export function Stub({ at, color, h = 1.3 }: { at: BoardPoint; color: string; h?: number }) {
  const [x, z] = boardXZ(at);
  return (
    <mesh position={[x, h / 2 - 0.3, z]}>
      <cylinderGeometry args={[0.1, 0.1, h + 0.6, 8]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
}

/** an alligator clip (a small jaw) at a point; `bad` paints it red (clipped in the wrong place) */
export function AlligatorClip({ at, color, lit = false, bad = false }: { at: V3; color: string; lit?: boolean; bad?: boolean }) {
  return (
    <group position={at}>
      <mesh rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.5, 1.1, 0.42]} />
        <meshStandardMaterial color={bad ? '#e11d48' : color} roughness={0.45} {...(bad ? glow(true, '#e11d48', 0.8) : glow(lit, AMBER, 0.6))} />
      </mesh>
      <mesh position={[0.32, -0.55, 0]}>
        <boxGeometry args={[0.18, 0.3, 0.3]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
    </group>
  );
}

const isV3 = (p: BoardPoint | V3): p is V3 => Array.isArray(p) && p.length === 3;

/**
 * A lead from an instrument terminal ending in an alligator clip. `to` is a board point (the clip
 * bites a stub wire standing in that hole) or a world point (the clip hangs on a part's lead).
 */
export function ClipLead({
  from,
  out,
  to,
  color,
  lit = false,
  bad = false,
  via,
  r = 0.14,
}: {
  from: V3;
  /** the direction the terminal faces (frontDir of the instrument) */
  out: V3;
  to: BoardPoint | V3;
  color: string;
  lit?: boolean;
  bad?: boolean;
  /** waypoints between the terminal and the clip (default: one arc) */
  via?: V3[];
  r?: number;
}) {
  const clip = isV3(to) ? to : clipAt(to);
  return (
    <group>
      <Wire pts={clipPath(from, out, clip, via)} color={color} r={r} lit={lit} />
      {!isV3(to) && <Stub at={to} color={color} />}
      <AlligatorClip at={clip} color={color} lit={lit} bad={bad} />
    </group>
  );
}

/** A lead from an instrument terminal plugged straight into a hole (a supply lead). */
export function PlugLead({ from, out, to, color, lit = false, via }: { from: V3; out: V3; to: BoardPoint; color: string; lit?: boolean; via?: V3[] }) {
  return <Wire pts={plugPath(from, out, to, via)} color={color} r={0.14} lit={lit} />;
}

/**
 * A scope probe: the hook's tip in a hole, the probe body, its cable back to the jack, and (with
 * `ground`) the short ground lead to an alligator clip. Hover ids: `id` for the probe and cable,
 * `groundId` for the ground lead and clip.
 */
export function ProbeLead({
  jack,
  out,
  tip,
  color,
  id,
  lit = false,
  ground,
  groundId,
  groundLit = false,
  groundBad = false,
}: {
  /** the jack on the scope (world) and the direction it faces */
  jack: V3;
  out: V3;
  tip: BoardPoint;
  /** the channel colour (ring on the probe body, glow when lit) */
  color: string;
  id: string;
  lit?: boolean;
  /** the ground clip: a board point (on a stub wire) or a world point; omitted: no ground lead */
  ground?: BoardPoint | V3;
  groundId?: string;
  groundLit?: boolean;
  groundBad?: boolean;
}) {
  const [x, z] = boardXZ(tip);
  const clip = ground === undefined ? null : isV3(ground) ? ground : clipAt(ground);
  return (
    <group>
      <group {...hoverHandlers([id])}>
        <mesh position={[x, 0.6, z]}>
          <cylinderGeometry args={[0.05, 0.03, 1.6, 8]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
        <mesh position={[x, 2.3, z]}>
          <cylinderGeometry args={[0.3, 0.24, 2.4, 14]} />
          <meshStandardMaterial color="#2a2d33" roughness={0.45} {...glow(lit, color)} />
        </mesh>
        <mesh position={[x, 3.2, z]}>
          <cylinderGeometry args={[0.34, 0.34, 0.3, 14]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <Wire pts={probeCablePath([x, z], jack, out)} color="#2a2d33" r={0.12} lit={lit} />
      </group>
      {clip && ground !== undefined && (
        <group {...(groundId ? hoverHandlers([groundId]) : {})}>
          {!isV3(ground) && <Stub at={ground} color="#24262b" />}
          <Wire pts={groundLeadPath([x, z], clip)} color="#24262b" r={0.06} lit={groundLit} />
          <AlligatorClip at={clip} color="#24262b" lit={groundLit} bad={groundBad} />
        </group>
      )}
    </group>
  );
}

export type TagTone = 'psu' | 'gen' | 'scope' | 'plain';

/** An instrument's floating name tag (amber when lit). */
export function NameTag({ position, text, tone, lit }: { position: V3; text: string; tone: TagTone; lit: boolean }) {
  return (
    <Html position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`bb3d-tag bench-tag ${tone} ${lit ? 'lit' : ''}`}>{text}</div>
    </Html>
  );
}

/** A front-panel display (green LCD; `off` turns it rose for a cut output). */
export function Lcd({ position, lines, off = false, align = 'left' }: { position: V3; lines: LcdLine[]; off?: boolean; align?: 'left' | 'right' }) {
  return (
    <Html position={position} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`bench-lcd ${off ? 'off' : ''} ${align}`}>{lines.map((l, i) => (l.strong ? <b key={i}>{l.text}</b> : <span key={i}>{l.text}</span>))}</div>
    </Html>
  );
}

/** An optional bench top under the board and the instruments (y = −1), in board units. */
export function BenchTable({ x = [-60, 50], z = [-30, 18], color = '#e9dfca' }: { x?: [number, number]; z?: [number, number]; color?: string }) {
  return (
    <mesh position={[(x[0] + x[1]) / 2, -1.02, (z[0] + z[1]) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[x[1] - x[0], z[1] - z[0]]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}
