// Threshold rules on dev-board pins (pin mode `rule`, types.ts PinRule): an output that follows an
// ADC reading of the same board, the declarative stand-in for a few lines of firmware
//
//     loop() { digitalWrite(FAN, analogRead(TEMP) > 2674); }
//
// The solver has no firmware, so the rule is settled around the DC solve: every rule pin starts
// LOW (or at its last state, for hysteresis), the circuit is solved, each rule compares its ADC
// reading and sets its output, and the solve repeats until no output changes. The solved circuit
// has plain out_high / out_low pins, so the DC model, the transient engine and every reading see
// an ordinary output.
import { adcRaw, isMcu, mcuPin } from './mcu';
import type { Circuit, PinConfig, PinRule } from './types';

/** `ref.pin` → output HIGH? (the state a hysteresis rule remembers between solves) */
export type RuleState = Map<string, boolean>;

interface RulePin {
  key: string;
  ref: string;
  pin: string;
  cfg: PinConfig;
  rule: PinRule;
}

const MAX_ROUNDS = 8;

function rulePins(circuit: Circuit): RulePin[] {
  const out: RulePin[] = [];
  for (const c of circuit.components) {
    if (!isMcu(c.type)) continue;
    for (const [pin, cfg] of Object.entries(c.props.pins ?? {})) if (cfg?.mode === 'rule' && cfg.rule) out.push({ key: `${c.ref}.${pin}`, ref: c.ref, pin, cfg, rule: cfg.rule });
  }
  return out;
}

export function hasRules(circuit: Circuit): boolean {
  return rulePins(circuit).length > 0;
}

/** The output a rule wants for a reading, given its present output (hysteresis). */
export function ruleOutput(rule: PinRule, raw: number, wasHigh: boolean): boolean {
  const h = Math.max(0, rule.hysteresis ?? 0);
  if (rule.below !== undefined) return wasHigh ? raw < rule.below + h : raw < rule.below;
  if (rule.above !== undefined) return wasHigh ? raw > rule.above - h : raw > rule.above;
  return false;
}

/** The circuit with every rule pin replaced by out_high / out_low per `state` (unset = LOW). */
export function withRuleOutputs(circuit: Circuit, state: RuleState): Circuit {
  return {
    ...circuit,
    components: circuit.components.map((c) => {
      if (!isMcu(c.type) || !Object.values(c.props.pins ?? {}).some((p) => p?.mode === 'rule')) return c;
      const pins: Record<string, PinConfig> = {};
      for (const [pin, cfg] of Object.entries(c.props.pins ?? {})) {
        if (cfg?.mode !== 'rule') pins[pin] = cfg;
        else pins[pin] = { mode: state.get(`${c.ref}.${pin}`) ? 'out_high' : 'out_low', ...(cfg.openDrain ? { openDrain: true } : {}) };
      }
      return { ...c, props: { ...c.props, pins } };
    }),
  };
}

/** What a solve exposes that a rule needs: a pin's voltage to the board's GND. */
interface PinVoltages {
  mcus: Map<string, { pins: Map<string, { vLocal: number }> }>;
}

/** The ADC reading a rule sees, or null when its pin has no ADC (the rule then holds LOW). */
function reading(sim: PinVoltages, circuit: Circuit, rp: RulePin): number | null {
  const type = circuit.components.find((c) => c.ref === rp.ref)?.type;
  const def = type ? mcuPin(type, rp.rule.adc) : null;
  if (!def || def.kind !== 'gpio' || !def.gpio?.adc) return null;
  const st = sim.mcus.get(rp.ref)?.pins.get(rp.rule.adc);
  return st ? adcRaw(st.vLocal) : null;
}

/** Settle every rule against `solve`. Returns the solve of the settled circuit, that circuit, and
 *  the outputs (to remember for hysteresis). `prev` gives the starting outputs; missing = LOW. */
export function settleRules<S extends PinVoltages>(circuit: Circuit, solve: (c: Circuit) => S, prev?: RuleState): { sim: S; circuit: Circuit; state: RuleState } {
  const pins = rulePins(circuit);
  const state: RuleState = new Map(pins.map((p) => [p.key, prev?.get(p.key) ?? false]));
  let solved = withRuleOutputs(circuit, state);
  let sim = solve(solved);
  for (let round = 0; round < MAX_ROUNDS; round++) {
    let changed = false;
    for (const p of pins) {
      const raw = reading(sim, circuit, p);
      const want = raw === null ? false : ruleOutput(p.rule, raw, state.get(p.key)!);
      if (want !== state.get(p.key)) {
        state.set(p.key, want);
        changed = true;
      }
    }
    if (!changed) break;
    solved = withRuleOutputs(circuit, state);
    sim = solve(solved);
  }
  return { sim, circuit: solved, state };
}
