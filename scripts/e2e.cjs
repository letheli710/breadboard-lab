/* global require, process, console, fetch, setTimeout, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports */
// `npm run e2e`: production build with the test hooks (VITE_E2E=1 → dist-e2e/), `vite preview` of
// it, then the browser suites against it: scripts/e2e-routes.cjs and scripts/e2e-bench.cjs. Exit code 1 if any fails; screenshots of failures in e2e-artifacts/.
//   npm run e2e                 build + all suites
//   npm run e2e -- --no-build   reuse dist-e2e/
//   npm run e2e -- bench        only these suites (routes, bench)
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
const preview = spawn('npx', ['vite', 'preview', '--outDir', 'dist-e2e', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] });
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
  ];
  for (const [name, file] of all) {
    if (suites.length && !suites.includes(name)) continue;
    console.log(`\n=== e2e: ${name} ===`);
    const t = Date.now();
    const st = run('node', [file, BASE]);
    console.log(`=== ${name}: ${st === 0 ? 'passed' : 'FAILED'} (${((Date.now() - t) / 1000).toFixed(1)} s) ===`);
    if (st !== 0) failed = true;
  }
  stop();
  process.exit(failed ? 1 : 0);
})();
