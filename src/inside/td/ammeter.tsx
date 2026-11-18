// Teardown: the ammeter = the multimeter on its current ranges. Front (dial on mA, which jack) →
// X-ray (fuse, shunt resistor, the same millivolt ADC across the shunt) → the shunt principle and
// the range table → equivalent circuit (ideal ammeter in series with R_shunt, 0.1 Ω in the sim)
// and the burden voltage → why it goes in series (open the path, insert it) and the sign →
// what happens in parallel (it shorts the part; numbers from lesson 10) → several ammeters at one
// node (the KCL lab) and the limits of a real meter.

import './instruments.css';
import { tr } from '../../core/i18n';
import { sub, vis } from '../TeardownView';
import type { ReactNode } from 'react';
import type { Teardown } from '../types';
import { Batt, Circ, Defs, Dot, Gnd, JACK, MeterFront, Res } from './multimeter';

/** a fuse: a small box with the wire running through it, between two points (vertical or horizontal) */
function Fuse({ x1, y1, x2, y2, part }: { x1: number; y1: number; x2: number; y2: number; part?: string }) {
  const v = x1 === x2;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  return (
    <g data-part={part}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="tdp-line" />
      <rect x={v ? cx - 7 : cx - 16} y={v ? cy - 16 : cy - 7} width={v ? 14 : 32} height={v ? 32 : 14} rx={3} className="tdp-fill" />
      <line x1={v ? cx : cx - 16} y1={v ? cy - 16 : cy} x2={v ? cx : cx + 16} y2={v ? cy + 16 : cy} className="tdp-line" style={{ strokeWidth: 1.2 }} />
    </g>
  );
}

/** an LED pointing down between y1 (anode) and y2 (cathode) */
function Led({ x, y1, y2, part, off }: { x: number; y1: number; y2: number; part?: string; off?: boolean }) {
  const m = (y1 + y2) / 2;
  return (
    <g data-part={part} style={{ opacity: off ? 0.45 : 1 }}>
      <path d={`M${x} ${y1} V${m - 12} M${x} ${m + 10} V${y2}`} className="tdp-line" />
      <polygon points={`${x - 13},${m - 12} ${x + 13},${m - 12} ${x},${m + 10}`} className="tdp-fill" style={{ fill: off ? '#fffdf8' : '#ff8b8b' }} />
      <line x1={x - 13} y1={m + 10} x2={x + 13} y2={m + 10} className="tdp-line" />
      {!off && <path d={`M${x + 16} ${m - 6} l10 -8 M${x + 18} ${m + 4} l10 -8`} className="tdp-plus" />}
    </g>
  );
}

const Panel = ({ title }: { title: ReactNode }) => (
  <>
    <rect x={20} y={20} width={520} height={400} rx={14} className="td-panel" />
    <text x={280} y={48} textAnchor="middle" className="td-panel-title">
      {title}
    </text>
  </>
);

/* ------------------------------------------------------------------ x-ray of the current ranges */

function Xray() {
  return (
    <g>
      <g data-part="adc">
        <rect x={240} y={138} width={100} height={42} rx={7} className="ins-block" />
        <text x={290} y={164} textAnchor="middle" className="ins-block-t">
          ADC ±200 mV
        </text>
        <path d="M250 213 V180 M320 213 V180" className="ins-meas" />
      </g>
      <line x1={290} y1={138} x2={290} y2={126} className="tdp-line" markerEnd="url(#am-ah)" data-part="lcd" />
      <path d={`M${JACK.v + 12} ${JACK.y} H330 V330`} className="ins-red" data-part="jack-v" />
      <Fuse x1={330} y1={330} x2={330} y2={270} part="fuse" />
      <path d="M330 270 V220" className="tdp-line" />
      <Res x1={330} y1={220} x2={235} y2={220} part="shunt" />
      <text x={282} y={246} textAnchor="middle" className="tdp-lbl" data-part="shunt">
        {sub('R_sh')}
      </text>
      <text x={344} y={304} className="tdp-lbl" data-part="fuse">
        F 0.2 A
      </text>
      <path d={`M${JACK.a10 - 12} ${JACK.y} H150 V330`} className="ins-red" data-part="jack-a10" />
      <Fuse x1={150} y1={330} x2={150} y2={270} part="fuse10" />
      <path d="M150 270 V220" className="tdp-line" />
      <Res x1={150} y1={220} x2={235} y2={220} part="shunt10" />
      <text x={192} y={204} textAnchor="middle" className="td-small" data-part="shunt10">
        0.01 Ω
      </text>
      <text x={136} y={304} textAnchor="end" className="tdp-lbl" data-part="fuse10">
        F 10 A
      </text>
      <path d={`M${JACK.com - 12} ${JACK.y} H205 V250 H235 V220`} className="tdp-line" data-part="jack-com" />
      <Dot x={235} y={220} part="jack-com" />
      <path d="M318 340 V300" className="ins-cur" markerEnd="url(#am-ahg)" data-part="current" />
    </g>
  );
}

/* ------------------------------------------------------------------ the shunt principle */

