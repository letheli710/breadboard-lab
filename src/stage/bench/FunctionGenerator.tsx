// The one 函数信号发生器 of every bench (after W4-L8): a light grey box, a green display (waveform,
// frequency, amplitude, output state), an OUTPUT BNC with its status lamp, and a BNC-to-alligator
// lead: the red clip on `out`, the black clip on `gnd`. With `knob`, a frequency knob on the front
// panel can be dragged (right / up turns the frequency up, 200 px = one decade).

import { useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BENCH_NAMES } from '../benchNames';
import { useStage } from '../stageStore';
import { dragFrequency, genLcd, knobAngle, type LcdLine, type Waveform } from './format';
import { frontDir, toWorld, type BoardPoint, type Placement, type V3 } from './geometry';
import { AMBER, ClipLead, hoverHandlers, Lcd, NameTag, useAnyLit } from './parts';

export const GEN_SIZE = { w: 11, h: 4.6, d: 8 };

export interface GeneratorKnob {
  /** frequency range of the knob, Hz (log scale, −135° … +135°) */
  range: [number, number];
  onChange: (f: number) => void;
  /** hover / lit id of the knob (default `${id}_knob`) */
  id?: string;
}

export interface FunctionGeneratorProps extends Placement {
  /** stage id: hover sets [id] (or hoverIds), lit when useLit() has it (or one of litIds) */
  id: string;
  waveform: Waveform;
  /** Hz */
  frequency: number;
  /** peak-to-peak amplitude, V */
  vpp: number;
  /** DC offset, V */
  offset?: number;
  /** output on (green lamp, default) or off (red lamp, rose display) */
  output?: boolean;
  /** amplitude on the display: 'vpp' "5.00 Vpp · OFS 0 V" (default) or 'span' "0 … 5.00 V" */
  readout?: 'vpp' | 'span';
  /** output impedance shown on the display, Ω */
  impedance?: number;
  /** appended to "OUTPUT OFF" */
  offNote?: string;
  /** replaces the whole display (first line big) */
  lcd?: LcdLine[];
  /** the red output clip: a board point (on a stub wire) or a world point */
  out?: BoardPoint | V3;
  /** the black ground clip */
  gnd?: BoardPoint | V3;
  /** waypoints of the two leads (default: one arc each) */
  outVia?: V3[];
  gndVia?: V3[];
  knob?: GeneratorKnob;
  /** the floating name (default BENCH_NAMES.generator) */
  label?: string;
  litIds?: string[];
  hoverIds?: string[];
}

function Knob({ pl, at, f, knob, lit }: { pl: Placement; at: V3; f: number; knob: GeneratorKnob & { id: string }; lit: boolean }) {
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const drag = useRef<{ x: number; y: number; f: number } | null>(null);
  const { range, onChange } = knob;
  const [lo, hi] = range;
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      onChange(dragFrequency(d.f, e.clientX - d.x, e.clientY - d.y, [lo, hi]));
    };
    const up = () => {
      if (!drag.current) return;
      drag.current = null;
      if (controls) controls.enabled = true;
      document.body.style.cursor = '';
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [controls, onChange, lo, hi]);
  const grab = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    drag.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, f };
    if (controls) controls.enabled = false;
    document.body.style.cursor = 'grabbing';
  };
  return (
    <group position={toWorld(pl, at)} rotation={[Math.PI / 2, pl.yaw ?? 0, 0, 'YXZ']} scale={pl.scale ?? 1}>
      <group rotation={[0, knobAngle(f, range), 0]}>
        <mesh
          onPointerDown={grab}
          onPointerOver={(e) => {
            e.stopPropagation();
            useStage.getState().setHover([knob.id]);
            document.body.style.cursor = 'grab';
          }}
          onPointerOut={() => {
            useStage.getState().setHover(null);
            if (!drag.current) document.body.style.cursor = '';
          }}
        >
          <cylinderGeometry args={[1.05, 1.15, 0.8, 28]} />
          <meshStandardMaterial color={lit ? '#fde68a' : '#2b2f36'} roughness={0.5} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.35 : 0} />
        </mesh>
        <mesh position={[0, 0.42, -0.7]}>
          <boxGeometry args={[0.2, 0.06, 0.8]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>
    </group>
  );
}

export function FunctionGenerator(p: FunctionGeneratorProps) {
  const { w, h, d } = GEN_SIZE;
  const pl: Placement = { position: p.position, yaw: p.yaw, scale: p.scale };
  const lit = useAnyLit([p.id, ...(p.litIds ?? [])]);
  const knobId = p.knob ? (p.knob.id ?? `${p.id}_knob`) : undefined;
  const knobLit = useAnyLit([knobId]);
  const on = p.output ?? true;
  const out = frontDir(pl);
  const bnc = toWorld(pl, [3.6, 1.4, d / 2 + 0.4]);
  const lamp: V3 = p.knob ? [2.2, 1.4, d / 2 + 0.06] : [3.6, 2.45, d / 2 + 0.06];
  const lines =
    p.lcd ?? genLcd({ waveform: p.waveform, frequency: p.frequency, vpp: p.vpp, offset: p.offset, output: on, readout: p.readout, impedance: p.impedance, offNote: p.offNote });
  return (
    <group name="bench_function_generator">
      <group position={toWorld(pl, [0, 0, 0])} rotation={[0, pl.yaw ?? 0, 0]} scale={pl.scale ?? 1} {...hoverHandlers(p.hoverIds ?? [p.id])}>
        <mesh position={[0, h / 2, 0]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#d9dde3" roughness={0.55} emissive={lit ? AMBER : '#000000'} emissiveIntensity={lit ? 0.3 : 0} />
        </mesh>
        <mesh position={[0, h / 2, d / 2 + 0.01]}>
          <planeGeometry args={[w - 0.6, h - 0.5]} />
          <meshStandardMaterial color="#3b4250" roughness={0.7} />
        </mesh>
        {[-3.6, -1.6].map((dx) => (
          <mesh key={dx} position={[dx, 1.2, d / 2 + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.5, 20]} />
            <meshStandardMaterial color="#9aa1ab" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        {/* OUTPUT BNC and its lamp */}
        <mesh position={[3.6, 1.4, d / 2 + 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.5, 16]} />
          <meshStandardMaterial color="#c8ccd2" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={lamp}>
          <planeGeometry args={p.knob ? [1.0, 0.45] : [1.3, 0.5]} />
          <meshBasicMaterial color={on ? '#22c55e' : '#e11d48'} />
        </mesh>
      </group>
      {p.knob && knobId && <Knob pl={pl} at={[3.4, 3.4, d / 2 + 0.35]} f={p.frequency} knob={{ ...p.knob, id: knobId }} lit={knobLit} />}
      {p.out !== undefined && <ClipLead from={bnc} out={out} to={p.out} color="#d62f2f" lit={lit} via={p.outVia} />}
      {p.gnd !== undefined && <ClipLead from={bnc} out={out} to={p.gnd} color="#24262b" lit={lit} via={p.gndVia} />}
      <Lcd position={toWorld(pl, [-1.2, h - 0.6, d / 2 + 0.05])} lines={lines} off={!on} />
      <NameTag position={toWorld(pl, [0, h + 1.8, -d / 2])} text={p.label ?? BENCH_NAMES.generator} tone="gen" lit={lit} />
    </group>
  );
}
