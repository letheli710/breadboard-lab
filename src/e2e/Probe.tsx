// Test-only scene helper (see ./flag.ts): projects holes / world points to client coordinates
// and counts rendered frames, so browser tests never depend on hard-coded pixels.
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { HOLE_MAP } from '../core/breadboard';
import { useStore } from '../state/store';

interface BBTest {
  frames: number;
  store: typeof useStore;
  /** client coordinates of a hole (null: unknown id) */
  hole(id: string): { x: number; y: number } | null;
  /** client coordinates of the point `y` units above a hole (where a raised wire arc is drawn) */
  above(id: string, y: number): { x: number; y: number } | null;
  world(x: number, y: number, z: number): { x: number; y: number };
  /** number of visible lesson-step pulse rings */
  pulses(): number;
  canvas: HTMLCanvasElement;
  /** what R3F's own raycaster sees at client (x, y): its stored canvas size and the hits */
  pick(x: number, y: number): { size: [number, number, number, number]; hits: string[] };
  /** camera position (world units): the view the user has, independent of the canvas size */
  camera(): [number, number, number];
}

declare global {
  interface Window {
    __bb?: BBTest;
  }
}

export function E2EProbe() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const get = useThree((s) => s.get);
  useEffect(() => {
    const world = (x: number, y: number, z: number) => {
      const v = new THREE.Vector3(x, y, z).project(camera);
      const r = gl.domElement.getBoundingClientRect();
      return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
    };
    const prev = window.__bb;
    window.__bb = {
      frames: prev?.frames ?? 0,
      store: useStore,
      canvas: gl.domElement,
      camera: () => camera.position.toArray() as [number, number, number],
      pick(x, y) {
        const st = get();
        const ndc = new THREE.Vector2(((x - st.size.left) / st.size.width) * 2 - 1, -((y - st.size.top) / st.size.height) * 2 + 1);
        const rc = new THREE.Raycaster();
        rc.setFromCamera(ndc, st.camera);
        const hits = rc.intersectObjects(scene.children, true).slice(0, 4);
        return {
          size: [st.size.left, st.size.top, st.size.width, st.size.height],
          hits: hits.map((h) => `${h.object.type}${h.instanceId !== undefined ? '#' + h.instanceId : ''}@${h.distance.toFixed(2)}`),
        };
      },
      world,
      hole(id) {
        const h = HOLE_MAP.get(id);
        return h ? world(h.x, 0.02, h.z) : null;
      },
      above(id, y) {
        const h = HOLE_MAP.get(id);
        return h ? world(h.x, y, h.z) : null;
      },
      pulses() {
        let n = 0;
        const m = new THREE.Matrix4();
        const s = new THREE.Vector3();
        scene.traverse((o) => {
          const im = o as THREE.InstancedMesh;
          if (!im.isInstancedMesh || im.geometry.type !== 'RingGeometry') return;
          for (let i = 0; i < im.count; i++) {
            im.getMatrixAt(i, m);
            s.setFromMatrixScale(m);
            if (s.x > 0.01) n++;
          }
        });
        return n;
      },
    };
  }, [camera, gl, scene, get]);
  // counts rendered frames without asking for any (the canvas renders on demand)
  useFrame(() => {
    if (window.__bb) window.__bb.frames++;
  });
  return null;
}

/** Throws during render when the page was opened with `?e2e&crash=canvas`. */
export function E2ECrash() {
  if (new URLSearchParams(location.search).get('crash') === 'canvas') throw new Error('e2e: injected render error');
  return null;
}
