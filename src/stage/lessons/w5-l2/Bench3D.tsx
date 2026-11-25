// Layer "03 3D 面包板 RC 相移电路 + 信号发生器与双通道示波器实操": the RC phase-shift divider of
// acts 4–5 on an 830-hole board, driven by a 函数信号发生器 (sine, 5 V peak = 10 Vpp, 50 Ω output,
// 100 Hz … 10 kHz; drag its frequency knob or use the slider) through a BNC-to-alligator lead, and
// watched by a 双通道示波器 behind the board (both adapted from W4-L8's bench). The 100 nF ceramic
// capacitor is the shared Passives3D part; the resistor is drawn here with five bands (1.6 kΩ 1 %
// metal film: brown-blue-black-brown-brown) or four (1.5 kΩ 5 %: brown-green-red-gold).
//
// Layout (column numbers; upper half rows a–e; the top inner rail, blue −, is the one GND rail):
// - IN = column 10: generator red clip e10 (front), CH1 probe tip a10 (back, so the probe cables run
//   back to the scope without crossing the parts)
// - column 15 is the ground end: black jumper b15 → GND rail
// - v_C (R on top): R d10 → d14; OUT = column 14 (CH2 tip a14); 100 nF ceramic c14 – c15
// - v_R (R and C swapped): 100 nF ceramic d10 – d11; OUT = column 11 (CH2 tip a11); R c11 → c15
// - GND rail: generator black clip (column 4), CH1 ground clip (6), CH2 ground clip (21)
// The CH2 ground clip can be moved onto OUT: the scope's earth ties OUT to GND through the mains
// protective earth, the lower part is shorted, CH2 reads 0 V and the bench shows a red alarm.
// Camera: the whole bench, the circuit close-up, the scope screen.

import { Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, D, Lead, RAIL_Z, ROW_Z, Shell, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { BENCH_NAMES, Capacitor } from '../../Passives3D';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { abs, bench, deg, F_RANGE, hz, num, ohm, P_RATED, phaseOf, R_ALT, R_GEN, sec, timeDiv, type Bench as BenchModel, type ClipAt } from './model';
import { Cell, Ch2Seg, FreqSlider, hoverProps, RSeg, Seg, useClearHoverOnUnmount, useIsLit, useLab, type Lab } from './state';

type V3 = [number, number, number];
type Cam = 'bench' | 'board' | 'scope';

const AMBER = '#f59e0b';
const RED = '#e11d48';
export const GEN_NAME = `${BENCH_NAMES.generator}（正弦 10 Vpp · 50 Ω）`;

/* ------------------------------------------------------------- holes and picking */

/** "a10", "G4" (a hole of the GND rail = top inner rail) */
function hole(h: string): [number, number] {
  if (h[0] === 'G') return [colX(Number(h.slice(1))), RAIL_Z.tn];
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

interface Layout {
  swap: boolean;
  out: number;
  /** columns of each node */
  nodes: Record<string, number[]>;
}

function layoutOf(swap: boolean): Layout {
  return { swap, out: swap ? 11 : 14, nodes: { node_in: [10], node_out: [swap ? 11 : 14], node_cgnd: [15] } };
}

function picker(L: Layout) {
  return (x: number, z: number): string[] | null => {
    const c = Math.round(x + 32);
    for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 2 && c <= 62) return r === 'tn' ? ['rail_gnd'] : null;
    if (c < 1 || c > 63) return null;
    if (z <= -1 && z >= -6) {
      for (const [id, cols] of Object.entries(L.nodes)) if (cols.includes(c)) return id === 'node_cgnd' ? ['bb_jumper', 'rail_gnd'] : [id];
      return [stripId('u', c)];
    }
    if (z >= 1 && z <= 6) return [stripId('l', c)];
    return null;
  };
}

/** strip columns (upper half) and rails to tint for the lit ids */
function Glow({ lit, L, fault }: { lit: string[]; L: Layout; fault: boolean }) {
  const quads: { x: number; z: number; w: number; d: number; color: string }[] = [];
  const col = (c: number, color = AMBER) => quads.push({ x: colX(c), z: -3.5, w: 0.86, d: 5.0, color });
  if (fault) col(L.out, RED);
  for (const id of lit) {
    if (L.nodes[id]) L.nodes[id].forEach((c) => col(c, fault && id === 'node_out' ? RED : AMBER));
    const m = /^strip_([ul])_(\d+)$/.exec(id);
    if (m) quads.push({ x: colX(Number(m[2])), z: m[1] === 'u' ? -3.5 : 3.5, w: 0.86, d: 5.0, color: AMBER });
    if (id === 'rail_gnd') quads.push({ x: (colX(3) + colX(61)) / 2, z: RAIL_Z.tn, w: colX(61) - colX(3) + 1.2, d: 0.86, color: '#4f86ff' });
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

const hover3d = (ids: string[]) => ({
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    useStage.getState().setHover(ids);
  },
  onPointerOut: () => useStage.getState().setHover(null),
});

function Jumper({ from, to, color, lit, ids }: { from: string; to: string; color: string; lit?: boolean; ids?: string[] }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(from);
    const [x2, z2] = hole(to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const h = Math.min(2.6, Math.max(0.8, 0.35 + 0.2 * dist));
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.4, z1], at(0.2, h * 0.92), at(0.5, h), at(0.8, h * 0.92), [x2, 0.4, z2], [x2, -0.3, z2]];
  }, [from, to]);
  return (
    <group {...(ids ? hover3d(ids) : {})}>
      <Tube pts={pts} color={color} r={0.13} lit={lit} />
    </group>
  );
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
function Clip({ at, color, lit, bad }: { at: V3; color: string; lit?: boolean; bad?: boolean }) {
  return (
    <group position={at}>
      <mesh rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.5, 1.1, 0.42]} />
        <meshStandardMaterial color={bad ? RED : color} roughness={0.45} emissive={bad ? RED : lit ? AMBER : '#000000'} emissiveIntensity={bad ? 0.8 : lit ? 0.6 : 0} />
      </mesh>
      <mesh position={[0.32, -0.55, 0]}>
        <boxGeometry args={[0.18, 0.3, 0.3]} />
        <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------- the resistor (4 or 5 bands) */

