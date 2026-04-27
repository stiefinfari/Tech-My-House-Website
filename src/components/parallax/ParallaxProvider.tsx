import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import useParallaxPrefs from '../../hooks/useParallaxPrefs';
import { clamp, computeParallaxOffsetFromScrollY, computeParallaxOffsetPx } from '../../lib/parallaxMath';
import { ParallaxContext, type ParallaxContextValue, type ParallaxItemConfig } from './parallaxContext';

type RegisteredItem = {
  el: HTMLElement;
  config: Required<Pick<ParallaxItemConfig, 'mode' | 'speedX' | 'speedY' | 'maxPx'>>;
};

export default function ParallaxProvider({ children }: { children: React.ReactNode }) {
  const { enabled, strength } = useParallaxPrefs();

  const itemsRef = useRef<RegisteredItem[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastScrollYRef = useRef<number | null>(null);
  const lastViewportHRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  const loop = useCallback(() => {
    if (!runningRef.current) return;

    const viewportHeight = window.innerHeight || 0;
    const roundedScrollY = Math.round(window.scrollY || 0);

    if (roundedScrollY !== lastScrollYRef.current || viewportHeight !== lastViewportHRef.current) {
      lastScrollYRef.current = roundedScrollY;
      lastViewportHRef.current = viewportHeight;

      const current = itemsRef.current;
      for (const item of current) {
        if (!item.el.isConnected) continue;
        const maxPx = clamp(item.config.maxPx, 0, 600);

        const rect = item.config.mode === 'element' ? item.el.getBoundingClientRect() : null;

        const y =
          item.config.mode === 'scroll'
            ? computeParallaxOffsetFromScrollY({
                scrollY: roundedScrollY,
                speed: item.config.speedY,
                strength,
                maxPx,
              })
            : rect
              ? computeParallaxOffsetPx({
                  viewportHeight,
                  elementTop: rect.top,
                  elementHeight: rect.height,
                  speed: item.config.speedY,
                  strength,
                  maxPx,
                })
              : 0;

        const x =
          item.config.speedX !== 0
            ? item.config.mode === 'scroll'
              ? computeParallaxOffsetFromScrollY({
                  scrollY: roundedScrollY,
                  speed: item.config.speedX,
                  strength,
                  maxPx,
                })
              : rect
                ? computeParallaxOffsetPx({
                    viewportHeight,
                    elementTop: rect.top,
                    elementHeight: rect.height,
                    speed: item.config.speedX,
                    strength,
                    maxPx,
                  })
                : 0
            : 0;

        item.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      }
    }

    rafRef.current = window.requestAnimationFrame(loop);
  }, [strength]);

  const start = useCallback(() => {
    if (!enabled) return;
    if (runningRef.current) return;
    if (itemsRef.current.length === 0) return;
    runningRef.current = true;
    lastScrollYRef.current = null;
    lastViewportHRef.current = null;
    rafRef.current = window.requestAnimationFrame(loop);
  }, [enabled, loop]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const schedule = useCallback(() => {
    if (!enabled) return;
    start();
  }, [enabled, start]);

  useEffect(() => {
    if (!enabled) {
      stop();
      for (const item of itemsRef.current) {
        item.el.style.transform = '';
      }
      return;
    }
    schedule();

    return () => {
      stop();
    };
  }, [enabled, schedule, stop]);

  const register = useCallback<ParallaxContextValue['register']>(
    (el, config) => {
      const normalized: RegisteredItem = {
        el,
        config: {
          mode: config.mode ?? 'element',
          speedX: config.speedX ?? 0,
          speedY: config.speedY ?? 0.08,
          maxPx: config.maxPx ?? 120,
        },
      };
      itemsRef.current = [...itemsRef.current, normalized];
      schedule();
      return () => {
        itemsRef.current = itemsRef.current.filter((x) => x !== normalized);
        if (itemsRef.current.length === 0) stop();
      };
    },
    [schedule, stop]
  );

  const value = useMemo<ParallaxContextValue>(() => ({ register, strength, enabled }), [enabled, register, strength]);

  return <ParallaxContext.Provider value={value}>{children}</ParallaxContext.Provider>;
}
