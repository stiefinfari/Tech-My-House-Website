import React from 'react';

export default function AmbientBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="tmh-ambient-layer tmh-ambient-layer--a absolute left-[-12%] top-[6%] h-[44vh] w-[58vw] rounded-full" />
      <div className="tmh-ambient-layer tmh-ambient-layer--b absolute right-[-18%] top-[36%] h-[56vh] w-[70vw] rounded-full" />
      <div className="tmh-ambient-layer tmh-ambient-layer--c absolute bottom-[-12%] left-1/2 h-[52vh] w-[88vw] -translate-x-1/2 rounded-full" />
      <div className="grain-light absolute inset-0 opacity-25" />
    </div>
  );
}

