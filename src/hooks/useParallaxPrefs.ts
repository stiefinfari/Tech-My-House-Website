import { useEffect, useMemo, useState } from 'react';
import useReducedMotionPreference from './useReducedMotionPreference';

type UseParallaxPrefsOptions = {
  desktopQuery?: string;
  mobileStrength?: number;
};

export default function useParallaxPrefs(options: UseParallaxPrefsOptions = {}) {
  const reducedMotion = useReducedMotionPreference();
  const desktopQuery = options.desktopQuery ?? '(hover: hover) and (pointer: fine) and (min-width: 900px)';
  const mobileStrength = options.mobileStrength ?? 0.25;

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.(desktopQuery)?.matches ?? false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia?.(desktopQuery);
    if (!mql) return;

    const onChange = () => setIsDesktop(mql.matches);
    onChange();
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, [desktopQuery]);

  const strength = useMemo(() => {
    if (reducedMotion) return 0;
    return isDesktop ? 1 : mobileStrength;
  }, [isDesktop, mobileStrength, reducedMotion]);

  return { enabled: strength > 0, strength, isDesktop, reducedMotion };
}