const BAND = { brown: '#7a4a1f', black: '#151515', red: '#d62f2f', green: '#2f9e44', blue: '#2456c9', gold: '#d4a72c' };

function Resistor({ p1, p2, r, lit, label }: { p1: [number, number]; p2: [number, number]; r: number; lit: boolean; label: string }) {
  const bands = r === R_ALT ? [BAND.brown, BAND.green, BAND.red, BAND.gold] : [BAND.brown, BAND.blue, BAND.black, BAND.brown, BAND.brown];
  const [x1, z1] = p1;
  const [x2, z2] = p2;
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ang = Math.atan2(-(z2 - z1), x2 - x1);
  const h = 1.25;
  const bodyLen = Math.min(2.4, len - 0.6);
  const ux = (x2 - x1) / len;
  const uz = (z2 - z1) / len;
  const e1: V3 = [mx - (ux * bodyLen) / 2, h, mz - (uz * bodyLen) / 2];
  const e2: V3 = [mx + (ux * bodyLen) / 2, h, mz + (uz * bodyLen) / 2];
  const n = bands.length;
  const bx = (i: number) => -bodyLen / 2 + 0.4 + i * (n === 5 ? 0.3 : 0.36) + (i === n - 1 ? 0.3 : 0);
  return (
    <group>
      <Lead pts={[[x1, -0.3, z1], [x1, h, z1], e1]} />
      <Lead pts={[[x2, -0.3, z2], [x2, h, z2], e2]} />
      <group position={[mx, h, mz]} rotation={[0, ang, 0]} {...hover3d(['bb_r'])}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.36, bodyLen - 0.72, 6, 16]} />
          <meshStandardMaterial color={r === R_ALT ? '#e6cc9a' : '#8fb7d9'} roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
        </mesh>
        {bands.map((c, i) => (
          <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[bx(i), 0, 0]}>
            <cylinderGeometry args={[0.375, 0.375, 0.14, 18]} />
            <meshStandardMaterial color={c} roughness={0.5} metalness={c === BAND.gold ? 0.5 : 0} />
          </mesh>
        ))}
      </group>
      {label && (
        <Html position={[mx, h + 1.2, mz]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`bb3d-tag w52-tag3 ${lit ? 'lit' : ''}`}>{label}</div>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------- function generator */

const GEN = { x: -43, z: -2, w: 11, h: 4.6, d: 8 };
const GEN_FRONT = GEN.z + GEN.d / 2;
const BNC_OUT: V3 = [GEN.x + 3.6, 0.4, GEN_FRONT + 0.4];
const KNOB: V3 = [GEN.x + 3.4, 2.4, GEN_FRONT + 0.35];

/** knob angle for a frequency: −135° … +135° over 100 Hz … 10 kHz (log) */
const knobAngle = (f: number) => (-0.75 + 1.5 * (Math.log(f / F_RANGE[0]) / Math.log(F_RANGE[1] / F_RANGE[0]))) * Math.PI;

function Knob({ f, onTurn, lit }: { f: number; onTurn: (f: number) => void; lit: boolean }) {
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const drag = useRef<{ x: number; y: number; f: number } | null>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      // 200 px of drag = one decade
      const dec = (e.clientX - d.x - (e.clientY - d.y)) / 200;
      const v = Math.min(F_RANGE[1], Math.max(F_RANGE[0], d.f * 10 ** dec));
      const p = 10 ** (Math.floor(Math.log10(v)) - 1);
      onTurn(Math.round(v / p) * p);
    };
    const up = () => {
      if (!drag.current) return;
      drag.current = null;
      if (controls) controls.enabled = true;
      document.body.style.cursor = '';
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [controls, onTurn]);
  const grab = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    drag.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, f };
    if (controls) controls.enabled = false;
    document.body.style.cursor = 'grabbing';
  };
  return (
    <group position={KNOB} rotation={[Math.PI / 2, 0, 0]}>
      <group rotation={[0, knobAngle(f), 0]}>
        <mesh
          onPointerDown={grab}
          onPointerOver={(e) => {
            e.stopPropagation();
            useStage.getState().setHover(['bb_knob']);
            document.body.style.cursor = 'grab';
          }}
          onPointerOut={() => {
            useStage.getState().setHover(null);
            if (!drag.current) document.body.style.cursor = '';
          }}
        >
          <cylinderGeometry args={[1.05, 1.15, 0.8, 28]} />
          <meshStandardMaterial color={lit ? '#fde68a' : '#2b2f36'} roughness={0.5} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
        </mesh>
        <mesh position={[0, 0.42, -0.7]}>
          <boxGeometry args={[0.2, 0.06, 0.8]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>
    </group>
  );
}

