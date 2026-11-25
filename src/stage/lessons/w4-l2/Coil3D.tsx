// Layer "02 3D 线圈磁通透视与右手定则": an enlarged solenoid inductor (Example 1.1: N turns on a
// core of radius 5 mm and length 40 mm). The pale-green epoxy sleeve with its colour bands peels
// off from the left with the 剥壳 slider (a clipping plane), showing the enamelled winding (a
// copper helix, one drawn turn per 10 real ones) on the core — air (μr = 1) or ferrite
// (μr = 200). Closed flux loops run through the core and back outside (denser with ferrite); red
// cones on the winding show the current, blue cones the field. The right-hand rule: four fingers
// curl with the current, the thumb points along B; flipping the current flips both.

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { EX11, fmtL, num, solenoidL } from './model';
import { Chip, hov, Seg, Slider, useClearHoverOnUnmount, useIsLit } from './state';
import { useStage, useStageParam } from '../../stageStore';

const AMBER = '#f59e0b';
const HALF = 5; // half length of the winding (scene units)
const RW = 1.18; // winding radius
const RC = 0.95; // core radius

function useHover3D(ids: string[]) {
  return {
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      useStage.getState().setHover(ids);
    },
    onPointerOut: () => useStage.getState().setHover(null),
  };
}

function Tube({
  curve,
  r,
  color,
  lit = false,
  seg = 200,
  closed = false,
  opacity = 1,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  r: number;
  color: string;
  lit?: boolean;
  seg?: number;
  closed?: boolean;
  opacity?: number;
}) {
  const geo = useMemo(() => new THREE.TubeGeometry(curve, seg, r, 8, closed), [curve, r, seg, closed]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        color={color}
        roughness={0.45}
        metalness={0.3}
        emissive={lit ? AMBER : '#000000'}
        emissiveIntensity={lit ? 0.55 : 0}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

class Helix extends THREE.Curve<THREE.Vector3> {
  turns: number;
  r: number;
  half: number;
  constructor(turns: number, r: number, half: number) {
    super();
    this.turns = turns;
    this.r = r;
    this.half = half;
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const th = 2 * Math.PI * this.turns * t;
    return target.set(-this.half + 2 * this.half * t, this.r * Math.cos(th), this.r * Math.sin(th));
  }
}

/** a cone at `p` pointing along `dir` */
function Arrow({ p, dir, color, s = 1, lit = false }: { p: THREE.Vector3; dir: THREE.Vector3; color: string; s?: number; lit?: boolean }) {
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), [dir]);
  return (
    <mesh position={p} quaternion={q}>
      <coneGeometry args={[0.22 * s, 0.55 * s, 14]} />
      <meshStandardMaterial color={color} emissive={lit ? AMBER : color} emissiveIntensity={lit ? 0.7 : 0.25} />
    </mesh>
  );
}

/** one closed flux loop in the plane at angle `phi` around the x axis: through the core, back outside */
function fluxCurve(rho: number, R: number, phi: number): THREE.CatmullRomCurve3 {
  const pts: [number, number][] = [
    [-5.2, rho],
    [0, rho],
    [5.2, rho],
    [6.7, rho + 0.9],
    [7.4, R * 0.6],
    [6.2, R],
    [0, R * 1.06],
    [-6.2, R],
    [-7.4, R * 0.6],
    [-6.7, rho + 0.9],
  ];
  return new THREE.CatmullRomCurve3(
    pts.map(([x, r]) => new THREE.Vector3(x, r * Math.cos(phi), r * Math.sin(phi))),
    true,
    'centripetal',
  );
}

