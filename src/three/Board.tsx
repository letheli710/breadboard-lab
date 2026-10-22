import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { BOARD, COLS, HOLES, HOLE_MAP, MAIN_ROWS, ROW_Z, colX, stripLabel } from '../core/breadboard';
import { volts } from '../core/format';
import { tr } from '../core/i18n';
import { connectedHoles, isFloating } from '../core/netlist';
import { useDerived } from '../state/derived';
import { occupied, useStore } from '../state/store';

const NET_PALETTE = ['#f4a261', '#2a9d8f', '#9b5de5', '#00bbf9', '#f15bb5', '#90be6d', '#fee440', '#e76f51', '#4cc9f0', '#b5838d'];

export function netColor(name: string, index: number): string {
  if (name === 'VCC' || name.endsWith('+')) return '#e63946';
  if (name === 'GND' || name.endsWith('−')) return '#1d3557';
  return NET_PALETTE[index % NET_PALETTE.length];
}

/** Printed board surface: holes, rail stripes, row letters, column numbers. */
function useBoardTexture() {
  return useMemo(() => {
    const ppu = 64; // pixels per unit
    const W = BOARD.width;
    const D = BOARD.depth;
    const c = document.createElement('canvas');
    c.width = Math.round(W * ppu);
    c.height = Math.round(D * ppu);
    const g = c.getContext('2d')!;
    const X = (x: number) => (x + W / 2) * ppu;
    const Z = (z: number) => (z + D / 2) * ppu;
    g.fillStyle = '#f7f2e7';
    g.fillRect(0, 0, c.width, c.height);

    // rail stripes
    const stripe = (z: number, color: string) => {
      g.strokeStyle = color;
      g.lineWidth = 0.09 * ppu;
      g.beginPath();
      g.moveTo(X(colX(1) - 0.6), Z(z));
      g.lineTo(X(colX(COLS) + 0.6), Z(z));
      g.stroke();
    };
    stripe(ROW_Z.tp - 0.62, '#e63946');
    stripe(ROW_Z.tn + 0.62, '#2b59c3');
    stripe(ROW_Z.bp - 0.62, '#e63946');
    stripe(ROW_Z.bn + 0.62, '#2b59c3');

    g.font = `700 ${0.62 * ppu}px "Barlow Condensed", sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const sign = (z: number, s: string, color: string) => {
      g.fillStyle = color;
      g.fillText(s, X(colX(1) - 1.05), Z(z));
      g.fillText(s, X(colX(COLS) + 1.05), Z(z));
    };
    sign(ROW_Z.tp, '+', '#e63946');
    sign(ROW_Z.tn, '−', '#2b59c3');
    sign(ROW_Z.bp, '+', '#e63946');
    sign(ROW_Z.bn, '−', '#2b59c3');

    // row letters
    g.fillStyle = '#6b6f7a';
    g.font = `600 ${0.5 * ppu}px "Barlow Condensed", sans-serif`;
    for (const r of MAIN_ROWS) {
      g.fillText(r, X(colX(1) - 1.0), Z(ROW_Z[r]));
      g.fillText(r, X(colX(COLS) + 1.0), Z(ROW_Z[r]));
    }
    // column numbers
    g.font = `600 ${0.42 * ppu}px "Barlow Condensed", sans-serif`;
    for (let col = 1; col <= COLS; col++) {
      if (col !== 1 && col % 5 !== 0) continue;
      g.fillText(String(col), X(colX(col)), Z(ROW_Z.a - 0.95));
      g.fillText(String(col), X(colX(col)), Z(ROW_Z.j + 0.95));
    }

    // holes
    for (const h of HOLES) {
      const s = 0.36 * ppu;
      g.fillStyle = '#d9d2c3';
      g.fillRect(X(h.x) - s / 2 - 3, Z(h.z) - s / 2 - 3, s + 6, s + 6);
      g.fillStyle = '#2f3138';
      g.fillRect(X(h.x) - s / 2, Z(h.z) - s / 2, s, s);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
}

const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

export function Board() {
  const tex = useBoardTexture();
  const tool = useStore((s) => s.tool);
  const hoverHole = useStore((s) => s.hoverHole);
  const hoverNet = useStore((s) => s.hoverNet);
  const layout = useStore((s) => s.layout);
  const showNets = useStore((s) => s.showNets);
  const highlight = useStore((s) => s.highlight);
  const firstHole = useStore((s) => s.firstHole);
  const probe = useStore((s) => s.probe);
  const setHoverHole = useStore((s) => s.setHoverHole);
  const clickHole = useStore((s) => s.clickHole);
  const step = useStore((s) => s.step);
  const activeId = useStore((s) => s.activeId);
  const challenges = useStore((s) => s.challenges);
  const mode = useStore((s) => s.mode);
  const { nl, sim } = useDerived();

  const stepHoles = useMemo(() => {
    if (mode !== 'learn' && mode !== 'challenge') return [];
    const ch = challenges.find((c) => c.id === activeId);
    return ch?.steps[step]?.highlight ?? [];
  }, [mode, challenges, activeId, step]);

  const hoverStrip = useMemo(() => (hoverHole ? connectedHoles(layout, hoverHole) : []), [hoverHole, layout]);
  const netIndex = useMemo(() => new Map(nl.circuit.nets.map((n, i) => [n.name, i])), [nl]);

  const overlay = useRef<THREE.InstancedMesh>(null);
  const pulse = useRef<THREE.InstancedMesh>(null);
  const hit = useRef<THREE.InstancedMesh>(null);

  // hit boxes
  useLayoutEffect(() => {
    const m = hit.current!;
    HOLES.forEach((h, i) => {
      dummy.position.set(h.x, 0.02, h.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, []);

  // coloured overlays (hover strip, nets, highlights)
  useLayoutEffect(() => {
    const m = overlay.current!;
    const occ = occupied(layout);
    const hoverSet = new Set(hoverStrip);
    const netHover = hoverNet ? new Set(nl.netHoles.get(hoverNet) ?? []) : null;
    const hl = new Set(highlight?.holes ?? []);
    HOLES.forEach((h, i) => {
      let color: string | null = null;
      let s = 1;
      if (showNets) {
        const n = nl.holeNet.get(h.id);
        if (n) color = netColor(n, netIndex.get(n) ?? 0);
      }
      if (netHover?.has(h.id)) color = '#2ba59b';
      if (hoverSet.has(h.id)) color = '#2ba59b';
      if (hl.has(h.id)) color = highlight!.tone === 'error' ? '#e5383b' : '#2ba59b';
      if (h.id === firstHole) color = '#f4a261';
      if (occ.has(h.id) && !color) {
        color = null;
      }
      if (!color) s = 0;
      dummy.position.set(h.x, 0.012, h.z);
      dummy.scale.set(s, 1, s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, tmpColor.set(color ?? '#000000'));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [hoverStrip, showNets, nl, netIndex, highlight, firstHole, layout, hoverNet]);

  // pulsing rings for lesson steps
  useLayoutEffect(() => {
    const m = pulse.current!;
    for (let i = 0; i < 64; i++) {
      const h = HOLE_MAP.get(stepHoles[i] ?? '');
      dummy.position.set(h?.x ?? 0, 0.03, h?.z ?? 0);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.setScalar(h ? 1 : 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [stepHoles]);
  useFrame(({ clock }) => {
    const mat = pulse.current?.material as THREE.MeshBasicMaterial | undefined;
    if (mat) mat.opacity = 0.45 + 0.4 * Math.sin(clock.elapsedTime * 5);
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (e.instanceId === undefined) return;
    setHoverHole(HOLES[e.instanceId].id);
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 5 || e.instanceId === undefined) return;
    e.stopPropagation();
    clickHole(HOLES[e.instanceId].id, e.nativeEvent.shiftKey);
  };

  const hh = hoverHole ? HOLE_MAP.get(hoverHole) : null;
  const hoverNetName = hoverHole ? nl.holeNet.get(hoverHole) : undefined;
  const occ = occupied(layout);

  return (
    <group>
      {/* body */}
      <mesh position={[0, -BOARD.height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[BOARD.width, BOARD.height, BOARD.depth]} />
        <meshStandardMaterial color="#efe8da" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[BOARD.width, BOARD.depth]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      {/* centre trench */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[COLS + 0.6, 0.12, 1.2]} />
        <meshStandardMaterial color="#d8d0bf" roughness={0.9} />
      </mesh>
      {/* separators between rails and main area */}
      {[-6.9, 6.9].map((z) => (
        <mesh key={z} position={[0, -0.03, z]}>
          <boxGeometry args={[COLS + 0.6, 0.08, 0.18]} />
          <meshStandardMaterial color="#e2dacb" />
        </mesh>
      ))}

      <instancedMesh ref={overlay} args={[undefined, undefined, HOLES.length]} frustumCulled={false}>
        <boxGeometry args={[0.62, 0.02, 0.62]} />
        <meshBasicMaterial transparent opacity={0.85} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={pulse} args={[undefined, undefined, 64]} frustumCulled={false}>
        <ringGeometry args={[0.36, 0.5, 24]} />
        <meshBasicMaterial color="#2ba59b" transparent opacity={0.8} toneMapped={false} side={THREE.DoubleSide} />
      </instancedMesh>

      <instancedMesh
        ref={hit}
        args={[undefined, undefined, HOLES.length]}
        onPointerMove={onMove}
        onPointerOut={() => setHoverHole(null)}
        onClick={onClick}
        frustumCulled={false}
      >
        <boxGeometry args={[0.95, 0.06, 0.95]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </instancedMesh>

      {/* probes */}
      {(['red', 'black'] as const).map((k) => {
        const h = probe[k] ? HOLE_MAP.get(probe[k]!) : null;
        if (!h || tool !== 'probe') return null;
        return (
          <group key={k} position={[h.x, 0, h.z]}>
            <mesh position={[0, 1.4, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 2.2, 12]} />
              <meshStandardMaterial color={k === 'red' ? '#d62828' : '#222'} />
            </mesh>
            <mesh position={[0, 0.15, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.08, 0.4, 8]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
            </mesh>
          </group>
        );
      })}

      {hh && (
        <Html position={[hh.x, 0.4, hh.z]} style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
          <div className="hole-tip">
            <b>{hh.id}</b>
            <span>
              {tr(`${stripLabel(hh.strip)} 内部相连`, `${stripLabel(hh.strip)}: connected inside`)}
              {occ.has(hh.id) ? tr(` · 已插 ${occ.get(hh.id)}`, ` · holds ${occ.get(hh.id)}`) : ''}
            </span>
            {hoverNetName && !isFloating(hoverNetName) && (
              <span>
                {tr('节点', 'Node')} {hoverNetName} · {volts(sim.nodeV.get(hoverNetName) ?? 0)}
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
