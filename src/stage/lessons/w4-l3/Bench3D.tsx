// Layer "03 3D LM358 ±9V 双电源面包板 + 信号源/示波器探头实操": the shared LM358 (Lm358.tsx; notch
// left, pins 1 and 8 in column 28) across the trench of an 830-hole board, and three instruments
// standing behind it, each wired by its own leads:
//  - 台式可调直流电源（±9 V）: its two 9 V outputs in series, the middle COM = GND. Red lead + → top
//    red rail (+9 V), black lead COM → top blue rail and bottom red rail (GND), blue lead − →
//    bottom blue rail (−9 V). Red jumper T+27 → a28 (Pin 8 V+), blue jumper j31 → B−33 (Pin 4 V−),
//    black jumper j30 → B+30 (Pin 3 IN+ to GND);
//  - 函数信号发生器: square / triangle, 50 Hz – 2 kHz, ±0.5 … ±5 V; red clip → j18 (the input
//    node, column 18), black clip → top GND rail;
//  - 双通道示波器: CH1 hook on g18 (input), CH2 hook on g28 (Pin 1 = v_o), both ground clips on the
//    top GND rail; its screen shows the live traces (ScopeView, from model.simulate()).
// The circuit (an orange jumper g29 → g24 brings v− = Pin 2 to column 24):
//  - integrator: R 10 kΩ (brown-black-orange) h18 → h24, C 100 nF film "104" i24 → i28,
//    R_f 100 kΩ (brown-black-yellow) j24 → j28 — "拔掉 R_f" removes it;
//  - differentiator: R_s 1 kΩ (brown-black-red) h18 → h21 and C i21 → i24 (without R_s: C i18 →
//    i24), R 10 kΩ j24 → j28.
// The chip's own 3 mV offset is always there: without R_f the integrator walks up 3 V/s from
// power-on and hangs from the +7.5 V rail (a flat line once the generator is off).

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, D, Lead as Leg, RAIL_Z, ROW_Z, Resistor, Shell, SurfaceGlow, TrenchGlow, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { Lm358, lm358Pin } from '../../Lm358';
import { useLit, useStage } from '../../stageStore';
import { driftLevel, fmtF, fmtSigned, fmtV, gainAt, simulate, VN, VOH, VOS, type Wave } from './model';
import { ScopeView } from './ScopeView';
import { Cell, Dock, hoverProps, Seg, Slider, useBench, useClearHoverOnUnmount, useClock, type Cam } from './state';

type V3 = [number, number, number];

export const C0 = 28;
export const SUPPLY_NAME = '台式可调直流电源（±9 V）';

/** column of an LM358 pin (pins 1–4 on row f, 5–8 on row e) */
const pc = (p: 1 | 2 | 3 | 4 | 8) => lm358Pin(C0, p).col;
/** Pin 1 (OUT A), Pin 2 (IN− A), Pin 3 (IN+ A), Pin 4 (V−), Pin 8 (V+) */
const P1 = pc(1);
const P2 = pc(2);
const P3 = pc(3);
const P4 = pc(4);
const P8 = pc(8);

/* ------------------------------------------------------------- holes and picking */

