// Layer "01 3D 碳膜电阻实物与色环": an axial 1/4 W carbon-film resistor (beige paint, metal end
// caps, tinned leads) plugged into a piece of breadboard and fed from the rails. The four bands
// follow the R slider (1st and 2nd digit, multiplier, gold ±5%). The cutaway shows the ceramic
// core and the laser-cut carbon spiral: the larger R, the more turns (longer path l, narrower
// strip A). Above 0.25 W the body glows and smokes; the short swaps it for a silver 0 Ω jumper,
// the open pulls it out of the holes. Built from the shared breadboard pieces (Shell, Lead, colX,
// ROW_Z, RAIL_Z) with this lesson's own resistor model and camera presets.

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { prefersReducedMotion } from '../../../ui/reveal';
import { Lead, RAIL_Z, ROW_Z, Shell, colX } from '../../BreadboardXray';
import { useLit, useStage } from '../../stageStore';
import { Dock, Telemetry } from './Dock';
import { BAND_HEX, bandsOf, ohms, si, useOhm, volts } from './model';
import './w1l3.css';

const AMBER = '#f59e0b';
/** body centre height above the board */
const H = 1.15;
/** the resistor under test: c13 – c18 */
const X1 = colX(13);
const X2 = colX(18);
const MX = (X1 + X2) / 2;
const Z = ROW_Z.c;
const HALF = (X2 - X1) / 2;
const BODY = 2.5;

/* ------------------------------------------------------------- the resistor model */

/** dog-bone outline of the paint (radius, position along the axis) */
const PROFILE: [number, number][] = [
  [0.07, -1.25],
  [0.3, -1.22],
  [0.42, -1.14],
  [0.46, -1.0],
  [0.46, -0.84],
  [0.41, -0.7],
  [0.4, -0.6],
  [0.4, 0.6],
  [0.41, 0.7],
  [0.46, 0.84],
  [0.46, 1.0],
  [0.42, 1.14],
  [0.3, 1.22],
  [0.07, 1.25],
];

/** position and radius of the four bands along the body */
const BAND_AT: [number, number][] = [
  [-0.92, 0.468],
  [-0.48, 0.408],
  [-0.2, 0.408],
  [0.48, 0.408],
];

class Helix extends THREE.Curve<THREE.Vector3> {
  constructor(
    private turns: number,
    private r: number,
    private len: number,
  ) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = t * this.turns * Math.PI * 2;
    return target.set(-this.len / 2 + t * this.len, this.r * Math.cos(a), this.r * Math.sin(a));
  }
}

/** turns of the laser spiral for a resistance (10 Ω: 3 … 100 kΩ: 12) */
export const spiralTurns = (r: number) => Math.round(3 + 2.25 * Math.log10(Math.max(10, r) / 10));

function Spiral({ turns, lit }: { turns: number; lit: boolean }) {
  const geo = useMemo(() => new THREE.TubeGeometry(new Helix(turns, 0.352, 1.5), turns * 28, 0.04, 6, false), [turns]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={lit ? '#fff1c7' : '#ddd3bf'} roughness={0.8} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.5 : 0} />
    </mesh>
  );
}

const hover = (id: string) => (e: ThreeEvent<PointerEvent>) => {
  e.stopPropagation();
  useStage.getState().setHover([id]);
};
const unhover = () => useStage.getState().setHover(null);

interface BodyProps {
  bands: string[];
  cutaway: boolean;
  turns: number;
  heat: number;
  lit: { bands: boolean; geom: boolean; cond: boolean };
  interactive?: boolean;
}

