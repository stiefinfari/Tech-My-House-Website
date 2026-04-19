import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileDrawer from './MobileDrawer';
import TMHLogoLiquid from './TMHLogoLiquid';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';
import { cn } from '../lib/utils';

const NAV_LINKS = [
  { label: 'Records', href: '/#records' },
  { label: 'Radio', href: '/podcast' },
  { label: 'Artists', href: '/#artists' },
  { label: 'Contact', href: '/contact' },
];

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotionPreference();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const check = () => setIsPlayerExpanded(document.body.dataset.playerExpanded === 'true');
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-player-expanded'] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <motion.header
        initial={shouldReduceMotion ? { y: 0, opacity: 1 } : { y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
        className={`fixed left-0 right-0 top-4 z-50 px-4 pt-[env(safe-area-inset-top)] ${isPlayerExpanded ? 'hidden' : ''}`}
      >
        <motion.div
          className="mx-auto flex items-center justify-between rounded-full border border-acid/40 bg-ink/70 backdrop-blur-xl px-3 pl-4 pr-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          style={{ width: '100%' }}
          animate={{
            height: isScrolled ? 48 : 56,
            maxWidth: isScrolled ? 896 : 1024,
          }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' }}
        >
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-3 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              aria-label="Home"
            >
              <TMHLogoLiquid size={28} className="h-7 w-7 shrink-0" />
              <span className="font-display text-[14px] font-extrabold uppercase tracking-[0.18em] text-white">
                TMH
              </span>
            </Link>
            <span className="mx-3 hidden h-4 w-px bg-white/15 lg:block" aria-hidden="true" />
          </div>

          <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === '/podcast'
                    ? location.pathname.startsWith('/podcast')
                    : link.href.startsWith('/#')
                      ? location.pathname === '/' && location.hash === link.href.replace('/#', '#')
                      : link.href === '/contact'
                        ? location.pathname.startsWith('/contact')
                        : false;

                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={cn(
                      'px-3 py-1.5 rounded-full font-display text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 hover:text-ink hover:bg-acid transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid',
                      active ? 'bg-acid/15 text-acid' : null,
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

          <button
            className="lg:hidden p-2 text-white/80 transition-colors hover:text-white outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
            onClick={() => setIsOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={28} />
          </button>
        </motion.div>
      </motion.header>

      <MobileDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} links={NAV_LINKS} />
    </>
  );
}