/** Board coordinates of a hole: "c10", "T+10" (top + rail), "T-29" (top − rail), "B+25", "B-33". */
function hole(h: string): [number, number] {
  const m = /^([TB])([+-])(\d+)$/.exec(h);
  if (m) {
    const r: Rail = m[1] === 'T' ? (m[2] === '+' ? 'tp' : 'tn') : m[2] === '+' ? 'bp' : 'bn';
    return [colX(Number(m[3])), RAIL_Z[r]];
  }
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

/** this lesson's rails: top + = +9 V, top − and bottom + = GND, bottom − = −9 V */
const RAIL_NET: Record<Rail, string> = { tp: 'rail_p9', tn: 'rail_gnd', bp: 'rail_gnd', bn: 'rail_m9' };
const RAIL_GLOW: Record<string, string> = { rail_p9: '#ff4d5e', rail_gnd: '#4f86ff', rail_m9: '#7c3aed' };

function nets(diff: boolean, rs: boolean): Record<string, string> {
  const n: Record<string, string> = { [`u${P8}`]: 'rail_p9', l18: 'vi', l24: 'vn', [`l${P2}`]: 'vn', [`l${P1}`]: 'vo', [`l${P3}`]: 'gnd', [`l${P4}`]: 'rail_m9' };
  if (diff && rs) n.l21 = 'rs';
  return n;
}

function pick(x: number, z: number, net: Record<string, string>): string[] | null {
  const c = Math.round(x + 32);
  if (Math.abs(z) < 0.95) return ['center_trench'];
  for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 2 && c <= 62) return [RAIL_NET[r]];
  if (c < 1 || c > 63) return null;
  const half = z <= -1 && z >= -6 ? 'u' : z >= 1 && z <= 6 ? 'l' : null;
  if (!half) return null;
  const n = net[`${half}${c}`];
  return n ? [stripId(half, c), n] : [stripId(half, c)];
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
      <meshStandardMaterial color={color} roughness={0.5} emissive={lit ? '#f59e0b' : '#000000'} emissiveIntensity={lit ? 0.7 : 0} />
    </mesh>
  );
}

const WIRE = { red: '#d62f2f', black: '#24262b', blue: '#2f5fd0', orange: '#f08a1c', yellow: '#e8c21c', teal: '#0e9fb5', grey: '#8a9099' };
type WireColor = keyof typeof WIRE;

const enterIds = (ids: string[]) => (e: ThreeEvent<PointerEvent>) => {
  e.stopPropagation();
  useStage.getState().setHover(ids);
};
const leave = () => useStage.getState().setHover(null);

function Jumper({ from, to, color, lit, id }: { from: string; to: string; color: WireColor; lit?: boolean; id: string }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(from);
    const [x2, z2] = hole(to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const h = Math.min(2.6, Math.max(0.8, 0.35 + 0.2 * dist));
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.4, z1], at(0.2, h * 0.92), at(0.5, h), at(0.8, h * 0.92), [x2, 0.4, z2], [x2, -0.3, z2]];
  }, [from, to]);
  return (
    <group onPointerOver={enterIds([id])} onPointerOut={leave}>
      <Tube pts={pts} color={WIRE[color]} r={0.13} lit={lit} />
    </group>
  );
}

/** an instrument lead from a front-panel terminal (world point) to a hole, in an arc over the board */
function Cable({ from, to, color, lit, r = 0.14, top = 0.4 }: { from: V3; to: string; color: WireColor; lit?: boolean; r?: number; top?: number }) {
  const pts = useMemo<V3[]>(() => {
    const [x, z] = hole(to);
    const lift = Math.min(5, 1.8 + Math.hypot(x - from[0], z - from[2]) * 0.09);
    const mid: V3 = [(from[0] + x) / 2, lift, (from[2] + 1.4 + z) / 2];
    return [from, [from[0], from[1] + 0.25, from[2] + 1.4], mid, [x, top + 1.6, z - 0.4], [x, top + 0.5, z], [x, top, z]];
  }, [from, to, top]);
  return <Tube pts={pts} color={WIRE[color]} r={r} lit={lit} />;
}

/* ------------------------------------------------------------- parts */

const BANDS: Record<string, string[]> = {
  '1k': ['#7a4a1f', '#151515', '#c62828', '#d4a72c'],
  '10k': ['#7a4a1f', '#151515', '#f07a1a', '#d4a72c'],
  '100k': ['#7a4a1f', '#151515', '#f2d21b', '#d4a72c'],
};

function Res({ a, b, id, label, value, lit }: { a: string; b: string; id: string; label: string; value: keyof typeof BANDS; lit: boolean }) {
  const setHover = useStage((s) => s.setHover);
  return <Resistor p1={hole(a)} p2={hole(b)} lit={lit} tone="good" label={label} bands={BANDS[value]} onHover={(on) => setHover(on ? [id] : null)} />;
}

