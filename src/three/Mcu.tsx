// 3D models of the phase-5 dev boards: ESP32-DevKitC and STM32 "Blue Pill".
// The board is drawn in a local frame: origin at the anchor leg (first pin of the upper header)
// in x, half-way between the two headers in z. +x runs along the headers (columns), 1 unit =
// one hole pitch. The PCB sits on its pin headers, 1 unit above the breadboard.

import type { ThreeEvent } from '@react-three/fiber';
import { useContext, useMemo } from 'react';
import * as THREE from 'three';
import { BOARD } from '../core/breadboard';
import { tr } from '../core/i18n';
import { MCU_BOARDS, type McuBoardDef, type McuType } from '../core/mcu';
import type { McuState, PinState } from '../core/solver';
import type { PlacedPart } from '../core/types';
import { useStore } from '../state/store';
import { CanvasPlane, Mat, PartCtx, TextPlane, Tube, holeVec } from './common';
import type { PartViewProps } from './Parts';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** height of the PCB underside above the breadboard (header plastic) and PCB thickness */
const PCB_Y = 1.0;
const PCB_T = 0.6;
const TOP = PCB_Y + PCB_T;

interface BoardStyle {
  /** PCB extent beyond the first / last header column */
  left: number;
  right: number;
  /** PCB margin outside the header rows */
  margin: number;
  pcb: string;
  silk: string;
  /** micro-USB at the low-column (left) or high-column (right) end */
  usbSide: 'left' | 'right';
}

const STYLE: Record<McuType, BoardStyle> = {
  esp32_devkit: { left: 2.6, right: 1.5, margin: 0.55, pcb: '#17181c', silk: '#f1f1ee', usbSide: 'right' },
  stm32_bluepill: { left: 1.5, right: 1.1, margin: 0.85, pcb: '#1c55b8', silk: '#f4f6fb', usbSide: 'left' },
};

/** Where the board is on the breadboard (from its legs, so the ghost preview works too). */
export function useBoardFrame(part: PlacedPart) {
  const b = MCU_BOARDS[part.type as McuType];
  return useMemo(() => {
    const up = b.legs.find((l) => l.row === 0)!;
    const lo = b.legs.find((l) => l.row === 1)!;
    const pu = holeVec(part.pins[up.leg] ?? '');
    const pl = holeVec(part.pins[lo.leg] ?? '');
    const zc = (pu.z + pl.z) / 2;
    return { x0: pu.x, zc, half: Math.abs(pl.z - pu.z) / 2 };
  }, [b, part.pins]);
}

/** Label anchor (part label above the board). */
export function mcuAnchor(part: PlacedPart): THREE.Vector3 {
  const b = MCU_BOARDS[part.type as McuType];
  const up = b.legs.find((l) => l.row === 0)!;
  const lo = b.legs.find((l) => l.row === 1)!;
  const pu = holeVec(part.pins[up.leg] ?? '');
  const pl = holeVec(part.pins[lo.leg] ?? '');
  const x = part.type === 'esp32_devkit' ? pu.x + 3.4 : pu.x + 10.5;
  return V(x, 4.6, (pu.z + pl.z) / 2);
}

export function mcuLabel(st: McuState | undefined): string {
  if (!st) return '';
  if (!st.running) return st.v3 > 0.5 ? tr(' 欠压复位', ' brown-out') : tr(' 未供电', ' off');
  return ` ${st.v3.toFixed(2)}V`;
}

/* ------------------------------------------------------------------ silkscreen */

