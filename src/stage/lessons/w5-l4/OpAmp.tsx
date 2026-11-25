// W5-L4 layer 03 · 交流运放复阻抗增益分析台: act 5's ideal op amp with the feedback branch
// Z_f = R_f ∥ C_f (R1 = 10 kΩ, R_f = 50 kΩ, C_f = 20 nF), as an inverting amplifier
// (A_v = −Z_f/Z_1, a first-order active low-pass) or a non-inverting one (A_v = 1 + Z_f/Z_1).
// A log slider sets ω (10 … 10⁵ rad/s); the readouts give Z_f(jω), A_v (rectangular, |A_v| in
// linear and dB, ∠A_v) and V_o for v_i = 2∠0° V; the plot is |A_v| in dB against log ω with the
// working point, and the −3 dB corner ω_c = 1/(R_f C_f) = 1000 rad/s badged (preview of W5-L9).
// The virtual short / open of the inputs can be highlighted. 2D only, ideal op amp (no rails drawn).

import { BENCH_NAMES } from '../../benchNames';
import { abs, argDeg, fmt, fmtC, fmtP, opamp, scale, type Topo } from './model';
import { Bubble, C, Cap, Cell, Dot, Gnd, Lbl, Obj, P, Res, Seg, Toggle, Wire, useClearHoverOnUnmount, useP } from './parts';
import './w5l4.css';

const LW0 = 1;
const LW1 = 5;

