// Layer "03 3D LM358 面包板实测": the shared LM358 (DIP-8, notch left, pins 1 and 8 in column 28)
// across the centre trench of an 830-hole board, powered by a bench supply box wired by leads:
// 「台式可调直流电源（±9 V）」 — + to the top red rail (+9 V), COM to the top blue and the bottom
// red rail (GND), − to the bottom blue rail (−9 V). A red jumper takes +9 V to Pin 8 (a28 ← top +
// rail), Pin 4 goes to −9 V (j31 → bottom − rail) or, on a single +9 V supply, to GND. A second
// bench supply gives the input signals (both the shared BenchSupply of src/stage/bench). Three presets:
//  - 同相放大器（运放 A）: v_i on Pin 3 (j30), an orange jumper g29–g25 brings v− (Pin 2) to column
//    25, R_f = 20 kΩ (red-black-orange) i25–i28 to the output Pin 1, R_1 = 10 kΩ (brown-black-orange)
//    j25 → GND rail;
//  - 电压跟随器（运放 B）: Pin 6–Pin 7 shorted (orange d29–d30), the "sensor" = 5 V + R_Th = 10 kΩ
//    (c31–c36) on Pin 5, R_L = 1 kΩ (brown-black-red) from Pin 7 (a29) to GND; "直连" moves R_L onto
//    the sensor node (a31) — the follower is bypassed;
//  - Sadiku Example 5.5: 4 V on Pin 3, 6 V via R_1 = 4 kΩ (two 2 kΩ red-black-red in series,
//    h25–h21 and i21–i17; 4 kΩ is not an E24 value) into v−, R_f = 10 kΩ i25–i28.
// A multimeter (DC V) reads the output, v+ or v− (the sheet's "三秒黄金排错法"): the LM358 output
// clips at about +7.5 V (V+ − 1.5 V), −7.5 V on ±9 V, +0.02 V on a single supply. While the guided
// example has not found v_o, the Example 5.5 readings stay hidden.

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, D, RAIL_Z, ROW_Z, Resistor, Shell, SurfaceGlow, TrenchGlow, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { Lm358 } from '../../Lm358';
import { BENCH_NAMES, BenchSupply, LEAD_COLORS, type SupplyChannel, type SupplyLead } from '../../bench';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { bench, fmtSigned, fmtV, type Preset, type ProbeAt, type Supply, WINDOW } from './model';
import { Cell, hoverProps, SupplySeg, useClearHoverOnUnmount, useEx55Reveal, useIsLit, useSupply } from './state';

type V3 = [number, number, number];

/** pins 1 and 8 of the LM358 sit in column 28 */
export const C0 = 28;

/* ------------------------------------------------------------- holes */

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

/** the nets of each preset: strip ('u29' = column 29 rows a–e, 'l25' = rows f–j) → stage id */
function nets(preset: Preset, supply: Supply): Record<string, string> {
  const common: Record<string, string> = { u28: 'rail_p9', l31: supply === 'dual' ? 'rail_m9' : 'rail_gnd' };
  if (preset === 'ni') return { ...common, l25: 'vminus', l29: 'vminus', l28: 'vo', l30: 'vi' };
  if (preset === 'ex55') return { ...common, l25: 'vminus', l29: 'vminus', l28: 'vo', l30: 'vs2', l17: 'vs1', l21: 'r1' };
  return { ...common, u29: 'vo', u30: 'vo', u31: 'vi', u36: 'vth' };
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

const WIRE = { red: LEAD_COLORS.red, black: LEAD_COLORS.black, blue: LEAD_COLORS.blue, orange: LEAD_COLORS.orange };
type WireColor = keyof typeof WIRE;

function Jumper({ from, to, color, lit, id }: { from: string; to: string; color: WireColor; lit?: boolean; id?: string }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(from);
    const [x2, z2] = hole(to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const h = Math.min(2.6, Math.max(0.8, 0.35 + 0.2 * dist));
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.4, z1], at(0.2, h * 0.92), at(0.5, h), at(0.8, h * 0.92), [x2, 0.4, z2], [x2, -0.3, z2]];
  }, [from, to]);
  const setHover = useStage((s) => s.setHover);
  return (
    <group
      onPointerOver={
        id
          ? (e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              setHover([id]);
            }
          : undefined
      }
      onPointerOut={id ? () => setHover(null) : undefined}
    >
      <Tube pts={pts} color={WIRE[color]} r={0.13} lit={lit} />
    </group>
  );
}

