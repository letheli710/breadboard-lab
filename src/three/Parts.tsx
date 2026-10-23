import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { tr } from '../core/i18n';
import { colX } from '../core/breadboard';
import { amps, resistorBands, volts } from '../core/format';
import { BATTERIES, LED_COLORS } from '../core/parts';
import type { LedState, SourceState } from '../core/solver';
import type { PlacedPart } from '../core/types';
import { Leg, Mat, PartCtx, type PartCtxValue, Seg, TextPlane, Tube, holeVec } from './common';
import { Ammeter, FunctionGen, Inductor, OpAmp, ScopeProbe, instrumentAnchor, instrumentLabel } from './Instruments';
import { slotPosition } from './slots';

export interface PartViewProps {
  part: PlacedPart;
  led?: LedState;
  source?: SourceState;
  /** slot index for off-board equipment (see slots.ts) */
  slot: number;
  /** ammeter: live reading in amps (current flowing in at the red lead) */
  reading?: number;
  ctx: PartCtxValue;
  label: boolean;
  labelTone?: 'error' | 'normal';
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Frame aligned with the line between two holes: origin at the midpoint, +x towards b. */
export function useSpan(a: string | undefined, b: string | undefined) {
  return useMemo(() => {
    const pa = holeVec(a ?? '');
    const pb = holeVec(b ?? '');
    const mid = pa.clone().add(pb).multiplyScalar(0.5);
    const d = pb.clone().sub(pa);
    const len = d.length();
    const angle = Math.atan2(-d.z, d.x);
    return { pa, pb, mid, len, angle };
  }, [a, b]);
}

function Wire({ part }: PartViewProps) {
  const { pa, pb, len } = useSpan(part.pins.a, part.pins.b);
  const pts = useMemo(() => {
    const h = 0.5 + Math.min(len, 14) * 0.12;
    const dir = pb.clone().sub(pa).normalize();
    return [
      pa.clone().setY(0.25),
      pa.clone().setY(h * 0.75).add(dir.clone().multiplyScalar(Math.min(0.4, len * 0.15))),
      pa.clone().lerp(pb, 0.5).setY(h),
      pb.clone().setY(h * 0.75).sub(dir.clone().multiplyScalar(Math.min(0.4, len * 0.15))),
      pb.clone().setY(0.25),
    ];
  }, [pa, pb, len]);
  return (
    <group>
      <Tube pts={pts} color={part.props.wireColor ?? '#2a9d8f'} r={0.13} />
      <Seg a={pa.clone().setY(-0.3)} b={pa.clone().setY(0.3)} r={0.07} />
      <Seg a={pb.clone().setY(-0.3)} b={pb.clone().setY(0.3)} r={0.07} />
    </group>
  );
}

function AxialBody({ part, kind }: { part: PlacedPart; kind: 'resistor' | 'diode' }) {
  const [p1, p2] = kind === 'resistor' ? ['1', '2'] : ['anode', 'cathode'];
  const { mid, len, angle } = useSpan(part.pins[p1], part.pins[p2]);
  const h = 0.75;
  const body = kind === 'resistor' ? Math.min(2.3, Math.max(len - 0.9, 0.9)) : Math.min(1.5, Math.max(len - 0.8, 0.7));
  const r = kind === 'resistor' ? 0.32 : 0.22;
  const bands = kind === 'resistor' ? resistorBands(part.props.resistance ?? 0) : [];
  return (
    <group position={mid} rotation={[0, angle, 0]}>
      <Leg pts={[V(-len / 2, -0.3, 0), V(-len / 2, h, 0), V(-body / 2, h, 0)]} />
      <Leg pts={[V(len / 2, -0.3, 0), V(len / 2, h, 0), V(body / 2, h, 0)]} />
      <mesh position={[0, h, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[r, Math.max(body - 2 * r, 0.05), 6, 16]} />
        <Mat color={kind === 'resistor' ? '#dcc59c' : '#202226'} roughness={0.5} />
      </mesh>
      {kind === 'resistor' &&
        bands.map((b, i) => {
          const x = -body / 2 + r * 0.9 + i * ((body - 2 * r * 0.9) / 3.6) + (i === 3 ? (body - 2 * r * 0.9) / 7 : 0);
          return (
            <mesh key={i} position={[x, h, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[r + 0.012, r + 0.012, 0.13, 16]} />
              <Mat color={b.hex} roughness={0.4} />
            </mesh>
          );
        })}
      {kind === 'diode' && (
        <mesh position={[body / 2 - 0.22, h, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r + 0.01, r + 0.01, 0.14, 16]} />
          <Mat color="#d7dade" metalness={0.5} />
        </mesh>
      )}
    </group>
  );
}

function Led({ part, led }: PartViewProps) {
  const pa = holeVec(part.pins.anode ?? '');
  const pk = holeVec(part.pins.cathode ?? '');
  const mid = pa.clone().add(pk).multiplyScalar(0.5);
  const col = LED_COLORS[part.props.color ?? 'red'];
  const b = led?.burnt ? 0 : (led?.brightness ?? 0);
  const top = 1.55;
  const sep = pk.clone().sub(pa).setY(0).normalize().multiplyScalar(0.22);
  const la = mid.clone().sub(sep).setY(top - 0.2);
  const lk = mid.clone().add(sep).setY(top - 0.2);
  const smoke = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!smoke.current) return;
    smoke.current.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.6 + i / 3) % 1;
      c.position.y = top + 0.6 + t * 2.2;
      c.scale.setScalar(0.2 + t * 0.5);
      ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.5 * (1 - t);
    });
  });
  return (
    <group>
      {/* anode leg is longer: give it a little kink */}
      <Leg pts={[pa.clone().setY(-0.3), pa.clone().setY(0.6), pa.clone().lerp(la, 0.5).setY(0.85), la]} />
      <Leg pts={[pk.clone().setY(-0.3), pk.clone().setY(0.9), lk]} />
      <group position={[mid.x, top, mid.z]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.56, 0.56, 0.12, 24]} />
          <Mat color={led?.burnt ? '#3a3a3a' : col.hex} opacity={0.85} emissive={col.hex} emissiveIntensity={b * 1.2} />
        </mesh>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.48, 0.48, 0.62, 24]} />
          <Mat color={led?.burnt ? '#3a3a3a' : col.hex} opacity={0.72} emissive={col.hex} emissiveIntensity={b * 2.2} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <sphereGeometry args={[0.48, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Mat color={led?.burnt ? '#3a3a3a' : col.hex} opacity={0.72} emissive={col.hex} emissiveIntensity={b * 2.2} roughness={0.2} />
        </mesh>
        {b > 0.02 && <pointLight color={col.hex} intensity={b * 6} distance={7} decay={1.6} position={[0, 0.6, 0]} />}
        {b > 0.02 && (
          <mesh position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.95 + b * 0.4, 16, 12]} />
            <meshBasicMaterial color={col.hex} transparent opacity={0.12 * b} depthWrite={false} toneMapped={false} />
          </mesh>
        )}
      </group>
      {led?.burnt && (
        <group ref={smoke} position={[mid.x, 0, mid.z]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.6, 10, 8]} />
              <meshStandardMaterial color="#8d8d8d" transparent opacity={0.4} depthWrite={false} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function Capacitor({ part }: PartViewProps) {
  const { mid, len, angle } = useSpan(part.pins['1'], part.pins['2']);
  const h = 1.3;
  return (
    <group position={mid} rotation={[0, angle, 0]}>
      <Leg pts={[V(-len / 2, -0.3, 0), V(-len / 2, 0.5, 0), V(-0.18, h - 0.4, 0)]} />
      <Leg pts={[V(len / 2, -0.3, 0), V(len / 2, 0.5, 0), V(0.18, h - 0.4, 0)]} />
      <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.22, 24]} />
        <Mat color="#e9a23b" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Pushbutton({ part, onClick }: PartViewProps) {
  const ps = ['1a', '2a', '1b', '2b'].map((p) => holeVec(part.pins[p] ?? ''));
  const c = ps.reduce((s, p) => s.add(p), V(0, 0, 0)).multiplyScalar(0.25);
  const pressed = !!part.props.pressed;
  return (
    <group onClick={onClick}>
      {ps.map((p, i) => (
        <Leg key={i} pts={[p.clone().setY(-0.3), p.clone().setY(0.35), c.clone().lerp(p, 0.55).setY(0.45)]} r={0.07} />
      ))}
      <mesh position={[c.x, 0.6, c.z]} castShadow>
        <boxGeometry args={[2.3, 0.55, 2.3]} />
        <Mat color="#2b2d33" roughness={0.6} />
      </mesh>
      <mesh position={[c.x, 0.9, c.z]}>
        <boxGeometry args={[2.0, 0.08, 2.0]} />
        <Mat color="#c9ccd1" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[c.x, pressed ? 1.0 : 1.2, c.z]} castShadow>
        <cylinderGeometry args={[0.7, 0.75, 0.5, 24]} />
        <Mat color={pressed ? '#ff6b6b' : '#e63946'} roughness={0.4} />
      </mesh>
    </group>
  );
}

