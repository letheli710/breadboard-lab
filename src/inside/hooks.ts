import { useEffect, useState } from 'react';
import { useLang } from '../state/store';
import { loadCalcModule, tdById } from './registry';
import type { CalcCard, CalcGroup, Teardown, TeardownBuild } from './types';

/** a teardown, built in the current language (null while its chunk loads) */
export function useTeardown(id: string | null): Teardown | null {
  useLang();
  const [build, setBuild] = useState<{ id: string; b: TeardownBuild } | null>(null);
  useEffect(() => {
    if (!id) return;
    let live = true;
    tdById(id)
      ?.load()
      .then((m) => live && setBuild({ id, b: m.default }));
    return () => {
      live = false;
    };
  }, [id]);
  return build && build.id === id ? build.b() : null;
}

/** all calculation cards and their groups, in the current language (null while loading) */
export function useCalcs(): { cards: CalcCard[]; groups: CalcGroup[] } | null {
  useLang();
  const [mod, setMod] = useState<Awaited<ReturnType<typeof loadCalcModule>> | null>(null);
  useEffect(() => {
    let live = true;
    loadCalcModule().then((m) => live && setMod(m));
    return () => {
      live = false;
    };
  }, []);
  return mod ? { cards: mod.allCalcs(), groups: mod.calcGroups() } : null;
}
