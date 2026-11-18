// Teardown: the 4-leg tactile push button and the SPDT slide switch. Outside (legs / pins as a
// table) → X-ray of the button (two metal frames: which legs are one piece) → the snap dome in
// cross-section → equivalent circuit (two nodes + a switch) with the lesson's numbers → how to
// place it across the trench (and the placement that shorts it) → the slide switch (com, a, b)
// → contact bounce in a real switch vs the simulator.

import './power.css';
import { tr } from '../../core/i18n';
import type { ReactNode } from 'react';
import { vis } from '../TeardownView';
import type { Teardown } from '../types';

function Res({ x1, y1, x2, y2, part }: { x1: number; y1: number; x2: number; y2: number; part?: string }) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const body = Math.min(44, L - 8);
  const a = (L - body) / 2;
  const pts: string[] = [`${x1},${y1}`, `${x1 + ux * a},${y1 + uy * a}`];
  for (let k = 1; k <= 6; k++) {
    const t = a + (body * k) / 6.5;
    const s = k % 2 ? 6 : -6;
    pts.push(`${x1 + ux * t - uy * s},${y1 + uy * t + ux * s}`);
  }
  pts.push(`${x1 + ux * (a + body)},${y1 + uy * (a + body)}`, `${x2},${y2}`);
  return <polyline points={pts.join(' ')} className="oa-wire" data-part={part} />;
}

function Gnd({ x, y, part }: { x: number; y: number; part?: string }) {
  return (
    <g className="oa-wire" data-part={part}>
      <line x1={x - 12} y1={y} x2={x + 12} y2={y} />
      <line x1={x - 7} y1={y + 5} x2={x + 7} y2={y + 5} />
      <line x1={x - 3} y1={y + 10} x2={x + 3} y2={y + 10} />
    </g>
  );
}

/** LED symbol pointing down, anode at (x, y) */
function Led({ x, y, color, part }: { x: number; y: number; color: string; part?: string }) {
  return (
    <g data-part={part}>
      <polygon points={`${x - 11},${y} ${x + 11},${y} ${x},${y + 18}`} fill={color} stroke="#1f2a44" strokeWidth={1.5} />
      <line x1={x - 11} y1={y + 19} x2={x + 11} y2={y + 19} className="oa-wire" />
    </g>
  );
}

/* --------------------------------------------------------------- the push button (layers 0–1) */

const LEG = [
  { id: '1a', x: 125, y: 104, part: 'leg1a node1' },
  { id: '2a', x: 195, y: 104, part: 'leg2a node2' },
  { id: '1b', x: 125, y: 256, part: 'leg1b node1' },
  { id: '2b', x: 195, y: 256, part: 'leg2b node2' },
];

function Button({ layer }: { layer: number }) {
  const xray = layer >= 1;
  return (
    <g className={vis(layer, 0, 1)}>
      <text x={160} y={56} textAnchor="middle" className="tdp-big">
        {tr('轻触按键（俯视）', 'Tactile button (top view)')}
      </text>
      {LEG.map((l) => (
        <g key={l.id} data-part={l.part}>
          <rect x={l.x - 6} y={l.y} width={12} height={22} rx={2} className="tdp-metal" />
          <text x={l.x} y={l.y < 200 ? l.y - 8 : l.y + 40} textAnchor="middle" className="oa-lbl">
            {l.id}
          </text>
        </g>
      ))}
      <g className="pw-fade" style={{ opacity: xray ? 0.2 : 1 }} data-part="body">
        <rect x={96} y={126} width={128} height={128} rx={6} fill="#2f3138" stroke="#16171a" strokeWidth={2} />
        <circle cx={104} cy={134} r={3} fill="#555" />
        <circle cx={216} cy={134} r={3} fill="#555" />
        <circle cx={104} cy={246} r={3} fill="#555" />
        <circle cx={216} cy={246} r={3} fill="#555" />
      </g>
      <g className="pw-fade" style={{ opacity: xray ? 0.15 : 1 }} data-part="cap">
        <circle cx={160} cy={190} r={36} fill="#1b1c20" stroke="#4a4c53" strokeWidth={3} />
      </g>
      {/* x-ray: two metal frames, dome, contacts */}
      <g className={vis(layer, 1, 1)}>
        <rect x={120} y={112} width={10} height={156} fill="#c9a227" data-part="node1" />
        <rect x={190} y={112} width={10} height={156} fill="#c9a227" data-part="node2" />
        <path d="M 180 207 A 26 26 0 1 1 180 173" stroke="#c9a227" strokeWidth={5} fill="none" data-part="node1 ring" />
        <line x1={130} y1={190} x2={134} y2={190} stroke="#c9a227" strokeWidth={5} data-part="node1" />
        <circle cx={160} cy={190} r={9} fill="#c9a227" data-part="node2 center" />
        <line x1={168} y1={190} x2={190} y2={190} stroke="#c9a227" strokeWidth={5} data-part="node2" />
        <circle cx={160} cy={190} r={33} fill="none" stroke="#7d8088" strokeWidth={2} strokeDasharray="5 3" data-part="dome" />
        <text x={160} y={334} textAnchor="middle" className="oa-lbl">
          {tr('1a–1b 一体，2a–2b 一体', '1a–1b one piece, 2a–2b one piece')}
        </text>
      </g>
      <text x={160} y={334} textAnchor="middle" className={`td-small ${xray ? 'td-hide' : 'td-show'}`}>
        {tr('6 × 6 mm，4 只脚', '6 × 6 mm, 4 legs')}
      </text>
    </g>
  );
}

function Slide({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 0, 0)}>
      <text x={430} y={56} textAnchor="middle" className="tdp-big">
        {tr('拨动开关（侧视）', 'Slide switch (side view)')}
      </text>
      <rect x={360} y={150} width={40} height={30} rx={3} fill="#1b1c20" data-part="lever" />
      <rect x={340} y={178} width={180} height={64} rx={4} className="tdp-metal" data-part="sbody" />
      {[
        ['a', 380, 'pin-a'],
        ['com', 430, 'pin-com'],
        ['b', 480, 'pin-b'],
      ].map(([n, x, part]) => (
        <g key={n as string} data-part={part as string}>
          <rect x={(x as number) - 4} y={242} width={8} height={40} fill="#c9ccd1" stroke="#7d8088" />
          <text x={x as number} y={302} textAnchor="middle" className="oa-lbl">
            {n}
          </text>
        </g>
      ))}
      <text x={430} y={130} textAnchor="middle" className="td-small" data-part="lever">
        {tr('拨杆在 a 侧 → com 接 a', 'lever on the a side → com to a')}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layer 2: the snap dome */

