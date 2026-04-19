import React, { useRef } from 'react';
import { Play } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';
import PillButton from '../../components/ui/PillButton';

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotionPreference();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative isolate flex h-[100svh] min-h-[640px] w-full items-center overflow-hidden bg-ink"
    >
      {!shouldReduceMotion ? (
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/hero-poster.jpg"
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-50 brightness-[0.85] contrast-[1.08]"
          style={{ y: videoY }}
        >
          <source src="/assets/hero-video.webm" type="video/webm" />
          <source src="/assets/hero-video.mp4" type="video/mp4" />
        </motion.video>
      ) : (
        <motion.img
          src="/assets/hero-poster.jpg"
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-50 brightness-[0.85] contrast-[1.08]"
          style={{ y: 0 }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_30%_50%,transparent_0%,rgba(10,10,10,0.55)_60%,rgba(10,10,10,0.95)_100%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-b from-transparent via-transparent to-ink" />
      </div>
      <div className="relative z-40 w-full">
        <div className="max-w-5xl pl-8 pr-8 pt-32 lg:pl-16 lg:pr-16">
          <div className="inline-flex -rotate-[2deg] items-center bg-acid px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink">
            EST. 2021 — FRIULI · IT
          </div>

          <h1
            className="display-title mt-8 text-[clamp(3.5rem,11vw,9rem)] text-white"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
          >
            <motion.span
              className="hero-glow-word"
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut', delay: 0 }}
            >
              TECH
            </motion.span>
            <br />
            <motion.span
              className="hero-glow-word hero-glow-word--delay-1"
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut', delay: 0.12 }}
            >
              MY
            </motion.span>
            <br />
            <motion.span
              className="hero-glow-word hero-glow-word--delay-2"
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut', delay: 0.24 }}
            >
              HOUSE
            </motion.span>
          </h1>

          <p className="accent-script mt-6 -rotate-[1.5deg] text-[clamp(1.8rem,4vw,3rem)] text-acid">
            Discover your underground mood.
          </p>

          <div className="mt-6 font-mono text-[10px] uppercase tracking-widest text-smoke">
            HOUSE · TECH HOUSE · TECHNO · HARD TECHNO
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <PillButton to="/#podcast" variant="primary" icon={<Play size={18} />} ariaLabel="Latest episode">
              LATEST EPISODE
            </PillButton>
            <PillButton href="mailto:info@techmyhouse.it" variant="ghost" ariaLabel="Booking">
              BOOKING ↗
            </PillButton>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 px-8 lg:px-16">
          <div className="flex items-center justify-end">
            <div className="font-mono text-[10px] uppercase tracking-widest text-smoke motion-reduce:animate-none animate-bounce">↓ SCROLL</div>
          </div>
        </div>
      </div>
    </section>
  );
}
