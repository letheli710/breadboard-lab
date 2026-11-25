// Layer "02 DAC 16级阶梯输出波形 / IA 增益调节曲线" (follows the 01 tab):
// - DAC: the 16 levels against the code D — the ideal staircase (dashed) and what the
//   breadboard's LM358 gives (solid), with the −9 V rail, the LM358's low-side limit (≈ −8.2 V
//   while sinking the feedback current) and, for comparison, the −7.5 V limit of a symmetric
//   non-rail-to-rail op amp. The current code is highlighted; click a step to pick it. The y axis
//   shows the whole ±9 V picture, or zooms onto the staircase.
// - IA: A_v(R_G) = (R2/R1)(1 + 2R/R_G) on a log R_G axis, the sheet's sample points, the
//   R_G → ∞ asymptote R2/R1, and a cursor at the slider's R_G with A_v and v_o.

import { BitSwitches, DacKnobs, hoverProps, Seg, useClearHoverOnUnmount, useIsLit, useLab, type Lab } from './state';
import { IaKnobs, RgSlider, TopoTabs } from './Schematic';
import { useStageParam } from '../../stageStore';
import { codeStr, dac, fmtGain, fmtR, fmtSigned, fmtV, IA_GD, iaGain, LM358_VOL, RAIL, RG_RANGE, STATE_LABEL, SYM_SWING } from './model';

const X0 = 70;
const X1 = 604;
const Y0 = 262;
const Y1 = 34;

type YFit = 'rails' | 'zoom';

