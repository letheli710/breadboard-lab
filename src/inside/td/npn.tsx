// Teardown: the NPN bipolar transistor (2N2222 / S8050, TO-92). Package and pins E B C → X-ray
// (the die sits on the collector lead) → three semiconductor layers → how electrons cross the thin
// base (I_C = β·I_B) → the equivalent circuit of each region → the output curves with the load line
// → sizing the base resistor for saturation (lab 5-7) → low side vs high side (lab 5-18) → limits.

import './mcu.css';
import type { ReactNode } from 'react';
import { tr } from '../../core/i18n';
import { sub, vis } from '../TeardownView';
import type { Teardown } from '../types';

/* ------------------------------------------------------------------ small schematic pieces */

function Res({ x1, y1, x2, y2, part, cls = '' }: { x1: number; y1: number; x2: number; y2: number; part?: string; cls?: string }) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const body = Math.min(40, L - 8);
  const a = (L - body) / 2;
  const pts: string[] = [`${x1},${y1}`, `${x1 + ux * a},${y1 + uy * a}`];
  for (let k = 1; k <= 6; k++) {
    const t = a + (body * k) / 6.5;
    const s = k % 2 ? 6 : -6;
    pts.push(`${x1 + ux * t - uy * s},${y1 + uy * t + ux * s}`);
  }
  pts.push(`${x1 + ux * (a + body)},${y1 + uy * (a + body)}`, `${x2},${y2}`);
  return <polyline points={pts.join(' ')} className={`mc-w ${cls}`} data-part={part} />;
}

function Gnd({ x, y, part }: { x: number; y: number; part?: string }) {
  return (
    <g className="mc-w minus" data-part={part}>
      <line x1={x - 11} y1={y} x2={x + 11} y2={y} />
      <line x1={x - 6} y1={y + 5} x2={x + 6} y2={y + 5} />
      <line x1={x - 2} y1={y + 10} x2={x + 2} y2={y + 10} />
    </g>
  );
}

const Dot = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r={3.5} className="mc-solid" />;

function Diode({ x, y, dir, part }: { x: number; y: number; dir: 'up' | 'right'; part?: string }) {
  const tri = dir === 'up' ? `${x - 8},${y + 7} ${x + 8},${y + 7} ${x},${y - 7}` : `${x - 7},${y - 8} ${x - 7},${y + 8} ${x + 7},${y}`;
  const bar = dir === 'up' ? [x - 8, y - 7, x + 8, y - 7] : [x + 7, y - 8, x + 7, y + 8];
  return (
    <g data-part={part}>
      <polygon points={tri} className="mc-box" />
      <line x1={bar[0]} y1={bar[1]} x2={bar[2]} y2={bar[3]} className="mc-w" />
    </g>
  );
}

/** NPN symbol: base lead from x − 30, bar at x, collector lead ends at (x + 24, y − 40), emitter at (x + 24, y + 40) */
function Npn({ x, y, part, label }: { x: number; y: number; part?: string; label?: string }) {
  return (
    <g data-part={part}>
      <path d={`M${x - 30} ${y} H${x}`} className="mc-w" data-part="pin-b" />
      <line x1={x} y1={y - 22} x2={x} y2={y + 22} className="mc-w bold" />
      <path d={`M${x} ${y - 10} L${x + 24} ${y - 26} V${y - 40}`} className="mc-w" data-part="pin-c" />
      <path d={`M${x} ${y + 10} L${x + 24} ${y + 26} V${y + 40}`} className="mc-w" data-part="pin-e" />
      <polygon points={`${x + 24},${y + 26} ${x + 12},${y + 24} ${x + 18},${y + 15}`} className="mc-solid" />
      {label && (
        <text x={x - 6} y={y - 28} textAnchor="end" className="mc-lbl">
          {label}
        </text>
      )}
    </g>
  );
}

