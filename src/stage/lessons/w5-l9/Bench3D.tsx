// Layer "03 3D LM358 ±9V 双电源有源低通滤波器面包板扫频实测": the inverting active low-pass of acts
// 4 and 6 (R_i 10 kΩ, R_f 22 kΩ ∥ C_f 10 nF) built on an 830-hole board around the shared LM358
// (src/stage/Lm358.tsx, notch left, pins 1 and 8 in column 30), and three instruments, each wired by
// its own leads (adapted from W4-L8's generator and scope and W4-L3's supply box):
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

import { Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, D, Lead, RAIL_Z, ROW_Z, Shell, SurfaceGlow, TrenchGlow, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { Lm358, lm358Pin } from '../../Lm358';
import { BENCH_NAMES, Capacitor } from '../../Passives3D';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { fmtDb, fmtDeg, fmtHz, maxInputVpp, sweep, toDb, VOH, VOL, type Sweep } from './model';
import { type Cam, Cell, FreqSlider, hoverProps, type Lab, Seg, SweepButton, Toggle, useClearHoverOnUnmount, useIsLit, useLab } from './state';

type V3 = [number, number, number];

export const SUPPLY_NAME = `${BENCH_NAMES.supply}（±9 V）`;
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

/** an instrument lead from a front-panel terminal (world point) to a hole, in an arc over the board */
function Cable({ from, to, color, lit }: { from: V3; to: string; color: keyof typeof WIRE; lit?: boolean }) {
  const pts = useMemo<V3[]>(() => {
    const [x, z] = hole(to);
    const lift = Math.min(5, 1.8 + Math.hypot(x - from[0], z - from[2]) * 0.09);
    const mid: V3 = [(from[0] + x) / 2, lift, (from[2] + 1.4 + z) / 2];
    return [from, [from[0], from[1] + 0.25, from[2] + 1.4], mid, [x, 2.0, z - 0.4], [x, 0.9, z], [x, -0.3, z]];
  }, [from, to]);
  return <Tube pts={pts} color={WIRE[color]} r={0.14} lit={lit} />;
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

/* ------------------------------------------------------------- the ±9 V bench supply */

const PSU = { x: -21, z: -18, w: 10, h: 5, d: 7 };
const PSU_FRONT = PSU.z + PSU.d / 2;

function BenchSupply({ lit, is }: { lit: boolean; is: (...ids: string[]) => boolean }) {
  const posts: { dx: number; color: keyof typeof WIRE; to: string[]; on: boolean }[] = [
    { dx: -3, color: 'red', to: ['T+6'], on: lit || is('rail_p9') },
    { dx: -1, color: 'black', to: ['T-7', 'B+6'], on: lit || is('rail_gnd') },
    { dx: 1, color: 'blue', to: ['B-7'], on: lit || is('rail_m9') },
  ];
  return (
    <group name="mesh_bench_psu">
      <group {...hover3d(['bb_psu'])}>
        <mesh position={[PSU.x, PSU.h / 2 - 0.5, PSU.z]}>
          <boxGeometry args={[PSU.w, PSU.h, PSU.d]} />
          <meshStandardMaterial color="#d9dde3" roughness={0.55} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.3 : 0} />
        </mesh>
        <mesh position={[PSU.x, PSU.h / 2 - 0.5, PSU_FRONT + 0.01]}>
          <planeGeometry args={[PSU.w - 0.6, PSU.h - 0.5]} />
          <meshStandardMaterial color="#3b4250" roughness={0.7} />
        </mesh>
        {[2.6, 4.0].map((dx) => (
          <mesh key={dx} position={[PSU.x + dx, PSU.h - 2.2, PSU_FRONT + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.6, 20]} />
            <meshStandardMaterial color="#9aa1ab" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {posts.map((p) => (
          <mesh key={p.dx} position={[PSU.x + p.dx, 0.6, PSU_FRONT + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.5, 14]} />
            <meshStandardMaterial color={WIRE[p.color]} />
          </mesh>
        ))}
      </group>
      {posts.flatMap((p) => p.to.map((h) => <Cable key={`${p.dx}${h}`} from={[PSU.x + p.dx, 0.6, PSU_FRONT + 0.5]} to={h} color={p.color} lit={p.on} />))}
      <Html position={[PSU.x - 1.2, PSU.h - 1.4, PSU_FRONT + 0.05]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w59-lcd3">
          <b>CH1 +9.00 V</b>
          <b>CH2 −9.00 V</b>
          <span>串联 · COM = GND</span>
        </div>
      </Html>
      <Html position={[PSU.x, PSU.h + 0.9, PSU.z - PSU.d / 2]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w59-tag3 psu ${lit ? 'lit' : ''}`}>{SUPPLY_NAME}</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- function generator (after W4-L8) */

const GEN = { x: -43, z: -1, w: 11, h: 4.6, d: 8 };
const GEN_FRONT = GEN.z + GEN.d / 2;
const BNC_OUT: V3 = [GEN.x + 3.6, 0.4, GEN_FRONT + 0.4];

function Generator({ s, vpp, lit }: { s: Sweep; vpp: number; lit: boolean }) {
  const red = useMemo<V3[]>(() => {
    const [x, z] = hole(`h${VIN_COL}`);
    return [BNC_OUT, [BNC_OUT[0] + 2, 1.6, BNC_OUT[2] + 1.5], [-24, 3.2, 3.6], [x - 1.2, 2.4, z + 0.4], [x, 2.0, z]];
  }, []);
  const black = useMemo<V3[]>(() => {
    const [x, z] = hole('T-18');
    return [BNC_OUT, [BNC_OUT[0] + 1.6, 1.2, BNC_OUT[2] + 1.2], [-30, 1.8, -4], [x - 0.6, 2.0, z + 0.3], [x, 1.7, z]];
  }, []);
  const [hx, hz] = hole(`h${VIN_COL}`);
  const [gx, gz] = hole('T-18');
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
        <mesh position={[BNC_OUT[0], BNC_OUT[1], GEN_FRONT + 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.5, 16]} />
          <meshStandardMaterial color="#c8ccd2" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[BNC_OUT[0], BNC_OUT[1] + 1.05, GEN_FRONT + 0.06]}>
          <planeGeometry args={[1.3, 0.5]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>
      <Tube pts={red} color={WIRE.red} r={0.14} lit={lit} />
      <Tube pts={black} color={WIRE.black} r={0.14} lit={lit} />
      <Stub at={`h${VIN_COL}`} color={WIRE.red} />
      <Stub at="T-18" color={WIRE.black} />
      <Clip at={[hx + 0.15, 1.5, hz]} color={WIRE.red} lit={lit} />
      <Clip at={[gx + 0.15, 1.5, gz]} color={WIRE.black} lit={lit} />
      <Html position={[GEN.x - 1.2, GEN.h - 1.6, GEN_FRONT + 0.05]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w59-gen-lcd">
          <b>SINE {fmtHz(s.f)}</b>
          <span>{vpp.toFixed(2)} Vpp · OFS 0 V</span>
          <span>OUTPUT ON</span>
        </div>
      </Html>
      <Html position={[GEN.x, GEN.h + 0.8, GEN.z - GEN.d / 2]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w59-tag3 gen ${lit ? 'lit' : ''}`}>{BENCH_NAMES.generator}</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- oscilloscope (after W4-L8) */

const SCOPE = { x: 12, z: -20, w: 24, h: 13.5, d: 7 };
const S_FRONT = SCOPE.z + SCOPE.d / 2;
const SCREEN = { x: SCOPE.x - 3.2, y: 6.3, w: 14.5, h: 9.2 };
const JACK: Record<'ch1' | 'ch2', V3> = { ch1: [SCOPE.x + 6.6, 0.6, S_FRONT + 0.3], ch2: [SCOPE.x + 9.2, 0.6, S_FRONT + 0.3] };

/** the scope's vertical scale: the smallest of 0.5 / 1 / 2.5 V/div that fits both channels (8 div) */
export const vdivOf = (s: Sweep) => {
  const m = Math.max(s.vin, Math.min(VOH, s.want));
  return m <= 1.9 ? 0.5 : m <= 3.8 ? 1 : 2.5;
};

function ScopeScreen({ s }: { s: Sweep }) {
  const vdiv = vdivOf(s);
  const span = 2 / s.f;
  const sx = (t: number) => SCREEN.x - SCREEN.w / 2 + (t / span) * SCREEN.w;
  const sy = (v: number) => SCREEN.y + (Math.max(-4, Math.min(4, v / vdiv)) / 8) * SCREEN.h;
  const z = S_FRONT + 0.04;
  const trace = (fn: (t: number) => number): V3[] =>
    Array.from({ length: 241 }, (_, k) => {
      const t = (k / 240) * span;
      return [sx(t), sy(fn(t)), z + 0.01] as V3;
    });
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
  const rails = vdiv === 2.5;
  return (
    <group>
      <mesh position={[SCREEN.x, SCREEN.y, S_FRONT + 0.02]}>
        <planeGeometry args={[SCREEN.w + 0.4, SCREEN.h + 0.4]} />
        <meshBasicMaterial color="#0b1a14" />
      </mesh>
      {grid.map((g, i) => (
        <Line key={i} points={g} color={i === 15 ? '#5f7f70' : '#264136'} lineWidth={i === 15 ? 1.2 : 0.8} />
      ))}
      {rails &&
        [VOH, VOL].map((v) => (
          <Line
            key={v}
            points={[
              [SCREEN.x - SCREEN.w / 2, sy(v), z + 0.005],
              [SCREEN.x + SCREEN.w / 2, sy(v), z + 0.005],
            ]}
            color="#f87171"
            lineWidth={1}
            dashed
            dashSize={0.3}
            gapSize={0.25}
          />
        ))}
      <Line points={trace(s.vi)} color="#facc15" lineWidth={2.2} />
      <Line points={trace(s.vo)} color="#22c55e" lineWidth={2.6} />
    </group>
  );
}

function Oscilloscope({ s, lit }: { s: Sweep; lit: boolean }) {
  const vdiv = vdivOf(s);
  const msDiv = (2 / s.f / 10) * 1000;
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
            <meshStandardMaterial color={k === 'ch1' ? '#eab308' : '#16a34a'} metalness={0.5} roughness={0.3} />
          </mesh>
        ))}
        <ScopeScreen s={s} />
      </group>
      <Html position={[SCREEN.x, SCREEN.y + SCREEN.h / 2 - 0.5, S_FRONT + 0.1]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w59-scope-osd">
          <span className="c1 div">CH1 {vdiv} V/div</span>
          <span className="c2 div">CH2 {vdiv} V/div</span>
          <span className="div">{Number(msDiv.toPrecision(2))} ms/div</span>
          <span className="c2">CH2 {s.vpp.toFixed(2)} Vpp</span>
        </div>
      </Html>
      <Html position={[SCOPE.x, SCOPE.h + 0.6, SCOPE.z - SCOPE.d / 2]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w59-tag3 scope ${lit ? 'lit' : ''}`}>{BENCH_NAMES.scope}</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- probes */

function Probe({ ch, tipHole, clipHole, lit, clipLit }: { ch: 'ch1' | 'ch2'; tipHole: string; clipHole: string; lit: boolean; clipLit: boolean }) {
  const [x, z] = hole(tipHole);
  const [cx, cz] = hole(clipHole);
  const clip = useMemo<V3>(() => [cx + 0.15, 1.5, cz], [cx, cz]);
  const color = ch === 'ch1' ? '#eab308' : '#16a34a';
  const cable = useMemo<V3[]>(() => {
    const j = JACK[ch];
    return [
      [x, 3.4, z],
      [x, 6.2, z - 1.2],
      [(x + j[0]) / 2, 6.8, (z + j[2]) / 2],
      [j[0], 2.6, j[2] + 2.6],
      [j[0], j[1], j[2] + 0.4],
    ];
  }, [ch, x, z]);
  const gnd = useMemo<V3[]>(
    () => [
      [x, 2.0, z + 0.2],
      [(x + clip[0]) / 2, 3.2, (z + clip[2]) / 2],
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
      <group {...hover3d(['rail_gnd'])}>
        <Stub at={clipHole} color={WIRE.black} />
        <Tube pts={gnd} color={WIRE.black} r={0.06} lit={clipLit} />
        <Clip at={clip} color={WIRE.black} lit={clipLit} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- camera */

const FRAMES: Record<Cam, { x: [number, number]; y: [number, number]; z: [number, number]; dir: [number, number, number] }> = {
  bench: { x: [-49, 25], y: [-1, 12.5], z: [-24, 10], dir: [0, 1.3, 1] },
  chip: { x: [-11.5, 10.5], y: [-1, 4], z: [-10, 10], dir: [0, 1.6, 1] },
  scope: {
    x: [SCREEN.x - SCREEN.w / 2 - 1, SCREEN.x + SCREEN.w / 2 + 1],
    y: [SCREEN.y - SCREEN.h / 2 - 0.5, SCREEN.y + SCREEN.h / 2 + 0.5],
    z: [S_FRONT, S_FRONT],
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

      <BenchSupply lit={is('bb_psu')} is={is} />

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

      <Generator s={s} vpp={lab.vpp} lit={is('bb_gen', 'node_vin')} />
      <Probe ch="ch1" tipHole={`i${VIN_COL}`} clipHole="T-20" lit={is('ch1_probe', 'node_vin')} clipLit={is('rail_gnd')} />
      <Probe ch="ch2" tipHole={`g${OUT_COL}`} clipHole="T-40" lit={is('ch2_probe', 'node_vout')} clipLit={is('rail_gnd')} />
      <Oscilloscope s={s} lit={is('bb_scope')} />

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
