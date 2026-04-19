import React, { useMemo } from 'react';

type TMHWallpaperMode = 'outline' | 'solid' | 'mixed';

type Props = {
  text?: string[];
  mode?: TMHWallpaperMode;
  color?: string;
  opacity?: number;
  rotation?: number;
};

type RowStyle = React.CSSProperties & { ['--wp-offset']?: string };

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
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

export default function TMHWallpaper({
  text = ['TECH MY HOUSE', 'RADIO SHOW'],
  mode = 'mixed',
  color = 'currentColor',
  opacity = 0.08,
  rotation = -2,
}: Props) {
  const rows = useMemo(() => {
    const seed = hashString('TMHWallpaper');
    const rand = mulberry32(seed);

    const rowCount = 14;
    const content = Array.isArray(text) && text.length > 0 ? text : ['TECH MY HOUSE'];

    return Array.from({ length: rowCount }, (_, i) => {
      const offset = Math.round((rand() * 2 - 1) * 180);
      const value = content[i % content.length];
      const isOutline = mode === 'outline' ? true : mode === 'solid' ? false : i % 2 === 1;
      return { offset, value, isOutline };
    });
  }, [mode, text]);

  return (
    <div
      className="tmh-wallpaper"
      style={{
        opacity,
        color,
        transform: `rotate(${rotation}deg) scale(1.1)`,
      }}
      aria-hidden="true"
    >
      {rows.map((row, i) => (
        <span
          key={`${row.value}-${i}`}
          className={row.isOutline ? 'tmh-wallpaper__row tmh-wallpaper--outline' : 'tmh-wallpaper__row'}
          style={{ '--wp-offset': `${row.offset}px` } as RowStyle}
        >
          {row.value} · {row.value} · {row.value} · {row.value}
        </span>
      ))}
    </div>
  );
}

