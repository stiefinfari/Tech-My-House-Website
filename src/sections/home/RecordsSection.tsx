import React from 'react';
import { motion } from 'framer-motion';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';
import PillButton from '../../components/ui/PillButton';

export default function RecordsSection() {
  const [submitted, setSubmitted] = React.useState(false);
  const reducedMotion = useReducedMotionPreference();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <motion.section
      id="records"
      className="cement-texture relative isolate overflow-hidden py-20 sm:py-24 lg:py-28 scroll-mt-28"
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container-shell relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.55, ease: 'easeOut' }}
          >
            <div className="section-tag">Imprint</div>
            <h2 className="mt-4 text-white leading-[0.86]">
              <span className="display-title block text-[clamp(4.5rem,16vw,13rem)]">TMH</span>
              <span className="accent-script block -mt-2 text-[clamp(3.6rem,14vw,12.5rem)] text-white">Records</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm text-white/72">
              Curated underground releases with a raw imprint identity. First drops are incoming.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="tape-strip">CATALOGUE 2026</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-smoke">LIMITED IMPRINT RELEASES</span>
            </div>
          </motion.div>

          <motion.div
            className="space-y-8"
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut', delay: 0.08 }}
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                { k: 'FORMAT', v: 'DIGITAL + SPECIAL CUTS' },
                { k: 'STATUS', v: 'COMING SOON' },
              ].map((item, idx) => (
                <motion.div
                  key={item.k}
                  className="border-l-2 border-acid/55 pl-4"
                  initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={reducedMotion ? { duration: 0 } : { duration: 0.45, ease: 'easeOut', delay: 0.14 + idx * 0.08 }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest text-acid">{item.k}</div>
                  <div className="mt-2 font-display text-[17px] font-extrabold uppercase tracking-[0.1em] text-white/92">{item.v}</div>
                </motion.div>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              aria-label="Notify me when TMH Records launches"
              className="flex w-full flex-col gap-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="your@email.here"
                  className="h-12 w-full rounded-none border-2 border-acid bg-ink px-4 font-sans text-sm text-white placeholder:text-smoke/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                />
                <PillButton type="submit" variant="primary" className="h-12 shrink-0 px-8 py-0">
                  NOTIFY
                </PillButton>
              </div>
              {submitted ? (
                <p className="pt-1 font-display text-[11px] uppercase tracking-[0.18em] text-acid">Thanks — you&apos;re on the list</p>
              ) : null}
            </form>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
