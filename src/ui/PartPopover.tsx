// A part's details, beside it on the board: open on a left click (and right after placing a part),
// so a value can be changed at any point of a lesson without leaving the step. Settings, a short
// live reading, and the actions: swap legs / turn, more settings (the Properties tab), delete.

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { amps, volts } from '../core/format';
import { getLang, tr } from '../core/i18n';
import { isMcuBoard } from '../core/mcu';
import { PARTS } from '../core/parts';
import { useBenchUi } from '../state/benchUi';
import { ledOf, useDerived } from '../state/derived';
import { useReadingsHidden } from '../state/readingsHidden';
import { useStore } from '../state/store';
import { swapLegs, swappedPins, turnBenchPart } from '../three/benchActions';
import { partAnchor } from '../three/Parts';
import { assignSlots, isBenchPart } from '../three/slots';
import { getViewVersion, projectPoint, subscribeView } from '../three/view';
import { PartIcon } from './Icons';
import { PropEditor, useEditorLabels } from './Inspector';

const GAP = 18;
const MARGIN = 8;

export function PartPopover() {
  const id = useBenchUi((s) => s.popoverId);
  const close = useBenchUi((s) => s.openPopover);
  const layout = useStore((s) => s.layout);
  const updateProps = useStore((s) => s.updateProps);
  const removePart = useStore((s) => s.removePart);
  const setPanel = useStore((s) => s.setPanel);
  const derived = useDerived();
  const hideReadings = useReadingsHidden();
  const view = useSyncExternalStore(subscribeView, getViewVersion);
  const root = useRef<HTMLDivElement>(null);
  useEditorLabels(root);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const part = layout.parts.find((p) => p.id === id);

  // beside the part's anchor, on whichever side has room; follows the camera
  useLayoutEffect(() => {
    const el = root.current;
    const host = el?.parentElement;
    if (!el || !host || !part) return;
    const slot = assignSlots(layout.parts).get(part.id) ?? 0;
    const a = partAnchor(part, slot);
    const p = projectPoint(a.x, a.y, a.z);
    const hr = host.getBoundingClientRect();
    if (!p) return setPos(null);
    const x = p.x - hr.left;
    const y = p.y - hr.top;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let left = x + GAP;
    if (left + w > hr.width - MARGIN) left = x - GAP - w;
    left = Math.max(MARGIN, Math.min(hr.width - w - MARGIN, left));
    const top = Math.max(MARGIN, Math.min(hr.height - h - MARGIN, y - 40));
    setPos((cur) => (cur && Math.abs(cur.left - left) < 0.5 && Math.abs(cur.top - top) < 0.5 ? cur : { left, top }));
  }, [part, layout, view]);

  if (!part) return null;
  const def = PARTS[part.type];
  const ref = part.ref;
  const I = derived.sim.current.get(ref);
  const Vd = derived.sim.vdrop.get(ref);
  const src = part.type === 'function_gen' ? undefined : derived.sim.sources.get(ref);
  const led = ledOf(derived, ref);
  let live: string | null = null;
  let tone = '';
  if (src) live = tr(`端电压 ${volts(src.terminalVoltage)} · 输出 ${amps(src.current)}`, `${volts(src.terminalVoltage)} at the terminals · ${amps(src.current)} out`);
  else if (hideReadings) live = null;
  else if (led) {
    if (led.burnt) [live, tone] = [tr('烧坏了：电流太大', 'Burnt out: too much current'), 'bad'];
    else if (!led.on) [live, tone] = [tr('不亮：没有电流（回路没通，或者接反了）', 'Off: no current (open circuit, or the wrong way round)'), 'warn'];
    else live = tr(`亮 · 电流 ${amps(led.current)}`, `On · ${amps(led.current)}`);
  } else if (I !== undefined && Vd !== undefined && part.type !== 'wire')
    live = tr(`电流 ${amps(Math.abs(I))} · 两端 ${volts(Math.abs(Vd))}`, `${amps(Math.abs(I))} · ${volts(Math.abs(Vd))} across`);
  const swappable = part.type !== 'wire' && !!swappedPins(part.id);
  const bench = isBenchPart(part.type);

  return (
    <div
      ref={root}
      className="part-pop"
      role="dialog"
      aria-label={tr(`${ref} 的详情`, `${ref} details`)}
      style={pos ? { left: pos.left, top: pos.top } : { visibility: 'hidden' }}
      onPointerDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <div className="part-pop-head">
        <PartIcon type={part.type} size={30} />
        <div>
          <div className="eyebrow">{ref}</div>
          <b>
            {def.name}
            {getLang() === 'zh' && <small lang="en"> {def.nameEn}</small>}
          </b>
        </div>
        <button className="part-pop-x" onClick={() => close(null)} aria-label={tr('关闭', 'Close')} title={tr('关闭 (Esc)', 'Close (Esc)')}>
          ×
        </button>
      </div>
      <div className="part-pop-body">
        {isMcuBoard(part.type) ? (
          <p className="note">{tr('每个引脚的模式在右侧“属性”里设置。', "Each pin's mode is set in Properties on the right.")}</p>
        ) : (
          <PropEditor type={part.type} props={part.props} onChange={(p) => updateProps(part.id, p)} />
        )}
      </div>
      {live && <div className={`part-pop-live ${tone}`}>{live}</div>}
      <div className="part-pop-acts">
        {swappable && (
          <button onClick={() => swapLegs(part.id)} title={tr('两只脚互换孔位（LED、二极管、电池会反向）', 'Swap the two legs (an LED, diode or battery turns round)')}>
            ⇄ {part.type === 'led' || part.type === 'diode' ? tr('翻转方向', 'Flip') : tr('对调两脚', 'Swap legs')}
          </button>
        )}
        {bench && (
          <button onClick={() => turnBenchPart(part.id)} title={tr('转 90°，让导线更顺 (T)', 'Turn 90° to tidy the leads (T)')} aria-keyshortcuts="T">
            ↻ {tr('转 90°', 'Turn 90°')}
          </button>
        )}
        <button onClick={() => setPanel('inspect')}>{tr('更多设置', 'More settings')}</button>
        <button className="danger" onClick={() => removePart(part.id)} aria-keyshortcuts="Delete">
          {tr('删除', 'Delete')}
        </button>
      </div>
    </div>
  );
}
