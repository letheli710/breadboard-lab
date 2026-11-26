// Layer "01 2D 复阻抗原理图与元件相量矢量": three panels side by side —
//  1. the frequency-domain circuit (an element R / L / C, act 2's series RLC, act 3's mixed network
//     or the guided example's network) with its impedances written in;
//  2. the rotating phasors V and I (the currents of the two branches too, with the KCL
//     parallelogram, on the mixed network), turning together at a slowed-down e^{jωt}: their angle
//     stays fixed; the dots on the real axis are the instantaneous values Re{V e^{jωt}};
//  3. the impedance plane: Z = R + jX as a vector (R, +jX_L, −jX_C stacked for the series RLC;
//     Z_1 + Z_p = Z_eq for the networks), auto-scaled.
// The ω slider (10 … 10⁵ rad/s, log) changes every reactance live. The guided example's numbers stay
// "?" until the example reaches them (gReveal). On a phone the circuit panel is cropped away (the
// readouts below repeat it).

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { abs, add, arg, cx, EL, EX, exNet, exReadout, mixNet, MIX, num, ohm, pol, rad, rect, RLC, sig, single, W_RANGE, zR, type Cx, type Elem } from './model';
import { Cell, hoverProps, LogSlider, Seg, useClearHoverOnUnmount, useIsLit, useLab, useNarrow, type Lab } from './state';

type V2 = [number, number];

const COL = {
  v: '#dc2626',
  i: '#2563eb',
  ia: '#ea580c',
  ib: '#0d9488',
  z: '#7c3aed',
  r: '#1f2a44',
  xl: '#ea580c',
  xc: '#0d9488',
  z1: '#b45309',
  zp: '#0f766e',
} as const;
type ColKey = keyof typeof COL;

function Markers() {
  return (
    <defs>
      {(Object.keys(COL) as ColKey[]).map((k) => (
        <marker key={k} id={`w52m-${k}`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill={COL[k]} />
        </marker>
      ))}
    </defs>
  );
}

/** an arrow from p to q (svg coordinates) */
function Arrow({
  p,
  q,
  c,
  w = 2.8,
  dash,
  id,
  label,
  lx = 0,
  ly = 0,
  anchor = 'start',
}: {
  p: V2;
  q: V2;
  c: ColKey;
  w?: number;
  dash?: boolean;
  id: string;
  label?: ReactNode;
  lx?: number;
  ly?: number;
  anchor?: 'start' | 'middle' | 'end';
}) {
  const on = useIsLit()(id);
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
  return (
    <g className={`w52-cg ${on}`} {...hoverProps([id])}>
      <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} className="w52-hit" />
      {len > 3 && (
        <line
          x1={p[0]}
          y1={p[1]}
          x2={q[0]}
          y2={q[1]}
          stroke={COL[c]}
          strokeWidth={w}
          strokeDasharray={dash ? '5 3' : undefined}
          markerEnd={`url(#w52m-${c})`}
          className="w52-vec"
        />
      )}
      {label && (
        <text x={q[0] + lx} y={q[1] + ly} className="w52-vl" fill={COL[c]} textAnchor={anchor}>
          {label}
        </text>
      )}
    </g>
  );
}

/* ------------------------------------------------------------- the circuit panel */

const ZIG = (x: number, y0: number, y1: number) => {
  const n = 6;
  const h = (y1 - y0) / n;
  let d = `M ${x} ${y0}`;
  for (let k = 0; k < n; k++) d += ` L ${x + (k % 2 ? -6 : 6)} ${y0 + h * (k + 0.5)}`;
  return `${d} L ${x} ${y1}`;
};
const ZIGH = (x0: number, x1: number, y: number) => {
  const n = 6;
  const w = (x1 - x0) / n;
  let d = `M ${x0} ${y}`;
  for (let k = 0; k < n; k++) d += ` L ${x0 + w * (k + 0.5)} ${y + (k % 2 ? -5 : 5)}`;
  return `${d} L ${x1} ${y}`;
};
const COIL = (x: number, y0: number, y1: number) => {
  const n = 4;
  const h = (y1 - y0) / n;
  let d = `M ${x} ${y0}`;
  for (let k = 0; k < n; k++) d += ` C ${x + 12} ${y0 + h * k} ${x + 12} ${y0 + h * (k + 1)} ${x} ${y0 + h * (k + 1)}`;
  return d;
};
const COILH = (x0: number, x1: number, y: number) => {
  const n = 4;
  const w = (x1 - x0) / n;
  let d = `M ${x0} ${y}`;
  for (let k = 0; k < n; k++) d += ` C ${x0 + w * k} ${y - 12} ${x0 + w * (k + 1)} ${y - 12} ${x0 + w * (k + 1)} ${y}`;
  return d;
};

