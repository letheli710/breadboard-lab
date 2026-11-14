/* global require, process, console, fetch, setTimeout, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports */
// `npm run e2e`: production build with the test hooks (VITE_E2E=1 → dist-e2e/), `vite preview` of
// it, then the browser suites against it: scripts/e2e-routes.cjs , scripts/e2e-bench.cjs , scripts/e2e-a11y.cjs and scripts/e2e-lessons.cjs
// (axe-core, fails on serious / critical violations not in scripts/a11y-baseline.json). Exit code 1 if any fails; screenshots of failures in e2e-artifacts/.
//   npm run e2e                 build + all suites
//   npm run e2e -- --no-build   reuse dist-e2e/
//   npm run e2e -- bench        only these suites (routes, bench, a11y, lessons)
//   npm run e2e -- --all-lessons  the lessons suite does all eight instrument lessons (default: three)
const { spawn, spawnSync } = require('node:child_process');
const { join } = require('node:path');
const root = join(__dirname, '..');
const args = process.argv.slice(2);
const PORT = 4174;
const BASE = `http://localhost:${PORT}/`;
const suites = args.filter((a) => !a.startsWith('--'));
const run = (cmd, a, env = {}) => spawnSync(cmd, a, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } }).status;

if (!args.includes('--no-build')) {
  if (run('npx', ['vite', 'build', '--outDir', 'dist-e2e', '--emptyOutDir'], { VITE_E2E: '1' }) !== 0) process.exit(1);
}
// the vite CLI itself (not through npx, whose child would outlive a kill and keep the pipes open)
const VITE = join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const preview = spawn(process.execPath, [VITE, 'preview', '--outDir', 'dist-e2e', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });
let failed = false;
const stop = () => {
  try {
    preview.kill('SIGTERM');
  } catch {
    /* gone */
  }
};
process.on('exit', stop);
(async () => {
  // wait for the preview server
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) break;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  const all = [
    ['routes', 'scripts/e2e-routes.cjs'],
    ['bench', 'scripts/e2e-bench.cjs'],
    ['a11y', 'scripts/e2e-a11y.cjs'],
    ['lessons', 'scripts/e2e-lessons.cjs'],
  ];
  for (const [name, file] of all) {
    if (suites.length && !suites.includes(name)) continue;
    console.log(`\n=== e2e: ${name} ===`);
    const t = Date.now();
    const st = run('node', [file, BASE, ...(name === 'lessons' && args.includes('--all-lessons') ? ['--all'] : [])]);
    console.log(`=== ${name}: ${st === 0 ? 'passed' : 'FAILED'} (${((Date.now() - t) / 1000).toFixed(1)} s) ===`);
    if (st !== 0) failed = true;
  }
  stop();
  process.exit(failed ? 1 : 0);
})();
