// W2-L6 layer 03 · 多级逐层化简流水线: a ladder network reduced one source transformation or
// merge at a time (step 0 … 4). Two circuits: act 3's Sadiku 4.4 network (v_o across 8 Ω) and
// act 5's guided example (i_o down through 12 Ω). The target branch sits in the red isolation box
// at every step (clicking it shakes it: it may not be transformed); "高亮下一刀" marks the
// elements the next step works on (click one of them to take that step); elements the last step
// created are drawn in green. The target value is solved live at every step — it never changes;
// in the guided example it stays hidden until revealed, so the stage does not answer step 5.
// Stage params: pl_circuit ('sadiku' | 'guided'), pl_step (0 … 4), pl_merge (boolean).

import { useEffect, useState } from 'react';
import { Tex } from '../../StageText';
import { useLit, useStageParam } from '../../stageStore';
import { fmt, PIPES, solveLadder, type LadderEl, type PipeId } from './model';
import { hov, RedBox, Res, Source, useClearHoverOnUnmount, useShake } from './parts';
import './w2l6.css';

const TOP = 56;
const BOT = 186;
const MIDY = (TOP + BOT) / 2;
const SER = 18; // half the zig-zag of a series resistor
const R = String.raw;

const CIRCUITS: { v: PipeId; label: string }[] = [
  { v: 'sadiku', label: 'Sadiku 4.4 · 求 v_o' },
  { v: 'guided', label: '引导例题 · 求 i_o' },
];

/** hover-map id an element answers to */
function hoverId(e: LadderEl): string {
  if (e.kind === 'r' && e.at === 'shunt' && e.target) return 'target';
  if (e.at === 'series' || e.kind === 'vsrc') return 'merge_series';
  return 'merge_parallel';
}

function layout(els: LadderEl[]): number[] {
  const n = els.length;
  // leave room on the right for the last element's label
  const pitch = Math.min(78, 318 / (n - 1));
  const x0 = 190 - (pitch * (n - 1)) / 2;
  return els.map((_, k) => x0 + k * pitch);
}

