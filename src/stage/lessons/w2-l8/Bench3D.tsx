// Layer "03 3D 面包板拧电位器找最大功率实操": the sheet's safe kΩ bench on an 830-hole board — a
// 5 V bench supply on the top + rail and the bottom − rail, a 1 kΩ brown-black-red-gold resistor
// as R_Th (c10–c18, fed by a red jumper from the + rail), port a on column 18 (orange jumper e18–f18
// across the trench), a B10K rotary potentiometer as R_L (pins j18 / j20 / j22, wiper Pin 2 and
// Pin 3 shorted by a green jumper h20–h22, Pin 3 to GND by a black jumper g22 → − rail) and a
// multimeter across the pot (red probe b18, black probe on the − rail) reading V_L.
// Drag the knob (or the slider) to turn it: θ 0…270° → R_L 50 Ω…10 kΩ, slower near 1 kΩ. The
// instrument panel computes P_L = V_L² / R_L, keeps the peak, records points (they stay on the
// layer-02 curve) and lights green when V_L reaches 2.50 V = V_Th / 2.
// Built from the shared breadboard pieces (BreadboardXray.tsx: Shell, SurfaceGlow, Resistor).

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, D, RAIL_Z, ROW_Z, Resistor, Shell, SurfaceGlow, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { Dock, hoverProps, ScaleNotice, useCircuit, useClearHoverOnUnmount, useIsLit, type Circuit, type Sample } from './state';
import { angleOfRl, clampRl, dragRate, fmtI, fmtP, fmtPct, fmtR, fmtV, LAB, peakLocked, POT_TRAVEL } from './model';

type V3 = [number, number, number];

/* ------------------------------------------------------------- holes and picking */

/** Board coordinates of a hole: "c10", "T+10" (top + rail, column 10), "B-27" (bottom − rail). */
function hole(h: string): [number, number] {
  const m = /^([TB])([+-])(\d+)$/.exec(h);
  if (m) {
    const r: Rail = m[1] === 'T' ? (m[2] === '+' ? 'tp' : 'tn') : m[2] === '+' ? 'bp' : 'bn';
    return [colX(Number(m[3])), RAIL_Z[r]];
  }
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

const RAIL_ID: Record<Rail, string> = { tp: 'rail_pos', bp: 'rail_pos', tn: 'rail_neg', bn: 'rail_neg' };
/** column 18 is port a (both halves, joined by the orange jumper) */
const PORT_STRIPS = ['strip_u_18', 'strip_l_18'];

function pick(x: number, z: number): string[] | null {
  const c = Math.round(x + 32);
  if (Math.abs(z) < 0.95) return ['center_trench'];
  for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 2 && c <= 62) return [RAIL_ID[r]];
  if (c < 1 || c > 63) return null;
  const half = z <= -1 && z >= -6 ? 'u' : z >= 1 && z <= 6 ? 'l' : null;
  if (!half) return null;
  const id = stripId(half, c);
  return c === 18 ? [id, 'port_ab'] : [id];
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

const WIRE: Record<string, string> = { red: '#d62f2f', black: '#24262b', orange: '#f08a1c', green: '#16a34a' };

function Jumper({ from, to, color, lit, onHover }: { from: string; to: string; color: keyof typeof WIRE; lit?: boolean; onHover?: (on: boolean) => void }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(from);
    const [x2, z2] = hole(to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const h = Math.min(3, Math.max(0.8, 0.35 + 0.2 * dist));
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.4, z1], at(0.2, h * 0.92), at(0.5, h), at(0.8, h * 0.92), [x2, 0.4, z2], [x2, -0.3, z2]];
  }, [from, to]);
  return (
    <group
      onPointerOver={
        onHover &&
        ((e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(true);
        })
      }
      onPointerOut={onHover && (() => onHover(false))}
    >
      <Tube pts={pts} color={WIRE[color]} r={0.13} lit={lit} />
    </group>
  );
}

/* ------------------------------------------------------------- bench supply */

const PSU = { x: -42, z: -1.5, w: 8, h: 4.2, d: 9 };

