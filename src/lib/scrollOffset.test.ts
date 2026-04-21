import { describe, expect, it } from 'vitest';
import { getScrollTopWithOffset } from './scrollOffset';

describe('getScrollTopWithOffset', () => {
  it('computes a top offset based on element rect top and window scrollY', () => {
    expect(getScrollTopWithOffset({ elementTopInViewport: 200, scrollY: 1000, offset: 112 })).toBe(1088);
  });

  it('clamps to 0', () => {
    expect(getScrollTopWithOffset({ elementTopInViewport: 20, scrollY: 10, offset: 112 })).toBe(0);
  });
});

