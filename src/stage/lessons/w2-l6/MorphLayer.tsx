// W2-L6 layer 02 · 电压源↔电流源一键变形原理图. Independent mode: one practical source between
// ports a and b; the morph switch turns v_s in series with R into i_s in parallel with R (the
// resistor swings from the top wire down between the rails, + / − turn into the arrow), the
// polarity flip puts + at b and the arrow follows it (red: the high-frequency trap). Dependent
// mode: act 4's circuit — 16 V and the 2 Ω carrying v_x inside the red isolation box, the
// diamond 0.25 v_x ∥ 4 Ω on the right morphs into v_x in series with 4 Ω, and the loop is solved
// live. With the red-box guard on, clicking the locked branch shakes it; with the guard off it
// can be transformed too, and v_x loses its meaning. Clicking a transformable branch morphs it.
// Stage params: sm_form ('voltage' | 'current'), sm_pol ('normal_up' | 'inverted_down'),
// sm_kind ('independent' | 'dependent'), sm_guard (boolean), sm_left ('voltage' | 'current').

import { useEffect } from 'react';
import { Tex } from '../../StageText';
import { useLit, useStageParam } from '../../stageStore';
import { fmt, solveDep } from './model';
import { hov, Port, RedBox, Res, Source, useClearHoverOnUnmount, useShake, useTween, type Pt } from './parts';
import './w2l6.css';

type Form = 'voltage' | 'current';
type Pol = 'normal_up' | 'inverted_down';
type Kind = 'independent' | 'dependent';

const TOP = 62;
const BOT = 192;
const MIDY = (TOP + BOT) / 2;
const R = String.raw;

/** A resistor of lead-to-lead length `len` that swings from a horizontal place in the top wire
 *  (t = 0) to a vertical place between the rails (t = 1); the wires it needs fade in with t. */
function Swing({ t, hx, vx, len = 64, lit, tone }: { t: number; hx: number; vx: number; len?: number; lit?: boolean; tone?: 'r' | 'target' }) {
  const cx = hx + (vx - hx) * t;
  const cy = TOP + (MIDY - TOP) * t;
  const ang = 90 * t;
  return (
    <g>
      {/* top wire under the horizontal resistor, filled in once it has left */}
      <line x1={hx - len / 2} y1={TOP} x2={hx + len / 2} y2={TOP} className="w6-wire" opacity={t} />
      {/* rail stubs of the vertical branch */}
      <line x1={vx} y1={TOP} x2={vx} y2={MIDY - len / 2} className="w6-wire" opacity={t} />
      <line x1={vx} y1={MIDY + len / 2} x2={vx} y2={BOT} className="w6-wire" opacity={t} />
      <circle cx={vx} cy={TOP} r={3} className="w6-dot" opacity={t} />
      <circle cx={vx} cy={BOT} r={3} className="w6-dot" opacity={t} />
      <g transform={`translate(${cx} ${cy}) rotate(${ang})`}>
        <Res p={[-len / 2, 0]} q={[len / 2, 0]} body={len - 20} lit={lit} tone={tone} />
      </g>
    </g>
  );
}

