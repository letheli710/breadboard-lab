// Layer "01 2D 无源 vs 有源低通/高通/带通切换原理图": one live schematic for the five topologies of
// the lesson (passive RC low / high pass, inverting active low / high pass, the cascaded active
// band pass) and act 7's design problem, a 10 kΩ load R_L that can be plugged onto the output, the
// virtual ground highlight, and E12 sliders for the low-pass family (passive R = R_f, C = C_f).
// Below it, the readout of the topology: pass-band gain, corner(s), what the load does.
// During the guided design (mode 'design') the parts and results it asks for read "?" until the
// example reaches them (dReveal).

import type { ReactNode } from 'react';
import { BENCH_NAMES } from '../../benchNames';
import { AHPF, BPF, DESIGN, fmtC, fmtDb, fmtHz, fmtK, fmtR, fmtV, HPF, metrics, MODE_LABEL, type Mode, RL, toDb, VOH } from './model';
import { Cell, hoverProps, type Lab, masked, PartSlider, Seg, Toggle, useClearHoverOnUnmount, useIsLit, useLab } from './state';

const SUPPLY = `${BENCH_NAMES.supply}（±9 V）`;

/* ------------------------------------------------------------- symbols */

function zigH(x1: number, x2: number, y: number) {
  const n = 6;
  const a = x1 + 6;
  const b = x2 - 6;
  const pts = [`${x1},${y}`, `${a},${y}`];
  for (let i = 0; i < n; i++) pts.push(`${a + ((i + 0.5) * (b - a)) / n},${y + (i % 2 ? 9 : -9)}`);
  pts.push(`${b},${y}`, `${x2},${y}`);
  return pts.join(' ');
}
function zigV(x: number, y1: number, y2: number) {
  const n = 6;
  const a = y1 + 6;
  const b = y2 - 6;
  const pts = [`${x},${y1}`, `${x},${a}`];
  for (let i = 0; i < n; i++) pts.push(`${x + (i % 2 ? 9 : -9)},${a + ((i + 0.5) * (b - a)) / n}`);
  pts.push(`${x},${b}`, `${x},${y2}`);
  return pts.join(' ');
}

function Part({ id, children, title }: { id: string; children: ReactNode; title?: string }) {
  const on = useIsLit()(id);
  return (
    <g className={`w59-part ${on}`} {...hoverProps([id])} tabIndex={0} aria-label={title}>
      {children}
    </g>
  );
}

function Wire({ d, cls = '' }: { d: string; cls?: string }) {
  return <path d={d} className={`w59-wire ${cls}`} />;
}

function ResH({ id, x1, x2, y, label, cls = 'r', ly = -16 }: { id: string; x1: number; x2: number; y: number; label: string; cls?: string; ly?: number }) {
  return (
    <Part id={id} title={label}>
      <polyline points={zigH(x1, x2, y)} className={`w59-el ${cls}`} />
      <rect x={x1} y={y - 14} width={x2 - x1} height={28} className="w59-hit" />
      <text x={(x1 + x2) / 2} y={y + ly} className={`w59-t mid tag ${cls}`}>
        {label}
      </text>
    </Part>
  );
}

function ResV({ id, x, y1, y2, label, cls = 'r', dashed }: { id: string; x: number; y1: number; y2: number; label: string; cls?: string; dashed?: boolean }) {
  return (
    <Part id={id} title={label}>
      <polyline points={zigV(x, y1, y2)} className={`w59-el ${cls} ${dashed ? 'off' : ''}`} />
      <rect x={x - 14} y={y1} width={28} height={y2 - y1} className="w59-hit" />
      <text x={x + 16} y={(y1 + y2) / 2 + 4} className={`w59-t tag ${cls} ${dashed ? 'off' : ''}`}>
        {label}
      </text>
    </Part>
  );
}

