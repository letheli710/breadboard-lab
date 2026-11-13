import { useRef, useState } from 'react';
import { getLang, tr } from '../core/i18n';
import { chapterById } from '../core/problem/chapters';
import { importFiles, loadAll, readImported, writeImported } from '../state/challenges';
import { entryTitle, loadProblems } from '../state/problems';
import { useStore } from '../state/store';
import { Icon } from './Icons';
import { Md } from './Panel';

const docs = import.meta.glob('../../docs/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const aiPromptDoc = Object.entries(docs).find(([k]) => k.endsWith('AI_PROMPT.md'))?.[1] ?? '';

/** The copy-paste prompt for the current language: the first ```text block under its "## " section. */
function aiPromptFor(doc: string): string {
  const heading = getLang() === 'en' ? '## English prompt' : '## 中文提示词';
  const at = doc.indexOf(heading);
  const m = at >= 0 ? /```text\n([\s\S]*?)\n```/.exec(doc.slice(at)) : null;
  return m ? m[1] : doc;
}
const formatDoc = Object.entries(docs).find(([k]) => k.endsWith('CHALLENGE_FORMAT.md'))?.[1] ?? '';
const problemPromptDoc = Object.entries(docs).find(([k]) => k.endsWith('AI_PROMPT_PROBLEMS.md'))?.[1] ?? '';
const problemFormatDoc = Object.entries(docs).find(([k]) => k.endsWith('PROBLEM_FORMAT.md'))?.[1] ?? '';

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
  const problems = useStore((s) => s.problems);
  const challengeInvalid = useStore((s) => s.invalid);
  const problemInvalid = useStore((s) => s.problemInvalid);
  const invalid = [...challengeInvalid.map((f) => ({ ...f, fmt: 'breadboard-challenge/1' })), ...problemInvalid.map((f) => ({ ...f, fmt: 'circuit-problem/1' }))];
  const setChallenges = useStore((s) => s.setChallenges);
  const setProblems = useStore((s) => s.setProblems);
  const open = useStore((s) => s.openChallenge);
  const openProblem = useStore((s) => s.openProblem);
  const notify = useStore((s) => s.notify);
  const aiPrompt = aiPromptFor(aiPromptDoc);
  const problemPrompt = problemPromptDoc ? aiPromptFor(problemPromptDoc) : '';
  const [drag, setDrag] = useState(false);
  /** the last import could not be saved (storage full / unavailable) */
  const [saveFailed, setSaveFailed] = useState<number | null>(null);
  const [showDoc, setShowDoc] = useState(false);
  const [showProblemDoc, setShowProblemDoc] = useState(false);
  const dirInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const refresh = () => {
    const r = loadAll();
    setChallenges(r.challenges, r.invalid);
    const pr = loadProblems();
    setProblems(pr.problems, pr.invalid);
    return [...r.invalid, ...pr.invalid];
  };
  const handle = async (files: File[]) => {
    const { added, skipped, saved } = await importFiles(files);
    if (!saved) {
      setSaveFailed(files.length - skipped);
      return;
    }
    setSaveFailed(null);
    const bad = refresh().filter((i) => i.errors.length).length;
    notify(
      tr(
        `导入了 ${added} 个文件${skipped ? `，跳过 ${skipped} 个非 JSON 文件` : ''}${bad ? `，其中有 ${bad} 个格式错误（见下方）` : ''}`,
        `Imported ${added} file(s)${skipped ? `, skipped ${skipped} non-JSON file(s)` : ''}${bad ? `; ${bad} have format errors (see below)` : ''}`,
      ),
    );
  };
  const remove = (file: string) => {
    writeImported(readImported().filter((f) => f.file !== file));
    refresh();
  };
  const clearAll = () => {
    if (!confirm(tr('移除所有导入的题目？（challenges/ 和 problems/ 文件夹里的题目不受影响）', 'Remove all imported files? (Files in the challenges/ and problems/ folders are not affected.)'))) return;
    writeImported([]);
    refresh();
  };

  return (
    <div className="import-page">
      <div className="card import-hero">
        <div className="eyebrow">{tr('题库导入 IMPORT', 'IMPORT')}</div>
        <h1>{tr('导入题目文件夹', 'Import a challenge or problem folder')}</h1>
        <p>
          {tr('题目都是 JSON 文件，有两种格式：面包板题', 'All content is JSON, in two formats: breadboard challenges')} <code>breadboard-challenge/1</code>
          {tr('，和理论练习题', ', and theory practice problems')} <code>circuit-problem/1</code>
          {tr('。程序按每个文件的 "format" 自动分类，一个文件夹里两种可以混放。有两种方式加载：', '. Each file is routed by its "format", so one folder may mix both. There are two ways to load them:')}
        </p>
        <ol>
          <li>
            <b>
              {tr('放进项目的', 'Put them in the project\'s')} <code>challenges/</code> {tr('或', 'or')} <code>problems/&lt;chapter&gt;/</code> {tr('文件夹', 'folder')}
            </b>
            {tr('——开发模式下自动加载并实时刷新（适合长期保存的题库）。', ' — loaded automatically and refreshed live in dev mode (best for a collection you keep).')}
          </li>
          <li>
            <b>{tr('在这里导入', 'Import them here')}</b>
            {tr('——拖入整个文件夹或若干 .json 文件，保存在浏览器里。', ' — drop a whole folder or some .json files; they are kept in this browser.')}
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
          <div>{tr('把题目文件夹或 .json 文件拖到这里', 'Drop a folder or .json files here')}</div>
          {saveFailed !== null && (
            <div className="import-error" role="alert">
              {tr(
                `导入失败：浏览器拒绝保存这 ${saveFailed} 个文件（存储空间已满或被禁用），所以一个也没有导入。可以先移除一些已导入的文件再试，或者把题目放进项目的 challenges/ / problems/ 文件夹。`,
                `Import failed: the browser refused to save these ${saveFailed} file(s) (storage is full or disabled), so none were imported. Remove some imported files and try again, or put the files in the project's challenges/ / problems/ folders instead.`,
              )}
            </div>
          )}
          <div className="row">
            <button className="primary" onClick={() => dirInput.current?.click()}>
              <Icon name="folder" /> {tr('选择文件夹', 'Choose folder')}
            </button>
            <button onClick={() => fileInput.current?.click()}>
              <Icon name="upload" /> {tr('选择文件', 'Choose files')}
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
          <div className="section-title">
            {tr('需要修正的文件', 'Files to fix')} ({invalid.filter((i) => i.errors.length).length} {tr('错误', 'errors')} / {invalid.filter((i) => !i.errors.length).length}{' '}
            {tr('警告', 'warnings')})
          </div>
          <p className="note">{tr('把下面的错误信息复制给生成题目的 AI，让它修正后重新导出。', 'Copy these messages to the AI that wrote the challenge and ask it to fix and re-export the file.')}</p>
          {invalid.map((f, i) => (
            <div key={i} className={`invalid ${f.errors.length ? 'err' : 'warn'}`}>
              <div className="row between">
                <b>{f.file}</b>
                <button
                  onClick={() => {
                    const list = [...f.errors, ...f.warnings].map((e) => '- ' + e).join('\n');
                    navigator.clipboard.writeText(
                      tr(
                        `文件 ${f.file} 未通过 ${f.fmt} 校验：\n${list}\n请修正并输出完整 JSON。`,
                        `The file ${f.file} failed ${f.fmt} validation:\n${list}\nPlease fix it and output the complete JSON.`,
                      ),
                    );
                    notify(tr('已复制错误信息', 'Messages copied'));
                  }}
                >
                  {tr('复制给 AI', 'Copy for the AI')}
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
          <span>
            {tr('已加载的题目', 'Loaded content')} ({challenges.length + problems.length})
          </span>
          {readImported().length > 0 && (
            <button onClick={clearAll}>
              <Icon name="trash" /> {tr('移除全部导入', 'Remove all imported')}
            </button>
          )}
        </div>
        <table className="ch-table">
          <thead>
            <tr>
              <th>{tr('标题', 'Title')}</th>
              <th>{tr('类型', 'Type')}</th>
              <th>{tr('难度', 'Level')}</th>
              <th>{tr('来源', 'Source')}</th>
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
                <td>{c.kind === 'lesson' ? tr('课程', 'Lesson') : tr('挑战', 'Challenge')}</td>
                <td>{'★'.repeat(c.level)}</td>
                <td>{c.source === 'folder' ? tr('challenges/ 文件夹', 'challenges/ folder') : tr('导入', 'Imported')}</td>
                <td className="row">
                  <button className="primary" onClick={() => open(c.id)}>
                    {tr('打开', 'Open')}
                  </button>
                  {c.source === 'imported' && c.file && <button onClick={() => remove(c.file!)}>{tr('移除', 'Remove')}</button>}
                </td>
              </tr>
            ))}
            {problems.map((p) => (
              <tr key={`p:${p.id}`}>
                <td>
                  <b>{entryTitle(p)}</b>
                  <div className="muted small">
                    {p.id} · {p.file}
                  </div>
                </td>
                <td>
                  {tr('理论题', 'Problem')} <span className="muted small">· {chapterById(p.chapter)?.title()}</span>
                </td>
                <td>{'★'.repeat(p.level)}</td>
                <td>{p.source === 'folder' ? tr('problems/ 文件夹', 'problems/ folder') : tr('导入', 'Imported')}</td>
                <td className="row">
                  <button className="primary" onClick={() => openProblem(p.id)}>
                    {tr('打开', 'Open')}
                  </button>
                  {p.source === 'imported' && p.file && <button onClick={() => remove(p.file!)}>{tr('移除', 'Remove')}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="section-title row between">
          <span>{tr('让 AI 帮你出题', 'Let an AI write challenges')}</span>
          {aiPrompt && (
            <button
              className="primary"
              onClick={() => {
                navigator.clipboard.writeText(aiPrompt);
                notify(tr('提示词已复制，粘贴给 ChatGPT / Claude 即可', 'Prompt copied — paste it into ChatGPT / Claude'));
              }}
            >
              {tr('复制 AI 提示词', 'Copy AI prompt')}
            </button>
          )}
        </div>
        <p>
          {tr(
            '复制下面的提示词，填写主题和难度后发给任意 AI。它会生成符合规范的 JSON 文件；把文件保存后放进 ',
            'Copy the prompt below, fill in a topic and difficulty, and send it to any AI. It writes a JSON file in the right format; save it and put it in ',
          )}
          <code>challenges/</code>
          {tr(' 或在上方导入。完整规范见项目中的 ', ' or import it above. The full spec is in the project at ')}
          <code>docs/CHALLENGE_FORMAT.md</code>
          {tr('。', '.')}
        </p>
        {aiPrompt ? <pre className="prompt-box">{aiPrompt}</pre> : <p className="muted">{tr('（docs/AI_PROMPT.md 尚未生成）', '(docs/AI_PROMPT.md is missing)')}</p>}
        {formatDoc && (
          <>
            <button onClick={() => setShowDoc(!showDoc)}>{showDoc ? tr('收起完整格式规范', 'Hide the full format spec') : tr('展开完整格式规范', 'Show the full format spec')}</button>
            {showDoc && (
              <div className="doc-box">
                <Md text={formatDoc} />
              </div>
            )}
          </>
        )}
      </div>

      <div className="card">
        <div className="section-title row between">
          <span>{tr('让 AI 出理论练习题', 'Let an AI write theory problems')}</span>
          {problemPrompt && (
            <button
              className="primary"
              onClick={() => {
                navigator.clipboard.writeText(problemPrompt);
                notify(tr('提示词已复制，粘贴给 ChatGPT / Claude 即可', 'Prompt copied — paste it into ChatGPT / Claude'));
              }}
            >
              {tr('复制理论题提示词', 'Copy problem prompt')}
            </button>
          )}
        </div>
        <p>
          {tr('理论题（看电路图、算数）由 AI 出题，每个数值答案都会被理想电路分析引擎重算核对。填写章节、知识点和难度后发给 AI，把生成的文件放进 ', 'Theory problems (read a schematic, compute values) are written by an AI, and every numeric answer is recomputed by the ideal circuit-analysis engine. Fill in the chapter, topic and difficulty, send it to an AI, and put the files in ')}
          <code>problems/&lt;chapter&gt;/</code>
          {tr('，运行 ', ', run ')}
          <code>npm run validate</code>
          {tr('，或直接在上方导入。规范见 ', ', or import them above. Spec: ')}
          <code>docs/PROBLEM_FORMAT.md</code>
          {tr('。', '.')}
        </p>
        {problemPrompt ? <pre className="prompt-box">{problemPrompt}</pre> : <p className="muted">{tr('（docs/AI_PROMPT_PROBLEMS.md 尚未生成）', '(docs/AI_PROMPT_PROBLEMS.md is missing)')}</p>}
        {problemFormatDoc && (
          <>
            <button onClick={() => setShowProblemDoc(!showProblemDoc)}>{showProblemDoc ? tr('收起完整格式规范', 'Hide the full format spec') : tr('展开完整格式规范', 'Show the full format spec')}</button>
            {showProblemDoc && (
              <div className="doc-box">
                <Md text={problemFormatDoc} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
