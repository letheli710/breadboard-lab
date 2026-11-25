// Layer "02 实时幅频/相频波特图": a live Bode plot on a log axis, 10 Hz – 100 kHz (four decades),
// magnitude in dB above, phase below. Two views:
// - 'compare': the sheet's three low-pass curves from the same parts — the inverting active LPF
//   with the 10 kΩ load (green), the passive RC unloaded (blue), the same RC with the load (red,
//   dashed) — bound to the R_i / R_f / C_f sliders of layer 01 (passive R = R_f, C = C_f);
// - 'topo': the curve of the topology picked in layer 01 (with or without its load).
// A frequency cursor (shared with the function generator on the bench) reads every curve.
// Act 7's design problem: the target lines only, the real curve once the example has reached it.
// The phase panel shows the pole phase with an inverting stage's −180° taken out (as the sheet does).

import { useMemo } from 'react';
import {
  activeLpf,
  bode,
  type BodePoint,
  type Cx,
  DESIGN,
  F_MAX,
  F_MIN,
  fmtDb,
  fmtDeg,
  fmtHz,
  mag,
  metrics,
  MODE_LABEL,
  type Mode,
  passiveLpf,
  RL,
  toDb,
  transfer,
  angDeg,
} from './model';
import { Cell, FreqSlider, hoverProps, type Lab, masked, Seg, SweepButton, Toggle, useClearHoverOnUnmount, useIsLit, useLab, type View } from './state';

const W = 640;
const X0 = 58;
const X1 = 624;
const MY0 = 16;
const MY1 = 196;
const PY0 = 222;
const PY1 = 306;

const fx = (f: number) => X0 + ((X1 - X0) * Math.log10(f / F_MIN)) / Math.log10(F_MAX / F_MIN);

interface Curve {
  id: string;
  cls: string;
  label: string;
  pts: BodePoint[];
  h: (f: number) => Cx;
  inverted: boolean;
  fc: number[];
  /** pass-band level (dB) for the −3 dB guide */
  pass: number;
}

const INVERTED: Record<Mode, boolean> = { plpf: false, phpf: false, alpf: true, ahpf: true, bpf: false, design: true };
const DB_RANGE: Record<Mode | 'compare', [number, number]> = {
  compare: [15, -35],
  plpf: [5, -45],
  phpf: [5, -45],
  alpf: [15, -35],
  ahpf: [15, -35],
  bpf: [10, -40],
  design: [20, -30],
};
const PH_RANGE: Record<Mode | 'compare', [number, number]> = {
  compare: [0, -90],
  plpf: [0, -90],
  alpf: [0, -90],
  design: [0, -90],
  phpf: [90, 0],
  ahpf: [90, 0],
  bpf: [90, -90],
};

function curvesOf(lab: Lab): Curve[] {
  const p = lab.parts;
  if (lab.view === 'compare' && lab.mode !== 'design') {
    const a = (f: number) => activeLpf(f, p.ri, p.rf, p.cf);
    const u = (f: number) => passiveLpf(f, p.rf, p.cf, null);
    const l = (f: number) => passiveLpf(f, p.rf, p.cf, RL);
    const ma = metrics('alpf', p, true);
    const mu = metrics('plpf', p, false);
    const ml = metrics('plpf', p, true);
    return [
      { id: 'bd_active', cls: 'active', label: `有源反相 LPF（带 10 kΩ 负载）`, pts: bode(a, true), h: a, inverted: true, fc: ma.fc, pass: toDb(Math.abs(ma.k)) },
      { id: 'bd_passive', cls: 'passive', label: '无源 RC LPF 空载', pts: bode(u, false), h: u, inverted: false, fc: mu.fc, pass: 0 },
      { id: 'bd_loaded', cls: 'loaded', label: '无源 RC LPF 带 10 kΩ 负载', pts: bode(l, false), h: l, inverted: false, fc: ml.fc, pass: toDb(ml.k) },
    ];
  }
  const mode = lab.mode;
  if (mode === 'design' && lab.reveal < 4) return [];
  const h = (f: number) => transfer(mode, f, p, lab.load);
  const m = metrics(mode, p, lab.load);
  const pass = mode === 'bpf' ? toDb(m.peak!.k) : toDb(Math.abs(m.k));
  const label = mode === 'design' ? '设计结果：Ri 10 kΩ · Rf 51 kΩ · Cf 3.3 nF' : `${MODE_LABEL[mode]}${lab.load && mode !== 'bpf' ? '（带 10 kΩ 负载）' : ''}`;
  return [
    {
      id: mode === 'design' ? 'bd_design' : 'bd_topo',
      cls: mode === 'plpf' || mode === 'phpf' ? (lab.load ? 'loaded' : 'passive') : 'active',
      label,
      pts: bode(h, INVERTED[mode]),
      h,
      inverted: INVERTED[mode],
      fc: m.fc,
      pass,
    },
  ];
}

