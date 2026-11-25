// Layer "01 2D 串联/并联谐振电路切换图": the series RLC (voltage source) or the parallel RLC (current
// source), with the frequency u = ω/ω0 and the quality factor Q on sliders. Right: the impedance
// response |Z(u)|/R (series: the valley, parallel: the peak) with the current u marked, and the
// phasor overlay — V_R, V_L, V_C and V_s (series) or I_R, I_L, I_C (parallel), drawn to scale, so
// at u = 1 the two reactive phasors are Q times the source and 180° apart. All values are in units
// of V_m (series) or I_m (parallel), with R = 1 (model.ts seriesPhasors / parallelPhasors).

import type { ReactNode } from 'react';
import { angDeg, mag, parallelPhasors, Q_RANGE, resp, seriesCharacter, seriesPhasors, U_RANGE, type Cx } from './model';
import { Cell, Check, HIDDEN, hoverProps, Seg, Slider, useClearHoverOnUnmount, useIsLit, useLab, useNarrow, type Topo } from './state';

const Sub = ({ b, s }: { b: string; s: string }) => (
  <>
    {b}
    <tspan baselineShift="sub" fontSize="0.72em">
      {s}
    </tspan>
  </>
);

function Part({ id, children }: { id: string; children: ReactNode }) {
  const on = useIsLit()(id);
  return (
    <g className={`w58-part ${on}`} {...hoverProps([id])} tabIndex={0}>
      {children}
    </g>
  );
}

const zig = (x0: number, x1: number, y: number) => {
  const n = 6;
  const w = (x1 - x0) / n;
  let d = `M ${x0} ${y}`;
  for (let k = 0; k < n; k++) d += ` L ${x0 + w * (k + 0.5)} ${y + (k % 2 ? 9 : -9)}`;
  return `${d} L ${x1} ${y}`;
};
const zigV = (x: number, y0: number, y1: number) => {
  const n = 6;
  const h = (y1 - y0) / n;
  let d = `M ${x} ${y0}`;
  for (let k = 0; k < n; k++) d += ` L ${x + (k % 2 ? 9 : -9)} ${y0 + h * (k + 0.5)}`;
  return `${d} L ${x} ${y1}`;
};
const coil = (x0: number, x1: number, y: number) => {
  const n = 4;
  const w = (x1 - x0) / n;
  let d = `M ${x0} ${y}`;
  for (let k = 0; k < n; k++) d += ` Q ${x0 + w * (k + 0.5)} ${y - 18} ${x0 + w * (k + 1)} ${y}`;
  return d;
};
const coilV = (x: number, y0: number, y1: number) => {
  const n = 4;
  const h = (y1 - y0) / n;
  let d = `M ${x} ${y0}`;
  for (let k = 0; k < n; k++) d += ` Q ${x + 18} ${y0 + h * (k + 0.5)} ${x} ${y0 + h * (k + 1)}`;
  return d;
};

function SeriesSchematic() {
  return (
    <g>
      <text x={20} y={30} className="w58-t vtitle">
        串联 RLC：Z = R + j(ωL − 1/ωC)
      </text>
      <path d="M 60 80 L 95 80 M 155 80 L 180 80 M 250 80 L 290 80 L 290 150 M 290 162 L 290 240 L 60 240 L 60 182 M 60 138 L 60 80" className="w58-wire" />
      <Part id="s_src">
        <circle cx={60} cy={160} r={22} className="w58-src" />
        <path d="M 47 160 Q 53.5 148 60 160 T 73 160" className="w58-srcwave" />
        <text x={14} y={156} className="w58-t tag src">
          <Sub b="V" s="s" />
        </text>
        <text x={14} y={172} className="w58-t small">
          ∠0°
        </text>
      </Part>
      <Part id="s_r">
        <path d={zig(95, 155, 80)} className="w58-el r" />
        <text x={118} y={62} className="w58-t tag r">
          R
        </text>
      </Part>
      <Part id="s_l">
        <path d={coil(180, 250, 80)} className="w58-el l" />
        <text x={208} y={56} className="w58-t tag l">
          L
        </text>
        <text x={196} y={102} className="w58-t small l">
          +jωL
        </text>
      </Part>
      <Part id="s_c">
        <path d="M 272 150 L 308 150 M 272 162 L 308 162" className="w58-el c" />
        <text x={314} y={152} className="w58-t tag c">
          C
        </text>
        <text x={296} y={190} className="w58-t small c">
          −j/(ωC)
        </text>
      </Part>
      <Part id="s_i">
        <line x1={68} y1={66} x2={90} y2={66} className="w58-arrow" markerEnd="url(#w58-ar-i)" />
        <text x={66} y={58} className="w58-t cur">
          I(ω)
        </text>
      </Part>
    </g>
  );
}

