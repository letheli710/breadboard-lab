import { useEffect, useRef, useState } from 'react';
import { tr } from '../core/i18n';
import { PARTS, PART_ORDER, nextScopeChannel } from '../core/parts';
import { volts } from '../core/format';
import { vavg } from '../core/transient';
import { holeLabel } from '../core/breadboard';
import type { PartType } from '../core/types';
import { useDerived } from '../state/derived';
import { useStore, type Tool } from '../state/store';
import { Scene, VIEWS, type ViewName } from '../three/Scene';
import { emitCameraView } from '../three/common';
import { ConfirmButton } from './Confirm';
import { ErrorBoundary } from './ErrorBoundary';
import { Icon, PartIcon } from './Icons';
import { QualityToggle } from './QualityToggle';
import { Scope } from './Scope';

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

const toolName = (t: Tool) => (t === 'select' ? tr('选择 / 操作', 'Select / use') : t === 'probe' ? tr('万用表', 'Multimeter') : PARTS[t].name);

function Toolbox() {
  const tool = useStore((s) => s.tool);
  const setTool = useStore((s) => s.setTool);
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
    if (horiz) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
    else el.scrollBy({ top: dir * el.clientHeight * 0.8, behavior: 'smooth' });
  };
  return (
    <nav className={`toolbox-wrap ${more.up ? 'more-up' : ''} ${more.down ? 'more-down' : ''}`} aria-label={tr('元件箱', 'Parts toolbox')}>
      <div className="toolbox" ref={box}>
        {groups().map((g) => (
          <div key={g.title} className="tool-group" role="group" aria-label={g.title}>
            <div className="tool-group-title">{g.title}</div>
            <div className="tool-grid">
              {g.items.map((t) => (
                <button key={t} className={`tool ${tool === t ? 'on' : ''}`} aria-pressed={tool === t} onClick={() => setTool(tool === t ? 'select' : t)} title={toolName(t)}>
                  <PartIcon type={t} size={28} />
                  <span>{toolName(t)}</span>
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
  );
}

function Prompt() {
  const tool = useStore((s) => s.tool);
  const firstHole = useStore((s) => s.firstHole);
  const cancelPlacement = useStore((s) => s.cancelPlacement);
  const layout = useStore((s) => s.layout);
  let text: string;
  if (tool === 'select')
    text = tr(
      '鼠标悬停在孔上，看看哪些孔在内部是连通的 · 点击元件选中，点击按键 / 开关切换状态',
      'Hover a hole to see which holes are connected inside · click a part to select it, click a button / switch to flip it',
    );
  else if (tool === 'probe')
    text = tr(
      '万用表：点击孔放红表笔；Shift + 点击放黑表笔（不放则默认接 GND）',
      'Multimeter: click a hole for the red probe; Shift + click for the black probe (GND if not placed)',
    );
  else {
    const pl = PARTS[tool as PartType].placement;
    text = pl.kind === 'footprint' ? pl.prompt : pl.prompts[firstHole ? 1 : 0] + (firstHole ? tr(`（起点 ${firstHole}）`, ` (from ${firstHole})`) : '');
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
function ViewButton() {
  const [view, setView] = useState<ViewName>('angle');
  const next = VIEWS[(VIEWS.indexOf(view) + 1) % VIEWS.length];
  return (
    <button
      className="view-btn"
      onClick={() => {
        setView(next);
        emitCameraView(next);
      }}
      title={tr(
        `切换视角（下一个：${VIEW_NAME[next]()}）· 也可以拖动旋转、滚轮缩放、右键拖动平移`,
        `Switch view (next: ${VIEW_NAME[next]()}) · you can also drag to rotate, scroll to zoom, right-drag to pan`,
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
      <div className="meter-screen">{Number.isFinite(reading) ? volts(reading) : probe.red ? tr('—— 悬空', '—— floating') : '-- V'}</div>
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
      <button
        className={showNets ? 'on' : ''}
        onClick={() => toggle('showNets')}
        title={tr('按节点着色：同一颜色 = 电气上连在一起', 'Colour by node: same colour = electrically connected')}
      >
        <Icon name="nets" />
        <span>{tr('节点着色', 'Node colours')}</span>
      </button>
      <button className={showLabels ? 'on' : ''} onClick={() => toggle('showLabels')} title={tr('显示元件标签', 'Show part labels')}>
        <Icon name="label" />
      </button>
      <QualityToggle />
      <i />
      <button onClick={undo} disabled={!canUndo} title={tr('撤销 (Ctrl+Z)', 'Undo (Ctrl+Z)')}>
        <Icon name="undo" />
      </button>
      <button onClick={redo} disabled={!canRedo} title={tr('重做 (Ctrl+Shift+Z / Ctrl+Y)', 'Redo (Ctrl+Shift+Z / Ctrl+Y)')} aria-label={tr('重做', 'Redo')}>
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

export function Workbench() {
  const toast = useStore((s) => s.toast);
  const toastUndo = useStore((s) => s.toastUndo);
  // a right click that isn't a drag (right-drag pans the view) drops a half-placed part
  const rightDown = useRef<{ x: number; y: number } | null>(null);
  return (
    <div className="bench card">
      <Toolbox />
      <div
        className="stage"
        onPointerDown={(e) => {
          if (e.button === 2) rightDown.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const d = rightDown.current;
          rightDown.current = null;
          if (e.button === 2 && d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) useStore.getState().cancelPlacement();
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="stage-top">
          <Prompt />
          <ViewButton />
        </div>
        <div
          className="stage-view"
          role="region"
          aria-label={tr('3D 面包板：拖动旋转、滚轮缩放、右键拖动平移', '3D breadboard: drag to rotate, scroll to zoom, right-drag to pan')}
        >
          <ErrorBoundary scope="canvas">
            <Scene />
          </ErrorBoundary>
          <Multimeter />
          <Scope />
          {toast && (
            <div className={`toast ${toastUndo ? 'has-action' : ''}`} role="status">
              {toast}
              {toastUndo && (
                <button className="toast-action" onClick={() => useStore.getState().undo()}>
                  {tr('撤销', 'Undo')}
                </button>
              )}
            </div>
          )}
        </div>
        <Toolbar />
        <p className="small-screen-note">
          {tr('3D 工作台在更大的屏幕上更好用；练习和知识页在手机上可以完整使用。', 'The 3D bench works best on a larger screen; Practice and Guide work fully on a phone.')}
        </p>
      </div>
    </div>
  );
}
