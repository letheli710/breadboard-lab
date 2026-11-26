// Layer "03 3D 面包板插 RC 放电实操": the breadboard lab of act 6 on an 830-hole board, upper half.
// Rails: top + (red) = +5 V, top − (blue) = GND, fed by the 台式可调直流电源（5 V） standing on the
// bench behind the board's left end (red lead + → T+3, black lead − → T−4).
// An SPDT slide switch has its pins in c20 (left throw), c21 (common) and c22 (right throw):
// a20 → +5 V rail (red jumper, T+19) — slide left: charge C straight from 5 V;
// the 100 µF / 16 V electrolytic stands with its long + leg in a21 (the common strip) and its
// − leg (stripe side) in the GND rail (T−22);
// the 10 kΩ resistor (brown-black-orange-gold) e22 → e27, and a27 → GND rail (black jumper, T−28)
// — slide right: C discharges through R, τ = RC = 1.0 s.
// The virtual oscilloscope leans back on a stand in front of the board: CH1 hook on the capacitor's
// + leg, the ground clip on its − leg; its screen draws v_C(t) live (the play button / a click on
// the switch starts t = 0). The supply and the scope are the shared bench instruments
// (src/stage/bench). "反插" swaps the capacitor's legs: the stage warns and will not run.

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { colX, RAIL_Z, ROW_Z, Shell } from '../../BreadboardXray';
import { BenchSupply, hoverHandlers, Oscilloscope, PROBE_COLORS, ProbeLead, toWorld, useAnyLit, type OsdItem, type ScopeChannel, type V3 } from '../../bench';
import { COLOR_BY_KEY } from '../../colorCode';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { fmtP, fmtT, LAB, P_RATED, rc, SUPPLY_NAME } from './model';
import { hov, Seg, startPlay, stopPlay, T_MAX, useClearHoverOnUnmount, useIsLit, usePlay, useTime, type Sw } from './state';

/* ------------------------------------------------------------- holes and hover */

/** board coordinates of a hole: "c21"; rails "T+19" (+5 V) and "T-22" (GND) */
function hole(h: string): [number, number] {
  const m = /^T([+-])(\d+)$/.exec(h);
  if (m) return [colX(Number(m[2])), m[1] === '+' ? RAIL_Z.tp : RAIL_Z.tn];
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

const AMBER = '#f59e0b';
const WIRE = { red: '#d62f2f', black: '#24262b', yellow: '#e0b419', grey: '#8a9099' } as const;

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

function Tag({ at, text, cls = '', lit = false, ids }: { at: V3; text: string; cls?: string; lit?: boolean; ids?: string[] }) {
  return (
    <Html position={at} center zIndexRange={[20, 0]} style={{ pointerEvents: ids ? 'auto' : 'none' }}>
      <div className={`bb3d-tag w44-tag ${cls} ${lit ? 'lit' : ''}`} {...(ids ? hov(ids) : {})}>
        {text}
      </div>
    </Html>
  );
}

/* ------------------------------------------------------------- parts */

const BANDS_10K = ['brown', 'black', 'orange', 'gold'].map((k) => COLOR_BY_KEY.get(k)!.hex);
const bandX = (len: number, n: number, i: number) => -len / 2 + 0.36 + i * 0.3 + (i === n - 1 ? 0.26 : 0);

/** the 10 kΩ axial resistor e22 → e27, body raised over the row */
function Resistor10k({ lit }: { lit: boolean }) {
  const hover = useHover3D(['res']);
  const [x1, z] = hole('e22');
  const [x2] = hole('e27');
  const h = 1.1;
  const mx = (x1 + x2) / 2;
  const len = 2.4;
  const leads = useMemo<V3[][]>(
    () => [
      [
        [x1, -0.3, z],
        [x1, h * 0.7, z],
        [mx - len / 2, h, z],
      ],
      [
        [x2, -0.3, z],
        [x2, h * 0.7, z],
        [mx + len / 2, h, z],
      ],
    ],
    [x1, x2, z, mx],
  );
  return (
    <group name="res">
      <Tube pts={leads[0]} color="#b9bec4" r={0.07} />
      <Tube pts={leads[1]} color="#b9bec4" r={0.07} />
      <group position={[mx, h, z]} {...hover}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.36, len - 0.72, 6, 16]} />
          <meshStandardMaterial color="#e6cc9a" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.45 : 0} />
        </mesh>
        {BANDS_10K.map((c, i) => (
          <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[bandX(len, 4, i), 0, 0]}>
            <cylinderGeometry args={[0.375, 0.375, 0.13, 18]} />
            <meshStandardMaterial color={c} roughness={0.5} metalness={i === 3 ? 0.5 : 0} />
          </mesh>
        ))}
        <mesh visible={false}>
          <boxGeometry args={[len + 0.4, 1.1, 1.1]} />
        </mesh>
      </group>
    </group>
  );
}

