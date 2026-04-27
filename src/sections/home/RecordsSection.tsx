import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import useInViewOnce from '../../hooks/useInViewOnce';
import PillButton from '../../components/ui/PillButton';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';

export default function RecordsSection() {
  const [submitted, setSubmitted] = React.useState(false);
  const { ref, inView } = useInViewOnce<HTMLElement>({ threshold: 0.2, rootMargin: '0px 0px -15% 0px' });
  const shouldReduceMotion = useReducedMotionPreference();
  const { scrollY } = useScroll();
  const circleY = useTransform(scrollY, [0, 2000], [-200, 200]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      ref={ref}
      id="records"
      data-inview={inView ? 'true' : 'false'}
      className="cement-texture relative isolate overflow-hidden py-20 sm:py-24 lg:py-28 scroll-mt-28 tmh-reveal-scope"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-14 z-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(204,255,0,0.18),rgba(204,255,0,0.05),transparent_70%)] blur-3xl"
        style={!shouldReduceMotion ? { y: circleY } : undefined}
      />
      <div className="container-shell relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start lg:gap-16 xl:grid-cols-[1.55fr_1fr]">
          <div className="tmh-reveal-item" style={{ '--tmh-delay': '0ms' } as React.CSSProperties}>
            <div className="section-tag">Imprint</div>
            <h2 className="mt-4 text-white leading-[0.86]">
              <motion.span
                className="display-title block text-[clamp(4rem,13vw,12rem)]"
                initial={shouldReduceMotion ? false : { clipPath: 'inset(100% 0 0 0)' }}
                whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
              >
                TMH
              </motion.span>
              <motion.span
                className="accent-script block -mt-2 text-[clamp(3.3rem,12vw,11.5rem)] text-white"
                initial={shouldReduceMotion ? false : { clipPath: 'inset(100% 0 0 0)' }}
                whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
              >
                Records
              </motion.span>
            </h2>
            <p className="mt-5 max-w-xl text-sm text-white/72">
              Curated underground releases with a raw imprint identity. First drops are incoming.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="tape-strip">CATALOGUE 2026</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-smoke">LIMITED IMPRINT RELEASES</span>
            </div>
          </div>

          <div className="space-y-8 tmh-reveal-item" style={{ '--tmh-delay': '120ms' } as React.CSSProperties}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                { k: 'FORMAT', v: 'DIGITAL + SPECIAL CUTS' },
                { k: 'STATUS', v: 'COMING SOON' },
              ].map((item, idx) => (
                <motion.div
                  key={item.k}
                  className="border-l-2 border-acid/55 pl-4 tmh-reveal-item"
                  style={{ '--tmh-delay': `${200 + idx * 80}ms` } as React.CSSProperties}
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.08 }
                  }
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
          </div>
        </div>
      </div>
    </section>
  );
}
