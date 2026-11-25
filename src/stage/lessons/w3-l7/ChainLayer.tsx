// W3-L7 layer 02 · 多级运放逐级电位追踪与增益链. Three chains: act 3's two stages (inverting →
// non-inverting, R_L), act 4's three stages (inverting → summer → inverting attenuator) and the
// guided example's three stages (inverting → non-inverting → inverting attenuator, R_L). The
// schematic shows each stage's node bubble and gain; below it a "rail corridor" plots vᵢ and every
// stage output against ±V_CC: a stage whose linear output leaves the corridor turns red, is
// clipped, and the clipped value is what the next stage gets (hollow marks: what the linear
// formula / the blind product asked for). Telemetry: total gain, output currents i_ok (KCL: own
// feedback + next stage / load), the saturation flag.
// Anti-spoiler: on the guided example's chain the stage numbers stay covered and the controls
// locked until the guided example is finished (d_done); its steps uncover one kind of number at a
// time (d_show) at the step's input (d_vi). Stage params: l2_circuit, v_i, V_rail, l2_mode,
// d_done, d_vi, d_show.

import { useStageParam } from '../../stageStore';
import { DRILL_FIX, DRILL_HIGH, EX1, EX2_FIX, EX2_HIGH, chainGain, fmt, solveChain, stageGain, sumOffset, type Chain, type StageDef, type StageState } from './model';
import { Bubble, C, Chip, Ground, Obj, OpAmp, Res, STAGE_COL, Seg, Slider, Wire } from './parts';
import './w3l7.css';

type Circ = 'ex1' | 'ex2' | 'drill';
type Mode = 'high' | 'balanced';
/** what a guided step may uncover: gains, the three node voltages, the output currents */
export type ShowKey = 'A' | 'v1' | 'v2' | 'v3' | 'i';

const PRESET: Record<Circ, { vi: number; rail: number }> = { ex1: { vi: 0.4, rail: 15 }, ex2: { vi: 1.5, rail: 12 }, drill: { vi: 0.5, rail: 15 } };
const SUB = ['₁', '₂', '₃'];
const W = 664;
const Y = 118;
const Z = 270; // corridor zero line
const H = 52; // corridor half height (± 1.5 × rail)

function chainOf(c: Circ, m: Mode): Chain {
  if (c === 'ex1') return EX1;
  if (c === 'ex2') return m === 'high' ? EX2_HIGH : EX2_FIX;
  return m === 'high' ? DRILL_HIGH : DRILL_FIX;
}

const k = (r: number) => `${fmt(r, 1)}k`;

