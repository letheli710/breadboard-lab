// Production-build size guard (CI runs it after `vite build`):
//   npx vite build && npm run size
// Reads dist/index.html, so it measures exactly what every page loads before any lazy chunk:
// the entry script and the chunks Vite modulepreloads with it (React, the bundler runtime, …).
// Budgets are raw (uncompressed) bytes with some headroom over the current build; when one is
// exceeded, check first that nothing heavy slipped onto the critical path (three.js, the
// workbench, problem / challenge data) before raising it.
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// The problem / challenge indexes are lazy chunks of their own (virtual:problem-index /
// virtual:challenge-index `loadIndex()`, ≈ 76 kB + 21 kB in Nov 2026), so the entry no longer grows
// with the content. Budgets: the Nov 2026 build + ≈ 15 %; a jump from one commit means something
// heavy slipped onto the critical path.
const ENTRY_BUDGET = 128_000; // entry chunk (111.0 kB in Nov 2026; 199.6 kB while the indexes lived in it)
const CRITICAL_BUDGET = 300_000; // entry + modulepreloaded chunks (259.4 kB in Nov 2026; was 348.0 kB)

const dist = join(process.cwd(), 'dist');
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const entry = /<script type="module"[^>]*\ssrc="\/?([^"]+\.js)"/.exec(html)?.[1];
const preloads = [...html.matchAll(/<link rel="modulepreload"[^>]*\shref="\/?([^"]+\.js)"/g)].map((m) => m[1]);
if (!entry) {
  console.error('check-bundle-size: no entry <script type="module"> in dist/index.html — run `npx vite build` first');
  process.exit(1);
}
const size = (f: string) => statSync(join(dist, f)).size;
const kB = (n: number) => `${(n / 1000).toFixed(1)} kB`;
const entrySize = size(entry);
const critical = entrySize + preloads.reduce((a, f) => a + size(f), 0);
let ok = true;
const report = (label: string, n: number, budget: number) => {
  const pass = n <= budget;
  ok &&= pass;
  console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}: ${kB(n)} (budget ${kB(budget)})`);
};
report(`entry ${entry}`, entrySize, ENTRY_BUDGET);
report(`entry + ${preloads.length} preloaded chunks (${preloads.join(', ')})`, critical, CRITICAL_BUDGET);
if (!ok) process.exit(1);