export default function PipelineLayer() {
  useClearHoverOnUnmount();
  const lit = useLit();
  const on = (id: string) => lit.includes(id);
  const [circuit, setCircuit] = useStageParam<PipeId>('pl_circuit', 'sadiku');
  const [stepRaw, setStep] = useStageParam('pl_step', 0);
  const [merge, setMerge] = useStageParam('pl_merge', true);
  const [reveal, setReveal] = useState(false);
  const [shaking, shake] = useShake();
  const stages = PIPES[circuit];
  const step = Math.max(0, Math.min(stages.length - 1, stepRaw));
  const st = stages[step];
  const xs = layout(st.els);
  const sol = solveLadder(st.els);
  const isNext = (id: string) => merge && st.next.includes(id);
  const advance = () => step < stages.length - 1 && setStep(step + 1);

  useEffect(() => setReveal(false), [circuit]);

  const target = st.els.find((e) => e.kind === 'r' && e.at === 'shunt' && e.target) as Extract<LadderEl, { kind: 'r'; at: 'shunt' }>;
  const tIdx = st.els.indexOf(target);
  const tx = xs[tIdx];

  // top rail: wire pieces between the series zig-zags
  const rail: [number, number][] = [];
  let cur = xs[0];
  st.els.forEach((e, k) => {
    if (e.at !== 'series') return;
    rail.push([cur, xs[k] - SER - 6]);
    cur = xs[k] + SER + 6;
  });
  rail.push([cur, xs[xs.length - 1]]);

  const targetName = circuit === 'sadiku' ? 'v_o' : 'i_o';
  const shown = circuit === 'sadiku' || reveal;

  return (
    <div className="w6-layer">
      <div className="w6-dock">
        <div className="w6-seg" role="radiogroup" aria-label="电路">
          {CIRCUITS.map((c) => (
            <button
              key={c.v}
              role="radio"
              aria-checked={circuit === c.v}
              className={circuit === c.v ? 'on' : ''}
              onClick={() => {
                setCircuit(c.v);
                setStep(0);
              }}
            >
              {c.label.split('_')[0]}
              <sub>{c.label.split('_')[1]}</sub>
            </button>
          ))}
        </div>
        <div className="w6-stepper" role="group" aria-label="化简步骤">
          <button className="w6-btn" onClick={() => setStep(step - 1)} disabled={step === 0} aria-label="上一步">
            ◀
          </button>
          <label className="w6-range">
            <span className="w6-range-val">第 {step} 步</span>
            <input type="range" min={0} max={stages.length - 1} step={1} value={step} onChange={(e) => setStep(Number(e.target.value))} aria-label="化简步骤 0 到 4" />
          </label>
          <button className="w6-btn" onClick={advance} disabled={step === stages.length - 1} aria-label="下一步">
            ▶
          </button>
        </div>
        <button className={`w6-switch ${merge ? 'on' : ''}`} role="switch" aria-checked={merge} onClick={() => setMerge(!merge)}>
          <span className="knob" aria-hidden />
          高亮下一刀
        </button>
      </div>

      <p className="w6-stage-cap">
        <span className="w6-step-n">{step}</span>
        {st.caption}
      </p>

      <svg className="w6-svg" viewBox="0 0 400 212" role="img" aria-label={`化简流水线：${st.caption}`}>
        <rect x="1" y="1" width="398" height="210" rx="10" className="w6-bg" />
        <g key={`${circuit}-${step}`} className="w6-stage-in">
          {rail.map(([a, b], k) => (
            <line key={k} x1={a} y1={TOP} x2={b} y2={TOP} className="w6-wire" />
          ))}
          <line x1={xs[0]} y1={BOT} x2={xs[xs.length - 1]} y2={BOT} className="w6-wire" />

          {st.els.map((e, k) => {
            const x = xs[k];
            const fresh = st.fresh.includes(e.id);
            const next = isNext(e.id);
            const hid = hoverId(e);
            const cls = `w6-el ${fresh ? 'fresh' : ''} ${next ? 'next' : ''}`;
            const click = next ? { onClick: advance, role: 'button', tabIndex: 0, 'aria-label': '执行下一步' } : {};
            if (e.at === 'series')
              return (
                <g key={e.id} className={cls} {...hov(hid)} {...click}>
                  {next && <rect x={x - SER - 10} y={TOP - 17} width={2 * SER + 20} height={34} rx={8} className="w6-next-ring" />}
                  <rect x={x - SER - 8} y={TOP - 16} width={2 * SER + 16} height={32} className="w6-hit" />
                  <Res p={[x - SER - 6, TOP]} q={[x + SER + 6, TOP]} body={2 * SER} lit={on(hid)} tone={fresh ? 'fresh' : 'r'} />
                  <text x={x} y={TOP - 13} className="w6-val mid">
                    {e.ohm} Ω
                  </text>
                </g>
              );
            if (e.kind === 'r' && e.target)
              return (
                <RedBox key={e.id} x={x - 24} y={TOP + 10} w={66} h={BOT - TOP - 20} lit={on('target') || on('red_box')} shake={shaking} id="target" onClick={shake}>
                  <circle cx={x} cy={TOP} r={3} className="w6-dot" />
                  <Res p={[x, TOP]} q={[x, BOT]} body={48} tone="target" lit={on('target') || on('red_box')} />
                  <text x={x + 12} y={MIDY + 4} className="w6-val strong">
                    {e.ohm} Ω
                  </text>
                  {e.tag === 'v_o' ? (
                    <>
                      <text x={x + 13} y={TOP + 30} className="w6-tag">
                        +
                      </text>
                      <text x={x + 12} y={MIDY + 18} className="w6-tag">
                        <tspan className="w6-it">v</tspan>
                        <tspan className="w6-subt">o</tspan>
                      </text>
                      <text x={x + 13} y={BOT - 14} className="w6-tag">
                        −
                      </text>
                    </>
                  ) : (
                    <>
                      <line x1={x + 12} y1={TOP + 24} x2={x + 12} y2={TOP + 40} className="w6-io" />
                      <polygon points={`${x + 12},${TOP + 46} ${x + 8},${TOP + 38} ${x + 16},${TOP + 38}`} className="w6-io-head" />
                      <text x={x + 19} y={TOP + 40} className="w6-tag">
                        <tspan className="w6-it">i</tspan>
                        <tspan className="w6-subt">o</tspan>
                      </text>
                    </>
                  )}
                  <text x={x + 9} y={BOT - 30} className="w6-lock-tag">
                    锁定
                  </text>
                </RedBox>
              );
            const label = e.kind === 'r' ? `${e.ohm} Ω` : e.kind === 'isrc' ? `${e.amp} A${e.dir === 'up' ? '↑' : '↓'}` : `${e.volt} V`;
            return (
              <g key={e.id} className={cls} {...hov(hid)} {...click}>
                {next && <rect x={x - 22} y={TOP + 8} width={44} height={BOT - TOP - 16} rx={10} className="w6-next-ring" />}
                <rect x={x - 18} y={TOP} width={36} height={BOT - TOP} className="w6-hit" />
                <circle cx={x} cy={TOP} r={3} className="w6-dot" />
                <circle cx={x} cy={BOT} r={3} className="w6-dot" />
                {e.kind === 'r' ? (
                  <Res p={[x, TOP]} q={[x, BOT]} body={48} tone={fresh ? 'fresh' : 'r'} lit={on(hid)} />
                ) : (
                  <>
                    <line x1={x} y1={TOP} x2={x} y2={MIDY - 17} className="w6-wire" />
                    <line x1={x} y1={MIDY + 17} x2={x} y2={BOT} className="w6-wire" />
                    {e.kind === 'isrc' ? (
                      <Source c={[x, MIDY]} arrow={e.dir} tone={e.dir === 'up' ? 'ok' : 'bad'} lit={on(hid)} />
                    ) : (
                      <Source c={[x, MIDY]} plus={e.plus} tone={e.plus === 'up' ? 'ok' : 'bad'} lit={on(hid)} />
                    )}
                  </>
                )}
                <text x={x + (e.kind === 'r' ? 11 : 21)} y={MIDY + 4} className={`w6-val ${fresh ? 'fresh' : ''}`}>
                  {label}
                </text>
              </g>
            );
          })}
        </g>
        {tx !== undefined && (
          <text x="12" y="204" className="w6-hint start">
            红框内的 {target.ohm} Ω 从头到尾一步都不许动 · 点它试试
          </text>
        )}
      </svg>

      <div className="w6-readout" aria-live="polite">
        {shaking && <span className="w6-toast">该支路包含待求量或控制变量，严禁执行电源变换！</span>}
        {st.tex && (
          <span className="w6-chip">
            <Tex tex={st.tex} />
          </span>
        )}
        {shown ? (
          <span className="w6-chip ok">
            <Tex
              tex={
                circuit === 'sadiku'
                  ? step === stages.length - 1
                    ? R`v_o = -2 \times (2 \parallel 8) = ${fmt(sol.target.v)}\text{ V}`
                    : R`v_o = ${fmt(sol.target.v)}\text{ V}`
                  : R`i_o = ${fmt(sol.target.i)}\text{ A}`
              }
            />
            <span className="w6-dim">（每一步都不变）</span>
          </span>
        ) : (
          <span className="w6-chip">
            <Tex tex={R`${targetName} = \;?`} />
            <button className="w6-btn small" onClick={() => setReveal(true)}>
              做完引导例题后揭晓
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
