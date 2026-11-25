// The colour-code card of a stage lesson: the full 4-band table (digit / multiplier /
// tolerance for every colour) and a reader — pick the four bands, read the value worked out with
// the lesson's formula. The picked bands are painted on the resistor on the 3D stage.

import { BAND_CHOICES, bandValue, COLOR_BY_KEY, COLORS, ohmsTex, superscript } from './colorCode';
import { useStage } from './stageStore';
import { StageText, Tex } from './StageText';

const BAND_NAMES = ['第 1 环 · 数字 d₁', '第 2 环 · 数字 d₂', '第 3 环 · 倍率 10ᵐ', '第 4 环 · 误差'];

const expText = (e: number) => (e === 0 ? '×1' : `×10^{${e}}`);

export function ColorCodeCard({ title, intro }: { title: string; intro?: string }) {
  const bands = useStage((s) => s.bands);
  const setBand = useStage((s) => s.setBand);
  const setHover = useStage((s) => s.setHover);
  const [d1, d2, m] = bands.map((k) => COLOR_BY_KEY.get(k)!);
  const { ohms, tol } = bandValue(bands);
  const tex = String.raw`R = (10 \times ${d1.digit} + ${d2.digit}) \times 10^{${m.exp}}\ \Omega = ${ohmsTex(ohms)} \pm ${tol}\%`;
  return (
    <div className="deriv colorcode" onPointerEnter={() => setHover(['resistor_10k'])} onPointerLeave={() => setHover(null)}>
      <div className="deriv-title">
        <StageText text={title} />
      </div>
      {intro && (
        <p className="cc-intro">
          <StageText text={intro} />
        </p>
      )}
      <div className="cc-reader">
        {BAND_NAMES.map((name, i) => (
          <label key={i} className="cc-band">
            <span>{name}</span>
            <span className="cc-select">
              <i style={{ background: COLOR_BY_KEY.get(bands[i])!.hex }} aria-hidden />
              <select value={bands[i]} onChange={(e) => setBand(i, e.target.value)}>
                {BAND_CHOICES[i].map((k) => {
                  const c = COLOR_BY_KEY.get(k)!;
                  const v = i < 2 ? c.digit : i === 2 ? (c.exp === 0 ? '×1' : `×10${superscript(c.exp!)}`) : `±${c.tol}%`;
                  return (
                    <option key={k} value={k}>
                      {c.zh}（{v}）
                    </option>
                  );
                })}
              </select>
            </span>
          </label>
        ))}
      </div>
      <div className="cc-result" aria-live="polite">
        <Tex tex={tex} display />
      </div>
      <table className="cc-table">
        <caption>色环速查表（4 环电阻）</caption>
        <thead>
          <tr>
            <th scope="col">颜色</th>
            <th scope="col">第 1、2 环：数字</th>
            <th scope="col">第 3 环：倍率</th>
            <th scope="col">第 4 环：误差</th>
          </tr>
        </thead>
        <tbody>
          {COLORS.map((c) => {
            const used = bands.map((k, i) => (k === c.key ? i : -1)).filter((i) => i >= 0);
            return (
              <tr key={c.key} className={used.length ? 'used' : ''}>
                <th scope="row">
                  <i style={{ background: c.hex }} aria-hidden /> {c.zh}
                </th>
                <td className={used.some((i) => i < 2) ? 'hit' : ''}>{c.digit ?? '—'}</td>
                <td className={used.includes(2) ? 'hit' : ''}>{c.exp === undefined ? '—' : <Tex tex={expText(c.exp)} />}</td>
                <td className={used.includes(3) ? 'hit' : ''}>{c.tol === undefined ? '—' : `±${c.tol}%`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="cc-tip">
        <b>先找方向：</b>金 / 银环（误差环）放在右边，从左往右读；误差环和前三环之间通常留着一段较宽的空隙。
        <br />
        <b>顺口溜：</b>黑 0 棕 1 红 2 橙 3 黄 4，绿 5 蓝 6 紫 7 灰 8 白 9。
      </p>
    </div>
  );
}