function Generator({ f, lit, knobLit, onTurn }: { f: number; lit: boolean; knobLit: boolean; onTurn: (f: number) => void }) {
  const red = useMemo<V3[]>(() => {
    const [x, z] = hole('e10');
    return [BNC_OUT, [BNC_OUT[0] + 2, 1.6, BNC_OUT[2] + 1.5], [-31, 2.6, 0.5], [x - 1.2, 2.4, z + 0.4], [x, 2.0, z]];
  }, []);
  const black = useMemo<V3[]>(() => {
    const [x, z] = hole('G4');
    return [BNC_OUT, [BNC_OUT[0] + 1.6, 1.2, BNC_OUT[2] + 1.2], [-33, 1.8, -4], [x - 0.6, 2.0, z + 0.3], [x, 1.7, z]];
  }, []);
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
          <mesh key={dx} position={[GEN.x + dx + 5.4, 0.2, GEN_FRONT + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.5, 20]} />
            <meshStandardMaterial color="#9aa1ab" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {/* OUTPUT BNC */}
        <mesh position={[BNC_OUT[0], BNC_OUT[1], GEN_FRONT + 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.5, 16]} />
          <meshStandardMaterial color="#c8ccd2" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[BNC_OUT[0] - 1.4, BNC_OUT[1], GEN_FRONT + 0.06]}>
          <planeGeometry args={[1.0, 0.45]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>
      <Knob f={f} onTurn={onTurn} lit={knobLit} />
      <Tube pts={red} color="#d62f2f" r={0.14} lit={lit} />
      <Tube pts={black} color="#24262b" r={0.14} lit={lit} />
      <Stub at="e10" color="#d62f2f" />
      <Stub at="G4" color="#24262b" />
      <Clip at={[colX(10) + 0.15, 1.5, ROW_Z.e]} color="#d62f2f" lit={lit} />
      <Clip at={[colX(4) + 0.15, 1.5, RAIL_Z.tn]} color="#24262b" lit={lit} />
      <Html position={[GEN.x - 1.6, GEN.h - 1.7, GEN_FRONT + 0.05]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w52-gen-lcd">
          <b>SINE {hz(f)}</b>
          <span>10.0 Vpp · DC 0 V</span>
          <span>50 Ω · OUTPUT ON</span>
        </div>
      </Html>
      <Html position={[GEN.x, GEN.h + 0.8, GEN.z - GEN.d / 2]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w52-tag3 gen ${lit ? 'lit' : ''}`}>{BENCH_NAMES.generator}</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- oscilloscope */

const SCOPE = { x: -12, z: -20, w: 24, h: 13.5, d: 7 };
const S_FRONT = SCOPE.z + SCOPE.d / 2;
const SCREEN = { x: SCOPE.x - 3.2, y: 6.3, w: 14.5, h: 9.2 };
const JACK: Record<'ch1' | 'ch2', V3> = { ch1: [SCOPE.x + 6.6, 0.6, S_FRONT + 0.3], ch2: [SCOPE.x + 9.2, 0.6, S_FRONT + 0.3] };

interface Screen {
  ch1: V3[];
  ch2: V3[];
  math: V3[] | null;
  curA: number;
  curB: number;
}

function screenOf(b: BenchModel, f: number, math: boolean): Screen {
  const tdiv = timeDiv(f);
  const span = 8 * tdiv;
  const w = 2 * Math.PI * f;
  const sx = (t: number) => SCREEN.x - SCREEN.w / 2 + (t / span) * SCREEN.w;
  // 2.5 V/div, 6 divisions, 0 V in the middle
  const sy = (v: number) => SCREEN.y + (Math.max(-7.4, Math.min(7.4, v)) / 15) * SCREEN.h;
  const z = S_FRONT + 0.05;
  const a1 = abs(b.ch1);
  const a2 = abs(b.ch2);
  const d2 = b.fault ? 0 : (phaseOf(b.ch2, b.ch1) * Math.PI) / 180;
  const dm = (phaseOf(b.math, b.ch1) * Math.PI) / 180;
  const am = abs(b.math);
  const trace = (fn: (t: number) => number): V3[] =>
    Array.from({ length: 241 }, (_, k) => {
      const t = (k / 240) * span;
      return [sx(t), sy(fn(t)), z] as V3;
    });
  const T = 1 / f;
  return {
    ch1: trace((t) => a1 * Math.sin(w * t)),
    ch2: trace((t) => a2 * Math.sin(w * t + d2)),
    math: math ? trace((t) => am * Math.sin(w * t + dm)) : null,
    curA: sx(T / 4),
    curB: sx(T / 4 - (d2 / (2 * Math.PI)) * T),
  };
}

function ScopeScreen({ s }: { s: Screen }) {
  const z = S_FRONT + 0.04;
  const grid: V3[][] = [];
  for (let k = 0; k <= 8; k++) {
    const x = SCREEN.x - SCREEN.w / 2 + (k * SCREEN.w) / 8;
    grid.push([
      [x, SCREEN.y - SCREEN.h / 2, z],
      [x, SCREEN.y + SCREEN.h / 2, z],
    ]);
  }
  for (let k = 0; k <= 6; k++) {
    const y = SCREEN.y - SCREEN.h / 2 + (k * SCREEN.h) / 6;
    grid.push([
      [SCREEN.x - SCREEN.w / 2, y, z],
      [SCREEN.x + SCREEN.w / 2, y, z],
    ]);
  }
  const cur = (x: number): V3[] => [
    [x, SCREEN.y - SCREEN.h / 2, z + 0.01],
    [x, SCREEN.y + SCREEN.h / 2, z + 0.01],
  ];
  return (
    <group>
      <mesh position={[SCREEN.x, SCREEN.y, S_FRONT + 0.02]}>
        <planeGeometry args={[SCREEN.w + 0.4, SCREEN.h + 0.4]} />
        <meshBasicMaterial color="#0b1a14" />
      </mesh>
      {grid.map((g, i) => (
        <Line key={i} points={g} color={i === 4 || i === 12 ? '#5f7f70' : '#264136'} lineWidth={i === 4 || i === 12 ? 1.2 : 0.8} />
      ))}
      <Line points={cur(s.curA)} color="#fde047" lineWidth={1} dashed dashSize={0.25} gapSize={0.2} />
      <Line points={cur(s.curB)} color="#7dd3fc" lineWidth={1} dashed dashSize={0.25} gapSize={0.2} />
      <Line points={s.ch1} color="#facc15" lineWidth={2.2} />
      {s.math && <Line points={s.math} color="#e879f9" lineWidth={2} />}
      <Line points={s.ch2} color="#38bdf8" lineWidth={2.6} />
    </group>
  );
}

function Oscilloscope({ b, f, math, lit }: { b: BenchModel; f: number; math: boolean; lit: boolean }) {
  const s = useMemo(() => screenOf(b, f, math), [b, f, math]);
  const ph = phaseOf(b.ch2, b.ch1);
  const dt = (-ph / 360) * (1 / f);
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
            <meshStandardMaterial color={k === 'ch1' ? '#eab308' : '#0ea5e9'} metalness={0.5} roughness={0.3} />
          </mesh>
        ))}
        <ScopeScreen s={s} />
      </group>
      <Html position={[SCREEN.x, SCREEN.y + SCREEN.h / 2 - 0.5, S_FRONT + 0.1]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w52-scope-osd">
          <span className="c1 div">CH1 2.5 V/div</span>
          <span className="c2 div">CH2 2.5 V/div</span>
          <span className="div">{sec(timeDiv(f))}/div</span>
        </div>
      </Html>
      <Html position={[SCREEN.x, SCREEN.y - SCREEN.h / 2 + 0.5, S_FRONT + 0.1]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w52-scope-osd">
          {b.fault ? (
            <span className="bad">CH2 = 0 V · 地线短路！</span>
          ) : (
            <>
              <span className="c2">
                Δt {num(dt * 1e6, 1)} µs · Δφ {deg(ph, 1)}
              </span>
              <span className="c2 div">CH2/CH1 {num(abs(b.ch2) / abs(b.ch1), 3)}</span>
            </>
          )}
        </div>
      </Html>
      <Html position={[SCOPE.x, SCOPE.h + 0.6, SCOPE.z - SCOPE.d / 2]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w52-tag3 scope ${lit ? 'lit' : ''}`}>{BENCH_NAMES.scope}</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- probes */

function Probe({ ch, tipHole, clip, lit, clipLit, bad }: { ch: 'ch1' | 'ch2'; tipHole: string; clip: V3; lit: boolean; clipLit: boolean; bad: boolean }) {
  const [x, z] = hole(tipHole);
  const color = ch === 'ch1' ? '#eab308' : '#0ea5e9';
  const cable = useMemo<V3[]>(() => {
    const j = JACK[ch];
    return [
      [x, 3.4, z],
      [x, 6.2, z - 1.2],
      [(x + j[0]) / 2, 6.5, (z + j[2]) / 2],
      [j[0], 2.6, j[2] + 2.6],
      [j[0], j[1], j[2] + 0.4],
    ];
  }, [ch, x, z]);
  const gnd = useMemo<V3[]>(
    () => [
      [x, 2.0, z + 0.2],
      [(x + clip[0]) / 2, Math.max(clip[1], 1.2) + 1.4, (z + clip[2]) / 2],
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
      <group {...hover3d([`${ch}_clip`])}>
        <Tube pts={gnd} color="#24262b" r={0.06} lit={clipLit} />
        <Clip at={clip} color="#24262b" lit={clipLit} bad={bad} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- camera */

const FRAMES: Record<Cam, { x: [number, number]; y: [number, number]; z: [number, number]; dir: [number, number, number] }> = {
  bench: { x: [-49, -1], y: [-1, 12.5], z: [-24, 4], dir: [0, 1.3, 1] },
  board: { x: [-27, -13], y: [0, 3], z: [-9.5, 0], dir: [0, 2.4, 1] },
  scope: { x: [-24.5, 0.5], y: [0, 12.8], z: [-17, -16.5], dir: [0, 0.42, 1] },
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

function Scene({ lab, b, frame, nonce }: { lab: Lab; b: BenchModel; frame: Cam; nonce: number }) {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const is = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const L = useMemo(() => layoutOf(lab.ch2 === 'swap'), [lab.ch2]);
  const pick = useMemo(() => picker(L), [L]);
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
  const close = frame === 'board';
  const rTag = close ? (lab.r === R_ALT ? '1.5 kΩ ±5%（棕绿红金）' : '1.6 kΩ ±1%（棕蓝黑棕棕）') : '';
  const cTag = close ? '100 nF 陶瓷（104）' : '';
  const set = lab.set;
  const turn = useCallback((f: number) => set({ freq: f }), [set]);
  const out = L.out;
  const clipOut: V3 = [colX(out) + 0.55, 1.6, ROW_Z.b];
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Shell xray={0} />
      <Glow lit={lit} L={L} fault={b.fault} />
      <Html position={[colX(30), 0.3, RAIL_Z.tn]} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`w52-rtag ${is('rail_gnd') ? 'lit' : ''}`}>GND 轨</div>
      </Html>
      {close && (
        <>
          <Html position={[colX(10), 0.3, ROW_Z.e + 1.3]} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
            <div className={`w52-rtag node ${is('node_in') ? 'lit' : ''}`}>IN</div>
          </Html>
          <Html position={[colX(out), 0.3, ROW_Z.e + 1.3]} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
            <div className={`w52-rtag node ${is('node_out') ? 'lit' : ''} ${b.fault ? 'bad' : ''}`}>OUT</div>
          </Html>
        </>
      )}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <Generator f={lab.freq} lit={is('bb_gen')} knobLit={is('bb_knob')} onTurn={turn} />
      {L.swap ? (
        <>
          <Capacitor p1={[colX(10), ROW_Z.d]} p2={[colX(11), ROW_Z.d]} kind="ceramic" id="bb_c" label={cTag} />
          <Resistor p1={[colX(11), ROW_Z.c]} p2={[colX(15), ROW_Z.c]} r={lab.r} lit={is('bb_r')} label={rTag} />
        </>
      ) : (
        <>
          <Resistor p1={[colX(10), ROW_Z.d]} p2={[colX(14), ROW_Z.d]} r={lab.r} lit={is('bb_r')} label={rTag} />
          <Capacitor p1={[colX(14), ROW_Z.c]} p2={[colX(15), ROW_Z.c]} kind="ceramic" id="bb_c" label={cTag} />
        </>
      )}
      <Jumper from="b15" to="G15" color="#24262b" lit={is('bb_jumper')} ids={['bb_jumper']} />
      <Stub at="G6" color="#24262b" />
      {lab.clip === 'gnd' && <Stub at="G21" color="#24262b" />}
      <Probe ch="ch1" tipHole="a10" clip={[colX(6) + 0.15, 1.5, RAIL_Z.tn]} lit={is('ch1_probe', 'node_in')} clipLit={is('ch1_clip', 'rail_gnd')} bad={false} />
      <Probe
        ch="ch2"
        tipHole={`a${out}`}
        clip={lab.clip === 'out' ? clipOut : [colX(21) + 0.15, 1.5, RAIL_Z.tn]}
        lit={is('ch2_probe', 'node_out')}
        clipLit={is('ch2_clip')}
        bad={b.fault}
      />
      <Oscilloscope b={b} f={lab.freq} math={lab.ch2 === 'math'} lit={is('bb_scope')} />
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
  const b = useMemo(() => bench(lab.freq, lab.r, lab.ch2, lab.clip), [lab.freq, lab.r, lab.ch2, lab.clip]);
  const ph = phaseOf(b.ch2, b.ch1);
  const ratio = abs(b.ch2) / abs(b.ch1);
  const iRms = abs(b.i) / Math.SQRT2;
  return (
    <div className="w52-layer">
      <div className="w52-dock wide">
        <FreqSlider lab={lab} ids={['bb_knob', 'sc_freq']} />
        <RSeg lab={lab} />
        <Ch2Seg lab={lab} />
      </div>
      <div className="bb3d-wrap w52-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-24, 44, 30], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <Scene lab={lab} b={b} frame={frame} nonce={nonce} />
        </Canvas>
        <div className="w52-clipsel">
          <Seg<ClipAt>
            label="CH2 地夹"
            value={lab.clip}
            onChange={(c) => lab.set({ clip2: c })}
            options={[
              { value: 'gnd', label: 'CH2 地夹 → GND 轨', short: '地夹 GND', hover: ['ch2_clip', 'rail_gnd'] },
              { value: 'out', label: '→ R–C 节点（误接）', short: '误接 OUT', hover: ['ch2_clip', 'node_out'] },
            ]}
          />
        </div>
        <div className="w52-camsel">
          <Seg<Cam>
            label="镜头"
            value={frame}
            onChange={setFrame}
            options={[
              { value: 'bench', label: '全景', short: '全景' },
              { value: 'board', label: '电路特写', short: '电路' },
              { value: 'scope', label: '示波器屏幕', short: '屏幕' },
            ]}
          />
          <button className="w52-fold" onClick={() => setNonce(nonce + 1)} title="复位镜头">
            复位
          </button>
        </div>
        {b.fault && (
          <div className="w52-alarm" role="alert" {...hoverProps(['ch2_clip'])}>
            <b>红灯告警：CH2 地夹把 {lab.ch2 === 'swap' ? '电阻 R' : '电容 C'} 短路了</b>
            <span>
              示波器 CH1、CH2 的黑色地夹在机箱内经 BNC 外壳连向市电保护地 PE，信号发生器的地也连着 PE——地夹夹在 R–C 节点 OUT，等于用一根导线把 OUT 拉到 GND：CH2 读到 0
              V，相移消失。
            </span>
            <button className="w52-fold" onClick={() => lab.set({ clip2: 'gnd' })}>
              地夹改回 GND 轨
            </button>
          </div>
        )}
      </div>
      <div className="w52-cells">
        <Cell id="bb_knob" name="信号源 f" value={hz(lab.freq)} hint={`T = ${sec(1 / lab.freq)}`} />
        <Cell id="bb_c" name="容抗 X_C" value={ohm(b.xc)} hint={`R = ${ohm(b.r)}`} />
        <Cell id="ch2_probe" name="CH2 / CH1" value={b.fault ? '0（短路）' : num(ratio, 4)} tone={b.fault ? 'bad' : ''} hint={`CH1 ${num(abs(b.ch1), 2)} V 峰值`} />
        <Cell
          id="c_phase"
          name="实测 Δφ"
          value={b.fault ? '—' : deg(ph)}
          tone={b.fault ? 'bad' : ph < 0 ? 'warn' : 'good'}
          hint={b.fault ? '' : `Δt = ${num((-ph / 360 / lab.freq) * 1e6, 1)} µs`}
        />
        <Cell id="bench_i" name="电流 I_rms" value={`${num(iRms * 1e3, 2)} mA`} tone="minor" hint={`峰值 ${num(abs(b.i) * 1e3, 2)} mA`} />
        <Cell id="bench_p" name="电阻功耗" value={`${num(b.pR * 1e3, 2)} mW`} tone="minor" hint={`额定 ${P_RATED * 1e3} mW · 裕度 ${Math.round(P_RATED / b.pR)}×`} />
      </div>
      <p className={`w52-notice w52-bench-notice ${on('safety_note')}`} {...hoverProps(['safety_note'])} role="note">
        <span className="full">
          激励：{GEN_NAME}，无需直流电源 · 内阻 {R_GEN} Ω 让 CH1 略低于 5 V，但 CH2 相对 CH1 的相移与比值不受影响 · 三根地线（信号源黑夹、CH1、CH2 地夹）只夹 GND 轨
        </span>
        <span className="short">函数信号发生器 10 Vpp · 三地合一夹 GND 轨</span>
      </p>
    </div>
  );
}