/** a series capacitor (plates vertical) between x1 and x2 */
function CapH({ id, x1, x2, y, label, ly = -20 }: { id: string; x1: number; x2: number; y: number; label: string; ly?: number }) {
  const m = (x1 + x2) / 2;
  return (
    <Part id={id} title={label}>
      <path d={`M${x1} ${y}H${m - 5}M${m + 5} ${y}H${x2}`} className="w59-wire" />
      <path d={`M${m - 5} ${y - 13}V${y + 13}M${m + 5} ${y - 13}V${y + 13}`} className="w59-el c" />
      <rect x={x1} y={y - 16} width={x2 - x1} height={32} className="w59-hit" />
      <text x={m} y={y + ly} className="w59-t mid tag c">
        {label}
      </text>
    </Part>
  );
}

/** a shunt capacitor (plates horizontal) between y1 and y2 */
function CapV({ id, x, y1, y2, label }: { id: string; x: number; y1: number; y2: number; label: string }) {
  const m = (y1 + y2) / 2;
  return (
    <Part id={id} title={label}>
      <path d={`M${x} ${y1}V${m - 5}M${x} ${m + 5}V${y2}`} className="w59-wire" />
      <path d={`M${x - 15} ${m - 5}H${x + 15}M${x - 15} ${m + 5}H${x + 15}`} className="w59-el c" />
      <rect x={x - 16} y={y1} width={32} height={y2 - y1} className="w59-hit" />
      <text x={x + 20} y={m + 4} className="w59-t tag c">
        {label}
      </text>
    </Part>
  );
}

