import { PARTS, PART_ORDER } from '../core/parts';
import { volts } from '../core/format';
import { holeLabel } from '../core/breadboard';
import type { PartType } from '../core/types';
import { useDerived } from '../state/derived';
import { useStore, type Tool } from '../state/store';
import { Scene } from '../three/Scene';
import { useEmitCamera } from '../three/common';
import { Icon, PartIcon } from './Icons';

const GROUPS: { title: string; items: Tool[] }[] = [
  { title: '工具', items: ['select', 'probe'] },
  { title: '电源', items: PART_ORDER.filter((t) => PARTS[t].category === 'power') },
  { title: '连线', items: ['wire'] },
  { title: '元件', items: PART_ORDER.filter((t) => PARTS[t].category === 'basic') },
  { title: '输入', items: PART_ORDER.filter((t) => PARTS[t].category === 'input') },
];

const toolName = (t: Tool) => (t === 'select' ? '选择 / 操作' : t === 'probe' ? '万用表' : PARTS[t].name);

function Toolbox() {
  const tool = useStore((s) => s.tool);
  const setTool = useStore((s) => s.setTool);
  return (
    <div className="toolbox">
      {GROUPS.map((g) => (
        <div key={g.title} className="tool-group">
          <div className="tool-group-title">{g.title}</div>
          {g.items.map((t) => (
            <button key={t} className={`tool ${tool === t ? 'on' : ''}`} onClick={() => setTool(tool === t ? 'select' : t)} title={toolName(t)}>
              <PartIcon type={t} size={30} />
              <span>{toolName(t)}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function Prompt() {
  const tool = useStore((s) => s.tool);
  const firstHole = useStore((s) => s.firstHole);
  let text: string;
  if (tool === 'select') text = '鼠标悬停在孔上，看看哪些孔在内部是连通的 · 点击元件选中，点击按键 / 开关切换状态';
  else if (tool === 'probe') text = '万用表：点击孔放红表笔；Shift + 点击放黑表笔（不放则默认接 GND）';
  else {
    const pl = PARTS[tool as PartType].placement;
    text = pl.kind === 'footprint' ? pl.prompt : pl.prompts[firstHole ? 1 : 0] + (firstHole ? `（起点 ${firstHole}）` : '');
  }
  return (
    <div className="prompt">
      {tool !== 'select' && <span className="prompt-tag">{toolName(tool)}</span>}
      {text}
      {tool !== 'select' && <kbd>Esc</kbd>}
    </div>
  );
}

function Multimeter() {
  const tool = useStore((s) => s.tool);
  const probe = useStore((s) => s.probe);
  const { nl, sim } = useDerived();
  if (tool !== 'probe') return null;
  const vOf = (h: string | null) => {
    if (!h) return { v: 0, net: sim.ground ?? 'GND' };
    const net = nl.holeNet.get(h);
    return { v: net ? (sim.nodeV.get(net) ?? 0) : NaN, net: net ?? '无连接' };
  };
  const r = vOf(probe.red);
  const b = vOf(probe.black);
  const reading = probe.red ? r.v - b.v : NaN;
  return (
    <div className="meter">
      <div className="meter-screen">{Number.isFinite(reading) ? volts(reading) : probe.red ? '—— 悬空' : '-- V'}</div>
      <div className="meter-row">
        <span className="dot red" />
        红：{probe.red ? holeLabel(probe.red) : '未放置'} {probe.red && `(${r.net})`}
      </div>
      <div className="meter-row">
        <span className="dot black" />
        黑：{probe.black ? holeLabel(probe.black) : 'GND（默认）'} {probe.black && `(${b.net})`}
      </div>
      <p className="meter-note">电压永远是“两点之间”的差。只放红表笔时，读数就是这一点相对 GND 的电压。</p>
    </div>
  );
}

function Toolbar() {
  const emit = useEmitCamera();
  const showNets = useStore((s) => s.showNets);
  const showLabels = useStore((s) => s.showLabels);
  const toggle = useStore((s) => s.toggle);
  const undo = useStore((s) => s.undo);
  const clear = useStore((s) => s.clear);
  const past = useStore((s) => s.past);
  return (
    <div className="toolbar">
      <button onClick={() => emit('left')} title="向左旋转">
        <Icon name="left" />
      </button>
      <button onClick={() => emit('right')} title="向右旋转">
        <Icon name="right" />
      </button>
      <i />
      <button onClick={() => emit('out')} title="缩小">
        <Icon name="out" />
      </button>
      <button onClick={() => emit('in')} title="放大">
        <Icon name="in" />
      </button>
      <button onClick={() => emit('top')} title="俯视">
        <Icon name="top" />
      </button>
      <button onClick={() => emit('reset')} title="重置视角">
        <Icon name="reset" />
      </button>
      <i />
      <button className={showNets ? 'on' : ''} onClick={() => toggle('showNets')} title="按节点着色：同一颜色 = 电气上连在一起">
        <Icon name="nets" />
        <span>节点着色</span>
      </button>
      <button className={showLabels ? 'on' : ''} onClick={() => toggle('showLabels')} title="显示元件标签">
        <Icon name="label" />
      </button>
      <i />
      <button onClick={undo} disabled={past.length === 0} title="撤销 (Ctrl+Z)">
        <Icon name="undo" />
      </button>
      <button
        onClick={() => {
          if (confirm('清空面包板上的所有元件？')) clear();
        }}
        title="清空"
      >
        <Icon name="trash" />
      </button>
    </div>
  );
}

export function Workbench() {
  const toast = useStore((s) => s.toast);
  return (
    <div className="bench card">
      <Toolbox />
      <div className="stage">
        <Scene />
        <Prompt />
        <Multimeter />
        <Toolbar />
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}
