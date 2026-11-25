// W1-L3's control dock (ctrl-voltage, ctrl-resistance + E12 snap, ctrl-psc-toggle,
// ctrl-limit-open, ctrl-limit-short, ctrl-cutaway on layer 01, and the protective R_s of act 5)
// and the live telemetry bar (Ohm's law, conductance, power / thermal ratio, the limit override),
// shown under every layer of the stage.

import { useEffect } from 'react';
import { useLit, useStage } from '../../stageStore';
import { Tex } from '../../StageText';
import { E12_VALUES, R_MAX, R_MIN, V_MAX, nearestE12, ohms, posToR, rToPos, si, useOhm } from './model';
import './w1l3.css';

const hoverProps = (id: string) => ({
  onPointerEnter: () => useStage.getState().setHover([id]),
  onPointerLeave: () => useStage.getState().setHover(null),
});

export function Dock({ cutawayToggle = false }: { cutawayToggle?: boolean }) {
  const o = useOhm();
  const lit = useLit();
  // a hovered control that unmounts gets no pointerleave
  useEffect(() => () => useStage.getState().setHover(null), []);
  const rIndex = E12_VALUES.indexOf(nearestE12(o.r));
  const setR = (r: number) => {
    o.setR(Math.min(R_MAX, Math.max(R_MIN, r)));
    if (o.limit !== 'none') o.setLimit('none');
  };
  return (
    <div className="l3-dock" role="group" aria-label="控制条">
      <div className="l3-sliders">
        <label className="l3-slider">
          <span className="l3-k">
            <i>v</i>
          </span>
          <input
            type="range"
            min={-V_MAX}
            max={V_MAX}
            step={0.5}
            value={o.v}
            onChange={(e) => o.setV(Number(e.target.value))}
            aria-label="电源电压 v"
            aria-valuetext={`${o.v} V`}
          />
          <input
            className="l3-num"
            type="number"
            min={-V_MAX}
            max={V_MAX}
            step={0.5}
            value={o.v}
            onChange={(e) => {
              const x = Number(e.target.value);
              if (Number.isFinite(x)) o.setV(Math.min(V_MAX, Math.max(-V_MAX, Math.round(x * 2) / 2)));
            }}
            aria-label="电源电压数值（V）"
          />
          <span className="l3-unit">V</span>
        </label>
        <label className={`l3-slider ${lit.includes('hl_color_bands') ? 'lit' : ''}`} {...hoverProps('hl_color_bands')}>
          <span className="l3-k">
            <i>R</i>
          </span>
          {o.e12 ? (
            <input
              type="range"
              min={0}
              max={E12_VALUES.length - 1}
              step={1}
              value={rIndex}
              onChange={(e) => setR(E12_VALUES[Number(e.target.value)])}
              aria-label="电阻 R（E12 吸附）"
              aria-valuetext={ohms(o.r).text}
            />
          ) : (
            <input
              type="range"
              min={0}
              max={1000}
              step={1}
              value={Math.round(rToPos(o.r) * 1000)}
              onChange={(e) => setR(Number(posToR(Number(e.target.value) / 1000).toPrecision(3)))}
              aria-label="电阻 R（对数刻度）"
              aria-valuetext={ohms(o.r).text}
            />
          )}
          <b className="l3-rval">{o.limit === 'open' ? '∞' : o.limit === 'short' ? '0 Ω' : ohms(o.r).text}</b>
          <button
            type="button"
            className={`l3-chip small ${o.e12 ? 'on' : ''}`}
            aria-pressed={o.e12}
            onClick={() => {
              if (!o.e12) o.setR(nearestE12(o.r));
              o.setE12(!o.e12);
            }}
            title="E12 标准阻值吸附"
          >
            E12
          </button>
        </label>
      </div>
      <div className="l3-buttons">
        <div className={`l3-seg ${lit.includes('hl_psc_sign') ? 'lit' : ''}`} role="radiogroup" aria-label="参考方向" {...hoverProps('hl_psc_sign')}>
          <button type="button" role="radio" aria-checked={o.psc} className={o.psc ? 'on' : ''} onClick={() => o.setPsc(true)}>
            PSC <span className="l3-eq">v = +iR</span>
          </button>
          <button type="button" role="radio" aria-checked={!o.psc} className={!o.psc ? 'on bad' : ''} onClick={() => o.setPsc(false)}>
            Non-PSC <span className="l3-eq">v = −iR</span>
          </button>
        </div>
        <button
          type="button"
          className={`l3-chip open ${o.limit === 'open' ? 'on' : ''} ${lit.includes('hl_open_limit') ? 'lit' : ''}`}
          aria-pressed={o.limit === 'open'}
          onClick={() => o.setLimit(o.limit === 'open' ? 'none' : 'open')}
          {...hoverProps('hl_open_limit')}
        >
          开路<span className="l3-long"> R → ∞</span>
        </button>
        <button
          type="button"
          className={`l3-chip short ${o.limit === 'short' ? 'on' : ''} ${lit.includes('hl_short_limit') ? 'lit' : ''}`}
          aria-pressed={o.limit === 'short'}
          onClick={() => o.setLimit(o.limit === 'short' ? 'none' : 'short')}
          {...hoverProps('hl_short_limit')}
        >
          短路<span className="l3-long"> R → 0</span>
        </button>
        <button type="button" className={`l3-chip ${o.rs ? 'on' : ''}`} aria-pressed={o.rs} onClick={() => o.setRs(!o.rs)} title="在电源与 R 之间串入 1 kΩ 保护电阻 R_s（第 5 幕）">
          串 R<sub>s</sub>
          <span className="l3-long"> 1 kΩ</span>
        </button>
        {cutawayToggle && (
          <button
            type="button"
            className={`l3-chip cut ${o.cutaway ? 'on' : ''} ${lit.includes('hl_geom_rho') ? 'lit' : ''}`}
            aria-pressed={o.cutaway}
            onClick={() => o.setCutaway(!o.cutaway)}
            {...hoverProps('hl_geom_rho')}
          >
            <span className="l3-long">{o.cutaway ? '碳膜剖视' : '外观色环'}</span>
            <span className="l3-short">剖视</span>
          </button>
        )}
      </div>
    </div>
  );
}

