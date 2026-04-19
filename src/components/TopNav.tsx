import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import { TMH_LOGO_OBJECT_POSITION, TMH_LOGO_SRC } from '../branding/logo';

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

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-ink/80 px-4 py-4 pt-[env(safe-area-inset-top)] backdrop-blur sm:px-6 lg:px-10">
        <div className="container-shell !px-0 grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <nav className="hidden lg:flex items-center gap-8">
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
                  className={`font-display text-[11px] uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid ${
                    active ? 'text-white underline decoration-acid decoration-2 underline-offset-[10px]' : ''
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/"
            className="mx-auto flex items-center gap-3 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
            aria-label="Home"
          >
            <span className="relative h-9 w-9 shrink-0">
              <img
                src={TMH_LOGO_SRC}
                alt=""
                aria-hidden="true"
                width={36}
                height={36}
                className="h-full w-full object-contain"
                style={{ objectPosition: TMH_LOGO_OBJECT_POSITION, transformOrigin: '50% 50%' }}
              />
            </span>
            <span className="hidden font-display text-[11px] uppercase tracking-[0.22em] text-white sm:block">
              Tech My House
            </span>
          </Link>

          <div className="flex items-center justify-end gap-3">
            <a
              href="mailto:info@techmyhouse.it?subject=Send%20Your%20Demo"
              className="hidden sm:inline-flex items-center justify-center gap-2 rounded-none border border-acid bg-acid px-5 py-2 font-display text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:bg-acid-deep hover:border-acid-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
            >
              Send Your Demo
            </a>

            <button
              className="lg:hidden p-2 text-white/80 transition-colors hover:text-white outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              onClick={() => setIsOpen(true)}
              aria-label="Open Menu"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} links={NAV_LINKS} />
    </>
  );
}
