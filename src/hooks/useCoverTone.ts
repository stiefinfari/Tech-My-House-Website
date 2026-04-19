import { useEffect, useState } from 'react';
import ColorThief from 'colorthief';

export type Tone = { rgb: string; hex: string; onTone: 'light' | 'dark' };

function luminance(r: number, g: number, b: number) {
  const [R, G, B] = [r, g, b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export default function useCoverTone(url?: string): Tone | null {
  const [tone, setTone] = useState<Tone | null>(null);

  useEffect(() => {
    if (!url) {
      setTone(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      try {
        const ct = new ColorThief();
        const [r, g, b] = ct.getColor(img);
        const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
        const onTone = luminance(r, g, b) > 0.45 ? 'dark' : 'light';
        setTone({ rgb: `${r} ${g} ${b}`, hex, onTone });
      } catch {
        setTone(null);
      }
    };
    img.onerror = () => setTone(null);
  }, [url]);

  return tone;
}