/** the 100 µF radial electrolytic: + leg in a21, − leg (stripe side) in the GND rail; `rev` swaps them */
const CAP_PLUS = 'a21';
const CAP_MINUS = 'T-22';
const CAP_R = 1.24;
const CAP_H = 4.3;
function Electrolytic({ rev, lit, v }: { rev: boolean; lit: boolean; v: number }) {
  const hover = useHover3D(['cap']);
  const [xa, za] = hole(CAP_PLUS);
  const [xb, zb] = hole(CAP_MINUS);
  const cx = (xa + xb) / 2;
  const cz = (za + zb) / 2;
  const y0 = 1.3;
  // the long + leg and the short − leg (both end in the board); `rev` puts + into the rail
  const [px, pz, nx, nz] = rev ? [xb, zb, xa, za] : [xa, za, xb, zb];
  const legs = useMemo<V3[][]>(
    () => [
      [
        [px, -0.3, pz],
        [px, 0.6, pz],
        [cx + (px - cx) * 0.3, y0, cz + (pz - cz) * 0.3],
      ],
      [
        [nx, -0.3, nz],
        [nx, 0.5, nz],
        [cx + (nx - cx) * 0.3, y0, cz + (nz - cz) * 0.3],
      ],
    ],
    [px, pz, nx, nz, cx, cz],
  );
  // the stripe faces the − leg
  const ang = Math.atan2(nx - cx, nz - cz);
  const warm = Math.min(1, v / LAB.v0);
  return (
    <group name="cap">
      <Tube pts={legs[0]} color="#c3c8ce" r={0.06} />
      <Tube pts={legs[1]} color="#c3c8ce" r={0.06} />
      <group position={[cx, y0 + CAP_H / 2, cz]} {...hover}>
        <mesh>
          <cylinderGeometry args={[CAP_R, CAP_R, CAP_H, 28]} />
          <meshStandardMaterial
            color={rev ? '#9f1239' : '#1d3f8f'}
            roughness={0.45}
            emissive={lit ? AMBER : rev ? '#e11d48' : '#2563eb'}
            emissiveIntensity={lit ? 0.45 : rev ? 0.35 : 0.12 + 0.25 * warm}
          />
        </mesh>
        <mesh position={[Math.sin(ang) * CAP_R * 0.98, 0, Math.cos(ang) * CAP_R * 0.98]} rotation={[0, ang, 0]}>
          <boxGeometry args={[0.7, CAP_H * 0.96, 0.06]} />
          <meshStandardMaterial color="#e8edf5" roughness={0.5} />
        </mesh>
        <mesh position={[0, CAP_H / 2 + 0.01, 0]}>
          <cylinderGeometry args={[CAP_R * 0.92, CAP_R * 0.92, 0.04, 28]} />
          <meshStandardMaterial color="#b7bdc6" metalness={0.7} roughness={0.35} />
        </mesh>
      </group>
    </group>
  );
}

