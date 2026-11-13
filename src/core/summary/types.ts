// Chapter summary format "chapter-summary/1": the "要点 / Key points" page of a Practice chapter.
// One JSON file per chapter in summaries/<chapter>.json. See docs/SUMMARY_FORMAT.md and
// schema/summary.schema.json; parse.ts is the validator (worked examples are verified by the
// same engine path as problems, see parseSummary).

import type { Lang } from '../i18n';
import type { Analysis, Question, Schematic } from '../problem/types';

export const SUMMARY_FORMAT_ID = 'chapter-summary/1';

/** Text: a string or an array of lines (same markdown subset as problem text). */
export type Text = string | string[];

export interface IdeaFile {
  /** unique within the file: letters, digits, - and _ */
  id: string;
  title: string;
  text: Text;
  /** ids of the chapter's problems that practise this idea */
  problems: string[];
  i18n?: Partial<Record<Lang, { title?: string; text?: Text }>>;
}

export interface FormulaFile {
  id: string;
  /** the key idea this formula belongs to */
  idea: string;
  name: string;
  /** the formula itself (rich text: X_sub, ^{sup}, \frac{a}{b}, \sqrt{x}) */
  expr: string;
  /** conditions under which it holds, reference-direction conventions */
  when: string;
  note?: string;
  i18n?: Partial<Record<Lang, { name?: string; expr?: string; when?: string; note?: string }>>;
}

/** A result of a worked example: a problem question that must have `find` + `answer`. */
export type ResultFile = Pick<Question, 'id' | 'ask' | 'find' | 'answer' | 'unit'>;

export interface ExampleFile {
  id: string;
  /** key ideas this example illustrates */
  ideas: string[];
  title: string;
  statement: Text;
  schematic: Schematic;
  analysis: Analysis;
  /** every number the steps arrive at, verified by the engine like problem answers */
  results: ResultFile[];
  /** step-by-step reasoning (markdown subset; "1. " lists work) */
  steps: Text;
  i18n?: Partial<Record<Lang, { title?: string; statement?: Text; results?: { ask?: string }[]; steps?: Text; notes?: string[] }>>;
}

export interface MistakeFile {
  id: string;
  idea?: string;
  text: Text;
  i18n?: Partial<Record<Lang, { text?: Text }>>;
}

export interface SummaryFile {
  format: typeof SUMMARY_FORMAT_ID;
  chapter: string;
  lang?: Lang;
  intro?: Text;
  ideas: IdeaFile[];
  formulas: FormulaFile[];
  examples: ExampleFile[];
  mistakes: MistakeFile[];
  i18n?: Partial<Record<Lang, { intro?: Text }>>;
}
