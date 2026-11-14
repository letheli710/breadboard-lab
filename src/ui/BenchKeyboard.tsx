// Keyboard (and screen-reader) way to build on the bench, next to free 3D placement: place a
// part by typing hole ids ("a12 a16"), list the placed parts with Select / Move / Delete, and a
// plain-text description of the board. Uses the same store actions as the 3D view (clickHole,
// movePart, removePart), so validation, toasts and undo are identical.

import { useId, useMemo, useState, type FormEvent } from 'react';
import { HOLE_MAP, holeLabel } from '../core/breadboard';
import { tr } from '../core/i18n';
import { PARTS, PART_ORDER, describeComponent, terminalName } from '../core/parts';
import type { PartType, PlacedPart } from '../core/types';
import { useStore } from '../state/store';

/** "A12, a16" / "a12→a16" / "tp1 tn1" → valid lower-case hole ids, or the first bad token. */
export function parseHoles(text: string): { holes: string[]; bad: string | null } {
  const toks = text
    .toLowerCase()
    .split(/[\s,，;；→>-]+/)
    .filter(Boolean);
  const bad = toks.find((t) => !HOLE_MAP.has(t)) ?? null;
  return { holes: bad ? [] : toks, bad };
}

/** "470 Ω resistor", "jumper wire" … */
const partDesc = (p: PlacedPart) => (p.type === 'wire' ? PARTS.wire.name : describeComponent(p as unknown as Parameters<typeof describeComponent>[0]));

const holesNeeded = (t: PartType) => (PARTS[t].placement.kind === 'footprint' ? 1 : 2);

/** "R1 (470 Ω resistor): pin 1 c5, pin 2 c9" */
export function describePart(p: PlacedPart): string {
  const pins = Object.entries(p.pins)
    .map(
      ([pin, h]) => `${p.type === 'wire' ? (pin === 'a' ? tr('起点', 'start') : tr('终点', 'end')) : terminalName(p.type, PARTS[p.type].terminalOf[pin] ?? pin)} ${holeLabel(h)}`,
    )
    .join(tr('，', ', '));
  const many = Object.keys(p.pins).length > 6;
  const where = many
    ? tr(`占 ${Object.values(p.pins)[0]} … ${Object.values(p.pins).slice(-1)[0]}`, `on ${Object.values(p.pins)[0]} … ${Object.values(p.pins).slice(-1)[0]}`)
    : pins;
  return tr(`${p.ref}（${partDesc(p)}）：${where}`, `${p.ref} (${partDesc(p)}): ${where}`);
}

/** One-paragraph text version of the board for screen readers. */
export function boardDescription(parts: PlacedPart[]): string {
  if (!parts.length) return tr('面包板上还没有元件。', 'The breadboard is empty.');
  return (
    tr(`面包板上有 ${parts.length} 个元件：`, `${parts.length} part${parts.length > 1 ? 's' : ''} on the breadboard: `) +
    parts.map(describePart).join(tr('；', '; ')) +
    tr('。', '.')
  );
}

function MoveForm({ part, onDone }: { part: PlacedPart; onDone: () => void }) {
  const movePart = useStore((s) => s.movePart);
  const fp = PARTS[part.type].placement.kind === 'footprint';
  const [text, setText] = useState(fp ? Object.values(part.pins)[0] : Object.values(part.pins).join(' '));
  const [err, setErr] = useState<string | null>(null);
  const id = useId();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const { holes, bad } = parseHoles(text);
    const keys = Object.keys(part.pins);
    let pins: Record<string, string> | null = null;
    const def = PARTS[part.type].placement;
    if (bad) setErr(tr(`没有 ${bad} 这个孔`, `There is no hole ${bad}`));
    else if (def.kind === 'footprint') {
      pins = holes.length === 1 ? def.footprint(holes[0]) : null;
      if (!pins) setErr(holes.length === 1 ? tr('这里放不下', "Doesn't fit there") : tr('写第一只脚的孔位', 'Type the hole of the first pin'));
    } else if (holes.length !== keys.length) setErr(tr(`要写 ${keys.length} 个孔位`, `Type ${keys.length} holes`));
    else pins = Object.fromEntries(keys.map((k, i) => [k, holes[i]]));
    if (!pins) return;
    // movePart refuses (with a toast) a move onto used holes
    if (movePart(part.id, pins)) onDone();
    else setErr(tr('不能移到那里（孔位已被占用）', "Can't move there (holes in use)"));
  };
  return (
    <form className="kb-move" onSubmit={submit}>
      <label htmlFor={id}>
        {fp ? tr(`${part.ref} 第一只脚移到`, `Move ${part.ref}, first pin to`) : tr(`${part.ref} 移到（按引脚顺序）`, `Move ${part.ref} to (pins in order)`)}
      </label>
      <input id={id} value={text} onChange={(e) => setText(e.target.value)} aria-invalid={!!err} aria-describedby={err ? `${id}-err` : undefined} spellCheck={false} autoFocus />
      <button type="submit">{tr('移动', 'Move')}</button>
      <button type="button" onClick={onDone}>
        {tr('取消', 'Cancel')}
      </button>
      {err && (
        <div id={`${id}-err`} className="form-err" role="alert">
          {err}
        </div>
      )}
    </form>
  );
}