function SlideSwitch({ part, onClick }: PartViewProps) {
  const pa = holeVec(part.pins.a ?? '');
  const pc = holeVec(part.pins.com ?? '');
  const pb = holeVec(part.pins.b ?? '');
  const dir = pb.clone().sub(pa).normalize();
  const knob = pc.clone().add(dir.clone().multiplyScalar(part.props.position === 'b' ? 0.45 : -0.45));
  const angle = Math.atan2(-dir.z, dir.x);
  return (
    <group onClick={onClick}>
      {[pa, pc, pb].map((p, i) => (
        <Seg key={i} a={p.clone().setY(-0.3)} b={p.clone().setY(0.4)} r={0.07} />
      ))}
      <mesh position={[pc.x, 0.75, pc.z]} rotation={[0, angle, 0]} castShadow>
        <boxGeometry args={[3.0, 0.8, 1.2]} />
        <Mat color="#3d5a80" roughness={0.5} />
      </mesh>
      <mesh position={[knob.x, 1.35, knob.z]} rotation={[0, angle, 0]} castShadow>
        <boxGeometry args={[0.7, 0.55, 0.6]} />
        <Mat color="#f1f1f1" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Pot({ part, onClick }: PartViewProps) {
  const ps = ['1', '2', '3'].map((p) => holeVec(part.pins[p] ?? ''));
  const c = ps[1];
  const dir = ps[2].clone().sub(ps[0]).normalize();
  const angle = Math.atan2(-dir.z, dir.x);
  const w = part.props.wiper ?? 0.5;
  return (
    <group onClick={onClick}>
      {ps.map((p, i) => (
        <Seg key={i} a={p.clone().setY(-0.3)} b={p.clone().setY(0.4)} r={0.07} />
      ))}
      <group position={[c.x, 0, c.z]} rotation={[0, angle, 0]}>
        <mesh position={[0, 0.8, -0.6]} castShadow>
          <boxGeometry args={[2.8, 0.9, 2.4]} />
          <Mat color="#2b59c3" roughness={0.5} />
        </mesh>
        <group position={[0, 1.45, -0.6]} rotation={[0, -(w - 0.5) * 1.5 * Math.PI, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.85, 0.85, 0.45, 24]} />
            <Mat color="#f4f1ea" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.24, -0.45]}>
            <boxGeometry args={[0.14, 0.05, 0.75]} />
            <Mat color="#1f2a44" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function leadPoints(from: THREE.Vector3, hole: string | undefined, sag = 2.2): THREE.Vector3[] | null {
  if (!hole) return null;
  const to = holeVec(hole);
  const mid = from.clone().lerp(to, 0.5);
  mid.y = Math.max(from.y, 1) + sag * 0.4;
  return [from, from.clone().lerp(mid, 0.5).setY(from.y + 0.6), mid, to.clone().setY(1.0), to.clone().setY(0.2)];
}

export function Leads({ base, part, plusAt, minusAt }: { base: THREE.Vector3; part: PlacedPart; plusAt: THREE.Vector3; minusAt: THREE.Vector3 }) {
  const lp = leadPoints(base.clone().add(plusAt), part.pins['+']);
  const ln = leadPoints(base.clone().add(minusAt), part.pins['-']);
  return (
    <>
      {lp && <Tube pts={lp} color="#d62828" r={0.12} />}
      {ln && <Tube pts={ln} color="#1b1b1b" r={0.12} />}
      {part.pins['+'] && <Seg a={holeVec(part.pins['+']).setY(-0.3)} b={holeVec(part.pins['+']).setY(0.3)} r={0.07} />}
      {part.pins['-'] && <Seg a={holeVec(part.pins['-']).setY(-0.3)} b={holeVec(part.pins['-']).setY(0.3)} r={0.07} />}
    </>
  );
}

function Battery({ part, slot, onClick }: PartViewProps) {
  const base = slotPosition(slot);
  const variant = part.props.variant ?? '9V';
  const info = BATTERIES[variant];
  if (variant === '9V') {
    return (
      <group onClick={onClick}>
        <group position={base} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[2.6, 1.8, 4.6]} />
            <Mat color="#26303f" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.9, 1.0]}>
            <boxGeometry args={[2.64, 1.84, 1.6]} />
            <Mat color="#f2b134" roughness={0.5} />
          </mesh>
          <TextPlane text="9V" width={2.2} height={1.1} color="#f7f2e7" position={[0, 1.81, -0.9]} rotation={[-Math.PI / 2, 0, 0]} />
          <mesh position={[0.55, 1.9, -1.9]}>
            <cylinderGeometry args={[0.32, 0.32, 0.3, 6]} />
            <Mat color="#c9ccd1" metalness={0.7} />
          </mesh>
          <mesh position={[-0.55, 1.9, -1.9]}>
            <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
            <Mat color="#c9ccd1" metalness={0.7} />
          </mesh>
        </group>
        <Leads base={base} part={part} plusAt={V(-0.55, 2.05, 1.9)} minusAt={V(0.55, 2.05, 1.9)} />
      </group>
    );
  }
  if (variant === 'CR2032') {
    return (
      <group onClick={onClick}>
        <group position={base} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[3, 0.6, 3]} />
            <Mat color="#2b2d33" />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[1.2, 1.2, 0.32, 32]} />
            <Mat color="#c9ccd1" metalness={0.8} roughness={0.25} />
          </mesh>
          <TextPlane text="CR2032" width={2} height={0.6} position={[0, 0.92, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        </group>
        <Leads base={base} part={part} plusAt={V(-0.9, 0.6, 1.2)} minusAt={V(0.9, 0.6, 1.2)} />
      </group>
    );
  }
  const n = variant === '2xAA' ? 2 : variant === '3xAA' ? 3 : 4;
  const w = n * 1.25 + 0.4;
  return (
    <group onClick={onClick}>
      <group position={base} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[w, 0.9, 5.8]} />
          <Mat color="#2b2d33" roughness={0.7} />
        </mesh>
        {Array.from({ length: n }, (_, i) => (
          <group key={i} position={[-w / 2 + 0.825 + i * 1.25, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.55, 0.55, 5.0, 20]} />
              <Mat color={i % 2 ? '#2a9d8f' : '#264653'} roughness={0.4} />
            </mesh>
            <mesh position={[0, i % 2 ? 2.55 : -2.55, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
              <Mat color="#c9ccd1" metalness={0.8} />
            </mesh>
          </group>
        ))}
        <TextPlane text={info.name} width={w + 0.6} height={0.7} position={[0, 0.02, 3.4]} rotation={[-Math.PI / 2, 0, 0]} />
      </group>
      <Leads base={base} part={part} plusAt={V(-(w / 2 - 0.3), 0.6, 2.9)} minusAt={V(w / 2 - 0.3, 0.6, 2.9)} />
    </group>
  );
}