/** one stage drawn at x (190 wide): input at (x, Y), output node at (x + 170, Y) */
function StageSym({ s, i, x, st, hideA, known }: { s: StageDef; i: number; x: number; st: StageState; hideA: boolean; known: boolean }) {
  const col = STAGE_COL[i];
  const n = SUB[i];
  const inv = s.kind !== 'non';
  const gain = hideA ? `A${n} = ?` : s.kind === 'sum' ? `A${n} = ${fmt(stageGain(s), 2, true)}（另加 ${fmt(sumOffset(s), 1, true)} V）` : `A${n} = ${fmt(stageGain(s), 2, true)}`;
  const rinName = s.kind === 'sum' ? 'Ra' : `R${n}`;
  return (
    <g>
      {inv ? (
        <>
          <Wire
            pts={[
              [x, Y],
              [x + 10, Y],
              [x + 10, Y - 14],
              [x + 18, Y - 14],
            ]}
          />
          <Obj id={i === 0 ? 'ch_vi' : 'ch_rin'} box={[x + 14, Y - 27, 56, 26]}>
            <Res x={x + 18} y={Y - 23} w={48} h={18} label={`${rinName} ${k(s.Rin)}`} />
          </Obj>
          <Wire
            pts={[
              [x + 66, Y - 14],
              [x + 96, Y - 14],
            ]}
          />
          <circle cx={x + 82} cy={Y - 14} r={3} fill={C.ink} />
          <Obj id="ch_rf" box={[x + 92, Y - 65, 64, 26]}>
            <Res x={x + 96} y={Y - 61} w={56} h={18} label={`Rf${n} ${k(s.Rf)}`} />
          </Obj>
          <Wire
            pts={[
              [x + 82, Y - 14],
              [x + 82, Y - 52],
              [x + 96, Y - 52],
            ]}
            width={1.7}
          />
          <Wire
            pts={[
              [x + 152, Y - 52],
              [x + 170, Y - 52],
              [x + 170, Y],
            ]}
            width={1.7}
          />
          <Wire
            pts={[
              [x + 96, Y + 14],
              [x + 88, Y + 14],
              [x + 88, Y + 46],
            ]}
            width={1.7}
          />
          <Ground x={x + 88} y={Y + 46} />
          {s.kind === 'sum' && (
            <Obj id="ch_vi" box={[x - 4, Y + 26, 82, 46]}>
              <circle cx={x + 6} cy={Y + 38} r={3.5} fill={C.ink} />
              <text x={x + 2} y={Y + 64} className="w37-tag">
                v₂ = {fmt(s.vb ?? 0, 1, false, true)} V
              </text>
              <Wire
                pts={[
                  [x + 6, Y + 38],
                  [x + 18, Y + 38],
                ]}
              />
              <Res x={x + 18} y={Y + 29} w={48} h={18} label={`Rb ${k(s.Rb ?? 0)}`} />
              <Wire
                pts={[
                  [x + 66, Y + 38],
                  [x + 74, Y + 38],
                  [x + 74, Y - 14],
                ]}
                width={1.7}
              />
              <circle cx={x + 74} cy={Y - 14} r={3} fill={C.ink} />
            </Obj>
          )}
        </>
      ) : (
        <>
          <Wire
            pts={[
              [x, Y],
              [x + 10, Y],
              [x + 10, Y - 14],
              [x + 96, Y - 14],
            ]}
          />
          <text x={x + 52} y={Y - 20} className="w37-tag" textAnchor="middle" fill={col.text}>
            i₊ = 0
          </text>
          <Wire
            pts={[
              [x + 96, Y + 14],
              [x + 82, Y + 14],
              [x + 82, Y + 52],
            ]}
            width={1.7}
          />
          <circle cx={x + 82} cy={Y + 52} r={3} fill={C.ink} />
          <Wire
            pts={[
              [x + 82, Y + 52],
              [x + 70, Y + 52],
            ]}
            width={1.7}
          />
          <Res x={x + 22} y={Y + 43} w={48} h={18} label={`R${n} ${k(s.Rin)}`} />
          <Wire
            pts={[
              [x + 22, Y + 52],
              [x + 12, Y + 52],
              [x + 12, Y + 60],
            ]}
            width={1.7}
          />
          <Ground x={x + 12} y={Y + 60} />
          <Obj id="ch_rf" box={[x + 92, Y + 39, 64, 26]}>
            <Res x={x + 96} y={Y + 43} w={56} h={18} label={`Rf${n} ${k(s.Rf)}`} />
          </Obj>
          <Wire
            pts={[
              [x + 82, Y + 52],
              [x + 96, Y + 52],
            ]}
            width={1.7}
          />
          <Wire
            pts={[
              [x + 152, Y + 52],
              [x + 170, Y + 52],
              [x + 170, Y],
            ]}
            width={1.7}
          />
        </>
      )}
      <Obj id={`ch_u${i + 1}`} box={[x + 92, Y - 34, 58, 68]}>
        <OpAmp x={x + 96} y={Y} top={inv ? '−' : '+'} color={col.line} fill={col.soft} name={`U${n}`} sat={st.sat && known} />
      </Obj>
      <Wire
        pts={[
          [x + 146, Y],
          [x + 170, Y],
        ]}
      />
      <text x={x + 121} y={Y + 84} className="w37-gain" textAnchor="middle" fill={col.text}>
        {gain}
      </text>
    </g>
  );
}

