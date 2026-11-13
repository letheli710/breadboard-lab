// Chapter summaries ("要点 / Key points" pages of Practice): which one is open, and loading them.
//
// The index of chapters that have a summary (virtual:summary-index) is tiny; each summary file
// is its own lazily loaded chunk, parsed (without re-running the engine — `npm run validate`
// and the tests do that) together with the summary parser on first open.

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { entries as summaryIndex, groups as summaryChunks } from 'virtual:summary-index';
import { getLang, tr } from '../core/i18n';
import type { ChapterSummary } from '../core/summary/parse';
import { useStore } from './store';

export interface SummaryTarget {
  chapter: string;
  /** key idea to scroll to (section id "idea-<id>"), or a whole section: "formulas" | "examples" | "mistakes" */
  section?: string;
  /** resolve the section from this problem (the key idea that links it) once loaded */
  problem?: string;
}

interface SummaryView {
  /** the open summary page, or null when a problem is shown */
  open: SummaryTarget | null;
  /** problem the student came from (a "back to the problem" link) */
  from: string | null;
  openSummary(t: SummaryTarget, from?: string | null): void;
  closeSummary(): void;
}

export const useSummaryView = create<SummaryView>((set) => ({
  open: null,
  from: null,
  openSummary(t, from = null) {
    set({ open: t, from });
  },
  closeSummary() {
    set({ open: null, from: null });
  },
}));

/** Does this chapter have a key-points page? */
export const hasSummary = (chapter: string) => summaryIndex.some((e) => e.chapter === chapter);

type SummaryModule = typeof import('../core/summary/parse');
let mod: SummaryModule | null = null;
const raw = new Map<string, unknown>();
const loads = new Map<string, Promise<void>>();
const failed = new Map<string, string>();
const parsed = new Map<string, { summary?: ChapterSummary; errors: string[] }>();

function load(chapter: string): Promise<void> {
  let p = loads.get(chapter);
  if (!p) {
    const chunk = summaryChunks[chapter];
    p = Promise.all([import('../core/summary/parse'), chunk ? chunk() : Promise.resolve({ default: {} })]).then(([m, c]) => {
      mod = m;
      for (const json of Object.values(c.default)) raw.set(chapter, json);
    });
    failed.delete(chapter);
    p.catch((err) => {
      loads.delete(chapter);
      failed.set(chapter, (err as Error)?.message ?? String(err));
    });
    loads.set(chapter, p);
  }
  return p;
}

function get(chapter: string): { summary?: ChapterSummary; errors: string[] } | null {
  const f = failed.get(chapter);
  if (f) return { errors: [tr(`要点页加载失败：${f}`, `Couldn't load the key points: ${f}`)] };
  const json = raw.get(chapter);
  if (!mod || json === undefined) return null;
  const k = `${getLang()}|${chapter}`;
  let r = parsed.get(k);
  if (!r) {
    try {
      const v = mod.parseSummary(json, undefined, { verify: false });
      r = { summary: v.summary, errors: v.errors };
    } catch (e) {
      r = { errors: [(e as Error).message] };
    }
    parsed.set(k, r);
  }
  return r;
}

/** The chapter's summary in the current language (loading it if needed). */
export function useSummary(chapter: string | null): { summary?: ChapterSummary; errors: string[] } | null {
  useStore((s) => s.lang);
  const [, bump] = useState(0);
  const r = chapter ? get(chapter) : null;
  useEffect(() => {
    if (!chapter || r) return;
    let live = true;
    const again = () => live && bump((n) => n + 1);
    load(chapter).then(again, again);
    return () => {
      live = false;
    };
  }, [chapter, r]);
  return r;
}
