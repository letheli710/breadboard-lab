# Accessibility · 无障碍

Target: WCAG 2.1 AA. Checked by `scripts/e2e-a11y.cjs` (axe-core, rules `wcag2a wcag2aa wcag21a wcag21aa best-practice`, Chinese and English, light theme, 1440 × 900), part of `npm run e2e` and the CI `e2e` job. It **fails on any serious or critical violation** that is not listed in `scripts/a11y-baseline.json` (empty: there are none); moderate / minor ones are printed.

## axe violations, before → after (Nov 2026; violating nodes, zh / en)

| Page / state | Before | After |
|---|---|---|
| Learn (lesson 1) | color-contrast 6/6, page-has-heading-one 1/1, scrollable-region-focusable 1/1 | none |
| Challenge lab (`exp-inverting-amp`) | color-contrast 13/12, page-has-heading-one 1/1, scrollable-region-focusable 1/1 | none |
| … after Check (measurement stage) | color-contrast 9/8, page-has-heading-one, scrollable-region-focusable | none |
| Sandbox | color-contrast 5/5, page-has-heading-one | none |
| Sandbox with parts, inspector, confirm popover | color-contrast 17/17, page-has-heading-one | none |
| Practice problem (numeric / choice) | color-contrast 47/47, page-has-heading-one | none |
| Practice after a wrong answer + shown answer | — (new state) | none |
| Chapter key points | color-contrast 59/59, landmark-unique, page-has-heading-one | none |
| Guide | color-contrast 14/14, heading-order, landmark-one-main, region 13/13 | none |
| Import | color-contrast 656/656, region 1449/1449, landmark-one-main, empty-table-header, scrollable-region-focusable 2/2 | none |
| Lesson completed (dialog + confetti) | — (new state) | none |
| Mistake notebook, today's review, how it works (`#/practice/review[/due\|/how]`) | (added later) | none |
| Quiz: setup, running (timer), paused, results (`#/practice/quiz`) | (added later) | none |
| Instrument lesson with per-step checks (`lesson-ammeter`) | (added later) | 2 contrast (prerequisite links) → none |
| Phone (390 px, touch): problem drawer, full-screen figure viewer, symbol keys, bench touch chip | (added later) | 3 label-title-only (viewer), 1 scrollable-region-focusable (symbol keys), heading-order → none |

Total: 4704 violating nodes → 0.

## What was changed

- **Structure**: one `<main id="main">` and one `h1` per page (the bench pages have a visually hidden one naming the lesson); Guide cards and key-point sections are `h2`; a "Skip to content" link; after a change of page / item focus moves to the new page's `h1` (not when it came from the lesson carousel or its group tabs).
- **Controls**: toolbar toggles report `aria-pressed`, icon-only buttons are named; side panel tabs and the carousel group tabs follow the ARIA tabs pattern (←/→/Home/End); lesson cards say done / level as text; inspector labels are tied to their slider / field / chip group, chips report `aria-pressed`; practice answer fields are labelled by their question and described by their unit; choice questions are radio groups (arrows move, Space / Enter answers — moving never submits); the practice sidebar is a list of disclosure buttons (`aria-expanded`, `aria-current` on the open item, status and level as text); the header progress bars are `progressbar`s.
- **Newer pages**: the quiz timer is not a live region; screen readers hear only the 5 min / 1 min / 10 s marks and pause / resume. Pause, the question list and Submit are buttons in the tab order. The full-screen figure viewer is a modal dialog: the page behind it is `inert`, Tab cycles through its buttons, Esc closes it and focus returns to its button. The phone problem drawer reports `aria-expanded`; opening it moves focus into it, and Esc closes it and returns focus to the toggle. The symbol keys can be reached with Tab.
- **Mixed languages**: `<Mixed>` (src/ui/Mixed.tsx) gives the English gloss of a Chinese label ("目标电路图 TARGET SCHEMATIC") and Chinese inside English text their own `lang`, so screen readers switch voice.
- **Announcements**: practice verdicts, check results, measurement feedback, the multimeter reading, step text and toasts are in polite live regions that are always in the page, so each change is announced once.
- **Keyboard building on the bench** ("Build with the keyboard" under the 3D view): choose a part, type its holes (`a12 a16`, or the first pin for a footprint part), Place; a table of the placed parts with Select (opens Properties), Move (type new holes) and Delete (with the Undo toast). Same store actions as the 3D view, so validation, messages and undo are identical. The 3D region is described by a text version of the board (every part, value and hole), and the netlist table (My schematic tab) lists every node with its pins and holes.
- **Figures**: circuit diagrams (Practice, key points), the bench schematics and directed graphs get a text alternative generated from the circuit data: each element with its value and the nodes it connects (bench: each node with its pins and voltage).
- **Focus visible**: every control shows the same ring when reached with Tab (2.5 px outline + 5 px halo); composite answer fields (`.pr-input`: field + unit) draw it on the wrapper. The bench e2e test `focusVisible` tabs through a Practice problem, a quiz question, the bench with the keyboard-build form and inspector, Guide and Import, and fails on any focused control without an outline or ring (axe does not check this).
- **Contrast**: `--muted` #5f626b; text variants `--accent-ink` / `--warn-ink` / `--plus-ink` (the bright accents stay for fills and borders); `--bad` #b83a3a; text-field borders and the focus ring ≥ 3:1; the 3D node colours ≥ 3:1 against the board; a wrong choice is marked with ✗, not only red.
- **Motion** (`prefers-reduced-motion`): no confetti, the lesson-step rings stay lit instead of pulsing, the camera jumps to a preset view, no smooth scrolling, CSS animations / transitions off.
- **Reflow**: Practice, key points, Guide and Import reflow at 320 CSS px (wide data tables scroll in their own box).

## Known limits

- Free 3D manipulation (orbiting, dragging parts) has no non-visual equivalent; everything it builds can be built with the keyboard form instead. Push buttons and switches are operated from their Properties panel (select them in the parts table).
- The bench page itself (3D view + toolbox) needs horizontal space; below ~640 px it is the phone layout (see the phone work), not a 320 px reflow.
- `lang` is marked on labels and headings; English acronyms inside Chinese sentences (GND, PWM, JSON) are left to the Chinese voice.
- Wire colours are the student's choice (white / yellow wires are low-contrast on the board); the hover tip and the parts table name every wire's holes.
