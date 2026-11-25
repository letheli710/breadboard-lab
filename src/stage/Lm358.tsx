// The one LM358 used on every World 3 breadboard (W3-L1, L3, L4, L8): a DIP-8 dual op amp
// straddling the centre trench, in the board coordinates of BreadboardXray (colX / ROW_Z).
//
// Seen from above with the notch on the left, pin 1 is bottom-left (row f, nearest the viewer):
// pins 1–4 run left → right along row f, pins 5–8 run right → left along row e.
//   8 V+   7 OUT B   6 IN− B   5 IN+ B        (row e)
//   1 OUT A 2 IN− A  3 IN+ A   4 V− / GND     (row f)
// Lessons place it with `c0` (the column of pins 1 and 8) and find a pin's hole with lm358Pin().
// Stage ids: `id` for the package, `${id}_p1` … `${id}_p8` for the pins (lit by useLit, and set
// as the hover on pointer enter / leave, like every stage object).

import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { colX, ROW_Z } from './BreadboardXray';
import { useLit, useStage } from './stageStore';

export type Lm358Pin = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const LM358_PINS: Record<Lm358Pin, { name: string; zh: string }> = {
  1: { name: 'OUT A', zh: '输出 A' },
  2: { name: 'IN− A', zh: '反相输入 A' },
  3: { name: 'IN+ A', zh: '同相输入 A' },
  4: { name: 'V− / GND', zh: '负电源（单电源时接地）' },
  5: { name: 'IN+ B', zh: '同相输入 B' },
  6: { name: 'IN− B', zh: '反相输入 B' },
  7: { name: 'OUT B', zh: '输出 B' },
  8: { name: 'V+', zh: '正电源' },
};

/** The breadboard hole a pin sits in when pins 1 and 8 are in column c0. */
export function lm358Pin(c0: number, pin: Lm358Pin): { col: number; row: 'e' | 'f' } {
  return pin <= 4 ? { col: c0 + pin - 1, row: 'f' } : { col: c0 + 8 - pin, row: 'e' };
}

const hover = (ids: string[] | null) => (e: ThreeEvent<PointerEvent>) => {
  e.stopPropagation();
  useStage.getState().setHover(ids);
};

export function Lm358({
  c0,
  id = 'chip_lm358',
  tag = 'LM358',
  pinNumbers = false,
}: {
  /** column of pins 1 and 8 */
  c0: number;
  /** stage id of the package; pins are `${id}_p1` … `${id}_p8` */
  id?: string;
  /** text of the floating tag ('' hides it) */
  tag?: string;
  /** show the pin numbers next to the pins */
  pinNumbers?: boolean;
}) {
  const lit = useLit();
  const on = (k: string) => !!lit?.includes(k);
  const x = colX(c0) + 1.5;
  const body = on(id);
  return (
    <group>
      <mesh position={[x, 0.55, 0]} onPointerEnter={hover([id])} onPointerLeave={hover(null)}>
        <boxGeometry args={[4.4, 0.7, 2.4]} />
        <meshStandardMaterial color="#26282c" roughness={0.55} emissive={body ? '#f59e0b' : '#000000'} emissiveIntensity={body ? 0.35 : 0} />
      </mesh>
      {/* notch on the left end, pin-1 dot bottom-left */}
      <mesh position={[colX(c0) - 0.72, 0.91, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 20, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#3d4046" />
      </mesh>
      <mesh position={[colX(c0) - 0.3, 0.91, 0.72]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 16]} />
        <meshStandardMaterial color="#55585e" />
      </mesh>
      {([1, 2, 3, 4, 5, 6, 7, 8] as Lm358Pin[]).map((p) => {
        const { col, row } = lm358Pin(c0, p);
        const z = Math.sign(ROW_Z[row]) * 1.45;
        const pid = `${id}_p${p}`;
        const hot = on(pid);
        return (
          <group key={p}>
            <mesh position={[colX(col), 0.12, z]} onPointerEnter={hover([pid])} onPointerLeave={hover(null)}>
              <boxGeometry args={[0.22, 0.9, 0.12]} />
              <meshStandardMaterial color={hot ? '#f59e0b' : '#c3c8ce'} metalness={0.8} roughness={0.3} emissive={hot ? '#f59e0b' : '#000000'} emissiveIntensity={hot ? 0.6 : 0} />
            </mesh>
            {pinNumbers && (
              <Html position={[colX(col), 0.2, z + Math.sign(z) * 0.75]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
                <div className={`bb3d-pin${hot ? ' on' : ''}`}>{p}</div>
              </Html>
            )}
          </group>
        );
      })}
      {tag && (
        <Html position={[x, 1.6, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bb3d-tag chip">{tag}</div>
        </Html>
      )}
    </group>
  );
}
