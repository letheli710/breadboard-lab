// Layer "03 3D 面包板开路/带载实测": Sadiku Ex. 4.8 built on an 830-hole board at ×1000 impedance
// (R1 4 kΩ, R2 12 kΩ, R3 1 kΩ, a 2 mA current-source module), fed by a 台式可调直流电源（32 V）
// standing on the bench (the shared bench supply of src/stage/bench) and wired to the top rails
// with its own red / black leads (it is not a part plugged into the board). Port a = column 26, port b = column 29 (tied to the − rail).
// Four measurements: open-circuit V_Th (DC V), the half-voltage method with a 10 kΩ multi-turn
// pot (V_L = 30·R_L / (4 + R_L)), the two-point method with a known 6 kΩ load, and I_N on the
// mA range (safe only because the kΩ network limits it to 7.5 mA). The scale switch puts the
// textbook Ω values in: the resistors glow and smoke, the mA fuse blows and an OVERLOAD card
// asks to switch back. Built from the shared breadboard shell (BreadboardXray.tsx).

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, RAIL_Z, ROW_Z, Shell } from '../../BreadboardXray';
import { BenchSupply, supplyLabel, type SupplyChannel } from '../../bench';
import { COLOR_BY_KEY } from '../../colorCode';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { Tex } from '../../StageText';
import { DEFAULTS, hov, Seg, Slider, useClearHoverOnUnmount, useIsLit } from './common';
import { BANDS, fmtA, fmtOhm, fmtW, halfHit, heatOf, lab, P_MAX, POT, RL_KNOWN, type Heat, type Lab, type LabMode, type Scale } from './model';

const SUPPLY: SupplyChannel = { v: 32 };
export const SUPPLY_NAME = supplyLabel([SUPPLY]);

type V3 = [number, number, number];

/* ------------------------------------------------------------- holes and hover */

/** Board coordinates of a hole: "c10", "T+10" (top + rail, column 10), "T-23" (top − rail). */
function hole(h: string): [number, number] {
  const m = /^T([+-])(\d+)$/.exec(h);
  if (m) return [colX(Number(m[2])), m[1] === '+' ? RAIL_Z.tp : RAIL_Z.tn];
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

/** Light `ids`; `release` clears the hover only if it is still the one this source set. */
function claimHover(ids: string[]) {
  useStage.getState().setHover(ids);
  return useStage.getState().hover;
}
function releaseHover(mine: string[] | null) {
  if (mine && useStage.getState().hover === mine) useStage.getState().setHover(null);
}

function useHover3D(ids: string[]) {
  const mine = useRef<string[] | null>(null);
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      mine.current = claimHover(ids);
    },
    onPointerOut: () => releaseHover(mine.current),
  };
}

/* ------------------------------------------------------------- wires */

function Tube({ pts, color, r = 0.11, lit = false }: { pts: V3[]; color: string; r?: number; lit?: boolean }) {
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
      <meshStandardMaterial color={color} roughness={0.5} emissive={lit ? '#f59e0b' : '#000000'} emissiveIntensity={lit ? 0.6 : 0} />
    </mesh>
  );
}

const WIRE: Record<string, string> = { red: '#d62f2f', black: '#24262b', orange: '#f08a1c' };

/** A jumper from hole to hole, arched over what it crosses. */
function Jumper({ from, to, color }: { from: string; to: string; color: keyof typeof WIRE }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(from);
    const [x2, z2] = hole(to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const hgt = Math.min(2.6, Math.max(0.6, 0.3 + 0.19 * dist));
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.35, z1], at(0.2, hgt * 0.92), at(0.5, hgt), at(0.8, hgt * 0.92), [x2, 0.35, z2], [x2, -0.3, z2]];
  }, [from, to]);
  return <Tube pts={pts} color={WIRE[color]} r={0.12} />;
}

/* ------------------------------------------------------------- resistors and the pot */

