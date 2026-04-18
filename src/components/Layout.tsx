import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';
import TopNav from './TopNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [overlaysReady, setOverlaysReady] = useState(false);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => setOverlaysReady(true));
    } else {
      setTimeout(() => setOverlaysReady(true), 200);
    }
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-dark text-white font-sans overflow-x-hidden selection:bg-neon selection:text-black">
      <div className="warehouse-backdrop" />
      {overlaysReady && (
        <>
          <div className="warehouse-scanlines" />
          <div className="warehouse-vignette" />
          <div className="noise-bg pointer-events-none" />
        </>
      )}

      <TopNav />

      <main className="relative z-10 pt-[100px]" id="main">
        {children}
      </main>

      <footer id="footer" className="relative z-20 overflow-hidden bg-dark pt-16 sm:pt-20">
        <div className="container-shell flex flex-col gap-12 md:flex-row md:items-start md:justify-between pb-12">
          <div className="max-w-xl space-y-6">
            <h2 className="font-display text-[clamp(2rem,6vw,4.8rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.08em] text-white">
              Tech My House
            </h2>
            <p className="accent-script text-lg uppercase tracking-[0.12em] text-acid text-glow">
              Where music unites
            </p>
            <div>
              <SocialLinks />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-24">
            <div className="flex flex-col gap-4 text-sm uppercase tracking-[0.2em] text-smoke">
              <span className="text-xs text-acid font-bold">Sitemap</span>
              <Link to="/#records" className="hover:text-acid transition-colors">Records</Link>
              <Link to="/podcast" className="hover:text-acid transition-colors">Radio</Link>
              <Link to="/#artists" className="hover:text-acid transition-colors">Artists</Link>
              <Link to="/#events" className="hover:text-acid transition-colors">Events</Link>
            </div>
            
            <div className="flex flex-col gap-4 text-sm uppercase tracking-[0.2em] text-smoke">
              <span className="text-xs text-acid font-bold">Booking & Demo</span>
              <a href="mailto:info@techmyhouse.it" className="text-base lowercase tracking-normal text-white transition-colors hover:text-acid sm:text-xl">
                info@techmyhouse.it
              </a>
            </div>
          </div>
        </div>

        <div className="warning-stripes h-2 w-full opacity-80" />

        <div className="bg-ink-raise">
          <div className="container-shell flex flex-col items-start justify-between gap-3 py-6 text-xs uppercase tracking-[0.2em] text-smoke sm:flex-row sm:items-center">
            <p>© 2026 TMH</p>
            <a href="https://www.gaiacirclelab.com" target="_blank" rel="noopener noreferrer" className="hover:text-acid transition-colors outline-none focus-visible:text-acid focus-visible:underline">
              Made by Gaia Circle Lab
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
