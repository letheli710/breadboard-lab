// Layer "03 3D 面包板 9V 实测接线台": an MB-102 board wired hole by hole as in the lesson sheet's
// table (mode A: series divider; mode B: current divider; plus the loaded divider, the guided
// example and three branches), a 9 V supply module on the top rails, 1/4 W colour-band
// resistors that follow the sliders, and a multimeter whose probes sit where the sheet puts them
// (DC V: across b12–b19; DC mA: in series in the branch's return path). A thermal bar shows each
// resistor's power against the 1/4 W rating: orange above 125 mW, smoke above 250 mW — try the
// textbook values (Ω) to see why the board uses ×1000.
// Built from the shared breadboard geometry (BreadboardXray.tsx); the printed top is redrawn here
// because this lesson's rail holes sit in groups 1–5, 7–11, … (the sheet's Rail(±)-Col 2 / 5 / 8 /
// 10 / 19 / 25 are holes).

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, COLS, D, RAIL_Z, ROW_Z, ROWS, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { useLit, useStage } from '../../stageStore';
import { Controls, hoverProps, ScaleNotice, useCircuit, useClearHoverOnUnmount, type Circuit } from './circuit';
import { bandsHex, bandsOf, fmtP, fmtR, heatOf, P_MAX, readingOf, type Heat, type Meter, type Part, type Topo } from './model';

/* ------------------------------------------------------------- holes */

/** rail holes of this board: groups of five, columns 1–5, 7–11, …, 55–59 */
const RAIL_COLS: number[] = Array.from({ length: 10 }, (_, g) => [0, 1, 2, 3, 4].map((k) => 1 + 6 * g + k)).flat();
const RAIL_ID: Record<Rail, string> = { tp: 'rail_pos', bp: 'rail_pos', tn: 'rail_neg', bn: 'rail_neg' };

/** Board coordinates of a hole: "e12", "R+5" (top + rail, column 5), "R-19" (top − rail). */
function hole(h: string): [number, number] {
  const m = /^R([+-])(\d+)$/.exec(h);
  if (m) {
    const c = Number(m[2]);
    if (!RAIL_COLS.includes(c)) throw new Error(`no rail hole at column ${c}`);
    return [colX(c), m[1] === '+' ? RAIL_Z.tp : RAIL_Z.tn];
  }
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

/** What a pointer at board coordinates (x, z) is over, or null. */
function pick(x: number, z: number): string | null {
  const c = Math.round(x + 32);
  if (Math.abs(z) < 0.95) return 'center_trench';
  for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 1 && c <= 59) return RAIL_ID[r];
  if (c < 1 || c > COLS) return null;
  if (z <= -1 && z >= -6) return stripId('u', c);
  if (z >= 1 && z <= 6) return stripId('l', c);
  return null;
}

/* ------------------------------------------------------------- printed top surface */

