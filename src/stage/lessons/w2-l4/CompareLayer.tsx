// W2-L4 layer 02 · 同电路双解法方程数实时对比台. The circuit of 图 4-1 (3 nodes, 6 branches: three
// resistors, three independent current sources) seen two ways: the nodal view lights the 2 unknown
// nodes and writes the 2×2 matrix; the mesh view draws the 4 clockwise meshes, the supermesh 1-2
// (the 4 A source sits between meshes 1 and 2) and the 4 mesh equations. The badges count
// equations: N − 1 = 2 against M = B − N + 1 = 4.
// Stage params: l2_view ('nodal' | 'split' | 'mesh'), l2_super.

import { useStageParam } from '../../stageStore';
import { Tex } from '../../StageText';
import { CMP, compareMesh, compareNodal, fmt } from './model';
import { CurSrc, CwArc, ResBox, Seg, Switch, fitScale, useBox, useLink } from './ui';

type View = 'nodal' | 'split' | 'mesh';

const W = 420;
const H = 272;
const GAP = 14;
const NY = 122;
const RAIL = 218;
const ARCH = 64;
const X = { r1: 34, is1: 136, n1: 136, n2: 258, r3: 258, is2: 388 };

const NOD = compareNodal(CMP);
const MES = compareMesh(CMP);

export default function CompareLayer() {
  const [view, setView] = useStageParam<View>('l2_view', 'split');
  const [sup, setSup] = useStageParam('l2_super', true);
  const { on, bind } = useLink();
  const [wrapRef, box] = useBox<HTMLDivElement>();

  const copies: ('nodal' | 'mesh')[] = view === 'split' ? ['nodal', 'mesh'] : [view];
  const wideS = fitScale(box, 2 * W + GAP, H);
  const tallS = fitScale(box, W, 2 * H + GAP);
  const wide = copies.length === 1 || wideS >= tallS;
  const vbW = copies.length === 1 ? W : wide ? 2 * W + GAP : W;
  const vbH = copies.length === 1 ? H : wide ? H : 2 * H + GAP;

  const countLit = on('cmp_count');
  return (
    <div className="w24-layer">
      <div className="w24-dock">
        <Seg
          label="视角"
          value={view}
          onChange={setView}
          options={[
            ['nodal', '节点视角'],
            ['split', '分屏对比'],
            ['mesh', '网孔视角'],
          ]}
        />
        <Switch on={sup && view !== 'nodal'} onChange={setSup} disabled={view === 'nodal'}>
          超网孔边界
        </Switch>
      </div>
      <div className="w24-badges" {...bind('cmp_count')}>
        {view !== 'mesh' && (
          <span className={`w24-badge good ${countLit ? 'lit' : ''}`}>
            节点法：
            <Tex tex={String.raw`N - 1 = 3 - 1 = 2`} /> 个方程
          </span>
        )}
        {view !== 'nodal' && (
          <span className={`w24-badge bad ${countLit ? 'lit' : ''}`}>
            网孔法：
            <Tex tex={String.raw`M = B - N + 1 = 4`} /> 个未知量 + 1 超网孔
          </span>
        )}
      </div>
      <div className="w24-svgwrap" ref={wrapRef}>
        <svg className="w24-svg" viewBox={`0 0 ${vbW} ${vbH}`} role="img" aria-label="图 4-1 的同一电路：节点视角与网孔视角">
          {copies.map((p, k) => (
            <g key={p} transform={`translate(${k && wide ? W + GAP : 0} ${k && !wide ? H + GAP : 0})`}>
              <Copy persp={p} sup={sup} on={on} bind={bind} />
            </g>
          ))}
        </svg>
      </div>
      <div className={`w24-hud ${view === 'split' ? 'w24-narrow-hide' : ''}`} aria-live="polite">
        {view === 'nodal' && (
          <Tex
            tex={String.raw`\begin{bmatrix} \tfrac{3}{4} & -\tfrac{1}{2} \\ -\tfrac{1}{2} & \tfrac{2}{3} \end{bmatrix}\begin{bmatrix} v_1 \\ v_2 \end{bmatrix} = \begin{bmatrix} ${NOD.i[0]} \\ ${NOD.i[1]} \end{bmatrix} \Rightarrow v_1 = ${fmt(NOD.v[0])}\text{ V},\ v_2 = ${fmt(NOD.v[1])}\text{ V}`}
          />
        )}
        {view === 'mesh' && (
          <span className="w24-lines">
            <Tex tex={String.raw`i_2 - i_1 = 4,\ \ i_3 = -2,\ \ i_4 = -4,\ \ 4i_1 + 2(i_2 - i_3) + 6(i_2 - i_4) = 0`} />
            <Tex
              tex={String.raw`\Rightarrow i_2 = ${fmt(MES.i[1])}\text{ A},\ i_1 = ${fmt(MES.i[0])}\text{ A} \Rightarrow v_1 = ${fmt(MES.v[0])}\text{ V},\ v_2 = ${fmt(MES.v[1])}\text{ V}`}
            />
          </span>
        )}
        {view === 'split' && <span>同一张电路、同一个答案（v₁ = 20 V，v₂ = 18 V）：左边 2 个方程直写，右边 4 个未知量 + 超网孔约束 + 反算节点电压。</span>}
      </div>
    </div>
  );
}

