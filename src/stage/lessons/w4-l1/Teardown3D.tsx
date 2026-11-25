// Layer "02 3D 平行板剥壳与电场储能透视": a parallel-plate capacitor with its coating peeled off.
// Sliders set the plate area A, the gap d and the applied voltage v; a switch picks the dielectric
// (air 1 / polyester 3 / mica 5 / ceramic 1000). Live: C = ε_r ε_0 A / d, the plate charges ±q
// (how many dots ∝ q = Cv, on a log scale), the field lines (how many ∝ E = v/d), the dielectric's
// dipoles turning into the field, and the elastic-membrane water-tank analogy in the corner
// (the membrane bulges with q). The drawing's sizes are schematic (A and d are not to scale).

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { A_RANGE, D_RANGE, DIELECTRICS, erOf, EX1, fmtC, fmtE, fmtQ, fmtW, plateC, teardown, V_RANGE, type DielectricKey } from './model';
import { Cell, hoverProps, Seg, Slider, useClearHoverOnUnmount, useIsLit } from './state';

const AMBER = '#f59e0b';
/** q at the reference set-up (air, 20 cm², 1 mm, 5 V): the dot counts and the membrane scale to it */
const Q_REF = plateC(1, EX1.A, EX1.d) * 5;
const E_REF = 5 / 1e-3;

const SLAB: Record<DielectricKey, { color: string; opacity: number }> = {
  air: { color: '#dbeafe', opacity: 0.12 },
  polyester: { color: '#fcd34d', opacity: 0.32 },
  mica: { color: '#e9d5ff', opacity: 0.42 },
  ceramic: { color: '#d6a35c', opacity: 0.5 },
};
const DIPOLE_GRID: Record<DielectricKey, number> = { air: 0, polyester: 2, mica: 3, ceramic: 4 };

const hover3d = (ids: string[]) => ({
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    useStage.getState().setHover(ids);
  },
  onPointerOut: () => useStage.getState().setHover(null),
});

function grid(n: number, s: number): [number, number][] {
  if (n <= 0) return [];
  const out: [number, number][] = [];
  const step = s / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out.push([-s / 2 + step * (i + 0.5), -s / 2 + step * (j + 0.5)]);
  return out;
}

/** a fixed pseudo-random tilt per dipole, so the picture does not jitter */
const tiltOf = (k: number) => [Math.sin(k * 12.9898) * 1.4, Math.cos(k * 78.233) * 1.4] as const;

