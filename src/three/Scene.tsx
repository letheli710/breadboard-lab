import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { PARTS } from '../core/parts';
import type { PlacedPart } from '../core/types';
import { ammeterReading, ledOf, useDerived } from '../state/derived';
import { scopeChannelFor, useStore } from '../state/store';
import { Board } from './Board';
import { PartView } from './Parts';
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
    };
    window.addEventListener('bb-camera', on);
    return () => window.removeEventListener('bb-camera', on);
  }, [camera]);

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
      }
    }, 50);
    return () => {
      clearTimeout(t);
      controls.removeEventListener('start', stop);
    };
  }, [controls, camera]);

  useFrame((_, dt) => {
    const g = goal.current;
    if (!g || !controls) return;
    const k = 1 - Math.exp(-dt * 7);
    camera.position.lerp(g.pos, k);
    controls.target.lerp(g.target, k);
    controls.update();
    if (camera.position.distanceTo(g.pos) < 0.05) goal.current = null;
  });
  return null;
}

function Parts() {
  const layout = useStore((s) => s.layout);
  const tool = useStore((s) => s.tool);
  const selectedId = useStore((s) => s.selectedId);
  const highlight = useStore((s) => s.highlight);
  const showLabels = useStore((s) => s.showLabels);
  const firstHole = useStore((s) => s.firstHole);
  const hoverHole = useStore((s) => s.hoverHole);
  const placingProps = useStore((s) => s.placingProps);
  const select = useStore((s) => s.select);
  const togglePart = useStore((s) => s.togglePart);
  const derived = useDerived();
  const { sim, issues } = derived;

  const errorRefs = useMemo(() => new Set(issues.filter((i) => i.severity === 'error').flatMap((i) => i.refs)), [issues]);
  const hlRefs = useMemo(() => new Set(highlight?.refs ?? []), [highlight]);

  const slots = useMemo(() => assignSlots(layout.parts), [layout]);

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

  const handle = (p: PlacedPart) => (e: ThreeEvent<MouseEvent>) => {
    if (tool !== 'select' || e.delta > 5) return;
    e.stopPropagation();
    if (p.type === 'pushbutton' || p.type === 'switch') togglePart(p.id);
    select(p.id);
  };

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
          ctx={{ ghost: false, tint: p.id === selectedId ? 'select' : hlRefs.has(p.ref) ? (highlight?.tone === 'error' ? 'error' : 'hover') : 'none' }}
          label={showLabels}
          labelTone={errorRefs.has(p.ref) ? 'error' : 'normal'}
          onClick={handle(p)}
        />
      ))}
      {ghost && <PartView part={ghost} slot={nextSlot(layout.parts, ghost.type)} ctx={{ ghost: true, tint: 'none' }} label={false} />}
    </group>
  );
}

export function Scene() {
  const tool = useStore((s) => s.tool);
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: HOME.toArray(), fov: 40, near: 0.5, far: 400 }}
      style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
      onPointerMissed={() => useStore.getState().tool === 'select' && useStore.getState().select(null)}
    >
      <hemisphereLight args={['#fffaf0', '#d8cbb3', 0.9]} />
      <directionalLight
        position={[14, 30, 16]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0004}
      />
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
    </Canvas>
  );
}
