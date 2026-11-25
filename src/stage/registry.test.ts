import { describe, expect, it } from 'vitest';
import { LESSON_LOADERS, lessonSlug } from './lessons';
import { STAGE_LESSON_INDEX } from './registry';

describe('stage lesson registry', () => {
  it('has a lesson file for every entry, and each file matches its entry', async () => {
    expect(Object.keys(LESSON_LOADERS).sort()).toEqual(STAGE_LESSON_INDEX.map((e) => e.slug).sort());
    for (const e of STAGE_LESSON_INDEX) {
      const l = await LESSON_LOADERS[e.slug]();
      expect(lessonSlug(l.lesson_meta.lesson_id)).toBe(e.slug);
      expect(l.lesson_meta.lesson_id).toBe(e.code);
      expect(l.lesson_meta.title).toBe(e.title.zh);
      expect(l.lesson_meta.estimated_minutes).toBe(e.minutes);
      expect(l.right_acts.length).toBeGreaterThan(0);
    }
  });
});
