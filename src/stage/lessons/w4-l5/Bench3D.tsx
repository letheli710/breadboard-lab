// Layer "03 3D 面包板 RC 充放电 + 示波器探头共地接线实操": an 830-hole board on a bench with three
// separate instruments wired by leads — the 台式可调直流电源（5 V） on the left, the 函数信号发生器
// on the right and the 双通道示波器 behind the board — plus, for the scaled Sadiku 7.5, a second
// 台式可调直流电源（18 V / 36 V） in front on the right. All four are the shared bench instruments
// (src/stage/bench); the scope's MATH channel shows CH1 − CH2, 500 ms/div single sweep, a 1τ cursor.
//
// Rails: top outer (red) +5 V, top inner (blue) GND; bottom outer (blue) GND for the 7.5 kit, tied
// to the top GND by a black jumper at column 61. Board layout (columns):
// - RC kit (upper half): SPDT slide switch c18 / c19 / c20 (throw 18 → red jumper a18 → +5 V rail,
//   common 19 = node A, throw 20 → black jumper a20 → GND rail); R 10 kΩ d19 → d26; 100 µF
//   electrolytic (the shared Passives3D part) + in b26 (node B), − in b27, black jumper a27 → GND
//   rail; a bare-wire ground
//   loop T−32 … T−34 for the probes' alligator clips. With the generator as the source the switch
//   is pulled and the generator's OUT lead goes into a19, its COM into the GND rail.
// - Sadiku 7.5 × 1000 (lower half): V_1 18 V lead j38, R_1 3 kΩ h38 → h43, R_2 6 kΩ j43 → GND,
//   SPDT f43 (A) / f44 (common) / f45 (B), orange jumper g44 → g47, 250 µF + j47 − j48, black
//   jumper f48 → top GND rail, R_4 12 kΩ j45 → GND,
//   R_3 6 kΩ h45 → h50, V2 36 V lead j50; ground loop B−52 … B−54.
// Probes: CH1 (yellow) and CH2 (cyan) hooks on the nodes, black alligator clips on a ground loop
// ("safe"), or — the hazard demo — CH1's black clip on node B: PE earth then shorts node B to the
// supply's negative terminal, the scope shows a flat line on a red-tinted screen, a red PE path runs
// under the bench and the warning comes up (CH2 is off the board then).
// Camera: whole bench, board top view, ground-clip close-up, scope screen.

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, D, Lead, RAIL_Z, ROW_Z, Shell, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import {
  BENCH_NAMES,
  BenchSupply,
  fmtTdiv,
  FunctionGenerator,
  genLcd,
  LEAD_COLORS,
  Oscilloscope,
  SCOPE_SCREEN,
  SCOPE_SIZE,
  toWorld,
  type LcdLine,
  type OsdItem,
  type ScopeChannel,
  type ScopeCursor,
  type V3,
} from '../../bench';
import { Capacitor } from '../../Passives3D';
import { useLit, useStage, useStageParam } from '../../stageStore';
import {
  ex75,
  ex75Scope,
  fgVc,
  fmt,
  KIT,
  KIT_PEAK_P,
  KIT_TAU,
  kitScope,
  SCALE,
  WARN_TEXT,
  WARN_TITLE,
  type Kit,
  type Probe,
  type ScopeView,
  type Src,
  type Sw,
  type Trace,
} from './model';
import { ScopeScreen } from './Scope';
import { Cell, hoverProps, Seg, useClearHoverOnUnmount, useEx75Reveal, useIsLit } from './state';

type Cam = 'bench' | 'top' | 'clip' | 'scope';

const AMBER = '#f59e0b';

/** the bench supplies, named from BENCH_NAMES with their real voltages */
const SUPPLY_5 = `${BENCH_NAMES.supply}（5 V）`;
const SUPPLY_75 = `${BENCH_NAMES.supply}（18 V / 36 V）`;
const HAZ = '#e11d48';
const CH1C = '#eab308';
const CH2C = '#06b6d4';

/* ------------------------------------------------------------- holes, rails and picking */

const RAIL_OF: Record<Rail, string> = { tp: 'rail_p5', tn: 'rail_gnd', bp: 'rail_free', bn: 'rail_gnd' };
const RAIL_COLOR: Record<string, string> = { rail_p5: '#e11d48', rail_gnd: '#2b59c3' };

/** Board coordinates of a hole: "d19", "T+18" (top outer), "T-20" (top inner), "B+5" (bottom inner),
 *  "B-40" (bottom outer). */