function Dome({ layer }: { layer: number }) {
  const one = (dx: number, pressed: boolean) => (
    <g>
      <rect x={dx + 50} y={290} width={190} height={22} rx={3} fill="#2f3138" data-part="body" />
      <rect x={dx + 62} y={280} width={34} height={10} fill="#c9a227" data-part="ring" />
      <rect x={dx + 194} y={280} width={34} height={10} fill="#c9a227" data-part="ring" />
      <rect x={dx + 128} y={282} width={34} height={8} fill="#c9a227" data-part="center" />
      {pressed ? (
        <path
          d={`M${dx + 70} 280 Q${dx + 102} 250 ${dx + 128} 280 L${dx + 162} 280 Q${dx + 188} 250 ${dx + 220} 280`}
          stroke="#7d8088"
          strokeWidth={5}
          fill="none"
          data-part="dome"
        />
      ) : (
        <path d={`M${dx + 70} 280 Q${dx + 145} 196 ${dx + 220} 280`} stroke="#7d8088" strokeWidth={5} fill="none" data-part="dome" />
      )}
      <rect x={dx + 128} y={pressed ? 186 : 162} width={34} height={pressed ? 80 : 74} rx={4} fill="#1b1c20" data-part="cap" />
    </g>
  );
  return (
    <g className={vis(layer, 2, 2)}>
      <text x={145} y={64} textAnchor="middle" className="tdp-big">
        {tr('松开：断开', 'Released: open')}
      </text>
      <text x={415} y={64} textAnchor="middle" className="tdp-big">
        {tr('按下：接通', 'Pressed: closed')}
      </text>
      {one(0, false)}
      {one(270, true)}
      <path d="M415 100 L415 176" className="oa-wire" style={{ strokeWidth: 3 }} markerEnd="url(#sw-ah)" data-part="force" />
      <text x={425} y={130} className="oa-lbl" data-part="force">
        F ≈ 1.6 N
      </text>
      <text x={145} y={340} textAnchor="middle" className="td-small">
        {tr('拱形弹片不碰中心触点', 'the dome clears the centre pad')}
      </text>
      <text x={415} y={340} textAnchor="middle" className="td-small">
        {tr('弹片“咔哒”翻转，压到中心触点', 'the dome snaps through onto the centre pad')}
      </text>
      <path d="M350 276 Q 372 258 398 276 L432 276 Q 458 258 480 276" className="oa-cur" fill="none" style={{ strokeWidth: 2.5 }} data-part="path" />
      <text x={415} y={378} textAnchor="middle" className="pw-lbl-amber" fontSize={12} data-part="path">
        {tr('电流：外圈 (1) → 弹片 → 中心 (2)', 'current: ring (1) → dome → centre (2)')}
      </text>
      <text x={145} y={378} textAnchor="middle" className="td-small">
        {tr('行程约 0.25 mm', 'travel ≈ 0.25 mm')}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layer 3: two nodes + a switch */

function Equivalent({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 3, 3)}>
      <text x={150} y={56} textAnchor="middle" className="tdp-big">
        {tr('4 只脚 = 2 个结点', '4 legs = 2 nodes')}
      </text>
      {/* node 1 */}
      <g data-part="node1">
        <line x1={70} y1={100} x2={70} y2={250} className="oa-wire" style={{ strokeWidth: 4 }} />
        <circle cx={70} cy={100} r={5} className="oa-term" />
        <circle cx={70} cy={250} r={5} className="oa-term" />
        <text x={60} y={104} textAnchor="end" className="oa-lbl">
          1a
        </text>
        <text x={60} y={254} textAnchor="end" className="oa-lbl">
          1b
        </text>
        <text x={78} y={280} className="pw-lbl-purple" fontSize={12}>
          {tr('结点 1', 'node 1')}
        </text>
      </g>
      <g data-part="node2">
        <line x1={230} y1={100} x2={230} y2={250} className="oa-wire" style={{ strokeWidth: 4 }} />
        <circle cx={230} cy={100} r={5} className="oa-term" />
        <circle cx={230} cy={250} r={5} className="oa-term" />
        <text x={240} y={104} className="oa-lbl">
          2a
        </text>
        <text x={240} y={254} className="oa-lbl">
          2b
        </text>
        <text x={222} y={280} textAnchor="end" className="pw-lbl-purple" fontSize={12}>
          {tr('结点 2', 'node 2')}
        </text>
      </g>
      <g data-part="sw">
        <line x1={70} y1={175} x2={118} y2={175} className="oa-wire" />
        <circle cx={120} cy={175} r={3.5} className="oa-term" />
        <line x1={120} y1={175} x2={178} y2={150} className="oa-wire" />
        <circle cx={180} cy={175} r={3.5} className="oa-term" />
        <line x1={180} y1={175} x2={230} y2={175} className="oa-wire" />
        <line x1={150} y1={132} x2={150} y2={160} className="oa-wire" strokeDasharray="3 3" />
        <line x1={140} y1={132} x2={160} y2={132} className="oa-wire" />
        <text x={150} y={204} textAnchor="middle" className="td-small">
          {tr('常开 NO', 'normally open')}
        </text>
      </g>
      <text x={150} y={330} textAnchor="middle" className="td-small" data-part="sw">
        {tr('仿真：按下 0.02 Ω，松开 1 GΩ', 'simulator: pressed 0.02 Ω, released 1 GΩ')}
      </text>

      {/* lesson 7 circuit */}
      <text x={430} y={56} textAnchor="middle" className="tdp-big">
        {tr('第 7 课的电路', 'Lesson 7’s circuit')}
      </text>
      <circle cx={330} cy={270} r={20} className="oa-src" data-part="src" />
      <text x={330} y={266} textAnchor="middle" className="oa-src-sign">
        +
      </text>
      <text x={330} y={284} textAnchor="middle" className="oa-src-sign">
        −
      </text>
      <text x={304} y={274} textAnchor="end" className="oa-lbl" data-part="src">
        5 V
      </text>
      <path d="M330 250 L330 110 L380 110" className="oa-wire" />
      <g data-part="sw">
        <circle cx={382} cy={110} r={3.5} className="oa-term" />
        <line x1={382} y1={110} x2={428} y2={92} className="oa-wire" />
        <circle cx={430} cy={110} r={3.5} className="oa-term" />
        <text x={406} y={80} textAnchor="middle" className="oa-lbl">
          SW1
        </text>
      </g>
      <path d="M430 110 L500 110 L500 130" className="oa-wire" />
      <Res x1={500} y1={130} x2={500} y2={210} part="r" />
      <text x={514} y={174} className="oa-lbl" data-part="r">
        220 Ω
      </text>
      <line x1={500} y1={210} x2={500} y2={250} className="oa-wire" />
      <Led x={500} y={250} color="#e63946" part="led" />
      <path d="M500 269 L500 380 L330 380 L330 290" className="oa-wire" />
      <line x1={415} y1={380} x2={415} y2={390} className="oa-wire" />
      <Gnd x={415} y={390} />
      <path d="M455 100 L485 100" className="oa-cur" markerEnd="url(#sw-ah-i)" data-part="cur" />
      <text x={470} y={92} textAnchor="middle" className="pw-lbl-amber" fontSize={12} data-part="cur">
        I
      </text>
      <text x={430} y={426} textAnchor="middle" className="td-small" data-part="cur">
        {tr('按下：I = (5 − 1.8) / (220 + 12) ≈ 13.8 mA', 'pressed: I = (5 − 1.8) / (220 + 12) ≈ 13.8 mA')}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layer 4: across the trench */

const BX = (c: number) => 40 + (c - 4) * 40; // columns 4..8
const BY: Record<string, number> = { c: 120, d: 145, e: 170, f: 230, g: 255, h: 280 };

function MiniBoard({ dx, children, good }: { dx: number; children: ReactNode; good: boolean }) {
  return (
    <g transform={`translate(${dx} 0)`}>
      <rect x={20} y={100} width={200} height={200} rx={8} fill="#f2ede2" stroke="#b8ab8f" />
      <rect x={24} y={188} width={192} height={24} fill="#e2dacb" data-part="trench" />
      {[4, 5, 6, 7, 8].map((c) => (
        <g key={c}>
          <rect x={BX(c) - 7} y={BY.c - 12} width={14} height={BY.e - BY.c + 24} rx={3} fill="#c9a227" opacity={0.55} />
          <rect x={BX(c) - 7} y={BY.f - 12} width={14} height={BY.h - BY.f + 24} rx={3} fill="#c9a227" opacity={0.55} />
          {Object.values(BY).map((y) => (
            <rect key={y} x={BX(c) - 4} y={y - 4} width={8} height={8} rx={1.5} fill="#2f3138" />
          ))}
          <text x={BX(c)} y={96} textAnchor="middle" className="pw-tiny">
            {c}
          </text>
        </g>
      ))}
      {['c', 'd', 'e', 'f', 'g', 'h'].map((r) => (
        <text key={r} x={14} y={BY[r] + 4} textAnchor="middle" className="pw-tiny">
          {r}
        </text>
      ))}
      {children}
      <text x={120} y={330} textAnchor="middle" className={good ? 'pw-lbl-green' : 'pw-lbl-red'} fontSize={14}>
        {good ? tr('✓ 横跨凹槽', '✓ straddling the trench') : tr('✗ 转了 90°、插在同一半', '✗ turned 90°, in one half')}
      </text>
    </g>
  );
}

function Trench({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 4, 4)}>
      <MiniBoard dx={10} good>
        <g data-part="good">
          <rect x={BX(5) - 14} y={BY.e - 14} width={BX(7) - BX(5) + 28} height={BY.f - BY.e + 28} rx={5} fill="rgba(47,49,56,0.25)" stroke="#2f3138" strokeWidth={2} />
          <line x1={BX(5)} y1={BY.e} x2={BX(5)} y2={BY.f} stroke="#e07a1f" strokeWidth={4} />
          <line x1={BX(7)} y1={BY.e} x2={BX(7)} y2={BY.f} stroke="#e07a1f" strokeWidth={4} />
          {[
            [5, 'e'],
            [7, 'e'],
            [5, 'f'],
            [7, 'f'],
          ].map(([c, r]) => (
            <circle key={`${c}${r}`} cx={BX(c as number)} cy={BY[r as string]} r={6} fill="#c9ccd1" stroke="#16171a" strokeWidth={1.5} />
          ))}
          <text x={BX(6)} y={BY.e + 34} textAnchor="middle" className="oa-lbl">
            SW
          </text>
        </g>
        <text x={120} y={356} textAnchor="middle" className="td-small">
          {tr('第 5 列 = 结点 1，第 7 列 = 结点 2', 'column 5 = node 1, column 7 = node 2')}
        </text>
        <text x={120} y={374} textAnchor="middle" className="td-small">
          {tr('按下才接通 ✓', 'joined only when pressed ✓')}
        </text>
      </MiniBoard>
      <MiniBoard dx={290} good={false}>
        <g data-part="bad">
          <rect x={BX(5) - 14} y={BY.c - 14} width={BX(7) - BX(5) + 28} height={BY.e - BY.c + 28} rx={5} fill="rgba(47,49,56,0.25)" stroke="#2f3138" strokeWidth={2} />
          <line x1={BX(5)} y1={BY.c} x2={BX(7)} y2={BY.c} stroke="#e07a1f" strokeWidth={4} />
          <line x1={BX(5)} y1={BY.e} x2={BX(7)} y2={BY.e} stroke="#e07a1f" strokeWidth={4} />
          <rect x={BX(5) - 9} y={BY.c - 14} width={18} height={BY.e - BY.c + 28} rx={4} fill="none" stroke="#e63946" strokeWidth={3} />
          <rect x={BX(7) - 9} y={BY.c - 14} width={18} height={BY.e - BY.c + 28} rx={4} fill="none" stroke="#e63946" strokeWidth={3} />
          {[
            [5, 'c'],
            [7, 'c'],
            [5, 'e'],
            [7, 'e'],
          ].map(([c, r]) => (
            <circle key={`${c}${r}`} cx={BX(c as number)} cy={BY[r as string]} r={6} fill="#c9ccd1" stroke="#16171a" strokeWidth={1.5} />
          ))}
        </g>
        <text x={120} y={356} textAnchor="middle" className="td-small">
          {tr('1 和 2 插进同一条金属条 →', '1 and 2 share a metal strip →')}
        </text>
        <text x={120} y={374} textAnchor="middle" className="pw-lbl-red" fontSize={11}>
          {tr('开关被短路，永远是通的', 'the switch is shorted: always on')}
        </text>
      </MiniBoard>
    </g>
  );
}

