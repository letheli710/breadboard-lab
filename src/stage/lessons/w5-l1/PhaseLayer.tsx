// Layer 02 · sin↔cos 统一化简与超前/滞后相位差尺. Two same-frequency waves A·f(ωt + θ), f one of
// +cos / −cos / +sin / −sin. The trig compass puts each function's reference axis where it sits
// against +cos (−sin +90°, −cos ±180°, +sin −90°); each wave's phasor starts on its function's axis
// and turns by its own θ, which lands it at the angle φ of the positive-amplitude cosine. The ruler
// marks φ₁, φ₂ and Δφ = φ₂ − φ₁ with the lead / lag verdict; under it, the two cosines over two
// periods (the one that leads reaches its crest first). "相量叠加" draws the parallelogram of the two
// phasors, their sum and the summed wave.

import { compare, FUNC_SHIFT, FUNC_TEXT, FUNCS, abs, add, argDeg, DEG, fmt, fmtAng, fmtPolar, fmtRect, polar, toCos, type Func } from './model';
import { C, Cell, Lbl, Obj, P, Vec, ArcArrow, useClearHoverOnUnmount, useHot, useParam } from './parts';
import './w5l1.css';

const CX = 110;
const CY = 124;
const R = 66;
const RL = 236;
const RR = 444;
const YR = 112;
const W0 = 236;
const W1 = 444;
const YW = 202;
const AW = 30;

const COL1 = { line: C.rose, text: C.roseT };
const COL2 = { line: C.vec, text: C.vecT };
const COLS = { line: C.proj, text: C.projT };

/** "−10cos(ωt + 50°)" */
export function waveText(f: Func, A: number, th: number): string {
  const sign = f.startsWith('-') ? '−' : '';
  const fn = f.slice(1);
  const arg = Math.abs(th) < 1e-9 ? 'ωt' : `ωt ${th > 0 ? '+' : '−'} ${fmt(Math.abs(th), 2)}°`;
  return `${sign}${fmt(A)}${fn}(${arg})`;
}
const cosText = (A: number, phi: number) => waveText('+cos', A, phi);

const AXES: { id: string; f: Func; label: string; deg: string }[] = [
  { id: 'cmp_pcos', f: '+cos', label: '+cos', deg: '0°' },
  { id: 'cmp_nsin', f: '-sin', label: '−sin', deg: '+90°' },
  { id: 'cmp_ncos', f: '-cos', label: '−cos', deg: '±180°' },
  { id: 'cmp_psin', f: '+sin', label: '+sin', deg: '−90°' },
];

