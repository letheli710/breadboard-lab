import { BATTERIES } from '../core/parts';
import { getLang, tr } from '../core/i18n';
import { FigureFrame } from './FigureFrame';
import { Mixed } from './Mixed';

function BoardDiagram() {
  const cols = 12;
  const X = (c: number) => 40 + c * 22;
  const rowsTop = [0, 1, 2, 3, 4].map((r) => 70 + r * 18);
  const rowsBot = [0, 1, 2, 3, 4].map((r) => 180 + r * 18);
  return (
    <FigureFrame label={tr('示意图', 'Diagram')}>
      <svg viewBox="0 0 340 300" className="diagram">
        <rect x="10" y="6" width="320" height="288" rx="10" fill="#f7f2e7" stroke="#1f2a44" strokeWidth="1.5" />
        {/* rails */}
        <rect x={X(0) - 8} y={18} width={X(cols - 1) - X(0) + 16} height={14} rx="7" fill="#e63946" opacity="0.18" />
        <rect x={X(0) - 8} y={36} width={X(cols - 1) - X(0) + 16} height={14} rx="7" fill="#2b59c3" opacity="0.18" />
        <rect x={X(0) - 8} y={258} width={X(cols - 1) - X(0) + 16} height={14} rx="7" fill="#e63946" opacity="0.18" />
        <rect x={X(0) - 8} y={276} width={X(cols - 1) - X(0) + 16} height={14} rx="7" fill="#2b59c3" opacity="0.18" />
        {/* highlighted strips */}
        <rect x={X(3) - 8} y={rowsTop[0] - 8} width={16} height={88} rx="8" fill="#2ba59b" opacity="0.3" />
        <rect x={X(3) - 8} y={rowsBot[0] - 8} width={16} height={88} rx="8" fill="#f4a261" opacity="0.35" />
        <rect x={X(8) - 8} y={rowsTop[0] - 8} width={16} height={88} rx="8" fill="#9b5de5" opacity="0.25" />
        <rect x={20} y={160} width={300} height={10} fill="#e2dacb" />
        {Array.from({ length: cols }, (_, c) => (
          <g key={c}>
            {[25, 43, 265, 283].map((y) => (
              <rect key={y} x={X(c) - 3.5} y={y - 3.5} width={7} height={7} fill="#2f3138" />
            ))}
            {[...rowsTop, ...rowsBot].map((y) => (
              <rect key={y} x={X(c) - 3.5} y={y - 3.5} width={7} height={7} fill="#2f3138" />
            ))}
          </g>
        ))}
        <text x="22" y="29" fontSize="12" fill="#e63946" fontWeight="700">
          +
        </text>
        <text x="22" y="47" fontSize="12" fill="#2b59c3" fontWeight="700">
          −
        </text>
        {['a', 'b', 'c', 'd', 'e'].map((r, i) => (
          <text key={r} x="22" y={rowsTop[i] + 4} fontSize="10" fill="#6b6f7a">
            {r}
          </text>
        ))}
        {['f', 'g', 'h', 'i', 'j'].map((r, i) => (
          <text key={r} x="22" y={rowsBot[i] + 4} fontSize="10" fill="#6b6f7a">
            {r}
          </text>
        ))}
        <text x={X(3)} y={60} fontSize="10" textAnchor="middle" fill="#1f7f77">
          {tr('相通', 'connected')}
        </text>
        <text x={X(3)} y={258 - 8} fontSize="10" textAnchor="middle" fill="#c26a2b">
          {tr('相通', 'connected')}
        </text>
        <text x={X(8)} y={60} fontSize="10" textAnchor="middle" fill="#7a3fc0">
          {tr('另一组', 'another group')}
        </text>
        <text x="170" y="168" fontSize="9" textAnchor="middle" fill="#6b6f7a">
          {tr('中间凹槽：上下两半不相通', 'centre gap: the two halves are NOT connected')}
        </text>
      </svg>
    </FigureFrame>
  );
}

