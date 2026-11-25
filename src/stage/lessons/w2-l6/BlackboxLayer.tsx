// W2-L6 layer 01 · 端口等效黑盒验证 (v_oc 与 i_sc): box A (12 V series 4 Ω) and box B (3 A
// parallel 4 Ω) side by side, the same load on each port. The load switch (open / R_L = 2 Ω /
// short) drives both; the probe overlay shows either the port line v(i) of both boxes (they
// coincide; v_oc and i_sc are its intercepts, the load is the operating point) or the power
// split (internal resistor, load, source) — equal outside, different inside.
// Stage params: bb_load ('open' | '2ohm' | 'short'), bb_overlay ('voc_isc' | 'internal_power').

import { useLit, useStageParam } from '../../stageStore';
import { boxes, BOX, fmt, type BoxReading, type Load } from './model';
import { hov, Port, Res, Source, useClearHoverOnUnmount, type Pt } from './parts';
import './w2l6.css';

type Overlay = 'voc_isc' | 'internal_power';

const LOADS: { v: Load; label: string }[] = [
  { v: 'open', label: '开路' },
  { v: '2ohm', label: 'R_L = 2 Ω' },
  { v: 'short', label: '短路' },
];
const OVERLAYS: { v: Overlay; label: string }[] = [
  { v: 'voc_isc', label: '端口 v_oc / i_sc' },
  { v: 'internal_power', label: '内部功耗' },
];

const TOP = 64;
const BOT = 146;
const P_MAX = 36;

/** "v_oc" → v<sub>oc</sub> for the buttons */
function Sub({ s }: { s: string }) {
  const parts = s.split(/(\w)_(\w+)/);
  if (parts.length === 1) return <>{s}</>;
  return (
    <>
      {parts.map((p, i) =>
        i % 3 === 2 ? (
          <sub key={i}>{p}</sub>
        ) : (
          <span key={i} className={i % 3 === 1 ? 'w6-it' : undefined}>
            {p}
          </span>
        ),
      )}
    </>
  );
}

