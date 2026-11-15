// The course map (docs/REBUILD_PLAN.md): five Worlds, each a run of short units, each unit a few
// bench items (lessons, challenges, labs) in the order to do them, plus the theory chapters that
// go with it. The Learn page follows this order; the files keep their ids, so saved progress,
// layouts and links stay valid when a unit moves. Chapter numbers refer to Alexander & Sadiku,
// "Fundamentals of Electric Circuits" (S), Boylestad, "Introductory Circuit Analysis" (B), Platt,
// "Make: Electronics" 2nd ed. (M, experiments) and Scherz & Monk, "Practical Electronics for
// Inventors" 4th ed. (P). Only structure lives here (the store needs it at startup); the
// bilingual titles are in courseText.ts, imported by the lazily loaded pages.

export interface CourseUnit {
  /** "1.7" — shown on the cards */
  num: string;
  /** challenge / lesson ids, in order (titles: courseText.ts) */
  items: string[];
  /** theory chapters (problem chapter ids) that go with this unit */
  practice?: string[];
}

export interface World {
  id: 1 | 2 | 3 | 4 | 5;
  /** where the material comes from, e.g. "S 1–2 · B 1–7 · M 1–6" */
  books: string;
  units: CourseUnit[];
}

export const WORLDS: World[] = [
  {
    id: 1,
    books: 'S 1–2 · B 1–7 · M 1–6',
    units: [
      { num: '1.1', items: ['lesson-breadboard-basics'] },
      { num: '1.2', items: ['lesson-power-and-ground'] },
      { num: '1.3', items: ['lesson-light-an-led'] },
      { num: '1.4', items: ['lesson-multimeter', 'challenge-voltage-divider'] },
      { num: '1.5', items: ['lesson-ammeter'] },
      { num: '1.6', items: ['lesson-schematic-to-breadboard'], practice: ['basics'] },
      {
        num: '1.7',
        items: ['lesson-series', 'challenge-two-leds-series', 'exp-kvl-loops'],
        practice: ['basics', 'equivalence'],
      },
      { num: '1.8', items: ['lesson-parallel', 'exp-kcl-ammeters'], practice: ['basics', 'equivalence'] },
      {
        num: '1.9',
        items: ['lesson-pushbutton', 'challenge-pot-dimmer', 'challenge-spdt-selector', 'challenge-button-parallel'],
      },
      {
        num: '1.10',
        items: ['lesson-power-supplies', 'challenge-coin-cell', 'challenge-module-blue-led', 'lesson-bench-supply', 'challenge-bench-supply'],
      },
      {
        num: '1.11',
        items: ['challenge-fix-the-circuit', 'challenge-series-parallel', 'exp-measure-req', 'exp-wheatstone-bridge'],
        practice: ['equivalence'],
      },
    ],
  },
  {
    id: 2,
    books: 'S 3–5 · B 8–9 · P 2, 8',
    units: [
      { num: '2.1', items: ['exp-cc-current-source', 'exp-current-divider'] },
      { num: '2.2', items: ['exp-nodal-analysis'], practice: ['methods'] },
      {
        num: '2.3',
        items: ['exp-superposition', 'exp-source-transformation'],
        practice: ['theorems'],
      },
      { num: '2.4', items: ['exp-thevenin-measure', 'exp-max-power'], practice: ['theorems'] },
      {
        num: '2.5',
        items: ['exp-loaded-divider', 'lesson-lm358', 'exp-voltage-follower'],
        practice: ['opamp'],
      },
      { num: '2.6', items: ['exp-noninverting-amp'], practice: ['opamp', 'dependent-sources'] },
    ],
  },
  {
    id: 3,
    books: 'S 6–8 · B 10–11, 25 · M 9',
    units: [
      { num: '3.1', items: ['lesson-generator-scope', 'lesson-scope-two-channels'] },
      { num: '3.2', items: ['exp-inverting-amp', 'exp-summing-amp'], practice: ['opamp'] },
      { num: '3.3', items: ['exp3-led-breathing'], practice: ['storage'] },
      { num: '3.4', items: ['exp3-rc-square-charging', 'exp3-rc-thevenin-tau'], practice: ['first-order'] },
      {
        num: '3.5',
        items: ['exp3-rc-differentiator-integrator', 'exp3-opamp-integrator'],
        practice: ['first-order'],
      },
      { num: '3.6', items: ['exp3-rl-square'], practice: ['first-order'] },
      { num: '3.7', items: ['exp3-rlc-ringing'], practice: ['second-order'] },
    ],
  },
  {
    id: 4,
    books: 'S 9–17, 19 · B 13–24, 26',
    units: [
      {
        num: '4.1',
        items: ['exp4-rl-phasors'],
        practice: ['phasors', 'ac-analysis'],
      },
      {
        num: '4.2',
        items: ['exp4-rc-lowpass-bode', 'exp4-rc-highpass-coupling', 'exp4-series-resonance', 'exp4-parallel-lc-tank'],
        practice: ['frequency'],
      },
      {
        num: '4.3',
        items: ['exp4-active-lowpass', 'exp4-rc-bandpass-loading', 'exp4-buffered-bandpass'],
        practice: ['frequency'],
      },
      {
        num: '4.4',
        items: ['exp4-pf-correction'],
        practice: ['ac-power', 'three-phase', 'coupled'],
      },
      { num: '4.5', items: ['exp4-half-wave-rectifier'], practice: ['non-sinusoidal', 's-domain', 'two-port'] },
    ],
  },
  {
    id: 5,
    books: 'P 3–6, 12 · M 7, 10–11',
    units: [
      { num: '5.1', items: ['challenge-reverse-protection'], practice: ['nonlinear'] },
      {
        num: '5.2',
        items: ['lesson-mcu-gpio', 'exp5-gpio-led-resistor', 'exp5-sink-vs-source', 'exp5-button-pull-resistors'],
      },
      { num: '5.3', items: ['exp5-npn-buzzer-switch', 'exp5-high-side-vs-low-side'] },
      { num: '5.4', items: ['exp5-mosfet-logic-level', 'exp5-relay-flyback'] },
      { num: '5.5', items: ['exp5-ldo-dropout', 'exp5-board-power-budget'] },
      { num: '5.6', items: ['exp5-5v-signal-level-shift', 'exp5-open-drain-level-shifter'] },
      {
        num: '5.7',
        items: ['lesson-mcu-pwm-adc', 'exp5-adc-battery-divider', 'exp5-ldr-light-sensor', 'exp5-ntc-thermometer'],
      },
      { num: '5.8', items: ['exp5-pwm-rc-dac', 'exp5-pwm-mosfet-motor', 'exp5-i2c-pullup-rise-time'] },
      { num: '5.9', items: ['exp5-capstone-ntc-fan'] },
    ],
  },
];