function hole(h: string): [number, number] {
  const m = /^([TB])([+-])(\d+)$/.exec(h);
  if (m) {
    const r: Rail = m[1] === 'T' ? (m[2] === '+' ? 'tp' : 'tn') : m[2] === '+' ? 'bp' : 'bn';
    return [colX(Number(m[3])), RAIL_Z[r]];
  }
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

function stripMeaning(half: 'u' | 'l', c: number, kit: Kit): string | null {
  if (half === 'u') {
    if (c === 18) return 'bb_sw';
    if (c === 19) return 'node_a';
    if (c === 20) return 'bb_sw';
    if (c === 26) return 'node_b';
    if (c === 27) return 'bb_c';
  } else if (kit === 'ex75') {
    if (c === 38) return 'n75_v1';
    if (c === 43) return 'n75_a';
    if (c === 44 || c === 47) return 'n75_c';
    if (c === 45) return 'n75_b';
    if (c === 50) return 'n75_v2';
  }
  return null;
}

function pick(x: number, z: number, kit: Kit): string[] | null {
  const c = Math.round(x + 32);
  if (Math.abs(z) < 0.95) return ['center_trench'];
  for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 2 && c <= 62) return RAIL_OF[r] === 'rail_free' ? null : [RAIL_OF[r]];
  if (c < 1 || c > 63) return null;
  const half = z <= -1 && z >= -6 ? 'u' : z >= 1 && z <= 6 ? 'l' : null;
  if (!half) return null;
  const meaning = stripMeaning(half, c, kit);
  return meaning ? [stripId(half, c), meaning] : [stripId(half, c)];
}

/** strips and rails to tint for the lit ids */
function glowOf(lit: string[]): string[] {
  const g = new Set(lit.filter((id) => /^strip_|^rail_/.test(id)));
  const add = (...ids: string[]) => ids.forEach((s) => g.add(s));
  for (const id of lit) {
    if (id === 'node_a') add(stripId('u', 19));
    if (id === 'node_b') add(stripId('u', 26));
    if (id === 'bb_sw') add(stripId('u', 18), stripId('u', 19), stripId('u', 20));
    if (id === 'psu' || id === 'gnd_loop' || id === 'math') add('rail_p5', 'rail_gnd');
    if (id === 'n75_a') add(stripId('l', 43));
    if (id === 'n75_c') add(stripId('l', 44), stripId('l', 47));
    if (id === 'n75_b') add(stripId('l', 45));
    if (id === 'n75_v2') add(stripId('l', 50));
    if (id === 'n75_v1') add(stripId('l', 38));
  }
  return [...g];
}

function Glow({ ids }: { ids: string[] }) {
  const quads: { x: number; z: number; w: number; d: number; color: string }[] = [];
  for (const id of ids) {
    const m = /^strip_([ul])_(\d+)$/.exec(id);
    if (m) quads.push({ x: colX(Number(m[2])), z: m[1] === 'u' ? -3.5 : 3.5, w: 0.86, d: 5.0, color: AMBER });
    for (const r of Object.keys(RAIL_Z) as Rail[])
      if (RAIL_OF[r] === id) quads.push({ x: (colX(3) + colX(61)) / 2, z: RAIL_Z[r], w: colX(61) - colX(3) + 1.2, d: 0.86, color: RAIL_COLOR[id] ?? AMBER });
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

function RailTags({ lit, kit }: { lit: string[]; kit: Kit }) {
  const tags: { id: string; text: string; col: number; r: Rail }[] = [
    { id: 'rail_p5', text: '+5 V', col: 10, r: 'tp' },
    { id: 'rail_gnd', text: 'GND', col: 10, r: 'tn' },
  ];
  if (kit === 'ex75') tags.push({ id: 'rail_gnd', text: 'GND', col: 34, r: 'bn' });
  return (
    <>
      {tags.map((t, i) => (
        <Html key={i} position={[colX(t.col), 0.3, RAIL_Z[t.r]]} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`w45-rtag ${t.id} ${lit.includes(t.id) ? 'lit' : ''}`}>{t.text}</div>
        </Html>
      ))}
    </>
  );
}

/* ------------------------------------------------------------- wires and parts */

function Tube({ pts, color, r = 0.11, lit = false, glow = AMBER }: { pts: V3[]; color: string; r?: number; lit?: boolean; glow?: string }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      pts.map((p) => new THREE.Vector3(...p)),
      false,
      'centripetal',
    );
    return new THREE.TubeGeometry(curve, 64, r, 8, false);
  }, [pts, r]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.5} emissive={lit ? glow : '#000000'} emissiveIntensity={lit ? 0.7 : 0} />
    </mesh>
  );
}

const WIRE = { red: '#d62f2f', black: '#24262b', orange: '#f08a1c', yellow: '#eab308', blue: '#2b59c3' };

const hover3d = (ids: string[]) => ({
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    useStage.getState().setHover(ids);
  },
  onPointerOut: () => useStage.getState().setHover(null),
});

const clickable = (ids: string[], onClick: () => void) => ({
  onClick: (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  },
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    useStage.getState().setHover(ids);
    document.body.style.cursor = 'pointer';
  },
  onPointerOut: () => {
    useStage.getState().setHover(null);
    document.body.style.cursor = '';
  },
});

