// W1-L0's stage layers: the X-ray breadboard (with its slider) and the multimeter bench.

import BreadboardXray from '../../BreadboardXray';
import { useStage } from '../../stageStore';

export function XrayLayer() {
  const xray = useStage((s) => s.xray);
  const setXray = useStage((s) => s.setXray);
  return (
    <>
      <label className="xray-slider">
        <span>X-Ray 掀开塑料外壳</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(xray * 100)}
          onChange={(e) => setXray(Number(e.target.value) / 100)}
          aria-valuetext={`${Math.round(xray * 100)}%`}
        />
        <b>{Math.round(xray * 100)}%</b>
      </label>
      <div className="bb3d-wrap">
        <BreadboardXray />
      </div>
      <p className="bb3d-hint">拖动旋转 · 滚轮缩放 · 上下两组电源轨之间并不相通，要用跳线连起来</p>
    </>
  );
}
