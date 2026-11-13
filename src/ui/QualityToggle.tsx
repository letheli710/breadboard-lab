// Toolbar toggle for the 3D render quality (see three/quality.ts). Clicking flips between high
// and low and remembers the choice; until then the scene follows the automatic choice.

import { tr } from '../core/i18n';
import { isLow, useQuality } from '../three/quality';

export function QualityToggle() {
  const setting = useQuality((s) => s.setting);
  const low = useQuality(isLow);
  const setSetting = useQuality((s) => s.setSetting);
  const auto = setting === 'auto';
  const title = low
    ? tr('流畅模式：较低的阴影和分辨率，适合性能较弱的电脑。点击切换到高画质', 'Smooth mode: lower shadow and pixel resolution for weaker computers. Click for high quality')
    : tr('高画质。点击切换到流畅模式（较低的阴影和分辨率）', 'High quality. Click for smooth mode (lower shadow and pixel resolution)');
  return (
    <button
      className={low ? 'on' : ''}
      aria-pressed={low}
      data-quality={low ? 'low' : 'high'}
      onClick={() => setSetting(low ? 'high' : 'low')}
      title={auto ? `${title}${tr('（当前为自动选择）', ' (chosen automatically)')}` : title}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden>
        <path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
      </svg>
      <span>{tr('流畅', 'Smooth')}</span>
    </button>
  );
}
