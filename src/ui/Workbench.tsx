import { useEffect, useRef, useState } from 'react';
import { tr } from '../core/i18n';
import { PARTS, PART_ORDER, nextScopeChannel } from '../core/parts';
import { volts } from '../core/format';
import { vavg } from '../core/transient';
import { HOLE_MAP, holeLabel, stripLabel } from '../core/breadboard';
import type { PartType } from '../core/types';
import { useDerived } from '../state/derived';
import { isPartTool, occupied, useStore, type Tool } from '../state/store';
import { useBenchUi } from '../state/benchUi';
import { rightPick } from '../three/Drag';
import { BenchMenu } from './BenchMenu';
import { Carousel } from './Carousel';
import { PartPopover } from './PartPopover';
import { confirmPending, setPending, shiftHole, useTouchPick } from '../three/touchPick';
import { Scene, VIEWS, type ViewName } from '../three/Scene';
import { emitCameraView } from '../three/common';
import { ConfirmButton } from './Confirm';
import { E2E } from '../e2e/flag';
import { E2ECrash } from '../e2e/Probe';
import { BenchKeyboard, boardDescription } from './BenchKeyboard';
import { ErrorBoundary } from './ErrorBoundary';
import { Icon, PartIcon } from './Icons';
import { QualityToggle } from './QualityToggle';
import { Scope } from './Scope';
import { prefersReducedMotion } from './reveal';
import { Mixed } from './Mixed';

const smooth = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth');

const groups = (): { title: string; items: Tool[] }[] => [
  { title: tr('工具', 'Tools'), items: ['select', 'probe'] },
  { title: tr('电源', 'Power'), items: PART_ORDER.filter((t) => PARTS[t].category === 'power') },
  { title: tr('连线', 'Wiring'), items: ['wire'] },
  { title: tr('元件', 'Parts'), items: PART_ORDER.filter((t) => PARTS[t].category === 'basic' && t !== 'opamp') },
  { title: tr('芯片 ICs', 'ICs'), items: ['opamp'] },
  { title: tr('输入', 'Inputs'), items: PART_ORDER.filter((t) => PARTS[t].category === 'input') },
  { title: tr('仪器', 'Instruments'), items: (['ammeter', 'function_gen', 'scope_probe'] as PartType[]).filter((t) => PARTS[t].category === 'instrument') },
  { title: tr('单片机 MCU', 'MCU boards'), items: PART_ORDER.filter((t) => PARTS[t].category === 'mcu') },
  { title: tr('器件 Devices', 'Devices'), items: PART_ORDER.filter((t) => PARTS[t].category === 'device') },
  { title: tr('传感器 Sensors', 'Sensors'), items: PART_ORDER.filter((t) => PARTS[t].category === 'sensor') },
];

const toolName = (t: Tool) =>
  t === 'select' ? tr('选择 / 操作', 'Select / use') : t === 'probe' ? tr('万用表', 'Multimeter') : t === 'eraser' ? tr('橡皮擦', 'Eraser') : PARTS[t].name;

