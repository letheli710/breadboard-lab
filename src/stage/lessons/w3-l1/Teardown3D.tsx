// Layer "03 3D 剥壳等效 VCVS 模型": the DIP-8 package of layer 01 (LM741 or LM358) taken apart.
// The epoxy slider lifts the top half of the moulded shell and fades both halves: inside, the
// copper lead frame (eight fingers and the die paddle), gold bond wires and the silicon die with
// its three stages — input stage, gain stage, output stage (two sets on the LM358, one per op amp).
// "对照等效电路" maps them onto the linear-region model R_i, A·v_d, R_o (3D tags and a 2D VCVS
// strip). The v_d slider drives the model: i_in = v_d / R_i, v_oc = A·v_d, v_o = R_L/(R_o+R_L)·A·v_d.
// While the guided example runs (stage param `mask`) the computed numbers show "?".

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { ALL_PINS, CHIP_NAME, dB, fmtPa, fmtUv, fmtV, OPAMP, vcvs, type ChipKind, type PinNo } from './model';
import { Cell, hoverProps, Seg, Slider, Toggle, useChip, useClearHoverOnUnmount, useIsLit, useMask } from './ui';

type V3 = [number, number, number];
const AMBER = '#f59e0b';

const hover = (ids: string[] | null) => (e: ThreeEvent<PointerEvent>) => {
  e.stopPropagation();
  useStage.getState().setHover(ids);
};

/** x of a pin (pins 1–4 left → right at +z, 5–8 right → left at −z, as on the breadboard) */
const pinX = (p: PinNo) => (p <= 4 ? -1.5 + (p - 1) : -1.5 + (8 - p));
const pinZ = (p: PinNo) => (p <= 4 ? 1 : -1);

function Wire({ pts, color, r, lit }: { pts: V3[]; color: string; r: number; lit?: boolean }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, 24, r, 6, false);
  }, [pts, r]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.8 : 0} />
    </mesh>
  );
}

interface StageBlock {
  id: 'ri' | 'vcvs' | 'ro';
  x: number;
  color: string;
  tag: string;
  short: string;
}

const BLOCKS: StageBlock[] = [
  { id: 'ri', x: -0.46, color: '#3b82f6', tag: '输入级 → R_i ≈ 2 MΩ', short: '输入级 R_i' },
  { id: 'vcvs', x: 0, color: '#f59e0b', tag: '增益级 → A·v_d（A = 10⁵）', short: '增益级 A·v_d' },
  { id: 'ro', x: 0.46, color: '#10b981', tag: '输出级 → R_o ≈ 75 Ω', short: '输出级 R_o' },
];

/** die pads a bond wire leaves from, per pin (none for the LM741's NC pin 8) */
function wired(chip: ChipKind): PinNo[] {
  return chip === 'lm741' ? ALL_PINS.filter((p) => p !== 8) : ALL_PINS;
}

