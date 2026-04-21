export function getInitialSelectedIndex(input: { previous: number; current: number; length: number }): number {
  const { previous, current, length } = input;
  if (length <= 0) return -1;
  if (previous >= 0 && previous < length) return previous;
  if (current >= 0 && current < length) return current;
  return 0;
}

export function getNextSelectedIndex(input: { key: string; selected: number; length: number }): number | null {
  const { key, selected, length } = input;
  if (length <= 0) return null;
  const safeSelected = Math.max(0, Math.min(length - 1, selected));
  if (key === 'ArrowDown') return Math.min(length - 1, safeSelected + 1);
  if (key === 'ArrowUp') return Math.max(0, safeSelected - 1);
  if (key === 'Home') return 0;
  if (key === 'End') return length - 1;
  return null;
}

