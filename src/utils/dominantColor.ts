type DominantColorOptions = {
  sampleSize?: number;
};

const cache = new Map<string, Promise<string | null>>();

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
};

const hslToRgb = (h: number, s: number, l: number) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

const ensureReadableGlow = (r: number, g: number, b: number) => {
  const { h, s, l } = rgbToHsl(r, g, b);
  const targetS = Math.max(0.45, s);
  const targetL = Math.min(0.72, Math.max(0.42, l));
  return hslToRgb(h, clamp01(targetS), clamp01(targetL));
};

const pickDominantColor = (data: Uint8ClampedArray) => {
  const bins = new Map<number, { count: number; r: number; g: number; b: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 32) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const brightness = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
    if (brightness < 0.08) continue;

    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const prev = bins.get(key);
    if (prev) {
      prev.count += 1;
      prev.r += r;
      prev.g += g;
      prev.b += b;
    } else {
      bins.set(key, { count: 1, r, g, b });
    }
  }

  let winner: { count: number; r: number; g: number; b: number } | undefined;
  for (const b of bins.values()) {
    if (!winner || b.count > winner.count) winner = b;
  }

  if (!winner) return null;

  const r = Math.round(winner.r / winner.count);
  const g = Math.round(winner.g / winner.count);
  const b = Math.round(winner.b / winner.count);
  const adjusted = ensureReadableGlow(r, g, b);
  return `${adjusted.r} ${adjusted.g} ${adjusted.b}`;
};

export async function getDominantColor(url: string, options: DominantColorOptions = {}) {
  const existing = cache.get(url);
  if (existing) return existing;

  const promise = (async () => {
    const sampleSize = options.sampleSize ?? 32;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.src = url;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load failed'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
      return pickDominantColor(data);
    } catch {
      return null;
    }
  })();

  cache.set(url, promise);
  return promise;
}
