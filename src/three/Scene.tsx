import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { PARTS } from '../core/parts';
import type { PlacedPart } from '../core/types';
import { ammeterReading, ledOf, useDerived } from '../state/derived';
import { scopeChannelFor, useStore } from '../state/store';
import { E2E } from '../e2e/flag';
import { E2EProbe } from '../e2e/Probe';
import { Board } from './Board';
import type { PartCtxValue } from './common';
import { DragLayer, grabPart } from './Drag';
import { PartView } from './Parts';
import { qualityParams, useLowQuality, useQuality } from './quality';
import { assignSlots, nextSlot } from './slots';

const TARGET = new THREE.Vector3(0, 0, -3);
const HOME = new THREE.Vector3(0, 30, 25);

/** Camera presets the view button cycles through: polar angle from straight down, azimuth. */
export const VIEWS = ['angle', 'top', 'front', 'side'] as const;
export type ViewName = (typeof VIEWS)[number];
const VIEW_ANGLES: Record<ViewName, { phi: number; theta: number }> = {
  angle: { phi: new THREE.Spherical().setFromVector3(HOME.clone().sub(TARGET)).phi, theta: 0 },
  top: { phi: 0.05, theta: 0 },
  front: { phi: 1.3, theta: 0 },
  side: { phi: 0.95, theta: -0.75 },
};

function CameraRig() {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  // goal of an in-progress transition; null while the user is in control
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);

  useEffect(() => {
    const on = (e: Event) => {
      const view = (e as CustomEvent<ViewName>).detail;
      const angles = VIEW_ANGLES[view] ?? VIEW_ANGLES.angle;
      // fit ~38 units of width (board + margin) into the current viewport
      const cam = camera as THREE.PerspectiveCamera;
      const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect);
      const radius = Math.max(32, 21 / Math.tan(hfov / 2));
      const pos = new THREE.Vector3().setFromSpherical(new THREE.Spherical(radius, angles.phi, angles.theta)).add(TARGET);
      goal.current = { pos, target: TARGET.clone() };
      invalidate();
    };
    window.addEventListener('bb-camera', on);
    return () => window.removeEventListener('bb-camera', on);
  }, [camera, invalidate]);

  useEffect(() => {
    if (!controls) return;
    // the user grabbing the view cancels any transition
    const stop = () => (goal.current = null);
    controls.addEventListener('start', stop);
    const t = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('bb-camera', { detail: 'angle' }));
      if (goal.current) {
        camera.position.copy(goal.current.pos);
        controls.target.copy(goal.current.target);
        controls.update();
        goal.current = null;
        invalidate();
      }
    }, 50);
    return () => {
      clearTimeout(t);
      controls.removeEventListener('start', stop);
    };
  }, [controls, camera, invalidate]);

  useFrame((state, dt) => {
    const g = goal.current;
    if (!g || !controls) return;
    state.invalidate(); // demand frame loop: keep rendering until the transition ends
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 7);
    camera.position.lerp(g.pos, k);
    controls.target.lerp(g.target, k);
    controls.update();
    if (camera.position.distanceTo(g.pos) < 0.05) goal.current = null;
  });
  return null;
}

const CTX: Record<PartCtxValue['tint'], PartCtxValue> = {
  none: { ghost: false, tint: 'none' },
  select: { ghost: false, tint: 'select' },
  error: { ghost: false, tint: 'error' },
  hover: { ghost: false, tint: 'hover' },
};
const GHOST_CTX: PartCtxValue = { ghost: true, tint: 'none' };

/** Click on a placed part in select mode (stable: reads the store at click time). */
function pickPart(p: PlacedPart, e: ThreeEvent<MouseEvent>) {
  const st = useStore.getState();
  if (st.tool !== 'select' || e.delta > 5) return;
  e.stopPropagation();
  if (p.type === 'pushbutton' || p.type === 'switch') st.togglePart(p.id);
  st.select(p.id);
}

/** Placed parts. Does not subscribe to the hovered hole (see PlacementGhost), and passes
 *  stable props so a part re-renders only when its own data changes. */
function Parts() {
  const layout = useStore((s) => s.layout);
  const selectedId = useStore((s) => s.selectedId);
  const highlight = useStore((s) => s.highlight);
  const showLabels = useStore((s) => s.showLabels);
  const derived = useDerived();
  const { sim, issues } = derived;

  const errorRefs = useMemo(() => new Set(issues.filter((i) => i.severity === 'error').flatMap((i) => i.refs)), [issues]);
  const hlRefs = useMemo(() => new Set(highlight?.refs ?? []), [highlight]);

  const slots = useMemo(() => assignSlots(layout.parts), [layout]);

  return (
    <group>
      {layout.parts.map((p) => (
        <PartView
          key={p.id}
          part={p}
          slot={slots.get(p.id) ?? 0}
          led={ledOf(derived, p.ref)}
          source={sim.sources.get(p.ref)}
          reading={p.type === 'ammeter' ? ammeterReading(derived, p.ref) : undefined}
          sim={sim}
          ctx={CTX[p.id === selectedId ? 'select' : hlRefs.has(p.ref) ? (highlight?.tone === 'error' ? 'error' : 'hover') : 'none']}
          label={showLabels}
          labelTone={errorRefs.has(p.ref) ? 'error' : 'normal'}
          onPick={pickPart}
          onGrab={grabPart}
        />
      ))}
      <PlacementGhost />
      <DragLayer />
    </group>
  );
}

