// Layer "01 2D 4位二进制加权 DAC 与仪表放大器切换原理图". Two topologies on tabs:
// - DAC: V_ref and GND buses, four switches b1 (MSB) … b4 (LSB) (click to flip; 1 → V_ref,
//   0 → GND), R, 2R, 4R, 8R into the virtual-ground summing bus, R_f feedback, the op amp on
//   ±9 V. Branch currents and the virtual-ground node are live; once the LM358 clips (V_ref 5 V,
//   1110 / 1111) the node turns red and shows how far it left 0 V.
// - IA: A1 / A2 (non-inverting front end) with the chain R – R_G – R, A3 (difference stage). R_G
//   on a log slider (1–100 kΩ), node potentials v1, v2, v1− = v1, v2− = v2, vo1, vo2, vo, and the
//   R_G current as moving dots. While the guided example runs (its own R2 = 20 kΩ circuit), the
//   values not found yet stay "?".

import type { ReactNode } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { BitSwitches, Cell, DacKnobs, hoverProps, Seg, useClearHoverOnUnmount, useIsLit, useLab, type IaInput, type Lab, type Topo } from './state';
import { DAC_R, fmtGain, fmtI, fmtR, fmtSigned, fmtV, IA_GD, lsbOf, RG_RANGE, STATE_LABEL } from './model';

const zigH = (x1: number, x2: number, y: number, n = 6, a = 8) =>
  [x1, ...Array.from({ length: n }, (_, i) => x1 + ((i + 0.5) / n) * (x2 - x1)), x2]
    .map((x, i, all) => `${x.toFixed(1)},${i === 0 || i === all.length - 1 ? y : y + (i % 2 ? -a : a)}`)
    .join(' ');
const zigV = (x: number, y1: number, y2: number, n = 6, a = 8) =>
  [y1, ...Array.from({ length: n }, (_, i) => y1 + ((i + 0.5) / n) * (y2 - y1)), y2]
    .map((y, i, all) => `${i === 0 || i === all.length - 1 ? x : x + (i % 2 ? -a : a)},${y.toFixed(1)}`)
    .join(' ');

function Part({ id, cls = '', children, label, onClick }: { id: string; cls?: string; children: ReactNode; label?: string; onClick?: () => void }) {
  const on = useIsLit()(id);
  return (
    <g
      className={`w38-part ${cls} ${on} ${onClick ? 'click' : ''}`}
      data-hl={id}
      {...hoverProps([id])}
      tabIndex={0}
      role={onClick ? 'button' : 'img'}
      aria-label={label}
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) : undefined}
    >
      {children}
    </g>
  );
}

function Ground({ x, y }: { x: number; y: number }) {
  return <path d={`M ${x - 12} ${y} H ${x + 12} M ${x - 7.5} ${y + 5} H ${x + 7.5} M ${x - 3} ${y + 10} H ${x + 3}`} className="w38-gnd" />;
}

/* ------------------------------------------------------------- DAC */

const BY = [66, 116, 166, 216];
const NAMES = ['R', '2R', '4R', '8R'];
const SUM_X = 322;