function Shunt() {
  return (
    <g>
      <Panel title={tr('电流档：电流流过已知的小电阻，量它两端的毫伏', 'Current range: a known small resistor, read its millivolts')} />
      <g data-part="jack-v">
        <circle cx={60} cy={150} r={6} className="tdp-fill" />
        <text x={60} y={134} textAnchor="middle" className="tdp-lbl">
          {tr('VΩmA（红）', 'VΩmA (red)')}
        </text>
      </g>
      <Fuse x1={66} y1={150} x2={150} y2={150} part="fuse" />
      <text x={108} y={178} textAnchor="middle" className="td-small" data-part="fuse">
        {tr('保险丝', 'fuse')}
      </text>
      <path d="M150 150 H190 M370 150 H494" className="tdp-line" />
      <Res x1={190} y1={150} x2={370} y2={150} part="shunt" body={70} />
      <text x={280} y={128} textAnchor="middle" className="tdp-lbl" data-part="shunt">
        {sub(tr('分流电阻 R_{sh} = 10 Ω（20 mA 档）', 'shunt R_{sh} = 10 Ω (20 mA range)'))}
      </text>
      <Dot x={190} y={150} />
      <Dot x={370} y={150} />
      <g data-part="jack-com">
        <circle cx={500} cy={150} r={6} className="tdp-fill" />
        <text x={500} y={134} textAnchor="middle" className="tdp-lbl">
          {tr('COM（黑）', 'COM (black)')}
        </text>
      </g>
      <g data-part="current">
        <path d="M76 104 H150" className="ins-cur" markerEnd="url(#am-ahg)" />
        <text x={76} y={96} className="ins-cur-t">
          I = 7.1 mA
        </text>
      </g>
      <g data-part="us">
        <path d="M196 186 H364" className="ins-meas" markerStart="url(#am-ahp)" markerEnd="url(#am-ahp)" />
        <text x={280} y={206} textAnchor="middle" className="ins-meas-t">
          {sub('V_sh = 7.1 mA × 10 Ω = 71 mV')}
        </text>
      </g>
      <g data-part="adc">
        <path d="M190 150 V290 H232 M370 150 V290 H328" className="ins-meas" />
        <rect x={232} y={262} width={96} height={56} rx={8} className="ins-block" />
        <text x={280} y={288} textAnchor="middle" className="ins-block-t">
          ADC
        </text>
        <text x={280} y={306} textAnchor="middle" className="td-small">
          {tr('毫伏表', 'millivoltmeter')}
        </text>
      </g>
      <line x1={328} y1={290} x2={384} y2={290} className="tdp-line" markerEnd="url(#am-ah)" data-part="lcd" />
      <g data-part="lcd">
        <rect x={388} y={262} width={130} height={56} rx={6} className="ins-lcd" />
        <text x={396} y={276} className="ins-lcd-s">
          DC 20mA
        </text>
        <text x={478} y={308} textAnchor="end" className="ins-lcd-t" style={{ fontSize: 26 }}>
          7.10
        </text>
        <text x={482} y={308} className="ins-lcd-s">
          mA
        </text>
      </g>
      <g data-part="formula">
        <text x={40} y={360} className="tdp-lbl">
          {sub('I = V_sh / R_sh = 71 mV / 10 Ω = 7.1 mA')}
        </text>
        <text x={40} y={384} className="td-small">
          {tr('每个量程都让满量程电流在分流电阻上产生 200 mV：', 'every range makes its full-scale current produce 200 mV across its shunt:')}
        </text>
        <text x={40} y={402} className="td-small">
          2 mA × 100 Ω = 20 mA × 10 Ω = 200 mA × 1 Ω = 10 A × 0.01 Ω = 200 mV
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ equivalent circuit */

function Equiv() {
  return (
    <g>
      <Panel title={tr('等效电路：电流表 vs 电压表', 'Equivalent circuits: ammeter vs voltmeter')} />
      <rect x={40} y={70} width={230} height={318} rx={10} className="ins-xbox" data-part="ammeter" />
      <text x={155} y={92} textAnchor="middle" className="ins-xbox-t">
        {tr('电流表（串联用）', 'ammeter (goes in series)')}
      </text>
      <g data-part="ammeter">
        <circle cx={120} cy={112} r={6} className="tdp-fill" />
        <text x={132} y={116} className="tdp-lbl" style={{ fill: '#e63946' }}>
          + {tr('红', 'red')}
        </text>
        <path d="M120 118 V168 M120 212 V246 M120 334 V364" className="tdp-line" />
        <circle cx={120} cy={370} r={6} className="tdp-fill" />
        <text x={132} y={374} className="tdp-lbl">
          COM {tr('黑', 'black')}
        </text>
      </g>
      <Circ x={120} y={190} t="A" part="ideal-a" />
      <text x={150} y={186} className="td-small" data-part="ideal-a">
        {tr('理想电流表', 'ideal ammeter')}
      </text>
      <text x={150} y={202} className="td-small" data-part="ideal-a">
        {tr('电阻 = 0', 'resistance = 0')}
      </text>
      <Res x1={120} y1={246} x2={120} y2={334} part="shunt" />
      <text x={136} y={286} className="tdp-lbl" data-part="shunt">
        {sub('R_sh')}
      </text>
      <text x={136} y={304} className="td-small" data-part="shunt">
        {tr('仿真 0.1 Ω', 'sim: 0.1 Ω')}
      </text>
      <g data-part="burden">
        <path d="M96 252 V328" className="ins-meas" markerStart="url(#am-ahp)" />
        <text x={88} y={282} textAnchor="end" className="ins-meas-t">
          I·R
        </text>
      </g>

      <rect x={300} y={70} width={220} height={318} rx={10} className="ins-xbox" data-part="voltmeter" />
      <text x={410} y={92} textAnchor="middle" className="ins-xbox-t">
        {tr('电压表（并联用）', 'voltmeter (goes in parallel)')}
      </text>
      <g data-part="voltmeter">
        <circle cx={330} cy={112} r={6} className="tdp-fill" />
        <circle cx={330} cy={370} r={6} className="tdp-fill" />
        <path d="M330 118 V140 H470 V200 M470 310 V340 H330 V364 M390 140 V218 M390 262 V340" className="tdp-line" />
        <Circ x={390} y={240} t="V" />
        <Res x1={470} y1={200} x2={470} y2={310} />
        <text x={484} y={250} className="tdp-lbl">
          {sub('R_in')}
        </text>
        <text x={484} y={266} className="td-small">
          10 MΩ
        </text>
      </g>
      <text x={280} y={408} textAnchor="middle" className="td-small" data-part="burden">
        {tr('负担电压 = 7.1 mA × 0.1 Ω = 0.71 mV（电路里其他电压的万分之一）', 'burden voltage = 7.1 mA × 0.1 Ω = 0.71 mV (1/10 000 of the other voltages)')}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ in series (lesson 10) */

function Lesson({ mode }: { mode: 'series' | 'parallel' }) {
  const par = mode === 'parallel';
  return (
    <g>
      <Panel
        title={
          par
            ? tr('错误接法：电流表并联在 LED 两端', 'The mistake: the ammeter across the LED')
            : tr('正确接法：断开电路，把电流表串进断口', 'The right way: open the path and put the ammeter in the gap')
        }
      />
      <g data-part="circuit">
        <Batt x={70} yTop={140} yBot={340} />
        <text x={46} y={244} textAnchor="end" className="tdp-lbl">
          9 V
        </text>
        <path d={`M70 140 V100 H${par ? 400 : 180} M300 100 H400 M400 100 V112`} className="tdp-line" />
        <Res x1={400} y1={112} x2={400} y2={210} />
        <text x={416} y={156} className="tdp-lbl">
          R1
        </text>
        <text x={416} y={172} className="td-small">
          1 kΩ
        </text>
        <path d="M400 340 V380 H70 V340" className="tdp-line" />
        <path d="M230 380 V390" className="tdp-line" />
        <Gnd x={230} y={390} />
      </g>
      <Led x={400} y1={210} y2={340} part="led" off={par} />
      <text x={par ? 372 : 432} y={270} textAnchor={par ? 'end' : 'start'} className="td-small" data-part="led">
        LED
      </text>
      <text x={par ? 372 : 432} y={286} textAnchor={par ? 'end' : 'start'} className="td-small" data-part="led">
        1.8 V + 12 Ω
      </text>
      <Dot x={400} y={210} />
      {!par && (
        <g>
          <path d="M180 100 Q240 50 300 100" className="ins-dash" data-part="jumper" />
          <text x={240} y={66} textAnchor="middle" className="td-small" data-part="jumper">
            {tr('拔掉的黄色跳线', 'the yellow jumper, removed')}
          </text>
          <path d="M180 100 H218" className="ins-red" data-part="probe-red" />
          <path d="M262 100 H300" className="ins-black" data-part="probe-black" />
          <Circ x={240} y={100} t="A" part="ammeter" />
          <Dot x={180} y={100} />
          <Dot x={300} y={100} />
          <text x={180} y={124} textAnchor="middle" className="td-small" data-part="probe-red">
            {tr('红 +', 'red +')}
          </text>
          <text x={300} y={124} textAnchor="middle" className="td-small" data-part="probe-black">
            {tr('黑 COM', 'black COM')}
          </text>
          <g data-part="current">
            <path d="M110 86 H170" className="ins-cur" markerEnd="url(#am-ahg)" />
            <path d="M420 300 V330" className="ins-cur" markerEnd="url(#am-ahg)" />
            <text x={110} y={78} className="ins-cur-t">
              I = 7.1 mA
            </text>
          </g>
          <g data-part="calc">
            <text x={110} y={206} className="tdp-lbl">
              {tr('I = (9 − 1.8) V / (1000 + 12 + 0.1) Ω', 'I = (9 − 1.8) V / (1000 + 12 + 0.1) Ω')}
            </text>
            <text x={110} y={226} className="tdp-lbl">
              ≈ 7.1 mA
            </text>
            <text x={110} y={254} className="td-small">
              {tr('红黑对调：读数 −7.1 mA', 'leads swapped: reads −7.1 mA')}
            </text>
            <text x={110} y={272} className="td-small">
              {tr('（电流没变，参考方向反了）', '(same current, opposite reference)')}
            </text>
          </g>
        </g>
      )}
      {par && (
        <g>
          <path d="M400 210 H480 V248 M480 292 V340 H400" className="tdp-line" data-part="ammeter" />
          <Circ x={480} y={270} t="A" part="ammeter" />
          <Dot x={400} y={340} />
          <g data-part="current">
            <path d="M440 196 H470 V226" className="ins-cur" markerEnd="url(#am-ahg)" />
            <text x={500} y={232} className="ins-cur-t">
              9.0 mA
            </text>
            <path d="M110 86 H170" className="ins-cur" markerEnd="url(#am-ahg)" />
            <text x={110} y={78} className="ins-cur-t">
              I ≈ 9.0 mA
            </text>
          </g>
          <g data-part="led">
            <line x1={384} y1={258} x2={416} y2={290} className="ins-bad" />
            <line x1={416} y1={258} x2={384} y2={290} className="ins-bad" />
          </g>
          <g data-part="calc">
            <text x={110} y={190} className="tdp-lbl">
              {tr('LED 两端 = 9 mA × 0.1 Ω = 0.9 mV', 'across the LED = 9 mA × 0.1 Ω = 0.9 mV')}
            </text>
            <text x={110} y={208} className="td-small">
              {tr('< 1.8 V，LED 不亮，电流全走电流表', '< 1.8 V: the LED is off, all current goes through the meter')}
            </text>
            <text x={110} y={236} className="tdp-lbl">
              I = 9 V / (1000 + 0.1) Ω ≈ 9.0 mA
            </text>
            <text x={110} y={254} className="td-small">
              {tr('读到的不是 LED 的电流，而是短路后的电流', 'not the LED current — the current after the short')}
            </text>
          </g>
          <g data-part="danger">
            <text x={110} y={300} className="ins-bad-t">
              {tr('更糟：直接并在电池两端', 'Worse: straight across the battery')}
            </text>
            <text x={110} y={318} className="ins-bad-t">
              I = 9 V / (1.5 + 0.1) Ω ≈ 5.6 A
            </text>
            <text x={110} y={336} className="td-small">
              {tr('真表：200 mA 保险丝立刻熔断', 'real meter: the 200 mA fuse blows')}
            </text>
          </g>
        </g>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ the KCL lab */

function Kcl() {
  const reading = (x: number, y: number, t: string, part: string) => (
    <text x={x} y={y} className="ins-cur-t" data-part={part}>
      {t}
    </text>
  );
  return (
    <g>
      <Panel title={tr('实验 201：一个结点、三块电流表（KCL）', 'Lab 201: one node, three ammeters (KCL)')} />
      <g data-part="circuit">
        <Batt x={60} yTop={150} yBot={330} />
        <text x={40} y={244} textAnchor="end" className="tdp-lbl">
          9 V
        </text>
        <path d="M60 150 V100 H128 M172 100 H190 M290 100 H450 V148 M320 100 V148 M320 192 V210 M450 192 V210 M320 300 V360 M450 300 V360 H60 V330" className="tdp-line" />
        <Res x1={190} y1={100} x2={290} y2={100} />
        <text x={240} y={84} textAnchor="middle" className="tdp-lbl">
          R1 330 Ω
        </text>
        <Res x1={320} y1={210} x2={320} y2={300} />
        <text x={336} y={260} className="tdp-lbl">
          R2 1 kΩ
        </text>
        <Res x1={450} y1={210} x2={450} y2={300} />
        <text x={466} y={260} className="tdp-lbl">
          R3 2.2 kΩ
        </text>
        <path d="M200 360 V372" className="tdp-line" />
        <Gnd x={200} y={372} />
      </g>
      <Dot x={320} y={100} part="node" />
      <text x={320} y={88} textAnchor="middle" className="tdp-lbl" data-part="node">
        N
      </text>
      <Circ x={150} y={100} r={20} t="A" part="am1" />
      <Circ x={320} y={170} r={20} t="A" part="am2" />
      <Circ x={450} y={170} r={20} t="A" part="am3" />
      {reading(118, 140, 'AM1 8.84 mA', 'am1')}
      {reading(346, 166, 'AM2', 'am2')}
      {reading(346, 182, '6.08 mA', 'am2')}
      {reading(476, 166, 'AM3', 'am3')}
      {reading(476, 182, '2.76 mA', 'am3')}
      <g data-part="kcl">
        <text x={40} y={400} className="tdp-lbl">
          {tr('8.84 = 6.08 + 2.76 mA：流进 N = 流出 N', '8.84 = 6.08 + 2.76 mA: into N = out of N')}
        </text>
        <text x={40} y={414} className="td-small">
          {tr('三块表一共只加了 0.2 Ω（路径上两块），对 1017.5 Ω 是 0.02 %', 'the meters add only 0.2 Ω on any path — 0.02 % of 1017.5 Ω')}
        </text>
      </g>
    </g>
  );
}

function Figure({ layer }: { layer: number }) {
  return (
    <g>
      <Defs id="am" />
      <g className={vis(layer, 0, 1)}>
        <MeterFront sel={5} red="v" reading="7.10" mode="DC  mA" xray={layer >= 1} />
      </g>
      <g className={vis(layer, 1, 1)}>
        <Xray />
      </g>
      <g className={vis(layer, 2, 2)}>
        <Shunt />
      </g>
      <g className={vis(layer, 3, 3)}>
        <Equiv />
      </g>
      <g className={vis(layer, 4, 4)}>
        <Lesson mode="series" />
      </g>
      <g className={vis(layer, 5, 5)}>
        <Lesson mode="parallel" />
      </g>
      <g className={vis(layer, 6)}>
        <Kcl />
      </g>
    </g>
  );
}

export default function build(): Teardown {
  return {
    id: 'ammeter',
    title: tr('电流表：一个很小的电阻 + 一块毫伏表', 'Ammeter: a tiny resistor plus a millivoltmeter'),
    subtitle: tr(
      'ammeter（电流表）不是另一台仪器，而是同一块万用表拨到电流档。它里面没有“直接数电子”的东西：电流流过一个已知的小电阻，表量这个电阻两端的电压，再用欧姆定律换算成电流。从这一点出发，就能推出“为什么必须串联”和“并联为什么会短路”。',
      'An ammeter is not a different instrument: it is the same multimeter with the dial on a current range. Nothing inside counts electrons; the current flows through a known small resistor, the meter reads the voltage across it, and Ohm’s law turns that into a current. From this one fact follow "why it must go in series" and "why in parallel it is a short".',
    ),
    viewBox: '0 0 560 440',
    Figure,
    layers: [
      {
        id: 'front',
        short: tr('面板', 'Front'),
        title: tr('① 面板：拨到 mA，红表笔看电流大小选插孔', '① Front: dial on mA, the red lead’s jack depends on the size of the current'),
        body: tr(
          `还是那块万用表，只改两件事：
1. [[pos-ma|拨盘转到 mA]]（或 [[pos-a|10A]]）；
2. 红表笔插对插孔：电流 ≤ 200 mA 插 [[jack-v|VΩmA]]，更大的电流插 [[jack-a10|10A]]。黑表笔照旧在 [[jack-com|COM]]。

[[lcd|显示屏]] 上的数是 **从红表笔流进表、从黑表笔流出的电流**。

不知道电流有多大时，**先用 10A 孔和 10A 档**，读数小于 200 mA 再换到 mA。顺序反过来，几安培的电流会直接冲进 mA 档，熔断里面的保险丝。

本课程的实验电流都是几 mA 到几十 mA，用 mA 档。仿真里的电流表是一个单独的元件（AM1、AM2 …），相当于一块固定在 mA 档的表。`,
          `The same multimeter, with two changes:
1. [[pos-ma|turn the dial to mA]] (or [[pos-a|10A]]);
2. put the red lead in the right jack: ≤ 200 mA in [[jack-v|VΩmA]], anything larger in [[jack-a10|10A]]. The black lead stays in [[jack-com|COM]].

The number on the [[lcd|display]] is **the current flowing into the meter at the red lead and out at the black lead**.

If you don't know how big the current is, **start with the 10A jack and the 10A range**, and move to mA only if it reads below 200 mA. The other way round, amps rush into the mA range and blow its fuse.

The labs in this course draw a few mA to a few tens of mA — the mA range. In the simulator the ammeter is a part of its own (AM1, AM2 …), like a meter fixed on mA.`,
        ),
        table: {
          head: [tr('拨盘', 'Dial'), tr('红表笔插', 'Red lead in'), tr('最大电流', 'Max current'), tr('里面的分流电阻', 'Shunt inside'), tr('保护', 'Protection')],
          rows: [
            ['mA', 'VΩmA', '200 mA', tr('1 Ω … 100 Ω（看量程）', '1 Ω … 100 Ω (per range)'), tr('200 mA 快熔保险丝', '200 mA fast fuse')],
            ['10A', '10A', '10 A', '0.01 Ω', tr('10 A 保险丝；> 2 A 时每次 ≤ 10 s', '10 A fuse; above 2 A, ≤ 10 s at a time')],
            [tr('DCV（量完记得换回）', 'DCV (switch back after!)'), 'VΩmA', '—', tr('10 MΩ 分压器', '10 MΩ divider'), '—'],
          ],
          parts: ['pos-ma', 'pos-a', 'pos-dcv'],
        },
        callouts: [
          { part: 'dial', label: tr('拨到 mA', 'dial on mA'), x: 196, y: 240, lx: 100, ly: 170 },
          { part: 'jack-v', label: tr('红：≤ 200 mA', 'red: ≤ 200 mA'), x: 310, y: 352, lx: 374, ly: 300, anchor: 'start' },
          { part: 'jack-a10', label: tr('红：大电流', 'red: big currents'), x: 160, y: 356, lx: 100, ly: 300 },
        ],
      },
      {
        id: 'xray',
        short: tr('X 光', 'X-ray'),
        title: tr('② X 光：保险丝 → 分流电阻 → COM，ADC 量电阻两端', '② X-ray: fuse → shunt → COM, the ADC reads across the shunt'),
        body: tr(
          `电流档里，电流走的路是一条实实在在的金属通路：
[[jack-v|VΩmA]] → [[fuse|保险丝 F 0.2 A]] → [[shunt|分流电阻（shunt）]] → [[jack-com|COM]]。

**分流电阻**（shunt resistor）是一个阻值很准、温度变化小的小电阻（锰铜合金）。电流流过它，两端出现一个小电压，**还是那颗 [[adc|±200 mV 的 ADC]]** 去量它——和电压档用的是同一颗芯片。

10A 插孔有自己的一条路：[[fuse10|10 A 保险丝]] → [[shunt10|0.01 Ω 的粗分流电阻]] → COM。

[[fuse|保险丝]] 是为“接错”准备的：如果把电流档直接并到电源上，几安培的电流会烧坏分流电阻和电路板，保险丝先断开，保护表。真实的表保险丝断了以后，电流档读数永远是 0——量电流读到 0 而电路明明在工作，先查保险丝。`,
          `On a current range the current takes a real metal path:
[[jack-v|VΩmA]] → [[fuse|fuse F 0.2 A]] → [[shunt|shunt resistor]] → [[jack-com|COM]].

The **shunt** is a small resistor with an accurate value that barely changes with temperature (manganin). The current through it makes a small voltage, and **the same [[adc|±200 mV ADC]]** reads it — the very chip the volts range uses.

The 10A jack has its own path: [[fuse10|a 10 A fuse]] → [[shunt10|a thick 0.01 Ω shunt]] → COM.

The [[fuse|fuse]] is there for mistakes: put a current range straight across a supply and amps would burn the shunt and the board; the fuse opens first. Once it has blown, the current range always reads 0 — if an ammeter reads 0 while the circuit is clearly working, check the fuse.`,
        ),
        table: {
          head: [tr('部件', 'Part'), tr('作用', 'Job'), tr('典型值', 'Typical')],
          rows: [
            [tr('保险丝（mA 路）', 'fuse (mA path)'), tr('过流时熔断，保护表', 'opens on overcurrent'), '200 mA / 250 V, ≈ 0.5 Ω'],
            [tr('分流电阻 $R_{sh}$', 'shunt $R_{sh}$'), tr('把电流变成电压', 'turns current into voltage'), '1 Ω … 100 Ω'],
            ['ADC', tr('量 $R_{sh}$ 两端的毫伏', 'reads the mV across $R_{sh}$'), '±200 mV'],
            [tr('10 A 分流电阻', '10 A shunt'), tr('大电流用的粗电阻', 'a thick one for big currents'), '0.01 Ω'],
          ],
          parts: ['fuse', 'shunt', 'adc', 'shunt10'],
        },
      },
      {
        id: 'shunt',
        short: tr('分流电阻', 'Shunt'),
        title: tr('③ 原理：I = V / R，倒过来用欧姆定律', '③ The principle: I = V / R, Ohm’s law used backwards'),
        body: tr(
          `表并不直接量电流，它做的是：
1. 让被测电流 $I$ [[current|全部流过]] 一个已知电阻 [[shunt|$R_{sh}$]]；
2. 用 [[adc|毫伏表（ADC）]] 量出 [[us|$R_{sh}$ 两端的电压]] $V_{sh}$；
3. 显示 $I = \\frac{V_{sh}}{R_{sh}}$。

用第 10 课的电流代数字（20 mA 量程，$R_{sh}$ = 10 Ω）：
$$V_{sh} = I R_{sh} = 7.1 mA × 10 Ω = 71 mV$$
ADC 读到 71 mV，[[lcd|显示屏]] 显示 $\\frac{71 mV}{10 Ω} = 7.10 mA$。

**量程是怎么来的**：ADC 满量程是 200 mV，所以每个量程的分流电阻都选成“满量程电流 × $R_{sh}$ = 200 mV”。量程越大，$R_{sh}$ 越小：`,
          `The meter never measures current directly. It:
1. makes the current $I$ [[current|flow entirely through]] a known resistor [[shunt|$R_{sh}$]];
2. reads [[us|the voltage across it]], $V_{sh}$, with the [[adc|millivoltmeter (ADC)]];
3. displays $I = \\frac{V_{sh}}{R_{sh}}$.

With lesson 10's current (20 mA range, $R_{sh}$ = 10 Ω):
$$V_{sh} = I R_{sh} = 7.1 mA × 10 Ω = 71 mV$$
The ADC reads 71 mV and the [[lcd|display]] shows $\\frac{71 mV}{10 Ω} = 7.10 mA$.

**Where the ranges come from**: the ADC's full scale is 200 mV, so each range's shunt is chosen so that full-scale current × $R_{sh}$ = 200 mV. Bigger range, smaller $R_{sh}$:`,
        ),
        table: {
          head: [tr('量程', 'Range'), tr('分流电阻 $R_{sh}$', 'Shunt $R_{sh}$'), tr('满量程时 $V_{sh}$', '$V_{sh}$ at full scale'), tr('7.1 mA 时 $V_{sh}$', '$V_{sh}$ at 7.1 mA')],
          rows: [
            ['2 mA', '100 Ω', '200 mV', tr('超量程 OL', 'over range, OL')],
            ['20 mA', '10 Ω', '200 mV', '71 mV'],
            ['200 mA', '1 Ω', '200 mV', '7.1 mV'],
            ['10 A', '0.01 Ω', '100 mV', '0.071 mV'],
          ],
          parts: [null, 'shunt', 'shunt', null],
        },
        formulas: [
          { tex: 'I = \\frac{V_{sh}}{R_{sh}}', note: tr('电流表的全部原理', 'the whole principle of an ammeter') },
          { tex: 'R_{sh} = \\frac{200 mV}{I_{full scale}}', note: tr('每个量程的分流电阻', 'the shunt of each range') },
        ],
        calcs: ['ohm', 'ammeter-burden'],
      },
      {
        id: 'equiv',
        short: tr('等效电路', 'Model'),
        title: tr('④ 等效电路：理想电流表串联一个小电阻', '④ Equivalent circuit: an ideal ammeter in series with a small resistor'),
        body: tr(
          `把上一层装回去，从两个表笔看进去，电流档的表等效为 **串联** 的两样东西：
- [[ideal-a|理想电流表（ideal ammeter）]]：读出流过它的电流，**自身电阻为 0**（相当于一根导线）；
- [[shunt|分流电阻 $R_{sh}$]]（加上保险丝和表笔的电阻）：真实的表必须有的那一点电阻。仿真里固定为 **0.1 Ω**。

和电压表正好相反（右边对比）：[[voltmeter|电压表]] 希望自己的电阻 **无穷大**，这样并上去不分走电流；[[ammeter|电流表]] 希望自己的电阻 **为 0**，这样串进去不分走电压。

电流表两端的电压叫 **负担电压**（burden voltage）：
$$V_{burden} = I R_{sh} = 7.1 mA × 0.1 Ω = 0.71 mV$$
第 10 课让你用万用表量这个电压、再用 $R = \\frac{V}{I}$ 反算出 0.1 Ω——这就是在“量电流表的等效电路”。

真实万用表的 mA 档 $R_{sh}$ 加保险丝有几欧到十几欧。比如 10 Ω：负担电压 71 mV，电流变成 $\\frac{7.2 V}{1022 Ω} = 7.05 mA$，比不接表时小 1 %。`,
          `Put it back together. Seen from the two leads, a meter on a current range is two things **in series**:
- an [[ideal-a|ideal ammeter]]: reads the current through it and has **zero resistance** (a piece of wire);
- the [[shunt|shunt $R_{sh}$]] (plus fuse and lead resistance): the bit of resistance a real meter must have. In the simulator it is fixed at **0.1 Ω**.

The exact opposite of a voltmeter (compare on the right): a [[voltmeter|voltmeter]] wants **infinite** resistance so that it takes no current when placed across; an [[ammeter|ammeter]] wants **zero** resistance so that it takes no voltage when placed in the path.

The voltage across an ammeter is its **burden voltage**:
$$V_{burden} = I R_{sh} = 7.1 mA × 0.1 Ω = 0.71 mV$$
Lesson 10 has you measure this voltage with the multimeter and work back to 0.1 Ω with $R = \\frac{V}{I}$ — you are measuring the ammeter's equivalent circuit.

A real meter's mA range has a few to over ten ohms with its fuse. Say 10 Ω: 71 mV of burden, and the current becomes $\\frac{7.2 V}{1022 Ω} = 7.05 mA$ — 1 % less than without the meter.`,
        ),
        table: {
          head: ['', tr('电流表', 'Ammeter'), tr('电压表', 'Voltmeter')],
          rows: [
            [tr('量什么', 'measures'), tr('流过一条路径的电流', 'current along a path'), tr('两点之间的电压', 'voltage between two points')],
            [tr('怎么接', 'connection'), tr('**串联**：断开、插入', '**series**: open, insert'), tr('**并联**：直接点上', '**parallel**: just touch')],
            [tr('理想内阻', 'ideal resistance'), '0', '∞'],
            [tr('仿真 / 真实', 'sim / real'), '0.1 Ω / 1–15 Ω', '∞ / 10 MΩ'],
            [tr('接错会怎样', 'wrong connection'), tr('并联 → 短路被测元件', 'parallel → shorts the part'), tr('串联 → 电路几乎断开', 'series → the circuit is almost opened')],
          ],
          parts: [null, 'ammeter', 'shunt', 'shunt', 'ammeter'],
        },
        formulas: [
          { tex: 'V_{burden} = I R_{sh}', note: tr('电流表“吃掉”的电压', 'the voltage the ammeter eats') },
          { tex: 'I_{with meter} = \\frac{V_s - V_{LED}}{R_1 + R_{LED} + R_{sh}}', note: tr('第 10 课：$R_{sh}$ 串进了回路', 'lesson 10: $R_{sh}$ joins the loop') },
        ],
        calcs: ['ammeter-burden', 'series-resistance'],
      },
      {
        id: 'series',
        short: tr('串联', 'Series'),
        title: tr('⑤ 为什么必须串联：电流要“全部”流过表', '⑤ Why series: all of the current must pass through the meter'),
        body: tr(
          `表只量 **流过自己** 的电流。要量一条支路的电流，就得让这条支路的电流 **一点不少地全部** 走进表——唯一的办法是：
1. 在要测的地方 **断开** 电路（第 10 课：[[jumper|拔掉那根黄色跳线]]）；
2. 把表的两个表笔 **接进断口**：[[probe-red|红表笔]] 接电流来的那一边（电池 + 那边），[[probe-black|黑表笔]] 接电流去的那一边（R1 那边）；
3. 这时电流只有一条路：电池 → 红表笔 → 表 → 黑表笔 → R1 → LED → GND。

一步步算 [[current|这条回路的电流]]（LED 模型 = 1.8 V + 12 Ω）：
$$I = \\frac{9 V - 1.8 V}{1000 Ω + 12 Ω + 0.1 Ω} = \\frac{7.2 V}{1012.1 Ω} ≈ 7.1 mA$$
有表和没表只差 0.1 Ω，电流从 7.1146 mA 变成 7.1139 mA——看不出来。

**方向 / 符号**：读数的定义是“从红表笔流进去的电流”。把红黑对调，电流还是从电池 + 流出，但它现在从黑表笔流进表，读数变成 **−7.1 mA**。负号不是错，是在告诉你：实际电流方向和你选的 **参考方向**（reference direction）相反。`,
          `A meter only measures the current **through itself**. To measure a branch current, **every bit** of that branch's current must go through the meter — and the only way is:
1. **open** the circuit where you want to measure (lesson 10: [[jumper|pull out the yellow jumper]]);
2. **connect the meter across the gap**: the [[probe-red|red lead]] on the side the current comes from (the battery + side), the [[probe-black|black lead]] on the side it goes to (the R1 side);
3. now the current has only one path: battery → red lead → meter → black lead → R1 → LED → GND.

Work out [[current|the loop current]] step by step (LED model = 1.8 V + 12 Ω):
$$I = \\frac{9 V - 1.8 V}{1000 Ω + 12 Ω + 0.1 Ω} = \\frac{7.2 V}{1012.1 Ω} ≈ 7.1 mA$$
With and without the meter differ by 0.1 Ω: 7.1146 mA becomes 7.1139 mA — invisible.

**Direction / sign**: the reading is defined as "the current flowing in at the red lead". Swap red and black: the current still leaves the battery's +, but now enters the meter at the black lead, so the reading becomes **−7.1 mA**. The minus sign is not an error: the real current is opposite to the **reference direction** you chose.`,
        ),
        formulas: [
          {
            tex: 'I = \\frac{V_{bat} - V_{F}}{R_1 + R_{LED} + R_{sh}} = \\frac{9 - 1.8}{1012.1} ≈ 7.1 mA',
            note: tr('第 10 课的电流，$R_{sh}$ 只占 0.01 %', 'lesson 10’s current; $R_{sh}$ is 0.01 % of the loop'),
          },
        ],
        calcs: ['led-resistor', 'ohm'],
      },
      {
        id: 'parallel',
        short: tr('接错', 'Mistake'),
        title: tr('⑥ 并联会怎样：0.1 Ω 把元件短路了', '⑥ What parallel does: 0.1 Ω shorts the part'),
        body: tr(
          `第 10 课故意做一次错误示范：把 [[ammeter|电流表]] 并在 [[led|LED]] 两端。用等效电路就能算出会发生什么：
1. LED 和 0.1 Ω 并联。要让 LED 导通，它两端至少要 1.8 V；而 0.1 Ω 两端只要有 1.8 V，就要流 18 A——不可能。所以 **电流全走电流表**，LED 两端只剩
$$V = 9 mA × 0.1 Ω = 0.9 mV < 1.8 V$$
LED 熄灭；
2. 回路里只剩 R1 和 0.1 Ω：
$$I = \\frac{9 V}{1000 Ω + 0.1 Ω} ≈ 9.0 mA$$
3. 表读到 [[current|9.0 mA]]——这 **不是** LED 原来的电流（7.1 mA），而是“LED 被短路以后”的电流。

**更危险的情况**：[[danger|直接并在电池两端]]，回路里只有电池内阻 1.5 Ω 和表的 0.1 Ω：
$$I = \\frac{9 V}{1.5 Ω + 0.1 Ω} ≈ 5.6 A;  P_{R_{sh}} = I^{2} R_{sh} = 5.6^{2} × 0.1 ≈ 3.2 W$$
真实的表：200 mA 保险丝瞬间熔断（没有保险丝，分流电阻就烧了）。仿真里不会烧，只会把元件短路，诊断面板会提醒你。`,
          `Lesson 10 makes the mistake on purpose: the [[ammeter|ammeter]] across the [[led|LED]]. The equivalent circuit tells you what happens:
1. the LED is in parallel with 0.1 Ω. To conduct, the LED needs at least 1.8 V; 1.8 V across 0.1 Ω would mean 18 A — impossible. So **all the current goes through the meter** and the LED is left with
$$V = 9 mA × 0.1 Ω = 0.9 mV < 1.8 V$$
— it goes dark;
2. the loop is now just R1 and 0.1 Ω:
$$I = \\frac{9 V}{1000 Ω + 0.1 Ω} ≈ 9.0 mA$$
3. the meter reads [[current|9.0 mA]] — **not** the LED's current (7.1 mA) but the current after the LED was shorted.

**Worse**: [[danger|straight across the battery]], the loop holds only the battery's 1.5 Ω and the meter's 0.1 Ω:
$$I = \\frac{9 V}{1.5 Ω + 0.1 Ω} ≈ 5.6 A;  P_{R_{sh}} = I^{2} R_{sh} = 5.6^{2} × 0.1 ≈ 3.2 W$$
A real meter: the 200 mA fuse blows instantly (without a fuse, the shunt burns). The simulator burns nothing; it shorts the part and the diagnostics warn you.`,
        ),
        table: {
          head: [tr('接法', 'Connection'), tr('LED', 'LED'), tr('表的读数', 'Reading'), tr('意义', 'Meaning')],
          rows: [
            [tr('串在跳线处（正确）', 'in the jumper gap (right)'), tr('亮', 'on'), '7.1 mA', tr('LED 的电流', 'the LED current')],
            [tr('串联，红黑对调', 'series, leads swapped'), tr('亮', 'on'), '−7.1 mA', tr('同一电流，参考方向反', 'same current, reversed reference')],
            [tr('并在 LED 两端（错）', 'across the LED (wrong)'), tr('灭', 'off'), '9.0 mA', tr('短路后的电流', 'current after the short')],
            [tr('并在电池两端（危险）', 'across the battery (danger)'), '—', '5.6 A', tr('烧保险丝', 'blows the fuse')],
          ],
          parts: ['ammeter', 'ammeter', 'led', 'danger'],
        },
        calcs: ['ohm', 'power'],
      },
      {
        id: 'kcl',
        short: tr('多块表 / 局限', 'Many meters / limits'),
        title: tr('⑦ 一个结点三块表（KCL），以及真实电流表的局限', '⑦ Three meters at one node (KCL), and the limits of a real ammeter'),
        body: tr(
          `实验 201 在结点 [[node|N]] 的三条支路里各串一块表：[[am1|AM1]] 量流进 N 的电流，[[am2|AM2]]、[[am3|AM3]] 量流出的电流。先算：
1. $R_2 ∥ R_3 = \\frac{1k × 2.2k}{3.2k} = 687.5 Ω$，总电阻 $330 + 687.5 = 1017.5 Ω$；
2. $I_1 = \\frac{9 V}{1017.5 Ω} ≈ 8.84 mA$，$V_N = 8.84 mA × 687.5 Ω ≈ 6.08 V$；
3. $I_2 = \\frac{6.08 V}{1 kΩ} = 6.08 mA$，$I_3 = \\frac{6.08 V}{2.2 kΩ} = 2.76 mA$；
4. [[kcl|6.08 + 2.76 = 8.84]]：流进 = 流出（KCL）。

每条路径上串了两块表，只多了 0.2 Ω，相对 1017.5 Ω 是 0.02 %，可以忽略。**表多不怕，只要每块都串在自己的支路里。**某块表读到负数，说明它的红黑和实际电流方向相反——KCL 写成代数和照样成立：$-I_1 + I_2 + I_3 = 0$。

真实电流表比仿真多出的几件事，见下表。`,
          `Lab 201 puts a meter in each of the three branches at node [[node|N]]: [[am1|AM1]] reads the current into N, [[am2|AM2]] and [[am3|AM3]] the currents out. Predict first:
1. $R_2 ∥ R_3 = \\frac{1k × 2.2k}{3.2k} = 687.5 Ω$, total $330 + 687.5 = 1017.5 Ω$;
2. $I_1 = \\frac{9 V}{1017.5 Ω} ≈ 8.84 mA$, $V_N = 8.84 mA × 687.5 Ω ≈ 6.08 V$;
3. $I_2 = \\frac{6.08 V}{1 kΩ} = 6.08 mA$, $I_3 = \\frac{6.08 V}{2.2 kΩ} = 2.76 mA$;
4. [[kcl|6.08 + 2.76 = 8.84]]: in = out (KCL).

Every path now has two meters in it — 0.2 Ω more, 0.02 % of 1017.5 Ω: negligible. **Many meters are fine, as long as each sits in series in its own branch.** A negative reading means that meter's red/black is opposite to the real current; written as an algebraic sum KCL still holds: $-I_1 + I_2 + I_3 = 0$.

What a real ammeter adds compared with the simulator:`,
        ),
        table: {
          head: [tr('项目', 'Item'), tr('真实万用表', 'Real meter'), tr('仿真', 'Simulator')],
          rows: [
            [tr('内阻 / 负担电压', 'resistance / burden'), tr('mA 档 1–15 Ω，几十到几百 mV', 'mA range 1–15 Ω, tens to hundreds of mV'), '0.1 Ω'],
            [tr('并联在电源上', 'across a supply'), tr('保险丝熔断', 'fuse blows'), tr('元件被短路 + 诊断提示', 'part shorted + a diagnostic')],
            [tr('10 A 档', '10 A range'), tr('内阻小，但小电流读不准（最后一位 10 mA）', 'low resistance, but poor for small currents (last digit 10 mA)'), '—'],
            [tr('换档', 'changing range'), tr('换档时电路会短暂断开', 'the circuit opens briefly while switching'), '—'],
            [tr('交流电流', 'AC current'), tr('有效值，频率有限', 'RMS, limited frequency'), tr('直流读数', 'DC reading')],
          ],
          parts: ['am1', 'am2', null, null, null],
        },
        formulas: [{ tex: '-I_1 + I_2 + I_3 = 0', note: tr('KCL，读数带符号', 'KCL with signed readings') }],
        calcs: ['current-divider', 'parallel-resistance'],
      },
    ],
    recap: tr(
      '电流表 = 理想电流表串联一个小电阻 $R_{sh}$（仿真 0.1 Ω）。它量的是 $R_{sh}$ 两端的毫伏，再算 $I = V_{sh}/R_{sh}$。因为电阻小，它必须串进断口；并联就等于用导线把元件短路。读数是“从红表笔流进去的电流”，接反为负。',
      'An ammeter = an ideal ammeter in series with a small resistor $R_{sh}$ (0.1 Ω in the sim). It reads the millivolts across $R_{sh}$ and computes $I = V_{sh}/R_{sh}$. Because its resistance is tiny it must go into a gap in series; in parallel it shorts the part like a wire. The reading is the current flowing in at the red lead; reversed, it is negative.',
    ),
  };
}