function Part({ id, children }: { id: string; children: ReactNode }) {
  const on = useIsLit()(id);
  return (
    <g className={`w52-part ${on}`} {...hoverProps([id])} tabIndex={0}>
      {children}
    </g>
  );
}

function Source({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <Part id="el_src">
      <circle cx={x} cy={y} r={17} className="w52-src" />
      <path d={`M ${x - 9} ${y} Q ${x - 4.5} ${y - 10} ${x} ${y} T ${x + 9} ${y}`} className="w52-srcwave" />
      <text x={x + 4} y={40} className="w52-t src">
        {label}
      </text>
    </Part>
  );
}

function CircuitPanel({ lab }: { lab: Lab }) {
  const w = lab.omega;
  const e = lab.elem;
  const zt = (z: Cx) => `${rect(z)} Ω`;
  const loop = (x: number) => <path d={`M 34 133 L 34 50 L ${x} 50 M ${x} 250 L 34 250 L 34 167`} className="w52-wire" />;
  let body: ReactNode;
  if (e === 'R' || e === 'L' || e === 'C') {
    const s = single(e, w);
    const name = e === 'R' ? `R = ${EL.r} Ω` : e === 'L' ? `L = ${EL.l * 1e3} mH` : `C = ${EL.c * 1e6} µF`;
    body = (
      <>
        <polyline points="34,133 34,50 120,50 120,105" className="w52-wire" />
        <polyline points="120,195 120,250 34,250 34,167" className="w52-wire" />
        <Part id="el_elem">
          {e === 'R' && <path d={ZIG(120, 105, 195)} className="w52-el r" />}
          {e === 'L' && <path d={COIL(120, 105, 195)} className="w52-el l" />}
          {e === 'C' && (
            <>
              <line x1={120} y1={105} x2={120} y2={144} className="w52-wire" />
              <line x1={104} y1={144} x2={136} y2={144} className="w52-el c" />
              <line x1={104} y1={156} x2={136} y2={156} className="w52-el c" />
              <line x1={120} y1={156} x2={120} y2={195} className="w52-wire" />
            </>
          )}
          <text x={142} y={140} className={`w52-t ${e.toLowerCase()}`}>
            {e}
          </text>
          <text x={94} y={225} className="w52-t mid">
            {name}
          </text>
          <text x={94} y={278} className={`w52-t eq mid`}>
            Z_{e} = {zt(s.z)}
          </text>
        </Part>
        <Source x={34} y={150} label="12∠30° V" />
      </>
    );
  } else if (e === 'RLC') {
    const zl = cx(0, w * RLC.l);
    const zc = cx(0, -1 / (w * RLC.c));
    body = (
      <>
        {loop(120)}
        <Part id="z_r">
          <path d={ZIG(120, 50, 108)} className="w52-el r" />
          <text x={134} y={82} className="w52-t r">
            {RLC.r} Ω
          </text>
        </Part>
        <Part id="z_xl">
          <path d={COIL(120, 112, 182)} className="w52-el l" />
          <text x={136} y={146} className="w52-t l">
            {rect(zl, 1)}
          </text>
          <text x={136} y={160} className="w52-t small">
            80 mH
          </text>
        </Part>
        <Part id="z_xc">
          <line x1={120} y1={182} x2={120} y2={206} className="w52-wire" />
          <line x1={104} y1={206} x2={136} y2={206} className="w52-el c" />
          <line x1={104} y1={217} x2={136} y2={217} className="w52-el c" />
          <line x1={120} y1={217} x2={120} y2={250} className="w52-wire" />
          <text x={140} y={210} className="w52-t c">
            {rect(zc, 1)}
          </text>
          <text x={140} y={224} className="w52-t small">
            25 µF
          </text>
        </Part>
        <Source x={34} y={150} label="12∠30° V" />
        <text x={86} y={282} className="w52-t eq mid">
          串联 RLC（例题 2.1）
        </text>
      </>
    );
  } else {
    const mix = e === 'mix';
    const m = mixNet(w);
    const g = exReadout(lab.reveal, w);
    const xn = exNet(w);
    body = (
      <>
        <polyline points="26,133 26,50 44,50" className="w52-wire" />
        <Part id={mix ? 'mx_r1' : 'ex_r1'}>
          <path d={ZIGH(44, 72, 50)} className="w52-el r" />
          <text x={58} y={36} className="w52-t r mid">
            {mix ? `R₁ ${MIX.r1} Ω` : `R₁ ${EX.r1} Ω`}
          </text>
        </Part>
        <line x1={72} y1={50} x2={84} y2={50} className="w52-wire" />
        {mix ? (
          <Part id="mx_c1">
            <line x1={86} y1={38} x2={86} y2={62} className="w52-el c" />
            <line x1={94} y1={38} x2={94} y2={62} className="w52-el c" />
            <text x={90} y={78} className="w52-t c mid">
              {rect(cx(0, m.z1.im), 1)}
            </text>
          </Part>
        ) : (
          <Part id="ex_l1">
            <path d={COILH(84, 104, 50)} className="w52-el l" />
            <text x={94} y={74} className="w52-t l mid">
              {lab.reveal >= 1 ? rect(xn.zl1, 1) : '55 mH'}
            </text>
          </Part>
        )}
        <polyline points={mix ? '94,50 160,50 160,120' : '104,50 160,50 160,120'} className="w52-wire" />
        <line x1={118} y1={50} x2={118} y2={96} className="w52-wire" />
        <circle cx={118} cy={50} r={3} className="w52-node" />
        {mix ? (
          <>
            <Part id="mx_r2">
              <path d={ZIG(118, 96, 136)} className="w52-el r" />
              <text x={104} y={120} className="w52-t r end">
                8 Ω
              </text>
            </Part>
            <Part id="mx_l">
              <path d={COIL(118, 142, 192)} className="w52-el l" />
              <text x={104} y={172} className="w52-t l end">
                {rect(cx(0, m.za.im), 1)}
              </text>
            </Part>
            <line x1={118} y1={136} x2={118} y2={142} className="w52-wire" />
            <line x1={118} y1={192} x2={118} y2={250} className="w52-wire" />
            <Part id="mx_c2">
              <line x1={146} y1={120} x2={174} y2={120} className="w52-el c" />
              <line x1={146} y1={130} x2={174} y2={130} className="w52-el c" />
              <text x={160} y={150} className="w52-t c mid">
                {rect(m.zb, 1)}
              </text>
            </Part>
          </>
        ) : (
          <>
            <Part id="ex_r2">
              <path d={ZIG(118, 96, 176)} className="w52-el r" />
              <text x={104} y={140} className="w52-t r end">
                10 Ω
              </text>
            </Part>
            <line x1={118} y1={176} x2={118} y2={250} className="w52-wire" />
            <Part id="ex_c">
              <line x1={146} y1={120} x2={174} y2={120} className="w52-el c" />
              <line x1={146} y1={130} x2={174} y2={130} className="w52-el c" />
              <text x={156} y={150} className="w52-t c small mid">
                {lab.reveal >= 1 ? g.zc.replace(' Ω', '') : '500µF'}
              </text>
            </Part>
          </>
        )}
        <polyline points="160,130 160,250 26,250 26,167" className="w52-wire" />
        <circle cx={118} cy={250} r={3} className="w52-node" />
        <Part id="el_src">
          <circle cx={26} cy={150} r={15} className="w52-src" />
          <path d="M 18 150 Q 22 141 26 150 T 34 150" className="w52-srcwave" />
        </Part>
        <text x={90} y={272} className="w52-t eq mid">
          {mix ? 'V_s = 30∠10° V（例题 3.1）' : 'V_s = 30∠20° V（引导例题）'}
        </text>
        <text x={90} y={288} className="w52-t small mid">
          {mix ? `ω = ${num(w, 0)} rad/s` : `ω = ${num(w, 0)} rad/s · Z_p = ${g.zp}`}
        </text>
      </>
    );
  }
  return (
    <g>
      <rect x={4} y={4} width={172} height={332} rx={8} className="w52-panel" />
      <text x={90} y={24} className="w52-t vtitle mid">
        频域等效电路
      </text>
      <g transform="translate(0 24)">{body}</g>
    </g>
  );
}

