// Layer "03 3D 面包板拧电位器实时观察欠阻尼振荡消失": the source-free series RLC on an 830-hole
// board, charged by a 台式可调直流电源（5 V） standing on the bench (wired to the top rails by its
// own leads: + → top outer rail, COM → top inner rail = GND) through an SPDT slide switch, and read
// on a bench oscilloscope built here (its screen is a canvas texture: 2 V/div, 200 µs/div, falling
// edge trigger at +4.5 V, single shot).
//
// Layout (upper half, rows a–e; column numbers):
// - SPDT slide switch, pins e10 (throw A → +5 V rail by the red jumper a10), e11 (common), e12
//   (throw B → GND rail by the black jumper a12). "充电" joins 11–10, "放电" joins 11–12.
// - Common → potentiometer end pin: orange jumper b11 → b16. Pot (0–1 kΩ, linear) pins e16 (end),
//   e17 (wiper), e18 (unused); the knob turns 0°–270° = 0–1 kΩ (drag it, or the slider below).
// - Wiper → inductor: jumper b17 → b21. 10 mH drum inductor c21–c23 (winding R_L ≈ 10 Ω).
// - 1 µF film capacitor e23–e26; column 26 → GND rail by the black jumper a26.
// - Scope probe CH1: tip hooked at a23 (the L–C node, v_C), ground clip at c26 (the capacitor's
//   lower plate, GND).
// The loop's total resistance is R = R_pot + R_L; critical damping at R = 2√(L/C) = 200 Ω, i.e. at
// R_pot = 190 Ω on this pot.

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, D, RAIL_Z, ROW_Z, Shell, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { BENCH_NAMES, Capacitor, Inductor } from '../../Passives3D';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { BENCH_V, fmtHz, fmtR, fmtRate, fmtV, minimum, POT_MAX, PRESETS, R_L, REGIME_LABEL, sig, snapR, solve, zeros, type Sol } from './model';
import { Cell, hoverProps, presetParams, RSlider, Seg, useClearHoverOnUnmount, useIsLit, useLab, type Lab } from './state';

type V3 = [number, number, number];
type Cam = 'bench' | 'pot' | 'scope';
type Sw = 'charge' | 'release';

export const SUPPLY_NAME = `${BENCH_NAMES.supply}（5 V）`;
const SCOPE_NAME = BENCH_NAMES.scope;

const AMBER = '#f59e0b';
const SW_C = 10;
const POT_C = 16;
const L_C = 21;
const C_C = 23;
const GND_C = 26;

/* ------------------------------------------------------------- holes, rails and picking */

const RAIL_OF: Partial<Record<Rail, string>> = { tp: 'rail_p5', tn: 'rail_gnd' };
const RAIL_COLOR: Record<string, string> = { rail_p5: '#e11d48', rail_gnd: '#2b59c3' };

/** Board coordinates of a hole: "g15", "T+23" (top outer rail = +5 V), "T-15" (top inner = GND). */
function hole(h: string): [number, number] {
  const m = /^([TB])([+-])(\d+)$/.exec(h);
  if (m) {
    const r: Rail = m[1] === 'T' ? (m[2] === '+' ? 'tp' : 'tn') : m[2] === '+' ? 'bp' : 'bn';
    return [colX(Number(m[3])), RAIL_Z[r]];
  }
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

/** what an upper strip is in the circuit */
function stripMeaning(c: number): string | null {
  if (c === SW_C) return 'bb_spdt';
  if (c === SW_C + 1 || c === POT_C) return 'nd_com';
  if (c === SW_C + 2 || c === GND_C) return 'rail_gnd';
  if (c === POT_C + 1 || c === L_C) return 'nd_wiper';
  if (c === POT_C + 2) return 'bb_pot';
  if (c === C_C) return 'nd_vc';
  return null;
}

function pick(x: number, z: number): string[] | null {
  const c = Math.round(x + 32);
  if (Math.abs(z) < 0.95) return ['center_trench'];
  for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 2 && c <= 62) return RAIL_OF[r] ? [RAIL_OF[r]] : null;
  if (c < 1 || c > 63) return null;
  const half = z <= -1 && z >= -6 ? 'u' : z >= 1 && z <= 6 ? 'l' : null;
  if (!half) return null;
  const meaning = half === 'u' ? stripMeaning(c) : null;
  return meaning ? [stripId(half, c), meaning] : [stripId(half, c)];
}

