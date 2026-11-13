// 3D models of the phase-5 devices: NPN (TO-92), N-MOSFET and LDO (TO-220), relay, DC motor,
// active buzzer, photoresistor and NTC thermistor.

import { useFrame } from '@react-three/fiber';
import { useContext, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { BOARD } from '../core/breadboard';
import { amps } from '../core/format';
import { tr } from '../core/i18n';
import type { SimResult } from '../core/solver';
import type { PlacedPart } from '../core/types';
import { CanvasPlane, Leg, Mat, PartCtx, Seg, TextPlane, Tube, holeVec } from './common';
import { useSpan, type PartViewProps } from './Parts';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Centre of a row of legs (footprint parts). */
function useLegs(part: PlacedPart, pins: string[]) {
  return useMemo(() => {
    const ps = pins.map((p) => holeVec(part.pins[p] ?? ''));
    const c = ps.reduce((s, p) => s.add(p), V(0, 0, 0)).multiplyScalar(1 / ps.length);
    return { ps, c };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part.pins, pins.join()]);
}

/* ------------------------------------------------------------------ TO-92 NPN */

export function Npn({ part }: PartViewProps) {
  const { ps, c } = useLegs(part, ['e', 'b', 'c']);
  const r = 0.92;
  const h = 1.8;
  const y0 = 1.0;
  return (
    <group>
      {ps.map((p, i) => {
        const top = V(c.x + (i - 1) * 0.5, y0 + 0.05, c.z);
        return <Leg key={i} pts={[p.clone().setY(-0.3), p.clone().setY(0.35), top]} r={0.055} />;
      })}
      <group position={[c.x, y0, c.z]}>
        {/* half cylinder: round side towards −z, flat face towards the viewer */}
        <mesh position={[0, h / 2, 0]} castShadow>
          <cylinderGeometry args={[r, r, h, 24, 1, false, Math.PI / 2, Math.PI]} />
          <Mat color="#1a1b1f" roughness={0.5} />
        </mesh>
        <mesh position={[0, h / 2, -0.005]}>
          <boxGeometry args={[2 * r, h, 0.01]} />
          <Mat color="#1a1b1f" roughness={0.45} />
        </mesh>
        <TextPlane text={['2N2222', 'E B C']} width={1.6} height={0.95} color="#c9ccd1" font='700 46px "Barlow Condensed", sans-serif' position={[0, h / 2 + 0.1, 0.004]} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ TO-220 (MOSFET, LDO) */

function useTabGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    const w = 2.0;
    s.moveTo(-w, 0);
    s.lineTo(w, 0);
    s.lineTo(w, 2.4);
    s.lineTo(w - 0.25, 2.65);
    s.lineTo(-w + 0.25, 2.65);
    s.lineTo(-w, 2.4);
    s.lineTo(-w, 0);
    const hole = new THREE.Path();
    hole.absarc(0, 1.35, 0.6, 0, Math.PI * 2, true);
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false, curveSegments: 24 });
    return g;
  }, []);
}

function To220({ part, pins, label }: { part: PlacedPart; pins: string[]; label: string[] }) {
  const { ps, c } = useLegs(part, pins);
  const tab = useTabGeometry();
  const y0 = 1.3; // body underside
  const H = 3.5;
  const D = 1.75;
  const zb = 0.25; // body centre offset towards the viewer
  return (
    <group>
      {ps.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, (y0 - 0.3 + 0.3) / 2 - 0.15, 0]}>
            <boxGeometry args={[0.32, y0 + 0.3, 0.12]} />
            <Mat color="#d3d6db" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, y0 - 0.25, 0]}>
            <boxGeometry args={[0.55, 0.5, 0.14]} />
            <Mat color="#d3d6db" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <group position={[c.x, y0, c.z]}>
        <mesh position={[0, H / 2, zb]} castShadow>
          <boxGeometry args={[4.0, H, D]} />
          <Mat color="#1a1b1f" roughness={0.45} />
        </mesh>
        {/* metal tab: back plate + the part above the body with its mounting hole */}
        <mesh position={[0, H / 2, zb - D / 2 - 0.25]}>
          <boxGeometry args={[4.0, H, 0.5]} />
          <Mat color="#c9ccd1" metalness={0.85} roughness={0.28} />
        </mesh>
        <mesh geometry={tab} position={[0, H, zb - D / 2 - 0.5]} castShadow>
          <Mat color="#c9ccd1" metalness={0.85} roughness={0.28} />
        </mesh>
        <TextPlane text={label} width={3.6} height={1.5} color="#d9dce2" font='700 58px "Barlow Condensed", sans-serif' position={[0, H * 0.55, zb + D / 2 + 0.005]} />
        <TextPlane
          text={pins.map((p) => p.toUpperCase()).join('   ')}
          width={3.2}
          height={0.45}
          color="#8e939b"
          font='700 40px "Barlow Condensed", sans-serif'
          position={[0, 0.35, zb + D / 2 + 0.005]}
        />
      </group>
    </group>
  );
}

