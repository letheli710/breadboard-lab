// Browser test hooks (scripts/e2e-bench.cjs). Active only when BOTH hold:
//   - the build was made with VITE_E2E=1 (`npm run e2e` builds into dist-e2e/); in every other
//     build `__E2E__` is the literal `false`, so the hooks and their modules are dropped entirely;
//   - the page URL carries `?e2e` (before the hash).
// They expose read-only helpers on `window.__bb` (hole → screen position, frame counter) and an
// injected render error (`?e2e&crash=canvas`) for the ErrorBoundary check.
export const E2E: boolean = __E2E__ && typeof location !== 'undefined' && /[?&]e2e(&|=|$)/.test(location.search);

export const e2eParam = (k: string): string | null => (E2E ? new URLSearchParams(location.search).get(k) : null);
