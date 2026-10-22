import { createContext, useContext, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { HOLE_MAP } from '../core/breadboard';

export const BOARD_TOP = 0;

export function holeVec(id: string, y = 0): THREE.Vector3 {
  const h = HOLE_MAP.get(id);
  return h ? new THREE.Vector3(h.x, y, h.z) : new THREE.Vector3(0, y, 0);
}

export interface PartCtxValue {
  ghost: boolean;
  tint: 'none' | 'select' | 'error' | 'hover';
}
export const PartCtx = createContext<PartCtxValue>({ ghost: false, tint: 'none' });

const TINT: Record<PartCtxValue['tint'], string | null> = {
  none: null,
  select: '#2ba59b',
  error: '#e5383b',
  hover: '#7fc8c0',
};

/** Standard material that respects ghost / highlight context. */
export function Mat({
  color,
  emissive,
  emissiveIntensity = 0,
  roughness = 0.55,
  metalness = 0,
  opacity = 1,
  transparent,
}: {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;
}) {
  const ctx = useContext(PartCtx);
  const tint = TINT[ctx.tint];
  const op = ctx.ghost ? Math.min(opacity, 0.45) : opacity;
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={tint ?? emissive ?? '#000000'}
      emissiveIntensity={tint ? 0.45 : emissiveIntensity}
      transparent={transparent || op < 1}
      opacity={op}
      depthWrite={op >= 1}
    />
  );
}

const up = new THREE.Vector3(0, 1, 0);

/** Cylinder between two points (legs, leads). */
export function Seg({ a, b, r = 0.06, color = '#b8bcc2', metal = true }: { a: THREE.Vector3; b: THREE.Vector3; r?: number; color?: string; metal?: boolean }) {
  const { pos, quat, len } = useMemo(() => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const pos = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, d.clone().normalize());
    return { pos, quat, len };
  }, [a, b]);
  if (len < 1e-4) return null;
  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <cylinderGeometry args={[r, r, len, 8]} />
      <Mat color={color} metalness={metal ? 0.7 : 0} roughness={metal ? 0.3 : 0.6} />
    </mesh>
  );
}

/** Polyline of segments with rounded joints. */
export function Leg({ pts, r = 0.06, color }: { pts: THREE.Vector3[]; r?: number; color?: string }) {
  return (
    <group>
      {pts.slice(1).map((p, i) => (
        <Seg key={i} a={pts[i]} b={p} r={r} color={color} />
      ))}
      {pts.slice(1, -1).map((p, i) => (
        <mesh key={`j${i}`} position={p}>
          <sphereGeometry args={[r, 8, 6]} />
          <Mat color={color ?? '#b8bcc2'} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** Smooth flexible lead (jumper wire, battery lead). */
export function Tube({ pts, r = 0.12, color }: { pts: THREE.Vector3[]; r?: number; color: string }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    return new THREE.TubeGeometry(curve, 48, r, 10, false);
  }, [pts, r]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} castShadow>
      <Mat color={color} roughness={0.45} />
    </mesh>
  );
}

/** A plane showing text rendered to a canvas (works offline and with CJK). */
export function TextPlane({
  text,
  width,
  height,
  color = '#1f2a44',
  bg = 'transparent',
  font = '600 64px "Barlow Condensed", "Microsoft YaHei", sans-serif',
  ...rest
}: {
  text: string | string[];
  width: number;
  height: number;
  color?: string;
  bg?: string;
  font?: string;
} & JSX.IntrinsicElements['mesh']) {
  const tex = useMemo(() => {
    const lines = Array.isArray(text) ? text : [text];
    const c = document.createElement('canvas');
    const px = 128;
    c.width = Math.round(px * width);
    c.height = Math.round(px * height);
    const g = c.getContext('2d')!;
    if (bg !== 'transparent') {
      g.fillStyle = bg;
      g.fillRect(0, 0, c.width, c.height);
    }
    g.fillStyle = color;
    g.font = font;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const lh = c.height / lines.length;
    lines.forEach((l, i) => g.fillText(l, c.width / 2, lh * (i + 0.5), c.width * 0.95));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [text, width, height, color, bg, font]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh {...rest}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
}

/** Ask the 3D scene to move the camera to a preset view (see VIEWS in Scene.tsx). */
export function emitCameraView(view: string) {
  window.dispatchEvent(new CustomEvent('bb-camera', { detail: view }));
}
