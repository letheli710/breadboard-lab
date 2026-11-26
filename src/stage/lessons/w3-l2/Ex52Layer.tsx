// W3-L2 layer 03 · Fig. 5.9 Example 5.2 节点实战台: the circuit of Example 5.1 with an ideal op
// amp, walked through the four-step SOP (① check the negative feedback, ② mark the golden rules,
// ③ KCL at node 1 only — node o is the forbidden zone, ④ back-calculate iₒ at node o last). A load
// R_L (none / 2 kΩ / 3 kΩ) shows vₒ staying put while iₒ grows; "对比 741" sets the exact 741
// solution beside the ideal one. Example 5.2's numbers stay "?" until the guided example is done
// (w32_reveal) or the student asks. Stage params: w32_step, w32_rl, w32_cmp, w32_reveal.

import { Tex } from '../../StageText';
import { EX51, num, pct, relErr, solveIdeal, solveReal } from './model';
import { Arrow, Badge, C, Chip, Cross, Dot, Ground, Hit, Hot, ResBox, Seg, Toggle, Txt, VSource, Wire, useW32 } from './parts';

const R = String.raw;
const N1: [number, number] = [110, 110];
const N2: [number, number] = [215, 170];
const O: [number, number] = [440, 140];
const BUS = 262;

const STEPS = [
  { v: 0, t: '全图', short: '全图' },
  { v: 1, t: '① 查负反馈', short: '①' },
  { v: 2, t: '② 标断与短', short: '②' },
  { v: 3, t: '③ 节点 1 KCL', short: '③' },
  { v: 4, t: '④ 反算 iₒ', short: '④' },
];

const mA = (x: number) => `${num(x * 1e3, 6)} mA`;