/** Theory chapters kept out of the main path (shown as electives in Practice). */
export const ARCHIVED_CHAPTERS = ['matrix-form', 'transmission-line'];

export interface CoursePlace {
  world: World;
  unit: CourseUnit;
  /** position inside the unit (0-based) */
  pos: number;
  /** index in the whole course */
  index: number;
}

/** Every bench item in course order. */
export const COURSE_ORDER: string[] = WORLDS.flatMap((w) => w.units.flatMap((u) => u.items));

const PLACES = new Map<string, CoursePlace>();
WORLDS.forEach((world) =>
  world.units.forEach((unit) =>
    unit.items.forEach((id, pos) => {
      PLACES.set(id, { world, unit, pos, index: PLACES.size });
    }),
  ),
);

/** Where a bench item sits in the course (undefined: not in the map, e.g. an imported file). */
export const placeOf = (id: string): CoursePlace | undefined => PLACES.get(id);

/** "1.7" for a one-item unit, "1.7b" for the second item of a longer one. */
export function itemLabel(p: CoursePlace): string {
  return p.unit.items.length > 1 ? `${p.unit.num}${'abcdefghij'[p.pos]}` : p.unit.num;
}

/** The theory chapters of a World, in course order, without repeats. */
export function worldChapters(w: World): string[] {
  return [...new Set(w.units.flatMap((u) => u.practice ?? []))];
}

/** Items sorted in course order; items outside the map keep their order after them. */
export function inCourseOrder<T extends { id: string }>(items: T[]): T[] {
  const known = items.filter((c) => PLACES.has(c.id)).sort((a, b) => PLACES.get(a.id)!.index - PLACES.get(b.id)!.index);
  return [...known, ...items.filter((c) => !PLACES.has(c.id))];
}