/* ------------------------------------------------------------- the phasor panel */

/** panel geometry: the full height on a desktop, a shorter one on a phone (the stage is wide and low) */
interface Geo {
  h: number;
  pc: V2;
  pr: number;
}
const GEO_FULL: Geo = { h: 340, pc: [286, 178], pr: 108 };
const GEO_LOW: Geo = { h: 254, pc: [286, 136], pr: 84 };

function useSpin(): [number, boolean, () => void] {
  const [play, setPlay] = useState(() => !prefersReducedMotion());
  const [th, setTh] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!play) return;
    let last = performance.now();
    let acc = 0;
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      acc += dt;
      if (acc > 1 / 30) {
        setTh((a) => (a + acc * 0.25 * 360) % 360);
        acc = 0;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [play]);
  return [th, play, () => setPlay((p) => !p)];
}

/** a phasor label beside its tip, kept inside the panel */
const side = (q: V2, ly: number) => (q[0] > 326 ? { lx: -6, ly, anchor: 'end' as const } : { lx: 6, ly, anchor: 'start' as const });

const at = (g: Geo, z: Cx, scale: number, th: number): V2 => {
  const PC = g.pc;
  const m = abs(z) * scale;
  const a = ((arg(z) + th) * Math.PI) / 180;
  return [PC[0] + m * Math.cos(a), PC[1] - m * Math.sin(a)];
};

