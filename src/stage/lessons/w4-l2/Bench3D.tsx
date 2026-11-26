// Layer "01 3D 色环/绕线电感封装与面包板插法": an 830-hole board on the bench.
// - Example 5.1 is built on the left half and fed by the 台式可调直流电源（9 V） (the shared
//   BenchSupply of src/stage/bench) standing behind the board: + → top outer rail (+9 V), − → top inner rail (GND); a long black jumper ties the
//   top GND rail to the bottom outer rail. Red jumper T+13 → a14; R1 100 Ω c14 → c20; node A =
//   column 20 (upper strip); R2 300 Ω b20 → top GND (col 21); L = 20 mH, the shared drum-core
//   power inductor (Passives3D), d20 / d23; R3 150 Ω b23 → top GND (col 24); R4 200 Ω e20 → h20
//   across the trench (node D = lower column 20); the shared 10 µF electrolytic, + in i20, − in
//   i22, black jumper j22 → bottom GND.
// - The coupling demo on the right (not wired in): two 10 mH drum chokes spaced apart (M ≈ 0) or
//   pushed together (the mistake), with their flux loops drawn.
// - A tray in front (the device view, lesson-local models): a 1/4 W carbon-film resistor next to
//   the 0410 colour-ring inductor (the look-alikes), a drum-core (工字) inductor and a toroid.
// The 数字万用表 (DC V) reads node A, the capacitor, across L (0 V: a short) or across R4 (0 V);
// Example 5.1's answers stay "?" until the guided example has reached them.

import { Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, RAIL_Z, ROW_Z, Shell } from '../../BreadboardXray';
import { COLOR_BY_KEY } from '../../colorCode';
import { BenchSupply, type SupplyChannel, type SupplyLead } from '../../bench';
import { BENCH_NAMES, Capacitor, Inductor } from '../../Passives3D';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { bandKeys, fmtW, num } from './model';
import { HIDDEN, hov, MaskNote, Seg, useClearHoverOnUnmount, useDc, useIsLit, type Dc, type Shown } from './state';

type V3 = [number, number, number];
const AMBER = '#f59e0b';

/** part tags show in the close-up views (and on any part that is lit) */
const ShowTags = createContext(true);

/* ------------------------------------------------------------- holes and hover */

/** Board coordinates of a hole: "c14"; rails "T+13" (+9 V), "Tg21" (top GND), "Bg22" (bottom GND). */
function hole(h: string): [number, number] {
  const m = /^([TB])([+g])(\d+)$/.exec(h);
  if (m) {
    const z = m[1] === 'T' ? (m[2] === '+' ? RAIL_Z.tp : RAIL_Z.tn) : m[2] === 'g' ? RAIL_Z.bn : RAIL_Z.bp;
    return [colX(Number(m[3])), z];
  }
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

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
      <meshStandardMaterial color={color} roughness={0.5} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.6 : 0} />
    </mesh>
  );
}

const WIRE = { red: '#d62f2f', black: '#24262b', blue: '#2b59c3' } as const;

function Jumper({ from, to, color, lit = false, lift = 0 }: { from: string; to: string; color: keyof typeof WIRE; lit?: boolean; lift?: number }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(from);
    const [x2, z2] = hole(to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const hgt = Math.min(2.8, Math.max(0.6, 0.3 + 0.19 * dist)) + lift;
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.35, z1], at(0.2, hgt * 0.92), at(0.5, hgt), at(0.8, hgt * 0.92), [x2, 0.35, z2], [x2, -0.3, z2]];
  }, [from, to, lift]);
  return <Tube pts={pts} color={WIRE[color]} r={0.12} lit={lit} />;
}

/* ------------------------------------------------------------- parts */

const hex = (k: string) => COLOR_BY_KEY.get(k)!.hex;

