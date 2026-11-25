// Reusable pieces for other lessons' 3D breadboard layers are exported: geometry (colX, ROW_Z,
// RAIL_Z), Shell / Clips / SurfaceGlow / TrenchGlow, Resistor, Lead, Chip, CameraRig.
//
// Layer "01 3D 面包板导通透视": an 830-hole breadboard (63 columns × a–j + four 50-hole rails)
// whose plastic shell fades with the X-ray slider, showing the spring clips underneath: the
// rails run the whole length, each column has two 5-hole strips (a–e, f–j), the centre trench
// separates them. Two 10 kΩ resistors show the wrong (same column: shorted) and the right
// (across columns) way in, and an 8-pin chip straddles the trench.
// Hovering a hole lights the strip it belongs to; ids in the lesson's hover map light the
// linked term in the text as well (and the other way round).

import { Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../ui/reveal';
import { bandMeanings, bandValue, COLOR_BY_KEY, formatOhms } from './colorCode';
import { stripId } from './breadboardIds';
import { useLit, useStage } from './stageStore';
export { genericLabel, stripId } from './breadboardIds';
import type { StageSync } from './types';

/* ------------------------------------------------------------- geometry (1 unit = 2.54 mm) */

export const COLS = 63;
export const W = 66;
export const D = 22.4;
export const ROWS = 'abcdefghij';
export const ROW_Z: Record<string, number> = { a: -5.5, b: -4.5, c: -3.5, d: -2.5, e: -1.5, f: 1.5, g: 2.5, h: 3.5, i: 4.5, j: 5.5 };
export type Rail = 'tp' | 'tn' | 'bp' | 'bn';
export const RAIL_Z: Record<Rail, number> = { tp: -9.6, tn: -8.6, bp: 8.6, bn: 9.6 };
export const RAIL_ID: Record<Rail, string> = { tp: 'rail_pos', bp: 'rail_pos', tn: 'rail_neg', bn: 'rail_neg' };
export const colX = (c: number) => c - 32;
/** rail holes: 10 groups of 5, columns 3–7, 9–13, … 57–61 */
export const RAIL_COLS: number[] = Array.from({ length: 10 }, (_, g) => [0, 1, 2, 3, 4].map((k) => 3 + 6 * g + k)).flat();

/** What a pointer at board coordinates (x, z) is over, or null. */
function pick(x: number, z: number): string | null {
  const c = Math.round(x + 32);
  if (Math.abs(z) < 0.95) return 'center_trench';
  for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 2 && c <= 62) return RAIL_ID[r];
  if (c < 1 || c > COLS) return null;
  if (z <= -1 && z >= -6) return stripId('u', c);
  if (z >= 1 && z <= 6) return stripId('l', c);
  return null;
}

/* ------------------------------------------------------------- printed top surface */

