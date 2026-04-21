export function getScrollTopWithOffset(input: { elementTopInViewport: number; scrollY: number; offset: number }): number {
  const top = input.elementTopInViewport + input.scrollY - input.offset;
  return Math.max(0, top);
}

