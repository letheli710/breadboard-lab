// Minimal bilingual support: every user-facing string is written inline as tr('中文', 'English').
// The current language is a module-level setting so pure core code (diagnostics, checker,
// challenge parser) can produce messages without threading a parameter everywhere.

export type Lang = 'zh' | 'en';
export const LANGS: Lang[] = ['zh', 'en'];

let current: Lang = 'zh';

export function getLang(): Lang {
  return current;
}

export function setLang(l: Lang) {
  current = l;
}

/** Pick the string for the current language. */
export function tr(zh: string, en: string): string {
  return current === 'en' ? en : zh;
}

export const isLang = (v: unknown): v is Lang => v === 'zh' || v === 'en';
