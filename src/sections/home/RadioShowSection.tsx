import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import LatestEpisode from '../../components/LatestEpisode';
import useInViewOnce from '../../hooks/useInViewOnce';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';
import TMHLogoWhite from '../../assets/TMH_LOGO_WHITE.png';

class RadioShowErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full border border-white/10 bg-white/[0.02] p-8">
          <a
            href="https://soundcloud.com/techmyhouse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-acid/80 px-6 py-3 font-display text-[12px] font-extrabold uppercase tracking-[0.16em] text-acid transition-colors hover:bg-acid hover:text-ink hover:shadow-[0_10px_40px_-12px_rgba(204,255,0,0.4)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[4px] focus-visible:outline-acid"
          >
            LISTEN ON SOUNDCLOUD ↗
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function RadioShowSection() {
  const { ref, inView } = useInViewOnce<HTMLElement>({ threshold: 0.2, rootMargin: '0px 0px -15% 0px' });
  const shouldReduceMotion = useReducedMotionPreference();
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const decorY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      ref={(el) => {
        ref.current = el;
        sectionRef.current = el;
      }}
      id="podcast"
      data-inview={inView ? 'true' : 'false'}
      className="py-20 sm:py-24 lg:py-28 tmh-reveal-scope"
    >
      <div className="relative">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 left-0 right-0 -z-10 overflow-hidden"
          style={!shouldReduceMotion ? { y: decorY } : undefined}
        >
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="select-none font-display text-[clamp(3.5rem,10vw,8rem)] font-extrabold uppercase tracking-[0.18em] text-white/[0.04]">
              {'RADIO·'.repeat(24)}
            </div>
            <div className="-mt-4 select-none font-display text-[clamp(3.5rem,10vw,8rem)] font-extrabold uppercase tracking-[0.18em] text-white/[0.04]">
              {'RADIO·'.repeat(24)}
            </div>
          </div>
        </motion.div>

        <div className="container-shell">
          <motion.div
            className="mb-12 max-w-6xl"
            style={{ '--tmh-delay': '0ms' } as React.CSSProperties}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-acid">RADIO</div>
            <div className="mt-3 flex items-center gap-2 sm:gap-3">
              <motion.div
                className="relative shrink-0"
                initial={shouldReduceMotion ? false : { scale: 0.85 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="absolute inset-0 -z-10 scale-110 rounded-full blur-3xl bg-acid/20" aria-hidden="true" />
                <img
                  src={TMHLogoWhite}
                  alt=""
                  aria-hidden="true"
                  className="h-24 w-24 sm:h-32 sm:w-32 origin-[55.44%_42.84%] drop-shadow-[0_0_24px_rgba(204,255,0,0.25)] motion-safe:animate-[spin_14s_linear_infinite] motion-reduce:animate-none"
                />
              </motion.div>
              <h2 className="display-title text-[clamp(2.8rem,8vw,6rem)] leading-[0.9] text-white">LATEST EPISODE</h2>
            </div>
            <p className="accent-script mt-4 -rotate-[1.5deg] text-[clamp(1.3rem,3vw,2.2rem)] text-acid">fresh underground sound</p>
            <div className="mt-5 font-mono text-[10px] uppercase tracking-widest text-smoke">UPDATED WEEKLY</div>
          </motion.div>

          <div className="tmh-reveal-item" style={{ '--tmh-delay': '120ms' } as React.CSSProperties}>
          <RadioShowErrorBoundary>
            <LatestEpisode showPrevious={false} showAllEpisodesCta={false} showGoToRadioCta goToRadioTo="/radio" />
          </RadioShowErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  );
}
