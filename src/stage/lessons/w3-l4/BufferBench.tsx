// Layer "02 带载塌陷 vs 电压跟随器隔离对比台": the sensor of act 3 (V_Th = 5 V, R_Th = 10 kΩ, in a
// dashed Thévenin box) drives a load R_L (log slider 100 Ω – 100 kΩ), either straight or through a
// voltage follower. Four meters (v_L, the sensor's current, i_L, P_L), the v_L–R_L curves of both
// wirings with a cursor, the direct / buffered bars and the power ratio. Below 250 Ω the follower
// would have to source more than the LM358's 20 mA: a warning, and v_L drops.

import { useStageParam } from '../../stageStore';
import { Cell, hoverProps, useClearHoverOnUnmount, useIsLit } from './state';
import { buffered, direct, fmtI, fmtP, fmtR, fmtV, I_OUT_MAX, posOfRl, RL_RANGE, rlOfPos, SENSOR } from './model';

const GND_Y = 172;
const TOPY = 60;
const LX = 454; // load

const zigH = (x1: number, x2: number, y: number, n = 6, a = 8) =>
  [x1, ...Array.from({ length: n }, (_, i) => x1 + ((i + 0.5) / n) * (x2 - x1)), x2]
    .map((x, i, all) => `${x.toFixed(1)},${i === 0 || i === all.length - 1 ? y : y + (i % 2 ? -a : a)}`)
    .join(' ');
const zigV = (x: number, y1: number, y2: number, n = 6, a = 9) =>
  [y1, ...Array.from({ length: n }, (_, i) => y1 + ((i + 0.5) / n) * (y2 - y1)), y2]
    .map((y, i, all) => `${i === 0 || i === all.length - 1 ? x : x + (i % 2 ? -a : a)},${y.toFixed(1)}`)
    .join(' ');

function Circuit({ rl, buf }: { rl: number; buf: boolean }) {
  const on = useIsLit();
  const s = buf ? buffered(rl) : direct(rl);
  return (
    <svg viewBox="0 0 580 196" className="w34-sch" role="img" aria-label={`${buf ? '插入电压跟随器' : '直接连接'}：R_L = ${fmtR(rl)}，v_L = ${fmtV(s.vl, 3)}`}>
      {/* the sensor's Thévenin box */}
      <g className={`w34-box ${on('vth', 'rth')}`}>
        <rect x={10} y={22} width={196} height={164} rx={10} />
        <text x={14} y={15} className="w34-boxtitle">
          高内阻传感器（戴维南等效）
        </text>
      </g>
      <g className={`w34-part ${on('vth')}`} data-hl="vth" {...hoverProps(['vth'])} tabIndex={0}>
        <line x1={50} y1={98} x2={50} y2={TOPY} className="w34-wire" />
        <line x1={50} y1={138} x2={50} y2={GND_Y - 18} className="w34-wire" />
        <circle cx={50} cy={118} r={20} className="w34-src" />
        <text x={50} y={114} className="w34-sign">
          +
        </text>
        <text x={50} y={132} className="w34-sign">
          −
        </text>
        <text x={78} y={114} className="w34-name">
          V_Th
        </text>
        <text x={78} y={131} className="w34-val">
          5.00 V
        </text>
      </g>
      <line x1={50} y1={GND_Y - 18} x2={50} y2={GND_Y} className="w34-wire" />
      <g className={`w34-part ${on('rth')}`} data-hl="rth" {...hoverProps(['rth'])} tabIndex={0}>
        <line x1={50} y1={TOPY} x2={92} y2={TOPY} className="w34-wire" />
        <polyline points={zigH(92, 160, TOPY)} className="w34-zig-hit" />
        <polyline points={zigH(92, 160, TOPY)} className="w34-zig r1" />
        <text x={126} y={TOPY - 15} className="w34-name r1 mid">
          R_Th = 10 kΩ
        </text>
      </g>
      <g className={`w34-part ${on('isrc')}`} data-hl="isrc" {...hoverProps(['isrc'])}>
        <path d={`M 104 ${TOPY + 18} L 148 ${TOPY + 18} M 141 ${TOPY + 13} L 149 ${TOPY + 18} L 141 ${TOPY + 23}`} className={`w34-iarrow ${buf ? 'zero' : ''}`} />
        <text x={126} y={TOPY + 36} className="w34-cur mid">
          i_源 = {fmtI(s.isrc)}
        </text>
      </g>
      <line x1={160} y1={TOPY} x2={214} y2={TOPY} className="w34-wire" />
      <circle cx={214} cy={TOPY} r={4.5} className="w34-term" />
      {/* the middle: a follower, or a plain wire */}
      {buf ? (
        <g className={`w34-part ${on('buffer')}`} data-hl="buffer" {...hoverProps(['buffer'])} tabIndex={0}>
          <polyline points={`218,${TOPY} 240,${TOPY} 240,106 266,106`} className="w34-wire in" />
          <polygon points="266,44 266,124 342,84" className="w34-amp" />
          <text x={273} y={70} className="w34-pm neg">
            −
          </text>
          <text x={273} y={112} className="w34-pm pos">
            +
          </text>
          <polyline points={`266,64 252,64 252,30 362,30 362,84`} className="w34-short" />
          <polyline points={`342,84 384,84 384,${TOPY} ${LX},${TOPY}`} className="w34-wire out" />
          <circle cx={362} cy={84} r={4} className="w34-node out" />
          <text x={306} y={24} className="w34-tiny mid">
            100% 负反馈短接线
          </text>
          <text x={252} y={124} className="w34-tiny cyan end">
            i+ = 0
          </text>
          <g className={`w34-part ${on('rails')}`} data-hl="rails" {...hoverProps(['rails'])}>
            <line x1={304} y1={105} x2={304} y2={142} className="w34-rail neg" />
            <text x={304} y={156} className="w34-tiny rail mid">
              ±9 V 电源轨供出 i_L
            </text>
          </g>
        </g>
      ) : (
        <g className={`w34-part ${on('buffer')}`} data-hl="buffer" {...hoverProps(['buffer'])} tabIndex={0}>
          <line x1={218} y1={TOPY} x2={LX} y2={TOPY} className="w34-wire" />
          <text x={318} y={TOPY - 10} className="w34-tiny mid">
            直接连接（没有跟随器）
          </text>
        </g>
      )}
      {/* the load */}
      <g className={`w34-part ${on('rl')}`} data-hl="rl" {...hoverProps(['rl'])} tabIndex={0}>
        <line x1={LX} y1={TOPY} x2={LX} y2={82} className="w34-wire" />
        <polyline points={zigV(LX, 82, 146)} className="w34-zig-hit" />
        <polyline points={zigV(LX, 82, 146)} className="w34-zig load" />
        <line x1={LX} y1={146} x2={LX} y2={GND_Y} className="w34-wire" />
        <path d={`M ${LX - 22} 140 L ${LX + 22} 88 M ${LX + 12} 89 L ${LX + 23} 87 L ${LX + 21} 98`} className="w34-varrow" />
        <text x={LX + 30} y={108} className="w34-name load">
          R_L
        </text>
        <text x={LX + 30} y={125} className="w34-val load">
          {fmtR(rl)}
        </text>
      </g>
      <g className={`w34-part ${on('vl')}`} data-hl="vl" {...hoverProps(['vl'])}>
        <text x={LX - 28} y={98} className="w34-bubble end out">
          v_L
        </text>
        <text x={LX - 28} y={115} className={`w34-bubble end ${buf && !s.limited ? 'good' : 'bad'}`}>
          {fmtV(s.vl, 3)}
        </text>
      </g>
      <g className={`w34-part ${on('il')}`} data-hl="il" {...hoverProps(['il'])}>
        <text x={LX + 30} y={150} className="w34-cur">
          i_L = {fmtI(s.il)}
        </text>
      </g>
      <line x1={50} y1={GND_Y} x2={LX} y2={GND_Y} className="w34-wire" />
      <text x={560} y={GND_Y + 4} className="w34-tiny end">
        GND
      </text>
    </svg>
  );
}

