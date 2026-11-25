// Layer "04 直流稳态（电容开路 + 电感短路）混合分析台": Example 5.1's R-L-C network, switched between
// the original circuit and its DC steady-state equivalent (L → a green short, C → two open
// terminals, R4's branch greyed out with i = 0). Live readouts: R2∥R3, v_A = v_C, i_L, I_s, the
// energies and the quarter-watt check, and a bar splitting w_total into w_L and w_C. V_s and R3
// can be changed (that leaves Example 5.1 for a free circuit). While the guided example runs, the
// answers it asks for stay "?" (state.tsx: ex51).

import { fmtMa, fmtUj, fmtW, IL_TARGET, num, P_RATED } from './model';
import { Chip, hov, HIDDEN, MaskNote, Seg, Slider, useClearHoverOnUnmount, useDc, useIsLit } from './state';

const TOP = 60;
const GND = 262;
const XS = 50;
const XA = 200;
const XR2 = 250;
const XL = 390;
const XC = 530;

function Res({ id, x, y, w, h, label, sub, dim = false }: { id: string; x: number; y: number; w: number; h: number; label: string; sub?: string; dim?: boolean }) {
  const isLit = useIsLit();
  const vertical = h > w;
  return (
    <g className={`w42-obj res ${isLit(id) ? 'lit' : ''} ${dim ? 'dim' : ''}`} {...hov([id])}>
      <rect x={x} y={y} width={w} height={h} rx={3} className="body" />
      <text x={vertical ? x + w + 6 : x + w / 2} y={vertical ? y + h / 2 - 2 : y - 8} textAnchor={vertical ? 'start' : 'middle'} className="lab">
        {label}
      </text>
      {sub && (
        <text x={vertical ? x + w + 6 : x + w / 2} y={vertical ? y + h / 2 + 13 : y - 27} textAnchor={vertical ? 'start' : 'middle'} className="sub">
          {sub}
        </text>
      )}
    </g>
  );
}