function Jumper({ from, to, color, lit, ids, lift = 1 }: { from: string; to: string; color: keyof typeof WIRE; lit?: boolean; ids?: string[]; lift?: number }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(from);
    const [x2, z2] = hole(to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const h = Math.min(3, Math.max(0.8, 0.35 + 0.2 * dist)) * lift;
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.4, z1], at(0.2, h * 0.92), at(0.5, h), at(0.8, h * 0.92), [x2, 0.4, z2], [x2, -0.3, z2]];
  }, [from, to, lift]);
  return (
    <group {...(ids ? hover3d(ids) : {})}>
      <Tube pts={pts} color={WIRE[color]} r={0.13} lit={lit} />
    </group>
  );
}

const C = { brown: '#7a4a1f', black: '#151515', red: '#c62828', orange: '#f07a1a', blue: '#1e5bd6', gold: '#d4a72c' };
const BANDS: Record<string, string[]> = {
  r10k: [C.brown, C.black, C.orange, C.gold],
  r3k: [C.orange, C.black, C.red, C.gold],
  r6k: [C.blue, C.black, C.red, C.gold],
  r12k: [C.brown, C.red, C.orange, C.gold],
};

/** An axial resistor lying from hole p1 to hole p2 (leads up to height h, body in the middle). */
function Res({ p1, p2, bands, lit, ids, h = 1.25 }: { p1: string; p2: string; bands: string[]; lit: boolean; ids: string[]; h?: number }) {
  const [x1, z1] = hole(p1);
  const [x2, z2] = hole(p2);
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ang = Math.atan2(-(z2 - z1), x2 - x1);
  const bodyLen = Math.min(2.4, len - 0.6);
  const ux = (x2 - x1) / len;
  const uz = (z2 - z1) / len;
  const e1: V3 = [mx - (ux * bodyLen) / 2, h, mz - (uz * bodyLen) / 2];
  const e2: V3 = [mx + (ux * bodyLen) / 2, h, mz + (uz * bodyLen) / 2];
  const bx = (i: number) => -bodyLen / 2 + 0.42 + i * 0.36 + (i === 3 ? 0.36 : 0);
  return (
    <group>
      <Lead pts={[[x1, -0.3, z1], [x1, h, z1], e1]} />
      <Lead pts={[[x2, -0.3, z2], [x2, h, z2], e2]} />
      <group position={[mx, h, mz]} rotation={[0, ang, 0]} {...hover3d(ids)}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.36, bodyLen - 0.72, 6, 16]} />
          <meshStandardMaterial color="#e6cc9a" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.45 : 0} />
        </mesh>
        {bands.map((c, i) => (
          <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[bx(i), 0, 0]}>
            <cylinderGeometry args={[0.375, 0.375, 0.16, 18]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** A three-pin SPDT slide switch across holes c0, c0+1, c0+2 of `row`; `side` 0 = towards c0. */
function SlideSwitch({ c0, row, side, id, lit, onFlip }: { c0: number; row: string; side: 0 | 1; id: string; lit: boolean; onFlip: () => void }) {
  const x = colX(c0 + 1);
  const z = ROW_Z[row];
  return (
    <group>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[colX(c0 + k), 0.1, z]}>
          <boxGeometry args={[0.16, 0.8, 0.1]} />
          <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[x, 0.75, z]} {...clickable([id], onFlip)}>
        <boxGeometry args={[3.3, 0.9, 1.3]} />
        <meshStandardMaterial color="#2f3540" roughness={0.5} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
      </mesh>
      <mesh position={[x + (side === 0 ? -0.55 : 0.55), 1.45, z]} {...clickable([id], onFlip)}>
        <boxGeometry args={[0.9, 0.6, 0.7]} />
        <meshStandardMaterial color={lit ? '#fde68a' : '#f2f2f2'} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.5 : 0} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** a bare-wire loop standing over two rail holes: the clip point for the probes' ground clips */
function GndLoop({ a, b, lit, onPick }: { a: string; b: string; lit: boolean; onPick: () => void }) {
  const [x1, z] = hole(a);
  const [x2] = hole(b);
  const pts = useMemo<V3[]>(
    () => [
      [x1, -0.3, z],
      [x1, 1.3, z],
      [(x1 + x2) / 2, 1.75, z],
      [x2, 1.3, z],
      [x2, -0.3, z],
    ],
    [x1, x2, z],
  );
  return (
    <group {...clickable(['gnd_loop'], onPick)}>
      <Tube pts={pts} color="#c3c8ce" r={0.09} lit={lit} />
      <mesh position={[(x1 + x2) / 2, 1.2, z]} visible={false}>
        <boxGeometry args={[Math.abs(x2 - x1) + 1, 2, 1.2]} />
      </mesh>
    </group>
  );
}

function Tag({ at, text, cls = '', lit }: { at: V3; text: string; cls?: string; lit?: boolean }) {
  return (
    <Html position={at} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`bb3d-tag w45-tag3 ${cls} ${lit ? 'lit' : ''}`}>{text}</div>
    </Html>
  );
}

/* ------------------------------------------------------------- camera */

const VIEW_DIR = new THREE.Vector3(0, 1.7, 1).normalize();
/** width of the scope screen beside the view (px; w4l5.css .w45-hud.side) */
const HUD_W = 270;
type Frame = { x: [number, number]; z: [number, number]; y?: [number, number] };

function frameOf(cam: Cam, kit: Kit): Frame {
  if (cam === 'bench') return { x: [-51, 50], z: [-26, 13], y: [-1, 8] };
  if (cam === 'scope') return { x: [-8.5, 8.5], z: [-25, -18], y: [-1, 9] };
  if (kit === 'ex75') return cam === 'top' ? { x: [4.5, 25], z: [-1, 10.5] } : { x: [11, 23], z: [2, 10.5] };
  return cam === 'top' ? { x: [-16, 4], z: [-10.5, 0] } : { x: [-8.5, 3.5], z: [-10.2, -2.5] };
}

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: Frame): [THREE.Vector3, THREE.Vector3] {
  const y = f.y ?? [-1, 4];
  const target = new THREE.Vector3((f.x[0] + f.x[1]) / 2, (y[0] + y[1]) / 4, (f.z[0] + f.z[1]) / 2);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of f.x) for (const yy of y) for (const z of f.z) corners.push(new THREE.Vector3(x, yy, z));
  const v = new THREE.Vector3();
  let d = 8;
  for (; d < 300; d *= 1.04) {
    cam.position.copy(target).addScaledVector(VIEW_DIR, d);
    cam.lookAt(target);
    cam.updateMatrixWorld();
    if (corners.every((p) => (v.copy(p).project(cam), Math.abs(v.x) < 0.94 && Math.abs(v.y) < 0.9))) break;
  }
  return [target.clone().addScaledVector(VIEW_DIR, d), target];
}

