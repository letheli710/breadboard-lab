import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { contentChunkName, problemIndexPlugin, summaryIndexPlugin } from './scripts/problem-index-plugin.ts';
import { challengeIndexPlugin } from './scripts/challenge-index-plugin.ts';

// three.js and everything that only the 3D workbench uses (react-three-fiber pulls in
// react-reconciler, which must NOT live with react / react-dom — that would drag the whole
// three chunk onto the critical path of every page)
const THREE_DEPS =
  /\/node_modules\/(three|@react-three|three-stdlib|troika-[^/]+|camera-controls|maath|meshline|@monogrid|stats-gl|stats\.js|suspend-react|its-fine|tunnel-rat|detect-gpu|hls\.js|@use-gesture|react-reconciler)\//;
const REACT_DEPS = /\/node_modules\/(react|react-dom|scheduler|zustand|use-sync-external-store)\//;

export default defineConfig({
  plugins: [react(), problemIndexPlugin(), challengeIndexPlugin(), summaryIndexPlugin()],
  // browser-test hooks (src/e2e/): compiled in only for `VITE_E2E=1` builds (npm run e2e)
  define: { __E2E__: JSON.stringify(process.env.VITE_E2E === '1') },
  server: { port: 5180 },
  // agent worktrees (.claude/worktrees) hold copies of the repo: not part of this checkout's tests
  test: { exclude: [...configDefaults.exclude, '.claude/**'] },
  // the HarmonyOS Sans web font package only exports its all-weights stylesheet; the alias lets
  // src/fonts.css import just the weights the UI uses (each split by unicode-range into small files,
  // so a page downloads only the pieces covering the characters it shows)
  resolve: { alias: { '@harmonyos-sans': fileURLToPath(new URL('./node_modules/harmonyos-sans-webfont-splitted/dist', import.meta.url)) } },
  build: {
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      output: {
        // Rolldown manual code splitting (Vite 8 replaced Rollup's `manualChunks` with this).
        // One group whose name() picks the chunk; null leaves a module to automatic chunking.
        codeSplitting: {
          groups: [
            {
              name(id) {
                // built-in theory problems (one chunk per chapter) and lessons / challenges
                // (lessons, intro, phase 1…5): the group modules of scripts/*-index-plugin.ts,
                // loaded on demand
                const g = contentChunkName(id);
                if (g) return g;
                const p = id.replace(/\\/g, '/');
                // the bundler's tiny runtime helpers go with the always-loaded vendor chunk, or
                // they may be parked in `three` and every page would import (and preload) it
                if (p.includes('vite/preload-helper') || p.includes('commonjsHelpers')) return 'react';
                if (THREE_DEPS.test(p)) return 'three';
                if (REACT_DEPS.test(p)) return 'react';
                return null;
              },
            },
          ],
        },
      },
    },
  },
});