function DacDrawing({ lab }: { lab: Lab }) {
  const d = lab.d;
  const flip = (k: number) => lab.set({ code: lab.code ^ (8 >> k) });
  const bad = d.clipped;
  return (
    <svg viewBox="0 0 640 296" className="w38-sch" role="img" aria-label={`4 位二进制加权 DAC：码字 ${d.bits.join('')}，输出 ${fmtV(d.vo)}`}>
      {/* V_ref and GND buses */}
      <Part id="dac_vref" label={`参考电压 Vref = ${lab.vref} V`}>
        <line x1={40} y1={46} x2={40} y2={BY[3] - 10} className="w38-bus vref" />
        <circle cx={40} cy={46} r={4.5} className="w38-dot vref" />
        <text x={16} y={34} className="w38-t vref">
          Vref = {lab.vref.toFixed(1)} V（逻辑 1）
        </text>
      </Part>
      <g className="w38-gndbus">
        <line x1={78} y1={BY[0] + 10} x2={78} y2={262} className="w38-bus gnd" />
        <Ground x={78} y={262} />
        <text x={92} y={276} className="w38-t muted">
          GND（逻辑 0）
        </text>
      </g>
      {BY.map((y, k) => {
        const b = d.bits[k];
        const id = `dac_b${k + 1}`;
        return (
          <g key={k}>
            <line x1={40} y1={y - 10} x2={112} y2={y - 10} className={`w38-wire ${b ? 'hot' : ''}`} />
            <circle cx={40} cy={y - 10} r={3} className="w38-dot vref" />
            <line x1={78} y1={y + 10} x2={112} y2={y + 10} className="w38-wire" />
            <circle cx={78} cy={y + 10} r={3} className="w38-dot gnd" />
            <Part id={id} cls="sw" label={`开关 b${k + 1}${k === 0 ? '（MSB）' : k === 3 ? '（LSB）' : ''} = ${b}，点击拨动`} onClick={() => flip(k)}>
              <rect x={104} y={y - 22} width={58} height={44} rx={6} className="w38-swhit" />
              <circle cx={112} cy={y - 10} r={3.2} className="w38-contact" />
              <circle cx={112} cy={y + 10} r={3.2} className="w38-contact" />
              <line x1={150} y1={y} x2={114} y2={b ? y - 10 : y + 10} className={`w38-blade ${b ? 'on' : ''}`} />
              <circle cx={150} cy={y} r={3.6} className="w38-dot" />
              <text x={150} y={y - 16} className="w38-t bit mid">
                b{k + 1}={b}
              </text>
            </Part>
            <line x1={150} y1={y} x2={188} y2={y} className={`w38-wire ${b ? 'hot' : ''}`} />
            <Part id={`dac_r${k + 1}`} label={`${NAMES[k]} = ${fmtR(DAC_R[k])}`}>
              <polyline points={zigH(188, 252, y)} className="w38-zig-hit" />
              <polyline points={zigH(188, 252, y)} className="w38-zig" />
              <text x={220} y={y - 13} className="w38-t name mid">
                {NAMES[k]} = {DAC_R[k] / 1000}k
              </text>
            </Part>
            <line x1={252} y1={y} x2={SUM_X} y2={y} className={`w38-wire ${b ? 'hot' : ''}`} />
            <text x={287} y={y - 6} className={`w38-t cur mid ${b ? '' : 'off'}`}>
              {fmtI(d.ib[k])}
            </text>
          </g>
        );
      })}
      {/* the summing bus = the virtual-ground node */}
      <Part id="dac_sum" cls={bad ? 'bad' : ''} label={`反相输入端（虚地）v− = ${fmtV(d.vn)}`}>
        <line x1={SUM_X} y1={BY[0]} x2={SUM_X} y2={BY[3]} className="w38-bus sum" />
        <line x1={SUM_X} y1={141} x2={380} y2={141} className="w38-bus sum" />
        <circle cx={SUM_X} cy={141} r={5} className="w38-dot sum" />
        <rect x={262} y={236} width={142} height={40} rx={7} className={`w38-vg ${bad ? 'bad' : ''}`} />
        <text x={333} y={252} className="w38-t vg mid">
          {bad ? '虚地失效！' : '虚地节点（Pin 2）'}
        </text>
        <text x={333} y={269} className="w38-t vgv mid">
          v− = {fmtV(d.vn)}
        </text>
        <line x1={SUM_X} y1={BY[3]} x2={SUM_X} y2={236} className="w38-lead" />
      </Part>
      {/* R_f feedback */}
      <line x1={344} y1={141} x2={344} y2={38} className="w38-wire" />
      <line x1={344} y1={38} x2={420} y2={38} className="w38-wire" />
      <Part id="dac_rf" label={`反馈电阻 Rf = ${fmtR(lab.rf)}`}>
        <polyline points={zigH(420, 486, 38)} className="w38-zig-hit" />
        <polyline points={zigH(420, 486, 38)} className="w38-zig rf" />
        <text x={453} y={24} className="w38-t name rf mid">
          Rf = {lab.rf / 1000} kΩ
        </text>
      </Part>
      <line x1={486} y1={38} x2={530} y2={38} className="w38-wire" />
      <line x1={530} y1={38} x2={530} y2={166} className="w38-wire" />
      <circle cx={344} cy={141} r={3.4} className="w38-dot" />
      {/* the op amp */}
      <Part id="dac_opamp" label="运放 LM358（A 通道），±9 V 双电源">
        <polygon points="380,114 380,218 474,166" className="w38-amp" />
        <text x={388} y={146} className="w38-t sign">
          −
        </text>
        <text x={388} y={198} className="w38-t sign">
          +
        </text>
        <text x={407} y={170} className="w38-t amp">
          LM358
        </text>
        <line x1={427} y1={140} x2={427} y2={100} className="w38-rail p" />
        <text x={427} y={94} className="w38-t railp mid">
          +9 V
        </text>
        <line x1={427} y1={192} x2={427} y2={226} className="w38-rail n" />
        <text x={427} y={240} className="w38-t railn mid">
          −9 V
        </text>
      </Part>
      <line x1={380} y1={192} x2={358} y2={192} className="w38-wire" />
      <line x1={358} y1={192} x2={358} y2={214} className="w38-wire" />
      <Ground x={358} y={214} />
      {/* output */}
      <Part id="dac_vo" cls={bad ? 'bad' : ''} label={`输出 vo = ${fmtV(d.vo)}`}>
        <line x1={474} y1={166} x2={600} y2={166} className="w38-wire out" />
        <circle cx={600} cy={166} r={5} className="w38-dot out" />
        <text x={608} y={171} className="w38-t vo">
          vo
        </text>
        <text x={540} y={192} className="w38-t vov">
          {fmtV(d.vo)}
        </text>
        {bad ? (
          <text x={540} y={210} className="w38-t clip">
            理想 {fmtV(d.ideal)} · 削顶
          </text>
        ) : (
          <text x={540} y={210} className="w38-t muted">
            1 LSB = {fmtV(lsbOf(lab.vref, lab.rf))}
          </text>
        )}
      </Part>
      <text x={630} y={288} className={`w38-t state end ${d.state}`}>
        {STATE_LABEL[d.state]}
      </text>
    </svg>
  );
}

