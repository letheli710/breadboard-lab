// Every calculation card, grouped. Each group file exports group() and cards(); both build their
// text in the current language, so they are called on every render.

import type { CalcCard, CalcGroup } from '../types';
import * as dc from './basics';
import * as opamp from './opamp';
import * as ac from './ac';

const MODULES = [dc, ac, opamp];

export const calcGroups = (): CalcGroup[] => MODULES.map((m) => m.group());
export const allCalcs = (): CalcCard[] => MODULES.flatMap((m) => m.cards());
