import React from 'react';
import { Play } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';
import PillButton from '../../components/ui/PillButton';

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotionPreference();

  const { scrollY } = useScroll();
  const videoY = useTransform(scrollY, [0, 800], [0, -200]);
  const textY = useTransform(scrollY, [0, 600], [0, -60]);

  const titleWords = ['TECH', 'MY', 'HOUSE'] as const;

  return (
    <section id="hero" className="relative isolate flex h-[100svh] min-h-[640px] w-full items-center overflow-hidden bg-ink">
      <motion.div className="tmh-parallax-layer absolute inset-0 z-0" style={!shouldReduceMotion ? { y: videoY } : undefined}>
        {!shouldReduceMotion ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/assets/hero-poster.jpg"
            preload="metadata"
            aria-hidden="true"
            className="tmh-hero-media absolute inset-[-8%] h-[116%] w-[116%] object-cover opacity-50 brightness-[0.85] contrast-[1.08]"
          >
            <source src="/assets/hero-video.webm" type="video/webm" />
            <source src="/assets/hero-video.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/assets/hero-poster.jpg"
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover opacity-50 brightness-[0.85] contrast-[1.08]"
          />
        )}
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_30%_50%,transparent_0%,rgba(10,10,10,0.55)_60%,rgba(10,10,10,0.95)_100%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-b from-transparent via-transparent to-ink" />
      </div>
      <motion.div className="relative z-40 w-full" style={!shouldReduceMotion ? { y: textY } : undefined}>
        <div className="mx-auto flex max-w-5xl flex-col items-center px-8 pt-32 text-center lg:px-16">
          <div className="inline-flex -rotate-[2deg] items-center bg-acid px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink">
            EST. 2021 — FRIULI · IT
          </div>

          <h1
            className="display-title mt-8 flex flex-nowrap items-baseline justify-center gap-[0.14em] whitespace-nowrap text-[clamp(1.5rem,7.2vw,5.8rem)] text-white"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
          >
            {titleWords.map((word, idx) => (
              <motion.span
                key={word}
                className="tmh-hero-word"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
                animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.12 }}
              >
                <span className={idx === 0 ? 'hero-glow-word' : `hero-glow-word hero-glow-word--delay-${idx}`}>{word}</span>
              </motion.span>
            ))}
          </h1>

          <p className="accent-script mt-6 -rotate-[1.5deg] text-[clamp(1.8rem,4vw,3rem)] text-acid">
            Where music unites!
          </p>

          <div className="mt-6 font-mono text-[10px] uppercase tracking-widest text-smoke">
            HOUSE · TECH HOUSE · TECHNO · HARD TECHNO
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <PillButton to="/#podcast" variant="primary" icon={<Play size={18} />} ariaLabel="Latest episode">
              LATEST EPISODE
            </PillButton>
            <PillButton to="/contact" variant="ghost" ariaLabel="Contact">
              CONTACT ↗
            </PillButton>
          </div>
        </div>

      </motion.div>
    </section>
  );
}
