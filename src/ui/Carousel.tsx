import { useStore } from '../state/store';

export function Carousel({ kind }: { kind: 'lesson' | 'challenge' }) {
  const challenges = useStore((s) => s.challenges);
  const activeId = useStore((s) => s.activeId);
  const completed = useStore((s) => s.completed);
  const open = useStore((s) => s.openChallenge);
  const list = challenges.filter((c) => c.kind === kind);
  const done = list.filter((c) => completed[c.id]).length;
  return (
    <section className="carousel-wrap">
      <div className="section-title">
        {kind === 'lesson' ? '课程 LESSONS' : '挑战 CHALLENGES'}
        <span className="muted">
          {done}/{list.length} 完成
        </span>
      </div>
      {list.length === 0 ? (
        <div className="card empty-card">
          {kind === 'lesson' ? '没有找到课程文件。' : '还没有挑战题。'} 把题目 JSON 放进项目的 <code>challenges/</code> 文件夹，或在“导入”页面导入。
        </div>
      ) : (
        <div className="carousel">
          {list.map((c, i) => (
            <button key={c.id} className={`lesson-card ${c.id === activeId ? 'on' : ''} ${completed[c.id] ? 'done' : ''}`} onClick={() => open(c.id)}>
              <div className="lc-num">{completed[c.id] ? '✓' : i + 1}</div>
              <div className="lc-body">
                <div className="lc-title">{c.title}</div>
                <div className="lc-meta">
                  {'★'.repeat(c.level)}
                  {c.source === 'imported' && <span className="badge src">导入</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
