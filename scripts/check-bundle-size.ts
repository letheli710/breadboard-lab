// Production-build size guard (CI runs it after `vite build`):
//   npx vite build && npm run size
// Reads dist/index.html, so it measures exactly what every page loads before any lazy chunk:
// the entry script and the chunks Vite modulepreloads with it (React, the bundler runtime, …).
// Budgets are raw (uncompressed) bytes with some headroom over the current build; when one is
// exceeded, check first that nothing heavy slipped onto the critical path (three.js, the
// workbench, problem / challenge data) before raising it.
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// The entry grows by design with the content: the build-time problem / challenge indexes
// (virtual:problem-index, virtual:challenge-index) live in it at ≈ 265 B per problem and ≈ 275 B
// per challenge (262 problems + 68 challenges ≈ 88 kB in Nov 2026). The budgets leave room for
// roughly 90 more problems; a jump of tens of kB from one commit is the thing to investigate.
const ENTRY_BUDGET = 225_000; // entry chunk (≈ 200 kB in Nov 2026, was 185 kB before three new chapters)
const CRITICAL_BUDGET = 375_000; // entry + modulepreloaded chunks (≈ 348 kB in Nov 2026)

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
