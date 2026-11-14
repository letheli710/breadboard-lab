// Insert buttons for symbols that are hard to type on a phone keyboard (√ π ∠ ° µ Ω ×10^ and
// parentheses — the answer reader accepts all of them). Shown on touch screens while the answer
// field has focus, as an overlay below it (styles.css). The buttons don't take focus, so the
// on-screen keyboard stays up.

import type { RefObject } from 'react';
import { tr } from '../core/i18n';

/** Symbols that are hard to type on a phone keyboard (the answer reader accepts all of them). */
const SYMBOL_KEYS: { text: string; label?: string }[] = [
  { text: '√' },
  { text: 'π' },
  { text: '∠' },
  { text: '°' },
  { text: 'µ' },
  { text: 'Ω' },
  { text: '×10^', label: '×10ⁿ' },
  { text: '(' },
  { text: ')' },
];

export function SymbolKeys({ input, onChange }: { input: RefObject<HTMLInputElement | null>; onChange: (v: string) => void }) {
  const insert = (t: string) => {
    const el = input.current;
    if (!el) return;
    const a = el.selectionStart ?? el.value.length;
    const b = el.selectionEnd ?? a;
    onChange(el.value.slice(0, a) + t + el.value.slice(b));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + t.length, a + t.length);
    });
  };
  return (
    <div className="pr-symkeys" role="group" aria-label={tr('插入符号', 'Insert a symbol')}>
      {SYMBOL_KEYS.map((k) => (
        <button
          key={k.text}
          type="button"
          tabIndex={-1}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => insert(k.text)}
          aria-label={tr(`插入 ${k.text}`, `Insert ${k.text}`)}
        >
          {k.label ?? k.text}
        </button>
      ))}
    </div>
  );
}