export function Nmos({ part }: PartViewProps) {
  const model = part.props.model ?? 'IRLZ44N';
  return <To220 part={part} pins={['g', 'd', 's']} label={[model, 'N-MOSFET']} />;
}

export function Ldo({ part }: PartViewProps) {
  const v = part.props.voltage ?? 3.3;
  return <To220 part={part} pins={['gnd', 'out', 'in']} label={['LM1117', `-${v.toFixed(1)}`]} />;
}

/* ------------------------------------------------------------------ relay */

function drawRelayTop(g: CanvasRenderingContext2D, w: number, h: number, on: boolean) {
  g.clearRect(0, 0, w, h);
  g.strokeStyle = '#eaf2ff';
  g.fillStyle = '#eaf2ff';
  g.lineWidth = h * 0.018;
  g.lineCap = 'round';
  // coil (left) and changeover contact (right), with the energised position drawn
  const cx = w * 0.27;
  g.strokeRect(cx - w * 0.08, h * 0.3, w * 0.16, h * 0.4);
  g.beginPath();
  g.moveTo(cx - w * 0.08, h * 0.7);
  g.lineTo(cx + w * 0.08, h * 0.3);
  g.stroke();
  const sx = w * 0.62;
  const yCom = h * 0.78;
  g.beginPath();
  g.arc(sx, yCom, h * 0.03, 0, Math.PI * 2);
  g.arc(sx - w * 0.1, h * 0.25, h * 0.03, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.arc(sx + w * 0.1, h * 0.25, h * 0.03, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = on ? '#7dffb0' : '#ffd37d';
  g.lineWidth = h * 0.03;
  g.beginPath();
  g.moveTo(sx, yCom);
  g.lineTo(on ? sx + w * 0.095 : sx - w * 0.095, h * 0.31);
  g.stroke();
  g.setLineDash([h * 0.03, h * 0.03]);
  g.strokeStyle = '#eaf2ff';
  g.lineWidth = h * 0.012;
  g.beginPath();
  g.moveTo(cx + w * 0.08, h * 0.5);
  g.lineTo(sx + (on ? w * 0.05 : -w * 0.05), h * 0.5);
  g.stroke();
  g.setLineDash([]);
  g.font = `700 ${h * 0.1}px "Barlow Condensed", sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('NC', sx - w * 0.1, h * 0.12);
  g.fillText('NO', sx + w * 0.1, h * 0.12);
  g.fillText('COM', sx, h * 0.92);
  g.fillText('COIL', cx, h * 0.15);
  g.fillStyle = on ? '#7dffb0' : '#9fb3d9';
  g.fillText(on ? 'ON' : 'OFF', w * 0.88, h * 0.5);
}

function drawRelayFront(g: CanvasRenderingContext2D, w: number, h: number) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#f2f6ff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${h * 0.2}px "Barlow Condensed", sans-serif`;
  g.fillText('SRD-05VDC-SL-C', w / 2, h * 0.22);
  g.font = `600 ${h * 0.12}px "Barlow Condensed", sans-serif`;
  g.fillText('10A 250VAC   10A 125VAC', w / 2, h * 0.48);
  g.fillText('10A 30VDC    10A 28VDC', w / 2, h * 0.66);
  g.font = `700 ${h * 0.13}px "Barlow Condensed", sans-serif`;
  g.fillText('COIL 5V DC · 70 Ω', w / 2, h * 0.86);
}

export function Relay({ part, sim }: PartViewProps) {
  const ctx = useContext(PartCtx);
  const st = sim?.relays.get(part.ref);
  const on = !!st?.energized;
  const { ps } = useLegs(part, ['coil1', 'coil2', 'com', 'nc', 'no']);
  const cx = (ps[0].x + ps[1].x) / 2;
  const cz = (ps[0].z + ps[2].z) / 2;
  const W = 7.2;
  const D = 6.0;
  const H = 5.6;
  const y0 = 0.2;
  return (
    <group>
      {ps.map((p, i) => (
        <Seg key={i} a={p.clone().setY(-0.3)} b={p.clone().setY(y0 + 0.1)} r={0.08} />
      ))}
      <group position={[cx, y0, cz]}>
        <mesh position={[0, H / 2, 0]} castShadow>
          <boxGeometry args={[W, H, D]} />
          <Mat color="#2457c5" roughness={0.42} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[W - 0.3, 0.12, D - 0.3]} />
          <Mat color="#16357a" />
        </mesh>
        {!ctx.ghost && (
          <>
            <CanvasPlane
              width={W - 0.5}
              height={D - 0.5}
              ppu={64}
              draw={(g, w, h) => drawRelayTop(g, w, h, on)}
              deps={[on]}
              position={[0, H + 0.004, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
            <CanvasPlane width={W - 0.5} height={H - 1.2} ppu={64} draw={drawRelayFront} deps={[]} position={[0, H / 2, D / 2 + 0.004]} />
          </>
        )}
        {on && !ctx.ghost && (
          <mesh position={[W / 2 - 0.9, H + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.32, 18]} />
            <meshBasicMaterial color="#7dffb0" toneMapped={false} />
          </mesh>
        )}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ DC motor */

/** Motor frame: standing upright on a small mount behind the breadboard (out of the way of the
 *  view), behind its leads, propeller on top so its spin is visible from the usual camera. */
export function motorFrame(part: PlacedPart) {
  const a = holeVec(part.pins['+'] ?? '');
  const b = holeVec(part.pins['-'] ?? '');
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const x = Math.max(-BOARD.width / 2 + 3, Math.min(BOARD.width / 2 - 3, mid.x));
  // pos = centre of the back end cap; the shaft points up (+y)
  return { pos: V(x, MOUNT_H, -BOARD.depth / 2 - 3.6) };
}

/** height of the motor's back end above the table (y of the table is −0.92) */
const MOUNT_H = 0.6;
/** the motor is drawn at 70 % so it doesn't tower over the board */
const MOTOR_SCALE = 0.7;

function useMotorShape() {
  return useMemo(() => {
    const R = 3.0;
    const flat = 2.35;
    const a = Math.asin(flat / R);
    const s = new THREE.Shape();
    s.absarc(0, 0, R, -a, a, false);
    s.lineTo(-Math.sqrt(R * R - flat * flat), flat);
    s.absarc(0, 0, R, Math.PI - a, Math.PI + a, false);
    s.lineTo(Math.sqrt(R * R - flat * flat), -flat);
    const can = new THREE.ExtrudeGeometry(s, { depth: 6.8, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2, curveSegments: 32 });
    const cap = new THREE.ExtrudeGeometry(s, { depth: 1.1, bevelEnabled: false, curveSegments: 32 });
    return { can, cap };
  }, []);
}

export function Motor({ part, sim }: PartViewProps) {
  const ctx = useContext(PartCtx);
  const st = sim?.motors.get(part.ref);
  const { pos } = useMemo(() => motorFrame(part), [part]);
  const { can, cap } = useMotorShape();
  const prop = useRef<THREE.Group>(null);
  const speed = st?.running ? Math.min(1, Math.abs(st.speed)) * (st.direction ?? 1) : 0;
  useFrame(({ invalidate }, dt) => {
    if (!prop.current || speed === 0) return;
    prop.current.rotation.z += speed * Math.min(dt, 0.05) * 28;
    invalidate(); // demand frame loop: keep spinning while the motor runs
  });
  // local frame: shaft along +z, flats facing ±y; rotated so +z points up and +y away from the board
  const rot = new THREE.Euler(-Math.PI / 2, 0, 0);
  const toWorld = (x: number, y: number, z: number) => V(x, y, z).applyEuler(rot).multiplyScalar(MOTOR_SCALE).add(pos);
  const lead = (lx: number, hole: string | undefined) => {
    if (!hole) return null;
    const to = holeVec(hole);
    const from = toWorld(lx, -1.7, -0.4);
    const out = from.clone().add(V(0, 0.6, 1.6));
    const mid = out.clone().lerp(to, 0.5).setY(2.4);
    return [from, out, mid, to.clone().setY(1.0), to.clone().setY(0.2)];
  };
  const lp = lead(-1.1, part.pins['+']);
  const ln = lead(1.1, part.pins['-']);
  const spinning = Math.abs(speed) > 0.05;
  return (
    <group>
      {/* mount block on the table */}
      <mesh position={[pos.x, (MOUNT_H - 0.92) / 2, pos.z]} castShadow>
        <boxGeometry args={[1.6, MOUNT_H + 0.92, 1.6]} />
        <Mat color="#6b4f3a" roughness={0.8} />
      </mesh>
      <group position={pos} rotation={rot} scale={MOTOR_SCALE}>
        {/* plastic end cap, then the metal can (flats front and back) */}
        <mesh geometry={cap} position={[0, 0, 0]} castShadow>
          <Mat color="#f1efe8" roughness={0.6} />
        </mesh>
        <mesh geometry={can} position={[0, 0, 1.1]} castShadow>
          <Mat color="#c8ccd2" metalness={0.8} roughness={0.32} />
        </mesh>
        {/* solder tabs on the end cap, towards the board */}
        {[-1.1, 1.1].map((x, i) => (
          <mesh key={x} position={[x, -2.0, 0.4]}>
            <boxGeometry args={[0.5, 0.12, 0.8]} />
            <Mat color={i === 0 ? '#e0b44a' : '#d3d6db'} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        <TextPlane text="+" width={0.7} height={0.7} color="#d62828" font='800 90px "Barlow", sans-serif' position={[-1.1, -2.36, 0.7]} rotation={[Math.PI / 2, 0, 0]} />
        {/* bushing, shaft, propeller */}
        <mesh position={[0, 0, 8.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.75, 0.75, 0.4, 20]} />
          <Mat color="#d9c27c" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 9.0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.8, 10]} />
          <Mat color="#e3e5e8" metalness={0.9} roughness={0.2} />
        </mesh>
        <group ref={prop} position={[0, 0, 9.6]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.5, 16]} />
            <Mat color="#d62828" roughness={0.45} />
          </mesh>
          {[0, Math.PI].map((a) => (
            <mesh key={a} rotation={[0.35, 0, a]} position={[Math.cos(a) * 2.0, Math.sin(a) * 2.0, 0]} castShadow>
              <boxGeometry args={[3.4, 0.9, 0.12]} />
              <Mat color="#e63946" roughness={0.45} />
            </mesh>
          ))}
        </group>
        {spinning && !ctx.ghost && (
          <mesh position={[0, 0, 9.6]}>
            <circleGeometry args={[3.8, 40]} />
            <meshBasicMaterial color="#e63946" transparent opacity={0.12 + 0.12 * Math.abs(speed)} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
      {lp && <Tube pts={lp} color="#d62828" r={0.11} />}
      {ln && <Tube pts={ln} color="#1b1b1b" r={0.11} />}
      {part.pins['+'] && <Seg a={holeVec(part.pins['+']).setY(-0.3)} b={holeVec(part.pins['+']).setY(0.3)} r={0.07} />}
      {part.pins['-'] && <Seg a={holeVec(part.pins['-']).setY(-0.3)} b={holeVec(part.pins['-']).setY(0.3)} r={0.07} />}
    </group>
  );
}

/* ------------------------------------------------------------------ active buzzer */

export function Buzzer({ part, sim }: PartViewProps) {
  const ctx = useContext(PartCtx);
  const st = sim?.buzzers.get(part.ref);
  const { pa, pb, mid, angle } = useSpan(part.pins['+'], part.pins['-']);
  const R = 2.3;
  const H = 3.6;
  const y0 = 0.25;
  const rings = useRef<THREE.Group>(null);
  const loud = st?.on ? Math.max(0.25, st.loudness) : 0;
  useFrame(({ clock, invalidate }) => {
    if (!rings.current) return;
    invalidate(); // demand frame loop: keep the sound rings moving while the buzzer sounds
    rings.current.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 1.6 + i / 3) % 1;
      c.scale.setScalar(1 + t * (1.2 + loud));
      ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.55 * loud * (1 - t);
    });
  });
  // the + leg is the one at pa: put the "+" mark on that side of the top
  const dirPlus = pa.clone().sub(pb).setY(0);
  const plusAt = dirPlus.lengthSq() > 1e-6 ? dirPlus.normalize().multiplyScalar(1.25) : V(-1.25, 0, 0);
  return (
    <group>
      <Leg
        pts={[
          pa.clone().setY(-0.3),
          pa.clone().setY(y0 - 0.05),
          mid
            .clone()
            .add(plusAt.clone().multiplyScalar(0.55))
            .setY(y0 + 0.1),
        ]}
        r={0.06}
      />
      <Leg
        pts={[
          pb.clone().setY(-0.3),
          pb.clone().setY(y0 - 0.05),
          mid
            .clone()
            .sub(plusAt.clone().multiplyScalar(0.55))
            .setY(y0 + 0.1),
        ]}
        r={0.06}
      />
      <group position={[mid.x, y0, mid.z]}>
        <mesh position={[0, H / 2, 0]} castShadow>
          <cylinderGeometry args={[R, R, H, 36]} />
          <Mat color="#18191c" roughness={0.55} />
        </mesh>
        <mesh position={[0, H + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, R - 0.35, 36]} />
          <Mat color="#232428" roughness={0.35} />
        </mesh>
        <mesh position={[0, H + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 18]} />
          <meshBasicMaterial color="#050505" />
        </mesh>
        <TextPlane
          text="+"
          width={0.8}
          height={0.8}
          color="#e9ecef"
          font='800 100px "Barlow", sans-serif'
          position={[plusAt.x, H + 0.012, plusAt.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <TextPlane
          text="BUZZER 5V"
          width={2.4}
          height={0.4}
          color="#9aa0a6"
          font='700 44px "Barlow Condensed", sans-serif'
          position={[0, H + 0.012, 0]}
          rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]}
        />
        {loud > 0 && !ctx.ghost && (
          <group ref={rings} position={[0, H + 0.3, 0]}>
            {[0, 1, 2].map((i) => (
              <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[R * 0.95, R * 0.95 + 0.14, 40]} />
                <meshBasicMaterial color="#f4d35e" transparent opacity={0.4} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ LDR */

function drawLdrFace(g: CanvasRenderingContext2D, w: number, h: number) {
  g.clearRect(0, 0, w, h);
  g.save();
  g.beginPath();
  g.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = '#e38b2c';
  g.fillRect(0, 0, w, h);
  // the two comb electrodes and the CdS track between them
  g.fillStyle = '#d9dce0';
  g.fillRect(0, 0, w * 0.14, h);
  g.fillRect(w * 0.86, 0, w * 0.14, h);
  g.strokeStyle = '#8a2b10';
  g.lineWidth = h * 0.055;
  g.lineJoin = 'round';
  g.beginPath();
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const y = h * (0.14 + (0.72 * i) / n);
    if (i === 0) g.moveTo(w * 0.16, y);
    g.lineTo(i % 2 ? w * 0.16 : w * 0.84, y);
    if (i < n) g.lineTo(i % 2 ? w * 0.16 : w * 0.84, h * (0.14 + (0.72 * (i + 1)) / n));
  }
  g.stroke();
  g.restore();
}

export function Ldr({ part }: PartViewProps) {
  const { mid, len, angle } = useSpan(part.pins['1'], part.pins['2']);
  const r = 1.0;
  const y = 2.0;
  const lux = part.props.lux ?? 100;
  // brighter light: a little glow on the face
  const glow = Math.min(1, Math.max(0, Math.log10(Math.max(lux, 0.1)) / 5));
  return (
    <group position={mid} rotation={[0, angle, 0]}>
      <Leg pts={[V(-len / 2, -0.3, 0), V(-len / 2, 0.6, 0), V(-0.55, y - 0.85, 0)]} r={0.05} />
      <Leg pts={[V(len / 2, -0.3, 0), V(len / 2, 0.6, 0), V(0.55, y - 0.85, 0)]} r={0.05} />
      <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[r, r, 0.42, 28]} />
        <Mat color="#f1f1ec" roughness={0.3} />
      </mesh>
      {[1, -1].map((s) => (
        <CanvasPlane key={s} width={1.9} height={1.9} ppu={96} draw={drawLdrFace} deps={[]} position={[0, y, s * 0.215]} rotation={[0, s > 0 ? 0 : Math.PI, 0]} />
      ))}
      {glow > 0.45 && (
        <mesh position={[0, y, 0]}>
          <sphereGeometry args={[1.25, 16, 12]} />
          <meshBasicMaterial color="#fff3b0" transparent opacity={0.18 * glow} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ NTC */

export function Ntc({ part }: PartViewProps) {
  const { mid, len, angle } = useSpan(part.pins['1'], part.pins['2']);
  const y = 1.7;
  const t = part.props.temperature ?? 25;
  const hot = Math.min(1, Math.max(0, (t - 40) / 80));
  return (
    <group position={mid} rotation={[0, angle, 0]}>
      <Leg pts={[V(-len / 2, -0.3, 0), V(-len / 2, 0.5, 0), V(-0.14, y - 0.3, 0)]} r={0.045} color="#c9a46b" />
      <Leg pts={[V(len / 2, -0.3, 0), V(len / 2, 0.5, 0), V(0.14, y - 0.3, 0)]} r={0.045} color="#c9a46b" />
      <mesh position={[0, y, 0]} scale={[1, 1.25, 0.8]} castShadow>
        <sphereGeometry args={[0.42, 20, 14]} />
        <Mat color="#1e3a2a" roughness={0.3} emissive="#ff5a1f" emissiveIntensity={hot * 0.8} />
      </mesh>
      <TextPlane text="103" width={0.6} height={0.25} color="#c9d6cc" font='700 40px "Barlow Condensed", sans-serif' position={[0, y, 0.345]} />
    </group>
  );
}

/* ------------------------------------------------------------------ labels */

/** Short live text shown next to a device's ref label. */
export function deviceLabel(part: PlacedPart, sim?: SimResult): string {
  if (!sim) return '';
  switch (part.type) {
    case 'relay': {
      const s = sim.relays.get(part.ref);
      return s ? (s.energized ? tr(' 吸合', ' ON') : tr(' 释放', ' off')) : '';
    }
    case 'motor': {
      const s = sim.motors.get(part.ref);
      return s ? (s.running ? ` ${amps(Math.abs(s.current))}` : tr(' 停', ' stopped')) : '';
    }
    case 'buzzer': {
      const s = sim.buzzers.get(part.ref);
      return s?.on ? tr(' 响', ' beeping') : '';
    }
    case 'npn': {
      const s = sim.bjts.get(part.ref);
      return s ? ` ${s.region === 'saturation' ? tr('饱和', 'sat') : s.region === 'active' ? tr('放大', 'active') : tr('截止', 'off')}` : '';
    }
    case 'nmos': {
      const s = sim.mosfets.get(part.ref);
      return s ? ` ${s.region === 'off' ? tr('截止', 'off') : tr('导通', 'on')}` : '';
    }
    case 'ldo': {
      const s = sim.regs.get(part.ref);
      return s && s.mode !== 'off' ? ` ${s.vout.toFixed(2)}V` : '';
    }
    case 'ldr':
      return ` ${part.props.lux ?? 100} lx`;
    case 'ntc':
      return ` ${part.props.temperature ?? 25}°C`;
    default:
      return '';
  }
}

/** Label anchor for devices whose body is not over their legs (the motor sits off the board). */
export function deviceAnchor(part: PlacedPart): THREE.Vector3 | null {
  if (part.type === 'motor')
    return motorFrame(part)
      .pos.clone()
      .add(V(0, 11.5 * MOTOR_SCALE, 0));
  if (part.type === 'relay') {
    const a = holeVec(part.pins.coil1 ?? '');
    const b = holeVec(part.pins.no ?? '');
    return a.add(b).multiplyScalar(0.5).setY(7.2);
  }
  if (part.type === 'nmos' || part.type === 'ldo') {
    const k = part.type === 'nmos' ? 'd' : 'out';
    return holeVec(part.pins[k] ?? '').setY(8.6);
  }
  return null;
}
