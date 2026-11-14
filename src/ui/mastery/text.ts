// Labels of the notebook's mistake types and attempt sources (bilingual).

import { tr } from '../../core/i18n';
import type { MistakeType, Via } from '../../state/mastery';

/** short label: "√2 峰值/有效值" */
export function mistakeLabel(t: MistakeType): string {
  switch (t) {
    case 'sign':
      return tr('符号 / 参考方向', 'Sign / reference direction');
    case 'close':
      return tr('舍入误差', 'Rounding');
    case 'e3':
      return tr('×10³ 单位前缀', '×10³ unit prefix');
    case 'e6':
      return tr('×10⁶ 单位前缀', '×10⁶ unit prefix');
    case 'e9':
      return tr('×10⁹ 单位前缀', '×10⁹ unit prefix');
    case 'sqrt2':
      return tr('√2 峰值与有效值', '√2 peak vs RMS');
    case 'sqrt3':
      return tr('√3 线量与相量', '√3 line vs phase');
    case '2pi':
      return tr('2π 角频率与频率', '2π ω vs f');
    case 'recip':
      return tr('倒数（R/G、T/f）', 'Reciprocal (R/G, T/f)');
    case 'rad':
      return tr('弧度与角度', 'Radians vs degrees');
    case 'phase180':
      return tr('相位差 180°', 'Phase off by 180°');
    case 'wrong':
      return tr('其他错误', 'Other wrong value');
    case 'choice':
      return tr('选择题选错', 'Wrong option');
    case 'revealed':
      return tr('看了答案', 'Answer revealed');
    case 'blank':
      return tr('测验中未作答', 'Left blank in a quiz');
    case 'old':
      return tr('早期记录（无详情）', 'Earlier record (no details)');
  }
}

export function viaLabel(v: Via): string {
  return { practice: tr('练习', 'practice'), retry: tr('盲做重试', 'blind retry'), review: tr('复习', 'review'), quiz: tr('测验', 'quiz') }[v];
}

/** "11月14日" / "Nov 14" (the year only when it isn't this year) */
export function dayLabel(day: string, today: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const sameYear = today.slice(0, 4) === day.slice(0, 4);
  const en = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }), timeZone: 'UTC' });
  return tr(`${sameYear ? '' : `${y}年`}${m}月${d}日`, en);
}

export const qLetter = (qids: string[], qid: string) => {
  const i = qids.indexOf(qid);
  return i < 0 ? qid : String.fromCharCode(97 + i);
};
