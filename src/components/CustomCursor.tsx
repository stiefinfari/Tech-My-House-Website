import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';

type Point = { x: number; y: number };

export default function CustomCursor() {
  const shouldReduceMotion = useReducedMotionPreference();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [dot, setDot] = useState<Point>({ x: -100, y: -100 });
  const [ring, setRing] = useState<Point>({ x: -100, y: -100 });
  const ringTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const media = window.matchMedia('(pointer: fine)');
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      const p = { x: e.clientX, y: e.clientY };
      setVisible(true);
      setDot(p);
      if (ringTimeoutRef.current != null) window.clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = window.setTimeout(() => setRing(p), 120);
    };

    const onLeave = () => setVisible(false);

    const onOver = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      if (!el) return;
      const interactive = el.closest('a,button,[role="button"],input,textarea,select');
      setActive(Boolean(interactive));
    };

    const onOut = (e: PointerEvent) => {
      const el = e.relatedTarget instanceof Element ? e.relatedTarget : null;
      if (!el) {
        setActive(false);
        return;
      }
      const interactive = el.closest('a,button,[role="button"],input,textarea,select');
      setActive(Boolean(interactive));
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerout', onOut, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      if (ringTimeoutRef.current != null) window.clearTimeout(ringTimeoutRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  const dotSize = 8;
  const ringSize = active ? 56 : 32;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[200] rounded-full bg-acid"
        style={{ width: dotSize, height: dotSize }}
        animate={{ x: dot.x - dotSize / 2, y: dot.y - dotSize / 2, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0 }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[199] rounded-full border border-acid/60"
        animate={{
          x: ring.x - ringSize / 2,
          y: ring.y - ringSize / 2,
          width: ringSize,
          height: ringSize,
          opacity: visible ? 1 : 0,
          backgroundColor: active ? 'rgba(204,255,0,0.15)' : 'rgba(204,255,0,0)',
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.2 }}
      />
    </>
  );
}

