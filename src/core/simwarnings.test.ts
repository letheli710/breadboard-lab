// Silent-failure warnings: under-resolved LC ringing, unsettled PWL steps, DC non-convergence.
import { describe, expect, it } from 'vitest';
import { acDiagnostics, boardDiagnostics } from './diagnostics';
import { setLang } from './i18n';
import type { BoardNetlist } from './netlist';
import { simulate } from './solver';
import { MAX_STEPS_PER_PERIOD, MIN_STEPS_PER_RING, simulateTransient } from './transient';
import type { CComponent, Circuit, CompType, PartProps } from './types';

const comp = (ref: string, type: CompType, props: PartProps = {}): CComponent => ({ ref, type, props });
const ckt = (components: CComponent[], nets: Record<string, string[]>): Circuit => ({
  components,
  nets: Object.entries(nets).map(([name, pins]) => ({ name, pins })),
});
const fakeNl = (circuit: Circuit) => ({ circuit, pinNet: new Map(), pinHoles: new Map(), netHoles: new Map(), holeNet: new Map(), unplaced: [] }) as unknown as BoardNetlist;

/** square wave → R → series L–C tank: rings at 1/(2π√(LC)) = 159 kHz for 1 mH / 1 nF */
const rlc = (frequency: number) =>
  ckt(
    [
      comp('FG1', 'function_gen', { waveform: 'square', frequency, amplitude: 1, offset: 1 }),
      comp('R1', 'resistor', { resistance: 10 }),
      comp('L1', 'inductor', { inductance: 1e-3 }),
      comp('C1', 'capacitor', { capacitance: 1e-9 }),
    ],
    { VIN: ['FG1.+', 'R1.1'], A: ['R1.2', 'L1.1'], VOUT: ['L1.2', 'C1.1'], GND: ['C1.2', 'FG1.-'] },
  );

describe('simulation warnings', () => {
  it('flags a 1 Hz square wave on a 159 kHz tank as under-resolved', () => {
    setLang('en');
    const c = rlc(1);
    const tr = simulateTransient(c);
    expect(tr.stepsPerPeriod).toBe(MAX_STEPS_PER_PERIOD);
    expect(tr.dt).toBeCloseTo(1 / 4096, 9); // 244 µs
    expect(tr.underResolved).not.toBeNull();
    expect(tr.underResolved!.ringHz).toBeCloseTo(159155, -1);
    expect(tr.underResolved!.stepsPerRing).toBeLessThan(0.1);
    expect(tr.warnings.some((w) => w.includes('too coarse'))).toBe(true);
    const issues = acDiagnostics(fakeNl(c), tr);
    const u = issues.find((i) => i.title.includes('Time step too coarse'));
    expect(u?.severity).toBe('warning');
    setLang('zh');
    expect(acDiagnostics(fakeNl(c), tr).some((i) => i.title.includes('步长太粗'))).toBe(true);
    setLang('en');
  });

  it('does not flag the same tank driven at 10 kHz', () => {
    const tr = simulateTransient(rlc(10_000));
    expect(tr.underResolved).toBeNull();
    expect(tr.stepsPerPeriod / (159155 / 10_000)).toBeGreaterThanOrEqual(MIN_STEPS_PER_RING);
    expect(acDiagnostics(fakeNl(rlc(10_000)), tr).some((i) => i.title.includes('too coarse'))).toBe(false);
  });

  it('counts time steps whose PWL states did not settle and reports them', () => {
    const c = ckt(
      [comp('FG1', 'function_gen', { waveform: 'sine', frequency: 1000, amplitude: 5, offset: 0 }), comp('R1', 'resistor', { resistance: 1000 }), comp('D1', 'diode')],
      { VIN: ['FG1.+', 'R1.1'], A: ['R1.2', 'D1.anode'], GND: ['D1.cathode', 'FG1.-'] },
    );
    const tr = simulateTransient(c);
    expect(tr.stats.pwlUnsettled).toBe(0);
    expect(acDiagnostics(fakeNl(c), tr).some((i) => i.title.includes('did not settle'))).toBe(false);
    // the diagnostic itself, for a result that hit the cap
    const bad = { ...tr, stats: { ...tr.stats, pwlUnsettled: 7 } };
    const issue = acDiagnostics(fakeNl(c), bad).find((i) => i.title.includes('did not settle'));
    expect(issue?.severity).toBe('warning');
    expect(issue?.detail).toContain(`7 of ${tr.stats.steps}`);
  });

  it('surfaces a non-converged DC solution as a diagnostic', () => {
    const c = ckt([comp('BAT1', 'battery', { variant: '9V' }), comp('R1', 'resistor', { resistance: 1000 })], {
      P: ['BAT1.+', 'R1.1'],
      GND: ['R1.2', 'BAT1.-'],
    });
    const sim = simulate(c);
    expect(sim.converged).toBe(true);
    expect(boardDiagnostics(fakeNl(c), sim).some((i) => i.title.includes("didn't converge"))).toBe(false);
    const issue = boardDiagnostics(fakeNl(c), { ...sim, converged: false }).find((i) => i.title.includes("didn't converge"));
    expect(issue?.severity).toBe('warning');
  });
});
