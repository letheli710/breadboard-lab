// Layer "02 实时 Q 值谐振频响曲线": |I(ω)/I_max| (series; = |V(ω)/V_max| parallel) against ω/ω0
// from 0.2 to 2.0, for the Q on the slider (1 … 20) and the Q = 2 / 5 / 10 overlays. The 0.707
// (−3 dB) line, the exact half-power points ω1, ω2 of the live curve, the bandwidth B = ω2 − ω1 =
// ω0/Q and the high-Q approximation ω0 ∓ B/2 (hollow) are marked; the readouts give the exact and
// approximate points, the error, and √(ω1ω2) = ω0. Below Q = 10 an amber strip warns that the
// curve is no longer symmetric about ω0.

import { halfPower, PRESET_Q, Q_RANGE, resp } from './model';
import { Cell, Check, HIDDEN, hoverProps, Slider, useClearHoverOnUnmount, useIsLit, useLab } from './state';

const X0 = 64;
const X1 = 620;
const YT = 30;
const YB = 306;
const UA = 0.2;
const UB = 2;
const X = (u: number) => X0 + ((u - UA) / (UB - UA)) * (X1 - X0);
const Y = (v: number) => YB - (v / 1.05) * (YB - YT);
const HP = 1 / Math.SQRT2;

function curve(q: number): string {
  const us = new Set<number>();
  for (let k = 0; k <= 720; k++) us.add(UA + (k / 720) * (UB - UA));
  const w = 4 / q;
  for (let k = -120; k <= 120; k++) us.add(1 + (k / 120) * w * 0.5);
  return [...us]
    .filter((u) => u >= UA && u <= UB)
    .sort((a, b) => a - b)
    .map((u, k) => `${k ? 'L' : 'M'} ${X(u).toFixed(1)} ${Y(resp(u, q)).toFixed(1)}`)
    .join(' ');
}

const PRESET_CLASS: Record<number, string> = { 2: 'q2', 5: 'q5', 10: 'q10' };

