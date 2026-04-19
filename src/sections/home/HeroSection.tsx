import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotionPreference();

  return (
    <section id="hero" className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden grain-heavy">
      <h1 className="sr-only">Tech My House - Where music unites</h1>
      
      {!shouldReduceMotion ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/hero-poster.jpg"
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.72] contrast-[1.12] saturate-[0.9]"
        >
          <source src="/assets/hero-video.webm" type="video/webm" />
          <source src="/assets/hero-video.mp4" type="video/mp4" />
        </video>
      ) : (
        <img 
          src="/assets/hero-poster.jpg" 
          alt="Warehouse flyer background" 
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.72] contrast-[1.12] saturate-[0.9]"
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-dark/70 to-black/90" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(204,255,0,0.10),transparent_52%)]" />

      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: 'easeOut' }}
        className="container-shell relative z-10 flex flex-col items-center text-center mt-16"
      >
        <div 
          aria-hidden="true" 
          className="mx-auto max-w-[92vw] font-display text-[clamp(3.5rem,10vw,8rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.07em] text-bone stencil"
        >
          Tech My House
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[38%] h-[30vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 72%)' }}
        />
        <p className="accent-script mt-6 text-[clamp(1.2rem,4vw,2.5rem)] text-acid text-glow" aria-hidden="true">
          where music unites
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center justify-center w-full max-w-md mx-auto">
          <Link
            to="/podcast"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-none border border-acid bg-acid px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink transition-all hover:bg-acid-deep hover:border-acid-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
          >
            ▶ Play Latest Show
          </Link>
          <a
            href="mailto:info@techmyhouse.it"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-none border border-white/20 bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white/5 hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
          >
            Booking & Demo ↗
          </a>
        </div>
      </motion.div>
    </section>
  );
}
