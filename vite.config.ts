import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { problemIndexPlugin } from './scripts/problem-index-plugin';

export default defineConfig({
  plugins: [react(), problemIndexPlugin()],
  server: { port: 5180 },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const p = id.replace(/\\/g, '/');
          // built-in theory problems: one chunk per chapter, loaded when the chapter is opened
          const m = /\/problems\/([^/]+)\/[^/]+\.json$/.exec(p);
          if (m) return `problems-${m[1]}`;
          if (/\/node_modules\/(three|@react-three|three-stdlib|troika-[^/]+|camera-controls|maath|meshline|@monogrid|stats-gl|stats\.js|suspend-react|its-fine|tunnel-rat|detect-gpu|hls\.js|@use-gesture|react-reconciler)\//.test(p))
            return 'three';
          return undefined;
        },
      },
    },
  },
});