function Plates({ s, g, er, key_, v, q, E, peel }: { s: number; g: number; er: number; key_: DielectricKey; v: number; q: number; E: number; peel: boolean }) {
  const litIds = useLit();
  const lit = (...ids: string[]) => ids.some((id) => litIds.includes(id));
  const T = 0.3;
  const yTop = g / 2 + T / 2;
  const yBot = -g / 2 - T / 2;
  const nq = v <= 0 ? 0 : Math.min(9, Math.max(2, Math.round(2 + 2.3 * Math.log2(1 + q / Q_REF))));
  const nE = v <= 0 ? 0 : Math.min(7, Math.max(1, Math.round(1 + 3 * Math.sqrt(E / E_REF))));
  const nd = DIPOLE_GRID[key_];
  const align = v / V_RANGE[1];
  const slab = SLAB[key_];
  const charges = grid(nq, s * 0.9);
  const lines = grid(nE, s * 0.8);
  const dipoles = grid(nd, s * 0.78);
  const plateMat = (on: boolean, c: string) => (
    <meshStandardMaterial color={c} metalness={0.55} roughness={0.35} emissive={on ? AMBER : '#000000'} emissiveIntensity={on ? 0.45 : 0} />
  );
  return (
    <group>
      {/* leads */}
      <mesh position={[0, yTop + 2.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
        <meshStandardMaterial color="#b9bec4" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, yBot - 2.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
        <meshStandardMaterial color="#b9bec4" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, yTop, 0]} {...hover3d(['plate_top'])}>
        <boxGeometry args={[s, T, s]} />
        {plateMat(lit('plate_top', 'area_a'), '#e8a0a0')}
      </mesh>
      <mesh position={[0, yBot, 0]} {...hover3d(['plate_bot'])}>
        <boxGeometry args={[s, T, s]} />
        {plateMat(lit('plate_bot', 'area_a'), '#9fb6e8')}
      </mesh>
      {/* the dielectric slab */}
      <mesh position={[0, 0, 0]} {...hover3d(['dielectric'])}>
        <boxGeometry args={[s * 0.97, g * 0.96, s * 0.97]} />
        <meshStandardMaterial
          color={slab.color}
          transparent
          opacity={lit('dielectric', 'eps_r') ? Math.min(0.75, slab.opacity + 0.25) : slab.opacity}
          depthWrite={false}
          emissive={lit('dielectric', 'eps_r') ? AMBER : '#000000'}
          emissiveIntensity={lit('dielectric', 'eps_r') ? 0.25 : 0}
        />
      </mesh>
      {/* +q on the underside of the top plate, −q on the bottom plate */}
      <group {...hover3d(['charge_q'])}>
        {charges.map(([x, z], k) => (
          <mesh key={`p${k}`} position={[x, g / 2 + 0.42, z]}>
            <sphereGeometry args={[0.17, 10, 8]} />
            <meshStandardMaterial color="#dc2626" emissive={lit('charge_q') ? '#dc2626' : '#000000'} emissiveIntensity={0.5} />
          </mesh>
        ))}
        {charges.map(([x, z], k) => (
          <mesh key={`n${k}`} position={[x, -g / 2 + 0.1, z]}>
            <sphereGeometry args={[0.17, 10, 8]} />
            <meshStandardMaterial color="#2563eb" emissive={lit('charge_q') ? '#2563eb' : '#000000'} emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
      {/* field lines, + → − */}
      <group {...hover3d(['efield'])}>
        {lines.map(([x, z], k) => (
          <group key={k} position={[x, 0, z]}>
            <mesh>
              <cylinderGeometry args={[0.045, 0.045, g * 0.86, 6]} />
              <meshBasicMaterial color={lit('efield') ? '#f59e0b' : '#ca8a04'} />
            </mesh>
            <mesh position={[0, -g * 0.43 + 0.18, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.15, 0.36, 10]} />
              <meshBasicMaterial color={lit('efield') ? '#f59e0b' : '#ca8a04'} />
            </mesh>
          </group>
        ))}
      </group>
      {/* dipoles: − end up (towards +q), + end down; random when v = 0, aligned as v grows */}
      <group {...hover3d(['dipole'])}>
        {dipoles.map(([x, z], k) => {
          const [ax, az] = tiltOf(k);
          const h = Math.min(0.32, g * 0.18);
          return (
            <group key={k} position={[x, 0, z]} rotation={[ax * (1 - 0.9 * align), 0, az * (1 - 0.9 * align)]}>
              <mesh position={[0, h, 0]}>
                <sphereGeometry args={[0.2, 12, 8]} />
                <meshStandardMaterial color="#3b82f6" emissive={lit('dipole') ? AMBER : '#000000'} emissiveIntensity={0.5} />
              </mesh>
              <mesh position={[0, -h, 0]}>
                <sphereGeometry args={[0.2, 12, 8]} />
                <meshStandardMaterial color="#ef4444" emissive={lit('dipole') ? AMBER : '#000000'} emissiveIntensity={0.5} />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.09, 0.09, 2 * h, 8]} />
                <meshStandardMaterial color="#94a3b8" />
              </mesh>
            </group>
          );
        })}
      </group>
      {/* the coating: peel it off to look inside */}
      <mesh position={[0, 0, 0]} renderOrder={5}>
        <boxGeometry args={[s + 1.2, g + 2 * T + 1.0, s + 1.2]} />
        <meshStandardMaterial color="#c98a3a" roughness={0.7} transparent opacity={peel ? 0.07 : 0.9} depthWrite={!peel} />
      </mesh>
      {/* dimensions */}
      <group {...hover3d(['gap_d'])}>
        <mesh position={[s / 2 + 0.9, 0, s / 2]}>
          <boxGeometry args={[0.07, g, 0.07]} />
          <meshBasicMaterial color={lit('gap_d') ? AMBER : '#475569'} />
        </mesh>
      </group>
      <Html position={[s / 2 + 1.5, 0, s / 2]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`w41-dim ${lit('gap_d') ? 'lit' : ''}`}>d</div>
      </Html>
      <Html position={[-s / 2, yTop + 0.5, s / 2]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`w41-dim ${lit('area_a') ? 'lit' : ''}`}>A</div>
      </Html>
      <Html position={[s / 2, yTop + 0.7, -s / 2]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`w41-dim pos ${lit('plate_top', 'charge_q') ? 'lit' : ''}`}>+q</div>
      </Html>
      <Html position={[s / 2, yBot - 0.7, -s / 2]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`w41-dim neg ${lit('plate_bot', 'charge_q') ? 'lit' : ''}`}>−q</div>
      </Html>
      {er > 1 && (
        <Html position={[-s / 2 - 1.4, 0, -s / 2]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`w41-dim er ${lit('eps_r', 'dielectric') ? 'lit' : ''}`}>εr = {er}</div>
        </Html>
      )}
    </group>
  );
}

/** frame a sphere of radius R around the model for the canvas' aspect */
function Fit() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  useEffect(() => {
    const R = 8.6;
    const vf = (camera.fov * Math.PI) / 180;
    const hf = 2 * Math.atan(Math.tan(vf / 2) * aspect);
    const dist = R / Math.sin(Math.min(vf, hf) / 2);
    const dir = new THREE.Vector3(0.75, 0.55, 1).normalize();
    camera.position.copy(dir.multiplyScalar(dist));
    camera.lookAt(0, 0, 0);
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
    invalidate();
  }, [camera, controls, aspect, invalidate]);
  return null;
}