function BenchSupply({ c, lit, hover }: { c: Circuit; lit: boolean; hover: (ids: string[] | null) => void }) {
  const right = PSU.x + PSU.w / 2;
  const red = useMemo<V3[]>(() => {
    const [x, z] = hole('T+3');
    return [
      [right + 0.2, 1.4, PSU.z - 2.6],
      [right + 1.6, 1.9, PSU.z - 4.5],
      [x - 0.9, 1.4, z],
      [x, 0.5, z],
      [x, -0.3, z],
    ];
  }, [right]);
  const black = useMemo<V3[]>(() => {
    const [x, z] = hole('B-3');
    return [
      [right + 0.2, 1.4, PSU.z + 2.6],
      [right + 1.6, 1.9, PSU.z + 5.5],
      [x - 0.9, 1.4, z],
      [x, 0.5, z],
      [x, -0.3, z],
    ];
  }, [right]);
  const enter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hover(['vth']);
  };
  return (
    <group name="mesh_bench_psu">
      <group onPointerOver={enter} onPointerOut={() => hover(null)}>
        <mesh position={[PSU.x, PSU.h / 2 - 1, PSU.z]}>
          <boxGeometry args={[PSU.w, PSU.h, PSU.d]} />
          <meshStandardMaterial color="#d9dde3" roughness={0.55} emissive={lit ? '#f59e0b' : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
        </mesh>
        {/* front panel (toward the viewer) */}
        <mesh position={[PSU.x, PSU.h / 2 - 1, PSU.z + PSU.d / 2 + 0.01]}>
          <planeGeometry args={[PSU.w - 0.6, PSU.h - 0.5]} />
          <meshStandardMaterial color="#3b4250" roughness={0.7} />
        </mesh>
        {[-1.8, 1.8].map((dx) => (
          <mesh key={dx} position={[PSU.x + dx, 0, PSU.z + PSU.d / 2 + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.6, 20]} />
            <meshStandardMaterial color="#9aa1ab" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {/* output terminals on the side facing the board */}
        <mesh position={[right + 0.15, 1.4, PSU.z - 2.6]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.5, 14]} />
          <meshStandardMaterial color="#d62f2f" />
        </mesh>
        <mesh position={[right + 0.15, 1.4, PSU.z + 2.6]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.5, 14]} />
          <meshStandardMaterial color="#24262b" />
        </mesh>
      </group>
      <Tube pts={red} color={WIRE.red} r={0.14} lit={lit} />
      <Tube pts={black} color={WIRE.black} r={0.14} />
      <Html position={[PSU.x, PSU.h / 2 + 0.2, PSU.z + PSU.d / 2 + 0.05]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w8-psu-lcd">
          <b>{LAB.vth.toFixed(2)} V</b>
          <span>{fmtI(c.sol.il, 'lab')}</span>
        </div>
      </Html>
      <Html position={[PSU.x, PSU.h + 1.4, PSU.z - PSU.d / 2 - 1]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w8-tag3 psu ${lit ? 'lit' : ''}`}>台式可调直流电源（5 V）</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- the B10K potentiometer */

const POT = { pins: ['j18', 'j20', 'j22'], x: colX(20), z: ROW_Z.j + 3.9 };

function Pot({ c, lit, hover }: { c: Circuit; lit: boolean; hover: (ids: string[] | null) => void }) {
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const setParams = useStage((s) => s.setParams);
  const theta = angleOfRl(c.rl);
  const knobRot = -((theta - POT_TRAVEL / 2) * Math.PI) / 180;
  const down = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (controls) controls.enabled = false;
    let last = e.nativeEvent.clientX;
    let rl = c.rl;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - last;
      last = ev.clientX;
      rl = Math.min(10000, Math.max(50, rl + dx * dragRate(rl)));
      setParams({ rlB: clampRl('lab', rl) });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (controls) controls.enabled = true;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };
  const enter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hover(['rl']);
    document.body.style.cursor = 'ew-resize';
  };
  const leave = () => {
    hover(null);
    document.body.style.cursor = '';
  };
  useEffect(() => () => void (document.body.style.cursor = ''), []);
  const glow = lit ? '#f59e0b' : '#000000';
  return (
    <group name="mesh_pot_b10k">
      {POT.pins.map((p) => {
        const [x, z] = hole(p);
        return (
          <Tube
            key={p}
            pts={[
              [x, -0.3, z],
              [x, 0.7, z],
              [x, 0.9, z + 0.9],
              [x, 0.9, POT.z - 2.6],
            ]}
            color="#c3c8ce"
            r={0.1}
          />
        );
      })}
      <group onPointerOver={enter} onPointerOut={leave} onPointerDown={down}>
        {/* body: a metal can on a dark base */}
        <mesh position={[POT.x, 0.75, POT.z]}>
          <boxGeometry args={[6.6, 1.1, 5.8]} />
          <meshStandardMaterial color="#1f3b73" roughness={0.6} emissive={glow} emissiveIntensity={lit ? 0.35 : 0} />
        </mesh>
        <mesh position={[POT.x, 1.75, POT.z]}>
          <cylinderGeometry args={[2.9, 2.9, 0.9, 32]} />
          <meshStandardMaterial color="#b9bec4" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* the knob, turned by θ */}
        <group position={[POT.x, 2.2, POT.z]} rotation={[0, knobRot, 0]}>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[2.1, 2.3, 1.8, 28]} />
            <meshStandardMaterial color="#2b2f36" roughness={0.5} emissive={glow} emissiveIntensity={lit ? 0.45 : 0} />
          </mesh>
          <mesh position={[0, 1.82, -1.1]}>
            <boxGeometry args={[0.34, 0.08, 1.9]} />
            <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={0.3} />
          </mesh>
        </group>
        {/* a larger invisible grip for the pointer */}
        <mesh position={[POT.x, 2.6, POT.z]} visible={false}>
          <cylinderGeometry args={[3.4, 3.4, 3.4, 16]} />
        </mesh>
      </group>
      <Html position={[POT.x + 5.4, 3.4, POT.z + 0.4]} center zIndexRange={[22, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w8-tag3 pot ${lit ? 'lit' : ''}`}>
          B10K 电位器 R_L = {fmtR(c.rl, 'lab')} · θ = {theta.toFixed(0)}°
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- multimeter */

const DMM = { x: -24, y: 1.6, z: 17.5, tilt: 1.2, w: 8, h: 11, t: 1.4 };

function dmmWorld(local: V3): V3 {
  const [x, y, z] = local;
  const cs = Math.cos(DMM.tilt);
  const sn = Math.sin(DMM.tilt);
  return [DMM.x + x, DMM.y + y * cs + z * sn, DMM.z - y * sn + z * cs];
}

function Probe({ at, color, jack, lit }: { at: string; color: 'red' | 'black'; jack: number; lit: boolean }) {
  const [x, z] = hole(at);
  const j = dmmWorld([jack, -4.1, DMM.t / 2 + 0.1]);
  const j2 = dmmWorld([jack, -4.1, DMM.t / 2 + 1.4]);
  const pts = useMemo<V3[]>(
    () => [[x, 4.3, z], [x, 7.2, z + 2.6], [x + (DMM.x - x) * 0.3, 6.4, 13.8], [DMM.x + 5.4 + jack * 0.3, 1.2, j[2] + 1.2], j2, j],
    [x, z, jack, j[2]], // eslint-disable-line react-hooks/exhaustive-deps
  );
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

function Meter({ c, lit }: { c: Circuit; lit: boolean }) {
  const lcd = dmmWorld([0, 2.6, DMM.t / 2 + 0.05]);
  return (
    <group name="mesh_dmm_voltage">
      <group position={[DMM.x, DMM.y, DMM.z]} rotation={[-DMM.tilt, 0, 0]}>
        <mesh>
          <boxGeometry args={[DMM.w, DMM.h, DMM.t]} />
          <meshStandardMaterial color="#f2c230" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.2, DMM.t / 2 + 0.01]}>
          <planeGeometry args={[DMM.w - 1, DMM.h - 1]} />
          <meshStandardMaterial color="#2b2f36" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.6, DMM.t / 2 + 0.02]}>
          <planeGeometry args={[6, 2.4]} />
          <meshStandardMaterial color={lit ? '#d8f5c8' : '#b9c7a3'} />
        </mesh>
        <mesh position={[0, -0.8, DMM.t / 2 + 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.3, 28]} />
          <meshStandardMaterial color="#3d434d" />
        </mesh>
        <mesh position={[0.9, 0.1, DMM.t / 2 + 0.32]} rotation={[0, 0, -0.8]}>
          <boxGeometry args={[0.24, 1.3, 0.1]} />
          <meshStandardMaterial color="#f2f2f2" />
        </mesh>
        {[-2.4, 0, 2.4].map((jx) => (
          <mesh key={jx} position={[jx, -4.1, DMM.t / 2 + 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.2, 16]} />
            <meshStandardMaterial color={jx === 0 ? '#111' : '#b3261e'} />
          </mesh>
        ))}
      </group>
      <Html position={lcd} center zIndexRange={[25, 0]}>
        <div className={`w8-lcd ${lit ? 'lit' : ''}`} {...hoverProps(['vl'])} tabIndex={0} data-hl="vl">
          <small>DC V</small>
          <b>{c.sol.vl.toFixed(3)}</b>
          <span>V</span>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- camera */

const VIEW_DIR = new THREE.Vector3(0, 1.7, 1).normalize();
const FRAMES: Record<'bench' | 'pot', { x: [number, number]; z: [number, number] }> = {
  bench: { x: [-47, -4], z: [-12, 23] },
  pot: { x: [-24, -4], z: [-6.5, 13.5] },
};

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: (typeof FRAMES)['bench']): [THREE.Vector3, THREE.Vector3] {
  const target = new THREE.Vector3((f.x[0] + f.x[1]) / 2, 0.5, (f.z[0] + f.z[1]) / 2);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of f.x) for (const y of [-1, 4.5]) for (const z of f.z) corners.push(new THREE.Vector3(x, y, z));
  const v = new THREE.Vector3();
  let d = 10;
  for (; d < 260; d *= 1.04) {
    cam.position.copy(target).addScaledVector(VIEW_DIR, d);
    cam.lookAt(target);
    cam.updateMatrixWorld();
    if (corners.every((p) => (v.copy(p).project(cam), Math.abs(v.x) < 0.94 && Math.abs(v.y) < 0.9))) break;
  }
  return [target.clone().addScaledVector(VIEW_DIR, d), target];
}

function CameraRig({ frame }: { frame: 'bench' | 'pot' }) {
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
  }, [frame, controls, camera, invalidate, aspect]);
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