/* --------------------------------------------------------------- layer 5: the slide switch */

function SlideX({ y0, pos }: { y0: number; pos: 'a' | 'b' }) {
  const pins: [string, number][] = [
    ['a', 80],
    ['com', 150],
    ['b', 220],
  ];
  const bx = pos === 'a' ? 64 : 134;
  return (
    <g>
      <rect x={pos === 'a' ? 72 : 172} y={y0 - 22} width={50} height={22} rx={3} fill="#1b1c20" data-part="lever" />
      <rect x={40} y={y0} width={220} height={70} rx={5} fill="rgba(201,204,209,0.3)" stroke="#7d8088" strokeWidth={2} data-part="sbody" />
      <rect x={bx} y={y0 + 36} width={102} height={10} rx={3} fill="#c9a227" data-part={pos === 'a' ? 'bridge-a' : 'bridge-b'} />
      <line x1={pos === 'a' ? 97 : 197} y1={y0} x2={pos === 'a' ? 97 : 197} y2={y0 + 36} stroke="#7d8088" strokeWidth={3} />
      {pins.map(([n, x]) => (
        <g key={n} data-part={`pin-${n}`}>
          <rect x={x - 6} y={y0 + 46} width={12} height={10} fill="#c9a227" />
          <rect x={x - 3} y={y0 + 56} width={6} height={36} fill="#c9ccd1" stroke="#7d8088" />
          <text x={x} y={y0 + 108} textAnchor="middle" className="oa-lbl">
            {n}
          </text>
        </g>
      ))}
      <text x={pos === 'a' ? 260 : 40} y={y0 - 8} textAnchor={pos === 'a' ? 'end' : 'start'} className="pw-lbl-amber" fontSize={13}>
        {pos === 'a' ? tr('com–a 接通', 'com–a closed') : tr('com–b 接通', 'com–b closed')}
      </text>
    </g>
  );
}

