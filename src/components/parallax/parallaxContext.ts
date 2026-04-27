import { createContext } from 'react';

export type ParallaxItemConfig = {
  mode?: 'element' | 'scroll';
  speedX?: number;
  speedY?: number;
  maxPx?: number;
};

export type ParallaxContextValue = {
  register: (el: HTMLElement, config: ParallaxItemConfig) => () => void;
  strength: number;
  enabled: boolean;
};

export const ParallaxContext = createContext<ParallaxContextValue | null>(null);
