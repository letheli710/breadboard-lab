// Layer "03 3D 面包板信号源方波激励 RLC 实操": the series RLC of act 2 on an 830-hole board, driven by
// a 函数信号发生器 (0 … 5 V square wave, 200 Hz, 50 Ω output) through a BNC-to-alligator lead, and
// watched by a 双通道示波器 standing behind the board (both built here, in the bench style of
// W3-L8's supply box). The shared capacitor / inductor parts come from Passives3D.
//
// Layout (column numbers; upper half rows a–e; the top inner rail, blue −, is the one GND rail):
// - N1 = column 10: generator red clip in a10, potentiometer end A in c10, CH1 probe tip in e10
// - 500 Ω trimmer potentiometer across c10 / c11 / c12 (end A, wiper, end B unused): R_pot
// - N2 = column 11 → yellow jumper e11 → e16 → inductor 10 mH between c16 and c17
// - N3 = column 17 = v_C: inductor c17, 1 µF film capacitor a17 → GND rail (its other lead straight
//   into the rail, as the sheet asks), CH2 probe tip in e17
// - GND rail: generator black clip (column 4), CH1 ground clip (6), CH2 ground clip (21)
// The loop resistance is R = 50 Ω (generator) + 4 Ω (inductor DCR) + R_pot; the knob turns R_pot.
// The CH2 ground clip can be moved onto N1 / N2 / N3: the scope's earth would short that node
// through the mains protective earth, so the bench cuts the excitation and shows a red interlock.
// Camera: the whole bench, the circuit close-up, the scope screen.

import { Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, D, RAIL_Z, ROW_Z, Shell, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { BENCH_NAMES, Capacitor, Inductor } from '../../Passives3D';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { Cell, hoverProps, RSlider, Seg, useClearHoverOnUnmount, useIsLit, useLab, type Lab, type TimeBase } from './state';
import { bench, DAMPING_LABEL, fmtPct, fmtV, POT_MAX, R_BENCH_MIN, R_DCR, R_GEN, type Bench, type ClipNode } from './model';

type V3 = [number, number, number];
type Cam = 'bench' | 'board' | 'scope';

const AMBER = '#f59e0b';
const GEN_NAME = `${BENCH_NAMES.generator}（0–5 V 方波 · 200 Hz）`;

/* ------------------------------------------------------------- holes and picking */

/** "a10", "G4" (a hole of the GND rail = top inner rail) */
function hole(h: string): [number, number] {
  if (h[0] === 'G') return [colX(Number(h.slice(1))), RAIL_Z.tn];
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

const NODE_COLS: Record<string, number[]> = { node_n1: [10], node_n2: [11, 16], node_n3: [17] };

function pick(x: number, z: number): string[] | null {
  const c = Math.round(x + 32);
  for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 2 && c <= 62) return r === 'tn' ? ['rail_gnd'] : null;
  if (c < 1 || c > 63) return null;
  if (z <= -1 && z >= -6) {
    for (const [id, cols] of Object.entries(NODE_COLS)) if (cols.includes(c)) return [id];
    return [stripId('u', c)];
  }
  if (z >= 1 && z <= 6) return [stripId('l', c)];
  return null;
}

/** strip columns (upper half) and rails to tint for the lit ids */
function Glow({ lit }: { lit: string[] }) {
  const quads: { x: number; z: number; w: number; d: number; color: string }[] = [];
  const col = (c: number, color = AMBER) => quads.push({ x: colX(c), z: -3.5, w: 0.86, d: 5.0, color });
  for (const id of lit) {
    if (NODE_COLS[id]) NODE_COLS[id].forEach((c) => col(c));
    const m = /^strip_([ul])_(\d+)$/.exec(id);
    if (m) quads.push({ x: colX(Number(m[2])), z: m[1] === 'u' ? -3.5 : 3.5, w: 0.86, d: 5.0, color: AMBER });
    if (id === 'rail_gnd') quads.push({ x: (colX(3) + colX(61)) / 2, z: RAIL_Z.tn, w: colX(61) - colX(3) + 1.2, d: 0.86, color: '#4f86ff' });
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

/* ------------------------------------------------------------- wires */

function Tube({ pts, color, r = 0.11, lit = false }: { pts: V3[]; color: string; r?: number; lit?: boolean }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      pts.map((p) => new THREE.Vector3(...p)),
      false,
      'centripetal',
    );
    return new THREE.TubeGeometry(curve, 72, r, 8, false);
  }, [pts, r]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.5} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.7 : 0} />
    </mesh>
  );
}