function Copy({ persp, sup, on, bind }: { persp: 'nodal' | 'mesh'; sup: boolean; on: (id: string) => boolean; bind: ReturnType<typeof useLink>['bind'] }) {
  const nodal = persp === 'nodal';
  const nodesLit = on('cmp_nodes');
  const meshLit = on('cmp_meshes');
  const supLit = on('cmp_super');
  const isLit = on('cmp_is1');
  return (
    <g className={`w24-cmp ${nodal ? 'nodal' : 'mesh'}`}>
      <rect className={`w24-panel ${nodal ? 'good' : 'bad'}`} x={0.5} y={0.5} width={W - 1} height={H - 1} rx={10} />
      <g className={`w24-pill ${nodal ? 'good' : 'bad'}`}>
        <rect x={12} y={9} width={nodal ? 196 : 252} height={22} rx={11} />
        <text x={nodal ? 110 : 138} y={24}>
          {nodal ? '节点视角：仅 2 个未知节点' : '网孔视角：4 个网孔 + 1 个超网孔'}
        </text>
      </g>

      {/* supermesh 1-2 */}
      {!nodal && sup && (
        <g className={`w24-super ${supLit ? 'lit' : ''}`} {...bind('cmp_super')}>
          <rect x={20} y={NY - 10} width={X.n2 + 12 - 20} height={RAIL - NY + 20} rx={10} />
          <text x={(20 + X.n2 + 12) / 2} y={RAIL + 26}>
            超网孔 1-2（因内部含 4 A 电流源）
          </text>
        </g>
      )}

      {/* node zones */}
      {nodal && (
        <g className={`w24-zones ${nodesLit ? 'lit' : ''}`} {...bind('cmp_nodes')}>
          <line className="z1" x1={X.r1} y1={NY} x2={X.n1} y2={NY} />
          <line className="z2" x1={X.n2} y1={NY} x2={X.is2} y2={NY} />
          <text className="z1" x={X.r1 + 6} y={NY - 10}>
            节点 1 (v₁)
          </text>
          <text className="z2" x={X.is2 - 6} y={NY - 10} textAnchor="end">
            节点 2 (v₂)
          </text>
        </g>
      )}

      {/* wires */}
      <g className="w24-wire">
        <polyline points={`${X.r1},${RAIL} ${X.r1},${NY} ${X.n1},${NY}`} />
        <polyline points={`${X.n2},${NY} ${X.is2},${NY} ${X.is2},${RAIL}`} />
        <line x1={X.n1} y1={NY} x2={X.n2} y2={NY} />
        <polyline points={`${X.n1},${NY} ${X.n1},${ARCH} ${X.n2},${ARCH} ${X.n2},${NY}`} />
        <line x1={X.is1} y1={NY} x2={X.is1} y2={RAIL} />
        <line x1={X.r3} y1={NY} x2={X.r3} y2={RAIL} />
        <line className="w24-rail" x1={X.r1} y1={RAIL} x2={X.is2} y2={RAIL} />
      </g>
      {nodal && (
        <text className="w24-lbl muted" x={(X.r1 + X.is2) / 2} y={RAIL + 20} textAnchor="middle">
          参考节点 0 (GND)
        </text>
      )}

      {/* elements */}
      <g className="w24-branch">
        <ResBox x={X.r1} y={165} dir="v" />
        <text className="w24-lbl" x={X.r1 + 14} y={169}>
          4 Ω
        </text>
        <ResBox x={(X.n1 + X.n2) / 2} y={NY} dir="h" len={50} />
        <text className="w24-lbl" x={(X.n1 + X.n2) / 2} y={NY + 26} textAnchor="middle">
          2 Ω
        </text>
        <ResBox x={X.r3} y={165} dir="v" />
        <text className="w24-lbl" x={X.r3 + 14} y={169}>
          6 Ω
        </text>
      </g>
      <g className={`w24-isrc s1 ${isLit || (!nodal && sup) ? 'lit' : ''} ${!nodal ? 'bad' : ''}`} {...bind('cmp_is1')}>
        <CurSrc x={X.is1} y={165} dir="up" />
        <text className="w24-lbl" x={X.is1 + 20} y={169}>
          4 A
        </text>
      </g>
      <g className="w24-isrc s1">
        <CurSrc x={(X.n1 + X.n2) / 2} y={ARCH} dir="left" />
        <text className="w24-lbl" x={(X.n1 + X.n2) / 2} y={ARCH - 20} textAnchor="middle">
          2 A (2→1)
        </text>
      </g>
      <g className="w24-isrc s2">
        <CurSrc x={X.is2} y={165} dir="up" />
        <text className="w24-lbl" x={X.is2 - 20} y={169} textAnchor="end">
          4 A
        </text>
      </g>

      {/* nodes or meshes */}
      {nodal ? (
        <g {...bind('cmp_nodes')}>
          <circle className={`w24-dot n1 ${nodesLit ? 'lit' : ''}`} cx={X.n1} cy={NY} r={6} />
          <circle className={`w24-dot n2 ${nodesLit ? 'lit' : ''}`} cx={X.n2} cy={NY} r={6} />
        </g>
      ) : (
        <g className={`w24-meshes ${meshLit ? 'lit' : ''}`} {...bind('cmp_meshes')}>
          {(
            [
              [(X.r1 + X.is1) / 2, 165, 16, 'i₁'],
              [(X.n1 + X.n2) / 2, 178, 16, 'i₂'],
              [(X.n1 + X.n2) / 2, (ARCH + NY) / 2 - 2, 10, 'i₃'],
              [(X.r3 + X.is2) / 2, 165, 16, 'i₄'],
            ] as [number, number, number, string][]
          ).map(([x, y, r, n]) => (
            <g key={n} className={`w24-mesh ${n === 'i₁' || n === 'i₂' ? 'bad' : 'warn'}`}>
              <CwArc x={x} y={y} r={r} />
              <text x={x} y={y + 4.5}>
                {n}
              </text>
            </g>
          ))}
        </g>
      )}
      <text className={`w24-foot ${nodal ? 'good' : 'bad'}`} x={W / 2} y={H - 8} textAnchor="middle">
        {nodal ? '观察法直写 2×2 矩阵，0 超节点' : '无法用观察法：4 个未知量 + 超网孔 + 反推节点电压'}
      </text>
    </g>
  );
}
