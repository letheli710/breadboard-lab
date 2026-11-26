// W3-L2 layer 02 · Fig. 5.8 理想运放黄金法则: the ideal op amp with its two golden rules marked
// (virtual open: the X on each input, i₁ = i₂ = 0; virtual short: the gold bridge v₁ = v₂). The
// feedback switch opens the loop: the output slams into the rail, the bridge breaks (v₁ ≠ v₂),
// the virtual open stays. The X-ray opens the output stage: the VCVS with Rₒ = 0, the hidden
// rails, the unknown output current iₒ and the forbidden output-node KCL.
// Stage params: w32_fb, w32_rules, w32_xray.

import { VCC, openLoop, sci } from './model';
import { Arrow, Badge, C, Chip, Cross, Diamond, Dot, Ground, Hit, Hot, Toggle, Txt, Wire, useW32 } from './parts';

const N1: [number, number] = [130, 100];
const N2: [number, number] = [130, 180];
const O: [number, number] = [420, 140];
const OPEN = { A: 2e5, v1: 0, v2: 1e-3 };

export default function GoldenRulesLayer() {
  const { fb, setFb, rules, setRules, xray, setXray } = useW32();
  const ol = openLoop(OPEN.A, OPEN.v1, OPEN.v2);

  return (
    <div className="w32-layer">
      <div className="w32-dock">
        <Toggle on={fb} onChange={setFb}>
          负反馈
        </Toggle>
        <Toggle on={rules} onChange={setRules}>
          标出黄金法则
        </Toggle>
        <Toggle on={xray} onChange={setXray}>
          X-Ray 输出端
        </Toggle>
      </div>

      <svg className="w32-svg" viewBox="0 18 560 268" role="img" aria-label={fb ? '理想运放：负反馈闭合，虚断与虚短同时成立' : '理想运放开环：虚短失效，输出饱和'}>
        <rect x="2" y="20" width="556" height="264" rx="10" className={`w32-canvas ${fb ? '' : 'bad'}`} />

        {/* the feedback network: node o → top → node 1 */}
        <Hot id="fb" ids={['rf']}>
          <Hit d={`M ${O[0]} ${O[1]} V 44 H ${N1[0]} V ${N1[1]}`} />
          {fb ? (
            <Wire d={`M ${O[0]} ${O[1]} V 44 H ${N1[0]} V ${N1[1]}`} color={C.blueLine} dash="7 4" className="w32-flow" />
          ) : (
            <g>
              <Wire d={`M ${O[0]} ${O[1]} V 44 H 392 M 368 44 H ${N1[0]} V ${N1[1]}`} color="#94a3b8" dash="4 5" />
              <Cross at={[380, 44]} />
              <Txt x={380} y={66} anchor="middle" color={C.red} size={11}>
                反馈断开
              </Txt>
            </g>
          )}
          <rect x={214} y={33} width={112} height={22} rx={5} fill="#fff" stroke={fb ? C.blueLine : '#94a3b8'} strokeWidth={1.5} className="w32-body" />
          <Txt x={270} y={48} anchor="middle" color={fb ? C.blue : C.muted} size={11}>
            负反馈网络（R_f）
          </Txt>
        </Hot>

        {/* inputs */}
        <Hot id="node_1">
          <Hit d={`M 40 ${N1[1]} H 220`} />
          <Wire d={`M 40 ${N1[1]} H ${xray ? 232 : 220}`} />
          <Dot at={[40, N1[1]]} hollow />
          <Txt x={36} y={N1[1] - 9} color={C.amber} size={12}>
            {fb ? 'v₁' : `v₁ = ${OPEN.v1} V`}
          </Txt>
        </Hot>
        <Hot id="node_2">
          <Hit d={`M 40 ${N2[1]} H 220`} />
          <Wire d={`M 40 ${N2[1]} H ${xray ? 232 : 220}`} />
          <Dot at={[40, N2[1]]} hollow />
          <Txt x={36} y={N2[1] + 19} color={C.green} size={12}>
            {fb ? 'v₂' : 'v₂ = 1 mV'}
          </Txt>
        </Hot>
        <Dot at={N1} color={C.amberLine} />
        <Dot at={N2} color={C.amberLine} />

        {/* the op amp */}
        <Hot id="opamp" ids={xray ? [] : ['vcvs', 'ri', 'ro']}>
          <polygon
            points="220,70 220,210 340,140"
            fill={xray ? '#f8fafc' : '#fff'}
            stroke={fb ? C.blueLine : C.redLine}
            strokeWidth={xray ? 1.8 : 2.8}
            strokeDasharray={xray ? '6 4' : undefined}
            className="w32-body"
          />
          <Txt x={227} y={106} color={C.red} size={15} mono>
            −
          </Txt>
          <Txt x={227} y={186} color={C.green} size={15} mono>
            +
          </Txt>
        </Hot>

        {xray ? (
          <g>
            <Hot id="ri">
              <Dot at={[232, N1[1]]} color={C.greenLine} r={3.6} hollow />
              <Dot at={[232, N2[1]]} color={C.greenLine} r={3.6} hollow />
              <Txt x={238} y={145} color={C.green} size={11}>
                Rᵢ = ∞
              </Txt>
            </Hot>
            <Hot id="rails">
              <Wire d="M 296 74 V 122" color={C.amberLine} dash="3 3" width={1.6} />
              <Arrow from={[296, 110]} to={[296, 124]} color={C.amberLine} width={1.6} />
              <Txt x={300} y={68} anchor="middle" color={C.amber} size={10.5}>
                ±V_CC（暗中供流）
              </Txt>
            </Hot>
            <Hot id="vcvs">
              <Wire d="M 296 154 V 226" />
              <Ground at={[296, 226]} />
              <Diamond at={[296, 140]} s={14} color={C.redLine} />
            </Hot>
            <Hot id="ro">
              <Wire d="M 310 140 H 340" color={C.redLine} />
              <Txt x={326} y={157} anchor="middle" color={C.red} size={10}>
                Rₒ = 0
              </Txt>
            </Hot>
          </g>
        ) : (
          <g>
            <Hot id="vcvs">
              <Txt x={276} y={136} anchor="middle" color={C.ink} size={12}>
                IDEAL
              </Txt>
              <Txt x={276} y={152} anchor="middle" color={C.muted} size={11}>
                A → ∞
              </Txt>
            </Hot>
            <Hot id="ri">
              <Txt x={212} y={144} anchor="end" color={C.muted} size={10.5}>
                Rᵢ → ∞
              </Txt>
            </Hot>
            <Hot id="ro">
              <Txt x={346} y={130} color={C.muted} size={10}>
                Rₒ → 0
              </Txt>
            </Hot>
          </g>
        )}

        {/* output */}
        <Hot id="node_o">
          <Hit d={`M 340 140 H 500`} />
          <Wire d={`M 340 140 H 500`} color={fb ? C.blueLine : C.redLine} width={2.8} />
          <Dot at={O} color={fb ? C.blueLine : C.redLine} />
          <Dot at={[500, 140]} color={fb ? C.blueLine : C.redLine} hollow />
          {fb ? (
            <Txt x={506} y={145} color={C.blue} size={13}>
              vₒ
            </Txt>
          ) : (
            <g>
              <Badge x={500} y={116} anchor="end" text={`vₒ = +V_CC = +${VCC} V`} color={C.red} bg="#fef2f2" />
              <Txt x={496} y={166} anchor="end" color={C.red} size={11}>
                瞬间饱和撞轨！
              </Txt>
            </g>
          )}
          {xray && <circle cx={O[0]} cy={O[1]} r={14} fill="none" stroke={C.redLine} strokeWidth={2} strokeDasharray="4 3" className="w32-pulse" />}
        </Hot>

        {xray && (
          <g>
            <Hot id="io">
              <Arrow from={[348, 129]} to={[402, 129]} color={C.redLine} />
              <Txt x={374} y={121} anchor="middle" color={C.red} size={11}>
                iₒ（未知！）
              </Txt>
            </Hot>
            <Txt x={428} y={96} color={C.blue} size={10.5}>
              i_f → R_f
            </Txt>
            <Hot id="rl">
              <Wire d={`M ${O[0]} ${O[1]} V 236`} color="#64748b" dash="5 3" width={2} />
              <Txt x={428} y={230} color={C.muted} size={10.5}>
                i_L → 负载 R_L
              </Txt>
            </Hot>
            <g>
              <rect x={436} y={174} width={118} height={40} rx={6} fill="#fef2f2" stroke={C.redLine} strokeWidth={1.3} />
              <Txt x={444} y={190} color={C.red} size={10.5}>
                ✕ 禁区：求 vₒ 时
              </Txt>
              <Txt x={444} y={206} color={C.red} size={10.5}>
                不对节点 o 列 KCL
              </Txt>
            </g>
          </g>
        )}

        {rules && (
          <g>
            <Hot id="v_open">
              <Cross at={[207, N1[1]]} />
              <Cross at={[207, N2[1]]} />
              <Txt x={182} y={90} anchor="middle" color={C.red} size={11.5}>
                i₁ = 0
              </Txt>
              <Txt x={182} y={199} anchor="middle" color={C.red} size={11.5}>
                i₂ = 0
              </Txt>
            </Hot>
            <Hot id="v_short">
              {fb ? (
                <g>
                  <Wire d={`M ${N1[0]} 108 V 172`} color={C.amberLine} dash="4 3" width={2.4} />
                  <rect x={18} y={124} width={104} height={34} rx={5} fill="#fffbeb" stroke={C.amberLine} strokeWidth={1.4} />
                  <Txt x={70} y={138} anchor="middle" color={C.amber} size={11}>
                    虚短 v₁ = v₂
                  </Txt>
                  <Txt x={70} y={152} anchor="middle" color="#92400e" size={10}>
                    v_d = 0（非导线）
                  </Txt>
                </g>
              ) : (
                <g>
                  <Wire d={`M ${N1[0]} 108 V 128 M ${N1[0]} 152 V 172`} color="#94a3b8" dash="4 3" width={2.4} />
                  <Txt x={N1[0]} y={145} anchor="middle" color={C.red} size={15}>
                    ≠
                  </Txt>
                  <rect x={18} y={124} width={100} height={34} rx={5} fill="#fef2f2" stroke={C.redLine} strokeWidth={1.4} />
                  <Txt x={68} y={138} anchor="middle" color={C.red} size={11}>
                    v₁ ≠ v₂
                  </Txt>
                  <Txt x={68} y={152} anchor="middle" color={C.red} size={10}>
                    虚短失效！
                  </Txt>
                </g>
              )}
            </Hot>
          </g>
        )}
      </svg>

      <div className="w32-telemetry" aria-live="polite">
        <Chip ids={['v_open', 'ri']} label="虚断 i₁ = i₂ = 0" value="成立" tone="ok" />
        <Chip ids={['v_short']} label="虚短 v₁ = v₂" value={fb ? '成立' : '失效'} tone={fb ? 'ok' : 'bad'} />
        {fb ? (
          <Chip ids={['node_o']} label="vₒ" value="有限（线性区）" />
        ) : (
          <Chip ids={['node_o']} label={`A·v_d = ${sci(OPEN.A)} × 1 mV`} value={`${Math.round(ol.linear)} V ⇒ 钳位 +${VCC} V`} tone="bad" />
        )}
        {xray && <Chip ids={['io', 'node_o']} label="iₒ" value="≠ 0，未知 → 最后反算" tone="warn" />}
      </div>
    </div>
  );
}