export default function DcBench() {
  useClearHoverOnUnmount();
  const d = useDc();
  const isLit = useIsLit();
  const { c, s } = d;
  const dc = d.view === 'dc';
  const vA = d.shown('vA') ? `${num(s.vA)} V` : HIDDEN;
  const iL = d.shown('iL') ? fmtMa(s.iL) : HIDDEN;
  const is = d.shown('iL') ? fmtMa(s.is) : HIDDEN;
  const iR2 = d.shown('iL') ? fmtMa(s.iR2) : HIDDEN;
  const r23 = d.shown('vA') ? `${num(s.r23, 1)} Ω` : HIDDEN;
  const w = d.shown('w');
  const pOk = s.pR1 <= P_RATED;
  const iOk = s.iL <= IL_TARGET;
  const share = s.wL / s.wTotal;
  return (
    <div className="w42-layer">
      <div className="w42-ctrl">
        <div className="w42-row">
          <Seg
            label="电路视图"
            value={d.view}
            onChange={(v) => d.set({ dcView: v })}
            options={[
              { value: 'orig', label: '原始 R-L-C 电路', short: '原始电路', hover: ['ind_l', 'cap_c'] },
              { value: 'dc', label: '进入直流稳态（t → ∞）', short: '直流稳态', hover: ['ind_l', 'cap_c', 'r4'] },
            ]}
          />
          <MaskNote d={d} />
          {!d.ex && (
            <button className="w42-btn" onClick={() => d.set({ dcCase: 'ex51' })}>
              回到例题 5.1
            </button>
          )}
        </div>
        <div className="w42-row">
          <Slider label="V_s" value={c.vs} min={5} max={12} step={0.5} unit="V" onChange={(v) => d.free({ vs: v })} hover={['supply']} fmt={(v) => v.toFixed(1)} />
          <Slider label="R₃" value={c.r3} min={50} max={300} step={10} unit="Ω" onChange={(v) => d.free({ r3: v })} hover={['r3']} />
        </div>
      </div>
      <div className="w42-sch-wrap">
        <svg viewBox="0 0 640 300" className="w42-sch" role="img" aria-label={`例题 5.1 电路${dc ? '的直流稳态等效' : ''}：节点 A 电压 ${vA}，电感电流 ${iL}`}>
          {/* wires */}
          <path className="w42-wire" d={`M${XS} ${TOP + 80} V${TOP} H88 M148 ${TOP} H${XC} M${XS} ${TOP + 120} V${GND} H${XC}`} />
          <path className="w42-wire" d={`M${XR2} ${TOP} V112 M${XR2} 172 V${GND}`} />
          <path className="w42-wire" d={`M${XL} ${TOP} V86 M${XL} 146 V168 M${XL} 222 V${GND}`} />
          <path className={`w42-wire ${dc ? 'dead' : ''}`} d={`M${XC} ${TOP} V86 M${XC} 138 V178 M${XC} ${dc ? 212 : 188} V${GND}`} />
          {/* ground */}
          <g className="w42-gnd">
            <path d={`M${(XS + XC) / 2 - 14} ${GND + 10} h28 M${(XS + XC) / 2 - 8} ${GND + 16} h16 M${(XS + XC) / 2 - 3} ${GND + 22} h6 M${(XS + XC) / 2} ${GND} v10`} />
            <text x={(XS + XC) / 2 + 22} y={GND + 20} className="sub">
              参考地 GND (0 V)
            </text>
          </g>
          {/* the source */}
          <g className={`w42-obj src ${isLit('supply') ? 'lit' : ''}`} {...hov(['supply'])}>
            <circle cx={XS} cy={TOP + 100} r={20} className="body" />
            <text x={XS} y={TOP + 96} textAnchor="middle" className="pm">
              +
            </text>
            <text x={XS} y={TOP + 113} textAnchor="middle" className="pm">
              −
            </text>
            <text x={XS + 26} y={TOP + 96} className="lab">
              V_s
            </text>
            <text x={XS + 26} y={TOP + 112} className="sub">
              {num(c.vs, 1)} V
            </text>
          </g>
          <Res id="r1" x={88} y={TOP - 9} w={60} h={18} label={`R₁ ${c.r1} Ω`} sub={dc ? `I_s = ${is}` : undefined} />
          {/* node A */}
          <g className={`w42-obj node ${isLit('node_a') ? 'lit' : ''}`} {...hov(['node_a'])}>
            <circle cx={XA} cy={TOP} r={5.5} className="dot" />
            <text x={XA + 8} y={TOP - 12} className="lab blue">
              节点 A{dc ? ` · v_A = ${vA}` : ''}
            </text>
          </g>
          <Res id="r2" x={XR2 - 9} y={112} w={18} h={60} label={`R₂ ${c.r2} Ω`} sub={dc ? `i = ${iR2}` : undefined} />
          {/* L, or its short */}
          <g className={`w42-obj ind ${isLit('ind_l', 'i_l') ? 'lit' : ''}`} {...hov(['ind_l'])}>
            {dc ? (
              <>
                <line x1={XL} y1={86} x2={XL} y2={146} className="short" />
                <text x={XL + 10} y={110} className="lab green">
                  L → 短路
                </text>
              </>
            ) : (
              <>
                <path className="coil" d={`M${XL} 86 c14 0 14 12 0 12 c14 0 14 12 0 12 c14 0 14 12 0 12 c14 0 14 12 0 12 c14 0 14 12 0 12`} />
                <text x={XL + 18} y={112} className="lab green">
                  L {num(c.L * 1e3, 0)} mH
                </text>
              </>
            )}
            <rect x={XL - 14} y={84} width={28} height={64} className="hit" />
          </g>
          {dc && (
            <g className={`w42-obj cur ${isLit('i_l', 'ind_l') ? 'lit' : ''}`} {...hov(['i_l'])}>
              <path d={`M${XL - 14} 100 v30`} className="arrow" />
              <path d={`M${XL - 19} 128 l5 8 l5 -8 z`} className="head" />
              <text x={XL - 20} y={120} textAnchor="end" className="lab green">
                i_L = {iL}
              </text>
            </g>
          )}
          <Res id="r3" x={XL - 9} y={168} w={18} h={54} label={`R₃ ${c.r3} Ω`} />
          {/* R4 and C */}
          <Res id="r4" x={XC - 9} y={86} w={18} h={52} label={`R₄ ${c.r4} Ω`} sub={dc ? 'i = 0' : undefined} dim={dc} />
          <g className={`w42-obj cap ${isLit('cap_c', 'v_c') ? 'lit' : ''}`} {...hov(['cap_c', 'v_c'])}>
            {dc ? (
              <>
                <circle cx={XC} cy={182} r={4.5} className="open" />
                <circle cx={XC} cy={208} r={4.5} className="open" />
                <text x={XC + 10} y={186} className="pm red">
                  +
                </text>
                <text x={XC + 10} y={212} className="pm red">
                  −
                </text>
                <text x={XC - 10} y={238} textAnchor="end" className="lab red">
                  C 开路
                </text>
                <text x={XC - 10} y={254} textAnchor="end" className="lab red">
                  v_C = {vA}
                </text>
              </>
            ) : (
              <>
                <line x1={XC - 13} y1={178} x2={XC + 13} y2={178} className="plate" />
                <line x1={XC - 13} y1={188} x2={XC + 13} y2={188} className="plate" />
                <text x={XC + 18} y={188} className="lab red">
                  C {num(c.C * 1e6, 0)} μF
                </text>
              </>
            )}
            <rect x={XC - 16} y={172} width={32} height={44} className="hit" />
          </g>
          {!dc && (
            <text x={320} y={24} textAnchor="middle" className="sub">
              接通 {num(c.vs, 1)} V 后经过足够长时间：点上方“进入直流稳态”，把 L 换成短路、C 换成开路
            </text>
          )}
        </svg>
      </div>
      <div className="w42-chips">
        <Chip ids={['r2', 'r3']} k="R₂∥R₃" v={r23} />
        <Chip ids={['node_a', 'v_c', 'cap_c']} k="v_A = v_C" v={vA} />
        <Chip ids={['i_l', 'ind_l']} k="i_L" v={iL} tone={d.shown('iL') && !iOk ? 'bad' : undefined} />
        <Chip ids={['supply', 'r1']} k="I_s" v={is} />
        <Chip ids={['p_check', 'r1']} k="P_R1" v={d.shown('iL') ? `${fmtW(s.pR1)} ${pOk ? '<' : '>'} 0.25 W` : HIDDEN} tone={d.shown('iL') ? (pOk ? 'good' : 'bad') : undefined} />
      </div>
      <div className={`w42-ebar ${isLit('e_bar') ? 'lit' : ''}`} tabIndex={0} {...hov(['e_bar'])}>
        <div className="track" aria-hidden>
          <i className="l" style={{ width: w ? `${Math.max(share * 100, 1.5)}%` : '0%' }} />
          <i className="c" style={{ width: w ? `${(1 - share) * 100}%` : '0%' }} />
        </div>
        <span>
          储能 w_L = <b>{w ? fmtUj(s.wL) : HIDDEN}</b> · w_C = <b>{w ? fmtUj(s.wC) : HIDDEN}</b> · w_total = <b>{w ? fmtUj(s.wTotal) : HIDDEN}</b>
        </span>
      </div>
    </div>
  );
}