function AngleArc({ g, from, to, th, r = 30, label, id }: { g: Geo; from: number; to: number; th: number; r?: number; label: string; id: string }) {
  const PC = g.pc;
  const on = useIsLit()(id);
  let d = to - from;
  while (d > 180) d -= 360;
  while (d <= -180) d += 360;
  if (Math.abs(d) < 0.5) return null;
  const a0 = ((from + th) * Math.PI) / 180;
  const a1 = ((from + d + th) * Math.PI) / 180;
  const p0: V2 = [PC[0] + r * Math.cos(a0), PC[1] - r * Math.sin(a0)];
  const p1: V2 = [PC[0] + r * Math.cos(a1), PC[1] - r * Math.sin(a1)];
  const am = (a0 + a1) / 2;
  const lp: V2 = [PC[0] + (r + 16) * Math.cos(am), PC[1] - (r + 16) * Math.sin(am)];
  return (
    <g className={`w52-cg ${on}`} {...hoverProps([id])}>
      <path d={`M ${p0[0]} ${p0[1]} A ${r} ${r} 0 ${Math.abs(d) > 180 ? 1 : 0} ${d > 0 ? 0 : 1} ${p1[0]} ${p1[1]}`} className="w52-arc" />
      <text x={lp[0]} y={lp[1] + 4} className="w52-t arc mid">
        {label}
      </text>
    </g>
  );
}