function BenchSupply({ part, slot, source, onClick }: PartViewProps) {
  const base = slotPosition(slot);
  const v = source?.terminalVoltage ?? 0;
  const i = source?.current ?? 0;
  const cc = source?.ccMode ?? false;
  return (
    <group onClick={onClick}>
      <group position={base}>
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[7.2, 3.6, 4.6]} />
          <Mat color="#e9e4d8" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.8, 2.31]}>
          <planeGeometry args={[6.8, 3.2]} />
          <Mat color="#3a3f4b" roughness={0.7} />
        </mesh>
        <TextPlane
          text={[`${Math.abs(v).toFixed(2)} V`, `${Math.abs(i).toFixed(3)} A`]}
          width={3.4}
          height={1.8}
          bg="#0f1a12"
          color="#7dff9b"
          font='700 92px "Barlow Condensed", monospace'
          position={[-1.3, 2.25, 2.33]}
        />
        <TextPlane
          text={cc ? 'CC' : 'CV'}
          width={0.9}
          height={0.5}
          bg={cc ? '#e63946' : '#2ba59b'}
          color="#fff"
          position={[-1.3, 1.0, 2.33]}
        />
        <TextPlane text={tr(`设定 ${part.props.voltage ?? 5}V / ${part.props.currentLimit ?? 0.1}A`, `SET ${part.props.voltage ?? 5}V / ${part.props.currentLimit ?? 0.1}A`)} width={3.2} height={0.4} color="#d9dce2" font='500 44px "Barlow", "Microsoft YaHei", sans-serif' position={[-1.3, 0.55, 2.33]} />
        {[1.6, 2.6].map((x, k) => (
          <mesh key={k} position={[x, 2.6, 2.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.35, 20]} />
            <Mat color="#c7c9ce" metalness={0.3} />
          </mesh>
        ))}
        <mesh position={[1.6, 1.0, 2.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.4, 16]} />
          <Mat color="#d62828" />
        </mesh>
        <mesh position={[2.6, 1.0, 2.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.4, 16]} />
          <Mat color="#1b1b1b" />
        </mesh>
      </group>
      <Leads base={base} part={part} plusAt={V(1.6, 1.0, 2.65)} minusAt={V(2.6, 1.0, 2.65)} />
    </group>
  );
}

