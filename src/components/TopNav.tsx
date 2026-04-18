import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { TMH_LOGO_SRC, TMH_LOGO_OBJECT_POSITION } from '../branding/logo';
import MobileDrawer from './MobileDrawer';

const NAV_LINKS = [
  { label: 'Records', href: '/#records' },
  { label: 'Radio', href: '/podcast' },
  { label: 'Artists', href: '/#artists' },
  { label: 'Events', href: '/#events' },
  { label: 'Contact', href: '#footer' },
];

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Scroll to section if hash is present
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const id = href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 pt-[env(safe-area-inset-top)] px-4 sm:px-6 lg:px-10 py-4 glass-panel border-b border-white/5">
        <div className="container-shell !px-0 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-4 focus-visible:ring-offset-dark rounded-sm"
            aria-label="Home"
          >
            <img
              src={TMH_LOGO_SRC}
              alt="Tech My House"
              className="h-8 w-8 object-contain opacity-90 transition-transform group-hover:scale-105"
              style={{ objectPosition: TMH_LOGO_OBJECT_POSITION }}
            />
            <span className="font-display text-sm font-extrabold uppercase tracking-[0.15em] hidden sm:block">
              Tech My House
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-sans uppercase tracking-[0.1em] text-white/70 hover:text-acid transition-colors outline-none focus-visible:text-acid focus-visible:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="https://techmyhouse.it/listen"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center gap-2 rounded-none border border-acid bg-acid px-5 py-2 text-xs font-bold uppercase tracking-wider text-ink transition-all hover:bg-acid-deep hover:border-acid-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
            >
              Listen Live
            </a>

            <button
              className="lg:hidden p-2 text-white/80 hover:text-acid transition-colors outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-4 focus-visible:ring-offset-dark rounded-sm"
              onClick={() => setIsOpen(true)}
              aria-label="Open Menu"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} links={NAV_LINKS} onLinkClick={handleNavClick} />
    </>
  );
}
