// Layer "03 2D 原理图与分段线性 v(t)↔i(t) 微积分波形联动": three aligned live charts — v(t), i(t)
// and w(t) = ½Cv² — with a draggable time cursor and its readouts (dv/dt, i, w, p = vi).
// - 例题 2 (v → i): C = 2 μF, v through 0 → 10 → 10 → −10 → 0 V at 0, 2, 4, 6, 8 ms; the rise-time
//   test squeezes the first ramp into Δt (2 ms → 0.01 ms): the current pulse i = C · 10 V / Δt
//   shoots up, and past 1 A the stage raises the "voltage cannot jump" alarm.
// - 例题 3 (i → v): C = 50 μF, v(0) = 2 V, i = +15 mA then −10 mA; v(t) = (1/C)∫i dτ + v(0), with a
//   switch that drops v(0) to show the classic slip.

import type { ReactNode } from 'react';
import { useStageParam } from '../../stageStore';
import { EX2, EX3, EX3_END, energy, ex2Points, ex3charge, ex3i, ex3v, fmtI, fmtQ, fmtSlope, fmtV, fmtW, pwl, riseCurrent, slope, SPIKE_ALARM } from './model';
import { Cell, hoverProps, Seg, Slider, useClearHoverOnUnmount, useIsLit } from './state';

export type WaveMode = 'ex2' | 'ex3';

const X0 = 74;
const X1 = 616;
const PANELS = {
  v: { top: 22, bot: 112 },
  i: { top: 132, bot: 222 },
  w: { top: 242, bot: 312 },
};

/** Δt of the rise-time test from the slider position r ∈ [0, 1] (2 ms … 0.01 ms, log) */
export const riseOf = (r: number) => 2e-3 * Math.pow(10, -2.3 * r);

function Axis({
  p,
  lo,
  hi,
  ticks,
  unit,
  id,
  label,
  color,
}: {
  p: { top: number; bot: number };
  lo: number;
  hi: number;
  ticks: number[];
  unit: string;
  id: string;
  label: string;
  color: string;
}) {
  const on = useIsLit()(id);
  const Y = (y: number) => p.bot - ((y - lo) / (hi - lo)) * (p.bot - p.top);
  return (
    <g className={`w41-axis ${on}`} {...hoverProps([id])}>
      <rect x={X0} y={p.top} width={X1 - X0} height={p.bot - p.top} fill={on ? '#fff7e6' : '#ffffff'} stroke="#e3d8c2" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X0} x2={X1} y1={Y(t)} y2={Y(t)} stroke={t === 0 ? '#94a3b8' : '#efe7d6'} strokeWidth={t === 0 ? 1.2 : 1} />
          <text x={X0 - 6} y={Y(t) + 4} textAnchor="end" className="w41-tick">
            {t}
          </text>
        </g>
      ))}
      <text x={8} y={p.top + 12} className="w41-ctitle" fill={color}>
        {label}
      </text>
      <text x={8} y={p.top + 26} className="w41-tick">
        {unit}
      </text>
    </g>
  );
}