/** The resistor body along x, centred on the origin. */
function Body({ bands, cutaway, turns, heat, lit, interactive = true }: BodyProps) {
  const lathe = useMemo(
    () =>
      new THREE.LatheGeometry(
        PROFILE.map(([r, y]) => new THREE.Vector2(r, y)),
        40,
      ),
    [],
  );
  useEffect(() => () => lathe.dispose(), [lathe]);
  const paintOpacity = cutaway ? 0.16 : 1;
  const on = interactive ? { onPointerOver: hover(cutaway ? 'hl_geom_rho' : 'hl_color_bands'), onPointerOut: unhover } : {};
  return (
    <group>
      {/* keyed on the cutaway: a material switching to transparent needs a fresh program */}
      <mesh key={cutaway ? 'cut' : 'paint'} geometry={lathe} rotation={[0, 0, -Math.PI / 2]} {...on} renderOrder={cutaway ? 3 : 0}>
        <meshStandardMaterial
          color="#e6cc9a"
          roughness={0.6}
          transparent={cutaway}
          opacity={paintOpacity}
          depthWrite={!cutaway}
          emissive={heat > 0 ? '#ff4d1a' : lit.bands && !cutaway ? AMBER : '#000000'}
          emissiveIntensity={heat > 0 ? 0.25 + 0.6 * heat : lit.bands && !cutaway ? 0.25 : 0}
        />
      </mesh>
      {bands.map((c, i) => (
        <mesh
          key={`${i}${cutaway ? 'c' : 'p'}`}
          rotation={[0, 0, Math.PI / 2]}
          position={[BAND_AT[i][0], 0, 0]}
          renderOrder={cutaway ? 3 : 0}
          {...(interactive ? { onPointerOver: hover('hl_color_bands'), onPointerOut: unhover } : {})}
        >
          <cylinderGeometry args={[BAND_AT[i][1], BAND_AT[i][1], 0.14, 24]} />
          <meshStandardMaterial color={c} roughness={0.5} metalness={i === 3 ? 0.5 : 0} transparent={cutaway} opacity={cutaway ? 0.22 : 1} depthWrite={!cutaway} />
        </mesh>
      ))}
      {cutaway && (
        <group>
          {/* ceramic core */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 2.2, 24]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.9} />
          </mesh>
          {/* carbon film */}
          <mesh rotation={[0, 0, Math.PI / 2]} {...(interactive ? { onPointerOver: hover('hl_geom_rho'), onPointerOut: unhover } : {})}>
            <cylinderGeometry args={[0.345, 0.345, 1.5, 32]} />
            <meshStandardMaterial color="#2a2623" roughness={0.7} emissive={lit.geom || lit.cond ? AMBER : '#000000'} emissiveIntensity={lit.geom || lit.cond ? 0.28 : 0} />
          </mesh>
          <Spiral turns={turns} lit={lit.geom} />
          {/* metal end caps */}
          {[-1, 1].map((sgn) => (
            <mesh key={sgn} rotation={[0, 0, Math.PI / 2]} position={[sgn * 0.96, 0, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 0.42, 24]} />
              <meshStandardMaterial color="#c9ced4" metalness={0.85} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

/** A coloured jumper wire through the given points. */
function Wire({ pts, color, onOver, onOut }: { pts: [number, number, number][]; color: string; onOver?: (e: ThreeEvent<PointerEvent>) => void; onOut?: () => void }) {
  const geo = useMemo(() => {
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < pts.length - 1; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(...pts[i]), new THREE.Vector3(...pts[i + 1])));
    return new THREE.TubeGeometry(path, 20 * (pts.length - 1), 0.11, 8, false);
  }, [pts]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} onPointerOver={onOver} onPointerOut={onOut}>
      <meshStandardMaterial color={color} roughness={0.5} metalness={color === '#c7ccd2' ? 0.85 : 0.05} />
    </mesh>
  );
}

const LEAD_L: [number, number, number][] = [
  [-HALF, -0.3, 0],
  [-HALF, H, 0],
  [-BODY / 2, H, 0],
];
const LEAD_R: [number, number, number][] = [
  [HALF, -0.3, 0],
  [HALF, H, 0],
  [BODY / 2, H, 0],
];
const JUMPER: [number, number, number][] = [
  [X1, -0.3, Z],
  [X1, 0.55, Z],
  [X2, 0.55, Z],
  [X2, -0.3, Z],
];
const RED_DIRECT: [number, number, number][] = [
  [colX(13), -0.3, RAIL_Z.tp],
  [colX(13), 1.9, RAIL_Z.tp],
  [colX(13), 1.9, ROW_Z.a],
  [colX(13), -0.3, ROW_Z.a],
];
const RED_VIA_RS: [number, number, number][] = [
  [colX(9), -0.3, RAIL_Z.tp],
  [colX(9), 1.9, RAIL_Z.tp],
  [colX(9), 1.9, ROW_Z.a],
  [colX(9), -0.3, ROW_Z.a],
];
const BLACK: [number, number, number][] = [
  [colX(18), -0.3, RAIL_Z.tn],
  [colX(18), 1.3, RAIL_Z.tn],
  [colX(18), 1.3, ROW_Z.a],
  [colX(18), -0.3, ROW_Z.a],
];
const RS_X1 = colX(9);
const RS_X2 = colX(13);
const RS_Z = ROW_Z.d;
const RS_HALF = (RS_X2 - RS_X1) / 2;
const RS_LEAD_L: [number, number, number][] = [
  [-RS_HALF, -0.3, 0],
  [-RS_HALF, H, 0],
  [-BODY / 2, H, 0],
];
const RS_LEAD_R: [number, number, number][] = [
  [RS_HALF, -0.3, 0],
  [RS_HALF, H, 0],
  [BODY / 2, H, 0],
];
const RS_BANDS = ['brown', 'black', 'red', 'gold'].map((k) => BAND_HEX[k]);

/* ------------------------------------------------------------- heat and smoke */

function Heat({ level, smoke }: { level: number; smoke: boolean }) {
  const glow = useRef<THREE.Mesh>(null);
  const puffs = useRef<(THREE.Mesh | null)[]>([]);
  const invalidate = useThree((s) => s.invalidate);
  const still = prefersReducedMotion();
  useFrame(({ clock }) => {
    if (still) return;
    const t = clock.getElapsedTime();
    if (glow.current) glow.current.scale.setScalar(1 + 0.08 * Math.sin(t * 6));
    puffs.current.forEach((m, k) => {
      if (!m) return;
      const ph = (t * 0.45 + k / 7) % 1;
      m.position.set(Math.sin(k * 2.1 + t) * 0.25 + (k - 3) * 0.12, 0.5 + ph * 3.2, Math.cos(k * 1.7 + t * 0.8) * 0.25);
      m.scale.setScalar(0.5 + ph * 1.6);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.45 * (1 - ph);
    });
    invalidate();
  });
  return (
    <group>
      <mesh ref={glow} onPointerOver={hover('hl_power_soa')} onPointerOut={unhover}>
        <sphereGeometry args={[0.95, 24, 16]} />
        <meshBasicMaterial color="#ff6a1f" transparent opacity={0.14 + 0.26 * level} depthWrite={false} />
      </mesh>
      {smoke &&
        Array.from({ length: 7 }, (_, k) => (
          <mesh
            key={k}
            ref={(m) => {
              puffs.current[k] = m;
            }}
            position={[(k - 3) * 0.12, 0.6 + k * 0.4, 0]}
          >
            <sphereGeometry args={[0.22, 12, 8]} />
            <meshBasicMaterial color="#8d8a86" transparent opacity={0.3} depthWrite={false} />
          </mesh>
        ))}
    </group>
  );
}

/* ------------------------------------------------------------- camera */

type Preset = 'close' | 'bands' | 'board';
const PRESETS: Record<Preset, { off: [number, number, number]; target: [number, number, number]; frame: number }> = {
  close: { off: [0.6, 5.2, 7.6], target: [MX, 1.3, Z], frame: 8.5 },
  bands: { off: [0.2, 2.4, 4.6], target: [MX, H, Z], frame: 4.4 },
  board: { off: [0.4, 9, 10], target: [MX - 2.3, 0.6, Z - 1.6], frame: 14 },
};

function CameraRig({ preset, lift }: { preset: Preset; lift: number }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const anim = useRef<{ t: number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3 } | null>(null);
  useEffect(() => {
    if (!controls) return;
    const p = PRESETS[preset];
    const toT = new THREE.Vector3(...p.target).add(new THREE.Vector3(0, preset === 'board' ? 0 : lift * 0.55, 0));
    const off = new THREE.Vector3(...p.off);
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
    // the framed width must fit across, and (on wide, short canvases) its height must fit too
    const needW = (p.frame / 2 / Math.tan(hfov / 2)) * 1.04;
    const needH = ((p.frame * 0.45 + lift * 0.6) / 2 / Math.tan(fov / 2)) * 1.04;
    off.setLength(Math.max(needW, needH));
    const toP = toT.clone().add(off);
    if (prefersReducedMotion()) {
      camera.position.copy(toP);
      controls.target.copy(toT);
      controls.update();
      invalidate();
      return;
    }
    anim.current = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toP, toT };
    invalidate();
  }, [preset, lift, controls, camera, invalidate, aspect]);
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

const LIFT = 2.6;

function Lifted({ up, children }: { up: boolean; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  useFrame((_, dt) => {
    if (!g.current) return;
    const target = up ? LIFT : 0;
    const y = g.current.position.y;
    if (Math.abs(target - y) < 0.002) return;
    g.current.position.y = prefersReducedMotion() ? target : y + (target - y) * Math.min(1, dt * 6);
    invalidate();
  });
  useEffect(() => invalidate(), [up, invalidate]);
  return (
    <group ref={g} position={[MX, 0, Z]}>
      {children}
    </group>
  );
}

function Scene({ fromScene }: { fromScene: MutableRefObject<boolean> }) {
  const { r, v, limit, psc, rs, cutaway, s } = useOhm();
  const lit = useLit();
  const L = (id: string) => lit.includes(id);
  const [preview, setPreview] = useState(false);
  // the cutaway and the G preview open while a term is hovered (an act's halo only highlights:
  // the 外观色环 / 碳膜剖视 switch stays the student's)
  const hovered = useStage((st) => st.hover) ?? [];
  const condLit = hovered.includes('hl_conductance');
  const geomLit = L('hl_geom_rho');
  // G preview: the strip toggles between its own width and a wider one (half the turns)
  useEffect(() => {
    if (!condLit) {
      setPreview(false);
      return;
    }
    if (prefersReducedMotion()) {
      setPreview(true);
      return;
    }
    const t = setInterval(() => setPreview((p) => !p), 900);
    return () => clearInterval(t);
  }, [condLit]);
  const showCut = cutaway || hovered.includes('hl_geom_rho') || condLit;
  const read = bandsOf(r);
  const hex = read.keys.map((k) => BAND_HEX[k]);
  const turns = spiralTurns(r);
  const shownTurns = preview ? Math.max(2, Math.round(turns / 2)) : turns;
  const heat = s.overload ? Math.min(1, 0.45 + (s.eta - 1) / 3) : 0;
  const powerLit = L('hl_power_soa');
  const bandsLit = L('hl_color_bands');
  const preset: Preset = bandsLit && !fromScene.current && limit === 'none' ? 'bands' : rs ? 'board' : 'close';
  const tag = (cls: string, text: string) => <div className={`l3-tag3 ${cls}`}>{text}</div>;
  const html = { center: true, zIndexRange: [20, 0] as [number, number], style: { pointerEvents: 'none' as const } };

  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cfc4ae', 0.95]} />
      <directionalLight position={[14, 30, 18]} intensity={1.25} />
      <directionalLight position={[-20, 12, -12]} intensity={0.35} />
      <Shell xray={0} />

      {/* supply: + rail (red jumper), − rail (black jumper) */}
      <Wire pts={rs ? RED_VIA_RS : RED_DIRECT} color="#d62f3a" />
      <Wire pts={BLACK} color="#22252b" />
      <Html position={[colX(rs ? 9 : 13) - 2.2, 0.6, RAIL_Z.tp - 0.4]} {...html}>
        {tag('rail', `+ 轨 v = ${volts(v)}`)}
      </Html>
      <Html position={[colX(18) + 2.3, 0.6, RAIL_Z.tn - 0.6]} {...html}>
        {tag('rail neg', '− 轨 GND')}
      </Html>

      {/* protective resistor R_s (act 5) */}
      {rs && (
        <group position={[(RS_X1 + RS_X2) / 2, 0, RS_Z]}>
          <Lead pts={RS_LEAD_L} />
          <Lead pts={RS_LEAD_R} />
          <group position={[0, H, 0]}>
            <Body bands={RS_BANDS} cutaway={false} turns={6} heat={0} lit={{ bands: false, geom: false, cond: false }} interactive={false} />
          </group>
          <Html position={[0, H + 0.9, 0.6]} {...html}>
            {tag('rs', 'R_s = 1 kΩ 保护电阻')}
          </Html>
        </group>
      )}

      {/* the resistor under test, or the jumper (short) */}
      {limit === 'short' ? (
        <group>
          <Wire pts={JUMPER} color="#c7ccd2" onOver={hover('hl_short_limit')} onOut={unhover} />
          <Html position={[MX, 1.6, Z]} {...html}>
            {tag(`short ${L('hl_short_limit') ? 'lit' : ''}`, s.dead ? '0 Ω 跳线：电源被直接短接，i → ∞' : `0 Ω 跳线 · v = 0 · i = ${si(s.iPhys, 'A').text}`)}
          </Html>
        </group>
      ) : (
        <Lifted up={limit === 'open'}>
          <group onPointerOver={hover('hl_psc_sign')} onPointerOut={unhover}>
            <Lead pts={LEAD_L} />
            <Lead pts={LEAD_R} />
          </group>
          <group position={[0, H, 0]}>
            <Body bands={hex} cutaway={showCut} turns={shownTurns} heat={heat} lit={{ bands: bandsLit, geom: geomLit, cond: condLit }} />
            {(heat > 0 || powerLit) && limit === 'none' && <Heat level={Math.max(heat, powerLit ? 0.3 + 0.5 * Math.min(1, s.eta) : 0)} smoke={heat > 0} />}
          </group>
          {/* reference polarity and current arrow */}
          <Html position={[-HALF - 0.1, H + 0.75, 0]} {...html}>
            <div className={`l3-pol plus ${L('hl_psc_sign') ? 'lit' : ''}`}>+</div>
          </Html>
          <Html position={[HALF + 0.1, H + 0.75, 0]} {...html}>
            <div className={`l3-pol minus ${L('hl_psc_sign') ? 'lit' : ''}`}>−</div>
          </Html>
          <Html position={[0, H + 1.0, 0]} {...html}>
            <div className={`l3-iarrow ${psc ? '' : 'bad'} ${L('hl_psc_sign') ? 'lit' : ''}`}>{psc ? `i → ${si(s.iRef, 'A').text}` : `${si(s.iRef, 'A').text} ← i`}</div>
          </Html>
          {/* colour-code decoding */}
          {limit === 'none' && !bandsLit && (
            <Html position={[0, H - 1.0, 0.9]} {...html}>
              <div className="l3-decode">
                {hex.map((c, i) => (
                  <i key={i} style={{ background: c }} />
                ))}
                <span>
                  {read.names} {read.approx ? '≈' : '='} {ohms(read.ohms).text} ±5%
                </span>
              </div>
            </Html>
          )}
          {limit === 'none' &&
            bandsLit &&
            read.meanings.map((t, i) => (
              <Html key={i} position={[BAND_AT[i][0] * 1.25, H + (i % 2 ? -0.95 : 0.95), 0.5]} {...html}>
                <div className="bb3d-band">
                  <i style={{ background: hex[i] }} />
                  {t.replace(' = ', ' ')}
                </div>
              </Html>
            ))}
          {/* cutaway labels */}
          {(showCut || geomLit) && limit === 'none' && (
            <Html position={[0, H - 1.8, 1.2]} {...html}>
              <div className={`l3-tag3 cut ${geomLit || condLit ? 'lit' : ''}`}>
                {condLit && preview
                  ? `G ↑：条带变宽、路径变短（${shownTurns} 圈）`
                  : !showCut
                    ? '打开下方「外观色环 / 碳膜剖视」开关，看激光螺旋碳膜'
                    : geomLit
                      ? `碳膜螺旋 ${turns} 圈：l 越长、条带 A 越窄 → R = ρl/A 越大`
                      : `陶瓷基体 + 激光螺旋碳膜（${turns} 圈）`}
              </div>
            </Html>
          )}
          {s.overload && limit === 'none' && (
            <Html position={[0, H + 1.75, 0]} {...html}>
              {tag('hot', `OVERLOAD p = ${si(s.p, 'W').text} > 0.25 W`)}
            </Html>
          )}
          {powerLit && !s.overload && limit === 'none' && (
            <Html position={[0, H + 1.75, 0]} {...html}>
              {tag('warm', `p = ${si(s.p, 'W').text}（${(s.eta * 100).toFixed(1)}% × 1/4 W）`)}
            </Html>
          )}
        </Lifted>
      )}

      {/* the open: an air gap between the two holes */}
      {limit === 'open' && (
        <group>
          {[X1, X2].map((x) => (
            <mesh key={x} position={[x, 0.04, Z]} rotation={[-Math.PI / 2, 0, 0]} onPointerOver={hover('hl_open_limit')} onPointerOut={unhover}>
              <ringGeometry args={[0.3, 0.46, 24]} />
              <meshBasicMaterial color="#2563eb" transparent opacity={0.85} />
            </mesh>
          ))}
          <Html position={[MX, 0.5, Z + 1.3]} {...html}>
            {tag(`open ${L('hl_open_limit') ? 'lit' : ''}`, `空气断口：i = 0 A，两孔之间 v = ${s.vR.toFixed(1)} V`)}
          </Html>
        </group>
      )}
      {/* previews when the text points at a limit */}
      {limit === 'none' && L('hl_short_limit') && (
        <group>
          <mesh position={[MX, 0.5, Z + 0.02]}>
            <boxGeometry args={[X2 - X1, 0.16, 0.16]} />
            <meshBasicMaterial color="#c7ccd2" transparent opacity={0.6} />
          </mesh>
          <Html position={[MX, 0.2, Z + 1.3]} {...html}>
            {tag('short lit', '短路形态：一段 0 Ω 银色跳线')}
          </Html>
        </group>
      )}
      {limit === 'none' && L('hl_open_limit') && (
        <Html position={[MX, 0.2, Z + 1.3]} {...html}>
          {tag('open lit', '开路形态：把电阻拔出，孔间只剩空气')}
        </Html>
      )}

      <OrbitControls makeDefault enableDamping={false} minDistance={2.5} maxDistance={60} maxPolarAngle={Math.PI * 0.49} />
      <CameraRig preset={preset} lift={limit === 'open' ? LIFT : 0} />
    </>
  );
}

export function Resistor3DLayer() {
  // hovering the 3D bands must not push the camera (it would slide away from the pointer)
  const fromScene = useRef(false);
  useEffect(() => () => useStage.getState().setHover(null), []);
  return (
    <div className="l3-layer">
      <div
        className="l3-view bb3d-wrap"
        onPointerEnter={() => {
          fromScene.current = true;
        }}
        onPointerLeave={() => {
          fromScene.current = false;
        }}
      >
        <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [MX + 4, 14, Z + 16], fov: 38, near: 0.1, far: 300 }} className="bb3d-canvas">
          <Scene fromScene={fromScene} />
        </Canvas>
      </div>
      <Dock cutawayToggle />
      <Telemetry />
    </div>
  );
}