const AMBER = '#f59e0b';
const HEAT_GLOW: Record<Heat, string> = { ok: '#000000', warm: '#ff7a1a', smoke: '#ff2a00' };
const bandX = (len: number, n: number, i: number) => -len / 2 + 0.36 + i * 0.3 + (i === n - 1 ? 0.26 : 0);

function Smoke() {
  return (
    <div className={`w27-smoke ${prefersReducedMotion() ? 'still' : ''}`} aria-hidden>
      <i />
      <i />
      <i />
    </div>
  );
}

function Resistor3D({
  id,
  from,
  to,
  ohms,
  p,
  h = 1.25,
  tag,
  tagDz = 0,
}: {
  id: string;
  from: string;
  to: string;
  ohms: number;
  p: number;
  h?: number;
  tag: string;
  tagDz?: number;
}) {
  const isLit = useIsLit();
  const lit = isLit(id);
  const hover = useHover3D([id]);
  const [x1, z1] = hole(from);
  const [x2, z2] = hole(to);
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ang = Math.atan2(-(z2 - z1), x2 - x1);
  const bodyLen = Math.min(2.4, len - 0.6);
  const ux = (x2 - x1) / len;
  const uz = (z2 - z1) / len;
  const leads = useMemo<[V3[], V3[]]>(() => {
    const e1: V3 = [mx - (ux * bodyLen) / 2, h, mz - (uz * bodyLen) / 2];
    const e2: V3 = [mx + (ux * bodyLen) / 2, h, mz + (uz * bodyLen) / 2];
    return [
      [[x1, -0.3, z1], [x1, h * 0.7, z1], [x1 + ux * 0.25, h, z1 + uz * 0.25], e1],
      [[x2, -0.3, z2], [x2, h * 0.7, z2], [x2 - ux * 0.25, h, z2 - uz * 0.25], e2],
    ];
  }, [x1, z1, x2, z2, mx, mz, ux, uz, bodyLen, h]);
  const bands = (BANDS[String(ohms)] ?? ['brown', 'black', 'black', 'gold']).map((k) => COLOR_BY_KEY.get(k)!.hex);
  const heat = heatOf(p);
  return (
    <group name={id}>
      <Tube pts={leads[0]} color="#b9bec4" r={0.07} />
      <Tube pts={leads[1]} color="#b9bec4" r={0.07} />
      <group position={[mx, h, mz]} rotation={[0, ang, 0]} {...hover}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.36, bodyLen - 0.72, 6, 16]} />
          <meshStandardMaterial color="#e6cc9a" roughness={0.6} emissive={lit ? AMBER : HEAT_GLOW[heat]} emissiveIntensity={lit ? 0.45 : heat === 'ok' ? 0 : 0.6} />
        </mesh>
        {bands.map((c, i) => (
          <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[bandX(bodyLen, bands.length, i), 0, 0]}>
            <cylinderGeometry args={[0.375, 0.375, 0.13, 18]} />
            <meshStandardMaterial color={c} roughness={0.5} metalness={i === bands.length - 1 ? 0.5 : 0} />
          </mesh>
        ))}
        <mesh visible={false}>
          <boxGeometry args={[bodyLen + 0.4, 1.1, 1.1]} />
        </mesh>
      </group>
      <Html position={[mx, h + 1.15, mz + tagDz]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w27-tag ${lit ? 'lit' : ''} heat-${heat}`}>{tag}</div>
      </Html>
      {heat === 'smoke' && (
        <Html position={[mx, h + 0.4, mz]} center zIndexRange={[19, 0]} style={{ pointerEvents: 'none' }}>
          <Smoke />
        </Html>
      )}
    </group>
  );
}

/** 3296-style 10 kΩ multi-turn trimmer wired as a rheostat: pin 1 in c26 (port a), wiper in
 *  c27 (tied to port b by an orange jumper e27–e29), pin 3 in c28 left open. */
function Pot3D({ kohm, p, hit }: { kohm: number; p: number; hit: boolean }) {
  const isLit = useIsLit();
  const lit = isLit('lab_pot', 'hl_load');
  const hover = useHover3D(['lab_pot']);
  const x = colX(27);
  const z = ROW_Z.c;
  const heat = heatOf(p);
  const turn = (kohm / POT.max) * Math.PI * 2 * 3;
  return (
    <group name="lab_pot">
      {[26, 27, 28].map((c) => (
        <mesh key={c} position={[colX(c), 0.1, z]}>
          <boxGeometry args={[0.14, 0.9, 0.08]} />
          <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <group {...hover}>
        <mesh position={[x, 2.15, z]}>
          <boxGeometry args={[3.7, 3.7, 1.8]} />
          <meshStandardMaterial color="#2f62c9" roughness={0.55} emissive={lit ? AMBER : HEAT_GLOW[heat]} emissiveIntensity={lit ? 0.35 : heat === 'ok' ? 0 : 0.5} />
        </mesh>
        <group position={[x + 1.25, 4.1, z]} rotation={[0, turn, 0]}>
          <mesh>
            <cylinderGeometry args={[0.42, 0.42, 0.3, 18]} />
            <meshStandardMaterial color="#d6b35a" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.7, 0.06, 0.12]} />
            <meshStandardMaterial color="#5a4413" />
          </mesh>
        </group>
      </group>
      <Html position={[x, 5.2, z]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w27-tag ${lit ? 'lit' : ''} ${hit ? 'good' : ''}`}>10 kΩ 电位器 · {kohm.toFixed(1)} kΩ</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- the bench supply (src/stage/bench) and the 2 mA module */

