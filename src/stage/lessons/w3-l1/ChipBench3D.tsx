// Layer "01 3D 芯片封装与面包板跨沟插法": an 830-hole breadboard (shared BreadboardXray pieces)
// with the World 3 lab chip straddling the centre trench — the shared LM358 (Lm358.tsx), or this
// lesson's LM741 in the same package — and a dual bench supply (±9 V) wired by leads to the rails:
// top red rail +9 V, top blue rail GND, bottom blue rail −9 V (the bottom red rail is unused).
// Two jumpers power the chip: Pin 4 → −9 V, and the V+ pin → +9 V — Pin 8 on the LM358, Pin 7 on
// the LM741, so the red jumper moves (and pins 7 and 8 flash red) when the chip is switched.
// Controls: chip, X-ray (the shell fades to show the spring clips and the trench), pin group
// (labels the group's pins and lights their strips), camera (notch-up top view, straddle view,
// pin-1 close-up). Hovering a hole, pin, rail, the notch or the pin-1 dot names it.

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { Clips, colX, D, RAIL_Z, ROW_Z, Shell, SurfaceGlow, TrenchGlow, W, type Rail } from '../../BreadboardXray';
import { stripId } from '../../breadboardIds';
import { Lm358, lm358Pin } from '../../Lm358';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { Lm741 } from './Lm741';
import { ALL_PINS, CHIP_C0, CHIP_NAME, PINS, pinId, pinsOf, vccPin, VEE_PIN, type ChipKind, type PinGroup, type PinNo, type PinRole } from './model';
import { hoverProps, Seg, Toggle, useChip, useClearHoverOnUnmount, useIsLit } from './ui';

type V3 = [number, number, number];
export type Cam1 = 'top' | 'iso' | 'pin1';

/* ------------------------------------------------------------- holes, rails, picking */

/** Board coordinates of a hole: "c10", "T+10" (top + rail, column 10), "B-27" (bottom − rail). */
function hole(h: string): [number, number] {
  const m = /^([TB])([+-])(\d+)$/.exec(h);
  if (m) {
    const r: Rail = m[1] === 'T' ? (m[2] === '+' ? 'tp' : 'tn') : m[2] === '+' ? 'bp' : 'bn';
    return [colX(Number(m[3])), RAIL_Z[r]];
  }
  return [colX(Number(h.slice(1))), ROW_Z[h[0]]];
}

/** this lesson's rails: +9 V, GND, −9 V (and the unused bottom red one) */
const RAIL_OF: Record<Rail, string> = { tp: 'rail_vcc', tn: 'rail_gnd', bp: 'rail_unused', bn: 'rail_vee' };
const RAIL_COLOR: Record<string, string> = { rail_vcc: '#ff4d5e', rail_gnd: '#64748b', rail_vee: '#7c3aed', rail_unused: '#cbd5e1' };

function pick(x: number, z: number): string[] | null {
  const c = Math.round(x + 32);
  if (Math.abs(z) < 0.95) return ['center_trench'];
  for (const r of Object.keys(RAIL_Z) as Rail[]) if (Math.abs(z - RAIL_Z[r]) < 0.5 && c >= 2 && c <= 62) return [RAIL_OF[r]];
  if (c < 1 || c > 63) return null;
  const half = z <= -1 && z >= -6 ? 'u' : z >= 1 && z <= 6 ? 'l' : null;
  return half ? [stripId(half, c)] : null;
}

/** the strip a pin sits in */
const pinStrip = (p: PinNo) => {
  const { col, row } = lm358Pin(CHIP_C0, p);
  return stripId(row === 'e' ? 'u' : 'l', col);
};

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

const WIRE = { red: '#d62f2f', black: '#24262b', blue: '#2b59c3' };

function Jumper({ from, to, color, lit, ids }: { from: string; to: string; color: keyof typeof WIRE; lit?: boolean; ids?: string[] }) {
  const pts = useMemo<V3[]>(() => {
    const [x1, z1] = hole(from);
    const [x2, z2] = hole(to);
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const h = Math.min(2.4, Math.max(0.8, 0.35 + 0.2 * dist));
    const at = (t: number, y: number): V3 => [x1 + (x2 - x1) * t, y, z1 + (z2 - z1) * t];
    return [[x1, -0.3, z1], [x1, 0.4, z1], at(0.2, h * 0.92), at(0.5, h), at(0.8, h * 0.92), [x2, 0.4, z2], [x2, -0.3, z2]];
  }, [from, to]);
  const enter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (ids) useStage.getState().setHover(ids);
  };
  return (
    <group onPointerOver={ids && enter} onPointerOut={ids && (() => useStage.getState().setHover(null))}>
      <Tube pts={pts} color={WIRE[color]} r={0.13} lit={lit} />
    </group>
  );
}