function drawSilk(g: CanvasRenderingContext2D, w: number, h: number, b: McuBoardDef, s: BoardStyle, half: number, ppu: number) {
  const L = -s.left;
  const zT = -half - s.margin;
  const X = (x: number) => (x - L) * ppu;
  const Z = (z: number) => (z - zT) * ppu;
  const esp = b.type === 'esp32_devkit';
  g.clearRect(0, 0, w, h);
  // header pads + labels
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (const l of b.legs) {
    const z = l.row === 0 ? -half : half;
    const x = l.col;
    g.fillStyle = '#d8c27a';
    g.beginPath();
    g.arc(X(x), Z(z), 0.36 * ppu, 0, Math.PI * 2);
    g.fill();
    if (l.col === 0 && l.row === 0) {
      // pin-1 square pad
      g.fillRect(X(x) - 0.36 * ppu, Z(z) - 0.36 * ppu, 0.72 * ppu, 0.72 * ppu);
    }
    const def = b.pins[l.pin];
    const lab = def?.label ?? l.pin;
    const power = def && (def.kind === '3v3' || def.kind === '5v' || def.kind === 'gnd');
    g.fillStyle = power ? '#ffd3a6' : def?.kind === 'flash' ? '#a9adb6' : s.silk;
    g.font = `700 ${0.52 * ppu}px "Barlow Condensed", sans-serif`;
    const zl = l.row === 0 ? z + 0.8 : z - 0.8;
    g.fillText(lab, X(x), Z(zl), 0.98 * ppu);
  }
  g.strokeStyle = s.silk;
  g.lineWidth = 0.05 * ppu;
  g.fillStyle = s.silk;
  if (esp) {
    // board name and button labels near the USB end
    g.font = `700 ${0.62 * ppu}px "Barlow Condensed", sans-serif`;
    g.save();
    g.translate(X(12.0), Z(2.75));
    g.fillText('ESP32-DevKitC', 0, 0);
    g.restore();
    g.font = `700 ${0.42 * ppu}px "Barlow Condensed", sans-serif`;
    g.fillText('EN', X(16.9), Z(-1.55));
    g.fillText('BOOT', X(16.9), Z(1.55));
    g.fillText('PWR', X(15.2), Z(-2.6));
    g.fillText('AMS1117', X(10.6), Z(-0.4));
    // keep-out outline under the antenna
    g.setLineDash([0.18 * ppu, 0.14 * ppu]);
    g.strokeRect(X(-2.6) + 2, Z(-3.15), (2.4) * ppu, 6.3 * ppu);
    g.setLineDash([]);
  } else {
    g.font = `700 ${0.42 * ppu}px "Barlow Condensed", sans-serif`;
    g.fillText('RESET', X(3.4), Z(1.2));
    g.fillText('BOOT0', X(13.2), Z(-0.62));
    g.fillText('BOOT1', X(13.2), Z(0.62));
    g.fillText('0      1', X(15.5), Z(-1.5));
    g.fillText('PWR', X(18.6), Z(1.25));
    g.fillText('PC13', X(18.6), Z(-1.25));
    g.font = `700 ${0.36 * ppu}px "Barlow Condensed", sans-serif`;
    g.fillText('8MHz', X(5.6), Z(-1.0));
    // outline of the MCU footprint
    g.save();
    g.translate(X(10.5), Z(0));
    g.rotate(Math.PI / 4);
    g.strokeRect(-1.75 * ppu, -1.75 * ppu, 3.5 * ppu, 3.5 * ppu);
    g.restore();
  }
}

function drawModuleTop(g: CanvasRenderingContext2D, w: number, h: number, ppu: number) {
  // module PCB 10 × 6.2 units; antenna area is the left 2.6 units
  g.clearRect(0, 0, w, h);
  g.strokeStyle = '#d6b15a';
  g.lineWidth = 0.16 * ppu;
  g.lineJoin = 'miter';
  g.beginPath();
  const x0 = 0.35 * ppu;
  const x1 = 2.25 * ppu;
  let y = 0.5 * ppu;
  g.moveTo(x1, h - 0.4 * ppu);
  g.lineTo(x1, y);
  let left = true;
  const step = 0.55 * ppu;
  while (y + step < h - 0.6 * ppu) {
    g.lineTo(left ? x0 : x1, y);
    y += step;
    g.lineTo(left ? x0 : x1, y);
    left = !left;
  }
  g.stroke();
  // castellated pads along both long edges and the far end
  g.fillStyle = '#d6b15a';
  for (let i = 0; i < 14; i++) {
    const x = (2.95 + i * 0.5) * ppu;
    g.fillRect(x, 0, 0.26 * ppu, 0.28 * ppu);
    g.fillRect(x, h - 0.28 * ppu, 0.26 * ppu, 0.28 * ppu);
  }
  for (let i = 0; i < 10; i++) g.fillRect(w - 0.28 * ppu, (0.7 + i * 0.5) * ppu, 0.28 * ppu, 0.26 * ppu);
}

