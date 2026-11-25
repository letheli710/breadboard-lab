// Layer "01 2D 积分器/微分器切换原理图": the inverting topology with a one-click switch between the
// ideal integrator (R in, C feedback), the lossy integrator (+ R_f across C), the ideal
// differentiator (C in, R feedback) and the practical differentiator (+ R_s before C). The virtual
// ground v− = 0 V breathes; dashes run along the input and feedback branches (the same current:
// i_− = 0), drawn for v_i > 0. Under the drawing, the mode's formula and its numbers (RC, f_c,
// f_b, |A_max|, the offset drift). While the guided example runs, R_f's value stays a question.

import { Tex } from '../../StageText';
import { aIdeal, aMax, driftRate, fb, fc, fmtF, isInt, lossyDc, MODE_LABEL, type Mode, RC, tSat } from './model';
import { Cell, hides, hoverProps, Seg, useClearHoverOnUnmount, useIsLit, useScope } from './state';

const MODES: Mode[] = ['int', 'lossy', 'diff', 'pdiff'];

const FORMULA: Record<Mode, string> = {
  int: String.raw`v_o(t) = -\frac{1}{RC}\int_0^t v_i\,d\tau + v_o(0)`,
  lossy: String.raw`f \gg f_c:\ v_o \approx -\frac{1}{RC}\int v_i\,d\tau,\quad V_{o,\text{DC}} = \Big(1+\frac{R_f}{R}\Big)V_{OS}`,
  diff: String.raw`v_o(t) = -RC\,\frac{dv_i(t)}{dt}`,
  pdiff: String.raw`f \ll f_b:\ v_o \approx -RC\frac{dv_i}{dt},\quad |A|_{f \gg f_b} \to \frac{R}{R_s}`,
};

/** zigzag resistor between x1 and x2 at height y */
function zig(x1: number, x2: number, y: number) {
  const n = 6;
  const w = (x2 - x1) / n;
  let d = `M${x1} ${y}`;
  for (let i = 0; i < n; i++) d += ` L${x1 + w * (i + 0.5)} ${y + (i % 2 ? 9 : -9)}`;
  return `${d} L${x2} ${y}`;
}

function Res({ id, x1, x2, y, name, val, cls = '' }: { id: string; x1: number; x2: number; y: number; name: string; val: string; cls?: string }) {
  const on = useIsLit()(id);
  return (
    <g className={`w43-part ${on}`} {...hoverProps([id])} tabIndex={0} data-hl={id}>
      <path d={`M${x1 - 1} ${y}H${x1}`} className="w43-wire" />
      <path d={zig(x1, x2, y)} className={`w43-zig ${cls}`} />
      <path d={zig(x1, x2, y)} className="w43-hit" />
      <text x={(x1 + x2) / 2} y={y - 16} className={`w43-name mid ${cls}`}>
        {name}
      </text>
      <text x={(x1 + x2) / 2} y={y + 26} className="w43-val mid">
        {val}
      </text>
    </g>
  );
}

function Cap({ id, x, y, name, val }: { id: string; x: number; y: number; name: string; val: string }) {
  const on = useIsLit()(id);
  return (
    <g className={`w43-part ${on}`} {...hoverProps([id])} tabIndex={0} data-hl={id}>
      <line x1={x - 6} x2={x - 6} y1={y - 17} y2={y + 17} className="w43-plate" />
      <line x1={x + 6} x2={x + 6} y1={y - 17} y2={y + 17} className="w43-plate" />
      <rect x={x - 16} y={y - 20} width={32} height={40} className="w43-hitbox" />
      <text x={x} y={y - 24} className="w43-name mid cap">
        {name}
      </text>
      <text x={x} y={y + 34} className="w43-val mid">
        {val}
      </text>
    </g>
  );
}

function Flow({ id, d, label, lx, ly }: { id: string; d: string; label: string; lx: number; ly: number }) {
  const on = useIsLit()(id);
  return (
    <g className={`w43-part ${on}`} {...hoverProps([id])} tabIndex={0} data-hl={id}>
      <path d={d} className="w43-flow" />
      <text x={lx} y={ly} className="w43-cur">
        {label}
      </text>
    </g>
  );
}

