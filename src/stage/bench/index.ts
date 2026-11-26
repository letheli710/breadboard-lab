// The shared lab-bench instruments: every 3D lesson's bench supply, function generator and
// oscilloscope come from here (docs/STAGE_LESSONS.md, 「实验台公共仪器」).

export { BenchSupply, supplyWidth, type BenchSupplyProps, type SupplyLead } from './BenchSupply';
export { FunctionGenerator, GEN_SIZE, type FunctionGeneratorProps, type GeneratorKnob } from './FunctionGenerator';
export {
  Oscilloscope,
  PROBE_COLORS,
  SCOPE_SCREEN,
  SCOPE_SIZE,
  scopeScreen,
  TRACE_COLORS,
  type OsdItem,
  type OscilloscopeProps,
  type ScopeChannel,
  type ScopeCursor,
  type ScopeKey,
  type ScopeProbe,
  type ScopeTrigger,
} from './Oscilloscope';
export { AlligatorClip, BenchTable, ClipLead, hoverHandlers, Lcd, NameTag, PlugLead, ProbeLead, Stub, useAnyLit, Wire } from './parts';
export {
  dragFrequency,
  eng,
  fmtA,
  fmtHz,
  fmtTdiv,
  fmtVdiv,
  genLcd,
  knobAngle,
  LEAD_COLORS,
  supplyLabel,
  supplyLcd,
  supplyTerminals,
  trimNum,
  type LcdLine,
  type SupplyChannel,
  type SupplyTerminal,
  type Waveform,
} from './format';
export { BENCH_Y, boardXZ, clipAt, frontDir, toWorld, type BoardPoint, type Placement, type V3 } from './geometry';
export { sampleTrace, traceDivs, type TimeBase, type TraceSource } from './trace';
export { BENCH_NAMES } from '../benchNames';