function Toolbox() {
  const tool = useStore((s) => s.tool);
  const setTool = useStore((s) => s.setTool);
  const kit = useBenchUi((s) => s.kit);
  const box = useRef<HTMLDivElement>(null);
  // the full parts list is taller than most screens: say so, and let one click scroll on
  const [more, setMore] = useState({ up: false, down: false });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => {
      const horiz = el.scrollWidth > el.clientWidth + 2 && el.scrollHeight <= el.clientHeight + 2;
      const pos = horiz ? el.scrollLeft : el.scrollTop;
      const max = horiz ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
      setMore((m) => (m.up === pos > 4 && m.down === pos < max - 4 ? m : { up: pos > 4, down: pos < max - 4 }));
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);
  const page = (dir: 1 | -1) => {
    const el = box.current;
    if (!el) return;
    const horiz = el.scrollWidth > el.clientWidth + 2 && el.scrollHeight <= el.clientHeight + 2;
    if (horiz) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: smooth() });
    else el.scrollBy({ top: dir * el.clientHeight * 0.8, behavior: smooth() });
  };
  return (
    <div className="toolbox-col" hidden={!kit}>
      <nav className={`toolbox-wrap ${more.up ? 'more-up' : ''} ${more.down ? 'more-down' : ''}`} aria-label={tr('元件箱', 'Parts toolbox')}>
        <div className="toolbox" ref={box}>
          {groups().map((g) => (
            <div key={g.title} className="tool-group" role="group" aria-label={g.title}>
              <div className="tool-group-title">
                <Mixed text={g.title} />
              </div>
              <div className="tool-grid">
                {g.items.map((t) => (
                  <button key={t} className={`tool ${tool === t ? 'on' : ''}`} aria-pressed={tool === t} onClick={() => setTool(tool === t ? 'select' : t)} title={toolName(t)}>
                    <PartIcon type={t} size={28} />
                    <span>
                      <Mixed text={toolName(t)} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {more.up && (
          <button className="toolbox-more up" onClick={() => page(-1)} tabIndex={-1} aria-hidden title={tr('向上滚动', 'Scroll back')}>
            ▲
          </button>
        )}
        {more.down && (
          <button className="toolbox-more down" onClick={() => page(1)} tabIndex={-1} aria-hidden title={tr('还有更多元件，点击或滚动查看', 'More parts below — click or scroll')}>
            {tr('更多', 'More')} ▼
          </button>
        )}
      </nav>
      {/* the eraser sits apart at the foot of the toolbox, away from the parts */}
      <div className="toolbox-foot">
        <button
          className={`tool eraser ${tool === 'eraser' ? 'on' : ''}`}
          aria-pressed={tool === 'eraser'}
          aria-keyshortcuts="E"
          onClick={() => setTool(tool === 'eraser' ? 'select' : 'eraser')}
          title={tr(
            '橡皮擦 (E)：点元件擦掉，按住拖过去连续擦；Ctrl+Z 撤回整笔',
            'Eraser (E): click a part to remove it, drag across parts to remove several; Ctrl+Z undoes the stroke',
          )}
        >
          <PartIcon type="eraser" size={28} />
          <span>{tr('橡皮擦', 'Eraser')}</span>
        </button>
      </div>
    </div>
  );
}

/** Is the primary pointer a finger (phone / tablet)? Follows the media query live. */
export function useCoarsePointer(): boolean {
  const query = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(pointer: coarse)') : null);
  const [coarse, setCoarse] = useState(() => !!query()?.matches);
  useEffect(() => {
    const q = query();
    if (!q) return;
    const on = () => setCoarse(q.matches);
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return coarse;
}

/** Touch: the candidate hole picked by a tap — its name, arrows to nudge it, and Place / Cancel. */
function TouchChip() {
  const pending = useTouchPick((s) => s.pending);
  const tool = useStore((s) => s.tool);
  const firstHole = useStore((s) => s.firstHole);
  const layout = useStore((s) => s.layout);
  if (!pending || !(isPartTool(tool) || tool === 'probe')) return null;
  const h = HOLE_MAP.get(pending);
  const busy = occupied(layout).get(pending);
  const nudge = (dc: number, dr: number) => {
    const n = shiftHole(pending, dc, dr);
    if (n) setPending(n);
  };
  const footprint = isPartTool(tool) && PARTS[tool].placement.kind === 'footprint';
  const place = tool === 'probe' ? tr('红表笔', 'Red probe') : footprint ? tr('放在这里', 'Place here') : firstHole ? tr('终点放这里', 'End here') : tr('起点放这里', 'Start here');
  return (
    <div className="touch-chip" role="group" aria-label={tr('选中的孔', 'Chosen hole')} data-hole={pending}>
      <div className="touch-chip-hole">
        <b>{holeLabel(pending)}</b>
        {h && <span>{stripLabel(h.strip)}</span>}
        {busy && <span className="warn">{tr(`已插 ${busy}`, `holds ${busy}`)}</span>}
      </div>
      <div className="touch-chip-nudge">
        <button onClick={() => nudge(-1, 0)} aria-label={tr('左移一孔', 'One hole left')}>
          ◀
        </button>
        <button onClick={() => nudge(0, -1)} aria-label={tr('上移一孔', 'One hole up')}>
          ▲
        </button>
        <button onClick={() => nudge(0, 1)} aria-label={tr('下移一孔', 'One hole down')}>
          ▼
        </button>
        <button onClick={() => nudge(1, 0)} aria-label={tr('右移一孔', 'One hole right')}>
          ▶
        </button>
      </div>
      <div className="touch-chip-act">
        <button className="primary" onClick={() => confirmPending()} aria-label={place}>
          <Icon name="check" size={16} /> <span>{place}</span>
        </button>
        {tool === 'probe' && <button onClick={() => confirmPending(true)}>{tr('黑表笔', 'Black probe')}</button>}
        <button onClick={() => setPending(null)} aria-label={tr('取消', 'Cancel')}>
          ✕
        </button>
      </div>
    </div>
  );
}

function Prompt() {
  const coarse = useCoarsePointer();
  const tool = useStore((s) => s.tool);
  const firstHole = useStore((s) => s.firstHole);
  const cancelPlacement = useStore((s) => s.cancelPlacement);
  const layout = useStore((s) => s.layout);
  let text: string;
  if (tool === 'eraser')
    text = tr(
      '橡皮擦：点元件擦掉，按住拖过去连续擦 · Ctrl+Z 撤回整笔 · Esc 或右键退出',
      'Eraser: click a part to remove it, drag across parts to remove several · Ctrl+Z undoes the stroke · Esc or right-click to stop',
    );
  else if (coarse && tool === 'select')
    text = tr(
      '单指拖元件移动它，拖空白处旋转 · 双指捏合缩放、双指拖动平移 · 点元件看详情，点孔（或长按）看它和哪些孔相连',
      'Drag a part to move it, drag empty space to rotate · pinch to zoom, two-finger drag to pan · tap a part for its details, tap (or long-press) a hole to see what it connects to',
    );
  else if (coarse && tool === 'probe') text = tr('万用表：点一个孔，再在下方选红表笔或黑表笔', 'Multimeter: tap a hole, then choose red or black probe below');
  else if (tool === 'select')
    text = tr(
      '左键点元件看详情、拖元件挪位置 · 右键单击元件出菜单 · 拖空白处或右键拖动平移，滚轮缩放，中键（或 Shift+拖动）旋转 · 选中电池等板外仪器按 T 转向',
      'Click a part for its details, drag it to move it · right-click a part for its menu · drag empty space or right-drag to pan, scroll to zoom, middle-drag (or Shift+drag) to rotate · T turns a selected battery or instrument',
    );
  else if (tool === 'probe')
    text = tr(
      '万用表：点击孔放红表笔；Shift + 点击放黑表笔（不放则默认接 GND）',
      'Multimeter: click a hole for the red probe; Shift + click for the black probe (GND if not placed)',
    );
  else {
    const pl = PARTS[tool].placement;
    text = pl.kind === 'footprint' ? pl.prompt : pl.prompts[firstHole ? 1 : 0] + (firstHole ? tr(`（起点 ${firstHole}）`, ` (from ${firstHole})`) : '');
    if (coarse) text += tr(' · 点一下选孔，再点一次（或点“放这里”）确认', ' · tap to pick a hole, tap it again (or press Place) to confirm');
    if (tool === 'scope_probe') {
      const ch = nextScopeChannel(layout);
      text += ch ? tr(` · 这个探头接 CH${ch}`, ` · this probe goes to CH${ch}`) : tr(' · 两个通道都已占用', ' · both channels are in use');
    }
  }
  return (
    <div className="prompt" aria-live="polite">
      {tool !== 'select' && <span className="prompt-tag">{toolName(tool)}</span>}
      {text}
      {firstHole ? (
        <button
          className="prompt-cancel"
          onClick={cancelPlacement}
          title={tr('放弃这只还没放完的元件（Esc / 右键 / Ctrl+Z）', 'Drop this half-placed part (Esc / right-click / Ctrl+Z)')}
        >
          {tr('取消这一步', 'Cancel')} <kbd>Esc</kbd>
        </button>
      ) : (
        tool !== 'select' && <kbd>Esc</kbd>
      )}
    </div>
  );
}

const VIEW_NAME: Record<ViewName, () => string> = {
  angle: () => tr('斜视', 'Angled'),
  top: () => tr('俯视', 'Top'),
  front: () => tr('平视', 'Front'),
  side: () => tr('侧视', 'Side'),
};

/** One button, top-right of the stage: each press moves to the next preset view. */
/** the preset last picked (module-level: the camera keeps its pose across a remounted bench, so the label must too) */
let lastView: ViewName = 'angle';

function ViewButton() {
  const [view, setView] = useState<ViewName>(() => lastView);
  const next = VIEWS[(VIEWS.indexOf(view) + 1) % VIEWS.length];
  return (
    <button
      className="view-btn"
      aria-label={tr(`视角：${VIEW_NAME[view]()}（按下切换到${VIEW_NAME[next]()}）`, `View: ${VIEW_NAME[view]()} (press for ${VIEW_NAME[next]()})`)}
      onClick={() => {
        setView(next);
        lastView = next;
        emitCameraView(next);
      }}
      title={tr(
        `切换视角（下一个：${VIEW_NAME[next]()}）· 也可以中键（或 Shift + 左键）拖动旋转、滚轮缩放、右键或空白处拖动平移`,
        `Switch view (next: ${VIEW_NAME[next]()}) · you can also middle-drag (or Shift + drag) to rotate, scroll to zoom, right-drag or drag empty space to pan`,
      )}
    >
      <Icon name="eye" />
      <span>{tr('视角', 'View')}</span>
      <b>{VIEW_NAME[view]()}</b>
    </button>
  );
}

function Multimeter() {
  const tool = useStore((s) => s.tool);
  const probe = useStore((s) => s.probe);
  const { nl, sim, ac } = useDerived();
  if (tool !== 'probe') return null;
  // under AC the meter (DC mode) shows the average of the waveform
  const nodeV = (net: string) => (ac && ac.nets.includes(net) ? vavg(ac.v(net)) : ac && net === ac.ground ? 0 : (sim.nodeV.get(net) ?? 0));
  const vOf = (h: string | null) => {
    if (!h) return { v: 0, net: sim.ground ?? 'GND' };
    const net = nl.holeNet.get(h);
    return { v: net ? nodeV(net) : NaN, net: net ?? tr('无连接', 'not connected') };
  };
  const r = vOf(probe.red);
  const b = vOf(probe.black);
  const reading = probe.red ? r.v - b.v : NaN;
  return (
    <div className="meter">
      <div className="meter-screen" role="status" aria-live="polite" aria-atomic="true">
        {Number.isFinite(reading) ? volts(reading) : probe.red ? tr('—— 悬空', '—— floating') : '-- V'}
      </div>
      <div className="meter-row">
        <span className="dot red" />
        {tr('红：', 'Red: ')}
        {probe.red ? holeLabel(probe.red) : tr('未放置', 'not placed')} {probe.red && `(${r.net})`}
      </div>
      <div className="meter-row">
        <span className="dot black" />
        {tr('黑：', 'Black: ')}
        {probe.black ? holeLabel(probe.black) : tr('GND（默认）', 'GND (default)')} {probe.black && `(${b.net})`}
      </div>
      <p className="meter-note">
        {tr(
          '电压永远是“两点之间”的差。只放红表笔时，读数就是这一点相对 GND 的电压。',
          'Voltage is always a difference between two points. With only the red probe placed, the reading is that point relative to GND.',
        )}
        {ac &&
          tr(
            ' 电路里有变化的信号（信号发生器或 PWM）：万用表（直流档）显示的是平均值，看波形请用示波器探头。',
            ' The circuit carries a changing signal (function generator or PWM): the multimeter (DC mode) shows the average — use a scope probe to see the waveform.',
          )}
      </p>
    </div>
  );
}

function Toolbar() {
  const showNets = useStore((s) => s.showNets);
  const showLabels = useStore((s) => s.showLabels);
  const toggle = useStore((s) => s.toggle);
  const undo = useStore((s) => s.undo);
  const clear = useStore((s) => s.clear);
  const canUndo = useStore((s) => s.past.length > 0 || s.firstHole !== null);
  const redo = useStore((s) => s.redo);
  const canRedo = useStore((s) => s.future.length > 0);
  return (
    <div className="toolbar" role="toolbar" aria-label={tr('视图与编辑', 'View and edit')}>
      <RecentParts />
      <i />
      <button
        className={showNets ? 'on' : ''}
        aria-pressed={showNets}
        onClick={() => toggle('showNets')}
        title={tr('按结点着色：同一颜色 = 电气上连在一起', 'Colour by node: same colour = electrically connected')}
      >
        <Icon name="nets" />
        <span>{tr('结点着色', 'Node colours')}</span>
      </button>
      <button
        className={showLabels ? 'on' : ''}
        aria-pressed={showLabels}
        onClick={() => toggle('showLabels')}
        title={tr('显示元件标签', 'Show part labels')}
        aria-label={tr('元件标签', 'Part labels')}
      >
        <Icon name="label" />
      </button>
      <QualityToggle />
      <i />
      <button onClick={undo} disabled={!canUndo} title={tr('撤销 (Ctrl+Z)', 'Undo (Ctrl+Z)')} aria-label={tr('撤销', 'Undo')} aria-keyshortcuts="Control+Z">
        <Icon name="undo" />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title={tr('重做 (Ctrl+Shift+Z / Ctrl+Y)', 'Redo (Ctrl+Shift+Z / Ctrl+Y)')}
        aria-label={tr('重做', 'Redo')}
        aria-keyshortcuts="Control+Shift+Z Control+Y"
      >
        <span className="flip-x">
          <Icon name="undo" />
        </span>
      </button>
      <ConfirmButton
        message={tr('清空面包板上的所有元件？（可以撤销）', 'Remove every part from the breadboard? (You can undo.)')}
        confirmLabel={tr('清空', 'Clear')}
        onConfirm={clear}
        title={tr('清空', 'Clear board')}
      >
        <Icon name="trash" />
      </ConfirmButton>
    </div>
  );
}

/** The five part tools used most recently, one click away at the bottom of the board. */
function RecentParts() {
  const recent = useBenchUi((s) => s.recent);
  const tool = useStore((s) => s.tool);
  const setTool = useStore((s) => s.setTool);
  return (
    <span className="recent" role="group" aria-label={tr('常用元件', 'Recent parts')}>
      <span className="recent-label" aria-hidden>
        {tr('常用', 'Recent')}
      </span>
      {recent.map((t) => (
        <button key={t} className={tool === t ? 'on' : ''} aria-pressed={tool === t} onClick={() => setTool(tool === t ? 'select' : t)} title={toolName(t)}>
          <PartIcon type={t} size={24} />
          <span>
            <Mixed text={PARTS[t].name} />
          </span>
        </button>
      ))}
    </span>
  );
}

/** Top-left of the stage: the lesson / challenge list (a drawer, out of the way until wanted) and
 *  the toolbox switch. */
function StageSwitches() {
  const mode = useStore((s) => s.mode);
  const kit = useBenchUi((s) => s.kit);
  const setKit = useBenchUi((s) => s.setKit);
  const open = useBenchUi((s) => s.lessonsOpen);
  const setOpen = useBenchUi((s) => s.setLessonsOpen);
  const title = useStore((s) => s.challenges.find((c) => c.id === s.activeId)?.title);
  const list = mode === 'learn' || mode === 'challenge';
  return (
    <div className="stage-switches" role="group" aria-label={tr('课程与元件箱', 'Lessons and toolbox')}>
      {list && (
        <button
          className={`lesson-pick ${open ? 'on' : ''}`}
          aria-expanded={open}
          aria-controls="lesson-drawer"
          onClick={() => setOpen(!open)}
          title={mode === 'learn' ? tr('选择课程', 'Choose a lesson') : tr('选择挑战', 'Choose a challenge')}
        >
          <Icon name={mode === 'learn' ? 'book' : 'target'} size={16} />
          <span className="lesson-pick-name" data-active={title ? '' : undefined}>
            {title ?? (mode === 'learn' ? tr('课程', 'Lessons') : tr('挑战', 'Challenges'))}
          </span>
          <span aria-hidden>▾</span>
        </button>
      )}
      <button className={kit ? 'on' : ''} aria-pressed={kit} onClick={() => setKit(!kit)} title={tr('显示 / 隐藏左侧元件箱', 'Show / hide the parts toolbox')}>
        <Icon name="folder" size={16} />
        <span>{tr('元件', 'Parts')}</span>
      </button>
    </div>
  );
}

/** The lesson / challenge list, opened from the stage's top-left button. */
function LessonDrawer() {
  const mode = useStore((s) => s.mode);
  const open = useBenchUi((s) => s.lessonsOpen);
  const setOpen = useBenchUi((s) => s.setLessonsOpen);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const card = root.current?.querySelector<HTMLElement>('.lesson-card.on') ?? root.current?.querySelector<HTMLElement>('.lesson-card');
    card?.focus({ preventScroll: true });
    // the active card in view, scrolling only the drawer (not the page)
    const box = root.current;
    if (card && box) box.scrollTop = Math.max(0, card.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - box.clientHeight / 2 + card.offsetHeight / 2);
    const away = (e: PointerEvent) => {
      const t = e.target as Element;
      if (!root.current?.contains(t) && !t.closest?.('.lesson-pick')) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        document.querySelector<HTMLElement>('.lesson-pick')?.focus();
      }
    };
    window.addEventListener('pointerdown', away, true);
    window.addEventListener('keydown', key, true);
    return () => {
      window.removeEventListener('pointerdown', away, true);
      window.removeEventListener('keydown', key, true);
    };
  }, [open, setOpen]);
  if (!open || (mode !== 'learn' && mode !== 'challenge')) return null;
  return (
    <div className="lesson-drawer" id="lesson-drawer" ref={root} onClick={(e) => (e.target as Element).closest('.lesson-card') && setOpen(false)}>
      <Carousel kind={mode === 'learn' ? 'lesson' : 'challenge'} />
    </div>
  );
}

/** Screen-reader text of the 3D view (its region's description). */
function BoardSummary() {
  const parts = useStore((s) => s.layout.parts);
  return (
    <p id="board-desc" className="sr-only">
      {boardDescription(parts)}{' '}
      {tr('键盘：用 3D 视图下方的“用键盘搭电路”放置、移动、删除元件。', 'Keyboard: use “Build with the keyboard” below the 3D view to place, move and delete parts.')}
    </p>
  );
}

export function Workbench() {
  // a right click that isn't a drag (right-drag pans the view): drops a half-placed part, else puts
  // the tool down, else opens the menu of the part under the pointer (or of the empty bench)
  const rightDown = useRef<{ x: number; y: number } | null>(null);
  const sideCollapsed = useBenchUi((s) => s.sideCollapsed);
  const setSide = useBenchUi((s) => s.setSide);
  const sideW = useBenchUi((s) => s.sideW);
  return (
    <div className="bench card">
      <Toolbox />
      <div
        className="stage"
        onPointerDownCapture={(e) => {
          if (e.button !== 2) return;
          rightDown.current = { x: e.clientX, y: e.clientY };
          rightPick.id = null;
        }}
        onPointerUp={(e) => {
          const d = rightDown.current;
          rightDown.current = null;
          if (e.button !== 2 || !d || Math.hypot(e.clientX - d.x, e.clientY - d.y) >= 5) return;
          if (!(e.target as Element).closest?.('.stage-view')) return;
          const s = useStore.getState();
          if (s.cancelPlacement()) return;
          if (s.tool !== 'select') return s.setTool('select');
          if (rightPick.id) s.select(rightPick.id);
          useBenchUi.getState().openMenu({ x: e.clientX, y: e.clientY, partId: rightPick.id });
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="stage-top">
          <StageSwitches />
          <Prompt />
          <ViewButton />
          {/* touch: the candidate hole's chip lies over the prompt (the board neither moves nor gets covered) */}
          <TouchChip />
        </div>
        <div
          className="stage-view"
          role="region"
          aria-describedby="board-desc"
          aria-label={tr(
            '3D 面包板：点元件看详情，拖动元件移动，右键单击出菜单，拖空白处或右键拖动平移，滚轮缩放，中键拖动旋转',
            '3D breadboard: click a part for its details, drag it to move it, right-click for its menu, drag empty space or right-drag to pan, scroll to zoom, middle-drag to rotate',
          )}
        >
          <ErrorBoundary scope="canvas">
            {E2E && <E2ECrash />}
            <Scene />
          </ErrorBoundary>
          <Multimeter />
          <Scope />
          <PartPopover />
          <LessonDrawer />
          {sideCollapsed && (
            <button className="side-reopen" onClick={() => setSide(sideW, false)} title={tr('展开右侧面板', 'Show the side panel')}>
              {tr('面板', 'Panel')} ‹
            </button>
          )}
        </div>
        <BenchMenu />
        <Toolbar />
        <BoardSummary />
        <BenchKeyboard />
        <p className="small-screen-note">
          {tr(
            '手机上也能搭电路：点孔选位置（箭头微调），再点一次放下；单指拖元件、双指缩放。元件很多的实验在平板或电脑上更舒服。',
            'You can build on a phone: tap a hole to pick it (arrows fine-tune), tap again to place; drag parts with one finger, pinch to zoom. Labs with many parts are more comfortable on a tablet or computer.',
          )}
        </p>
      </div>
    </div>
  );
}
