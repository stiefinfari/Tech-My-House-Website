import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';
import TMHLogoLiquid from './TMHLogoLiquid';
import PillButton from './ui/PillButton';

interface NavLink {
  label: string;
  href: string;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
}

export default function MobileDrawer({ isOpen, onClose, links }: MobileDrawerProps) {
  const shouldReduceMotion = useReducedMotionPreference();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const animationProps = shouldReduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { y: '-100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-100%', opacity: 0 },
        transition: { type: 'tween' as const, duration: 0.3, ease: 'easeInOut' as const },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...animationProps}
          className="fixed inset-0 z-[100] flex flex-col bg-ink pb-16 pt-10"
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink to-black" />
          </div>

          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <button
              onClick={onClose}
              className="p-3 text-white/70 transition-colors hover:text-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-acid focus-visible:outline-offset-4 rounded-sm"
              aria-label="Close menu"
            >
              <X size={36} />
            </button>
          </div>

          <div className="container-shell relative z-10 flex h-full flex-col mt-20">
            <div className="flex items-center justify-center">
              <TMHLogoLiquid size={120} className="h-[120px] w-[120px]" />
            </div>

            <nav className="mt-12 flex flex-col gap-7">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={onClose}
                  className="font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-white transition-colors hover:text-acid focus-visible:text-acid outline-none focus-visible:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-12">
              <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-smoke">
                Discover your underground mood
              </div>
              <div className="mt-6">
                <PillButton
                  to="/podcast"
                  variant="primary"
                  className="w-full justify-center py-4"
                  ariaLabel="Listen live"
                  onClick={onClose}
                >
                  LISTEN LIVE
                </PillButton>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
