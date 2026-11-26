// Layer "03 3D LM358 ±9V 双电源面包板 + 信号源/示波器探头实操": the shared LM358 (Lm358.tsx; notch
// left, pins 1 and 8 in column 28) across the trench of an 830-hole board, and three instruments
// standing behind it (the shared bench instruments of src/stage/bench), each wired by its own leads:
//  - 台式可调直流电源（±9 V）: its two 9 V outputs (第 1 路 / 第 2 路) in series, the middle COM =
//    GND. Red lead + → top red rail (+9 V), black lead COM → top blue rail and bottom red rail
//    (GND), blue lead − → bottom blue rail (−9 V). Red jumper T+27 → a28 (Pin 8 V+), blue jumper
//    j31 → B−33 (Pin 4 V−), black jumper j30 → B+30 (Pin 3 IN+ to GND);
//  - 函数信号发生器: square / triangle, 50 Hz – 2 kHz, ±0.5 … ±5 V; red clip → j18 (the input
//    node, column 18), black clip → top GND rail;
//  - 双通道示波器: CH1 hook on g18 (input), CH2 hook on g28 (Pin 1 = v_o), both ground clips on the
//    top GND rail; its screen shows the live traces of model.simulate() (two periods, 2.5 V/div,
//    the LM358's swing limits dashed, the 50 kHz glitch as a thick trace).
// The circuit (an orange jumper g29 → g24 brings v− = Pin 2 to column 24):
//  - integrator: R 10 kΩ (brown-black-orange) h18 → h24, C 100 nF film "104" i24 → i28,
//    R_f 100 kΩ (brown-black-yellow) j24 → j28 — "拔掉 R_f" removes it;
//  - differentiator: R_s 1 kΩ (brown-black-red) h18 → h21 and C i21 → i24 (without R_s: C i18 →
//    i24), R 10 kΩ j24 → j28.
// The chip's own 3 mV offset is always there: without R_f the integrator walks up 3 V/s from
// power-on and hangs from the +7.5 V rail (a flat line once the generator is off).

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, D, Lead as Leg, RAIL_Z, ROW_Z, Resistor, Shell, SurfaceGlow, TrenchGlow, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { BenchSupply, FunctionGenerator, Oscilloscope, supplyLabel, type LcdLine, type OsdItem, type ScopeCursor, type V3 } from '../../bench';
import { Lm358, lm358Pin } from '../../Lm358';
import { useLit, useStage } from '../../stageStore';
import { driftLevel, fmtF, fmtSigned, fmtV, gainAt, simulate, VN, VOH, VOL, VOS, type Trace, type Wave } from './model';
import { Cell, Dock, hoverProps, Seg, Slider, useBench, useClearHoverOnUnmount, useClock, type Cam } from './state';

export const C0 = 28;
/** the ±9 V supply: two 9 V outputs in series */
const PSU_CHANNELS = [{ v: 9 }, { v: 9 }];
export const SUPPLY_NAME = supplyLabel(PSU_CHANNELS, true);

/** column of an LM358 pin (pins 1–4 on row f, 5–8 on row e) */
const pc = (p: 1 | 2 | 3 | 4 | 8) => lm358Pin(C0, p).col;
/** Pin 1 (OUT A), Pin 2 (IN− A), Pin 3 (IN+ A), Pin 4 (V−), Pin 8 (V+) */
const P1 = pc(1);
const P2 = pc(2);
const P3 = pc(3);
const P4 = pc(4);
const P8 = pc(8);

/* ------------------------------------------------------------- holes and picking */

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

function nets(diff: boolean, rs: boolean): Record<string, string> {
  const n: Record<string, string> = { [`u${P8}`]: 'rail_p9', l18: 'vi', l24: 'vn', [`l${P2}`]: 'vn', [`l${P1}`]: 'vo', [`l${P3}`]: 'gnd', [`l${P4}`]: 'rail_m9' };
  if (diff && rs) n.l21 = 'rs';
  return n;
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

const WIRE = { red: '#d62f2f', black: '#24262b', blue: '#2f5fd0', orange: '#f08a1c' };
type WireColor = keyof typeof WIRE;

const enterIds = (ids: string[]) => (e: ThreeEvent<PointerEvent>) => {
  e.stopPropagation();
  useStage.getState().setHover(ids);
};
const leave = () => useStage.getState().setHover(null);

function Jumper({ from, to, color, lit, id }: { from: string; to: string; color: WireColor; lit?: boolean; id: string }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(from);
    const [x2, z2] = hole(to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const h = Math.min(2.6, Math.max(0.8, 0.35 + 0.2 * dist));
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.4, z1], at(0.2, h * 0.92), at(0.5, h), at(0.8, h * 0.92), [x2, 0.4, z2], [x2, -0.3, z2]];
  }, [from, to]);
  return (
    <group onPointerOver={enterIds([id])} onPointerOut={leave}>
      <Tube pts={pts} color={WIRE[color]} r={0.13} lit={lit} />
    </group>
  );
}