/** the elastic-membrane water tank (Boylestad): the membrane bulges with q = Cv */
function Tank({ rel, v }: { rel: number; v: number }) {
  const on = useIsLit()('tank', 'membrane');
  const b = 16 * (1 - Math.exp(-0.6 * rel));
  const flow = v > 0;
  return (
    <div className={`w41-tank ${on}`} {...hoverProps(['tank'])} role="img" aria-label="弹性隔膜水箱类比：隔膜鼓起程度对应电荷量 q">
      <svg viewBox="0 0 220 110">
        <rect x="0.5" y="0.5" width="219" height="109" rx="8" fill="#ffffff" stroke="#d6c9ae" />
        <text x="10" y="16" fontSize="11" fontWeight="700" fill="#1f2a44">
          弹性隔膜水箱类比
        </text>
        <rect x="14" y="40" width="192" height="34" fill="#dbeafe" stroke="#64748b" />
        <path d={`M110 40 Q ${110 + b * 2} 57 110 74`} fill="none" stroke={on ? AMBER : '#be123c'} strokeWidth="3" {...hoverProps(['membrane'])} />
        {flow && (
          <>
            <path d="M24 57 h26" stroke="#1d4ed8" strokeWidth="2" markerEnd="url(#w41ar)" />
            <path d="M160 57 h26" stroke="#1d4ed8" strokeWidth="2" markerEnd="url(#w41ar)" />
          </>
        )}
        <defs>
          <marker id="w41ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#1d4ed8" />
          </marker>
        </defs>
        <text x="14" y="34" fontSize="9.5" fill="#3a4560">
          水泵压力 ↔ v
        </text>
        <text x="122" y="34" fontSize="9.5" fill="#3a4560">
          左进多少 = 右出多少
        </text>
        <text x="14" y="90" fontSize="9.5" fill="#be123c">
          隔膜鼓起 ↔ q = Cv
        </text>
        <text x="14" y="103" fontSize="9.5" fill="#3a4560">
          绷紧的隔膜 ↔ 电场储能 w
        </text>
      </svg>
    </div>
  );
}

