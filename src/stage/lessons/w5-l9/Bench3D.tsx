// Layer "03 3D LM358 ±9V 双电源有源低通滤波器面包板扫频实测": the inverting active low-pass of acts
// 4 and 6 (R_i 10 kΩ, R_f 22 kΩ ∥ C_f 10 nF) built on an 830-hole board around the shared LM358
// (src/stage/Lm358.tsx, notch left, pins 1 and 8 in column 30), and three instruments, each wired by
// its own leads (the shared bench instruments of src/stage/bench):
//  - 台式可调直流电源（±9 V）: its two 9 V outputs in series, the middle COM = GND. Red lead + →
//    top outer rail (+9 V), black lead COM → top inner rail and bottom inner rail (both GND), blue
//    lead − → bottom outer rail (−9 V);
//  - 函数信号发生器: a sine, 1 Vpp by default (0.2 … 10 Vpp), 10 Hz – 100 kHz, 0 V offset; red clip
//    on h22 (input node, column 22), black clip on the top GND rail;
//  - 双通道示波器: CH1 probe tip in i22 (V_in), CH2 probe tip in g38 (V_out), both ground clips on
//    the top GND rail; its screen shows the live traces.
// Layout (column numbers; a–e upper half, f–j lower half):
//  - Pin 8 (e30) → b30 red jumper → +9 V rail; 100 nF ceramic decoupling a30 → GND rail (top inner)
//  - Pin 4 (f33) → i33 blue jumper → −9 V rail; 100 nF ceramic decoupling j33 → GND rail (bottom inner)
//  - Pin 3 (f32) → j32 black jumper → GND rail
//  - R_i 10 kΩ (brown-black-black-red-brown) g22 → g31 (Pin 2's strip)
//  - C_f 10 nF film "103" i30 – i31 and R_f 22 kΩ (red-red-black-red-brown) standing between j31 and
//    j30: both straight across Pin 2 and Pin 1, as the BOM asks
//  - Pin 1 (f30) → h30 yellow jumper → h38 (the output column); the 10 kΩ test load j38 → GND
//    rail can be plugged in; CH2 hooks g38
// Camera: the whole bench, the chip and its parts close up, the scope screen.

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, D, Lead, RAIL_Z, ROW_Z, Shell, SurfaceGlow, TrenchGlow, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { Lm358, lm358Pin } from '../../Lm358';
import { BenchSupply, FunctionGenerator, Oscilloscope, SCOPE_SCREEN, SCOPE_SIZE, supplyLabel, type ScopeCursor, type SupplyChannel, type SupplyLead } from '../../bench';
import { Capacitor } from '../../Passives3D';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { fmtDb, fmtDeg, maxInputVpp, sweep, toDb, VOH, VOL, type Sweep } from './model';
import { type Cam, Cell, FreqSlider, hoverProps, type Lab, Seg, SweepButton, Toggle, useClearHoverOnUnmount, useIsLit, useLab } from './state';

type V3 = [number, number, number];

const AMBER = '#f59e0b';
const C0 = 30;
const pc = (p: 1 | 2 | 3 | 4 | 8) => lm358Pin(C0, p).col;
const P1 = pc(1);
const P2 = pc(2);
const P3 = pc(3);
const P4 = pc(4);
const P8 = pc(8);
const VIN_COL = 22;
const OUT_COL = 38;

/* ------------------------------------------------------------- holes, rails and picking */

