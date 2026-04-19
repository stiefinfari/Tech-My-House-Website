import React from 'react';

type Props = {
  size?: number;
  className?: string;
};

export default function TMHLogoLiquid({ size = 36, className }: Props) {
  const id = React.useId();
  const triId = `${id}-tri`;
  const triClipId = `${id}-clip`;
  const filterId = `${id}-marble`;
  const pathId = `${id}-path`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <path id={triId} d="M 10 18 L 86 18 L 48 88 Z" />
        <clipPath id={triClipId}>
          <use href={`#${triId}`} />
        </clipPath>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <path id={pathId} d="M 18 22 L 78 22 L 48 82 Z" />
      </defs>

      <g clipPath={`url(#${triClipId})`}>
        <rect x="0" y="0" width="96" height="96" fill="#CFCFCF" filter={`url(#${filterId})`} />
        <rect x="0" y="0" width="96" height="96" fill="rgba(10,10,10,0.22)" />
      </g>

      <use href={`#${triId}`} stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />

      <text
        fontFamily="'Syne', system-ui, sans-serif"
        fontSize="7"
        letterSpacing="2"
        fill="rgba(255,255,255,0.55)"
      >
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
          TECH MY HOUSE • TECH MY HOUSE • TECH MY HOUSE •
        </textPath>
      </text>
    </svg>
  );
}