function paintTop(ppu: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.round(W * ppu);
  c.height = Math.round(D * ppu);
  const g = c.getContext('2d')!;
  const X = (x: number) => (x + W / 2) * ppu;
  const Z = (z: number) => (z + D / 2) * ppu;
  g.fillStyle = '#f5f0e4';
  g.fillRect(0, 0, c.width, c.height);
  // trench
  g.fillStyle = '#d9cfb9';
  g.fillRect(X(-W / 2 + 0.8), Z(-0.7), (W - 1.6) * ppu, 1.4 * ppu);
  g.fillStyle = '#c9bea6';
  g.fillRect(X(-W / 2 + 0.8), Z(-0.12), (W - 1.6) * ppu, 0.24 * ppu);
  // rail stripes
  const stripe = (z: number, color: string) => {
    g.strokeStyle = color;
    g.lineWidth = 0.12 * ppu;
    g.beginPath();
    g.moveTo(X(colX(2)), Z(z));
    g.lineTo(X(colX(62)), Z(z));
    g.stroke();
  };
  stripe(RAIL_Z.tp - 0.6, '#e63946');
  stripe(RAIL_Z.tn + 0.6, '#2b59c3');
  stripe(RAIL_Z.bp - 0.6, '#e63946');
  stripe(RAIL_Z.bn + 0.6, '#2b59c3');
  // holes
  const hole = (x: number, z: number) => {
    const s = 0.44 * ppu;
    g.fillStyle = '#3a3733';
    g.fillRect(X(x) - s / 2, Z(z) - s / 2, s, s);
  };
  for (let col = 1; col <= COLS; col++) for (const r of ROWS) hole(colX(col), ROW_Z[r]);
  for (const r of Object.keys(RAIL_Z) as Rail[]) for (const col of RAIL_COLS) hole(colX(col), RAIL_Z[r]);
  // labels
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${0.62 * ppu}px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif`;
  g.fillStyle = '#6b6352';
  for (const r of ROWS) {
    g.fillText(r, X(colX(1) - 1.2), Z(ROW_Z[r]));
    g.fillText(r, X(colX(COLS) + 1.2), Z(ROW_Z[r]));
  }
  for (let col = 1; col <= COLS; col++) {
    if (col !== 1 && col % 5 !== 0) continue;
    g.fillText(String(col), X(colX(col)), Z(ROW_Z.a - 1.05));
    g.fillText(String(col), X(colX(col)), Z(ROW_Z.j + 1.05));
  }
  g.font = `800 ${0.9 * ppu}px sans-serif`;
  const sign = (z: number, s: string, color: string) => {
    g.fillStyle = color;
    g.fillText(s, X(colX(1)), Z(z));
    g.fillText(s, X(colX(COLS)), Z(z));
  };
  sign(RAIL_Z.tp, '+', '#c62f3b');
  sign(RAIL_Z.tn, '−', '#2b59c3');
  sign(RAIL_Z.bp, '+', '#c62f3b');
  sign(RAIL_Z.bn, '−', '#2b59c3');
  return c;
}

/* ------------------------------------------------------------- parts of the scene */

const HALO: Record<string, string> = { rail_pos: '#ff4d5e', rail_neg: '#4f86ff' };
const AMBER = '#f59e0b';

export function Shell({ xray }: { xray: number }) {
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(paintTop(28));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  const opacity = 1 - 0.88 * xray;
  const transparent = opacity < 0.999;
  return (
    <group>
      <mesh position={[0, 0.0, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={tex} roughness={0.85} transparent={transparent} opacity={Math.max(opacity, 0.16)} depthWrite={!transparent} />
      </mesh>
      <mesh position={[0, -0.51, 0]} renderOrder={1}>
        <boxGeometry args={[W, 0.98, D]} />
        <meshStandardMaterial color="#ece4d2" roughness={0.9} transparent={transparent} opacity={opacity * 0.9} depthWrite={!transparent} />
      </mesh>
    </group>
  );
}

export function Clip({ x, z, w, d, lit, color }: { x: number; z: number; w: number; d: number; lit: boolean; color?: string }) {
  return (
    <mesh position={[x, lit ? -0.2 : -0.32, z]}>
      <boxGeometry args={[w, lit ? 0.34 : 0.22, d]} />
      <meshStandardMaterial
        color={lit ? (color ?? AMBER) : '#cfd4da'}
        metalness={lit ? 0.1 : 0.45}
        roughness={0.4}
        emissive={lit ? (color ?? AMBER) : '#000000'}
        emissiveIntensity={lit ? 0.9 : 0}
      />
    </mesh>
  );
}

export function Clips({ lit }: { lit: string[] }) {
  const strips = [];
  for (let c = 1; c <= COLS; c++) {
    for (const half of ['u', 'l'] as const) {
      const id = stripId(half, c);
      strips.push(<Clip key={id} x={colX(c)} z={half === 'u' ? -3.5 : 3.5} w={0.5} d={4.7} lit={lit.includes(id)} />);
    }
  }
  const len = colX(61) - colX(3) + 0.9;
  return (
    <group>
      {strips}
      {(Object.keys(RAIL_Z) as Rail[]).map((r) => (
        <Clip key={r} x={(colX(3) + colX(61)) / 2} z={RAIL_Z[r]} w={len} d={0.5} lit={lit.includes(RAIL_ID[r])} color={HALO[RAIL_ID[r]]} />
      ))}
    </group>
  );
}

/** A tint on the surface over every lit strip / rail, so a highlight shows at any X-ray value. */
export function SurfaceGlow({ lit }: { lit: string[] }) {
  const quads: { x: number; z: number; w: number; d: number; color: string }[] = [];
  for (const id of lit) {
    const m = /^strip_([ul])_(\d+)$/.exec(id);
    if (id === 'col_strip_a10' || m) {
      const half = m ? m[1] : 'u';
      const c = m ? Number(m[2]) : 10;
      quads.push({ x: colX(c), z: half === 'u' ? -3.5 : 3.5, w: 0.86, d: 5.0, color: AMBER });
    }
    if (id === 'rail_pos' || id === 'rail_neg')
      for (const r of Object.keys(RAIL_Z) as Rail[])
        if (RAIL_ID[r] === id) quads.push({ x: (colX(3) + colX(61)) / 2, z: RAIL_Z[r], w: colX(61) - colX(3) + 1.2, d: 0.86, color: HALO[id] });
  }
  return (
    <>
      {quads.map((q, i) => (
        <mesh key={i} position={[q.x, 0.03, q.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
          <planeGeometry args={[q.w, q.d]} />
          <meshBasicMaterial color={q.color} transparent opacity={0.42} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

export function TrenchGlow({ on }: { on: boolean }) {
  if (!on) return null;
  return (
    <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
      <planeGeometry args={[W - 1.6, 1.4]} />
      <meshBasicMaterial color={AMBER} transparent opacity={0.55} depthWrite={false} />
    </mesh>
  );
}

/** A lead as a tube through the given points. */
export function Lead({ pts }: { pts: [number, number, number][] }) {
  const geo = useMemo(() => {
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < pts.length - 1; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(...pts[i]), new THREE.Vector3(...pts[i + 1])));
    return new THREE.TubeGeometry(path, 24 * (pts.length - 1), 0.07, 6, false);
  }, [pts]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#b9bec4" metalness={0.8} roughness={0.3} />
    </mesh>
  );
}

const BANDS = ['#7a4a1f', '#151515', '#f07a1a', '#d4a72c'];

/** Position of band i along a body of length `len` (the tolerance band sits apart). */
const bandX = (len: number, i: number) => -len / 2 + 0.42 + i * 0.36 + (i === 3 ? 0.36 : 0);

/** 10 kΩ resistor from hole p1 to hole p2 (board coordinates x, z). */
export function Resistor({
  p1,
  p2,
  lit,
  label,
  tone,
  onHover,
  bands = BANDS,
  callouts,
}: {
  p1: [number, number];
  p2: [number, number];
  lit: boolean;
  label: string;
  tone: 'bad' | 'good';
  onHover: (on: boolean) => void;
  /** band colours (hex), left to right */
  bands?: string[];
  /** what each band means, shown above the body with a leader line (close-up only) */
  callouts?: string[];
}) {
  const [x1, z1] = p1;
  const [x2, z2] = p2;
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ang = Math.atan2(-(z2 - z1), x2 - x1);
  const h = 1.25;
  const bodyLen = Math.min(2.4, len - 0.6);
  const ux = (x2 - x1) / len;
  const uz = (z2 - z1) / len;
  const e1: [number, number, number] = [mx - (ux * bodyLen) / 2, h, mz - (uz * bodyLen) / 2];
  const e2: [number, number, number] = [mx + (ux * bodyLen) / 2, h, mz + (uz * bodyLen) / 2];
  const enter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(true);
  };
  return (
    <group>
      <Lead pts={[[x1, -0.3, z1], [x1, h, z1], e1]} />
      <Lead pts={[[x2, -0.3, z2], [x2, h, z2], e2]} />
      <group position={[mx, h, mz]} rotation={[0, ang, 0]} onPointerOver={enter} onPointerOut={() => onHover(false)}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.36, bodyLen - 0.72, 6, 16]} />
          <meshStandardMaterial color="#e6cc9a" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
        </mesh>
        {bands.map((c, i) => (
          <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[bandX(bodyLen, i), 0, 0]}>
            <cylinderGeometry args={[0.375, 0.375, 0.16, 18]} />
            <meshStandardMaterial color={c} roughness={0.5} metalness={i === 3 ? 0.5 : 0} />
          </mesh>
        ))}
        {callouts?.map((t, i) => {
          const lx = (i - 1.5) * 2.3;
          return (
            <group key={i}>
              <Line
                points={[
                  [bandX(bodyLen, i), 0.42, 0],
                  [lx, 1.35 + (i % 2) * 0.7, 0],
                ]}
                color="#1f2a44"
                lineWidth={1.2}
              />
              <Html position={[lx, 1.6 + (i % 2) * 0.7, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
                <div className="bb3d-band">
                  <i style={{ background: bands[i] }} />
                  {t}
                </div>
              </Html>
            </group>
          );
        })}
      </group>
      <Html position={[mx, h + (callouts ? 3.3 : 1.1), mz]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag ${tone}`}>{label}</div>
      </Html>
    </group>
  );
}

