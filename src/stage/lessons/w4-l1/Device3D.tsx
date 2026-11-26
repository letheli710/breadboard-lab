// Layer "01 3D 瓷片/电解电容封装与面包板插法": a 104 ceramic disc or a 100 μF 25 V aluminium
// electrolytic on an 830-hole board, powered by a 台式可调直流电源（5 V） (the shared BenchSupply of
// src/stage/bench) standing on the bench and wired to the top rails by its own leads (+ → outer red
// rail = +5 V, − (COM) → inner blue rail = GND); 断电 turns its output off.
//
// Layout (column numbers; a–e upper half): a red jumper a30 → +5 V rail, a black jumper a31 → GND
// rail, so strip 30 (a–e) is +5 V and strip 31 is GND. The capacitor's legs go into c30 / c31:
// - 正确: long leg (+) in c30, short leg (−, white stripe side) in c31;
// - 反接: turned round — the stripe leg on +5 V: alarm, the vent bulges;
// - 同列: both legs in strip 30 (b30, c30): shorted by the strip, it never charges (0 V).
// The 1 kΩ discharge resistor stands up across d30–d31. Off the supply, the electrolytic keeps
// its charge until the resistor drains it (τ = 1 kΩ × 100 μF = 0.1 s).
// Camera: the bench (supply + board), a close-up of the part, and the part lifted off the board
// to show the long / short legs.

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, D, Lead, RAIL_Z, ROW_Z, Shell, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { BenchSupply, supplyLabel, supplyLcd, type LcdLine, type SupplyChannel, type SupplyLead } from '../../bench';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { BENCH_V, deratingOk, DEVICES, energy, fmtV, fmtW, R_DISCHARGE, type DeviceKey } from './model';
import { Cell, hoverProps, Seg, useClearHoverOnUnmount, useIsLit } from './state';

type V3 = [number, number, number];
export type Cam1 = 'bench' | 'device' | 'hand';
export type Insert = 'ok' | 'rev' | 'same';

const AMBER = '#f59e0b';
const POS_COL = 30;
const NEG_COL = 31;

/* ------------------------------------------------------------- holes, rails and picking */

const RAIL_OF: Partial<Record<Rail, string>> = { tp: 'rail_p5', tn: 'rail_gnd' };
const RAIL_COLOR: Record<string, string> = { rail_p5: '#e11d48', rail_gnd: '#2b59c3' };

/** Board coordinates of a hole: "c30", "T+30" (top outer rail, +5 V), "T-31" (top inner rail, GND). */
function hole(h: string): [number, number] {
  const m = /^T([+-])(\d+)$/.exec(h);
  if (m) return [colX(Number(m[2])), RAIL_Z[m[1] === '+' ? 'tp' : 'tn']];
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

function pick(x: number, z: number): string[] | null {
  const c = Math.round(x + 32);
  if (Math.abs(z) < 0.95) return ['center_trench'];
  for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 2 && c <= 62) return RAIL_OF[r] ? [RAIL_OF[r]] : null;
  if (c < 1 || c > 63) return null;
  const half = z <= -1 && z >= -6 ? 'u' : z >= 1 && z <= 6 ? 'l' : null;
  if (!half) return null;
  if (half === 'u' && c === POS_COL) return [stripId('u', c), 'node_p'];
  if (half === 'u' && c === NEG_COL) return [stripId('u', c), 'node_n'];
  return [stripId(half, c)];
}

function glowOf(lit: string[]): string[] {
  const g = new Set(lit.filter((id) => /^strip_|^rail_/.test(id)));
  for (const id of lit) {
    if (id === 'node_p' || id === 'jump_red') g.add(stripId('u', POS_COL));
    if (id === 'node_n' || id === 'jump_black') g.add(stripId('u', NEG_COL));
    if (id === 'psu') ['rail_p5', 'rail_gnd'].forEach((r) => g.add(r));
  }
  return [...g];
}

