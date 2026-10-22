import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber';
import { Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { PARTS } from '../core/parts';
import type { PlacedPart } from '../core/types';
import { useDerived } from '../state/derived';
import { useStore } from '../state/store';
import { Board } from './Board';
import { PartView } from './Parts';

const TARGET = new THREE.Vector3(0, 0, -3);
const HOME = new THREE.Vector3(0, 30, 25);

function CameraRig() {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  useEffect(() => {
    const on = (e: Event) => {
      const cmd = (e as CustomEvent<string>).detail;
      const target = controls?.target ?? new THREE.Vector3();
      const off = camera.position.clone().sub(target);
      const sph = new THREE.Spherical().setFromVector3(off);
      if (cmd === 'left') sph.theta -= Math.PI / 8;
      if (cmd === 'right') sph.theta += Math.PI / 8;
      if (cmd === 'in') sph.radius = Math.max(10, sph.radius * 0.82);
      if (cmd === 'out') sph.radius = Math.min(90, sph.radius / 0.82);
      if (cmd === 'top') {
        sph.phi = 0.05;
        sph.theta = 0;
      }
      if (cmd === 'reset') {
        target.copy(TARGET);
        sph.setFromVector3(HOME.clone().sub(TARGET));
        // fit ~38 units of width (board + margin) into the current viewport
        const cam = camera as THREE.PerspectiveCamera;
        const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect);
        sph.radius = Math.max(32, 21 / Math.tan(hfov / 2));
      }
      camera.position.copy(new THREE.Vector3().setFromSpherical(sph).add(target));
      camera.lookAt(target);
      controls?.update();
    };
    window.addEventListener('bb-camera', on);
    return () => window.removeEventListener('bb-camera', on);
  }, [camera, controls]);
  useEffect(() => {
    if (!controls) return;
    const t = setTimeout(() => window.dispatchEvent(new CustomEvent('bb-camera', { detail: 'reset' })), 50);
    return () => clearTimeout(t);
  }, [controls]);
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
  const { sim, issues } = useDerived();

  const errorRefs = useMemo(() => new Set(issues.filter((i) => i.severity === 'error').flatMap((i) => i.refs)), [issues]);
  const hlRefs = useMemo(() => new Set(highlight?.refs ?? []), [highlight]);

  const slots = useMemo(() => {
    const m = new Map<string, number>();
    let i = 0;
    for (const p of layout.parts) if (p.type === 'battery' || p.type === 'bench_supply') m.set(p.id, i++);
    return m;
  }, [layout]);

  const ghost = useMemo((): PlacedPart | null => {
    if (tool === 'select' || tool === 'probe' || !hoverHole) return null;
    const def = PARTS[tool];
    const props = { ...def.defaults, ...placingProps[tool] };
    if (def.placement.kind === 'footprint') {
      const fp = def.placement.footprint(hoverHole);
      return fp ? { id: 'ghost', ref: '', type: tool, props, pins: fp } : null;
    }
    if (!firstHole || firstHole === hoverHole) return null;
    const [a, b] = def.placement.pins;
    return { id: 'ghost', ref: '', type: tool, props: { ...props, wireColor: props.wireColor ?? '#2a9d8f' }, pins: { [a]: firstHole, [b]: hoverHole } };
  }, [tool, hoverHole, firstHole, placingProps]);

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
          led={sim.leds.get(p.ref)}
          source={sim.sources.get(p.ref)}
          ctx={{ ghost: false, tint: p.id === selectedId ? 'select' : hlRefs.has(p.ref) ? (highlight?.tone === 'error' ? 'error' : 'hover') : 'none' }}
          label={showLabels}
          labelTone={errorRefs.has(p.ref) ? 'error' : 'normal'}
          onClick={handle(p)}
        />
      ))}
      {ghost && <PartView part={ghost} slot={slots.size} ctx={{ ghost: true, tint: 'none' }} label={false} />}
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
