// Layer "04 三区传输曲线与双/单电源切换": the transfer curve v_o(v_d) of act 4, twice — on a
// millivolt scale (left: the linear region is a vertical cliff, the 3 mV offset sits far out in
// saturation) and in a microvolt window (right: the ±90 μV linear region with slope A = 10⁵).
// Dual ±9 V: Sadiku's three-region model to the rails, with the LM358's real +7.5 V / −8.9 V
// limits dashed; single +9 V / 0 V: the LM358 swings from ≈ 0 V to ≈ +7.5 V, no negative output.
// "注入 3 mV 失调" adds V_OS to v_d; "比较器演示" swaps the left plot for act 5's comparator
// (V_ref = 2.5 V on v₁, the signal v_in on v₂, an LED on the output).
// While the guided example runs (stage param `mask`) the working point and v_o show "?".

import { useStageParam } from '../../stageStore';
import { fmtUv, fmtV, linearWindow, OPAMP, REGION_ZH, SWING, transfer, VOS, VREF, type Region, type Supply } from './model';
import { Cell, hoverProps, Seg, Slider, Toggle, useClearHoverOnUnmount, useIsLit, useMask } from './ui';

/** both plots share the v_o axis: +9 V at y ≈ 76, −9 V at y ≈ 284 */
const Y = (v: number) => 180 - v * 11.5;
/** left plot: v_d in volts, ±5 mV */
const XL = (vd: number) => 161 + (Math.max(-5e-3, Math.min(5e-3, vd)) / 5e-3) * 128;
/** right plot: v_d in volts, ±200 μV */
const XR = (vd: number) => 479 + (Math.max(-200e-6, Math.min(200e-6, vd)) / 200e-6) * 128;

function curve(X: (vd: number) => number, span: number, supply: Supply, model: 'ideal' | 'lm358') {
  const n = 200;
  return Array.from({ length: n + 1 }, (_, i) => {
    const vd = -span + (2 * span * i) / n;
    return `${i ? 'L' : 'M'} ${X(vd).toFixed(1)} ${Y(transfer(vd, supply, model).vo).toFixed(1)}`;
  }).join(' ');
}

function regionName(r: Region, supply: Supply) {
  if (supply === 'single' && r === 'neg') return '下限饱和（≈ 0 V）';
  return REGION_ZH[r];
}

const fmtVd = (vd: number) => (Math.abs(vd) >= 1e-3 ? `${vd > 0 ? '+' : '−'}${(Math.abs(vd) * 1e3).toFixed(2)} mV` : fmtUv(vd));

function Comparator({ vin, vo, supply, mask }: { vin: number; vo: number; supply: Supply; mask: boolean }) {
  const on = useIsLit();
  const high = vo > 1;
  return (
    <g>
      <text x="161" y="50" className="w3-t mid b">
        开环比较器：v_in 与 V_ref 比大小
      </text>
      <g className={`w3-part ${on('vref')}`} {...hoverProps(['vref'])}>
        <line x1="30" y1="140" x2="124" y2="140" className="w3-w" />
        <text x="26" y="130" className="w3-t s b">
          V_ref = {VREF.toFixed(2)} V
        </text>
        <text x="26" y="160" className="w3-t s opt">
          接 v₁（−）
        </text>
      </g>
      <g className={`w3-part ${on('vin')}`} {...hoverProps(['vin'])}>
        <line x1="30" y1="208" x2="124" y2="208" className="w3-w in" />
        <text x="26" y="198" className="w3-t s b in">
          v_in = {vin.toFixed(2)} V
        </text>
        <text x="26" y="228" className="w3-t s opt">
          接 v₂（+）
        </text>
      </g>
      <g className={`w3-part ${on('comparator')}`} {...hoverProps(['comparator'])}>
        <polygon points="124,116 124,232 220,174" className="w3-amp" />
        <text x="134" y="146" className="w3-t sign">
          −
        </text>
        <text x="134" y="216" className="w3-t sign">
          +
        </text>
        <text x="150" y="262" className="w3-t mid s opt">
          无反馈 · A = 10⁵
        </text>
      </g>
      <line x1="220" y1="174" x2="262" y2="174" className={`w3-w ${high ? 'pos' : 'neg'}`} />
      <line x1="262" y1="174" x2="262" y2="186" className="w3-w" />
      <rect x="254" y="186" width="16" height="28" rx="3" className="w3-res" />
      <line x1="262" y1="214" x2="262" y2="226" className="w3-w" />
      <circle cx="262" cy="239" r="13" className={`w3-led ${high && !mask ? 'on' : ''}`} />
      <line x1="262" y1="252" x2="262" y2="266" className="w3-w" />
      <line x1="250" y1="266" x2="274" y2="266" className="w3-w" />
      <text x="262" y="292" className="w3-t mid s b">
        {mask ? 'LED ?' : high ? 'LED 亮' : 'LED 灭'}
      </text>
      <text x="300" y="164" className={`w3-t s b end ${high ? 'pos' : 'neg'}`}>
        {mask ? 'v_o = ?' : fmtV(vo, 1)}
      </text>
      <text x="161" y="82" className="w3-t mid s">
        {supply === 'dual' ? '高电平 +9 V · 低电平 −9 V' : '高电平 ≈ +7.5 V · 低电平 ≈ 0 V'}
      </text>
    </g>
  );
}

