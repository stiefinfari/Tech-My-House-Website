import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import { TMHLogoLiquid } from '../branding/logo';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';

const NAV_LINKS = [
  { label: 'Records', href: '/#records' },
  { label: 'Radio', href: '/podcast' },
  { label: 'Artists', href: '/#artists' },
  { label: 'Events', href: '/#events' },
  { label: 'Contact', href: '/#footer' },
];

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotionPreference();

  return (
    <>
      <header
        role="banner"
        className="fixed left-0 top-0 right-0 z-50 h-[60px] bg-ink/85 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:h-[72px]"
        style={
          shouldReduceMotion
            ? undefined
            : {
                animation: 'tmh-nav-enter 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
              }
        }
      >
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-acid" />
        <div className="container-shell grid h-full items-center gap-4 lg:grid-cols-[auto_1fr_auto] lg:gap-8">
          <div className="hidden lg:flex items-center gap-5">
            <Link
              to="/podcast"
              className="group inline-flex items-center gap-2 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              aria-label="Open podcast page"
            >
              <span className={`h-2 w-2 rounded-full bg-acid ${shouldReduceMotion ? '' : 'animate-pulse'}`} style={shouldReduceMotion ? undefined : { animationDuration: '2.4s' }} />
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-white">ON AIR</span>
            </Link>
            <span className="h-5 w-px bg-acid/30" aria-hidden="true" />
            <nav className="flex items-center gap-5">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === '/podcast'
                    ? location.pathname.startsWith('/podcast')
                    : link.href.startsWith('/#')
                      ? location.pathname === '/' && location.hash === link.href.replace('/#', '#')
                      : false;

                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`relative pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-white/75 transition-colors outline-none after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:origin-left after:bg-acid after:transition-transform after:duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid ${
                      active
                        ? 'text-white after:scale-x-100'
                        : 'hover:text-acid after:scale-x-0 hover:after:scale-x-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Link
            to="/"
            className="mx-auto flex items-center gap-3 text-white outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
            aria-label="Tech My House home"
          >
            <TMHLogoLiquid size={44} className="h-11 w-11" title="Tech My House" />
            <span className="hidden font-display text-[12px] uppercase tracking-[0.22em] text-white lg:block">
              TECH MY HOUSE
            </span>
          </Link>

          <div className="flex items-center justify-end gap-3">
            <a
              href="mailto:info@techmyhouse.it?subject=Send%20Your%20Demo"
              className="hidden items-center justify-center rounded-none border border-acid bg-acid px-[18px] py-[10px] font-display text-[11px] uppercase tracking-[0.16em] text-ink transition hover:border-acid-deep hover:bg-acid-deep hover:-translate-x-[1px] hover:-translate-y-[1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid lg:inline-flex"
            >
              SEND YOUR DEMO →
            </a>

            <button
              className="p-2 text-white/80 transition-colors hover:text-white outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid lg:hidden"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} links={NAV_LINKS} />
    </>
  );
}