function Glow({ ids }: { ids: string[] }) {
  const quads: { x: number; z: number; w: number; d: number; color: string }[] = [];
  for (const id of ids) {
    const m = /^strip_([ul])_(\d+)$/.exec(id);
    if (m) quads.push({ x: colX(Number(m[2])), z: m[1] === 'u' ? -3.5 : 3.5, w: 0.86, d: 5.0, color: AMBER });
    for (const r of Object.keys(RAIL_Z) as Rail[])
      if (RAIL_OF[r] === id) quads.push({ x: (colX(3) + colX(61)) / 2, z: RAIL_Z[r], w: colX(61) - colX(3) + 1.2, d: 0.86, color: RAIL_COLOR[id] });
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

/** Cover the printed +/− signs of the bottom rails (not used here) and tag the two top rails. */
function RailTags({ lit }: { lit: string[] }) {
  const tags = [
    { id: 'rail_p5', text: '+5 V', col: 20, r: 'tp' as Rail },
    { id: 'rail_gnd', text: 'GND', col: 20, r: 'tn' as Rail },
  ];
  return (
    <>
      {tags.map((t) => (
        <Html key={t.id} position={[colX(t.col), 0.3, RAIL_Z[t.r]]} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`w41-rtag ${t.id} ${lit.includes(t.id) ? 'lit' : ''}`}>{t.text}</div>
        </Html>
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
    return new THREE.TubeGeometry(curve, 64, r, 8, false);
  }, [pts, r]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.5} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.7 : 0} />
    </mesh>
  );
}

const WIRE = { red: '#d62f2f', black: '#24262b' };

const hover3d = (ids: string[]) => ({
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    useStage.getState().setHover(ids);
  },
  onPointerOut: () => useStage.getState().setHover(null),
});

function Jumper({ from, to, color, lit, ids }: { from: string; to: string; color: keyof typeof WIRE; lit?: boolean; ids: string[] }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(from);
    const [x2, z2] = hole(to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const h = Math.min(3, Math.max(0.9, 0.35 + 0.25 * dist));
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.4, z1], at(0.2, h * 0.92), at(0.5, h), at(0.8, h * 0.92), [x2, 0.4, z2], [x2, -0.3, z2]];
  }, [from, to]);
  return (
    <group {...hover3d(ids)}>
      <Tube pts={pts} color={WIRE[color]} r={0.13} lit={lit} />
    </group>
  );
}

function Tag({ at, text, cls = '', lit }: { at: V3; text: string; cls?: string; lit?: boolean }) {
  return (
    <Html position={at} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`bb3d-tag w41-tag3 ${cls} ${lit ? 'lit' : ''}`}>{text}</div>
    </Html>
  );
}

/* ------------------------------------------------------------- the capacitors */

/** the electrolytic's printed sleeve: dark blue, the white stripe with "−" marks at u = 0.125
 *  (45° from +z towards +x: the negative leg's side), the value along the height */
function sleeveTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#2547b8';
  g.fillRect(0, 0, 512, 256);
  const x0 = 0.055 * 512;
  const x1 = 0.195 * 512;
  g.fillStyle = '#e8ebef';
  g.fillRect(x0, 0, x1 - x0, 256);
  g.fillStyle = '#1e293b';
  for (let k = 0; k < 5; k++) g.fillRect((x0 + x1) / 2 - 16, 30 + k * 46, 32, 9);
  g.save();
  g.translate(0.9 * 512, 128);
  g.rotate(-Math.PI / 2);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '700 30px sans-serif';
  g.fillText('100μF 25V', 0, 0);
  g.restore();
  g.save();
  g.translate(0.55 * 512, 128);
  g.rotate(-Math.PI / 2);
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '700 26px sans-serif';
  g.fillText('105°C  100μF', 0, 0);
  g.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const BODY_R = 1.25;
const BODY_H = 4.4;

