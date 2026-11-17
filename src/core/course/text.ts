// Bilingual text of the course files (course/*.json, units/*.json): every visible string is
// written in both languages, { "zh": …, "en": … }; a value may be an array of lines (joined
// with "\n", handy for paragraphs and lists in JSON).

import { getLang } from '../i18n';

export type Lines = string | string[];
export interface T {
  zh: Lines;
  en: Lines;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isLines = (v: unknown): v is Lines => typeof v === 'string' || (Array.isArray(v) && v.every((x) => typeof x === 'string'));
const join = (v: Lines) => (Array.isArray(v) ? v.join('\n') : v);

/** The text in the current UI language. */
export const tt = (t: T | undefined): string => (t ? join(getLang() === 'en' ? t.en : t.zh) : '');

/** Check a bilingual text field; pushes an error and returns false when it is malformed. */
export function checkT(v: unknown, where: string, errors: string[], optional = false): v is T {
  if (v === undefined && optional) return false;
  if (!isObj(v) || !isLines(v.zh) || !isLines(v.en)) {
    errors.push(`${where}: 需要 { "zh": …, "en": … }（两种语言都要写） / needs { "zh": …, "en": … } (both languages)`);
    return false;
  }
  if (!join(v.zh).trim() || !join(v.en).trim()) {
    errors.push(`${where}: zh / en 不能为空 / zh and en must not be empty`);
    return false;
  }
  return true;
}
