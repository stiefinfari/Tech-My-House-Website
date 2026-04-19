import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileDrawer from './MobileDrawer';
import TMHLogoLiquid from './TMHLogoLiquid';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';
import PillButton from './ui/PillButton';
import { cn } from '../lib/utils';

const NAV_LINKS = [
  { label: 'Records', href: '/#records' },
  { label: 'Radio', href: '/podcast' },
  { label: 'Artists', href: '/#artists' },
  { label: 'Contact', href: '/#footer' },
];

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotionPreference();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={shouldReduceMotion ? { y: 0, opacity: 1 } : { y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-[72px] bg-ink/85 backdrop-blur-md border-b pt-[env(safe-area-inset-top)]',
          isScrolled ? 'border-acid/50' : 'border-acid/25',
        )}
      >
        <div className="h-full px-4 sm:px-6 lg:px-8">
          <div className="grid h-full grid-cols-[auto_1fr_auto] items-center">
            <Link
              to="/"
              className="flex items-center gap-3 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              aria-label="Home"
            >
              <TMHLogoLiquid size={38} className="h-[38px] w-[38px] shrink-0" />
              <span className="hidden font-display text-[13px] font-extrabold uppercase tracking-[0.24em] text-white lg:block">
                TECH MY HOUSE
              </span>
            </Link>

            <nav className="hidden lg:flex justify-self-start ml-12 items-center gap-7">
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
                    className={cn(
                      'relative font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid',
                      'after:absolute after:left-0 after:-bottom-2 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-acid after:transition-transform after:duration-200',
                      'before:absolute before:-left-3 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-acid before:opacity-0 before:transition-opacity before:duration-200',
                      'hover:text-acid hover:after:scale-x-100 hover:before:opacity-80',
                      active ? 'text-white after:scale-x-100 before:opacity-80' : null,
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-end gap-3">
              <div className="hidden lg:flex items-center gap-3">
                <PillButton to="/#footer" variant="primary" ariaLabel="Contact">
                  CONTACT
                </PillButton>
              </div>

              <button
                className="lg:hidden p-2 text-white/80 transition-colors hover:text-white outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                onClick={() => setIsOpen(true)}
                aria-label="Open Menu"
              >
                <Menu size={28} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} links={NAV_LINKS} />
    </>
  );
}