export default function Curves() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const on = useIsLit();
  const { q } = lab;
  const hide = lab.g === 3 || lab.g === 4;
  const h = halfPower(q);
  const togglePreset = (p: number) => lab.set({ presets: lab.presets.includes(p) ? lab.presets.filter((x) => x !== p) : [...lab.presets, p].sort((a, b) => a - b) });
  const yB = Y(HP) + 22;
  return (
    <div className="w58-layer">
      <div className="w58-dock">
        <Slider
          label="品质因数 Q"
          value={q}
          min={Q_RANGE[0]}
          max={Q_RANGE[1]}
          step={0.5}
          onChange={(v) => lab.set({ q: v })}
          text={q.toFixed(1)}
          ids={['q_slider']}
          aria="品质因数 Q"
          tone="q wide"
        />
        <div className="w58-presets" role="group" aria-label="叠加对比曲线">
          {PRESET_Q.map((p) => (
            <button
              key={p}
              className={`${PRESET_CLASS[p]} ${lab.presets.includes(p) ? 'on' : ''}`}
              aria-pressed={lab.presets.includes(p)}
              onClick={() => togglePreset(p)}
              {...hoverProps([`curve_q${p}`])}
            >
              Q={p}
            </button>
          ))}
        </div>
        <Check label="高亮 0.707 (-3 dB) 线与精确带宽 B = ω2 - ω1" short="−3 dB 带宽" value={lab.hp} onChange={(v) => lab.set({ hp: v })} ids={['hp_line', 'bw']} />
      </div>
      <svg viewBox="0 0 640 360" className="w58-chart" role="img" aria-label={`谐振频响曲线，Q = ${q.toFixed(1)}`}>
        <defs>
          <marker id="w58-bw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#7c3aed" />
          </marker>
        </defs>
        <rect x={X0} y={YT} width={X1 - X0} height={YB - YT} className="w58-screen" />
        {[0.5, 1, 1.5].map((u) => (
          <line key={u} x1={X(u)} x2={X(u)} y1={YT} y2={YB} className="w58-grid" />
        ))}
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={Y(v)} y2={Y(v)} className="w58-grid" />
            <text x={X0 - 6} y={Y(v) + 4} className="w58-tick end">
              {v.toFixed(2)}
            </text>
          </g>
        ))}
        {[0.2, 0.5, 1, 1.5, 2].map((u) => (
          <text key={u} x={X(u)} y={YB + 16} className={`w58-tick mid ${u === 1 ? 'axis' : ''}`}>
            {u === 1 ? '1.0 (ω0)' : u.toFixed(1)}
          </text>
        ))}
        <text x={X1} y={YB + 34} className="w58-tick end axis">
          归一化频率 ω/ω0
        </text>
        <text x={X0 - 6} y={YT - 10} className="w58-tick axis">
          |I/Imax|
        </text>
        {lab.presets.map((p) => (
          <g key={p} className={`w58-cg ${on(`curve_q${p}`)}`} {...hoverProps([`curve_q${p}`])}>
            <path d={curve(p)} className={`w58-trace preset ${PRESET_CLASS[p]}`} />
            <path d={curve(p)} className="w58-hit" />
          </g>
        ))}
        {lab.hp && (
          <g className={`w58-cg ${on('hp_line')}`} {...hoverProps(['hp_line'])}>
            <line x1={X0} x2={X1} y1={Y(HP)} y2={Y(HP)} className="w58-ref hp" />
            <text x={X1 - 4} y={Y(HP) - 6} className="w58-lbl hp end halo">
              半功率线 1/√2 ≈ 0.707 (−3 dB)
            </text>
            <text x={X0 - 6} y={Y(HP) + 4} className="w58-tick end hp">
              0.707
            </text>
          </g>
        )}
        <g className={`w58-cg ${on('peak')}`} {...hoverProps(['peak'])}>
          <line x1={X(1)} x2={X(1)} y1={YT} y2={YB} className="w58-ref peak" />
          <circle cx={X(1)} cy={Y(1)} r={4} className="w58-mark" />
        </g>
        <g className={`w58-cg ${on('curve_live')}`} {...hoverProps(['curve_live'])}>
          <path d={curve(q)} className="w58-trace live" />
          <path d={curve(q)} className="w58-hit" />
        </g>
        {lab.hp && !hide && (
          <>
            <g className={`w58-cg ${on('hp_approx')}`} {...hoverProps(['hp_approx'])}>
              {[h.a1, h.a2].map((u, i) => (
                <circle key={i} cx={X(u)} cy={Y(HP)} r={5.5} className="w58-approx" />
              ))}
            </g>
            <g className={`w58-cg ${on('hp_pts')}`} {...hoverProps(['hp_pts'])}>
              {[h.u1, h.u2].map((u, i) => (
                <g key={i}>
                  <line x1={X(u)} x2={X(u)} y1={Y(HP)} y2={YB} className="w58-proj" />
                  <circle cx={X(u)} cy={Y(HP)} r={4} className="w58-hp" />
                  <text x={X(u) + (i ? 3 : -3)} y={YB - 6} className={`w58-lbl hpp halo ${i ? '' : 'end'}`}>
                    {i ? 'ω2' : 'ω1'}
                  </text>
                </g>
              ))}
            </g>
            <g className={`w58-cg ${on('bw')}`} {...hoverProps(['bw'])}>
              {X(h.u2) - X(h.u1) > 14 && <line x1={X(h.u1) + 2} x2={X(h.u2) - 2} y1={yB} y2={yB} className="w58-bwline" markerStart="url(#w58-bw)" markerEnd="url(#w58-bw)" />}
              <text x={Math.min(X1 - 90, Math.max(X0 + 90, (X(h.u1) + X(h.u2)) / 2))} y={yB + 18} className="w58-lbl bw mid halo">
                B = ω0/Q = {(1 / q).toFixed(3)} ω0
              </text>
            </g>
          </>
        )}
        <g className="w58-legend">
          <rect x={X0 + 8} y={YT + 8} width={128} height={20} rx={5} />
          <line x1={X0 + 16} x2={X0 + 36} y1={YT + 18} y2={YT + 18} className="w58-trace live" />
          <text x={X0 + 42} y={YT + 22}>
            当前 Q = {q.toFixed(1)}
          </text>
        </g>
      </svg>
      {q < 10 && !hide && (
        <p className="w58-warn" {...hoverProps(['hp_approx'])}>
          <span className="full">Q &lt; 10：曲线向左偏斜，精确 ω1、ω2 都在近似值（空心圈）右侧——须用精确二次根公式</span>
          <span className="short">Q &lt; 10：曲线左偏，近似（空心圈）误差变大</span>
        </p>
      )}
      <div className="w58-cells">
        <Cell id="bw" name="带宽 B = ω0/Q" value={hide ? HIDDEN : `${(1 / q).toFixed(3)} ω0`} />
        <Cell id="hp_pts" name="精确 ω1/ω0" value={hide ? HIDDEN : h.u1.toFixed(4)} />
        <Cell id="hp_pts" name="精确 ω2/ω0" value={hide ? HIDDEN : h.u2.toFixed(4)} tone="minor" />
        <Cell id="hp_approx" name="近似 1 ∓ 1/(2Q)" value={hide ? HIDDEN : `${h.a1.toFixed(4)} / ${h.a2.toFixed(4)}`} tone="minor" />
        <Cell id="hp_approx" name="ω1 近似误差" value={hide ? HIDDEN : `${h.err1.toFixed(3)} %`} tone={hide ? '' : h.err1 > 1 ? 'bad' : h.err1 > 0.2 ? 'warn' : 'good'} />
        <Cell id="peak" name="√(ω1ω2)/ω0" value={hide ? HIDDEN : h.gm.toFixed(4)} tone="minor" hint="几何平均严格等于 ω0" />
      </div>
    </div>
  );
}
