import React from 'react';

type Props = { size?: number; className?: string; title?: string };

export default function TMHLogoLiquid({ size = 48, className, title = 'Tech My House' }: Props) {
  const id = React.useId();
  const triId = `${id}-tri`;
  const clipId = `${id}-clip`;
  const marbleId = `${id}-marble`;
  const arcTopId = `${id}-arc-top`;
  const arcBotId = `${id}-arc-bot`;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={title} className={className}>
      <defs>
        <path id={triId} d="M 26 38 L 94 38 L 60 98 Z" />
        <clipPath id={clipId}>
          <use href={`#${triId}`} />
        </clipPath>
        <filter id={marbleId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.035" numOctaves="3" seed="11" />
          <feColorMatrix values="0 0 0 0 0.92  0 0 0 0 0.92  0 0 0 0 0.92  0 0 0 1 0" />
          <feDisplacementMap in="SourceGraphic" scale="22" />
        </filter>
        <path id={arcTopId} d="M 10 60 A 50 50 0 0 1 110 60" fill="none" />
        <path id={arcBotId} d="M 110 60 A 50 50 0 0 1 10 60" fill="none" />
      </defs>
      <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
      <circle
        cx="60"
        cy="60"
        r="55"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.35"
        strokeDasharray="1 3"
      />
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="120" height="120" fill="#EAEAEA" filter={`url(#${marbleId})`} />
        <rect x="0" y="0" width="120" height="120" fill="rgba(10,10,10,0.28)" />
      </g>
      <use href={`#${triId}`} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <text
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        fontWeight="700"
        fontSize="6.2"
        letterSpacing="2.6"
        fill="currentColor"
        opacity="0.78"
      >
        <textPath href={`#${arcTopId}`} startOffset="50%" textAnchor="middle">
          TECH MY HOUSE
        </textPath>
      </text>
      <text
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        fontWeight="700"
        fontSize="5"
        letterSpacing="3.4"
        fill="currentColor"
        opacity="0.55"
      >
        <textPath href={`#${arcBotId}`} startOffset="50%" textAnchor="middle">
          EST · 2021 · FRIULI · IT
        </textPath>
      </text>
    </svg>
  );
}
