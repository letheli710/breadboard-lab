// Every calculation card, grouped. Each group file exports group() and cards(); both build their
// text in the current language, so they are called on every render. Groups are listed in course
// order: DC basics, circuit laws, instruments, op-amps, transients, AC, microcontroller circuits.

import type { CalcCard, CalcGroup } from '../types';
import * as dc from './basics';
import * as laws from './circuit';
import * as instruments from './instruments';
import * as opamp from './opamp';
import * as transients from './transients';
import * as ac from './ac';
import * as mcu from './mcu';

const MODULES = [dc, laws, instruments, opamp, transients, ac, mcu];

export const calcGroups = (): CalcGroup[] => MODULES.map((m) => m.group());
export const allCalcs = (): CalcCard[] => MODULES.flatMap((m) => m.cards());
