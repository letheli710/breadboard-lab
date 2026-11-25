// Layer "03 多因子逐项叠加分解面板": each factor of the standard form in its own colour (constant
// grey, origin zero green, pole 1 purple, pole 2 pink …) with a switch; the chart draws each one's
// asymptote (thin, dashed) and the sum of the switched-on ones (amber asymptote, blue exact curve);
// the table adds the slopes interval by interval (+20 / 0 / −20 dB/dec) and gives the phase slope
// (°/dec) between the phase breakpoints 0.1ω_c, ω_c, 10ω_c. The cursor's interval is marked.

import Bode from './Bode';
import { BlockControls, factorText, PresetSeg } from './Controls';
import { corners, segments, type Factor } from './model';
import { FACTOR_COLOR, P, useClearHoverOnUnmount, useHot, useLab, type Lab } from './state';
import { useStageParam } from '../../stageStore';
import { fmtCorner } from './Bode';
import './w5l7.css';

function Chip({ f, on, toggle, kShown }: { f: Factor; on: boolean; toggle: () => void; kShown: boolean }) {
  const hot = useHot(f.id);
  const [line, text] = FACTOR_COLOR[f.id] ?? ['#64748b', '#475569'];
  return (
    <button
      className={`w57-fchip${on ? ' on' : ''}${hot.lit ? ' lit' : ''}`}
      style={{ ['--fc' as string]: line, ['--ft' as string]: text }}
      aria-pressed={on}
      onClick={toggle}
      {...hot.on}
    >
      <i />
      {factorText(f, kShown)}
    </button>
  );
}

const slope = (v: number) => `${v > 0 ? '+' : ''}${v === 0 ? 0 : v.toString().replace('-', '−')}`;

function SlopeTable({ lab, fs }: { lab: Lab; fs: Factor[] }) {
  const hot = useHot('slope_table');
  const rows = segments(fs, lab.range[0], lab.range[1]);
  const first = corners(lab.fs)[0] ?? Infinity;
  const { rev } = lab;
  const w = lab.w;
  return (
    <div className={`w57-table${hot.lit ? ' lit' : ''}`} {...hot.on}>
      <table>
        <thead>
          <tr>
            <th>频率区间 (rad/s)</th>
            <th>各因子斜率 (dB/dec)</th>
            <th>合成幅频</th>
            <th>相频 (°/dec)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const magOk = rev.asym || (rev.low && r.hi <= first * 1.0001);
            const cur = w >= r.lo && (w < r.hi || r.hi === lab.range[1]);
            return (
              <tr key={r.lo} className={cur ? 'cur' : ''}>
                <td>
                  {r.lo === lab.range[0] ? '' : fmtCorner(r.lo)}
                  {r.lo === lab.range[0] ? 'ω < ' : ' – '}
                  {r.hi === lab.range[1] && r.lo !== lab.range[0] ? '' : fmtCorner(r.hi)}
                  {r.hi === lab.range[1] && r.lo !== lab.range[0] ? '以上' : ''}
                </td>
                <td className="contrib">
                  {fs
                    .filter((f) => r.mag[f.id] !== 0)
                    .map((f) => (
                      <span key={f.id} style={{ color: FACTOR_COLOR[f.id]?.[1] }}>
                        {magOk || rev.comp(f.id) ? slope(r.mag[f.id]) : '?'}
                      </span>
                    ))}
                  {fs.every((f) => r.mag[f.id] === 0) && <span className="none">0</span>}
                </td>
                <td className="tot">{magOk ? slope(r.magTotal) : '?'}</td>
                <td className="ph">{rev.phase ? slope(r.phaseTotal) : '?'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Layer03() {
  useClearHoverOnUnmount();
  const lab = useLab();
  const [off, setOff] = useStageParam<string[]>(P.off, []);
  const on = lab.fs.filter((f) => !off.includes(f.id));
  const toggle = (id: string) => setOff(off.includes(id) ? off.filter((x) => x !== id) : [...off, id]);
  return (
    <div className="w57-layer">
      <div className="w57-controls">
        <PresetSeg lab={lab} />
      </div>
      {lab.preset === 'block' && <BlockControls lab={lab} />}
      <div className="w57-controls w57-fchips" role="group" aria-label="因子开关">
        {lab.fs.map((f) => (
          <Chip key={f.id} f={f} on={!off.includes(f.id)} toggle={() => toggle(f.id)} kShown={lab.rev.k} />
        ))}
        <span className="w57-sum">
          已勾选因子合成：<b className="asym">渐近线</b> · <b className="exact">精确曲线</b>
        </span>
      </div>
      <div className="w57-svgwrap">
        <Bode
          lab={lab}
          fs={on}
          comps={lab.fs.filter((f) => !off.includes(f.id))}
          show={{ asym: true, exact: true, err: false }}
          label="逐项叠加：各因子渐近线（细虚线）与已勾选因子的合成渐近线、精确曲线"
        />
      </div>
      <SlopeTable lab={lab} fs={on} />
    </div>
  );
}