function PhasorPanel({ lab, th, g }: { lab: Lab; th: number; g: Geo }) {
  const PC = g.pc;
  const PR = g.pr;
  const w = lab.omega;
  const e = lab.elem;
  const on = useIsLit();
  let v: Cx;
  let currents: { z: Cx; id: string; c: ColKey; name: string }[];
  let hideI = false;
  if (e === 'mix') {
    const m = mixNet(w);
    v = MIX.vs;
    currents = [
      { z: m.i, id: 'p_i', c: 'i', name: 'I' },
      { z: m.ia, id: 'p_ia', c: 'ia', name: 'I_A' },
      { z: m.ib, id: 'p_ib', c: 'ib', name: 'I_B' },
    ];
  } else if (e === 'ex') {
    v = EX.vs;
    currents = [{ z: exNet(w).i, id: 'p_i', c: 'i', name: 'I' }];
    hideI = lab.reveal < 4;
  } else {
    const s = single(e, w);
    v = s.v;
    currents = [{ z: s.i, id: 'p_i', c: 'i', name: 'I' }];
  }
  const vs = (PR * 0.95) / abs(v);
  const imax = Math.max(...currents.map((c) => abs(c.z)));
  const is = (PR * 0.72) / imax;
  const vp = at(g, v, vs, th);
  const main = currents[0];
  const ip = at(g, main.z, is, th);
  const re = (p: V2) => p[0];
  const showI = !hideI;
  return (
    <g>
      <rect x={182} y={4} width={208} height={g.h - 8} rx={8} className="w52-panel" />
      <text x={286} y={22} className="w52-t vtitle mid">
        相量 V 与 I（同速旋转 e^jωt）
      </text>
      <circle cx={PC[0]} cy={PC[1]} r={PR} className="w52-ring" />
      <line x1={PC[0] - PR - 8} y1={PC[1]} x2={PC[0] + PR + 8} y2={PC[1]} className="w52-axis" />
      <line x1={PC[0]} y1={PC[1] - PR - 8} x2={PC[0]} y2={PC[1] + PR + 8} className="w52-axis" />
      <text x={PC[0] + PR + 2} y={PC[1] - 5} className="w52-t small">
        Re
      </text>
      <text x={PC[0] + 5} y={PC[1] - PR - 2} className="w52-t small">
        Im
      </text>
      {/* KCL parallelogram on the mixed network */}
      {e === 'mix' && (
        <g className={`w52-cg ${on('p_kcl')}`} {...hoverProps(['p_kcl'])}>
          <polyline points={`${at(g, currents[1].z, is, th).join(',')} ${ip.join(',')} ${at(g, currents[2].z, is, th).join(',')}`} className="w52-kcl" />
        </g>
      )}
      {/* instantaneous values: projections on the real axis */}
      <g className="w52-proj">
        <line x1={vp[0]} y1={vp[1]} x2={re(vp)} y2={PC[1]} />
        {showI && <line x1={ip[0]} y1={ip[1]} x2={re(ip)} y2={PC[1]} />}
      </g>
      <circle cx={re(vp)} cy={PC[1]} r={3.5} fill={COL.v} />
      {showI && <circle cx={re(ip)} cy={PC[1]} r={3.5} fill={COL.i} />}
      {showI && <AngleArc g={g} from={arg(main.z)} to={arg(v)} th={th} label={`${num(arg(v) - arg(main.z), 1)}°`} id="p_angle" />}
      <Arrow p={PC} q={vp} c="v" id="p_v" label={e === 'mix' || e === 'ex' ? 'V_s' : 'V'} {...side(vp, -4)} />
      {showI ? (
        currents.map((c) => {
          const q = at(g, c.z, is, th);
          return <Arrow key={c.id} p={PC} q={q} c={c.c} id={c.id} label={c.name} {...side(q, 12)} />;
        })
      ) : (
        <text x={PC[0]} y={PC[1] + PR * 0.6} className="w52-t gd mid">
          I = ? （引导例题第 4 步揭晓）
        </text>
      )}
      <text x={286} y={g.h - 14} className="w52-t small mid">
        {e === 'mix' ? '电流按同一比例缩放 · I = I_A + I_B' : '电压、电流各自缩放 · 夹角 = θ_Z'}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------- the impedance plane */

const ZB = { x0: 404, x1: 586 };

interface Seg2 {
  a: Cx;
  b: Cx;
  c: ColKey;
  id: string;
  label: string;
  dash?: boolean;
}

function ZPanel({ lab, g }: { lab: Lab; g: Geo }) {
  const y1 = g.h - 34;
  const w = lab.omega;
  const e = lab.elem;
  const segs: Seg2[] = [];
  let note: string;
  if (e === 'R' || e === 'L' || e === 'C') {
    const s = single(e, w);
    segs.push({ a: cx(0), b: s.z, c: 'z', id: 'z_vec', label: `Z = ${pol(s.z)} Ω` });
    note = e === 'R' ? '纯实数：θ_Z = 0°' : e === 'L' ? '正虚轴：θ_Z = +90°' : '负虚轴：θ_Z = −90°';
  } else if (e === 'RLC') {
    const r = zR(RLC.r);
    const xl = cx(0, w * RLC.l);
    const xc = cx(0, -1 / (w * RLC.c));
    const z = add(r, xl, xc);
    segs.push({ a: cx(0), b: r, c: 'r', id: 'z_r', label: `R = ${RLC.r}` });
    segs.push({ a: r, b: add(r, xl), c: 'xl', id: 'z_xl', label: `+jX_L = j${sig(xl.im)}` });
    segs.push({ a: add(r, xl), b: z, c: 'xc', id: 'z_xc', label: `−jX_C = −j${sig(-xc.im)}` });
    segs.push({ a: cx(0), b: z, c: 'z', id: 'z_vec', label: `Z = ${pol(z)} Ω` });
    note = z.im > 1e-9 ? 'X > 0：感性' : z.im < -1e-9 ? 'X < 0：容性' : 'X = 0：纯阻性（谐振）';
  } else {
    const mix = e === 'mix';
    const n = mix ? mixNet(w) : exNet(w);
    const rv = mix ? 9 : lab.reveal;
    if (rv >= 1) segs.push({ a: cx(0), b: n.z1, c: 'z1', id: 'z_1', label: `Z₁ = ${rect(n.z1)}` });
    if (rv >= 2) segs.push({ a: n.z1, b: n.zeq, c: 'zp', id: 'z_p', label: `Z_p = ${rect(n.zp)}` });
    if (rv >= 3) segs.push({ a: cx(0), b: n.zeq, c: 'z', id: 'z_eq', label: `Z_eq = ${pol(n.zeq)} Ω` });
    note = rv >= 3 ? (n.zeq.im > 0 ? 'Z_eq 虚部 > 0：整体感性' : 'Z_eq 虚部 < 0：整体容性') : rv === 0 ? '引导例题：每答对一步画上一段' : 'Z_eq = Z₁ + Z_p = ?';
  }
  const y0 = 40 + segs.length * 15 + 8;
  // bounds over every point drawn, origin included
  const pts = [cx(0), ...segs.flatMap((s) => [s.a, s.b])];
  const xs = pts.map((p) => p.re);
  const ys = pts.map((p) => p.im);
  let [lo, hi] = [Math.min(...xs), Math.max(...xs)];
  let [bo, to] = [Math.min(...ys), Math.max(...ys)];
  const span = Math.max(hi - lo, to - bo, 1e-9);
  lo -= span * 0.08;
  hi += span * 0.08;
  bo -= span * 0.08;
  to += span * 0.08;
  const k = Math.min((ZB.x1 - ZB.x0) / Math.max(hi - lo, span * 0.3), (y1 - y0) / Math.max(to - bo, span * 0.3));
  // passive: Re Z ≥ 0, so the origin sits at the left and the room goes to the right
  const cxm = ZB.x0 + 14 - Math.min(0, lo) * k;
  const cym = (y0 + y1) / 2 + ((bo + to) / 2) * k;
  const P = (z: Cx): V2 => [cxm + z.re * k, cym - z.im * k];
  const o = P(cx(0));
  return (
    <g>
      <rect x={396} y={4} width={198} height={g.h - 8} rx={8} className="w52-panel" />
      <text x={495} y={22} className="w52-t vtitle mid">
        复阻抗平面 Z = R + jX
      </text>
      <line x1={ZB.x0 - 4} y1={o[1]} x2={ZB.x1 + 4} y2={o[1]} className="w52-axis" />
      <line x1={o[0]} y1={y0} x2={o[0]} y2={y1} className="w52-axis" />
      <text x={ZB.x1 + 2} y={o[1] - 5} className="w52-t small end">
        R
      </text>
      <text x={o[0] + 4} y={y0 + 10} className="w52-t small">
        jX
      </text>
      {segs.map((s, i) => {
        const p = P(s.a);
        const q = P(s.b);
        return (
          <g key={s.id}>
            <Arrow p={p} q={q} c={s.c} id={s.id} dash={s.dash} w={s.id === 'z_vec' || s.id === 'z_eq' ? 3.2 : 2.6} />
            <ZLegend y={44 + i * 15} c={s.c} id={s.id} label={s.label} />
          </g>
        );
      })}
      <text x={495} y={g.h - 14} className="w52-t eq mid">
        {note}
      </text>
    </g>
  );
}

/** one row of the impedance plane's key: a coloured stroke and the value */
function ZLegend({ y, c, id, label }: { y: number; c: ColKey; id: string; label: string }) {
  const on = useIsLit()(id);
  return (
    <g className={`w52-cg ${on}`} {...hoverProps([id])}>
      <line x1={406} x2={422} y1={y - 4} y2={y - 4} stroke={COL[c]} strokeWidth={3} className="w52-vec" />
      <text x={428} y={y} className="w52-vl key" fill={COL[c]}>
        {label}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------- readouts */

function Readouts({ lab }: { lab: Lab }) {
  const w = lab.omega;
  const e = lab.elem;
  if (e === 'R' || e === 'L' || e === 'C') {
    const s = single(e, w);
    const y = div1(s.z);
    const rel = e === 'R' ? 'V、I 同相' : e === 'L' ? 'V 超前 I 90°' : 'I 超前 V 90°';
    return (
      <div className="w52-cells">
        <Cell
          id="c_x"
          name={e === 'R' ? '电阻 R' : e === 'L' ? '感抗 X_L = ωL' : '容抗 X_C = 1/(ωC)'}
          value={e === 'R' ? `${EL.r} Ω` : ohm(Math.abs(s.x))}
          hint={e === 'R' ? '与 ω 无关' : `ω = ${rad(w)}`}
        />
        <Cell id="z_vec" name="复阻抗 Z" value={`${rect(s.z)} Ω`} hint={`${pol(s.z)} Ω`} />
        <Cell id="p_i" name="电流相量 I = V/Z" value={`${pol(s.i, 3)} A`} />
        <Cell
          id="p_angle"
          name="相位关系"
          value={rel}
          tone={e === 'R' ? '' : e === 'L' ? 'warn' : 'good'}
          hint={e === 'R' ? '夹角 0°' : e === 'L' ? 'ELI：电感中 E 在 I 前' : 'ICE：电容中 I 在 E 前'}
        />
        <Cell id="c_y" name="复导纳 Y = 1/Z" value={`${rect(y, 4)} S`} tone="minor" />
        <Cell id="el_src" name="激励" value="12∠30° V" tone="minor" hint="v(t) = 12cos(ωt + 30°) V" />
      </div>
    );
  }
  if (e === 'RLC') {
    const s = single('RLC', w);
    const y = div1(s.z);
    return (
      <div className="w52-cells">
        <Cell id="z_xl" name="X_L = ωL" value={ohm(w * RLC.l)} />
        <Cell id="z_xc" name="X_C = 1/(ωC)" value={ohm(1 / (w * RLC.c))} />
        <Cell id="z_vec" name="Z = R + jX" value={`${rect(s.z)} Ω`} hint={`${pol(s.z)} Ω`} />
        <Cell id="c_nature" name="负载性质" value={s.x > 1e-6 ? '感性' : s.x < -1e-6 ? '容性' : '纯阻性'} tone={s.x > 1e-6 ? 'warn' : s.x < -1e-6 ? 'good' : ''} />
        <Cell id="c_y" name="Y = G + jB" value={`${rect(y, 4)} S`} hint={`1/R = ${num(1 / RLC.r, 4)} S`} />
        <Cell id="p_i" name="I（V = 12∠30°）" value={`${pol(s.i, 3)} A`} tone="minor" />
      </div>
    );
  }
  if (e === 'mix') {
    const m = mixNet(w);
    return (
      <div className="w52-cells three">
        <Cell id="z_1" name="Z₁ = R₁ + Z_C1" value={`${rect(m.z1)} Ω`} />
        <Cell id="z_p" name="Z_p = Z_A ∥ Z_B" value={`${rect(m.zp)} Ω`} />
        <Cell id="z_eq" name="Z_eq" value={`${pol(m.zeq)} Ω`} hint={`${rect(m.zeq)} Ω`} />
        <Cell id="p_i" name="干路 I" value={`${pol(m.i)} A`} />
        <Cell id="p_ia" name="感性支路 I_A" value={`${pol(m.ia)} A`} />
        <Cell id="p_ib" name="容性支路 I_B" value={`${pol(m.ib)} A`} />
      </div>
    );
  }
  const g = exReadout(lab.reveal, w);
  return (
    <div className="w52-cells three">
      <Cell id="ex_l1" name="Z_L1 · Z_C" value={g.zl1 === '?' ? '? · ?' : `${g.zl1.replace(' Ω', '')} · ${g.zc}`} />
      <Cell id="z_1" name="Z₁ = R₁ + Z_L1" value={g.z1} />
      <Cell id="z_p" name="Z_p = R₂ ∥ Z_C" value={g.zp} />
      <Cell id="z_eq" name="Z_eq" value={g.zeq} />
      <Cell id="p_i" name="I = V_s / Z_eq" value={g.i} />
      <Cell id="c_it" name="i(t)" value={g.it} tone="minor" />
    </div>
  );
}

const div1 = (z: Cx) => {
  const d = z.re * z.re + z.im * z.im;
  return cx(z.re / d, -z.im / d);
};

/* ------------------------------------------------------------- the layer */

const PRESETS: Record<Elem, { v: number; full: string; short: string }[]> = {
  R: [{ v: 4000, full: '4000 例 1.1', short: '4000' }],
  L: [
    { v: 400, full: '400', short: '400' },
    { v: 4000, full: '4000 例 1.1', short: '4000' },
    { v: 40000, full: '40000', short: '40k' },
  ],
  C: [
    { v: 400, full: '400', short: '400' },
    { v: 4000, full: '4000 例 1.1', short: '4000' },
    { v: 40000, full: '40000', short: '40k' },
  ],
  RLC: [
    { v: 707.1, full: '707 谐振', short: '707' },
    { v: 1000, full: '1000 例 2.1', short: '1000' },
  ],
  mix: [{ v: 50, full: '50 例 3.1', short: '50' }],
  ex: [{ v: 200, full: '200 引导例题', short: '200' }],
};

export default function Phasors() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const narrow = useNarrow();
  const [th, play, toggle] = useSpin();
  const g = narrow ? GEO_LOW : GEO_FULL;
  const on = useIsLit();
  return (
    <div className="w52-layer">
      <div className="w52-dock">
        <Seg<Elem>
          label="电路"
          value={lab.elem}
          onChange={(v) => lab.set({ elem: v, omega: PRESETS[v].find((p) => /例/.test(p.full))?.v ?? lab.omega })}
          options={[
            { value: 'R', label: '电阻 R', short: 'R', hover: ['el_elem'] },
            { value: 'L', label: '电感 L', short: 'L', hover: ['el_elem'] },
            { value: 'C', label: '电容 C', short: 'C', hover: ['el_elem'] },
            { value: 'RLC', label: '串联 RLC', short: 'RLC', hover: ['z_vec'] },
            { value: 'mix', label: '混联 例 3.1', short: '混联', hover: ['z_eq'] },
            { value: 'ex', label: '引导例题', short: '例题', hover: ['z_eq'] },
          ]}
        />
        <button className={`w52-fold ${on('p_v', 'p_i')}`} onClick={toggle} aria-pressed={play}>
          {play ? '暂停旋转' : '旋转相量'}
        </button>
        <LogSlider
          label="ω"
          value={lab.omega}
          range={W_RANGE}
          onChange={(v) => lab.set({ omega: v })}
          fmt={rad}
          ids={['c_omega']}
          aria="角频率 ω（rad/s）"
          presets={PRESETS[lab.elem]}
        />
      </div>
      <svg
        viewBox={narrow ? `180 0 416 ${g.h}` : `0 0 600 ${g.h}`}
        className="w52-chart w52-ph"
        role="img"
        aria-label={`复阻抗与相量图：${lab.elem}，ω = ${num(lab.omega, 0)} rad/s`}
      >
        <Markers />
        {!narrow && <CircuitPanel lab={lab} />}
        <PhasorPanel lab={lab} th={th} g={g} />
        <ZPanel lab={lab} g={g} />
      </svg>
      <Readouts lab={lab} />
    </div>
  );
}
