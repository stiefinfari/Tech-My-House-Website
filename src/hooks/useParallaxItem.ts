import { useContext, useEffect, useMemo, useRef } from 'react';
import { ParallaxContext, type ParallaxItemConfig } from '../components/parallax/parallaxContext';

export default function useParallaxItem<T extends HTMLElement>(config: ParallaxItemConfig) {
  const ctx = useContext(ParallaxContext);
  const ref = useRef<T | null>(null);

  const stableConfig = useMemo(
    () => ({
      mode: config.mode,
      speedX: config.speedX,
      speedY: config.speedY,
      maxPx: config.maxPx,
    }),
    [config.maxPx, config.mode, config.speedX, config.speedY]
  );

  useEffect(() => {
    if (!ctx?.enabled) return;
    const node = ref.current;
    if (!node) return;
    const unregister = ctx.register(node, stableConfig);
    return () => unregister();
  }, [ctx, stableConfig]);

  return ref;
}
