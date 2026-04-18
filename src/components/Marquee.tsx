import React from 'react';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';

export default function Marquee() {
  const shouldReduceMotion = useReducedMotionPreference();
  const text = 'HOUSE • TECH HOUSE • TECHNO • UNRELEASED • RAW • EST. 2021 • ';

  return (
    <div className="w-full overflow-hidden warning-stripes py-3 sm:py-4 select-none flex" aria-hidden="true">
      <div 
        className={`flex whitespace-nowrap font-display text-2xl sm:text-4xl font-extrabold tracking-widest stencil ${
          !shouldReduceMotion ? 'animate-marquee' : ''
        }`}
      >
        {/* Repeat enough times to fill ultra-wide screens */}
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
      </div>
      {!shouldReduceMotion && (
        <div className="flex whitespace-nowrap font-display text-2xl sm:text-4xl font-extrabold tracking-widest stencil animate-marquee" aria-hidden="true">
          <span className="mx-4">{text}</span>
          <span className="mx-4">{text}</span>
          <span className="mx-4">{text}</span>
          <span className="mx-4">{text}</span>
        </div>
      )}
    </div>
  );
}