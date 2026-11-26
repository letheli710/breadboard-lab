// Layer "02 供电轨 KCL 能量通道 (Eq. 5.1)": the op amp of act 2 inside a dashed closed surface
// (the KCL supernode around the whole package) with its five currents — i₁, i₂ into the inputs,
// i₊ from +V_CC, i₋ (defined into the chip) from −V_EE, and i_o out to the load R_L. Arrow widths
// follow the size of each current, their direction its real sign; the dots flow the way charge
// does. Sourcing (v_o = +5 V): i₋ = −1 mA (the quiescent current leaves at −V_EE) and Eq. (5.1)
// gives i₊. Sinking (v_o = −4 V): i₊ = +1 mA and Eq. (5.1) gives i₋. R_L 1–10 kΩ.

import { useStageParam } from '../../stageStore';
import { fmtMa, kcl, type LoadMode } from './model';
import { Cell, hoverProps, Seg, Slider, Toggle, useClearHoverOnUnmount, useIsLit, useMask } from './ui';

/** an arrow from (x1, y1) to (x2, y2) whose shaft is w wide */
function Arrow({ x1, y1, x2, y2, w, cls }: { x1: number; y1: number; x2: number; y2: number; w: number; cls: string }) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const head = 7 + w * 1.4;
  const half = 4 + w * 0.9;
  const bx = x2 - ux * head;
  const by = y2 - uy * head;
  return (
    <g className={`w3-arrow ${cls}`}>
      <line x1={x1} y1={y1} x2={bx} y2={by} strokeWidth={w} />
      <polygon points={`${x2},${y2} ${bx - uy * half},${by + ux * half} ${bx + uy * half},${by - ux * half}`} />
    </g>
  );
}

const width = (ma: number) => 1.4 + Math.min(9, 1.35 * Math.abs(ma));

