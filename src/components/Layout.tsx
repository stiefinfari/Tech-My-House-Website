import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import SocialLinks from './SocialLinks';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    updateViewport();

    const handlePointerMove = (e: PointerEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('resize', updateViewport);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

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
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  const navItems = [
    { name: 'Artists', hash: '#artists' },
    { name: 'Records', hash: '#records' },
    { name: 'Radio', to: '/podcast' },
  ];

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
      {/* Immersive Backgrounds */}
      <div className="noise-bg pointer-events-none"></div>

      {/* Ambient Glow tied to mouse */}
      <div 
        className="fixed w-[600px] h-[600px] rounded-full bg-neon/5 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0 transition-opacity duration-1000 ease-out"
        style={{ left: mousePosition.x, top: mousePosition.y }}
      ></div>
      
      <div 
        className="fixed w-[400px] h-[400px] rounded-full bg-cyber/5 blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0 mix-blend-screen"
        style={{ left: viewport.w - mousePosition.x, top: viewport.h - mousePosition.y }}
      ></div>

      {/* Floating Redesigned Nav */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="pt-4 px-4 md:px-10">
          <div
            className={`mx-auto max-w-7xl flex items-center justify-between gap-4 rounded-2xl border px-4 md:px-6 py-3 transition-all duration-500 ${
              scrolled ? 'glass-panel bg-dark/70 border-white/10' : 'bg-transparent border-white/0'
            }`}
          >
            <Link
              to="/"
              data-glow
              className="group h-11 inline-flex items-center rounded-full px-3 font-display font-black text-xl tracking-tighter uppercase text-white/90 hover:text-white transition-colors"
            >
              <span className="relative inline-block overflow-hidden">
                <span className="block group-hover:-translate-y-full transition-transform duration-300">T.M.H.</span>
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
                    className="relative h-11 px-6 rounded-full font-sans text-xs tracking-[0.22em] uppercase font-bold text-white/70 hover:text-white transition-colors overflow-hidden"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white/10 rounded-full z-0"
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 glitch-hover block">{item.name}</span>
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
                className="mx-4 mt-[88px] rounded-3xl border border-white/10 bg-dark/80 backdrop-blur-xl overflow-hidden"
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
                        className="h-14 px-4 rounded-2xl flex items-center justify-between text-left font-display font-black uppercase tracking-tight text-2xl text-white/90 hover:text-white transition-colors"
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

      <main className="relative z-10">
        {children}
      </main>

      <footer className="py-24 px-6 md:px-12 border-t border-white/5 relative z-20 overflow-hidden bg-dark">
        {/* Subtle background glow for footer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-neon/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="w-full md:w-auto">
            <div className="flex items-center justify-between gap-8">
              <h2 className="font-display text-[clamp(2rem,4.8vw,4.5rem)] font-black uppercase tracking-[-0.08em] leading-none flex items-baseline gap-3 whitespace-nowrap">
                <span>Tech</span>
                <span>My</span>
                <span className="text-outline hover:text-outline-neon transition-all duration-500">House</span>
              </h2>
            </div>

            <div className="mt-8">
              <SocialLinks variant="default" />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-12 md:gap-24 font-sans text-sm uppercase tracking-widest relative z-10">
            <div className="flex flex-col gap-4">
              <span className="text-neon font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon animate-pulse"></span>
                Booking & Demo
              </span>
              <a href="mailto:info@techmyhouse.it" data-glow className="hover:text-neon transition-colors text-2xl lowercase font-bold relative group">
                info@techmyhouse.it
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-neon group-hover:w-full transition-all duration-500 ease-out"></span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center font-sans text-xs text-white/30 uppercase tracking-[0.2em] relative z-10">
          <p>© 2026 TECH MY HOUSE. WHERE MUSIC UNITES.</p>
          <p className="mt-4 md:mt-0 flex gap-4">
            <span className="hover:text-neon transition-colors cursor-pointer">HOUSE</span>
            <span className="text-white/10">•</span>
            <span className="hover:text-neon transition-colors cursor-pointer">TECH HOUSE</span>
            <span className="text-white/10">•</span>
            <span className="hover:text-cyber transition-colors cursor-pointer">TECHNO</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
