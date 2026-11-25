// Layer "03 3D 面包板串联 RLC + 信号发生器扫频找谐振峰实操": the series RLC of act 5 (R = 100 Ω
// 1/4 W, L = 10 mH drum inductor, C = 100 nF / 50 V film capacitor) on an 830-hole board, driven by
// a 函数信号发生器 (sine, 1–15 kHz, 0.2–2.0 Vpp) through a BNC-to-alligator lead and watched by a
// 双通道示波器 behind the board (generator, scope, probes and camera rig adapted from W4-L8's bench).
// The CH2 target decides the order of the parts, so that the part CH2 reads always sits at the
// bottom, on GND (the ground clips can only go on the GND rail):
// - v_C: 信号源 → R → L → C → GND. R d10–d14, L c14–c16, C a16 → GND rail (col 16); CH2 tip e16.
// - v_R: 信号源 → L → C → R → GND. L c10–c12, C a12–a15, R d15–d19, black jumper a19 → GND rail;
//   CH2 tip e15.
// Common: generator red clip on a stub in a10, black clip on the GND rail (col 4); CH1 tip e10
// (the generator's output terminal), CH1 ground clip col 6, CH2 ground clip col 21. The GND rail is
// the top inner rail. The scope traces, the readouts and the sweep record all come from model.ts
// bench(): with "真实寄生参数" the loop also holds the inductor's R_L = 20 Ω and the generator's
// 50 Ω output resistance (so CH1, the terminal voltage, sags near f0).

import { Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, Lead, RAIL_Z, ROW_Z, Shell, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { BENCH_NAMES, Capacitor, Inductor } from '../../Passives3D';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { bench, F_RANGE, F_STEP, fmtDeg, fmtHz, fmtTime, fmtVpp, LAB, LAB_F0, scopeScale, sweep, VPP_RANGE, type Bench, type Probe } from './model';
import { Cell, Check, hoverProps, Seg, Slider, useClearHoverOnUnmount, useIsLit, useLab, type Cam, type Lab } from './state';

type V3 = [number, number, number];

const AMBER = '#f59e0b';

/* ------------------------------------------------------------- layouts */

interface Layout {
  r: [string, string];
  l: [string, string];
  c: [string, string];
  ch2: string;
  /** upper-half columns of the three nodes, and of the column tied to GND by a jumper */
  nodes: Record<'node_n1' | 'node_n2' | 'node_n3', number[]>;
  gndCols: number[];
  jumper?: [string, string];
}

const LAYOUT: Record<Probe, Layout> = {
  vC: { r: ['d10', 'd14'], l: ['c14', 'c16'], c: ['a16', 'G16'], ch2: 'e16', nodes: { node_n1: [10], node_n2: [14], node_n3: [16] }, gndCols: [] },
  vR: { l: ['c10', 'c12'], c: ['a12', 'a15'], r: ['d15', 'd19'], ch2: 'e15', nodes: { node_n1: [10], node_n2: [12], node_n3: [15] }, gndCols: [19], jumper: ['a19', 'G19'] },
};

/** "a10", "G4" (a hole of the GND rail = top inner rail) */
function hole(h: string): [number, number] {
  if (h[0] === 'G') return [colX(Number(h.slice(1))), RAIL_Z.tn];
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

function pick(x: number, z: number, lay: Layout): string[] | null {
  const c = Math.round(x + 32);
  for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 2 && c <= 62) return r === 'tn' ? ['rail_gnd'] : null;
  if (c < 1 || c > 63) return null;
  if (z <= -1 && z >= -6) {
    for (const [id, cols] of Object.entries(lay.nodes)) if (cols.includes(c)) return [id];
    if (lay.gndCols.includes(c)) return ['rail_gnd'];
    return [stripId('u', c)];
  }
  if (z >= 1 && z <= 6) return [stripId('l', c)];
  return null;
}

function Glow({ lit, lay }: { lit: string[]; lay: Layout }) {
  const quads: { x: number; z: number; w: number; d: number; color: string }[] = [];
  const col = (c: number, color = AMBER) => quads.push({ x: colX(c), z: -3.5, w: 0.86, d: 5.0, color });
  for (const id of lit) {
    const cols = lay.nodes[id as keyof Layout['nodes']];
    if (cols) cols.forEach((c) => col(c));
    const m = /^strip_([ul])_(\d+)$/.exec(id);
    if (m) quads.push({ x: colX(Number(m[2])), z: m[1] === 'u' ? -3.5 : 3.5, w: 0.86, d: 5.0, color: AMBER });
    if (id === 'rail_gnd') {
      quads.push({ x: (colX(3) + colX(61)) / 2, z: RAIL_Z.tn, w: colX(61) - colX(3) + 1.2, d: 0.86, color: '#4f86ff' });
      lay.gndCols.forEach((c) => col(c, '#4f86ff'));
    }
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

function Clip({ at, color, lit }: { at: V3; color: string; lit?: boolean }) {
  return (
    <group position={at}>
      <mesh rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.5, 1.1, 0.42]} />
        <meshStandardMaterial color={color} roughness={0.45} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.6 : 0} />
      </mesh>
      <mesh position={[0.32, -0.55, 0]}>
        <boxGeometry args={[0.18, 0.3, 0.3]} />
        <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------- the 100 Ω resistor */

const BANDS_100 = ['#7a4a1f', '#151515', '#7a4a1f', '#d4a72c'];

function AxialR({ p1, p2, lit, label }: { p1: [number, number]; p2: [number, number]; lit: boolean; label: string }) {
  const [x1, z1] = p1;
  const [x2, z2] = p2;
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ang = Math.atan2(-(z2 - z1), x2 - x1);
  const h = 1.25;
  const body = Math.min(2.4, len - 0.6);
  const ux = (x2 - x1) / len;
  const uz = (z2 - z1) / len;
  const e1: V3 = [mx - (ux * body) / 2, h, mz - (uz * body) / 2];
  const e2: V3 = [mx + (ux * body) / 2, h, mz + (uz * body) / 2];
  return (
    <group {...hover3d(['bb_r'])}>
      <Lead pts={[[x1, -0.3, z1], [x1, h, z1], e1]} />
      <Lead pts={[[x2, -0.3, z2], [x2, h, z2], e2]} />
      <group position={[mx, h, mz]} rotation={[0, ang, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.36, body - 0.72, 6, 16]} />
          <meshStandardMaterial color="#9ec3e6" roughness={0.55} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.4 : 0} />
        </mesh>
        {BANDS_100.map((c, i) => (
          <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[-body / 2 + 0.42 + i * 0.36 + (i === 3 ? 0.36 : 0), 0, 0]}>
            <cylinderGeometry args={[0.375, 0.375, 0.16, 18]} />
            <meshStandardMaterial color={c} roughness={0.5} metalness={i === 3 ? 0.5 : 0} />
          </mesh>
        ))}
      </group>
      {label && (
        <Html position={[mx, h + 1.3, mz]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`bb3d-tag w58-tag3 ${lit ? 'lit' : ''}`}>{label}</div>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------- function generator */

const GEN = { x: -43, z: -2, w: 11, h: 4.6, d: 8 };
const GEN_FRONT = GEN.z + GEN.d / 2;
const BNC_OUT: V3 = [GEN.x + 3.6, 0.4, GEN_FRONT + 0.4];
const KNOB: V3 = [GEN.x + 2.4, 2.6, GEN_FRONT + 0.3];

function Generator({ b, lit }: { b: Bench; lit: boolean }) {
  const red = useMemo<V3[]>(() => {
    const [x, z] = hole('a10');
    return [BNC_OUT, [BNC_OUT[0] + 2, 1.6, BNC_OUT[2] + 1.5], [-31, 2.6, 0.5], [x - 1.2, 2.4, z + 0.4], [x, 2.0, z]];
  }, []);
  const black = useMemo<V3[]>(() => {
    const [x, z] = hole('G4');
    return [BNC_OUT, [BNC_OUT[0] + 1.6, 1.2, BNC_OUT[2] + 1.2], [-33, 1.8, -4], [x - 0.6, 2.0, z + 0.3], [x, 1.7, z]];
  }, []);
  // the frequency knob turns 300° over the 1–15 kHz range (log scale)
  const k = Math.log(b.f / F_RANGE[0]) / Math.log(F_RANGE[1] / F_RANGE[0]);
  const knob = (-150 + 300 * k) * (Math.PI / 180);
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
        <group position={KNOB} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.95, 0.95, 0.6, 28]} />
            <meshStandardMaterial color="#9aa1ab" metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh position={[0.62 * Math.sin(knob), -0.32, -0.62 * Math.cos(knob)]}>
            <boxGeometry args={[0.16, 0.06, 0.16]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        </group>
        <mesh position={[BNC_OUT[0], BNC_OUT[1], GEN_FRONT + 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.5, 16]} />
          <meshStandardMaterial color="#c8ccd2" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[BNC_OUT[0], BNC_OUT[1] + 1.05, GEN_FRONT + 0.06]}>
          <planeGeometry args={[1.3, 0.5]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>
      <Tube pts={red} color="#d62f2f" r={0.14} lit={lit} />
      <Tube pts={black} color="#24262b" r={0.14} lit={lit} />
      <Stub at="a10" color="#d62f2f" />
      <Stub at="G4" color="#24262b" />
      <Clip at={[colX(10) + 0.15, 1.5, ROW_Z.a]} color="#d62f2f" lit={lit} />
      <Clip at={[colX(4) + 0.15, 1.5, RAIL_Z.tn]} color="#24262b" lit={lit} />
      <Html position={[GEN.x - 2.2, GEN.h - 1.7, GEN_FRONT + 0.05]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w58-gen-lcd">
          <b>SINE {fmtHz(b.f)}</b>
          <span>{fmtVpp(b.vpp)}</span>
          <span>{b.para ? 'Rout 50 Ω' : 'Rout 0 Ω（理想）'}</span>
        </div>
      </Html>
      <Html position={[GEN.x, GEN.h + 0.8, GEN.z - GEN.d / 2]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w58-tag3 gen ${lit ? 'lit' : ''}`}>{BENCH_NAMES.generator}</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- oscilloscope */

const SCOPE = { x: -12, z: -20, w: 24, h: 13.5, d: 7 };
const S_FRONT = SCOPE.z + SCOPE.d / 2;
const SCREEN = { x: SCOPE.x - 3.2, y: 6.3, w: 14.5, h: 9.2 };
const JACK: Record<'ch1' | 'ch2', V3> = { ch1: [SCOPE.x + 6.6, 0.6, S_FRONT + 0.3], ch2: [SCOPE.x + 9.2, 0.6, S_FRONT + 0.3] };

function ScopeScreen({ b }: { b: Bench }) {
  const { tdiv, vdiv } = scopeScale(b.f, Math.max(b.ch1pp, b.ch2pp));
  const w = 2 * Math.PI * b.f;
  const ref = Math.atan2(b.ch1.im, b.ch1.re);
  const sx = (t: number) => SCREEN.x - SCREEN.w / 2 + (t / (10 * tdiv)) * SCREEN.w;
  const sy = (v: number) => SCREEN.y + (Math.max(-4, Math.min(4, v / vdiv)) / 8) * SCREEN.h;
  const z = S_FRONT + 0.04;
  const trace = (c: { re: number; im: number }): V3[] => {
    const a = Math.hypot(c.re, c.im);
    const ph = Math.atan2(c.im, c.re) - ref;
    return Array.from({ length: 241 }, (_, k) => {
      const t = (k / 240) * 10 * tdiv;
      return [sx(t), sy(a * Math.sin(w * (t - tdiv) + ph)), z + 0.01] as V3;
    });
  };
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
        <Line key={i} points={g} color={i === 15 || i === 5 ? '#5f7f70' : '#264136'} lineWidth={i === 15 || i === 5 ? 1.2 : 0.8} />
      ))}
      <Line points={trace(b.ch1)} color="#facc15" lineWidth={2.2} />
      <Line points={trace(b.ch2)} color="#38bdf8" lineWidth={2.6} />
    </group>
  );
}

function Oscilloscope({ b, lit }: { b: Bench; lit: boolean }) {
  const { tdiv, vdiv } = scopeScale(b.f, Math.max(b.ch1pp, b.ch2pp));
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
        <ScopeScreen b={b} />
      </group>
      <Html position={[SCREEN.x, SCREEN.y + SCREEN.h / 2 - 0.5, S_FRONT + 0.1]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w58-scope-osd">
          <span className="c1 div">CH1 {vdiv} V/div</span>
          <span className="c2 div">CH2 {vdiv} V/div</span>
          <span className="div">{fmtTime(tdiv)}/div</span>
          <span className="c2">
            {b.probe === 'vC' ? 'VC' : 'VR'} {fmtVpp(b.ch2pp)} · Δφ {fmtDeg(b.dphi)}
          </span>
        </div>
      </Html>
      <Html position={[SCREEN.x, SCREEN.y - SCREEN.h / 2 + 0.6, S_FRONT + 0.1]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w58-scope-osd">
          <span className="c1">CH1 {fmtVpp(b.ch1pp)}</span>
          {b.locked && <span className="lock">谐振锁定 f0 ≈ 5.03 kHz</span>}
        </div>
      </Html>
      <Html position={[SCOPE.x, SCOPE.h + 0.6, SCOPE.z - SCOPE.d / 2]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w58-tag3 scope ${lit ? 'lit' : ''}`}>{BENCH_NAMES.scope}</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- probes */

function Probe({ ch, tipHole, clip, lit, clipLit }: { ch: 'ch1' | 'ch2'; tipHole: string; clip: V3; lit: boolean; clipLit: boolean }) {
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
        <Clip at={clip} color="#24262b" lit={clipLit} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- camera */

const FRAMES: Record<Cam, { x: [number, number]; y: [number, number]; z: [number, number]; dir: [number, number, number] }> = {
  bench: { x: [-49, -5], y: [-1, 12.5], z: [-24, 2], dir: [0, 1.3, 1] },
  board: { x: [-25, -10], y: [-1, 3.5], z: [-9.5, -0.5], dir: [0, 1.6, 1] },
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

function Scene({ b, frame, nonce }: { b: Bench; frame: Cam; nonce: number }) {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const is = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const lay = LAYOUT[b.probe];
  const last = useRef<string | null>(null);
  const move = (e: ThreeEvent<PointerEvent>) => {
    const ids = pick(e.point.x, e.point.z, lay);
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
      <Glow lit={lit} lay={lay} />
      <Html position={[colX(27), 0.3, RAIL_Z.tn]} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`w58-rtag ${is('rail_gnd') ? 'lit' : ''}`}>GND 轨</div>
      </Html>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, 22.4]} />
      </mesh>
      <Generator b={b} lit={is('bb_gen')} />
      <AxialR p1={hole(lay.r[0])} p2={hole(lay.r[1])} lit={is('bb_r')} label={close ? 'R 100 Ω · 1/4 W' : ''} />
      <Inductor p1={hole(lay.l[0])} p2={hole(lay.l[1])} id="bb_l" label={close ? (b.para ? '10 mH · 铜损 RL 20 Ω' : '10 mH 电感') : ''} />
      <Capacitor p1={hole(lay.c[0])} p2={hole(lay.c[1])} kind="film" id="bb_c" label={close ? '100 nF 薄膜 · 50 V' : ''} />
      {lay.jumper && <Jumper from={lay.jumper[0]} to={lay.jumper[1]} color="#24262b" lit={is('rail_gnd')} ids={['rail_gnd']} />}
      <Stub at="G6" color="#24262b" />
      <Stub at="G21" color="#24262b" />
      <Probe ch="ch1" tipHole="e10" clip={[colX(6) + 0.15, 1.5, RAIL_Z.tn]} lit={is('ch1_probe', 'node_n1')} clipLit={is('ch1_clip', 'rail_gnd')} />
      <Probe ch="ch2" tipHole={lay.ch2} clip={[colX(21) + 0.15, 1.5, RAIL_Z.tn]} lit={is('ch2_probe', 'node_n3')} clipLit={is('ch2_clip', 'rail_gnd')} />
      <Oscilloscope b={b} lit={is('bb_scope')} />
      <OrbitControls makeDefault enableDamping={false} minDistance={6} maxDistance={140} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig frame={frame} nonce={nonce} />
    </>
  );
}

/* ------------------------------------------------------------- sweep record */

const LF0 = Math.log(F_RANGE[0]);
const LF1 = Math.log(F_RANGE[1]);

/** the frequencies visited so far (dots) and, on demand, the model curve */
function SweepRecord({ lab, b, log, theory }: { lab: Lab; b: Bench; log: number[]; theory: boolean }) {
  const on = useIsLit();
  const curve = useMemo(() => sweep(lab.vpp, lab.probe, lab.para), [lab.vpp, lab.probe, lab.para]);
  const top = Math.max(...curve.map((p) => p.pp), b.ch1pp) * 1.1;
  const X = (f: number) => 6 + ((Math.log(f) - LF0) / (LF1 - LF0)) * 188;
  const Y = (v: number) => 74 - (v / top) * 62;
  const pts = log.map((f) => ({ f, pp: bench(f, lab.vpp, lab.probe, lab.para).ch2pp }));
  return (
    <svg viewBox="0 0 200 88" className={`w58-sweep ${on('sweep_rec')}`} role="img" aria-label="扫频记录：CH2 峰峰值随频率" {...hoverProps(['sweep_rec'])}>
      <rect x={0.5} y={0.5} width={199} height={87} rx={6} className="w58-sweep-bg" />
      <text x={6} y={10} className="w58-sweep-t">
        扫频记录 · CH2 {lab.probe === 'vC' ? 'VC' : 'VR'} (Vpp)
      </text>
      <line x1={6} x2={194} y1={74} y2={74} className="w58-sweep-axis" />
      <line x1={X(LAB_F0)} x2={X(LAB_F0)} y1={12} y2={74} className="w58-sweep-f0" />
      <text x={X(LAB_F0)} y={84} className="w58-sweep-t mid">
        5.03 kHz
      </text>
      <text x={6} y={84} className="w58-sweep-t">
        1k
      </text>
      <text x={194} y={84} className="w58-sweep-t end">
        15k
      </text>
      {theory && <path d={curve.map((p, k) => `${k ? 'L' : 'M'} ${X(p.f).toFixed(1)} ${Y(p.pp).toFixed(1)}`).join(' ')} className="w58-sweep-curve" />}
      {pts.map((p, i) => (
        <circle key={i} cx={X(p.f)} cy={Y(p.pp)} r={1.6} className="w58-sweep-dot" />
      ))}
      <circle cx={X(b.f)} cy={Y(b.ch2pp)} r={3} className="w58-sweep-now" />
    </svg>
  );
}

/* ------------------------------------------------------------- HUD and layer */

const LOGF = (p: number) => Math.round((F_RANGE[0] * Math.pow(F_RANGE[1] / F_RANGE[0], p / 1000)) / F_STEP) * F_STEP;
const POSF = (f: number) => Math.round((1000 * Math.log(f / F_RANGE[0])) / Math.log(F_RANGE[1] / F_RANGE[0]));

export default function Bench3D() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const on = useIsLit();
  const [frame, setFrame] = useStageParam<Cam>('cam', 'bench');
  const [nonce, setNonce] = useStageParam('camNonce', 0);
  const [logRaw] = useStageParam<number[]>('sweepLog', []);
  const [theory, setTheory] = useStageParam('sweepTheory', false);
  const log = Array.isArray(logRaw) ? logRaw : [];
  const b = useMemo(() => bench(lab.f, lab.vpp, lab.probe, lab.para), [lab.f, lab.vpp, lab.probe, lab.para]);
  const setF = (f: number) => {
    const nf = Math.min(F_RANGE[1], Math.max(F_RANGE[0], Math.round(f / F_STEP) * F_STEP));
    lab.set({ f: nf, sweepLog: [...log.slice(-299), nf] });
  };
  const ratio = b.ch2pp / b.ch1pp;
  return (
    <div className="w58-layer">
      <div className="w58-dock">
        <Slider
          label="f"
          value={POSF(lab.f)}
          min={0}
          max={1000}
          step={1}
          onChange={(p) => setF(LOGF(p))}
          text={fmtHz(lab.f)}
          ids={['bb_gen']}
          aria="信号发生器频率 f（对数刻度）"
          tone="f"
        />
        <div className="w58-presets" role="group" aria-label="频率微调">
          {[-100, -10, 10, 100].map((d) => (
            <button key={d} className={Math.abs(d) === 100 ? 'big' : ''} onClick={() => setF(lab.f + d)} {...hoverProps(['bb_gen'])}>
              {d > 0 ? `+${d}` : `−${-d}`}
            </button>
          ))}
        </div>
        <Slider
          label="Vpp"
          value={lab.vpp}
          min={VPP_RANGE[0]}
          max={VPP_RANGE[1]}
          step={0.1}
          onChange={(v) => lab.set({ vpp: Math.round(v * 10) / 10, sweepLog: [] })}
          text={lab.vpp.toFixed(1)}
          ids={['bb_gen', 'safety_note']}
          aria="输入峰峰值 Vpp（安全上限 2 Vpp）"
          tone="v"
        />
        <Seg<Probe>
          label="CH2 测量对象"
          value={lab.probe}
          onChange={(p) => lab.set({ probe: p, sweepLog: [] })}
          options={[
            { value: 'vR', label: 'v_R（电流相位参考）', short: 'CH2 = vR', hover: ['ch2_probe', 'bb_r'] },
            { value: 'vC', label: 'v_C（观测 Q 倍过压峰）', short: 'CH2 = vC', hover: ['ch2_probe', 'bb_c'] },
          ]}
        />
        <Check label="启用真实电感铜损内阻 RL=20Ω 与信号源 50Ω 内阻" short="寄生内阻" value={lab.para} onChange={(v) => lab.set({ para: v, sweepLog: [] })} ids={['bench_q']} />
      </div>
      <div className="bb3d-wrap w58-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-24, 44, 30], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <Scene b={b} frame={frame} nonce={nonce} />
        </Canvas>
        <div className="w58-camsel">
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
          <button className="w58-fold" onClick={() => setNonce(nonce + 1)} title="复位镜头">
            复位
          </button>
        </div>
        {b.locked && (
          <div className="w58-lock" role="status" {...hoverProps(['bench_f0'])}>
            谐振锁定 f0 ≈ 5.03 kHz
          </div>
        )}
        <div className="w58-sweepbox">
          <SweepRecord lab={lab} b={b} log={log} theory={theory} />
          <div className="w58-sweep-btns">
            <button className={`w58-fold ${theory ? 'on' : ''}`} onClick={() => setTheory(!theory)} aria-pressed={theory}>
              理论曲线
            </button>
            <button className="w58-fold" onClick={() => lab.set({ sweepLog: [] })}>
              清空
            </button>
          </div>
        </div>
      </div>
      <div className="w58-cells">
        <Cell id="bench_f0" name="频率 f" value={fmtHz(b.f)} tone={b.locked ? 'good' : ''} hint={`理论 f0 = ${fmtHz(LAB_F0)}`} />
        <Cell id="ch1_probe" name="CH1 发生器输出" value={fmtVpp(b.ch1pp)} tone="minor" hint={b.para ? '含 50 Ω 内阻压降' : '理想源'} />
        <Cell
          id="ch2_probe"
          name={`CH2 ${b.probe === 'vC' ? 'VC' : 'VR'}`}
          value={fmtVpp(b.ch2pp)}
          tone={b.probe === 'vC' && ratio > 1 ? 'bad' : ''}
          hint={`CH1 的 ${ratio.toFixed(2)} 倍`}
        />
        <Cell id="bench_phase" name="相位差 Δφ" value={fmtDeg(b.dphi)} tone={b.locked ? 'good' : ''} hint="CH2 相对 CH1" />
        <Cell id="bench_q" name="Reff · Q" value={`${b.rEff} Ω · ${b.q.toFixed(2)}`} hint={`Bf ≈ ${fmtHz(b.bf)}`} tone="minor" />
        <Cell
          id="safety_note"
          name="电容峰值"
          value={`${b.vcPk.toFixed(2)} V`}
          tone="minor"
          hint={`额定 ${LAB.C_RATED} V · I ${(b.iPk * 1000).toFixed(1)} mA · R ${(b.pR * 1000).toFixed(2)} mW`}
        />
      </div>
      <p className={`w58-notice w58-bench-notice ${on('safety_note')}`} {...hoverProps(['safety_note'])} role="note">
        <span className="full">
          激励：{BENCH_NAMES.generator}（正弦 1–15 kHz，≤ 2 Vpp），不需要台式可调直流电源 · 谐振时 |VC| = |VL| = Q·Vm：1 Vpp 输入时电容上 3.16 Vpp，远低于 50 V 耐压 · 回路电流峰值
          ≤ 10 mA
        </span>
        <span className="short">函数信号发生器 ≤ 2 Vpp · 电容 3.16 Vpp ≪ 50 V · 电流 ≤ 10 mA</span>
      </p>
    </div>
  );
}
