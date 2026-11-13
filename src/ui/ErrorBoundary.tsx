import { Component, type ErrorInfo, type ReactNode } from 'react';
import { tr } from '../core/i18n';
import { clearStored } from '../state/persist';
import { layoutKey, useStore } from '../state/store';

interface Props {
  /** 'app': the whole page (reload after a reset); 'canvas': the 3D workbench only */
  scope: 'app' | 'canvas';
  children: ReactNode;
}

/** Saved data of the page being shown: its breadboard layout (and the scope panel settings). */
function resetPageData() {
  try {
    const s = useStore.getState();
    const key = layoutKey(s.mode, s.activeId);
    clearStored((k) => k === key || k === 'bb.scope');
  } catch {
    clearStored((k) => k.startsWith('bb.layout.'));
  }
}

/** Catches a render crash so one bad part or saved value can't leave a blank page, and offers to
 *  reset the saved data that is most likely behind it. */
export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[breadboard-lab] ${this.props.scope} crashed`, error, info.componentStack);
  }

  private retry = () => this.setState({ error: null });

  private resetPage = () => {
    resetPageData();
    if (this.props.scope === 'app') {
      location.reload();
      return;
    }
    const s = useStore.getState();
    const ch = s.activeId && s.mode !== 'sandbox' ? s.challenges.find((c) => c.id === s.activeId) : undefined;
    if (ch) s.openChallenge(ch.id);
    else s.loadLayout({ version: 1, parts: [] }, false);
    this.retry();
  };

  private resetAll = () => {
    if (!confirm(tr('清除本站保存的全部数据（所有电路、课程进度、练习记录、导入的题目）？', 'Delete everything this site has saved (all circuits, lesson progress, practice records, imported files)?'))) return;
    clearStored();
    location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const app = this.props.scope === 'app';
    return (
      <div className={`error-boundary ${app ? 'eb-app' : 'eb-canvas'}`} role="alert">
        <h2>{app ? tr('出错了，页面没法显示', 'Something went wrong and the page could not be shown') : tr('3D 面包板显示出错了', 'The 3D breadboard ran into an error')}</h2>
        <p>
          {tr(
            '很可能是浏览器里保存的电路数据坏了或来自旧版本。可以先重试；不行的话，重置这个页面保存的数据（只清除当前这块面包板上的电路）。',
            'Most likely the circuit saved in this browser is damaged or from an older version. Try again first; if that does not help, reset the saved data for this page (only the circuit on this breadboard is removed).',
          )}
        </p>
        <pre className="eb-detail">{String(error.message || error)}</pre>
        <div className="row">
          <button onClick={this.retry}>{tr('重试', 'Try again')}</button>
          <button className="primary" onClick={this.resetPage}>
            {tr('重置这个页面保存的数据', 'Reset saved data for this page')}
          </button>
          {app && (
            <button className="danger" onClick={this.resetAll}>
              {tr('清除全部保存的数据', 'Delete all saved data')}
            </button>
          )}
        </div>
      </div>
    );
  }
}
