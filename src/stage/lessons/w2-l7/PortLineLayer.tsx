// Layer "02 戴维南↔诺顿端口特性线": the port line v = V_Th − R_Th·i in the (i, v) plane — its
// v-intercept V_Th (open circuit), its i-intercept I_N (short circuit), slope −R_Th — and the
// load line v = R_L·i; the R_L slider moves the load line and the operating point Q (I_L, V_L).
// The inset shows the same port as the Thevenin model (V_Th in series with R_Th) or the Norton
// model (I_N in parallel with R_N = R_Th, with the current split I_N = i_RN + I_L).

import type { ReactNode } from 'react';
import { useStageParam } from '../../stageStore';
import { CASE_OPTIONS, Chip, hov, RevealButton, Seg, Slider, useCase, useClearHoverOnUnmount, useIsLit, useReveal, useRl } from './common';
import { CASES, equivalent, loadPoint, num } from './model';

const L = 58;
const R = 495;
const T = 34;
const B = 262;

function niceStep(x: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(x)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= x) return m * p;
  return 10 * p;
}

function Obj({ id, className = '', children }: { id: string; className?: string; children: ReactNode }) {
  const isLit = useIsLit();
  return (
    <g className={`w27-obj ${className} ${isLit(id) ? 'lit' : ''}`} {...hov([id])}>
      {children}
    </g>
  );
}

function Inset({ model, vth, rth, iN, rl, il, vl }: { model: 'thev' | 'norton'; vth: number; rth: number; iN: number; rl: number; il: number; vl: number }) {
  const x0 = 302;
  const y0 = 28;
  const yt = y0 + 38;
  const yb = y0 + 86;
  const xa = x0 + 128;
  const xl = x0 + 172;
  return (
    <g className="w27-inset">
      <rect x={x0 - 6} y={y0 - 2} width={R - x0 + 12} height={98} rx={8} className="frame" />
      <text x={x0 + 2} y={y0 + 12} className="w27-inset-t">
        {model === 'thev' ? '戴维南视图：V_Th 串联 R_Th' : '诺顿视图：I_N 并联 R_N'}
      </text>
      {model === 'thev' ? (
        <Obj id="hl_thev" className="model">
          <path
            d={`M ${x0 + 18} ${yt + 13} V ${yt} H ${x0 + 48} M ${x0 + 92} ${yt} H ${xl} V ${yt + 10} M ${xl} ${yb - 10} V ${yb} H ${x0 + 18} V ${yb - 13}`}
            className="w27-wire"
          />
          <circle cx={x0 + 18} cy={(yt + yb) / 2} r={13} className="srcbody" />
          <text x={x0 + 18} y={(yt + yb) / 2 - 2} className="w27-mini" textAnchor="middle">
            +
          </text>
          <text x={x0 + 18} y={(yt + yb) / 2 + 10} className="w27-mini" textAnchor="middle">
            −
          </text>
          <text x={x0 + 36} y={(yt + yb) / 2 + 4} className="w27-mini v">
            {num(vth)} V
          </text>
          <rect x={x0 + 48} y={yt - 7} width={44} height={14} rx={2} className="rbody" />
          <text x={x0 + 70} y={yt - 11} className="w27-mini r" textAnchor="middle">
            R_Th={num(rth)}Ω
          </text>
        </Obj>
      ) : (
        <Obj id="hl_norton" className="model">
          <path
            d={`M ${x0 + 18} ${yt + 13} V ${yt} H ${xl} V ${yt + 10} M ${xl} ${yb - 10} V ${yb} H ${x0 + 18} V ${yb - 13} M ${x0 + 80} ${yt} V ${yt + 9} M ${x0 + 80} ${yb - 9} V ${yb}`}
            className="w27-wire"
          />
          <circle cx={x0 + 18} cy={(yt + yb) / 2} r={13} className="srcbody" />
          <path d={`M ${x0 + 18} ${(yt + yb) / 2 + 8} V ${(yt + yb) / 2 - 3}`} className="w27-mini-arrow" />
          <path d={`M ${x0 + 18} ${(yt + yb) / 2 - 9} l -4 7 h 8 z`} className="w27-mini-head" />
          <text x={x0 + 36} y={(yt + yb) / 2 - 4} className="w27-mini v">
            I_N
          </text>
          <text x={x0 + 36} y={(yt + yb) / 2 + 9} className="w27-mini v">
            {num(iN)} A
          </text>
          <rect x={x0 + 73} y={yt + 9} width={14} height={yb - yt - 18} rx={2} className="rbody" />
          <text x={x0 + 92} y={(yt + yb) / 2 - 2} className="w27-mini r">
            R_N={num(rth)}Ω
          </text>
          <text x={x0 + 92} y={(yt + yb) / 2 + 11} className="w27-mini i">
            i={num(vl / rth, 3)}A
          </text>
        </Obj>
      )}
      <circle cx={xa} cy={yt} r={3.5} className="w27-term" />
      <circle cx={xa} cy={yb} r={3.5} className="w27-term" />
      <Obj id="hl_load" className="model">
        <rect x={xl - 6} y={yt + 10} width={12} height={yb - yt - 20} rx={2} className="lbody" />
        <text x={xl + 10} y={(yt + yb) / 2 - 2} className="w27-mini l">
          R_L
        </text>
        <text x={xl + 10} y={(yt + yb) / 2 + 11} className="w27-mini l">
          {rl}Ω
        </text>
      </Obj>
      <text x={(xa + xl) / 2 - 4} y={yt - 5} className="w27-mini i" textAnchor="middle">
        I_L={num(il, 3)}A
      </text>
    </g>
  );
}