/** "g22", "T+6" (top outer), "T-7" (top inner), "B+6" (bottom inner), "B-7" (bottom outer) */
function hole(h: string): [number, number] {
  const m = /^([TB])([+-])(\d+)$/.exec(h);
  if (m) {
    const r: Rail = m[1] === 'T' ? (m[2] === '+' ? 'tp' : 'tn') : m[2] === '+' ? 'bp' : 'bn';
    return [colX(Number(m[3])), RAIL_Z[r]];
  }
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

/** this bench's rails: top outer +9 V, top inner and bottom inner GND, bottom outer −9 V */
const RAIL_NET: Record<Rail, string> = { tp: 'rail_p9', tn: 'rail_gnd', bp: 'rail_gnd', bn: 'rail_m9' };
const RAIL_GLOW: Record<string, string> = { rail_p9: '#ff4d5e', rail_gnd: '#4f86ff', rail_m9: '#7c3aed' };
const NETS: Record<string, string> = {
  [`u${P8}`]: 'chip_lm358_p8',
  [`l${VIN_COL}`]: 'node_vin',
  [`l${P2}`]: 'node_vg',
  [`l${P1}`]: 'node_vout',
  [`l${OUT_COL}`]: 'node_vout',
  [`l${P3}`]: 'chip_lm358_p3',
  [`l${P4}`]: 'chip_lm358_p4',
};

function pick(x: number, z: number): string[] | null {
  const c = Math.round(x + 32);
  if (Math.abs(z) < 0.95) return ['center_trench'];
  for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 2 && c <= 62) return [RAIL_NET[r]];
  if (c < 1 || c > 63) return null;
  const half = z <= -1 && z >= -6 ? 'u' : z >= 1 && z <= 6 ? 'l' : null;
  if (!half) return null;
  const n = NETS[`${half}${c}`];
  return n ? [stripId(half, c), n] : [stripId(half, c)];
}

/** strips to tint for the lit ids */
function glowStrips(lit: string[]): string[] {
  const g = new Set(lit.filter((id) => /^strip_/.test(id)));
  for (const [k, id] of Object.entries(NETS)) if (lit.includes(id)) g.add(stripId(k[0] as 'u' | 'l', Number(k.slice(1))));
  const add = (half: 'u' | 'l', c: number) => g.add(stripId(half, c));
  if (lit.includes('chip_lm358_p1')) add('l', P1);
  if (lit.includes('chip_lm358_p2')) add('l', P2);
  if (lit.includes('bb_ri')) [VIN_COL, P2].forEach((c) => add('l', c));
  if (lit.includes('bb_rf') || lit.includes('bb_cf')) [P1, P2].forEach((c) => add('l', c));
  if (lit.includes('bb_rl')) add('l', OUT_COL);
  return [...g];
}

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

/** Repaint the two GND rails' printed stripes dark and cover their printed +/− signs. */
function RailPaint() {
  const len = colX(62) - colX(2);
  const mid = (colX(2) + colX(62)) / 2;
  return (
    <group>
      {[RAIL_Z.tn + 0.6, RAIL_Z.bp - 0.6].map((z) => (
        <mesh key={z} position={[mid, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
          <planeGeometry args={[len, 0.16]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
      ))}
      {[colX(1), colX(63)].flatMap((x) =>
        [RAIL_Z.tn, RAIL_Z.bp].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
            <planeGeometry args={[0.9, 0.8]} />
            <meshBasicMaterial color="#f5f0e4" />
          </mesh>
        )),
      )}
    </group>
  );
}

function RailTags({ lit }: { lit: string[] }) {
  const tags: { id: string; text: string; col: number; r: Rail }[] = [
    { id: 'rail_p9', text: '+9 V', col: 50, r: 'tp' },
    { id: 'rail_gnd', text: 'GND', col: 50, r: 'tn' },
    { id: 'rail_gnd', text: 'GND', col: 50, r: 'bp' },
    { id: 'rail_m9', text: '−9 V', col: 50, r: 'bn' },
  ];
  return (
    <>
      {tags.map((t) => (
        <Html key={t.r} position={[colX(t.col), 0.3, RAIL_Z[t.r]]} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`w59-rtag ${t.id} ${lit.includes(t.id) ? 'lit' : ''}`}>{t.text}</div>
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
    return new THREE.TubeGeometry(curve, 72, r, 8, false);
  }, [pts, r]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.5} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.7 : 0} />
    </mesh>
  );
}