function PowerModule({ part, onClick }: PartViewProps) {
  const tp = holeVec(part.pins['+t'] ?? '');
  const x = tp.x;
  const pins = ['+t', '-t', '+b', '-b'].map((p) => holeVec(part.pins[p] ?? ''));
  const y = 1.3;
  return (
    <group onClick={onClick}>
      {pins.map((p, i) => (
        <Seg key={i} a={p.clone().setY(-0.3)} b={p.clone().setY(y)} r={0.08} color="#d4af37" />
      ))}
      <mesh position={[x - 0.6, y + 0.08, 0]} castShadow>
        <boxGeometry args={[3.4, 0.16, 20.2]} />
        <Mat color="#c0392b" roughness={0.6} />
      </mesh>
      <mesh position={[x - 1.4, y + 0.6, 0]} castShadow>
        <boxGeometry args={[1.8, 0.9, 2.4]} />
        <Mat color="#c9ccd1" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[x - 1.4, y + 0.7, 4]} castShadow>
        <boxGeometry args={[1.8, 1.2, 1.8]} />
        <Mat color="#1b1b1b" />
      </mesh>
      <mesh position={[x - 0.2, y + 0.3, -3.5]}>
        <sphereGeometry args={[0.25, 12, 8]} />
        <meshBasicMaterial color="#5cff7a" toneMapped={false} />
      </mesh>
      {[-6.5, 6.5].map((z) => (
        <TextPlane
          key={z}
          text={`${part.props.voltage ?? 5}V`}
          width={2.2}
          height={1}
          color="#fff"
          position={[x - 0.6, y + 0.17, z]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        />
      ))}
    </group>
  );
}

