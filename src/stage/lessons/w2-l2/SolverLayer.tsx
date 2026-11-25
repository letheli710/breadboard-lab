// W2-L2 layer 03 · 超节点 KCL+KVL 方程联动求解台: the schematic and a small blackboard, step by
// step (A 识别超节点 → B 外边界 KCL → C 内部 KVL 约束 → D 联立求解与回代验算). Every term on
// the board is linked to its branch or source: hovering either lights both. Three circuit modes:
// the standard supernode (acts 2–3), the CCVS 4·ix supernode (act 4), and the same act-2 circuit
// measured from node 3 (ground moved: Vs2 becomes Case 1, but Vs1 floats and needs a supernode
// (0, 1) — the professor's caveat of act 4). A text term of another mode previews that mode.
// Stage params: l3_mode ('std' | 'ccvs' | 'ref'), l3_step (0…3).

import { useLit, useStage, useStageParam } from '../../stageStore';
import { Tex } from '../../StageText';
import { BOARD, STEP_NAMES, type Mode } from './board';
import { CcvsSchematic } from './CcvsSchematic';
import { hov, Seg, useClearHoverOnUnmount } from './parts';
import { SnSchematic } from './SnSchematic';

const MODES: { v: Mode; long: string; short: string }[] = [
  { v: 'std', long: '标准超节点 (独立源)', short: '标准超节点' },
  { v: 'ccvs', long: '受控源超节点 (CCVS 4iₓ)', short: '受控源 4iₓ' },
  { v: 'ref', long: '参考地换点降维对比', short: '换参考地' },
];

function previewOf(hover: string[] | null, mode: Mode): Mode | null {
  if (!hover) return null;
  for (const id of hover) {
    const m: Mode | null = id.startsWith('cc_') ? 'ccvs' : id.startsWith('rf_') ? 'ref' : id.startsWith('sn_') && mode === 'ccvs' ? 'std' : null;
    if (m && m !== mode) return m;
  }
  return null;
}

export default function SolverLayer() {
  useClearHoverOnUnmount();
  const lit = useLit();
  const hover = useStage((s) => s.hover);
  const [mode, setMode] = useStageParam<Mode>('l3_mode', 'std');
  const [stepRaw, setStep] = useStageParam<number>('l3_step', 0);
  const step = Math.max(0, Math.min(3, stepRaw));
  const pv = previewOf(hover, mode);
  const m = pv ?? mode;
  const done = step >= 3;
  const board = BOARD[m][step];

  let schematic;
  if (m === 'ccvs') {
    schematic = (
      <CcvsSchematic
        lit={lit}
        loop
        arrows={step >= 1}
        labels={{ v1: done ? '12 V' : '?', v2: done ? '10 V' : '?', v3: done ? '−2 V' : '?', ix: done ? '3 A' : '', kvl: step >= 2 ? 'v₂ − v₃ = 4iₓ' : null }}
      />
    );
  } else if (m === 'ref') {
    schematic = (
      <SnSchematic
        kind="act2"
        refMode
        sn01
        lit={lit}
        loop={false}
        rp
        kvlHi={step >= 2}
        arrows={step >= 1}
        inner={false}
        flow={step === 1}
        labels={{
          v0: done ? '−3 V' : '?',
          v1: done ? '7 V' : '?',
          vA: '5 V',
          vB: '0 V',
          iL: done ? '−1 A' : '',
          iA: done ? '2 A' : '',
          iB: done ? '1 A' : '',
          iRp: '',
          iSrc: '',
          kvl: step >= 2 ? 'v₁′ − v₀′ = 10 V' : null,
        }}
      />
    );
  } else {
    schematic = (
      <SnSchematic
        kind="act2"
        lit={lit}
        loop
        rp
        kvlHi={step >= 2}
        arrows={step >= 1}
        inner={done}
        flow={step === 1}
        labels={{
          v1: '10 V',
          vA: done ? '8 V' : '?',
          vB: done ? '3 V' : '?',
          iL: done ? '−1 A' : '',
          iA: done ? '2 A' : '',
          iB: done ? '1 A' : '',
          iRp: done ? '1 A' : '',
          iSrc: done ? '2 A' : '',
          kvl: step >= 2 ? 'v₂ − v₃ = 5 V' : null,
        }}
      />
    );
  }

  return (
    <div className="w22-layer">
      <div className="w22-controls">
        <Seg<Mode> label="电路拓扑模式" value={mode} onChange={setMode} options={MODES} />
      </div>

      <div className="w22-sch-wrap">
        {schematic}
        {pv && <span className="w22-preview">预览：{MODES.find((o) => o.v === pv)!.long}</span>}
      </div>

      <div className="w22-board" aria-live="polite">
        <div className="w22-stepper" role="group" aria-label="板书推导联动步进">
          <button className="w22-step-nav" onClick={() => setStep(step - 1)} disabled={step === 0} aria-label="上一步">
            ‹
          </button>
          {STEP_NAMES.map((name, i) => (
            <button key={name} className={`w22-step ${i === step ? 'on' : i < step ? 'past' : ''}`} onClick={() => setStep(i)} aria-pressed={i === step} title={name}>
              {'ABCD'[i]}
            </button>
          ))}
          <button className="w22-step-nav" onClick={() => setStep(step + 1)} disabled={done} aria-label="下一步">
            ›
          </button>
          <span className="w22-step-title">{board.title}</span>
        </div>
        <div className="w22-rows">
          {board.rows.map((r, i) => (
            <div key={i} className="w22-row">
              {r.note && <span className="w22-row-note">{r.note}</span>}
              <span className="w22-row-eq">
                {r.terms.map((term, k) => (
                  <span
                    key={k}
                    className={`w22-term ${term.ids ? 'link' : ''} ${term.ids?.some((id) => lit.includes(id)) ? 'lit' : ''}`}
                    tabIndex={term.ids ? 0 : undefined}
                    {...hov(term.ids)}
                  >
                    <Tex tex={term.tex} />
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
