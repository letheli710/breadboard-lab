import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BOARD, HOLE_MAP } from '../core/breadboard';
import { PARTS } from '../core/parts';
import type { PlacedPart } from '../core/types';
import { ammeterDisplay, ledOf, useDerived, type AmmeterDisplay } from '../state/derived';
import { isPartTool, scopeChannelFor, useStore } from '../state/store';
import { OPERATED, useBenchUi } from '../state/benchUi';
import { E2E } from '../e2e/flag';
import { E2EProbe } from '../e2e/Probe';
import { Board } from './Board';
import type { PartCtxValue } from './common';
import { DragLayer, grabPart, hoverPart } from './Drag';
import { PartView } from './Parts';
import { qualityParams, useLowQuality, useQuality } from './quality';
import { bumpView, setHoleProjector, setPointProjector } from './view';
import { assignSlots, nextSlot } from './slots';
import { prefersReducedMotion } from '../ui/reveal';

const TARGET = new THREE.Vector3(0, 0, -3);
const TARGET_ARR = TARGET.toArray();
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

/** The camera pose the user last had (module-level: survives a remounted canvas / new controls). */
let savedPose: { pos: THREE.Vector3; target: THREE.Vector3 } | null = null;

function CameraRig() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
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
      let radius = Math.max(32, 21 / Math.tan(hfov / 2));
      // short, wide canvases (a phone held sideways): also fit the board's depth, aimed at its centre
      const h = gl.domElement.clientHeight;
      const short = h > 0 && h < 420;
      if (short) radius = Math.max(radius, 15 / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
      const target = short ? new THREE.Vector3(0, 0, 0.5) : TARGET.clone();
      const at = (r: number) => new THREE.Vector3().setFromSpherical(new THREE.Spherical(r, angles.phi, angles.theta)).add(target);
      // then back off until the whole board — all four power rails — is on the canvas and clear of
      // the floating toolbar where it overlaps the canvas's bottom edge
      const probe = cam.clone();
      const cr = gl.domElement.getBoundingClientRect();
      const bar = gl.domElement.closest('.stage')?.querySelector('.toolbar')?.getBoundingClientRect();
      const overlap = bar && bar.left < cr.right && bar.right > cr.left ? Math.max(0, cr.bottom - bar.top) : 0;
      const bottom = h > 0 ? -1 + (2 * (overlap + 10)) / h : -0.9;
      // and below the prompt row floating over the top of the stage (at least two lines of it)
      const topRow = gl.domElement.closest('.stage')?.querySelector('.stage-top');
      const below = topRow && getComputedStyle(topRow).position === 'absolute' ? [...topRow.children].reduce((m, c) => Math.max(m, c.getBoundingClientRect().bottom), 0) : 0;
      const topCover = below ? Math.max(below - cr.top, 58) : 0;
      const top = h > 0 ? 1 - (2 * (topCover + 6)) / h : 0.97;
      const corners = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => new THREE.Vector3((sx * BOARD.width) / 2, 0, (sz * BOARD.depth) / 2)));
      const fits = (r: number) => {
        probe.position.copy(at(r));
        probe.lookAt(target);
        probe.updateMatrixWorld();
        return corners.every((c) => {
          const v = c.clone().project(probe);
          return Math.abs(v.x) <= 0.97 && v.y <= Math.min(0.97, top) && v.y >= bottom;
        });
      };
      for (let i = 0; i < 40 && !fits(radius); i++) radius *= 1.04;
      const pos = at(radius);
      goal.current = { pos, target };
      invalidate();
    };
    window.addEventListener('bb-camera', on);
    return () => window.removeEventListener('bb-camera', on);
  }, [camera, gl, invalidate]);

  useEffect(() => {
    if (!controls) return;
    // the user grabbing the view cancels any transition
    const stop = () => (goal.current = null);
    // remember the view (the user's orbit / zoom / pan, or a preset) so a new controls object or a
    // remounted canvas puts the camera back where it was instead of resetting it
    const keep = () => (savedPose = { pos: camera.position.clone(), target: controls.target.clone() });
    controls.addEventListener('start', stop);
    controls.addEventListener('change', keep);
    const t = setTimeout(() => {
      // the default view only the very first time; afterwards the remembered one
      if (savedPose) goal.current = { pos: savedPose.pos.clone(), target: savedPose.target.clone() };
      else window.dispatchEvent(new CustomEvent('bb-camera', { detail: 'angle' }));
      if (goal.current) {
        camera.position.copy(goal.current.pos);
        controls.target.copy(goal.current.target);
        controls.update();
        goal.current = null;
        keep();
        invalidate();
      }
    }, 50);
    return () => {
      clearTimeout(t);
      controls.removeEventListener('start', stop);
      controls.removeEventListener('change', keep);
    };
  }, [controls, camera, invalidate]);

  useFrame((state, dt) => {
    const g = goal.current;
    if (!g || !controls) return;
    state.invalidate(); // demand frame loop: keep rendering until the transition ends
    // reduced motion: jump to the new view instead of flying there
    const k = prefersReducedMotion() ? 1 : 1 - Math.exp(-Math.min(dt, 0.1) * 7);
    camera.position.lerp(g.pos, k);
    controls.target.lerp(g.target, k);
    controls.update();
    if (camera.position.distanceTo(g.pos) < 0.05) goal.current = null;
  });
  return null;
}