/* ------------------------------------------------------------- bench supplies (src/stage/bench) */

/** the op amp's supply: CH1 and CH2 in series for ±9 V (COM = GND), or CH1 alone for +9 V */
const DUAL: SupplyChannel[] = [{ v: 9 }, { v: 9 }];
const SINGLE: SupplyChannel[] = [{ v: 9 }];

/* ------------------------------------------------------------- multimeter */

const DMM = { x: 20, y: 1.6, z: 17, tilt: 1.2, w: 8, h: 11, t: 1.4 };

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
    () => [[x, 4.3, z], [x, 7.0, z + 2.4], [x + (DMM.x - x) * 0.4, 6.2, 13.5], [DMM.x - 2 + jack * 0.3, 1.4, j[2] + 1.2], j2, j],
    [x, z, jack, j[2]], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const hex = color === 'red' ? WIRE.red : WIRE.black;
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

function Meter({ text, lit, sub }: { text: string; lit: boolean; sub: string }) {
  const lcd = dmmWorld([0, 2.6, DMM.t / 2 + 0.05]);
  return (
    <group>
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
        <div className={`w34-lcd ${lit ? 'lit' : ''}`} {...hoverProps(['dmm'])} tabIndex={0} data-hl="dmm">
          <small>DC V</small>
          <b>{text}</b>
          <span>{sub}</span>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- camera */

type Frame = 'bench' | 'chip';
const VIEW_DIR = new THREE.Vector3(0, 1.7, 1).normalize();
/** a wide, short canvas (a phone's stage): a lower view and a tighter overview, so the board fills it */
const VIEW_DIR_WIDE = new THREE.Vector3(0, 1.25, 1).normalize();
const FRAMES: Record<Frame, { x: [number, number]; z: [number, number] }> = {
  bench: { x: [-34, 34], z: [-17, 15] },
  chip: { x: [-17, 6], z: [-10, 10] },
};
const FRAMES_WIDE: Record<Frame, { x: [number, number]; z: [number, number] }> = {
  bench: { x: [-33, 33], z: [-15, 12] },
  chip: { x: [-19, 8], z: [-9, 9] },
};

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: (typeof FRAMES)['bench'], dir: THREE.Vector3): [THREE.Vector3, THREE.Vector3] {
  const target = new THREE.Vector3((f.x[0] + f.x[1]) / 2, 0.5, (f.z[0] + f.z[1]) / 2);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of f.x) for (const y of [-1, 4.5]) for (const z of f.z) corners.push(new THREE.Vector3(x, y, z));
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

function CameraRig({ frame }: { frame: Frame }) {
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

/* ------------------------------------------------------------- the board */

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

const BANDS: Record<string, string[]> = {
  '1k': ['#7a4a1f', '#151515', '#c62828', '#d4a72c'],
  '2k': ['#c62828', '#151515', '#c62828', '#d4a72c'],
  '10k': ['#7a4a1f', '#151515', '#f07a1a', '#d4a72c'],
  '20k': ['#c62828', '#151515', '#f07a1a', '#d4a72c'],
};

function Res({ a, b, id, label, value, lit }: { a: string; b: string; id: string; label: string; value: keyof typeof BANDS; lit: boolean }) {
  const setHover = useStage((s) => s.setHover);
  return <Resistor p1={hole(a)} p2={hole(b)} lit={lit} tone="good" label={label} bands={BANDS[value]} onHover={(on) => setHover(on ? [id] : null)} />;
}

/** where the red probe sits for each preset and point */
function probeHole(preset: Preset, at: ProbeAt, buf: boolean): string {
  if (preset === 'buf') return at === 'out' ? (buf ? 'c29' : 'b31') : at === 'vplus' ? 'b31' : 'c30';
  return at === 'out' ? 'j28' : at === 'vplus' ? 'h30' : 'f25';
}

interface Bench {
  preset: Preset;
  supply: Supply;
  vi: number;
  buf: boolean;
  probe: ProbeAt;
  reading: string;
  hidden: boolean;
}

function Scene({ b, frame }: { b: Bench; frame: Frame }) {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const is = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const net = useMemo(() => nets(b.preset, b.supply), [b.preset, b.supply]);
  // strips of every lit net glow on the board
  const glow = new Set(lit.filter((id) => /^strip_/.test(id)));
  for (const [k, id] of Object.entries(net)) if (lit.includes(id)) glow.add(stripId(k[0] as 'u' | 'l', Number(k.slice(1))));
  const rails = [...lit];
  if (is('psu')) rails.push('rail_p9', 'rail_gnd', ...(b.supply === 'dual' ? ['rail_m9'] : []));
  const last = useRef<string | null>(null);
  const move = (e: ThreeEvent<PointerEvent>) => {
    const ids = pick(e.point.x, e.point.z, net);
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
  const dual = b.supply === 'dual';
  const { preset } = b;
  const amp = preset !== 'buf';
  const ex = preset === 'ex55';
  const psuLeads: SupplyLead[] = [
    { from: '+', to: 'T+15', litIds: ['rail_p9'] },
    { from: dual ? 'com' : '-', to: ['T-16', 'B+3'], litIds: ['rail_gnd'] },
    ...(dual ? [{ from: '-', to: 'B-5', litIds: ['rail_m9'] } satisfies SupplyLead] : []),
  ];
  const sigChannels: SupplyChannel[] = ex
    ? [
        { v: 6, color: LEAD_COLORS.yellow },
        { v: 4, color: LEAD_COLORS.green },
      ]
    : [{ v: preset === 'ni' ? b.vi : 5, color: LEAD_COLORS.yellow }];
  const sigLeads: SupplyLead[] = ex
    ? [
        { from: '1+', to: 'j17', litIds: ['vs1'] },
        { from: '1-', to: 'T-45' },
        { from: '2+', to: 'j30', litIds: ['vs2'] },
        { from: '2-', to: 'T-47' },
      ]
    : [
        { from: '+', to: amp ? 'j30' : 'a36', litIds: [amp ? 'vi' : 'vth'] },
        { from: '-', to: 'T-45' },
      ];
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Shell xray={0} />
      <SurfaceGlow lit={[...glow]} />
      <RailGlow lit={rails} />
      <TrenchGlow on={is('center_trench')} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>

      {/* power: the ±9 V bench supply and the chip's supply pins */}
      <BenchSupply id="psu" position={[-24, -17.5]} channels={dual ? DUAL : SINGLE} series={dual} label={dual ? undefined : `${BENCH_NAMES.supply}（+9 V）`} leads={psuLeads} />
      <Jumper from="T+27" to="a28" color="red" lit={is('rail_p9', 'chip_lm358_p8')} id="rail_p9" />
      <Jumper from="j31" to={dual ? 'B-33' : 'B+33'} color={dual ? 'blue' : 'black'} lit={is('rail_m9', 'chip_lm358_p4')} id={dual ? 'rail_m9' : 'rail_gnd'} />
      <Lm358 c0={C0} pinNumbers />

      {/* the signal supply */}
      <BenchSupply id="sig_psu" position={[22, -17.5]} channels={sigChannels} leads={sigLeads} />

      {amp && (
        <>
          <Jumper from="g29" to="g25" color="orange" lit={is('vminus')} id="vminus" />
          <Res a="i25" b="i28" id="rf" label={ex ? 'R_f 10 kΩ' : 'R_f 20 kΩ'} value={ex ? '10k' : '20k'} lit={is('rf')} />
          {ex ? (
            <>
              <Res a="h25" b="h21" id="r1" label="R_1 2 kΩ" value="2k" lit={is('r1')} />
              <Res a="i21" b="i17" id="r1" label="+ 2 kΩ（R_1 = 4 kΩ）" value="2k" lit={is('r1')} />
            </>
          ) : (
            <Res a="j25" b="B+25" id="r1" label="R_1 10 kΩ" value="10k" lit={is('r1')} />
          )}
        </>
      )}
      {preset === 'buf' && (
        <>
          <Jumper from="d29" to="d30" color="orange" lit={is('jump_67', 'vo')} id="jump_67" />
          <Res a="c31" b="c36" id="rth" label="R_Th 10 kΩ" value="10k" lit={is('rth')} />
          <Res a={b.buf ? 'a29' : 'a31'} b={b.buf ? 'T-29' : 'T-31'} id="rl" label="R_L 1 kΩ" value="1k" lit={is('rl')} />
        </>
      )}

      <Probe at={probeHole(preset, b.probe, b.buf)} color="red" jack={2.4} lit={is('dmm')} />
      <Probe at="B+45" color="black" jack={0} lit={is('dmm')} />
      <Meter text={b.reading} lit={is('dmm')} sub="V" />
      <OrbitControls makeDefault enableDamping={false} minDistance={8} maxDistance={130} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig frame={frame} />
    </>
  );
}

/* ------------------------------------------------------------- the layer */

const PRESET_LABEL: Record<Preset, [string, string]> = {
  ni: ['同相放大 A_v = 3（运放 A）', '同相 ×3'],
  buf: ['电压跟随器（运放 B）', '跟随器'],
  ex55: ['Example 5.5 复现', '例 5.5'],
};
const PROBE_LABEL: Record<ProbeAt, [string, string]> = {
  out: ['输出 v_o', 'v_o'],
  vplus: ['同相端 v+', 'v+'],
  vminus: ['反相端 v−', 'v−'],
};
const PROBE_PIN: Record<Preset, Record<ProbeAt, string>> = {
  ni: { out: 'Pin 1', vplus: 'Pin 3', vminus: 'Pin 2' },
  ex55: { out: 'Pin 1', vplus: 'Pin 3', vminus: 'Pin 2' },
  buf: { out: 'R_L 上端', vplus: 'Pin 5', vminus: 'Pin 6' },
};

export default function Bench3D() {
  useClearHoverOnUnmount();
  const [preset, setPreset] = useStageParam<Preset>('preset', 'ni');
  const [vi, setVi] = useStageParam('bvi', 1.5);
  const [buf, setBuf] = useStageParam('bbuf', true);
  const [probe, setProbe] = useStageParam<ProbeAt>('probe', 'out');
  const [frame, setFrame] = useStageParam<Frame>('cam', 'bench');
  const [supply] = useSupply();
  const reveal = useEx55Reveal();
  const on = useIsLit();
  const r = bench(preset, supply, vi, buf);
  const hidden = preset === 'ex55' && reveal < 4;
  const val = probe === 'out' ? r.vout : probe === 'vplus' ? r.vplus : r.vminus;
  const reading = hidden ? '-.--' : (val < -0.005 ? '-' : ' ') + Math.abs(val).toFixed(2);
  const q = (s: string) => (hidden ? '?' : s);
  const short = Math.abs(r.vplus - r.vminus) < 0.005;
  const [lo, hi] = WINDOW[supply];
  const b: Bench = { preset, supply, vi, buf, probe, reading, hidden };
  return (
    <div className="w34-layer">
      <div className="w34-dock">
        <div className="w34-row">
          <div className="w34-seg" role="radiogroup" aria-label="接线预设">
            {(['ni', 'buf', 'ex55'] as Preset[]).map((p) => (
              <button key={p} role="radio" aria-checked={preset === p} className={preset === p ? 'on' : ''} onClick={() => setPreset(p)}>
                <span className="full">{PRESET_LABEL[p][0]}</span>
                <span className="short">{PRESET_LABEL[p][1]}</span>
              </button>
            ))}
          </div>
          <SupplySeg />
        </div>
        <div className="w34-row">
          <div className="w34-seg small" role="radiogroup" aria-label="红表笔位置" {...hoverProps(['dmm'])}>
            {(['out', 'vplus', 'vminus'] as ProbeAt[]).map((p) => (
              <button key={p} role="radio" aria-checked={probe === p} className={probe === p ? 'on' : ''} onClick={() => setProbe(p)}>
                <span className="full">
                  红表笔：{PROBE_LABEL[p][0]}（{PROBE_PIN[preset][p]}）
                </span>
                <span className="short">{PROBE_LABEL[p][1]}</span>
              </button>
            ))}
          </div>
          {preset === 'ni' && (
            <label className={`w34-slider ${on('vi')}`} {...hoverProps(['vi'])}>
              <span className="w34-sl-name">v_i</span>
              <input
                type="range"
                min={0}
                max={3.5}
                step={0.1}
                value={vi}
                onChange={(e) => setVi(Math.round(Number(e.target.value) * 10) / 10)}
                aria-label="输入电压 v_i"
                aria-valuetext={fmtV(vi, 1)}
              />
              <b>{fmtV(vi, 1)}</b>
            </label>
          )}
          {preset === 'buf' && (
            <div className="w34-seg small" role="radiogroup" aria-label="负载接法" {...hoverProps(['rl'])}>
              <button role="radio" aria-checked={buf} className={buf ? 'on good' : ''} onClick={() => setBuf(true)}>
                <span className="full">R_L 接 Pin 7（经跟随器）</span>
                <span className="short">经跟随器</span>
              </button>
              <button role="radio" aria-checked={!buf} className={!buf ? 'on bad' : ''} onClick={() => setBuf(false)}>
                <span className="full">拔掉跟随器直连</span>
                <span className="short">直连</span>
              </button>
            </div>
          )}
          <div className="w34-seg small" role="radiogroup" aria-label="镜头">
            <button role="radio" aria-checked={frame === 'bench'} className={frame === 'bench' ? 'on' : ''} onClick={() => setFrame('bench')}>
              <span className="full">全景</span>
              <span className="short">全景</span>
            </button>
            <button role="radio" aria-checked={frame === 'chip'} className={frame === 'chip' ? 'on' : ''} onClick={() => setFrame('chip')}>
              <span className="full">芯片特写</span>
              <span className="short">特写</span>
            </button>
          </div>
        </div>
      </div>
      <div className={`bb3d-wrap w34-bench ${frame}`}>
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-10, 60, 40], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <Scene b={b} frame={frame} />
        </Canvas>
      </div>
      {!hidden && r.sat && (
        <p className="w34-alarm" role="alert" {...hoverProps(['sat'])}>
          <b>饱和</b>
          <span className="full">
            理想 {fmtSigned(r.ideal)} 超出 LM358 线性窗口 [{fmtSigned(lo, 2)}, {fmtSigned(hi, 1)}]，输出卡在 {fmtSigned(r.vout)}；v+ ≠ v−，虚短失效
          </span>
          <span className="short">
            输出卡在 {fmtSigned(r.vout)}（理想 {fmtSigned(r.ideal)}），虚短失效
          </span>
        </p>
      )}
      <div className="w34-cells four">
        <Cell id="dmm" name={`万用表（${PROBE_LABEL[probe][1]}）`} short="DMM" value={hidden ? '?' : fmtSigned(val)} cls="big" />
        <Cell id="vi" name="v+" value={q(fmtSigned(r.vplus))} />
        <Cell id="vminus" name="v−" value={q(fmtSigned(r.vminus))} />
        <Cell id="sat" name="虚短 v+ = v−" short="虚短" value={hidden ? '?' : short ? '成立' : '失效'} cls={hidden ? '' : short ? 'good' : 'bad'} />
      </div>
    </div>
  );
}
