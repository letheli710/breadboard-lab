// The LM741 of W3-L1: a single op amp in the same DIP-8 package as the shared LM358
// (src/stage/Lm358.tsx), drawn the same way and placed the same way — notch on the left, pins 1–4
// along row f, 5–8 back along row e, `c0` the column of pins 1 and 8 (so lm358Pin finds its holes
// too). Only the pinout differs: 1 / 5 offset null, 2 IN−, 3 IN+, 4 V−, 6 OUT, 7 V+, 8 NC.
// Stage ids: `id` for the package, `${id}_p1` … `${id}_p8` for the pins.

import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { colX, ROW_Z } from '../../BreadboardXray';
import { lm358Pin } from '../../Lm358';
import { useLit, useStage } from '../../stageStore';
import { ALL_PINS } from './model';

const hover = (ids: string[] | null) => (e: ThreeEvent<PointerEvent>) => {
  e.stopPropagation();
  useStage.getState().setHover(ids);
};

export function Lm741({ c0, id = 'chip_lm741', tag = 'LM741', pinNumbers = false }: { c0: number; id?: string; tag?: string; pinNumbers?: boolean }) {
  const lit = useLit();
  const on = (k: string) => lit.includes(k);
  const x = colX(c0) + 1.5;
  const body = on(id);
  return (
    <group>
      <mesh position={[x, 0.55, 0]} onPointerEnter={hover([id])} onPointerLeave={hover(null)}>
        <boxGeometry args={[4.4, 0.7, 2.4]} />
        <meshStandardMaterial color="#2a2622" roughness={0.55} emissive={body ? '#f59e0b' : '#000000'} emissiveIntensity={body ? 0.35 : 0} />
      </mesh>
      <mesh position={[colX(c0) - 0.72, 0.91, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 20, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#423d37" />
      </mesh>
      <mesh position={[colX(c0) - 0.3, 0.91, 0.72]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 16]} />
        <meshStandardMaterial color="#5a554e" />
      </mesh>
      {ALL_PINS.map((p) => {
        const { col, row } = lm358Pin(c0, p);
        const z = Math.sign(ROW_Z[row]) * 1.45;
        const pid = `${id}_p${p}`;
        const hot = on(pid);
        // the offset-null pins and NC stay unconnected: a duller finish
        const idle = p === 1 || p === 5 || p === 8;
        return (
          <group key={p}>
            <mesh position={[colX(col), 0.12, z]} onPointerEnter={hover([pid])} onPointerLeave={hover(null)}>
              <boxGeometry args={[0.22, 0.9, 0.12]} />
              <meshStandardMaterial
                color={hot ? '#f59e0b' : idle ? '#a7acb3' : '#c3c8ce'}
                metalness={0.8}
                roughness={0.3}
                emissive={hot ? '#f59e0b' : '#000000'}
                emissiveIntensity={hot ? 0.6 : 0}
              />
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
