import { useEffect, useRef, useState } from 'react';
import useReducedMotionPreference from './useReducedMotionPreference';

type UseInViewOnceOptions = {
  rootMargin?: string;
  threshold?: number | number[];
};

export default function useInViewOnce<T extends HTMLElement>(options: UseInViewOnceOptions = {}) {
  const shouldReduceMotion = useReducedMotionPreference();
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setInView(true);
      return;
    }
    if (inView) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: options.rootMargin ?? '0px 0px -10% 0px',
        threshold: options.threshold ?? 0.18,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, options.rootMargin, options.threshold, shouldReduceMotion]);

  return { ref, inView };
}

