import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import SocialLinks from './SocialLinks';
import { TMH_LOGO_OBJECT_POSITION, TMH_LOGO_SRC } from '../branding/logo';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [scrollYValue, setScrollYValue] = useState(0);
  const [heroInView, setHeroInView] = useState(() => location.pathname === '/');

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setScrollYValue(latest);
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setHeroInView(false);
      return;
    }

    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    const attach = () => {
      if (cancelled) return;
      const el = document.getElementById('hero');
      if (!el) {
        setHeroInView(true);
        requestAnimationFrame(attach);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          setHeroInView(entries[0]?.isIntersecting ?? false);
        },
        { threshold: 0.6 }
      );

      observer.observe(el);
    };

    attach();
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [location.pathname]);

  const navItems = [
    { name: 'Artists', hash: '#artists' },
    { name: 'Records', hash: '#records' },
    { name: 'Radio', to: '/podcast' },
  ];

  const compactBrand = useMemo(() => {
    if (heroInView) return false;
    const threshold = typeof window !== 'undefined' ? window.innerHeight * 1.2 : 800;
    return scrollYValue > threshold;
  }, [heroInView, scrollYValue]);

  const activeKey = useMemo(() => {
    if (location.pathname === '/podcast') return 'Radio';
    if (location.hash === '#artists') return 'Artists';
    if (location.hash === '#records') return 'Records';
    if (location.hash === '#podcast') return 'Radio';
    return '';
  }, [location.hash, location.pathname]);

  const handleNav = (item: { name: string; hash?: string; to?: string }) => {
    setMobileOpen(false);

    if (item.to) {
      navigate(item.to);
      return;
    }

    if (!item.hash) return;

    if (location.pathname === '/') {
      const id = item.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', `/${item.hash}`);
        return;
      }
    }

    navigate(`/${item.hash}`);
  };

  return (
    <div className="relative w-full min-h-screen bg-dark text-white font-sans overflow-x-hidden selection:bg-neon selection:text-black">
      <div className="noise-bg pointer-events-none" />
      <div className="pointer-events-none fixed -left-24 top-24 h-64 w-64 rounded-full bg-neon/10 blur-[120px]" />
      <div className="pointer-events-none fixed -right-16 bottom-16 h-72 w-72 rounded-full bg-neon/5 blur-[140px]" />

      <motion.nav
        initial={{ y: -18, opacity: 0 }}
        animate={heroInView ? { y: -18, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 ${heroInView ? 'pointer-events-none' : ''}`}
      >
        <div className="px-4 pt-4 sm:px-6 lg:px-10">
          <div
            className={`mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-all duration-500 md:px-6 ${
              scrolled ? 'glass-panel bg-dark/70 border-white/10' : 'bg-dark/20 backdrop-blur-sm border-white/10'
            }`}
          >
            <Link
              to="/"
              data-glow
              className="group inline-flex h-11 items-center gap-3 rounded-full pr-3 text-white/90 transition-colors hover:text-white"
            >
              <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] transition-[transform,border-color,background-color] duration-200 group-hover:-translate-y-0.5 group-hover:border-neon/30 group-hover:bg-white/[0.04]">
                {compactBrand ? (
                  <span className="font-display text-[11px] font-extrabold uppercase tracking-[-0.06em] text-white">TMH</span>
                ) : (
                  <img
                    src={TMH_LOGO_SRC}
                    alt="Tech My House"
                    className="h-8 w-8 object-cover"
                    style={{ objectPosition: TMH_LOGO_OBJECT_POSITION }}
                  />
                )}
              </span>
              <span className="hidden sm:block font-display text-lg font-extrabold uppercase tracking-[-0.06em] whitespace-nowrap">
                {compactBrand ? 'TMH' : 'Tech My House'}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = activeKey === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    data-glow
                    onClick={() => handleNav(item)}
                    className="relative h-11 overflow-hidden rounded-full px-6 font-sans text-xs font-bold uppercase tracking-[0.22em] text-white/70 transition-colors hover:text-white"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 z-0 rounded-full bg-white/10"
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 block">{item.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              data-glow
              className="md:hidden h-11 w-11 rounded-full border border-white/15 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 inline-flex items-center justify-center"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-50 bg-dark/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="mx-4 mt-[88px] overflow-hidden rounded-3xl border border-white/10 bg-dark/85 backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  <div className="flex flex-col">
                    {navItems.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        data-glow
                        onClick={() => handleNav(item)}
                        className="flex h-14 items-center justify-between rounded-2xl px-4 text-left font-display text-2xl font-extrabold uppercase tracking-tight text-white/90 transition-colors hover:text-white"
                      >
                        <span>{item.name}</span>
                        <span className="text-neon/70">↗</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <SocialLinks variant="compact" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-20 overflow-hidden border-t border-white/10 bg-dark py-16 sm:py-20">
        <div className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-neon/20 to-transparent" />
        <div className="container-shell flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-6">
            <h2 className="font-display text-[clamp(2rem,6vw,4.8rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.08em]">
              Tech My House
            </h2>
            <p className="accent-script animate-glow-pulse text-lg uppercase tracking-[0.12em] text-neon text-glow">
              Where music unites
            </p>
            <div>
              <SocialLinks variant="default" />
            </div>
          </div>
          <div className="flex flex-col gap-5 text-sm uppercase tracking-[0.2em] text-white/70">
            <span className="text-xs text-neon">Booking & Demo</span>
            <a href="mailto:info@techmyhouse.it" data-glow className="w-fit text-base lowercase tracking-normal text-white transition-colors hover:text-neon sm:text-xl">
              info@techmyhouse.it
            </a>
          </div>
        </div>
        <div className="container-shell mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.2em] text-white/35 sm:flex-row sm:items-center">
          <p>© 2026 TECH MY HOUSE</p>
          <p>HOUSE • TECH HOUSE • TECHNO</p>
        </div>
      </footer>
    </div>
  );
}