export default function Ex52Layer() {
  const { step, setStep, rl, setRl, cmp, setCmp, reveal, setReveal } = useW32();
  const RL = rl > 0 ? rl : undefined;
  const ideal = solveIdeal({ R1: EX51.R1, Rf: EX51.Rf, vs: EX51.vs, RL });
  const real = solveReal({ ...EX51, RL });
  const q = (s: string) => (reveal ? s : '?');
  const rlK = RL ? `${RL / 1000}\\text{ k}\\Omega` : '';

  const board = [
    R`\text{Fig. 5.9：}R_1 = 10\text{ k}\Omega,\; R_f = 20\text{ k}\Omega,\; v_s = 2\text{ V}\;(\text{理想运放})`,
    R`\text{输出 } v_o \xrightarrow{R_f} \text{反相端 } (-) \implies \text{负反馈成立，启用黄金法则}`,
    R`i_1 = i_2 = 0\;(\text{虚断}), \qquad v_1 = v_2 = v_s\;(\text{虚短})`,
    R`\text{节点 1：}\frac{v_o - v_1}{R_f} = \frac{v_1}{R_1} \implies \frac{v_o}{v_s} = 1 + \frac{R_f}{R_1}` + (reveal ? R` = 3,\quad v_o = 6\text{ V}` : ''),
    RL
      ? R`\text{节点 o（最后）：}i_o = \frac{v_o - v_1}{R_f} + \frac{v_o}{R_L}` +
        (reveal ? R` = \frac{6 - 2}{20\text{ k}\Omega} + \frac{6}{${rlK}} = ${num(ideal.io * 1e3, 4)}\text{ mA}` : '')
      : R`\text{节点 o（最后）：}i_o = \frac{v_o - v_1}{R_f}` + (reveal ? R` = \frac{6 - 2}{20\text{ k}\Omega} = 0.2\text{ mA}` : ''),
  ][Math.max(0, Math.min(4, step))];

  return (
    <div className="w32-layer">
      <div className="w32-dock">
        <Seg label="SOP" value={step} options={STEPS} onChange={setStep} />
        <Seg
          label="负载"
          value={rl}
          options={[
            { v: 0, t: '无 R_L', short: '无' },
            { v: 2000, t: '2 kΩ' },
            { v: 3000, t: '3 kΩ' },
          ]}
          onChange={setRl}
        />
        <Toggle on={cmp} onChange={setCmp}>
          对比 741
        </Toggle>
        {!reveal && (
          <button className="w32-btn" onClick={() => setReveal(true)}>
            显示数值
          </button>
        )}
      </div>

      <svg className="w32-svg" viewBox="0 18 560 278" role="img" aria-label={`Fig. 5.9 Example 5.2 理想运放节点分析，SOP 第 ${step} 步`}>
        <rect x="2" y="20" width="556" height="274" rx="10" className="w32-canvas" />

        {/* R_f feedback */}
        <Hot id="rf" ids={['fb']}>
          <Hit d={`M ${N1[0]} ${N1[1]} V 50 H ${O[0]} V ${O[1]}`} />
          <Wire d={`M ${N1[0]} ${N1[1]} V 50 H 240 M 320 50 H ${O[0]} V ${O[1]}`} />
          {step === 1 && <Wire d={`M ${O[0]} ${O[1]} V 50 H ${N1[0]} V ${N1[1]}`} color={C.amberLine} dash="7 5" width={3.4} className="w32-flow" />}
          <ResBox x={240} y={40} w={80} h={20} color={C.blueLine} />
          <Txt x={280} y={34} anchor="middle" color={C.blue} size={12}>
            R_f = 20 kΩ
          </Txt>
        </Hot>
        {step === 1 && (
          <Txt x={340} y={76} anchor="middle" color={C.amber} size={11.5}>
            负反馈：vₒ 经 R_f 接回反相端 (−)
          </Txt>
        )}
        {step === 3 && (
          <Hot id="rf">
            <Arrow from={[318, 70]} to={[244, 70]} color={C.blueLine} />
            <Txt x={281} y={84} anchor="middle" color={C.blue} size={10.5}>
              (vₒ − v₁)/R_f
            </Txt>
          </Hot>
        )}

        {/* R₁ */}
        <Hot id="r1">
          <Hit d={`M ${N1[0]} ${N1[1]} V ${BUS}`} />
          <Wire d={`M ${N1[0]} ${N1[1]} V 160 M ${N1[0]} 220 V ${BUS}`} />
          <ResBox x={100} y={160} w={20} h={60} color={C.amberLine} />
          <Txt x={92} y={186} anchor="end" color={C.amber} size={12}>
            R₁
          </Txt>
          <Txt x={92} y={201} anchor="end" color={C.muted} size={11}>
            10 kΩ
          </Txt>
        </Hot>
        <Hot id="i_loop">
          <Arrow from={[132, 168]} to={[132, 210]} color={C.amberLine} />
          <Txt x={128} y={232} color={C.amber} size={12}>
            {step === 3 ? 'v₁/R₁' : 'i'}
          </Txt>
        </Hot>

        {/* vₛ */}
        <Hot id="vs">
          <Wire d={`M ${N2[0]} ${N2[1]} V 196 M ${N2[0]} 234 V ${BUS}`} />
          <VSource at={[N2[0], 215]} />
          <Txt x={240} y={212} color={C.green} size={12}>
            vₛ
          </Txt>
          <Txt x={240} y={227} color={C.muted} size={11}>
            2 V
          </Txt>
        </Hot>
        <Wire d={`M ${N1[0]} ${BUS} H ${N2[0]}`} color={C.muted} />
        <Wire d={`M 160 ${BUS} V 270`} color={C.muted} />
        <Ground at={[160, 270]} />

        {/* inputs and the ideal op amp */}
        <Hot id="node_1">
          <Hit d={`M ${N1[0]} ${N1[1]} H 262`} />
          <Wire d={`M ${N1[0]} ${N1[1]} H 262`} color={C.amberLine} />
        </Hot>
        <Hot id="node_2">
          <Hit d={`M ${N2[0]} ${N2[1]} H 262`} />
          <Wire d={`M ${N2[0]} ${N2[1]} H 262`} color={C.greenLine} />
        </Hot>
        <Hot id="opamp">
          <polygon points="262,80 262,200 372,140" fill="#fff" stroke={C.blueLine} strokeWidth={2.8} className="w32-body" />
          <Txt x={270} y={116} color={C.red} size={15} mono>
            −
          </Txt>
          <Txt x={270} y={176} color={C.green} size={15} mono>
            +
          </Txt>
          <Txt x={300} y={145} color={C.ink} size={11.5}>
            IDEAL
          </Txt>
        </Hot>

        {/* output and the load */}
        <Hot id="node_o">
          <Hit d={`M 372 140 H 510`} />
          <Wire d={`M 372 140 H 510`} color={C.blueLine} />
        </Hot>
        <Hot id="rl">
          {RL ? (
            <g>
              <Hit d={`M ${O[0]} ${O[1]} V ${BUS}`} />
              <Wire d={`M ${O[0]} ${O[1]} V 180 M ${O[0]} 240 V ${BUS}`} />
              <ResBox x={430} y={180} w={20} h={60} color="#7c3aed" />
              <Txt x={458} y={206} color={C.violet} size={12}>
                R_L
              </Txt>
              <Txt x={458} y={221} color={C.muted} size={11}>
                {RL / 1000} kΩ
              </Txt>
              <Ground at={[O[0], BUS]} />
            </g>
          ) : (
            <g opacity={0.55}>
              <Wire d={`M ${O[0]} ${O[1]} V 180`} color="#94a3b8" dash="4 4" width={1.8} />
              <rect x={430} y={180} width={20} height={50} rx={3} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" />
              <Txt x={458} y={208} color={C.muted} size={11} weight={600}>
                R_L 未接
              </Txt>
            </g>
          )}
        </Hot>

        {step === 2 && (
          <g>
            <Hot id="v_open">
              <Cross at={[252, N1[1]]} s={5} />
              <Cross at={[252, N2[1]]} s={5} />
              <Txt x={228} y={137} anchor="end" color={C.red} size={10.5}>
                i₁ = i₂ = 0
              </Txt>
            </Hot>
            <Hot id="v_short">
              <Wire d={`M 238 116 V 164`} color={C.amberLine} dash="4 3" width={2.4} />
              <Txt x={228} y={152} anchor="end" color={C.amber} size={10.5}>
                v₁ = v₂
              </Txt>
            </Hot>
          </g>
        )}
        {step === 3 && (
          <g>
            <circle cx={N1[0]} cy={N1[1]} r={13} fill="none" stroke={C.greenLine} strokeWidth={2.4} />
            <circle cx={O[0]} cy={O[1]} r={14} fill="none" stroke={C.redLine} strokeWidth={2} strokeDasharray="4 3" className="w32-pulse" />
            <Txt x={O[0] + 18} y={O[1] + 22} color={C.red} size={10.5}>
              禁区：先不列
            </Txt>
          </g>
        )}
        {step === 4 && (
          <g>
            <circle cx={O[0]} cy={O[1]} r={14} fill="none" stroke={C.greenLine} strokeWidth={2.4} />
            <Hot id="io">
              <Arrow from={[380, 152]} to={[424, 152]} color={C.greenLine} />
              <Txt x={400} y={168} anchor="middle" color={C.green} size={12}>
                iₒ
              </Txt>
            </Hot>
            {RL && (
              <Hot id="rl">
                <Arrow from={[424, 188]} to={[424, 228]} color="#7c3aed" />
                <Txt x={418} y={214} anchor="end" color={C.violet} size={11}>
                  i_L
                </Txt>
              </Hot>
            )}
          </g>
        )}

        <Dot at={N1} color={C.amberLine} />
        <Dot at={N2} color={C.greenLine} />
        <Dot at={O} color={C.blueLine} />
        <Dot at={[510, 140]} color={C.blueLine} hollow />

        <Hot id="node_1">
          <Badge x={118} y={94} text={`v₁ = ${q('2 V')}`} color={C.amber} bg="#fffbeb" />
        </Hot>
        <Hot id="node_2">
          <Badge x={205} y={186} anchor="end" text="v₂ = 2 V" color={C.green} bg="#f0fdf4" />
        </Hot>
        <Hot id="node_o">
          <Badge x={452} y={122} text={`vₒ = ${q(`${num(ideal.vo, 6)} V`)}`} color={C.blue} bg="#f0f9ff" />
        </Hot>
      </svg>

      <div className="w32-board" aria-live="polite">
        <Tex tex={board} display />
      </div>

      <div className="w32-telemetry">
        <Chip ids={['node_o']} label="vₒ/vₛ" value={q(num(ideal.gain, 6))} tone={reveal ? '' : 'hid'} />
        <Chip ids={['node_o']} label="vₒ" value={q(`${num(ideal.vo, 6)} V`)} tone={reveal ? '' : 'hid'} />
        <Chip ids={['i_loop', 'r1', 'rf']} label="i" value={q(mA(ideal.i))} tone={reveal ? '' : 'hid'} />
        {RL && <Chip ids={['rl']} label="i_L" value={q(mA(ideal.iL))} tone={reveal ? '' : 'hid'} />}
        <Chip ids={['io', 'node_o']} label="iₒ" value={q(mA(ideal.io))} tone={reveal ? '' : 'hid'} />
        {cmp && (
          <>
            <Chip label="741 vₒ" value={q(`${num(real.vo, 7)} V`)} tone={reveal ? 'warn' : 'hid'} />
            <Chip label="741 iₒ" value={q(mA(real.io))} tone={reveal ? 'warn' : 'hid'} />
            <Chip label="误差" value={q(pct(relErr(real.vo, ideal.vo), 2))} tone={reveal ? 'ok' : 'hid'} />
          </>
        )}
      </div>
    </div>
  );
}