function GroundDiagram() {
  return (
    <FigureFrame label={tr('示意图', 'Diagram')}>
      <svg viewBox="0 0 340 170" className="diagram">
        <g stroke="#1f2a44" strokeWidth="2" fill="none" strokeLinecap="round">
          {/* schematic without battery */}
          <text x="20" y="22" fontSize="12" fill="#1f2a44" stroke="none">
            {tr('原理图常这样画：', 'Schematics often look like this:')}
          </text>
          <line x1="60" y1="40" x2="80" y2="40" />
          <line x1="70" y1="40" x2="70" y2="55" />
          <text x="60" y="35" fontSize="11" fill="#e63946" stroke="none">
            +5V
          </text>
          <polyline points="70,55 70,60 76,63 64,69 76,75 64,81 70,84 70,90" />
          <polygon points="62,95 78,95 70,108" fill="#ff5a4f" />
          <line x1="62" y1="108" x2="78" y2="108" />
          <line x1="70" y1="108" x2="70" y2="122" />
          <line x1="58" y1="122" x2="82" y2="122" />
          <line x1="63" y1="127" x2="77" y2="127" />
          <line x1="67" y1="132" x2="73" y2="132" />
          <text x="90" y="128" fontSize="11" fill="#1d3557" stroke="none">
            GND ⏚
          </text>
          <text x="150" y="70" fontSize="22" fill="#1f2a44" stroke="none">
            ⇒
          </text>
          {/* rails */}
          <rect x="190" y="30" width="135" height="16" rx="8" fill="#e63946" opacity="0.2" stroke="none" />
          <text x="198" y="42" fontSize="11" fill="#e63946" stroke="none">
            {tr('+5V 就是红色 + 轨', '+5V = the red + rail')}
          </text>
          <rect x="190" y="112" width="135" height="16" rx="8" fill="#2b59c3" opacity="0.2" stroke="none" />
          <text x="198" y="124" fontSize="11" fill="#2b59c3" stroke="none">
            {tr('⏚ 就是蓝色 − 轨', '⏚ = the blue − rail')}
          </text>
          <text x="198" y="80" fontSize="10" fill="#555" stroke="none">
            {tr('电源本身接在两条轨之间', 'The supply goes between')}
          </text>
          <text x="198" y="95" fontSize="10" fill="#555" stroke="none">
            {tr('（电池/模块/稳压电源）', 'the rails (battery/PSU)')}
          </text>
        </g>
      </svg>
    </FigureFrame>
  );
}

