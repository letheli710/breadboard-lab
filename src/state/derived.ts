import { useMemo } from 'react';
import { boardDiagnostics, type Issue } from '../core/diagnostics';
import { buildNetlist, type BoardNetlist } from '../core/netlist';
import { simulate, type SimResult } from '../core/solver';
import type { Layout } from '../core/types';
import { useStore } from './store';

export interface Derived {
  nl: BoardNetlist;
  sim: SimResult;
  issues: Issue[];
}

let cacheKey: Layout | null = null;
let cacheVal: Derived | null = null;

export function derive(layout: Layout): Derived {
  if (cacheKey === layout && cacheVal) return cacheVal;
  const nl = buildNetlist(layout);
  const sim = simulate(nl.circuit);
  const issues = boardDiagnostics(nl, sim);
  cacheKey = layout;
  cacheVal = { nl, sim, issues };
  return cacheVal;
}

export function useDerived(): Derived {
  const layout = useStore((s) => s.layout);
  return useMemo(() => derive(layout), [layout]);
}

export function useActiveChallenge() {
  const id = useStore((s) => s.activeId);
  const list = useStore((s) => s.challenges);
  const mode = useStore((s) => s.mode);
  if (mode !== 'learn' && mode !== 'challenge') return null;
  return list.find((c) => c.id === id) ?? null;
}
