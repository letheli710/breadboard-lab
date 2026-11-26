// The live semilog Bode chart of W5-L7 (layers 02 and 03): magnitude (dB) over phase (°) on one
// log-frequency axis with 1–9 minor grid lines; the straight-line asymptote (amber, dashed) over the
// exact curve (blue), the corner frequencies, the asymptote-vs-exact error at each corner (red), the
// 0° crossing ω0 = √(ω_p1 ω_p2) of the two-pole band-pass, the resonant peak of the pole pair, and a
// frequency cursor to drag (it snaps onto the corners and the other special points). Layer 03 adds
// each factor's own asymptote in its colour. While the guided example runs, only what it has
// reached is drawn (Reveal).

import { useEffect, useId, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { corners, factorAsymDb, factorAsymPhase, fmt, fmtS, peak, totalAsymDb, totalAsymPhase, totalDb, totalMagSlope, totalPhase, breakpoints, type Factor } from './model';
import { COLOR, FACTOR_COLOR, Obj, Subs, type Lab } from './state';

export const VW = 460;
export const X0 = 50;
export const X1 = 448;
interface Geo {
  MAG: [number, number];
  PH: [number, number];
  VH: number;
}
/** the two panels' heights: roomy on a desktop stage, flatter on a phone (the stage is short there) */
const GEO: Geo = { MAG: [12, 146], PH: [164, 260], VH: 292 };
const GEO_PHONE: Geo = { MAG: [8, 112], PH: [124, 206], VH: 236 };

/** the stage is laid out for a phone (the site's 960 px breakpoint) */
function usePhone(): boolean {
  const q = '(max-width: 960px)';
  const [m, setM] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(q).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(q);
    if (!mq) return;
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}
const N = 280;

const lg = Math.log10;

/** "nice" decade labels */
export function decadeLabel(w: number): string {
  const e = Math.round(lg(w));
  const map: Record<number, string> = { [-2]: '0.01', [-1]: '0.1', 0: '1', 1: '10', 2: '100', 3: '1k', 4: '10k', 5: '100k', 6: '1M' };
  return map[e] ?? `1e${e}`;
}

export interface Axes {
  lo: number;
  hi: number;
  x: (w: number) => number;
  wOf: (x: number) => number;
  mag: [number, number];
  magStep: number;
  ph: [number, number];
  phStep: number;
  yM: (db: number) => number;
  yP: (deg: number) => number;
}

/** the axes of the chart for the lab's transfer function (fixed ranges for the guided example, so they give nothing away) */
export function axesOf(lab: Lab, { MAG, PH }: Geo = GEO): Axes {
  const [lo, hi] = lab.range;
  const x = (w: number) => X0 + ((lg(w) - lg(lo)) / (lg(hi) - lg(lo))) * (X1 - X0);
  const wOf = (px: number) => 10 ** (lg(lo) + ((px - X0) / (X1 - X0)) * (lg(hi) - lg(lo)));
  let mag: [number, number];
  let magStep: number;
  let ph: [number, number];
  let phStep: number;
  if (lab.preset === 'guided') {
    mag = [-20, 40];
    magStep = 20;
    ph = [-180, 180];
    phStep = 90;
  } else {
    let a = Infinity;
    let b = -Infinity;
    let c = Infinity;
    let d = -Infinity;
    for (let k = 0; k <= 160; k++) {
      const w = 10 ** (lg(lo) + (k / 160) * (lg(hi) - lg(lo)));
      for (const v of [totalAsymDb(lab.fs, w), totalDb(lab.fs, w)]) {
        a = Math.min(a, v);
        b = Math.max(b, v);
      }
      for (const v of [totalAsymPhase(lab.fs, w), totalPhase(lab.fs, w)]) {
        c = Math.min(c, v);
        d = Math.max(d, v);
      }
    }
    const span = Math.max(b - a, 20);
    magStep = span <= 45 ? 10 : span <= 110 ? 20 : 40;
    mag = [Math.floor((a + 0.5) / magStep) * magStep, Math.ceil((b + 1) / magStep) * magStep];
    if (mag[1] - mag[0] < 2 * magStep) mag = [mag[0] - magStep, mag[1] + magStep];
    // the pole pair: one fixed range for every ζ (the peak reaches +20 dB at ζ = 0.05), so the slider does not rescale it
    if (lab.preset === 'block' && lab.block === 'quad') {
      mag = [-80, 40];
      magStep = 20;
    }
    // a constant phase (K, (jω)^±1) sits mid-panel
    if (d - c < 1) {
      c -= 90;
      d += 90;
    }
    c = Math.min(c, 0);
    d = Math.max(d, 0);
    ph = [Math.floor(c / 45 + 1e-9) * 45, Math.ceil(d / 45 - 1e-9) * 45];
    if (ph[1] - ph[0] < 90) ph = [ph[0] - 45, ph[1] + 45];
    phStep = ph[1] - ph[0] > 180 ? 90 : 45;
  }
  const yM = (db: number) => MAG[0] + ((mag[1] - db) / (mag[1] - mag[0])) * (MAG[1] - MAG[0]);
  const yP = (deg: number) => PH[0] + ((ph[1] - deg) / (ph[1] - ph[0])) * (PH[1] - PH[0]);
  return { lo, hi, x, wOf, mag, magStep, ph, phStep, yM, yP };
}

const ticks = (lo: number, hi: number, step: number) => {
  const out: number[] = [];
  for (let v = lo; v <= hi + 1e-9; v += step) out.push(Number(v.toFixed(6)));
  return out;
};

/** the special frequencies the cursor snaps to */
export function snapPoints(lab: Lab): number[] {
  const out = new Set<number>([1]);
  for (const c of corners(lab.fs)) for (const b of [0.1 * c, 0.5 * c, c, 2 * c, 10 * c]) out.add(b);
  const w0 = omega0(lab.fs);
  if (w0 && lab.rev.phase) out.add(w0);
  const q = lab.fs.find((f) => f.kind === 'quad');
  const pk = q ? peak(q.zeta!) : null;
  if (q && pk) out.add(pk.wr * q.w!);
  return [...out].filter((w) => w >= lab.range[0] && w <= lab.range[1]);
}

/** ω0 = √(ω_p1 ω_p2): where the phase of K·jω/[(1 + jω/ω_p1)(1 + jω/ω_p2)] crosses 0° */
export function omega0(fs: Factor[]): number | null {
  const poles = fs.filter((f) => f.kind === 'real' && f.n === -1);
  if (poles.length !== 2 || !fs.some((f) => f.kind === 'origin' && f.n === 1)) return null;
  return Math.sqrt(poles[0].w! * poles[1].w!);
}

export interface Show {
  asym: boolean;
  exact: boolean;
  err: boolean;
}

/** the asymptote's corners: it is straight between them (in log ω), so a polyline through them is exact */
function asymPoints(fs: Factor[], lo: number, hi: number, upTo = hi): number[] {
  return [lo, ...breakpoints(fs, lo, hi).filter((b) => b < upTo), upTo];
}

export default function Bode({ lab, fs, comps = [], show, label }: { lab: Lab; fs: Factor[]; comps?: Factor[]; show: Show; label: string }) {
  const clip = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const geo = usePhone() ? GEO_PHONE : GEO;
  const { MAG, PH, VH } = geo;
  const ax = axesOf(lab, geo);
  const { lo, hi, x, yM, yP, rev } = { ...ax, rev: lab.rev };
  const any = fs.length > 0;
  const sample = (f: (w: number) => number, y: (v: number) => number) =>
    Array.from({ length: N + 1 }, (_, k) => {
      const w = 10 ** (lg(lo) + (k / N) * (lg(hi) - lg(lo)));
      return `${k ? 'L' : 'M'} ${x(w).toFixed(1)} ${y(f(w)).toFixed(1)}`;
    }).join(' ');
  const poly = (pts: number[], f: (w: number) => number, y: (v: number) => number) => pts.map((w, k) => `${k ? 'L' : 'M'} ${x(w).toFixed(1)} ${y(f(w)).toFixed(1)}`).join(' ');

  const cs = corners(fs);
  const firstCorner = cs[0] ?? hi;
  const showAsymMag = show.asym && any && (rev.asym || rev.low);
  const asymMagPts = rev.asym ? asymPoints(fs, lo, hi) : asymPoints(fs, lo, hi, firstCorner);
  const showExactMag = show.exact && any && rev.exact;
  const showPhase = any && rev.phase;
  const w0 = omega0(fs);
  const q = fs.find((f) => f.kind === 'quad');
  const pk = q ? peak(q.zeta!) : null;

  // cursor
  const w = Math.min(hi, Math.max(lo, lab.w));
  const cx = x(w);
  const snaps = snapPoints(lab);
  const toW = (e: RPointerEvent<SVGElement>) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    let wv = ax.wOf(Math.min(X1, Math.max(X0, p.x)));
    for (const s of snaps) if (Math.abs(lg(wv) - lg(s)) < 0.035) wv = s;
    return wv;
  };
  const drag = (e: RPointerEvent<SVGSVGElement>) => {
    if (e.type === 'pointerdown') svgRef.current?.setPointerCapture?.(e.pointerId);
    else if (!e.buttons) return;
    const wv = toW(e);
    if (wv) lab.setW(Number(wv.toPrecision(10)));
  };

  const decades: number[] = [];
  for (let e = Math.round(lg(lo)); e <= Math.round(lg(hi)); e++) decades.push(10 ** e);
  const minors: number[] = [];
  for (const d of decades.slice(0, -1)) for (let m = 2; m <= 9; m++) minors.push(d * m);

  const panel = (y0: number, y1: number, ts: number[], y: (v: number) => number, unit: string, id: string, title: string) => (
    <g>
      <rect x={X0} y={y0} width={X1 - X0} height={y1 - y0} className="w57-plot" />
      {minors.map((m) => (
        <line key={m} x1={x(m)} x2={x(m)} y1={y0} y2={y1} stroke={COLOR.gridMinor} strokeWidth={0.8} />
      ))}
      {decades.map((d) => (
        <line key={d} x1={x(d)} x2={x(d)} y1={y0} y2={y1} stroke={COLOR.grid} strokeWidth={1.1} />
      ))}
      {ts.map((t) => (
        <g key={t}>
          <line x1={X0} x2={X1} y1={y(t)} y2={y(t)} stroke={t === 0 ? COLOR.axis : COLOR.grid} strokeWidth={t === 0 ? 1.3 : 1} />
          <text x={X0 - 4} y={y(t) + 3.5} className="w57-tick" textAnchor="end">
            {fmt(t, 0)}
          </text>
        </g>
      ))}
      <Obj id={id}>
        <rect x={X0 + 3} y={y0 + 3} width={62} height={15} rx={4} className="w57-tag-bg" />
        <text x={X0 + 34} y={y0 + 14} className="w57-tag" textAnchor="middle">
          {title} ({unit})
        </text>
      </Obj>
    </g>
  );

  return (
    <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} className="w57-bode" role="img" aria-label={label} onPointerDown={drag} onPointerMove={drag}>
      <defs>
        <clipPath id={`${clip}m`}>
          <rect x={X0} y={MAG[0]} width={X1 - X0} height={MAG[1] - MAG[0]} />
        </clipPath>
        <clipPath id={`${clip}p`}>
          <rect x={X0} y={PH[0]} width={X1 - X0} height={PH[1] - PH[0]} />
        </clipPath>
      </defs>
      {panel(MAG[0], MAG[1], ticks(ax.mag[0], ax.mag[1], ax.magStep), yM, 'dB', 'mag_plot', '幅频')}
      {panel(PH[0], PH[1], ticks(ax.ph[0], ax.ph[1], ax.phStep), yP, '°', 'phase_plot', '相频')}
      {decades.map((d) => (
        <text key={d} x={x(d)} y={PH[1] + 15} className="w57-tick" textAnchor="middle">
          {decadeLabel(d)}
        </text>
      ))}
      <text x={X1} y={VH - 2} className="w57-tick" textAnchor="end">
        ω (rad/s，对数坐标)
      </text>

      {/* corner frequencies */}
      {any && (
        <Obj id="corner">
          {cs
            .filter((c) => c > lo && c < hi)
            .map((c) => (
              <g key={c}>
                <line x1={x(c)} x2={x(c)} y1={MAG[0]} y2={PH[1]} className="w57-corner" />
                <text x={x(c) + 3} y={PH[0] + 11} className="w57-lbl small" fill={COLOR.errT}>
                  <Subs s={`${q ? 'ω_n' : 'ω_c'}=${fmtCorner(c)}`} />
                </text>
              </g>
            ))}
        </Obj>
      )}

      <g clipPath={`url(#${clip}m)`}>
        {comps
          .filter((f) => rev.comp(f.id))
          .map((f) => (
            <Obj key={f.id} id={f.id}>
              <path d={poly(asymPoints([f], lo, hi), (wv) => factorAsymDb(f, wv), yM)} className="w57-comp" stroke={FACTOR_COLOR[f.id]?.[0] ?? COLOR.muted} />
            </Obj>
          ))}
        {showExactMag && (
          <Obj id="exact">
            <path d={sample((wv) => totalDb(fs, wv), yM)} className="w57-exact" />
          </Obj>
        )}
        {showAsymMag && (
          <Obj id="asym">
            <path d={poly(asymMagPts, (wv) => totalAsymDb(fs, wv), yM)} className="w57-asym" />
          </Obj>
        )}
      </g>
      <g clipPath={`url(#${clip}p)`}>
        {rev.compPhase &&
          comps
            .filter((f) => rev.comp(f.id))
            .map((f) => (
              <Obj key={f.id} id={f.id}>
                <path d={poly(asymPoints([f], lo, hi), (wv) => factorAsymPhase(f, wv), yP)} className="w57-comp" stroke={FACTOR_COLOR[f.id]?.[0] ?? COLOR.muted} />
              </Obj>
            ))}
        {showPhase && show.exact && (
          <Obj id="exact">
            <path d={sample((wv) => totalPhase(fs, wv), yP)} className="w57-exact" />
          </Obj>
        )}
        {showPhase && show.asym && (
          <Obj id="asym">
            <path d={poly(asymPoints(fs, lo, hi), (wv) => totalAsymPhase(fs, wv), yP)} className="w57-asym" />
          </Obj>
        )}
      </g>

      {/* the asymptote-vs-exact error at each corner */}
      {show.err && show.asym && show.exact && rev.exact && any && (
        <Obj id="err3">
          {cs
            .filter((c) => c > lo && c < hi)
            .map((c) => {
              const e = totalDb(fs, c) - totalAsymDb(fs, c);
              const ya = yM(totalAsymDb(fs, c));
              const ye = yM(totalDb(fs, c));
              // label on the side where the plot is empty: right of a corner the curve rises into, else left
              // the label goes where the plot is empty: a dip under a corner the curve rises into → below
              // right; under a flat-then-falling corner → above right; a bump over the corner → above left
              const rising = totalMagSlope(fs, c * 0.99) > 0;
              const right = e < 0;
              const ty = e < 0 ? (rising ? ye + 15 : ya - 7) : ye - 8;
              return (
                <g key={c}>
                  <line x1={x(c)} x2={x(c)} y1={ya} y2={ye} stroke={COLOR.err} strokeWidth={3} strokeLinecap="round" />
                  <circle cx={x(c)} cy={ye} r={3.4} fill={COLOR.err} />
                  <text x={x(c) + (right ? 6 : -6)} y={ty} className="w57-lbl small" textAnchor={right ? 'start' : 'end'} fill={COLOR.errT}>
                    {fmtS(e)} dB
                  </text>
                </g>
              );
            })}
        </Obj>
      )}
      {/* resonant peak of the pole pair */}
      {q && pk && show.exact && (
        <Obj id="peak">
          <circle cx={x(pk.wr * q.w!)} cy={yM(pk.db)} r={4} fill={COLOR.err} />
          <text x={x(pk.wr * q.w!) + 8} y={yM(pk.db) - 5} className="w57-lbl small" textAnchor="start" fill={COLOR.errT}>
            峰 {fmtS(pk.db)} dB
          </text>
        </Obj>
      )}
      {/* 0° crossing of the band-pass */}
      {w0 && showPhase && (
        <Obj id="omega0">
          <circle cx={x(w0)} cy={yP(0)} r={4.2} fill={COLOR.w0} />
          <text x={x(w0) + 6} y={yP(0) - 5} className="w57-lbl small" fill={COLOR.w0T}>
            <Subs s={`ω_0≈${fmt(w0, 2)}: 0°`} />
          </text>
        </Obj>
      )}
      {lab.masked && !rev.low && !comps.some((f) => rev.comp(f.id)) && (
        <text x={(X0 + X1) / 2} y={(MAG[0] + MAG[1]) / 2} className="w57-lbl" textAnchor="middle" fill={COLOR.muted}>
          引导例题进行中：每答对一步，这里画出一段
        </text>
      )}
      {lab.masked && !rev.phase && (
        <text x={(X0 + X1) / 2} y={(PH[0] + PH[1]) / 2 + 4} className="w57-lbl" textAnchor="middle" fill={COLOR.muted}>
          相频图：第 5 步揭晓
        </text>
      )}

      {/* cursor */}
      <Obj id="cursor">
        <line x1={cx} x2={cx} y1={MAG[0]} y2={PH[1]} className="w57-cursor" />
        {showExactMag && <circle cx={cx} cy={yM(totalDb(fs, w))} r={3.6} fill={COLOR.exact} />}
        {showAsymMag && (rev.asym || w <= firstCorner) && <circle cx={cx} cy={yM(totalAsymDb(fs, w))} r={3.2} fill={COLOR.asym} />}
        {showPhase && show.exact && <circle cx={cx} cy={yP(totalPhase(fs, w))} r={3.6} fill={COLOR.exact} />}
        <rect x={cx - 5} y={MAG[0] - 2} width={10} height={PH[1] - MAG[0] + 4} fill="transparent" />
      </Obj>
    </svg>
  );
}

export function fmtCorner(c: number): string {
  return c >= 1000 ? `${Number((c / 1000).toPrecision(3))}k` : `${Number(c.toPrecision(3))}`;
}