/* ------------------------------------------------------------- parts */

const BANDS: Record<string, string[]> = {
  '1k': ['#7a4a1f', '#151515', '#c62828', '#d4a72c'],
  '10k': ['#7a4a1f', '#151515', '#f07a1a', '#d4a72c'],
  '100k': ['#7a4a1f', '#151515', '#f2d21b', '#d4a72c'],
};

function Res({ a, b, id, label, value, lit }: { a: string; b: string; id: string; label: string; value: keyof typeof BANDS; lit: boolean }) {
  const setHover = useStage((s) => s.setHover);
  return <Resistor p1={hole(a)} p2={hole(b)} lit={lit} tone="good" label={label} bands={BANDS[value]} onHover={(on) => setHover(on ? [id] : null)} />;
}

/** a 100 nF film capacitor ("104"): a yellow box standing on two legs */
function FilmCap({ a, b, id, label, lit }: { a: string; b: string; id: string; label: string; lit: boolean }) {
  const [x1, z1] = hole(a);
  const [x2, z2] = hole(b);
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const ang = Math.atan2(-(z2 - z1), x2 - x1);
  const h = 1.5;
  const ux = (x2 - x1) / Math.hypot(x2 - x1, z2 - z1);
  const uz = (z2 - z1) / Math.hypot(x2 - x1, z2 - z1);
  const e1: V3 = [mx - ux * 0.55, h - 0.5, mz - uz * 0.55];
  const e2: V3 = [mx + ux * 0.55, h - 0.5, mz + uz * 0.55];
  return (
    <group>
      <Leg pts={[[x1, -0.3, z1], [x1, 0.5, z1], e1]} />
      <Leg pts={[[x2, -0.3, z2], [x2, 0.5, z2], e2]} />
      <group position={[mx, h + 0.15, mz]} rotation={[0, ang, 0]} onPointerOver={enterIds([id])} onPointerOut={leave}>
        <mesh>
          <boxGeometry args={[1.7, 1.4, 0.75]} />
          <meshStandardMaterial color="#e9bf24" roughness={0.45} emissive={lit ? '#f59e0b' : '#000000'} emissiveIntensity={lit ? 0.45 : 0} />
        </mesh>
      </group>
      <Html position={[mx, h + 1.4, mz]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w43-tag3 cap ${lit ? 'lit' : ''}`}>{label}</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- instruments (src/stage/bench) */

/** the supply's display: its outputs are 第 1 路 / 第 2 路 here, since CH1 / CH2 are the scope's */
const PSU_LCD: LcdLine[] = [{ text: '第 1 路 +9.00 V', strong: true }, { text: '第 2 路 −9.00 V', strong: true }, { text: '串联 · COM = GND' }];

/** the LM358's swing limits on ±9 V (+7.5 V / −8.9 V), dashed across the screen */
const RAIL_CURSORS: ScopeCursor[] = [
  { kind: 'v', ch: 'ch2', at: VOH, color: '#f87171' },
  { kind: 'v', ch: 'ch2', at: VOL, color: '#f87171' },
];

/**
 * A trace from the simulation's per-column [min, max] pairs (peak detect, so edge spikes stay
 * visible), with a vertical stroke where a column spans a jump. `band` widens every column by
 * ±band inside `lim`: the 50 kHz glitch, far too fast for the screen, paints a thick trace.
 */
function colsTrace(cols: [number, number][], span: number, band = 0, lim: [number, number] = [-Infinity, Infinity]): [number, number][] {
  const pts: [number, number][] = [];
  let prev: number | null = null;
  cols.forEach(([lo0, hi0], c) => {
    const t = ((c + 0.5) / cols.length) * span;
    const lo = Math.max(lim[0], lo0 - band);
    const hi = Math.min(lim[1], hi0 + band);
    const vs = hi - lo < 0.06 ? [(lo + hi) / 2] : prev !== null && Math.abs(prev - hi) < Math.abs(prev - lo) ? [hi, lo] : [lo, hi];
    for (const v of vs) {
      pts.push([t, v]);
      prev = v;
    }
  });
  return pts;
}

function Instruments({ lab }: { lab: Lab }) {
  const { tr, bandIn, bandOut } = lab;
  // two periods across the 10 divisions, both channels on one 2.5 V/div scale; thick traces for the
  // small screen
  const time = useMemo(() => ({ div: tr.span / 10 }), [tr.span]);
  const ch1 = useMemo(() => ({ data: colsTrace(tr.colsIn, tr.span, bandIn, [-20, 20]), vdiv: 2.5, width: 12 }), [tr, bandIn]);
  const ch2 = useMemo(() => ({ data: colsTrace(tr.cols, tr.span, bandOut > 0.02 ? bandOut : 0, [VOL, VOH]), vdiv: 2.5, width: 12 }), [tr, bandOut]);
  const osd: OsdItem[] = tr.clipped ? [{ text: 'CLIPPING', tone: 'warn' }] : [];
  return (
    <>
      <BenchSupply
        id="psu"
        position={[-24, -17.5]}
        channels={PSU_CHANNELS}
        series
        lcd={PSU_LCD}
        leads={[
          { from: '+', to: 'T+12', litIds: ['rail_p9'] },
          { from: 'com', to: ['T-13', 'B+3'], litIds: ['rail_gnd'] },
          { from: '-', to: 'B-5', litIds: ['rail_m9'] },
        ]}
      />
      <FunctionGenerator
        id="fgen"
        position={[-3, -17.5]}
        waveform={lab.wave === 'tri' ? 'triangle' : 'square'}
        frequency={lab.f}
        vpp={2 * lab.amp}
        output={lab.gen}
        out="j18"
        gnd="T-20"
        litIds={['vi']}
      />
      <Oscilloscope
        id="scope"
        position={[22, -17.5]}
        scale={0.625}
        ch1={ch1}
        ch2={ch2}
        time={time}
        cursors={RAIL_CURSORS}
        osd={osd}
        litIds={['ch1', 'ch2']}
        probes={{
          ch1: { tip: 'g18', ground: 'T-16', id: 'ch1', groundId: 'ch1', litIds: ['vi'], groundLitIds: ['rail_gnd'] },
          ch2: { tip: `g${P1}`, ground: 'T-30', id: 'ch2', groundId: 'ch2', litIds: ['vo'], groundLitIds: ['rail_gnd'] },
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------- camera */

const VIEW_DIR = new THREE.Vector3(0, 1.6, 1).normalize();
const VIEW_DIR_WIDE = new THREE.Vector3(0, 1.2, 1).normalize();
/** the scope's screen is on its front panel: its preset looks at it from lower down */
const SCOPE_DIR = new THREE.Vector3(0, 0.8, 1).normalize();
type Box = { x: [number, number]; z: [number, number]; y?: [number, number] };
const FRAMES: Record<Cam, Box> = {
  bench: { x: [-34, 34], z: [-21, 11] },
  circuit: { x: [-16, 4], z: [-4, 8] },
  scope: { x: [10, 34], z: [-21, -12], y: [-1, 8] },
};
const FRAMES_WIDE: Record<Cam, Box> = {
  bench: { x: [-33, 33], z: [-20, 10] },
  circuit: { x: [-18, 6], z: [-3, 8] },
  scope: { x: [8, 36], z: [-21, -12], y: [-1, 8] },
};

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: Box, dir: THREE.Vector3): [THREE.Vector3, THREE.Vector3] {
  const target = new THREE.Vector3((f.x[0] + f.x[1]) / 2, 0.5, (f.z[0] + f.z[1]) / 2);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of f.x) for (const y of f.y ?? [-1, 6]) for (const z of f.z) corners.push(new THREE.Vector3(x, y, z));
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

function CameraRig({ frame }: { frame: Cam }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const anim = useRef<{ t: number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3 } | null>(null);
  useEffect(() => {
    if (!controls) return;
    const wide = aspect > 1.6;
    const dir = frame === 'scope' ? SCOPE_DIR : wide ? VIEW_DIR_WIDE : VIEW_DIR;
    const [toP, toT] = fitView(camera, aspect, (wide ? FRAMES_WIDE : FRAMES)[frame], dir);
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

/* ------------------------------------------------------------- the scene */

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

interface Lab {
  diff: boolean;
  rf: boolean;
  rs: boolean;
  gen: boolean;
  wave: Wave;
  f: number;
  amp: number;
  glitch: boolean;
  frame: Cam;
  /** what the scope shows: the simulated traces and the glitch band on CH1 / CH2 */
  tr: Trace;
  bandIn: number;
  bandOut: number;
}

function Scene({ lab }: { lab: Lab }) {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const is = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const net = useMemo(() => nets(lab.diff, lab.rs), [lab.diff, lab.rs]);
  const glow = new Set(lit.filter((id) => /^strip_/.test(id)));
  for (const [k, id] of Object.entries(net)) if (lit.includes(id)) glow.add(stripId(k[0] as 'u' | 'l', Number(k.slice(1))));
  const rails = [...lit];
  if (is('psu')) rails.push('rail_p9', 'rail_gnd', 'rail_m9');
  if (is('gnd')) rails.push('rail_gnd');
  const last = useRef<string | null>(null);
  const move = (e: ThreeEvent<PointerEvent>) => {
    const ids = pick(e.point.x, e.point.z, net);
    const key = ids?.join(',') ?? null;
    if (key !== last.current) {
      last.current = key;
      setHover(ids);
    }
  };
  const out = () => {
    last.current = null;
    setHover(null);
  };
  const { diff } = lab;
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Shell xray={0} />
      <SurfaceGlow lit={[...glow]} />
      <RailGlow lit={rails} />
      <TrenchGlow on={is('center_trench')} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={out} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>

      {/* the ±9 V bench supply, the function generator and the scope; the chip's supply pins */}
      <Instruments lab={lab} />
      <Jumper from="T+27" to={`a${P8}`} color="red" lit={is('rail_p9', 'chip_lm358_p8')} id="rail_p9" />
      <Jumper from={`j${P4}`} to="B-33" color="blue" lit={is('rail_m9', 'chip_lm358_p4')} id="rail_m9" />
      <Jumper from={`j${P3}`} to={`B+${P3}`} color="black" lit={is('gnd', 'chip_lm358_p3')} id="gnd" />
      <Lm358 c0={C0} pinNumbers />

      {/* the circuit */}
      <Jumper from={`g${P2}`} to="g24" color="orange" lit={is('vn', 'chip_lm358_p2')} id="vn" />
      {!diff ? (
        <>
          <Res a="h18" b="h24" id="r_in" label="R 10 kΩ" value="10k" lit={is('r_in')} />
          <FilmCap a="i24" b={`i${P1}`} id="c_fb" label="C 100 nF（104）" lit={is('c_fb')} />
          {lab.rf && <Res a="j24" b={`j${P1}`} id="rf" label="R_f 100 kΩ" value="100k" lit={is('rf')} />}
        </>
      ) : (
        <>
          {lab.rs && <Res a="h18" b="h21" id="rs" label="R_s 1 kΩ" value="1k" lit={is('rs')} />}
          <FilmCap a={lab.rs ? 'i21' : 'i18'} b="i24" id="c_in" label="C 100 nF（104）" lit={is('c_in')} />
          <Res a="j24" b={`j${P1}`} id="r_fb" label="R 10 kΩ" value="10k" lit={is('r_fb')} />
        </>
      )}

      <OrbitControls makeDefault enableDamping={false} minDistance={8} maxDistance={140} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig frame={lab.frame} />
    </>
  );
}

/* ------------------------------------------------------------- the layer */

export default function Bench3D() {
  useClearHoverOnUnmount();
  const b = useBench();
  const { glitch, setGlitch, gen, setGen } = b;
  const diff = b.preset === 'diff';
  const drifting = !diff && !b.rf;
  const [tOn, restart] = useClock(`${b.preset}|${b.rf}|${gen}`, drifting);
  const wave: Wave = gen ? b.wave : 'gnd';
  const cfg = useMemo(
    () => ({ mode: b.mode, wave, f: b.f, amp: b.amp, vos: VOS, ic: 'sym' as const, drift: drifting ? driftLevel('int', tOn) : 0 }),
    [b.mode, wave, b.f, b.amp, drifting, tOn],
  );
  const tr = useMemo(() => simulate(cfg, 240), [cfg]);
  const band = glitch && gen ? gainAt(b.mode, 50_000) * VN : 0;
  const lab: Lab = { diff, rf: b.rf, rs: b.rs, gen, wave: b.wave, f: b.f, amp: b.amp, glitch, frame: b.cam, tr, bandIn: glitch && gen ? VN : 0, bandOut: band };
  const status = tr.clipped ? (drifting ? '撞 +7.5 V 轨' : '饱和削顶') : band > 1 ? '毛刺炸屏' : '线性';
  return (
    <div className="w43-layer">
      <Dock
        head={
          <>
            <Seg
              label="接线"
              value={b.preset}
              set={(v) => {
                b.setPreset(v);
                b.setWave(v === 'int' ? 'square' : 'tri');
              }}
              opts={[
                { v: 'int', full: '有损积分器', short: '积分' },
                { v: 'diff', full: '实用微分器', short: '微分' },
              ]}
              hl={['opamp']}
            />
            <Seg<Cam>
              label="镜头"
              small
              value={b.cam}
              set={b.setCam}
              opts={[
                { v: 'bench', full: '全景', short: '全景' },
                { v: 'circuit', full: '电路特写', short: '电路' },
                { v: 'scope', full: '示波器', short: '屏幕' },
              ]}
            />
          </>
        }
      >
        <div className="w43-row">
          {diff ? (
            <button className={`w43-toggle ${b.rs ? '' : 'bad'}`} aria-pressed={!b.rs} onClick={() => b.setRs(!b.rs)} {...hoverProps(['rs'])}>
              <span className="full">{b.rs ? '拔掉 R_s 1 kΩ' : '插回 R_s 1 kΩ'}</span>
              <span className="short">{b.rs ? '拔 R_s' : '插 R_s'}</span>
            </button>
          ) : (
            <button className={`w43-toggle ${b.rf ? '' : 'bad'}`} aria-pressed={!b.rf} onClick={() => b.setRf(!b.rf)} {...hoverProps(['rf'])}>
              <span className="full">{b.rf ? '拔掉 R_f 100 kΩ' : '插回 R_f 100 kΩ'}</span>
              <span className="short">{b.rf ? '拔 R_f' : '插 R_f'}</span>
            </button>
          )}
          <button className={`w43-toggle ${gen ? 'on' : ''}`} aria-pressed={gen} onClick={() => setGen(!gen)} {...hoverProps(['fgen'])}>
            <span className="full">信号源输出 {gen ? '开' : '关'}</span>
            <span className="short">信号{gen ? '开' : '关'}</span>
          </button>
          <button className={`w43-toggle ${glitch ? 'on' : ''}`} aria-pressed={glitch} onClick={() => setGlitch(!glitch)} {...hoverProps(['noise'])}>
            <span className="full">长飞线毛刺 {glitch ? '开' : '关'}</span>
            <span className="short">毛刺{glitch ? '开' : '关'}</span>
          </button>
        </div>
        <div className="w43-row">
          <Seg<Wave>
            label="信号源波形"
            small
            value={b.wave}
            set={b.setWave}
            opts={[
              { v: 'square', full: '方波', short: '方' },
              { v: 'tri', full: '三角波', short: '三角' },
            ]}
            hl={['fgen']}
          />
          <Slider name="f" value={b.f} min={50} max={2000} step={50} set={b.setF} text={fmtF(b.f)} aria="信号源频率" hl="fgen" />
          <Slider name="V" value={b.amp} min={0.5} max={5} step={0.1} set={(v) => b.setAmp(Math.round(v * 10) / 10)} text={`±${b.amp.toFixed(1)} V`} aria="信号源幅值" hl="fgen" />
        </div>
      </Dock>
      <div className={`bb3d-wrap w43-bench ${b.cam}`}>
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-10, 60, 40], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <Scene lab={lab} />
        </Canvas>
      </div>
      <div className="w43-cells">
        <Cell id="ch2" name="CH2 峰峰值" short="CH2 Vpp" value={fmtV(tr.max - tr.min)} />
        <Cell id="vo" name="CH2 最高 / 最低" short="max/min" value={`${fmtSigned(tr.max, 1)} / ${fmtSigned(tr.min, 1)}`} />
        <Cell id="sat" name="状态" value={status} cls={tr.clipped || band > 1 ? 'bad' : 'good'} />
        <Cell id="psu" name="电源" value="±9.00 V" hint={SUPPLY_NAME} />
        <Cell id="fgen" name="信号源" value={gen ? `${fmtF(b.f)} · ${(2 * b.amp).toFixed(1)} Vpp` : '输出关'} />
        {drifting ? (
          <Cell
            id="vos"
            name={`上电 ${tOn.toFixed(1)} s`}
            short={`${tOn.toFixed(1)} s`}
            value={tr.max >= VOH - 1e-6 ? '贴 +7.5 V 轨' : `直流 ${fmtSigned(driftLevel('int', tOn))}`}
            cls={tr.max >= VOH - 1e-6 ? 'bad' : ''}
          />
        ) : null}
      </div>
      {drifting && (
        <button className="w43-toggle w43-repower" onClick={restart}>
          重新上电
        </button>
      )}
    </div>
  );
}
