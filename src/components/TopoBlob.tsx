import React, { useMemo } from 'react';

type Props = {
  seed?: number;
  size?: number;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hashNumber(seed: number) {
  const s = Math.floor(seed * 1000);
  let h = 2166136261;
  h ^= s & 0xff;
  h = Math.imul(h, 16777619);
  h ^= (s >>> 8) & 0xff;
  h = Math.imul(h, 16777619);
  h ^= (s >>> 16) & 0xff;
  h = Math.imul(h, 16777619);
  h ^= (s >>> 24) & 0xff;
  h = Math.imul(h, 16777619);
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function polarPath({
  center,
  baseRadius,
  vertices,
  seed,
  wobble,
  jagged,
}: {
  center: number;
  baseRadius: number;
  vertices: number;
  seed: number;
  wobble: { a: number; b: number; c: number; p1: number; p2: number; p3: number };
  jagged: number;
}) {
  const points: Array<[number, number]> = [];
  for (let i = 0; i <= vertices; i += 1) {
    const t = (i / vertices) * Math.PI * 2;
    const n =
      Math.sin(t * wobble.a + wobble.p1) * 0.55 +
      Math.sin(t * wobble.b + wobble.p2) * 0.32 +
      Math.cos(t * wobble.c + wobble.p3) * 0.28;

    const micro = Math.sin(t * (9 + (seed % 5)) + seed * 0.013) * 0.18;
    const radius = baseRadius * (1 + (n + micro) * jagged);
    const x = center + Math.cos(t) * radius;
    const y = center + Math.sin(t) * radius;
    points.push([x, y]);
  }

  const [x0, y0] = points[0]!;
  let d = `M ${x0.toFixed(2)} ${y0.toFixed(2)}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = points[i]!;
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  d += ' Z';
  return d;
}

export default function TopoBlob({ seed = 132, size = 400, className }: Props) {
  const paths = useMemo(() => {
    const h = hashNumber(seed);
    const rand = mulberry32(h);

    const center = 500;
    const vertices = 80;
    const steps = 15;
    const minR = 0.3;
    const maxR = 1.0;
    const radiusMax = 420;

    const wobble = {
      a: 2 + Math.floor(rand() * 4),
      b: 3 + Math.floor(rand() * 5),
      c: 5 + Math.floor(rand() * 6),
      p1: rand() * Math.PI * 2,
      p2: rand() * Math.PI * 2,
      p3: rand() * Math.PI * 2,
    };

    return Array.from({ length: steps }, (_, i) => {
      const u = i / (steps - 1);
      const r = minR + (maxR - minR) * u;
      const baseRadius = radiusMax * r;
      const jagged = clamp(0.12 + (1 - r) * 0.22, 0.08, 0.28);
      return polarPath({ center, baseRadius, vertices, seed: h, wobble, jagged });
    });
  }, [seed]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1000 1000"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
      ))}
    </svg>
  );
}

