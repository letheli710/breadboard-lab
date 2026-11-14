// Card-style units (CHALLENGE_FORMAT §16): cards take the steps in order, translations replace
// titles and texts by position, and the validator rejects cards that leave steps out.
import { afterEach, describe, expect, it } from 'vitest';
import { parseChallenge } from './challenge';
import { setLang } from './i18n';

const base = {
  format: 'breadboard-challenge/1',
  id: 't',
  title: 't',
  kind: 'lesson',
  components: [{ ref: 'R1', type: 'resistor' }],
  connections: [['R1.1', 'R1.2']],
  steps: ['one', 'two', 'three'],
};

describe('lesson cards', () => {
  afterEach(() => setLang('zh'));

  it('splits the steps between the cards in order', () => {
    const r = parseChallenge({
      ...base,
      cards: [
        { kind: 'try', title: '试', text: ['a', 'b'], steps: 1 },
        { kind: 'explain', title: '想', text: '$R = \\frac{V}{I}$' },
        { kind: 'build', title: '做', steps: 2 },
        { kind: 'wrap', title: '带', practice: ['basics'] },
      ],
    });
    expect(r.errors).toEqual([]);
    const cards = r.challenge!.cards;
    expect(cards.map((c) => [c.kind, c.first, c.count])).toEqual([
      ['try', 0, 1],
      ['explain', 1, 0],
      ['build', 1, 2],
      ['wrap', 3, 0],
    ]);
    expect(cards[0].text).toBe('a\nb');
    expect(cards[3].practice).toEqual(['basics']);
  });

  it('uses the translated titles and texts', () => {
    setLang('en');
    const r = parseChallenge({
      ...base,
      cards: [{ kind: 'build', title: '做', text: '中文', steps: 3 }],
      i18n: { en: { cards: [{ title: 'Build', text: 'English' }] } },
    });
    expect(r.challenge!.cards[0]).toMatchObject({ title: 'Build', text: 'English' });
  });

  it('rejects cards that do not own every step, unknown kinds and unknown chapters', () => {
    const errs = parseChallenge({
      ...base,
      cards: [
        { kind: 'try', title: 'a', steps: 1 },
        { kind: 'nope', title: 'b', steps: 1, practice: ['no-such-chapter'] },
      ],
    }).errors.join('\n');
    expect(errs).toMatch(/add up to 2|加起来是 2/);
    expect(errs).toMatch(/kind/);
    expect(errs).toMatch(/no-such-chapter/);
  });
});