export default function TransferLayer() {
  useClearHoverOnUnmount();
  const [supply, setSupply] = useStageParam<Supply>('sup', 'dual');
  const [vdUv, setVd] = useStageParam('vd4', 0);
  const [vos, setVos] = useStageParam('vos', false);
  const [cmp, setCmp] = useStageParam('cmp', false);
  const [vin, setVin] = useStageParam('vin', 3);
  const mask = useMask();
  const on = useIsLit();
  const vdIn = cmp ? vin - VREF : vdUv * 1e-6;
  const vd = vdIn + (vos ? VOS : 0);
  const t = transfer(vd, supply, 'ideal');
  const real = transfer(vd, supply, 'lm358');
  const [rlo, rhi] = SWING[supply].lm358;
  // dual: Sadiku's model to the rails; single: what an LM358 does on +9 V / 0 V
  const model = supply === 'dual' ? 'ideal' : 'lm358';
  const [wlo, whi] = supply === 'dual' ? linearWindow('dual') : [rlo / OPAMP.A, rhi / OPAMP.A];
  const shown = transfer(vd, supply, model);
  const top = supply === 'dual' ? 9 : rhi;
  const bottom = supply === 'dual' ? -9 : 0;
  const inWindow = Math.abs(vd) <= 200e-6;
  const q = (s: string) => (mask ? '?' : s);
  return (
    <div className="w3-layer">
      <div className="w3-dock">
        <Seg
          label="供电方式"
          value={supply}
          onChange={setSupply}
          options={[
            { value: 'dual', label: '双电源 ±9 V', short: '±9 V' },
            { value: 'single', label: '单电源 +9 V / 0 V', short: '+9 V/0 V', ids: ['single_supply'] },
          ]}
        />
        <Toggle on={vos} onChange={setVos} label="注入 3 mV 失调电压" short="+3 mV 失调" ids={['vos']} />
        <Toggle on={cmp} onChange={setCmp} label="比较器演示" short="比较器" ids={['comparator']} />
        {cmp ? (
          <Slider label="比较器输入 v_in" short="v_in" value={vin} min={0} max={5} step={0.05} onChange={setVin} text={`${vin.toFixed(2)} V`} ids={['vin']} />
        ) : (
          <Slider label="差模输入 v_d" short="v_d" value={vdUv} min={-200} max={200} step={5} onChange={setVd} text={fmtUv(vdUv * 1e-6)} ids={['vd']} />
        )}
      </div>
      <div className="w3-svg-wrap">
        <svg
          viewBox="0 0 640 312"
          className="w3-tf"
          role="img"
          aria-label={`三区传输曲线：v_d = ${fmtVd(vd)}${mask ? '' : `，v_o = ${fmtV(shown.vo)}，${regionName(shown.region, supply)}`}`}
        >
          {/* ---------------- left: millivolt scale, or the comparator */}
          <rect x="8" y="24" width="306" height="282" rx="10" className="w3-panel-bg" />
          {cmp ? (
            <Comparator vin={vin} vo={shown.vo} supply={supply} mask={mask} />
          ) : (
            <g>
              <text x="161" y="48" className="w3-t mid b">
                宏观：v_d 以 mV 计（±5 mV）
              </text>
              <line x1="24" y1={Y(0)} x2="300" y2={Y(0)} className="w3-axis" />
              <line x1="161" y1="296" x2="161" y2="64" className="w3-axis" />
              {[-4, -2, 2, 4].map((m) => (
                <text key={m} x={XL(m * 1e-3)} y={Y(0) + 17} className="w3-t mid tick">
                  {m}
                </text>
              ))}
              <text x="300" y={Y(0) - 7} className="w3-t end tick">
                mV
              </text>
              <line x1="24" x2="300" y1={Y(9)} y2={Y(9)} className="w3-rail" />
              <line x1="24" x2="300" y1={Y(bottom)} y2={Y(bottom)} className="w3-rail" />
              <text x="26" y={Y(9) - 6} className="w3-t tick pos">
                +9 V
              </text>
              {/* single supply: the floor is the v_d axis itself, named by the region label */}
              {supply === 'dual' && (
                <text x="26" y={Y(bottom) + 17} className="w3-t tick neg">
                  −9 V
                </text>
              )}
              <g className={`w3-part ${on('swing_real')}`} {...hoverProps(['swing_real'])}>
                <line x1="24" x2="300" y1={Y(rhi)} y2={Y(rhi)} className="w3-real" />
                {supply === 'dual' && (
                  <text x="300" y={Y(rhi) + 16} className="w3-t end s real opt">
                    LM358 实测 +7.5 V
                  </text>
                )}
                {supply === 'dual' && <line x1="24" x2="300" y1={Y(rlo)} y2={Y(rlo)} className="w3-real" />}
              </g>
              <g className={`w3-part ${on('region_pos')}`} {...hoverProps(['region_pos'])}>
                <text x="240" y={Y(9) - 6} className="w3-t mid s pos b">
                  正饱和区
                </text>
              </g>
              <g className={`w3-part ${on('region_neg')}`} {...hoverProps(['region_neg'])}>
                <text x="90" y={Y(bottom) - 8} className="w3-t mid s neg b">
                  {supply === 'dual' ? '负饱和区' : '下限 ≈ 0 V'}
                </text>
              </g>
              <path d={curve(XL, 5e-3, supply, model)} className={`w3-curve ${supply}`} />
              <g className={`w3-part ${on('region_lin')}`} {...hoverProps(['region_lin'])}>
                <rect x={XL(0) - 6} y={Y(top)} width="12" height={Y(bottom) - Y(top)} className="w3-lin-hit" />
                <text x={XL(0) + 10} y={Y(-4.2)} className="w3-t s lin b opt">
                  线性区 = 这道竖线
                </text>
              </g>
              {vos && (
                <g className={`w3-part ${on('vos')}`} {...hoverProps(['vos'])}>
                  <line x1={XL(VOS)} x2={XL(VOS)} y1="64" y2="296" className="w3-vos" />
                  <text x={XL(VOS) - 4} y={Y(-6.4)} className="w3-t s vosc b end">
                    V_OS = 3 mV
                  </text>
                </g>
              )}
              {!mask && <circle cx={XL(vd)} cy={Y(shown.vo)} r="7" className="w3-op" />}
            </g>
          )}
          {/* ---------------- right: the microvolt window */}
          <rect x="326" y="24" width="306" height="282" rx="10" className="w3-panel-bg zoom" />
          <text x="479" y="48" className="w3-t mid b zoom">
            放大窗口：v_d 以 μV 计
          </text>
          <g className={`w3-part ${on('region_lin')}`} {...hoverProps(['region_lin'])}>
            <rect x={XR(wlo)} y={Y(top)} width={XR(whi) - XR(wlo)} height={Y(bottom) - Y(top)} className="w3-lin-band" />
          </g>
          <line x1="340" y1={Y(0)} x2="618" y2={Y(0)} className="w3-axis" />
          <line x1="479" y1="296" x2="479" y2="64" className="w3-axis" />
          <line x1="340" x2="618" y1={Y(rhi)} y2={Y(rhi)} className="w3-real" />
          {supply === 'dual' && <line x1="340" x2="618" y1={Y(rlo)} y2={Y(rlo)} className="w3-real" />}
          <path d={curve(XR, 200e-6, supply, model)} className={`w3-curve ${supply}`} />
          {[wlo, whi]
            .filter((v) => Math.abs(v) >= 1e-6)
            .map((v) => (
              <g key={v}>
                <line x1={XR(v)} x2={XR(v)} y1={Y(0)} y2={Y(transfer(v, supply, model).vo)} className="w3-edge" />
                <text x={XR(v) + (v > 0 ? 6 : -6)} y={v > 0 ? Y(0) + 18 : Y(0) - 8} className={`w3-t s edge b ${v > 0 ? '' : 'end'}`}>
                  {fmtUv(v)}
                </text>
              </g>
            ))}
          <text x="614" y={Y(top) - 6} className="w3-t end tick pos">
            {supply === 'dual' ? '+9 V' : '≈ +7.5 V'}
          </text>
          <text x="496" y={Y(-4)} className="w3-t s slope b opt">
            斜率 = A = 10⁵
          </text>
          {!mask &&
            (inWindow ? (
              <circle cx={XR(vd)} cy={Y(shown.vo)} r="7" className="w3-op" />
            ) : (
              <g className="w3-out">
                <polygon
                  points={vd > 0 ? `620,${Y(shown.vo)} 606,${Y(shown.vo) - 8} 606,${Y(shown.vo) + 8}` : `338,${Y(shown.vo)} 352,${Y(shown.vo) - 8} 352,${Y(shown.vo) + 8}`}
                />
                {/* the label sits in the empty quadrant: lower right for v_d > 0, upper left for v_d < 0 */}
                <text x={vd > 0 ? 612 : 346} y={vd > 0 ? Y(-6) : Y(6)} className={`w3-t s b ${vd > 0 ? 'end' : ''}`}>
                  {vd > 0 ? '→' : '←'} {fmtVd(vd)}（窗口外）
                </text>
              </g>
            ))}
          {mask && <line x1={XR(vd)} x2={XR(vd)} y1="64" y2="296" className="w3-vdline" />}
        </svg>
      </div>
      <div className="w3-panel">
        <div className="w3-cells">
          <Cell id="vd" name={vos ? 'v_d（含 V_OS）' : 'v_d = v₂ − v₁'} value={fmtVd(vd)} />
          <Cell
            id="vcvs"
            name="A·v_d（不限幅）"
            value={q(Math.abs(t.lin) >= 1000 ? `${t.lin > 0 ? '+' : '−'}${(Math.abs(t.lin) / 1000).toFixed(1)} kV` : fmtV(t.lin, 2))}
            cls="minor"
          />
          <Cell id={`region_${shown.region}`} name="工作区" value={q(regionName(shown.region, supply))} cls="big" />
          <Cell id="region_lin" name={supply === 'dual' ? 'v_o（三区模型 ±9 V）' : 'v_o（LM358 单电源）'} value={q(fmtV(shown.vo, 2))} />
          <Cell id="swing_real" name="LM358 实测约" value={q(fmtV(real.vo, 2))} cls="minor" />
        </div>
      </div>
      <p className="w3-notice" role="note">
        <span className="full">
          {supply === 'dual'
            ? '线性区总宽 180 μV（= (V_CC + V_EE)/A，A = 10⁵）；3 mV 失调是饱和边界 90 μV 的 33.3 倍'
            : '单电源：线性区约 0 … 75 μV（LM358 输出 ≈ 0 V … +7.5 V），没有负电压输出'}
        </span>
        <span className="short">{supply === 'dual' ? '线性区仅 ±90 μV；3 mV 失调 = 33.3 × 90 μV' : '单电源：≈ 0 V … +7.5 V，无负输出'}</span>
      </p>
    </div>
  );
}