/** the SPDT slide switch: pins c20 (left), c21 (common), c22 (right); click toggles */
function SlideSwitch({ sw, lit, onToggle, disabled }: { sw: Sw; lit: boolean; onToggle: () => void; disabled: boolean }) {
  const hover = useHover3D(['spdt']);
  const [x, z] = hole('c21');
  const knob = sw === 'charge' ? -0.55 : 0.55;
  return (
    <group name="spdt">
      {[20, 21, 22].map((c) => (
        <mesh key={c} position={[colX(c), 0.1, z]}>
          <boxGeometry args={[0.16, 0.8, 0.16]} />
          <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <group
        {...hover}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onToggle();
        }}
      >
        <mesh position={[x, 0.75, z]}>
          <boxGeometry args={[3.4, 1.0, 1.5]} />
          <meshStandardMaterial color="#2b2f36" roughness={0.6} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.4 : 0} />
        </mesh>
        <mesh position={[x, 1.28, z]}>
          <boxGeometry args={[2.6, 0.06, 0.5]} />
          <meshStandardMaterial color="#111418" />
        </mesh>
        <mesh position={[x + knob, 1.6, z]}>
          <boxGeometry args={[0.9, 0.7, 0.55]} />
          <meshStandardMaterial color={sw === 'charge' ? '#d62f2f' : '#15803d'} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- instruments (src/stage/bench) */

/** the 5 V supply behind the board's left end */
const SUPPLY_AT: [number, number] = [-22, -19];

function Supply({ sw }: { sw: Sw }) {
  const channels = useMemo(() => [{ v: LAB.v0, readout: `0.00 mA · ${sw === 'charge' ? 'C 已充满' : '开关已断开电源支路'}` }], [sw]);
  return (
    <BenchSupply
      id="supply"
      position={SUPPLY_AT}
      channels={channels}
      litIds={['rail_p']}
      leads={[
        { from: '+', to: 'T+3', litIds: ['rail_p'] },
        { from: '-', to: 'T-4', litIds: ['gnd'] },
      ]}
    />
  );
}

/**
 * The virtual oscilloscope leans back on a stand in front of the board, so its screen faces the
 * camera: the shared scope at half size inside a group turned by −SCOPE_TILT about x. Its probe
 * would turn with it, so the CH1 probe is drawn outside the group, cabled to the jack's world point.
 */
const SCOPE_POS: V3 = [5, 1.5, 15];
const SCOPE_SCALE = 0.5;
const SCOPE_TILT = 0.55;
/** a point of the scope's own frame (the group's, before the tilt) in world space */
function tilted([x, y, z]: V3): V3 {
  const c = Math.cos(SCOPE_TILT);
  const s = Math.sin(SCOPE_TILT);
  return [SCOPE_POS[0] + x, SCOPE_POS[1] + y * c + z * s, SCOPE_POS[2] - y * s + z * c];
}
/** the CH1 jack (as the shared scope places it) and the direction it faces */
const JACK = tilted(toWorld({ position: [0, 0], scale: SCOPE_SCALE }, [6.6, 1.6, 3.8]));
const JACK_OUT: V3 = [0, Math.sin(SCOPE_TILT), Math.cos(SCOPE_TILT)];

/** v_C on the screen: 5 V before t = 0, then 5 e^(−t) (τ = 1 s); 0.8 V/div with 0 V near the bottom (5 V
 *  stays clear of the readout line over the screen's top), a thick trace for the half-size screen */
const CH1: ScopeChannel = { data: (t) => (t < 0 ? LAB.v0 : LAB.v0 * Math.exp(-t)), vdiv: 0.8, pos: -3.6, width: 16 };
/** −0.6 … 6 s across the screen; the sweep has run up to t = tn */
const TIME = { div: (T_MAX + 0.6) / 10, start: -0.6 };

function Scope({ sw, tn, rev }: { sw: Sw; tn: number; rev: boolean }) {
  const v = sw === 'charge' ? LAB.v0 : rev ? NaN : LAB.v0 * Math.exp(-tn);
  const upto = sw === 'discharge' && !rev ? tn : 0;
  const osd: OsdItem[] = [
    { text: `CH1 ${Number.isNaN(v) ? '----' : v.toFixed(v < 0.1 ? 3 : 2)} V`, tone: rev ? 'warn' : 'ch1' },
    { text: sw === 'charge' ? 't < 0' : `t = ${tn.toFixed(2)} s`, tone: rev ? 'warn' : undefined },
  ];
  return (
    <group name="scope">
      <group position={SCOPE_POS} rotation={[-SCOPE_TILT, 0, 0]}>
        <Oscilloscope
          id="scope"
          position={[0, 0]}
          scale={SCOPE_SCALE}
          ch1={CH1}
          time={TIME}
          progress={(upto - TIME.start) / (10 * TIME.div)}
          osd={osd}
          label="虚拟数字示波器"
          litIds={['curve']}
        />
      </group>
      {/* the stand under the front edge */}
      <mesh position={[SCOPE_POS[0], -0.2, SCOPE_POS[2] + 0.5]} {...hoverHandlers(['scope'])}>
        <boxGeometry args={[11, 1.6, 3]} />
        <meshStandardMaterial color="#9aa3ae" roughness={0.7} />
      </mesh>
    </group>
  );
}

/** the CH1 hook on the + leg and the ground clip on the − leg, cabled to the scope's jack */
function Probe({ rev }: { rev: boolean }) {
  const lit = useAnyLit(['probe', 'scope']);
  const [xa, za] = hole(CAP_PLUS);
  const [xb, zb] = hole(CAP_MINUS);
  // the hook sits on the + leg just outside the can, the clip hangs on the − leg
  const tip: [number, number] = rev ? [xb, zb - 0.35] : [xa, za + 0.35];
  const gnd: V3 = rev ? [xa + 0.15, 0.9, za] : [xb + 0.15, 0.9, zb];
  return <ProbeLead jack={JACK} out={JACK_OUT} tip={tip} color={PROBE_COLORS.ch1} id="probe" lit={lit} ground={gnd} groundId="probe" groundLit={lit} />;
}

/* ------------------------------------------------------------- glow on lit strips and rails */

function Glow({ lit }: { lit: string[] }) {
  const has = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const quads: { x: number; z: number; w: number; d: number; color: string }[] = [];
  const strip = (c: number, color = AMBER) => quads.push({ x: colX(c), z: -3.5, w: 0.86, d: 5.0, color });
  const rail = (z: number, color: string) => quads.push({ x: (colX(3) + colX(61)) / 2, z, w: colX(61) - colX(3) + 1.2, d: 0.86, color });
  if (has('rail_p', 'supply')) {
    rail(RAIL_Z.tp, '#ff4d5e');
    strip(20, '#ff4d5e');
  }
  if (has('gnd', 'supply')) rail(RAIL_Z.tn, '#4f86ff');
  if (has('v_node', 'cap', 'probe')) strip(21);
  if (has('res', 'i_r')) {
    strip(22);
    strip(27);
  }
  if (has('spdt')) [20, 21, 22].forEach((c) => strip(c));
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

export type BenchCam = 'bench' | 'circuit' | 'scope' | 'supply';
const VIEW_DIR = new THREE.Vector3(0, 1.55, 1).normalize();
const FRAMES: Record<BenchCam, { x: [number, number]; z: [number, number] }> = {
  bench: { x: [-27, 12], z: [-22, 17] },
  circuit: { x: [-15, -3], z: [-11, 0] },
  scope: { x: [-15, 12], z: [-11, 17] },
  supply: { x: [-27, -8], z: [-22, -6] },
};

function fitView(camera: THREE.PerspectiveCamera, aspect: number, f: (typeof FRAMES)[BenchCam]): { pos: THREE.Vector3; target: THREE.Vector3 } {
  const target = new THREE.Vector3((f.x[0] + f.x[1]) / 2, 0.5, (f.z[0] + f.z[1]) / 2);
  const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.5, 400);
  const corners: THREE.Vector3[] = [];
  for (const x of f.x) for (const y of [-1, 5]) for (const z of f.z) corners.push(new THREE.Vector3(x, y, z));
  const v = new THREE.Vector3();
  let d = 10;
  for (; d < 300; d *= 1.04) {
    cam.position.copy(target).addScaledVector(VIEW_DIR, d);
    cam.lookAt(target);
    cam.updateMatrixWorld();
    if (corners.every((c) => (v.copy(c).project(cam), Math.abs(v.x) < 0.95 && Math.abs(v.y) < 0.88))) break;
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

/** re-render the demand-driven canvas when the time moves */
function Invalidate({ tn, sw }: { tn: number; sw: Sw }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => invalidate(), [tn, sw, invalidate]);
  return null;
}

/* ------------------------------------------------------------- the scene */

function RailTag({ z, text, cls }: { z: number; text: string; cls: string }) {
  return (
    <Html position={[colX(1) - 1.8, 0.4, z]} center zIndexRange={[19, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`w44-railtag ${cls}`}>{text}</div>
    </Html>
  );
}

function Scene({ sw, tn, rev, view, toggle }: { sw: Sw; tn: number; rev: boolean; view: BenchCam; toggle: () => void }) {
  const lit = useLit();
  const isLit = (...ids: string[]) => ids.some((id) => lit.includes(id));
  const v = sw === 'charge' ? LAB.v0 : 5 * Math.exp(-tn);
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <mesh position={[-6, -1.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[130, 80]} />
        <meshStandardMaterial color="#e8dcc4" roughness={0.95} />
      </mesh>
      <Shell xray={0} />
      <Glow lit={lit} />
      <RailTag z={RAIL_Z.tp} text="+5 V" cls="p" />
      <RailTag z={RAIL_Z.tn} text="GND" cls="g" />
      <Supply sw={sw} />
      <Jumper from="a20" to="T+19" color="red" lit={isLit('rail_p', 'spdt')} />
      <SlideSwitch sw={sw} lit={isLit('spdt', 'sw')} onToggle={toggle} disabled={rev} />
      <Electrolytic rev={rev} lit={isLit('cap', 'v_node')} v={v} />
      <Resistor10k lit={isLit('res', 'i_r')} />
      <Jumper from="a27" to="T-28" color="black" lit={isLit('gnd', 'res')} />
      <Probe rev={rev} />
      <Scope sw={sw} tn={tn} rev={rev} />
      <Tag at={[colX(21), 2.7, ROW_Z.c + 1.6]} text={sw === 'charge' ? 'SPDT · 左拨充电' : 'SPDT · 右拨放电'} cls={`part ${sw}`} lit={isLit('spdt')} ids={['spdt']} />
      <Tag at={[colX(24.5), 2.4, ROW_Z.e + 1.4]} text="R 10 kΩ（棕黑橙金）" cls="part" lit={isLit('res')} />
      <Tag at={[colX(16.5), 4.6, -7]} text={rev ? '电解电容反插！' : 'C 100 µF / 16 V'} cls={`part ${rev ? 'bad' : ''}`} lit={isLit('cap')} />
      <OrbitControls makeDefault enableDamping={false} minDistance={8} maxDistance={150} maxPolarAngle={Math.PI * 0.47} />
      <CameraRig view={view} />
      <Invalidate tn={tn} sw={sw} />
    </>
  );
}

/* ------------------------------------------------------------- HUD and layer */

const CAMS: { value: BenchCam; label: string; short: string }[] = [
  { value: 'bench', label: '全景', short: '全景' },
  { value: 'circuit', label: '电路特写', short: '电路' },
  { value: 'scope', label: '电路 + 示波器', short: '示波器' },
  { value: 'supply', label: '电源', short: '电源' },
];

export default function Bench3D() {
  useClearHoverOnUnmount();
  const { sw, tn, setSw } = useTime();
  const { playing } = usePlay();
  const [pol, setPol] = useStageParam<'ok' | 'rev'>('pol', 'ok');
  const [view, setView] = useStageParam<BenchCam>('cam', 'bench');
  const isLit = useIsLit();
  const rev = pol === 'rev';
  const a = rc(LAB.v0, LAB.r, LAB.c);
  const t = tn * a.tau;
  const v = sw === 'charge' ? LAB.v0 : a.v(t);
  const pR = sw === 'charge' ? 0 : (v * v) / LAB.r;
  const toggle = () => {
    if (sw === 'charge') startPlay();
    else {
      stopPlay();
      setSw('charge');
    }
  };
  return (
    <div className="w44-layer">
      <div className="w44-ctrl">
        <div className="w44-row scroll">
          <Seg<Sw>
            label="SPDT 开关"
            value={sw}
            onChange={(s) => {
              if (s === sw) return;
              if (rev) return;
              toggle();
            }}
            options={[
              { value: 'charge', label: '左拨：接 5 V 充电', short: '左拨充电', hover: ['spdt', 'rail_p'] },
              { value: 'discharge', label: '右拨：经 10 kΩ 放电', short: '右拨放电', hover: ['spdt', 'res'] },
            ]}
          />
          <button className={`w44-play ${playing ? 'on' : ''}`} disabled={rev} onClick={() => (playing ? stopPlay() : startPlay())}>
            {playing ? '暂停' : '▶ 从 t = 0 放电'}
          </button>
          <Seg<'ok' | 'rev'>
            label="电解电容插法"
            value={pol}
            onChange={(p) => {
              stopPlay();
              setPol(p);
            }}
            options={[
              { value: 'ok', label: '长脚（+）接开关公共端', short: '极性正确', hover: ['cap'] },
              { value: 'rev', label: '反插（演示错误）', short: '反插', tone: 'bad', hover: ['cap'] },
            ]}
          />
          <Seg<BenchCam> label="视角" value={view} onChange={setView} options={CAMS} />
        </div>
      </div>
      <div className="bb3d-wrap w44-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [-10, 50, 40], fov: 38, near: 0.5, far: 500 }} className="bb3d-canvas">
          <Scene sw={sw} tn={tn} rev={rev} view={view} toggle={toggle} />
        </Canvas>
        <div className="w44-hud">
          <div className={`w44-reading ${isLit('scope', 'probe')}`} aria-live="polite" tabIndex={0} {...hov(['scope'])}>
            <span>示波器 CH1 · v_C</span>
            <b>{rev ? '反插：停止实验' : sw === 'charge' ? '5.00 V（t < 0）' : `${v.toFixed(v < 0.1 ? 3 : 2)} V @ ${fmtT(t)}`}</b>
          </div>
          <div className={`w44-reading supply ${isLit('supply')}`} tabIndex={0} {...hov(['supply'])}>
            <span>{SUPPLY_NAME}</span>
            <b>+5.00 V · 0.00 mA</b>
          </div>
          <div className={`w44-reading power ${isLit('safety', 'res')}`} tabIndex={0} {...hov(['safety'])}>
            <span>R 功耗（额定 {P_RATED * 1000} mW）</span>
            <b>{fmtP(pR)}</b>
          </div>
        </div>
      </div>
      <span className={`w44-notice ${rev ? 'bad' : ''} ${isLit('safety')}`} tabIndex={0} {...hov(rev ? ['cap'] : ['safety'])}>
        {rev
          ? '电解电容反插：长脚（+）必须接开关公共端、白色条纹（−）接 GND。反向加压会漏电发热甚至鼓包，先断电改正极性。'
          : '面包板安全参数：5 V / 10 kΩ / 100 µF，τ = RC = 1.0 s；峰值电流 0.5 mA、电阻功耗 2.5 mW、储能 1.25 mJ。理论例题的 4.5 Ω / 0.2 F 不可直接上板。'}
      </span>
    </div>
  );
}