function Gnd({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 11} ${y}H${x + 11}M${x - 7} ${y + 4}H${x + 7}M${x - 3} ${y + 8}H${x + 3}`} className="w59-gnd" />;
}

function Dot({ x, y, cls = '' }: { x: number; y: number; cls?: string }) {
  return <circle cx={x} cy={y} r={3.6} className={`w59-dot ${cls}`} />;
}

/** a sine source between (x, yTop) and (x, yBot) */
function Source({ x, yTop, yBot, label = 'Vi' }: { x: number; yTop: number; yBot: number; label?: string }) {
  const m = (yTop + yBot) / 2;
  return (
    <Part id="sch_vi" title="输入信号 Vi">
      <path d={`M${x} ${yTop}V${m - 17}M${x} ${m + 17}V${yBot}`} className="w59-wire" />
      <circle cx={x} cy={m} r={17} className="w59-src" />
      <path d={`M${x - 9} ${m}c3 -9 6 -9 9 0s6 9 9 0`} className="w59-sine" />
      <text x={x - 24} y={m + 5} className="w59-t end src">
        {label}
      </text>
    </Part>
  );
}

function OutTerm({ x, y, yGnd }: { x: number; y: number; yGnd?: number }) {
  return (
    <Part id="sch_vo" title="输出 Vo">
      <circle cx={x} cy={y} r={4.5} className="w59-term" />
      {yGnd !== undefined && <circle cx={x} cy={yGnd} r={4.5} className="w59-term" />}
      <text x={x + 10} y={yGnd !== undefined ? (y + yGnd) / 2 + 5 : y + 5} className="w59-t vo">
        Vo
      </text>
    </Part>
  );
}

/** an inverting op-amp stage: input element(s) ending at the summing node xN, LM358 triangle, feedback Rf (∥ Cf) */
function InvStage({
  xIn,
  xN,
  y,
  tw = 80,
  input,
  fb,
  labels,
  ids,
  vg,
  compact,
}: {
  xIn: number;
  xN: number;
  y: number;
  tw?: number;
  input: 'r' | 'cr';
  fb: 'r' | 'rc';
  labels: { ri: string; ci?: string; rf: string; cf?: string };
  ids: { ri: string; ci?: string; rf: string; cf?: string; vg: string; op: string };
  vg: boolean;
  compact?: boolean;
}) {
  const left = xN + (compact ? 22 : 34);
  const tip = left + tw;
  const xO = tip + (compact ? 18 : 30);
  const yRf = y - (compact ? 40 : 52);
  const yCf = y - (compact ? 80 : 98);
  const h = tw / 2;
  const vgOn = useIsLit()(ids.vg);
  const ciEnd = input === 'cr' ? xIn + (compact ? 30 : 36) : xIn;
  return (
    <g>
      {input === 'cr' && <CapH id={ids.ci!} x1={xIn} x2={ciEnd} y={y} label={labels.ci!} ly={28} />}
      <ResH id={ids.ri} x1={ciEnd + 4} x2={xN - 10} y={y} label={labels.ri} ly={compact ? -14 : -16} />
      <Wire d={`M${ciEnd} ${y}H${ciEnd + 4}M${xN - 10} ${y}H${left}`} />
      {/* feedback */}
      <Wire d={`M${xN} ${y}V${fb === 'rc' ? yCf : yRf}M${xO} ${fb === 'rc' ? yCf : yRf}V${y + h / 2}`} />
      <Wire d={`M${xN} ${yRf}H${xN + 18}M${xO - 18} ${yRf}H${xO}`} />
      <ResH id={ids.rf} x1={xN + 18} x2={xO - 18} y={yRf} label={labels.rf} />
      {fb === 'rc' && (
        <>
          <Wire d={`M${xN} ${yCf}H${(xN + xO) / 2 - 18}M${(xN + xO) / 2 + 18} ${yCf}H${xO}`} />
          <CapH id={ids.cf!} x1={(xN + xO) / 2 - 18} x2={(xN + xO) / 2 + 18} y={yCf} label={labels.cf!} />
        </>
      )}
      {/* op amp */}
      <Part id={ids.op} title="LM358（±9 V）">
        <polygon points={`${left},${y - h / 2} ${left},${y + h * 1.5} ${tip},${y + h / 2}`} className="w59-opamp" />
        <text x={left + 6} y={y + 5} className="w59-t sign">
          −
        </text>
        <text x={left + 6} y={y + h + 5} className="w59-t sign">
          +
        </text>
        {!compact && (
          <>
            <text x={left + tw * 0.42} y={y + h / 2 + 4} className="w59-t small mid">
              LM358
            </text>
            <path d={`M${left + tw / 2} ${y}V${y - 16}M${left + tw / 2} ${y + h}V${y + h + 16}`} className="w59-rail" />
            <text x={left + tw / 2 + 4} y={y - 8} className="w59-t rail p">
              +9 V
            </text>
            <text x={left + tw / 2 + 4} y={y + h + 18} className="w59-t rail n">
              −9 V
            </text>
          </>
        )}
      </Part>
      <Wire d={`M${left} ${y + h}H${left - 12}V${y + h + 26}`} />
      <Gnd x={left - 12} y={y + h + 26} />
      <Wire d={`M${tip} ${y + h / 2}H${xO}`} />
      <Dot x={xO} y={y + h / 2} />
      {/* virtual ground */}
      <g className={`w59-part ${vgOn}`} {...hoverProps([ids.vg])} tabIndex={0} aria-label="虚地节点">
        {vg && <circle cx={xN} cy={y} r={13} className="w59-vg-halo" />}
        <circle cx={xN} cy={y} r={4.6} className="w59-dot vg" />
        {vg && !compact && (
          <text x={xN} y={y + 26} className="w59-t mid vgt">
            虚地 0 V
          </text>
        )}
      </g>
      <Dot x={xN} y={yRf} />
    </g>
  );
}

/* ------------------------------------------------------------- the topologies */

function PassiveSvg({ lab, hp }: { lab: Lab; hp: boolean }) {
  const yT = 80;
  const yB = 205;
  const xC = 270;
  const xL = 410;
  const r = hp ? HPF.r : lab.parts.rf;
  const c = hp ? HPF.c : lab.parts.cf;
  const m = metrics(hp ? 'phpf' : 'plpf', lab.parts, lab.load);
  return (
    <>
      <Source x={60} yTop={yT} yBot={yB} />
      <Wire d={`M60 ${yT}H110M200 ${yT}H560M60 ${yB}H560`} />
      {hp ? <CapH id="sch_c" x1={110} x2={200} y={yT} label={`C = ${fmtC(c)}`} /> : <ResH id="sch_r" x1={110} x2={200} y={yT} label={`R = ${fmtR(r)}`} />}
      {hp ? <ResV id="sch_r" x={xC} y1={yT} y2={yB} label={`R = ${fmtR(r)}`} /> : <CapV id="sch_c" x={xC} y1={yT} y2={yB} label={`C = ${fmtC(c)}`} />}
      <Dot x={xC} y={yT} />
      <Dot x={xC} y={yB} />
      <ResV id="sch_rl" x={xL} y1={yT} y2={yB} label={lab.load ? 'RL = 10 kΩ' : 'RL 未接'} cls="rl" dashed={!lab.load} />
      {lab.load && (
        <>
          <Dot x={xL} y={yT} />
          <Dot x={xL} y={yB} />
        </>
      )}
      <Gnd x={300} y={yB + 4} />
      <OutTerm x={560} y={yT} yGnd={yB} />
      <Part id="sch_thev" title="戴维南等效">
        <rect x={300} y={14} width={326} height={36} rx={8} className={`w59-thev ${lab.load ? 'bad' : ''}`} />
        <text x={463} y={37} className="w59-t mid eq">
          {lab.load
            ? hp
              ? `R∥RL = ${fmtR(m.rth!)} → fc 升到 ${fmtHz(m.fc[0])}`
              : `Vth = ${(RL / (r + RL)).toFixed(4)} Vi · Rth = ${fmtR(m.rth!)} → fc ${fmtHz(m.fc[0])}`
            : `空载 Io = 0：${hp ? 'R、C' : 'R、C'} 只做分压，fc = ${fmtHz(m.fc[0])}`}
        </text>
      </Part>
      <text x={20} y={30} className="w59-t vtitle">
        {hp ? '无源一阶 RC 高通' : '无源一阶 RC 低通'}
      </text>
      <text x={20} y={250} className="w59-t small">
        {hp ? '电容隔直通交：直流被阻断，高频全额落在 R 上' : '电容对高频短路：高频被旁路入地，低频输出'}
      </text>
    </>
  );
}

function ActiveSvg({ lab, hp, design }: { lab: Lab; hp: boolean; design?: boolean }) {
  const y = 150;
  const p = design ? { ri: DESIGN.ri, rf: DESIGN.rf, cf: DESIGN.cf } : lab.parts;
  const q = (need: number, t: string) => (design ? masked(lab, need, t) : t);
  const labels = hp
    ? { ci: `Ci ${fmtC(AHPF.ci)}`, ri: `Ri = ${fmtR(AHPF.ri)}`, rf: `Rf = ${fmtR(AHPF.rf)}` }
    : { ri: `Ri = ${q(1, fmtR(p.ri))}`, rf: `Rf = ${q(2, fmtR(p.rf))}`, cf: `Cf = ${q(3, fmtC(p.cf))}` };
  // the stage: summing node at 230, triangle 264 … 344, output node 374
  const xO = 374;
  const yo = y + 20;
  return (
    <>
      <Source x={60} yTop={y} yBot={y + 70} />
      <Wire d={`M60 ${y}H${hp ? 96 : 100}`} />
      <Gnd x={60} y={y + 70} />
      <InvStage
        xIn={hp ? 96 : 100}
        xN={230}
        y={y}
        input={hp ? 'cr' : 'r'}
        fb={hp ? 'r' : 'rc'}
        labels={labels}
        ids={{ ri: 'sch_ri', ci: 'sch_ci', rf: 'sch_rf', cf: 'sch_cf', vg: 'sch_vg', op: 'sch_opamp' }}
        vg={lab.vg}
      />
      <Wire d={`M${xO} ${yo}H560`} />
      <ResV id="sch_rl" x={480} y1={yo} y2={yo + 62} label={lab.load ? 'RL 10 kΩ' : 'RL 未接'} cls="rl" dashed={!lab.load} />
      {lab.load && <Dot x={480} y={yo} />}
      <Gnd x={480} y={yo + 62} />
      <OutTerm x={560} y={yo} />
      {lab.load && (
        <Part id="sch_buffer" title="运放输出缓冲">
          <path d={`M${xO + 14} ${yo - 14}H${470}`} className="w59-arrow" markerEnd="url(#w59arr)" />
          <text x={(xO + 470) / 2 + 6} y={yo - 20} className="w59-t mid small cur">
            运放输出供电流
          </text>
        </Part>
      )}
      <text x={20} y={26} className="w59-t vtitle">
        {design ? '设计题：抗混叠有源低通' : hp ? '一阶反相有源高通（LM358，±9 V）' : '一阶反相有源低通（LM358，±9 V）'}
      </text>
      <text x={20} y={262} className="w59-t small">
        {design ? '目标 |K_DC| = 5、fc = 1.0 kHz、Vin,peak = 1.2 V' : `${SUPPLY}：+9 V / GND / −9 V 三轨，IN+ 接地`}
      </text>
    </>
  );
}

function BandPassSvg({ lab }: { lab: Lab }) {
  const y = 160;
  return (
    <>
      <Source x={36} yTop={y} yBot={y + 60} label="" />
      <Gnd x={36} y={y + 60} />
      <Wire d={`M36 ${y}H62`} />
      <Part id="sch_stage1" title="第 1 级：有源高通">
        <rect x={56} y={38} width={250} height={200} rx={10} className="w59-stage s1" />
        <text x={64} y={56} className="w59-t small s1">
          第 1 级 HPF · fc1 = {fmtHz(metrics('bpf', lab.parts, false).fc[0])} · K1 = −1
        </text>
      </Part>
      <InvStage
        xIn={62}
        xN={146}
        y={y}
        tw={56}
        input="cr"
        fb="r"
        compact
        labels={{ ci: '47 nF', ri: '10 kΩ', rf: 'Rf1 10 kΩ' }}
        ids={{ ri: 'sch_ri', ci: 'sch_ci', rf: 'sch_rf', vg: 'sch_vg', op: 'sch_opamp' }}
        vg={lab.vg}
      />
      <Wire d={`M242 ${y + 14}H330`} />
      <Part id="sch_stage2" title="第 2 级：有源低通 + 增益">
        <rect x={318} y={38} width={250} height={200} rx={10} className="w59-stage s2" />
        <text x={326} y={56} className="w59-t small s2">
          第 2 级 LPF · fc2 = {fmtHz(metrics('bpf', lab.parts, false).fc[1])} · K2 = −2.2
        </text>
      </Part>
      <InvStage
        xIn={330}
        xN={404}
        y={y + 14}
        tw={56}
        input="r"
        fb="rc"
        compact
        labels={{ ri: '10 kΩ', rf: 'Rf2 22 kΩ', cf: '2.2 nF' }}
        ids={{ ri: 'sch_ri', rf: 'sch_rf', cf: 'sch_cf', vg: 'sch_vg', op: 'sch_opamp' }}
        vg={lab.vg}
      />
      <Wire d={`M500 ${y + 28}H600`} />
      <OutTerm x={600} y={y + 28} />
      <text x={20} y={24} className="w59-t vtitle">
        零电感级联有源带通（两级反相：总输出同相）
      </text>
      <text x={20} y={262} className="w59-t small">
        级间零加载：第 1 级运放输出直接驱动第 2 级的 Ri2
      </text>
    </>
  );
}

/* ------------------------------------------------------------- readouts */

function Readout({ lab }: { lab: Lab }) {
  const m = metrics(lab.mode, lab.parts, lab.load);
  const k = m.k;
  const kdb = toDb(Math.abs(k));
  switch (lab.mode) {
    case 'plpf':
    case 'phpf': {
      const free = metrics(lab.mode, lab.parts, false);
      return (
        <>
          <Cell id="sch_kdc" name="通带增益" value={`${k.toFixed(4)}（${fmtDb(kdb)}）`} tone={lab.load && lab.mode === 'plpf' ? 'bad' : ''} />
          <Cell
            id="sch_fc"
            name="截止频率 fc"
            value={fmtHz(m.fc[0])}
            tone={lab.load ? 'bad' : ''}
            hint={lab.load ? `空载 ${fmtHz(free.fc[0])}，×${(m.fc[0] / free.fc[0]).toFixed(2)}` : '空载'}
          />
          <Cell id="sch_rl" name="负载 RL" value={lab.load ? '10 kΩ 已接' : '空载'} tone={lab.load ? 'warn' : 'minor'} />
          <Cell id="sch_thev" name="C 看到的电阻" value={fmtR(m.rth!)} tone="minor" hint={lab.load ? 'R ∥ RL' : 'R'} />
        </>
      );
    }
    case 'alpf':
    case 'ahpf':
      return (
        <>
          <Cell id="sch_kdc" name={lab.mode === 'alpf' ? '通带增益' : '高频增益'} value={`${fmtK(k)}（${fmtDb(kdb)}）`} tone="good" />
          <Cell id="sch_fc" name="截止频率 fc" value={fmtHz(m.fc[0])} tone="good" hint={lab.mode === 'alpf' ? '只由 Rf、Cf 决定' : '只由 Ri、Ci 决定'} />
          <Cell id="sch_rl" name="负载 RL" value={lab.load ? '10 kΩ：纹丝不动' : '空载'} tone={lab.load ? 'good' : 'minor'} />
          <Cell id="sch_kdc" name="|H(fc)|" value={fmtDb(kdb - 3.0103)} tone="minor" hint="比通带低 3.01 dB" />
        </>
      );
    case 'bpf': {
      const pk = m.peak!;
      return (
        <>
          <Cell id="sch_kdc" name="标称通带增益" value={`+${fmtK(k)}（${fmtDb(kdb)}）`} hint="K1 × K2 = (−1)(−2.2)" />
          <Cell id="sch_fc" name="fc1 / fc2" value={`${fmtHz(m.fc[0])} / ${fmtHz(m.fc[1])}`} />
          <Cell id="sch_stage2" name="f0 = √(fc1·fc2)" value={fmtHz(pk.f0)} tone="minor" />
          <Cell
            id="sch_stage1"
            name="f0 处实际 |H|"
            value={`${pk.k.toFixed(2)}（${fmtDb(toDb(pk.k))}）`}
            tone="warn"
            hint={`−3 dB：${fmtHz(pk.edges[0])} – ${fmtHz(pk.edges[1])}`}
          />
        </>
      );
    }
    case 'design': {
      const vpk = Math.abs(k) * DESIGN.vinPk;
      return (
        <>
          <Cell id="sch_ri" name="Ri / Rf" value={`${masked(lab, 1, fmtR(DESIGN.ri))} / ${masked(lab, 2, fmtR(DESIGN.rf))}`} />
          <Cell id="sch_kdc" name="K_DC" value={masked(lab, 2, `${fmtK(k)}（${fmtDb(kdb)}）`)} />
          <Cell id="sch_fc" name="Cf / 实际 fc" value={`${masked(lab, 3, fmtC(DESIGN.cf))} / ${masked(lab, 4, fmtHz(m.fc[0]))}`} />
          <Cell id="sch_opamp" name="Vout,peak" value={masked(lab, 9, `${fmtV(vpk)} < ${VOH} V`)} tone={lab.reveal >= 9 ? 'good' : ''} />
        </>
      );
    }
  }
}

/* ------------------------------------------------------------- the layer */

const MODES: { value: Mode; short: string }[] = [
  { value: 'plpf', short: 'RC 低通' },
  { value: 'phpf', short: 'RC 高通' },
  { value: 'alpf', short: '有源低通' },
  { value: 'ahpf', short: '有源高通' },
  { value: 'bpf', short: '带通' },
];

export default function Schematic() {
  const lab = useLab();
  useClearHoverOnUnmount();
  const active = lab.mode === 'alpf' || lab.mode === 'ahpf' || lab.mode === 'bpf' || lab.mode === 'design';
  const lpf = lab.mode === 'plpf' || lab.mode === 'alpf';
  return (
    <div className="w59-layer">
      <div className="w59-dock">
        <Seg<Mode>
          label="拓扑"
          value={lab.mode}
          onChange={(m) => lab.set({ mode: m })}
          options={MODES.map((m) => ({ value: m.value, label: MODE_LABEL[m.value], short: m.short }))}
        />
        {lab.mode !== 'bpf' && lab.mode !== 'design' && (
          <Toggle
            on={lab.load}
            onClick={() => lab.set({ load: !lab.load })}
            label={lab.load ? '断开 10 kΩ 负载 RL' : '接入 10 kΩ 负载 RL'}
            short={lab.load ? '断开 RL' : '接 RL'}
            ids={['sch_rl']}
          />
        )}
        {active && <Toggle on={lab.vg} onClick={() => lab.set({ vg: !lab.vg })} label="高亮虚地" short="虚地" ids={['sch_vg']} />}
        {lab.mode === 'design' && (
          <span className="w59-chip" {...hoverProps(['sch_opamp'])}>
            引导例题进行中
          </span>
        )}
      </div>
      {lpf && (
        <div className="w59-dock sliders">
          {lab.mode === 'alpf' && <PartSlider name="Ri" kind="r" value={lab.parts.ri} onChange={(v) => lab.set({ ri: v })} id="sch_ri" />}
          <PartSlider name={lab.mode === 'alpf' ? 'Rf' : 'R'} kind="r" value={lab.parts.rf} onChange={(v) => lab.set({ rf: v })} id={lab.mode === 'alpf' ? 'sch_rf' : 'sch_r'} />
          <PartSlider name={lab.mode === 'alpf' ? 'Cf' : 'C'} kind="c" value={lab.parts.cf} onChange={(v) => lab.set({ cf: v })} id={lab.mode === 'alpf' ? 'sch_cf' : 'sch_c'} />
        </div>
      )}
      <div className="w59-sch-wrap">
        <svg viewBox="0 0 640 275" className="w59-sch" role="img" aria-label={`原理图：${MODE_LABEL[lab.mode]}`}>
          <defs>
            <marker id="w59arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 1L10 5L0 9z" className="w59-arrowhead" />
            </marker>
          </defs>
          {lab.mode === 'plpf' && <PassiveSvg lab={lab} hp={false} />}
          {lab.mode === 'phpf' && <PassiveSvg lab={lab} hp />}
          {lab.mode === 'alpf' && <ActiveSvg lab={lab} hp={false} />}
          {lab.mode === 'ahpf' && <ActiveSvg lab={lab} hp />}
          {lab.mode === 'design' && <ActiveSvg lab={lab} hp={false} design />}
          {lab.mode === 'bpf' && <BandPassSvg lab={lab} />}
        </svg>
      </div>
      <div className="w59-cells">
        <Readout lab={lab} />
      </div>
      {(lab.mode === 'phpf' || lab.mode === 'ahpf' || lab.mode === 'bpf') && (
        <p className="w59-notice">
          <span className="full">
            本拓扑按讲义取值：
            {lab.mode === 'phpf'
              ? 'R 10 kΩ、C 100 nF'
              : lab.mode === 'ahpf'
                ? 'Ri 10 kΩ、Ci 100 nF、Rf 33 kΩ'
                : `HPF ${fmtR(BPF.ri1)} / 47 nF / ${fmtR(BPF.rf1)}，LPF ${fmtR(BPF.ri2)} / 22 kΩ / 2.2 nF`}
            （滑块只调低通家族）
          </span>
          <span className="short">按讲义取值（滑块只调低通）</span>
        </p>
      )}
    </div>
  );
}