export function Chip({ c0 }: { c0: number }) {
  const x = colX(c0) + 1.5;
  return (
    <group>
      <mesh position={[x, 0.55, 0]}>
        <boxGeometry args={[4.4, 0.7, 2.4]} />
        <meshStandardMaterial color="#26282c" roughness={0.55} />
      </mesh>
      <mesh position={[colX(c0) - 0.35, 0.91, -0.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 16]} />
        <meshStandardMaterial color="#55585e" />
      </mesh>
      {[0, 1, 2, 3].flatMap((k) =>
        [-1, 1].map((s) => (
          <mesh key={`${k}${s}`} position={[colX(c0 + k), 0.12, s * 1.45]}>
            <boxGeometry args={[0.22, 0.9, 0.12]} />
            <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
          </mesh>
        )),
      )}
      <Html position={[x, 1.6, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className="bb3d-tag chip">LM358 骑跨凹槽</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- camera */

const WRONG: [[number, number], [number, number]] = [
  [colX(10), ROW_Z.a],
  [colX(10), ROW_Z.e],
];
const RIGHT: [[number, number], [number, number]] = [
  [colX(18), ROW_Z.c],
  [colX(23), ROW_Z.c],
];

export const PRESETS: Record<NonNullable<StageSync['camera']>, { pos: [number, number, number]; target: [number, number, number] }> = {
  overview: { pos: [0, 40, 26], target: [0, -0.5, 0.5] },
  focus: { pos: [colX(16), 26, 15], target: [colX(16), 0, 0.3] },
  resistor: { pos: [colX(20.5) + 2, 8.5, ROW_Z.c + 9], target: [colX(20.5), 0.8, ROW_Z.c] },
  trench: { pos: [colX(12), 15, 15], target: [colX(12), 0, -1.5] },
};

/** width (board units) each preset must show across the canvas */
export const FRAME_W: Record<NonNullable<StageSync['camera']>, number> = { overview: 68, focus: 31, resistor: 14, trench: 22 };

export function CameraRig({ preset }: { preset: NonNullable<StageSync['camera']> }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const anim = useRef<{ t: number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3 } | null>(null);
  useEffect(() => {
    if (!controls) return;
    const p = PRESETS[preset];
    const toT = new THREE.Vector3(...p.target);
    // keep the preset's direction; move back far enough that the framed width fits the canvas
    const off = new THREE.Vector3(...p.pos).sub(toT);
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
    const need = (FRAME_W[preset] / 2 / Math.tan(hfov / 2)) * 1.04;
    off.setLength(Math.max(off.length(), need));
    const toP = toT.clone().add(off);
    if (prefersReducedMotion()) {
      camera.position.copy(toP);
      controls.target.copy(toT);
      controls.update();
      invalidate();
      return;
    }
    anim.current = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toP, toT };
    invalidate();
  }, [preset, controls, camera, invalidate, aspect]);
  useFrame((_, dt) => {
    const a = anim.current;
    if (!a || !controls) return;
    a.t = Math.min(1, a.t + dt / 0.9);
    const k = 1 - Math.pow(1 - a.t, 3);
    camera.position.lerpVectors(a.fromP, a.toP, k);
    controls.target.lerpVectors(a.fromT, a.toT, k);
    controls.update();
    if (a.t >= 1) anim.current = null;
    else invalidate();
  });
  return null;
}

/* ------------------------------------------------------------- the layer */

function Scene() {
  const xray = useStage((s) => s.xray);
  const camera = useStage((s) => s.camera);
  const setHover = useStage((s) => s.setHover);
  const bands = useStage((s) => s.bands);
  const lit = useLit();
  const closeUp = camera === 'resistor';
  const last = useRef<string | null>(null);
  const move = (e: ThreeEvent<PointerEvent>) => {
    const id = pick(e.point.x, e.point.z);
    if (id !== last.current) {
      last.current = id;
      setHover(id ? [id] : null);
    }
  };
  const leave = () => {
    last.current = null;
    setHover(null);
  };
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Clips lit={lit} />
      <Shell xray={xray} />
      <TrenchGlow on={lit.includes('center_trench')} />
      <SurfaceGlow lit={lit} />
      {/* an invisible plane over the board picks the hole under the pointer at any X-ray value */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <Resistor p1={WRONG[0]} p2={WRONG[1]} lit={false} tone="bad" label="✕ a10–e10 同列：被短路" onHover={(on) => setHover(on ? ['col_strip_a10'] : null)} />
      <Resistor
        p1={RIGHT[0]}
        p2={RIGHT[1]}
        lit={lit.includes('resistor_10k')}
        tone="good"
        label={`✓ c18–c23 跨列：${formatOhms(bandValue(bands).ohms)}`}
        onHover={(on) => setHover(on ? ['resistor_10k'] : null)}
        bands={bands.map((k) => COLOR_BY_KEY.get(k)!.hex)}
        callouts={closeUp ? bandMeanings(bands).map((t) => t.replace(' = ', ' ')) : undefined}
      />
      <Chip c0={40} />
      <OrbitControls makeDefault enableDamping={false} minDistance={6} maxDistance={90} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig preset={camera} />
    </>
  );
}

export default function BreadboardXray() {
  return (
    <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: PRESETS.overview.pos, fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
      <Scene />
    </Canvas>
  );
}