export function BenchKeyboard() {
  const layout = useStore((s) => s.layout);
  const selectedId = useStore((s) => s.selectedId);
  const [type, setType] = useState<PartType>('resistor');
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState('');
  const [moving, setMoving] = useState<string | null>(null);
  const id = useId();
  const n = holesNeeded(type);

  const place = (e: FormEvent) => {
    e.preventDefault();
    setDone('');
    const { holes, bad } = parseHoles(text);
    if (bad)
      return setErr(
        tr(
          `没有 ${bad} 这个孔（行 a–j 或电源轨 tp / tn / bp / bn，加列号 1–30 之类，例如 a12、tp3）`,
          `There is no hole ${bad} (a row a–j or a rail tp / tn / bp / bn, then the column, e.g. a12, tp3)`,
        ),
      );
    if (holes.length !== n)
      return setErr(n === 1 ? tr('写一个孔位：元件第一只脚的位置', 'Type one hole: where the first pin goes') : tr('写两个孔位，例如 a12 a16', 'Type two holes, e.g. a12 a16'));
    const st = useStore.getState();
    const before = st.layout.parts.length;
    const prevTool = st.tool;
    st.cancelPlacement();
    st.setTool(type);
    for (const h of holes) useStore.getState().clickHole(h);
    const after = useStore.getState();
    // a refused placement leaves a half-placed part behind: drop it (the store's toast says why)
    after.cancelPlacement();
    after.setTool(prevTool === type ? 'select' : prevTool);
    if (after.layout.parts.length === before) {
      setErr(after.toast ?? tr('放不下', "Couldn't place it"));
      return;
    }
    const p = after.layout.parts[after.layout.parts.length - 1];
    setErr(null);
    setText('');
    setDone(tr(`已放置 ${describePart(p)}`, `Placed ${describePart(p)}`));
  };

  const select = (p: PlacedPart) => {
    const st = useStore.getState();
    st.select(p.id);
    st.setPanel('inspect');
    requestAnimationFrame(() => document.getElementById('side-panel')?.focus());
  };

  const options = useMemo(() => PART_ORDER.map((t) => ({ t, name: PARTS[t].name })), []);

  return (
    <details className="kb-bench">
      <summary>{tr('用键盘搭电路：按孔位放置、移动、删除', 'Build with the keyboard: place, move and delete by hole id')}</summary>
      <form className="kb-place" onSubmit={place}>
        <label>
          <span>{tr('元件', 'Part')}</span>
          <select value={type} onChange={(e) => setType(e.target.value as PartType)}>
            {options.map((o) => (
              <option key={o.t} value={o.t}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{n === 1 ? tr('第一只脚的孔位', 'Hole of the first pin') : tr('两只脚的孔位', 'Holes of the two pins')}</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={n === 1 ? 'e10' : 'a12 a16'}
            aria-invalid={!!err}
            aria-describedby={`${id}-help ${err ? `${id}-err` : ''}`}
            spellCheck={false}
            autoComplete="off"
          />
        </label>
        <button type="submit" className="primary">
          {tr('放置', 'Place')}
        </button>
        <p id={`${id}-help`} className="note">
          {tr(
            '孔位 = 行字母 + 列号：主区 a–j，电源轨 tp（上 +）tn（上 −）bp（下 +）bn（下 −），例如 a12、tp3。两只脚的元件按引脚顺序写（电池 + −，LED 正极 负极）。参数（阻值等）先在“属性”里设好，或放好后选中再改。',
            'A hole is a row letter + column: main area a–j, rails tp (top +), tn (top −), bp (bottom +), bn (bottom −), e.g. a12, tp3. Two-pin parts in pin order (battery + −, LED anode cathode). Set values (resistance …) under Properties first, or select the part afterwards.',
          )}
        </p>
        {err && (
          <div id={`${id}-err`} className="form-err" role="alert">
            {err}
          </div>
        )}
        <div className="sr-only" aria-live="polite">
          {done}
        </div>
      </form>

      {layout.parts.length > 0 && (
        <table className="kb-parts netlist">
          <caption>{tr('面包板上的元件', 'Parts on the breadboard')}</caption>
          <thead>
            <tr>
              <th scope="col">{tr('元件', 'Part')}</th>
              <th scope="col">{tr('引脚 → 孔位', 'Pins → holes')}</th>
              <th scope="col">{tr('操作', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {layout.parts.map((p) => (
              <tr key={p.id} className={p.id === selectedId ? 'on' : ''}>
                <th scope="row">
                  {p.ref} <small>{partDesc(p)}</small>
                </th>
                <td>
                  {moving === p.id ? (
                    <MoveForm part={p} onDone={() => setMoving(null)} />
                  ) : Object.keys(p.pins).length > 6 ? (
                    `${Object.values(p.pins)[0]} … ${Object.values(p.pins).slice(-1)[0]}`
                  ) : (
                    Object.entries(p.pins)
                      .map(([pin, h]) => `${p.type === 'wire' ? '' : terminalName(p.type, PARTS[p.type].terminalOf[pin] ?? pin) + ' '}${h}`)
                      .join(', ')
                  )}
                </td>
                <td className="kb-actions">
                  <button onClick={() => select(p)} aria-label={tr(`选中 ${p.ref}`, `Select ${p.ref}`)}>
                    {tr('选中', 'Select')}
                  </button>
                  <button onClick={() => setMoving(p.id)} aria-label={tr(`移动 ${p.ref}`, `Move ${p.ref}`)}>
                    {tr('移动', 'Move')}
                  </button>
                  <button className="danger" onClick={() => useStore.getState().removePart(p.id)} aria-label={tr(`删除 ${p.ref}`, `Delete ${p.ref}`)}>
                    {tr('删除', 'Delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="kb-desc">{boardDescription(layout.parts)}</p>
    </details>
  );
}