function paintTop(ppu: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.round(W * ppu);
  c.height = Math.round(D * ppu);
  const g = c.getContext('2d')!;
  const X = (x: number) => (x + W / 2) * ppu;
  const Z = (z: number) => (z + D / 2) * ppu;
  g.fillStyle = '#f5f0e4';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#d9cfb9';
  g.fillRect(X(-W / 2 + 0.8), Z(-0.7), (W - 1.6) * ppu, 1.4 * ppu);
  g.fillStyle = '#c9bea6';
  g.fillRect(X(-W / 2 + 0.8), Z(-0.12), (W - 1.6) * ppu, 0.24 * ppu);
  const stripe = (z: number, color: string) => {
    g.strokeStyle = color;
    g.lineWidth = 0.12 * ppu;
    g.beginPath();
    g.moveTo(X(colX(1) - 0.4), Z(z));
    g.lineTo(X(colX(59) + 0.4), Z(z));
    g.stroke();
  };
  stripe(RAIL_Z.tp - 0.6, '#e63946');
  stripe(RAIL_Z.tn + 0.6, '#2b59c3');
  stripe(RAIL_Z.bp - 0.6, '#e63946');
  stripe(RAIL_Z.bn + 0.6, '#2b59c3');
  const holeAt = (x: number, z: number) => {
    const s = 0.44 * ppu;
    g.fillStyle = '#3a3733';
    g.fillRect(X(x) - s / 2, Z(z) - s / 2, s, s);
  };
  for (let col = 1; col <= COLS; col++) for (const r of ROWS) holeAt(colX(col), ROW_Z[r]);
  for (const r of Object.keys(RAIL_Z) as Rail[]) for (const col of RAIL_COLS) holeAt(colX(col), RAIL_Z[r]);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${0.62 * ppu}px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif`;
  g.fillStyle = '#6b6352';
  for (const r of ROWS) {
    g.fillText(r, X(colX(1) - 1.2), Z(ROW_Z[r]));
    g.fillText(r, X(colX(COLS) + 1.2), Z(ROW_Z[r]));
  }
  for (let col = 1; col <= COLS; col++) {
    if (col !== 1 && col % 5 !== 0) continue;
    g.fillText(String(col), X(colX(col)), Z(ROW_Z.a - 1.05));
    g.fillText(String(col), X(colX(col)), Z(ROW_Z.j + 1.05));
  }
  g.font = `800 ${0.9 * ppu}px sans-serif`;
  const sign = (z: number, s: string, color: string) => {
    g.fillStyle = color;
    g.fillText(s, X(colX(1) - 1.25), Z(z));
    g.fillText(s, X(colX(61)), Z(z));
  };
  sign(RAIL_Z.tp, '+', '#c62f3b');
  sign(RAIL_Z.tn, '−', '#2b59c3');
  sign(RAIL_Z.bp, '+', '#c62f3b');
  sign(RAIL_Z.bn, '−', '#2b59c3');
  return c;
}

function Board() {
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(paintTop(28));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.51, 0]}>
        <boxGeometry args={[W, 0.98, D]} />
        <meshStandardMaterial color="#ece4d2" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------- hover */

/** Light `ids`; `release` clears the hover only if it is still the one this source set (moving
 *  from a 3D object onto an HTML overlay fires the overlay's enter before the canvas's leave). */
function claimHover(ids: string[]) {
  useStage.getState().setHover(ids);
  return useStage.getState().hover;
}
function releaseHover(mine: string[] | null) {
  if (mine && useStage.getState().hover === mine) useStage.getState().setHover(null);
}

/* ------------------------------------------------------------- wires, resistors, probes */

type V3 = [number, number, number];

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

const WIRE_HEX: Record<string, string> = { red: '#d62f2f', black: '#24262b', orange: '#f08a1c' };

interface JumperSpec {
  name: string;
  from: string;
  to: string;
  color: 'red' | 'black' | 'orange';
}

/** A 22 AWG jumper from hole to hole, arched high enough to clear the resistors it crosses. */
function Jumper({ j }: { j: JumperSpec }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(j.from);
    const [x2, z2] = hole(j.to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const hgt = Math.min(3.2, Math.max(0.7, 0.3 + 0.19 * dist));
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.35, z1], at(0.2, hgt * 0.92), at(0.5, hgt), at(0.8, hgt * 0.92), [x2, 0.35, z2], [x2, -0.3, z2]];
  }, [j.from, j.to]);
  return <Tube pts={pts} color={WIRE_HEX[j.color]} r={0.12} />;
}

const AMBER = '#f59e0b';
/** the lesson sheet's mesh ids (hover map, layer 03) */
const MESH_NAME: Record<string, string> = { tok_r1: 'mesh_resistor_r1_e5_e12', tok_r2: 'mesh_resistor_r2_d12_d19', tok_rl: 'mesh_resistor_rl_addon', tok_r3: 'mesh_resistor_r3' };
const HEAT_GLOW: Record<Heat, string> = { ok: '#000000', warm: '#ff7a1a', smoke: '#ff2a00' };

/** Position of band i along a body of length `len` (the tolerance band sits apart). */
const bandX = (len: number, n: number, i: number) => -len / 2 + 0.38 + i * 0.32 + (i === n - 1 ? 0.3 : 0);

function Resistor3D({
  part,
  from,
  to,
  lit,
  h = 1.25,
  onHover,
  tag,
  tagDz = 0,
}: {
  part: Part;
  from: string;
  to: string;
  lit: boolean;
  h?: number;
  onHover: (on: boolean) => void;
  tag: string;
  /** shift of the name tag along z, so tags of neighbouring resistors don't overlap */
  tagDz?: number;
}) {
  const [x1, z1] = hole(from);
  const [x2, z2] = hole(to);
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ang = Math.atan2(-(z2 - z1), x2 - x1);
  const bodyLen = Math.min(2.4, len - 0.6);
  const ux = (x2 - x1) / len;
  const uz = (z2 - z1) / len;
  const e1: V3 = [mx - (ux * bodyLen) / 2, h, mz - (uz * bodyLen) / 2];
  const e2: V3 = [mx + (ux * bodyLen) / 2, h, mz + (uz * bodyLen) / 2];
  const bands = bandsHex(bandsOf(part.ohms));
  const heat = heatOf(part.p);
  const leads = useMemo<[V3[], V3[]]>(
    () => [
      [[x1, -0.3, z1], [x1, h * 0.7, z1], [x1 + ux * 0.25, h, z1 + uz * 0.25], e1],
      [[x2, -0.3, z2], [x2, h * 0.7, z2], [x2 - ux * 0.25, h, z2 - uz * 0.25], e2],
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [from, to, h],
  );
  const enter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(true);
  };
  const glow = lit ? AMBER : HEAT_GLOW[heat];
  return (
    <group name={MESH_NAME[part.id]}>
      <Tube pts={leads[0]} color="#b9bec4" r={0.07} />
      <Tube pts={leads[1]} color="#b9bec4" r={0.07} />
      <group position={[mx, h, mz]} rotation={[0, ang, 0]} onPointerOver={enter} onPointerOut={() => onHover(false)}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.36, bodyLen - 0.72, 6, 16]} />
          <meshStandardMaterial color="#e6cc9a" roughness={0.6} emissive={glow} emissiveIntensity={lit ? 0.45 : heat === 'ok' ? 0 : 0.55} />
        </mesh>
        {bands.map((c, i) => (
          <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[bandX(bodyLen, bands.length, i), 0, 0]}>
            <cylinderGeometry args={[0.375, 0.375, 0.14, 18]} />
            <meshStandardMaterial color={c} roughness={0.5} metalness={i === bands.length - 1 ? 0.5 : 0} />
          </mesh>
        ))}
        {/* a larger invisible hit box for the pointer */}
        <mesh visible={false}>
          <boxGeometry args={[bodyLen + 0.4, 1.1, 1.1]} />
        </mesh>
      </group>
      <Html position={[mx, h + 1.15, mz + tagDz]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag l7-rtag ${lit ? 'lit' : ''} heat-${heat}`}>{tag}</div>
      </Html>
      {heat === 'smoke' && (
        <Html position={[mx, h + 0.4, mz]} center zIndexRange={[19, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`l7-smoke ${prefersReducedMotion() ? 'still' : ''}`} aria-hidden>
            <i />
            <i />
            <i />
          </div>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------- supply module and meter */

const PWR = { x: -38.6, z: -8.2 };

function SupplyModule({ vs, lit }: { vs: number; lit: boolean }) {
  const mine = useRef<string[] | null>(null);
  const red: V3[] = useMemo(() => {
    const [x, z] = hole('R+2');
    return [
      [PWR.x + 1.4, 1.15, PWR.z - 2.2],
      [PWR.x + 2.6, 1.9, PWR.z - 2.1],
      [x - 1.2, 1.4, z],
      [x, 0.4, z],
      [x, -0.3, z],
    ];
  }, []);
  const black: V3[] = useMemo(() => {
    const [x, z] = hole('R-2');
    return [
      [PWR.x + 1.4, 1.15, PWR.z + 1.4],
      [PWR.x + 2.6, 1.6, PWR.z + 0.6],
      [x - 1.2, 1.1, z],
      [x, 0.4, z],
      [x, -0.3, z],
    ];
  }, []);
  return (
    <group name="mesh_battery_9v_pack">
      <group
        onPointerOver={(e) => {
          e.stopPropagation();
          mine.current = claimHover(['tok_vs']);
        }}
        onPointerOut={() => releaseHover(mine.current)}
      >
        <mesh position={[PWR.x, 0, PWR.z]}>
          <boxGeometry args={[4.6, 2.0, 7.2]} />
          <meshStandardMaterial color="#2f3440" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
        </mesh>
        <mesh position={[PWR.x - 0.4, 1.02, PWR.z - 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.0, 3.6]} />
          <meshStandardMaterial color="#e5b93a" roughness={0.7} />
        </mesh>
        {/* terminals */}
        <mesh position={[PWR.x + 1.4, 1.15, PWR.z - 2.2]}>
          <cylinderGeometry args={[0.36, 0.36, 0.5, 14]} />
          <meshStandardMaterial color="#d62f2f" />
        </mesh>
        <mesh position={[PWR.x + 1.4, 1.15, PWR.z + 1.4]}>
          <cylinderGeometry args={[0.36, 0.36, 0.5, 14]} />
          <meshStandardMaterial color="#24262b" />
        </mesh>
        {/* the regulator's indicator LED */}
        <mesh position={[PWR.x - 1.4, 1.15, PWR.z + 2.6]}>
          <sphereGeometry args={[0.3, 14, 10]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.4} />
        </mesh>
      </group>
      <Tube pts={red} color={WIRE_HEX.red} r={0.13} lit={lit} />
      <Tube pts={black} color={WIRE_HEX.black} r={0.13} />
      <Html position={[PWR.x, 2.3, PWR.z - 0.6]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag l7-rtag supply ${lit ? 'lit' : ''}`}>9V 电源 · {vs.toFixed(2)} V</div>
      </Html>
    </group>
  );
}

/** the meter leans back on its stand, face up toward the viewer */
const DMM_TILT = 1.2;
const DMM_SIZE = { w: 8, h: 11, t: 1.4 };
const DMM_Y = 1.6;
const DMM_Z = 17;

function dmmWorld(cx: number, local: V3): V3 {
  const [x, y, z] = local;
  const c = Math.cos(DMM_TILT);
  const s = Math.sin(DMM_TILT);
  return [cx + x, DMM_Y + y * c + z * s, DMM_Z - y * s + z * c];
}

const JACK_X = { mA: -2.4, COM: 0, V: 2.4 };

function Probe({ at, color, cx, jack, lit }: { at: string; color: 'red' | 'black'; cx: number; jack: number; lit: boolean }) {
  const [x, z] = hole(at);
  const j = dmmWorld(cx, [jack, -4.1, DMM_SIZE.t / 2 + 0.1]);
  const j2 = dmmWorld(cx, [jack, -4.1, DMM_SIZE.t / 2 + 1.4]);
  // out of the jack, round the meter's front edge, then back over the table to the probe
  const pts = useMemo<V3[]>(
    () => [[x, 4.3, z], [x, 5.8, z + 1.2], [x + (cx - x) * 0.25, 3.4, 13.5], [cx + 5.2 + jack * 0.3, 1.0, j[2] + 1.2], j2, j],
    [x, z, cx, jack, j[2]], // eslint-disable-line react-hooks/exhaustive-deps
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

function Meter3D({ cx, meter, display, unit, lcdId, lit, blown }: { cx: number; meter: Meter; display: string; unit: string; lcdId: string; lit: boolean; blown: boolean }) {
  const setHover = useStage((s) => s.setHover);
  const lcd = dmmWorld(cx, [0, 2.6, DMM_SIZE.t / 2 + 0.05]);
  const jacksAt = dmmWorld(cx, [0, -3.1, DMM_SIZE.t / 2 + 0.1]);
  return (
    <group name={meter === 'V' ? 'mesh_dmm_lcd_voltage' : 'mesh_dmm_lcd_current'}>
      <group position={[cx, DMM_Y, DMM_Z]} rotation={[-DMM_TILT, 0, 0]}>
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
          <meshStandardMaterial color={lit ? '#d8f5c8' : '#b9c7a3'} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.25 : 0} />
        </mesh>
        <mesh position={[0, -0.8, DMM_SIZE.t / 2 + 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.3, 28]} />
          <meshStandardMaterial color="#3d434d" />
        </mesh>
        <mesh position={[meter === 'V' ? 0.9 : -0.9, -0.8 + 0.9, DMM_SIZE.t / 2 + 0.32]} rotation={[0, 0, meter === 'V' ? -0.8 : 0.8]}>
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
        <div
          className={`l7-lcd ${lit ? 'lit' : ''} ${blown ? 'bad' : ''}`}
          onPointerEnter={() => setHover([lcdId])}
          onPointerLeave={() => setHover(null)}
          onFocus={() => setHover([lcdId])}
          onBlur={() => setHover(null)}
          tabIndex={0}
          data-hl={lcdId}
          id={meter === 'V' ? 'mesh_dmm_lcd_voltage' : 'mesh_dmm_lcd_current'}
        >
          <small>{meter === 'V' ? 'DC V' : 'DC mA'}</small>
          <b>{display}</b>
          <span>{unit}</span>
        </div>
      </Html>
      <Html position={jacksAt} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div className="l7-jacks">
          <span className={meter === 'mA' ? 'on' : ''}>mA</span>
          <span className="on">COM</span>
          <span className={meter === 'V' ? 'on' : ''}>VΩ</span>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- wiring by topology */

interface Layout {
  jumpers: JumperSpec[];
  /** resistor i of the solution: from / to hole, height of the body */
  res: { from: string; to: string; h?: number; tagDz?: number }[];
  red: string;
  black: string;
  /** strips of the divider node (lit with tok_node_mid) */
  nodeStrips: string[];
  /** x range shown by the camera */
  frame: [number, number];
}

function layoutOf(topo: Topo, meter: Meter): Layout {
  const mA = meter === 'mA';
  if (topo === 'parallel_cdiv' || topo === 'parallel3') {
    const three = topo === 'parallel3';
    const jumpers: JumperSpec[] = [
      { name: 'J_top', from: 'R+8', to: 'a8', color: 'red' },
      { name: 'J_bus', from: 'c8', to: 'c10', color: 'orange' },
      { name: 'J_gnd2', from: 'j10', to: 'R-10', color: 'black' },
    ];
    if (three) jumpers.push({ name: 'J_bus2', from: 'c10', to: 'c12', color: 'orange' }, { name: 'J_gnd3', from: 'j12', to: 'R-13', color: 'black' });
    if (!mA) jumpers.push({ name: 'J_gnd1', from: 'j8', to: 'R-8', color: 'black' });
    const res: Layout['res'] = [
      { from: 'e8', to: 'f8', tagDz: -3 },
      { from: 'e10', to: 'f10', tagDz: 3 },
    ];
    if (three) res.push({ from: 'e12', to: 'f12', tagDz: -3 });
    return {
      jumpers,
      res,
      red: mA ? 'j8' : 'b8',
      black: mA ? 'R-8' : 'R-9',
      nodeStrips: three ? ['strip_u_8', 'col_strip_a10', 'strip_u_12'] : ['strip_u_8', 'col_strip_a10'],
      frame: [-42, three ? -14 : -16],
    };
  }
  const mixed = topo === 'mixed_socratic';
  const jumpers: JumperSpec[] = [{ name: 'J1', from: 'R+5', to: 'a5', color: 'red' }];
  const res: Layout['res'] = [
    { from: 'e5', to: 'e12' },
    { from: 'd12', to: 'd19' },
  ];
  let red = 'b12';
  let black = 'b19';
  if (mixed) {
    jumpers.push({ name: 'J2', from: 'a19', to: 'R-19', color: 'black' });
    res.push({ from: 'c12', to: 'c25', h: 1.9 });
    if (mA) [red, black] = ['a25', 'R-25'];
    else jumpers.push({ name: 'J3', from: 'a25', to: 'R-25', color: 'black' });
  } else {
    if (topo === 'loaded_vdiv') res.push({ from: 'c12', to: 'c19', h: 1.9 });
    if (mA) [red, black] = ['a19', 'R-19'];
    else jumpers.push({ name: 'J2', from: 'a19', to: 'R-19', color: 'black' });
  }
  return { jumpers, res, red, black, nodeStrips: ['strip_u_12'], frame: [-42, mixed ? -4 : -10] };
}

/* ------------------------------------------------------------- glow on lit strips and rails */

function Glow({ lit, nodeStrips }: { lit: string[]; nodeStrips: string[] }) {
  const ids = new Set(lit);
  if (ids.has('tok_node_mid')) nodeStrips.forEach((s) => ids.add(s));
  if (ids.has('tok_vs')) ids.add('rail_pos');
  const quads: { x: number; z: number; w: number; d: number; color: string; name?: string }[] = [];
  for (const id of ids) {
    const m = /^strip_([ul])_(\d+)$/.exec(id);
    if (m || id === 'col_strip_a10') {
      const half = m ? m[1] : 'u';
      const c = m ? Number(m[2]) : 10;
      quads.push({ x: colX(c), z: half === 'u' ? -3.5 : 3.5, w: 0.86, d: 5.0, color: AMBER, name: id === 'strip_u_12' ? 'mesh_col12_strip_a_e' : id });
    }
    if (id === 'center_trench') quads.push({ x: 0, z: 0, w: W - 1.6, d: 1.4, color: AMBER });
    if (id === 'rail_pos' || id === 'rail_neg') {
      const z = id === 'rail_pos' ? RAIL_Z.tp : RAIL_Z.tn;
      quads.push({ x: (colX(1) + colX(59)) / 2, z, w: colX(59) - colX(1) + 1.2, d: 0.86, color: id === 'rail_pos' ? '#ff4d5e' : '#4f86ff' });
    }
  }
  return (
    <>
      {quads.map((q, i) => (
        <mesh key={i} name={q.name} position={[q.x, 0.03, q.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
          <planeGeometry args={[q.w, q.d]} />
          <meshBasicMaterial color={q.color} transparent opacity={0.45} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

/* ------------------------------------------------------------- camera */

const VIEW_DIR = new THREE.Vector3(0, 1.6, 1).normalize();
const Z_RANGE: [number, number] = [-12.5, 22.5];

const FIT_TARGET = (x0: number, x1: number) => new THREE.Vector3((x0 + x1) / 2, 0.5, (Z_RANGE[0] + Z_RANGE[1]) / 2);

/** Camera position along VIEW_DIR that shows the whole bench (board part, supply, meter): the
 *  nearest distance at which every corner of its box projects inside the canvas. */
function fitView(camera: THREE.PerspectiveCamera, aspect: number, x0: number, x1: number): THREE.Vector3 {
  const target = FIT_TARGET(x0, x1);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of [x0, x1]) for (const y of [-1, 4.5]) for (const z of Z_RANGE) corners.push(new THREE.Vector3(x, y, z));
  const v = new THREE.Vector3();
  let d = 12;
  for (; d < 260; d *= 1.04) {
    cam.position.copy(target).addScaledVector(VIEW_DIR, d);
    cam.lookAt(target);
    cam.updateMatrixWorld();
    if (corners.every((c) => (v.copy(c).project(cam), Math.abs(v.x) < 0.94 && Math.abs(v.y) < 0.9))) break;
  }
  return target.clone().addScaledVector(VIEW_DIR, d);
}

function CameraRig({ frame }: { frame: [number, number] }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const anim = useRef<{ t: number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3 } | null>(null);
  const [x0, x1] = frame;
  useEffect(() => {
    if (!controls) return;
    const toP = fitView(camera, aspect, x0, x1);
    const toT = FIT_TARGET(x0, x1);
    if (prefersReducedMotion()) {
      camera.position.copy(toP);
      controls.target.copy(toT);
      controls.update();
      invalidate();
      return;
    }
    anim.current = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toP, toT };
    invalidate();
  }, [x0, x1, controls, camera, invalidate, aspect]);
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

const TAGS: Record<string, string> = { tok_r1: 'R1', tok_r2: 'R2', tok_rl: 'RL', tok_r3: 'R3' };

function Scene({ c }: { c: Circuit }) {
  const lit = useLit();
  const s = c.sol;
  const L = layoutOf(c.topo, c.meter);
  const reading = readingOf(s, c.meter);
  const cx = L.frame[0] + 5.5;
  const last = useRef<string | null>(null);
  const mine = useRef<string[] | null>(null);
  const move = (e: ThreeEvent<PointerEvent>) => {
    const id = pick(e.point.x, e.point.z);
    if (id !== last.current) {
      last.current = id;
      releaseHover(mine.current);
      mine.current = id ? claimHover(L.nodeStrips.includes(id) ? [id, 'tok_node_mid'] : [id]) : null;
    }
  };
  const leave = () => {
    last.current = null;
    releaseHover(mine.current);
    mine.current = null;
  };
  const lcdLit = lit.includes(reading.id) || (reading.id === 'tok_v2' && lit.includes('tok_node_mid'));
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Board />
      <Glow lit={lit} nodeStrips={L.nodeStrips} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <SupplyModule vs={c.vs} lit={lit.includes('tok_vs')} />
      {L.jumpers.map((j) => (
        <Jumper key={j.name} j={j} />
      ))}
      {s.parts.map((p, k) => (
        <Resistor3D
          key={`${p.id}-${L.res[k].from}-${L.res[k].to}`}
          part={p}
          from={L.res[k].from}
          to={L.res[k].to}
          h={L.res[k].h}
          tagDz={L.res[k].tagDz}
          lit={lit.includes(p.id)}
          onHover={(on) => {
            if (on) mine.current = claimHover([p.id]);
            else releaseHover(mine.current);
          }}
          tag={`${TAGS[p.id]} ${fmtR(p.ohms)}`}
        />
      ))}
      <Probe at={L.red} color="red" cx={cx} jack={c.meter === 'V' ? JACK_X.V : JACK_X.mA} lit={lcdLit} />
      <Probe at={L.black} color="black" cx={cx} jack={JACK_X.COM} lit={lcdLit} />
      <Meter3D cx={cx} meter={c.meter} display={reading.display} unit={reading.unit} lcdId={reading.id} lit={lcdLit} blown={reading.blown} />
      <OrbitControls makeDefault enableDamping={false} minDistance={8} maxDistance={110} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig frame={L.frame} />
    </>
  );
}

/* ------------------------------------------------------------- HUD and layer */

function ThermalBar({ c }: { c: Circuit }) {
  const lit = useLit();
  const on = lit.includes('tok_safety_scale');
  return (
    <div id="mesh_thermal_bar_r2" data-hl="tok_safety_scale" className={`l7-thermal ${on ? 'lit' : ''}`} {...hoverProps(['tok_safety_scale'])}>
      <div className="l7-thermal-title">热成像 · 1/4 W 额定</div>
      {c.sol.parts.map((p) => {
        const h = heatOf(p.p);
        return (
          <div key={p.id} className={`l7-thermal-row heat-${h}`}>
            <span>P_{p.name}</span>
            <i>
              <em style={{ width: `${Math.min(100, (p.p / P_MAX) * 100)}%` }} />
              <u />
            </i>
            <b>{fmtP(p.p)}</b>
          </div>
        );
      })}
    </div>
  );
}

function MeterSwitch({ c }: { c: Circuit }) {
  return (
    <div className="l7-seg small" role="radiogroup" aria-label="万用表档位">
      <button role="radio" aria-checked={c.meter === 'V'} className={c.meter === 'V' ? 'on' : ''} onClick={() => c.set({ meter: 'V' })}>
        <span className="full">DC V 电压档（并联跨接）</span>
        <span className="short">DC V</span>
      </button>
      <button role="radio" aria-checked={c.meter === 'mA'} className={c.meter === 'mA' ? 'on' : ''} onClick={() => c.set({ meter: 'mA' })}>
        <span className="full">DC mA 电流档（串入支路）</span>
        <span className="short">DC mA</span>
      </button>
    </div>
  );
}

export default function Bench3D() {
  const c = useCircuit();
  useClearHoverOnUnmount();
  const reading = readingOf(c.sol, c.meter);
  return (
    <div className="l7-layer">
      <Controls c={c} extra={<MeterSwitch c={c} />} />
      <div className="bb3d-wrap l7-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-24, 40, 36], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <Scene c={c} />
        </Canvas>
        <div className="l7-hud">
          <div className={`l7-reading ${reading.blown ? 'bad' : ''}`} aria-live="polite">
            <span>万用表 · {reading.what}</span>
            {!reading.blown && (
              <b>
                {reading.display} {reading.unit}
              </b>
            )}
          </div>
          <ThermalBar c={c} />
        </div>
      </div>
      <ScaleNotice c={c} />
    </div>
  );
}
