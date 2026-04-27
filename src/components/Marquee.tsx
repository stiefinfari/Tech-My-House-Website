import React from 'react';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';

type MarqueeProps = {
  text?: string;
  className?: string;
  textClassName?: string;
  reverse?: boolean;
  durationSeconds?: number;
  size?: 'lg' | 'sm';
  density?: 'normal' | 'tight';
};

export default function Marquee({
  text = 'HOUSE • TECH HOUSE • TECHNO • UNRELEASED • RAW • EST. 2021 • ',
  className = 'bg-acid text-ink',
  textClassName,
  reverse = false,
  durationSeconds,
  size = 'lg',
  density = 'normal',
}: MarqueeProps) {
  const shouldReduceMotion = useReducedMotionPreference();
  const textClass =
    size === 'sm'
      ? 'text-lg sm:text-2xl font-extrabold uppercase tracking-[0.18em]'
      : 'text-2xl sm:text-4xl font-extrabold uppercase tracking-[0.18em]';

  const trackAnimation = shouldReduceMotion ? '' : reverse ? 'animate-marquee-reverse' : 'animate-marquee';

  return (
    <div className={`flex w-full overflow-hidden select-none ${density === 'tight' ? 'py-2' : 'py-3'} ${className}`} aria-hidden="true">
      <div
        className={`flex shrink-0 ${trackAnimation}`}
        style={!shouldReduceMotion && durationSeconds ? { animationDuration: `${durationSeconds}s` } : undefined}
      >
        <span className={`shrink-0 w-max px-6 font-display ${textClass} ${textClassName ?? ''}`}>
          {text}
        </span>
        <span
          className={`shrink-0 w-max px-6 font-display ${textClass} ${textClassName ?? ''}`}
          aria-hidden="true"
        >
          {text}
        </span>
      </div>
    </div>
  );
}
