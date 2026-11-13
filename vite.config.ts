import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { contentChunkName, problemIndexPlugin } from './scripts/problem-index-plugin';
import { challengeIndexPlugin } from './scripts/challenge-index-plugin';

// three.js and everything that only the 3D workbench uses (react-three-fiber pulls in
// react-reconciler, which must NOT live with react / react-dom — that would drag the whole
// three chunk onto the critical path of every page)
const THREE_DEPS =
  /\/node_modules\/(three|@react-three|three-stdlib|troika-[^/]+|camera-controls|maath|meshline|@monogrid|stats-gl|stats\.js|suspend-react|its-fine|tunnel-rat|detect-gpu|hls\.js|@use-gesture|react-reconciler)\//;
const REACT_DEPS = /\/node_modules\/(react|react-dom|scheduler|zustand|use-sync-external-store)\//;

export default defineConfig({
  plugins: [react(), problemIndexPlugin(), challengeIndexPlugin()],
  server: { port: 5180 },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // built-in theory problems (one chunk per chapter) and lessons / challenges (lessons,
          // intro, phase 1…5): the group modules of scripts/*-index-plugin.ts, loaded on demand
          const g = contentChunkName(id);
          if (g) return g;
          const p = id.replace(/\\/g, '/');
          // Vite's / Rollup's tiny runtime helpers go with the always-loaded vendor chunk, or
          // Rollup may park them in `three` and every page would import (and preload) it
          if (p.includes('vite/preload-helper') || p.includes('commonjsHelpers')) return 'react';
          if (THREE_DEPS.test(p)) return 'three';
          if (REACT_DEPS.test(p)) return 'react';
          return undefined;
        },
      },
    },
  },
});