/** The four live formula groups under the stage (3 significant digits, auto A / mA / µA and S / mS / µS). */
export function Telemetry() {
  const { s, psc, limit, rs } = useOhm();
  const lit = useLit();
  const sg = psc ? '+' : '-';
  const i = si(s.iRef, 'A');
  const vR = `${s.vR.toFixed(2)}\\text{ V}`;
  let ohm: string;
  if (limit === 'open') ohm = String.raw`R \to \infty \;\Rightarrow\; i = 0,\ v = ${vR}`;
  else if (limit === 'short') ohm = String.raw`v = \pm i \cdot 0 = 0 \;\Rightarrow\; i = ${s.dead ? (s.iRef < 0 ? '-\\infty' : '\\infty') : i.tex}`;
  else ohm = String.raw`v = ${sg}iR \;\Longrightarrow\; i = ${sg}\frac{v}{R} = ${sg}\frac{${vR}}{${ohms(s.rEff).tex}} = ${i.tex}`;
  let cond: string;
  if (limit === 'open') cond = String.raw`G = \frac{1}{R} = 0\text{ S}`;
  else if (limit === 'short') cond = String.raw`G = \frac{1}{R} \to \infty`;
  else cond = String.raw`G = \frac{1}{R} = \frac{|i|}{|v|} = ${si(s.g, 'S').tex}`;
  const pw = si(s.p, 'W');
  const pTex = psc ? 'p = vi' : 'p = -vi';
  const power =
    limit === 'none'
      ? String.raw`${pTex} = i^2R = \frac{v^2}{R} = ${pw.tex} \ge 0,\quad \eta_{\text{thermal}} = \frac{p}{0.25\text{ W}} = ${(s.eta * 100).toFixed(1)}\%`
      : String.raw`p = ${limit === 'open' ? 'v \\cdot 0' : '0 \\cdot i'} = 0\text{ W},\quad \eta_{\text{thermal}} = 0\%`;
  return (
    <div className="l3-telemetry" aria-label="实时公式栏">
      <div className={`l3-tm ${lit.includes('hl_psc_sign') ? 'lit' : ''}`} {...hoverProps('hl_psc_sign')}>
        <span className="l3-tm-n">1</span>
        <Tex tex={ohm} />
      </div>
      <div className={`l3-tm ${lit.includes('hl_conductance') ? 'lit' : ''}`} {...hoverProps('hl_conductance')}>
        <span className="l3-tm-n">2</span>
        <Tex tex={cond} />
      </div>
      <div className={`l3-tm ${s.overload ? 'bad' : ''} ${lit.includes('hl_power_soa') ? 'lit' : ''}`} {...hoverProps('hl_power_soa')}>
        <span className="l3-tm-n">3</span>
        {s.overload && <b className="l3-over">OVERLOAD &gt; 0.25 W</b>}
        <Tex tex={power} />
      </div>
      <div className="l3-tm limits">
        <span className="l3-tm-n">4</span>
        <span className={`l3-lim ${limit === 'open' ? 'on' : ''} ${lit.includes('hl_open_limit') ? 'lit' : ''}`} {...hoverProps('hl_open_limit')}>
          <Tex tex={String.raw`\text{Open: } R \to \infty \Rightarrow i = 0,\ v = V_s`} />
        </span>
        <span className={`l3-lim ${limit === 'short' ? 'on' : ''} ${lit.includes('hl_short_limit') ? 'lit' : ''}`} {...hoverProps('hl_short_limit')}>
          <Tex tex={String.raw`\text{Short: } R \to 0 \Rightarrow v = 0,`} /> i 由外电路决定
          {limit === 'short' && <em>{rs ? '（此处 = V_s / R_s）' : '（理想电源被直接短接：i → ∞）'}</em>}
        </span>
      </div>
    </div>
  );
}
