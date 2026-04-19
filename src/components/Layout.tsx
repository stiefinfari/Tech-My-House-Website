import React from 'react';
import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';
import TopNav from './TopNav';
import TMHWallpaper from './TMHWallpaper';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-ink font-sans text-white selection:bg-acid selection:text-ink">
      <div className="warehouse-backdrop" />

      <TopNav />

      <main className="relative z-10 pt-[100px]" id="main">
        {children}
      </main>

      <footer id="footer" className="cement-texture relative isolate z-20 overflow-hidden pt-20 sm:pt-24">
        <div className="text-cement-light">
          <TMHWallpaper mode="mixed" opacity={0.15} />
        </div>

        <div className="container-shell relative z-10 pb-12 sm:pb-16">
          <h2 className="display-title text-[clamp(3.5rem,10vw,9rem)] leading-[0.86] text-white">
            WHERE MUSIC
            <br />
            UNITES
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="font-display text-[11px] uppercase tracking-[0.18em] text-acid">Sitemap</div>
              <div className="flex flex-col gap-3 font-mono text-[11px] uppercase tracking-[0.26em] text-smoke">
                <Link to="/#records" className="transition-colors hover:text-white">Records</Link>
                <Link to="/podcast" className="transition-colors hover:text-white">Radio</Link>
                <Link to="/#artists" className="transition-colors hover:text-white">Artists</Link>
                <Link to="/#events" className="transition-colors hover:text-white">Events</Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-display text-[11px] uppercase tracking-[0.18em] text-acid">Socials</div>
              <SocialLinks />
            </div>

            <div className="space-y-4">
              <div className="font-display text-[11px] uppercase tracking-[0.18em] text-acid">Booking</div>
              <a
                href="mailto:info@techmyhouse.it"
                className="font-mono text-[11px] uppercase tracking-[0.26em] text-white transition-colors hover:text-acid"
              >
                info@techmyhouse.it
              </a>
            </div>

            <div className="space-y-4">
              <div className="font-display text-[11px] uppercase tracking-[0.18em] text-acid">Legal</div>
              <div className="flex flex-col gap-3 font-mono text-[11px] uppercase tracking-[0.26em] text-smoke">
                <span>Privacy</span>
                <span>Cookies</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[6px] w-full bg-acid" />
        <div className="bg-ink">
          <div className="container-shell pt-6 pb-[calc(1.5rem+112px+env(safe-area-inset-bottom))] font-mono text-[11px] uppercase tracking-[0.26em] text-smoke">
            <span>made in friuli by </span>
            <a
              href="https://www.gaicirclela.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/85 transition-colors hover:text-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
            >
              gaia Circle Lab
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
