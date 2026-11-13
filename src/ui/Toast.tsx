// App-level toast host: notify() messages show in every mode (bench, Practice, Guide, Import),
// fixed under the header so they never cover the Check button or the bench toolbar.

import { tr } from '../core/i18n';
import { useStore } from '../state/store';

export function Toast() {
  const toast = useStore((s) => s.toast);
  const toastUndo = useStore((s) => s.toastUndo);
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toast && (
        <div className={`toast ${toastUndo ? 'has-action' : ''}`}>
          {toast}
          {toastUndo && (
            <button className="toast-action" onClick={() => useStore.getState().undo()}>
              {tr('撤销', 'Undo')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