/* ------------------------------------------------------------- dual bench supply */

const PSU = { x: -42, z: -1.5, w: 8, h: 4.2, d: 9 };

function BenchSupply({ lit }: { lit: boolean }) {
  const right = PSU.x + PSU.w / 2;
  const lead = (dz: number, to: string): V3[] => {
    const [x, z] = hole(to);
    return [
      [right + 0.2, 1.4, PSU.z + dz],
      [right + 1.6, 1.9, PSU.z + dz * 1.6],
      [x - 0.9, 1.4, z],
      [x, 0.5, z],
      [x, -0.3, z],
    ];
  };
  const leads = useMemo(() => ({ pos: lead(-2.8, 'T+3'), com: lead(0, 'T-3'), neg: lead(2.8, 'B-3') }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const enter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    useStage.getState().setHover(['bench_psu']);
  };
  return (
    <group>
      <group onPointerOver={enter} onPointerOut={() => useStage.getState().setHover(null)}>
        <mesh position={[PSU.x, PSU.h / 2 - 1, PSU.z]}>
          <boxGeometry args={[PSU.w, PSU.h, PSU.d]} />
          <meshStandardMaterial color="#d9dde3" roughness={0.55} emissive={lit ? '#f59e0b' : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
        </mesh>
        <mesh position={[PSU.x, PSU.h / 2 - 1, PSU.z + PSU.d / 2 + 0.01]}>
          <planeGeometry args={[PSU.w - 0.6, PSU.h - 0.5]} />
          <meshStandardMaterial color="#3b4250" roughness={0.7} />
        </mesh>
        {[-1.8, 1.8].map((dx) => (
          <mesh key={dx} position={[PSU.x + dx, 0, PSU.z + PSU.d / 2 + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.6, 20]} />
            <meshStandardMaterial color="#9aa1ab" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {(
          [
            [-2.8, '#d62f2f'],
            [0, '#24262b'],
            [2.8, '#2b59c3'],
          ] as const
        ).map(([dz, c]) => (
          <mesh key={dz} position={[right + 0.15, 1.4, PSU.z + dz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.42, 0.42, 0.5, 14]} />
            <meshStandardMaterial color={c} />
          </mesh>
        ))}
      </group>
      <Tube pts={leads.pos} color={WIRE.red} r={0.14} lit={lit} />
      <Tube pts={leads.com} color={WIRE.black} r={0.14} lit={lit} />
      <Tube pts={leads.neg} color={WIRE.blue} r={0.14} lit={lit} />
      <Html position={[PSU.x, PSU.h / 2 + 0.2, PSU.z + PSU.d / 2 + 0.05]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w3-psu-lcd">
          <b>+9.00 V</b>
          <b>−9.00 V</b>
        </div>
      </Html>
      <Html position={[PSU.x, PSU.h + 1.4, PSU.z - PSU.d / 2 - 1]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w3-tag3 psu ${lit ? 'lit' : ''}`}>台式可调直流电源（±9 V）</div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- rails, notch, pin labels, pulse */

function RailGlow({ lit }: { lit: string[] }) {
  return (
    <>
      {(Object.keys(RAIL_Z) as Rail[])
        .filter((r) => lit.includes(RAIL_OF[r]))
        .map((r) => (
          <mesh key={r} position={[(colX(3) + colX(61)) / 2, 0.03, RAIL_Z[r]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
            <planeGeometry args={[colX(61) - colX(3) + 1.2, 0.86]} />
            <meshBasicMaterial color={RAIL_COLOR[RAIL_OF[r]]} transparent opacity={0.45} depthWrite={false} />
          </mesh>
        ))}
    </>
  );
}

function RailTags({ lit }: { lit: string[] }) {
  // the two top rails are 1 unit apart: their tags sit in different columns
  const tags: [Rail, string, string, number][] = [
    ['tp', '+9 V', 'vcc', 20],
    ['tn', 'GND', 'gnd', 9],
    ['bn', '−9 V', 'vee', 20],
  ];
  return (
    <>
      {tags.map(([r, t, k, col]) => (
        <Html key={r} position={[colX(col), 0.3, RAIL_Z[r]]} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`w3-rail-tag ${k} ${lit.includes(RAIL_OF[r]) ? 'lit' : ''}`}>{t}</div>
        </Html>
      ))}
    </>
  );
}

/** invisible pointer targets over the notch and the pin-1 dot, and a ring when they are lit */
function NotchMarks({ lit }: { lit: string[] }) {
  const x0 = colX(CHIP_C0);
  const marks: { id: string; p: V3; r: number }[] = [
    { id: 'notch', p: [x0 - 0.72, 0.93, 0], r: 0.42 },
    { id: 'pin1_dot', p: [x0 - 0.3, 0.93, 0.72], r: 0.26 },
  ];
  return (
    <>
      {marks.map((m) => (
        <group key={m.id}>
          <mesh
            position={m.p}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={false}
            onPointerEnter={(e) => {
              e.stopPropagation();
              useStage.getState().setHover([m.id]);
            }}
            onPointerLeave={() => useStage.getState().setHover(null)}
          >
            <circleGeometry args={[m.r, 16]} />
          </mesh>
          {lit.includes(m.id) && (
            <mesh position={[m.p[0], m.p[1] + 0.01, m.p[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[m.r, m.r + 0.12, 28]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

const ROLE_CLASS: Record<PinRole, string> = { out: 'out', in: 'in', pos: 'pos', neg: 'neg', null: 'idle', nc: 'idle' };

function PinTags({ chip, group, lit }: { chip: ChipKind; group: PinGroup; lit: string[] }) {
  const shown = group === 'all' ? [] : pinsOf(chip, group);
  const hot = ALL_PINS.filter((p) => lit.includes(pinId(chip, p)) && !shown.includes(p));
  return (
    <>
      {[...shown, ...hot].map((p) => {
        const { col, row } = lm358Pin(CHIP_C0, p);
        const z = Math.sign(ROW_Z[row]) * 2.55;
        const info = PINS[chip][p];
        return (
          <Html key={p} position={[colX(col), 0.3, z]} center zIndexRange={[22, 0]} style={{ pointerEvents: 'none' }}>
            <div className={`w3-pin-tag ${ROLE_CLASS[info.role]}`}>
              {p} {info.name}
            </div>
          </Html>
        );
      })}
    </>
  );
}

/** pins 7 and 8 flash red for a moment after the chip is switched (the V+ pin moves) */
function SwapPulse({ chip }: { chip: ChipKind }) {
  const invalidate = useThree((s) => s.invalidate);
  const [flash, setFlash] = useState(false);
  const first = useRef(true);
  const t0 = useRef(0);
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    t0.current = performance.now();
    setFlash(true);
    invalidate();
    const t = window.setTimeout(() => setFlash(false), 2600);
    return () => window.clearTimeout(t);
  }, [chip, invalidate]);
  useFrame(() => {
    if (!flash) return;
    const t = (performance.now() - t0.current) / 1000;
    const k = prefersReducedMotion() ? 0.7 : 0.35 + 0.35 * (1 + Math.sin(t * Math.PI * 4)) * 0.5;
    for (const m of mats.current) if (m) m.opacity = k;
    invalidate();
  });
  if (!flash) return null;
  const v = vccPin(chip);
  return (
    <>
      {([7, 8] as PinNo[]).map((p, i) => {
        const { col, row } = lm358Pin(CHIP_C0, p);
        return (
          <mesh key={p} position={[colX(col), 0.06, ROW_Z[row]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4}>
            <circleGeometry args={[0.62, 24]} />
            <meshBasicMaterial ref={(m) => void (mats.current[i] = m)} color="#ef4444" transparent opacity={0.6} depthWrite={false} />
          </mesh>
        );
      })}
      <Html position={[colX(CHIP_C0) + 0.5, 0.4, ROW_Z.a - 1.6]} center zIndexRange={[26, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w3-swap-tag">
          {CHIP_NAME[chip]}：V+ 在 Pin {v}
          {chip === 'lm358' ? '（Pin 7 = OUT2）' : '（Pin 8 = NC）'}
        </div>
      </Html>
    </>
  );
}

/* ------------------------------------------------------------- camera */

const FRAMES: Record<Cam1, { dir: V3; x: [number, number]; z: [number, number]; y: [number, number] }> = {
  // straight down from the +x side: the notch (−x) points up the screen, pin 1 is top-left
  top: { dir: [0.16, 1, 0], x: [colX(CHIP_C0) - 1.6, colX(CHIP_C0 + 3) + 1.2], z: [-3.4, 3.4], y: [-0.5, 1.2] },
  iso: { dir: [0.22, 1.15, 1], x: [-46, colX(22)], z: [-10.5, 10.5], y: [-1, 3] },
  pin1: { dir: [-0.6, 0.75, 1], x: [colX(CHIP_C0) - 1.4, colX(CHIP_C0 + 1) + 0.6], z: [-0.6, 3.2], y: [-0.3, 1.4] },
};

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: (typeof FRAMES)['top']): [THREE.Vector3, THREE.Vector3] {
  const dir = new THREE.Vector3(...f.dir).normalize();
  const target = new THREE.Vector3((f.x[0] + f.x[1]) / 2, 0.4, (f.z[0] + f.z[1]) / 2);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of f.x) for (const y of f.y) for (const z of f.z) corners.push(new THREE.Vector3(x, y, z));
  const v = new THREE.Vector3();
  let d = 4;
  for (; d < 260; d *= 1.04) {
    cam.position.copy(target).addScaledVector(dir, d);
    cam.lookAt(target);
    cam.updateMatrixWorld();
    if (corners.every((p) => (v.copy(p).project(cam), Math.abs(v.x) < 0.92 && Math.abs(v.y) < 0.86))) break;
  }
  return [target.clone().addScaledVector(dir, d), target];
}

function CameraRig({ frame }: { frame: Cam1 }) {
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
  }, [frame, controls, camera, invalidate, aspect]);
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

function Scene({ chip, xray, group, frame }: { chip: ChipKind; xray: boolean; group: PinGroup; frame: Cam1 }) {
  const lit = useLit();
  const setHover = useStage((s) => s.setHover);
  const is = (id: string) => lit.includes(id);
  const id = `chip_${chip}`;
  // strips: the hovered / lit ones, the group's pins, and every pin's strip whose pin is lit
  const strips = new Set(lit.filter((k) => /^strip_/.test(k)));
  if (group !== 'all') pinsOf(chip, group).forEach((p) => strips.add(pinStrip(p)));
  ALL_PINS.forEach((p) => is(pinId(chip, p)) && strips.add(pinStrip(p)));
  const vcc = vccPin(chip);
  const vccLit = is('rail_vcc') || is(pinId(chip, vcc)) || is('bench_psu');
  const veeLit = is('rail_vee') || is(pinId(chip, VEE_PIN)) || is('bench_psu');
  const rails = [...lit];
  if (is('bench_psu')) rails.push('rail_vcc', 'rail_gnd', 'rail_vee');
  if (is(pinId(chip, vcc))) rails.push('rail_vcc');
  if (is(pinId(chip, VEE_PIN))) rails.push('rail_vee');
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
  const vccCol = lm358Pin(CHIP_C0, vcc).col;
  const veeCol = lm358Pin(CHIP_C0, VEE_PIN).col;
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Clips lit={[...strips]} />
      <Shell xray={xray ? 0.85 : 0} />
      <TrenchGlow on={is('center_trench') || is(id)} />
      <SurfaceGlow lit={[...strips]} />
      <RailGlow lit={rails} />
      <RailTags lit={rails} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerMove={move} onPointerOut={leave} visible={false}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <BenchSupply lit={is('bench_psu')} />
      <Jumper from={`a${vccCol}`} to={`T+${vccCol}`} color="red" lit={vccLit} ids={[pinId(chip, vcc), 'rail_vcc']} />
      <Jumper from={`j${veeCol}`} to={`B-${veeCol}`} color="blue" lit={veeLit} ids={[pinId(chip, VEE_PIN), 'rail_vee']} />
      {chip === 'lm358' ? <Lm358 c0={CHIP_C0} id="chip_lm358" tag="" pinNumbers={group === 'all'} /> : <Lm741 c0={CHIP_C0} id="chip_lm741" tag="" pinNumbers={group === 'all'} />}
      {/* the chip's name floats behind the e row, clear of the notch and the pin labels */}
      <Html position={[colX(CHIP_C0) + 1.5, 1.2, ROW_Z.c]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag chip w3-chip-tag ${is(id) ? 'w3-lit' : ''}`}>{chip === 'lm358' ? 'LM358 双运放' : 'LM741 单运放'}</div>
      </Html>
      <NotchMarks lit={lit} />
      <PinTags chip={chip} group={group} lit={lit} />
      <SwapPulse chip={chip} />
      <OrbitControls makeDefault enableDamping={false} minDistance={3} maxDistance={110} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig frame={frame} />
    </>
  );
}

/* ------------------------------------------------------------- the layer */

const GROUPS: { value: PinGroup; label: string; short: string }[] = [
  { value: 'all', label: '全部引脚', short: '全部' },
  { value: 'power', label: '电源脚', short: '电源' },
  { value: 'inputs', label: '输入脚', short: '输入' },
  { value: 'outputs', label: '输出脚', short: '输出' },
];

export default function ChipBench3D() {
  useClearHoverOnUnmount();
  const [chip, setChip] = useChip();
  const [xray, setXray] = useStageParam('xray1', false);
  const [group, setGroup] = useStageParam<PinGroup>('pins1', 'all');
  const [frame, setFrame] = useStageParam<Cam1>('cam1', 'iso');
  const on = useIsLit();
  const vcc = vccPin(chip);
  return (
    <div className="w3-layer">
      <div className="w3-dock">
        <Seg
          label="芯片"
          value={chip}
          onChange={setChip}
          tone="chip"
          options={[
            { value: 'lm358', label: 'LM358（双运放）', short: 'LM358', ids: ['chip_lm358'] },
            { value: 'lm741', label: 'LM741（单运放）', short: 'LM741', ids: ['chip_lm741'] },
          ]}
        />
        <Toggle on={xray} onChange={setXray} label="透视簧片与隔离沟" short="透视" ids={['center_trench']} />
        <Seg label="高亮引脚" value={group} onChange={setGroup} options={GROUPS} />
        <Seg
          label="镜头"
          value={frame}
          onChange={setFrame}
          options={[
            { value: 'top', label: '缺口朝上俯视', short: '俯视', ids: ['notch'] },
            { value: 'iso', label: '跨沟斜视（含电源）', short: '跨沟', ids: ['center_trench'] },
            { value: 'pin1', label: 'Pin 1 特写', short: 'Pin 1', ids: ['pin1_dot'] },
          ]}
        />
      </div>
      <div className="bb3d-wrap w3-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-10, 40, 36], fov: 38, near: 0.3, far: 400 }} className="bb3d-canvas">
          <Scene chip={chip} xray={xray} group={group} frame={frame} />
        </Canvas>
      </div>
      <div className="w3-pins" aria-label={`${CHIP_NAME[chip]} 引脚`}>
        {ALL_PINS.map((p) => {
          const info = PINS[chip][p];
          const pid = pinId(chip, p);
          const dim = group !== 'all' && !pinsOf(chip, group).includes(p);
          return (
            <div key={p} className={`w3-pin ${ROLE_CLASS[info.role]} ${dim ? 'dim' : ''} ${on(pid)}`} {...hoverProps([pid])} tabIndex={0} data-hl={pid}>
              <b>{p}</b>
              <span>{info.name}</span>
            </div>
          );
        })}
      </div>
      <p className={`w3-notice warn ${on(pinId(chip, vcc), 'rail_vcc')}`} role="note" {...hoverProps([pinId(chip, vcc), 'rail_vcc'])}>
        <span className="full">
          {CHIP_NAME[chip]} 的正电源 V+ 在 Pin {vcc}（另一颗在 Pin {chip === 'lm358' ? 7 : 8}）；两者 Pin 4 都接 −9 V。不改线直接互换，+9 V 会落在 LM358 的 OUT2 上
        </span>
        <span className="short">V+：LM358 = Pin 8，LM741 = Pin 7 · 严禁不改线互换</span>
      </p>
    </div>
  );
}
