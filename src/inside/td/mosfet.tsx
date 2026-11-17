// Teardown: the N-channel enhancement MOSFET (IRLZ44N / IRF540N, TO-220). Package G D S → X-ray
// (the die on the drain tab) → cross-section (n⁺ source / drain in a p body, the gate on a thin
// oxide) → the gate field forms the channel → equivalent circuits (cut-off / ohmic / saturation,
// gate = capacitor) → logic-level vs standard: R_DS(on) against V_GS → power P = I²·R_DS(on) →
// the gate as a capacitor (no DC current, RC charging) → flyback diode and PWM speed control.

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

function Diode({ x, y, part }: { x: number; y: number; part?: string }) {
  return (
    <g data-part={part}>
      <polygon points={`${x - 8},${y + 7} ${x + 8},${y + 7} ${x},${y - 7}`} className="mc-box" />
      <line x1={x - 8} y1={y - 7} x2={x + 8} y2={y - 7} className="mc-w" />
    </g>
  );
}

/** N-MOSFET symbol: gate lead from x − 40; drain lead ends at (x + 30, y − 40), source at (x + 30, y + 40) */
function Nmos({ x, y, part, diode = true }: { x: number; y: number; part?: string; diode?: boolean }) {
  return (
    <g data-part={part}>
      <path d={`M${x - 40} ${y + 12} H${x - 10} M${x - 10} ${y - 20} V${y + 20}`} className="mc-w" data-part="pin-g" />
      <path d={`M${x} ${y - 22} V${y - 8} M${x} ${y - 6} V${y + 6} M${x} ${y + 8} V${y + 22}`} className="mc-w bold" />
      <path d={`M${x} ${y - 14} H${x + 30} V${y - 40}`} className="mc-w" data-part="pin-d" />
      <path d={`M${x} ${y + 14} H${x + 30} V${y + 40} M${x + 30} ${y} V${y + 14}`} className="mc-w" data-part="pin-s" />
      <path d={`M${x + 30} ${y} H${x + 4}`} className="mc-w" />
      <polygon points={`${x + 2},${y} ${x + 12},${y - 5} ${x + 12},${y + 5}`} className="mc-solid" />
      {diode && (
        <g data-part="bodydiode">
          <path d={`M${x + 30} ${y - 30} H${x + 50} V${y - 7} M${x + 50} ${y + 7} V${y + 30} H${x + 30}`} className="mc-w thin" />
          <Diode x={x + 50} y={y} />
        </g>
      )}
    </g>
  );
}