function drawCanTop(g: CanvasRenderingContext2D, w: number, h: number) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#5b6068';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `700 ${h * 0.13}px "Barlow Condensed", sans-serif`;
  g.fillText('ESP32-WROOM-32', w * 0.1, h * 0.3);
  g.font = `600 ${h * 0.085}px "Barlow Condensed", sans-serif`;
  g.fillText('Wi-Fi + Bluetooth module', w * 0.1, h * 0.47);
  g.fillText('2.4 GHz · 802.11 b/g/n', w * 0.1, h * 0.6);
  g.strokeStyle = '#7a7f87';
  g.lineWidth = h * 0.012;
  g.strokeRect(w * 0.72, h * 0.7, w * 0.16, w * 0.16);
}

/* ------------------------------------------------------------------ small SMD helpers */

function Smd({ p, s, c = '#1c1d21', metal = false }: { p: [number, number, number]; s: [number, number, number]; c?: string; metal?: boolean }) {
  return (
    <mesh position={[p[0], TOP + s[1] / 2 + p[1], p[2]]} castShadow>
      <boxGeometry args={s} />
      <Mat color={c} metalness={metal ? 0.75 : 0} roughness={metal ? 0.3 : 0.5} />
    </mesh>
  );
}

/** 0603 resistor / capacitor: body plus two metal end caps. */
function Chip0603({ x, z, cap = false, rot = 0 }: { x: number; z: number; cap?: boolean; rot?: number }) {
  return (
    <group position={[x, TOP, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.4, 0.18, 0.24]} />
        <Mat color={cap ? '#b48a5a' : '#1c1d21'} />
      </mesh>
      {[-0.24, 0.24].map((dx) => (
        <mesh key={dx} position={[dx, 0.09, 0]}>
          <boxGeometry args={[0.1, 0.19, 0.25]} />
          <Mat color="#d3d6db" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function TactButton({ x, z, cap = '#2a2b30' }: { x: number; z: number; cap?: string }) {
  return (
    <group position={[x, TOP, z]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.35, 0.5, 1.05]} />
        <Mat color="#c9ccd1" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.36, 0.24, 18]} />
        <Mat color={cap} roughness={0.5} />
      </mesh>
    </group>
  );
}

function SmdLed({ x, z, color, on }: { x: number; z: number; color: string; on: boolean }) {
  const ctx = useContext(PartCtx);
  return (
    <group position={[x, TOP, z]}>
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[0.55, 0.22, 0.34]} />
        <Mat color={on ? color : '#e9e4da'} emissive={color} emissiveIntensity={on ? 2.2 : 0} opacity={0.92} />
      </mesh>
      {on && !ctx.ghost && (
        <>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.55, 14, 10]} />
            <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
          </mesh>
          <pointLight color={color} intensity={1.6} distance={3.5} decay={1.6} position={[0, 0.6, 0]} />
        </>
      )}
    </group>
  );
}

function MicroUsb({ x, dir }: { x: number; dir: 1 | -1 }) {
  // x = outer face of the connector; dir = outward direction
  return (
    <group position={[x - dir * 1.05, TOP, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2.1, 1.0, 3.0]} />
        <Mat color="#c3c7cd" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[dir * 1.06, 0.5, 0]}>
        <boxGeometry args={[0.04, 0.5, 2.3]} />
        <Mat color="#101114" />
      </mesh>
    </group>
  );
}

/** USB plug stub and a cable running off the edge of the breadboard. */
function UsbCable({ xFace, dir, frameX, zc }: { xFace: number; dir: 1 | -1; frameX: number; zc: number }) {
  const pts = useMemo(() => {
    // in local coordinates of the board group (origin at frameX, 0, zc): a short straight run out
    // of the socket, then up and back over the far edge of the breadboard to the table
    void frameX;
    const back = -BOARD.depth / 2 - zc - 1.0;
    const X = (d: number) => xFace + dir * d;
    return [
      V(X(2.1), TOP + 0.5, 0),
      V(X(3.2), TOP + 0.6, -0.3),
      V(X(4.4), 2.6, -3.5),
      V(X(5.2), 2.1, back),
      V(X(5.8), -0.3, back - 1.8),
      V(X(6.6), -0.86, back - 5.5),
    ];
  }, [xFace, dir, frameX, zc]);
  return (
    <group>
      {/* plug: metal tip inside the receptacle, black overmould */}
      <mesh position={[xFace + dir * 0.15, TOP + 0.5, 0]}>
        <boxGeometry args={[0.3, 0.45, 2.1]} />
        <Mat color="#c3c7cd" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[xFace + dir * 1.25, TOP + 0.5, 0]} castShadow>
        <boxGeometry args={[1.9, 1.15, 2.2]} />
        <Mat color="#26282e" roughness={0.6} />
      </mesh>
      <Tube pts={pts} r={0.3} color="#2e3036" />
    </group>
  );
}