const hover3d = (ids: string[]) => ({
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    useStage.getState().setHover(ids);
  },
  onPointerOut: () => useStage.getState().setHover(null),
});

function Jumper({ from, to, color, lit, ids }: { from: string; to: string; color: string; lit?: boolean; ids?: string[] }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(from);
    const [x2, z2] = hole(to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const h = Math.min(2.6, Math.max(0.8, 0.35 + 0.2 * dist));
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.4, z1], at(0.2, h * 0.92), at(0.5, h), at(0.8, h * 0.92), [x2, 0.4, z2], [x2, -0.3, z2]];
  }, [from, to]);
  return (
    <group {...(ids ? hover3d(ids) : {})}>
      <Tube pts={pts} color={color} r={0.13} lit={lit} />
    </group>
  );
}

/** a short stub wire standing in a hole, for an alligator clip to bite on */
function Stub({ at, color, h = 1.3 }: { at: string; color: string; h?: number }) {
  const [x, z] = hole(at);
  return (
    <mesh position={[x, h / 2 - 0.3, z]}>
      <cylinderGeometry args={[0.1, 0.1, h + 0.6, 8]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
}

/** an alligator clip (a small jaw) at a point */
function Clip({ at, color, lit, bad }: { at: V3; color: string; lit?: boolean; bad?: boolean }) {
  return (
    <group position={at}>
      <mesh rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.5, 1.1, 0.42]} />
        <meshStandardMaterial color={bad ? '#e11d48' : color} roughness={0.45} emissive={bad ? '#e11d48' : lit ? AMBER : '#000000'} emissiveIntensity={bad ? 0.8 : lit ? 0.6 : 0} />
      </mesh>
      <mesh position={[0.32, -0.55, 0]}>
        <boxGeometry args={[0.18, 0.3, 0.3]} />
        <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------- the potentiometer */

const POT = { x: colX(11), z: ROW_Z.c, w: 3.4, d: 2.6, h: 2.0 };

function Potentiometer({ rPot, lit }: { rPot: number; lit: boolean }) {
  const ang = (-0.75 + 1.5 * (rPot / POT_MAX)) * Math.PI;
  return (
    <group name="mesh_potentiometer" {...hover3d(['bb_pot'])}>
      {[10, 11, 12].map((c) => (
        <mesh key={c} position={[colX(c), 0, ROW_Z.c]}>
          <cylinderGeometry args={[0.07, 0.07, 0.8, 8]} />
          <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[POT.x, 0.25 + POT.h / 2, POT.z]}>
        <boxGeometry args={[POT.w, POT.h, POT.d]} />
        <meshStandardMaterial color="#2f63c8" roughness={0.45} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
      </mesh>
      <group position={[POT.x, 0.25 + POT.h + 0.25, POT.z]} rotation={[0, ang, 0]}>
        <mesh>
          <cylinderGeometry args={[0.95, 0.95, 0.5, 28]} />
          <meshStandardMaterial color="#f4f4f2" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.27, 0]}>
          <boxGeometry args={[1.5, 0.08, 0.22]} />
          <meshStandardMaterial color="#3b4250" />
        </mesh>
        <mesh position={[0.62, 0.3, 0]}>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- function generator */

const GEN = { x: -43, z: -2, w: 11, h: 4.6, d: 8 };
const GEN_FRONT = GEN.z + GEN.d / 2;
const BNC_OUT: V3 = [GEN.x + 3.6, 0.4, GEN_FRONT + 0.4];

function Generator({ b, lit }: { b: Bench; lit: boolean }) {
  const red = useMemo<V3[]>(() => {
    const [x, z] = hole('a10');
    return [BNC_OUT, [BNC_OUT[0] + 2, 1.6, BNC_OUT[2] + 1.5], [-31, 2.6, 0.5], [x - 1.2, 2.4, z + 0.4], [x, 2.0, z]];
  }, []);
  const black = useMemo<V3[]>(() => {
    const [x, z] = hole('G4');
    return [BNC_OUT, [BNC_OUT[0] + 1.6, 1.2, BNC_OUT[2] + 1.2], [-33, 1.8, -4], [x - 0.6, 2.0, z + 0.3], [x, 1.7, z]];
  }, []);
  const out = !b.fault;
  return (
    <group name="mesh_function_generator">
      <group {...hover3d(['bb_gen'])}>
        <mesh position={[GEN.x, GEN.h / 2 - 1, GEN.z]}>
          <boxGeometry args={[GEN.w, GEN.h, GEN.d]} />
          <meshStandardMaterial color="#d9dde3" roughness={0.55} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.3 : 0} />
        </mesh>
        <mesh position={[GEN.x, GEN.h / 2 - 1, GEN_FRONT + 0.01]}>
          <planeGeometry args={[GEN.w - 0.6, GEN.h - 0.5]} />
          <meshStandardMaterial color="#3b4250" roughness={0.7} />
        </mesh>
        {[-3.6, -1.6].map((dx) => (
          <mesh key={dx} position={[GEN.x + dx, 0.2, GEN_FRONT + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.5, 20]} />
            <meshStandardMaterial color="#9aa1ab" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {/* OUTPUT BNC */}
        <mesh position={[BNC_OUT[0], BNC_OUT[1], GEN_FRONT + 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.5, 16]} />
          <meshStandardMaterial color="#c8ccd2" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[BNC_OUT[0], BNC_OUT[1] + 1.05, GEN_FRONT + 0.06]}>
          <planeGeometry args={[1.3, 0.5]} />
          <meshBasicMaterial color={out ? '#22c55e' : '#e11d48'} />
        </mesh>
      </group>
      <Tube pts={red} color="#d62f2f" r={0.14} lit={lit} />
      <Tube pts={black} color="#24262b" r={0.14} lit={lit} />
      <Stub at="a10" color="#d62f2f" />
      <Stub at="G4" color="#24262b" />
      <Clip at={[colX(10) + 0.15, 1.5, ROW_Z.a]} color="#d62f2f" lit={lit} />
      <Clip at={[colX(4) + 0.15, 1.5, RAIL_Z.tn]} color="#24262b" lit={lit} />
      <Html position={[GEN.x - 1.2, GEN.h - 1.6, GEN_FRONT + 0.05]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`w48-gen-lcd ${out ? '' : 'off'}`}>
          <b>SQUARE 200 Hz</b>
          <span>0 … 5.00 V · 50 Ω</span>
          <span>{out ? 'OUTPUT ON' : 'OUTPUT OFF · 安全拦截'}</span>
        </div>
      </Html>
      <Html position={[GEN.x, GEN.h + 0.8, GEN.z - GEN.d / 2]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w48-tag3 gen ${lit ? 'lit' : ''}`}>{BENCH_NAMES.generator}</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- oscilloscope */

const SCOPE = { x: -12, z: -20, w: 24, h: 13.5, d: 7 };
const S_FRONT = SCOPE.z + SCOPE.d / 2;
const SCREEN = { x: SCOPE.x - 3.2, y: 6.3, w: 14.5, h: 9.2 };
const JACK: Record<'ch1' | 'ch2', V3> = { ch1: [SCOPE.x + 6.6, 0.6, S_FRONT + 0.3], ch2: [SCOPE.x + 9.2, 0.6, S_FRONT + 0.3] };

function ScopeScreen({ b, tb }: { b: Bench; tb: TimeBase }) {
  const div = tb === 'period' ? 0.5e-3 : 0.25e-3;
  const t0 = -div;
  const sx = (t: number) => SCREEN.x - SCREEN.w / 2 + ((t - t0) / (10 * div)) * SCREEN.w;
  // 2 V/div, 8 divisions, 0 V two divisions above the bottom
  const sy = (v: number) => SCREEN.y - SCREEN.h / 2 + ((v + 4) / 16) * SCREEN.h;
  const z = S_FRONT + 0.04;
  const trace = (f: (t: number) => number): V3[] =>
    Array.from({ length: 241 }, (_, k) => {
      const t = t0 + (k / 240) * 10 * div;
      const v = Math.max(-4, Math.min(12, f(t)));
      return [sx(t), sy(v), z + 0.01] as V3;
    });
  const ch1 = trace(b.ch1);
  const ch2 = trace(b.ch2);
  const grid: V3[][] = [];
  for (let k = 0; k <= 10; k++) {
    const x = SCREEN.x - SCREEN.w / 2 + (k * SCREEN.w) / 10;
    grid.push([
      [x, SCREEN.y - SCREEN.h / 2, z],
      [x, SCREEN.y + SCREEN.h / 2, z],
    ]);
  }
  for (let k = 0; k <= 8; k++) {
    const y = SCREEN.y - SCREEN.h / 2 + (k * SCREEN.h) / 8;
    grid.push([
      [SCREEN.x - SCREEN.w / 2, y, z],
      [SCREEN.x + SCREEN.w / 2, y, z],
    ]);
  }
  return (
    <group>
      <mesh position={[SCREEN.x, SCREEN.y, S_FRONT + 0.02]}>
        <planeGeometry args={[SCREEN.w + 0.4, SCREEN.h + 0.4]} />
        <meshBasicMaterial color="#0b1a14" />
      </mesh>
      {grid.map((g, i) => (
        <Line key={i} points={g} color={i === 2 + 11 ? '#5f7f70' : '#264136'} lineWidth={i === 13 ? 1.2 : 0.8} />
      ))}
      <Line points={ch1} color="#facc15" lineWidth={2.2} />
      <Line points={ch2} color="#38bdf8" lineWidth={2.6} />
    </group>
  );
}

function Oscilloscope({ b, tb, lit }: { b: Bench; tb: TimeBase; lit: boolean }) {
  const w = b.wave;
  const mp = (w.peak.v - 5) / 5;
  return (
    <group name="mesh_oscilloscope">
      <group {...hover3d(['bb_scope'])}>
        <mesh position={[SCOPE.x, SCOPE.h / 2 - 1, SCOPE.z]}>
          <boxGeometry args={[SCOPE.w, SCOPE.h, SCOPE.d]} />
          <meshStandardMaterial color="#cfd5dd" roughness={0.55} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.25 : 0} />
        </mesh>
        <mesh position={[SCOPE.x, SCOPE.h / 2 - 1, S_FRONT + 0.01]}>
          <planeGeometry args={[SCOPE.w - 0.6, SCOPE.h - 0.6]} />
          <meshStandardMaterial color="#3b4250" roughness={0.7} />
        </mesh>
        {[
          [SCOPE.x + 6.6, 9.4],
          [SCOPE.x + 9.2, 9.4],
          [SCOPE.x + 6.6, 6.2],
          [SCOPE.x + 9.2, 6.2],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, S_FRONT + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.5, 20]} />
            <meshStandardMaterial color="#9aa1ab" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {(['ch1', 'ch2'] as const).map((k) => (
          <mesh key={k} position={JACK[k]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.6, 16]} />
            <meshStandardMaterial color={k === 'ch1' ? '#eab308' : '#0ea5e9'} metalness={0.5} roughness={0.3} />
          </mesh>
        ))}
        <ScopeScreen b={b} tb={tb} />
      </group>
      <Html position={[SCREEN.x, SCREEN.y + SCREEN.h / 2 - 0.5, S_FRONT + 0.1]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w48-scope-osd">
          <span className="c1 div">CH1 2 V/div</span>
          <span className="c2 div">CH2 2 V/div</span>
          <span className="div">{tb === 'period' ? '0.5' : '0.25'} ms/div</span>
          {!b.fault && <span className="c2">{mp > 5e-4 ? `Max ${fmtV(w.peak.v)} · +${fmtPct(mp)}` : `Max ${fmtV(w.peak.v)}`}</span>}
        </div>
      </Html>
      <Html position={[SCOPE.x, SCOPE.h + 0.6, SCOPE.z - SCOPE.d / 2]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w48-tag3 scope ${lit ? 'lit' : ''}`}>{BENCH_NAMES.scope}</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- probes */

const CLIP_AT: Record<ClipNode, V3> = {
  gnd: [colX(21) + 0.15, 1.5, RAIL_Z.tn],
  n1: [colX(10) - 0.5, 2.1, ROW_Z.a + 0.2],
  n2: [colX(13.5), 1.9, ROW_Z.e],
  n3: [colX(17) + 0.45, 1.0, ROW_Z.a - 0.6],
};

function Probe({ ch, tipHole, clip, lit, clipLit, bad }: { ch: 'ch1' | 'ch2'; tipHole: string; clip: V3; lit: boolean; clipLit: boolean; bad: boolean }) {
  const [x, z] = hole(tipHole);
  const color = ch === 'ch1' ? '#eab308' : '#0ea5e9';
  const cable = useMemo<V3[]>(() => {
    const j = JACK[ch];
    return [
      [x, 3.4, z],
      [x, 6.2, z - 1.2],
      [(x + j[0]) / 2, 6.5, (z + j[2]) / 2],
      [j[0], 2.6, j[2] + 2.6],
      [j[0], j[1], j[2] + 0.4],
    ];
  }, [ch, x, z]);
  const gnd = useMemo<V3[]>(
    () => [
      [x, 2.0, z + 0.2],
      [(x + clip[0]) / 2, Math.max(clip[1], 1.2) + 1.4, (z + clip[2]) / 2],
      [clip[0], clip[1] + 0.6, clip[2]],
    ],
    [x, z, clip],
  );
  return (
    <group>
      <group {...hover3d([`${ch}_probe`])}>
        <mesh position={[x, 0.6, z]}>
          <cylinderGeometry args={[0.05, 0.03, 1.6, 8]} />
          <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[x, 2.3, z]}>
          <cylinderGeometry args={[0.3, 0.24, 2.4, 14]} />
          <meshStandardMaterial color="#2a2d33" roughness={0.45} emissive={lit ? color : '#000000'} emissiveIntensity={lit ? 0.7 : 0} />
        </mesh>
        <mesh position={[x, 3.2, z]}>
          <cylinderGeometry args={[0.34, 0.34, 0.3, 14]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <Tube pts={cable} color="#2a2d33" r={0.12} lit={lit} />
      </group>
      <group {...hover3d([`${ch}_clip`])}>
        <Tube pts={gnd} color="#24262b" r={0.06} lit={clipLit} />
        <Clip at={clip} color="#24262b" lit={clipLit} bad={bad} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- camera */

const FRAMES: Record<Cam, { x: [number, number]; y: [number, number]; z: [number, number]; dir: [number, number, number] }> = {
  bench: { x: [-49, -1], y: [-1, 12.5], z: [-24, 4], dir: [0, 1.3, 1] },
  board: { x: [-30, -9], y: [-1, 3.5], z: [-10, -0.5], dir: [0, 1.7, 1] },
  scope: { x: [-24.5, 0.5], y: [0, 12.8], z: [-17, -16.5], dir: [0, 0.42, 1] },
};

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: (typeof FRAMES)[Cam]): [THREE.Vector3, THREE.Vector3] {
  const dir = new THREE.Vector3(...f.dir).normalize();
  const target = new THREE.Vector3((f.x[0] + f.x[1]) / 2, (f.y[0] + f.y[1]) / 2, (f.z[0] + f.z[1]) / 2);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of f.x) for (const y of f.y) for (const z of f.z) corners.push(new THREE.Vector3(x, y, z));
  const v = new THREE.Vector3();
  let d = 8;
  for (; d < 300; d *= 1.04) {
    cam.position.copy(target).addScaledVector(dir, d);
    cam.lookAt(target);
    cam.updateMatrixWorld();
    if (corners.every((p) => (v.copy(p).project(cam), Math.abs(v.x) < 0.95 && Math.abs(v.y) < 0.9))) break;
  }
  return [target.clone().addScaledVector(dir, d), target];
}

function CameraRig({ frame, nonce }: { frame: Cam; nonce: number }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const anim = useRef<{ t: number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3 } | null>(null);
  useEffect(() => {
    if (!controls) return;
    const [toP, toT] = fitView(camera, aspect, FRAMES[frame]);
    if (prefersReducedMotion()) {
      camera.position.copy(toP);
      controls.target.copy(toT);
      controls.update();
      invalidate();
      return;
    }
    anim.current = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toP, toT };
    invalidate();
  }, [frame, nonce, controls, camera, invalidate, aspect]);
  useFrame((_, dt) => {
    const a = anim.current;
    if (!a || !controls || a.t >= 1) return;
    a.t = Math.min(1, a.t + dt / 0.9);
    const k = 1 - Math.pow(1 - a.t, 3);
    camera.position.lerpVectors(a.fromP, a.toP, k);
    controls.target.lerpVectors(a.fromT, a.toT, k);
    controls.update();
    invalidate();
  });
  return null;
}

/* ------------------------------------------------------------- the scene */

function Scene({ lab, b, frame, nonce }: { lab: Lab; b: Bench; frame: Cam; nonce: number }) {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const is = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const last = useRef<string | null>(null);
  const move = (e: ThreeEvent<PointerEvent>) => {
    const ids = pick(e.point.x, e.point.z);
    const key = ids?.join(',') ?? null;
    if (key !== last.current) {
      last.current = key;
      setHover(ids);
    }
  };
  const leave = () => {
    last.current = null;
    setHover(null);
  };
  const close = frame === 'board';
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Shell xray={0} />
      <Glow lit={lit} />
      <Html position={[colX(26), 0.3, RAIL_Z.tn]} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`w48-rtag ${is('rail_gnd') ? 'lit' : ''}`}>GND 轨</div>
      </Html>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <Generator b={b} lit={is('bb_gen')} />
      <Potentiometer rPot={b.rPot} lit={is('bb_pot')} />
      <Jumper from="e11" to="e16" color="#eab308" lit={is('bb_jumper', 'node_n2')} ids={['bb_jumper']} />
      <Inductor p1={[colX(16), ROW_Z.c]} p2={[colX(17), ROW_Z.c]} id="bb_l" label={close ? '10 mH 电感' : ''} />
      <Capacitor p1={[colX(17), ROW_Z.a]} p2={[colX(17), RAIL_Z.tn]} kind="film" id="bb_c" label={close ? '1 µF 薄膜（无极性）' : ''} />
      {close && (
        <Html position={[POT.x, 3.6, POT.z]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`bb3d-tag w48-tag3 ${is('bb_pot') ? 'lit' : ''}`}>电位器 {Math.round(b.rPot)} Ω</div>
        </Html>
      )}
      <Stub at="G6" color="#24262b" />
      {lab.clip === 'gnd' && <Stub at="G21" color="#24262b" />}
      <Probe ch="ch1" tipHole="e10" clip={[colX(6) + 0.15, 1.5, RAIL_Z.tn]} lit={is('ch1_probe', 'node_n1')} clipLit={is('ch1_clip', 'rail_gnd')} bad={false} />
      <Probe ch="ch2" tipHole="e17" clip={CLIP_AT[lab.clip]} lit={is('ch2_probe', 'node_n3')} clipLit={is('ch2_clip')} bad={b.fault} />
      <Oscilloscope b={b} tb={lab.tb} lit={is('bb_scope')} />
      <OrbitControls makeDefault enableDamping={false} minDistance={6} maxDistance={140} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig frame={frame} nonce={nonce} />
    </>
  );
}

/* ------------------------------------------------------------- HUD and layer */

const CLIP_TEXT: Record<Exclude<ClipNode, 'gnd'>, string> = {
  n1: '信号源输出节点 N1（R 上端）：信号源输出经示波器地与市电保护地被直接短路，可能烧毁信号源输出级',
  n2: 'R–L 公共节点 N2：这一点被拉到地，电感 L 与电容 C 被短接出回路，波形全错',
  n3: 'L–C 公共节点 N3（电容上端）：电容 C 被示波器地直接短路，CH2 读到的永远是 0 V',
};

export default function Bench3D() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const on = useIsLit();
  const [frame, setFrame] = useStageParam<Cam>('cam', 'bench');
  const [nonce, setNonce] = useStageParam('camNonce', 0);
  const b = useMemo(() => bench(lab.r, lab.clip), [lab.r, lab.clip]);
  const kind = b.wave.rise.v.kind;
  const mp = (b.wave.peak.v - 5) / 5;
  return (
    <div className="w48-layer">
      <div className="w48-dock wide">
        <RSlider lab={lab} min={R_BENCH_MIN} label="R 总" ids={['bb_pot', 'bench_r']} />
        <Seg<ClipNode>
          label="CH2 地夹"
          value={lab.clip}
          onChange={(c) => lab.set({ clip2: c })}
          options={[
            { value: 'gnd', label: 'CH2 地夹 → GND 轨', short: 'GND', hover: ['ch2_clip', 'rail_gnd'] },
            { value: 'n1', label: '→ R 上端', short: 'N1', hover: ['ch2_clip', 'node_n1'] },
            { value: 'n2', label: '→ R–L 之间', short: 'N2', hover: ['ch2_clip', 'node_n2'] },
            { value: 'n3', label: '→ L–C 之间', short: 'N3', hover: ['ch2_clip', 'node_n3'] },
          ]}
        />
      </div>
      <div className="bb3d-wrap w48-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-24, 44, 30], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <Scene lab={lab} b={b} frame={frame} nonce={nonce} />
        </Canvas>
        <div className="w48-camsel">
          <Seg<Cam>
            label="镜头"
            value={frame}
            onChange={setFrame}
            options={[
              { value: 'bench', label: '全景', short: '全景' },
              { value: 'board', label: '电路特写', short: '电路' },
              { value: 'scope', label: '示波器屏幕', short: '屏幕' },
            ]}
          />
          <button className="w48-fold" onClick={() => setNonce(nonce + 1)} title="复位镜头">
            复位
          </button>
        </div>
        {b.fault && lab.clip !== 'gnd' && (
          <div className="w48-alarm" role="alert" {...hoverProps(['ch2_clip'])}>
            <b>安全拦截：激励已切断</b>
            <span>CH2 地夹夹在了{CLIP_TEXT[lab.clip]}。示波器两通道的 BNC 外壳与信号源外壳都连着市电保护地 PE——地夹只能夹 GND 轨。</span>
            <button className="w48-fold" onClick={() => lab.set({ clip2: 'gnd' })}>
              地夹改回 GND 轨
            </button>
          </div>
        )}
        {b.clamped && !b.fault && (
          <p className="w48-clamp">
            面包板上回路总电阻最小 {R_BENCH_MIN} Ω（信号源内阻 50 Ω + 电感 DCR 4 Ω），已按 {R_BENCH_MIN} Ω 实测
          </p>
        )}
      </div>
      <div className="w48-cells">
        <Cell id="bench_r" name="回路总电阻" tone="minor" value={`${Math.round(b.rTotal)} Ω`} hint={`${R_GEN} + ${R_DCR} + 电位器 ${Math.round(b.rPot)} Ω`} />
        <Cell id="sc_case" name="阻尼状态" value={DAMPING_LABEL[kind]} tone={kind === 'under' ? 'bad' : kind === 'critical' ? 'good' : 'warn'} />
        <Cell id="ch2_probe" name="CH2 峰值" value={b.fault ? '— 已切断' : fmtV(b.wave.peak.v)} tone={b.fault ? 'bad' : ''} />
        <Cell id="sc_peak" name="超调" value={b.fault ? '—' : mp > 5e-4 ? `+${fmtPct(mp)}` : '无过冲'} tone={!b.fault && mp > 5e-4 ? 'bad' : 'good'} />
        <Cell id="bb_l" name="峰值电流" value={b.fault ? '—' : `${(b.iPeak * 1000).toFixed(1)} mA`} tone="minor" hint="电感额定 ≥ 150 mA" />
        <Cell id="safety_note" name="电阻平均功耗" value={`${(b.pAvg.total * 1000).toFixed(1)} mW`} tone="minor" hint="每个边沿耗 ½CV²，与 R 无关" />
      </div>
      <p className={`w48-notice w48-bench-notice ${on('safety_note')}`} {...hoverProps(['safety_note'])} role="note">
        <span className="full">激励：{GEN_NAME}，无需直流电源 · L、C 按原值搭建、无需缩放 · v_C 峰值约 +7.0 V、下降沿约 −2.0 V（必须用无极性电容）· 峰值电流约 34 mA</span>
        <span className="short">函数信号发生器 0–5 V · 原值搭建 · 无极性电容（+7 V / −2 V）</span>
      </p>
    </div>
  );
}