/** Publishes where holes are on screen (three/view.ts) so 2D overlays can keep clear of them. */
function HoleView() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  useEffect(() => {
    const v = new THREE.Vector3();
    setHoleProjector((id) => {
      const h = HOLE_MAP.get(id);
      if (!h) return null;
      v.set(h.x, 0.02, h.z).project(camera);
      const r = gl.domElement.getBoundingClientRect();
      return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
    });
    const w = new THREE.Vector3();
    setPointProjector((x, y, z) => {
      w.set(x, y, z).project(camera);
      if (w.z > 1) return null;
      const r = gl.domElement.getBoundingClientRect();
      return { x: r.left + ((w.x + 1) / 2) * r.width, y: r.top + ((1 - w.y) / 2) * r.height };
    });
    return () => {
      setHoleProjector(null);
      setPointProjector(null);
    };
  }, [camera, gl]);
  useEffect(() => bumpView(), [size]);
  useEffect(() => {
    if (!controls) return;
    controls.addEventListener('change', bumpView);
    return () => controls.removeEventListener('change', bumpView);
  }, [controls]);
  return null;
}

const CTX: Record<PartCtxValue['tint'], PartCtxValue> = {
  none: { ghost: false, tint: 'none' },
  select: { ghost: false, tint: 'select' },
  error: { ghost: false, tint: 'error' },
  hover: { ghost: false, tint: 'hover' },
};
const GHOST_CTX: PartCtxValue = { ghost: true, tint: 'none' };

/** Click on a placed part in select mode (stable: reads the store at click time): select it and
 *  open its details beside it. A button or switch is operated instead (its details are in the
 *  right-click menu). */
function pickPart(p: PlacedPart, e: ThreeEvent<MouseEvent>) {
  const st = useStore.getState();
  if (st.tool !== 'select' || e.delta > 5) return;
  e.stopPropagation();
  if (OPERATED.has(p.type)) st.togglePart(p.id);
  st.select(p.id);
  useBenchUi.getState().openPopover(OPERATED.has(p.type) ? null : p.id);
}

/** Placed parts. Does not subscribe to the hovered hole (see PlacementGhost), and passes
 *  stable props so a part re-renders only when its own data changes. */