export default function MorphLayer() {
  useClearHoverOnUnmount();
  const lit = useLit();
  const on = (id: string) => lit.includes(id);
  const [form, setForm] = useStageParam<Form>('sm_form', 'voltage');
  const [pol, setPol] = useStageParam<Pol>('sm_pol', 'normal_up');
  const [kind, setKind] = useStageParam<Kind>('sm_kind', 'independent');
  const [guard, setGuard] = useStageParam('sm_guard', true);
  const [left, setLeft] = useStageParam<Form>('sm_left', 'voltage');
  const [shaking, shake] = useShake();
  const t = useTween(form === 'current' ? 1 : 0);
  const tl = useTween(kind === 'dependent' && !guard && left === 'current' ? 1 : 0);
  const up = pol === 'normal_up';

  // turning the guard back on restores the locked branch
  useEffect(() => {
    if (guard && left !== 'voltage') setLeft('voltage');
  }, [guard, left, setLeft]);

  const toggleForm = () => setForm(form === 'voltage' ? 'current' : 'voltage');
  const tryLeft = () => {
    if (guard) shake();
    else setLeft(left === 'voltage' ? 'current' : 'voltage');
  };

  return (
    <div className="w6-layer">
      <div className="w6-dock">
        <div className="w6-seg" role="radiogroup" aria-label="变形">
          <span className="w6-seg-label">变形</span>
          <button role="radio" aria-checked={form === 'voltage'} className={form === 'voltage' ? 'on' : ''} onClick={() => setForm('voltage')}>
            电压源 · 串 R
          </button>
          <button role="radio" aria-checked={form === 'current'} className={form === 'current' ? 'on' : ''} onClick={() => setForm('current')}>
            电流源 · 并 R
          </button>
        </div>
        <div className="w6-seg" role="radiogroup" aria-label="极性">
          <span className="w6-seg-label">极性</span>
          <button role="radio" aria-checked={up} className={up ? 'on' : ''} onClick={() => setPol('normal_up')}>
            + 朝 a ↑
          </button>
          <button role="radio" aria-checked={!up} className={!up ? 'on bad' : ''} onClick={() => setPol('inverted_down')}>
            + 朝 b ↓
          </button>
        </div>
        <div className="w6-seg" role="radiogroup" aria-label="源类型">
          <button role="radio" aria-checked={kind === 'independent'} className={kind === 'independent' ? 'on' : ''} onClick={() => setKind('independent')}>
            独立源
          </button>
          <button role="radio" aria-checked={kind === 'dependent'} className={kind === 'dependent' ? 'on' : ''} onClick={() => setKind('dependent')}>
            受控源
          </button>
        </div>
        <button
          className={`w6-switch ${guard && kind === 'dependent' ? 'on' : ''}`}
          role="switch"
          aria-checked={guard && kind === 'dependent'}
          disabled={kind !== 'dependent'}
          title={kind !== 'dependent' ? '红框保护用于受控源模式（控制变量 v_x 支路）' : undefined}
          onClick={() => setGuard(!guard)}
        >
          <span className="knob" aria-hidden />
          红框保护
        </button>
      </div>

      {kind === 'independent' ? (
        <Independent t={t} up={up} on={on} onMorph={toggleForm} />
      ) : (
        <Dependent t={t} tl={tl} up={up} guard={guard} left={left} shaking={shaking} on={on} onMorph={toggleForm} onLeft={tryLeft} />
      )}

      <Readout kind={kind} form={form} up={up} guard={guard} left={left} shaking={shaking} />
    </div>
  );
}

/* ------------------------------------------------------------- independent source */

function Independent({ t, up, on, onMorph }: { t: number; up: boolean; on: (id: string) => boolean; onMorph: () => void }) {
  const sx = 96;
  const px = 318;
  const tone = up ? 'ok' : 'bad';
  const srcId = t < 0.5 ? 'src_v' : 'src_i';
  const rId = t < 0.5 ? 'r_series' : 'r_parallel';
  return (
    <svg className="w6-svg" viewBox="0 0 400 236" role="img" aria-label="实际电压源与实际电流源一键变形">
      <rect x="1" y="1" width="398" height="234" rx="10" className="w6-bg" />
      <text x="200" y="22" className={`w6-title-line ${up ? '' : 'bad'}`}>
        {up ? '情形一：+ 极朝向端口 a ⟺ 箭头向上指向 a' : '情形二（高频陷阱！）：+ 极朝向端口 b ⟺ 箭头向下指向 b'}
      </text>
      <rect x="30" y="36" width="262" height="182" rx="10" className={`w6-box ${t < 0.5 ? 'a' : 'b'}`} />
      <g
        className="w6-clickable"
        onClick={onMorph}
        role="button"
        tabIndex={0}
        aria-label="点击变形"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onMorph())}
      >
        <rect x="30" y="36" width="262" height="182" className="w6-hit" />
        {/* rails */}
        <line x1={sx} y1={TOP} x2={sx} y2={MIDY - 20} className="w6-wire" />
        <line x1={sx} y1={MIDY + 20} x2={sx} y2={BOT} className="w6-wire" />
        <line x1={sx} y1={TOP} x2={196} y2={TOP} className="w6-wire" />
        <line x1={260} y1={TOP} x2={px} y2={TOP} className="w6-wire" />
        <line x1={sx} y1={BOT} x2={px} y2={BOT} className="w6-wire" />
        <g {...hov(srcId)}>
          <Source c={[sx, MIDY]} r={20} plus={up ? 'up' : 'down'} arrow={up ? 'up' : 'down'} mix={t} tone={tone} lit={on(srcId) || on('polarity_rule')} />
          <text x={sx - 28} y={MIDY - 4} className="w6-val end">
            {t < 0.5 ? (
              <>
                v<tspan className="w6-subt">s</tspan>
              </>
            ) : (
              <>
                i<tspan className="w6-subt">s</tspan>
              </>
            )}
          </text>
          <text x={sx - 28} y={MIDY + 10} className="w6-val end">
            {t < 0.5 ? '12 V' : '3 A'}
          </text>
        </g>
        <g {...hov(rId)}>
          <Swing t={t} hx={228} vx={228} lit={on(rId)} />
          <text x={228 + 14 * t} y={TOP - 12 + (MIDY - TOP + 16) * t} className={`w6-val ${t < 0.5 ? 'mid' : ''}`}>
            R = 4 Ω
          </text>
        </g>
      </g>
      <Port at={[px, TOP]} name={up ? 'a (+)' : 'a'} lit={on('port_ab') || (on('polarity_rule') && up)} id="port_ab" />
      <Port at={[px, BOT]} name={up ? 'b' : 'b (+)'} lit={on('port_ab') || (on('polarity_rule') && !up)} id="port_ab" />
      <text x="200" y="231" className="w6-hint">
        点击电路一键变形 · 端口 a–b 外看完全相同
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------- act 4: the dependent source */

