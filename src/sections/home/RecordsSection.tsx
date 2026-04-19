import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
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
      className="cement-texture relative isolate overflow-hidden py-20 sm:py-24 lg:py-28"
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container-shell relative z-10">
        <motion.div
          className="records-panel group grid grid-cols-1 gap-12 border border-white/10 bg-black/20 p-8 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-14"
          whileHover={reducedMotion ? undefined : { rotate: -1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
        >
          <div className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="absolute inset-0 bg-acid/15" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid text-ink shadow-[0_18px_60px_rgba(0,0,0,0.55)] ring-1 ring-black/20 p-4">
              <Play size={22} className="ml-0.5" />
            </div>
          </div>
          <div>
            <div className="section-tag">Imprint</div>
            <h2 className="mt-4 text-white leading-[0.86]">
              <span className="display-title block text-[clamp(4.5rem,16vw,13rem)]">TMH</span>
              <span className="accent-script block -mt-2 text-[clamp(3.6rem,14vw,12.5rem)] text-white">Records</span>
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="tape-strip">CATALOGUE 2026</span>
              <span className="accent-script -rotate-[2deg] text-[clamp(1.2rem,3vw,1.8rem)] text-acid">
                first drops incoming
              </span>
            </div>
          </div>

          <div className="space-y-4">
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
                <PillButton
                  type="submit"
                  variant="primary"
                  className="h-12 shrink-0 px-8 py-0"
                >
                  NOTIFY
                </PillButton>
              </div>
              {submitted ? (
                <p className="pt-1 font-display text-[11px] uppercase tracking-[0.18em] text-acid">Thanks — you&apos;re on the list</p>
              ) : null}
            </form>
            <div className="font-mono text-[10px] uppercase tracking-widest text-smoke">
              LIMITED IMPRINT RELEASES
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