function Parts() {
  const layout = useStore((s) => s.layout);
  const selectedId = useStore((s) => s.selectedId);
  const highlight = useStore((s) => s.highlight);
  const showLabels = useStore((s) => s.showLabels);
  const eraseHover = useBenchUi((s) => s.eraseHover);
  const derived = useDerived();
  const { sim, issues } = derived;

  const errorRefs = useMemo(() => new Set(issues.filter((i) => i.severity === 'error').flatMap((i) => i.refs)), [issues]);
  const hlRefs = useMemo(() => new Set(highlight?.refs ?? []), [highlight]);

  const slots = useMemo(() => assignSlots(layout.parts), [layout]);

  return (
    <group>
      {layout.parts.map((p) => {
        const am: AmmeterDisplay | undefined = p.type === 'ammeter' ? ammeterDisplay(derived, p.ref, p.props.meterMode) : undefined;
        return (
          <PartView
            key={p.id}
            part={p}
            slot={slots.get(p.id) ?? 0}
            led={ledOf(derived, p.ref)}
            source={sim.sources.get(p.ref)}
            reading={am?.value}
            readingKind={am?.kind}
            readingAuto={am?.auto}
            sim={sim}
            ctx={CTX[p.id === eraseHover ? 'error' : p.id === selectedId ? 'select' : hlRefs.has(p.ref) ? (highlight?.tone === 'error' ? 'error' : 'hover') : 'none']}
            label={showLabels}
            labelTone={errorRefs.has(p.ref) ? 'error' : 'normal'}
            onPick={pickPart}
            onGrab={grabPart}
            onHover={hoverPart}
          />
        );
      })}
      <PlacementGhost />
      <DragLayer />
    </group>
  );
}

/** Translucent preview of the part being placed, following the hovered hole. */
function PlacementGhost() {
  const tool = useStore((s) => s.tool);
  const firstHole = useStore((s) => s.firstHole);
  const hoverHole = useStore((s) => (isPartTool(s.tool) ? s.hoverHole : null));
  const placingProps = useStore((s) => s.placingProps);
  const layout = useStore((s) => s.layout);

  const ghost = useMemo((): PlacedPart | null => {
    if (!isPartTool(tool) || !hoverHole) return null;
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

/** Eraser cursor (hotspot at the eraser's tip). */
const ERASER_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 26 26'%3E%3Cg transform='rotate(-35 13 13)'%3E%3Crect x='5' y='8' width='17' height='10' rx='2' fill='%23f3a6a6' stroke='%231f2a44' stroke-width='1.6'/%3E%3Crect x='5' y='8' width='6' height='10' rx='2' fill='%231f2a44'/%3E%3C/g%3E%3C/svg%3E\") 4 20, cell";

// Mouse: left-drag on empty space and right-drag pan (along the table), the wheel zooms, the
// middle button — or Shift + left-drag, for trackpads — orbits. Left on a part selects / moves it.
// The eraser keeps the left button for erasing strokes.
const PAN = THREE.MOUSE.PAN;
const ROTATE = THREE.MOUSE.ROTATE;
const MOUSE_SELECT = { LEFT: PAN, MIDDLE: ROTATE, RIGHT: PAN };
const MOUSE_ERASE = { LEFT: -1 as unknown as THREE.MOUSE, MIDDLE: ROTATE, RIGHT: PAN };

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
      style={{ cursor: tool === 'select' ? 'default' : tool === 'eraser' ? ERASER_CURSOR : 'crosshair' }}
      onPointerMissed={(e) => e.button === 0 && useStore.getState().tool === 'select' && useStore.getState().select(null)}
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
      <OrbitControls
        makeDefault
        target={TARGET_ARR}
        enableDamping
        dampingFactor={0.12}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={10}
        maxDistance={90}
        screenSpacePanning={false}
        mouseButtons={tool === 'eraser' ? MOUSE_ERASE : MOUSE_SELECT}
      />
      <CameraRig />
      <HoleView />
      <FrameProbe />
      {E2E && <E2EProbe />}
    </Canvas>
  );
}