export function PartView(props: PartViewProps) {
  const { part, ctx, label, labelTone, led, source } = props;
  const anchor = useMemo(() => {
    const holes = Object.values(part.pins).map((h) => holeVec(h));
    if (part.type === 'battery' || part.type === 'bench_supply') return slotPosition(props.slot).add(V(0, part.type === 'bench_supply' ? 4.4 : 2.6, 0));
    const inst = instrumentAnchor(part, props.slot);
    if (inst) return inst;
    if (holes.length === 0) return V(0, 0, 0);
    const c = holes.reduce((s, p) => s.add(p), V(0, 0, 0)).multiplyScalar(1 / holes.length);
    c.y = part.type === 'wire' ? 1.4 : 2.4;
    if (part.type === 'power_module') c.set(colX(1), 2.8, 0).setX(holes[0].x - 0.6);
    return c;
  }, [part, props.slot]);

  let body: JSX.Element | null = null;
  switch (part.type) {
    case 'wire':
      body = <Wire {...props} />;
      break;
    case 'resistor':
      body = <AxialBody part={part} kind="resistor" />;
      break;
    case 'diode':
      body = <AxialBody part={part} kind="diode" />;
      break;
    case 'led':
      body = <Led {...props} />;
      break;
    case 'capacitor':
      body = <Capacitor {...props} />;
      break;
    case 'pushbutton':
      body = <Pushbutton {...props} />;
      break;
    case 'switch':
      body = <SlideSwitch {...props} />;
      break;
    case 'potentiometer':
      body = <Pot {...props} />;
      break;
    case 'battery':
      body = <Battery {...props} />;
      break;
    case 'bench_supply':
      body = <BenchSupply {...props} />;
      break;
    case 'power_module':
      body = <PowerModule {...props} />;
      break;
    case 'inductor':
      body = <Inductor {...props} />;
      break;
    case 'opamp':
      body = <OpAmp {...props} />;
      break;
    case 'ammeter':
      body = <Ammeter {...props} />;
      break;
    case 'function_gen':
      body = <FunctionGen {...props} />;
      break;
    case 'scope_probe':
      body = <ScopeProbe {...props} />;
      break;
  }
  const extra =
    part.type === 'led' && led
      ? led.burnt
        ? tr(' 烧坏', ' burnt')
        : led.on
          ? ` ${amps(led.current)}`
          : ''
      : (part.type === 'battery' || part.type === 'power_module') && source
        ? ` ${volts(source.terminalVoltage)}`
        : instrumentLabel(part, props.reading);
  return (
    <PartCtx.Provider value={ctx}>
      <group onClick={part.type === 'pushbutton' || part.type === 'switch' || part.type === 'potentiometer' || part.type === 'battery' || part.type === 'bench_supply' || part.type === 'power_module' || part.type === 'ammeter' || part.type === 'function_gen' ? undefined : props.onClick}>
        {body}
      </group>
      {label && !ctx.ghost && part.type !== 'wire' && (
        <Html position={anchor} center style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
          <div className={`part-label ${labelTone === 'error' ? 'err' : ''} ${ctx.tint === 'select' ? 'sel' : ''}`}>
            {part.ref}
            {extra && <small>{extra}</small>}
          </div>
        </Html>
      )}
    </PartCtx.Provider>
  );
}
