import { describe, expect, it } from 'vitest';
import { clamp, computeParallaxOffsetFromScrollY, computeParallaxOffsetPx } from './parallaxMath';

describe('parallaxMath', () => {
  it('clamps within range', () => {
    expect(clamp(10, 0, 5)).toBe(5);
    expect(clamp(-1, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });

  it('returns 0 at viewport center', () => {
    expect(
      computeParallaxOffsetPx({
        viewportHeight: 1000,
        elementTop: 500 - 100,
        elementHeight: 200,
        speed: 0.08,
        strength: 1,
        maxPx: 120,
      })
    ).toBeCloseTo(0, 5);
  });

  it('respects maxPx', () => {
    const px = computeParallaxOffsetPx({
      viewportHeight: 1000,
      elementTop: 0,
      elementHeight: 200,
      speed: 0.3,
      strength: 1,
      maxPx: 40,
    });
    expect(Math.abs(px)).toBeLessThanOrEqual(40);
  });

  it('computeParallaxOffsetFromScrollY clamps and changes with scroll', () => {
    expect(
      computeParallaxOffsetFromScrollY({
        scrollY: 0,
        speed: 0.05,
        strength: 1,
        maxPx: 120,
      })
    ).toBe(0);
    expect(
      computeParallaxOffsetFromScrollY({
        scrollY: 1000,
        speed: 0.05,
        strength: 1,
        maxPx: 120,
      })
    ).toBe(-50);
    expect(
      computeParallaxOffsetFromScrollY({
        scrollY: 10_000,
        speed: 0.05,
        strength: 1,
        maxPx: 120,
      })
    ).toBe(-120);
  });
});