/** a 100 nF film capacitor ("104"): a yellow box standing on two legs */
function FilmCap({ a, b, id, label, lit }: { a: string; b: string; id: string; label: string; lit: boolean }) {
  const [x1, z1] = hole(a);
  const [x2, z2] = hole(b);
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const ang = Math.atan2(-(z2 - z1), x2 - x1);
  const h = 1.5;
  const ux = (x2 - x1) / Math.hypot(x2 - x1, z2 - z1);
  const uz = (z2 - z1) / Math.hypot(x2 - x1, z2 - z1);
  const e1: V3 = [mx - ux * 0.55, h - 0.5, mz - uz * 0.55];
  const e2: V3 = [mx + ux * 0.55, h - 0.5, mz + uz * 0.55];
  return (
    <group>
      <Leg pts={[[x1, -0.3, z1], [x1, 0.5, z1], e1]} />
      <Leg pts={[[x2, -0.3, z2], [x2, 0.5, z2], e2]} />
      <group position={[mx, h + 0.15, mz]} rotation={[0, ang, 0]} onPointerOver={enterIds([id])} onPointerOut={leave}>
        <mesh>
          <boxGeometry args={[1.7, 1.4, 0.75]} />
          <meshStandardMaterial color="#e9bf24" roughness={0.45} emissive={lit ? '#f59e0b' : '#000000'} emissiveIntensity={lit ? 0.45 : 0} />
        </mesh>
      </group>
      <Html position={[mx, h + 1.4, mz]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w43-tag3 cap ${lit ? 'lit' : ''}`}>{label}</div>
      </Html>
    </group>
  );
}

interface Terminal {
  dx: number;
  color: WireColor;
  to: string[];
  lit?: boolean;
  /** height of the lead's end over the board (a probe hook sits higher) */
  top?: number;
}

/** An instrument box behind the board: front panel, a display (Html), terminals along its foot, leads. */
function Instrument({
  x,
  z,
  w,
  h,
  id,
  tag,
  terms,
  lit,
  display,
  knobs = [],
  tagLift = 0.6,
}: {
  x: number;
  z: number;
  w: number;
  h: number;
  id: string;
  tag: string;
  terms: Terminal[];
  lit: boolean;
  display: ReactNode;
  knobs?: number[];
  /** height of the name tag over the box */
  tagLift?: number;
}) {
  const d = 6;
  const front = z + d / 2;
  return (
    <group>
      <group onPointerOver={enterIds([id])} onPointerOut={leave}>
        <mesh position={[x, h / 2 - 0.5, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#d9dde3" roughness={0.55} emissive={lit ? '#f59e0b' : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
        </mesh>
        <mesh position={[x, h / 2 - 0.5, front + 0.01]}>
          <planeGeometry args={[w - 0.6, h - 0.5]} />
          <meshStandardMaterial color="#3b4250" roughness={0.7} />
        </mesh>
        {knobs.map((dx) => (
          <mesh key={dx} position={[x + dx, h - 2.1, front + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.6, 20]} />
            <meshStandardMaterial color="#9aa1ab" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {terms.map((t, i) => (
          <mesh key={i} position={[x + t.dx, 0.6, front + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.5, 14]} />
            <meshStandardMaterial color={WIRE[t.color]} />
          </mesh>
        ))}
      </group>
      {terms.flatMap((t, i) => t.to.map((hl) => <Cable key={`${i}-${hl}`} from={[x + t.dx, 0.6, front + 0.5]} to={hl} color={t.color} lit={t.lit} top={t.top} />))}
      {display}
      <Html position={[x, h + tagLift, z - d / 2]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w43-tag3 inst ${lit ? 'lit' : ''}`}>{tag}</div>
      </Html>
    </group>
  );
}