const PX = (rl: number) => 54 + posOfRl(rl) * 500;
const PY = (v: number) => 140 - (v / 5.5) * 120;

function Chart({ rl, buf }: { rl: number; buf: boolean }) {
  const on = useIsLit();
  const pts = (f: (r: number) => number) =>
    Array.from({ length: 121 }, (_, i) => {
      const r = rlOfPos(i / 120);
      return `${PX(r).toFixed(1)},${PY(f(r)).toFixed(1)}`;
    }).join(' ');
  const d = direct(rl);
  const b = buffered(rl);
  return (
    <svg viewBox="0 0 580 170" className="w34-chart" role="img" aria-label={`负载电压随 R_L 变化：直连 ${fmtV(d.vl, 3)}，跟随器 ${fmtV(b.vl, 3)}`}>
      <text x={12} y={14} className="w34-ctitle">
        负载电压 v_L 随 R_L 变化（对数横轴）
      </text>
      {[0, 2.5, 5].map((v) => (
        <g key={v}>
          <line x1={54} x2={554} y1={PY(v)} y2={PY(v)} className="w34-grid" />
          <text x={48} y={PY(v) + 4} className="w34-tick end">
            {v} V
          </text>
        </g>
      ))}
      {[100, 1e3, 10e3, 100e3].map((r) => (
        <text key={r} x={PX(r)} y={158} className="w34-tick mid">
          {fmtR(r)}
        </text>
      ))}
      <line x1={PX(SENSOR.vth / I_OUT_MAX)} x2={PX(SENSOR.vth / I_OUT_MAX)} y1={PY(5.5)} y2={PY(0)} className="w34-limline" />
      <text x={PX(SENSOR.vth / I_OUT_MAX) + 4} y={PY(0.5)} className="w34-tick lim">
        20 mA 限流
      </text>
      <polyline points={pts((r) => direct(r).vl)} className={`w34-curve direct ${buf ? 'faint' : ''}`} />
      <polyline points={pts((r) => buffered(r).vl)} className={`w34-curve buf ${buf ? '' : 'faint'}`} />
      <line x1={PX(rl)} x2={PX(rl)} y1={PY(5.5)} y2={PY(0)} className={`w34-cursor ${on('rl')}`} />
      <circle cx={PX(rl)} cy={PY(d.vl)} r={5} className="w34-dot direct" />
      <circle cx={PX(rl)} cy={PY(b.vl)} r={5} className="w34-dot buf" />
      <g className="w34-legend">
        <line x1={330} x2={350} y1={10} y2={10} className="w34-curve buf" />
        <text x={354} y={14}>
          电压跟随器
        </text>
        <line x1={440} x2={460} y1={10} y2={10} className="w34-curve direct" />
        <text x={464} y={14}>
          直接连接
        </text>
      </g>
    </svg>
  );
}

