// Layer "02 交互式半对数幅频/相频波特图 (渐近线 vs 精确曲线 + 可拖频率游标)": the Bode chart of the
// stage's transfer function, three switches (asymptote / exact curve / error marks) and, at the
// dragged cursor, the asymptotic and exact dB, their difference and the two phases.

import Bode from './Bode';
import { BlockControls, PresetSeg } from './Controls';
import { corners, fmt, fmtS, fmtW, totalAsymDb, totalAsymPhase, totalDb, totalPhase } from './model';
import { Cell, HSubs, P, useClearHoverOnUnmount, useLab } from './state';
import { useStageParam } from '../../stageStore';
import './w5l7.css';

function Toggle({ k, label, cls }: { k: string; label: string; cls: string }) {
  const [on, set] = useStageParam<boolean>(k, true);
  return (
    <button className={`w57-toggle ${cls}${on ? ' on' : ''}`} aria-pressed={on} onClick={() => set(!on)}>
      <i />
      {label}
    </button>
  );
}

export default function Layer02() {
  useClearHoverOnUnmount();
  const lab = useLab();
  const [asym] = useStageParam<boolean>(P.asym, true);
  const [exact] = useStageParam<boolean>(P.exact, true);
  const [err] = useStageParam<boolean>(P.err, true);
  const { fs, rev, w } = lab;
  const first = corners(fs)[0] ?? Infinity;
  const asymOk = rev.asym || (rev.low && w <= first);
  const a = totalAsymDb(fs, w);
  const e = totalDb(fs, w);
  const q = (s: string) => `? ${s}`;
  return (
    <div className="w57-layer">
      <div className="w57-controls">
        <PresetSeg lab={lab} />
        <div className="w57-toggles">
          <Toggle k={P.asym} label="渐近线" cls="asym" />
          <Toggle k={P.exact} label="精确" cls="exact" />
          <Toggle k={P.err} label="误差" cls="err" />
        </div>
      </div>
      {lab.preset === 'block' && <BlockControls lab={lab} />}
      <div className="w57-svgwrap">
        <Bode lab={lab} fs={fs} show={{ asym, exact, err }} label="半对数波特图：上为幅频（dB），下为相频（°），共享对数频率轴；可拖动频率游标" />
      </div>
      <div className="w57-readout">
        <div className="w57-rgrid six">
          <Cell
            id="cursor"
            k="游标 ω"
            v={
              <>
                {fmtW(w)} rad/s{lab.preset === 'rc' && <small> · f = {fmtW(w / (2 * Math.PI))} Hz</small>}
              </>
            }
          />
          <Cell id="asym" tone="asym" k="渐近幅值" v={asymOk ? `${fmt(a)} dB` : q('dB')} />
          <Cell id="exact" tone="exact" k="精确幅值" v={rev.exact ? `${fmt(e)} dB` : q('dB')} />
          <Cell id="err3" tone="err" k="误差" v={rev.exact && asymOk ? `${fmtS(e - a)} dB` : q('dB')} />
          <Cell id="asym" tone="asym" k="渐近相角" v={rev.phase ? `${fmtS(totalAsymPhase(fs, w))}°` : '?°'} />
          <Cell id="exact" tone="exact" k="精确相角" v={rev.phase ? `${fmtS(totalPhase(fs, w))}°` : '?°'} />
        </div>
        {lab.masked && (
          <div className="w57-readout-foot">
            <span>
              <HSubs s="引导例题进行中：答对几步，就揭晓几段。" />
            </span>
            <button className="w57-btn" onClick={() => lab.setG(5)}>
              揭晓全部（先自己做）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