export default function PortLineLayer() {
  useClearHoverOnUnmount();
  const [cid, setCase] = useCase();
  const [rl, setRl] = useRl();
  const [model, setModel] = useStageParam<'thev' | 'norton'>('model', 'thev');
  const e = equivalent(CASES[cid]);
  const p = loadPoint(e, rl);
  const rv = useReveal(cid);
  const iStep = niceStep((e.iN * 1.12) / 5);
  const vStep = niceStep((e.vth * 1.15) / 5);
  const iMax = Math.ceil((e.iN * 1.12) / iStep) * iStep;
  const vMax = Math.ceil((e.vth * 1.15) / vStep) * vStep;
  const x = (i: number) => L + (i / iMax) * (R - L);
  const y = (v: number) => B - (v / vMax) * (B - T);
  const iTicks = Array.from({ length: Math.round(iMax / iStep) + 1 }, (_, k) => k * iStep);
  const vTicks = Array.from({ length: Math.round(vMax / vStep) + 1 }, (_, k) => k * vStep);
  // the load line runs a little past Q (enough to read as a line, short of the inset)
  let ie = p.il * 1.25;
  let ve = p.vl * 1.25;
  if (ve > vMax) {
    ie = vMax / rl;
    ve = vMax;
  }
  if (rl === 0) {
    ie = Math.min(iMax, e.iN * 1.08);
    ve = 0;
  }
  const slopeAt = 0.62;
  return (
    <div className="w27-layer">
      <div className="w27-ctrl">
        <div className="w27-row">
          <Seg
            label="模型视图"
            value={model}
            onChange={setModel}
            options={[
              { value: 'thev', label: '戴维南视图 (V_Th 串联 R_Th)', short: '戴维南', hover: ['hl_thev'] },
              { value: 'norton', label: '诺顿视图 (I_N 并联 R_N)', short: '诺顿', hover: ['hl_norton'] },
            ]}
            className="small"
          />
          <Seg label="电路切换" value={cid} options={CASE_OPTIONS} onChange={setCase} className="small" />
        </div>
        <Slider label="负载 R_L" value={rl} min={0} max={50} step={1} unit="Ω" onChange={setRl} hover={['vi_load']} />
      </div>
      <div className="w27-sch-wrap">
        {rv.masked && (
          <div className="w27-masked">
            <RevealButton onClick={rv.show} />
          </div>
        )}
        <svg viewBox="0 0 520 296" className="w27-sch w27-plot" role="img" aria-label="端口 v–i 特性直线与负载线">
          {vTicks.map((v) => (
            <g key={`v${v}`}>
              <line x1={L} x2={R} y1={y(v)} y2={y(v)} className="w27-grid" />
              <text x={L - 6} y={y(v) + 4} className="w27-tick" textAnchor="end">
                {num(v)}
              </text>
            </g>
          ))}
          {iTicks.map((i) => (
            <g key={`i${i}`}>
              <line x1={x(i)} x2={x(i)} y1={T} y2={B} className="w27-grid v" />
              <text x={x(i)} y={B + 15} className="w27-tick" textAnchor="middle">
                {num(i)}
              </text>
            </g>
          ))}
          <path d={`M ${L} ${B} H ${R + 8} M ${L} ${B} V ${T - 10}`} className="w27-axis" />
          <path d={`M ${R + 14} ${B} l -8 -4 v 8 z M ${L} ${T - 16} l -4 8 h 8 z`} className="w27-axis-head" />
          <text x={R + 4} y={B + 30} className="w27-tick axis" textAnchor="end">
            i (A)
          </text>
          <text x={L + 8} y={T - 8} className="w27-tick axis">
            v (V)
          </text>

          <Obj id="vi_line" className="line">
            <line x1={x(0)} y1={y(e.vth)} x2={x(e.iN)} y2={y(0)} className="hit" />
            <line x1={x(0)} y1={y(e.vth)} x2={x(e.iN)} y2={y(0)} className="src" />
          </Obj>
          <Obj id="vi_slope" className="slope">
            <text x={x(e.iN * slopeAt) + 10} y={y(e.vth * (1 - slopeAt)) - 10} className="w27-lbl src">
              斜率 = −R_Th = −{num(e.rth)} Ω
            </text>
          </Obj>
          <Obj id="vi_load" className="loadline">
            <line x1={x(0)} y1={y(0)} x2={x(ie)} y2={y(ve)} className="hit" />
            <line x1={x(0)} y1={y(0)} x2={x(ie)} y2={y(ve)} className="ll" />
            <text
              x={rl === 0 ? x(e.iN * 0.5) : x(p.il * 0.45) + 9}
              y={rl === 0 ? y(0) - 8 : y(p.vl * 0.45) + 6}
              className="w27-lbl load"
              textAnchor={rl === 0 ? 'middle' : 'start'}
            >
              负载线 R_L = {rl} Ω
            </text>
          </Obj>
          <Obj id="vi_q" className="q">
            <path d={`M ${x(p.il)} ${y(p.vl)} V ${B} M ${x(p.il)} ${y(p.vl)} H ${L}`} className="proj" />
            <circle cx={x(p.il)} cy={y(p.vl)} r={6} className="dot" />
            <text x={x(p.il) + 10} y={y(p.vl) + (p.vl > e.vth * 0.8 ? 18 : 4)} className="w27-lbl q">
              工作点 Q ({num(p.il, 3)} A, {num(p.vl)} V)
            </text>
          </Obj>
          <Obj id="vi_vth" className="icpt">
            <circle cx={x(0)} cy={y(e.vth)} r={6} className="dot vth" />
            <text x={x(0) + 10} y={y(e.vth) - 8} className="w27-lbl voc">
              开路纵截距 V_Th = {num(e.vth)} V
            </text>
          </Obj>
          <Obj id="vi_in" className="icpt">
            <circle cx={x(e.iN)} cy={y(0)} r={6} className="dot in" />
            <text x={x(e.iN)} y={B - 12} className="w27-lbl in" textAnchor="middle">
              短路横截距 I_N = {num(e.iN)} A
            </text>
          </Obj>
          <Inset model={model} vth={e.vth} rth={e.rth} iN={e.iN} rl={rl} il={p.il} vl={p.vl} />
        </svg>
      </div>
      <div className="w27-chips">
        <Chip ids={['vi_q']} k="I_L" v={`${num(p.il, 3)} A`} />
        <Chip ids={['vi_q']} k="V_L" v={`${num(p.vl)} V`} />
        <Chip ids={['vi_q']} k="P_L" v={`${num(p.il * p.vl)} W`} />
        {model === 'norton' && <Chip ids={['hl_norton']} k="I_N = i_RN + I_L" v={`${num(p.vl / e.rth, 3)} + ${num(p.il, 3)} A`} className="wide" />}
      </div>
    </div>
  );
}