export default function BlackboxLayer() {
  useClearHoverOnUnmount();
  const lit = useLit();
  const on = (id: string) => lit.includes(id);
  const [load, setLoad] = useStageParam<Load>('bb_load', 'open');
  const [overlay, setOverlay] = useStageParam<Overlay>('bb_overlay', 'voc_isc');
  const { a, b } = boxes(load);
  // a hovered term previews its probe view (the switch itself is left alone)
  const lineTerm = on('vi_line') || on('voc') || on('isc');
  const power = !lineTerm && (overlay === 'internal_power' || on('p_internal'));

  return (
    <div className="w6-layer">
      <div className="w6-dock">
        <div className="w6-seg" role="radiogroup" aria-label="外接负载">
          <span className="w6-seg-label">负载</span>
          {LOADS.map((o) => (
            <button key={o.v} role="radio" aria-checked={load === o.v} className={load === o.v ? 'on' : ''} onClick={() => setLoad(o.v)}>
              <Sub s={o.label} />
            </button>
          ))}
        </div>
        <div className="w6-seg" role="radiogroup" aria-label="探针视图">
          <span className="w6-seg-label">探针</span>
          {OVERLAYS.map((o) => (
            <button key={o.v} role="radio" aria-checked={overlay === o.v} className={overlay === o.v ? 'on' : ''} onClick={() => setOverlay(o.v)}>
              <Sub s={o.label} />
            </button>
          ))}
        </div>
      </div>

      <svg className="w6-svg" viewBox="0 0 400 302" role="img" aria-label="两个黑盒：实际电压源与实际电流源，接同一负载">
        <rect x="1" y="1" width="398" height="300" rx="10" className="w6-bg" />
        <BoxA r={a} load={load} power={power} on={on} />
        <BoxB r={b} load={load} power={power} on={on} />
        <line x1="12" y1="200" x2="388" y2="200" className="w6-sep" />
        {power ? <PowerBars a={a} b={b} on={on} /> : <PortLine load={load} v={a.v} i={a.i} on={on} />}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------- the two boxes */

interface BoxProps {
  r: BoxReading;
  load: Load;
  power: boolean;
  on: (id: string) => boolean;
}

function heat(p: number) {
  return Math.min(1, p / P_MAX);
}

function LoadEl({ x, load, lit, r }: { x: number; load: Load; lit: boolean; r: BoxReading }) {
  return (
    <g className={`w6-load ${lit ? 'lit' : ''}`} {...hov('load')}>
      <rect x={x - 14} y={TOP} width={28} height={BOT - TOP} className="w6-hit" />
      <line x1={x - 24} y1={TOP} x2={x} y2={TOP} className="w6-wire" />
      <line x1={x - 24} y1={BOT} x2={x} y2={BOT} className="w6-wire" />
      {load === 'open' && (
        <>
          <line x1={x} y1={TOP} x2={x} y2={TOP + 22} className="w6-wire" />
          <line x1={x} y1={BOT} x2={x} y2={BOT - 22} className="w6-wire" />
          <circle cx={x} cy={TOP + 22} r={2.6} className="w6-open-end" />
          <circle cx={x} cy={BOT - 22} r={2.6} className="w6-open-end" />
          <text x={x} y={(TOP + BOT) / 2 + 4} className="w6-load-tag">
            开路
          </text>
        </>
      )}
      {load === '2ohm' && (
        <>
          <Res p={[x, TOP]} q={[x, BOT]} body={40} tone="blue" />
          <text x={x + 4} y={BOT + 19} className="w6-val small mid">
            R<tspan className="w6-subt">L</tspan> = 2 Ω
          </text>
        </>
      )}
      {load === 'short' && (
        <>
          <line x1={x} y1={TOP} x2={x} y2={BOT} className="w6-wire short" />
          <text x={x} y={BOT + 15} className="w6-load-tag">
            短路
          </text>
        </>
      )}
      {r.i > 0 && <Flow d={`M ${x - 22} ${TOP} H ${x} V ${BOT} H ${x - 22}`} amps={r.i} />}
    </g>
  );
}

/** current dashes along a path, faster for more current */
function Flow({ d, amps }: { d: string; amps: number }) {
  return <path d={d} className="w6-flow" style={{ animationDuration: `${(2.4 / Math.max(0.4, amps)).toFixed(2)}s` }} aria-hidden />;
}

function PortReading({ x, r, load }: { x: number; r: BoxReading; load: Load }) {
  return (
    <text x={x} y={186} className="w6-port-read">
      {load === 'open' && (
        <>
          <tspan className="w6-it">v</tspan>
          <tspan className="w6-subt">oc</tspan> = {fmt(r.v)} V
        </>
      )}
      {load === 'short' && (
        <>
          <tspan className="w6-it">i</tspan>
          <tspan className="w6-subt">sc</tspan> = {fmt(r.i)} A
        </>
      )}
      {load === '2ohm' && (
        <>
          <tspan className="w6-it">v</tspan> = {fmt(r.v)} V · <tspan className="w6-it">i</tspan> = {fmt(r.i)} A
        </>
      )}
    </text>
  );
}

function BoxA({ r, load, power, on }: BoxProps) {
  const sx = 36;
  const p0: Pt = [74, TOP];
  const p1: Pt = [130, TOP];
  return (
    <g>
      <rect x="8" y="34" width="152" height="132" rx="9" className={`w6-box a ${on('box_a') ? 'lit' : ''}`} {...hov('box_a')} />
      <text x="84" y="27" className="w6-box-title a">
        黑盒 A：实际电压源（串联 R）
      </text>
      {/* source */}
      <g {...hov('src_v')}>
        <line x1={sx} y1={TOP} x2={sx} y2={88} className="w6-wire" />
        <line x1={sx} y1={120} x2={sx} y2={BOT} className="w6-wire" />
        <Source c={[sx, 104]} r={16} plus="up" tone="v" lit={on('src_v')} />
        <text x={sx + 21} y={96} className="w6-val">
          v<tspan className="w6-subt">s</tspan>
        </text>
        <text x={sx + 21} y={113} className="w6-val">
          12 V
        </text>
      </g>
      <line x1={sx} y1={TOP} x2={p0[0]} y2={TOP} className="w6-wire" />
      <line x1={sx} y1={BOT} x2={160} y2={BOT} className="w6-wire" />
      {/* series R */}
      <g {...hov('r_series')}>
        <rect x={p0[0] - 2} y={TOP - 16} width={p1[0] - p0[0] + 4} height={32} className="w6-hit" />
        {power && <rect x={p0[0] - 4} y={TOP - 13} width={p1[0] - p0[0] + 8} height={26} rx={8} className="w6-heat" opacity={heat(r.pr)} />}
        <Res p={p0} q={p1} body={44} lit={on('r_series')} />
        <text x={(p0[0] + p1[0]) / 2} y={TOP - 13} className="w6-val mid">
          R = {BOX.r} Ω
        </text>
        {power && (
          <text x={(p0[0] + p1[0]) / 2} y={TOP + 24} className={`w6-pwr mid ${r.pr ? 'hot' : ''}`}>
            P = {fmt(r.pr)} W
          </text>
        )}
      </g>
      <line x1={p1[0]} y1={TOP} x2={160} y2={TOP} className="w6-wire" />
      {r.i > 0 && <Flow d={`M ${sx} 88 V ${TOP} H 160`} amps={r.i} />}
      {r.i > 0 && <Flow d={`M 160 ${BOT} H ${sx} V 120`} amps={r.i} />}
      <Port at={[160, TOP]} name="a" lit={on('port_ab')} id="port_ab" />
      <Port at={[160, BOT]} name="b" lit={on('port_ab')} id="port_ab" />
      <LoadEl x={184} load={load} lit={on('load')} r={r} />
      <PortReading x={96} r={r} load={load} />
    </g>
  );
}

function BoxB({ r, load, power, on }: BoxProps) {
  const sx = 222;
  const rx = 288;
  return (
    <g>
      <rect x="204" y="34" width="152" height="132" rx="9" className={`w6-box b ${on('box_b') ? 'lit' : ''}`} {...hov('box_b')} />
      <text x="280" y="27" className="w6-box-title b">
        黑盒 B：实际电流源（并联 R）
      </text>
      <g {...hov('src_i')}>
        <line x1={sx} y1={TOP} x2={sx} y2={88} className="w6-wire" />
        <line x1={sx} y1={120} x2={sx} y2={BOT} className="w6-wire" />
        <Source c={[sx, 104]} r={16} arrow="up" tone="ok" lit={on('src_i')} />
        <text x={sx + 21} y={96} className="w6-val">
          i<tspan className="w6-subt">s</tspan>
        </text>
        <text x={sx + 21} y={113} className="w6-val">
          3 A
        </text>
      </g>
      <line x1={sx} y1={TOP} x2={356} y2={TOP} className="w6-wire" />
      <line x1={sx} y1={BOT} x2={356} y2={BOT} className="w6-wire" />
      <circle cx={rx} cy={TOP} r={3} className="w6-dot" />
      <circle cx={rx} cy={BOT} r={3} className="w6-dot" />
      <g {...hov('r_parallel')}>
        <rect x={rx - 16} y={TOP + 4} width={32} height={BOT - TOP - 8} className="w6-hit" />
        {power && <rect x={rx - 13} y={TOP + 14} width={26} height={BOT - TOP - 28} rx={8} className="w6-heat" opacity={heat(r.pr)} />}
        <Res p={[rx, TOP]} q={[rx, BOT]} body={44} lit={on('r_parallel')} />
        <text x={rx + 11} y={(TOP + BOT) / 2 - 4} className="w6-val">
          R
        </text>
        <text x={rx + 11} y={(TOP + BOT) / 2 + 9} className="w6-val">
          4 Ω
        </text>
        {power && (
          <text x={rx - 12} y={BOT - 6} className={`w6-pwr end ${r.pr ? 'hot' : ''}`}>
            P = {fmt(r.pr)} W
          </text>
        )}
      </g>
      <Flow d={`M ${sx} 88 V ${TOP} H ${rx}`} amps={BOX.is} />
      <Flow d={`M ${rx} ${BOT} H ${sx} V 120`} amps={BOX.is} />
      {r.ir > 0 && <Flow d={`M ${rx} ${TOP} V ${BOT}`} amps={r.ir} />}
      {r.i > 0 && <Flow d={`M ${rx} ${TOP} H 356`} amps={r.i} />}
      {r.i > 0 && <Flow d={`M 356 ${BOT} H ${rx}`} amps={r.i} />}
      <Port at={[356, TOP]} name="a" lit={on('port_ab')} id="port_ab" />
      <Port at={[356, BOT]} name="b" lit={on('port_ab')} id="port_ab" />
      <LoadEl x={378} load={load} lit={on('load')} r={r} />
      <PortReading x={290} r={r} load={load} />
    </g>
  );
}

/* ------------------------------------------------------------- probe overlay 1: the port line */

function PortLine({ load, v, i, on }: { load: Load; v: number; i: number; on: (id: string) => boolean }) {
  const ox = 58;
  const oy = 284;
  const sx = 48; // px per A
  const sy = 4.3; // px per V
  const X = (a: number) => ox + a * sx;
  const Y = (u: number) => oy - u * sy;
  return (
    <g>
      <text x="14" y="216" className="w6-panel-title">
        端口伏安直线 v(i)：A、B 两盒完全重合
      </text>
      {/* axes */}
      <line x1={ox} y1={oy} x2={X(3.6)} y2={oy} className="w6-axis" />
      <line x1={ox} y1={oy} x2={ox} y2={Y(13.4)} className="w6-axis" />
      <text x={X(3.6) + 4} y={oy + 4} className="w6-axis-name">
        i
      </text>
      <text x={ox - 6} y={Y(12) + 4} className="w6-axis-name end">
        v
      </text>
      <g className={`w6-vi ${on('vi_line') ? 'lit' : ''}`} {...hov('vi_line')}>
        <line x1={X(0)} y1={Y(12)} x2={X(3)} y2={Y(0)} className="w6-hitline" />
        <line x1={X(0)} y1={Y(12)} x2={X(3)} y2={Y(0)} className="w6-vi-a" />
        <line x1={X(0)} y1={Y(12)} x2={X(3)} y2={Y(0)} className="w6-vi-b" />
      </g>
      <g className={`w6-icpt ${on('voc') ? 'lit' : ''}`} {...hov('voc')}>
        <circle cx={X(0)} cy={Y(12)} r={4} className="w6-icpt-dot" />
        <text x={X(0) + 13} y={Y(12) + 4} className="w6-icpt-text">
          v<tspan className="w6-subt">oc</tspan> = 12 V
        </text>
      </g>
      <g className={`w6-icpt ${on('isc') ? 'lit' : ''}`} {...hov('isc')}>
        <circle cx={X(3)} cy={Y(0)} r={4} className="w6-icpt-dot" />
        <text x={X(3)} y={oy + 13} className="w6-icpt-text mid">
          i<tspan className="w6-subt">sc</tspan> = 3 A
        </text>
      </g>
      <text x={X(1.5) + 12} y={Y(6) + 2} className="w6-slope">
        斜率 −R = −4 Ω
      </text>
      {/* operating point */}
      <line x1={X(i)} y1={Y(v)} x2={X(i)} y2={oy} className="w6-guide" />
      <line x1={ox} y1={Y(v)} x2={X(i)} y2={Y(v)} className="w6-guide" />
      <circle cx={X(i)} cy={Y(v)} r={6} className="w6-op" />
      <g className="w6-legend">
        <line x1="250" y1="236" x2="272" y2="236" className="w6-vi-a" />
        <text x="278" y="240">
          黑盒 A：v = 12 − 4i
        </text>
        <line x1="250" y1="254" x2="272" y2="254" className="w6-vi-b" />
        <text x="278" y="258">
          黑盒 B：v = 3·4 − 4i
        </text>
        <circle cx="261" cy="272" r="5" className="w6-op" />
        <text x="278" y="276">
          工作点：{load === 'open' ? '开路' : load === 'short' ? '短路' : 'R_L = 2 Ω'}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------- probe overlay 2: where the power goes */

function PowerBars({ a, b, on }: { a: BoxReading; b: BoxReading; on: (id: string) => boolean }) {
  const x0 = 120;
  const w = 210;
  const rows: { key: string; label: string; id: string; va: number; vb: number }[] = [
    { key: 'pr', label: '内部 R 功耗', id: 'p_internal', va: a.pr, vb: b.pr },
    { key: 'pl', label: '负载功率', id: 'load', va: a.pl, vb: b.pl },
    { key: 'ps', label: '电源发出功率', id: '', va: a.ps, vb: b.ps },
  ];
  return (
    <g>
      <text x="14" y="216" className="w6-panel-title">
        功率去向（W）：端口外相等，盒子内部不等
      </text>
      <g className="w6-legend">
        <rect x="268" y="207" width="10" height="9" rx="2" className="w6-bar a" />
        <text x="282" y="215">
          A
        </text>
        <rect x="300" y="207" width="10" height="9" rx="2" className="w6-bar b" />
        <text x="314" y="215">
          B
        </text>
      </g>
      {rows.map((r, k) => {
        const y = 226 + k * 22;
        const same = Math.abs(r.va - r.vb) < 1e-9;
        return (
          <g key={r.key} className={r.id && on(r.id) ? 'w6-bars lit' : 'w6-bars'} {...hov(r.id || undefined)}>
            <text x="14" y={y + 12} className="w6-bar-label">
              {r.label}
            </text>
            <rect x={x0} y={y} width={Math.max(1.5, (r.va / P_MAX) * w)} height={8} rx={2} className="w6-bar a" />
            <rect x={x0} y={y + 10} width={Math.max(1.5, (r.vb / P_MAX) * w)} height={8} rx={2} className="w6-bar b" />
            <text x={x0 + w + 8} y={y + 12} className={`w6-bar-val ${same ? 'same' : 'diff'}`}>
              {fmt(r.va)} {same ? '=' : '≠'} {fmt(r.vb)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