/** Axial body (resistor or colour-ring inductor), shaped along local x, centred at 0. */
function AxialBody({ kind, bands, lit }: { kind: 'res' | 'ind'; bands: string[]; lit: boolean }) {
  const ind = kind === 'ind';
  const len = ind ? 3.0 : 2.4;
  const r = ind ? 0.56 : 0.36;
  const body = ind ? '#a8dcc0' : '#e6cc9a';
  const step = ind ? 0.42 : 0.3;
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[r, len - 2 * r, 6, 18]} />
        <meshStandardMaterial color={body} roughness={0.55} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.45 : 0} />
      </mesh>
      {ind &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[(s * len) / 2 - s * 0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[r + 0.07, r + 0.07, 0.55, 20]} />
            <meshStandardMaterial color={body} roughness={0.55} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.45 : 0} />
          </mesh>
        ))}
      {bands.map((k, i) => (
        <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[-len / 2 + (ind ? 0.9 : 0.36) + i * step + (i === 3 ? step : 0), 0, 0]}>
          <cylinderGeometry args={[r + 0.015, r + 0.015, ind ? 0.17 : 0.13, 20]} />
          <meshStandardMaterial color={hex(k)} roughness={0.5} metalness={i === 3 ? 0.5 : 0} />
        </mesh>
      ))}
      <mesh visible={false}>
        <boxGeometry args={[len + 0.4, 1.3, 1.3]} />
      </mesh>
    </group>
  );
}

