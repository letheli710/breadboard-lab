// The bench's right-click menu: a right click that doesn't drag (right-drag pans the view). On a
// part: edit its details, swap its legs / turn it, delete it. On empty space: reset the view, undo.

import { useEffect, useRef } from 'react';
import { tr } from '../core/i18n';
import { useBenchUi } from '../state/benchUi';
import { useStore } from '../state/store';
import { swapLegs, swappedPins, turnBenchPart } from '../three/benchActions';
import { emitCameraView } from '../three/common';
import { isBenchPart } from '../three/slots';

export function BenchMenu() {
  const menu = useBenchUi((s) => s.menu);
  const openMenu = useBenchUi((s) => s.openMenu);
  const openPopover = useBenchUi((s) => s.openPopover);
  const part = useStore((s) => (menu?.partId ? s.layout.parts.find((p) => p.id === menu.partId) : undefined));
  const canUndo = useStore((s) => s.past.length > 0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    root.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true });
    const away = (e: PointerEvent) => !root.current?.contains(e.target as Node) && openMenu(null);
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        openMenu(null);
      }
    };
    const gone = () => openMenu(null);
    window.addEventListener('pointerdown', away, true);
    window.addEventListener('keydown', key, true);
    window.addEventListener('resize', gone);
    return () => {
      window.removeEventListener('pointerdown', away, true);
      window.removeEventListener('keydown', key, true);
      window.removeEventListener('resize', gone);
    };
  }, [menu, openMenu]);

  if (!menu) return null;
  const run = (f: () => void) => () => {
    openMenu(null);
    f();
  };
  // arrow keys move between the items
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...(root.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
  };
  const left = Math.min(menu.x, window.innerWidth - 200);
  const top = Math.min(menu.y, window.innerHeight - 180);
  return (
    <div ref={root} className="bench-menu" role="menu" style={{ left, top }} onKeyDown={onKey} onContextMenu={(e) => e.preventDefault()}>
      {part ? (
        <>
          <div className="bench-menu-title">{part.ref}</div>
          <button
            role="menuitem"
            onClick={run(() => {
              useStore.getState().select(part.id);
              openPopover(part.id);
            })}
          >
            {tr('修改参数…', 'Edit…')}
            <kbd>{tr('左键单击', 'click')}</kbd>
          </button>
          {part.type !== 'wire' && swappedPins(part.id) && (
            <button role="menuitem" onClick={run(() => swapLegs(part.id))}>
              {part.type === 'led' || part.type === 'diode' ? tr('翻转方向', 'Flip') : tr('对调两脚', 'Swap legs')}
            </button>
          )}
          {isBenchPart(part.type) && (
            <button role="menuitem" onClick={run(() => turnBenchPart(part.id))}>
              {tr('转 90°', 'Turn 90°')}
              <kbd>T</kbd>
            </button>
          )}
          <button role="menuitem" className="danger" onClick={run(() => useStore.getState().removePart(part.id))}>
            {tr('删除', 'Delete')}
            <kbd>Del</kbd>
          </button>
        </>
      ) : (
        <>
          <button role="menuitem" onClick={run(() => emitCameraView('angle'))}>
            {tr('回到默认视角', 'Reset the view')}
          </button>
          <button role="menuitem" disabled={!canUndo} onClick={run(() => useStore.getState().undo())}>
            {tr('撤销', 'Undo')}
            <kbd>Ctrl Z</kbd>
          </button>
        </>
      )}
    </div>
  );
}