function Stairs({ lab }: { lab: Lab }) {
  const on = useIsLit();
  const [fit, setFit] = useStageParam<YFit>('yfit', 'rails');
  const fs = dac(15, lab.vref, lab.rf).ideal;
  const zoom = fit === 'zoom';
  const vTop = zoom ? Math.max(0.1, -fs * 0.08) : 1;
  const vBot = zoom ? Math.min(fs * 1.08, -0.5) : -10;
  const Y = (v: number) => Y1 + ((vTop - v) / (vTop - vBot)) * (Y0 - Y1);
  const dx = (X1 - X0) / 16;
  const X = (d: number) => X0 + d * dx;
  const levels = Array.from({ length: 16 }, (_, k) => dac(k, lab.vref, lab.rf));
  const path = (pick: (k: number) => number) =>
    levels.map((_, k) => `${k ? 'L' : 'M'} ${X(k).toFixed(1)} ${Y(pick(k)).toFixed(1)} L ${X(k + 1).toFixed(1)} ${Y(pick(k)).toFixed(1)}`).join(' ');
  const step = (vTop - vBot) / 8;
  const nice = [0.125, 0.25, 0.5, 1, 2].find((s) => s >= step) ?? 2;
  const ticks: number[] = [];
  for (let v = Math.floor(vTop / nice) * nice; v >= vBot; v -= nice) ticks.push(Number(v.toFixed(3)));
  const cur = lab.d;
  const show = (v: number) => v <= vTop && v >= vBot;
  return (
    <>
      <div className="w38-dock">
        <TopoTabs lab={lab} />
        <BitSwitches lab={lab} />
        <DacKnobs lab={lab} />
        <Seg<YFit>
          label="纵轴"
          small
          value={fit}
          onChange={setFit}
          options={[
            { value: 'rails', label: '全幅 ±9 V', short: '全幅', hover: ['rail_line'] },
            { value: 'zoom', label: '放大台阶', short: '放大', hover: ['stair'] },
          ]}
        />
      </div>
      <svg viewBox="0 0 640 300" className="w38-chart" role="img" aria-label={`DAC 16 级阶梯：Vref ${lab.vref} V，Rf ${fmtR(lab.rf)}，当前 ${codeStr(lab.code)} → ${fmtV(cur.vo)}`}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={Y(v)} y2={Y(v)} className={`w38-grid ${v === 0 ? 'zero' : ''}`} />
            <text x={X0 - 6} y={Y(v) + 4} className="w38-tick end">
              {fmtV(v, nice < 0.25 ? 3 : nice < 1 ? 2 : 0).replace(' V', '')}
            </text>
          </g>
        ))}
        <text x={14} y={(Y0 + Y1) / 2} className="w38-tick axis mid" transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}>
          输出 vo（V）
        </text>
        <text x={(X0 + X1) / 2} y={296} className="w38-tick axis mid">
          数字码 D（b1 b2 b3 b4）
        </text>
        {[0, 4, 8, 12, 15].map((k) => (
          <text key={k} x={X(k) + dx / 2} y={Y0 + 16} className={`w38-tick mono mid ${k === lab.code ? 'cur' : ''}`}>
            {codeStr(k)}
          </text>
        ))}
        {!zoom && (
          <text x={X1} y={Y1 - 12} className="w38-tick end">
            +9 V 电源轨在上方（DAC 输出全为负，只用到低端）
          </text>
        )}
        {/* limit lines */}
        {show(-RAIL) && (
          <g className={`w38-cg ${on('rail_line')}`} {...hoverProps(['rail_line'])}>
            <line x1={X0} x2={X1} y1={Y(-RAIL)} y2={Y(-RAIL)} className="w38-ref rail" />
            <text x={X0 + 6} y={Y(-RAIL) + 15} className="w38-lbl rail">
              −9 V 电源轨（理想轨到轨运放最多到这里）
            </text>
          </g>
        )}
        {show(LM358_VOL) && (
          <g className={`w38-cg ${on('vol_line')}`} {...hoverProps(['vol_line'])}>
            <line x1={X0} x2={X1} y1={Y(LM358_VOL)} y2={Y(LM358_VOL)} className="w38-ref vol" />
            <text x={X0 + 6} y={Y(LM358_VOL) + 13} className="w38-lbl vol">
              LM358 低端极限 ≈ −8.2 V
            </text>
          </g>
        )}
        {show(-SYM_SWING) && (
          <g className={`w38-cg ${on('sym_line')}`} {...hoverProps(['sym_line'])}>
            <line x1={X0} x2={X1} y1={Y(-SYM_SWING)} y2={Y(-SYM_SWING)} className="w38-ref sym" />
            <text x={X0 + 6} y={Y(-SYM_SWING) - 5} className="w38-lbl sym">
              对称 ±7.5 V 运放（如 TL072）的极限
            </text>
          </g>
        )}
        {/* the staircases */}
        <g className={`w38-cg ${on('dac_vo')}`} {...hoverProps(['dac_vo'])}>
          <path d={path((k) => levels[k].vo)} className="w38-curve lm" />
        </g>
        <g className={`w38-cg ${on('stair')}`} {...hoverProps(['stair'])}>
          <path d={path((k) => levels[k].ideal)} className="w38-hit" />
          <path d={path((k) => levels[k].ideal)} className="w38-curve ideal" />
        </g>
        {/* steps to click */}
        {levels.map((l, k) => (
          <rect
            key={k}
            x={X(k)}
            y={Y1}
            width={dx}
            height={Y0 - Y1}
            className={`w38-stepbtn ${k === lab.code ? 'cur' : ''}`}
            onClick={() => lab.set({ code: k })}
            role="button"
            aria-label={`选码字 ${codeStr(k)}：${fmtV(l.vo)}`}
          />
        ))}
        <circle cx={X(lab.code) + dx / 2} cy={Y(cur.vo)} r={6} className={`w38-mark ${cur.clipped ? 'bad' : ''}`} />
        {cur.clipped && <circle cx={X(lab.code) + dx / 2} cy={Y(cur.ideal)} r={4.5} className="w38-mark ghost" />}
        <g className="w38-legend">
          <rect x={X1 - 186} y={Y1 + 4} width={180} height={40} rx={6} />
          <line x1={X1 - 176} x2={X1 - 154} y1={Y1 + 17} y2={Y1 + 17} className="w38-curve ideal" />
          <text x={X1 - 148} y={Y1 + 21}>
            理想：vo = −(Rf/8R)·Vref·D
          </text>
          <line x1={X1 - 176} x2={X1 - 154} y1={Y1 + 34} y2={Y1 + 34} className="w38-curve lm" />
          <text x={X1 - 148} y={Y1 + 38}>
            面包板 LM358 实际输出
          </text>
        </g>
      </svg>
      <p className={`w38-readout ${cur.state} ${on('dac_vo')}`} aria-live="polite" {...hoverProps(['dac_vo'])}>
        码字 <b>{codeStr(lab.code)}</b>（D = {lab.code}）→ 理想 <b>{fmtV(cur.ideal)}</b>，LM358 <b>{fmtV(cur.vo)}</b> · {STATE_LABEL[cur.state]}
      </p>
    </>
  );
}