/** strips and rails to tint for the lit ids */
function glowOf(lit: string[]): string[] {
  const g = new Set(lit.filter((id) => /^strip_|^rail_/.test(id)));
  const add = (...ids: string[]) => ids.forEach((s) => g.add(s));
  for (const id of lit) {
    if (id === 'nd_com') add(stripId('u', SW_C + 1), stripId('u', POT_C));
    if (id === 'nd_wiper') add(stripId('u', POT_C + 1), stripId('u', L_C));
    if (id === 'nd_vc' || id === 'bb_probe') add(stripId('u', C_C));
    if (id === 'rail_gnd' || id === 'bb_gnd_clip') add('rail_gnd', stripId('u', SW_C + 2), stripId('u', GND_C));
    if (id === 'rail_p5') add(stripId('u', SW_C));
    if (id === 'bb_psu') add('rail_p5', 'rail_gnd');
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

function RailTags({ lit }: { lit: string[] }) {
  const tags: { id: string; text: string; col: number; r: Rail }[] = [
    { id: 'rail_p5', text: '+5 V', col: 31, r: 'tp' },
    { id: 'rail_gnd', text: 'GND', col: 31, r: 'tn' },
  ];
  return (
    <>
      {tags.map((t) => (
        <Html key={t.id} position={[colX(t.col), 0.3, RAIL_Z[t.r]]} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`w47-rtag ${t.id} ${lit.includes(t.id) ? 'lit' : ''}`}>{t.text}</div>
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
    return new THREE.TubeGeometry(curve, 64, r, 8, false);
  }, [pts, r]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.5} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.7 : 0} />
    </mesh>
  );
}

const WIRE = { red: '#d62f2f', black: '#24262b', orange: '#f08a1c', yellow: '#eab308', green: '#16a34a' };

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

function Tag({ at, y = 2.2, text, cls = '', lit }: { at: [number, number]; y?: number; text: string; cls?: string; lit?: boolean }) {
  return (
    <Html position={[at[0], y, at[1]]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`bb3d-tag w47-tag3 ${cls} ${lit ? 'lit' : ''}`}>{text}</div>
    </Html>
  );
}

/* ------------------------------------------------------------- the SPDT slide switch */

function Spdt({ sw, onFlip, lit }: { sw: Sw; onFlip: () => void; lit: boolean }) {
  const x0 = colX(SW_C);
  const z = ROW_Z.e;
  const knobX = x0 + (sw === 'charge' ? 0.55 : 1.45);
  const ev = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onFlip();
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      useStage.getState().setHover(['bb_spdt']);
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      useStage.getState().setHover(null);
      document.body.style.cursor = '';
    },
  };
  return (
    <group name="mesh_spdt">
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[x0 + k, 0.15, z]}>
          <boxGeometry args={[0.16, 0.9, 0.3]} />
          <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[x0 + 1, 0.75, z - 0.35]} {...ev}>
        <boxGeometry args={[3.2, 1.2, 1.5]} />
        <meshStandardMaterial color="#3b4250" roughness={0.45} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
      </mesh>
      <mesh position={[x0 + 1, 1.37, z - 0.35]}>
        <boxGeometry args={[2.2, 0.06, 0.5]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[knobX, 1.65, z - 0.35]} {...ev}>
        <boxGeometry args={[0.7, 0.6, 0.6]} />
        <meshStandardMaterial color={lit ? '#fde68a' : '#f8fafc'} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.45 : 0} />
      </mesh>
      {/* a larger invisible grip */}
      <mesh position={[x0 + 1, 1.4, z - 0.35]} visible={false} {...ev}>
        <boxGeometry args={[3.6, 1.6, 2.2]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------- the potentiometer */

/** 0–1 kΩ single-turn pot: square body over rows c–e, pins e16–e18, knob turns 270°. */
function Pot({ rPot, onTurn, lit, enabled }: { rPot: number; onTurn: (r: number) => void; lit: boolean; enabled: boolean }) {
  const x = colX(POT_C + 1);
  const z = ROW_Z.e - 1.1;
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const drag = useRef<{ x: number; y: number; r: number } | null>(null);
  const ang = (rPot / POT_MAX) * ((3 * Math.PI) / 2) - (3 * Math.PI) / 4;
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const delta = (e.clientX - d.x - (e.clientY - d.y)) * 2.2;
      onTurn(Math.min(POT_MAX, Math.max(0, d.r + delta)));
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
    if (!enabled) return;
    e.stopPropagation();
    drag.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, r: rPot };
    if (controls) controls.enabled = false;
    document.body.style.cursor = 'grabbing';
  };
  return (
    <group name="mesh_pot">
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[colX(POT_C + k), 0.15, ROW_Z.e]}>
          <boxGeometry args={[0.18, 0.9, 0.14]} />
          <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <group {...hover3d(['bb_pot'])}>
        <mesh position={[x, 0.95, z]}>
          <boxGeometry args={[3.2, 1.5, 3.0]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.5} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.3 : 0} />
        </mesh>
        <mesh position={[x, 1.85, z]}>
          <cylinderGeometry args={[0.55, 0.55, 0.4, 20]} />
          <meshStandardMaterial color="#c3c8ce" metalness={0.7} roughness={0.35} />
        </mesh>
      </group>
      {/* the knob: drag to turn */}
      <group position={[x, 2.6, z]} rotation={[0, -ang, 0]}>
        <mesh
          onPointerDown={grab}
          onPointerOver={(e) => {
            e.stopPropagation();
            useStage.getState().setHover(['bb_pot']);
            if (enabled) document.body.style.cursor = 'grab';
          }}
          onPointerOut={() => {
            useStage.getState().setHover(null);
            if (!drag.current) document.body.style.cursor = '';
          }}
        >
          <cylinderGeometry args={[1.25, 1.35, 1.2, 28]} />
          <meshStandardMaterial color={lit ? '#fde68a' : '#2b2f36'} roughness={0.5} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
        </mesh>
        <mesh position={[0, 0.62, -0.75]}>
          <boxGeometry args={[0.22, 0.06, 1.0]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>
      {/* the 270° scale */}
      <Html position={[x, 3.4, z - 2.0]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`w47-potdial ${lit ? 'lit' : ''}`}>
          R_pot <b>{fmtR(rPot)}</b>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- the bench supply */

const PSU = { x: -42.5, z: -4, w: 8, h: 4.6, d: 9 };
const POSTS: { key: string; color: string; z: number; to: string }[] = [
  { key: 'p5', color: '#d62f2f', z: -2.2, to: 'T+3' },
  { key: 'com', color: '#1a1c20', z: 0.6, to: 'T-4' },
];

function BenchSupply({ lit }: { lit: boolean }) {
  const right = PSU.x + PSU.w / 2;
  const leads = useMemo(
    () =>
      POSTS.map((p) => {
        const [x, z] = hole(p.to);
        const pts: V3[] = [
          [right + 0.3, 1.2, PSU.z + p.z],
          [right + 1.6, 1.6, PSU.z + p.z - 1.5],
          [x - 1.0, 1.3, z],
          [x, 0.5, z],
          [x, -0.3, z],
        ];
        return { ...p, pts };
      }),
    [right],
  );
  return (
    <group name="mesh_bench_psu">
      <group {...hover3d(['bb_psu'])}>
        <mesh position={[PSU.x, PSU.h / 2 - 1, PSU.z]}>
          <boxGeometry args={[PSU.w, PSU.h, PSU.d]} />
          <meshStandardMaterial color="#d9dde3" roughness={0.55} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.3 : 0} />
        </mesh>
        <mesh position={[PSU.x, PSU.h / 2 - 1, PSU.z + PSU.d / 2 + 0.01]}>
          <planeGeometry args={[PSU.w - 0.6, PSU.h - 0.5]} />
          <meshStandardMaterial color="#3b4250" roughness={0.7} />
        </mesh>
        {[-2, 2].map((dx) => (
          <mesh key={dx} position={[PSU.x + dx, -0.1, PSU.z + PSU.d / 2 + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.62, 0.62, 0.6, 20]} />
            <meshStandardMaterial color="#9aa1ab" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {POSTS.map((p) => (
          <mesh key={p.key} position={[right + 0.15, 1.2, PSU.z + p.z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.42, 0.42, 0.5, 14]} />
            <meshStandardMaterial color={p.color} />
          </mesh>
        ))}
      </group>
      {leads.map((l) => (
        <Tube key={l.key} pts={l.pts} color={l.color === '#1a1c20' ? WIRE.black : l.color} r={0.14} lit={lit} />
      ))}
      <Html position={[PSU.x, PSU.h / 2 + 0.2, PSU.z + PSU.d / 2 + 0.05]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w47-psu-lcd">
          <b>{BENCH_V.toFixed(2)} V</b>
          <span>限流 0.30 A</span>
        </div>
      </Html>
      <Html position={[PSU.x, PSU.h + 1.2, PSU.z - PSU.d / 2]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w47-tag3 psu ${lit ? 'lit' : ''}`}>{SUPPLY_NAME}</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- the oscilloscope */

const SCOPE = { x: -14, z: -19.5, w: 19, h: 12, d: 7, tilt: 0.32 };
const SCR = { w: 12.4, h: 8.2, x: -2.6 };
const DIV_T = 200e-6;
const DIV_V = 2;
const PRE = 1; // divisions before the trigger
const ZERO_DIV = 3; // 0 V sits 3 divisions above the bottom
const TRIG = 4.5;

/** a point on the scope's front face (local x right, y up from the box centre) in world space */
function scopeFront(x: number, y: number, out = 0.02): V3 {
  const cs = Math.cos(SCOPE.tilt);
  const sn = Math.sin(SCOPE.tilt);
  const zf = SCOPE.d / 2 + out;
  // rotation about x by −tilt (the face leans back)
  return [SCOPE.x + x, SCOPE.h / 2 - 1 + y * cs + zf * sn, SCOPE.z - y * sn + zf * cs];
}

function drawScreen(g: CanvasRenderingContext2D, s: Sol, sw: Sw, progress: number) {
  const Wc = g.canvas.width;
  const Hc = g.canvas.height;
  const dx = Wc / 10;
  const dy = Hc / 8;
  g.fillStyle = '#06130f';
  g.fillRect(0, 0, Wc, Hc);
  g.strokeStyle = 'rgba(148, 197, 170, 0.22)';
  g.lineWidth = 1;
  for (let k = 1; k < 10; k++) {
    g.beginPath();
    g.moveTo(k * dx, 0);
    g.lineTo(k * dx, Hc);
    g.stroke();
  }
  for (let k = 1; k < 8; k++) {
    g.beginPath();
    g.moveTo(0, k * dy);
    g.lineTo(Wc, k * dy);
    g.stroke();
  }
  g.strokeStyle = 'rgba(148, 197, 170, 0.5)';
  g.beginPath();
  g.moveTo(Wc / 2, 0);
  g.lineTo(Wc / 2, Hc);
  g.moveTo(0, Hc / 2);
  g.lineTo(Wc, Hc / 2);
  g.stroke();
  const Y = (v: number) => Hc - (ZERO_DIV + v / DIV_V) * dy;
  const X = (t: number) => (PRE + t / DIV_T) * dx;
  // ground marker and trigger level
  g.fillStyle = '#facc15';
  g.beginPath();
  g.moveTo(0, Y(0) - 9);
  g.lineTo(14, Y(0));
  g.lineTo(0, Y(0) + 9);
  g.fill();
  g.fillStyle = '#fb923c';
  g.beginPath();
  g.moveTo(Wc, Y(TRIG) - 8);
  g.lineTo(Wc - 13, Y(TRIG));
  g.lineTo(Wc, Y(TRIG) + 8);
  g.fill();
  g.beginPath();
  g.moveTo(X(0) - 8, 0);
  g.lineTo(X(0), 12);
  g.lineTo(X(0) + 8, 0);
  g.fill();
  // the trace
  g.strokeStyle = '#facc15';
  g.lineWidth = 3;
  g.shadowColor = '#facc15';
  g.shadowBlur = 6;
  g.beginPath();
  if (sw === 'charge') {
    g.moveTo(0, Y(BENCH_V));
    g.lineTo(Wc, Y(BENCH_V));
  } else {
    const tEnd = (10 - PRE) * DIV_T * progress;
    const n = 500;
    g.moveTo(0, Y(BENCH_V));
    g.lineTo(X(0), Y(BENCH_V));
    for (let k = 1; k <= n; k++) {
      const t = (k / n) * tEnd;
      g.lineTo(X(t), Y(s.v(t)));
    }
  }
  g.stroke();
  g.shadowBlur = 0;
  // labels
  g.font = '700 22px ui-monospace, monospace';
  g.fillStyle = '#facc15';
  g.fillText('CH1 2.00V/div', 10, 26);
  g.fillStyle = '#e2e8f0';
  g.textAlign = 'right';
  g.fillText('200µs/div', Wc - 10, 26);
  g.fillStyle = '#fb923c';
  g.fillText('Trig ↓ +4.50V', Wc - 10, Hc - 12);
  g.textAlign = 'left';
  g.fillStyle = sw === 'charge' ? '#fb923c' : progress < 1 ? '#86efac' : '#f87171';
  g.fillText(sw === 'charge' ? 'WAIT 单次触发待命' : progress < 1 ? 'TRIG’D' : 'STOP', 10, Hc - 12);
  if (sw === 'release' && progress >= 1) {
    g.fillStyle = '#e2e8f0';
    g.font = '700 19px ui-monospace, monospace';
    const m = minimum(s, (10 - PRE) * DIV_T);
    const lines = [`Min ${m.v.toFixed(2)}V`, s.regime === 'under' ? `Freq ${(s.wd / (2 * Math.PI) / 1000).toFixed(2)}kHz` : REGIME_LABEL[s.regime]];
    lines.forEach((t, k) => g.fillText(t, Wc - 196, 58 + k * 24));
  }
}

function Scope({ s, sw, shot, lit }: { s: Sol; sw: Sw; shot: number; lit: string[] }) {
  const invalidate = useThree((st) => st.invalidate);
  const { canvas, tex } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 640;
    c.height = 420;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return { canvas: c, tex: t };
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  const prog = useRef(1);
  const redraw = () => {
    const g = canvas.getContext('2d');
    if (!g) return;
    drawScreen(g, s, sw, prog.current);
    tex.needsUpdate = true;
    invalidate();
  };
  // a new release sweeps the trace across the screen
  useEffect(() => {
    prog.current = prefersReducedMotion() ? 1 : 0;
  }, [shot]);
  useEffect(redraw);
  useFrame((_, dt) => {
    if (sw !== 'release' || prog.current >= 1) return;
    prog.current = Math.min(1, prog.current + dt / 0.7);
    redraw();
  });
  const on = lit.includes('bb_scope');
  const probeLit = lit.includes('bb_probe') || lit.includes('nd_vc');
  const bnc = scopeFront(6.6, -4.2, 0.4);
  return (
    <group name="mesh_scope">
      <group position={[SCOPE.x, SCOPE.h / 2 - 1, SCOPE.z]} rotation={[-SCOPE.tilt, 0, 0]} {...hover3d(['bb_scope'])}>
        <mesh>
          <boxGeometry args={[SCOPE.w, SCOPE.h, SCOPE.d]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.55} emissive={on ? AMBER : '#000000'} emissiveIntensity={on ? 0.25 : 0} />
        </mesh>
        <mesh position={[SCR.x, 0.6, SCOPE.d / 2 + 0.01]}>
          <planeGeometry args={[SCR.w + 0.8, SCR.h + 0.8]} />
          <meshStandardMaterial color="#1f2937" roughness={0.6} />
        </mesh>
        <mesh position={[SCR.x, 0.6, SCOPE.d / 2 + 0.03]}>
          <planeGeometry args={[SCR.w, SCR.h]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        {/* knobs and the CH1 BNC socket */}
        {[
          [5.6, 3.2],
          [7.6, 3.2],
          [5.6, 0.8],
          [7.6, 0.8],
          [6.6, -1.6],
        ].map(([kx, ky]) => (
          <mesh key={`${kx}${ky}`} position={[kx, ky, SCOPE.d / 2 + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.6, 20]} />
            <meshStandardMaterial color="#4b5563" roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[6.6, -4.2, SCOPE.d / 2 + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.5, 16]} />
          <meshStandardMaterial color="#c9a227" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      <Html position={scopeFront(0, SCOPE.h / 2 + 1.0)} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w47-tag3 scope ${on ? 'lit' : ''}`}>{SCOPE_NAME} · CH1 跨接 C</div>
      </Html>
      <Probe from={bnc} lit={probeLit} />
    </group>
  );
}

/** the CH1 probe: from the BNC socket to the hook at a23, the ground clip at c26 */
function Probe({ from, lit }: { from: V3; lit: boolean }) {
  const [tx, tz] = hole(`a${C_C}`);
  const [gx, gz] = hole(`c${GND_C}`);
  const tip: V3 = [tx, 0.4, tz];
  const cable = useMemo<V3[]>(() => [from, [from[0] + 0.5, from[1] - 1.5, from[2] + 2.5], [tx + 1.5, 3.0, tz - 5.0], [tx + 0.4, 3.6, tz - 0.8], [tx, 2.9, tz]], [from, tx, tz]);
  const gnd = useMemo<V3[]>(
    () => [
      [tx, 2.6, tz],
      [tx + 1.2, 3.2, tz + 1.0],
      [gx, 2.0, gz - 0.6],
      [gx, 0.7, gz],
    ],
    [tx, tz, gx, gz],
  );
  return (
    <group>
      <group {...hover3d(['bb_probe'])}>
        <Tube pts={cable} color="#1f2937" r={0.16} lit={lit} />
        <mesh position={[tip[0], 1.9, tip[2]]}>
          <cylinderGeometry args={[0.32, 0.24, 2.0, 14]} />
          <meshStandardMaterial color="#facc15" roughness={0.45} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.5 : 0} />
        </mesh>
        <mesh position={[tip[0], 0.55, tip[2]]}>
          <cylinderGeometry args={[0.07, 0.04, 0.9, 8]} />
          <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      <group {...hover3d(['bb_gnd_clip'])}>
        <Tube pts={gnd} color="#111827" r={0.08} />
        <mesh position={[gx, 0.55, gz]}>
          <boxGeometry args={[0.35, 0.6, 0.5]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- camera */

const VIEW_DIR = new THREE.Vector3(0, 1.25, 1).normalize();
const FRAMES: Record<Cam, { x: [number, number]; y: [number, number]; z: [number, number] }> = {
  bench: { x: [-47, 0], y: [-1, 10], z: [-23, 1] },
  pot: { x: [-24, -4], y: [-1, 4], z: [-8, 0] },
  scope: { x: [-24, -4], y: [0.5, 10.5], z: [-19, -15] },
};

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: (typeof FRAMES)[Cam]): [THREE.Vector3, THREE.Vector3] {
  const target = new THREE.Vector3((f.x[0] + f.x[1]) / 2, (f.y[0] + f.y[1]) / 2, (f.z[0] + f.z[1]) / 2);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of f.x) for (const y of f.y) for (const z of f.z) corners.push(new THREE.Vector3(x, y, z));
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

function Scene({ lab, s, frame, nonce, sw, shot, flip, turn }: { lab: Lab; s: Sol; frame: Cam; nonce: number; sw: Sw; shot: number; flip: () => void; turn: (r: number) => void }) {
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
  const close = frame === 'pot';
  const rPot = s.c.R - R_L;
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Shell xray={0} />
      <Glow ids={glowOf(lit)} />
      <RailTags lit={lit} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <BenchSupply lit={is('bb_psu')} />
      {/* the switch and its two throws */}
      <Spdt sw={sw} onFlip={flip} lit={is('bb_spdt')} />
      <Jumper from={`a${SW_C}`} to={`T+${SW_C}`} color="red" lit={is('rail_p5', 'bb_spdt')} ids={['rail_p5']} />
      <Jumper from={`a${SW_C + 2}`} to={`T-${SW_C + 2}`} color="black" lit={is('rail_gnd', 'bb_spdt')} ids={['rail_gnd']} />
      <Tag at={[colX(SW_C + 1), ROW_Z.e + 1.4]} y={2.4} text={sw === 'charge' ? '充电 ← 接 +5 V' : '放电 → 接 GND'} cls={`sw ${sw}`} lit={is('bb_spdt')} />
      <Jumper from={`b${SW_C + 1}`} to={`b${POT_C}`} color="orange" lit={is('nd_com')} ids={['nd_com']} />
      <Pot rPot={rPot} onTurn={turn} lit={is('bb_pot', 'r_crit')} enabled={!lab.locked} />
      <Jumper from={`b${POT_C + 1}`} to={`b${L_C}`} color="green" lit={is('nd_wiper')} ids={['nd_wiper']} />
      <Inductor p1={[colX(L_C), ROW_Z.c]} p2={[colX(L_C + 2), ROW_Z.c]} id="bb_l" />
      <Capacitor p1={[colX(C_C), ROW_Z.e]} p2={[colX(GND_C), ROW_Z.e]} kind="film" id="bb_c" />
      <Jumper from={`a${GND_C}`} to={`T-${GND_C}`} color="black" lit={is('rail_gnd')} ids={['rail_gnd']} />
      {close && (
        <>
          <Tag at={[colX(L_C + 1), ROW_Z.c - 1.6]} y={4.0} text="L 10 mH · R_L ≈ 10 Ω" cls="part" lit={is('bb_l')} />
          <Tag at={[colX(C_C + 1.5), ROW_Z.e + 1.4]} y={2.8} text="C 1 µF" cls="part" lit={is('bb_c')} />
        </>
      )}
      <Scope s={s} sw={sw} shot={shot} lit={lit} />
      <OrbitControls makeDefault enableDamping={false} minDistance={6} maxDistance={140} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig frame={frame} nonce={nonce} />
    </>
  );
}

/* ------------------------------------------------------------- HUD and layer */

function Panel({ s }: { s: Sol }) {
  const T = (10 - PRE) * DIV_T;
  const m = minimum(s, T);
  const z = s.regime === 'under' ? zeros(s, T).length : 0;
  return (
    <div className="w47-cells">
      <Cell id="bb_pot" name="R_pot + R_L" value={`${sig(s.c.R - R_L)} + ${R_L} Ω`} />
      <Cell id="alpha_box" name="α" value={fmtRate(s.alpha, 'Np/s')} />
      <Cell id="omega0" name="ω₀" value={fmtRate(s.w0, 'rad/s')} tone="minor" />
      <Cell id="bb_scope" name="状态" value={REGIME_LABEL[s.regime]} tone={s.regime} />
      <Cell id="wf_wd" name="振铃频率 f_d" value={s.regime === 'under' ? fmtHz(s.wd / (2 * Math.PI)) : '—'} hint={s.regime === 'under' ? `屏上过零 ${z} 次` : undefined} />
      <Cell id="nd_vc" name="v_C 最低点" value={fmtV(m.v)} tone={m.v < 0 ? 'bad' : 'good'} />
    </div>
  );
}

export default function Bench3D() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const [frame, setFrame] = useStageParam<Cam>('cam', 'bench');
  const [nonce, setNonce] = useStageParam('camNonce', 0);
  const [sw, setSw] = useStageParam<Sw>('sw', 'release');
  const [shot, setShot] = useStageParam('shot', 0);
  const on = useIsLit()('scale_note');
  // the breadboard runs its own circuit: 10 mH, 1 µF, 5 V, R_L ≈ 10 Ω in the loop
  const { preset, locked, set, c } = lab;
  const isBench = preset === 'bench';
  useEffect(() => {
    if (!isBench && !locked)
      set(presetParams('bench', { R: c.topo === 'series' && c.R >= R_L && c.R <= R_L + POT_MAX && c.L === PRESETS.bench.L && c.C === PRESETS.bench.C ? c.R : PRESETS.bench.R }));
  }, [isBench, locked, set, c.topo, c.R, c.L, c.C]);
  const s = isBench ? lab.s : solve({ ...PRESETS.bench });
  const flip = () => {
    const next: Sw = sw === 'charge' ? 'release' : 'charge';
    setSw(next);
    if (next === 'release') setShot(shot + 1);
  };
  const turn = (r: number) => {
    if (locked) return;
    set({ R: snapR(r + R_L, s.rcrit) });
  };
  return (
    <div className="w47-layer">
      <div className="w47-dock">
        <RSlider lab={isBench ? lab : { ...lab, c: s.c, rl: R_L }} pot label="R_pot" />
        <button className={`w47-btn ${sw}`} onClick={flip} disabled={locked} {...hoverProps(['bb_spdt'])}>
          <span className="full">SPDT：{sw === 'charge' ? '充电中（接 +5 V）→ 拨到放电' : '已放电（接 GND）→ 拨回充电'}</span>
          <span className="short">SPDT {sw === 'charge' ? '充电 → 放电' : '放电 → 充电'}</span>
        </button>
      </div>
      <div className="bb3d-wrap w47-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-18, 44, 34], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <Scene lab={lab} s={s} frame={frame} nonce={nonce} sw={sw} shot={shot} flip={flip} turn={turn} />
        </Canvas>
        <div className="w47-camsel">
          <Seg<Cam>
            label="镜头"
            value={frame}
            onChange={setFrame}
            options={[
              { value: 'bench', label: '实验台全景', short: '全景' },
              { value: 'pot', label: '电位器与开关特写', short: '电位器' },
              { value: 'scope', label: '示波器屏幕', short: '示波器' },
            ]}
          />
          <button className="w47-fold" onClick={() => setNonce(nonce + 1)} title="复位镜头">
            复位
          </button>
        </div>
        <p className="w47-drag-hint">拖动黑色旋钮拧电位器 · 点 SPDT 白色拨钮充放电 · 拖动空白处旋转视角</p>
      </div>
      <Panel s={s} />
      <p className={`w47-notice ${on}`} {...hoverProps(['scale_note'])} role="note">
        <span className="full">
          {SUPPLY_NAME} · 无极性 1 µF 薄膜电容（欠阻尼时 v_C 会反向到负值）· 峰值电流 ≈ v₀/√(L/C) ≈ 50 mA &lt; 250 mA · 临界点 R_pot ≈ {sig(s.rcrit - R_L)} Ω
        </span>
        <span className="short">{SUPPLY_NAME} · 无极性薄膜电容 · 峰值电流 ≈ 50 mA</span>
      </p>
    </div>
  );
}
