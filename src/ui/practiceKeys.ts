// Practice keyboard shortcuts and the ‹ › neighbours (pure, so they can be tested without a DOM).

/** The problems the ‹ › buttons and the [ ] keys go to: the previous one in course order, and
 *  the next unfinished one after it (else simply the next). */
export function neighbours<T extends { id: string }>(list: T[], id: string, isDone: (p: T) => boolean): { i: number; prev: T | null; next: T | null } {
  const i = list.findIndex((x) => x.id === id);
  return { i, prev: i > 0 ? list[i - 1] : null, next: list.slice(i + 1).find((x) => !isDone(x)) ?? list[i + 1] ?? null };
}

/** A key press meant for a text field / control (answers are typed): not a shortcut. */
export function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
}

/** Practice shortcuts: [ / ] previous / next problem, ? this list. Not while typing in a field. */
export function practiceShortcut(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'target' | 'isComposing'>): 'prev' | 'next' | 'help' | null {
  if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing || isTypingTarget(e.target)) return null;
  // the same keys with a Chinese input method on (【 】 ？)
  if (e.key === '[' || e.key === '【') return 'prev';
  if (e.key === ']' || e.key === '】') return 'next';
  if (e.key === '?' || e.key === '？') return 'help';
  return null;
}