const WIRE = { red: '#d62f2f', black: '#24262b', blue: '#2f5fd0', yellow: '#e8c21c' };

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
    const h = Math.min(2.6, Math.max(0.8, 0.35 + 0.2 * dist));
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.4, z1], at(0.2, h * 0.92), at(0.5, h), at(0.8, h * 0.92), [x2, 0.4, z2], [x2, -0.3, z2]];
  }, [from, to]);
  return (
    <group {...hover3d(ids)}>
      <Tube pts={pts} color={WIRE[color]} r={0.13} lit={lit} />
    </group>
  );
}

/* ------------------------------------------------------------- parts */

const BC = { brown: '#7a4a1f', black: '#151515', red: '#c62828' };
const BANDS: Record<'10k' | '22k', string[]> = {
  '10k': [BC.brown, BC.black, BC.black, BC.red, BC.brown],
  '22k': [BC.red, BC.red, BC.black, BC.red, BC.brown],
};
/** a 5-band 1 % metal-film resistor: the four value bands from the left, the tolerance band apart */
const bandAt = (len: number, i: number, n: number) => (i === n - 1 ? len / 2 - 0.36 : -len / 2 + 0.36 + i * 0.3);

function Res({ p1, p2, bands, lit, ids, h = 1.25, label }: { p1: string; p2: string; bands: string[]; lit: boolean; ids: string[]; h?: number; label?: string }) {
  const [x1, z1] = hole(p1);
  const [x2, z2] = hole(p2);
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ang = Math.atan2(-(z2 - z1), x2 - x1);
  const bodyLen = Math.min(2.6, len - 0.6);
  const ux = (x2 - x1) / len;
  const uz = (z2 - z1) / len;
  const e1: V3 = [mx - (ux * bodyLen) / 2, h, mz - (uz * bodyLen) / 2];
  const e2: V3 = [mx + (ux * bodyLen) / 2, h, mz + (uz * bodyLen) / 2];
  return (
    <group>
      <Lead pts={[[x1, -0.3, z1], [x1, h, z1], e1]} />
      <Lead pts={[[x2, -0.3, z2], [x2, h, z2], e2]} />
      <group position={[mx, h, mz]} rotation={[0, ang, 0]} {...hover3d(ids)}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.36, bodyLen - 0.72, 6, 16]} />
          <meshStandardMaterial color="#9cc3e6" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.45 : 0} />
        </mesh>
        {bands.map((c, i) => (
          <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[bandAt(bodyLen, i, bands.length), 0, 0]}>
            <cylinderGeometry args={[0.375, 0.375, 0.14, 18]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        ))}
      </group>
      {label && <Tag at={[mx, mz]} y={h + 1.2} text={label} lit={lit} />}
    </group>
  );
}