function Package({ chip, e, overlay, drive }: { chip: ChipKind; e: number; overlay: boolean; drive: number }) {
  const lit = useLit();
  const is = (id: string) => lit.includes(id);
  // the top half rises and slides back, out of the line of sight to the die
  const lift: [number, number, number] = [0, e * 1.3, -e * 2.9];
  const shellLit = is('epoxy');
  const topOpacity = 1 - 0.7 * e;
  const botOpacity = 1 - 0.65 * e;
  const bodyColor = chip === 'lm358' ? '#26282c' : '#2a2622';
  const rows = chip === 'lm358' ? [0.22, -0.22] : [0];
  const blockDepth = chip === 'lm358' ? 0.34 : 0.7;
  return (
    <group>
      {/* bottom half of the epoxy shell */}
      <mesh position={[0, 0.375, 0]} onPointerEnter={hover(['epoxy'])} onPointerLeave={hover(null)} renderOrder={2}>
        <boxGeometry args={[4.4, 0.35, 2.4]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.55}
          transparent={botOpacity < 0.999}
          opacity={botOpacity}
          depthWrite={botOpacity > 0.999}
          emissive={shellLit ? AMBER : '#000000'}
          emissiveIntensity={shellLit ? 0.3 : 0}
        />
      </mesh>
      {/* top half, lifted and faded by the slider */}
      <group position={lift}>
        <mesh position={[0, 0.725, 0]} onPointerEnter={hover(['epoxy'])} onPointerLeave={hover(null)} renderOrder={3}>
          <boxGeometry args={[4.4, 0.35, 2.4]} />
          <meshStandardMaterial
            color={bodyColor}
            roughness={0.55}
            transparent={topOpacity < 0.999}
            opacity={topOpacity}
            depthWrite={topOpacity > 0.999}
            emissive={shellLit ? AMBER : '#000000'}
            emissiveIntensity={shellLit ? 0.3 : 0}
          />
        </mesh>
        <mesh position={[-2.2 + 0.02, 0.905, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 20, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color="#3d4046" transparent opacity={topOpacity} />
        </mesh>
        <Html position={[0.3, 1.05, 0]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none', opacity: Math.max(0.25, topOpacity) }}>
          <div className="w3-mark">{CHIP_NAME[chip]}</div>
        </Html>
      </group>
      {/* lead frame: die paddle and eight fingers, then the leads outside */}
      <group onPointerEnter={hover(['lead_frame'])} onPointerLeave={hover(null)}>
        <mesh position={[0, 0.555, 0]}>
          <boxGeometry args={[1.7, 0.04, 1.25]} />
          <meshStandardMaterial color="#c98a4b" metalness={0.7} roughness={0.35} emissive={is('lead_frame') ? AMBER : '#000000'} emissiveIntensity={is('lead_frame') ? 0.5 : 0} />
        </mesh>
        {ALL_PINS.map((p) => {
          const x = pinX(p);
          const z = pinZ(p);
          return (
            <group key={p}>
              <Wire
                pts={[
                  [x, 0.55, z * 1.5],
                  [x, 0.55, z * 1.12],
                  [x * 0.62, 0.55, z * 0.8],
                ]}
                color="#c98a4b"
                r={0.06}
                lit={is('lead_frame')}
              />
              <mesh position={[x, 0.12, z * 1.45]}>
                <boxGeometry args={[0.22, 0.9, 0.12]} />
                <meshStandardMaterial color="#c3c8ce" metalness={0.8} roughness={0.3} />
              </mesh>
              <Html position={[x, -0.25, z * 2.05]} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
                <div className="bb3d-pin">{p}</div>
              </Html>
            </group>
          );
        })}
      </group>
      {/* the die */}
      <mesh position={[0, 0.605, 0]} onPointerEnter={hover(['die'])} onPointerLeave={hover(null)}>
        <boxGeometry args={[1.42, 0.06, 0.98]} />
        <meshStandardMaterial color="#56617a" metalness={0.5} roughness={0.3} emissive={is('die') ? AMBER : '#000000'} emissiveIntensity={is('die') ? 0.4 : 0} />
      </mesh>
      {rows.map((z, r) =>
        BLOCKS.map((b) => {
          const on = is(b.id);
          // amp B of the LM358 is drawn dimmer: the mapping follows amp A
          const glow = on ? 0.7 : b.id === 'vcvs' && r === 0 ? 0.15 + 0.55 * drive : 0.12;
          return (
            <group key={`${r}${b.id}`}>
              <mesh position={[b.x, 0.645, z]} onPointerEnter={hover([b.id])} onPointerLeave={hover(null)}>
                <boxGeometry args={[0.36, 0.03, blockDepth]} />
                <meshStandardMaterial color={b.color} roughness={0.4} transparent opacity={r === 0 ? 1 : 0.55} emissive={b.color} emissiveIntensity={glow} />
              </mesh>
              {/* a lit stage keeps its colour and gets an amber frame */}
              {on && r === 0 && (
                <mesh position={[b.x, 0.64, z]}>
                  <boxGeometry args={[0.44, 0.02, blockDepth + 0.08]} />
                  <meshBasicMaterial color={AMBER} />
                </mesh>
              )}
            </group>
          );
        }),
      )}
      {/* bond wires: die edge pads → finger tips */}
      <group onPointerEnter={hover(['bond_wire'])} onPointerLeave={hover(null)}>
        {wired(chip).map((p) => {
          const x = pinX(p);
          const z = pinZ(p);
          const pad: V3 = [Math.max(-0.62, Math.min(0.62, x * 0.42)), 0.64, z * 0.44];
          const tip: V3 = [x * 0.62, 0.58, z * 0.8];
          const mid: V3 = [(pad[0] + tip[0]) / 2, 0.82, (pad[2] + tip[2]) / 2];
          return <Wire key={p} pts={[pad, mid, tip]} color="#e8c25a" r={0.014} lit={is('bond_wire')} />;
        })}
      </group>
      {overlay && e > 0.3 && (
        <>
          {BLOCKS.map((b) => (
            <Html key={b.id} position={TAG_AT[b.id]} center zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
              <div className={`w3-map-tag ${b.id} ${is(b.id) ? 'lit' : ''}`}>
                <span className="full">{b.tag}</span>
                <span className="short">{b.short}</span>
              </div>
            </Html>
          ))}
        </>
      )}
      {chip === 'lm358' && e > 0.3 && (
        <Html position={[0.95, 0.7, -0.45]} center zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
          <div className="w3-mini-tag">运放 B</div>
        </Html>
      )}
    </group>
  );
}

/** where the mapping tags float: input stage front-left, output stage front-right, gain stage behind */
const TAG_AT: Record<StageBlock['id'], V3> = { ri: [-1.5, 0.75, 1.45], vcvs: [0, 0.75, -1.45], ro: [1.5, 0.75, 1.45] };

const VIEW_DIR = new THREE.Vector3(0.1, 1.35, 1).normalize();

function Fit() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  useEffect(() => {
    if (!controls) return;
    const target = new THREE.Vector3(0, 0.55, -0.2);
    const cam = new THREE.PerspectiveCamera(camera.fov, aspect, 0.1, 200);
    const corners: THREE.Vector3[] = [];
    for (const x of [-2.5, 2.5]) for (const y of [-0.4, 1.4]) for (const z of [-2.6, 2.3]) corners.push(new THREE.Vector3(x, y, z));
    const v = new THREE.Vector3();
    let d = 2;
    for (; d < 80; d *= 1.04) {
      cam.position.copy(target).addScaledVector(VIEW_DIR, d);
      cam.lookAt(target);
      cam.updateMatrixWorld();
      if (corners.every((p) => (v.copy(p).project(cam), Math.abs(v.x) < 0.9 && Math.abs(v.y) < 0.88))) break;
    }
    camera.position.copy(target).addScaledVector(VIEW_DIR, d);
    controls.target.copy(target);
    controls.update();
    invalidate();
  }, [camera, controls, aspect, invalidate]);
  return null;
}

/** the 2D map: input port R_i, the VCVS A·v_d, R_o, the load */
function VcvsStrip({ vdUv, mask, rlK }: { vdUv: number; mask: boolean; rlK: number }) {
  const on = useIsLit();
  const m = vcvs(vdUv * 1e-6, rlK * 1000);
  return (
    <svg viewBox="0 0 330 118" className="w3-vcvs" role="img" aria-label="等效电路：R_i、A·v_d、R_o 与负载 R_L">
      <line x1="14" y1="30" x2="56" y2="30" className="w3-w" />
      <line x1="14" y1="90" x2="56" y2="90" className="w3-w" />
      <text x="6" y="22" className="w3-t">
        v₁ (−)
      </text>
      <text x="6" y="108" className="w3-t">
        v₂ (+)
      </text>
      <g className={`w3-part ${on('ri')}`} {...hoverProps(['ri'])}>
        <line x1="56" y1="30" x2="56" y2="42" className="w3-w" />
        <rect x="47" y="42" width="18" height="36" rx="3" className="w3-ri" />
        <line x1="56" y1="78" x2="56" y2="90" className="w3-w" />
        <text x="70" y="52" className="w3-t ri">
          R_i
        </text>
      </g>
      <text x="70" y="72" className="w3-t vd">{`v_d ${fmtUv(vdUv * 1e-6)}`}</text>
      <g className={`w3-part ${on('vcvs')}`} {...hoverProps(['vcvs'])}>
        <polygon points="160,36 184,60 160,84 136,60" className="w3-dia" />
        <text x="160" y="64" className="w3-t mid">
          A·v_d
        </text>
        <text x="160" y="112" className="w3-t mid b">
          {mask ? 'A·v_d = ?' : `A·v_d = ${fmtV(m.voc, 2)}`}
        </text>
      </g>
      <line x1="160" y1="36" x2="160" y2="20" className="w3-w" />
      <line x1="160" y1="20" x2="200" y2="20" className="w3-w" />
      <g className={`w3-part ${on('ro')}`} {...hoverProps(['ro'])}>
        <rect x="200" y="12" width="40" height="16" rx="3" className="w3-ro" />
        <text x="220" y="44" className="w3-t mid ro">
          R_o
        </text>
      </g>
      <line x1="240" y1="20" x2="286" y2="20" className="w3-w" />
      <g className={`w3-part ${on('rl_load')}`} {...hoverProps(['rl_load'])}>
        <line x1="286" y1="20" x2="286" y2="38" className="w3-w" />
        <rect x="278" y="38" width="16" height="38" rx="3" className="w3-rl" />
        <line x1="286" y1="76" x2="286" y2="96" className="w3-w" />
        <text x="298" y="62" className="w3-t">{`${rlK} kΩ`}</text>
      </g>
      <line x1="160" y1="84" x2="160" y2="96" className="w3-w" />
      <line x1="150" y1="96" x2="300" y2="96" className="w3-w gnd" />
      <text x="324" y="112" className="w3-t b end">
        {mask ? 'v_o = ?' : `v_o = ${fmtV(m.vo, 3)}`}
      </text>
    </svg>
  );
}

export default function Teardown3D() {
  useClearHoverOnUnmount();
  const [chip, setChip] = useChip();
  const [explode, setExplode] = useStageParam('explode', 0);
  const [overlay, setOverlay] = useStageParam('overlay', false);
  const [vdUv, setVd] = useStageParam('vd3', 50);
  const [rlK] = useStageParam('rl3', 2);
  const mask = useMask();
  const e = explode / 100;
  const m = vcvs(vdUv * 1e-6, rlK * 1000);
  const q = (s: string) => (mask ? '?' : s);
  return (
    <div className="w3-layer">
      <div className="w3-dock">
        <Seg
          label="芯片"
          value={chip}
          onChange={setChip}
          tone="chip"
          options={[
            { value: 'lm741', label: 'LM741（单运放）', short: 'LM741' },
            { value: 'lm358', label: 'LM358（双运放）', short: 'LM358' },
          ]}
        />
        <Toggle on={overlay} onChange={setOverlay} label="对照等效电路 R_i · A·v_d · R_o" short="等效映射" ids={['ri', 'vcvs', 'ro']} />
        <Slider label="环氧树脂外壳剥离" short="剥壳" value={explode} min={0} max={100} step={1} onChange={setExplode} text={`${explode}%`} ids={['epoxy']} />
        <Slider label="差模输入 v_d" short="v_d" value={vdUv} min={-90} max={90} step={5} onChange={setVd} text={fmtUv(vdUv * 1e-6)} ids={['vd']} />
      </div>
      <div className="bb3d-wrap w3-tear">
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [0.6, 8, 6], fov: 38, near: 0.1, far: 200 }} className="bb3d-canvas">
          <hemisphereLight args={['#fffaf0', '#cfc4ae', 1.0]} />
          <directionalLight position={[6, 12, 8]} intensity={1.3} />
          <directionalLight position={[-8, 6, -6]} intensity={0.4} />
          <Package chip={chip} e={e} overlay={overlay} drive={Math.min(1, Math.abs(vdUv) / 90)} />
          <OrbitControls makeDefault enableDamping={false} minDistance={2} maxDistance={40} />
          <Fit />
        </Canvas>
        {e < 0.3 && <p className="w3-drag-hint">拖动「剥壳」滑块，掀开环氧树脂外壳</p>}
      </div>
      <div className={`w3-panel ${overlay ? 'map' : ''}`} aria-live="polite">
        {overlay && <VcvsStrip vdUv={vdUv} mask={mask} rlK={rlK} />}
        <div className="w3-cells">
          <Cell id="vd" name="v_d = v₂ − v₁" value={fmtUv(vdUv * 1e-6)} />
          <Cell id="ri" name="i_in = v_d/R_i" value={q(fmtPa(m.iin))} cls="minor" />
          <Cell id="vcvs" name="v_oc = A·v_d" value={q(fmtV(m.voc, 2))} />
          <Cell id="rl_load" name={`v_o（R_L = ${rlK} kΩ）`} value={q(fmtV(m.vo, 3))} cls="big" />
          <Cell id="ro" name="R_o 上损失" value={q(`${(m.eps * 100).toFixed(2)}%`)} cls="minor" />
          <Cell id="gain_db" name="A（dB）" value={`10⁵ = ${dB(OPAMP.A).toFixed(0)} dB`} cls="minor" />
        </div>
      </div>
    </div>
  );
}
