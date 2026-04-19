import React from 'react';

type Props = { size?: number; className?: string; title?: string };

export default function TMHLogoLiquid({ size = 48, className, title = 'Tech My House' }: Props) {
  return (
    <img
      src="/assets/tmh-logo-white.png"
      alt={title}
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', objectFit: 'contain', objectPosition: '50% 50%' }}
      loading="lazy"
      decoding="async"
    />
  );
}