/** R_f standing up (hairpin): body upright over `base`, its top lead bent over into `other`. */
function Hairpin({ base, other, bands, lit, ids }: { base: string; other: string; bands: string[]; lit: boolean; ids: string[] }) {
  const [x0, z0] = hole(base);
  const [x1, z1] = hole(other);
  const y0 = 0.7;
  const y1 = 3.3;
  const L = y1 - y0;
  return (
    <group>
      <Lead
        pts={[
          [x0, -0.3, z0],
          [x0, y0, z0],
        ]}
      />
      <Lead
        pts={[
          [x0, y1, z0],
          [x0, y1 + 0.45, z0],
          [x1, y1 + 0.45, z1],
          [x1, -0.3, z1],
        ]}
      />
      <group position={[x0, (y0 + y1) / 2, z0]} {...hover3d(ids)}>
        <mesh>
          <capsuleGeometry args={[0.36, L - 0.72, 6, 16]} />
          <meshStandardMaterial color="#9cc3e6" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.45 : 0} />
        </mesh>
        {bands.map((c, i) => (
          <mesh key={i} position={[0, -bandAt(L, i, bands.length), 0]}>
            <cylinderGeometry args={[0.375, 0.375, 0.14, 18]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Tag({ at, y = 2.2, text, lit, cls = '' }: { at: [number, number]; y?: number; text: string; lit?: boolean; cls?: string }) {
  return (
    <Html position={[at[0], y, at[1]]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`bb3d-tag w59-tag3 ${cls} ${lit ? 'lit' : ''}`}>{text}</div>
    </Html>
  );
}

/* ------------------------------------------------------------- instruments (src/stage/bench) */

const SUPPLY_CH: SupplyChannel[] = [{ v: 9 }, { v: 9 }];
const SUPPLY_NAME = supplyLabel(SUPPLY_CH, true);
const SUPPLY_LEADS: SupplyLead[] = [
  { from: '+', to: 'T+6', litIds: ['rail_p9'] },
  { from: 'com', to: ['T-7', 'B+6'], litIds: ['rail_gnd'] },
  { from: '-', to: 'B-7', litIds: ['rail_m9'] },
];
const PSU_AT: [number, number] = [-21, -18];
const GEN_AT: [number, number] = [-43, -1];
const SCOPE_AT: [number, number] = [12, -20];
/** the red and the black lead's way from the BNC to their clips (as before the shared instruments) */
const RED_VIA: V3[] = [[-24, 3.2, 3.6]];
const BLACK_VIA: V3[] = [[-30, 1.8, -4]];
/** the lesson text calls CH1 yellow and CH2 green */
const CH1_COLOR = '#facc15';
const CH2_COLOR = '#22c55e';

/** the scope's vertical scale: the smallest of 0.5 / 1 / 2.5 V/div that fits both channels (8 div) */
const vdivOf = (s: Sweep) => {
  const m = Math.max(s.vin, Math.min(VOH, s.want));
  return m <= 1.9 ? 0.5 : m <= 3.8 ? 1 : 2.5;
};

function Instruments({ s, vpp }: { s: Sweep; vpp: number }) {
  const vdiv = vdivOf(s);
  // two periods across the 10 divisions
  const time = useMemo(() => ({ div: 0.2 / s.f }), [s.f]);
  const ch1 = useMemo(() => ({ data: s.vi, vdiv, color: CH1_COLOR }), [s, vdiv]);
  const ch2 = useMemo(() => ({ data: s.vo, vdiv, color: CH2_COLOR, width: 7 }), [s, vdiv]);
  // at 2.5 V/div the LM358's output limits are drawn as dashed lines
  const cursors = useMemo<ScopeCursor[]>(() => (vdiv === 2.5 ? [VOH, VOL].map((at) => ({ kind: 'v', ch: 'ch2', at, color: '#f87171' })) : []), [vdiv]);
  return (
    <>
      <BenchSupply id="bb_psu" position={PSU_AT} channels={SUPPLY_CH} series leads={SUPPLY_LEADS} />
      <FunctionGenerator
        id="bb_gen"
        position={GEN_AT}
        waveform="sine"
        frequency={s.f}
        vpp={vpp}
        out={`h${VIN_COL}`}
        gnd="T-18"
        outVia={RED_VIA}
        gndVia={BLACK_VIA}
        litIds={['node_vin']}
      />
      <Oscilloscope
        id="bb_scope"
        position={SCOPE_AT}
        ch1={ch1}
        ch2={ch2}
        time={time}
        cursors={cursors}
        osd={[{ text: `CH2 ${s.vpp.toFixed(2)} Vpp`, tone: 'ch2' }]}
        probes={{
          ch1: { tip: `i${VIN_COL}`, ground: 'T-20', id: 'ch1_probe', groundId: 'rail_gnd', litIds: ['node_vin'] },
          ch2: { tip: `g${OUT_COL}`, ground: 'T-40', id: 'ch2_probe', groundId: 'rail_gnd', litIds: ['node_vout'], color: '#16a34a' },
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------- camera */

const FRAMES: Record<Cam, { x: [number, number]; y: [number, number]; z: [number, number]; dir: [number, number, number] }> = {
  bench: { x: [-49, 25], y: [-1, 12.5], z: [-24, 10], dir: [0, 1.3, 1] },
  chip: { x: [-11.5, 10.5], y: [-1, 4], z: [-10, 10], dir: [0, 1.6, 1] },
  scope: {
    x: [SCOPE_AT[0] + SCOPE_SCREEN.x - SCOPE_SCREEN.w / 2 - 1, SCOPE_AT[0] + SCOPE_SCREEN.x + SCOPE_SCREEN.w / 2 + 1],
    y: [SCOPE_SCREEN.y - 1 - SCOPE_SCREEN.h / 2 - 0.5, SCOPE_SCREEN.y - 1 + SCOPE_SCREEN.h / 2 + 0.5],
    z: [SCOPE_AT[1] + SCOPE_SIZE.d / 2, SCOPE_AT[1] + SCOPE_SIZE.d / 2],
    dir: [0, 0.3, 1],
  },
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

function Scene({ lab, s, frame, nonce }: { lab: Lab; s: Sweep; frame: Cam; nonce: number }) {
  const lit = useLit();
  const setHover = useStage((st) => st.setHover);
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
  const close = frame === 'chip';
  const rails = [...lit];
  if (is('bb_psu')) rails.push('rail_p9', 'rail_gnd', 'rail_m9');
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Shell xray={0} />
      <RailPaint />
      <SurfaceGlow lit={glowStrips(lit)} />
      <RailGlow lit={rails} />
      <TrenchGlow on={is('center_trench')} />
      <RailTags lit={rails} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>

      {/* the chip, its supply and decoupling */}
      <Lm358 c0={C0} tag={close ? '' : 'LM358'} pinNumbers={close} />
      <Jumper from={`b${P8}`} to="T+32" color="red" lit={is('rail_p9', 'chip_lm358_p8')} ids={['chip_lm358_p8']} />
      <Jumper from={`i${P4}`} to="B-35" color="blue" lit={is('rail_m9', 'chip_lm358_p4')} ids={['chip_lm358_p4']} />
      <Jumper from={`j${P3}`} to={`B+${P3}`} color="black" lit={is('rail_gnd', 'chip_lm358_p3')} ids={['chip_lm358_p3']} />
      <Capacitor p1={[colX(P8), ROW_Z.a]} p2={[colX(P8), RAIL_Z.tn]} kind="ceramic" id="bb_dec" label={close ? '104' : ''} />
      <Capacitor p1={[colX(P4), ROW_Z.j]} p2={[colX(P4), RAIL_Z.bp]} kind="ceramic" id="bb_dec" label={close ? '104' : ''} />

      {/* the filter */}
      <Res p1={`g${VIN_COL}`} p2={`g${P2}`} bands={BANDS['10k']} lit={is('bb_ri')} ids={['bb_ri']} label={close ? 'Ri 10 kΩ' : undefined} />
      <Capacitor p1={[colX(P1), ROW_Z.i]} p2={[colX(P2), ROW_Z.i]} kind="film" id="bb_cf" label={close ? 'Cf 103' : ''} />
      <Hairpin base={`j${P2}`} other={`j${P1}`} bands={BANDS['22k']} lit={is('bb_rf')} ids={['bb_rf']} />
      {close && <Tag at={[colX(P2) + 2.6, ROW_Z.j + 0.6]} y={3.4} text="Rf 22 kΩ" lit={is('bb_rf')} />}
      <Jumper from={`h${P1}`} to={`h${OUT_COL}`} color="yellow" lit={is('node_vout')} ids={['node_vout']} />
      {lab.load && <Res p1={`j${OUT_COL}`} p2="B+41" bands={BANDS['10k']} lit={is('bb_rl')} ids={['bb_rl']} h={1.0} label={close ? 'RL 10 kΩ' : undefined} />}

      <Instruments s={s} vpp={lab.vpp} />

      <OrbitControls makeDefault enableDamping={false} minDistance={6} maxDistance={140} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig frame={frame} nonce={nonce} />
    </>
  );
}

/* ------------------------------------------------------------- HUD and layer */

export default function Bench3D() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const on = useIsLit();
  const [frame, setFrame] = useStageParam<Cam>('cam', 'bench');
  const [nonce, setNonce] = useStageParam('camNonce', 0);
  const s = useMemo(() => sweep(lab.f, lab.vpp), [lab.f, lab.vpp]);
  const ampOn = on('bb_gen');
  return (
    <div className="w59-layer">
      <div className="w59-dock">
        <FreqSlider lab={lab} />
      </div>
      <div className="w59-dock">
        <label className={`w59-slider w59-amp ${ampOn}`} {...hoverProps(['bb_gen'])}>
          <span className="w59-slider-label">Vin</span>
          <input type="range" min={0.2} max={10} step={0.1} value={lab.vpp} onChange={(e) => lab.set({ vpp: Number(e.target.value) })} aria-label="信号源幅度（Vpp）" />
          <b className="w59-num">{lab.vpp.toFixed(1)} Vpp</b>
        </label>
        <Toggle
          on={lab.load}
          onClick={() => lab.set({ load: !lab.load })}
          label={lab.load ? '拔掉 Pin 1 的 10 kΩ 负载' : '在 Pin 1 接入 10 kΩ 负载'}
          short={lab.load ? '拔 RL' : '接 RL'}
          ids={['bb_rl']}
        />
        <SweepButton lab={lab} />
      </div>
      <div className="bb3d-wrap w59-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-12, 58, 44], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <Scene lab={lab} s={s} frame={frame} nonce={nonce} />
        </Canvas>
        <div className="w59-camsel">
          <Seg<Cam>
            label="镜头"
            value={frame}
            onChange={setFrame}
            options={[
              { value: 'bench', label: '全景', short: '全景' },
              { value: 'chip', label: '芯片引脚特写', short: '引脚' },
              { value: 'scope', label: '示波器扫频', short: '屏幕' },
            ]}
          />
          <button className="w59-fold" onClick={() => setNonce(nonce + 1)} title="复位镜头">
            复位
          </button>
        </div>
        {s.clipped && (
          <p className="w59-clip" role="alert" {...hoverProps(['ch2_probe'])}>
            削波：想要 ±{s.want.toFixed(2)} V，LM358 输出只能到 +{VOH} V / {VOL} V（通带最大输入约 {maxInputVpp().toFixed(1)} Vpp）
          </p>
        )}
      </div>
      <div className="w59-cells">
        <Cell id="ch1_probe" name="CH1 Vin" value={`${lab.vpp.toFixed(2)} Vpp`} tone="minor" />
        <Cell id="ch2_probe" name="CH2 Vout" value={`${s.vpp.toFixed(2)} Vpp`} tone={s.clipped ? 'bad' : 'good'} />
        <Cell id="node_vout" name="增益" value={s.clipped ? '削波' : fmtDb(toDb(s.gain))} tone={s.clipped ? 'bad' : ''} />
        <Cell id="bb_scope" name="总相移" value={fmtDeg(s.phase)} tone="minor" hint="CH2 相对 CH1" />
        <Cell id="bb_rl" name="10 kΩ 负载" value={lab.load ? '已接：纹丝不动' : '未接'} tone={lab.load ? 'good' : 'minor'} />
        <Cell id="bb_psu" name="电源" value="±9.00 V" tone="minor" hint={SUPPLY_NAME} />
      </div>
      <p className={`w59-notice w59-bench-notice ${on('safety_note')}`} {...hoverProps(['safety_note'])} role="note">
        <span className="full">
          {SUPPLY_NAME}两路串联、COM 作 GND · Pin 8 → +9 V、Pin 4 → −9 V（上电前断电核对）· 所有地共接 GND 轨 · LM358 输出摆幅约 +7.5 V / −8.9 V · kΩ 级原值搭建、无需缩放
        </span>
        <span className="short">±9 V 双电源 · 地全接 GND 轨 · 摆幅 +7.5 / −8.9 V</span>
      </p>
    </div>
  );
}
