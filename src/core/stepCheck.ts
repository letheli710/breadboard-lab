// Per-step checks of a lesson ("check" on a step, docs/CHALLENGE_FORMAT.md §7.1): is the part
// of this step on the board (at these holes, with these settings), are the multimeter probes
// where the step says, are these holes empty again, is the scope set to this time/div. Pure:
// evaluated against the student's layout + multimeter probes + scope knobs.

import { HOLE_MAP } from './breadboard';
import { formatSI } from './format';
import { tr } from './i18n';
import { PARTS } from './parts';
import type { Layout, PartProps, PartType, PlacedPart } from './types';

export interface StepPartCheck {
  kind: 'part';
  type: PartType;
  /** physical pin → hole (any hole on the same strip counts) */
  pins: Record<string, string>;
  /** settings that must match (only the ones the file lists) */
  props: PartProps;
}
export interface StepProbeCheck {
  kind: 'probe';
  /** red / black multimeter probe on the strip of this hole (black: null = left at GND) */
  red?: string;
  black?: string | null;
}
export interface StepEmptyCheck {
  kind: 'empty';
  holes: string[];
}
export interface StepScopeCheck {
  kind: 'scope';
  tdiv?: number;
  vdiv1?: number;
  vdiv2?: number;
}
export type StepCheck = StepPartCheck | StepProbeCheck | StepEmptyCheck | StepScopeCheck;

export interface StepState {
  layout: Layout;
  probe: { red: string | null; black: string | null };
  scope: { tdiv: number | null; vdiv: { 1: number | null; 2: number | null } };
}

const strip = (h: string | null | undefined) => (h ? (HOLE_MAP.get(h)?.strip ?? h) : null);
const near = (a: number, b: number) => Math.abs(a - b) <= 0.02 * Math.max(Math.abs(a), Math.abs(b)) + 1e-12;

/** Expected settings ⊆ actual (numbers ±2 %, strings case-insensitive, objects recursively). */
function propsMatch(want: unknown, have: unknown): boolean {
  if (typeof want === 'number') return typeof have === 'number' && near(want, have);
  if (typeof want === 'string') return typeof have === 'string' && want.toLowerCase() === have.toLowerCase();
  if (want && typeof want === 'object') {
    if (!have || typeof have !== 'object') return false;
    return Object.entries(want).every(([k, v]) => propsMatch(v, (have as Record<string, unknown>)[k]));
  }
  return want === have;
}

/** Two-point parts whose two legs may be swapped (wire, R, C, L, LDR, NTC…). */
function swappable(type: PartType): boolean {
  const def = PARTS[type];
  if (type === 'wire') return true;
  if (def.placement.kind !== 'two-point') return false;
  const [p1, p2] = def.placement.pins;
  const [t1, t2] = [def.terminalOf[p1], def.terminalOf[p2]];
  return def.symmetric.some((g) => g.includes(t1) && g.includes(t2));
}

function placedAt(p: PlacedPart, pins: Record<string, string>): boolean {
  const same = (map: Record<string, string>) => Object.entries(map).every(([pin, hole]) => strip(p.pins[pin]) === strip(hole));
  if (same(pins)) return true;
  if (!swappable(p.type)) return false;
  const def = PARTS[p.type];
  if (def.placement.kind !== 'two-point') return false;
  const [a, b] = def.placement.pins;
  const sw: Record<string, string> = {};
  if (pins[a]) sw[b] = pins[a];
  if (pins[b]) sw[a] = pins[b];
  return same(sw);
}

const holeList = (pins: Record<string, string>) => Object.values(pins).join('–');

const LABELS: Record<string, [string, string]> = {
  resistance: ['阻值', 'resistance'],
  voltage: ['电压', 'voltage'],
  currentLimit: ['限流', 'current limit'],
  frequency: ['频率', 'frequency'],
  amplitude: ['幅度（峰值）', 'amplitude (peak)'],
  offset: ['直流偏置', 'DC offset'],
  waveform: ['波形', 'waveform'],
  capacitance: ['电容', 'capacitance'],
  inductance: ['电感', 'inductance'],
  wiper: ['滑动端', 'wiper'],
  channel: ['通道', 'channel'],
  pressed: ['按下', 'pressed'],
  usb: ['USB', 'USB'],
};
const MODES: Record<string, [string, string]> = {
  out_high: ['输出 高', 'OUT HIGH'],
  out_low: ['输出 低', 'OUT LOW'],
  input: ['输入', 'INPUT'],
  input_pullup: ['输入 上拉', 'IN pull-up'],
  input_pulldown: ['输入 下拉', 'IN pull-down'],
  rule: ['阈值规则', 'threshold rule'],
};
const label = (k: string) => (LABELS[k] ? tr(...LABELS[k]) : k);

