// Layer "03 3D 面包板 4位拨码开关 DAC 实测 (±9V 双电源)": the 4-bit weighted DAC built on an
// 830-hole board around the shared LM358 (src/stage/Lm358.tsx), fed by a 台式可调直流电源（±9 V）
// (the shared BenchSupply of src/stage/bench) standing on the bench and wired to the rails with its
// own leads (CH1 +9 V, CH2 −9 V, COM, and CH3 as V_ref, its − post on GND). Rails: top outer +9 V, top inner V_ref, bottom inner GND, bottom outer −9 V.
//
// Layout (column numbers; a–e upper half, f–j lower half):
// - 4-position DIP switch across the trench at 15–18: switch k joins e(14+k) (V_ref side, tied to
//   the V_ref rail by an orange jumper from a(14+k)) and f(14+k) (bit node b_k). Clicking a key
//   flips the bit. Each bit node has a 10 kΩ pull-down j(14+k) → GND rail (an OFF switch never
//   leaves the node floating).
// - Weighted resistors: R 10 kΩ g15 → g9 and 2R 20 kΩ h16 → h9 (to the left, column 9), 4R 40 kΩ
//   g17 → g24 and 8R 80 kΩ h18 → h24 (to the right, column 24 = Pin 2). A strip has five holes:
//   switch pin + pull-down + four resistors in one direction do not fit, so two go left and a
//   yellow jumper i9 → i24 joins column 9 to Pin 2: one virtual-ground node.
// - LM358 at 23–26 (pins 1–4 on row f): Pin 1 (column 23) = v_o, Pin 2 (24) = summing node,
//   Pin 3 (25) → GND rail, Pin 4 (26) → −9 V rail, Pin 8 (23, upper) → +9 V rail. R_f stands up
//   (hairpin) between j23 and j24.
// - Multimeter in front: black probe on the GND rail (B+33), red probe on Pin 1 or Pin 2.
// Camera: front top view of the bench, DIP switch close-up, op-amp pins close-up.

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, D, Lead, RAIL_Z, ROW_Z, Shell, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { Lm358, lm358Pin } from '../../Lm358';
import { BenchSupply, LEAD_COLORS, supplyLabel, supplyLcd, type SupplyChannel, type SupplyLead } from '../../bench';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { BitSwitches, Cell, DacKnobs, hoverProps, Seg, useClearHoverOnUnmount, useIsLit, useLab, type Lab } from './state';
import { codeStr, fmtP, fmtV, RATING_W, type DacState } from './model';

type V3 = [number, number, number];
type Cam = 'bench' | 'dip' | 'chip';
type Probe = 'pin1' | 'pin2';

const AMBER = '#f59e0b';
const CHIP_C0 = 23;
const DIP_C0 = 15;

/* ------------------------------------------------------------- holes, rails and picking */

const RAIL_OF: Record<Rail, string> = { tp: 'rail_p9', tn: 'rail_vref', bp: 'rail_gnd', bn: 'rail_n9' };
const RAIL_COLOR: Record<string, string> = { rail_p9: '#e11d48', rail_vref: '#f08a1c', rail_gnd: '#334155', rail_n9: '#2b59c3' };

/** Board coordinates of a hole: "g15", "T+23" (top outer rail), "T-15" (top inner), "B+25" (bottom
 *  inner), "B-27" (bottom outer). */
function hole(h: string): [number, number] {
  const m = /^([TB])([+-])(\d+)$/.exec(h);
  if (m) {
    const r: Rail = m[1] === 'T' ? (m[2] === '+' ? 'tp' : 'tn') : m[2] === '+' ? 'bp' : 'bn';
    return [colX(Number(m[3])), RAIL_Z[r]];
  }
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

/** what a lower / upper strip is in the circuit */
function stripMeaning(half: 'u' | 'l', c: number): string | null {
  if (half === 'l') {
    if (c >= DIP_C0 && c < DIP_C0 + 4) return `dac_b${c - DIP_C0 + 1}`;
    if (c === 9 || c === CHIP_C0 + 1) return 'dac_sum';
    if (c === CHIP_C0) return 'dac_vo';
    if (c === CHIP_C0 + 2) return 'dac_opamp_p3';
    if (c === CHIP_C0 + 3) return 'dac_opamp_p4';
  } else {
    if (c >= DIP_C0 && c < DIP_C0 + 4) return 'dac_vref';
    if (c === CHIP_C0) return 'dac_opamp_p8';
  }
  return null;
}

function pick(x: number, z: number): string[] | null {
  const c = Math.round(x + 32);
  if (Math.abs(z) < 0.95) return ['center_trench'];
  for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 2 && c <= 62) return [RAIL_OF[r]];
  if (c < 1 || c > 63) return null;
  const half = z <= -1 && z >= -6 ? 'u' : z >= 1 && z <= 6 ? 'l' : null;
  if (!half) return null;
  const meaning = stripMeaning(half, c);
  return meaning ? [stripId(half, c), meaning] : [stripId(half, c)];
}

