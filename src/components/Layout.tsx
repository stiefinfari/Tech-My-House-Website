import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';
import TopNav from './TopNav';
import TMHLogoLiquid from './TMHLogoLiquid';
import CustomCursor from './CustomCursor';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';

export default function Layout({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotionPreference();
  const footerMask = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 240"><rect width="1200" height="240" fill="black"/><text x="600" y="175" text-anchor="middle" font-family="Syne, sans-serif" font-size="170" font-weight="800" letter-spacing="-10" fill="white">TECH MY HOUSE</text></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-ink font-sans text-white selection:bg-acid selection:text-ink">
      <div className="warehouse-backdrop" />
      {!reducedMotion ? <CustomCursor /> : null}

      <TopNav />

      <main className="relative z-10" id="main">
        {children}
      </main>

      <footer id="footer" className="relative z-20 border-t border-white/10 bg-ink/95">
        {!reducedMotion ? (
          <div className="hidden border-b border-white/10 bg-black/40 lg:block">
            <div className="relative h-28 overflow-hidden">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-80 brightness-[0.9] contrast-[1.05]"
                style={{
                  WebkitMaskImage: footerMask,
                  maskImage: footerMask,
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }}
              >
                <source src="/assets/hero-video.webm" type="video/webm" />
                <source src="/assets/hero-video.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        ) : null}

        <div className="container-shell py-12 sm:py-14">
          <div className="mb-8 border-b border-white/10 pb-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-acid">FOOTER NAVIGATION</div>
            <h2 className="mt-3 font-display text-[clamp(1.8rem,5vw,3rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.05em] text-white">
              STAY CONNECTED
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/70">
              Underground house, tech house, and techno culture. Follow releases, radio shows, artists, and event updates.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <section aria-labelledby="footer-brand" className="space-y-4">
              <div id="footer-brand" className="flex items-center gap-3">
                <TMHLogoLiquid size={42} className="h-[42px] w-[42px] shrink-0" />
                <span className="font-display text-[13px] font-extrabold uppercase tracking-[0.24em] text-white">TECH MY HOUSE</span>
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-smoke">
                FRIULI, ITALY
              </div>
              <a
                href="mailto:info@techmyhouse.it"
                className="inline-flex font-mono text-[11px] uppercase tracking-[0.24em] text-white/85 transition-colors hover:text-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              >
                info@techmyhouse.it
              </a>
            </section>

            <nav aria-label="Footer primary links" className="space-y-4">
              <div className="font-display text-[11px] uppercase tracking-[0.18em] text-acid">Explore</div>
              <div className="flex flex-col gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-smoke">
                <Link to="/#records" className="transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid">Records</Link>
                <Link to="/podcast" className="transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid">Radio</Link>
                <Link to="/#artists" className="transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid">Artists</Link>
                <Link to="/contact" className="transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid">Contact</Link>
              </div>
            </nav>

            <section aria-labelledby="footer-social" className="space-y-4">
              <h3 id="footer-social" className="font-display text-[11px] uppercase tracking-[0.18em] text-acid">Community</h3>
              <SocialLinks />
            </section>

            <section aria-labelledby="footer-legal" className="space-y-4">
              <h3 id="footer-legal" className="font-display text-[11px] uppercase tracking-[0.18em] text-acid">Legal</h3>
              <div className="flex flex-col gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-smoke">
                <span>Privacy</span>
                <span>Cookies</span>
                <span>All rights reserved</span>
              </div>
            </section>
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/35">
          <div className="container-shell flex flex-col gap-4 py-6 pb-[calc(1.5rem+112px+env(safe-area-inset-bottom))] font-mono text-[11px] uppercase tracking-[0.24em] text-smoke sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} TECH MY HOUSE</span>
            <a
              href="https://www.gaiacirclelab.com"
              target="_blank"
              rel="noopener noreferrer external"
              className="inline-flex items-center gap-2 text-white/85 transition-colors hover:text-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              aria-label="Gaia Circle Lab (opens in a new tab)"
              title="Gaia Circle Lab"
            >
              <img
                src="/assets/gcl-logo-text.png"
                alt="Gaia Circle Lab"
                className="h-[22px] w-auto opacity-90"
                loading="lazy"
              />
              gaia circle lab
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
