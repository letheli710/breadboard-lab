// W5-L3 layer 01: act 1's parallel RLC node, i_s(t) = 10cos(ωt + 30°) A, R = 20 Ω, L = 0.1 H,
// C = 0.5 mF. Controls: time domain ↔ phasor domain (the same circuit with its element values, or
// with its impedances), the ω slider (10 … 500 rad/s: jωL and −j/(ωC) follow), and a second source
// 5cos(200t) A that trips the single-frequency guard unless ω = 200 rad/s. Beside the circuit: the
// waveforms i_s(t), v(t) (time domain) or the phasors I_s, V (phasor domain). Under it: Z_L, Z_C,
// Y_tot, V and v(t), solved by model.ts.

import { act1, argDeg, abs, num, pol, rect } from './model';
import {
  C,
  CapV,
  CoilV,
  Dot,
  Gnd,
  ISrc,
  Lbl,
  Obj,
  P_DOM,
  P_F2,
  P_W,
  PhArrow,
  Readout,
  ResV,
  Seg,
  Toggle,
  Wire,
  ZBox,
  boxW,
  useClearHoverOnUnmount,
  useHot,
  useP,
  type Cell,
  type Dom,
} from './parts';
import './w5l3.css';

const W2 = 200; // the second source's ω (rad/s)
const TOP = 52;
const BOT = 176;
const MID = (TOP + BOT) / 2;
const X = { is: 30, r: 98, l: 166, c: 236, is2: 298 };
const NODE = 132;

