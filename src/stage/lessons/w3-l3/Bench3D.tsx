// Layer "03 3D LM358 ±9V 双电源面包板实测": the inverting amplifier on an 830-hole board. The
// shared LM358 (Lm358.tsx) straddles the trench with pins 1 and 8 in column 44 (notch left):
// Pin 1 OUT f44, Pin 2 IN− f45, Pin 3 IN+ f46, Pin 4 V− f47, Pin 8 V+ e44.
// Rails: top + (red) = +9 V, top − = GND, bottom + = GND (tied to the top GND by a black jumper
// at column 9), bottom − = −9 V. They are fed by the 台式可调直流电源（±9 V） standing on the bench:
// its two 9 V outputs in series (CH1 − linked to CH2 + = COM), CH1 + → +9 V rail, COM → GND, CH2 −
// → −9 V rail. The single +9 V mistake moves Pin 4's jumper onto GND and leaves CH2 unwired.
// R1 = 10 kΩ (brown-black-orange-gold) i38 → i45, R_f = 22 kΩ (red-red-orange-gold; 47 kΩ
// yellow-violet-orange-gold for the clipping run) bridges g44 (Pin 1) – g45 (Pin 2) with its leads
// bent under the body; Pin 3 → GND (j46), Pin 4 → −9 V (j47), Pin 8 → +9 V (a44); 0.1 µF decoupling
// caps b44 – top GND and i47 – bottom GND. A 可调直流信号源 drives v_i into column 38.
// The multimeter's black probe sits on GND; the red one goes to the chosen test point (buttons, or
// a click on the hole). Faults of act 6.3: R_f not seated, Pin 2 wired to GND.

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, RAIL_Z, ROW_Z, Shell } from '../../BreadboardXray';
import { COLOR_BY_KEY } from '../../colorCode';
import { Lm358, lm358Pin, type Lm358Pin } from '../../Lm358';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { Tex } from '../../StageText';
import { DEFAULTS, hov, Seg, Slider, SUPPLY_NAME, SUPPLY_OPTIONS, useClearHoverOnUnmount, useIsLit, type Probe } from './common';
import { BANDS, fmtMa, fmtP, fmtV, num, P_RATED, solve, supplyCurrents, type Amp, type Fault, type Supply } from './model';

type V3 = [number, number, number];

const C0 = 44;

/* ------------------------------------------------------------- holes and hover */

/** Board coordinates of a hole: "c44"; rails "T+43" (+9 V), "Tg45" (top GND), "Bg45" (bottom GND), "B-47" (−9 V). */
function hole(h: string): [number, number] {
  const m = /^([TB])([+g-])(\d+)$/.exec(h);
  if (m) {
    const z = m[1] === 'T' ? (m[2] === '+' ? RAIL_Z.tp : RAIL_Z.tn) : m[2] === 'g' ? RAIL_Z.bp : RAIL_Z.bn;
    return [colX(Number(m[3])), z];
  }
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

/** Light `ids`; release clears the hover only if it is still the one this source set. */
function useHover3D(ids: string[]) {
  const mine = useRef<string[] | null>(null);
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      useStage.getState().setHover(ids);
      mine.current = useStage.getState().hover;
    },
    onPointerOut: () => {
      if (mine.current && useStage.getState().hover === mine.current) useStage.getState().setHover(null);
    },
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

const WIRE = { red: '#d62f2f', black: '#24262b', blue: '#2b59c3', green: '#15803d', yellow: '#e0b419' } as const;

/** A jumper from hole to hole, arched over what it crosses. */
function Jumper({ from, to, color, lit = false, lift = 0 }: { from: string; to: string; color: keyof typeof WIRE; lit?: boolean; lift?: number }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(from);
    const [x2, z2] = hole(to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const hgt = Math.min(2.6, Math.max(0.6, 0.3 + 0.19 * dist)) + lift;
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.35, z1], at(0.2, hgt * 0.92), at(0.5, hgt), at(0.8, hgt * 0.92), [x2, 0.35, z2], [x2, -0.3, z2]];
  }, [from, to, lift]);
  return <Tube pts={pts} color={WIRE[color]} r={0.12} lit={lit} />;
}