function Dependent({
  t,
  tl,
  up,
  guard,
  left,
  shaking,
  on,
  onMorph,
  onLeft,
}: {
  t: number;
  tl: number;
  up: boolean;
  guard: boolean;
  left: Form;
  shaking: boolean;
  on: (id: string) => boolean;
  onMorph: () => void;
  onLeft: () => void;
}) {
  const sx = 40;
  const dx = 350;
  const broken = !guard && left === 'current';
  const srcLeftPt: Pt = [sx, MIDY];
  return (
    <svg className="w6-svg" viewBox="0 0 400 236" role="img" aria-label="受控源电源变换：红框隔离控制变量 v_x 支路">
      <rect x="1" y="1" width="398" height="234" rx="10" className="w6-bg" />
      <text x="200" y="20" className="w6-title-line">
        {t > 0.5 ? '原电路（求 v_x）：右侧 0.25 v_x ∥ 4 Ω' : `变换后：单回路 KVL（v_d = ${up ? '' : '−'}0.25 v_x × 4 = ${up ? '' : '−'}v_x）`}
      </text>
      {/* the red isolation box sits behind the locked branch */}
      {guard && <RedBox x={14} y={27} w={146} h={186} lit={on('red_box')} shake={shaking} label="红框隔离区：严禁变换" />}
      {/* rails */}
      <line x1={sx} y1={BOT} x2={dx} y2={BOT} className="w6-wire" />
      <line x1={150} y1={TOP} x2={218} y2={TOP} className="w6-wire" />
      <line x1={282} y1={TOP} x2={dx} y2={TOP} className="w6-wire" />
      <line x1={dx} y1={TOP} x2={dx} y2={MIDY - 24} className="w6-wire" />
      <line x1={dx} y1={MIDY + 24} x2={dx} y2={BOT} className="w6-wire" />

      {/* left branch: 16 V and the 2 Ω carrying v_x (locked) */}
      <g
        className="w6-clickable"
        onClick={onLeft}
        role="button"
        tabIndex={0}
        aria-label={guard ? '红框隔离区：严禁变换' : '变换左侧支路'}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onLeft())}
      >
        <rect x="16" y="34" width="138" height="176" className="w6-hit" />
        <line x1={sx} y1={TOP} x2={sx} y2={MIDY - 20} className="w6-wire" />
        <line x1={sx} y1={MIDY + 20} x2={sx} y2={BOT} className="w6-wire" />
        <line x1={sx} y1={TOP} x2={78} y2={TOP} className="w6-wire" />
        <g {...hov('src_v')}>
          <Source c={srcLeftPt} r={18} plus="up" arrow="up" mix={tl} tone="v" lit={on('src_v')} />
          <text x={sx + 23} y={MIDY + 4} className="w6-val">
            {tl < 0.5 ? '16V' : '8A'}
          </text>
        </g>
        <g {...hov('ctrl_vx')}>
          <Swing t={tl} hx={110} vx={110} len={64} lit={on('ctrl_vx')} tone="target" />
          <text x={110 + 14 * tl} y={TOP - 10 + (MIDY - TOP + 14) * tl} className={`w6-val ${tl < 0.5 ? 'mid' : ''}`}>
            2 Ω
          </text>
          {tl < 0.5 ? (
            <text x={110} y={TOP + 22} className="w6-vx mid">
              + <tspan className="w6-it">v</tspan>
              <tspan className="w6-subt">x</tspan> −
            </text>
          ) : (
            <text x={124} y={MIDY + 26} className="w6-vx broken">
              <tspan className="w6-it">v</tspan>
              <tspan className="w6-subt">x</tspan> ?
            </text>
          )}
        </g>
        <line x1={142} y1={TOP} x2={150} y2={TOP} className="w6-wire" />
      </g>
      {broken && (
        <text x={86} y={226} className="w6-warn-svg mid">
          控制变量 v_x 已被改写！
        </text>
      )}

      {/* right branch: 0.25 v_x ∥ 4 Ω  ⟺  v_x in series with 4 Ω */}
      <g
        className="w6-clickable"
        onClick={onMorph}
        role="button"
        tabIndex={0}
        aria-label="变换右侧受控源支路"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onMorph())}
      >
        <rect x="176" y="34" width="216" height="176" className="w6-hit" />
        <g {...hov('r_parallel')}>
          <Swing t={t} hx={250} vx={250} len={64} lit={on('r_parallel') || on('r_series')} />
          <text x={250 + 14 * t} y={TOP - 10 + (MIDY - TOP + 14) * t} className={`w6-val ${t < 0.5 ? 'mid' : ''}`}>
            4 Ω
          </text>
        </g>
        <g {...hov('dep_src')}>
          <Source c={[dx, MIDY]} r={19} dep plus={up ? 'up' : 'down'} arrow={up ? 'up' : 'down'} mix={t} tone={up ? 'ok' : 'bad'} lit={on('dep_src')} />
          <text x={dx - 4} y={MIDY + 42} className="w6-val end">
            {t > 0.5 ? (
              <>
                0.25 <tspan className="w6-it">v</tspan>
                <tspan className="w6-subt">x</tspan> ({up ? '↑' : '↓'})
              </>
            ) : (
              <>
                <tspan className="w6-it">v</tspan>
                <tspan className="w6-subt">d</tspan> = {up ? '' : '−'}
                <tspan className="w6-it">v</tspan>
                <tspan className="w6-subt">x</tspan>
                {up ? '' : '（+下）'}
              </>
            )}
          </text>
        </g>
      </g>
      <text x="300" y="231" className="w6-hint">
        点击右侧支路变形
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------- live readout */