function SlideLayer({ layer }: { layer: number }) {
  return (
    <g className={vis(layer, 5, 5)}>
      <text x={150} y={36} textAnchor="middle" className="tdp-big">
        {tr('X 光：滑块上的铜桥', 'X-ray: the copper bridge on the slider')}
      </text>
      <SlideX y0={80} pos="a" />
      <SlideX y0={262} pos="b" />
      {/* challenge 4 circuit with the SPDT symbol */}
      <text x={455} y={36} textAnchor="middle" className="tdp-big">
        {tr('挑战 4', 'Challenge 4')}
      </text>
      <circle cx={340} cy={300} r={18} className="oa-src" data-part="src" />
      <text x={340} y={296} textAnchor="middle" className="oa-src-sign">
        +
      </text>
      <text x={340} y={312} textAnchor="middle" className="oa-src-sign">
        −
      </text>
      <text x={318} y={304} textAnchor="end" className="oa-lbl" data-part="src">
        5 V
      </text>
      <path d="M340 282 L340 230 L360 230" className="oa-wire" />
      <g data-part="spdt">
        <circle cx={362} cy={230} r={3.5} className="oa-term" />
        <line x1={362} y1={230} x2={404} y2={194} className="oa-wire" style={{ strokeWidth: 2.5 }} />
        <circle cx={408} cy={190} r={3.5} className="oa-term" />
        <circle cx={408} cy={270} r={3.5} className="oa-term" />
        <text x={358} y={220} textAnchor="end" className="oa-lbl">
          com
        </text>
        <text x={414} y={184} className="oa-lbl">
          a
        </text>
        <text x={414} y={290} className="oa-lbl">
          b
        </text>
      </g>
      <path d="M408 190 L408 110 L520 110 L520 130" className="oa-wire" data-part="pin-a" />
      <Res x1={520} y1={130} x2={520} y2={200} part="pin-a" />
      <text x={534} y={170} textAnchor="start" className="td-small" transform="rotate(90 534 170)">
        220 Ω
      </text>
      <line x1={520} y1={200} x2={520} y2={240} className="oa-wire" />
      <Led x={520} y={240} color="#e63946" part="led-red" />
      <line x1={520} y1={259} x2={520} y2={380} className="oa-wire" />
      <path d="M408 270 L420 270" className="oa-wire" data-part="pin-b" />
      <Res x1={420} y1={270} x2={470} y2={270} part="pin-b" />
      <text x={445} y={258} textAnchor="middle" className="td-small">
        220 Ω
      </text>
      <path d="M470 270 L470 300" className="oa-wire" />
      <Led x={470} y={300} color="#2ba59b" part="led-green" />
      <line x1={470} y1={319} x2={470} y2={380} className="oa-wire" />
      <path d="M520 380 L340 380 L340 318" className="oa-wire" />
      <line x1={430} y1={380} x2={430} y2={390} className="oa-wire" />
      <Gnd x={430} y={390} />
      <text x={455} y={428} textAnchor="middle" className="td-small">
        {tr('拨到 a：红亮；拨到 b：绿亮', 'on a: red lit; on b: green lit')}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------- layer 6: bounce */

function Bounce({ layer }: { layer: number }) {
  const x = (ms: number) => 80 + ms * 44; // 0..10 ms
  const yv = (v: number, base: number) => base - v * 22; // 0..5 V in 110 px
  const B1 = 200;
  const B2 = 360;
  const real: [number, number][] = [
    [0, 0],
    [2, 0],
    [2, 5],
    [2.3, 5],
    [2.3, 0.4],
    [2.6, 0.4],
    [2.6, 5],
    [2.75, 5],
    [2.75, 1.2],
    [3.0, 1.2],
    [3.0, 5],
    [3.2, 5],
    [3.2, 2.6],
    [3.35, 2.6],
    [3.35, 5],
    [10, 5],
  ];
  return (
    <g className={vis(layer, 6)}>
      <rect x={20} y={30} width={520} height={390} rx={14} className="td-panel" />
      <text x={280} y={56} textAnchor="middle" className="td-panel-title">
        {tr('按下一次，引脚上看到的电压', 'One press, as seen on the input pin')}
      </text>
      {[B1, B2].map((b) => (
        <g key={b}>
          <line x1={x(0)} y1={b} x2={x(10)} y2={b} className="oa-axis" />
          <line x1={x(0)} y1={b} x2={x(0)} y2={b - 120} className="oa-axis" />
          <text x={x(0) - 6} y={b + 4} textAnchor="end" className="td-small">
            0
          </text>
          <text x={x(0) - 6} y={yv(5, b) + 4} textAnchor="end" className="td-small">
            5 V
          </text>
        </g>
      ))}
      <text x={x(0)} y={B1 - 126} className="oa-lbl" data-part="sim">
        {tr('模拟器（理想开关）', 'simulator (ideal switch)')}
      </text>
      <polyline points={`${x(0)},${B1} ${x(2)},${B1} ${x(2)},${yv(5, B1)} ${x(10)},${yv(5, B1)}`} className="pw-curve-green" data-part="sim" />
      <text x={x(2.2)} y={yv(5, B1) + 22} className="td-small" data-part="sim">
        {tr('一步跳变，没有抖动', 'one clean step, no bounce')}
      </text>
      <text x={x(0)} y={B2 - 126} className="oa-lbl" data-part="real">
        {tr('真实按键：触点弹跳', 'real button: contact bounce')}
      </text>
      <polyline points={real.map(([t, v]) => `${x(t)},${yv(v, B2)}`).join(' ')} className="pw-curve-red" strokeWidth={2.2} data-part="real" />
      <path d={`M${x(2)} ${B2 + 14} L${x(3.35)} ${B2 + 14}`} className="oa-vd" markerStart="url(#sw-ah-v)" markerEnd="url(#sw-ah-v)" data-part="real" />
      <text x={x(2.7)} y={B2 + 32} textAnchor="middle" className="pw-lbl-purple" fontSize={11} data-part="real">
        {tr('约 1–5 ms', '≈ 1–5 ms')}
      </text>
      {/* RC debounce */}
      <path
        d={`M${x(2)} ${B2} ${Array.from({ length: 30 }, (_, k) => {
          const t = 2 + (k + 1) * 0.27;
          return `L${x(t)} ${yv(5 * (1 - Math.exp(-(t - 2) / 1)), B2)}`;
        }).join(' ')}`}
        className="pw-curve-purple"
        strokeDasharray="5 3"
        data-part="rc"
      />
      <text x={x(5.6)} y={yv(3.6, B2)} className="pw-lbl-purple" fontSize={11} data-part="rc">
        {tr('加 RC（10 kΩ × 100 nF，τ = 1 ms）后', 'with RC (10 kΩ × 100 nF, τ = 1 ms)')}
      </text>
      <text x={x(10)} y={B2 + 50} textAnchor="end" className="oa-lbl">
        t (ms)
      </text>
      {[0, 2, 4, 6, 8, 10].map((t) => (
        <text key={t} x={x(t)} y={B2 + 16} textAnchor="middle" className="pw-tiny">
          {t === 2 ? '' : t}
        </text>
      ))}
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <defs>
        <marker id="sw-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pw-ah" />
        </marker>
        <marker id="sw-ah-i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pw-ah-cur" />
        </marker>
        <marker id="sw-ah-v" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" className="pw-ah-accent" />
        </marker>
      </defs>
      <Button layer={layer} />
      <Slide layer={layer} />
      <Dome layer={layer} />
      <Equivalent layer={layer} />
      <Trench layer={layer} />
      <SlideLayer layer={layer} />
      <Bounce layer={layer} />
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'switches',
    title: tr('按键与拨动开关：4 只脚里哪两只是一体的', 'Push button and slide switch: which legs are one piece'),
    subtitle: tr(
      '开关是最简单的元件：要么是导线，要么是断路。但 4 只脚的 tactile button（轻触按键）只有 2 个电气端子，SPDT slide switch（单刀双掷拨动开关）有 3 个——先看清里面的金属怎么连，再看怎样插面包板、它的等效电路，以及真实开关的触点弹跳。',
      'A switch is the simplest part there is: either a wire or a gap. But the 4-leg tactile button has only 2 electrical terminals and the SPDT slide switch has 3 — first see how the metal inside is joined, then how to place it on the breadboard, its equivalent circuit, and the contact bounce of a real switch.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'outside',
        short: tr('外形', 'Outside'),
        title: tr('① 外形：4 只脚的按键，3 只脚的拨动开关', '① Outside: a 4-leg button and a 3-pin slide switch'),
        body: tr(
          `课程里用两种开关：
- [[body|tactile push button（轻触按键）]]：6 × 6 mm 的黑色方块，中间一个 [[cap|圆形按帽]]，四个角伸出 [[leg1a|4 只脚]]。按下接通，松手自动弹开——**momentary（瞬时）**、**normally open（常开）**。
- [[sbody|slide switch（拨动开关）]]：上面一个 [[lever|拨杆]]，下面一排 3 只脚 [[pin-a|a]]、[[pin-com|com]]、[[pin-b|b]]。拨到哪边就停在哪边——**latching（自锁）**。

按键的脚名字是模拟器里用的：数字 1 / 2 表示 **电气端子**，字母 a / b 表示同一个端子的两只脚。所以 4 只脚只有 **两个** 端子——这一点下一层用 X 光看。`,
          `The course uses two kinds of switch:
- [[body|tactile push button]]: a 6 × 6 mm black square with a [[cap|round cap]] in the middle and [[leg1a|4 legs]] at the corners. Pressed it connects, released it springs open — **momentary** and **normally open**.
- [[sbody|slide switch]]: a [[lever|lever]] on top and a row of 3 pins [[pin-a|a]], [[pin-com|com]], [[pin-b|b]] underneath. It stays wherever you push it — **latching**.

The button's leg names are the simulator's: the number 1 / 2 is the **electrical terminal**, the letter a / b tells the two legs of the same terminal apart. So 4 legs are only **two** terminals — the next layer shows why, by X-ray.`,
        ),
        table: {
          head: [tr('脚', 'Leg'), tr('属于', 'Part'), tr('内部永远连着', 'Always joined inside to'), tr('第 7 课插在', 'Lesson 7 hole')],
          rows: [
            ['1a', tr('按键', 'button'), '1b', 'e5'],
            ['1b', tr('按键', 'button'), '1a', 'f5'],
            ['2a', tr('按键', 'button'), '2b', 'e7'],
            ['2b', tr('按键', 'button'), '2a', 'f7'],
            ['a', tr('拨动开关', 'slide switch'), tr('拨杆在 a 侧时接 com', 'com, when the lever is on the a side'), tr('左边一列', 'left column')],
            ['com', tr('拨动开关', 'slide switch'), tr('a 或 b（公共端 common）', 'a or b (the common terminal)'), tr('中间一列', 'middle column')],
            ['b', tr('拨动开关', 'slide switch'), tr('拨杆在 b 侧时接 com', 'com, when the lever is on the b side'), tr('右边一列', 'right column')],
          ],
          parts: ['leg1a', 'leg1b', 'leg2a', 'leg2b', 'pin-a', 'pin-com', 'pin-b'],
        },
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：两片金属框，1a–1b 一片，2a–2b 一片', '② X-ray: two metal frames, 1a–1b one, 2a–2b the other'),
        body: tr(
          `把外壳变透明，按键里只有两片冲压出来的 **金属框（lead frame）**：
- [[node1|左边一片]]：1a 和 1b 是同一片金属的两头，所以它们 **永远相通**，跟按不按无关。它在底座里连到一个 [[ring|外圈触点]]。
- [[node2|右边一片]]：2a 和 2b 同理，它连到正中间的 [[center|中心触点]]。
- 两片之间隔着空气，上面盖着一片 [[dome|拱形金属弹片（snap dome）]]。弹片的边一直压在外圈上（也就是结点 1），中间悬在中心触点上方。

所以“4 只脚的开关”在电路上是：**结点 1（1a、1b）** 和 **结点 2（2a、2b）**，中间一个开关。为什么做 4 只脚？机械上更稳（四角焊在电路板上不会晃），布线上也方便——每个端子两边都能接线。`,
          `Make the case transparent: inside are just two stamped **lead frames**:
- [[node1|the left frame]]: 1a and 1b are the two ends of one piece of metal, so they are **always connected**, pressed or not. In the base it leads to an [[ring|outer ring contact]].
- [[node2|the right frame]]: likewise 2a and 2b; it leads to the [[center|centre contact]].
- Air separates the two, and on top sits a [[dome|metal snap dome]]. The dome's rim always rests on the ring (node 1); its middle hangs above the centre contact.

So electrically "a 4-leg switch" is **node 1 (1a, 1b)** and **node 2 (2a, 2b)** with a switch between them. Why 4 legs then? It is mechanically sturdier (soldered at four corners it doesn't wobble) and handy for wiring — each terminal can be reached from both sides.`,
        ),
        callouts: [
          { part: 'dome', label: tr('拱形弹片', 'snap dome'), x: 186, y: 168, lx: 300, ly: 140 },
          { part: 'center', label: tr('中心触点 → 结点 2', 'centre pad → node 2'), x: 162, y: 194, lx: 300, ly: 200 },
          { part: 'ring', label: tr('外圈触点 → 结点 1', 'ring → node 1'), x: 140, y: 210, lx: 300, ly: 260 },
        ],
      },
      {
        id: 'dome',
        short: tr('弹片', 'Dome'),
        title: tr('③ 内部结构：按下时弹片“咔哒”一下接通', '③ Inside: the dome snaps through and closes the contact'),
        body: tr(
          `侧面剖开看：
1. 松开时，[[dome|弹片]] 拱起，只有边缘压在 [[ring|外圈触点]] 上，和 [[center|中心触点]] 之间有空气——**断开**；
2. 用约 [[force|1.6 N]] 的力按 [[cap|按帽]]，弹片突然翻转（所以手上有“咔哒”的手感），中间压到中心触点上——[[path|电流从外圈经弹片流到中心]]，**接通**；
3. 松手，弹片自己弹回去，又断开。

弹片既是 **导体**，又是 **弹簧**。行程只有约 0.25 mm。这种按键是给“信号”用的，不是给“功率”用的：额定只有约 12 V、50 mA。`,
          `Cut it open from the side:
1. Released, the [[dome|dome]] bulges up; only its rim rests on the [[ring|ring contact]], and there is air between it and the [[center|centre contact]] — **open**;
2. Press the [[cap|cap]] with about [[force|1.6 N]] and the dome suddenly flips (that's the "click" you feel); its middle lands on the centre pad — [[path|current flows ring → dome → centre]], **closed**;
3. Let go and the dome springs back: open again.

The dome is both the **conductor** and the **spring**. Travel is only about 0.25 mm. These buttons are for signals, not power: rated around 12 V, 50 mA.`,
        ),
        table: {
          head: [tr('参数', 'Parameter'), tr('典型值（6 × 6 mm）', 'Typical (6 × 6 mm)'), tr('意思', 'Meaning')],
          rows: [
            [tr('操作力', 'operating force'), '≈ 1.6 N (160 gf)', tr('按下去要的力', 'force to actuate')],
            [tr('行程', 'travel'), '≈ 0.25 mm', tr('按帽走多远', 'how far the cap moves')],
            [tr('接触电阻', 'contact resistance'), '≤ 100 mΩ', tr('接通时的电阻（仿真 0.02 Ω）', 'resistance when closed (sim: 0.02 Ω)')],
            [tr('额定', 'rating'), '12 V DC, 50 mA', tr('只适合小信号', 'small signals only')],
            [tr('寿命', 'life'), tr('约 10 万次', '≈ 100 000 presses'), tr('弹片会疲劳', 'the dome fatigues')],
          ],
          parts: ['force', 'force', 'center', null, 'dome'],
        },
      },
      {
        id: 'model',
        short: tr('等效电路', 'Model'),
        title: tr('④ 等效电路：两个结点 + 一个开关', '④ Equivalent circuit: two nodes and a switch'),
        body: tr(
          `把前两层合起来，按键的等效电路就是：[[node1|结点 1]]（1a、1b）——[[sw|一个常开开关]]——[[node2|结点 2]]（2a、2b）。
- 按下：开关 = 一根导线，电阻约 0（模拟器 0.02 Ω）；
- 松开：开关 = 断路，电阻无穷大（模拟器 1 GΩ）。

**第 7 课**：[[src|+5 V]] → SW1 → [[r|220 Ω]] → [[led|红色 LED]] → GND。按下时用 KVL：
$$I = \\frac{5 - V_f}{R + R_{LED} + R_{SW}} = \\frac{5 - 1.8}{220 + 12 + 0.02} ≈ 13.8 mA$$
开关的 0.02 Ω 和 232 Ω 比完全可以忽略——这就是“理想开关”可以当成导线的原因。

松开时 I ≈ 0，电阻上没有压降，于是 **电源电压几乎全部落在断开的开关两端**（再减去 LED 上那一点点）。用万用表量一个断开的开关，看到的就是电源电压——这是排查电路时很有用的一招。`,
          `Put the two previous layers together and the button's equivalent circuit is: [[node1|node 1]] (1a, 1b) — [[sw|a normally-open switch]] — [[node2|node 2]] (2a, 2b).
- Pressed: the switch is a wire, about 0 Ω (simulator: 0.02 Ω);
- Released: the switch is an open circuit, infinite resistance (simulator: 1 GΩ).

**Lesson 7**: [[src|+5 V]] → SW1 → [[r|220 Ω]] → [[led|red LED]] → GND. Pressed, by KVL:
$$I = \\frac{5 - V_f}{R + R_{LED} + R_{SW}} = \\frac{5 - 1.8}{220 + 12 + 0.02} ≈ 13.8 mA$$
The switch's 0.02 Ω is nothing next to 232 Ω — that is why an ideal switch can be treated as a wire.

Released, I ≈ 0, so there is no drop across the resistor and **almost the whole supply voltage appears across the open switch** (less the little that sits on the LED). Measure an open switch with a multimeter and you see the supply voltage — a handy debugging trick.`,
        ),
        table: {
          head: [tr('状态', 'State'), tr('开关电阻', 'Switch R'), 'I', tr('开关两端电压', 'Voltage across switch'), 'LED'],
          rows: [
            [tr('按下', 'pressed'), '0.02 Ω', '13.8 mA', '≈ 0.3 mV', tr('亮', 'on')],
            [tr('松开', 'released'), '1 GΩ', '≈ 0', tr('接近 5 V', 'close to 5 V'), tr('灭', 'off')],
          ],
          parts: ['sw', 'sw'],
        },
        formulas: [{ tex: 'I = \\frac{V_s - V_f}{R + R_{LED}}', note: tr('开关闭合时它的电阻可以忽略', 'with the switch closed its resistance can be ignored') }],
        calcs: ['led-resistor', 'ohm'],
      },
      {
        id: 'trench',
        short: tr('跨凹槽', 'Trench'),
        title: tr('⑤ 怎么插：让按键横跨中间的凹槽', '⑤ Placing it: straddle the centre trench'),
        body: tr(
          `面包板每一列的 5 个孔下面是一条金属条（[[trench|凹槽]] 上下各一条，互不相通）。规则只有一条：**开关的两个端子（1 和 2）必须插在不同的金属条上**，否则金属条把开关短路了。

[[good|正确做法]]（第 7 课）：按键放在 e/f 两行、横跨凹槽，四只脚在 e5、f5、e7、f7：
- 1a（e5）和 1b（f5）在第 5 列的上下两条——它们本来就在内部相连，所以第 5 列上下两半 **都** 是结点 1；
- 2a、2b 在第 7 列——第 7 列上下两半都是结点 2；
- 两列之间只有按键里的开关。好处：上下两半都能接线，第 7 列的下半（f–j）可以直接接电阻和 LED。

[[bad|错误做法]]：按键转了 90° 插在同一半（c5、c7、e5、e7）。这时按键内部相连的是左右两只脚（c5–c7、e5–e7），而 **开关的两端 c5 和 e5 落在同一条金属条上**——开关被短路，LED 一直亮，按不按都一样。

判断方法：先用上一层的“两个结点”想清楚哪两只脚是开关的两端，再看它们是不是在同一条金属条上。`,
          `Under each column of 5 holes is one metal strip (one above the [[trench|trench]], one below, not connected). There is just one rule: **the switch's two terminals (1 and 2) must be on different strips**, or a strip shorts the switch out.

[[good|The right way]] (lesson 7): put the button on rows e/f, straddling the trench, legs in e5, f5, e7, f7:
- 1a (e5) and 1b (f5) are on the upper and lower strips of column 5 — they are already joined inside, so **both** halves of column 5 are node 1;
- 2a and 2b are in column 7 — both halves of column 7 are node 2;
- between the two columns there is only the switch in the button. Bonus: both halves are usable, so the lower half of column 7 (f–j) takes the resistor and LED directly.

[[bad|The wrong way]]: the button turned 90° in one half (c5, c7, e5, e7). Now the legs joined inside are the left–right pairs (c5–c7, e5–e7), and **the switch's two ends c5 and e5 land on the same strip** — the switch is shorted, the LED is always on, pressed or not.

How to check: first use the "two nodes" picture to decide which legs are the two ends of the switch, then see whether they share a strip.`,
        ),
        table: {
          head: [tr('摆法', 'Placement'), tr('脚在', 'Legs in'), tr('开关两端在', 'Switch ends on'), tr('结果', 'Result')],
          rows: [
            [tr('横跨凹槽', 'straddling'), 'e5 f5 e7 f7', tr('第 5 列 / 第 7 列', 'column 5 / column 7'), tr('✓ 按下才通', '✓ closes only when pressed')],
            [tr('转 90°，同一半', 'turned 90°, one half'), 'c5 c7 e5 e7', tr('都在第 5 列上半', 'both on column 5 top'), tr('✗ 永远通', '✗ always on')],
          ],
          parts: ['good', 'bad'],
        },
      },
      {
        id: 'slide',
        short: tr('拨动开关', 'Slide switch'),
        title: tr('⑥ 拨动开关 SPDT：com 接 a，或者接 b', '⑥ The SPDT slide switch: com to a, or com to b'),
        body: tr(
          `**SPDT = single pole, double throw（单刀双掷）**：一个“刀”（公共端 [[pin-com|com]]），两个“掷”（[[pin-a|a]] 和 [[pin-b|b]]）。

X 光：[[lever|拨杆]] 带着滑块走，滑块下面是一片 [[bridge-a|铜桥]]，它总是同时压在 **两只相邻的脚** 上：
- 拨杆在 a 侧：铜桥压住 a 和 com → **com–a 接通**，b 悬空；
- 拨杆在 b 侧：[[bridge-b|铜桥]] 压住 com 和 b → **com–b 接通**，a 悬空。

移动的过程中，铜桥先离开 a 再碰到 b，叫 **break-before-make（先断后通）**——a 和 b 永远不会被同时接通。

**等效电路**：[[spdt|一个单刀双掷开关]]，com 是转轴，刀片指向 a 或 b。

**挑战 4**：+5 V 接 com，a → 220 Ω → [[led-red|红 LED]]，b → 220 Ω → [[led-green|绿 LED]]。拨到 a 红亮，拨到 b 绿亮：每次只有一条支路有电流，$I = \\frac{5 - 1.8}{220 + 12} ≈ 13.8 mA$（绿灯 $V_f$ = 2.1 V，≈ 12.5 mA）。

只用 com 和一边（比如 com、a），它就是一个普通的通 / 断开关（SPST）。`,
          `**SPDT = single pole, double throw**: one "pole" (the common terminal [[pin-com|com]]) and two "throws" ([[pin-a|a]] and [[pin-b|b]]).

X-ray: the [[lever|lever]] moves a slider, and under it a [[bridge-a|copper bridge]] always rests on **two neighbouring pins**:
- lever on the a side: the bridge covers a and com → **com–a closed**, b left open;
- lever on the b side: the [[bridge-b|bridge]] covers com and b → **com–b closed**, a open.

While sliding, the bridge leaves a before it reaches b — **break-before-make**: a and b are never connected together.

**Equivalent circuit**: [[spdt|a single-pole double-throw switch]], com is the pivot and the blade points at a or b.

**Challenge 4**: +5 V to com, a → 220 Ω → [[led-red|red LED]], b → 220 Ω → [[led-green|green LED]]. On a the red one lights, on b the green one: only one branch carries current at a time, $I = \\frac{5 - 1.8}{220 + 12} ≈ 13.8 mA$ (green, $V_f$ = 2.1 V: ≈ 12.5 mA).

Use only com and one side (say com and a) and it is a plain on/off switch (SPST).`,
        ),
        table: {
          head: [tr('拨杆位置', 'Lever'), 'com–a', 'com–b', tr('挑战 4', 'Challenge 4')],
          rows: [
            ['a', tr('通（0.02 Ω）', 'closed (0.02 Ω)'), tr('断', 'open'), tr('红亮、绿灭', 'red on, green off')],
            ['b', tr('断', 'open'), tr('通（0.02 Ω）', 'closed (0.02 Ω)'), tr('绿亮、红灭', 'green on, red off')],
          ],
          parts: ['bridge-a', 'bridge-b'],
        },
      },
      {
        id: 'bounce',
        short: tr('抖动', 'Bounce'),
        title: tr('⑦ 局限：真实开关会“抖”，模拟器不会', '⑦ Limits: a real switch bounces, the simulator’s doesn’t'),
        body: tr(
          `模拟器里的开关是理想的：按下的那一刻电阻从 1 GΩ 跳到 0.02 Ω，[[sim|一步到位]]。

真实的金属触点是有弹性的：两片金属撞在一起时会 **弹开、再碰上、再弹开**，持续约 1–5 ms（有的开关到 10 ms）才稳定。这叫 **contact bounce（触点抖动）**。在示波器上看，[[real|一次按下变成了好几个脉冲]]。

- 点 LED：人眼看不出几毫秒的闪烁，无所谓；
- 接到单片机的 GPIO：它每秒能读几百万次，会把一次按下数成 3、4 次——计数器、开关菜单就会乱跳。

两种 **debounce（消抖）** 办法：
1. **软件**：第一次检测到变化后，等 10–20 ms 再读一次，状态还一样才算数；
2. **硬件**：[[rc|RC 低通]]，例如 10 kΩ 和 100 nF，$τ = RC = 10^{4} × 10^{-7} = 1 ms$。毫秒级的弹跳被电容“抹平”，最好再接一个 Schmitt trigger（施密特触发器）输入，让缓慢上升的电压只翻转一次。`,
          `The simulator's switch is ideal: the moment you press it the resistance jumps from 1 GΩ to 0.02 Ω, [[sim|in one step]].

Real metal contacts are springy: when the two pieces hit they **bounce apart, touch again, bounce again** for about 1–5 ms (up to 10 ms for some switches) before they settle. This is **contact bounce**. On a scope [[real|one press becomes several pulses]].

- Driving an LED: the eye can't see a few milliseconds of flicker, so it doesn't matter;
- Into a microcontroller GPIO: it reads millions of times a second and counts one press as 3 or 4 — counters and menus jump around.

Two ways to **debounce**:
1. **Software**: after the first change, wait 10–20 ms and read again; only count it if the state is the same;
2. **Hardware**: an [[rc|RC low-pass]], e.g. 10 kΩ and 100 nF, $τ = RC = 10^{4} × 10^{-7} = 1 ms$. The capacitor smooths out millisecond bounces; ideally follow it with a Schmitt-trigger input so the slowly rising voltage flips the logic only once.`,
        ),
        table: {
          head: [tr('现象', 'Effect'), tr('模拟器', 'Simulator'), tr('真实开关', 'Real switch')],
          rows: [
            [tr('接通过程', 'closing'), tr('瞬间，没有抖动', 'instant, no bounce'), tr('1–5 ms 的抖动', '1–5 ms of bounce')],
            [tr('接触电阻', 'contact resistance'), '0.02 Ω', tr('几十 mΩ，随氧化变大', 'tens of mΩ, grows with oxidation')],
            [tr('断开电阻', 'open resistance'), '1 GΩ', tr('> 100 MΩ', '> 100 MΩ')],
            [tr('电流', 'current'), tr('不限', 'unlimited'), tr('按键约 50 mA', 'button ≈ 50 mA')],
          ],
          parts: ['real', null, null, null],
        },
        formulas: [{ tex: 'τ = RC = 10 kΩ × 100 nF = 1 ms', note: tr('硬件消抖：τ 要比弹跳时间长', 'hardware debounce: τ longer than the bounce') }],
        calcs: ['rc-time-constant'],
      },
    ],
    recap: tr(
      '4 只脚的按键只有 2 个结点：1a–1b 是一片金属，2a–2b 是另一片，按下时弹片把两片接通。横跨凹槽插，第 5 列和第 7 列就是开关的两端。SPDT 拨动开关：com 接 a 或接 b，先断后通。理想开关 = 导线或断路；真实开关会抖动几毫秒，接单片机时要消抖。',
      'A 4-leg button is just 2 nodes: 1a–1b is one piece of metal, 2a–2b the other, and pressing it lets the dome join them. Straddle the trench and columns 5 and 7 are the two ends of the switch. The SPDT slide switch connects com to a or to b, break-before-make. An ideal switch is a wire or a gap; a real one bounces for a few milliseconds, so debounce it when a microcontroller reads it.',
    ),
  };
}