export default function BufferBench() {
  useClearHoverOnUnmount();
  const [rl, setRl] = useStageParam('rl', 1000);
  const [buf, setBuf] = useStageParam('buf', false);
  const on = useIsLit();
  const s = buf ? buffered(rl) : direct(rl);
  const d = direct(rl);
  const b = buffered(rl);
  const ratio = b.pl / d.pl;
  return (
    <div className="w34-layer">
      <div className="w34-dock">
        <div className="w34-row">
          <div className="w34-seg" role="radiogroup" aria-label="接法" {...hoverProps(['buffer'])}>
            <button role="radio" aria-checked={!buf} className={!buf ? 'on bad' : ''} onClick={() => setBuf(false)}>
              <span className="full">直接连接</span>
              <span className="short">直连</span>
            </button>
            <button role="radio" aria-checked={buf} className={buf ? 'on good' : ''} onClick={() => setBuf(true)}>
              <span className="full">插入电压跟随器</span>
              <span className="short">跟随器</span>
            </button>
          </div>
          <label className={`w34-slider wide ${on('rl')}`} {...hoverProps(['rl'])}>
            <span className="w34-sl-name">负载 R_L</span>
            <input
              type="range"
              min={0}
              max={1000}
              step={1}
              value={Math.round(posOfRl(rl) * 1000)}
              onChange={(e) => {
                const r = rlOfPos(Number(e.target.value) / 1000);
                // snap to 2 significant figures so the readouts land on round values
                const p = Math.pow(10, Math.floor(Math.log10(r)) - 1);
                setRl(Math.min(RL_RANGE[1], Math.max(RL_RANGE[0], Math.round(r / p) * p)));
              }}
              aria-label="负载电阻 R_L（对数刻度）"
              aria-valuetext={fmtR(rl)}
            />
            <b>{fmtR(rl)}</b>
          </label>
        </div>
      </div>
      <div className="w34-sch-wrap two">
        <Circuit rl={rl} buf={buf} />
        <Chart rl={rl} buf={buf} />
      </div>
      {buf && s.limited && (
        <p className="w34-alarm" role="alert" {...hoverProps(['rails'])}>
          <b>输出限流</b>
          <span className="short">R_L &lt; 250 Ω：超过约 20 mA，v_L 掉到 {fmtV(s.vl, 2)}</span>
          <span className="full">
            R_L &lt; 250 Ω：负载要 {fmtI(SENSOR.vth / rl)}，超过 LM358 约 20 mA 的输出能力，v_L 掉到 {fmtV(s.vl, 2)}
          </span>
        </p>
      )}
      <div className="w34-bars" {...hoverProps(['vl'])}>
        <div className="w34-bar">
          <span>直连</span>
          <i>
            <em className="direct" style={{ width: `${(d.vl / SENSOR.vth) * 100}%` }} />
          </i>
          <b>{fmtV(d.vl, 3)}</b>
        </div>
        <div className="w34-bar">
          <span>跟随器</span>
          <i>
            <em className="buf" style={{ width: `${(b.vl / SENSOR.vth) * 100}%` }} />
          </i>
          <b>{fmtV(b.vl, 2)}</b>
        </div>
      </div>
      <div className="w34-cells">
        <Cell id="vl" name="负载电压 v_L" short="v_L" value={fmtV(s.vl, 3)} cls={buf && !s.limited ? 'good' : 'bad'} />
        <Cell id="isrc" name="传感器电流 i_源" short="i_源" value={fmtI(s.isrc)} hint={buf ? 'i+ = 0' : '= i_L'} />
        <Cell id="il" name="负载电流 i_L" short="i_L" value={fmtI(s.il)} hint={buf ? '来自电源轨' : '来自传感器'} />
        <Cell id="pl" name="负载功率 P_L" short="P_L" value={fmtP(s.pl)} />
        <Cell id="ratio" name="功率倍数" short="倍数" value={`× ${ratio >= 100 ? ratio.toFixed(0) : ratio.toFixed(1)}`} hint="跟随器 / 直连" />
        <Cell id="rth" name="内阻压降" short="R_Th 压降" value={fmtV(s.isrc * SENSOR.rth, 3)} hint="i_源 · R_Th" />
      </div>
    </div>
  );
}