/** both leads pass the box's right front corner, then run over the board's left end to the top rails */
const SUPPLY_VIA: Record<'red' | 'black', V3[]> = {
  red: [
    [-35.2, 1.4, 1.0],
    [-33.6, 1.9, -3.5],
  ],
  black: [
    [-35.6, 1.0, 0.6],
    [-34, 1.3, -3.5],
  ],
};

function Supply({ iSupply }: { iSupply: number }) {
  return (
    <BenchSupply
      id="lab_supply"
      litIds={['hl_vs']}
      position={[-41, -4.5]}
      channels={[{ ...SUPPLY, readout: `${fmtA(iSupply)} · CV` }]}
      leads={[
        { from: '+', to: 'T+4', via: SUPPLY_VIA.red },
        { from: '-', to: 'T-5', via: SUPPLY_VIA.black },
      ]}
    />
  );
}

const MOD = { x: -16.5, z: -15.6 };

function CurrentModule({ amps, lit }: { amps: number; lit: boolean }) {
  const hover = useHover3D(['lab_isrc', 'hl_is']);
  const red = useMemo<V3[]>(() => {
    const [x, z] = hole('a17');
    return [
      [MOD.x + 0.6, -0.4, MOD.z + 1.4],
      [MOD.x + 0.9, 1.2, MOD.z + 3.6],
      [x, 2.0, z - 1.6],
      [x, 0.5, z],
      [x, -0.3, z],
    ];
  }, []);
  const black = useMemo<V3[]>(() => {
    const [x, z] = hole('T-18');
    return [
      [MOD.x + 1.8, -0.4, MOD.z + 1.4],
      [MOD.x + 2.2, 0.6, MOD.z + 3.4],
      [x, 1.0, z - 1.2],
      [x, 0.4, z],
      [x, -0.3, z],
    ];
  }, []);
  return (
    <group name="lab_isrc">
      <group {...hover}>
        <mesh position={[MOD.x, -0.85, MOD.z]}>
          <boxGeometry args={[4.6, 0.25, 3.2]} />
          <meshStandardMaterial color="#1f7a4d" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.4 : 0} />
        </mesh>
        <mesh position={[MOD.x - 0.8, -0.45, MOD.z - 0.2]}>
          <boxGeometry args={[1.7, 0.55, 1.2]} />
          <meshStandardMaterial color="#202226" roughness={0.5} />
        </mesh>
        <mesh position={[MOD.x + 1.2, -0.4, MOD.z + 1.05]}>
          <boxGeometry args={[2.0, 0.7, 0.9]} />
          <meshStandardMaterial color="#2a6fd6" roughness={0.5} />
        </mesh>
      </group>
      <Tube pts={red} color={WIRE.red} r={0.1} lit={lit} />
      <Tube pts={black} color={WIRE.black} r={0.1} />
      <Html position={[MOD.x, 1.0, MOD.z - 0.8]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w27-tag mod ${lit ? 'lit' : ''}`}>{amps >= 1 ? `${amps} A` : `${amps * 1000} mA`} 恒流源模块</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- multimeter */

const DMM_TILT = 1.2;
const DMM_SIZE = { w: 8, h: 11, t: 1.4 };
const DMM_Y = 1.6;
const DMM_Z = 17;
const DMM_X = colX(31);
const JACK_X = { mA: -2.4, COM: 0, V: 2.4 };

function dmmWorld(local: V3): V3 {
  const [x, y, z] = local;
  const c = Math.cos(DMM_TILT);
  const s = Math.sin(DMM_TILT);
  return [DMM_X + x, DMM_Y + y * c + z * s, DMM_Z - y * s + z * c];
}

function Probe({ at, color, jack, lit }: { at: string; color: 'red' | 'black'; jack: number; lit: boolean }) {
  const [x, z] = hole(at);
  const j = dmmWorld([jack, -4.1, DMM_SIZE.t / 2 + 0.1]);
  const j2 = dmmWorld([jack, -4.1, DMM_SIZE.t / 2 + 1.4]);
  const pts = useMemo<V3[]>(() => [[x, 4.3, z], [x, 5.8, z + 1.2], [x + (DMM_X - x) * 0.25, 3.4, 13.5], [DMM_X + 5.2 + jack * 0.3, 1.0, j[2] + 1.2], j2, j], [x, z, jack, j, j2]);
  const hex = color === 'red' ? '#d62f2f' : '#24262b';
  return (
    <group>
      <mesh position={[x, 0.7, z]}>
        <cylinderGeometry args={[0.06, 0.03, 2.0, 8]} />
        <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[x, 2.9, z]}>
        <cylinderGeometry args={[0.26, 0.22, 2.8, 14]} />
        <meshStandardMaterial color={hex} roughness={0.45} emissive={lit ? hex : '#000000'} emissiveIntensity={lit ? 0.6 : 0} />
      </mesh>
      <Tube pts={pts} color={hex} r={0.1} />
    </group>
  );
}

interface Reading {
  range: 'V' | 'mA';
  display: string;
  unit: string;
  blown: boolean;
  good: boolean;
}

function readingOf(mode: LabMode, l: Lab): Reading {
  if (mode === 'short') {
    const blown = l.il > 0.2;
    return { range: 'mA', display: blown ? 'FUSE' : (l.il * 1000).toFixed(2), unit: blown ? '' : 'mA', blown, good: false };
  }
  return { range: 'V', display: l.va.toFixed(2), unit: 'V', blown: false, good: mode === 'half' && halfHit(l) };
}

function Meter3D({ r, lit }: { r: Reading; lit: boolean }) {
  const lcd = dmmWorld([0, 2.6, DMM_SIZE.t / 2 + 0.05]);
  const jacksAt = dmmWorld([0, -3.1, DMM_SIZE.t / 2 + 0.1]);
  const hover = useHover3D(['lab_dmm']);
  return (
    <group name="lab_dmm">
      <group position={[DMM_X, DMM_Y, DMM_Z]} rotation={[-DMM_TILT, 0, 0]} {...hover}>
        <mesh>
          <boxGeometry args={[DMM_SIZE.w, DMM_SIZE.h, DMM_SIZE.t]} />
          <meshStandardMaterial color="#f2c230" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.2, DMM_SIZE.t / 2 + 0.01]}>
          <planeGeometry args={[DMM_SIZE.w - 1.0, DMM_SIZE.h - 1.0]} />
          <meshStandardMaterial color="#2b2f36" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.6, DMM_SIZE.t / 2 + 0.02]}>
          <planeGeometry args={[6, 2.4]} />
          <meshStandardMaterial color={lit ? '#d8f5c8' : '#b9c7a3'} />
        </mesh>
        <mesh position={[0, -0.8, DMM_SIZE.t / 2 + 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.3, 28]} />
          <meshStandardMaterial color="#3d434d" />
        </mesh>
        <mesh position={[r.range === 'V' ? 0.9 : -0.9, 0.1, DMM_SIZE.t / 2 + 0.32]} rotation={[0, 0, r.range === 'V' ? -0.8 : 0.8]}>
          <boxGeometry args={[0.24, 1.3, 0.1]} />
          <meshStandardMaterial color="#f2f2f2" />
        </mesh>
        {(['mA', 'COM', 'V'] as const).map((k) => (
          <mesh key={k} position={[JACK_X[k], -4.1, DMM_SIZE.t / 2 + 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.2, 16]} />
            <meshStandardMaterial color={k === 'COM' ? '#111' : '#b3261e'} />
          </mesh>
        ))}
      </group>
      <Html position={lcd} center zIndexRange={[25, 0]}>
        <div className={`w27-lcd ${lit ? 'lit' : ''} ${r.blown ? 'bad' : ''} ${r.good ? 'good' : ''}`} tabIndex={0} {...hov(['lab_dmm'])}>
          <small>{r.range === 'V' ? 'DC V' : 'DC mA'}</small>
          <b>{r.display}</b>
          <span>{r.unit}</span>
        </div>
      </Html>
      <Html position={jacksAt} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w27-jacks">
          <span className={r.range === 'mA' ? 'on' : ''}>mA</span>
          <span className="on">COM</span>
          <span className={r.range === 'V' ? 'on' : ''}>VΩ</span>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- glow on lit strips and rails */

function Glow({ lit }: { lit: string[] }) {
  const has = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const quads: { x: number; z: number; w: number; d: number; color: string }[] = [];
  const strip = (c: number, color = AMBER) => quads.push({ x: colX(c), z: -3.5, w: 0.86, d: 5.0, color });
  const rail = (z: number, color: string) => quads.push({ x: (colX(3) + colX(61)) / 2, z, w: colX(61) - colX(3) + 1.2, d: 0.86, color });
  if (has('hl_node1')) strip(17);
  if (has('hl_port', 'lab_dmm')) {
    strip(26);
    strip(29);
  }
  if (has('lab_supply', 'hl_vs')) {
    rail(RAIL_Z.tp, '#ff4d5e');
    rail(RAIL_Z.tn, '#4f86ff');
  }
  return (
    <>
      {quads.map((q, i) => (
        <mesh key={i} position={[q.x, 0.03, q.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
          <planeGeometry args={[q.w, q.d]} />
          <meshBasicMaterial color={q.color} transparent opacity={0.45} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

/* ------------------------------------------------------------- camera */

export type BenchCam = 'bench' | 'probe';
const VIEW_DIR = new THREE.Vector3(0, 1.55, 1).normalize();
const FRAMES: Record<BenchCam, { x: [number, number]; z: [number, number] }> = {
  bench: { x: [-47, 4.5], z: [-17.5, 21.5] },
  probe: { x: [-21, 4.5], z: [-10, 22] },
};

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: (typeof FRAMES)[BenchCam]): { pos: THREE.Vector3; target: THREE.Vector3 } {
  const target = new THREE.Vector3((f.x[0] + f.x[1]) / 2, 0.5, (f.z[0] + f.z[1]) / 2);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of f.x) for (const y of [-1, 5]) for (const z of f.z) corners.push(new THREE.Vector3(x, y, z));
  const v = new THREE.Vector3();
  let d = 12;
  for (; d < 300; d *= 1.04) {
    cam.position.copy(target).addScaledVector(VIEW_DIR, d);
    cam.lookAt(target);
    cam.updateMatrixWorld();
    if (corners.every((c) => (v.copy(c).project(cam), Math.abs(v.x) < 0.95 && Math.abs(v.y) < 0.9))) break;
  }
  return { pos: target.clone().addScaledVector(VIEW_DIR, d), target };
}

function CameraRig({ view }: { view: BenchCam }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const anim = useRef<{ t: number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3 } | null>(null);
  useEffect(() => {
    if (!controls) return;
    const { pos, target } = fitView(camera, aspect, FRAMES[view]);
    if (prefersReducedMotion()) {
      camera.position.copy(pos);
      controls.target.copy(target);
      controls.update();
      invalidate();
      return;
    }
    anim.current = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toP: pos, toT: target };
    invalidate();
  }, [view, controls, camera, invalidate, aspect]);
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

function PortTag({ col, text, lit }: { col: number; text: string; lit: boolean }) {
  return (
    <Html position={[colX(col), 0.6, ROW_Z.a - 1.6]} center zIndexRange={[20, 0]}>
      <div className={`bb3d-tag w27-tag port ${lit ? 'lit' : ''}`} {...hov(['hl_port'])}>
        {text}
      </div>
    </Html>
  );
}

function Scene({ mode, pot, l, view }: { mode: LabMode; pot: number; l: Lab; view: BenchCam }) {
  const lit = useLit();
  const isLit = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const r = readingOf(mode, l);
  const part = (id: string) => l.parts.find((p) => p.id === id);
  const k = l.k;
  const tagOf = (name: string, ohms: number) => `${name} ${fmtOhm(ohms)}`;
  const dmmLit = isLit('lab_dmm', 'hl_voc', 'vi_in', 'lab_short');
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      {/* the bench top */}
      <mesh position={[-8, -1.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 80]} />
        <meshStandardMaterial color="#e8dcc4" roughness={0.95} />
      </mesh>
      <Shell xray={0} />
      <Glow lit={lit} />
      <Supply iSupply={l.iSupply} />
      <CurrentModule amps={2 / k} lit={isLit('lab_isrc', 'hl_is')} />
      <Jumper from="T+10" to="a10" color="red" />
      <Jumper from="a23" to="T-23" color="black" />
      <Jumper from="a29" to="T-29" color="black" />
      <Resistor3D id="hl_r1" from="c10" to="c17" ohms={4 * k} p={part('hl_r1')!.p} tag={tagOf('R₁', 4 * k)} />
      <Resistor3D id="hl_r2" from="b17" to="b23" ohms={12 * k} p={part('hl_r2')!.p} h={1.9} tag={tagOf('R₂', 12 * k)} tagDz={-1.2} />
      <Resistor3D id="hl_r3" from="e17" to="e26" ohms={1 * k} p={part('hl_r3')!.p} tag={tagOf('R₃', 1 * k)} tagDz={1.6} />
      <PortTag col={26} text="a" lit={isLit('hl_port')} />
      <PortTag col={29} text="b" lit={isLit('hl_port')} />
      {mode === 'half' && (
        <>
          <Pot3D kohm={pot} p={part('lab_pot')?.p ?? 0} hit={halfHit(l)} />
          <Jumper from="e27" to="e29" color="orange" />
        </>
      )}
      {mode === 'two' && <Resistor3D id="lab_rl6k" from="c26" to="c29" ohms={RL_KNOWN * k} p={part('lab_rl6k')!.p} h={1.5} tag={`R_L ${fmtOhm(RL_KNOWN * k)}`} tagDz={1.4} />}
      <Probe at="d26" color="red" jack={r.range === 'V' ? JACK_X.V : JACK_X.mA} lit={dmmLit} />
      <Probe at="d29" color="black" jack={JACK_X.COM} lit={dmmLit} />
      <Meter3D r={r} lit={dmmLit} />
      <OrbitControls makeDefault enableDamping={false} minDistance={8} maxDistance={140} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig view={view} />
    </>
  );
}

/* ------------------------------------------------------------- HUD and layer */

const MODES: { value: LabMode; label: string; short: string }[] = [
  { value: 'open', label: '开路测 V_Th (30.00 V)', short: '开路 V_Th' },
  { value: 'half', label: '半压法调 R_L (15.00 V)', short: '半压法' },
  { value: 'two', label: '带载双点法 (R_L=6 kΩ)', short: '双点法' },
  { value: 'short', label: '安全限流测 I_N (7.50 mA)', short: '测 I_N' },
];

function Thermal({ l }: { l: Lab }) {
  const isLit = useIsLit();
  return (
    <div className={`w27-thermal ${isLit('lab_scale') ? 'lit' : ''}`} tabIndex={0} {...hov(['lab_scale'])}>
      <div className="w27-thermal-title">热感功耗 · 1/4 W 额定</div>
      {l.parts.map((p) => {
        const h = heatOf(p.p);
        return (
          <div key={p.id} className={`w27-thermal-row heat-${h}`}>
            <span>{p.name}</span>
            <i>
              <em style={{ width: `${Math.min(100, (p.p / P_MAX) * 100)}%` }} />
              <u />
            </i>
            <b>{fmtW(p.p)}</b>
          </div>
        );
      })}
    </div>
  );
}

function FormulaCard({ mode, l }: { mode: LabMode; l: Lab }) {
  const kohm = (x: number) => (x / 1000).toFixed(2);
  const safe = l.k === 1000;
  const rthTex = safe ? String.raw`${kohm(l.rth)}\text{ k}\Omega` : String.raw`${l.rth.toFixed(2)}\ \Omega`;
  let tex: string;
  let note: string | null = null;
  if (mode === 'open') tex = String.raw`V_{Th} = v_{oc} = ${l.va.toFixed(2)}\text{ V}`;
  else if (mode === 'half') {
    const r = safe ? (l.rl / 1000).toFixed(1) : l.rl.toFixed(1);
    tex = String.raw`V_L = 30 \times \dfrac{${r}}{4 + ${r}} = ${l.va.toFixed(2)}\text{ V}`;
    note = halfHit(l)
      ? `达标：V_L = V_Th / 2，断电后用欧姆档测电位器 → R_Th = R_L = ${safe ? `${(l.rl / 1000).toFixed(2)} kΩ` : `${l.rl.toFixed(2)} Ω`}`
      : '缓慢旋转电位器，直到读数恰好降为 15.00 V';
  } else if (mode === 'two') {
    const back = RL_KNOWN * (l.vth / l.va - 1);
    const res = safe ? String.raw`${back.toFixed(2)}\text{ k}\Omega` : String.raw`${back.toFixed(2)}\ \Omega`;
    tex = String.raw`R_{Th} = ${RL_KNOWN} \times \left(\dfrac{30}{${l.va.toFixed(0)}} - 1\right) = ${res}`;
  } else {
    const iN = safe ? String.raw`${(l.iN * 1000).toFixed(2)}\text{ mA}` : String.raw`${l.iN.toFixed(2)}\text{ A}`;
    tex = String.raw`I_N = ${iN} \Rightarrow R_{Th} = \dfrac{V_{Th}}{I_N} = ${rthTex}`;
  }
  return (
    <div className={`w27-formula ${mode === 'half' && halfHit(l) ? 'good' : ''}`}>
      <Tex tex={tex} />
      {note && <span>{note}</span>}
    </div>
  );
}

function Overload({ l, back }: { l: Lab; back: () => void }) {
  const p = l.hottest;
  return (
    <div className="w27-overload" role="alert">
      <b>
        {p.name} {fmtW(p.p)} OVERLOAD!
      </b>
      <p>
        原题 Ω 级阻值直插 32 V：{p.name} 功耗达到 1/4 W 额定的 {Math.round(p.p / P_MAX)} 倍，电阻瞬间烧毁、电源触发过流保护。禁止在烧毁态继续实验。
      </p>
      <button className="button primary" onClick={back}>
        切回 1000× 安全缩放
      </button>
    </div>
  );
}

export default function Bench3D() {
  useClearHoverOnUnmount();
  const [mode, setMode] = useStageParam<LabMode>('lab', DEFAULTS.lab);
  const [pot, setPot] = useStageParam<number>('pot', DEFAULTS.pot);
  const [scale, setScale] = useStageParam<Scale>('scale', DEFAULTS.scale);
  const [view] = useStageParam<BenchCam>('cam', 'bench');
  const isLit = useIsLit();
  const l = lab(mode, scale, pot);
  const r = readingOf(mode, l);
  return (
    <div className="w27-layer">
      <div className="w27-ctrl">
        <Seg label="实测模式" value={mode} onChange={setMode} options={MODES.map((m) => ({ ...m, hover: m.value === 'short' ? ['lab_short'] : ['lab_dmm'] }))} className="steps" />
        <div className="w27-row">
          <Seg
            label="阻值标度"
            value={scale}
            onChange={setScale}
            className="small"
            options={[
              { value: 'safe', label: '安全缩放 1000x (kΩ 级)', short: '1000× kΩ', hover: ['lab_scale'] },
              { value: 'orig', label: '原题直插预警演示 (Ω 级过热警示)', short: '原题 Ω 预警', tone: 'bad', hover: ['lab_scale'] },
            ]}
          />
          {mode === 'half' && (
            <Slider label="电位器 R_L" value={pot} min={POT.min} max={POT.max} step={POT.step} unit="kΩ" onChange={setPot} hover={['lab_pot']} fmt={(v) => v.toFixed(1)} />
          )}
        </div>
      </div>
      <div className="bb3d-wrap w27-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-20, 46, 40], fov: 38, near: 0.5, far: 500 }} className="bb3d-canvas">
          <Scene mode={mode} pot={pot} l={l} view={view} />
        </Canvas>
        <div className="w27-hud">
          <div className={`w27-reading ${r.blown ? 'bad' : ''} ${r.good ? 'good' : ''} ${isLit('lab_dmm') ? 'lit' : ''}`} aria-live="polite" tabIndex={0} {...hov(['lab_dmm'])}>
            <span>万用表 {r.range === 'V' ? 'DC V（a–b 并联）' : 'DC mA（短接 a–b）'}</span>
            <b>{r.blown ? '保险丝熔断' : `${r.display} ${r.unit}`}</b>
          </div>
          <div className={`w27-reading supply ${isLit('lab_supply', 'hl_vs') ? 'lit' : ''}`} tabIndex={0} {...hov(['lab_supply'])}>
            <span>{SUPPLY_NAME}</span>
            <b>输出 {fmtA(l.iSupply)}</b>
          </div>
          <Thermal l={l} />
        </div>
        {scale === 'orig' && <Overload l={l} back={() => setScale('safe')} />}
      </div>
      <FormulaCard mode={mode} l={l} />
      {mode === 'short' ? (
        <span className={`w27-notice warn ${isLit('lab_short') ? 'lit' : ''}`} tabIndex={0} {...hov(['lab_short'])}>
          短路警示：仅因本课已是 kΩ 级限流（I_N = 7.5 mA）才可用电流档短接 a–b；真实实验箱或未知内阻电源上严禁这样强测
        </span>
      ) : (
        <span className={`w27-notice ${scale === 'orig' ? 'bad' : ''} ${isLit('lab_scale') ? 'lit' : ''}`} tabIndex={0} {...hov(['lab_scale'])}>
          {scale === 'safe'
            ? '阻值已按教材 ×1000 等比例放大以保护实验箱：节点电压与 V_Th 不变，电流与功耗缩小 1000 倍'
            : '原题 Ω 级阻值：V_Th 不变，但电流与功耗放大 1000 倍，1/4 W 电阻全部超载'}
        </span>
      )}
    </div>
  );
}