export default function Layer01() {
  useClearHoverOnUnmount();
  const [dom, setDom] = useP<Dom>(P_DOM, 'phasor');
  const [w, setW] = useP<number>(P_W, 100);
  const [f2, setF2] = useP<boolean>(P_F2, false);
  const r = act1(w);
  const multi = f2 && w !== W2;
  const ph = dom === 'phasor';
  const guard = useHot('a1_guard');
  const xEnd = f2 ? X.is2 : X.c;
  // impedances in the boxes to one decimal (the readouts below keep two)
  const zl = `${rect(r.ZL, 1, true)} Ω`;
  const zc = `${rect(r.ZC, 1)} Ω`;

  const cells: Cell[] = [
    { id: 'a1_l', label: 'Z_L = jωL', text: `${rect(r.ZL, 2, true)} Ω` },
    { id: 'a1_c', label: 'Z_C = 1/(jωC)', text: `${rect(r.ZC)} Ω` },
    { id: 'ro_y', label: 'Y_tot', text: multi ? '—（两个频率）' : `${rect(r.Y, 4)} S`, tone: multi ? 'warn' : undefined },
    { id: 'a1_v', label: 'V = I_s / Y_tot', text: multi ? '—' : `${pol(r.V)} V`, tone: multi ? 'warn' : undefined },
    {
      id: 'ro_vt',
      label: 'v(t)',
      text: multi ? '—' : `${num(abs(r.V))}cos(${w}t ${argDeg(r.V) < 0 ? '−' : '+'} ${num(Math.abs(argDeg(r.V)))}°) V`,
      tone: multi ? 'warn' : undefined,
    },
  ];

  return (
    <div className="w53-layer">
      <div className="w53-controls">
        <Seg<Dom>
          label="域"
          value={dom}
          set={setDom}
          items={[
            { id: 'time', label: '时域原电路', short: '时域' },
            { id: 'phasor', label: '频域相量电路', short: '频域' },
          ]}
        />
        <label className="w53-slider">
          <span>
            ω = <b>{w}</b> rad/s
          </span>
          <input type="range" min={10} max={500} step={10} value={w} onChange={(e) => setW(Number(e.target.value))} aria-label="角频率 ω" />
        </label>
        <Toggle on={f2} set={setF2} label="加第二个电源 5cos(200t) A" short="第二电源" id="a1_is2" />
        <span className={`w53-badge ${multi ? 'bad' : 'good'}${guard.lit ? ' lit' : ''}`} {...guard.on}>
          <span className="full">{multi ? '● 两个频率：不能画同一张相量图' : '● 单一频率：可画相量图'}</span>
          <span className="short">{multi ? '● 两个频率' : '● 单一频率'}</span>
        </span>
      </div>

      <div className="w53-svgwrap">
        <svg viewBox="0 0 480 236" className="w53-svg" role="img" aria-label={`${ph ? '频域相量电路' : '时域原电路'}，ω = ${w} rad/s`}>
          <rect x="1" y="1" width="478" height="234" rx="10" className="w53-bg" />
          <text x={8} y={18} className="w53-tick" fill={C.muted}>
            {ph ? `频域相量电路（ω = ${w} rad/s）` : `时域原电路（ω = ${w} rad/s）`}
          </text>

          {/* rails */}
          <Wire d={`M ${X.is} ${TOP} H ${xEnd}`} />
          <Wire d={`M ${X.is} ${BOT} H ${xEnd}`} />
          <Gnd x={NODE} y={BOT + 14} />
          <Wire d={`M ${NODE} ${BOT} V ${BOT + 6}`} />

          {/* source */}
          <Obj id="a1_is" box={[X.is - 22, TOP + 14, 44, 92]}>
            <Wire d={`M ${X.is} ${TOP} V ${MID - 16} M ${X.is} ${MID + 16} V ${BOT}`} />
            <ISrc x={X.is} y={MID} />
          </Obj>

          {/* R */}
          <Obj id="a1_r" box={[X.r - 26, TOP + 10, 52, 100]}>
            <Wire d={`M ${X.r} ${TOP} V ${MID - 30} M ${X.r} ${MID + 30} V ${BOT}`} />
            {ph ? <ZBox x={X.r} y={MID} w={44} h={60} fill={C.resFill} stroke={C.res} text={C.resT} label="20 Ω" cls="w53-tag" /> : <ResV x={X.r} y1={MID - 30} y2={MID + 30} />}
            {!ph && <TimeTag x={X.r} sym="R" val="20 Ω" color={C.resT} />}
          </Obj>

          {/* L */}
          <Obj id="a1_l" box={[X.l - 28, TOP + 10, 56, 100]}>
            <Wire d={`M ${X.l} ${TOP} V ${MID - 30} M ${X.l} ${MID + 30} V ${BOT}`} />
            {ph ? (
              <ZBox x={X.l} y={MID} w={boxW(zl)} h={60} fill={C.indFill} stroke={C.ind} text={C.indT} label={zl} cls="w53-tag" />
            ) : (
              <CoilV x={X.l} y1={MID - 30} y2={MID + 30} />
            )}
            {!ph && <TimeTag x={X.l} sym="L" val="0.1 H" color={C.indT} />}
          </Obj>

          {/* C */}
          <Obj id="a1_c" box={[X.c - 28, TOP + 10, 56, 100]}>
            {ph ? (
              <>
                <Wire d={`M ${X.c} ${TOP} V ${MID - 30} M ${X.c} ${MID + 30} V ${BOT}`} />
                <ZBox x={X.c} y={MID} w={boxW(zc)} h={60} fill={C.capFill} stroke={C.cap} text={C.capT} label={zc} cls="w53-tag" />
              </>
            ) : (
              <>
                <Wire d={`M ${X.c} ${TOP} V ${MID - 5} M ${X.c} ${MID + 5} V ${BOT}`} />
                <CapV x={X.c} y={MID} />
                <TimeTag x={X.c} sym="C" val="0.5 mF" color={C.capT} />
              </>
            )}
          </Obj>

          {/* second source (ω = 200 rad/s) */}
          {f2 && (
            <Obj id="a1_is2" box={[X.is2 - 22, TOP + 14, 44, 92]}>
              <Wire d={`M ${X.is2} ${TOP} V ${MID - 16} M ${X.is2} ${MID + 16} V ${BOT}`} />
              <ISrc x={X.is2} y={MID} color={multi ? C.warn : C.src} fill={multi ? '#fff1f2' : C.srcFill} />
              <Lbl x={X.is2} y={MID + 34} s={ph ? (multi ? '5∠0°？' : '5∠0° A') : '5cos(200t) A'} color={multi ? C.warnT : C.src} cls="w53-tag" />
            </Obj>
          )}

          {/* node */}
          <Obj id="a1_v" box={[NODE - 34, TOP - 30, 68, 38]}>
            <Dot x={NODE} y={TOP} color="#dc2626" />
            {ph ? <Lbl x={NODE} y={TOP - 10} s="V（相量）" color="#b91c1c" /> : <Lbl x={NODE} y={TOP - 10} s="v(t)" color="#b91c1c" />}
          </Obj>

          {/* source value */}
          <Lbl x={8} y={222} anchor="start" s={ph ? 'I_s = 10∠30° A' : `i_s(t) = 10cos(${w}t + 30°) A`} color={C.src} />

          {/* right: waveforms or phasors */}
          <g transform="translate(20 0)">
            <Obj id="a1_plot" box={[300, 22, 154, 206]}>
              <rect x={302} y={24} width={150} height={202} rx={8} className="w53-plot" />
              {multi ? <MultiFreq /> : ph ? <Phasors r={r} /> : <Waves r={r} />}
            </Obj>
          </g>
        </svg>
      </div>

      <div className="w53-readout">
        <div className="w53-rgrid five">
          {cells.map((c, i) => (
            <Readout key={i} {...c} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** time-domain element tag beside / under a branch: the symbol, then its value */
function TimeTag({ x, sym, val, color }: { x: number; sym: string; val: string; color: string }) {
  return (
    <>
      <Lbl x={x + 16} y={MID - 20} s={sym} color={color} cls="w53-lbl" anchor="start" />
      <Lbl x={x} y={MID + 46} s={val} color={color} cls="w53-tag" />
    </>
  );
}

type R1 = ReturnType<typeof act1>;

/** I_s and V on one complex plane (I_s to a fixed length, V scaled: 200 V = full length) */
function Phasors({ r }: { r: R1 }) {
  const ox = 377;
  const oy = 118;
  const s = (z: { re: number; im: number }, len: number) => {
    const m = abs(z);
    return { re: (z.re / m) * len, im: (z.im / m) * len };
  };
  const vLen = Math.max(8, (64 * abs(r.V)) / 200);
  const d = argDeg(r.V) - argDeg(r.Is);
  return (
    <g>
      <line x1={310} y1={oy} x2={446} y2={oy} className="w53-axis" />
      <line x1={ox} y1={44} x2={ox} y2={192} className="w53-axis" />
      <text x={446} y={oy - 4} className="w53-tick" textAnchor="end" fill={C.muted}>
        Re
      </text>
      <text x={ox + 4} y={52} className="w53-tick" fill={C.muted}>
        Im
      </text>
      <PhArrow cx0={ox} cy0={oy} z={s(r.Is, 40)} color={C.src} label="I_s" />
      <PhArrow cx0={ox} cy0={oy} z={s(r.V, vLen)} color="#dc2626" label="V" />
      <text x={377} y={40} className="w53-tick" textAnchor="middle" fill={C.ink}>
        相量图（逆时针为超前）
      </text>
      <Lbl x={377} y={208} s={`V 比 I_s ${d >= 0 ? '超前' : '滞后'} ${num(Math.abs(d), 1)}°`} color={C.ink} cls="w53-tag" />
      <Lbl x={377} y={221} s={`|V| = ${num(abs(r.V))} V`} color="#b91c1c" cls="w53-tag" />
    </g>
  );
}

/** two periods of i_s(t) (fixed height) and v(t) (scaled: 200 V = full height) */
function Waves({ r }: { r: R1 }) {
  const x0 = 310;
  const x1 = 446;
  const y0 = 120;
  const n = 120;
  const path = (amp: number, deg: number) => {
    let d = '';
    for (let k = 0; k <= n; k++) {
      const t = (k / n) * 4 * Math.PI; // ωt over two periods
      const x = x0 + ((x1 - x0) * k) / n;
      const y = y0 - amp * Math.cos(t + (deg * Math.PI) / 180);
      d += `${k ? ' L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  };
  const vAmp = Math.max(4, (66 * abs(r.V)) / 200);
  return (
    <g>
      <line x1={x0} y1={y0} x2={x1} y2={y0} className="w53-axis" />
      <text x={x1} y={y0 - 4} className="w53-tick" textAnchor="end" fill={C.muted}>
        ωt
      </text>
      <path d={path(34, 30)} className="w53-trace" stroke={C.src} />
      <path d={path(vAmp, argDeg(r.V))} className="w53-trace" stroke="#dc2626" />
      <text x={377} y={40} className="w53-tick" textAnchor="middle" fill={C.ink}>
        两个周期的波形
      </text>
      <Lbl x={312} y={208} anchor="start" s="— i_s(t)" color={C.src} cls="w53-tag" />
      <Lbl x={312} y={221} anchor="start" s={`— v(t)，峰值 ${num(abs(r.V))} V`} color="#b91c1c" cls="w53-tag" />
    </g>
  );
}

function MultiFreq() {
  return (
    <g>
      <text x={377} y={56} className="w53-lbl" textAnchor="middle" fill={C.warnT}>
        同频红线
      </text>
      {[
        'ω 与 200 rad/s 两个频率：',
        'jωL 不是同一个数，',
        'e^(jω₁t) 与 e^(jω₂t)',
        '也约不掉。',
        '',
        '不能画在同一张相量图上，',
        '留给 W5-L4 叠加定理：',
        '逐个频率建相量模型，',
        '还原到时域再相加。',
      ].map((t, i) => (
        <text key={i} x={377} y={82 + i * 15} className="w53-tag" textAnchor="middle" fill={i < 4 ? C.warnT : C.ink}>
          {t}
        </text>
      ))}
    </g>
  );
}