export default function PhaseLayer() {
  useClearHoverOnUnmount();
  const [f1, setF1] = useParam<Func>(P.f1, '-cos');
  const [a1, setA1] = useParam<number>(P.a1, 10);
  const [p1, setP1] = useParam<number>(P.p1, 50);
  const [f2, setF2] = useParam<Func>(P.f2, '+sin');
  const [a2, setA2] = useParam<number>(P.a2, 12);
  const [p2, setP2] = useParam<number>(P.p2, -10);
  const [para, setPara] = useParam<boolean>(P.para, false);
  const [sym] = useParam<'v' | 'i'>(P.sym, 'v');
  const s1 = `${sym}₁`;
  const s2 = `${sym}₂`;
  const w1 = toCos(f1, a1, p1);
  const w2 = toCos(f2, a2, p2);
  const cmp = compare(w1.phi, w2.phi);
  const Z1 = polar(w1.A, w1.phi);
  const Z2 = polar(w2.A, w2.phi);
  const S = add(Z1, Z2);
  const k = (R - 6) / Math.max(a1, a2, para ? abs(S) : 0);
  const pt = (z: { re: number; im: number }) => ({ x: CX + z.re * k, y: CY - z.im * k });
  const t1 = pt(Z1);
  const t2 = pt(Z2);
  const ts = pt(S);
  const RX = (deg: number) => RL + ((deg + 180) / 360) * (RR - RL);
  const verdict =
    cmp.rel === 'in'
      ? `${s1} 与 ${s2} 同相`
      : cmp.rel === 'anti'
        ? `${s1} 与 ${s2} 反相（差 180°）`
        : cmp.rel === 'lead'
          ? `${s2} 超前 ${s1} ${fmt(cmp.d, 2)}°`
          : `${s2} 滞后 ${s1} ${fmt(-cmp.d, 2)}°`;

  // the Δφ arrow on the ruler, wrapped through ±180° when it has to
  const end = w1.phi + cmp.d;
  const segs: [number, number][] =
    end > 180
      ? [
          [w1.phi, 180],
          [-180, end - 360],
        ]
      : end <= -180
        ? [
            [w1.phi, -180],
            [180, end + 360],
          ]
        : [[w1.phi, end]];

  // the waves over ωt ∈ [0°, 720°]
  const AM = Math.max(a1, a2, para ? abs(S) : 0);
  const WX = (deg: number) => W0 + (deg / 720) * (W1 - W0);
  const wave = (A: number, phi: number) =>
    Array.from({ length: 181 }, (_, i) => {
      const d = i * 4;
      return `${i ? 'L' : 'M'} ${WX(d).toFixed(1)} ${(YW - (A / AM) * AW * Math.cos((d + phi) * DEG)).toFixed(1)}`;
    }).join(' ');
  const crest = (phi: number) => ((-phi % 360) + 360) % 360;

  return (
    <div className="w51-layer">
      <div className="w51-controls stack">
        <WaveCtl n={1} sym={s1} f={f1} setF={setF1} A={a1} setA={setA1} th={p1} setTh={setP1} color={COL1.text} />
        <WaveCtl n={2} sym={s2} f={f2} setF={setF2} A={a2} setA={setA2} th={p2} setTh={setP2} color={COL2.text} />
        <ParaButton on={para} onClick={() => setPara(!para)} />
      </div>

      <div className="w51-svgwrap">
        <svg viewBox="0 0 460 250" className="w51-svg" role="img" aria-label={`相位比较：${waveText(f1, a1, p1)} 与 ${waveText(f2, a2, p2)}，${verdict}`}>
          <rect x="1" y="1" width="458" height="248" rx="10" className="w51-bg" />
          <Lbl x={12} y={17} s="三角罗盘 · 统一为 +cos" cls="w51-tag" color={C.muted} anchor="start" />
          <Lbl x={RL - 6} y={17} s="统一为正余弦后的相位差标尺" cls="w51-tag" color={C.muted} anchor="start" />

          {/* the compass */}
          <circle cx={CX} cy={CY} r={R} className="w51-compass" />
          {AXES.map((a) => {
            const ang = FUNC_SHIFT[a.f];
            const ex = CX + (R + 4) * Math.cos(ang * DEG);
            const ey = CY - (R + 4) * Math.sin(ang * DEG);
            const used = f1 === a.f || f2 === a.f;
            const lx = a.f === '+cos' ? CX + R + 6 : a.f === '-cos' ? CX - R - 6 : CX;
            const ly = a.f === '-sin' ? CY - R - 16 : a.f === '+sin' ? CY + R + 14 : CY - 5;
            const anchor = a.f === '+cos' ? 'start' : a.f === '-cos' ? 'end' : 'middle';
            return (
              <Obj key={a.id} id={a.id} hit={`M ${CX} ${CY} L ${ex} ${ey}`}>
                <line x1={CX} y1={CY} x2={ex} y2={ey} stroke={used ? C.ink : C.axis} strokeWidth={used ? 1.8 : 1.3} />
                <text x={lx} y={ly} className="w51-lbl" textAnchor={anchor} fill={used ? C.ink : C.muted}>
                  {a.label}
                </text>
                <text x={lx} y={ly + (a.f === '-sin' ? 12 : a.f === '+sin' ? 12 : 13)} className="w51-tick" textAnchor={anchor} fill={C.muted}>
                  {a.deg}
                </text>
              </Obj>
            );
          })}

          {/* each wave: from its function's axis, turned by its own θ */}
          {[
            { f: f1, th: p1, r: 22, col: COL1 },
            { f: f2, th: p2, r: 32, col: COL2 },
          ].map((w, i) =>
            Math.abs(w.th) >= 1 ? <ArcArrow key={i} cx={CX} cy={CY} r={w.r} a0={FUNC_SHIFT[w.f]} a1={FUNC_SHIFT[w.f] + w.th} color={w.col.line} w={1.6} dashed /> : null,
          )}

          {para && (
            <Obj id="pc_para">
              <polygon points={`${CX},${CY} ${t1.x},${t1.y} ${ts.x},${ts.y} ${t2.x},${t2.y}`} fill={C.proj} opacity={0.1} />
              <line x1={t1.x} y1={t1.y} x2={ts.x} y2={ts.y} stroke={COL2.line} strokeWidth={1.4} strokeDasharray="5 4" />
              <line x1={t2.x} y1={t2.y} x2={ts.x} y2={ts.y} stroke={COL1.line} strokeWidth={1.4} strokeDasharray="5 4" />
            </Obj>
          )}
          <Obj id="pc_v1" hit={`M ${CX} ${CY} L ${t1.x} ${t1.y}`}>
            <Vec x0={CX} y0={CY} x1={t1.x} y1={t1.y} color={COL1.line} w={2.8} />
            <Lbl x={t1.x + (t1.x >= CX ? 5 : -5)} y={t1.y + (t1.y >= CY ? 12 : -4)} s={s1} color={COL1.text} anchor={t1.x >= CX ? 'start' : 'end'} cls="w51-lbl strong" />
          </Obj>
          <Obj id="pc_v2" hit={`M ${CX} ${CY} L ${t2.x} ${t2.y}`}>
            <Vec x0={CX} y0={CY} x1={t2.x} y1={t2.y} color={COL2.line} w={2.8} />
            <Lbl x={t2.x + (t2.x >= CX ? 5 : -5)} y={t2.y + (t2.y >= CY ? 12 : -4)} s={s2} color={COL2.text} anchor={t2.x >= CX ? 'start' : 'end'} cls="w51-lbl strong" />
          </Obj>
          {para && (
            <Obj id="pc_sum" hit={`M ${CX} ${CY} L ${ts.x} ${ts.y}`}>
              <Vec x0={CX} y0={CY} x1={ts.x} y1={ts.y} color={COLS.line} w={3.2} />
              <Lbl
                x={ts.x + (ts.x >= CX ? 5 : -5)}
                y={ts.y + (ts.y >= CY ? 12 : -4)}
                s={`${s1}+${s2}`}
                color={COLS.text}
                anchor={ts.x >= CX ? 'start' : 'end'}
                cls="w51-lbl strong"
              />
            </Obj>
          )}

          {/* the normalised expressions */}
          <Obj id="pc_v1">
            <Lbl x={RL - 6} y={38} s={`${s1} = ${waveText(f1, a1, p1)}`} color={COL1.text} anchor="start" />
            <Lbl x={RL + 8} y={52} s={`⇒ ${cosText(w1.A, w1.phi)}`} color={COL1.text} anchor="start" cls="w51-lbl strong" />
          </Obj>
          <Obj id="pc_v2">
            <Lbl x={RL - 6} y={70} s={`${s2} = ${waveText(f2, a2, p2)}`} color={COL2.text} anchor="start" />
            <Lbl x={RL + 8} y={84} s={`⇒ ${cosText(w2.A, w2.phi)}`} color={COL2.text} anchor="start" cls="w51-lbl strong" />
          </Obj>

          {/* the ruler */}
          <Obj id="pc_ruler">
            <line x1={RL} y1={YR} x2={RR} y2={YR} stroke={C.axis} strokeWidth={1.8} />
            {[-180, -90, 0, 90, 180].map((d) => (
              <g key={d}>
                <line x1={RX(d)} y1={YR - 4} x2={RX(d)} y2={YR + 4} stroke={C.axis} strokeWidth={1.3} />
                <text x={RX(d)} y={YR + 15} className="w51-tick" textAnchor="middle" fill={C.muted}>
                  {d > 0 ? `+${d}°` : d < 0 ? `−${-d}°` : '0°'}
                </text>
              </g>
            ))}
            {segs.map(([a, b], i) => (
              <line key={i} x1={RX(a)} y1={YR - 11} x2={RX(b)} y2={YR - 11} stroke={C.proj} strokeWidth={2.4} />
            ))}
            {Math.abs(cmp.d) > 2 && (
              <polygon
                points={(() => {
                  const [a, b] = segs[segs.length - 1];
                  const x = RX(b);
                  const s = b > a ? 1 : -1;
                  return `${x},${YR - 11} ${x - 7 * s},${YR - 15.5} ${x - 7 * s},${YR - 6.5}`;
                })()}
                fill={C.proj}
              />
            )}
            <circle cx={RX(w1.phi)} cy={YR} r={4.6} fill={COL1.line} />
            <circle cx={RX(w2.phi)} cy={YR} r={4.6} fill={COL2.line} />
            <Lbl x={RX(w1.phi)} y={YR + 27} s="φ₁" color={COL1.text} cls="w51-lbl strong" />
            <Lbl x={RX(w2.phi)} y={YR + 27} s="φ₂" color={COL2.text} cls="w51-lbl strong" />
          </Obj>
          <Obj id="pc_verdict">
            <rect x={RL - 6} y={146} width={RR - RL + 14} height={20} rx={6} className="w51-pill" />
            <Lbl x={(RL + RR) / 2 + 1} y={159.5} s={`Δφ = ${fmtAng(cmp.d, true)} ⇒ ${verdict}`} color={C.projT} cls="w51-tick strong" />
          </Obj>

          {/* the waves */}
          <Obj id="pc_waves">
            <line x1={W0} y1={YW} x2={W1} y2={YW} className="w51-axis" />
            {[0, 360, 720].map((d) => (
              <text key={d} x={WX(d)} y={YW + AW + 12} className="w51-tick" textAnchor={d === 0 ? 'start' : d === 720 ? 'end' : 'middle'} fill={C.muted}>
                {d === 0 ? 'ωt = 0' : `${d}°`}
              </text>
            ))}
            {para && <path d={wave(abs(S), argDeg(S))} fill="none" stroke={COLS.line} strokeWidth={2.4} />}
            <path d={wave(w1.A, w1.phi)} fill="none" stroke={COL1.line} strokeWidth={1.8} />
            <path d={wave(w2.A, w2.phi)} fill="none" stroke={COL2.line} strokeWidth={1.8} />
            {[
              { A: w1.A, phi: w1.phi, col: COL1 },
              { A: w2.A, phi: w2.phi, col: COL2 },
            ].map((w, i) => (
              <g key={i}>
                <line x1={WX(crest(w.phi))} y1={YW - (w.A / AM) * AW} x2={WX(crest(w.phi))} y2={YW + AW} stroke={w.col.line} strokeWidth={1} strokeDasharray="2 3" />
                <circle cx={WX(crest(w.phi))} cy={YW - (w.A / AM) * AW} r={3.4} fill={w.col.line} />
              </g>
            ))}
          </Obj>
        </svg>
      </div>

      <div className="w51-readout">
        <div className="w51-rgrid">
          <Cell id="pc_v1" k={`${s1} 统一后`} v={cosText(w1.A, w1.phi)} tone={COL1.text} opt />
          <Cell id="pc_v2" k={`${s2} 统一后`} v={cosText(w2.A, w2.phi)} tone={COL2.text} opt />
          <Cell id="pc_ruler" k="Δφ = φ₂ − φ₁" v={fmtAng(cmp.d, true)} />
          <Cell id="pc_verdict" k="判定" v={verdict} tone={C.projT} />
          {para && <Cell id="pc_sum" k={`合相量 ${s1}+${s2}`} v={fmtPolar(S)} tone={COLS.text} />}
          {para && <Cell id="pc_para" k="实部 + j 虚部" v={fmtRect(S)} tone={COLS.text} />}
        </div>
      </div>
    </div>
  );
}