export default function Teardown3D() {
  useClearHoverOnUnmount();
  const [A, setA] = useStageParam('tdA', 20);
  const [dmm, setD] = useStageParam('tdD', 1);
  const [key_, setKey] = useStageParam<DielectricKey>('tdEr', 'air');
  const [v, setV] = useStageParam('tdV', 5);
  const [peel, setPeel] = useStageParam('peel', true);
  const on = useIsLit();
  const er = erOf(key_);
  const t = teardown(er, A, dmm, v);
  const s = 1.6 * Math.sqrt(A);
  const g = 0.8 + 1.8 * dmm;
  return (
    <div className="w41-layer">
      <div className="w41-dock">
        <Slider id="area_a" label="A" value={A} min={A_RANGE[0]} max={A_RANGE[1]} step={1} onChange={setA} text={`${A} cm²`} />
        <Slider id="gap_d" label="d" value={dmm} min={D_RANGE[0]} max={D_RANGE[1]} step={0.1} onChange={setD} text={`${dmm.toFixed(1)} mm`} />
        <Seg<DielectricKey>
          label="电介质"
          value={key_}
          onChange={setKey}
          options={DIELECTRICS.map((d) => ({ value: d.key, label: `${d.name} ${d.er}`, short: d.name, hover: ['dielectric', 'eps_r'] }))}
        />
        <Slider id="volt_v" label="v" value={v} min={V_RANGE[0]} max={V_RANGE[1]} step={0.5} onChange={setV} text={`${v.toFixed(1)} V`} />
        <button className={`w41-toggle ${peel ? 'on' : ''}`} aria-pressed={peel} onClick={() => setPeel(!peel)}>
          <span className="full">{peel ? '已剥壳' : '剥开外壳'}</span>
          <span className="short">{peel ? '已剥壳' : '剥壳'}</span>
        </button>
      </div>
      <div className="bb3d-wrap w41-bench">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [12, 9, 16], fov: 38, near: 0.5, far: 400 }} className="bb3d-canvas">
          <hemisphereLight args={['#fffaf0', '#cfc4ae', 1.0]} />
          <directionalLight position={[10, 20, 14]} intensity={1.1} />
          <directionalLight position={[-14, 8, -10]} intensity={0.35} />
          <Plates s={s} g={g} er={er} key_={key_} v={v} q={t.q} E={t.E} peel={peel} />
          <OrbitControls makeDefault enableDamping={false} minDistance={6} maxDistance={80} />
          <Fit />
        </Canvas>
        <Tank rel={t.q / Q_REF} v={v} />
        <p className="w41-drag-hint">尺寸为示意 · 拖动旋转</p>
      </div>
      <div className="w41-cells">
        <Cell id="cap_c" name="C = εr·ε0·A/d" value={fmtC(t.C)} tone="good" />
        <Cell id="charge_q" name="q = Cv" value={fmtQ(t.q)} />
        <Cell id="efield" name="E = v/d" value={fmtE(t.E)} />
        <Cell id="energy" name="w = ½Cv²" value={fmtW(t.w)} />
        <Cell id="eps_r" name="εr" value={String(er)} tone="minor" />
        <Cell id="dipole" name="偶极子" value={er > 1 ? (v > 0 ? '顺电场排列' : '杂乱') : '无（空气）'} tone="minor" />
      </div>
      <p className={`w41-notice ${on('cap_c')}`} {...hoverProps(['cap_c'])} role="note">
        <span className="full">面积 A 越大、间距 d 越小、εr 越大 → C 越大 · 固定 v 时 E = v/d 与介质无关，电荷 q = Cv 随 εr 增加</span>
        <span className="short">A↑ d↓ εr↑ → C↑ · q = Cv</span>
      </p>
    </div>
  );
}
