// Layer "01 2D 动态原理图": the inverting amplifier of Sadiku Fig. 5.10 drawn live. The virtual
// ground bubble on node 1 shows v− = 0 V while the loop holds (gold), and turns red with the real
// v− once the output clips; a red cross at Pin 2 marks i− = 0 (virtual open); current dots run
// v_i → R1 → node 1 and bend 100 % up through R_f (their speed follows |i1|). Sliders: v_i
// (−5 … +5 V), R1 (1 … 100 kΩ), R_f (10 … 100 kΩ), and the supply switch (±9 V / single +9 V).
// While the guided example (Example 5.3) runs, the numbers it asks for show as "?".

import type { ReactNode } from 'react';
import { prefersReducedMotion } from '../../../ui/reveal';
import { Chip, Dock, hov, MaskNote, useCircuit, useClearHoverOnUnmount, useIsLit } from './common';
import { fmtI, fmtR, fmtV, num, STATE_ZH } from './model';

function Obj({ ids, className = '', children }: { ids: string[]; className?: string; children: ReactNode }) {
  const isLit = useIsLit();
  return (
    <g className={`w33-obj ${className} ${isLit(...ids) ? 'lit' : ''}`} {...hov([ids[0]])}>
      {children}
    </g>
  );
}

const PATH = 'M 58 180 V 120 H 250 V 52 H 470 V 150';
const PATH_LEN = 60 + 192 + 68 + 220 + 98;

/** current dots along v_i → R1 → node 1 → R_f → output; direction and speed follow i1 */
function Particles({ i1 }: { i1: number }) {
  const ua = Math.abs(i1) * 1e6;
  if (ua < 0.5 || prefersReducedMotion()) return null;
  const speed = Math.min(220, 30 + ua * 0.9); // px / s
  const dur = PATH_LEN / speed;
  const n = 9;
  const fwd = i1 > 0;
  return (
    <g className="w33-dots" aria-hidden>
      {Array.from({ length: n }, (_, k) => (
        <circle key={`${k}-${fwd}`} r={3.6}>
          <animateMotion
            dur={`${dur.toFixed(2)}s`}
            repeatCount="indefinite"
            begin={`${(-(k * dur) / n).toFixed(2)}s`}
            path={PATH}
            keyPoints={fwd ? '0;1' : '1;0'}
            keyTimes="0;1"
            calcMode="linear"
          />
        </circle>
      ))}
    </g>
  );
}

