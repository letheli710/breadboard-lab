// 3D models of the stage-C parts: inductor, LM358 op-amp, ammeter (handheld multimeter),
// function generator (bench instrument) and oscilloscope probes.

import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { amps, formatSI } from '../core/format';
import { tr } from '../core/i18n';
import type { PlacedPart, Waveform } from '../core/types';
import { CH_COLORS, CanvasPlane, Leg, Mat, Seg, TextPlane, Tube, holeVec } from './common';
import { Leads, useSpan, type PartViewProps } from './Parts';
import { benchPose, onBench } from './slots';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/* ------------------------------------------------------------------ inductor */

export function Inductor({ part }: PartViewProps) {
  const { mid, len, angle } = useSpan(part.pins['1'], part.pins['2']);
  const base = 0.6; // underside of the bottom flange
  const fl = 0.16; // flange thickness
  const H = 0.95; // winding height
  const turns = 9;
  const L = part.props.inductance ?? 10e-3;
  return (
    <group position={mid} rotation={[0, angle, 0]}>
      <Leg pts={[V(-len / 2, -0.3, 0), V(-len / 2, 0.3, 0), V(-0.24, base, 0)]} />
      <Leg pts={[V(len / 2, -0.3, 0), V(len / 2, 0.3, 0), V(0.24, base, 0)]} />
      {/* ferrite drum: two flanges and a core */}
      <mesh position={[0, base + fl / 2, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.62, fl, 28]} />
        <Mat color="#3b3d43" roughness={0.75} />
      </mesh>
      <mesh position={[0, base + fl + H / 2, 0]} castShadow>
        <cylinderGeometry args={[0.44, 0.44, H, 24]} />
        <Mat color="#b8743a" metalness={0.65} roughness={0.32} />
      </mesh>
      {/* copper turns */}
      {Array.from({ length: turns }, (_, i) => (
        <mesh key={i} position={[0, base + fl + ((i + 0.5) * H) / turns, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.45, 0.052, 6, 28]} />
          <Mat color={i % 2 ? '#c98544' : '#a9672f'} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, base + fl * 1.5 + H, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.62, fl, 28]} />
        <Mat color="#3b3d43" roughness={0.75} />
      </mesh>
      <TextPlane
        text={formatSI(L, 'H').replace(' ', '')}
        width={1.0}
        height={0.38}
        color="#ece6d6"
        font='700 40px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif'
        position={[0, base + fl * 2 + H + 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ LM358 DIP-8 */

export function OpAmp({ part }: PartViewProps) {
  const pins = useMemo(() => ['1', '2', '3', '4', '5', '6', '7', '8'].map((p) => ({ pin: p, v: holeVec(part.pins[p] ?? '') })), [part.pins]);
  const p1 = pins[0].v;
  const p4 = pins[3].v;
  const p8 = pins[7].v;
  const cx = (p1.x + p4.x) / 2;
  const cz = (p1.z + p8.z) / 2;
  const L = Math.abs(p4.x - p1.x) + 0.95;
  const W = Math.max(Math.abs(p8.z - p1.z) - 0.75, 1.6);
  const y0 = 0.42; // body underside
  const T = 0.85; // body thickness
  const top = y0 + T;
  const left = Math.sign(p4.x - p1.x) || 1; // pins 1→4 run towards +x
  const back = Math.sign(p1.z - cz) || -1; // pins 1–4 side
  return (
    <group>
      {pins.map(({ pin, v }) => {
        const s = Math.sign(v.z - cz) || 1;
        return (
          <group key={pin} position={[v.x, 0, 0]}>
            {/* shoulder out of the body, then the leg going down into the hole */}
            <mesh position={[0, y0 + 0.22, cz + s * (W / 2 + (Math.abs(v.z - cz) - W / 2) / 2)]}>
              <boxGeometry args={[0.36, 0.08, Math.abs(v.z - cz) - W / 2 + 0.05]} />
              <Mat color="#c9ccd1" metalness={0.75} roughness={0.3} />
            </mesh>
            <mesh position={[0, (y0 + 0.26 + 0.12) / 2, v.z]}>
              <boxGeometry args={[0.36, y0 + 0.26 - 0.12, 0.08]} />
              <Mat color="#c9ccd1" metalness={0.75} roughness={0.3} />
            </mesh>
            <mesh position={[0, (0.12 - 0.3) / 2, v.z]}>
              <boxGeometry args={[0.15, 0.42, 0.08]} />
              <Mat color="#c9ccd1" metalness={0.75} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[cx, y0 + T / 2, cz]} castShadow>
        <boxGeometry args={[L, T, W]} />
        <Mat color="#1c1d21" roughness={0.42} />
      </mesh>
      {/* notch at the pin-1 end and the pin-1 dimple */}
      <mesh position={[cx - (left * L) / 2, top - 0.02, cz]} rotation={[0, left > 0 ? 0 : Math.PI, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 20, 1, false, 0, Math.PI]} />
        <Mat color="#060607" roughness={0.9} />
      </mesh>
      <mesh position={[p1.x + left * 0.05, top + 0.004, cz + back * (W / 2 - 0.38)]}>
        <cylinderGeometry args={[0.15, 0.15, 0.01, 20]} />
        <Mat color="#4a4c53" roughness={0.25} />
      </mesh>
      <TextPlane
        text="LM358"
        width={2.5}
        height={0.62}
        color="#c9ccd1"
        font='600 60px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif'
        position={[cx + left * 0.25, top + 0.006, cz + 0.08 * -back]}
        rotation={[-Math.PI / 2, 0, left > 0 ? 0 : Math.PI]}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ ammeter (handheld multimeter) */

const METER_TILT = 0.62;
const METER_LEN = 7.0;

/** Ammeter LCD: big reading plus mode markers. */
function drawMeterLcd(g: CanvasRenderingContext2D, w: number, h: number, text: string, neg: boolean) {
  g.fillStyle = '#cfdcc0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(31,42,30,0.08)';
  g.fillRect(0, h * 0.72, w, h * 0.28);
  g.fillStyle = '#1d281e';
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `700 ${h * 0.16}px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif`;
  g.fillText('DC  A', w * 0.05, h * 0.14);
  g.textAlign = 'right';
  g.fillText('AUTO', w * 0.95, h * 0.14);
  g.font = `700 ${h * 0.5}px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif`;
  g.fillText(text, w * 0.95, h * 0.52, w * 0.9);
  if (neg) {
    g.textAlign = 'left';
    g.fillText('−', w * 0.03, h * 0.52);
  }
}

export function Ammeter({ part, slot, reading, onClick }: PartViewProps) {
  // the meter is modelled in its own frame (body centre at the origin), which stands at the pose
  const { pos, rot } = benchPose(part, slot);
  const base = V(0, 0, -1.6);
  // pivot at the near bottom edge; the stand lifts the far (display) end
  const toWorld = useMemo(() => {
    const m = new THREE.Matrix4()
      .makeTranslation(pos.x, 0, pos.z)
      .multiply(new THREE.Matrix4().makeRotationY(rot))
      .multiply(new THREE.Matrix4().makeTranslation(0, 0, -1.6 + METER_LEN / 2))
      .multiply(new THREE.Matrix4().makeRotationX(METER_TILT))
      .multiply(new THREE.Matrix4().makeTranslation(0, 0, -METER_LEN / 2));
    return (x: number, y: number, z: number) => V(x, y, z).applyMatrix4(m);
  }, [pos.x, pos.z, rot]);
  const I = reading ?? 0;
  const lcd = Math.abs(I) < 5e-7 ? '0.000 A' : amps(Math.abs(I));
  const jackZ = 2.55;
  const jacks = { A: -1.15, COM: 0, V: 1.15 };
  const leads = useMemo(() => {
    // out of the jack towards the viewer, down to the table, then over to the board
    const route = (jx: number, hole: string | undefined) => {
      if (!hole) return null;
      const to = holeVec(hole);
      const p0 = toWorld(jx, 1.75, jackZ);
      const p1 = toWorld(jx, 2.0, jackZ + 0.8);
      // out towards the meter's front, wherever it faces
      const front = onBench(V(0, 0, 0), rot, V(0, 0, 2.2));
      const p2 = V(p0.x + front.x + (to.x - p0.x) * 0.12, 0.6, p0.z + front.z + (to.z - p0.z) * 0.12);
      const mid = p2.clone().lerp(to, 0.5).setY(2.0);
      return [p0, p1, p2, mid, to.clone().setY(1.0), to.clone().setY(0.2)];
    };
    return { red: route(jacks.A, part.pins['+']), black: route(jacks.COM, part.pins['-']) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toWorld, rot, part.pins['+'], part.pins['-']]);
  // height of the stand under the display end, in the meter's frame
  const standY = V(0, 0, -METER_LEN + 0.6)
    .applyMatrix4(
      new THREE.Matrix4()
        .makeTranslation(0, 0, METER_LEN / 2)
        .multiply(new THREE.Matrix4().makeRotationX(METER_TILT))
        .multiply(new THREE.Matrix4().makeTranslation(0, 0, -METER_LEN / 2)),
    )
    .add(V(0, 0, base.z));
  return (
    <group onClick={onClick}>
      <group position={pos} rotation={[0, rot, 0]}>
        <group position={[base.x, 0, base.z + METER_LEN / 2]} rotation={[METER_TILT, 0, 0]}>
          <group position={[0, 0, -METER_LEN / 2]}>
            {/* yellow rubber holster + dark face */}
            <RoundedBox args={[4.4, 1.0, METER_LEN]} radius={0.35} smoothness={3} position={[0, 0.5, 0]} castShadow>
              <Mat color="#f2c14e" roughness={0.7} />
            </RoundedBox>
            <RoundedBox args={[3.7, 0.2, METER_LEN - 0.7]} radius={0.08} smoothness={2} position={[0, 0.95, 0]}>
              <Mat color="#2b2f38" roughness={0.6} />
            </RoundedBox>
            <CanvasPlane
              width={3.2}
              height={1.55}
              draw={(g, w, h) => drawMeterLcd(g, w, h, lcd, I < -5e-7)}
              deps={[lcd, I < -5e-7]}
              position={[0, 1.06, -2.15]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
            {/* rotary selector with the pointer on A */}
            <CanvasPlane
              width={2.7}
              height={2.7}
              draw={(g, w, h) => {
                g.translate(w / 2, h / 2);
                g.fillStyle = '#e9ecef';
                g.font = `700 ${h * 0.1}px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif`;
                g.textAlign = 'center';
                g.textBaseline = 'middle';
                const labels = ['OFF', 'V⎓', 'V~', 'Ω', 'mA', 'A'];
                labels.forEach((l, i) => {
                  const a = -Math.PI * 0.85 + (i / (labels.length - 1)) * Math.PI * 0.9 + Math.PI * 0.35;
                  g.fillStyle = l === 'A' ? '#f2c14e' : '#e9ecef';
                  g.fillText(l, Math.cos(a - Math.PI / 2) * w * 0.4, Math.sin(a - Math.PI / 2) * h * 0.4);
                });
              }}
              deps={[]}
              position={[0, 1.061, 0.55]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
            <mesh position={[0, 1.16, 0.55]} castShadow>
              <cylinderGeometry args={[0.78, 0.82, 0.22, 28]} />
              <Mat color="#1e2128" roughness={0.5} />
            </mesh>
            <mesh position={[0, 1.29, 0.55]} rotation={[0, -0.62, 0]}>
              <boxGeometry args={[0.2, 0.08, 1.45]} />
              <Mat color="#d9dce2" roughness={0.4} />
            </mesh>
            {/* input jacks */}
            {(Object.entries(jacks) as [keyof typeof jacks, number][]).map(([k, x]) => (
              <group key={k} position={[x, 1.06, jackZ]}>
                <mesh>
                  <cylinderGeometry args={[0.28, 0.28, 0.06, 18]} />
                  <Mat color={k === 'COM' ? '#1b1b1b' : '#d62828'} />
                </mesh>
                <mesh position={[0, 0.01, 0]}>
                  <cylinderGeometry args={[0.12, 0.12, 0.06, 12]} />
                  <Mat color="#0b0b0b" />
                </mesh>
              </group>
            ))}
            {/* one label above each jack (the test leads run out below them), so they line up whatever the font metrics */}
            {(Object.entries(jacks) as [keyof typeof jacks, number][]).map(([k, x]) => (
              <TextPlane
                key={k}
                text={k === 'V' ? 'VΩ' : k}
                width={0.9}
                height={0.32}
                color={k === 'COM' ? '#e9ecef' : '#ff8a8a'}
                font='700 36px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif'
                position={[x, 1.065, jackZ - 0.62]}
                rotation={[-Math.PI / 2, 0, 0]}
              />
            ))}
            {/* plugs in the A and COM jacks */}
            {part.pins['+'] && (
              <mesh position={[jacks.A, 1.4, jackZ]} castShadow>
                <cylinderGeometry args={[0.2, 0.24, 0.7, 14]} />
                <Mat color="#d62828" />
              </mesh>
            )}
            {part.pins['-'] && (
              <mesh position={[jacks.COM, 1.4, jackZ]} castShadow>
                <cylinderGeometry args={[0.2, 0.24, 0.7, 14]} />
                <Mat color="#1b1b1b" />
              </mesh>
            )}
          </group>
        </group>
        {/* tilt stand */}
        <mesh position={[base.x, standY.y / 2, standY.z + 0.25]} castShadow>
          <boxGeometry args={[3.0, standY.y, 0.35]} />
          <Mat color="#2b2f38" roughness={0.7} />
        </mesh>
      </group>
      {leads.red && <Tube pts={leads.red} color="#d62828" r={0.11} />}
      {leads.black && <Tube pts={leads.black} color="#1b1b1b" r={0.11} />}
      {part.pins['+'] && <Seg a={holeVec(part.pins['+']).setY(-0.3)} b={holeVec(part.pins['+']).setY(0.3)} r={0.07} />}
      {part.pins['-'] && <Seg a={holeVec(part.pins['-']).setY(-0.3)} b={holeVec(part.pins['-']).setY(0.3)} r={0.07} />}
    </group>
  );
}

/* ------------------------------------------------------------------ function generator */

/** Draw one period of a waveform into the box (x, y, w, h). */
export function drawWave(g: CanvasRenderingContext2D, wf: Waveform, x: number, y: number, w: number, h: number) {
  const Y = (v: number) => y + h / 2 - (v * h) / 2;
  g.beginPath();
  if (wf === 'square') {
    g.moveTo(x, Y(0));
    g.lineTo(x, Y(1));
    g.lineTo(x + w / 2, Y(1));
    g.lineTo(x + w / 2, Y(-1));
    g.lineTo(x + w, Y(-1));
    g.lineTo(x + w, Y(0));
  } else {
    const N = 64;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const v = wf === 'triangle' ? (t < 0.25 ? 4 * t : t < 0.75 ? 2 - 4 * t : 4 * t - 4) : Math.sin(2 * Math.PI * t);
      if (i === 0) g.moveTo(x + t * w, Y(v));
      else g.lineTo(x + t * w, Y(v));
    }
  }
  g.stroke();
}

function drawGenLcd(g: CanvasRenderingContext2D, w: number, h: number, wf: Waveform, f: number, a: number, off: number) {
  g.fillStyle = '#0d1b2a';
  g.fillRect(0, 0, w, h);
  // waveform box
  g.strokeStyle = 'rgba(127,219,255,0.35)';
  g.lineWidth = 2;
  g.strokeRect(w * 0.04, h * 0.12, w * 0.26, h * 0.76);
  g.strokeStyle = '#7fdbff';
  g.lineWidth = h * 0.045;
  g.lineJoin = 'round';
  drawWave(g, wf, w * 0.07, h * 0.28, w * 0.2, h * 0.44);
  g.fillStyle = '#7fdbff';
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `700 ${h * 0.13}px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif`;
  g.fillText(wf === 'sine' ? 'SINE' : wf === 'square' ? 'SQUARE' : 'TRIANGLE', w * 0.06, h * 0.9 - h * 0.04, w * 0.24);
  g.textAlign = 'right';
  g.fillStyle = '#f8f9fa';
  g.font = `700 ${h * 0.4}px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif`;
  g.fillText(formatSI(f, 'Hz', 4), w * 0.96, h * 0.32, w * 0.62);
  g.font = `600 ${h * 0.2}px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif`;
  g.fillStyle = '#ffd166';
  g.fillText(`AMPL ${a.toFixed(2)} Vp`, w * 0.96, h * 0.64, w * 0.62);
  g.fillStyle = '#9fb3c8';
  g.fillText(`OFST ${off >= 0 ? '+' : ''}${off.toFixed(2)} V`, w * 0.96, h * 0.85, w * 0.62);
}

export function FunctionGen({ part, slot, onClick }: PartViewProps) {
  const { pos: base, rot } = benchPose(part, slot);
  const wf = part.props.waveform ?? 'sine';
  const f = part.props.frequency ?? 1000;
  const a = part.props.amplitude ?? 1;
  const off = part.props.offset ?? 0;
  const W = 8.0;
  return (
    <group onClick={onClick}>
      <group position={base} rotation={[0, rot, 0]}>
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[W, 3.6, 4.6]} />
          <Mat color="#3a4a5c" roughness={0.55} />
        </mesh>
        <mesh position={[0, 1.8, 2.31]}>
          <planeGeometry args={[W - 0.4, 3.2]} />
          <Mat color="#e4e7eb" roughness={0.7} />
        </mesh>
        <TextPlane
          text={tr('函数信号发生器', 'FUNCTION GENERATOR')}
          width={4.2}
          height={0.34}
          color="#3a4560"
          font='700 40px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif'
          position={[-1.55, 3.15, 2.33]}
        />
        <CanvasPlane width={4.3} height={1.75} draw={(g, w, h) => drawGenLcd(g, w, h, wf, f, a, off)} deps={[wf, f, a, off]} position={[-1.55, 2.0, 2.33]} />
        {/* waveform keys, the active one lit */}
        {(['sine', 'square', 'triangle'] as Waveform[]).map((k, i) => (
          <group key={k} position={[-3.0 + i * 1.0, 0.65, 2.36]}>
            <mesh>
              <boxGeometry args={[0.82, 0.5, 0.12]} />
              <Mat color={k === wf ? '#2ba59b' : '#c4c9d0'} emissive={k === wf ? '#2ba59b' : undefined} emissiveIntensity={k === wf ? 0.5 : 0} roughness={0.5} />
            </mesh>
            <CanvasPlane
              width={0.7}
              height={0.4}
              ppu={96}
              draw={(g, w, h) => {
                g.strokeStyle = k === wf ? '#ffffff' : '#3a4560';
                g.lineWidth = h * 0.12;
                g.lineJoin = 'round';
                drawWave(g, k, w * 0.12, h * 0.2, w * 0.76, h * 0.6);
              }}
              deps={[k === wf]}
              position={[0, 0, 0.065]}
            />
          </group>
        ))}
        {/* frequency knob, its label underneath */}
        <mesh position={[1.6, 2.45, 2.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.1, 32]} />
          <Mat color="#b9bec6" metalness={0.5} roughness={0.35} />
        </mesh>
        <group position={[1.6, 2.45, 2.55]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.56, 0.62, 0.4, 32]} />
            <Mat color="#23262d" roughness={0.45} />
          </mesh>
          <mesh position={[0, -0.21, -0.34]}>
            <boxGeometry args={[0.1, 0.03, 0.3]} />
            <meshBasicMaterial color="#f8f9fa" toneMapped={false} />
          </mesh>
        </group>
        <TextPlane text="FREQ" width={0.9} height={0.3} color="#3a4560" font='700 32px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif' position={[1.6, 1.42, 2.33]} />
        {/* power LED */}
        <mesh position={[3.5, 3.15, 2.36]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshBasicMaterial color="#5cff7a" toneMapped={false} />
        </mesh>
        {/* output section: its own darker inset so the label reads as belonging to the BNC */}
        <mesh position={[3.0, 0.98, 2.316]}>
          <planeGeometry args={[1.2, 1.4]} />
          <Mat color="#cdd2d9" roughness={0.7} />
        </mesh>
        <TextPlane
          text="OUTPUT 50Ω"
          width={1.1}
          height={0.26}
          color="#3a4560"
          font='700 28px "HarmonyOS Sans Condensed", "HarmonyOS Sans SC", sans-serif'
          position={[3.0, 1.48, 2.33]}
        />
        {/* BNC output with coax splitting into red / black clip leads */}
        <mesh position={[3.0, 0.75, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.3, 20]} />
          <Mat color="#cfd3d9" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[3.0, 0.75, 2.78]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.3, 0.4, 16]} />
          <Mat color="#1b1b1b" roughness={0.5} />
        </mesh>
      </group>
      <Leads base={base} rot={rot} part={part} plusAt={V(2.88, 0.75, 3.0)} minusAt={V(3.12, 0.75, 3.0)} />
    </group>
  );
}

/* ------------------------------------------------------------------ scope probe */

export function ScopeProbe({ part }: PartViewProps) {
  const ch = part.props.channel === 2 ? 2 : 1;
  const col = CH_COLORS[ch];
  const tip = holeVec(part.pins.tip ?? '');
  const gnd = part.pins.gnd ? holeVec(part.pins.gnd) : null;
  const cable = useMemo(
    () => [V(tip.x, 3.7, tip.z), V(tip.x, 4.4, tip.z - 0.9), V(tip.x * 0.9 + 1.5, 3.4, -11.5), V(tip.x * 0.8 + 3, 1.2, -13), V(tip.x * 0.7 + 4, 0.15, -14)],
    [tip.x, tip.z],
  );
  const ground = useMemo(() => {
    if (!gnd) return null;
    const dir = gnd.clone().sub(tip).setY(0);
    const d = dir.length();
    const n = d > 1e-3 ? dir.normalize() : V(1, 0, 0);
    const start = tip.clone().add(n.clone().multiplyScalar(0.26)).setY(1.12);
    const h = 1.5 + Math.min(d, 12) * 0.08;
    return [start, start.clone().add(n.clone().multiplyScalar(0.5)).setY(1.35), tip.clone().lerp(gnd, 0.5).setY(h), gnd.clone().setY(1.6), gnd.clone().setY(1.05)];
  }, [tip, gnd]);
  return (
    <group>
      {/* tip + retractable hook */}
      <Seg a={tip.clone().setY(-0.3)} b={tip.clone().setY(0.6)} r={0.05} color="#d7dade" />
      <group position={[tip.x, 0, tip.z]}>
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.17, 0.07, 0.42, 14]} />
          <Mat color="#8d939c" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.07, 0]}>
          <cylinderGeometry args={[0.23, 0.2, 0.18, 16]} />
          <Mat color={col} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.22, 0]} castShadow>
          <cylinderGeometry args={[0.44, 0.44, 0.1, 22]} />
          <Mat color="#2b2d33" roughness={0.55} />
        </mesh>
        <mesh position={[0, 2.25, 0]} castShadow>
          <cylinderGeometry args={[0.27, 0.29, 1.95, 18]} />
          <Mat color="#33363e" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.95, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 18]} />
          <Mat color={col} roughness={0.4} />
        </mesh>
        <mesh position={[0, 3.45, 0]}>
          <cylinderGeometry args={[0.13, 0.25, 0.6, 14]} />
          <Mat color="#2b2d33" roughness={0.6} />
        </mesh>
      </group>
      <Tube pts={cable} color="#2b2d33" r={0.1} />
      {/* ground lead with a small clip */}
      {ground && gnd && (
        <>
          <Tube pts={ground} color="#1b1b1b" r={0.06} />
          <mesh position={[gnd.x, 0.62, gnd.z]} castShadow>
            <cylinderGeometry args={[0.13, 0.1, 0.75, 12]} />
            <Mat color="#1b1b1b" roughness={0.5} />
          </mesh>
          <Seg a={gnd.clone().setY(-0.3)} b={gnd.clone().setY(0.3)} r={0.06} />
        </>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ labels */

export function instrumentAnchor(part: PlacedPart, slot: number): THREE.Vector3 | null {
  if (part.type === 'ammeter') {
    const { pos, rot } = benchPose(part, slot);
    return onBench(pos, rot, V(0, 4.6, -4.2));
  }
  if (part.type === 'function_gen') return benchPose(part, slot).pos.add(V(0, 4.4, 0));
  if (part.type === 'scope_probe') return holeVec(part.pins.tip ?? '').setY(4.4);
  return null;
}

export function instrumentLabel(part: PlacedPart, reading?: number): string {
  if (part.type === 'ammeter') return ` ${amps(reading ?? 0)}`;
  if (part.type === 'function_gen') return ` ${formatSI(part.props.frequency ?? 1000, 'Hz')}`;
  if (part.type === 'scope_probe') return ` CH${part.props.channel === 2 ? 2 : 1}`;
  return '';
}
