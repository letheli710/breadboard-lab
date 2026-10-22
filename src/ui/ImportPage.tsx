import { useRef, useState } from 'react';
import { importFiles, loadAll, readImported, writeImported } from '../state/challenges';
import { useStore } from '../state/store';
import { Icon } from './Icons';
import { Md } from './Panel';

const docs = import.meta.glob('../../docs/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const aiPrompt = Object.entries(docs).find(([k]) => k.endsWith('AI_PROMPT.md'))?.[1] ?? '';
const formatDoc = Object.entries(docs).find(([k]) => k.endsWith('CHALLENGE_FORMAT.md'))?.[1] ?? '';

/** Collect File objects from a drag-and-drop, descending into dropped folders. */
async function filesFromDrop(dt: DataTransfer): Promise<File[]> {
  const out: File[] = [];
  const walk = async (entry: FileSystemEntry, path: string): Promise<void> => {
    if (entry.isFile) {
      const f = await new Promise<File>((res, rej) => (entry as FileSystemFileEntry).file(res, rej));
      Object.defineProperty(f, 'webkitRelativePath', { value: path + f.name });
      out.push(f);
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      let batch: FileSystemEntry[];
      do {
        batch = await new Promise<FileSystemEntry[]>((res, rej) => reader.readEntries(res, rej));
        for (const e of batch) await walk(e, `${path}${entry.name}/`);
      } while (batch.length);
    }
  };
  const entries = [...dt.items].map((i) => i.webkitGetAsEntry()).filter((e): e is FileSystemEntry => !!e);
  if (entries.length) for (const e of entries) await walk(e, '');
  else out.push(...dt.files);
  return out;
}

export function ImportPage() {
  const challenges = useStore((s) => s.challenges);
  const invalid = useStore((s) => s.invalid);
  const setChallenges = useStore((s) => s.setChallenges);
  const open = useStore((s) => s.openChallenge);
  const notify = useStore((s) => s.notify);
  const [drag, setDrag] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const dirInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const refresh = () => {
    const r = loadAll();
    setChallenges(r.challenges, r.invalid);
    return r;
  };
  const handle = async (files: File[]) => {
    const { added, skipped } = await importFiles(files);
    const r = refresh();
    const bad = r.invalid.filter((i) => i.errors.length).length;
    notify(`导入了 ${added} 个文件${skipped ? `，跳过 ${skipped} 个非 JSON 文件` : ''}${bad ? `，其中有 ${bad} 个格式错误（见下方）` : ''}`);
  };
  const remove = (file: string) => {
    writeImported(readImported().filter((f) => f.file !== file));
    refresh();
  };
  const clearAll = () => {
    if (!confirm('移除所有导入的题目？（challenges/ 文件夹里的题目不受影响）')) return;
    writeImported([]);
    refresh();
  };

  return (
    <div className="import-page">
      <div className="card import-hero">
        <div className="eyebrow">题库导入 IMPORT</div>
        <h1>导入题目文件夹</h1>
        <p>
          题目是符合 <code>breadboard-challenge/1</code> 规范的 JSON 文件。有两种方式加载：
        </p>
        <ol>
          <li>
            <b>放进项目的 <code>challenges/</code> 文件夹</b>——开发模式下自动加载并实时刷新（适合长期保存的题库）。
          </li>
          <li>
            <b>在这里导入</b>——拖入整个文件夹或若干 .json 文件，保存在浏览器里。
          </li>
        </ol>
        <div
          className={`dropzone ${drag ? 'on' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={async (e) => {
            e.preventDefault();
            setDrag(false);
            handle(await filesFromDrop(e.dataTransfer));
          }}
        >
          <Icon name="folder" size={38} />
          <div>把题目文件夹或 .json 文件拖到这里</div>
          <div className="row">
            <button className="primary" onClick={() => dirInput.current?.click()}>
              <Icon name="folder" /> 选择文件夹
            </button>
            <button onClick={() => fileInput.current?.click()}>
              <Icon name="upload" /> 选择文件
            </button>
          </div>
          <input
            ref={dirInput}
            type="file"
            hidden
            multiple
            // @ts-expect-error non-standard but widely supported
            webkitdirectory=""
            onChange={(e) => e.target.files && handle([...e.target.files])}
          />
          <input ref={fileInput} type="file" hidden multiple accept=".json,application/json" onChange={(e) => e.target.files && handle([...e.target.files])} />
        </div>
      </div>

      {invalid.length > 0 && (
        <div className="card">
          <div className="section-title">需要修正的文件 ({invalid.filter((i) => i.errors.length).length} 错误 / {invalid.filter((i) => !i.errors.length).length} 警告)</div>
          <p className="note">把下面的错误信息复制给生成题目的 AI，让它修正后重新导出。</p>
          {invalid.map((f, i) => (
            <div key={i} className={`invalid ${f.errors.length ? 'err' : 'warn'}`}>
              <div className="row between">
                <b>{f.file}</b>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`文件 ${f.file} 未通过 breadboard-challenge/1 校验：\n${[...f.errors, ...f.warnings].map((e) => '- ' + e).join('\n')}\n请修正并输出完整 JSON。`);
                    notify('已复制错误信息');
                  }}
                >
                  复制给 AI
                </button>
              </div>
              <ul>
                {f.errors.map((e, j) => (
                  <li key={j}>✕ {e}</li>
                ))}
                {f.warnings.map((e, j) => (
                  <li key={`w${j}`} className="w">
                    ! {e}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="section-title row between">
          <span>已加载的题目 ({challenges.length})</span>
          {readImported().length > 0 && (
            <button onClick={clearAll}>
              <Icon name="trash" /> 移除全部导入
            </button>
          )}
        </div>
        <table className="ch-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>类型</th>
              <th>难度</th>
              <th>来源</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {challenges.map((c) => (
              <tr key={c.id}>
                <td>
                  <b>{c.title}</b>
                  <div className="muted small">
                    {c.id} · {c.file}
                  </div>
                </td>
                <td>{c.kind === 'lesson' ? '课程' : '挑战'}</td>
                <td>{'★'.repeat(c.level)}</td>
                <td>{c.source === 'folder' ? 'challenges/ 文件夹' : '导入'}</td>
                <td className="row">
                  <button className="primary" onClick={() => open(c.id)}>
                    打开
                  </button>
                  {c.source === 'imported' && c.file && <button onClick={() => remove(c.file!)}>移除</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="section-title row between">
          <span>让 AI 帮你出题</span>
          {aiPrompt && (
            <button
              className="primary"
              onClick={() => {
                navigator.clipboard.writeText(aiPrompt);
                notify('提示词已复制，粘贴给 ChatGPT / Claude 即可');
              }}
            >
              复制 AI 提示词
            </button>
          )}
        </div>
        <p>
          复制下面的提示词，填写主题和难度后发给任意 AI。它会生成符合规范的 JSON 文件；把文件保存后放进 <code>challenges/</code> 或在上方导入。
          完整规范见项目中的 <code>docs/CHALLENGE_FORMAT.md</code>。
        </p>
        {aiPrompt ? <pre className="prompt-box">{aiPrompt}</pre> : <p className="muted">（docs/AI_PROMPT.md 尚未生成）</p>}
        {formatDoc && (
          <>
            <button onClick={() => setShowDoc(!showDoc)}>{showDoc ? '收起' : '展开'}完整格式规范</button>
            {showDoc && (
              <div className="doc-box">
                <Md text={formatDoc} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