function Electrolytic({ y0, lit, alarm, hand }: { y0: number; lit: (...ids: string[]) => boolean; alarm: boolean; hand: boolean }) {
  const tex = useMemo(sleeveTexture, []);
  useEffect(() => () => tex.dispose(), [tex]);
  const body = lit('cap_elec');
  const stripe = lit('stripe');
  const vent = lit('vent');
  const pos = lit('lead_pos');
  const neg = lit('lead_neg');
  const top = y0 + BODY_H;
  // legs: + (local x = −0.5) is the long one
  const legPos: V3[] = hand
    ? [
        [-0.5, y0, 0],
        [-0.5, y0 - 7.5, 0],
      ]
    : [
        [-0.5, y0, 0],
        [-0.5, 0.95, 0],
        [-0.8, 0.6, 0],
        [-0.5, 0.25, 0],
        [-0.5, -0.3, 0],
      ];
  const legNeg: V3[] = hand
    ? [
        [0.5, y0, 0],
        [0.5, y0 - 4.5, 0],
      ]
    : [
        [0.5, y0, 0],
        [0.5, -0.3, 0],
      ];
  return (
    <group name="mesh_cap_elec">
      <group {...hover3d(['lead_pos'])}>
        <Lead pts={legPos} />
        {pos && (
          <mesh position={[-0.5, hand ? y0 - 3.75 : 0.5, 0]}>
            <cylinderGeometry args={[0.16, 0.16, hand ? 7.5 : 1.6, 10]} />
            <meshBasicMaterial color={AMBER} transparent opacity={0.6} />
          </mesh>
        )}
      </group>
      <group {...hover3d(['lead_neg'])}>
        <Lead pts={legNeg} />
        {neg && (
          <mesh position={[0.5, hand ? y0 - 2.25 : 0.5, 0]}>
            <cylinderGeometry args={[0.16, 0.16, hand ? 4.5 : 1.6, 10]} />
            <meshBasicMaterial color={AMBER} transparent opacity={0.6} />
          </mesh>
        )}
      </group>
      <mesh position={[0, y0 + BODY_H / 2, 0]} {...hover3d(['cap_elec'])}>
        <cylinderGeometry args={[BODY_R, BODY_R, BODY_H, 40, 1, true]} />
        <meshStandardMaterial map={tex} roughness={0.45} emissive={alarm ? '#dc2626' : '#000000'} emissiveIntensity={alarm ? 0.55 : 0} side={THREE.DoubleSide} />
      </mesh>
      {/* lit: an amber halo around the can (keeps the sleeve's blue) */}
      {body && !alarm && (
        <mesh position={[0, y0 + BODY_H / 2, 0]}>
          <cylinderGeometry args={[BODY_R + 0.16, BODY_R + 0.16, BODY_H + 0.3, 40, 1, true]} />
          <meshBasicMaterial color={AMBER} transparent opacity={0.28} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      )}
      {/* the stripe as its own (hoverable, lightable) band over the sleeve */}
      <mesh position={[0, y0 + BODY_H / 2, 0]} {...hover3d(['stripe'])}>
        <cylinderGeometry args={[BODY_R + 0.02, BODY_R + 0.02, BODY_H - 0.2, 16, 1, true, 0.055 * 2 * Math.PI, 0.14 * 2 * Math.PI]} />
        <meshBasicMaterial color={AMBER} transparent opacity={stripe ? 0.45 : 0} depthWrite={false} />
      </mesh>
      {/* bottom rubber seal */}
      <mesh position={[0, y0 + 0.05, 0]}>
        <cylinderGeometry args={[BODY_R - 0.05, BODY_R - 0.05, 0.12, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      {/* aluminium top with the vent cross; it bulges when the part is reversed under power */}
      <group position={[0, top, 0]} {...hover3d(['vent'])}>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[BODY_R - 0.06, BODY_R - 0.06, 0.08, 36]} />
          <meshStandardMaterial color="#dfe3e8" metalness={0.25} roughness={0.35} emissive={vent ? AMBER : '#000000'} emissiveIntensity={vent ? 0.5 : 0} />
        </mesh>
        {alarm && (
          <mesh position={[0, 0.06, 0]} scale={[1, 0.5, 1]}>
            <sphereGeometry args={[BODY_R - 0.08, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#c7ccd3" metalness={0.6} roughness={0.35} emissive="#dc2626" emissiveIntensity={0.35} />
          </mesh>
        )}
        {[Math.PI / 4, -Math.PI / 4].map((a) => (
          <mesh key={a} position={[0, alarm ? 0.62 : 0.08, 0]} rotation={[0, a, 0]}>
            <boxGeometry args={[1.9, 0.05, 0.08]} />
            <meshStandardMaterial color={alarm ? '#7f1d1d' : '#5b6168'} />
          </mesh>
        ))}
        {alarm &&
          [0, 1, 2, 3, 4].map((k) => (
            <mesh key={k} position={[Math.cos(k * 1.3) * 0.5, 1.1 + k * 0.45, Math.sin(k * 1.3) * 0.5]}>
              <sphereGeometry args={[0.28 + k * 0.06, 12, 8]} />
              <meshBasicMaterial color="#f87171" transparent opacity={0.32 - k * 0.04} depthWrite={false} />
            </mesh>
          ))}
      </group>
    </group>
  );
}

function Ceramic({ y0, lit, hand }: { y0: number; lit: (...ids: string[]) => boolean; hand: boolean }) {
  const on = lit('cap_cer');
  const r = 1.3;
  const cy = y0 + r + 0.2;
  const leg = (x: number): V3[] =>
    hand
      ? [
          [x * 0.6, cy - r * 0.6, 0],
          [x, y0 - 0.2, 0],
          [x, y0 - 6.2, 0],
        ]
      : [
          [x * 0.6, cy - r * 0.6, 0],
          [x, y0 - 0.2, 0],
          [x, -0.3, 0],
        ];
  return (
    <group name="mesh_cap_cer" {...hover3d(['cap_cer'])}>
      <Lead pts={leg(-0.5)} />
      <Lead pts={leg(0.5)} />
      <mesh position={[0, cy, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.45, 36]} />
        <meshStandardMaterial color="#c8892e" roughness={0.6} emissive={on ? AMBER : '#000000'} emissiveIntensity={on ? 0.4 : 0} />
      </mesh>
      <Html position={[0, cy, 0.3]} center zIndexRange={[17, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w41-cer-code">104</div>
      </Html>
    </group>
  );
}

/** the 1 kΩ discharge resistor standing up across d30–d31 */
function DischargeR({ lit }: { lit: boolean }) {
  const [x0, z0] = hole(`d${POS_COL}`);
  const [x1, z1] = hole(`d${NEG_COL}`);
  const y0 = 0.6;
  const y1 = 2.9;
  const L = y1 - y0;
  const bands = ['#7a4a1f', '#151515', '#c62828', '#d4a72c'];
  return (
    <group name="mesh_r_discharge" {...hover3d(['r_dis'])}>
      <Lead
        pts={[
          [x0, -0.3, z0],
          [x0, y0, z0],
        ]}
      />
      <Lead
        pts={[
          [x0, y1, z0],
          [x0, y1 + 0.4, z0],
          [x1, y1 + 0.4, z1],
          [x1, -0.3, z1],
        ]}
      />
      <group position={[x0, (y0 + y1) / 2, z0]}>
        <mesh>
          <capsuleGeometry args={[0.34, L - 0.68, 6, 16]} />
          <meshStandardMaterial color="#e6cc9a" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.45 : 0} />
        </mesh>
        {bands.map((c, i) => (
          <mesh key={i} position={[0, L / 2 - 0.42 - i * 0.34 - (i === 3 ? 0.3 : 0), 0]}>
            <cylinderGeometry args={[0.355, 0.355, 0.15, 18]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- the bench supply (src/stage/bench) */

const CHANNELS: SupplyChannel[] = [{ v: BENCH_V, limit: 0.05 }];
/** 「台式可调直流电源（5 V）」 */
export const SUPPLY_NAME = supplyLabel(CHANNELS);
/** the supply left of the board, turned 45° so its binding posts face the board and its display
 *  the viewer; the + lead lands a few columns on so the two leads do not cross */
const PSU_AT: [number, number] = [-40, -5];
const PSU_LEADS: SupplyLead[] = [
  { from: '+', to: 'T+6', litIds: ['rail_p5'] },
  { from: '-', to: 'T-4', litIds: ['rail_gnd'] },
];
/** 断电: the output is off, the display turns rose and reads OFF */
const OFF_LCD: LcdLine[] = [{ text: 'OFF', strong: true }, ...supplyLcd(CHANNELS).slice(1)];

/* ------------------------------------------------------------- camera */

interface Frame {
  x: [number, number];
  y: [number, number];
  z: [number, number];
  dir: [number, number, number];
}
const FRAMES: Record<Cam1, Frame> = {
  bench: { x: [-47, 3], y: [-1, 5], z: [-12, 1], dir: [0, 1.7, 1] },
  device: { x: [-4.5, 1.8], y: [-0.5, 6.4], z: [-9.8, -2.5], dir: [0.35, 0.8, 1] },
  hand: { x: [-5, 3], y: [-0.5, 16], z: [-6, -2], dir: [0.15, 0.3, 1] },
};

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: Frame): [THREE.Vector3, THREE.Vector3] {
  const dir = new THREE.Vector3(...f.dir).normalize();
  const target = new THREE.Vector3((f.x[0] + f.x[1]) / 2, (f.y[0] + f.y[1]) / 2, (f.z[0] + f.z[1]) / 2);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of f.x) for (const y of f.y) for (const z of f.z) corners.push(new THREE.Vector3(x, y, z));
  const v = new THREE.Vector3();
  let d = 6;
  for (; d < 260; d *= 1.04) {
    cam.position.copy(target).addScaledVector(dir, d);
    cam.lookAt(target);
    cam.updateMatrixWorld();
    if (corners.every((p) => (v.copy(p).project(cam), Math.abs(v.x) < 0.92 && Math.abs(v.y) < 0.86))) break;
  }
  return [target.clone().addScaledVector(dir, d), target];
}

function CameraRig({ frame, nonce }: { frame: Cam1; nonce: number }) {
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

/* ------------------------------------------------------------- the bench state */

export interface Bench {
  dev: DeviceKey;
  ins: Insert;
  pwr: boolean;
  dis: boolean;
  /** voltage across the part, + leg minus − leg (V) */
  vc: number;
  alarm: boolean;
  shorted: boolean;
}

/** v_C: on the supply it follows the insertion; off the supply it keeps its charge, or decays
 *  through the 1 kΩ resistor with τ = R C (animated). */
function useBench(): Bench & { set: (p: Record<string, unknown>) => void } {
  const [dev] = useStageParam<DeviceKey>('dev', 'elec');
  const [ins] = useStageParam<Insert>('ins', 'ok');
  const [pwr] = useStageParam('pwr', true);
  const [dis] = useStageParam('dis', false);
  const set = useStage((s) => s.setParams);
  const shorted = ins === 'same';
  const polar = dev === 'elec';
  const vOn = shorted ? 0 : ins === 'rev' && polar ? -BENCH_V : BENCH_V;
  const [vOff, setVOff] = useState(vOn);
  const hold = useRef(vOn);
  useEffect(() => {
    if (pwr) {
      hold.current = vOn;
      setVOff(vOn);
    }
  }, [pwr, vOn]);
  useEffect(() => {
    if (pwr || !dis) return;
    const v0 = hold.current;
    const tau = R_DISCHARGE * DEVICES[dev].C;
    if (prefersReducedMotion() || tau < 1e-3) {
      hold.current = 0;
      setVOff(0);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const v = v0 * Math.exp(-(now - start) / 1000 / tau);
      hold.current = Math.abs(v) < 0.005 ? 0 : v;
      setVOff(hold.current);
      if (hold.current !== 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pwr, dis, dev]);
  const vc = pwr ? vOn : vOff;
  return { dev, ins, pwr, dis, vc, alarm: pwr && polar && ins === 'rev', shorted, set };
}

/* ------------------------------------------------------------- the scene */

function Scene({ b, frame, nonce }: { b: Bench; frame: Cam1; nonce: number }) {
  const litIds = useLit();
  const setHover = useStage((s) => s.setHover);
  const lit = (...ids: string[]) => ids.some((id) => litIds.includes(id));
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
  const hand = frame === 'hand';
  const close = frame !== 'bench';
  // the part: centre and turn (legs at local x = ∓0.5, + leg first)
  const cx = b.ins === 'same' ? colX(POS_COL) : (colX(POS_COL) + colX(NEG_COL)) / 2;
  const cz = b.ins === 'same' ? (ROW_Z.b + ROW_Z.c) / 2 : ROW_Z.c;
  const rot = b.ins === 'same' ? -Math.PI / 2 : b.ins === 'rev' ? Math.PI : 0;
  const y0 = hand ? 9.5 : 1.3;
  const elec = b.dev === 'elec';
  const topY = y0 + (elec ? BODY_H : 3);
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Shell xray={0} />
      <Glow ids={glowOf(litIds)} />
      <RailTags lit={litIds} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <BenchSupply id="psu" position={PSU_AT} yaw={Math.PI / 4} channels={CHANNELS} off={!b.pwr} lcd={b.pwr ? undefined : OFF_LCD} leads={PSU_LEADS} />
      <Jumper from={`a${POS_COL}`} to={`T+${POS_COL}`} color="red" lit={lit('jump_red', 'node_p')} ids={['jump_red']} />
      <Jumper from={`a${NEG_COL}`} to={`T-${NEG_COL}`} color="black" lit={lit('jump_black', 'node_n')} ids={['jump_black']} />
      {b.dis && <DischargeR lit={lit('r_dis')} />}
      <group position={[cx, 0, cz]} rotation={[0, rot, 0]}>
        {elec ? <Electrolytic y0={y0} lit={lit} alarm={b.alarm} hand={hand} /> : <Ceramic y0={y0} lit={lit} hand={hand} />}
        {close && elec && (
          <>
            <Tag at={[hand ? -2.2 : -0.9, hand ? y0 - 7.3 : 0.9, 0.7]} text="长脚 = 正极（+）" cls="pos" lit={lit('lead_pos')} />
            <Tag at={[hand ? 2.2 : 1.1, hand ? y0 - 4.3 : 0.2, 0.9]} text="短脚 = 负极（−）" cls="neg" lit={lit('lead_neg')} />
            <Tag at={[1.6, y0 + BODY_H * 0.62, 1.2]} text="白条 = 负极（−）" cls="neg" lit={lit('stripe')} />
            <Tag at={[0, topY + (b.alarm ? 1.6 : 0.7), 0]} text={b.alarm ? '防爆纹鼓包！' : '十字防爆纹'} cls={b.alarm ? 'bad' : 'vent'} lit={lit('vent')} />
          </>
        )}
        {close && !elec && <Tag at={[0, topY + 0.8, 0]} text="104 = 0.1 μF · 无极性" cls="cer" lit={lit('cap_cer')} />}
      </group>
      {!close && <Tag at={[cx, topY + 1.4, cz]} text={elec ? '100 μF 25 V 铝电解' : '104 瓷片 0.1 μF'} cls={elec ? 'elec' : 'cer'} lit={lit('cap_elec', 'cap_cer')} />}
      {b.alarm && <Tag at={[cx + 3.2, topY + 2.6, cz]} text="极性反接！氧化膜击穿 → 漏电流激增、鼓包" cls="bad alarm" />}
      {b.shorted && b.pwr && <Tag at={[cx + 2.6, topY + 1.8, cz]} text="两脚插在同一列：被短路，电容两端 0 V" cls="bad" />}
      <OrbitControls makeDefault enableDamping={false} minDistance={4} maxDistance={120} maxPolarAngle={Math.PI * 0.49} />
      <CameraRig frame={frame} nonce={nonce} />
    </>
  );
}

/* ------------------------------------------------------------- HUD and layer */

function status(b: Bench): { text: string; tone: string } {
  if (b.alarm) return { text: '反接报警', tone: 'bad' };
  if (b.shorted) return { text: '同列短路', tone: 'bad' };
  if (!b.pwr) return Math.abs(b.vc) > 0.05 ? { text: '断电残留', tone: 'warn' } : { text: '已放电', tone: 'good' };
  if (b.dev === 'cer' && b.ins === 'rev') return { text: '无极性 · 正常', tone: 'good' };
  return { text: '正常充电', tone: 'good' };
}

export default function Device3D() {
  const b = useBench();
  useClearHoverOnUnmount();
  const [frame, setFrame] = useStageParam<Cam1>('cam1', 'bench');
  const [nonce, setNonce] = useStageParam('camNonce1', 0);
  const on = useIsLit();
  const d = DEVICES[b.dev];
  const st = status(b);
  const w = energy(d.C, b.vc);
  const tau = R_DISCHARGE * d.C;
  return (
    <div className="w41-layer">
      <div className="w41-dock">
        <Seg<DeviceKey>
          label="器件"
          value={b.dev}
          onChange={(v) => b.set({ dev: v })}
          options={[
            { value: 'cer', label: '104 瓷片（无极性）', short: '104 瓷片', hover: ['cap_cer'] },
            { value: 'elec', label: '100 μF 25 V 电解', short: '电解', hover: ['cap_elec'] },
          ]}
        />
        <Seg<Insert>
          label="插法"
          value={b.ins}
          onChange={(v) => b.set({ ins: v })}
          options={[
            { value: 'ok', label: '长脚接 +5 V', short: '正确', hover: ['lead_pos', 'node_p'] },
            { value: 'rev', label: '反接', short: '反接', hover: ['stripe', 'node_p'], warn: true },
            { value: 'same', label: '两脚同一列', short: '同列', hover: ['node_p'], warn: true },
          ]}
        />
        <Seg<boolean>
          label="电源"
          value={b.pwr}
          onChange={(v) => b.set({ pwr: v })}
          options={[
            { value: true, label: '通电', hover: ['psu'] },
            { value: false, label: '断电', hover: ['psu'] },
          ]}
        />
        <button className={`w41-toggle ${b.dis ? 'on' : ''} ${on('r_dis')}`} aria-pressed={b.dis} onClick={() => b.set({ dis: !b.dis })} {...hoverProps(['r_dis'])}>
          <span className="full">1 kΩ 放电电阻</span>
          <span className="short">放电 1k</span>
        </button>
      </div>
      <div className="bb3d-wrap w41-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-22, 40, 30], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <Scene b={b} frame={frame} nonce={nonce} />
        </Canvas>
        <div className="w41-camsel">
          <Seg<Cam1>
            label="镜头"
            value={frame}
            onChange={setFrame}
            options={[
              { value: 'bench', label: '实验台全景', short: '全景' },
              { value: 'device', label: '器件特写', short: '特写' },
              { value: 'hand', label: '拿起看引脚', short: '看脚' },
            ]}
          />
          <button className="w41-fold" onClick={() => setNonce(nonce + 1)} title="复位镜头">
            复位
          </button>
        </div>
        <p className="w41-drag-hint">拖动旋转 · 滚轮缩放</p>
      </div>
      <div className="w41-cells">
        <Cell id={b.dev === 'elec' ? 'cap_elec' : 'cap_cer'} name="器件" value={b.dev === 'elec' ? '100 μF 25 V' : '104 = 0.1 μF'} />
        <Cell id="vc" name="电容两端 v" value={b.ins === 'rev' && b.dev === 'elec' && b.pwr ? `${fmtV(b.vc, 1)} 反向` : fmtV(b.vc)} tone={b.alarm ? 'bad' : ''} />
        <Cell id="status" name="状态" value={st.text} tone={st.tone} />
        <Cell
          id="rating"
          name="耐压裕量"
          value={`${d.rating} V ${deratingOk(d.rating, BENCH_V) ? '≥' : '<'} 2 × 5 V`}
          tone={deratingOk(d.rating, BENCH_V) ? 'good minor' : 'bad minor'}
        />
        <Cell id="energy" name="储能 ½Cv²" value={b.alarm ? '—' : fmtW(w)} tone="minor" />
        <Cell id="r_dis" name="放电 τ = RC" value={tau >= 1e-3 ? `${(tau * 1e3).toFixed(0)} ms` : `${(tau * 1e6).toFixed(0)} μs`} tone="minor" />
      </div>
      <p className={`w41-notice ${on('psu')}`} {...hoverProps(['psu'])} role="note">
        <span className="full">{SUPPLY_NAME} 经导线接顶部电源轨 · 电解电容 25 V 耐压 ≥ 2 × 5 V · 拆除前用 1 kΩ 电阻跨接两脚放电</span>
        <span className="short">{SUPPLY_NAME} · 25 V ≥ 2 × 5 V · 拆前先放电</span>
      </p>
    </div>
  );
}
