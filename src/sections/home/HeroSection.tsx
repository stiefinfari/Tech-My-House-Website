import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
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
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-55 brightness-[0.85] contrast-[1.08] saturate-[1.1]"
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
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-55 brightness-[0.85] contrast-[1.08] saturate-[1.1]"
        />
      )}

      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,_rgba(10,10,10,0.25)_0%,_rgba(10,10,10,0.75)_70%,_rgba(10,10,10,0.92)_100%)]" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-ink/30 to-ink" />

      <div className="absolute inset-0 z-[3]">
        <TMHWallpaper mode="mixed" color="#CCFF00" opacity={0.06} />
      </div>

      <TopoBlob
        seed={132}
        size={520}
        className="pointer-events-none absolute bottom-[-60px] right-[-80px] z-[4] text-acid/30 opacity-35 blur-[0.3px]"
      />

      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: 'easeOut' }}
        className="container-shell !max-w-5xl relative z-[5] flex w-full flex-col items-center pt-32 text-center lg:items-start lg:pt-40 lg:text-left"
      >
        <div className="tape-strip text-[11px] tracking-[0.18em]" style={{ transform: 'rotate(-2deg)' }}>
          EST. 2021 — FRIULI · IT
        </div>

        <h1
          className="display-title mt-8 text-balance text-[clamp(3.4rem,10vw,9.2rem)] leading-[0.88] text-white"
          style={{ textShadow: '0 0 2px rgba(204,255,0,0.25)' }}
        >
          <span className="relative before:absolute before:inset-x-[-8%] before:-z-10 before:h-full before:bg-gradient-to-r before:from-transparent before:via-ink/30 before:to-transparent before:blur-2xl">
            Tech My House
          </span>
        </h1>

        <p className="mt-6 max-w-[38ch] -rotate-1 font-sans text-[clamp(1.2rem,2.8vw,2rem)] font-semibold tracking-[-0.01em] text-acid">
          Discover your underground mood
        </p>

        <div className="warning-stripes mt-7 inline-flex px-3 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.26em] text-smoke">
          HOUSE · TECH HOUSE · TECHNO · HARD TECHNO
        </div>

        <div className="mt-10 flex w-full max-w-lg flex-col gap-4 sm:flex-row sm:items-center lg:justify-start">
          <Link
            to="/#podcast"
            aria-label="Open latest episode"
            className="inline-flex items-center justify-center gap-[10px] rounded-none border border-acid bg-acid px-6 py-[14px] font-display text-xs uppercase tracking-[0.15em] text-ink shadow-[0_10px_40px_-12px_rgba(204,255,0,0.45)] transition-colors hover:border-acid-deep hover:bg-acid-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
          >
            <Play size={16} aria-hidden="true" />
            LATEST EPISODE
          </Link>
          <a
            href="mailto:info@techmyhouse.it"
            aria-label="Contact booking"
            className="inline-flex items-center justify-center gap-2 rounded-none border border-white bg-transparent px-6 py-[14px] font-display text-xs uppercase tracking-[0.15em] text-white transition-colors hover:border-acid hover:text-acid hover:underline hover:decoration-acid hover:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
          >
            BOOKING ↗
          </a>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-[5]">
        <div className="container-shell flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-smoke">
          <span className={`inline-flex items-center gap-2 ${shouldReduceMotion ? '' : 'animate-bounce'}`} style={shouldReduceMotion ? undefined : { animationDuration: '2.2s' }}>
            ↓ SCROLL
          </span>
          <span aria-hidden="true" />
          <span className="inline-flex items-center gap-2">
            ON AIR · EP. 132
            <span className={`h-2 w-2 rounded-full bg-acid ${shouldReduceMotion ? '' : 'animate-pulse'}`} style={shouldReduceMotion ? undefined : { animationDuration: '2.4s' }} />
          </span>
        </div>
      </div>
    </section>
  );
}
