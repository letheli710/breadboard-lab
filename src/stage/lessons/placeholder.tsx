// A lesson registered in the course map whose content is still being built: one act that says so.

import type { StageLesson } from '../types';

function Empty() {
  return <div className="stage-loading">这节课的舞台还在制作中</div>;
}

export function placeholderLesson(code: string, title: string, minutes: number, sheet: string, world = 'World 1'): StageLesson {
  return {
    format: 'lesson-stage/2',
    renderers: { empty: Empty },
    lesson_meta: {
      lesson_id: code,
      world,
      title,
      subtitle: '这节课正在按执行稿制作，马上上线。',
      lesson_type: 'B',
      lesson_type_label: '制作中',
      estimated_minutes: minutes,
      textbook_primary: { book: 'Fundamentals of Electric Circuits (2026 Release)', sections: [] },
      prerequisites: [],
    },
    left_stage_spec: {
      use_3d: false,
      layers: [{ id: 'empty', label: '制作中', render_mode: '2D_INTERACTIVE_SVG', caption: `执行稿：${sheet}` }],
      hover_map: {},
    },
    right_acts: [{ act_index: 1, badge: '第 1 幕', title: '制作中', sync: { layer: 'empty' }, blocks: [{ kind: 'p', text: '这节课正在按执行稿制作。' }] }],
  };
}
