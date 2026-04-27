export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type ComputeParallaxOffsetFromScrollYInput = {
  scrollY: number;
  speed: number;
  strength: number;
  maxPx: number;
};

export function computeParallaxOffsetFromScrollY({
  scrollY,
  speed,
  strength,
  maxPx,
}: ComputeParallaxOffsetFromScrollYInput) {
  if (!scrollY || strength === 0) return 0;
  if (!speed) return 0;
  const px = -scrollY * speed * strength;
  return clamp(px, -maxPx, maxPx);
}

type ComputeParallaxOffsetPxInput = {
  viewportHeight: number;
  elementTop: number;
  elementHeight: number;
  speed: number;
  strength: number;
  maxPx: number;
};

export function computeParallaxOffsetPx({
  viewportHeight,
  elementTop,
  elementHeight,
  speed,
  strength,
  maxPx,
}: ComputeParallaxOffsetPxInput) {
  if (!viewportHeight || viewportHeight <= 0) return 0;
  if (!elementHeight || elementHeight <= 0) return 0;
  if (!speed || strength === 0) return 0;

  const center = elementTop + elementHeight / 2;
  const halfViewport = viewportHeight / 2;
  const t = clamp((center - halfViewport) / halfViewport, -1, 1);
  const amplitude = viewportHeight * speed * strength;
  const px = -t * amplitude;
  return clamp(px, -maxPx, maxPx);
}
