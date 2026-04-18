import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';

interface NavLink {
  label: string;
  href: string;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export default function MobileDrawer({ isOpen, onClose, links, onLinkClick }: MobileDrawerProps) {
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
          className="fixed inset-0 z-[100] flex flex-col bg-ink pb-20 pt-10"
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <button
              onClick={onClose}
              className="p-3 text-white/70 transition-colors hover:text-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-acid focus-visible:outline-offset-4 rounded-sm"
              aria-label="Close menu"
            >
              <X size={36} />
            </button>
          </div>

          <div className="container-shell flex flex-col h-full mt-24 space-y-12">
            <nav className="flex flex-col gap-6">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={(e) => {
                    onLinkClick(e, link.href);
                    onClose();
                  }}
                  className="font-display text-5xl sm:text-7xl font-extrabold uppercase tracking-tight text-white transition-colors hover:text-acid focus-visible:text-acid outline-none focus-visible:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto">
              <p className="accent-script text-2xl uppercase tracking-[0.12em] text-acid">
                Where music unites
              </p>
              <a
                href="https://techmyhouse.it/listen"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-none border border-acid bg-acid px-6 py-4 text-sm font-bold uppercase tracking-widest text-ink transition-all hover:bg-acid-deep hover:border-acid-deep w-full sm:w-auto"
              >
                Listen Live
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}