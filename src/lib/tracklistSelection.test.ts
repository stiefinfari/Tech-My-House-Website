import { describe, expect, it } from 'vitest';
import { getInitialSelectedIndex, getNextSelectedIndex } from './tracklistSelection';

describe('getInitialSelectedIndex', () => {
  it('keeps previous if valid', () => {
    expect(getInitialSelectedIndex({ previous: 2, current: 5, length: 10 })).toBe(2);
  });

  it('falls back to current if previous invalid', () => {
    expect(getInitialSelectedIndex({ previous: -1, current: 3, length: 10 })).toBe(3);
  });

  it('clamps to 0 when current is invalid', () => {
    expect(getInitialSelectedIndex({ previous: -1, current: -1, length: 10 })).toBe(0);
  });

  it('returns -1 when length is 0', () => {
    expect(getInitialSelectedIndex({ previous: -1, current: 3, length: 0 })).toBe(-1);
  });
});

describe('getNextSelectedIndex', () => {
  it('moves down', () => {
    expect(getNextSelectedIndex({ key: 'ArrowDown', selected: 1, length: 4 })).toBe(2);
  });

  it('moves up', () => {
    expect(getNextSelectedIndex({ key: 'ArrowUp', selected: 1, length: 4 })).toBe(0);
  });

  it('clamps at bounds', () => {
    expect(getNextSelectedIndex({ key: 'ArrowUp', selected: 0, length: 4 })).toBe(0);
    expect(getNextSelectedIndex({ key: 'ArrowDown', selected: 3, length: 4 })).toBe(3);
  });

  it('supports Home/End', () => {
    expect(getNextSelectedIndex({ key: 'Home', selected: 2, length: 4 })).toBe(0);
    expect(getNextSelectedIndex({ key: 'End', selected: 1, length: 4 })).toBe(3);
  });

  it('returns null for unrelated keys', () => {
    expect(getNextSelectedIndex({ key: 'Escape', selected: 1, length: 4 })).toBeNull();
  });
});

