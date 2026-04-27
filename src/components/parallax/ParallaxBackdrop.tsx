import React from 'react';
import useParallaxItem from '../../hooks/useParallaxItem';

export default function ParallaxBackdrop() {
  const layerA = useParallaxItem<HTMLDivElement>({ mode: 'scroll', speedY: 0.03, maxPx: 90 });
  const layerB = useParallaxItem<HTMLDivElement>({ mode: 'scroll', speedY: 0.05, maxPx: 140 });
  const layerC = useParallaxItem<HTMLDivElement>({ mode: 'scroll', speedY: 0.07, maxPx: 180 });

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        ref={layerA}
        className="tmh-parallax-layer tmh-ambient-layer tmh-ambient-layer--a absolute left-[-12%] top-[8%] h-[44vh] w-[58vw] rounded-full"
      />
      <div
        ref={layerB}
        className="tmh-parallax-layer tmh-ambient-layer tmh-ambient-layer--b absolute right-[-18%] top-[36%] h-[56vh] w-[70vw] rounded-full"
      />
      <div className="absolute bottom-[-12%] left-1/2 h-[52vh] w-[88vw] -translate-x-1/2">
        <div ref={layerC} className="tmh-parallax-layer tmh-ambient-layer tmh-ambient-layer--c h-full w-full rounded-full" />
      </div>
      <div className="grain-light absolute inset-0 opacity-25" />
    </div>
  );
}