export default function ChainLayer() {
  const [circ, setCirc] = useStageParam<Circ>('l2_circuit', 'ex2');
  const [viP, setVi] = useStageParam('v_i', 0.25);
  const [railP, setRail] = useStageParam('V_rail', 12);
  const [modeP, setMode] = useStageParam<Mode>('l2_mode', 'high');
  const [done] = useStageParam('d_done', false);
  const [dVi] = useStageParam('d_vi', 0.25);
  const [dShow] = useStageParam<ShowKey[]>('d_show', []);

  const locked = circ === 'drill' && !done;
  const vi = locked ? dVi : viP;
  const rail = locked ? 15 : railP;
  const mode: Mode = circ === 'ex1' ? 'high' : locked ? 'high' : modeP;
  const show = (key: ShowKey) => !locked || dShow.includes(key);

  const chain = chainOf(circ, mode);
  const n = chain.stages.length;
  const st = solveChain(chain, vi, rail);
  const x0 = n === 3 ? 30 : 130;
  const sx = (i: number) => x0 + 190 * i;
  const outX = (i: number) => sx(i) + 170;
  const vKey = (i: number) => (['v1', 'v2', 'v3'] as const)[i];

  const pick = (c: Circ) => {
    setCirc(c);
    setVi(PRESET[c].vi);
    setRail(PRESET[c].rail);
    setMode('high');
  };

  /* corridor */
  const range = rail * 1.5;
  const cy = (v: number) => Z - Math.max(-1, Math.min(1, v / range)) * H;
  const railY = H / 1.5;
  const cols = [x0, ...st.map((_, i) => outX(i))];
  const known = (i: number) => show(vKey(i));
  const trace: [number, number][] = [[x0, cy(vi)]];
  for (let i = 0; i < n && known(i); i++) trace.push([outX(i), cy(st[i].out)]);

  /* telemetry */
  const firstSat = st.findIndex((s) => s.sat);
  const hasSum = chain.stages.some((s) => s.kind === 'sum');
  let offset = 0;
  chain.stages.forEach((s, i) => {
    if (s.kind === 'sum') offset = chain.stages.slice(i + 1).reduce((a, t) => a * stageGain(t), sumOffset(s));
  });
  const A = chainGain(chain);
  const allV = st.every((_, i) => known(i));
  const last = st[n - 1];

  return (
    <div className="w37-layer">
      <div className="w37-controls">
        <Seg<Circ>
          label="电路"
          value={circ}
          onPick={pick}
          options={[
            { v: 'ex1', text: '第 3 幕：两级', short: '两级' },
            { v: 'ex2', text: '第 4 幕：三级加法', short: '三级加法' },
            { v: 'drill', text: '第 6 幕：引导例题', short: '引导例题' },
          ]}
        />
        <Seg<Mode>
          label="增益分配方案"
          value={mode}
          onPick={setMode}
          disabled={circ === 'ex1' || locked}
          options={[
            { v: 'high', text: '前级高增益（易中间饱和）', short: '前级高增益' },
            { v: 'balanced', text: '均衡增益分配（无削波）', short: '均衡分配' },
          ]}
        />
      </div>
      <div className="w37-controls">
        <Slider label={hasSum ? '输入 v₁' : '输入 vᵢ'} value={vi} min={-2} max={2} step={0.05} onChange={setVi} show={`${fmt(vi, 2, true, true)} V`} disabled={locked} />
        <Slider label="电源轨 ±V_CC" value={rail} min={5} max={15} step={1} onChange={setRail} show={`±${rail} V`} disabled={locked} />
        {locked && <span className="w37-lock">引导例题进行中：数值随步骤揭晓，做完解锁</span>}
      </div>

      <div className="w37-svgwrap">
        <svg viewBox={`0 0 ${W} 344`} className="w37-svg" role="img" aria-label={`${n} 级级联运放：逐级电位追踪，电源轨 ±${rail} V`}>
          <rect x="1" y="1" width={W - 2} height="342" rx="10" className="w37-bg" />

          {/* input */}
          <Obj id="ch_vi" box={[x0 - 30, Y - 94, 100, 28]}>
            <circle cx={x0} cy={Y} r={4.5} fill="#1e40af" />
            <Wire
              pts={[
                [x0 + 4, Y],
                [x0 + 10, Y],
              ]}
            />
            <Bubble x={x0 + 18} y={Y - 80} text={`${hasSum ? 'v₁' : 'vᵢ'} = ${fmt(vi, 2, false, true)} V`} color="#1e40af" bg="#eff6ff" />
          </Obj>

          {chain.stages.map((s, i) => (
            <StageSym key={i} s={s} i={i} x={i === 0 ? x0 : sx(i)} st={st[i]} hideA={!show('A')} known={known(i)} />
          ))}

          {/* output nodes */}
          {st.map((s, i) => {
            const x = outX(i);
            const col = STAGE_COL[i];
            const kn = known(i);
            const sat = kn && s.sat;
            const txt = kn ? `v_o${i + 1} = ${fmt(s.out, 2, false, true)} V${sat ? ' 钳位' : ''}` : `v_o${i + 1} = ?`;
            return (
              <g key={i}>
                <Obj id="ch_io" box={[x - 26, Y + 2, 26, 18]}>
                  <line x1={x - 22} y1={Y + 10} x2={x - 6} y2={Y + 10} stroke={C.amber} strokeWidth={1.8} />
                  <polygon points={`${x - 6},${Y + 6} ${x},${Y + 10} ${x - 6},${Y + 14}`} fill={C.amber} />
                </Obj>
                <Obj id={`ch_vo${i + 1}`} box={[x - 60, Y - 94, 120, 28]}>
                  <line x1={x} y1={Y - 69} x2={x} y2={Y - 54} stroke={col.line} strokeWidth={1} strokeDasharray="3 2" />
                  <circle cx={x} cy={Y} r={4.5} fill={sat ? C.red : col.line} />
                  <Bubble x={x} y={Y - 80} text={txt} color={sat ? C.redT : col.text} bg={sat ? C.redSoft : col.soft} />
                </Obj>
                {i < n - 1 && (
                  <Wire
                    pts={[
                      [x, Y],
                      [sx(i + 1), Y],
                    ]}
                  />
                )}
              </g>
            );
          })}

          {/* load */}
          {chain.RL !== undefined && (
            <Obj id="ch_rl" box={[outX(n - 1) + 8, Y - 6, 60, 82]}>
              <Wire
                pts={[
                  [outX(n - 1), Y],
                  [outX(n - 1) + 26, Y],
                  [outX(n - 1) + 26, Y + 12],
                ]}
              />
              <Res x={outX(n - 1) + 17} y={Y + 12} w={18} h={40} label="" />
              <text x={outX(n - 1) + 40} y={Y + 28} className="w37-rn">
                R_L
              </text>
              <text x={outX(n - 1) + 40} y={Y + 41} className="w37-rv">
                {k(chain.RL)}
              </text>
              <Wire
                pts={[
                  [outX(n - 1) + 26, Y + 52],
                  [outX(n - 1) + 26, Y + 60],
                ]}
                width={1.7}
              />
              <Ground x={outX(n - 1) + 26} y={Y + 60} />
            </Obj>
          )}

          {/* rail corridor */}
          <Obj id="ch_rails" box={[4, Z - H - 10, W - 8, 2 * H + 20]}>
            <rect x={8} y={Z - railY} width={W - 16} height={2 * railY} fill="#f0fdf4" />
            <line x1={8} y1={Z - railY} x2={W - 8} y2={Z - railY} stroke={C.red} strokeWidth={1.4} strokeDasharray="6 4" />
            <line x1={8} y1={Z + railY} x2={W - 8} y2={Z + railY} stroke={C.red} strokeWidth={1.4} strokeDasharray="6 4" />
            <line x1={8} y1={Z} x2={W - 8} y2={Z} stroke="#94a3b8" strokeWidth={1} />
            <text x={10} y={Z - railY - 4} className="w37-tag" fill={C.redT}>
              +{rail} V
            </text>
            <text x={10} y={Z + railY + 12} className="w37-tag" fill={C.redT}>
              −{rail} V
            </text>
          </Obj>
          {cols.map((x, i) => (
            <g key={i}>
              <line x1={x} y1={Z - H} x2={x} y2={Z + H} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="2 3" />
              <text x={x} y={Z + H + 16} className="w37-lbl" textAnchor="middle" fill={i === 0 ? '#1e40af' : STAGE_COL[i - 1].text}>
                {i === 0 ? (hasSum ? 'v₁' : 'vᵢ') : `v_o${i}`}
              </text>
            </g>
          ))}
          <polyline points={trace.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.tealT} strokeWidth={2} strokeLinejoin="round" />
          <circle cx={x0} cy={cy(vi)} r={4.5} fill="#1e40af" />
          {st.map((s, i) => {
            const x = outX(i);
            if (!known(i))
              return (
                <g key={i}>
                  <circle cx={x} cy={Z} r={9} fill="#fff" stroke={C.teal} strokeWidth={1.5} />
                  <text x={x} y={Z + 4} className="w37-val" textAnchor="middle" fill={C.tealT}>
                    ?
                  </text>
                </g>
              );
            const blind = Math.abs(s.naive - s.out) > 1e-6;
            return (
              <g key={i}>
                {s.sat && (
                  <>
                    <line x1={x - 12} y1={cy(s.lin)} x2={x} y2={cy(s.out)} stroke={C.red} strokeWidth={1.4} strokeDasharray="3 2" />
                    <circle cx={x - 12} cy={cy(s.lin)} r={4.5} fill="#fff" stroke={C.red} strokeWidth={1.8} />
                    <text x={x - 20} y={cy(s.lin) + 4} className="w37-tag w37-ht" textAnchor="end" fill={C.redT}>
                      理论 {fmt(s.lin, 1, true, true)}
                    </text>
                  </>
                )}
                {!s.sat && blind && (
                  <>
                    <circle cx={x - 12} cy={cy(s.naive)} r={4} fill="#fff" stroke="#64748b" strokeWidth={1.6} />
                    <text x={x - 20} y={cy(s.naive) + 4} className="w37-tag w37-ht" textAnchor="end" fill="#5f626b">
                      盲算 {fmt(s.naive, 1, true, true)}
                    </text>
                  </>
                )}
                <circle cx={x} cy={cy(s.out)} r={5} fill={s.sat ? C.red : STAGE_COL[i].line} stroke="#fff" strokeWidth={1.2} />
                <text x={x + 8} y={cy(s.out) + 4} className="w37-val w37-ht" fill={s.sat ? C.redT : STAGE_COL[i].text}>
                  {fmt(s.out, 2, true, true)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="w37-tele">
        <Chip
          k={hasSum ? '线性区 vₒ' : `A = ${n === 3 ? 'A₁A₂A₃' : 'A₁A₂'}`}
          v={!show('A') ? '?' : hasSum ? `${fmt(A, 2, true)}·v₁ ${offset < 0 ? '−' : '+'} ${fmt(Math.abs(offset), 2)} V` : fmt(A, 2, true)}
          tone={!show('A') ? 'hid' : 'info'}
          id="ch_gain"
        />
        {st.map((s, i) => (
          <Chip key={i} k={`i_o${i + 1}`} v={show('i') ? `${fmt(s.iO, 2, true, true)} mA` : '?'} tone={show('i') ? undefined : 'hid'} id="ch_io" />
        ))}
        <Chip
          k="饱和检验"
          v={!allV ? '?' : firstSat < 0 ? '全链路线性 ✓' : `U${SUB[firstSat]} 先行饱和：${fmt(st[firstSat].lin, 1, true, true)} → ${fmt(st[firstSat].out, 1, true, true)} V`}
          tone={!allV ? 'hid' : firstSat < 0 ? 'ok' : 'bad'}
          id="ch_rails"
        />
        {allV && Math.abs(last.naive - last.out) > 1e-6 && <Chip k="盲算 vs 真实 vₒ" v={`${fmt(last.naive, 2, true, true)} vs ${fmt(last.out, 2, true, true)} V`} tone="bad" />}
      </div>
    </div>
  );
}
