// Layer "02 四类受控源互动台": a dependent source split into its controlling branch (a voltage
// probe for v_x or a current clamp for i_x, dashed frame), the control link carrying the gain
// (μ, r, g, β) and the controlled source (a diamond, solid frame) driving a test load. The
// outside circuit sets the other terminal quantity, so the source's own power p_s = −v_s·i_s
// shows it delivering (or absorbing) energy. VCVS can show the World 3 op-amp outline.
// Stage objects: dep_control, dep_diamond, vcvs_opamp, ccvs_transres, vccs_transcond, cccs_beta.

import { useEffect } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { useLit, useStage, useStageParam } from '../../stageStore';
import { DEP, DEP_TYPES, dep, fmt, fmtSigned, type DepType } from './model';
import { Knob, Toggle, hoverProps } from './controls';
import './workbench.css';

const D = { x: 330, y: 140, r: 32 };
const LOAD = { x: 438, y: 110, w: 22, h: 60 };

export default function DepSourcesWorkbench() {
  const [type, setType] = useStageParam<DepType>('dep_type', 'VCVS');
  const [x, setX] = useStageParam('dep_x', 2);
  const [k, setK] = useStageParam('dep_k', 5);
  const [opamp, setOpamp] = useStageParam('dep_opamp', false);
  const [ext, setExt] = useStageParam('dep_ext', 1);
  const setHover = useStage((s) => s.setHover);
  const lit = useLit();
  const still = prefersReducedMotion();
  const spec = DEP[type];
  const r = dep(type, x, k, ext);

  useEffect(() => () => setHover(null), [setHover]);

  const on = (id: string) => (lit.includes(id) ? 'lit' : '');
  const ctrlSym = spec.ctrl === 'v' ? 'v_x' : 'i_x';
  const ctrlUnit = spec.ctrl === 'v' ? 'V' : 'A';
  const outSym = spec.out === 'v' ? 'v_s' : 'i_s';
  const outUnit = spec.out === 'v' ? 'V' : 'A';
  const extSym = spec.out === 'v' ? 'i_s' : 'v_s';
  const extUnit = spec.out === 'v' ? 'A' : 'V';
  const isVcvs = type === 'VCVS';
  const showOpamp = isVcvs && (opamp || lit.includes('vcvs_opamp'));
  const pulse = Math.min(1, Math.abs(x) / 10);
  const pulseDur = x === 0 ? 0 : 2.2 - 1.4 * pulse;
  // real current around the output loop: it leaves the + end when i_s > 0
  const loopDir = r.is === 0 ? null : r.is > 0 ? 'cw' : 'ccw';
  const flowDur = r.is === 0 ? 0 : 2.4 / Math.max(0.5, Math.abs(r.is) / 2);
  const outPath = `M ${D.x} ${D.y - D.r} L ${D.x} 66 L ${LOAD.x + LOAD.w / 2} 66 L ${LOAD.x + LOAD.w / 2} ${LOAD.y}`;
  const backPath = `M ${LOAD.x + LOAD.w / 2} ${LOAD.y + LOAD.h} L ${LOAD.x + LOAD.w / 2} 214 L ${D.x} 214 L ${D.x} ${D.y + D.r}`;
  const verdict = r.ps < 0 ? `对外发出 ${fmt(-r.ps)} W` : r.ps > 0 ? `从外电路吸收 ${fmt(r.ps)} W` : '不交换功率';

  return (
    <div className="l2w-layer">
      <div className="l2w-seg" role="radiogroup" aria-label="受控源类型">
        {DEP_TYPES.map((t) => (
          <button
            key={t}
            role="radio"
            aria-checked={type === t}
            className={`l2w-seg-b ${type === t ? 'on' : ''} ${on(DEP[t].gainId)}`}
            onClick={() => {
              setType(t);
              if (t !== 'VCVS') setOpamp(false);
            }}
            {...hoverProps(setHover, DEP[t].gainId)}
          >
            <b>{t}</b>
            <small>
              {DEP[t].gain} · {DEP[t].gainUnit}
            </small>
          </button>
        ))}
      </div>

      <svg
        viewBox="0 0 480 270"
        className={`l2w-svg ${still ? 'still' : ''}`}
        role="img"
        aria-label={`${type} ${spec.name}：${outSym} = ${spec.gain} × ${ctrlSym} = ${fmt(r.out)} ${outUnit}，受控源${verdict}`}
      >
        <rect x="2" y="2" width="476" height="266" rx="12" className="l2w-bg" />

        {/* controlling branch */}
        <g className={`l2w-ctrl ${on('dep_control')}`} id="svg-l2-ctrl-branch" {...hoverProps(setHover, 'dep_control')}>
          <rect x="12" y="34" width="140" height="196" rx="10" className="l2w-frame dashed" />
          <text x="82" y="52" textAnchor="middle" className="l2w-frame-t">
            控制端（传感器）
          </text>
          <line x1="58" y1="64" x2="58" y2="110" className="l2w-wire" />
          <line x1="58" y1="170" x2="58" y2="216" className="l2w-wire" />
          <rect x="46" y="110" width="24" height="60" rx="4" className="l2w-elem" />
          <text x="58" y="145" textAnchor="middle" className="l2w-elem-t">
            x
          </text>
          {spec.ctrl === 'v' ? (
            <g className="l2w-probe">
              <path d="M 58 96 L 104 96 L 104 122 M 104 158 L 104 184 L 58 184" className="l2w-probe-lead" />
              <circle cx="104" cy="140" r="17" className="l2w-meter-c" />
              <text x="104" y="145" textAnchor="middle" className="l2w-meter-t">
                V
              </text>
              <text x="36" y="104" textAnchor="middle" className="l2w-sign plus sm">
                +
              </text>
              <text x="36" y="184" textAnchor="middle" className="l2w-sign minus sm">
                −
              </text>
            </g>
          ) : (
            <g className="l2w-probe">
              <ellipse cx="58" cy="86" rx="20" ry="8" className="l2w-clamp" />
              <line x1="76" y1="86" x2="104" y2="86" className="l2w-probe-lead" />
              <circle cx="112" cy="104" r="17" className="l2w-meter-c" />
              <text x="112" y="109" textAnchor="middle" className="l2w-meter-t">
                A
              </text>
              <polygon points="38,92 46,92 42,102" className="l2w-iarrow" />
            </g>
          )}
          <text x="82" y="206" textAnchor="middle" className="l2w-ctrl-v">
            {ctrlSym} = {fmt(x)} {ctrlUnit}
          </text>
        </g>

        {/* control link */}
        <g className={`l2w-link ${on('dep_control')}`} id="svg-l2-ctrl-link" {...hoverProps(setHover, 'dep_control')}>
          <line x1="152" y1="140" x2={D.x - D.r - 4} y2="140" className="l2w-link-base" />
          {x !== 0 && <line x1="152" y1="140" x2={D.x - D.r - 4} y2="140" className="l2w-link-pulse" style={{ opacity: 0.35 + 0.65 * pulse, animationDuration: `${pulseDur}s` }} />}
          <polygon points={`${D.x - D.r - 4},134 ${D.x - D.r + 6},140 ${D.x - D.r - 4},146`} className="l2w-link-head" />
        </g>
        <g className={`l2w-gain ${on(spec.gainId)}`} id={`svg-l2-gain-${{ VCVS: 'mu', CCVS: 'r', VCCS: 'g', CCCS: 'beta' }[type]}`} {...hoverProps(setHover, spec.gainId)}>
          <rect x="166" y="104" width="114" height="26" rx="6" />
          <text x="223" y="122" textAnchor="middle">
            {spec.gain} = {fmt(k)} {spec.gainUnit}
          </text>
          <text x="223" y="164" textAnchor="middle" className="l2w-gain-note">
            {spec.gainNote}
          </text>
        </g>

        {/* controlled source + test load */}
        <rect x="290" y="34" width="180" height="196" rx="10" className="l2w-frame" />
        <text x="380" y="52" textAnchor="middle" className="l2w-frame-t">
          受控端（执行器）
        </text>
        <path d={outPath} className="l2w-wire" />
        <path d={backPath} className="l2w-wire" />
        {loopDir && (
          <g className={`l2w-flow ${loopDir === 'cw' ? 'down' : 'up'}`}>
            <path d={outPath} style={{ animationDuration: `${flowDur}s` }} />
            <path d={backPath} style={{ animationDuration: `${flowDur}s` }} />
          </g>
        )}
        <g className="l2w-load">
          <rect x={LOAD.x} y={LOAD.y} width={LOAD.w} height={LOAD.h} rx="4" />
          <text x={LOAD.x - 6} y="198" textAnchor="end">
            测试负载
          </text>
        </g>
        <g className={`l2w-diamond ${spec.out} ${on('dep_diamond')}`} id="svg-l2-diamond-body" {...hoverProps(setHover, 'dep_diamond')}>
          <polygon points={`${D.x},${D.y - D.r} ${D.x + D.r},${D.y} ${D.x},${D.y + D.r} ${D.x - D.r},${D.y}`} />
          {spec.out === 'v' ? (
            <>
              <text x={D.x} y={D.y - 6} textAnchor="middle" className="l2w-sign plus sm">
                +
              </text>
              <text x={D.x} y={D.y + 22} textAnchor="middle" className="l2w-sign minus sm">
                −
              </text>
            </>
          ) : (
            <>
              <line x1={D.x} y1={D.y + 18} x2={D.x} y2={D.y - 8} className="l2w-d-arrow" />
              <polygon points={`${D.x - 6},${D.y - 6} ${D.x + 6},${D.y - 6} ${D.x},${D.y - 18}`} className="l2w-d-head" />
            </>
          )}
        </g>
        <text x="404" y={D.y - 4} textAnchor="middle" className="l2w-out">
          {outSym} =
        </text>
        <text x="404" y={D.y + 14} textAnchor="middle" className="l2w-out">
          {fmt(r.out)} {outUnit}
        </text>
        {spec.out === 'v' ? (
          <g className="l2w-ext">
            <polygon points="392,61 402,66 392,71" />
            <text x="404" y="84" textAnchor="middle">
              i_s = {fmt(ext)} A
            </text>
          </g>
        ) : (
          <g className="l2w-ext">
            <text x="300" y={D.y - 20} className="l2w-sign plus sm">
              +
            </text>
            <text x="300" y={D.y + 30} className="l2w-sign minus sm">
              −
            </text>
            <text x="404" y="84" textAnchor="middle">
              v_s = {fmt(ext)} V
            </text>
          </g>
        )}

        {/* World 3 op-amp outline (VCVS only) */}
        {showOpamp && (
          <g className={`l2w-opamp ${on('vcvs_opamp')}`} id="svg-l2-opamp-overlay" {...hoverProps(setHover, 'vcvs_opamp')}>
            <polygon points={`${D.x - 46},${D.y - 52} ${D.x - 46},${D.y + 52} ${D.x + 42},${D.y}`} />
            <text x={D.x - 40} y={D.y - 30}>
              v₊
            </text>
            <text x={D.x - 40} y={D.y + 40}>
              v₋
            </text>
            <text x="380" y="252" textAnchor="middle" className="l2w-opamp-t">
              World 3 运放：v_out = A_v(v₊ − v₋)
            </text>
          </g>
        )}
      </svg>

      <div className="l2w-controls">
        <Knob label={`控制量 ${ctrlSym}`} unit={ctrlUnit} min={-10} max={10} step={0.5} value={x} onChange={setX} id="dep_control" lit={lit} />
        <Knob label={`增益 ${spec.gain}`} unit={spec.gainUnit} min={0.1} max={20} step={0.1} value={k} onChange={setK} id={spec.gainId} lit={lit} />
        <Knob label={`外部配套 ${extSym}`} unit={extUnit} min={-10} max={10} step={0.1} value={ext} onChange={setExt} />
        <div className="l2w-toggles">
          <Toggle
            label="World 3 运放映射"
            state={opamp && isVcvs ? 'ON' : 'OFF'}
            on={opamp && isVcvs}
            disabled={!isVcvs}
            title={isVcvs ? undefined : '仅 VCVS 可激活'}
            onClick={() => setOpamp(!opamp)}
            id="vcvs_opamp"
            lit={lit}
          />
        </div>
      </div>

      <ol className="l2w-readout" aria-live="polite">
        <li>
          <span className="n">1</span>当前模型：<b>{type}</b>（{spec.name} · 菱形受控源）
        </li>
        <li>
          <span className="n">2</span>控制方程：
          <b>
            {outSym} = {spec.gain}·{ctrlSym}
          </b>
          （{spec.gain} 的量纲：{spec.gainUnit}，{spec.gainNote}）
        </li>
        <li>
          <span className="n">3</span>数值输出：{outSym} = {fmt(k)} {spec.gainUnit} × {fmt(x)} {ctrlUnit} ={' '}
          <b>
            {fmt(r.out)} {outUnit}
          </b>
        </li>
        <li className={r.ps < 0 ? 'supply' : r.ps > 0 ? 'absorb' : 'zero'}>
          <span className="n">4</span>受控源功率（电流从 + 端流出）：p_s = −v_s·i_s = −({fmt(r.vs)} V)({fmt(r.is)} A) = <b>{fmtSigned(r.ps)} W</b>，{verdict}
        </li>
      </ol>
    </div>
  );
}