/** `side`: the scope screen covers the right part of the canvas (wide layout) — the view is shifted
 *  so the framed objects fill the uncovered left part. */
function CameraRig({ frame, nonce, side }: { frame: Frame; nonce: number; side: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const invalidate = useThree((s) => s.invalidate);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const aspect = width / Math.max(1, height);
  const pad = side ? Math.min(0.42, (HUD_W + 16) / Math.max(1, width)) : 0;
  const anim = useRef<{ t: number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3 } | null>(null);
  const key = JSON.stringify(frame);
  useEffect(() => {
    if (pad > 0) camera.setViewOffset(width, height, (pad * width) / 2, 0, width, height);
    else camera.clearViewOffset();
    invalidate();
  }, [camera, pad, width, height, invalidate]);
  useEffect(() => {
    if (!controls) return;
    const [toP, toT] = fitView(camera, aspect * (1 - pad), JSON.parse(key) as Frame);
    if (prefersReducedMotion()) {
      camera.position.copy(toP);
      controls.target.copy(toT);
      controls.update();
      invalidate();
      return;
    }
    anim.current = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toP, toT };
    invalidate();
  }, [key, nonce, controls, camera, invalidate, aspect, pad]);
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

export interface BenchState {
  kit: Kit;
  src: Src;
  sw: Sw;
  probe: Probe;
  sw75: 'A' | 'B';
  reveal: number;
}

/** where the probes' ground clips sit: on a ground loop (RC kit, 7.5 kit), or on node B's lead */
const PT = {
  clipB: [colX(26) + 0.15, 0.9, ROW_Z.d + 0.05] as V3,
  loop1: (k: number): V3 => [colX(32.6 + 0.8 * k), 1.45, RAIL_Z.tn],
  loop2: (k: number): V3 => [colX(52.6 + 0.8 * k), 1.45, RAIL_Z.bn],
};

/** the scope behind the board: the shared one at the old 17-unit box's size */
const SCOPE_PL = { position: [0, -22] as [number, number], scale: 17 / 24 };
/** the scope's front panel (the PE path starts under it) */
const FRONT = SCOPE_PL.position[1] + (SCOPE_SIZE.d * SCOPE_PL.scale) / 2;

function PeShortPath() {
  const pts = useMemo<V3[]>(
    () => [
      [SCOPE_PL.position[0] - 6, -0.95, FRONT - 1],
      [-14, -0.95, -15],
      [-30, -0.95, -10],
      [-40, -0.95, -6.5],
    ],
    [],
  );
  const clip = PT.clipB;
  return (
    <group {...hover3d(['pe'])}>
      <Tube pts={pts} color={HAZ} r={0.22} lit glow={HAZ} />
      <mesh position={[clip[0], clip[1] + 0.2, clip[2]]}>
        <sphereGeometry args={[0.75, 18, 14]} />
        <meshBasicMaterial color="#fb7185" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <Html position={[-20, 0.6, -13]} center zIndexRange={[22, 0]} style={{ pointerEvents: 'none' }}>
        <div className="bb3d-tag w45-tag3 pe">市电 PE 大地隐蔽短路回路!</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- instruments (src/stage/bench) */

const FG_HEAD: LcdLine = { text: 'SQUARE 0.10 Hz', strong: true };

/** the scope's channels from the lesson's ScopeView (its ground levels count from the screen's bottom);
 *  thick traces, as on the old screen */
function useChannels(view: ScopeView, locked: boolean): Partial<Record<Trace['ch'], ScopeChannel>> {
  return useMemo(() => {
    const out: Partial<Record<Trace['ch'], ScopeChannel>> = {};
    const color: Partial<Record<Trace['ch'], string>> = { ch1: CH1C, ch2: CH2C };
    for (const tr of view.traces) out[tr.ch] = { data: tr.v, vdiv: view.vdiv, pos: tr.pos - 4, on: !locked, color: color[tr.ch], width: 10 };
    return out;
  }, [view, locked]);
}

function Instruments({ b, view, hazard }: { b: BenchState; view: ScopeView; hazard: boolean }) {
  const rc = b.kit === 'rc';
  const fgOn = b.src === 'fg' && rc;
  const locked = !rc && b.reveal < 9;
  const ch = useChannels(view, locked);
  const time = useMemo(() => ({ div: view.tdiv, start: view.t0 }), [view]);
  const cur = view.cursor;
  const curTr = cur && view.traces.find((t) => t.ch === cur.ch);
  const cursors = useMemo<ScopeCursor[]>(() => (cur && !locked ? [{ kind: 't', at: cur.t, label: '1τ' }] : []), [cur, locked]);
  // one line on the screen: the time base and the cursor reading (the HUD screen has the rest)
  const osd: OsdItem[] = [{ text: `${fmtTdiv(view.tdiv)} · Single ↑`, minor: true }];
  if (hazard) osd.push({ text: 'CH1 黑夹在节点 B：PE 短路', tone: 'warn' });
  else if (cur && curTr && !locked) osd.push({ text: `1τ = ${fmt(cur.t)} s：${fmt(curTr.v(cur.t))} V`, tone: cur.ch });
  const loop = rc ? PT.loop1 : PT.loop2;
  const screen = toWorld(SCOPE_PL, [SCOPE_SCREEN.x, SCOPE_SCREEN.y, SCOPE_SIZE.d / 2 + 0.06]);
  return (
    <>
      <BenchSupply
        id="psu"
        position={[-43, -2]}
        yaw={Math.PI / 2}
        channels={[fgOn ? { v: KIT.vs, readout: '待机（发生器供信号）' } : { v: KIT.vs, limit: 0.05 }]}
        leads={[
          { from: '+', to: 'T+3' },
          { from: '-', to: 'T-4' },
        ]}
      />
      <FunctionGenerator
        id="fg"
        position={[44, -5]}
        waveform="square"
        frequency={0.1}
        vpp={5}
        offset={2.5}
        readout="span"
        output={fgOn}
        lcd={[FG_HEAD, ...genLcd({ waveform: 'square', frequency: 0.1, vpp: 5, offset: 2.5, readout: 'span', output: fgOn }).slice(1)]}
        out={fgOn ? 'a19' : undefined}
        gnd={fgOn ? 'T-41' : undefined}
      />
      {!rc && (
        <BenchSupply
          id="psu75"
          position={[44, 9]}
          scale={0.8}
          channels={[{ v: 18 }, { v: 36, color: LEAD_COLORS.orange }]}
          leads={[
            { from: '1+', to: 'j38' },
            { from: '2+', to: 'j50' },
            { from: '1-', to: 'B-57' },
            { from: '2-', to: 'B-58' },
          ]}
        />
      )}
      <Oscilloscope
        id="scope"
        {...SCOPE_PL}
        ch1={ch.ch1}
        ch2={ch.ch2}
        math={ch.math}
        time={time}
        cursors={cursors}
        osd={osd}
        autoOsd={false}
        label={`${BENCH_NAMES.scope}（BNC 外壳接 PE）`}
        probes={{
          ch1: { tip: rc ? 'd19' : 'h50', ground: hazard ? PT.clipB : loop(0), id: 'ch1', groundId: 'gnd_clip', groundLitIds: ['gnd_loop'], groundBad: hazard, color: CH1C },
          // with the CH1 clip on node B the CH2 probe is off the board
          ch2: hazard ? undefined : { tip: rc ? 'd26' : 'h45', ground: loop(1), id: 'ch2', groundId: 'gnd_clip', groundLitIds: ['gnd_loop'], color: CH2C },
        }}
      />
      {/* the wrong ground: the screen glows red */}
      {hazard && (
        <mesh position={screen}>
          <planeGeometry args={[SCOPE_SCREEN.w * SCOPE_PL.scale, SCOPE_SCREEN.h * SCOPE_PL.scale]} />
          <meshBasicMaterial color={HAZ} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </>
  );
}

function Scene({ b, view, set, frame, nonce, side }: { b: BenchState; view: ScopeView; set: (p: Partial<BenchState>) => void; frame: Frame; nonce: number; side: boolean }) {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const is = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const last = useRef<string | null>(null);
  const move = (e: ThreeEvent<PointerEvent>) => {
    const ids = pick(e.point.x, e.point.z, b.kit);
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
  const rc = b.kit === 'rc';
  const hazard = rc && b.probe === 'hazard';
  const fg = b.src === 'fg';
  const flip = () => set({ sw: b.sw === 'charge' ? 'discharge' : 'charge' });
  const flip75 = () => set({ sw75: b.sw75 === 'A' ? 'B' : 'A' });
  const close = frame.y === undefined;
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      {/* the bench top */}
      <mesh position={[0, -1.02, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[130, 70]} />
        <meshStandardMaterial color="#e9dfca" roughness={0.95} />
      </mesh>
      <Shell xray={0} />
      <Glow ids={glowOf(lit)} />
      <RailTags lit={lit} kit={b.kit} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <Instruments b={b} view={view} hazard={hazard} />
      {/* RC kit */}
      <Jumper from="a18" to="T+18" color="red" lit={is('rail_p5', 'bb_sw')} ids={['bb_sw']} />
      <Jumper from="a20" to="T-20" color="black" lit={is('rail_gnd', 'bb_sw')} ids={['bb_sw']} />
      {!(fg && rc) && <SlideSwitch c0={18} row="c" side={b.sw === 'charge' ? 0 : 1} id="bb_sw" lit={is('bb_sw')} onFlip={flip} />}
      <Res p1="d19" p2="d26" bands={BANDS.r10k} lit={is('bb_r')} ids={['bb_r']} />
      <Capacitor kind="electrolytic" p1={hole('b26')} p2={hole('b27')} id="bb_c" label={close && rc ? '100 µF（白条 − → b27 → GND）' : ''} />
      <Jumper from="a27" to="T-27" color="black" lit={is('rail_gnd', 'bb_c')} ids={['bb_c']} />
      <GndLoop a="T-32" b="T-34" lit={is('gnd_loop', 'gnd_clip')} onPick={() => set({ probe: 'safe' })} />
      {rc && hazard && <PeShortPath />}
      {rc && (
        <mesh position={[PT.clipB[0], 0.6, PT.clipB[2]]} visible={false} {...clickable(['node_b'], () => set({ probe: 'hazard' }))}>
          <boxGeometry args={[1.2, 1.6, 1.4]} />
        </mesh>
      )}
      {close && rc && (
        <>
          <Tag at={[colX(22.5), 2.4, ROW_Z.d]} text="R 10 kΩ" cls="res" lit={is('bb_r')} />
          {!fg && <Tag at={[colX(19), 2.6, ROW_Z.c]} text={b.sw === 'charge' ? '开关：充电 → +5 V' : '开关：放电 → GND'} cls="sw" lit={is('bb_sw')} />}
        </>
      )}
      {/* Sadiku 7.5 × 1000 */}
      {!rc && (
        <>
          <Jumper from="T-61" to="B-61" color="black" ids={['rail_gnd']} lit={is('rail_gnd')} lift={0.7} />
          <Res p1="h38" p2="h43" bands={BANDS.r3k} lit={is('r1')} ids={['r1']} />
          <Res p1="j43" p2="B-40" bands={BANDS.r6k} lit={is('r2')} ids={['r2']} h={1.0} />
          <SlideSwitch c0={43} row="f" side={b.sw75 === 'A' ? 0 : 1} id="sw75" lit={is('sw75')} onFlip={flip75} />
          <Jumper from="g44" to="g47" color="orange" lit={is('n75_c', 'c75')} ids={['n75_c']} />
          <Capacitor kind="electrolytic" p1={hole('j47')} p2={hole('j48')} id="c75" label={close ? '250 µF' : ''} />
          <Jumper from="f48" to="T-48" color="black" lit={is('rail_gnd', 'c75')} ids={['c75']} />
          <Res p1="j45" p2="B-46" bands={BANDS.r12k} lit={is('r4')} ids={['r4']} h={1.0} />
          <Res p1="h45" p2="h50" bands={BANDS.r6k} lit={is('r3')} ids={['r3']} />
          <GndLoop a="B-52" b="B-54" lit={is('gnd_loop', 'gnd_clip')} onPick={() => undefined} />
          {close && (
            <>
              <Tag at={[colX(44), 2.7, ROW_Z.f]} text={b.sw75 === 'A' ? '开关：A（左侧 18 V 网络）' : '开关：B（右侧 36 V 网络）'} cls="sw" lit={is('sw75')} />
              <Tag at={[colX(40.5), 2.4, ROW_Z.h]} text="R₁ 3 kΩ" cls="res" lit={is('r1')} />
              <Tag at={[colX(47.5), 2.4, ROW_Z.h]} text="R₃ 6 kΩ" cls="res" lit={is('r3')} />
            </>
          )}
        </>
      )}
      <OrbitControls makeDefault enableDamping={false} minDistance={6} maxDistance={160} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig frame={frame} nonce={nonce} side={side} />
    </>
  );
}

/* ------------------------------------------------------------- HUD and layer */

function useBench(): [BenchState, (p: Partial<BenchState>) => void] {
  const [kit] = useStageParam<Kit>('kit', 'rc');
  const [src] = useStageParam<Src>('src', 'dc');
  const [sw] = useStageParam<Sw>('sw', 'charge');
  const [probe] = useStageParam<Probe>('probe', 'safe');
  const [sw75] = useStageParam<'A' | 'B'>('sw75', 'B');
  const reveal = useEx75Reveal();
  const setParams = useStage((s) => s.setParams);
  return [{ kit, src, sw, probe, sw75, reveal }, (p) => setParams(p as Record<string, unknown>)];
}

function Panel({ b }: { b: BenchState }) {
  if (b.kit === 'ex75') {
    const e = ex75(SCALE);
    const ok = b.reveal >= 9;
    const h = (s: string) => (ok ? s : '?');
    return (
      <div className="w45-cells">
        <Cell id="psu75" name="电源" value="18 V / 36 V" tone="minor" />
        <Cell id="thev" name="Rth = 6k ∥ 12k" value={h(`${fmt(e.rth / 1e3, 0)} kΩ`)} />
        <Cell id="c75" name="τ = Rth · 250 µF" value={h(`${fmt(e.tau, 2)} s`)} tone="good" />
        <Cell id="jump" name="i₃(0⁺)（最大支路电流）" value={h(`${fmt(e.i30p * 1e3, 1)} mA`)} tone="bad" />
        <Cell id="i3" name="i₃(∞)" value={h(`${fmt(e.i3Inf * 1e3, 1)} mA`)} tone="minor" />
        <Cell id="scale_note" name="R₃ 峰值功耗" value={h(`${fmt(e.i30p * e.i30p * 6e3 * 1e3, 0)} mW`)} hint="1/4 W = 250 mW" tone="minor" />
      </div>
    );
  }
  const hazard = b.probe === 'hazard';
  return (
    <div className="w45-cells">
      <Cell id={b.src === 'fg' ? 'fg' : 'psu'} name="信号源" value={b.src === 'fg' ? '方波 0–5 V' : `直流 5 V · ${b.sw === 'charge' ? '充电' : '放电'}`} tone="minor" />
      <Cell id="tau" name="τ = RC" value={`${fmt(KIT_TAU, 1)} s`} />
      <Cell
        id="m63"
        name="vC(1τ)"
        value={hazard ? '0 V（C 被短接）' : b.src === 'fg' ? `${fmt(fgVc(KIT_TAU))} V` : b.sw === 'discharge' ? '1.84 V（36.8%）' : '3.16 V（63.2%）'}
        tone={hazard ? 'bad' : 'good'}
      />
      <Cell id="ic" name="i(0⁺) = Vs/R" value={`${fmt((KIT.vs / KIT.r) * 1e3, 2)} mA`} />
      <Cell id="bb_r" name="R 峰值功耗" value={`${fmt(KIT_PEAK_P * 1e3, 1)} mW`} hint="1/4 W 的 1%" tone="minor" />
      <Cell id="gnd_clip" name="黑夹" value={hazard ? 'CH1 黑夹在节点 B：短路！' : '双黑夹同接 GND'} tone={hazard ? 'bad minor' : 'good minor'} />
    </div>
  );
}

/** wide layout: the scope screen sits on the canvas' right and the 3D view is shifted left */
function useWide(): boolean {
  const q = '(min-width: 961px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(q).matches);
  useEffect(() => {
    const m = window.matchMedia?.(q);
    if (!m) return;
    const f = () => setWide(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return wide;
}

export default function Bench3D() {
  useClearHoverOnUnmount();
  const [b, set] = useBench();
  const [cam, setCam] = useStageParam<Cam>('cam', 'bench');
  const [nonce, setNonce] = useStageParam('camNonce', 0);
  const wide = useWide();
  // the scope screen: always beside the 3D view on wide screens; on a phone it opens over the view
  const [hudOpen, setHudOpen] = useStageParam('scopeOpen', false);
  const hud = wide || hudOpen;
  const on = useIsLit();
  const rc = b.kit === 'rc';
  const view = useMemo(() => (rc ? kitScope(b.src, b.sw, b.probe) : ex75Scope(b.sw75)), [rc, b.src, b.sw, b.probe, b.sw75]);
  const sweep = useMemo(() => Math.random(), [view]); // eslint-disable-line react-hooks/exhaustive-deps
  const frame = frameOf(cam, b.kit);
  const hazard = rc && b.probe === 'hazard';
  const locked = !rc && b.reveal < 9 ? '完成第六幕引导例题后解锁本套件的波形与读数' : undefined;
  return (
    <div className="w45-layer">
      <div className="w45-dock">
        <Seg<Kit>
          label="电路套件"
          small
          value={b.kit}
          onChange={(v) => set({ kit: v })}
          options={[
            { value: 'rc', label: '基础 RC（5 V · 10 kΩ · 100 µF）', short: 'RC 套件', hover: ['bb_r', 'bb_c'] },
            { value: 'ex75', label: '7.5 例题 ×1000 缩放', short: '7.5 ×1000', hover: ['scale_note'] },
          ]}
        />
        {rc && (
          <Seg<Src>
            label="信号源"
            small
            value={b.src}
            onChange={(v) => set({ src: v })}
            options={[
              { value: 'dc', label: '直流 5 V + 开关', short: '直流', hover: ['psu'] },
              { value: 'fg', label: '函数发生器方波', short: '方波', hover: ['fg'] },
            ]}
          />
        )}
        {rc && b.src === 'dc' && (
          <Seg<Sw>
            label="开关"
            small
            value={b.sw}
            onChange={(v) => set({ sw: v })}
            options={[
              { value: 'charge', label: '充电 → 5 V', short: '充电', hover: ['bb_sw'] },
              { value: 'discharge', label: '放电 → GND', short: '放电', hover: ['bb_sw'] },
            ]}
          />
        )}
        {!rc && (
          <Seg<'A' | 'B'>
            label="开关"
            small
            value={b.sw75}
            onChange={(v) => set({ sw75: v })}
            options={[
              { value: 'A', label: '开关 A', short: 'A', hover: ['sw75'] },
              { value: 'B', label: '开关 B', short: 'B', hover: ['sw75'] },
            ]}
          />
        )}
        {rc && (
          <Seg<Probe>
            label="探头黑夹"
            small
            value={b.probe}
            onChange={(v) => set({ probe: v })}
            options={[
              { value: 'safe', label: '双黑夹接 GND 轨', short: '黑夹 GND', hover: ['gnd_loop'] },
              { value: 'hazard', label: '黑夹夹节点 B（错误）', short: '黑夹节点 B', hover: ['node_b'], tone: 'bad' },
            ]}
          />
        )}
      </div>
      <div className={`bb3d-wrap w45-bench ${hazard ? 'hazard' : ''}`}>
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-10, 60, 50], fov: 38, near: 0.5, far: 500 }} className="bb3d-canvas">
          <Scene b={b} view={view} set={set} frame={frame} nonce={nonce} side={wide} />
        </Canvas>
        {hud && (
          <div className={`w45-hud ${wide ? 'side' : 'over'}`}>
            <ScopeScreen view={view} sweep={sweep} locked={locked} warn={hazard} />
          </div>
        )}
        <div className="w45-camsel">
          <Seg<Cam>
            label="镜头"
            small
            value={cam}
            onChange={setCam}
            options={[
              { value: 'bench', label: '全景', short: '全景' },
              { value: 'top', label: '面包板俯视', short: '俯视' },
              { value: 'clip', label: '地线夹特写', short: '夹子' },
              { value: 'scope', label: '示波器正面', short: '示波器' },
            ]}
          />
          {!wide && (
            <button className={`w45-fold ${hudOpen ? 'on' : ''}`} onClick={() => setHudOpen(!hudOpen)} aria-pressed={hudOpen} {...hoverProps(['scope'])}>
              {hudOpen ? '收起屏幕' : '屏幕'}
            </button>
          )}
          <button className="w45-fold" onClick={() => setNonce(nonce + 1)} title="复位镜头">
            复位
          </button>
        </div>
      </div>
      {hazard ? (
        <div className="w45-warn" role="alert" {...hoverProps(['gnd_clip', 'pe'])}>
          <b>{WARN_TITLE}</b>
          <p>{WARN_TEXT}</p>
          <p className="now">
            此刻：CH1 黑夹夹在节点 B，经 PE 把它拉到 0 V——电容被短接旁路（vC ≡ 0），屏幕只剩一条{b.src === 'fg' || b.sw === 'charge' ? ' 5 V ' : ' 0 V '}
            直线，R 被直接跨在电源两端。把黑夹改回蓝色 GND 轨，用 CH1 − CH2 的 MATH 差分看 vR。
          </p>
        </div>
      ) : (
        <>
          <Panel b={b} />
          <p className={`w45-notice ${on('scale_note')}`} {...hoverProps(['scale_note'])} role="note">
            {rc ? (
              <>
                <span className="full">{SUPPLY_5}：红轨 +5 V、蓝轨 GND · R 10 kΩ 峰值 0.5 mA / 2.5 mW · 100 µF 长脚接 R、白条短脚接 GND · 1 V/div、500 ms/div</span>
                <span className="short">{SUPPLY_5} · 10 kΩ · 100 µF（白条接 GND）</span>
              </>
            ) : (
              <>
                <span className="full">安全缩放已启用（1000×）：电阻 ×1000 到 kΩ、电容 ÷1000 到 µF，τ 不变 · {SUPPLY_75} · 5 V/div</span>
                <span className="short">安全缩放已启用（1000×）· {SUPPLY_75}</span>
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
