// Teardown: the solderless breadboard. Outside → X-ray (the metal strips under the holes) → one
// clip taken out → strips are nodes (the equivalent circuit) → rules you can check → what the
// metal costs you (contact resistance, stray capacitance) with numbers.

import { tr } from '../../core/i18n';
import { vis } from '../TeardownView';
import type { Teardown } from '../types';

const COLS = 10;
const X = (c: number) => 78 + c * 40; // c = 0..9 → column 1..10
const ROW_Y: Record<string, number> = { a: 110, b: 130, c: 150, d: 170, e: 190, f: 250, g: 270, h: 290, i: 310, j: 330 };
const TOP = ['a', 'b', 'c', 'd', 'e'];
const BOT = ['f', 'g', 'h', 'i', 'j'];
const RAIL = { tp: 40, tn: 62, bp: 378, bn: 400 };
const METAL = '#c9a227';

function Hole({ x, y, part }: { x: number; y: number; part?: string }) {
  return <rect className="bb-hole" x={x - 5} y={y - 5} width={10} height={10} rx={1.5} data-part={part} />;
}

function Figure({ layer }: { layer: number }) {
  const xray = layer >= 1;
  return (
    <g className="bb-fig">
      {/* board body */}
      <rect x={30} y={18} width={440} height={404} rx={12} className="bb-body" data-part="body" style={{ opacity: xray ? 0.35 : 1 }} />
      {/* rail stripes */}
      <line x1={50} y1={RAIL.tp - 14} x2={450} y2={RAIL.tp - 14} stroke="#e63946" strokeWidth={2} />
      <line x1={50} y1={RAIL.bn + 14} x2={450} y2={RAIL.bn + 14} stroke="#2b59c3" strokeWidth={2} />
      <line x1={50} y1={RAIL.tn + 14} x2={450} y2={RAIL.tn + 14} stroke="#2b59c3" strokeWidth={2} opacity={0.5} />
      <line x1={50} y1={RAIL.bp - 14} x2={450} y2={RAIL.bp - 14} stroke="#e63946" strokeWidth={2} opacity={0.5} />
      {/* trench */}
      <rect x={40} y={208} width={420} height={24} className="bb-trench" data-part="trench" />

      {/* ---- metal under the holes (X-ray) ---- */}
      <g className={vis(layer, 1, 4)}>
        {Array.from({ length: COLS }, (_, c) => (
          <g key={c}>
            <rect
              x={X(c) - 8}
              y={ROW_Y.a - 10}
              width={16}
              height={ROW_Y.e - ROW_Y.a + 20}
              rx={4}
              fill={METAL}
              className="bb-strip"
              data-part={c === 4 ? 'strip-top col5' : c === 5 ? 'strip-top6' : 'strip'}
            />
            <rect
              x={X(c) - 8}
              y={ROW_Y.f - 10}
              width={16}
              height={ROW_Y.j - ROW_Y.f + 20}
              rx={4}
              fill={METAL}
              className="bb-strip"
              data-part={c === 4 ? 'strip-bot col5' : 'strip'}
            />
          </g>
        ))}
        {(['tp', 'tn', 'bp', 'bn'] as const).map((r) => (
          <rect key={r} x={X(0) - 10} y={RAIL[r] - 8} width={X(COLS - 1) - X(0) + 20} height={16} rx={6} fill={METAL} className="bb-strip" data-part={`rail-${r} rail`} />
        ))}
      </g>

      {/* holes */}
      {Array.from({ length: COLS }, (_, c) => (
        <g key={c}>
          {TOP.map((r) => (
            <Hole key={r} x={X(c)} y={ROW_Y[r]} part={c === 4 ? 'strip-top col5' : c === 5 ? 'strip-top6' : 'strip'} />
          ))}
          {BOT.map((r) => (
            <Hole key={r} x={X(c)} y={ROW_Y[r]} part={c === 4 ? 'strip-bot col5' : 'strip'} />
          ))}
          {(['tp', 'tn', 'bp', 'bn'] as const).map((r) => (
            <Hole key={r} x={X(c)} y={RAIL[r]} part={`rail-${r} rail`} />
          ))}
          <text x={X(c)} y={ROW_Y.a - 18} className="bb-lbl" textAnchor="middle" data-part="cols">
            {c + 1}
          </text>
          <text x={X(c)} y={ROW_Y.j + 24} className="bb-lbl" textAnchor="middle" data-part="cols">
            {c + 1}
          </text>
        </g>
      ))}
      {[...TOP, ...BOT].map((r) => (
        <text key={r} x={50} y={ROW_Y[r] + 4} className="bb-lbl" textAnchor="middle" data-part="rows">
          {r}
        </text>
      ))}
      <text x={50} y={RAIL.tp + 5} className="bb-lbl plus" textAnchor="middle" data-part="rail-tp rail">
        +
      </text>
      <text x={50} y={RAIL.tn + 5} className="bb-lbl minus" textAnchor="middle" data-part="rail-tn rail">
        −
      </text>
      <text x={50} y={RAIL.bp + 5} className="bb-lbl plus" textAnchor="middle" data-part="rail-bp rail">
        +
      </text>
      <text x={50} y={RAIL.bn + 5} className="bb-lbl minus" textAnchor="middle" data-part="rail-bn rail">
        −
      </text>

      {/* ---- layer 2: one clip pulled out, side view ---- */}
      <g className={vis(layer, 2, 2)}>
        <rect x={60} y={86} width={380} height={270} rx={14} className="td-panel" />
        <text x={250} y={110} textAnchor="middle" className="td-panel-title">
          {tr('一条金属夹片（侧视，拆出来）', 'One metal clip, pulled out (side view)')}
        </text>
        {/* clip: a U-shaped strip with five V-shaped spring pairs */}
        <g data-part="clip">
          <path d="M95 250 L95 300 L405 300 L405 250" fill="none" stroke={METAL} strokeWidth={7} strokeLinejoin="round" />
          {[0, 1, 2, 3, 4].map((k) => {
            const cx = 125 + k * 62;
            return (
              <g key={k}>
                <path d={`M${cx - 20} 296 L${cx - 20} 240 L${cx - 5} 268 L${cx - 5} 296`} fill="none" stroke={METAL} strokeWidth={5} strokeLinejoin="round" />
                <path d={`M${cx + 20} 296 L${cx + 20} 240 L${cx + 5} 268 L${cx + 5} 296`} fill="none" stroke={METAL} strokeWidth={5} strokeLinejoin="round" />
                <text x={cx} y={322} textAnchor="middle" className="bb-lbl">
                  {'abcde'[k]}
                </text>
              </g>
            );
          })}
        </g>
        {/* a lead pushed into hole c */}
        <g data-part="lead">
          <rect x={246} y={150} width={8} height={130} rx={3} fill="#9aa0a6" stroke="#5f626b" />
          <rect x={226} y={128} width={48} height={24} rx={8} fill="#d9b48f" stroke="#8c6a43" />
          <text x={286} y={144} className="bb-lbl">
            {tr('电阻的一只脚', 'a resistor lead')}
          </text>
        </g>
        <g data-part="spring">
          <path d="M231 268 l12 0 M269 268 l-12 0" stroke="#e63946" strokeWidth={2.5} markerEnd="url(#bb-arrow)" />
        </g>
        <defs>
          <marker id="bb-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10z" fill="#e63946" />
          </marker>
        </defs>
        <text x={250} y={346} textAnchor="middle" className="td-small">
          {tr('五对弹片共用一根金属底板 → 五个孔是同一个导体', 'Five spring pairs share one metal base → the five holes are one conductor')}
        </text>
      </g>

      {/* ---- layer 3: strips are nodes ---- */}
      <g className={vis(layer, 3, 3)}>
        {/* the lesson-1 circuit on the board */}
        <g data-part="r1">
          <line x1={X(4)} y1={ROW_Y.c} x2={X(7)} y2={ROW_Y.c} stroke="#8c6a43" strokeWidth={2} />
          <rect x={X(5) - 4} y={ROW_Y.c - 7} width={48} height={14} rx={6} fill="#d9b48f" stroke="#8c6a43" />
          <text x={X(5) + 20} y={ROW_Y.c - 12} textAnchor="middle" className="bb-lbl">
            R 470Ω
          </text>
        </g>
        <g data-part="led">
          <line x1={X(7)} y1={ROW_Y.d} x2={X(9)} y2={ROW_Y.d} stroke="#b83a3a" strokeWidth={2} />
          <circle cx={X(8)} cy={ROW_Y.d} r={9} fill="#ff5a4f" stroke="#b83a3a" />
          <text x={X(8)} y={ROW_Y.d + 24} textAnchor="middle" className="bb-lbl">
            LED
          </text>
        </g>
        <g data-part="n1">
          <rect x={X(7) - 10} y={ROW_Y.a - 12} width={20} height={ROW_Y.e - ROW_Y.a + 24} rx={6} className="bb-node" />
          <text x={X(7)} y={ROW_Y.e + 30} textAnchor="middle" className="bb-node-lbl">
            N1
          </text>
        </g>
        <g data-part="vcc">
          <rect x={X(4) - 10} y={ROW_Y.a - 12} width={20} height={ROW_Y.e - ROW_Y.a + 24} rx={6} className="bb-node vcc" />
          <text x={X(4)} y={ROW_Y.e + 30} textAnchor="middle" className="bb-node-lbl">
            VCC
          </text>
        </g>
      </g>

      {/* ---- layer 4: same node or not ---- */}
      <g className={vis(layer, 4, 4)}>
        <g data-part="pair-yes">
          <circle cx={X(4)} cy={ROW_Y.a} r={9} className="bb-pick yes" />
          <circle cx={X(4)} cy={ROW_Y.e} r={9} className="bb-pick yes" />
        </g>
        <g data-part="pair-col">
          <circle cx={X(6)} cy={ROW_Y.b} r={9} className="bb-pick no" />
          <circle cx={X(7)} cy={ROW_Y.b} r={9} className="bb-pick no" />
        </g>
        <g data-part="pair-trench">
          <circle cx={X(1)} cy={ROW_Y.e} r={9} className="bb-pick no" />
          <circle cx={X(1)} cy={ROW_Y.f} r={9} className="bb-pick no" />
        </g>
        <g data-part="pair-rail">
          <circle cx={X(0)} cy={RAIL.tp} r={9} className="bb-pick yes" />
          <circle cx={X(9)} cy={RAIL.tp} r={9} className="bb-pick yes" />
        </g>
        <g data-part="pair-short">
          <rect x={X(8) - 6} y={ROW_Y.g - 6} width={12} height={ROW_Y.i - ROW_Y.g + 12} rx={6} fill="none" stroke="#b83a3a" strokeWidth={3} strokeDasharray="4 3" />
        </g>
      </g>

      {/* ---- layer 5: what the metal costs ---- */}
      <g className={vis(layer, 5)}>
        <rect x={60} y={86} width={380} height={270} rx={14} className="td-panel" />
        <text x={250} y={110} textAnchor="middle" className="td-panel-title">
          {tr('真实的金属条 = 理想导线 + 小毛病', 'A real strip = an ideal wire + small flaws')}
        </text>
        {/* two adjacent strips with contact R and stray C */}
        <g data-part="rc">
          <line x1={110} y1={170} x2={390} y2={170} stroke={METAL} strokeWidth={8} strokeLinecap="round" />
          <line x1={110} y1={270} x2={390} y2={270} stroke={METAL} strokeWidth={8} strokeLinecap="round" />
          <text x={100} y={174} textAnchor="end" className="bb-lbl">
            {tr('第 5 列', 'col 5')}
          </text>
          <text x={100} y={274} textAnchor="end" className="bb-lbl">
            {tr('第 6 列', 'col 6')}
          </text>
        </g>
        <g data-part="cstray">
          {[170, 250, 330].map((x) => (
            <g key={x} stroke="#2b59c3" strokeWidth={2}>
              <line x1={x} y1={174} x2={x} y2={214} />
              <line x1={x - 12} y1={214} x2={x + 12} y2={214} />
              <line x1={x - 12} y1={224} x2={x + 12} y2={224} />
              <line x1={x} y1={224} x2={x} y2={266} />
            </g>
          ))}
          <text x={345} y={222} className="bb-lbl" fill="#2b59c3">
            C ≈ 2–5 pF
          </text>
        </g>
        <g data-part="rcontact">
          <path d="M150 140 l0 22 M150 140 l-6 -6 l12 -6 l-12 -6 l12 -6 l-6 -6" fill="none" stroke="#b83a3a" strokeWidth={2} />
          <text x={166} y={128} className="bb-lbl" fill="#b83a3a">
            {tr('接触电阻 ≈ 10–50 mΩ', 'contact R ≈ 10–50 mΩ')}
          </text>
        </g>
      </g>
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'breadboard',
    title: tr('面包板 Breadboard：孔下面是什么', 'The breadboard: what is under the holes'),
    subtitle: tr(
      '从外形到金属夹片，再到“每条金属条就是电路里的一个结点（node）”。看懂这一层，以后任何电路都能自己插。',
      'From the outside to the metal clips, then to "every strip is one node of the circuit". Once this clicks you can lay out any circuit yourself.',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'outside',
        short: tr('外形', 'Outside'),
        title: tr('① 外形：一块打满小孔的塑料板', '① Outside: a plastic board full of holes'),
        body: tr(
          `你看到的只有塑料和孔。先认坐标，就像棋盘：
- [[cols|列号 column]]：1、2、3 …（真板子 30 或 60 列）
- [[rows|行号 row]]：a–e 在上半区，f–j 在下半区
- [[trench|中间凹槽 trench]]：把上下两半隔开
- 上下边缘的长排：[[rail-tp|红线 + 轨]] 和 [[rail-tn|蓝线 − 轨]]，叫 **电源轨 power rail**

每个孔有名字：**列号 + 行号**，比如 c5 = 第 5 列、c 行。电源轨的孔叫 tp / tn（top plus / top negative，上方）和 bp / bn（bottom，下方）。`,
          `All you can see is plastic and holes. Learn the coordinates first, like a chessboard:
- [[cols|column numbers]]: 1, 2, 3 … (a real board has 30 or 60)
- [[rows|row letters]]: a–e in the upper half, f–j in the lower half
- [[trench|the centre trench]] separates the two halves
- the long rows along the edges: [[rail-tp|the red + rail]] and [[rail-tn|the blue − rail]], called **power rails**

Every hole has a name: **column + row**, e.g. c5 = column 5, row c. Rail holes are tp / tn (top plus / top negative) and bp / bn (bottom).`,
        ),
        table: {
          head: [tr('区域', 'Area'), tr('孔名', 'Hole names'), tr('用来做什么', 'Used for')],
          rows: [
            [tr('主区上半', 'Upper main area'), 'a1 … e30', tr('插元件的脚', 'component leads')],
            [tr('主区下半', 'Lower main area'), 'f1 … j30', tr('插元件的脚', 'component leads')],
            [tr('中间凹槽', 'Centre trench'), '—', tr('芯片（DIP）横跨它', 'chips (DIP) straddle it')],
            [tr('上方电源轨', 'Top rails'), 'tp1…tp30, tn1…tn30', tr('+ 电源、GND', '+ supply, GND')],
            [tr('下方电源轨', 'Bottom rails'), 'bp1…bp30, bn1…bn30', tr('+ 电源、GND', '+ supply, GND')],
          ],
          parts: ['strip-top', 'strip-bot', 'trench', 'rail-tp', 'rail-bp'],
        },
        callouts: [
          { part: 'rail-tp', label: tr('+ 轨', '+ rail'), x: 440, y: 40, lx: 478, ly: 30 },
          { part: 'trench', label: tr('凹槽', 'trench'), x: 440, y: 220, lx: 478, ly: 220 },
          { part: 'rows', label: tr('行 a–e', 'rows a–e'), x: 50, y: 110, lx: 50, ly: 84, anchor: 'middle' },
        ],
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：孔下面藏着金属条', '② X-ray: metal strips under the holes'),
        body: tr(
          `把塑料变透明，就能看到孔下面的 **金属夹片（metal strip / clip）**。规律只有三条：
1. 主区里每一 **列** 有两条竖着的金属条：[[strip-top|a–e 一条]]，[[strip-bot|f–j 一条]]。
2. 每条 **电源轨** 是一条横着的长金属条：[[rail-tp|tp1 到 tp30 全通]]。
3. 金属条之间互不相连：[[trench|凹槽]] 两边不通，相邻两列不通，红轨和蓝轨不通，上方轨和下方轨也不通。

插在 **同一条金属条** 上的两只脚，就等于用导线连在一起了——这就是面包板不用焊接的秘密。`,
          `Make the plastic transparent and you see the **metal clips (strips)** under the holes. There are only three rules:
1. In the main area every **column** has two vertical strips: [[strip-top|one for a–e]] and [[strip-bot|one for f–j]].
2. Every **power rail** is one long horizontal strip: [[rail-tp|tp1 to tp30 are all joined]].
3. Strips never touch each other: the two sides of the [[trench|trench]] are separate, neighbouring columns are separate, the red and blue rails are separate, and the top and bottom rails are separate.

Two leads in **the same strip** are connected just as if you had soldered a wire between them — that is the whole trick of a solderless breadboard.`,
        ),
        callouts: [
          { part: 'col5', label: tr('第 5 列 a–e：一条', 'col 5, a–e: one strip'), x: X(4), y: ROW_Y.a - 10, lx: X(2), ly: 84 },
          { part: 'rail-tn', label: tr('整条 − 轨', 'the whole − rail'), x: 300, y: RAIL.tn, lx: 478, ly: 84 },
          { part: 'strip-bot', label: tr('第 5 列 f–j：另一条', 'col 5, f–j: another'), x: X(4), y: ROW_Y.j + 10, lx: X(1), ly: 356 },
        ],
      },
      {
        id: 'clip',
        short: tr('夹片', 'Clip'),
        title: tr('③ 拆出一条夹片：弹片夹住引脚', '③ One clip taken out: springs grip the lead'),
        body: tr(
          `把一条 a–e 的夹片拆出来侧着看：一块 [[clip|磷青铜底板]] 上冲出 5 对 V 形 **弹片**，每对对应一个孔。[[lead|元件的脚]] 插进去时把弹片撑开，[[spring|弹片的回弹力]] 从两边夹紧它——这就是电接触。

所以：
- **一个孔只能插一只脚**。两只脚挤一个孔，会把弹片撑坏，接触变差。
- 线径要合适：0.3–0.8 mm（22–29 AWG）。太粗撑坏弹片，太细夹不紧，就会“时好时坏”。
- 插到底：脚只碰到弹片的尖端时，接触电阻会大很多。`,
          `Pull one a–e clip out and look from the side: one [[clip|phosphor-bronze base]] with five pairs of V-shaped **springs**, one pair per hole. A [[lead|component lead]] pushed in spreads the springs, and [[spring|their spring force]] squeezes it from both sides — that is the electrical contact.

So:
- **One lead per hole.** Two leads in one hole bend the springs and the contact gets worse.
- Use the right wire size: 0.3–0.8 mm (22–29 AWG). Too thick bends the springs, too thin is not gripped — the classic "works sometimes" fault.
- Push it all the way in: a lead that only touches the tips of the springs has a much larger contact resistance.`,
        ),
        callouts: [
          { part: 'clip', label: tr('共用的金属底板', 'shared metal base'), x: 405, y: 290, lx: 450, ly: 372 },
          { part: 'spring', label: tr('弹片夹紧', 'springs grip'), x: 269, y: 268, lx: 340, ly: 210 },
        ],
      },
      {
        id: 'nodes',
        short: tr('结点', 'Nodes'),
        title: tr('④ 等效电路：每条金属条 = 一个结点', '④ Equivalent circuit: every strip is one node'),
        body: tr(
          `电路分析里，**结点（node）** 是“电位相同、用导线连在一起的所有点”。面包板上一条金属条正好就是一个结点。所以搭电路时，你的思路应该是：

1. 在原理图上数出有几个结点（VCC、N1、GND …）；
2. 给每个结点分配一条金属条（或一条电源轨）；
3. 把连到这个结点的每只脚插进这条金属条的任意孔。

例子（第 1 课）：[[vcc|第 5 列 a–e 是 VCC]]（用跳线接到 + 轨），[[r1|电阻]] 从第 5 列跨到第 8 列，[[n1|第 8 列 a–e 就是结点 N1]]，[[led|LED]] 的正极也插在第 8 列，所以电阻和 LED 在 N1 相连。

**最常见的错误**：把一个元件的两只脚插在同一列——两只脚在同一个结点上，元件两端电压 $U = 0$，被金属条 **短路** 了。`,
          `In circuit analysis a **node** is "all the points joined by wire, at the same potential". One breadboard strip is exactly one node. So the way to think when you build:

1. count the nodes on the schematic (VCC, N1, GND …);
2. give every node its own strip (or a rail);
3. plug every lead that belongs to that node into any hole of that strip.

Example (lesson 1): [[vcc|column 5, a–e, is VCC]] (jumpered to the + rail), [[r1|the resistor]] spans columns 5 to 8, [[n1|column 8, a–e, is node N1]], and [[led|the LED]]'s anode is in column 8 too — so the resistor and the LED meet at N1.

**The most common mistake**: both leads of one part in the same column. Both leads are then on one node, the voltage across the part is $U = 0$: the strip **shorts it out**.`,
        ),
        callouts: [
          { part: 'vcc', label: 'VCC', x: X(4), y: ROW_Y.a - 12, lx: X(3), ly: 84 },
          { part: 'n1', label: tr('结点 N1', 'node N1'), x: X(7), y: ROW_Y.a - 12, lx: X(8), ly: 84 },
        ],
      },
      {
        id: 'rules',
        short: tr('自测', 'Check'),
        title: tr('⑤ 自己判断：这两个孔通不通？', '⑤ Check yourself: are these two holes connected?'),
        body: tr(
          `把鼠标放在表格的每一行上，图上会圈出那两个孔。先自己判断，再看答案列。`,
          `Hover each row of the table: the picture circles the two holes. Decide first, then read the answer column.`,
        ),
        table: {
          head: [tr('两个孔', 'Two holes'), tr('通吗？', 'Connected?'), tr('为什么', 'Why')],
          rows: [
            ['a5 – e5', tr('✔ 通', '✔ yes'), tr('同一列、同一半：同一条金属条', 'same column, same half: one strip')],
            ['b7 – b8', tr('✘ 不通', '✘ no'), tr('不同列：两条金属条', 'different columns: two strips')],
            ['e2 – f2', tr('✘ 不通', '✘ no'), tr('隔着凹槽：上下两半是两条', 'across the trench: two strips')],
            ['tp1 – tp10', tr('✔ 通', '✔ yes'), tr('同一条电源轨', 'the same rail')],
            [
              tr('电阻插 g9 和 i9', 'resistor in g9 and i9'),
              tr('⚠ 被短路', '⚠ shorted'),
              tr('两只脚在同一个结点，$U_R = 0$，$I_R = 0$', 'both leads on one node: $U_R = 0$, $I_R = 0$'),
            ],
          ],
          parts: ['pair-yes', 'pair-col', 'pair-trench', 'pair-rail', 'pair-short'],
        },
      },
      {
        id: 'cost',
        short: tr('计算', 'Numbers'),
        title: tr('⑥ 算一算：金属条不是完美导线', '⑥ Do the numbers: a strip is not a perfect wire'),
        body: tr(
          `做实验时把金属条当成理想导线，大多数时候没问题。但工程师要知道它“差多少”，才知道什么时候不能忽略：

- [[rcontact|接触电阻]] 每个触点约 10–50 mΩ。一个元件两只脚，串进去约 $2R_c$。接 470 Ω 电阻时误差约 $\\frac{0.1}{470} ≈ 0.02\\%$，完全可以忽略；但如果你用面包板测 0.1 Ω 的电流检测电阻，误差就有几十 %。
- [[cstray|相邻金属条之间的寄生电容]] 约 2–5 pF。它的容抗 $X_C = \\frac{1}{2πfC}$ 随频率下降：1 kHz 时约 50 MΩ（看不见），10 MHz 时只剩约 5 kΩ（信号会“漏”到隔壁一列）。所以 **面包板适合几 MHz 以下** 的电路。
- 电流：每条金属条一般不超过约 1 A，大电流会发热、接触变差。`,
          `Treating a strip as an ideal wire is fine most of the time. An engineer wants to know *how far off* it is, to know when it stops being fine:

- [[rcontact|contact resistance]] is about 10–50 mΩ per contact. A two-lead part adds about $2R_c$ in series. With a 470 Ω resistor that is about $\\frac{0.1}{470} ≈ 0.02\\%$ — negligible; but measure a 0.1 Ω current-sense resistor on a breadboard and the error is tens of per cent.
- [[cstray|stray capacitance between neighbouring strips]] is about 2–5 pF. Its reactance $X_C = \\frac{1}{2πfC}$ falls with frequency: about 50 MΩ at 1 kHz (invisible), only about 5 kΩ at 10 MHz (signal leaks into the next column). So **breadboards are for circuits below a few MHz**.
- Current: keep each strip under about 1 A; more heats the contacts and makes them worse.`,
        ),
        formulas: [
          { tex: 'R_{total} = R + 2R_c', note: tr('两个接触电阻串在元件两端', 'two contact resistances in series with the part') },
          { tex: 'X_C = \\frac{1}{2π f C}', note: tr('C = 3 pF：f = 1 kHz → 53 MΩ；f = 10 MHz → 5.3 kΩ', 'C = 3 pF: f = 1 kHz → 53 MΩ; f = 10 MHz → 5.3 kΩ') },
        ],
        calcs: ['capacitive-reactance', 'series-resistance-contact'],
      },
    ],
    recap: tr(
      '面包板 = 一堆 **结点**：每列的 a–e 是一个，f–j 是一个，每条电源轨是一个。搭电路就是“给原理图上的每个结点分配一条金属条”。',
      'A breadboard is a set of **nodes**: a–e of each column is one, f–j is another, each rail is one. Building a circuit = giving every node of the schematic its own strip.',
    ),
  };
}
