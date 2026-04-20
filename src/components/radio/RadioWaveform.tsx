import React, { useEffect, useRef } from 'react';

type RadioWaveformProps = {
  isActive: boolean;
  accentRgb?: string;
  ariaLabel?: string;
};

export default function RadioWaveform({
  isActive,
  accentRgb = '204 255 0',
  ariaLabel = 'Audio visualizer',
}: RadioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      ctx = null;
    }
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const w = Math.max(1, wrap.clientWidth);
      const h = Math.max(1, wrap.clientHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const bars = 64;
      const barW = Math.max(2, Math.floor(w / bars) - 2);
      const gap = 2;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';

      for (let i = 0; i < bars; i += 1) {
        const x = i * (barW + gap);
        const wave = 0.45 + Math.sin((i / 5) + t) * 0.25 + Math.sin((i / 13) + t * 0.5) * 0.15;
        const amp = isActive ? wave : 0.22;
        const hh = Math.max(4, amp * h);
        const y = (h - hh) / 2;
        ctx.fillRect(x, y, barW, hh);
      }

      ctx.fillStyle = `rgb(${accentRgb})`;
      for (let i = 0; i < bars; i += 1) {
        const x = i * (barW + gap);
        const wave = 0.45 + Math.sin((i / 5) + t) * 0.25 + Math.sin((i / 13) + t * 0.5) * 0.15;
        const amp = isActive ? wave : 0.14;
        const hh = Math.max(2, amp * h * 0.8);
        const y = (h - hh) / 2;
        ctx.fillRect(x, y, barW, hh);
      }

      if (isActive) {
        t += 0.06;
        raf = window.requestAnimationFrame(draw);
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();
    draw();

    return () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [accentRgb, isActive]);

  return (
    <div
      ref={wrapRef}
      aria-label={ariaLabel}
      className="relative h-16 w-full overflow-hidden border border-white/10 bg-black/20"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
