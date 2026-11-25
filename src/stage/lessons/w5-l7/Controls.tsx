// Controls shared by the W5-L7 Bode layers: the transfer-function picker and the act 3 brick picker
// (which basic factor, its K / zero-or-pole / ζ).

import { BLOCK_W, fmt, type BlockKind, type Factor, type Preset } from './model';
import { cursorFor, PRESET_LABEL, Seg, type Lab } from './state';

export function PresetSeg({ lab, only }: { lab: Lab; only?: Preset[] }) {
  const list = (only ?? (['rc', 'block', 'ex4', 'guided'] as Preset[])).map((p) => ({ v: p, full: PRESET_LABEL[p][0], short: PRESET_LABEL[p][1] }));
  return (
    <Seg
      label="传递函数"
      value={lab.preset}
      options={list}
      onChange={(p) => {
        lab.setPreset(p);
        lab.setW(cursorFor(p, 1 / (lab.R * lab.C)));
      }}
    />
  );
}

const ZETAS = [0.1, 0.3, 0.707, 1];

export function BlockControls({ lab }: { lab: Lab }) {
  return (
    <div className="w57-controls">
      <Seg<BlockKind>
        label="基本因子"
        value={lab.block}
        options={[
          { v: 'K', full: '① 常数 K', short: 'K' },
          { v: 'origin', full: '② 原点零/极点', short: 'jω' },
          { v: 'real', full: '③ 一阶实零/极点', short: '一阶' },
          { v: 'quad', full: '④ 二阶共轭极点', short: '二阶' },
        ]}
        onChange={(b) => {
          lab.setBlock(b);
          lab.setW(b === 'origin' ? 1 : BLOCK_W);
        }}
      />
      {lab.block === 'K' && (
        <Seg<number>
          label="K"
          value={lab.bk}
          options={[
            { v: 10, full: 'K = 10' },
            { v: 0.1, full: 'K = 0.1' },
            { v: -10, full: 'K = −10' },
          ]}
          onChange={lab.setBk}
        />
      )}
      {(lab.block === 'origin' || lab.block === 'real') && (
        <Seg<number>
          label="零点或极点"
          value={lab.sign}
          options={[
            { v: 1, full: '零点 +1' },
            { v: -1, full: '极点 −1' },
          ]}
          onChange={(v) => lab.setSign(v === 1 ? 1 : -1)}
        />
      )}
      {lab.block === 'quad' && (
        <div className="w57-slider">
          <label>
            ζ{' '}
            <b>
              {fmt(lab.zeta, lab.zeta < 0.1 ? 3 : 3)
                .replace(/0+$/, '')
                .replace(/\.$/, '')}
            </b>
          </label>
          <input
            type="range"
            min={0.05}
            max={1.5}
            step={0.005}
            value={lab.zeta}
            aria-label="阻尼比 ζ"
            onChange={(e) => {
              let z = Number(e.target.value);
              for (const s of ZETAS) if (Math.abs(z - s) < 0.02) z = s;
              lab.setZeta(z);
            }}
          />
          <span className="w57-chips">
            {ZETAS.map((z) => (
              <button key={z} className={lab.zeta === z ? 'on' : ''} onClick={() => lab.setZeta(z)}>
                {z}
              </button>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}

/** a factor's name as plain text ("1/(1+jω/2)"); K stays "?" until the guided example finds it */
export function factorText(f: Factor, kShown = true): string {
  switch (f.kind) {
    case 'K':
      return kShown ? `K = ${fmt(f.K!, f.K! % 1 ? 1 : 0)}` : 'K = ?';
    case 'origin':
      return f.n === 1 ? 'jω' : '1/(jω)';
    case 'real':
      return f.n === 1 ? `(1+jω/${f.w})` : `1/(1+jω/${Number(f.w!.toPrecision(4))})`;
    case 'quad':
      return `二阶 ζ=${fmt(f.zeta!, 3).replace(/0+$/, '').replace(/\.$/, '')}`;
  }
}