function Gain({ lab }: { lab: Lab }) {
  const on = useIsLit();
  const a = lab.a;
  const gd = lab.preset === 'gd';
  const hidden = gd && lab.reveal < 9;
  const asym = a.R2 / a.R1;
  const yMax = gd ? 110 : 55;
  const lx0 = Math.log10(RG_RANGE[0]);
  const lx1 = Math.log10(RG_RANGE[1]);
  const X = (rg: number) => X0 + ((Math.log10(rg) - lx0) / (lx1 - lx0)) * (X1 - X0);
  const Y = (av: number) => Y0 - (av / yMax) * (Y0 - Y1);
  const n = 160;
  const pts = Array.from({ length: n + 1 }, (_, i) => 10 ** (lx0 + (i / n) * (lx1 - lx0)));
  const curve = pts.map((r, i) => `${i ? 'L' : 'M'} ${X(r).toFixed(1)} ${Y(iaGain(a.R, a.R1, a.R2, r)).toFixed(1)}`).join(' ');
  const samples = [1_000, 2_000, 5_000, 10_000, 100_000];
  const yticks = gd ? [2, 25, 50, 75, 102] : [1, 6, 11, 26, 51];
  return (
    <>
      <div className="w38-dock">
        <TopoTabs lab={lab} />
        <IaKnobs lab={lab} />
        <RgSlider lab={lab} />
      </div>
      <svg viewBox="0 0 640 300" className="w38-chart" role="img" aria-label={`仪表放大器增益曲线：R2/R1 = ${asym}，R = ${fmtR(a.R)}`}>
        {yticks.map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={Y(v)} y2={Y(v)} className="w38-grid" />
            <text x={X0 - 6} y={Y(v) + 4} className="w38-tick end">
              {v}
            </text>
          </g>
        ))}
        {[1_000, 2_000, 5_000, 10_000, 20_000, 50_000, 100_000].map((r) => (
          <g key={r}>
            <line x1={X(r)} x2={X(r)} y1={Y0} y2={Y1} className="w38-grid v" />
            <text x={X(r)} y={Y0 + 16} className="w38-tick mid">
              {r / 1000}k
            </text>
          </g>
        ))}
        <text x={(X0 + X1) / 2} y={296} className="w38-tick axis mid">
          外接增益电阻 R_G（Ω，对数刻度）
        </text>
        <text x={14} y={(Y0 + Y1) / 2} className="w38-tick axis mid" transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}>
          差模增益 A_v
        </text>
        <text x={X0} y={22} className="w38-ctitle">
          A_v(R_G) = (R2/R1)(1 + 2R/R_G) · R = {a.R / 1000} kΩ，R1 = {a.R1 / 1000} kΩ，R2 = {a.R2 / 1000} kΩ
        </text>
        <g className={`w38-cg ${on('gain_asym')}`} {...hoverProps(['gain_asym'])}>
          <line x1={X0} x2={X1} y1={Y(asym)} y2={Y(asym)} className="w38-ref asym" />
          <text x={X1 - 4} y={Y(asym) - 22} className="w38-lbl asym end">
            R_G → ∞（拔掉）：A_v → R2/R1 = {asym}
          </text>
        </g>
        <g className={`w38-cg ${on('gain_curve')}`} {...hoverProps(['gain_curve'])}>
          <path d={curve} className="w38-hit" />
          <path d={curve} className="w38-curve gain" />
        </g>
        {!hidden && (
          <g className={`w38-cg ${on('gain_pts')}`} {...hoverProps(['gain_pts'])}>
            {samples.map((r) => {
              const av = iaGain(a.R, a.R1, a.R2, r);
              return (
                <g key={r}>
                  <circle cx={X(r)} cy={Y(av)} r={4.5} className="w38-mark pt" />
                  <text x={X(r) + 7} y={Y(av) - 7} className="w38-lbl pt">
                    {fmtGain(av)}
                  </text>
                </g>
              );
            })}
          </g>
        )}
        {gd && !hidden && <line x1={X0} x2={X1} y1={Y(IA_GD.target)} y2={Y(IA_GD.target)} className="w38-ref target" />}
        {!hidden && (
          <g className={`w38-cg cursor ${on('ia_rg')}`} {...hoverProps(['ia_rg'])}>
            <line x1={X(a.RG)} x2={X(a.RG)} y1={Y0} y2={Y(a.av)} className="w38-proj" />
            <circle cx={X(a.RG)} cy={Y(a.av)} r={7} className="w38-dot gain" />
          </g>
        )}
      </svg>
      {hidden ? (
        <p className="w38-readout">引导例题进行中：R_G 与各节点电压等你在右侧求出（可在 01 原理图点「揭晓答案」）。</p>
      ) : (
        <p className={`w38-readout ${on('ia_rg', 'ia_vo')}`} aria-live="polite" {...hoverProps(['ia_rg'])}>
          R_G = <b>{fmtR(a.RG)}</b> → A_v = <b>{fmtGain(a.av)}</b>，v2 − v1 = {((a.v2 - a.v1) * 1000).toFixed(0)} mV → vo = <b>{fmtSigned(a.vo)}</b>
        </p>
      )}
    </>
  );
}

export default function Curves() {
  const lab = useLab();
  useClearHoverOnUnmount();
  return <div className="w38-layer">{lab.topo === 'dac' ? <Stairs lab={lab} /> : <Gain lab={lab} />}</div>;
}