function ParallelSchematic() {
  return (
    <g>
      <text x={20} y={30} className="w58-t vtitle">
        并联 RLC：Y = 1/R + j(ωC − 1/ωL)
      </text>
      <path
        d="M 50 138 L 50 80 L 280 80 L 280 154 M 280 166 L 280 240 L 50 240 L 50 182 M 130 80 L 130 120 M 130 200 L 130 240 M 205 80 L 205 125 M 205 195 L 205 240"
        className="w58-wire"
      />
      <Part id="p_src">
        <circle cx={50} cy={160} r={22} className="w58-src" />
        <line x1={50} y1={174} x2={50} y2={148} className="w58-srcarrow" markerEnd="url(#w58-ar-src)" />
        <text x={8} y={124} className="w58-t tag src">
          <Sub b="I" s="s" />
        </text>
      </Part>
      <Part id="p_r">
        <path d={zigV(130, 120, 200)} className="w58-el r" />
        <text x={144} y={164} className="w58-t tag r">
          R
        </text>
      </Part>
      <Part id="p_l">
        <path d={coilV(205, 125, 195)} className="w58-el l" />
        <text x={228} y={164} className="w58-t tag l">
          L
        </text>
      </Part>
      <Part id="p_c">
        <path d="M 262 154 L 298 154 M 262 166 L 298 166" className="w58-el c" />
        <text x={302} y={150} className="w58-t tag c">
          C
        </text>
      </Part>
      <Part id="p_v">
        <text x={300} y={96} className="w58-t node">
          +
        </text>
        <text x={300} y={234} className="w58-t node">
          −
        </text>
        <text x={298} y={206} className="w58-t cur">
          v
        </text>
      </Part>
    </g>
  );
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** |Z|/R against u: the series valley or the parallel peak */
function ZCurve({ topo, q, u, box }: { topo: Topo; q: number; u: number; box: Box }) {
  const x0 = box.x + 22;
  const x1 = box.x + box.w - 8;
  const yt = box.y + 30;
  const yb = box.y + box.h - 30;
  const X = (x: number) => x0 + ((x - U_RANGE[0]) / (U_RANGE[1] - U_RANGE[0])) * (x1 - x0);
  const zr = (x: number) => (topo === 'series' ? 1 / resp(x, q) : resp(x, q));
  const top = topo === 'series' ? 1.08 * Math.max(zr(U_RANGE[0]), zr(U_RANGE[1])) : 1.12;
  const Y = (v: number) => yb - (v / top) * (yb - yt);
  const pts = Array.from({ length: 321 }, (_, k) => {
    const x = U_RANGE[0] + (k / 320) * (U_RANGE[1] - U_RANGE[0]);
    return `${k ? 'L' : 'M'} ${X(x).toFixed(1)} ${Y(zr(x)).toFixed(1)}`;
  }).join(' ');
  const on = useIsLit();
  return (
    <g className={`w58-cg ${on('z_curve')}`} {...hoverProps(['z_curve'])}>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={8} className="w58-panel" />
      <text x={box.x + 12} y={box.y + 20} className="w58-t ptitle">
        {topo === 'series' ? '|Z(ω)|/R：串联谷底' : '|Z(ω)|/R：并联尖峰'}
      </text>
      <line x1={x0} y1={yb} x2={x1} y2={yb} className="w58-axis" />
      <line x1={x0} y1={yb} x2={x0} y2={yt - 4} className="w58-axis" />
      <line x1={X(1)} y1={yt - 2} x2={X(1)} y2={yb} className="w58-grid" strokeDasharray="4 4" />
      <line x1={x0} y1={Y(1)} x2={x1} y2={Y(1)} className="w58-grid" strokeDasharray="3 3" />
      <text x={x0 - 6} y={Y(1) + 4} className="w58-tick end">
        R
      </text>
      {topo === 'series' && (
        <text x={x0 + 4} y={yt + 4} className="w58-tick">
          {top.toFixed(top >= 10 ? 0 : 1)} R
        </text>
      )}
      <text x={X(1)} y={yb + 18} className="w58-tick mid">
        ω0
      </text>
      <text x={X(0.5)} y={yb + 18} className="w58-tick">
        0.5ω0
      </text>
      <text x={X(2)} y={yb + 18} className="w58-tick end">
        2ω0
      </text>
      <path d={pts} className={`w58-trace ${topo === 'series' ? 'zs' : 'zp'}`} />
      <path d={pts} className="w58-hit" />
      <circle cx={X(u)} cy={Y(zr(u))} r={5} className="w58-mark" />
    </g>
  );
}

interface Arrow {
  id: string;
  v: Cx;
  cls: string;
  label: ReactNode;
}

/** phasors from one origin, to one scale */
function Phasors({ arrows, ref0, note, box }: { arrows: Arrow[]; ref0: Cx; note: ReactNode; box: Box }) {
  const on = useIsLit();
  const wide = box.w > 400;
  const ox = box.x + box.w * (wide ? 0.52 : 0.38);
  const oy = box.y + box.h / 2 + (wide ? 0 : 4);
  const vh = box.h / 2 - 24;
  const hw = box.x + box.w - 84 - ox;
  const m = Math.max(1, ...arrows.map((a) => Math.abs(a.v.im)), ...arrows.map((a) => Math.abs(a.v.re) * (vh / hw)));
  const k = vh / m;
  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={8} className="w58-panel" />
      <line x1={box.x + 14} y1={oy} x2={box.x + box.w - 14} y2={oy} className="w58-grid" strokeDasharray="3 3" />
      <line x1={ox} y1={box.y + 8} x2={ox} y2={box.y + box.h - 6} className="w58-grid" strokeDasharray="3 3" />
      <text x={box.x + box.w - 14} y={oy - 5} className="w58-tick end">
        Re
      </text>
      <text x={ox - 5} y={box.y + 18} className="w58-tick end">
        Im
      </text>
      <line x1={ox} y1={oy} x2={ox + ref0.re * k} y2={oy - ref0.im * k} className="w58-ph ref" />
      {arrows.map((a) => {
        const x = ox + a.v.re * k;
        const y = oy - a.v.im * k;
        const short = Math.hypot(x - ox, y - oy) < 3;
        const vertical = Math.abs(a.v.im) > Math.abs(a.v.re);
        const lx = vertical ? x + (a.v.re >= 0 ? 10 : -10) : x + (a.v.re >= 0 ? 6 : -6);
        const ly = vertical ? y + (a.v.im > 0 ? 10 : 0) : y + 18;
        return (
          <g key={a.id} className={`w58-cg ${on(a.id)}`} {...hoverProps([a.id])}>
            {!short && <line x1={ox} y1={oy} x2={x} y2={y} className={`w58-ph ${a.cls}`} markerEnd={`url(#w58-ar-${a.cls})`} />}
            <line x1={ox} y1={oy} x2={x} y2={y} className="w58-hit" />
            <text x={lx} y={ly} className={`w58-lbl halo ${a.cls} ${a.v.re >= 0 ? '' : 'end'}`}>
              {a.label}
            </text>
          </g>
        );
      })}
      <circle cx={ox} cy={oy} r={3} className="w58-origin" />
      <text x={box.x + 12} y={box.y + 22} className="w58-t ptitle">
        {wide ? '相量（同一比例）' : '相量'}
      </text>
      {wide && (
        <text x={box.x + 12} y={box.y + box.h - 10} className="w58-t small">
          {note}
        </text>
      )}
    </g>
  );
}

