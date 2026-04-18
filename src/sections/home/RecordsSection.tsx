import React from 'react';
import { motion } from 'framer-motion';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';

export default function RecordsSection() {
  const reducedMotion = useReducedMotionPreference();

  return (
    <section id="records" className="py-20 sm:py-24 lg:py-28">
      <div className="container-shell">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12">
          <div className="section-tag">in the works</div>
          <h2 className="section-title">TMH Records</h2>
        </div>

        <div className="surface-panel relative overflow-hidden rounded-3xl px-6 py-14 text-center backdrop-blur-sm sm:px-10 sm:py-20">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(55% 60% at 50% 20%, rgba(204, 255, 0, 0.16), rgba(0, 0, 0, 0) 62%)',
            }}
            animate={reducedMotion ? undefined : { opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-24 blur-[60px]"
            style={{
              background:
                'radial-gradient(45% 45% at 50% 50%, rgba(204, 255, 0, 0.14), rgba(0, 0, 0, 0) 70%)',
            }}
            animate={reducedMotion ? undefined : { opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55" />

          <div className="relative mx-auto flex max-w-2xl flex-col items-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Coming soon</p>
            <h3 className="mt-6 font-display text-[clamp(2.4rem,7vw,5.4rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.07em]">
              TMH Records
            </h3>
            <p className="mt-5 text-balance text-sm uppercase tracking-[0.22em] text-white/72 sm:text-base">
              First releases are in the works.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