const RTH_BANDS = ['#7a4a1f', '#151515', '#c62828', '#d4a72c'];

function Scene({ c, frame }: { c: Circuit; frame: 'bench' | 'pot' }) {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const is = (id: string) => lit.includes(id);
  const glow = new Set(lit.filter((id) => /^strip_|^rail_/.test(id)));
  if (is('port_ab')) [...PORT_STRIPS, 'rail_neg'].forEach((s) => glow.add(s));
  if (is('vth')) glow.add('rail_pos');
  if (is('pot_short')) ['strip_l_20', 'strip_l_22'].forEach((s) => glow.add(s));
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
  const [a1, a2] = [hole('c10'), hole('c18')];
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Shell xray={0} />
      <SurfaceGlow lit={[...glow]} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <BenchSupply c={c} lit={is('vth')} hover={setHover} />
      <Jumper from="T+10" to="a10" color="red" lit={is('vth')} />
      <Resistor p1={a1} p2={a2} lit={is('rth')} tone="good" label="R_Th 1 kΩ（棕-黑-红-金）" bands={RTH_BANDS} onHover={(on) => setHover(on ? ['rth'] : null)} />
      <Jumper from="e18" to="f18" color="orange" lit={is('port_ab')} onHover={(on) => setHover(on ? ['port_ab'] : null)} />
      <Pot c={c} lit={is('rl')} hover={setHover} />
      <Jumper from="h20" to="h22" color="green" lit={is('pot_short')} onHover={(on) => setHover(on ? ['pot_short'] : null)} />
      <Jumper from="g22" to="B-27" color="black" lit={is('port_ab')} />
      <Html position={[colX(18), 0.6, ROW_Z.a - 2.3]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w8-tag3 node ${is('port_ab') ? 'lit' : ''}`}>端口 a（第 18 列）</div>
      </Html>
      <Probe at="b18" color="red" jack={2.4} lit={is('vl')} />
      <Probe at="B-30" color="black" jack={0} lit={is('vl')} />
      <Meter c={c} lit={is('vl')} />
      <OrbitControls makeDefault enableDamping={false} minDistance={8} maxDistance={110} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig frame={frame} />
    </>
  );
}

/* ------------------------------------------------------------- HUD and layer */

/** The instrument panel under the bench: the meter's V_L, the pot's R_L, P_L = V_L² / R_L, the
 *  peak history, the lock and the record button (recorded points stay on the layer-02 curve). */
function Panel({ c }: { c: Circuit }) {
  const on = useIsLit();
  const s = c.sol;
  const locked = peakLocked(s);
  const record = () => {
    const pt: Sample = { rl: c.rl, vl: s.vl, pl: s.pl, eta: s.eta };
    const rest = c.samples.filter((p) => p.rl !== c.rl);
    c.set({ samples: [...rest, pt].sort((p, q) => p.rl - q.rl).slice(-12) });
  };
  const cell = (id: string, name: ReactNode, value: string, cls = '') => (
    <div className={`w8-cell ${cls} ${on(id)}`} data-hl={id} {...hoverProps([id])} tabIndex={0}>
      <span>{name}</span>
      <b>{value}</b>
    </div>
  );
  return (
    <div className="w8-panel" aria-live="polite">
      <div className="w8-pcells">
        {cell('vl', '万用表 V_L', fmtV(s.vl))}
        {cell('rl', '电位器 R_L', fmtR(c.rl, 'lab'), 'rlrow')}
        {cell(
          'pl',
          <>
            <span className="full">P_L = V_L²/R_L</span>
            <span className="short">功率 P_L</span>
          </>,
          fmtP(s.pl, 'lab'),
          'big',
        )}
        {cell('il', '回路电流 I_L', fmtI(s.il, 'lab'), 'minor')}
        {cell('eta', '效率 η', fmtPct(s.eta), 'minor')}
        {cell('pmax', c.peak ? `峰值历史 @ ${fmtR(c.peak.rl, 'lab')}` : '峰值历史', c.peak ? fmtP(c.peak.pl, 'lab') : '—', 'minor')}
      </div>
      <div className="w8-pfoot">
        <div className={`w8-lock ${locked ? 'on' : 'off'}`} role="status">
          {locked ? (
            <>
              <span className="full">峰值锁定：V_L ≈ 2.50 V = V_Th/2，P_L ≈ 6.25 mW</span>
              <span className="short">峰值锁定</span>
            </>
          ) : (
            '目标：把 V_L 拧到 2.50 V（V_Th 的一半）'
          )}
        </div>
        {c.samples.length > 0 && (
          <div className={`w8-samples ${on('samples')}`} {...hoverProps(['samples'])}>
            已记录：
            {c.samples.slice(-4).map((p) => (
              <span key={p.rl}>
                {fmtR(p.rl, 'lab')} → {(p.pl * 1000).toFixed(3)} mW
              </span>
            ))}
          </div>
        )}
        <button className="w8-rec" onClick={record}>
          <span className="full">记录当前数据点</span>
          <span className="short">记录</span>
          {c.samples.length ? `（${c.samples.length}）` : ''}
        </button>
      </div>
    </div>
  );
}

export default function Bench3D() {
  const c = useCircuit();
  useClearHoverOnUnmount();
  const [frame, setFrame] = useStageParam<'bench' | 'pot'>('cam', 'bench');
  const { mode, set, rl } = c;
  // the breadboard layer always runs the safe kΩ values (the sheet's auto scaling)
  useEffect(() => {
    if (mode !== 'lab') set({ mode: 'lab' });
  }, [mode, set]);
  // peak history
  const { pl } = c.sol;
  useEffect(() => {
    if (mode !== 'lab') return;
    const peak = useStage.getState().params.peak as { pl: number; rl: number } | undefined;
    if (!peak || pl > peak.pl + 1e-12) set({ peak: { pl, rl } });
  }, [pl, rl, mode, set]);
  return (
    <div className="w8-layer">
      <Dock
        c={c}
        lockLab
        extra={
          <div className="w8-seg small" role="radiogroup" aria-label="镜头">
            <button role="radio" aria-checked={frame === 'bench'} className={frame === 'bench' ? 'on' : ''} onClick={() => setFrame('bench')}>
              <span className="full">全景：电源 · 面包板 · 万用表</span>
              <span className="short">全景</span>
            </button>
            <button role="radio" aria-checked={frame === 'pot'} className={frame === 'pot' ? 'on' : ''} onClick={() => setFrame('pot')}>
              <span className="full">特写：电位器</span>
              <span className="short">电位器</span>
            </button>
          </div>
        }
      />
      <div className="bb3d-wrap w8-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-24, 40, 36], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <Scene c={c} frame={frame} />
        </Canvas>
        <p className="w8-drag-hint">左右拖动旋钮调 R_L（1 kΩ 附近自动减速）</p>
      </div>
      <Panel c={c} />
      <ScaleNotice c={c} />
    </div>
  );
}
