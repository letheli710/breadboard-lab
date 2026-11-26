import { describe, expect, it } from 'vitest';
import { lm358Pin } from './Lm358';

describe('lm358Pin', () => {
  it('numbers the DIP-8 counter-clockwise from pin 1 bottom-left', () => {
    expect(lm358Pin(20, 1)).toEqual({ col: 20, row: 'f' });
    expect(lm358Pin(20, 4)).toEqual({ col: 23, row: 'f' });
    expect(lm358Pin(20, 5)).toEqual({ col: 23, row: 'e' });
    expect(lm358Pin(20, 8)).toEqual({ col: 20, row: 'e' });
  });
});