function DacCells({ lab }: { lab: Lab }) {
  const d = lab.d;
  return (
    <div className="w38-cells">
      <Cell id="dac_b1" name="码字 / D" value={`${d.bits.join('')} / ${d.code}`} />
      <Cell id="dac_vo" name="理想 vo" value={fmtV(d.ideal)} />
      <Cell id="dac_vo" name="LM358 vo" value={fmtV(d.vo)} tone={d.clipped ? 'bad' : ''} />
      <Cell id="dac_sum" name="虚地 v−" value={fmtV(d.vn)} tone={d.clipped ? 'bad' : 'good'} />
      <Cell id="dac_rf" name="1 LSB" value={fmtV(lsbOf(lab.vref, lab.rf))} />
      <Cell id="dac_rf" name="Rf 电流" value={fmtI(d.iF)} />
    </div>
  );
}

/* ------------------------------------------------------------- instrumentation amplifier */

function IaDrawing({ lab }: { lab: Lab }) {
  const a = lab.a;
  const rv = lab.reveal;
  const all = rv >= 9;
  const q = (ok: boolean, s: string) => (ok ? s : '?');
  const still = prefersReducedMotion();
  const flowDur = Math.max(0.3, Math.min(6, 0.6 / Math.max(1e-3, Math.abs(a.i) / 5e-6)));
  return (
    <svg viewBox="0 0 640 300" className="w38-sch" role="img" aria-label={`三运放仪表放大器：R_G = ${fmtR(a.RG)}，A_v = ${fmtGain(a.av)}`}>
      <line x1={322} y1={22} x2={322} y2={292} className="w38-divider" />
      <text x={150} y={20} className="w38-t stage1 mid">
        第一级：A1、A2 同相缓冲 + R_G
      </text>
      <text x={480} y={20} className="w38-t stage2 mid">
        第二级：A3 差分放大
      </text>
      {/* inputs */}
      <Part id="ia_v1" label={`输入 v1 = ${fmtV(a.v1)}`}>
        <line x1={36} y1={65} x2={130} y2={65} className="w38-wire in" />
        <circle cx={36} cy={65} r={4.5} className="w38-dot in" />
        <text x={30} y={52} className="w38-t node">
          v1 = {a.v1.toFixed(3)} V
        </text>
      </Part>
      <Part id="ia_v2" label={`输入 v2 = ${fmtV(a.v2)}`}>
        <line x1={36} y1={235} x2={130} y2={235} className="w38-wire in" />
        <circle cx={36} cy={235} r={4.5} className="w38-dot in" />
        <text x={30} y={258} className="w38-t node">
          v2 = {a.v2.toFixed(3)} V
        </text>
      </Part>
      {/* A1, A2 */}
      {[
        { id: 'ia_a1', y: 50, plus: 65, minus: 105, name: 'A1' },
        { id: 'ia_a2', y: 180, plus: 235, minus: 195, name: 'A2' },
      ].map((o) => (
        <Part key={o.id} id={o.id} label={`运放 ${o.name}（同相输入）`}>
          <polygon points={`130,${o.y} 130,${o.y + 70} 200,${o.y + 35}`} className="w38-amp" />
          <text x={136} y={o.plus + 5} className="w38-t sign small">
            +
          </text>
          <text x={136} y={o.minus + 5} className="w38-t sign small">
            −
          </text>
          <text x={156} y={o.y + 40} className="w38-t amp small">
            {o.name}
          </text>
        </Part>
      ))}
      {/* the A1− / A2− taps to the chain: v1− = v1, v2− = v2 */}
      <Part id="ia_vshort" label="虚短：R_G 两端被钉在 v1 与 v2">
        <polyline points="130,105 112,105 112,125 250,125" className="w38-wire short" />
        <polyline points="130,195 112,195 112,175 250,175" className="w38-wire short" />
        <circle cx={250} cy={125} r={4} className="w38-dot short" />
        <circle cx={250} cy={175} r={4} className="w38-dot short" />
        <text x={182} y={119} className="w38-t short mid">
          v1− = v1
        </text>
        <text x={182} y={190} className="w38-t short mid">
          v2− = v2
        </text>
      </Part>
      {/* the chain vo1 – R – R_G – R – vo2 */}
      <line x1={200} y1={85} x2={340} y2={85} className="w38-wire" />
      <line x1={200} y1={215} x2={340} y2={215} className="w38-wire" />
      <circle cx={250} cy={85} r={3.4} className="w38-dot" />
      <circle cx={250} cy={215} r={3.4} className="w38-dot" />
      <Part id="ia_r" label={`前级反馈电阻 R = ${fmtR(a.R)}（上下各一颗）`}>
        <polyline points={zigV(250, 90, 120, 6, 7)} className="w38-zig-hit" />
        <polyline points={zigV(250, 90, 120, 6, 7)} className="w38-zig" />
        <polyline points={zigV(250, 180, 210, 6, 7)} className="w38-zig-hit" />
        <polyline points={zigV(250, 180, 210, 6, 7)} className="w38-zig" />
        <text x={236} y={108} className="w38-t name end">
          R
        </text>
        <text x={236} y={200} className="w38-t name end">
          R
        </text>
        <text x={196} y={150} className="w38-t muted end">
          R = {a.R / 1000} kΩ
        </text>
      </Part>
      <Part id="ia_rg" label={`外接增益电阻 R_G = ${lab.preset === 'gd' && rv < 4 ? '待求' : fmtR(a.RG)}`}>
        <polyline points={zigV(250, 130, 170, 6, 8)} className="w38-zig-hit" />
        <polyline points={zigV(250, 130, 170, 6, 8)} className="w38-zig rg" />
        <text x={236} y={147} className="w38-t name rg end">
          R_G
        </text>
        <text x={236} y={163} className="w38-t val rg end">
          {q(lab.preset !== 'gd' || rv >= 4, fmtR(a.RG))}
        </text>
      </Part>
      <Part id="ia_i" label={`R_G 电流 i = (v2 − v1)/R_G = ${all ? fmtI(a.i) : '待求'}`}>
        <line x1={276} y1={168} x2={276} y2={132} className="w38-iline" />
        <path d="M 270 140 L 276 130 L 282 140" className="w38-iline" />
        {!still && all && Math.abs(a.i) > 1e-9 && <path d="M 250 215 V 85" className="w38-flow" style={{ animationDuration: `${flowDur.toFixed(2)}s` }} />}
        <text x={284} y={146} className="w38-t cur">
          i =
        </text>
        <text x={284} y={162} className="w38-t cur">
          {q(all, fmtI(a.i))}
        </text>
      </Part>
      <text x={284} y={118} className="w38-t muted small">
        ΔV = {q(rv >= 1, `${((a.v2 - a.v1) * 1000).toFixed(0)} mV`)}
      </text>
      {/* stage outputs */}
      <Part id="ia_vo1" label={`A1 输出 vo1 = ${all ? fmtV(a.vo1) : '待求'}`}>
        <circle cx={340} cy={85} r={4.5} className="w38-dot node" />
        <text x={262} y={78} className="w38-t node">
          vo1 = {q(all, fmtV(a.vo1))}
        </text>
      </Part>
      <Part id="ia_vo2" label={`A2 输出 vo2 = ${all ? fmtV(a.vo2) : '待求'}`}>
        <circle cx={340} cy={215} r={4.5} className="w38-dot node" />
        <text x={262} y={232} className="w38-t node">
          vo2 = {q(all, fmtV(a.vo2))}
        </text>
      </Part>
      {/* the difference stage */}
      <Part id="ia_r1" label={`R1 = ${fmtR(a.R1)}（上下各一颗）`}>
        <polyline points={zigH(350, 394, 85, 6, 7)} className="w38-zig-hit" />
        <polyline points={zigH(350, 394, 85, 6, 7)} className="w38-zig r12" />
        <polyline points={zigH(350, 394, 215, 6, 7)} className="w38-zig-hit" />
        <polyline points={zigH(350, 394, 215, 6, 7)} className="w38-zig r12" />
        <text x={372} y={106} className="w38-t name r12 mid">
          R1 {a.R1 / 1000}k
        </text>
        <text x={372} y={202} className="w38-t name r12 mid">
          R1 {a.R1 / 1000}k
        </text>
      </Part>
      <line x1={340} y1={85} x2={350} y2={85} className="w38-wire" />
      <line x1={340} y1={215} x2={350} y2={215} className="w38-wire" />
      <polyline points="394,85 412,85 412,140 440,140" className="w38-wire" />
      <polyline points="394,215 412,215 412,190 440,190" className="w38-wire" />
      <circle cx={412} cy={85} r={3.4} className="w38-dot" />
      <circle cx={412} cy={215} r={3.4} className="w38-dot" />
      <Part id="ia_r2" label={`R2 = ${fmtR(a.R2)}（反馈一颗、接地一颗）`}>
        <polyline points="412,85 412,46 452,46" className="w38-wire" />
        <polyline points={zigH(452, 506, 46, 6, 7)} className="w38-zig-hit" />
        <polyline points={zigH(452, 506, 46, 6, 7)} className="w38-zig r12" />
        <polyline points="506,46 566,46 566,165" className="w38-wire" />
        <text x={479} y={34} className="w38-t name r12 mid">
          R2 {a.R2 / 1000}k
        </text>
        <line x1={412} y1={215} x2={412} y2={228} className="w38-wire" />
        <polyline points={zigV(412, 228, 262, 6, 7)} className="w38-zig-hit" />
        <polyline points={zigV(412, 228, 262, 6, 7)} className="w38-zig r12" />
        <line x1={412} y1={262} x2={412} y2={270} className="w38-wire" />
        <text x={426} y={250} className="w38-t name r12">
          R2
        </text>
      </Part>
      <Ground x={412} y={270} />
      <Part id="ia_a3" label="运放 A3（差分放大级）">
        <polygon points="440,120 440,210 520,165" className="w38-amp" />
        <text x={446} y={145} className="w38-t sign small">
          −
        </text>
        <text x={446} y={195} className="w38-t sign small">
          +
        </text>
        <text x={466} y={170} className="w38-t amp small">
          A3
        </text>
      </Part>
      <Part id="ia_vo" cls={a.linear ? '' : 'bad'} label={`输出 vo = ${all ? fmtV(a.vo) : '待求'}`}>
        <line x1={520} y1={165} x2={606} y2={165} className="w38-wire out" />
        <circle cx={606} cy={165} r={5} className="w38-dot out" />
        <text x={612} y={170} className="w38-t vo">
          vo
        </text>
        <text x={532} y={190} className="w38-t vov">
          {q(all, fmtSigned(a.vo))}
        </text>
      </Part>
    </svg>
  );
}

