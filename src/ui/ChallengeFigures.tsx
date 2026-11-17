// Pictures in a lesson / challenge description (`figures`, docs/CHALLENGE_FORMAT.md §16): hand-placed
// circuit drawings in the theory-problem geometry, drawn by the same ProblemSchematic as the
// practice problems, each with a caption. Loaded lazily by the task panel (only files with figures
// pull in the drawing code).

import type { ChallengeFigure } from '../core/challenge';
import { Md } from './Md';
import { ProblemSchematic } from './ProblemSchematic';

export default function ChallengeFigures({ figures }: { figures: ChallengeFigure[] }) {
  return (
    <>
      {figures.map((f, i) => (
        <figure key={i} className="ch-figure">
          <div className="schem-card pr-schem">
            <ProblemSchematic schematic={f.schematic} alt={f.alt} />
          </div>
          <figcaption>
            <Md text={f.caption} />
          </figcaption>
        </figure>
      ))}
    </>
  );
}
