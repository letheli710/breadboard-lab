// Mixed-language text: in Chinese, labels carry an English gloss ("目标电路图 TARGET SCHEMATIC",
// "GND 到底是什么？What is ground?"); in English a few keep a Chinese term. A screen reader reads a
// run in the page's language with that language's voice, so each run in the *other* language gets
// its own `lang`. Wrap a tr() result in <Mixed text={…} /> where it is rendered.
import { Fragment } from 'react';
import { getLang } from '../core/i18n';

const HAN = /[㐀-鿿＀-￯　-〿]/;
/** Latin word runs ("TARGET SCHEMATIC", "What is ground?") or Han runs, depending on the page language */
const LATIN_RUN = /[A-Za-z][A-Za-z0-9'’&/.-]*(?:[ ][A-Za-z0-9][A-Za-z0-9'’&/.-]*)*[?!)]?/g;
const HAN_RUN = /[㐀-鿿][㐀-鿿　-〿＀-￯]*/g;

/** Split text into [run, lang | null] pieces (null: the page's own language). */
export function langRuns(text: string, page: 'zh' | 'en' = getLang()): [string, string | null][] {
  // no Chinese in it: all English (an English page, or an English-only label on a Chinese one)
  if (!HAN.test(text)) return [[text, page === 'zh' && /[A-Za-z]{2}/.test(text) ? 'en' : null]];
  const out: [string, string | null][] = [];
  let at = 0;
  for (const m of text.matchAll(page === 'zh' ? LATIN_RUN : HAN_RUN)) {
    // single letters / unit symbols ("V", "k") read fine in either voice
    if (page === 'zh' && m[0].replace(/[^A-Za-z]/g, '').length < 2) continue;
    if (m.index > at) out.push([text.slice(at, m.index), null]);
    out.push([m[0], page === 'zh' ? 'en' : 'zh-CN']);
    at = m.index + m[0].length;
  }
  if (at < text.length) out.push([text.slice(at), null]);
  return out;
}

export function Mixed({ text }: { text: string }) {
  return (
    <>
      {langRuns(text).map(([t, l], i) =>
        l ? (
          <span key={i} lang={l}>
            {t}
          </span>
        ) : (
          <Fragment key={i}>{t}</Fragment>
        ),
      )}
    </>
  );
}