export default function Schematic() {
  useClearHoverOnUnmount();
  const s = useScope();
  const on = useIsLit();
  const hide = hides(s);
  const mode = s.mode;
  const int = isInt(mode);
  const set = (m: Mode) => s.set({ mode: m, scn: 'free', wave: isInt(m) ? (s.wave === 'tri' ? 'square' : s.wave) : s.wave === 'square' ? 'tri' : s.wave });
  // geometry
  const yIn = 200;
  const nodeX = 250;
  const yFb = 120;
  const yRf = 62;
  const outX = 470;
  const inId = int ? 'i_r' : 'i_c';
  const fbId = int ? 'i_c' : 'i_r';
  return (
    <div className="w43-layer">
      <div className="w43-dock">
        <div className="w43-row">
          <Seg label="电路" value={mode} set={set} opts={MODES.map((m) => ({ v: m, full: MODE_LABEL[m][0], short: MODE_LABEL[m][1] }))} hl={['opamp']} />
        </div>
      </div>
      <div className="w43-sch-wrap">
        <svg viewBox="0 0 640 320" className="w43-sch" role="img" aria-label={`${MODE_LABEL[mode][0]}原理图：反相端虚地 v− = 0 V`}>
          <text x={16} y={22} className="w43-title">
            {MODE_LABEL[mode][0]} · 同相端接地，反相端虚地
          </text>
          {/* input terminal */}
          <g className={`w43-part ${on('vi')}`} {...hoverProps(['vi'])} tabIndex={0} data-hl="vi">
            <circle cx={36} cy={yIn} r={6} className="w43-term in" />
            <text x={30} y={yIn - 14} className="w43-name in">
              v_i(t)
            </text>
          </g>
          {/* input branch */}
          {int ? (
            <>
              <path d={`M42 ${yIn}H110 M190 ${yIn}H${nodeX}`} className="w43-wire" />
              <Res id="r_in" x1={110} x2={190} y={yIn} name="R" val="10 kΩ" cls="r" />
            </>
          ) : mode === 'diff' ? (
            <>
              <path d={`M42 ${yIn}H144 M156 ${yIn}H${nodeX}`} className="w43-wire" />
              <Cap id="c_in" x={150} y={yIn} name="C" val="100 nF" />
            </>
          ) : (
            <>
              <path d={`M42 ${yIn}H70 M130 ${yIn}H174 M186 ${yIn}H${nodeX}`} className="w43-wire" />
              <Res id="rs" x1={70} x2={130} y={yIn} name="R_s" val="1 kΩ" cls="rs" />
              <Cap id="c_in" x={180} y={yIn} name="C" val="100 nF" />
            </>
          )}
          <Flow id={inId} d={`M${int ? 200 : 196} ${yIn - 12}H${nodeX - 10}`} label={int ? 'i_R' : 'i_C'} lx={int ? 204 : 200} ly={yIn - 20} />
          {/* feedback */}
          <path d={`M${nodeX} ${yIn}V${yFb}H330 M390 ${yFb}H${outX}V225`} className="w43-wire" />
          {int ? <Cap id="c_fb" x={360} y={yFb} name="C" val="100 nF" /> : <Res id="r_fb" x1={330} x2={390} y={yFb} name="R" val="10 kΩ" cls="r" />}
          {int && <path d={`M330 ${yFb}H354 M366 ${yFb}H390`} className="w43-wire" />}
          {mode === 'lossy' && (
            <>
              <path d={`M${nodeX} ${yFb}V${yRf}H320 M400 ${yRf}H${outX}V${yFb}`} className="w43-wire" />
              <Res id="rf" x1={320} x2={400} y={yRf} name="R_f" val={hide.rf ? '= ?' : '100 kΩ'} cls="rf" />
            </>
          )}
          <Flow id={fbId} d={`M${nodeX + 16} ${yFb - 14}H316`} label={int ? 'i_C' : 'i_R'} lx={nodeX + 18} ly={yFb - 20} />
          {/* op amp */}
          <g className={`w43-part ${on('opamp', 'chip_lm358')}`} {...hoverProps(['opamp'])} tabIndex={0} data-hl="opamp">
            <path d={`M${nodeX} ${yIn}H300`} className="w43-wire" />
            <polygon points="300,180 300,270 390,225" className="w43-amp" />
            <text x={310} y={206} className="w43-pm neg">
              −
            </text>
            <text x={309} y={258} className="w43-pm pos">
              +
            </text>
            <text x={330} y={230} className="w43-amp-lab">
              LM358
            </text>
          </g>
          {/* + input to ground */}
          <g className={`w43-part ${on('gnd')}`} {...hoverProps(['gnd'])} tabIndex={0} data-hl="gnd">
            <path d="M300 250H276V286" className="w43-wire" />
            <g className="w43-gnd">
              <line x1={262} x2={290} y1={286} y2={286} />
              <line x1={267} x2={285} y1={292} y2={292} />
              <line x1={272} x2={280} y1={298} y2={298} />
            </g>
          </g>
          {/* the virtual ground */}
          <g className={`w43-part w43-vg ${on('vn')}`} {...hoverProps(['vn'])} tabIndex={0} data-hl="vn">
            <circle cx={nodeX} cy={yIn} r={15} className="w43-vg-ring" />
            <circle cx={nodeX} cy={yIn} r={5} className="w43-node vg" />
            <text x={nodeX - 62} y={yIn + 52} className="w43-bubble vg mid">
              虚地 v− = 0 V
            </text>
          </g>
          {/* output */}
          <g className={`w43-part ${on('vo')}`} {...hoverProps(['vo'])} tabIndex={0} data-hl="vo">
            <path d={`M390 225H560`} className="w43-wire out" />
            <circle cx={outX} cy={225} r={4.5} className="w43-node out" />
            <circle cx={566} cy={225} r={6} className="w43-term out" />
            <text x={566} y={210} className="w43-name out mid">
              v_o(t)
            </text>
          </g>
          {/* rails */}
          <g className={`w43-part ${on('psu', 'sat')}`} {...hoverProps(['psu'])}>
            <line x1={345} x2={345} y1={202} y2={182} className="w43-rail pos" />
            <line x1={345} x2={345} y1={248} y2={268} className="w43-rail neg" />
            <text x={350} y={178} className="w43-tiny rail">
              +9 V
            </text>
            <text x={350} y={282} className="w43-tiny rail">
              −9 V
            </text>
          </g>
          <text x={624} y={308} className="w43-tiny end">
            虚断 i− = 0：{int ? 'i_R = i_C' : 'i_C = i_R'}（箭头为 v_i &gt; 0 时）
          </text>
        </svg>
      </div>
      <div className={`w43-formula ${on('vo', 'vn')}`}>
        <Tex tex={FORMULA[mode]} />
      </div>
      <div className="w43-cells">
        <Cell id="rc" name="时间常数 RC" short="RC" value="1.00 ms" hint="10 kΩ × 100 nF" />
        {mode === 'int' && (
          <>
            <Cell id="vos" name="3 mV 失调漂移率" short="漂移" value={`${driftRate().toFixed(1)} V/s`} />
            <Cell id="sat" name="撞 +7.5 V 轨" short="撞轨" value={`${tSat().toFixed(1)} s`} cls="bad" />
          </>
        )}
        {mode === 'lossy' && (
          <>
            <Cell id="fc" name="转折频率 f_c" short="f_c" value={hide.rf ? '?' : `${fc().toFixed(2)} Hz`} />
            <Cell id="vos" name="直流失调输出" short="V_o,DC" value={hide.rf ? '?' : `${(lossyDc() * 1000).toFixed(0)} mV`} cls="good" />
          </>
        )}
        {mode === 'diff' && (
          <>
            <Cell id="noise" name="|A(50 kHz)| = 2πfRC" short="|A| 50k" value={aIdeal(50_000).toFixed(1)} cls="bad" />
            <Cell id="vo" name="500 Hz 增益" short="|A| 500" value={aIdeal(500).toFixed(3)} />
          </>
        )}
        {mode === 'pdiff' && (
          <>
            <Cell id="fc" name="限幅转折 f_b" short="f_b" value={fmtF(fb())} />
            <Cell id="noise" name="高频增益上限 R/R_s" short="|A|max" value={aMax().toFixed(0)} cls="good" />
          </>
        )}
        <Cell
          id="slope"
          name={int ? '方波斜率 −V_in/RC' : '三角波平台 −RC·dv_i/dt'}
          short={int ? 'k' : '平台'}
          value={s.ex && hide.seg1 ? '?' : int ? `∓${(s.amp / RC / 1000).toFixed(2)} V/ms` : `∓${((RC * 4 * s.amp * s.f) as number).toFixed(2)} V`}
        />
      </div>
    </div>
  );
}
