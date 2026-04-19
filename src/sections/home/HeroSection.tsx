import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';
import TMHWallpaper from '../../components/TMHWallpaper';
import TopoBlob from '../../components/TopoBlob';

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotionPreference();

  return (
    <section id="hero" className="cement-texture relative isolate flex h-[100svh] min-h-[720px] w-full items-center overflow-hidden">
      {!shouldReduceMotion ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/hero-poster.jpg"
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-20 grayscale contrast-[1.05]"
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
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-20 grayscale contrast-[1.05]"
        />
      )}

      <div className="text-cement-light">
        <TMHWallpaper mode="mixed" opacity={0.12} />
      </div>

      <TopoBlob
        seed={132}
        size={400}
        className="pointer-events-none absolute bottom-[-120px] right-[-120px] z-0 text-acid/25"
      />

      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: 'easeOut' }}
        className="container-shell relative z-10 flex flex-col items-center pt-16 text-center"
      >
        <div className="tape-strip text-[11px] tracking-[0.18em]">EST. 2021 — FRIULI, IT</div>

        <h1 className="display-title mt-8 text-balance text-[clamp(3.4rem,10vw,9.2rem)] leading-[0.88] text-white">
          Tech My House
        </h1>

        <p className="mt-6 max-w-[38ch] font-sans text-[clamp(1.05rem,2.2vw,1.65rem)] font-semibold tracking-[-0.01em] text-white/90">
          Discover your underground mood
        </p>

        <ul className="mt-7 flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em] text-smoke sm:gap-3">
          {['House', 'Tech House', 'Techno', 'Hard Techno'].map((g) => (
            <li key={g} className="border border-white/10 bg-white/[0.03] px-3 py-2">
              {g}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex w-full max-w-lg flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
          <Link
            to="/#podcast"
            className="inline-flex items-center justify-center gap-2 rounded-none border border-acid bg-acid px-6 py-[14px] font-display text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:bg-acid-deep hover:border-acid-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
          >
            ▶ LATEST EPISODE
          </Link>
          <a
            href="mailto:info@techmyhouse.it"
            className="inline-flex items-center justify-center gap-2 rounded-none border border-white bg-transparent px-6 py-[14px] font-display text-xs uppercase tracking-[0.15em] text-white transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
          >
            BOOKING ↗
          </a>
        </div>
      </motion.div>
    </section>
  );
}
