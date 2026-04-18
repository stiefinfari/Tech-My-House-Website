import React from 'react';
import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';
import { TMH_LOGO_OBJECT_POSITION, TMH_LOGO_SRC } from '../branding/logo';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen bg-dark text-white font-sans overflow-x-hidden selection:bg-neon selection:text-black">
      <div className="warehouse-backdrop" />
      <div className="warehouse-scanlines" />
      <div className="warehouse-vignette" />
      <div className="noise-bg pointer-events-none" />

      <header className="fixed top-0 left-0 z-50 p-4 sm:p-6 lg:p-10">
        <Link
          to="/"
          className="textlink font-display text-xs font-extrabold uppercase tracking-[0.22em]"
          aria-label="Home"
        >
          <span className="whitespace-nowrap">TMH</span>
          <img
            src={TMH_LOGO_SRC}
            alt="Tech My House"
            className="h-6 w-6 object-contain opacity-90 translate-y-[1px]"
            style={{ objectPosition: TMH_LOGO_OBJECT_POSITION }}
          />
        </Link>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-20 overflow-hidden bg-dark py-16 sm:py-20">
        <div className="container-shell flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-6">
            <h2 className="font-display text-[clamp(2rem,6vw,4.8rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.08em]">
              Tech My House
            </h2>
            <p className="accent-script animate-glow-pulse text-lg uppercase tracking-[0.12em] text-neon text-glow">
              Where music unites
            </p>
            <div>
              <SocialLinks />
            </div>
          </div>
          <div className="flex flex-col gap-5 text-sm uppercase tracking-[0.2em] text-white/70">
            <span className="text-xs text-neon">Booking & Demo</span>
            <a href="mailto:info@techmyhouse.it" data-glow className="w-fit text-base lowercase tracking-normal text-white transition-colors hover:text-neon sm:text-xl">
              info@techmyhouse.it
            </a>
          </div>
        </div>
        <div className="container-shell mt-12 flex flex-col items-start justify-between gap-3 pt-6 text-xs uppercase tracking-[0.2em] text-white/35 sm:flex-row sm:items-center">
          <p>© 2026 TECH MY HOUSE</p>
          <p>HOUSE • TECH HOUSE • TECHNO</p>
        </div>
      </footer>
    </div>
  );
}