/** a scope probe's hook clipped onto a hole */
function Hook({ at, color, lit }: { at: string; color: WireColor; lit: boolean }) {
  const [x, z] = hole(at);
  return (
    <group>
      <mesh position={[x, 0.5, z]}>
        <cylinderGeometry args={[0.07, 0.07, 1.6, 8]} />
        <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[x, 1.7, z]}>
        <cylinderGeometry args={[0.3, 0.24, 1.4, 14]} />
        <meshStandardMaterial color={WIRE[color]} roughness={0.45} emissive={lit ? WIRE[color] : '#000000'} emissiveIntensity={lit ? 0.7 : 0} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------- camera */

const VIEW_DIR = new THREE.Vector3(0, 1.6, 1).normalize();
const VIEW_DIR_WIDE = new THREE.Vector3(0, 1.2, 1).normalize();
type Box = { x: [number, number]; z: [number, number] };
const FRAMES: Record<Cam, Box> = {
  bench: { x: [-34, 34], z: [-21, 11] },
  circuit: { x: [-16, 4], z: [-4, 8] },
  scope: { x: [10, 34], z: [-21, -12] },
};
const FRAMES_WIDE: Record<Cam, Box> = {
  bench: { x: [-33, 33], z: [-20, 10] },
  circuit: { x: [-18, 6], z: [-3, 8] },
  scope: { x: [8, 36], z: [-21, -12] },
};

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: Box, dir: THREE.Vector3): [THREE.Vector3, THREE.Vector3] {
  const target = new THREE.Vector3((f.x[0] + f.x[1]) / 2, 0.5, (f.z[0] + f.z[1]) / 2);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of f.x) for (const y of [-1, 6]) for (const z of f.z) corners.push(new THREE.Vector3(x, y, z));
  const v = new THREE.Vector3();
  let d = 10;
  for (; d < 260; d *= 1.04) {
    cam.position.copy(target).addScaledVector(dir, d);
    cam.lookAt(target);
    cam.updateMatrixWorld();
    if (corners.every((p) => (v.copy(p).project(cam), Math.abs(v.x) < 0.94 && Math.abs(v.y) < 0.9))) break;
  }
  return [target.clone().addScaledVector(dir, d), target];
}

function CameraRig({ frame }: { frame: Cam }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const anim = useRef<{ t: number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3 } | null>(null);
  useEffect(() => {
    if (!controls) return;
    const wide = aspect > 1.6;
    const [toP, toT] = fitView(camera, aspect, (wide ? FRAMES_WIDE : FRAMES)[frame], wide ? VIEW_DIR_WIDE : VIEW_DIR);
    if (prefersReducedMotion()) {
      camera.position.copy(toP);
      controls.target.copy(toT);
      controls.update();
      invalidate();
      return;
    }
    anim.current = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toP, toT };
    invalidate();
  }, [frame, controls, camera, invalidate, aspect]);
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

/* ------------------------------------------------------------- the scene */