/** the instrument lessons (challenges/101-…108-…): id, title, what it teaches */
const INSTRUMENT_LESSONS: [string, [string, string], [string, string]][] = [
  [
    'lesson-multimeter',
    ['万用表：测电压', 'Multimeter: voltage'],
    ['红黑表笔、结点电压和元件两端电压、表笔对调变号、悬空', 'red and black probes, node voltage vs voltage across a part, swapped probes, floating points'],
  ],
  [
    'lesson-ammeter',
    ['电流表', 'Ammeter'],
    ['必须串联（断开再接入）、并联会短路、方向、0.1 Ω 内阻', 'in series only (open the path, insert it), parallel shorts the part, direction, 0.1 Ω burden'],
  ],
  [
    'lesson-bench-supply',
    ['稳压电源：CV / CC', 'Bench supply: CV / CC'],
    ['电压和限流两个旋钮、看懂显示屏、当电流源用', 'the voltage and current-limit knobs, reading the display, using it as a current source'],
  ],
  [
    'lesson-generator-scope',
    ['信号发生器和示波器', 'Function generator and scope'],
    ['幅度 / 峰峰值 / 有效值、偏置、周期、时间/格和伏/格', 'amplitude / Vpp / RMS, offset, period, time/div and V/div'],
  ],
  [
    'lesson-generator-load',
    ['信号发生器的 50 Ω 和探头接地', "The generator's 50 Ω and the probe ground"],
    ['50 Ω 输出电阻让波形变小、接地夹只能夹 GND', 'the 50 Ω output resistance shrinks the wave, the ground clip goes on GND only'],
  ],
  ['lesson-scope-two-channels', ['示波器双通道', 'Two scope channels'], ['CH1 / CH2、相位差（谁先到）', 'CH1 / CH2, phase difference (which arrives first)']],
  [
    'lesson-lm358',
    ['LM358 op-amp（运算放大器）', 'LM358 op-amp'],
    ['DIP-8 横跨凹槽、引脚、电源脚、跟随器、单电源输出上限', 'DIP-8 across the trench, pinout, supply pins, follower, single-supply output limit'],
  ],
  [
    'lesson-mcu-gpio',
    ['开发板：供电和 GPIO', 'Dev board: power and GPIO'],
    ['3V3 / 5V / GND、输出点灯、上拉输入读按键、引脚电流上限', '3V3 / 5V / GND, an output driving an LED, a pulled-up input reading a button, pin current limits'],
  ],
  ['lesson-bluepill-pins', ['Blue Pill 的引脚', 'Blue Pill pins'], ['耐 5 V 的 FT 引脚、PC13 只能 3 mA、ADC 引脚', '5 V-tolerant FT pins, PC13 limited to 3 mA, the ADC pins']],
  [
    'lesson-mcu-pwm-adc',
    ['开发板：PWM 和 ADC', 'Dev board: PWM and ADC'],
    ['占空比、万用表读平均值、示波器看方波、ADC 读数', 'duty cycle, the multimeter reads the average, the scope shows the square wave, ADC readings'],
  ],
];