/** An axial part from hole to hole (any direction), body centred above the holes. */
function Axial({
  id,
  from,
  to,
  kind,
  bands,
  h = 1.3,
  tag,
  tagAt,
  lit,
}: {
  id: string;
  from: string;
  to: string;
  kind: 'res' | 'ind';
  bands: string[];
  h?: number;
  tag: string;
  tagAt?: V3;
  lit: boolean;
}) {
  const hover = useHover3D([id]);
  const show = useContext(ShowTags);
  const [x1, z1] = hole(from);
  const [x2, z2] = hole(to);
  const len = kind === 'ind' ? 3.0 : 2.4;
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const d = Math.hypot(x2 - x1, z2 - z1);
  const ux = (x2 - x1) / d;
  const uz = (z2 - z1) / d;
  const ang = Math.atan2(-(z2 - z1), x2 - x1);
  const leads = useMemo<[V3[], V3[]]>(() => {
    const e1: V3 = [mx - (ux * len) / 2, h, mz - (uz * len) / 2];
    const e2: V3 = [mx + (ux * len) / 2, h, mz + (uz * len) / 2];
    return [
      [[x1, -0.3, z1], [x1, h * 0.6, z1], [(x1 + e1[0]) / 2, h * 0.95, (z1 + e1[2]) / 2], e1],
      [[x2, -0.3, z2], [x2, h * 0.6, z2], [(x2 + e2[0]) / 2, h * 0.95, (z2 + e2[2]) / 2], e2],
    ];
  }, [x1, z1, x2, z2, mx, mz, ux, uz, len, h]);
  return (
    <group name={id}>
      <Tube pts={leads[0]} color="#b9bec4" r={0.06} />
      <Tube pts={leads[1]} color="#b9bec4" r={0.06} />
      <group position={[mx, h, mz]} rotation={[0, ang, 0]} {...hover}>
        <AxialBody kind={kind} bands={bands} lit={lit} />
      </group>
      {(show || lit) && (
        <Html position={tagAt ?? [mx, h + 1.2, mz]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`bb3d-tag w42-tag part ${kind} ${lit ? 'lit' : ''}`}>{tag}</div>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------- the bench supply (src/stage/bench) */

const SUPPLY_AT: [number, number] = [-22, -19];
const SUPPLY_LEADS: SupplyLead[] = [
  { from: '+', to: 'T+5', litIds: ['rail_p9'] },
  { from: '-', to: 'T-7', litIds: ['rail_gnd'] },
];

/** one channel at V_s; its live current stays "??" until the guided example has found i_L */
function Supply({ d }: { d: Dc }) {
  const ch: SupplyChannel = d.shown('iL') ? { v: d.c.vs, i: d.s.is } : { v: d.c.vs, readout: `${HIDDEN}${HIDDEN} mA` };
  return <BenchSupply id="supply" position={SUPPLY_AT} channels={[ch]} leads={SUPPLY_LEADS} />;
}

/* ------------------------------------------------------------- tray: the look-alikes and other inductors */

const TRAY = { x: -9.5, z: 16.8, w: 28, d: 7.4 };
/** the tray shows the parts enlarged */
const TRAY_SCALE = 1.8;

function DrumInductor({ lit }: { lit: boolean }) {
  const e = lit ? AMBER : '#000000';
  return (
    <group>
      {[0.25, 2.25].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[1.25, 1.25, 0.36, 28]} />
          <meshStandardMaterial color="#3d4048" roughness={0.8} emissive={e} emissiveIntensity={lit ? 0.35 : 0} />
        </mesh>
      ))}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.98, 0.98, 1.66, 28]} />
        <meshStandardMaterial color="#c8742c" metalness={0.6} roughness={0.35} emissive={e} emissiveIntensity={lit ? 0.35 : 0} />
      </mesh>
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, -0.25, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#b9bec4" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Toroid({ lit }: { lit: boolean }) {
  const wraps = 22;
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.7, 0]}>
      <mesh>
        <torusGeometry args={[1.5, 0.55, 18, 48]} />
        <meshStandardMaterial color="#3f5a4a" roughness={0.7} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
      </mesh>
      {Array.from({ length: wraps }, (_, k) => {
        const a = (k / wraps) * Math.PI * 2;
        return (
          <mesh key={k} position={[1.5 * Math.cos(a), 1.5 * Math.sin(a), 0]} rotation={[0, Math.PI / 2, a]}>
            <torusGeometry args={[0.6, 0.055, 6, 18]} />
            <meshStandardMaterial color="#c8742c" metalness={0.6} roughness={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}

function Tray({ labels }: { labels: boolean }) {
  const isLit = useIsLit();
  const items: { id: string; x: number; label: string; node: ReactNode; y?: number }[] = [
    { id: 'tray_res', x: -20, label: '1/4 W 碳膜电阻 100 Ω（米黄底）', node: <AxialBody kind="res" bands={bandKeys(100)} lit={isLit('tray_res')} />, y: 0.6 },
    { id: 'tray_ring', x: -13, label: '0410 色环电感 20 mH（淡绿底、两端鼓起）', node: <AxialBody kind="ind" bands={bandKeys(20_000)} lit={isLit('tray_ring')} />, y: 0.75 },
    { id: 'tray_drum', x: -6, label: '工字绕线电感', node: <DrumInductor lit={isLit('tray_drum')} />, y: 0.1 },
    { id: 'tray_toroid', x: 1, label: '环形磁芯电感', node: <Toroid lit={isLit('tray_toroid')} />, y: 0 },
  ];
  return (
    <group>
      <mesh position={[TRAY.x, -0.85, TRAY.z]}>
        <boxGeometry args={[TRAY.w, 0.3, TRAY.d]} />
        <meshStandardMaterial color="#f4efe3" roughness={0.9} />
      </mesh>
      {items.map((it) => (
        <TrayItem key={it.id} {...it} label={it.label} labels={labels} />
      ))}
    </group>
  );
}

function TrayItem({ id, x, label, node, y = 0, labels }: { id: string; x: number; label: string; node: ReactNode; y?: number; labels: boolean }) {
  const hover = useHover3D([id]);
  const isLit = useIsLit();
  return (
    <group>
      <group position={[x, (y - 0.4) * TRAY_SCALE - 0.1, TRAY.z - 1.2]} scale={TRAY_SCALE} {...hover}>
        {node}
      </group>
      {(labels || isLit(id)) && (
        <Html position={[x, -0.6, TRAY.z + 2.7]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`bb3d-tag w42-tag tray ${isLit(id) ? 'lit' : ''}`}>{label}</div>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------- coupling demo */

function FluxLoop({ c, u, w, a, b, color }: { c: V3; u: V3; w: V3; a: number; b: number; color: string }) {
  const pts = useMemo(() => {
    const out: V3[] = [];
    for (let k = 0; k <= 48; k++) {
      const t = (k / 48) * Math.PI * 2;
      out.push([
        c[0] + u[0] * a * Math.cos(t) + w[0] * b * Math.sin(t),
        c[1] + u[1] * a * Math.cos(t) + w[1] * b * Math.sin(t),
        c[2] + u[2] * a * Math.cos(t) + w[2] * b * Math.sin(t),
      ]);
    }
    return out;
  }, [c, u, w, a, b]);
  return <Line points={pts} color={color} lineWidth={1.6} dashed dashSize={0.4} gapSize={0.25} />;
}

function Coupling({ mode, lit }: { mode: 'ortho' | 'parallel'; lit: boolean }) {
  const show = useContext(ShowTags);
  const ok = mode === 'ortho';
  // two 10 mH drum chokes: spaced apart (cols 45/47 and 56/58), or pushed together (45/47, 49/51)
  const b = ok ? (['f56', 'f58'] as const) : (['c49', 'c51'] as const);
  const [ax1, az1] = hole('c45');
  const [ax2] = hole('c47');
  const [bx1, bz1] = hole(b[0]);
  const [bx2] = hole(b[1]);
  const ca: V3 = [(ax1 + ax2) / 2, 1.45, az1];
  const cb: V3 = [(bx1 + bx2) / 2, 1.45, bz1];
  const col = ok ? '#2563eb' : '#dc2626';
  const tags = show || lit;
  return (
    <group>
      <Inductor p1={hole('c45')} p2={hole('c47')} id="couple_pair" label={tags ? 'L₁ 10 mH' : ''} />
      <Inductor p1={hole(b[0])} p2={hole(b[1])} id="couple_pair" label={tags ? 'L₂ 10 mH' : ''} />
      {(lit || !ok) &&
        [ca, cb].map((c, k) => (
          <group key={k}>
            <FluxLoop c={c} u={[0, 1, 0]} w={[1, 0, 0]} a={2.1} b={2.4} color={k ? col : '#2563eb'} />
            <FluxLoop c={c} u={[0, 1, 0]} w={[0, 0, 1]} a={2.1} b={2.4} color={k ? col : '#2563eb'} />
          </group>
        ))}
      <Html position={[colX(51), 3.6, -7.4]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w42-tag ${ok ? 'good' : 'bad'} ${lit ? 'lit' : ''}`}>{ok ? '✓ 留足间距：磁通互不穿过，M ≈ 0' : '✕ 紧贴摆放：磁通互相穿过，M ≠ 0'}</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- multimeter */

export type Probe = 'a' | 'c' | 'l' | 'r4';
export const PROBES: { value: Probe; label: string; short: string; red: string; black: string; ids: string[]; need: Shown }[] = [
  { value: 'a', label: '节点 A 对地', short: 'v_A', red: 'a20', black: 'Bg30', ids: ['node_a'], need: 'vA' },
  { value: 'c', label: '电容 C 两端', short: 'v_C', red: 'j20', black: 'h22', ids: ['cap_c'], need: 'vA' },
  { value: 'l', label: '电感 L 两端', short: 'v_L', red: 'a20', black: 'a23', ids: ['ind_l'], need: 'vL' },
  { value: 'r4', label: 'R₄ 两端', short: 'v_R4', red: 'a20', black: 'g20', ids: ['r4'], need: 'vR4' },
];

export function reading(p: Probe, d: Dc): number {
  return p === 'a' || p === 'c' ? d.s.vA : 0;
}

const DMM_TILT = 1.2;
const DMM_SIZE = { w: 8, h: 11, t: 1.4 };
const DMM_Y = 1.6;
const DMM_Z = 15.5;
const DMM_X = 22;
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
  const pts = useMemo<V3[]>(() => [[x, 4.3, z], [x, 5.8, z + 1.2], [x + (DMM_X - x) * 0.35, 3.8, 12.5], [DMM_X - 5 + jack * 0.3, 1.0, j[2] + 1.2], j2, j], [x, z, jack, j, j2]);
  const c = color === 'red' ? '#d62f2f' : '#24262b';
  return (
    <group>
      <mesh position={[x, 0.7, z]}>
        <cylinderGeometry args={[0.06, 0.03, 2.0, 8]} />
        <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[x, 2.9, z]}>
        <cylinderGeometry args={[0.26, 0.22, 2.8, 14]} />
        <meshStandardMaterial color={c} roughness={0.45} emissive={lit ? c : '#000000'} emissiveIntensity={lit ? 0.6 : 0} />
      </mesh>
      <Tube pts={pts} color={c} r={0.1} />
    </group>
  );
}

function Meter3D({ value, lit }: { value: string; lit: boolean }) {
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
        {(['COM', 'V'] as const).map((k) => (
          <mesh key={k} position={[JACK_X[k], -4.1, DMM_SIZE.t / 2 + 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.2, 16]} />
            <meshStandardMaterial color={k === 'COM' ? '#111' : '#b3261e'} />
          </mesh>
        ))}
      </group>
      <Html position={lcd} center zIndexRange={[25, 0]}>
        <div className={`w42-lcd ${lit ? 'lit' : ''}`} tabIndex={0} {...hov(['dmm'])}>
          <small>DC V</small>
          <b>{value}</b>
          <span>V</span>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- glow on lit strips and rails */

function Glow({ lit }: { lit: string[] }) {
  const has = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const quads: { x: number; z: number; w: number; d: number; color: string }[] = [];
  const strip = (c: number, lower: boolean, color = AMBER) => quads.push({ x: colX(c), z: lower ? 3.5 : -3.5, w: 0.86, d: 5.0, color });
  const rail = (z: number, color: string) => quads.push({ x: (colX(3) + colX(61)) / 2, z, w: colX(61) - colX(3) + 1.2, d: 0.86, color });
  if (has('rail_p9', 'supply')) {
    rail(RAIL_Z.tp, '#ff4d5e');
    strip(14, false, '#ff4d5e');
  }
  if (has('rail_gnd', 'supply')) {
    rail(RAIL_Z.tn, '#64748b');
    rail(RAIL_Z.bn, '#64748b');
  }
  if (has('node_a')) strip(20, false);
  if (has('cap_c', 'r4')) strip(20, true);
  if (has('ind_l', 'r3')) strip(23, false);
  if (has('center_trench')) quads.push({ x: 0, z: 0, w: 64, d: 1.4, color: AMBER });
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

export type BenchCam = 'bench' | 'parts' | 'circuit' | 'couple';
const VIEW_DIR = new THREE.Vector3(0, 1.55, 1).normalize();
const FRAMES: Record<BenchCam, { x: [number, number]; z: [number, number] }> = {
  bench: { x: [-34, 34], z: [-23, 21] },
  parts: { x: [-24, 5], z: [12, 21] },
  circuit: { x: [-21, -4], z: [-11, 7] },
  couple: { x: [12, 27], z: [-10, 4] },
};

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: (typeof FRAMES)[BenchCam]) {
  const target = new THREE.Vector3((f.x[0] + f.x[1]) / 2, 0.5, (f.z[0] + f.z[1]) / 2);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of f.x) for (const y of [-1, 4]) for (const z of f.z) corners.push(new THREE.Vector3(x, y, z));
  const v = new THREE.Vector3();
  let d = 10;
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

function RailTag({ z, text, cls }: { z: number; text: string; cls: string }) {
  return (
    <Html position={[colX(1) - 2.2, 0.4, z]} center zIndexRange={[19, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`w42-railtag ${cls}`}>{text}</div>
    </Html>
  );
}

function Scene({ d, probe, view, couple }: { d: Dc; probe: Probe; view: BenchCam; couple: 'ortho' | 'parallel' }) {
  const lit = useLit();
  const isLit = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const p = PROBES.find((x) => x.value === probe)!;
  const value = d.shown(p.need) ? num(reading(probe, d)) : '?.??';
  const dmmLit = isLit('dmm', ...p.ids);
  const r = d.c;
  return (
    <ShowTags.Provider value={view !== 'bench'}>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <mesh position={[-4, -1.02, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[130, 80]} />
        <meshStandardMaterial color="#e8dcc4" roughness={0.95} />
      </mesh>
      <Shell xray={0} />
      <Glow lit={lit} />
      <RailTag z={RAIL_Z.tp} text="+9 V" cls="p" />
      <RailTag z={RAIL_Z.tn} text="GND" cls="g" />
      <RailTag z={RAIL_Z.bn} text="GND" cls="g" />
      <Supply d={d} />
      <Jumper from="Tg4" to="Bg4" color="black" lit={isLit('rail_gnd')} lift={0.3} />
      {/* Example 5.1 */}
      <Jumper from="T+13" to="a14" color="red" lit={isLit('rail_p9')} />
      <Axial id="r1" from="c14" to="c20" kind="res" bands={bandKeys(r.r1)} tag={`R₁ ${r.r1} Ω`} tagAt={[colX(17), 2.5, ROW_Z.c + 0.2]} lit={isLit('r1')} />
      <Axial id="r2" from="b20" to="Tg21" kind="res" bands={bandKeys(r.r2)} tag={`R₂ ${r.r2} Ω`} tagAt={[colX(18.2), 2.6, -7.6]} lit={isLit('r2')} />
      <Inductor p1={hole('d20')} p2={hole('d23')} id="ind_l" label={view !== 'bench' || isLit('ind_l') ? 'L 20 mH（工字功率电感）' : ''} />
      <Axial id="r3" from="b23" to="Tg24" kind="res" bands={bandKeys(r.r3)} tag={`R₃ ${r.r3} Ω`} tagAt={[colX(25.8), 2.6, -7.6]} lit={isLit('r3')} />
      <Axial id="r4" from="e20" to="h20" kind="res" bands={bandKeys(r.r4)} tag={`R₄ ${r.r4} Ω`} tagAt={[colX(17.2), 2.2, 0.4]} lit={isLit('r4')} />
      <Capacitor p1={hole('i20')} p2={hole('i22')} kind="electrolytic" id="cap_c" label={view !== 'bench' || isLit('cap_c') ? 'C 10 µF（+ 接 i20）' : ''} />
      <Jumper from="j22" to="Bg23" color="black" lit={isLit('cap_c')} />
      <Html position={[colX(20), 0.6, -7]} center zIndexRange={[19, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`w42-node ${isLit('node_a') ? 'lit' : ''}`}>A</div>
      </Html>
      <Coupling mode={couple} lit={isLit('couple_pair')} />
      <Tray labels={view === 'parts'} />
      <ProbePin at={p.red} color="red" jack={JACK_X.V} lit={dmmLit} />
      <ProbePin at={p.black} color="black" jack={JACK_X.COM} lit={dmmLit} />
      <Meter3D value={value} lit={dmmLit} />
      <OrbitControls makeDefault enableDamping={false} minDistance={6} maxDistance={150} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig view={view} />
    </ShowTags.Provider>
  );
}

/* ------------------------------------------------------------- the layer */

export default function Bench3D() {
  useClearHoverOnUnmount();
  const d = useDc();
  const [view, setView] = useStageParam<BenchCam>('cam', 'bench');
  const [probe, setProbe] = useStageParam<Probe>('probe', 'a');
  const [couple, setCouple] = useStageParam<'ortho' | 'parallel'>('couple', 'ortho');
  const isLit = useIsLit();
  const p = PROBES.find((x) => x.value === probe)!;
  const shown = d.shown(p.need);
  const v = reading(probe, d);
  return (
    <div className="w42-layer">
      <div className="w42-ctrl">
        <div className="w42-row scroll">
          <Seg
            label="镜头"
            value={view}
            onChange={setView}
            options={[
              { value: 'bench', label: '全景', short: '全景' },
              { value: 'parts', label: '器件对比托盘', short: '器件', hover: ['tray_ring', 'tray_res'] },
              { value: 'circuit', label: '例题 5.1 电路', short: '例题 5.1', hover: ['ind_l'] },
              { value: 'couple', label: '防耦合摆放', short: '防耦合', hover: ['couple_pair'] },
            ]}
          />
          <Seg
            label="两颗电感的摆法"
            value={couple}
            onChange={setCouple}
            options={[
              { value: 'ortho', label: '留足间距 ✓', short: '留距', tone: 'good', hover: ['couple_pair'] },
              { value: 'parallel', label: '紧贴摆放 ✕', short: '紧贴', tone: 'bad', hover: ['couple_pair'] },
            ]}
          />
        </div>
        <div className="w42-row scroll">
          <Seg label="万用表测点" value={probe} onChange={setProbe} options={PROBES.map((x) => ({ value: x.value, label: x.label, short: x.short, hover: x.ids }))} />
          <MaskNote d={d} />
        </div>
      </div>
      <div className="bb3d-wrap w42-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-10, 50, 40], fov: 38, near: 0.5, far: 500 }} className="bb3d-canvas">
          <Scene d={d} probe={probe} view={view} couple={couple} />
        </Canvas>
        <div className="w42-hud">
          <div className={`w42-reading ${isLit('dmm') ? 'lit' : ''}`} aria-live="polite" tabIndex={0} {...hov(['dmm', ...p.ids])}>
            <span>
              {BENCH_NAMES.dmm} DC V · {p.label}
            </span>
            <b>{shown ? `${num(v)} V` : `${HIDDEN} V`}</b>
          </div>
          <div className={`w42-reading power ${isLit('p_check') ? 'lit' : ''}`} tabIndex={0} {...hov(['p_check'])}>
            <span>R₁ 功耗（额定 0.25 W）</span>
            <b>{d.shown('iL') ? fmtW(d.s.pR1) : HIDDEN}</b>
          </div>
        </div>
      </div>
      <span className={`w42-notice ${isLit('safety') ? 'lit' : ''}`} tabIndex={0} {...hov(['safety'])}>
        色环电感 I_sat 通常仅 100–300 mA、R_DCR 1–30 Ω：本台电流全在 50 mA 以内，电阻功耗均低于 1/4 W；若加开关，务必给 L 反并续流二极管
      </span>
    </div>
  );
}