function RailGlow({ lit }: { lit: string[] }) {
  const len = colX(61) - colX(3) + 1.2;
  return (
    <>
      {(Object.keys(RAIL_Z) as Rail[])
        .filter((r) => lit.includes(RAIL_NET[r]))
        .map((r) => (
          <mesh key={r} position={[(colX(3) + colX(61)) / 2, 0.03, RAIL_Z[r]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
            <planeGeometry args={[len, 0.86]} />
            <meshBasicMaterial color={RAIL_GLOW[RAIL_NET[r]]} transparent opacity={0.42} depthWrite={false} />
          </mesh>
        ))}
    </>
  );
}

interface Lab {
  diff: boolean;
  rf: boolean;
  rs: boolean;
  gen: boolean;
  wave: Wave;
  f: number;
  amp: number;
  glitch: boolean;
  frame: Cam;
  screen: ReactNode;
}

const WAVE_ZH: Record<Wave, string> = { square: 'SQR', tri: 'TRI', gnd: 'OFF' };

function Scene({ lab }: { lab: Lab }) {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const is = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const net = useMemo(() => nets(lab.diff, lab.rs), [lab.diff, lab.rs]);
  const glow = new Set(lit.filter((id) => /^strip_/.test(id)));
  for (const [k, id] of Object.entries(net)) if (lit.includes(id)) glow.add(stripId(k[0] as 'u' | 'l', Number(k.slice(1))));
  const rails = [...lit];
  if (is('psu')) rails.push('rail_p9', 'rail_gnd', 'rail_m9');
  if (is('gnd')) rails.push('rail_gnd');
  const last = useRef<string | null>(null);
  const move = (e: ThreeEvent<PointerEvent>) => {
    const ids = pick(e.point.x, e.point.z, net);
    const key = ids?.join(',') ?? null;
    if (key !== last.current) {
      last.current = key;
      setHover(ids);
    }
  };
  const out = () => {
    last.current = null;
    setHover(null);
  };
  const { diff } = lab;
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Shell xray={0} />
      <SurfaceGlow lit={[...glow]} />
      <RailGlow lit={rails} />
      <TrenchGlow on={is('center_trench')} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={out} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>

      {/* the ±9 V bench supply and the chip's supply pins */}
      <Instrument
        x={-24}
        z={-17.5}
        w={11}
        h={5}
        id="psu"
        tag={SUPPLY_NAME}
        lit={is('psu')}
        knobs={[2.4, 4.1]}
        terms={[
          { dx: -4, color: 'red', to: ['T+12'], lit: is('psu', 'rail_p9') },
          { dx: -2.2, color: 'black', to: ['T-13', 'B+3'], lit: is('psu', 'rail_gnd') },
          { dx: -0.4, color: 'blue', to: ['B-5'], lit: is('psu', 'rail_m9') },
        ]}
        display={
          <Html position={[-25.6, 2.9, -14.45]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
            <div className="w43-lcd3">
              <b>+9.00 V</b>
              <b>−9.00 V</b>
            </div>
          </Html>
        }
      />
      <Jumper from="T+27" to={`a${P8}`} color="red" lit={is('rail_p9', 'chip_lm358_p8')} id="rail_p9" />
      <Jumper from={`j${P4}`} to="B-33" color="blue" lit={is('rail_m9', 'chip_lm358_p4')} id="rail_m9" />
      <Jumper from={`j${P3}`} to={`B+${P3}`} color="black" lit={is('gnd', 'chip_lm358_p3')} id="gnd" />
      <Lm358 c0={C0} pinNumbers />

      {/* the circuit */}
      <Jumper from={`g${P2}`} to="g24" color="orange" lit={is('vn', 'chip_lm358_p2')} id="vn" />
      {!diff ? (
        <>
          <Res a="h18" b="h24" id="r_in" label="R 10 kΩ" value="10k" lit={is('r_in')} />
          <FilmCap a="i24" b={`i${P1}`} id="c_fb" label="C 100 nF（104）" lit={is('c_fb')} />
          {lab.rf && <Res a="j24" b={`j${P1}`} id="rf" label="R_f 100 kΩ" value="100k" lit={is('rf')} />}
        </>
      ) : (
        <>
          {lab.rs && <Res a="h18" b="h21" id="rs" label="R_s 1 kΩ" value="1k" lit={is('rs')} />}
          <FilmCap a={lab.rs ? 'i21' : 'i18'} b="i24" id="c_in" label="C 100 nF（104）" lit={is('c_in')} />
          <Res a="j24" b={`j${P1}`} id="r_fb" label="R 10 kΩ" value="10k" lit={is('r_fb')} />
        </>
      )}

      {/* the function generator */}
      <Instrument
        x={-3}
        z={-17.5}
        w={11}
        h={5}
        id="fgen"
        tagLift={2.6}
        tag="函数信号发生器"
        lit={is('fgen', 'vi')}
        knobs={[3.6]}
        terms={[
          { dx: -3.6, color: 'red', to: ['j18'], lit: is('fgen', 'vi') },
          { dx: -1.8, color: 'black', to: ['T-20'], lit: is('rail_gnd') },
        ]}
        display={
          <Html position={[-4.4, 2.9, -14.45]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
            <div className="w43-lcd3 gen">
              <b>{lab.gen ? fmtF(lab.f) : 'OUTPUT OFF'}</b>
              <b>{lab.gen ? `${WAVE_ZH[lab.wave]} ${(2 * lab.amp).toFixed(1)} Vpp` : '0 V'}</b>
            </div>
          </Html>
        }
      />

      {/* the oscilloscope */}
      <Instrument
        x={22}
        z={-17.5}
        w={15}
        h={8}
        id="scope"
        tag="双通道示波器"
        lit={is('scope', 'ch1', 'ch2')}
        knobs={[5.6]}
        terms={[
          { dx: -5.6, color: 'yellow', to: ['g18'], lit: is('ch1', 'vi'), top: 1.6 },
          { dx: -3.8, color: 'teal', to: [`g${P1}`], lit: is('ch2', 'vo'), top: 1.6 },
          { dx: -2, color: 'black', to: ['T-40', 'T-42'], lit: is('rail_gnd') },
        ]}
        display={
          <Html position={[20.2, 4.4, -14.4]} center zIndexRange={[24, 0]}>
            <div className="w43-screen3" {...hoverProps(['scope', 'ch1', 'ch2'])}>
              {lab.screen}
            </div>
          </Html>
        }
      />
      <Hook at="g18" color="yellow" lit={is('ch1', 'vi')} />
      <Hook at={`g${P1}`} color="teal" lit={is('ch2', 'vo')} />

      <OrbitControls makeDefault enableDamping={false} minDistance={8} maxDistance={140} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig frame={lab.frame} />
    </>
  );
}

/* ------------------------------------------------------------- the layer */

export default function Bench3D() {
  useClearHoverOnUnmount();
  const b = useBench();
  const { glitch, setGlitch, gen, setGen } = b;
  const diff = b.preset === 'diff';
  const drifting = !diff && !b.rf;
  const [tOn, restart] = useClock(`${b.preset}|${b.rf}|${gen}`, drifting);
  const wave: Wave = gen ? b.wave : 'gnd';
  const cfg = useMemo(
    () => ({ mode: b.mode, wave, f: b.f, amp: b.amp, vos: VOS, ic: 'sym' as const, drift: drifting ? driftLevel('int', tOn) : 0 }),
    [b.mode, wave, b.f, b.amp, drifting, tOn],
  );
  const tr = useMemo(() => simulate(cfg, 240), [cfg]);
  const band = glitch && gen ? gainAt(b.mode, 50_000) * VN : 0;
  const screen = <ScopeView tr={tr} f={b.f} compact bandIn={glitch && gen ? VN : 0} bandOut={band} caption={`示波器屏幕：CH2 峰峰值 ${fmtV(tr.max - tr.min)}`} />;
  const lab: Lab = { diff, rf: b.rf, rs: b.rs, gen, wave: b.wave, f: b.f, amp: b.amp, glitch, frame: b.cam, screen };
  const status = tr.clipped ? (drifting ? '撞 +7.5 V 轨' : '饱和削顶') : band > 1 ? '毛刺炸屏' : '线性';
  return (
    <div className="w43-layer">
      <Dock
        head={
          <>
            <Seg
              label="接线"
              value={b.preset}
              set={(v) => {
                b.setPreset(v);
                b.setWave(v === 'int' ? 'square' : 'tri');
              }}
              opts={[
                { v: 'int', full: '有损积分器', short: '积分' },
                { v: 'diff', full: '实用微分器', short: '微分' },
              ]}
              hl={['opamp']}
            />
            <Seg<Cam>
              label="镜头"
              small
              value={b.cam}
              set={b.setCam}
              opts={[
                { v: 'bench', full: '全景', short: '全景' },
                { v: 'circuit', full: '电路特写', short: '电路' },
                { v: 'scope', full: '示波器', short: '屏幕' },
              ]}
            />
          </>
        }
      >
        <div className="w43-row">
          {diff ? (
            <button className={`w43-toggle ${b.rs ? '' : 'bad'}`} aria-pressed={!b.rs} onClick={() => b.setRs(!b.rs)} {...hoverProps(['rs'])}>
              <span className="full">{b.rs ? '拔掉 R_s 1 kΩ' : '插回 R_s 1 kΩ'}</span>
              <span className="short">{b.rs ? '拔 R_s' : '插 R_s'}</span>
            </button>
          ) : (
            <button className={`w43-toggle ${b.rf ? '' : 'bad'}`} aria-pressed={!b.rf} onClick={() => b.setRf(!b.rf)} {...hoverProps(['rf'])}>
              <span className="full">{b.rf ? '拔掉 R_f 100 kΩ' : '插回 R_f 100 kΩ'}</span>
              <span className="short">{b.rf ? '拔 R_f' : '插 R_f'}</span>
            </button>
          )}
          <button className={`w43-toggle ${gen ? 'on' : ''}`} aria-pressed={gen} onClick={() => setGen(!gen)} {...hoverProps(['fgen'])}>
            <span className="full">信号源输出 {gen ? '开' : '关'}</span>
            <span className="short">信号{gen ? '开' : '关'}</span>
          </button>
          <button className={`w43-toggle ${glitch ? 'on' : ''}`} aria-pressed={glitch} onClick={() => setGlitch(!glitch)} {...hoverProps(['noise'])}>
            <span className="full">长飞线毛刺 {glitch ? '开' : '关'}</span>
            <span className="short">毛刺{glitch ? '开' : '关'}</span>
          </button>
        </div>
        <div className="w43-row">
          <Seg<Wave>
            label="信号源波形"
            small
            value={b.wave}
            set={b.setWave}
            opts={[
              { v: 'square', full: '方波', short: '方' },
              { v: 'tri', full: '三角波', short: '三角' },
            ]}
            hl={['fgen']}
          />
          <Slider name="f" value={b.f} min={50} max={2000} step={50} set={b.setF} text={fmtF(b.f)} aria="信号源频率" hl="fgen" />
          <Slider name="V" value={b.amp} min={0.5} max={5} step={0.1} set={(v) => b.setAmp(Math.round(v * 10) / 10)} text={`±${b.amp.toFixed(1)} V`} aria="信号源幅值" hl="fgen" />
        </div>
      </Dock>
      <div className={`bb3d-wrap w43-bench ${b.cam}`}>
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-10, 60, 40], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <Scene lab={lab} />
        </Canvas>
      </div>
      <div className="w43-cells">
        <Cell id="ch2" name="CH2 峰峰值" short="CH2 Vpp" value={fmtV(tr.max - tr.min)} />
        <Cell id="vo" name="CH2 最高 / 最低" short="max/min" value={`${fmtSigned(tr.max, 1)} / ${fmtSigned(tr.min, 1)}`} />
        <Cell id="sat" name="状态" value={status} cls={tr.clipped || band > 1 ? 'bad' : 'good'} />
        <Cell id="psu" name="电源" value="±9.00 V" hint={SUPPLY_NAME} />
        <Cell id="fgen" name="信号源" value={gen ? `${fmtF(b.f)} · ${(2 * b.amp).toFixed(1)} Vpp` : '输出关'} />
        {drifting ? (
          <Cell
            id="vos"
            name={`上电 ${tOn.toFixed(1)} s`}
            short={`${tOn.toFixed(1)} s`}
            value={tr.max >= VOH - 1e-6 ? '贴 +7.5 V 轨' : `直流 ${fmtSigned(driftLevel('int', tOn))}`}
            cls={tr.max >= VOH - 1e-6 ? 'bad' : ''}
          />
        ) : null}
      </div>
      {drifting && (
        <button className="w43-toggle w43-repower" onClick={restart}>
          重新上电
        </button>
      )}
    </div>
  );
}
