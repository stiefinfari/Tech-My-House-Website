export function generateWaveformPeaks(seed: string, count: number) {
  const size = Math.max(8, Math.min(512, Math.floor(count)));
  const base = new Array<number>(size);

  const fnv1a = (value: string) => {
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const mulberry32 = (a: number) => {
    let t = a >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let x = t;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  };

  const rnd = mulberry32(fnv1a(seed));

  for (let i = 0; i < size; i++) {
    const v = rnd();
    const shaped = Math.pow(v, 0.55);
    base[i] = 0.08 + shaped * 0.92;
  }

  const smooth = (arr: number[]) => {
    const out = new Array<number>(arr.length);
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i - 2] ?? arr[i];
      const b = arr[i - 1] ?? arr[i];
      const c = arr[i];
      const d = arr[i + 1] ?? arr[i];
      const e = arr[i + 2] ?? arr[i];
      out[i] = (a + b * 2 + c * 3 + d * 2 + e) / 9;
    }
    return out;
  };

  const a = smooth(base);
  const b = smooth(a);
  const c = smooth(b);

  const peaks = c.map((v) => Math.max(0.06, Math.min(1, v)));
  return peaks;
}