/* ------------------------------------------------------------- parts */

const AMBER = '#f59e0b';
const bandX = (len: number, n: number, i: number) => -len / 2 + 0.36 + i * 0.3 + (i === n - 1 ? 0.26 : 0);

/** An axial resistor along x: feet in two holes, the body (2.4 long) centred at `cx` at height `h`
 *  (by default between the feet). `loose` lifts the right foot out of its hole. */
function Resistor3D({
  id,
  ids,
  from,
  to,
  ohms,
  h = 1.25,
  cx,
  tag,
  tagDz = 0,
  tagAt,
  loose = false,
}: {
  id: string;
  ids: string[];
  from: string;
  to: string;
  ohms: number;
  h?: number;
  cx?: number;
  tag: string;
  tagDz?: number;
  /** where the tag floats, when not above the body */
  tagAt?: V3;
  loose?: boolean;
}) {
  const isLit = useIsLit();
  const lit = isLit(...ids);
  const hover = useHover3D([id]);
  const [x1, z1] = hole(from);
  const [x2, z2] = hole(to);
  const mx = cx ?? (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const bodyLen = 2.4;
  const e1: V3 = [mx - bodyLen / 2, h, mz];
  const e2: V3 = [mx + bodyLen / 2, h, mz];
  const y2 = loose ? 0.7 : -0.3;
  const dz2 = loose ? 0.5 : 0;
  const leads = useMemo<[V3[], V3[]]>(
    () => [
      [[x1, -0.3, z1], [x1, h * 0.62, z1], [(x1 + e1[0]) / 2, h * 0.95, z1], e1],
      [[x2, y2, z2 + dz2], [x2, h * 0.62 + (loose ? 0.3 : 0), z2 + dz2 / 2], [(x2 + e2[0]) / 2, h * 0.95, z2], e2],
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [x1, z1, x2, z2, mx, mz, h, loose],
  );
  const bands = (BANDS[ohms] ?? BANDS[10000]).map((k) => COLOR_BY_KEY.get(k)!.hex);
  return (
    <group name={id}>
      <Tube pts={leads[0]} color="#b9bec4" r={0.07} />
      <Tube pts={leads[1]} color="#b9bec4" r={0.07} />
      <group position={[mx, h, mz]} {...hover}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.36, bodyLen - 0.72, 6, 16]} />
          <meshStandardMaterial color="#e6cc9a" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.45 : 0} />
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
      <Html position={tagAt ?? [mx, h + 1.05, mz + tagDz]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w33-tag part ${lit ? 'lit' : ''} ${loose ? 'bad' : ''}`}>{tag}</div>
      </Html>
    </group>
  );
}

/** 0.1 µF ceramic disc ("104") from a hole to a rail hole. */
function Cap3D({ from, to, lit }: { from: string; to: string; lit: boolean }) {
  const hover = useHover3D(['c_dec']);
  const [x1, z1] = hole(from);
  const [x2, z2] = hole(to);
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const ang = Math.atan2(-(z2 - z1), x2 - x1);
  const legs = useMemo<V3[][]>(
    () => [
      [
        [x1, -0.3, z1],
        [x1, 0.6, z1],
        [mx - 0.25 * Math.cos(ang), 1.2, mz + 0.25 * Math.sin(ang)],
      ],
      [
        [x2, -0.3, z2],
        [x2, 0.6, z2],
        [mx + 0.25 * Math.cos(ang), 1.2, mz - 0.25 * Math.sin(ang)],
      ],
    ],
    [x1, z1, x2, z2, mx, mz, ang],
  );
  return (
    <group>
      <Tube pts={legs[0]} color="#b9bec4" r={0.05} />
      <Tube pts={legs[1]} color="#b9bec4" r={0.05} />
      <group position={[mx, 1.65, mz]} rotation={[0, ang, 0]} {...hover}>
        <mesh rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.28, 20]} />
          <meshStandardMaterial color="#e3a12f" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.5 : 0} />
        </mesh>
      </group>
    </group>
  );
}

/** Glow on a pin when an id that stands for it is lit (Pin 2 ↔ node 1 …). */
function PinGlow({ pin, on }: { pin: Lm358Pin; on: boolean }) {
  if (!on) return null;
  const { col, row } = lm358Pin(C0, pin);
  const z = Math.sign(ROW_Z[row]) * 1.45;
  return (
    <mesh position={[colX(col), 0.3, z]}>
      <boxGeometry args={[0.5, 1.1, 0.4]} />
      <meshBasicMaterial color={AMBER} transparent opacity={0.6} depthWrite={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------- the bench supply */

/** the supply stands on the bench behind the board's left end */
const SUP = { x: -22, z: -19, w: 11, h: 5.6, d: 7 };
const SUP_FRONT = SUP.z + SUP.d / 2;
const POST_Y = 0.4;
const POSTS = { ch1p: SUP.x - 3.6, ch1n: SUP.x - 1.6, ch2p: SUP.x + 1.6, ch2n: SUP.x + 3.6 };

/** a lead from a front-panel post to a rail hole; `around` runs it past the board's left end to the bottom rails */
function supplyLead(px: number, to: string, lift: number, around = false): V3[] {
  const [x, z] = hole(to);
  const pz = SUP_FRONT + 0.25;
  if (around)
    return [
      [px, POST_Y, pz + 0.3],
      [px - 0.4, 0.1, pz + 1.8],
      [-35, lift, -10.5],
      [-35.2, lift, 6],
      [x - 0.8, lift + 0.2, z + 0.2],
      [x, 0.5, z],
      [x, -0.3, z],
    ];
  return [
    [px, POST_Y, pz + 0.3],
    [px - 0.3, 0.3, pz + 1.6],
    [x + 0.4, lift, z - 2.4],
    [x, 0.5, z],
    [x, -0.3, z],
  ];
}

function BenchSupply({ a, lit }: { a: Amp; lit: boolean }) {
  const hover = useHover3D(['supply']);
  const yc = -1 + SUP.h / 2;
  const red = useMemo(() => supplyLead(POSTS.ch1p, 'T+3', 1.9), []);
  const com = useMemo(() => supplyLead((POSTS.ch1n + POSTS.ch2p) / 2, 'Tg4', 1.3), []);
  const neg = useMemo(() => supplyLead(POSTS.ch2n, 'B-3', 1.0, true), []);
  const dual = a.supply === 'dual';
  const cur = supplyCurrents(a);
  return (
    <group name="supply">
      <group {...hover}>
        <mesh position={[SUP.x, yc, SUP.z]}>
          <boxGeometry args={[SUP.w, SUP.h, SUP.d]} />
          <meshStandardMaterial color="#d9dde3" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.3 : 0} />
        </mesh>
        <mesh position={[SUP.x, yc, SUP_FRONT + 0.01]}>
          <planeGeometry args={[SUP.w - 0.6, SUP.h - 0.6]} />
          <meshStandardMaterial color="#3a4150" roughness={0.7} />
        </mesh>
        {[-2.6, 2.6].map((dx, i) => (
          <mesh key={dx} position={[SUP.x + dx, yc + 1.1, SUP_FRONT + 0.02]}>
            <planeGeometry args={[4.2, 1.8]} />
            <meshStandardMaterial color="#10261a" emissive={i === 1 && !dual ? '#3a3a3a' : '#1f8a4c'} emissiveIntensity={0.9} />
          </mesh>
        ))}
        {(Object.keys(POSTS) as (keyof typeof POSTS)[]).map((k) => (
          <mesh key={k} position={[POSTS[k], POST_Y, SUP_FRONT + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.7, 16]} />
            <meshStandardMaterial color={k.endsWith('p') ? '#d62f2f' : '#1a1c20'} roughness={0.4} />
          </mesh>
        ))}
        {/* series link CH1 − ↔ CH2 + = COM */}
        <mesh position={[(POSTS.ch1n + POSTS.ch2p) / 2, POST_Y, SUP_FRONT + 0.62]}>
          <boxGeometry args={[POSTS.ch2p - POSTS.ch1n + 0.5, 0.22, 0.12]} />
          <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      <Tube pts={red} color={WIRE.red} r={0.14} lit={lit} />
      <Tube pts={com} color={WIRE.black} r={0.14} />
      {dual && <Tube pts={neg} color={WIRE.blue} r={0.14} lit={lit} />}
      <Html position={[SUP.x, yc + SUP.h / 2 + 1.4, SUP.z]} center zIndexRange={[21, 0]}>
        <div className={`bb3d-tag w33-tag supply ${lit ? 'lit' : ''}`} {...hov(['supply'])}>
          <b>{SUPPLY_NAME}</b>
          <span>
            CH1 +9.00 V · {fmtMa(cur.ch1)} ｜ CH2 {dual ? `−9.00 V · ${fmtMa(cur.ch2)}` : '未接（Pin 4 误接 GND）'}
          </span>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- the v_i source */

const SRC = { x: -3, z: 15 };

function SignalSource({ vi, lit }: { vi: number; lit: boolean }) {
  const hover = useHover3D(['vi_src']);
  const red = useMemo<V3[]>(() => {
    const [x, z] = hole('g38');
    return [
      [SRC.x + 1.2, 0.3, SRC.z - 1.6],
      [SRC.x + 2.6, 1.4, SRC.z - 4.5],
      [x - 0.6, 2.2, z + 2.2],
      [x, 0.5, z],
      [x, -0.3, z],
    ];
  }, []);
  const black = useMemo<V3[]>(() => {
    const [x, z] = hole('Bg37');
    return [
      [SRC.x + 2.2, 0.3, SRC.z - 1.6],
      [SRC.x + 3.2, 0.9, SRC.z - 3.6],
      [x - 0.3, 1.2, z + 1.2],
      [x, 0.4, z],
      [x, -0.3, z],
    ];
  }, []);
  return (
    <group name="vi_src">
      <group {...hover}>
        <mesh position={[SRC.x, 0.4, SRC.z]}>
          <boxGeometry args={[6.4, 2.8, 3.2]} />
          <meshStandardMaterial color="#e7ebf0" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
        </mesh>
        <mesh position={[SRC.x - 1.2, 0.6, SRC.z + 1.61]}>
          <planeGeometry args={[3, 1.3]} />
          <meshStandardMaterial color="#10261a" emissive="#1f8a4c" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[SRC.x + 1.9, 0.6, SRC.z + 1.75]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.35, 20]} />
          <meshStandardMaterial color="#1f232b" />
        </mesh>
      </group>
      <Tube pts={red} color={WIRE.red} r={0.1} lit={lit} />
      <Tube pts={black} color={WIRE.black} r={0.1} />
      <Html position={[SRC.x, 2.6, SRC.z]} center zIndexRange={[20, 0]}>
        <div className={`bb3d-tag w33-tag src ${lit ? 'lit' : ''}`} {...hov(['vi_src'])}>
          信号源 vᵢ {fmtV(vi)}
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- multimeter */

const DMM_TILT = 1.2;
const DMM_SIZE = { w: 8, h: 11, t: 1.4 };
const DMM_Y = 1.6;
const DMM_Z = 14.5;
const DMM_X = colX(58);
const JACK_X = { COM: 0, V: 2.4 };

function dmmWorld(local: V3): V3 {
  const [x, y, z] = local;
  const c = Math.cos(DMM_TILT);
  const s = Math.sin(DMM_TILT);
  return [DMM_X + x, DMM_Y + y * c + z * s, DMM_Z - y * s + z * c];
}

function ProbePin({ at, color, jack, lit }: { at: string; color: 'red' | 'black'; jack: number; lit: boolean }) {
  const [x, z] = hole(at);
  const j = dmmWorld([jack, -4.1, DMM_SIZE.t / 2 + 0.1]);
  const j2 = dmmWorld([jack, -4.1, DMM_SIZE.t / 2 + 1.4]);
  const pts = useMemo<V3[]>(() => [[x, 4.3, z], [x, 5.8, z + 1.2], [x + (DMM_X - x) * 0.3, 3.6, 12.5], [DMM_X - 5 + jack * 0.3, 1.0, j[2] + 1.2], j2, j], [x, z, jack, j, j2]);
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

function Meter3D({ value, lit, warn }: { value: string; lit: boolean; warn: boolean }) {
  const lcd = dmmWorld([0, 2.6, DMM_SIZE.t / 2 + 0.05]);
  const hover = useHover3D(['dmm']);
  return (
    <group name="dmm">
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
        <mesh position={[0.9, 0.1, DMM_SIZE.t / 2 + 0.32]} rotation={[0, 0, -0.8]}>
          <boxGeometry args={[0.24, 1.3, 0.1]} />
          <meshStandardMaterial color="#f2f2f2" />
        </mesh>
        {(['COM', 'V'] as const).map((k) => (
          <mesh key={k} position={[JACK_X[k], -4.1, DMM_SIZE.t / 2 + 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.2, 16]} />
            <meshStandardMaterial color={k === 'COM' ? '#111' : '#b3261e'} />
          </mesh>
        ))}
      </group>
      <Html position={lcd} center zIndexRange={[25, 0]}>
        <div className={`w33-lcd ${lit ? 'lit' : ''} ${warn ? 'bad' : ''}`} tabIndex={0} {...hov(['dmm'])}>
          <small>DC V</small>
          <b>{value}</b>
          <span>V</span>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- glow on lit strips and rails */

function Glow({ lit, supply }: { lit: string[]; supply: Supply }) {
  const has = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const quads: { x: number; z: number; w: number; d: number; color: string }[] = [];
  const strip = (c: number, lower = true, color = AMBER) => quads.push({ x: colX(c), z: lower ? 3.5 : -3.5, w: 0.86, d: 5.0, color });
  const rail = (z: number, color: string) => quads.push({ x: (colX(3) + colX(61)) / 2, z, w: colX(61) - colX(3) + 1.2, d: 0.86, color });
  if (has('rail_p', 'supply')) {
    rail(RAIL_Z.tp, '#ff4d5e');
    strip(C0, false, '#ff4d5e');
  }
  if (has('rail_n', 'supply') && supply === 'dual') {
    rail(RAIL_Z.bn, '#4f86ff');
    strip(C0 + 3, true, '#4f86ff');
  }
  if (has('gnd', 'pin_noninv', 'supply')) {
    rail(RAIL_Z.tn, '#64748b');
    rail(RAIL_Z.bp, '#64748b');
  }
  if (has('node1', 'pin_inv')) strip(C0 + 1);
  if (has('vo_out', 'rf')) strip(C0);
  if (has('rf')) strip(C0 + 1);
  if (has('vi_src', 'r1', 'rin')) strip(38);
  if (has('pin_noninv')) strip(C0 + 2);
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

export type BenchCam = 'bench' | 'chip' | 'supply';
const VIEW_DIR = new THREE.Vector3(0, 1.55, 1).normalize();
const FRAMES: Record<BenchCam, { x: [number, number]; z: [number, number] }> = {
  bench: { x: [-35, 34], z: [-23, 20] },
  chip: { x: [3, 25], z: [-7, 11] },
  supply: { x: [-36, -4], z: [-23, 11] },
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

/* ------------------------------------------------------------- test points */

export const PROBE_HOLE: Record<Probe, string> = { vi: 'j38', p1: 'j44', p2: 'j45', p3: 'h46', p4: 'h47', p8: 'c44' };
const PROBE_IDS: Record<Probe, string[]> = { vi: ['vi_src'], p1: ['vo_out'], p2: ['node1'], p3: ['pin_noninv'], p4: ['rail_n'], p8: ['rail_p'] };

export function reading(p: Probe, a: Amp): number {
  switch (p) {
    case 'vi':
      return a.vi;
    case 'p1':
      return a.vo;
    case 'p2':
      return a.vMinus;
    case 'p3':
      return 0;
    case 'p4':
      return a.supply === 'dual' ? -9 : 0;
    case 'p8':
      return 9;
  }
}

/** an invisible click target over a test-point hole */
function Hotspot({ p, onPick }: { p: Probe; onPick: (p: Probe) => void }) {
  const [x, z] = hole(PROBE_HOLE[p]);
  const hover = useHover3D(PROBE_IDS[p]);
  return (
    <mesh
      position={[x, 0.25, z]}
      onClick={(e) => {
        e.stopPropagation();
        onPick(p);
      }}
      {...hover}
    >
      <boxGeometry args={[0.9, 0.5, 0.9]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------- the scene */

function RailTag({ z, text, cls, right = false }: { z: number; text: string; cls: string; right?: boolean }) {
  return (
    <Html position={[right ? colX(63) + 1.8 : colX(1) - 1.8, 0.4, z]} center zIndexRange={[19, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`w33-railtag ${cls}`}>{text}</div>
    </Html>
  );
}

function Scene({ a, probe, view, setProbe }: { a: Amp; probe: Probe; view: BenchCam; setProbe: (p: Probe) => void }) {
  const lit = useLit();
  const isLit = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const dual = a.supply === 'dual';
  const value = reading(probe, a);
  const dmmLit = isLit('dmm', ...PROBE_IDS[probe]);
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <mesh position={[-8, -1.02, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[130, 80]} />
        <meshStandardMaterial color="#e8dcc4" roughness={0.95} />
      </mesh>
      <Shell xray={0} />
      <Glow lit={lit} supply={a.supply} />
      <RailTag z={RAIL_Z.tp} text="+9 V" cls="p" />
      <RailTag z={RAIL_Z.tn} text="GND" cls="g" right />
      <RailTag z={RAIL_Z.bp} text="GND" cls="g" right />
      <RailTag z={RAIL_Z.bn} text={dual ? '−9 V' : '−9 V（未接）'} cls="n" />
      <BenchSupply a={a} lit={isLit('supply')} />
      <SignalSource vi={a.vi} lit={isLit('vi_src', 'rin')} />
      {/* top GND ↔ bottom GND */}
      <Jumper from="Tg9" to="Bg9" color="black" lit={isLit('gnd')} lift={0.2} />
      <Lm358 c0={C0} pinNumbers tag="" />
      <Html position={[colX(C0) + 1.5, 1.4, -3]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w33-tag ${isLit('chip_lm358', 'opamp') ? 'lit' : ''}`}>LM358</div>
      </Html>
      <PinGlow pin={1} on={isLit('vo_out')} />
      <PinGlow pin={2} on={isLit('node1', 'pin_inv')} />
      <PinGlow pin={3} on={isLit('pin_noninv')} />
      <PinGlow pin={4} on={isLit('rail_n')} />
      <PinGlow pin={8} on={isLit('rail_p')} />
      {/* power and the non-inverting input */}
      <Jumper from="a44" to="T+43" color="red" lit={isLit('rail_p')} />
      <Jumper from="j46" to="Bg45" color="black" lit={isLit('pin_noninv')} />
      {dual ? <Jumper from="j47" to="B-47" color="blue" lit={isLit('rail_n')} lift={0.3} /> : <Jumper from="j47" to="Bg48" color="yellow" lit={isLit('rail_n')} />}
      {!dual && (
        <Html position={[colX(48), 1.4, RAIL_Z.bp + 1.6]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bb3d-tag w33-tag bad">Pin 4 → GND（错误）</div>
        </Html>
      )}
      <Cap3D from="b44" to="Tg45" lit={isLit('c_dec')} />
      <Cap3D from="i47" to="Bg49" lit={isLit('c_dec')} />
      {/* the resistor network */}
      <Resistor3D id="r1" ids={['r1', 'rin']} from="i38" to="i45" ohms={a.r1} tag="R₁ 10 kΩ" tagDz={2.6} />
      <Resistor3D
        id="rf"
        ids={['rf']}
        from="g44"
        to="g45"
        cx={(colX(44) + colX(45)) / 2}
        h={2.2}
        ohms={a.rf}
        tag={a.fault === 'rf_open' ? 'Rf 虚插（开路）' : `Rf ${a.rf / 1000} kΩ`}
        tagAt={[colX(41.2), 3.0, 1.6]}
        loose={a.fault === 'rf_open'}
      />
      {a.fault === 'pin2_gnd' && (
        <>
          <Jumper from="h45" to="Bg43" color="green" lit />
          <Html position={[colX(43), 1.4, RAIL_Z.bp + 1.6]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <div className="bb3d-tag w33-tag bad">Pin 2 → GND（错接）</div>
          </Html>
        </>
      )}
      {(Object.keys(PROBE_HOLE) as Probe[]).map((p) => (
        <Hotspot key={p} p={p} onPick={setProbe} />
      ))}
      <ProbePin at={PROBE_HOLE[probe]} color="red" jack={JACK_X.V} lit={dmmLit} />
      <ProbePin at="Bg52" color="black" jack={JACK_X.COM} lit={dmmLit} />
      <Meter3D value={num(value)} lit={dmmLit} warn={(probe === 'p2' && Math.abs(value) > 0.005) || (probe === 'p1' && a.state !== 'linear')} />
      <OrbitControls makeDefault enableDamping={false} minDistance={8} maxDistance={150} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig view={view} />
    </>
  );
}

/* ------------------------------------------------------------- HUD and layer */

const PROBES: { value: Probe; label: string; short: string }[] = [
  { value: 'vi', label: '输入 vᵢ', short: 'vᵢ' },
  { value: 'p1', label: 'Pin 1（vₒ）', short: 'P1 vₒ' },
  { value: 'p2', label: 'Pin 2（虚地 v₋）', short: 'P2 v₋' },
  { value: 'p3', label: 'Pin 3（v₊）', short: 'P3' },
  { value: 'p4', label: 'Pin 4（V⁻）', short: 'P4' },
  { value: 'p8', label: 'Pin 8（V⁺）', short: 'P8' },
];

const FAULTS: { value: Fault; label: string; short: string; tone?: 'bad'; hover?: string[] }[] = [
  { value: 'none', label: '接线正确', short: '正确' },
  { value: 'rf_open', label: '故障：Rf 虚插', short: 'Rf 虚插', tone: 'bad', hover: ['rf'] },
  { value: 'pin2_gnd', label: '故障：Pin 2 误接 GND', short: 'Pin2 接地', tone: 'bad', hover: ['pin_inv'] },
];

function FormulaCard({ a }: { a: Amp }) {
  const r = (a.rf / a.r1).toFixed(1);
  const vi = a.vi.toFixed(2);
  let tex: string;
  let note: string;
  if (a.fault === 'rf_open') {
    tex = String.raw`i_f = 0,\; v_- = v_i = ${num(a.vi)}\text{ V} \Rightarrow v_o = ${num(a.vo)}\text{ V}`;
    note = '没有反馈：运放退化为开环比较器，vᵢ 稍有正负，vₒ 就在 −9 V 与 +7.5 V 之间跳变';
  } else if (a.fault === 'pin2_gnd') {
    tex = String.raw`v_- = 0\ (\text{真地}),\; i_1 = \frac{v_i}{R_1} \to \text{GND},\; v_o = 0\text{ V}`;
    note = '虚地被换成真地：i₁ 直接泄入地线，Rf 拿不到电流，输出不再跟随 vᵢ';
  } else if (a.state === 'linear') {
    tex = String.raw`v_o = -\frac{R_f}{R_1} v_i = -${r} \times (${vi}) = ${num(a.vo)}\text{ V}`;
    note = '线性区：Pin 2 实测 0.00 V（虚地成立）';
  } else {
    tex = String.raw`-${r} \times (${vi}) = ${num(a.voIdeal)}\text{ V} \;\to\; v_o = ${num(a.vo)}\text{ V},\; v_- = ${num(a.vMinus)}\text{ V}`;
    note = a.supply === 'single' && a.state === 'sat_neg' ? '单 +9 V：输出降不到负电压，死锁 0 V，虚地崩溃' : '削波：输出撞上摆幅极限，负反馈失效，虚地崩溃';
  }
  return (
    <div className={`w33-formula ${a.state === 'linear' ? '' : 'bad'}`}>
      <Tex tex={tex} />
      <span>{note}</span>
    </div>
  );
}

export default function Bench3D() {
  useClearHoverOnUnmount();
  const [vi, setVi] = useStageParam('vi', DEFAULTS.vi);
  const [supply, setSupply] = useStageParam<Supply>('supply', DEFAULTS.supply);
  const [labRf, setLabRf] = useStageParam('labRf', DEFAULTS.labRf);
  const [probe, setProbe] = useStageParam<Probe>('probe', 'p1');
  const [fault, setFault] = useStageParam<Fault>('fault', DEFAULTS.fault);
  const [view] = useStageParam<BenchCam>('cam', 'bench');
  const isLit = useIsLit();
  const a = solve(vi, 10_000, labRf, supply, fault);
  const value = reading(probe, a);
  const cur = supplyCurrents(a);
  return (
    <div className="w33-layer">
      <div className="w33-ctrl">
        <div className="w33-row">
          <Slider
            label="vᵢ"
            value={vi}
            min={-5}
            max={5}
            step={0.05}
            unit="V"
            onChange={setVi}
            hover={['vi_src']}
            fmt={(v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2)}
          />
          <Seg label="电源模式" value={supply} onChange={setSupply} options={SUPPLY_OPTIONS} className="small" />
          <Seg
            label="反馈电阻"
            value={String(labRf)}
            onChange={(v) => setLabRf(Number(v))}
            className="small"
            options={[
              { value: '22000', label: 'Rf 22 kΩ', short: '22k', hover: ['rf'] },
              { value: '47000', label: 'Rf 47 kΩ（削波对比）', short: '47k', hover: ['rf'] },
            ]}
          />
        </div>
        <div className="w33-row scroll">
          <Seg label="红表笔测点" value={probe} onChange={setProbe} options={PROBES.map((p) => ({ ...p, hover: PROBE_IDS[p.value] }))} className="small" />
          <Seg label="接线" value={fault} onChange={setFault} options={FAULTS} className="small" />
        </div>
      </div>
      <div className="bb3d-wrap w33-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-10, 50, 40], fov: 38, near: 0.5, far: 500 }} className="bb3d-canvas">
          <Scene a={a} probe={probe} view={view} setProbe={setProbe} />
        </Canvas>
        <div className="w33-hud">
          <div className={`w33-reading ${isLit('dmm') ? 'lit' : ''}`} aria-live="polite" tabIndex={0} {...hov(['dmm'])}>
            <span>万用表 DC V · 黑表笔 GND · 红表笔 {PROBES.find((p) => p.value === probe)!.label}</span>
            <b>{fmtV(value)}</b>
          </div>
          <div className={`w33-reading supply ${isLit('supply') ? 'lit' : ''}`} tabIndex={0} {...hov(['supply'])}>
            <span>{SUPPLY_NAME}</span>
            <b>
              CH1 {fmtMa(cur.ch1)} · CH2 {supply === 'dual' ? fmtMa(cur.ch2) : '未接'}
            </b>
          </div>
          <div className={`w33-reading power ${isLit('safety') ? 'lit' : ''}`} tabIndex={0} {...hov(['safety'])}>
            <span>电阻功耗（额定 {P_RATED * 1000} mW）</span>
            <b>
              R₁ {fmtP(a.pR1)} · Rf {fmtP(a.pRf)}
            </b>
          </div>
        </div>
      </div>
      <FormulaCard a={a} />
      <span className={`w33-notice ${supply === 'single' ? 'bad' : ''} ${isLit('safety') ? 'lit' : ''}`} tabIndex={0} {...hov(['safety'])}>
        {supply === 'dual'
          ? '本课阻值已是 kΩ 级（10 kΩ / 22 kΩ），无需 1000× 缩放；±9 V 双电源，Pin 4 接 −9 V、Pin 8 接 +9 V，切勿反接'
          : '错误接法演示：Pin 4 接了 GND（单 +9 V），正输入时输出降不到负电压，死锁 0 V'}
      </span>
    </div>
  );
}
