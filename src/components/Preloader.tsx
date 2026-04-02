import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type PreloaderProps = {
  visible: boolean;
  durationMs?: number;
  onDone: () => void;
};

export default function Preloader({ visible, durationMs = 2400, onDone }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  }, []);

  useEffect(() => {
    if (!visible) return;

    setProgress(0);
    setExiting(false);

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setExiting(true);
        window.setTimeout(() => onDone(), reducedMotion ? 0 : 260);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs, onDone, reducedMotion, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.26, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] bg-dark flex items-center justify-center"
        >
          <div className="w-full max-w-md px-6 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: reducedMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={
                  reducedMotion
                    ? undefined
                    : {
                        boxShadow: [
                          '0 0 0 1px rgba(204,255,0,0.10), 0 0 24px rgba(204,255,0,0.10)',
                          '0 0 0 1px rgba(204,255,0,0.22), 0 0 34px rgba(204,255,0,0.20)',
                          '0 0 0 1px rgba(204,255,0,0.10), 0 0 24px rgba(204,255,0,0.10)',
                        ],
                      }
                }
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.img
                src="/assets/tmh-logo-white.png"
                alt="Tech My House"
                className="w-40 h-40 object-contain"
                animate={reducedMotion ? undefined : { rotate: [0, 0.8, 0, -0.6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute -inset-10 rounded-full bg-neon/5 blur-[60px] pointer-events-none" />
            </motion.div>

            <div className="mt-10 w-full">
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-neon"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.12, ease: 'linear' }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between font-sans text-[11px] uppercase tracking-[0.28em] text-white/50">
                <span>Loading</span>
                <span className="text-neon/80">{progress}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