/** Translucent preview of the part being placed, following the hovered hole. */
function PlacementGhost() {
  const tool = useStore((s) => s.tool);
  const firstHole = useStore((s) => s.firstHole);
  const hoverHole = useStore((s) => (s.tool === 'select' || s.tool === 'probe' ? null : s.hoverHole));
  const placingProps = useStore((s) => s.placingProps);
  const layout = useStore((s) => s.layout);

  const ghost = useMemo((): PlacedPart | null => {
    if (tool === 'select' || tool === 'probe' || !hoverHole) return null;
    const def = PARTS[tool];
    const props = { ...def.defaults, ...placingProps[tool], ...(tool === 'scope_probe' ? { channel: scopeChannelFor(layout) } : {}) };
    if (def.placement.kind === 'footprint') {
      const fp = def.placement.footprint(hoverHole);
      return fp ? { id: 'ghost', ref: '', type: tool, props, pins: fp } : null;
    }
    if (!firstHole || firstHole === hoverHole) return null;
    const [a, b] = def.placement.pins;
    return { id: 'ghost', ref: '', type: tool, props: { ...props, wireColor: props.wireColor ?? '#2a9d8f' }, pins: { [a]: firstHole, [b]: hoverHole } };
  }, [tool, hoverHole, firstHole, placingProps, layout]);

  const slot = useMemo(() => (ghost ? nextSlot(layout.parts, ghost.type) : 0), [ghost, layout]);
  return ghost ? <PartView part={ghost} slot={slot} ctx={GHOST_CTX} label={false} /> : null;
}

/** Watches the first frames; if they are slow (< ~20 fps), "auto" quality drops to low. */
function FrameProbe() {
  const samples = useRef<number[]>([]);
  const done = useRef(false);
  useFrame((state, dt) => {
    if (done.current) return;
    // the frame loop renders on demand: keep it running until enough frames are sampled
    state.invalidate();
    samples.current.push(dt);
    // skip the first frames (shader compilation, texture uploads), then judge ~20 frames
    if (samples.current.length < 25) return;
    done.current = true;
    const s = samples.current.slice(5).sort((a, b) => a - b);
    if (s[Math.floor(s.length / 2)] > 0.05) useQuality.getState().reportSlowFrames();
  });
  return null;
}

/** Key light; its shadow map follows the quality setting (re-allocated on change). */
function KeyLight({ size }: { size: number }) {
  const ref = useRef<THREE.DirectionalLight>(null);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const l = ref.current;
    if (!l) return;
    l.shadow.mapSize.set(size, size);
    l.shadow.map?.dispose();
    (l.shadow as { map: THREE.WebGLRenderTarget | null }).map = null;
    invalidate();
  }, [size, invalidate]);
  return (
    <directionalLight
      ref={ref}
      position={[14, 30, 16]}
      intensity={1.6}
      castShadow
      shadow-mapSize={[size, size]}
      shadow-camera-left={-30}
      shadow-camera-right={30}
      shadow-camera-top={25}
      shadow-camera-bottom={-25}
      shadow-bias={-0.0004}
    />
  );
}

export function Scene() {
  const tool = useStore((s) => s.tool);
  const low = useLowQuality();
  const q = qualityParams(low);
  return (
    // PCF shadows: three r182+ no longer has PCFSoftShadowMap (r3f's `shadows` default) and warns
    // on every render before falling back to PCF
    <Canvas
      shadows="percentage"
      frameloop="demand"
      dpr={q.dpr}
      camera={{ position: HOME.toArray(), fov: 40, near: 0.5, far: 400 }}
      style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
      onPointerMissed={() => useStore.getState().tool === 'select' && useStore.getState().select(null)}
    >
      <hemisphereLight args={['#fffaf0', '#d8cbb3', 0.9]} />
      <KeyLight size={q.shadowMapSize} />
      <directionalLight position={[-18, 14, -10]} intensity={0.35} />
      <Suspense fallback={null}>
        <Board />
        <Parts />
      </Suspense>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.92, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <shadowMaterial opacity={0.12} />
      </mesh>
      <OrbitControls makeDefault target={TARGET.toArray()} enableDamping dampingFactor={0.12} maxPolarAngle={Math.PI / 2.15} minDistance={10} maxDistance={90} />
      <CameraRig />
      <FrameProbe />
      {E2E && <E2EProbe />}
    </Canvas>
  );
}