/* ------------------------------------------------------------------ pins */

function PinMarks({ x, z, st, selected, row }: { x: number; z: number; st?: PinState; selected: boolean; row: 0 | 1 }) {
  const dmg = st?.damaged;
  const warn = !dmg && (st?.overcurrent || st?.overvoltage || st?.undervoltage);
  const zl = row === 0 ? z + 0.8 : z - 0.8;
  return (
    <group>
      {dmg && (
        <>
          <mesh position={[x, TOP + 0.006, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.62, 24]} />
            <meshBasicMaterial color="#2a1408" transparent opacity={0.85} depthWrite={false} />
          </mesh>
          <mesh position={[x, TOP + 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.64, 24]} />
            <meshBasicMaterial color="#ff3b30" toneMapped={false} />
          </mesh>
          <mesh position={[x, TOP + 0.4, z]}>
            <sphereGeometry args={[0.32, 10, 8]} />
            <meshBasicMaterial color="#5a5a5a" transparent opacity={0.35} depthWrite={false} />
          </mesh>
        </>
      )}
      {warn && (
        <mesh position={[x, TOP + 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.46, 0.6, 24]} />
          <meshBasicMaterial color="#f4a261" toneMapped={false} />
        </mesh>
      )}
      {selected && (
        <>
          <mesh position={[x, TOP + 0.016, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.44, 0.62, 28]} />
            <meshBasicMaterial color="#2ee6d6" toneMapped={false} />
          </mesh>
          <mesh position={[x, TOP + 0.004, zl]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.98, 0.62]} />
            <meshBasicMaterial color="#2ba59b" transparent opacity={0.75} depthWrite={false} />
          </mesh>
          <mesh position={[x, TOP + 0.75, z]}>
            <coneGeometry args={[0.22, 0.45, 12]} />
            <meshBasicMaterial color="#2ee6d6" toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
}

function Headers({ b, half }: { b: McuBoardDef; half: number }) {
  const n = b.upper.length;
  return (
    <group>
      {/* black header plastic under the PCB */}
      {[-half, half].map((z) => (
        <mesh key={z} position={[(n - 1) / 2, PCB_Y / 2, z]} castShadow>
          <boxGeometry args={[n, PCB_Y, 0.95]} />
          <Mat color="#121316" roughness={0.6} />
        </mesh>
      ))}
      {b.legs.map((l) => {
        const z = l.row === 0 ? -half : half;
        return (
          <group key={l.leg} position={[l.col, 0, z]}>
            <mesh position={[0, (TOP + 0.35 - 0.3) / 2, 0]}>
              <boxGeometry args={[0.24, TOP + 0.35 + 0.3, 0.24]} />
              <Mat color="#d9c27c" metalness={0.75} roughness={0.3} />
            </mesh>
            <mesh position={[0, TOP + 0.07, 0]}>
              <cylinderGeometry args={[0.13, 0.3, 0.14, 12]} />
              <Mat color="#d3d6db" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ boards */

function PcbBase({ s, half, len }: { s: BoardStyle; half: number; len: number }) {
  const w = len;
  const d = 2 * (half + s.margin);
  const cx = -s.left + w / 2;
  return (
    <mesh position={[cx, PCB_Y + PCB_T / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, PCB_T, d]} />
      <Mat color={s.pcb} roughness={0.55} />
    </mesh>
  );
}

function Esp32Body({ st }: { st?: McuState }) {
  const ctx = useContext(PartCtx);
  return (
    <group>
      {/* WROOM module: PCB with the antenna overhanging the board's left edge */}
      <group position={[-2.9 + 5, TOP, 0]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <boxGeometry args={[10, 0.32, 6.2]} />
          <Mat color="#101113" roughness={0.5} />
        </mesh>
        {!ctx.ghost && (
          <CanvasPlane width={10} height={6.2} ppu={64} draw={(g, w, h) => drawModuleTop(g, w, h, 64)} deps={[]} position={[0, 0.325, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        )}
        {/* shield can */}
        <mesh position={[1.35, 0.32 + 0.6, 0]} castShadow>
          <boxGeometry args={[7.1, 1.2, 5.5]} />
          <Mat color="#c3c7cd" metalness={0.85} roughness={0.32} />
        </mesh>
        {!ctx.ghost && <CanvasPlane width={6.6} height={5.0} ppu={80} draw={drawCanTop} deps={[]} position={[1.35, 1.525, 0]} rotation={[-Math.PI / 2, 0, 0]} />}
      </group>
      {/* AMS1117 (SOT-223) with its tab */}
      <group position={[10.6, TOP, -1.55]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[2.6, 0.6, 1.4]} />
          <Mat color="#1c1d21" />
        </mesh>
        <mesh position={[0, 0.04, -0.95]}>
          <boxGeometry args={[1.25, 0.08, 0.7]} />
          <Mat color="#d3d6db" metalness={0.85} roughness={0.25} />
        </mesh>
        {[-0.9, 0, 0.9].map((dx) => (
          <mesh key={dx} position={[dx, 0.04, 0.9]}>
            <boxGeometry args={[0.28, 0.08, 0.5]} />
            <Mat color="#d3d6db" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
      </group>
      {/* USB–UART bridge (QFN) */}
      <Smd p={[13.6, 0, -0.2]} s={[2.0, 0.35, 2.0]} />
      {/* passives */}
      <Chip0603 x={8.2} z={-1.6} cap />
      <Chip0603 x={8.2} z={-0.7} cap />
      <Chip0603 x={8.2} z={1.3} />
      <Chip0603 x={12.6} z={1.9} />
      <Chip0603 x={12.2} z={-2.4} cap rot={Math.PI / 2} />
      <Chip0603 x={15.4} z={1.9} />
      <Chip0603 x={15.3} z={-1.6} rot={Math.PI / 2} />
      <Smd p={[9.4, 0, 1.4]} s={[1.0, 0.55, 0.8]} c="#c8a24a" />
      {/* buttons either side of the USB socket */}
      <TactButton x={17.4} z={-2.45} />
      <TactButton x={17.4} z={2.45} />
      <SmdLed x={15.2} z={-2.05} color="#ff3b30" on={!!st?.powerLed} />
      <MicroUsb x={18 + STYLE.esp32_devkit.right + 0.35} dir={1} />
    </group>
  );
}

function BluePillBody({ st }: { st?: McuState }) {
  const ctx = useContext(PartCtx);
  return (
    <group>
      {/* LQFP-48, rotated 45° as on the real board */}
      <group position={[10.5, TOP, 0]} rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[3.25, 0.1, 3.25]} />
          <Mat color="#c9ccd1" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[2.65, 0.5, 2.65]} />
          <Mat color="#1c1d21" roughness={0.45} />
        </mesh>
        <mesh position={[-0.9, 0.555, 0.9]}>
          <cylinderGeometry args={[0.15, 0.15, 0.01, 14]} />
          <Mat color="#3c3e45" />
        </mesh>
        {!ctx.ghost && (
          <TextPlane
            text={['STM32', 'F103C8T6']}
            width={2.3}
            height={1.0}
            color="#bfc3ca"
            font='700 52px "Barlow Condensed", sans-serif'
            position={[0, 0.556, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
        )}
      </group>
      {/* 8 MHz crystal (HC-49/S) and the 32.768 kHz tuning fork */}
      <group position={[5.6, TOP, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[2.7, 1.0, 1.15]} />
          <Mat color="#d0d3d8" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[3.1, 0.06, 1.3]} />
          <Mat color="#20242c" />
        </mesh>
      </group>
      <mesh position={[7.7, TOP + 0.32, 0.85]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.3, 14]} />
        <Mat color="#d0d3d8" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* regulator (SOT-23-5) */}
      <Smd p={[1.6, 0, 1.0]} s={[1.15, 0.42, 0.65]} />
      {/* reset button */}
      <TactButton x={3.4} z={0} />
      {/* BOOT0 / BOOT1 jumper headers with yellow caps on "0" */}
      {[-0.95, 0.95].map((dz, k) => (
        <group key={k} position={[15.5, TOP, dz * 0.65]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[3.0, 0.9, 0.95]} />
            <Mat color="#121316" />
          </mesh>
          {[-1, 0, 1].map((dx) => (
            <mesh key={dx} position={[dx, 1.25, 0]}>
              <boxGeometry args={[0.22, 0.9, 0.22]} />
              <Mat color="#d9c27c" metalness={0.75} roughness={0.3} />
            </mesh>
          ))}
          <mesh position={[-0.5, 1.4, 0]} castShadow>
            <boxGeometry args={[1.95, 1.0, 0.92]} />
            <Mat color="#f2c418" roughness={0.45} />
          </mesh>
        </group>
      ))}
      <Chip0603 x={6.0} z={1.0} />
      <Chip0603 x={8.6} z={-1.8} cap />
      <Chip0603 x={12.9} z={1.6} />
      <Chip0603 x={12.9} z={-1.6} cap />
      <Chip0603 x={17.4} z={0} rot={Math.PI / 2} />
      <Chip0603 x={1.9} z={-1.4} cap />
      <SmdLed x={18.6} z={0.6} color="#ff3b30" on={!!st?.powerLed} />
      <SmdLed x={18.6} z={-0.6} color="#4ade80" on={!!st?.userLed} />
      <MicroUsb x={-STYLE.stm32_bluepill.left - 0.35} dir={-1} />
    </group>
  );
}

export function McuBoard({ part, sim }: PartViewProps) {
  const type = part.type as McuType;
  const b = MCU_BOARDS[type];
  const s = STYLE[type];
  const ctx = useContext(PartCtx);
  const { x0, zc, half } = useBoardFrame(part);
  const st = sim?.mcus.get(part.ref);
  const n = b.upper.length - 1;
  const len = n + s.left + s.right;
  const selectedId = useStore((x) => x.selectedId);
  const selectedPin = useStore((x) => x.selectedPin);
  const tool = useStore((x) => x.tool);
  const selectPin = useStore((x) => x.selectPin);
  const mine = selectedId === part.id;
  const usb = part.props.usb !== false;
  const ppu = 96;
  const silkD = 2 * (half + s.margin);
  const xFace = s.usbSide === 'right' ? n + s.right + 0.35 : -s.left - 0.35;
  const dir: 1 | -1 = s.usbSide === 'right' ? 1 : -1;

  const pick = (pin: string) => (e: ThreeEvent<MouseEvent>) => {
    if (tool !== 'select' || e.delta > 5) return;
    e.stopPropagation();
    selectPin(part.id, pin);
  };

  return (
    <group position={[x0, 0, zc]}>
      <Headers b={b} half={half} />
      <PcbBase s={s} half={half} len={len} />
      {!ctx.ghost && (
        <CanvasPlane
          width={len}
          height={silkD}
          ppu={ppu}
          draw={(g, w, h) => drawSilk(g, w, h, b, s, half, ppu)}
          deps={[type, half]}
          position={[-s.left + len / 2, TOP + 0.003, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      )}
      {type === 'esp32_devkit' ? <Esp32Body st={st} /> : <BluePillBody st={st} />}
      {usb && <UsbCable xFace={xFace} dir={dir} frameX={x0} zc={zc} />}
      {!ctx.ghost &&
        b.legs.map((l) => {
          const z = l.row === 0 ? -half : half;
          const pinSt = st?.pins.get(l.pin);
          const isSel = mine && selectedPin === l.pin;
          return (
            <group key={l.leg}>
              <PinMarks x={l.col} z={z} st={pinSt} selected={isSel} row={l.row} />
              {/* click target over the pin and its silkscreen label */}
              <mesh position={[l.col, TOP + 0.12, z + (l.row === 0 ? 0.4 : -0.4)]} onClick={pick(l.pin)}>
                <boxGeometry args={[0.92, 0.3, 1.75]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            </group>
          );
        })}
    </group>
  );
}