export default function Waves() {
  useClearHoverOnUnmount();
  const on = useIsLit();
  const [mode, setMode] = useStageParam<WaveMode>('wv', 'ex2');
  const [tms, setT] = useStageParam('wt', 1);
  const [r, setR] = useStageParam('rise', 0);
  const [withV0, setV0] = useStageParam('v0on', true);
  const T = mode === 'ex2' ? 8e-3 : EX3_END;
  const t = Math.min(T, Math.max(0, tms * 1e-3));
  const X = (s: number) => X0 + (s / T) * (X1 - X0);
  const n = 400;
  const ts = Array.from({ length: n + 1 }, (_, k) => (k / n) * T);
  const path = (f: (s: number) => number, Y: (y: number) => number) => ts.map((s, k) => `${k ? 'L' : 'M'}${X(s).toFixed(1)} ${Y(f(s)).toFixed(1)}`).join(' ');
  const yOf = (p: { top: number; bot: number }, lo: number, hi: number) => (y: number) => p.bot - ((Math.min(hi, Math.max(lo, y)) - lo) / (hi - lo)) * (p.bot - p.top);

  let body: ReactNode;
  let cells: ReactNode;
  let alarm: string | null = null;
  if (mode === 'ex2') {
    const rise = riseOf(r);
    const pts = ex2Points(rise);
    const C = EX2.C;
    const v = (s: number) => pwl(pts, s);
    const Yv = yOf(PANELS.v, -12, 12);
    const Yi = yOf(PANELS.i, -25, 25);
    const Yw = yOf(PANELS.w, 0, 120);
    // the current is piecewise constant: draw it as steps (risers dashed)
    const segs = pts.slice(0, -1).map((p, k) => ({ t0: p[0], t1: pts[k + 1][0], i: (C * (pts[k + 1][1] - p[1])) / (pts[k + 1][0] - p[0]) }));
    const spike = riseCurrent(rise);
    if (spike > SPIKE_ALARM) alarm = `物理限制：电容电压不能瞬时突变 —— Δt → 0 时 i = C·dv/dt → ∞（此刻已需 ${fmtI(spike)}）`;
    const vt = v(t);
    const it = C * slope(pts, t);
    body = (
      <>
        <Axis p={PANELS.v} lo={-12} hi={12} ticks={[-10, 0, 10]} unit="V" id="v_t" label="v(t)" color="#0369a1" />
        <Axis p={PANELS.i} lo={-25} hi={25} ticks={[-20, -10, 0, 10, 20]} unit="mA" id="i_t" label="i(t)" color="#c2410c" />
        <Axis p={PANELS.w} lo={0} hi={120} ticks={[0, 50, 100]} unit="μJ" id="w_t" label="w(t)" color="#15803d" />
        <path d={path(v, Yv)} className={`w41-curve v ${on('v_t', 'slope')}`} />
        {segs.map((s, k) => {
          const mA = s.i * 1e3;
          const over = mA > 25;
          return (
            <g key={k}>
              <line x1={X(s.t0)} x2={X(s.t1)} y1={Yi(mA)} y2={Yi(mA)} className={`w41-curve i ${on('i_t')}`} />
              {k > 0 && <line x1={X(s.t0)} x2={X(s.t0)} y1={Yi(segs[k - 1].i * 1e3)} y2={Yi(mA)} className="w41-riser" />}
              {over && (
                <text x={X(s.t0) + 6} y={PANELS.i.top + 12} className="w41-spike">
                  ↑ {fmtI(s.i)}
                </text>
              )}
            </g>
          );
        })}
        <line x1={X(segs[segs.length - 1].t1)} x2={X(segs[segs.length - 1].t1)} y1={Yi(segs[segs.length - 1].i * 1e3)} y2={Yi(0)} className="w41-riser" />
        <path d={path((s) => energy(C, v(s)) * 1e6, Yw)} className={`w41-curve w ${on('w_t')}`} />
        {[0, 2, 4, 6, 8].map((ms) => (
          <text key={ms} x={X(ms * 1e-3)} y={328} textAnchor="middle" className="w41-tick">
            {ms}
            {ms === 8 ? ' ms' : ''}
          </text>
        ))}
        <Cursor x={X(t)} pts={[Yv(vt), Yi(it * 1e3), Yw(energy(C, vt) * 1e6)]} />
      </>
    );
    cells = (
      <>
        <Cell id="cursor" name="t" value={`${(t * 1e3).toFixed(2)} ms`} tone="minor" />
        <Cell id="v_t" name="v(t)" value={fmtV(vt)} />
        <Cell id="slope" name="dv/dt" value={fmtSlope(slope(pts, t))} />
        <Cell id="i_t" name="i = C·dv/dt" value={fmtI(it)} tone="good" />
        <Cell id="w_t" name="w = ½Cv²" value={fmtW(energy(C, vt))} />
        <Cell id="power" name="p = vi" value={`${(vt * it * 1e3).toFixed(1)} mW`} tone="minor" />
      </>
    );
  } else {
    const C = EX3.C;
    const Yv = yOf(PANELS.v, 0, 4);
    const Yi = yOf(PANELS.i, -20, 20);
    const Yw = yOf(PANELS.w, 0, 300);
    const vt = ex3v(t, withV0);
    const it = ex3i(t);
    body = (
      <>
        <Axis p={PANELS.v} lo={0} hi={4} ticks={[0, 2, 4]} unit="V" id="v_t" label="v(t)" color="#0369a1" />
        <Axis p={PANELS.i} lo={-20} hi={20} ticks={[-10, 0, 15]} unit="mA" id="i_t" label="i(t)" color="#c2410c" />
        <Axis p={PANELS.w} lo={0} hi={300} ticks={[0, 100, 256]} unit="μJ" id="w_t" label="w(t)" color="#15803d" />
        {!withV0 && <path d={path((s) => ex3v(s, true), Yv)} className="w41-curve ghost" />}
        <path d={path((s) => ex3v(s, withV0), Yv)} className={`w41-curve v ${on('v_t', 'charge_int')}`} />
        <line x1={X0} x2={X0 + 18} y1={Yv(withV0 ? EX3.v0 : 0)} y2={Yv(withV0 ? EX3.v0 : 0)} className={`w41-v0 ${on('v0')}`} {...hoverProps(['v0'])} />
        {EX3.segs.map((s, k) => (
          <g key={k}>
            <rect
              x={X(s.t0)}
              width={X(s.t1) - X(s.t0)}
              y={Math.min(Yi(s.i * 1e3), Yi(0))}
              height={Math.abs(Yi(s.i * 1e3) - Yi(0))}
              className={`w41-area ${s.i > 0 ? 'in' : 'out'} ${on('charge_int')}`}
              {...hoverProps(['charge_int'])}
            />
            <line x1={X(s.t0)} x2={X(s.t1)} y1={Yi(s.i * 1e3)} y2={Yi(s.i * 1e3)} className={`w41-curve i ${on('i_t')}`} />
            {k > 0 && <line x1={X(s.t0)} x2={X(s.t0)} y1={Yi(EX3.segs[k - 1].i * 1e3)} y2={Yi(s.i * 1e3)} className="w41-riser" />}
            <text x={(X(s.t0) + X(s.t1)) / 2} y={s.i > 0 ? Yi(s.i * 1e3) + 14 : Yi(s.i * 1e3) - 6} textAnchor="middle" className="w41-area-label">
              {s.i > 0 ? '+60 μC' : '−60 μC'}
            </text>
          </g>
        ))}
        <path d={path((s) => energy(C, ex3v(s, withV0)) * 1e6, Yw)} className={`w41-curve w ${on('w_t')}`} />
        {[0, 2, 4, 6, 8, 10].map((ms) => (
          <text key={ms} x={X(ms * 1e-3)} y={328} textAnchor="middle" className="w41-tick">
            {ms}
            {ms === 10 ? ' ms' : ''}
          </text>
        ))}
        <Cursor x={X(t)} pts={[Yv(vt), Yi(it * 1e3), Yw(energy(C, vt) * 1e6)]} />
      </>
    );
    cells = (
      <>
        <Cell id="cursor" name="t" value={`${(t * 1e3).toFixed(2)} ms`} tone="minor" />
        <Cell id="i_t" name="i(t)" value={fmtI(it)} />
        <Cell id="charge_int" name="∫i dτ" value={fmtQ(ex3charge(t))} />
        <Cell id="v_t" name="v(t)" value={fmtV(vt, 3)} tone={withV0 ? 'good' : 'bad'} />
        <Cell id="w_t" name="w = ½Cv²" value={fmtW(energy(C, vt))} />
        <Cell id="v0" name="v(0)" value={withV0 ? '2 V' : '漏加！'} tone={withV0 ? 'minor' : 'bad'} />
      </>
    );
  }

  return (
    <div className="w41-layer">
      <div className="w41-dock">
        <Seg<WaveMode>
          label="例题"
          value={mode}
          onChange={(m) => setMode(m)}
          options={[
            { value: 'ex2', label: '例题 2：由 v 求 i', short: '例题 2', hover: ['v_t', 'i_t'] },
            { value: 'ex3', label: '例题 3：由 i 求 v', short: '例题 3', hover: ['i_t', 'charge_int'] },
          ]}
        />
        <Slider id="cursor" label="t" value={Math.min(tms, T * 1e3)} min={0} max={T * 1e3} step={0.05} onChange={setT} text={`${(t * 1e3).toFixed(2)} ms`} />
        {mode === 'ex2' ? (
          <Slider id="rise_test" label="Δt" value={r} min={0} max={1} step={0.01} onChange={setR} text={`${(riseOf(r) * 1e3).toPrecision(2)} ms`} />
        ) : (
          <button className={`w41-toggle ${withV0 ? 'on' : 'warn'} ${on('v0')}`} aria-pressed={withV0} onClick={() => setV0(!withV0)} {...hoverProps(['v0'])}>
            <span className="full">{withV0 ? '已加上 v(0) = 2 V' : '忘了加 v(0)'}</span>
            <span className="short">{withV0 ? '+v(0)' : '漏 v(0)'}</span>
          </button>
        )}
      </div>
      <svg
        viewBox="0 0 640 334"
        className="w41-chart"
        role="img"
        aria-label={mode === 'ex2' ? '例题 2：分段线性电压 v(t)、电流 i(t) 与储能 w(t)' : '例题 3：分段恒定电流 i(t)、积分电压 v(t) 与储能 w(t)'}
      >
        {body}
      </svg>
      {alarm && (
        <p className={`w41-alarm ${on('rise_test')}`} role="alert" {...hoverProps(['rise_test'])}>
          {alarm}
        </p>
      )}
      <div className="w41-cells">{cells}</div>
    </div>
  );
}

function Cursor({ x, pts }: { x: number; pts: number[] }) {
  const on = useIsLit()('cursor');
  return (
    <g className={`w41-cursor ${on}`}>
      <line x1={x} x2={x} y1={PANELS.v.top} y2={PANELS.w.bot} />
      {pts.map((y, k) => (
        <circle key={k} cx={x} cy={y} r={4} />
      ))}
    </g>
  );
}
