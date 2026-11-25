// Stage lessons (#/lesson/<id>): the lesson format of the curriculum blueprint v2
// (docs/BLUEPRINT_V2.md). A lesson is a left *stage* with a few layers ("lenses": a 3D view, an
// interactive 2D diagram …) and a column of *acts* on the right. Scrolling the acts drives the
// stage (layer, highlights, X-ray opacity); the lens bar lets the student pick a layer by hand
// to review. Field names follow the blueprint's Schema v2 so a lesson sheet maps onto this file
// one to one.
//
// Inline text markup (StageText.tsx): **bold**, `code`, $TeX$ (KaTeX), and [[hoverId|text]] —
// a term linked to an object on the stage (hovering either one highlights both).

export type LessonType = 'A' | 'B' | 'C' | 'D';

export type RenderMode = '3D_THREEJS_BREADBOARD' | '2D_INTERACTIVE_SVG';

/** Layers the stage knows how to draw (a new lesson either reuses one or adds a renderer). */
export type StageLayerId = 'bb_xray' | 'dmm_probe';

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
  | { kind: 'colorcode'; title: string; intro?: string };

export interface QuizOption {
  key: string;
  text: string;
  correct: boolean;
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
}

export interface StageLesson {
  format: 'lesson-stage/2';
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