function WaveCtl({
  n,
  sym,
  f,
  setF,
  A,
  setA,
  th,
  setTh,
  color,
}: {
  n: 1 | 2;
  sym: string;
  f: Func;
  setF: (f: Func) => void;
  A: number;
  setA: (a: number) => void;
  th: number;
  setTh: (t: number) => void;
  color: string;
}) {
  const hot = useHot(`pc_v${n}`);
  return (
    <div className={`w51-wavectl${hot.lit ? ' lit' : ''}`} {...hot.on}>
      <span className="name" style={{ color }}>
        <span className="full">波形 {n}</span>
        <span className="short">{sym}</span>
      </span>
      <select value={f} onChange={(e) => setF(e.target.value as Func)} aria-label={`波形 ${n} 形式`}>
        {FUNCS.map((x) => (
          <option key={x} value={x}>
            {x.startsWith('-') ? '−' : '+'}
            {FUNC_TEXT[x].replace('−', '')}
          </option>
        ))}
      </select>
      <span className="w51-step" aria-label={`波形 ${n} 幅值`}>
        <button onClick={() => setA(Math.max(1, A - 1))} aria-label="幅值减 1">
          −
        </button>
        <b>{fmt(A)}</b>
        <button onClick={() => setA(Math.min(20, A + 1))} aria-label="幅值加 1">
          +
        </button>
      </span>
      <label className="w51-slider bare">
        <span className="k">相位</span>
        <input type="range" min={-180} max={180} step={5} value={th} onChange={(e) => setTh(Number(e.target.value))} aria-label={`波形 ${n} 原始相位`} />
        <span className="v">{fmtAng(th, true)}</span>
      </label>
    </div>
  );
}

function ParaButton({ on, onClick }: { on: boolean; onClick: () => void }) {
  const hot = useHot('pc_para');
  return (
    <button className={`w51-btn${on ? ' on' : ''}${hot.lit ? ' lit' : ''}`} aria-pressed={on} onClick={onClick} {...hot.on}>
      <span className="full">显示相量叠加平行四边形</span>
      <span className="short">相量叠加</span>
    </button>
  );
}