function Motor({ x, y1, y2, part }: { x: number; y1: number; y2: number; part?: string }) {
  const cy = (y1 + y2) / 2;
  return (
    <g data-part={part}>
      <path d={`M${x} ${y1} V${cy - 20} M${x} ${cy + 20} V${y2}`} className="mc-w" />
      <circle cx={x} cy={cy} r={20} className="mc-box" />
      <text x={x} y={cy + 5} textAnchor="middle" className="mc-lbl">
        M
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ package (layers 0–1) */

const LEG = { g: 245, d: 280, s: 315 };

function Package({ layer }: { layer: number }) {
  const xray = layer >= 1;
  return (
    <g className={vis(layer, 0, 1)}>
      {(['g', 'd', 's'] as const).map((k) => (
        <g key={k} data-part={`pin-${k}`}>
          <rect x={LEG[k] - 4} y={xray ? 230 : 288} width={8} height={xray ? 172 : 114} className="mc-leg" />
          <text x={LEG[k]} y={426} textAnchor="middle" className="mc-big">
            {k.toUpperCase()}
          </text>
        </g>
      ))}
      <g data-part="tab pin-d">
        <path d="M200 66 H360 V160 H200 Z" className="mc-can" />
        <circle cx={280} cy={104} r={15} fill="#fffdf8" stroke="#7d8088" strokeWidth={1.5} />
      </g>
      <rect x={208} y={150} width={144} height={140} rx={4} className="mc-epoxy" data-part="body" style={{ opacity: xray ? 0.22 : 1, transition: 'opacity .45s' }} />
      <g className={vis(layer, 0, 0)}>
        <text x={280} y={210} textAnchor="middle" className="mc-silk">
          IRLZ44N
        </text>
        <text x={280} y={228} textAnchor="middle" className="mc-silk">
          {tr('印字面朝你', 'printed face')}
        </text>
      </g>
      <g className={vis(layer, 1, 1)}>
        <rect x={244} y={170} width={72} height={60} rx={3} className="mc-can" data-part="pin-d paddle" />
        <rect x={256} y={178} width={48} height={44} rx={2} className="mc-ic" data-part="die" />
        <path d="M262 186 C 250 196, 246 212, 245 232" className="mc-w thin" style={{ stroke: '#d9b44a' }} data-part="pin-g bond" />
        <path d="M290 200 C 304 206, 312 218, 314 232 M296 196 C 310 202, 318 214, 318 232" className="mc-w" style={{ stroke: '#d9b44a' }} data-part="pin-s bond" />
        <text x={364} y={204} className="mc-tiny" data-part="die">
          {tr('← 几千个单元并联', '← thousands of cells')}
        </text>
      </g>
      {/* symbol */}
      <g data-part="symbol">
        <text x={90} y={110} textAnchor="middle" className="td-small">
          {tr('电路符号', 'symbol')}
        </text>
        <Nmos x={80} y={190} />
        <text x={36} y={196} textAnchor="end" className="mc-lbl" data-part="pin-g">
          G
        </text>
        <text x={118} y={150} className="mc-lbl" data-part="pin-d">
          D
        </text>
        <text x={118} y={240} className="mc-lbl" data-part="pin-s">
          S
        </text>
        <text x={90} y={264} textAnchor="middle" className="mc-tiny" data-part="bodydiode">
          {tr('自带体二极管', 'built-in body diode')}
        </text>
      </g>
      <text x={470} y={110} className="mc-tiny" data-part="tab">
        {tr('金属片 = D', 'metal tab = D')}
      </text>
      <path d="M466 106 H362" className="mc-w thin" data-part="tab" />
    </g>
  );
}

/* ------------------------------------------------------------------ cross-section (2–3) */

function Section({ layer }: { layer: number }) {
  const on = layer === 3;
  const well = (x: number) => `M${x} 230 V256 Q${x} 274 ${x + 20} 274 H${x + 80} Q${x + 100} 274 ${x + 100} 256 V230 Z`;
  return (
    <g className={vis(layer, 2, 3)}>
      <rect x={60} y={230} width={440} height={160} className="mc-p" data-part="body-p" />
      <path d={well(96)} className="mc-nplus" data-part="src" />
      <path d={well(364)} className="mc-nplus" data-part="drn" />
      <rect x={186} y={216} width={188} height={14} className="mc-oxide" data-part="oxide" />
      <rect x={190} y={192} width={180} height={24} rx={2} className="mc-metal" data-part="gate" />
      <rect x={110} y={214} width={60} height={16} className="mc-metal" data-part="src" />
      <rect x={390} y={214} width={60} height={16} className="mc-metal" data-part="drn" />
      <rect x={68} y={218} width={24} height={12} className="mc-metal" data-part="body-p" />
      <path d="M140 214 V150 M280 192 V150 M420 214 V150 M80 218 V196 H140" className="mc-w" />
      <text x={140} y={142} textAnchor="middle" className="mc-big" data-part="src">
        S
      </text>
      <text x={280} y={142} textAnchor="middle" className="mc-big" data-part="gate">
        G
      </text>
      <text x={420} y={142} textAnchor="middle" className="mc-big" data-part="drn">
        D
      </text>
      <text x={146} y={258} textAnchor="middle" className="mc-lbl" data-part="src">
        n⁺
      </text>
      <text x={414} y={258} textAnchor="middle" className="mc-lbl" data-part="drn">
        n⁺
      </text>
      <text x={280} y={374} textAnchor="middle" className="mc-lbl" data-part="body-p">
        {tr('p 型衬底（body）', 'p-type body')}
      </text>
      <text x={72} y={190} className="mc-tiny" data-part="body-p">
        {tr('body 接 S', 'body to S')}
      </text>
      <g data-part="bodydiode">
        <Diode x={414} y={300} />
        <text x={430} y={304} className="mc-tiny">
          {tr('体二极管', 'body diode')}
        </text>
      </g>
      <g className={vis(layer, 2, 2)}>
        <path d="M374 223 L470 196" className="mc-w thin" data-part="oxide" />
        <text x={474} y={194} className="mc-tiny" data-part="oxide">
          {tr('SiO₂ 氧化层', 'SiO₂ oxide')}
        </text>
        <text x={474} y={208} className="mc-tiny" data-part="oxide">
          {tr('几十 nm，绝缘', 'tens of nm, insulator')}
        </text>
        <text x={280} y={300} textAnchor="middle" className="mc-tiny" data-part="body-p">
          {tr('S 和 D 之间：n–p–n，两个背靠背的 PN 结 → 断开', 'S to D: n–p–n, two back-to-back junctions → off')}
        </text>
      </g>
      {/* the channel */}
      <g className={on ? 'td-show' : 'td-hide'}>
        {Array.from({ length: 9 }, (_, i) => (
          <text key={i} x={200 + i * 20} y={210} className="mc-lbl plus">
            +
          </text>
        ))}
        <rect x={196} y={230} width={168} height={9} className="mc-chan" data-part="channel" />
        {Array.from({ length: 8 }, (_, i) => (
          <text key={i} x={206 + i * 20} y={250} className="mc-lbl minus" data-part="channel">
            −
          </text>
        ))}
        <path d="M200 290 H360" className="mc-w minus" markerEnd="url(#mo-ahb)" data-part="channel" />
        <text x={280} y={312} textAnchor="middle" className="mc-tiny" data-part="channel">
          {tr('电子 S → D（电流 D → S）', 'electrons S → D (current D → S)')}
        </text>
        <path d="M432 160 V200" className="mc-w cur" markerEnd="url(#mo-ahc)" data-part="id" />
        <text x={440} y={186} className="mc-lbl cur" data-part="id">
          {sub('I_D')}
        </text>
        <text x={280} y={92} textAnchor="middle" className="mc-big" data-part="vgs">
          {sub('V_GS = 3.3 V > V_th = 1.5 V')}
        </text>
        <text x={280} y={112} textAnchor="middle" className="td-small" data-part="vgs">
          {tr('栅极正电荷把电子吸到氧化层下面 → n 沟道', 'positive gate charge pulls electrons under the oxide → an n-channel')}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ models (layer 4) */

function Panel({ x, part, title, note, children }: { x: number; part: string; title: string; note: ReactNode; children: ReactNode }) {
  const y = 50;
  return (
    <g data-part={part}>
      <rect x={x} y={y} width={172} height={310} rx={10} className="mc-box soft" />
      <text x={x + 86} y={y + 22} textAnchor="middle" className="mc-lbl">
        {title}
      </text>
      <circle cx={x + 130} cy={y + 48} r={4} className="mc-box" />
      <circle cx={x + 130} cy={y + 270} r={4} className="mc-box" />
      <circle cx={x + 16} cy={y + 150} r={4} className="mc-box" />
      <text x={x + 140} y={y + 52} className="mc-lbl">
        D
      </text>
      <text x={x + 140} y={y + 274} className="mc-lbl">
        S
      </text>
      <text x={x + 12} y={y + 136} className="mc-lbl">
        G
      </text>
      {/* gate = capacitor to S */}
      <path d={`M${x + 20} ${y + 150} H${x + 26} M${x + 34} ${y + 150} H${x + 44} V${y + 240} H${x + 130} M${x + 130} ${y + 240} V${y + 266}`} className="mc-w" />
      <path d={`M${x + 26} ${y + 136} V${y + 164} M${x + 34} ${y + 136} V${y + 164}`} className="mc-w" />
      <text x={x + 30} y={y + 182} textAnchor="middle" className="mc-tiny">
        {sub('C_iss')}
      </text>
      <Dot x={x + 130} y={y + 240} />
      {children}
      <text x={x + 86} y={y + 298} textAnchor="middle" className="mc-tiny">
        {note}
      </text>
    </g>
  );
}

function Models({ layer }: { layer: number }) {
  const xs = [14, 194, 374];
  const y = 50;
  return (
    <g className={vis(layer, 4, 4)}>
      <Panel x={xs[0]} part="m-cut" title={tr('截止 cut-off', 'cut-off')} note={sub(tr('V_GS < V_th：没有沟道', 'V_GS < V_th: no channel'))}>
        <path d={`M${xs[0] + 130} ${y + 52} V${y + 110} M${xs[0] + 130} ${y + 190} V${y + 240}`} className="mc-w" />
        <text x={xs[0] + 130} y={y + 155} textAnchor="middle" className="mc-big">
          {tr('开路', 'open')}
        </text>
      </Panel>
      <Panel x={xs[1]} part="m-ohm" title={tr('欧姆区 ohmic', 'ohmic')} note={tr('开关闭合：一个小电阻', 'a closed switch: a small resistor')}>
        <path d={`M${xs[1] + 130} ${y + 52} V${y + 110} M${xs[1] + 130} ${y + 190} V${y + 240}`} className="mc-w" />
        <Res x1={xs[1] + 130} y1={y + 110} x2={xs[1] + 130} y2={y + 190} />
        <text x={xs[1] + 122} y={y + 140} textAnchor="end" className="mc-lbl acc">
          {sub('R_DS')}
        </text>
        <text x={xs[1] + 122} y={y + 156} textAnchor="end" className="mc-tiny">
          {sub('= 1/(K·V_ov)')}
        </text>
        <text x={xs[1] + 122} y={y + 172} textAnchor="end" className="mc-tiny">
          {tr('3.3 V 时 43 mΩ', '43 mΩ at 3.3 V')}
        </text>
      </Panel>
      <Panel x={xs[2]} part="m-sat" title={tr('饱和区 saturation', 'saturation')} note={tr('恒流：开关只开了一半，发热！', 'constant current: half on, hot!')}>
        <path d={`M${xs[2] + 130} ${y + 52} V${y + 136} M${xs[2] + 130} ${y + 164} V${y + 240}`} className="mc-w" />
        <circle cx={xs[2] + 130} cy={y + 150} r={14} className="mc-box" />
        <path d={`M${xs[2] + 130} ${y + 141} V${y + 159}`} className="mc-w" markerEnd="url(#mo-ah)" />
        <text x={xs[2] + 112} y={y + 112} textAnchor="end" className="mc-lbl acc">
          {sub('K·V_ov²/2')}
        </text>
      </Panel>
      <text x={280} y={392} textAnchor="middle" className="mc-big">
        {sub(tr('V_ov = V_GS − V_th（过驱动电压）；栅极只是一个电容', 'V_ov = V_GS − V_th (overdrive); the gate is just a capacitor'))}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ logic level (layer 5) */

function LogicLevel({ layer }: { layer: number }) {
  const x = (v: number) => 80 + (v / 10) * 420;
  const y = (r: number) => 370 - (Math.min(r, 0.42) / 0.4) * 280;
  const curve = (vth: number, K: number) => {
    const pts: string[] = [];
    for (let v = vth + 0.02; v <= 10.001; v += 0.05) {
      const r = 1 / (K * (v - vth));
      if (r > 0.42) continue;
      pts.push(`${x(v)},${y(r)}`);
    }
    return pts.join(' ');
  };
  const kL = 1 / (0.022 * 3.5);
  const kS = 1 / (0.044 * 7);
  return (
    <g className={vis(layer, 5, 5)}>
      <path d={`M${x(0)} ${y(0)} H${x(10) + 12} M${x(0)} ${y(0)} V${y(0.4) - 16}`} className="mc-axis" />
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <text key={v} x={x(v)} y={y(0) + 16} textAnchor="middle" className="mc-tiny">
          {v}
        </text>
      ))}
      {[0, 0.1, 0.2, 0.3, 0.4].map((r) => (
        <text key={r} x={x(0) - 8} y={y(r) + 4} textAnchor="end" className="mc-tiny">
          {r * 1000}
        </text>
      ))}
      <text x={x(10) + 12} y={y(0) + 32} textAnchor="end" className="td-small">
        {sub('V_GS (V) →')}
      </text>
      <text x={x(0) + 6} y={y(0.4) - 8} className="td-small">
        {sub('R_DS (mΩ)')}
      </text>
      <rect x={x(0)} y={y(0.4)} width={x(3.3) - x(0)} height={y(0) - y(0.4)} className="mc-zone-x" data-part="gpio" />
      <line x1={x(3.3)} y1={y(0)} x2={x(3.3)} y2={y(0.4)} className="mc-w acc" data-part="gpio" />
      <text x={x(3.3) - 6} y={y(0.4) + 14} textAnchor="end" className="mc-lbl acc" data-part="gpio">
        {tr('GPIO 3.3 V', 'GPIO 3.3 V')}
      </text>
      <polyline points={curve(1.5, kL)} className="mc-curve g" data-part="irlz" />
      <polyline points={curve(3.0, kS)} className="mc-curve r" data-part="irf" />
      <g data-part="irlz">
        <circle cx={x(3.3)} cy={y(1 / (kL * 1.8))} r={6} fill="#2a9d6f" />
        <text x={x(3.3) + 10} y={y(1 / (kL * 1.8)) - 8} className="mc-lbl" fill="#2a9d6f">
          {tr('IRLZ44N：43 mΩ ✓', 'IRLZ44N: 43 mΩ ✓')}
        </text>
        <circle cx={x(5)} cy={y(0.022)} r={4} fill="#2a9d6f" />
        <text x={x(5)} y={y(0.022) - 10} textAnchor="middle" className="mc-tiny">
          {tr('手册：22 mΩ @ 5 V', 'datasheet: 22 mΩ @ 5 V')}
        </text>
      </g>
      <g data-part="irf">
        <circle cx={x(10)} cy={y(0.044)} r={4} fill="#e63946" />
        <text x={x(10) - 4} y={y(0.1)} textAnchor="end" className="mc-tiny">
          {tr('手册：44 mΩ @ 10 V', 'datasheet: 44 mΩ @ 10 V')}
        </text>
        <text x={x(4.6)} y={y(0.33)} className="mc-lbl plus">
          {tr('IRF540N：3.3 V 时只“开了个缝”', 'IRF540N: barely open at 3.3 V')}
        </text>
        <text x={x(4.6)} y={y(0.33) + 16} className="mc-tiny">
          {sub(tr('V_th = 3.0 V，卡在饱和区 0.14 A', 'V_th = 3.0 V, stuck in saturation at 0.14 A'))}
        </text>
      </g>
      <line x1={x(1.5)} y1={y(0)} x2={x(1.5)} y2={y(0) - 8} className="mc-w g" />
      <text x={x(1.5)} y={y(0) - 12} textAnchor="middle" className="mc-tiny" data-part="irlz">
        {sub('V_th 1.5')}
      </text>
      <line x1={x(3)} y1={y(0)} x2={x(3)} y2={y(0) - 8} className="mc-w" />
    </g>
  );
}

/* ------------------------------------------------------------------ power (layer 6) */

function Power({ layer }: { layer: number }) {
  const bar = (yy: number, mw: number, col: string, label: string, part: string) => (
    <g data-part={part}>
      <rect x={350} y={yy} width={Math.max(3, (mw / 600) * 180)} height={22} fill={col} />
      <text x={350} y={yy - 6} className="mc-tiny">
        {label}
      </text>
    </g>
  );
  return (
    <g className={vis(layer, 6, 6)}>
      <path d="M60 70 H250" className="mc-w plus bold" />
      <text x={64} y={62} className="mc-lbl plus">
        {tr('+5 V（独立电源）', '+5 V (own supply)')}
      </text>
      <Motor x={190} y1={70} y2={170} part="motor" />
      <text x={216} y={124} className="mc-tiny" data-part="motor">
        8 Ω
      </text>
      <path d="M190 170 V190 M190 270 V330 M40 242 H54 M104 242 H120 M110 242 V266 M110 310 V320" className="mc-w" />
      <Nmos x={160} y={230} part="q" diode={false} />
      <circle cx={36} cy={242} r={4} className="mc-box" />
      <text x={36} y={230} textAnchor="middle" className="mc-tiny">
        GPIO
      </text>
      <Res x1={54} y1={242} x2={104} y2={242} part="rg" />
      <text x={70} y={264} textAnchor="middle" className="mc-tiny" data-part="rg">
        RG 100 Ω
      </text>
      <Res x1={110} y1={266} x2={110} y2={310} part="rpd" />
      <Dot x={110} y={242} />
      <Gnd x={110} y={320} />
      <Gnd x={190} y={330} />
      <text x={98} y={294} textAnchor="end" className="mc-tiny" data-part="rpd">
        RPD 100 kΩ
      </text>
      <path d="M206 176 V214" className="mc-w cur" markerEnd="url(#mo-ahc)" data-part="id" />
      <text x={212} y={200} className="mc-lbl cur" data-part="id">
        {sub('I_D = 620 mA')}
      </text>
      <text x={232} y={240} className="mc-lbl acc" data-part="vds">
        {sub('V_DS = 27 mV')}
      </text>
      <text x={124} y={226} textAnchor="end" className="mc-tiny" data-part="vgs">
        {sub('V_GS 3.29 V')}
      </text>
      {/* the comparison */}
      <text x={440} y={86} textAnchor="middle" className="mc-lbl">
        {tr('同一个电机，两个 MOSFET', 'same motor, two MOSFETs')}
      </text>
      {bar(122, 17, '#2a9d6f', tr('IRLZ44N：0.62² × 0.043 = 17 mW', 'IRLZ44N: 0.62² × 0.043 = 17 mW'), 'irlz')}
      {bar(178, 540, '#e63946', tr('IRF540N：3.9 V × 0.14 A = 0.54 W', 'IRF540N: 3.9 V × 0.14 A = 0.54 W'), 'irf')}
      <text x={350} y={232} className="mc-tiny" data-part="irlz">
        {tr('温升 ≈ 17 mW × 62 °C/W ≈ 1 °C', 'rise ≈ 17 mW × 62 °C/W ≈ 1 °C')}
      </text>
      <text x={350} y={250} className="mc-tiny" data-part="irf">
        {tr('温升 ≈ 0.54 W × 62 °C/W ≈ 33 °C', 'rise ≈ 0.54 W × 62 °C/W ≈ 33 °C')}
      </text>
      <text x={350} y={268} className="mc-tiny" data-part="irf">
        {tr('电机只拿到 23 % 的电流', 'the motor gets 23 % of its current')}
      </text>
      <text x={280} y={400} textAnchor="middle" className="mc-big">
        {sub('P = I_D²·R_DS(on)')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ gate capacitor (layer 7) */

function GateCap({ layer }: { layer: number }) {
  const tau = 0.2125; // µs
  const x = (t: number) => 90 + (t / 1.2) * 400;
  const yv = (v: number) => 400 - (v / 3.3) * 150;
  const yi = (ma: number) => 400 - (ma / 30) * 150;
  const vg: string[] = [];
  const ig: string[] = [];
  for (let t = 0; t <= 1.2001; t += 0.02) {
    vg.push(`${x(t)},${yv(3.3 * (1 - Math.exp(-t / tau)))}`);
    ig.push(`${x(t)},${yi(26.4 * Math.exp(-t / tau))}`);
  }
  return (
    <g className={vis(layer, 7, 7)}>
      <circle cx={40} cy={110} r={4} className="mc-box" />
      <text x={40} y={96} textAnchor="middle" className="mc-tiny">
        GPIO
      </text>
      <path d="M44 110 H60 M110 110 H130 M180 110 H340 V128 M220 110 V128 M220 136 V170 H340 M340 168 V170" className="mc-w" />
      <Res x1={60} y1={110} x2={110} y2={110} />
      <text x={85} y={94} textAnchor="middle" className="mc-tiny">
        {sub('R_out 25 Ω')}
      </text>
      <Res x1={130} y1={110} x2={180} y2={110} part="rg" />
      <text x={155} y={94} textAnchor="middle" className="mc-tiny" data-part="rg">
        RG 100 Ω
      </text>
      <path d="M206 128 H234 M206 136 H234" className="mc-w" data-part="ciss" />
      <text x={240} y={136} className="mc-lbl" data-part="ciss">
        {sub('C_iss 1.7 nF')}
      </text>
      <Res x1={340} y1={128} x2={340} y2={168} part="rpd" />
      <text x={350} y={152} className="mc-tiny" data-part="rpd">
        RPD 100 kΩ
      </text>
      <Dot x={220} y={110} />
      <Gnd x={280} y={170} />
      <text x={220} y={90} textAnchor="middle" className="mc-lbl acc" data-part="gate">
        G
      </text>
      <text x={480} y={92} textAnchor="middle" className="mc-lbl">
        τ = 125 Ω × 1.7 nF
      </text>
      <text x={480} y={110} textAnchor="middle" className="mc-lbl">
        = 0.21 µs
      </text>
      {/* waveforms */}
      <path d={`M${x(0)} 400 H${x(1.2) + 12} M${x(0)} 400 V230`} className="mc-axis" />
      <polyline points={vg.join(' ')} className="mc-curve" data-part="vg" />
      <polyline points={ig.join(' ')} className="mc-curve o" data-part="ig" />
      <line x1={x(0)} y1={yv(1.5)} x2={x(1.2)} y2={yv(1.5)} className="mc-dash" data-part="vth" />
      <text x={x(1.2)} y={yv(1.5) - 6} textAnchor="end" className="mc-tiny" data-part="vth">
        {sub('V_th = 1.5 V')}
      </text>
      <line x1={x(0.128)} y1={yv(1.5)} x2={x(0.128)} y2={400} className="mc-dash" data-part="vth" />
      <text x={x(0.128) + 4} y={416} className="mc-tiny" data-part="vth">
        0.13 µs
      </text>
      <text x={x(0.75)} y={yv(3.3) - 8} className="mc-lbl acc" data-part="vg">
        {sub('v_G → 3.3 V')}
      </text>
      <text x={x(0.2)} y={yi(18)} className="mc-lbl cur" data-part="ig">
        {sub('i_G: 26 mA → 0')}
      </text>
      <text x={x(1.2) + 12} y={416} textAnchor="end" className="td-small">
        t (µs) →
      </text>
      <text x={x(1.2)} y={yv(0.4)} textAnchor="end" className="mc-tiny" data-part="ig">
        {tr('之后：直流电流 = 0', 'after that: DC current = 0')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ flyback + PWM (layer 8) */

function Flyback({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 8, 8)}>
      <path d="M60 60 H300" className="mc-w plus bold" />
      <text x={64} y={52} className="mc-lbl plus">
        +5 V
      </text>
      <Motor x={180} y1={60} y2={180} part="motor" />
      <path d="M180 76 H240 V112 M240 128 V164 H180" className="mc-w" data-part="d1" />
      <Diode x={240} y={120} part="d1" />
      <text x={252} y={124} className="mc-lbl" data-part="d1">
        D1
      </text>
      <Dot x={180} y={76} />
      <Dot x={180} y={164} />
      <path d="M180 180 V200 M180 280 V320 M40 252 H62" className="mc-w" />
      <circle cx={36} cy={252} r={4} className="mc-box" />
      <text x={36} y={240} textAnchor="middle" className="mc-tiny">
        PWM
      </text>
      <Res x1={62} y1={252} x2={110} y2={252} />
      <Nmos x={150} y={240} part="q" diode={false} />
      <Gnd x={180} y={320} />
      <text x={174} y={196} textAnchor="end" className="mc-tiny" data-part="drain">
        {tr('漏极 D', 'drain D')}
      </text>
      {/* the two current loops */}
      <path d="M204 184 V296" className="mc-dash cur" markerEnd="url(#mo-ahc)" data-part="loop-on" />
      <text x={210} y={316} className="mc-tiny" data-part="loop-on">
        {tr('导通：经 MOSFET', 'on: through the MOSFET')}
      </text>
      <path d="M208 150 V90 H228 V150 H212" className="mc-dash" style={{ stroke: '#2a9d6f', strokeWidth: 2.2 }} markerEnd="url(#mo-ah)" data-part="loop-off" />
      <text x={248} y={200} className="mc-tiny" data-part="loop-off">
        {tr('关断：经 D1 续流', 'off: freewheels via D1')}
      </text>
      {/* drain waveform */}
      <g data-part="vd">
        <text x={448} y={72} textAnchor="middle" className="mc-lbl">
          {tr('漏极电压（50 %，20 kHz）', 'drain voltage (50 %, 20 kHz)')}
        </text>
        <path d="M370 220 H540 M370 220 V90" className="mc-axis" />
        <path d="M370 218 H395 V140 H420 V218 H445 V140 H470 V218 H495 V140 H520 V218 H535" className="mc-curve" />
        <line x1={370} y1={140} x2={540} y2={140} className="mc-dash" />
        <text x={366} y={144} textAnchor="end" className="mc-tiny">
          5.7 V
        </text>
        <text x={366} y={222} textAnchor="end" className="mc-tiny">
          0
        </text>
        <text x={455} y={240} textAnchor="middle" className="mc-tiny">
          {tr('5 V + 二极管 0.7 V = 5.7 V（被钳住）', '5 V + 0.7 V diode = 5.7 V (clamped)')}
        </text>
      </g>
      <g data-part="nodiode">
        <path d="M370 380 H540 M370 380 V270" className="mc-axis" />
        <path d="M370 378 H412 V282 L418 340 L424 360 L432 376 H460 V378 H510" className="mc-curve r" />
        <text x={420} y={276} className="mc-tiny">
          {tr('55 V 雪崩击穿', '55 V avalanche')}
        </text>
        <text x={455} y={400} textAnchor="middle" className="mc-tiny">
          {tr('没有 D1：u = L·di/dt 的尖峰', 'without D1: the u = L·di/dt spike')}
        </text>
      </g>
      <text x={150} y={400} textAnchor="middle" className="mc-lbl">
        {sub('τ = L/R = 2 mH / 8 Ω = 0.25 ms')}
      </text>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="mo-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="mc-ah" />
        </marker>
        <marker id="mo-ahc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="mc-ah cur" />
        </marker>
        <marker id="mo-ahb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#2b59c3" />
        </marker>
      </defs>
      <Package layer={layer} />
      <Section layer={layer} />
      <Models layer={layer} />
      <LogicLevel layer={layer} />
      <Power layer={layer} />
      <GateCap layer={layer} />
      <Flyback layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'mosfet',
    title: tr('N-MOSFET：用电压（电场）开关大电流', 'The N-MOSFET: switching big currents with a voltage (a field)'),
    subtitle: tr(
      'MOSFET = Metal-Oxide-Semiconductor Field-Effect Transistor（金属-氧化物-半导体场效应晶体管）。三极管用电流控制，MOSFET 用栅极电压在硅里“画”出一条导电沟道。我们从 TO-220 封装拆到截面，看沟道怎么形成，再推出导通电阻、功耗、栅极电容和续流二极管。',
      'MOSFET = Metal-Oxide-Semiconductor Field-Effect Transistor. A BJT is controlled by a current; a MOSFET uses the gate voltage to "draw" a conducting channel in the silicon. We go from the TO-220 package to the cross-section, watch the channel form, and derive the on-resistance, the power, the gate capacitance and the flyback diode.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'package',
        short: tr('外形', 'Package'),
        title: tr('① 外形：TO-220，三只脚 G D S，金属片是 D', '① Package: TO-220, three legs G D S, the tab is D'),
        body: tr(
          `实验 5-8 和 5-15 用的 IRLZ44N 装在 **TO-220** 封装里：黑色塑料体 + 一块带螺丝孔的 [[tab|金属片]]（用来拧到散热片上）+ 三只脚。

印字面朝自己、脚朝下，从左到右是 [[pin-g|G]]、[[pin-d|D]]、[[pin-s|S]]。**金属片和中间的 D 脚是连通的**——拧到散热片上时散热片也带着漏极电压，多个 MOSFET 共用散热片要加绝缘垫。

[[symbol|电路符号]]：
- 栅极 G 是一根和沟道 **隔开** 的竖线——表示栅极和沟道之间有绝缘层，不导电；
- 沟道画成三段虚线：增强型（enhancement），平时是断开的，要加栅极电压才“连起来”；
- 箭头指向沟道 = N 沟道；
- 旁边的 [[bodydiode|体二极管 body diode]] 不是额外加的，是结构里天生就有的（下一层能看到）。`,
          `The IRLZ44N of labs 5-8 and 5-15 comes in a **TO-220** package: a black plastic body, a [[tab|metal tab]] with a screw hole (for a heatsink) and three legs.

Printed face toward you, legs down, left to right: [[pin-g|G]], [[pin-d|D]], [[pin-s|S]]. **The tab is connected to the middle leg, D** — bolted to a heatsink, the heatsink sits at the drain voltage; MOSFETs sharing a heatsink need insulating pads.

The [[symbol|circuit symbol]]:
- the gate G is a line **separated** from the channel — there is an insulator between them, no conduction;
- the channel is drawn as three dashes: enhancement mode, normally off, "joined up" only by a gate voltage;
- the arrow points into the channel = N-channel;
- the [[bodydiode|body diode]] beside it is not an extra part; the structure has it built in (next layers).`,
        ),
        table: {
          head: [tr('脚', 'Pin'), tr('名字', 'Name'), tr('作用', 'Role'), tr('低边开关里接', 'In a low-side switch')],
          rows: [
            [
              'G',
              tr('栅极 gate', 'gate'),
              tr('控制端：电压控制，几乎不取电流', 'the control: voltage-driven, takes almost no current'),
              tr('经 RG 接 GPIO，RPD 下拉到 GND', 'GPIO via RG, RPD to GND'),
            ],
            ['D', tr('漏极 drain（= 金属片）', 'drain (= the tab)'), tr('大电流从这里流进', 'the big current enters here'), tr('负载的下端', 'the bottom of the load')],
            ['S', tr('源极 source', 'source'), tr('电子的来源，电流从这里流出', 'source of electrons; current leaves here'), 'GND'],
          ],
          parts: ['pin-g', 'pin-d', 'pin-s'],
        },
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：硅片焊在漏极金属片上', '② X-ray: the die is soldered to the drain tab'),
        body: tr(
          `透视：[[die|硅片]] 背面就是漏极，直接焊在 [[paddle|金属片]] 上——热量从这里走，所以 TO-220 能散几瓦。正面两块金属：细的 [[pin-g|金线连 G]]，粗的（或好几根）[[pin-s|连 S]]，因为几十安的电流都从 S 出来。

功率 MOSFET 的硅片上其实是 **几千到几百万个小 MOSFET 单元并联**，每个单元的沟道电阻并联起来，才有 22 mΩ 这么小的导通电阻。但每个单元的原理和下一层画的教科书截面一模一样。`,
          `X-ray: the back of the [[die|die]] is the drain, soldered straight onto the [[paddle|metal tab]] — that is where the heat goes, so a TO-220 can shed a few watts. On top are two metal areas: a thin [[pin-g|bond wire to G]] and a thick one (or several) [[pin-s|to S]], because tens of amps leave through S.

A power MOSFET die is really **thousands to millions of small MOSFET cells in parallel**; their channel resistances in parallel give an on-resistance as low as 22 mΩ. Each cell works exactly like the textbook cross-section in the next layer.`,
        ),
      },
      {
        id: 'structure',
        short: tr('截面', 'Cross-section'),
        title: tr('③ 截面：p 型衬底里两个 n⁺ 区，上面一层氧化物和栅极', '③ Cross-section: two n⁺ wells in a p body, oxide and gate on top'),
        body: tr(
          `把一个单元切开：
- [[body-p|p 型衬底 body]]：大部分是 p 型硅，空穴多、自由电子少；
- [[src|源极 S]] 和 [[drn|漏极 D]]：两个浓掺杂的 n⁺ 区；
- [[oxide|氧化层 SiO₂]]：只有几十 nm 厚的绝缘玻璃；
- [[gate|栅极 G]]：氧化层上面的导体（多晶硅）。

**没加栅压时**：从 S 走到 D 要经过 n⁺ → p → n⁺，就是两个 **背靠背的 PN 结**，不管 D–S 加哪个方向，总有一个结反偏——断开。

**体二极管**：衬底在内部接到 S 上（为了让衬底电位固定），于是 p 衬底和 n⁺ 漏极之间形成一个从 S 指向 D 的 [[bodydiode|二极管]]。D 比 S 低时它就导通，所以 MOSFET **只能单向阻断**。

**栅极和下面的硅之间是绝缘的**：G、氧化层、硅构成一个 **平行板电容**。这就是“栅极不取直流电流”的原因。`,
          `Cut one cell open:
- [[body-p|the p-type body]]: mostly p-type silicon, many holes, few free electrons;
- [[src|source S]] and [[drn|drain D]]: two heavily doped n⁺ wells;
- [[oxide|the SiO₂ oxide]]: an insulating glass only tens of nm thick;
- [[gate|the gate G]]: a conductor (polysilicon) on top of the oxide.

**No gate voltage**: from S to D you pass n⁺ → p → n⁺ — two **back-to-back PN junctions**. Whichever way you apply D–S, one is reverse-biased: off.

**The body diode**: inside, the body is tied to S (to fix its potential), so the p body and the n⁺ drain form a [[bodydiode|diode]] pointing from S to D. When D goes below S it conducts — a MOSFET **blocks in one direction only**.

**The gate is insulated from the silicon below**: G, oxide and silicon form a **parallel-plate capacitor**. That is why the gate takes no DC current.`,
        ),
        table: {
          head: [tr('层', 'Layer'), tr('材料', 'Material'), tr('作用', 'Role')],
          rows: [
            [tr('栅极 G', 'gate G'), tr('多晶硅 / 金属', 'polysilicon / metal'), tr('电容的上极板', 'top plate of a capacitor')],
            [tr('氧化层', 'oxide'), tr('SiO₂，几十 nm', 'SiO₂, tens of nm'), tr('绝缘介质；太高的 V_GS 会击穿它（±16–20 V）', 'dielectric; too much V_GS punctures it (±16–20 V)')],
            [tr('源 / 漏', 'source / drain'), 'n⁺', tr('电子的入口和出口', 'where electrons enter and leave')],
            [
              tr('衬底 body', 'body'),
              tr('p 型，接 S', 'p-type, tied to S'),
              tr('沟道在它的表面形成；和 D 构成体二极管', 'the channel forms at its surface; forms the body diode with D'),
            ],
          ],
          parts: ['gate', 'oxide', 'src', 'body-p'],
        },
      },
      {
        id: 'channel',
        short: tr('沟道', 'Channel'),
        title: tr('④ 栅极电场“画”出一条沟道：阈值电压', '④ The gate field draws a channel: the threshold voltage'),
        body: tr(
          `给栅极加正电压（相对 S）：
1. 栅极这块“极板”带上 [[vgs|正电荷]]；
2. 电场穿过氧化层，把 p 衬底表面的空穴推开，再把少量自由电子吸到氧化层正下方；
3. 电压够大时，表面的电子多到让这一薄层 **反型**（inversion）成 n 型——一条连接 S 和 D 的 [[channel|n 沟道]] 就出现了，电流 [[id|$I_D$]] 可以从 D 流到 S。

刚好出现沟道的栅压叫 **阈值电压** $V_{GS(th)}$（手册里定义为 $I_D$ = 250 µA 时的 $V_{GS}$——只是“刚开始导通”）。超过阈值的部分叫 **过驱动电压**：
$$V_{ov} = V_{GS} - V_{th}$$
过驱动越大，沟道里电子越多，沟道越“宽”，电阻越小。IRLZ44N 的 $V_{th}$ = 1.5 V，GPIO 给 3.3 V，$V_{ov}$ = 1.8 V。

和三极管对比：三极管要 **持续的基极电流** 才能导通；MOSFET 只要把栅极这个电容 **充上电**，之后不再需要电流。`,
          `Apply a positive voltage to the gate (relative to S):
1. the gate "plate" takes a [[vgs|positive charge]];
2. the field passes through the oxide, pushes the holes at the surface of the p body away, and pulls the few free electrons up under the oxide;
3. with enough voltage, the electrons at the surface outnumber the holes and that thin layer **inverts** to n-type — an [[channel|n-channel]] joining S and D appears, and a current [[id|$I_D$]] can flow from D to S.

The gate voltage at which the channel just appears is the **threshold voltage** $V_{GS(th)}$ (datasheets define it as the $V_{GS}$ giving $I_D$ = 250 µA — "just starting to conduct"). What is above the threshold is the **overdrive**:
$$V_{ov} = V_{GS} - V_{th}$$
More overdrive, more electrons, a "wider" channel, lower resistance. The IRLZ44N has $V_{th}$ = 1.5 V; a GPIO gives 3.3 V, so $V_{ov}$ = 1.8 V.

Compared with a BJT: a BJT needs a **continuous base current** to stay on; a MOSFET only needs its gate capacitor **charged**, and then no more current.`,
        ),
        formulas: [{ tex: 'V_{ov} = V_{GS} - V_{th} = 3.3 - 1.5 = 1.8 V', note: tr('IRLZ44N 由 GPIO 驱动', 'IRLZ44N driven by a GPIO') }],
      },
      {
        id: 'model',
        short: tr('等效电路', 'Models'),
        title: tr('⑤ 等效电路：截止、欧姆区、饱和区', '⑤ Equivalent circuits: cut-off, ohmic, saturation'),
        body: tr(
          `仿真器用的是电路课里的 **平方律模型**（square-law model）。K 是由器件决定的常数（单位 A/V²）：
$$I_D = min(K·V_{ov}·V_{DS},  \\frac{K·V_{ov}^{2}}{2})$$
- [[m-cut|截止]]：$V_{GS}$ < $V_{th}$，没有沟道，D–S 开路（只剩体二极管）；
- [[m-ohm|欧姆区 ohmic]]：$V_{DS}$ 小（< $\\frac{V_{ov}}{2}$），沟道像一个电阻，$I_D$ 和 $V_{DS}$ 成正比：
$$R_{DS} = \\frac{V_{DS}}{I_D} = \\frac{1}{K·V_{ov}}$$
**开关就要工作在这里**；
- [[m-sat|饱和区 saturation]]：$V_{DS}$ 大，沟道在漏极一端被“夹断”，电流不再随 $V_{DS}$ 增加，变成恒流 $\\frac{K V_{ov}^{2}}{2}$——开关只开了一半，$V_{DS}$ 很大，发热。

⚠ **名字陷阱**：MOSFET 的“饱和区”是 **恒流区**，对应三极管的“放大区”；MOSFET 当开关要在 **欧姆区**，而三极管当开关要在“饱和区”。名字相同，意思相反。

K 从手册算：IRLZ44N 在 $V_{GS}$ = 5 V 时 $R_{DS(on)}$ = 22 mΩ，
$$K = \\frac{1}{R_{DS(on)}·(V_{GS} - V_{th})} = \\frac{1}{0.022 × 3.5} = 13 A/V^{2}$$
GPIO 的 3.3 V 下：$R_{DS} = \\frac{1}{13 × 1.8}$ ≈ **43 mΩ**。

栅极在三种状态里都只是一个电容 $C_{iss}$（约 1.7 nF），没有直流通路。`,
          `The simulator uses the **square-law model** of a circuits course, with a device constant K (in A/V²):
$$I_D = min(K·V_{ov}·V_{DS},  \\frac{K·V_{ov}^{2}}{2})$$
- [[m-cut|cut-off]]: $V_{GS}$ < $V_{th}$, no channel, D–S open (only the body diode);
- [[m-ohm|ohmic]]: small $V_{DS}$ (< $\\frac{V_{ov}}{2}$), the channel acts as a resistor and $I_D$ is proportional to $V_{DS}$:
$$R_{DS} = \\frac{V_{DS}}{I_D} = \\frac{1}{K·V_{ov}}$$
**a switch must work here**;
- [[m-sat|saturation]]: large $V_{DS}$, the channel is "pinched off" at the drain end and the current stops growing with $V_{DS}$: a constant $\\frac{K V_{ov}^{2}}{2}$ — the switch is only half on, with a large $V_{DS}$, and heats up.

⚠ **The naming trap**: a MOSFET's "saturation" is its **constant-current** region, the counterpart of a BJT's *active* region. A MOSFET switch works in the **ohmic** region, a BJT switch in "saturation". Same word, opposite meaning.

K from the datasheet: the IRLZ44N has $R_{DS(on)}$ = 22 mΩ at $V_{GS}$ = 5 V, so
$$K = \\frac{1}{R_{DS(on)}·(V_{GS} - V_{th})} = \\frac{1}{0.022 × 3.5} = 13 A/V^{2}$$
At the GPIO's 3.3 V: $R_{DS} = \\frac{1}{13 × 1.8}$ ≈ **43 mΩ**.

In every region the gate is only a capacitor $C_{iss}$ (about 1.7 nF), with no DC path.`,
        ),
        table: {
          head: [tr('区', 'Region'), tr('条件', 'Condition'), tr('D–S 等效', 'D–S model'), tr('对应三极管的', 'BJT counterpart')],
          rows: [
            [tr('截止', 'cut-off'), '$V_{GS}$ < $V_{th}$', tr('开路', 'open'), tr('截止', 'cut-off')],
            [tr('欧姆区', 'ohmic'), '$V_{DS}$ < $\\frac{V_{ov}}{2}$', '$R_{DS} = \\frac{1}{K V_{ov}}$', tr('饱和（开关闭合）', 'saturation (switch on)')],
            [tr('饱和区', 'saturation'), '$V_{DS}$ > $\\frac{V_{ov}}{2}$', '$I_D = \\frac{K V_{ov}^{2}}{2}$', tr('放大区（恒流）', 'active (constant current)')],
          ],
          parts: ['m-cut', 'm-ohm', 'm-sat'],
        },
      },
      {
        id: 'logic',
        short: tr('逻辑电平', 'Logic level'),
        title: tr('⑥ 逻辑电平 vs 标准：3.3 V 栅压够不够', '⑥ Logic level vs standard: is 3.3 V of gate drive enough?'),
        body: tr(
          `把 $R_{DS} = \\frac{1}{K(V_{GS} - V_{th})}$ 对 $V_{GS}$ 画出来，两个型号差别一目了然：
- [[irlz|IRLZ44N（逻辑电平 logic-level）]]：$V_{th}$ = 1.5 V，手册在 $V_{GS}$ = 5 V（甚至 4.5 V）给出 $R_{DS(on)}$。在 [[gpio|GPIO 的 3.3 V]] 处已经降到 43 mΩ，完全导通；
- [[irf|IRF540N（标准电平）]]：$V_{th}$ = 3.0 V，手册的 44 mΩ 是在 $V_{GS}$ = **10 V** 量的。3.3 V 时 $V_{ov}$ 只有 0.3 V：

实验 5-8 换成 IRF540N：电机想要 0.62 A，但饱和区最多 $\\frac{K V_{ov}^{2}}{2} = \\frac{3.25 × 0.3^{2}}{2}$ ≈ 0.14 A。它卡在恒流区，$V_{DS}$ = 3.9 V，电机只拿到 23 % 的电流，几乎不转，MOSFET 却在发热。

**手册陷阱**：IRF540N 的 $V_{th}$ 写着 “2–4 V”，看起来 3.3 V 够——但 $V_{th}$ 只是 250 µA 的“刚开始导通”。选型要看 **$R_{DS(on)}$ 是在哪个 $V_{GS}$ 下给的**：3.3 V 的 MCU 要选在 2.5 V 或 4.5 V 下给出 $R_{DS(on)}$ 的型号（IRLZ44N、IRLB8721、AO3400、Si2302）。`,
          `Plot $R_{DS} = \\frac{1}{K(V_{GS} - V_{th})}$ against $V_{GS}$ and the two parts separate at a glance:
- [[irlz|IRLZ44N (logic level)]]: $V_{th}$ = 1.5 V, datasheet $R_{DS(on)}$ given at $V_{GS}$ = 5 V (even 4.5 V). At [[gpio|the GPIO's 3.3 V]] it is already down to 43 mΩ — fully on;
- [[irf|IRF540N (standard level)]]: $V_{th}$ = 3.0 V, and its 44 mΩ is measured at $V_{GS}$ = **10 V**. At 3.3 V the overdrive is only 0.3 V.

Lab 5-8 with an IRF540N: the motor wants 0.62 A but saturation allows at most $\\frac{K V_{ov}^{2}}{2} = \\frac{3.25 × 0.3^{2}}{2}$ ≈ 0.14 A. It is stuck in the constant-current region with $V_{DS}$ = 3.9 V; the motor gets 23 % of its current and barely turns, while the MOSFET heats up.

**The datasheet trap**: the IRF540N lists $V_{th}$ as "2–4 V", so 3.3 V looks enough — but $V_{th}$ is only the 250 µA "just starting" point. Choose by **the $V_{GS}$ at which $R_{DS(on)}$ is specified**: for a 3.3 V MCU, a part rated at 2.5 V or 4.5 V (IRLZ44N, IRLB8721, AO3400, Si2302).`,
        ),
        table: {
          head: ['', 'IRLZ44N', 'IRF540N'],
          rows: [
            [tr('类型', 'type'), tr('逻辑电平', 'logic level'), tr('标准电平', 'standard')],
            ['$V_{th}$', '1.5 V', '3.0 V'],
            [tr('手册 $R_{DS(on)}$', 'datasheet $R_{DS(on)}$'), '22 mΩ @ 5 V', '44 mΩ @ 10 V'],
            ['K', '13 A/V²', '3.25 A/V²'],
            [tr('3.3 V 栅压时', 'at 3.3 V gate drive'), tr('欧姆区，43 mΩ', 'ohmic, 43 mΩ'), tr('饱和区，0.14 A', 'saturation, 0.14 A')],
            [tr('电机电流 / $V_{DS}$', 'motor current / $V_{DS}$'), '620 mA / 27 mV', '140 mA / 3.9 V'],
            [tr('耐压 / 雪崩', 'rating / avalanche'), '55 V', '100 V'],
          ],
          parts: [null, null, null, null, 'gpio', null, null],
        },
        formulas: [
          { tex: 'K = \\frac{1}{R_{DS(on)}·(V_{GS,spec} - V_{th})}', note: tr('从手册的一组数算 K', 'K from one datasheet point') },
          { tex: 'R_{DS}(V_{GS}) = \\frac{1}{K(V_{GS} - V_{th})}', note: tr('欧姆区的导通电阻', 'on-resistance in the ohmic region') },
        ],
        calcs: ['mosfet-power'],
      },
      {
        id: 'power',
        short: tr('功耗', 'Power'),
        title: tr('⑦ 功耗：P = I²·R，为什么 MOSFET 几乎不发热', '⑦ Power: P = I²·R, why a MOSFET barely warms up'),
        body: tr(
          `实验 5-8：+5 V → [[motor|电机（8 Ω）]] → D，S 接地，GPIO 经 [[rg|RG 100 Ω]] 接 G，[[rpd|RPD 100 kΩ]] 下拉。输出 HIGH 时：
1. [[vgs|$V_GS$ = 3.29 V]] → 欧姆区，$R_{DS}$ ≈ 43 mΩ；
2. 回路电流 $I_D = \\frac{5 V}{8 Ω + 0.043 Ω}$ ≈ [[id|620 mA]]；
3. $V_{DS} = I_D·R_{DS}$ = 0.62 × 0.043 ≈ [[vds|27 mV]]——“$V_{DS}$ < 50 mV 证明完全导通”；
4. 功耗：
$$P = I_D^{2}·R_{DS(on)} = 0.62^{2} × 0.043 ≈ 17 mW$$
TO-220 不加散热片的热阻 $R_{θJA}$ ≈ 62 °C/W，温升 $ΔT = P·R_{θJA}$ ≈ 1 °C。

同样的电路换 [[irf|IRF540N]]：$P = V_{DS}·I_D$ = 3.9 V × 0.14 A ≈ 0.54 W，温升约 33 °C——**功耗增加 30 倍，电机反而停了**。

**为什么不用三极管**：2N2222 驱动 0.62 A 要按强制 β = 10 给 62 mA 基极电流，GPIO 给不出；而且 $V_{CE(sat)}$ ≈ 0.15 + 0.62 ≈ 0.77 V，功耗 0.48 W。MOSFET 的栅极 **不取直流电流**，导通电阻只有几十 mΩ。`,
          `Lab 5-8: +5 V → [[motor|motor (8 Ω)]] → D, S to ground, the GPIO through [[rg|RG 100 Ω]] to G, [[rpd|RPD 100 kΩ]] pull-down. With the output HIGH:
1. [[vgs|$V_GS$ = 3.29 V]] → ohmic, $R_{DS}$ ≈ 43 mΩ;
2. loop current $I_D = \\frac{5 V}{8 Ω + 0.043 Ω}$ ≈ [[id|620 mA]];
3. $V_{DS} = I_D·R_{DS}$ = 0.62 × 0.043 ≈ [[vds|27 mV]] — "$V_{DS}$ < 50 mV proves it is fully on";
4. power:
$$P = I_D^{2}·R_{DS(on)} = 0.62^{2} × 0.043 ≈ 17 mW$$
A TO-220 without a heatsink has $R_{θJA}$ ≈ 62 °C/W, so the rise is $ΔT = P·R_{θJA}$ ≈ 1 °C.

The same circuit with an [[irf|IRF540N]]: $P = V_{DS}·I_D$ = 3.9 V × 0.14 A ≈ 0.54 W, a rise of about 33 °C — **30 times the heat, and the motor stops**.

**Why not a BJT**: a 2N2222 switching 0.62 A needs 62 mA of base current at forced β = 10 — more than a GPIO can give — and $V_{CE(sat)}$ ≈ 0.15 + 0.62 ≈ 0.77 V means 0.48 W. A MOSFET gate takes **no DC current** and the on-resistance is tens of mΩ.`,
        ),
        table: {
          head: ['', 'IRLZ44N', 'IRF540N', tr('2N2222（假设）', '2N2222 (hypothetical)')],
          rows: [
            [tr('控制端需要', 'drive needed'), tr('3.3 V，直流 0 A', '3.3 V, 0 A DC'), tr('3.3 V，直流 0 A', '3.3 V, 0 A DC'), tr('62 mA 基极电流 ✗', '62 mA base current ✗')],
            ['$V_{DS}$ / $V_{CE}$', '27 mV', '3.9 V', '≈ 0.77 V'],
            [tr('电机电流', 'motor current'), '620 mA', '140 mA', '≈ 600 mA'],
            [tr('开关功耗', 'switch power'), '17 mW', '0.54 W', '≈ 0.48 W'],
            [tr('温升（无散热片）', 'rise (no heatsink)'), '≈ 1 °C', '≈ 33 °C', tr('TO-92：超额定 ✗', 'TO-92: over rating ✗')],
          ],
          parts: ['vgs', 'vds', 'id', 'irlz', 'irf'],
        },
        formulas: [
          { tex: 'P = I_D^{2}·R_{DS(on)}', note: tr('欧姆区（完全导通）的功耗', 'power when fully on (ohmic)') },
          { tex: 'ΔT = P·R_{θJA}', note: tr('结温升高；TO-220 无散热片约 62 °C/W', 'junction rise; TO-220 without heatsink ≈ 62 °C/W') },
        ],
        calcs: ['mosfet-power'],
      },
      {
        id: 'gate',
        short: tr('栅极电容', 'Gate C'),
        title: tr('⑧ 栅极是一个电容：只在开关瞬间取电流', '⑧ The gate is a capacitor: current only while switching'),
        body: tr(
          `从 GPIO 看进去，栅极就是一个 [[ciss|输入电容 $C_iss$]]（IRLZ44N 约 1.7 nF）。GPIO 从 0 跳到 3.3 V 时，就是一道一阶 RC 充电题：
$$v_G(t) = 3.3 V·(1 - e^{-t/τ}),   τ = (R_{out} + R_G)·C_{iss} = 125 Ω × 1.7 nF ≈ 0.21 µs$$
- 一开始电容相当于短路，[[ig|电流峰值]] $\\frac{3.3 V}{125 Ω}$ ≈ 26 mA，然后指数衰减到 0；
- [[vg|栅压]] 过 [[vth|$V_th$]] 的时刻：$t = τ·ln\\frac{3.3}{3.3 - 1.5}$ ≈ 0.13 µs；约 5τ ≈ 1 µs 后充满；
- 充满后 **直流电流为 0**——这就是“栅极不取电流”的准确含义。

[[rg|RG（47–220 Ω）]] 的作用：限制充电峰值电流保护 GPIO，并阻尼导线电感引起的振荡；直流时上面没有压降。
[[rpd|RPD（10–100 kΩ）]]：MCU 复位、上电、下载程序时引脚是高阻输入，栅极电容上的电荷没地方放，悬空的栅极可能让电机自己转起来。RPD 把它放掉，时间常数 100 kΩ × 1.7 nF = 0.17 ms。

**PWM 时的平均栅极电流**：每个周期充一次电荷 $Q = C_{iss}·V$ ≈ 1.7 nF × 3.3 V ≈ 5.6 nC，20 kHz 时 $I = Q·f$ ≈ 0.11 mA。频率越高，开关过程占的比例越大、开关损耗越大，所以电机 PWM 一般用 20–25 kHz。（真实 MOSFET 还有米勒电容，栅极电荷手册给的是 $Q_g$。）`,
          `Seen from the GPIO, the gate is an [[ciss|input capacitance $C_iss$]] (about 1.7 nF for the IRLZ44N). When the GPIO steps from 0 to 3.3 V it is a first-order RC charging problem:
$$v_G(t) = 3.3 V·(1 - e^{-t/τ}),   τ = (R_{out} + R_G)·C_{iss} = 125 Ω × 1.7 nF ≈ 0.21 µs$$
- at first the capacitor looks like a short: a [[ig|current peak]] of $\\frac{3.3 V}{125 Ω}$ ≈ 26 mA, decaying exponentially to 0;
- the [[vg|gate voltage]] crosses [[vth|$V_th$]] at $t = τ·ln\\frac{3.3}{3.3 - 1.5}$ ≈ 0.13 µs and is fully charged after about 5τ ≈ 1 µs;
- once charged, **the DC current is 0** — the exact meaning of "the gate takes no current".

[[rg|RG (47–220 Ω)]]: limits the charging peak to protect the GPIO and damps ringing from wiring inductance; at DC it drops nothing.
[[rpd|RPD (10–100 kΩ)]]: during reset, power-up and uploads the pin is a high-impedance input and the gate's charge has nowhere to go — a floating gate can start the motor on its own. RPD drains it, with a time constant of 100 kΩ × 1.7 nF = 0.17 ms.

**Average gate current under PWM**: each period charges $Q = C_{iss}·V$ ≈ 1.7 nF × 3.3 V ≈ 5.6 nC; at 20 kHz, $I = Q·f$ ≈ 0.11 mA. The higher the frequency, the larger the share of time spent switching and the larger the switching loss — motor PWM usually runs at 20–25 kHz. (A real MOSFET also has the Miller capacitance; datasheets give the total gate charge $Q_g$.)`,
        ),
        formulas: [
          { tex: 'τ = (R_{out} + R_G)·C_{iss} ≈ 0.21 µs', note: tr('栅极充电时间常数', 'gate charging time constant') },
          { tex: 'I_{G,avg} = Q·f = C_{iss}·V·f ≈ 0.11 mA', note: tr('20 kHz PWM 时', 'at 20 kHz PWM') },
        ],
      },
      {
        id: 'flyback',
        short: tr('续流 + PWM', 'Flyback + PWM'),
        title: tr('⑨ 续流二极管和 PWM 调速（实验 5-15）', '⑨ The flyback diode and PWM speed control (lab 5-15)'),
        body: tr(
          `电机线圈是一个电感（模型 8 Ω + 2 mH）。MOSFET 关断的一瞬间，电感要维持电流（$u = L\\frac{di}{dt}$）：
- 有 [[d1|续流二极管 D1]]（反接在电机两端，阴极接 +5 V）：电流改走 [[loop-off|电机 → D1 → 电机]] 这个小回路慢慢衰减，[[vd|漏极被钳在 5 V + 0.7 V = 5.7 V]]；
- 没有 D1：电流无处可去，$\\frac{di}{dt}$ 极大，[[nodiode|漏极电压冲到 MOSFET 的雪崩电压 55 V]]，每个周期打一次，迟早击穿。

**PWM 调速**：[[loop-on|导通期间]] 电机上是 5 V，关断期间是 −0.7 V（续流二极管）。电机电感的时间常数 $τ = \\frac{L}{R}$ = 0.25 ms；20 kHz 时周期 50 µs ≪ τ，电流几乎是平的：
$$V̄_{motor} ≈ D·5 V - (1 - D)·0.7 V,   Ī = \\frac{V̄_{motor}}{8 Ω}$$
- D = 25 %：0.71 V，**89 mA**（其中 66 mA 走二极管），低于 0.1 A 的起转电流——**电机不转**（真实电机也有这个“死区”）；
- D = 50 %：2.06 V，**258 mA**，一半时间在续流；
- D = 100 %：**620 mA**，二极管不工作。

**频率怎么选**：1 kHz、50 % 时平均电流差不多（263 mA），但周期 1 ms = 4τ，电流一涨一落，**有效值（RMS）**变成 317 mA——线圈发热 ∝ $I_{rms}^{2}$，多 45 %，而且 1 kHz 正是人耳最敏感的频率，电机会叫。所以电机 PWM 用 ≥ 20 kHz；LED 调光没有电感，≥ 1 kHz 不闪就行。`,
          `A motor winding is an inductor (model: 8 Ω + 2 mH). The instant the MOSFET turns off, the inductance insists on keeping its current ($u = L\\frac{di}{dt}$):
- with a [[d1|flyback diode D1]] (reversed across the motor, cathode to +5 V) the current takes the small loop [[loop-off|motor → D1 → motor]] and decays slowly; [[vd|the drain is clamped at 5 V + 0.7 V = 5.7 V]];
- without D1 the current has nowhere to go, $\\frac{di}{dt}$ is huge and [[nodiode|the drain flies up to the MOSFET's 55 V avalanche voltage]] — every period, until it fails.

**PWM speed control**: [[loop-on|while on]] the motor sees 5 V, while off −0.7 V (the flyback diode). The motor's time constant is $τ = \\frac{L}{R}$ = 0.25 ms; at 20 kHz the 50 µs period is ≪ τ and the current is nearly flat:
$$V̄_{motor} ≈ D·5 V - (1 - D)·0.7 V,   Ī = \\frac{V̄_{motor}}{8 Ω}$$
- D = 25 %: 0.71 V, **89 mA** (66 mA of it through the diode), below the 0.1 A start current — **the motor doesn't turn** (real motors have this dead band too);
- D = 50 %: 2.06 V, **258 mA**, freewheeling half the time;
- D = 100 %: **620 mA**, the diode idle.

**Choosing the frequency**: at 1 kHz, 50 % the average is about the same (263 mA), but the 1 ms period is 4τ, the current rises and falls, and the **RMS** becomes 317 mA — winding heat ∝ $I_{rms}^{2}$, 45 % more — and 1 kHz is where the ear is most sensitive: the motor whines. So motors get ≥ 20 kHz; LED dimming has no inductance and only needs ≥ 1 kHz to avoid flicker.`,
        ),
        table: {
          head: [tr('PWM', 'PWM'), tr('电机平均电流', 'motor average'), tr('二极管平均电流', 'diode average'), tr('电机 RMS', 'motor RMS'), tr('结果', 'Result')],
          rows: [
            ['20 kHz, 25 %', '89 mA', '66 mA', '≈ 89 mA', tr('不转（< 0.1 A）', 'doesn’t start (< 0.1 A)')],
            ['20 kHz, 50 %', '258 mA', '129 mA', '258 mA', tr('平稳', 'smooth')],
            ['20 kHz, 100 %', '620 mA', '0', '620 mA', tr('全速', 'full speed')],
            ['1 kHz, 50 %', '263 mA', '—', '317 mA', tr('更热、啸叫', 'hotter, whines')],
          ],
          parts: ['loop-off', 'loop-off', 'loop-on', null],
        },
        formulas: [
          { tex: 'V̄_{motor} ≈ D·V_S - (1 - D)·V_D', note: tr('τ = L/R ≫ 周期时', 'for τ = L/R ≫ the period') },
          { tex: 'V_{D,peak} = V_S + V_{D1} = 5.7 V', note: tr('续流二极管钳住的漏极电压', 'drain voltage clamped by the flyback diode') },
        ],
        calcs: ['pwm-average', 'mosfet-power'],
      },
    ],
    recap: tr(
      'N-MOSFET = p 衬底里两个 n⁺ 区 + 氧化层上的栅极。$V_{GS}$ > $V_{th}$ 时电场画出 n 沟道；当开关要在欧姆区，$R_{DS} = \\frac{1}{K(V_{GS} - V_{th})}$，功耗 $P = I^{2}·R_{DS}$。3.3 V 的 MCU 选逻辑电平型号；栅极是电容，串 RG、加 RPD 下拉；电感负载并续流二极管。',
      'An N-MOSFET = two n⁺ wells in a p body plus a gate on an oxide. With $V_{GS}$ > $V_{th}$ the field draws an n-channel; as a switch it must be ohmic, $R_{DS} = \\frac{1}{K(V_{GS} - V_{th})}$, power $P = I^{2}·R_{DS}$. With a 3.3 V MCU choose a logic-level part; the gate is a capacitor — add RG and a RPD pull-down; inductive loads get a flyback diode.',
    ),
  };
}
