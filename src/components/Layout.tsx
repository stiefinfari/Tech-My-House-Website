import React from 'react';
import { Link } from 'react-router-dom';
import ContactForm from './ContactForm';
import SocialLinks from './SocialLinks';
import TopNav from './TopNav';
import TMHLogoLiquid from './TMHLogoLiquid';
import PillButton from './ui/PillButton';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-ink font-sans text-white selection:bg-acid selection:text-ink">
      <div className="warehouse-backdrop" />

      <TopNav />

      <main className="relative z-10 pt-[100px]" id="main">
        {children}
      </main>

      <footer id="footer" className="relative z-20 border-t border-acid/25 bg-black/35 pt-16 sm:pt-20">
        <div className="container-shell pb-10">
          <div className="grid gap-12 border border-white/10 bg-ink/70 p-8 sm:p-10 lg:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <TMHLogoLiquid size={46} className="h-[46px] w-[46px] shrink-0" />
                <div className="font-display text-[13px] font-extrabold uppercase tracking-[0.24em] text-white">TECH MY HOUSE</div>
              </div>
              <h2 className="accent-script mt-6 text-[clamp(3rem,7.5vw,6rem)] text-white">
                WHERE MUSIC
                <br />
                UNITES
              </h2>
              <p className="mt-4 max-w-md text-sm text-white/70">
                Underground house, tech house and techno culture from Friuli, Italy.
              </p>
              <ContactForm />
            </div>

            <div className="space-y-5">
              <div className="font-display text-[11px] uppercase tracking-[0.18em] text-acid">Navigate</div>
              <div className="flex flex-col gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-smoke">
                <Link to="/#records" className="transition-colors hover:text-white">Records</Link>
                <Link to="/podcast" className="transition-colors hover:text-white">Radio</Link>
                <Link to="/#artists" className="transition-colors hover:text-white">Artists</Link>
                <Link to="/#footer" className="transition-colors hover:text-white">Contact</Link>
              </div>
              <PillButton href="mailto:info@techmyhouse.it" variant="ghost" ariaLabel="Contact via email">
                CONTACT ↗
              </PillButton>
            </div>

            <div className="space-y-5">
              <div className="font-display text-[11px] uppercase tracking-[0.18em] text-acid">Social</div>
              <SocialLinks />
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-smoke">
                <div>Privacy</div>
                <div className="mt-2">Cookies</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-ink">
          <div className="container-shell py-6 pb-[calc(1.5rem+112px+env(safe-area-inset-bottom))] font-mono text-[11px] uppercase tracking-[0.24em] text-smoke">
            <span>MADE WITH ♥ BY </span>
            <a
              href="https://www.gaicirclela.com"
              target="_blank"
              rel="noopener noreferrer external"
              className="inline-flex items-center gap-2 text-white/85 transition-colors hover:text-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              aria-label="Gaia Circle Lab (apre in una nuova scheda)"
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