function Flux({ ferrite, dir, lit }: { ferrite: boolean; dir: number; lit: boolean }) {
  const loops = useMemo(() => {
    const out: { c: THREE.CatmullRomCurve3; rho: number; R: number; phi: number }[] = [];
    const radii = ferrite ? [0.35, 0.6, 0.82] : [0.55];
    const outer = ferrite ? [2.6, 3.4, 4.2] : [3.3];
    const m = ferrite ? 6 : 4;
    radii.forEach((rho, k) => {
      for (let j = 0; j < m; j++) {
        const phi = (j / m) * 2 * Math.PI + k * 0.4;
        out.push({ c: fluxCurve(rho, outer[k], phi), rho, R: outer[k], phi });
      }
    });
    return out;
  }, [ferrite]);
  const hover = useHover3D(['flux']);
  return (
    <group {...hover}>
      {loops.map((l, i) => {
        const inside = new THREE.Vector3(1.6, l.rho * Math.cos(l.phi), l.rho * Math.sin(l.phi));
        const outside = new THREE.Vector3(0, l.R * 1.06 * Math.cos(l.phi), l.R * 1.06 * Math.sin(l.phi));
        return (
          <group key={`${ferrite}-${i}`}>
            <Tube curve={l.c} r={ferrite ? 0.045 : 0.035} color="#2563eb" lit={lit} seg={120} closed opacity={ferrite ? 0.9 : 0.55} />
            {i % 2 === 0 && <Arrow p={outside} dir={new THREE.Vector3(-dir, 0, 0)} color="#2563eb" s={0.7} lit={lit} />}
            {i % 3 === 0 && <Arrow p={inside} dir={new THREE.Vector3(dir, 0, 0)} color="#1d4ed8" s={0.6} lit={lit} />}
          </group>
        );
      })}
    </group>
  );
}

const BANDS: Record<'air' | 'ferrite', string[]> = {
  // 10 × 10 µH = 100 µH and 20 × 1000 µH = 20 mH, gold ±5 %
  air: ['#7a4a1f', '#151515', '#7a4a1f', '#d4a72c'],
  ferrite: ['#d62f2f', '#151515', '#f07a1a', '#d4a72c'],
};

function Shell({ peel, mu, lit }: { peel: number; mu: 'air' | 'ferrite'; lit: boolean }) {
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  plane.constant = -(-6.6 + 13.2 * peel);
  const hover = useHover3D(['shell']);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => invalidate(), [peel, invalidate]);
  if (peel >= 0.999) return null;
  const mat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => (
    <meshStandardMaterial
      color={color}
      roughness={0.55}
      clippingPlanes={[plane]}
      side={THREE.DoubleSide}
      emissive={lit ? AMBER : '#000000'}
      emissiveIntensity={lit ? 0.3 : 0}
      {...extra}
    />
  );
  return (
    <group {...hover}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[1.62, 9.6, 8, 32]} />
        {mat('#a8dcc0')}
      </mesh>
      {/* the slightly bulged ends */}
      {[-4.6, 4.6].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.78, 1.78, 1.5, 32]} />
          {mat('#a8dcc0')}
        </mesh>
      ))}
      {BANDS[mu].map((c, i) => (
        <mesh key={i} position={[-2.4 + i * 1.25 + (i === 3 ? 0.7 : 0), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.645, 1.645, 0.55, 32]} />
          {mat(c, { metalness: i === 3 ? 0.5 : 0 })}
        </mesh>
      ))}
    </group>
  );
}