function Readout({ kind, form, up, guard, left, shaking }: { kind: Kind; form: Form; up: boolean; guard: boolean; left: Form; shaking: boolean }) {
  if (kind === 'independent') {
    const sgn = up ? '' : '-';
    return (
      <div className="w6-readout" aria-live="polite">
        <span className={`w6-chip ${up ? 'ok' : 'bad'}`}>箭头指向 + 极：{up ? '+ 在 a ⟹ 箭头朝 a ↑' : '+ 在 b ⟹ 箭头朝 b ↓'}</span>
        <span className="w6-chip">
          <Tex tex={form === 'voltage' ? R`i_s = \frac{v_s}{R} = \frac{12}{4} = 3\text{ A}` : R`v_s = i_s R = 3 \times 4 = 12\text{ V}`} />
        </span>
        <span className="w6-chip">
          <Tex tex={R`v_{oc} = v_{ab} = ${sgn}12\text{ V},\ \ i_{sc} = ${sgn}3\text{ A}`} />
        </span>
      </div>
    );
  }
  const broken = !guard && left === 'current';
  const s = solveDep(up);
  return (
    <div className="w6-readout" aria-live="polite">
      {shaking && <span className="w6-toast">该支路包含待求量或控制变量，严禁执行电源变换！</span>}
      {broken ? (
        <span className="w6-chip bad">2 Ω 已从串联翻成并联：它两端的电压不再是原来的 v_x，受控源 0.25 v_x 失去定义</span>
      ) : (
        <>
          <span className="w6-chip">
            <Tex tex={up ? R`v_d = (0.25 v_x) \times 4 = v_x` : R`v_d = -(0.25 v_x) \times 4 = -v_x`} />
          </span>
          <span className={`w6-chip ${form === 'voltage' ? 'ok' : ''}`}>
            {form === 'voltage' ? (
              <Tex tex={R`-16 + 2i + 4i ${up ? '+' : '-'} v_x = 0,\ v_x = 2i \implies i = ${fmt(s.i)}\text{ A},\ v_x = ${fmt(s.vx)}\text{ V}`} />
            ) : (
              <>
                把右侧变成电压源，单回路一条 KVL 即可：
                <Tex tex={R`v_x = ${fmt(s.vx)}\text{ V}`} />
              </>
            )}
          </span>
        </>
      )}
    </div>
  );
}