function IaCells({ lab }: { lab: Lab }) {
  const a = lab.a;
  const rv = lab.reveal;
  const gd = lab.preset === 'gd';
  const q = (ok: boolean, s: string) => (ok ? s : '?');
  return (
    <div className="w38-cells">
      <Cell id="ia_rg" name="A_v1 = 1 + 2R/R_G" value={q(!gd || rv >= 3, fmtGain(a.a1))} />
      <Cell id="ia_r2" name="A_v2 = R2/R1" value={q(!gd || rv >= 2, fmtGain(a.a2))} />
      <Cell id="ia_vo" name={gd && rv < 9 ? '目标总增益' : '总增益 A_v'} value={gd && rv < 9 ? String(IA_GD.target) : fmtGain(a.av)} />
      <Cell id="ia_i" name="R_G 电流 i" value={q(rv >= 9, fmtI(a.i))} />
      <Cell id="ia_vo1" name="vo1 / vo2" value={rv >= 9 ? `${a.vo1.toFixed(2)} / ${a.vo2.toFixed(2)} V` : '? / ?'} />
      <Cell id="ia_vo" name="输出 vo" value={q(rv >= 9, fmtSigned(a.vo))} tone={a.linear ? '' : 'bad'} />
    </div>
  );
}

/** R_G on a log slider (1 kΩ … 100 kΩ). */
export function RgSlider({ lab }: { lab: Lab }) {
  const locked = lab.preset === 'gd' && lab.reveal < 9;
  const lg = Math.log10(lab.rg);
  return (
    <label className="w38-slider" {...hoverProps(['ia_rg'])}>
      <span className="w38-slider-label">R_G</span>
      <input
        type="range"
        min={Math.log10(RG_RANGE[0])}
        max={Math.log10(RG_RANGE[1])}
        step={0.005}
        value={lg}
        disabled={locked}
        onChange={(e) => {
          const r = 10 ** Number(e.target.value);
          // snap to the sheet's sample points
          const snap = [1_000, 2_000, 5_000, 10_000, 20_000, 50_000, 100_000].find((s) => Math.abs(Math.log10(r / s)) < 0.012);
          lab.set({ rg: snap ?? Math.round(r / 10) * 10 });
        }}
        aria-label="外接增益电阻 R_G（对数刻度）"
        aria-valuetext={locked ? '引导例题进行中' : fmtR(lab.rg)}
      />
      <b className="w38-num">{locked ? (lab.reveal >= 4 ? fmtR(lab.rg) : '?') : fmtR(lab.rg)}</b>
    </label>
  );
}