export default function SchematicLayer() {
  useClearHoverOnUnmount();
  const c = useCircuit();
  const { a, shown } = c;
  const linear = a.state === 'linear';
  const q = (ok: boolean, s: string) => (ok ? s : '?');
  const single = a.supply === 'single';
  const stateText = shown('vo') ? (a.state === 'sat_neg' && single ? '负向削波：单 +9 V 下输出死锁 0 V（虚地崩溃）' : STATE_ZH[a.state]) : 'Example 5.3：逐步求解中';
  const tone = !shown('vo') ? 'mute' : linear ? 'good' : 'bad';
  return (
    <div className="w33-layer">
      <Dock c={c} />
      <div className="w33-sch-wrap">
        <svg viewBox="0 0 560 300" className="w33-sch" role="img" aria-label="反相放大器动态原理图：虚地、电流拐弯与输出">
          <text x={12} y={22} className={`w33-state ${tone}`}>
            {stateText}
          </text>
          {/* ground bus */}
          <Obj ids={['gnd', 'pin_noninv']} className="gnd">
            <path d="M 58 220 V 262 H 520 V 214" className="w33-wire" />
            <path d="M 272 262 v 8 M 258 270 h 28 M 263 276 h 18 M 268 282 h 8" className="w33-wire" />
            <text x={292} y={280} className="w33-lbl sub">
              0 V 参考地 GND
            </text>
          </Obj>
          <Particles i1={a.i1} />
          {/* input source */}
          <Obj ids={['vi_src', 'rin']} className="src">
            <path d="M 58 180 V 120 H 96" className="w33-wire" />
            <circle cx={58} cy={200} r={20} className="body" />
            <text x={58} y={196} className="w33-sign" textAnchor="middle">
              +
            </text>
            <text x={58} y={214} className="w33-sign" textAnchor="middle">
              −
            </text>
            <text x={86} y={198} className="w33-lbl src">
              vᵢ
            </text>
            <text x={86} y={214} className="w33-lbl src">
              {fmtV(a.vi)}
            </text>
          </Obj>
          {/* R1 */}
          <Obj ids={['r1', 'rin']} className="res r1">
            <rect x={96} y={108} width={80} height={24} rx={4} className="body" />
            <text x={136} y={125} className="w33-lbl res" textAnchor="middle">
              R₁ {fmtR(a.r1)}
            </text>
            <path d="M 176 120 H 250" className="w33-wire" />
          </Obj>
          <Obj ids={['i1']} className="cur">
            <text x={136} y={100} className="w33-lbl cur" textAnchor="middle">
              i₁ {q(shown('i1'), fmtI(a.i1))}
            </text>
          </Obj>
          {/* feedback */}
          <Obj ids={['rf']} className="res rf">
            <path d="M 250 120 V 52 H 320 M 400 52 H 470 V 150" className="w33-wire" />
            <rect x={320} y={40} width={80} height={24} rx={4} className="body" />
            <text x={360} y={57} className="w33-lbl rf" textAnchor="middle">
              Rf {fmtR(a.rf)}
            </text>
          </Obj>
          <Obj ids={['i_f']} className="cur">
            <text x={360} y={32} className="w33-lbl cur f" textAnchor="middle">
              i_f {q(shown('if'), fmtI(a.iF))}（拐弯流经 Rf）
            </text>
          </Obj>
          {/* node 1: virtual ground */}
          <Obj ids={['node1']} className={`node ${shown('vm') ? (linear ? 'vg' : 'lost') : 'mute'}`}>
            <circle cx={250} cy={120} r={17} className="bubble" />
            <circle cx={250} cy={120} r={4.5} className="dot" />
            <rect x={156} y={140} width={112} height={30} rx={6} className="tagbox" />
            <text x={212} y={153} className="w33-vg" textAnchor="middle">
              v₋ = {q(shown('vm'), `${num(a.vMinus)} V`)}
            </text>
            <text x={212} y={165} className="w33-vg sub" textAnchor="middle">
              {!shown('vm') ? '节点 1' : linear ? '节点 1 · 虚地（未接地线）' : '虚地崩溃 ≠ 0 V'}
            </text>
          </Obj>
          {/* Pin 2: virtual open */}
          <Obj ids={['pin_inv']} className="pin">
            <path d="M 250 120 H 300" className="w33-wire" />
            <path d="M 270 113 l 14 14 M 284 113 l -14 14" className="xmark" />
            <text x={277} y={106} className="w33-lbl x" textAnchor="middle">
              i₋ = 0
            </text>
          </Obj>
          {/* Pin 3 on ground */}
          <Obj ids={['pin_noninv']} className="pin">
            <path d="M 300 180 H 272 V 262" className="w33-wire" />
          </Obj>
          {/* supply pins */}
          <Obj ids={['rail_p', 'supply']} className="rail p">
            <path d="M 350 122 V 98" className="w33-rail" />
            <text x={356} y={102} className="w33-lbl rp">
              +9 V · Pin 8
            </text>
          </Obj>
          <Obj ids={['rail_n', 'supply']} className={`rail n ${single ? 'bad' : ''}`}>
            <path d="M 350 178 V 204" className="w33-rail" />
            <text x={356} y={208} className="w33-lbl rn">
              {single ? '0 V · Pin 4 误接 GND' : '−9 V · Pin 4'}
            </text>
          </Obj>
          {/* the op amp */}
          <Obj ids={['opamp']} className="amp">
            <polygon points="300,95 300,205 400,150" className="body" />
            <text x={309} y={126} className="w33-pm m">
              −
            </text>
            <text x={308} y={186} className="w33-pm p">
              +
            </text>
            <text x={338} y={154} className="w33-lbl sub" textAnchor="middle">
              LM358
            </text>
          </Obj>
          {/* output */}
          <Obj ids={['vo_out']} className="out">
            <path d="M 400 150 H 514" className="w33-wire" />
            <circle cx={470} cy={150} r={4} className="jn" />
            <circle cx={520} cy={150} r={6} className="term" />
            <text x={520} y={136} className="w33-lbl out" textAnchor="middle">
              vₒ
            </text>
            <text x={520} y={176} className={`w33-lbl out big ${shown('vo') && !linear ? 'bad' : ''}`} textAnchor="middle">
              {q(shown('vo'), fmtV(a.vo))}
            </text>
          </Obj>
          <Obj ids={['io']} className="cur">
            <text x={436} y={174} className="w33-lbl cur o" textAnchor="middle">
              iₒ {q(shown('io'), fmtI(a.io))}
            </text>
          </Obj>
        </svg>
        <div className="w33-sch-note">
          <MaskNote c={c} />
        </div>
      </div>
      <div className="w33-chips">
        <Chip ids={['rf', 'r1']} k="Aᵥ = −Rf/R₁" v={shown('vo') ? num(a.av, 3) : '?'} />
        <Chip ids={['vo_out']} k="vₒ 理想" v={shown('vo') ? fmtV(a.voIdeal) : '?'} className="wide" />
        <Chip ids={['vo_out']} k="vₒ 实测" v={shown('vo') ? fmtV(a.vo) : '?'} tone={shown('vo') ? (linear ? 'good' : 'bad') : undefined} />
        <Chip ids={['node1']} k="v₋" v={shown('vm') ? fmtV(a.vMinus) : '?'} tone={shown('vm') && !linear ? 'bad' : undefined} />
        <Chip ids={['i1']} k="i₁" v={shown('i1') ? fmtI(a.i1) : '?'} />
        <Chip ids={['i_f']} k="i_f" v={shown('if') ? fmtI(a.iF) : '?'} className="wide" />
        <Chip ids={['io']} k="iₒ（空载）" v={shown('io') ? fmtI(a.io) : '?'} className="wide" />
        <Chip ids={['lin_window']} k="线性窗口" v={shown('vo') ? `${num(a.viLo)} … ${num(a.viHi)} V` : '?'} className="wide" />
      </div>
    </div>
  );
}