function phaseOf(c: Curve, f: number) {
  let ph = angDeg(c.h(f));
  if (c.inverted) ph = ph > 0 ? ph - 180 : ph + 180;
  return ph;
}

export default function Bode() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const on = useIsLit();
  const key = lab.view === 'compare' && lab.mode !== 'design' ? 'compare' : lab.mode;
  const [dbTop, dbBot] = DB_RANGE[key];
  const [phTop, phBot] = PH_RANGE[key];
  const my = (db: number) => MY0 + ((MY1 - MY0) * (dbTop - db)) / (dbTop - dbBot);
  const py = (ph: number) => PY0 + ((PY1 - PY0) * (phTop - ph)) / (phTop - phBot);
  const curves = useMemo(() => curvesOf(lab), [lab]);
  const path = (pts: BodePoint[], y: (p: BodePoint) => number) => pts.map((p, i) => `${i ? 'L' : 'M'}${fx(p.f).toFixed(1)} ${y(p).toFixed(1)}`).join('');
  const design = lab.mode === 'design';
  const dbTicks: number[] = [];
  for (let d = dbTop; d >= dbBot; d -= 10) dbTicks.push(d);
  const phTicks = phTop - phBot === 180 ? [90, 45, 0, -45, -90] : [phTop, (phTop + phBot) / 2, phBot];
  const cx = fx(lab.f);
  const inv = curves.some((c) => c.inverted);
  return (
    <div className="w59-layer">
      <div className="w59-dock">
        {!design && (
          <Seg<View>
            label="曲线"
            value={lab.view}
            onChange={(v) => lab.set({ view: v })}
            options={[
              { value: 'compare', label: '三曲线对决（同一 R、C）', short: '三曲线对决', hover: ['bd_active', 'bd_passive', 'bd_loaded'] },
              { value: 'topo', label: `当前拓扑：${MODE_LABEL[lab.mode]}`, short: '当前拓扑', hover: ['bd_topo'] },
            ]}
          />
        )}
        {!design && lab.view === 'topo' && lab.mode !== 'bpf' && (
          <Toggle
            on={lab.load}
            onClick={() => lab.set({ load: !lab.load })}
            label={lab.load ? '断开 10 kΩ 负载' : '接入 10 kΩ 负载'}
            short={lab.load ? '断 RL' : '接 RL'}
            ids={['sch_rl']}
          />
        )}
        {design && <span className="w59-chip">引导例题：设计目标 |K| = 5、fc = 1 kHz</span>}
        <SweepButton lab={lab} />
      </div>
      <div className="w59-dock">
        <FreqSlider lab={lab} />
      </div>
      <svg viewBox={`0 0 ${W} 330`} className="w59-chart" role="img" aria-label="实时波特图：上为幅频（dB），下为相频（度），横轴为对数频率">
        <defs>
          <clipPath id="w59clipM">
            <rect x={X0} y={MY0} width={X1 - X0} height={MY1 - MY0} />
          </clipPath>
          <clipPath id="w59clipP">
            <rect x={X0} y={PY0} width={X1 - X0} height={PY1 - PY0} />
          </clipPath>
        </defs>
        <rect x={X0} y={MY0} width={X1 - X0} height={MY1 - MY0} className="w59-plot" />
        <rect x={X0} y={PY0} width={X1 - X0} height={PY1 - PY0} className="w59-plot" />
        {[10, 100, 1000, 10000, 100000].map((f) => (
          <g key={f}>
            <line x1={fx(f)} x2={fx(f)} y1={MY0} y2={MY1} className="w59-grid" />
            <line x1={fx(f)} x2={fx(f)} y1={PY0} y2={PY1} className="w59-grid" />
            <text x={fx(f)} y={322} className={`w59-tick ${f === 10 ? '' : f === 100000 ? 'end' : 'mid'}`}>
              {fmtHz(f)}
            </text>
          </g>
        ))}
        {dbTicks.map((d) => (
          <g key={d}>
            <line x1={X0} x2={X1} y1={my(d)} y2={my(d)} className={`w59-grid ${d === 0 ? 'zero' : ''}`} />
            <text x={X0 - 5} y={my(d) + 4} className="w59-tick end">
              {d > 0 ? `+${d}` : d === 0 ? '0 dB' : `−${-d}`}
            </text>
          </g>
        ))}
        {phTicks.map((d) => (
          <g key={d}>
            <line x1={X0} x2={X1} y1={py(d)} y2={py(d)} className="w59-grid" />
            <text x={X0 - 5} y={py(d) + 4} className="w59-tick end">
              {d > 0 ? `+${d}°` : d === 0 ? '0°' : `−${-d}°`}
            </text>
          </g>
        ))}
        <text x={X0 + 4} y={PY0 - 5} className="w59-tick axis">
          {inv ? '极点相移（反相级的 −180° 已扣除：总相角 = −180° + 图中值）' : '相移（°）'}
        </text>
        {/* design targets */}
        {design && (
          <g className={`w59-cg ${on('bd_target')}`} {...hoverProps(['bd_target'])}>
            <line x1={X0} x2={X1} y1={my(toDb(DESIGN.target.k))} y2={my(toDb(DESIGN.target.k))} className="w59-target" />
            <line x1={fx(DESIGN.target.fc)} x2={fx(DESIGN.target.fc)} y1={MY0} y2={MY1} className="w59-target" />
            <text x={X0 + 6} y={my(toDb(DESIGN.target.k)) - 6} className="w59-lbl target">
              目标 |K| = 5（+13.98 dB）
            </text>
            <text x={fx(DESIGN.target.fc) + 5} y={MY1 - 8} className="w59-lbl target">
              目标 fc = 1 kHz
            </text>
            {lab.reveal < 4 && (
              <text x={(X0 + fx(DESIGN.target.fc)) / 2} y={(MY0 + MY1) / 2 + 30} className="w59-lbl mid muted">
                实际曲线在引导例题第 4 步答完后揭晓
              </text>
            )}
          </g>
        )}
        {/* curves */}
        <g clipPath="url(#w59clipM)">
          {curves.map((c) => (
            <g key={c.id} className={`w59-cg ${on(c.id)}`} {...hoverProps([c.id])}>
              <path d={path(c.pts, (p) => my(p.db))} className="w59-hit" />
              <path d={path(c.pts, (p) => my(p.db))} className={`w59-trace ${c.cls}`} />
            </g>
          ))}
        </g>
        <g clipPath="url(#w59clipP)">
          {curves.map((c) => (
            <g key={c.id} className={`w59-cg ${on(c.id, 'bd_phase')}`} {...hoverProps([c.id, 'bd_phase'])}>
              <path d={path(c.pts, (p) => py(p.ph))} className="w59-hit" />
              <path d={path(c.pts, (p) => py(p.ph))} className={`w59-trace ${c.cls} ph`} />
            </g>
          ))}
        </g>
        {/* corner marks and the −3 dB guides */}
        {curves.map((c) =>
          c.fc.map((f, i) => {
            const v = toDb(mag(c.h(f)));
            return (
              <g key={`${c.id}${i}`} className={`w59-cg ${on('bd_fc', c.id)}`} {...hoverProps(['bd_fc'])}>
                <line x1={fx(f)} x2={fx(f)} y1={my(v)} y2={PY1} className={`w59-fcline ${c.cls}`} />
                <circle cx={fx(f)} cy={my(v)} r={4.6} className={`w59-fcdot ${c.cls}`} />
                <circle cx={fx(f)} cy={py(phaseOf(c, f))} r={3.6} className={`w59-fcdot ${c.cls}`} />
                <text x={fx(f) + (c.cls === 'loaded' ? -6 : 6)} y={my(v) + (c.cls === 'loaded' ? 18 : -8)} className={`w59-lbl ${c.cls} ${c.cls === 'loaded' ? 'end' : ''}`}>
                  {fmtHz(f)}（{fmtDb(v)}）
                </text>
              </g>
            );
          }),
        )}
        {curves.length > 0 && (
          <g className={`w59-cg ${on('bd_3db')}`} {...hoverProps(['bd_3db'])}>
            <line x1={X0} x2={X1} y1={my(curves[0].pass - 3.0103)} y2={my(curves[0].pass - 3.0103)} className="w59-guide" />
            {key !== 'compare' && (
              <text x={X1 - 6} y={my(curves[0].pass - 3.0103) - 6} className="w59-lbl guide end">
                −3 dB（{fmtDb(curves[0].pass - 3.0103)}）
              </text>
            )}
          </g>
        )}
        {(key === 'compare' || key === 'alpf' || key === 'plpf' || (key === 'design' && lab.reveal >= 4)) && curves.length > 0 && (
          <g className={`w59-cg ${on('bd_slope')}`} {...hoverProps(['bd_slope'])}>
            <text x={fx(40000)} y={my(toDb(mag(curves[0].h(40000)))) - 10} className="w59-lbl slope end">
              −20 dB/dec
            </text>
          </g>
        )}
        {design && lab.reveal >= 4 && curves.length > 0 && (
          <g className={`w59-cg ${on('bd_design')}`}>
            <circle cx={fx(10000)} cy={my(toDb(mag(curves[0].h(10000))))} r={4.6} className="w59-fcdot loaded" />
            <text x={fx(10000) + 6} y={my(toDb(mag(curves[0].h(10000)))) + 16} className="w59-lbl loaded">
              10 kHz：{fmtDb(toDb(mag(curves[0].h(10000))))}
            </text>
          </g>
        )}
        {/* cursor */}
        <g className={`w59-cg ${on('bd_cursor', 'bb_gen')}`} {...hoverProps(['bd_cursor'])}>
          <line x1={cx} x2={cx} y1={MY0} y2={PY1} className="w59-cursor" />
          {curves.map((c) => (
            <g key={c.id}>
              <circle cx={cx} cy={my(toDb(mag(c.h(lab.f))))} r={3.4} className={`w59-cdot ${c.cls}`} />
              <circle cx={cx} cy={py(phaseOf(c, lab.f))} r={3} className={`w59-cdot ${c.cls}`} />
            </g>
          ))}
        </g>
      </svg>
      <div className="w59-cells">
        <Cell id="bd_cursor" name="扫频频率" value={fmtHz(lab.f)} />
        {curves.map((c) => (
          <Cell
            key={c.id}
            id={c.id}
            name={c.cls === 'active' ? (design ? '设计 |H|' : key === 'compare' ? '有源带载' : MODE_LABEL[lab.mode]) : c.cls === 'passive' ? '无源空载' : '无源带载'}
            tone={c.cls === 'loaded' ? 'bad' : c.cls === 'active' ? 'good' : ''}
            value={`${fmtDb(toDb(mag(c.h(lab.f))))} · ${fmtDeg(c.inverted ? phaseOf(c, lab.f) - 180 : phaseOf(c, lab.f))}`}
          />
        ))}
        {design && <Cell id="bd_design" name="实际 fc" value={masked(lab, 4, fmtHz(metrics('design', lab.parts, false).fc[0]))} />}
      </div>
    </div>
  );
}