export function TopoTabs({ lab }: { lab: Lab }) {
  return (
    <Seg<Topo>
      label="拓扑"
      value={lab.topo}
      onChange={(v) => lab.set({ topo: v })}
      options={[
        { value: 'dac', label: '4 位加权 DAC', short: 'DAC' },
        { value: 'ia', label: '三运放仪表放大器', short: '仪表放大器' },
      ]}
    />
  );
}

export function IaKnobs({ lab }: { lab: Lab }) {
  if (lab.preset === 'gd')
    return (
      <>
        <span className="w38-tag gd">引导例题：R2 = 20 kΩ · v1 = 2.000 V · v2 = 2.050 V</span>
        {lab.reveal < 9 && (
          <button className="w38-fold" onClick={() => lab.set({ iaReveal: 9, rg: 1_000 })}>
            揭晓答案
          </button>
        )}
        <button className="w38-fold" onClick={() => lab.set({ ia: 'ex', iaReveal: 9 })}>
          回到第二幕电路
        </button>
      </>
    );
  return (
    <Seg<IaInput>
      label="输入信号"
      small
      value={lab.input}
      onChange={(v) => lab.set({ iaIn: v })}
      options={[
        { value: 'diff', label: '差模 10 mV + 共模 2 V', short: '差模', hover: ['ia_v1', 'ia_v2'] },
        { value: 'cm', label: '纯共模 v1 = v2 = 2 V', short: '共模', hover: ['ia_v1', 'ia_v2'] },
      ]}
    />
  );
}

export default function Schematic() {
  const lab = useLab();
  useClearHoverOnUnmount();
  return (
    <div className="w38-layer">
      <div className="w38-dock">
        <TopoTabs lab={lab} />
        {lab.topo === 'dac' ? (
          <>
            <BitSwitches lab={lab} />
            <DacKnobs lab={lab} />
          </>
        ) : (
          <>
            <IaKnobs lab={lab} />
            <RgSlider lab={lab} />
          </>
        )}
      </div>
      <div className="w38-sch-wrap">{lab.topo === 'dac' ? <DacDrawing lab={lab} /> : <IaDrawing lab={lab} />}</div>
      {lab.topo === 'dac' ? <DacCells lab={lab} /> : <IaCells lab={lab} />}
    </div>
  );
}
