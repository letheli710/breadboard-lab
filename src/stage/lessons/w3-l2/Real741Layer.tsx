// W3-L2 layer 01 · Fig. 5.6 真实 741 精确求解台: the closed loop of Sadiku Example 5.1, either as
// drawn (Fig. 5.6a, the 741 triangle) or with the 741 opened up into its equivalent circuit
// (Fig. 5.6b: Rᵢ between the inputs, the VCVS A·v_d behind Rₒ). An open-loop-gain slider (log
// scale, 10² … 10⁷) re-solves the two KCL rows exactly; the probes read v₁, v_d, i₁, i and the
// error against the ideal gain 1 + R_f/R₁ = 3. Stage params: w32_model, w32_a.

import { EX51, num, pct, relErr, sci, si, solveReal } from './model';
import { Arrow, Badge, C, Chip, Diamond, Dot, Ground, Hit, Hot, ResBox, Seg, Txt, VSource, Wire, useW32 } from './parts';

const N1: [number, number] = [110, 110];
const N2: [number, number] = [215, 170];
const BUS = 262;

export default function Real741Layer() {
  const { model, setModel, A, setA } = useW32();
  const p = { ...EX51, A };
  const s = solveReal(p);
  const b = model === 'b';
  const O: [number, number] = [440, 140];

  return (
    <div className="w32-layer">
      <div className="w32-dock">
        <Seg
          label="视图"
          value={model}
          options={[
            { v: 'a', t: '(a) 闭环拓扑', short: '(a) 拓扑' },
            { v: 'b', t: '(b) 741 等效模型', short: '(b) 等效' },
          ]}
          onChange={setModel}
        />
        <label className="w32-slider">
          <span>开环增益 A</span>
          <input type="range" min={2} max={7} step={0.01} value={Math.log10(A)} onChange={(e) => setA(10 ** Number(e.target.value))} aria-label="开环增益 A（对数刻度）" />
          <b>{sci(A)}</b>
        </label>
        <button className="w32-btn" onClick={() => setA(EX51.A)} disabled={Math.abs(A - EX51.A) < 1}>
          741 默认
        </button>
      </div>

      <svg className="w32-svg" viewBox="0 18 560 278" role="img" aria-label={b ? 'Fig. 5.6(b) 真实 741 等效求解电路' : 'Fig. 5.6(a) 741 同相负反馈闭环电路'}>
        <rect x="2" y="20" width="556" height="274" rx="10" className="w32-canvas" />

        {/* R_f feedback: node 1 → top → output node */}
        <Hot id="rf">
          <Hit d={`M ${N1[0]} ${N1[1]} V 50 H ${O[0]} V ${O[1]}`} />
          <Wire d={`M ${N1[0]} ${N1[1]} V 50 H 240`} />
          <Wire d={`M 320 50 H ${O[0]} V ${O[1]}`} />
          <ResBox x={240} y={40} w={80} h={20} color={C.blueLine} />
          <Txt x={280} y={34} anchor="middle" color={C.blue} size={12}>
            R_f = 20 kΩ
          </Txt>
        </Hot>

        {/* R₁ to ground, and the loop current i */}
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
            i
          </Txt>
        </Hot>

        {/* the source vₛ on the + input */}
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

        {/* ground bus */}
        <Wire d={`M ${N1[0]} ${BUS} H ${b ? 355 : N2[0]}`} color={C.muted} />
        <Wire d={`M 160 ${BUS} V 270`} color={C.muted} />
        <Ground at={[160, 270]} />

        {b ? (
          <g>
            <rect x={262} y={72} width={148} height={166} rx={8} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 4" />
            <Txt x={336} y={88} anchor="middle" color={C.muted} size={11} weight={600}>
              741 内部等效模型
            </Txt>
            {/* input leads to Rᵢ */}
            <Hot id="node_1" ids={['vd']}>
              <Hit d={`M ${N1[0]} ${N1[1]} H 280`} />
              <Wire d={`M ${N1[0]} ${N1[1]} H 280 V 122`} color={C.amberLine} />
            </Hot>
            <Hot id="node_2" ids={['vd']}>
              <Hit d={`M ${N2[0]} ${N2[1]} H 280`} />
              <Wire d={`M ${N2[0]} ${N2[1]} H 280 V 158`} color={C.greenLine} />
            </Hot>
            <Hot id="ri" ids={['vd']}>
              <ResBox x={272} y={122} w={16} h={36} color="#db2777" />
              <Txt x={294} y={131} color={C.pink} size={11}>
                Rᵢ = 2 MΩ
              </Txt>
            </Hot>
            <Hot id="vd">
              <Txt x={294} y={154} color={C.amber} size={11}>
                v_d
              </Txt>
            </Hot>
            <Hot id="i1">
              <Arrow from={[248, 101]} to={[272, 101]} color={C.amberLine} width={1.8} />
              <Txt x={258} y={96} anchor="middle" color={C.amber} size={10.5}>
                i₁
              </Txt>
            </Hot>
            {/* VCVS A·v_d and Rₒ */}
            <Hot id="vcvs">
              <Wire d={`M 355 184 V 140 H 372 M 355 216 V ${BUS}`} />
              <Diamond at={[355, 200]} />
              <Txt x={377} y={204} color={C.blue} size={11.5}>
                A·v_d
              </Txt>
              <Txt x={377} y={219} color={C.muted} size={10.5}>
                A = {sci(A)}
              </Txt>
            </Hot>
            <Hot id="ro">
              <ResBox x={372} y={132} w={32} h={16} color="#ea580c" />
              <Txt x={388} y={125} anchor="middle" color={C.orange} size={10.5}>
                Rₒ = 50 Ω
              </Txt>
            </Hot>
            <Hot id="node_o">
              <Hit d={`M 404 140 H 510`} />
              <Wire d={`M 404 140 H 510`} color={C.blueLine} />
            </Hot>
          </g>
        ) : (
          <g>
            <Hot id="node_1">
              <Hit d={`M ${N1[0]} ${N1[1]} H 262`} />
              <Wire d={`M ${N1[0]} ${N1[1]} H 262`} color={C.amberLine} />
            </Hot>
            <Hot id="node_2">
              <Hit d={`M ${N2[0]} ${N2[1]} H 262`} />
              <Wire d={`M ${N2[0]} ${N2[1]} H 262`} color={C.greenLine} />
            </Hot>
            <Hot id="opamp" ids={['ri', 'ro', 'vcvs']}>
              <polygon points="262,80 262,200 372,140" fill="#fff" stroke={C.blueLine} strokeWidth={2.6} className="w32-body" />
              <Txt x={270} y={116} color={C.red} size={15} mono>
                −
              </Txt>
              <Txt x={270} y={176} color={C.green} size={15} mono>
                +
              </Txt>
              <Txt x={302} y={145} color={C.ink} size={12}>
                741
              </Txt>
            </Hot>
            <Hot id="node_o">
              <Hit d={`M 372 140 H 510`} />
              <Wire d={`M 372 140 H 510`} color={C.blueLine} />
            </Hot>
          </g>
        )}

        <Dot at={N1} color={C.amberLine} />
        <Dot at={N2} color={C.greenLine} />
        <Dot at={O} color={C.blueLine} />
        <Dot at={[510, 140]} color={C.blueLine} hollow />

        <Hot id="node_1">
          <Badge x={118} y={94} text={`v₁ = ${num(s.v1, 6)} V`} color={C.amber} bg="#fffbeb" />
        </Hot>
        <Hot id="node_2">
          <Badge x={205} y={186} anchor="end" text="v₂ = 2 V" color={C.green} bg="#f0fdf4" />
        </Hot>
        <Hot id="node_o">
          <Badge x={444} y={122} text={`vₒ = ${num(s.vo, 6)} V`} color={C.blue} bg="#f0f9ff" />
        </Hot>
      </svg>

      <div className="w32-telemetry" aria-live="polite">
        <Chip ids={['node_o']} label="vₒ/vₛ" value={num(s.gain, 7)} />
        <Chip ids={['vd', 'ri']} label="v_d" value={si(s.vd, 'V')} />
        <Chip ids={['i1', 'ri']} label="i₁" value={si(s.i1, 'A')} />
        <Chip ids={['i_loop', 'r1']} label="i" value={`${num(s.i * 1e3, 6)} mA`} />
        <Chip label="与理想 3 的误差" value={pct(relErr(s.gain, 3))} tone={relErr(s.gain, 3) < 1e-4 ? 'ok' : 'warn'} />
      </div>
    </div>
  );
}
