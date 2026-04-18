import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section id="hero" className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden">
      <video
        autoPlay
        loop
        muted
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover brightness-[0.72] contrast-[1.12] saturate-[0.9]"
      >
        <source src="/assets/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-dark/70 to-black/90" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(204,255,0,0.10),transparent_52%)]" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="container-shell relative z-10 flex flex-col items-center text-center"
      >
        <h1 className="mx-auto max-w-[92vw] font-display whitespace-nowrap text-[clamp(1.85rem,4.8vw,4.8rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.08em] text-white">
          Tech My House
        </h1>
        <p className="accent-script mt-6 animate-glow-pulse text-[clamp(1.05rem,3.6vw,2.1rem)] text-neon text-glow">
          Where music unites
        </p>
      </motion.div>
    </section>
  );
}
