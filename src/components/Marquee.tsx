import React from 'react';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';

type MarqueeProps = {
  text?: string;
  className?: string;
};

export default function Marquee({
  text = 'HOUSE • TECH HOUSE • TECHNO • UNRELEASED • RAW • EST. 2021 • ',
  className = 'bg-acid text-ink',
}: MarqueeProps) {
  const shouldReduceMotion = useReducedMotionPreference();
  const repeats = shouldReduceMotion ? 2 : 3;

  return (
    <div className={`w-full overflow-hidden py-3 sm:py-4 select-none flex ${className}`} aria-hidden="true">
      <div
        className={`flex whitespace-nowrap font-display text-2xl sm:text-4xl uppercase tracking-[0.18em] ${
          !shouldReduceMotion ? 'animate-marquee' : ''
        } font-extrabold`}
      >
        {Array.from({ length: repeats }, (_, i) => (
          <span key={i} className="mx-6">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
