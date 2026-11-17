// Titles of the course map's Worlds and units (course/worlds.json, read by core/course.ts).

import { WORLDS } from './course';

const byId = (id: number) => WORLDS.find((w) => w.id === id);
const unitByNum = (num: string) => WORLDS.flatMap((w) => w.units).find((u) => u.num === num);

export const worldTitle = (id: number): string => byId(id)?.title() ?? `World ${id}`;
export const worldBlurb = (id: number): string => byId(id)?.books() ?? '';
export const unitTitle = (num: string): string => unitByNum(num)?.title() ?? num;
