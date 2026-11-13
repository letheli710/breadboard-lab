// The built-in problem index is a lazy chunk: the store's list stays empty (and the saved current
// problem untouched) until it arrives, then the list is built at once with the status "ready".
import { describe, expect, it } from 'vitest';
import { ensureProblemIndex, refreshProblems } from './problems';
import { useStore } from './store';

const s = () => useStore.getState();
const LAST = 'nonlinear-14-two-nonlinear-small-signal';

describe('problem index loaded on demand', () => {
  it('keeps the saved current problem across the async load', async () => {
    useStore.setState({ problemId: LAST });
    expect(s().problemIndex).toBe('idle');
    expect(s().problems).toEqual([]);
    // before the index: a rebuild (language switch) and opening the page change nothing
    refreshProblems();
    s().setMode('practice');
    expect(s().problems).toEqual([]);
    expect(s().problemId).toBe(LAST);

    const seen: string[] = [];
    const unsub = useStore.subscribe((st, prev) => {
      if (st.problemIndex !== prev.problemIndex) seen.push(`${st.problemIndex}:${st.problems.length > 0}`);
    });
    const p = ensureProblemIndex();
    expect(s().problemIndex).toBe('loading');
    await p;
    unsub();
    // "ready" is only reported with the list already in place (the router relies on it)
    expect(seen).toEqual(['loading:false', 'ready:true']);
    expect(s().problems.length).toBeGreaterThan(200);
    expect(s().problemId).toBe(LAST);
    // a second request is free
    await ensureProblemIndex();
    expect(s().problemIndex).toBe('ready');
  });

  it('falls back to the first unfinished problem when the saved one no longer exists', () => {
    useStore.setState({ problemId: 'no-such-problem' });
    refreshProblems();
    expect(s().problemId).toBe(s().problems.find((p) => !s().practiceDone[p.id])?.id);
  });
});