/** the two layouts: wide (desktop, 640 × 440) and narrow (phone, 640 × 300) */
const LAYOUTS: Record<'wide' | 'narrow', { h: number; z: Box; ph: Box }> = {
  wide: { h: 440, z: { x: 346, y: 12, w: 286, h: 232 }, ph: { x: 8, y: 254, w: 624, h: 180 } },
  narrow: { h: 300, z: { x: 346, y: 6, w: 288, h: 136 }, ph: { x: 346, y: 148, w: 288, h: 148 } },
};

const n2 = (x: number) => x.toFixed(2);
const cxText = (z: Cx) => `${n2(z.re)} ${z.im < 0 ? '−' : '+'} j${n2(Math.abs(z.im))}`;

export default function Circuit() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const { topo, q, u } = lab;
  const hide = lab.g === 1 || lab.g === 2 || lab.g === 5;
  const lay = LAYOUTS[useNarrow() ? 'narrow' : 'wide'];
  const sp = seriesPhasors(u, q);
  const pp = parallelPhasors(u, q);
  const kind = seriesCharacter(u);
  const near = kind === 'res';
  const val = (x: number, unit: string) => (hide ? '?' : `${x.toFixed(2)} ${unit}`);
  const arrows: Arrow[] =
    topo === 'series'
      ? [
          { id: 'ph_vr', v: sp.vr, cls: 'r', label: `VR ${val(mag(sp.vr), 'Vm')}` },
          { id: 'ph_vl', v: sp.vl, cls: 'l', label: `VL ${val(mag(sp.vl), 'Vm')}` },
          { id: 'ph_vc', v: sp.vc, cls: 'c', label: `VC ${val(mag(sp.vc), 'Vm')}` },
        ]
      : [
          { id: 'ph_ir', v: pp.ir, cls: 'r', label: `IR ${val(mag(pp.ir), 'Im')}` },
          { id: 'ph_ic', v: pp.ic, cls: 'c', label: `IC ${val(mag(pp.ic), 'Im')}` },
          { id: 'ph_il', v: pp.il, cls: 'l', label: `IL ${val(mag(pp.il), 'Im')}` },
        ];
  const noteS = near ? 'VL 与 VC 等大反向（180°）：相加为 0，VR = Vs' : kind === 'cap' ? 'ω < ω0：XC > XL，容性（电流超前）' : 'ω > ω0：XL > XC，感性（电流滞后）';
  const noteP = near ? 'IL 与 IC 等大反向（180°）：L、C 间环流，IR = Is' : u < 1 ? 'ω < ω0：电感支路电流更大，并联呈感性' : 'ω > ω0：电容支路电流更大，并联呈容性';
  const zr = topo === 'series' ? sp.z : pp.y;
  const theta = topo === 'series' ? angDeg(sp.z) : -angDeg(pp.y);
  const kindText = near ? '谐振·纯阻' : topo === 'series' ? (kind === 'cap' ? '容性' : '感性') : u < 1 ? '感性' : '容性';
  return (
    <div className="w58-layer">
      <div className="w58-dock">
        <Seg<Topo>
          label="拓扑"
          value={topo}
          onChange={(t) => lab.set({ topo: t })}
          options={[
            { value: 'series', label: '串联 RLC（电压源）', short: '串联', hover: ['s_src'] },
            { value: 'parallel', label: '并联 RLC（电流源）', short: '并联', hover: ['p_src'] },
          ]}
        />
        <Check
          label={topo === 'series' ? '叠加 VL/VC 180° 反向抵消相量' : '叠加 IL/IC 180° 反向抵消相量'}
          short="相量"
          value={lab.phasors}
          onChange={(v) => lab.set({ phasors: v })}
          ids={topo === 'series' ? ['ph_vl', 'ph_vc'] : ['ph_il', 'ph_ic']}
        />
        <Slider
          label="ω/ω0"
          value={u}
          min={U_RANGE[0]}
          max={U_RANGE[1]}
          step={0.01}
          onChange={(v) => lab.set({ u: v })}
          text={u.toFixed(2)}
          ids={['u_slider']}
          aria="归一化频率 ω/ω0"
        />
        <Slider
          label="Q"
          value={q}
          min={Q_RANGE[0]}
          max={Q_RANGE[1]}
          step={0.5}
          onChange={(v) => lab.set({ q: v })}
          text={hide ? '?' : q.toFixed(1)}
          ids={['q_slider']}
          aria="品质因数 Q"
          tone="q"
        />
        <button className="w58-fold" onClick={() => lab.set({ u: 1 })} {...hoverProps(['u_slider'])}>
          回到 ω0
        </button>
      </div>
      <div className="w58-sch-wrap">
        <svg viewBox={`0 0 640 ${lay.h}`} className="w58-sch" role="img" aria-label={`${topo === 'series' ? '串联' : '并联'} RLC，ω/ω0 = ${u.toFixed(2)}，${kindText}`}>
          <defs>
            {[
              ['i', '#0284c7'],
              ['src', '#d97706'],
              ['r', '#db2777'],
              ['l', '#ea580c'],
              ['c', '#0284c7'],
            ].map(([k, c]) => (
              <marker key={k} id={`w58-ar-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill={c} />
              </marker>
            ))}
          </defs>
          {topo === 'series' ? <SeriesSchematic /> : <ParallelSchematic />}
          {near && lab.phasors && (
            <g className="w58-cancel">
              <rect x={96} y={192} width={156} height={42} rx={6} />
              <text x={104} y={209}>
                谐振点 ω = ω0：
              </text>
              <text x={104} y={226}>
                {topo === 'series' ? 'VL + VC = 0，|Z| = R' : 'IL + IC = 0，|Z| = R'}
              </text>
            </g>
          )}
          <ZCurve topo={topo} q={q} u={u} box={lay.z} />
          {lab.phasors ? (
            <Phasors arrows={arrows} ref0={{ re: 1, im: 0 }} note={topo === 'series' ? noteS : noteP} box={lay.ph} />
          ) : (
            <g>
              <rect x={lay.ph.x} y={lay.ph.y} width={lay.ph.w} height={lay.ph.h} rx={8} className="w58-panel" />
              <text x={lay.ph.x + 14} y={lay.ph.y + lay.ph.h / 2} className="w58-t small">
                勾选上方“相量”看反向抵消
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="w58-cells">
        <Cell id="r_z" name={topo === 'series' ? 'Z / R' : 'Y·R'} value={hide ? HIDDEN : cxText(zr)} tone="minor" />
        <Cell id="r_kind" name="电路性质" value={kindText} tone={near ? 'good' : ''} hint={`θ = ${theta >= 0 ? '+' : '−'}${Math.abs(theta).toFixed(1)}°`} />
        <Cell id="q_slider" name="品质因数 Q" value={hide ? HIDDEN : q.toFixed(1)} tone="minor" />
        {topo === 'series' ? (
          <>
            <Cell id="ph_vr" name="|VR| = |I|R" value={hide ? HIDDEN : `${n2(mag(sp.vr))} Vm`} tone="minor" />
            <Cell id="ph_vl" name="|VL|" value={hide ? HIDDEN : `${n2(mag(sp.vl))} Vm`} tone={!hide && mag(sp.vl) > 1.5 ? 'bad' : ''} />
            <Cell id="ph_vc" name="|VC|" value={hide ? HIDDEN : `${n2(mag(sp.vc))} Vm`} tone={!hide && mag(sp.vc) > 1.5 ? 'bad' : ''} />
          </>
        ) : (
          <>
            <Cell id="p_v" name="|V| / (Im·R)" value={hide ? HIDDEN : n2(mag(pp.v))} tone="minor" />
            <Cell id="ph_il" name="|IL|" value={hide ? HIDDEN : `${n2(mag(pp.il))} Im`} tone={!hide && mag(pp.il) > 1.5 ? 'bad' : ''} />
            <Cell id="ph_ic" name="|IC|" value={hide ? HIDDEN : `${n2(mag(pp.ic))} Im`} tone={!hide && mag(pp.ic) > 1.5 ? 'bad' : ''} />
          </>
        )}
      </div>
    </div>
  );
}