/** relay coil drawn as a box with a coil sign */
function Coil({ x, y1, y2, label, part }: { x: number; y1: number; y2: number; label: string; part?: string }) {
  return (
    <g data-part={part}>
      <rect x={x - 14} y={y1} width={28} height={y2 - y1} rx={3} className="mc-box" />
      <path d={`M${x - 14} ${y1 + 8} L${x + 14} ${y2 - 8}`} className="mc-w thin" />
      <text x={x - 20} y={(y1 + y2) / 2 + 4} textAnchor="end" className="mc-tiny">
        {label}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ package (layers 0–1) */

const LEG_X = { e: 250, b: 280, c: 310 };

function Package({ layer }: { layer: number }) {
  const xray = layer >= 1;
  return (
    <g className={vis(layer, 0, 1)}>
      {(['e', 'b', 'c'] as const).map((k) => (
        <g key={k} data-part={`pin-${k}`}>
          <rect x={LEG_X[k] - 3} y={xray ? 196 : 250} width={6} height={xray ? 204 : 150} className="mc-leg" />
          <text x={LEG_X[k]} y={424} textAnchor="middle" className="mc-big">
            {k.toUpperCase()}
          </text>
        </g>
      ))}
      <rect x={220} y={80} width={120} height={172} rx={14} className="mc-epoxy" data-part="body" style={{ opacity: xray ? 0.22 : 1, transition: 'opacity .45s' }} />
      <g className={vis(layer, 0, 0)}>
        <text x={280} y={150} textAnchor="middle" className="mc-silk">
          S8050
        </text>
        <text x={280} y={168} textAnchor="middle" className="mc-silk">
          2N2222A
        </text>
        <text x={280} y={232} textAnchor="middle" className="mc-silk">
          {tr('平面朝你', 'flat face')}
        </text>
      </g>
      {/* X-ray: the die on the collector lead, two bond wires */}
      <g className={vis(layer, 1, 1)}>
        <rect x={292} y={150} width={36} height={52} rx={2} className="mc-leg" data-part="pin-c paddle" />
        <rect x={299} y={160} width={22} height={22} rx={2} className="mc-ic" data-part="die" />
        <path d="M302 166 C 280 160, 258 178, 250 198" className="mc-w thin" style={{ stroke: '#d9b44a' }} data-part="bond" />
        <path d="M306 176 C 296 186, 284 190, 280 198" className="mc-w thin" style={{ stroke: '#d9b44a' }} data-part="bond" />
      </g>
      {/* the symbol, left */}
      <g data-part="symbol">
        <text x={95} y={92} textAnchor="middle" className="td-small">
          {tr('电路符号', 'symbol')}
        </text>
        <Npn x={90} y={180} />
        <text x={52} y={174} className="mc-lbl" data-part="pin-b">
          B
        </text>
        <text x={122} y={132} className="mc-lbl" data-part="pin-c">
          C
        </text>
        <text x={122} y={236} className="mc-lbl" data-part="pin-e">
          E
        </text>
        <text x={95} y={270} textAnchor="middle" className="mc-tiny">
          {tr('箭头 = 发射极电流方向', 'arrow = emitter current')}
        </text>
      </g>
      {/* top view, right */}
      <g data-part="topview" className={vis(layer, 0, 0)}>
        <text x={480} y={118} textAnchor="middle" className="td-small">
          {tr('从上往下看', 'seen from above')}
        </text>
        <path d="M430 196 H530 A50 50 0 0 0 430 196 Z" className="mc-epoxy" />
        {(['E', 'B', 'C'] as const).map((n, i) => (
          <g key={n}>
            <circle cx={455 + i * 25} cy={186} r={3} fill="#c9ccd1" />
            <text x={455 + i * 25} y={176} textAnchor="middle" className="mc-silk">
              {n}
            </text>
          </g>
        ))}
        <text x={480} y={216} textAnchor="middle" className="mc-tiny">
          {tr('↓ 平面朝向你', '↓ flat side toward you')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ layers of silicon (2–3) */

function Layers({ layer }: { layer: number }) {
  const y1 = 140;
  const y2 = 290;
  const carriers = layer === 3;
  return (
    <g className={vis(layer, 2, 3)}>
      <rect x={70} y={y1} width={120} height={y2 - y1} className="mc-nplus" data-part="reg-e" />
      <rect x={190} y={y1} width={46} height={y2 - y1} className="mc-p" data-part="reg-b" />
      <rect x={236} y={y1} width={244} height={y2 - y1} className="mc-n" data-part="reg-c" />
      <rect x={186} y={y1} width={8} height={y2 - y1} className="mc-zone-x" data-part="jbe" />
      <rect x={232} y={y1} width={26} height={y2 - y1} className="mc-zone-x" data-part="jbc" />
      {/* contacts */}
      <rect x={56} y={y1} width={14} height={y2 - y1} className="mc-metal" data-part="pin-e" />
      <rect x={480} y={y1} width={14} height={y2 - y1} className="mc-metal" data-part="pin-c" />
      <rect x={198} y={y1 - 14} width={30} height={14} className="mc-metal" data-part="pin-b" />
      <path d={`M56 215 H30 M494 215 H526 M213 ${y1 - 14} V80`} className="mc-w" />
      <text x={24} y={220} textAnchor="end" className="mc-big" data-part="pin-e">
        E
      </text>
      <text x={532} y={220} className="mc-big" data-part="pin-c">
        C
      </text>
      <text x={213} y={72} textAnchor="middle" className="mc-big" data-part="pin-b">
        B
      </text>
      <g className={vis(layer, 2, 2)}>
        <text x={130} y={170} textAnchor="middle" className="mc-lbl" data-part="reg-e">
          {tr('n⁺ 发射区', 'n⁺ emitter')}
        </text>
        <text x={130} y={188} textAnchor="middle" className="mc-tiny" data-part="reg-e">
          {tr('掺杂很浓', 'heavily doped')}
        </text>
        <text x={213} y={222} textAnchor="middle" className="mc-lbl" data-part="reg-b">
          p
        </text>
        <text x={213} y={238} textAnchor="middle" className="mc-tiny" data-part="reg-b">
          {tr('很薄', 'thin')}
        </text>
        <text x={370} y={170} textAnchor="middle" className="mc-lbl" data-part="reg-c">
          {tr('n 集电区', 'n collector')}
        </text>
        <text x={370} y={188} textAnchor="middle" className="mc-tiny" data-part="reg-c">
          {tr('掺杂淡、面积大', 'lightly doped, large')}
        </text>
        <path d="M190 290 V318" className="mc-w thin" />
        <text x={194} y={334} textAnchor="end" className="mc-tiny" data-part="jbe">
          {tr('BE 结：正偏 0.65 V', 'BE junction: forward, 0.65 V')}
        </text>
        <path d="M245 290 V346" className="mc-w thin" />
        <text x={240} y={360} className="mc-tiny" data-part="jbc">
          {tr('BC 结：反偏（耗尽区更宽）', 'BC junction: reverse (wider depletion)')}
        </text>
      </g>
      {/* carriers */}
      <g className={carriers ? 'td-show' : 'td-hide'}>
        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx={84 + (i % 6) * 18} cy={160 + Math.floor(i / 6) * 50 + (i % 2) * 12} r={4} fill="#2b59c3" />
        ))}
        <path d="M120 215 H470" className="mc-w minus bold" markerEnd="url(#np-ahb)" data-part="electrons" />
        <text x={360} y={206} textAnchor="middle" className="mc-lbl minus" data-part="electrons">
          {tr('电子 e⁻：150 个到集电极', 'electrons: 150 reach the collector')}
        </text>
        <path d="M200 215 C 205 240, 210 255, 214 262" className="mc-w minus" markerEnd="url(#np-ahb)" data-part="recomb" />
        <circle cx={214} cy={268} r={4} fill="#c0392b" data-part="recomb" />
        <text x={226} y={306} className="mc-tiny" data-part="recomb">
          {tr('1 个在基区复合', '1 recombines in the base')}
        </text>
        <path d="M300 104 H230" className="mc-w cur" markerEnd="url(#np-ahc)" data-part="ib" />
        <text x={306} y={108} className="mc-lbl cur" data-part="ib">
          {sub(tr('I_B：补回空穴', 'I_B: replaces holes'))}
        </text>
        <path d="M540 250 H500" className="mc-w cur" markerEnd="url(#np-ahc)" data-part="ic" />
        <text x={540} y={270} textAnchor="end" className="mc-lbl cur" data-part="ic">
          {sub('I_C = β·I_B')}
        </text>
        <path d="M54 250 H16" className="mc-w cur" markerEnd="url(#np-ahc)" data-part="ie" />
        <text x={16} y={270} className="mc-lbl cur" data-part="ie">
          {sub('I_E = I_B + I_C')}
        </text>
        <text x={280} y={330} textAnchor="middle" className="td-small">
          {tr('电子往右走 = 电流往左流（电子带负电）', 'electrons go right = current flows left (electrons are negative)')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ the models (layer 4) */

function ModelPanel({ x, part, title, note, children }: { x: number; part: string; title: string; note: ReactNode; children: ReactNode }) {
  const y = 60;
  return (
    <g data-part={part}>
      <rect x={x} y={y} width={172} height={300} rx={10} className="mc-box soft" />
      <text x={x + 86} y={y + 22} textAnchor="middle" className="mc-lbl">
        {title}
      </text>
      <text x={x + 14} y={y + 134} className="mc-lbl">
        B
      </text>
      <text x={x + 132} y={y + 52} className="mc-lbl">
        C
      </text>
      <text x={x + 132} y={y + 262} className="mc-lbl">
        E
      </text>
      <circle cx={x + 120} cy={y + 48} r={4} className="mc-box" />
      <circle cx={x + 120} cy={y + 258} r={4} className="mc-box" />
      <circle cx={x + 18} cy={y + 150} r={4} className="mc-box" />
      {children}
      <text x={x + 86} y={y + 288} textAnchor="middle" className="mc-tiny">
        {note}
      </text>
    </g>
  );
}

function Models({ layer }: { layer: number }) {
  const xs = [14, 194, 374];
  const y = 60;
  const base = (x: number) => (
    <g>
      <path d={`M${x + 22} ${y + 150} H${x + 30} M${x + 70} ${y + 150} H${x + 80} M${x + 94} ${y + 150} H${x + 100} V${y + 230} H${x + 120} V${y + 254}`} className="mc-w" />
      <Res x1={x + 30} y1={y + 150} x2={x + 70} y2={y + 150} />
      <Diode x={x + 87} y={y + 150} dir="right" />
      <text x={x + 50} y={y + 138} textAnchor="middle" className="mc-tiny">
        20 Ω
      </text>
      <text x={x + 62} y={y + 174} textAnchor="middle" className="mc-tiny">
        0.65 V
      </text>
      <Dot x={x + 120} y={y + 230} />
    </g>
  );
  return (
    <g className={vis(layer, 4, 4)}>
      <ModelPanel x={xs[0]} part="m-cut" title={tr('截止 cut-off', 'cut-off')} note={sub(tr('V_BE < 0.65 V：全断开', 'V_BE < 0.65 V: all open'))}>
        <path d={`M${xs[0] + 120} ${y + 52} V${y + 110} M${xs[0] + 120} ${y + 200} V${y + 254}`} className="mc-w" />
        <text x={xs[0] + 120} y={y + 160} textAnchor="middle" className="mc-big">
          {tr('开路', 'open')}
        </text>
        <text x={xs[0] + 60} y={y + 200} textAnchor="middle" className="mc-tiny">
          {sub('I_B = 0, I_C = 0')}
        </text>
      </ModelPanel>
      <ModelPanel x={xs[1]} part="m-act" title={tr('放大 active', 'active')} note={tr('C–E 是受控电流源', 'C–E is a controlled current source')}>
        {base(xs[1])}
        <path d={`M${xs[1] + 120} ${y + 52} V${y + 96} M${xs[1] + 120} ${y + 124} V${y + 230}`} className="mc-w" />
        <circle cx={xs[1] + 120} cy={y + 110} r={14} className="mc-box" />
        <path d={`M${xs[1] + 120} ${y + 101} V${y + 119}`} className="mc-w" markerEnd="url(#np-ah)" />
        <text x={xs[1] + 138} y={y + 114} className="mc-lbl acc">
          {sub('β·I_B')}
        </text>
      </ModelPanel>
      <ModelPanel x={xs[2]} part="m-sat" title={tr('饱和 saturation', 'saturation')} note={tr('C–E 是 0.15 V + 1 Ω：接通的开关', 'C–E is 0.15 V + 1 Ω: a closed switch')}>
        {base(xs[2])}
        <path d={`M${xs[2] + 120} ${y + 52} V${y + 86} M${xs[2] + 120} ${y + 94} V${y + 120} M${xs[2] + 120} ${y + 170} V${y + 230}`} className="mc-w" />
        <path d={`M${xs[2] + 106} ${y + 86} H${xs[2] + 134} M${xs[2] + 112} ${y + 94} H${xs[2] + 128}`} className="mc-w" />
        <Res x1={xs[2] + 120} y1={y + 120} x2={xs[2] + 120} y2={y + 170} />
        <text x={xs[2] + 140} y={y + 94} className="mc-tiny">
          0.15 V
        </text>
        <text x={xs[2] + 134} y={y + 150} className="mc-tiny">
          1 Ω
        </text>
      </ModelPanel>
      <text x={280} y={400} textAnchor="middle" className="mc-big">
        {sub(tr('三种状态的 B–E 都一样：0.65 V + 20 Ω；不同的是 C–E', 'B–E is the same in all three: 0.65 V + 20 Ω; C–E differs'))}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ output curves (layer 5) */

function Curves({ layer }: { layer: number }) {
  const x = (v: number) => 80 + (v / 5) * 420;
  const y = (ma: number) => 380 - (ma / 30) * 290;
  const curve = (ic: number) => {
    const knee = 0.25;
    return `M${x(0)} ${y(0)} L${x(knee * 0.5)} ${y(ic * 0.75)} L${x(knee)} ${y(ic)} L${x(5)} ${y(ic * 1.04)}`;
  };
  return (
    <g className={vis(layer, 5, 5)}>
      <rect x={x(0)} y={y(30)} width={x(0.3) - x(0)} height={y(0) - y(30)} className="mc-zone-hi" data-part="r-sat" />
      <rect x={x(0)} y={y(0.6)} width={x(5) - x(0)} height={y(0) - y(0.6) + 2} className="mc-zone-lo" data-part="r-cut" />
      <path d={`M${x(0)} ${y(0)} H${x(5) + 14} M${x(0)} ${y(0)} V${y(30) - 14}`} className="mc-axis" />
      {[0, 1, 2, 3, 4, 5].map((v) => (
        <text key={v} x={x(v)} y={y(0) + 16} textAnchor="middle" className="mc-tiny">
          {v}
        </text>
      ))}
      {[0, 10, 20, 30].map((m) => (
        <text key={m} x={x(0) - 8} y={y(m) + 4} textAnchor="end" className="mc-tiny">
          {m}
        </text>
      ))}
      <text x={x(5) + 14} y={y(0) + 32} textAnchor="end" className="td-small">
        {sub('V_CE (V) →')}
      </text>
      <text x={x(0) + 6} y={y(30) - 6} className="td-small">
        {sub('I_C (mA)')}
      </text>
      <g data-part="r-act">
        {(
          [
            [26.5, 4],
            [67, 10],
            [100, 15],
            [133, 20],
          ] as const
        ).map(([ib, ic]) => (
          <g key={ib}>
            <path d={curve(ic)} className="mc-curve" />
            <text x={x(5) - 4} y={y(ic * 1.04) - 5} textAnchor="end" className="mc-tiny">
              {sub(`I_B = ${ib} µA`)}
            </text>
          </g>
        ))}
        <text x={x(2.6)} y={y(25)} textAnchor="middle" className="mc-lbl acc">
          {sub(tr('放大区：I_C = β·I_B，几乎与 V_CE 无关', 'active: I_C = β·I_B, nearly flat in V_CE'))}
        </text>
      </g>
      <path d={`M${x(3.67)} ${y(0)} L${x(0)} ${y(26.2)}`} className="mc-w cur" data-part="loadline" />
      <text x={x(2.75)} y={y(7.3)} className="mc-lbl cur" data-part="loadline">
        {tr('蜂鸣器负载线', 'buzzer load line')}
      </text>
      <g data-part="q-act">
        <circle cx={x(3.11)} cy={y(4)} r={6} fill="#7a3fc0" />
        <text x={x(3.11) + 10} y={y(4) - 8} className="mc-tiny">
          {tr('100 kΩ：4 mA，3.1 V', '100 kΩ: 4 mA, 3.1 V')}
        </text>
      </g>
      <g data-part="q-sat">
        <circle cx={x(0.17)} cy={y(24.9)} r={6} fill="#e63946" />
        <text x={x(0.17) + 10} y={y(24.9) - 8} className="mc-tiny">
          {tr('1 kΩ：24.9 mA，0.17 V', '1 kΩ: 24.9 mA, 0.17 V')}
        </text>
      </g>
      <text x={x(0.15)} y={y(30) + 16} textAnchor="middle" className="mc-tiny" data-part="r-sat">
        {tr('饱和', 'sat.')}
      </text>
      <text x={x(4.3)} y={y(0.6) - 4} textAnchor="middle" className="mc-tiny" data-part="r-cut">
        {sub(tr('截止 I_C ≈ 0', 'cut-off I_C ≈ 0'))}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ the switch (layer 6) */

function Switch({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 6, 6)}>
      <g data-part="gpio">
        <circle cx={44} cy={260} r={5} className="mc-box" />
        <text x={44} y={244} textAnchor="middle" className="mc-tiny">
          GPIO
        </text>
        <text x={44} y={284} textAnchor="middle" className="mc-tiny">
          3.3 V
        </text>
      </g>
      <path d="M49 260 H100 M180 260 H250" className="mc-w" />
      <Res x1={100} y1={260} x2={180} y2={260} part="rb" />
      <text x={140} y={244} textAnchor="middle" className="mc-lbl" data-part="rb">
        R1 = 1 kΩ
      </text>
      <Npn x={280} y={260} part="q" label="Q1" />
      <path d="M304 300 V350" className="mc-w" />
      <Gnd x={304} y={350} />
      <path d="M270 70 H340" className="mc-w plus bold" />
      <text x={346} y={74} className="mc-lbl plus">
        {tr('5V 脚 4.67 V', '5V pin 4.67 V')}
      </text>
      <g data-part="buzzer">
        <path d="M304 70 V100 M304 156 V220" className="mc-w" />
        <circle cx={304} cy={128} r={26} className="mc-box" />
        <text x={304} y={133} textAnchor="middle" className="mc-lbl">
          BZ
        </text>
        <text x={292} y={112} className="mc-tiny">
          +
        </text>
        <text x={272} y={132} textAnchor="end" className="mc-tiny">
          4.49 V
        </text>
      </g>
      <g data-part="pd">
        <path d="M222 260 V286 M222 330 V350" className="mc-dash" />
        <Res x1={222} y1={286} x2={222} y2={330} cls="thin" />
        <Gnd x={222} y={350} />
        <text x={212} y={380} textAnchor="middle" className="mc-tiny">
          {tr('可选：100 kΩ 下拉', 'optional 100 kΩ pull-down')}
        </text>
      </g>
      <Dot x={222} y={260} />
      <path d="M190 248 H232" className="mc-w cur" markerEnd="url(#np-ahc)" data-part="ib" />
      <text x={210} y={240} textAnchor="middle" className="mc-lbl cur" data-part="ib">
        {sub('I_B 2.53 mA')}
      </text>
      <path d="M320 166 V200" className="mc-w cur" markerEnd="url(#np-ahc)" data-part="ic" />
      <text x={326} y={186} className="mc-lbl cur" data-part="ic">
        {sub('I_C 24.9 mA')}
      </text>
      <text x={316} y={276} className="mc-lbl acc" data-part="vce">
        {sub('V_CE 0.17 V')}
      </text>
      <text x={232} y={302} className="mc-tiny" data-part="vbe">
        {sub('V_BE 0.70 V')}
      </text>
      {/* the recipe */}
      <g data-part="steps">
        <rect x={404} y={96} width={146} height={196} rx={10} className="mc-box soft" />
        <text x={477} y={118} textAnchor="middle" className="mc-lbl">
          {tr('算 R1 的四步', 'R1 in four steps')}
        </text>
        {[
          sub('① I_C ≈ 24.9 mA'),
          sub(tr('② 强制 β = 10', '② forced β = 10')),
          sub('   I_B ≥ 2.5 mA'),
          sub('③ R1 ≤ (3.3 − 0.7)'),
          sub('        / 2.5 mA'),
          sub('      = 1.04 kΩ'),
          tr('④ 取 1 kΩ', '④ pick 1 kΩ'),
        ].map((t, i) => (
          <text key={i} x={414} y={144 + i * 21} className="mc-mono" xmlSpace="preserve">
            {t}
          </text>
        ))}
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ high vs low side (layer 7) */

function Sides({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 7, 7)}>
      <line x1={280} y1={44} x2={280} y2={420} className="mc-dash" />
      {/* HIGH SIDE */}
      <g data-part="high">
        <text x={140} y={40} textAnchor="middle" className="mc-big">
          {tr('高边（错）', 'HIGH side (wrong)')}
        </text>
        <path d="M60 70 H250" className="mc-w plus bold" />
        <text x={64} y={64} className="mc-lbl plus">
          5V
        </text>
        <path d="M30 170 H40 M90 170 H100 M154 130 V70 M154 210 V240 M154 300 V360 M154 226 H210 V258 M210 274 V320 H154" className="mc-w" />
        <circle cx={26} cy={170} r={4} className="mc-box" />
        <text x={26} y={156} textAnchor="middle" className="mc-tiny">
          GPIO
        </text>
        <Res x1={40} y1={170} x2={90} y2={170} />
        <Npn x={130} y={170} label="Q1" />
        <Coil x={154} y1={240} y2={300} label="K1 70 Ω" />
        <Diode x={210} y={266} dir="up" />
        <Gnd x={154} y={360} />
        <Dot x={154} y={226} />
        <Dot x={154} y={320} />
        <text x={66} y={196} textAnchor="middle" className="mc-tiny">
          1 kΩ
        </text>
        <text x={98} y={156} textAnchor="end" className="mc-lbl acc" data-part="vb">
          {sub('V_B 3.06 V')}
        </text>
        <text x={146} y={238} textAnchor="end" className="mc-lbl acc" data-part="ve">
          {sub('V_E 2.41 V')}
        </text>
        <text x={168} y={110} className="mc-tiny" data-part="vce-hi">
          {sub(tr('V_CE = 2.26 V 放大区', 'V_CE = 2.26 V, active'))}
        </text>
        <text x={140} y={396} textAnchor="middle" className="mc-lbl plus">
          {tr('34 mA < 53 mA：不吸合', '34 mA < 53 mA: no pull-in')}
        </text>
      </g>
      {/* LOW SIDE */}
      <g data-part="low">
        <text x={420} y={40} textAnchor="middle" className="mc-big">
          {tr('低边（对）', 'LOW side (right)')}
        </text>
        <path d="M330 70 H520" className="mc-w plus bold" />
        <text x={516} y={64} textAnchor="end" className="mc-lbl plus">
          5V
        </text>
        <path d="M420 70 V100 M420 160 V200 M420 86 H476 V118 M476 134 V180 H420 M420 280 V330 M300 240 H316 M356 240 H366" className="mc-w" />
        <circle cx={296} cy={240} r={4} className="mc-box" />
        <text x={300} y={226} className="mc-tiny">
          GPIO
        </text>
        <Res x1={316} y1={240} x2={356} y2={240} />
        <Coil x={420} y1={100} y2={160} label="K2 70 Ω" />
        <Diode x={476} y={126} dir="up" />
        <Npn x={396} y={240} label="Q2" />
        <Gnd x={420} y={330} />
        <Dot x={420} y={86} />
        <Dot x={420} y={180} />
        <text x={336} y={266} textAnchor="middle" className="mc-tiny">
          1 kΩ
        </text>
        <text x={430} y={256} className="mc-lbl acc" data-part="vce-lo">
          {sub('V_CE 0.21 V')}
        </text>
        <text x={432} y={196} className="mc-tiny">
          {tr('线圈 4.44 V', 'coil 4.44 V')}
        </text>
        <text x={420} y={396} textAnchor="middle" className="mc-lbl" fill="#2a9d6f">
          {tr('63 mA ≥ 53 mA：吸合', '63 mA ≥ 53 mA: pulls in')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ limits (layer 8) */

function Soa({ layer }: { layer: number }) {
  const x = (v: number) => 80 + (v / 45) * 420;
  const y = (ma: number) => 380 - (ma / 700) * 290;
  const hyp: string[] = [];
  for (let v = 0.625 / 0.6; v <= 40.001; v *= 1.08) hyp.push(`${x(v)},${y((0.625 / v) * 1000)}`);
  hyp.push(`${x(40)},${y((0.625 / 40) * 1000)}`);
  return (
    <g className={vis(layer, 8, 8)}>
      <polygon points={`${x(0)},${y(0)} ${x(0)},${y(600)} ${hyp.join(' ')} ${x(40)},${y(0)}`} className="mc-zone-lo" data-part="soa" />
      <path d={`M${x(0)} ${y(0)} H${x(45) + 10} M${x(0)} ${y(0)} V${y(700) - 10}`} className="mc-axis" />
      <path d={`M${x(0)} ${y(600)} H${x(0.625 / 0.6)}`} className="mc-curve r" data-part="icmax" />
      <polyline points={hyp.join(' ')} className="mc-curve o" data-part="pmax" />
      <path d={`M${x(40)} ${y(0)} V${y(300)}`} className="mc-curve r" data-part="vceo" />
      <text x={x(1.5)} y={y(600) + 22} className="mc-lbl plus" data-part="icmax">
        {sub('I_Cmax = 600 mA')}
      </text>
      <text x={x(9)} y={y(110)} className="mc-lbl cur" data-part="pmax">
        {sub('P = V_CE·I_C = 625 mW')}
      </text>
      <text x={x(40) - 6} y={y(300) - 8} textAnchor="end" className="mc-lbl plus" data-part="vceo">
        {sub('V_CEO = 40 V')}
      </text>
      {[0, 10, 20, 30, 40].map((v) => (
        <text key={v} x={x(v)} y={y(0) + 16} textAnchor="middle" className="mc-tiny">
          {v}
        </text>
      ))}
      {[0, 200, 400, 600].map((m) => (
        <text key={m} x={x(0) - 8} y={y(m) + 4} textAnchor="end" className="mc-tiny">
          {m}
        </text>
      ))}
      <text x={x(45) + 10} y={y(0) + 32} textAnchor="end" className="td-small">
        {sub('V_CE (V) →')}
      </text>
      <text x={x(0) + 6} y={y(700) - 4} className="td-small">
        {sub('I_C (mA)')}
      </text>
      <g data-part="pt-motor">
        <circle cx={x(0.8)} cy={y(620)} r={6} fill="#e63946" />
        <text x={x(4)} y={y(650)} className="mc-tiny">
          {sub(tr('0.62 A 电机：超 I_C 上限，要 62 mA 基极电流 ✗', '0.62 A motor: above I_C max, needs 62 mA base current ✗'))}
        </text>
      </g>
      <g data-part="pt-ok">
        <circle cx={x(0.21)} cy={y(63)} r={6} fill="#2a9d6f" />
        <path d={`M${x(0.21) + 4} ${y(63) - 4} L${x(5)} ${y(290)}`} className="mc-w thin" />
        <text x={x(5) + 4} y={y(290) - 4} className="mc-tiny">
          {tr('继电器低边：63 mA，0.21 V，15 mW ✓', 'relay low side: 63 mA, 0.21 V, 15 mW ✓')}
        </text>
      </g>
      <text x={280} y={60} textAnchor="middle" className="mc-big">
        {tr('2N2222 的安全工作区（蓝色）', '2N2222 safe operating area (blue)')}
      </text>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="np-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="mc-ah" />
        </marker>
        <marker id="np-ahc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="mc-ah cur" />
        </marker>
        <marker id="np-ahb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#2b59c3" />
        </marker>
      </defs>
      <Package layer={layer} />
      <Layers layer={layer} />
      <Models layer={layer} />
      <Curves layer={layer} />
      <Switch layer={layer} />
      <Sides layer={layer} />
      <Soa layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'npn',
    title: tr('NPN 三极管：小电流控制大电流', 'The NPN transistor: a small current controls a big one'),
    subtitle: tr(
      'NPN = 两层 n 型半导体夹一层很薄的 p 型。我们从 TO-92 封装拆到硅片上的三层，看电子怎么穿过基区，得到“集电极电流 = β × 基极电流”；再把它化成三种状态的等效电路，最后用它算基极电阻，并解释为什么 3.3 V 的引脚不能把 NPN 放在负载上面。',
      'An NPN = two layers of n-type silicon around a very thin p-type layer. We go from the TO-92 package to the three layers on the die, watch electrons cross the base to get "collector current = β × base current", turn it into an equivalent circuit for each region, and use it to size the base resistor — and to see why a 3.3 V pin cannot put an NPN above the load.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'package',
        short: tr('外形', 'Package'),
        title: tr('① 外形：TO-92，三只脚 E B C', '① Package: TO-92 with three legs, E B C'),
        body: tr(
          `实验 5-7、5-18 用的 2N2222A / S8050 装在 **TO-92** 封装里：一个半圆柱形的黑色塑料块，一面是 [[body|平面]]，三只脚。

**认脚**：把印字的平面对着自己、脚朝下，从左到右是 [[pin-e|E]]、[[pin-b|B]]、[[pin-c|C]]（[[topview|从上往下看]]就是 D 字形，平面一边朝你）。注意：不同型号排列不一样（例如 BC547 是 C B E），**一定要查手册**，仿真器里统一是 E B C。

[[symbol|电路符号]] 里：
- 中间竖线是基极 B，一根横线接进来；
- 斜着向上的是集电极 C；
- 带箭头的是发射极 E，箭头 **向外** 表示 NPN（电流从 E 流出）。记法：“箭头不指进来 = Not Pointing iN = NPN”。`,
          `The 2N2222A / S8050 of labs 5-7 and 5-18 comes in a **TO-92** package: a half-cylinder of black plastic with one [[body|flat face]] and three legs.

**Finding the pins**: printed flat face toward you, legs down, left to right: [[pin-e|E]], [[pin-b|B]], [[pin-c|C]] (seen [[topview|from above]] it is a D with the flat side toward you). Careful: other part numbers use other orders (the BC547 is C B E) — **always check the datasheet**. The simulator always uses E B C.

In the [[symbol|circuit symbol]]:
- the vertical bar is the base B, with a line coming in;
- the slanted line going up is the collector C;
- the one with the arrow is the emitter E; the arrow points **out** for an NPN (current leaves at E). Mnemonic: "Not Pointing iN = NPN".`,
        ),
        table: {
          head: [tr('脚', 'Pin'), tr('名字', 'Name'), tr('作用', 'Role'), tr('低边开关里接', 'In a low-side switch')],
          rows: [
            ['E', tr('发射极 emitter', 'emitter'), tr('电子从这里“发射”出来；电流从这里流出', 'emits electrons; current leaves here'), 'GND'],
            ['B', tr('基极 base', 'base'), tr('控制端：一点点电流就能开关', 'the control: a small current switches it'), tr('经 R_B 接 GPIO', 'GPIO through R_B')],
            [
              'C',
              tr('集电极 collector', 'collector'),
              tr('收集电子；大电流从这里流进', 'collects electrons; the big current enters here'),
              tr('负载的下端', 'the bottom of the load'),
            ],
          ],
          parts: ['pin-e', 'pin-b', 'pin-c'],
        },
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：一小块硅片坐在集电极引脚上', '② X-ray: a tiny die sitting on the collector lead'),
        body: tr(
          `把塑料变透明：[[pin-c|C 脚]] 在里面变宽成一个 [[paddle|小平台]]，上面焊着不到 1 mm 见方的 [[die|硅片 die]]。硅片的 **背面就是集电区**，直接焊在 C 脚上（这样集电极的热量也能从这只脚导出去）。

硅片正面有两块金属，各用一根 [[bond|金线]] 连到 E 脚和 B 脚。

所以三只脚并不对称：E 和 C **不能互换**。接反了（C 当 E 用）三极管还会“有点”工作，但 β 只剩几，开关根本打不开。`,
          `Make the plastic transparent: [[pin-c|the C lead]] widens inside into a [[paddle|small platform]] carrying a [[die|silicon die]] less than 1 mm across. The **back of the die is the collector** and is soldered straight onto the C lead (which also carries the collector's heat out).

The top of the die has two metal pads, each joined by a [[bond|gold bond wire]] to the E and B leads.

So the three legs are not symmetric: E and C **cannot be swapped**. Wired backwards (C used as E) the transistor still "sort of" works, but β drops to a few and the switch never turns fully on.`,
        ),
      },
      {
        id: 'layers',
        short: tr('三层', 'Three layers'),
        title: tr('③ 内部结构：n⁺ – p – n 三层，两个 PN 结', '③ Inside: three layers n⁺ – p – n, two PN junctions'),
        body: tr(
          `把硅片剖开（这里画成教材里的横截面）：
- [[reg-e|发射区 E]]：n 型，掺杂 **很浓**（n⁺），里面有大量自由电子；
- [[reg-b|基区 B]]：p 型，**非常薄**（约 1 µm），掺杂较淡；
- [[reg-c|集电区 C]]：n 型，掺杂淡、面积大，能承受高电压。

两层交界处就是两个 PN 结（和二极管拆解里的一样）：
- [[jbe|BE 结]]：在开关电路里 **正偏**，要约 0.65 V 才导通——所以 GPIO 到基极之间“看到”的是一个二极管；
- [[jbc|BC 结]]：**反偏**，耗尽区里有很强的电场，指向“把电子拉进集电区”的方向。

如果只看两只脚之间：B–E 是二极管，B–C 也是二极管。但两个二极管背靠背 **不能** 做成三极管——秘密在于基区很薄，下一层讲。`,
          `Cut the die open (drawn here as the textbook cross-section):
- [[reg-e|emitter E]]: n-type, **heavily** doped (n⁺), full of free electrons;
- [[reg-b|base B]]: p-type, **very thin** (about 1 µm), lightly doped;
- [[reg-c|collector C]]: n-type, lightly doped and large, so it can stand a high voltage.

Where two layers meet there is a PN junction (the same as in the diode teardown):
- [[jbe|the BE junction]] is **forward-biased** in a switch circuit and needs about 0.65 V to conduct — so the GPIO "sees" a diode at the base;
- [[jbc|the BC junction]] is **reverse-biased**; its depletion region holds a strong field that pulls electrons into the collector.

Looking at two legs at a time, B–E is a diode and B–C is a diode. But two diodes back to back do **not** make a transistor — the secret is the thin base (next layer).`,
        ),
        table: {
          head: [tr('区', 'Region'), tr('类型', 'Type'), tr('掺杂', 'Doping'), tr('厚度', 'Thickness'), tr('为什么这样做', 'Why')],
          rows: [
            [tr('发射区 E', 'emitter E'), 'n⁺', tr('很浓', 'heavy'), tr('中', 'medium'), tr('提供大量电子', 'supplies many electrons')],
            [tr('基区 B', 'base B'), 'p', tr('淡', 'light'), tr('很薄 ≈ 1 µm', 'very thin ≈ 1 µm'), tr('电子来不及复合就穿过去', 'electrons cross before recombining')],
            [tr('集电区 C', 'collector C'), 'n', tr('更淡', 'lighter'), tr('厚', 'thick'), tr('耐高压（V_CEO = 40 V）', 'withstands voltage (V_CEO = 40 V)')],
          ],
          parts: ['reg-e', 'reg-b', 'reg-c'],
        },
      },
      {
        id: 'carriers',
        short: tr('电子怎么走', 'Carriers'),
        title: tr('④ 为什么集电极电流 = β × 基极电流：电子穿过薄薄的基区', '④ Why the collector current is β times the base current: electrons cross the thin base'),
        body: tr(
          `给 BE 结加 0.65 V 正偏，发射区的大量电子涌进基区。接下来：
1. 基区很薄、空穴很少，绝大多数电子还没来得及和空穴复合，就扩散到了 BC 结边上；
2. BC 结反偏的电场把它们 [[electrons|一把拉进集电区]]——这就是集电极电流 $I_C$；
3. 只有很少一部分电子 [[recomb|在基区和空穴复合]]，被复合掉的空穴要靠基极电流 [[ib|$I_B$]] 补回来。

“到达集电极的电子”和“在基区复合的电子”的比例由结构决定，大致是常数，这个比例就是 **电流放大系数 β**（$h_{FE}$）。仿真里 β = 150：每复合 1 个，就有 150 个到达集电极：
$$I_C = β·I_B$$
根据 KCL（流进三极管的电流 = 流出的）：
$$I_E = I_B + I_C = (β + 1) I_B$$
例：$I_B$ = 26.5 µA → $I_C$ = 150 × 26.5 µA ≈ 4.0 mA，$I_E$ ≈ 4.0 mA。

关键：是 **基极电流** 控制集电极电流，不是基极电压。BE 结一旦导通，$V_{BE}$ 只在 0.65–0.75 V 之间变一点点。`,
          `Forward-bias the BE junction with 0.65 V and electrons pour from the emitter into the base. Then:
1. the base is thin and has few holes, so almost all electrons diffuse to the BC junction before they meet a hole;
2. the reverse-biased BC junction's field [[electrons|sweeps them into the collector]] — that is the collector current $I_C$;
3. only a few electrons [[recomb|recombine with holes in the base]], and the base current [[ib|$I_B$]] has to replace those holes.

The ratio of "electrons that reach the collector" to "electrons that recombine in the base" is set by the structure and is roughly constant: the **current gain β** ($h_{FE}$). In the simulator β = 150: for every one that recombines, 150 reach the collector:
$$I_C = β·I_B$$
By KCL (current in = current out):
$$I_E = I_B + I_C = (β + 1) I_B$$
Example: $I_B$ = 26.5 µA → $I_C$ = 150 × 26.5 µA ≈ 4.0 mA, $I_E$ ≈ 4.0 mA.

Key point: the **base current** controls the collector current, not the base voltage. Once the BE junction conducts, $V_{BE}$ only moves a little, between 0.65 and 0.75 V.`,
        ),
        formulas: [
          { tex: 'I_C = β·I_B', note: tr('放大区；仿真 β = 150，2N2222 手册 35–300', 'active region; sim β = 150, datasheet 35–300') },
          { tex: 'I_E = I_B + I_C = (β + 1) I_B', note: 'KCL' },
        ],
      },
      {
        id: 'model',
        short: tr('等效电路', 'Models'),
        title: tr('⑤ 等效电路：B–E 是二极管，C–E 随状态变', '⑤ Equivalent circuits: B–E is a diode, C–E depends on the region'),
        body: tr(
          `仿真器用的模型（也是电路课里的分段线性模型）：
- **B–E**：理想二极管 0.65 V 串 20 Ω，三种状态都一样；
- [[m-cut|截止 cut-off]]：$V_{BE}$ < 0.65 V，没有基极电流，C–E 断开；
- [[m-act|放大 active]]：C–E 是一个 **受控电流源**（电流控制电流源，CCCS）$β·I_B$——和 op-amp 拆解里的受控电压源一样，可以直接放进结点方程；
- [[m-sat|饱和 saturation]]：C–E 是 0.15 V 串 1 Ω，就是一个闭合的开关，压降很小。

怎么判断在哪个状态：先假设放大区，算出 $β·I_B$；如果负载在 $V_{CE}$ ≈ 0.2 V 时能流过的电流 **小于** $β·I_B$，假设不成立——三极管“想”给的电流比负载能接受的还多，它就饱和了，$I_C$ 由负载决定。`,
          `The simulator's model (also the piecewise-linear model of a circuits course):
- **B–E**: an ideal 0.65 V diode with 20 Ω, the same in every region;
- [[m-cut|cut-off]]: $V_{BE}$ < 0.65 V, no base current, C–E open;
- [[m-act|active]]: C–E is a **dependent current source** (a current-controlled current source, CCCS) $β·I_B$ — like the op-amp's dependent voltage source, it goes straight into nodal equations;
- [[m-sat|saturation]]: C–E is 0.15 V plus 1 Ω — a closed switch with a small drop.

Which region? Assume active and compute $β·I_B$. If the load, with $V_{CE}$ ≈ 0.2 V, can only pass **less** than $β·I_B$, the assumption fails — the transistor "offers" more current than the load can take, so it saturates and $I_C$ is set by the load.`,
        ),
        table: {
          head: [tr('状态', 'Region'), tr('条件', 'Condition'), tr('C–E 等效', 'C–E model'), tr('用途', 'Use')],
          rows: [
            [tr('截止', 'cut-off'), '$V_{BE}$ < 0.65 V', tr('开路，$I_C$ = 0', 'open, $I_C$ = 0'), tr('开关断开', 'switch off')],
            [
              tr('放大', 'active'),
              tr('$β·I_B$ < 负载在饱和时的电流', '$β·I_B$ < what the load takes at saturation'),
              '$I_C = β·I_B$',
              tr('放大器、恒流源', 'amplifier, current source'),
            ],
            [tr('饱和', 'saturation'), tr('$β·I_B$ > 负载电流', '$β·I_B$ > the load current'), '0.15 V + 1 Ω·$I_C$', tr('开关闭合', 'switch on')],
          ],
          parts: ['m-cut', 'm-act', 'm-sat'],
        },
      },
      {
        id: 'curves',
        short: tr('输出特性', 'Curves'),
        title: tr('⑥ 输出特性曲线 + 负载线：一眼看出在哪个区', '⑥ Output curves and the load line: the region at a glance'),
        body: tr(
          `把 $I_C$ 对 $V_{CE}$ 画出来，每一个 $I_B$ 是一条曲线：在 [[r-act|放大区]] 几乎是水平线（$I_C$ = β·$I_B$，和 $V_{CE}$ 无关），在左边 [[r-sat|饱和区]]（$V_{CE}$ < 约 0.3 V）全部挤在一起往下掉，底部是 [[r-cut|截止区]]。

外电路给出另一条线——**负载线**。实验 5-7 的蜂鸣器（模型 1.0 V + 140 Ω）接在 5V 脚（4.67 V）和集电极之间，KVL：
$$V_{CE} = 4.67 - 1.0 - 140·I_C$$
这是一条直线：$I_C$ = 0 时 $V_{CE}$ = 3.67 V，$V_{CE}$ = 0 时 $I_C$ = 26.2 mA。三极管只能工作在 [[loadline|负载线]] 和某条 $I_B$ 曲线的交点上：
- 初始电路 $R_B$ = 100 kΩ：$I_B$ = 26.5 µA，交点 [[q-act|4 mA、3.1 V]]——放大区，蜂鸣器只分到 1.56 V，不响；
- 换成 1 kΩ：$I_B$ = 2.53 mA，$β·I_B$ = 380 mA，远超负载线的最大值 26 mA，交点被推到最左边 [[q-sat|24.9 mA、0.17 V]]——饱和。

开关就是要在负载线的两端之间跳：截止（右下角）↔ 饱和（左上角），永远不停在中间。`,
          `Plot $I_C$ against $V_{CE}$, one curve per $I_B$: in the [[r-act|active region]] each is almost flat ($I_C$ = β·$I_B$, regardless of $V_{CE}$); on the left, in [[r-sat|saturation]] ($V_{CE}$ below about 0.3 V), they all bunch together and fall; along the bottom is [[r-cut|cut-off]].

The outside circuit gives another line — the **load line**. In lab 5-7 the buzzer (model: 1.0 V + 140 Ω) sits between the 5V pin (4.67 V) and the collector; KVL:
$$V_{CE} = 4.67 - 1.0 - 140·I_C$$
A straight line: $V_{CE}$ = 3.67 V at $I_C$ = 0, $I_C$ = 26.2 mA at $V_{CE}$ = 0. The transistor can only sit where the [[loadline|load line]] crosses its $I_B$ curve:
- the starting board, $R_B$ = 100 kΩ: $I_B$ = 26.5 µA, crossing at [[q-act|4 mA, 3.1 V]] — active; the buzzer gets only 1.56 V and stays silent;
- with 1 kΩ: $I_B$ = 2.53 mA, $β·I_B$ = 380 mA, far beyond the load line's 26 mA maximum, so the point is pushed to the far left, [[q-sat|24.9 mA, 0.17 V]] — saturated.

A switch jumps between the two ends of the load line: cut-off (bottom right) ↔ saturation (top left), never resting in the middle.`,
        ),
        formulas: [{ tex: 'V_{CE} = V_{CC} - V_{load}(I_C)', note: tr('负载线：外电路的 KVL', 'the load line: KVL of the outside circuit') }],
      },
      {
        id: 'switch',
        short: tr('当开关', 'As a switch'),
        title: tr('⑦ 当开关用：一步步算基极电阻（实验 5-7）', '⑦ As a switch: the base resistor step by step (lab 5-7)'),
        body: tr(
          `目标：3.3 V 的 GPIO 控制 5 V 的 [[buzzer|蜂鸣器]]，三极管放在负载 **下面**（低边，low-side），E 接地。

**第 1 步 · 负载电流**：饱和时 $V_{CE}$ ≈ 0.17 V，蜂鸣器分到 4.67 − 0.17 = 4.49 V，$I_C = \\frac{4.49 - 1.0}{140}$ ≈ **24.9 mA**。
**第 2 步 · 需要的基极电流**：要保证 [[q|Q1]] 深度饱和，按 **强制 β**（forced β）= $\\frac{I_C}{I_B}$ ≈ 10 来设计：
$$I_B ≥ \\frac{I_C}{10} = 2.5 mA$$
为什么不用 β = 150？手册上的 β 范围是 35–300，还随温度和电流变，用 10 留足余量。
**第 3 步 · 基极电阻**：[[rb|R1]] 两端是 GPIO 的 3.3 V 减去 [[vbe|$V_BE$ ≈ 0.7 V]]：
$$R_1 ≤ \\frac{3.3 - 0.7}{2.5 mA} = 1.04 kΩ$$
**第 4 步 · 取 1 kΩ**，验算（仿真）：[[ib|$I_B$ = 2.53 mA]]，[[ic|$I_C$ = 24.9 mA]]，[[vce|$V_CE$ = 0.17 V]]，管子功耗 $P ≈ V_{CE}·I_C + V_{BE}·I_B$ ≈ 4.2 + 1.8 ≈ 6 mW。GPIO 只出 2.5 mA，远低于 20 mA。

**为什么必须有 R1**：没有它，GPIO 的 3.3 V 直接加在 BE 二极管上，电流只受 $R_{out}$（25 Ω）和 20 Ω 限制：$\\frac{3.3 - 0.65}{45 Ω}$ ≈ 60 mA，超过 40 mA 绝对最大值，引脚烧坏。

[[pd|基极下拉 100 kΩ]]：MCU 复位时引脚是高阻输入，基极悬空可能让三极管半开；下拉保证它截止。`,
          `Goal: a 3.3 V GPIO switching a 5 V [[buzzer|buzzer]], with the transistor **below** the load (low side) and E to ground.

**Step 1 · load current**: saturated, $V_{CE}$ ≈ 0.17 V, so the buzzer gets 4.67 − 0.17 = 4.49 V and $I_C = \\frac{4.49 - 1.0}{140}$ ≈ **24.9 mA**.
**Step 2 · base current needed**: to be sure [[q|Q1]] is hard saturated, design for a **forced β** = $\\frac{I_C}{I_B}$ ≈ 10:
$$I_B ≥ \\frac{I_C}{10} = 2.5 mA$$
Why not β = 150? The datasheet allows 35–300, and β changes with temperature and current; 10 leaves plenty of margin.
**Step 3 · base resistor**: across [[rb|R1]] is the GPIO's 3.3 V minus [[vbe|$V_BE$ ≈ 0.7 V]]:
$$R_1 ≤ \\frac{3.3 - 0.7}{2.5 mA} = 1.04 kΩ$$
**Step 4 · pick 1 kΩ** and check (simulated): [[ib|$I_B$ = 2.53 mA]], [[ic|$I_C$ = 24.9 mA]], [[vce|$V_CE$ = 0.17 V]], dissipation $P ≈ V_{CE}·I_C + V_{BE}·I_B$ ≈ 4.2 + 1.8 ≈ 6 mW. The GPIO supplies only 2.5 mA, far below 20 mA.

**Why R1 is a must**: without it the GPIO's 3.3 V sits straight across the BE diode, limited only by $R_{out}$ (25 Ω) and the 20 Ω: $\\frac{3.3 - 0.65}{45 Ω}$ ≈ 60 mA, above the 40 mA absolute maximum — the pin burns.

[[pd|A 100 kΩ base pull-down]]: while the MCU is in reset its pin is a high-impedance input; a floating base can half-open the transistor, the pull-down keeps it off.`,
        ),
        table: {
          head: ['$R_B$', '$I_B$', '$β·I_B$', tr('状态', 'Region'), '$I_C$', '$V_{CE}$', tr('蜂鸣器', 'Buzzer')],
          rows: [
            [tr('0 Ω（直连）', '0 Ω (none)'), '≈ 60 mA', '—', tr('引脚烧坏', 'pin burns'), '—', '—', '—'],
            ['1 kΩ', '2.53 mA', '380 mA', tr('饱和', 'saturation'), '24.9 mA', '0.17 V', tr('响', 'sounds')],
            ['10 kΩ', '0.26 mA', '39 mA', tr('刚好饱和（强制 β ≈ 96）', 'just saturated (forced β ≈ 96)'), '≈ 24.8 mA', '≈ 0.2 V', tr('响，但没余量', 'sounds, no margin')],
            ['100 kΩ', '26.5 µA', '4.0 mA', tr('放大', 'active'), '4.0 mA', '3.1 V', tr('不响', 'silent')],
          ],
          parts: [null, 'q-sat', null, 'q-act'],
        },
        formulas: [
          { tex: 'I_B ≥ \\frac{I_C}{β_{forced}},   β_{forced} ≈ 10', note: tr('保证深度饱和', 'guarantees hard saturation') },
          { tex: 'R_B ≤ \\frac{V_{GPIO} - V_{BE}}{I_B}', note: tr('基极电阻上限', 'the largest base resistor') },
        ],
        calcs: ['npn-base-resistor'],
      },
      {
        id: 'sides',
        short: tr('高边 / 低边', 'High / low side'),
        title: tr('⑧ 低边 vs 高边：为什么 3.3 V 引脚不能把 NPN 放在负载上面（实验 5-18）', '⑧ Low side vs high side: why a 3.3 V pin can’t put an NPN above the load (lab 5-18)'),
        body: tr(
          `实验 5-18 用两个 5 V 继电器（线圈 70 Ω，吸合需要 ≥ 53 mA），同样的 1 kΩ 基极电阻、同样的 2N2222：
- [[low|低边]]：线圈在上、E 接 GND。基极电流 $\\frac{3.23 - 0.70}{1 kΩ}$ ≈ 2.5 mA，$β·I_B$ ≈ 380 mA ≫ 线圈需要的 63 mA → 饱和，[[vce-lo|$V_CE$ = 0.21 V]]，线圈得到 4.44 V、63 mA，吸合。
- [[high|高边]]：C 接 5V、E 接线圈。现在发射极不在地上，它跟着基极走——这叫 **emitter follower（射极跟随器 / 共集电极）**：
$$V_E = V_B - V_{BE}$$
而基极最高只能到 GPIO 的电压：[[vb|$V_B$ = 3.29 − 0.23 mA × 1 kΩ ≈ 3.06 V]]，所以 [[ve|$V_E$ ≈ 2.41 V]]，线圈只有 $\\frac{2.41}{70}$ ≈ 34 mA < 53 mA，**不吸合**。剩下的 5 − 2.41 = 2.26 V 落在 C–E 上：[[vce-hi|放大区]]，白白发热 77 mW。

**加大电源或换 β = 1000 的管子都没用**：12 V 电源时发射极仍是 2.4 V；β = 1000 时 $V_E$ 也只升到 2.61 V。限制不是增益，而是“**发射极永远比基极低 0.65 V**”。

结论：MCU 直接驱动的开关默认用 **低边 N 型**（NPN 或逻辑电平 N-MOS），发射极 / 源极接地。真要高边（负载一端必须接地），用 P-MOSFET + 一个低边 NPN 做电平转换。继电器线圈都要并 [[low|续流二极管]]（见继电器拆解）。`,
          `Lab 5-18 uses two 5 V relays (70 Ω coils, pull-in ≥ 53 mA), the same 1 kΩ base resistors and the same 2N2222:
- [[low|low side]]: coil on top, E to GND. Base current $\\frac{3.23 - 0.70}{1 kΩ}$ ≈ 2.5 mA, $β·I_B$ ≈ 380 mA ≫ the 63 mA the coil needs → saturated, [[vce-lo|$V_CE$ = 0.21 V]]; the coil gets 4.44 V, 63 mA and pulls in.
- [[high|high side]]: C to 5V, E to the coil. Now the emitter is not on ground; it follows the base — an **emitter follower (common collector)**:
$$V_E = V_B - V_{BE}$$
and the base can get no higher than the GPIO: [[vb|$V_B$ = 3.29 − 0.23 mA × 1 kΩ ≈ 3.06 V]], so [[ve|$V_E$ ≈ 2.41 V]]; the coil carries only $\\frac{2.41}{70}$ ≈ 34 mA < 53 mA and **does not pull in**. The remaining 5 − 2.41 = 2.26 V sits across C–E: [[vce-hi|active region]], wasting 77 mW as heat.

**A bigger supply or a β = 1000 part doesn't help**: with 12 V the emitter is still at 2.4 V; with β = 1000, $V_E$ only rises to 2.61 V. The limit is not the gain but "**the emitter is always 0.65 V below the base**".

Conclusion: a switch driven straight from an MCU is a **low-side N-type** by default (NPN or logic-level N-MOS) with the emitter / source at ground. If you really need a high-side switch (the load must keep one end grounded), use a P-MOSFET driven through a low-side NPN level shifter. Every relay coil gets a [[low|flyback diode]] (see the relay teardown).`,
        ),
        table: {
          head: ['', tr('高边（K1）', 'high side (K1)'), tr('低边（K2）', 'low side (K2)')],
          rows: [
            [tr('三极管位置', 'transistor'), tr('负载上面，C 接 5V', 'above the load, C to 5V'), tr('负载下面，E 接 GND', 'below the load, E to GND')],
            [tr('电路名', 'circuit'), tr('射极跟随器', 'emitter follower'), tr('共发射极开关', 'common-emitter switch')],
            [tr('状态', 'region'), tr('放大', 'active'), tr('饱和', 'saturation')],
            ['$V_{CE}$', '2.26 V', '0.21 V'],
            [tr('线圈电压 / 电流', 'coil voltage / current'), '2.41 V / 34 mA', '4.44 V / 63 mA'],
            [tr('吸合？（≥ 53 mA）', 'pulls in? (≥ 53 mA)'), tr('否', 'no'), tr('是', 'yes')],
            [tr('管子功耗', 'transistor power'), '77 mW', '15 mW'],
          ],
          parts: [null, null, null, 'vce-hi', 've', 'high', null],
        },
        formulas: [{ tex: 'V_E = V_B - V_{BE} ≤ V_{GPIO} - 0.65 V', note: tr('高边 NPN 的发射极永远上不去', 'why a high-side NPN’s emitter can’t rise') }],
        calcs: ['npn-base-resistor'],
      },
      {
        id: 'limits',
        short: tr('极限', 'Limits'),
        title: tr('⑨ 局限：电流、功耗、电压、β 的分散', '⑨ Limits: current, power, voltage, and the spread of β'),
        body: tr(
          `2N2222 能工作的范围是 [[soa|安全工作区 SOA]]，三条边界：
- [[icmax|$I_C$ ≤ 600 mA]]；
- [[pmax|P = $V_CE$·$I_C$ ≤ 625 mW]]（TO-92 不加散热片）：一条双曲线，开关状态 $V_{CE}$ 很小，所以离它很远；停在放大区才会碰到；
- [[vceo|$V_CEO$ = 40 V]]：C–E 能承受的最大电压。继电器线圈断电时的反向尖峰能轻松超过它，所以要续流二极管。

[[pt-ok|继电器低边]] 在左下角，非常安全。而 [[pt-motor|0.62 A 的电机]] 已经超过 600 mA，而且按强制 β = 10 需要 62 mA 基极电流——GPIO 给不出来。这正是下一个拆解 **MOSFET** 要解决的：栅极不取直流电流。

**β 的分散**：同一型号的 β 可以从 35 到 300，温度每升高 1 °C 还会增加约 0.5 %。所以开关设计永远按强制 β ≈ 10 算，不要依赖手册的典型值；放大电路则要用负反馈（发射极电阻）让增益不依赖 β。

**模型没画的**：真实 $V_{BE}$ 随温度每 °C 降约 2 mV；开关有存储时间（饱和越深关断越慢，约几百 ns）。`,
          `The 2N2222 must stay in its [[soa|safe operating area (SOA)]], bounded by three limits:
- [[icmax|$I_C$ ≤ 600 mA]];
- [[pmax|P = $V_CE$·$I_C$ ≤ 625 mW]] (TO-92, no heatsink): a hyperbola. A switch has a tiny $V_{CE}$ and stays far from it; you only meet it when resting in the active region;
- [[vceo|$V_CEO$ = 40 V]]: the most C–E can stand. A relay coil's turn-off spike easily exceeds it — hence the flyback diode.

[[pt-ok|The relay low side]] sits in the bottom-left corner, very safe. But [[pt-motor|a 0.62 A motor]] is above 600 mA, and with forced β = 10 it would need 62 mA of base current — more than a GPIO can give. That is what the next teardown, the **MOSFET**, solves: its gate takes no DC current.

**The spread of β**: one part number can have β anywhere from 35 to 300, and it rises about 0.5 % per °C. So a switch is always designed for forced β ≈ 10, never for the typical value; an amplifier uses negative feedback (an emitter resistor) so its gain doesn't depend on β.

**What the model leaves out**: a real $V_{BE}$ drops about 2 mV per °C; switching has a storage time (the deeper the saturation, the slower the turn-off, a few hundred ns).`,
        ),
        table: {
          head: [tr('参数', 'Parameter'), tr('2N2222A（仿真）', '2N2222A (sim)'), tr('超过会怎样', 'Beyond it')],
          rows: [
            ['$I_{C,max}$', '600 mA', tr('过流损坏', 'over-current damage')],
            ['$P_{max}$', tr('625 mW（TO-92）', '625 mW (TO-92)'), tr('过热', 'overheats')],
            ['$V_{CEO}$', '40 V', tr('击穿', 'breakdown')],
            ['β', tr('150（手册 35–300）', '150 (datasheet 35–300)'), tr('按强制 β ≈ 10 设计', 'design for forced β ≈ 10')],
            ['$V_{CE(sat)}$', '0.15 V + 1 Ω·$I_C$', tr('电流大时压降也大', 'grows with current')],
          ],
          parts: ['icmax', 'pmax', 'vceo', null, null],
        },
        formulas: [{ tex: 'P = V_{CE}·I_C + V_{BE}·I_B', note: tr('三极管的功耗', 'transistor dissipation') }],
      },
    ],
    recap: tr(
      'NPN = n⁺–p–n 三层，基区很薄，所以 $I_C = β·I_B$。等效电路：B–E 是 0.65 V 二极管；C–E 截止时开路、放大时是 $β·I_B$ 电流源、饱和时是 0.15 V 的闭合开关。当开关用：放在负载下面（低边），按强制 β ≈ 10 算 $I_B$，$R_B = \\frac{3.3 - 0.7}{I_B}$。',
      'An NPN = n⁺–p–n with a thin base, so $I_C = β·I_B$. Model: B–E is a 0.65 V diode; C–E is open in cut-off, a $β·I_B$ current source in the active region, and a 0.15 V closed switch in saturation. As a switch: put it below the load (low side), design for forced β ≈ 10 and $R_B = \\frac{3.3 - 0.7}{I_B}$.',
    ),
  };
}