function Rhr({ dir, lit }: { dir: number; lit: boolean }) {
  const hover = useHover3D(['rhr']);
  const y = 5.4;
  // fingers: an arc around the thumb's axis, turning the way the current turns
  const arc = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 40; k++) {
      const th = -0.3 + (k / 40) * 1.6 * Math.PI;
      pts.push(new THREE.Vector3(-1.8 * dir, y + 1.1 * Math.cos(th), 1.1 * Math.sin(th) * dir));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [dir]);
  const endT = arc.getPoint(1);
  const tan = arc.getTangent(1);
  const shaft = useMemo(() => new THREE.LineCurve3(new THREE.Vector3(-3 * dir, y, 0), new THREE.Vector3(2.6 * dir, y, 0)), [dir]);
  return (
    <group {...hover}>
      <Tube curve={shaft} r={0.16} color="#2563eb" lit={lit} seg={8} />
      <Arrow p={new THREE.Vector3(3 * dir, y, 0)} dir={new THREE.Vector3(dir, 0, 0)} color="#2563eb" s={1.5} lit={lit} />
      <Tube curve={arc} r={0.1} color="#dc2626" lit={lit} seg={60} />
      <Arrow p={endT} dir={tan} color="#dc2626" s={0.9} lit={lit} />
      <Html position={[0, y + 2.1, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w42-tag ${lit ? 'lit' : ''}`}>右手：四指 = 电流 i 方向 · 大拇指 = B</div>
      </Html>
    </group>
  );
}

function CurrentArrows({ turns, dir, lit }: { turns: number; dir: number; lit: boolean }) {
  const helix = useMemo(() => new Helix(turns, RW + 0.05, HALF), [turns]);
  const marks = useMemo(() => {
    const out: { p: THREE.Vector3; d: THREE.Vector3 }[] = [];
    // on the front of the winding (θ = π/2: facing the camera), every few turns
    const step = Math.max(1, Math.round(turns / 6));
    for (let k = 1; k < turns; k += step) {
      const t = (k + 0.25) / turns;
      const p = helix.getPoint(t).multiplyScalar(1);
      p.z += 0.25;
      out.push({ p, d: helix.getTangent(t).multiplyScalar(dir) });
    }
    return out;
  }, [helix, turns, dir]);
  return (
    <>
      {marks.map((m, i) => (
        <Arrow key={i} p={m.p} dir={m.d} color="#dc2626" s={0.7} lit={lit} />
      ))}
    </>
  );
}

function Leads() {
  const c1 = useMemo(() => new THREE.LineCurve3(new THREE.Vector3(-HALF - 2.6, 0, 0), new THREE.Vector3(-HALF - 0.2, RW * Math.cos(0), 0)), []);
  const c2 = useMemo(() => new THREE.LineCurve3(new THREE.Vector3(HALF + 0.2, RW, 0), new THREE.Vector3(HALF + 2.6, 0, 0)), []);
  const l1 = useMemo(() => new THREE.LineCurve3(new THREE.Vector3(-HALF - 2.6, 0, 0), new THREE.Vector3(-10.5, 0, 0)), []);
  const l2 = useMemo(() => new THREE.LineCurve3(new THREE.Vector3(HALF + 2.6, 0, 0), new THREE.Vector3(10.5, 0, 0)), []);
  return (
    <>
      {[c1, c2, l1, l2].map((c, i) => (
        <Tube key={i} curve={c} r={0.09} color="#b9bec4" seg={4} />
      ))}
    </>
  );
}

const VIEW = new THREE.Vector3(0.12, 0.42, 1).normalize();

function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const target = new THREE.Vector3(0, 1.4, 0);
    const vf = (camera.fov * Math.PI) / 180;
    const hf = 2 * Math.atan(Math.tan(vf / 2) * aspect);
    const d = Math.max(9.5 / Math.tan(hf / 2), 7.5 / Math.tan(vf / 2)) * 1.02;
    camera.position.copy(target).addScaledVector(VIEW, d);
    camera.lookAt(target);
    if (controls) {
      controls.target.copy(target);
      controls.update();
    }
    invalidate();
  }, [camera, controls, aspect, invalidate]);
  return null;
}

function Scene({ peel, mu, N, dir }: { peel: number; mu: 'air' | 'ferrite'; N: number; dir: number }) {
  const isLit = useIsLit();
  const ferrite = mu === 'ferrite';
  const turns = Math.max(5, Math.round(N / 10));
  const helix = useMemo(() => new Helix(turns, RW, HALF), [turns]);
  const wire = Math.min(0.13, (HALF * 2) / turns / 2.6);
  const coilHover = useHover3D(['coil']);
  const coreHover = useHover3D(['core']);
  const dimHover = useHover3D(['coil_dim']);
  const dimCurve = useMemo(() => new THREE.LineCurve3(new THREE.Vector3(-HALF, -2.7, 0), new THREE.Vector3(HALF, -2.7, 0)), []);
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 1.0]} />
      <directionalLight position={[8, 14, 12]} intensity={1.2} />
      <directionalLight position={[-10, 6, -8]} intensity={0.4} />
      <group {...coreHover}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[RC, RC, HALF * 2 + 0.8, 32]} />
          {ferrite ? (
            <meshStandardMaterial color="#4a4e57" roughness={0.85} emissive={isLit('core') ? AMBER : '#000000'} emissiveIntensity={isLit('core') ? 0.35 : 0} />
          ) : (
            <meshStandardMaterial color="#cbd5e1" transparent opacity={isLit('core') ? 0.45 : 0.18} depthWrite={false} />
          )}
        </mesh>
      </group>
      <group {...coilHover}>
        <Tube curve={helix} r={wire} color="#c8742c" lit={isLit('coil')} seg={Math.max(200, turns * 24)} />
      </group>
      <CurrentArrows turns={turns} dir={dir} lit={isLit('coil')} />
      <Leads />
      <Flux ferrite={ferrite} dir={dir} lit={isLit('flux')} />
      <Shell peel={peel} mu={mu} lit={isLit('shell')} />
      <Rhr dir={dir} lit={isLit('rhr')} />
      <group {...dimHover}>
        <Tube curve={dimCurve} r={0.05} color="#475569" seg={4} lit={isLit('coil_dim')} />
      </group>
      <Html position={[0, -3.4, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w42-tag ${isLit('coil_dim') ? 'lit' : ''}`}>线圈长度 ℓ = 40 mm · 截面 A = πr²（r = 5 mm）</div>
      </Html>
      <Html position={[-8.6, -1.6, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w42-tag ${isLit('core') ? 'lit' : ''}`}>{ferrite ? '铁氧体磁芯 μr = 200' : '空气芯 μr = 1'}</div>
      </Html>
      <Html position={[8.4, -1.6, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w42-tag ${isLit('coil') ? 'lit' : ''}`}>N = {N} 匝漆包线</div>
      </Html>
      <Html position={[7.6, 3.6, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bb3d-tag w42-tag flux ${isLit('flux') ? 'lit' : ''}`}>闭合磁力线 Φ</div>
      </Html>
      <OrbitControls makeDefault enableDamping={false} enablePan={false} minDistance={8} maxDistance={70} />
      <Rig />
    </>
  );
}

export default function Coil3D() {
  useClearHoverOnUnmount();
  const [peel, setPeel] = useStageParam('peel', 0.55);
  const [mu, setMu] = useStageParam<'air' | 'ferrite'>('mu', 'ferrite');
  const [N, setN] = useStageParam<number>('N', EX11.N);
  const [dir, setDir] = useStageParam('idir', 1);
  const isLit = useIsLit();
  const mur = mu === 'ferrite' ? EX11.murFerrite : 1;
  const L = solenoidL(N, EX11.r, EX11.len, mur);
  const ratio = (N / EX11.N) ** 2;
  return (
    <div className="w42-layer">
      <div className="w42-ctrl">
        <div className="w42-row">
          <Slider label="剥壳" value={Math.round(peel * 100)} min={0} max={100} step={5} unit="%" onChange={(v) => setPeel(v / 100)} hover={['shell']} />
          <Slider label="匝数 N" value={N} min={50} max={400} step={10} unit="匝" onChange={setN} hover={['coil']} />
        </div>
        <div className="w42-row">
          <Seg
            label="磁芯"
            value={mu}
            onChange={setMu}
            options={[
              { value: 'air', label: '空气芯 μr = 1', short: '空气', hover: ['core'] },
              { value: 'ferrite', label: '铁氧体 μr = 200', short: '铁氧体', hover: ['core', 'flux'] },
            ]}
          />
          <Seg
            label="电流方向"
            value={String(dir)}
            onChange={(v) => setDir(Number(v))}
            options={[
              { value: '1', label: '电流正向', short: '正向', hover: ['rhr'] },
              { value: '-1', label: '电流反向', short: '反向', hover: ['rhr'] },
            ]}
          />
        </div>
      </div>
      <div className="bb3d-wrap w42-coil">
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ position: [2, 8, 22], fov: 38, near: 0.5, far: 300 }}
          className="bb3d-canvas"
          onCreated={({ gl }) => {
            gl.localClippingEnabled = true;
          }}
        >
          <Scene peel={peel} mu={mu} N={N} dir={dir} />
        </Canvas>
      </div>
      <div className="w42-chips">
        <Chip ids={['coil', 'core', 'coil_dim']} k="L = N²μ₀μᵣA/ℓ" v={fmtL(L)} tone="good" />
        <Chip ids={['coil']} k={`N/200 = ${num(N / EX11.N, 2)} → L ×`} v={num(ratio, 2)} />
        <span className={`w42-chip ${isLit('core') ? 'lit' : ''}`} tabIndex={0} {...hov(['core'])}>
          <span>{mu === 'ferrite' ? '铁氧体：同一线圈 L ×200' : '空气芯：插入铁氧体后 L ×200'}</span>
        </span>
      </div>
    </div>
  );
}