/** strips and rails to tint for the lit ids */
function glowOf(lit: string[]): string[] {
  const g = new Set(lit.filter((id) => /^strip_|^rail_/.test(id)));
  const add = (...ids: string[]) => ids.forEach((s) => g.add(s));
  for (const id of lit) {
    if (id === 'dac_sum') add(stripId('l', 9), stripId('l', CHIP_C0 + 1));
    if (id === 'dac_vo' || id === 'dac_opamp_p1') add(stripId('l', CHIP_C0));
    if (id === 'dac_opamp_p2') add(stripId('l', CHIP_C0 + 1));
    if (id === 'dac_vref') add('rail_vref', ...[0, 1, 2, 3].map((k) => stripId('u', DIP_C0 + k)));
    const b = /^dac_b([1-4])$/.exec(id);
    if (b) add(stripId('l', DIP_C0 + Number(b[1]) - 1));
    if (id === 'bb_pulldown') add('rail_gnd', ...[0, 1, 2, 3].map((k) => stripId('l', DIP_C0 + k)));
    if (id === 'bb_psu') add('rail_p9', 'rail_vref', 'rail_gnd', 'rail_n9');
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

/** Repaint the printed rail stripes for this board's use (V_ref orange, GND dark) and cover the
 *  printed +/− signs of those two rails. */
function RailPaint() {
  const len = colX(62) - colX(2);
  const mid = (colX(2) + colX(62)) / 2;
  return (
    <group>
      <mesh position={[mid, 0.012, RAIL_Z.tn + 0.6]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <planeGeometry args={[len, 0.16]} />
        <meshBasicMaterial color="#f08a1c" />
      </mesh>
      <mesh position={[mid, 0.012, RAIL_Z.bp - 0.6]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <planeGeometry args={[len, 0.16]} />
        <meshBasicMaterial color="#334155" />
      </mesh>
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
    { id: 'rail_p9', text: '+9 V', col: 30, r: 'tp' },
    { id: 'rail_vref', text: 'Vref', col: 36, r: 'tn' },
    { id: 'rail_gnd', text: 'GND', col: 36, r: 'bp' },
    { id: 'rail_n9', text: '−9 V', col: 30, r: 'bn' },
  ];
  return (
    <>
      {tags.map((t) => (
        <Html key={t.id} position={[colX(t.col), 0.3, RAIL_Z[t.r]]} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`w38-rtag ${t.id} ${lit.includes(t.id) ? 'lit' : ''}`}>{t.text}</div>
        </Html>
      ))}
    </>
  );
}

/* ------------------------------------------------------------- wires and parts */

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

const WIRE = { red: '#d62f2f', black: '#24262b', orange: '#f08a1c', yellow: '#eab308', blue: '#2b59c3' };

const hover3d = (ids: string[]) => ({
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    useStage.getState().setHover(ids);
  },
  onPointerOut: () => useStage.getState().setHover(null),
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

const C = { brown: '#7a4a1f', black: '#151515', red: '#c62828', orange: '#f07a1a', yellow: '#f2c53d', grey: '#8a8d91', gold: '#d4a72c' };
const BANDS: Record<string, string[]> = {
  r10k: [C.brown, C.black, C.orange, C.brown],
  r20k: [C.red, C.black, C.orange, C.brown],
  r40k: [C.yellow, C.black, C.orange, C.brown],
  r80k: [C.grey, C.black, C.orange, C.brown],
  r4k: [C.yellow, C.black, C.red, C.brown],
  pd: [C.brown, C.black, C.orange, C.gold],
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

/** R_f standing up (hairpin): body upright over `base`, its top lead bent over into `other`. */
function Hairpin({ base, other, bands, lit, ids }: { base: string; other: string; bands: string[]; lit: boolean; ids: string[] }) {
  const [x0, z0] = hole(base);
  const [x1, z1] = hole(other);
  const y0 = 0.7;
  const y1 = 3.1;
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
          <meshStandardMaterial color="#e6cc9a" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.45 : 0} />
        </mesh>
        {bands.map((c, i) => (
          <mesh key={i} position={[0, L / 2 - 0.42 - i * 0.36 - (i === 3 ? 0.36 : 0), 0]}>
            <cylinderGeometry args={[0.375, 0.375, 0.16, 18]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Tag({ at, y = 2.2, text, cls = '', lit }: { at: V3 | [number, number]; y?: number; text: string; cls?: string; lit?: boolean }) {
  const pos: V3 = at.length === 3 ? at : [at[0], y, at[1]];
  return (
    <Html position={pos} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`bb3d-tag w38-tag3 ${cls} ${lit ? 'lit' : ''}`}>{text}</div>
    </Html>
  );
}

/* ------------------------------------------------------------- the DIP switch */

function DipSwitch({ lab, lit }: { lab: Lab; lit: string[] }) {
  const x0 = colX(DIP_C0);
  const xc = x0 + 1.5;
  const body = lit.includes('bb_dip');
  return (
    <group name="mesh_dip_switch">
      {/* pins */}
      {[0, 1, 2, 3].flatMap((k) =>
        [-1, 1].map((s) => (
          <mesh key={`${k}${s}`} position={[x0 + k, 0.12, s * 1.45]}>
            <boxGeometry args={[0.22, 0.9, 0.12]} />
            <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
          </mesh>
        )),
      )}
      <mesh position={[xc, 0.5, 0]} {...hover3d(['bb_dip'])}>
        <boxGeometry args={[4.3, 0.75, 2.5]} />
        <meshStandardMaterial color="#c81e1e" roughness={0.5} emissive={body ? AMBER : '#000000'} emissiveIntensity={body ? 0.35 : 0} />
      </mesh>
      {lab.d.bits.map((b, k) => {
        const id = `dac_b${k + 1}`;
        const hot = lit.includes(id);
        const flip = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          lab.set({ code: lab.code ^ (8 >> k) });
        };
        return (
          <group key={k}>
            <mesh position={[x0 + k, 0.89, 0]}>
              <boxGeometry args={[0.62, 0.06, 1.8]} />
              <meshStandardMaterial color="#3b0d0d" />
            </mesh>
            <mesh
              position={[x0 + k, 1.02, b ? -0.45 : 0.45]}
              onClick={flip}
              onPointerOver={(e) => {
                e.stopPropagation();
                useStage.getState().setHover([id]);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                useStage.getState().setHover(null);
                document.body.style.cursor = '';
              }}
            >
              <boxGeometry args={[0.5, 0.3, 0.8]} />
              <meshStandardMaterial color={hot ? '#fde68a' : '#f8fafc'} emissive={hot ? AMBER : '#000000'} emissiveIntensity={hot ? 0.5 : 0} roughness={0.4} />
            </mesh>
            {/* a larger invisible grip */}
            <mesh position={[x0 + k, 1.1, 0]} visible={false} onClick={flip}>
              <boxGeometry args={[0.9, 0.6, 2.2]} />
            </mesh>
          </group>
        );
      })}
      <Html position={[xc, 1.2, -1.95]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w38-dip-on">ON ↑ 接 Vref</div>
      </Html>
      <Html position={[xc, 1.2, 1.95]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w38-dip-num">
          {lab.d.bits.map((b, k) => (
            <span key={k} className={b ? 'on' : ''}>
              b{k + 1}
            </span>
          ))}
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- the bench supply (src/stage/bench) */

/** CH1 + CH2 in series for ±9 V (COM = GND); CH3 gives V_ref (its − post on GND too) */
const RAILS: SupplyChannel[] = [{ v: 9 }, { v: 9 }];
const SUPPLY_NAME = supplyLabel(RAILS, true);
/** the supply stands left of the board at 0.8 size (about the old box), turned 45° so its binding
 *  posts face the board and its display the viewer; its name tag stays in a phone's view */
const PSU_AT: [number, number] = [-40, -1];
const PSU_LEADS: SupplyLead[] = [
  { from: '+', to: 'T+3', litIds: ['rail_p9'] },
  { from: 'com', to: 'B+3', litIds: ['rail_gnd'] },
  { from: '-', to: 'B-4', litIds: ['rail_n9'] },
  { from: '3+', to: 'T-4', litIds: ['rail_vref'] },
  { from: '3-', to: 'B+5', litIds: ['rail_gnd'] },
];

function Supply({ vref }: { vref: number }) {
  const channels = useMemo<SupplyChannel[]>(() => [...RAILS, { v: vref, color: LEAD_COLORS.orange }], [vref]);
  // the display as before: the two rails, then V_ref to the millivolt
  const lcd = useMemo(() => [...supplyLcd(RAILS, true).filter((l) => l.strong), { text: `CH3 Vref ${vref.toFixed(3)} V` }], [vref]);
  return <BenchSupply id="bb_psu" position={PSU_AT} yaw={Math.PI / 4} scale={0.8} channels={channels} series label={SUPPLY_NAME} lcd={lcd} leads={PSU_LEADS} />;
}

/* ------------------------------------------------------------- multimeter */

const DMM = { x: colX(37), y: 1.6, z: 17.5, tilt: 1.2, w: 8, h: 11, t: 1.4 };

function dmmWorld(local: V3): V3 {
  const [x, y, z] = local;
  const cs = Math.cos(DMM.tilt);
  const sn = Math.sin(DMM.tilt);
  return [DMM.x + x, DMM.y + y * cs + z * sn, DMM.z - y * sn + z * cs];
}

function ProbeTip({ tip, color, jack, lit }: { tip: V3; color: 'red' | 'black'; jack: number; lit: boolean }) {
  const [x, y, z] = tip;
  const j = dmmWorld([jack, -4.1, DMM.t / 2 + 0.1]);
  const j2 = dmmWorld([jack, -4.1, DMM.t / 2 + 1.4]);
  const pts = useMemo<V3[]>(
    () => [[x, y + 3.6, z], [x, y + 6.4, z + 2.6], [x + (DMM.x - x) * 0.35, 5.6, 13.2], [DMM.x + 5.4 + jack * 0.3, 1.2, j[2] + 1.2], j2, j],
    [x, y, z, jack, j, j2],
  );
  const hex = color === 'red' ? '#d62f2f' : '#24262b';
  return (
    <group>
      <mesh position={[x, y + 0.9, z]}>
        <cylinderGeometry args={[0.06, 0.03, 1.8, 8]} />
        <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[x, y + 2.3, z]}>
        <cylinderGeometry args={[0.26, 0.22, 2.6, 14]} />
        <meshStandardMaterial color={hex} roughness={0.45} emissive={lit ? hex : '#000000'} emissiveIntensity={lit ? 0.6 : 0} />
      </mesh>
      <Tube pts={pts} color={hex} r={0.1} />
    </group>
  );
}

function Meter({ value, probe, lit }: { value: number; probe: Probe; lit: boolean }) {
  const lcd = dmmWorld([0, 2.6, DMM.t / 2 + 0.05]);
  return (
    <group name="mesh_dmm">
      <group position={[DMM.x, DMM.y, DMM.z]} rotation={[-DMM.tilt, 0, 0]} {...hover3d(['dmm'])}>
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
        <div className={`w38-lcd ${lit ? 'lit' : ''}`} {...hoverProps(['dmm'])} tabIndex={0}>
          <small>DC V · {probe === 'pin1' ? 'Pin 1' : 'Pin 2'}</small>
          <b>{fmtV(value).replace(' V', '')}</b>
          <span>V</span>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- camera */

const VIEW_DIR = new THREE.Vector3(0, 1.7, 1).normalize();
const FRAMES: Record<Cam, { x: [number, number]; z: [number, number] }> = {
  bench: { x: [-47, 9], z: [-11, 21] },
  dip: { x: [-24.5, -12.5], z: [-9.8, 9.8] },
  chip: { x: [-11.5, -3.5], z: [-3.2, 7] },
};

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: (typeof FRAMES)[Cam]): [THREE.Vector3, THREE.Vector3] {
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

const WEIGHTED = [
  { id: 'dac_r1', p1: 'g15', p2: 'g9', bands: BANDS.r10k, text: 'R 10 kΩ' },
  { id: 'dac_r2', p1: 'h16', p2: 'h9', bands: BANDS.r20k, text: '2R 20 kΩ' },
  { id: 'dac_r3', p1: 'g17', p2: 'g24', bands: BANDS.r40k, text: '4R 40 kΩ' },
  { id: 'dac_r4', p1: 'h18', p2: 'h24', bands: BANDS.r80k, text: '8R 80 kΩ' },
];

/** where the red probe touches: the leg of Pin 1 or Pin 2 (row f side) */
function probeTip(p: Probe): V3 {
  const { col } = lm358Pin(CHIP_C0, p === 'pin1' ? 1 : 2);
  return [colX(col), 0.55, 1.72];
}

function Scene({ lab, frame, probe, nonce }: { lab: Lab; frame: Cam; probe: Probe; nonce: number }) {
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
  const close = frame !== 'bench';
  const [bx, bz] = hole('B+33');
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Shell xray={0} />
      <RailPaint />
      <Glow ids={glowOf(lit)} />
      <RailTags lit={lit} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <Supply vref={lab.vref} />
      {/* V_ref side of the switch and the pull-downs */}
      {[0, 1, 2, 3].map((k) => (
        <Jumper key={`v${k}`} from={`a${DIP_C0 + k}`} to={`T-${DIP_C0 + k}`} color="orange" lit={is('dac_vref')} ids={['dac_vref']} />
      ))}
      {[0, 1, 2, 3].map((k) => (
        <Res key={`pd${k}`} p1={`j${DIP_C0 + k}`} p2={`B+${DIP_C0 + k}`} bands={BANDS.pd} lit={is('bb_pulldown')} ids={['bb_pulldown']} h={1.0} />
      ))}
      <Tag at={[colX(DIP_C0) + 1.5, 9.9]} y={2.0} text="下拉 4 × 10 kΩ → GND" cls="pd" lit={is('bb_pulldown')} />
      <DipSwitch lab={lab} lit={lit} />
      {/* the weighted resistors and the summing node */}
      {WEIGHTED.map((r) => (
        <Res key={r.id} p1={r.p1} p2={r.p2} bands={r.bands} lit={is(r.id)} ids={[r.id]} />
      ))}
      {close &&
        WEIGHTED.map((r) => {
          const [x1, z1] = hole(r.p1);
          const [x2, z2] = hole(r.p2);
          return (
            <Tag key={`t${r.id}`} at={[(x1 + x2) / 2, (z1 + z2) / 2 + (r.p1[0] === 'g' ? -0.4 : 0.45)]} y={r.p1[0] === 'g' ? 2.3 : 1.9} text={r.text} cls="res" lit={is(r.id)} />
          );
        })}
      <Jumper from="i9" to={`i${CHIP_C0 + 1}`} color="yellow" lit={is('dac_sum', 'bb_link')} ids={['bb_link']} />
      {/* the op amp and its supply / feedback */}
      <Lm358 c0={CHIP_C0} id="dac_opamp" tag={frame === 'chip' ? '' : 'LM358'} pinNumbers={frame === 'chip'} />
      <Jumper from={`a${CHIP_C0}`} to={`T+${CHIP_C0}`} color="red" lit={is('rail_p9', 'dac_opamp_p8')} ids={['dac_opamp_p8']} />
      <Jumper from={`j${CHIP_C0 + 2}`} to={`B+${CHIP_C0 + 2}`} color="black" lit={is('dac_opamp_p3')} ids={['dac_opamp_p3']} />
      <Jumper from={`j${CHIP_C0 + 3}`} to={`B-${CHIP_C0 + 4}`} color="blue" lit={is('rail_n9', 'dac_opamp_p4')} ids={['dac_opamp_p4']} />
      <Hairpin base={`j${CHIP_C0}`} other={`j${CHIP_C0 + 1}`} bands={lab.rf === 10_000 ? BANDS.r10k : BANDS.r4k} lit={is('dac_rf')} ids={['dac_rf']} />
      <Tag at={[colX(CHIP_C0) - 1.6, ROW_Z.j + 0.6]} y={3.6} text={`Rf ${lab.rf / 1000} kΩ`} cls="rf" lit={is('dac_rf')} />
      {frame === 'chip' && <Tag at={[colX(CHIP_C0 + 1.5), -1.4]} y={2.7} text="LM358 · 缺口朝左 = Pin 1 在左下" cls="chip" lit={is('dac_opamp')} />}
      {/* multimeter */}
      <ProbeTip tip={probeTip(probe)} color="red" jack={2.4} lit={is('dmm', probe === 'pin1' ? 'dac_opamp_p1' : 'dac_opamp_p2')} />
      <ProbeTip tip={[bx, -0.1, bz]} color="black" jack={0} lit={is('dmm', 'rail_gnd')} />
      <Meter value={probe === 'pin1' ? lab.d.vo : lab.d.vn} probe={probe} lit={is('dmm')} />
      <OrbitControls makeDefault enableDamping={false} minDistance={6} maxDistance={120} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig frame={frame} nonce={nonce} />
    </>
  );
}

/* ------------------------------------------------------------- HUD and layer */

const SHORT_STATE: Record<DacState, string> = { linear: '线性区', edge: '临界', clip: 'LM358 削顶', rail: '超轨饱和' };

function Panel({ lab, probe }: { lab: Lab; probe: Probe }) {
  const d = lab.d;
  const reading = probe === 'pin1' ? d.vo : d.vn;
  return (
    <div className="w38-cells">
      <Cell id="dmm" name={`万用表 ${probe === 'pin1' ? 'Pin 1' : 'Pin 2'}`} value={fmtV(reading)} tone={d.clipped ? 'bad' : 'good'} />
      <Cell id="dac_b1" name="码字 / D" value={`${codeStr(lab.code)} / ${lab.code}`} tone="minor" />
      <Cell id="dac_vo" name="理想 vo" value={fmtV(d.ideal)} />
      <Cell id="dac_sum" name="Pin 2 虚地" value={fmtV(d.vn)} tone={d.clipped ? 'bad minor' : 'good minor'} />
      <Cell id="dac_opamp" name="状态" value={SHORT_STATE[d.state]} tone={d.clipped ? 'bad' : d.state === 'edge' ? 'warn' : ''} />
      <Cell id="scale_note" name="最大电阻功耗" value={fmtP(d.pMax)} hint={`1/4 W 的 ${((d.pMax / RATING_W) * 100).toFixed(1)}%`} tone="minor" />
    </div>
  );
}

export default function Bench3D() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const [frame, setFrame] = useStageParam<Cam>('cam', 'bench');
  const [probe, setProbe] = useStageParam<Probe>('probe', 'pin1');
  const [nonce, setNonce] = useStageParam('camNonce', 0);
  const on = useIsLit()('scale_note');
  // the breadboard runs the DAC
  const { topo, set } = lab;
  useEffect(() => {
    if (topo !== 'dac') set({ topo: 'dac' });
  }, [topo, set]);
  return (
    <div className="w38-layer">
      <div className="w38-dock">
        <BitSwitches lab={lab} />
        <DacKnobs lab={lab} />
        <Seg<Probe>
          label="红表笔"
          small
          value={probe}
          onChange={setProbe}
          options={[
            { value: 'pin1', label: '红笔 Pin 1（vo）', short: 'Pin 1', hover: ['dac_opamp_p1'] },
            { value: 'pin2', label: '红笔 Pin 2（虚地）', short: 'Pin 2', hover: ['dac_opamp_p2'] },
          ]}
        />
      </div>
      <div className="bb3d-wrap w38-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-18, 44, 34], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <Scene lab={lab} frame={frame} probe={probe} nonce={nonce} />
        </Canvas>
        <div className="w38-camsel">
          <Seg<Cam>
            label="镜头"
            small
            value={frame}
            onChange={setFrame}
            options={[
              { value: 'bench', label: '正面俯视', short: '全景' },
              { value: 'dip', label: 'DIP 开关特写', short: 'DIP' },
              { value: 'chip', label: '运放引脚特写', short: '引脚' },
            ]}
          />
          <button className="w38-fold" onClick={() => setNonce(nonce + 1)} title="复位镜头">
            复位
          </button>
        </div>
        <p className="w38-drag-hint">点击 DIP 白色拨键切换 0/1 · 拖动旋转、滚轮缩放</p>
      </div>
      <Panel lab={lab} probe={probe} />
      <p className={`w38-notice ${on}`} {...hoverProps(['scale_note'])} role="note">
        <span className="full">±9 V 双电源（公共地接 GND 轨）· 电阻全为 kΩ 级，按原值搭建、无需缩放 · 最大电阻功耗 {fmtP(lab.d.pMax)}，远低于 1/4 W</span>
        <span className="short">±9 V 双电源 · kΩ 级原值 · 最大功耗 {fmtP(lab.d.pMax)}</span>
      </p>
    </div>
  );
}
