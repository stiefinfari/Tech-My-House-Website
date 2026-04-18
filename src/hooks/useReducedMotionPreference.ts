import { useMemo } from 'react';

export default function useReducedMotionPreference() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  }, []);
}

