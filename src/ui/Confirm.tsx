// In-app confirmation: a button that opens a small popover ("are you sure?") above itself instead
// of the browser's native confirm(). Esc or a click outside cancels; focus goes to the safe choice
// and comes back to the button afterwards.

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { tr } from '../core/i18n';

export function ConfirmButton({
  message,
  confirmLabel,
  onConfirm,
  title,
  className,
  children,
}: {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const cancelBtn = useRef<HTMLButtonElement>(null);
  const id = useId();

  const close = (restore: boolean) => {
    setOpen(false);
    if (restore) btn.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    cancelBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // keep the app-wide Esc handler (cancel placement / select tool) out of it
        e.stopPropagation();
        e.preventDefault();
        close(true);
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!pop.current?.contains(t) && !btn.current?.contains(t)) close(false);
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onDown, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onDown, true);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className="confirm-wrap">
      <button ref={btn} className={className} title={title} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {children}
      </button>
      {open && (
        <div ref={pop} className="confirm-pop" role="alertdialog" aria-modal="false" aria-labelledby={id}>
          <p id={id}>{message}</p>
          <div className="row">
            <button ref={cancelBtn} onClick={() => close(true)}>
              {tr('取消', 'Cancel')}
            </button>
            <button
              className="danger-solid"
              onClick={() => {
                close(true);
                onConfirm();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