function settingText(props: PartProps): string {
  const units: Record<string, string> = { resistance: 'Ω', voltage: 'V', currentLimit: 'A', frequency: 'Hz', amplitude: 'V', offset: 'V', capacitance: 'F', inductance: 'H' };
  return Object.entries(props)
    .map(([k, v]) => {
      if (typeof v === 'number') return `${label(k)} ${units[k] ? formatSI(v, units[k]) : v}`;
      if (k === 'pins' && v && typeof v === 'object')
        return Object.entries(v as Record<string, { mode?: string; duty?: number }>)
          .map(([pin, c]) => `${pin} ${c.mode ? (MODES[c.mode] ? tr(...MODES[c.mode]) : c.mode.toUpperCase()) : ''}${c.duty !== undefined ? ` ${c.duty}%` : ''}`.trim())
          .join(', ');
      return `${label(k)} ${String(v)}`;
    })
    .join(', ');
}

/** Unmet items of a step's checks, in words ([] = the step is done). */
export function unmetStepChecks(checks: StepCheck[], st: StepState): string[] {
  const out: string[] = [];
  for (const c of checks) {
    if (c.kind === 'part') {
      const name = PARTS[c.type].name;
      const here = st.layout.parts.filter((p) => p.type === c.type && placedAt(p, c.pins));
      if (!here.length) out.push(tr(`把${name}插到 ${holeList(c.pins)}`, `Place the ${name} at ${holeList(c.pins)}`));
      else if (Object.keys(c.props).length && !here.some((p) => propsMatch(c.props, { ...PARTS[c.type].defaults, ...p.props })))
        out.push(tr(`在“属性”里把${name}设成：${settingText(c.props)}`, `In Properties, set the ${name} to: ${settingText(c.props)}`));
    } else if (c.kind === 'probe') {
      if (c.red !== undefined && strip(st.probe.red) !== strip(c.red))
        out.push(tr(`万用表红表笔点 ${c.red}（选“万用表”工具，单击孔）`, `Multimeter red probe on ${c.red} (pick the Multimeter tool, click the hole)`));
      if (c.black === null && st.probe.black !== null)
        out.push(tr('黑表笔回到 GND（按 Shift 单击 GND 轨，或重新选万用表）', 'Black probe back on GND (Shift + click a GND rail hole)'));
      else if (typeof c.black === 'string' && strip(st.probe.black) !== strip(c.black))
        out.push(tr(`万用表黑表笔点 ${c.black}（Shift + 单击）`, `Multimeter black probe on ${c.black} (Shift + click)`));
    } else if (c.kind === 'empty') {
      const used = new Set(st.layout.parts.flatMap((p) => Object.values(p.pins)));
      const busy = c.holes.filter((h) => used.has(h));
      if (busy.length) out.push(tr(`拔掉 ${busy.join('、')} 上的东西`, `Remove what is in ${busy.join(', ')}`));
    } else {
      const want: [string, string, number | undefined, number | null][] = [
        [tr('时间/格', 'Time/div'), 's', c.tdiv, st.scope.tdiv],
        [tr('CH1 伏/格', 'CH1 V/div'), 'V', c.vdiv1, st.scope.vdiv[1]],
        [tr('CH2 伏/格', 'CH2 V/div'), 'V', c.vdiv2, st.scope.vdiv[2]],
      ];
      for (const [label, unit, w, h] of want)
        if (w !== undefined && (h === null || !near(w, h)))
          out.push(
            tr(`示波器${label}调到 ${formatSI(w, unit)}`, `Set the scope's ${label} to ${formatSI(w, unit)}`) +
              (h === null ? tr('（现在是 AUTO，用 − / + 调）', ' (it is on AUTO now; use − / +)') : ''),
          );
    }
  }
  return out;
}