export default function OpAmp() {
  useClearHoverOnUnmount();
  const [w, setW] = useP<number>(P.w, 1000);
  const [topo, setTopo] = useP<Topo>(P.topo, 'inv');
  const [vs, setVs] = useP<boolean>(P.vs, true);
  const o = opamp(w, topo);
  const lg = Math.log10(w);
  const atC = Math.abs(lg - 3) < 0.04;
  const clip = abs(o.Vo) > 7.5;

  return (
    <div className="w54-layer">
      <div className="w54-controls">
        <Seg<Topo>
          label="拓扑"
          value={topo}
          onChange={setTopo}
          options={[
            { id: 'inv', text: '反相 · RC 有源低通', short: '反相' },
            { id: 'noninv', text: '同相 · 一般形式', short: '同相' },
          ]}
        />
        <Toggle on={vs} onChange={setVs}>
          标出虚短 / 虚断
        </Toggle>
      </div>
      <div className="w54-controls">
        <label className="w54-slider wide">
          <span>
            ω = <b>{fmt(w, w < 100 ? 1 : 0)}</b> rad/s
          </span>
          <input
            type="range"
            min={LW0}
            max={LW1}
            step={0.01}
            value={lg}
            onChange={(e) => setW(Math.round(10 ** Number(e.target.value) * 100) / 100)}
            aria-label="角频率 ω（对数）"
          />
        </label>
        <button className="w54-btn" onClick={() => setW(1000)}>
          ω = ω_c
        </button>
      </div>

      <div className="w54-svgwrap">
        <svg viewBox="0 0 440 250" className="w54-svg" role="img" aria-label={`交流${topo === 'inv' ? '反相' : '同相'}运放，ω = ${fmt(w, 0)} rad/s`}>
          <rect x="1" y="1" width="438" height="248" rx="10" className="w54-bg" />
          <Circuit topo={topo} vs={vs} zf={`Z_f = ${fmtC(scale(o.Zf, 1e-3), 2)} kΩ`} gain={`A_v = ${fmtP(o.A, 3, '', 2)}`} />
          <Bode topo={topo} w={w} atC={atC} />
        </svg>
      </div>

      <div className="w54-readout">
        <div className="w54-rgrid stack">
          <Cell id="zf" k="ωR_fC_f" v={fmt(o.x, 3)} />
          <Cell id="av" k="A_v（直角坐标）" v={fmtC(o.A, 3)} tone={C.dcT} />
          <Cell id="av_curve" k="|A_v| · dB" v={`${fmt(abs(o.A), 3)} · ${fmt(o.dB, 2)} dB`} tone={C.w1T} />
          <Cell id="vout" k="V_o（v_i = 2∠0° V）" v={`${fmt(abs(o.Vo), 2)}∠${fmt(argDeg(o.Vo), 1)}° V`} tone={C.ink} />
        </div>
        <div className={`w54-readout-foot${clip ? ' warn' : ''}`}>
          {clip
            ? `理想运放的 |Vₒ| = ${fmt(abs(o.Vo), 2)} V；实验箱上 ${BENCH_NAMES.supply}（±9 V）供电的 LM358 最高只摆到约 +7.5 V，会削波`
            : `理想运放 · ω_c = 1/(R_f C_f) = ${fmt(o.wc, 0)} rad/s`}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------- schematic */

const YN = 74; // − input
const YP = 104; // + input
const XN = 150; // − node
const XO = 300; // output node
const YRF = 46;
const YCF = 20;

function Circuit({ topo, vs, zf, gain }: { topo: Topo; vs: boolean; zf: string; gain: string }) {
  const inv = topo === 'inv';
  return (
    <g>
      {/* feedback: R_f ∥ C_f from the − node to the output */}
      <Obj id="op_cf" box={[200, YCF - 16, 70, 28]}>
        <Wire d={`M ${XN} ${YCF} H ${231.5} M ${238.5} ${YCF} H ${XO}`} />
        <Cap x={235} y={YCF} horiz color={C.cap} />
        <Lbl x={262} y={YCF - 5} s="C_f = 20 nF" color={C.capT} anchor="start" cls="w54-tag" />
      </Obj>
      <Obj id="op_rf" box={[154, YRF - 16, 122, 26]}>
        <Wire d={`M ${XN} ${YRF} H 210 M 260 ${YRF} H ${XO}`} />
        <Res x1={210} y1={YRF} x2={260} y2={YRF} />
        <Lbl x={156} y={YRF - 6} s="R_f = 50 kΩ" color={C.resT} anchor="start" cls="w54-tag" />
      </Obj>
      <Obj id="zf" box={[XN - 6, YCF - 18, XO - XN + 12, YRF - YCF + 34]}>
        <Wire d={`M ${XN} ${YCF} V ${YN}`} />
        <Wire d={`M ${XO} ${YCF} V ${89}`} />
        <Lbl x={XN - 6} y={YCF + 4} s={zf} color={C.zT} anchor="end" cls="w54-tick" />
      </Obj>

      {/* op amp */}
      <Obj id="op_amp" box={[190, 60, 72, 58]}>
        <polygon points={`196,${YN - 16} 196,${YP + 16} 262,89`} fill="#fff" stroke={C.amp} strokeWidth={2.4} />
        <text x={203} y={YN + 4} className="w54-sym" fill={C.dcT}>
          −
        </text>
        <text x={203} y={YP + 5} className="w54-sym" fill={C.dcT}>
          +
        </text>
        <Lbl x={226} y={93} s="理想" color={C.muted} cls="w54-tick" />
      </Obj>
      <Wire d={`M ${XN} ${YN} H 196 M 262 89 H ${XO + 40}`} />
      <Dot x={XO} y={89} />

      {/* input side */}
      {inv ? (
        <>
          <Obj id="vin" box={[8, YN - 26, 46, 40]}>
            <circle cx={30} cy={YN} r={5} fill="#fff" stroke={C.z} strokeWidth={2} />
            <Lbl x={30} y={YN - 12} s="V_i" color={C.zT} />
          </Obj>
          <Obj id="op_r1" box={[60, YN - 24, 64, 34]}>
            <Wire d={`M 35 ${YN} H 70 M 112 ${YN} H ${XN}`} />
            <Res x1={70} y1={YN} x2={112} y2={YN} />
            <Lbl x={91} y={YN - 12} s="R_1 = 10 kΩ" color={C.resT} cls="w54-tag" />
          </Obj>
          <Wire d={`M 196 ${YP} H 176 V 126`} />
          <Gnd x={176} y={126} />
        </>
      ) : (
        <>
          <Obj id="vin" box={[8, YP - 24, 46, 40]}>
            <circle cx={30} cy={YP} r={5} fill="#fff" stroke={C.z} strokeWidth={2} />
            <Lbl x={30} y={YP - 10} s="V_i" color={C.zT} />
          </Obj>
          <Wire d={`M 35 ${YP} H 196`} />
          <Obj id="op_r1" box={[78, YN - 24, 76, 40]}>
            <Wire d={`M ${XN} ${YN} H 138 M 96 ${YN} H 84 V ${YN + 8}`} />
            <Res x1={138} y1={YN} x2={96} y2={YN} />
            <Lbl x={117} y={YN - 12} s="R_1 = 10 kΩ" color={C.resT} cls="w54-tag" />
            <Gnd x={84} y={YN + 8} />
          </Obj>
        </>
      )}
      <Dot x={XN} y={YN} />

      {/* virtual short / open */}
      <Obj id="vgnd" box={[XN - 10, YN - 10, 20, 20]}>
        {vs && (
          <>
            <circle cx={XN} cy={YN} r={6} fill="#fee2e2" stroke={C.warn} strokeWidth={2} />
            <line x1={XN} y1={YN + 6} x2={XN - 20} y2={122} stroke={C.warn} strokeWidth={1} strokeDasharray="2 2" />
            <Lbl x={8} y={133} s={inv ? '虚地 V₋ = 0 · 虚断 I₋ = I₊ = 0' : '虚短 V₋ = V₊ · 虚断 I₋ = I₊ = 0'} color={C.warnT} anchor="start" cls="w54-tick" />
          </>
        )}
      </Obj>

      {/* output */}
      <Obj id="vout" box={[XO + 26, 66, 70, 40]}>
        <circle cx={XO + 40} cy={89} r={5} fill="#fff" stroke={C.w1} strokeWidth={2} />
        <Lbl x={XO + 40} y={78} s="V_o" color={C.w1T} />
      </Obj>
      <Obj id="av" box={[XO - 10, 98, 140, 24]}>
        <Bubble x={XO + 64} y={112} text={gain} color={C.dcT} />
      </Obj>
      <Lbl x={436} y={30} s={inv ? 'A_v = −Z_f / Z_1' : 'A_v = 1 + Z_f / Z_1'} color={C.ink} anchor="end" cls="w54-tag" />
    </g>
  );
}

/* --------------------------------------------------------------------------- Bode |A_v| */

const BX0 = 40;
const BX1 = 428;
const BY0 = 146;
const BY1 = 232;
const DB0 = -30;
const DB1 = 20;

function Bode({ topo, w, atC }: { topo: Topo; w: number; atC: boolean }) {
  const X = (lw: number) => BX0 + ((lw - LW0) / (LW1 - LW0)) * (BX1 - BX0);
  const Y = (db: number) => BY1 - ((db - DB0) / (DB1 - DB0)) * (BY1 - BY0);
  const N = 160;
  const d = Array.from({ length: N + 1 }, (_, i) => {
    const lw = LW0 + ((LW1 - LW0) * i) / N;
    const db = Math.max(DB0, opamp(10 ** lw, topo).dB);
    return `${i ? 'L' : 'M'} ${X(lw).toFixed(1)} ${Y(db).toFixed(1)}`;
  }).join(' ');
  const o = opamp(w, topo);
  const xw = X(Math.log10(w));
  const yw = Y(Math.max(DB0, o.dB));
  const c = opamp(1000, topo);
  return (
    <g>
      <rect x={BX0} y={BY0} width={BX1 - BX0} height={BY1 - BY0} className="w54-plot" />
      {[1, 2, 3, 4, 5].map((k) => (
        <g key={k}>
          <line x1={X(k)} y1={BY0} x2={X(k)} y2={BY1} className="w54-grid" />
          <Lbl x={X(k)} y={BY1 + 11} s={`10${['', '¹', '²', '³', '⁴', '⁵'][k]}`} color={C.muted} cls="w54-tick" />
        </g>
      ))}
      {[20, 0, -20].map((db) => (
        <g key={db}>
          <line x1={BX0} y1={Y(db)} x2={BX1} y2={Y(db)} className={db === 0 ? 'w54-axis0' : 'w54-grid'} />
          <Lbl x={BX0 - 3} y={Y(db) + 3} s={`${db > 0 ? '+' : db < 0 ? '−' : ''}${Math.abs(db)}`} color={C.muted} anchor="end" cls="w54-tick" />
        </g>
      ))}
      <Lbl x={BX0 - 3} y={BY0 + 22} s="dB" color={C.muted} anchor="end" cls="w54-tick" />
      <Lbl x={BX1} y={BY0 - 3} s="ω (rad/s)" color={C.muted} anchor="end" cls="w54-tick" />
      <Lbl x={BX0 + 2} y={BY0 - 3} s="|A_v| 幅频曲线" color={C.ink} anchor="start" cls="w54-tag" />
      <Obj id="av_curve" box={[BX0, BY0, BX1 - BX0, BY1 - BY0]}>
        <path d={d} fill="none" stroke={C.w1} strokeWidth={2.4} className="w54-trace-line" />
      </Obj>
      {/* the corner */}
      <Obj id="wc_badge" box={[X(3) - 8, Y(c.dB) - 8, 16, 16]}>
        <line x1={X(3)} y1={BY0} x2={X(3)} y2={BY1} stroke={C.dc} strokeWidth={1.2} strokeDasharray="4 3" />
        <circle cx={X(3)} cy={Y(c.dB)} r={3.4} fill={C.dc} />
      </Obj>
      {/* the working point */}
      <line x1={xw} y1={BY0} x2={xw} y2={BY1} className="w54-cursor" />
      <circle cx={xw} cy={yw} r={4.4} fill={C.ink} />
      {atC ? (
        <Bubble x={Math.min(BX1 - 80, xw + 82)} y={BY0 + 14} text="−3 dB 截止频率（预告 W5-L9）" color={C.dcT} />
      ) : (
        <Lbl x={xw + (xw > 330 ? -6 : 6)} y={yw - 7} s={`${fmt(o.dB, 2)} dB`} color={C.ink} anchor={xw > 330 ? 'end' : 'start'} cls="w54-tick" />
      )}
    </g>
  );
}
