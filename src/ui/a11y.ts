// Small keyboard / screen-reader helpers shared by several components.
import type { KeyboardEvent } from 'react';

/** Tabs (ARIA tabs pattern, automatic activation): ←/→ (and ↑/↓), Home, End move to another tab
 *  of the same tablist and activate it (by clicking it). Put on the tablist's onKeyDown. */
export function tabListKeys(e: KeyboardEvent<HTMLElement>) {
  const tabs = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)')];
  const i = tabs.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  const j =
    e.key === 'ArrowRight' || e.key === 'ArrowDown'
      ? (i + 1) % tabs.length
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
        ? (i - 1 + tabs.length) % tabs.length
        : e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? tabs.length - 1
            : -1;
  if (j < 0) return;
  e.preventDefault();
  tabs[j].focus();
  tabs[j].click();
}

/** Radio group with manual activation: arrows / Home / End move focus between the radios only;
 *  Space / Enter (a click) chooses. Used where choosing is an answer attempt (practice choices),
 *  so moving through the options must not submit anything. */
export function radioFocusKeys(e: KeyboardEvent<HTMLElement>) {
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]:not(:disabled)')];
  const i = items.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  const j =
    e.key === 'ArrowRight' || e.key === 'ArrowDown'
      ? (i + 1) % items.length
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
        ? (i - 1 + items.length) % items.length
        : e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? items.length - 1
            : -1;
  if (j < 0) return;
  e.preventDefault();
  for (const it of items) it.tabIndex = -1;
  items[j].tabIndex = 0;
  items[j].focus();
}