export default function KclLayer() {
  useClearHoverOnUnmount();
  const [mode, setMode] = useStageParam<LoadMode>('load', 'source');
  const [rlK, setRl] = useStageParam('rl2', 1);
  const [boundary, setBoundary] = useStageParam('kcl_box', true);
  const mask = useMask();
  const on = useIsLit();
  const k = kcl(mode, rlK);
  const q = (s: string) => (mask ? '?' : s);
  const sum = k.i1 + k.i2 + k.ip + k.im;
  // the top lead meets the triangle at y ≈ 140, the bottom lead at y ≈ 200
  const ipDown = k.ip >= 0;
  const imUp = k.im >= 0;
  const ioRight = k.io >= 0;
  return (
    <div className="w3-layer">
      <div className="w3-dock">
        <Seg
          label="负载工况"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'source', label: '拉电流 Sourcing（v_o = +5 V）', short: '拉电流 +5 V', ids: ['i_plus'] },
            { value: 'sink', label: '灌电流 Sinking（v_o = −4 V）', short: '灌电流 −4 V', ids: ['i_minus'] },
          ]}
        />
        <Toggle on={boundary} onChange={setBoundary} label="KCL 封闭面" short="封闭面" ids={['kcl_box']} />
        <Slider label="负载电阻 R_L" short="R_L" value={rlK} min={1} max={10} step={0.5} onChange={setRl} text={`${rlK.toFixed(1)} kΩ`} ids={['rl2']} />
      </div>
      <div className="w3-svg-wrap">
        <svg viewBox="0 0 640 330" className="w3-kcl" role="img" aria-label={`Eq. 5.1：i_o = ${fmtMa(k.io)}`}>
          {boundary && (
            <g className={`w3-part ${on('kcl_box')}`} {...hoverProps(['kcl_box'])}>
              <rect x="150" y="62" width="300" height="190" rx="18" className="w3-box" />
              <text x="162" y="84" className="w3-t s box">
                KCL 封闭面
              </text>
            </g>
          )}
          {/* inputs */}
          <g className={`w3-part ${on('i1')}`} {...hoverProps(['i1'])}>
            <line x1="40" y1="140" x2="225" y2="140" className="w3-w" />
            <circle cx="40" cy="140" r="5" className="w3-term" />
            <text x="30" y="124" className="w3-t s">
              v₁
            </text>
            <Arrow x1={92} y1={140} x2={140} y2={140} w={1.6} cls="in" />
            <text x="116" y="128" className="w3-t mid s in">
              i₁ ≈ 0.1 μA
            </text>
          </g>
          <g className={`w3-part ${on('i2')}`} {...hoverProps(['i2'])}>
            <line x1="40" y1="200" x2="225" y2="200" className="w3-w" />
            <circle cx="40" cy="200" r="5" className="w3-term" />
            <text x="30" y="226" className="w3-t s">
              v₂
            </text>
            <Arrow x1={92} y1={200} x2={140} y2={200} w={1.6} cls="in" />
            <text x="116" y="222" className="w3-t mid s in">
              i₂ ≈ 0.1 μA
            </text>
          </g>
          {/* the op amp */}
          <polygon points="225,110 225,230 370,170" className="w3-amp" />
          <text x="236" y="146" className="w3-t sign">
            −
          </text>
          <text x="236" y="208" className="w3-t sign">
            +
          </text>
          {/* +V_CC */}
          <g className={`w3-part ${on('i_plus')}`} {...hoverProps(['i_plus'])}>
            <line x1="298" y1="24" x2="298" y2="140" className="w3-w pos" />
            {!mask && <line x1="298" y1="30" x2="298" y2="136" className={`w3-flow pos ${ipDown ? 'fwd' : 'rev'}`} style={{ strokeWidth: width(k.ip) + 2 }} />}
            <circle cx="298" cy="24" r="5" className="w3-dot pos" />
            <text x="312" y="30" className="w3-t s pos b">
              +V_CC（+9 V）
            </text>
            {!mask && <Arrow x1={298} y1={ipDown ? 52 : 116} x2={298} y2={ipDown ? 112 : 56} w={width(k.ip)} cls="pos" />}
            <text x="312" y="92" className="w3-t pos b">
              i₊ = {q(fmtMa(k.ip))}
            </text>
          </g>
          {/* −V_EE */}
          <g className={`w3-part ${on('i_minus')}`} {...hoverProps(['i_minus'])}>
            <line x1="298" y1="200" x2="298" y2="314" className="w3-w neg" />
            {!mask && <line x1="298" y1="204" x2="298" y2="310" className={`w3-flow neg ${imUp ? 'rev' : 'fwd'}`} style={{ strokeWidth: width(k.im) + 2 }} />}
            <circle cx="298" cy="314" r="5" className="w3-dot neg" />
            <text x="312" y="318" className="w3-t s neg b">
              −V_EE（−9 V）
            </text>
            {!mask && <Arrow x1={298} y1={imUp ? 290 : 228} x2={298} y2={imUp ? 232 : 286} w={width(k.im)} cls="neg" />}
            <text x="312" y="276" className="w3-t neg b">
              i₋ = {q(fmtMa(k.im))}
            </text>
            <text x="312" y="296" className="w3-t s neg opt">
              {mask ? '（按流入芯片定义）' : k.im < 0 ? '（负号：实际从 −V_EE 脚流出）' : '（按流入芯片定义）'}
            </text>
          </g>
          {/* output and load */}
          <g className={`w3-part ${on('i_o')}`} {...hoverProps(['i_o'])}>
            <line x1="370" y1="170" x2="540" y2="170" className="w3-w out" />
            <line x1="374" y1="170" x2="536" y2="170" className={`w3-flow out ${ioRight ? 'fwd' : 'rev'}`} style={{ strokeWidth: width(k.io) + 2 }} />
            <Arrow x1={ioRight ? 400 : 486} y1={170} x2={ioRight ? 490 : 404} y2={170} w={width(k.io)} cls="out" />
            <text x="440" y="196" className="w3-t mid out b">
              i_o = {fmtMa(k.io)}
            </text>
            <circle cx="540" cy="170" r="5" className="w3-term" />
            <text x="636" y="156" className="w3-t s b end">
              v_o = {k.vo > 0 ? '+' : '−'}
              {Math.abs(k.vo).toFixed(1)} V
            </text>
          </g>
          <g className={`w3-part ${on('rl2')}`} {...hoverProps(['rl2'])}>
            <line x1="540" y1="170" x2="540" y2="196" className="w3-w" />
            <rect x="527" y="196" width="26" height="62" rx="3" className="w3-res" />
            <line x1="540" y1="258" x2="540" y2="284" className="w3-w" />
            <line x1="524" y1="284" x2="556" y2="284" className="w3-w" />
            <line x1="530" y1="291" x2="550" y2="291" className="w3-w" />
            <line x1="536" y1="298" x2="544" y2="298" className="w3-w" />
            <text x="562" y="222" className="w3-t s b">
              R_L
            </text>
            <text x="562" y="242" className="w3-t s b">
              {rlK.toFixed(1)} kΩ
            </text>
          </g>
          <g className={`w3-eq opt ${on('eq51')}`} {...hoverProps(['eq51'])}>
            <rect x="456" y="24" width="178" height="74" rx="8" />
            <text x="545" y="48" className="w3-t mid s b">
              Sadiku Eq. (5.1)
            </text>
            <text x="545" y="78" className="w3-t mid s b">
              i_o = i₁+i₂+i₊+i₋
            </text>
          </g>
        </svg>
      </div>
      <div className="w3-panel">
        <div className="w3-cells">
          <Cell id="i_o" name="负载电流 i_o = v_o/R_L" value={fmtMa(k.io)} />
          <Cell id="i1" name="输入 i₁ + i₂" value={fmtMa(k.i1 + k.i2)} cls="minor" />
          <Cell id="i_plus" name="正电源 i₊" value={q(fmtMa(k.ip))} cls="big" />
          <Cell id="i_minus" name="负电源 i₋" value={q(fmtMa(k.im))} cls="big" />
          <Cell id="eq51" name="KCL：i₁+i₂+i₊+i₋" value={mask ? '?' : `${fmtMa(sum)} ✓`} cls="minor" />
        </div>
      </div>
    </div>
  );
}
