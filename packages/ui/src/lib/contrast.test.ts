import { describe, expect, it } from 'vitest';
import { contrastRatio, parseHex, relativeLuminance } from './contrast';

describe('parseHex', () => {
  it('parses 6-digit and 3-digit hex', () => {
    expect(parseHex('#14110f')).toEqual([20, 17, 15]);
    expect(parseHex('#FFF')).toEqual([255, 255, 255]);
  });

  it('rejects anything that is not hex', () => {
    expect(() => parseHex('rgb(0 0 0)')).toThrow();
    expect(() => parseHex('#12345')).toThrow();
  });
});

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance([0, 0, 0])).toBe(0);
    expect(relativeLuminance([255, 255, 255])).toBe(1);
  });
});

describe('contrastRatio', () => {
  it('matches known WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    // #767676 on white is the classic "just passes AA" grey.
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
  });

  it('does not depend on argument order', () => {
    expect(contrastRatio('#9e2b25', '#f4ecdc')).toBe(contrastRatio('#f4ecdc', '#9e2b25'));
  });
});
