// Stage lessons (#/lesson/<id>): the lesson format of the curriculum blueprint v2
// (docs/BLUEPRINT_V2.md). A lesson is a left *stage* with a few layers ("lenses": a 3D view, an
// interactive 2D diagram …) and a column of *acts* on the right. Scrolling the acts drives the
// stage (layer, highlights, X-ray opacity); the lens bar lets the student pick a layer by hand
// to review. Field names follow the blueprint's Schema v2 so a lesson sheet maps onto this file
// one to one.
//
// Inline text markup (StageText.tsx): **bold**, `code`, $TeX$ (KaTeX), and [[hoverId|text]] —
// a term linked to an object on the stage (hovering either one highlights both).
//
// A lesson lives in its own folder, src/stage/lessons/<slug>/: index.ts (default export: the
// StageLesson, with `renderers` for its layers) and any layer components it needs. Layers talk to
// the page through the stage store (stageStore.ts): `lit` ids (useLit), and free-form `params`
// that acts set on scroll (StageSync.params) and layer controls change (useStageParam).

import type { ComponentType } from 'react';

export type LessonType = 'A' | 'B' | 'C' | 'D';

export type RenderMode = '3D_THREEJS_BREADBOARD' | '2D_INTERACTIVE_SVG' | string;

/** A layer id, unique within its lesson; `StageLesson.renderers[id]` draws it. */
export type StageLayerId = string;

export interface StageLayer {
  id: StageLayerId;
  /** "01 3D 面包板导通透视" */
  label: string;
  render_mode: RenderMode;
  /** what the layer shows, one sentence (shown under the lens bar) */
  caption: string;
}

export interface HoverTarget {
  /** short name in the tooltip / chip */
  label: string;
  /** one line on what it is */
  desc: string;
}

export type DmmMode = 'voltage' | 'current' | 'wrong';

/** What an act sets on the stage when it scrolls into view. */
export interface StageSync {
  layer: StageLayerId;
  /** hover-map ids lit while the act is on screen */
  halo?: string[];
  /** X-ray slider value 0 … 1 (bb_xray) */
  xray?: number;
  /** camera preset (bb_xray) */
  camera?: 'overview' | 'focus' | 'resistor' | 'trench';
  /** multimeter set-up (dmm_probe) */
  dmm?: DmmMode;
  /** lesson-specific stage settings (merged into the store's params; read with useStageParam) */
  params?: Record<string, unknown>;
}

/** One block of an act's text. Strings use the inline markup above. */
export type ActBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ol'; items: string[] }
  | { kind: 'ul'; items: string[] }
  /** ① origin: the earlier law the formula comes from */
  | { kind: 'origin'; title: string; text: string }
  /** ② the general formula in symbols (blue card) */
  | { kind: 'formula'; title: string; tex: string }
  /** ③ numbers in, step by step (green card); each step: a lead-in and optional display TeX */
  | { kind: 'calc'; title: string; steps: { label: string; text?: string; tex?: string }[] }
  | { kind: 'note'; tone: 'warn' | 'tip'; text: string }
  /** the colour-code card: the full table and a 4-band reader (drives the resistor on the stage) */
  | { kind: 'colorcode'; title: string; intro?: string }
  /** an extra diagram inside an act (inline SVG source) */
  | { kind: 'figure'; svg: string; caption?: string }
  /** a table; cells use the inline markup */
  | { kind: 'table'; head: string[]; rows: string[][]; caption?: string }
  /** a Socratic guided example (GuidedExample.tsx) */
  | GuidedBlock;

/** One step of a guided example: a question with options; the right answer writes `board` on the
 *  blackboard and the next step opens. A wrong option shows its intercept; the hint is on demand. */
export interface GuidedStep {
  /** step title, e.g. "Step 1 · 找参考方向" */
  title: string;
  /** small diagram for this step (inline SVG source) */
  mini_svg?: string;
  question: string;
  hint: string;
  options: { text: string; correct: boolean; /** praise (right) or the professor's intercept (wrong) */ feedback: string }[];
  /** TeX line(s) written on the board once the step is answered */
  board: string[];
  /** stage ids lit while this step is open */
  halo?: string[];
  /** stage params set while this step is open */
  params?: Record<string, unknown>;
}

export interface GuidedBlock {
  kind: 'guided';
  title: string;
  /** "Sadiku Example 1.3" */
  source?: string;
  /** the problem statement */
  problem: string;
  /** diagram of the whole problem (inline SVG source) */
  problem_svg?: string;
  steps: GuidedStep[];
  /** shown under the finished board */
  conclusion?: string;
}

export interface QuizOption {
  key: string;
  text: string;
  correct: boolean;
  /** feedback for this option; when absent the item's feedback_correct / feedback_wrong is shown */
  feedback?: string;
}

export interface QuizItem {
  id: string;
  question: string;
  options: QuizOption[];
  feedback_correct: string;
  feedback_wrong: string;
  /** small diagram for the question (inline SVG source) */
  figure?: string;
  /** stage set-up while the question is answered */
  sync?: Partial<StageSync>;
}

export interface Act {
  act_index: number;
  /** "第 1 幕" */
  badge: string;
  title: string;
  sync: StageSync;
  /** the professor's text and formula cards */
  blocks: ActBlock[];
  /** the act's local diagram (inline SVG source, reproduced as given in the lesson sheet) */
  inline_svg?: string;
  /** aria label / caption of the diagram */
  figure_caption?: string;
  /** a quiz closes the act (the last act of a lesson) */
  quiz?: QuizItem[];
  /** blocks shown after the quiz (e.g. the next-lesson preview) */
  after_quiz?: ActBlock[];
}

export interface StageLesson {
  format: 'lesson-stage/2';
  /** layer id → component drawing it (usually React.lazy, so a layer loads when it is first shown) */
  renderers: Record<StageLayerId, ComponentType>;
  /** label and description for stage ids that are not in the hover map (e.g. generated ones) */
  describeTarget?: (id: string) => HoverTarget | null;
  lesson_meta: {
    lesson_id: string;
    world: string;
    title: string;
    subtitle: string;
    lesson_type: LessonType;
    lesson_type_label: string;
    estimated_minutes: number;
    textbook_primary: { book: string; sections: string[] };
    textbook_supplement?: string;
    prerequisites: string[];
    /** headline when the closing quiz is all right (default "随堂自测通过！") */
    pass_message?: string;
    /** lesson id of the next stage lesson; shown as "coming" while it doesn't exist */
    next_lesson?: string;
    next_lesson_title?: string;
  };
  left_stage_spec: {
    use_3d: boolean;
    layers: StageLayer[];
    hover_map: Record<string, HoverTarget>;
  };
  right_acts: Act[];
}
