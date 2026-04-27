import { describe, expect, it } from 'vitest';
import { addSeekListener, dispatchSeek } from './seekBridge';

describe('seekBridge', () => {
  it('dispatches and receives seek events', () => {
    const target = new EventTarget();
    let received: number | null = null;
    const off = addSeekListener((timeSec) => {
      received = timeSec;
    }, target);

    dispatchSeek(42, target);
    expect(received).toBe(42);

    received = null;
    off();
    dispatchSeek(10, target);
    expect(received).toBeNull();
  });

  it('ignores non-finite timeSec', () => {
    const target = new EventTarget();
    let received: number | null = null;
    addSeekListener((timeSec) => {
      received = timeSec;
    }, target);

    dispatchSeek(Number.NaN, target);
    expect(received).toBeNull();
  });
});
