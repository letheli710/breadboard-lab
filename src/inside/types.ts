// "Inside" (拆解): every new thing a student meets — the breadboard, a battery, an LED, the LM358,
// a multimeter … — gets a teardown: a big diagram of just that object that is taken apart layer by
// layer (outside → x-ray → internal structure → circuit model → how to calculate with it), with the
// text on one side and the picture on the other. Words in the text that name a part of the picture
// are linked to it: hovering / focusing the word highlights the part and its leader line, and
// hovering the part highlights the word.
//
// Content is TS (not JSON) because each figure is an SVG drawn in code. All text goes through tr(),
// so a teardown is built by a function that is called on every render (language switch = rebuild).

import type { ReactNode } from 'react';

/** A labelled leader line: from the label at (lx, ly) to the anchor point (x, y) on `part`. */
export interface Callout {
  /** the data-part name it points at (also what hovering it highlights) */
  part: string;
  label: string;
  x: number;
  y: number;
  lx: number;
  ly: number;
  /** text anchor of the label (default: away from the anchor point) */
  anchor?: 'start' | 'middle' | 'end';
}

export interface TdTable {
  head: string[];
  rows: string[][];
  /** per row: the part the row describes (hovering the row highlights it) */
  parts?: (string | null)[];
}

export interface TdFormula {
  /** MathText markup: \frac{a}{b}, \sqrt{x}, x^{2}, X_sub */
  tex: string;
  /** what it means / when it holds */
  note?: string;
}

export interface Layer {
  id: string;
  /** short name for the layer stepper ("外形", "X 光", …) */
  short: string;
  title: string;
  /**
   * Markdown subset (see InsideMd): paragraphs, "- " lists, **bold**, `code`, "| tables |", plus
   *   [[part|words]]  — words linked to a part of the figure
   *   $…$             — an inline formula in MathText markup
   */
  body: string;
  table?: TdTable;
  formulas?: TdFormula[];
  /** leader lines shown while this layer is active */
  callouts?: Callout[];
  /** calculation cards (calc ids) this layer leads to */
  calcs?: string[];
}

export interface Teardown {
  id: string;
  title: string;
  subtitle: string;
  /** the svg viewBox of the figure */
  viewBox: string;
  /** svg content; `layer` = index of the active layer. Parts carry data-part="name [name…]". */
  Figure: (p: { layer: number }) => ReactNode;
  layers: Layer[];
  /** shown at the end: the one-paragraph "now you know" summary */
  recap?: string;
}

/** a teardown module: default export builds the teardown in the current language */
export type TeardownBuild = () => Teardown;

/* ------------------------------------------------------------------ calculations */

export interface CalcVar {
  sym: string;
  name: string;
  unit: string;
  /** default value (SI) */
  def: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface CalcCard {
  id: string;
  group: string;
  title: string;
  /** the formula, MathText markup */
  tex: string;
  /** one sentence: what it is for */
  use: string;
  vars: CalcVar[];
  /** the result */
  out: { sym: string; name: string; unit: string };
  compute: (v: Record<string, number>) => number;
  /** derivation / explanation, step by step (InsideMd) */
  why: string;
  /** a worked example in words, with numbers (InsideMd) */
  example?: string;
  /** common mistakes (InsideMd list items) */
  pitfalls?: string[];
  /** a small svg (viewBox 0 0 260 150) of the circuit the formula is about */
  Figure?: () => ReactNode;
  /** teardown ids, lesson / challenge ids and practice chapters to go on to */
  teardowns?: string[];
  lessons?: string[];
  chapter?: string;
}

export type CalcGroupBuild = () => CalcCard[];

export interface CalcGroup {
  id: string;
  title: string;
  /** one sentence: what this group of formulas is about */
  intro: string;
}