export function Guide() {
  const en = getLang() === 'en';
  return (
    <main id="main" className="guide">
      <div className="guide-hero card">
        <div>
          <div className="eyebrow">
            <Mixed text={tr('知识手册 FIELD GUIDE', 'FIELD GUIDE')} />
          </div>
          <h1>{tr('把原理图搬上面包板', 'From schematic to breadboard')}</h1>
          <p>
            {tr(
              '初学者最困惑的两件事：面包板里面到底怎么连的？电源和 GND（地）怎么接？下面这几张卡片按顺序读一遍，然后去“课程”里亲手试一试。',
              'The two things beginners find most confusing: how is a breadboard wired inside, and how do you hook up power and GND (ground)? Read these cards in order, then try it yourself in "Lessons".',
            )}
          </p>
        </div>
      </div>

      <div className="guide-grid">
        <article className="card concept" id="guide-breadboard">
          <a className="concept-num" href="#/guide/breadboard" title={tr('这一节的链接', 'Link to this section')}>
            01
          </a>
          <h2>
            <Mixed text={tr('面包板内部结构 Breadboard internals', 'Breadboard internals')} />
          </h2>
          <BoardDiagram />
          {en ? (
            <ul>
              <li>
                In each <b>column</b>, the five holes a–e sit on the same metal clip underneath → any legs plugged into them are <b>automatically connected</b>. f–j is a separate
                clip.
              </li>
              <li>
                The centre gap separates the top and bottom halves: e12 and f12 are <b>NOT connected</b>. Chips and push buttons "straddle" the gap.
              </li>
              <li>
                The long strips along the outer edges are the <b>power rails</b>: each one is connected along its whole length. The red line marks +, the blue line marks −.
              </li>
              <li>Only one leg per hole. In the 3D view, hover over a hole to highlight every hole connected to it.</li>
            </ul>
          ) : (
            <ul>
              <li>
                每一<b>列</b>的 a–e 五个孔，底下是同一片金属夹 → 插在里面的脚<b>自动连在一起</b>。f–j 是另一片。
              </li>
              <li>
                中间的凹槽把上下两半隔开：e12 和 f12 <b>不相通</b>。芯片、按键会“骑”在凹槽上。
              </li>
              <li>
                最外侧的长条是<b>电源轨</b>：整条横向相通。红线标 +，蓝线标 −。
              </li>
              <li>一个孔只能插一只脚。在 3D 视图中把鼠标停在孔上，会高亮所有与它相通的孔。</li>
            </ul>
          )}
        </article>

        <article className="card concept" id="guide-ground">
          <a className="concept-num" href="#/guide/ground" title={tr('这一节的链接', 'Link to this section')}>
            02
          </a>
          <h2>
            <Mixed text={tr('GND 到底是什么？What is ground?', 'What is ground (GND)?')} />
          </h2>
          <GroundDiagram />
          {en ? (
            <ul>
              <li>
                Voltage is always a difference <b>between two points</b>. For convenience we pick one point as the "0 V reference", and call it <b>GND (ground)</b>.
              </li>
              <li>
                In a circuit powered by a battery or power supply, GND is simply the <b>negative (−) side of the supply</b>. It does not need to be connected to the actual earth.
              </li>
              <li>
                Schematics often draw several ⏚ symbols — they are <b>all the same node</b>. On the breadboard, every ⏚ goes to the blue − rail.
              </li>
              <li>
                Likewise, labels like "+5V" or "VCC" mean the supply's positive side → connect to the red + rail. Many schematics <b>don't draw the battery at all</b>, only these
                two symbols.
              </li>
              <li>Current through every component must eventually "return" to GND, forming a closed loop — otherwise no current flows.</li>
            </ul>
          ) : (
            <ul>
              <li>
                电压永远是<b>两点之间</b>的差。为了方便，我们选一个点当作“0 V 参考点”，它就叫 <b>GND（地）</b>。
              </li>
              <li>
                在电池/电源供电的电路里，GND 就是<b>电源的负极（−）</b>那一侧。它不需要真的接到大地。
              </li>
              <li>
                原理图里经常画好几个 ⏚ 符号——它们<b>全都是同一个结点</b>。面包板上：所有 ⏚ 都接到蓝色 − 轨。
              </li>
              <li>
                同理，“+5V”“VCC”这类标签都表示电源正极 → 接到红色 + 轨。很多原理图<b>根本不画电池</b>，只画这两个符号。
              </li>
              <li>每个元件的电流最终都要“回到” GND，形成闭合回路（closed loop），否则没有电流。</li>
            </ul>
          )}
        </article>

        <article className="card concept" id="guide-five-steps">
          <a className="concept-num" href="#/guide/five-steps" title={tr('这一节的链接', 'Link to this section')}>
            03
          </a>
          <h2>{tr('从原理图到面包板：五步法', 'Schematic to breadboard in five steps')}</h2>
          {en ? (
            <ol>
              <li>
                <b>Wire the power first</b>: supply + → red rail, supply − → blue rail. (A power module plugs straight into the rails.)
              </li>
              <li>
                <b>Number every node in the schematic</b>: a "node" = a set of points joined by wire (one continuous stretch of line on the schematic).
              </li>
              <li>
                <b>Give each node its own column</b> (a 5-hole metal strip). The VCC node = red rail, the GND node = blue rail.
              </li>
              <li>
                <b>Components bridge two columns</b>: plug each leg into the column of the node it connects to. <i>Never put both legs of one component in the same column</i> —
                that shorts it out.
              </li>
              <li>
                <b>Use jumper wires</b> to connect columns that need power to the + or − rail. Finally, turn on "Node colours" to check: same colour = same node.
              </li>
            </ol>
          ) : (
            <ol>
              <li>
                <b>先接电源</b>：电源 + → 红轨，电源 − → 蓝轨。（用电源模块的话直接插在轨上）
              </li>
              <li>
                <b>给原理图的每个结点编号</b>：一个“结点”= 一组用导线连在一起的点（原理图上一整段连续的线）。
              </li>
              <li>
                <b>每个结点分配一列</b>（5 孔金属片）。VCC 结点 = 红轨，GND 结点 = 蓝轨。
              </li>
              <li>
                <b>元件跨在两列之间</b>：元件的两只脚分别插进它所连接的两个结点的列。<i>千万别把一个元件的两只脚插进同一列</i>——那等于把它短路了。
              </li>
              <li>
                <b>用跳线</b>把需要连到电源轨的列接到 + 轨或 − 轨。最后打开“结点着色”核对：同一颜色 = 同一结点。
              </li>
            </ol>
          )}
          <p className="note">
            {tr(
              '这个应用的“我的电路图”面板会反向工作：根据你在面包板上的接法，实时画出对应的原理图，可以和题目对比。',
              'The "My schematic" panel in this app works in reverse: it draws the schematic for whatever you have built on the breadboard, live, so you can compare it with the task.',
            )}
          </p>
        </article>

        <article className="card concept" id="guide-power">
          <a className="concept-num" href="#/guide/power" title={tr('这一节的链接', 'Link to this section')}>
            04
          </a>
          <h2>
            <Mixed text={tr('电源有哪几种？Power supplies', 'Types of power supply')} />
          </h2>
          <table className="cmp">
            <thead>
              <tr>
                <th>{tr('电源', 'Source')}</th>
                <th>{tr('电压', 'Voltage')}</th>
                <th>{tr('特点', 'Notes')}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(BATTERIES).map(([k, b]) => (
                <tr key={k}>
                  <td>{b.name}</td>
                  <td>{b.voltage} V</td>
                  <td>
                    {tr(`内阻约 ${b.rint} Ω。电流越大，电压掉得越多。`, `Internal resistance ≈ ${b.rint} Ω. The more current you draw, the more the voltage drops.`)}
                    {k === 'CR2032' ? tr('只适合很小的电流（几 mA）。', ' Only suitable for very small currents (a few mA).') : ''}
                  </td>
                </tr>
              ))}
              <tr>
                <td>{tr('面包板电源模块（MB102）', 'Breadboard power module (MB102)')}</td>
                <td>5 V / 3.3 V</td>
                <td>
                  {tr(
                    '直接插在面包板一端，同时给上下两组电源轨供电，用 USB/DC 取电。电压稳定。',
                    'Plugs into one end of the breadboard and powers both the top and bottom rails at once; fed from USB/DC. Stable voltage.',
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  <Mixed text={tr('实验室稳压电源 Bench supply', 'Bench power supply')} />
                </td>
                <td>{tr('0–30 V 可调', '0–30 V adjustable')}</td>
                <td>
                  {tr(
                    '可设定电压（CV）和最大电流（CC）。负载过重或短路时自动限流，是最安全的实验电源。',
                    'You set the voltage (CV) and a maximum current (CC). It limits the current automatically on overload or a short — the safest supply to experiment with.',
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          {en ? (
            <p className="note">
              Batteries have + and − terminals too: battery + goes to the red rail, − to the blue rail, so the battery's negative terminal becomes GND for the whole circuit. Note:{' '}
              <b>when using several supplies together, connect their GNDs to each other (common ground)</b>.
            </p>
          ) : (
            <p className="note">
              电池也有正负极：电池的 + 接红轨，− 接蓝轨，这样电池的负极就成了整个电路的 GND。注意：<b>多个电源一起用时，要把它们的 GND 连在一起（共地）</b>。
            </p>
          )}
        </article>

        <article className="card concept" id="guide-series-parallel">
          <a className="concept-num" href="#/guide/series-parallel" title={tr('这一节的链接', 'Link to this section')}>
            05
          </a>
          <h2>
            <Mixed text={tr('串联与并联 Series vs parallel', 'Series vs parallel')} />
          </h2>
          {en ? (
            <ul>
              <li>
                <b>Series</b>: components joined end to end, one after another. On the breadboard, one component's leg and the next component's leg <b>share a column</b>. The
                current is the same everywhere; the voltage is divided up.
              </li>
              <li>
                <b>Parallel</b>: each component's two ends connect to <b>the same two nodes</b>. On the breadboard, one end of each goes into the same column (or rail) and the
                other ends all go into another column. Every branch has the same voltage.
              </li>
              <li>
                <b>Mixed</b>: first find the group that is in parallel, treat it as one block, then see whether it is in series with the other components.
              </li>
            </ul>
          ) : (
            <ul>
              <li>
                <b>串联</b>：元件首尾相接，一个接一个。在面包板上表现为：前一个元件的脚和后一个元件的脚<b>共用一列</b>。电流处处相同，电压被分掉。
              </li>
              <li>
                <b>并联</b>：几个元件的两端分别接到<b>同样的两个结点</b>。在面包板上：它们的一端都插在同一列（或同一条轨），另一端都插在另一列。每个支路电压相同。
              </li>
              <li>
                <b>混联</b>：先找出并联的那一组，把它当成一个整体，再看它和其他元件是否串联。
              </li>
            </ul>
          )}
        </article>

        <article className="card concept" id="guide-led">
          <a className="concept-num" href="#/guide/led" title={tr('这一节的链接', 'Link to this section')}>
            06
          </a>
          <h2>{tr('LED 与限流电阻', 'LEDs and current-limiting resistors')}</h2>
          {en ? (
            <ul>
              <li>LEDs have a direction: long leg = positive (anode), short leg = negative (cathode). Current only flows from anode to cathode.</li>
              <li>
                When an LED is on, the voltage across it stays roughly fixed (red ≈1.8 V, green ≈2.1 V, blue/white ≈3 V), so you must add a resistor in series to limit the current.
              </li>
              <li>
                Calculation: <code>R = (supply voltage − LED drop) ÷ current</code>. Example: 9 V battery, red LED, target 20 mA → (9 − 1.8) ÷ 0.02 = 360 Ω; pick the nearest
                standard value, 330 Ω or 390 Ω.
              </li>
              <li>The resistor can go on either the anode side or the cathode side — in a series circuit the current is the same everywhere.</li>
            </ul>
          ) : (
            <ul>
              <li>LED 有方向：长脚 = 正极（anode），短脚 = 负极（cathode）。电流只能从正极流到负极。</li>
              <li>LED 导通时两端电压基本固定（红 ≈1.8 V，绿 ≈2.1 V，蓝/白 ≈3 V），所以必须串一个电阻来限制电流。</li>
              <li>
                计算：<code>R = (电源电压 − LED 压降) ÷ 电流</code>。例：9 V 电池、红色 LED、目标 20 mA → (9 − 1.8) ÷ 0.02 = 360 Ω，选最接近的 330 Ω 或 390 Ω。
              </li>
              <li>电阻放在 LED 的正极一侧还是负极一侧都可以——串联电路中电流处处相同。</li>
            </ul>
          )}
        </article>

        <article className="card concept" id="guide-mistakes">
          <a className="concept-num" href="#/guide/mistakes" title={tr('这一节的链接', 'Link to this section')}>
            07
          </a>
          <h2>{tr('新手最常犯的错误', 'Common beginner mistakes')}</h2>
          <ul>
            <li>{tr('元件两只脚插在同一列 → 被短路，完全不起作用。', 'Both legs of a component in the same column → it is shorted out and does nothing.')}</li>
            <li>
              {tr(
                'LED 插反 → 不亮（没有电流）。常见 LED 的反向耐压只有约 5V：低压电路里插反一般不会坏，电源电压更高时就可能损坏。',
                "LED in backwards → it doesn't light (no current flows). A typical LED only tolerates about 5V in reverse: at low supply voltages a reversed LED is usually unharmed, at higher ones it can be damaged.",
              )}
            </li>
            <li>{tr('忘了接 GND / 回路不闭合 → 没有电流。', 'Forgot to connect GND / loop not closed → no current.')}</li>
            <li>{tr('把 + 轨和 − 轨直接连起来 → 短路！电池发烫。', 'Connecting the + rail straight to the − rail → short circuit! The battery gets hot.')}</li>
            <li>{tr('按键没有横跨凹槽，或者方向转了 90° → 一直导通或一直断开。', "Push button not straddling the gap, or rotated 90° → it's always on or always off.")}</li>
            <li>{tr('LED 不串电阻 → 电流过大烧坏。', 'LED without a series resistor → too much current burns it out.')}</li>
            <li>
              {tr(
                '以为上下两组电源轨是相通的（其实要用跳线连起来，或者用电源模块同时供电）。',
                "Assuming the top and bottom pairs of power rails are connected (they aren't — link them with jumper wires, or use a power module that feeds both).",
              )}
            </li>
          </ul>
          <p className="note">
            {tr('这些错误在“诊断”面板里都会被自动检测并给出提示。', 'The "Diagnostics" panel detects all of these mistakes automatically and gives you hints.')}
          </p>
        </article>

        <article className="card concept" id="guide-basics">
          <a className="concept-num" href="#/guide/basics" title={tr('这一节的链接', 'Link to this section')}>
            08
          </a>
          <h2>{tr('电压、电流、电阻', 'Voltage, current, resistance')}</h2>
          {en ? (
            <ul>
              <li>
                <b>Voltage V</b> (volts): the "pressure difference" that pushes charge, like a difference in water level. Always measured between two points.
              </li>
              <li>
                <b>Current I</b> (amps): how much charge flows past per second, like the rate of water flow. The same everywhere in a series circuit.
              </li>
              <li>
                <b>Resistance R</b> (ohms): how much something resists current, like a narrower pipe.
              </li>
              <li>
                <b>Ohm's law</b>: V = I × R. Click any hole with the "Multimeter" tool to read that point's voltage relative to GND.
              </li>
            </ul>
          ) : (
            <ul>
              <li>
                <b>电压 V</b>（伏特）：推动电荷的“压力差”，像水位高低差。永远在两点之间测量。
              </li>
              <li>
                <b>电流 I</b>（安培）：每秒流过的电荷量，像水流量。串联电路处处相同。
              </li>
              <li>
                <b>电阻 R</b>（欧姆）：阻碍电流的程度，像水管变细。
              </li>
              <li>
                <b>欧姆定律</b>：V = I × R。用“万用表”工具点任意孔，可以读出该点对 GND 的电压。
              </li>
            </ul>
          )}
        </article>

        <article className="card concept" id="guide-instruments">
          <a className="concept-num" href="#/guide/instruments" title={tr('这一节的链接', 'Link to this section')}>
            09
          </a>
          <h3>{tr('仪器怎么用', 'Using the instruments')}</h3>
          <p>
            {tr(
              '第 1–5 期的实验都要你自己读仪表、填读数。每种仪器都有一节分步课程，做实验之前先做一遍：',
              'Every lab in phases 1–5 asks you to read the instruments yourself and type the readings. Each instrument has a step-by-step lesson; do it before the labs:',
            )}
          </p>
          <ul>
            {INSTRUMENT_LESSONS.map(([id, zh, en]) => (
              <li key={id}>
                <a href={`#/learn/${id}`}>{tr(...zh)}</a>
                {tr('：', ': ')}
                {tr(...en)}
              </li>
            ))}
          </ul>
          <p className="note">
            {tr(
              '每节课最后会说明仿真仪器和真实仪器的区别（输入电阻、负担电阻、50 Ω 输出、探头……）。',
              'Each lesson ends by saying how the simulated instrument differs from a real one (input resistance, burden resistance, 50 Ω output, probes…).',
            )}
          </p>
        </article>
      </div>
    </main>
  );
}
